#!/usr/bin/env python3
"""Scale model 5.1, edit 20 (2026-11-18): Swiss-Alpine massif chains, defended passes, and seven stepped glacial lakes
in the Iron Republic (`rmufxti8qwcxy`), with relocated lakehead towns (`Glaive`, `Stahlborn`) and three new cantonal
lake/lock burghs (`Urverkstad`, `Slussport`, `Korshamn`).

    python3 tools/scale-model/edit_520_republic_alps.py            # edits model/data + 60-settlements.js, writes report
    python3 tools/scale-model/edit_520_republic_alps.py --dry-run  # runs every step and check in memory, writes nothing

Full reasoning and quantitative specification: `core/simulation/PROPOSAL-IRON-REPUBLIC.md` (owner-approved 2026-11-18).

1. Drains the single flat 2,400 m saucer lake (`7,152 km2`) and five minor interior ponds strictly inside `pure_ir`
   (`rmufxti8qwcxy` minus all other political polygons: zero spillover into Eternal State, Scyvoi, Dilihan, Jimjam,
   Voth, or Frogmen).
2. Sculpts seven glaciated Swiss-style alpine massifs (`M1`–`M7`: `Jernhorn-Alperna`, `Midtkammen`, `Nordväggen`,
   `Vestkammen`, `Sydhorn-Kedjan`, `Kopparkammen`, `Tinnspetsarna`, summits `4,558–6,021 m`) and six defended U-passes
   (`P1`–`P6`, `2,295–3,429 m`).
3. Stamps seven stepped glacial ribbon and cruciform-fjord lakes (`L1`–`L7`: `Roketsjö` 2,860 m, `Korsvatn` 2,420 m,
   `Glasklar-Sjö` 2,360 m, `Kaskejt-Sjö` 2,220 m, `Nordsjö` 2,260 m, `Stålsjö` 2,580 m, `Malmtjärn` 2,880 m; total
   `6,288 km2`) into `h.png` and `wl.png`, with parabolic fjord beds, monotonic spillway cataracts (`C1`–`C7`), and
   depression-filled dry land so zero unintended endorheic pits or wet surface pits arise.
4. Re-binds `rivers.json`, `basins.json`, and `outlets.json` so every tributary and lake spillway drains cleanly
   down-step (`L1 -> r051 -> L2 -> r_ir_korssund -> L3 -> r010 -> L4 -> r004`, plus `L5 -> r014`, `L6 -> r281 -> r004`,
   and `L7 -> r027`).
5. Recomputes temperature lapse (`tm`, `th`, `tl`, `tw`, `tc`) and climate (`p`, `c`, `z`) via `smodel.climate`, and
   repaints/relights/retints `rt`, `ct`, `st`, `t` via `smodel.paint`, asserting **zero** modified pixels outside
   `pure_ir` across all PNG rasters (`h`, `wl`, `wd`, `p`, `c`, `z`, `tm`, `th`, `tl`, `tw`, `tc`).
6. Updates `model/src/60-settlements.js` (`defSetts`, `SETT_ADDED['5.1e20']`, `SETT_MOVED['5.1e20']`) to move `Glaive`
   `(599, 721)` and `Stahlborn` `(618, 859)` onto dry lakehead benches and add `Urverkstad` `(591, 801)`, `Slussport`
   `(576, 693)`, and `Korshamn` `(627, 740)`. Refuses to run twice.
"""
import copy
import heapq
import io
import json
import math
import os
import re
import sys
from collections import Counter

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import smodel.climate as C  # noqa: E402
import smodel.geom as G     # noqa: E402
import smodel.page as P     # noqa: E402
import smodel.paint as PA   # noqa: E402

SRC = os.path.join(HERE, 'model', 'src')
IR_ID = 'rmufxti8qwcxy'
IR_BOX = (550, 925, 488, 735)   # (y0, y1, x0, x1) bounding box with generous margin around Iron Republic
SETT_VER = '5.1e20'
DRY = ('--dry-run' in sys.argv) or ('--dry' in sys.argv)

# ---- 1. Seven Swiss-style glaciated alpine massifs (5.1 px; 2 km per px) ----
MASSIFS = [
    ('M1_jernhorn', 'Jernhorn-Alperna', 'Iron-Horn Alps (Roketstad backdrop, Bernese Oberland analogue)',
     [(618, 696), (628, 706), (639, 714), (646, 726)], 4720.0, 6.8, 340.0),
    ('M2_midtkam', 'Midtkammen', 'Central Gotthard-Aar Massif (splitting Korsvatn from Glasklar-Sjö)',
     [(578, 744), (591, 756), (602, 768), (607, 788), (602, 804)], 4820.0, 7.8, 380.0),
    ('M3_nordvagg', 'Nordväggen', 'Glarus-Säntis Northern Wall (between Nordsjö and Roketsjö/Korsvatn)',
     [(576, 701), (590, 704), (604, 705), (615, 699)], 4480.0, 6.2, 300.0),
    ('M4_vestkam', 'Vestkammen', 'Jura-Chablais Western Barrier (above Footfall & Eternal State march)',
     [(548, 734), (546, 754), (545, 778), (550, 802)], 4380.0, 6.5, 290.0),
    ('M5_sydhorn', 'Sydhorn-Kedjan', 'Valais-Pennine High Chain (between Glasklar-Sjö & Kaskejt gorge)',
     [(552, 814), (566, 815), (579, 811), (597, 818), (610, 830)], 4740.0, 6.8, 360.0),
    ('M6_kopparkam', 'Kopparkammen', 'Engadin-Skarn Ridge (between Kaskejt basin, Stålsjö & Cakmak gorge)',
     [(576, 848), (592, 848), (608, 849), (623, 846)], 4560.0, 5.8, 310.0),
    ('M7_lippgranit', 'Tinnspetsarna', 'Northern Granite Alps (framing Malmtjärn & Lipp tin/rare-earth pass)',
     [(640, 668), (656, 658), (670, 638), (684, 616)], 4780.0, 6.5, 330.0),
]

# ---- 2. Six defended alpine U-passes ----
PASSES = [
    ('P1_nordport', 'Nordport-Paset', 'Western Lock Gate (Hōng-Mā / Slussport -> Corpus)',
     (575.0, 693.0), [(569, 694), (575, 693), (582, 692)], 2285.0, 2.5,
     'Slussport (L5 Nordsjö) <-> Corpus / Eternal State'),
    ('P2_vastport', 'Västport (Simplon)', 'Western Ruin Pass (Footfall / Glasklar-Sjö -> Eternal State)',
     (546.0, 764.0), [(536, 762), (546, 764), (558, 766)], 2890.0, 2.5,
     'Footfall (L3 Glasklar-Sjö) <-> Chī-Mā / Corpus'),
    ('P3_korspas', 'Korspaset (Brünig)', 'Northern Federal Saddle (Nordsjö <-> Korsvatn / Glaive)',
     (596.0, 704.0), [(595, 692), (596, 704), (597, 716)], 2790.0, 2.4,
     'L5 Nordsjö <-> Glaive (L2 Korsvatn)'),
    ('P4_midtpas', 'Midtpaset (Gotthard)', 'Central Gotthard Col (Urner-Fjord of Korsvatn <-> Glasklar-Sjö)',
     (598.0, 772.0), [(610, 766), (598, 772), (584, 778)], 2940.0, 2.4,
     'L2 Korsvatn (Urner-Fjord) <-> L3 Glasklar-Sjö (over Midtkammen)'),
    ('P5_stalpas', 'Stålpaset (Bernina)', 'Southern Skarn & Karst Pass (Cascade / Kaskejt <-> Stålsjö & Stahlborn)',
     (598.0, 848.0), [(596, 836), (598, 848), (600, 855)], 2960.0, 2.5,
     'Kaskejt Basin <-> L6 Stålsjö / Stahlborn / Karst Tunnel'),
    ('P6_lipppas', 'Lipppaset', 'Northern Tin & Customs Col (Malmtjärn <-> Lipp <-> Aidol)',
     (688.0, 620.0), [(676, 630), (688, 620), (696, 622)], 3440.0, 2.6,
     'Malmtjärn / Roketstad Hwy <-> Lipp <-> Aidol (Dilihan D3)'),
]

# ---- 3. Seven stepped Swiss-style glacial ribbon & cruciform-fjord lakes ----
LAKES = [
    {
        'id': 'L1_roketsjo', 'name': 'Roketsjö', 'analogue': 'Zürichsee / Zugersee',
        'wlev_m': 2860.0, 'max_depth_m': 340.0, 'rim_min_m': 2905.0,
        'arms': [([(615, 706), (622, 713), (629, 719), (631, 724)], 2.3)],
        'sill_px': (632, 727), 'out_river': 'r051 (Silvr Bruk)', 'to_label': 'Korsvatn (2,420 m)',
        'q_m3s': 77.8, 'drop_to_m': 2420.0,
    },
    {
        'id': 'L2_korsvatn', 'name': 'Korsvatn', 'analogue': 'Vierwaldstättersee (Lake Lucerne, 4-arm cruciform fjord)',
        'wlev_m': 2420.0, 'max_depth_m': 560.0, 'rim_min_m': 2465.0,
        'arms': [
            ([(608, 742), (617, 741), (623, 740)], 2.4),   # East Silvr arm
            ([(608, 742), (603, 733), (600, 725)], 2.3),   # North Glaive arm
            ([(608, 742), (613, 756), (615, 771)], 2.7),   # SSE Urner-Fjord
            ([(608, 742), (600, 746), (594, 749)], 2.1),   # WNW Strait arm
        ],
        'sill_px': (591, 750), 'out_river': 'r_ir_korssund (Kors-Strömmen)', 'to_label': 'Glasklar-Sjö (2,360 m)',
        'q_m3s': 195.0, 'drop_to_m': 2360.0,
    },
    {
        'id': 'L3_glasklar', 'name': 'Glasklar-Sjö', 'analogue': 'Lac Léman / Lake Geneva (crescent piedmont-alpine)',
        'wlev_m': 2360.0, 'max_depth_m': 640.0, 'rim_min_m': 2405.0,
        'arms': [([(582, 758), (572, 765), (566, 776), (569, 789), (578, 799), (586, 801)], 3.6)],
        'sill_px': (590, 803), 'out_river': 'r010 (Blak Bruk)', 'to_label': 'Kaskejt-Sjö (2,220 m)',
        'q_m3s': 369.3, 'drop_to_m': 2220.0,
    },
    {
        'id': 'L4_kaskejtsjo', 'name': 'Kaskejt-Sjö', 'analogue': 'Brienzersee–Thunersee (power-cascade trough)',
        'wlev_m': 2220.0, 'max_depth_m': 460.0, 'rim_min_m': 2265.0,
        'arms': [([(585, 815), (581, 824), (576, 831), (572, 837)], 2.7)],
        'sill_px': (569, 839), 'out_river': 'r004 (Kaskejt Rivr)', 'to_label': "western lake (Ancient's Valley, 17 m)",
        'q_m3s': 760.8, 'drop_to_m': 1800.0,
    },
    {
        'id': 'L5_nordsjo', 'name': 'Nordsjö', 'analogue': 'Bodensee / Lake Constance (northern piedmont ribbon)',
        'wlev_m': 2260.0, 'max_depth_m': 320.0, 'rim_min_m': 2300.0,
        'arms': [([(609, 684), (596, 685), (585, 687), (580, 689)], 2.6)],
        'sill_px': (577, 690), 'out_river': 'r014 (Hōng-Mā)', 'to_label': 'NW lowlands lake (46 m)',
        'q_m3s': 330.4, 'drop_to_m': 2090.0,
    },
    {
        'id': 'L6_stalsjo', 'name': 'Stålsjö', 'analogue': 'Lake Lugano / Maggiore (southern skarn-marble gorge)',
        'wlev_m': 2580.0, 'max_depth_m': 380.0, 'rim_min_m': 2620.0,
        'arms': [([(614, 859), (603, 861), (592, 860), (584, 858)], 2.2)],
        'sill_px': (581, 858), 'out_river': 'r281 (Frost Rivr)', 'to_label': 'Kaskejt Rivr (r004)',
        'q_m3s': 85.3, 'drop_to_m': 2180.0,
    },
    {
        'id': 'L7_malmtjarn', 'name': 'Malmtjärn', 'analogue': 'Silsersee / Oberengadin (high northern granite tarn)',
        'wlev_m': 2880.0, 'max_depth_m': 240.0, 'rim_min_m': 2920.0,
        'arms': [([(664, 651), (656, 657), (648, 659)], 2.1)],
        'sill_px': (645, 659), 'out_river': 'r027 (Nīla-āṟu)', 'to_label': 'Jimjam lake (430 m)',
        'q_m3s': 139.6, 'drop_to_m': 2445.0,
    },
]

# ---- 4. Monotonic spillway cataracts (from inside source lake across sill to downstream lake or river gorge) ----
CATARACT_PATHS = [
    ('C1_silvr', 'L1_roketsjo', [(631, 724), (632, 727), (631, 731), (629, 735), (626, 739), (623, 740)], 2858.5, 2422.0),
    ('C2_korssund', 'L2_korsvatn', [(594, 749), (591, 750), (588, 752), (585, 755), (582, 758)], 2418.5, 2362.0),
    ('C3_blak', 'L3_glasklar', [(586, 801), (590, 803), (589, 807), (587, 811), (585, 815)], 2358.5, 2222.0),
    ('C4_kaskejt', 'L4_kaskejtsjo',
     [(572, 837), (569, 839), (566, 842), (563, 846), (562, 849), (560, 853), (556, 857)], 2218.5, 1870.0),
    ('C5_hongma', 'L5_nordsjo', [(580, 689), (577, 690), (575, 692), (573, 694)], 2258.5, 2090.0),
    ('C6_frost', 'L6_stalsjo', [(584, 858), (581, 858), (576, 857), (570, 857), (564, 857), (558, 858)], 2578.5, 1895.0),
    ('C7_hamer', 'L7_malmtjarn', [(648, 659), (645, 659), (642, 656), (640, 654)], 2878.5, 2445.0),
]

# ---- 5. Gentle shore & pass benches for existing, relocated, and new Republican pins ----
BENCH_SITES = [
    ('Roketstad', (632, 716), 2905.0),
    ('Glaive', (599, 721), 2452.0),
    ('Footfall', (560, 767), 2412.0),
    ('Urverkstad', (591, 801), 2392.0),
    ('Cascade', (568, 841), 2248.0),
    ('Slussport', (576, 693), 2285.0),
    ('Korshamn', (627, 740), 2452.0),
    ('Stahlborn', (618, 859), 2612.0),
    ('Lipp', (691, 619), 3495.0),
    ('Malmborg_stage', (668, 650), 2918.0),
]

# ---- 6. Settlement moves and additions for model/src/60-settlements.js ----
MOVED_SPECS = {
    'skamx0ylbr': {
        'name': 'Glaive',
        'type': 'town',
        'px': 599,
        'py': 721,
        'polity': 'Iron Republic',
        'notes': (
            'Moved 2026-11-18 (the owner: Swiss-Alpine & Great-Lake overhaul of the Iron Republic, '
            'edit_520_republic_alps.py) from 599,734 26 km N to the fortified northern fjord-head of Korsvatn '
            '(2,420 m), guarding Korspaset toward Nordsjö; core/simulation/PROPOSAL-IRON-REPUBLIC.md.'
        ),
    },
    'sgxc1s0gyh': {
        'name': 'Stahlborn',
        'type': 'town',
        'px': 618,
        'py': 859,
        'polity': 'Iron Republic',
        'notes': (
            'Moved 2026-11-18 (the owner: Swiss-Alpine & Great-Lake overhaul of the Iron Republic, '
            'edit_520_republic_alps.py) from 627,868 (3,640 m ridge) 25 km WNW to the eastern shore bench of '
            'Stålsjö (2,580 m), on the southern copper-zinc-skarn and marble lode below Stålpaset; '
            'core/simulation/PROPOSAL-IRON-REPUBLIC.md.'
        ),
    },
}

ADDED_SPECS = [
    {
        'id': 'surverkstad1',
        'name': 'Urverkstad',
        'type': 'city',
        'px': 591,
        'py': 801,
        'notes': (
            'Clean-water precision clockwork, salvage-optics and federal clearing-bourse city (~8,500) at the '
            'southern spillway of Glasklar-Sjö (2,360 m), where the Blak Bruk (369 m3/s) drops 140 m to Kaskejt-Sjö. '
            'Added 2026-11-18 (the owner: Swiss-Alpine & Great-Lake overhaul of the Iron Republic, '
            'edit_520_republic_alps.py; core/simulation/PROPOSAL-IRON-REPUBLIC.md).'
        ),
        'createdAt': '2026-11-18T00:00:00.000Z',
        'polity': 'Iron Republic',
    },
    {
        'id': 'sslussport01',
        'name': 'Slussport',
        'type': 'town',
        'px': 576,
        'py': 693,
        'notes': (
            'Western customs lock, quarantine gate and refractory brickworks town (~3,200) at Nordport-Paset and the '
            'Hōng-Mā spillway (330 m3/s) of Nordsjö (2,260 m), on the Corpus-Roketstad highway. Added 2026-11-18 '
            '(the owner: Swiss-Alpine & Great-Lake overhaul of the Iron Republic, edit_520_republic_alps.py; '
            'core/simulation/PROPOSAL-IRON-REPUBLIC.md).'
        ),
        'createdAt': '2026-11-18T00:00:00.000Z',
        'polity': 'Iron Republic',
    },
    {
        'id': 'skorshamn001',
        'name': 'Korshamn',
        'type': 'town',
        'px': 627,
        'py': 740,
        'notes': (
            'Federal lake arsenal and Nauen barge hub (~2,600) on the eastern arm of four-branched Korsvatn '
            '(2,420 m) at the foot of the 440 m Silvr Bruk cataract below Roketstad. Added 2026-11-18 (the owner: '
            'Swiss-Alpine & Great-Lake overhaul of the Iron Republic, edit_520_republic_alps.py; '
            'core/simulation/PROPOSAL-IRON-REPUBLIC.md).'
        ),
        'createdAt': '2026-11-18T00:00:00.000Z',
        'polity': 'Iron Republic',
    },
]


def polyline_dist_and_s(xx_g, yy_g, pts):
    """Minimum distance (px) and normalized arc-length s in [0, 1] along polyline pts."""
    pts = [tuple(map(float, p)) for p in pts]
    seg_lens = [math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts[:-1], pts[1:])]
    tot_len = max(sum(seg_lens), 1e-6)
    cum = [0.0]
    for sl in seg_lens:
        cum.append(cum[-1] + sl)

    best_d2 = np.full(xx_g.shape, np.inf)
    best_s = np.zeros(xx_g.shape, dtype=float)
    for idx, (a, b) in enumerate(zip(pts[:-1], pts[1:])):
        vx, vy = b[0] - a[0], b[1] - a[1]
        l2 = vx * vx + vy * vy + 1e-12
        t = np.clip(((xx_g - a[0]) * vx + (yy_g - a[1]) * vy) / l2, 0.0, 1.0)
        px_c = a[0] + t * vx
        py_c = a[1] + t * vy
        d2 = (xx_g - px_c) ** 2 + (yy_g - py_c) ** 2
        upd = d2 < best_d2
        best_d2 = np.where(upd, d2, best_d2)
        s_here = (cum[idx] + t * seg_lens[idx]) / tot_len
        best_s = np.where(upd, s_here, best_s)
    return np.sqrt(best_d2), best_s


def priority_fill_box(E_arr, box):
    """Depression-filled heights over box (y0, y1, x0, x1), with the box perimeter as outlet."""
    y0, y1, x0, x1 = box
    S_b = E_arr[y0:y1, x0:x1]
    H_b, W_b = S_b.shape
    F_b = np.full(S_b.shape, np.inf)
    seen = np.zeros(S_b.shape, bool)
    q = []
    for j in range(H_b):
        for i in range(W_b):
            if j in (0, H_b - 1) or i in (0, W_b - 1):
                val = float(S_b[j, i])
                F_b[j, i] = val
                seen[j, i] = True
                heapq.heappush(q, (val, j, i))
    while q:
        h, j, i = heapq.heappop(q)
        for a in (-1, 0, 1):
            for b in (-1, 0, 1):
                jj, ii = j + a, i + b
                if 0 <= jj < H_b and 0 <= ii < W_b and not seen[jj, ii]:
                    seen[jj, ii] = True
                    nv = max(float(S_b[jj, ii]), h)
                    F_b[jj, ii] = nv
                    heapq.heappush(q, (nv, jj, ii))
    return F_b


def pits_in_box(S_arr, box):
    y0, y1, x0, x1 = box
    F_b = priority_fill_box(S_arr, box)
    pit = np.zeros(S_arr.shape, dtype=bool)
    fill_full = S_arr.copy()
    pit[y0:y1, x0:x1] = (F_b - S_arr[y0:y1, x0:x1]) > 1.0
    fill_full[y0:y1, x0:x1] = F_b
    return pit, fill_full


def bil(E_arr, x, y):
    x0 = max(0, min(E_arr.shape[1] - 2, int(math.floor(x))))
    y0 = max(0, min(E_arr.shape[0] - 2, int(math.floor(y))))
    fx, fy = x - x0, y - y0
    return float(
        (E_arr[y0, x0] * (1.0 - fx) + E_arr[y0, x0 + 1] * fx) * (1.0 - fy)
        + (E_arr[y0 + 1, x0] * (1.0 - fx) + E_arr[y0 + 1, x0 + 1] * fx) * fy
    )


def raster_chain(pts):
    """8-connected integer raster chain along polyline pts."""
    chain = []
    for a, b in zip(pts[:-1], pts[1:]):
        steps = max(int(round(abs(b[0] - a[0]))), int(round(abs(b[1] - a[1]))), 1)
        for k in range(steps + 1):
            ix = int(round(a[0] + (b[0] - a[0]) * k / steps))
            iy = int(round(a[1] + (b[1] - a[1]) * k / steps))
            if not chain or chain[-1] != (ix, iy):
                chain.append((ix, iy))
    return chain


def poly_len_km(pts):
    return round(sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts[:-1], pts[1:])) * 2.0, 1)


def hexrgb(h):
    return np.array([int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)], dtype=float)


def relight_masked(D, Eo, En, pure_ir, keys=('st', 't', 'rt', 'ct')):
    """Same directional Lambertian relight as smodel.paint.relight, restricted strictly to pure_ir before JPEG encode."""
    FH, FW = D['fullH'], D['fullW']
    zoom = (FH / Eo.shape[0], FW / Eo.shape[1])
    EoF, EnF = nd.zoom(Eo, zoom, order=1), nd.zoom(En, zoom, order=1)
    region = nd.binary_dilation(np.abs(EnF - EoF) > 1.0, iterations=3) & pure_ir

    def lam(E_in, zf, az, alt=45.0):
        gy, gx = np.gradient(E_in / 1000.0 * zf, 2.0)
        a, l = np.radians(az), np.radians(alt)
        lx, ly, lz = np.cos(l) * np.sin(a), -np.cos(l) * np.cos(a), np.sin(l)
        return (-gx * lx - gy * ly + lz) / np.sqrt(gx * gx + gy * gy + 1.0)

    out, fit_rep = {}, {}
    mfit = nd.binary_dilation(region, iterations=20)
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
                g = float((x * y).sum() / (x * x).sum())
                r = float(np.corrcoef(x, y)[0, 1])
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


def monotonic_beds(En, pts, head_m=None, floor_m=None, step_min=0.4, cut_m=1.2):
    """Sample river bed elevations along pts so beds are <= ground and strictly decreasing downstream."""
    beds = []
    cur = float('inf') if head_m is None else float(head_m)
    for idx, (x, y) in enumerate(pts):
        g = bil(En, x, y)
        if idx == 0 and head_m is not None:
            b = min(float(head_m), g)
        else:
            b = min(g - cut_m, cur - step_min)
        if floor_m is not None:
            b = max(b, float(floor_m) + 0.2 * max(len(pts) - 1 - idx, 0))
        if idx > 0 and b >= beds[-1]:
            b = beds[-1] - step_min
        beds.append(round(b, 1))
        cur = beds[-1]
    return beds


def update_rivers_and_outlets(D, En, whas2, pure_ir, dist_out_px, lake_masks):
    """Re-bind rivers.json and outlets.json to the 7 stepped Swiss lakes and monotonic cataracts."""
    rmap = {r['id']: r for r in D['rivers']}
    r_rep = {}

    def resample_q(q_old, n_new):
        if not q_old:
            return [20.0] * n_new
        if len(q_old) == 1 or n_new == 1:
            return [round(float(q_old[-1]), 1)] * n_new
        xs0 = np.linspace(0.0, 1.0, len(q_old))
        xs1 = np.linspace(0.0, 1.0, n_new)
        return [round(float(v), 1) for v in np.interp(xs1, xs0, q_old)]

    def carve_dry_pts(pts, beds):
        """Ensure dry height-grid cells under modified river points stand >= bed_m and never trap water."""
        for (x, y), b in zip(pts, beds):
            ix, iy = int(round(x)), int(round(y))
            if 0 <= iy < En.shape[0] and 0 <= ix < En.shape[1]:
                if pure_ir[iy, ix] and not whas2[iy, ix] and dist_out_px[iy, ix] >= 2.5:
                    if En[iy, ix] < b:
                        # keep bed <= En
                        pass

    def apply_river(rid, pts, q_vals, beds, to_obj, from_obj=None, setts=None, note=None):
        rec = rmap[rid]
        was = {
            'n': len(rec['px']),
            'first': rec['px'][0],
            'last': rec['px'][-1],
            'source_m': rec.get('source_m'),
            'mouth_m': rec.get('mouth_m'),
            'q_mouth_m3s': rec.get('q_mouth_m3s'),
            'to': copy.deepcopy(rec.get('to')),
        }
        rec['px'] = [[round(float(x), 2), round(float(y), 2)] for x, y in pts]
        rec['bed_m'] = [round(float(b), 1) for b in beds]
        rec['q_m3s'] = [round(float(q), 1) for q in q_vals]
        rec['q_mouth_m3s'] = rec['q_m3s'][-1]
        rec['length_km'] = poly_len_km(rec['px'])
        rec['source_m'] = rec['bed_m'][0]
        rec['mouth_m'] = rec['bed_m'][-1]
        rec['to'] = to_obj
        if from_obj is not None:
            rec['from'] = from_obj
        if setts is not None:
            rec['settlements'] = list(setts)
        if note is not None:
            rec['note'] = note
        r_rep[rid] = {
            'name': rec.get('name'),
            'was': was,
            'now': {
                'n': len(rec['px']),
                'first': rec['px'][0],
                'last': rec['px'][-1],
                'length_km': rec['length_km'],
                'source_m': rec['source_m'],
                'mouth_m': rec['mouth_m'],
                'q_mouth_m3s': rec['q_mouth_m3s'],
                'to': rec['to'],
                'settlements': rec.get('settlements', []),
            },
        }

    # 1) r051 Silvr Bruk: L1 Roketsjö (2,860 m) -> L2 Korsvatn (2,420 m) past Korshamn (627,740)
    pts_051 = [(632.0, 727.0), (631.5, 729.0), (631.0, 731.0), (630.0, 733.0), (629.0, 735.0), (627.5, 737.0), (626.0, 739.0)]
    beds_051 = monotonic_beds(En, pts_051, head_m=2858.5, floor_m=2421.0, step_min=12.0, cut_m=0.5)
    apply_river(
        'r051', pts_051, resample_q(rmap['r051']['q_m3s'], len(pts_051)), beds_051,
        to_obj={'lake_m': 2420, 'through': True, 'at_px': [623.0, 740.0]},
        from_obj={'lake': 'Roketsjö', 'lake_m': 2860, 'at_px': [632.0, 727.0]},
        setts=['Korshamn'],
    )

    # 2) r_ir_korssund Kors-Strömmen: L2 Korsvatn (2,420 m) -> L3 Glasklar-Sjö (2,360 m), 195 m3/s
    pts_ks = [(591.0, 750.0), (589.5, 751.0), (588.0, 752.0), (586.5, 753.5), (585.0, 755.0)]
    beds_ks = monotonic_beds(En, pts_ks, head_m=2418.5, floor_m=2361.0, step_min=5.0, cut_m=0.5)
    ks_rec = {
        'id': 'r_ir_korssund',
        'name': 'Kors-Strömmen',
        'kind': 'river',
        'perennial': True,
        'order': 2,
        'length_km': poly_len_km(pts_ks),
        'catchment_km2': 14200,
        'q_mouth_m3s': 195.0,
        'source_m': beds_ks[0],
        'mouth_m': beds_ks[-1],
        'region': 'The Iron Republic',
        'from': {'lake': 'Korsvatn', 'lake_m': 2420, 'at_px': [591.0, 750.0]},
        'to': {'lake_m': 2360, 'through': True, 'at_px': [584.0, 756.0]},
        'settlements': [],
        'px': [[round(x, 2), round(y, 2)] for x, y in pts_ks],
        'bed_m': beds_ks,
        'q_m3s': [round(188.0 + 7.0 * i / (len(pts_ks) - 1), 1) for i in range(len(pts_ks))],
        'width_m': 58,
        'depth_m': 3.2,
        'tongue': 'hajlandsk',
        'gloss': 'Cross-Current: natural cataract race and 3-chamber Kors-Slussen barge lock linking Korsvatn to Glasklar-Sjö',
        'note': 'Added by edit_520_republic_alps.py (2026-11-18; core/simulation/PROPOSAL-IRON-REPUBLIC.md).',
    }
    D['rivers'].append(ks_rec)
    rmap['r_ir_korssund'] = ks_rec
    r_rep['r_ir_korssund'] = {
        'name': 'Kors-Strömmen',
        'was': None,
        'now': {
            'n': len(pts_ks), 'first': ks_rec['px'][0], 'last': ks_rec['px'][-1],
            'length_km': ks_rec['length_km'], 'source_m': ks_rec['source_m'], 'mouth_m': ks_rec['mouth_m'],
            'q_mouth_m3s': ks_rec['q_mouth_m3s'], 'to': ks_rec['to'],
        },
    }

    # 3) r010 Blak Bruk: L3 Glasklar-Sjö (2,360 m) -> L4 Kaskejt-Sjö (2,220 m) past Urverkstad (591,801)
    pts_010 = [(590.0, 803.0), (589.5, 805.0), (589.0, 807.0), (588.0, 809.0), (587.0, 811.0)]
    beds_010 = monotonic_beds(En, pts_010, head_m=2358.5, floor_m=2221.0, step_min=10.0, cut_m=0.5)
    apply_river(
        'r010', pts_010, resample_q(rmap['r010']['q_m3s'], len(pts_010)), beds_010,
        to_obj={'lake_m': 2220, 'through': True, 'at_px': [586.0, 813.0]},
        from_obj={'lake': 'Glasklar-Sjö', 'lake_m': 2360, 'at_px': [590.0, 803.0]},
        setts=['Urverkstad'],
    )

    # 4) r004 Kaskejt Rivr: L4 Kaskejt-Sjö (2,220 m, sill 569,839) -> cataract past Cascade (568,841) -> existing lower r004[15:]
    r004 = rmap['r004']
    head_004 = [(569.0, 839.0), (567.0, 840.8), (565.0, 843.0), (563.2, 845.8), (562.2, 848.5), (561.2, 850.8)]
    tail_004 = [tuple(p) for p in r004['px'][15:]]
    pts_004 = head_004 + tail_004
    hb_004 = monotonic_beds(En, head_004 + [tail_004[0]], head_m=2218.5, floor_m=r004['bed_m'][15], step_min=8.0, cut_m=0.5)
    # Keep existing downstream bed_m from index 15 onward, ensuring strict non-increase across junction
    beds_004 = hb_004[:-1]
    cur_b = beds_004[-1]
    for b_old in r004['bed_m'][15:]:
        nb = min(float(b_old), cur_b - 0.1)
        beds_004.append(round(nb, 1))
        cur_b = beds_004[-1]
    q_004 = [round(395.0 + (r004['q_m3s'][15] - 395.0) * i / len(head_004), 1) for i in range(len(head_004))] + list(r004['q_m3s'][15:])
    apply_river(
        'r004', pts_004, q_004, beds_004,
        to_obj=r004['to'],
        from_obj={'lake': 'Kaskejt-Sjö', 'lake_m': 2220, 'at_px': [569.0, 839.0]},
        setts=['Cascade'],
    )

    # 5) r014 Hōng-Mā: L5 Nordsjö (2,260 m, sill 577,690) -> past Slussport (576,693) -> existing r014[2:]
    r014 = rmap['r014']
    head_014 = [(577.0, 690.0), (575.6, 692.0)]
    tail_014 = [tuple(p) for p in r014['px'][2:]]
    pts_014 = head_014 + tail_014
    hb_014 = monotonic_beds(En, head_014 + [tail_014[0]], head_m=2258.5, floor_m=r014['bed_m'][2], step_min=10.0, cut_m=0.5)
    beds_014 = hb_014[:-1] + [round(float(b), 1) for b in r014['bed_m'][2:]]
    q_014 = list(r014['q_m3s'])
    apply_river(
        'r014', pts_014, q_014, beds_014,
        to_obj=r014['to'],
        from_obj={'lake': 'Nordsjö', 'lake_m': 2260, 'at_px': [577.0, 690.0]},
        setts=sorted(set(r014.get('settlements') or []) | {'Slussport'}),
    )

    # 6) r281 Frost Rivr: L6 Stålsjö (2,580 m, sill 581,858) -> C6_frost gorge -> existing r281[14:] -> r004
    r281 = rmap['r281']
    head_281 = [(581.0, 858.0), (578.5, 857.5), (576.0, 857.0), (573.0, 857.0), (570.0, 857.0), (567.0, 857.0), (564.0, 857.0), (561.2, 857.2)]
    tail_281 = [tuple(p) for p in r281['px'][14:]]
    pts_281 = head_281 + tail_281
    hb_281 = monotonic_beds(En, head_281 + [tail_281[0]], head_m=2578.5, floor_m=r281['bed_m'][14], step_min=15.0, cut_m=0.5)
    beds_281 = hb_281[:-1] + [round(float(b), 1) for b in r281['bed_m'][14:]]
    apply_river(
        'r281', pts_281, resample_q(r281['q_m3s'], len(pts_281)), beds_281,
        to_obj=r281['to'],
        from_obj={'lake': 'Stålsjö', 'lake_m': 2580, 'at_px': [581.0, 858.0]},
        setts=[],
    )

    # 7) r027 Nīla-āṟu: L7 Malmtjärn (2,880 m, sill 645,659) -> C7_hamer -> existing r027[0:]
    r027 = rmap['r027']
    head_027 = [(645.0, 659.0), (643.5, 657.5), (642.0, 656.0)]
    tail_027 = [tuple(p) for p in r027['px']]
    pts_027 = head_027 + tail_027
    hb_027 = monotonic_beds(En, head_027 + [tail_027[0]], head_m=2878.5, floor_m=r027['bed_m'][0], step_min=40.0, cut_m=0.5)
    beds_027 = hb_027[:-1] + [round(float(b), 1) for b in r027['bed_m']]
    q_027 = [r027['q_m3s'][0]] * len(head_027) + list(r027['q_m3s'])
    apply_river(
        'r027', pts_027, q_027, beds_027,
        to_obj=r027['to'],
        from_obj={'lake': 'Malmtjärn', 'lake_m': 2880, 'at_px': [645.0, 659.0]},
    )

    # 8) Tributaries entering L1–L5 and outer rims
    # r201 Snou Bruk -> L1 Roketsjö past Roketstad (632,716)
    r201 = rmap['r201']
    pts_201 = [tuple(p) for p in r201['px'][2:]] + [(631.6, 718.2)]
    beds_201 = monotonic_beds(En, pts_201, floor_m=2861.0, step_min=5.0, cut_m=1.5)
    apply_river(
        'r201', pts_201, resample_q(r201['q_m3s'][2:], len(pts_201)), beds_201,
        to_obj={'lake_m': 2860, 'through': True, 'at_px': [630.5, 720.5]},
        setts=['Roketstad'],
    )

    # r723 Birč Guli -> r238 Pajn Bruk -> L1 Roketsjö
    r723 = rmap['r723']
    pts_723 = [tuple(p) for p in r723['px'][1:4]]
    beds_723 = monotonic_beds(En, pts_723, floor_m=4340.0, step_min=8.0, cut_m=1.5)
    apply_river(
        'r723', pts_723, r723['q_m3s'][1:4], beds_723,
        to_obj={'river': 'r238', 'name': 'Pajn Bruk', 'at_px': [622.5, 704.5]},
    )
    r238 = rmap['r238']
    pts_238 = [(622.5, 704.5), (622.5, 706.5), (622.5, 708.5)]
    beds_238 = monotonic_beds(En, pts_238, floor_m=2861.0, step_min=15.0, cut_m=1.5)
    apply_river(
        'r238', pts_238, resample_q(r238['q_m3s'], len(pts_238)), beds_238,
        to_obj={'lake_m': 2860, 'through': True, 'at_px': [622.5, 710.5]},
    )

    # r123 Birč Bruk -> L2 Korsvatn
    r123 = rmap['r123']
    pts_123 = [tuple(p) for p in r123['px'][2:9]]
    beds_123 = monotonic_beds(En, pts_123, floor_m=2421.0, step_min=4.0, cut_m=1.5)
    apply_river(
        'r123', pts_123, r123['q_m3s'][2:9], beds_123,
        to_obj={'lake_m': 2420, 'through': True, 'at_px': [602.8, 735.1]},
        setts=[],
    )

    # r092 Dip Rivr -> L3 Glasklar-Sjö past Footfall (560,767)
    r092 = rmap['r092']
    pts_092 = [tuple(p) for p in r092['px'][:11]]
    beds_092 = monotonic_beds(En, pts_092, floor_m=2361.0, step_min=2.0, cut_m=1.5)
    apply_river(
        'r092', pts_092, r092['q_m3s'][:11], beds_092,
        to_obj={'lake_m': 2360, 'through': True, 'at_px': [566.5, 770.4]},
        setts=['Footfall'],
    )

    # r382 Granit Bruk -> L3 Glasklar-Sjö
    r382 = rmap['r382']
    pts_382 = [tuple(p) for p in r382['px'][:5]]
    beds_382 = monotonic_beds(En, pts_382, floor_m=2361.0, step_min=4.0, cut_m=1.5)
    apply_river(
        'r382', pts_382, r382['q_m3s'][:5], beds_382,
        to_obj={'lake_m': 2360, 'through': True, 'at_px': [564.3, 776.1]},
    )

    # r282 Frost Bruk -> L4 Kaskejt-Sjö
    r282 = rmap['r282']
    pts_282 = [tuple(p) for p in r282['px'][6:]] + [(568.4, 836.7)]
    beds_282 = monotonic_beds(En, pts_282, floor_m=2221.0, step_min=4.0, cut_m=1.5)
    apply_river(
        'r282', pts_282, resample_q(r282['q_m3s'][6:], len(pts_282)), beds_282,
        to_obj={'lake_m': 2220, 'through': True, 'at_px': [570.4, 836.7]},
    )

    # r408 Ford Bruk (trimmed off L5 Nordsjö) -> r312 Red Rivr
    r408 = rmap['r408']
    pts_408 = [tuple(p) for p in r408['px'][2:]]
    hb_408 = monotonic_beds(En, pts_408[:3], floor_m=r408['bed_m'][4], step_min=4.0, cut_m=1.5)
    beds_408 = hb_408[:2] + [round(float(b), 1) for b in r408['bed_m'][4:]]
    apply_river('r408', pts_408, r408['q_m3s'][2:], beds_408, to_obj=r408['to'])

    # r312 Red Rivr: update head bed_m[0] where L5 Nordsjö outer rim rose slightly
    r312 = rmap['r312']
    pts_312 = [tuple(p) for p in r312['px']]
    beds_312 = [round(min(bil(En, pts_312[0][0], pts_312[0][1]) - 1.5, 2298.0), 1)] + [round(float(b), 1) for b in r312['bed_m'][1:]]
    apply_river('r312', pts_312, r312['q_m3s'], beds_312, to_obj=r312['to'])

    # Verify every modified river has zero uphill segments and is dry on its course
    for rid in r_rep:
        rv = rmap[rid]
        b = rv['bed_m']
        assert len(rv['px']) == len(b) == len(rv['q_m3s']) >= 2, f'bad river array lengths on {rid}'
        assert all(b[i + 1] <= b[i] for i in range(len(b) - 1)) and b[-1] < b[0], f'uphill bed on {rid}: {b}'
        for idx_p, (px, py) in enumerate(rv['px']):
            ix, iy = int(round(px)), int(round(py))
            for lk_id, lmask in lake_masks.items():
                assert not lmask[iy, ix], f'river {rid} vertex {idx_p} ({px},{py}) lies inside lake {lk_id}'

    # Replace obsolete single 'Iron Republic lake outlet' in D['outlets'] with the 7 stepped Alpine outlets
    kept_outlets = [o for o in D.get('outlets', []) if o.get('name') != 'Iron Republic lake outlet']
    outlet_specs = [
        ('Roketsjö outlet (Silvr Bruk)', 'Roketsjö', 'Korsvatn', 'r051', 2860),
        ('Korsvatn outlet (Kors-Strömmen)', 'Korsvatn', 'Glasklar-Sjö', 'r_ir_korssund', 2420),
        ('Glasklar-Sjö outlet (Blak Bruk)', 'Glasklar-Sjö', 'Kaskejt-Sjö', 'r010', 2360),
        ('Kaskejt-Sjö outlet (Kaskejt Rivr)', 'Kaskejt-Sjö', "western lake (Ancient's Valley)", 'r004', 2220),
        ('Nordsjö outlet (Hōng-Mā)', 'Nordsjö', 'NW lowlands lake', 'r014', 2260),
        ('Stålsjö outlet (Frost Rivr)', 'Stålsjö', 'Kaskejt Rivr', 'r281', 2580),
        ('Malmtjärn outlet (Nīla-āṟu)', 'Malmtjärn', "Jimjam's lake", 'r027', 2880),
    ]
    new_outlets = []
    for oname, ofrom, oto, orid, olev in outlet_specs:
        rv = rmap[orid]
        new_outlets.append({
            'name': oname,
            'from': ofrom,
            'to': oto,
            'px': [list(p) for p in rv['px']],
            'bed_m': [int(round(v)) for v in rv['bed_m']],
            'lake_level_m': int(olev),
        })
    D['outlets'] = kept_outlets + new_outlets
    return r_rep, [rmap[rid]['px'] for rid in ('r051', 'r_ir_korssund', 'r010', 'r004', 'r014', 'r281', 'r027')]


def build_settlements_js(En, whas2, pure_ir, codes, cls2, rain2, tm2):
    """Update model/src/60-settlements.js in memory (`defSetts`, `SETT_ADDED`, `SETT_MOVED`) and validate all IR pins."""
    path = os.path.join(SRC, '60-settlements.js')
    with open(path, encoding='utf-8', newline='') as fh:
        src = fh.read()

    m_def = re.search(r'const defSetts = (\[.*?\]);\n', src)
    assert m_def, 'const defSetts not found in 60-settlements.js'
    def_setts = json.loads(m_def.group(1))
    by_id = {s['id']: s for s in def_setts}
    assert not any(a['id'] in by_id for a in ADDED_SPECS), 'edit_520 settlement IDs already exist in defSetts'

    moved_records = []
    for sid, spec in MOVED_SPECS.items():
        assert sid in by_id, f'missing {sid} in defSetts'
        rec = by_id[sid]
        rec['type'] = spec['type']
        rec['px'] = spec['px']
        rec['py'] = spec['py']
        rec['notes'] = spec['notes']
        rec['polity'] = spec['polity']
        moved_records.append(copy.deepcopy(rec))

    added_records = [copy.deepcopy(a) for a in ADDED_SPECS]
    def_setts.extend(added_records)

    new_def_line = 'const defSetts = ' + json.dumps(def_setts, ensure_ascii=False) + ';\n'
    out = src[:m_def.start()] + new_def_line + src[m_def.end():]

    # Also update sgxc1s0gyh inside SETT_ADDED['5.1e11'] (matching how shvo49k0y2 Thalaba is kept in sync there)
    m_e11 = re.search(r"('5\.1e11':)(\[.*?\])(,\n)", out)
    assert m_e11, "SETT_ADDED['5.1e11'] not found in 60-settlements.js"
    arr_e11 = json.loads(m_e11.group(2))
    for item in arr_e11:
        if item.get('id') in MOVED_SPECS:
            sp = MOVED_SPECS[item['id']]
            item['type'] = sp['type']
            item['px'] = sp['px']
            item['py'] = sp['py']
            item['notes'] = sp['notes']
            item['polity'] = sp['polity']
    out = out[:m_e11.start()] + m_e11.group(1) + json.dumps(arr_e11, ensure_ascii=False) + m_e11.group(3) + out[m_e11.end():]

    # Insert SETT_ADDED['5.1e20'] before closing `  };\n  Object.keys(SETT_ADDED)`
    m_added_end = re.search(r'(\n  \};\n  Object\.keys\(SETT_ADDED\))', out)
    assert m_added_end, 'end of SETT_ADDED not found in 60-settlements.js'
    added_entry = f",\n    '{SETT_VER}':" + json.dumps(added_records, ensure_ascii=False)
    out = out[:m_added_end.start()] + added_entry + out[m_added_end.start():]

    # Insert SETT_MOVED['5.1e20'] before closing `  };\n  Object.keys(SETT_MOVED)`
    m_moved_end = re.search(r'(\n  \};\n  Object\.keys\(SETT_MOVED\))', out)
    assert m_moved_end, 'end of SETT_MOVED not found in 60-settlements.js'
    moved_entry = f",\n    '{SETT_VER}':" + json.dumps(moved_records, ensure_ascii=False)
    out = out[:m_moved_end.start()] + moved_entry + out[m_moved_end.start():]

    # Verify all 9 Iron Republic settlements stand on dry ground inside pure_ir
    ir_ids = (
        's28hf1s9ab',   # Roketstad
        'sgjwyb4xj5',   # Cascade
        'sx0yra3bdm',   # Footfall
        's8fkrfok8y',   # Lipp
        'skamx0ylbr',   # Glaive (moved)
        'sgxc1s0gyh',   # Stahlborn (moved)
        'surverkstad1', # Urverkstad (added)
        'sslussport01', # Slussport (added)
        'skorshamn001', # Korshamn (added)
    )
    gy, gx = np.gradient(En)
    slope = np.hypot(gx, gy) / 2000.0
    dist_wet_km = nd.distance_transform_edt(~whas2) * 2.0

    final_map = {s['id']: s for s in def_setts}
    pin_rep = {}
    for sid in ir_ids:
        st = final_map[sid]
        px, py = int(round(st['px'])), int(round(st['py']))
        assert pure_ir[py, px], f"pin {st['name']} ({px},{py}) is outside pure_ir"
        assert not whas2[py, px], f"pin {st['name']} ({px},{py}) stands on water"
        elev_m = float(En[py, px])
        pin_rep[st['name']] = {
            'id': sid,
            'type': st['type'],
            'px': [px, py],
            'elev_m': round(elev_m, 1),
            'atm': round(1.6 * math.exp(-elev_m / 8000.0), 2),
            'slope': round(float(slope[py, px]), 3),
            'climate': codes[int(cls2[py, px])],
            'rain_mm': round(float(rain2[py, px])),
            'tm_C': round(float(tm2[py, px]), 1),
            'dist_water_km': round(float(dist_wet_km[py, px]), 1),
            'dry_verified': True,
        }

    return pin_rep, (path, out)


def main():
    D = P.load()
    if any(b.get('id') == 'L2_korsvatn' or b.get('name') == 'Korsvatn' for b in D.get('basins', [])) or any(
        r.get('id') == 'r_ir_korssund' for r in D.get('rivers', [])
    ):
        sys.exit('edit_520_republic_alps has run already (Korsvatn / r_ir_korssund are in DATA)')

    rep = {
        'edit': '5.1 edit 20 (Iron Republic Swiss-Alpine & Great-Lake reshaping)',
        'version_tag': SETT_VER,
        'date': '2026-11-18',
        'region': IR_ID,
        'dry_run': DRY,
    }

    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    assert Eo.shape == (D['fullH'], D['fullW']), '5.1 height grid must match full grid'
    OH, OW = Eo.shape
    yy, xx = np.mgrid[0:OH, 0:OW].astype(float)
    codes = [c['code'] for c in D['climate']['classes']]

    L_KEYS = ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc')
    jpeg0 = {k: D[k] for k in ('st', 't', 'rt', 'ct')}
    raw0 = {k: P.raster(D, k, 'L' if k in L_KEYS else 'RGB') for k in ('h', 'wl', 'wd', 'st', 't', 'rt', 'ct') + L_KEYS}

    # ---- 1. Strict political safety envelope: pure_ir = Iron Republic minus all other political polygons ----
    regs = P.regions()
    ir_reg = next(r for r in regs if r['id'] == IR_ID)
    ir_mask = G.poly(ir_reg['points'], 1.0, 1.0, (OH, OW)) > 0.5
    other_pol_mask = np.zeros((OH, OW), dtype=bool)
    for r in regs:
        if r['id'] != IR_ID and r.get('kind') == 'political':
            pts = r['points']
            xs_r = [p[0] for p in pts]
            ys_r = [p[1] for p in pts]
            if max(xs_r) < IR_BOX[2] or min(xs_r) > IR_BOX[3] or max(ys_r) < IR_BOX[0] or min(ys_r) > IR_BOX[1]:
                continue
            other_pol_mask |= G.poly(pts, 1.0, 1.0, (OH, OW)) > 0.5

    pure_ir = ir_mask & (~other_pol_mask)
    dist_out_px = nd.distance_transform_edt(pure_ir)
    env_w = G.sstep(2.0, 6.5, dist_out_px)
    rep['envelope'] = {
        'ir_polygon_cells': int(ir_mask.sum()),
        'ir_polygon_km2': int(ir_mask.sum()) * 4,
        'pure_ir_cells': int(pure_ir.sum()),
        'pure_ir_km2': int(pure_ir.sum()) * 4,
        'shared_border_cells_excluded': int((ir_mask & other_pol_mask).sum()),
    }

    # ---- 2. Drain old flat saucer lake and interior ponds inside pure_ir ----
    En = Eo.copy()
    whas2 = whas0.copy()
    wlev2 = wlev0.copy()

    w_lbl, _ = nd.label(whas0, structure=np.ones((3, 3), dtype=int))
    old_interior_lakes = np.zeros((OH, OW), dtype=bool)
    for lbl in np.unique(w_lbl[pure_ir & whas0]):
        if lbl > 0:
            comp = w_lbl == lbl
            if not (comp & ~pure_ir).any():
                old_interior_lakes |= comp

    assert not (old_interior_lakes & ~pure_ir).any(), 'old interior lake component leaked outside pure_ir'
    whas2[old_interior_lakes] = False
    wlev2[old_interior_lakes] = np.nan

    # Deterministic trigonometric crag field (reproducible across machines without PRNG state)
    crag = (
        0.48 * np.sin(xx * 0.43 + yy * 0.29 + 0.7) * np.cos(xx * 0.19 - yy * 0.51 + 1.3)
        + 0.32 * np.sin(xx * 0.81 - yy * 0.67 + 2.4)
        + 0.20 * np.cos(xx * 1.37 + yy * 1.13 - 0.8)
    )
    En = np.where(old_interior_lakes, np.maximum(En, 2860.0 + 140.0 * crag), En)

    # ---- 3. Sculpt the 7 glaciated Swiss-style massifs and 6 defended alpine passes ----
    for mid, mname, mgloss, mpts, crest_m, hw_px, h_amp in MASSIFS:
        d_m, s_m = polyline_dist_and_s(xx, yy, mpts)
        end_taper = G.sstep(0.0, 0.12, s_m) * G.sstep(0.0, 0.12, 1.0 - s_m)
        prof_r = np.clip(1.0 - (d_m / hw_px) ** 1.65, 0.0, 1.0)
        arete = np.exp(-((d_m / (0.36 * hw_px)) ** 2))
        target_h = (crest_m - 350.0 * (1.0 - end_taper)) + h_amp * crag * arete
        lift_w = prof_r * (0.65 + 0.35 * end_taper) * env_w
        En = np.where(lift_w > 0.01, np.maximum(En, En * (1.0 - lift_w) + target_h * lift_w), En)

    for pid, pname, pgloss, spx, ppts, sad_m, phw, _ in PASSES:
        d_p, s_p = polyline_dist_and_s(xx, yy, ppts)
        arch = sad_m - 120.0 * ((2.0 * s_p - 1.0) ** 2)
        carve_w = (1.0 - G.sstep(0.35 * phw, phw, d_p)) * env_w
        En = np.where((carve_w > 0.01) & (En > arch), En * (1.0 - carve_w) + arch * carve_w, En)

    # ---- 4. Stamp the 7 stepped Swiss ribbon & cruciform lakes ----
    lake_masks = {}
    all_new_lakes = np.zeros((OH, OW), dtype=bool)
    for lk in LAKES:
        wl_m = lk['wlev_m']
        mdep = lk['max_depth_m']
        rho_lk = np.full(En.shape, np.inf)
        for arm_pts, arm_hw in lk['arms']:
            d_a, _ = polyline_dist_and_s(xx, yy, arm_pts)
            rho_here = np.where(np.isfinite(d_a), d_a / arm_hw, np.inf)
            rho_lk = np.minimum(rho_lk, rho_here)

        lmask = (rho_lk < 1.0) & (dist_out_px >= 2.5)
        assert lmask.any(), f"Lake {lk['id']} has 0 cells"
        bed_prof = wl_m - 55.0 - (mdep - 55.0) * np.clip(1.0 - np.minimum(rho_lk, 2.0) ** 2, 0.0, 1.0)
        En[lmask] = bed_prof[lmask]
        whas2[lmask] = True
        wlev2[lmask] = wl_m

        bench_zone = (rho_lk >= 1.0) & (rho_lk < 2.6) & (dist_out_px >= 2.5) & (~all_new_lakes) & (~lmask)
        t_b = np.clip((rho_lk - 1.0) / 1.6, 0.0, 1.0)
        bench_target = lk['rim_min_m'] + 320.0 * (t_b ** 1.35)
        blend_b = (1.0 - G.sstep(0.0, 1.0, t_b)) * 0.78
        En = np.where(bench_zone, np.maximum(lk['rim_min_m'], En * (1.0 - blend_b) + bench_target * blend_b), En)

        lake_masks[lk['id']] = lmask
        all_new_lakes |= lmask

    for lk in LAKES:
        lmask = lake_masks[lk['id']]
        whas2[lmask] = True
        wlev2[lmask] = lk['wlev_m']
        En[lmask] = np.minimum(En[lmask], lk['wlev_m'] - 55.0)

    # ---- 5. Carve monotonic spillway cataracts & shore benches ----
    def carve_cataracts():
        cat_cells = np.zeros((OH, OW), dtype=bool)
        cat_chains = {}
        for cid, lid, cpts, sill_m, tail_m in CATARACT_PATHS:
            chain = raster_chain(cpts)
            src_mask = lake_masks[lid]
            dry_chain = []
            started = False
            for ix, iy in chain:
                if src_mask[iy, ix]:
                    started = True
                    continue
                if not started:
                    continue
                if whas2[iy, ix]:
                    break
                if pure_ir[iy, ix] and dist_out_px[iy, ix] >= 2.5:
                    dry_chain.append((ix, iy))
            n_d = max(len(dry_chain) - 1, 1)
            for idx_d, (ix, iy) in enumerate(dry_chain):
                bed_t = sill_m if idx_d == 0 else sill_m + (tail_m - sill_m) * (idx_d / n_d)
                En[iy, ix] = bed_t if idx_d == 0 else min(En[iy, ix], bed_t)
                cat_cells[iy, ix] = True
            cat_chains[lid] = dry_chain
        return cat_cells, cat_chains

    cataract_cells, cataract_chains = carve_cataracts()

    for lk in LAKES:
        lmask = lake_masks[lk['id']]
        shore_ring = nd.binary_dilation(lmask, structure=np.ones((3, 3), dtype=bool)) & (~lmask) & (~whas2) & (~cataract_cells)
        low_shore = shore_ring & (En < lk['wlev_m'] + 12.0) & pure_ir
        En[low_shore] = lk['wlev_m'] + 12.0

    for bname, (bx, by), bh in BENCH_SITES:
        assert not whas2[by, bx], f'Bench site {bname} ({bx},{by}) is on water'
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                yy_, xx_ = by + dy, bx + dx
                if pure_ir[yy_, xx_] and dist_out_px[yy_, xx_] >= 2.5 and not whas2[yy_, xx_] and not cataract_cells[yy_, xx_]:
                    w_b = 0.88 if (dx == 0 and dy == 0) else 0.55
                    En[yy_, xx_] = En[yy_, xx_] * (1.0 - w_b) + (bh + 6.0 * (abs(dx) + abs(dy))) * w_b
                    for lk in LAKES:
                        if nd.binary_dilation(lake_masks[lk['id']], structure=np.ones((3, 3), dtype=bool))[yy_, xx_]:
                            En[yy_, xx_] = max(En[yy_, xx_], lk['wlev_m'] + 15.0)

    # ---- 6. Fill any new dry-land endorheic depressions inside pure_ir, then re-verify cataract spills ----
    S0 = np.where(whas0, np.fmax(Eo, np.nan_to_num(wlev0, nan=-1e9)), Eo)
    pit0, _ = pits_in_box(S0, IR_BOX)
    old_land_pit = pit0 & (~whas0)
    filled = np.zeros((OH, OW), dtype=bool)
    En_prefill = En.copy()
    for _ in range(8):
        S2 = np.where(whas2, np.fmax(En, np.nan_to_num(wlev2, nan=-1e9)), En)
        pit1, F1 = pits_in_box(S2, IR_BOX)
        new_pits = pit1 & (~old_land_pit) & (~whas2) & pure_ir
        if not new_pits.any():
            break
        En[new_pits] = F1[new_pits] + 0.05
        filled |= new_pits

    # Re-ensure cataract dry chains step smoothly downhill after pit-fill, and re-check pits
    cataract_cells, cataract_chains = carve_cataracts()
    for lk in LAKES:
        lmask = lake_masks[lk['id']]
        shore_ring = nd.binary_dilation(lmask, structure=np.ones((3, 3), dtype=bool)) & (~lmask) & (~whas2) & (~cataract_cells)
        low_shore = shore_ring & (En < lk['wlev_m'] + 12.0) & pure_ir
        En[low_shore] = lk['wlev_m'] + 12.0

    for _ in range(8):
        S2 = np.where(whas2, np.fmax(En, np.nan_to_num(wlev2, nan=-1e9)), En)
        pit1, F1 = pits_in_box(S2, IR_BOX)
        new_pits = pit1 & (~old_land_pit) & (~whas2) & pure_ir
        if not new_pits.any():
            break
        En[new_pits] = F1[new_pits] + 0.05
        filled |= new_pits

    S2 = np.where(whas2, np.fmax(En, np.nan_to_num(wlev2, nan=-1e9)), En)
    pit_final, _ = pits_in_box(S2, IR_BOX)
    wet_surface_pits = int((pit_final & all_new_lakes).sum())
    new_dry_pits_left = int((pit_final & (~old_land_pit) & (~whas2) & pure_ir).sum())
    assert wet_surface_pits == 0, f'wet lake surface cells trapped in a pit: {wet_surface_pits}'
    assert new_dry_pits_left == 0, f'unfilled new dry-land endorheic pits remain: {new_dry_pits_left}'

    rep['hydrology_pits'] = {
        'dry_pits_before_cells': int((pit0 & pure_ir & ~whas0).sum()),
        'dry_pits_after_cells': int((pit_final & pure_ir & ~whas2).sum()),
        'new_dry_pits_remaining': new_dry_pits_left,
        'wet_lake_surface_pits': wet_surface_pits,
        'pit_filled_cells': int(filled.sum()),
        'pit_filled_max_m': round(float((En - En_prefill)[filled].max()), 1) if filled.any() else 0.0,
    }

    water2 = water0.copy()
    water2[old_interior_lakes & ~all_new_lakes] = False
    water2[all_new_lakes] = True

    assert float(np.abs(En[~pure_ir] - Eo[~pure_ir]).max()) == 0.0, 'En changed outside pure_ir'
    assert not (whas2[~pure_ir] != whas0[~pure_ir]).any(), 'whas2 changed outside pure_ir'
    assert not (water2[~pure_ir] != water0[~pure_ir]).any(), 'water2 changed outside pure_ir'

    # ---- 7. Spillway verification for all 7 lakes (open vs blocked sill) ----
    y0, y1, x0, x1 = IR_BOX
    F_open = priority_fill_box(En, IR_BOX)
    lake_spills = {}
    for lk in LAKES:
        lid = lk['id']
        lm = lake_masks[lid]
        ly, lx = np.nonzero(lm)
        spill_open = float(np.median(F_open[ly - y0, lx - x0]))
        Eb = En.copy()
        sx, sy = lk['sill_px']
        for dy in (-2, -1, 0, 1, 2):
            for dx in (-2, -1, 0, 1, 2):
                if not lm[sy + dy, sx + dx]:
                    Eb[sy + dy, sx + dx] += 2000.0
        F_blk = priority_fill_box(Eb, IR_BOX)
        spill_blk = float(np.median(F_blk[ly - y0, lx - x0]))
        assert spill_open <= lk['wlev_m'], f"{lid} fails open spill: {spill_open} > {lk['wlev_m']}"
        assert spill_blk >= lk['wlev_m'] + 35.0, f"{lid} leaks outside sill: blocked spill {spill_blk} vs {lk['wlev_m']}"
        lake_spills[lid] = (spill_open, spill_blk)

    # ---- 8. Climate & temperature recomputation strictly inside pure_ir ----
    lap = C.lapse(D, Eo, En, whas0, wlev0, whas2=whas2, wlev2=wlev2)
    T = {k: P.raster({'x': lap[k]}, 'x', 'L').astype(float) - 90.0 for k in C.TEMPS}

    to_land = old_interior_lakes & (~whas2)
    to_water = all_new_lakes & (~whas0)
    moved = (np.abs(En - Eo) > 0.5) | (whas2 != whas0)
    pool_t = pure_ir & (~whas0) & (~whas2) & (~nd.binary_dilation(moved, iterations=2)) & (T['tm'] > -89.0)
    py_t, px_t = np.nonzero(pool_t)
    ty_t, tx_t = np.nonzero(to_land)
    ft_t = lambda X, Y, H: np.stack([X / 40.0, Y / 40.0, H / 350.0], axis=1)
    dk_t, ik_t = cKDTree(ft_t(px_t, py_t, Eo[pool_t])).query(ft_t(tx_t, ty_t, En[to_land]), k=12)
    wk_t = 1.0 / (dk_t + 0.25)

    kept_water = old_interior_lakes & all_new_lakes
    ref_water_elev = 2400.0
    for k in C.TEMPS:
        vals = T[k][pool_t]
        T[k][to_land] = np.round((vals[ik_t] * wk_t).sum(1) / wk_t.sum(1))
        base_w_temp = float(np.median(raw0[k][kept_water].astype(float) - 90.0))
        for lk in LAKES:
            lm_new = lake_masks[lk['id']] & to_water
            if lm_new.any():
                T[k][lm_new] = np.round(base_w_temp - C.LAPSE_C_PER_KM * (lk['wlev_m'] - ref_water_elev) / 1000.0)
        # Strict byte-identity outside pure_ir
        T_u8 = np.clip(T[k] + 90.0, 0, 255).astype(np.uint8)
        T_u8[~pure_ir] = raw0[k][~pure_ir]
        D[k] = P.b64(Image.fromarray(T_u8, 'L'), optimize=True)

    rain2, cls2, zon2, q_reclim, crep = C.reclimate(D, Eo, En, whas2, all_new_lakes)
    rain0 = raw0['p'].astype(float) / 255.0 * 4000.0
    rain2[to_water] = float(np.median(rain0[old_interior_lakes]))
    cls2[all_new_lakes] = codes.index('WH')
    lake_zone = int(np.bincount(raw0['z'][old_interior_lakes]).argmax())
    zon2[all_new_lakes] = lake_zone

    # Enforce strict byte-identity outside pure_ir on p, c, z
    p_u8 = np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8)
    p_u8[~pure_ir] = raw0['p'][~pure_ir]
    cls2 = cls2.astype(np.uint8)
    cls2[~pure_ir] = raw0['c'][~pure_ir]
    zon2 = zon2.astype(np.uint8)
    zon2[~pure_ir] = raw0['z'][~pure_ir]

    rep['reclimate'] = crep

    # ---- 9. Update rivers and outlets ----
    rivers_rep, paint_river_paths = update_rivers_and_outlets(D, En, whas2, pure_ir, dist_out_px, lake_masks)
    rep['rivers_updated'] = rivers_rep

    # ---- 10. Encode rasters and repaint / relight / retint JPEGs strictly inside pure_ir ----
    D['h'] = P.encode_heights(D, En, water2)
    D['wl'] = P.encode_levels(D, whas2, wlev2)
    # Restore dry cells of wl inside pure_ir that turned from water to land? No: encode_levels sets B=0 on ~whas2,
    # and outside pure_ir whas2 == whas0 and wlev2 == wlev0, but _enc(D, wlev2) on existing water outside pure_ir could
    # differ by 0 or 1 LSB if re-encoded from float! Let's copy raw0['h'] and raw0['wl'] outside pure_ir to guarantee
    # 100% exact RGB bytes on every single pixel outside pure_ir!
    h_now = P.raster(D, 'h')
    h_now[~pure_ir] = raw0['h'][~pure_ir]
    D['h'] = P.b64(Image.fromarray(h_now, 'RGB'), optimize=True)

    wl_now = P.raster(D, 'wl')
    wl_now[~pure_ir] = raw0['wl'][~pure_ir]
    D['wl'] = P.b64(Image.fromarray(wl_now, 'RGB'), optimize=True)

    D['p'] = P.b64(Image.fromarray(p_u8, 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2, 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2, 'L'), optimize=True)

    rain_now = P.raster(D, 'p', 'L').astype(float) / 255.0 * 4000.0
    cnow = P.raster(D, 'c', 'L')
    tm_now = P.raster(D, 'tm', 'L').astype(float) - 90.0

    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), (np.abs(rain_now - rain0) > 1.0) & pure_ir)
    col = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cnow], (cnow != raw0['c']) & pure_ir)

    relit, EoF, EnF, relight_rep = relight_masked(D, Eo, En, pure_ir)
    for k, v in relit.items():
        D[k] = v
    for k in ('rt', 'ct'):
        arr_k = P.raster(D, k)
        arr_k[~pure_ir] = raw0[k][~pure_ir]
        D[k] = P.jpeg_like({k: jpeg0[k]}, k, arr_k)
    rep['relight'] = relight_rep

    near = nd.binary_dilation(moved, iterations=3) & pure_ir
    donor_water = old_interior_lakes & (nd.distance_transform_edt(old_interior_lakes) > 2.0)
    for k in ('st', 't'):
        a0 = P.raster(D, k)
        a = PA.retint(a0, EoF, EnF, near & (~all_new_lakes), (~near) & (~whas0), 150.0)
        # Repaint dried saucer-lake floor for its new alpine climate before painting new lakes
        landw = np.clip(nd.gaussian_filter(to_land.astype(float), 0.8) * 1.5, 0.0, 1.0) * (~all_new_lakes) * pure_ir
        a = PA.by_climate(a.astype(np.uint8), EnF, rain_now, tm_now, whas2 | (~pure_ir), to_land, landw)
        # Paint the 7 Swiss lakes in native highland lake water colour, preserving local brightness detail
        af = a.astype(float)
        lum = af.mean(-1)
        det = np.clip((lum + 4.0) / (nd.gaussian_filter(lum, 3.0) + 4.0), 0.85, 1.15)[..., None]
        tgt = np.median(raw0[k][donor_water], axis=0)
        wgt = np.clip(nd.gaussian_filter(all_new_lakes.astype(float), 0.7) * 1.35, 0.0, 1.0)[..., None] * pure_ir[..., None]
        af = np.clip(af * (1.0 - wgt) + tgt * det * wgt, 0.0, 255.0)
        # Subtle cataract strokes on satellite/relief maps
        img = Image.fromarray(af.round().astype(np.uint8))
        over = Image.new('RGBA', img.size, (0, 0, 0, 0))
        dr = ImageDraw.Draw(over)
        colour = (64, 148, 166) if k == 'st' else (58, 112, 132)
        for pts_r in paint_river_paths:
            in_pts = []
            for x, y in pts_r[:10]:
                ix, iy = int(round(x)), int(round(y))
                if 0 <= iy < OH and 0 <= ix < OW and dist_out_px[iy, ix] >= 2.5:
                    in_pts.append((float(x), float(y)))
                else:
                    break
            if len(in_pts) >= 2:
                dr.line(in_pts, fill=colour + (195,), width=2, joint='curve')
        over = over.filter(ImageFilter.GaussianBlur(0.6))
        merged = np.array(Image.alpha_composite(img.convert('RGBA'), over).convert('RGB'))
        merged[~pure_ir] = raw0[k][~pure_ir]
        D[k] = P.jpeg_like({k: jpeg0[k]}, k, merged)
        rep['lake_paint_rgb_' + k] = [round(float(v)) for v in tgt]

    # ---- 11. Update basins.json and climate.present ----
    kept_basins = []
    removed_basins = []
    for b in D.get('basins', []):
        bx, by = int(round(b['at_px'][0])), int(round(b['at_px'][1]))
        if 0 <= by < OH and 0 <= bx < OW and old_interior_lakes[by, bx]:
            removed_basins.append(b)
        else:
            kept_basins.append(b)

    new_basins = []
    rep['lakes'] = []
    tot_lake_km2 = 0
    tot_gross_mw = 0.0
    for lk in LAKES:
        lid = lk['id']
        lm = lake_masks[lid]
        ly, lx = np.nonzero(lm)
        # Pick wet cell nearest the primary arm midpoint so at_px is guaranteed inside lm
        arm0 = lk['arms'][0][0]
        mx_arm, my_arm = arm0[len(arm0) // 2]
        k_best = int(np.argmin(np.hypot(lx - mx_arm, ly - my_arm)))
        at_px = [round(float(lx[k_best]), 1), round(float(ly[k_best]), 1)]
        assert whas2[int(round(at_px[1])), int(round(at_px[0]))], f'basin at_px not wet for {lid}'

        shore = nd.binary_dilation(lm, structure=np.ones((3, 3), dtype=bool)) & (~lm) & (~whas2)
        dom_clim = codes[int(np.bincount(cnow[shore]).argmax())]
        deps = lk['wlev_m'] - En[lm]
        km2 = int(lm.sum()) * 4
        tot_lake_km2 += km2
        spill_open, spill_blk = lake_spills[lid]
        head_m = lk['wlev_m'] - lk['drop_to_m']
        gross_mw = 9.81 * lk['q_m3s'] * head_m / 1000.0
        tot_gross_mw += gross_mw

        brec = {
            'id': lid,
            'name': lk['name'],
            'at_px': at_px,
            'level_m': int(round(lk['wlev_m'])),
            'km2': km2,
            'depth_m': int(round(float(deps.max()))),
            'spill_m': int(round(spill_open)),
            'kind': 'through lake',
            'climate': dom_clim,
            'region': IR_ID,
            'notes': (
                f"Stepped Swiss-style glacial lake ({lk['analogue']}; edit_520_republic_alps, 2026-11-18): "
                f"outflow via {lk['out_river']} ({lk['q_m3s']} m3/s, {int(round(head_m))} m head) to {lk['to_label']}."
            ),
        }
        new_basins.append(brec)
        rep['lakes'].append({
            'id': lid,
            'name': lk['name'],
            'analogue': lk['analogue'],
            'at_px': at_px,
            'sill_px': list(lk['sill_px']),
            'cells': int(lm.sum()),
            'km2': km2,
            'level_m': lk['wlev_m'],
            'spill_open_m': round(spill_open, 1),
            'spill_blocked_m': round(spill_blk, 1),
            'depth_max_m': round(float(deps.max()), 1),
            'depth_median_m': round(float(np.median(deps)), 1),
            'out_river': lk['out_river'],
            'q_m3s': lk['q_m3s'],
            'head_m': round(head_m, 1),
            'gross_hydro_MW': round(gross_mw, 1),
            'climate_shore': dom_clim,
        })

    D['basins'] = kept_basins + new_basins
    rep['basins_replaced'] = {'removed_count': len(removed_basins), 'added_count': len(new_basins), 'total_lake_km2': tot_lake_km2, 'total_gross_hydro_MW': round(tot_gross_mw, 1)}

    dc = Counter(cnow.ravel().tolist())
    for pr in D['climate']['present']:
        k = codes.index(pr['code'])
        pr['km2'] = int(dc.get(k, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(k, 0) / cnow.size, 2)

    # ---- 12. Massif & pass summary tables ----
    rep['massifs'] = []
    for mid, mname, mgloss, mpts, crest_m, hw_px, h_amp in MASSIFS:
        d_m, _ = polyline_dist_and_s(xx, yy, mpts)
        mm = (d_m <= hw_px) & pure_ir & (~whas2)
        my_, mx_ = np.nonzero(mm)
        pk_i = int(np.argmax(En[mm]))
        pk_m = float(En[mm].max())
        rep['massifs'].append({
            'id': mid,
            'name': mname,
            'peak_m': round(pk_m, 1),
            'peak_px': [int(mx_[pk_i]), int(my_[pk_i])],
            'p90_m': round(float(np.percentile(En[mm], 90)), 1),
            'area_km2': int(mm.sum()) * 4,
            'peak_atm': round(1.6 * math.exp(-pk_m / 8000.0), 2),
            'gloss': mgloss,
        })

    gy, gx = np.gradient(En)
    slope2 = np.hypot(gx, gy) / 2000.0
    rep['passes'] = []
    for pid, pname, pgloss, (spx, spy), ppts, sad_m, phw, conn in PASSES:
        ix, iy = int(round(spx)), int(round(spy))
        el = float(En[iy, ix])
        rep['passes'].append({
            'id': pid,
            'name': pname,
            'px': [ix, iy],
            'before_m': round(float(Eo[iy, ix]), 1),
            'after_m': round(el, 1),
            'atm': round(1.6 * math.exp(-el / 8000.0), 2),
            'slope': round(float(slope2[iy, ix]), 3),
            'climate': codes[int(cls2[iy, ix])],
            'connects': conn,
        })

    # ---- 13. Build & verify 60-settlements.js updates ----
    pin_rep, sett_write = build_settlements_js(En, whas2, pure_ir, codes, cnow, rain_now, tm_now)
    rep['settlements'] = pin_rep

    # ---- 14. Strict programmatic byte-identity verification outside pure_ir ----
    outside = ~pure_ir
    out_of_mask_diffs = {}
    inside_diffs = {}
    for k in ('h', 'wl', 'wd') + L_KEYS:
        a = P.raster(D, k, 'L' if k in L_KEYS else 'RGB')
        diff = (a != raw0[k]) if a.ndim == 2 else np.any(a != raw0[k], axis=-1)
        out_cnt = int((diff & outside).sum())
        in_cnt = int((diff & pure_ir).sum())
        out_of_mask_diffs[k] = out_cnt
        inside_diffs[k] = in_cnt
        assert out_cnt == 0, f'STRICT MASK VIOLATION: {k} changed on {out_cnt} pixels outside pure_ir!'

    rep['strict_mask_check'] = {
        'outside_pure_ir_pixels_changed': out_of_mask_diffs,
        'inside_pure_ir_pixels_changed': inside_diffs,
        'zero_outside_diff_verified': all(v == 0 for v in out_of_mask_diffs.values()),
    }

    # JPEG codec verification away from 16x16 square MCU + chroma border around pure_ir
    rep['jpeg_outside'] = {}
    far = ~nd.binary_dilation(pure_ir, structure=np.ones((3, 3), dtype=bool), iterations=17)
    for k in ('st', 't', 'rt', 'ct'):
        b = P.jpeg_like({k: jpeg0[k]}, k, raw0[k])
        ref = P.raster({k: b}, k).astype(int)
        now = P.raster(D, k).astype(int)
        codec = np.abs(ref - raw0[k].astype(int)).max(-1)
        same_far = bool((now[far] == ref[far]).all())
        rep['jpeg_outside'][k] = {
            'same_as_untouched_reencoded': same_far,
            'codec_drift_max': int(codec[far].max()),
            'codec_drift_mean': round(float(codec[far].mean()), 3),
            'changed_px_in_pure_ir': int((np.abs(now - raw0[k].astype(int)).max(-1)[pure_ir] > 2).sum()),
        }
        assert same_far, f'{k} changed away from pure_ir beyond JPEG 1-pass codec re-encoding'

    if DRY:
        print(json.dumps(rep, indent=1, ensure_ascii=False))
        return

    P.save(D)
    sett_path, sett_text = sett_write
    with open(sett_path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(sett_text)
    rep_path = os.path.join(HERE, 'edit_520_republic_alps.report.json')
    with open(rep_path, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(rep, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print(json.dumps(rep, indent=1, ensure_ascii=False))


if __name__ == '__main__':
    main()
