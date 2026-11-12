#!/usr/bin/env python3
"""Scale model 5.1, edit 3 (2026-11-11): the Bay of Voth shrunk to Voth's page, its rim softened, the Turm re-routed.

    python tools/scale-model/edit_513.py            # edits model/data in place, writes edit_513.report.json
    python tools/scale-model/edit_513.py --dry      # computes and prints the report, writes nothing
    python tools/scale-model/edit_513.py --terrain <out.npz>   # the new heights only, to look at

Step V1 of openworld/PLAN-VOTH.md; the owner's answers of 2026-11-11 (its section 6): the bay shrunk to the page's water
system, the whole rim softened to low shores and hills, the Turm re-routed into the bay's south-east corner.

1. Voth's page water (settlements/voth/src/10-core.js:87-117, read here, never edited) laid on the model with Voth's pin
   (742,1018) as the page's origin, the page's north (-z) as north, 2,000 m a px: the bay, the narrows, the lake, and the
   strait carried on north-north-east on the page's bearing to the Ring Sea at the old bay's neck. A cell is water where
   the page's water covers half of it; the strait (680 m) is a chain of wet cells. Their beds are the page's depth
   profile averaged over the cell. The rest of the old bay (south of the neck, y >= 1005) becomes land.
2. The land: a 250 m field of the page's shore profile by distance to the water (2 m at the shore, 22 m at 700 m, 60 m
   by 1.7 km), rising to hills of ~250 m 8 km off, with the page's own named ridges inside its frame, averaged over each
   cell. The old rim (all round, within 6 px of the old bay) eased from that field back to the old ground, so the
   350-700 m cliffs become slopes and the scarp and ridges beyond stay as the backdrop.
3. The Turm (r029) re-routed. It cannot reach the bay without crossing the Vindos (r023), which runs north into the
   eastern inlet's head between the Turm and the peninsula; so the inlet's head (y >= 1016) is filled to a small delta
   plain under the cliffs, behind a barrier of low hills on the inlet's new head, and the Turm leaves its old course at
   780.7,1019 (where the Silvr joins), falls onto the delta, takes in the Vindos there (774.6,1019.2), and runs west
   through a valley cut in the peninsula and across the old bay's floor to the page's river and its mouth in the bay's
   south-east corner (880,1160 page m). Its bed is at sea level for the page's last ~5 km and rises 0.4 m a km upstream.
4. Records: DATA.landforms gains the page's water (its circles and capsules in px), the narrows, the strait, the shelf,
   the river's reach on the page and the seven islets; DATA.basins Voth's lake, DATA.outlets its strait; r029 and
   r023's records follow.

Checks: the lake drains to the sea through its strait and, with the strait blocked, not under 3 m over the sea; no new
pit in the box (any filled and reported); the Turm and the Vindos fall all the way; every pin in the box unchanged but
Voth's (in the water, at sea level); heights, water, temperatures, rain, class and zone unchanged outside the box.
Refuses to run twice (the lf_voth_ landforms are the marker).
"""
import json, math, os, sys, warnings
from collections import Counter

import numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import smodel.page as P, smodel.geom as G, smodel.climate as C, smodel.paint as PA   # noqa: E402
from edit_511 import priority_fill, hexrgb   # noqa: E402
from edit_512 import cells_along, resample, box_fade, at, pits   # noqa: E402

SRC = os.path.join(HERE, 'model', 'src')

# ---- the frame: Voth's page on the model
PIN = (742, 1018)                         # s3n66733vo: the page's origin
M_PX = 2000.0                             # page metres a px
SEA = -1500.0                             # the Ring Sea; the page's 0
FRAME_M = 5400.0                          # the page's half-frame
VOTH_ID = 's3n66733vo'

# ---- Voth's page (settlements/voth/src/10-core.js:90-101, 134-145, 153-172; x east, z south, metres)
WATER = [
    ('c', -180, 900, 980), ('c', 150, 520, 680), ('c', -700, 430, 620),
    ('s', -90, 240, 150, -640, 560),
    ('c', -320, -1720, 1320), ('c', 260, -2900, 1880), ('c', -1180, -2520, 1460), ('c', 1420, -2060, 980),
    ('s', 560, -3800, 1020, -6000, 340),
    ('s', 880 - 0.923 * 420, 1160 - 0.385 * 420, 880 + 0.923 * 150, 1160 + 0.385 * 150, 150),
]
WATER_NAMES = ['bay, south lobe', 'bay, east side', 'bay, west arm', 'the narrows', 'lake, south basin',
               'lake, main body', 'lake, west reach', 'lake, east reach', 'strait to the sea', "the river's estuary"]
SMIN_K = 210.0
RIVER_ANCHOR = [[880, 1160], [1290, 1330], [1830, 1520], [2520, 1760], [3400, 2060], [4500, 2400], [5900, 2760]]
RIVER_AMP = [22, 52, 68, 58, 74, 54]
RIDGES = [
    [1820, 520, 230, 620], [2450, -360, 275, 700], [2150, 1500, 180, 560],
    [1500, -1500, 205, 560], [2900, -1700, 250, 720], [-1750, 980, 215, 600],
    [-2400, 180, 240, 680], [-1450, 1520, 170, 520], [3400, 900, 260, 760],
    [-3100, -900, 230, 700], [3200, -3000, 300, 900], [-2600, -3400, 280, 860],
    [-400, -4400, 210, 900], [1500, -4300, 245, 950], [-2000, -4200, 190, 820],
    [2600, -4600, 230, 880], [-3300, -4500, 210, 900]]
ISLES = [[-430, 880, 16, 78, 'shrine'], [-14, 322, 12, 58, 'rock'], [-540, 60, 15, 70, 'light'],
         [250, -760, 20, 84, 'light'], [-760, -980, 12, 58, 'shrine'], [640, -1420, 11, 52, 'rock'],
         [-160, -1850, 17, 76, 'light']]
SHELF_M, SHELF_DEPTH = 70.0, (1.2, 4.8)

# ---- the model's side
BOX = (995, 1040, 718, 800)               # y0, y1, x0, x1
FBOX = (985, 1050, 705, 815)              # the spill test's box
NECK_Y = 1005                             # the old bay south of its neck (y >= 1005, x <= 752) becomes land
BAY_X1 = 752
STRAIT_END_Y = 1003.5                     # the strait carried to the open water north of the neck
SS = 8                                    # fine samples a px (250 m)
RIM_PX = 6.0                              # the old rim eased back to the old ground over 6 px (12 km)
HILL_M = 190.0                            # the hills' rise from 1.7 km to 8 km off the water
# the Turm: the old course kept to 780.7,1019 (the Silvr's confluence), then over the cliff onto the delta, the Vindos
# in at 774.6,1019.2, and west through the peninsula and the old bay's floor to the page's river
TURM_KEEP = 9                             # r029's first nine points
TURM_NEW = [(778.6, 1019.1), (776.8, 1019.2), (774.6, 1019.2), (772.6, 1019.4), (770.4, 1019.8), (768.0, 1020.1),
            (765.4, 1020.2), (762.6, 1020.1), (759.8, 1019.8), (757.0, 1019.8), (754.2, 1020.0), (751.4, 1020.1),
            (748.8, 1020.0), (746.6, 1019.75)]
CONFL = (774.6, 1019.2)
TURM_DELTA_M = 25.0                       # the bed on the delta over the sea; falling 0.4 m a km to the page's frame
INLET_HEAD = (1016, 770, 778)             # the eastern inlet's head filled: y >= 1016, x 770..777
BARRIER_M = 110.0                         # the delta's barrier hills on the inlet's new head
VALLEY_X1 = 773.5                         # the valley's carve stops at the delta (the Vindos and the cliffs kept)
CROSS_RIVERS = ('r029', 'r023')


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


def seg_dist(x, z, ax, az, bx, bz):
    vx, vz = bx - ax, bz - az
    L = vx * vx + vz * vz
    t = np.clip(((x - ax) * vx + (z - az) * vz) / L, 0, 1) if L > 0 else 0
    return np.hypot(x - (ax + vx * t), z - (az + vz * t))


def strait_end():
    """the page's strait carried on its own bearing to y = STRAIT_END_Y (page metres)"""
    (_, ax, az, bx, bz, _) = WATER[8]
    z = (STRAIT_END_Y - PIN[1]) * M_PX
    return bx + (z - bz) * (bx - ax) / (bz - az), z


def water_sdf(x, z, page_only=False):
    """the page's waterSDF, with the strait carried on to the open sea: < 0 in the water (metres)"""
    d = None
    parts = list(WATER) + ([] if page_only else [('s', WATER[8][3], WATER[8][4]) + strait_end() + (WATER[8][5],)])
    for W in parts:
        e = np.hypot(x - W[1], z - W[2]) - W[3] if W[0] == 'c' else seg_dist(x, z, *W[1:5]) - W[5]
        d = e if d is None else smin(d, e, SMIN_K)
    return d


def page_depth(dep):
    """the page's bed under its water (terrainH, L <= 0): metres under the surface, dep metres off the shore"""
    s_ = lambda a, b: G.sstep(a, b, dep)
    return -1.2 - 3.6 * s_(0, 70) - 9 * s_(70, 330) - 23 * s_(330, 920) - 15 * s_(920, 2100)


def river_page():
    """the page's RIVER (its anchors and the wave between them), page metres, mouth first"""
    pts = [RIVER_ANCHOR[0]]
    for i in range(len(RIVER_ANCHOR) - 1):
        a, b = RIVER_ANCHOR[i], RIVER_ANCHOR[i + 1]
        dx, dz = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dz)
        sg = 1 if i % 2 == 0 else -1
        pts.append([(a[0] + b[0]) / 2 - dz / L * RIVER_AMP[i] * sg, (a[1] + b[1]) / 2 + dx / L * RIVER_AMP[i] * sg])
        pts.append(b)
    return pts


def steepest(E, m):
    """the largest height step between two 4-neighbours both in m"""
    a = np.where(m[:, 1:] & m[:, :-1], np.abs(E[:, 1:] - E[:, :-1]), 0)
    b = np.where(m[1:, :] & m[:-1, :], np.abs(E[1:, :] - E[:-1, :]), 0)
    return float(max(a.max(), b.max()))


def to_px(x, z):
    return PIN[0] + x / M_PX, PIN[1] + z / M_PX


def main(dry=False):
    D = P.load()
    if any(l_['id'].startswith('lf_voth_') for l_ in D.get('landforms', {}).get('landforms', [])):
        sys.exit('edit_513 has run already (the lf_voth_ landforms are in model/data)')
    rep = {'edit': '5.1 edit 3', 'date': '2026-11-11'}
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = Eo.shape
    assert sh == (D['fullH'], D['fullW']), 'the height grid is the full grid (5.1)'
    codes = [c['code'] for c in D['climate']['classes']]
    yy, xx = np.mgrid[0:sh[0], 0:sh[1]].astype(float)
    raw0 = {k: P.raster(D, k, 'L' if k in ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc') else 'RGB')
            for k in ('h', 'wl', 'p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc', 'st', 't', 'rt', 'ct')}
    fade, inbox = box_fade(sh, BOX)
    y0, y1, x0, x1 = BOX
    fullbox = np.zeros(sh, bool)
    fullbox[y0:y1, x0:x1] = True
    sea0 = whas0 & (np.abs(np.nan_to_num(wlev0, nan=0) - SEA) < 1.0)
    assert sea0[PIN[1], PIN[0]], "Voth's pin is in the Ring Sea's water"

    # ---- the old bay: the sea's water south of the neck, west of the eastern peninsula
    cand = sea0 & inbox & (yy >= NECK_Y) & (xx <= BAY_X1)
    lab, _ = nd.label(cand)
    oldbay = lab == lab[PIN[1], PIN[0]]
    hy, hy1 = INLET_HEAD[0], 1023
    head = sea0 & (yy >= hy) & (yy < hy1) & (xx >= INLET_HEAD[1]) & (xx < INLET_HEAD[2])
    rep['old_bay'] = {'cells': int(oldbay.sum()), 'km2': int(oldbay.sum()) * 4,
                      'bed_m': [round(float(Eo[oldbay].min())), round(float(np.median(Eo[oldbay]))), round(float(Eo[oldbay].max()))],
                      'x': [int(xx[oldbay].min()), int(xx[oldbay].max())], 'y': [int(yy[oldbay].min()), int(yy[oldbay].max())]}
    ring = nd.binary_dilation(oldbay, structure=np.ones((3, 3))) & ~whas0
    rep['old_rim_m_over_sea'] = {'median': round(float(np.median(Eo[ring] - SEA))),
                                 'p90': round(float(np.percentile(Eo[ring] - SEA, 90))), 'cells': int(ring.sum())}

    # ---- 1. the page's water on a 250 m grid over the box
    fy, fx = np.mgrid[y0 * SS:y1 * SS, x0 * SS:x1 * SS].astype(float)
    FX, FY = x0 - 0.5 + (fx - x0 * SS + 0.5) / SS, y0 - 0.5 + (fy - y0 * SS + 0.5) / SS      # map px of each sample
    PXm, PZm = (FX - PIN[0]) * M_PX, (FY - PIN[1]) * M_PX                                       # page metres
    sdf = water_sdf(PXm, PZm)
    pwet = sdf < 0
    cover = pwet.reshape(y1 - y0, SS, x1 - x0, SS).mean((1, 3))
    page_cells = np.zeros(sh, bool)
    page_cells[y0:y1, x0:x1] = cover >= 0.5
    lab, _ = nd.label(page_cells)
    page_cells = lab == lab[PIN[1], PIN[0]]
    ex_, ez_ = strait_end()
    sa = to_px(WATER[8][1], WATER[8][2])
    strait_px = [sa, to_px(ex_, ez_)]
    chain = []
    for c in cells_along(strait_px):
        if chain and abs(c[0] - chain[-1][0]) + abs(c[1] - chain[-1][1]) == 2:
            chain.append((chain[-1][0], c[1]))                   # a 4-connected chain
        chain.append(c)
    chain = [c for c in chain if not page_cells[c]]
    strait_cells = np.zeros(sh, bool)
    for c in chain:
        strait_cells[c] = True
    assert sea0[chain[-1]] and not oldbay[chain[-1]], 'the strait reaches the open sea'
    lake = page_cells | strait_cells                             # the new water (all of it in the old bay)
    assert not (lake & ~oldbay & ~(sea0 & (yy < NECK_Y))).any(), 'the new water lies in the old bay'
    to_land = (oldbay & ~lake) | head
    whas2, wlev2 = whas0.copy(), wlev0.copy()
    whas2[to_land], wlev2[to_land] = False, np.nan
    water2 = water0.copy()
    water2[to_land] = False
    to_water = lake & ~whas0
    whas2[lake], wlev2[lake] = True, SEA
    water2[lake] = True

    # the distance to the water on the fine grid: the page's own water (and strait), and every other wet cell
    other = np.repeat(np.repeat((whas2 & ~lake)[y0:y1, x0:x1], SS, 0), SS, 1)
    wfine = pwet | other
    dkm = nd.distance_transform_edt(~wfine) / SS * M_PX / 1000.0

    # ---- 2. the land: the page's shore profile, hills behind, the page's ridges in its frame
    s_ = lambda a, b, v: G.sstep(a, b, v)
    T = 2 + 20 * s_(0, .7, dkm) + 38 * s_(.76, 1.7, dkm) + HILL_M * s_(1.7, 8.0, dkm)
    T += 45 * np.sin(FX * 0.9 + FY * 0.4 + 1.3) * np.sin(FY * 0.7 - FX * 0.3 + 0.4) * s_(1.5, 4.0, dkm)
    inland = s_(-0.01, 0.34, dkm)
    for rx, rz, rh, rr in RIDGES:
        q = ((PXm - rx) ** 2 + (PZm - rz) ** 2) / (rr * rr)
        T += np.where(q < 4, rh * np.exp(-q * 1.45), 0) * inland
    Tm = np.where(wfine, np.nan, T).reshape(y1 - y0, SS, x1 - x0, SS)
    with np.errstate(all='ignore'):
        Tc = np.nanmean(Tm, (1, 3))
    Tcell = np.full(sh, np.nan)
    Tcell[y0:y1, x0:x1] = Tc
    Tcell = SEA + np.where(np.isnan(Tcell), 2.0, Tcell)
    En = Eo.copy()
    En[oldbay & ~lake] = Tcell[oldbay & ~lake]

    # the rim eased from the field back to the old ground; the rivers this edit does not move keep their ground
    R = {r_['id']: r_ for r_ in D['rivers']}
    keep = np.zeros(sh, bool)
    kept_rivers = []
    for r_ in D['rivers']:
        if r_['id'] in CROSS_RIVERS:
            continue
        cl = [c for c in cells_along([tuple(p) for p in r_['px']]) if fullbox[c]]
        if cl:
            kept_rivers.append(r_['id'])
            for c in cl:
                keep[c] = True
    for rid in ('r023',):                                        # the Vindos's own course, kept to its old fall
        for c in cells_along([tuple(p) for p in R[rid]['px']]):
            keep[c] = True
    dkeep = nd.distance_transform_edt(~keep)
    prot = G.sstep(3.0, 1.5, dkeep)
    d_ob = nd.distance_transform_edt(~oldbay)
    rim = ~whas0 & inbox & (d_ob <= RIM_PX + 0.5) & ~head
    w_r = G.sstep(0.5, RIM_PX, d_ob)
    blend = Tcell + (Eo - Tcell) * w_r
    En[rim] = (Eo + (blend - Eo) * (1 - prot) * fade)[rim]
    rep['rim'] = {'cells': int(rim.sum()), 'lowered_max_m': round(float((Eo - En)[rim].max())),
                  'raised_max_m': round(float((En - Eo)[rim].max())), 'kept_rivers': kept_rivers}

    # ---- 3. the Turm: its course, beds, the valley through the peninsula, the delta on the inlet's head
    rp = [to_px(*p) for p in river_page()]
    tail = TURM_NEW + [tuple(p) for p in reversed(rp)]
    tail_pts = [list(p) for p in tail]
    fine = np.array(resample(tail_pts, 0.1))
    arc = np.r_[0, np.cumsum(np.hypot(*np.diff(fine, axis=0).T))] * M_PX / 1000.0     # km along the new course
    k_conf = int(np.argmin(np.hypot(fine[:, 0] - CONFL[0], fine[:, 1] - CONFL[1])))
    frame_edge = np.nonzero(np.abs(fine[:, 0] - PIN[0]) * M_PX <= FRAME_M)[0][0]       # the page's east edge
    L_up = arc[frame_edge] - arc[k_conf]
    bed_f = np.where(np.arange(len(fine)) >= frame_edge, SEA + 0.5,
                     SEA + 0.5 + (TURM_DELTA_M - 0.5) * np.clip((arc[frame_edge] - arc) / L_up, 0, 1))
    tree = cKDTree(fine)
    dr, ir = tree.query(np.stack([xx.ravel(), yy.ravel()], 1).astype(float), distance_upper_bound=8.0)
    ir = np.where(np.isinf(dr), 0, ir).reshape(sh)
    dr = np.where(np.isinf(dr), 99.0, dr).reshape(sh)
    bed_at = bed_f[ir]
    vz = inbox & (dr < 6.0) & (xx <= VALLEY_X1) & ~lake & (ir >= k_conf)
    V = bed_at + 3.0 + 150.0 * np.maximum(0, dr - 0.6) ** 1.1
    En[vz] = np.minimum(En[vz], (En + (V - En) * (1 - prot) * G.sstep(6.0, 4.5, dr))[vz])
    # the delta: the floodplain by the river, the barrier hills on the inlet's new head
    d_in = nd.distance_transform_edt(~(whas2 & sea0 & (xx >= 760) & (yy >= 1005) & (yy < hy)))
    flood = bed_at + 3.0 + 40.0 * np.maximum(0, dr - 0.6)
    bar = SEA + BARRIER_M * G.sstep(3.2, 1.0, d_in)
    En[head] = np.maximum(flood, bar)[head]
    # the river's own cells, falling all the way
    tcells = []
    for c in cells_along(tail_pts):
        if not tcells or tcells[-1] != c:
            tcells.append(c)
    prev = None
    for c in tcells:
        if lake[c]:
            break
        _, k = tree.query([c[1], c[0]])
        b = float(bed_f[k])
        if Eo[c] > SEA + 400 and c[1] > VALLEY_X1:              # the cliff it falls over: its own ground
            b = float(En[c])
        if prev is not None:
            b = min(b, prev - 0.05)
        En[c] = min(En[c], b) if c[1] > VALLEY_X1 else b
        prev = float(En[c])
    rep['turm_cells'] = len(tcells)

    # ---- 4. the new water's beds: the page's profile, averaged over the wet part of each cell
    dep = np.where(pwet, page_depth(-sdf), np.nan).reshape(y1 - y0, SS, x1 - x0, SS)
    with np.errstate(all='ignore'):
        bc = np.nanmean(dep, (1, 3))
    bcell = np.full(sh, np.nan)
    bcell[y0:y1, x0:x1] = bc
    for c in zip(*np.nonzero(lake)):
        En[c] = SEA + (bcell[c] if not np.isnan(bcell[c]) else -1.2)
    # ---- the pins
    s_src = open(os.path.join(SRC, '60-settlements.js'), encoding='utf-8').read()
    i0 = s_src.index('const defSetts = ') + len('const defSetts = ')
    setts, _ = json.JSONDecoder().raw_decode(s_src[i0:])
    for st in setts:
        if y0 <= st['py'] < y1 and x0 <= st['px'] < x1 and st['id'] != VOTH_ID:
            En[st['py'], st['px']] = Eo[st['py'], st['px']]

    # ---- 5. no new pit
    S0 = np.where(whas0, np.fmax(Eo, np.nan_to_num(wlev0, nan=-1e9)), Eo)
    S2 = np.where(whas2, np.fmax(En, np.nan_to_num(wlev2, nan=-1e9)), En)
    pit0, _ = pits(S0, BOX)
    # an old pit the edit reaches (its ground moved, or next to ground that did) is filled with the rest
    touched = nd.binary_dilation((np.abs(En - Eo) > 0.5) | (whas0 != whas2), iterations=2)
    old_land_pit = pit0 & ~whas0 & ~touched
    filled = np.zeros(sh, bool)
    En_prefill = En.copy()
    for _ in range(8):
        pit1, F1 = pits(S2, BOX)
        new = pit1 & ~old_land_pit & ~whas2
        if not new.any():
            break
        En[new] = F1[new] + 0.05
        filled |= new
        S2 = np.where(whas2, np.fmax(En, np.nan_to_num(wlev2, nan=-1e9)), En)
    pit1, _ = pits(S2, BOX)
    rep['pits'] = {'before_cells': int((pit0 & ~whas0).sum()), 'old_pits_reached': int((pit0 & ~whas0 & touched).sum()), 'after_cells': int((pit1 & ~whas2).sum()),
                   'new_cells': int((pit1 & ~old_land_pit & ~whas2).sum()), 'filled_cells': int(filled.sum()),
                   'filled_max_m': round(float((En - En_prefill)[filled].max()), 1) if filled.any() else 0.0,
                   'filled_at': [[int(i), int(j)] for j, i in zip(*np.nonzero(filled))][:20]}
    assert not (pit1 & ~old_land_pit & ~whas2).any(), 'a new pit'

    # ---- 6. the spill: the lake's bed filled to its way out, strait open and strait blocked
    Fb = priority_fill(En, FBOX)
    lc = (int(round(to_px(260, -2900)[1])), int(round(to_px(260, -2900)[0])))
    spill = float(Fb[lc[0] - FBOX[0], lc[1] - FBOX[2]])
    Eb = En.copy()
    Eb[strait_cells] += 3000.0
    Fbb = priority_fill(Eb, FBOX)
    spill_b = float(Fbb[lc[0] - FBOX[0], lc[1] - FBOX[2]])
    rep['spill'] = {'level_m': SEA, 'spill_m': round(spill, 2), 'through_strait': bool(spill <= SEA),
                    'spill_with_strait_blocked_m': round(spill_b, 1), 'closed_otherwise': bool(spill_b >= SEA + 3.0)}
    assert spill <= SEA and spill_b >= SEA + 3.0, rep['spill']

    # ---- the bay's and the rim's numbers
    shore = nd.binary_dilation(lake, structure=np.ones((3, 3))) & ~whas2
    ys_, xs_ = np.nonzero(lake)
    pw = pwet.sum() * (M_PX / SS / 1000.0) ** 2
    inframe = (np.abs(PXm) <= FRAME_M) & (np.abs(PZm) <= FRAME_M)
    pw_page = (water_sdf(PXm, PZm, True) < 0).sum() * (M_PX / SS / 1000.0) ** 2
    pw_frame = (pwet & inframe).sum() * (M_PX / SS / 1000.0) ** 2
    rep['water'] = {'cells': int(lake.sum()), 'page_cells': int(page_cells.sum()), 'strait_cells': int(strait_cells.sum()),
                    'km2_cells': int(lake.sum()) * 4, 'km2_page_water': round(float(pw_page), 1),
                    'km2_in_page_frame': round(float(pw_frame), 1), 'km2_with_strait_to_sea': round(float(pw), 1),
                    'x': [int(xs_.min()), int(xs_.max())], 'y': [int(ys_.min()), int(ys_.max())],
                    'bed_m': [round(float(En[lake].min()), 1), round(float(En[lake].max()), 1)],
                    'page_cells_px': [[int(i), int(j)] for j, i in zip(*np.nonzero(page_cells))],
                    'strait_cells_px': [[int(c[1]), int(c[0])] for c in chain],
                    'old_bay_to_land_cells': int((oldbay & ~lake).sum()), 'inlet_head_to_land_cells': int(head.sum())}
    assert whas2[PIN[1], PIN[0]], "Voth's pin stays in the water"
    rep['new_shore_m_over_sea'] = {'median': round(float(np.median(En[shore] - SEA)), 1),
                                   'min': round(float((En[shore] - SEA).min()), 1),
                                   'max': round(float((En[shore] - SEA).max()), 1)}
    assert (En[shore] > SEA).all(), 'the shore is dry'
    rep['rim_after_m_over_sea'] = {'median': round(float(np.median(En[ring] - SEA))),
                                   'p90': round(float(np.percentile(En[ring] - SEA, 90)))}
    newland = oldbay & ~lake
    rep['new_land_m_over_sea'] = {'p10': round(float(np.percentile(En[newland] - SEA, 10))),
                                  'median': round(float(np.median(En[newland] - SEA))),
                                  'p90': round(float(np.percentile(En[newland] - SEA, 90)))}
    zone = (d_ob <= RIM_PX + 1) & ~whas2 & inbox
    rep['steepest_step_m_per_cell'] = {'before': round(steepest(Eo, zone & ~whas0)), 'after': round(steepest(En, zone))}
    if '--terrain' in sys.argv:
        np.savez_compressed(sys.argv[sys.argv.index('--terrain') + 1], En=En, Eo=Eo, whas2=whas2, lake=lake)
        print(json.dumps(rep, indent=1, ensure_ascii=False))
        return D, En

    # settlements: every pin but Voth's unchanged
    pins = {}
    for st in setts:
        if y0 <= st['py'] < y1 and x0 <= st['px'] < x1:
            pins[st['name']] = {'px': [st['px'], st['py']], 'before_m': round(float(Eo[st['py'], st['px']])),
                                'after_m': round(float(En[st['py'], st['px']])), 'wet_after': bool(whas2[st['py'], st['px']])}
            if st['id'] != VOTH_ID:
                assert abs(En[st['py'], st['px']] - Eo[st['py'], st['px']]) < 0.5 and whas2[st['py'], st['px']] == whas0[st['py'], st['px']], st['name']
    rep['pins'] = pins
    moved = (np.abs(En - Eo) > 0.5) | (whas2 != whas0)
    assert not (moved & ~inbox).any(), 'heights moved outside the box'

    # ---- 7. temperatures: lapsed with the surface; the cells that turned to land take their land twins'
    lap = C.lapse(D, Eo, En, whas0, wlev0, whas2, wlev2)
    T5 = {k: P.raster({'x': lap[k]}, 'x', 'L').astype(float) - 90 for k in C.TEMPS}
    pool = inbox & ~whas0 & ~whas2 & ~nd.binary_dilation(moved, iterations=2) & (T5['tm'] > -89)
    py_, px_ = np.nonzero(pool)
    ty_, tx_ = np.nonzero(to_land)
    ft = lambda X, Y, H: np.stack([X / 40.0, Y / 40.0, H / 350.0], 1)
    dk, ik = cKDTree(ft(px_, py_, Eo[pool])).query(ft(tx_, ty_, En[to_land]), k=12)
    wk = 1.0 / (dk + .25)
    for k in C.TEMPS:
        vals = T5[k][pool]
        T5[k][to_land] = np.round((vals[ik] * wk).sum(1) / wk.sum(1))
        if to_water.any():
            T5[k][to_water] = np.median(T5[k][lake & whas0])
        D[k] = P.b64(Image.fromarray(np.clip(T5[k] + 90, 0, 255).astype(np.uint8), 'L'), optimize=True)
    rep['temperatures'] = {'new_land_C': {k: round(float(np.median(T5[k][oldbay & ~lake])), 1) for k in C.TEMPS},
                           'water_C': {k: round(float(np.median(T5[k][lake])), 1) for k in C.TEMPS},
                           'delta_C': {k: round(float(np.median(T5[k][head])), 1) for k in C.TEMPS}}

    # ---- 8. rain, class and zone where the heights changed; the water's class on the water
    rain2, cls2, zon2, q, crep = C.reclimate(D, Eo, En, whas2, whas2.copy())
    rain0 = raw0['p'].astype(float) / 255 * 4000
    if to_water.any():
        rain2[to_water] = np.median(rain0[lake & whas0])
    cls2[whas2 & inbox] = raw0['c'][whas2 & inbox]
    cls2[to_water] = codes.index('WH')
    zon2[to_water] = int(np.bincount(raw0['z'][oldbay]).argmax())
    rep['reclimate'] = crep
    rep['new_land_climate'] = {'rain_mm_median': round(float(np.median(rain2[oldbay & ~lake]))),
                               'classes': dict(Counter(codes[c] for c in cls2[oldbay & ~lake]).most_common())}
    rep['shore_climate'] = dict(Counter(codes[c] for c in cls2[shore]).most_common())

    # ---- 9. the paint
    D['h'] = P.encode_heights(D, En, water2)
    D['wl'] = P.encode_levels(D, whas2, wlev2)
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2.astype(np.uint8), 'L'), optimize=True)
    rain_now = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), np.abs(rain_now - rain0) > 1)
    col = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    cnow = P.raster(D, 'c', 'L')
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cnow], cnow != raw0['c'])
    relit, EoF, EnF = PA.relight(D, Eo, En)
    for k, v_ in relit.items():
        D[k] = v_
    near = nd.binary_dilation(moved, iterations=3)
    tm_now = P.raster(D, 'tm', 'L').astype(float) - 90
    TURM_NEW_DRAW = [tuple(p) for p in R['r029']['px'][TURM_KEEP - 1:TURM_KEEP]] + [tuple(p) for p in tail_pts]
    from PIL import ImageDraw, ImageFilter
    for k in ('st', 't'):
        a = P.raster(D, k)
        a = PA.retint(a, EoF, EnF, near, ~near, 150.0)
        landw = np.clip(nd.gaussian_filter(to_land.astype(float), 0.8) * 1.5, 0, 1) * ~whas2
        # the old water's surf lines would show through as a ghost of the old bay: its paint softened first
        soft = nd.binary_dilation(to_land, iterations=1) & ~whas2 & fullbox
        sub = a[y0:y1, x0:x1].astype(float)
        blur = nd.gaussian_filter(sub, (1.6, 1.6, 0))
        sub[soft[y0:y1, x0:x1]] = blur[soft[y0:y1, x0:x1]]
        a = a.copy()
        a[y0:y1, x0:x1] = np.clip(sub, 0, 255).round().astype(np.uint8)
        a = PA.by_climate(a.astype(np.uint8), EnF, rain_now, tm_now, whas2 | near, to_land, landw)
        img = Image.fromarray(a.astype(np.uint8))
        over = Image.new('RGBA', img.size, (0, 0, 0, 0))
        dr_ = ImageDraw.Draw(over)
        colour = (64, 154, 168) if k == 'st' else (58, 112, 132)
        dr_.line(TURM_NEW_DRAW, fill=colour + (205,), width=2, joint='curve')
        over = over.filter(ImageFilter.GaussianBlur(.6))
        img = Image.alpha_composite(img.convert('RGBA'), over).convert('RGB')
        D[k] = P.jpeg_like(D, k, np.array(img))

    # ---- 10. records: the rivers, the strait, the lake, the landforms
    rep['rivers'] = rivers(D, R, En, tail_pts, k_conf, tcells)
    sbeds = [round(float(En[c]), 1) for c in chain]
    D['outlets'].append({'name': "Voth's strait", 'from': "Voth's lake (the bay, the narrows and the lake)",
                         'to': 'the Ring Sea', 'px': [[float(c[1]), float(c[0])] for c in chain],
                         'bed_m': [int(round(b)) for b in sbeds], 'lake_level_m': int(SEA)})
    lkm = to_px(260, -2900)
    basin = {'at_px': [round(lkm[0], 2), round(lkm[1], 2)], 'level_m': int(SEA), 'km2': int(round(pw_page)),
             'depth_m': round(-float(page_depth(np.array(2100.0)))), 'kind': 'through lake',
             'climate': codes[int(np.bincount(cnow[shore & ~whas2]).argmax())], 'spill_m': int(SEA),
             'name': "Voth's lake",
             'notes': ("Voth's page's water (edit_513, 2026-11-11): the bay, the narrows and the lake, at sea level, "
                       "brackish, open to the Ring Sea by its strait; the Turm (r029) in at the bay's south-east corner. "
                       "km2 is the page's water (%d cells on the model)." % int(lake.sum()))}
    D['basins'].append(basin)
    rep['basin'] = basin
    lfs = landforms(En, chain)
    D['landforms']['landforms'] += lfs
    rep['landforms'] = [{k: v for k, v in l_.items() if k not in ('note', 'parts', 'path_px')} for l_ in lfs]
    dc = Counter(cnow.ravel().tolist())
    for pr in D['climate']['present']:
        k = codes.index(pr['code'])
        pr['km2'] = int(dc.get(k, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(k, 0) / cnow.size, 2)
    # no river ends in a cell this edit dried, but the two it moved
    for r_ in D['rivers']:
        tp = (r_.get('to') or {}).get('at_px')
        if tp and r_['id'] not in CROSS_RIVERS and 'sea' in r_['to']:
            assert not to_land[int(round(tp[1])), int(round(tp[0]))], r_['id'] + ' ends on new land'

    # ---- 11. nothing else moved
    for k in ('h', 'wl'):
        diff = np.any(P.raster(D, k) != raw0[k], -1)
        assert not (diff & ~inbox).any(), k + ' changed outside the box'
    for k in ('tm', 'th', 'tl', 'tw', 'tc', 'p', 'c', 'z'):
        a = P.raster(D, k, 'L')
        assert not ((a != raw0[k]) & ~fullbox).any(), k + ' changed outside the box'
    rep['cells_changed'] = {k: int((P.raster(D, k, 'L') != raw0[k]).sum()) for k in ('tm', 'tw', 'tc', 'th', 'tl', 'p', 'c', 'z')}
    rep['cells_changed']['h'] = int(moved.sum())
    rep['box'] = {'y': [y0, y1], 'x': [x0, x1]}
    if not dry:
        P.save(D)
        json.dump(rep, open(os.path.join(HERE, 'edit_513.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1,
                  ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))
    return D, En


def rivers(D, R, En, tail_pts, k_conf, tcells):
    """r029 re-routed (its first TURM_KEEP points kept, then the new tail to the bay), r023 into it at the delta"""
    out = {}

    def length(pts):
        return round(sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:])) * 2.0, 1)
    t = R['r029']
    v = R['r023']
    old = {'n': len(t['px']), 'last': t['px'][-1], 'to': t.get('to'), 'length_km': t['length_km'],
           'q_mouth_m3s': t['q_mouth_m3s'], 'catchment_km2': t['catchment_km2']}
    tail = resample(tail_pts, 2.0)
    pts = [list(p) for p in t['px'][:TURM_KEEP]] + [[round(p[0], 2), round(p[1], 2)] for p in tail]
    b, m = [], 1e9
    for p in pts:
        m = min(m, float(at(En, p)))
        b.append(round(m, 1))
    for i in range(TURM_KEEP):
        b[i] = min(b[i], t['bed_m'][i])
    qv = v['q_mouth_m3s']
    q_old = list(t['q_m3s'][:TURM_KEEP])
    conf_i = TURM_KEEP + int(np.argmin([math.hypot(p[0] - CONFL[0], p[1] - CONFL[1]) for p in tail]))
    q = q_old + [t['q_mouth_m3s'] if i < conf_i else round(t['q_mouth_m3s'] + qv, 1) for i in range(TURM_KEEP, len(pts))]
    qm = q[-1]
    t['px'], t['bed_m'], t['q_m3s'] = pts, b, q
    t['length_km'] = int(round(length(pts)))
    t['q_mouth_m3s'] = qm
    t['catchment_km2'] = t['catchment_km2'] + v['catchment_km2']
    t['mouth_m'] = b[-1]
    t['width_m'] = int(round(4.5 * qm ** 0.5))
    t['depth_m'] = round(0.35 * qm ** 0.38, 1)
    t['to'] = {'sea': 'Ring Sea', 'at_px': [round(PIN[0] - 0.09, 2), round(PIN[1] + 0.45, 2)],
               'through': "Voth's bay, the narrows, the lake and the strait (edit_513)"}
    t['settlements'] = sorted(set(t.get('settlements', [])) | {'Voth'})
    t['order'] = t['order'] + 1 if v['order'] == t['order'] else max(t['order'], v['order'])
    out['r029'] = {'was': old, 'now': {'n': len(pts), 'last': pts[-1], 'to': t['to'], 'length_km': t['length_km'],
                                       'q_mouth_m3s': qm, 'catchment_km2': t['catchment_km2'], 'mouth_m': t['mouth_m'],
                                       'width_m': t['width_m'], 'depth_m': t['depth_m'], 'order': t['order'],
                                       'confluence_px': list(CONFL), 'bed_at_confluence_m': b[conf_i],
                                       'bed_at_frame_m': b[-3], 'diverted_at_px': t['px'][TURM_KEEP - 1]}}
    vo = {'to': v.get('to')}
    v['to'] = {'river': 'r029', 'name': t['name'], 'at_px': list(CONFL)}
    out['r023'] = {'was': vo, 'now': {'to': v['to']}}
    return out


def landforms(En, chain):
    """the records core/world stamps at 1:1: the page's water, the narrows, the strait, the shelf, the river's reach,
    the seven islets (px on the 5.1 canvas; heights absolute)"""
    note = ' edit_513, 2026-11-11 (openworld/PLAN-VOTH.md V1).'
    src = 'settlements/voth/src/10-core.js'
    out = []
    parts = []
    for W, nm in zip(WATER, WATER_NAMES):
        if W[0] == 'c':
            x, y = to_px(W[1], W[2])
            parts.append({'part': nm, 'shape': 'circle', 'px': [round(x, 4), round(y, 4)], 'r_m': W[3]})
        else:
            a, b = to_px(W[1], W[2]), to_px(W[3], W[4])
            parts.append({'part': nm, 'shape': 'capsule', 'px': [round(a[0], 4), round(a[1], 4)],
                          'px_to': [round(b[0], 4), round(b[1], 4)], 'r_m': W[5]})
    out.append({'id': 'lf_voth_water', 'kind': 'water', 'form': 'page', 'px': float(PIN[0]), 'py': float(PIN[1]), 'water_m': SEA,
                'origin_px': list(PIN), 'm_per_px': M_PX, 'north': '-z', 'smin_m': SMIN_K, 'parts': parts,
                'source': src + ':87-117',
                'note': ("Voth's page's water on the model: the union of these circles and capsules, blended by a "
                         "smooth minimum of 210 m, with ~116 m of noise on the shore on the page (landDist). The page's "
                         "x is east and z south, its origin Voth's pin; 22 km2 of water, the shore 20.4 km." + note)})
    na = to_px(WATER[3][1], WATER[3][2])
    nb = to_px(WATER[3][3], WATER[3][4])
    out.append({'id': 'lf_voth_narrows', 'kind': 'water', 'form': 'narrows', 'px': round((na[0] + nb[0]) / 2, 4),
                'py': round((na[1] + nb[1]) / 2, 4), 'path_px': [[round(na[0], 4), round(na[1], 4)], [round(nb[0], 4), round(nb[1], 4)]],
                'width_m': 2 * WATER[3][5], 'water_m': SEA, 'bed_m': round(SEA + float(page_depth(np.array(560.0))), 1),
                'note': "The narrows between Voth's bay and its lake, 1.1 km wide (the Fortress canton stands in it)." + note})
    sa = to_px(WATER[8][1], WATER[8][2])
    se = to_px(*strait_end())
    out.append({'id': 'lf_voth_strait', 'kind': 'water', 'form': 'strait', 'px': round(sa[0], 4), 'py': round(sa[1], 4),
                'path_px': [[round(sa[0], 4), round(sa[1], 4)], [round(se[0], 4), round(se[1], 4)]],
                'width_m': 2 * WATER[8][5], 'water_m': SEA, 'bed_m': round(SEA + float(page_depth(np.array(340.0))), 1),
                'length_km': round(math.hypot(se[0] - sa[0], se[1] - sa[1]) * M_PX / 1000, 1),
                'cells_px': [[int(c[1]), int(c[0])] for c in chain],
                'note': ("Voth's strait from the lake north-north-east to the Ring Sea, 680 m wide on the page; the model "
                         "carries it as a chain of wet cells (2 km), so the stamp narrows it.") + note})
    out.append({'id': 'lf_voth_shelf', 'kind': 'shelf', 'px': float(PIN[0]), 'py': float(PIN[1]), 'of': 'lf_voth_water', 'width_m': SHELF_M,
                'depth_m': list(SHELF_DEPTH), 'water_m': SEA,
                'note': ("A shelf 1.2-4.8 m deep for the first 70 m off every shore of Voth's water (the chinampas and "
                         "the canton ring need it), then the page's bed: 13.8 m at 330 m, 36.8 m at 920 m, 51.8 m at "
                         "2.1 km off the shore.") + note})
    rp = [to_px(*p) for p in river_page()]
    out.append({'id': 'lf_voth_river', 'kind': 'water', 'form': 'river', 'river': 'r029',
                'px': round(rp[0][0], 4), 'py': round(rp[0][1], 4), 'path_px': [[round(x, 4), round(y, 4)] for x, y in rp],
                'width_m': [80, 170], 'floodplain_m': [260, 1160], 'water_m': SEA,
                'note': ("The Turm's last 5.3 km on Voth's page, mouth first (the bay's south-east corner): at the lake's "
                         "level the whole way, 80-170 m wide on a flat floodplain; the bridges, docks, the river port and "
                         "the River Gate stand on it.") + note})
    for i, (ix, iz, ih, ir_, kind) in enumerate(ISLES):
        x, y = to_px(ix, iz)
        out.append({'id': 'lf_voth_isle_%d' % (i + 1), 'kind': 'island', 'px': round(x, 4), 'py': round(y, 4),
                    'r_m': float(ir_), 'crest_m': SEA + ih, 'water_m': SEA, 'role': kind,
                    'note': "An islet in Voth's water (%s), %d m over it. Sub-cell; its cell keeps the page's bed." % (
                        kind, ih) + note})
    return out


if __name__ == '__main__':
    warnings.filterwarnings('ignore', 'Mean of empty slice')
    main(dry='--dry' in sys.argv)
