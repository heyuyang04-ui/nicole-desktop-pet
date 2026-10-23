"""Upgrade Nicole's existing atlas to Codex's 11-row v2 layout.
The original nine generated animation rows are retained. Only gaze frames are
derived by compositing existing eye pixels inside an eye mask; no AI generation.
Requires Pillow; original sources remain under 妮可桌宠/.
"""
import json
import math
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]

def despill(image):
    pixels=[]
    for r,g,b,a in image.getdata():
        if a==0 or (g>max(r,b)+45 and g>140): pixels.append((0,0,0,0))
        elif g>max(r,b)+12: pixels.append((r,max(r,b),b,a))
        else: pixels.append((r,g,b,a))
    image.putdata(pixels)
    return image

def gaze(base, dx, dy):
    scale=4
    image=base.resize((192*scale,208*scale),Image.Resampling.LANCZOS)
    for x,y in [(83,68.5),(107.6,66.4)]:
        box=(round((x-5.2)*scale),round((y-4.1)*scale),round((x+5.2)*scale),round((y+4.1)*scale))
        eye=image.crop(box)
        mask=Image.new('L',eye.size);ImageDraw.Draw(mask).ellipse((0,0,eye.width-1,eye.height-1),fill=255)
        white=Image.new('RGBA',eye.size,(255,245,244,255))
        # Shift the original eye texture inside the fixed eyelid boundary.
        shifted=Image.new('RGBA',eye.size,(255,245,244,255))
        shifted.alpha_composite(eye,(round(dx*scale),round(dy*scale)))
        white.paste(shifted,(0,0),mask)
        image.paste(white,box[:2],mask)
    return image.resize((192,208),Image.Resampling.LANCZOS)

def main():
    original=Image.open(ROOT/'妮可桌宠/package/nicole/spritesheet.webp').convert('RGBA')
    assert original.size==(1536,1872)
    atlas=Image.new('RGBA',(1536,2288))
    cleaned=despill(original.copy());atlas.alpha_composite(cleaned)
    base=cleaned.crop((0,0,192,208))
    contact=Image.new('RGBA',(8*192,2*208))
    for i in range(16):
        angle=i*math.pi/8
        frame=gaze(base,math.sin(angle)*1.7,-math.cos(angle)*1.2)
        atlas.alpha_composite(frame,((i%8)*192,(9+i//8)*208))
        contact.alpha_composite(frame,((i%8)*192,(i//8)*208))
    # Normalize fully transparent pixels after resampling.
    atlas=despill(atlas)
    out=ROOT/'assets/codex';out.mkdir(parents=True,exist_ok=True)
    manifest={'id':'nicole','displayName':'妮可','description':'粉发猫耳动漫桌宠，支持鼠标视线跟随。','spriteVersionNumber':2,'spritesheetPath':'spritesheet.webp'}
    atlas.save(out/'spritesheet.webp',lossless=True)
    (out/'pet.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    contact.save(ROOT/'assets/source/gaze-contact.png')
    cleaned.save(ROOT/'assets/pet/spritesheet.webp',lossless=True)
    base.save(ROOT/'assets/pet/idle.png')
    counts=[6,8,8,4,5,8,6,6,6,8,8]
    for row,count in enumerate(counts):
        for col in range(8):
            cell=atlas.crop((col*192,row*208,(col+1)*192,(row+1)*208))
            assert bool(cell.getbbox())==(col<count),(row,col)
    report={'size':atlas.size,'spriteVersionNumber':2,'frameCounts':counts,'transparentUnusedCells':True,'gazeFrames':16,'source':'original generated v1 rows; derived eye-pixel gaze frames','nativeSwitchRegression':'awaiting user verification'}
    (out/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))

if __name__=='__main__':main()
