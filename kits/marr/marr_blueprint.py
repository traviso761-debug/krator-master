#!/usr/bin/env python3
"""Blueprint generator for Marr (kits/marr):
1. World-map siting figure (`kits/marr/blueprint/world_siting.png`)
2. City layout masterplan (`kits/marr/blueprint/city_layout.png`)
3. Inhabited interior courtyard archetypes (`kits/marr/blueprint/courtyard_types.png`)
4. Navigators' Guild Headquarters (`Gilda de Navigadarz`) floor blueprints & furniture manifest (`kits/marr/blueprint/navigators_guild/`)

All in-world names are derived from the Izani tab of `lore/tongues-of-krator.html` (`tools/names/izani.py`).
"""
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'settlements', 'iziz', 'palace'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'scale-model'))
import iziz_blueprint as IZ
import blueprint as B
from blueprint import R, box
from smodel import page as P

OUT_DIR = os.path.join(HERE, 'blueprint')
os.makedirs(OUT_DIR, exist_ok=True)


def draw_world_siting():
    """Render annotated regional map of the Empire of Iziz & Ring Sea coast showing Marr at (926, 1014)."""
    D = P.load()
    st = P.raster(D, 'st')
    E, water = P.heights(D)
    regs = P.regions()
    setts = P.settlements()
    iziz_reg = next(r for r in regs if r['name'] == 'Empire of Iziz')

    # Crop window around Empire of Iziz and Ring Sea coast
    x0, x1, y0, y1 = 835, 1105, 885, 1085
    scale = 5
    crop = st[y0:y1, x0:x1]
    W, H = (x1 - x0) * scale, (y1 - y0) * scale
    img = Image.fromarray(crop).resize((W, H), Image.Resampling.BILINEAR)
    dr = ImageDraw.Draw(img, 'RGBA')

    f_title = B.font(21, True)
    f_sub = B.font(14, False)
    f_b = B.font(15, True)
    f_s = B.font(13, False)

    def M(px, py):
        return int((px - x0) * scale), int((py - y0) * scale)

    # Draw Empire of Iziz boundary
    pts = [M(p[0], p[1]) for p in iziz_reg['points']]
    dr.line(pts + [pts[0]], fill=(255, 145, 40, 230), width=3)

    # Draw rivers in crop
    for r in D['rivers']:
        rpts = [M(p[0], p[1]) for p in r['px'] if x0 <= p[0] <= x1 and y0 <= p[1] <= y1]
        if len(rpts) >= 2:
            is_cistal = r['id'] in ('r025', 'r339')
            col = (70, 225, 255, 255) if is_cistal else (90, 175, 240, 185)
            w = 4 if is_cistal else max(1, int(r.get('width_m', 10) / 22))
            dr.line(rpts, fill=col, width=w)
            if r['id'] == 'r025':
                mx, my = rpts[len(rpts) // 2]
                lbl = "r025 Rrivar Cistal (56m, 152 m3/s)"
                tw = dr.textbbox((0, 0), lbl, font=f_s)[2]
                dr.rectangle([mx - tw - 16, my - 10, mx - 6, my + 12], fill=(10, 22, 36, 215), outline=(70, 225, 255, 220))
                dr.text((mx - tw - 11, my - 8), lbl, font=f_s, fill=(130, 235, 255))
            elif r['id'] == 'r339':
                mx, my = rpts[len(rpts) // 2]
                lbl = "r339 Rrivar stara (33m, 55 m3/s)"
                tw = dr.textbbox((0, 0), lbl, font=f_s)[2]
                dr.rectangle([mx + 8, my - 10, mx + tw + 18, my + 12], fill=(10, 22, 36, 215), outline=(70, 225, 255, 220))
                dr.text((mx + 13, my - 8), lbl, font=f_s, fill=(130, 235, 255))

    # Show raw pin at (926, 1017) and arrow to 1:1 shoreline (926, 1014)
    rx0, ry0 = M(926, 1017)
    rx1, ry1 = M(926, 1014)
    dr.ellipse([rx0 - 5, ry0 - 5, rx0 + 5, ry0 + 5], outline=(255, 200, 120, 220), width=2)
    dr.line([(rx0, ry0), (rx1, ry1)], fill=(255, 220, 90, 255), width=2)

    # Draw settlements
    for s in setts:
        px, py = s['px'], s['py']
        if x0 <= px <= x1 and y0 <= py <= y1:
            sx, sy = M(px, py)
            is_marr = (s['name'] == 'Marr')
            if is_marr:
                dr.ellipse([sx - 14, sy - 14, sx + 14, sy + 14], fill=(255, 90, 30, 90), outline=(255, 220, 80, 255), width=3)
                dr.ellipse([sx - 6, sy - 6, sx + 6, sy + 6], fill=(255, 70, 20, 255), outline=(255, 255, 255, 255), width=2)
                t1 = "MARR / PORTA MARR (px 926, py 1014 — moved from 926,1017)"
                t2 = "1:1 Cistal Estuary Shore (-1,514m; Rrivar Cistal + Rrivar stara)"
                bw = max(dr.textbbox((0, 0), t1, font=f_b)[2], dr.textbbox((0, 0), t2, font=f_s)[2]) + 18
                dr.rectangle([sx + 16, sy - 24, sx + 16 + bw, sy + 18], fill=(20, 14, 10, 235), outline=(255, 160, 50, 255), width=2)
                dr.text((sx + 22, sy - 20), t1, font=f_b, fill=(255, 210, 90))
                dr.text((sx + 22, sy - 1), t2, font=f_s, fill=(240, 235, 225))
            else:
                col = (240, 180, 40, 255) if s['type'] == 'city' else (70, 195, 130, 255)
                dr.ellipse([sx - 5, sy - 5, sx + 5, sy + 5], fill=col, outline=(15, 15, 18, 255), width=2)
                nm = s['name'].encode('ascii', 'replace').decode()
                label = f"{nm} ({px},{py})"
                tw = dr.textbbox((0, 0), label, font=f_s)[2]
                dr.rectangle([sx + 8, sy - 9, sx + 14 + tw, sy + 10], fill=(12, 12, 16, 195))
                dr.text((sx + 11, sy - 7), label, font=f_s, fill=(242, 239, 232))

    # Header banner
    dr.rectangle([0, 0, W, 76], fill=(14, 16, 22, 235))
    dr.text((20, 12), "SITING OF MARR ON THE WORLD MAP (Empar de Son / Empire of Iziz, Cistal Estuary — Scale Model 5.1)", font=f_title, fill=(255, 220, 140))
    dr.text((20, 44), "Nudged 3 px N from (926, 1017) to the 1:1 shoreline at (px 926, py 1014): head of the Cistal Fjord where Rrivar Cistal (56m) & Rrivar stara (33m) meet the Ring Sea.", font=f_sub, fill=(220, 225, 230))

    path = os.path.join(OUT_DIR, 'world_siting.png')
    img.save(path)
    print('wrote', path)


def draw_inhabited_patio(dr, x0, y0, x1, y1, kind, seed=0):
    """Draw inhabited courtyard details (Korta de Plejar, Korta de Gardon, or Yarda de Guorka) inside [x0,y0,x1,y1]."""
    w, h = x1 - x0, y1 - y0
    if w < 14 or h < 14:
        return
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    if kind == 'pleasure':
        # Checkerboard/stone patio with central tile pool or scalloped fountain & lush perimeter planting
        dr.rectangle([x0, y0, x1, y1], fill=(238, 230, 214), outline=(140, 115, 90), width=1)
        bw = max(4, min(10, int(min(w, h) * 0.18)))
        for rx0, ry0, rx1, ry1 in [
            (x0 + 2, y0 + 2, x0 + bw, y0 + bw),
            (x1 - bw, y0 + 2, x1 - 2, y0 + bw),
            (x0 + 2, y1 - bw, x0 + bw, y1 - 2),
            (x1 - bw, y1 - bw, x1 - 2, y1 - 2),
        ]:
            dr.rectangle([rx0, ry0, rx1, ry1], fill=(86, 152, 82), outline=(55, 105, 52), width=1)
        dr.line([(x0 + 2, cy), (x1 - 2, cy)], fill=(195, 185, 168), width=2)
        dr.line([(cx, y0 + 2), (cx, y1 - 2)], fill=(195, 185, 168), width=2)
        pw, ph = max(5, int(w * 0.34)), max(5, int(h * 0.30))
        dr.rectangle([cx - pw / 2, cy - ph / 2, cx + pw / 2, cy + ph / 2], fill=(64, 168, 176), outline=(35, 105, 115), width=2)
        dr.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(220, 245, 250), outline=(40, 90, 100), width=1)
    elif kind == 'vegetable':
        # Kitchen & vegetable garden (Korta de Gardon): raised crop rows, trellis, cistern well, and brick summer-kitchen/shed
        dr.rectangle([x0, y0, x1, y1], fill=(218, 204, 178), outline=(130, 110, 82), width=1)
        rows = max(2, min(4, int(h // 12)))
        bed_h = max(3, int((h - 10) / (rows * 1.45)))
        for r in range(rows):
            by0 = y0 + 4 + r * int(bed_h * 1.35)
            by1 = min(y1 - 4, by0 + bed_h)
            if by1 > by0 + 2:
                dr.rectangle([x0 + 4, by0, x0 + int(w * 0.62), by1], fill=(98, 158, 72), outline=(72, 110, 50), width=1)
        sx0, sy0 = x1 - max(6, int(w * 0.28)), y1 - max(6, int(h * 0.28))
        dr.rectangle([sx0, sy0, x1 - 3, y1 - 3], fill=(196, 122, 82), outline=(90, 50, 30), width=1)
        wx, wy = x1 - max(5, int(w * 0.18)), y0 + max(5, int(h * 0.22))
        dr.ellipse([wx - 3, wy - 3, wx + 3, wy + 3], fill=(90, 150, 185), outline=(60, 60, 65), width=1)
    else:
        # Working / tenement yard (Yarda de Guorka): cobbled yard, communal stone wash-basin, laundry lines, bread oven, outbuildings
        dr.rectangle([x0, y0, x1, y1], fill=(198, 188, 172), outline=(110, 100, 88), width=1)
        dr.rectangle([cx - 5, cy - 3, cx + 5, cy + 3], fill=(82, 142, 168), outline=(60, 65, 70), width=1)
        dr.rectangle([x0 + 2, y0 + 2, x0 + max(6, int(w * 0.26)), y0 + max(5, int(h * 0.24))], fill=(168, 112, 78), outline=(80, 50, 35), width=1)
        dr.rectangle([x1 - max(6, int(w * 0.26)), y1 - max(5, int(h * 0.24)), x1 - 2, y1 - 2], fill=(152, 118, 86), outline=(80, 50, 35), width=1)
        dr.line([(x0 + 3, y0 + int(h * 0.35)), (x1 - 3, y0 + int(h * 0.65))], fill=(235, 230, 220), width=1)
        dr.line([(x0 + 3, y0 + int(h * 0.68)), (x1 - 3, y0 + int(h * 0.38))], fill=(235, 230, 220), width=1)


def _bilerp(q, u, v):
    x = (1 - u) * (1 - v) * q[0][0] + u * (1 - v) * q[1][0] + u * v * q[2][0] + (1 - u) * v * q[3][0]
    y = (1 - u) * (1 - v) * q[0][1] + u * (1 - v) * q[1][1] + u * v * q[2][1] + (1 - u) * v * q[3][1]
    return (int(round(x)), int(round(y)))


def _inset_quad(q, px):
    cx = sum(p[0] for p in q) / 4.0
    cy = sum(p[1] for p in q) / 4.0
    out = []
    for x, y in q:
        dx, dy = cx - x, cy - y
        d = max(1.0, math.hypot(dx, dy))
        k = min(0.45, (px * 1.35) / d)
        out.append((int(round(x + dx * k)), int(round(y + dy * k))))
    return out


def _bilerp_pts(p00, p10, p11, p01, u, v):
    x = (1 - u) * (1 - v) * p00[0] + u * (1 - v) * p10[0] + u * v * p11[0] + (1 - u) * v * p01[0]
    y = (1 - u) * (1 - v) * p00[1] + u * (1 - v) * p10[1] + u * v * p11[1] + (1 - u) * v * p01[1]
    return (x, y)



def _shrink_poly_toward_centroid(pts_m, margin_m):
    """Inset a polygon (in metres) inward along each vertex's normal/bisector by margin_m."""
    n = len(pts_m)
    area2 = sum(pts_m[i][0] * pts_m[(i + 1) % n][1] - pts_m[(i + 1) % n][0] * pts_m[i][1] for i in range(n))
    sgn = 1.0 if area2 > 0 else -1.0
    out = []
    for i in range(n):
        p_prev = pts_m[(i - 1 + n) % n]
        p_cur = pts_m[i]
        p_next = pts_m[(i + 1) % n]
        dx1, dz1 = p_cur[0] - p_prev[0], p_cur[1] - p_prev[1]
        l1 = math.hypot(dx1, dz1) or 1.0
        n1 = (-sgn * dz1 / l1, sgn * dx1 / l1)
        dx2, dz2 = p_next[0] - p_cur[0], p_next[1] - p_cur[1]
        l2 = math.hypot(dx2, dz2) or 1.0
        n2 = (-sgn * dz2 / l2, sgn * dx2 / l2)
        mx, mz = n1[0] + n2[0], n1[1] + n2[1]
        ml = math.hypot(mx, mz) or 1.0
        mx, mz = mx / ml, mz / ml
        dot = max(0.45, mx * n2[0] + mz * n2[1])
        k = margin_m / dot
        out.append((p_cur[0] + mx * k, p_cur[1] + mz * k))
    return out


def _khash_unit(seed, a, b=0, c=0):
    """Deterministic hash in [0, 1) matching core/city/37-city-grid.js (KRAND.hash / KRAND.unit)."""
    h = (int(seed) ^ (int(a) * 374761393) ^ (int(b) * 668265263) ^ (int(c) * 2147483647)) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    h = (h ^ (h >> 16)) & 0xFFFFFFFF
    return (h & 0x7FFFFFFF) / float(0x80000000)


def _khash_sym(seed, a, b=0, c=0):
    return _khash_unit(seed, a, b, c) * 2.0 - 1.0


def build_kirstabal_jitter_island(map_uv_to_m, nu, nv, seed, jit=0.21, pDrop=0.25, pBend=0.42, ave_u=None, ave_v=None):
    """Port of core/city/37-city-grid.js (from claude/kirstabal-plan-3bc37d-sl8bg9) mapped onto a curving island domain map_uv_to_m(u, v).
    - Inner grid lines wander by S(seed, 11/12, i) * jit
    - Inner crossings are nudged by S(seed, 13/14, i, j) * jit * 0.52
    - Internal edges drop with probability pDrop (never on avenue lines, never leaving a crossing with degree < 2, never disconnecting the grid), merging adjacent cells into irregular L-shaped or double blocks!
    - Street runs bend at their midpoint with probability pBend.
    Returns (cells_polys_m, street_polylines_m).
    """
    if ave_u is None:
        ave_u = nv // 2
    if ave_v is None:
        ave_v = nu // 2

    du, dv = 1.0 / nu, 1.0 / nv
    au = [i * du + (_khash_sym(seed, 11, i) * jit * du if 0 < i < nu else 0.0) for i in range(nu + 1)]
    bv = [j * dv + (_khash_sym(seed, 12, j) * jit * dv if 0 < j < nv else 0.0) for j in range(nv + 1)]

    # Nodes N[i][j] in world metres, conforming strictly to the island boundary at i=0,nu and j=0,nv
    N = [[None] * (nv + 1) for _ in range(nu + 1)]
    for i in range(nu + 1):
        for j in range(nv + 1):
            u = au[i]
            v = bv[j]
            if 0 < i < nu and 0 < j < nv:
                u += _khash_sym(seed, 13, i, j) * jit * du * 0.52
                v += _khash_sym(seed, 14, i, j) * jit * dv * 0.52
            u = max(0.0, min(1.0, u))
            v = max(0.0, min(1.0, v))
            if i == 0:
                u = 0.0
            elif i == nu:
                u = 1.0
            if j == 0:
                v = 0.0
            elif j == nv:
                v = 1.0
            N[i][j] = map_uv_to_m(u, v)

    # Internal edges E and degree/connectivity check from 37-city-grid.js
    E = []
    for j in range(1, nv):
        for i in range(nu):
            E.append({'line': 'u', 'index': j, 'a': (i, j), 'b': (i + 1, j), 'dropped': False})
    for i in range(1, nu):
        for j in range(nv):
            E.append({'line': 'v', 'index': i, 'a': (i, j), 'b': (i, j + 1), 'dropped': False})

    ring_edges = []
    for i in range(nu):
        ring_edges.append(((i, 0), (i + 1, 0)))
        ring_edges.append(((i, nv), (i + 1, nv)))
    for j in range(nv):
        ring_edges.append(((0, j), (0, j + 1)))
        ring_edges.append(((nu, j), (nu, j + 1)))

    def live_edges():
        return [(e['a'], e['b']) for e in E if not e['dropped']] + ring_edges

    def deg_map():
        d = {}
        for a, b in live_edges():
            d[a] = d.get(a, 0) + 1
            d[b] = d.get(b, 0) + 1
        return d

    def is_connected():
        adj = {}
        for a, b in live_edges():
            adj.setdefault(a, []).append(b)
            adj.setdefault(b, []).append(a)
        seen = {(0, 0)}
        stack = [(0, 0)]
        while stack:
            cur = stack.pop()
            for nxt in adj.get(cur, ()):
                if nxt not in seen:
                    seen.add(nxt)
                    stack.append(nxt)
        return all(k in seen for k in adj)

    for n_idx, e in enumerate(E):
        if (e['line'] == 'u' and e['index'] == ave_u) or (e['line'] == 'v' and e['index'] == ave_v):
            continue
        if _khash_unit(seed, 41, n_idx) >= pDrop:
            continue
        d = deg_map()
        if d.get(e['a'], 0) <= 2 or d.get(e['b'], 0) <= 2:
            continue
        e['dropped'] = True
        if not is_connected():
            e['dropped'] = False

    def edge_pts(a, b, n_idx):
        A, B = N[a[0]][a[1]], N[b[0]][b[1]]
        if _khash_unit(seed, 51, n_idx) >= pBend:
            return [A, B]
        dx, dz = B[0] - A[0], B[1] - A[1]
        L = math.hypot(dx, dz) or 1.0
        k = _khash_sym(seed, 52, n_idx) * 0.065 * L
        mid = ((A[0] + B[0]) * 0.5 - dz / L * k, (A[1] + B[1]) * 0.5 + dx / L * k)
        return [A, mid, B]

    street_lines = []
    for n_idx, e in enumerate(E):
        if not e['dropped']:
            street_lines.append((e['line'] == 'u' and e['index'] == ave_u or e['line'] == 'v' and e['index'] == ave_v, edge_pts(e['a'], e['b'], n_idx)))

    # Build cells (and merge cells where a shared edge was dropped!)
    dropped_set = set()
    for e in E:
        if e['dropped']:
            if e['line'] == 'u':
                # Horizontal edge at j = e['index'], separating cell (i, j-1) and (i, j)
                i, j = e['a'][0], e['index']
                dropped_set.add(((i, j - 1), (i, j)))
                dropped_set.add(((i, j), (i, j - 1)))
            else:
                # Vertical edge at i = e['index'], separating cell (i-1, j) and (i, j)
                i, j = e['index'], e['a'][1]
                dropped_set.add(((i - 1, j), (i, j)))
                dropped_set.add(((i, j), (i - 1, j)))

    cells_out = []
    visited = set()
    for i in range(nu):
        for j in range(nv):
            if (i, j) in visited:
                continue
            # Check if merged with right neighbor (i+1, j) or bottom neighbor (i, j+1)
            if i + 1 < nu and ((i, j), (i + 1, j)) in dropped_set and (i + 1, j) not in visited:
                visited.add((i, j))
                visited.add((i + 1, j))
                poly = [N[i][j], N[i + 1][j], N[i + 2][j], N[i + 2][j + 1], N[i + 1][j + 1], N[i][j + 1]]
                quad_approx = [N[i][j], N[i + 2][j], N[i + 2][j + 1], N[i][j + 1]]
                cells_out.append({'i': i, 'j': j, 'poly': poly, 'quad': quad_approx, 'merged': 'u'})
            elif j + 1 < nv and ((i, j), (i, j + 1)) in dropped_set and (i, j + 1) not in visited:
                visited.add((i, j))
                visited.add((i, j + 1))
                poly = [N[i][j], N[i + 1][j], N[i + 1][j + 1], N[i + 1][j + 2], N[i][j + 2], N[i][j + 1]]
                quad_approx = [N[i][j], N[i + 1][j], N[i + 1][j + 2], N[i][j + 2]]
                cells_out.append({'i': i, 'j': j, 'poly': poly, 'quad': quad_approx, 'merged': 'v'})
            else:
                visited.add((i, j))
                q = [N[i][j], N[i + 1][j], N[i + 1][j + 1], N[i][j + 1]]
                cells_out.append({'i': i, 'j': j, 'poly': q, 'quad': q, 'merged': None})

    return cells_out, street_lines, N



def _inset_quad_perp(q, dist_px):
    """Inset a 4-point pixel polygon inward by dist_px perpendicular to each edge."""
    pts = [(float(x), float(y)) for x, y in q]
    res = _shrink_poly_toward_centroid(pts, float(dist_px))
    return [(int(round(x)), int(round(y))) for x, y in res]


def _ortho_courtyard_in_quad(lot_q, depth_px, max_aspect=1.15, fixed_angle=None):
    """Compute a true 90-degree orthogonal, near-square courtyard polygon centered inside lot_q,
    turning freely at the exact angle of lot_q (or fixed_angle) with zero artificial angle clamping."""
    in_q = _shrink_poly_toward_centroid([(float(x), float(y)) for x, y in lot_q], float(depth_px))
    cx = sum(p[0] for p in in_q) / 4.0
    cy = sum(p[1] for p in in_q) / 4.0

    if fixed_angle is not None:
        ang = float(fixed_angle)
    else:
        ux1, uy1 = in_q[1][0] - in_q[0][0], in_q[1][1] - in_q[0][1]
        ux2, uy2 = in_q[2][0] - in_q[3][0], in_q[2][1] - in_q[3][1]
        vx1, vy1 = in_q[3][0] - in_q[0][0], in_q[3][1] - in_q[0][1]
        vx2, vy2 = in_q[2][0] - in_q[1][0], in_q[2][1] - in_q[1][1]
        tx = (ux1 + ux2) + (vy1 + vy2)
        ty = (uy1 + uy2) - (vx1 + vx2)
        ang = math.atan2(ty, tx)

    ux, uy = math.cos(ang), math.sin(ang)
    vx, vy = -uy, ux

    area2 = sum(in_q[i][0] * in_q[(i + 1) % 4][1] - in_q[(i + 1) % 4][0] * in_q[i][1] for i in range(4))
    sgn = 1.0 if area2 > 0 else -1.0
    constraints = []
    for i in range(4):
        ax, ay = in_q[i][0] - cx, in_q[i][1] - cy
        bx, by = in_q[(i + 1) % 4][0] - cx, in_q[(i + 1) % 4][1] - cy
        au, av = ax * ux + ay * uy, ax * vx + ay * vy
        bu, bv = bx * ux + by * uy, bx * vx + by * vy
        du, dv = bu - au, bv - av
        el = math.hypot(du, dv) or 1.0
        nu, nv = sgn * dv / el, -sgn * du / el
        dist = nu * au + nv * av
        if dist < 2.0:
            dist = 2.0
        constraints.append((abs(nu), abs(nv), dist))

    w0 = min(d / max(0.25, anu + 0.65 * anv) for anu, anv, d in constraints)
    h0 = min(d / max(0.25, 0.65 * anu + anv) for anu, anv, d in constraints)
    wh = min(w0, h0 * max_aspect)
    hh = min(h0, w0 * max_aspect)
    s = min(1.0, min(d / max(1e-6, anu * wh + anv * hh) for anu, anv, d in constraints))
    wh = max(3.5, wh * s * 0.94)
    hh = max(3.5, hh * s * 0.94)

    corners_uv = [(-wh, -hh), (wh, -hh), (wh, hh), (-wh, hh)]
    pat_q = [(int(round(cx + u * ux + v * vx)), int(round(cy + u * uy + v * vy))) for u, v in corners_uv]
    return pat_q, (cx, cy, ux, uy, vx, vy, wh, hh)


def draw_park_or_market_poly(dr, poly_px, kind='market', label=None, f_lbl=None, label_queue=None):
    """Render a triangular/trapezoidal Park (Gardon) or Market (Markita) formed where turning blocks
    break the street grid and the empty space exceeds >50% of the lot/wedge threshold."""
    if f_lbl is None:
        f_lbl = B.font(11, True)
    pts = [(float(x), float(y)) for x, y in poly_px]
    in_pts = _shrink_poly_toward_centroid(pts, 2.0)
    q_draw = [(int(round(x)), int(round(y))) for x, y in in_pts]
    cx = sum(p[0] for p in in_pts) / len(in_pts)
    cy = sum(p[1] for p in in_pts) / len(in_pts)
    ux = in_pts[1][0] - in_pts[0][0]
    uy = in_pts[1][1] - in_pts[0][1]
    ang = math.atan2(uy, ux)
    c_u, s_u = math.cos(ang), math.sin(ang)
    c_v, s_v = -s_u, c_u

    if kind == 'park':
        dr.polygon(q_draw, fill=(182, 214, 152), outline=(82, 112, 64), width=2)
        inner_path = _shrink_poly_toward_centroid(in_pts, 4.0)
        dr.polygon([(int(round(x)), int(round(y))) for x, y in inner_path], fill=(198, 224, 168), outline=(224, 214, 192), width=2)
        # Central fountain basin in the park
        icx, icy = int(round(cx)), int(round(cy))
        dr.ellipse([icx - 5, icy - 5, icx + 5, icy + 5], fill=(64, 168, 176), outline=(40, 95, 105), width=1)
        dr.ellipse([icx - 2, icy - 2, icx + 2, icy + 2], fill=(228, 248, 252))
        # Shade trees distributed inside the park polygon
        for k_idx, corner in enumerate(inner_path):
            tx = int(round(0.38 * cx + 0.62 * corner[0]))
            ty = int(round(0.38 * cy + 0.62 * corner[1]))
            r_t = 4 if k_idx % 2 == 0 else 3
            dr.ellipse([tx - r_t, ty - r_t, tx + r_t, ty + r_t], fill=(64, 134, 58), outline=(38, 84, 34))
    else:
        # Open-air Market plaza (Markita) with paved cobbles and colorful merchant awning stalls
        dr.polygon(q_draw, fill=(234, 220, 196), outline=(118, 92, 66), width=2)
        inner_mkt = _shrink_poly_toward_centroid(in_pts, 3.5)
        dr.polygon([(int(round(x)), int(round(y))) for x, y in inner_mkt], fill=(242, 230, 208), outline=(165, 142, 114), width=1)
        stall_cols = [(228, 108, 48), (64, 158, 152), (234, 178, 62), (196, 78, 52), (246, 238, 220)]
        for si, u_off in enumerate((-14.0, -4.5, 4.5, 14.0)):
            for vi, v_off in enumerate((-4.5, 4.5)):
                sx = cx + u_off * c_u + v_off * c_v
                sy = cy + u_off * s_u + v_off * s_v
                # Check stall lies well inside the polygon
                if min(math.hypot(sx - p[0], sy - p[1]) for p in in_pts) > 4.0:
                    hw, hh = 3.6, 2.2
                    st_q = [
                        (int(round(sx + du * c_u + dv * c_v)), int(round(sy + du * s_u + dv * s_v)))
                        for du, dv in ((-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh))
                    ]
                    dr.polygon(st_q, fill=stall_cols[(si + vi) % len(stall_cols)], outline=(55, 38, 24))

    if label:
        icx, icy = int(round(cx)), int(round(cy))
        tw = dr.textbbox((0, 0), label, font=f_lbl)[2]
        if label_queue is not None:
            label_queue.append((icx, icy + 2, tw, label, f_lbl))
        else:
            dr.rectangle([icx - tw // 2 - 4, icy - 6, icx + tw // 2 + 4, icy + 9], fill=(252, 248, 240, 232), outline=(90, 65, 45))
            dr.text((icx - tw // 2, icy - 4), label, font=f_lbl, fill=(35, 25, 18))


def _ortho_rect_inside_quad(q_px, ang, shrink_px=0.5):
    """Return a true 90-degree rectangle (turned at `ang`) centered inside `q_px`
    that fits cleanly inside `q_px` without parallelogram skew, regardless of vertex winding."""
    pts = [(float(x), float(y)) for x, y in q_px]
    cx = sum(p[0] for p in pts) / 4.0
    cy = sum(p[1] for p in pts) / 4.0
    ux, uy = math.cos(ang), math.sin(ang)
    vx, vy = -uy, ux

    # Project vertices into (u, v) frame centered at (cx, cy) and sort to find inscribed bounds
    us_s = sorted((p[0] - cx) * ux + (p[1] - cy) * uy for p in pts)
    vs_s = sorted((p[0] - cx) * vx + (p[1] - cy) * vy for p in pts)
    u_neg, u_pos = us_s[1], us_s[2]
    v_neg, v_pos = vs_s[1], vs_s[2]
    wh = max(6.0, 0.5 * (u_pos - u_neg) - shrink_px)
    hh = max(6.0, 0.5 * (v_pos - v_neg) - shrink_px)
    uc = 0.5 * (u_pos + u_neg)
    vc = 0.5 * (v_pos + v_neg)
    rcx = cx + uc * ux + vc * vx
    rcy = cy + uc * uy + vc * vy
    corners = [(-wh, -hh), (wh, -hh), (wh, hh), (-wh, hh)]
    return [(int(round(rcx + du * ux + dv * vx)), int(round(rcy + du * uy + dv * vy))) for du, dv in corners]


def _draw_single_lot_centered(dr, outer_q, core_q, wall_col, roof_col, k, depth_px=5, fixed_angle=None, show_growth_seam=False):
    """Draw a single lot where `outer_q` is the full built footprint (including any built wing grown
    to cover a street-grid break) and `core_q` is the turned 90-degree orthogonal core inside which
    the courtyard remains centered and rotated along with the block."""
    dr.polygon(outer_q, fill=roof_col, outline=(48, 34, 22), width=1)
    inner_ring = _inset_quad_perp(outer_q, 2)
    dr.polygon(inner_ring, outline=wall_col, width=1)

    pat_q, (pcx, pcy, ux, uy, vx, vy, wh, hh) = _ortho_courtyard_in_quad(
        core_q, depth_px, max_aspect=1.15, fixed_angle=fixed_angle
    )
    if show_growth_seam:
        # Subtle hip-ridge lines from courtyard corners to outer built corners
        for p_c, p_o in zip(pat_q, outer_q):
            dr.line([p_c, p_o], fill=(142, 74, 38), width=1)
    p_fill = (238, 230, 214) if k == 'pleasure' else ((218, 204, 178) if k == 'vegetable' else (198, 188, 172))
    dr.polygon(pat_q, fill=p_fill, outline=(115, 95, 75), width=1)

    def uv_pt(u_rel, v_rel):
        return (int(round(pcx + u_rel * wh * ux + v_rel * hh * vx)), int(round(pcy + u_rel * wh * uy + v_rel * hh * vy)))

    if k == 'pleasure':
        pool_q = [uv_pt(-0.62, -0.62), uv_pt(0.62, -0.62), uv_pt(0.62, 0.62), uv_pt(-0.62, 0.62)]
        dr.polygon(pool_q, fill=(64, 168, 176), outline=(35, 105, 115), width=1)
        icx, icy = int(round(pcx)), int(round(pcy))
        dr.ellipse([icx - 2, icy - 2, icx + 2, icy + 2], fill=(225, 248, 252))
        for cu, cv in ((-0.75, -0.75), (0.75, -0.75), (0.75, 0.75), (-0.75, 0.75)):
            mx_v, my_v = uv_pt(cu, cv)
            dr.ellipse([mx_v - 2, my_v - 2, mx_v + 2, my_v + 2], fill=(76, 148, 72))
    elif k == 'vegetable':
        for s in (-0.48, 0.0, 0.48):
            dr.line([uv_pt(-0.72, s), uv_pt(0.72, s)], fill=(88, 152, 64), width=2)
        sh = uv_pt(0.58, 0.58)
        dr.rectangle([sh[0] - 2, sh[1] - 2, sh[0] + 2, sh[1] + 2], fill=(192, 116, 76), outline=(80, 45, 25))
    else:
        icx, icy = int(round(pcx)), int(round(pcy))
        dr.rectangle([icx - 3, icy - 2, icx + 3, icy + 2], fill=(82, 142, 168), outline=(55, 60, 65))
        dr.line([uv_pt(-0.68, -0.35), uv_pt(0.68, 0.35)], fill=(235, 230, 220), width=1)
        sh = uv_pt(-0.55, -0.55)
        dr.rectangle([sh[0] - 2, sh[1] - 2, sh[0] + 2, sh[1] + 2], fill=(168, 108, 74), outline=(75, 45, 28))


def draw_grid_break_band(
    dr, N_start_px, N_end_px, S_start_px, S_end_px, d_core_px, nx,
    wall_col, roof_col, patio_kind, depth_px=5,
    wedge_kind='park', wedge_label=None, labels_by_col=None, f_lbl=None, label_queue=None
):
    """Draw a pair of turned 90-degree block rows (North row turned along N_start->N_end, South row turned
    along S_start->S_end) across a street-grid break:
      - Every North lot is a true 90-degree rectangle turned at ang_N with a centered courtyard at ang_N.
      - Every South lot is a true 90-degree rectangle turned at ang_S with a centered courtyard at ang_S.
      - Where the piece to grow is <=50% of the empty space, the built portion of the North and South lots
        grows to cover the empty space, with a street running between them!
      - Where the piece to grow is large (>50% of the empty space), it turns into a Park or Market!"""
    if f_lbl is None:
        f_lbl = B.font(11, True)

    ang_N = math.atan2(N_end_px[1] - N_start_px[1], N_end_px[0] - N_start_px[0])
    vn_x, vn_y = -math.sin(ang_N), math.cos(ang_N)
    if vn_y < 0:
        vn_x, vn_y = -vn_x, -vn_y

    ang_S = math.atan2(S_end_px[1] - S_start_px[1], S_end_px[0] - S_start_px[0])
    vs_x, vs_y = -math.sin(ang_S), math.cos(ang_S)
    if vs_y < 0:
        vs_x, vs_y = -vs_x, -vs_y

    # Background street fill across the band
    dr.polygon([N_start_px, N_end_px, S_end_px, S_start_px], fill=(210, 196, 172), outline=None)

    kinds_cycle = {
        'pleasure': ['pleasure', 'pleasure', 'vegetable', 'pleasure'],
        'vegetable': ['vegetable', 'vegetable', 'working', 'vegetable'],
        'working': ['working', 'working', 'vegetable', 'working'],
    }.get(patio_kind, [patio_kind])

    st_half = 2.8
    span_start = math.hypot(S_start_px[0] - N_start_px[0], S_start_px[1] - N_start_px[1])
    span_end = math.hypot(S_end_px[0] - N_end_px[0], S_end_px[1] - N_end_px[1])
    min_span = min(span_start, span_end)
    if d_core_px is None:
        d_core_px = max(20.0, 0.45 * (min_span - 2.0 * st_half))
    else:
        d_core_px = min(float(d_core_px), 0.45 * (min_span - 2.0 * st_half))

    # Precompute gap distribution across s in [0, 1] so the 50% empty-space threshold is exact
    B0_all = (N_start_px[0] + d_core_px * vn_x, N_start_px[1] + d_core_px * vn_y)
    B1_all = (N_end_px[0] + d_core_px * vn_x, N_end_px[1] + d_core_px * vn_y)
    C0_all = (S_start_px[0] - d_core_px * vs_x, S_start_px[1] - d_core_px * vs_y)
    C1_all = (S_end_px[0] - d_core_px * vs_x, S_end_px[1] - d_core_px * vs_y)
    gap_start = math.hypot(C0_all[0] - B0_all[0], C0_all[1] - B0_all[1])
    gap_end = math.hypot(C1_all[0] - B1_all[0], C1_all[1] - B1_all[1])
    empty_min = max(0.0, min(gap_start, gap_end) - 2.0 * st_half)
    empty_max = max(1.0, max(gap_start, gap_end) - 2.0 * st_half)

    open_cells = []
    for ix in range(nx):
        s0, s1 = ix / float(nx), (ix + 1) / float(nx)
        # Leave 2 px cross-street gap between adjacent lot columns
        pad_s = 0.012
        u0, u1 = s0 + pad_s, s1 - pad_s
        A0 = (N_start_px[0] + (N_end_px[0] - N_start_px[0]) * u0, N_start_px[1] + (N_end_px[1] - N_start_px[1]) * u0)
        A1 = (N_start_px[0] + (N_end_px[0] - N_start_px[0]) * u1, N_start_px[1] + (N_end_px[1] - N_start_px[1]) * u1)
        B0 = (A0[0] + d_core_px * vn_x, A0[1] + d_core_px * vn_y)
        B1 = (A1[0] + d_core_px * vn_x, A1[1] + d_core_px * vn_y)

        D0 = (S_start_px[0] + (S_end_px[0] - S_start_px[0]) * u0, S_start_px[1] + (S_end_px[1] - S_start_px[1]) * u0)
        D1 = (S_start_px[0] + (S_end_px[0] - S_start_px[0]) * u1, S_start_px[1] + (S_end_px[1] - S_start_px[1]) * u1)
        C0 = (D0[0] - d_core_px * vs_x, D0[1] - d_core_px * vs_y)
        C1 = (D1[0] - d_core_px * vs_x, D1[1] - d_core_px * vs_y)

        M0 = (0.5 * (B0[0] + C0[0]), 0.5 * (B0[1] + C0[1]))
        M1 = (0.5 * (B1[0] + C1[0]), 0.5 * (B1[1] + C1[1]))
        ms_dx, ms_dy = M1[0] - M0[0], M1[1] - M0[1]
        ms_l = math.hypot(ms_dx, ms_dy) or 1.0
        mn_x, mn_y = -ms_dy / ms_l, ms_dx / ms_l
        if mn_y < 0:
            mn_x, mn_y = -mn_x, -mn_y

        gap_m = 0.5 * (math.hypot(C0[0] - B0[0], C0[1] - B0[1]) + math.hypot(C1[0] - B1[0], C1[1] - B1[1]))
        empty_m = max(0.0, gap_m - 2.0 * st_half)

        # Rule: if the piece to grow is large (>50% of the empty space), it turns into a park or market!
        is_large = (empty_m - empty_min) > 0.50 * (empty_max - empty_min)

        core_N = [(int(round(p[0])), int(round(p[1]))) for p in (A0, A1, B1, B0)]
        core_S = [(int(round(p[0])), int(round(p[1]))) for p in (C0, C1, D1, D0)]
        c_col_N = (min(255, roof_col[0] + (9 if ix % 2 else 0)), min(255, roof_col[1] + (6 if ix % 2 else 0)), min(255, roof_col[2] + (4 if ix % 2 else 0)))
        c_col_S = (min(255, roof_col[0] + (9 if (ix + 1) % 2 else 0)), min(255, roof_col[1] + (6 if (ix + 1) % 2 else 0)), min(255, roof_col[2] + (4 if (ix + 1) % 2 else 0)))
        k_N = kinds_cycle[(ix * 3) % len(kinds_cycle)]
        k_S = kinds_cycle[(ix * 3 + 1) % len(kinds_cycle)]

        if not is_large:
            st_N0 = (M0[0] - st_half * mn_x, M0[1] - st_half * mn_y)
            st_N1 = (M1[0] - st_half * mn_x, M1[1] - st_half * mn_y)
            st_S0 = (M0[0] + st_half * mn_x, M0[1] + st_half * mn_y)
            st_S1 = (M1[0] + st_half * mn_x, M1[1] + st_half * mn_y)
            outer_N = [(int(round(p[0])), int(round(p[1]))) for p in (A0, A1, st_N1, st_N0)]
            outer_S = [(int(round(p[0])), int(round(p[1]))) for p in (st_S0, st_S1, D1, D0)]
            _draw_single_lot_centered(dr, outer_N, core_N, wall_col, c_col_N, k_N, depth_px=depth_px, fixed_angle=ang_N, show_growth_seam=True)
            _draw_single_lot_centered(dr, outer_S, core_S, wall_col, c_col_S, k_S, depth_px=depth_px, fixed_angle=ang_S, show_growth_seam=True)
            dr.line([(int(round(M0[0])), int(round(M0[1]))), (int(round(M1[0])), int(round(M1[1])))], fill=(210, 196, 172), width=5)
        else:
            _draw_single_lot_centered(dr, core_N, core_N, wall_col, c_col_N, k_N, depth_px=depth_px, fixed_angle=ang_N, show_growth_seam=False)
            _draw_single_lot_centered(dr, core_S, core_S, wall_col, c_col_S, k_S, depth_px=depth_px, fixed_angle=ang_S, show_growth_seam=False)
            open_cells.append((
                (B0[0] + st_half * vn_x, B0[1] + st_half * vn_y),
                (B1[0] + st_half * vn_x, B1[1] + st_half * vn_y),
                (C1[0] - st_half * vs_x, C1[1] - st_half * vs_y),
                (C0[0] - st_half * vs_x, C0[1] - st_half * vs_y),
            ))

        if labels_by_col and ix in labels_by_col:
            lbl_txt = labels_by_col[ix]
            mx = int(round(0.5 * (D0[0] + D1[0])))
            my = int(round(max(D0[1], D1[1]))) - 8
            tw = dr.textbbox((0, 0), lbl_txt, font=f_lbl)[2]
            if label_queue is not None:
                label_queue.append((mx, my, tw, lbl_txt, f_lbl))

    if open_cells:
        first_B0 = open_cells[0][0]
        last_B1 = open_cells[-1][1]
        last_C1 = open_cells[-1][2]
        first_C0 = open_cells[0][3]
        wedge_poly = [(int(round(p[0])), int(round(p[1]))) for p in (first_B0, last_B1, last_C1, first_C0)]
        draw_park_or_market_poly(dr, wedge_poly, kind=wedge_kind, label=wedge_label, f_lbl=f_lbl, label_queue=label_queue)


def draw_poly_cuadra(
    dr, quad_px, wall_col, roof_col, patio_kind, depth_px=5, label=None, f_lbl=None,
    lots=None, label_queue=None, wedge_kind=None, wedge_label=None
):
    """Draw a cuadra where the block and its lots turn as true 90-degree orthogonal rectangles
    with centered courtyards, and if `wedge_kind` is specified (at a street-grid break),
    delegates to `draw_grid_break_band`."""
    if f_lbl is None:
        f_lbl = B.font(11, True)

    w_top = math.hypot(quad_px[1][0] - quad_px[0][0], quad_px[1][1] - quad_px[0][1])
    w_bot = math.hypot(quad_px[2][0] - quad_px[3][0], quad_px[2][1] - quad_px[3][1])
    h_left = math.hypot(quad_px[3][0] - quad_px[0][0], quad_px[3][1] - quad_px[0][1])
    h_right = math.hypot(quad_px[2][0] - quad_px[1][0], quad_px[2][1] - quad_px[1][1])
    w_avg = 0.5 * (w_top + w_bot)
    h_avg = 0.5 * (h_left + h_right)

    if lots is not None:
        nx, ny = lots
    else:
        nx = max(2, min(4, int(round(w_avg / 31.0))))
        ny = max(2, min(4, int(round(h_avg / 31.0))))

    if wedge_kind is not None:
        d_core = max(14.0, 0.31 * min(h_left, h_right))
        draw_grid_break_band(
            dr, quad_px[0], quad_px[1], quad_px[3], quad_px[2], d_core, nx,
            wall_col, roof_col, patio_kind, depth_px=depth_px,
            wedge_kind=wedge_kind, wedge_label=wedge_label,
            labels_by_col={nx // 2: label} if label else None,
            f_lbl=f_lbl, label_queue=label_queue
        )
        return

    kinds_cycle = {
        'pleasure': ['pleasure', 'pleasure', 'vegetable', 'pleasure'],
        'vegetable': ['vegetable', 'vegetable', 'working', 'vegetable'],
        'working': ['working', 'working', 'vegetable', 'working'],
    }.get(patio_kind, [patio_kind])

    # True 90-degree turned block orientation: both the block/lots and their centered courtyards turn at ang_block
    ang_block = math.atan2(
        (quad_px[1][1] - quad_px[0][1]) + (quad_px[2][1] - quad_px[3][1]),
        (quad_px[1][0] - quad_px[0][0]) + (quad_px[2][0] - quad_px[3][0]),
    )
    ortho_block_q = _ortho_rect_inside_quad(quad_px, ang_block, shrink_px=0.0)
    dr.polygon(ortho_block_q, fill=roof_col, outline=(45, 32, 22), width=2)
    inner_ring = _inset_quad_perp(ortho_block_q, 2)
    dr.polygon(inner_ring, outline=wall_col, width=2)

    for ix in range(nx):
        for iy in range(ny):
            u0, u1 = ix / float(nx), (ix + 1) / float(nx)
            v0, v1 = iy / float(ny), (iy + 1) / float(ny)
            lot_q = [
                _bilerp(ortho_block_q, u0, v0),
                _bilerp(ortho_block_q, u1, v0),
                _bilerp(ortho_block_q, u1, v1),
                _bilerp(ortho_block_q, u0, v1),
            ]
            c_col = (
                min(255, roof_col[0] + (9 if (ix + iy) % 2 else 0)),
                min(255, roof_col[1] + (6 if (ix + iy) % 2 else 0)),
                min(255, roof_col[2] + (4 if (ix + iy) % 2 else 0)),
            )
            k = kinds_cycle[(ix * 3 + iy) % len(kinds_cycle)]
            _draw_single_lot_centered(dr, lot_q, lot_q, wall_col, c_col, k, depth_px=depth_px, fixed_angle=ang_block)

    if label:
        mx = sum(p[0] for p in ortho_block_q) // 4
        my = max(p[1] for p in ortho_block_q[2:]) - 10
        tw = dr.textbbox((0, 0), label, font=f_lbl)[2]
        if label_queue is not None:
            label_queue.append((mx, my, tw, label, f_lbl))
        else:
            dr.rectangle([mx - tw // 2 - 4, my - 8, mx + tw // 2 + 4, my + 7], fill=(252, 248, 240, 232), outline=(90, 65, 45))
            dr.text((mx - tw // 2, my - 6), label, font=f_lbl, fill=(35, 25, 18))


def draw_poly_mansion_block(dr, quad_px, label=None, f_lbl=None, nx=2, ny=2):
    """Draw a Qartar de Gardonz cuadra as a true 90-degree turned block subdivided into nx*ny walled
    mansion estates, where every mansion and its interior pleasure courtyard/pool remain centered
    within their block and turn along with the block."""
    if f_lbl is None:
        f_lbl = B.font(11, True)
    ang_block = math.atan2(
        (quad_px[1][1] - quad_px[0][1]) + (quad_px[2][1] - quad_px[3][1]),
        (quad_px[1][0] - quad_px[0][0]) + (quad_px[2][0] - quad_px[3][0]),
    )
    ortho_block_q = _ortho_rect_inside_quad(quad_px, ang_block, shrink_px=0.0)
    dr.polygon(ortho_block_q, fill=(220, 230, 198), outline=(155, 88, 48), width=2)
    for ix in range(nx):
        for iy in range(ny):
            u0, u1 = ix / float(nx), (ix + 1) / float(nx)
            v0, v1 = iy / float(ny), (iy + 1) / float(ny)
            lot_q = [
                _bilerp(ortho_block_q, u0, v0),
                _bilerp(ortho_block_q, u1, v0),
                _bilerp(ortho_block_q, u1, v1),
                _bilerp(ortho_block_q, u0, v1),
            ]
            dr.polygon(lot_q, fill=(226, 236, 206), outline=(165, 95, 52), width=2)
            pat_q, (pcx, pcy, ux, uy, vx, vy, wh, hh) = _ortho_courtyard_in_quad(
                lot_q, 4, max_aspect=1.14, fixed_angle=ang_block
            )

            def uv_pt(u_rel, v_rel):
                return (int(round(pcx + u_rel * wh * ux + v_rel * hh * vx)), int(round(pcy + u_rel * wh * uy + v_rel * hh * vy)))

            for cu, cv in ((-0.92, -0.92), (0.92, -0.92), (0.92, 0.92), (-0.92, 0.92)):
                tx, ty = uv_pt(cu, cv)
                dr.ellipse([tx - 3, ty - 3, tx + 3, ty + 3], fill=(72, 142, 66), outline=(42, 86, 38))

            mq = [uv_pt(-0.84, -0.84), uv_pt(0.84, -0.84), uv_pt(0.84, 0.84), uv_pt(-0.84, 0.84)]
            mq_roof = [uv_pt(-0.74, -0.74), uv_pt(0.74, -0.74), uv_pt(0.74, 0.74), uv_pt(-0.74, 0.74)]
            c_patio = [uv_pt(-0.48, -0.48), uv_pt(0.48, -0.48), uv_pt(0.48, 0.48), uv_pt(-0.48, 0.48)]
            pool_q = [uv_pt(-0.34, -0.34), uv_pt(0.34, -0.34), uv_pt(0.34, 0.34), uv_pt(-0.34, 0.34)]

            dr.polygon(mq, fill=(246, 242, 234), outline=(35, 35, 40), width=2)
            dr.polygon(mq_roof, fill=(204, 98, 52), outline=(80, 40, 20), width=1)
            dr.polygon(c_patio, fill=(238, 232, 216), outline=(120, 105, 85), width=1)
            dr.polygon(pool_q, fill=(64, 168, 176), outline=(35, 105, 115), width=1)
            fcx, fcy = int(round(pcx)), int(round(pcy))
            dr.ellipse([fcx - 2, fcy - 2, fcx + 2, fcy + 2], fill=(225, 248, 252))

    if label:
        mx = sum(p[0] for p in ortho_block_q) // 4
        my = max(p[1] for p in ortho_block_q[2:]) - 10
        tw = dr.textbbox((0, 0), label, font=f_lbl)[2]
        dr.rectangle([mx - tw // 2 - 4, my - 8, mx + tw // 2 + 4, my + 7], fill=(35, 28, 22, 220), outline=(185, 245, 175))
        dr.text((mx - tw // 2, my - 6), label, font=f_lbl, fill=(250, 245, 235))


def draw_city_masterplan():
    """Draw the 2400x2050 architectural masterplan of Marr showing:
    1. Enclosing fortified curtain wall (Muraya de Marr) with garitas and garita-like towers.
    2. Natural coastline and river contours — zero blocks floating over water.
    3. Street grid radiating away from the river and shoreline without shearing courtyards:
       - Left Bank (Qartar de Gardonz & Poinda) and Right Bank (De Xedaz): planned expansions on a regular curvilinear grid radiating from the river and shoreline, with orthogonal near-square courtyards.
       - Inner 3 Islands (Isla de Sidi Olda, Isla de Marchondaz, Isla de Kanal): older, chaotic street grid using the jittered/dropped/bent grid from claude/kirstabal-plan-3bc37d-sl8bg9 (core/city/37-city-grid.js).
    """
    W, H = 2400, 2050
    img = Image.new('RGB', (W, H), (244, 239, 228))
    dr = ImageDraw.Draw(img, 'RGBA')

    f_h1 = B.font(29, True)
    f_h2 = B.font(19, True)
    f_b = B.font(15, True)
    f_r = B.font(14, False)
    f_s = B.font(12, False)
    f_xs = B.font(11, True)

    def tag(x, y, text, font=f_xs, fg=(250, 246, 238), bg=(24, 22, 20, 215), border=None):
        lines = text.split('\n')
        w = max(dr.textbbox((0, 0), l, font=font)[2] for l in lines)
        lh = dr.textbbox((0, 0), "Ag", font=font)[3] + 2
        h = lh * len(lines)
        dr.rectangle([x - 4, y - 2, x + w + 5, y + h + 3], fill=bg, outline=border)
        for i, l in enumerate(lines):
            dr.text((x, y + i * lh), l, font=font, fill=fg)

    # Map frame: x in [-400, +400] m, z in [-340, +510] m (extended 1/3 farther south for a steeper U-shape)
    MX0, MX1 = 60, 1780
    MY0, MY1 = 120, 1960
    MCX = (MX0 + MX1) // 2
    SCALE = 2.08  # px per metre (~800 m across 1664 px, ~850 m vertical across 1768 px)
    MCY = 855     # z=0 m in pixel y, placing z=-340 at y=148 and z=+510 at y=1916

    def PXY(xm, zm):
        return int(MCX + xm * SCALE), int(MCY + zm * SCALE)

    def PRECT(x0, z0, x1, z1):
        px0, py0 = PXY(x0, z0)
        px1, py1 = PXY(x1, z1)
        return [min(px0, px1), min(py0, py1), max(px0, px1), max(py0, py1)]

    def PQUAD(pts_m):
        return [PXY(x, z) for x, z in pts_m]

    # --- Natural Coastline & River Delta Contour Functions (in metres) ---
    # 1. Coastline z(x): rocky NW headland (Poinda de Navigadarz) and NE headland (Kosta de Xedaz)
    #    framing the central harbour bight, with the city body extending 1/3 farther south in a steeper U-shape
    coast_knots = [
        (-400, -142), (-372, -168), (-335, -204), (-282, -242), (-224, -254),
        (-178, -220), (-145, -162), (-120, -148), (-60, -140), (0, -138),
        (75, -140), (154, -148), (182, -150), (255, -164), (322, -178),
        (354, -182), (400, -168)
    ]

    def coast_z(xm):
        return float(np.interp(xm, [p[0] for p in coast_knots], [p[1] for p in coast_knots]))

    # 2. River & Canal Channels (carving out the 3 older Inner Islands between the Left Bank and Right Bank,
    #    extended 1/3 farther south to z_wall = +384 m):
    # - Knal Greta (central main river channel separating Island I on the west from Islands II & III on the east)
    def greta_cx(zm):
        return float(np.interp(zm, [-142, -50, 40, 140, 260, 384, 510], [-2.0, -5.0, 3.0, -2.0, 2.0, 0.0, 2.0]))

    def greta_hw(zm):
        return float(np.interp(zm, [-142, 295, 384, 510], [16.0, 17.5, 23.0, 26.0]))

    # - Knal de Gardonz (west river branch separating the Planned Left Bank from Inner Island I)
    def gardonz_cx(zm):
        return float(np.interp(zm, [-150, -65, 30, 140, 245, 345, 402], [-130.0, -138.0, -134.0, -128.0, -118.0, -96.0, -22.0]))

    def gardonz_hw(zm):
        return 10.5

    # - Knal de Xedaz (east river branch separating Inner Islands II & III from the Planned Right Bank)
    def xedaz_cx(zm):
        return float(np.interp(zm, [-150, -55, 40, 150, 250, 345, 402], [156.0, 164.0, 160.0, 152.0, 140.0, 114.0, 22.0]))

    def xedaz_hw(zm):
        return 10.0

    # - Knal de Ismoglarz (transverse delta channel separating Inner Island II [North-East] from Inner Island III [South-East])
    def ismog_cz(xm):
        return float(np.interp(xm, [-5, 80, 168], [6.0, -2.0, 8.0]))

    def ismog_hw():
        return 7.5

    # - Knal de Sauta (southern delta channel at z ~ 312 m rounding off the extended southern tips of Inner Islands I & III)
    def sauta_cz(xm):
        return float(np.interp(xm, [-120, 0, 140], [310.0, 316.0, 310.0]))

    def sauta_hw():
        return 7.0

    # Helper functions for right/left canal setbacks & coastal setback so NO block ever touches or floats on water
    def coast_inland(xm, margin=12.0):
        return coast_z(xm) + margin

    def gard_L(zm, margin=10.0):
        return gardonz_cx(zm) - gardonz_hw(zm) - margin

    def gard_R(zm, margin=9.0):
        return gardonz_cx(zm) + gardonz_hw(zm) + margin

    def greta_L(zm, margin=9.0):
        return greta_cx(zm) - greta_hw(zm) - margin

    def greta_R(zm, margin=9.0):
        return greta_cx(zm) + greta_hw(zm) + margin

    def xed_L(zm, margin=9.0):
        return xedaz_cx(zm) - xedaz_hw(zm) - margin

    def xed_R(zm, margin=10.0):
        return xedaz_cx(zm) + xedaz_hw(zm) + margin

    # Outer Walled City Boundary Curves (for the steeper U-shaped radiating Left Bank & Right Bank grids)
    def west_wall_x(zm):
        return float(np.interp(zm, [-236, -180, -135, -80, 40, 155, 265, 376], [-256.0, -328.0, -364.0, -374.0, -374.0, -370.0, -362.0, -338.0]))

    def east_wall_x(zm):
        return float(np.interp(zm, [-165, -55, 40, 155, 265, 376], [354.0, 366.0, 366.0, 364.0, 356.0, 330.0]))

    # 1. Base terrain & coastal marsh / Garden Quarter terrace tint
    dr.rectangle([MX0, MY0, MX1, MY1], fill=(232, 224, 204))
    dr.polygon([
        PXY(-400, -340), PXY(-120, -340), PXY(-132, 10), PXY(-118, 250), PXY(-130, 510), PXY(-400, 510)
    ], fill=(222, 230, 202))
    dr.polygon([
        PXY(-400, 265), PXY(400, 265), PXY(400, 510), PXY(-400, 510)
    ], fill=(214, 224, 192))

    # 2. Ring Sea Harbour (Si de Rriñ, north) following natural coastline contour + shallow coastal shelf tint
    xs_coast = np.linspace(-400, 400, 161)
    coast_pts = [PXY(x, coast_z(x)) for x in xs_coast]
    shelf_pts = [PXY(x, coast_z(x) - 18) for x in reversed(xs_coast)]
    sea_poly = [PXY(-400, -340), PXY(400, -340)] + list(reversed(coast_pts))
    dr.polygon(sea_poly, fill=(68, 134, 168), outline=(42, 88, 118), width=3)
    dr.polygon(coast_pts + shelf_pts, fill=(84, 154, 184, 135))
    dr.line(coast_pts, fill=(42, 88, 118), width=3)

    # Breakwater Mole (Mol de Porta) extending from the tip of Poinda de Navigadarz (-218, -250)
    mole_poly = [
        PXY(-218, -250), PXY(-195, -296), PXY(68, -296), PXY(68, -281), PXY(-184, -281), PXY(-198, -242)
    ]
    dr.polygon(mole_poly, fill=(168, 162, 152), outline=(70, 65, 58), width=2)

    # 3. Cistal & Stara Estuary & The Delta Channels Carving Out the 3 Inner Islands
    zs_greta = np.linspace(-140, 510, 100)
    knal_greta = [PXY(greta_cx(z) - greta_hw(z), z) for z in zs_greta] + [PXY(greta_cx(z) + greta_hw(z), z) for z in reversed(zs_greta)]
    dr.polygon(knal_greta, fill=(76, 146, 178), outline=(88, 82, 74), width=3)

    zs_gard = np.linspace(-149, 400, 85)
    knal_gardonz = [PXY(gardonz_cx(z) - gardonz_hw(z), z) for z in zs_gard] + [PXY(gardonz_cx(z) + gardonz_hw(z), z) for z in reversed(zs_gard)]
    dr.polygon(knal_gardonz, fill=(76, 146, 178), outline=(88, 82, 74), width=2)

    zs_xed = np.linspace(-151, 400, 85)
    knal_xedaz = [PXY(xedaz_cx(z) - xedaz_hw(z), z) for z in zs_xed] + [PXY(xedaz_cx(z) + xedaz_hw(z), z) for z in reversed(zs_xed)]
    dr.polygon(knal_xedaz, fill=(72, 138, 166), outline=(88, 82, 74), width=2)

    # Transverse Channel between Island II and Island III (Knal de Ismoglarz)
    xs_ism = np.linspace(greta_cx(6) + greta_hw(6) - 2, xedaz_cx(6) - xedaz_hw(6) + 2, 24)
    knal_ism = [PXY(x, ismog_cz(x) - ismog_hw()) for x in xs_ism] + [PXY(x, ismog_cz(x) + ismog_hw()) for x in reversed(xs_ism)]
    dr.polygon(knal_ism, fill=(72, 138, 166), outline=(88, 82, 74), width=2)

    # Southern Delta Cross-Channel rounding off the southern end of Islands I & III (Knal de Sauta, z ~ 312m)
    xs_sau = np.linspace(gardonz_cx(312) + gardonz_hw(312) - 2, xedaz_cx(312) - xedaz_hw(312) + 2, 32)
    knal_sau = [PXY(x, sauta_cz(x) - sauta_hw()) for x in xs_sau] + [PXY(x, sauta_cz(x) + sauta_hw()) for x in reversed(xs_sau)]
    dr.polygon(knal_sau, fill=(72, 138, 166), outline=(88, 82, 74), width=2)

    # 4. Contour-Following Stone Quays (vern_quay), Vernacular Piers (vern_pier) & Arched Canal Bridges (Brij)
    for qx0, qx1 in [(-116, -18), (18, 144), (170, 344)]:
        q_xs = np.linspace(qx0, qx1, 20)
        q_top = [PXY(x, coast_z(x)) for x in q_xs]
        q_bot = [PXY(x, coast_z(x) + 7) for x in reversed(q_xs)]
        dr.polygon(q_top + q_bot, fill=(168, 158, 145), outline=(75, 65, 55), width=2)

    for px_m, pw_m, plen_m, lbl in [
        (-96, 10, 52, "Kostgarda"),
        (-48, 12, 64, "Piar de Kostomz"),
        (36, 12, 62, "Islipa de Feri"),
        (80, 14, 70, "Guarfa de Kren"),
        (124, 12, 64, "Piar de Marchondaz"),
        (206, 12, 56, "Landiñ de Fix"),
        (272, 12, 54, "Piar de Rropa"),
    ]:
        cz = coast_z(px_m)
        dr.rectangle(PRECT(px_m - pw_m / 2, cz - plen_m, px_m + pw_m / 2, cz + 2), fill=(154, 118, 82), outline=(70, 48, 30), width=2)
        tx, ty = PXY(px_m - pw_m / 2 - 6, cz - plen_m - 12)
        tag(tx, ty, lbl, font=f_xs, fg=(245, 238, 220), bg=(30, 26, 22, 200))

    bridges = [
        (greta_cx(-86) - greta_hw(-86) - 2, -90, greta_cx(-86) + greta_hw(-86) + 2, -78),         # Brij de Porta
        (greta_cx(-18) - greta_hw(-18) - 2, -24, greta_cx(-18) + greta_hw(-18) + 2, -12),         # Brij de Isqer
        (greta_cx(88) - greta_hw(88) - 2, 82, greta_cx(88) + greta_hw(88) + 2, 94),               # Brij de Rrivar
        (greta_cx(210) - greta_hw(210) - 2, 204, greta_cx(210) + greta_hw(210) + 2, 216),         # Brij de Moneda (south extension)
        (gardonz_cx(-55) - gardonz_hw(-55) - 2, -60, gardonz_cx(-55) + gardonz_hw(-55) + 2, -48), # Brij de Gardonz
        (gardonz_cx(35) - gardonz_hw(35) - 2, 29, gardonz_cx(35) + gardonz_hw(35) + 2, 41),       # Brij de Rrozaz
        (gardonz_cx(135) - gardonz_hw(135) - 2, 129, gardonz_cx(135) + gardonz_hw(135) + 2, 141), # Brij de Kreol
        (gardonz_cx(235) - gardonz_hw(235) - 2, 229, gardonz_cx(235) + gardonz_hw(235) + 2, 241), # Brij de Orkidz (south extension)
        (xedaz_cx(-65) - xedaz_hw(-65) - 2, -70, xedaz_cx(-65) + xedaz_hw(-65) + 2, -58),         # Brij de Xedaz Norta
        (xedaz_cx(45) - xedaz_hw(45) - 2, 39, xedaz_cx(45) + xedaz_hw(45) + 2, 51),               # Brij de Xedaz Sauta
        (xedaz_cx(140) - xedaz_hw(140) - 2, 134, xedaz_cx(140) + xedaz_hw(140) + 2, 146),         # Brij de Barjaz
        (xedaz_cx(240) - xedaz_hw(240) - 2, 234, xedaz_cx(240) + xedaz_hw(240) + 2, 246),         # Brij de Melaza (south extension)
        (78, ismog_cz(78) - ismog_hw() - 2, 90, ismog_cz(78) + ismog_hw() + 2),                   # Brij de Ismoglarz
        (-62, sauta_cz(-62) - sauta_hw() - 2, -50, sauta_cz(-62) + sauta_hw() + 2),               # Brij de Garizon
        (64, sauta_cz(64) - sauta_hw() - 2, 76, sauta_cz(64) + sauta_hw() + 2),                   # Brij de Kanal
    ]
    for bx0, bz0, bx1, bz1 in bridges:
        dr.rectangle(PRECT(bx0, bz0, bx1, bz1), fill=(215, 202, 182), outline=(60, 50, 40), width=2)

    # =========================================================================
    # 5. THE THREE OLDER, CHAOTIC INNER ISLANDS (Jittered Grid from claude/kirstabal-plan-3bc37d-sl8bg9)
    # =========================================================================
    # --- INNER ISLAND I: ISLA DE SIDI OLDA (West-Central Island between Knal de Gardonz, Knal Greta & Knal de Sauta) ---
    wh1_q = PQUAD([(-112, coast_inland(-112, 10)), (-70, coast_inland(-70, 10)), (-70, -102), (-112, -102)])
    dr.polygon(wh1_q, fill=(218, 132, 58), outline=(60, 38, 20), width=2)
    tag(*PXY(-112, -126), "Gueraus de Porta")

    cust_q = PQUAD([(-62, coast_inland(-62, 10)), (-22, coast_inland(-22, 10)), (-22, -100), (-62, -100)])
    dr.polygon(cust_q, fill=(232, 168, 86), outline=(60, 38, 20), width=2)
    tag(*PXY(-62, -118), "OM DE KOSTOMZ\n(Customs Hall)", fg=(255, 230, 150))

    # Jittered 3x7 street grid on Isla de Sidi Olda (extended 1/3 farther south: z in [-94, +296], x between gard_R(z) and greta_L(z))
    def map_island1(u, v):
        x_approx = -110.0 + u * 90.0
        z_bot = sauta_cz(x_approx) - sauta_hw() - 7.0
        zm = -94.0 + v * (z_bot - (-94.0))
        x0 = gard_R(zm, 8.0)
        x1 = greta_L(zm, 8.0)
        return (x0 + u * (x1 - x0), zm)

    i1_cells, i1_streets, i1_N = build_kirstabal_jitter_island(map_island1, nu=3, nv=7, seed=9811, jit=0.18, pDrop=0.25, pBend=0.42, ave_u=2, ave_v=1)
    for is_ave, spts in i1_streets:
        dr.line([PXY(x, z) for x, z in spts], fill=(212, 198, 174), width=5 if is_ave else 3)

    deferred_labels = []

    i1_labels = {
        (0, 0): "Korta de Viejaz",
        (0, 1): "Rro de Notarz",
        (0, 2): "Korta de Arkaz",
        (1, 4): "Qartar de Garizon",
        (0, 5): "Korta de Oficialz",
        (2, 5): "Korta de Chanceria",
        (0, 6): "Korta de Moneda",
        (1, 6): "Gueraus de Sauta",
    }
    # Monumental civic axis on Isla de Sidi Olda (drawn unconditionally from grid nodes i1_N[1..3][0..4])
    t_poly = _shrink_poly_toward_centroid([i1_N[1][0], i1_N[3][0], i1_N[3][1], i1_N[1][1]], 2.6)
    dr.polygon(PQUAD(t_poly), fill=(230, 148, 64), outline=(55, 32, 15), width=3)
    cx_d = sum(p[0] for p in t_poly) / 4.0
    cz_d = sum(p[1] for p in t_poly) / 4.0
    px_d, py_d = PXY(cx_d, cz_d)
    dr.ellipse([px_d - 10, py_d - 10, px_d + 10, py_d + 10], fill=(78, 168, 148), outline=(30, 65, 55), width=2)
    tag(*PXY(t_poly[0][0] + 2, t_poly[0][1] + 2), "TEMPLA DE SON & SI", fg=(255, 225, 140))

    p_poly = _shrink_poly_toward_centroid([i1_N[1][1], i1_N[3][1], i1_N[3][2], i1_N[1][2]], 2.6)
    pq = PQUAD(p_poly)
    dr.polygon(pq, fill=(238, 228, 206), outline=(135, 110, 82), width=2)
    xs_p = [p[0] for p in pq]; ys_p = [p[1] for p in pq]
    draw_inhabited_patio(dr, min(xs_p) + 4, min(ys_p) + 4, max(xs_p) - 4, max(ys_p) - 4, 'pleasure')
    tag(*PXY(p_poly[0][0] + 6, p_poly[0][1] + 4), "ISQER GRETA")

    g_poly = _shrink_poly_toward_centroid([i1_N[1][2], i1_N[3][2], i1_N[3][4], i1_N[1][4]], 2.6)
    gq = PQUAD(g_poly)
    dr.polygon(gq, fill=(236, 134, 48), outline=(55, 28, 12), width=3)
    xs_g = [p[0] for p in gq]; ys_g = [p[1] for p in gq]
    draw_inhabited_patio(dr, min(xs_g) + 7, min(ys_g) + 7, (min(xs_g) + max(xs_g)) // 2 - 3, max(ys_g) - 7, 'pleasure')
    draw_inhabited_patio(dr, (min(xs_g) + max(xs_g)) // 2 + 3, min(ys_g) + 7, max(xs_g) - 7, max(ys_g) - 14, 'pleasure')
    gx = sum(p[0] for p in g_poly) / 4.0
    gz = sum(p[1] for p in g_poly) / 4.0
    px_g, py_g = PXY(gx, gz)
    dr.ellipse([px_g - 11, py_g - 11, px_g + 11, py_g + 11], fill=(242, 178, 62), outline=(55, 28, 12), width=2)
    tag(*PXY(g_poly[3][0] + 2, g_poly[3][1] - 26), "PALAS DE GOVARNAR\n(mar_governor_palace)", fg=(255, 225, 140), border=(235, 145, 60))

    for cell in i1_cells:
        ci, cj = cell['i'], cell['j']
        if ci >= 1 and cj in (0, 1, 2, 3):
            continue
        if ci == 0 and cell['merged'] == 'u' and cj in (0, 1, 2, 3):
            q_raw = [i1_N[0][cj], i1_N[1][cj], i1_N[1][cj + 1], i1_N[0][cj + 1]]
        else:
            q_raw = cell['quad']
        q_in = _shrink_poly_toward_centroid(q_raw, 2.5)
        draw_poly_cuadra(
            dr, PQUAD(q_in), (228, 152, 78), (196, 98, 52),
            'pleasure' if cj < 4 else 'vegetable',
            depth_px=5, label=i1_labels.get((ci, cj)), label_queue=deferred_labels
        )

    # --- INNER ISLAND II: ISLA DE MARCHONDAZ (North-East Delta Island between Knal Greta, Harbour, Knal de Xedaz & Knal de Ismoglarz) ---
    wh2_q = PQUAD([(22, coast_inland(22, 10)), (74, coast_inland(74, 10)), (74, -98), (22, -98)])
    dr.polygon(wh2_q, fill=(212, 125, 54), outline=(60, 38, 20), width=2)
    tag(*PXY(24, -124), "Gueraus de Porta")

    tav_q = PQUAD([(82, coast_inland(82, 10)), (144, coast_inland(144, 10)), (144, -98), (82, -98)])
    dr.polygon(tav_q, fill=(198, 104, 52), outline=(60, 38, 20), width=2)
    tag(*PXY(84, -124), "Tavarnaz de Selarz")

    def map_island2(u, v):
        z_top = -92.0
        x_approx = 20.0 + u * 124.0
        z_bot = ismog_cz(x_approx) - ismog_hw() - 7.5
        zm = z_top + v * (z_bot - z_top)
        x0 = greta_R(zm, 8.0)
        x1 = xed_L(zm, 8.0)
        return (x0 + u * (x1 - x0), zm)

    i2_cells, i2_streets, i2_N = build_kirstabal_jitter_island(map_island2, nu=3, nv=3, seed=9829, jit=0.19, pDrop=0.26, pBend=0.44, ave_u=1, ave_v=1)
    for is_ave, spts in i2_streets:
        dr.line([PXY(x, z) for x, z in spts], fill=(212, 198, 174), width=5 if is_ave else 3)

    i2_labels = {
        (0, 0): "Korta de Gilda",
        (2, 0): "Korta de Gueraus",
        (0, 1): "Korta de Bayz",
        (0, 2): "Korta de Lonja",
    }
    for cell in i2_cells:
        ci, cj = cell['i'], cell['j']
        if ci >= 1 and cj in (1, 2):
            continue
        if ci == 0 and cell['merged'] == 'u' and cj in (1, 2):
            q_raw = [i2_N[0][cj], i2_N[1][cj], i2_N[1][cj + 1], i2_N[0][cj + 1]]
        else:
            q_raw = cell['quad']
        q_in = _shrink_poly_toward_centroid(q_raw, 2.4)
        draw_poly_cuadra(
            dr, PQUAD(q_in), (232, 158, 74), (194, 94, 48),
            'pleasure' if (ci + cj) % 2 == 0 else 'working',
            depth_px=5, label=i2_labels.get((ci, cj)), label_queue=deferred_labels
        )

    # Jittered Street-Grid Break on Isla de Marchondaz (ci=1..3, cj=1..3):
    # North row turns with the bent interior street; South row turns with Knal de Ismoglarz.
    draw_grid_break_band(
        dr,
        PXY(i2_N[1][1][0] + 2, -62), PXY(i2_N[3][1][0] - 2, -52),
        PXY(i2_N[1][3][0] + 2, -8), PXY(i2_N[3][3][0] - 2, -14),
        d_core_px=None, nx=4,
        wall_col=(232, 158, 74), roof_col=(194, 94, 48), patio_kind='working', depth_px=5,
        wedge_kind='market', wedge_label="Markita de Porta",
        f_lbl=f_xs, label_queue=deferred_labels
    )

    # --- INNER ISLAND III: ISLA DE KANAL (South-East Delta Island between Knal de Ismoglarz, Knal Greta, Knal de Xedaz & Knal de Sauta) ---
    def map_island3(u, v):
        x_approx = 20.0 + u * 115.0
        z_top = ismog_cz(x_approx) + ismog_hw() + 7.5
        z_bot = sauta_cz(x_approx) - sauta_hw() - 7.0
        zm = z_top + v * (z_bot - z_top)
        x0 = greta_R(zm, 8.0)
        x1 = xed_L(zm, 8.0)
        return (x0 + u * (x1 - x0), zm)

    i3_cells, i3_streets, i3_N = build_kirstabal_jitter_island(map_island3, nu=3, nv=6, seed=9847, jit=0.19, pDrop=0.26, pBend=0.44, ave_u=2, ave_v=1)
    for is_ave, spts in i3_streets:
        dr.line([PXY(x, z) for x, z in spts], fill=(212, 198, 174), width=5 if is_ave else 3)

    i3_labels = {
        (0, 0): "Korta de Son",
        (2, 0): "Korta de Silka",
        (0, 1): "Korta de Kanal",
        (0, 2): "Korta de Tonelz",
        (0, 3): "Rro de Istupaz",
        (0, 4): "Bodegaz de Rrom",
        (0, 5): "Korta de Alambik",
    }
    for cell in i3_cells:
        ci, cj = cell['i'], cell['j']
        if ci >= 1 and cj in (4, 5):
            continue
        if ci == 0 and cell['merged'] == 'u' and cj in (4, 5):
            q_raw = [i3_N[0][cj], i3_N[1][cj], i3_N[1][cj + 1], i3_N[0][cj + 1]]
        else:
            q_raw = cell['quad']
        q_in = _shrink_poly_toward_centroid(q_raw, 2.4)
        draw_poly_cuadra(
            dr, PQUAD(q_in), (226, 146, 68), (188, 92, 48),
            'vegetable' if cj >= 3 else 'pleasure',
            depth_px=5, label=i3_labels.get((ci, cj)), label_queue=deferred_labels
        )

    # Jittered Street-Grid Break on Isla de Kanal (ci=1..3, cj=4..6):
    # North row turns with the bent middle street; South row turns with Knal de Sauta.
    draw_grid_break_band(
        dr,
        PXY(i3_N[1][4][0] + 2, 206), PXY(i3_N[3][4][0] - 2, 218),
        PXY(i3_N[1][6][0] + 2, 294), PXY(i3_N[3][6][0] - 2, 290),
        d_core_px=None, nx=4,
        wall_col=(226, 146, 68), roof_col=(188, 92, 48), patio_kind='vegetable', depth_px=5,
        wedge_kind='park', wedge_label="Gardon de Kanal",
        f_lbl=f_xs, label_queue=deferred_labels
    )

    # Southern Delta Strip (between Knal de Sauta z=324 and Southern Wall z=372, flanking Knal Greta)
    draw_poly_cuadra(
        dr, PQUAD([(gard_R(325, 7), 325), (greta_L(325, 7), 325), (greta_L(360, 7), 360), (gard_R(360, 7), 360)]),
        (218, 174, 112), (186, 102, 58), 'vegetable', depth_px=4, label="Kotijz de Sauta", label_queue=deferred_labels
    )
    draw_poly_cuadra(
        dr, PQUAD([(greta_R(325, 7), 325), (xed_L(325, 7), 325), (xed_L(360, 7), 360), (greta_R(360, 7), 360)]),
        (218, 174, 112), (186, 102, 58), 'vegetable', depth_px=4, label="Kotijz de Delta", label_queue=deferred_labels
    )

    # =========================================================================
    # 6. PLANNED LEFT BANK EXPANSION (POINDA DE NAVIGADARZ, QARTAR DE GARDONZ & WEST QARTAR LO)
    #    Blocks turn with the coastline/river while courtyards remain centered within their blocks;
    #    where turning blocks break the street grid, north & south built lots grow to cover <=50%
    #    empty space with a street between them, or turn >50% empty space into a Park or Market!
    # =========================================================================
    # 1. Forta de Poinda & Tauar de Guach at the rocky northern tip (-244..-188, -246..-204)
    castillo_pts = PQUAD([
        (-244, coast_inland(-244, 6)),
        (-218, coast_inland(-218, 5)),
        (-188, coast_inland(-188, 6)),
        (-190, -202),
        (-244, -202),
    ])
    dr.polygon(castillo_pts, fill=(178, 168, 156), outline=(55, 48, 42), width=3)
    draw_inhabited_patio(dr, *PRECT(-234, -230, -200, -208), 'working')
    tag(*PXY(-246, -242), "FORTA DE POINDA &\nTAUAR DE GUACH")

    lx, ly = PXY(60, -288)
    dr.ellipse([lx - 9, ly - 9, lx + 9, ly + 9], fill=(235, 125, 40), outline=(40, 25, 15), width=2)
    tag(lx + 14, ly - 9, "Bigon de Mol (vern_harbour_light)", fg=(255, 235, 175))

    # 2. Gilda de Navigadarz on the harbour bight (-216..-150, -176..-116)
    ng_q = PQUAD([
        (-216, -176),
        (gard_L(-170, 10), -170),
        (gard_L(-116, 10), -116),
        (-218, -116),
    ])
    dr.polygon(ng_q, fill=(226, 122, 52), outline=(45, 25, 12), width=3)
    pat_ng, _ = _ortho_courtyard_in_quad(ng_q, 9, max_aspect=1.15)
    xs_n = [p[0] for p in pat_ng]; ys_n = [p[1] for p in pat_ng]
    draw_inhabited_patio(dr, min(xs_n), min(ys_n), max(xs_n), max(ys_n), 'pleasure')
    dx, dy = PXY(-182, -162)
    dr.ellipse([dx - 11, dy - 11, dx + 11, dy + 11], fill=(78, 168, 148), outline=(30, 65, 55), width=2)
    tag(*PXY(-214, -134), "GILDA DE NAVIGADARZ\n(mar_navigators_guild)", fg=(255, 225, 140), border=(235, 145, 60))

    # 3. Grid-Break Band #1 (NW Headland Coastline Bend: Korta de Pilotaz & Rro de Kaptinz):
    #    North row turns with the NW coastline (-19 deg); South row turns with upper Qartar de Gardonz (+4.8 deg).
    draw_grid_break_band(
        dr,
        PXY(-350, -168), PXY(-242, -206),
        PXY(-354, -124), PXY(-224, -114),
        d_core_px=None, nx=4,
        wall_col=(224, 145, 68), roof_col=(192, 92, 48), patio_kind='pleasure', depth_px=5,
        wedge_kind='park', wedge_label="Gardon de Pilotaz",
        labels_by_col={0: "Korta de Pilotaz", 2: "Rro de Kaptinz"},
        f_lbl=f_xs, label_queue=deferred_labels
    )

    # 4. Planned Left Bank Turning Mansion Grid (Qartar de Gardonz, extended 1/3 south: z in [-92, +264], 3 cols x 4 rows):
    #    u goes left-to-right (u=0 at West Wall, u=1 at Knal de Gardonz).
    def map_left_turned(u, v):
        z_base = -92.0 + v * (264.0 - (-92.0))
        slope_deg = 4.8 * (1.0 - v) + (-4.5) * v
        dz = (u - 0.5) * 210.0 * math.tan(math.radians(slope_deg))
        zm = z_base + dz
        x_left = west_wall_x(zm) + 12.0
        x_right = gard_L(zm, 10.0)
        xm = x_left + u * (x_right - x_left)
        return (xm, zm)

    u_left_cols = [(0.02, 0.27), (0.29, 0.55), (0.66, 0.98)]
    v_left_rows = [(0.02, 0.24), (0.265, 0.485), (0.51, 0.73), (0.755, 0.98)]

    for u_st in (0.01, 0.28, 0.605, 0.99):
        dr.line([PXY(*map_left_turned(u_st, v)) for v in np.linspace(0.01, 0.99, 24)], fill=(210, 196, 172), width=4)
    for v_st in (0.01, 0.252, 0.498, 0.742, 0.99):
        dr.line([PXY(*map_left_turned(u, v_st)) for u in np.linspace(0.01, 0.99, 20)], fill=(210, 196, 172), width=4)

    # Tree-lined Paseo de Gardonz (between u=0.56 and u=0.65)
    paseo_vs = np.linspace(0.01, 0.99, 28)
    paseo_poly = [PXY(*map_left_turned(0.56, v)) for v in paseo_vs] + [PXY(*map_left_turned(0.65, v)) for v in reversed(paseo_vs)]
    dr.polygon(paseo_poly, fill=(198, 214, 172), outline=(120, 145, 95), width=1)
    for vt in np.linspace(0.04, 0.96, 16):
        for ut in (0.58, 0.63):
            px_t, py_t = PXY(*map_left_turned(ut, vt))
            dr.ellipse([px_t - 4, py_t - 4, px_t + 4, py_t + 4], fill=(68, 132, 62), outline=(40, 85, 38))

    left_bank_labels = {
        (0, 0): "Korta de Palmaz",
        (1, 0): "Vila de Bayz",
        (2, 0): "Palas de Iston",
        (0, 1): "Vila de Fontinz",
        (1, 1): "Omz de Gardonz",
        (2, 1): "Om de Tailz",
        (0, 2): "Vila de Sitrus",
        (1, 2): "De Terasaz",
        (2, 2): "Palas de Admirol",
        (0, 3): "Vila de Orkidz",
        (1, 3): "Korta de Magnoliaz",
        (2, 3): "Palas de Kistal",
    }

    for ci, (u0, u1) in enumerate(u_left_cols):
        for rj, (v0, v1) in enumerate(v_left_rows):
            q_m = [
                map_left_turned(u0, v0),
                map_left_turned(u1, v0),
                map_left_turned(u1, v1),
                map_left_turned(u0, v1),
            ]
            draw_poly_mansion_block(dr, PQUAD(q_m), label=left_bank_labels.get((ci, rj)), f_lbl=f_xs, nx=2, ny=2)

    # 5. Grid-Break Band #2 (SW Wall & Estuary Bend: West Qartar Lo, z in [272, 372]):
    draw_grid_break_band(
        dr,
        PXY(-346, 282), PXY(-118, 266),
        PXY(-328, 370), PXY(-96, 338),
        d_core_px=None, nx=6,
        wall_col=(218, 174, 112), roof_col=(186, 102, 58), patio_kind='vegetable', depth_px=5,
        wedge_kind='park', wedge_label="Gardon de Guesta",
        labels_by_col={1: "Kotijz de Guesta", 3: "Kotijz Lo (1-st)", 5: "Rro de Kreol"},
        f_lbl=f_xs, label_queue=deferred_labels
    )

    # =========================================================================
    # 7. PLANNED RIGHT BANK EXPANSION (DE XEDAZ / THE SHADES & EAST QARTAR LO)
    #    Blocks turn with the curving coast and Knal de Xedaz; courtyards stay centered in their blocks;
    #    where turning blocks break the street grid, north & south built lots grow to cover <=50%
    #    empty space with a street between them, and >50% empty space turns into Markita de Xedaz & Marxa!
    # =========================================================================
    rope_xs = np.linspace(178, 326, 16)
    rope_top = [PXY(x, coast_inland(x, 10)) for x in rope_xs]
    rope_bot = [PXY(x, coast_inland(x, 28)) for x in reversed(rope_xs)]
    dr.polygon(rope_top + rope_bot, fill=(182, 116, 68), outline=(60, 38, 20), width=2)

    # 1. Grid-Break Band #3 (NE Shoreline Bend: De Xedaz Waterfront Row):
    draw_grid_break_band(
        dr,
        PXY(176, -118), PXY(344, -142),
        PXY(176, -24), PXY(348, -38),
        d_core_px=None, nx=6,
        wall_col=(178, 112, 76), roof_col=(154, 78, 46), patio_kind='working', depth_px=5,
        wedge_kind='market', wedge_label="Markita de Xedaz",
        labels_by_col={0: "Guarfa de Ismoglarz", 3: "Korta de Salta", 5: "Korta de Netaz"},
        f_lbl=f_xs, label_queue=deferred_labels
    )

    # 2. Main De Xedaz Turning Tenement Grid (extended 1/3 south: z in [-24, +264], 3 cols x 4 rows):
    def map_right_turned(u, v):
        z_base = -24.0 + v * (264.0 - (-24.0))
        slope_deg = -4.8 * (1.0 - v) + 4.5 * v
        dz = (u - 0.5) * 180.0 * math.tan(math.radians(slope_deg))
        zm = z_base + dz
        x_river = xed_R(zm, 10.0)
        x_wall = east_wall_x(zm) - 12.0
        xm = x_river + u * (x_wall - x_river)
        return (xm, zm)

    u_right_cols = [(0.02, 0.32), (0.35, 0.65), (0.68, 0.98)]
    v_right_rows = [(0.02, 0.24), (0.265, 0.485), (0.51, 0.73), (0.755, 0.98)]

    for u_st in (0.01, 0.335, 0.665, 0.99):
        dr.line([PXY(*map_right_turned(u_st, v)) for v in np.linspace(0.01, 0.99, 24)], fill=(210, 196, 172), width=4)
    for v_st in (0.01, 0.252, 0.498, 0.742, 0.99):
        dr.line([PXY(*map_right_turned(u, v_st)) for u in np.linspace(0.01, 0.99, 20)], fill=(210, 196, 172), width=4)

    right_ortho_labels = {
        (0, 0): "Tavarnaz de Xedaz",
        (1, 0): "Om de Landarnaz",
        (2, 0): "Korta de Dais",
        (0, 1): "Yarda de Xedaz",
        (1, 1): "Yarda de Rropa & Tar",
        (2, 1): "Korta de Bilj",
        (0, 2): "Islipa de Barjaz",
        (1, 2): "Yarda de Tanarz",
        (2, 2): "Korta de Smoka",
        (0, 3): "Korta de Kordel",
        (1, 3): "Yarda de Kalafatez",
        (2, 3): "Bodega de Melaza",
    }

    for ci, (u0, u1) in enumerate(u_right_cols):
        for rj, (v0, v1) in enumerate(v_right_rows):
            q_m = [
                map_right_turned(u0, v0),
                map_right_turned(u1, v0),
                map_right_turned(u1, v1),
                map_right_turned(u0, v1),
            ]
            lbl = right_ortho_labels.get((ci, rj))
            pKind = 'pleasure' if (ci == 1 and rj == 0) else 'working'
            draw_poly_cuadra(dr, PQUAD(q_m), (178, 112, 76), (154, 78, 46), pKind, depth_px=5, label=lbl, label_queue=deferred_labels)

    # 3. Grid-Break Band #4 (SE Wall & Estuary Bend: East Qartar Lo, z in [272, 372]):
    draw_grid_break_band(
        dr,
        PXY(142, 268), PXY(342, 282),
        PXY(112, 338), PXY(324, 370),
        d_core_px=None, nx=6,
        wall_col=(218, 174, 112), roof_col=(186, 102, 58), patio_kind='vegetable', depth_px=5,
        wedge_kind='market', wedge_label="Markita de Marxa",
        labels_by_col={0: "Kotijz de Bodabildarz", 2: "Rro de Karpindarz", 4: "Kotijz de Marxa"},
        f_lbl=f_xs, label_queue=deferred_labels
    )


    # Extramuros Fincas (outside the southern fortified curtain wall, z = 408..480, flanking the Cistal Estuary)
    extramuros_fincas = [
        ([(-348, 408), (-202, 408), (-202, 480), (-348, 480)], "Farma de Sitrus (Extramuros Finca)", (3, 2)),
        ([(-188, 408), (greta_L(408, 14), 408), (greta_L(480, 14), 480), (-188, 480)], "Farma de Rrivar (Extramuros Finca)", (3, 2)),
        ([(greta_R(408, 14), 408), (182, 408), (182, 480), (greta_R(480, 14), 480)], "Farma de Mil de Rrom (Extramuros)", (3, 2)),
        ([(196, 408), (342, 408), (342, 480), (196, 480)], "Farma de Koton & Indigo (Extramuros)", (3, 2)),
    ]
    for fq_m, flbl, flots in extramuros_fincas:
        draw_poly_cuadra(dr, PQUAD(fq_m), (218, 174, 112), (186, 102, 58), 'vegetable', depth_px=6, lots=flots, label=flbl, label_queue=deferred_labels)

    # Render all queued cuadra labels on top of all block polygons so no block ever clips a neighbor's label
    for mx, my, tw, label_txt, f_lbl in deferred_labels:
        dr.rectangle([mx - tw // 2 - 4, my - 8, mx + tw // 2 + 4, my + 7], fill=(252, 248, 240, 232), outline=(90, 65, 45))
        dr.text((mx - tw // 2, my - 6), label_txt, font=f_lbl, fill=(35, 25, 18))

    # =========================================================================
    # 8. ENCLOSING FORTIFIED CITY WALL (MURAYA DE MARR) WITH GARITAS & GARITA-LIKE TOWERS
    # =========================================================================
    def draw_wall_segment(pts_m, is_seawall=False):
        pts_px = [PXY(x, z) for x, z in pts_m]
        dr.line(pts_px, fill=(42, 34, 28), width=11 if not is_seawall else 9, joint='curve')
        dr.line(pts_px, fill=(162, 144, 122) if not is_seawall else (148, 134, 116), width=7 if not is_seawall else 5, joint='curve')
        dr.line(pts_px, fill=(214, 142, 72), width=2, joint='curve')

    def draw_garita(xm, zm, dome_col=(232, 128, 48)):
        """Draw a cantilevered circular sentry box (Garita de Guach / mar_garita_post) projecting from the wall."""
        gx, gy = PXY(xm, zm)
        dr.ellipse([gx - 6, gy - 6, gx + 6, gy + 6], fill=(168, 152, 132), outline=(38, 28, 20), width=2)
        dr.ellipse([gx - 3, gy - 3, gx + 3, gy + 3], fill=dome_col, outline=(50, 30, 15), width=1)

    def draw_garita_tower(xm, zm, name=None, r_px=11, dome_col=(236, 134, 48), label_dx=12, label_dy=-8):
        """Draw a large circular/octagonal garita-like bastion watchtower (Tauar de Garita) with corbelled ring & cupola."""
        gx, gy = PXY(xm, zm)
        dr.regular_polygon((gx, gy, r_px + 3), n_sides=8, rotation=22.5, fill=(152, 136, 116), outline=(35, 26, 18))
        dr.ellipse([gx - r_px, gy - r_px, gx + r_px, gy + r_px], fill=(186, 172, 152), outline=(42, 32, 22), width=2)
        dr.ellipse([gx - r_px + 4, gy - r_px + 4, gx + r_px - 4, gy + r_px - 4], fill=dome_col, outline=(45, 28, 16), width=2)
        dr.ellipse([gx - 2, gy - 2, gx + 2, gy + 2], fill=(250, 235, 190))
        if name:
            tag(gx + label_dx, gy + label_dy, name, font=f_xs, fg=(255, 232, 175), bg=(28, 22, 18, 220), border=(214, 142, 72))

    def draw_city_gate(xm, zm, name, horizontal=True):
        """Draw a fortified colonial city gate (Porta) or canal water-gate (Arka de Agua) flanked by twin garita towers."""
        gx, gy = PXY(xm, zm)
        if horizontal:
            dr.rectangle([gx - 22, gy - 8, gx + 22, gy + 8], fill=(176, 156, 132), outline=(38, 28, 20), width=2)
            draw_garita_tower(xm - 10, zm, r_px=8, dome_col=(236, 134, 48))
            draw_garita_tower(xm + 10, zm, r_px=8, dome_col=(236, 134, 48))
            tag(gx - 38, gy + 10, name, font=f_xs, fg=(255, 235, 180), bg=(32, 24, 18, 230), border=(232, 142, 62))
        else:
            dr.rectangle([gx - 8, gy - 20, gx + 8, gy + 20], fill=(176, 156, 132), outline=(38, 28, 20), width=2)
            draw_garita_tower(xm, zm - 9, r_px=8, dome_col=(236, 134, 48))
            draw_garita_tower(xm, zm + 9, r_px=8, dome_col=(236, 134, 48))
            tag(gx + 12, gy - 8, name, font=f_xs, fg=(255, 235, 180), bg=(32, 24, 18, 230), border=(232, 142, 62))

    # A. Western, Southern & Eastern Landward Curtain Wall (Muraya de Tera — steeper U-shape reaching z=384m)
    west_south_east_wall = [
        (-256, coast_inland(-256, 6)),
        (-328, coast_inland(-328, 6)),
        (-364, coast_inland(-364, 8)),
        (-374, -80),
        (-374, 40),
        (-370, 155),
        (-362, 265),
        (-338, 376),
        (-220, 384),
        (greta_L(384, 4), 384),
        (greta_R(384, 4), 384),
        (218, 384),
        (330, 376),
        (356, 265),
        (364, 155),
        (366, 40),
        (366, -55),
        (354, coast_inland(354, 6)),
    ]
    draw_wall_segment(west_south_east_wall, is_seawall=False)

    # B. Sea-Wall & Headland Cliff Ramparts (Muraya de Si) along Poinda de Navigadarz and Kosta de Xedaz
    poinda_seawall = [
        (-190, coast_inland(-190, 6)),
        (-160, coast_inland(-160, 6)),
        (gard_L(-148, 4), coast_inland(gard_L(-148, 4), 5)),
    ]
    draw_wall_segment(poinda_seawall, is_seawall=True)

    xedaz_seawall = [
        (xed_R(-146, 4), coast_inland(xed_R(-146, 4), 5)),
        (235, coast_inland(235, 5)),
        (300, coast_inland(300, 5)),
        (354, coast_inland(354, 6)),
    ]
    draw_wall_segment(xedaz_seawall, is_seawall=True)
    tag(*PXY(182, -148), "Rropaguoka (vern_ropewalk, 140m)")

    # C. Cantilevered Sentry Garitas (Garita de Guach) spaced along the Sea-Wall and Landward Ramparts
    garita_coords = [
        (-295, coast_inland(-295, 5)), (-346, coast_inland(-346, 6)),
        (-254, -236), (-222, -250), (-194, -228), (-172, coast_inland(-172, 5)),
        (-370, -118), (-374, -20), (-372, 96), (-366, 210), (-350, 320),
        (-280, 380), (-165, 384), (-108, 384), (108, 384), (162, 384), (276, 380),
        (344, 320), (360, 210), (365, 96), (366, -8), (360, -110),
        (326, coast_inland(326, 5)), (258, coast_inland(258, 5)),
    ]
    for gx_m, gz_m in garita_coords:
        draw_garita(gx_m, gz_m)

    # D. Large Garita-Like Bastion Watchtowers (Tauar de Garita) at every corner, salient, and canal mouth
    garita_towers = [
        (-364, coast_inland(-364, 8), "Tauar de Pilotaz", (236, 134, 48), -118, -14),
        (-374, -80, "Tauar de Palmaz", (236, 134, 48), -112, -8),
        (-374, 40, "Tauar de Fontinz", (236, 134, 48), -114, -8),
        (-370, 155, "Tauar de Sitrus", (236, 134, 48), -110, -8),
        (-362, 265, "Tauar de Orkidz", (236, 134, 48), -110, -8),
        (-338, 376, "Baluarte de Guesta", (236, 134, 48), -125, 6),
        (gard_L(-148, 3), coast_inland(gard_L(-148, 3), 4), None, (78, 168, 148), 0, 0),
        (gard_R(-148, 3), coast_inland(gard_R(-148, 3), 4), None, (78, 168, 148), 0, 0),
        (greta_L(-140, 3), coast_inland(greta_L(-140, 3), 4), None, (78, 168, 148), 0, 0),
        (greta_R(-140, 3), coast_inland(greta_R(-140, 3), 4), None, (78, 168, 148), 0, 0),
        (xed_L(-146, 3), coast_inland(xed_L(-146, 3), 4), None, (78, 168, 148), 0, 0),
        (xed_R(-146, 3), coast_inland(xed_R(-146, 3), 4), None, (78, 168, 148), 0, 0),
        (354, coast_inland(354, 6), "Baluarte de Rropa", (236, 134, 48), -90, -26),
        (366, -55, "Tauar de Dais", (236, 134, 48), -52, -26),
        (366, 40, "Tauar de Smoka", (236, 134, 48), -60, -26),
        (364, 155, "Tauar de Karpindarz", (236, 134, 48), -82, -26),
        (356, 265, "Tauar de Melaza", (236, 134, 48), 14, -8),
        (330, 376, "Baluarte de Marxa", (236, 134, 48), -95, 10),
    ]
    for tx_m, tz_m, tname, tcol, ldx, ldy in garita_towers:
        draw_garita_tower(tx_m, tz_m, name=tname, r_px=10, dome_col=tcol, label_dx=ldx, label_dy=ldy)

    # E. Fortified City Gates (Portaz) & Arched Canal Water-Gates (Arkaz de Agua)
    draw_city_gate(-220, 384, "Porta de Gardonz", horizontal=True)
    draw_city_gate(0, 384, "Arka de Agua & Porta de Iziz", horizontal=True)
    draw_city_gate(218, 384, "Porta de Xedaz", horizontal=True)

    # Quarter Banner Labels
    q_labels = [
        (-365, -295, "I. POINDA DE NAVIGADARZ (LEFT BANK)", "Walled Headland, Forta de Poinda & Gilda de Navigadarz", (255, 215, 120)),
        (-55, -262, "II. PORTA & DOKAZ (VERNACULAR DOCKS)", "Contour quays, piers, Guarfa de Kren, Om de Kostomz & Rropaguoka", (150, 230, 255)),
        (-106, 303, "III. INNER 3 ISLANDS (CHAOTIC JITTERED GRID)", "Isla de Sidi Olda, Isla de Marchondaz & Isla de Kanal (37-city-grid)", (255, 225, 165)),
        (178, -262, "IV. DE XEDAZ (RIGHT BANK PLANNED GRID)", "Radiating regular grid of tenements, tavarnaz & smugglers' slips", (255, 175, 145)),
        (-356, -108, "V. QARTAR DE GARDONZ (LEFT BANK PLANNED GRID)", "Radiating regular grid of 2x2 walled mansion estates & pools", (185, 245, 175)),
        (25, 484, "VI. QARTAR LO & EXTRAMUROS FINCAS", "Walled Creole kotijz + extramuros citrus/rum/indigo fincas", (235, 220, 165)),
    ]

    for qx, qz, qt, qs, qcol in q_labels:
        px_q, py_q = PXY(qx, qz)
        bw = max(dr.textbbox((0, 0), qt, font=f_b)[2], dr.textbbox((0, 0), qs, font=f_s)[2]) + 18
        dr.rectangle([px_q - 4, py_q - 4, px_q + bw, py_q + 34], fill=(18, 20, 26, 235), outline=qcol, width=2)
        dr.text((px_q + 4, py_q - 1), qt, font=f_b, fill=qcol)
        dr.text((px_q + 4, py_q + 17), qs, font=f_s, fill=(235, 232, 225))

    # Canal Labels with dark translucent pills (Izani names from lore/tongues-of-krator.html)
    tag(*PXY(-24, 422), "CISTAL ESTUARY &\nKNAL GRETA (24m wide)", fg=(175, 235, 255), bg=(14, 28, 42, 220))
    tag(*PXY(-152, -78), "KNAL DE GARDONZ\n(18m)", fg=(175, 235, 255), bg=(14, 28, 42, 220))
    tag(*PXY(136, -6), "KNAL DE XEDAZ\n(16m)", fg=(175, 235, 255), bg=(14, 28, 42, 220))

    # Top Title Banner
    dr.rectangle([0, 0, W, 105], fill=(22, 24, 30))
    dr.text((30, 14), "MARR (PORTA MARR): WALLED CITY LAYOUT & BLUEPRINT (Scale 1:1, ~20,000 Souls)", font=f_h1, fill=(255, 215, 130))
    dr.text((30, 58), "Muraya de Marr (Garitas & Towers) — Chaotic Jittered Inner 3 Islands vs. Planned Radiating Left & Right Banks", font=f_h2, fill=(220, 225, 230))

    # Right-hand Architectural Key & Legend Panel (x = 1800..2380)
    KX0, KY0, KX1, KY1 = 1805, 120, 2375, 1960
    dr.rectangle([KX0, KY0, KX1, KY1], fill=(250, 247, 240), outline=(90, 75, 60), width=2)
    y = KY0 + 16
    dr.text((KX0 + 18, y), "ARCHITECTURAL & URBAN KEY", font=f_h2, fill=(40, 25, 15)); y += 30

    legend_items = [
        ((162, 144, 122), "Muraya de Marr & Garita Towers (mar_curtain_wall,\nmar_garita_post, Tauar de Garita & Portaz)"),
        ((236, 134, 48), "Major Landmarks (Palas de Govarnar,\nGilda de Navigadarz, Templa de Son & Si)"),
        ((196, 98, 52), "Inner 3 Islands: Older Chaotic Jittered Grid\n(37-city-grid.js: bent streets, merged L-blocks)"),
        ((246, 242, 234), "Left Bank (Qartar de Gardonz): Planned Regular\nGrid (Centered Courtyard Villas Turning w/ Blocks)"),
        ((154, 78, 46), "Right Bank (De Xedaz): Planned Regular Grid\n(Tenements Turning w/ Coast & River)"),
        ((234, 178, 62), "Grid-Break Parks & Markets (>50% Wedge):\nGardon de Pilotaz, Markita de Xedaz & Porta"),
        ((154, 118, 82), "Iziz Vernacular Dock Set (73d-vern-docks)\n(Quays, piers, Guarfa de Kren, Rropaguoka)"),
        ((64, 168, 176), "Inhabited Court I: Korta de Plejar (12-16m)\n(Tile pools, scalloped fountains, citrus/palms)"),
        ((98, 158, 72), "Inhabited Court II: Korta de Gardon (10-14m)\n(Raised vegetable beds, pergola, summer kitchen)"),
        ((198, 188, 172), "Inhabited Court III: Yarda de Guorka (8-14m)\n(Stone wash-troughs, laundry, bread oven, sheds)"),
    ]
    for col, txt in legend_items:
        dr.rectangle([KX0 + 18, y + 2, KX0 + 48, y + 26], fill=col, outline=(45, 35, 25), width=2)
        for line in txt.split('\n'):
            dr.text((KX0 + 60, y), line, font=f_r, fill=(35, 30, 25))
            y += 17
        y += 8

    y += 4
    dr.line([(KX0 + 18, y), (KX1 - 18, y)], fill=(160, 145, 125), width=2); y += 12
    dr.text((KX0 + 18, y), "STREET GRIDS, WALLS & CONTOURS", font=f_b, fill=(130, 45, 15)); y += 21
    scale_notes = [
        "• Centered Courtyards & Turning Blocks: Every",
        "  courtyard stays centered in its block and rotates",
        "  with it along the shoreline, river, or street.",
        "• Grid-Break Rule (<=50% vs >50%): Where turning",
        "  blocks break the street grid, north & south built",
        "  lots grow to cover <=50% gaps with a street",
        "  between them; >50% gaps turn into Parks/Markets.",
    ]
    for sn in scale_notes:
        dr.text((KX0 + 18, y), sn, font=f_r, fill=(40, 35, 30))
        y += 18

    y += 6
    dr.line([(KX0 + 18, y), (KX1 - 18, y)], fill=(160, 145, 125), width=2); y += 12
    dr.text((KX0 + 18, y), "POPULATION & CENSUS (~20,000 SOULS)", font=f_b, fill=(130, 45, 15)); y += 21
    pop_notes = [
        "• Right Bank — De Xedaz (~260 tenements/taverns):",
        "  ~7,200 residents (sailors, dockers, vice)",
        "• Inner 3 Islands — Sidi Olda, Marchondaz, Kanal:",
        "  ~5,600 residents (merchants, clerks, garrison)",
        "• Qartar Lo & Fincas (~230 kotijz & 4 fincas):",
        "  ~4,100 residents (shipwrights, ropemakers)",
        "• Porta & Poinda (Forta, Gilda, docks):",
        "  ~1,750 residents (navigators, marines, pilots)",
        "• Left Bank — Qartar de Gardonz (48 mansions):",
        "  ~1,350 residents (admirals, factors, servants)",
        "• Canon Comparison: Voth ~53.4k | Iziz ~28k |",
        "  Marr ~20k | Yuni & Roketstad ~10k | Locus ~2.6k",
    ]
    for pn in pop_notes:
        dr.text((KX0 + 18, y), pn, font=f_r, fill=(40, 35, 30))
        y += 18

    path = os.path.join(OUT_DIR, 'city_layout.png')
    img.save(path)
    print('wrote', path)


def draw_courtyard_archetypes():
    """Draw a dedicated 2400x1150 blueprint sheet detailing the three inhabited interior courtyard types."""
    W, H = 2400, 1150
    img = Image.new('RGB', (W, H), (250, 247, 240))
    dr = ImageDraw.Draw(img, 'RGBA')

    f_h1 = B.font(32, True)
    f_h2 = B.font(22, True)
    f_b = B.font(17, True)
    f_r = B.font(15, False)

    dr.rectangle([0, 0, W, 96], fill=(24, 26, 32))
    dr.text((30, 14), "MARR: INHABITED INTERIOR COURTYARD ARCHETYPES (No Empty Block Interiors)", font=f_h1, fill=(255, 215, 130))
    dr.text((30, 56), "Every perimeter block and courtyard house fills its interior with an active garden or working yard (mar_patio_pleasure, mar_patio_vegetable, mar_patio_working).", font=f_h2, fill=(220, 225, 230))

    cards = [
        (40, 125, 780, 1090, "1. KORTA DE PLEJAR (Pleasure Garden)", "Rich & Upper-Middle (Qartar de Gardonz, Palas, Sidi Olda)", 'pleasure', [
            ("A. Polychrome Tile Pool / Scalloped Fountain", (64, 168, 176)),
            ("B. Black & White Diamond Marble Walks", (230, 225, 215)),
            ("C. Walled Citrus, Palm & Bougainvillea Beds", (86, 152, 82)),
            ("D. Carved Stone Loggia & Glazed Bay Arcade", (212, 165, 130)),
            ("E. Garden Pavilion / Shaded Gazebo", (196, 112, 68)),
            ("F. Marigold & Agave Urns on Parapets", (235, 155, 40)),
        ]),
        (820, 125, 1560, 1090, "2. KORTA DE GARDON (Vegetable & Kitchen Yard)", "Middle Blocks, Qartar Lo Cottages & Peripheral Farms", 'vegetable', [
            ("A. Raised Stone/Timber Vegetable Beds (Crops)", (98, 158, 72)),
            ("B. Detached Brick Summer-Kitchen & Bakehouse", (196, 122, 82)),
            ("C. Timber Vine Pergola (Gourds & Grapes)", (158, 122, 78)),
            ("D. Rainwater Cistern & Stone Wellhead (Guel)", (90, 150, 185)),
            ("E. Potting Bench, Amphorae & Herb Racks", (182, 112, 68)),
            ("F. Fruit Trees (Plantain, Papaya, Lime)", (68, 132, 58)),
        ]),
        (1600, 125, 2340, 1090, "3. YARDA DE GUORKA (Working & Tenement Yard)", "De Xedaz Tenements, Artisans & Sailors' Courts", 'working', [
            ("A. Communal Stone Wash-Trough (Tri-Basin)", (82, 142, 168)),
            ("B. Outdoor Beehive Bread-Oven & Cook-Shelter", (168, 112, 78)),
            ("C. Overhead Laundry Lines Between Iron Galleries", (235, 230, 220)),
            ("D. Smuggled Cargo Crates, Rrom Casks & Tar Pots", (142, 98, 58)),
            ("E. Detached Privy, Wood-Shed & Poultry Coop", (152, 118, 86)),
            ("F. Exterior Iron-Railed Stair to Upper Galleries", (55, 58, 64)),
        ]),
    ]

    for x0, y0, x1, y1, title, sub, kind, items in cards:
        dr.rectangle([x0, y0, x1, y1], fill=(244, 239, 228), outline=(90, 72, 55), width=2)
        dr.rectangle([x0, y0, x1, y0 + 68], fill=(52, 36, 26))
        dr.text((x0 + 18, y0 + 10), title, font=f_h2, fill=(255, 220, 140))
        dr.text((x0 + 18, y0 + 40), sub, font=f_r, fill=(235, 228, 215))

        # Architectural plan diagram of the courtyard (x0+40..x1-40, y0+90..y0+640)
        bx0, by0, bx1, by1 = x0 + 45, y0 + 95, x1 - 45, y0 + 645
        dr.rectangle([bx0, by0, bx1, by1], fill=(204, 112, 62), outline=(45, 28, 18), width=3)
        gx0, gy0, gx1, gy1 = bx0 + 42, by0 + 42, bx1 - 42, by1 - 42
        dr.rectangle([gx0, gy0, gx1, gy1], fill=(228, 212, 188), outline=(85, 65, 48), width=2)
        px0, py0, px1, py1 = gx0 + 24, gy0 + 24, gx1 - 24, gy1 - 24
        dr.rectangle([px0, py0, px1, py1], fill=(238, 230, 214), outline=(70, 55, 40), width=2)
        for u in np.linspace(px0 + 10, px1 - 10, 6):
            for v in (py0 - 12, py1 + 12):
                dr.ellipse([u - 4, v - 4, u + 4, v + 4], fill=(175, 165, 155), outline=(40, 35, 30))
        for v in np.linspace(py0 + 10, py1 - 10, 6):
            for u in (px0 - 12, px1 + 12):
                dr.ellipse([u - 4, v - 4, u + 4, v + 4], fill=(175, 165, 155), outline=(40, 35, 30))

        cx, cy = (px0 + px1) // 2, (py0 + py1) // 2
        if kind == 'pleasure':
            dr.rectangle([cx - 26, py0 + 4, cx + 26, py1 - 4], fill=(245, 242, 235), outline=(160, 150, 135))
            dr.rectangle([px0 + 4, cy - 26, px1 - 4, cy + 26], fill=(245, 242, 235), outline=(160, 150, 135))
            for rx0, ry0, rx1, ry1 in [
                (px0 + 12, py0 + 12, cx - 34, cy - 34),
                (cx + 34, py0 + 12, px1 - 12, cy - 34),
                (px0 + 12, cy + 34, cx - 34, py1 - 12),
                (cx + 34, cy + 34, px1 - 12, py1 - 12),
            ]:
                dr.rectangle([rx0, ry0, rx1, ry1], fill=(86, 152, 82), outline=(45, 90, 42), width=2)
                dr.ellipse([(rx0 + rx1) / 2 - 14, (ry0 + ry1) / 2 - 14, (rx0 + rx1) / 2 + 14, (ry0 + ry1) / 2 + 14], fill=(58, 122, 54), outline=(35, 75, 32))
            dr.rectangle([cx - 68, cy - 48, cx + 68, cy + 48], fill=(64, 168, 176), outline=(28, 92, 102), width=3)
            dr.ellipse([cx - 22, cy - 22, cx + 22, cy + 22], fill=(224, 242, 246), outline=(45, 85, 95), width=2)
            dr.rectangle([cx - 42, py0 + 8, cx + 42, py0 + 46], fill=(196, 112, 68), outline=(60, 30, 15), width=2)
            dr.text((cx - 12, cy - 8), "[A]", font=f_b, fill=(15, 45, 55))
            dr.text((cx - 12, py0 + 18), "[E]", font=f_b, fill=(255, 240, 220))
            dr.text((px0 + 28, py0 + 28), "[C]", font=f_b, fill=(255, 250, 220))
        elif kind == 'vegetable':
            for row in range(4):
                ry0 = py0 + 18 + row * 62
                dr.rectangle([px0 + 16, ry0, cx + 35, ry0 + 42], fill=(98, 158, 72), outline=(72, 52, 32), width=2)
                for k in range(5):
                    kx = px0 + 32 + k * 36
                    dr.ellipse([kx - 7, ry0 + 12, kx + 7, ry0 + 28], fill=(64, 126, 48))
            dr.text((px0 + 65, py0 + 28), "[A] Crop Beds", font=f_b, fill=(255, 250, 220))
            dr.rectangle([cx + 52, py0 + 18, px1 - 16, cy - 12], fill=(158, 122, 78), outline=(75, 52, 28), width=2)
            dr.text((cx + 68, py0 + 65), "[C] Pergola", font=f_b, fill=(255, 245, 220))
            dr.rectangle([cx + 52, cy + 28, px1 - 14, py1 - 14], fill=(196, 122, 82), outline=(65, 32, 18), width=2)
            dr.text((cx + 64, cy + 68), "[B] Kitchen\n    Shed", font=f_b, fill=(255, 245, 225))
            dr.ellipse([cx + 8, cy - 22, cx + 48, cy + 18], fill=(90, 150, 185), outline=(45, 55, 65), width=3)
            dr.text((cx + 15, cy - 10), "[D]", font=f_b, fill=(255, 255, 255))
        else:
            dr.rectangle([cx - 68, cy - 26, cx + 68, cy + 26], fill=(82, 142, 168), outline=(50, 58, 66), width=3)
            dr.line([(cx - 22, cy - 26), (cx - 22, cy + 26)], fill=(50, 58, 66), width=2)
            dr.line([(cx + 22, cy - 26), (cx + 22, cy + 26)], fill=(50, 58, 66), width=2)
            dr.text((cx - 58, cy - 10), "[A] Wash Trough", font=f_b, fill=(255, 255, 255))
            dr.rectangle([px0 + 14, py0 + 14, px0 + 148, py0 + 95], fill=(168, 112, 78), outline=(65, 35, 20), width=2)
            dr.ellipse([px0 + 108, py0 + 28, px0 + 140, py0 + 60], fill=(135, 72, 42), outline=(50, 25, 15), width=2)
            dr.text((px0 + 18, py0 + 64), "[B] Bakehouse", font=f_b, fill=(255, 245, 225))
            dr.rectangle([px1 - 155, py1 - 92, px1 - 14, py1 - 14], fill=(152, 118, 86), outline=(65, 42, 24), width=2)
            dr.text((px1 - 148, py1 - 62), "[E] Sheds/Coop", font=f_b, fill=(255, 245, 225))
            dr.rectangle([px0 + 16, py1 - 85, px0 + 135, py1 - 16], fill=(142, 98, 58), outline=(60, 38, 18), width=2)
            dr.text((px0 + 22, py1 - 58), "[D] Casks", font=f_b, fill=(255, 245, 225))
            dr.rectangle([px1 - 128, py0 + 14, px1 - 14, py0 + 52], fill=(75, 80, 88), outline=(30, 32, 36), width=2)
            dr.text((px1 - 120, py0 + 24), "[F] Stair", font=f_b, fill=(245, 245, 250))
            dr.line([(px0 + 20, cy - 55), (px1 - 20, cy + 65)], fill=(245, 240, 230), width=2)
            dr.line([(px0 + 20, cy + 65), (px1 - 20, cy - 55)], fill=(245, 240, 230), width=2)

        ly = y0 + 668
        dr.text((x0 + 24, ly), "REQUIRED COURTYARD ELEMENTS:", font=f_b, fill=(120, 42, 15)); ly += 28
        for txt, col in items:
            dr.rectangle([x0 + 24, ly + 2, x0 + 48, ly + 22], fill=col, outline=(40, 30, 20), width=1)
            dr.text((x0 + 60, ly), txt, font=f_r, fill=(35, 30, 25))
            ly += 30

    path = os.path.join(OUT_DIR, 'courtyard_types.png')
    img.save(path)
    print('wrote', path)


def build_navigators_guild_blueprint():
    """Generate floor sheets (B, G, U, L, section) and FURNITURE.md for Gilda de Navigadarz (mar_navigators_guild, 54x44m)."""
    nav_dir = os.path.join(OUT_DIR, 'navigators_guild')
    os.makedirs(nav_dir, exist_ok=True)

    # Frame: u along main axis from Seaward Forecourt Gate (u = -27, left) to Canal/Harbour Rear (u = +27, right);
    # v across (v in -22..+22 m). Central Compass Cloister at u in -9..+9, v in -9..+9.
    MSTAIR = (-9, -3, -15, -10)   # Grand Imperial Staircase (stone & wrought-iron scroll balustrade)
    SSTAIR = (12, 16, 10, 14)     # Service & Pilots' Stair
    OSTAIR = (14, 17, -4, 4)      # Turret spiral stair up to the Astrolabe Observatory Dome

    FL = [
        dict(
            id='B', tier=-1, R=30, rect=(-27, 27, -22, 22),
            title="Gilda de Navigadarz — Undercroft & Canal Water-Gate (y -3.2 to 0.8)",
            sub="Carved into the Poinda de Navigadarz limestone shelf directly above the tide: a grilled Canal Water-Gate (Geta de Bodaz) where pilot launches berth under the building, bonded instrument and chronometer vaults, lead-lined rutters archive, and stone rainwater cisterns.",
            rooms=[
                R(1, 'Pilot-Boat Water-Gate (Geta de Bodaz)', 'entrance', 9, 27, -6, 6, 1, 'vaulted sea-canal basin under the rear wing; bronze portcullis gate to the harbour'),
                R(2, 'Boat-Stores & Cordage Cellar', 'store', 9, 27, -18, -6, 0, 'spares, lanterns, lead-lines, sea-anchors and tar'),
                R(3, 'Bonded Bullion & Chronometer Vault', 'treasury_vault', -18, -6, -18, -8, 1, 'marine chronometers, lodestones, astrolabes and the Guild\'s reserve chest'),
                R(4, 'Secret Rutter & Chart Vault', 'archive', -18, -6, 8, 18, 2, 'lead-lined dry vault holding the master Ring Sea rutters and sealed island surveys'),
                R(5, 'Vault Keeper & Watch', 'guard', -6, 3, -16, -9, 1),
                R(6, 'Great Cistern (under Korta de Kompas)', 'cistern', -9, 9, -9, 9, 0, 'freshwater cistern fed by the cloister roofs, supplying outbound ships'),
                R(7, 'Wine, Rrom & Victual Cellar', 'buttery', 9, 27, 6, 18, 0),
                box(8, 'Main Stair Foot', 'stair', MSTAIR, 1),
                box(9, 'Pilots\' Stair', 'stair', SSTAIR, 1),
            ],
            outlines=[(-24, 24, -20, 20, 'the Guildhouse block above'), (-9, 9, -9, 9, 'Korta de Kompas above')]
        ),
        dict(
            id='G', tier=0, R=30, rect=(-27, 27, -22, 22),
            title="Gilda de Navigadarz — Ground Storey: Korta de Kompas & Ol de Selarz (y 0.8 to 6.2)",
            sub="A carved Baroque stone portal opens through a vestibule into the two-storey Arcaded Compass Cloister (Korta de Kompas, with an inlaid marble compass-rose fountain), flanked by the vaulted Sea-Captains' Exchange (Ol de Selarz), the Licensing & Manifest Hall, and the Mariners' Chapel of the Star.",
            rooms=[
                R(1, 'Baroque Portal & Seaward Loggia', 'hall', -27, -20, -14, 14, 3, 'carved grey-pink volcanic stone arcade with wrought-iron lanterns and anchors'),
                R(2, 'Vestibule of the Winds', 'vestibule', -20, -9, -6, 6, 3, 'polychrome tile wind-rose dadoes; busts of the first Ring Sea circumnavigators'),
                R(3, 'Porter & Admiralty Guard', 'guard', -20, -12, -18, -6, 1),
                R(4, 'Waiting Hall of the Masters', 'antechamber', -20, -12, 6, 18, 2),
                R(5, 'Compass Cloister (Korta de Kompas)', 'court', -9, 9, -9, 9, 4, 'inhabited courtyard: scalloped stone compass-rose fountain, tile pool, citrus trees in terracotta urns'),
                R(6, 'Cloister Walk (North & South Arcades)', 'hall', -9, 9, 9, 13, 3, 'pinkish-grey stone arches on Tuscan columns'),
                R(7, 'Sea-Captains\' Exchange (Ol de Selarz)', 'council', -9, 12, 13, 20, 4, 'groin-vaulted hall where shipmasters, underwriters and factors charter voyages'),
                R(8, 'Manifest, Pilotage & Licensing Office', 'ministry', -9, 12, -20, -15, 2, 'clerks issue pilot certificates, sea-passes and convoy orders'),
                R(9, 'Instrument & Compass Assay Room', 'weighing', 12, 24, -20, -6, 2, 'testing sextants, astrolabes, sand-glasses and compass needles before departure'),
                R(10, 'Hall of the Sea-Models & Figureheads', 'hall', 9, 24, -6, 10, 3, 'suspended votive ship models, captured pirate flags, and harbour chain winches'),
                R(11, 'Mariners\' Chapel of the Star (Templa de Istar)', 'oratory', 16, 24, 10, 20, 3, 'shrine where crews make offerings before crossing the Ring Sea'),
                box(12, 'Grand Staircase (Stone & Iron)', 'stair', MSTAIR, 3),
                box(13, 'Pilots\' Stair', 'stair', SSTAIR, 1),
            ],
            outlines=[(-24, 24, -20, 20, 'the Guildhouse block')],
            doors=[(-27, 0), (24, 0)]
        ),
        dict(
            id='U', tier=1, R=30, rect=(-27, 27, -22, 22),
            title="Gilda de Navigadarz — Upper Storey: Ol de Chartaz & Korta de Admirol (y 6.2 to 10.8)",
            sub="The brain of Izani navigation: the bright north-lit Master Chart Studio (Ol de Chartaz) where the Greta Charta de Rriñ (the master sea-chart of the Ring Sea) is kept and updated, the Pilot-Major's Lecture & Examination Hall, the Admiralty Prize Court, and the Guildmaster's Cabinet, wrapped in lacy New Orleans wrought-iron exterior galleries and corner bay windows.",
            rooms=[
                R(1, 'Seaward Wrought-Iron Gallery & Corner Bays', 'hall', -26, -20, -18, 18, 3, 'cantilevered black cast-iron lacework gallery overlooking the harbour mouth'),
                R(2, 'Upper Cloister Gallery', 'dome_gallery', -12, 12, -12, -9, 3, 'balustraded stone and iron gallery looking down into Korta de Kompas'),
                R(3, 'Korta de Kompas (open below)', 'void', -9, 9, -9, 9, 0),
                R(4, 'Master Chart Studio (Ol de Chartaz)', 'library', -12, 12, 9, 20, 4, 'continuous bay windows; long draughting tables where cartographers update the Greta Charta de Rriñ'),
                R(5, 'Engravers\' & Copperplate Press Room', 'office', 12, 24, 14, 20, 2, 'printing harbor charts and tide tables for licensed captains'),
                R(6, 'School of Navigation & Examination Hall', 'school', -20, -9, 6, 18, 3, 'tiered benches, celestial globes and armillary spheres where pilots are examined'),
                R(7, 'Admiralty & Prize Court (Korta de Admirol)', 'council', -9, 12, -20, -15, 4, 'hears salvage disputes, mutinies, and prize cases; hung with red velvet and gilt anchors'),
                R(8, 'Master of the Guild\'s Cabinet', 'cabinet', -20, -12, -18, -6, 4, 'corner glazed bay window commanding both Mol de Porta and Knal Greta'),
                R(9, 'Pilot-Major\'s Office & Rutters Library', 'library', 12, 24, -20, -6, 3, 'every returning captain must deposit his logbook here before unloading cargo'),
                R(10, 'Map-Colourers\' & Calligraphers\' Gallery', 'office', 9, 24, -6, 10, 2),
                box(11, 'Grand Staircase Landing', 'stair', MSTAIR, 3),
                box(12, 'Pilots\' Stair', 'stair', SSTAIR, 1),
                box(13, 'Observatory Turret Stair', 'stair', OSTAIR, 2),
            ],
            outlines=[(-24, 24, -20, 20, 'the Guildhouse block')]
        ),
        dict(
            id='L', tier=2, R=30, rect=(-27, 27, -22, 22),
            title="Gilda de Navigadarz — Roof Terrace, Observatory Dome & Signal Tower (y 10.8 to 23.0)",
            sub="Flat stone-paved azimuth terrace behind Baroque urn parapets, crowned by the verdigris-copper Astrolabe Observatory Dome (y 10.8 to 19.5) and the Harbour Signal Lantern (Tauar de Laita, to y 23.0) that exchanges semaphore and heliograph flashes with inbound ships and Palas de Govarnar.",
            rooms=[
                R(1, 'Azimuth & Meridian Roof Terrace', 'garden', -20, 9, -16, 16, 2, 'inlaid bronze meridian line on the stone paving for noon sights; potted agaves along the parapet'),
                R(2, 'Korta de Kompas (open below)', 'void', -9, 9, -9, 9, 0),
                R(3, 'Astrolabe Observatory Dome', 'signal', 10, 22, -6, 6, 4, 'rotating verdigris copper dome housing the great brass transit, telescope and tide-clock'),
                R(4, 'Semaphore & Harbour Signal Lantern (Tauar de Laita)', 'signal', -22, -16, -4, 4, 3, 'shutter-telegraph, storm-ball mast and electric harbour-control lamp'),
                box(5, 'Observatory Turret Stair', 'stair', OSTAIR, 2),
            ],
            outlines=[(-24, 24, -20, 20, 'the Guildhouse roof'), (10, 22, -6, 6, 'Copper Observatory Dome')]
        ),
    ]

    def draw_nav_section():
        f_t = B.font(36, True); f = B.font(19); fs = B.font(16)
        W, H = 2200, 1150
        img = Image.new('RGB', (W, H), (255, 255, 255))
        dr = ImageDraw.Draw(img)
        dr.text((30, 18), "Section through the main axis (u): Gilda de Navigadarz / Navigators' Guild HQ of Marr (heights x2)", font=f_t, fill=(20, 20, 20))
        dr.text((30, 66), "Storeys: Undercroft & Water-Gate (-3.2 to 0.8 m), Ground Korta de Kompas & Ol de Selarz (0.8 to 6.2 m), Upper Ol de Chartaz (6.2 to 10.8 m), Observatory Dome (to 19.5 m) & Signal Tower (to 23.0 m).", font=f, fill=(70, 70, 70))
        sx, sy = 32.0, 30.0
        ox, base = W // 2, H - 240
        def X(u): return ox + u * sx
        def Y(h): return base - h * sy
        dr.line([(0, Y(0)), (W, Y(0))], fill=(70, 130, 170), width=2)
        dr.text((24, Y(0) + 6), "Harbour & Canal Water Level (y 0.0)", font=fs, fill=(50, 100, 140))
        boxes = [
            (-24, 9, -3.2, 0.8, "Undercroft: Chronometer & Rutter Vaults, Great Cistern", (222, 222, 218)),
            (9, 27, -3.2, 0.8, "Geta de Bodaz (Water-Gate & Slip)", (175, 212, 228)),
            (-27, -20, 0.8, 6.2, "Seaward Loggia", (242, 228, 195)),
            (-20, -9, 0.8, 6.2, "Vestibule", (238, 220, 150)),
            (-9, 9, 0.8, 10.8, "Korta de Kompas (open court with compass-rose fountain)", (235, 245, 232)),
            (9, 24, 0.8, 6.2, "Hall of Sea-Models & Instrument Assay", (238, 220, 150)),
            (-26, -20, 6.2, 10.8, "Iron Gallery & Corner Bays", (215, 225, 235)),
            (-20, -9, 6.2, 10.8, "Navigation School & Master's Cabinet", (212, 226, 176)),
            (9, 24, 6.2, 10.8, "Pilot-Major's Library & Chart Press", (212, 226, 176)),
            (-22, -16, 10.8, 21.0, "Tauar de Laita", (238, 210, 165)),
            (10, 22, 10.8, 15.0, "Observatory Drum", (220, 232, 224)),
        ]
        for u0, u1, h0, h1, nm, col in boxes:
            dr.rectangle([X(u0), Y(h1), X(u1), Y(h0)], fill=col, outline=(30, 30, 30), width=2)
            dr.text((X(u0) + 6, Y(h1) + 6), nm, font=fs, fill=(15, 15, 15))
        dr.pieslice([X(10), Y(19.5), X(22), Y(10.5)], 180, 360, fill=(120, 188, 168), outline=(30, 30, 30), width=2)
        dr.text((X(10.5), Y(18.2)), "Copper Observatory Dome", font=fs, fill=(15, 50, 40))
        return img

    B.KEYMAP.clear(); B.KEYMAP.update(IZ.keymap())
    B.EXTRA_PROGRAMS.clear(); B.EXTRA_PROGRAMS.update(IZ.iziz_programs())
    cs = lambda n: max(1, round(n))
    B.EXTRA_PROGRAMS.update({
        'council': lambda a, w, d, D: [('marr_council_table', 1), ('marr_globe_stand', 2), ('iziz_common_chair', cs(a / 5)), ('marr_city_banner', 4), ('iziz_court_cabinet', 2)],
        'library': lambda a, w, d, D: [('marr_chart_table', cs(a / 18)), ('marr_rutter_case', cs(a / 14)), ('marr_globe_stand', 2), ('iziz_common_chair', cs(a / 6))],
        'school': lambda a, w, d, D: [('marr_globe_stand', 2), ('iziz_common_bench', cs(a / 8)), ('iziz_common_desk', 2), ('iziz_common_board', 2)],
        'weighing': lambda a, w, d, D: [('marr_astrolabe_bench', 2), ('marr_manifest_desk', 2), ('iziz_common_cabinet', 3)],
        'signal': lambda a, w, d, D: [('marr_transit_telescope', 1), ('marr_globe_stand', 1), ('iziz_common_desk', 1)],
    })
    for k in list(B.NEW): B.NEW.pop(k)
    B.NEW.update(IZ.IZIZ_NEW)
    B.NEW.update({
        'marr_council_table': 'the Gilda de Navigadarz and merchant syndics\' table: a long mahogany boat-hull table with inlaid brass compass roses and wrought-iron scroll stretchers',
        'marr_city_banner': 'a banner of Marr: a gilt astrolabe and twin canal-bridges over wavy blue-and-white bars, bordered in Iziz orange',
        'marr_manifest_desk': 'the Harbour Excise clerk\'s sloped mahogany ledger desk with pigeonholes for ship manifests, brass bullion scales and sealing-wax braziers',
        'marr_chart_table': 'a broad inclined mahogany draughting table for the Greta Charta de Rriñ, with brass straightedges, dividers and lead map-weights',
        'marr_rutter_case': 'a glazed cedar-and-brass cabinet of rolled parchment sea-charts, lead-bound rutters and portolan atlases',
        'marr_globe_stand': 'a pair of floor-standing celestial and Ring Sea globes in brass meridian rings on turned mahogany tripods',
        'marr_astrolabe_bench': 'an instrument-maker\'s bench with brass astrolabes, sextants, lodestone needles and sand-glasses under test',
        'marr_transit_telescope': 'the great brass azimuth transit and telescope mounted under the rotating copper shutter of the Observatory Dome',
    })
    B.CITY.clear()
    for F in FL:
        F['axisnote'] = 'seaward portal at the left (u = -27); canal water-gate (Geta de Bodaz) at the right (u = +27)'
    fm = os.path.join(nav_dir, 'FURNITURE.md')
    intro = "Generated by `kits/marr/marr_blueprint.py` (on `settlements/voth/palace/blueprint.py`) for `mar_navigators_guild` (`54 x 44 m`), the splendid headquarters of the Navigators' Guild (`Gilda de Navigadarz`) on `Poinda de Navigadarz`.\n"
    B.main(floors=FL, out=nav_dir, here=nav_dir, title="# The Headquarters of the Navigators' Guild of Marr (Gilda de Navigadarz): furniture manifest\n", intro=intro, section=draw_nav_section, zone_R=-1)
    with open(fm, encoding='utf-8') as fh:
        lines = fh.read().split('\n')
    with open(fm, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(l for l in lines if not (l.startswith('- `') and l.endswith('(x0)'))))


if __name__ == '__main__':
    draw_world_siting()
    draw_city_masterplan()
    draw_courtyard_archetypes()
    build_navigators_guild_blueprint()
