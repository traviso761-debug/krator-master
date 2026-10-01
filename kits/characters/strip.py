#!/usr/bin/env python3
"""Compose shots/walk-NN.png into shots/walk-strip.png (8 frames) and shots/walk.gif (all)."""
from PIL import Image
import glob, os
HERE = os.path.dirname(os.path.abspath(__file__))
fr = [Image.open(f) for f in sorted(glob.glob(os.path.join(HERE, 'shots', 'walk-[0-9]*.png')))]
box = (200, 120, 700, 980)
w, h = box[2] - box[0], box[3] - box[1]
small = [f.crop(box).resize((w // 2, h // 2)) for f in fr]
strip = Image.new('RGB', (w // 2 * 8, h // 2), (233, 228, 220))
for i, t in enumerate(small[::2]): strip.paste(t, (i * w // 2, 0))
strip.save(os.path.join(HERE, 'shots', 'walk-strip.png'))
small[0].save(os.path.join(HERE, 'shots', 'walk.gif'), save_all=True, append_images=small[1:], duration=60, loop=0)
print(strip.size, len(small))
