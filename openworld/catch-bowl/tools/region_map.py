#!/usr/bin/env python3
"""A demo map of the Catch, the Bowl and the Inner Crater's doors.

Draws the scale model's ground (hypsometric tint under a NW hillshade), the
region outlines, the world pins, the least-cost roads from the Bowl and the
Catch into Iziz, every door through the Inner Crater's wall (a local low 250 m
or more below the wall beside it), and the candidate sites for Eidolon.

  python3 openworld/catch-bowl/tools/region_map.py [--out <png>]
"""
import sys, os, json, math, heapq, base64, io, argparse
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'scale-model'))
import smodel.page as P
from PIL import Image, ImageDraw, ImageFont

VIEWS = {'region': (898, 1295, 952, 1535, 3),    # x0, x1, y0, y1, image px per model px
         'gates':  (950, 1065, 1020, 1105, 13)}
X0 = X1 = Y0 = Y1 = S = 0                        # set by main() from the chosen view
IZIZ = (963, 985)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf'
TINT = [(0, (52, 88, 56)), (400, (96, 124, 66)), (900, (150, 148, 94)), (1500, (176, 152, 112)),
        (2200, (166, 138, 118)), (2900, (150, 140, 140)), (3600, (200, 200, 206)), (4600, (248, 250, 252))]
# the roads worth drawing: a pin, and the colour it gets
ROADS = [('Jabal', (1225, 1149)), ('Mantis', (1114, 1164)), ('Parabola', (970, 1186)),
         ('Bab al-Hawa (Godsgate)', (1028, 1246)), ('Strongbow', (1001, 1596))]


def pins():
    out = {}
    def walk(o):
        if isinstance(o, dict):
            nm = o.get('name')
            px = o.get('px')
            if nm and isinstance(px, list) and len(px) == 2:
                out[str(nm)] = (float(px[0]), float(px[1]), str(o.get('type') or ''))
            elif nm and o.get('px') is not None and o.get('py') is not None:
                out[str(nm)] = (float(o['px']), float(o['py']), str(o.get('type') or ''))
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    with open(os.path.join(ROOT, 'openworld', 'world-pins-gemini.json'), encoding='utf-8') as f:
        walk(json.load(f))
    return out


def road(E, wet, a, b):
    """Least cost over the ground: flat is cheap, high ground is dear, water impassable."""
    H, W = E.shape
    a = (int(round(a[0])), int(round(a[1])))
    b = (int(round(b[0])), int(round(b[1])))
    def cost(x, y):
        if wet[y, x]:
            return None
        return 1.0 + (max(0.0, float(E[y, x]) - 2450.0) / 300.0) ** 1.6
    dist = {a: 0.0}
    pre = {}
    pq = [(0.0, a)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist.get(u, 1e18) + 1e-9:
            continue
        if u == b:
            break
        ux, uy = u
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if dx == dy == 0:
                    continue
                vx, vy = ux + dx, uy + dy
                if not (0 <= vx < W and 0 <= vy < H):
                    continue
                c = cost(vx, vy)
                if c is None:
                    continue
                nd = d + c * (1.4142 if dx and dy else 1.0)
                if nd < dist.get((vx, vy), 1e18):
                    dist[(vx, vy)] = nd
                    pre[(vx, vy)] = u
                    heapq.heappush(pq, (nd, (vx, vy)))
    if b not in pre:
        return []
    path = [b]
    while path[-1] != a:
        path.append(pre[path[-1]])
    return path[::-1]


def crater_arc():
    """The whole Inner Crater ring, closed, and every region by name."""
    with open(os.path.join(ROOT, 'openworld', 'iziz-cluster', 'source', 'regions.json'), encoding='utf-8') as f:
        R = json.load(f)
    pts = [r for r in R if r.get('id') == 'rmuf5dnuexh4q'][0]['points']
    return pts + [pts[0]], {r.get('name'): r for r in R}


def inside(poly, x, y):
    """Point in polygon, by the crossing count."""
    c = False
    for (ax, ay), (bx, by) in zip(poly, poly[1:]):
        if (ay > y) != (by > y) and x < ax + (y - ay) * (bx - ax) / (by - ay):
            c = not c
    return c


def doors(E, arc):
    walk = []
    for (ax, ay), (bx, by) in zip(arc, arc[1:]):
        n = max(abs(bx - ax), abs(by - ay))
        for k in range(n):
            x = int(round(ax + (bx - ax) * k / n))
            y = int(round(ay + (by - ay) * k / n))
            if 0 <= x < E.shape[1] and 0 <= y < E.shape[0]:
                walk.append((x, y, float(E[y, x])))
    hts = [q[2] for q in walk]
    found = []
    for i, (x, y, m) in enumerate(walk):
        nb = max(hts[max(0, i - 15):min(len(walk), i + 16)])
        if nb - m >= 250:
            found.append((m, x, y, nb - m))
    found.sort()
    keep = []
    for m, x, y, drop in found:
        if any(math.hypot(x - q[1], y - q[2]) * 2 < 40 for q in keep):
            continue
        keep.append((m, x, y, drop))
        if len(keep) >= 12:
            break
    return keep, walk


def main():
    global X0, X1, Y0, Y1, S
    ap = argparse.ArgumentParser()
    ap.add_argument('--view', default='region', choices=sorted(VIEWS))
    ap.add_argument('--out', default=None)
    args = ap.parse_args()
    X0, X1, Y0, Y1, S = VIEWS[args.view]
    zoom = args.view == 'gates'
    TITLE = ('The gateways into Iziz' if zoom else 'The Catch, the Bowl and the doors into Iziz')
    if args.out is None:
        args.out = os.path.join(ROOT, 'openworld', 'catch-bowl', 'shots',
                                'region-map.png' if not zoom else 'gates-map.png')
    D = P.load()
    E, _ = P.heights(D)
    wet, _ = P.water_levels(D)
    sub = E[Y0:Y1, X0:X1].astype(float)
    h, w = sub.shape
    rgb = np.zeros(sub.shape + (3,), float)
    for (e0, c0), (e1, c1) in zip(TINT, TINT[1:]):
        m = (sub >= e0) & (sub < e1)
        t = ((sub - e0) / max(1, e1 - e0))[m]
        for i in range(3):
            rgb[..., i][m] = c0[i] + (c1[i] - c0[i]) * t
    rgb[sub >= TINT[-1][0]] = TINT[-1][1]
    rgb[sub < TINT[0][0]] = TINT[0][1]
    gy, gx = np.gradient(sub, 2000.0)
    az, al = math.radians(315), math.radians(45)
    nz = 1 / np.sqrt(gx * gx + gy * gy + 1)
    sh = np.clip(nz * math.sin(al) + (-gx * math.cos(az) - gy * math.sin(az)) * nz * math.cos(al), 0, 1)
    rgb = np.clip(rgb * (0.45 + 0.85 * sh[..., None]), 0, 255)
    rgb[wet[Y0:Y1, X0:X1]] = (58, 96, 132)
    img = Image.fromarray(rgb.astype(np.uint8)).resize((w * S, h * S), Image.LANCZOS)
    dr = ImageDraw.Draw(img, 'RGBA')
    pt = lambda x, y: ((x - X0) * S + S // 2, (y - Y0) * S + S // 2)
    f = lambda n, b=False: ImageFont.truetype(FONT % ('-Bold' if b else ''), n)
    f9, f11, f13, f22 = f(15), f(18), f(21, True), f(34, True)
    arc, byname = crater_arc()
    DO, _ = doors(E, arc)
    PIN = pins()

    # the roads first, under everything
    out = []
    for nm, src in ROADS:
        pa = road(E, wet, src, IZIZ)
        if not pa:
            continue
        cross = None
        for x, y in pa:
            if inside(arc, x, y):
                near = min((math.hypot(x - dx, y - dy), m, dx, dy) for m, dx, dy, _ in DO)
                cross = (x, y, near)
                break
        dr.line([pt(*q) for q in pa], fill=(28, 24, 20, 190), width=9, joint='curve')
        dr.line([pt(*q) for q in pa], fill=(246, 232, 198, 235), width=4, joint='curve')
        out.append((nm, len(pa) * 2, max(float(E[y, x]) for x, y in pa), cross))

    for nm, col, wd in [('Inner Crater', (255, 226, 120, 240), 5), ('The Bowl', (120, 210, 255, 220), 4),
                        ('The Catch', (255, 150, 120, 220), 4), ('Jabal Shiekdom', (210, 160, 255, 205), 3)]:
        p = byname[nm]['points']
        dr.line([pt(*q) for q in p] + [pt(*p[0])], fill=col, width=wd, joint='curve')

    for m, x, y, drop in DO:
        if not (X0 <= x < X1 and Y0 <= y < Y1):
            continue
        cx, cy = pt(x, y)
        r = 11
        dr.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(255, 255, 255, 255), width=4)
        dr.ellipse([cx - r + 4, cy - r + 4, cx + r - 4, cy + r - 4], fill=(230, 70, 60, 255))
        dr.text((cx, cy + r + 4), '%d m door' % m, font=f9, anchor='ma', fill=(255, 235, 230, 255),
                stroke_width=4, stroke_fill=(0, 0, 0, 225))

    # the two gateways the roads actually use
    gate_r = 26 if zoom else 22
    for nm, x, y, lx_, ly_, an in [('EAST gateway', 1026, 1063, 1, 1, 'la'),
                                   ('WEST gateway', 976, 1081, -1, 1, 'ra')]:
        cx, cy = pt(x, y)
        dr.ellipse([cx - gate_r, cy - gate_r, cx + gate_r, cy + gate_r], outline=(60, 230, 255, 240), width=5)
        dr.text((cx + lx_ * (gate_r + 8), cy + gate_r + 6), nm, font=f13, fill=(120, 240, 255, 255),
                anchor=an, stroke_width=5, stroke_fill=(0, 0, 0, 235))

    cands = [('Eidolon as pinned now', 1016, 1058, (255, 210, 60), 0, -1, 'md'),
             ('A  1021,1061', 1021, 1061, (90, 255, 140), 1, 0, 'lm'),
             ('B  1002,1070', 1002, 1070, (255, 150, 230), -1, 0, 'rm')]
    for nm, x, y, col, lx_, ly_, an in cands:
        cx, cy = pt(x, y)
        r = 18 if zoom else 15
        for wd, c in ((8, (0, 0, 0, 230)), (4, col + (255,))):
            dr.line([cx - r, cy, cx + r, cy], fill=c, width=wd)
            dr.line([cx, cy - r, cx, cy + r], fill=c, width=wd)
        dr.text((cx + lx_ * (r + 9), cy + ly_ * (r + 9)), nm, font=f13, fill=col + (255,),
                anchor=an, stroke_width=5, stroke_fill=(0, 0, 0, 230))

    for nm, (x, y, kind) in sorted(PIN.items()):
        if not (X0 <= x < X1 and Y0 <= y < Y1):
            continue
        if nm == 'Arcbeam':
            continue                      # Eidolon replaces it; drawn above
        if any(math.hypot(x - q[1], y - q[2]) < (3 if zoom else 7) for q in cands):
            continue
        big = kind in ('city', 'arcology')
        cx, cy = pt(x, y)
        r = 8 if big else 5
        dr.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 255), outline=(20, 20, 20, 255), width=2)
        dr.text((cx + r + 4, cy - 9), nm, font=f13 if big else f9, fill=(255, 255, 255, 255),
                stroke_width=4, stroke_fill=(0, 0, 0, 220))
    cx, cy = pt(*IZIZ)
    dr.ellipse([cx - 11, cy - 11, cx + 11, cy + 11], fill=(255, 255, 255, 255), outline=(20, 20, 20, 255), width=3)
    dr.text((cx + 15, cy - 11), 'IZIZ', font=f22, fill=(255, 255, 255, 255), stroke_width=5, stroke_fill=(0, 0, 0, 230))

    dr.rectangle([0, 0, w * S - 1, h * S - 1], outline=(0, 0, 0, 255), width=3)
    panel = lambda x, y, ww, hh: dr.rectangle([x, y, x + ww, y + hh], fill=(12, 14, 18, 210),
                                              outline=(255, 255, 255, 125), width=2)
    ty = h * S - 232
    sub2 = 'Krator scale model 5.1, after the 528-531 cut   -   2 km per model pixel'
    tw = int(max(dr.textlength(TITLE, font=f22), dr.textlength(sub2, font=f11))) + 36
    panel(16, ty, tw, 104)
    dr.text((34, ty + 14), TITLE, font=f22, fill=(255, 255, 255, 255))
    dr.text((34, ty + 60), sub2, font=f11, fill=(205, 212, 225, 255))
    bx, by = 34, h * S - 58
    want = w * 2 * 0.26                                # about a quarter of the width, in km
    km = min((20, 50, 100, 200, 500, 1000), key=lambda k: abs(k - want))
    L = km / 2.0 * S
    dr.rectangle([bx - 14, by - 26, bx + L + 24, by + 32], fill=(12, 14, 18, 210), outline=(255, 255, 255, 125), width=2)
    dr.line([bx, by, bx + L, by], fill=(255, 255, 255, 255), width=5)
    for t in (0, 0.5, 1.0):
        dr.line([bx + L * t, by - 9, bx + L * t, by + 9], fill=(255, 255, 255, 255), width=5)
    dr.text((bx, by + 10), '0', font=f9, fill=(255, 255, 255, 255))
    dr.text((bx + L, by + 10), '%d km' % km, font=f9, anchor='ra', fill=(255, 255, 255, 255))
    lx, ly = w * S - 352, 16
    panel(lx, ly, 332, 288)
    rows = [((255, 226, 120), 'Inner Crater boundary'), ((120, 210, 255), 'The Bowl'),
            ((255, 150, 120), 'The Catch'), ((210, 160, 255), 'Jabal Shiekdom'),
            ((246, 232, 198), 'least-cost road into Iziz'), ((230, 70, 60), 'a door through the wall'),
            ((60, 230, 255), 'a gateway the roads use'), ((255, 210, 60), 'Eidolon as pinned now'),
            ((90, 255, 140), 'A  holds the east gate'), ((255, 150, 230), 'B  watches both gates')]
    for i, (c, t) in enumerate(rows):
        yy = ly + 22 + i * 26
        dr.rectangle([lx + 18, yy + 6, lx + 48, yy + 15], fill=c + (255,))
        dr.text((lx + 58, yy), t, font=f9, fill=(238, 242, 250, 255))
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    img.save(args.out)
    print('wrote %s  %dx%d px (%d x %d km of ground)' % (args.out, img.width, img.height, (X1 - X0) * 2, (Y1 - Y0) * 2))
    for nm, km, top, cross in out:
        if cross:
            x, y, (d, m, dx, dy) = cross
            c = 'enters the crater at %d,%d (%d m), %d km from the %d m door at %d,%d' % (
                x, y, int(E[y, x]), d * 2, m, dx, dy)
        else:
            c = 'never enters the crater'
        print('  %-24s %4d km of road, tops %4.0f m; %s' % (nm, km, top, c))
    print('  %d doors on the arc: %s' % (len(DO), ', '.join('%d m at %d,%d' % (m, x, y) for m, x, y, _ in DO)))


if __name__ == '__main__':
    main()
