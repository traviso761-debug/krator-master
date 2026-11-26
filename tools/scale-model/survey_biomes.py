"""Survey biome polygons on the scale model: land, water, heights, rain, temperatures and climate classes, by class and by
height band, and the vents inside (the 2026-10-26 station survey; the 2026-10-23 pass did the same by hand).

    python3 tools/scale-model/survey_biomes.py <page.html> <regions dir> "<region name>" [...]

<page.html> is the scale model as saved (Artifact read); <regions dir> the `regions` collection as one JSON file per document
(ArtifactData list with out_dir). Heights are the half-resolution grid sampled at each full pixel (nearest); a pixel is
water where the water layer says so. Pressure is 1.6 atm x e^(-h/8 km).
"""
import sys, json, glob, os
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_region import load_page, raster  # noqa: E402
PAGE, RDIR = sys.argv[1], sys.argv[2]
NAMES = sys.argv[3:]
D = load_page(PAGE)
OW, OH, VW, VH, lo, hi = D['fullW'], D['fullH'], D['w'], D['hh'], D['lo'], D['hi']
h = raster(D, 'h')
E = lo + ((h[..., 0].astype(np.int32) << 8) | h[..., 1]) / 65535 * (hi - lo)
wl = raster(D, 'wl')
WH = wl[..., 2] > 127
jj = np.clip(np.round(np.arange(OH) * (VH - 1) / (OH - 1)).astype(int), 0, VH - 1)
ii = np.clip(np.round(np.arange(OW) * (VW - 1) / (OW - 1)).astype(int), 0, VW - 1)
EF = E[jj][:, ii]
WF = WH[jj][:, ii]
C = raster(D, 'c')[..., 0]
P = raster(D, 'p')[..., 0].astype(float) / 255 * 4000
T = {k: raster(D, k)[..., 0].astype(float) - 90 for k in ('tm', 'tw', 'tc')}
codes = [c['code'] for c in D['climate']['classes']]
regs = {}
for f in glob.glob(os.path.join(RDIR, '*.json')):
    d = json.load(open(f, encoding='utf8')); d['id'] = os.path.basename(f)[:-5]
    regs.setdefault(d['name'], []).append(d)


def mask(pts):
    im = Image.new('L', (OW, OH), 0)
    ImageDraw.Draw(im).polygon([tuple(p) for p in pts], fill=1)
    return np.array(im).astype(bool)


def med(a):
    return float(np.median(a)) if a.size else float('nan')


out = {}
for name in NAMES:
    r = [d for d in regs.get(name, [])]
    if not r:
        print('NO REGION', name); continue
    r = r[0]
    M = mask(r['points'])
    land = M & ~WF
    km = lambda m: int(m.sum()) * 4
    ys, xs = np.nonzero(M)
    print('\n=== %s (%s, %s)  polygon %d km2, land %d, water %d; bbox px %d,%d-%d,%d; centroid (%d,%d)' % (
        name, r['kind'], r['id'], km(M), km(land), km(M & WF), xs.min(), ys.min(), xs.max(), ys.max(), xs.mean(), ys.mean()))
    e = EF[land]
    print('  height p5/med/p95: %.0f / %.0f / %.0f m; rain p5/med/p95 %.0f / %.0f / %.0f mm; mean T med %.1f' % (
        *np.percentile(e, [5, 50, 95]), *np.percentile(P[land], [5, 50, 95]), med(T['tm'][land])))
    rows = []
    for k, code in enumerate(codes):
        m = land & (C == k)
        if m.sum() * 4 < 0.01 * km(land) or m.sum() < 25:
            continue
        cy, cx = np.nonzero(m)
        rows.append((km(m), code, med(EF[m]), med(P[m]), med(T['tm'][m]), med(T['tw'][m]), med(T['tc'][m]),
                     float(np.percentile(EF[m], 10)), float(np.percentile(EF[m], 90)), int(cx.mean()), int(cy.mean())))
    rows.sort(reverse=True)
    print('  %-5s %7s %5s %7s %6s %10s %13s %s' % ('class', 'km2', '%', 'height', 'rain', 'mean(w/c)', 'h p10-p90', 'centre px'))
    for a, code, he, ra, tm, tw, tc, h10, h90, cx, cy in rows:
        print('  %-5s %7d %5.1f %7.0f %6.0f %+5.0f(%+.0f/%+.0f) %6.0f-%-6.0f (%d,%d)' % (
            code, a, 100 * a / km(land), he, ra, tm, tw, tc, h10, h90, cx, cy))
    bands = [-3000, -1000, 0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 30000]
    print('  bands:')
    for b0, b1 in zip(bands, bands[1:]):
        m = land & (EF >= b0) & (EF < b1)
        if m.sum() * 4 < 0.02 * km(land):
            continue
        cl = np.bincount(C[m], minlength=len(codes))
        top = ', '.join('%s %d' % (codes[k], round(100 * cl[k] / m.sum())) for k in np.argsort(-cl)[:5] if cl[k] / m.sum() >= .04)
        print('   %6d..%-6d %7d km2  rain %5.0f  T %+5.1f  %s' % (b0, b1, km(m), med(P[m]), med(T['tm'][m]), top))
    vents = [v for v in D.get('vents', []) if 0 <= int(v['px'][1]) < OH and 0 <= int(v['px'][0]) < OW and M[int(v['px'][1]), int(v['px'][0])]]
    if vents:
        print('  vents:', [(round(v['px'][0]), round(v['px'][1]), round(v['floor']), codes[C[int(v['px'][1]), int(v['px'][0])]]) for v in vents])
