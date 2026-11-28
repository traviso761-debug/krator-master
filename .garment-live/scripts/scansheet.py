import glob, os, sys
from PIL import Image, ImageDraw
os.chdir(os.path.dirname(os.path.abspath(__file__)))
src, prefix, out = sys.argv[1], sys.argv[2], sys.argv[3]
fs = sorted(glob.glob(src + '/' + prefix + '*.png'))
W, H, C = 280, 440, 6
R = (len(fs) + C - 1) // C
s = Image.new('RGB', (W * C, H * R), 'white')
d = ImageDraw.Draw(s)
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGB')
    w, h = im.size
    s.paste(im.crop((w // 2 - W // 2 - 40, 30, w // 2 + W // 2 - 40, 30 + H)), ((i % C) * W, (i // C) * H))
    d.text(((i % C) * W + 4, (i // C) * H + 4), os.path.basename(f)[:-4], fill='white', stroke_width=2, stroke_fill='black')
s.save(out)
print(out, len(fs))
