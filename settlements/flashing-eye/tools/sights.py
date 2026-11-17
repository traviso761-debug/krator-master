#!/usr/bin/env python3
"""The Flashing Eye's sights on the scale model (PLAN.md section 3, "The method").

The ground from tools/scale-model/model/data/h.png, decoded as smodel.page.heights does (lo -2,600 m, hi 27,000 m, 16 bits in
R and G), sampled bilinear on the 2 km grid; Earth's curve with refraction (k 0.13); samples every 250 m. "Clear by" is the
least clearance on the line, leaving out the last kilometre (the target's own cell). A negative figure is the height of the
block. It reads this branch's model, before the scale-model session restored the Beacon's knoll (d1c7d6682): for the Rim
Post the layout takes the Beacon session's figures on the restored model instead. The layout (src/30-fe-layout.js) records what this prints; test-flashing-eye.js checks the records, not this script.

    python3 settlements/flashing-eye/tools/sights.py            # the table for the layout's eyes
    python3 settlements/flashing-eye/tools/sights.py --json     # the same as JSON
"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
H_PNG = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data', 'h.png')
KM_PX, R_EARTH, K_REFR, STEP = 2.0, 6371.0, 0.13, 0.25

# the eyes: [id, px, py, eye height over the eye's ground (m), the ground the eye stands on (m) or None for the model's]
EYES = [
    ('bench', 881.0, 1527.0, 20, None),          # the plan's table 3.2 (the bench on the grid)
    ('balcony', 881.0, 1527.1, 14, 1660),         # the Lip Range's balcony: the Lip (u 0), the flattened bench 1,660 m, 14 m up
    ('rim', 881.0, 1526.0, 12, None),             # the Eye Post on the grid (the summit's cell before the vent: 1,838 m), 12 m
    ('rim30', 881.0, 1526.0, 30, None),           # a 30 m tower (question 14)
    ('rimpost', 856.0, 1532.0, 12, None),         # the Beacon's Rim Post (settlements/beacon 30-bc-layout.js relays)
]
# the targets, a mark 15 m up
TARGETS = [
    ('beacon', 'the Beacon (the lamp)', 853, 1540),
    ('erehwon', 'Erehwon', 841, 1517),
    ('azure', "Gret-Ail (the Azure Dream's cove)", 846, 1509),
    ('tears', "the Golden Tears' camp", 850, 1628),
    ('alph', "the Alph wall's crest", 951, 1505),
    ('g1', 'G1, the Brow post', 917, 1648),
    ('tempest', 'the House of the Tempest', 886, 1619),
    ('qiblai', 'Qiblai', 922, 1595),
    ('theodiga', 'Theodiga', 908, 1535),
    ('rimpost', "the Beacon's Rim Post", 856, 1532),
    ('eye', 'the Eye Post', 881, 1526),
]


def load():
    from PIL import Image
    im = Image.open(H_PNG).convert('RGB')
    return im.size, im.load()


def height(px, size, P):
    W, Hh = size
    def at(x, y):
        x = min(max(x, 0), W - 1); y = min(max(y, 0), Hh - 1)
        r, g, _ = P[x, y]
        return (r * 256 + g) / 65535.0 * 29600.0 - 2600.0
    return at


def bil(at, x, y):
    x0, y0 = int(math.floor(x)), int(math.floor(y)); fx, fy = x - x0, y - y0
    return (at(x0, y0) * (1 - fx) * (1 - fy) + at(x0 + 1, y0) * fx * (1 - fy) +
            at(x0, y0 + 1) * (1 - fx) * fy + at(x0 + 1, y0 + 1) * fx * fy)


def sight(at, e, t, eyeH=20, ground=None, mark=15):
    ex, ey = e; tx, ty = t
    dpx = math.hypot(tx - ex, ty - ey); km = dpx * KM_PX
    g0 = bil(at, ex, ey) if ground is None else ground
    z0 = g0 + eyeH; z1 = bil(at, tx, ty) + mark
    n = max(2, int(km / STEP)); worst = 1e9
    for i in range(1, n):
        d = km * i / n
        if d < 0.3 or km - d < 1.0:
            continue
        x = ex + (tx - ex) * i / n; y = ey + (ty - ey) * i / n
        drop = d * (km - d) / (2 * R_EARTH) * (1 - K_REFR) * 1000.0   # the bulge between the two ends
        line = z0 + (z1 - z0) * d / km
        worst = min(worst, line - drop - bil(at, x, y))
    brg = (math.degrees(math.atan2(tx - ex, -(ty - ey))) + 360) % 360
    return {'km': round(km, 1), 'bearing': round(brg), 'clear': round(worst), 'eyeGround': round(g0)}


def main():
    size, P = load(); at = height(None, size, P)
    out = {}
    for eid, ex, ey, h, gr in EYES:
        row = {}
        for tid, name, tx, ty in TARGETS:
            if abs(tx - ex) < .01 and abs(ty - ey) < .01:
                continue
            row[tid] = sight(at, (ex, ey), (tx, ty), h, gr)
        out[eid] = row
    if '--json' in sys.argv:
        print(json.dumps(out, indent=1))
        return
    for eid, row in out.items():
        print('==', eid)
        for tid, s in row.items():
            print('  %-10s %6.1f km %4d deg  clear %+5d m  (eye ground %d)' % (tid, s['km'], s['bearing'], s['clear'], s['eyeGround']))


if __name__ == '__main__':
    main()
