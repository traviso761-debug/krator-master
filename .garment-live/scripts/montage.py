import os, sys
from PIL import Image
os.chdir(os.path.dirname(os.path.abspath(__file__)))
out, names = sys.argv[1], sys.argv[2:]
ims = [Image.open(n).convert('RGB') for n in names]
W = ims[0].width
H = 350      # a sheet's top row of six
s = Image.new('RGB', (W, H * len(ims)), 'white')
for i, im in enumerate(ims):
    s.paste(im.crop((0, 0, W, H)), (0, i * H))
s.save(out)
