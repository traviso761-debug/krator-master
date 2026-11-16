#!/usr/bin/env python3
"""Scale model 5.1, edit 7 paint polish (2026-11-16): the painted maps round Erewhon's lake and Qiblai's basin.

    python tools/scale-model/edit_517_paint.py     # after edit_517.py and edit_517_crease.py; edits st, t, rt, ct; once

The owner, 2026-11-16: "you can still see the outline of the old lake" (the Vale: the old lake's bed, dry since edit 7,
kept its water colours in the paint), "there is also linear artifact around the lower basin, you can see a rectangular
outline" (Qiblai's basin, an old stamp's box) and "around Xanadu" (edit 7's own box shows the same way).

- The Vale: every cell that was water before edit 7 (h.png's water flag at 055bc43ce) and is dry land now is painted
  again from the dry land round it (smodel.paint.inpaint, land only), with the relief shading put back (the local shade
  over its 25-px mean, in the light each layer was relit with in edit 7).
- The seams: each straight box edge (SEAMS) is found within 4 px of where it is listed, in each map (the row or column
  with the largest thin-line contrast plus step) and blurred across itself only (2.5 px), the blur weighted to fade
  within ~6 px of the line: one pass, no rows rewritten, the texture along the line kept.
Writes edit_517_paint.report.json.
"""
import os, sys, json, base64, subprocess
import numpy as np
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA   # noqa: E402

PRE = '055bc43ce'                       # the model before edit 7
BOX7 = (758, 918, 1464, 1556)           # x0, x1, y0, y1: edit 7's box
LIGHT = {'st': (315, 10), 't': (315, 10), 'rt': (315, 10), 'ct': (300, 3)}   # az, zf as edit 7 relit them
# (direction, nominal line, from, to): 'h' a row at y over x from..to, 'v' a column at x over y from..to
SEAMS = [('h', 1464, 755, 921), ('h', 1556, 755, 921), ('v', 758, 1461, 1559), ('v', 918, 1461, 1559),
         ('h', 1575, 900, 1007), ('h', 1640, 900, 1007), ('v', 906, 1569, 1645), ('v', 1001, 1569, 1645),
         ('v', 996, 1573, 1618)]
SEARCH, BAND = 4, 6


def lam(E, zf, az, alt=45):
    gy, gx = np.gradient(E / 1000 * zf, 2.0)
    a, l = np.radians(az), np.radians(alt)
    lx, ly, lz = np.cos(l) * np.sin(a), -np.cos(l) * np.cos(a), np.sin(l)
    return (-gx * lx - gy * ly + lz) / np.sqrt(gx * gx + gy * gy + 1)


def find_line(g, d, at, lo, hi):
    G = g if d == 'h' else g.T
    best = None
    for e in range(at - SEARCH, at + SEARCH + 1):
        line = np.median(np.abs(G[e, lo:hi] - 0.5 * (G[e - 2, lo:hi] + G[e + 2, lo:hi])))
        step = np.median(np.abs(G[e + 1:e + 4, lo:hi].mean(0) - G[e - 3:e, lo:hi].mean(0)))
        if best is None or line + step > best[0]:
            best = (line + step, e, line, step)
    return best[1], round(float(best[2]), 1), round(float(best[3]), 1)


def main():
    D = P.load()
    E, W = P.heights(D)
    D0 = {k: D[k] for k in ('lo', 'hi')}     # the water flag is h.png's blue channel
    D0['h'] = base64.b64encode(subprocess.run(['git', '-C', HERE, 'show', PRE + ':tools/scale-model/model/data/h.png'],
                                              capture_output=True, check=True).stdout).decode()
    _, W0 = P.heights(D0)
    x0, x1, y0, y1 = BOX7
    inbox = np.zeros(E.shape, bool); inbox[y0:y1, x0:x1] = True
    vale = nd.binary_dilation((W0 > 0) & (W == 0) & inbox, iterations=1) & (W == 0)
    rep = {'edit': '5.1 edit 7 paint polish', 'date': '2026-11-16', 'vale_cells': int(vale.sum()), 'seams': {}}
    for key, (az, zf) in LIGHT.items():
        a = P.raster(D, key).astype(float)
        assert a.shape[:2] == E.shape, key
        sh = lam(E, zf, az)
        rel = np.clip(sh / (nd.uniform_filter(sh, 25) + 1e-6), 0.6, 1.5)
        # the Vale, painted again from the land round it, its relief put back
        filled = PA.inpaint(a.astype(np.uint8), vale, src=~vale & ~W).astype(float)
        a[vale] = np.clip(filled[vale] * rel[vale, None], 0, 255)
        # the seams: across each line only, a 2.5-px blur, weighted to fade within ~6 px of it (no rows rewritten,
        # so no new edges; the texture along the line kept)
        seams = []
        g = a.mean(-1)
        yy_, xx_ = np.mgrid[0:E.shape[0], 0:E.shape[1]]
        wsum = np.zeros(E.shape)
        acc = np.zeros(a.shape)
        for d, at, lo, hi in SEAMS:
            e, line, step = find_line(g, d, at, lo, hi)
            across, along, ax = (yy_, xx_, 0) if d == 'h' else (xx_, yy_, 1)
            wd = np.exp(-((across - e) / 3.0) ** 2)
            wl = np.clip(np.minimum(along - lo, hi - along) / 3.0 + 1, 0, 1)
            w = wd * wl * ~W
            blur = nd.gaussian_filter1d(a, 2.5, axis=ax)
            acc += blur * w[..., None]
            wsum += w
            seams.append({'dir': d, 'nominal': at, 'at': int(e), 'line': line, 'step': step})
        k = np.clip(wsum, 0, 1)[..., None]
        a = np.where(wsum[..., None] > 0, a * (1 - k) + acc / np.maximum(wsum, 1e-9)[..., None] * k, a)
        rep['seams'][key] = seams
        D[key] = P.jpeg_like(D, key, np.clip(a, 0, 255).round())
    P.save(D)
    json.dump(rep, open(os.path.join(HERE, 'edit_517_paint.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
    print(json.dumps(rep, indent=1))


if __name__ == '__main__':
    main()
