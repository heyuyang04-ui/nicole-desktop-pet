#!/usr/bin/env python3
"""Generate a referenced asset with the user-selected Volcano image API.

Read ARK_API_KEY from the environment; never store credentials in this repository.
Example: python3 scripts/generate-seedream.py --prompt assets/source/eating-prompt.md
         --output assets/source/eating-strip.png --reference path/to/reference.png
"""
import argparse
import base64
import json
import os
from pathlib import Path
import urllib.error
import urllib.request


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prompt", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--reference", type=Path, action="append", default=[])
    parser.add_argument("--model", default="doubao-seedream-5-0-flash-260915")
    args = parser.parse_args()
    key = os.environ.get("ARK_API_KEY")
    if not key:
        raise SystemExit("ARK_API_KEY is required in the environment.")
    if args.output.exists():
        raise SystemExit("Output already exists; choose a new filename.")
    images = []
    for path in args.reference:
        mime = "image/jpeg" if path.suffix.lower() in {".jpg", ".jpeg"} else "image/png"
        images.append(f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii"))
    payload = {
        "model": args.model,
        "prompt": args.prompt.read_text(encoding="utf-8"),
        "response_format": "b64_json",
        "output_format": "png",
        "size": "2K",
        "stream": False,
        "watermark": False,
    }
    if images:
        payload["image"] = images
    request = urllib.request.Request(
        "https://ark.cn-beijing.volces.com/api/v3/images/generations",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=240) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        # Do not print response bodies or request headers: they can contain sensitive data.
        raise SystemExit(f"Image API returned HTTP {error.code}.") from None
    except urllib.error.URLError:
        raise SystemExit("Image API network request failed.") from None
    encoded = result.get("data", [{}])[0].get("b64_json")
    if not encoded:
        raise SystemExit("Image API did not return image bytes.")
    data = base64.b64decode(encoded, validate=True)
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise SystemExit("Image API returned a non-PNG image; no file was saved.")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(data)
    print(json.dumps({"output": str(args.output), "bytes": len(data), "model": args.model}))


if __name__ == "__main__":
    main()
