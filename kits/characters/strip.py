#!/usr/bin/env python3
"""Compose shots/<key>-<clip>-NN.png into shots/<key>-<clip>-strip.png and a GIF, for every key and clip found."""
from PIL import Image
import glob, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
groups = {}
for f in sorted(glob.glob(os.path.join(HERE, 'shots', '*-[0-9][0-9].png'))):
    m = re.match(r'(.*)-\d\d\.png$', os.path.basename(f)); groups.setdefault(m.group(1), []).append(f)
for name, files in groups.items():
    fr = [Image.open(f) for f in files]
    w, h = fr[0].size; box = (int(w * 0.18), int(h * 0.08), int(w * 0.82), int(h * 0.92))
    small = [f.crop(box).resize(((box[2] - box[0]) // 2, (box[3] - box[1]) // 2)) for f in fr]
    tw, th = small[0].size
    strip = Image.new('RGB', (tw * len(small), th), (233, 228, 220))
    for i, t in enumerate(small): strip.paste(t, (i * tw, 0))
    strip.save(os.path.join(HERE, 'shots', name + '-strip.png'))
    small[0].save(os.path.join(HERE, 'shots', name + '.gif'), save_all=True, append_images=small[1:], duration=90, loop=0)
    print(name, strip.size, len(small))
