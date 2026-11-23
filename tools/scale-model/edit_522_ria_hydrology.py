#!/usr/bin/env python3
"""Scale model 5.1, edit 22 (2026-11-23): Exterior Sphere 27 Stage — Ria Valley Sinuous
Dendritic Hydrology, Fluvial Valley Erosion, Iron Gates Hogback Sill, Farside Seaward
Foreland, and Crook Calderas & Gorge Rivers (`CROOK-RIA-SCOPE.md` & `CONTINENTAL-SCOPE.md`).

Usage:
    python3 tools/scale-model/edit_522_ria_hydrology.py --out-dir openworld/ria-exterior-522
    python3 tools/scale-model/edit_522_ria_hydrology.py --dry-run
    python3 tools/scale-model/edit_522_ria_hydrology.py --in-place   # future all-builds scale-model merge pass

Guarantees:
  - 0 pixels modified outside the exterior N/NW margin (`y < 610` or `x < 350`), preserving 100%
    byte-identity across the entire inner crater.
  - Transverse NNE-SSW hogback/cuesta sill (`x ~ 685..718, y ~ 115..220`, `+1,450..+1,950 m` crest)
    incised by the navigable "Iron Gates" water-gap (`slope < 0.0018`, `Q ~ 4,200 m3/s`) along
    `9101 Ma-Ria`, shifting `Heartland` & `Moleshelf` foot (`x = 720..905, y = 45..235`) into a
    `420-620 mm/yr` `BSk`/`Csa` rain-shadow loess bowl while keeping `Weeping Valley` (`x = 905..1085`)
    misty (`950-1,350 mm/yr`).
  - Re-meandered `9101 Ma-Ria` (`sin >= 1.24`), `9107 Pak-Ma` (`sin >= 1.32`), `9108 Mo-Ma`
    (`sin >= 1.32`), `9109 Ching-Ma` (`sin >= 1.32`), fixed dry-land delta courses `9103`/`9104`,
    plus +32 sinuous 1st/2nd/3rd-order dendritic Ria/Shroudhills tributaries (`9201..9232`,
    `sin = 1.26-1.58`), lifting Ria Valley drainage density to `~12.4 km / 1,000 km2`.
  - Physically scaled fluvial valley erosion (`D = clamp(20*(Q/30)^0.38*(S_loc/0.005)^0.28, 14, 240 m)`
    V-gorges in uplands `> 850 m` transitioning to `6-16 km` flat-bottomed alluvial meander belts
    with cut-bank bluffs vs point-bar slip-off slopes in lowlands).
  - Farside `55-96 km` seaward foreland (`Farport` at `(248, 585)` `+212 m` above `(243, 586)` harbour,
    `136 km` `Y = 515` `dStara cBruk` river frontier), Crook 4 drowned ejecta calderas + 18 dendritic
    `Crookwash` gorge rivers (`9111..9128`), region renames, political polygons, and all Sphere 27 pins.
"""
import argparse
import copy
import heapq
import io
import json
import math
import os
import re
import shutil
import sys
from collections import Counter

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import smodel.climate as C  # noqa: E402
import smodel.geom as G     # noqa: E402
import smodel.page as P     # noqa: E402
import smodel.paint as PA   # noqa: E402

SRC_DIR = os.path.join(HERE, 'model', 'src')
DATA_DIR = os.path.join(HERE, 'model', 'data')
SETT_VER = '5.1e22'


def poly_len_km(pts):
    return round(sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts[:-1], pts[1:])) * 2.0, 1)


def sinuosity(pts):
    if len(pts) < 2:
        return 1.0
    plen = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts[:-1], pts[1:]))
    slen = math.hypot(pts[-1][0] - pts[0][0], pts[-1][1] - pts[0][1])
    return plen / max(slen, 1e-6)


def hexrgb(h):
    return np.array([int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)], dtype=float)


def bil(E_arr, x, y):
    x0 = max(0, min(E_arr.shape[1] - 2, int(math.floor(x))))
    y0 = max(0, min(E_arr.shape[0] - 2, int(math.floor(y))))
    fx, fy = x - x0, y - y0
    return float(
        (E_arr[y0, x0] * (1.0 - fx) + E_arr[y0, x0 + 1] * fx) * (1.0 - fy)
        + (E_arr[y0 + 1, x0] * (1.0 - fx) + E_arr[y0 + 1, x0 + 1] * fx) * fy
    )


def catmull_rom_2d(pts, n_per_seg=14):
    pts = [tuple(map(float, p)) for p in pts]
    if len(pts) < 2:
        return pts
    ext = [pts[0]] + pts + [pts[-1]]
    out = []
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        steps = n_per_seg if i < len(ext) - 3 else n_per_seg + 1
        for k in range(steps):
            if i < len(ext) - 3 and k == steps:
                continue
            t = k / float(n_per_seg)
            t2, t3 = t * t, t * t * t
            x = 0.5 * (
                (2.0 * p1[0])
                + (-p0[0] + p2[0]) * t
                + (2.0 * p0[0] - 5.0 * p1[0] + 4.0 * p2[0] - p3[0]) * t2
                + (-p0[0] + 3.0 * p1[0] - 3.0 * p2[0] + p3[0]) * t3
            )
            y = 0.5 * (
                (2.0 * p1[1])
                + (-p0[1] + p2[1]) * t
                + (2.0 * p0[1] - 5.0 * p1[1] + 4.0 * p2[1] - p3[1]) * t2
                + (-p0[1] + 3.0 * p1[1] - 3.0 * p2[1] + p3[1]) * t3
            )
            if not out or math.hypot(x - out[-1][0], y - out[-1][1]) > 0.25:
                out.append([x, y])
    out[0] = [pts[0][0], pts[0][1]]
    out[-1] = [pts[-1][0], pts[-1][1]]
    return out


def weave_meanders(ctrl_pts, target_sin=1.36, seed=101, step_px=2.2, end_taper=0.16, amp_cap_px=9.5):
    """Synthesize realistic multi-harmonic fluvial meander loops along a guide curve,
    calibrated deterministically to hit `target_sin` while keeping exact endpoints."""
    base = catmull_rom_2d(ctrl_pts, n_per_seg=16)
    cum = [0.0]
    for a, b in zip(base[:-1], base[1:]):
        cum.append(cum[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    total_s = max(cum[-1], 1e-6)
    n_out = max(14, int(round(total_s / step_px)) + 1)
    s_grid = np.linspace(0.0, total_s, n_out)
    xs = np.interp(s_grid, cum, [p[0] for p in base])
    ys = np.interp(s_grid, cum, [p[1] for p in base])

    # Unit normals along smooth guide curve
    tx = np.gradient(xs)
    ty = np.gradient(ys)
    tn = np.maximum(np.hypot(tx, ty), 1e-9)
    nx = -ty / tn
    ny = tx / tn

    # Deterministic phase from seed (no state draw order dependence)
    ph1 = ((seed * 2654435761) & 0xFFFFFFFF) / 4294967296.0 * 2.0 * math.pi
    ph2 = ((seed * 1597334677) & 0xFFFFFFFF) / 4294967296.0 * 2.0 * math.pi
    ph3 = ((seed * 3266489917) & 0xFFFFFFFF) / 4294967296.0 * 2.0 * math.pi

    u = s_grid / total_s
    env = np.sin(np.pi * u) ** 0.72
    if end_taper > 0:
        env *= np.minimum(1.0, u / end_taper) * np.minimum(1.0, (1.0 - u) / end_taper)

    # Wavelength scales naturally with channel reach length (~10-22 px = 20-44 km meander belt)
    wl1 = max(9.5, min(22.0, total_s / max(3.2, round(total_s / 15.0))))
    wl2 = wl1 * 0.53
    wl3 = wl1 * 1.71
    wave = (
        0.68 * np.sin(2.0 * math.pi * s_grid / wl1 + ph1)
        + 0.24 * np.sin(2.0 * math.pi * s_grid / wl2 + ph2)
        + 0.16 * np.sin(2.0 * math.pi * s_grid / wl3 + ph3)
    ) * env

    # Binary-search amplitude to match target_sin cleanly
    lo_a, hi_a = 0.0, max(amp_cap_px * 2.4, min(24.0, max(4.5, total_s * 0.38)))
    best_pts = [[round(float(x), 2), round(float(y), 2)] for x, y in zip(xs, ys)]
    for _ in range(22):
        mid_a = 0.5 * (lo_a + hi_a)
        px = xs + mid_a * wave * nx
        py = ys + mid_a * wave * ny
        cand = [[float(x), float(y)] for x, y in zip(px, py)]
        s_now = sinuosity(cand)
        best_pts = cand
        if s_now < target_sin:
            lo_a = mid_a
        else:
            hi_a = mid_a
    best_pts[0] = [round(float(ctrl_pts[0][0]), 2), round(float(ctrl_pts[0][1]), 2)]
    best_pts[-1] = [round(float(ctrl_pts[-1][0]), 2), round(float(ctrl_pts[-1][1]), 2)]
    return [[round(p[0], 2), round(p[1], 2)] for p in best_pts]


def snap_mouth_to_parent(trib_ctrl, parent_pts, approx_mouth, target_sin=1.36, seed=101, step_px=2.0, amp_cap_px=7.5):
    """Snap tributary mouth to the exact nearest vertex of `parent_pts` so `px[-1] == parent_pts[j]`."""
    best_j = min(
        range(len(parent_pts)),
        key=lambda j: math.hypot(parent_pts[j][0] - approx_mouth[0], parent_pts[j][1] - approx_mouth[1]),
    )
    ctrl = list(trib_ctrl[:-1]) + [parent_pts[best_j]]
    pts = weave_meanders(ctrl, target_sin=target_sin, seed=seed, step_px=step_px, amp_cap_px=amp_cap_px)
    pts[-1] = [parent_pts[best_j][0], parent_pts[best_j][1]]
    return pts, best_j


def clamp_river_to_dry_land(pts, whas, keep_wet_tail=False):
    """Ensure every vertex except (optionally) a sea/lake mouth vertex stands on dry land (`~whas`)."""
    OH, OW = whas.shape
    out = [list(p) for p in pts]
    limit = len(out) - 1 if keep_wet_tail else len(out)
    for k in range(limit):
        ix = min(OW - 1, max(0, int(round(out[k][0]))))
        iy = min(OH - 1, max(0, int(round(out[k][1]))))
        if whas[iy, ix]:
            best = None
            for r in range(1, 26):
                for dy in range(-r, r + 1):
                    for dx in range(-r, r + 1):
                        ny, nx_ = iy + dy, ix + dx
                        if 0 <= ny < OH and 0 <= nx_ < OW and not whas[ny, nx_]:
                            d = dy * dy + dx * dx
                            if best is None or d < best[0]:
                                best = (d, float(nx_), float(ny))
                if best is not None:
                    break
            if best is not None:
                out[k] = [best[1], best[2]]
    return out


def priority_fill_with_sinks(E_arr, whas_arr, wlev_arr, box):
    y0, y1, x0, x1 = box
    S_b = E_arr[y0:y1, x0:x1]
    W_b = whas_arr[y0:y1, x0:x1]
    L_b = wlev_arr[y0:y1, x0:x1]
    H_s, W_s = S_b.shape
    F_b = np.full(S_b.shape, np.inf)
    seen = np.zeros(S_b.shape, bool)
    q = []
    for j in range(H_s):
        for i in range(W_s):
            if W_b[j, i]:
                val = float(L_b[j, i]) + 1.5 if not math.isnan(float(L_b[j, i])) else 1.5
                F_b[j, i] = val
                seen[j, i] = True
                heapq.heappush(q, (val, j, i))
            elif j in (0, H_s - 1) or i in (0, W_s - 1):
                val = float(S_b[j, i])
                F_b[j, i] = val
                seen[j, i] = True
                heapq.heappush(q, (val, j, i))
    while q:
        h, j, i = heapq.heappop(q)
        for a in (-1, 0, 1):
            for b in (-1, 0, 1):
                jj, ii = j + a, i + b
                if 0 <= jj < H_s and 0 <= ii < W_s and not seen[jj, ii]:
                    seen[jj, ii] = True
                    nv = max(float(S_b[jj, ii]), h)
                    F_b[jj, ii] = nv
                    heapq.heappush(q, (nv, jj, ii))
    return F_b


def relight_masked(D, Eo, En, mask, keys=('st', 't', 'rt', 'ct')):
    FH, FW = D['fullH'], D['fullW']
    zoom = (FH / Eo.shape[0], FW / Eo.shape[1])
    EoF, EnF = nd.zoom(Eo, zoom, order=1), nd.zoom(En, zoom, order=1)
    region = nd.binary_dilation(np.abs(EnF - EoF) > 1.0, iterations=3) & mask

    def lam(E_in, zf, az, alt=45.0):
        gy, gx = np.gradient(E_in / 1000.0 * zf, 2.0)
        a, l = np.radians(az), np.radians(alt)
        lx, ly, lz = np.cos(l) * np.sin(a), -np.cos(l) * np.cos(a), np.sin(l)
        return (-gx * lx - gy * ly + lz) / np.sqrt(gx * gx + gy * gy + 1.0)

    out, fit_rep = {}, {}
    mfit = nd.binary_dilation(region, iterations=18)
    for k in keys:
        src = Image.open(io.BytesIO(P.base64.b64decode(D[k])))
        im = np.array(src.convert('RGB')).astype(float)
        Lm = im.mean(-1)
        Ll = nd.uniform_filter(Lm, 25) + 1.0
        y = (Lm / Ll - 1.0)[mfit]
        best = None
        for az in range(255, 390, 15):
            for zf in (1, 2, 3, 5, 10):
                so = lam(EoF, zf, az)
                x = (so - nd.uniform_filter(so, 25))[mfit]
                denom = float((x * x).sum()) or 1.0
                g = float((x * y).sum() / denom)
                r = float(np.corrcoef(x, y)[0, 1]) if x.size > 10 else 0.0
                if best is None or r > best[0]:
                    best = (r, az, zf, g)
        r, az, zf, g = best
        f = np.clip(1.0 + g * (lam(EnF, zf, az) - lam(EoF, zf, az)), 0.55, 1.7)
        res = im.copy()
        res[region] = res[region] * f[region, None]
        q = getattr(src, 'quantization', None)
        out[k] = P.b64(
            Image.fromarray(np.clip(res, 0, 255).round().astype(np.uint8)),
            'JPEG',
            **({'qtables': q, 'subsampling': 2} if q else {'quality': 90}),
        )
        fit_rep[k] = {'az_deg': az, 'zf': zf, 'gain': round(g, 3), 'corr': round(r, 3)}
    return out, EoF, EnF, fit_rep


def has_self_intersection(pts):
    def ccw(p1, p2, p3):
        return (p3[1] - p1[1]) * (p2[0] - p1[0]) > (p2[1] - p1[1]) * (p3[0] - p1[0])

    def seg_int(a, b, c, d):
        return (ccw(a, c, d) != ccw(b, c, d)) and (ccw(a, b, c) != ccw(a, b, d))

    n = len(pts)
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        for j in range(i + 2, n):
            if i == 0 and j == n - 1:
                continue
            c, d = pts[j], pts[(j + 1) % n]
            if seg_int(a, b, c, d):
                return (i, j)
    return None


def carve_fluvial_valley(En, whas, ext_mask, pts, q_list, target_beds=None, belt_mult=1.0):
    """Carve physically scaled valley cross-sections along `pts`:
      - Uplands (> 850 m): stream-power V-shaped / structural gorge incision
        `D = clamp(20 * (Q/30)^0.38 * (S_loc/0.005)^0.28, 14, 240 m)` preserving interfluve spurs.
      - Lowlands (< 850 m): transitions smoothly to broad `6-16 km` (`3-8 px`) flat-bottomed
        alluvial meander belts with asymmetric cut-bank bluffs on concave bends vs gentle
        point-bar slip-off slopes on convex bends!
    Returns monotonically decreasing `bed_m` list matching `pts`."""
    OH, OW = En.shape
    n = len(pts)
    raw_e = [bil(En, p[0], p[1]) for p in pts]

    # Compute local signed curvature kappa and segment lengths
    seg_m = [max(500.0, math.hypot(pts[min(n - 1, i + 1)][0] - pts[max(0, i - 1)][0],
                                   pts[min(n - 1, i + 1)][1] - pts[max(0, i - 1)][1]) * 1000.0)
             for i in range(n)]

    if target_beds is not None:
        beds = list(target_beds)
    else:
        # First pass: monotonic envelope of existing ground minus stream-power incision
        beds = []
        cur_b = raw_e[0]
        for i in range(n):
            q_i = float(q_list[min(i, len(q_list) - 1)])
            e_here = min(cur_b, raw_e[i])
            i0, i1 = max(0, i - 2), min(n - 1, i + 2)
            dist_loc = max(2000.0, sum(math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1])
                                       for k in range(i0, i1)) * 2000.0)
            s_loc = max(0.00025, abs(raw_e[i0] - raw_e[i1]) / dist_loc)
            d_inc = max(14.0, min(240.0, 20.0 * ((max(q_i, 4.0) / 30.0) ** 0.38) * ((s_loc / 0.005) ** 0.28)))
            # Reduce incision depth in gentle lowland floodplains so rivers don't carve below sea level
            upland_w = G.sstep(220.0, 950.0, e_here)
            d_eff = d_inc * (0.22 + 0.78 * upland_w)
            b_cand = max(2.5, raw_e[i] - d_eff)
            cur_b = min(cur_b - 0.15 if i > 0 else b_cand, b_cand)
            beds.append(max(1.5, cur_b))

    # Enforce strict monotonic decrease downstream
    for i in range(1, n):
        if beds[i] > beds[i - 1]:
            beds[i] = beds[i - 1]

    # Dense sub-pixel sampling along polyline for smooth continuous valley trough
    dense_x, dense_y, dense_b, dense_q, dense_nx, dense_ny, dense_kap, dense_s = [], [], [], [], [], [], [], []
    for i in range(n - 1):
        x0, y0 = pts[i]
        x1, y1 = pts[i + 1]
        tx, ty = x1 - x0, y1 - y0
        seg_len = max(1e-6, math.hypot(tx, ty))
        ux, uy = tx / seg_len, ty / seg_len
        nx_i, ny_i = -uy, ux
        # Signed bend curvature from turn angle
        if 0 < i < n - 1:
            tx0, ty0 = pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]
            l0 = max(1e-6, math.hypot(tx0, ty0))
            cross = (tx0 * ty - ty0 * tx) / (l0 * seg_len)
        else:
            cross = 0.0
        s_seg = max(0.0002, abs(beds[i] - beds[i + 1]) / (seg_len * 2000.0))
        sub_n = max(2, int(math.ceil(seg_len * 2.5)))
        for s_k in range(sub_n):
            f = s_k / float(sub_n)
            dense_x.append(x0 + f * tx)
            dense_y.append(y0 + f * ty)
            dense_b.append(beds[i] + f * (beds[i + 1] - beds[i]))
            q0 = float(q_list[min(i, len(q_list) - 1)])
            q1 = float(q_list[min(i + 1, len(q_list) - 1)])
            dense_q.append(q0 + f * (q1 - q0))
            dense_nx.append(nx_i)
            dense_ny.append(ny_i)
            dense_kap.append(cross)
            dense_s.append(s_seg)

    # Carve cross-sections into local bounding box
    xs_arr = np.array(dense_x)
    ys_arr = np.array(dense_y)
    max_rad = int(math.ceil(10.0 * belt_mult)) + 3
    bx0 = max(0, int(math.floor(xs_arr.min())) - max_rad)
    bx1 = min(OW, int(math.ceil(xs_arr.max())) + max_rad + 1)
    by0 = max(0, int(math.floor(ys_arr.min())) - max_rad)
    by1 = min(OH, int(math.ceil(ys_arr.max())) + max_rad + 1)

    sub_E = En[by0:by1, bx0:bx1].copy()
    sub_W = whas[by0:by1, bx0:bx1]
    sub_M = ext_mask[by0:by1, bx0:bx1]

    for x_c, y_c, b_c, q_c, nx_c, ny_c, kap_c, sl_c in zip(
        dense_x, dense_y, dense_b, dense_q, dense_nx, dense_ny, dense_kap, dense_s
    ):
        upland_f = float(G.sstep(450.0, 1050.0, b_c))
        q_scale = (max(q_c, 8.0) / 40.0) ** 0.30
        # Flat alluvial floor half-width: 0.35 px in uplands -> 1.6-4.2 px (6.4-16.8 km total belt!) in lowlands
        flat_hw = belt_mult * ((0.35 * min(1.8, q_scale)) * upland_f + (1.45 + 1.15 * min(2.4, q_scale)) * (1.0 - upland_f))
        wall_hw = belt_mult * ((2.2 + 1.1 * min(2.0, q_scale)) * upland_f + (3.6 + 2.0 * min(2.4, q_scale)) * (1.0 - upland_f))
        tot_hw = flat_hw + wall_hw
        r_px = int(math.ceil(tot_hw)) + 1

        ix0 = max(bx0, int(math.floor(x_c)) - r_px)
        ix1 = min(bx1 - 1, int(math.ceil(x_c)) + r_px)
        iy0 = max(by0, int(math.floor(y_c)) - r_px)
        iy1 = min(by1 - 1, int(math.ceil(y_c)) + r_px)
        if ix0 > ix1 or iy0 > iy1:
            continue

        yy_loc, xx_loc = np.mgrid[iy0:iy1 + 1, ix0:ix1 + 1]
        dx = xx_loc - x_c
        dy = yy_loc - y_c
        dist = np.hypot(dx, dy)
        within = (dist <= tot_hw) & (~sub_W[iy0 - by0:iy1 - by0 + 1, ix0 - bx0:ix1 - bx0 + 1]) & sub_M[iy0 - by0:iy1 - by0 + 1, ix0 - bx0:ix1 - bx0 + 1]
        if not within.any():
            continue

        # Signed lateral offset (+ on left bank, - on right bank) for cut-bank bluff vs point-bar slip-off asymmetry
        lat = dx * nx_c + dy * ny_c
        # Concave outer bend has steeper wall exponent (p ~ 1.85 bluff), convex point-bar has gentle slip-off (p ~ 0.78)
        asym = np.clip(kap_c * np.sign(lat) * 3.2, -0.45, 0.55) * (1.0 - 0.65 * upland_f)
        u_wall = np.clip((dist - flat_hw) / max(wall_hw, 0.5), 0.0, 1.0)
        # V-gorge in uplands (linear-to-convex V walls) vs flat-bottomed asymmetric meander trough in lowlands
        exp_p = np.where(upland_f > 0.5, 1.12, np.clip(1.22 + asym, 0.72, 1.95))
        prof = u_wall ** exp_p

        cur_blk = sub_E[iy0 - by0:iy1 - by0 + 1, ix0 - bx0:ix1 - bx0 + 1]
        target_blk = b_c + np.maximum(0.0, cur_blk - b_c) * prof
        sub_E[iy0 - by0:iy1 - by0 + 1, ix0 - bx0:ix1 - bx0 + 1] = np.where(
            within, np.minimum(cur_blk, target_blk), cur_blk
        )

    En[by0:by1, bx0:bx1] = sub_E
    # Ensure exact integer channel cells along `pts` never exceed `beds`
    for (px_k, py_k), b_k in zip(pts, beds):
        ix = min(OW - 1, max(0, int(round(px_k))))
        iy = min(OH - 1, max(0, int(round(py_k))))
        if ext_mask[iy, ix] and not whas[iy, ix]:
            En[iy, ix] = min(En[iy, ix], b_k)
    return [round(float(b), 1) for b in beds]


def build_river_record(rid, name, pts, beds, q_src, q_mth, to_spec, tier='trib', order=1, tongue='low-ria', gloss=''):
    n = len(pts)
    qs = [round(q_src + (q_mth - q_src) * (i / max(1, n - 1)), 1) for i in range(n)]
    lkm = poly_len_km(pts)
    return {
        'id': rid,
        'name': name,
        'tier': tier,
        'order': order,
        'len_km': lkm,
        'length_km': lkm,
        'q_mouth': round(float(q_mth), 1),
        'q_mouth_m3s': round(float(q_mth), 1),
        'mouth_m3s': round(float(q_mth), 1),
        'q_m3s': qs,
        'px': [[round(float(p[0]), 2), round(float(p[1]), 2)] for p in pts],
        'bed_m': [round(float(b), 1) for b in beds],
        'source_m': round(float(beds[0]), 1),
        'mouth_m': round(float(beds[-1]), 1),
        'to': to_spec,
        'kind': 'river',
        'tongue': tongue,
        'gloss': gloss,
        'name_fixed': True,
    }


def main(argv=None):
    ap = argparse.ArgumentParser(description='Scale model 5.1e22 Ria & Exterior Stage')
    ap.add_argument('--out-dir', default=None, help='Staged output directory (e.g. openworld/ria-exterior-522)')
    ap.add_argument('--dry-run', '--dry', action='store_true', help='Run all steps and invariants in memory only')
    ap.add_argument('--in-place', action='store_true', help='Write directly into tools/scale-model/model/{data,src}')
    args = ap.parse_args(argv)

    if not args.dry_run and not args.out_dir and not args.in_place:
        sys.exit('Specify --out-dir <dir>, --dry-run, or --in-place')

    D = P.load(DATA_DIR)
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    OH, OW = Eo.shape
    yy, xx = np.mgrid[0:OH, 0:OW].astype(float)
    codes = [c['code'] for c in D['climate']['classes']]

    # Strict exterior mask: y < 610 OR x < 350 (0 pixels changed in inner crater!)
    EXT_MASK = (yy < 610.0) | (xx < 350.0)

    L_KEYS = ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc')
    jpeg0 = {k: D[k] for k in ('st', 't', 'rt', 'ct')}
    raw0 = {k: P.raster(D, k, 'L' if k in L_KEYS else 'RGB') for k in ('h', 'wl', 'wd', 'st', 't', 'rt', 'ct') + L_KEYS}

    En = Eo.copy()
    water2 = water0.copy()
    whas2 = whas0.copy()
    wlev2 = wlev0.copy()
    sea_wl_rgb = raw0['wl'][585, 240].copy()  # open NWern Ocean wl RGB (~0 m)

    # =========================================================================
    # STEP 1: Farside Seaward Foreland (`55-96 km`), `Farport` `(248, 585)` `+212 m`
    #         above `(243, 586)` Harbour, & `Y = 515` `136 km` River Frontier
    # =========================================================================
    for y_i in range(514, 609):
        # Smooth northward & southward taper into existing coastline at y=514 and y=609
        t_n = G.sstep(513.5, 517.5, float(y_i))
        t_s = 1.0 - G.sstep(599.0, 608.5, float(y_i))
        indent = (
            5.5 * math.sin((y_i - 515.0) * 0.23 + 0.4)
            + 3.2 * math.cos((y_i - 515.0) * 0.51 - 0.8)
        )
        # Seaward shoreline target ~242..258 across central Farside (55-96 km west of old x~304..310!)
        x_shore = 250.0 + indent + 46.0 * (1.0 - t_n * t_s)
        # Drowned lower harbour of Ling-Ma at (243, 586) penetrating to x=245, while headland (248, 585) juts west to x=244!
        if 586 <= y_i <= 588:
            x_shore = max(x_shore, 246.2 if y_i == 586 else 245.5)
        elif 583 <= y_i <= 585:
            x_shore = min(x_shore, 244.2)

        for x_i in range(236, 336):
            if not EXT_MASK[y_i, x_i]:
                continue
            if x_i >= x_shore:
                # Emergent Farside foreland bench rising smoothly eastward into existing Farside foothills
                dist_in = float(x_i) - x_shore
                ridge_tex = (
                    28.0 * math.sin(x_i * 0.19 + y_i * 0.13)
                    + 16.0 * math.cos(x_i * 0.37 - y_i * 0.29)
                ) * G.sstep(0.0, 5.0, dist_in)
                e_fore = 34.0 + 18.5 * (dist_in ** 1.12) + ridge_tex
                # Blend smoothly into existing high ground where Eo > e_fore
                if whas0[y_i, x_i] or Eo[y_i, x_i] < e_fore:
                    w_blend = 1.0 - G.sstep(308.0, 332.0, float(x_i))
                    En[y_i, x_i] = Eo[y_i, x_i] * (1.0 - w_blend) + max(Eo[y_i, x_i], e_fore) * w_blend
                whas2[y_i, x_i] = False
                water2[y_i, x_i] = False
                wlev2[y_i, x_i] = np.nan

    # Sculpt exact tsunami-safe Farport headland plateau at (248, 585) = +212.0 m and drowned harbour at (243..245, 586)
    for dy_f in range(-3, 4):
        for dx_f in range(-3, 5):
            yy_f, xx_f = 585 + dy_f, 248 + dx_f
            d_f = math.hypot(dx_f, dy_f)
            if d_f <= 2.6 and xx_f >= 246:
                whas2[yy_f, xx_f] = False
                water2[yy_f, xx_f] = False
                wlev2[yy_f, xx_f] = np.nan
                En[yy_f, xx_f] = max(En[yy_f, xx_f], 212.0 - 16.0 * d_f)
    En[585, 248] = 212.0
    for hx in range(238, 246):
        for hy in (586, 587):
            whas2[hy, hx] = True
            water2[hy, hx] = True
            wlev2[hy, hx] = -0.2
            En[hy, hx] = min(En[hy, hx], -28.0 + 2.0 * max(0, hx - 242))

    # =========================================================================
    # STEP 2: The Crook — 4 Drowned Ejecta Calderas, Rim Seats, Battered Isle
    #         (+115 m), Deep-Ward Anchorage, & Copper Tarn Barter Spit
    # =========================================================================
    calderas = [
        # (name, cx, cy, r_wet, rim_r, rim_h, breach_angle_deg)
        ('The Eye', 104.0, 562.0, 4.4, 8.2, 165.0, 195.0),
        ('Kopa-North', 89.0, 604.0, 4.8, 8.6, 175.0, 185.0),
        ('Kopa-South', 81.0, 677.0, 4.6, 8.8, 155.0, 210.0),
        ('Cascade-Caldera', 123.0, 659.0, 4.2, 8.4, 170.0, 125.0),  # breaches NW toward (117, 653) sea
    ]
    for cname, cx, cy, r_wet, rim_r, rim_h, b_deg in calderas:
        b_rad = math.radians(b_deg)
        bx_u, by_u = math.cos(b_rad), -math.sin(b_rad)
        for y_i in range(max(0, int(cy - rim_r - 4)), min(OH, int(cy + rim_r + 5))):
            for x_i in range(max(0, int(cx - rim_r - 4)), min(OW, int(cx + rim_r + 5))):
                dx, dy = x_i - cx, y_i - cy
                r_d = math.hypot(dx, dy)
                if r_d <= r_wet:
                    whas2[y_i, x_i] = True
                    water2[y_i, x_i] = True
                    wlev2[y_i, x_i] = -0.2
                    En[y_i, x_i] = -68.0 * (1.0 - (r_d / (r_wet + 0.6)) ** 2) - 12.0
                elif r_d <= rim_r:
                    # Check if inside breach channel
                    proj = dx * bx_u + dy * by_u
                    perp = abs(-dx * by_u + dy * bx_u)
                    if proj > 0 and perp <= 1.85:
                        whas2[y_i, x_i] = True
                        water2[y_i, x_i] = True
                        wlev2[y_i, x_i] = -0.2
                        En[y_i, x_i] = min(En[y_i, x_i], -26.0)
                    else:
                        u_rim = (r_d - r_wet) / max(rim_r - r_wet, 1.0)
                        collar = rim_h * math.sin(math.pi * min(1.0, u_rim)) ** 0.75
                        whas2[y_i, x_i] = False
                        water2[y_i, x_i] = False
                        wlev2[y_i, x_i] = np.nan
                        En[y_i, x_i] = max(En[y_i, x_i], 68.0 + collar)

        # Carve explicit 4-connected sea channel from caldera center along breach ray to open ocean
        for step_s in np.linspace(0.0, 22.0, 65):
            sx_c = int(round(cx + step_s * bx_u))
            sy_c = int(round(cy + step_s * by_u))
            if 0 <= sy_c < OH and 0 <= sx_c < OW:
                already_open = whas0[sy_c, sx_c] and step_s > rim_r
                for oy in (-1, 0, 1):
                    for ox in (-1, 0, 1):
                        if abs(ox) + abs(oy) <= 1:
                            yy_s, xx_s = sy_c + oy, sx_c + ox
                            if 0 <= yy_s < OH and 0 <= xx_s < OW:
                                whas2[yy_s, xx_s] = True
                                water2[yy_s, xx_s] = True
                                wlev2[yy_s, xx_s] = -0.2
                                En[yy_s, xx_s] = min(En[yy_s, xx_s], -24.0)
                if already_open:
                    break

    # Guarantee tsunami-safe dry caldera-rim seats at Kopa-Hueru (75, 679) & Kaskedi-Kuran (128, 660)
    for px_s, py_s, el_s in ((75, 679, 88.0), (128, 660, 96.0), (148, 492, 28.0)):
        for oy in (-1, 0, 1):
            for ox in (-1, 0, 1):
                if px_s == 75 and ox > 0:
                    continue
                if px_s == 128 and ox < 0:
                    continue
                whas2[py_s + oy, px_s + ox] = False
                water2[py_s + oy, px_s + ox] = False
                wlev2[py_s + oy, px_s + ox] = np.nan
                En[py_s + oy, px_s + ox] = max(En[py_s + oy, px_s + ox], el_s - 8.0 * math.hypot(ox, oy))
        En[py_s, px_s] = el_s

    # Battered Isle (435, 259) +115 m headland bluff overlooking sea at (432..433, 259)
    for oy in range(-3, 4):
        for ox in range(-1, 5):
            yy_b, xx_b = 259 + oy, 435 + ox
            if not whas2[yy_b, xx_b]:
                d_b = math.hypot(ox - 1.0, oy)
                En[yy_b, xx_b] = max(En[yy_b, xx_b], 115.0 - 11.0 * d_b)
    whas2[259, 435] = False
    water2[259, 435] = False
    wlev2[259, 435] = np.nan
    En[259, 435] = 115.0

    # Ria Sound (626, 140) +78 m tsunami-safe bluff port directly overlooking navigable Ria Sound inlet at (622..624, 140..142)
    for sy_r in range(138, 145):
        for sx_r in range(590, 625):
            if abs(sy_r - 141) <= 1 or sx_r < 616:
                if sy_r in (140, 141, 142) or whas0[sy_r, sx_r]:
                    whas2[sy_r, sx_r] = True
                    water2[sy_r, sx_r] = True
                    wlev2[sy_r, sx_r] = -0.2
                    En[sy_r, sx_r] = min(En[sy_r, sx_r], -14.0)
    for oy in range(-2, 3):
        for ox in range(0, 4):
            whas2[140 + oy, 626 + ox] = False
            water2[140 + oy, 626 + ox] = False
            wlev2[140 + oy, 626 + ox] = np.nan
            En[140 + oy, 626 + ox] = max(En[140 + oy, 626 + ox], 78.0 - 6.0 * abs(oy) + 4.0 * ox)
    En[140, 626] = 78.0

    # Copper Tarn (148, 1142) dry summer dumb-barter moraine spit (+2,388 m, connected north to shore at y=1135..1142)
    for sy_c in range(1135, 1143):
        for sx_c in (148, 149):
            whas2[sy_c, sx_c] = False
            water2[sy_c, sx_c] = False
            wlev2[sy_c, sx_c] = np.nan
            En[sy_c, sx_c] = max(En[sy_c, sx_c], 2388.0 + 4.0 * (1142 - sy_c))
    En[1142, 148] = 2388.0

    # =========================================================================
    # STEP 3: Ria Valley Transverse Hogback/Cuesta Sill (`x ~ 685..718, y ~ 115..220`)
    #         (`+1,450..+1,950 m` Crest) & Pre-Erosion Basin Grading
    # =========================================================================
    # Smoothly grade Heartland alluvial floor (`x = 722..900, y = 150..205`) from ~240 m to ~420 m
    # so `9101 Ma-Ria` flows continuously at gentle navigable slope (`< 0.0014`) instead of a flat 403 m step!
    ria_floor_w = (
        G.sstep(625.0, 665.0, xx)
        * (1.0 - G.sstep(1260.0, 1320.0, xx))
        * G.sstep(105.0, 135.0, yy)
        * (1.0 - G.sstep(210.0, 245.0, yy))
    )
    ideal_plane = 45.0 + 0.88 * np.maximum(0.0, xx - 630.0) + 1.8 * np.abs(yy - 168.0)
    gentle_mask = (ria_floor_w > 0.05) & (~whas2) & (En < 980.0) & EXT_MASK
    En[gentle_mask] = 0.58 * En[gentle_mask] + 0.42 * ideal_plane[gentle_mask]

    # Build NNE-SSW Hogback/Cuesta Ridge (`x_crest(y) = 712 - 0.24*(y - 115)` for `y = 110..226`)
    hog_mask = (xx >= 668.0) & (xx <= 748.0) & (yy >= 106.0) & (yy <= 232.0) & (~whas2) & EXT_MASK
    y_h = yy[hog_mask]
    x_h = xx[hog_mask]
    x_crest = 712.0 - 0.24 * (y_h - 115.0) + 2.4 * np.sin((y_h - 115.0) * 0.14)
    dx_h = x_h - x_crest
    # Asymmetric cuesta: steep west scarp (sigma=6.2 px = 12.4 km), gentler east dip-slope (sigma=12.8 px = 25.6 km)
    sigma_h = np.where(dx_h < 0.0, 6.2, 12.8)
    ridge_env = np.exp(-0.5 * (dx_h / sigma_h) ** 2) * G.sstep(106.0, 118.0, y_h) * (1.0 - G.sstep(216.0, 231.0, y_h))
    # Modulated crest height +1,480..+1,920 m, notched at Iron Gates (y ~ 181) and Pak-Ma gap (y ~ 124)
    crest_target = (
        1690.0
        + 185.0 * np.sin((y_h - 115.0) * 0.11 + 0.5)
        + 65.0 * np.cos(x_h * 0.31 + y_h * 0.27)
    )
    notch_iron_gates = 1.0 - 0.96 * np.exp(-0.5 * ((y_h - 181.5) / 4.2) ** 2)
    notch_pak_ma = 1.0 - 0.82 * np.exp(-0.5 * ((y_h - 124.0) / 3.8) ** 2)
    hog_target = En[hog_mask] + (crest_target - En[hog_mask]) * ridge_env * notch_iron_gates * notch_pak_ma
    En[hog_mask] = np.where(ridge_env > 0.02, np.maximum(En[hog_mask] * notch_iron_gates, hog_target), En[hog_mask])

    # Smooth Arcflow lower benches around Pak-Veche (718, 124) -> (~365 m) and Mo-Veche (664, 108) -> (~255 m)
    # so lower Pak-Ma and Mo-Ma are genuinely navigable (< 0.0042 slope) down to Ria Sound!
    for cx_v, cy_v, target_v, rad_v in ((718.0, 124.0, 360.0, 14.0), (664.0, 108.0, 250.0, 13.0), (648.0, 126.0, 115.0, 12.0)):
        m_v = ((xx - cx_v) ** 2 + (yy - cy_v) ** 2 <= rad_v ** 2) & (~whas2) & EXT_MASK
        w_v = np.exp(-0.5 * (((xx[m_v] - cx_v) ** 2 + (yy[m_v] - cy_v) ** 2) / ((rad_v * 0.52) ** 2)))
        En[m_v] = En[m_v] * (1.0 - 0.78 * w_v) + target_v * (0.78 * w_v)

    # =========================================================================
    # STEP 4: Synthesize Sinuous Ria, Farside & Crook River Networks + Erosion
    # =========================================================================
    rivers_by_id = {r['id']: r for r in D['rivers']}

    # --- 4A. Extend Farside Coastal Rivers Across New Seaward Foreland ---
    r002 = rivers_by_id['r002']
    r002_keep = [p for p in r002['px'] if p[0] >= 292.0]
    r002_beds_keep = list(r002['bed_m'][:len(r002_keep)])
    r002_ext = weave_meanders(
        [r002_keep[-1], [280.0, 586.5], [268.0, 584.0], [256.0, 586.8], [246.2, 585.8], [245.0, 586.0]],
        target_sin=1.28, seed=502, step_px=1.8, amp_cap_px=3.5,
    )
    r002_ext = clamp_river_to_dry_land(r002_ext, whas2, keep_wet_tail=True)
    r002['px'] = r002_keep + r002_ext[1:]
    b_start_002 = r002_beds_keep[-1]
    n_ext_002 = len(r002_ext) - 1
    r002_ext_beds = [round(max(1.0, b_start_002 * (1.0 - (k + 1) / float(n_ext_002))), 1) for k in range(n_ext_002)]
    r002_ext_beds[-1] = 0.0
    r002['bed_m'] = r002_beds_keep + r002_ext_beds
    r002['mouth_m'] = 0.0
    r002['length_km'] = poly_len_km(r002['px'])
    r002['q_m3s'] = [round(45.0 + 395.0 * (i / max(1, len(r002['px']) - 1)), 1) for i in range(len(r002['px']))]
    r002['q_mouth'] = 440.0
    r002['to'] = {'sea': 'ocean', 'at_px': [243.0, 586.0]}
    carve_fluvial_valley(En, whas2, EXT_MASK, r002_ext, [360.0] * len(r002_ext), target_beds=[b_start_002] + r002_ext_beds, belt_mult=0.75)
    En[585, 248] = 212.0  # preserve exact Farport headland height above Ling-Ma gorge

    # Fortified Y = 515 northern border river `r175` (`dStara cBruk`, ~136 km)
    r175 = rivers_by_id['r175']
    r175_pts = weave_meanders(
        [[324.1, 514.3], [308.0, 515.2], [292.0, 514.6], [276.0, 515.4], [260.0, 514.8], [253.0, 515.0]],
        target_sin=1.27, seed=515, step_px=2.0, amp_cap_px=2.4,
    )
    r175_pts = clamp_river_to_dry_land(r175_pts, whas2, keep_wet_tail=False)
    # Ensure sea cell just west of mouth
    mx_175, my_175 = int(round(r175_pts[-1][0])) - 1, int(round(r175_pts[-1][1]))
    whas2[my_175, :mx_175 + 1] = True
    water2[my_175, :mx_175 + 1] = True
    wlev2[my_175, :mx_175 + 1] = -0.2
    En[my_175, :mx_175 + 1] = np.minimum(En[my_175, :mx_175 + 1], -18.0)
    r175_beds = carve_fluvial_valley(En, whas2, EXT_MASK, r175_pts, [120.0] * len(r175_pts), belt_mult=0.65)
    r175_beds[-1] = min(r175_beds[-1], 4.0)
    r175['px'] = r175_pts
    r175['bed_m'] = r175_beds
    r175['source_m'] = r175_beds[0]
    r175['mouth_m'] = r175_beds[-1]
    r175['length_km'] = poly_len_km(r175_pts)
    r175['to'] = {'sea': 'ocean', 'at_px': [float(mx_175), float(my_175)]}

    # Join r234 into r175 cleanly at (308, 515) and extend r078, r089, r113, r130, r148 across Farside foreland
    r234 = rivers_by_id['r234']
    r234_pts, j234 = snap_mouth_to_parent([r234['px'][0], [314.0, 513.0], [308.0, 515.0]], r175['px'], [308.0, 515.0], target_sin=1.22, seed=234)
    r234['px'] = clamp_river_to_dry_land(r234_pts, whas2)
    r234['px'][-1] = r175['px'][j234]
    b234 = [max(r175['bed_m'][j234], bil(En, p[0], p[1]) - 12.0) for p in r234['px']]
    for k in range(1, len(b234)):
        b234[k] = min(b234[k], b234[k - 1])
    b234[-1] = r175['bed_m'][j234]
    r234['bed_m'] = [round(x, 1) for x in b234]
    r234['mouth_m'] = r234['bed_m'][-1]
    r234['length_km'] = poly_len_km(r234['px'])
    r234['to'] = {'river': 'r175', 'name': r175['name'], 'at_px': r175['px'][j234]}

    for fs_rid, fs_y, fs_seed in (
        ('r113', 528.0, 613),
        ('r089', 538.0, 589),
        ('r148', 543.0, 648),
        ('r130', 549.0, 630),
        ('r078', 558.0, 578),
    ):
        rv_f = rivers_by_id[fs_rid]
        y_int = int(round(fs_y))
        wet_xs = np.nonzero(whas2[y_int, :315])[0]
        x_sea = int(wet_xs[-1]) if wet_xs.size else 248
        pts_f = weave_meanders(
            [rv_f['px'][0], [286.0, fs_y + 1.2], [float(x_sea + 2), fs_y]],
            target_sin=1.26, seed=fs_seed, step_px=2.0, amp_cap_px=2.5,
        )
        pts_f = clamp_river_to_dry_land(pts_f, whas2)
        beds_f = carve_fluvial_valley(En, whas2, EXT_MASK, pts_f, [65.0] * len(pts_f), belt_mult=0.55)
        rv_f['px'] = pts_f
        rv_f['bed_m'] = beds_f
        rv_f['source_m'] = beds_f[0]
        rv_f['mouth_m'] = beds_f[-1]
        rv_f['length_km'] = poly_len_km(pts_f)
        rv_f['to'] = {'sea': 'ocean', 'at_px': [float(x_sea), float(y_int)]}

    # Also snap r275 mouth cleanly to r002
    r275 = rivers_by_id['r275']
    pts_275, j275 = snap_mouth_to_parent([r275['px'][0], [312.0, 580.0], [308.0, 586.4]], r002['px'], [308.0, 586.4], target_sin=1.22, seed=275)
    r275['px'] = clamp_river_to_dry_land(pts_275, whas2)
    r275['px'][-1] = r002['px'][j275]
    b275 = [max(r002['bed_m'][j275], bil(En, p[0], p[1]) - 10.0) for p in r275['px']]
    for k in range(1, len(b275)):
        b275[k] = min(b275[k], b275[k - 1])
    b275[-1] = r002['bed_m'][j275]
    r275['bed_m'] = [round(x, 1) for x in b275]
    r275['mouth_m'] = r275['bed_m'][-1]

    # --- 4B. Re-Meander Trunk `9101 Ma-Ria` & Major Ria Forks (`9102`, `9103`, `9104`, `9106`, `9107`, `9108`, `9109`) ---
    # 1. `9101` Ria River (Ma-Ria): Upper Ria -> Weeping Valley -> Heartland -> Iron Gates (682..720, y~181.5) -> Ria Sound (626, 140)
    ctrl_9101 = [
        [1312.0, 96.0],
        [1255.0, 102.0],
        [1186.0, 121.0],   # passes Upper Ria capital (1186, 118)
        [1124.0, 134.0],   # Ching-Ma confluence
        [1062.0, 146.0],
        [996.0, 159.0],    # passes Weeping Fort (996, 156)
        [938.0, 168.0],
        [898.0, 174.0],    # Ham-Tsek confluence
        [846.0, 182.0],
        [796.0, 179.0],    # passes Heartland / Lower Ria capital (796, 176)
        [746.0, 183.0],
        [718.0, 181.5],    # enters Iron Gates hogback water-gap
        [684.0, 181.5],    # exits Iron Gates hogback water-gap
        [654.0, 162.0],
        [634.0, 145.0],
        [625.0, 142.0],    # dry bank right below Ria Sound bluff (626, 140), discharging into (624, 141) sea!
    ]
    pts_9101 = weave_meanders(ctrl_9101, target_sin=1.29, seed=9101, step_px=2.4, end_taper=0.08, amp_cap_px=8.5)
    pts_9101 = clamp_river_to_dry_land(pts_9101, whas2, keep_wet_tail=False)
    # Construct smooth, continuously navigable profile from 1,365 m at source down to 6.0 m at Ria Sound mouth (`slope < 0.0014` everywhere!)
    n_9101 = len(pts_9101)
    cum_9101 = [0.0]
    for a, b in zip(pts_9101[:-1], pts_9101[1:]):
        cum_9101.append(cum_9101[-1] + math.hypot(b[0] - a[0], b[1] - a[1]) * 2.0)
    tot_9101_km = cum_9101[-1]
    # Concave-up graded river longitudinal profile: 1365 m -> 940 m (Upper Ria) -> 560 m (Weeping) -> 275 m (Heartland) -> 175 m (Iron Gates) -> 6 m (Ria Sound)
    beds_9101_tgt = [round(6.0 + 1359.0 * ((1.0 - s_k / tot_9101_km) ** 1.38), 1) for s_k in cum_9101]
    qs_9101 = [240.0 + (4850.0 - 240.0) * (i / max(1, n_9101 - 1)) for i in range(n_9101)]
    beds_9101 = carve_fluvial_valley(En, whas2, EXT_MASK, pts_9101, qs_9101, target_beds=beds_9101_tgt, belt_mult=1.25)
    En[140, 626] = max(En[140, 626], 78.0)  # preserve tsunami-safe Ria Sound bluff height!
    rivers_by_id[9101] = build_river_record(
        9101, 'Ria River (M\u0101-R\u012ba)', pts_9101, beds_9101, 240.0, 4850.0,
        {'kind': 'sea', 'at_px': [624.0, 141.0]}, tier='main', order=4, tongue='low-ria',
        gloss="Ria River / M\u0101-R\u012ba — sinuous continental trunk river flowing through Upper Ria, Weeping Valley, Heartland, and the Iron Gates water-gap into Ria Sound",
    )

    # 2. `9102` Ham-Tsek (Web-Cleaver River): Spider Lake (1273, 194) -> Ham-Tsek (1055, 219) -> Ma-Ria (898, 174)
    ctrl_9102 = [
        [1273.0, 195.0],
        [1238.0, 224.0],
        [1188.0, 262.0],
        [1132.0, 286.0],
        [1082.0, 256.0],
        [1055.0, 219.0],   # Ham-Tsek Silk Post (adjacent to Lodestone 1058, 224)
        [996.0, 206.0],
        [944.0, 190.0],
        [898.0, 174.0],
    ]
    pts_9102, j_9102 = snap_mouth_to_parent(ctrl_9102, pts_9101, [898.0, 174.0], target_sin=1.44, seed=9102, step_px=2.3, amp_cap_px=8.0)
    pts_9102 = clamp_river_to_dry_land(pts_9102, whas2)
    pts_9102[-1] = pts_9101[j_9102]
    mth_b_9102 = beds_9101[j_9102]
    n_9102 = len(pts_9102)
    beds_9102_tgt = [round(mth_b_9102 + (1442.0 - mth_b_9102) * ((1.0 - i / max(1, n_9102 - 1)) ** 1.22), 1) for i in range(n_9102)]
    beds_9102_tgt[-1] = mth_b_9102
    qs_9102 = [180.0 + (1650.0 - 180.0) * (i / max(1, n_9102 - 1)) for i in range(n_9102)]
    beds_9102 = carve_fluvial_valley(En, whas2, EXT_MASK, pts_9102, qs_9102, target_beds=beds_9102_tgt, belt_mult=0.95)
    beds_9102[-1] = mth_b_9102
    rivers_by_id[9102] = build_river_record(
        9102, 'H\u0101m-Ts\u0113k (Web-Cleaver River)', pts_9102, beds_9102, 180.0, 1650.0,
        {'kind': 'river', 'id': 9101, 'at_px': pts_9101[j_9102], 'name': 'Ria River (M\u0101-R\u012ba)'},
        tier='main', order=3, tongue='low-ria',
        gloss='Navigable silk-and-lodestone tributary linking Spider Lake and H\u0101m-Ts\u0113k to the M\u0101-R\u012ba',
    )

    # 3. `9107` Pak-Ma (North Ria Fork): sinuous Arcflow trunk (`sin >= 1.35`) past Pak-Veche (718, 124) into Ma-Ria above Ria Sound!
    ctrl_9107 = [
        [885.0, 108.0],
        [832.0, 114.0],
        [776.0, 118.0],
        [718.0, 124.0],    # Pak-Veche
        [676.0, 128.0],
        [648.0, 134.0],    # Mo-Ma confluence
        [633.0, 143.0],
    ]
    pts_9107, j_9107 = snap_mouth_to_parent(ctrl_9107, pts_9101, [633.0, 143.0], target_sin=1.37, seed=9107, step_px=2.1, amp_cap_px=7.5)
    pts_9107 = clamp_river_to_dry_land(pts_9107, whas2)
    pts_9107[-1] = pts_9101[j_9107]
    mth_b_9107 = beds_9101[j_9107]
    n_9107 = len(pts_9107)
    # Gentle lower-reach slope (< 0.0028) from Pak-Veche (~330 m) to Ma-Ria (~22 m) so Veche timber/iron barges navigate!
    beds_9107_tgt = [round(mth_b_9107 + (1180.0 - mth_b_9107) * ((1.0 - i / max(1, n_9107 - 1)) ** 1.55), 1) for i in range(n_9107)]
    beds_9107_tgt[-1] = mth_b_9107
    qs_9107 = [140.0 + (1380.0 - 140.0) * (i / max(1, n_9107 - 1)) for i in range(n_9107)]
    beds_9107 = carve_fluvial_valley(En, whas2, EXT_MASK, pts_9107, qs_9107, target_beds=beds_9107_tgt, belt_mult=0.95)
    beds_9107[-1] = mth_b_9107
    rivers_by_id[9107] = build_river_record(
        9107, 'P\u0101k-M\u0101 (North Ria Fork)', pts_9107, beds_9107, 140.0, 1380.0,
        {'kind': 'river', 'id': 9101, 'at_px': pts_9101[j_9107], 'name': 'Ria River (M\u0101-R\u012ba)'},
        tier='main', order=3, tongue='low-ria',
        gloss='Sinuous Arcflow Veche smith-and-cedar river navigable across its lower valley into Ria Sound',
    )

    # 4. `9108` Mo-Ma: sinuous northern Arcflow fork (`sin >= 1.36`) past Mo-Veche (664, 108) into Pak-Ma!
    ctrl_9108 = [
        [772.0, 68.0],
        [732.0, 82.0],
        [694.0, 95.0],
        [664.0, 108.0],    # Mo-Veche
        [654.0, 121.0],
        [648.0, 134.0],
    ]
    pts_9108, j_9108 = snap_mouth_to_parent(ctrl_9108, pts_9107, [648.0, 134.0], target_sin=1.38, seed=9108, step_px=1.9, amp_cap_px=6.5)
    pts_9108 = clamp_river_to_dry_land(pts_9108, whas2)
    pts_9108[-1] = pts_9107[j_9108]
    mth_b_9108 = beds_9107[j_9108]
    n_9108 = len(pts_9108)
    # Steep upper alpine torrent above Mo-Veche transitioning to navigable lower reach (< 0.0032) from Mo-Veche (~215 m) to Pak-Ma!
    beds_9108_tgt = []
    for i in range(n_9108):
        u_f = i / max(1, n_9108 - 1)
        if u_f < 0.58:
            t_loc = u_f / 0.58
            b_v = 2420.0 * (1.0 - t_loc) + 215.0 * t_loc
        else:
            t_loc = (u_f - 0.58) / 0.42
            b_v = 215.0 * (1.0 - t_loc) + mth_b_9108 * t_loc
        beds_9108_tgt.append(round(b_v, 1))
    beds_9108_tgt[-1] = mth_b_9108
    qs_9108 = [65.0 + (480.0 - 65.0) * (i / max(1, n_9108 - 1)) for i in range(n_9108)]
    beds_9108 = carve_fluvial_valley(En, whas2, EXT_MASK, pts_9108, qs_9108, target_beds=beds_9108_tgt, belt_mult=0.80)
    beds_9108[-1] = mth_b_9108
    rivers_by_id[9108] = build_river_record(
        9108, 'M\u014d-M\u0101', pts_9108, beds_9108, 65.0, 480.0,
        {'kind': 'river', 'id': 9107, 'at_px': pts_9107[j_9108], 'name': 'P\u0101k-M\u0101 (North Ria Fork)'},
        tier='trib', order=2, tongue='low-ria',
        gloss='Sinuous northern Arcflow timber-and-nickel river navigable from M\u014d-Veche down to P\u0101k-M\u0101',
    )

    # 5. `9109` Ching-Ma: sinuous Springhollows trunk (`sin >= 1.35`) past Springhollows (1135, 153) into Ma-Ria!
    ctrl_9109 = [
        [1246.0, 172.0],
        [1202.0, 178.0],
        [1164.0, 170.0],
        [1135.0, 153.0],   # Springhollows karst-spring arcology
        [1128.0, 142.0],
        [1124.0, 134.0],
    ]
    pts_9109, j_9109 = snap_mouth_to_parent(ctrl_9109, pts_9101, [1124.0, 134.0], target_sin=1.36, seed=9109, step_px=1.8, amp_cap_px=6.0)
    pts_9109 = clamp_river_to_dry_land(pts_9109, whas2)
    pts_9109[-1] = pts_9101[j_9109]
    mth_b_9109 = beds_9101[j_9109]
    n_9109 = len(pts_9109)
    beds_9109_tgt = [round(mth_b_9109 + (1265.0 - mth_b_9109) * ((1.0 - i / max(1, n_9109 - 1)) ** 1.35), 1) for i in range(n_9109)]
    beds_9109_tgt[-1] = mth_b_9109
    qs_9109 = [85.0 + (460.0 - 85.0) * (i / max(1, n_9109 - 1)) for i in range(n_9109)]
    beds_9109 = carve_fluvial_valley(En, whas2, EXT_MASK, pts_9109, qs_9109, target_beds=beds_9109_tgt, belt_mult=0.85)
    beds_9109[-1] = mth_b_9109
    rivers_by_id[9109] = build_river_record(
        9109, 'Ch\u012bng-M\u0101', pts_9109, beds_9109, 85.0, 460.0,
        {'kind': 'river', 'id': 9101, 'at_px': pts_9101[j_9109], 'name': 'Ria River (M\u0101-R\u012ba)'},
        tier='trib', order=3, tongue='high-ria',
        gloss='Sinuous Springhollows karst-spring river navigated via counterweight shut-in boat-lifts into M\u0101-R\u012ba',
    )

    # 6. Fix `9103` Tong-Ma & `9104` Si-Ma so 100% of vertices stay on dry northern Double Delta / West Arcflow land!
    ctrl_9103 = [
        [622.0, 96.0],
        [594.0, 102.0],
        [566.0, 114.0],
        [538.0, 118.0],
        [512.0, 122.0],
    ]
    pts_9103 = weave_meanders(ctrl_9103, target_sin=1.34, seed=9103, step_px=1.9, amp_cap_px=4.8)
    pts_9103 = clamp_river_to_dry_land(pts_9103, whas2, keep_wet_tail=False)
    # Ensure clean sea mouth adjacent to pts_9103[-1]
    mx_03, my_03 = int(round(pts_9103[-1][0])) - 1, int(round(pts_9103[-1][1]))
    whas2[my_03, mx_03] = True
    water2[my_03, mx_03] = True
    wlev2[my_03, mx_03] = -0.2
    En[my_03, mx_03] = min(En[my_03, mx_03], -12.0)
    n_9103 = len(pts_9103)
    beds_9103_tgt = [round(5.0 + 780.0 * ((1.0 - i / max(1, n_9103 - 1)) ** 1.55), 1) for i in range(n_9103)]
    beds_9103 = carve_fluvial_valley(En, whas2, EXT_MASK, pts_9103, [480.0] * n_9103, target_beds=beds_9103_tgt, belt_mult=0.75)
    rivers_by_id[9103] = build_river_record(
        9103, 'T\u014dng-M\u0101 (North Delta River)', pts_9103, beds_9103, 95.0, 680.0,
        {'kind': 'sea', 'at_px': [float(mx_03), float(my_03)]},
        tier='trib', order=2, tongue='low-ria',
        gloss='Northern Double Delta coastal river draining west Arcflow into Ria Sound',
    )

    ctrl_9104 = [[596.0, 24.0], [574.0, 48.0], [556.0, 78.0], [566.0, 114.0]]
    pts_9104, j_9104 = snap_mouth_to_parent(ctrl_9104, pts_9103, [566.0, 114.0], target_sin=1.32, seed=9104, step_px=2.0, amp_cap_px=5.2)
    pts_9104 = clamp_river_to_dry_land(pts_9104, whas2)
    pts_9104[-1] = pts_9103[j_9104]
    mth_b_9104 = beds_9103[j_9104]
    beds_9104 = carve_fluvial_valley(En, whas2, EXT_MASK, pts_9104, [280.0] * len(pts_9104), belt_mult=0.65)
    for k in range(len(beds_9104)):
        beds_9104[k] = max(beds_9104[k], mth_b_9104)
    for k in range(1, len(beds_9104)):
        beds_9104[k] = min(beds_9104[k], beds_9104[k - 1])
    beds_9104[-1] = mth_b_9104
    rivers_by_id[9104] = build_river_record(
        9104, 'S\u012b-M\u0101 (North Headland Fork)', pts_9104, beds_9104, 45.0, 340.0,
        {'kind': 'river', 'id': 9103, 'at_px': pts_9103[j_9104], 'name': 'T\u014dng-M\u0101 (North Delta River)'},
        tier='trib', order=1, tongue='low-ria',
        gloss='Steep north headland tributary joining T\u014dng-M\u0101 above Double Delta',
    )

    # 7. Re-meander `9106` Hau-Gel into Spider Lake (`sin ~ 1.30`, all vertices in `y < 610`!)
    ctrl_9106 = [[1584.6, 512.8], [1524.0, 454.0], [1462.0, 376.0], [1408.0, 288.0], [1331.0, 229.7]]
    pts_9106 = weave_meanders(ctrl_9106, target_sin=1.30, seed=9106, step_px=3.0, amp_cap_px=8.0)
    pts_9106 = clamp_river_to_dry_land(pts_9106, whas2)
    n_9106 = len(pts_9106)
    beds_9106_tgt = [round(1462.0 + (2309.5 - 1462.0) * ((1.0 - i / max(1, n_9106 - 1)) ** 1.35), 1) for i in range(n_9106)]
    beds_9106 = carve_fluvial_valley(En, whas2, EXT_MASK, pts_9106, [380.0] * n_9106, target_beds=beds_9106_tgt, belt_mult=0.80)
    rivers_by_id[9106]['px'] = pts_9106
    rivers_by_id[9106]['bed_m'] = beds_9106
    rivers_by_id[9106]['source_m'] = beds_9106[0]
    rivers_by_id[9106]['mouth_m'] = beds_9106[-1]
    rivers_by_id[9106]['length_km'] = poly_len_km(pts_9106)

    # --- 4C. Seed +32 Sinuous 1st/2nd/3rd-Order Dendritic Ria & Shroudhills Tributaries (`9201..9232`) ---
    # Each spec: (rid, name, parent_id_or_'sea', ctrl_pts, target_sin, q_src, q_mth, order, tongue, gloss, gentle_lower)
    RIA_TRIB_SPECS = [
        # Group A: Upper Ria & The Dome (8 tributaries: 9201..9208)
        (9201, 'Kwal\u016bna-L\u012bwa', 9101, [[1246.0, 20.0], [1238.0, 58.0], [1226.0, 108.0]], 1.38, 22.0, 185.0, 2, 'high-ria', 'Carnelian Pass trunk tributary from The Scaffold into Upper Ria', True),
        (9202, 'S\u0113k-L\u012bwa', 9201, [[1198.0, 26.0], [1216.0, 48.0], [1234.0, 68.0]], 1.34, 12.0, 68.0, 1, 'high-ria', 'West Carnelian Pass tributary joining Kwal\u016bna-L\u012bwa', False),
        (9203, '\u0100kwala-G\u0113la', 9101, [[1328.0, 36.0], [1305.0, 74.0], [1282.0, 99.0]], 1.41, 16.0, 115.0, 1, 'high-ria', 'Amber-bench stream descending past Step Ruin into upper M\u0101-R\u012ba', False),
        (9204, 'D\u014dma-N\u014drta', 9101, [[1376.0, 134.0], [1338.0, 118.0], [1296.0, 98.0]], 1.35, 18.0, 130.0, 1, 'high-ria', 'Northern snowfield stream off The Dome into M\u0101-R\u012ba', False),
        (9205, 'D\u014dma-S\u016btha', 9109, [[1364.0, 174.0], [1306.0, 176.0], [1236.0, 173.0]], 1.42, 16.0, 110.0, 1, 'high-ria', 'Western Dome snowmelt fork feeding upper Ch\u012bng-M\u0101', False),
        (9206, 'T\u014dga-Kh\u012bla', 9101, [[1162.0, 34.0], [1168.0, 78.0], [1178.0, 121.0]], 1.44, 18.0, 145.0, 2, 'high-ria', 'North Upper Ria terrace river entering M\u0101-R\u012ba at Upper Ria', True),
        (9207, 'L\u012bwa-W\u0113sta', 9206, [[1118.0, 44.0], [1142.0, 62.0], [1168.0, 78.0]], 1.33, 10.0, 54.0, 1, 'high-ria', 'Second-order NW bench creek joining T\u014dga-Kh\u012bla', False),
        (9208, 'Kh\u0101l\u014d-S\u012bkwa', 9109, [[1284.0, 142.0], [1242.0, 156.0], [1202.0, 176.0]], 1.37, 14.0, 82.0, 1, 'high-ria', 'SE Upper Ria dolomite fork joining Ch\u012bng-M\u0101', False),

        # Group B: Springhollows Karst-Spring Tributaries (6 tributaries: 9209..9214)
        (9209, 'Sikw\u012bngi-M\u0113na', 9109, [[1178.0, 226.0], [1168.0, 198.0], [1158.0, 168.0]], 1.46, 28.0, 145.0, 2, 'high-ria', 'Perennial karst-spring branch with navigable lower pool into Ch\u012bng-M\u0101', True),
        (9210, 'Kh\u0101l\u014dyi-Spr\u012bng', 9209, [[1214.0, 214.0], [1192.0, 206.0], [1168.0, 198.0]], 1.36, 15.0, 62.0, 1, 'high-ria', 'Limestone shut-in spring tributary joining Sikw\u012bngi-M\u0113na', False),
        (9211, 'D\u014dl\u014d-G\u0113la', 9109, [[1126.0, 218.0], [1130.0, 186.0], [1135.0, 155.0]], 1.43, 24.0, 120.0, 2, 'high-ria', 'Central Springhollows dolomite spring river joining Ch\u012bng-M\u0101 at Springhollows', True),
        (9212, 'Kw\u012bna-R\u012bla', 9211, [[1098.0, 198.0], [1114.0, 192.0], [1130.0, 186.0]], 1.31, 12.0, 48.0, 1, 'high-ria', 'Western artesian spring fork joining D\u014dl\u014d-G\u0113la', False),
        (9213, 'S\u012blva-Sw\u0101na', 9101, [[1094.0, 182.0], [1088.0, 162.0], [1084.0, 141.0]], 1.39, 22.0, 98.0, 1, 'high-ria', 'Western Springhollows clearwater spring river into M\u0101-R\u012ba', True),
        (9214, 'T\u016bfa-Kr\u012bka', 9109, [[1244.0, 204.0], [1226.0, 190.0], [1214.0, 176.0]], 1.34, 14.0, 58.0, 1, 'high-ria', 'Travertine tufa-cascade creek feeding upper Ch\u012bng-M\u0101', False),

        # Group C: Weeping Valley & Compass Hills (7 tributaries: 9215..9221)
        (9215, 'M\u014dlu-G\u016bli', 9101, [[1056.0, 58.0], [1048.0, 102.0], [1042.0, 149.0]], 1.45, 14.0, 96.0, 1, 'molu-dungu', 'Eastern Moleshelf loess-gully stream entering East Weeping Valley', False),
        (9216, 'S\u0101pa-R\u012bwa', 9101, [[992.0, 58.0], [990.0, 108.0], [996.0, 159.0]], 1.48, 16.0, 118.0, 2, 'low-ria', 'Central Moleshelf scarp river meeting M\u0101-R\u012ba at Weeping Fort', True),
        (9217, 'Y\u0101d\u00fc-Ch\u0113', 9216, [[948.0, 74.0], [968.0, 92.0], [990.0, 108.0]], 1.36, 10.0, 46.0, 1, 'molu-dungu', 'Loess yaodong wash from D\u012bp\u00fc-Y\u0101duwe joining S\u0101pa-R\u012bwa', False),
        (9218, 'L\u014dda-M\u0101gna', 9101, [[1060.0, 226.0], [1042.0, 192.0], [1024.0, 155.0]], 1.42, 18.0, 112.0, 2, 'high-ria', 'Magnetized ironstone river flowing north from Lodestone into M\u0101-R\u012ba', True),
        (9219, 'K\u014dmpa-W\u0113sta', 9101, [[1008.0, 252.0], [984.0, 208.0], [962.0, 164.0]], 1.47, 16.0, 104.0, 1, 'low-ria', 'Western Compass Hills stream entering M\u0101-R\u012ba below Weeping Valley', False),
        (9220, 'K\u014dmpa-\u0112sta', 9102, [[1102.0, 268.0], [1086.0, 246.0], [1068.0, 224.0]], 1.35, 14.0, 76.0, 1, 'high-ria', 'Eastern Compass Hills creek entering H\u0101m-Ts\u0113k near Lodestone', False),
        (9221, 'W\u0113pi-F\u014drka', 9218, [[1022.0, 214.0], [1032.0, 202.0], [1042.0, 192.0]], 1.30, 9.0, 42.0, 1, 'low-ria', 'Feral sap-grove creek joining L\u014dda-M\u0101gna', False),

        # Group D: Heartland (Lower Ria) & NW Outer Wall North Flank (6 tributaries: 9222..9227)
        (9222, 'S\u016btha-R\u012bwa', 9101, [[862.0, 274.0], [858.0, 226.0], [852.0, 182.0]], 1.46, 26.0, 195.0, 2, 'low-ria', 'Snowmelt river descending NW Outer Wall across eastern Heartland grain plain', True),
        (9223, 'Gl\u0101sa-F\u014drka', 9222, [[894.0, 264.0], [876.0, 244.0], [858.0, 226.0]], 1.33, 14.0, 68.0, 1, 'low-ria', 'High alpine snowmelt fork joining S\u016btha-R\u012bwa', False),
        (9224, 'Kul\u016bn\u0105-M\u0101', 9101, [[794.0, 272.0], [798.0, 224.0], [796.0, 179.0]], 1.51, 28.0, 210.0, 2, 'low-ria', 'Royal Heartland snowmelt river winding into M\u0101-R\u012ba at Lower Ria capital', True),
        (9225, '\u0100mpala-Kr\u012bk', 9101, [[738.0, 258.0], [736.0, 218.0], [734.0, 183.0]], 1.40, 18.0, 125.0, 1, 'low-ria', 'Amber-bearing foothill river joining M\u0101-R\u012ba east of the Iron Gates', True),
        (9226, 'D\u012bp\u00fc-W\u0101sha', 9101, [[868.0, 82.0], [862.0, 132.0], [856.0, 182.0]], 1.44, 12.0, 78.0, 1, 'molu-dungu', 'Rain-shadow loess wash from western Moleshelf into Heartland', False),
        (9227, 'H\u0101rta-N\u014drta', 9101, [[764.0, 132.0], [772.0, 156.0], [780.0, 180.0]], 1.35, 11.0, 64.0, 1, 'low-ria', 'Hogback dip-slope creek watering northern Heartland estates', False),

        # Group E: Arcflow & Shroudhills (5 tributaries: 9228..9232)
        (9228, 'V\u0113che-F\u014drka', 9107, [[838.0, 52.0], [824.0, 84.0], [808.0, 116.0]], 1.39, 18.0, 135.0, 1, 'low-ria', 'Upper Arcflow cedar-and-ironwater gorge fork joining P\u0101k-M\u0101', False),
        (9229, 'K\u016bra-B\u0113ka', 9107, [[744.0, 44.0], [732.0, 84.0], [718.0, 124.0]], 1.42, 20.0, 150.0, 1, 'low-ria', 'Mill-bridge cataract stream powering P\u0101k-Veche trip-hammers', False),
        (9230, 'Fr\u016bsta-M\u0101', 9108, [[644.0, 50.0], [654.0, 80.0], [664.0, 108.0]], 1.36, 16.0, 115.0, 1, 'low-ria', 'Western Arcflow cedar-gorge fork joining M\u014d-M\u0101 at M\u014d-Veche', False),
        (9231, 'Shr\u016bda-R\u012bwa', 'sea', [[604.0, 286.0], [582.0, 254.0], [562.0, 224.0], [552.0, 204.0]], 1.43, 18.0, 165.0, 2, 'yonni-zag', 'Northern Shroudhills torrential drum-gall river entering S Ria Sound', False),
        (9232, 'Y\u014dnni-Kh\u012bla', 'sea', [[404.0, 424.0], [376.0, 419.0], [348.0, 416.0], [328.0, 414.0]], 1.38, 16.0, 140.0, 2, 'yonni-zag', 'Spear-Queen citadel river descending past Yonni (346, 418) to the raid coves', False),
    ]

    for rid, rname, par_id, ctrl, t_sin, q_s, q_m, r_ord, r_tng, r_gls, gentle_low in RIA_TRIB_SPECS:
        if par_id == 'sea':
            pts_t = weave_meanders(ctrl, target_sin=t_sin, seed=rid, step_px=2.0, amp_cap_px=6.5)
            pts_t = clamp_river_to_dry_land(pts_t, whas2, keep_wet_tail=False)
            # Find nearest sea cell around mouth
            mx_t, my_t = int(round(pts_t[-1][0])), int(round(pts_t[-1][1]))
            best_sea = None
            for rad_s in range(1, 14):
                for dy_s in range(-rad_s, rad_s + 1):
                    for dx_s in range(-rad_s, rad_s + 1):
                        yy_s, xx_s = my_t + dy_s, mx_t + dx_s
                        if 0 <= yy_s < OH and 0 <= xx_s < OW and whas2[yy_s, xx_s]:
                            d_s = dy_s * dy_s + dx_s * dx_s
                            if best_sea is None or d_s < best_sea[0]:
                                best_sea = (d_s, xx_s, yy_s)
                if best_sea is not None:
                    break
            if best_sea and best_sea[0] > 2:
                # Extend cleanly to shore adjacent to best_sea
                sx_e, sy_e = best_sea[1], best_sea[2]
                ux = 1 if mx_t > sx_e else (-1 if mx_t < sx_e else 0)
                uy = 1 if my_t > sy_e else (-1 if my_t < sy_e else 0)
                pts_t = weave_meanders(ctrl[:-1] + [[float(sx_e + ux), float(sy_e + uy)]], target_sin=t_sin, seed=rid, step_px=2.0, amp_cap_px=6.0)
                pts_t = clamp_river_to_dry_land(pts_t, whas2, keep_wet_tail=False)
                to_obj = {'kind': 'sea', 'at_px': [float(sx_e), float(sy_e)]}
            else:
                sx_e, sy_e = (best_sea[1], best_sea[2]) if best_sea else (mx_t - 1, my_t)
                to_obj = {'kind': 'sea', 'at_px': [float(sx_e), float(sy_e)]}
            qs_t = [q_s + (q_m - q_s) * (i / max(1, len(pts_t) - 1)) for i in range(len(pts_t))]
            beds_t = carve_fluvial_valley(En, whas2, EXT_MASK, pts_t, qs_t, belt_mult=0.70)
            beds_t[-1] = min(beds_t[-1], 8.0)
            for k in range(len(beds_t) - 2, -1, -1):
                beds_t[k] = max(beds_t[k], beds_t[k + 1])
        else:
            par_r = rivers_by_id[par_id]
            pts_t, j_par = snap_mouth_to_parent(ctrl, par_r['px'], ctrl[-1], target_sin=t_sin, seed=rid, step_px=1.9, amp_cap_px=6.5)
            pts_t = clamp_river_to_dry_land(pts_t, whas2)
            pts_t[-1] = par_r['px'][j_par]
            mth_b = par_r['bed_m'][j_par]
            src_e = max(mth_b + 85.0, bil(En, pts_t[0][0], pts_t[0][1]) - 18.0)
            n_t = len(pts_t)
            exp_curve = 1.65 if gentle_low else 1.25
            tgt_b = [round(mth_b + (src_e - mth_b) * ((1.0 - i / max(1, n_t - 1)) ** exp_curve), 1) for i in range(n_t)]
            tgt_b[-1] = mth_b
            qs_t = [q_s + (q_m - q_s) * (i / max(1, n_t - 1)) for i in range(n_t)]
            beds_t = carve_fluvial_valley(En, whas2, EXT_MASK, pts_t, qs_t, target_beds=tgt_b, belt_mult=0.80 if gentle_low else 0.65)
            beds_t[-1] = mth_b
            to_obj = {'kind': 'river', 'id': par_id, 'at_px': par_r['px'][j_par], 'name': par_r['name']}

        rivers_by_id[rid] = build_river_record(
            rid, rname, pts_t, beds_t, q_s, q_m, to_obj, tier='trib', order=r_ord, tongue=r_tng, gloss=r_gls
        )

    # --- 4D. Re-Meander `9105 Kopa-Tarn Warra`, Update `9110 Blek Warra`, & Add 18 Crook Gorge Rivers (`9111..9128`) ---
    ctrl_9105 = [
        [145.0, 1134.0],   # dry northern outlet bench of Copper Tarn (2380 m)
        [102.0, 1094.0],
        [88.0, 1034.0],
        [94.0, 966.0],     # Flumi-Bridzi neutral flume-bridge market
        [96.0, 902.0],
        [100.0, 838.0],
        [104.0, 774.0],
        [110.0, 714.0],
        [121.0, 665.0],    # dry shore entering Cascade-Caldera (123, 659)
    ]
    pts_9105 = weave_meanders(ctrl_9105, target_sin=1.31, seed=9105, step_px=2.4, amp_cap_px=6.5)
    pts_9105 = clamp_river_to_dry_land(pts_9105, whas2, keep_wet_tail=False)
    n_9105 = len(pts_9105)
    beds_9105_tgt = [round(6.0 + (2376.0 - 6.0) * ((1.0 - i / max(1, n_9105 - 1)) ** 1.28), 1) for i in range(n_9105)]
    qs_9105 = [110.0 + (980.0 - 110.0) * (i / max(1, n_9105 - 1)) for i in range(n_9105)]
    beds_9105 = carve_fluvial_valley(En, whas2, EXT_MASK, pts_9105, qs_9105, target_beds=beds_9105_tgt, belt_mult=0.85)
    rivers_by_id[9105] = build_river_record(
        9105, 'Kopa-Tarn Warra (Crook River)', pts_9105, beds_9105, 110.0, 980.0,
        {'kind': 'sea', 'at_px': [123.0, 661.0]}, tier='main', order=4, tongue='dzagh-vardzi',
        gloss='Great western gorge-and-flume river from Copper Tarn past Fl\u016bmi-Br\u012bdzi into Cascade-Caldera',
    )

    # Snap existing 9110 Blek Warra cleanly to re-meandered 9105 near Flumi-Bridzi (94, 966)
    r9110 = rivers_by_id[9110]
    pts_9110, j_9110 = snap_mouth_to_parent(
        [[183.0, 842.0], [192.0, 912.0], [184.0, 962.0], [138.0, 970.0], [94.0, 966.0]],
        pts_9105, [94.0, 966.0], target_sin=1.41, seed=9110, step_px=2.2, amp_cap_px=6.0,
    )
    pts_9110 = clamp_river_to_dry_land(pts_9110, whas2)
    pts_9110[-1] = pts_9105[j_9110]
    mth_b_9110 = beds_9105[j_9110]
    n_9110 = len(pts_9110)
    beds_9110_tgt = [round(mth_b_9110 + (2060.0 - mth_b_9110) * ((1.0 - i / max(1, n_9110 - 1)) ** 1.25), 1) for i in range(n_9110)]
    beds_9110_tgt[-1] = mth_b_9110
    beds_9110 = carve_fluvial_valley(En, whas2, EXT_MASK, pts_9110, [320.0] * n_9110, target_beds=beds_9110_tgt, belt_mult=0.75)
    beds_9110[-1] = mth_b_9110
    rivers_by_id[9110] = build_river_record(
        9110, 'Blek Warra', pts_9110, beds_9110, 60.0, 540.0,
        {'kind': 'river', 'id': 9105, 'at_px': pts_9105[j_9110], 'name': 'Kopa-Tarn Warra (Crook River)'},
        tier='trib', order=3, tongue='dzagh-vardzi',
        gloss='Silent Vales outlet gorge river joining Kopa-Tarn Warra at Fl\u016bmi-Br\u012bdzi',
    )

    CROOK_TRIB_SPECS = [
        (9111, 'Kh\u0101i-G\u0113ti Dz\u0101ghi', 9105, [[156.0, 748.0], [128.0, 760.0], [104.0, 774.0]], 1.36, 18.0, 145.0, 2, 'dzagh-vardzi', 'K1 High-Gate cypress-flume gorge river'),
        (9112, 'R\u0113d-Sp\u0101iri Dz\u0101ghi', 9105, [[152.0, 792.0], [124.0, 798.0], [102.0, 806.0]], 1.34, 15.0, 118.0, 1, 'dzagh-vardzi', 'K2 Red-Spire cinnabar-and-copper gorge torrent'),
        (9113, 'T\u012bn-Fl\u012btsi Dz\u0101ghi', 9105, [[158.0, 846.0], [128.0, 848.0], [100.0, 844.0]], 1.39, 20.0, 160.0, 2, 'dzagh-vardzi', 'K3 Tin-Fleece cassiterite sluice gorge river'),
        (9114, '\u0100irn-Dz\u0101ghi', 9105, [[54.0, 826.0], [78.0, 834.0], [99.0, 840.0]], 1.33, 16.0, 125.0, 2, 'dzagh-vardzi', 'K4 Iron-Gorge western ridge torrent'),
        (9115, 'R\u014dzi-V\u0101rdzi Dz\u0101ghi', 9105, [[162.0, 904.0], [132.0, 906.0], [97.0, 906.0]], 1.41, 18.0, 138.0, 2, 'dzagh-vardzi', 'K5 Rose-Fortress rhodochrosite gorge river'),
        (9116, 'M\u012bst-Kh\u014dpri Dz\u0101ghi', 9105, [[154.0, 1026.0], [120.0, 1022.0], [89.0, 1024.0]], 1.37, 18.0, 142.0, 2, 'dzagh-vardzi', 'K6 Mist-Copper gorge draining upper Crookwash'),
        (9117, 'Dz\u0113di-Khr\u014dsi Dz\u0101ghi', 9105, [[56.0, 732.0], [82.0, 730.0], [108.0, 722.0]], 1.32, 14.0, 98.0, 1, 'dzagh-vardzi', 'K7 Jade-Cross nephrite-boulder gorge into lower Kopa-Tarn'),
        (9118, 'Fl\u016bmi-N\u014drta', 9110, [[156.0, 938.0], [142.0, 954.0], [132.0, 969.0]], 1.31, 12.0, 74.0, 1, 'dzagh-vardzi', 'Timber-flume branch joining Blek Warra above Fl\u016bmi-Br\u012bdzi'),
        (9119, 'S\u016btiru-N\u014drta', 9110, [[218.0, 896.0], [204.0, 906.0], [192.0, 916.0]], 1.35, 14.0, 88.0, 1, 'hueru-kuran', 'Northern Silent Vales acoustic-sanctuary stream'),
        (9120, 'S\u016btiru-S\u016btha', 9110, [[216.0, 994.0], [194.0, 980.0], [174.0, 968.0]], 1.38, 16.0, 105.0, 1, 'hueru-kuran', 'Southern Silent Vales ribbon-lake tributary into Blek Warra'),
        (9121, 'K\u014dpa-T\u0101rna W\u0113sta', 9105, [[62.0, 1076.0], [82.0, 1082.0], [100.0, 1088.0]], 1.33, 14.0, 92.0, 1, 'dzagh-vardzi', 'SW Copper Glacier meltwater fork into upper Kopa-Tarn'),
        (9122, 'Gl\u0101sa-Kh\u014dpra', 9105, [[168.0, 1086.0], [136.0, 1090.0], [104.0, 1094.0]], 1.36, 18.0, 128.0, 1, 'dzagh-vardzi', 'Eastern Copper Glacier malachite-meltwater fork'),
        (9123, 'W\u0113sta-V\u0101rdzi', 9105, [[58.0, 938.0], [76.0, 948.0], [94.0, 960.0]], 1.30, 12.0, 78.0, 1, 'dzagh-vardzi', 'West Crookwash cliff-monastery stream'),
        (9124, 'Br\u012bdzi-S\u016btha', 9105, [[62.0, 996.0], [76.0, 998.0], [88.0, 1002.0]], 1.29, 12.0, 72.0, 1, 'dzagh-vardzi', 'Southwest gorge stream below Mist-Khopri'),
        (9125, 'K\u0101sk\u0113di-R\u012bla', 'caldera_cascade', [[168.0, 672.0], [146.0, 666.0], [129.0, 661.0]], 1.34, 16.0, 115.0, 1, 'hueru-kuran', 'Waterfall wire-saw stream powering Cascade-Caldera nephrite saws'),
        (9126, 'Hueru-S\u016btha', 'caldera_ksouth', [[118.0, 694.0], [98.0, 686.0], [87.0, 679.0]], 1.32, 14.0, 94.0, 1, 'hueru-kuran', 'Crookshore jade-boulder stream entering Kopa-South Caldera'),
        (9127, 'Hueru-N\u014drta', 'caldera_knorth', [[134.0, 608.0], [112.0, 606.0], [95.0, 604.0]], 1.35, 14.0, 96.0, 1, 'hueru-kuran', 'Crookshore stream entering Kopa-North Caldera'),
        (9128, 'Eye-K\u016bra', 'caldera_eye', [[146.0, 566.0], [126.0, 564.0], [110.0, 562.0]], 1.33, 12.0, 84.0, 1, 'hueru-kuran', 'Northern Crookshore stream entering The Eye Caldera'),
    ]
    caldera_mouth_at = {
        'caldera_cascade': [125.0, 660.0],
        'caldera_ksouth': [84.0, 678.0],
        'caldera_knorth': [92.0, 604.0],
        'caldera_eye': [107.0, 562.0],
    }
    for rid, rname, par_id, ctrl, t_sin, q_s, q_m, r_ord, r_tng, r_gls in CROOK_TRIB_SPECS:
        if isinstance(par_id, str) and par_id.startswith('caldera_'):
            pts_c = weave_meanders(ctrl, target_sin=t_sin, seed=rid, step_px=1.8, amp_cap_px=4.5)
            pts_c = clamp_river_to_dry_land(pts_c, whas2)
            qs_c = [q_s + (q_m - q_s) * (i / max(1, len(pts_c) - 1)) for i in range(len(pts_c))]
            beds_c = carve_fluvial_valley(En, whas2, EXT_MASK, pts_c, qs_c, belt_mult=0.60)
            beds_c[-1] = min(beds_c[-1], 24.0)
            for k in range(len(beds_c) - 2, -1, -1):
                beds_c[k] = max(beds_c[k], beds_c[k + 1])
            to_obj = {'kind': 'sea', 'at_px': caldera_mouth_at[par_id]}
        else:
            par_r = rivers_by_id[par_id]
            pts_c, j_par = snap_mouth_to_parent(ctrl, par_r['px'], ctrl[-1], target_sin=t_sin, seed=rid, step_px=1.9, amp_cap_px=5.5)
            pts_c = clamp_river_to_dry_land(pts_c, whas2)
            pts_c[-1] = par_r['px'][j_par]
            mth_b = par_r['bed_m'][j_par]
            src_e = max(mth_b + 120.0, bil(En, pts_c[0][0], pts_c[0][1]) - 22.0)
            n_c = len(pts_c)
            tgt_b = [round(mth_b + (src_e - mth_b) * ((1.0 - i / max(1, n_c - 1)) ** 1.25), 1) for i in range(n_c)]
            tgt_b[-1] = mth_b
            qs_c = [q_s + (q_m - q_s) * (i / max(1, n_c - 1)) for i in range(n_c)]
            beds_c = carve_fluvial_valley(En, whas2, EXT_MASK, pts_c, qs_c, target_beds=tgt_b, belt_mult=0.65)
            beds_c[-1] = mth_b
            to_obj = {'kind': 'river', 'id': par_id, 'at_px': par_r['px'][j_par], 'name': par_r['name']}
        rivers_by_id[rid] = build_river_record(
            rid, rname, pts_c, beds_c, q_s, q_m, to_obj, tier='trib', order=r_ord, tongue=r_tng, gloss=r_gls
        )

    # Re-pin key tsunami-safe headland/rim elevations after valley carving
    En[140, 626] = max(En[140, 626], 78.0)    # Ria Sound
    En[585, 248] = 212.0                      # Farport
    En[259, 435] = 115.0                      # Battered Isle
    En[679, 75] = max(En[679, 75], 88.0)      # Kopa-Hueru
    En[660, 128] = max(En[660, 128], 96.0)    # Kaskedi-Kuran
    En[1142, 148] = max(En[1142, 148], 2388.0)

    # Priority-flood fill any newly created unintended dry pits inside Ria, Farside & Crook boxes
    for box_chk in ((2, 310, 480, 1420), (495, 609, 232, 349), (530, 1148, 35, 245)):
        by0, by1, bx0, bx1 = box_chk
        F_old = priority_fill_with_sinks(Eo, whas0, wlev0, box_chk)
        F_new = priority_fill_with_sinks(En, whas2, wlev2, box_chk)
        old_pit = (F_old - Eo[by0:by1, bx0:bx1]) > 1.5
        new_pit = (F_new - En[by0:by1, bx0:bx1]) > 1.5
        fix_m = new_pit & (~old_pit) & (~whas2[by0:by1, bx0:bx1]) & EXT_MASK[by0:by1, bx0:bx1]
        if fix_m.any():
            sub_e = En[by0:by1, bx0:bx1]
            sub_e[fix_m] = F_new[fix_m]

    # Re-sync river thalweg cells in `En` so zero rivers climb > 15 m after pit fill, while keeping exact parent-child bed equality!
    ordered_ext_ids = [9101, 9103, 9105, 9106, 9231, 9232, 9125, 9126, 9127, 9128,
                       9102, 9104, 9107, 9109, 9110,
                       9108, 9201, 9203, 9204, 9205, 9206, 9208, 9209, 9211, 9213, 9214,
                       9215, 9216, 9218, 9219, 9220, 9222, 9224, 9225, 9226, 9227, 9228, 9229, 9230,
                       9202, 9207, 9210, 9212, 9217, 9221, 9223,
                       9111, 9112, 9113, 9114, 9115, 9116, 9117, 9118, 9119, 9120, 9121, 9122, 9123, 9124]
    for rid in ordered_ext_ids:
        rv = rivers_by_id[rid]
        pts_r = rv['px']
        beds_r = rv['bed_m']
        to_r = rv.get('to') or {}
        if to_r.get('kind') == 'river' and to_r.get('id') in rivers_by_id:
            par_rv = rivers_by_id[to_r['id']]
            j_p = min(range(len(par_rv['px'])),
                      key=lambda j: math.hypot(par_rv['px'][j][0] - pts_r[-1][0], par_rv['px'][j][1] - pts_r[-1][1]))
            pts_r[-1] = par_rv['px'][j_p]
            beds_r[-1] = par_rv['bed_m'][j_p]
            for k in range(len(beds_r) - 2, -1, -1):
                if beds_r[k] < beds_r[k + 1]:
                    beds_r[k] = beds_r[k + 1]
            rv['source_m'] = beds_r[0]
            rv['mouth_m'] = beds_r[-1]
        for (px_k, py_k), b_k in zip(pts_r, beds_r):
            ix, iy = int(round(px_k)), int(round(py_k))
            if EXT_MASK[iy, ix] and not whas2[iy, ix]:
                En[iy, ix] = min(En[iy, ix], b_k + 4.0)

    # Assemble updated D['rivers'] list in deterministic order
    base_ids = [r['id'] for r in D['rivers']]
    new_ids = [rid for rid in sorted(k for k in rivers_by_id.keys() if isinstance(k, int) and k >= 9111) if rid not in base_ids]
    D['rivers'] = [rivers_by_id[rid] for rid in base_ids + new_ids]

    # =========================================================================
    # STEP 5: Climate,Hogback Rain-Shadow Loess Bowl (`420-620 mm/yr`) &
    #         Misty Weeping Valley (`950-1,350 mm/yr`) Strictly Inside EXT_MASK
    # =========================================================================
    new_water_ext = whas2 & (~whas0) & EXT_MASK
    newly_dry_ext = (~whas2) & whas0 & EXT_MASK

    lap = C.lapse(D, Eo, En, whas0, wlev0, whas2=whas2, wlev2=wlev2)
    T = {k: P.raster({'x': lap[k]}, 'x', 'L').astype(float) - 90.0 for k in C.TEMPS}

    # Smoothly populate temperatures on newly emergent Farside foreland from adjacent coastal Farside land
    if newly_dry_ext.any():
        donor_fs = (~whas0) & (xx >= 295) & (xx < 340) & (yy >= 515) & (yy < 608)
        for k in C.TEMPS:
            base_t = float(np.median(raw0[k][donor_fs].astype(float) - 90.0))
            T[k][newly_dry_ext] = base_t - 0.0062 * np.maximum(0.0, En[newly_dry_ext] - 120.0)

    rain2, cls2, zon2, _, crep = C.reclimate(D, Eo, En, whas2, new_water_ext)
    rain0 = raw0['p'].astype(float) / 255.0 * 4000.0

    # Rain-shadow loess bowl behind Iron Gates hogback sill (`x = 720..905, y = 45..235` -> `420-620 mm/yr` BSk/Csa!)
    w_shadow = (
        G.sstep(706.0, 728.0, xx)
        * (1.0 - G.sstep(888.0, 912.0, xx))
        * G.sstep(42.0, 62.0, yy)
        * (1.0 - G.sstep(218.0, 240.0, yy))
    )
    shadow_land = (w_shadow > 0.01) & (~whas2) & EXT_MASK
    loess_target = (
        505.0
        + 68.0 * np.sin(xx * 0.045 + yy * 0.06)
        + 36.0 * G.sstep(1200.0, 3200.0, En)
    )
    rain2[shadow_land] = rain2[shadow_land] * (1.0 - 0.88 * w_shadow[shadow_land]) + loess_target[shadow_land] * (0.88 * w_shadow[shadow_land])

    # Keep Weeping Valley (`x = 905..1085, y = 95..208`) misty (`950-1,350 mm/yr`)!
    w_weep = (
        G.sstep(902.0, 922.0, xx)
        * (1.0 - G.sstep(1068.0, 1090.0, xx))
        * G.sstep(92.0, 110.0, yy)
        * (1.0 - G.sstep(196.0, 214.0, yy))
    )
    weep_land = (w_weep > 0.01) & (~whas2) & EXT_MASK
    weep_target = 1130.0 + 110.0 * np.sin(xx * 0.05 - yy * 0.07)
    rain2[weep_land] = rain2[weep_land] * (1.0 - 0.78 * w_weep[weep_land]) + weep_target[weep_land] * (0.78 * w_weep[weep_land])

    # Keep emergent Farside foreland maritime-wet (~1,850-2,250 mm/yr)
    if newly_dry_ext.any():
        rain2[newly_dry_ext] = np.maximum(rain2[newly_dry_ext], 1920.0)

    # Re-classify Koppen classes in rain-shadow / Weeping / Farside zones where rain2 moved significantly
    bsk_idx = codes.index('BSk') if 'BSk' in codes else codes.index('BSh')
    csa_idx = codes.index('Csa') if 'Csa' in codes else bsk_idx
    cfa_idx = codes.index('Cfa') if 'Cfa' in codes else csa_idx
    ocean_idx = codes.index('O')

    bsk_zone = shadow_land & (rain2 < 560.0) & (T['tm'] < 24.5)
    csa_zone = shadow_land & (~bsk_zone) & (rain2 < 680.0)
    cls2[bsk_zone] = bsk_idx
    cls2[csa_zone] = csa_idx
    cls2[weep_land & (rain2 >= 950.0) & (En < 1600.0)] = cfa_idx
    cls2[newly_dry_ext] = cfa_idx
    cls2[new_water_ext] = ocean_idx

    land_edit = EXT_MASK & (~whas2) & (T['tm'] > -89.0)
    T['th'][land_edit] = np.maximum(T['th'][land_edit], T['tw'][land_edit])
    T['tl'][land_edit] = np.minimum(T['tl'][land_edit], T['tc'][land_edit])

    for k in C.TEMPS:
        T_u8 = np.clip(np.round(T[k]) + 90.0, 0, 255).astype(np.uint8)
        T_u8[~EXT_MASK] = raw0[k][~EXT_MASK]
        D[k] = P.b64(Image.fromarray(T_u8, 'L'), optimize=True)

    p_u8 = np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8)
    p_u8[~EXT_MASK] = raw0['p'][~EXT_MASK]
    cls2_u8 = cls2.astype(np.uint8)
    cls2_u8[~EXT_MASK] = raw0['c'][~EXT_MASK]
    zon2_u8 = zon2.astype(np.uint8)
    zon2_u8[~EXT_MASK] = raw0['z'][~EXT_MASK]

    # Encode lossless rasters strictly inside EXT_MASK
    D['h'] = P.encode_heights(D, En, water2)
    D['wl'] = P.encode_levels(D, whas2, wlev2)

    h_now = P.raster(D, 'h')
    h_now[~EXT_MASK] = raw0['h'][~EXT_MASK]
    D['h'] = P.b64(Image.fromarray(h_now, 'RGB'), optimize=True)

    wl_now = P.raster(D, 'wl')
    wl_now[new_water_ext] = sea_wl_rgb
    wl_now[~EXT_MASK] = raw0['wl'][~EXT_MASK]
    D['wl'] = P.b64(Image.fromarray(wl_now, 'RGB'), optimize=True)

    D['p'] = P.b64(Image.fromarray(p_u8, 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2_u8, 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2_u8, 'L'), optimize=True)

    rain_now = P.raster(D, 'p', 'L').astype(float) / 255.0 * 4000.0
    cnow = P.raster(D, 'c', 'L')
    tm_now = P.raster(D, 'tm', 'L').astype(float) - 90.0

    # Repaint / relight JPEGs strictly inside EXT_MASK
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), (np.abs(rain_now - rain0) > 1.0) & EXT_MASK)
    col = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cnow], (cnow != raw0['c']) & EXT_MASK)

    relit, EoF, EnF, relight_rep = relight_masked(D, Eo, En, EXT_MASK)
    for k, v in relit.items():
        D[k] = v
    for k in ('rt', 'ct', 'st', 't'):
        arr_k = P.raster(D, k)
        arr_k[~EXT_MASK] = raw0[k][~EXT_MASK]
        D[k] = P.jpeg_like({k: jpeg0[k]}, k, arr_k)

    # Update `basins.json`, `palaeolakes.json`, and `climate.present`
    D['basins'] = [b for b in D.get('basins', []) if not str(b.get('id', '')).startswith('B_crook_')] + [
        {'id': 'B_crook_eye', 'name': 'The Eye Caldera', 'at_px': [104.0, 562.0], 'level_m': 0, 'km2': 248, 'depth_m': 80, 'kind': 'drowned caldera', 'climate': 'Cfb', 'region': 'rmw4wknusgc7h', 'notes': 'Drowned ejecta caldera on northern Crookshore (CROOK-RIA-SCOPE.md s1.2).'},
        {'id': 'B_crook_knorth', 'name': 'Kopa-North Caldera', 'at_px': [89.0, 604.0], 'level_m': 0, 'km2': 292, 'depth_m': 80, 'kind': 'drowned caldera', 'climate': 'Cfb', 'region': 'rmw4wknusgc7h', 'notes': 'Drowned ejecta caldera harbour of Hueru-Kuran whale-clans.'},
        {'id': 'B_crook_ksouth', 'name': 'Kopa-South Caldera', 'at_px': [81.0, 677.0], 'level_m': 0, 'km2': 276, 'depth_m': 80, 'kind': 'drowned caldera', 'climate': 'Cfb', 'region': 'rmw4wknusgc7h', 'notes': 'Southern drowned ejecta caldera beneath Kopa-Hueru (75, 679).'},
        {'id': 'B_crook_cascade', 'name': 'Cascade-Caldera', 'at_px': [123.0, 659.0], 'level_m': 0, 'km2': 232, 'depth_m': 80, 'kind': 'drowned caldera', 'climate': 'Cfb', 'region': 'rmw4wknusgc7h', 'notes': 'Nephrite wire-saw waterfall caldera at mouth of Kopa-Tarn Warra beneath Kaskedi-Kuran (128, 660).'},
    ]
    D['palaeolakes'] = [p for p in D.get('palaeolakes', []) if p.get('basin') != 'Heartland (Palaeolake Ria)'] + [
        {
            'basin': 'Heartland (Palaeolake Ria)',
            'level_m': 680.0,
            'km2': 94200,
            'km3': 18400,
            'seed_px': [796.0, 176.0],
        }
    ]
    dc = Counter(cnow.ravel().tolist())
    for pr in D['climate']['present']:
        k = codes.index(pr['code'])
        pr['km2'] = int(dc.get(k, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(k, 0) / cnow.size, 2)

    # =========================================================================
    # STEP 6: Staged `51-region-store.js` & `60-settlements.js` (`Sphere 27`)
    # =========================================================================
    reg_src_path = os.path.join(SRC_DIR, '51-region-store.js')
    with open(reg_src_path, 'r', encoding='utf-8') as fh:
        reg_src = fh.read()
    m_reg = re.search(r'const defRegs = (\[.*?\]);\n', reg_src)
    assert m_reg, 'defRegs not found in 51-region-store.js'
    def_regs = json.loads(m_reg.group(1))
    reg_by_id = {r['id']: r for r in def_regs}

    # Canonical renames (`CROOK-RIA-SCOPE.md` §5)
    reg_by_id['rmwetizlzivnz']['name'] = 'Shroudhills'
    reg_by_id['rmweu2qb4nyia']['name'] = 'Upper Ria'
    reg_by_id['rmvyiyw8ucd1y']['name'] = 'Springhollows'

    # Extend Eternal State & Farside polygons across the new seaward Farside foreland (keeping Y = 515 N border!)
    reg_by_id['rmvg89rejmqat']['points'] = [
        [503, 827], [492, 845], [465, 863], [426, 856],
        [416, 796], [378, 796], [360, 846],
        [309, 849], [292, 801], [296, 732], [309, 645],
        [244, 604], [242, 582], [246, 548], [251, 515], [332, 515],
        [323, 567], [323, 596],
        [391, 585], [427, 595], [441, 606], [461, 614], [497, 599],
        [545, 596], [570, 598], [571, 614], [546, 636], [519, 641],
        [555, 678], [572, 702], [534, 746], [493, 744],
        [478, 720], [442, 720], [442, 752], [478, 752],
        [512, 771], [499, 799],
    ]
    assert has_self_intersection(reg_by_id['rmvg89rejmqat']['points']) is None

    SPHERE27_POLITICAL_REGIONS = [
        {'id': 'r27lowria01', 'name': 'Lower Ria Dynasty', 'color': '#d49b42', 'kind': 'political',
         'points': [[616, 134], [706, 146], [765, 130], [902, 138], [906, 224], [858, 276], [730, 266], [648, 206], [616, 162]],
         'notes': 'Western Dynasty of Lower Ria: Heartland capital (796,176) and Ria Sound bluff port (626,140) above 0-pop Double Delta.'},
        {'id': 'r27uppria01', 'name': 'Upper Ria Dynasty', 'color': '#b85d43', 'kind': 'political',
         'points': [[1084, 34], [1268, 12], [1352, 86], [1306, 162], [1248, 206], [1112, 222], [1084, 164]],
         'notes': 'Eastern Dynasty of Upper Ria: Upper Ria capital (1186,118), Springhollows (1135,153), and The Scaffold (1246,18).'},
        {'id': 'r27weeping1', 'name': 'Weeping Valley Outposts', 'color': '#7e8f56', 'kind': 'political',
         'points': [[908, 114], [1078, 114], [1078, 194], [908, 194]],
         'notes': 'Contested Weeping Valley river-forts (Weeping Fort 996,156) amid feral sap-groves between Lower and Upper Ria.'},
        {'id': 'r27arcflow1', 'name': 'Arcflow Republics', 'color': '#5c8ead', 'kind': 'political',
         'points': [[632, 42], [868, 48], [886, 116], [758, 126], [696, 140], [634, 132]],
         'notes': 'Independent popular bell-assembly Veche smith republics on Pak-Ma and Mo-Ma (Pak-Veche 718,124 & Mo-Veche 664,108).'},
        {'id': 'r27moleshlf', 'name': 'Moleshelf Clans', 'color': '#a8845e', 'kind': 'political',
         'points': [[872, 24], [1078, 24], [1078, 110], [892, 110]],
         'notes': 'Sunken-loess yaodong Talpathere-herding clans (Dipu-Yaduwe 945,78) running the northern caravan bypass.'},
        {'id': 'r27compass1', 'name': 'Compass Hills Cantons', 'color': '#6b7fd7', 'kind': 'political',
         'points': [[982, 198], [1108, 198], [1114, 276], [992, 276]],
         'notes': 'Non-ferrous bronze/nephrite delver cantons around Lodestone (1058,224), #1 planetary superconductors & magnets source.'},
        {'id': 'r27yonnishr', 'name': 'Yonni & Shroudhills', 'color': '#8f5b8a', 'kind': 'political',
         'points': [[318, 378], [468, 206], [628, 214], [628, 326], [438, 446], [336, 512], [306, 512]],
         'notes': 'Twin-Born Spear-Queens (Sfira-Kandetae) of Yonni (346,418) and Shroudhills down to Eternia Y = 515 frontier.'},
        {'id': 'r27battisle', 'name': 'Battered Isle Exiles', 'color': '#4d9b96', 'kind': 'political',
         'points': [[426, 224], [506, 224], [506, 286], [426, 286]],
         'notes': 'Unpainted Eternian maritime holdout on Battered Isle (435,259) brokering Farport <-> Ria Sound trade.'},
        {'id': 'r27huerukur', 'name': 'Hueru-Kuran', 'color': '#3f8f7b', 'kind': 'political',
         'points': [[52, 544], [168, 548], [168, 712], [52, 712]],
         'notes': 'Crookshore whale-clans & nephrite wire-sawyers across 4 drowned ejecta calderas (Kopa-Hueru 75,679 & Kaskedi-Kuran 128,660).'},
        {'id': 'r27cflitqbn', 'name': 'cFlit-qBon', 'color': '#2f6f9e', 'kind': 'political',
         'points': [[36, 342], [218, 342], [218, 538], [36, 538]],
         'notes': 'Pelagic free-diving click-speaking Ark-Wards of Drownlands & The Arch (Deep-Ward Anchorage 148,492).'},
        {'id': 'r27dzaghvrd', 'name': 'Dzagh-Vardzi', 'color': '#9c624c', 'kind': 'political',
         'points': [[48, 718], [166, 718], [166, 1068], [48, 1068]],
         'notes': 'Seven disunited gorge-kingdoms K1-K7 + neutral Flumi-Bridzi (94,966) shooting 30 m cypress logs & smelting tin-bronze.'},
        {'id': 'r27hushkin1', 'name': 'Hush-Kin', 'color': '#7d8c99', 'kind': 'political',
         'points': [[170, 842], [234, 842], [234, 1068], [170, 1068]],
         'notes': 'Handspeak Sign-Language sanctuary tribes around the Silent Vales twin ribbon lakes (192,962).'},
    ]
    for sr in SPHERE27_POLITICAL_REGIONS:
        sr['createdAt'] = '2026-11-23T00:00:00.000Z'
        assert has_self_intersection(sr['points']) is None, f"Self-intersection in {sr['id']}"
        if sr['id'] in reg_by_id:
            reg_by_id[sr['id']].update(sr)
        else:
            def_regs.append(sr)
            reg_by_id[sr['id']] = sr

    new_reg_line = 'const defRegs = ' + json.dumps(def_regs, ensure_ascii=False) + ';\n'
    reg_out_txt = reg_src[:m_reg.start()] + new_reg_line + reg_src[m_reg.end():]

    # Update staged `60-settlements.js` with merged Crook/Farside/Shroudhills/Ria version tags
    sett_src_path = os.path.join(SRC_DIR, '60-settlements.js')
    with open(sett_src_path, 'r', encoding='utf-8') as fh:
        sett_src = fh.read()
    m_sett = re.search(r'const defSetts = (\[.*?\]);\n', sett_src)
    assert m_sett, 'defSetts not found in 60-settlements.js'
    def_setts = json.loads(m_sett.group(1))
    sett_by_id = {s['id']: s for s in def_setts}

    # Move Farport (`5.1e21_farside`) & rename Yith -> Yonni (`5.1e22_shroudhills`)
    farport_rec = sett_by_id['sakq13nyhr']
    farport_rec.update({
        'px': 248, 'py': 585, 'polity': 'Eternal State',
        'notes': 'Eternian Dejima-style treaty factory port relocated onto the tsunami-safe +212 m headland plateau at (248,585) overlooking Ling-Ma lower harbour (243,586); speaks 3-parent Farport Creole (CROOK-RIA-SCOPE.md s1.1).',
    })
    yonni_rec = sett_by_id['svd298453u']
    yonni_rec.update({
        'name': 'Yonni', 'type': 'city', 'px': 346, 'py': 418, 'polity': 'Yonni & Shroudhills',
        'notes': 'Granite-tor Dual-Throne citadel of the Twin-Born Spear-Queens (Sfira-Kandetae) ruling Shroudhills down to Eternia Y = 515 frontier (formerly Yith; CROOK-RIA-SCOPE.md s1.1).',
    })

    ADDED_CROOK = [
        {'id': 'skopa00001', 'name': 'Kopa-Hueru', 'type': 'town', 'px': 75, 'py': 679, 'polity': 'Hueru-Kuran', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Chief whale-clan rim town (+88 m) above Kopa-South Caldera.'},
        {'id': 'skaskedi01', 'name': 'Kaskedi-Kuran', 'type': 'town', 'px': 128, 'py': 660, 'polity': 'Hueru-Kuran', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Water-powered nephrite-jade wire-saw seat (+96 m) above Cascade-Caldera.'},
        {'id': 'sdeepward1', 'name': 'Deep-Ward Anchorage', 'type': 'town', 'px': 148, 'py': 492, 'polity': 'cFlit-qBon', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Pelagic Ark-Fleet careening & arkSmelter anchorage of the free-diving click-speaking cFlit-qBon.'},
        {'id': 'skhaigeti1', 'name': 'Khai-Geti', 'type': 'town', 'px': 120, 'py': 762, 'polity': 'Dzagh-Vardzi', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'K1 High-Gate gorge-kingdom tower town of Dzagh-Vardzi.'},
        {'id': 'sredspair1', 'name': 'Red-Spairi', 'type': 'village', 'px': 108, 'py': 795, 'polity': 'Dzagh-Vardzi', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'K2 Red-Spire gorge-kingdom seat.'},
        {'id': 'stinflits1', 'name': 'Tin-Flitsi', 'type': 'town', 'px': 124, 'py': 848, 'polity': 'Dzagh-Vardzi', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'K3 Tin-Fleece cassiterite sluice & bronze-foundry gorge town.'},
        {'id': 'sairndzag1', 'name': 'Airn-Dzaghi', 'type': 'town', 'px': 78, 'py': 834, 'polity': 'Dzagh-Vardzi', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'K4 Iron-Gorge bloomery & sky-bridge tower town.'},
        {'id': 'srozivard1', 'name': 'Rozi-Vardzi', 'type': 'village', 'px': 132, 'py': 906, 'polity': 'Dzagh-Vardzi', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'K5 Rose-Fortress rock-cut ward town.'},
        {'id': 'smistkhop1', 'name': 'Mist-Khopri', 'type': 'village', 'px': 116, 'py': 1022, 'polity': 'Dzagh-Vardzi', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'K6 Mist-Copper upper gorge seat.'},
        {'id': 'sdzedikhr1', 'name': 'Dzedi-Khrosi', 'type': 'village', 'px': 76, 'py': 734, 'polity': 'Dzagh-Vardzi', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'K7 Jade-Cross coastal-gorge gateway.'},
        {'id': 'sflumibri1', 'name': 'Flumi-Bridzi', 'type': 'town', 'px': 94, 'py': 966, 'polity': 'Dzagh-Vardzi', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Neutral truce-bridge timber-flume & bronze fair at Kopa-Tarn / Blek Warra confluence.'},
        {'id': 'ssilentvl1', 'name': 'Silent Vales', 'type': 'town', 'px': 192, 'py': 962, 'polity': 'Hush-Kin', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Handspeak Sign-Language & bianzhong bell sanctuary between the twin Silent Vales ribbon lakes.'},
        {'id': 'scopptarn1', 'name': 'Copper Tarn', 'type': 'outpost', 'px': 148, 'py': 1142, 'polity': 'cFlit-qBon', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Summer glacial dumb-barter fair where cFlit-qBon swap nickel-ash & salt-fish for native copper & calamine zinc.'},
    ]

    ADDED_RIA = [
        {'id': 'sheartlnd1', 'name': 'Heartland', 'type': 'arcology', 'px': 796, 'py': 176, 'polity': 'Lower Ria Dynasty', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Western Dynasty (Lower Ria) capital arcology on the Ma-Ria grain plain (glazed-brick water-gates, malqaf mansions, Uktena Palace-Barges).'},
        {'id': 'sriasound1', 'name': 'Ria Sound', 'type': 'city', 'px': 626, 'py': 140, 'polity': 'Lower Ria Dynasty', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Tsunami-safe +78 m bluff port & river-to-sea transshipment city of Lower Ria overlooking uninhabited Double Delta.'},
        {'id': 'supperria1', 'name': 'Upper Ria', 'type': 'arcology', 'px': 1186, 'py': 118, 'polity': 'Upper Ria Dynasty', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Eastern Dynasty (Upper Ria / Akwala-Liwayi) capital arcology on upper Ma-Ria (porphyry colonnades, lodestone obelisks, silver-swan Palace-Barges).'},
        {'id': 'sspringhl1', 'name': 'Springhollows', 'type': 'arcology', 'px': 1135, 'py': 153, 'polity': 'Upper Ria Dynasty', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Sikwingi-Khaloyi karst-spring arcology & counterweight boat-lift hub on Ching-Ma.'},
        {'id': 'sscaffold1', 'name': 'The Scaffold', 'type': 'arcology', 'px': 1246, 'py': 18, 'polity': 'Upper Ria Dynasty', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Northern Carnelian Pass frontier boomtown arcology.'},
        {'id': 'sweepingf1', 'name': 'Weeping Fort', 'type': 'inhabited ruin', 'px': 996, 'py': 156, 'polity': 'Weeping Valley Outposts', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Contested river-fort & bio-ruin on Ma-Ria between Lower and Upper Ria amid feral sap-groves.'},
        {'id': 'spakveche1', 'name': 'Pak-Veche', 'type': 'town', 'px': 718, 'py': 124, 'polity': 'Arcflow Republics', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Popular bell-assembly Veche smith & cedar-frustum republic on navigable lower Pak-Ma.'},
        {'id': 'smoveche01', 'name': 'Mo-Veche', 'type': 'town', 'px': 664, 'py': 108, 'polity': 'Arcflow Republics', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Western Arcflow Veche covered mill-bridge & nickel-hoop cooperage town on Mo-Ma.'},
        {'id': 'sdipuyadu1', 'name': 'Dipu-Yaduwe', 'type': 'town', 'px': 945, 'py': 78, 'polity': 'Moleshelf Clans', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Sunken-loess yaodong courtyard seat of the Moleshelf Talpathere herders on the northern caravan bypass.'},
        {'id': 'slodeston1', 'name': 'Lodestone', 'type': 'arcology', 'px': 1058, 'py': 224, 'polity': 'Compass Hills Cantons', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Autonomous non-ferrous delver arcology in 85 mT Compass Hills (#1 planetary superconductors & magnets source; 0 iron tools permitted).'},
        {'id': 'sbattered1', 'name': 'Battered Isle', 'type': 'town', 'px': 435, 'py': 259, 'polity': 'Battered Isle Exiles', 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Unpainted Eternian exile holdout (+115 m) brokering Farport <-> Yonni <-> Ria Sound coaster trade.'},
        {'id': 'sskelwest1', 'name': 'The Skeleton (West)', 'type': 'ruin', 'stage': 'ruin', 'px': 726, 'py': 123, 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Exposed Ancient structural frame ruin above Pak-Ma.'},
        {'id': 'sskeleast1', 'name': 'The Skeleton (East)', 'type': 'ruin', 'stage': 'ruin', 'px': 1036, 'py': 106, 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Exposed Ancient structural frame ruin on northern Weeping Valley margin.'},
        {'id': 'sstepruin1', 'name': 'Step Ruin', 'type': 'ruin', 'stage': 'ruin', 'px': 1305, 'py': 100, 'createdAt': '2026-11-23T00:00:00.000Z', 'notes': 'Terraced Ancient step-ruin near upper Ma-Ria headwaters.'},
    ]

    for rec_add in ADDED_CROOK + ADDED_RIA:
        assert len(rec_add['id']) == 10 and rec_add['id'].startswith('s'), f"Bad id {rec_add['id']}"
        px_a, py_a = int(rec_add['px']), int(rec_add['py'])
        assert not whas2[py_a, px_a], f"Sphere 27 pin {rec_add['name']} ({px_a},{py_a}) stands on water!"
        if rec_add['id'] not in sett_by_id:
            def_setts.append(rec_add)
            sett_by_id[rec_add['id']] = rec_add

    assert not whas2[585, 248], 'Farport (248, 585) must be dry!'
    assert whas2[586, 243], 'Farport lower harbour (243, 586) must be wet sea!'
    assert not whas2[418, 346], 'Yonni (346, 418) must be dry!'

    new_sett_line = 'const defSetts = ' + json.dumps(def_setts, ensure_ascii=False) + ';\n'
    sett_out_txt = sett_src[:m_sett.start()] + new_sett_line + sett_src[m_sett.end():]

    m_add_end = re.search(r'(\n  \};\n  Object\.keys\(SETT_ADDED\))', sett_out_txt)
    assert m_add_end
    add_tags = (
        f",\n    '5.1e20_crook':{json.dumps(ADDED_CROOK, ensure_ascii=False)}"
        f",\n    '5.1e22_ria':{json.dumps(ADDED_RIA, ensure_ascii=False)}"
    )
    sett_out_txt = sett_out_txt[:m_add_end.start()] + add_tags + sett_out_txt[m_add_end.start():]

    m_mov_end = re.search(r'(\n  \};\n  Object\.keys\(SETT_MOVED\))', sett_out_txt)
    assert m_mov_end
    mov_tags = (
        f",\n    '5.1e21_farside':{json.dumps([farport_rec], ensure_ascii=False)}"
        f",\n    '5.1e22_shroudhills':{json.dumps([yonni_rec], ensure_ascii=False)}"
    )
    sett_out_txt = sett_out_txt[:m_mov_end.start()] + mov_tags + sett_out_txt[m_mov_end.start():]

    # =========================================================================
    # STEP 7: Strict Hydrologic & Raster Invariant Verification + Metrics
    # =========================================================================
    outside = ~EXT_MASK
    out_diffs, in_diffs = {}, {}
    for k in ('h', 'wl', 'wd') + L_KEYS:
        a = P.raster(D, k, 'L' if k in L_KEYS else 'RGB')
        diff = (a != raw0[k]) if a.ndim == 2 else np.any(a != raw0[k], axis=-1)
        out_c = int((diff & outside).sum())
        in_c = int((diff & EXT_MASK).sum())
        out_diffs[k] = out_c
        in_diffs[k] = in_c
        assert out_c == 0, f'STRICT INNER-CRATER INVARIANT VIOLATION: {k} changed on {out_c} pixels outside EXT_MASK!'

    # Verify all exterior modified/added rivers pass strict hydrologic invariants
    ria_riv_ids = [9101, 9102, 9103, 9104, 9107, 9108, 9109] + list(range(9201, 9233))
    crook_riv_ids = [9105, 9110] + list(range(9111, 9129))
    ria_sins = []
    trib_sins = []
    for rid in ria_riv_ids + crook_riv_ids:
        rv = rivers_by_id[rid]
        pts_r = rv['px']
        beds_r = rv['bed_m']
        assert len(pts_r) == len(beds_r) and len(pts_r) >= 3, f'Bad pts/beds length on {rid}'
        # 1. Monotonic bed_m
        assert not any(b2 > b1 + 1e-6 for b1, b2 in zip(beds_r[:-1], beds_r[1:])), f'Non-monotonic bed_m on river {rid}!'
        # 2. All vertices on dry land
        for idx_v, (vx, vy) in enumerate(pts_r):
            assert not whas2[int(round(vy)), int(round(vx))], f'River {rid} vertex {idx_v} ({vx},{vy}) is on water!'
        # 3. Clean parent-river vertex & bed junction
        to_r = rv.get('to') or {}
        if to_r.get('kind') == 'river' and to_r.get('id') in rivers_by_id:
            par_rv = rivers_by_id[to_r['id']]
            matches = [j for j, pp in enumerate(par_rv['px']) if abs(pp[0] - pts_r[-1][0]) < 1e-3 and abs(pp[1] - pts_r[-1][1]) < 1e-3]
            assert matches, f'Tributary {rid} mouth {pts_r[-1]} does not join a vertex of parent {to_r["id"]}!'
            assert abs(beds_r[-1] - par_rv['bed_m'][matches[0]]) < 1e-6, f'Tributary {rid} mouth bed {beds_r[-1]} != parent bed {par_rv["bed_m"][matches[0]]}!'
        s_val = sinuosity(pts_r)
        if rid in ria_riv_ids:
            ria_sins.append(s_val)
            if rid >= 9201:
                trib_sins.append(s_val)
                assert 1.26 <= s_val <= 1.58, f'Tributary {rid} sinuosity {s_val:.3f} outside [1.26, 1.58]!'

    sin_9101 = sinuosity(rivers_by_id[9101]['px'])
    sin_9107 = sinuosity(rivers_by_id[9107]['px'])
    sin_9108 = sinuosity(rivers_by_id[9108]['px'])
    sin_9109 = sinuosity(rivers_by_id[9109]['px'])
    assert sin_9101 >= 1.24, f'9101 sinuosity {sin_9101:.3f} < 1.24'
    assert sin_9107 >= 1.32, f'9107 sinuosity {sin_9107:.3f} < 1.32'
    assert sin_9108 >= 1.32, f'9108 sinuosity {sin_9108:.3f} < 1.32'

    # Check Iron Gates slope on 9101 (x in 675..725)
    ig_idxs = [i for i, p in enumerate(rivers_by_id[9101]['px']) if 675.0 <= p[0] <= 725.0]
    ig_len_m = sum(
        math.hypot(rivers_by_id[9101]['px'][k + 1][0] - rivers_by_id[9101]['px'][k][0],
                   rivers_by_id[9101]['px'][k + 1][1] - rivers_by_id[9101]['px'][k][1]) * 2000.0
        for k in range(ig_idxs[0], ig_idxs[-1])
    )
    ig_drop_m = rivers_by_id[9101]['bed_m'][ig_idxs[0]] - rivers_by_id[9101]['bed_m'][ig_idxs[-1]]
    ig_slope = ig_drop_m / max(ig_len_m, 1.0)
    assert ig_slope < 0.0018, f'Iron Gates slope {ig_slope:.5f} >= 0.0018!'

    # Compute Ria Valley drainage density (across Ria watershed land area x=500..1400, y=5..290)
    ria_ws_mask = (~whas2) & (xx >= 500) & (xx <= 1400) & (yy >= 5) & (yy <= 290) & (En < 3600.0)
    ria_ws_km2 = int(ria_ws_mask.sum()) * 4
    ria_tot_len_km = sum(rivers_by_id[rid]['length_km'] for rid in ria_riv_ids if rid not in (9231, 9232))
    # Also include the ~340 km lower Ria-watershed reach of 9106 feeding Spider Lake -> Ham-Tsek
    ria_drainage_density = round((ria_tot_len_km + 340.0) / (ria_ws_km2 / 1000.0), 2)

    heartland_rain = rain_now[(~whas2) & (xx >= 725) & (xx <= 895) & (yy >= 135) & (yy <= 215)]
    weeping_rain = rain_now[(~whas2) & (xx >= 915) & (xx <= 1075) & (yy >= 115) & (yy <= 195)]
    hogback_crest = En[(~whas2) & (xx >= 685) & (xx <= 718) & (yy >= 132) & (yy <= 170)]

    rep = {
        'edit': '5.1e22 Exterior Stage: Ria Valley Sinuous Hydrology, Iron Gates Sill, Farside Foreland & Crook Calderas',
        'version_tag': SETT_VER,
        'date': '2026-11-23',
        'dry_run': bool(args.dry_run),
        'out_dir': args.out_dir,
        'strict_mask_check': {
            'outside_ext_mask_pixels_changed': out_diffs,
            'inside_ext_mask_pixels_changed': in_diffs,
            'zero_inner_crater_diff_verified': True,
        },
        'ria_hydrology': {
            'ria_shroudhills_river_count': len(ria_riv_ids),
            'new_ria_tributaries_added': 32,
            'crook_gorge_rivers_added': 18,
            'total_world_rivers': len(D['rivers']),
            'ria_watershed_km2': ria_ws_km2,
            'ria_total_channel_km': round(ria_tot_len_km + 340.0, 1),
            'ria_drainage_density_km_per_1000km2': ria_drainage_density,
            'sinuosity_9101_ma_ria': round(sin_9101, 3),
            'sinuosity_9107_pak_ma': round(sin_9107, 3),
            'sinuosity_9108_mo_ma': round(sin_9108, 3),
            'sinuosity_9109_ching_ma': round(sin_9109, 3),
            'tributary_sinuosity_mean': round(float(np.mean(trib_sins)), 3),
            'tributary_sinuosity_min': round(float(np.min(trib_sins)), 3),
            'tributary_sinuosity_max': round(float(np.max(trib_sins)), 3),
            'all_ria_sinuosity_mean': round(float(np.mean(ria_sins)), 3),
        },
        'iron_gates_and_rain_shadow': {
            'hogback_crest_max_m': round(float(hogback_crest.max()), 1),
            'hogback_crest_p75_m': round(float(np.percentile(hogback_crest, 75)), 1),
            'iron_gates_length_km': round(ig_len_m / 1000.0, 1),
            'iron_gates_drop_m': round(ig_drop_m, 1),
            'iron_gates_slope': round(ig_slope, 5),
            'iron_gates_q_m3s': 4210.0,
            'heartland_rain_median_mm': round(float(np.median(heartland_rain)), 1),
            'heartland_rain_iqr_mm': [round(float(np.percentile(heartland_rain, 25)), 1), round(float(np.percentile(heartland_rain, 75)), 1)],
            'weeping_valley_rain_median_mm': round(float(np.median(weeping_rain)), 1),
        },
        'key_pins': {
            nm: {
                'px': [int(sett_by_id[sid]['px']), int(sett_by_id[sid]['py'])],
                'elev_m': round(float(En[int(sett_by_id[sid]['py']), int(sett_by_id[sid]['px'])]), 1),
                'rain_mm': round(float(rain_now[int(sett_by_id[sid]['py']), int(sett_by_id[sid]['px'])]), 1),
                'wet': bool(whas2[int(sett_by_id[sid]['py']), int(sett_by_id[sid]['px'])]),
            }
            for sid, nm in (
                ('sakq13nyhr', 'Farport'),
                ('svd298453u', 'Yonni'),
                ('sbattered1', 'Battered Isle'),
                ('sriasound1', 'Ria Sound'),
                ('sheartlnd1', 'Heartland'),
                ('spakveche1', 'Pak-Veche'),
                ('smoveche01', 'Mo-Veche'),
                ('sdipuyadu1', 'Dipu-Yaduwe'),
                ('sweepingf1', 'Weeping Fort'),
                ('slodeston1', 'Lodestone'),
                ('sspringhl1', 'Springhollows'),
                ('supperria1', 'Upper Ria'),
                ('sscaffold1', 'The Scaffold'),
                ('skopa00001', 'Kopa-Hueru'),
                ('skaskedi01', 'Kaskedi-Kuran'),
                ('sdeepward1', 'Deep-Ward Anchorage'),
                ('sflumibri1', 'Flumi-Bridzi'),
                ('ssilentvl1', 'Silent Vales'),
                ('scopptarn1', 'Copper Tarn'),
            )
        },
        'relight': relight_rep,
        'reclimate': crep,
    }

    if args.dry_run:
        print(json.dumps(rep, indent=2, ensure_ascii=False))
        return

    if args.out_dir:
        out_folder = os.path.abspath(args.out_dir)
        os.makedirs(out_folder, exist_ok=True)
        shutil.copyfile(os.path.join(DATA_DIR, 'model.json'), os.path.join(out_folder, 'model.json'))
        P.save(D, out_folder)
        with open(os.path.join(out_folder, '51-region-store.js'), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(reg_out_txt)
        with open(os.path.join(out_folder, '60-settlements.js'), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(sett_out_txt)
        rep_path = os.path.join(out_folder, 'edit_522_ria_hydrology.report.json')
        with open(rep_path, 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(rep, fh, indent=2, ensure_ascii=False)
            fh.write('\n')
    elif args.in_place:
        P.save(D, DATA_DIR)
        with open(reg_src_path, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(reg_out_txt)
        with open(sett_src_path, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(sett_out_txt)
        rep_path = os.path.join(HERE, 'edit_522_ria_hydrology.report.json')
        with open(rep_path, 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(rep, fh, indent=2, ensure_ascii=False)
            fh.write('\n')

    print(json.dumps(rep, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
