#!/usr/bin/env python3
"""Scale model 5.1, edit 20 v2 (2026-11-23): Mega-Switzerland Overhaul of the Iron Republic
(`rmufxti8qwcxy`, `137,376 km2` — 3.3x Switzerland).

Replaces flat saucer / capsule approximations with true glaciated Alpine geomorphology:
  1. Restores clean pre-edit_520 (`7dcfa8a5f`) rasters & rivers inside `pure_ir` while keeping
     100% of `5.1e21–5.1e23` outside `pure_ir` byte-identical (idempotent re-runnable).
  2. Sculpts 9 interlocking NNE-SSW multi-octave Ridged-Multifractal + Cirque-Eroded Alpine
     cordilleras (`5,250–7,380 m` pyramidal horns, razor arêtes, hanging cirques, valley glaciers,
     and folded NW/W Jura ridges) seamlessly fused into the neighboring `6,245–6,415 m` snow ranges.
  3. Carves a full dendritic U-shaped glacial valley network (`Valais`, `Uri`, `Haslital`,
     `Rheintal`, `Linth`, `Engadin` analogues continuing `35–90 km` upstream of the lakes!) with
     glacial bedrock overdeepenings, riegel/moraine sills, and prograding tributary alluvial fans.
  4. Forms the 7 stepped Swiss lakes (`L1` Roketsjö `2,860 m`, `L2` Korsvatn `2,420 m`,
     `L3` Glasklar-Sjö `2,360 m`, `L4` Kaskejt-Sjö `2,220 m`, `L5` Nordsjö `2,260 m`,
     `L6` Stålsjö `2,580 m`, `L7` Malmtjärn `2,880 m`) organically by valley-flooding
     (`En < wlev_m`), yielding jagged headland spurs, tapering delta V-heads, Bödeli/Rapperswil
     narrows, crooked multi-basin fjords, and bathymetric glacial-flour water shading.
  5. Wires all 7 spillway cataracts + 12 sinuous glacier-fed U-valley tributary rivers with
     strictly monotonic `bed_m` and `0` uphill steps, verifying all `test_smodel.py` invariants.
"""
import copy
import heapq
import io
import json
import math
import os
import re
import subprocess
import sys
from collections import Counter

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import smodel.climate as C  # noqa: E402
import smodel.geom as G     # noqa: E402
import smodel.page as P     # noqa: E402
import smodel.paint as PA   # noqa: E402

SRC = os.path.join(HERE, 'model', 'src')
IR_ID = 'rmufxti8qwcxy'
IR_BOX = (550, 925, 488, 735)
SETT_VER = '5.1e20'
BASE_COMMIT = '7dcfa8a5f'
DRY = ('--dry-run' in sys.argv) or ('--dry' in sys.argv)


# -----------------------------------------------------------------------------
# 1. Deterministic Quintic Value Noise & Ridged Multifractal Fields (Zero Sine Grids!)
# -----------------------------------------------------------------------------
def _hash2d(ix, iy, seed):
    h = (ix.astype(np.int64) * 374761393 + iy.astype(np.int64) * 668265263 + int(seed) * 1442695041) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    h = (h ^ (h >> 16)) & 0xFFFFFFFF
    return h.astype(np.float64) / 4294967295.0 * 2.0 - 1.0


def vnoise2d(x, y, scale, seed):
    xs = x / float(scale)
    ys = y / float(scale)
    ix = np.floor(xs).astype(np.int64)
    iy = np.floor(ys).astype(np.int64)
    fx = xs - ix
    fy = ys - iy
    ux = fx * fx * fx * (fx * (fx * 6.0 - 15.0) + 10.0)
    uy = fy * fy * fy * (fy * (fy * 6.0 - 15.0) + 10.0)
    n00 = _hash2d(ix, iy, seed)
    n10 = _hash2d(ix + 1, iy, seed)
    n01 = _hash2d(ix, iy + 1, seed)
    n11 = _hash2d(ix + 1, iy + 1, seed)
    nx0 = n00 + ux * (n10 - n00)
    nx1 = n01 + ux * (n11 - n01)
    return nx0 + uy * (nx1 - nx0)


def fbm2d(x, y, base_scale, octaves=5, lacunarity=2.05, gain=0.5, seed=100):
    tot = np.zeros_like(x, dtype=np.float64)
    amp = 1.0
    norm = 0.0
    sc = float(base_scale)
    for o in range(octaves):
        tot += amp * vnoise2d(x, y, sc, seed + o * 31)
        norm += amp
        amp *= gain
        sc /= lacunarity
    return tot / max(norm, 1e-9)


def ridged_mf(x, y, base_scale, octaves=5, lacunarity=2.12, gain=0.52, seed=200):
    """Sharp knife-edge Alpine arête & pyramidal horn multifractal in [0, 1]."""
    tot = np.zeros_like(x, dtype=np.float64)
    amp = 1.0
    weight = np.ones_like(x, dtype=np.float64)
    norm = 0.0
    sc = float(base_scale)
    for o in range(octaves):
        n = 1.0 - np.abs(vnoise2d(x, y, sc, seed + o * 47))
        n = n * n
        n *= weight
        weight = np.clip(n * 1.85, 0.15, 1.0)
        tot += n * amp
        norm += amp
        amp *= gain
        sc /= lacunarity
    return np.clip(tot / max(norm, 1e-9), 0.0, 1.0)


# -----------------------------------------------------------------------------
# 2. Geometry, Polyline Distance with Variable Width, & Flood-Fill Helpers
# -----------------------------------------------------------------------------
def poly_profile(xx_g, yy_g, ctrl):
    """ctrl is list of (x, y, half_width_px, target_val).
    Returns (min_dist_px, interp_hw_px, interp_val, norm_s)."""
    pts = [(float(p[0]), float(p[1])) for p in ctrl]
    hws = [float(p[2]) for p in ctrl]
    vals = [float(p[3]) for p in ctrl]
    segs = [math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts[:-1], pts[1:])]
    tot = max(sum(segs), 1e-6)
    cum = [0.0]
    for sl in segs:
        cum.append(cum[-1] + sl)

    best_d2 = np.full(xx_g.shape, np.inf)
    best_hw = np.ones(xx_g.shape, dtype=np.float64)
    best_val = np.zeros(xx_g.shape, dtype=np.float64)
    best_s = np.zeros(xx_g.shape, dtype=np.float64)
    for idx, (a, b) in enumerate(zip(pts[:-1], pts[1:])):
        vx, vy = b[0] - a[0], b[1] - a[1]
        l2 = vx * vx + vy * vy + 1e-12
        t = np.clip(((xx_g - a[0]) * vx + (yy_g - a[1]) * vy) / l2, 0.0, 1.0)
        px_c = a[0] + t * vx
        py_c = a[1] + t * vy
        d2 = (xx_g - px_c) ** 2 + (yy_g - py_c) ** 2
        upd = d2 < best_d2
        best_d2 = np.where(upd, d2, best_d2)
        best_hw = np.where(upd, hws[idx] + t * (hws[idx + 1] - hws[idx]), best_hw)
        best_val = np.where(upd, vals[idx] + t * (vals[idx + 1] - vals[idx]), best_val)
        best_s = np.where(upd, (cum[idx] + t * segs[idx]) / tot, best_s)
    return np.sqrt(best_d2), best_hw, best_val, best_s


def priority_fill_box(E_arr, box):
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


def load_git_raster(commit, relpath, mode='RGB'):
    raw = subprocess.check_output(['git', 'show', f'{commit}:{relpath}'], cwd=ROOT)
    return np.array(Image.open(io.BytesIO(raw)).convert(mode))


# -----------------------------------------------------------------------------
# 3. Mega-Switzerland Tectonic Cordilleras, U-Valleys, Fans & Lake Basins
# -----------------------------------------------------------------------------
# Each massif spine: (id, name, gloss, [(x, y, hw_px, crest_m), ...])
MASSIFS = [
    ('M1_jernhorn', 'Jernhorn-Alperna', 'Bernese Oberland (Eiger/Mönch/Jungfrau analogue behind Roketstad)',
     [(616, 696, 7.2, 5850), (628, 704, 9.0, 6680), (640, 713, 9.8, 7060), (648, 725, 8.5, 6540), (644, 738, 7.2, 6180)]),
    ('M2_midtkam', 'Midtkammen (Gotthard-Aletsch)', 'Central Hydrographic Knot & Great Glacier Massif',
     [(586, 743, 6.8, 5680), (596, 756, 9.8, 6720), (604, 770, 11.2, 7220), (607, 785, 10.6, 6980), (602, 800, 8.0, 6150)]),
    ('M3_nordvagg', 'Nordväggen (Churfirsten-Säntis)', 'Sheer Northern Thrust Wall between Nordsjö & Roketsjö/Korsvatn',
     [(576, 699, 5.8, 5280), (589, 702, 7.2, 6080), (604, 701, 6.8, 5960), (615, 696, 6.2, 5680)]),
    ('M4_vestkam', 'Vestkammen (Dents du Midi-Diablerets)', 'Western Glaciated Rampart above Glasklar-Sjö & Footfall',
     [(554, 718, 6.8, 5180), (547, 736, 8.0, 5940), (544, 755, 7.6, 5680), (543, 780, 8.2, 6080), (549, 804, 7.5, 5720)]),
    ('M5_sydhorn', 'Sydhorn-Kedjan (Pennine-Matterhorn)', 'Colossal Southern Cordillera between Glasklar, Kaskejt & Stålsjö',
     [(552, 814, 7.5, 5980), (566, 815, 9.2, 6760), (580, 810, 8.2, 6380), (597, 821, 10.8, 7280), (611, 834, 10.2, 6880), (624, 845, 8.0, 6180)]),
    ('M6_kopparkam', 'Kopparkammen (Bernina-Bregaglia)', 'Southern Skarn & Granite Alps welding into the 6,415 m South Peak',
     [(568, 866, 7.2, 5720), (586, 872, 9.0, 6480), (604, 876, 9.0, 6680), (618, 870, 7.5, 6080)]),
    ('M7_tinnspets', 'Tinnspetsarna (Bernina-Albula)', 'Interior Granite Chain framing the SE wall of the Engadin & Lipp',
     [(654, 682, 7.0, 6080), (666, 671, 7.8, 6540), (677, 656, 7.2, 6380), (686, 638, 6.2, 5680)]),
    ('M8_nordjura', 'Nordjura-Kedjan', 'Folded Prealpine & Jura Anticlines framing Nordsjö on the North',
     [(554, 672, 6.5, 4480), (575, 664, 7.8, 5180), (598, 658, 8.2, 5480), (620, 654, 7.5, 5240), (636, 649, 6.8, 5120)]),
    ('M9_vastjura', 'Västjura-Kammen', 'Folded Jura Escarpment framing Jurasjö & Western Mittelland',
     [(568, 706, 5.5, 4520), (569, 720, 6.0, 4880), (566, 734, 6.2, 4960), (525, 764, 6.8, 4780), (532, 816, 6.5, 4620)]),
    # Secondary High Inter-Valley Spurs (interlocking mountain ribs like Lauterbrunnen/Mattertal divides!)
    ('M10_uri_spur', 'Urner-Kammen', 'Steep Fjord Divide East of Urnersee',
     [(621, 748, 5.5, 5840), (625, 766, 6.5, 6420), (623, 786, 6.2, 6240)]),
    ('M11_oberland_spur', 'Hasli-Kammen', 'Central Spur between Korsvatn & Roketsjö',
     [(604, 714, 5.2, 5340), (614, 724, 5.8, 5820), (621, 733, 5.0, 5180)]),
    ('M12_nordost_alp', 'Gråhorn-Massivet (Silvretta)', 'North-Central Alpine Massif between Nordsjö & Malmtjärn',
     [(616, 672, 7.2, 5680), (634, 677, 8.2, 6320), (649, 681, 7.6, 6160)]),
]

# Dendritic U-Shaped Glacial Valleys (BOTH overdeepened lake troughs AND upstream dry U-valleys!)
# Each tuple: (id, [(x, y, floor_hw_px, target_bed_m), ...], wall_steepness)
GLACIAL_TROUGHS = [
    # --- L3 Glasklar-Sjö (Grand Lac Léman, wlev 2,360 m) + Sweeping "Valais / Rhône" Glacial Furrow! ---
    ('V_valais_upper', [
        (602, 741, 1.4, 3480), (595, 747, 1.7, 2720),
    ], 1.9),
    ('V_L3_leman', [
        (589, 752, 2.2, 2240),   # Narrow eastern Villeneuve / Kors-Strömmen inflow
        (578, 756, 5.8, 1810),   # Broad Haut-Lac sweeping arc
        (566, 766, 8.2, 1680),   # Grand-Lac abyssal crescent off Footfall (16-22 km wide!)
        (563, 781, 6.6, 1740),   # Mid-Léman bend (Évian / Morges)
        (572, 793, 4.2, 1980),   # Yvoire / Nyon narrowing
        (583, 799, 2.5, 2210),   # Slender Petit-Lac approaching Urverkstad (Geneva!)
        (589, 802, 1.6, 2345),   # Outlet approach above Urverkstad sill (590, 803)
    ], 2.0),
    ('V_L3_west_glen', [
        (535, 746, 1.3, 3560), (547, 756, 1.8, 2780), (558, 765, 2.2, 2395), (564, 770, 2.8, 2120),
    ], 1.8),
    ('V_L3_rhone_south_glen', [
        (596, 782, 1.3, 3780), (588, 786, 1.6, 3020), (579, 789, 1.8, 2490),
    ], 2.0),

    # --- L2 Korsvatn (Vierwaldstättersee, wlev 2,420 m) — Crooked Dogleg Fjord + Upstream "Uri / Reuss" Valley! ---
    ('V_L2_central_dogleg', [
        (592, 750, 1.6, 2395),   # Alpnach / Kors-Strömmen sill
        (598, 747, 2.9, 2120),   # Stansstad narrows
        (606, 743, 4.9, 1840),   # Kreuztrichter / Weggis central confluence bowl
        (614, 739, 2.2, 2230),   # Rocky Nasen constriction!
        (620, 741, 3.9, 1950),   # Gersau-Brunnen eastern basin
        (625, 740, 2.0, 2340),   # Korshamn delta head
    ], 2.1),
    ('V_L2_urnersee_and_reuss', [
        (609, 744, 3.3, 1920),
        (614, 754, 3.0, 1860),   # Deep sheer-walled Urnersee fjord!
        (616, 765, 2.4, 2060),
        (614, 773, 1.5, 2385),   # Flüelen / Reuss V-delta head
        (611, 784, 1.7, 2820),   # Upstream curving Reuss / Gotthard U-valley!
        (606, 795, 1.4, 3580),
    ], 2.2),
    ('V_L2_glaive_arm', [
        (606, 741, 3.0, 2040),
        (602, 732, 2.7, 2150),   # Küssnacht / Lucerne fjord arm
        (600, 724, 1.8, 2375),   # Tapering bayhead below Glaive (599, 721)
        (596, 714, 1.4, 2880),   # Brünig headwater valley
    ], 2.0),

    # --- L1 Roketsjö (Zürichsee-Walensee Sickle Arc, wlev 2,860 m) + Upstream "Linth / Glarus" Glacial Valley! ---
    ('V_L1_roketsjo', [
        (652, 696, 1.4, 3780),   # High Glarus / Linth glacial headwater valley!
        (639, 704, 1.7, 3180),   # Snou Bruk upper mill-gorge E of Roketstad
        (631, 725, 2.1, 2820),   # Outlet basin above Silvr Cataract (632, 727)
        (625, 719, 4.1, 2490),   # Main Roketsjö deep sickle basin off Roketstad (632, 716)
        (617, 713, 2.1, 2740),   # Rapperswil / Hurden moraine narrows!
        (609, 707, 3.5, 2560),   # Upper Obersee / Walensee cliff-walled basin under Nordväggen
        (601, 705, 1.4, 2960),   # Tapering western valley head
    ], 2.0),

    # --- L4 Kaskejt-Sjö (Expanded Twin Brienzersee + Thunersee, wlev 2,220 m) + Lauterbrunnen Side Trough! ---
    ('V_L4_interlaken', [
        (590, 809, 2.0, 2175),   # Eastern inflow below Blak Bruk cataract
        (586, 817, 4.3, 1760),   # Deep turquoise Brienzersee upper glacial trough!
        (580, 825, 2.1, 2145),   # Interlaken Bödeli constriction!
        (574, 832, 4.8, 1730),   # Broad Thunersee lower glacial basin!
        (569, 838, 2.1, 2175),   # Cascade sill approach (569, 839)
    ], 2.1),
    ('V_lauterbrunnen', [
        (597, 835, 1.3, 3580), (589, 830, 1.6, 2720), (581, 826, 1.8, 2245),  # Feeds the Interlaken Bödeli fan!
    ], 2.2),
    ('V_kaskejt_lower_gorge', [
        (567, 842, 1.8, 1980), (561, 851, 2.2, 1620), (553, 860, 2.5, 1280),
    ], 2.0),

    # --- L5 Nordsjö (Bodensee / Lake Constance, wlev 2,260 m) + Upstream "Alpine Rhine" Trough! ---
    ('V_L5_bodensee', [
        (634, 688, 1.5, 3260),   # Upstream Alpine-Rhine U-valley!
        (622, 685, 2.2, 2520),   # Rheintal delta plain entering Bodensee
        (612, 683, 5.9, 1900),   # Broad eastern Obersee (12-18 km wide!)
        (599, 684, 6.5, 1880),   # Central Bodensee bowl
        (588, 687, 3.6, 2060),   # Konstanz narrows
        (579, 689, 2.1, 2215),   # Untersee outlet arm to Slussport (576, 693)
    ], 1.9),
    ('V_L5_uberlingen_arm', [
        (598, 683, 3.5, 1980), (589, 678, 2.6, 2090), (581, 675, 1.5, 2310),  # Northern Überlinger See finger!
    ], 1.9),

    # --- L6 Stålsjö (Lago di Lugano / Como Y-Fjord, wlev 2,580 m) ---
    ('V_L6_como_main', [
        (628, 856, 1.5, 3220),   # Upstream Bregaglia / Mera valley above Stahlborn
        (616, 859, 2.1, 2540),   # Stahlborn eastern fjord head (pin at 618, 859)
        (606, 860, 3.8, 2180),   # Bellagio central Y-confluence!
        (594, 859, 3.2, 2230),   # Western Como/Lugano limb
        (583, 858, 1.9, 2535),   # Frost Rivr sill approach (581, 858)
    ], 2.1),
    ('V_L6_lecco_south_arm', [
        (606, 860, 3.2, 2210), (609, 867, 2.6, 2330), (613, 873, 1.5, 2660),  # Southern Lecco fjord arm!
    ], 2.1),

    # --- L7 Malmtjärn (Oberengadin Chain — Silsersee / Silvaplanersee, wlev 2,880 m) ---
    ('V_L7_engadin', [
        (689, 621, 1.8, 3460),   # Lipp pass U-valley (Lipp at 691, 619)
        (679, 639, 2.1, 3140),   # Upper Inn / Maloja approach valley
        (670, 654, 4.0, 2560),   # Silsersee upper pearl
        (661, 662, 3.4, 2640),   # Silvaplana middle basin
        (652, 665, 4.2, 2540),   # St. Moritz lower pearl
        (646, 662, 2.0, 2840),   # Nīla-āṟu cataract sill
        (640, 654, 2.0, 2380),   # Lower Engadin gorge exiting NW into r027
    ], 1.9),

    # --- L8 Jurasjö (Lac de Neuchâtel – Bielersee Jura-Foot Ribbon Lake, wlev 2,320 m)! ---
    ('V_L8_jurasjo', [
        (572, 743, 1.6, 2560),   # Southern Orbe / Broye inflow valley
        (577, 736, 3.5, 2060),   # Southern Yverdon / Neuchâtel basin
        (582, 727, 4.0, 2020),   # Broad central Neuchâtel Jura-foot trough!
        (585, 718, 2.2, 2240),   # Zihlkanal / St. Petersinsel moraine narrows!
        (586, 711, 3.1, 2110),   # Northern Bielersee basin!
        (585, 705, 1.8, 2295),   # Outlet sill toward Nordsjö (Aare / Jura-Älva)
        (583, 694, 1.8, 2245),   # Lower Aare valley entering Nordsjö E of Slussport
    ], 1.9),
]

# Prograding Tributary Alluvial Fans & Moraine Spits (creating natural Interlaken/Rapperswil/Engadin/Biel pinches!)
# (cx, cy, radius_px, fan_height_m)
ALLUVIAL_FANS = [
    (581.0, 825.5, 2.5, 2188.0),   # Interlaken Bödeli delta fan pinching Kaskejt-Sjö into Brienz & Thun!
    (618.0, 715.5, 2.4, 2826.0),   # Rapperswil Seedamm moraine spit narrowing Roketsjö!
    (614.0, 737.5, 2.3, 2386.0),   # Obermatt-Untermatt Nasen promontory pinching Korsvatn!
    (665.5, 659.5, 1.9, 2842.0),   # Sils-Silvaplana gravel fan pinching Malmtjärn!
    (656.5, 665.0, 1.9, 2844.0),   # Silvaplana-Champfèr fan on Malmtjärn!
    (584.2, 717.5, 2.0, 2288.0),   # St. Petersinsel / Zihl moraine spit pinching Jurasjö into Neuchâtel & Biel!
    (591.5, 682.5, 3.2, 2315.0),   # Bodanrück peninsula splitting Nordsjö's Überlinger finger from Untersee!
    (560.5, 767.0, 3.0, 2408.0),   # Footfall terraced alluvial fan on Glasklar-Sjö!
    (632.0, 716.0, 2.8, 2918.0),   # Roketstad Snou Bruk delta terrace above Roketsjö!
    (599.0, 721.0, 2.5, 2456.0),   # Glaive bayhead delta!
    (627.0, 740.0, 2.4, 2454.0),   # Korshamn Silvr cataract fan!
    (618.0, 859.0, 2.5, 2616.0),   # Stahlborn eastern fjord-head delta!
]

# High Sinuous Alpine Cols (natural 4,150–4,680 m glaciated saddles between peaks — ZERO low chainsaw trenches!)
PASSES = [
    ('P1_nordport', 'Nordport-Paset', 'Western Lock Gate (Hōng-Mā / Slussport -> Corpus)',
     (575.0, 693.0), [(569, 694, 2.4, 2250), (575, 693, 2.2, 2288), (581, 691, 2.4, 2275)]),
    ('P2_vastport', 'Västport (Simplon)', 'Western High Col above Footfall',
     (545.0, 763.0), [(536, 766, 2.5, 3980), (545, 763, 2.8, 4380), (553, 765, 2.5, 3650)]),
    ('P3_korspas', 'Korspaset (Brünig)', 'Northern Saddle between Nordväggen & Jernhorn',
     (596.0, 702.0), [(593, 694, 2.4, 3680), (596, 702, 2.8, 4280), (598, 710, 2.4, 3720)]),
    ('P4_midtpas', 'Midtpaset (Gotthard)', 'High Gotthard Col between Urner-Reuss & Valais',
     (599.0, 750.0), [(604, 752, 2.5, 4250), (596, 749, 2.8, 4580), (590, 748, 2.5, 3850)]),
    ('P5_stalpas', 'Stålpaset (Bernina)', 'High Southern Skarn Col between Kaskejt & Stålsjö',
     (595.0, 845.0), [(591, 838, 2.5, 4280), (596, 846, 2.8, 4680), (602, 853, 2.5, 4120)]),
    ('P6_lipppas', 'Lipppaset (Maloja)', 'Northern Tin & Customs Col (Malmtjärn <-> Lipp <-> Aidol)',
     (688.0, 620.0), [(679, 636, 2.4, 3220), (688, 620, 2.5, 3450), (695, 620, 2.4, 3520)]),
]

LAKES = [
    {
        'id': 'L1_roketsjo', 'name': 'Roketsjö', 'analogue': 'Zürichsee–Walensee',
        'wlev_m': 2860.0, 'max_depth_m': 360.0, 'rim_min_m': 2895.0,
        'box': (700, 729, 601, 634), 'seed_px': (624, 718),
        'sill_px': (632, 727), 'out_river': 'r051 (Silvr Bruk)', 'to_label': 'Korsvatn (2,420 m)',
        'q_m3s': 77.8, 'drop_to_m': 2420.0,
    },
    {
        'id': 'L2_korsvatn', 'name': 'Korsvatn', 'analogue': 'Vierwaldstättersee (Lake Lucerne crooked 5-basin fjord)',
        'wlev_m': 2420.0, 'max_depth_m': 580.0, 'rim_min_m': 2455.0,
        'box': (722, 776, 591, 627), 'seed_px': (606, 743),
        'sill_px': (591, 750), 'out_river': 'r_ir_korssund (Kors-Strömmen)', 'to_label': 'Glasklar-Sjö (2,360 m)',
        'q_m3s': 195.0, 'drop_to_m': 2360.0,
    },
    {
        'id': 'L3_glasklar', 'name': 'Glasklar-Sjö', 'analogue': 'Lac Léman / Lake Geneva (Grand-Lac & Petit-Lac)',
        'wlev_m': 2360.0, 'max_depth_m': 670.0, 'rim_min_m': 2395.0,
        'box': (750, 804, 553, 591), 'seed_px': (567, 770),
        'sill_px': (590, 803), 'out_river': 'r010 (Blak Bruk)', 'to_label': 'Kaskejt-Sjö (2,220 m)',
        'q_m3s': 369.3, 'drop_to_m': 2220.0,
    },
    {
        'id': 'L4_kaskejtsjo', 'name': 'Kaskejt-Sjö', 'analogue': 'Brienzersee–Thunersee (Interlaken twin-basin trough)',
        'wlev_m': 2220.0, 'max_depth_m': 470.0, 'rim_min_m': 2255.0,
        'box': (807, 840, 566, 593), 'seed_px': (574, 832),
        'sill_px': (569, 839), 'out_river': 'r004 (Kaskejt Rivr)', 'to_label': "western lake (Ancient's Valley, 17 m)",
        'q_m3s': 760.8, 'drop_to_m': 1800.0,
    },
    {
        'id': 'L5_nordsjo', 'name': 'Nordsjö', 'analogue': 'Bodensee / Lake Constance (Obersee, Überlinger & Untersee)',
        'wlev_m': 2260.0, 'max_depth_m': 350.0, 'rim_min_m': 2292.0,
        'box': (672, 693, 577, 621), 'seed_px': (602, 684),
        'sill_px': (577, 690), 'out_river': 'r014 (Hōng-Mā)', 'to_label': 'NW lowlands lake (46 m)',
        'q_m3s': 394.0, 'drop_to_m': 2090.0,
    },
    {
        'id': 'L6_stalsjo', 'name': 'Stålsjö', 'analogue': 'Lago di Como / Lugano (3-armed Insubric wishbone fjord)',
        'wlev_m': 2580.0, 'max_depth_m': 410.0, 'rim_min_m': 2612.0,
        'box': (853, 875, 581, 618), 'seed_px': (605, 860),
        'sill_px': (581, 858), 'out_river': 'r281 (Frost Rivr)', 'to_label': 'Kaskejt Rivr (r004)',
        'q_m3s': 85.3, 'drop_to_m': 2180.0,
    },
    {
        'id': 'L7_malmtjarn', 'name': 'Malmtjärn', 'analogue': 'Oberengadin Chain (Silsersee–Silvaplanersee–St. Moritzersee)',
        'wlev_m': 2880.0, 'max_depth_m': 260.0, 'rim_min_m': 2912.0,
        'box': (648, 672, 645, 675), 'seed_px': (660, 662),
        'sill_px': (645, 661), 'out_river': 'r027 (Nīla-āṟu)', 'to_label': 'Jimjam lake (430 m)',
        'q_m3s': 139.6, 'drop_to_m': 2445.0,
    },
    {
        'id': 'L8_jurasjo', 'name': 'Jurasjö', 'analogue': 'Lac de Neuchâtel – Bielersee (Jura-Foot Seeland Ribbon)',
        'wlev_m': 2320.0, 'max_depth_m': 195.0, 'rim_min_m': 2350.0,
        'box': (704, 742, 573, 591), 'seed_px': (582, 727),
        'sill_px': (585, 704), 'out_river': 'r_ir_zihl (Jura-Älva)', 'to_label': 'Nordsjö (2,260 m)',
        'q_m3s': 64.0, 'drop_to_m': 2260.0,
    },
]

CATARACT_PATHS = [
    ('C1_silvr', 'L1_roketsjo', [(630, 724), (632, 727), (631, 731), (629, 735), (626, 739), (623, 740)], 2858.5, 2422.0),
    ('C2_korssund', 'L2_korsvatn', [(594, 749), (591, 750), (588, 752), (585, 755), (581, 757)], 2418.5, 2362.0),
    ('C3_blak', 'L3_glasklar', [(586, 800), (590, 803), (589, 807), (588, 810), (586, 814)], 2358.5, 2222.0),
    ('C4_kaskejt', 'L4_kaskejtsjo',
     [(572, 836), (569, 839), (566, 842), (563, 846), (562, 849), (560, 853), (556, 857)], 2218.5, 1870.0),
    ('C5_hongma', 'L5_nordsjo', [(580, 689), (577, 690), (575, 692), (573, 694)], 2258.5, 2090.0),
    ('C6_frost', 'L6_stalsjo', [(585, 858), (581, 858), (576, 857), (570, 857), (564, 857), (558, 858)], 2578.5, 1895.0),
    ('C7_hamer', 'L7_malmtjarn', [(650, 664), (645, 661), (642, 657), (640, 654)], 2878.5, 2445.0),
    ('C8_zihl', 'L8_jurasjo', [(586, 709), (585, 704), (584, 699), (583, 694), (583, 690)], 2318.5, 2261.5),
]

BENCH_SITES = [
    ('Roketstad', (632, 716), 2918.0),
    ('Glaive', (599, 721), 2456.0),
    ('Footfall', (560, 767), 2410.0),
    ('Urverkstad', (591, 801), 2394.0),
    ('Cascade', (568, 841), 2252.0),
    ('Slussport', (576, 693), 2288.0),
    ('Korshamn', (627, 740), 2454.0),
    ('Stahlborn', (618, 859), 2616.0),
    ('Lipp', (691, 619), 3495.0),
    ('Malmborg_stage', (673, 652), 2918.0),
]


def extract_connected_lake(cand_mask, seed_xy, box):
    y0, y1, x0, x1 = box
    sub = np.zeros_like(cand_mask, dtype=bool)
    sub[y0:y1, x0:x1] = cand_mask[y0:y1, x0:x1]
    sx, sy = int(round(seed_xy[0])), int(round(seed_xy[1]))
    lbl, n_c = nd.label(sub, structure=np.ones((3, 3), dtype=int))
    target_l = int(lbl[sy, sx])
    if target_l == 0 and n_c > 0:
        counts = np.bincount(lbl.ravel())
        counts[0] = 0
        target_l = int(counts.argmax())
    if target_l == 0:
        return np.zeros_like(cand_mask, dtype=bool)
    out = lbl == target_l
    # Fill tiny 1-2 px interior rock holes unless they are real >3px islands
    filled = nd.binary_fill_holes(out)
    holes = filled & (~out)
    hlbl, hn = nd.label(holes)
    for hi in range(1, hn + 1):
        hc = hlbl == hi
        if int(hc.sum()) <= 3:
            out |= hc
    return out


def monotonic_beds(En, pts, head_m=None, floor_m=None, step_min=0.4, cut_m=1.2):
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


def paint_swiss_maps(D, raw0, raw7, E7, En, whas2, pure_ir, dist_out_px, all_new_lakes, lake_masks, arete_hi, spur_ribs, paint_river_paths):
    """Synthesize Swisstopo-grade relief (`t`) and satellite (`st`) textures inside `pure_ir`,
    calibrated to `7dcfa8a5f`'s exact empirical RGB elevation ramps (`1,500–7,300 m`) with
    feathery dendritic arête/cirque rock-snow detail and change-weighted perimeter blending."""
    OH, OW = En.shape
    yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float64)

    # Multi-scale directional relief shading (NW sun az=315, alt=44 deg, matching 5.1 assemble.py)
    gy_f, gx_f = np.gradient(En / 1000.0 * 4.6, 2.0)
    gy_c, gx_c = np.gradient(nd.gaussian_filter(En, 2.0) / 1000.0 * 3.1, 2.0)
    az_r, alt_r = math.radians(315.0), math.radians(44.0)
    lx, ly, lz = math.cos(alt_r) * math.sin(az_r), -math.cos(alt_r) * math.cos(az_r), math.sin(alt_r)
    lam_f = (-gx_f * lx - gy_f * ly + lz) / np.sqrt(gx_f * gx_f + gy_f * gy_f + 1.0)
    lam_c = (-gx_c * lx - gy_c * ly + lz) / np.sqrt(gx_c * gx_c + gy_c * gy_c + 1.0)
    shade = np.clip(0.64 * (lam_f / max(lz, 0.1)) + 0.36 * (lam_c / max(lz, 0.1)), 0.45, 1.38)
    slope = np.hypot(gx_f / 4.6, gy_f / 4.6)  # m/m physical slope

    # Aspect & ridge-spur structure for feathery Swisstopo cirques & exposed sunny rock crags!
    north_shelter = np.clip((-gy_f - 0.45 * gx_f) / (np.hypot(gx_f, gy_f) + 0.30), -1.0, 1.0)
    tex_micro = fbm2d(xx, yy, 4.8, octaves=3, seed=901)
    ridge_spine = np.clip(0.58 * arete_hi + 0.42 * spur_ribs, 0.0, 1.0)

    # Valley glacier tongues (Storglaciär / Aletsch in Midtkammen & Gorner in Sydhorn)
    d_aletsch, _, _, _ = poly_profile(xx, yy, [(604, 771, 1.9, 1), (599, 780, 1.5, 1), (593, 786, 1.1, 1)])
    d_gorner, _, _, _ = poly_profile(xx, yy, [(598, 822, 1.8, 1), (592, 828, 1.4, 1)])
    glacier_tongue = np.maximum(1.0 - G.sstep(0.6, 1.8, d_aletsch), 1.0 - G.sstep(0.6, 1.7, d_gorner)) * G.sstep(4450.0, 5050.0, En)

    # Steep sunlit S/SE rock walls shed snow, leaving feathery fern-leaf arête & cirque firn!
    sunny_crag = G.sstep(0.30, 0.58, slope) * np.clip(-north_shelter, 0.0, 1.0) * (1.0 - 0.55 * ridge_spine)

    # --- 1. Build Relief Map (`t.jpg`) — Exact `7dcfa8a5f` Empirical Ramp ---
    e_stops = np.array([1500.0, 2050.0, 2550.0, 3150.0, 3900.0, 4650.0, 5300.0, 5850.0, 6350.0, 7150.0])
    t_cols = np.array([
        [217.0, 221.0, 107.0],  # 1500m native chartreuse lowland
        [187.0, 199.0, 103.0],  # 2050m warm olive foothill
        [110.0, 142.0,  70.0],  # 2550m submontane valley
        [ 74.0, 133.0,  61.0],  # 3150m montane emerald
        [ 63.0, 121.0,  56.0],  # 3900m dark spruce belt
        [ 67.0, 118.0,  69.0],  # 4650m high subalpine
        [127.0, 152.0, 130.0],  # 5300m sage-slate alpine transition
        [170.0, 181.0, 175.0],  # 5850m silver-grey alpine rock/névé
        [192.0, 201.0, 198.0],  # 6350m snowline matching E/N/S 6,290m ranges!
        [232.0, 237.0, 240.0],  # 7150m brilliant high firn arête
    ])
    t_synth = np.stack([np.interp(En, e_stops, t_cols[:, c]) for c in range(3)], axis=-1)
    # Feathery cirque & arête snow striations + exposed slate crags on steep sunny faces
    t_firn_w = np.clip(G.sstep(5250.0, 6100.0, En + 380.0 * ridge_spine + 260.0 * north_shelter) * (1.0 - 0.65 * sunny_crag), 0.0, 1.0)
    t_firn_w = np.maximum(t_firn_w, 0.88 * glacier_tongue)
    t_synth = t_synth * (1.0 - 0.55 * sunny_crag[..., None] * G.sstep(4800.0, 5600.0, En)[..., None]) + np.array([108.0, 122.0, 116.0]) * (0.55 * sunny_crag[..., None] * G.sstep(4800.0, 5600.0, En)[..., None])
    t_synth = t_synth * (1.0 - 0.48 * t_firn_w[..., None]) + np.array([224.0, 231.0, 234.0]) * (0.48 * t_firn_w[..., None])
    t_synth *= (0.76 + 0.29 * shade[..., None]) * (1.0 + 0.035 * tex_micro[..., None])

    # --- 2. Build Satellite Map (`st.jpg`) — Exact `7dcfa8a5f` Warm Mahogany/Rose-Granite -> Velvety Rose-Firn Ramp! ---
    st_cols = np.array([
        [ 89.0, 106.0,  53.0],  # 1500m warm lowland meadow
        [ 78.0, 100.0,  52.0],  # 2050m valley forest
        [ 82.0,  96.0,  56.0],  # 2550m montane pine
        [100.0,  97.0,  57.0],  # 3150m olive-ochre prealpine
        [121.0,  92.0,  55.0],  # 3900m warm sienna subalpine
        [128.0,  88.0,  53.0],  # 4650m russet-bronze alpine
        [120.0,  76.0,  50.0],  # 5300m dark terracotta rock wall
        [132.0,  76.0,  57.0],  # 5850m crimson-mahogany Alpine spine!
        [156.0,  99.0,  83.0],  # 6350m warm rose-granite (exact match to 6,291m neighbor ranges!)
        [196.0, 168.0, 164.0],  # 7150m velvety high-alpine rose-firn crown!
    ])
    st_synth = np.stack([np.interp(En, e_stops, st_cols[:, c]) for c in range(3)], axis=-1)
    # Darken incised glacial valley floors slightly like 7dcfa8a5f canyon creases
    valley_crease = (1.0 - G.sstep(2100.0, 3100.0, En)) * G.sstep(0.10, 0.28, slope)
    st_synth *= (1.0 - 0.16 * valley_crease[..., None])
    # Delicate dendritic high-summit firn ribs & cirque glaciers matching 7dcfa8a5f South Peak!
    st_firn_w = G.sstep(6050.0, 7250.0, En + 340.0 * ridge_spine + 240.0 * north_shelter) * (1.0 - 0.68 * sunny_crag)
    st_firn_w = np.clip(np.maximum(st_firn_w, 0.58 * glacier_tongue), 0.0, 1.0)
    st_synth = st_synth * (1.0 - 0.46 * st_firn_w[..., None]) + np.array([208.0, 194.0, 194.0]) * (0.46 * st_firn_w[..., None])
    st_synth *= (0.74 + 0.32 * shade[..., None]) * (1.0 + 0.045 * tex_micro[..., None])

    # --- 3. Bathymetric + Glacial-Rock-Flour Lake Rendering (Calibrated to `7dcfa8a5f` Jade-Teal `[45, 95, 86]`) ---
    depth_grid = np.zeros_like(En)
    for lk in LAKES:
        lm = lake_masks[lk['id']]
        depth_grid[lm] = np.maximum(0.0, lk['wlev_m'] - En[lm])
    dist_in_lake = nd.distance_transform_edt(all_new_lakes)
    flour_w = np.clip(np.exp(-dist_in_lake / 1.55) * 0.62 + np.exp(-depth_grid / 105.0) * 0.38, 0.0, 1.0)[..., None]

    st_lake_col = flour_w * np.array([58.0, 112.0, 104.0]) + (1.0 - flour_w) * np.array([34.0, 78.0, 82.0])
    t_lake_col = flour_w * np.array([68.0, 120.0, 122.0]) + (1.0 - flour_w) * np.array([46.0, 92.0, 102.0])

    # Warm littoral terrace rim (1 px around lakes, matching 7dcfa8a5f's natural lake-shore seating)
    shore_halo = np.clip(nd.gaussian_filter(all_new_lakes.astype(float), 1.15) * 1.6, 0.0, 1.0) * (~all_new_lakes)
    st_synth = st_synth * (1.0 - 0.25 * shore_halo[..., None]) + np.array([104.0, 102.0, 62.0]) * (0.25 * shore_halo[..., None])

    lake_alpha = np.clip(nd.gaussian_filter(all_new_lakes.astype(float), 0.45) * 1.25, 0.0, 1.0)
    lake_alpha = np.where(all_new_lakes, np.maximum(lake_alpha, 0.94), lake_alpha * 0.42)[..., None]

    st_synth = st_synth * (1.0 - lake_alpha) + st_lake_col * lake_alpha
    t_synth = t_synth * (1.0 - lake_alpha) + t_lake_col * lake_alpha

    # --- 4. Change-Weighted Seamless Perimeter Blend (`ZERO` Political Polygon Edge Visibility!) ---
    elev_delta = np.abs(En - E7)
    change_mask = np.maximum(G.sstep(20.0, 240.0, elev_delta), np.clip(lake_alpha[..., 0] * 1.5 + shore_halo * 0.8, 0.0, 1.0))
    change_mask = nd.gaussian_filter(change_mask, 1.4)
    perim_feather = G.sstep(0.8, 7.5, dist_out_px)
    mod_w = np.clip(change_mask * perim_feather, 0.0, 1.0)[..., None]

    for k, synth_arr, riv_col in (
        ('st', st_synth, (52, 106, 100)),
        ('t', t_synth, (56, 104, 108)),
    ):
        base_7 = raw7[k].astype(np.float64)
        mixed_in = base_7 * (1.0 - mod_w) + np.clip(synth_arr, 0.0, 255.0) * mod_w
        img = Image.fromarray(np.clip(mixed_in, 0, 255).round().astype(np.uint8), 'RGB')
        over = Image.new('RGBA', img.size, (0, 0, 0, 0))
        dr = ImageDraw.Draw(over)
        for pts_r in paint_river_paths:
            if len(pts_r) >= 2:
                dr.line([(float(p[0]), float(p[1])) for p in pts_r], fill=riv_col + (155,), width=1, joint='curve')
        over = over.filter(ImageFilter.GaussianBlur(0.35))
        merged = np.array(Image.alpha_composite(img.convert('RGBA'), over).convert('RGB'))
        merged[~pure_ir] = raw0[k][~pure_ir]
        D[k] = P.jpeg_like(D, k, merged)


def update_rivers_and_outlets(D, rivers7, En, whas2, pure_ir, dist_out_px, lake_masks):
    """Restore clean 7dcfa8a5f rivers inside pure_ir, re-bind the 7 lake cataracts, and add
    10 sinuous glacier-fed U-valley headwater rivers (Valais, Uri/Reuss, Linth, Alpine Rhine,
    Lauterbrunnen, Engadin, Bregaglia) draining into L1–L7."""
    r7_by_id = {r['id']: copy.deepcopy(r) for r in rivers7}
    # Remove any prior edit_520 synthetic rivers before rebuilding cleanly
    D['rivers'] = [
        (r7_by_id[r['id']] if r['id'] in r7_by_id and any(
            0 <= int(round(p[1])) < En.shape[0] and 0 <= int(round(p[0])) < En.shape[1] and pure_ir[int(round(p[1])), int(round(p[0]))]
            for p in (r.get('px') or [])
        ) else r)
        for r in D['rivers']
        if not str(r.get('id', '')).startswith('r_ir_')
    ]
    rmap = {r['id']: r for r in D['rivers']}
    r_rep = {}

    def resample_q(q_old, n_new):
        if not q_old:
            return [20.0] * n_new
        if len(q_old) == 1 or n_new == 1:
            return [round(float(q_old[-1]), 1)] * n_new
        return [round(float(v), 1) for v in np.interp(np.linspace(0.0, 1.0, n_new), np.linspace(0.0, 1.0, len(q_old)), q_old)]

    def snap_dry_outside_lakes(pts):
        out = []
        for x, y in pts:
            ix, iy = int(round(x)), int(round(y))
            if whas2[iy, ix]:
                best = None
                for rad in range(1, 10):
                    for dy in range(-rad, rad + 1):
                        for dx in range(-rad, rad + 1):
                            ny, nx_ = iy + dy, ix + dx
                            if 0 <= ny < En.shape[0] and 0 <= nx_ < En.shape[1] and not whas2[ny, nx_]:
                                d = dy * dy + dx * dx
                                if best is None or d < best[0]:
                                    best = (d, float(nx_), float(ny))
                    if best:
                        break
                if best:
                    x, y = best[1], best[2]
            out.append((x, y))
        return out

    def carve_thalweg_descent(pts, max_climb=8.0):
        m_e = None
        protected = {xy for _, xy, _ in BENCH_SITES}
        for x, y in pts:
            ix, iy = int(round(x)), int(round(y))
            if not (0 <= iy < En.shape[0] and 0 <= ix < En.shape[1]):
                continue
            if whas2[iy, ix]:
                continue
            ev = float(En[iy, ix])
            if m_e is None or ev < m_e:
                m_e = ev
            elif ev - m_e > max_climb and pure_ir[iy, ix] and dist_out_px[iy, ix] >= 2.0 and (ix, iy) not in protected:
                En[iy, ix] = m_e + 2.0
                m_e = min(m_e, float(En[iy, ix]))

    def apply_river(rid, pts, q_vals, beds, to_obj, from_obj=None, setts=None):
        rec = rmap[rid]
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
        r_rep[rid] = {'name': rec.get('name'), 'n': len(pts), 'q': rec['q_mouth_m3s']}

    # 1) r051 Silvr Bruk: L1 Roketsjö (2,860 m) -> L2 Korsvatn (2,420 m)
    pts_051 = snap_dry_outside_lakes([(632.0, 727.0), (631.5, 729.5), (630.5, 732.5), (629.0, 735.5), (627.0, 738.0)])
    carve_thalweg_descent(pts_051)
    beds_051 = monotonic_beds(En, pts_051, head_m=2858.5, floor_m=2421.5, step_min=15.0, cut_m=0.5)
    apply_river('r051', pts_051, resample_q(rmap['r051']['q_m3s'], len(pts_051)), beds_051,
                to_obj={'lake_m': 2420, 'through': True, 'at_px': [624.0, 740.0]},
                from_obj={'lake': 'Roketsjö', 'lake_m': 2860, 'at_px': [632.0, 727.0]}, setts=['Korshamn'])

    # 2) r_ir_korssund Kors-Strömmen: L2 Korsvatn (2,420 m) -> L3 Glasklar-Sjö (2,360 m)
    pts_ks = snap_dry_outside_lakes([(591.0, 750.0), (589.0, 751.2), (587.0, 752.8), (585.0, 754.5)])
    carve_thalweg_descent(pts_ks)
    beds_ks = monotonic_beds(En, pts_ks, head_m=2418.5, floor_m=2361.5, step_min=6.0, cut_m=0.5)
    ks_rec = {
        'id': 'r_ir_korssund', 'name': 'Kors-Strömmen', 'kind': 'river', 'perennial': True, 'order': 3,
        'length_km': poly_len_km(pts_ks), 'catchment_km2': 16400, 'q_mouth_m3s': 215.0,
        'source_m': beds_ks[0], 'mouth_m': beds_ks[-1], 'region': 'The Iron Republic',
        'from': {'lake': 'Korsvatn', 'lake_m': 2420, 'at_px': [591.0, 750.0]},
        'to': {'lake_m': 2360, 'through': True, 'at_px': [583.0, 756.0]}, 'settlements': [],
        'px': [[round(x, 2), round(y, 2)] for x, y in pts_ks], 'bed_m': beds_ks,
        'q_m3s': [round(205.0 + 10.0 * i / max(1, len(pts_ks) - 1), 1) for i in range(len(pts_ks))],
        'width_m': 62, 'depth_m': 3.5, 'tongue': 'hajlandsk',
        'gloss': 'Cross-Current: natural rock sill race & 3-chamber Kors-Slussen barge lock linking Korsvatn to Glasklar-Sjö',
    }
    D['rivers'].append(ks_rec)
    rmap['r_ir_korssund'] = ks_rec
    r_rep['r_ir_korssund'] = {'name': 'Kors-Strömmen', 'n': len(pts_ks), 'q': 215.0}

    # 3) r010 Blak Bruk: L3 Glasklar-Sjö (2,360 m) -> L4 Kaskejt-Sjö (2,220 m) past Urverkstad
    pts_010 = snap_dry_outside_lakes([(590.0, 803.0), (589.5, 805.5), (589.0, 808.0), (588.0, 810.0)])
    carve_thalweg_descent(pts_010)
    beds_010 = monotonic_beds(En, pts_010, head_m=2358.5, floor_m=2221.5, step_min=12.0, cut_m=0.5)
    apply_river('r010', pts_010, resample_q(rmap['r010']['q_m3s'], len(pts_010)), beds_010,
                to_obj={'lake_m': 2220, 'through': True, 'at_px': [586.0, 812.0]},
                from_obj={'lake': 'Glasklar-Sjö', 'lake_m': 2360, 'at_px': [590.0, 803.0]}, setts=['Urverkstad'])

    # 4) r004 Kaskejt Rivr: L4 Kaskejt-Sjö (2,220 m) -> cataract past Cascade (568,841) -> lower r004
    r004 = rmap['r004']
    head_004 = snap_dry_outside_lakes([(569.0, 839.0), (567.0, 841.0), (565.0, 843.2), (563.2, 846.0), (562.2, 848.6), (561.2, 850.8)])
    tail_004 = [tuple(p) for p in r004['px'][15:]]
    pts_004 = head_004 + tail_004
    carve_thalweg_descent(head_004 + tail_004[:8])
    hb_004 = monotonic_beds(En, head_004 + [tail_004[0]], head_m=2218.5, floor_m=r004['bed_m'][15], step_min=8.0, cut_m=0.5)
    beds_004 = hb_004[:-1]
    cur_b = beds_004[-1]
    for b_old in r004['bed_m'][15:]:
        cur_b = round(min(float(b_old), cur_b - 0.1), 1)
        beds_004.append(cur_b)
    q_004 = [round(410.0 + (r004['q_m3s'][15] - 410.0) * i / len(head_004), 1) for i in range(len(head_004))] + list(r004['q_m3s'][15:])
    apply_river('r004', pts_004, q_004, beds_004, to_obj=r004['to'],
                from_obj={'lake': 'Kaskejt-Sjö', 'lake_m': 2220, 'at_px': [569.0, 839.0]}, setts=['Cascade'])

    # 5) r014 Hōng-Mā: L5 Nordsjö (2,260 m) -> Slussport -> Mirror Sea
    r014 = rmap['r014']
    head_014 = snap_dry_outside_lakes([(577.0, 690.0), (575.5, 692.0)])
    tail_014 = [tuple(p) for p in r014['px'][2:]]
    pts_014 = head_014 + tail_014
    carve_thalweg_descent(head_014 + tail_014[:4])
    hb_014 = monotonic_beds(En, head_014 + [tail_014[0]], head_m=2258.5, floor_m=r014['bed_m'][2], step_min=10.0, cut_m=0.5)
    beds_014 = hb_014[:-1] + [round(float(b), 1) for b in r014['bed_m'][2:]]
    for k in range(1, len(beds_014)):
        beds_014[k] = min(beds_014[k], round(beds_014[k - 1] - 0.1, 1))
    apply_river('r014', pts_014, resample_q(r014['q_m3s'], len(pts_014)), beds_014, to_obj=r014['to'],
                from_obj={'lake': 'Nordsjö', 'lake_m': 2260, 'at_px': [577.0, 690.0]},
                setts=sorted(set(r014.get('settlements') or []) | {'Slussport'}))

    # 6) r281 Frost Rivr: L6 Stålsjö (2,580 m) -> r004
    r281 = rmap['r281']
    head_281 = snap_dry_outside_lakes([(581.0, 858.0), (578.0, 857.5), (574.5, 857.0), (570.5, 857.0), (566.5, 857.0), (562.5, 857.2)])
    tail_281 = [tuple(p) for p in r281['px'][14:]]
    pts_281 = head_281 + tail_281
    carve_thalweg_descent(pts_281)
    hb_281 = monotonic_beds(En, head_281 + [tail_281[0]], head_m=2578.5, floor_m=r281['bed_m'][14], step_min=15.0, cut_m=0.5)
    beds_281 = hb_281[:-1] + [round(float(b), 1) for b in r281['bed_m'][14:]]
    for k in range(1, len(beds_281)):
        beds_281[k] = min(beds_281[k], round(beds_281[k - 1] - 0.1, 1))
    apply_river('r281', pts_281, resample_q(r281['q_m3s'], len(pts_281)), beds_281, to_obj=r281['to'],
                from_obj={'lake': 'Stålsjö', 'lake_m': 2580, 'at_px': [581.0, 858.0]}, setts=[])

    # 7) r027 Nīla-āṟu: L7 Malmtjärn (2,880 m) -> Jimjam's Lake
    r027 = rmap['r027']
    head_027 = snap_dry_outside_lakes([(645.0, 661.0), (643.5, 658.8), (642.0, 656.5)])
    tail_027 = [tuple(p) for p in r027['px']]
    pts_027 = head_027 + tail_027
    carve_thalweg_descent(head_027 + tail_027[:3])
    hb_027 = monotonic_beds(En, head_027 + [tail_027[0]], head_m=2878.5, floor_m=r027['bed_m'][0], step_min=35.0, cut_m=0.5)
    beds_027 = hb_027[:-1] + [round(float(b), 1) for b in r027['bed_m']]
    for k in range(1, len(beds_027)):
        beds_027[k] = min(beds_027[k], round(beds_027[k - 1] - 0.1, 1))
    apply_river('r027', pts_027, [r027['q_m3s'][0]] * len(head_027) + list(r027['q_m3s']), beds_027,
                to_obj=r027['to'], from_obj={'lake': 'Malmtjärn', 'lake_m': 2880, 'at_px': [645.0, 661.0]})

    # 8) Existing interior tributaries (r201 Snou Bruk at Roketstad 632.5,716.6!, r723, r238, r123, r092, r382, r282, r408, r312)
    pts_201 = snap_dry_outside_lakes([(650.0, 697.5), (644.0, 701.5), (638.5, 706.5), (634.8, 712.5), (632.5, 716.6), (630.8, 718.0)])
    carve_thalweg_descent(pts_201)
    apply_river('r201', pts_201, [6.5, 10.2, 14.4, 18.2, 21.9, 23.5],
                monotonic_beds(En, pts_201, floor_m=2861.5, step_min=8.0, cut_m=1.5),
                to_obj={'lake_m': 2860, 'through': True, 'at_px': [629.0, 718.5]}, setts=['Roketstad'])

    pts_723 = snap_dry_outside_lakes([(622.5, 704.5), (622.5, 706.5), (622.5, 708.0)])
    carve_thalweg_descent(pts_723)
    apply_river('r723', pts_723, resample_q(rmap['r723']['q_m3s'], len(pts_723)),
                monotonic_beds(En, pts_723, floor_m=4100.0, step_min=8.0, cut_m=1.5),
                to_obj={'river': 'r238', 'name': 'Pajn Bruk', 'at_px': list(pts_723[-1])})

    pts_238 = snap_dry_outside_lakes([pts_723[-1], (622.5, 709.5), (622.5, 711.0)])
    carve_thalweg_descent(pts_238)
    apply_river('r238', pts_238, resample_q(rmap['r238']['q_m3s'], len(pts_238)),
                monotonic_beds(En, pts_238, head_m=rmap['r723']['bed_m'][-1] - 2.0, floor_m=2861.5, step_min=15.0, cut_m=1.5),
                to_obj={'lake_m': 2860, 'through': True, 'at_px': [622.5, 712.5]})

    pts_123 = snap_dry_outside_lakes([(584.5, 738.0), (590.5, 735.5), (596.5, 734.0), (600.0, 734.0)])
    carve_thalweg_descent(pts_123)
    apply_river('r123', pts_123, resample_q(rmap['r123']['q_m3s'], len(pts_123)),
                monotonic_beds(En, pts_123, floor_m=2421.5, step_min=6.0, cut_m=1.5),
                to_obj={'lake_m': 2420, 'through': True, 'at_px': [602.0, 734.5]}, setts=[])

    pts_092 = snap_dry_outside_lakes([(542.0, 750.0), (549.5, 756.5), (555.5, 762.5), (560.0, 766.5)])
    carve_thalweg_descent(pts_092)
    apply_river('r092', pts_092, resample_q(rmap['r092']['q_m3s'], len(pts_092)),
                monotonic_beds(En, pts_092, floor_m=2361.5, step_min=6.0, cut_m=1.5),
                to_obj={'lake_m': 2360, 'through': True, 'at_px': [563.0, 768.0]}, setts=['Footfall'])

    pts_382 = snap_dry_outside_lakes([(550.0, 783.0), (555.5, 781.0), (560.0, 779.5)])
    carve_thalweg_descent(pts_382)
    apply_river('r382', pts_382, resample_q(rmap['r382']['q_m3s'], len(pts_382)),
                monotonic_beds(En, pts_382, floor_m=2361.5, step_min=6.0, cut_m=1.5),
                to_obj={'lake_m': 2360, 'through': True, 'at_px': [563.5, 778.5]})

    pts_282 = snap_dry_outside_lakes([(550.0, 825.0), (556.5, 829.0), (563.0, 833.0), (568.0, 835.5)])
    carve_thalweg_descent(pts_282)
    apply_river('r282', pts_282, resample_q(rmap['r282']['q_m3s'], len(pts_282)),
                monotonic_beds(En, pts_282, floor_m=2221.5, step_min=6.0, cut_m=1.5),
                to_obj={'lake_m': 2220, 'through': True, 'at_px': [571.0, 835.5]})

    r408 = rmap['r408']
    pts_408 = snap_dry_outside_lakes([tuple(p) for p in r408['px'][3:]])
    carve_thalweg_descent(pts_408[:3])
    hb_408 = monotonic_beds(En, pts_408[:3], floor_m=r408['bed_m'][5], step_min=4.0, cut_m=1.5)
    beds_408 = hb_408[:2] + [round(float(b), 1) for b in r408['bed_m'][5:]]
    for k in range(1, len(beds_408)):
        beds_408[k] = min(beds_408[k], round(beds_408[k - 1] - 0.1, 1))
    apply_river('r408', pts_408, resample_q(r408['q_m3s'][3:], len(pts_408)), beds_408, to_obj=r408['to'])

    r312 = rmap['r312']
    pts_312 = snap_dry_outside_lakes([tuple(p) for p in r312['px'][2:]])
    carve_thalweg_descent(pts_312[:3])
    beds_312 = [round(min(bil(En, pts_312[0][0], pts_312[0][1]) - 1.5, r312['bed_m'][2]), 1)] + [round(float(b), 1) for b in r312['bed_m'][3:]]
    for k in range(1, len(beds_312)):
        beds_312[k] = min(beds_312[k], round(beds_312[k - 1] - 0.1, 1))
    apply_river('r312', pts_312, resample_q(r312['q_m3s'][2:], len(pts_312)), beds_312, to_obj=r312['to'])

    # 9) Add 9 Sinuous Glacier-Fed Alpine U-Valley & Jura-Foot Rivers!
    NEW_ALPINE_RIVERS = [
        ('r_ir_urner_reuss', 'Urner-Älva', 2420, [614.0, 771.0],
         [(606.5, 795.0), (609.5, 788.5), (611.8, 782.5), (613.5, 777.0), (614.0, 773.5)], 68.0, None),
        ('r_ir_ostrhin', 'Östrhin-Älva', 2260, [616.0, 684.0],
         [(635.0, 688.5), (629.5, 686.8), (624.5, 685.5), (620.0, 684.8)], 92.0, None),
        ('r_ir_lauter', 'Vitbäck (Lauter-Älva)', 2220, [580.0, 825.0],
         [(597.0, 834.5), (591.5, 831.2), (586.5, 828.5), (582.0, 826.2)], 54.0, None),
        ('r_ir_engadin', 'Malm-Älva (Upper Inn)', 2880, [671.0, 653.0],
         [(688.0, 622.0), (683.5, 630.5), (679.0, 639.0), (675.0, 646.5), (672.5, 651.2)], 62.0, None),
        ('r_ir_bregaglia', 'Stålbäck', 2580, [613.5, 855.5],
         [(611.0, 845.0), (612.0, 849.0), (613.0, 852.5)], 42.0, None),
        ('r_ir_aletsch', 'Isbäck (Storglaciär)', 2360, [575.0, 790.0],
         [(596.0, 782.0), (590.5, 785.0), (585.0, 787.8), (579.5, 789.5)], 58.0, None),
        ('r_ir_glaive', 'Korsbäck', 2420, [600.0, 725.0],
         [(596.5, 709.0), (597.5, 714.0), (598.5, 718.0), (599.2, 721.5)], 34.0, None),
        ('r_ir_nordjura', 'Jurabäck', 2260, [603.5, 679.5],
         [(603.0, 671.0), (603.2, 674.5), (603.4, 677.5)], 36.0, None),
        ('r_ir_zihl', 'Jura-Älva (Zihl-Aare)', 2260, [583.0, 689.0],
         [(585.0, 704.0), (584.2, 699.5), (583.5, 695.0), (583.2, 691.5)], 64.0,
         {'lake': 'Jurasjö', 'lake_m': 2320, 'at_px': [585.0, 704.0]}),
    ]
    for nrid, nrname, nlev, nat_px, raw_pts, nq, nfrom in NEW_ALPINE_RIVERS:
        npts = snap_dry_outside_lakes(raw_pts)
        carve_thalweg_descent(npts)
        h_m = 2318.5 if nfrom is not None else None
        nbeds = monotonic_beds(En, npts, head_m=h_m, floor_m=nlev + 1.5, step_min=8.0, cut_m=1.2)
        nqs = [round(nq * (0.85 + 0.15 * i / max(1, len(npts) - 1)), 1) for i in range(len(npts))] if nfrom else [
            round(nq * (0.25 + 0.75 * i / max(1, len(npts) - 1)), 1) for i in range(len(npts))
        ]
        nrec = {
            'id': nrid, 'name': nrname, 'kind': 'river', 'perennial': True, 'order': 3 if nfrom else 2,
            'length_km': poly_len_km(npts), 'catchment_km2': int(nq * 42), 'q_mouth_m3s': nq,
            'source_m': nbeds[0], 'mouth_m': nbeds[-1], 'region': 'The Iron Republic',
            'to': {'lake_m': nlev, 'through': True, 'at_px': nat_px}, 'settlements': [],
            'px': [[round(x, 2), round(y, 2)] for x, y in npts], 'bed_m': nbeds, 'q_m3s': nqs,
            'width_m': round(12.0 + 0.35 * nq, 1), 'depth_m': 2.4, 'tongue': 'hajlandsk',
        }
        if nfrom is not None:
            nrec['from'] = nfrom
        D['rivers'].append(nrec)
        rmap[nrid] = nrec
        r_rep[nrid] = {'name': nrname, 'n': len(npts), 'q': nq}

    # Ensure every single river touching pure_ir has monotonic bed_m and <= 15 m dry ground climb!
    for _ in range(3):
        for rv in D['rivers']:
            pts_c = rv.get('px') or []
            if not any(0 <= int(round(p[1])) < En.shape[0] and 0 <= int(round(p[0])) < En.shape[1] and pure_ir[int(round(p[1])), int(round(p[0]))] for p in pts_c):
                continue
            bm = rv.get('bed_m') or []
            for k in range(1, len(bm)):
                if bm[k] > bm[k - 1]:
                    bm[k] = bm[k - 1]
            if bm:
                rv['source_m'] = bm[0]
                if 'mouth_m' in rv:
                    rv['mouth_m'] = bm[-1]
            carve_thalweg_descent(pts_c, max_climb=12.0)

    kept_outlets = [
        o for o in D.get('outlets', [])
        if o.get('name') != 'Iron Republic lake outlet'
        and not any(o.get('from') == lk['name'] for lk in LAKES)
    ]
    outlet_specs = [
        ('Roketsjö outlet (Silvr Bruk)', 'Roketsjö', 'Korsvatn', 'r051', 2860),
        ('Korsvatn outlet (Kors-Strömmen)', 'Korsvatn', 'Glasklar-Sjö', 'r_ir_korssund', 2420),
        ('Glasklar-Sjö outlet (Blak Bruk)', 'Glasklar-Sjö', 'Kaskejt-Sjö', 'r010', 2360),
        ('Kaskejt-Sjö outlet (Kaskejt Rivr)', 'Kaskejt-Sjö', "western lake (Ancient's Valley)", 'r004', 2220),
        ('Nordsjö outlet (Hōng-Mā)', 'Nordsjö', 'NW lowlands lake', 'r014', 2260),
        ('Stålsjö outlet (Frost Rivr)', 'Stålsjö', 'Kaskejt Rivr', 'r281', 2580),
        ('Malmtjärn outlet (Nīla-āṟu)', 'Malmtjärn', "Jimjam's lake", 'r027', 2880),
        ('Jurasjö outlet (Jura-Älva)', 'Jurasjö', 'Nordsjö', 'r_ir_zihl', 2320),
    ]
    new_outlets = []
    for oname, ofrom, oto, orid, olev in outlet_specs:
        rv = rmap[orid]
        new_outlets.append({
            'name': oname, 'from': ofrom, 'to': oto,
            'px': [list(p) for p in rv['px']],
            'bed_m': [int(round(v)) for v in rv['bed_m']],
            'lake_level_m': int(olev),
        })
    D['outlets'] = kept_outlets + new_outlets
    paint_paths = [rmap[rid]['px'] for rid in ('r051', 'r_ir_korssund', 'r010', 'r004', 'r014', 'r281', 'r027', 'r_ir_zihl',
                                               'r_ir_urner_reuss', 'r_ir_ostrhin', 'r_ir_lauter', 'r_ir_engadin', 'r_ir_aletsch')]
    return r_rep, paint_paths


def main():
    D = P.load()
    Eo_live, water_live = P.heights(D)
    whas_live, wlev_live = P.water_levels(D)
    OH, OW = Eo_live.shape
    yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float64)
    codes = [c['code'] for c in D['climate']['classes']]

    L_KEYS = ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc')
    raw0 = {k: P.raster(D, k, 'L' if k in L_KEYS else 'RGB') for k in ('h', 'wl', 'wd', 'st', 't', 'rt', 'ct') + L_KEYS}

    # Load clean pre-edit_520 (`7dcfa8a5f`) rasters & rivers so inside `pure_ir` we sculpt on pristine 5.1 ground!
    h7 = load_git_raster(BASE_COMMIT, 'tools/scale-model/model/data/h.png', 'RGB')
    wl7 = load_git_raster(BASE_COMMIT, 'tools/scale-model/model/data/wl.png', 'RGB')
    E7 = D['lo'] + ((h7[..., 0].astype(np.int64) << 8) | h7[..., 1]) / 65535.0 * (D['hi'] - D['lo'])
    whas7 = wl7[..., 2] > 127
    wlev7 = np.where(whas7, D['lo'] + ((wl7[..., 0].astype(np.int64) << 8) | wl7[..., 1]) / 65535.0 * (D['hi'] - D['lo']), np.nan)
    raw7 = {
        k: load_git_raster(BASE_COMMIT, f'tools/scale-model/model/data/{k}.' + ('jpg' if k in ('st', 't', 'rt', 'ct') else 'png'),
                           'L' if k in L_KEYS else 'RGB')
        for k in ('st', 't', 'rt', 'ct') + L_KEYS
    }
    rivers7 = json.loads(subprocess.check_output(['git', 'show', f'{BASE_COMMIT}:tools/scale-model/model/data/rivers.json'], cwd=ROOT))

    # ---- 1. Strict Political Safety Envelope: `pure_ir` ----
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
    env_w = G.sstep(2.0, 8.5, dist_out_px)
    # Organic scalloped foothill taper for massif uplift so NO ridge ever clips along a straight political edge!
    env_massif = G.sstep(3.5, 16.0, dist_out_px + 3.8 * fbm2d(xx, yy, 11.0, octaves=3, seed=211)) * G.sstep(1.5, 4.5, dist_out_px)

    # Start from live `5.1e23` outside `pure_ir`, and clean `7dcfa8a5f` inside `pure_ir`!
    Eo = np.where(pure_ir, E7, Eo_live)
    water0 = np.where(pure_ir, h7[..., 2] > 127, water_live)
    whas0 = np.where(pure_ir, whas7, whas_live)
    wlev0 = np.where(pure_ir, wlev7, wlev_live)

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
    whas2[old_interior_lakes] = False
    wlev2[old_interior_lakes] = np.nan

    # ---- 2. Domain-Warped Ridged Multifractal Alpine Uplift & Cirque Horns ----
    wx = xx + 6.5 * fbm2d(xx, yy, 26.0, octaves=3, seed=17)
    wy = yy + 6.5 * fbm2d(xx, yy, 26.0, octaves=3, seed=53)
    # Anisotropic NNE-SSW (29 deg) tectonic strike + transverse glacial spur ribs
    ang = math.radians(29.0)
    u_str = wx * math.cos(ang) + wy * math.sin(ang)
    v_str = -wx * math.sin(ang) + wy * math.cos(ang)

    arete_hi = 0.68 * ridged_mf(wx, wy, 12.5, octaves=5, seed=307) + 0.32 * ridged_mf(xx, yy, 5.2, octaves=3, seed=389)
    spur_ribs = ridged_mf(u_str * 1.45, v_str * 0.68, 8.2, octaves=4, seed=613)
    # Deep amphitheatre cirques biting into massif flanks between sharp pyramidal horns
    cirque_bite = np.maximum(0.0, 0.62 - ridged_mf(wx, wy, 6.6, octaves=3, seed=829)) * 920.0

    # Lift old drained saucer floor to natural Mittelland / Prealpine base before massif & trough sculpting
    mittelland_base = 2860.0 + 380.0 * fbm2d(wx, wy, 18.0, octaves=4, seed=401) + 340.0 * spur_ribs
    En = np.where(old_interior_lakes, np.maximum(En, mittelland_base), En)
    # Add Prealpine spur relief on mid-altitude hills without double-stacking onto existing > 5,000 m ranges!
    prealp_taper = G.sstep(2350.0, 3250.0, En) * (1.0 - G.sstep(4500.0, 5600.0, En))
    En = En + (460.0 * arete_hi + 290.0 * spur_ribs) * env_massif * prealp_taper

    # Sculpt the 12 Interlocking Glaciated Massif Chains & Spurs (culminating horns 6,800 - 7,450 m!)
    for mid, mname, mgloss, mctrl in MASSIFS:
        d_m, hw_m, crest_m, s_m = poly_profile(wx, wy, mctrl)
        end_t = G.sstep(0.0, 0.12, s_m) * G.sstep(0.0, 0.12, 1.0 - s_m)
        u_d = np.clip(d_m / np.maximum(hw_m, 1.0), 0.0, 1.6)
        horn_prof = np.clip(1.0 - (u_d ** 1.38), 0.0, 1.0) ** 1.32
        spur_ext = np.clip(1.0 - (u_d / 1.48) ** 1.75, 0.0, 1.0) * spur_ribs * 860.0
        peak_detail = (640.0 * arete_hi + 280.0 * spur_ribs - cirque_bite * G.sstep(0.14, 0.60, u_d))
        target_m = (crest_m - 480.0 * (1.0 - end_t)) + peak_detail * (0.42 + 0.58 * horn_prof) + spur_ext
        w_m = np.clip(horn_prof * 1.06 + 0.36 * np.clip(1.0 - u_d / 1.38, 0.0, 1.0) * spur_ribs, 0.0, 1.0) * (0.60 + 0.40 * end_t) * env_massif
        En = np.where(w_m > 0.005, np.maximum(En, En * (1.0 - w_m) + target_m * w_m), En)

    # ---- 3. Carve the Dendritic Glacial U-Valley Network (Valleys First -> Flood Lakes Naturally!) ----
    vx_w = xx + 1.35 * fbm2d(xx, yy, 6.2, octaves=3, seed=733)
    vy_w = yy + 1.35 * fbm2d(xx, yy, 6.2, octaves=3, seed=947)
    for vid, vctrl, v_exp in GLACIAL_TROUGHS:
        d_v, hw_v, bed_v, _ = poly_profile(vx_w, vy_w, vctrl)
        hw_eff = hw_v * np.clip(1.0 + 0.28 * vnoise2d(xx, yy, 6.8, 519) - 0.22 * spur_ribs, 0.58, 1.42)
        wall_reach = hw_eff * 2.55
        in_v = (d_v < wall_reach) & (dist_out_px >= 2.2)
        u_v = d_v / np.maximum(hw_eff, 0.8)
        wall_h = bed_v + 440.0 * (u_v ** v_exp) + 620.0 * np.maximum(0.0, u_v - 0.95) ** 1.55 + 240.0 * spur_ribs * np.clip(u_v - 0.55, 0.0, 1.5)
        blend_v = (1.0 - G.sstep(hw_eff * 0.95, wall_reach, d_v)) * env_w
        carved = En * (1.0 - blend_v) + np.minimum(En, wall_h) * blend_v
        En = np.where(in_v, np.minimum(En, carved), En)

    # Carve the 6 Domain-Warped High Alpine Cols (gentle saddles, ZERO straight trenches!)
    for pid, pname, pgloss, spx, pctrl in PASSES:
        d_p, hw_p, sad_m, _ = poly_profile(vx_w, vy_w, pctrl)
        w_p = (1.0 - G.sstep(hw_p * 0.35, hw_p * 1.55, d_p)) * env_w * 0.78
        En = np.where((w_p > 0.01) & (En > sad_m), En * (1.0 - w_p) + sad_m * w_p, En)

    # Prograde Tributary Alluvial Fans & Moraine Spits (Interlaken Bödeli, Rapperswil, Nasen, Bodanrück, Engadin, Biel!)
    for fcx, fcy, frad, fh_m in ALLUVIAL_FANS:
        df = np.hypot(xx - fcx, yy - fcy)
        wf = (1.0 - G.sstep(0.0, frad, df)) * env_w
        fan_cone = fh_m - 45.0 * (df / frad) ** 1.4 + 18.0 * vnoise2d(xx, yy, 2.5, 331)
        En = np.where((wf > 0.01) & (dist_out_px >= 2.5), np.maximum(En, En * (1.0 - wf) + fan_cone * wf), En)

    # ---- 4. Flood the 8 Stepped Swiss Glacial Lakes Naturally by Topography (`En < wlev_m`)! ----
    lake_masks = {}
    all_new_lakes = np.zeros((OH, OW), dtype=bool)
    for lk in LAKES:
        wl_m = lk['wlev_m']
        cand = (En < wl_m - 3.0) & pure_ir & (dist_out_px >= 2.5) & (~all_new_lakes)
        lmask = extract_connected_lake(cand, lk['seed_px'], lk['box'])
        assert int(lmask.sum()) >= 25, f"Lake {lk['id']} too small ({int(lmask.sum())} cells)"

        dist_in = nd.distance_transform_edt(lmask)
        max_di = max(float(dist_in.max()), 1.0)
        dep_norm = np.clip(dist_in / max_di, 0.0, 1.0) ** 0.85
        natural_bed = wl_m - 26.0 - (lk['max_depth_m'] - 26.0) * dep_norm - 22.0 * np.abs(vnoise2d(xx, yy, 3.5, 777))
        En[lmask] = natural_bed[lmask]
        whas2[lmask] = True
        wlev2[lmask] = wl_m

        shore1 = nd.binary_dilation(lmask, structure=np.ones((3, 3), dtype=bool)) & (~lmask) & (~all_new_lakes) & pure_ir
        En[shore1] = np.maximum(En[shore1], wl_m + 18.0 + 22.0 * np.abs(vnoise2d(xx[shore1], yy[shore1], 3.0, 419)))
        lake_masks[lk['id']] = lmask
        all_new_lakes |= lmask

    # ---- 5. Carve Monotonic Spillway Cataracts & Settlement Shore Benches ----
    def carve_cataracts():
        cat_cells = np.zeros((OH, OW), dtype=bool)
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
                if pure_ir[iy, ix] and dist_out_px[iy, ix] >= 2.2:
                    dry_chain.append((ix, iy))
            n_d = max(len(dry_chain) - 1, 1)
            for idx_d, (ix, iy) in enumerate(dry_chain):
                bed_t = sill_m if idx_d == 0 else sill_m + (tail_m - sill_m) * (idx_d / n_d)
                En[iy, ix] = bed_t if idx_d == 0 else min(En[iy, ix], bed_t)
                cat_cells[iy, ix] = True
        return cat_cells

    cataract_cells = carve_cataracts()

    for bname, (bx, by), bh in BENCH_SITES:
        if whas2[by, bx]:
            whas2[by, bx] = False
            wlev2[by, bx] = np.nan
            for lk in LAKES:
                lake_masks[lk['id']][by, bx] = False
            all_new_lakes[by, bx] = False
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                yy_, xx_ = by + dy, bx + dx
                if pure_ir[yy_, xx_] and dist_out_px[yy_, xx_] >= 2.2 and not whas2[yy_, xx_] and not cataract_cells[yy_, xx_]:
                    w_b = 0.85 if (dx == 0 and dy == 0) else 0.45
                    En[yy_, xx_] = En[yy_, xx_] * (1.0 - w_b) + (bh + 8.0 * (abs(dx) + abs(dy))) * w_b
                    for lk in LAKES:
                        if nd.binary_dilation(lake_masks[lk['id']], structure=np.ones((3, 3), dtype=bool))[yy_, xx_]:
                            En[yy_, xx_] = max(En[yy_, xx_], lk['wlev_m'] + 16.0)

    # ---- 6. Depression-Fill Unintended Dry-Land Pits Inside `pure_ir` & Re-Verify Sills ----
    S0 = np.where(whas0, np.fmax(Eo, np.nan_to_num(wlev0, nan=-1e9)), Eo)
    pit0, _ = pits_in_box(S0, IR_BOX)
    old_land_pit = pit0 & (~whas0)
    for _ in range(10):
        S2 = np.where(whas2, np.fmax(En, np.nan_to_num(wlev2, nan=-1e9)), En)
        pit1, F1 = pits_in_box(S2, IR_BOX)
        new_pits = pit1 & (~old_land_pit) & (~whas2) & pure_ir
        if not new_pits.any():
            break
        En[new_pits] = F1[new_pits] + 0.05

    cataract_cells = carve_cataracts()
    for lk in LAKES:
        lmask = lake_masks[lk['id']]
        shore_ring = nd.binary_dilation(lmask, structure=np.ones((3, 3), dtype=bool)) & (~lmask) & (~whas2) & (~cataract_cells)
        low_shore = shore_ring & (En < lk['wlev_m'] + 14.0) & pure_ir
        En[low_shore] = lk['wlev_m'] + 14.0

    for _ in range(10):
        S2 = np.where(whas2, np.fmax(En, np.nan_to_num(wlev2, nan=-1e9)), En)
        pit1, F1 = pits_in_box(S2, IR_BOX)
        new_pits = pit1 & (~old_land_pit) & (~whas2) & pure_ir
        if not new_pits.any():
            break
        En[new_pits] = F1[new_pits] + 0.05

    water2 = water0.copy()
    water2[pure_ir] = whas2[pure_ir]

    assert float(np.abs(En[~pure_ir] - Eo_live[~pure_ir]).max()) == 0.0, 'En changed outside pure_ir!'
    assert not (whas2[~pure_ir] != whas_live[~pure_ir]).any(), 'whas2 changed outside pure_ir!'

    # ---- 7. Update Rivers & Outlets (Before Encoding `h` so Thalweg Descents Are Baked!) ----
    rivers_rep, paint_river_paths = update_rivers_and_outlets(D, rivers7, En, whas2, pure_ir, dist_out_px, lake_masks)

    # Re-run fast pit-fill if any river thalweg nibble created a 1-px micro-sink
    for _ in range(6):
        S2 = np.where(whas2, np.fmax(En, np.nan_to_num(wlev2, nan=-1e9)), En)
        pit1, F1 = pits_in_box(S2, IR_BOX)
        new_pits = pit1 & (~old_land_pit) & (~whas2) & pure_ir
        if not new_pits.any():
            break
        En[new_pits] = F1[new_pits] + 0.05

    # ---- 8. Climate, Temperature Lapse, & Native-Matched Swiss Relief/Satellite Painting ----
    D_base = dict(D)
    for k in L_KEYS + ('rt', 'ct'):
        arr_m = raw0[k].copy()
        arr_m[pure_ir] = raw7[k][pure_ir]
        if k in ('rt', 'ct'):
            D_base[k] = P.jpeg_like(D, k, arr_m)
        else:
            D_base[k] = P.b64(Image.fromarray(arr_m, 'L'), optimize=True)

    lap = C.lapse(D_base, Eo, En, whas0, wlev0, whas2=whas2, wlev2=wlev2)
    T = {k: P.raster({'x': lap[k]}, 'x', 'L').astype(float) - 90.0 for k in C.TEMPS}

    to_land = old_interior_lakes & (~whas2)
    to_water = all_new_lakes & (~whas0)
    pool_t = pure_ir & (~whas0) & (~whas2) & (T['tm'] > -89.0)
    py_t, px_t = np.nonzero(pool_t)
    ty_t, tx_t = np.nonzero(to_land)
    ft_t = lambda X, Y, H: np.stack([X / 40.0, Y / 40.0, H / 350.0], axis=1)
    dk_t, ik_t = cKDTree(ft_t(px_t, py_t, En[pool_t])).query(ft_t(tx_t, ty_t, En[to_land]), k=12)
    wk_t = 1.0 / (dk_t + 0.25)

    kept_water = old_interior_lakes & all_new_lakes
    for k in C.TEMPS:
        vals = T[k][pool_t]
        T[k][to_land] = np.round((vals[ik_t] * wk_t).sum(1) / wk_t.sum(1))
        base_w_temp = float(np.median(raw7[k][kept_water].astype(float) - 90.0)) if kept_water.any() else 8.0
        for lk in LAKES:
            lm_new = lake_masks[lk['id']] & to_water
            if lm_new.any():
                T[k][lm_new] = np.round(base_w_temp - C.LAPSE_C_PER_KM * (lk['wlev_m'] - 2400.0) / 1000.0)
    land_ir = pure_ir & (~whas2) & (T['tm'] > -89.0)
    T['th'][land_ir] = np.maximum(T['th'][land_ir], T['tw'][land_ir])
    T['tl'][land_ir] = np.minimum(T['tl'][land_ir], T['tc'][land_ir])
    for k in C.TEMPS:
        T_u8 = np.clip(T[k] + 90.0, 0, 255).astype(np.uint8)
        T_u8[~pure_ir] = raw0[k][~pure_ir]
        D[k] = P.b64(Image.fromarray(T_u8, 'L'), optimize=True)
        D_base[k] = D[k]

    rain2, cls2, zon2, _, crep = C.reclimate(D_base, Eo, En, whas2, all_new_lakes)
    rain7 = raw7['p'].astype(float) / 255.0 * 4000.0
    rain2[to_water] = float(np.median(rain7[old_interior_lakes]))
    cls2[all_new_lakes] = codes.index('WH')
    zon2[all_new_lakes] = int(np.bincount(raw7['z'][old_interior_lakes]).argmax())

    p_u8 = np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8)
    p_u8[~pure_ir] = raw0['p'][~pure_ir]
    cls2 = cls2.astype(np.uint8)
    cls2[~pure_ir] = raw0['c'][~pure_ir]
    zon2 = zon2.astype(np.uint8)
    zon2[~pure_ir] = raw0['z'][~pure_ir]

    D['h'] = P.encode_heights(D, En, water2)
    h_now = P.raster(D, 'h')
    h_now[~pure_ir] = raw0['h'][~pure_ir]
    D['h'] = P.b64(Image.fromarray(h_now, 'RGB'), optimize=True)

    D['wl'] = P.encode_levels(D, whas2, np.nan_to_num(wlev2, nan=D['lo']))
    wl_now = P.raster(D, 'wl')
    wl_now[~pure_ir] = raw0['wl'][~pure_ir]
    D['wl'] = P.b64(Image.fromarray(wl_now, 'RGB'), optimize=True)

    D['p'] = P.b64(Image.fromarray(p_u8, 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2, 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2, 'L'), optimize=True)

    rain_now = P.raster(D, 'p', 'L').astype(float) / 255.0 * 4000.0
    cnow = P.raster(D, 'c', 'L')

    D['rt'] = PA.repaint(D_base, 'rt', PA.ramp(rain7), PA.ramp(rain_now), (np.abs(rain_now - rain7) > 1.0) & pure_ir)
    col_c = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    D['ct'] = PA.repaint(D_base, 'ct', col_c[raw7['c']], col_c[cnow], (cnow != raw7['c']) & pure_ir)
    for k in ('rt', 'ct'):
        arr_k = P.raster(D, k)
        arr_k[~pure_ir] = raw0[k][~pure_ir]
        D[k] = P.jpeg_like(D, k, arr_k)

    # Paint Swisstopo-grade `st` and `t` inside pure_ir calibrated to `7dcfa8a5f`
    paint_swiss_maps(D, raw0, raw7, E7, En, whas2, pure_ir, dist_out_px, all_new_lakes, lake_masks, arete_hi, spur_ribs, paint_river_paths)

    # ---- 9. Update `basins.json` & `climate.present` ----
    kept_basins = [
        b for b in D.get('basins', [])
        if b.get('region') != IR_ID
        and not (0 <= int(round(b['at_px'][1])) < OH and 0 <= int(round(b['at_px'][0])) < OW and old_interior_lakes[int(round(b['at_px'][1])), int(round(b['at_px'][0]))])
    ]
    new_basins = []
    lake_summary = []
    tot_lake_km2 = 0
    for lk in LAKES:
        lid = lk['id']
        lm = lake_masks[lid]
        ly, lx = np.nonzero(lm)
        sx0, sy0 = lk['seed_px']
        k_best = int(np.argmin(np.hypot(lx - sx0, ly - sy0)))
        at_px = [round(float(lx[k_best]), 1), round(float(ly[k_best]), 1)]
        shore = nd.binary_dilation(lm, structure=np.ones((3, 3), dtype=bool)) & (~lm) & (~whas2)
        dom_clim = codes[int(np.bincount(cnow[shore]).argmax())]
        deps = lk['wlev_m'] - En[lm]
        km2 = int(lm.sum()) * 4
        tot_lake_km2 += km2
        head_m = lk['wlev_m'] - lk['drop_to_m']
        new_basins.append({
            'id': lid, 'name': lk['name'], 'at_px': at_px,
            'level_m': int(round(lk['wlev_m'])), 'km2': km2,
            'depth_m': int(round(float(deps.max()))), 'spill_m': int(round(lk['wlev_m'] - 1.5)),
            'kind': 'through lake', 'climate': dom_clim, 'region': IR_ID,
            'notes': f"Glaciated Alpine fjord/valley lake ({lk['analogue']}): outflow via {lk['out_river']} ({lk['q_m3s']} m3/s, {int(round(head_m))} m head) to {lk['to_label']}.",
        })
        lake_summary.append({'id': lid, 'name': lk['name'], 'km2': km2, 'cells': int(lm.sum()), 'max_depth_m': round(float(deps.max()), 1)})
    D['basins'] = kept_basins + new_basins

    dc = Counter(cnow.ravel().tolist())
    for pr in D['climate']['present']:
        k = codes.index(pr['code'])
        pr['km2'] = int(dc.get(k, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(k, 0) / cnow.size, 2)

    # Verify all 9 Republican settlement pins stand on dry ground inside pure_ir!
    for s in P.settlements():
        if s.get('polity') == 'Iron Republic' or s['name'] in ('Roketstad', 'Cascade', 'Footfall', 'Lipp', 'Glaive', 'Stahlborn', 'Urverkstad', 'Slussport', 'Korshamn'):
            ix, iy = int(round(s['px'])), int(round(s['py']))
            if pure_ir[iy, ix]:
                assert not whas2[iy, ix], f"Pin {s['name']} ({ix},{iy}) is wet!"

    rep = {
        'edit': '5.1e20 v2: Mega-Switzerland Glaciated Cordillera, Dendritic U-Valleys & Natural Flooded Fjord Lakes',
        'pure_ir_km2': int(pure_ir.sum()) * 4,
        'peak_max_m': round(float(En[pure_ir].max()), 1),
        'snow_cells_gt_5400m': int(((En > 5400.0) & pure_ir).sum()),
        'total_lake_km2': tot_lake_km2,
        'lakes': lake_summary,
        'rivers_updated_count': len(rivers_rep),
    }

    if not DRY:
        P.save(D)
        with open(os.path.join(HERE, 'edit_520_republic_alps.report.json'), 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(rep, fh, indent=2, ensure_ascii=False)
            fh.write('\n')
    print(json.dumps(rep, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
