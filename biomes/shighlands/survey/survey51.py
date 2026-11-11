#!/usr/bin/env python3
"""The southern highlands on scale model 5.1 (Round 3, 68b6aa22b): the re-survey of the final rebuild's turn (pair 12).

    python3 biomes/shighlands/survey/survey51.py            prints the polygon's bands, station 1's site, and the candidate sites

Reads tools/scale-model/model/data/ (the 5.1 grids, 1821 x 1723, 2 km a pixel) and the `s highlands` polygon from
openworld/isle-demo/source/regions.json (old canvas: + (272, 330) for 5.1). Heights: lo + (R<<8|G)/65535*(hi-lo).
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
D = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
M = {k['key']: k.get('value', k.get('file')) for k in json.load(open(os.path.join(D, 'model.json'), encoding='utf-8'))['keys']}
lo, hi = M['lo'], M['hi']
img = lambda f: np.array(Image.open(os.path.join(D, f)))
h = img('h.png').astype(np.int64); E = lo + ((h[..., 0] << 8) | h[..., 1]) / 65535 * (hi - lo); WAT = h[..., 2] > 127
C = img('c.png'); P = img('p.png').astype(float) / 255 * 4000
T = {k: img(k + '.png').astype(float) - 90 for k in ('tm', 'tw', 'tc')}
codes = [c['code'] for c in json.load(open(os.path.join(D, 'climate.json'), encoding='utf-8'))['classes']]
SH = (272, 330)
regs = json.load(open(os.path.join(ROOT, 'openworld', 'isle-demo', 'source', 'regions.json'), encoding='utf-8'))
poly = [(x + SH[0], y + SH[1]) for x, y in next(r for r in regs if r['name'] == 's highlands')['points']]
H_, W_ = E.shape
m = Image.new('L', (W_, H_), 0); ImageDraw.Draw(m).polygon(poly, fill=1); MASK = np.array(m).astype(bool)
land = MASK & ~WAT
def at(px, py, old=True, r=0):
    x, y = (px + SH[0], py + SH[1]) if old else (px, py)
    sl = (slice(y - r, y + r + 1), slice(x - r, x + r + 1))
    e = E[sl]
    rel = float(E[y - 15:y + 16, x - 15:x + 16].max() - E[y - 15:y + 16, x - 15:x + 16].min())
    return dict(px51=(x, y), h=round(float(e.mean())), cls=codes[int(C[y, x])], rain=round(float(P[y, x])),
                tm=round(float(T['tm'][y, x]), 1), tw=round(float(T['tw'][y, x])), tc=round(float(T['tc'][y, x])), relief30km=round(rel), water=bool(WAT[y, x]),
                atm=round(1.6 * np.exp(-float(e.mean()) / 8000), 2))
if __name__ == '__main__':
    print('polygon: %d km2 of land; height p5/med/p95 %s' % (land.sum() * 4, np.percentile(E[land], [5, 50, 95]).round()))
    for b0, b1 in [(-3000, 2000), (2000, 3500), (3500, 5000), (5000, 9000), (9000, 30000)]:
        mm = land & (E >= b0) & (E < b1)
        if not mm.sum(): continue
        cl = {}
        for k in np.unique(C[mm]): cl[codes[k]] = round(100 * float((C[mm] == k).mean()))
        top = sorted(cl.items(), key=lambda t: -t[1])[:4]
        print('  %5d-%5d m: %6d km2, rain %4.0f mm, mean %+.0f (%+.0f/%+.0f), %s' % (b0, b1, mm.sum() * 4, np.median(P[mm]), np.median(T['tm'][mm]),
              np.median(T['tw'][mm]), np.median(T['tc'][mm]), top))
    print('station 1 (old px 486,697):', at(486, 697))
    # candidate sites: the median point of each band nearest the station-1 site, with the class the plan asks for
    def cand(b0, b1, want, n=5):
        ys, xs = np.nonzero(land & (E >= b0) & (E < b1) & np.isin(C, [codes.index(w) for w in want]))
        x0, y0 = 486 + SH[0], 697 + SH[1]
        d = np.hypot(xs - x0, ys - y0); o = np.argsort(d)
        out = []
        for i in o:
            x, y = int(xs[i]), int(ys[i])
            if any(abs(x - a) + abs(y - b) < 6 for a, b in [c['px51'] for c in out]): continue
            out.append(at(x, y, old=False)); 
            if len(out) >= n: break
        return out
    print('station 2 candidates (3.5-5 km, Dsc/Dfc):'); [print('  ', c) for c in cand(3700, 4600, ['Dsc', 'Dfc'])]
    print('station 3 candidates (5-7 km, ET):'); [print('  ', c) for c in cand(5200, 6800, ['ET', 'EF'])]
