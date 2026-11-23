#!/usr/bin/env python3
"""Scale model 5.1, edit 21 (2026-11-22): Farside & Farport seaward extension + Spear-Queen raid coast.

    python3 tools/scale-model/edit_521_farside.py --preview-map <out.png>   # fast terrain+river preview, nothing written
    python3 tools/scale-model/edit_521_farside.py --dry-run                 # full climate/paint/invariant check, nothing written
    python3 tools/scale-model/edit_521_farside.py                           # edits model/data, 51-region-store.js & 60-settlements.js

What it does (owner decision, 2026-11-22; CROOK-RIA-DECISIONS.md section 2.5.6):
1. Extends Farside and the Farport Promontory 55-96 km (28-48 px) westward into the NWern Ocean across Y = 472..604:
   - Replaces the pinched 10-16 km cliff-foot strip with a rugged, deeply embayed coastal foreland of kelp-draped
     piedmont ridges (+180..+980 m), sea-coves, wave-cut < +65 m tsunami scour benches, and the commanding Farport
     Promontory jutting out to X ~ 238..250 (leaving 175+ km of deep open NWern Ocean shipping channel east of Drownlands).
   - Gives the Twin-Born Spear-Queens of Yonni (north of the fortified Y = 515 border) both a ~130 km-wide rolling
     land/piedmont raid frontier along Y = 515 AND a 220+ km NNW/W-facing indented amphibious raid coast of coves,
     estuaries, Eternian kelp-terraces, and coastal shipping lanes down to Farport!
2. Relocates Farport (sakq13nyhr) & DATA.tsunami_farside to the extended headland plateau:
   - Farport's tsunami-safe upper city moves onto the near-shore plateau at (248, 585) (+212 m, safe above the 100 m
     run-up ceiling), immediately overlooking Līng-Mā's drowned estuary & lower harbour at (243, 586) (0.0 m).
3. Dendritic Piedmont River Extensions & Confluences (zero straight lines):
   - Extends Līng-Mā (r002) via winding alluvial meanders into the new Farport drowned estuary (243, 586).
   - Routes Farside's mountain-front torrents (r061, r120, r196, r234, r175 along the Y = 515 border, r113, r089,
     r148, r130, r078) via Dijkstra least-cost pathfinding + multi-harmonic bends into 4 branched dendritic coastal
     river systems (plus 2 coastal headland forks 9134, 9135).
4. Updates Farside, Eternal State (up to Y = 515), NWern Ocean, and Crookshore polygons in 51-region-store.js.
"""
import heapq, json, math, os, re, sys
from collections import Counter

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import smodel.page as P, smodel.geom as G, smodel.climate as C, smodel.paint as PA   # noqa: E402

SRC = os.path.join(HERE, 'model', 'src')
DRY = '--dry-run' in sys.argv
PREVIEW_PNG = sys.argv[sys.argv.index('--preview-map') + 1] if '--preview-map' in sys.argv else None
MARGIN_PX = 3

FARPORT_NEW_PX = (248, 585)
HARBOUR_NEW_PX = (243, 586)

# Updated polygon point lists for 51-region-store.js
FARSIDE_BIO_NEW_PTS = [
    [450, 607], [443, 622], [414, 614], [397, 644], [373, 627], [352, 629],
    [318, 614], [284, 605], [244, 602], [230, 585], [234, 550], [244, 515],
    [274, 482], [302, 469], [326, 379], [411, 371], [461, 333], [502, 332],
    [495, 348], [466, 360], [445, 377], [446, 395], [445, 403], [400, 426],
    [372, 447], [345, 478], [333, 509], [322, 554], [323, 572], [323, 592],
    [334, 599], [389, 583], [403, 583], [421, 588], [434, 598],
]

FARSIDE_GEO_NEW_PTS = [
    [431, 332], [435, 381], [445, 403], [422, 429], [391, 448], [361, 473],
    [343, 500], [334, 536], [325, 590], [301, 598], [246, 599], [233, 585],
    [237, 548], [247, 515], [278, 482], [306, 468], [338, 364], [399, 367], [425, 352],
]

ETERNAL_NEW_PTS = [
    [503, 827], [485, 843], [465, 863], [416, 859], [360, 846], [309, 849],
    [292, 801], [296, 732], [309, 645], [280, 606], [245, 601], [232, 585],
    [236, 550], [246, 515], [322, 515], [323, 567], [323, 596], [391, 585],
    [427, 595], [441, 606], [461, 614], [497, 599], [519, 616], [529, 656],
    [555, 669], [573, 704], [534, 748], [493, 745], [513, 771], [499, 799],
]

NWOCEAN_NEW_PTS = [
    [233, 586], [236, 552], [245, 516], [276, 484], [308, 470], [322, 440],
    [321, 419], [341, 391], [425, 385], [437, 367], [461, 344], [497, 331], [274, 336],
]

CROOKSHORE_NEW_PTS = [
    [274, 606], [250, 650], [216, 694], [179, 740], [134, 757], [62, 747],
    [42, 709], [36, 632], [37, 574], [37, 548], [69, 566], [69, 597],
    [76, 630], [95, 635], [139, 644], [191, 618], [236, 603],
]


def hexrgb(h):
    return np.array([int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)], float)


def regions_src():
    s = open(os.path.join(SRC, '51-region-store.js'), encoding='utf-8', newline='').read()
    m = re.search(r'const defRegs = (\[.*?\]);\n', s, re.S)
    return s, {r['id']: r for r in json.loads(m.group(1))}


def fbm_grid(sh, seed=521):
    """Smooth multi-octave deterministic spatial noise on grid sh (no grid artifacts)."""
    rng = np.random.default_rng(seed)
    acc = np.zeros(sh, dtype=float)
    for sig, w in [(18.0, 0.44), (9.5, 0.30), (4.6, 0.17), (2.2, 0.09)]:
        raw = rng.standard_normal(sh)
        f = nd.gaussian_filter(raw, sigma=sig)
        f /= (np.std(f) + 1e-9)
        acc += w * f
    return acc


def target_shore_x(y_arr):
    """Natural asymmetric western shoreline X(y) across Y = 466..612."""
    ctrl = [
        (464.0, 313.0),
        (472.0, 307.5),
        (481.0, 297.0),
        (490.0, 281.5),   # Spear-Queen forward galley cape
        (499.0, 275.5),   # Northern cove
        (507.0, 259.5),   # Spear-Queen southern watch-promontory
        (515.5, 256.5),   # Contested Y = 515 Border Estuary Bight
        (526.5, 244.0),   # Broad North-Farside Cape
        (536.0, 252.5),   # Sheltered raid-bay (r113 mouth)
        (544.5, 246.5),   # Kelp-stack headland
        (553.5, 254.0),   # Deep Mid-Farside Estuary Bay (r089 mouth)
        (562.5, 244.5),   # Tōng-Sēk headland
        (569.5, 249.5),   # Tōng-Sēk cove (r078 mouth)
        (578.5, 239.5),   # Bold North Farport Cape
        (586.0, 243.2),   # Līng-Mā / Farport drowned harbour throat
        (591.5, 239.0),   # West Farport Promontory tip
        (599.5, 248.5),   # Farport South Roads bight
        (605.5, 248.5),   # Rejoins existing mainland shore cleanly
        (612.0, 246.5),
    ]
    ys = np.array([c[0] for c in ctrl])
    xs = np.array([c[1] for c in ctrl])
    out = np.interp(y_arr, ys, xs)
    out = nd.gaussian_filter1d(out, sigma=2.1, mode='nearest')
    rng1 = np.random.default_rng(5219)
    rough = np.zeros_like(y_arr, dtype=float)
    for sig, amp in [(5.8, 2.2), (2.7, 1.35), (1.3, 0.65)]:
        v = nd.gaussian_filter1d(rng1.standard_normal(len(y_arr)), sigma=sig)
        rough += amp * v / (np.std(v) + 1e-9)
    # Keep Farport harbour throat (Y ~ 586) clean of random spike
    throat_calm = 1.0 - 0.75 * np.exp(-((y_arr - 586.0) / 3.2) ** 2)
    env = G.sstep(468.0, 478.0, y_arr) * (1.0 - G.sstep(596.0, 604.5, y_arr))
    return out + env * throat_calm * rough


def route_piedmont_river(E, wps, joint_field, box_pad=14, bend_amp=1.15, seed=1):
    """Dijkstra least-cost terrain+bedrock-joint path with continuous multi-harmonic alluvial meanders."""
    sh = E.shape
    xs = [p[0] for p in wps]
    ys = [p[1] for p in wps]
    x0 = max(2, int(math.floor(min(xs))) - box_pad)
    x1 = min(sh[1] - 3, int(math.ceil(max(xs))) + box_pad)
    y0 = max(2, int(math.floor(min(ys))) - box_pad)
    y1 = min(sh[0] - 3, int(math.ceil(max(ys))) + box_pad)

    sub_E = E[y0:y1 + 1, x0:x1 + 1]
    sub_J = joint_field[y0:y1 + 1, x0:x1 + 1]
    e_norm = (sub_E - np.min(sub_E)) / max(40.0, float(np.ptp(sub_E)))
    cost_grid = 1.0 + 3.4 * np.clip(e_norm, 0.0, 1.5) + 0.95 * sub_J

    full_pts = []
    for seg_i in range(len(wps) - 1):
        sx, sy = wps[seg_i]
        gx, gy = wps[seg_i + 1]
        si, sj = int(round(sx)) - x0, int(round(sy)) - y0
        gi, gj = int(round(gx)) - x0, int(round(gy)) - y0
        H, W = cost_grid.shape
        si, gi = np.clip(si, 0, W - 1), np.clip(gi, 0, W - 1)
        sj, gj = np.clip(sj, 0, H - 1), np.clip(gj, 0, H - 1)

        dist = np.full((H, W), np.inf)
        prev = np.full((H, W, 2), -1, dtype=int)
        dist[sj, si] = 0.0
        pq = [(0.0, sj, si)]
        while pq:
            d, cj, ci = heapq.heappop(pq)
            if cj == gj and ci == gi:
                break
            if d > dist[cj, ci]:
                continue
            for dj, di, step_l in [(-1, 0, 1.0), (1, 0, 1.0), (0, -1, 1.0), (0, 1, 1.0),
                                   (-1, -1, 1.4142), (-1, 1, 1.4142), (1, -1, 1.4142), (1, 1, 1.4142)]:
                nj, ni = cj + dj, ci + di
                if 0 <= nj < H and 0 <= ni < W:
                    # Slight uphill penalty so rivers naturally follow valleys downhill
                    dh = max(0.0, float(sub_E[nj, ni] - sub_E[cj, ci]))
                    ndist = d + step_l * (0.5 * (cost_grid[cj, ci] + cost_grid[nj, ni]) + 0.015 * dh)
                    if ndist < dist[nj, ni]:
                        dist[nj, ni] = ndist
                        prev[nj, ni] = (cj, ci)
                        heapq.heappush(pq, (ndist, nj, ni))

        seg = []
        cj, ci = gj, gi
        while cj != -1 and ci != -1:
            seg.append((float(ci + x0), float(cj + y0)))
            if cj == sj and ci == si:
                break
            pj, pi = prev[cj, ci]
            cj, ci = int(pj), int(pi)
        seg.reverse()
        if seg_i == 0:
            full_pts.extend(seg)
        else:
            full_pts.extend(seg[1:])

    arr = np.array(full_pts, dtype=float)
    arr[0] = wps[0]
    arr[-1] = wps[-1]
    if len(arr) >= 5:
        p0, p1 = arr[0].copy(), arr[-1].copy()
        sx = nd.gaussian_filter1d(arr[:, 0], sigma=1.45, mode='nearest')
        sy = nd.gaussian_filter1d(arr[:, 1], sigma=1.45, mode='nearest')
        t = np.linspace(0.0, 1.0, len(sx))
        env = np.sin(math.pi * t) ** 1.15
        tx = np.gradient(sx)
        ty = np.gradient(sy)
        tn = np.hypot(tx, ty) + 1e-9
        nx, ny = -ty / tn, tx / tn
        ph1 = (seed * 1.73) % (2.0 * math.pi)
        ph2 = (seed * 2.91 + 1.1) % (2.0 * math.pi)
        ph3 = (seed * 4.37 + 2.3) % (2.0 * math.pi)
        disp = bend_amp * env * (
            0.56 * np.sin(2.0 * math.pi * 2.3 * t + ph1)
            + 0.31 * np.sin(2.0 * math.pi * 4.7 * t + ph2)
            + 0.13 * np.sin(2.0 * math.pi * 8.1 * t + ph3)
        )
        sx = sx + nx * disp
        sy = sy + ny * disp
        sx[0], sy[0] = p0[0], p0[1]
        sx[-1], sy[-1] = p1[0], p1[1]
        arr = np.column_stack([sx, sy])

    # Resample at ~0.85 px spacing for smooth rendering
    diffs = np.hypot(np.diff(arr[:, 0]), np.diff(arr[:, 1]))
    cum = np.concatenate([[0.0], np.cumsum(diffs)])
    tot = float(cum[-1])
    if tot < 1.0:
        return [[round(float(p[0]), 2), round(float(p[1]), 2)] for p in arr]
    n_out = max(5, int(round(tot / 0.85)) + 1)
    s_new = np.linspace(0.0, tot, n_out)
    rx = np.interp(s_new, cum, arr[:, 0])
    ry = np.interp(s_new, cum, arr[:, 1])
    rx[0], ry[0] = wps[0][0], wps[0][1]
    rx[-1], ry[-1] = wps[-1][0], wps[-1][1]
    return [[round(float(x), 2), round(float(y), 2)] for x, y in zip(rx, ry)]


def dist_to_polyline(xx, yy, pts, pad=10):
    sh = xx.shape
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0 = max(0, int(math.floor(min(xs))) - pad)
    x1 = min(sh[1], int(math.ceil(max(xs))) + pad + 1)
    y0 = max(0, int(math.floor(min(ys))) - pad)
    y1 = min(sh[0], int(math.ceil(max(ys))) + pad + 1)
    sub_x = xx[y0:y1, x0:x1]
    sub_y = yy[y0:y1, x0:x1]
    best_d = np.full(sub_x.shape, np.inf)
    best_s = np.zeros(sub_x.shape, dtype=float)
    cum = 0.0
    tot = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:])) + 1e-9
    for a, b in zip(pts, pts[1:]):
        vx, vy = b[0] - a[0], b[1] - a[1]
        l2 = vx * vx + vy * vy
        seg_l = math.sqrt(l2)
        if l2 < 1e-9:
            continue
        t = np.clip(((sub_x - a[0]) * vx + (sub_y - a[1]) * vy) / l2, 0.0, 1.0)
        px = a[0] + t * vx
        py = a[1] + t * vy
        d = np.hypot(sub_x - px, sub_y - py)
        m = d < best_d
        best_d = np.where(m, d, best_d)
        best_s = np.where(m, (cum + t * seg_l) / tot, best_s)
        cum += seg_l
    return (y0, y1, x0, x1), best_d, best_s


def main():
    D = P.load()
    if not PREVIEW_PNG and any(int(str(r.get('id', '0')).lstrip('r') or 0) == 9134 for r in D['rivers'] if str(r.get('id', '')).isdigit() or str(r.get('id', '')).startswith('913')):
        sys.exit('edit_521_farside has run already (river 9134 is in DATA.rivers)')

    rep = {'edit': '5.1 edit 21 (Farside & Farport seaward extension + Spear-Queen raid coast)', 'date': '2026-11-22'}
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = Eo.shape
    codes = [c['code'] for c in D['climate']['classes']]
    yy, xx = np.mgrid[0:sh[0], 0:sh[1]].astype(float)

    s51_txt, R = regions_src()

    # Own editable cells: new Farside biome polygon minus adjacent land biomes (NW outer wall, w outer wall, new Crookshore, Drownlands)
    reg_farside_new = G.poly(FARSIDE_BIO_NEW_PTS, 1.0, 1.0, sh) > 0.5
    others = (
        (G.poly(R['rmuqm8dxeuvhi']['points'], 1.0, 1.0, sh) > 0.5)
        | (G.poly(R['rmvk92x5vcz46']['points'], 1.0, 1.0, sh) > 0.5)
        | (G.poly(CROOKSHORE_NEW_PTS, 1.0, 1.0, sh) > 0.5)
        | (G.poly(R['rmwete7oza9d9']['points'], 1.0, 1.0, sh) > 0.5)
    )
    own = reg_farside_new & ~others
    inner = nd.binary_erosion(own, iterations=MARGIN_PX)

    # ---- 1. Build the extended Farside coastal piedmont, tsunami scour bench & Farport Promontory
    En = Eo.copy()
    whas2 = whas0.copy()
    wlev2 = wlev0.copy()

    n_macro = fbm_grid(sh, seed=5211)
    n_ridge = fbm_grid(sh, seed=5212)
    n_fine = fbm_grid(sh, seed=5213)
    joint_field = 0.5 + 0.5 * np.tanh(1.3 * fbm_grid(sh, seed=5217))

    # Compute old mainland shore X_old(y) across Y = 460..616
    y_rows = np.arange(sh[0], dtype=float)
    x_old_1d = np.full(sh[0], 310.0)
    for y_i in range(460, 618):
        for x_i in range(230, 340):
            if not water0[y_i, x_i:x_i + 4].any():
                x_old_1d[y_i] = float(x_i)
                break
    x_old_1d = nd.gaussian_filter1d(x_old_1d, sigma=1.5, mode='nearest')
    x_new_1d = target_shore_x(y_rows)

    # Broadcast to 2D over Y = 465..612, X = 215..330
    y0, y1, x0, x1 = 464, 612, 215, 332
    sub_x = xx[y0:y1, x0:x1]
    sub_y = yy[y0:y1, x0:x1]
    sub_Eo = Eo[y0:y1, x0:x1]
    sub_in = inner[y0:y1, x0:x1]

    xo = x_old_1d[y0:y1, None]
    xn = x_new_1d[y0:y1, None]
    width = np.maximum(1.0, xo - xn)

    nm = n_macro[y0:y1, x0:x1]
    nr = n_ridge[y0:y1, x0:x1]
    nf = n_fine[y0:y1, x0:x1]

    # Sinuous mountain-foot tie-in warped by ridge noise so zero vertical seam appears at xo!
    tie_x = xo + 8.5 + 3.2 * nr
    xn_2d = xn + 1.15 * nr * G.sstep(470.0, 480.0, sub_y) * (1.0 - G.sstep(594.0, 603.0, sub_y))
    # Keep Farport harbour mouth exact
    fp_mouth_lock = np.exp(-((sub_y - 586.0) / 3.0) ** 2)
    xn_2d = xn_2d * (1.0 - fp_mouth_lock) + xn * fp_mouth_lock

    u = (sub_x - xn_2d) / np.maximum(5.0, tie_x - xn_2d)
    lat_env = G.sstep(467.0, 475.0, sub_y) * (1.0 - G.sstep(600.0, 606.5, sub_y))

    # Irregular ENE-WSW piedmont ridge spurs shedding westward off the Outer Wall
    ridge_spurs = 0.5 + 0.5 * np.sin(2.0 * math.pi * ((sub_y - 475.0) / 19.5 + 0.032 * (sub_x - 255.0)) + 1.15 * nm + 0.55 * nr)

    scour_part = 7.5 + 58.0 * G.sstep(0.0, 0.14, u)
    piedmont_part = (
        65.5
        + 820.0 * (np.clip((u - 0.13) / 0.87, 0.0, 1.15) ** 1.55)
        + (210.0 * ridge_spurs + 95.0 * nr + 26.0 * nf) * G.sstep(0.06, 0.28, u)
    )
    land_h = np.where(u <= 0.14, scour_part + 9.0 * nf * G.sstep(0.02, 0.13, u), piedmont_part)

    # Farport Headland Plateau boost around (248, 585): tsunami-safe near-shore bedrock plateau (~212 m crest)
    d_fp = np.hypot((sub_x - FARPORT_NEW_PX[0]) / 4.8, (sub_y - FARPORT_NEW_PX[1]) / 4.2)
    fp_plat = (212.0 + 10.0 * nf) * (1.0 - G.sstep(0.55, 1.35, d_fp))

    # Spear-Queen Northern Watch-Capes (coastal bastions north of Y = 515)
    d_sq1 = np.hypot((sub_x - 263.0) / 4.2, (sub_y - 507.0) / 3.8)
    d_sq2 = np.hypot((sub_x - 283.0) / 4.2, (sub_y - 490.0) / 3.8)
    sq_capes = 190.0 * (1.0 - G.sstep(0.5, 1.3, d_sq1)) + 205.0 * (1.0 - G.sstep(0.5, 1.3, d_sq2))

    land_target = np.maximum(land_h, np.maximum(fp_plat, sq_capes))

    # Seamless additive-apron tie-in onto existing Outer Wall spurs (never cuts existing mountains; tapers apron smoothly by u=1.18)
    apron_taper = 1.0 - G.sstep(0.84, 1.18, u)
    blended_land = np.where(sub_Eo > 40.0, np.maximum(sub_Eo, 0.35 * sub_Eo + land_target * apron_taper), land_target * apron_taper + np.maximum(0.0, sub_Eo) * (1.0 - apron_taper))

    # Offshore submarine shelf apron
    sea_dist = xn_2d - sub_x
    shelf_floor = -3.0 - 9.5 * np.power(np.clip(sea_dist, 0.0, 22.0), 1.18) + 8.0 * nf * G.sstep(1.0, 5.0, sea_dist)
    shelf_w = 1.0 - G.sstep(7.0, 16.0, sea_dist)
    blended_sea = sub_Eo * (1.0 - shelf_w) + np.maximum(sub_Eo, np.minimum(-2.5, shelf_floor)) * shelf_w

    shore_k = G.sstep(-0.45, 0.45, sub_x - xn_2d)
    proposed = blended_sea * (1.0 - shore_k) + blended_land * shore_k

    edit_zone = sub_in & (lat_env > 0.01) & (u <= 1.22) & (sea_dist <= 16.5)
    blend_alpha = lat_env * (1.0 - G.sstep(13.0, 16.5, sea_dist)) * (1.0 - G.sstep(0.95, 1.22, u))
    new_sub_E = np.where(edit_zone, sub_Eo * (1.0 - blend_alpha) + proposed * blend_alpha, sub_Eo)

    # Carve Līng-Mā's drowned estuary & sheltered Farport lower harbour arm around (243, 586) -> (247.2, 586.6)
    est_pts = [(238.5, 586.3), (241.5, 586.2), (244.0, 586.1), (246.4, 586.6)]
    (ey0, ey1, ex0, ex1), edist, es = dist_to_polyline(sub_x + x0, sub_y + y0, est_pts, pad=6)
    # Convert slice back to sub window
    est_slice = new_sub_E[ey0:ey1, ex0:ex1]
    est_in = sub_in[ey0:ey1, ex0:ex1]
    est_hw = 1.45 - 0.45 * es
    est_floor = -16.0 + 11.0 * es
    est_k = G.sstep(est_hw - 0.35, est_hw + 0.85, edist)
    est_carved = est_floor * (1.0 - est_k) + est_slice * est_k
    new_sub_E[ey0:ey1, ex0:ex1] = np.where(est_in & (edist <= est_hw + 0.9), np.minimum(est_slice, est_carved), est_slice)

    # Guarantee Farport city pixel (248, 585) sits cleanly at +212 m on dry plateau and Harbour pixel (243, 586) is open water
    fpx, fpy = FARPORT_NEW_PX[0] - x0, FARPORT_NEW_PX[1] - y0
    for dj in (-1, 0, 1):
        for di in (-1, 0, 1):
            w_c = 1.0 if (dj == 0 and di == 0) else 0.55
            new_sub_E[fpy + dj, fpx + di] = max(float(new_sub_E[fpy + dj, fpx + di]), 192.0 + 20.0 * w_c)
    new_sub_E[fpy, fpx] = 212.0
    hpx, hpy = HARBOUR_NEW_PX[0] - x0, HARBOUR_NEW_PX[1] - y0
    new_sub_E[hpy, hpx] = min(float(new_sub_E[hpy, hpx]), -9.5)

    En[y0:y1, x0:x1] = new_sub_E

    # ---- 2. Dendritic River Extensions & Confluences across the Extended Farside Foreland
    # First carve gentle meandering alluvial valleys along our 5 coastal trunk corridors so Dijkstra routes naturally!
    corridors = [
        # (wps, hw_px, cut_m)
        ([(310.0, 474.2), (299.0, 476.5), (291.5, 476.0)], 2.2, 55.0),                            # r061 northern cove
        ([(308.0, 486.2), (295.0, 488.8), (284.0, 487.5)], 2.2, 65.0),                            # r120 Spear-Queen valley
        ([(310.0, 514.3), (293.0, 512.0), (274.0, 517.5), (252.5, 515.2)], 3.2, 115.0),           # r175 Y=515 Border River
        ([(310.0, 528.3), (291.0, 533.0), (270.0, 530.5), (251.5, 534.8)], 2.8, 105.0),           # r113 North-Central raid bay
        ([(308.0, 538.3), (289.0, 544.5), (269.0, 552.5), (249.5, 552.8)], 3.4, 125.0),           # r089 Mid-Farside kelp river
        ([(302.0, 556.3), (284.0, 563.5), (266.0, 566.5), (248.5, 568.2)], 2.9, 110.0),           # r078 Tōng-Sēk-Mā
        ([(300.0, 586.4), (284.0, 591.5), (266.0, 584.0), (253.5, 588.2), (245.8, 586.5)], 3.8, 135.0),  # r002 Līng-Mā
    ]
    for cwps, chw, ccut in corridors:
        (cy0, cy1, cx0, cx1), cdist, cs = dist_to_polyline(xx, yy, cwps, pad=8)
        sl = En[cy0:cy1, cx0:cx1]
        in_sl = inner[cy0:cy1, cx0:cx1]
        # Keep Farport plateau intact above Līng-Mā's north bank!
        fp_guard = np.hypot(xx[cy0:cy1, cx0:cx1] - FARPORT_NEW_PX[0], yy[cy0:cy1, cx0:cx1] - FARPORT_NEW_PX[1]) < 2.3
        prof = (1.0 - G.sstep(0.0, chw, cdist)) * ccut * (0.45 + 0.55 * np.sin(math.pi * np.clip(cs, 0.05, 0.95)))
        floor_min = 4.5 + 26.0 * (1.0 - cs)
        carved = np.maximum(floor_min, sl - prof)
        mask_c = in_sl & ~fp_guard & (sl > floor_min) & (cdist < chw)
        En[cy0:cy1, cx0:cx1] = np.where(mask_c, np.minimum(sl, carved), sl)

    # Re-lock Farport plateau cell at +212 m
    En[FARBOUR_Y := FARPORT_NEW_PX[1], FARBOUR_X := FARPORT_NEW_PX[0]] = 212.0

    # Reconcile open-ocean water mask whas2 inside own (connected to global ocean at (200, 550))
    sub_cand = En <= 0.0
    lbl, _ = nd.label(sub_cand)
    ocean_lbl = int(lbl[550, 200])
    conn_sea = (lbl == ocean_lbl)
    newly_emerged = inner & whas0 & ~conn_sea
    newly_drowned = inner & ~whas0 & conn_sea

    # Fill any tiny accidentally below-0 coastal land hollows inside inner not connected to ocean
    trapped_pits = inner & (En <= 1.5) & ~conn_sea & (En != Eo)
    if trapped_pits.any():
        En[trapped_pits] = 3.5

    whas2 = np.where(inner, conn_sea, whas0)
    wlev2 = np.where(inner, np.where(conn_sea, 0.0, 0.0), wlev0)

    # Helper to snap river mouth cleanly to the first open-ocean pixel along its outgoing vector
    def snap_to_sea(pts):
        # Trim any trailing points that already entered sea early so mouth sits right on the coast
        while len(pts) > 4:
            px_p, py_p = int(round(pts[-2][0])), int(round(pts[-2][1]))
            if whas2[py_p, px_p]:
                pts.pop()
            else:
                break
        lx, ly = pts[-1]
        if whas2[int(round(ly)), int(round(lx))]:
            return pts
        # Search nearest ocean pixel within 8 px westward/seaward
        best = None
        for r_s in np.linspace(0.8, 9.0, 20):
            for ang in np.linspace(-0.65, 0.65, 13):
                tx = lx - r_s * math.cos(ang)
                ty = ly + r_s * math.sin(ang)
                ti, tj = int(round(tx)), int(round(ty))
                if 0 <= tj < sh[0] and 0 <= ti < sh[1] and whas2[tj, ti]:
                    best = [round(float(tx), 2), round(float(ty), 2)]
                    break
            if best:
                break
        if best:
            pts.append(best)
        return pts

    def enforce_monotone_bed(pts, end_sea=True):
        """Ensure terrain cells along river extensions step smoothly downhill with zero uphill bumps."""
        vals = [float(En[int(round(p[1])), int(round(p[0]))]) for p in pts]
        # Non-increasing envelope from head to mouth
        mono = vals[:]
        for idx in range(1, len(mono)):
            if mono[idx] > mono[idx - 1]:
                mono[idx] = mono[idx - 1]
        if end_sea:
            mono[-1] = min(mono[-1], -2.5)
        for p, target_v in zip(pts[1:], mono[1:]):
            pi, pj = int(round(p[0])), int(round(p[1]))
            if inner[pj, pi] and (pi, pj) != FARPORT_NEW_PX:
                if not whas2[pj, pi]:
                    En[pj, pi] = min(float(En[pj, pi]), max(2.5, target_v))

    rmap = {str(rv['id']): rv for rv in D['rivers']}
    extended_ids = []

    # --- Extend Trunk Rivers to New Sea ---
    # 1) r002 Līng-Mā: keep points up to (300.0, 586.4) before old submerged estuary tail, then meander to (245.5, 586.4)
    r002 = rmap['r002']
    keep_002 = [p for p in r002['px'] if p[0] >= 299.5]
    ext_002 = route_piedmont_river(
        En,
        [tuple(keep_002[-1]), (287.5, 591.2), (274.0, 584.6), (260.5, 589.0), (251.5, 587.6), (245.6, 586.4)],
        joint_field, bend_amp=1.35, seed=2,
    )
    pts_002 = snap_to_sea(keep_002[:-1] + ext_002)
    enforce_monotone_bed(ext_002, end_sea=True)
    r002['px'] = pts_002
    r002['to'] = {'sea': 'ocean', 'at_px': pts_002[-1]}
    extended_ids.append('r002')

    trunk_specs = [
        ('r061', [(299.5, 476.8), (291.5, 475.8)], 0.85, 61),
        ('r120', [(296.0, 488.8), (284.0, 487.5)], 0.95, 120),
        ('r175', [(295.0, 511.8), (277.0, 517.8), (263.5, 513.5), (253.0, 515.4)], 1.35, 175),   # Y=515 Border Trunk!
        ('r113', [(293.5, 532.8), (273.5, 529.8), (252.0, 534.8)], 1.25, 113),
        ('r089', [(291.0, 544.0), (271.0, 552.5), (250.0, 552.8)], 1.35, 89),
        ('r078', [(286.0, 563.5), (267.5, 566.2), (249.0, 568.2)], 1.20, 78),
    ]
    for rid, mid_wps, b_amp, sd in trunk_specs:
        rv = rmap[rid]
        p_end = tuple(rv['px'][-1])
        ext = route_piedmont_river(En, [p_end] + mid_wps, joint_field, bend_amp=b_amp, seed=sd)
        merged = snap_to_sea(rv['px'][:-1] + ext)
        enforce_monotone_bed(ext, end_sea=True)
        rv['px'] = merged
        rv['to'] = {'sea': 'ocean', 'at_px': merged[-1]}
        if rid in ('r175', 'r089'):
            rv['order'] = max(int(rv.get('order') or 1), 2)
        extended_ids.append(rid)

    # --- Route Neighboring Mountain Creeks into Curved Dendritic Y-Confluences! ---
    trib_joins = [
        # (child_id, parent_id, join_idx_from_end_or_frac, mid_offset, seed)
        ('r234', 'r175', 0.28, (-4.5, -1.8), 234),   # joins Y=515 border river in upper piedmont
        ('r196', 'r175', 0.56, (-7.5, -2.5), 196),   # curves SSW across Spear-Queen border marshes into r175!
        ('r148', 'r089', 0.30, (-4.0, 1.5), 148),    # joins r089 cleanly
        ('r130', 'r089', 0.62, (-7.0, 2.2), 130),    # curves NW across kelp hills into r089!
    ]
    for cid, pid, jfrac, (ox, oy), sd in trib_joins:
        crv = rmap[cid]
        prv = rmap[pid]
        # Find where extension started on parent (x <= 309)
        p_ext_pts = [p for p in prv['px'] if p[0] <= 309.5]
        j_idx = min(len(p_ext_pts) - 3, max(2, int(round(jfrac * len(p_ext_pts)))))
        j_pt = tuple(p_ext_pts[j_idx])
        c_end = tuple(crv['px'][-1])
        mid_pt = (0.52 * c_end[0] + 0.48 * j_pt[0] + ox * 0.25, 0.52 * c_end[1] + 0.48 * j_pt[1] + oy)
        ext_c = route_piedmont_river(En, [c_end, mid_pt, j_pt], joint_field, bend_amp=0.95, seed=sd)
        enforce_monotone_bed(ext_c, end_sea=False)
        crv['px'] = crv['px'][:-1] + ext_c
        crv['to'] = {'river': pid, 'name': prv.get('name', ''), 'at_px': list(j_pt)}
        extended_ids.append(cid)

    # --- Add 2 Short Dendritic 1st-Order Coastal Forks on the Broadened Foreland (9134, 9135) ---
    new_forks = []
    fork_specs = [
        (9134, 'Sfīra-Vēli', 'r175', 0.72, [(276.5, 502.5), (266.5, 508.5)], 9134),   # Spear-Queen raid-glen fork into Y=515 river
        (9135, 'Hāi-Wān-Kē', 'r002', 0.68, [(274.5, 576.0), (263.5, 581.5)], 9135),   # North-bank kelp creek into Līng-Mā above Farport
    ]
    for fid, fname, pid, jfrac, head_wps, sd in fork_specs:
        prv = rmap[pid]
        p_ext_pts = [p for p in prv['px'] if p[0] <= 298.0]
        j_idx = min(len(p_ext_pts) - 3, max(2, int(round(jfrac * len(p_ext_pts)))))
        j_pt = tuple(p_ext_pts[j_idx])
        f_pts = route_piedmont_river(En, head_wps + [j_pt], joint_field, bend_amp=0.9, seed=sd)
        enforce_monotone_bed(f_pts, end_sea=False)
        f_km = round(2.0 * sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(f_pts, f_pts[1:])), 1)
        rec = {
            'id': fid, 'name': fname, 'order': 1, 'km': f_km, 'px': f_pts,
            'to': {'river': pid, 'name': prv.get('name', ''), 'at_px': list(j_pt)},
        }
        D['rivers'].append(rec)
        new_forks.append(rec)

    if PREVIEW_PNG:
        # Render crisp diagnostic preview map of Yonni + Extended Farside + Farport
        vy0, vy1, vx0, vx1 = 405, 635, 195, 375
        scale = 4
        H_v, W_v = (vy1 - vy0) * scale, (vx1 - vx0) * scale
        sub_h = En[vy0:vy1, vx0:vx1]
        sub_w = whas2[vy0:vy1, vx0:vx1]
        sub_w0 = whas0[vy0:vy1, vx0:vx1]
        rgb = np.zeros((vy1 - vy0, vx1 - vx0, 3), dtype=np.uint8)
        # Water
        rgb[sub_w] = [24, 54, 82]
        # Shallow shelf
        rgb[sub_w & (sub_h > -90)] = [36, 78, 110]
        # Land elevation ramp
        land = ~sub_w
        rgb[land & (sub_h <= 65)] = [118, 152, 96]       # <65m tsunami scour bench
        rgb[land & (sub_h > 65) & (sub_h <= 350)] = [74, 126, 76]
        rgb[land & (sub_h > 350) & (sub_h <= 1000)] = [98, 132, 74]
        rgb[land & (sub_h > 1000) & (sub_h <= 2200)] = [142, 132, 92]
        rgb[land & (sub_h > 2200)] = [178, 166, 148]
        # Hillshade
        gy_s, gx_s = np.gradient(sub_h)
        shade = np.clip(0.75 + 0.25 * (-gx_s * 0.7 - gy_s * 0.7) / (np.hypot(gx_s, gy_s) + 45.0), 0.52, 1.25)
        rgb = np.clip(rgb.astype(float) * shade[..., None], 0, 255).astype(np.uint8)

        im = Image.fromarray(rgb).resize((W_v, H_v), Image.Resampling.BILINEAR)
        from PIL import ImageDraw
        drw = ImageDraw.Draw(im)
        # Draw old shoreline dashed
        for y_i in range(vy0, vy1 - 1, 2):
            ox_i = x_old_1d[y_i]
            if vx0 <= ox_i <= vx1 and 468 <= y_i <= 605:
                drw.line([((ox_i - vx0) * scale, (y_i - vy0) * scale),
                          ((x_old_1d[y_i + 1] - vx0) * scale, (y_i + 1 - vy0) * scale)],
                         fill=(255, 190, 90), width=2)
        # Draw Y = 515 Spear-Queen / Eternian border
        by = (515.0 - vy0) * scale
        drw.line([((245 - vx0) * scale, by), ((335 - vx0) * scale, by)], fill=(235, 85, 85), width=3)
        # Draw rivers
        for rv in D['rivers']:
            pts = rv.get('px') or []
            if any(vx0 <= px <= vx1 and vy0 <= py <= vy1 for px, py in pts):
                xy = [((px - vx0) * scale, (py - vy0) * scale) for px, py in pts]
                rid_s = str(rv['id'])
                col_r = (95, 220, 255) if (rid_s in extended_ids or rid_s in ('9134', '9135')) else (70, 155, 210)
                w_r = 3 if rid_s in ('r002', 'r175', 'r089') else 2
                drw.line(xy, fill=col_r, width=w_r, joint='curve')
        # Markers: Yonni & New Farport & Old Farport
        for nm_m, (mx, my), col_m in [('Yonni (346,418)', (346, 418), (255, 120, 140)),
                                      ('NEW Farport (248,585)', FARPORT_NEW_PX, (255, 225, 75)),
                                      ('old Farport', (294, 588), (180, 180, 180))]:
            sx_m, sy_m = (mx - vx0) * scale, (my - vy0) * scale
            drw.ellipse([sx_m - 5, sy_m - 5, sx_m + 5, sy_m + 5], fill=col_m, outline=(20, 20, 20), width=2)
            drw.text((sx_m + 8, sy_m - 6), nm_m, fill=(255, 255, 255))
        im.save(PREVIEW_PNG)
        print('Saved preview:', PREVIEW_PNG, 'emerged_km2:', int(newly_emerged.sum()) * 4)
        return

    # ---- 3. Climate, Paint & Raster Integrity Checks
    L_KEYS = ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc')
    raw0 = {k: P.raster(D, k, 'L' if k in L_KEYS else 'RGB') for k in ('h', 'wl', 'wd', 'st', 't', 'rt', 'ct') + L_KEYS}

    water2 = whas2.copy()
    moved = (En != Eo) | (whas2 != whas0)
    assert not (moved & ~inner).any(), 'a moved cell lies outside Farside inner mask!'

    rep['moved_cells'] = int(moved.sum())
    rep['emerged_cells'] = int(newly_emerged.sum())
    rep['emerged_km2'] = int(newly_emerged.sum()) * 4
    rep['drowned_cells'] = int(newly_drowned.sum())
    rep['farport_old_px'] = [294, 588]
    rep['farport_new_px'] = list(FARPORT_NEW_PX)
    rep['farport_new_elev_m'] = round(float(En[FARPORT_NEW_PX[1], FARPORT_NEW_PX[0]]), 1)
    rep['harbour_new_px'] = list(HARBOUR_NEW_PX)
    rep['border_y515_width_km'] = round(2.0 * float((~whas2[515, 240:322]).sum()), 1)

    lapsed = C.lapse(D, Eo, En, whas0, wlev0, whas2, wlev2)
    for k, v in lapsed.items():
        arr = P.raster({k: v}, k, 'L')
        arr[~own] = raw0[k][~own]
        D[k] = P.b64(Image.fromarray(arr, 'L'), optimize=True)

    rain2, cls2, zon2, _, crep = C.reclimate(D, Eo, En, whas0, newly_drowned)
    sea_cls = int(raw0['c'][550, 220])
    sea_zon = int(raw0['z'][550, 220])
    # Wet Farside kelp-coast climate class (Af / Cfa from existing low Farside coast at 304, 560)
    land_cls_low = int(codes.index('Af')) if 'Af' in codes else int(codes.index('Cfa'))
    land_cls_mid = int(codes.index('Cfa'))
    land_zon = int(raw0['z'][562, 298])
    cls2[newly_drowned] = sea_cls
    zon2[newly_drowned] = sea_zon
    cls2[newly_emerged] = np.where(En[newly_emerged] < 380.0, land_cls_low, land_cls_mid)
    zon2[newly_emerged] = land_zon

    # Ensure super-humid onshore Farside rain (2,400-3,500 mm/yr per biomes/farside/PLAN.md §1) across newly emerged foreland
    rain_boost = np.clip(3350.0 - 0.55 * np.maximum(0.0, En), 2150.0, 3550.0)
    rain2 = np.where(newly_emerged, np.maximum(rain2, rain_boost), rain2)

    rain0_f = raw0['p'].astype(float) / 255.0 * 4000.0
    rain_u8 = np.where(own, np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), raw0['p'])
    cls_u8 = np.where(own, cls2.astype(np.uint8), raw0['c'])
    zon_u8 = np.where(own, zon2.astype(np.uint8), raw0['z'])
    rep['reclimate'] = crep

    D['h'] = P.encode_heights(D, En, water2)
    D['wl'] = P.encode_levels(D, whas2, wlev2)
    D['p'] = P.b64(Image.fromarray(rain_u8, 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls_u8, 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon_u8, 'L'), optimize=True)

    rain_now = P.raster(D, 'p', 'L').astype(float) / 255.0 * 4000.0
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0_f), PA.ramp(rain_now), own & (np.abs(rain_now - rain0_f) > 1.0))
    col = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cls_u8], own & (cls_u8 != raw0['c']))

    # Paint newly emerged Farside kelp-coast & scour strand from existing Farside low-elevation coast donor
    sea_donor = whas0 & (np.hypot(xx - 225.0, yy - 555.0) < 10.0)
    kelp_donor = ~whas0 & (Eo > 15.0) & (Eo < 450.0) & (xx >= 292) & (xx <= 318) & (yy >= 500) & (yy <= 592)
    for k in ('st', 't'):
        a = P.raster(D, k).astype(float)
        sea_rgb = np.median(raw0[k][sea_donor], axis=0)
        kelp_rgb = np.median(raw0[k][kelp_donor], axis=0)
        # Subtle texture grain so emerged land never looks flat
        grain = 1.0 + 0.055 * n_fine[..., None]
        w_sea = np.clip(nd.gaussian_filter(newly_drowned.astype(float), 0.65) * 1.35, 0.0, 1.0)[..., None] * own[..., None]
        w_lnd = np.clip(nd.gaussian_filter(newly_emerged.astype(float), 0.75) * 1.35, 0.0, 1.0)[..., None] * own[..., None]
        a = a * (1.0 - w_sea) + sea_rgb * w_sea
        a = a * (1.0 - w_lnd) + (kelp_rgb * grain) * w_lnd
        D[k] = P.jpeg_like(D, k, np.clip(a, 0, 255).round().astype(np.uint8))

    relit, EoF, EnF = PA.relight(D, Eo, En)
    for k, v in relit.items():
        D[k] = v

    near = nd.binary_dilation(moved, iterations=3) & own
    for k in ('st', 't'):
        a = P.raster(D, k)
        a = PA.retint(a, EoF, EnF, near & ~whas2, ~near & ~whas2, 160.0)
        D[k] = P.jpeg_like(D, k, a)
        im = Image.fromarray(P.raster(D, k))
        over = Image.new('RGBA', im.size, (0, 0, 0, 0))
        from PIL import ImageDraw, ImageFilter
        drw = ImageDraw.Draw(over)
        rcol = (54, 106, 132, 165) if k == 'st' else (63, 111, 134, 185)
        for rid_d in extended_ids:
            drw.line([tuple(p) for p in rmap[rid_d]['px'][-35:]], fill=rcol, width=1, joint='curve')
        for rec in new_forks:
            drw.line([tuple(p) for p in rec['px']], fill=rcol, width=1, joint='curve')
        over = over.filter(ImageFilter.GaussianBlur(0.45))
        comp = np.array(Image.alpha_composite(im.convert('RGBA'), over).convert('RGB'))
        orig_after = np.array(im)
        comp = np.where(own[..., None], comp, orig_after)
        D[k] = P.jpeg_like(D, k, comp)

    dc = Counter(cls_u8.ravel().tolist())
    for pr in D['climate']['present']:
        k_i = codes.index(pr['code'])
        pr['km2'] = int(dc.get(k_i, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(k_i, 0) / cls_u8.size, 2)

    # Update DATA.tsunami_farside
    D['tsunami_farside']['farport_px'] = list(FARPORT_NEW_PX)
    D['tsunami_farside']['farport_elev_m'] = 212.0
    D['tsunami_farside']['harbour_px'] = list(HARBOUR_NEW_PX)
    D['tsunami_farside']['harbour_wlev_m'] = 0.0

    outside = ~own
    for k in ('h', 'wl', 'wd') + L_KEYS:
        a = P.raster(D, k, 'L' if k in L_KEYS else 'RGB')
        diff = (a != raw0[k]) if a.ndim == 2 else np.any(a != raw0[k], -1)
        assert not (diff & outside).any(), f'{k} changed outside Farside own cells!'

    # ---- 4. Update 51-region-store.js & 60-settlements.js
    reg_updates = {
        'rmuqm7asgyd3l': FARSIDE_BIO_NEW_PTS,
        'rmudguq9iy9hl': FARSIDE_GEO_NEW_PTS,
        'rmvg89rejmqat': ETERNAL_NEW_PTS,
        'rmudf5uhv8djk': NWOCEAN_NEW_PTS,
        'rmw4wknusgc7h': CROOKSHORE_NEW_PTS,
    }
    s51_new = s51_txt
    for rid_u, npts in reg_updates.items():
        pat_r = re.compile(r'(\{"id": "' + re.escape(rid_u) + r'", "name": "[^"]*", "color": "[^"]*", "points": )(\[\[.*?\]\])(, "notes": )')
        m_r = pat_r.search(s51_new)
        assert m_r, f'Region {rid_u} not found in 51-region-store.js'
        s51_new = s51_new[:m_r.start(2)] + json.dumps(npts) + s51_new[m_r.end(2):]

    hook = "      if(localStorage.getItem('krator.regMerged.5.1e1')!=='1'){"
    if "krator.regMerged.5.1e21" not in s51_new:
        i_h = s51_new.index(hook)
        j_h = s51_new.index('      }\n', i_h) + len('      }\n')
        ids_js = ', '.join(f'"{k}"' for k in reg_updates)
        block = (
            "      if(localStorage.getItem('krator.regMerged.5.1e21')!=='1'){   // 5.1 edit 21: Farside & Farport seaward extension + Y=515 Spear-Queen frontier\n"
            f"        [{ids_js}].forEach(id=>{{ const d=defMap.get(id); if(d) regions.set(id,d); }});\n"
            "        localStorage.setItem('krator.regMerged.5.1e21','1');\n"
            "        localSave();\n"
            "      }\n"
        )
        s51_new = s51_new[:j_h] + block + s51_new[j_h:]

    sett_path = os.path.join(SRC, '60-settlements.js')
    s60_txt = open(sett_path, encoding='utf-8', newline='').read()
    m_fp = re.search(r'\{"id": "sakq13nyhr", "name": "Farport",[^}]*\}', s60_txt)
    assert m_fp, 'sakq13nyhr (Farport) not found in 60-settlements.js'
    fp_old_obj = json.loads(m_fp.group(0))
    fp_new_obj = dict(fp_old_obj)
    fp_new_obj['px'] = FARPORT_NEW_PX[0]
    fp_new_obj['py'] = FARPORT_NEW_PX[1]
    fp_new_obj['notes'] = (
        'Farport (Eternal State ocean port; relocated onto the extended Farside Promontory at +212 m above the 100 m '
        'tsunami ceiling, overlooking Līng-Mā\'s drowned lower harbour at 243,586; 5.1 edit 21).'
    )
    # Replace first occurrence in defSetts
    s60_new = s60_txt[:m_fp.start()] + json.dumps(fp_new_obj, ensure_ascii=False) + s60_txt[m_fp.end():]
    if "'5.1e21':" not in s60_new:
        m_mov = re.search(r"(const SETT_MOVED=\{\n(?:.*\n)*?)(  \};\n)", s60_new)
        assert m_mov, 'SETT_MOVED not found in 60-settlements.js'
        body_m = m_mov.group(1).rstrip('\n')
        s60_new = s60_new[:m_mov.start(1)] + body_m + ",\n    '5.1e21':[" + json.dumps(fp_new_obj, ensure_ascii=False) + "]\n" + m_mov.group(2) + s60_new[m_mov.end(2):]

    rep['extended_rivers'] = extended_ids
    rep['new_rivers'] = [r['id'] for r in new_forks]

    if DRY:
        print(json.dumps(rep, indent=1, ensure_ascii=False))
        return

    P.save(D)
    with open(os.path.join(SRC, '51-region-store.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(s51_new)
    with open(sett_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(s60_new)
    with open(os.path.join(HERE, 'edit_521_farside.report.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(rep, f, indent=1, ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))


if __name__ == '__main__':
    main()
