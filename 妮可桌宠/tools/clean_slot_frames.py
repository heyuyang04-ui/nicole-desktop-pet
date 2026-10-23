#!/usr/bin/env python3
"""Extract slot-aligned frames while removing neighboring-slot fragments."""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path

from PIL import Image


def load_hatch_module(path: Path):
    spec = importlib.util.spec_from_file_location("hatch_extract", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load hatch-pet extractor: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def clean_state(module, strip_path: Path, output_dir: Path, frame_count: int) -> None:
    source = Image.open(strip_path).convert("RGBA")
    strip = module.remove_chroma_background(source, (0, 255, 0), 96.0)
    slot_width = strip.width / frame_count
    cleaned = []

    for index in range(frame_count):
        left = round(index * slot_width)
        right = round((index + 1) * slot_width)
        slot = strip.crop((left, 0, right, strip.height))
        components = module.connected_components(slot)
        if not components:
            raise RuntimeError(f"empty slot {index} in {strip_path}")

        largest = max(components, key=lambda component: component["area"])
        min_area = max(16, largest["area"] * 0.003)
        kept = [
            component
            for component in components
            if component is largest
            or (
                component["area"] >= min_area
                and slot.width * 0.08 <= component["center_x"] <= slot.width * 0.92
            )
        ]
        cleaned.append(module.component_group_image(slot, kept, padding=4))

    viewport_width = max(image.width for image in cleaned)
    viewport_height = max(image.height for image in cleaned)
    output_dir.mkdir(parents=True, exist_ok=True)

    for index, image in enumerate(cleaned):
        viewport = Image.new("RGBA", (viewport_width, viewport_height), (0, 0, 0, 0))
        x = (viewport_width - image.width) // 2
        y = viewport_height - image.height
        viewport.alpha_composite(image, (x, y))
        frame = module.fit_viewport_to_cell(viewport)
        frame.save(output_dir / f"{index:02d}.png", "PNG")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-dir", type=Path, required=True)
    parser.add_argument("--extractor", type=Path, required=True)
    args = parser.parse_args()

    module = load_hatch_module(args.extractor)
    for state, count in (("waiting", 6), ("running", 6)):
        clean_state(
            module,
            args.run_dir / "decoded" / f"{state}.png",
            args.run_dir / "frames" / state,
            count,
        )

    manifest_path = args.run_dir / "frames" / "frames-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for row in manifest["rows"]:
        if row["state"] in {"waiting", "running"}:
            row["method"] = "components"
            row["cleanup_method"] = "slot-scoped-components"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
