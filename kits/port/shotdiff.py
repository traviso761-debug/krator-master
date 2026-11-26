#!/usr/bin/env python3
"""Compare two screenshot directories.

    python shotdiff.py shots/base shots/r1

Prints, per matching filename, the fraction of pixels that differ by more than
a small tolerance and the mean absolute difference. Used to prove a refactor
did not change the render: a pure refactor should come back all-zero.

Software GL is deterministic enough for this on identical input, so treat any
non-zero row as a real change and go look at the two images.

THE UI OVERLAYS ARE MASKED OUT BY DEFAULT. The HUD in the bottom-right corner
prints the live draw-call, triangle and instance counters, so it changes
whenever you optimise anything — which makes every diff look like a regression
and buries the handful of pixels that actually matter. Pass --with-ui to
compare them too.
"""
import os, sys
import numpy as np
from PIL import Image

TOL = 4          # per-channel 0..255; below this is encoder/rounding noise
HUD = (740, 1010)        # y, x of the top-left of the bottom-right HUD block
TOPLEFT = (105, 620)     # h, w of the dropdown + caption + inspector block


def mask_ui(d):
    d = d.copy()
    d[HUD[0]:, HUD[1]:] = 0
    d[:TOPLEFT[0], :TOPLEFT[1]] = 0
    return d


def main(a, b, with_ui=False):
    na = {f for f in os.listdir(a) if f.endswith('.png')}
    nb = {f for f in os.listdir(b) if f.endswith('.png')}
    only_a, only_b = sorted(na - nb), sorted(nb - na)
    worst = 0
    for f in sorted(na & nb):
        ia = np.asarray(Image.open(os.path.join(a, f)).convert('RGB'), dtype=np.int16)
        ib = np.asarray(Image.open(os.path.join(b, f)).convert('RGB'), dtype=np.int16)
        if ia.shape != ib.shape:
            print('%-40s SIZE %s vs %s' % (f, ia.shape, ib.shape)); worst = 1 << 30; continue
        d = np.abs(ia - ib).max(axis=2)
        if not with_ui:
            d = mask_ui(d)
        m = d > TOL
        n = int(m.sum())
        worst = max(worst, n)
        line = '%-40s %7d px differ  max delta %3d' % (f, n, d.max())
        if n:
            ys, xs = np.nonzero(m)
            line += '   bbox x %d-%d y %d-%d' % (xs.min(), xs.max(), ys.min(), ys.max())
        print(line)
    for f in only_a:
        print('%-40s only in %s' % (f, a))
    for f in only_b:
        print('%-40s only in %s' % (f, b))
    print('\nworst: %d pixels%s' % (worst, '' if with_ui else '   (UI overlays masked; --with-ui to include)'))
    return 0 if worst == 0 and not only_a and not only_b else 1


if __name__ == '__main__':
    args = [x for x in sys.argv[1:] if not x.startswith('--')]
    if len(args) != 2:
        sys.exit(__doc__)
    sys.exit(main(args[0], args[1], '--with-ui' in sys.argv))
