"""Extract the six generated eating poses using the installed hatch-pet extractor.
Requires Pillow. Source art is preserved; no new visual poses are synthesized.
"""
import argparse
import importlib.util
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--extractor', type=Path, required=True)
    args = parser.parse_args()
    spec = importlib.util.spec_from_file_location('extract', args.extractor)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    src = Image.open(ROOT / 'assets/source/eating-strip.png').convert('RGBA')
    clean = module.remove_chroma_background(src, (0, 255, 0), 96)
    poses = []
    for i in range(6):
        slot = clean.crop((round(src.width*i/6),0,round(src.width*(i+1)/6),src.height))
        components = module.connected_components(slot)
        largest = max(components,key=lambda c:c['area'])
        kept = [c for c in components if c is largest or c['area'] > largest['area']*.005]
        poses.append(module.component_group_image(slot, kept, padding=4))
    width,height=max(p.width for p in poses),max(p.height for p in poses)
    frames=[]
    out=ROOT/'assets/pet/eating-frames';out.mkdir(parents=True,exist_ok=True)
    for i,pose in enumerate(poses):
        viewport=Image.new('RGBA',(width,height))
        viewport.alpha_composite(pose,((width-pose.width)//2,height-pose.height))
        frame=module.fit_viewport_to_cell(viewport)
        # Remove green spill along the original chroma boundary, keep cyan costume accents.
        pixels=[]
        for r,g,b,a in frame.getdata():
            if a==0 or (g>max(r,b)+45 and g>140): pixels.append((0,0,0,0))
            elif g>max(r,b)+12: pixels.append((r,max(r,b),b,a))
            else: pixels.append((r,g,b,a))
        frame.putdata(pixels);frame.save(out/f'{i:02}.png');frames.append(frame)
    atlas=Image.new('RGBA',(1152,208))
    for i,frame in enumerate(frames):atlas.alpha_composite(frame,(192*i,0))
    atlas.save(ROOT/'assets/pet/eating.webp',lossless=True)
    atlas.save(ROOT/'assets/source/eating-contact.png')
    gif_frames=[]
    for frame in frames:
        palette=frame.convert('RGB').quantize(colors=255)
        data=list(palette.getdata());alpha=list(frame.getchannel('A').getdata())
        palette.putdata([255 if alpha[i]<128 else p for i,p in enumerate(data)])
        colors=palette.getpalette()[:765];palette.putpalette(colors+[0]*(768-len(colors)))
        palette.info['transparency']=255;gif_frames.append(palette)
    gif_frames[0].save(ROOT/'assets/pet/eating.gif',save_all=True,append_images=gif_frames[1:],duration=260,loop=0,disposal=2,transparency=255,optimize=False)
    report={'frameCount':len(frames),'size':atlas.size,'durationsMs':[260]*6,'bboxes':[f.getbbox() for f in frames]}
    (ROOT/'assets/source/eating-validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))

if __name__=='__main__':main()
