"""Build application icons from the existing Nicole character asset (Pillow)."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
src=Image.open(root/'assets/pet/idle.png').convert('RGBA')
src=src.crop(src.getbbox())
src.thumbnail((820,940),Image.Resampling.LANCZOS)
# Use a large transparent canvas for platform icon formats.
scale=min(820/src.width,940/src.height)
src=src.resize((round(src.width*scale),round(src.height*scale)),Image.Resampling.LANCZOS)
icon=Image.new('RGBA',(1024,1024))
icon.alpha_composite(src,((1024-src.width)//2,(1024-src.height)//2))
icon.save(root/'assets/icon.png')
icon.save(root/'assets/icon.icns')
icon.save(root/'assets/icon.ico',sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
