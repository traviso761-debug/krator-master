#!/usr/bin/env python3
"""Compose shots/<clip>-NN.png into shots/<clip>-strip.png (8 frames) and shots/<clip>.gif (all), for walk and mixamo."""
from PIL import Image
import glob, os
HERE = os.path.dirname(os.path.abspath(__file__))
for clip in ('walk', 'mixamo'):
  fr = [Image.open(f) for f in sorted(glob.glob(os.path.join(HERE, 'shots', clip + '-[0-9]*.png')))]
  box = (200, 120, 700, 980)
  w, h = box[2] - box[0], box[3] - box[1]
  small = [f.crop(box).resize((w // 2, h // 2)) for f in fr]
  strip = Image.new('RGB', (w // 2 * 8, h // 2), (233, 228, 220))
  for i, t in enumerate(small[::2]): strip.paste(t, (i * w // 2, 0))
  strip.save(os.path.join(HERE, 'shots', clip + '-strip.png'))
  small[0].save(os.path.join(HERE, 'shots', clip + '.gif'), save_all=True, append_images=small[1:], duration=60, loop=0)
  print(strip.size, len(small))
