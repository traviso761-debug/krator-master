#!/usr/bin/env python3
"""Where on Krator would Arcbeam, the bridge city, actually fit? A planet-wide search of scale model 5.1.

    python3 openworld/catch-bowl/tools/bridge_sites.py              # the best sites, ranked
    python3 openworld/catch-bowl/tools/bridge_sites.py --top 40     # more of them
    python3 openworld/catch-bowl/tools/bridge_sites.py --region "e badlands"

The owner, 2026-11-24: Arcbeam wants "an actual canyon that fits the arcology model, preferably someplace it is actually
helpful as a bridge", and 2026-11-25: "is there a good site somewhere in the desert, badlands, or any other region where
arcbeam would fit? i might well decide to move it where it fits the terrain and place a different arcology in its
current spot."

WHAT THE TARGET ASKS FOR (kits/ancients/targets/arcbeam/89z-rows.js, its first lines): "a 3,400 m gorge, a plateau on
both rims and a graded skirt down to the plain", gorge floor y=0 and rim y=400. So: a trench about 3.4 km across and
400 m deep, with LEVEL GROUND on both rims -- the city spans it, so the two rims must be at nearly the same height, and
flat enough behind for the plateau skirt (1,600 m) and the ground paint. The city itself is only 1.2 km across; the
gorge is the larger part of the site.

HOW THIS SEARCHES. At 2 km a pixel a 3.4 km gorge is 1.7 cells, so the model can never carry one directly -- a sub-cell
trench is the open world's carve (extract_region.py's carve_subcell_rivers, WORLD.H's `canyon` field). What the model CAN
show is the SHAPE OF THE COUNTRY: a plateau cut by a trench. So for every cell, along each of four axes and at three
half-widths, this asks:
   depth   min(rim A, rim B) - bed        how deep the trench is
   even    |rim A - rim B|                how level the two rims are with each other (a bridge needs this)
   flat    the rise 2 px beyond each rim  whether the rims are plateau, or just the flanks of a mountain
and scores depth while penalising unevenness and roughness beyond. It then measures the trench's RUN -- how far the same
signature holds along the trench -- because a bridge earns its keep where the trench is long enough that going round
costs real distance. Finally it names the model region each site lies in and its nearest settlements, so a site can be
judged on whether a crossing there is useful at all.

Read-only on tools/scale-model/model/data. numpy and PIL only.
"""
import json, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
DATA = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
RSTORE = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'src', '51-region-store.js')
SSTORE = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'src', '60-settlements.js')

# the target's own numbers
WANT_SPAN_KM, WANT_DEPTH_M = 3.4, 400.0
# a BAND, not a floor: Arcbeam bridges a 400 m gorge, so a 3 km-deep chasm is as wrong as a 50 m ditch
DEPTH_LO, DEPTH_HI = 250.0, 750.0
MAX_EVEN, MAX_FLAT = 60.0, 110.0
AXES = [(1, 0), (0, 1), (1, 1), (1, -1)]
HALFW = [1, 2, 3]          # px: a 4, 8 or 12 km trench at the model's resolution


def load():
    keys = json.load(open(os.path.join(DATA, 'model.json'), encoding='utf-8'))['keys']
    M = {k['key']: k.get('value', k.get('file')) for k in keys}
    img = lambda n: np.asarray(Image.open(os.path.join(DATA, n)).convert('RGB'))
    lo, hi = M['lo'], M['hi']
    h = img('h.png')
    E = lo + ((h[..., 0].astype(np.int32) << 8) | h[..., 1]) / 65535.0 * (hi - lo)
    w = img('wl.png')
    WHAS = w[..., 2] > 127
    RAIN = img('p.png')[..., 0].astype(np.float64) / 255.0 * 4000.0
    TEMP = img('tm.png')[..., 0].astype(np.float64) - 90.0
    return E, WHAS, RAIN, TEMP


def regions():
    src = open(RSTORE, encoding='utf-8').read()
    i = src.index('const defRegs = [')
    j = src.index('\n', src.index('];', i))
    return json.loads(src[src.index('[', i): src.rindex('];', i, j) + 1])


def settlements():
    import re
    src = open(SSTORE, encoding='utf-8').read()
    objs = re.findall(r'\{"id":\s*"([^"]+)",\s*"name":\s*"([^"]*)",\s*"type":\s*"([^"]*)",'
                      r'\s*"px":\s*([\d.]+),\s*"py":\s*([\d.]+)', src)
    m = re.search(r"const SETT_DROPPED\s*=\s*(\{.*?\});", src, re.S)
    dropped = set(re.findall(r'"([^"]+)"', m.group(1))) if m else set()
    latest = {}
    for sid, name, typ, px, py in objs:
        latest[sid] = (name, typ, float(px), float(py))
    return [(n, t, x, y) for sid, (n, t, x, y) in latest.items() if sid not in dropped]


def inside(pts, x, y):
    n, c = len(pts), False
    for k in range(n):
        ax, ay = pts[k]
        bx, by = pts[(k + 1) % n]
        if ((ay > y) != (by > y)) and (x < (bx - ax) * (y - ay) / ((by - ay) or 1e-9) + ax):
            c = not c
    return c


def shift(A, dx, dy):
    """A sampled at (x+dx, y+dy), edges held"""
    B = np.roll(A, (-dy, -dx), axis=(0, 1))
    if dy > 0:   B[-dy:, :] = A[-1, :]
    elif dy < 0: B[:-dy, :] = A[0, :]
    if dx > 0:   B[:, -dx:] = A[:, -1:]
    elif dx < 0: B[:, :-dx] = A[:, :1]
    return B


def scan(E, WHAS):
    """the best (score, half-width, axis) for every cell"""
    best = np.full(E.shape, -1e9)
    bw = np.zeros(E.shape, np.int8)
    ba = np.zeros(E.shape, np.int8)
    bd = np.zeros(E.shape)
    be = np.zeros(E.shape)
    for ai, (dx, dy) in enumerate(AXES):
        for w in HALFW:
            L, R = shift(E, -dx * w, -dy * w), shift(E, dx * w, dy * w)
            L2, R2 = shift(E, -dx * (w + 2), -dy * (w + 2)), shift(E, dx * (w + 2), dy * (w + 2))
            depth = np.minimum(L, R) - E
            even = np.abs(L - R)
            flat = np.maximum(np.abs(L2 - L), np.abs(R2 - R))
            span = w * 2 * 2.0                                    # km across, rim to rim
            # score the FIT, not the size: near 400 m deep, near 3.4 km across, rims level, plateau beyond
            s = (-np.abs(depth - WANT_DEPTH_M) - np.abs(span - WANT_SPAN_KM) * 40
                 - even * 1.5 - flat * .8 + 600)
            ok = (depth >= DEPTH_LO) & (depth <= DEPTH_HI) & (even <= MAX_EVEN) & (flat <= MAX_FLAT) & ~WHAS
            s = np.where(ok, s, -1e9)
            m = s > best
            best, bw, ba = np.where(m, s, best), np.where(m, w, bw), np.where(m, ai, ba)
            bd, be = np.where(m, depth, bd), np.where(m, even, be)
    return best, bw, ba, bd, be


def run(E, WHAS, x, y, w, ai):
    """how many cells the trench holds for along its own axis (a looser test): a long trench is worth a bridge"""
    dx, dy = AXES[ai]
    px, py = -dy, dx                      # along the trench is perpendicular to the cross-section
    n = 0
    for sgn in (1, -1):
        for k in range(1, 40):
            cx, cy = int(round(x + px * k * sgn)), int(round(y + py * k * sgn))
            if not (0 <= cx < E.shape[1] and 0 <= cy < E.shape[0]):
                break
            L = E[int(cy - dy * w) % E.shape[0], int(cx - dx * w) % E.shape[1]]
            R = E[int(cy + dy * w) % E.shape[0], int(cx + dx * w) % E.shape[1]]
            if min(L, R) - E[cy, cx] < DEPTH_LO * .6 or WHAS[cy, cx]:
                break
            n += 1
    return n


def main():
    top = 18
    only = None
    for i, a in enumerate(sys.argv[1:]):
        if a == '--top': top = int(sys.argv[i + 2])
        if a == '--region': only = sys.argv[i + 2].lower()
    E, WHAS, RAIN, TEMP = load()
    print('scale model 5.1: %d x %d px at 2 km, elevation %.0f..%.0f m' % (E.shape[1], E.shape[0], E.min(), E.max()))
    print("Arcbeam wants a %.1f km span across a %.0f m trench with level rims (kits/ancients/targets/arcbeam)" % (WANT_SPAN_KM, WANT_DEPTH_M))
    best, bw, ba, bd, be = scan(E, WHAS)
    RG = regions()
    SE = settlements()
    H, W = E.shape
    fl = best.ravel()
    order = np.argsort(-fl)
    # stage 1: the best-fitting cells, thinned so one canyon does not fill the list
    cand = []
    for idx in order:
        if fl[idx] <= -1e8 or len(cand) >= 600: break
        y, x = divmod(int(idx), W)
        if any(abs(x - cx) < 8 and abs(y - cy) < 8 for cx, cy, *_ in cand): continue
        cand.append((x, y, int(bw[y, x]), int(ba[y, x]), float(fl[idx])))
    # stage 2: a trench is worth a bridge only if it RUNS -- going round a short notch costs nothing
    rows = []
    for x, y, w, ai, s in cand:
        r = run(E, WHAS, x, y, w, ai)
        rows.append((s + r * 14, r, x, y, w, ai))
    rows.sort(reverse=True)
    print('\n%-11s %-7s %-6s %-7s %-7s %-7s %-5s %-6s %s' % ('px', 'span', 'depth', 'bed', 'rim A', 'rim B', 'even', 'run', 'region / nearest'))
    shown = 0
    for s, r, x, y, w, ai in rows:
        reg = [q['name'] for q in RG if q.get('kind') != 'tool' and inside(q['points'], x, y)]
        if only and not any(only in q.lower() for q in reg): continue
        dx, dy = AXES[ai]
        L = E[y - dy * w, x - dx * w]; R = E[y + dy * w, x + dx * w]
        depth = min(L, R) - E[y, x]; even = abs(L - R)
        near = sorted(((np.hypot(sx - x, sy - y) * 2, n, tp) for n, tp, sx, sy in SE))[:2]
        print('%4d,%-6d %4.0f km %5.0f m %6.0f %7.0f %7.0f %5.0f %4d px %s' % (
            x, y, w * 4, depth, E[y, x], L, R, even, r, '; '.join(reg[:2]) or '(no region)'))
        print('%43s rain %4.0f mm, %3.0f C, %.0f km of trench; nearest %s' % ('', RAIN[y, x], TEMP[y, x], r * 2,
              ', '.join('%s (%s) %.0f km' % (n, tp, d) for d, n, tp in near)))
        shown += 1
        if shown >= top: break


if __name__ == '__main__':
    main()
