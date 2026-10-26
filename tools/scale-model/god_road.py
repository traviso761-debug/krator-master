#!/usr/bin/env python3
"""The god's road (the owner, 2026-10-26; biomes/outlands/PLAN.md): from the Sleeping City, through the Gate, to Trickster's House.

    python3 tools/scale-model/god_road.py <page.html> <settlements dir> <out dir> [gate_x gate_y]

Routes it on the Ancient profile `ancient_roads.py` uses (a 4 % ruling grade, tunnel where cheaper and over 8.2 km instead of its 9 km,
so the road crosses by the Gate and not by a higher crest, a causeway over water), in two legs forced through the Gate (default px 1136, 84: the lowest crest into the Outlands, 7.7 km, 0.60 atm), and writes
`gods-road.json` (the polyline in map px with the ground under it, the legs, the km, the tunnel and causeway km, the highest point)
and `gods-road.jpg` (the route over the heights). Deterministic.
"""
import sys, os, json, math, glob
import numpy as np

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ancient_roads.py')
if len(sys.argv) < 4:
    sys.exit(__doc__)
page, sdir, out = sys.argv[1:4]
GATE = (float(sys.argv[4]), float(sys.argv[5])) if len(sys.argv) >= 6 else (1136.0, 84.0)
head = open(SRC, encoding='utf-8').read()
head = head[:head.index('dist = dijkstra(GR, indices=src, directed=False)')]
CAP = 8200                    # m: the god's road keeps to the ground a traveller can cross (the Gate's crest is 7.7 km): above it, tunnel
assert head.count('9000') == 4
head = head.replace('9000', str(CAP))
sys.argv = [SRC, page, os.path.join(out, '_unused'), sdir, out]
sys.path.insert(0, os.path.dirname(SRC))
__file__ = SRC
exec(compile(head, SRC, 'exec'))
from scipy.sparse.csgraph import dijkstra     # noqa: E402

def cell_of(px, py):
    return int(round(py * sv)) * VW + int(round(px * su))

def leg(a, b):
    d_, pred = dijkstra(GR, indices=a, directed=False, return_predecessors=True)
    path = [b]
    while path[-1] != a:
        path.append(int(pred[path[-1]]))
    return path[::-1], float(d_[b])

names_i = {s['name']: s for s in S}
A = cell_of(names_i['Sleeping City']['px'], names_i['Sleeping City']['py'])
G = cell_of(*GATE)
Z = cell_of(names_i["Trickster's House"]['px'], names_i["Trickster's House"]['py'])
legs = []
for nm, (a, b) in (('Sleeping City to the Gate', (A, G)), ("the Gate to Trickster's House", (G, Z))):
    path, cost = leg(a, b)
    legs.append((nm, path, cost))
route = legs[0][1] + legs[1][1][1:]
segk = [step_kind(route[k], route[k + 1]) for k in range(len(route) - 1)]
def seglen(k):
    return CELL * math.hypot((route[k + 1] % VW) - (route[k] % VW), (route[k + 1] // VW) - (route[k] // VW))
L = sum(seglen(k) for k in range(len(route) - 1))
tun = sum(seglen(k) for k in range(len(route) - 1) if segk[k] == 1)
wat = sum(seglen(k) for k in range(len(route) - 1) if segk[k] == 2)
px = [[round((p % VW) / su, 1), round((p // VW) / sv, 1)] for p in route]
elev = [round(float(E.flat[p])) for p in route]
hi = int(np.argmax(elev))
rec = {'name': "the god's road", 'from': 'Sleeping City', 'via': {'the Gate': list(GATE)}, 'to': "Trickster's House",
       'km': round(L), 'tunnel_km': round(tun), 'causeway_km': round(wat), 'highest_m': max(elev), 'highest_px': px[hi],
       'legs': [{'name': nm, 'km': round(sum(CELL * math.hypot((p[k + 1] % VW) - (p[k] % VW), (p[k + 1] // VW) - (p[k] // VW)) for k in range(len(p) - 1))), 'cost': round(c, 1)} for nm, p, c in legs],
       'px': px, 'ground_m': elev, 'seg': segk}
os.makedirs(out, exist_ok=True)
json.dump(rec, open(os.path.join(out, 'gods-road.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
print(json.dumps({k: v for k, v in rec.items() if k not in ('px', 'ground_m', 'seg')}, indent=1))

# the route over the heights
from PIL import Image, ImageDraw
x0, y0, x1, y1 = 360, 20, 780, 480
sub = E[y0:y1, x0:x1]
g_y, g_x = np.gradient(sub)
sh = np.clip(.62 - (g_x + g_y) / 1400, .3, 1.15)
v = np.clip((sub + 2600) / 14000, 0, 1)
img = (np.stack([v * 255, (0.85 * v + 0.1) * 255, (1 - v) * 210 + 30], -1) * sh[..., None]).clip(0, 255).astype(np.uint8)
im = Image.fromarray(img).resize(((x1 - x0) * 2, (y1 - y0) * 2), Image.BILINEAR)
d = ImageDraw.Draw(im)
pts = [((p[0] * su - x0) * 2, (p[1] * sv - y0) * 2) for p in px]
for k in range(len(pts) - 1):
    d.line([pts[k], pts[k + 1]], fill=(255, 220, 0) if segk[k] == 0 else (255, 60, 60) if segk[k] == 1 else (60, 200, 255), width=3)
for nm, (qx, qy) in (('Sleeping City', (names_i['Sleeping City']['px'], names_i['Sleeping City']['py'])), ('Gate', GATE),
                    ("Trickster's House", (names_i["Trickster's House"]['px'], names_i["Trickster's House"]['py']))):
    X, Y = (qx * su - x0) * 2, (qy * sv - y0) * 2
    d.ellipse([X - 6, Y - 6, X + 6, Y + 6], outline=(255, 255, 255), width=2)
    d.text((X + 9, Y - 6), nm, fill=(255, 255, 255))
im.save(os.path.join(out, 'gods-road.jpg'), quality=88)
