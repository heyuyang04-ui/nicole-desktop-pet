"""Create previews from the shipped atlas and key the generated panel portrait.
Requires Pillow; does not generate new character art or change the native atlas.
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ROWS = [('idle', 6), ('running-right', 8), ('running-left', 8), ('waving', 4),
        ('jumping', 5), ('failed', 8), ('waiting', 6), ('running', 6), ('review', 6)]


def palette_frame(frame):
    converted = frame.convert('RGB').quantize(colors=255)
    alpha = list(frame.getchannel('A').getdata())
    converted.putdata([255 if alpha[i] < 128 else pixel for i, pixel in enumerate(converted.getdata())])
    colors = converted.getpalette()[:765]
    converted.putpalette(colors + [0] * (768 - len(colors)))
    return converted


def main():
    preview = ROOT / 'previews'
    preview.mkdir(exist_ok=True)
    atlas = Image.open(ROOT / 'output/nicole/spritesheet.webp').convert('RGBA')
    for row, (name, count) in enumerate(ROWS):
        frames = [palette_frame(atlas.crop((col*192, row*208, (col+1)*192, (row+1)*208))) for col in range(count)]
        frames[0].save(preview / f'{name}.gif', save_all=True, append_images=frames[1:],
                       duration=160, loop=0, disposal=2, transparency=255, optimize=False)
    portrait = Image.open(ROOT / 'assets/source/hungry-original.png').convert('RGBA')
    pixels = []
    for r, g, b, a in portrait.getdata():
        excess = g - max(r, b)
        if excess > 45 and g > 120:
            pixels.append((0, 0, 0, 0))
        elif excess > 10:
            pixels.append((r, max(r, b), b, a))
        else:
            pixels.append((r, g, b, a))
    portrait.putdata(pixels)
    portrait = portrait.crop(portrait.getbbox())
    portrait.thumbnail((480, 480), Image.Resampling.LANCZOS)
    result = Image.new('RGBA', (512, 512))
    result.alpha_composite(portrait, ((512-portrait.width)//2, (512-portrait.height)//2))
    folder = ROOT / 'assets/panel'
    folder.mkdir(parents=True, exist_ok=True)
    result.save(folder / 'hungry.png')
    print(json.dumps({'previews': len(ROWS), 'hungryPortrait': [512, 512], 'alphaBounds': result.getbbox()}))


if __name__ == '__main__':
    main()
