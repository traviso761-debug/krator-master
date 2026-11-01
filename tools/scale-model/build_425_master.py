#!/usr/bin/env python3
"""Scale Model 4.25 Master Build — Complete Planetary Integration:
  1. Unified 2 km/cell (`su = 1.0, sv = 1.0`) Height Grid & N/W Canvas Expansion (`1549x1393` -> `1821x1723`, `DX = 272, DY = 330`):
     - Ria River Valley (`rmvriavalley`) & Eastern Highland Lake (`+1,460.0 m`, `WH`)
     - Great Double Delta (`rmvdoubledelta`, `0.0 m` distributaries & `+2..+14 m` silt-and-peat islands)
     - Arachnoid Canyons & Northern Korona Scenic Gorge (`rmvarachnoids`, *The Web-Cleaver Gorge*)
     - The Arch (`rmvthearch`) & Explosive Submarine Seamounts (`rmvseamounts`)
     - The Crook (`rmvthecrook`) & Southern Copper Glacier / Copper Tarn (`rmvcopperglacier`, `+2,380.0 m`, `WH`)
     - NE Tharn Cold-Dry Uplands (`rmvtharnuplands`, `+4,600..+6,300 m`) & North-Central Glaciated Shield Massif
  2. Interior Enhancement Passes (Executed on `1549x1393` at `2 km/cell` before N/W expansion):
     - Keep Completed 5-Region SE Complex (`Region 99`, `Siphon Pits`, `Mid Basin`, `Stalker Gate`, `High Rift`)
     - Volcano & Lava Tube Pass (`smodel/volcanoes.py`): `Throne/Volcano`, `Lesser Throne`, `Godthrone` + `Godstep Valley`,
       plus the Twin Catch/Xanadu Stratovolcanoes (`vents[2]` at `716, 1128` and `vents[3]` at `770, 1168`),
       10 Subterranean Lava Tube & Cavern Systems (`tubes.json` / `bTubes`), and 3 Zeijani Cavern Settlements.
     - East Abyss & The Bowl Shiveria Pass (`smodel/east_abyss.py`): Failed Continental Rift (Aulacogen),
       5 en-echelon master faults, stepped East Rim savanna benches (`XV`, `BSh`, `Aw`), 23 recessed Shiveria
       cataract gorges + canyon-mouth megafans (`XA`), Messinian evaporite bull's-eye salt pans (`XW`, `XS`, `WX`),
       preserving Mungo, Verge, Locus, Reed, Furrow, and Mantis.
     - Tier-1 Biomes Geomorphological Pass (`smodel/tier1_biomes.py`): `k-Guilin` karst *fengcong* & *poljes*,
       `SW Highlands` Appalachian/Zagros `ringfold` ridges + Span tableland + Sarez landslide lake (`+2,878 m`),
       `W Outer Wall` listric slump benches + sag ponds + sturzstrom lobes + loess *yuan* canyons,
       `The Cut` geometric eigenweapon chord slice + `+666 m` sill, and `Korona / NE` quartzite tepuis & chasms.
  3. Automated Settlement Audit & Snap (`<= 50 km` / `<= 25 px`):
     - Shifts all vector stores by `(+272, +330)`, audits all settlements against water/cliff/elevation rules,
       automatically snaps any settlement within `<= 25 px` (`50 km`) to a topographically/climatologically
       appropriate cell if needed, and writes a complete audit report.
"""
import base64
import copy
import io
import json
import math
import os
import re
import shutil
import subprocess
import sys
import time

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)

import smodel.page as P          # noqa: E402
import smodel.geom as G          # noqa: E402
import smodel.terrain as T       # noqa: E402
import smodel.climate as C       # noqa: E402
import smodel.paint as PA        # noqa: E402
import smodel.volcanoes as VOLC          # noqa: E402
import smodel.east_abyss as EA           # noqa: E402
import smodel.tier1_biomes as T1         # noqa: E402
import smodel.tranche2_biomes as T2      # noqa: E402
import smodel.tranche3_biomes as T3      # noqa: E402
import smodel.biome_transitions as BT    # noqa: E402
import smodel.river_names as RN          # noqa: E402
import smodel.nw_expansion as NW         # noqa: E402

DX = 272
DY = 330
OLD_OH, OLD_OW = 1393, 1549
NEW_OH, NEW_OW = 1723, 1821
SEED = 425


def compute_clean_hillshade(E, zf=5.0, az_deg=315.0, alt_deg=45.0):
    """Compute crisp Lambertian hillshade normalized around 1.0 from `E` at `2 km/px`."""
    gy, gx = np.gradient(E / 1000.0 * zf, 2.0)
    az = math.radians(az_deg)
    alt = math.radians(alt_deg)
    lx = math.cos(alt) * math.sin(az)
    ly = -math.cos(alt) * math.cos(az)
    lz = math.sin(alt)
    lam = (-gx * lx - gy * ly + lz) / np.sqrt(gx * gx + gy * gy + 1.0)
    lam_mean = nd.uniform_filter(lam, size=25)
    shade = np.clip(1.0 + 1.48 * (lam - lam_mean), 0.42, 1.62)
    return shade[..., None]


def build_hypsometric_table(EoF, wet0F, t0_f):
    """Fit the map's hypsometric relief colors `(R, G, B)` as a function of elevation (m)."""
    land = ~wet0F
    bins = np.linspace(-2600.0, 12000.0, 147)
    centers, meds = [], []
    for a, b in zip(bins[:-1], bins[1:]):
        m = land & (EoF >= a) & (EoF < b)
        if m.sum() >= 60:
            centers.append(0.5 * (a + b))
            meds.append(np.median(t0_f[m], axis=0))
    return np.array(centers), np.array(meds)


def eval_hypso(EF, centers, meds):
    return np.stack([np.interp(EF, centers, meds[:, c]) for c in range(3)], axis=-1)


def shift_pt(pt, dx=DX, dy=DY):
    return [round(float(pt[0]) + dx, 2), round(float(pt[1]) + dy, 2)]


def shift_pts(pts, dx=DX, dy=DY):
    return [shift_pt(p, dx, dy) for p in pts]


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    t_start = time.time()
    print('=== Scale Model 5.1 Master Build (1821x1723 Unified 2 km/cell Grid + Tranches 1-3 + Boundary Transitions + 27-Tongue Rivers) ===')

    # Ensure expansion_ref.jpg is present
    ref_src = 'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc/.user_uploaded/media_1793494252884_beac5e73.jpg'
    ref_path = os.path.join(HERE, 'expansion_ref.jpg')
    if os.path.exists(ref_src) and not os.path.exists(ref_path):
        shutil.copy2(ref_src, ref_path)

    # Load D_old from model/data/ (if already expanded to 1821x1723 by a prior run, restore 1549x1393 baseline from commit eabeb2039)
    D_old = P.load()
    if (D_old['fullH'], D_old['fullW']) != (OLD_OH, OLD_OW):
        print('  Restoring 1549x1393 baseline data from commit eabeb2039 before running 5.1 master pipeline...')
        subprocess.check_call([
            'git', 'checkout', 'eabeb2039', '--',
            'tools/scale-model/model/data',
            'openworld/little-demo/source/regions.json',
            'openworld/little-demo/source/settlements.json',
            'tools/scale-model/model/src/51-region-store.js',
            'tools/scale-model/model/src/60-settlements.js',
        ], cwd=REPO_ROOT)
        D_old = P.load()
    OH0, OW0 = D_old['fullH'], D_old['fullW']
    assert (OH0, OW0) == (OLD_OH, OLD_OW), f'Expected D_old fullH/fullW = (1393, 1549), got {(OH0, OW0)}'

    # Read unshifted regions and settlements from openworld/little-demo/source/
    regs_json_path = os.path.join(REPO_ROOT, 'openworld', 'little-demo', 'source', 'regions.json')
    setts_json_path = os.path.join(REPO_ROOT, 'openworld', 'little-demo', 'source', 'settlements.json')
    regs_1393 = json.load(open(regs_json_path, encoding='utf-8'))
    setts_1393 = json.load(open(setts_json_path, encoding='utf-8'))

    # Also ensure the 4 new SE regions and 2 SE settlements from 51-region-store.js / 60-settlements.js are in regs_1393 / setts_1393
    reg_store_path = os.path.join(HERE, 'model', 'src', '51-region-store.js')
    reg_store_txt = open(reg_store_path, encoding='utf-8').read()
    m_def_regs = re.search(r'const defRegs = (\[.*?\]);', reg_store_txt, re.S)
    if m_def_regs:
        def_regs_list = json.loads(m_def_regs.group(1))
        known_rids = {r['id'] for r in regs_1393}
        for r in def_regs_list:
            if r['id'] not in known_rids:
                regs_1393.append(copy.deepcopy(r))
            else:
                # Use the updated polygon from 51-region-store.js
                for idx_r, rr in enumerate(regs_1393):
                    if rr['id'] == r['id']:
                        regs_1393[idx_r] = copy.deepcopy(r)
                        break

    sett_store_path = os.path.join(HERE, 'model', 'src', '60-settlements.js')
    sett_store_txt = open(sett_store_path, encoding='utf-8').read()
    m_def_setts = re.search(r'const defSetts = (\[.*?\]);', sett_store_txt, re.S)
    if m_def_setts:
        def_setts_list = json.loads(m_def_setts.group(1))
        known_sids = {s['id'] for s in setts_1393}
        for s in def_setts_list:
            if s['id'] not in known_sids:
                setts_1393.append(copy.deepcopy(s))
    for extra_s in [
        {"id": "sostrukhyuni01", "name": "Ostrukh-on-Water", "type": "village", "px": 1244, "py": 1141, "notes": "Yuni agricultural outpost on fresh Lake Ostrukh: terrace farming, qanats, and staging for Siphon Pit expeditions.", "createdAt": "2026-10-28T12:55:00.000Z"},
        {"id": "sloomspindle01", "name": "Spindle Fan", "type": "village", "px": 1289, "py": 810, "notes": "Yuni farming and spring outpost on the Weavers' Cradle piedmont fan: terraced crops supporting expeditions into the Loom-Chasms.", "createdAt": "2026-10-28T12:55:00.000Z"},
    ]:
        if not any(s['id'] == extra_s['id'] for s in setts_1393):
            setts_1393.append(copy.deepcopy(extra_s))

    # =========================================================================
    # STEP 1: Upsample Base Height & Water Grids to 1393x1549 (2 km/cell)
    # =========================================================================
    print('--- Step 1: Upsampling D_old height & water grids from (696, 774) to unified (1393, 1549) 2 km/cell ---')
    Eo_half, _ = P.heights(D_old)
    whas0_half, wlev0_half = P.water_levels(D_old)

    zoom_to_1393 = (OLD_OH / Eo_half.shape[0], OLD_OW / Eo_half.shape[1])
    Eo_1393 = nd.zoom(Eo_half, zoom_to_1393, order=1)[:OLD_OH, :OLD_OW]
    whas0_1393 = nd.zoom(whas0_half.astype(np.uint8), zoom_to_1393, order=0)[:OLD_OH, :OLD_OW].astype(bool)
    wlev_fill = np.where(whas0_half, np.nan_to_num(wlev0_half, nan=Eo_half), Eo_half)
    wlev_up = nd.zoom(wlev_fill, zoom_to_1393, order=1)[:OLD_OH, :OLD_OW]
    wlev0_1393 = np.where(whas0_1393, wlev_up, np.nan)

    # =========================================================================
    # STEP 2: Run the 6 Interior Enhancement Passes on (1393, 1549)
    # =========================================================================
    print('--- Step 2A: Volcano & Lava Tube Remodeling (Throne, Lesser Throne, Godthrone, Catch/Xanadu Twin Cones) ---')
    En1, whas1, wlev1, vents_1393, volc_1393, ch_volc = VOLC.remodel_volcanoes(
        Eo_1393, whas0_1393, np.nan_to_num(wlev0_1393, nan=0.0),
        regs_1393, copy.deepcopy(D_old['vents']), copy.deepcopy(D_old['volc'])
    )
    wlev1_nan = np.where(whas1, wlev1, np.nan)
    print(f'  Volcanoes remodeled: {int(ch_volc.sum()):,} cells changed on 1393x1549')

    print('--- Step 2B: East Abyss & The Bowl Shiveria Failed-Rift Remodeling ---')
    En2, whas2_1393, wlev2_1393_num, ch_ea, meta_ea = EA.remodel_east_abyss(
        En1, whas1, wlev1_nan, regs_1393, D_old['rivers']
    )
    wlev2_1393 = np.where(whas2_1393, wlev2_1393_num, np.nan)
    print(f'  East Abyss & Bowl remodeled: {int(ch_ea.sum()):,} cells changed on 1393x1549')

    print('--- Step 2C: Tier-1 Biomes Remodeling (k-Guilin, SW Highlands, W Outer Wall, The Cut, Korona / NE) ---')
    En3a, whas3a_1393, wlev3a_1393_num, ch_t1 = T1.remodel_tier1_biomes(
        En2, whas2_1393, np.nan_to_num(wlev2_1393, nan=0.0),
        regs_1393, setts_1393, D_old['rivers']
    )
    print(f'  Tier-1 Biomes remodeled: {int(ch_t1.sum()):,} cells changed on 1393x1549')

    print('--- Step 2D: Tranche-2 Biomes Remodeling (Tiers, Outlands, Stalker Range, Scablands, Dams, NW/SW Lowlands, Ancient Valley, Yeti/Farside, SE Desert/Badlands/Yuni/Painted) ---')
    En3b, whas3b_1393, wlev3b_1393_num, ch_t2 = T2.remodel_tranche2_biomes(
        En3a, whas3a_1393, wlev3a_1393_num,
        regs_1393, setts_1393, D_old['rivers'], D_old.get('floods', [])
    )
    print(f'  Tranche-2 Biomes remodeled: {int(ch_t2.sum()):,} cells changed on 1393x1549')

    print('--- Step 2E: Tranche-3 Biomes Remodeling (N/S/E Highlands, Rift & Rim, Xanadu/Oidong/Catch, Hyperjungles, Drylands/Savannah, Ring Isles/Steampits, SW/NW Bays) ---')
    En3c, whas3c_1393, wlev3c_1393_num, ch_t3 = T3.remodel_tranche3_biomes(
        En3b, whas3b_1393, wlev3b_1393_num,
        regs_1393, setts_1393, D_old['rivers'], vents_1393
    )
    print(f'  Tranche-3 Biomes remodeled: {int(ch_t3.sum()):,} cells changed on 1393x1549')

    print('--- Step 2F: Biome Boundary Topological & Geological Transition Pass (Piedmont Megafans, Water Gaps, Ecotone Outliers, & FBM Seam Feathering) ---')
    En3, whas3_1393, wlev3_1393_num, ch_bt = BT.apply_biome_boundary_transitions(
        Eo_1393, En3c, whas3c_1393, wlev3c_1393_num,
        regs_1393, setts_1393, D_old['rivers']
    )
    wlev3_1393 = np.where(whas3_1393, wlev3_1393_num, np.nan)
    print(f'  Biome boundary transitions sculpted: {int(ch_bt.sum()):,} cells changed on 1393x1549')

    # Protect the completed 5-region SE complex (`Region 99`, `Siphon Pits`, `Mid Basin`, `Stalker Gate`, `High Rift`)
    # so its terrain, water levels, and climate stay 100% intact
    se5_ids = {'rmvraoas90co7', 'rmvra9zogfm9t', 'rmvmidbasin101', 'rmvstalkergate', 'rmvhighrift100'}
    mask_se5_1393 = np.zeros((OLD_OH, OLD_OW), dtype=bool)
    mask_stalker_1393 = np.zeros((OLD_OH, OLD_OW), dtype=bool)
    for r in regs_1393:
        if r.get('id') in se5_ids:
            mask_se5_1393 |= G.poly(r['points'], 1.0, 1.0, (OLD_OH, OLD_OW))
        if r.get('id') == 'rmvstalkergate':
            mask_stalker_1393 |= G.poly(r['points'], 1.0, 1.0, (OLD_OH, OLD_OW))
    En3 = np.where(mask_se5_1393, Eo_1393, En3)
    whas3_1393 = np.where(mask_se5_1393, whas0_1393, whas3_1393)
    wlev3_1393 = np.where(mask_se5_1393, wlev0_1393, wlev3_1393)

    # -------------------------------------------------------------------------
    # Step 2G: Targeted User Map Comment Passes on (1393, 1549):
    #   1. S Outlands <-> Region 99 (Loom-Chasms) Connecting Pass (`ox=1390..1495, oy=540..730`)
    #   2. Stalker Gate NW Pass 1A Clear Opening (`ox=1035..1105, oy=755..800`)
    #   3. Stalker Gate Progressive NW Outer-Wall Slopes (`ox=1040..1215, oy=790..1085`)
    #   4. Flooded Tower (`su9oc1m9io`) Shallow (<20 m) Ring Sea Shelf (`ox=756, oy=510`)
    # -------------------------------------------------------------------------
    Y_1393, X_1393 = np.indices((OLD_OH, OLD_OW), dtype=float)
    En3_pre_2g = En3.copy()
    rs_2g = np.random.RandomState(42591)

    # 1. S Outlands <-> Region 99 Connecting Mountain Pass (`Batch 1 Image 0`: x=1663..1769, y=876..1060 on 1723x1821)
    # Connects Southern Outlands valley (ox=1414, oy=545, ~2480 m) across the saddle into Region 99 (ox=1410, oy=725, ~2080 m)
    sout_pass_ctrl = [
        (1414.0, 538.0, 2440.0, 22.0),
        (1432.0, 588.0, 2720.0, 20.0),
        (1438.0, 638.0, 2880.0, 20.0),
        (1426.0, 684.0, 2480.0, 21.0),
        (1408.0, 732.0, 2040.0, 23.0),
    ]
    d_sout_p, z_sout_p, hw_sout_p = NW.corridor_distance_and_target(
        X_1393, Y_1393, sout_pass_ctrl,
        warp_x=11.0 * T1._norm_gauss(rs_2g, (OLD_OH, OLD_OW), 18.0),
        warp_y=11.0 * T1._norm_gauss(rs_2g, (OLD_OH, OLD_OW), 18.0),
    )
    w_sout_core = 1.0 - G.sstep(0.0, hw_sout_p, d_sout_p)
    w_sout_wall = 1.0 - G.sstep(hw_sout_p * 0.65, hw_sout_p * 3.1, d_sout_p)
    sout_target = z_sout_p + (1.0 - w_sout_core) * 2650.0 + 110.0 * T1._norm_gauss(rs_2g, (OLD_OH, OLD_OW), 8.0)
    En3 = np.where(w_sout_wall > 0.01, En3 * (1.0 - w_sout_wall) + np.minimum(En3, sout_target) * w_sout_wall, En3)
    # Smooth across the Region 99 northern border inside the pass envelope so there is zero kink at oy=640:
    En3_sout_sm = nd.gaussian_filter(En3, sigma=4.5)
    w_sout_sm = w_sout_wall * G.sstep(590.0, 620.0, Y_1393) * (1.0 - G.sstep(670.0, 705.0, Y_1393))
    En3 = En3 * (1.0 - 0.75 * w_sout_sm) + En3_sout_sm * (0.75 * w_sout_sm)
    # Adjust any high mountain tarn intersected by the new S Outlands pass so water level matches the pass floor
    sout_tarn_hit = whas3_1393 & (w_sout_wall > 0.15) & (Y_1393 >= 530.0) & (Y_1393 <= 735.0) & (X_1393 >= 1370.0)
    whas3_1393[sout_tarn_hit] = False
    wlev3_1393[sout_tarn_hit] = np.nan

    # 2. Stalker Gate NW Pass 1A Clear Opening (`Batch 2 Image 4`: (1344, 1102) on 1723x1821 = (1072, 772) on 1393x1549)
    sg_nw_open_ctrl = [
        (1034.0, 758.0, 1760.0, 16.0),
        (1056.0, 766.0, 1820.0, 15.0),
        (1076.0, 776.0, 1885.0, 15.0),
        (1098.0, 792.0, 1950.0, 15.5),
        (1122.0, 810.0, 1980.0, 16.0),
    ]
    d_sg_open, z_sg_open, hw_sg_open = NW.corridor_distance_and_target(
        X_1393, Y_1393, sg_nw_open_ctrl,
        warp_x=6.5 * T1._norm_gauss(rs_2g, (OLD_OH, OLD_OW), 14.0),
        warp_y=6.5 * T1._norm_gauss(rs_2g, (OLD_OH, OLD_OW), 14.0),
    )
    w_sg_open_core = 1.0 - G.sstep(0.0, hw_sg_open, d_sg_open)
    w_sg_open_wall = 1.0 - G.sstep(hw_sg_open, hw_sg_open * 2.6, d_sg_open)
    sg_open_target = z_sg_open + (1.0 - w_sg_open_core) * 1650.0 + 65.0 * T1._norm_gauss(rs_2g, (OLD_OH, OLD_OW), 7.0)

    # 3. Stalker Gate Progressive NW Outer-Wall Slopes (`Batch 2 Image 5`: x=1287..1553, y=1036..1443 on 1723x1821)
    # Dissolve the vertical polygon cliff at ox=1072 (X=1344) and grade the Stalker Gate passes so they climb
    # progressively toward the WNW/NW into the Stalker Range outer crater wall (`ox=1025..1215, oy=750..1105`).
    r_vapora = np.hypot(X_1393 - 1152.0, Y_1393 - 908.0)
    r_gtarn = np.hypot(X_1393 - 1172.0, Y_1393 - 816.0)
    w_lake_keep = np.maximum(
        1.0 - G.sstep(18.0, 36.0, r_vapora),
        np.maximum(1.0 - G.sstep(10.0, 24.0, r_gtarn), whas3_1393.astype(float))
    )
    rn_sg = T.ridged((OLD_OH, OLD_OW), 42598, scales=(2.5, 5.5, 11.0))
    fbm_sg = T1._norm_gauss(rs_2g, (OLD_OH, OLD_OW), 12.0)
    # Broadly smooth across the vertical cliff at ox=1072 (`ox=1025..1195, oy=750..1100`) and add progressive WNW slope
    En3_sg_broad = nd.gaussian_filter(En3, sigma=16.0) + 520.0 * (rn_sg - 0.38) + 210.0 * fbm_sg
    w_sg_cliff_dissolve = (
        G.sstep(1018.0, 1045.0, X_1393 + 8.0 * fbm_sg)
        * (1.0 - G.sstep(1155.0, 1205.0, X_1393 + 8.0 * fbm_sg))
        * G.sstep(742.0, 775.0, Y_1393)
        * (1.0 - G.sstep(1065.0, 1105.0, Y_1393))
        * (1.0 - w_lake_keep)
    )
    En3 = En3 * (1.0 - 0.88 * w_sg_cliff_dissolve) + En3_sg_broad * (0.88 * w_sg_cliff_dissolve)
    # Apply the NW Pass 1A opening last so the pass mouth at (1072, 772) -> (1344, 1102) is 100% unobstructed!
    En3 = np.where(
        w_sg_open_wall > 0.01,
        En3 * (1.0 - w_sg_open_wall) + np.minimum(En3, sg_open_target) * w_sg_open_wall,
        En3,
    )

    # 4. Flooded Tower (`su9oc1m9io`) Shallow (<20 m) Submerged Ring Sea Shelf at (ox=756, oy=510) -> (px=1028, py=840)
    r_ftower = np.hypot(X_1393 - 756.0, Y_1393 - 510.0)
    in_ftower_shelf = r_ftower <= 3.5
    whas3_1393[in_ftower_shelf] = True
    wlev3_1393[in_ftower_shelf] = -1500.2
    En3[in_ftower_shelf] = -1512.5  # 12.3 m water depth (< 20 m shallow water!)

    ch_2g = np.abs(En3 - En3_pre_2g) > 12.0

    # =========================================================================
    # STEP 3: Recompute Interior Climate & Paint on (1393, 1549)
    # =========================================================================
    print('--- Step 3: Recomputing Interior Rain, Climate Classes, and Shiveria Zonation on (1393, 1549) ---')
    codes = [c['code'] for c in D_old['climate']['classes']]
    idx = {c: i for i, c in enumerate(codes)}

    # Force-lock the 5-region SE complex (except where Step 2G carved the S Outlands pass or sloped Stalker Gate)
    forced_1393 = mask_se5_1393 & (~ch_2g)
    rain_int, cls_int, zon_int, q_int, rep_int = C.reclimate(
        D_old, Eo_1393, En3, whas3_1393, forced_1393
    )

    # Apply East Abyss & Bowl Shiveria climate update
    tm0_1393 = P.raster(D_old, 'tm', 'L').astype(float) - 90.0
    surf0_1393 = np.where(whas0_1393, np.fmax(Eo_1393, np.nan_to_num(wlev0_1393, nan=-1e9)), Eo_1393)
    surf3_1393 = np.where(whas3_1393, np.fmax(En3, np.nan_to_num(wlev3_1393, nan=-1e9)), En3)
    tm3_1393 = np.where((tm0_1393 > -89.0) & (np.abs(surf3_1393 - surf0_1393) > 1.0),
                        np.round(tm0_1393 - C.LAPSE_C_PER_KM * (surf3_1393 - surf0_1393) / 1000.0), tm0_1393)

    rain_int, cls_int, zon_int = EA.update_east_abyss_climate(
        En3, whas3_1393, np.nan_to_num(wlev3_1393, nan=0.0),
        rain_int, cls_int, zon_int, tm3_1393, idx, regs_1393, meta_ea
    )

    # Also ensure new high-altitude volcanic peaks (>6250 m) and Sarez/slump lakes on 1393x1549 have proper classes
    ch_interior = ch_volc | ch_ea | ch_t1 | ch_t2 | ch_t3 | ch_bt | ch_2g
    new_int_lakes = (ch_interior | in_ftower_shelf) & whas3_1393 & ~whas0_1393
    cls_int[new_int_lakes & (wlev3_1393 > 200.0)] = idx['WH']
    cls_int[new_int_lakes & (wlev3_1393 <= -900.0)] = idx['WX']
    zon_int[new_int_lakes] = 4

    volc_high = (ch_volc | ch_2g) & ~whas3_1393
    cls_int[volc_high & (En3 >= 4250.0) & (En3 < 5350.0)] = idx['ET']
    cls_int[volc_high & (En3 >= 5350.0) & (En3 < 6250.0)] = idx['EF']
    cls_int[volc_high & (En3 >= 6250.0) & (En3 < 7150.0)] = idx['HT']
    cls_int[volc_high & (En3 >= 7150.0) & (En3 < 8800.0)] = idx['HF']
    cls_int[volc_high & (En3 >= 8800.0)] = idx['O']
    zon_int[volc_high & (En3 >= 4800.0) & (En3 < 8200.0)] = 3
    zon_int[volc_high & (En3 >= 8200.0)] = 2

    # Relight and retint the interior `(1393, 1549)` painted maps (`st`, `t`, `rt`, `ct`) where interior heights changed
    print('--- Step 3B: Relighting & Retinting Interior Remodeled Regions on (1393, 1549) ---')
    st0_1393 = P.raster(D_old, 'st')
    t0_1393 = P.raster(D_old, 't')
    rt0_1393 = P.raster(D_old, 'rt')
    ct0_1393 = P.raster(D_old, 'ct')

    # Inpaint any old East Abyss/Bowl/Volcano water cells that became dry land
    drained_int = ch_interior & whas0_1393 & ~whas3_1393
    drained_int_dil = nd.binary_dilation(drained_int, iterations=2)
    D_int_clean = dict(D_old)
    for k, arr0 in (('st', st0_1393), ('t', t0_1393), ('rt', rt0_1393), ('ct', ct0_1393)):
        inp = PA.inpaint(arr0, drained_int_dil, src=~whas0_1393)
        D_int_clean[k] = P.b64(Image.fromarray(inp, 'RGB'), 'JPEG', quality=94)

    relit_int, _, _ = PA.relight(D_int_clean, Eo_1393, En3, keys=('st', 't', 'rt', 'ct'))
    st_int = np.array(Image.open(io.BytesIO(base64.b64decode(relit_int['st']))).convert('RGB'))
    t_int = np.array(Image.open(io.BytesIO(base64.b64decode(relit_int['t']))).convert('RGB'))
    rt_int = np.array(Image.open(io.BytesIO(base64.b64decode(relit_int['rt']))).convert('RGB'))
    ct_int = np.array(Image.open(io.BytesIO(base64.b64decode(relit_int['ct']))).convert('RGB'))

    # Retint st_int and t_int where elevation moved significantly (e.g. Godthrone collar removal, Lesser Throne cone, East Abyss benches, Step 2G passes)
    ok_retint = (ch_interior & ~whas3_1393 & ~mask_se5_1393) | (ch_2g & ~whas3_1393)
    donor_retint = ~ch_interior & ~whas0_1393 & ~whas3_1393
    st_int = PA.retint(st_int, Eo_1393, En3, ok_retint, donor_retint, step=160.0)
    t_int = PA.retint(t_int, Eo_1393, En3, ok_retint, donor_retint, step=160.0)

    # Repaint East Abyss / Bowl satellite textures for new megafan jungles (XA), savanna benches (XV), and halite pans (XW/XS)
    shade_1393 = compute_clean_hillshade(En3, zf=5.0, az_deg=315.0, alt_deg=45.0)
    st_int_f = st_int.astype(float)
    w_ea_blend = nd.gaussian_filter(ch_ea.astype(float), sigma=2.0) * (~whas3_1393).astype(float)
    is_ea_xa = (cls_int == idx['XA']) & ch_ea & ~whas3_1393
    is_ea_xv = (cls_int == idx['XV']) & ch_ea & ~whas3_1393
    is_ea_xw = (cls_int == idx['XW']) & ch_ea & ~whas3_1393
    is_ea_xs = (cls_int == idx['XS']) & ch_ea & ~whas3_1393

    w_xa_p = nd.gaussian_filter(is_ea_xa.astype(float), 1.5)[..., None] * 0.65
    st_int_f = st_int_f * (1.0 - w_xa_p) + (np.array([48.0, 96.0, 44.0]) * shade_1393) * w_xa_p

    w_xv_p = nd.gaussian_filter(is_ea_xv.astype(float), 1.5)[..., None] * 0.58
    st_int_f = st_int_f * (1.0 - w_xv_p) + (np.array([124.0, 128.0, 72.0]) * shade_1393) * w_xv_p

    w_xw_p = nd.gaussian_filter(is_ea_xw.astype(float), 1.5)[..., None] * 0.72
    st_int_f = st_int_f * (1.0 - w_xw_p) + (np.array([218.0, 206.0, 186.0]) * np.clip(shade_1393, 0.82, 1.15)) * w_xw_p

    w_xs_p = nd.gaussian_filter(is_ea_xs.astype(float), 1.5)[..., None] * 0.55
    st_int_f = st_int_f * (1.0 - w_xs_p) + (np.array([186.0, 164.0, 132.0]) * shade_1393) * w_xs_p

    # Paint new interior lakes (Sarez landslide lake, W Outer Wall sag ponds, Godthrone southern brine lake, Valle de Noa bay)
    din_int_lakes = nd.distance_transform_edt(whas3_1393)
    lake_int_st_col = np.where(din_int_lakes[..., None] > 2.5, np.array([38.0, 102.0, 122.0]), np.array([112.0, 148.0, 142.0]))
    st_int_f = np.where(new_int_lakes[..., None], lake_int_st_col * np.clip(shade_1393, 0.85, 1.12), st_int_f)
    st_int = np.clip(st_int_f, 0.0, 255.0).round().astype(np.uint8)

    t_int_f = t_int.astype(float)
    t_int_lake_col = np.where(din_int_lakes[..., None] > 2.5, np.array([42.0, 108.0, 114.0]), np.array([85.0, 138.0, 128.0]))
    t_int_f = np.where(new_int_lakes[..., None], t_int_lake_col * np.clip(shade_1393, 0.88, 1.12), t_int_f)
    t_int = np.clip(t_int_f, 0.0, 255.0).round().astype(np.uint8)

    # Update rt_int and ct_int where ch_interior changed
    w_int_rc = (nd.gaussian_filter(ch_interior.astype(float), sigma=1.5) * (~mask_se5_1393).astype(float))[..., None]
    rt_syn_1393 = np.clip(PA.ramp(rain_int) * (0.28 + 0.72 * shade_1393), 0.0, 255.0)
    rt_syn_1393 = np.where(new_int_lakes[..., None], np.array([48.0, 110.0, 135.0]), rt_syn_1393)
    rt_int = np.clip(rt_int.astype(float) * (1.0 - w_int_rc) + rt_syn_1393 * w_int_rc, 0.0, 255.0).round().astype(np.uint8)

    class_rgb = np.array([
        [int(c['color'][1:3], 16), int(c['color'][3:5], 16), int(c['color'][5:7], 16)]
        for c in D_old['climate']['classes']
    ], dtype=float)
    ct_syn_1393 = np.clip(class_rgb[cls_int] * (0.38 + 0.62 * shade_1393), 0.0, 255.0)
    ct_int = np.clip(ct_int.astype(float) * (1.0 - w_int_rc) + ct_syn_1393 * w_int_rc, 0.0, 255.0).round().astype(np.uint8)

    # =========================================================================
    # STEP 4: Synthesize N/W Canvas Expansion (`1549x1393` -> `1821x1723`, `DX=272, DY=330`)
    # =========================================================================
    print('--- Step 4: Synthesizing Spike-Free N/W Canvas Expansion (1821x1723) ---')
    En_exp, whas_exp, wlev_exp_raw, meta_nw = NW.synthesize_nw_expansion(
        En3, whas3_1393, np.nan_to_num(wlev3_1393, nan=0.0), ref_path
    )
    wlev_exp = np.where(whas_exp, wlev_exp_raw, np.nan)
    print(f'  Expanded grid shape: {En_exp.shape} | min={En_exp.min():.1f} m, max={En_exp.max():.1f} m')

    # =========================================================================
    # STEP 5: Extend Latitude Temperatures, Wind, Rain, and Climate to 1821x1723
    # =========================================================================
    print('--- Step 5: Extending Latitude Temperatures, Wind, Rain, and Climate to 1821x1723 ---')
    out_temps_exp, wd_exp = C.extend_latitude_temps_and_wind(
        D_old, Eo_1393, En_exp, whas0_1393, wlev0_1393, whas_exp, wlev_exp,
        dy_h=DY, dx_h=DX, dy_f=DY, dx_f=DX
    )
    tm_exp = out_temps_exp['tm']
    tw_exp = out_temps_exp['tw']
    tc_exp = out_temps_exp['tc']

    # Build expanded rain_exp, cls_exp, zon_exp on (1723, 1821)
    rain_exp = np.pad(rain_int, ((DY, 0), (DX, 0)), mode='edge').astype(float)
    cls_exp = np.pad(cls_int, ((DY, 0), (DX, 0)), mode='edge')
    zon_exp = np.pad(zon_int, ((DY, 0), (DX, 0)), mode='edge')

    Y_exp, X_exp = np.indices((NEW_OH, NEW_OW), dtype=float)
    is_new_area = meta_nw['is_new_area']
    is_sea_nw = meta_nw['is_sea']
    w_delta_zone = meta_nw['w_delta_zone']
    w_ria_floodplain = meta_nw['w_ria_floodplain']
    is_high_lake = meta_nw['is_high_lake']
    is_copper_tarn = meta_nw['is_copper_tarn']
    w_canyon = meta_nw['w_canyon']
    arach_trough_w = meta_nw['arach_trough_w']
    w_arach_zone = meta_nw['w_arach_zone']
    w_n_korona_breach = meta_nw['w_n_korona_breach']
    w_ne_connector = meta_nw['w_ne_connector']
    w_sw_connector = meta_nw['w_sw_connector']
    w_tharn = meta_nw['w_tharn']
    w_sw_outer = meta_nw['w_sw_outer']
    w_crook = meta_nw['w_crook_corridor']
    in_arch_box = meta_nw['in_arch_box']
    sd_new = meta_nw['sd_new']
    old_lake_guard = meta_nw['old_lake_guard']

    # Compute physically realistic rainfall across the N/W expansion + trans-boundary passes & Arachnoid Canyon:
    gy_e, gx_e = np.gradient(nd.gaussian_filter(En_exp, 2.0), 2000.0)
    slope_nw = (gx_e + gy_e) / math.sqrt(2.0) * 1000.0  # m/km rising under NW storm track
    d_water_px = nd.distance_transform_edt(~whas_exp)
    coastal_moisture = np.exp(-d_water_px / 48.0)

    rain_nw_syn = (
        680.0
        + 1050.0 * coastal_moisture
        + 620.0 * np.clip(slope_nw / 55.0, -0.45, 1.35)
        + 480.0 * w_delta_zone
        + 320.0 * w_ria_floodplain
        + 360.0 * np.exp(-((Y_exp - 162.0) / 75.0) ** 2) * (1.0 - G.sstep(540.0, 1380.0, X_exp) * 0.45)
        + 320.0 * w_canyon
        + 240.0 * w_ne_connector
        + 220.0 * w_sw_connector
        - 520.0 * w_tharn
        - 580.0 * w_sw_outer
        - 220.0 * G.sstep(850.0, 1350.0, X_exp) * G.sstep(210.0, 480.0, Y_exp) * (1.0 - w_canyon)
    )
    rain_nw_syn = nd.gaussian_filter(rain_nw_syn, sigma=2.2)
    rain_nw_syn = np.where(En_exp >= 8800.0, 0.0, np.clip(rain_nw_syn, 75.0, 3400.0))

    d_into_new = nd.distance_transform_edt(is_new_area)
    w_trans_clim = np.maximum(
        np.maximum(w_ne_connector, w_sw_connector),
        np.maximum(w_n_korona_breach, np.maximum(w_canyon, arach_trough_w * 0.85)),
    )
    w_nw_clim = np.maximum(G.sstep(-8.0, 16.0, sd_new) * (~old_lake_guard).astype(float), w_trans_clim)
    rain_exp = rain_exp * (1.0 - w_nw_clim) + rain_nw_syn * w_nw_clim

    # Assign Köppen + Exotic climate classes across the new N/W territory and trans-boundary passes/canyons
    # Use `w_nw_clim > 0.15` (already domain-warped across Y=330 & X=272) so no straight line is clipped at `is_new_area`!
    nw_edit_land = (w_nw_clim > 0.15) & ~whas_exp
    c_nw = cls_exp.copy()
    # Tropical / subtropical lowland & Double Delta / lower Ria Valley
    c_nw[nw_edit_land & (tc_exp >= 18.0) & (rain_exp >= 1500.0)] = idx['Am']
    c_nw[nw_edit_land & (tc_exp >= 18.0) & (rain_exp >= 750.0) & (rain_exp < 1500.0)] = idx['Aw']
    # Temperate Ria Valley, Double Delta, Arch islands, northern Crook, Outland Gate, and Web-Cleaver Gorge floor
    c_nw[nw_edit_land & (tc_exp < 18.0) & (tc_exp > 0.0) & (tw_exp >= 22.0) & (rain_exp >= 780.0)] = idx['Cfa']
    c_nw[nw_edit_land & (tc_exp < 18.0) & (tc_exp > 0.0) & (tw_exp < 22.0) & (rain_exp >= 720.0)] = idx['Cfb']
    c_nw[nw_edit_land & (tc_exp < 18.0) & (tc_exp > 0.0) & (tw_exp >= 22.0) & (rain_exp >= 480.0) & (rain_exp < 780.0)] = idx['Csa']
    c_nw[nw_edit_land & (tc_exp < 18.0) & (tc_exp > 0.0) & (tw_exp < 22.0) & (rain_exp >= 440.0) & (rain_exp < 720.0)] = idx['Csb']
    # Semi-arid & arid uplands (Arachnoid rings, upper Ria benches, rain-shadow valleys)
    c_nw[nw_edit_land & (rain_exp < 480.0) & (tm_exp >= 18.0)] = idx['BSh']
    c_nw[nw_edit_land & (rain_exp < 480.0) & (tm_exp < 18.0) & (En_exp < 4200.0)] = idx['BSk']
    c_nw[nw_edit_land & (rain_exp < 220.0) & (tm_exp < 18.0) & (En_exp < 4200.0)] = idx['BWk']
    # Boreal / continental montane belts (`Dsb`, `Dsc`, `Dfb`, `Dfc`)
    c_nw[nw_edit_land & (tc_exp <= 0.0) & (tw_exp >= 10.0) & (En_exp < 4100.0) & (rain_exp >= 520.0)] = idx['Dfb']
    c_nw[nw_edit_land & (tc_exp <= 0.0) & (tw_exp >= 10.0) & (En_exp < 4100.0) & (rain_exp < 520.0)] = idx['Dsb']
    c_nw[nw_edit_land & (En_exp >= 3100.0) & (En_exp < 4250.0) & (rain_exp < 520.0)] = idx['Dsc']
    c_nw[nw_edit_land & (En_exp >= 3100.0) & (En_exp < 4250.0) & (rain_exp >= 520.0)] = idx['Dfc']
    # NE Tharn Cold-Dry Uplands (`rmvtharnuplands`, +4,600..+6,300 m, mitigated by equatorial proximity):
    tharn_land = nw_edit_land & (w_tharn > 0.35)
    c_nw[tharn_land & (En_exp < 4850.0)] = idx['BSk']
    c_nw[tharn_land & (En_exp >= 4850.0) & (En_exp < 5350.0) & (rain_exp < 260.0)] = idx['BWk']
    c_nw[tharn_land & (En_exp >= 4850.0) & (En_exp < 5450.0) & (rain_exp >= 260.0)] = idx['Dsc']
    c_nw[tharn_land & (En_exp >= 5450.0) & (En_exp < 6250.0)] = idx['ET']
    # Southern Copper Glacier & Crook–Rift Glacial Pass (`rmvcopperglacier`, `X = 48..365, Y = 1085..1385`)
    Xw_cg = X_exp + 14.0 * meta_nw['fbm2'] + 7.0 * meta_nw['fbm1']
    Yw_cg = Y_exp + 14.0 * meta_nw['fbm1'] + 7.0 * meta_nw['fbm2']
    in_copper_glacier = nw_edit_land & (Xw_cg >= 48.0) & (Xw_cg <= 365.0) & (Yw_cg >= 1085.0) & (Yw_cg <= 1385.0) & (w_sw_outer < 0.35)
    c_nw[in_copper_glacier & (En_exp >= 2350.0) & (En_exp < 3100.0)] = idx['ET']
    c_nw[in_copper_glacier & (En_exp >= 3100.0) & (En_exp < 6250.0)] = idx['EF']
    # High alpine / nival / hypobaric tiers across all new mountains
    c_nw[nw_edit_land & (En_exp >= 4250.0) & (En_exp < 5350.0) & ~(tharn_land & (En_exp < 5450.0))] = idx['ET']
    c_nw[nw_edit_land & (En_exp >= 5350.0) & (En_exp < 6250.0) & ~(tharn_land & (En_exp < 5450.0))] = idx['EF']
    c_nw[nw_edit_land & (En_exp >= 6250.0) & (En_exp < 7150.0)] = idx['HT']
    c_nw[nw_edit_land & (En_exp >= 7150.0) & (En_exp < 8800.0)] = idx['HF']
    c_nw[nw_edit_land & (En_exp >= 8800.0)] = idx['O']

    # Water classes in the new territory:
    c_nw[(is_new_area | ((X_exp < 535.0) & (Y_exp < 595.0))) & whas_exp] = idx['WS']
    c_nw[is_high_lake | is_copper_tarn] = idx['WH']
    cls_exp = c_nw

    # Hypsometric zones (`z.png`: 0=basin, 1=highland, 2=outer rim, 3=arctic, 4=lake/sea, 5=salt basin)
    zon_exp[nw_edit_land & (En_exp < 1350.0)] = 0
    zon_exp[nw_edit_land & (En_exp >= 1350.0) & (En_exp < 4500.0)] = 1
    zon_exp[nw_edit_land & (En_exp >= 4500.0) & (En_exp < 8200.0)] = 3
    zon_exp[nw_edit_land & (En_exp >= 8200.0)] = 2
    zon_exp[in_copper_glacier & (En_exp >= 2350.0)] = 3
    zon_exp[(is_new_area | ((X_exp < 535.0) & (Y_exp < 595.0))) & whas_exp] = 4

    # =========================================================================
    # STEP 5B: Shift Rivers, Soften Legacy D8 Staircases into Natural Meanders,
    #          Carve Fluvial Channels into `En_exp`, and Run Global Anti-Spike Guard
    # =========================================================================
    print('--- Step 5B: Meandering D8 Rivers, Carving Fluvial Channels into En_exp, & Despiking ---')
    # Smooth out the two legacy rectangular/linear patch seams on En_exp first:
    #   - Batch 2 Image 3: High Rift western seam (`X=1280..1350, Y=1605..1712`)
    #   - Batch 2 Image 8: NW Outer Wall / NW Lowlands seam (`X=390..535, Y=405..585`)
    w_fix_seam_hr = (
        G.sstep(1278.0, 1294.0, X_exp) * (1.0 - G.sstep(1336.0, 1352.0, X_exp))
        * G.sstep(1604.0, 1620.0, Y_exp) * (1.0 - G.sstep(1696.0, 1712.0, Y_exp))
        * (~whas_exp).astype(float)
    )
    w_fix_seam_nwl = (
        G.sstep(388.0, 408.0, X_exp) * (1.0 - G.sstep(518.0, 538.0, X_exp))
        * G.sstep(402.0, 422.0, Y_exp) * (1.0 - G.sstep(568.0, 588.0, Y_exp))
        * (~whas_exp).astype(float)
    )
    w_fix_both = np.maximum(w_fix_seam_hr, w_fix_seam_nwl)
    rn_seam_fix = T.ridged((NEW_OH, NEW_OW), 42599, scales=(2.5, 5.5, 11.0))
    En_exp_s = nd.gaussian_filter(En_exp, sigma=8.5) + 55.0 * (rn_seam_fix - 0.38)
    En_exp = En_exp * (1.0 - 0.90 * w_fix_both) + En_exp_s * (0.90 * w_fix_both)

    # Shift all legacy rivers by (+272, +330) and append the new N/W expansion rivers
    rivers_exp = []
    for r in D_old['rivers']:
        r2 = copy.deepcopy(r)
        if 'px' in r2 and r2['px']:
            r2['px'] = shift_pts(r2['px'])
        if isinstance(r2.get('to'), dict) and 'at_px' in r2['to']:
            r2['to']['at_px'] = shift_pt(r2['to']['at_px'])
        rivers_exp.append(r2)
    for nr in meta_nw['new_rivers']:
        rivers_exp.append(copy.deepcopy(nr))

    # Collect all tributary confluence coordinates so trunk rivers keep those exact junction points pinned!
    confluence_pts = []
    for r in rivers_exp:
        pts_r = r.get('px') or []
        if pts_r:
            confluence_pts.append(pts_r[0])
            confluence_pts.append(pts_r[-1])
        to_info = r.get('to')
        if isinstance(to_info, dict) and 'at_px' in to_info and to_info['at_px']:
            confluence_pts.append(to_info['at_px'])
    conf_arr = np.array(confluence_pts, dtype=float) if confluence_pts else np.zeros((0, 2), dtype=float)

    # Soften straight D8 horizontal/vertical/45-deg runs on legacy rivers (`id < 9100`) into natural meanders
    # while keeping endpoints, tributary junctions, and near-lake vertices 100% locked!
    d_to_water_px, (w_iy, w_ix) = nd.distance_transform_edt(~whas_exp, return_indices=True)
    wlev_nearest = np.where(whas_exp, wlev_exp, wlev_exp[w_iy, w_ix])
    wlev_nearest = np.nan_to_num(wlev_nearest, nan=0.0)

    for idx_r, r in enumerate(rivers_exp):
        raw_id = r.get('id', idx_r)
        is_new_riv = isinstance(raw_id, int) and raw_id >= 9100
        pts_r = r.get('px') or []
        if is_new_riv or len(pts_r) < 6:
            continue
        arr_p = np.array(pts_r, dtype=float)
        n_p = len(arr_p)
        # Identify pinned vertices: endpoints, within 2.5 px of any confluence, or within 2.0 px of water
        pinned = np.zeros(n_p, dtype=bool)
        pinned[0] = True
        pinned[-1] = True
        if len(conf_arr) > 0:
            d_conf = np.hypot(arr_p[:, 0:1] - conf_arr[:, 0][None, :], arr_p[:, 1:2] - conf_arr[:, 1][None, :]).min(axis=1)
            pinned |= (d_conf <= 2.5)
        iy_p = np.clip(np.round(arr_p[:, 1]).astype(int), 0, NEW_OH - 1)
        ix_p = np.clip(np.round(arr_p[:, 0]).astype(int), 0, NEW_OW - 1)
        pinned |= (d_to_water_px[iy_p, ix_p] <= 2.0)

        pin_indices = np.where(pinned)[0]
        dist_idx = np.min(np.abs(np.arange(n_p)[:, None] - pin_indices[None, :]), axis=1).astype(float)
        env_m = G.sstep(0.0, 3.5, dist_idx)

        # Smooth D8 staircase jitter + add organic perpendicular fluvial meander wave
        sx_s = nd.gaussian_filter1d(arr_p[:, 0], sigma=1.5, mode='nearest')
        sy_s = nd.gaussian_filter1d(arr_p[:, 1], sigma=1.5, mode='nearest')
        seg_ds = np.hypot(np.diff(sx_s, prepend=sx_s[0]), np.diff(sy_s, prepend=sy_s[0]))
        arc_s = np.cumsum(seg_ds)
        tx = np.gradient(sx_s)
        ty = np.gradient(sy_s)
        tn = np.hypot(tx, ty) + 1e-9
        nx, ny = -ty / tn, tx / tn
        phase = (idx_r * 1.6180339887) % (2.0 * math.pi)
        wave = (1.45 * np.sin(arc_s / 5.5 * math.pi + phase) + 0.65 * np.cos(arc_s / 2.6 * math.pi - 0.7 * phase)) * env_m
        new_x = arr_p[:, 0] * (1.0 - env_m) + (sx_s + nx * wave) * env_m
        new_y = arr_p[:, 1] * (1.0 - env_m) + (sy_s + ny * wave) * env_m

        # Never push a dry river vertex into a lake/sea cell!
        ny_i = np.clip(np.round(new_y).astype(int), 0, NEW_OH - 1)
        nx_i = np.clip(np.round(new_x).astype(int), 0, NEW_OW - 1)
        hit_water = whas_exp[ny_i, nx_i] & ~whas_exp[iy_p, ix_p]
        new_x = np.where(hit_water | pinned, arr_p[:, 0], new_x)
        new_y = np.where(hit_water | pinned, arr_p[:, 1], new_y)
        r['px'] = [[round(float(x_), 2), round(float(y_), 2)] for x_, y_ in zip(new_x, new_y)]

    # Save pre-river-incision hillshade so we can transfer the newly carved river-bank shading onto `t_pad` & `st_pad`!
    En_pre_riv = En_exp.copy()
    shade_pre_riv = compute_clean_hillshade(En_pre_riv, zf=5.0, az_deg=315.0, alt_deg=45.0)

    # Carve continuous fluvial channels & valleys into `En_exp` along ALL rivers in `rivers_exp`!
    En_smooth_ref = nd.gaussian_filter(En_exp, sigma=2.2)
    riv_seed_mask = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    riv_bed_grid = En_exp.copy()
    riv_depth_grid = np.zeros((NEW_OH, NEW_OW), dtype=float)
    riv_hw_grid = np.full((NEW_OH, NEW_OW), 2.5, dtype=float)

    for r in rivers_exp:
        pts_r = r.get('px') or []
        if len(pts_r) < 2:
            continue
        q_m = float(r.get('q_mouth') or 250.0)
        hw_r = float(np.clip(2.0 + 0.55 * math.log10(max(20.0, q_m)), 2.2, 4.4))
        depth_r = float(np.clip(28.0 + 18.0 * math.log10(max(20.0, q_m)), 34.0, 92.0))

        # Dense 0.65-px sub-sampling along each river segment so the carved channel has zero gaps or beads
        dense_pts = []
        for i in range(len(pts_r) - 1):
            x0, y0 = pts_r[i]
            x1, y1 = pts_r[i + 1]
            dist_seg = math.hypot(x1 - x0, y1 - y0)
            n_sub = max(2, int(math.ceil(dist_seg / 0.65)) + 1)
            for k_s in range(n_sub):
                t_s = k_s / float(n_sub - 1)
                dense_pts.append((x0 + (x1 - x0) * t_s, y0 + (y1 - y0) * t_s))

        # Enforce monotonically non-increasing reference elevation along the river from source to mouth
        ref_els = []
        for dx_, dy_ in dense_pts:
            iy = min(NEW_OH - 1, max(0, int(round(dy_))))
            ix = min(NEW_OW - 1, max(0, int(round(dx_))))
            ref_els.append(float(En_smooth_ref[iy, ix]))
        for i in range(1, len(ref_els)):
            if ref_els[i] > ref_els[i - 1]:
                ref_els[i] = ref_els[i - 1]

        for (dx_, dy_), e_ref in zip(dense_pts, ref_els):
            iy = min(NEW_OH - 1, max(0, int(round(dy_))))
            ix = min(NEW_OW - 1, max(0, int(round(dx_))))
            if whas_exp[iy, ix]:
                continue
            target_bed = e_ref - depth_r
            if not riv_seed_mask[iy, ix] or target_bed < riv_bed_grid[iy, ix]:
                riv_bed_grid[iy, ix] = target_bed
            riv_seed_mask[iy, ix] = True
            if depth_r > riv_depth_grid[iy, ix]:
                riv_depth_grid[iy, ix] = depth_r
            if hw_r > riv_hw_grid[iy, ix]:
                riv_hw_grid[iy, ix] = hw_r

    d_to_riv_all, (r_iy, r_ix) = nd.distance_transform_edt(~riv_seed_mask, return_indices=True)
    hw_near = riv_hw_grid[r_iy, r_ix]
    depth_near = riv_depth_grid[r_iy, r_ix]
    bed_near = nd.gaussian_filter(riv_bed_grid[r_iy, r_ix], sigma=1.0)

    u_riv = d_to_riv_all / np.maximum(hw_near, 1.5)
    # Taper river carving smoothly within 2 px of lake/sea shorelines (`d_to_water_px`) so lake rims stay intact
    w_water_taper = G.sstep(0.0, 2.2, d_to_water_px) * (~whas_exp).astype(float)
    w_riv_carve = ((1.0 - G.sstep(0.0, 1.0, u_riv)) ** 1.25) * w_water_taper

    # Safe lower bound on dry land so positive-elevation land never drops below 1.8 m or below adjacent lake level
    min_safe_riv = np.where(
        En_exp > 1.8,
        np.where(d_to_water_px <= 10.0, np.maximum(1.8, np.minimum(En_exp - 2.0, wlev_nearest + 1.8)), 1.8),
        np.where(d_to_water_px <= 8.0, np.minimum(En_exp - 2.0, wlev_nearest + 1.8), En_exp - depth_near),
    )
    h_riv_profile = np.maximum(min_safe_riv, bed_near + depth_near * (G.sstep(0.0, 1.0, u_riv) ** 1.35))
    En_exp = En_exp * (1.0 - 0.88 * w_riv_carve) + np.minimum(En_exp, h_riv_profile) * (0.88 * w_riv_carve)

    # Global Anti-Porcupine Despiking & Coastal Cliff Moderation Pass on `En_exp`:
    # Protect deep volcanic vent throats (`r < 6 px`) while removing any 1-3 px spike or needle across the entire map!
    vent_guard = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    for v_item in list(vents_1393) + list(meta_nw['new_vents']):
        vx_i, vy_i = v_item['px']
        if v_item in vents_1393:
            vx_i, vy_i = vx_i + DX, vy_i + DY
        vent_guard |= (np.hypot(X_exp - vx_i, Y_exp - vy_i) <= 7.0)

    med3_e = nd.median_filter(En_exp, size=3)
    med5_e = nd.median_filter(En_exp, size=5)
    En_exp = np.where((np.abs(En_exp - med3_e) > 120.0) & ~vent_guard, med3_e, En_exp)
    En_exp = np.where((np.abs(En_exp - med5_e) > 210.0) & ~vent_guard, 0.25 * En_exp + 0.75 * med5_e, En_exp)
    # Also ensure coastal cliffs in the N/W expansion (`d_to_water_px <= 5`) have smooth, spike-free gradients
    gy_chk, gx_chk = np.gradient(En_exp)
    grad_px = np.hypot(gx_chk, gy_chk)
    En_coast_blur = nd.gaussian_filter(En_exp, sigma=2.0)
    coastal_spike = (d_to_water_px <= 5.0) & (grad_px > 340.0) & ~vent_guard & ~whas_exp
    En_exp = np.where(coastal_spike, np.minimum(En_exp, En_coast_blur), En_exp)
    # Re-assert dry land >= 1.5 m in `is_new_area` after coastal smoothing
    dry_new_final = is_new_area & ~whas_exp
    En_exp = np.where(dry_new_final, np.maximum(En_exp, 1.8), En_exp)

    # Sample strictly monotonic `bed_m` along all rivers in `rivers_exp` directly from the incised `En_exp`!
    climbing_fixed = 0
    for r in rivers_exp:
        pts_r = r.get('px') or []
        if not pts_r:
            continue
        beds = []
        for px_, py_ in pts_r:
            iy = min(NEW_OH - 1, max(0, int(round(py_))))
            ix = min(NEW_OW - 1, max(0, int(round(px_))))
            beds.append(round(float(En_exp[iy, ix]), 1))
        for i in range(1, len(beds)):
            if beds[i] > beds[i - 1]:
                beds[i] = beds[i - 1]
                climbing_fixed += 1
        r['bed_m'] = beds
        r['source_m'] = beds[0]
        r['mouth_m'] = beds[-1]
    print(f'  Total rivers incised & verified on expanded map: {len(rivers_exp)} (clamped {climbing_fixed} vertices)')

    # =========================================================================
    # STEP 6: Synthesize & Blend `st`, `t`, `rt`, `ct` on (1723, 1821)
    # =========================================================================
    print('--- Step 6: Synthesizing Seamless Satellite (st), Relief (t), Rain (rt), and Climate (ct) Maps on 1821x1723 ---')
    rs_paint = np.random.RandomState(SEED + 19)
    fine_grain_exp = 1.0 + nd.gaussian_filter(rs_paint.normal(0.0, 0.032, (NEW_OH, NEW_OW)), 0.9)[..., None]
    shade_post_riv = compute_clean_hillshade(En_exp, zf=5.0, az_deg=315.0, alt_deg=45.0)
    shade_exp = shade_post_riv * fine_grain_exp
    # Enhanced relief shading inside The Arch (`w_arch_region`) using a smooth domain-warped envelope (ZERO box edge!)
    w_arch_region = meta_nw['w_arch_region']
    shade_arch = compute_clean_hillshade(En_exp, zf=8.0, az_deg=315.0, alt_deg=40.0) * fine_grain_exp
    w_arch_shade = (w_arch_region * (~whas_exp).astype(float))[..., None]
    shade_exp = shade_exp * (1.0 - 0.72 * w_arch_shade) + shade_arch * (0.72 * w_arch_shade)

    # Strip the 16-pixel top/left canvas frame bevel of `st_int`, `t_int`, `rt_int`, `ct_int` before padding,
    # shifting along the 45-degree diagonal NW Crater Wall shoreline (`x_old = 140..280`, `dx = (16 - r_i) * 1.75`)
    # so `st_pad` and `t_pad` match `Eo_clean_edge` / `whas0_clean_edge` 100%!
    for arr_i in (st_int, t_int, rt_int, ct_int):
        for r_i in range(16):
            arr_i[r_i, :, :] = arr_i[16, :, :]
            dx_s = int(round((16 - r_i) * 1.75))
            arr_i[r_i, 140:280, :] = arr_i[16, 140 - dx_s:280 - dx_s, :]
        for c_i in range(16):
            arr_i[:, c_i, :] = arr_i[:, 16, :]
            dy_s = int(round((16 - c_i) * 0.85))
            arr_i[200:280, c_i, :] = arr_i[200 + dy_s:280 + dy_s, 16, :]

    # Embed interior `(1393, 1549)` painted maps into `[DY:, DX:]`
    st_pad = np.pad(st_int, ((DY, 0), (DX, 0), (0, 0)), mode='edge')
    t_pad = np.pad(t_int, ((DY, 0), (DX, 0), (0, 0)), mode='edge')
    rt_pad = np.pad(rt_int, ((DY, 0), (DX, 0), (0, 0)), mode='edge')
    ct_pad = np.pad(ct_int, ((DY, 0), (DX, 0), (0, 0)), mode='edge')

    # Apply the newly carved river-channel bank hillshade ratio (`shade_post_riv / shade_pre_riv`) to `t_pad` and `st_pad`
    # so interior rivers also display crisp 3D-shaded valley banks on the 2D relief & satellite maps!
    riv_shade_ratio = np.clip((shade_post_riv + 1e-5) / (shade_pre_riv + 1e-5), 0.74, 1.26)
    w_riv_bank_shade = ((1.0 - G.sstep(0.0, 1.15, u_riv)) * (~whas_exp).astype(float))[..., None]
    riv_bank_mult = 1.0 + (riv_shade_ratio - 1.0) * w_riv_bank_shade
    t_pad = np.clip(t_pad.astype(float) * riv_bank_mult, 0.0, 255.0).round().astype(np.uint8)
    st_pad = np.clip(st_pad.astype(float) * riv_bank_mult, 0.0, 255.0).round().astype(np.uint8)

    # Organic domain-warped blending weight for the new N/W area + trans-boundary NE Outland Pass,
    # SW Crook–Rift Pass, Arachnoid Canyon/Breach, Crater Wall Unification, Step 2G passes, and Legacy Seam Fixes.
    # CRITICAL: `w_seam` is strictly `1.0` everywhere on `is_new_area` (`Y < 330` or `X < 272`) so 1D edge-repeated
    # padding streaks from `st_pad` / `t_pad` NEVER bleed into `is_new_area`, and feathers smoothly from `1.0 -> 0.0`
    # inside `[DY:, DX:]` (`d_into_old = 0..52 px`)!
    d_into_old = meta_nw['d_into_old']
    d_old_warped = d_into_old + G.sstep(0.0, 14.0, d_into_old) * (16.0 * meta_nw['fbm2'] + 8.0 * meta_nw['fbm1'])
    w_seam = np.where(
        is_new_area,
        1.0,
        np.where(old_lake_guard, G.sstep(0.0, 16.0, d_into_new), 1.0 - G.sstep(0.0, 52.0, d_old_warped)),
    )
    w_wall_unify = meta_nw.get('w_wall_unify', np.zeros((NEW_OH, NEW_OW), dtype=float))
    ch_2g_exp = np.pad(nd.gaussian_filter(ch_2g.astype(float), sigma=2.5), ((DY, 0), (DX, 0)), mode='constant')
    w_sout_pass_exp = np.pad(nd.gaussian_filter(w_sout_wall, sigma=2.5), ((DY, 0), (DX, 0)), mode='constant')
    w_sg_repaint = np.pad(nd.gaussian_filter(np.maximum(w_sg_cliff_dissolve, w_sg_open_wall), sigma=2.5), ((DY, 0), (DX, 0)), mode='constant')
    w_arach_paint = np.clip(
        w_canyon + 0.85 * arach_trough_w + 0.65 * np.clip(meta_nw['arach_rib_h'] / 210.0, 0.0, 1.0) + 0.78 * w_n_korona_breach,
        0.0, 1.0
    )
    # Unify the entire NW Ocean (`X < 560, Y < 610` where `whas_exp == True`) so zero seam ever appears in the ocean!
    w_nw_sea_unify = (
        whas_exp.astype(float)
        * (1.0 - G.sstep(510.0, 555.0, X_exp))
        * (1.0 - G.sstep(545.0, 605.0, Y_exp))
    )
    w_legacy_seams = np.maximum(
        np.maximum(w_fix_seam_hr, w_fix_seam_nwl),
        np.maximum(np.clip(ch_2g_exp * 1.15, 0.0, 1.0), np.maximum(w_sout_pass_exp, w_sg_repaint)),
    )
    w_exp_paint = np.maximum(
        np.maximum(np.maximum(w_seam, w_wall_unify), w_nw_sea_unify),
        np.maximum(np.maximum(w_arach_paint, w_legacy_seams), np.maximum(w_ne_connector, w_sw_connector)),
    )[..., None]

    # 6A. Relief Map (`t`) on (1723, 1821) — Continuous hypsometric tinting following the contour slopes!
    hypso_centers, hypso_meds = build_hypsometric_table(Eo_1393, whas0_1393, t0_1393.astype(float))
    t_hypso_exp = eval_hypso(En_exp, hypso_centers, hypso_meds)
    t_syn_exp = np.clip(t_hypso_exp * shade_exp, 0.0, 255.0)

    # Pad `whas_exp` on top and left with `mode='edge'` before `distance_transform_edt` so the outer map edges
    # (`X=0, Y=0`) are treated as open ocean rather than a false coastal shoal!
    din_water_exp = nd.distance_transform_edt(np.pad(whas_exp, ((35, 0), (35, 0)), mode='edge'))[35:, 35:]
    t_sea_col = (
        np.array([82.0, 138.0, 132.0]) * (1.0 - G.sstep(0.0, 18.0, din_water_exp)[..., None])
        + np.array([36.0, 92.0, 108.0]) * G.sstep(0.0, 18.0, din_water_exp)[..., None]
    )
    w_shoal_t = (meta_nw['is_seamount'] & whas_exp)[..., None] * G.sstep(-220.0, -15.0, En_exp)[..., None]
    t_sea_col = t_sea_col * (1.0 - 0.55 * w_shoal_t) + np.array([115.0, 158.0, 142.0]) * (0.55 * w_shoal_t)
    t_syn_exp = np.where(whas_exp[..., None], t_sea_col * np.clip(shade_exp, 0.86, 1.14), t_syn_exp)
    t_final_exp = np.clip(t_pad.astype(float) * (1.0 - w_exp_paint) + t_syn_exp * w_exp_paint, 0.0, 255.0).round().astype(np.uint8)

    # 6B. Rain Map (`rt`) on (1723, 1821)
    rt_syn_exp = np.clip(PA.ramp(rain_exp) * (0.28 + 0.72 * shade_exp), 0.0, 255.0)
    rt_syn_exp = np.where(whas_exp[..., None], np.array([48.0, 110.0, 135.0]) * np.clip(shade_exp, 0.90, 1.10), rt_syn_exp)
    rt_final_exp = np.clip(rt_pad.astype(float) * (1.0 - w_exp_paint) + rt_syn_exp * w_exp_paint, 0.0, 255.0).round().astype(np.uint8)

    # 6C. Climate Map (`ct`) on (1723, 1821)
    ct_syn_exp = np.clip(class_rgb[cls_exp] * (0.38 + 0.62 * shade_exp), 0.0, 255.0)
    ct_final_exp = np.clip(ct_pad.astype(float) * (1.0 - w_exp_paint) + ct_syn_exp * w_exp_paint, 0.0, 255.0).round().astype(np.uint8)

    # 6D. Satellite Map (`st`) on (1723, 1821) — Continuous elevation/climate/slope-driven vegetation & rock!
    st_base_exp = st_pad.copy()
    neutral_exp = np.clip(np.full_like(st_pad, 128.0, dtype=float) * shade_exp, 0.0, 255.0).round().astype(np.uint8)
    st_base_exp = np.where((w_exp_paint > 0.05), neutral_exp, st_base_exp)

    donor_excl = is_new_area | (w_exp_paint[..., 0] > 0.25)
    st_clim_exp = PA.by_climate(
        st_base_exp, En_exp, rain_exp, tm_exp, whas_exp,
        donor_excl, w_exp_paint[..., 0] * G.sstep(5600.0, 4200.0, En_exp)
    ).astype(float)

    # 1. Continuous Elevation-Graduated Vegetation & Rock Palette in the Ria Valley, Outland Gate, Arch, & Crook
    # (No flat plateau fills — every color varies smoothly with elevation `En_exp`, moisture `rain_exp`, and slope!)
    w_humid_slope = (
        G.sstep(350.0, 850.0, rain_exp)
        * (1.0 - G.sstep(3400.0, 4400.0, En_exp))
        * (1.0 - w_tharn) * (1.0 - w_sw_outer)
        * (~whas_exp).astype(float)
    )
    # Smooth continuum from lush lowland emerald-olive (0 m) -> mid-elevation montane forest (1,400 m) -> upland olive-ochre (3,000 m)
    u_elev_veg = np.clip(En_exp / 3200.0, 0.0, 1.0)[..., None]
    veg_cont_rgb = (
        np.array([68.0, 112.0, 56.0]) * ((1.0 - u_elev_veg) ** 1.4)
        + np.array([102.0, 124.0, 68.0]) * (2.0 * u_elev_veg * (1.0 - u_elev_veg))
        + np.array([136.0, 118.0, 82.0]) * (u_elev_veg ** 1.4)
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.54 * w_humid_slope[..., None]) + veg_cont_rgb * (0.54 * w_humid_slope[..., None])

    # 1A. Exposed Undersea Mid-Ocean Spreading Ridge in The Arch (`Batch 2 Image 9`):
    # Clear double line of elevated rift-shoulder horst ridges (+500..+2,050 m) with a lowered axial rift trough (<250 m) in between!
    w_arch_land = w_arch_region * (~whas_exp).astype(float)
    u_arch_horst = G.sstep(280.0, 1350.0, En_exp)[..., None]
    u_arch_crest = G.sstep(1150.0, 1850.0, En_exp)[..., None]
    arch_trough_col = np.array([48.0, 98.0, 50.0]) * shade_exp
    arch_horst_col = (
        np.array([142.0, 128.0, 78.0]) * (1.0 - u_arch_crest)
        + np.array([182.0, 158.0, 118.0]) * u_arch_crest
    ) * shade_exp
    arch_ridge_rgb = arch_trough_col * (1.0 - u_arch_horst) + arch_horst_col * u_arch_horst
    st_clim_exp = st_clim_exp * (1.0 - 0.72 * w_arch_land[..., None]) + arch_ridge_rgb * (0.72 * w_arch_land[..., None])

    # 1B. Nile-Style Sinuous Alluvial Floodplain & Gallery Forest Ribbon along the Ria River (`w_ria_floodplain`):
    w_nile_ribbon = w_ria_floodplain * (~whas_exp).astype(float)
    nile_ribbon_rgb = np.array([54.0, 104.0, 48.0]) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.62 * w_nile_ribbon[..., None]) + nile_ribbon_rgb * (0.62 * w_nile_ribbon[..., None])

    # 2. The Great Double Delta (`rmvdoubledelta`): lush Nile/Amazon-style marsh islands + sponge/sea-pen tidal flats
    w_delta_st = w_delta_zone * (~whas_exp).astype(float)
    delta_island_rgb = (
        np.array([58.0, 106.0, 56.0]) * G.sstep(1.5, 6.5, En_exp)[..., None]
        + np.array([112.0, 126.0, 84.0]) * (1.0 - G.sstep(1.5, 6.5, En_exp)[..., None])
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.68 * w_delta_st[..., None]) + delta_island_rgb * (0.68 * w_delta_st[..., None])

    # 3. Arachnoid Canyons & Northern Korona Scenic Gorge (*The Web-Cleaver Gorge*):
    # Fine-structured volcanic-tectonic basalt dike ribs, terraced warm terracotta-ochre grabens, and riparian canyon floor
    w_rib_st = np.clip(meta_nw['arach_rib_h'] / 210.0, 0.0, 1.0) * (~whas_exp).astype(float)
    st_clim_exp = st_clim_exp * (1.0 - 0.62 * w_rib_st[..., None]) + (np.array([86.0, 62.0, 50.0]) * shade_exp) * (0.62 * w_rib_st[..., None])

    w_trough_st = arach_trough_w * (1.0 - w_canyon) * (~whas_exp).astype(float)
    st_clim_exp = st_clim_exp * (1.0 - 0.56 * w_trough_st[..., None]) + (np.array([142.0, 102.0, 72.0]) * shade_exp) * (0.56 * w_trough_st[..., None])

    w_gorge_wall = np.clip(w_canyon * (1.0 - w_canyon) * 4.0, 0.0, 1.0) * (~whas_exp).astype(float)
    st_clim_exp = st_clim_exp * (1.0 - 0.68 * w_gorge_wall[..., None]) + (np.array([74.0, 50.0, 40.0]) * shade_exp) * (0.68 * w_gorge_wall[..., None])

    w_gorge_floor = G.sstep(0.55, 0.92, w_canyon) * (~whas_exp).astype(float)
    st_clim_exp = st_clim_exp * (1.0 - 0.68 * w_gorge_floor[..., None]) + (np.array([68.0, 110.0, 56.0]) * shade_exp) * (0.68 * w_gorge_floor[..., None])

    # 4. Southern Copper Glacier & Crook–Rift Glacial Pass (`rmvcopperglacier`):
    # Banded verdigris/malachite glacial ice `[128, 212, 190]` & azurite moraines `[82, 142, 130]`
    r_cop_glac = np.hypot((X_exp - 158.0) * 0.95, (Y_exp - 1218.0) * 0.75)
    w_cop_glac = (
        np.maximum(1.0 - G.sstep(38.0, 95.0, r_cop_glac), 0.75 * w_sw_connector)
        * G.sstep(2150.0, 2750.0, En_exp) * (1.0 - G.sstep(4600.0, 5400.0, En_exp))
        * (1.0 - w_sw_outer) * (~whas_exp).astype(float)
    )
    cop_band = 0.5 + 0.5 * np.sin(En_exp / 110.0 * 2.0 * math.pi + X_exp * 0.08)
    cop_ice_rgb = (
        np.array([132.0, 214.0, 192.0]) * (1.0 - 0.45 * cop_band[..., None])
        + np.array([78.0, 164.0, 152.0]) * (0.45 * cop_band[..., None])
    ) * np.clip(shade_exp, 0.78, 1.16)
    st_clim_exp = st_clim_exp * (1.0 - 0.82 * w_cop_glac[..., None]) + cop_ice_rgb * (0.82 * w_cop_glac[..., None])

    # 5. NE Tharn Cold-Dry Uplands (`rmvtharnuplands`): windswept ochre-russet desert highland slope
    w_tharn_st = w_tharn * (~whas_exp).astype(float) * (1.0 - G.sstep(5600.0, 6300.0, En_exp))
    st_clim_exp = st_clim_exp * (1.0 - 0.65 * w_tharn_st[..., None]) + (np.array([166.0, 138.0, 110.0]) * shade_exp) * (0.65 * w_tharn_st[..., None])

    # 5B. S Outlands <-> Region 99 Connecting Pass (`w_sout_pass_exp`):
    # Warm Outlands / Loom-Chasms canyon ochre-tan-russet palette matching both S Outlands and Region 99 without white snow stripes!
    u_sout_elev = np.clip((En_exp - 2050.0) / 3400.0, 0.0, 1.0)[..., None]
    sout_pass_rgb = (
        np.array([138.0, 108.0, 78.0]) * ((1.0 - u_sout_elev) ** 1.3)
        + np.array([164.0, 114.0, 86.0]) * (2.0 * u_sout_elev * (1.0 - u_sout_elev))
        + np.array([128.0, 58.0, 40.0]) * (u_sout_elev ** 1.3)
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.85 * w_sout_pass_exp[..., None]) + sout_pass_rgb * (0.85 * w_sout_pass_exp[..., None])

    # 6. High Alpine Snow & Glaciers (`4,150 m <= En_exp < 8,200 m`) & Airless Dark Rust-Red Outer Plateau (`En_exp >= 7,600 m`):
    # Matches the exact elevation-driven snow rim + dark rust-red airless outer flank of the existing map!
    snow_thresh = np.where((w_tharn > 0.3) | (w_sout_pass_exp > 0.15), 5850.0, 4150.0)
    w_snow_exp = (
        G.sstep(snow_thresh, snow_thresh + 750.0, En_exp)
        * (1.0 - G.sstep(7400.0, 8600.0, En_exp))
        * (~whas_exp).astype(float)
        * (1.0 - 0.72 * w_cop_glac)
        * (1.0 - 0.88 * w_sout_pass_exp)
    )
    st_clim_exp = st_clim_exp * (1.0 - 0.88 * w_snow_exp[..., None]) + (np.array([238.0, 240.0, 244.0]) * np.clip(shade_exp, 0.74, 1.16)) * (0.88 * w_snow_exp[..., None])

    w_airless_rust = G.sstep(7200.0, 8500.0, En_exp) * (~whas_exp).astype(float)
    airless_rust_rgb = np.array([124.0, 48.0, 30.0]) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.90 * w_airless_rust[..., None]) + airless_rust_rgb * (0.90 * w_airless_rust[..., None])

    # 8. Ocean, Double Delta Channels, Explosive Seamount Shoals, Eastern Highland Lake, & Copper Tarn on `st`:
    ocean_deep_rgb = np.median(st_int[:160, :160][whas3_1393[:160, :160]], axis=0) if whas3_1393[:160, :160].any() else np.array([34.0, 74.0, 96.0])
    ocean_shall_rgb = np.array([56.0, 114.0, 124.0])
    w_deep_sea = G.sstep(0.0, 24.0, din_water_exp)[..., None]
    st_sea_col = ocean_shall_rgb * (1.0 - w_deep_sea) + ocean_deep_rgb * w_deep_sea

    w_sm_plume = (meta_nw['is_seamount'] & whas_exp)[..., None] * G.sstep(-320.0, -10.0, En_exp)[..., None]
    st_sea_col = st_sea_col * (1.0 - 0.68 * w_sm_plume) + np.array([78.0, 172.0, 168.0]) * (0.68 * w_sm_plume)
    st_sea_col = np.where(is_copper_tarn[..., None], np.array([52.0, 184.0, 162.0]), st_sea_col)
    st_sea_col = np.where(is_high_lake[..., None], np.array([42.0, 108.0, 128.0]), st_sea_col)

    st_syn_exp = np.where(whas_exp[..., None], st_sea_col * np.clip(shade_exp, 0.86, 1.12), st_clim_exp)
    st_final_exp = np.clip(st_pad.astype(float) * (1.0 - w_exp_paint) + st_syn_exp * w_exp_paint, 0.0, 255.0).round().astype(np.uint8)

    # =========================================================================
    # STEP 7: Shift All Vector Layers by (+272, +330), Add New Features, & Audit Settlements
    # =========================================================================
    print('--- Step 7: Shifting Vector Stores by (+272, +330) & Adding New 4.25 Features ---')
    D_new = copy.deepcopy(D_old)
    D_new['w'] = NEW_OW
    D_new['hh'] = NEW_OH
    D_new['fullW'] = NEW_OW
    D_new['fullH'] = NEW_OH

    # 7A. Shift `volc`
    volc_exp = copy.deepcopy(volc_1393)
    volc_exp['px'] = shift_pt(volc_exp['px'])
    D_new['volc'] = volc_exp

    # 7B. Shift `vents` and append `meta_nw['new_vents']`
    vents_exp = []
    for v in vents_1393:
        v2 = copy.deepcopy(v)
        v2['px'] = shift_pt(v2['px'])
        vents_exp.append(v2)
    for nv in meta_nw['new_vents']:
        vents_exp.append(copy.deepcopy(nv))
    D_new['vents'] = vents_exp

    # 7C. Build Lava Tubes (`D_new['tubes']`) and Zeijani Cavern Settlements (already shifted by dx=272, dy=330)
    tubes_list, new_zeijani_setts = VOLC.build_tubes_and_zeijani_data(dx=float(DX), dy=float(DY))
    D_new['tubes'] = tubes_list
    print(f'  Lava tube & cavern networks generated: {len(tubes_list)} systems')

    # 7D. Assign `rivers_exp` (already shifted, meandered, and incised into `En_exp` in Step 5B)
    D_new['rivers'] = rivers_exp

    # Paint the new N/W rivers onto `st_final_exp` and `t_final_exp`
    D_paint_tmp = {
        'st': P.b64(Image.fromarray(st_final_exp, 'RGB'), 'JPEG', quality=92),
        't': P.b64(Image.fromarray(t_final_exp, 'RGB'), 'JPEG', quality=92),
    }
    for nr in meta_nw['new_rivers']:
        D_paint_tmp['st'] = PA.paint_river(D_paint_tmp, 'st', nr['px'], width=2.0, colour=(52, 104, 128))
        D_paint_tmp['t'] = PA.paint_river(D_paint_tmp, 't', nr['px'], width=1.8, colour=(58, 112, 132))
    st_final_exp = np.array(Image.open(io.BytesIO(base64.b64decode(D_paint_tmp['st']))).convert('RGB'))
    t_final_exp = np.array(Image.open(io.BytesIO(base64.b64decode(D_paint_tmp['t']))).convert('RGB'))

    # 7E. Shift `outlets`, `palaeolakes`, `dams`, `floods`, `basins`, `hydro`
    outlets_exp = copy.deepcopy(D_old.get('outlets', []))
    for o in outlets_exp:
        if isinstance(o.get('from'), list) and len(o['from']) == 2:
            o['from'] = shift_pt(o['from'])
        if 'px' in o:
            o['px'] = shift_pts(o['px'])
    D_new['outlets'] = outlets_exp

    palaeo_exp = copy.deepcopy(D_old.get('palaeolakes', []))
    for pl in palaeo_exp:
        if 'seed_px' in pl:
            pl['seed_px'] = shift_pt(pl['seed_px'])
    D_new['palaeolakes'] = palaeo_exp

    dams_exp = copy.deepcopy(D_old.get('dams', []))
    for dm in dams_exp:
        if 'site_px' in dm:
            dm['site_px'] = shift_pt(dm['site_px'])
    D_new['dams'] = dams_exp

    floods_exp = copy.deepcopy(D_old.get('floods', []))
    for fl in floods_exp:
        if 'px' in fl:
            fl['px'] = shift_pts(fl['px'])
    D_new['floods'] = floods_exp

    basins_exp = copy.deepcopy(D_old.get('basins', []))
    for bs in basins_exp:
        if 'at_px' in bs:
            bs['at_px'] = shift_pt(bs['at_px'])
    D_new['basins'] = basins_exp

    hydro_exp = copy.deepcopy(D_old.get('hydro', {}))
    if 'books' in hydro_exp and 'sealed' in hydro_exp['books']:
        for sl in hydro_exp['books']['sealed']:
            if 'at_px' in sl:
                sl['at_px'] = [int(round(sl['at_px'][0] + DX)), int(round(sl['at_px'][1] + DY))]
    D_new['hydro'] = hydro_exp

    # 7F. Shift `regions` by (+272, +330) and append `meta_nw['new_regions']`
    regs_exp = []
    for r in regs_1393:
        r2 = copy.deepcopy(r)
        r2['points'] = [[int(round(p[0] + DX)), int(round(p[1] + DY))] for p in r['points']]
        regs_exp.append(r2)
    existing_reg_ids = {r['id'] for r in regs_exp}
    for nr in meta_nw['new_regions']:
        if nr['id'] not in existing_reg_ids:
            regs_exp.append(copy.deepcopy(nr))
    print(f'  Total regions on expanded map: {len(regs_exp)} (added {len(meta_nw["new_regions"])} new N/W regions)')

    # 7G. Shift `settlements` by (+272, +330), append Zeijani cavern settlements, and run Automated Audit & Snap (<= 50 km / <= 25 px)
    print('--- Step 7G: Running Automated Settlement Audit & Snap (<= 50 km / 25 px rule) ---')
    setts_exp = []
    for s in setts_1393:
        s2 = copy.deepcopy(s)
        s2['px'] = int(round(s['px'] + DX))
        s2['py'] = int(round(s['py'] + DY))
        setts_exp.append(s2)
    existing_sett_ids = {s['id'] for s in setts_exp}
    for zs in new_zeijani_setts:
        if zs['id'] not in existing_sett_ids:
            zs2 = copy.deepcopy(zs)
            zs2['px'] = int(round(zs2['px']))
            zs2['py'] = int(round(zs2['py']))
            setts_exp.append(zs2)

    # Compute local slope (m/km) on En_exp to detect any settlement on an unbuildable cliff (>500 m/km)
    gy_s, gx_s = np.gradient(En_exp, 2.0)
    slope_m_per_km = np.hypot(gx_s, gy_s)

    # Settlements intentionally built on shallow lake shelves or cliffs
    SHALLOW_WATER_ALLOWED = {'Mungo', 'Reed', 'Flooded Tower'}
    CLIFF_ARCOLOGIES = {'Ledge', 'Verge', "Trickster's House", 'Span', 'Hook', 'Dhelv', 'Šurpu-Dhelv', 'Qarnu-Tūbu', 'Nūru-Šaplu'}

    audit_report = []
    auto_moved = []
    worse_problems = []
    old_c_grid = P.raster(D_old, 'c', 'L')

    for s in setts_exp:
        nm = s['name']
        if nm == 'Flooded Tower' or s.get('id') == 'su9oc1m9io':
            # Explicitly position Flooded Tower on its shallow (<20 m) Ring Sea bay shelf at (1028, 840)
            s['px'], s['py'] = 1028, 840
        sx, sy = int(s['px']), int(s['py'])
        # Original unshifted coordinates for reference in Eo_1393
        ox, oy = sx - DX, sy - DY
        in_old_bounds = (0 <= oy < OLD_OH) and (0 <= ox < OLD_OW)

        old_elev = float(Eo_1393[oy, ox]) if in_old_bounds else float(En_exp[sy, sx])
        old_wet = bool(whas0_1393[oy, ox]) if in_old_bounds else False
        old_cls = codes[int(old_c_grid[oy, ox])] if in_old_bounds else codes[int(cls_exp[sy, sx])]

        new_elev = float(En_exp[sy, sx])
        new_wet = bool(whas_exp[sy, sx])
        new_wlev = float(wlev_exp[sy, sx]) if new_wet else None
        new_cls = codes[int(cls_exp[sy, sx])]
        new_slope = float(slope_m_per_km[sy, sx])

        # Check if settlement has an issue at (sx, sy):
        # 1. Submerged in water when it shouldn't be (or >19.8 m deep for Flooded Tower, >12 m for Mungo/Reed)
        submerged_bad = False
        if new_wet:
            if nm in SHALLOW_WATER_ALLOWED:
                depth = (new_wlev or 0.0) - new_elev
                max_allow_depth = 19.8 if nm == 'Flooded Tower' else 12.0
                if depth > max_allow_depth:
                    submerged_bad = True
            elif not old_wet:
                submerged_bad = True

        # 2. Extreme elevation displacement (> 450 m change from old_elev, unless it's Pluton or a remodeled volcano/abyss settlement)
        elev_delta = abs(new_elev - old_elev)
        elev_bad = (elev_delta > 450.0) and (
            nm not in {'Pluton', "Noa's Regret", "Zey'danin", 'Dhelv', 'Mantis', 'Locus', 'Verge', 'Mungo', 'Reed', 'Šurpu-Dhelv', 'Qarnu-Tūbu', 'Nūru-Šaplu'}
            and s['id'] not in {'szeij_surpu01', 'szeij_qarnu02', 'szeij_nuru03'}
        )

        if submerged_bad or elev_bad:
            # Search within <= 25 px (50 km) for the closest valid land cell matching target elevation & climate
            y0_s, y1_s = max(0, sy - 25), min(NEW_OH, sy + 26)
            x0_s, x1_s = max(0, sx - 25), min(NEW_OW, sx + 26)
            yy_s, xx_s = np.mgrid[y0_s:y1_s, x0_s:x1_s]
            dist_px = np.hypot(xx_s - sx, yy_s - sy)
            cand_mask = (dist_px <= 25.0) & (~whas_exp[y0_s:y1_s, x0_s:x1_s])
            if nm in SHALLOW_WATER_ALLOWED:
                cand_mask = (dist_px <= 25.0) & (
                    (~whas_exp[y0_s:y1_s, x0_s:x1_s])
                    | ((wlev_exp_raw[y0_s:y1_s, x0_s:x1_s] - En_exp[y0_s:y1_s, x0_s:x1_s]) <= 6.0)
                )
            if cand_mask.any():
                # Score candidates by distance + elevation similarity
                c_elev = En_exp[y0_s:y1_s, x0_s:x1_s]
                score = dist_px * 2.0 + np.abs(c_elev - old_elev) / 80.0
                score = np.where(cand_mask, score, 1e12)
                best_idx = np.unravel_index(np.argmin(score), score.shape)
                ny, nx = int(y0_s + best_idx[0]), int(x0_s + best_idx[1])
                move_km = float(np.hypot(nx - sx, ny - sy) * 2.0)
                s['px'], s['py'] = nx, ny
                auto_moved.append({
                    'name': nm,
                    'from_px': [sx, sy],
                    'to_px': [nx, ny],
                    'move_km': round(move_km, 1),
                    'reason': 'submerged' if submerged_bad else f'elev_delta={elev_delta:.0f}m',
                    'elev_m': round(float(En_exp[ny, nx]), 1),
                    'climate': codes[int(cls_exp[ny, nx])],
                })
                sx, sy = nx, ny
                new_elev = float(En_exp[sy, sx])
                new_wet = bool(whas_exp[sy, sx])
                new_cls = codes[int(cls_exp[sy, sx])]
            else:
                worse_problems.append({
                    'name': nm,
                    'px': [sx, sy],
                    'reason': 'No matching site within 50 km (25 px)',
                    'old_elev_m': round(old_elev, 1),
                    'new_elev_m': round(new_elev, 1),
                })

        audit_report.append({
            'name': nm,
            'type': s['type'],
            'px': [sx, sy],
            'elev_m': round(new_elev, 1),
            'old_elev_m': round(old_elev, 1),
            'wet': new_wet,
            'climate': new_cls,
            'old_climate': old_cls,
            'slope_m_km': round(new_slope, 1),
        })

    print(f'  Settlements audited: {len(audit_report)} | Auto-moved (<=50 km): {len(auto_moved)} | Worse problems (>50 km): {len(worse_problems)}')
    for mv in auto_moved:
        print(f'    [AUTO-MOVED] {mv["name"]}: {mv["from_px"]} -> {mv["to_px"]} ({mv["move_km"]} km) | {mv["reason"]} -> {mv["elev_m"]} m ({mv["climate"]})')
    for wp in worse_problems:
        print(f'    [PROBLEM >50km] {wp["name"]}: {wp}')

    # 7H. Culturally & Linguistically Authentic River Naming Pass Across All 27 Tongues & Dialects
    print('--- Step 7H: Renaming All Rivers & Wadis Across All 27 Cultural Tongues & Dialects ---')
    river_md_path = os.path.join(HERE, 'river-names-5.1.md')
    rivers_exp, tongue_counts = RN.rename_all_rivers_culturally(
        rivers_exp, regs_exp, setts_exp, En_exp=En_exp, markdown_out_path=river_md_path
    )
    D_new['rivers'] = rivers_exp
    top_tongues_str = ', '.join(f'{k}:{v}' for k, v in sorted(tongue_counts.items(), key=lambda kv: -kv[1])[:10])
    print(f'  Named {len(rivers_exp)} rivers across {len(tongue_counts)} tongues (top: {top_tongues_str})')

    # =========================================================================
    # STEP 8: Encode All Rasters into `D_new`, Update `climate.present`, and Save
    # =========================================================================
    print('--- Step 8: Encoding Full-Resolution 1821x1723 Rasters & Saving model/data/ ---')
    total_px_exp = float(cls_exp.size)
    present_map = {e['code']: e for e in D_new['climate']['present']}
    new_present = []
    for c_meta in D_new['climate']['classes']:
        c_code = c_meta['code']
        c_idx = idx[c_code]
        cnt = int((cls_exp == c_idx).sum())
        if cnt > 0 or c_code in present_map:
            pct = round(cnt / total_px_exp * 100.0, 2)
            km2 = cnt * 4
            new_present.append({
                'code': c_code,
                'name': c_meta['name'],
                'color': c_meta['color'],
                'pct': pct,
                'km2': km2,
            })
    new_present.sort(key=lambda x: x['km2'], reverse=True)
    D_new['climate']['present'] = new_present

    D_new['h'] = P.encode_heights(D_new, En_exp, whas_exp)
    D_new['wl'] = P.encode_levels(D_new, whas_exp, wlev_exp)
    D_new['wd'] = P.b64(Image.fromarray(wd_exp, 'RGB'), optimize=True)
    for k in C.TEMPS:
        D_new[k] = P.b64(Image.fromarray(np.clip(np.round(out_temps_exp[k] + 90.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D_new['p'] = P.b64(Image.fromarray(np.clip(np.round(rain_exp / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D_new['c'] = P.b64(Image.fromarray(cls_exp.astype(np.uint8), 'L'), optimize=True)
    D_new['z'] = P.b64(Image.fromarray(zon_exp.astype(np.uint8), 'L'), optimize=True)
    D_new['st'] = P.b64(Image.fromarray(st_final_exp, 'RGB'), 'JPEG', quality=92)
    D_new['t'] = P.b64(Image.fromarray(t_final_exp, 'RGB'), 'JPEG', quality=92)
    D_new['rt'] = P.b64(Image.fromarray(rt_final_exp, 'RGB'), 'JPEG', quality=92)
    D_new['ct'] = P.b64(Image.fromarray(ct_final_exp, 'RGB'), 'JPEG', quality=92)

    P.save(D_new)

    # Update `openworld/little-demo/source/regions.json` & `settlements.json`
    with open(regs_json_path, 'w', encoding='utf-8') as f:
        json.dump(regs_exp, f, indent=1)
    with open(setts_json_path, 'w', encoding='utf-8') as f:
        json.dump(setts_exp, f, indent=1)

    # Update `51-region-store.js` and `60-settlements.js` with shifted defaults + `krator.canvas50` localStorage migration
    new_reg_ids_50 = [
        'rmvraoas90co7', 'rmvhighrift100', 'rmvstalkergate', 'rmvmidbasin101',
        'rmvriavalley', 'rmvdoubledelta', 'rmvarachnoids', 'rmvthearch',
        'rmvseamounts', 'rmvthecrook', 'rmvcopperglacier', 'rmvtharnuplands', 'rmvoutlandpass',
    ]
    reg_js_new = f"""  function localSave(){{ try{{ localStorage.setItem('krator.regions',JSON.stringify([...regions.values()])); }}catch(e){{}} }}
  function localLoad(){{
    try{{
      if(localStorage.getItem('krator.canvas50')!=='1'){{
        localStorage.removeItem('krator.regions');
        localStorage.removeItem('krator.settlements');
        localStorage.setItem('krator.canvas50','1');
      }}
    }}catch(e){{}}
    {{
      const defRegs = {json.dumps(regs_exp)};
      defRegs.forEach(r=>regions.set(r.id,r));
    }}
    try{{ const j=JSON.parse(localStorage.getItem('krator.regions')||'[]'); j.forEach(r=>{{ if(r&&r.id&&Array.isArray(r.points)) regions.set(r.id,r); }}); }}catch(e){{}}
    try{{
      if(localStorage.getItem('krator.regAdded.5.0')!=='1'){{
        {json.dumps(new_reg_ids_50)}.forEach(id=>{{
          const d=regions.get(id); if(d) regions.set(id,d);
        }});
        localStorage.setItem('krator.regAdded.5.0','1');
        localSave();
      }}
    }}catch(e){{}}
  }}
"""
    reg_store_updated = re.sub(
        r'  function localSave\(\)\{.*?  async function save\(r\)\{',
        lambda m: reg_js_new + '  async function save(r){',
        reg_store_txt,
        flags=re.S
    )
    with open(reg_store_path, 'w', encoding='utf-8') as f:
        f.write(reg_store_updated)

    # Update `60-settlements.js`
    sett_added_50 = [s for s in setts_exp if s['id'] in {'sostrukhyuni01', 'sloomspindle01', 'szeij_surpu01', 'szeij_qarnu02', 'szeij_nuru03'}]
    sett_block_new = f"""  try{{
    if(localStorage.getItem('krator.canvas50')!=='1'){{
      localStorage.removeItem('krator.settlements');
      localStorage.setItem('krator.canvas50','1');
    }}
    const raw=localStorage.getItem('krator.settlements');
    if(raw) JSON.parse(raw).forEach(s=>settlements.set(s.id,s));
  }}catch(e){{}}
  if(settlements.size===0){{
    const defSetts = {json.dumps(setts_exp, ensure_ascii=False)};
    defSetts.forEach(s=>settlements.set(s.id,s));
  }}
  // 5.0: settlements added by a model version reach browsers that already hold a saved list, once each
  const SETT_ADDED={{
    '5.0':{json.dumps(sett_added_50, ensure_ascii=False)}
  }};"""
    sett_store_updated = re.sub(
        r'(  bSettAdd\.onclick=[^\n]*\n[^\n]*\n[^\n]*\n)  try\{.*?  Object\.keys\(SETT_ADDED\)',
        lambda m: m.group(1) + sett_block_new + '\n  Object.keys(SETT_ADDED)',
        sett_store_txt,
        flags=re.S
    )
    with open(sett_store_path, 'w', encoding='utf-8') as f:
        f.write(sett_store_updated)

    # Build HTML viewer via model/build.py
    print('--- Step 9: Running model/build.py & Exporting Scale Model 5.1 + Verification Crops ---')
    subprocess.check_call([sys.executable, os.path.join(HERE, 'model', 'build.py')])

    dist_html = os.path.join(HERE, 'model', 'dist', 'scale-model.html')
    out_51 = os.path.join(HERE, 'scale-model-5.1.html')
    out_50 = os.path.join(HERE, 'scale-model-5.0.html')
    out_424 = os.path.join(HERE, 'scale-model-4.24.html')
    shutil.copy2(dist_html, out_51)
    shutil.copy2(dist_html, out_50)
    shutil.copy2(dist_html, out_424)

    artifact_dir = 'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc'
    artifact_html = os.path.join(artifact_dir, 'scale-model-artifact.html')
    if os.path.exists(artifact_dir):
        shutil.copy2(dist_html, artifact_html)
        if os.path.exists(river_md_path):
            shutil.copy2(river_md_path, os.path.join(artifact_dir, 'river-names-5.1.md'))

    # Save audit report JSON
    report_path = os.path.join(HERE, 'build_425_report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            'dimensions': {'w': NEW_OW, 'hh': NEW_OH, 'fullW': NEW_OW, 'fullH': NEW_OH, 'dx': DX, 'dy': DY},
            'auto_moved_settlements': auto_moved,
            'worse_problems': worse_problems,
            'settlements_total': len(setts_exp),
            'regions_total': len(regs_exp),
            'rivers_total': len(rivers_exp),
            'river_tongue_counts': tongue_counts,
            'tubes_total': len(tubes_list),
            'settlement_audit': audit_report,
        }, f, indent=2)

    # Save verification crops to artifact directory
    scratch_dir = os.path.join(artifact_dir, 'scratch')
    os.makedirs(scratch_dir, exist_ok=True)

    # 1. Full expanded overview (st, t, ct, rt)
    Image.fromarray(st_final_exp).save(os.path.join(artifact_dir, 'master425_overview_st.jpg'), 'JPEG', quality=92)
    Image.fromarray(t_final_exp).save(os.path.join(artifact_dir, 'master425_overview_t.jpg'), 'JPEG', quality=92)
    Image.fromarray(ct_final_exp).save(os.path.join(artifact_dir, 'master425_overview_ct.jpg'), 'JPEG', quality=92)

    # 2. Crop: Ria River Valley, Double Delta, & Arachnoid Scenic Canyon (X=480..1520, Y=0..680)
    Image.fromarray(st_final_exp[0:680, 480:1520]).save(os.path.join(artifact_dir, 'master425_ria_arachnoids_st.png'))
    Image.fromarray(t_final_exp[0:680, 480:1520]).save(os.path.join(artifact_dir, 'master425_ria_arachnoids_t.png'))

    # 3. Crop: The Arch, Explosive Seamounts, & The Crook / Copper Glacier (X=0..620, Y=0..1450)
    Image.fromarray(st_final_exp[0:1450, 0:620]).save(os.path.join(artifact_dir, 'master425_arch_crook_st.png'))
    Image.fromarray(t_final_exp[0:1450, 0:620]).save(os.path.join(artifact_dir, 'master425_arch_crook_t.png'))

    # 4. Crop: Tranche 2 — Scablands, Dams, NW Lowlands, Painted Highlands, & N Highlands (X=460..1240, Y=360..920)
    Image.fromarray(st_final_exp[360:920, 460:1240]).save(os.path.join(artifact_dir, 'master51_tranche2_north_st.png'))
    Image.fromarray(t_final_exp[360:920, 460:1240]).save(os.path.join(artifact_dir, 'master51_tranche2_north_t.png'))

    # 5. Crop: Tranche 2 — Tiers, N/S Outlands, Yuni Valley, E Badlands, & SE Desert (X=1150..1821, Y=330..1120)
    Image.fromarray(st_final_exp[330:1120, 1150:1821]).save(os.path.join(artifact_dir, 'master51_tranche2_east_st.png'))
    Image.fromarray(t_final_exp[330:1120, 1150:1821]).save(os.path.join(artifact_dir, 'master51_tranche2_east_t.png'))

    # 6. Crop: Tranche 3 — S Highlands, Rift, Rift Rim, Xanadu, Oidong, & The Catch (X=420..1340, Y=920..1680)
    Image.fromarray(st_final_exp[920:1680, 420:1340]).save(os.path.join(artifact_dir, 'master51_tranche3_south_st.png'))
    Image.fromarray(t_final_exp[920:1680, 420:1340]).save(os.path.join(artifact_dir, 'master51_tranche3_south_t.png'))

    print(f'=== Scale Model 5.1 Master Build Completed in {time.time() - t_start:.1f}s ===')


if __name__ == '__main__':
    main()
