#!/usr/bin/env python3
"""Scale model 4.21: the satellite map audited against 4.20.

    python3 tools/scale-model/sat_audit.py <4.21 page.html> <4.20 page.html> <out dir>

Reports (sat_audit.json, and printed): water paint on dry land (the satellite's blue-teal, blue over red by 35 and green
over red by 20, where no water lies within 2 px and no river is drawn), and how much of it is new since 4.20; the two
water flags (the height raster's and the water raster's) disagreeing; water lying over land paint (seen with the water
layer off); the colour steps along the edges of what changed, against the map's own. Writes a close-up of each edited
area: 4.20, now, now with the water, and the water paint on dry land (red; magenta where new).
"""
import sys, json, base64, io
import numpy as np
from scipy import ndimage as nd
from PIL import Image, ImageDraw
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edit_heights import load
import edit_rivers as ER
page, page0, outdir = sys.argv[1:4]
_, _, D = load(page); _, _, D0 = load(page0)
G = ER.grid_fields(D); G0 = ER.grid_fields(D0)
img = lambda d, k: np.array(Image.open(io.BytesIO(base64.b64decode(d[k]))).convert('RGB')).astype(float)
st, st0 = img(D, 'st'), img(D0, 'st')
OH, OW = st.shape[:2]
up = lambda a, o=0: nd.zoom(a.astype(float), (OH / a.shape[0], OW / a.shape[1]), order=o)[:OH, :OW] > .5
wet = up(G['whas']); wet0 = up(G0['whas'])
# river lines painted on the map (their courses, 2 px either side)
riv = Image.new('L', (OW, OH), 0); dr = ImageDraw.Draw(riv)
for r in D['rivers']:
    if r['kind'] == 'river':
        pts = [tuple(p) for p in (r.get('drawn_px') or r['px'])]
        if len(pts) > 1:
            dr.line(pts, fill=1, width=5)
for o in D.get('outlets', []):
    pts = [tuple(p) for p in o['px']]
    if len(pts) > 1:
        dr.line(pts, fill=1, width=5)
riv = np.array(riv).astype(bool)
wi = st[..., 2] - st[..., 0]
painted_water = (wi > 35) & (st[..., 1] > st[..., 0] + 20)
rep = {}
# A. water paint on dry land (not a river line, not within 2 px of water)
A = painted_water & ~nd.binary_dilation(wet, iterations=2) & ~riv
lab, n = nd.label(A, structure=np.ones((3, 3)))
sz = nd.sum(np.ones(A.shape), lab, range(1, n + 1))
big = [(int(s), [round(float(c[1])), round(float(c[0]))]) for s, c in
       zip(sz, nd.center_of_mass(A, lab, range(1, n + 1))) if s >= 40]
big.sort(reverse=True)
# compare with 4.20's own: was it already there?
A0 = (st0[..., 2] - st0[..., 0] > 35) & (st0[..., 1] > st0[..., 0] + 20) & ~nd.binary_dilation(wet0, iterations=2)
rep['water_paint_on_dry_land_px'] = int(A.sum()); rep['same_in_4.20_px'] = int(A0.sum())
rep['patches_40px_plus'] = big[:25]
new_dry_paint = A & ~A0
rep['new_since_4.20_px'] = int(new_dry_paint.sum())
# B. the two water flags (h's B channel, wl's)
hw = G['water']; ww = G['whas']
rep['flags'] = {'h_water_not_wl': int((hw & ~ww).sum()), 'wl_water_not_h': int((ww & ~hw).sum())}
# C. lakes over land paint (shows only with the water layer off)
C = wet & ~up(ER.setup(G)['sea']) & (wi < 0)
rep['water_over_land_paint_px'] = int(C.sum())
# D. seams: colour steps along the edges of what changed, against the map's own steps
chg = np.abs(st - st0).sum(-1) > 30
edge = nd.binary_dilation(chg, iterations=1) & ~nd.binary_erosion(chg, iterations=1)
gy, gx = np.gradient(nd.gaussian_filter(st.mean(-1), 0.7))
g = np.hypot(gx, gy)
rep['seams'] = {'changed_px': int(chg.sum()), 'edge_grad_p95': round(float(np.percentile(g[edge], 95)), 1),
                'map_grad_p95': round(float(np.percentile(g[~chg], 95)), 1),
                'edge_grad_p99': round(float(np.percentile(g[edge], 99)), 1), 'map_grad_p99': round(float(np.percentile(g[~chg], 99)), 1)}
json.dump(rep, open(outdir + '/sat_audit.json', 'w'), indent=1)
print(json.dumps({k: v for k, v in rep.items() if k != 'patches_40px_plus'}, indent=1)); print('patches', big[:12])
# E. close-ups: before, after, after with water, and the flags (red: water paint on dry land, new since 4.20 brighter)
AREAS = [('NW lowlands gorge', 0, 240, 230, 420), ('north dam lakes', 300, 680, 40, 280), ('western outlets', 100, 450, 540, 820),
         ("Iron Republic's lake", 230, 360, 400, 500), ('Hyperjungle lake', 620, 860, 540, 720),
         ('abyss north', 920, 1090, 280, 520), ('abyss south + Region 65', 920, 1090, 500, 760)]
for nm, x0, x1, y0, y1 in AREAS:
    a0 = st0[y0:y1, x0:x1]; a = st[y0:y1, x0:x1].copy(); b = a.copy()
    w = wet[y0:y1, x0:x1]; b[w] = b[w] * .3 + np.array([40, 90, 170]) * .7
    f = a.copy(); f[A[y0:y1, x0:x1]] = [255, 60, 60]; f[new_dry_paint[y0:y1, x0:x1]] = [255, 0, 255]
    sc = max(1, int(380 / max(x1 - x0, y1 - y0) * 1.0))
    tiles = [Image.fromarray(np.clip(t, 0, 255).astype(np.uint8)).resize(((x1 - x0) * sc, (y1 - y0) * sc)) for t in (a0, a, b, f)]
    sheet = Image.new('RGB', (sum(t.width for t in tiles) + 30, tiles[0].height + 18), 'white')
    x = 0
    for t, lbl in zip(tiles, ['4.20', 'now', 'now + water', 'water paint on land (magenta: new)']):
        sheet.paste(t, (x, 18)); ImageDraw.Draw(sheet).text((x + 2, 2), lbl, fill=(0, 0, 0)); x += t.width + 10
    sheet.save('%s/sat_%s.jpg' % (outdir, nm.replace(' ', '_').replace("'", '')), quality=85)
print('wrote', outdir)
lab2, n2 = nd.label(new_dry_paint, structure=np.ones((3, 3)))
s2 = nd.sum(np.ones(A.shape), lab2, range(1, n2 + 1)); c2 = nd.center_of_mass(new_dry_paint, lab2, range(1, n2 + 1))
print('new patches', sorted([(int(s), [round(c[1]), round(c[0])]) for s, c in zip(s2, c2) if s >= 15], reverse=True)[:20])
