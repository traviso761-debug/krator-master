#!/usr/bin/env python3
"""Reference views for a generator: python3 rig/prep_refs.py <key> <front> <left> <back> [--up]

Each input is a transparent PNG from Meshy's multi-view image step. Drops the slivers of the neighbouring view that come with a crop
(everything but the largest connected shape), then centres the animal on a square light grey ground, at one scale for all three views
so a generator reads their proportions as one body. Writes rig/sources/<key>/front.png, left.png, back.png. Needs numpy, scipy, Pillow.
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
SIZE, FILL, GREY = 1024, 0.86, (214, 214, 214)


def clean(path):
    im = Image.open(path).convert('RGBA')
    a = np.array(im)
    mask = a[..., 3] > 16
    lab, n = ndimage.label(mask, structure=np.ones((3, 3)))
    if n > 1:
        keep = 1 + int(np.argmax(ndimage.sum(mask, lab, range(1, n + 1))))
        a[..., 3] = np.where(lab == keep, a[..., 3], 0)
    ys, xs = np.where(a[..., 3] > 16)
    return Image.fromarray(a).crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))


def main():
    key, paths = sys.argv[1], sys.argv[2:5]
    d = os.path.join(HERE, 'sources', key)
    cuts = [clean(os.path.join(d, p)) for p in paths]
    k = SIZE * FILL / max(max(c.size) for c in cuts)      # one scale for every view
    for name, c in zip(('front', 'left', 'back'), cuts):
        s = c.resize((max(1, round(c.width * k)), max(1, round(c.height * k))), Image.LANCZOS)
        out = Image.new('RGB', (SIZE, SIZE), GREY)
        out.paste(s, ((SIZE - s.width) // 2, (SIZE - s.height) // 2), s)
        out.save(os.path.join(d, name + '.png'))
    print(key, [c.size for c in cuts], 'scale %.2f' % k)


if __name__ == '__main__':
    main()
