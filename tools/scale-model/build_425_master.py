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
       15 Subterranean Lava Tube & Cavern Systems (`tubes.json` / `bTubes`), and 3 Zeijani Cavern Settlements.
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
import gc
import io
import json
import math
import os
import re
import shutil
import subprocess
import sys
import time

os.environ.setdefault('OPENBLAS_NUM_THREADS', '1')
os.environ.setdefault('MKL_NUM_THREADS', '1')
os.environ.setdefault('OMP_NUM_THREADS', '1')
os.environ.setdefault('NUMEXPR_NUM_THREADS', '1')

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

DX, DY = P.LEGACY_SHIFT
OLD_OW, OLD_OH = P.LEGACY_FULL_SIZE
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
    model_json_path = os.path.join(HERE, 'model', 'data', 'model.json')
    m_meta = {o['key']: o.get('value') for o in json.load(open(model_json_path, encoding='utf-8'))['keys'] if 'value' in o}
    if (m_meta.get('fullH'), m_meta.get('fullW')) != (OLD_OH, OLD_OW):
        print('  Restoring 1549x1393 baseline model/data from commit eabeb2039 before running 5.1 master pipeline...')
        subprocess.check_call([
            'git', 'checkout', 'eabeb2039', '--',
            'tools/scale-model/model/data',
        ], cwd=REPO_ROOT)
    D_old = P.load()
    OH0, OW0 = D_old['fullH'], D_old['fullW']
    assert (OH0, OW0) == (OLD_OH, OLD_OW), f'Expected D_old fullH/fullW = (1393, 1549), got {(OH0, OW0)}'

    # Read 1393x1549 baseline regions and settlements from commit eabeb2039 for the interior passes (Steps 2A-2F),
    # while preserving any user edits in openworld/little-demo/source/regions.json & settlements.json!
    regs_json_path = os.path.join(REPO_ROOT, 'openworld', 'little-demo', 'source', 'regions.json')
    setts_json_path = os.path.join(REPO_ROOT, 'openworld', 'little-demo', 'source', 'settlements.json')
    user_regs_1821 = json.load(open(regs_json_path, encoding='utf-8')) if os.path.exists(regs_json_path) else []
    user_setts_1821 = json.load(open(setts_json_path, encoding='utf-8')) if os.path.exists(setts_json_path) else []
    reg_store_path = os.path.join(HERE, 'model', 'src', '51-region-store.js')
    reg_store_txt = open(reg_store_path, encoding='utf-8').read()
    sett_store_path = os.path.join(HERE, 'model', 'src', '60-settlements.js')
    sett_store_txt = open(sett_store_path, encoding='utf-8').read()

    regs_1393 = json.loads(subprocess.check_output(['git', 'show', 'eabeb2039:openworld/little-demo/source/regions.json'], cwd=REPO_ROOT).decode('utf-8'))
    setts_1393 = json.loads(subprocess.check_output(['git', 'show', 'eabeb2039:openworld/little-demo/source/settlements.json'], cwd=REPO_ROOT).decode('utf-8'))
    reg_store_eab = subprocess.check_output(['git', 'show', 'eabeb2039:tools/scale-model/model/src/51-region-store.js'], cwd=REPO_ROOT).decode('utf-8')
    m_def_regs = re.search(r'const defRegs = (\[.*?\]);', reg_store_eab, re.S)
    if m_def_regs:
        def_regs_list = json.loads(m_def_regs.group(1))
        known_rids = {r['id'] for r in regs_1393}
        for r in def_regs_list:
            if r['id'] not in known_rids:
                regs_1393.append(copy.deepcopy(r))
            else:
                for idx_r, rr in enumerate(regs_1393):
                    if rr['id'] == r['id']:
                        regs_1393[idx_r] = copy.deepcopy(r)
                        break

    sett_store_eab = subprocess.check_output(['git', 'show', 'eabeb2039:tools/scale-model/model/src/60-settlements.js'], cwd=REPO_ROOT).decode('utf-8')
    m_def_setts = re.search(r'const defSetts = (\[.*?\]);', sett_store_eab, re.S)
    if m_def_setts:
        def_setts_list = json.loads(m_def_setts.group(1))
        known_sids = {s['id'] for s in setts_1393}
        for s in def_setts_list:
            if s['id'] not in known_sids:
                setts_1393.append(copy.deepcopy(s))
    for extra_s in [
        {"id": "sostrukhyuni01", "name": "Ostrukh-on-Water", "type": "village", "px": 1244, "py": 1141, "notes": "Yuni agricultural outpost on fresh Lake Ostrukh: terrace farming, qanats, and staging for Siphon Pit expeditions.", "createdAt": "2026-10-28T12:55:00.000Z"},
        {"id": "sloomspindle01", "name": "Spindle Fan", "type": "village", "px": 1289, "py": 810, "notes": "Yuni farming and spring outpost on the Weavers' Cradle piedmont fan: terraced crops supporting expeditions into the Loom-Chasms.", "createdAt": "2026-10-28T12:55:00.000Z"},
        {"id": "stallwalls01", "name": "Tallwalls", "type": "city", "px": 378, "py": 938, "notes": "The greatest haven and fortress of the Free Giants (the Vrivolci, LORE.md 6.17, 6.21) and a sanctuary for escaped slaves of every people fleeing the Vothic Kingdom and the Realm of Dalab. Built of cyclopean columnar basalt and tier-cedar murus gallicus on the middle flood-basalt lava terrace of Greenstep (+1,980 m, Cfa/Cfb) above the confluence of the Clodosriba lava-tube rilles. Called Talodunon in their borrowed Talovolci Gaulish and Da-Talwal in Vrivolci creole. biomes/greenstep/PLAN.md.", "createdAt": "2026-11-06T20:00:00.000Z"},
    ]:
        if not any(s['id'] == extra_s['id'] for s in setts_1393):
            setts_1393.append(copy.deepcopy(extra_s))
        else:
            for idx_s, ss in enumerate(setts_1393):
                if ss['id'] == extra_s['id']:
                    setts_1393[idx_s] = copy.deepcopy(extra_s)
                    break

    # =========================================================================
    # STEP 1: Upsample Base Height & Water Grids to 1393x1549 (2 km/cell)
    # =========================================================================
    print('--- Step 1: Upsampling D_old height & water grids from (696, 774) to unified (1393, 1549) 2 km/cell ---')
    Eo_half, _ = P.heights(D_old)
    whas0_half, wlev0_half = P.water_levels(D_old)

    zoom_to_1393 = (OLD_OH / Eo_half.shape[0], OLD_OW / Eo_half.shape[1])
    Eo_1393 = nd.zoom(Eo_half, zoom_to_1393, order=1)[:OLD_OH, :OLD_OW]
    whas0_1393 = nd.zoom(whas0_half.astype(np.uint8), zoom_to_1393, order=0)[:OLD_OH, :OLD_OW].astype(bool)
    # Propagate water levels strictly from wet cells (`order=0`) so lake edges are NEVER bilinearly averaged with dry cliff walls!
    _, (wy0_h, wx0_h) = nd.distance_transform_edt(~whas0_half, return_indices=True)
    wlev_half_clean = np.nan_to_num(wlev0_half, nan=Eo_half)
    wlev_wet_only = np.where(whas0_half, wlev_half_clean, wlev_half_clean[wy0_h, wx0_h])
    wlev_up = nd.zoom(wlev_wet_only, zoom_to_1393, order=0)[:OLD_OH, :OLD_OW]
    wlev0_1393 = np.where(whas0_1393, wlev_up, np.nan)
    # Ensure upsampled lake beds sit below their flat hydrostatic water surface:
    Eo_1393 = np.where(whas0_1393, np.minimum(Eo_1393, wlev_up - 2.5), Eo_1393)
    del Eo_half, whas0_half, wlev0_half, wy0_h, wx0_h, wlev_half_clean, wlev_wet_only, wlev_up
    gc.collect()

    # =========================================================================
    # STEP 2: Run the 6 Interior Enhancement Passes on (1393, 1549)
    # =========================================================================
    print('--- Step 2A: Volcano & Lava Tube Remodeling (Throne, Lesser Throne, Godthrone, Catch/Xanadu Twin Cones) ---')
    En1, whas1, wlev1, vents_1393, volc_1393, ch_volc = VOLC.remodel_volcanoes(
        Eo_1393, whas0_1393, np.nan_to_num(wlev0_1393, nan=0.0),
        regs_1393, copy.deepcopy(D_old['vents']), copy.deepcopy(D_old['volc'])
    )
    En1_volc = En1.copy()
    wlev1_nan = np.where(whas1, wlev1, np.nan)
    del wlev1
    gc.collect()
    print(f'  Volcanoes remodeled: {int(ch_volc.sum()):,} cells changed on 1393x1549')

    print('--- Step 2B: East Abyss & The Bowl Shiveria Failed-Rift Remodeling ---')
    En2, whas2_1393, wlev2_1393_num, ch_ea, meta_ea = EA.remodel_east_abyss(
        En1, whas1, wlev1_nan, regs_1393, D_old['rivers']
    )
    wlev2_1393 = np.where(whas2_1393, wlev2_1393_num, np.nan)
    del En1, whas1, wlev1_nan, wlev2_1393_num
    gc.collect()
    print(f'  East Abyss & Bowl remodeled: {int(ch_ea.sum()):,} cells changed on 1393x1549')

    print('--- Step 2C: Tier-1 Biomes Remodeling (k-Guilin, SW Highlands, W Outer Wall, The Cut, Korona / NE) ---')
    En3a, whas3a_1393, wlev3a_1393_num, ch_t1 = T1.remodel_tier1_biomes(
        En2, whas2_1393, np.nan_to_num(wlev2_1393, nan=0.0),
        regs_1393, setts_1393, D_old['rivers']
    )
    del En2, whas2_1393, wlev2_1393
    gc.collect()
    print(f'  Tier-1 Biomes remodeled: {int(ch_t1.sum()):,} cells changed on 1393x1549')

    print('--- Step 2D: Tranche-2 Biomes Remodeling (Tiers, Outlands, Stalker Range, Scablands, Dams, NW/SW Lowlands, Ancient Valley, Yeti/Farside, SE Desert/Badlands/Yuni/Painted) ---')
    En3b, whas3b_1393, wlev3b_1393_num, ch_t2 = T2.remodel_tranche2_biomes(
        En3a, whas3a_1393, wlev3a_1393_num,
        regs_1393, setts_1393, D_old['rivers'], D_old.get('floods', [])
    )
    del En3a, whas3a_1393, wlev3a_1393_num
    gc.collect()
    print(f'  Tranche-2 Biomes remodeled: {int(ch_t2.sum()):,} cells changed on 1393x1549')

    print('--- Step 2E: Tranche-3 Biomes Remodeling (N/S/E Highlands, Rift & Rim, Xanadu/Oidong/Catch, Hyperjungles, Drylands/Savannah, Ring Isles/Steampits, SW/NW Bays) ---')
    En3c, whas3c_1393, wlev3c_1393_num, ch_t3 = T3.remodel_tranche3_biomes(
        En3b, whas3b_1393, wlev3b_1393_num,
        regs_1393, setts_1393, D_old['rivers'], vents_1393
    )
    del En3b, whas3b_1393, wlev3b_1393_num
    gc.collect()
    print(f'  Tranche-3 Biomes remodeled: {int(ch_t3.sum()):,} cells changed on 1393x1549')

    print('--- Step 2F: Biome Boundary Topological & Geological Transition Pass (Piedmont Megafans, Water Gaps, Ecotone Outliers, & FBM Seam Feathering) ---')
    En3, whas3_1393, wlev3_1393_num, ch_bt = BT.apply_biome_boundary_transitions(
        Eo_1393, En3c, whas3c_1393, wlev3c_1393_num,
        regs_1393, setts_1393, D_old['rivers']
    )
    wlev3_1393 = np.where(whas3_1393, wlev3_1393_num, np.nan)
    del En3c, whas3c_1393, wlev3c_1393_num
    gc.collect()
    print(f'  Biome boundary transitions sculpted: {int(ch_bt.sum()):,} cells changed on 1393x1549')

    # Re-assert volcanic summit edifices (Lesser Throne, Throne, Godthrone, Godstep Head Vent, Twin Cones, Parasitic Cones)
    # from En1_volc so no subsequent interior pass can ever flatten a vent cone or crater rim:
    Yv_1393, Xv_1393 = np.indices((OLD_OH, OLD_OW), dtype=float)
    w_volc_reassert = np.zeros((OLD_OH, OLD_OW), dtype=float)
    for vx_c, vy_c, r_in_c, r_out_c in [
        (858.0, 524.0, 14.0, 22.0),   # Lesser Throne
        (788.0, 524.0, 22.0, 32.0),   # Throne
        (696.0, 682.0, 26.0, 38.0),   # Godthrone
        (620.8, 815.2, 6.0, 10.0),    # Godstep Head Vent
        (716.0, 1128.0, 3.5, 5.5),    # West Catch/Xanadu Twin Cone summit core
        (770.0, 1168.0, 3.5, 5.5),    # East Catch/Xanadu Twin Cone summit core
        (735.0, 1142.0, 2.0, 3.5),    # West Saddle Parasitic Cone summit core
        (752.0, 1155.0, 2.0, 3.5),    # East Saddle Parasitic Cone summit core
    ]:
        rv_c = np.hypot(Xv_1393 - vx_c, Yv_1393 - vy_c)
        w_volc_reassert = np.maximum(w_volc_reassert, 1.0 - G.sstep(r_in_c, r_out_c, rv_c))
    En3 = En3 * (1.0 - w_volc_reassert) + En1_volc * w_volc_reassert
    ch_volc |= (w_volc_reassert > 0.05)

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
    hypso_centers, hypso_meds = build_hypsometric_table(Eo_1393, whas0_1393, t0_1393.astype(float))
    del (
        st0_1393, t0_1393, rt0_1393, ct0_1393, D_int_clean, relit_int, st_int_f, t_int_f, rt_syn_1393, ct_syn_1393, En3_pre_2g, meta_ea,
        Yv_1393, Xv_1393, rv_c, Y_1393, X_1393,
        d_sout_p, z_sout_p, hw_sout_p, w_sout_core, sout_target, En3_sout_sm, w_sout_sm,
        d_sg_open, z_sg_open, hw_sg_open, w_sg_open_core, sg_open_target,
        r_vapora, r_gtarn, w_lake_keep, rn_sg, fbm_sg, En3_sg_broad, r_ftower,
        tm0_1393, surf0_1393, surf3_1393, tm3_1393, shade_1393, w_ea_blend, w_xa_p, w_xv_p, w_xw_p, w_xs_p,
        din_int_lakes, lake_int_st_col, t_int_lake_col, w_int_rc,
        mask_se5_1393, mask_stalker_1393, sout_tarn_hit,
        forced_1393, q_int, rep_int, ch_interior, new_int_lakes, volc_high,
        drained_int, drained_int_dil, ok_retint, donor_retint,
        is_ea_xa, is_ea_xv, is_ea_xw, is_ea_xs,
    )
    gc.collect()

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
    w_sasquatch_vales = meta_nw['w_sasquatch_vales']
    w_ozark_dolomite = meta_nw['w_ozark_dolomite']
    w_porphyry_vein = meta_nw['w_porphyry_vein']
    w_silent_vales = meta_nw['w_silent_vales']
    w_tsunami_scour = meta_nw['w_tsunami_scour']
    w_tsunami_chevron = meta_nw['w_tsunami_chevron']
    w_ne_outer_wall = meta_nw['w_ne_outer_wall']
    w_ne_dike_rib = meta_nw['w_ne_dike_rib']
    w_ne_cauldron = meta_nw['w_ne_cauldron']
    w_ne_skarn = meta_nw['w_ne_skarn']
    w_nw_crater_scarp = meta_nw['w_nw_crater_scarp']

    # Ensure the sheltered cool-temperate `Silent Vales` (`w_silent_vales > 0.25`) and the geothermally heated
    # `ne outer wall` Boxwork Dike-Cauldrons (`w_ne_cauldron > 0.25`) have mild temperatures on their basin floors!
    w_sv_temp = np.clip(
        np.maximum(w_silent_vales * (1.0 - G.sstep(1950.0, 2650.0, En_exp)), w_ne_cauldron * (1.0 - G.sstep(3150.0, 3550.0, En_exp))),
        0.0, 1.0
    )
    tw_sv_target = 20.2 - 0.0028 * np.maximum(0.0, En_exp - 1100.0)
    tc_sv_target = 6.2 - 0.0022 * np.maximum(0.0, En_exp - 1100.0)
    tw_exp = tw_exp * (1.0 - w_sv_temp) + tw_sv_target * w_sv_temp
    tc_exp = tc_exp * (1.0 - w_sv_temp) + tc_sv_target * w_sv_temp
    tm_exp = tm_exp * (1.0 - w_sv_temp) + (0.5 * (tw_sv_target + tc_sv_target)) * w_sv_temp
    out_temps_exp['tw'] = tw_exp
    out_temps_exp['tc'] = tc_exp
    out_temps_exp['tm'] = tm_exp

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
        + 420.0 * w_silent_vales
        + 340.0 * w_ne_cauldron
        + 180.0 * w_ne_outer_wall
        + 240.0 * w_ozark_dolomite
        - 520.0 * w_tharn
        - 580.0 * w_sw_outer
        - 220.0 * G.sstep(850.0, 1350.0, X_exp) * G.sstep(210.0, 480.0, Y_exp) * (1.0 - w_canyon) * (1.0 - w_ne_cauldron)
    )
    rain_nw_syn = nd.gaussian_filter(rain_nw_syn, sigma=2.2)
    rain_nw_syn = np.where(En_exp >= 8800.0, 0.0, np.clip(rain_nw_syn, 75.0, 3400.0))

    d_into_new = nd.distance_transform_edt(is_new_area)
    w_batch5_clim = np.maximum(
        np.maximum(np.maximum(w_silent_vales, w_sasquatch_vales), w_ne_outer_wall),
        np.maximum(w_ozark_dolomite, w_tsunami_scour),
    )
    w_trans_clim = np.maximum(
        np.maximum(np.maximum(w_ne_connector, w_sw_connector), w_batch5_clim),
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

    # Batch 5 Regional Climate Locks:
    # 1. `Silent Vales` (`w_silent_vales > 0.25`): connected cool-temperate valleys (`Cfb` / `Csb` on <2,350 m floors)
    in_silent_vales = (w_silent_vales > 0.25) & ~whas_exp
    c_nw[in_silent_vales & (En_exp < 2350.0) & (rain_exp >= 720.0)] = idx['Cfb']
    c_nw[in_silent_vales & (En_exp < 2350.0) & (rain_exp < 720.0)] = idx['Csb']
    c_nw[in_silent_vales & (En_exp >= 2350.0) & (En_exp < 3300.0)] = idx['Dfb']
    c_nw[in_silent_vales & (En_exp >= 3300.0) & (En_exp < 4250.0)] = idx['Dfc']

    # 2. `sasquatch tribes` (`w_sasquatch_vales > 0.30`): smaller, harsher periglacial valleys (`ET` & cold-edge `Dsc`)
    in_sasq_vales = (w_sasquatch_vales > 0.30) & ~whas_exp
    c_nw[in_sasq_vales & (En_exp < 5960.0)] = idx['Dsc']
    c_nw[in_sasq_vales & (En_exp >= 5960.0) & (En_exp < 6420.0)] = idx['ET']

    # 3. `ne outer wall` Boxwork Dike-Cauldrons (`w_ne_cauldron > 0.30`): geothermal cloud-forest pockets (`Cfb` / `Dfb`)
    in_ne_cauldrons = (w_ne_cauldron > 0.30) & ~whas_exp
    c_nw[in_ne_cauldrons & (En_exp < 3250.0)] = idx['Cfb']
    c_nw[in_ne_cauldrons & (En_exp >= 3250.0) & (En_exp < 3850.0)] = idx['Dfb']

    # Water classes in the new territory:
    c_nw[(is_new_area | ((X_exp < 535.0) & (Y_exp < 595.0)) | (w_tsunami_scour > 0.05)) & whas_exp] = idx['WS']
    c_nw[
        (is_high_lake & whas_exp)
        | is_copper_tarn
        | (whas_exp & (wlev_exp >= 1000.0) & ((w_silent_vales > 0.05) | (w_sasquatch_vales > 0.05) | (w_ne_outer_wall > 0.05)))
    ] = idx['WH']
    cls_exp = c_nw

    # Hypsometric zones (`z.png`: 0=basin, 1=highland, 2=outer rim, 3=arctic, 4=lake/sea, 5=salt basin)
    zon_exp[nw_edit_land & (En_exp < 1350.0)] = 0
    zon_exp[nw_edit_land & (En_exp >= 1350.0) & (En_exp < 4500.0)] = 1
    zon_exp[nw_edit_land & (En_exp >= 4500.0) & (En_exp < 8200.0)] = 3
    zon_exp[nw_edit_land & (En_exp >= 8200.0)] = 2
    zon_exp[in_copper_glacier & (En_exp >= 2350.0)] = 3
    zon_exp[(is_new_area | ((X_exp < 535.0) & (Y_exp < 595.0)) | (w_silent_vales > 0.1) | (w_sasquatch_vales > 0.1) | (w_ne_outer_wall > 0.1)) & whas_exp] = 4

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

        # Never push a dry river vertex into a lake/sea cell or uphill onto a steeper canyon bank!
        ny_i = np.clip(np.round(new_y).astype(int), 0, NEW_OH - 1)
        nx_i = np.clip(np.round(new_x).astype(int), 0, NEW_OW - 1)
        hit_water = whas_exp[ny_i, nx_i] & ~whas_exp[iy_p, ix_p]
        hit_uphill = En_exp[ny_i, nx_i] > (En_exp[iy_p, ix_p] + 4.0)
        new_x = np.where(hit_water | hit_uphill | pinned, arr_p[:, 0], new_x)
        new_y = np.where(hit_water | hit_uphill | pinned, arr_p[:, 1], new_y)
        r['px'] = [[round(float(x_), 2), round(float(y_), 2)] for x_, y_ in zip(new_x, new_y)]

    # Route the mouth of Līng-Mā (`r['id'] == 2`, Farside) into the 0.0 m sea-level estuary under Farport's bluff plateau:
    for r in rivers_exp:
        pts_r = r.get('px') or []
        if len(pts_r) >= 4:
            mx, my = pts_r[-1]
            if r.get('id') == 2 or (278.0 <= mx <= 302.0 and 580.0 <= my <= 596.0):
                # Trim any duplicate tail points in the harbour box and append the clean estuary mouth trajectory
                while len(pts_r) > 4 and pts_r[-1][0] <= 296.0 and 582.0 <= pts_r[-1][1] <= 594.0:
                    pts_r.pop()
                pts_r.extend([[292.0, 588.0], [290.0, 588.0], [285.0, 587.5], [280.0, 587.0]])
                r['px'] = pts_r
                if isinstance(r.get('to'), dict):
                    r['to']['at_px'] = [280.0, 587.0]

    # Reroute `r_hr_verdigris` (`Verdigris Beck`, High Rift) around the `(1336, 1657)` ridge via the southern Opaline Sinter
    # valley floor and keep its upstream Lake Cinnabar vertex `[19]` off the north wall at `(1495.5, 1635.5)`:
    for r in rivers_exp:
        if r.get('id') == 'r_hr_verdigris':
            pts_v = r.get('px') or []
            for k_v, (vx_, vy_) in enumerate(pts_v):
                if 1492.0 <= vx_ <= 1500.0 and vy_ <= 1634.5:
                    pts_v[k_v] = [round(float(vx_), 2), 1635.5]
            cut_idx = next((i for i, p in enumerate(pts_v) if p[0] <= 1356.0), max(0, len(pts_v) - 9))
            southern_sinter_route = [
                [1354.5, 1662.5],
                [1350.0, 1668.5],
                [1342.0, 1670.5],
                [1334.0, 1669.5],
                [1326.0, 1666.5],
                [1318.0, 1661.0],
                [1310.0, 1654.5],
                [1304.0, 1652.0],
                [1299.6, 1651.2],
            ]
            new_pts_v = pts_v[:cut_idx] + southern_sinter_route
            r['px'] = new_pts_v
            if 'q_m3s' in r and len(r['q_m3s']) != len(new_pts_v):
                q0, q1 = float(r['q_m3s'][0]), float(r['q_m3s'][-1])
                r['q_m3s'] = [round(q0 + (q1 - q0) * (i / max(1, len(new_pts_v) - 1)), 1) for i in range(len(new_pts_v))]
            # Grade a smooth sinter valley swale along the southern route (`2,572 m -> 2,135 m`) before channel incision:
            y0_v, y1_v, x0_v, x1_v = 1644, 1682, 1292, 1364
            yy_vs, xx_vs = np.mgrid[y0_v:y1_v, x0_v:x1_v]
            d2_vs = np.full(yy_vs.shape, 1e12, dtype=float)
            el_vs = np.full(yy_vs.shape, 2572.0, dtype=float)
            s_targets = np.linspace(2572.0, 2135.0, len(southern_sinter_route))
            for i_s in range(len(southern_sinter_route) - 1):
                sx0, sy0 = southern_sinter_route[i_s]
                sx1, sy1 = southern_sinter_route[i_s + 1]
                e0_s, e1_s = s_targets[i_s], s_targets[i_s + 1]
                for t_s in np.linspace(0.0, 1.0, 9):
                    qx = sx0 + (sx1 - sx0) * t_s
                    qy = sy0 + (sy1 - sy0) * t_s
                    qe = e0_s + (e1_s - e0_s) * t_s
                    d2_q = (xx_vs - qx) ** 2 + (yy_vs - qy) ** 2
                    better_q = d2_q < d2_vs
                    d2_vs = np.where(better_q, d2_q, d2_vs)
                    el_vs = np.where(better_q, qe, el_vs)
            u_vs = np.sqrt(d2_vs) / 6.5
            w_vs = ((1.0 - G.sstep(0.0, 1.0, u_vs)) ** 1.35) * (~whas_exp[y0_v:y1_v, x0_v:x1_v]).astype(float)
            h_vs_prof = el_vs + 380.0 * (G.sstep(0.0, 1.0, u_vs) ** 1.4)
            En_sub_v = En_exp[y0_v:y1_v, x0_v:x1_v]
            En_exp[y0_v:y1_v, x0_v:x1_v] = En_sub_v * (1.0 - 0.92 * w_vs) + np.minimum(En_sub_v, h_vs_prof) * (0.92 * w_vs)

    # Global Anti-Porcupine Despiking & Coastal Cliff Moderation Pass on `En_exp`
    # (Run BEFORE river channel incision so median filtering never fills in narrow canyon river floors!):
    # Guard ONLY volcanic cone summits (`'peak' in v_item`), NEVER valley-floor hydrothermal geysers/fumaroles!
    vent_guard = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    for v_item in list(vents_1393) + list(meta_nw['new_vents']):
        if 'peak' not in v_item:
            continue
        vx_i, vy_i = v_item['px']
        if v_item in vents_1393:
            vx_i, vy_i = vx_i + DX, vy_i + DY
        vent_guard |= (np.hypot(X_exp - vx_i, Y_exp - vy_i) <= 8.0)

    med3_e = nd.median_filter(En_exp, size=3)
    med5_e = nd.median_filter(En_exp, size=5)
    En_exp = np.where(((En_exp - med3_e) > 110.0) & ~vent_guard, med3_e, En_exp)
    En_exp = np.where(((En_exp - med5_e) > 190.0) & ~vent_guard, 0.25 * En_exp + 0.75 * med5_e, En_exp)
    # Also ensure coastal cliffs in the N/W expansion (`d_to_water_px <= 5`) have smooth, spike-free gradients
    gy_chk, gx_chk = np.gradient(En_exp)
    grad_px = np.hypot(gx_chk, gy_chk)
    En_coast_blur = nd.gaussian_filter(En_exp, sigma=2.0)
    coastal_spike = (d_to_water_px <= 5.0) & (grad_px > 340.0) & ~vent_guard & ~whas_exp
    En_exp = np.where(coastal_spike, np.minimum(En_exp, En_coast_blur), En_exp)

    # =========================================================================
    # STEP 5B-SCARP: Southern Inner Wall Scarp (`biomes/clifflung/PLAN.md` §5 & §14.1)
    # Strictly follow the natural curved contour geometry of `s highlands` (`En_exp`)
    # along its north-facing slope (`220 m <= E_s <= 3,250 m`, `gy_s > 0`), tightening
    # the existing elevation ramp through the 1.6-1.9 km cloud-forest bench to the
    # >3,000 m rim crest over <= 6 cells WITHOUT any horizontal line, rectangular box,
    # periodic comb teeth, or climate/satellite color overrides.
    # =========================================================================
    spirl_e_orig = float(En_exp[1017, 800])
    E_sc_smooth = nd.gaussian_filter(En_exp, sigma=1.8)
    gy_sc, _ = np.gradient(E_sc_smooth)
    t_e_sc = np.clip((E_sc_smooth - 220.0) / (3250.0 - 220.0), 0.0, 1.0)
    u1_sc = G.sstep(0.0, 0.39, t_e_sc)
    u2_sc = G.sstep(0.39, 0.47, t_e_sc)
    u3_sc = G.sstep(0.47, 0.54, t_e_sc)
    u4_sc = G.sstep(0.54, 0.61, t_e_sc)
    u5_sc = G.sstep(0.61, 1.00, t_e_sc)
    h_scarp_remap = (
        220.0
        + 245.0 * u1_sc
        + 1175.0 * u2_sc
        + 240.0 * u3_sc
        + 1210.0 * u4_sc
        + 160.0 * u5_sc
    )
    w_sc_band = G.sstep(220.0, 310.0, E_sc_smooth) * (1.0 - G.sstep(3100.0, 3250.0, E_sc_smooth))
    w_sc_xy = (
        G.sstep(736.0, 745.0, X_exp) * (1.0 - G.sstep(922.0, 932.0, X_exp))
        * G.sstep(940.0, 948.0, Y_exp) * (1.0 - G.sstep(1056.0, 1064.0, Y_exp))
    )
    w_sc_north_face = G.sstep(12.0, 45.0, gy_sc)
    d_spirl = np.hypot(X_exp - 800.0, Y_exp - 1017.0)
    w_spirl_guard = G.sstep(3.5, 6.0, d_spirl)
    d_voth = np.hypot(X_exp - 742.0, Y_exp - 1018.0)
    w_voth_guard = G.sstep(3.5, 5.5, d_voth)
    w_s_inner_scarp = w_sc_band * w_sc_xy * w_sc_north_face * w_spirl_guard * w_voth_guard * (~whas_exp).astype(float)
    En_exp = En_exp * (1.0 - w_s_inner_scarp) + h_scarp_remap * w_s_inner_scarp
    En_exp[1017, 800] = spirl_e_orig

    # =========================================================================
    # STEP 5B-NEW-BIOMES:
    # 1. `great chasm` (`rmw4vh9t20da4`, X=1614..1747, Y=798..1032):
    #    Deep volcano-tectonic extensional megatrench dropping from the 5.6-11.7 km
    #    Outlands plateau through Tier-2 Sheeted-Dike Galleries (+1,200..+2,400 m)
    #    down to an abyssal fire-fissure floor at -1,180 m to +400 m (1.52-1.85 atm),
    #    with a smooth, gradual northern headwall ramp towards the Outlands.
    # 2. `godshearth` (`rmw4wou2y1hhc`, X=808..880, Y=1370..1451):
    #    Lower the southern Godthrone flank caldera "just enough" (-2,800 to -3,200 m)
    #    from ~6,820 m (HT/HF) to +3,640..+4,120 m (1.00 atm breathable air) to create
    #    a Yellowstone-like geothermal temperature oasis (Cfb) dominated by Climax Hearths.
    # =========================================================================
    # 1. `great chasm` (`rmw4vh9t20da4`):
    #    Deepen the central tectonic trench and sculpt a Martian-style Headwall Chaos Terrain
    #    at the northern border with `S Outlands` (`X=1620..1716, Y=748..862`), where anastomosing
    #    outflow channels curve around fractured, tilted flat-topped horst mesas and knobby pyramids
    #    while preserving a gradual overall N->S elevation drop (`Y=790 > Y=825 > Y=860`).
    gc_pts = [
        [1660, 1003], [1667, 1022], [1696, 1028], [1723, 1032], [1745, 1001],
        [1747, 913], [1741, 858], [1713, 841], [1671, 798], [1633, 818],
        [1614, 851], [1647, 880], [1672, 928], [1666, 987],
    ]
    mask_gc = G.poly(gc_pts, 1.0, 1.0, (NEW_OH, NEW_OW))
    d_in_gc = nd.distance_transform_edt(mask_gc)
    d_out_gc = nd.distance_transform_edt(~mask_gc)
    sd_gc = (d_in_gc - d_out_gc) + 3.6 * meta_nw['fbm1'] + 2.2 * meta_nw['fbm2']
    # Make the slope on the north end of Great Chasm (`Y <= 885`, towards the Outlands) gradual and organic
    # by adding a north-projecting headwall chaos amphitheatre lobe (`sd_gc_n_lobe`) and wide northern feathering:
    dx_gc_n = (X_exp - 1668.0 + 3.8 * meta_nw['fbm1']) / 30.0
    dy_gc_n = (Y_exp - 804.0 + 3.8 * meta_nw['fbm2']) / 44.0
    sd_gc_n_lobe = (1.0 - np.hypot(dx_gc_n, dy_gc_n)) * 30.0
    sd_gc_eff = np.maximum(sd_gc, sd_gc_n_lobe)
    w_gc_north_end = 1.0 - G.sstep(835.0, 898.0, Y_exp)
    w_gc_raw = (
        (1.0 - w_gc_north_end) * G.sstep(-6.0, 5.0, sd_gc_eff)
        + w_gc_north_end * G.sstep(-38.0, 10.0, sd_gc_eff)
    )
    # Clear stale high-altitude mountain tarns inside Great Chasm so they never perch above the lowered trench walls:
    gc_stale_tarn = (w_gc_raw > 0.12) & whas_exp & (np.nan_to_num(wlev_exp, nan=0.0) > 3500.0)
    whas_exp[gc_stale_tarn] = False
    wlev_exp[gc_stale_tarn] = np.nan
    w_gc_env = w_gc_raw * (~whas_exp).astype(float)

    gc_spine_ctrl = [
        # (x, y, floor_m) — Extended northward (`Y = 748..865`) so the north end of Great Chasm grades
        # progressively upward into the Outlands plateau (+4,150 m -> +2,550 m -> +1,120 m -> -380 m -> -1,180 m):
        (1675.0,  748.0,  4150.0),
        (1672.0,  788.0,  2450.0),
        (1668.0,  822.0,  1050.0),
        (1662.0,  858.0,  -380.0),
        (1692.0,  895.0, -1180.0),
        (1696.0,  935.0,  -860.0),
        (1698.0,  975.0,  -380.0),
        (1698.0, 1008.0,   280.0),
        (1696.0, 1026.0,   580.0),
    ]
    y0_gc, y1_gc, x0_gc, x1_gc = 735, 1045, 1585, 1765
    px_gc = X_exp[y0_gc:y1_gc, x0_gc:x1_gc] + 2.5 * meta_nw['fbm1'][y0_gc:y1_gc, x0_gc:x1_gc]
    py_gc = Y_exp[y0_gc:y1_gc, x0_gc:x1_gc] + 2.5 * meta_nw['fbm2'][y0_gc:y1_gc, x0_gc:x1_gc]
    px_gc_raw = X_exp[y0_gc:y1_gc, x0_gc:x1_gc]
    py_gc_raw = Y_exp[y0_gc:y1_gc, x0_gc:x1_gc]
    d2_gc_ax = np.full((y1_gc - y0_gc, x1_gc - x0_gc), 1e12, dtype=float)
    fl_gc_ax = np.zeros((y1_gc - y0_gc, x1_gc - x0_gc), dtype=float)
    for idx_g in range(len(gc_spine_ctrl) - 1):
        gx0, gy0, gf0 = gc_spine_ctrl[idx_g]
        gx1, gy1, gf1 = gc_spine_ctrl[idx_g + 1]
        for s_g in np.linspace(0.0, 1.0, 25):
            sx_g = gx0 + s_g * (gx1 - gx0)
            sy_g = gy0 + s_g * (gy1 - gy0)
            sf_g = gf0 + s_g * (gf1 - gf0)
            d2_g = (px_gc - sx_g) ** 2 + (py_gc - sy_g) ** 2
            better_g = d2_g < d2_gc_ax
            d2_gc_ax = np.where(better_g, d2_g, d2_gc_ax)
            fl_gc_ax = np.where(better_g, sf_g, fl_gc_ax)
    d_ax_gc = np.sqrt(d2_gc_ax)
    fl_gc_ax = nd.gaussian_filter(fl_gc_ax, sigma=2.8)
    sd_gc_sub = sd_gc_eff[y0_gc:y1_gc, x0_gc:x1_gc]
    w_n_sub = w_gc_north_end[y0_gc:y1_gc, x0_gc:x1_gc]
    eff_in_gc = np.maximum(0.0, sd_gc_sub + 2.5 + 32.0 * w_n_sub)
    u_gc = np.clip(d_ax_gc / np.maximum(d_ax_gc + eff_in_gc, 1.0), 0.0, 1.0)

    fbm1_gc = meta_nw['fbm1'][y0_gc:y1_gc, x0_gc:x1_gc]
    fbm2_gc = meta_nw['fbm2'][y0_gc:y1_gc, x0_gc:x1_gc]
    dike_rib_gc = np.abs(np.sin((px_gc * 0.36 - py_gc * 0.18) + 2.2 * fbm1_gc)) * (1.0 - 0.65 * w_n_sub)
    u_gc_w1 = G.sstep(0.18, 0.42, u_gc)
    u_gc_bench = G.sstep(0.38, 0.66, u_gc)
    u_gc_w2 = G.sstep(0.62 - 0.22 * w_n_sub, 0.96, u_gc)

    h_gc_tier3 = fl_gc_ax + 180.0 * G.sstep(0.0, 0.18, u_gc) + 65.0 * fbm2_gc
    h_gc_tier2 = np.maximum(fl_gc_ax + 320.0, 1480.0 + 950.0 * w_n_sub) + 380.0 * u_gc_bench + 220.0 * dike_rib_gc + 90.0 * fbm1_gc
    E_gc_orig = En_exp[y0_gc:y1_gc, x0_gc:x1_gc]
    # Smoothly grade the northern headwall rim into the Outlands plateau so there is no abrupt cliff at the northern tip:
    E_gc_orig_smooth = nd.gaussian_filter(E_gc_orig, sigma=3.5)
    E_gc_rim_soft = E_gc_orig * (1.0 - 0.78 * w_n_sub) + np.minimum(E_gc_orig_smooth, 4450.0 + 1650.0 * u_gc + 160.0 * fbm1_gc) * (0.78 * w_n_sub)
    h_gc_prof = (
        h_gc_tier3 * (1.0 - u_gc_w1)
        + h_gc_tier2 * (u_gc_w1 * (1.0 - u_gc_w2))
        + E_gc_rim_soft * u_gc_w2
    )
    # In the northern headwall zone (`w_n_sub > 0`), blend toward a continuous axial ramp:
    h_gc_north_ramp = fl_gc_ax + (E_gc_rim_soft - fl_gc_ax) * (G.sstep(0.0, 1.0, u_gc) ** 1.35) + 75.0 * fbm1_gc * (1.0 - u_gc)
    h_gc_prof = h_gc_prof * (1.0 - 0.72 * w_n_sub) + h_gc_north_ramp * (0.72 * w_n_sub)

    # Martian-Style Headwall Chaos Terrain at the northern border of Great Chasm (`X=1620..1716, Y=750..858`):
    # Anastomosing outflow fracture channels curving around fractured, tilted flat-topped polygon-mesa blocks and knobby pyramids!
    w_gc_chaos_zone = (
        G.sstep(746.0, 766.0, py_gc_raw)
        * (1.0 - G.sstep(844.0, 868.0, py_gc_raw))
        * (1.0 - G.sstep(0.55, 0.92, u_gc))
    )
    # 3-trend anastomosing fracture channels + polyhedral horst blocks:
    ph_gc_1 = np.abs(np.sin((px_gc * 0.34 + py_gc * 0.21) + 1.6 * fbm1_gc))
    ph_gc_2 = np.abs(np.sin((px_gc * 0.29 - py_gc * 0.27) + 1.6 * fbm2_gc))
    ph_gc_3 = np.abs(np.sin((px_gc * 0.14 + py_gc * 0.38) - 1.4 * fbm1_gc))
    w_gc_ch_trough = np.maximum(
        1.0 - G.sstep(0.10, 0.34, ph_gc_1),
        np.maximum(1.0 - G.sstep(0.10, 0.34, ph_gc_2), 1.0 - G.sstep(0.08, 0.28, ph_gc_3)),
    )
    # Explicit flat-topped tilted chaos mesas & knobby pyramids in the northern headwall funnel:
    gc_chaos_blocks = [
        # (bx, by, rx, ry, ang_deg, cap_m, is_mesa)
        (1656.0, 772.0, 5.2, 3.6,  28.0, 3480.0, True),
        (1684.0, 774.0, 5.5, 3.8, -32.0, 3560.0, True),
        (1671.0, 789.0, 5.4, 3.8,  15.0, 2940.0, True),   # Preserves Y=790, X=1671 gradual step (~2,850 m)
        (1646.0, 796.0, 5.8, 3.8, -24.0, 3120.0, True),
        (1694.0, 795.0, 5.6, 3.6,  35.0, 3180.0, True),
        (1655.0, 812.0, 5.2, 3.5,  18.0, 2380.0, True),
        (1683.0, 811.0, 5.4, 3.6, -28.0, 2460.0, True),
        (1668.0, 825.0, 4.8, 3.4,  12.0, 1520.0, True),   # Preserves Y=825, X=1668 gradual step (~1,420 m)
        (1638.0, 826.0, 5.5, 3.6, -36.0, 2150.0, True),
        (1698.0, 824.0, 5.2, 3.5,  24.0, 2240.0, True),
        (1652.0, 840.0, 4.4, 3.0, -18.0, 1180.0, False),
        (1680.0, 839.0, 4.5, 3.2,  26.0, 1240.0, False),
        (1664.0, 848.0, 3.8, 2.8,  -8.0,  640.0, False),
        (1692.0, 849.0, 4.0, 2.8,  32.0,  820.0, False),
    ]
    w_gc_mesa_cap = np.zeros_like(h_gc_prof)
    h_gc_mesa_target = h_gc_prof.copy()
    for bx_c, by_c, rx_c, ry_c, ang_c, cap_c, is_m in gc_chaos_blocks:
        th_c = math.radians(ang_c)
        dx_c = px_gc - bx_c
        dy_c = py_gc - by_c
        uc_x = dx_c * math.cos(th_c) + dy_c * math.sin(th_c)
        uc_y = -dx_c * math.sin(th_c) + dy_c * math.cos(th_c)
        # Polyhedral block norm (L4/L2 blend for faceted fault-block sides)
        r_c = (0.65 * np.hypot(uc_x / rx_c, uc_y / ry_c) + 0.35 * (( (uc_x / rx_c) ** 4 + (uc_y / ry_c) ** 4 ) ** 0.25))
        if is_m:
            w_blk = 1.0 - G.sstep(0.55, 1.12, r_c)
            tilt_c = 65.0 * (uc_x / rx_c) - 45.0 * (uc_y / ry_c) + 32.0 * fbm2_gc
        else:
            w_blk = 1.0 - G.sstep(0.20, 1.08, r_c)
            tilt_c = -180.0 * G.sstep(0.0, 0.9, r_c) + 28.0 * fbm1_gc
        better_m = w_blk > w_gc_mesa_cap
        w_gc_mesa_cap = np.maximum(w_gc_mesa_cap, w_blk)
        h_gc_mesa_target = np.where(better_m, cap_c + tilt_c, h_gc_mesa_target)

    # Carve anastomosing outflow channels between the blocks (`-420 m` to `+1,650 m` floor sloping N->S):
    h_gc_chaos_ch = np.maximum(-450.0, fl_gc_ax - 420.0 + 180.0 * u_gc + 55.0 * fbm2_gc)
    w_gc_ch_eff = w_gc_chaos_zone * w_gc_ch_trough * (1.0 - 0.92 * w_gc_mesa_cap)
    w_gc_blk_eff = w_gc_chaos_zone * w_gc_mesa_cap
    h_gc_prof = h_gc_prof * (1.0 - 0.82 * w_gc_ch_eff) + h_gc_chaos_ch * (0.82 * w_gc_ch_eff)
    h_gc_prof = h_gc_prof * (1.0 - 0.88 * w_gc_blk_eff) + h_gc_mesa_target * (0.88 * w_gc_blk_eff)

    w_gc_chaos_mesa_full = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_gc_chaos_ch_full = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_gc_chaos_mesa_full[y0_gc:y1_gc, x0_gc:x1_gc] = w_gc_blk_eff
    w_gc_chaos_ch_full[y0_gc:y1_gc, x0_gc:x1_gc] = w_gc_ch_eff

    w_gc_sub = w_gc_env[y0_gc:y1_gc, x0_gc:x1_gc]
    En_exp[y0_gc:y1_gc, x0_gc:x1_gc] = E_gc_orig * (1.0 - w_gc_sub) + h_gc_prof * w_gc_sub
    # Pin showcase station datums in `great chasm` within <= 25 m of plan targets:
    for st_x, st_y, st_h in [(1692, 895, -1180.0), (1708, 935, 1640.0), (1726, 888, 6850.0), (1698, 1008, 280.0)]:
        r_st = np.hypot(X_exp[st_y - 4:st_y + 5, st_x - 4:st_x + 5] - st_x, Y_exp[st_y - 4:st_y + 5, st_x - 4:st_x + 5] - st_y)
        w_st_pin = 1.0 - G.sstep(0.0, 3.8, r_st)
        En_exp[st_y - 4:st_y + 5, st_x - 4:st_x + 5] = (
            En_exp[st_y - 4:st_y + 5, st_x - 4:st_x + 5] * (1.0 - w_st_pin) + st_h * w_st_pin
        )

    # 2. `godshearth` (`rmw4wou2y1hhc`, X=808..880, Y=1370..1451):
    #    Smooth the caldera edges into the southern flank of Godthrone via a wide (`24–28 px`),
    #    domain-warped volcano-tectonic slump amphitheatre that preserves Godthrone's radial ridge/gully
    #    relief (`dE_gh_med`, `dE_gh_hp`) and flares the southern breach into Xanadu.
    gh_pts = [
        [808, 1379], [824, 1387], [837, 1374], [862, 1370], [871, 1376],
        [880, 1385], [872, 1403], [854, 1411], [845, 1451], [845, 1408],
        [831, 1408], [821, 1400], [808, 1391],
    ]
    mask_gh = G.poly(gh_pts, 1.0, 1.0, (NEW_OH, NEW_OW))
    gh_main_pts = [
        [808, 1379], [824, 1387], [837, 1374], [862, 1370], [871, 1376],
        [880, 1385], [872, 1403], [854, 1411], [831, 1408], [821, 1400], [808, 1391],
    ]
    mask_gh_main = G.poly(gh_main_pts, 1.0, 1.0, (NEW_OH, NEW_OW))
    d_in_gh = nd.distance_transform_edt(mask_gh_main)
    d_out_gh = nd.distance_transform_edt(~mask_gh_main)

    # Extract Godthrone's natural radial ridge/gully detail so the slump collar retains real mountain texture:
    y0_gh, y1_gh, x0_gh, x1_gh = 1332, 1472, 768, 918
    E_gh_sub = En_exp[y0_gh:y1_gh, x0_gh:x1_gh].copy()
    E_gh_s2 = nd.gaussian_filter(E_gh_sub, sigma=2.0)
    E_gh_s6 = nd.gaussian_filter(E_gh_sub, sigma=6.0)
    E_gh_s14 = nd.gaussian_filter(E_gh_sub, sigma=14.0)
    dE_gh_med = np.clip(E_gh_s6 - E_gh_s14, -480.0, 540.0)
    dE_gh_hp = np.clip(E_gh_s2 - E_gh_s6, -280.0, 320.0)

    # Radial ridge-scalloping around the Hearth center `(843, 1392)` + FBM domain warp so the caldera rim is lobate & natural:
    th_gh_rad = np.arctan2(Y_exp - 1392.0, X_exp - 843.0)
    scallop_gh = 2.6 * np.sin(7.0 * th_gh_rad + 1.8 * meta_nw['fbm1']) + 1.8 * np.cos(11.0 * th_gh_rad + 1.5 * meta_nw['fbm2'])
    sd_gh_main = (d_in_gh - d_out_gh) + 4.6 * meta_nw['fbm1'] + 3.1 * meta_nw['fbm2'] + scallop_gh
    # Clear stale 6.4–9.1 km Godthrone flank tarns inside the Godshearth caldera before lowering the basin to 3,642 m:
    gh_stale_tarn = (G.sstep(-26.0, 5.5, sd_gh_main) > 0.05) & whas_exp
    whas_exp[gh_stale_tarn] = False
    wlev_exp[gh_stale_tarn] = np.nan
    w_gh_caldera = G.sstep(-26.0, 5.5, sd_gh_main) * (~whas_exp).astype(float)

    # Distance from caldera thermal center `(842, 1393)`
    r_gh_center = np.hypot((X_exp - 842.0) * 0.85, (Y_exp - 1393.0) * 1.25)
    u_gh_floor = G.sstep(2.0, 24.0, r_gh_center)
    h_gh_floor = 3644.0 + 340.0 * u_gh_floor + 55.0 * meta_nw['fbm2'] + 35.0 * meta_nw['fbm1']

    # Multi-tier listric slump amphitheatre collar (`sd_gh_main` from +5.5 inside the bowl to -26.0 on Godthrone's flank):
    sd_gh_sub = sd_gh_main[y0_gh:y1_gh, x0_gh:x1_gh]
    h_fl_sub = h_gh_floor[y0_gh:y1_gh, x0_gh:x1_gh]
    fbm1_gh = meta_nw['fbm1'][y0_gh:y1_gh, x0_gh:x1_gh]
    fbm2_gh = meta_nw['fbm2'][y0_gh:y1_gh, x0_gh:x1_gh]
    u_gh_wall = 1.0 - G.sstep(-24.0, 4.5, sd_gh_sub)
    # Intermediate volcano-tectonic slump bench around 4,250..4,950 m (`u_gh_wall ~ 0.25..0.65`)
    u_gh_bench = G.sstep(0.15, 0.52, u_gh_wall) * (1.0 - G.sstep(0.58, 0.92, u_gh_wall))
    h_gh_bench = 4180.0 + 680.0 * G.sstep(0.15, 0.75, u_gh_wall) + 0.42 * dE_gh_med + 0.50 * dE_gh_hp + 65.0 * fbm1_gh
    h_gh_outer = E_gh_s14 + 0.58 * dE_gh_med + 0.68 * dE_gh_hp
    t_gh_prof = G.sstep(0.0, 1.0, u_gh_wall) ** 1.35
    h_gh_ramp = h_fl_sub * (1.0 - t_gh_prof) + h_gh_outer * t_gh_prof + (0.45 * dE_gh_med + 0.52 * dE_gh_hp) * G.sstep(0.08, 0.45, u_gh_wall)
    h_gh_target_sub = h_gh_ramp * (1.0 - 0.52 * u_gh_bench) + np.minimum(h_gh_ramp, h_gh_bench) * (0.52 * u_gh_bench)
    w_gh_cal_sub = w_gh_caldera[y0_gh:y1_gh, x0_gh:x1_gh]
    En_exp[y0_gh:y1_gh, x0_gh:x1_gh] = E_gh_sub * (1.0 - w_gh_cal_sub) + h_gh_target_sub * w_gh_cal_sub

    # Carve the Flared Southern Spillway Valley (`X ~ 845, Y = 1393..1452`) opening into a V-shaped breach amphitheatre toward Xanadu:
    t_spill_y = np.clip((Y_exp - 1394.0) / (1451.0 - 1394.0), 0.0, 1.0)
    x_spill_axis = 844.5 + 0.5 * t_spill_y + 1.2 * np.sin(t_spill_y * math.pi * 2.0) + 1.4 * meta_nw['fbm1'] * G.sstep(0.15, 0.85, t_spill_y)
    d_spill_x = np.abs(X_exp - x_spill_axis)
    hw_spill_y = 7.5 + 12.5 * (t_spill_y ** 1.15)
    u_spill_x = d_spill_x / hw_spill_y
    w_gh_spill = (1.0 - G.sstep(0.18, 1.35, u_spill_x)) * G.sstep(1391.0, 1397.0, Y_exp) * (1.0 - G.sstep(1445.0, 1455.0, Y_exp))
    h_spill_thalweg = (
        3642.0
        - 512.0 * (t_spill_y ** 0.92)
        + (240.0 + 420.0 * (1.0 - 0.45 * t_spill_y)) * (G.sstep(0.0, 1.25, u_spill_x) ** 1.45)
        + 38.0 * meta_nw['fbm2'] * G.sstep(0.15, 0.85, u_spill_x)
    )
    En_exp = En_exp * (1.0 - w_gh_spill) + np.minimum(En_exp, h_spill_thalweg) * w_gh_spill

    # Carve the shallow steaming Grand Prismatic Hearth Lake centered at `(840, 1394)` (`wlev = 3,642.0 m`),
    # leaving station `prismbasin` `(844, 1394)` on the dry sinter shore at `+3,645.0 m`!
    r_gh_lake = np.hypot((X_exp - 839.5) * 1.0, (Y_exp - 1394.0) * 1.25)
    is_gh_lake = r_gh_lake <= 2.6
    En_exp = np.where(is_gh_lake, 3636.0 + 2.0 * r_gh_lake, En_exp)
    whas_exp[is_gh_lake] = True
    wlev_exp[is_gh_lake] = 3642.0

    # Pin showcase station datums in `godshearth`:
    for st_x, st_y, st_h in [(836, 1388, 3740.0), (844, 1394, 3645.0), (848, 1375, 4120.0), (845, 1422, 3380.0)]:
        r_st = np.hypot(X_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] - st_x, Y_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] - st_y)
        w_st_pin = (1.0 - G.sstep(0.0, 2.8, r_st)) * (~is_gh_lake[st_y - 3:st_y + 4, st_x - 3:st_x + 4]).astype(float)
        En_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] = (
            En_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] * (1.0 - w_st_pin) + st_h * w_st_pin
        )
    w_gh_all = np.clip(np.maximum(w_gh_caldera, w_gh_spill), 0.0, 1.0)

    # 3. `SE outer wall` (`rmw4xy4tp9b29`, X=997..1356, Y=1136..1352) & The Godsgate (`biomes/seouterwall/PLAN.md`):
    #    - Make `SE outer wall` taller to match the rest of the Outer Wall (`+6,200..+10,200 m`), sloping up
    #      from the west (`~6,200..7,800 m` east of the Godsgate) toward the east/southeast (`~9,200..11,200 m`)
    #      so it meets the `Stalker Range` (`rmvkknh1am4fw`, median ~9,700 m along the shared border) at the same height!
    #    - Carve The Godsgate trans-cordilleran pass in the west (`X = 997..1060, Y = 1188..1338`, saddle +3,620 m at 1031, 1252),
    #    - Carve & fill the 5 Hidden Highland Lake Oases (`WH` tarns) in sheltered hanging amphitheaters!
    seow_pts = [
        [1329, 1136], [1356, 1201], [1336, 1222], [1299, 1228], [1267, 1254],
        [1245, 1276], [1224, 1300], [1201, 1346], [1130, 1352], [1092, 1340],
        [1060, 1310], [1039, 1292], [1009, 1305], [997, 1207], [1032, 1205],
        [1091, 1204], [1164, 1198], [1249, 1188], [1300, 1160], [1324, 1141],
    ]
    mask_seow = G.poly(seow_pts, 1.0, 1.0, (NEW_OH, NEW_OW))
    # Clear the 24 accidental perched water pixels inside `mask_seow` before carving the 5 intentional Highland Tarn Oases:
    whas_exp[mask_seow] = False
    wlev_exp[mask_seow] = np.nan

    d_in_seow = nd.distance_transform_edt(mask_seow)
    d_out_seow = nd.distance_transform_edt(~mask_seow)
    sd_seow = (d_in_seow - d_out_seow) + 3.8 * meta_nw['fbm1'] + 2.4 * meta_nw['fbm2']
    # Use a tighter transition along the northern Bowl scarp (`Y <= 1212`) and a wide 26-px feather apron
    # along the high southern/eastern snowpack border (`Y > 1212`) so no polygon edge step appears!
    w_seow_north = 1.0 - G.sstep(1198.0, 1224.0, Y_exp)
    w_seow_env = (
        w_seow_north * G.sstep(-5.5, 5.5, sd_seow)
        + (1.0 - w_seow_north) * G.sstep(-24.0, 10.0, sd_seow)
    ) * (~whas_exp).astype(float)

    y0_sw, y1_sw, x0_sw, x1_sw = 1115, 1378, 968, 1382
    E_sw_sub = En_exp[y0_sw:y1_sw, x0_sw:x1_sw].copy()
    E_sw_base = nd.gaussian_filter(E_sw_sub, sigma=6.0)
    E_sw_mid = nd.gaussian_filter(E_sw_sub, sigma=2.2)
    dE_sw_hp = E_sw_sub - E_sw_mid
    dE_sw_med = E_sw_mid - E_sw_base
    fbm1_sw = meta_nw['fbm1'][y0_sw:y1_sw, x0_sw:x1_sw]
    fbm2_sw = meta_nw['fbm2'][y0_sw:y1_sw, x0_sw:x1_sw]
    px_sw = X_exp[y0_sw:y1_sw, x0_sw:x1_sw]
    py_sw = Y_exp[y0_sw:y1_sw, x0_sw:x1_sw]

    # West-to-East / Stalker Range ramp (`u_stalker_sw`):
    # Slopes smoothly up from ~6,200..7,400 m in the west (`X ~ 1045`, east of Godsgate)
    # to ~9,400..11,200 m along the eastern/SE border (`X = 1200..1356`) so `SE outer wall`
    # matches the rest of the Outer Wall and meets the Stalker Range (`~9,700 m` median) at the exact same height!
    u_stalker_sw = np.clip((px_sw - 1035.0) / 285.0 + 0.18 * (py_sw - 1210.0) / 140.0, 0.0, 1.0)
    h_west_target = 5450.0 + 2650.0 * np.tanh(np.maximum(0.0, E_sw_base - 4800.0) / 4200.0)
    h_east_target = np.clip(0.88 * E_sw_base + 1150.0, 6800.0, 11400.0)
    E_alp_base = h_west_target * (1.0 - (u_stalker_sw ** 1.15)) + h_east_target * (u_stalker_sw ** 1.15)
    ridge_fbm = 360.0 * (np.abs(fbm1_sw) - 0.45) + 210.0 * fbm2_sw
    h_seow_cord = np.clip(
        E_alp_base + 0.72 * np.clip(dE_sw_med, -1100.0, 1250.0) + 0.80 * np.clip(dE_sw_hp, -650.0, 750.0) + ridge_fbm,
        3550.0,
        11600.0,
    )

    # 3 Northern Listric Slump Terraces facing The Bowl (`Y = 1140..1218`):
    w_n_slump = (1.0 - G.sstep(1196.0, 1224.0, py_sw)) * G.sstep(1045.0, 1075.0, px_sw)
    for b_lev in (4100.0, 5400.0, 6700.0):
        de_b = h_seow_cord - b_lev
        w_b_step = np.exp(-((de_b / 280.0) ** 2)) * w_n_slump
        h_seow_cord = h_seow_cord - 0.48 * de_b * w_b_step

    # Carve The Godsgate Pass Corridor in the west (`X = 997..1060, Y = 1188..1338`):
    godsgate_ctrl = [
        # (x, y, floor_m, hw_px)
        (1018.0, 1188.0, 2250.0, 9.0),
        (1024.0, 1206.0, 2850.0, 8.2),
        (1026.0, 1224.0, 3380.0, 7.5),
        (1029.0, 1238.0, 3510.0, 7.0),
        (1031.0, 1252.0, 3620.0, 6.8),  # The Godsgate Saddle Divide (+3,620 m)
        (1033.0, 1268.0, 3550.0, 7.2),
        (1035.0, 1292.0, 3480.0, 7.8),
        (1032.0, 1315.0, 2450.0, 9.2),
        (1018.0, 1338.0, 1550.0, 11.0),
    ]
    d2_gg = np.full_like(E_sw_sub, 1e12)
    fl_gg = np.zeros_like(E_sw_sub)
    hw_gg = np.full_like(E_sw_sub, 7.2)
    px_sw_w = px_sw + 2.8 * fbm1_sw + 1.4 * fbm2_sw
    py_sw_w = py_sw + 2.4 * fbm2_sw
    for idx_gg in range(len(godsgate_ctrl) - 1):
        gx0, gy0, gf0, ghw0 = godsgate_ctrl[idx_gg]
        gx1, gy1, gf1, ghw1 = godsgate_ctrl[idx_gg + 1]
        for s_gg in np.linspace(0.0, 1.0, 20):
            sx_g = gx0 + s_gg * (gx1 - gx0)
            sy_g = gy0 + s_gg * (gy1 - gy0)
            sf_g = gf0 + s_gg * (gf1 - gf0)
            shw_g = ghw0 + s_gg * (ghw1 - ghw0)
            d2_g = (px_sw_w - sx_g) ** 2 + (py_sw_w - sy_g) ** 2
            better_g = d2_g < d2_gg
            d2_gg = np.where(better_g, d2_g, d2_gg)
            fl_gg = np.where(better_g, sf_g, fl_gg)
            hw_gg = np.where(better_g, shw_g, hw_gg)
    d_gg = np.sqrt(d2_gg)
    fl_gg = nd.gaussian_filter(fl_gg, sigma=1.8)
    u_gg = d_gg / np.maximum(hw_gg, 1.0)
    w_gg_pass = (1.0 - G.sstep(0.0, 1.45, u_gg)) * G.sstep(1184.0, 1198.0, py_sw) * (1.0 - G.sstep(1328.0, 1345.0, py_sw))
    h_gg_trough = fl_gg + 520.0 * (np.clip(u_gg, 0.0, 1.45) ** 1.65) + 28.0 * fbm2_sw
    h_seow_cord = h_seow_cord * (1.0 - w_gg_pass) + np.minimum(h_seow_cord, h_gg_trough) * w_gg_pass

    # Flank the Godsgate with the two gate-tower bastions: Ilmenite Horn `(1008, 1248, 6480 m)` & Shatter-Crown `(1056, 1244, 6860 m)`:
    for pk_x, pk_y, pk_h in [(1008.0, 1248.0, 6480.0), (1056.0, 1244.0, 6860.0), (1216.0, 1246.0, 8850.0)]:
        r_pk = np.hypot(px_sw - pk_x, py_sw - pk_y)
        w_pk = (1.0 - G.sstep(1.5, 8.5, r_pk)) * (1.0 - w_gg_pass)
        h_seow_cord = h_seow_cord * (1.0 - w_pk) + (pk_h - 90.0 * G.sstep(0.0, 4.0, r_pk) + 45.0 * fbm1_sw) * w_pk

    w_seow_sub = np.maximum(w_seow_env[y0_sw:y1_sw, x0_sw:x1_sw], 0.85 * w_gg_pass)
    En_exp[y0_sw:y1_sw, x0_sw:x1_sw] = E_sw_sub * (1.0 - w_seow_sub) + h_seow_cord * w_seow_sub

    # Carve & Fill the 5 Hidden Highland Lake Oases (`WH` tarns) + Dry Shore Stations:
    # Each station `(st_x, st_y)` sits on the dry cirque/sinter/karst shore right beside its tarn center `(lk_x, lk_y)`!
    seow_tarn_specs = [
        # (lk_x, lk_y, rx, ry, wlev_m, bed_m, st_x, st_y, st_m)
        (1013.0, 1236.0, 1.9, 1.6, 3680.0, 3662.0, 1016, 1236, 3680.0),  # 1. Tarn of the Gate-Bell (`gatetarn`)
        (1061.0, 1272.0, 2.1, 1.8, 3940.0, 3924.0, 1064, 1272, 3940.0),  # 2. Amber-Sinter Geothermal Tarn (`ambertarn`)
        (1131.0, 1218.0, 2.3, 1.6, 4120.0, 4096.0, 1134, 1218, 4120.0),  # 3. Mirror-Slump Tarn (`mirrorscarp`)
        (1205.0, 1254.0, 2.3, 1.9, 4380.0, 4356.0, 1208, 1254, 4380.0),  # 4. Jade-Karst Polje (`jadecrest`)
        (1285.0, 1184.0, 2.1, 1.7, 3820.0, 3798.0, 1288, 1184, 3820.0),  # 5. Copper-Vein Tarn (`coppertarn`)
    ]
    is_seow_tarn = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    w_seow_oasis = np.zeros((NEW_OH, NEW_OW), dtype=float)
    for lk_x, lk_y, rx_t, ry_t, wl_t, bed_t, st_x, st_y, st_m in seow_tarn_specs:
        r_amph = np.hypot((X_exp - 0.5 * (lk_x + st_x)) / (rx_t * 3.4), (Y_exp - lk_y) / (ry_t * 3.4))
        w_amph = 1.0 - G.sstep(0.45, 1.40, r_amph)
        w_seow_oasis = np.maximum(w_seow_oasis, w_amph)
        h_amph_bowl = (wl_t + 3.0) + 280.0 * G.sstep(0.40, 1.30, r_amph) + 18.0 * meta_nw['fbm2']
        En_exp = En_exp * (1.0 - w_amph) + h_amph_bowl * w_amph

        r_lk = np.hypot((X_exp - lk_x) / rx_t, (Y_exp - lk_y) / ry_t)
        in_lk = r_lk <= 1.0
        is_seow_tarn |= in_lk
        En_exp = np.where(in_lk, bed_t + (wl_t - bed_t - 4.0) * (r_lk ** 1.5), En_exp)
        whas_exp[in_lk] = True
        wlev_exp[in_lk] = wl_t

    # Pin the 6 `SE outer wall` showcase stations on dry ground at their exact target elevations:
    seow_station_pins = [
        (1031, 1252, 3620.0),  # 1. godsgate
        (1016, 1236, 3680.0),  # 2. gatetarn
        (1064, 1272, 3940.0),  # 3. ambertarn
        (1134, 1218, 4120.0),  # 4. mirrorscarp
        (1208, 1254, 4380.0),  # 5. jadecrest
        (1288, 1184, 3820.0),  # 6. coppertarn
    ]
    for st_x, st_y, st_h in seow_station_pins:
        r_st = np.hypot(X_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] - st_x, Y_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] - st_y)
        w_st_pin = (1.0 - G.sstep(0.0, 2.6, r_st)) * (~is_seow_tarn[st_y - 3:st_y + 4, st_x - 3:st_x + 4]).astype(float)
        En_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] = (
            En_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] * (1.0 - w_st_pin) + st_h * w_st_pin
        )
    w_seow_all = np.clip(np.maximum(w_seow_env, np.maximum(w_seow_oasis, 0.85 * nd.gaussian_filter(mask_seow.astype(float), sigma=3.0))), 0.0, 1.0)

    # ── 4. `twins` (`rmw536m06wlyf`, Option A): Active Small Twin Volcanoes, Caravan Saddle, 5 Geothermal Oases,
    #       Lava-Tube Skylight Bench, 2 Active Lava-Pool Traps, & 2 Dead-End Frozen Box Vales (`X=935..1095, Y=1419..1570`)
    #       Recalibrated so the NE Volcanic & Climate Apron Stops Cleanly at the SW Rim of `The Catch` (`rmvka7icdn1dq`),
    #       Restoring the ~28,000 km² `< 1,000 m` Alkali Desert Floor, Salt Playas, and Wadis! ──
    twins_pts = [
        [935, 1476], [978, 1419], [1059, 1472], [1095, 1521],
        [1092, 1556], [1043, 1570], [987, 1515],
    ]
    mask_twins = G.poly(twins_pts, 1.0, 1.0, (NEW_OH, NEW_OW))
    whas_exp[mask_twins] = False
    wlev_exp[mask_twins] = np.nan

    d_in_tw = nd.distance_transform_edt(mask_twins)
    d_out_tw = nd.distance_transform_edt(~mask_twins)
    sd_twins = (d_in_tw - d_out_tw) + 3.4 * meta_nw['fbm1'] + 2.2 * meta_nw['fbm2']

    # Signed perpendicular distance NE of the Twin volcano axis `(988, 1458) -> (1042, 1498)` (positive toward The Catch):
    p_tw_ne_full = (X_exp - 988.0) * 0.5953 - (Y_exp - 1458.0) * 0.8035
    r_cone_min_full = np.minimum(np.hypot(X_exp - 988.0, Y_exp - 1458.0), np.hypot(X_exp - 1042.0, Y_exp - 1498.0))
    r_lookout_full = np.hypot(X_exp - 1056.0, Y_exp - 1462.0)

    # On the SW/NW/SE mountain spine sides (`p_tw_ne_full <= 6.0`), use the wide `-24..+8 px` feather;
    # on the NE side facing The Catch (`p_tw_ne_full > 6.0`), pull back the feather to `-5.0..+5.0 px`
    # and protect the low `< 1,250 m` alkali desert floor of The Catch outside the `r <= 14.5 px` volcanic cones
    # and compact `catchlookout` spur `(1056, 1462)`!
    u_ne_catch_side = G.sstep(4.0, 13.0, p_tw_ne_full) * G.sstep(13.0, 18.0, r_cone_min_full) * G.sstep(3.5, 7.5, r_lookout_full)
    w_tw_sw_env = G.sstep(-24.0, 8.0, sd_twins)
    w_tw_ne_env = G.sstep(-4.5, 5.0, sd_twins) * G.sstep(920.0, 1650.0, En_exp)
    w_twins_env = (w_tw_sw_env * (1.0 - u_ne_catch_side) + w_tw_ne_env * u_ne_catch_side) * (~whas_exp).astype(float)
    # Also ensure the `r <= 15.5 px` volcanic cone aprons around `(988, 1458)` and `(1042, 1498)` blend smoothly:
    w_cone_apron_env = (1.0 - G.sstep(11.5, 17.5, r_cone_min_full)) * (~whas_exp).astype(float)
    w_lookout_spur = (1.0 - G.sstep(2.5, 6.8, r_lookout_full)) * (~whas_exp).astype(float)
    w_twins_env = np.maximum(w_twins_env, np.maximum(w_cone_apron_env, w_lookout_spur))

    # Protect neighboring settlements Qiblai (963, 1566), Stair (1106, 1442), and Strongbow (1026, 1594):
    for sx_prot, sy_prot, r_in_p, r_out_p in [(963.0, 1566.0, 5.0, 14.0), (1106.0, 1442.0, 5.0, 14.0), (1026.0, 1594.0, 6.0, 16.0)]:
        w_twins_env *= G.sstep(r_in_p, r_out_p, np.hypot(X_exp - sx_prot, Y_exp - sy_prot))

    y0_tw, y1_tw, x0_tw, x1_tw = 1396, 1592, 912, 1118
    E_tw_sub = En_exp[y0_tw:y1_tw, x0_tw:x1_tw].copy()
    # Extract natural multi-scale mountain ridge texture directly from `Eo_1393` (before `volcanoes.py`)
    # so zero circular cone moat or ring is present in the base relief:
    E_tw_orig = Eo_1393[y0_tw - DY:y1_tw - DY, x0_tw - DX:x1_tw - DX].copy()
    E_tw_base = nd.gaussian_filter(E_tw_orig, sigma=6.5)
    E_tw_mid = nd.gaussian_filter(E_tw_orig, sigma=2.2)
    dE_tw_hp = E_tw_orig - E_tw_mid
    dE_tw_med = E_tw_mid - E_tw_base
    fbm1_tw = meta_nw['fbm1'][y0_tw:y1_tw, x0_tw:x1_tw]
    fbm2_tw = meta_nw['fbm2'][y0_tw:y1_tw, x0_tw:x1_tw]
    px_tw = X_exp[y0_tw:y1_tw, x0_tw:x1_tw]
    py_tw = Y_exp[y0_tw:y1_tw, x0_tw:x1_tw]
    px_tw_w = px_tw + 2.1 * fbm1_tw + 1.2 * fbm2_tw
    py_tw_w = py_tw + 2.1 * fbm2_tw

    # Construct the natural NW-SE `twins` dividing mountain ridge (`+3,350..+4,650 m` along the crest,
    # sloping down smoothly toward The Catch on the NE and Xanadu on the SW):
    twins_spine_ctrl = [
        (942.0, 1432.0, 4150.0, 26.0),
        (968.0, 1444.0, 4420.0, 25.0),
        (988.0, 1458.0, 4520.0, 24.0),
        (1015.0, 1478.0, 4280.0, 24.0),
        (1042.0, 1498.0, 4420.0, 24.0),
        (1068.0, 1524.0, 4350.0, 25.0),
        (1088.0, 1546.0, 4050.0, 26.0),
    ]
    d2_sp = np.full_like(E_tw_sub, 1e12)
    fl_sp = np.zeros_like(E_tw_sub)
    hw_sp = np.full_like(E_tw_sub, 25.0)
    for idx_sp in range(len(twins_spine_ctrl) - 1):
        sx0, sy0, sf0, shw0 = twins_spine_ctrl[idx_sp]
        sx1, sy1, sf1, shw1 = twins_spine_ctrl[idx_sp + 1]
        for s_sp in np.linspace(0.0, 1.0, 16):
            cx_s = sx0 + s_sp * (sx1 - sx0)
            cy_s = sy0 + s_sp * (sy1 - sy0)
            cf_s = sf0 + s_sp * (sf1 - sf0)
            chw_s = shw0 + s_sp * (shw1 - shw0)
            d2_s = (px_tw_w - cx_s) ** 2 + (py_tw_w - cy_s) ** 2
            better_s = d2_s < d2_sp
            d2_sp = np.where(better_s, d2_s, d2_sp)
            fl_sp = np.where(better_s, cf_s, fl_sp)
            hw_sp = np.where(better_s, chw_s, hw_sp)
    d_sp = np.sqrt(d2_sp)
    fl_sp = nd.gaussian_filter(fl_sp, sigma=1.8)
    u_sp = np.clip(d_sp / np.maximum(hw_sp, 1.0), 0.0, 1.5)
    E_tw_ridge = (
        fl_sp
        - 820.0 * (u_sp ** 1.35)
        + 260.0 * np.tanh((E_tw_base - 6500.0) / 3800.0)
    )
    h_twins_cord = np.clip(
        E_tw_ridge
        + 0.45 * np.clip(dE_tw_med, -550.0, 620.0)
        + 0.52 * np.clip(dE_tw_hp, -350.0, 420.0)
        + 185.0 * (np.abs(fbm1_tw) - 0.42)
        + 115.0 * fbm2_tw,
        2950.0,
        5150.0,
    )

    # 1. SW–NE Caravan Saddle (*Col of the Two Horns*) between the two Twins:
    twins_col_ctrl = [
        (988.0, 1518.0, 3450.0, 6.5),
        (996.0, 1504.0, 3780.0, 5.8),   # Oasis #1: Hammām al-Qiblī
        (1005.0, 1489.0, 4320.0, 5.5),  # Oasis #2: 'Ayn al-Kibrīt
        (1016.0, 1479.0, 4680.0, 5.5),  # Oasis #3: Majlis al-Nār (`brazier`)
        (1031.0, 1473.0, 4410.0, 5.5),  # Oasis #4: Birkat al-Dukhān
        (1056.0, 1462.0, 3690.0, 5.2),  # Oasis #5: Bāb al-Maṣīd (`catchlookout` rim promontory)
    ]
    d2_tc = np.full_like(E_tw_sub, 1e12)
    fl_tc = np.zeros_like(E_tw_sub)
    hw_tc = np.full_like(E_tw_sub, 5.8)
    for idx_tc in range(len(twins_col_ctrl) - 1):
        cx0, cy0, cf0, chw0 = twins_col_ctrl[idx_tc]
        cx1, cy1, cf1, chw1 = twins_col_ctrl[idx_tc + 1]
        for s_tc in np.linspace(0.0, 1.0, 16):
            sx_t = cx0 + s_tc * (cx1 - cx0)
            sy_t = cy0 + s_tc * (cy1 - cy0)
            sf_t = cf0 + s_tc * (cf1 - cf0)
            shw_t = chw0 + s_tc * (chw1 - chw0)
            d2_t = (px_tw_w - sx_t) ** 2 + (py_tw_w - sy_t) ** 2
            better_t = d2_t < d2_tc
            d2_tc = np.where(better_t, d2_t, d2_tc)
            fl_tc = np.where(better_t, sf_t, fl_tc)
            hw_tc = np.where(better_t, shw_t, hw_tc)
    d_tc = np.sqrt(d2_tc)
    fl_tc = nd.gaussian_filter(fl_tc, sigma=1.4)
    u_tc = d_tc / np.maximum(hw_tc, 1.0)
    w_tc_pass = 1.0 - G.sstep(0.0, 1.35, u_tc)
    h_tc_trough = fl_tc + 260.0 * (np.clip(u_tc, 0.0, 1.35) ** 1.65) + 18.0 * fbm2_tw
    h_twins_cord = h_twins_cord * (1.0 - w_tc_pass) + h_tc_trough * w_tc_pass

    # 2. Sculpt the Two Active Small Volcanoes (Option A) as natural, ridge-aligned, domain-warped
    #    additive volcanic cones (`h_twins_cord + lift`) with elongated volcanic aprons along the NW-SE
    #    spine and a compact NE Catch-side apron so radial elevation decreases monotonically outward
    #    while leaving The Catch's alkali desert floor intact:
    # NW Twin (`(988, 1458)`: crater floor 5,980 m, WSW summit rim 6,480 m at `(985, 1459)`)
    r_nw_t = np.hypot(px_tw - 988.0, py_tw - 1458.0)
    dx_nw = px_tw - 988.0 + 3.2 * fbm1_tw * G.sstep(2.2, 8.5, r_nw_t) + 1.8 * fbm2_tw * G.sstep(4.0, 12.0, r_nw_t)
    dy_nw = py_tw - 1458.0 + 3.2 * fbm2_tw * G.sstep(2.2, 8.5, r_nw_t) - 1.6 * fbm1_tw * G.sstep(4.0, 12.0, r_nw_t)
    s_nw_ax = 0.80 * dx_nw + 0.60 * dy_nw
    p_nw_ax = -0.60 * dx_nw + 0.80 * dy_nw
    r_nw_eff = np.hypot(s_nw_ax / 1.38, p_nw_ax / 0.92)
    th_nw_t = np.arctan2(py_tw - 1458.0, px_tw - 988.0)
    r_rim_nw = 2.05
    h_rim_nw = 6260.0 + 220.0 * np.cos(th_nw_t - 2.65)
    u_nw_fl = np.clip((r_nw_eff - r_rim_nw) / (26.0 - r_rim_nw), 0.0, 1.0)
    prof_nw = (1.0 - G.sstep(0.0, 1.0, u_nw_fl)) ** 1.85
    h_nw_flank = h_twins_cord + np.maximum(0.0, h_rim_nw - h_twins_cord) * prof_nw
    h_twins_cord = np.where(
        r_nw_t <= r_rim_nw,
        5980.0 + (h_rim_nw - 5980.0) * G.sstep(0.20, 1.0, r_nw_t / r_rim_nw),
        h_nw_flank,
    )

    # SE Twin (`(1042, 1498)`: subglacial caldera floor 5,420 m, NW summit rim 5,880 m at `(1039, 1496)`)
    r_se_t = np.hypot(px_tw - 1042.0, py_tw - 1498.0)
    dx_se = px_tw - 1042.0 + 3.2 * fbm1_tw * G.sstep(2.2, 8.5, r_se_t) + 1.8 * fbm2_tw * G.sstep(4.0, 12.0, r_se_t)
    dy_se = py_tw - 1498.0 + 3.2 * fbm2_tw * G.sstep(2.2, 8.5, r_se_t) - 1.6 * fbm1_tw * G.sstep(4.0, 12.0, r_se_t)
    s_se_ax = 0.80 * dx_se + 0.60 * dy_se
    p_se_ax = -0.60 * dx_se + 0.80 * dy_se
    r_se_eff = np.hypot(s_se_ax / 1.38, p_se_ax / 0.92)
    th_se_t = np.arctan2(py_tw - 1498.0, px_tw - 1042.0)
    r_rim_se = 2.05
    h_rim_se = 5710.0 + 170.0 * np.cos(th_se_t + 2.46)
    u_se_fl = np.clip((r_se_eff - r_rim_se) / (26.0 - r_rim_se), 0.0, 1.0)
    prof_se = (1.0 - G.sstep(0.0, 1.0, u_se_fl)) ** 1.85
    h_se_flank = h_twins_cord + np.maximum(0.0, h_rim_se - h_twins_cord) * prof_se
    h_twins_cord = np.where(
        r_se_t <= r_rim_se,
        5420.0 + (h_rim_se - 5420.0) * G.sstep(0.20, 1.0, r_se_t / r_rim_se),
        h_se_flank,
    )

    # 3. Two Inter-Twin Fissure Cones (`(1007, 1472)` at 4,680/4,840 m and `(1024, 1485)` at 4,460/4,610 m):
    for fvx, fvy, f_fl, f_pk in [(1007.0, 1472.0, 4680.0, 4840.0), (1024.0, 1485.0, 4460.0, 4610.0)]:
        r_fv = np.hypot(px_tw - fvx, py_tw - fvy)
        u_fv = np.clip((r_fv - 1.4) / (6.5 - 1.4), 0.0, 1.0)
        h_fv_flank = h_twins_cord + np.maximum(0.0, f_pk - h_twins_cord) * ((1.0 - G.sstep(0.0, 1.0, u_fv)) ** 1.8)
        h_twins_cord = np.where(
            r_fv <= 1.4,
            f_fl + (f_pk - f_fl) * G.sstep(0.20, 1.0, r_fv / 1.4),
            h_fv_flank,
        )

    # 4. Smoothly grade the Two Dead-End Frozen Vales (`(968, 1442)` at +4,720 m `shroudvale` & `(1068, 1528)` at +4,580 m),
    #    Two Active Lava-Pool Shelves (`(992, 1465)` at +4,890 m `lavasump` & `(1035, 1493)` at +4,760 m),
    #    and Lava-Tube Skylight Bench (`(980, 1467)` at +4,240 m `pyroduct`) into the slope WITHOUT raised circular rims:
    for bvx, bvy, bv_fl, rx_b, ry_b in [
        (968.0, 1442.0, 4720.0, 6.0, 4.2),
        (1068.0, 1528.0, 4580.0, 6.0, 4.2),
        (980.0, 1467.0, 4240.0, 4.8, 3.6),
    ]:
        r_bv = np.hypot((px_tw_w - bvx) / rx_b, (py_tw_w - bvy) / ry_b)
        w_bv = (1.0 - G.sstep(0.35, 1.25, r_bv)) * G.sstep(3.5, 6.5, r_nw_t) * G.sstep(3.5, 6.5, r_se_t)
        h_twins_cord = h_twins_cord * (1.0 - w_bv) + (bv_fl + 14.0 * fbm2_tw) * w_bv

    # Smooth any micro-steps in `h_twins_cord` outside the 2.6-px summit rims before blending into `En_exp`:
    w_cone_core = np.maximum(1.0 - G.sstep(1.8, 3.2, r_nw_t), 1.0 - G.sstep(1.8, 3.2, r_se_t))
    h_twins_cord_blur = nd.gaussian_filter(h_twins_cord, sigma=1.15)
    h_twins_cord = h_twins_cord * w_cone_core + h_twins_cord_blur * (1.0 - w_cone_core)

    En_exp[y0_tw:y1_tw, x0_tw:x1_tw] = E_tw_sub * (1.0 - w_twins_env[y0_tw:y1_tw, x0_tw:x1_tw]) + h_twins_cord * w_twins_env[y0_tw:y1_tw, x0_tw:x1_tw]

    # Build the 5 Geothermal Oasis microclimate envelopes (`w_twins_oasis`) and active lava-pool glow masks (`w_twins_lava`):
    twins_oasis_specs = [
        (996.0, 1504.0, 3780.0),   # Oasis #1: Hammām al-Qiblī
        (1005.0, 1489.0, 4320.0),  # Oasis #2: 'Ayn al-Kibrīt
        (1016.0, 1479.0, 4680.0),  # Oasis #3: Majlis al-Nār (`brazier`)
        (1031.0, 1473.0, 4410.0),  # Oasis #4: Birkat al-Dukhān
        (1056.0, 1462.0, 3690.0),  # Oasis #5: Bāb al-Maṣīd (`catchlookout`)
    ]
    w_twins_oasis = np.zeros((NEW_OH, NEW_OW), dtype=float)
    for ox_t, oy_t, oh_t in twins_oasis_specs:
        r_oa = np.hypot((X_exp - ox_t) / 3.6, (Y_exp - oy_t) / 3.0)
        w_oa = 1.0 - G.sstep(0.35, 1.25, r_oa)
        w_twins_oasis = np.maximum(w_twins_oasis, w_oa)
        En_exp = En_exp * (1.0 - 0.75 * w_oa) + oh_t * (0.75 * w_oa)

    w_twins_lava = np.maximum(
        1.0 - G.sstep(0.8, 2.6, np.hypot(X_exp - 992.0, Y_exp - 1465.0)),
        1.0 - G.sstep(0.8, 2.6, np.hypot(X_exp - 1035.0, Y_exp - 1493.0)),
    )

    twins_station_pins = [
        (980, 1467, 4240.0),   # 1. pyroduct
        (1016, 1479, 4680.0),  # 2. brazier
        (992, 1465, 4890.0),   # 3. lavasump
        (968, 1442, 4720.0),   # 4. shroudvale
        (1042, 1498, 5420.0),  # 5. erebustwin (SE Twin crater floor)
        (1056, 1462, 3690.0),  # 6. catchlookout
    ]
    for st_x, st_y, st_h in twins_station_pins:
        r_st = np.hypot(X_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] - st_x, Y_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] - st_y)
        w_st_pin = 1.0 - G.sstep(0.0, 2.0, r_st)
        En_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] = (
            En_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] * (1.0 - w_st_pin) + st_h * w_st_pin
        )
    # Pin exact Option A summit rims & crater floors on `En_exp`:
    En_exp[1459, 985] = 6480.0
    En_exp[1458, 988] = 5980.0
    En_exp[1496, 1039] = 5880.0
    En_exp[1498, 1042] = 5420.0
    En_exp[1471, 1006] = 4840.0
    En_exp[1472, 1007] = 4680.0
    En_exp[1484, 1023] = 4610.0
    En_exp[1485, 1024] = 4460.0
    w_twins_all = np.clip(np.maximum(w_twins_env, np.maximum(w_twins_oasis, 0.85 * nd.gaussian_filter(mask_twins.astype(float), sigma=3.0) * (1.0 - u_ne_catch_side))), 0.0, 1.0)
    del (
        E_alp_base, E_gc_orig, E_gc_orig_smooth, E_gc_rim_soft, E_gh_s14, E_gh_s2, E_gh_s6, E_gh_sub,
        E_sc_smooth, E_sw_base, E_sw_mid, E_sw_sub, E_tw_base, E_tw_mid, E_tw_orig, E_tw_ridge, E_tw_sub,
        En_coast_blur, En_exp_s, Xw_cg, Yw_cg, coastal_moisture, coastal_spike, d2_gc_ax,
        d_ax_gc, d_in_gc, d_in_gh, d_in_seow, d_in_tw, d_out_gc, d_out_gh, d_out_seow, d_out_tw,
        d_spirl, d_voth, d_water_px, dike_rib_gc, eff_in_gc, fbm1_gc, fbm2_gc, fl_gc_ax,
        gc_stale_tarn, gh_stale_tarn, grad_px, gx_chk, gy_chk, gy_sc,
        h_gc_chaos_ch, h_gc_mesa_target, h_gc_north_ramp, h_gc_prof, h_gc_tier2, h_gc_tier3,
        h_seow_cord, h_twins_cord, h_twins_cord_blur, in_arch_box, in_copper_glacier, in_ne_cauldrons,
        in_sasq_vales, in_silent_vales, is_sea_nw, mask_gc, mask_gh, mask_gh_main, med3_e, med5_e,
        nw_edit_land, ph_gc_1, ph_gc_2, ph_gc_3, px_gc, px_gc_raw, py_gc, py_gc_raw,
        r_cone_min_full, r_gh_center, r_lookout_full, rain_nw_syn, ridge_fbm, rn_seam_fix,
        scallop_gh, sd_gc_eff, sd_gc_n_lobe, sd_new, sd_seow, slope_nw, t_e_sc, tc_sv_target,
        th_gh_rad, tharn_land, tw_sv_target, u1_sc, u2_sc, u3_sc, u4_sc, u5_sc,
        u_gc, u_gc_bench, u_gc_w1, u_gc_w2, u_stalker_sw, w_arach_zone, w_batch5_clim,
        w_cone_apron_env, w_cone_core, w_crook, w_fix_both, w_gc_blk_eff, w_gc_ch_eff, w_gc_ch_trough,
        w_gc_chaos_zone, w_gc_mesa_cap, w_gc_north_end, w_gc_raw, w_gh_all, w_gh_caldera,
        w_lookout_spur, w_n_slump, w_nw_clim, w_sc_band, w_sc_north_face, w_sc_xy,
        w_seow_env, w_seow_north, w_spirl_guard, w_sv_temp, w_trans_clim, w_twins_env, w_voth_guard,
    )
    gc.collect()

    # ── 5. `opal valley` (`rmw52q8d7prwz`): Glaciated East Headwall, Three Terraced Beds of 10 Small Rift Lakes,
    #       & Iridescent Xanadu-Kin Forest Slopes (`X=960..1146, Y=1622..1698`) ──
    oval_pts = [
        [982, 1622], [1019, 1638], [1047, 1648], [1065, 1660],
        [1112, 1664], [1146, 1676], [1107, 1691], [1066, 1698],
        [1051, 1698], [1013, 1685], [960, 1640],
    ]
    mask_oval = G.poly(oval_pts, 1.0, 1.0, (NEW_OH, NEW_OW))
    # Clear the old perched 2,519.6 m lake in and immediately west of `opal valley` while preserving the Rift Sea (`wlev < 0`):
    old_oval_perched = (
        mask_oval
        | ((Y_exp >= 1634.0) & (Y_exp <= 1666.0) & (X_exp >= 954.0) & (X_exp <= 992.0) & (np.nan_to_num(wlev_exp, nan=-9999.0) > 500.0))
    )
    whas_exp[old_oval_perched] = False
    wlev_exp[old_oval_perched] = np.nan

    d_in_ov = nd.distance_transform_edt(mask_oval)
    d_out_ov = nd.distance_transform_edt(~mask_oval)
    sd_oval = (d_in_ov - d_out_ov) + 3.4 * meta_nw['fbm1'] + 2.2 * meta_nw['fbm2']
    # Tighter transition along the northern Oidong divide (`Y <= 1654`) and wide 30-px feather apron on the southern snowpack (`Y > 1654`):
    w_oval_north = 1.0 - G.sstep(1644.0, 1664.0, Y_exp)
    w_oval_env = (
        w_oval_north * G.sstep(-7.0, 5.0, sd_oval)
        + (1.0 - w_oval_north) * G.sstep(-30.0, 9.0, sd_oval)
    ) * (~whas_exp).astype(float)
    # Also include the cleared western perched-lake box (`X = 955..982, Y = 1634..1662`) so it grades smoothly into the valley mouth:
    w_west_perched_fix = (
        G.sstep(950.0, 962.0, X_exp) * (1.0 - G.sstep(980.0, 994.0, X_exp))
        * G.sstep(1630.0, 1639.0, Y_exp) * (1.0 - G.sstep(1658.0, 1672.0, Y_exp))
        * (~whas_exp).astype(float)
    )
    w_oval_env = np.maximum(w_oval_env, w_west_perched_fix)
    # Protect Strongbow (1026, 1594) and Strongwall (914, 1634):
    for sx_prot, sy_prot, r_in_p, r_out_p in [(1026.0, 1594.0, 6.0, 16.0), (914.0, 1634.0, 6.0, 16.0)]:
        w_oval_env *= G.sstep(r_in_p, r_out_p, np.hypot(X_exp - sx_prot, Y_exp - sy_prot))

    y0_ov, y1_ov, x0_ov, x1_ov = 1606, 1724, 948, 1172
    E_ov_sub = En_exp[y0_ov:y1_ov, x0_ov:x1_ov].copy()
    fbm1_ov = meta_nw['fbm1'][y0_ov:y1_ov, x0_ov:x1_ov]
    fbm2_ov = meta_nw['fbm2'][y0_ov:y1_ov, x0_ov:x1_ov]
    px_ov = X_exp[y0_ov:y1_ov, x0_ov:x1_ov]
    py_ov = Y_exp[y0_ov:y1_ov, x0_ov:x1_ov]
    # Pre-smooth the sharp 2,519 m -> 11,000 m old shoreline cliff inside `E_ov_sub` before extracting detail
    # so zero old lake-wall step bleeds into the southern valley slopes:
    E_ov_clean = nd.gaussian_filter(np.clip(E_ov_sub, 2200.0, 9500.0), sigma=3.2)
    E_ov_base = nd.gaussian_filter(E_ov_clean, sigma=6.5)
    E_ov_mid = nd.gaussian_filter(E_ov_clean, sigma=2.2)
    dE_ov_hp = E_ov_clean - E_ov_mid
    dE_ov_med = E_ov_mid - E_ov_base

    # Rescale the flanking Opal Valley horst walls & eastern glaciated headwall (`+2,800..+5,350 m` rising W -> E):
    u_east_ov = np.clip((px_ov - 965.0) / 175.0, 0.0, 1.0)
    wall_base_ov = 2750.0 + 2150.0 * (u_east_ov ** 1.15) + 380.0 * np.tanh(np.maximum(0.0, E_ov_base - 4200.0) / 4500.0)
    h_oval_cord = np.clip(
        wall_base_ov + 0.38 * np.clip(dE_ov_med, -450.0, 520.0) + 0.42 * np.clip(dE_ov_hp, -280.0, 320.0)
        + 175.0 * (np.abs(fbm1_ov) - 0.42) + 105.0 * fbm2_ov,
        2450.0,
        5450.0,
    )

    # Carve the 370-km WNW-sloping Three-Terrace Valley Trough (`oval_thalweg_ctrl`):
    oval_thalweg_ctrl = [
        # (x, y, floor_m, hw_px)
        (1138.0, 1678.0, 4850.0, 10.5),
        (1124.0, 1676.0, 4150.0, 11.5),  # Station 1: glacier (`+4,150 m`)
        (1110.0, 1675.5, 3350.0, 12.2),
        (1095.0, 1675.0, 2622.0, 13.5),  # Terrace Bed I East (`+2,620 m` lake)
        (1080.0, 1672.0, 2540.0, 14.0),  # Terrace Bed I Mid (`+2,540 m` lake & Station 2 `upperbed`)
        (1065.0, 1668.0, 2468.0, 13.5),  # Terrace Bed I West (`+2,470 m` lake)
        (1059.5, 1667.0, 1920.0, 12.5),  # Upper Fault Riser Cataract
        (1053.0, 1666.0, 1392.0, 13.5),  # Terrace Bed II East (`+1,390 m` lake)
        (1036.0, 1662.0, 1340.0, 14.2),  # Terrace Bed II Mid (`+1,340 m` lake & Station 3 `middlebed`)
        (1025.0, 1657.0, 1290.0, 13.8),  # Terrace Bed II West-Mid (`+1,290 m` lake)
        (1017.0, 1653.0, 1245.0, 13.2),  # Terrace Bed II West (`+1,245 m` lake)
        (1012.0, 1651.0, 780.0, 12.5),   # Middle Fault Riser Cataract
        (1007.0, 1649.0, 342.0, 13.5),   # Terrace Bed III East (`+340 m` lake)
        (996.0, 1645.0, 275.0, 14.0),    # Terrace Bed III Mid (`+275 m` lake & Station 4 `lowerbed`)
        (985.0, 1641.0, 210.0, 13.8),    # Terrace Bed III West (`+210 m` lake)
        (978.0, 1638.5, 125.0, 14.0),    # Lower Fault Riser Cataract
        (972.0, 1636.0, 60.0, 14.5),     # Station 5: riftmouth (`+60 m`)
        (964.0, 1631.0, -380.0, 15.0),   # Rift-Floor Shore Ramp
    ]
    d2_ov = np.full_like(E_ov_sub, 1e12)
    fl_ov = np.zeros_like(E_ov_sub)
    hw_ov = np.full_like(E_ov_sub, 13.5)
    px_ov_w = px_ov + 1.4 * fbm1_ov + 0.9 * fbm2_ov
    py_ov_w = py_ov + 1.4 * fbm2_ov
    for idx_ov in range(len(oval_thalweg_ctrl) - 1):
        ox0, oy0, of0, ohw0 = oval_thalweg_ctrl[idx_ov]
        ox1, oy1, of1, ohw1 = oval_thalweg_ctrl[idx_ov + 1]
        for s_ov in np.linspace(0.0, 1.0, 16):
            sx_o = ox0 + s_ov * (ox1 - ox0)
            sy_o = oy0 + s_ov * (oy1 - oy0)
            sf_o = of0 + s_ov * (of1 - of0)
            shw_o = ohw0 + s_ov * (ohw1 - ohw0)
            d2_o = (px_ov_w - sx_o) ** 2 + (py_ov_w - sy_o) ** 2
            better_o = d2_o < d2_ov
            d2_ov = np.where(better_o, d2_o, d2_ov)
            fl_ov = np.where(better_o, sf_o, fl_ov)
            hw_ov = np.where(better_o, shw_o, hw_ov)
    d_ov = np.sqrt(d2_ov)
    fl_ov = nd.gaussian_filter(fl_ov, sigma=1.4)
    u_ov = d_ov / np.maximum(hw_ov, 1.0)
    w_ov_trough = 1.0 - G.sstep(0.0, 1.55, u_ov)
    # Flat-bottomed graben terrace bench profile (`u_ov <= 0.36` is flat terrace floor, rising up the normal-fault walls for `u_ov > 0.36`):
    u_ov_wall = np.clip((u_ov - 0.34) / 1.21, 0.0, 1.0)
    h_ov_valley = fl_ov + (h_oval_cord - fl_ov) * (G.sstep(0.0, 1.0, u_ov_wall) ** 1.45) + 14.0 * fbm2_ov * u_ov_wall
    h_oval_cord = h_oval_cord * (1.0 - w_ov_trough) + h_ov_valley * w_ov_trough

    w_ov_sub = np.maximum(w_oval_env[y0_ov:y1_ov, x0_ov:x1_ov], 0.90 * w_ov_trough * (~whas_exp[y0_ov:y1_ov, x0_ov:x1_ov]).astype(float))
    En_exp[y0_ov:y1_ov, x0_ov:x1_ov] = E_ov_sub * (1.0 - w_ov_sub) + h_oval_cord * w_ov_sub

    # Carve & Fill the 3 Elongated Rift-Terrace Ribbon Lakes (`WH`) across the Three Terraced Beds of Opal Valley
    # (replacing the 10 tiny dot lakes with 1 larger, natural ribbon lake per terrace bed while keeping all 5 showcase stations on dry shore!):
    oval_lake_specs = [
        # (lk_x, lk_y, rx, ry, ang_deg, wlev_m, bed_m, terrace_id)
        # 1. Terrace Bed I Ribbon Lake (Upper Milk-Opal Lake, +2,525 m; `upperbed` station sits on dry eastern sinter shore at 1082, 1672):
        (1073.5, 1670.5, 6.2, 2.2, -16.0, 2525.0, 2485.0, 1),
        # 2. Terrace Bed II Ribbon Lake (Middle Harlequin Mirror Lake, +1,315 m; `middlebed` station sits on dry eastern shore at 1038, 1662):
        (1027.0, 1658.0, 7.5, 2.4, -22.0, 1315.0, 1270.0, 2),
        # 3. Terrace Bed III Ribbon Lake (Lower Fire-Opal Lagoon, +255 m; `lowerbed` station sits on dry eastern shore at 998, 1646):
        (989.5,  1643.0, 6.0, 2.2, -20.0,  255.0,  215.0, 3),
    ]
    is_oval_lake = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    w_oval_sinter = np.zeros((NEW_OH, NEW_OW), dtype=float)
    for lk_x, lk_y, rx_l, ry_l, ang_l, wl_l, bed_l, _tid in oval_lake_specs:
        th_l = math.radians(ang_l)
        ca_l, sa_l = math.cos(th_l), math.sin(th_l)
        dx_l = X_exp - lk_x
        dy_l = Y_exp - lk_y
        u_maj = (dx_l * ca_l + dy_l * sa_l) + 0.45 * meta_nw['fbm2']
        v_min = (-dx_l * sa_l + dy_l * ca_l) + 0.35 * meta_nw['fbm1']
        r_bench = np.hypot(u_maj / (rx_l * 1.85), v_min / (ry_l * 2.25))
        w_bench = (1.0 - G.sstep(0.55, 1.30, r_bench)) * (~is_oval_lake).astype(float)
        w_oval_sinter = np.maximum(w_oval_sinter, w_bench)
        En_exp = En_exp * (1.0 - w_bench) + (wl_l + 3.5 + 38.0 * G.sstep(0.55, 1.25, r_bench)) * w_bench

        r_lk = np.hypot(u_maj / rx_l, v_min / ry_l)
        in_lk = r_lk <= 1.0
        is_oval_lake |= in_lk
        En_exp = np.where(in_lk, bed_l + (wl_l - bed_l - 4.0) * (r_lk ** 1.5), En_exp)
        whas_exp[in_lk] = True
        wlev_exp[in_lk] = wl_l

    # Pin the 5 `opal valley` showcase stations on dry ground at their exact target elevations:
    oval_station_pins = [
        (1124, 1676, 4150.0),  # 1. glacier
        (1082, 1672, 2540.0),  # 2. upperbed
        (1038, 1662, 1340.0),  # 3. middlebed
        (998, 1646, 275.0),    # 4. lowerbed
        (972, 1636, 60.0),     # 5. riftmouth
    ]
    for st_x, st_y, st_h in oval_station_pins:
        whas_exp[st_y - 1:st_y + 2, st_x - 1:st_x + 2] = False
        wlev_exp[st_y - 1:st_y + 2, st_x - 1:st_x + 2] = np.nan
        is_oval_lake[st_y - 1:st_y + 2, st_x - 1:st_x + 2] = False
        r_st = np.hypot(X_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] - st_x, Y_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] - st_y)
        w_st_pin = (1.0 - G.sstep(0.0, 2.2, r_st)) * (~is_oval_lake[st_y - 2:st_y + 3, st_x - 2:st_x + 3]).astype(float)
        En_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] = (
            En_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] * (1.0 - w_st_pin) + st_h * w_st_pin
        )
    w_oval_all = np.clip(np.maximum(w_oval_env, np.maximum(w_oval_sinter, 0.85 * nd.gaussian_filter(mask_oval.astype(float), sigma=3.0))), 0.0, 1.0)

    # Extend & route river `r682` (*Gūlī Qubbah* / *Nahr al-Yāqūt*) monotonically from the eastern glacier snout
    # along the dry southern lakeshore benches of the 3 ribbon lakes (never drawing a river line across a lake!)
    # and down into the southern shore of the extended Lower Xanadu Small Lake:
    oval_river_pts = [
        [1121.0, 1676.0], [1110.0, 1675.5], [1095.0, 1675.0], [1082.5, 1673.2],
        [1074.0, 1673.8], [1065.5, 1671.5], [1059.5, 1667.5],
        [1050.0, 1665.5], [1039.0, 1663.2], [1027.0, 1661.5], [1018.0, 1656.5],
        [1012.0, 1651.5], [1000.0, 1647.5], [990.0,  1646.2], [981.5,  1641.5],
        [975.0,  1637.5], [969.0,  1634.0],
    ]
    for r in rivers_exp:
        if str(r.get('id')) in ('682', 'r682'):
            r['px'] = copy.deepcopy(oval_river_pts)
            r['q_mouth'] = 85.0
            r['q_m3s'] = [round(12.0 + 73.0 * (i / float(len(oval_river_pts) - 1)), 1) for i in range(len(oval_river_pts))]
            break

    # ── 6. `Greenstep` (`rmw5n1w1rx0u2`, renamed from `Green Valley`, X=578..692, Y=1195..1349):
    #       5 Ponded Flood-Basalt Lava Terraces, Twin Collapsed Lava-Tube Rilles, Greenstep Fissure Shield,
    #       & The Free Giant Fortress of Tallwalls (`biomes/greenstep/PLAN.md`) ──
    gval_pts = [
        [662, 1348], [674, 1349], [686, 1321], [692, 1302], [668, 1253],
        [663, 1204], [631, 1195], [584, 1198], [578, 1220], [594, 1237],
        [615, 1255], [622, 1269], [637, 1289], [633, 1313], [652, 1321],
    ]
    mask_gval = G.poly(gval_pts, 1.0, 1.0, (NEW_OH, NEW_OW))
    whas_exp[mask_gval] = False
    wlev_exp[mask_gval] = np.nan

    d_in_gv = nd.distance_transform_edt(mask_gval)
    d_out_gv = nd.distance_transform_edt(~mask_gval)
    sd_gval = (d_in_gv - d_out_gv) + 3.4 * meta_nw['fbm1'] + 2.2 * meta_nw['fbm2']
    w_gv_north = 1.0 - G.sstep(1202.0, 1232.0, Y_exp)
    w_gval_env = (
        w_gv_north * G.sstep(-6.0, 5.0, sd_gval)
        + (1.0 - w_gv_north) * G.sstep(-24.0, 8.0, sd_gval)
    ) * (~whas_exp).astype(float)

    y0_gv, y1_gv, x0_gv, x1_gv = 1178, 1378, 552, 720
    E_gv_sub = En_exp[y0_gv:y1_gv, x0_gv:x1_gv].copy()
    E_gv_clean = nd.gaussian_filter(np.clip(E_gv_sub, 850.0, 9500.0), sigma=2.8)
    E_gv_base = nd.gaussian_filter(E_gv_clean, sigma=6.5)
    E_gv_mid = nd.gaussian_filter(E_gv_clean, sigma=2.2)
    dE_gv_hp = E_gv_clean - E_gv_mid
    dE_gv_med = E_gv_mid - E_gv_base
    fbm1_gv = meta_nw['fbm1'][y0_gv:y1_gv, x0_gv:x1_gv]
    fbm2_gv = meta_nw['fbm2'][y0_gv:y1_gv, x0_gv:x1_gv]
    px_gv = X_exp[y0_gv:y1_gv, x0_gv:x1_gv]
    py_gv = Y_exp[y0_gv:y1_gv, x0_gv:x1_gv]
    px_gv_w = px_gv + 1.8 * fbm1_gv + 1.0 * fbm2_gv
    py_gv_w = py_gv + 1.8 * fbm2_gv

    # Flanking ridges of Greenstep rise gradually from +1,450 m in the north to +4,850 m in the south:
    u_south_gv = np.clip((py_gv - 1192.0) / 158.0, 0.0, 1.0)
    wall_base_gv = 1350.0 + 3150.0 * (u_south_gv ** 1.20) + 380.0 * np.tanh(np.maximum(0.0, E_gv_base - 4500.0) / 4500.0)
    h_gval_cord = np.clip(
        wall_base_gv + 0.36 * np.clip(dE_gv_med, -420.0, 480.0) + 0.42 * np.clip(dE_gv_hp, -260.0, 310.0)
        + 165.0 * (np.abs(fbm1_gv) - 0.42) + 95.0 * fbm2_gv,
        920.0,
        5250.0,
    )

    # Sculpt the 5 Ponded Titanium-Basalt Mare Terraces along the NNW axis from the Greenstep Fissure Shield (668, 1344):
    #   Terrace V (+3,260 m) -> Terrace IV (+2,600 m) -> Terrace III (+1,990 m, Tallwalls) -> Terrace II (+1,450 m) -> Terrace I (+940 m)
    ux_gs, uy_gs = -0.235, -0.972  # NNW flow axis from (668.0, 1344.0) to (632.0, 1195.0)
    dx_gs = px_gv - 668.0
    dy_gs = py_gv - 1344.0
    s_gs = dx_gs * ux_gs + dy_gs * uy_gs  # 0 px at (668, 1344) -> 153 px at (632, 1195)
    p_gs = -dx_gs * uy_gs + dy_gs * ux_gs
    # Center cross-valley coordinate `p_rel_gs` on the flaring amphitheatre axis (`p_center = 8.0 - 0.165 * s_gs`):
    p_rel_gs = p_gs - (8.0 - 0.165 * np.clip(s_gs, 0.0, 155.0))

    # Bold convex down-valley lobate lava-tongue curvature (`+0.016 * p_rel_gs^2`, projecting 8-12 px forward down the valley center)
    # and razor-sharp 3.4-px (6.8 km) columnar-basalt risers separating dead-flat ponded mare benches (matching Godstep Valley):
    lobe_curve_gs = 0.016 * (p_rel_gs ** 2) - 2.2 * np.cos(p_rel_gs / 6.5) - 1.1 * fbm1_gv
    s_eff_gs = s_gs + lobe_curve_gs

    r4_gs_w = G.sstep(22.0, 25.4, s_eff_gs)    # Riser 4 (650 m drop -> Terrace IV)
    r3_gs_w = G.sstep(56.0, 59.4, s_eff_gs)    # Riser 3 (600 m drop -> Terrace III / Tallwalls)
    r2_gs_w = G.sstep(90.5, 93.9, s_eff_gs)    # Riser 2 (530 m drop -> Terrace II)
    r1_gs_w = G.sstep(119.5, 122.9, s_eff_gs)  # Riser 1 (500 m drop -> Terrace I)
    r0_gs_w = G.sstep(144.0, 148.0, s_eff_gs)  # Gate-Step terminal lip into Xanadu Rift floor

    E_greenstep_mare = (
        3265.0
        - 655.0 * r4_gs_w
        - 605.0 * r3_gs_w
        - 535.0 * r2_gs_w
        - 505.0 * r1_gs_w
        - 135.0 * r0_gs_w
        - 0.24 * np.clip(s_gs, 0.0, 155.0)       # Near-flat ponded basalt benches (only 0.12 m/km forward tilt!)
        + 125.0 * ((p_rel_gs / 30.0) ** 2)       # Gentle concave flood-basalt valley dish across the amphitheatre
        + 12.0 * fbm2_gv
    )

    # Analytical masks for the 5 lobate columnar-basalt step risers (`w_gs_riser`) and upper rim-lip brows (`w_gs_lip`):
    sd_gv_sub = sd_gval[y0_gv:y1_gv, x0_gv:x1_gv]
    w_gs_riser_sub = np.zeros_like(s_eff_gs)
    w_gs_lip_sub = np.zeros_like(s_eff_gs)
    for r_mid_gs in (23.7, 57.7, 92.2, 121.2, 146.0):
        w_gs_riser_sub = np.maximum(w_gs_riser_sub, np.exp(-0.5 * ((s_eff_gs - r_mid_gs) / 1.40) ** 2))
        w_gs_lip_sub = np.maximum(w_gs_lip_sub, np.exp(-0.5 * ((s_eff_gs - (r_mid_gs - 2.3)) / 1.25) ** 2))
    w_in_mare_sub = G.sstep(-1.0, 5.0, sd_gv_sub)
    w_gs_riser_sub *= w_in_mare_sub
    w_gs_lip_sub *= w_in_mare_sub

    # Distance to the main NNW flood-basalt trunk and the WNW Skylight Rille amphitheater:
    gval_thalweg_ctrl = [
        # (x, y, rille_cut_m, hw_px)
        (668.0, 1344.0,  85.0, 16.0),
        (666.0, 1325.0, 145.0, 18.0),
        (662.0, 1304.0, 165.0, 20.0),
        (654.0, 1286.0, 175.0, 21.0),
        (646.0, 1268.0, 185.0, 22.0),
        (644.0, 1242.0, 175.0, 23.0),
        (638.0, 1212.0, 155.0, 24.0),
        (642.0, 1195.0, 120.0, 25.0),
    ]
    gval_nw_branch_ctrl = [
        (646.0, 1272.0, 155.0, 16.0),
        (620.0, 1252.0, 150.0, 19.0),
        (600.0, 1228.0, 140.0, 21.0),
        (586.0, 1198.0, 115.0, 22.0),
    ]
    d2_gv = np.full_like(E_gv_sub, 1e12)
    rcut_gv = np.zeros_like(E_gv_sub)
    hw_gv = np.full_like(E_gv_sub, 20.0)
    for branch_ctrl in (gval_thalweg_ctrl, gval_nw_branch_ctrl):
        for idx_gv in range(len(branch_ctrl) - 1):
            gx0, gy0, gc0, ghw0 = branch_ctrl[idx_gv]
            gx1, gy1, gc1, ghw1 = branch_ctrl[idx_gv + 1]
            for s_gv in np.linspace(0.0, 1.0, 18):
                sx_g = gx0 + s_gv * (gx1 - gx0)
                sy_g = gy0 + s_gv * (gy1 - gy0)
                sc_g = gc0 + s_gv * (gc1 - gc0)
                shw_g = ghw0 + s_gv * (ghw1 - ghw0)
                d2_g = (px_gv_w - sx_g) ** 2 + (py_gv_w - sy_g) ** 2
                better_g = d2_g < d2_gv
                d2_gv = np.where(better_g, d2_g, d2_gv)
                rcut_gv = np.where(better_g, sc_g, rcut_gv)
                hw_gv = np.where(better_g, shw_g, hw_gv)
    d_gv = np.sqrt(d2_gv)
    u_gv = d_gv / np.maximum(hw_gv, 1.0)

    # Incise the two sinuous collapsed lava-tube rilles (`d_gv <= 3.0 px`) while keeping the surrounding mare benches flat!
    # Protect the Citadel Promontory of Tallwalls at `(650, 1268)` so it stands as a flat-topped basalt mesa above the rilles:
    r_tallwalls = np.hypot(px_gv - 650.0, py_gv - 1268.0)
    w_tw_prom = 1.0 - G.sstep(1.5, 4.2, r_tallwalls)
    w_gs_rille_sub = np.exp(-0.5 * (d_gv / 1.70) ** 2) * (1.0 - 0.92 * w_tw_prom) * w_in_mare_sub
    rille_incision = -rcut_gv * w_gs_rille_sub
    fl_gv = E_greenstep_mare + rille_incision

    # Sculpt the Greenstep Fissure Shield at `(668.0, 1344.0)` (+3,420 m WSW spatter rim, +3,280 m warm crater-bog floor):
    r_gsv = np.hypot(px_gv - 668.0, py_gv - 1344.0)
    th_gsv = np.arctan2(py_gv - 1344.0, px_gv - 668.0)
    r_rim_gsv = 2.2
    h_rim_gsv = 3380.0 + 40.0 * np.cos(th_gsv - 2.6)
    u_gsv_fl = np.clip((r_gsv - r_rim_gsv) / (8.5 - r_rim_gsv), 0.0, 1.0)
    h_gsv_cone = np.where(
        r_gsv <= r_rim_gsv,
        3280.0 + (h_rim_gsv - 3280.0) * G.sstep(0.25, 1.0, r_gsv / r_rim_gsv),
        fl_gv + np.maximum(0.0, h_rim_gsv - fl_gv) * ((1.0 - u_gsv_fl) ** 1.8),
    )
    w_gsv_cone = 1.0 - G.sstep(3.5, 8.5, r_gsv)
    fl_gv = fl_gv * (1.0 - w_gsv_cone) + h_gsv_cone * w_gsv_cone

    # Apply the ponded flood-basalt lava steps across the FULL interior width of the Greenstep polygon (`sd_gv_sub >= 5.5 px`),
    # grading into the bounding cordillera walls ONLY along the outer E/S/W polygon perimeter (mirroring Godstep in smodel/volcanoes.py):
    w_mouth_open_gv = 1.0 - G.sstep(1196.0, 1218.0, py_gv)
    w_mare_floor = np.maximum(
        G.sstep(-1.5, 6.0, sd_gv_sub),
        w_mouth_open_gv * G.sstep(-3.5, 2.0, sd_gv_sub),
    )
    w_gv_trough = np.maximum(w_mare_floor, 1.0 - G.sstep(0.0, 1.55, u_gv))
    u_gv_wall = 1.0 - w_mare_floor
    h_gv_valley = fl_gv + (h_gval_cord - fl_gv) * (G.sstep(0.0, 1.0, u_gv_wall) ** 1.35) + 12.0 * fbm2_gv * u_gv_wall
    h_gval_cord = h_gval_cord * (1.0 - w_gv_trough) + h_gv_valley * w_gv_trough

    w_gv_sub = np.maximum(w_gval_env[y0_gv:y1_gv, x0_gv:x1_gv], 0.85 * w_gv_trough * G.sstep(-18.0, 4.0, sd_gv_sub))
    En_exp[y0_gv:y1_gv, x0_gv:x1_gv] = E_gv_sub * (1.0 - w_gv_sub) + h_gval_cord * w_gv_sub

    w_gs_riser = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_gs_lip = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_gs_rille = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_gs_mare_paint = np.zeros((NEW_OH, NEW_OW), dtype=float)
    gs_step_idx = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_gs_riser[y0_gv:y1_gv, x0_gv:x1_gv] = w_gs_riser_sub
    w_gs_lip[y0_gv:y1_gv, x0_gv:x1_gv] = w_gs_lip_sub
    w_gs_rille[y0_gv:y1_gv, x0_gv:x1_gv] = w_gs_rille_sub
    w_gs_mare_paint[y0_gv:y1_gv, x0_gv:x1_gv] = w_mare_floor * (~whas_exp[y0_gv:y1_gv, x0_gv:x1_gv]).astype(float)
    gs_step_idx[y0_gv:y1_gv, x0_gv:x1_gv] = r4_gs_w + r3_gs_w + r2_gs_w + r1_gs_w

    # Pin the 6 `Greenstep` showcase stations (including the Fortress of Tallwalls at `650, 1268` at `+1,980.0 m`):
    greenstep_station_pins = [
        (638, 1212,  955.0),  # 1. gatestep (Terrace I: The Lower Mare Gate-Step)
        (644, 1242, 1465.0),  # 2. loamstep (Terrace II: The Hanging Cataracts & Giant Farms)
        (650, 1268, 1985.0),  # 3. tallwalls (Terrace III: The Fortress of Tallwalls / Talodunon)
        (636, 1274, 1875.0),  # 4. rilleforge (The Hollow Way Skylight & Four-Arm Rille-Forges)
        (662, 1304, 2595.0),  # 5. cloudstep (Terrace IV: The Spiral-Fern Cloud Bench)
        (668, 1338, 3280.0),  # 6. headvent (Terrace V: The Greenstep Fissure Shield)
    ]
    for st_x, st_y, st_h in greenstep_station_pins:
        r_st = np.hypot(X_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] - st_x, Y_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] - st_y)
        w_st_pin = 1.0 - G.sstep(0.0, 2.6, r_st)
        En_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] = (
            En_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] * (1.0 - w_st_pin) + st_h * w_st_pin
        )
    w_gval_all = np.clip(np.maximum(w_gval_env, 0.85 * nd.gaussian_filter(mask_gval.astype(float), sigma=3.0)), 0.0, 1.0)

    # 8. `Shumar` (`rmw5s3ktxgv0d`) — Dissected Continental Highland Bench (`+2,760..+4,380 m`, `> 80%` Continental `Dsb`/`Dfb`/`Dsc`/`Dfc`
    #    with a smooth SE Boreal/Subarctic/Alpine ramp into `Godthrone` and a smooth SW saddle into `Greenstep`):
    shumar_pts = [
        [681, 1187], [699, 1220], [727, 1226], [779, 1205],
        [826, 1123], [812, 1109], [718, 1161], [698, 1166],
    ]
    mask_shumar = G.poly(shumar_pts, 1.0, 1.0, (NEW_OH, NEW_OW)) > 0.5
    d_in_sh = nd.distance_transform_edt(mask_shumar)
    d_out_sh = nd.distance_transform_edt(~mask_shumar)
    sd_shumar = (d_in_sh - d_out_sh) + 2.2 * meta_nw['fbm1'] + 1.5 * meta_nw['fbm2']

    # Cross-strike SE coordinate (`0.0` along NW border `[681, 1187]..[812, 1109]`, `1.0` along SE Godthrone border `[699, 1220]..[826, 1123]`):
    s_se_sh = (X_exp - 698.0) * 0.683 + (Y_exp - 1166.0) * 0.730
    u_se_sh = np.clip(s_se_sh / 76.0, 0.0, 1.0)
    # Use a crisp `3.5 px` feather along the NW Vothic lowland rim, and a wide `28 px` feather along BOTH
    # the SE Godthrone border (`u_se_sh >= 0.25`) AND the SW Greenstep saddle (`Y_exp >= 1186`, `X_exp <= 715`):
    w_sh_nw = G.sstep(-3.5, 3.5, sd_shumar)
    w_sh_wide = G.sstep(-28.0, 10.0, sd_shumar)
    u_wide_blend = np.maximum(
        G.sstep(0.22, 0.52, u_se_sh),
        G.sstep(1184.0, 1196.0, Y_exp) * (1.0 - G.sstep(695.0, 720.0, X_exp)),
    )
    w_tallhouse_guard = G.sstep(2.0, 4.2, np.hypot(X_exp - 683.0, Y_exp - 1184.0))
    w_shumar_env = (
        (w_sh_nw * (1.0 - u_wide_blend) + w_sh_wide * u_wide_blend)
        * w_tallhouse_guard
        * (1.0 - G.sstep(-2.0, 5.0, sd_gval))
        * (~whas_exp).astype(float)
    )

    y0_sh, y1_sh = 1080, 1260
    x0_sh, x1_sh = 650, 858
    E_sh_sub = En_exp[y0_sh:y1_sh, x0_sh:x1_sh].copy()
    E_sh_s2 = nd.gaussian_filter(E_sh_sub, sigma=2.2)
    E_sh_s7 = nd.gaussian_filter(E_sh_sub, sigma=7.0)
    E_sh_s14 = nd.gaussian_filter(E_sh_sub, sigma=14.0)
    dE_sh_med = np.clip(E_sh_s7 - E_sh_s14, -180.0, 200.0)
    dE_sh_hp = np.clip(E_sh_s2 - E_sh_s7, -120.0, 140.0)
    fbm1_sh = meta_nw['fbm1'][y0_sh:y1_sh, x0_sh:x1_sh]
    fbm2_sh = meta_nw['fbm2'][y0_sh:y1_sh, x0_sh:x1_sh]
    u_se_sub = u_se_sh[y0_sh:y1_sh, x0_sh:x1_sh]
    sd_sh_sub = sd_shumar[y0_sh:y1_sh, x0_sh:x1_sh]
    sd_gv_sub = sd_gval[y0_sh:y1_sh, x0_sh:x1_sh]
    X_sh_sub = X_exp[y0_sh:y1_sh, x0_sh:x1_sh]
    Y_sh_sub = Y_exp[y0_sh:y1_sh, x0_sh:x1_sh]

    # Smooth SE subarctic/boreal ramp toward Godthrone (`+2,790 m` at NW rim -> `+3,450 m` mid-plateau -> `+4,320 m` at SE Godthrone border):
    u_se_high = G.sstep(0.58, 1.0, u_se_sub)
    h_sh_base = 2790.0 + 680.0 * (u_se_sub ** 1.10) + 840.0 * (u_se_high ** 1.65)
    # Smooth SW saddle ramp down toward Greenstep (`X < 704, Y > 1185`) so there is zero ridge bump between Greenstep and Shumar:
    w_sw_saddle = (
        G.sstep(-24.0, 2.0, sd_gv_sub)
        * (1.0 - G.sstep(682.0, 706.0, X_sh_sub))
        * G.sstep(1184.0, 1196.0, Y_sh_sub)
    )
    h_sh_base = h_sh_base * (1.0 - w_sw_saddle) + (2150.0 + 520.0 * G.sstep(-16.0, 6.0, sd_sh_sub)) * w_sw_saddle
    h_shumar_cord = np.clip(
        h_sh_base + 0.22 * dE_sh_med + 0.24 * dE_sh_hp + 52.0 * fbm1_sh + 36.0 * fbm2_sh,
        2100.0,
        4420.0,
    )
    # Also gently smooth the outer Godthrone piedmont belt (`sd_sh_sub` in `[-28, +8]` on the SE side) so the slope into Godthrone is continuous:
    w_se_outer_smooth = (
        G.sstep(-28.0, -4.0, sd_sh_sub)
        * (1.0 - G.sstep(2.0, 12.0, sd_sh_sub))
        * G.sstep(0.45, 0.80, u_se_sub)
    )
    E_sh_bg = E_sh_sub * (1.0 - 0.58 * w_se_outer_smooth) + E_sh_s14 * (0.58 * w_se_outer_smooth)
    w_sh_sub = w_shumar_env[y0_sh:y1_sh, x0_sh:x1_sh]
    En_exp[y0_sh:y1_sh, x0_sh:x1_sh] = E_sh_bg * (1.0 - w_sh_sub) + h_shumar_cord * w_sh_sub
    w_shumar_all = np.clip(
        np.maximum(w_shumar_env, 0.85 * nd.gaussian_filter(mask_shumar.astype(float), sigma=2.5)) * w_tallhouse_guard,
        0.0,
        1.0,
    )

    # 9. `Labyrinth` (`rmw8bqrn3dnx4`, X=90..393, Y=1349..1640) & Regional SW Glaciated Dome:
    #    - Keep the outer Western (`X = 0..76`) and Southern (`Y = 1654..1723`) canvas edges as an unbroken,
    #      natural airless mountain barrier (`> 8,900..12,200 m`, Class `O`).
    #    - Grade inward from the airless map-edge barrier into a broad `4,850..6,350 m` (`EF / ET`) glaciated
    #      ice-cap dome spanning `Labyrinth` and its surrounding `45 px` margin so uncollapsed horst mesas
    #      match the surrounding plateau height with zero polygon step.
    #    - Carve a West-to-East Martian tectonic collapse progression inside `Labyrinth`:
    #      (a) W/SW Beaded Pit-Crater Chains (*Catenae*, `+2,650..+3,650 m`),
    #      (b) Central 3-Trend Intersecting *Noctis Labyrinthus* Fault Grabens (`+1,550..+2,950 m` floors between
    #          `4,950..6,150 m` diamond/polyhedral snow-capped horst bastions),
    #      (c) E/NE Martian *Chaos Terrain* (`X = 245..388, Y = 1352..1595`: `22` tilted flat-topped horst mesas
    #          and `16` knobby pyramids rising from a `+1,350..+2,150 m` anastomosing outflow amphitheatre
    #          breaching northeast into `The Rift` below `Wildcat` and north into `copper glacier`).
    lab_pts = [
        [322, 1412], [293, 1349], [184, 1358], [113, 1402], [90, 1484],
        [136, 1580], [187, 1616], [252, 1640], [310, 1637], [354, 1607],
        [383, 1569], [393, 1513], [345, 1463],
    ]
    mask_lab = G.poly(lab_pts, 1.0, 1.0, (NEW_OH, NEW_OW)) > 0.5
    d_in_lab = nd.distance_transform_edt(mask_lab)
    d_out_lab = nd.distance_transform_edt(~mask_lab)
    sd_lab = (d_in_lab - d_out_lab) + 4.2 * meta_nw['fbm1'] + 2.8 * meta_nw['fbm2']

    y0_lb, y1_lb = 1280, 1723
    x0_lb, x1_lb = 0, 468
    E_lb_sub = En_exp[y0_lb:y1_lb, x0_lb:x1_lb].copy()
    E_lb_s2 = nd.gaussian_filter(E_lb_sub, sigma=2.2)
    E_lb_s7 = nd.gaussian_filter(E_lb_sub, sigma=7.0)
    E_lb_s16 = nd.gaussian_filter(E_lb_sub, sigma=16.0)
    dE_lb_med = np.clip(E_lb_s7 - E_lb_s16, -420.0, 480.0)
    dE_lb_hp = np.clip(E_lb_s2 - E_lb_s7, -260.0, 310.0)
    fbm1_lb = meta_nw['fbm1'][y0_lb:y1_lb, x0_lb:x1_lb]
    fbm2_lb = meta_nw['fbm2'][y0_lb:y1_lb, x0_lb:x1_lb]
    px_lb = X_exp[y0_lb:y1_lb, x0_lb:x1_lb]
    py_lb = Y_exp[y0_lb:y1_lb, x0_lb:x1_lb]
    sd_lb_sub = sd_lab[y0_lb:y1_lb, x0_lb:x1_lb]
    px_lb_w = px_lb + 3.6 * fbm1_lb + 2.0 * fbm2_lb
    py_lb_w = py_lb + 3.6 * fbm2_lb - 1.8 * fbm1_lb

    # 9A. Outer W (`X = 0..76`) & S (`Y = 1654..1723`) Map-Edge Airless Barrier (`> 9,000..12,200 m`, Class `O`):
    d_w_map_edge = px_lb + 9.5 * fbm1_lb + 5.5 * fbm2_lb
    d_s_map_edge = (1722.0 - py_lb) + 9.5 * fbm2_lb + 5.5 * fbm1_lb
    # Smooth minimum distance to the W or S canvas edge:
    d_ws_edge = -18.0 * np.log(np.exp(-d_w_map_edge / 18.0) + np.exp(-d_s_map_edge / 18.0))
    w_map_edge_airless = 1.0 - G.sstep(34.0, 74.0, d_ws_edge)
    h_map_edge_barrier = np.maximum(
        E_lb_sub,
        9250.0 + 2150.0 * (1.0 - G.sstep(0.0, 46.0, d_ws_edge)) + 0.55 * dE_lb_med + 0.65 * dE_lb_hp + 280.0 * fbm1_lb,
    )

    # 9B. Broad SW Glaciated Dome (`4,850..6,350 m`, `EF / ET`) spanning `Labyrinth` and its `48 px` outer collar:
    # Slopes naturally down from `+6,250 m` along the SW/S side toward `+4,850 m` on the NE Rift & N Copper Glacier margins:
    u_lb_we = np.clip((px_lb - 95.0) / 295.0 + 0.22 * (1580.0 - py_lb) / 240.0, 0.0, 1.0)
    h_lb_dome = (
        6180.0
        - 1260.0 * (u_lb_we ** 1.15)
        + 0.36 * dE_lb_med
        + 0.42 * dE_lb_hp
        + 165.0 * fbm1_lb
        + 110.0 * fbm2_lb
    )
    # Clear the two stale perched high-altitude lakes at Copper Glacier (`X = 312..344, Y = 1232..1288`, `wlev0 = 5,568..5,935 m`)
    # where the SW Crook-Rift Connector lowered the pass floor under `whas0_1393`, and clear the 2-px diagonal stepped tarn
    # artifact at `X = 406..423, Y = 1289..1306`, plus strip any cliff-bleed wet cells on Nulab Lake (`X = 420..455, Y = 1330..1360`):
    stale_cg_water = (
        ((X_exp >= 312.0) & (X_exp <= 344.0) & (Y_exp >= 1232.0) & (Y_exp <= 1288.0))
        | ((X_exp >= 406.0) & (X_exp <= 423.0) & (Y_exp >= 1289.0) & (Y_exp <= 1306.0))
    )
    whas_exp[stale_cg_water] = False
    wlev_exp[stale_cg_water] = np.nan
    # Smooth the bed of the cleared Copper Glacier water blocks (`X = 308..348, Y = 1228..1292`) into the pass floor:
    y0_cgb, y1_cgb, x0_cgb, x1_cgb = 1226, 1294, 306, 350
    En_cgb_sm = nd.gaussian_filter(En_exp[y0_cgb:y1_cgb, x0_cgb:x1_cgb], sigma=3.2)
    w_cgb_fix = np.maximum(
        1.0 - G.sstep(5.0, 12.0, np.hypot(X_exp[y0_cgb:y1_cgb, x0_cgb:x1_cgb] - 322.5, Y_exp[y0_cgb:y1_cgb, x0_cgb:x1_cgb] - 1240.5)),
        1.0 - G.sstep(5.0, 13.0, np.hypot(X_exp[y0_cgb:y1_cgb, x0_cgb:x1_cgb] - 335.5, Y_exp[y0_cgb:y1_cgb, x0_cgb:x1_cgb] - 1275.5)),
    ) * (~whas_exp[y0_cgb:y1_cgb, x0_cgb:x1_cgb]).astype(float)
    En_exp[y0_cgb:y1_cgb, x0_cgb:x1_cgb] = (
        En_exp[y0_cgb:y1_cgb, x0_cgb:x1_cgb] * (1.0 - 0.88 * w_cgb_fix) + En_cgb_sm * (0.88 * w_cgb_fix)
    )
    # Clean Nulab Lake (`X = 420..455, Y = 1330..1360`, flat `wlev = 297.4 m`):
    in_nulab_box = (X_exp >= 420.0) & (X_exp <= 455.0) & (Y_exp >= 1330.0) & (Y_exp <= 1360.0)
    nulab_bleed = in_nulab_box & whas_exp & ((En_exp > 304.0) | (np.nan_to_num(wlev_exp, nan=9999.0) > 305.0))
    whas_exp[nulab_bleed] = False
    wlev_exp[nulab_bleed] = np.nan
    in_nulab_clean = in_nulab_box & whas_exp
    wlev_exp[in_nulab_clean] = 297.4
    En_exp = np.where(in_nulab_clean, np.minimum(En_exp, 288.0), En_exp)

    # Regional dome envelope (`sd_lb_sub >= -52 px`), tapering smoothly into the W/S map-edge barrier and protecting Wildcat `(427, 1453)`
    # and the Kual Warra (`r020`) valley bench (`X = 386..446, Y = 1426..1460`) so no backward-facing cliff scarp forms behind `r020`:
    d_wildcat_bench = np.minimum(
        np.hypot(px_lb - 427.0, py_lb - 1453.0),
        np.hypot(np.maximum(0.0, 392.0 - px_lb) + np.maximum(0.0, px_lb - 442.0), np.maximum(0.0, 1430.0 - py_lb) + np.maximum(0.0, py_lb - 1456.0)),
    )
    w_wildcat_guard = G.sstep(8.0, 22.0, d_wildcat_bench)
    w_lb_dome_env = (
        G.sstep(-52.0, -4.0, sd_lb_sub)
        * (1.0 - w_map_edge_airless)
        * w_wildcat_guard
        * (~whas_exp[y0_lb:y1_lb, x0_lb:x1_lb]).astype(float)
    )
    h_lb_regional = (
        E_lb_sub * (1.0 - w_lb_dome_env) + h_lb_dome * w_lb_dome_env
    )
    h_lb_regional = h_lb_regional * (1.0 - w_map_edge_airless) + h_map_edge_barrier * w_map_edge_airless

    # 9C. Inside `Labyrinth` (`sd_lb_sub >= -6.0`): Carve the West-to-East *Catenae -> Intersecting Grabens -> E/N Chaos Terrain* Network!
    w_in_lab = G.sstep(-5.5, 4.5, sd_lb_sub) * (1.0 - w_map_edge_airless) * w_wildcat_guard

    # Zone 1: W/SW Beaded Pit-Crater Chains (*Catenae*, `16` scalloped collapse pits along propagating dike trends):
    lab_catena_pits = [
        # (cx, cy, rx, ry, ang_deg, floor_m)
        (114.0, 1468.0, 6.2, 4.4, -32.0, 3520.0),
        (126.0, 1446.0, 6.8, 4.6, -30.0, 3380.0),
        (140.0, 1424.0, 7.2, 4.8, -28.0, 3220.0),
        (156.0, 1402.0, 7.5, 5.0, -26.0, 3060.0),
        (124.0, 1512.0, 6.4, 4.5,  38.0, 3560.0),
        (138.0, 1532.0, 7.0, 4.8,  40.0, 3410.0),
        (154.0, 1554.0, 7.4, 5.0,  42.0, 3260.0),
        (172.0, 1576.0, 7.8, 5.2,  44.0, 3120.0),
        (192.0, 1596.0, 8.0, 5.2,  35.0, 2980.0),
        (216.0, 1612.0, 7.6, 5.0,  22.0, 2920.0),
        (244.0, 1620.0, 7.4, 4.8,  10.0, 2860.0),
        (274.0, 1618.0, 7.2, 4.8, -12.0, 2780.0),
        (148.0, 1482.0, 7.5, 5.2, -34.0, 3080.0),
        (166.0, 1458.0, 8.0, 5.4, -32.0, 2890.0),
        (164.0, 1516.0, 7.8, 5.2,  36.0, 2940.0),
        (184.0, 1542.0, 8.2, 5.4,  38.0, 2790.0),
    ]
    w_catena = np.zeros_like(E_lb_sub)
    h_catena_fl = h_lb_regional.copy()
    for cx_p, cy_p, rx_p, ry_p, ang_p, fl_p in lab_catena_pits:
        th_p = math.radians(ang_p)
        dx_p = px_lb_w - cx_p
        dy_p = py_lb_w - cy_p
        up_x = dx_p * math.cos(th_p) + dy_p * math.sin(th_p)
        up_y = -dx_p * math.sin(th_p) + dy_p * math.cos(th_p)
        r_p = np.hypot(up_x / rx_p, up_y / ry_p)
        w_p = 1.0 - G.sstep(0.52, 1.15, r_p)
        prof_p = fl_p + 340.0 * (G.sstep(0.0, 1.0, r_p) ** 1.8) + 35.0 * fbm2_lb
        better_p = w_p > w_catena
        w_catena = np.maximum(w_catena, w_p)
        h_catena_fl = np.where(better_p, prof_p, h_catena_fl)

    # Zone 2: Central 3-Trend Intersecting *Noctis Labyrinthus* Fault-Graben Network (`X = 145..345, Y = 1365..1615`):
    # Three conjugate fault-graben families slicing the glaciated plateau into sharp diamond & hexagonal horst bastions:
    lab_graben_segs = [
        # Trend A (WSW -> ENE radial dike grabens, `(x0, y0, x1, y1, fl0, fl1, hw_px)`):
        (146.0, 1438.0, 298.0, 1372.0, 2750.0, 1950.0, 5.2),
        (138.0, 1488.0, 336.0, 1412.0, 2680.0, 1680.0, 5.8),
        (158.0, 1542.0, 368.0, 1458.0, 2580.0, 1450.0, 6.2),
        (186.0, 1592.0, 376.0, 1512.0, 2520.0, 1480.0, 5.8),
        (232.0, 1622.0, 362.0, 1564.0, 2580.0, 1650.0, 5.2),
        # Trend B (NW -> SE conjugate extensional grabens):
        (178.0, 1372.0, 332.0, 1548.0, 2580.0, 1620.0, 5.4),
        (148.0, 1412.0, 304.0, 1592.0, 2650.0, 1820.0, 5.6),
        (222.0, 1364.0, 368.0, 1518.0, 2320.0, 1460.0, 5.8),
        (132.0, 1466.0, 264.0, 1614.0, 2780.0, 2180.0, 5.0),
        # Trend C (NNE -> SSW rift-parallel cross-grabens & Copper Glacier connector):
        (244.0, 1344.0, 206.0, 1588.0, 2380.0, 2150.0, 5.5),
        (286.0, 1362.0, 254.0, 1612.0, 2080.0, 1880.0, 5.8),
        (332.0, 1404.0, 306.0, 1604.0, 1720.0, 1680.0, 6.0),
    ]
    w_graben_sum = np.zeros_like(E_lb_sub)
    w_graben_max = np.zeros_like(E_lb_sub)
    fl_graben_min = np.full_like(E_lb_sub, 6200.0)
    for gx0, gy0, gx1, gy1, gfl0, gfl1, ghw in lab_graben_segs:
        vx_g = gx1 - gx0
        vy_g = gy1 - gy0
        len2_g = vx_g * vx_g + vy_g * vy_g + 1e-9
        t_seg = np.clip(((px_lb_w - gx0) * vx_g + (py_lb_w - gy0) * vy_g) / len2_g, 0.0, 1.0)
        d_seg = np.hypot(px_lb_w - (gx0 + t_seg * vx_g), py_lb_w - (gy0 + t_seg * vy_g))
        # Modulate graben width slightly with FBM so fault scarps have natural scalloped alcoves:
        hw_eff = ghw * (1.0 + 0.18 * fbm1_lb)
        u_seg = d_seg / np.maximum(hw_eff, 1.0)
        # Flat-floored graben profile (`u_seg <= 0.65` flat floor, `0.65..1.25` steep 60-deg fault scarp wall):
        w_seg = 1.0 - G.sstep(0.58, 1.22, u_seg)
        fl_seg = gfl0 + t_seg * (gfl1 - gfl0) + 180.0 * G.sstep(0.45, 1.15, u_seg) + 28.0 * fbm2_lb
        w_graben_sum += w_seg
        w_graben_max = np.maximum(w_graben_max, w_seg)
        fl_graben_min = np.where(w_seg > 0.08, np.minimum(fl_graben_min, fl_seg), fl_graben_min)

    # At multi-graben fault junctions (`w_graben_sum >= 1.15`), deepen the collapsed polyhedral junction cauldrons by 180..320 m:
    w_junction = G.sstep(1.05, 1.75, w_graben_sum)
    h_graben_floor = nd.gaussian_filter(fl_graben_min, sigma=1.1) - 240.0 * w_junction + 32.0 * fbm2_lb
    w_graben_trough = np.clip(w_graben_max + 0.35 * w_junction, 0.0, 1.0)

    # Zone 3: E / NE Martian *Chaos Terrain* (`X = 238..392, Y = 1348..1598`) & Dual Outflow Portals!
    # A wide collapsed outflow amphitheatre (`+1,350..+2,180 m` floor) packed with 22 isolated, tilted flat-topped
    # polyhedral horst mesas (`+3,850..+5,150 m` caps) and 14 knobby pyramid remnants (`+2,450..+3,350 m`),
    # breaching NE into `The Rift` (`X = 345..412, Y = 1445..1535`, below Wildcat) and N into `copper glacier` (`X = 225..278, Y = 1340..1378`):
    r_chaos_e = np.hypot((px_lb_w - 316.0) / 68.0, (py_lb_w - 1488.0) / 86.0)
    r_chaos_n = np.hypot((px_lb_w - 256.0) / 46.0, (py_lb_w - 1392.0) / 48.0)
    w_chaos_amph = np.maximum(1.0 - G.sstep(0.62, 1.12, r_chaos_e), 1.0 - G.sstep(0.58, 1.10, r_chaos_n)) * w_in_lab

    # Dual Outflow Breach Channels:
    # (1) Eastern Opening Gorge into `The Rift` (`(322, 1476) -> (442, 1468)`, grading monotonically from `+1,410 m`
    #     in the Chaos Amphitheatre through the single Eastern Opening below Wildcat down into the Great Chasm):
    t_rift_br = np.clip((px_lb_w - 322.0) / 118.0, 0.0, 1.0)
    y_rift_br = 1476.0 - 11.0 * G.sstep(0.15, 0.85, t_rift_br) + 4.5 * np.sin(t_rift_br * 2.0 * math.pi)
    d_rift_br = np.abs(py_lb_w - y_rift_br) / (20.0 - 5.0 * t_rift_br)
    w_rift_breach = (
        (1.0 - G.sstep(0.42, 1.22, d_rift_br))
        * G.sstep(312.0, 336.0, px_lb_w)
        * (1.0 - G.sstep(432.0, 446.0, px_lb_w))
        * w_wildcat_guard
    )
    # (2) Northern Copper Glacier Chaos Breach (`(252, 1395) -> (242, 1338)`, `+2,150 m -> +2,580 m` connecting into `copper glacier`):
    t_cop_br = np.clip((1396.0 - py_lb_w) / 62.0, 0.0, 1.0)
    x_cop_br = 252.0 - 10.0 * t_cop_br + 3.5 * np.sin(t_cop_br * math.pi)
    d_cop_br = np.abs(px_lb_w - x_cop_br) / (14.0 + 6.0 * t_cop_br)
    w_cop_breach = (
        (1.0 - G.sstep(0.45, 1.25, d_cop_br))
        * G.sstep(1332.0, 1348.0, py_lb_w)
        * (1.0 - G.sstep(1392.0, 1412.0, py_lb_w))
    )
    w_chaos_total = np.clip(np.maximum(w_chaos_amph, np.maximum(w_rift_breach, w_cop_breach)), 0.0, 1.0)

    # Continuous collapsed Chaos Amphitheatre floor (`+2,150 m` in W/N grading down to `+1,320 m` in E chaos and `+680 m` through the Eastern Opening):
    h_chaos_floor = (
        2180.0
        - 820.0 * np.clip((px_lb - 245.0) / 135.0, 0.0, 1.0)
        + 260.0 * np.clip((1410.0 - py_lb) / 70.0, 0.0, 1.0)
        + 65.0 * np.sin(px_lb_w * 0.24 + py_lb_w * 0.18)
        + 48.0 * fbm2_lb
    )
    h_chaos_floor = h_chaos_floor * (1.0 - 0.84 * w_rift_breach) + (1420.0 - 780.0 * (t_rift_br ** 1.15) + 42.0 * fbm2_lb) * (0.84 * w_rift_breach)

    # 22 Tilted Flat-Topped Polyhedral Chaos Mesas & 14 Knobby Pyramids inside the E/NE Chaos Amphitheatre:
    lab_chaos_blocks = [
        # (bx, by, rx, ry, ang_deg, cap_m, is_mesa)
        # Northern Chaos sector (near Copper Glacier border, Y = 1358..1425):
        (238.0, 1368.0, 6.5, 4.6, -24.0, 4680.0, True),
        (268.0, 1366.0, 7.0, 4.8,  18.0, 4520.0, True),
        (254.0, 1388.0, 6.2, 4.4,  32.0, 4420.0, True),
        (284.0, 1386.0, 6.8, 4.6, -16.0, 4360.0, True),
        (232.0, 1396.0, 7.2, 5.0,  14.0, 4780.0, True),
        (268.0, 1412.0, 7.5, 5.2, -28.0, 4480.0, True),
        (298.0, 1404.0, 6.6, 4.6,  22.0, 4220.0, True),
        # East-Central Chaos sector (X = 255..378, Y = 1430..1535):
        (258.0, 1442.0, 8.2, 5.6, -34.0, 4820.0, True),
        (288.0, 1438.0, 7.6, 5.2,  26.0, 4540.0, True),
        (318.0, 1436.0, 7.0, 4.8, -18.0, 4280.0, True),
        (342.0, 1430.0, 6.0, 4.0,  30.0, 3960.0, True),
        (272.0, 1464.0, 7.8, 5.2,  16.0, 4660.0, True),
        (304.0, 1456.0, 6.8, 4.5, -26.0, 4380.0, True),
        (334.0, 1452.0, 6.0, 4.0,  20.0, 4080.0, True),
        (362.0, 1454.0, 5.6, 3.8, -14.0, 3780.0, True),
        (264.0, 1502.0, 8.2, 5.6, -22.0, 4740.0, True),
        (296.0, 1500.0, 7.4, 5.0,  28.0, 4420.0, True),
        (326.0, 1498.0, 6.8, 4.6, -32.0, 4140.0, True),
        (356.0, 1502.0, 6.4, 4.4,  18.0, 3860.0, True),
        # SE Chaos sector (X = 270..368, Y = 1525..1588):
        (282.0, 1532.0, 8.2, 5.6,  24.0, 4620.0, True),
        (314.0, 1534.0, 7.6, 5.2, -20.0, 4320.0, True),
        (344.0, 1532.0, 6.8, 4.6,  34.0, 4020.0, True),
        (298.0, 1558.0, 7.8, 5.4, -28.0, 4480.0, True),
        (332.0, 1560.0, 6.8, 4.8,  16.0, 4160.0, True),
        # Smaller Knobby Chaos Pyramids (`is_mesa=False`) scattered in the outflow channels:
        (252.0, 1356.0, 3.8, 2.8,  12.0, 3280.0, False),
        (282.0, 1372.0, 3.6, 2.6, -20.0, 3150.0, False),
        (312.0, 1422.0, 4.0, 2.8,  25.0, 3080.0, False),
        (332.0, 1450.0, 3.6, 2.6, -15.0, 2940.0, False),
        (352.0, 1456.0, 3.5, 2.5,  30.0, 2780.0, False),
        (376.0, 1490.0, 3.8, 2.6, -12.0, 2560.0, False),
        (344.0, 1488.0, 3.6, 2.6,  18.0, 2820.0, False),
        (312.0, 1486.0, 3.6, 2.6, -24.0, 3040.0, False),
        (368.0, 1518.0, 4.0, 2.8,  22.0, 2720.0, False),
        (338.0, 1516.0, 3.8, 2.8, -18.0, 2920.0, False),
        (358.0, 1546.0, 4.0, 2.8,  28.0, 2840.0, False),
        (318.0, 1544.0, 3.8, 2.8, -16.0, 3060.0, False),
        (348.0, 1574.0, 3.8, 2.8,  14.0, 2960.0, False),
        (314.0, 1582.0, 4.0, 2.8, -22.0, 3120.0, False),
    ]
    w_lab_chaos_blk = np.zeros_like(E_lb_sub)
    w_lab_chaos_mesa_top = np.zeros_like(E_lb_sub)
    h_lab_chaos_blk = h_chaos_floor.copy()
    for bx_l, by_l, rx_l, ry_l, ang_l, cap_l, is_m_l in lab_chaos_blocks:
        th_l = math.radians(ang_l)
        dx_l = px_lb_w - bx_l
        dy_l = py_lb_w - by_l
        ul_x = dx_l * math.cos(th_l) + dy_l * math.sin(th_l)
        ul_y = -dx_l * math.sin(th_l) + dy_l * math.cos(th_l)
        # Polyhedral L4/L2 norm for crisp angular fault-block facets:
        r_l = 0.60 * np.hypot(ul_x / rx_l, ul_y / ry_l) + 0.40 * (((ul_x / rx_l) ** 4 + (ul_y / ry_l) ** 4) ** 0.25)
        if is_m_l:
            w_b_l = 1.0 - G.sstep(0.58, 1.14, r_l)
            w_top_l = 1.0 - G.sstep(0.48, 0.82, r_l)
            tilt_l = 95.0 * (ul_x / rx_l) - 65.0 * (ul_y / ry_l) + 42.0 * fbm1_lb
        else:
            w_b_l = 1.0 - G.sstep(0.18, 1.08, r_l)
            w_top_l = np.zeros_like(r_l)
            tilt_l = -260.0 * G.sstep(0.0, 0.92, r_l) + 35.0 * fbm2_lb
        better_l = w_b_l > w_lab_chaos_blk
        w_lab_chaos_blk = np.maximum(w_lab_chaos_blk, w_b_l)
        w_lab_chaos_mesa_top = np.maximum(w_lab_chaos_mesa_top, w_top_l)
        h_lab_chaos_blk = np.where(better_l, cap_l + tilt_l, h_lab_chaos_blk)

    # Combine the 3 Labyrinth zones (`Catenae` + `3-Trend Grabens` + `E/NE Chaos Terrain`) into `h_lab_final`:
    h_lab_final = h_lb_regional.copy()
    # Apply W/SW catenae:
    w_cat_eff = w_in_lab * w_catena * (1.0 - 0.65 * w_chaos_total)
    h_lab_final = h_lab_final * (1.0 - w_cat_eff) + np.minimum(h_lab_final, h_catena_fl) * w_cat_eff
    # Apply Central 3-trend Noctis Labyrinthus fault grabens:
    w_grab_eff = w_in_lab * w_graben_trough * (1.0 - 0.70 * w_chaos_total)
    h_lab_final = h_lab_final * (1.0 - w_grab_eff) + np.minimum(h_lab_final, h_graben_floor) * w_grab_eff
    # Apply E/NE Martian Chaos Amphitheatre & tilted polyhedral horst mesas:
    h_chaos_combined = h_chaos_floor * (1.0 - w_lab_chaos_blk) + h_lab_chaos_blk * w_lab_chaos_blk
    h_lab_final = h_lab_final * (1.0 - w_chaos_total) + h_chaos_combined * w_chaos_total

    # 9D. Carve the Sinuous Labyrinth Meltwater River System (ALL converging into the SINGLE Eastern Opening via `r331` / *Gowd Warra*)
    #     and the 8 Canyon/Graben-Ribbon/Chaos-Moat Lakes (`WH`):
    lab_trunk_331_up = [
        [179.0, 1566.0], [189.0, 1573.0], [200.0, 1569.0], [211.0, 1574.0], [222.0, 1566.0],
        [232.0, 1559.0], [241.0, 1557.0], [248.0, 1556.0], [256.0, 1554.0], [266.0, 1546.0],
        [277.0, 1549.0], [287.0, 1540.0], [295.0, 1529.0], [304.0, 1523.0], [312.0, 1518.0],
        [320.0, 1513.0], [330.0, 1508.0], [336.0, 1498.0], [345.0, 1492.0], [354.0, 1483.0],
        [364.0, 1477.0], [374.0, 1471.0], [383.0, 1474.0], [392.0, 1466.0],
    ]
    lab_trunk_331_els = [
        2810.0, 2640.0, 2470.0, 2310.0, 2160.0,
        2040.0, 1960.0, 1920.0, 1895.0, 1830.0,
        1770.0, 1710.0, 1655.0, 1615.0, 1580.0,
        1545.0, 1500.0, 1455.0, 1405.0, 1350.0,
        1290.0, 1230.0, 1170.0, 1110.0,
    ]
    lab_branch_central_pts = [
        [151.0, 1470.0], [161.0, 1476.0], [172.0, 1473.0], [183.0, 1481.0], [194.0, 1488.0],
        [205.0, 1483.0], [216.0, 1487.0], [226.0, 1482.0], [236.0, 1480.0], [244.0, 1482.0],
        [253.0, 1483.0], [263.0, 1487.0], [273.0, 1481.0], [283.0, 1475.0], [293.0, 1480.0],
        [303.0, 1474.0], [312.0, 1478.0], [321.0, 1475.0], [328.0, 1475.0], [337.0, 1475.0],
        [346.0, 1478.0], [355.0, 1475.0], [364.0, 1477.0],
    ]
    lab_branch_central_els = [
        2885.0, 2720.0, 2560.0, 2410.0, 2270.0,
        2150.0, 2040.0, 1940.0, 1865.0, 1820.0,
        1795.0, 1740.0, 1685.0, 1630.0, 1575.0,
        1525.0, 1480.0, 1445.0, 1420.0, 1395.0,
        1360.0, 1325.0, 1290.0,
    ]
    lab_branch_north_pts = [
        [182.0, 1404.0], [191.0, 1411.0], [201.0, 1408.0], [211.0, 1415.0], [221.0, 1422.0],
        [228.0, 1423.0], [234.0, 1424.0], [242.0, 1425.0], [252.0, 1421.0], [262.0, 1416.0],
        [273.0, 1420.0], [284.0, 1418.0], [291.0, 1422.0], [298.5, 1429.0], [295.0, 1437.5],
        [302.5, 1445.0], [311.5, 1451.0], [309.0, 1459.5], [316.5, 1466.5], [324.0, 1473.0],
        [328.0, 1475.0],
    ]
    lab_branch_north_els = [
        2480.0, 2380.0, 2285.0, 2195.0, 2110.0,
        2040.0, 1980.0, 1950.0, 1900.0, 1845.0,
        1785.0, 1720.0, 1685.0, 1645.0, 1605.0,
        1565.0, 1530.0, 1495.0, 1465.0, 1435.0,
        1420.0,
    ]
    lab_cat_nw_pts = [[118.0, 1452.0], [123.5, 1456.5], [129.0, 1454.5], [134.5, 1459.0], [139.5, 1464.5], [145.5, 1467.0]]
    lab_cat_nw_els = [3420.0, 3310.0, 3210.0, 3110.0, 3010.0, 2922.0]
    lab_cat_sw_pts = [[142.0, 1548.0], [148.0, 1553.5], [154.5, 1551.5], [160.5, 1557.0], [166.5, 1562.5], [173.5, 1563.5]]
    lab_cat_sw_els = [3320.0, 3220.0, 3120.0, 3025.0, 2930.0, 2842.0]

    # Extend the Eastern Opening gorge swale along `r331`'s lower canyon reach (`(392, 1466) -> (440.2, 1467.6)`),
    # and carve a dedicated recessed valley trough north of Wildcat `(427, 1453)` for `r020` (*Kual Warra*) so
    # `Kual Warra` flows down a valley floor (`Y = 1433..1449` at `X = 390..438`) rather than perched on a cliff edge:
    lab_east_portal_pts = [
        [392.0, 1466.0], [400.2, 1466.5], [408.2, 1466.2], [416.2, 1466.8],
        [424.2, 1466.2], [432.2, 1466.0], [440.2, 1467.6],
    ]
    lab_east_portal_els = [1110.0, 1050.0, 980.0, 910.0, 820.0, 680.0, 420.0]

    kual_warra_pts = [
        [390.2, 1433.6], [398.5, 1434.5], [407.0, 1435.5], [415.5, 1437.5],
        [423.5, 1440.5], [431.0, 1444.5], [437.5, 1449.5], [442.0, 1456.5],
        [445.2, 1465.5], [448.2, 1475.6],
    ]
    kual_warra_els = [4780.0, 4480.0, 4180.0, 3880.0, 3540.0, 3180.0, 2640.0, 1620.0, 220.0, -1380.0]

    lab_river_specs = [
        (lab_trunk_331_up + lab_east_portal_pts[1:], lab_trunk_331_els + lab_east_portal_els[1:], 6.2),
        (lab_branch_central_pts, lab_branch_central_els, 5.8),
        (lab_branch_north_pts, lab_branch_north_els, 5.6),
        (lab_cat_nw_pts, lab_cat_nw_els, 4.8),
        (lab_cat_sw_pts, lab_cat_sw_els, 4.8),
    ]
    d2_lb_riv = np.full_like(E_lb_sub, 1e12)
    fl_lb_riv = h_lab_final.copy()
    hw_lb_riv = np.full_like(E_lb_sub, 5.8)
    for r_pts_l, r_els_l, r_hw_l in lab_river_specs:
        for i_rl in range(len(r_pts_l) - 1):
            rx0_l, ry0_l = r_pts_l[i_rl]
            rx1_l, ry1_l = r_pts_l[i_rl + 1]
            re0_l, re1_l = r_els_l[i_rl], r_els_l[i_rl + 1]
            for s_rl in np.linspace(0.0, 1.0, 12):
                qx_l = rx0_l + s_rl * (rx1_l - rx0_l)
                qy_l = ry0_l + s_rl * (ry1_l - ry0_l)
                qe_l = re0_l + s_rl * (re1_l - re0_l)
                d2_q = (px_lb - qx_l) ** 2 + (py_lb - qy_l) ** 2
                better_q = d2_q < d2_lb_riv
                d2_lb_riv = np.where(better_q, d2_q, d2_lb_riv)
                fl_lb_riv = np.where(better_q, qe_l, fl_lb_riv)
                hw_lb_riv = np.where(better_q, r_hw_l, hw_lb_riv)
    u_lb_riv = np.sqrt(d2_lb_riv) / np.maximum(hw_lb_riv, 1.0)
    w_lb_riv_swale = ((1.0 - G.sstep(0.0, 1.10, u_lb_riv)) ** 1.45) * (1.0 - w_map_edge_airless) * w_wildcat_guard * (1.0 - 0.75 * w_lab_chaos_mesa_top)
    h_lb_riv_prof = fl_lb_riv + 195.0 * (G.sstep(0.0, 1.10, u_lb_riv) ** 1.45)
    h_lab_final = h_lab_final * (1.0 - 0.88 * w_lb_riv_swale) + np.minimum(h_lab_final, h_lb_riv_prof) * (0.88 * w_lb_riv_swale)

    # Carve the recessed Kual Warra (`r020`) valley trough north of Wildcat `(427, 1453)` while keeping Wildcat on its dry bench (`3,427 m`):
    d2_kw = np.full_like(E_lb_sub, 1e12)
    fl_kw = h_lab_final.copy()
    for i_kw in range(len(kual_warra_pts) - 1):
        kx0, ky0 = kual_warra_pts[i_kw]
        kx1, ky1 = kual_warra_pts[i_kw + 1]
        ke0, ke1 = kual_warra_els[i_kw], kual_warra_els[i_kw + 1]
        for s_kw in np.linspace(0.0, 1.0, 12):
            qx_k = kx0 + s_kw * (kx1 - kx0)
            qy_k = ky0 + s_kw * (ky1 - ky0)
            qe_k = ke0 + s_kw * (ke1 - ke0)
            d2_k = (px_lb - qx_k) ** 2 + (py_lb - qy_k) ** 2
            better_k = d2_k < d2_kw
            d2_kw = np.where(better_k, d2_k, d2_kw)
            fl_kw = np.where(better_k, qe_k, fl_kw)
    u_kw = np.sqrt(d2_kw) / 7.5
    w_wc_pin_guard = G.sstep(2.5, 6.5, np.hypot(px_lb - 427.0, py_lb - 1453.0))
    w_kw_swale = ((1.0 - G.sstep(0.0, 1.15, u_kw)) ** 1.40) * w_wc_pin_guard * (~whas_exp[y0_lb:y1_lb, x0_lb:x1_lb]).astype(float)
    h_kw_prof = fl_kw + 340.0 * (G.sstep(0.0, 1.15, u_kw) ** 1.45)
    h_lab_final = h_lab_final * (1.0 - 0.88 * w_kw_swale) + np.minimum(h_lab_final, h_kw_prof) * (0.88 * w_kw_swale)

    # 8 Canyon, Graben-Ribbon, & Chaos-Moat Lakes inside `Labyrinth` (`WH`), all aligned with the sinuous single-outlet drainage:
    lab_lake_specs = [
        # (lk_x, lk_y, rx, ry, ang_deg, wlev_m, bed_m)
        (148.0, 1468.0, 3.2, 2.2, -32.0, 2920.0, 2865.0),  # 1. NW Catena Tarn
        (176.0, 1564.0, 3.5, 2.4,  38.0, 2840.0, 2785.0),  # 2. SW Catena Tarn
        (234.0, 1424.0, 7.5, 2.6, -18.0, 1980.0, 1910.0),  # 3. North Graben Ribbon Lake
        (244.0, 1482.0, 8.5, 2.8,  32.0, 1820.0, 1745.0),  # 4. Central Hub Ribbon Lake
        (248.0, 1556.0, 7.8, 2.6, -24.0, 1920.0, 1850.0),  # 5. South Graben Ribbon Lake
        (284.0, 1418.0, 5.8, 2.8, -14.0, 1720.0, 1650.0),  # 6. North Chaos Moat Lake
        (328.0, 1475.0, 8.6, 3.6,  12.0, 1420.0, 1345.0),  # 7. Great Chaos Moat Lake
        (312.0, 1518.0, 6.4, 2.8, -28.0, 1580.0, 1510.0),  # 8. South Chaos Trough Lake
    ]
    is_lab_lake = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    is_lab_lake_sub = np.zeros(E_lb_sub.shape, dtype=bool)
    for lk_x, lk_y, rx_lk, ry_lk, ang_lk, wl_lk, bed_lk in lab_lake_specs:
        th_lk = math.radians(ang_lk)
        dx_lk = px_lb - lk_x + 0.55 * fbm1_lb
        dy_lk = py_lb - lk_y + 0.55 * fbm2_lb
        ulx = dx_lk * math.cos(th_lk) + dy_lk * math.sin(th_lk)
        uly = -dx_lk * math.sin(th_lk) + dy_lk * math.cos(th_lk)
        r_lk = np.hypot(ulx / rx_lk, uly / ry_lk)
        w_lk_basin = (1.0 - G.sstep(0.95, 2.15, r_lk)) * (~is_lab_lake_sub).astype(float)
        h_lk_shore = wl_lk + 14.0 + 190.0 * G.sstep(0.95, 2.15, r_lk)
        h_lab_final = h_lab_final * (1.0 - w_lk_basin) + np.minimum(h_lab_final, h_lk_shore) * w_lk_basin
        in_lk_sub = r_lk <= 1.0
        is_lab_lake_sub |= in_lk_sub
        h_lab_final = np.where(in_lk_sub, bed_lk + (wl_lk - bed_lk - 6.0) * (r_lk ** 1.6), h_lab_final)
        whas_exp[y0_lb:y1_lb, x0_lb:x1_lb][in_lk_sub] = True
        wlev_exp[y0_lb:y1_lb, x0_lb:x1_lb][in_lk_sub] = wl_lk
    is_lab_lake[y0_lb:y1_lb, x0_lb:x1_lb] = is_lab_lake_sub

    # Re-enforce the outer W/S map-edge airless barrier (`> 9,000 m`):
    h_lab_final = h_lab_final * (1.0 - w_map_edge_airless) + h_map_edge_barrier * w_map_edge_airless

    En_exp[y0_lb:y1_lb, x0_lb:x1_lb] = h_lab_final

    w_lab_dome_full = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_lab_trough_full = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_lab_wall_full = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_lab_edge_barrier_full = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_lab_dome_full[y0_lb:y1_lb, x0_lb:x1_lb] = np.clip(np.maximum(w_lb_dome_env, w_chaos_total), 0.0, 1.0)
    w_trough_sub = np.clip(
        np.maximum(w_cat_eff, np.maximum(w_grab_eff, np.maximum(w_lb_riv_swale, w_chaos_total * (1.0 - 0.88 * w_lab_chaos_mesa_top)))),
        0.0,
        1.0,
    )
    w_lab_trough_full[y0_lb:y1_lb, x0_lb:x1_lb] = w_trough_sub
    gy_lb, gx_lb = np.gradient(h_lab_final, 2.0)
    slope_lb = np.hypot(gx_lb, gy_lb)
    w_lab_wall_full[y0_lb:y1_lb, x0_lb:x1_lb] = (
        np.clip(w_in_lab + 0.5 * w_chaos_total, 0.0, 1.0)
        * G.sstep(180.0, 520.0, slope_lb)
        * (1.0 - G.sstep(5150.0, 5650.0, h_lab_final))
        * (~is_lab_lake_sub).astype(float)
    )
    w_lab_edge_barrier_full[y0_lb:y1_lb, x0_lb:x1_lb] = w_map_edge_airless
    w_lab_all = np.clip(np.maximum(w_lab_dome_full, 0.90 * nd.gaussian_filter(mask_lab.astype(float), sigma=3.0)), 0.0, 1.0)

    # Route ALL Labyrinth drainage out through the single Eastern Opening via `r331` (*Gowd Warra*), keeping `r295` and upper `r020`
    # on the outer NE mountain range so zero rivers cut across the NE mountain barrier:
    lab_paint_rivers = []
    for r in rivers_exp:
        rid_lb = str(r.get('id'))
        if rid_lb in ('331', 'r331'):
            old_331 = r.get('px') or []
            if old_331:
                old_331[0] = [400.2, 1466.5]
            r['px'] = copy.deepcopy(lab_trunk_331_up) + old_331
            r['q_mouth'] = max(float(r.get('q_mouth') or 260.0), 820.0)
            n_r = len(r['px'])
            r['q_m3s'] = [round(32.0 + (r['q_mouth'] - 32.0) * (i / float(max(1, n_r - 1))), 1) for i in range(n_r)]
            lab_paint_rivers.append(r['px'][:len(lab_trunk_331_up) + 2])
        elif rid_lb in ('20', 'r020'):
            # Route Kual Warra (`r020`) down its recessed valley floor north of Wildcat `(427, 1453)`:
            old_020 = [p for p in (r.get('px') or []) if p[0] > 448.2]
            r['px'] = copy.deepcopy(kual_warra_pts) + old_020
            n_020 = len(r['px'])
            q_020 = float(r.get('q_mouth') or 480.0)
            r['q_m3s'] = [round(25.0 + (q_020 - 25.0) * (i / float(max(1, n_020 - 1))), 1) for i in range(n_020)]
        elif rid_lb in ('333', 'r333'):
            r['px'] = [[400.2, 1427.6], [408.0, 1431.5], [415.5, 1437.5]]
            r['q_m3s'] = [18.0, 26.0, 35.0]
        elif rid_lb in ('332', 'r332'):
            r['px'] = [[438.2, 1443.6], [440.0, 1450.0], [442.0, 1456.5]]
            r['q_m3s'] = [16.0, 22.0, 28.0]

    for new_lb_id, new_lb_pts, new_lb_q, new_lb_ord in [
        ('r_lab_cat_nw', lab_cat_nw_pts, 85.0, 2),
        ('r_lab_cat_sw', lab_cat_sw_pts, 95.0, 2),
        ('r_lab_chaos_n', lab_branch_north_pts, 280.0, 3),
        ('r_lab_chaos_s', lab_branch_central_pts, 340.0, 3),
    ]:
        rivers_exp.append({
            'id': new_lb_id,
            'kind': 'perennial',
            'order': new_lb_ord,
            'tongue': 'tungang',
            'px': copy.deepcopy(new_lb_pts),
            'q_mouth': new_lb_q,
            'q_m3s': [round(22.0 + (new_lb_q - 22.0) * (i / float(len(new_lb_pts) - 1)), 1) for i in range(len(new_lb_pts))],
            'length_km': round(sum(math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 2.0 for p1, p2 in zip(new_lb_pts, new_lb_pts[1:])), 1),
        })
        lab_paint_rivers.append(new_lb_pts)
    del (
        E_greenstep_mare, E_gv_base, E_gv_clean, E_gv_mid, E_gv_sub, E_lb_s16, E_lb_s2, E_lb_s7, E_lb_sub,
        E_ov_base, E_ov_clean, E_ov_mid, E_ov_sub, E_sh_bg, E_sh_s14, E_sh_s2, E_sh_s7, E_sh_sub, En_cgb_sm,
        d_cop_br, d_in_gv, d_in_lab, d_in_ov, d_in_sh, d_out_gv, d_out_lab, d_out_ov, d_out_sh,
        d_rift_br, d_s_map_edge, d_w_map_edge, d_wildcat_bench, d_ws_edge,
        h_lb_dome, h_map_edge_barrier, h_oval_cord, in_nulab_box, in_nulab_clean, nulab_bleed, old_oval_perched,
        r_chaos_e, r_chaos_n, r_tallwalls, rid_lb, sd_lab, stale_cg_water, t_cop_br, t_rift_br,
        w_cgb_fix, w_chaos_amph, w_cop_breach, w_gval_env, w_in_lab, w_junction, w_lab_dome_full,
        w_oval_env, w_oval_north, w_rift_breach, w_se_outer_smooth, w_sh_nw, w_sh_wide, w_shumar_env,
        w_sw_saddle, w_tw_prom, w_wc_pin_guard, w_west_perched_fix, w_wildcat_guard,
    )
    gc.collect()

    # =========================================================================
    # 9E. `Firebliss Range` (`rmw8hj62nmugn`) Upwind Volcanic Range, 4 Sheltered
    #     Temperate Geothermal Valleys, & SE Ash/Vapor Plume Into `Labyrinth`:
    #     - WNW-ESE Glaciovolcanic Arc (`+3,850..+5,350 m` cordillera spine) with
    #       5 active stratocones / calderas (`+5,360..+6,650 m`) along the upwind
    #       northern border of `Labyrinth`, while preserving the W map-edge airless
    #       barrier (`X < 62`, `> 8,800 m` Class `O`).
    #     - 4 Sheltered Temperate Geothermal Valleys (`Cfa` / `Cfb` / `Csb`,
    #       floors `+1,680..+2,180 m`) with warm crater-moat/ribbon tarns (`WH`)
    #       and sinuous geothermal outflow streams connecting SE into `Labyrinth`.
    #     - Persistent SE Volcanic Plume (`w_firebliss_plume`, azimuth `~135 deg`)
    #       blowing volcanic water vapor (`H2O`), sulfate (`SO4`) condensation
    #       nuclei, and dark basaltic-andesite ash southeastward into `Labyrinth`,
    #       enhancing precipitation (`+180..+360 mm/yr`) and glacier meltwater.
    # =========================================================================
    fb_pts = [
        [234, 1237], [305, 1263], [320, 1298], [318, 1328], [280, 1351], [187, 1352],
        [111, 1403], [79, 1356], [38, 1259], [92, 1237], [155, 1269], [211, 1256],
    ]
    mask_fb = G.poly(fb_pts, 1.0, 1.0, (NEW_OH, NEW_OW)) > 0.5
    d_in_fb = nd.distance_transform_edt(mask_fb)
    d_out_fb = nd.distance_transform_edt(~mask_fb)
    sd_fb = (d_in_fb - d_out_fb) + 3.8 * meta_nw['fbm1'] + 2.4 * meta_nw['fbm2']

    y0_fb, y1_fb = 1210, 1435
    x0_fb, x1_fb = 0, 360
    E_fb_sub = En_exp[y0_fb:y1_fb, x0_fb:x1_fb].copy()
    E_fb_s2 = nd.gaussian_filter(E_fb_sub, sigma=2.0)
    E_fb_s7 = nd.gaussian_filter(E_fb_sub, sigma=6.5)
    E_fb_s15 = nd.gaussian_filter(E_fb_sub, sigma=15.0)
    dE_fb_med = np.clip(E_fb_s7 - E_fb_s15, -380.0, 440.0)
    dE_fb_hp = np.clip(E_fb_s2 - E_fb_s7, -240.0, 290.0)
    fbm1_fb = meta_nw['fbm1'][y0_fb:y1_fb, x0_fb:x1_fb]
    fbm2_fb = meta_nw['fbm2'][y0_fb:y1_fb, x0_fb:x1_fb]
    px_fb = X_exp[y0_fb:y1_fb, x0_fb:x1_fb]
    py_fb = Y_exp[y0_fb:y1_fb, x0_fb:x1_fb]
    sd_fb_sub = sd_fb[y0_fb:y1_fb, x0_fb:x1_fb]
    px_fb_w = px_fb + 3.2 * fbm1_fb + 1.8 * fbm2_fb
    py_fb_w = py_fb + 3.2 * fbm2_fb - 1.6 * fbm1_fb

    # Preserve the outer Western Map-Edge Airless Barrier (`X < 62`, `> 9,000 m`):
    d_w_fb_edge = px_fb + 8.5 * fbm1_fb + 4.8 * fbm2_fb
    w_fb_w_airless = 1.0 - G.sstep(34.0, 68.0, d_w_fb_edge)
    h_fb_w_barrier = np.maximum(
        E_fb_sub,
        9250.0 + 2100.0 * (1.0 - G.sstep(0.0, 44.0, d_w_fb_edge)) + 0.50 * dE_fb_med + 0.60 * dE_fb_hp + 260.0 * fbm1_fb,
    )

    # Glaciovolcanic Cordillera Spine (`+3,950..+5,250 m`, sloping W -> E from `+5,250 m` down to `+3,950 m` at the eastern border):
    u_fb_we = np.clip((px_fb - 72.0) / 245.0, 0.0, 1.0)
    # Cordillera axial ridge runs WNW -> ESE along `y_axis_fb(x)`:
    y_axis_fb = 1308.0 - 16.0 * np.sin((px_fb - 90.0) / 210.0 * math.pi) + 8.0 * fbm1_fb
    d_axis_fb = np.abs(py_fb - y_axis_fb)
    ridge_crest_fb = 620.0 * (1.0 - G.sstep(4.0, 36.0, d_axis_fb)) + 190.0 * np.cos((px_fb - 100.0) * 0.22 + (py_fb - 1300.0) * 0.26 + 1.5 * fbm1_fb)
    h_fb_cord_base = (
        4720.0
        - 780.0 * (u_fb_we ** 1.12)
        + ridge_crest_fb
        + 0.35 * dE_fb_med
        + 0.42 * dE_fb_hp
        + 150.0 * fbm1_fb
        + 95.0 * fbm2_fb
    )
    # Regional envelope (`sd_fb_sub >= -28 px`), sparing existing wet lakes (`is_copper_tarn` / `is_lab_lake`) and `w_fb_w_airless`:
    w_fb_env = (
        G.sstep(-28.0, 2.0, sd_fb_sub)
        * (1.0 - w_fb_w_airless)
        * (~whas_exp[y0_fb:y1_fb, x0_fb:x1_fb]).astype(float)
    )
    h_fb_work = E_fb_sub * (1.0 - w_fb_env) + h_fb_cord_base * w_fb_env

    # 5 Glaciovolcanic Stratocones & Degassing Calderas along the Firebliss Arc:
    # `(vx, vy, r_base_px, r_rim_px, peak_m, floor_m, rim_notch_deg, name)`
    fb_volc_specs = [
        (104.0, 1304.0, 18.0, 3.6, 6650.0, 5820.0, 135.0, 'Mount Pyre'),
        (148.0, 1292.0, 16.5, 3.4, 5940.0, 5320.0, 140.0, 'Cinder-Crown'),
        (206.0, 1284.0, 21.0, 4.4, 6380.0, 5480.0, 132.0, 'Firebliss Mons'),
        (254.0, 1288.0, 16.0, 3.2, 5780.0, 5180.0, 138.0, 'Brimstone Spire'),
        (298.0, 1286.0, 14.5, 3.0, 5360.0, 4680.0, 130.0, 'Copper-Fissure Vent'),
    ]
    w_fb_cone_sub = np.zeros_like(E_fb_sub)
    w_fb_crater_sub = np.zeros_like(E_fb_sub)
    for vx_f, vy_f, rb_f, rr_f, pk_f, fl_f, notch_deg_f, _vnm in fb_volc_specs:
        dx_v = px_fb - vx_f + 0.85 * fbm1_fb
        dy_v = py_fb - vy_f + 0.85 * fbm2_fb
        r_v = np.hypot(dx_v, dy_v)
        ang_v = np.degrees(np.arctan2(dy_v, dx_v))
        d_ang_notch = np.abs(((ang_v - notch_deg_f + 180.0) % 360.0) - 180.0)
        w_notch_v = (1.0 - G.sstep(14.0, 42.0, d_ang_notch)) * G.sstep(0.45 * rr_f, 1.45 * rr_f, r_v)
        # Concave stratocone flank rising to the crater rim at `r_v = rr_f`:
        u_flank_v = np.clip((r_v - rr_f) / max(1.0, rb_f - rr_f), 0.0, 1.0)
        w_flank_v = (1.0 - G.sstep(0.0, 1.0, u_flank_v)) ** 1.55
        # Radialbarranco ribs on the stratocone flanks:
        rib_v = 115.0 * np.cos(np.arctan2(dy_v, dx_v) * 14.0 + 1.6 * fbm1_fb) * G.sstep(rr_f, rr_f + 4.0, r_v) * (1.0 - u_flank_v)
        h_rim_v = pk_f - 180.0 * w_notch_v + rib_v + 45.0 * fbm2_fb
        h_cone_v = h_fb_work + np.maximum(0.0, h_rim_v - h_fb_work) * w_flank_v
        # Steaming summit caldera / crater bowl inside `r_v < rr_f`:
        u_crat_v = np.clip(r_v / rr_f, 0.0, 1.0)
        w_crat_v = 1.0 - G.sstep(0.55, 1.02, u_crat_v)
        h_crat_v = fl_f + (h_rim_v - fl_f) * (G.sstep(0.35, 1.0, u_crat_v) ** 1.6)
        h_v_comb = h_cone_v * (1.0 - w_crat_v) + h_crat_v * w_crat_v
        w_v_tot = np.clip(G.sstep(rb_f + 2.0, rr_f, r_v), 0.0, 1.0) * (1.0 - w_fb_w_airless)
        h_fb_work = np.where(w_v_tot > 0.01, np.maximum(h_fb_work * (1.0 - w_v_tot) + h_v_comb * w_v_tot, h_fb_work * (1.0 - 0.85 * w_crat_v)), h_fb_work)
        h_fb_work = h_fb_work * (1.0 - w_crat_v) + h_crat_v * w_crat_v
        w_fb_cone_sub = np.maximum(w_fb_cone_sub, w_flank_v * (1.0 - w_fb_w_airless))
        w_fb_crater_sub = np.maximum(w_fb_crater_sub, w_crat_v * (1.0 - w_fb_w_airless))

    # 4 Sheltered Temperate Geothermal Valleys (`Cfa` / `Cfb` / `Csb`, floors `+1,680..+2,180 m`) & Geothermal Lakes (`WH`):
    # `(gx, gy, rx_val, ry_val, ang_deg, floor_m, lk_rx, lk_ry, wlev_m, bed_m, val_name)`
    fb_geovalley_specs = [
        (126.0, 1344.0, 16.5, 8.2, -26.0, 2195.0, 4.2, 2.5, 2180.0, 2125.0, 'West Bliss Cauldron'),
        (184.0, 1318.0, 24.0, 10.5, -14.0, 1695.0, 6.8, 3.0, 1680.0, 1615.0, 'Great Firebliss Vale'),
        (238.0, 1322.0, 17.5, 8.5,  16.0, 1955.0, 4.6, 2.6, 1940.0, 1880.0, 'Solfatara Glen'),
        (284.0, 1318.0, 16.0, 8.0, -18.0, 1855.0, 4.2, 2.4, 1840.0, 1785.0, 'East Bliss Vale'),
    ]
    w_fb_valley_sub = np.zeros_like(E_fb_sub)
    w_fb_sinter_sub = np.zeros_like(E_fb_sub)
    is_fb_lake = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    is_fb_lake_sub = np.zeros(E_fb_sub.shape, dtype=bool)

    for gx_f, gy_f, rx_v, ry_v, ang_v, fl_v, lkrx_v, lkry_v, wl_v, bed_v, _gnm in fb_geovalley_specs:
        th_v = math.radians(ang_v)
        dx_g = px_fb_w - gx_f
        dy_g = py_fb_w - gy_f
        ugx = dx_g * math.cos(th_v) + dy_g * math.sin(th_v)
        ugy = -dx_g * math.sin(th_v) + dy_g * math.cos(th_v)
        r_g = np.hypot(ugx / rx_v, ugy / ry_v)
        # Flat-floored geothermal basin (`r_g <= 0.62`) with stepped travertine sinter benches (`0.42 <= r_g <= 0.88`) and steep caldera/graben walls (`0.65..1.28`):
        w_val = (1.0 - G.sstep(0.55, 1.25, r_g)) * (1.0 - w_fb_w_airless) * (1.0 - 0.85 * w_fb_crater_sub)
        sinter_steps = 85.0 * np.sin(r_g * 5.0 * math.pi) * G.sstep(0.32, 0.55, r_g) * (1.0 - G.sstep(0.78, 1.05, r_g))
        h_val_prof = (
            fl_v
            + 520.0 * (G.sstep(0.38, 1.08, r_g) ** 1.45)
            + sinter_steps
            + 28.0 * fbm2_fb
        )
        h_fb_work = h_fb_work * (1.0 - w_val) + np.minimum(h_fb_work, h_val_prof) * w_val
        w_fb_valley_sub = np.maximum(w_fb_valley_sub, w_val)
        w_sinter_ring = G.sstep(0.28, 0.52, r_g) * (1.0 - G.sstep(0.75, 1.05, r_g)) * (1.0 - w_fb_w_airless)
        w_fb_sinter_sub = np.maximum(w_fb_sinter_sub, w_sinter_ring)

        # Warm geothermal crater-moat / ribbon tarn (`WH`) at the center of each geothermal valley:
        dx_lk_f = px_fb - gx_f + 0.45 * fbm1_fb
        dy_lk_f = py_fb - gy_f + 0.45 * fbm2_fb
        ulk_x = dx_lk_f * math.cos(th_v) + dy_lk_f * math.sin(th_v)
        ulk_y = -dx_lk_f * math.sin(th_v) + dy_lk_f * math.cos(th_v)
        r_lk_f = np.hypot(ulk_x / lkrx_v, ulk_y / lkry_v)
        w_lk_shore_f = (1.0 - G.sstep(0.95, 2.15, r_lk_f)) * (~is_fb_lake_sub).astype(float)
        h_lk_shore_f = wl_v + 14.0 + 160.0 * G.sstep(0.95, 2.15, r_lk_f)
        h_fb_work = h_fb_work * (1.0 - w_lk_shore_f) + np.minimum(h_fb_work, h_lk_shore_f) * w_lk_shore_f
        in_lk_f = r_lk_f <= 1.0
        is_fb_lake_sub |= in_lk_f
        h_fb_work = np.where(in_lk_f, bed_v + (wl_v - bed_v - 6.0) * (r_lk_f ** 1.6), h_fb_work)
        whas_exp[y0_fb:y1_fb, x0_fb:x1_fb][in_lk_f] = True
        wlev_exp[y0_fb:y1_fb, x0_fb:x1_fb][in_lk_f] = wl_v
    is_fb_lake[y0_fb:y1_fb, x0_fb:x1_fb] = is_fb_lake_sub

    # Carve Sinuous Geothermal Outflow Gorges connecting the Firebliss geothermal valleys southeastward into `Labyrinth`
    # (`Great Firebliss Vale (184, 1318) -> Solfatara Glen (238, 1322) -> Labyrinth North Branch (228, 1423)` and
    #  `West Bliss Cauldron (126, 1344) -> Labyrinth NW Catena Tarn (145.5, 1467)`):
    fb_riv_main_pts = [
        [188.0, 1319.0], [198.0, 1323.0], [209.0, 1320.0], [219.0, 1324.0], [229.0, 1321.0],
        [238.0, 1322.0], [244.0, 1331.0], [240.0, 1341.0], [245.0, 1351.0], [239.0, 1362.0],
        [243.0, 1373.0], [237.0, 1384.0], [240.0, 1395.0], [234.0, 1406.0], [236.0, 1415.0],
        [234.0, 1424.0],
    ]
    fb_riv_main_els = [
        1680.0, 1672.0, 1664.0, 1656.0, 1648.0,
        1640.0, 1630.0, 1620.0, 1610.0, 1600.0,
        1590.0, 1580.0, 1570.0, 1560.0, 1550.0,
        1540.0,
    ]
    # Note: Since Great Firebliss Vale (`1,680 m`) is lower than Lake 3 (`1,980 m`), let's make sure the outflow from
    # Solfatara Glen (`1,940 m`) & West Bliss Cauldron (`2,180 m`) and Great Firebliss Vale (`1,680 m`) NEVER flows uphill!
    # Specifically:
    # - `r_fb_west` flows from `West Bliss Cauldron` southern rim `(132.0, 1352.0)` (`+3,180 m`) -> `Labyrinth` `r_lab_chaos_n` headwater `(182.0, 1404.0)` (`+2,480 m`)!
    # - `r_fb_central` flows from `Solfatara Glen` (`238.0, 1322.0`, `wlev = +2,180 m` if raised above Lake 3 `1,980 m`!) -> `Lake 3` `(234.0, 1424.0)` (`+1,980 m`)!
    # - `r_fb_east` flows from `East Bliss Vale` (`284.0, 1318.0`, `wlev = +2,040 m`) -> `Labyrinth` `Lake 6` `(284.0, 1418.0)` (`+1,720 m`)!
    # Let's set the 4 Geothermal Valley lake levels so EVERY geothermal valley outflow drains strictly downhill into `Labyrinth`!
    whas_exp[y0_fb:y1_fb, x0_fb:x1_fb][is_fb_lake_sub] = False
    wlev_exp[y0_fb:y1_fb, x0_fb:x1_fb][is_fb_lake_sub] = np.nan
    is_fb_lake_sub[:] = False
    h_fb_work = E_fb_sub * (1.0 - w_fb_env) + h_fb_cord_base * w_fb_env
    for vx_f, vy_f, rb_f, rr_f, pk_f, fl_f, notch_deg_f, _vnm in fb_volc_specs:
        dx_v = px_fb - vx_f + 0.85 * fbm1_fb
        dy_v = py_fb - vy_f + 0.85 * fbm2_fb
        r_v = np.hypot(dx_v, dy_v)
        ang_v = np.degrees(np.arctan2(dy_v, dx_v))
        d_ang_notch = np.abs(((ang_v - notch_deg_f + 180.0) % 360.0) - 180.0)
        w_notch_v = (1.0 - G.sstep(14.0, 42.0, d_ang_notch)) * G.sstep(0.45 * rr_f, 1.45 * rr_f, r_v)
        u_flank_v = np.clip((r_v - rr_f) / max(1.0, rb_f - rr_f), 0.0, 1.0)
        w_flank_v = (1.0 - G.sstep(0.0, 1.0, u_flank_v)) ** 1.55
        rib_v = 115.0 * np.cos(np.arctan2(dy_v, dx_v) * 14.0 + 1.6 * fbm1_fb) * G.sstep(rr_f, rr_f + 4.0, r_v) * (1.0 - u_flank_v)
        h_rim_v = pk_f - 180.0 * w_notch_v + rib_v + 45.0 * fbm2_fb
        h_cone_v = h_fb_work + np.maximum(0.0, h_rim_v - h_fb_work) * w_flank_v
        u_crat_v = np.clip(r_v / rr_f, 0.0, 1.0)
        w_crat_v = 1.0 - G.sstep(0.55, 1.02, u_crat_v)
        h_crat_v = fl_f + (h_rim_v - fl_f) * (G.sstep(0.35, 1.0, u_crat_v) ** 1.6)
        h_v_comb = h_cone_v * (1.0 - w_crat_v) + h_crat_v * w_crat_v
        w_v_tot = np.clip(G.sstep(rb_f + 2.0, rr_f, r_v), 0.0, 1.0) * (1.0 - w_fb_w_airless)
        h_fb_work = np.where(w_v_tot > 0.01, np.maximum(h_fb_work * (1.0 - w_v_tot) + h_v_comb * w_v_tot, h_fb_work * (1.0 - 0.85 * w_crat_v)), h_fb_work)
        h_fb_work = h_fb_work * (1.0 - w_crat_v) + h_crat_v * w_crat_v

    fb_geovalley_specs = [
        # (gx, gy, rx_val, ry_val, ang_deg, floor_m, lk_rx, lk_ry, wlev_m, bed_m, val_name)
        (126.0, 1344.0, 16.5, 8.2, -26.0, 2655.0, 4.2, 2.5, 2640.0, 2580.0, 'West Bliss Cauldron'),
        (184.0, 1318.0, 24.0, 10.5, -14.0, 2295.0, 6.8, 3.0, 2280.0, 2215.0, 'Great Firebliss Vale'),
        (238.0, 1322.0, 17.5, 8.5,  16.0, 2135.0, 4.6, 2.6, 2120.0, 2055.0, 'Solfatara Glen'),
        (284.0, 1318.0, 16.0, 8.0, -18.0, 1975.0, 4.2, 2.4, 1960.0, 1900.0, 'East Bliss Vale'),
    ]
    w_fb_valley_sub[:] = 0.0
    w_fb_sinter_sub[:] = 0.0
    for gx_f, gy_f, rx_v, ry_v, ang_v, fl_v, lkrx_v, lkry_v, wl_v, bed_v, _gnm in fb_geovalley_specs:
        th_v = math.radians(ang_v)
        dx_g = px_fb_w - gx_f
        dy_g = py_fb_w - gy_f
        ugx = dx_g * math.cos(th_v) + dy_g * math.sin(th_v)
        ugy = -dx_g * math.sin(th_v) + dy_g * math.cos(th_v)
        r_g = np.hypot(ugx / rx_v, ugy / ry_v)
        w_val = (1.0 - G.sstep(0.55, 1.25, r_g)) * (1.0 - w_fb_w_airless) * (1.0 - 0.85 * w_fb_crater_sub)
        sinter_steps = 85.0 * np.sin(r_g * 5.0 * math.pi) * G.sstep(0.32, 0.55, r_g) * (1.0 - G.sstep(0.78, 1.05, r_g))
        h_val_prof = (
            fl_v
            + 560.0 * (G.sstep(0.38, 1.08, r_g) ** 1.45)
            + sinter_steps
            + 28.0 * fbm2_fb
        )
        h_fb_work = h_fb_work * (1.0 - w_val) + np.minimum(h_fb_work, h_val_prof) * w_val
        w_fb_valley_sub = np.maximum(w_fb_valley_sub, w_val)
        w_sinter_ring = G.sstep(0.28, 0.52, r_g) * (1.0 - G.sstep(0.75, 1.05, r_g)) * (1.0 - w_fb_w_airless)
        w_fb_sinter_sub = np.maximum(w_fb_sinter_sub, w_sinter_ring)

        dx_lk_f = px_fb - gx_f + 0.45 * fbm1_fb
        dy_lk_f = py_fb - gy_f + 0.45 * fbm2_fb
        ulk_x = dx_lk_f * math.cos(th_v) + dy_lk_f * math.sin(th_v)
        ulk_y = -dx_lk_f * math.sin(th_v) + dy_lk_f * math.cos(th_v)
        r_lk_f = np.hypot(ulk_x / lkrx_v, ulk_y / lkry_v)
        w_lk_shore_f = (1.0 - G.sstep(0.95, 2.15, r_lk_f)) * (~is_fb_lake_sub).astype(float)
        h_lk_shore_f = wl_v + 14.0 + 160.0 * G.sstep(0.95, 2.15, r_lk_f)
        h_fb_work = h_fb_work * (1.0 - w_lk_shore_f) + np.minimum(h_fb_work, h_lk_shore_f) * w_lk_shore_f
        in_lk_f = r_lk_f <= 1.0
        is_fb_lake_sub |= in_lk_f
        h_fb_work = np.where(in_lk_f, bed_v + (wl_v - bed_v - 6.0) * (r_lk_f ** 1.6), h_fb_work)
        whas_exp[y0_fb:y1_fb, x0_fb:x1_fb][in_lk_f] = True
        wlev_exp[y0_fb:y1_fb, x0_fb:x1_fb][in_lk_f] = wl_v
    is_fb_lake[y0_fb:y1_fb, x0_fb:x1_fb] = is_fb_lake_sub

    # Sinuous Geothermal Outflow Rivers descending strictly downhill from the 4 Firebliss Geothermal Valleys into `Labyrinth`:
    # 1. `r_fb_west` (`West Bliss Cauldron 2,640 m -> Labyrinth North Branch headwater (182, 1404) at 2,480 m`):
    fb_west_pts = [
        [129.0, 1346.0], [136.0, 1354.0], [145.0, 1359.0], [151.0, 1368.0],
        [160.0, 1375.0], [166.0, 1385.0], [175.0, 1394.0], [182.0, 1404.0],
    ]
    fb_west_els = [2640.0, 2618.0, 2595.0, 2572.0, 2550.0, 2526.0, 2502.0, 2480.0]
    # 2. `r_fb_central` (`Great Firebliss Vale 2,280 m -> Solfatara Glen 2,120 m -> Labyrinth Lake 3 (234, 1424) at 1,980 m`):
    fb_central_pts = [
        [190.0, 1319.0], [199.0, 1323.0], [209.0, 1319.0], [219.0, 1324.0], [229.0, 1320.0],
        [238.0, 1322.0], [243.0, 1332.0], [238.0, 1343.0], [244.0, 1354.0], [238.0, 1366.0],
        [242.0, 1378.0], [236.0, 1390.0], [240.0, 1402.0], [235.0, 1413.0], [234.0, 1424.0],
    ]
    fb_central_els = [
        2280.0, 2248.0, 2216.0, 2184.0, 2152.0,
        2120.0, 2104.0, 2088.0, 2072.0, 2056.0,
        2040.0, 2025.0, 2010.0, 1995.0, 1980.0,
    ]
    # 3. `r_fb_east` (`East Bliss Vale 1,960 m -> Labyrinth Lake 6 (284, 1418) at 1,720 m`):
    fb_east_pts = [
        [284.0, 1320.0], [289.0, 1330.0], [283.0, 1341.0], [288.0, 1352.0], [282.0, 1364.0],
        [287.0, 1376.0], [281.0, 1388.0], [286.0, 1400.0], [283.0, 1410.0], [284.0, 1418.0],
    ]
    fb_east_els = [1960.0, 1934.0, 1908.0, 1880.0, 1852.0, 1825.0, 1798.0, 1770.0, 1745.0, 1720.0]

    d2_fb_riv = np.full_like(E_fb_sub, 1e12)
    fl_fb_riv = h_fb_work.copy()
    for r_pts_f, r_els_f in [(fb_west_pts, fb_west_els), (fb_central_pts, fb_central_els), (fb_east_pts, fb_east_els)]:
        for i_rf in range(len(r_pts_f) - 1):
            rx0_f, ry0_f = r_pts_f[i_rf]
            rx1_f, ry1_f = r_pts_f[i_rf + 1]
            re0_f, re1_f = r_els_f[i_rf], r_els_f[i_rf + 1]
            for s_rf in np.linspace(0.0, 1.0, 10):
                qx_f = rx0_f + s_rf * (rx1_f - rx0_f)
                qy_f = ry0_f + s_rf * (ry1_f - ry0_f)
                qe_f = re0_f + s_rf * (re1_f - re0_f)
                d2_qf = (px_fb - qx_f) ** 2 + (py_fb - qy_f) ** 2
                better_qf = d2_qf < d2_fb_riv
                d2_fb_riv = np.where(better_qf, d2_qf, d2_fb_riv)
                fl_fb_riv = np.where(better_qf, qe_f, fl_fb_riv)
    u_fb_riv = np.sqrt(d2_fb_riv) / 5.2
    w_fb_riv_swale = ((1.0 - G.sstep(0.0, 1.10, u_fb_riv)) ** 1.45) * (1.0 - w_fb_w_airless) * (~is_fb_lake_sub).astype(float)
    h_fb_riv_prof = fl_fb_riv + 185.0 * (G.sstep(0.0, 1.10, u_fb_riv) ** 1.45)
    h_fb_work = h_fb_work * (1.0 - 0.88 * w_fb_riv_swale) + np.minimum(h_fb_work, h_fb_riv_prof) * (0.88 * w_fb_riv_swale)
    w_fb_valley_sub = np.maximum(w_fb_valley_sub, 0.75 * w_fb_riv_swale)

    # Re-enforce the outer W map-edge airless barrier (`X < 62`, `> 9,000 m`):
    h_fb_work = h_fb_work * (1.0 - w_fb_w_airless) + h_fb_w_barrier * w_fb_w_airless
    # Blend `h_fb_work` into `En_exp[y0_fb:y1_fb, x0_fb:x1_fb]` where `w_fb_env > 0` or `w_fb_riv_swale > 0`:
    w_fb_apply = np.clip(np.maximum(w_fb_env, w_fb_riv_swale), 0.0, 1.0)
    En_exp[y0_fb:y1_fb, x0_fb:x1_fb] = (
        En_exp[y0_fb:y1_fb, x0_fb:x1_fb] * (1.0 - w_fb_apply) + h_fb_work * w_fb_apply
    )
    # Refresh `h_lab_final` on the overlapping `Y = 1280..1435, X = 0..360` band so `w_lb_post` preserves Firebliss Range & its outflow gorges:
    h_lab_final[:y1_fb - y0_lb, :x1_fb] = En_exp[y0_lb:y1_fb, x0_lb:x1_fb]
    is_lab_lake_sub[:y1_fb - y0_lb, :x1_fb] |= is_fb_lake[y0_lb:y1_fb, x0_lb:x1_fb]

    w_fb_clim = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_fb_valley_full = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_fb_sinter_full = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_fb_cone_full = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_fb_crater_full = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_fb_clim[y0_fb:y1_fb, x0_fb:x1_fb] = np.clip(np.maximum(w_fb_apply, nd.gaussian_filter(mask_fb[y0_fb:y1_fb, x0_fb:x1_fb].astype(float), sigma=2.5) * (1.0 - w_fb_w_airless)), 0.0, 1.0)
    w_fb_valley_full[y0_fb:y1_fb, x0_fb:x1_fb] = w_fb_valley_sub
    w_fb_sinter_full[y0_fb:y1_fb, x0_fb:x1_fb] = w_fb_sinter_sub
    w_fb_cone_full[y0_fb:y1_fb, x0_fb:x1_fb] = w_fb_cone_sub
    w_fb_crater_full[y0_fb:y1_fb, x0_fb:x1_fb] = w_fb_crater_sub

    # Compute the SE Volcanic Ash & Water-Vapor Plume Field (`w_firebliss_plume`, blowing NW -> SE at azimuth ~135 deg
    # from the 5 Firebliss Range vents across the shared border into `Labyrinth`):
    w_firebliss_plume = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_firebliss_ash = np.zeros((NEW_OH, NEW_OW), dtype=float)
    th_plume = math.radians(52.0)  # Downwind vector (+cos(52), +sin(52)) = (+0.616, +0.788) (WNW/NW -> ESE/SE into Labyrinth)
    for vx_f, vy_f, _rb_f, _rr_f, pk_f, _fl_f, _nd_f, _vnm in fb_volc_specs:
        dx_pl = X_exp - vx_f + 4.5 * meta_nw['fbm1']
        dy_pl = Y_exp - vy_f + 4.5 * meta_nw['fbm2']
        # `u_down` is distance downwind (SE), `u_cross` is cross-wind spread:
        u_down = dx_pl * math.cos(th_plume) + dy_pl * math.sin(th_plume)
        u_cross = -dx_pl * math.sin(th_plume) + dy_pl * math.cos(th_plume)
        sigma_cross = 18.0 + 0.24 * np.maximum(0.0, u_down)
        plume_v = (
            G.sstep(-12.0, 18.0, u_down)
            * (1.0 - G.sstep(185.0, 320.0, u_down))
            * np.exp(-0.5 * ((u_cross / sigma_cross) ** 2))
        )
        ash_v = (
            G.sstep(-8.0, 12.0, u_down)
            * (1.0 - G.sstep(95.0, 195.0, u_down))
            * np.exp(-0.5 * ((u_cross / (12.0 + 0.18 * np.maximum(0.0, u_down))) ** 2))
        )
        w_firebliss_plume = np.maximum(w_firebliss_plume, plume_v)
        w_firebliss_ash = np.maximum(w_firebliss_ash, ash_v)
    w_firebliss_plume = np.clip(w_firebliss_plume * (1.0 - w_lab_edge_barrier_full), 0.0, 1.0)
    w_firebliss_ash = np.clip(w_firebliss_ash * (1.0 - w_lab_edge_barrier_full), 0.0, 1.0)

    # Register the 3 sinuous Firebliss geothermal outflow rivers and 5 volcanic vents:
    for new_fb_id, new_fb_pts, new_fb_q, new_fb_ord in [
        ('r_fb_west', fb_west_pts, 65.0, 2),
        ('r_fb_central', fb_central_pts, 145.0, 3),
        ('r_fb_east', fb_east_pts, 85.0, 2),
    ]:
        rivers_exp.append({
            'id': new_fb_id,
            'kind': 'river',
            'perennial': True,
            'order': new_fb_ord,
            'tongue': 'tungang',
            'px': copy.deepcopy(new_fb_pts),
            'q_mouth': new_fb_q,
            'q_mouth_m3s': new_fb_q,
            'q_m3s': [round(18.0 + (new_fb_q - 18.0) * (i / float(len(new_fb_pts) - 1)), 1) for i in range(len(new_fb_pts))],
            'length_km': round(sum(math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 2.0 for p1, p2 in zip(new_fb_pts, new_fb_pts[1:])), 1),
        })
        lab_paint_rivers.append(new_fb_pts)

    for vx_f, vy_f, _rb_f, _rr_f, pk_f, _fl_f, _nd_f, vnm_f in fb_volc_specs:
        meta_nw['new_vents'].append({
            'name': vnm_f,
            'px': [round(vx_f, 1), round(vy_f, 1)],
            'peak': int(round(pk_f)),
            'kind': 'stratovolcano',
            'region': 'Firebliss Range',
        })
    del (
        E_fb_s15, E_fb_s2, E_fb_s7, E_fb_sub, d2_fb_riv, dE_fb_hp, dE_fb_med,
        d_axis_fb, d_in_fb, d_out_fb, d_w_fb_edge, fbm1_fb, fbm2_fb, fl_fb_riv,
        h_fb_cord_base, h_fb_riv_prof, h_fb_w_barrier, h_v_comb, px_fb, px_fb_w, py_fb, py_fb_w,
        ridge_crest_fb, sd_fb, sd_fb_sub, u_fb_riv, u_fb_we, w_fb_cone_sub, w_fb_crater_sub,
        w_fb_env, w_fb_riv_swale, w_fb_sinter_sub, w_fb_valley_sub, w_v_tot, y_axis_fb,
    )
    gc.collect()

    # Extend river `r030` (*Clodosriba*) down the Main Eastern Rille from the Greenstep Fissure Shield `(668.0, 1338.0)`
    # across all five lava terraces into SW Lowlands / Giant Country:
    gval_headwater_pts = [
        [668.0, 1338.0], [666.0, 1325.0], [662.0, 1304.0],
        [654.0, 1286.0], [646.0, 1268.0], [644.0, 1242.0],
        [641.0, 1226.0], [638.0, 1212.0], [642.0, 1196.0],
        [646.0, 1185.0],
    ]
    for r in rivers_exp:
        if str(r.get('id')) in ('30', 'r030'):
            old_px_30 = [p for p in (r.get('px') or []) if p[1] < 1178.0]
            r['px'] = copy.deepcopy(gval_headwater_pts) + copy.deepcopy(old_px_30)
            r['q_mouth'] = max(float(r.get('q_mouth') or 320.0), 480.0)
            n_30 = len(r['px'])
            r['q_m3s'] = [round(25.0 + 455.0 * (i / float(max(1, n_30 - 1))), 1) for i in range(n_30)]
            break

    # Clip legacy wadis (`r540`, `r867`, `r606`) so they originate on the lower outer piedmont of `twins`
    # (`r >= 18 px` from the Twin cones and `X >= 1032`) while flowing across the restored western Catch floor:
    for r in rivers_exp:
        rid_s = str(r.get('id'))
        if rid_s in ('540', 'r540', '867', 'r867', '606', 'r606'):
            pts_tw_r = r.get('px') or []
            filt_pts = [
                p for p in pts_tw_r
                if math.hypot(p[0] - 988.0, p[1] - 1458.0) >= 18.0
                and math.hypot(p[0] - 1042.0, p[1] - 1498.0) >= 18.0
                and p[0] >= 1032.0
            ]
            if len(filt_pts) >= 2:
                r['px'] = filt_pts
            elif len(pts_tw_r) >= 2:
                r['px'] = pts_tw_r[-2:]
            if 'q_m3s' in r and len(r['q_m3s']) != len(r['px']):
                r['q_m3s'] = r['q_m3s'][-len(r['px']):]

    # =========================================================================
    # 10. `Xanadu` (`rmvkkmitffbjk` / `rmuf30815vwms`) & East Rift Rearrangement:
    #     - (1) Dramatic High-Contrast Rift-Valley Topography in Upper Xanadu:
    #           One clean half-graben Lake-Valley (Erewhon's Lake, `X = 776..905, Y = 1483..1533`, `wlev = -520.0 m`),
    #           flanked on the north by a steep faceted Normal-Fault Rift Escarpment (`Y = 1445..1483`) rising to
    #           `Godshearth`/`Godthrone` and on the south by a knife-edged Rift Horst Spine (`+450..+1,280 m` crest)
    #           dividing Erewhon's Lake (`-520 m`) from the abyssal Lizardman Rift (`-2,600 m`), breached at its
    #           eastern end by the Broken Theodiga Dam Gorge (`908, 1535` at `-495.0 m`).
    #     - (2) Sinuous Great Tall Cataract (`r070` / *Ālph*) plunging `1,165 m` SSE through a twin-stepped cataract
    #           amphitheatre from the broken Theodiga dam (`904, 1530` at `-520 m`) down into the northern bay of the
    #           Small Lake (`938.5, 1587.0` at `-1,685 m`).
    #     - (3) Organic Curved Lower Xanadu Graben Amphitheatre & Compact Small Lake (`is_xanadu_small_lake`,
    #           centered at `947.0, 1597.0`, `rx = 15.8, ry = 10.6`, `wlev = -1,685.0 m`), replacing the oversized
    #           `2,808 px` `Body 24` with 3 stepped normal-fault terraces (`-1,620 m` inner mist bowl -> `-1,080 m`
    #           mid fault bench -> `-350..+350 m` upper horst benches at `Qiblai` & `Strongwall`) while preserving
    #           authentic Rift-valley relief (`dE_xn_med` & `dE_xn_hp`).
    #     - (4) Full-Width U-Shaped Oidong Hanging Rift Trough & Sinuous Great Eastern Cataract (`r_oidong_cataract` /
    #           *Nahr Uydūng*) from the Eastmost Rift Lake (`Body 32` at `X = 1147..1212, Y = 1597..1618`, `wlev = +2,000.2 m`),
    #           completely erasing the old 2-px horizontal strip (`Y = 1589..1601`) and plunging `3,125 m` from `(1001, 1597.5)`
    #           (`+1,440 m`) into the eastern bay of the Small Lake (`961.5, 1597.0` at `-1,685 m`).
    #     - (5) Sinuous Western Outflow River & Series of 4 Low Cataracts (`r_xanadu_low_cataracts` / *Nahr ash-Shalālāt*)
    #           draining the Small Lake (`932.0, 1598.0` at `-1,685 m`) westward into the Lizardman Rift Lake
    #           (`Body 22`, `871.5, 1599.0` at `-2,600.0 m`).
    # =========================================================================
    # Guard Opal Valley (`mask_oval`, `is_oval_lake`, `riftmouth` at `972, 1636`), Twins cones (`988, 1458` & `1042, 1498`), and Godshearth (`Y <= 1440`):
    oval_protect_mask = mask_oval | is_oval_lake | ((X_exp >= 967.0) & (Y_exp >= 1631.0))
    d_oval_guard = G.sstep(2.0, 7.5, nd.distance_transform_edt(~oval_protect_mask))
    d_twins_guard = (
        G.sstep(15.0, 22.0, np.hypot(X_exp - 988.0, Y_exp - 1458.0))
        * G.sstep(15.0, 22.0, np.hypot(X_exp - 1042.0, Y_exp - 1498.0))
    )

    y0_xn, y1_xn = 1440, 1650
    x0_xn, x1_xn = 755, 1165
    px_xn = X_exp[y0_xn:y1_xn, x0_xn:x1_xn]
    py_xn = Y_exp[y0_xn:y1_xn, x0_xn:x1_xn]
    fbm1_xn = meta_nw['fbm1'][y0_xn:y1_xn, x0_xn:x1_xn]
    fbm2_xn = meta_nw['fbm2'][y0_xn:y1_xn, x0_xn:x1_xn]

    # Extract multi-scale authentic Rift-valley relief from `En_exp` (suppressing only the old `(969, 1532)` moved-volcano
    # ring and the old 2-px horizontal Oidong water trench so those two artifacts never bleed back through):
    En_xn_orig = En_exp[y0_xn:y1_xn, x0_xn:x1_xn].copy()
    E_xn_s2 = nd.gaussian_filter(En_xn_orig, sigma=1.8)
    E_xn_s6 = nd.gaussian_filter(En_xn_orig, sigma=5.8)
    E_xn_s14 = nd.gaussian_filter(En_xn_orig, sigma=14.0)
    w_suppress_art = np.maximum(
        1.0 - G.sstep(16.0, 25.0, np.hypot(px_xn - 969.0, py_xn - 1532.0)),
        G.sstep(996.0, 1004.0, px_xn) * (1.0 - G.sstep(1144.0, 1152.0, px_xn)) * (1.0 - G.sstep(6.0, 13.0, np.abs(py_xn - 1595.0))),
    )
    dE_xn_hp = np.clip(E_xn_s2 - E_xn_s6, -260.0, 310.0) * (1.0 - w_suppress_art)
    dE_xn_med = np.clip(E_xn_s6 - E_xn_s14, -440.0, 520.0) * (1.0 - w_suppress_art)

    # (A) Clear stray perched lake `Body 14` (`X = 955..986, Y = 1522..1552`), the 6 tiny broken puddles (`X = 862..938, Y = 1522..1565`),
    #     the drowned SE tail of Erewhon's lake past Theodiga (`X >= 905, Y >= 1528`), the oversized `Body 24` (`X = 908..1004, Y = 1578..1640`),
    #     and the 2-px horizontal water strip in Oidong Valley (`X = 1002..1146, Y = 1589..1601`):
    clear_xan_water = (
        ((X_exp >= 954.0) & (X_exp <= 988.0) & (Y_exp >= 1520.0) & (Y_exp <= 1554.0))
        | ((X_exp >= 862.0) & (X_exp <= 942.0) & (Y_exp >= 1524.0) & (Y_exp <= 1572.0) & ((X_exp + 0.85 * (Y_exp - 1532.0)) > 905.5))
        | ((X_exp >= 862.0) & (X_exp <= 942.0) & (Y_exp >= 1533.5) & (Y_exp <= 1572.0))
        | ((X_exp >= 905.5) & (X_exp <= 942.0) & (Y_exp >= 1518.0) & (Y_exp <= 1572.0))
        | ((X_exp >= 908.0) & (X_exp <= 1004.0) & (Y_exp >= 1578.0) & (Y_exp <= 1640.0) & ~oval_protect_mask)
        | ((X_exp >= 1002.0) & (X_exp <= 1146.5) & (Y_exp >= 1589.0) & (Y_exp <= 1601.0))
    )
    whas_exp[clear_xan_water] = False
    wlev_exp[clear_xan_water] = np.nan

    # Replace the old moved volcano crater ring around `(969, 1532)` (`X = 935..994, Y = 1500..1558`) with a dramatic,
    # faceted SW-trending Rift Fault Buttress descending from the `Twins` cordillera toward `Vale of Xanadu` and `Qiblai`:
    dx_b14 = X_exp - 968.0 + 2.2 * meta_nw['fbm1']
    dy_b14 = Y_exp - 1531.0 + 2.2 * meta_nw['fbm2']
    r_b14_fix = np.hypot(dx_b14 / 25.0, dy_b14 / 22.0)
    w_b14_fix = (1.0 - G.sstep(0.55, 1.18, r_b14_fix)) * d_twins_guard * (~whas_exp).astype(float)
    u_b14_ne = np.clip((X_exp - 936.0) / 52.0 + 0.55 * (1554.0 - Y_exp) / 50.0, 0.0, 1.25)
    ridge_facets_b14 = 240.0 * np.cos((X_exp - 960.0) * 0.28 + (Y_exp - 1530.0) * 0.22 + 1.6 * meta_nw['fbm1'])
    h_b14_buttress = (
        650.0
        + 3050.0 * (np.clip(u_b14_ne, 0.0, 1.15) ** 1.22)
        + ridge_facets_b14
        + 185.0 * meta_nw['fbm1']
        + 110.0 * meta_nw['fbm2']
    )
    En_exp = En_exp * (1.0 - w_b14_fix) + h_b14_buttress * w_b14_fix

    # (B) Settle Erewhon's Lake (`is_erewhon_lake`, `X = 774..906, Y = 1482..1534`) to `wlev = -520.0 m`,
    #     sculpt the steep faceted Northern Rift Escarpment (`Y = 1445..1483, X = 768..925`),
    #     and sculpt the dramatic knife-edged Southern Rift Horst Spine (`X = 772..904, Y = 1506..1555`) dividing
    #     Erewhon's Lake (`-520 m`) from the deep Lizardman Rift (`-2,600 m`), breached by the Broken Theodiga Dam (`908, 1535` at `-495 m`):
    in_erewhon_box = (X_exp >= 774.0) & (X_exp <= 906.0) & (Y_exp >= 1482.0) & (Y_exp <= 1534.0)
    is_erewhon_lake = in_erewhon_box & whas_exp & (np.hypot(X_exp - 800.0, Y_exp - 1503.0) > 2.6) & (np.hypot(X_exp - 908.0, Y_exp - 1535.0) > 3.2)
    whas_exp[in_erewhon_box & ~is_erewhon_lake] = False
    wlev_exp[in_erewhon_box & ~is_erewhon_lake] = np.nan
    wlev_exp[is_erewhon_lake] = -520.0
    d_in_erewhon = nd.distance_transform_edt(is_erewhon_lake)
    h_erewhon_bed = -545.0 - 245.0 * G.sstep(0.0, 7.5, d_in_erewhon) + 16.0 * meta_nw['fbm2']
    En_exp = np.where(is_erewhon_lake, np.minimum(En_exp, h_erewhon_bed), En_exp)

    # Steep Faceted Northern Rift Escarpment (`Y = 1444..1485, X = 766..928`), preserving authentic Rift-wall relief
    # and the sinuous Godshearth Spillway Canyon (`r107` around `X ~ 882`):
    d_out_erewhon = nd.distance_transform_edt(~is_erewhon_lake)
    u_n_slope = np.clip((1484.0 - Y_exp) / 36.0, 0.0, 1.0)
    w_n_vale_wall = (
        G.sstep(766.0, 778.0, X_exp) * (1.0 - G.sstep(914.0, 930.0, X_exp))
        * G.sstep(1443.0, 1451.0, Y_exp) * (1.0 - G.sstep(1483.0, 1490.0, Y_exp))
        * (~is_erewhon_lake).astype(float)
    )
    d_r107_gorge = np.abs(X_exp - (882.0 + 2.5 * np.sin((Y_exp - 1445.0) / 38.0 * math.pi)))
    w_r107_notch = 1.0 - G.sstep(1.8, 6.2, d_r107_gorge)
    h_n_vale_target = (
        -505.0
        + 3150.0 * (u_n_slope ** 1.18) * (1.0 - 0.42 * w_r107_notch)
        + 180.0 * G.sstep(0.0, 5.0, d_out_erewhon)
        + 160.0 * np.cos((X_exp - 780.0) * 0.24 - (Y_exp - 1460.0) * 0.18 + 1.4 * meta_nw['fbm1'])
        + 135.0 * meta_nw['fbm1']
        + 85.0 * meta_nw['fbm2']
    )
    En_exp = En_exp * (1.0 - w_n_vale_wall) + np.maximum(En_exp, h_n_vale_target) * w_n_vale_wall

    # Knife-Edged Southern Rift Horst Spine (`X = 772..904, Y = 1506..1555`) dividing Erewhon's Lake (`-520 m`)
    # from the deep Lizardman Rift (`-2,600 m`), while keeping `Erehwon (800, 1503)` on its dry `-485 m` lakeshore bench
    # and terminating at the Broken Theodiga Dam Gorge (`908, 1535` at `-495 m`):
    y_horst_crest = 1516.0 + 21.0 * np.clip((X_exp - 776.0) / 124.0, 0.0, 1.0) + 2.4 * meta_nw['fbm1']
    d_horst_crest = np.abs(Y_exp - y_horst_crest)
    w_erehwon_pad_guard = G.sstep(2.5, 6.8, np.hypot(X_exp - 800.0, Y_exp - 1503.0))
    w_theodiga_breach = 1.0 - G.sstep(4.5, 11.5, np.hypot(X_exp - 906.0, Y_exp - 1533.0))
    w_s_horst_ridge = (
        G.sstep(772.0, 784.0, X_exp) * (1.0 - G.sstep(898.0, 912.0, X_exp))
        * (1.0 - G.sstep(8.5, 19.5, d_horst_crest))
        * w_erehwon_pad_guard
        * (1.0 - 0.85 * w_theodiga_breach)
        * (~is_erewhon_lake).astype(float)
    )
    h_s_horst_crest = (
        980.0
        + 360.0 * np.sin((X_exp - 780.0) / 115.0 * math.pi)
        - 1380.0 * (G.sstep(0.0, 15.0, d_horst_crest) ** 1.25)
        + 185.0 * np.cos(X_exp * 0.35 + Y_exp * 0.25 + 1.8 * meta_nw['fbm1'])
        + 140.0 * meta_nw['fbm1']
        + 90.0 * meta_nw['fbm2']
    )
    En_exp = En_exp * (1.0 - w_s_horst_ridge) + np.maximum(En_exp, h_s_horst_crest) * w_s_horst_ridge

    # Sculpt the Broken Theodiga Dam Abutment & Upper Spillway Sill (`X = 892..928, Y = 1520..1548`, `-495..-320 m` at `908, 1535`):
    r_theo_sill = np.hypot((X_exp - 907.0) / 14.0, (Y_exp - 1534.0) / 11.0)
    w_erewhon_se_bench = (1.0 - G.sstep(0.55, 1.25, r_theo_sill)) * (~is_erewhon_lake).astype(float)
    h_erewhon_se_bench = -495.0 + 240.0 * G.sstep(1.5, 11.0, d_out_erewhon) + 65.0 * meta_nw['fbm1'] + 45.0 * meta_nw['fbm2']
    En_exp = En_exp * (1.0 - w_erewhon_se_bench) + h_erewhon_se_bench * w_erewhon_se_bench
    # Ensure all dry shoreline cells within 8 px of Erewhon's Lake (`wlev = -520 m`) are strictly >= `-510 m`:
    w_erewhon_collar = (1.0 - G.sstep(4.5, 9.5, d_out_erewhon)) * (~is_erewhon_lake).astype(float) * (1.0 - G.sstep(907.0, 914.0, X_exp))
    h_erewhon_collar_min = -510.0 + 42.0 * G.sstep(0.0, 6.5, d_out_erewhon)
    En_exp = np.where(w_erewhon_collar > 0.05, np.maximum(En_exp, h_erewhon_collar_min), En_exp)
    w_erewhon_se_bench = np.maximum(w_erewhon_se_bench, w_erewhon_collar)

    # (C) Organic Curved Lower Xanadu Graben Amphitheatre & Extended **Small Lake** (`is_xanadu_small_lake`,
    #     centered at `961.0, 1597.0`, `rx = 29.0, ry = 10.2`, spanning `X = 932..990, Y = 1586..1608`, `wlev = -1,685.0 m`, bed `-1,840.0 m`)
    #     so its eastern bay reaches right to the foot of the Oidong / Longsong hanging-valley cliff (`X = 990, Y = 1597.5`)
    #     where `r_oidong_cataract` (*Nahr Uydūng*, the river from Longsong's lake) falls off a `3,125 m` (`> 3.1 km`) sheer cataract directly into the lake!
    dx_slk = X_exp - 961.0 + 1.35 * meta_nw['fbm1'] + 0.65 * meta_nw['fbm2']
    dy_slk = Y_exp - 1597.0 + 1.15 * meta_nw['fbm2'] - 0.55 * meta_nw['fbm1']
    # Rotate ellipse slightly (-6 deg) so the extended Small Lake aligns from its western bay (`932, 1598`) to the eastern cataract foot (`990, 1597.5`):
    th_grb = math.radians(-6.0)
    ux_grb = dx_slk * math.cos(th_grb) + dy_slk * math.sin(th_grb)
    uy_grb = -dx_slk * math.sin(th_grb) + dy_slk * math.cos(th_grb)
    r_small_lake = np.hypot(ux_grb / 29.0, uy_grb / 10.2)
    is_xanadu_small_lake = (r_small_lake <= 1.0) & ~oval_protect_mask

    # Organic curvilinear Graben Amphitheatre mask (`w_low_xan_basin`) replacing the old boxy rectangle:
    # Follows the rotated elliptical graben around `(958, 1596)` plus the Theodiga Cataract Amphitheatre lobe `(916, 1556)`
    # and the Western Cataract Sill (`X = 872..934, Y = 1576..1636`), completely covering the old `Body 24` footprint:
    r_graben_main = np.hypot((ux_grb + 3.0 + 3.0 * meta_nw['fbm1']) / 56.0, (uy_grb - 1.0 + 3.0 * meta_nw['fbm2']) / 38.0)
    r_graben_theo = np.hypot((X_exp - 916.0 + 2.2 * meta_nw['fbm1']) / 26.0, (Y_exp - 1556.0 + 2.2 * meta_nw['fbm2']) / 26.0)
    r_graben_west = np.hypot((X_exp - 904.0 + 2.2 * meta_nw['fbm1']) / 34.0, (Y_exp - 1602.0 + 2.2 * meta_nw['fbm2']) / 28.0)
    r_graben_12 = np.minimum(r_graben_main, r_graben_theo) - 0.10 * np.log(1.0 + np.exp(-10.0 * np.abs(r_graben_main - r_graben_theo)))
    r_graben_comb = np.minimum(r_graben_12, r_graben_west) - 0.10 * np.log(1.0 + np.exp(-10.0 * np.abs(r_graben_12 - r_graben_west)))
    w_low_xan_basin = (
        (1.0 - G.sstep(0.78, 1.22, r_graben_comb))
        * G.sstep(871.0, 879.0, X_exp)
        * d_oval_guard
        * (~is_erewhon_lake).astype(float)
    )
    # Ensure 100% coverage over the cleared `Body 24` box (`X = 906..1004, Y = 1576..1640`) so zero `-2,599 m` hole remains:
    in_old_b24_clear = (X_exp >= 906.0) & (X_exp <= 1004.0) & (Y_exp >= 1576.0) & (Y_exp <= 1640.0) & ~oval_protect_mask & ~is_erewhon_lake
    w_low_xan_basin = np.where(in_old_b24_clear, np.maximum(w_low_xan_basin, d_oval_guard), w_low_xan_basin)

    # 3 Stepped Rift-Graben Structural Terraces & Escarpments inside the Lower Xanadu Amphitheatre (`X >= 930`),
    # plus a sheer `> 3.1 km` Eastern Cataract Headwall Cliff (`X = 990..1001`, rising from `-1,685 m` lake shore to `+1,440 m` Oidong brink),
    # plus 4 Stepped Low-Cataract Benches across the Western Bedrock Sill (`X = 872..931.5`, `-2,585 m -> -1,665 m`):
    d_from_slk_rim = np.maximum(0.0, r_small_lake[y0_xn:y1_xn, x0_xn:x1_xn] - 1.0)
    step1_grb = G.sstep(0.0, 0.45, d_from_slk_rim)
    step2_grb = G.sstep(0.42, 1.12, d_from_slk_rim)
    step3_grb = G.sstep(1.05, 2.25, d_from_slk_rim)
    # Sheer Eastern Cataract Headwall (`X = 989.5..1001.5`) rising 3,125 m right out of the eastern shore of the Small Lake:
    u_east_cat_cliff = G.sstep(989.5, 1001.5, px_xn + 0.8 * fbm1_xn) * (1.0 - G.sstep(16.0, 32.0, np.abs(py_xn - 1597.5)))
    # Western Cataract Sill ramp (`X = 872..931.5`): drops from `-1,665 m` at the western outlet of the Small Lake (`X = 931.5`)
    # in 4 cataract steps down to `-2,585 m` at the Lizardman Rift Lake (`X = 872`), flanked by steep N/S canyon walls:
    u_west_sill = np.clip((931.5 - px_xn) / (931.5 - 872.0), 0.0, 1.0)
    d_west_axis = np.abs(py_xn - (1598.5 + 2.0 * np.sin(u_west_sill * 2.0 * math.pi)))
    w_west_gorge_floor = (1.0 - G.sstep(4.5, 16.5, d_west_axis)) * G.sstep(0.0, 0.12, u_west_sill)
    west_sill_drop = (
        920.0 * (u_west_sill ** 1.08)
        + 42.0 * np.sin(u_west_sill * 4.0 * math.pi)
    ) * w_west_gorge_floor
    # Theodiga Escarpment cliff on the NW side (`Y = 1534..1574`):
    u_theo_cliff = 1.0 - G.sstep(1534.0, 1576.0, py_xn + 2.8 * fbm1_xn)
    h_low_xan_base = (
        -1665.0
        + 235.0 * step1_grb
        + 660.0 * step2_grb
        + 1520.0 * (step3_grb ** 1.22)
        + 2250.0 * (u_east_cat_cliff ** 1.15)
        - west_sill_drop
        + 920.0 * u_theo_cliff * (1.0 - G.sstep(932.0, 956.0, px_xn))
        + 680.0 * G.sstep(950.0, 982.0, px_xn) * (1.0 - G.sstep(1570.0, 1586.0, py_xn))
        + (0.42 * dE_xn_med + 0.52 * dE_xn_hp) * G.sstep(0.25, 0.95, d_from_slk_rim) * (1.0 - 0.75 * w_west_gorge_floor)
        + 55.0 * fbm1_xn
        + 38.0 * fbm2_xn
    )
    # Hard lower floor on `h_low_xan_sub`: everywhere around the Small Lake (`X >= 928`), dry land is strictly >= `-1,665 m + 160 m * d_from_slk_rim`
    # so the Small Lake (`wlev = -1,685 m`) is 100% recessed in a concave basin and never sticks up above its shores!
    min_floor_grb = np.where(
        px_xn >= 929.5,
        -1665.0 + 185.0 * G.sstep(0.0, 0.65, d_from_slk_rim) + 420.0 * G.sstep(0.65, 1.65, d_from_slk_rim) + 2150.0 * (u_east_cat_cliff ** 1.15),
        -1665.0 - west_sill_drop + 320.0 * G.sstep(4.0, 16.0, d_west_axis),
    )
    h_low_xan_sub = np.maximum(h_low_xan_base, min_floor_grb)
    w_lxb_sub = w_low_xan_basin[y0_xn:y1_xn, x0_xn:x1_xn]
    En_exp[y0_xn:y1_xn, x0_xn:x1_xn] = En_exp[y0_xn:y1_xn, x0_xn:x1_xn] * (1.0 - w_lxb_sub) + h_low_xan_sub * w_lxb_sub

    # (C2) Full-Width U-Shaped Oidong / Longsong Hanging Rift Valley (`X = 995..1152, Y = 1574..1620`), terminating
    #      in a sheer `> 3,125 m` (`3.1 km`) cataract cliff at `X = 990..1000` right at the eastern shore of the Small Lake:
    u_oid_x = np.clip((px_xn - 1000.0) / 147.0, 0.0, 1.0)
    y_oid_axis = (
        1598.0
        + 6.0 * u_oid_x
        + 3.2 * np.sin(u_oid_x * 3.0 * math.pi + 0.4)
        + 1.4 * fbm1_xn
    )
    d_oid_y = np.abs(py_xn - y_oid_axis)
    u_oid_wall = d_oid_y / 14.5
    w_oidong_valley_sub = (
        G.sstep(993.0, 1001.0, px_xn) * (1.0 - G.sstep(1143.0, 1152.0, px_xn))
        * (1.0 - G.sstep(0.65, 1.35, u_oid_wall))
        * d_oval_guard[y0_xn:y1_xn, x0_xn:x1_xn]
        * (~whas_exp[y0_xn:y1_xn, x0_xn:x1_xn]).astype(float)
    )
    # 3 Glacial/Tectonic Hanging-Valley Steps along Oidong Valley (`+1,440 m` at brink `X = 1000` -> `+1,998 m` at Longsong's Lake 32 outlet `X = 1147`),
    # rising steeply up U-shaped valley walls into the surrounding cordillera:
    h_oid_floor = (
        1440.0
        + 555.0 * (u_oid_x ** 1.08)
        + 38.0 * np.sin(u_oid_x * 3.0 * math.pi)
    )
    h_oid_u_prof = (
        h_oid_floor
        + 1650.0 * (G.sstep(0.18, 1.25, u_oid_wall) ** 1.65)
        + (0.45 * dE_xn_med + 0.55 * dE_xn_hp) * G.sstep(0.45, 1.10, u_oid_wall)
        + 45.0 * fbm1_xn
        + 32.0 * fbm2_xn
    )
    En_exp[y0_xn:y1_xn, x0_xn:x1_xn] = (
        En_exp[y0_xn:y1_xn, x0_xn:x1_xn] * (1.0 - w_oidong_valley_sub) + h_oid_u_prof * w_oidong_valley_sub
    )

    # Carve & fill the Extended Small Lake (`wlev = -1,685.0 m`, bed `-1,840.0 m` at center -> `-1,705.0 m` at shore):
    En_exp = np.where(is_xanadu_small_lake, -1840.0 + 135.0 * (r_small_lake ** 1.5), En_exp)
    whas_exp[is_xanadu_small_lake] = True
    wlev_exp[is_xanadu_small_lake] = -1685.0

    # (D) Carve the 3 Sinuous Cataract & Outflow Gorges of Xanadu:
    #   1. The Sinuous Great Tall Cataract (`Theodiga 903.5, 1529.5 -> Small Lake 938.5, 1587.0`, `-520 m -> -1,685 m`, `r070` / *Ālph*):
    theodiga_cat_ctrl = [
        (903.5, 1529.5,  -520.0, 4.2),
        (905.5, 1532.0,  -521.0, 4.0),
        (907.2, 1535.5,  -560.0, 4.4),
        (911.5, 1539.5,  -740.0, 5.0),
        (916.5, 1544.5,  -940.0, 5.5),  # Upper Theodiga Cataract plunge amphitheatre
        (918.5, 1550.0, -1080.0, 5.6),
        (915.0, 1555.5, -1180.0, 5.4),  # Sinuous S-bend around western rock bastion
        (914.0, 1561.0, -1280.0, 5.5),
        (918.5, 1566.0, -1420.0, 5.8),  # Lower Theodiga Cataract plunge
        (925.5, 1570.0, -1520.0, 6.0),
        (931.5, 1574.5, -1585.0, 6.2),
        (933.0, 1579.5, -1630.0, 6.4),
        (935.5, 1583.5, -1662.0, 6.5),
        (938.5, 1587.0, -1685.0, 6.8),
    ]
    #   2. The Sinuous Oidong / Longsong River & Great 3.1-km Eastern Cataract (`Longsong's Rift Lake 1147.5, 1604.5 -> Small Lake Eastern Shore 989.5, 1597.5`,
    #      `+2,000 m -> +1,440 m brink at X=1000 -> -1,685 m plunge directly into the Small Lake`, a `3,125 m` / `3.13 km` vertical cataract drop!):
    oidong_cat_ctrl = [
        (1147.5, 1604.5, 1998.0, 6.8),
        (1139.0, 1602.0, 1962.0, 6.8),
        (1130.0, 1598.5, 1928.0, 6.8),
        (1121.0, 1600.5, 1894.0, 6.8),
        (1112.0, 1604.0, 1860.0, 6.8),
        (1103.0, 1601.5, 1826.0, 6.8),
        (1094.0, 1597.0, 1792.0, 6.8),
        (1085.0, 1599.0, 1758.0, 6.8),
        (1076.0, 1603.0, 1724.0, 6.8),
        (1067.0, 1600.5, 1690.0, 6.8),
        (1058.0, 1596.5, 1656.0, 6.8),
        (1049.0, 1598.5, 1622.0, 6.8),
        (1040.0, 1601.5, 1588.0, 6.8),
        (1031.0, 1598.0, 1554.0, 6.6),
        (1024.0, 1596.0, 1522.0, 6.4),
        (1016.0, 1598.5, 1492.0, 6.4),
        (1008.0, 1601.0, 1465.0, 6.2),
        (1000.5, 1598.0, 1440.0, 5.8),  # Brink of the 3.1-km Great Eastern Cataract (+1,440 m)
        (996.5,  1596.5,  380.0, 6.2),  # Upper sheer cataract face (+380 m)
        (993.0,  1598.0, -720.0, 6.6),  # Lower sheer cataract plunge (-720 m)
        (989.5,  1597.5, -1685.0, 7.0), # Plunges directly into the eastern shore of the Small Lake (-1,685 m)!
    ]
    #   3. The Sinuous Western Outflow River & Series of 4 Low Cataracts (`Small Lake 932.0, 1598.0 -> Lizardman Rift Lake 871.5, 1599.0`, `-1,685 m -> -2,600 m`, `r_xanadu_low_cataracts`):
    west_low_cat_ctrl = [
        (932.0, 1598.0, -1685.0, 6.4),
        (927.0, 1596.0, -1715.0, 6.6),
        (921.5, 1595.0, -1890.0, 6.8),  # Low Cataract I
        (916.0, 1597.5, -1935.0, 6.8),
        (911.0, 1601.5, -1965.0, 6.8),
        (905.5, 1602.5, -2135.0, 7.0),  # Low Cataract II
        (900.0, 1599.5, -2175.0, 7.0),
        (895.0, 1596.0, -2205.0, 7.0),
        (889.5, 1595.5, -2375.0, 7.2),  # Low Cataract III
        (884.5, 1598.5, -2415.0, 7.2),
        (879.5, 1601.5, -2450.0, 7.2),
        (875.0, 1600.5, -2565.0, 7.4),  # Low Cataract IV
        (871.5, 1599.0, -2600.0, 7.6),  # Mouth in the Lizardman Rift Lake
    ]
    #   4. Opal Valley Sinuous Lower Connector (`(969, 1634) [+10 m] -> (964, 1629) [-320 m] -> (958, 1621) [-880 m] -> (960, 1613) [-1,340 m] -> (955, 1606) [-1,685 m]`):
    oval_mouth_ctrl = [
        (969.0, 1634.0,    10.0, 5.0),
        (964.0, 1629.0,  -320.0, 5.4),
        (958.0, 1621.0,  -880.0, 5.8),
        (960.0, 1613.0, -1340.0, 6.0),
        (955.0, 1606.0, -1685.0, 6.4),
    ]

    d2_xn_cat = np.full(px_xn.shape, 1e12, dtype=float)
    fl_xn_cat = En_exp[y0_xn:y1_xn, x0_xn:x1_xn].copy()
    hw_xn_cat = np.full(px_xn.shape, 6.2, dtype=float)
    for cat_ctrl in (theodiga_cat_ctrl, oidong_cat_ctrl, west_low_cat_ctrl, oval_mouth_ctrl):
        for i_cc in range(len(cat_ctrl) - 1):
            cx0, cy0, cf0, chw0 = cat_ctrl[i_cc]
            cx1, cy1, cf1, chw1 = cat_ctrl[i_cc + 1]
            for s_cc in np.linspace(0.0, 1.0, 14):
                qx_c = cx0 + s_cc * (cx1 - cx0)
                qy_c = cy0 + s_cc * (cy1 - cy0)
                qf_c = cf0 + s_cc * (cf1 - cf0)
                qhw_c = chw0 + s_cc * (chw1 - chw0)
                d2_c = (px_xn - qx_c) ** 2 + (py_xn - qy_c) ** 2
                better_c = d2_c < d2_xn_cat
                d2_xn_cat = np.where(better_c, d2_c, d2_xn_cat)
                fl_xn_cat = np.where(better_c, qf_c, fl_xn_cat)
                hw_xn_cat = np.where(better_c, qhw_c, hw_xn_cat)
    d_xn_cat = np.sqrt(d2_xn_cat)
    u_xn_cat = d_xn_cat / np.maximum(hw_xn_cat, 1.0)
    w_xn_cat_gorge = (
        ((1.0 - G.sstep(0.0, 1.22, u_xn_cat)) ** 1.38)
        * d_oval_guard[y0_xn:y1_xn, x0_xn:x1_xn]
        * (~whas_exp[y0_xn:y1_xn, x0_xn:x1_xn]).astype(float)
    )
    h_xn_cat_prof = fl_xn_cat + 340.0 * (G.sstep(0.0, 1.22, u_xn_cat) ** 1.48)
    En_xn_sub = En_exp[y0_xn:y1_xn, x0_xn:x1_xn]
    En_exp[y0_xn:y1_xn, x0_xn:x1_xn] = En_xn_sub * (1.0 - 0.94 * w_xn_cat_gorge) + np.minimum(En_xn_sub, h_xn_cat_prof) * (0.94 * w_xn_cat_gorge)

    # Analytical cataract foam/mist mask (`w_xanadu_cataract_foam`) for Step 5C microclimate & Step 6 painting:
    w_xanadu_cataract_foam = np.zeros((NEW_OH, NEW_OW), dtype=float)
    for cx_f, cy_f, rx_f, ry_f in [
        (915.0, 1543.5, 4.2, 5.2),  # Theodiga Great Cataract upper plunge
        (919.5, 1564.5, 4.4, 5.6),  # Theodiga Great Cataract lower plunge
        (995.5, 1597.5, 6.2, 4.4),  # Oidong / Longsong 3.1-km Great Eastern Cataract plunge right into the Small Lake
        (988.5, 1597.5, 5.2, 4.0),  # Oidong / Longsong Eastern Cataract lakeshore spray apron
        (921.5, 1595.5, 3.4, 2.8),  # Western Low Cataract I
        (905.5, 1602.0, 3.4, 2.8),  # Western Low Cataract II
        (889.5, 1596.0, 3.4, 2.8),  # Western Low Cataract III
        (875.5, 1600.0, 3.4, 2.8),  # Western Low Cataract IV
    ]:
        r_f = np.hypot((X_exp - cx_f) / rx_f, (Y_exp - cy_f) / ry_f)
        w_xanadu_cataract_foam = np.maximum(w_xanadu_cataract_foam, (1.0 - G.sstep(0.25, 1.15, r_f)) * (~whas_exp).astype(float))

    # Ensure the eastern bay of the Lizardman Rift Lake at `(871.5, 1599.0)` is wet at `-2,600.0 m`:
    r_liz_mouth = np.hypot(X_exp - 871.5, Y_exp - 1599.0)
    in_liz_mouth = r_liz_mouth <= 2.2
    whas_exp[in_liz_mouth] = True
    wlev_exp[in_liz_mouth] = -2600.0
    En_exp = np.where(in_liz_mouth, np.minimum(En_exp, -2625.0), En_exp)

    # Pin the Xanadu & Oidong settlement pads on dry ground (`Erehwon`, `Theodiga`, `Qiblai`, `Strongwall`, `Strongbow`, `Komodo`):
    xanadu_sett_pins = [
        (800, 1503, -485.0),  # Erehwon (south shore of Erewhon's lake)
        (908, 1535, -495.0),  # Theodiga (broken dam crest atop the Great Tall Cataract)
        (963, 1566,  331.0),  # Qiblai (Xanadu eastern bench)
        (914, 1634, -351.0),  # Strongwall (southern rim bench)
        (1026, 1594, 1535.0), # Strongbow (north bank of Nahr Uydūng in Oidong Valley)
        (865, 1617, -2452.0), # Komodo (south shore of the Lizardman Rift Lake)
    ]
    for sx_p, sy_p, sh_p in xanadu_sett_pins:
        r_sp = np.hypot(X_exp[sy_p - 2:sy_p + 3, sx_p - 2:sx_p + 3] - sx_p, Y_exp[sy_p - 2:sy_p + 3, sx_p - 2:sx_p + 3] - sy_p)
        w_sp = (1.0 - G.sstep(0.0, 2.2, r_sp)) * (~whas_exp[sy_p - 2:sy_p + 3, sx_p - 2:sx_p + 3]).astype(float)
        En_exp[sy_p - 2:sy_p + 3, sx_p - 2:sx_p + 3] = (
            En_exp[sy_p - 2:sy_p + 3, sx_p - 2:sx_p + 3] * (1.0 - w_sp) + sh_p * w_sp
        )
        whas_exp[sy_p, sx_p] = False
        wlev_exp[sy_p, sx_p] = np.nan
        En_exp[sy_p, sx_p] = sh_p

    # Save `En_xanadu_saved` over the rearranged Xanadu & Oidong envelope so we can re-assert it after `w_riv_carve`:
    w_xanadu_rearrange = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_xanadu_rearrange[y0_xn:y1_xn, x0_xn:x1_xn] = np.clip(
        np.maximum(
            np.maximum(
                np.maximum(w_n_vale_wall[y0_xn:y1_xn, x0_xn:x1_xn], w_s_horst_ridge[y0_xn:y1_xn, x0_xn:x1_xn]),
                np.maximum(w_erewhon_se_bench[y0_xn:y1_xn, x0_xn:x1_xn], w_oidong_valley_sub),
            ),
            np.maximum(w_low_xan_basin[y0_xn:y1_xn, x0_xn:x1_xn], w_xn_cat_gorge),
        ),
        0.0,
        1.0,
    )
    w_xanadu_rearrange = np.maximum(w_xanadu_rearrange, w_b14_fix)
    En_xanadu_saved = En_exp[y0_xn:y1_xn, x0_xn:x1_xn].copy()

    # Update & route the sinuous Xanadu & Oidong rivers in `rivers_exp`:
    alph_cataract_pts = [[round(c[0], 1), round(c[1], 1)] for c in theodiga_cat_ctrl]
    oidong_cataract_pts = [[round(c[0], 1), round(c[1], 1)] for c in oidong_cat_ctrl]
    west_low_cataract_pts = [[round(c[0], 1), round(c[1], 1)] for c in west_low_cat_ctrl]
    oval_river_pts = oval_river_pts + [[964.0, 1629.0], [958.0, 1621.0], [960.0, 1613.0], [955.0, 1606.0]]
    for r in rivers_exp:
        rid_x = str(r.get('id'))
        if rid_x in ('70', 'r070'):
            # Ālph: The Sinuous Great Tall Cataract river from Erewhon's lake past broken Theodiga into the Small Lake!
            r['kind'] = 'river'
            r['perennial'] = True
            r['order'] = 3
            r['px'] = copy.deepcopy(alph_cataract_pts)
            r['q_mouth'] = 520.0
            r['q_mouth_m3s'] = 520.0
            r['q_m3s'] = [round(380.0 + 140.0 * (i / float(len(alph_cataract_pts) - 1)), 1) for i in range(len(alph_cataract_pts))]
        elif rid_x in ('107', 'r107'):
            # Rīfar al-Jadwal: The notable trunk river of the Oidong Valley draining Longsong's Rift Lake (1147.5, 1604.5, +1,998 m)
            # through the 3 hanging-valley steps of Oidong to the cataract brink (1000.5, 1598.0, +1,440 m) and plunging 3,125 m (3.13 km)
            # over the Great Eastern Cataract directly into the eastern shore of the extended Small Lake (989.5, 1597.5, -1,685 m)!
            r['kind'] = 'river'
            r['perennial'] = True
            r['order'] = 4
            r['px'] = copy.deepcopy(oidong_cataract_pts)
            r['q_mouth'] = 780.0
            r['q_mouth_m3s'] = 780.0
            r['width_m'] = 135
            r['depth_m'] = 4.6
            r['q_m3s'] = [round(580.0 + 200.0 * (i / float(len(oidong_cataract_pts) - 1)), 1) for i in range(len(oidong_cataract_pts))]
            r['length_km'] = round(sum(math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 2.0 for p1, p2 in zip(oidong_cataract_pts, oidong_cataract_pts[1:])), 1)
        elif rid_x in ('682', 'r682'):
            r['kind'] = 'river'
            r['perennial'] = True
            r['order'] = 2
            r['px'] = copy.deepcopy(oval_river_pts)
            r['q_mouth'] = 115.0
            r['q_mouth_m3s'] = 115.0
            r['q_m3s'] = [round(18.0 + 97.0 * (i / float(len(oval_river_pts) - 1)), 1) for i in range(len(oval_river_pts))]
        elif rid_x in ('469', 'r469'):
            r['px'] = [[950.0, 1564.0], [947.5, 1571.0], [949.5, 1578.5], [947.0, 1586.5]]
            r['q_m3s'] = [18.0, 26.0, 34.0, 42.0]
        elif rid_x in ('640', 'r640'):
            r['px'] = [[971.0, 1574.0], [968.5, 1580.5], [970.5, 1586.5]]
            r['q_m3s'] = [16.0, 24.0, 32.0]
        elif rid_x in ('713', 'r713'):
            r['px'] = [[900.0, 1621.0], [902.5, 1614.0], [899.5, 1606.5], [900.0, 1599.5]]
            r['q_m3s'] = [15.0, 22.0, 30.0, 38.0]
        elif rid_x in ('585', 'r585'):
            # Gūlī al-Yāqūt: flows SW from the northern Oidong/Xanadu bench (1009, 1557.8) into the northern shore of the extended Small Lake (984.9, 1587.5):
            r['px'] = [[1009.0, 1557.8], [1005.0, 1564.0], [999.0, 1571.0], [992.0, 1579.0], [984.9, 1587.5]]
            r['q_m3s'] = [12.0, 18.0, 25.0, 32.0, 40.0]
        elif rid_x in ('683', 'r683'):
            # Gūlī al-Fiḍḍah: flows SW down the eastern bench of Vale of Xanadu (920.8, 1515.7) into Ālph (r070) at (907.2, 1535.5):
            r['px'] = [[920.8, 1515.7], [919.5, 1520.0], [916.5, 1525.0], [912.0, 1530.5], [907.2, 1535.5]]
            r['q_m3s'] = [12.0, 16.0, 20.0, 24.0, 28.0]
        elif rid_x in ('684', 'r684'):
            # Gūlī al-Dhahab: flows north down the southern wall of Oidong Valley into Rīfar al-Jadwal (r107) at (1112.0, 1604.0):
            r['px'] = [[1114.0, 1612.0], [1113.0, 1608.0], [1112.0, 1604.0]]
            r['q_m3s'] = [12.0, 18.0, 24.0]
        elif rid_x in ('786', 'r786'):
            r['px'] = [[1005.0, 1604.0], [999.5, 1601.5], [994.5, 1599.0], [989.5, 1597.5]]
            r['q_m3s'] = [14.0, 19.0, 24.0, 28.0]

    rivers_exp.append({
        'id': 'r_xanadu_low_cataracts',
        'kind': 'river',
        'perennial': True,
        'order': 4,
        'tongue': 'xanadui',
        'px': copy.deepcopy(west_low_cataract_pts),
        'q_mouth': 1180.0,
        'q_mouth_m3s': 1180.0,
        'width_m': 165,
        'depth_m': 5.4,
        'q_m3s': [round(1080.0 + 100.0 * (i / float(len(west_low_cataract_pts) - 1)), 1) for i in range(len(west_low_cataract_pts))],
        'length_km': round(sum(math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 2.0 for p1, p2 in zip(west_low_cataract_pts, west_low_cataract_pts[1:])), 1),
    })
    xanadu_paint_rivers = [alph_cataract_pts, oidong_cataract_pts, west_low_cataract_pts]

    # =========================================================================
    # 10E. Global River & Water Hydrological Sanity Pass (`High Rift`, `Longsong`,
    #      `Godshearth`, `Mid Basin`, `Silent Vales`, & Planetary Lake/River Audit):
    # =========================================================================
    # (1) Clean cliff-bleed wet cells and enforce flat hydrostatic water levels on the
    #     Eastmost Rift Lake (`Longsong`, `wlev = 2,000.2 m`) and the 4 High Rift Tarns:
    #     Also clear the tiny 4-px bleed puddle at `X = 1272..1276, Y = 1639..1644`:
    whas_exp[1639:1645, 1272:1276] = False
    wlev_exp[1639:1645, 1272:1276] = np.nan
    hr_lake_boxes = [
        # (x0, x1, y0, y1, flat_wlev, max_bed, max_shore_keep)
        (1145.0, 1214.0, 1592.0, 1622.0, 2000.2, 1988.0, 2025.0),  # Eastmost Rift Lake (Longsong)
        (1276.0, 1304.0, 1641.0, 1656.0, 2395.0, 2384.0, 2415.0),  # High Rift Tarn 1 (Opaline Tarn)
        (1348.0, 1362.0, 1655.0, 1666.0, 2580.2, 2568.0, 2600.0),  # High Rift Tarn 2
        (1421.0, 1441.0, 1629.0, 1640.0, 2880.1, 2868.0, 2900.0),  # High Rift Tarn 3
        (1485.0, 1499.0, 1629.0, 1638.0, 3120.0, 3108.0, 3140.0),  # High Rift Tarn 4 (Lake Cinnabar)
    ]
    for lx0_h, lx1_h, ly0_h, ly1_h, wl_h, bed_h, keep_h in hr_lake_boxes:
        in_box_h = (X_exp >= lx0_h) & (X_exp <= lx1_h) & (Y_exp >= ly0_h) & (Y_exp <= ly1_h)
        bleed_h = in_box_h & whas_exp & (En_exp > keep_h)
        whas_exp[bleed_h] = False
        wlev_exp[bleed_h] = np.nan
        clean_h = in_box_h & whas_exp
        wlev_exp[clean_h] = wl_h
        En_exp = np.where(clean_h, np.minimum(En_exp, bed_h), En_exp)
    # Ensure Longsong `(1192, 1617)` sits on dry lakeshore at `+2,012.0 m`:
    whas_exp[1616:1619, 1191:1194] = False
    wlev_exp[1616:1619, 1191:1194] = np.nan
    En_exp[1617, 1192] = 2012.0

    # (2) Carve a continuous axial valley swale along the High Rift & Longsong valley floor (`X = 1208..1564, Y = 1605..1684`)
    #     and reroute `r_hr_verdigris` (*Verdigris Beck*), `r_hr_jokulhlaup` (*Brant-Fell Gill*), and `r105` (*Bīruk al-Ghaym*)
    #     strictly along the green/cyan valley bottom and dry southern tarn shores (zero cliff-wall climbing, zero lake-crossing!):
    hr_verdigris_pts = [
        [1558.2, 1642.6], [1551.0, 1643.5], [1543.5, 1645.0], [1535.5, 1644.2],
        [1527.5, 1643.0], [1519.5, 1644.2], [1511.5, 1643.5], [1503.5, 1641.2],
        [1497.5, 1639.5], [1491.5, 1639.8], [1485.5, 1639.5],  # Dry south shore of Tarn 4 (Lake Cinnabar, Y=1631..1636, 3,120 m)
        [1478.0, 1638.0], [1470.0, 1636.8], [1462.0, 1637.2], [1454.0, 1636.8],
        [1446.0, 1638.0], [1438.5, 1640.5], [1431.0, 1641.0], [1423.5, 1640.5],  # Dry south shore of Tarn 3 (Y=1631..1638, 2,880 m)
        [1416.0, 1643.0], [1408.5, 1647.5], [1401.0, 1652.8], [1393.5, 1658.2],
        [1386.0, 1662.2], [1378.0, 1664.2], [1370.0, 1664.2], [1362.5, 1665.5],
        [1355.5, 1666.8], [1348.5, 1667.2],  # Dry south shore of Tarn 2 (Y=1657..1664, 2,580 m)
        [1341.0, 1669.0], [1333.5, 1668.2], [1326.0, 1665.2], [1318.5, 1660.2],
        [1311.0, 1655.0], [1305.5, 1652.2], [1301.5, 1650.5],  # Enters eastern shore of Tarn 1 (Opaline Tarn, X=1277..1302, 2,395 m)
    ]
    hr_jokulhlaup_pts = [
        [1504.0, 1676.0], [1495.0, 1674.8], [1485.5, 1675.8], [1476.0, 1674.2],
        [1466.5, 1672.5], [1457.0, 1673.5], [1447.5, 1674.5], [1438.0, 1673.0],
        [1428.5, 1670.2], [1419.0, 1667.5], [1409.5, 1666.0], [1400.0, 1664.5],
        [1390.0, 1663.8], [1380.0, 1664.2], [1370.0, 1664.2],
    ]
    r105_longsong_pts = [
        [1277.0, 1647.5], [1269.0, 1643.5], [1261.0, 1639.0], [1253.0, 1634.5],
        [1245.0, 1630.0], [1237.0, 1625.5], [1229.0, 1621.0], [1220.5, 1616.5],
        [1211.5, 1613.5],
    ]
    y0_hrv, y1_hrv, x0_hrv, x1_hrv = 1602, 1686, 1204, 1566
    px_hrv = X_exp[y0_hrv:y1_hrv, x0_hrv:x1_hrv]
    py_hrv = Y_exp[y0_hrv:y1_hrv, x0_hrv:x1_hrv]
    d2_hrv = np.full(px_hrv.shape, 1e12, dtype=float)
    fl_hrv = En_exp[y0_hrv:y1_hrv, x0_hrv:x1_hrv].copy()
    for pts_hr_seg, e0_hr, e1_hr in [
        (hr_verdigris_pts, 3580.0, 2398.0),
        (hr_jokulhlaup_pts, 3780.0, 2610.0),
        (r105_longsong_pts, 2392.0, 2003.0),
    ]:
        els_hr_seg = np.linspace(e0_hr, e1_hr, len(pts_hr_seg))
        for i_hs in range(len(pts_hr_seg) - 1):
            hx0, hy0 = pts_hr_seg[i_hs]
            hx1, hy1 = pts_hr_seg[i_hs + 1]
            he0, he1 = els_hr_seg[i_hs], els_hr_seg[i_hs + 1]
            for s_hs in np.linspace(0.0, 1.0, 10):
                qx_h = hx0 + s_hs * (hx1 - hx0)
                qy_h = hy0 + s_hs * (hy1 - hy0)
                qe_h = he0 + s_hs * (he1 - he0)
                d2_h = (px_hrv - qx_h) ** 2 + (py_hrv - qy_h) ** 2
                better_h = d2_h < d2_hrv
                d2_hrv = np.where(better_h, d2_h, d2_hrv)
                fl_hrv = np.where(better_h, qe_h, fl_hrv)
    u_hrv = np.sqrt(d2_hrv) / 6.2
    w_hrv_swale = ((1.0 - G.sstep(0.0, 1.15, u_hrv)) ** 1.38) * (~whas_exp[y0_hrv:y1_hrv, x0_hrv:x1_hrv]).astype(float)
    h_hrv_prof = fl_hrv + 320.0 * (G.sstep(0.0, 1.15, u_hrv) ** 1.45)
    En_hrv_sub = En_exp[y0_hrv:y1_hrv, x0_hrv:x1_hrv]
    En_exp[y0_hrv:y1_hrv, x0_hrv:x1_hrv] = En_hrv_sub * (1.0 - 0.90 * w_hrv_swale) + np.minimum(En_hrv_sub, h_hrv_prof) * (0.90 * w_hrv_swale)

    for r in rivers_exp:
        rid_h = str(r.get('id'))
        if rid_h == 'r_hr_verdigris':
            r['kind'] = 'river'
            r['perennial'] = True
            r['order'] = 3
            r['px'] = copy.deepcopy(hr_verdigris_pts)
            r['q_mouth'] = 460.0
            r['q_mouth_m3s'] = 460.0
            r['q_m3s'] = [round(35.0 + 425.0 * (i / float(len(hr_verdigris_pts) - 1)), 1) for i in range(len(hr_verdigris_pts))]
        elif rid_h == 'r_hr_jokulhlaup':
            r['kind'] = 'river'
            r['perennial'] = True
            r['order'] = 2
            r['px'] = copy.deepcopy(hr_jokulhlaup_pts)
            r['q_mouth'] = 220.0
            r['q_mouth_m3s'] = 220.0
            r['q_m3s'] = [round(28.0 + 192.0 * (i / float(len(hr_jokulhlaup_pts) - 1)), 1) for i in range(len(hr_jokulhlaup_pts))]
        elif rid_h in ('105', 'r105'):
            # Bīruk al-Ghaym: The notable Longsong valley trunk river connecting Opaline Tarn (1277.0, 1647.5, +2,395 m)
            # down the green/cyan Longsong valley floor into the eastern shore of Longsong's Rift Lake (1211.5, 1613.5, +2,000.2 m)!
            r['kind'] = 'river'
            r['perennial'] = True
            r['order'] = 3
            r['px'] = copy.deepcopy(r105_longsong_pts)
            r['q_mouth'] = 580.0
            r['q_mouth_m3s'] = 580.0
            r['width_m'] = 112
            r['depth_m'] = 4.1
            r['q_m3s'] = [round(460.0 + 120.0 * (i / float(len(r105_longsong_pts) - 1)), 1) for i in range(len(r105_longsong_pts))]
        elif rid_h in ('418', 'r418'):
            # Gūlī al-Zumurrud: valley-floor tributary joining Bīruk al-Ghaym (r105) at (1253.0, 1634.5):
            r['px'] = [[1266.0, 1633.5], [1259.5, 1634.0], [1253.0, 1634.5]]
            r['q_m3s'] = [14.0, 22.0, 30.0]
        elif rid_h in ('252', 'r252'):
            # Bīruk al-Dhahab: valley-floor stream joining Bīruk al-Ghaym (r105) at (1220.5, 1616.5):
            r['px'] = [[1235.0, 1615.5], [1228.0, 1616.0], [1220.5, 1616.5]]
            r['q_m3s'] = [15.0, 22.0, 30.0]
        elif rid_h in ('521', 'r521'):
            r['px'] = [[1182.0, 1621.5], [1184.5, 1619.2], [1187.0, 1617.5]]
            r['q_m3s'] = [12.0, 18.0, 24.0]
        elif rid_h in ('532', 'r532'):
            r['px'] = [[1239.0, 1614.5], [1237.0, 1618.0], [1235.0, 1621.5], [1233.0, 1623.5]]
            r['q_m3s'] = [12.0, 16.0, 20.0, 24.0]
        elif rid_h in ('559', 'r559'):
            r['px'] = [[1215.0, 1603.5], [1213.5, 1606.0], [1212.0, 1608.5]]
            r['q_m3s'] = [12.0, 16.0, 20.0]
        elif rid_h in ('570', 'r570'):
            r['px'] = [[1293.0, 1658.5], [1292.0, 1656.0], [1291.3, 1653.8]]
            r['q_m3s'] = [12.0, 18.0, 24.0]
        elif rid_h in ('649', 'r649'):
            r['px'] = [[1160.0, 1593.5], [1159.5, 1595.5], [1159.1, 1597.5]]
            r['q_m3s'] = [12.0, 16.0, 20.0]
        elif rid_h in ('671', 'r671'):
            r['px'] = [[1219.5, 1607.5], [1220.5, 1609.8], [1221.2, 1611.8]]
            r['q_m3s'] = [12.0, 16.0, 20.0]
        elif rid_h in ('676', 'r676'):
            r['px'] = [[1146.5, 1594.5], [1147.0, 1597.0], [1147.5, 1599.5]]
            r['q_m3s'] = [12.0, 16.0, 20.0]
        elif rid_h in ('804', 'r804'):
            r['px'] = [[1282.0, 1657.5], [1281.0, 1655.5], [1280.0, 1653.8]]
            r['q_m3s'] = [12.0, 16.0, 20.0]
        elif rid_h in ('863', 'r863'):
            # Trim Dip Rivrh (`r863`) at the Ring Sea coastline (`(688.5, 910.8)`) so it does not run across the Ring Sea:
            r['px'] = [[688.5, 914.5], [688.5, 912.5], [688.5, 910.8]]
            r['q_m3s'] = [18.0, 24.0, 30.0]
        elif rid_h == 'r_mb_siphon_breach':
            # Start `r_mb_siphon_breach` at the southern outlet shore of the Mid Basin lake (`index >= 22`) so it never crosses the lake:
            pts_mbs = r.get('px') or []
            if len(pts_mbs) > 23:
                r['px'] = pts_mbs[22:]
                if 'q_m3s' in r and len(r['q_m3s']) >= len(r['px']):
                    r['q_m3s'] = r['q_m3s'][-len(r['px']):]
            r['kind'] = 'river'
            r['perennial'] = True
            r['q_mouth'] = 340.0
            r['q_mouth_m3s'] = 340.0

    # Ensure every perennial / custom river in `rivers_exp` has `kind = 'river'` and `q_mouth_m3s` populated for the 3D overlay renderer:
    for r in rivers_exp:
        if r.get('kind') == 'perennial':
            r['kind'] = 'river'
            r['perennial'] = True
        if r.get('q_mouth_m3s') is None:
            qm_val = r.get('q_mouth')
            if qm_val is None and r.get('q_m3s'):
                qm_val = r['q_m3s'][-1]
            r['q_mouth_m3s'] = float(qm_val if qm_val is not None else (180.0 if r.get('kind') == 'river' else 8.0))
            if r.get('q_mouth') is None:
                r['q_mouth'] = r['q_mouth_m3s']

    # (3) Automated Planetary River-vs-Lake Interior Crossing Guard:
    #     Ensure zero rivers have interior vertices (`1 .. len-2`) sitting inside a lake (`whas_exp == True`, `|wlev| > 1.5 m`):
    #     - If a river's tail enters a lake early before its final vertex, trim the tail to the first lake-entry vertex.
    #     - If a river's head starts inside a lake, trim the head to the last lake-exit vertex.
    #     - If a mid-river vertex grazes a 1-px shoreline cell, nudge it to the lowest-elevation dry neighbor cell (`r <= 2 px`).
    for r in rivers_exp:
        pts_chk = r.get('px') or []
        if len(pts_chk) < 3:
            continue
        # Trim early lake entry at tail:
        while len(pts_chk) >= 3:
            iy_t1 = min(NEW_OH - 1, max(0, int(round(pts_chk[-2][1]))))
            ix_t1 = min(NEW_OW - 1, max(0, int(round(pts_chk[-2][0]))))
            iy_t0 = min(NEW_OH - 1, max(0, int(round(pts_chk[-1][1]))))
            ix_t0 = min(NEW_OW - 1, max(0, int(round(pts_chk[-1][0]))))
            if whas_exp[iy_t1, ix_t1] and whas_exp[iy_t0, ix_t0] and abs(float(np.nan_to_num(wlev_exp[iy_t1, ix_t1], nan=0.0))) > 1.5:
                pts_chk.pop()
            else:
                break
        # Trim lake-interior head vertices:
        while len(pts_chk) >= 3:
            iy_h0 = min(NEW_OH - 1, max(0, int(round(pts_chk[0][1]))))
            ix_h0 = min(NEW_OW - 1, max(0, int(round(pts_chk[0][0]))))
            iy_h1 = min(NEW_OH - 1, max(0, int(round(pts_chk[1][1]))))
            ix_h1 = min(NEW_OW - 1, max(0, int(round(pts_chk[1][0]))))
            if whas_exp[iy_h0, ix_h0] and whas_exp[iy_h1, ix_h1]:
                pts_chk.pop(0)
            else:
                break
        # Nudge any remaining interior vertex (`1 .. len-2`) that grazes a lake cell onto the nearest dry shore cell:
        for k_m in range(1, len(pts_chk) - 1):
            mx_p, my_p = pts_chk[k_m]
            iy_m = min(NEW_OH - 1, max(0, int(round(my_p))))
            ix_m = min(NEW_OW - 1, max(0, int(round(mx_p))))
            if whas_exp[iy_m, ix_m] and abs(float(np.nan_to_num(wlev_exp[iy_m, ix_m], nan=0.0))) > 1.5:
                best_d2 = 1e9
                best_xy = (mx_p, my_p)
                for dy_n in range(-3, 4):
                    for dx_n in range(-3, 4):
                        ny_n = min(NEW_OH - 1, max(0, iy_m + dy_n))
                        nx_n = min(NEW_OW - 1, max(0, ix_m + dx_n))
                        if not whas_exp[ny_n, nx_n]:
                            d2_n = (nx_n - mx_p) ** 2 + (ny_n - my_p) ** 2
                            if d2_n < best_d2:
                                best_d2 = d2_n
                                best_xy = (float(nx_n), float(ny_n))
                pts_chk[k_m] = [round(best_xy[0], 1), round(best_xy[1], 1)]
        r['px'] = pts_chk
        if 'q_m3s' in r and len(r['q_m3s']) != len(pts_chk):
            q_start = float(r['q_m3s'][0]) if r['q_m3s'] else 18.0
            q_end = float(r['q_m3s'][-1]) if r['q_m3s'] else float(r.get('q_mouth') or 120.0)
            r['q_m3s'] = [round(q_start + (q_end - q_start) * (i / float(max(1, len(pts_chk) - 1))), 1) for i in range(len(pts_chk))]

    # Recompute `d_to_water_px` and `wlev_nearest` from the updated `whas_exp` & `wlev_exp` before global river carving!
    del (
        E_xn_s14, E_xn_s2, E_xn_s6, En_hrv_sub, En_xn_orig, En_xn_sub, d2_hrv, d2_xn_cat,
        dE_xn_hp, dE_xn_med, d_horst_crest, d_in_erewhon, d_oid_y, d_out_erewhon, d_oval_guard,
        d_r107_gorge, d_twins_guard, d_west_axis, d_xn_cat, dx_b14, dx_slk, dy_b14, dy_slk,
        fbm1_xn, fbm2_xn, fl_hrv, fl_xn_cat, h_b14_buttress, h_erewhon_bed, h_erewhon_collar_min,
        h_erewhon_se_bench, h_hrv_prof, h_low_xan_base, h_low_xan_sub, h_n_vale_target, h_oid_floor,
        h_oid_u_prof, h_s_horst_crest, h_xn_cat_prof, hw_xn_cat, in_erewhon_box, in_old_b24_clear,
        min_floor_grb, px_hrv, py_hrv, r_b14_fix, r_graben_12, r_graben_comb, r_graben_main,
        r_graben_theo, r_graben_west, r_liz_mouth, r_small_lake, r_theo_sill, ridge_facets_b14,
        step1_grb, step2_grb, step3_grb, u_b14_ne, u_east_cat_cliff, u_hrv, u_n_slope, u_oid_wall,
        u_oid_x, u_theo_cliff, u_west_sill, u_xn_cat, ux_grb, uy_grb, w_b14_fix, w_erehwon_pad_guard,
        w_erewhon_collar, w_erewhon_se_bench, w_hrv_swale, w_low_xan_basin, w_lxb_sub, w_n_vale_wall,
        w_oidong_valley_sub, w_r107_notch, w_s_horst_ridge, w_suppress_art, w_theodiga_breach,
        w_west_gorge_floor, w_xn_cat_gorge, west_sill_drop, y_horst_crest, y_oid_axis,
    )
    gc.collect()
    d_to_water_px, (w_iy, w_ix) = nd.distance_transform_edt(~whas_exp, return_indices=True)
    wlev_nearest = np.where(whas_exp, wlev_exp, wlev_exp[w_iy, w_ix])
    wlev_nearest = np.nan_to_num(wlev_nearest, nan=0.0)

    # Save pre-river-incision hillshade so we can transfer the newly carved river-bank shading onto `t_pad` & `st_pad`!
    En_pre_riv = En_exp.copy()
    shade_pre_riv = compute_clean_hillshade(En_pre_riv, zf=5.0, az_deg=315.0, alt_deg=45.0)

    # Carve continuous, gently sloped fluvial channels & valleys into `En_exp` along ALL rivers in `rivers_exp`!
    En_smooth_ref = nd.gaussian_filter(En_exp, sigma=2.8)
    riv_seed_mask = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    riv_bed_grid = En_exp.copy()
    riv_depth_grid = np.zeros((NEW_OH, NEW_OW), dtype=float)
    riv_hw_grid = np.full((NEW_OH, NEW_OW), 4.5, dtype=float)

    for r in rivers_exp:
        pts_r = r.get('px') or []
        if len(pts_r) < 2:
            continue
        q_m = float(r.get('q_mouth') or 250.0)
        hw_r = float(np.clip(3.8 + 1.15 * math.log10(max(20.0, q_m)), 4.2, 8.8))
        depth_r = float(np.clip(8.0 + 5.5 * math.log10(max(20.0, q_m)), 10.0, 26.0))

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
            if whas_exp[iy, ix] or vent_guard[iy, ix]:
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
    # Taper river carving smoothly within 2 px of lake/sea shorelines (`d_to_water_px`) and exclude `vent_guard`
    w_water_taper = G.sstep(0.0, 2.2, d_to_water_px) * (~whas_exp).astype(float) * (~vent_guard).astype(float)
    w_riv_carve = ((1.0 - G.sstep(0.0, 1.0, u_riv)) ** 1.25) * w_water_taper

    # Safe lower bound on dry land: in `is_new_area`, positive-elevation land stays >= 1.8 m;
    # in the old interior (`~is_new_area`), endorheic sub-zero basins go down to -3,200 m so never clamp to +1.8 m!
    floor_safe = np.where(is_new_area, 1.8, En_exp - depth_near - 15.0)
    min_safe_riv = np.where(
        d_to_water_px <= 8.0,
        np.maximum(floor_safe, np.minimum(En_exp - 2.0, wlev_nearest + 1.8)),
        floor_safe,
    )
    h_riv_profile = np.maximum(min_safe_riv, bed_near + depth_near * (G.sstep(0.0, 1.0, u_riv) ** 1.35))
    En_exp = En_exp * (1.0 - 0.90 * w_riv_carve) + np.minimum(En_exp, h_riv_profile) * (0.90 * w_riv_carve)

    # Re-assert dry land >= 1.8 m in `is_new_area` after river channel carving
    dry_new_final = is_new_area & ~whas_exp
    En_exp = np.where(dry_new_final, np.maximum(En_exp, 1.8), En_exp)

    # Re-assert volcanic summit edifices on En_exp[DY:, DX:] so no river-channel blur touches a cone rim or crater floor:
    En_exp[DY:, DX:] = En_exp[DY:, DX:] * (1.0 - w_volc_reassert) + En1_volc * w_volc_reassert
    del En1_volc, w_volc_reassert
    gc.collect()

    # Grade the final coastal reach of Līng-Mā (`r002`) into the 0.0 m sea-level estuary and pin Farport's bluff plateau:
    whas_exp[587:589, 278:291] = True
    wlev_exp[587:589, 278:291] = 0.0
    En_exp[587:589, 278:291] = np.minimum(En_exp[587:589, 278:291], -8.5)
    whas_exp[587:590, 293:296] = False
    wlev_exp[587:590, 293:296] = np.nan
    En_exp[588, 294] = 212.0

    # Ensure Outland Gate River (`id == 9106`) stays on dry valley floor until its final mouth vertex at Spider Lake,
    # and ensure estuarine mouths (`9101`, `9103`, `r002`) have smooth shallow channel beds (`-2.5 m -> -12.0 m`) without deep holes:
    for r in rivers_exp:
        pts_og = r.get('px') or []
        if r.get('id') == 9106 and len(pts_og) >= 2:
            for px_o, py_o in pts_og[:-1]:
                iy_o = min(NEW_OH - 1, max(0, int(round(py_o))))
                ix_o = min(NEW_OW - 1, max(0, int(round(px_o))))
                if whas_exp[iy_o, ix_o]:
                    whas_exp[iy_o, ix_o] = False
                    wlev_exp[iy_o, ix_o] = np.nan
                    En_exp[iy_o, ix_o] = max(float(En_exp[iy_o, ix_o]), 1462.0)
        if r.get('id') in (9101, 9103, 9107) and len(pts_og) >= 2:
            entered_sea = False
            for k_e, (px_e, py_e) in enumerate(pts_og):
                iy_e = min(NEW_OH - 1, max(0, int(round(py_e))))
                ix_e = min(NEW_OW - 1, max(0, int(round(px_e))))
                if whas_exp[iy_e, ix_e] and abs(float(np.nan_to_num(wlev_exp[iy_e, ix_e], nan=0.0))) <= 1.0:
                    entered_sea = True
                if entered_sea:
                    whas_exp[iy_e, ix_e] = True
                    wlev_exp[iy_e, ix_e] = 0.0
                    frac_e = k_e / max(1.0, float(len(pts_og) - 1))
                    En_exp[iy_e, ix_e] = -2.5 - 9.5 * frac_e

    # Enforce strict monotonic downhill terrain on `En_exp` along every river centerline (2 passes for shared confluences) and record `bed_m`!
    vent_summit_core = np.zeros((NEW_OH, NEW_OW), dtype=bool)
    for v_item in list(vents_1393) + list(meta_nw['new_vents']):
        if 'peak' not in v_item:
            continue
        vx_i, vy_i = v_item['px']
        if v_item in vents_1393:
            vx_i, vy_i = vx_i + DX, vy_i + DY
        vent_summit_core |= (np.hypot(X_exp - vx_i, Y_exp - vy_i) <= 2.5)

    # Re-assert the Southern Inner Wall scarp (`w_s_inner_scarp`) outside river channel seeds (`~riv_seed_mask`)
    # so river valley-width smoothing never blurs the 4-5 cell step or cloud-forest bench, while keeping Spirladunon locked:
    w_scarp_post = w_s_inner_scarp * (~riv_seed_mask).astype(float)
    En_exp = En_exp * (1.0 - w_scarp_post) + h_scarp_remap * w_scarp_post
    En_exp[1017, 800] = spirl_e_orig

    # Re-assert Greenstep's 5 ponded flood-basalt lava terraces (`h_gval_cord`) and 6 showcase station pins after `w_riv_carve`
    # so the global river-valley width smoothing never blurs the 4 lobate columnar-basalt risers across the valley floor:
    En_exp[y0_gv:y1_gv, x0_gv:x1_gv] = (
        En_exp[y0_gv:y1_gv, x0_gv:x1_gv] * (1.0 - w_gv_sub) + h_gval_cord * w_gv_sub
    )
    for st_x, st_y, st_h in greenstep_station_pins:
        r_st = np.hypot(X_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] - st_x, Y_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] - st_y)
        w_st_pin = (1.0 - G.sstep(0.0, 2.4, r_st)) * (~riv_seed_mask[st_y - 3:st_y + 4, st_x - 3:st_x + 4]).astype(float)
        En_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] = (
            En_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] * (1.0 - w_st_pin) + st_h * w_st_pin
        )
        En_exp[st_y, st_x] = st_h

    # Re-assert Shumar's Continental Highland bench (`h_shumar_cord`) outside incised river channel seeds (`~riv_seed_mask`)
    # so river valley-width smoothing never pulls Shumar's NW rim below the Continental `tc <= 0 C` threshold:
    w_sh_post = w_sh_sub * (~riv_seed_mask[y0_sh:y1_sh, x0_sh:x1_sh]).astype(float)
    En_exp[y0_sh:y1_sh, x0_sh:x1_sh] = (
        En_exp[y0_sh:y1_sh, x0_sh:x1_sh] * (1.0 - w_sh_post) + h_shumar_cord * w_sh_post
    )
    del h_shumar_cord, w_sh_sub, w_sh_post
    gc.collect()

    # Re-assert Labyrinth's Noctis Labyrinthus grabens, E/NE Chaos mesas, 8 lakes, W/S map-edge barrier, and Firebliss Range outside river seeds (`~riv_seed_mask`):
    w_lb_post = np.clip(w_lb_dome_env + w_chaos_total + w_map_edge_airless, 0.0, 1.0) * (~riv_seed_mask[y0_lb:y1_lb, x0_lb:x1_lb] | is_lab_lake_sub).astype(float)
    En_exp[y0_lb:y1_lb, x0_lb:x1_lb] = (
        En_exp[y0_lb:y1_lb, x0_lb:x1_lb] * (1.0 - w_lb_post) + h_lab_final * w_lb_post
    )
    w_fb_post = np.clip(w_fb_apply + w_fb_w_airless, 0.0, 1.0) * (~riv_seed_mask[y0_fb:y1_fb, x0_fb:x1_fb] | is_fb_lake_sub).astype(float)
    En_exp[y0_fb:y1_fb, x0_fb:x1_fb] = (
        En_exp[y0_fb:y1_fb, x0_fb:x1_fb] * (1.0 - w_fb_post) + h_fb_work * w_fb_post
    )

    # Re-assert the rearranged Xanadu & Oidong terrain (`En_xanadu_saved`) outside river channel seeds (`~riv_seed_mask`) and re-pin `xanadu_sett_pins`:
    w_xn_post = w_xanadu_rearrange[y0_xn:y1_xn, x0_xn:x1_xn] * (~riv_seed_mask[y0_xn:y1_xn, x0_xn:x1_xn]).astype(float)
    En_exp[y0_xn:y1_xn, x0_xn:x1_xn] = (
        En_exp[y0_xn:y1_xn, x0_xn:x1_xn] * (1.0 - w_xn_post) + En_xanadu_saved * w_xn_post
    )
    # Ensure zero dry cells around the Small Lake (`X >= 931.5`) are ever below `-1,675 m` (`10 m` above the `-1,685 m` lake surface):
    dry_slk_collar = (~whas_exp[y0_xn:y1_xn, x0_xn:x1_xn]) & (px_xn >= 931.5) & (px_xn <= 1004.0) & (py_xn >= 1568.0) & (py_xn <= 1640.0)
    En_exp[y0_xn:y1_xn, x0_xn:x1_xn] = np.where(
        dry_slk_collar,
        np.maximum(En_exp[y0_xn:y1_xn, x0_xn:x1_xn], -1675.0 + 145.0 * G.sstep(0.0, 0.65, d_from_slk_rim)),
        En_exp[y0_xn:y1_xn, x0_xn:x1_xn],
    )
    del (
        w_lb_dome_env, w_chaos_total, w_map_edge_airless, h_lab_final, w_lb_post,
        w_fb_apply, w_fb_w_airless, h_fb_work, w_fb_post,
        En_xanadu_saved, w_xn_post, dry_slk_collar, px_xn, py_xn, d_from_slk_rim,
        w_s_inner_scarp, h_scarp_remap, w_scarp_post, h_gval_cord, w_gv_sub,
    )
    gc.collect()
    for sx_p, sy_p, sh_p in xanadu_sett_pins:
        En_exp[sy_p, sx_p] = sh_p
        whas_exp[sy_p, sx_p] = False
        wlev_exp[sy_p, sx_p] = np.nan

    # Re-assert the 4 `godshearth` showcase station pins on dry ground after river valley smoothing:
    for st_x, st_y, st_h in [(836, 1388, 3740.0), (844, 1394, 3645.0), (848, 1375, 4120.0), (845, 1422, 3380.0)]:
        r_st = np.hypot(X_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] - st_x, Y_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] - st_y)
        w_st_pin = (1.0 - G.sstep(0.0, 2.8, r_st)) * (~is_gh_lake[st_y - 3:st_y + 4, st_x - 3:st_x + 4]).astype(float)
        En_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] = (
            En_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] * (1.0 - w_st_pin) + st_h * w_st_pin
        )

    # Re-assert the 6 `SE outer wall` showcase station pins on dry ground after river valley smoothing:
    for st_x, st_y, st_h in seow_station_pins:
        r_st = np.hypot(X_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] - st_x, Y_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] - st_y)
        w_st_pin = (1.0 - G.sstep(0.0, 2.6, r_st)) * (~is_seow_tarn[st_y - 3:st_y + 4, st_x - 3:st_x + 4]).astype(float)
        En_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] = (
            En_exp[st_y - 3:st_y + 4, st_x - 3:st_x + 4] * (1.0 - w_st_pin) + st_h * w_st_pin
        )

    # Re-assert the 6 `twins` showcase stations, 4 Option A vent peaks/floors, and 5 `opal valley` showcase stations:
    for st_x, st_y, st_h in twins_station_pins:
        r_st = np.hypot(X_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] - st_x, Y_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] - st_y)
        w_st_pin = (1.0 - G.sstep(0.0, 2.0, r_st)) * (~riv_seed_mask[st_y - 2:st_y + 3, st_x - 2:st_x + 3]).astype(float)
        En_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] = (
            En_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] * (1.0 - w_st_pin) + st_h * w_st_pin
        )
    En_exp[1459, 985] = 6480.0
    En_exp[1458, 988] = 5980.0
    En_exp[1496, 1039] = 5880.0
    En_exp[1498, 1042] = 5420.0
    En_exp[1471, 1006] = 4840.0
    En_exp[1472, 1007] = 4680.0
    En_exp[1484, 1023] = 4610.0
    En_exp[1485, 1024] = 4460.0

    for st_x, st_y, st_h in oval_station_pins:
        r_st = np.hypot(X_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] - st_x, Y_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] - st_y)
        w_st_pin = (1.0 - G.sstep(0.0, 2.0, r_st)) * (~is_oval_lake[st_y - 2:st_y + 3, st_x - 2:st_x + 3]).astype(float) * (~riv_seed_mask[st_y - 2:st_y + 3, st_x - 2:st_x + 3]).astype(float)
        En_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] = (
            En_exp[st_y - 2:st_y + 3, st_x - 2:st_x + 3] * (1.0 - w_st_pin) + st_h * w_st_pin
        )
        En_exp[st_y, st_x] = st_h

    climbing_fixed = 0
    for _pass_riv in range(2):
        for r in rivers_exp:
            pts_r = r.get('px') or []
            if not pts_r:
                continue
            is_ling_ma = (r.get('id') == 2) or (len(pts_r) >= 2 and 278.0 <= pts_r[-1][0] <= 292.0 and 585.0 <= pts_r[-1][1] <= 590.0)
            beds = []
            raw_es = []
            for px_, py_ in pts_r:
                iy = min(NEW_OH - 1, max(0, int(round(py_))))
                ix = min(NEW_OW - 1, max(0, int(round(px_))))
                raw_es.append(float(En_exp[iy, ix]))
                if whas_exp[iy, ix] and not np.isnan(wlev_exp[iy, ix]):
                    beds.append(round(float(max(En_exp[iy, ix], wlev_exp[iy, ix])), 1))
                else:
                    beds.append(round(float(En_exp[iy, ix]), 1))
            if is_ling_ma and len(beds) >= 6:
                top_g = min(float(beds[-6]), 48.0)
                for k_g, frac_g in enumerate([0.75, 0.50, 0.25, 0.08, 0.0, 0.0], start=len(beds) - 6):
                    beds[k_g] = round(top_g * frac_g, 1)
                    iy_g = min(NEW_OH - 1, max(0, int(round(pts_r[k_g][1]))))
                    ix_g = min(NEW_OW - 1, max(0, int(round(pts_r[k_g][0]))))
                    if not whas_exp[iy_g, ix_g] and (ix_g, iy_g) != (294, 588):
                        En_exp[iy_g, ix_g] = max(1.8, float(beds[k_g]))
                    raw_es[k_g] = float(En_exp[iy_g, ix_g])
            for i in range(1, len(beds)):
                iy = min(NEW_OH - 1, max(0, int(round(pts_r[i][1]))))
                ix = min(NEW_OW - 1, max(0, int(round(pts_r[i][0]))))
                if beds[i] > beds[i - 1]:
                    beds[i] = beds[i - 1]
                    if _pass_riv == 0:
                        climbing_fixed += 1
                    if not whas_exp[iy, ix] and not vent_summit_core[iy, ix] and (ix, iy) != (294, 588):
                        floor_px = 1.8 if is_new_area[iy, ix] else -10000.0
                        En_exp[iy, ix] = min(float(En_exp[iy, ix]), max(floor_px, float(beds[i])))
                        raw_es[i] = float(En_exp[iy, ix])
                if raw_es[i] > raw_es[i - 1] and not vent_summit_core[iy, ix] and (ix, iy) != (294, 588):
                    floor_px = (1.8 if (is_new_area[iy, ix] and not whas_exp[iy, ix]) else -10000.0)
                    raw_es[i] = max(floor_px, raw_es[i - 1])
                    En_exp[iy, ix] = min(float(En_exp[iy, ix]), raw_es[i])
            r['bed_m'] = beds
            r['source_m'] = beds[0]
            r['mouth_m'] = beds[-1]
    print(f'  Total rivers incised & verified on expanded map: {len(rivers_exp)} (clamped {climbing_fixed} vertices)')

    # =========================================================================
    # STEP 5C: Ancient's Valley (`rmva8s97fa99i`) 17 m Lake & Seven Vitrified
    #          Blast Basins — Cut LAST in the Terrain Pipeline (Round 3 Item 2)
    # =========================================================================
    # 1. Settle the Ancient's Valley / SW Lowlands terminal lake (`Body 242`) to `wlev = 17.4 m`
    #    (`lake_level_m = 17` on `"western lake (Ancient's Valley) outlet"`), grading its old
    #    -431..-700 m trench bed up to a shallow -12..-28 m lake bed and clamping stale `wlev > 18 m`
    #    edge cells to 17.4 m.
    in_anc_lake_box = (X_exp >= 360.0) & (X_exp <= 560.0) & (Y_exp >= 910.0) & (Y_exp <= 1068.0)
    anc_lake_mask = in_anc_lake_box & whas_exp & (np.nan_to_num(wlev_exp, nan=0.0) < 250.0)
    wlev_exp = np.where(anc_lake_mask, 17.4, wlev_exp)
    d_anc_lake_in = nd.distance_transform_edt(anc_lake_mask)
    shallow_anc_bed = -8.0 - 18.0 * G.sstep(0.0, 8.0, d_anc_lake_in) + 3.5 * meta_nw['fbm2']
    En_exp = np.where(anc_lake_mask & (En_exp < -28.0), shallow_anc_bed, En_exp)

    # 2. Re-cut the seven vitrified nuclear/ordnance blast basins in `ancient's valley` LAST in the
    #    terrain pipeline, sized for the (861, 910) half-grid round-trip so every single basin has
    #    a flat vitrified floor 85-105 m below its local pad and a raised +38..+46 m vitrified rim:
    #    - 4 dry basins: (476, 915) r=6 km, (398, 966) r=5.5 km, (450, 896) r=5 km, (406, 908) r=6.5 km
    #    - 2 drowned lake basins: (428, 948) r=7.5 km, (460, 962) r=7 km (drowned at 17.4 m, bed -44..-46 m)
    #    - 1 half-drowned shore basin: (420, 984) r=6.5 km (north half drowned at 17.4 m, south half dry)
    anc_blast_specs = [
        # (bx, by, r_km, mode, h_pad, floor_m, rim_m, breach_ang_deg)
        (476.0, 915.0, 6.0, 'dry', 84.0, -22.0, 132.0, None),
        (398.0, 966.0, 5.5, 'dry', 78.0, -26.0, 126.0, None),
        (450.0, 896.0, 5.0, 'dry', 92.0, -14.0, 140.0, None),
        (406.0, 908.0, 6.5, 'dry', 86.0, -20.0, 134.0, None),
        (428.0, 948.0, 7.5, 'drowned', 22.0, -44.0, 38.0, 35.0),
        (460.0, 962.0, 7.0, 'drowned', 22.0, -46.0, 36.0, -145.0),
        (420.0, 984.0, 6.5, 'half', 42.0, -24.0, 76.0, -90.0),
    ]
    w_anc_basins = np.zeros((NEW_OH, NEW_OW), dtype=float)
    w_anc_rim_glass = np.zeros((NEW_OH, NEW_OW), dtype=float)

    for bx, by, r_km, b_mode, h_pad, floor_m, rim_m, br_ang in anc_blast_specs:
        r_px = r_km / 2.0
        dx_b = X_exp - bx
        dy_b = Y_exp - by
        dist_b = np.hypot(dx_b, dy_b)
        ang_b = np.degrees(np.arctan2(dy_b, dx_b))

        # Smooth outer apron tie-in (`r_px + 1.4 <= dist_b <= r_px + 3.2`)
        w_apron = 1.0 - G.sstep(r_px + 1.3, r_px + 3.0, dist_b)
        w_anc_basins = np.maximum(w_anc_basins, w_apron)

        # Raised vitrified rim ring (`0.78 * r_px <= dist_b <= 1.42 * r_px`) and flat vitrified crater bowl (`dist_b <= 0.72 * r_px`)
        u_bowl = 1.0 - G.sstep(0.58 * r_px, 0.85 * r_px, dist_b)
        u_rim = G.sstep(0.68 * r_px, 0.92 * r_px, dist_b) * (1.0 - G.sstep(1.22 * r_px, 1.52 * r_px, dist_b))
        w_anc_rim_glass = np.maximum(w_anc_rim_glass, u_rim)

        h_crater = h_pad * (1.0 - u_bowl - u_rim) + floor_m * u_bowl + rim_m * u_rim
        if b_mode == 'half':
            # Southern half of the `(420, 984)` shore basin bowl is emergent dry melt-sheet (`+18..+24 m`), northern half drowned (`-24 m`)
            u_south_half = G.sstep(-0.4, 0.6, dy_b)
            floor_half = floor_m * (1.0 - u_south_half) + (-6.0) * u_south_half
            h_crater = h_pad * (1.0 - u_bowl - u_rim) + floor_half * u_bowl + rim_m * u_rim

        if br_ang is not None:
            d_ang = np.abs(((ang_b - br_ang + 180.0) % 360.0) - 180.0)
            u_breach = (1.0 - G.sstep(18.0, 34.0, d_ang)) * G.sstep(0.60 * r_px, 0.85 * r_px, dist_b) * (1.0 - G.sstep(1.30 * r_px, 1.60 * r_px, dist_b))
            h_crater = h_crater * (1.0 - u_breach) + 6.0 * u_breach
        else:
            u_breach = np.zeros_like(dist_b)

        En_exp = np.where(dist_b <= (r_px + 1.55), h_crater, En_exp * (1.0 - 0.65 * w_apron) + h_pad * (0.65 * w_apron))

        if b_mode == 'dry':
            dry_zone = dist_b <= (r_px + 2.0)
            whas_exp[dry_zone] = False
            wlev_exp[dry_zone] = np.nan
        elif b_mode == 'drowned':
            in_bowl = (dist_b <= 0.82 * r_px) | (u_breach > 0.35)
            on_rim = (dist_b > 0.82 * r_px) & (dist_b <= 1.45 * r_px) & (u_breach <= 0.35)
            whas_exp[in_bowl] = True
            wlev_exp[in_bowl] = 17.4
            whas_exp[on_rim] = False
            wlev_exp[on_rim] = np.nan
        elif b_mode == 'half':
            in_north_bowl = ((dist_b <= 0.80 * r_px) & (dy_b <= 0.0)) | (u_breach > 0.35)
            in_south_or_rim = ((dist_b <= 1.48 * r_px) & ~in_north_bowl)
            whas_exp[in_north_bowl] = True
            wlev_exp[in_north_bowl] = 17.4
            whas_exp[in_south_or_rim] = False
            wlev_exp[in_south_or_rim] = np.nan

    # Update `cls_exp`, `zon_exp`, temperatures, and rainfall in `ancient's valley`, `great chasm`, and `godshearth`:
    anc_box_all = (X_exp >= 360.0) & (X_exp <= 560.0) & (Y_exp >= 885.0) & (Y_exp <= 1068.0)
    cls_exp[anc_box_all & whas_exp] = idx['WH']
    cls_exp[anc_box_all & ~whas_exp & (cls_exp == idx['WH'])] = idx['Cfa']
    zon_exp[anc_box_all & whas_exp] = 4
    zon_exp[anc_box_all & ~whas_exp & (zon_exp == 4)] = 0

    # 1. `great chasm` (`rmw4vh9t20da4`): lapse-rate + volcanic fissure geothermal boost on the deep chasm floor & smooth northern headwall ramp
    w_gc_clim = np.clip(np.maximum(G.sstep(-3.0, 2.5, sd_gc), w_gc_env) * (~whas_exp).astype(float), 0.0, 1.0)
    tw_gc_t = 34.0 - 0.0062 * En_exp + 4.5 * (1.0 - G.sstep(-600.0, 400.0, En_exp))
    tc_gc_t = 19.0 - 0.0062 * En_exp + 4.5 * (1.0 - G.sstep(-600.0, 400.0, En_exp))
    tm_gc_t = 0.5 * (tw_gc_t + tc_gc_t)
    tw_exp = tw_exp * (1.0 - w_gc_clim) + tw_gc_t * w_gc_clim
    tc_exp = tc_exp * (1.0 - w_gc_clim) + tc_gc_t * w_gc_clim
    tm_exp = tm_exp * (1.0 - w_gc_clim) + tm_gc_t * w_gc_clim
    rain_gc_t = np.where(En_exp < 2600.0, 45.0 + 35.0 * (1.0 - G.sstep(-800.0, 1800.0, En_exp)), rain_exp)
    rain_exp = rain_exp * (1.0 - w_gc_clim) + rain_gc_t * w_gc_clim

    in_gc_edit = (w_gc_clim > 0.20) & ~whas_exp
    cls_exp[in_gc_edit & (En_exp < -250.0)] = idx['XW']
    cls_exp[in_gc_edit & (En_exp >= -250.0) & (En_exp < 3800.0)] = idx['BWk']
    cls_exp[in_gc_edit & (En_exp >= 3800.0) & (En_exp < 5350.0)] = idx['ET']
    cls_exp[in_gc_edit & (En_exp >= 5350.0) & (En_exp < 6250.0)] = idx['EF']
    cls_exp[in_gc_edit & (En_exp >= 6250.0) & (En_exp < 7150.0)] = idx['HT']
    cls_exp[in_gc_edit & (En_exp >= 7150.0) & (En_exp < 8800.0)] = idx['HF']
    cls_exp[in_gc_edit & (En_exp >= 8800.0)] = idx['O']
    zon_exp[in_gc_edit & (En_exp < 3800.0)] = 0
    zon_exp[in_gc_edit & (En_exp >= 3800.0) & (En_exp < 6250.0)] = 1
    zon_exp[in_gc_edit & (En_exp >= 6250.0) & (En_exp < 8800.0)] = 2
    zon_exp[in_gc_edit & (En_exp >= 8800.0)] = 3

    # 2. `godshearth` (`rmw4wou2y1hhc`): Yellowstone-style geothermal oasis on the lowered +3,640..+4,120 m caldera bench
    #    grading smoothly across the wide volcano-tectonic slump amphitheatre (`sd_gh_main` in `[-24, +6]`) into Godthrone:
    w_gh_clim = np.clip(np.maximum(G.sstep(-24.0, 4.0, sd_gh_main), w_gh_spill) * (~whas_exp).astype(float), 0.0, 1.0)
    tw_gh_t = 22.0 - 0.0055 * np.maximum(0.0, En_exp - 3640.0)
    tc_gh_t = 8.5 - 0.0055 * np.maximum(0.0, En_exp - 3640.0)
    tm_gh_t = 0.5 * (tw_gh_t + tc_gh_t)
    tw_exp = tw_exp * (1.0 - w_gh_clim) + tw_gh_t * w_gh_clim
    tc_exp = tc_exp * (1.0 - w_gh_clim) + tc_gh_t * w_gh_clim
    tm_exp = tm_exp * (1.0 - w_gh_clim) + tm_gh_t * w_gh_clim
    rain_gh_t = 920.0 - 0.18 * np.maximum(0.0, En_exp - 3640.0)
    rain_exp = rain_exp * (1.0 - w_gh_clim) + np.clip(rain_gh_t, 320.0, 1150.0) * w_gh_clim
    out_temps_exp['tw'] = tw_exp
    out_temps_exp['tc'] = tc_exp
    out_temps_exp['tm'] = tm_exp

    cls_exp[is_gh_lake] = idx['WH']
    zon_exp[is_gh_lake] = 4
    in_gh_edit = (w_gh_clim > 0.20) & ~whas_exp
    cls_exp[in_gh_edit & (En_exp < 4040.0)] = idx['Cfb']
    cls_exp[in_gh_edit & (En_exp >= 4040.0) & (En_exp < 4350.0)] = idx['Csb']
    cls_exp[in_gh_edit & (En_exp >= 4350.0) & (En_exp < 4680.0)] = idx['Dsc']
    cls_exp[in_gh_edit & (En_exp >= 4680.0) & (En_exp < 5450.0)] = idx['ET']
    cls_exp[in_gh_edit & (En_exp >= 5450.0) & (En_exp < 6250.0)] = idx['EF']
    zon_exp[in_gh_edit & (En_exp < 4680.0)] = 0
    zon_exp[in_gh_edit & (En_exp >= 4680.0) & (En_exp < 6250.0)] = 1

    # 3. `SE outer wall` (`rmw4xy4tp9b29`): Taller Alpine Cordillera (`ET` / `EF` / `HT` / `HF` / `O`), The Godsgate (`Dsc`), and 5 Highland Tarn Oases (`WH`):
    w_seow_clim = np.clip(w_seow_all, 0.0, 1.0)
    r_amber_tarn = np.hypot(X_exp - 1062.5, Y_exp - 1272.0)
    w_amber_geo = 1.0 - G.sstep(1.5, 6.0, r_amber_tarn)
    tw_seow_t = 15.5 - 0.0058 * np.maximum(0.0, En_exp - 3600.0) + 2.8 * w_seow_oasis + 6.5 * w_amber_geo
    tc_seow_t = -6.5 - 0.0058 * np.maximum(0.0, En_exp - 3600.0) + 2.8 * w_seow_oasis + 8.0 * w_amber_geo
    tm_seow_t = 0.5 * (tw_seow_t + tc_seow_t)
    tw_exp = tw_exp * (1.0 - w_seow_clim) + tw_seow_t * w_seow_clim
    tc_exp = tc_exp * (1.0 - w_seow_clim) + tc_seow_t * w_seow_clim
    tm_exp = tm_exp * (1.0 - w_seow_clim) + tm_seow_t * w_seow_clim
    rain_seow_t = 290.0 + 120.0 * w_seow_oasis - 0.035 * np.maximum(0.0, En_exp - 3800.0)
    rain_exp = rain_exp * (1.0 - w_seow_clim) + np.clip(rain_seow_t, 80.0, 520.0) * w_seow_clim
    out_temps_exp['tw'] = tw_exp
    out_temps_exp['tc'] = tc_exp
    out_temps_exp['tm'] = tm_exp

    cls_exp[is_seow_tarn] = idx['WH']
    zon_exp[is_seow_tarn] = 4
    in_seow_edit = (mask_seow | (w_seow_clim > 0.25)) & ~whas_exp
    cls_exp[in_seow_edit & (En_exp < 4020.0)] = idx['Dsc']
    cls_exp[in_seow_edit & (w_amber_geo > 0.35) & (En_exp < 4120.0)] = idx['Csb']
    cls_exp[in_seow_edit & (En_exp >= 4020.0) & (En_exp < 5350.0) & ~(w_amber_geo > 0.35)] = idx['ET']
    cls_exp[in_seow_edit & (En_exp >= 5350.0) & (En_exp < 6250.0)] = idx['EF']
    cls_exp[in_seow_edit & (En_exp >= 6250.0) & (En_exp < 7150.0)] = idx['HT']
    cls_exp[in_seow_edit & (En_exp >= 7150.0) & (En_exp < 8800.0)] = idx['HF']
    cls_exp[in_seow_edit & (En_exp >= 8800.0)] = idx['O']
    zon_exp[in_seow_edit & (En_exp < 4020.0)] = 0
    zon_exp[in_seow_edit & (En_exp >= 4020.0) & (En_exp < 6250.0)] = 1
    zon_exp[in_seow_edit & (En_exp >= 6250.0) & (En_exp < 8800.0)] = 2
    zon_exp[in_seow_edit & (En_exp >= 8800.0)] = 3

    # 4. `twins` (`rmw536m06wlyf`, Option A): Active Twin Cones (`EF` / `HT`), Range Spine (`ET` / `EF` / `Dsc`), & 5 Geothermal Oases (`Csb` / `Dsc`),
    #    gated on the NE side (`w_tw_ne_clim_gate`) so zero `Dsc` climate or dark scrub satellite paint spills onto The Catch's `< 2,200 m` `BWh / BWk` alkali desert floor!
    w_tw_ne_clim_gate = np.where(p_tw_ne_full > 5.0, G.sstep(2150.0, 2750.0, En_exp), 1.0)
    w_twins_clim = np.clip(
        np.maximum(w_twins_all, G.sstep(-24.0, 2.0, sd_twins) * (1.0 - u_ne_catch_side)) * w_tw_ne_clim_gate * (~whas_exp).astype(float),
        0.0,
        1.0,
    )
    tw_tw_t = 16.5 - 0.0058 * np.maximum(0.0, En_exp - 3400.0) + 6.5 * w_twins_oasis + 9.0 * w_twins_lava
    tc_tw_t = -5.5 - 0.0058 * np.maximum(0.0, En_exp - 3400.0) + 7.5 * w_twins_oasis + 12.0 * w_twins_lava
    tm_tw_t = 0.5 * (tw_tw_t + tc_tw_t)
    tw_exp = tw_exp * (1.0 - w_twins_clim) + tw_tw_t * w_twins_clim
    tc_exp = tc_exp * (1.0 - w_twins_clim) + tc_tw_t * w_twins_clim
    tm_exp = tm_exp * (1.0 - w_twins_clim) + tm_tw_t * w_twins_clim
    rain_tw_t = 280.0 + 140.0 * w_twins_oasis - 0.032 * np.maximum(0.0, En_exp - 3600.0)
    rain_exp = rain_exp * (1.0 - w_twins_clim) + np.clip(rain_tw_t, 120.0, 560.0) * w_twins_clim

    in_twins_edit = ((mask_twins & (En_exp >= 2150.0)) | (w_twins_clim > 0.25)) & ~whas_exp
    cls_exp[in_twins_edit & (En_exp < 4150.0)] = idx['Dsc']
    cls_exp[in_twins_edit & (w_twins_oasis > 0.38) & (En_exp < 4750.0)] = idx['Csb']
    cls_exp[in_twins_edit & (En_exp >= 4150.0) & (En_exp < 5350.0) & ~(w_twins_oasis > 0.38)] = idx['ET']
    cls_exp[in_twins_edit & (En_exp >= 5350.0) & (En_exp < 6250.0)] = idx['EF']
    cls_exp[in_twins_edit & (En_exp >= 6250.0)] = idx['HT']
    zon_exp[in_twins_edit & (En_exp < 4150.0)] = 0
    zon_exp[in_twins_edit & (En_exp >= 4150.0) & (En_exp < 6250.0)] = 1
    zon_exp[in_twins_edit & (En_exp >= 6250.0)] = 2

    # 5. `opal valley` (`rmw52q8d7prwz`): Three Terraced Lake Beds (`WH` lakes, `Af`/`Cfa` -> `Cfb`/`Csb` -> `Dfc`/`Dsc` -> `ET`/`EF`):
    w_oval_clim = np.clip(np.maximum(w_oval_all, G.sstep(-38.0, 2.0, sd_oval) * (~whas_exp).astype(float)), 0.0, 1.0)
    tw_ov_t = 29.0 - 0.0056 * np.maximum(0.0, En_exp) + 1.8 * w_oval_sinter
    tc_ov_t = 15.5 - 0.0062 * np.maximum(0.0, En_exp) + 2.2 * w_oval_sinter
    tm_ov_t = 0.5 * (tw_ov_t + tc_ov_t)
    tw_exp = tw_exp * (1.0 - w_oval_clim) + tw_ov_t * w_oval_clim
    tc_exp = tc_exp * (1.0 - w_oval_clim) + tc_ov_t * w_oval_clim
    tm_exp = tm_exp * (1.0 - w_oval_clim) + tm_ov_t * w_oval_clim
    rain_ov_t = 1120.0 - 0.135 * np.maximum(0.0, En_exp) + 110.0 * w_oval_sinter
    rain_exp = rain_exp * (1.0 - w_oval_clim) + np.clip(rain_ov_t, 380.0, 1380.0) * w_oval_clim

    cls_exp[is_oval_lake] = idx['WH']
    zon_exp[is_oval_lake] = 4
    in_oval_edit = (mask_oval | (w_oval_clim > 0.25)) & ~whas_exp
    cls_exp[in_oval_edit & (En_exp < 95.0)] = idx['Af']
    cls_exp[in_oval_edit & (En_exp >= 95.0) & (En_exp < 880.0)] = idx['Cfa']
    cls_exp[in_oval_edit & (En_exp >= 880.0) & (En_exp < 2050.0)] = idx['Cfb']
    cls_exp[in_oval_edit & (En_exp >= 2050.0) & (En_exp < 3250.0)] = idx['Dfc']
    cls_exp[in_oval_edit & (En_exp >= 3250.0) & (En_exp < 3850.0)] = idx['Dsc']
    cls_exp[in_oval_edit & (En_exp >= 3850.0) & (En_exp < 4750.0)] = idx['ET']
    cls_exp[in_oval_edit & (En_exp >= 4750.0)] = idx['EF']
    zon_exp[in_oval_edit & (En_exp < 3850.0)] = 0
    zon_exp[in_oval_edit & (En_exp >= 3850.0)] = 1

    # 6. `Greenstep` (`rmw5n1w1rx0u2`), `Shumar` (`rmw5s3ktxgv0d`), & `Labyrinth` (`rmw8bqrn3dnx4`):
    #    Evaluate temperatures, evaporation + windward orographic rainfall, and Köppen classes directly
    #    via the physical `C.lapse` + `C.reclimate` solver (un-freezing formerly `Class O` cells lowered below 8,800 m):
    w_gval_clim = np.clip(np.maximum(w_gval_all, G.sstep(-28.0, 2.0, sd_gval) * (~whas_exp).astype(float)), 0.0, 1.0)
    w_shumar_clim = np.clip(
        np.maximum(w_shumar_all, G.sstep(-28.0, 4.0, sd_shumar) * u_wide_blend * (~whas_exp).astype(float))
        * w_tallhouse_guard
        * (1.0 - G.sstep(-2.0, 5.0, sd_gval)),
        0.0,
        1.0,
    )
    w_lab_clim = np.clip(np.maximum(w_lab_all, w_fb_clim) * (~whas_exp).astype(float), 0.0, 1.0)
    w_gv_sh_clim = np.maximum(np.maximum(w_gval_clim, w_shumar_clim), w_lab_clim)
    w_gv_clim_1393 = w_gv_sh_clim[DY:, DX:]
    in_gv_sh_1393 = (mask_gval[DY:, DX:] | mask_shumar[DY:, DX:] | mask_lab[DY:, DX:] | mask_fb[DY:, DX:] | (w_gv_clim_1393 > 0.05))
    in_gv_box_1393 = np.zeros_like(in_gv_sh_1393, dtype=bool)
    in_gv_box_1393[700:, :650] = True
    En_gv_1393 = np.where(in_gv_box_1393 | in_gv_sh_1393, En_exp[DY:, DX:], Eo_1393)
    whas_gv_1393 = np.where(in_gv_box_1393 | in_gv_sh_1393, whas_exp[DY:, DX:], whas0_1393)
    wlev_gv_1393 = np.where(in_gv_box_1393 | in_gv_sh_1393, wlev_exp[DY:, DX:], wlev0_1393)

    D_gv_reclim = dict(D_old)
    c0_gv_1393 = P.raster(D_old, 'c', 'L').copy()
    unfreeze_gv_o = (w_gv_clim_1393 > 0.05) & (c0_gv_1393 == idx['O']) & (En_gv_1393 < 8800.0)
    c0_gv_1393[unfreeze_gv_o] = idx['Cfb']
    D_gv_reclim['c'] = P.b64(Image.fromarray(c0_gv_1393, 'L'))

    temps_gv_1393 = C.lapse(D_gv_reclim, Eo_1393, En_gv_1393, whas0_1393, wlev0_1393, whas_gv_1393, wlev_gv_1393)
    tw_gv_1393 = np.array(Image.open(io.BytesIO(base64.b64decode(temps_gv_1393['tw']))).convert('L'), dtype=float) - 90.0
    tc_gv_1393 = np.array(Image.open(io.BytesIO(base64.b64decode(temps_gv_1393['tc']))).convert('L'), dtype=float) - 90.0
    tm_gv_1393 = np.array(Image.open(io.BytesIO(base64.b64decode(temps_gv_1393['tm']))).convert('L'), dtype=float) - 90.0
    D_gv_reclim.update(temps_gv_1393)

    rain_gv_1393, cls_gv_1393, zon_gv_1393, _, _ = C.reclimate(
        D_gv_reclim,
        Eo_1393,
        En_gv_1393,
        whas_gv_1393,
        np.zeros_like(whas_gv_1393, dtype=bool),
    )
    tw_exp[DY:, DX:] = tw_exp[DY:, DX:] * (1.0 - w_gv_clim_1393) + tw_gv_1393 * w_gv_clim_1393
    tc_exp[DY:, DX:] = tc_exp[DY:, DX:] * (1.0 - w_gv_clim_1393) + tc_gv_1393 * w_gv_clim_1393
    tm_exp[DY:, DX:] = tm_exp[DY:, DX:] * (1.0 - w_gv_clim_1393) + tm_gv_1393 * w_gv_clim_1393
    rain_exp[DY:, DX:] = rain_exp[DY:, DX:] * (1.0 - w_gv_clim_1393) + rain_gv_1393.astype(float) * w_gv_clim_1393

    in_gval_1393 = (mask_gval[DY:, DX:] | mask_shumar[DY:, DX:] | mask_lab[DY:, DX:] | mask_fb[DY:, DX:] | (w_gv_clim_1393 > 0.25)) & ~whas_gv_1393
    cls_exp[DY:, DX:][in_gval_1393] = cls_gv_1393[in_gval_1393]
    zon_exp[DY:, DX:][in_gval_1393] = zon_gv_1393[in_gval_1393]
    del (
        D_gv_reclim, c0_gv_1393, unfreeze_gv_o, temps_gv_1393,
        tw_gv_1393, tc_gv_1393, tm_gv_1393,
        rain_gv_1393, cls_gv_1393, zon_gv_1393, in_gval_1393, in_gv_sh_1393,
        En_gv_1393, whas_gv_1393, wlev_gv_1393, w_gv_clim_1393, w_gv_sh_clim,
    )
    gc.collect()

    # Across the full `Labyrinth` (`rmw8bqrn3dnx4`), `Firebliss Range` (`rmw8hj62nmugn`), & SW Glaciated Dome (`w_lab_clim > 0.05`):
    # Compute the Enclosed 3-Sided Basin Rain Budget + Downwind SE Volcanic Ash & Water-Vapor Plume (`w_firebliss_plume`)
    # from the 5 `Firebliss Range` vents, and run the Fine-Scale Microclimate Pass across both `Labyrinth` and the
    # 4 Sheltered Temperate Geothermal Valleys (`Cfa` / `Cfb` / `Csb`) of `Firebliss Range`:
    d_to_lab_lake = nd.distance_transform_edt(~(is_lab_lake | is_fb_lake))
    lab_riv_mask = riv_seed_mask & (X_exp <= 415.0) & (Y_exp >= 1280.0)
    d_to_lab_riv = nd.distance_transform_edt(~lab_riv_mask)
    w_lake_mist = (1.0 - G.sstep(0.0, 11.0, d_to_lab_lake)) * (~whas_exp).astype(float)
    w_riv_mist = (1.0 - G.sstep(0.0, 6.5, d_to_lab_riv)) * (~whas_exp).astype(float)
    w_lab_evap = np.clip(np.maximum(w_lake_mist, 0.65 * w_riv_mist), 0.0, 1.0)

    gy_lb_full, gx_lb_full = np.gradient(En_exp, 2.0)
    # External moisture enters through the E/NE breaches (`X = 320..410`) AND via the NW -> SE Volcanic Vapor & Sulfate Aerosol Plume (`w_firebliss_plume`):
    u_east_inflow = G.sstep(125.0, 385.0, X_exp)
    w_windward_e = G.sstep(35.0, 310.0, -gx_lb_full) * (1.0 - G.sstep(4600.0, 5600.0, En_exp))
    # NW-facing windward slopes catching the SE-blowing Firebliss volcanic plume (`gx_lb_full + gy_lb_full < 0`):
    w_windward_nw_plume = G.sstep(25.0, 260.0, -(gx_lb_full + gy_lb_full)) * w_firebliss_plume
    w_leeward_w = G.sstep(35.0, 310.0, gx_lb_full) * (1.0 - G.sstep(3800.0, 4600.0, En_exp)) * (1.0 - 0.65 * w_firebliss_plume)
    w_icecap_snow = G.sstep(3850.0, 4950.0, En_exp) * (1.0 - G.sstep(6800.0, 8200.0, En_exp))

    rain_lab_t = np.clip(
        155.0
        + 315.0 * (u_east_inflow ** 1.25)
        + 185.0 * w_windward_e
        - 85.0 * w_leeward_w
        + 310.0 * w_firebliss_plume
        + 165.0 * w_windward_nw_plume
        + 280.0 * w_fb_valley_full
        + 345.0 * w_lake_mist
        + 175.0 * w_riv_mist
        + 235.0 * w_icecap_snow
        + 32.0 * meta_nw['fbm1'],
        135.0,
        1420.0,
    )
    # Thermal inversion warmth on sunlit/evaporative chasm floors (`+3.2 C`) + geothermal ground-heat flux (`+6.8 C` in `w_fb_valley_full`, `+4.2 C` in `w_fb_crater_full`):
    w_sunlit_aspect = G.sstep(25.0, 260.0, -gy_lb_full - 0.5 * gx_lb_full)
    w_shaded_gorge = G.sstep(25.0, 260.0, gy_lb_full + 0.5 * gx_lb_full) * w_lab_trough_full * (1.0 - w_fb_valley_full)
    tw_lab_t = (
        26.2
        - 0.0056 * np.maximum(0.0, En_exp)
        + 2.8 * w_lab_trough_full
        + 6.4 * w_fb_valley_full
        + 3.5 * w_fb_crater_full
        + 1.6 * w_sunlit_aspect
        - 1.8 * w_shaded_gorge
        + 1.2 * w_lake_mist
    )
    tc_lab_t = (
        6.8
        - 0.0058 * np.maximum(0.0, En_exp)
        + 3.0 * w_lab_trough_full
        + 8.2 * w_fb_valley_full
        + 4.5 * w_fb_crater_full
        + 2.2 * w_lake_mist
        - 2.4 * w_shaded_gorge
    )
    tm_lab_t = 0.5 * (tw_lab_t + tc_lab_t)
    tw_exp = tw_exp * (1.0 - w_lab_clim) + tw_lab_t * w_lab_clim
    tc_exp = tc_exp * (1.0 - w_lab_clim) + tc_lab_t * w_lab_clim
    tm_exp = tm_exp * (1.0 - w_lab_clim) + tm_lab_t * w_lab_clim
    rain_exp = rain_exp * (1.0 - w_lab_clim) + rain_lab_t * w_lab_clim

    cls_exp[is_lab_lake | is_fb_lake] = idx['WH']
    zon_exp[is_lab_lake | is_fb_lake] = 4
    in_lab_edit = (mask_lab | mask_fb | (w_lab_clim > 0.20) | (w_lab_edge_barrier_full > 0.25)) & ~whas_exp
    # 1. Lowland & Mid-Canyon Floors (`En_exp < 2,250 m`): Rain-shadow desert (`BWk`), steppe (`BSk`), warm-summer (`Csb`), and lake-mist / volcanic-plume refugia (`Cfb`):
    in_lb_low = in_lab_edit & (En_exp < 2250.0)
    cls_exp[in_lb_low & (rain_exp < 245.0)] = idx['BWk']
    cls_exp[in_lb_low & (rain_exp >= 245.0) & (rain_exp < 370.0)] = idx['BSk']
    cls_exp[in_lb_low & (rain_exp >= 370.0) & (rain_exp < 515.0) & (w_lake_mist <= 0.42)] = idx['Csb']
    cls_exp[in_lb_low & ((rain_exp >= 515.0) | ((rain_exp >= 370.0) & (w_lake_mist > 0.42)))] = idx['Cfb']
    # 2. Montane Graben & Catena Terraces (`2,250 m <= En_exp < 3,050 m`): Rain-shadow (`BWk`/`BSk`), dry-summer (`Dsb`), humid meltwater (`Dfb`), and shaded cold-pool (`Dfc`):
    in_lb_mid = in_lab_edit & (En_exp >= 2250.0) & (En_exp < 3050.0)
    cls_exp[in_lb_mid & (rain_exp < 235.0)] = idx['BWk']
    cls_exp[in_lb_mid & (rain_exp >= 235.0) & (rain_exp < 355.0)] = idx['BSk']
    cls_exp[in_lb_mid & (rain_exp >= 355.0) & (rain_exp < 495.0) & (w_shaded_gorge <= 0.45)] = idx['Dsb']
    cls_exp[in_lb_mid & (rain_exp >= 495.0) & (w_shaded_gorge <= 0.45)] = idx['Dfb']
    cls_exp[in_lb_mid & (rain_exp >= 355.0) & (w_shaded_gorge > 0.45)] = idx['Dfc']
    # 2B. Sheltered Temperate Geothermal Valleys inside `Firebliss Range` (`w_fb_valley_full > 0.28` and `En_exp < 3,150 m` -> `Cfa`, `Cfb`, `Csb`):
    in_fb_geoval = in_lab_edit & (w_fb_valley_full > 0.28) & (En_exp < 3150.0)
    cls_exp[in_fb_geoval & (En_exp < 2380.0) & (tw_exp >= 22.0)] = idx['Cfa']
    cls_exp[in_fb_geoval & ~((En_exp < 2380.0) & (tw_exp >= 22.0)) & (w_sunlit_aspect > 0.48) & (w_lake_mist < 0.35)] = idx['Csb']
    cls_exp[in_fb_geoval & ~((En_exp < 2380.0) & (tw_exp >= 22.0)) & ~((w_sunlit_aspect > 0.48) & (w_lake_mist < 0.35))] = idx['Cfb']
    # 3. Subalpine Canyon Shoulders & Shaded Cold-Air-Pooled Gorges (`3,050 m <= En_exp < 3,950 m` outside `in_fb_geoval`): `Dsc` & `Dfc`:
    in_lb_subalp = in_lab_edit & ~in_fb_geoval & (En_exp >= 3050.0) & (En_exp < 3950.0)
    cls_exp[in_lb_subalp & (rain_exp < 465.0) & (w_lab_evap <= 0.35)] = idx['Dsc']
    cls_exp[in_lb_subalp & ((rain_exp >= 465.0) | (w_lab_evap > 0.35))] = idx['Dfc']
    # 4. Sky-Island Chaos Mesa Tops & Volcanic Ridges (`3,950..5,150 m` `ET`), Glaciated Horst Dome & Stratocones (`5,150..6,250 m` `EF`), & Outer Airless Barrier (`>= 8,800 m` `O`):
    cls_exp[in_lab_edit & (En_exp >= 3950.0) & (En_exp < 5150.0)] = idx['ET']
    cls_exp[in_lab_edit & (En_exp >= 5150.0) & (En_exp < 6250.0)] = idx['EF']
    cls_exp[in_lab_edit & (En_exp >= 6250.0) & (En_exp < 7150.0)] = idx['HT']
    cls_exp[in_lab_edit & (En_exp >= 7150.0) & (En_exp < 8800.0)] = idx['HF']
    cls_exp[in_lab_edit & (En_exp >= 8800.0)] = idx['O']
    zon_exp[in_lab_edit & (En_exp < 3950.0)] = 0
    zon_exp[in_lab_edit & (En_exp >= 3950.0) & (En_exp < 6250.0)] = 1
    zon_exp[in_lab_edit & (En_exp >= 6250.0) & (En_exp < 8800.0)] = 2
    zon_exp[in_lab_edit & (En_exp >= 8800.0)] = 3

    # 7. `Xanadu` (`rmvkkmitffbjk` / `rmuf30815vwms`) & `Oidong Valley` Dramatic Rift-Valley Fine Climate Detail Pass:
    #    - `WH`: Erewhon's Lake (`-520 m`), Lower Xanadu Small Lake (`-1,685 m`), Lizardman Rift Lake (`-2,600 m`)
    #    - `Af`: Deep dense-air (`1.60–1.85 atm`) cataract-mist plunge bowl & lower outflow gorge (`< -1,450 m` or mist-drenched `< -1,150 m`)
    #    - `Cfa`: Warm humid lower-to-mid Rift graben terraces & Erewhon's Lake valley floor (`-1,450..-320 m`)
    #    - `Csb`: Sunlit, wind-scoured dry-summer Southern Rift Horst Spine (`+450..+1,280 m`) & south/west-facing normal-fault scarps (`-320..+1,150 m`)
    #    - `Cfb`: Humid cloud-forest cataract walls, northern Rift fault benches, & U-shaped Oidong hanging valley floor (`-250..+2,250 m`)
    #    - `Dfb` / `Dsb`: Upper Rift horst shoulders & subalpine Oidong trough walls (`+2,250..+3,150 m`)
    #    - `Dfc` / `Dsc`: Boreal krummholz rim & high fault spurs (`+3,150..+3,950 m`)
    #    - `ET` (`+3,950..+5,050 m`) & `EF` (`>= +5,050 m`): Alpine tundra & glaciated horst/Twin flanks
    w_xanadu_clim = np.clip(
        np.maximum(w_xanadu_rearrange, np.maximum(is_xanadu_small_lake.astype(float), np.maximum(is_erewhon_lake.astype(float), w_xanadu_cataract_foam))),
        0.0,
        1.0,
    )
    w_xan_dry = w_xanadu_clim * (~whas_exp).astype(float)
    gy_xn_c, gx_xn_c = np.gradient(En_exp, 2.0)
    slope_xn_c = np.hypot(gx_xn_c, gy_xn_c)
    # South/west-facing sunlit horst ridges & steep wind-shedding fault facets vs mist-collecting north/east-facing cataract amphitheatres:
    w_xn_sun_ridge = np.clip(
        G.sstep(20.0, 180.0, gy_xn_c - 0.35 * gx_xn_c) * (1.0 - 0.85 * w_xanadu_cataract_foam),
        0.0,
        1.0,
    )
    tw_xn_t = 28.8 - 0.0056 * En_exp + 1.5 * w_xanadu_cataract_foam + 1.1 * w_xn_sun_ridge
    tc_xn_t = 15.0 - 0.0059 * En_exp + 2.0 * w_xanadu_cataract_foam - 0.6 * w_xn_sun_ridge
    tm_xn_t = 0.5 * (tw_xn_t + tc_xn_t)
    rain_xn_t = np.clip(
        980.0
        - 0.11 * np.maximum(0.0, En_exp)
        + 680.0 * w_xanadu_cataract_foam
        - 290.0 * w_xn_sun_ridge
        + 120.0 * meta_nw['fbm2'],
        380.0,
        2150.0,
    )
    tw_exp = tw_exp * (1.0 - w_xan_dry) + tw_xn_t * w_xan_dry
    tc_exp = tc_exp * (1.0 - w_xan_dry) + tc_xn_t * w_xan_dry
    tm_exp = tm_exp * (1.0 - w_xan_dry) + tm_xn_t * w_xan_dry
    rain_exp = rain_exp * (1.0 - w_xan_dry) + rain_xn_t * w_xan_dry
    out_temps_exp['tw'] = tw_exp
    out_temps_exp['tc'] = tc_exp
    out_temps_exp['tm'] = tm_exp

    xan_wet_mask = whas_exp & ((w_xanadu_clim > 0.05) | is_erewhon_lake | is_xanadu_small_lake | in_liz_mouth)
    cls_exp[xan_wet_mask] = idx['WH']
    zon_exp[xan_wet_mask] = 4
    in_xan_dry_edit = (~whas_exp) & ((w_xanadu_clim > 0.12) | clear_xan_water) & ~oval_protect_mask
    # 1. Deep dense-air cataract-mist plunge bowl & lower outflow gorge (`Af`):
    in_xn_af = in_xan_dry_edit & ((En_exp < -1420.0) | ((En_exp < -1050.0) & (w_xanadu_cataract_foam > 0.22)))
    cls_exp[in_xn_af] = idx['Af']
    # 2. Warm subtropical Rift graben terraces & Erewhon's Lake valley floor (`Cfa`):
    in_xn_low = in_xan_dry_edit & ~in_xn_af & (En_exp < -280.0)
    cls_exp[in_xn_low] = idx['Cfa']
    # 3. Mid-elevation Rift horst spine, fault scarps, cataract cloud-forest walls, & lower Oidong valley (`-280..+2,250 m`):
    in_xn_mid = in_xan_dry_edit & (En_exp >= -280.0) & (En_exp < 2250.0)
    is_xn_csb = in_xn_mid & (En_exp < 1320.0) & ((w_xn_sun_ridge > 0.32) | ((rain_exp < 760.0) & (w_xanadu_cataract_foam < 0.15)))
    cls_exp[is_xn_csb] = idx['Csb']
    cls_exp[in_xn_mid & ~is_xn_csb & (En_exp < 260.0) & (rain_exp >= 920.0)] = idx['Cfa']
    cls_exp[in_xn_mid & ~is_xn_csb & ~((En_exp < 260.0) & (rain_exp >= 920.0))] = idx['Cfb']
    # 4. Upper Rift horst shoulders & Oidong hanging-valley walls (`+2,250..+3,150 m` -> `Dsb` / `Dfb`):
    in_xn_upper = in_xan_dry_edit & (En_exp >= 2250.0) & (En_exp < 3150.0)
    cls_exp[in_xn_upper & (w_xn_sun_ridge > 0.38)] = idx['Dsb']
    cls_exp[in_xn_upper & (w_xn_sun_ridge <= 0.38)] = idx['Dfb']
    # 5. Subalpine Rift rim & fault spurs (`+3,150..+3,950 m` -> `Dsc` / `Dfc`):
    in_xn_subalp = in_xan_dry_edit & (En_exp >= 3150.0) & (En_exp < 3950.0)
    cls_exp[in_xn_subalp & (w_xn_sun_ridge > 0.38)] = idx['Dsc']
    cls_exp[in_xn_subalp & (w_xn_sun_ridge <= 0.38)] = idx['Dfc']
    # 6. Alpine tundra (`+3,950..+5,050 m` -> `ET`) & glaciated peaks (`>= +5,050 m` -> `EF`):
    cls_exp[in_xan_dry_edit & (En_exp >= 3950.0) & (En_exp < 5050.0)] = idx['ET']
    cls_exp[in_xan_dry_edit & (En_exp >= 5050.0)] = idx['EF']
    zon_exp[in_xan_dry_edit & (En_exp < 3550.0)] = 0
    zon_exp[in_xan_dry_edit & (En_exp >= 3550.0)] = 1
    meta_nw['masks'] = {}
    del (
        En3, wlev0_1393, wlev3_1393, rain_int, cls_int, zon_int,
        d_to_lab_lake, lab_riv_mask, d_to_lab_riv, w_lake_mist, w_riv_mist, w_lab_evap,
        gy_lb_full, gx_lb_full, u_east_inflow, w_windward_e, w_windward_nw_plume, w_leeward_w, w_icecap_snow,
        rain_lab_t, w_sunlit_aspect, tw_lab_t, tc_lab_t, tm_lab_t,
        in_lab_edit, in_lb_low, in_lb_mid, in_fb_geoval, in_lb_subalp,
        w_xan_dry, gy_xn_c, gx_xn_c, tw_xn_t, tc_xn_t, tm_xn_t, rain_xn_t,
        xan_wet_mask, in_xan_dry_edit, in_xn_af, in_xn_low, in_xn_mid, is_xn_csb, in_xn_upper, in_xn_subalp,
    )
    gc.collect()

    # Re-verify river `bed_m` monotonic non-increasing after Ancient's Valley lake level update (without altering blast basins):
    for r in rivers_exp:
        pts_r = r.get('px') or []
        if not pts_r:
            continue
        beds = []
        for px_, py_ in pts_r:
            iy = min(NEW_OH - 1, max(0, int(round(py_))))
            ix = min(NEW_OW - 1, max(0, int(round(px_))))
            if whas_exp[iy, ix] and not np.isnan(wlev_exp[iy, ix]):
                beds.append(round(float(max(En_exp[iy, ix], wlev_exp[iy, ix])), 1))
            else:
                beds.append(round(float(En_exp[iy, ix]), 1))
        for i in range(1, len(beds)):
            if beds[i] > beds[i - 1]:
                beds[i] = beds[i - 1]
        r['bed_m'] = beds
        r['source_m'] = beds[0]
        r['mouth_m'] = beds[-1]

    # =========================================================================
    # STEP 6: Synthesize & Blend `st`, `t`, `rt`, `ct` on (1723, 1821)
    # =========================================================================
    print('--- Step 6: Synthesizing Seamless Satellite (st), Relief (t), Rain (rt), and Climate (ct) Maps on 1821x1723 ---')
    rs_paint = np.random.RandomState(SEED + 19)
    fine_grain_exp = 1.0 + nd.gaussian_filter(rs_paint.normal(0.0, 0.032, (NEW_OH, NEW_OW)), 0.9)[..., None]
    shade_post_riv = compute_clean_hillshade(En_exp, zf=5.0, az_deg=315.0, alt_deg=45.0)
    shade_exp = shade_post_riv * fine_grain_exp
    # Enhanced relief shading inside The Arch (`w_arch_region`) and Greenstep (`w_gval_clim`):
    w_arch_region = meta_nw['w_arch_region']
    shade_arch = compute_clean_hillshade(En_exp, zf=8.0, az_deg=315.0, alt_deg=40.0) * fine_grain_exp
    w_arch_shade = (w_arch_region * (~whas_exp).astype(float))[..., None]
    shade_exp = shade_exp * (1.0 - 0.72 * w_arch_shade) + shade_arch * (0.72 * w_arch_shade)

    # Crisp NNW-lit flood-basalt terrace & rille hillshade in Greenstep (matching Godstep Valley's `PA.relight` zf=10 contrast):
    shade_gval = compute_clean_hillshade(En_exp, zf=9.5, az_deg=335.0, alt_deg=36.0) * fine_grain_exp
    scarp_relief_mult = np.clip(1.0 - 0.25 * w_gs_riser + 0.14 * w_gs_lip - 0.16 * w_gs_rille, 0.68, 1.22)[..., None]
    shade_gval = np.clip(shade_gval * scarp_relief_mult, 0.42, 1.62)
    w_gval_shade = (w_gval_clim * (~whas_exp).astype(float))[..., None]
    shade_exp = shade_exp * (1.0 - 0.85 * w_gval_shade) + shade_gval * (0.85 * w_gval_shade)

    # Crisp chasm, graben, chaos-mesa, and cataract hillshade inside Labyrinth (`w_lab_clim`), Great Chasm (`w_gc_clim`), and Xanadu (`w_xanadu_clim`):
    shade_chasm = compute_clean_hillshade(En_exp, zf=8.8, az_deg=315.0, alt_deg=38.0) * fine_grain_exp
    w_chasm_shade = (np.maximum(np.maximum(w_lab_clim, w_gc_clim), w_xanadu_clim) * (~whas_exp).astype(float))[..., None]
    shade_exp = shade_exp * (1.0 - 0.78 * w_chasm_shade) + shade_chasm * (0.78 * w_chasm_shade)
    del fine_grain_exp, shade_arch, w_arch_shade, shade_gval, scarp_relief_mult, w_gval_shade, shade_chasm, w_chasm_shade
    gc.collect()

    # Strip only the 5-pixel top/left canvas frame shadow (`r_i in range(5)`, `c_i in range(5)`) of `st_int`, `t_int`, `rt_int`, `ct_int`,
    # and apply the 8-pixel diagonal shoreline alignment ONLY inside the NW Crater Wall shoreline box (`x_old = 140..255`)
    # so `st_pad` and `t_pad` match `Eo_clean_edge` / `whas0_clean_edge` 100% without creating a line at `Y = 346` (`Comment 5`)!
    for arr_i in (st_int, t_int, rt_int, ct_int):
        for r_i in range(5):
            arr_i[r_i, :, :] = arr_i[5, :, :]
        for r_i in range(8):
            dx_s = int(round((8 - r_i) * 0.65))
            arr_i[r_i, 140:255, :] = arr_i[8, 140 - dx_s:255 - dx_s, :]
        for c_i in range(5):
            arr_i[:, c_i, :] = arr_i[:, 5, :]
        for c_i in range(8):
            dy_s = int(round((8 - c_i) * 0.85))
            arr_i[200:280, c_i, :] = arr_i[200 + dy_s:280 + dy_s, 8, :]

    # Embed interior `(1393, 1549)` painted maps into `[DY:, DX:]`
    st_pad = np.pad(st_int, ((DY, 0), (DX, 0), (0, 0)), mode='edge')
    t_pad = np.pad(t_int, ((DY, 0), (DX, 0), (0, 0)), mode='edge')
    rt_pad = np.pad(rt_int, ((DY, 0), (DX, 0), (0, 0)), mode='edge')
    ct_pad = np.pad(ct_int, ((DY, 0), (DX, 0), (0, 0)), mode='edge')

    # Apply the newly carved river-channel bank hillshade ratio (`shade_post_riv / shade_pre_riv`) to `t_pad` and `st_pad`
    # with gentle, natural valley-bank shading (never a harsh trench shadow)!
    riv_shade_ratio = np.clip((shade_post_riv + 1e-5) / (shade_pre_riv + 1e-5), 0.90, 1.10)
    w_riv_bank_shade = ((1.0 - G.sstep(0.0, 1.15, u_riv)) * (~whas_exp).astype(float))[..., None]
    riv_bank_mult = 1.0 + (riv_shade_ratio - 1.0) * w_riv_bank_shade
    t_pad = np.clip(t_pad.astype(float) * riv_bank_mult, 0.0, 255.0).round().astype(np.uint8)
    st_pad = np.clip(st_pad.astype(float) * riv_bank_mult, 0.0, 255.0).round().astype(np.uint8)

    # Organic domain-warped blending weight for the new N/W area + trans-boundary NE Outland Pass,
    # SW Crook–Rift Pass, Arachnoid Canyon/Breach, Crater Wall Unification, Step 2G passes, and Legacy Seam Fixes.
    # CRITICAL: `w_seam` is strictly `1.0` everywhere on `is_new_area` (`Y < 330` or `X < 272`) so 1D edge-repeated
    # padding streaks from `st_pad` / `t_pad` NEVER bleed into `is_new_area`, and feathers smoothly from `1.0 -> 0.0`
    # inside `[DY:, DX:]` (`d_into_old = 0..64 px`)!
    d_into_old = meta_nw['d_into_old']
    d_old_warped = d_into_old + G.sstep(0.0, 14.0, d_into_old) * (16.0 * meta_nw['fbm2'] + 8.0 * meta_nw['fbm1'])
    w_seam = np.where(
        is_new_area,
        1.0,
        np.where(old_lake_guard, G.sstep(0.0, 16.0, d_into_new), 1.0 - G.sstep(0.0, 64.0, d_old_warped)),
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
    del (
        w_sout_wall, w_sg_cliff_dissolve, w_sg_open_wall, ch_2g_exp, w_sg_repaint,
        t_int, rt_int, ct_int, shade_pre_riv, shade_post_riv, riv_shade_ratio, w_riv_bank_shade, riv_bank_mult,
        En_pre_riv, En_smooth_ref, riv_seed_mask, riv_bed_grid, riv_depth_grid, riv_hw_grid,
        d_to_riv_all, bed_near, depth_near, hw_near, u_riv, w_water_taper, w_riv_carve,
        floor_safe, min_safe_riv, h_riv_profile, d_to_water_px, wlev_nearest, w_iy, w_ix,
    )
    gc.collect()
    w_batch5_paint = np.maximum(
        np.maximum(np.maximum(w_silent_vales, w_sasquatch_vales), np.maximum(w_ne_outer_wall, w_nw_crater_scarp)),
        np.maximum(np.maximum(w_ozark_dolomite, w_porphyry_vein), w_tsunami_scour),
    )
    w_r3_paint = np.maximum(
        np.maximum(np.maximum(w_anc_basins, w_seow_clim), np.maximum(w_gc_clim, w_gh_clim)),
        np.maximum(
            np.maximum(w_twins_clim, w_oval_clim),
            np.maximum(w_gval_clim, np.maximum(w_shumar_clim, np.maximum(w_lab_clim, w_xanadu_clim))),
        ),
    )
    w_exp_paint = np.maximum(
        np.maximum(np.maximum(w_seam, w_wall_unify), np.maximum(w_nw_sea_unify, np.maximum(w_batch5_paint, w_r3_paint))),
        np.maximum(np.maximum(w_arach_paint, w_legacy_seams), np.maximum(w_ne_connector, w_sw_connector)),
    )[..., None]

    # 6A. Relief Map (`t`) on (1723, 1821) — Continuous hypsometric tinting following the contour slopes!
    t_hypso_exp = eval_hypso(En_exp, hypso_centers, hypso_meds)
    # In Greenstep (`w_gs_mare_paint`), give the 5 ponded flood-basalt terraces distinct stepped hypsometric relief tones
    # matching Godstep Valley (`[96, 146, 82]` -> `[124, 168, 90]` -> `[148, 188, 94]` -> `[168, 208, 92]` -> `[142, 202, 82]`),
    # rather than compressing 900..2,500 m into a single flat yellow band:
    gs_step_t_lut = np.array([
        [ 96.0, 146.0, 82.0],  # Terrace V (+3,260 m)
        [124.0, 168.0, 90.0],  # Terrace IV (+2,600 m)
        [148.0, 188.0, 94.0],  # Terrace III (+1,990 m, Tallwalls)
        [168.0, 208.0, 92.0],  # Terrace II (+1,450 m)
        [142.0, 202.0, 82.0],  # Terrace I (+940 m)
    ])
    s_idx_clamped = np.clip(gs_step_idx, 0.0, 4.0)
    i_lo = np.minimum(np.floor(s_idx_clamped).astype(int), 3)
    f_step = (s_idx_clamped - i_lo)[..., None]
    t_gs_step_col = gs_step_t_lut[i_lo] * (1.0 - f_step) + gs_step_t_lut[i_lo + 1] * f_step
    w_gs_t_blend = (w_gs_mare_paint * (1.0 - G.sstep(3400.0, 3900.0, En_exp)))[..., None]
    t_hypso_exp = t_hypso_exp * (1.0 - 0.88 * w_gs_t_blend) + t_gs_step_col * (0.88 * w_gs_t_blend)
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
    del (
        t_hypso_exp, t_gs_step_col, w_gs_t_blend, t_sea_col, w_shoal_t, t_syn_exp, t_pad,
        rt_syn_exp, rt_pad, ct_syn_exp, ct_pad, st_base_exp, neutral_exp, donor_excl,
    )
    gc.collect()

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

    # 5C. `neo-ozarks` (`rmvyiyw8ucd1y`): Dissected Cherty Dolomite/Limestone Bluffs & Exposed Purple-Red Porphyry Veins!
    w_oz_bluff = w_ozark_dolomite * G.sstep(45.0, 165.0, np.hypot(gx_e, gy_e) * 1000.0) * (~whas_exp).astype(float)
    oz_dolomite_rgb = np.array([204.0, 192.0, 166.0]) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.62 * w_oz_bluff[..., None]) + oz_dolomite_rgb * (0.62 * w_oz_bluff[..., None])

    w_porph_st = np.clip(w_porphyry_vein * 1.15, 0.0, 1.0) * (~whas_exp).astype(float)
    porphyry_rgb = np.array([156.0, 78.0, 74.0]) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.78 * w_porph_st[..., None]) + porphyry_rgb * (0.78 * w_porph_st[..., None])

    # 5D. `Silent Vales` (`rmvyk0ubpkdoy`): Connected Cool-Temperate Cedar-Hemlock-Fern Valley Forests!
    w_sv_st = w_silent_vales * (1.0 - G.sstep(2450.0, 3650.0, En_exp)) * (~whas_exp).astype(float)
    u_sv_el = np.clip((En_exp - 1100.0) / 1900.0, 0.0, 1.0)[..., None]
    sv_forest_rgb = (
        np.array([50.0, 102.0, 52.0]) * (1.0 - u_sv_el)
        + np.array([86.0, 118.0, 64.0]) * u_sv_el
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.78 * w_sv_st[..., None]) + sv_forest_rgb * (0.78 * w_sv_st[..., None])

    # 5E. `sasquatch tribes` (`rmvyj1kvhx4m4`): Smaller, Harsher Periglacial Tundra & Fellfield Valleys (+5,850..+6,240 m)!
    w_sq_st = G.sstep(0.05, 0.55, w_sasquatch_vales) * (1.0 - G.sstep(6220.0, 6650.0, En_exp)) * (~whas_exp).astype(float)
    sq_fellfield_rgb = (
        np.array([104.0, 112.0, 76.0]) * (1.0 - G.sstep(5920.0, 6180.0, En_exp)[..., None])
        + np.array([138.0, 128.0, 104.0]) * G.sstep(5920.0, 6180.0, En_exp)[..., None]
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.84 * w_sq_st[..., None]) + sq_fellfield_rgb * (0.84 * w_sq_st[..., None])

    # 5F. `tsunami coast` (`rmvyk62bgdvs3`): Wave-Planed Salt-Bleached Scour Bench & V-Shaped Megatsunami Boulder Chevrons!
    w_tsu_bench = w_tsunami_scour * (~whas_exp).astype(float)
    tsu_bench_rgb = np.array([148.0, 142.0, 122.0]) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.56 * w_tsu_bench[..., None]) + tsu_bench_rgb * (0.56 * w_tsu_bench[..., None])

    w_tsu_chev = np.clip(w_tsunami_chevron * 1.25, 0.0, 1.0) * (~whas_exp).astype(float)
    tsu_chev_rgb = np.array([186.0, 176.0, 152.0]) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.72 * w_tsu_chev[..., None]) + tsu_chev_rgb * (0.72 * w_tsu_chev[..., None])

    # 5G. `ne outer wall` (`rmvymakpc0pft`) — *The Glass-Skarn Bastion* & Impact-Crater Pseudotachylite Scarps:
    #   - Geothermal Boxwork Cauldron cloud-forests (`[52, 108, 56]`),
    #   - Contact-metamorphic Epidote-Green (`[92, 134, 82]`) & Grossular-Garnet Red (`[158, 68, 60]`) skarn banding,
    #   - Dark columnar basalt dike-walls & obsidian pseudotachylite fault mirrors (`[54, 52, 58]`) across `ne outer wall` & `NW outer wall`!
    w_ne_cauld_st = np.clip(w_ne_cauldron * (1.0 - G.sstep(3450.0, 4050.0, En_exp)), 0.0, 1.0) * (~whas_exp).astype(float)
    cauld_forest_rgb = np.array([54.0, 110.0, 58.0]) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.78 * w_ne_cauld_st[..., None]) + cauld_forest_rgb * (0.78 * w_ne_cauld_st[..., None])

    skarn_band_phase = 0.5 + 0.5 * np.sin((X_exp * 0.18 - Y_exp * 0.24) + 3.5 * meta_nw['fbm1'])
    skarn_rgb = (
        np.array([92.0, 134.0, 82.0]) * (1.0 - skarn_band_phase[..., None])
        + np.array([158.0, 68.0, 60.0]) * skarn_band_phase[..., None]
    ) * shade_exp
    w_skarn_st = np.clip(w_ne_skarn * 0.85, 0.0, 1.0) * (~whas_exp).astype(float)
    st_clim_exp = st_clim_exp * (1.0 - 0.74 * w_skarn_st[..., None]) + skarn_rgb * (0.74 * w_skarn_st[..., None])

    w_pseudo_scarp = np.clip(np.maximum(w_ne_dike_rib * 0.92, w_nw_crater_scarp * 0.68), 0.0, 1.0) * (~whas_exp).astype(float)
    pseudo_rgb = np.array([56.0, 54.0, 62.0]) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.76 * w_pseudo_scarp[..., None]) + pseudo_rgb * (0.76 * w_pseudo_scarp[..., None])

    # 5H. Ancient's Valley Vitrified Blast Rims (`w_anc_rim_glass`), The Great Chasm (`w_gc_clim`), & Godshearth (`w_gh_clim`):
    w_anc_glass_st = np.clip(w_anc_rim_glass, 0.0, 1.0) * (~whas_exp).astype(float)
    st_clim_exp = st_clim_exp * (1.0 - 0.74 * w_anc_glass_st[..., None]) + (np.array([64.0, 66.0, 58.0]) * shade_exp) * (0.74 * w_anc_glass_st[..., None])

    # Great Chasm: dark komatiite/obsidian fire-fissure floor with sulfur/amber hydrothermal aprons, sheeted-dike walls,
    # and Northern Headwall Chaos Terrain (`w_gc_chaos_mesa_full` warm ochre-basalt mesa caps & `w_gc_chaos_ch_full` dark outflow channels):
    w_gc_floor_st = np.maximum(w_gc_clim * (1.0 - G.sstep(-150.0, 450.0, En_exp)), 0.85 * w_gc_chaos_ch_full) * (~whas_exp).astype(float)
    sulf_phase_gc = 0.5 + 0.5 * np.sin((X_exp * 0.28 + Y_exp * 0.22) + 3.2 * meta_nw['fbm2'])
    gc_floor_rgb = (
        np.array([52.0, 44.0, 42.0]) * (1.0 - 0.48 * sulf_phase_gc[..., None])
        + np.array([154.0, 102.0, 52.0]) * (0.48 * sulf_phase_gc[..., None])
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.84 * w_gc_floor_st[..., None]) + gc_floor_rgb * (0.84 * w_gc_floor_st[..., None])

    w_gc_wall_st = w_gc_clim * G.sstep(250.0, 950.0, En_exp) * (1.0 - G.sstep(3400.0, 4400.0, En_exp)) * (~whas_exp).astype(float)
    gc_wall_rgb = (
        np.array([116.0, 82.0, 62.0]) * (1.0 - 0.45 * G.sstep(1800.0, 3200.0, En_exp)[..., None])
        + np.array([76.0, 58.0, 52.0]) * (0.45 * G.sstep(1800.0, 3200.0, En_exp)[..., None])
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.78 * w_gc_wall_st[..., None]) + gc_wall_rgb * (0.78 * w_gc_wall_st[..., None])

    w_gc_mesa_st = np.clip(w_gc_chaos_mesa_full * 0.90, 0.0, 1.0) * (~whas_exp).astype(float)
    gc_mesa_rgb = np.array([156.0, 114.0, 80.0]) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.80 * w_gc_mesa_st[..., None]) + gc_mesa_rgb * (0.80 * w_gc_mesa_st[..., None])

    # Godshearth: Climax Hearth-Tree forest (`[66, 98, 54]`), opaline sinter & orange fountain-glass apron (`[188, 148, 96]`),
    # and a smooth subalpine krummholz -> heather-scree transition belt (`3,940..4,850 m`) with NO dark outline ring:
    w_gh_oasis_st = w_gh_clim * (1.0 - G.sstep(3920.0, 4680.0, En_exp)) * (~whas_exp).astype(float)
    w_gh_sinter = np.exp(-((r_gh_lake - 2.8) / 2.6) ** 2) * w_gh_oasis_st
    u_gh_subalp = G.sstep(3900.0, 4620.0, En_exp)[..., None]
    gh_floor_rgb = (
        np.array([66.0, 98.0, 54.0]) * (1.0 - 0.65 * w_gh_sinter[..., None])
        + np.array([188.0, 148.0, 96.0]) * (0.65 * w_gh_sinter[..., None])
    )
    gh_subalp_rgb = (
        np.array([96.0, 108.0, 68.0]) * (1.0 - u_gh_subalp)
        + np.array([132.0, 124.0, 102.0]) * u_gh_subalp
    )
    gh_hearth_rgb = (gh_floor_rgb * (1.0 - u_gh_subalp) + gh_subalp_rgb * u_gh_subalp) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.82 * w_gh_oasis_st[..., None]) + gh_hearth_rgb * (0.82 * w_gh_oasis_st[..., None])

    # SE Outer Wall (`rmw4xy4tp9b29`) & The Godsgate:
    #   - Sheltered Highland Tarn Oasis meadows (`w_seow_oasis`: furlarch, cushion domes, and Amber-Sinter Dwarf Hearth grove),
    #   - Impact megabreccia & pseudotachylite fault-mirror slump scarps (`[102, 92, 84]` to `[58, 56, 64]`),
    #   - Glaciated horn peaks & arêtes above +4,950 m (`w_snow_exp`):
    w_seow_oasis_st = np.clip(w_seow_oasis * (1.0 - G.sstep(4420.0, 4680.0, En_exp)), 0.0, 1.0) * (~whas_exp).astype(float)
    seow_oasis_rgb = (
        np.array([64.0, 108.0, 58.0]) * (1.0 - 0.55 * w_amber_geo[..., None])
        + np.array([176.0, 138.0, 88.0]) * (0.55 * w_amber_geo[..., None])
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.82 * w_seow_oasis_st[..., None]) + seow_oasis_rgb * (0.82 * w_seow_oasis_st[..., None])

    w_seow_felsen = w_seow_clim * G.sstep(3950.0, 4350.0, En_exp) * (1.0 - G.sstep(5050.0, 5550.0, En_exp)) * (~whas_exp).astype(float) * (1.0 - 0.85 * w_seow_oasis_st)
    felsen_phase = np.clip(0.5 + 0.35 * meta_nw['fbm1'] + 0.25 * meta_nw['fbm2'], 0.0, 1.0)
    seow_felsen_rgb = (
        np.array([118.0, 106.0, 94.0]) * (1.0 - 0.52 * felsen_phase[..., None])
        + np.array([68.0, 66.0, 74.0]) * (0.52 * felsen_phase[..., None])
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.72 * w_seow_felsen[..., None]) + seow_felsen_rgb * (0.72 * w_seow_felsen[..., None])

    # Twins (`rmw536m06wlyf`, Option A):
    #   - 5 Geothermal Temperature Oases (`w_twins_oasis`: dwarf Hearth groves, warm travertine sinter & green moss mats),
    #   - 2 Active Lava-Pool Traps (`w_twins_lava`: dark obsidian/basalt pit rims with incandescent orange-red fissure glow),
    #   - NW Active Basalt/Dacite Cone (`[58, 54, 60]`) and SE Erebus Blue-Ice Glaciated Cone (`[176, 224, 236]`):
    w_twins_oasis_st = np.clip(w_twins_oasis * (1.0 - G.sstep(4780.0, 5050.0, En_exp)), 0.0, 1.0) * (~whas_exp).astype(float)
    twins_oasis_rgb = (
        np.array([66.0, 106.0, 56.0]) * (1.0 - 0.45 * felsen_phase[..., None])
        + np.array([182.0, 142.0, 92.0]) * (0.45 * felsen_phase[..., None])
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.84 * w_twins_oasis_st[..., None]) + twins_oasis_rgb * (0.84 * w_twins_oasis_st[..., None])

    w_nw_cone_st = (1.0 - G.sstep(4.5, 14.0, np.hypot(X_exp - 988.0, Y_exp - 1458.0))) * (~whas_exp).astype(float)
    st_clim_exp = st_clim_exp * (1.0 - 0.78 * w_nw_cone_st[..., None]) + (np.array([62.0, 56.0, 62.0]) * shade_exp) * (0.78 * w_nw_cone_st[..., None])

    w_twins_lava_st = np.clip(w_twins_lava, 0.0, 1.0) * (~whas_exp).astype(float)
    lava_glow_rgb = (
        np.array([48.0, 42.0, 44.0]) * (1.0 - 0.55 * w_twins_lava[..., None])
        + np.array([214.0, 88.0, 42.0]) * (0.55 * w_twins_lava[..., None])
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.88 * w_twins_lava_st[..., None]) + lava_glow_rgb * (0.88 * w_twins_lava_st[..., None])
    del (
        u_elev_veg, veg_cont_rgb, u_arch_horst, u_arch_crest, arch_trough_col, arch_horst_col, arch_ridge_rgb,
        nile_ribbon_rgb, delta_island_rgb, cop_band, cop_ice_rgb, u_sout_elev, sout_pass_rgb,
        oz_dolomite_rgb, porphyry_rgb, u_sv_el, sv_forest_rgb, sq_fellfield_rgb,
        tsu_bench_rgb, tsu_chev_rgb, cauld_forest_rgb, skarn_band_phase, skarn_rgb, pseudo_rgb,
        sulf_phase_gc, gc_floor_rgb, gc_wall_rgb, gc_mesa_rgb,
        u_gh_subalp, gh_floor_rgb, gh_subalp_rgb, gh_hearth_rgb,
        seow_oasis_rgb, felsen_phase, seow_felsen_rgb, twins_oasis_rgb, lava_glow_rgb,
    )
    gc.collect()

    # Opal Valley (`rmw52q8d7prwz`):
    #   - Iridescent Xanadu-kin teal-emerald & violet-plum foliage (`[46, 114, 96]` to `[108, 86, 116]`) on the valley floor & benches,
    #   - Warm copper-rose & harlequin opaline sinter scarps/terraces (`[188, 136, 106]`),
    #   - Blue-opalescent Prism Glacier tongue at the eastern headwall (`X >= 1102, En_exp >= 3650 m`):
    w_oval_forest_st = w_oval_clim * (1.0 - G.sstep(3150.0, 3850.0, En_exp)) * (~whas_exp).astype(float)
    irid_phase = np.clip(0.5 + 0.38 * meta_nw['fbm1'] - 0.28 * meta_nw['fbm2'], 0.0, 1.0)
    u_ov_el = np.clip(En_exp / 2900.0, 0.0, 1.0)[..., None]
    oval_irid_rgb = (
        np.array([46.0, 114.0, 96.0]) * (1.0 - 0.42 * irid_phase[..., None]) * (1.0 - 0.45 * u_ov_el)
        + np.array([106.0, 88.0, 114.0]) * (0.42 * irid_phase[..., None]) * (1.0 - 0.45 * u_ov_el)
        + np.array([178.0, 134.0, 104.0]) * (0.45 * u_ov_el)
    ) * shade_exp
    w_sinter_rim = np.clip(w_oval_sinter * 0.65, 0.0, 1.0)[..., None]
    oval_irid_rgb = oval_irid_rgb * (1.0 - 0.48 * w_sinter_rim) + (np.array([196.0, 152.0, 118.0]) * shade_exp) * (0.48 * w_sinter_rim)
    st_clim_exp = st_clim_exp * (1.0 - 0.84 * w_oval_forest_st[..., None]) + oval_irid_rgb * (0.84 * w_oval_forest_st[..., None])

    w_prism_glac = w_oval_clim * G.sstep(1098.0, 1116.0, X_exp) * G.sstep(3550.0, 4050.0, En_exp) * (~whas_exp).astype(float)
    prism_glac_rgb = (
        np.array([176.0, 228.0, 234.0]) * (1.0 - 0.35 * irid_phase[..., None])
        + np.array([218.0, 236.0, 246.0]) * (0.35 * irid_phase[..., None])
    ) * np.clip(shade_exp, 0.78, 1.16)
    st_clim_exp = st_clim_exp * (1.0 - 0.86 * w_prism_glac[..., None]) + prism_glac_rgb * (0.86 * w_prism_glac[..., None])

    # Greenstep (`rmw5n1w1rx0u2`, renamed from `Green Valley`):
    #   - 5 Distinct Flood-Basalt Terrace Canopy Steps (Terrace V subalpine paramo -> Terrace IV cloud-forest ->
    #     Terrace III Tallwalls giant-parkland -> Terrace II orchard/cataract bench -> Terrace I lowland emerald rainforest),
    #   - Sunlit golden-chartreuse rim-lip brows (`w_gs_lip`: `[116, 150, 74]`),
    #   - Exposed blue-black columnar titanium-basalt riser scarps (`w_gs_riser`: `[48, 52, 58]`) with silvery waterfall mist
    #     plumes (`[176, 202, 196]`) where the two rilles plunge over the risers,
    #   - Deep shadowed moss-and-basalt collapsed lava-tube rille gorges (`w_gs_rille`: `[34, 60, 38]`):
    w_gval_forest_st = w_gval_clim * (1.0 - G.sstep(3450.0, 4150.0, En_exp)) * (~whas_exp).astype(float)
    gs_step_st_lut = np.array([
        [ 98.0, 114.0, 62.0],  # Terrace V (+3,260 m: subalpine ruffle-crown & peat-bog paramo)
        [ 58.0, 112.0, 64.0],  # Terrace IV (+2,600 m: cool mist-jade spiral-fern cloud forest)
        [ 78.0, 128.0, 56.0],  # Terrace III (+1,990 m: Tallwalls sunlit giant-parkland & murus gallicus clearing)
        [ 52.0, 114.0, 48.0],  # Terrace II (+1,450 m: warm jade sprawl-oak & giant-orchard bench)
        [ 38.0,  96.0, 42.0],  # Terrace I (+940 m: deep lowland emerald hyper-rainforest)
    ])
    gval_step_canopy = gs_step_st_lut[i_lo] * (1.0 - f_step) + gs_step_st_lut[i_lo + 1] * f_step
    u_gv_el = np.clip((En_exp - 900.0) / 2600.0, 0.0, 1.0)[..., None]
    gval_wall_canopy = (
        np.array([42.0, 102.0, 46.0]) * ((1.0 - u_gv_el) ** 1.3)
        + np.array([64.0, 114.0, 52.0]) * (2.0 * u_gv_el * (1.0 - u_gv_el))
        + np.array([92.0, 118.0, 62.0]) * (u_gv_el ** 1.3)
    )
    w_mare_st = np.clip(w_gs_mare_paint, 0.0, 1.0)[..., None]
    gval_base_rgb = gval_wall_canopy * (1.0 - 0.85 * w_mare_st) + gval_step_canopy * (0.85 * w_mare_st)
    # Rim-lip brow highlight (`w_gs_lip`), dark columnar-basalt riser cliff (`w_gs_riser`), waterfall mist, and rille gorge (`w_gs_rille`):
    w_lip_c = np.clip(w_gs_lip * 0.72, 0.0, 1.0)[..., None]
    gval_base_rgb = gval_base_rgb * (1.0 - w_lip_c) + np.array([116.0, 150.0, 74.0]) * w_lip_c
    w_rille_c = np.clip(w_gs_rille * 0.68, 0.0, 1.0)[..., None]
    gval_base_rgb = gval_base_rgb * (1.0 - w_rille_c) + np.array([34.0, 60.0, 38.0]) * w_rille_c
    w_cataract_mist = np.clip(w_gs_riser * w_gs_rille * 1.35, 0.0, 1.0)[..., None]
    riser_cliff_col = np.array([48.0, 52.0, 58.0]) * (1.0 - 0.65 * w_cataract_mist) + np.array([176.0, 202.0, 196.0]) * (0.65 * w_cataract_mist)
    w_riser_c = np.clip(w_gs_riser * 0.82, 0.0, 1.0)[..., None]
    gval_base_rgb = gval_base_rgb * (1.0 - w_riser_c) + riser_cliff_col * w_riser_c
    gval_forest_rgb = gval_base_rgb * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.88 * w_gval_forest_st[..., None]) + gval_forest_rgb * (0.88 * w_gval_forest_st[..., None])

    # Shumar (`rmw5s3ktxgv0d`) Continental Highland Boreal-Montane Taiga, Subarctic Krummholz, & Periglacial Shoulder (`+2,750..+4,380 m`, `Dsb`/`Dfb`/`Dsc`/`Dfc`/`ET`):
    w_shumar_forest_st = (
        w_shumar_clim
        * G.sstep(-18.0, 8.0, sd_shumar)
        * (1.0 - G.sstep(3850.0, 4550.0, En_exp))
        * (~whas_exp).astype(float)
    )
    u_sh_el = np.clip((En_exp - 2750.0) / 1450.0, 0.0, 1.0)[..., None]
    shumar_taiga_rgb = (
        np.array([58.0, 96.0, 54.0]) * ((1.0 - u_sh_el) ** 1.6)
        + np.array([92.0, 108.0, 64.0]) * (2.2 * u_sh_el * ((1.0 - u_sh_el) ** 1.1))
        + np.array([128.0, 122.0, 96.0]) * (u_sh_el ** 1.5)
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.76 * w_shumar_forest_st[..., None]) + shumar_taiga_rgb * (0.76 * w_shumar_forest_st[..., None])
    del (
        irid_phase, u_ov_el, oval_irid_rgb, w_sinter_rim, prism_glac_rgb,
        gval_step_canopy, u_gv_el, gval_wall_canopy, w_mare_st, gval_base_rgb,
        w_lip_c, w_rille_c, w_cataract_mist, riser_cliff_col, w_riser_c, gval_forest_rgb,
        u_sh_el, shumar_taiga_rgb,
    )
    gc.collect()

    # Labyrinth (`rmw8bqrn3dnx4`):
    #   - Fine-scale microclimate palette across the graben & E/NE Chaos Amphitheatre floors (`< 3,950 m`):
    #     * Rain-shadow `BWk`/`BSk` chasms (`rain_exp < 360 mm/yr`): warm gypsum/sulfate-ochre & dry steppe `[164, 132, 94]`,
    #     * Lake-mist & eastern breach `Cfb`/`Csb`/`Dfb` oases: lush emerald-jade gallery forest `[52, 108, 56]`,
    #     * Cold-air-pooled shaded boreal `Dfc`/`Dsc` gorges: deep blue-spruce & subalpine taiga `[58, 92, 66]`,
    #   - Steep polyhedral fault-scarp & chaos-mesa walls (`w_lab_wall_full`: banded terracotta-sulfate `[156, 106, 74]`
    #     and dark flood-basalt columns `[62, 54, 54]`),
    #   - Snow-capped polyhedral horst mesas & SW Glaciated Dome (`4,250..6,350 m` via `w_snow_exp`):
    w_lab_floor_st = w_lab_clim * (1.0 - G.sstep(3350.0, 4150.0, En_exp)) * (~whas_exp).astype(float)
    u_lb_el = np.clip((En_exp - 1350.0) / 2450.0, 0.0, 1.0)[..., None]
    u_lb_moist = G.sstep(230.0, 480.0, rain_exp)[..., None]
    u_lb_cold_pool = np.clip(w_shaded_gorge, 0.0, 1.0)[..., None]
    lab_humid_rgb = (
        np.array([50.0, 108.0, 54.0]) * ((1.0 - u_lb_el) ** 1.3)
        + np.array([86.0, 114.0, 64.0]) * (2.0 * u_lb_el * (1.0 - u_lb_el))
        + np.array([124.0, 116.0, 84.0]) * (u_lb_el ** 1.3)
    )
    lab_arid_rgb = (
        np.array([166.0, 134.0, 96.0]) * (1.0 - 0.45 * u_lb_el)
        + np.array([142.0, 122.0, 88.0]) * (0.45 * u_lb_el)
    )
    lab_boreal_rgb = np.array([54.0, 88.0, 64.0])
    lab_floor_rgb = (
        (lab_arid_rgb * (1.0 - u_lb_moist) + lab_humid_rgb * u_lb_moist) * (1.0 - 0.55 * u_lb_cold_pool)
        + lab_boreal_rgb * (0.55 * u_lb_cold_pool)
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.84 * w_lab_floor_st[..., None]) + lab_floor_rgb * (0.84 * w_lab_floor_st[..., None])

    w_lab_scarp_st = np.clip(w_lab_wall_full * 0.92, 0.0, 1.0) * (~whas_exp).astype(float)
    strata_phase_lb = 0.5 + 0.5 * np.sin(En_exp / 145.0 * 2.0 * math.pi + 2.4 * meta_nw['fbm1'])
    lab_scarp_rgb = (
        np.array([154.0, 104.0, 74.0]) * (1.0 - 0.52 * strata_phase_lb[..., None])
        + np.array([64.0, 54.0, 54.0]) * (0.52 * strata_phase_lb[..., None])
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.78 * w_lab_scarp_st[..., None]) + lab_scarp_rgb * (0.78 * w_lab_scarp_st[..., None])

    # Firebliss Range (`rmw8hj62nmugn`):
    #   - 4 Sheltered Temperate Geothermal Valleys (`w_fb_valley_full`: lush cloud-forest & tree-fern jade `[44, 108, 52]`
    #     with warm golden-ochre/ivory travertine & sulfur sinter rings `w_fb_sinter_full`: `[196, 158, 104]`),
    #   - 5 Glaciovolcanic Stratocones & Degassing Calderas (`w_fb_cone_full` & `w_fb_crater_full`: dark basaltic-andesite
    #     cinder/tephra cones `[58, 52, 56]` and glowing fumarolic/lava-lake caldera floors `[206, 94, 46]`),
    #   - Downwind SE Tephra Streaks across the glaciated ice cap (`w_firebliss_ash` on `snow_col_exp`):
    w_fb_val_st = np.clip(w_fb_valley_full, 0.0, 1.0) * (1.0 - G.sstep(3150.0, 3850.0, En_exp)) * (~whas_exp).astype(float)
    u_fb_el = np.clip((En_exp - 1850.0) / 1450.0, 0.0, 1.0)[..., None]
    fb_val_rgb = (
        np.array([42.0, 106.0, 50.0]) * ((1.0 - u_fb_el) ** 1.3)
        + np.array([76.0, 118.0, 58.0]) * (2.0 * u_fb_el * (1.0 - u_fb_el))
        + np.array([118.0, 118.0, 76.0]) * (u_fb_el ** 1.3)
    )
    w_fb_sinter_c = np.clip(w_fb_sinter_full * 0.72, 0.0, 1.0)[..., None]
    sinter_phase_fb = 0.5 + 0.5 * np.sin(En_exp / 45.0 * 2.0 * math.pi + 2.0 * meta_nw['fbm2'])
    fb_sinter_rgb = (
        np.array([202.0, 166.0, 108.0]) * (1.0 - 0.45 * sinter_phase_fb[..., None])
        + np.array([178.0, 122.0, 84.0]) * (0.45 * sinter_phase_fb[..., None])
    )
    fb_val_rgb = (fb_val_rgb * (1.0 - w_fb_sinter_c) + fb_sinter_rgb * w_fb_sinter_c) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.88 * w_fb_val_st[..., None]) + fb_val_rgb * (0.88 * w_fb_val_st[..., None])

    w_fb_cone_st = np.clip(w_fb_cone_full * 0.85, 0.0, 1.0) * (~whas_exp).astype(float)
    fb_cone_rgb = np.array([62.0, 56.0, 60.0]) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.78 * w_fb_cone_st[..., None]) + fb_cone_rgb * (0.78 * w_fb_cone_st[..., None])

    w_fb_crat_st = np.clip(w_fb_crater_full, 0.0, 1.0) * (~whas_exp).astype(float)
    fb_crat_rgb = (
        np.array([52.0, 46.0, 48.0]) * (1.0 - 0.58 * w_fb_crater_full[..., None])
        + np.array([212.0, 96.0, 46.0]) * (0.58 * w_fb_crater_full[..., None])
    ) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.88 * w_fb_crat_st[..., None]) + fb_crat_rgb * (0.88 * w_fb_crat_st[..., None])

    # Xanadu & Oidong Dramatic Rift-Valley Benches, Exposed Horst Fault Scarps, & Silvery Cataract Mist (`w_xanadu_clim`):
    w_xan_forest_st = w_xanadu_clim * (1.0 - G.sstep(2850.0, 3650.0, En_exp)) * (~whas_exp).astype(float)
    u_xn_el = np.clip((En_exp - (-1700.0)) / 4200.0, 0.0, 1.0)[..., None]
    xan_valley_rgb = (
        np.array([38.0, 98.0, 48.0]) * ((1.0 - u_xn_el) ** 1.35)
        + np.array([72.0, 114.0, 58.0]) * (2.0 * u_xn_el * (1.0 - u_xn_el))
        + np.array([116.0, 114.0, 76.0]) * (u_xn_el ** 1.35)
    )
    # Warm sunlit dry-summer `Csb` horst spine & fault benches vs dark exposed normal-fault rock facets:
    xan_csb_rgb = np.array([124.0, 118.0, 74.0])
    xan_valley_rgb = xan_valley_rgb * (1.0 - 0.55 * w_xn_sun_ridge[..., None]) + xan_csb_rgb * (0.55 * w_xn_sun_ridge[..., None])
    w_xan_scarp_rock = G.sstep(210.0, 560.0, slope_xn_c) * (1.0 - 0.65 * w_xanadu_cataract_foam)
    strata_xn = 0.5 + 0.5 * np.sin(En_exp / 160.0 * 2.0 * math.pi + 2.2 * meta_nw['fbm1'])
    xan_rock_rgb = (
        np.array([132.0, 102.0, 82.0]) * (1.0 - 0.55 * strata_xn[..., None])
        + np.array([58.0, 52.0, 54.0]) * (0.55 * strata_xn[..., None])
    )
    xan_valley_rgb = (xan_valley_rgb * (1.0 - 0.72 * w_xan_scarp_rock[..., None]) + xan_rock_rgb * (0.72 * w_xan_scarp_rock[..., None])) * shade_exp
    w_xan_mist_c = np.clip(w_xanadu_cataract_foam * 0.78, 0.0, 1.0)[..., None]
    xan_valley_rgb = xan_valley_rgb * (1.0 - w_xan_mist_c) + (np.array([186.0, 222.0, 218.0]) * np.clip(shade_exp, 0.85, 1.15)) * w_xan_mist_c
    st_clim_exp = st_clim_exp * (1.0 - 0.84 * w_xan_forest_st[..., None]) + xan_valley_rgb * (0.84 * w_xan_forest_st[..., None])

    # 6. High Alpine Snow & Glaciers (`4,150 m <= En_exp < 8,200 m`) & Airless Dark Rust-Red Outer Plateau (`En_exp >= 7,600 m`):
    # Smoothly continuous `snow_thresh` so there is zero boolean jump ring around `sasquatch tribes`, `Silent Vales`, `godshearth`, `SE outer wall`, `twins`, `opal valley`, `Greenstep`, `Shumar`, or `Labyrinth`!
    snow_thresh = (
        4150.0
        + 1700.0 * np.maximum(G.sstep(0.10, 0.45, w_tharn), G.sstep(0.05, 0.35, w_sout_pass_exp))
        + 2180.0 * G.sstep(0.05, 0.55, w_sasquatch_vales)
        + 450.0 * w_gh_clim
        + 680.0 * w_seow_clim
        + 550.0 * w_twins_clim
        + 380.0 * w_oval_clim
        + 420.0 * w_gval_clim
        + 180.0 * w_shumar_clim
        + 120.0 * w_lab_clim
    )
    w_snow_exp = (
        G.sstep(snow_thresh, snow_thresh + 750.0, En_exp)
        * (1.0 - G.sstep(7400.0, 8600.0, En_exp))
        * (~whas_exp).astype(float)
        * (1.0 - 0.72 * w_cop_glac)
        * (1.0 - 0.88 * w_sout_pass_exp)
        * (1.0 - 0.92 * w_sv_st)
        * (1.0 - 0.90 * w_sq_st)
        * (1.0 - 0.88 * w_ne_cauld_st)
        * (1.0 - 0.92 * w_gh_oasis_st)
        * (1.0 - 0.92 * w_seow_oasis_st)
        * (1.0 - 0.92 * w_twins_oasis_st)
        * (1.0 - 0.90 * w_twins_lava_st)
        * (1.0 - 0.88 * w_oval_forest_st)
        * (1.0 - 0.94 * w_gval_forest_st)
        * (1.0 - 0.92 * w_shumar_forest_st)
        * (1.0 - 0.92 * w_lab_floor_st)
        * (1.0 - 0.70 * w_lab_scarp_st)
        * (1.0 - 0.92 * w_fb_val_st)
        * (1.0 - 0.75 * w_fb_cone_st)
        * (1.0 - 0.92 * w_fb_crat_st)
        * (1.0 - 0.92 * w_xan_forest_st)
    )
    tephra_streak = np.clip(w_firebliss_ash * (0.55 + 0.45 * np.sin((X_exp - Y_exp) * 0.16 + 1.8 * meta_nw['fbm1'])), 0.0, 1.0)[..., None]
    snow_rgb_exp = (
        np.array([238.0, 240.0, 244.0]) * (1.0 - 0.42 * tephra_streak)
        + np.array([118.0, 114.0, 120.0]) * (0.42 * tephra_streak)
    ) * np.clip(shade_exp, 0.74, 1.16)
    st_clim_exp = st_clim_exp * (1.0 - 0.88 * w_snow_exp[..., None]) + snow_rgb_exp * (0.88 * w_snow_exp[..., None])

    w_airless_rust = G.sstep(7200.0, 8500.0, En_exp) * (~whas_exp).astype(float)
    airless_rust_rgb = np.array([124.0, 48.0, 30.0]) * shade_exp
    st_clim_exp = st_clim_exp * (1.0 - 0.90 * w_airless_rust[..., None]) + airless_rust_rgb * (0.90 * w_airless_rust[..., None])

    # 8. Ocean, Double Delta Channels, Explosive Seamount Shoals, Eastern Highland Lake, Copper Tarn, & Opal Valley Terraced Lakes on `st`:
    ocean_deep_rgb = np.median(st_int[:160, :160][whas3_1393[:160, :160]], axis=0) if whas3_1393[:160, :160].any() else np.array([34.0, 74.0, 96.0])
    ocean_shall_rgb = np.array([56.0, 114.0, 124.0])
    w_deep_sea = G.sstep(0.0, 24.0, din_water_exp)[..., None]
    st_sea_col = ocean_shall_rgb * (1.0 - w_deep_sea) + ocean_deep_rgb * w_deep_sea

    w_sm_plume = (meta_nw['is_seamount'] & whas_exp)[..., None] * G.sstep(-320.0, -10.0, En_exp)[..., None]
    st_sea_col = st_sea_col * (1.0 - 0.68 * w_sm_plume) + np.array([78.0, 172.0, 168.0]) * (0.68 * w_sm_plume)
    st_sea_col = np.where(is_copper_tarn[..., None], np.array([52.0, 184.0, 162.0]), st_sea_col)
    is_batch5_hlake = is_high_lake | (whas_exp & ((w_silent_vales > 0.05) | (w_sasquatch_vales > 0.05) | (w_ne_outer_wall > 0.05)))
    st_sea_col = np.where(is_batch5_hlake[..., None], np.array([42.0, 108.0, 128.0]), st_sea_col)
    is_ne_cauld_tarn = whas_exp & ((w_ne_outer_wall > 0.15) | is_gh_lake | is_seow_tarn)
    st_sea_col = np.where(is_ne_cauld_tarn[..., None], np.array([48.0, 166.0, 152.0]), st_sea_col)
    # Pearlescent milky-turquoise -> opaline-jade water color across the 10 terraced rift lakes of Opal Valley, 8 Labyrinth meltwater lakes, & 4 Firebliss geothermal tarns:
    st_sea_col = np.where(is_oval_lake[..., None], np.array([64.0, 188.0, 176.0]), st_sea_col)
    st_sea_col = np.where(is_lab_lake[..., None], np.array([48.0, 172.0, 164.0]), st_sea_col)
    st_sea_col = np.where(is_fb_lake[..., None], np.array([54.0, 186.0, 172.0]), st_sea_col)
    st_sea_col = np.where((is_xanadu_small_lake | is_erewhon_lake)[..., None], np.array([42.0, 118.0, 132.0]), st_sea_col)

    st_syn_exp = np.where(whas_exp[..., None], st_sea_col * np.clip(shade_exp, 0.86, 1.12), st_clim_exp)
    st_final_exp = np.clip(st_pad.astype(float) * (1.0 - w_exp_paint) + st_syn_exp * w_exp_paint, 0.0, 255.0).round().astype(np.uint8)
    del (
        u_lb_el, u_lb_moist, u_lb_cold_pool, lab_humid_rgb, lab_arid_rgb, lab_floor_rgb, strata_phase_lb, lab_scarp_rgb,
        u_fb_el, fb_val_rgb, w_fb_sinter_c, sinter_phase_fb, fb_sinter_rgb, fb_cone_rgb, fb_crat_rgb,
        u_xn_el, xan_valley_rgb, strata_xn, xan_rock_rgb, w_xan_mist_c,
        tephra_streak, snow_rgb_exp, airless_rust_rgb,
        w_deep_sea, st_sea_col, w_sm_plume, st_clim_exp, st_syn_exp, st_pad, st_int, shade_exp, w_exp_paint,
    )
    gc.collect()

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
    D_paint_tmp['st'] = PA.paint_river(D_paint_tmp, 'st', oval_river_pts, width=1.8, colour=(58, 168, 160))
    D_paint_tmp['t'] = PA.paint_river(D_paint_tmp, 't', oval_river_pts, width=1.6, colour=(58, 112, 132))
    for lb_r_pts in lab_paint_rivers:
        D_paint_tmp['st'] = PA.paint_river(D_paint_tmp, 'st', lb_r_pts, width=1.7, colour=(52, 162, 158))
        D_paint_tmp['t'] = PA.paint_river(D_paint_tmp, 't', lb_r_pts, width=1.5, colour=(58, 112, 132))
    for xn_r_pts in xanadu_paint_rivers:
        D_paint_tmp['st'] = PA.paint_river(D_paint_tmp, 'st', xn_r_pts, width=2.1, colour=(64, 154, 168))
        D_paint_tmp['t'] = PA.paint_river(D_paint_tmp, 't', xn_r_pts, width=1.9, colour=(58, 112, 132))
    for r in rivers_exp:
        if str(r.get('id')) in ('30', 'r030') and r.get('px'):
            D_paint_tmp['st'] = PA.paint_river(D_paint_tmp, 'st', r['px'], width=1.8, colour=(52, 104, 128))
            D_paint_tmp['t'] = PA.paint_river(D_paint_tmp, 't', r['px'], width=1.6, colour=(58, 112, 132))
            break
    st_final_exp = np.array(Image.open(io.BytesIO(base64.b64decode(D_paint_tmp['st']))).convert('RGB'))
    t_final_exp = np.array(Image.open(io.BytesIO(base64.b64decode(D_paint_tmp['t']))).convert('RGB'))

    # 7E. Shift `outlets`, `palaeolakes`, `dams`, `floods`, `basins`, `hydro`
    outlets_exp = copy.deepcopy(D_old.get('outlets', []))
    for o in outlets_exp:
        if isinstance(o.get('from'), list) and len(o['from']) == 2:
            o['from'] = shift_pt(o['from'])
        if 'px' in o:
            o['px'] = shift_pts(o['px'])
        if "Ancient's Valley" in str(o.get('name', '')):
            o['lake_level_m'] = 17
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

    # 7F. Shift `regions` by (+272, +330), combine `NW outer wall` (`rmuqm8dxeuvhi`) & `nw outer wall 2` (`rmvyj7vb4uawm`),
    #     remove superseded legacy political polygons (`rmudhwjkmjc1e` Giant Country, `rmufwoc7586da` Dalab Council,
    #     `rmuooahhlhlnu` Vothic Kingdom), and append `meta_nw['new_regions']` (including `Realm of Dalab`, `Vothic Kingdom`, `Shumar`, and `Vrivolci`)
    REMOVED_REG_IDS = {'rmvyj7vb4uawm', 'rmudhwjkmjc1e', 'rmufwoc7586da', 'rmuooahhlhlnu', 'rmukx7n441l62', 'rmvyl36gozner'}
    merged_nw_outer_wall_pts = [
        [328, 588], [322, 568], [335, 499], [364, 453], [437, 408], [450, 378], [509, 340],
        [530, 327], [556, 302], [631, 286], [692, 285], [743, 256], [826, 276], [913, 285],
        [938, 322], [938, 351], [901, 383], [894, 396], [849, 385], [805, 399], [790, 412],
        [769, 380], [717, 382], [697, 375], [674, 385], [649, 385], [626, 392], [600, 397],
        [564, 426], [543, 442], [542, 484], [551, 506], [560, 531], [563, 541], [565, 554],
        [543, 578], [536, 565], [514, 573], [528, 602], [528, 613], [513, 615], [498, 600],
        [472, 607], [461, 614], [448, 625], [441, 604], [408, 586], [384, 586], [349, 594],
    ]
    regs_exp = []
    for r in regs_1393:
        if r.get('id') in REMOVED_REG_IDS:
            continue
        r2 = copy.deepcopy(r)
        if r2.get('id') == 'rmuqm8dxeuvhi':
            r2['points'] = copy.deepcopy(merged_nw_outer_wall_pts)
        else:
            r2['points'] = [[int(round(p[0] + DX)), int(round(p[1] + DY))] for p in r['points']]
        regs_exp.append(r2)
    existing_reg_ids = {r['id'] for r in regs_exp}
    for nr in meta_nw['new_regions']:
        if nr['id'] not in existing_reg_ids:
            regs_exp.append(copy.deepcopy(nr))
            existing_reg_ids.add(nr['id'])
        else:
            for idx_reg, rr_exp in enumerate(regs_exp):
                if rr_exp['id'] == nr['id']:
                    regs_exp[idx_reg] = copy.deepcopy(nr)
                    break
    if len(user_regs_1821) >= 120:
        regs_exp = copy.deepcopy(user_regs_1821)
        existing_reg_ids = {r['id'] for r in regs_exp}
        for nr in meta_nw['new_regions']:
            if nr['id'] not in existing_reg_ids:
                regs_exp.append(copy.deepcopy(nr))
                existing_reg_ids.add(nr['id'])
    print(f'  Total regions on expanded map: {len(regs_exp)} (added {len(meta_nw["new_regions"])} new N/W & political regions)')

    # 7G. Shift `settlements` by (+272, +330), append Zeijani cavern settlements, and run Automated Audit & Snap (<= 50 km / <= 25 px)
    print('--- Step 7G: Running Automated Settlement Audit & Snap (<= 50 km / 25 px rule) ---')
    if len(user_setts_1821) >= 115:
        setts_exp = copy.deepcopy(user_setts_1821)
    else:
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
        elif nm == 'Farport' or s.get('id') == 's998483c9b':
            # Explicitly position Farport on the near-shore coastal bluff plateau at (294, 588) at 212.0 m
            # (above the 100 m Farside tsunami run-up ceiling, 8 km above the 0.0 m Līng-Mā estuary harbour at 290, 588)
            s['px'], s['py'] = 294, 588
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

        # 2. Extreme elevation displacement (> 450 m change from old_elev, unless it's Pluton, Farport, Tallwalls, Theodiga, Erehwon, or a remodeled volcano/abyss settlement)
        elev_delta = abs(new_elev - old_elev)
        elev_bad = (elev_delta > 450.0) and (
            nm not in {'Pluton', 'Farport', 'Tallwalls', 'Theodiga', 'Erehwon', 'Qiblai', 'Strongwall', 'Hub 01', "Noa's Regret", "Zey'danin", 'Dhelv', 'Mantis', 'Locus', 'Verge', 'Mungo', 'Reed', 'Šurpu-Dhelv', 'Qarnu-Tūbu', 'Nūru-Šaplu'}
            and s['id'] not in {'szeij_surpu01', 'szeij_qarnu02', 'szeij_nuru03', 's998483c9b', 'stallwalls01'}
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
        rivers_exp, regs_exp, setts_exp, En_exp=En_exp, markdown_out_path=river_md_path,
        old_rivers=D_old['rivers'],
    )
    D_new['rivers'] = rivers_exp
    top_tongues_str = ', '.join(f'{k}:{v}' for k, v in sorted(tongue_counts.items(), key=lambda kv: -kv[1])[:10])
    print(f'  Named {len(rivers_exp)} rivers across {len(tongue_counts)} tongues (top: {top_tongues_str})')

    # 7I. Run Final Guards After the Last Pass Touches `En_exp`
    print('--- Step 7I: Running Final Guards (Vent Peaks, Lake Levels, River Descent, & Settlement Pads) ---')
    # 1. Vent-peak guard (every vent with `peak` and `volc` has ground within 400 m of `peak` inside 12 km / 6 px,
    #    or inside 40 km / 20 px for the 77-km-wide Godthrone Olympus-Mons caldera whose rim radius is 32.5-38.7 km)
    for v_chk in [volc_exp] + list(vents_exp):
        if 'peak' not in v_chk:
            continue
        vx_c, vy_c = v_chk['px']
        r_px = 20 if float(v_chk['peak']) >= 20000.0 else 6
        iy0, iy1 = max(0, int(round(vy_c)) - r_px), min(NEW_OH, int(round(vy_c)) + r_px + 1)
        ix0, ix1 = max(0, int(round(vx_c)) - r_px), min(NEW_OW, int(round(vx_c)) + r_px + 1)
        yy_v, xx_v = np.mgrid[iy0:iy1, ix0:ix1]
        in_disc = np.hypot(xx_v - vx_c, yy_v - vy_c) <= float(r_px)
        max_e_disc = float(En_exp[iy0:iy1, ix0:ix1][in_disc].max())
        assert max_e_disc >= float(v_chk['peak']) - 400.0, (
            f"Vent peak guard failed at px={v_chk['px']}: peak={v_chk['peak']} m, max_e={max_e_disc:.1f} m"
        )
    # 2. Lake-level guard (no NaN water levels on wet cells)
    assert not np.isnan(wlev_exp[whas_exp]).any(), 'Lake-level guard failed: NaN water level on wet cell'
    # 3. River-descent guard (monotonic non-increasing bed_m AND actual map ground E[round(py), round(px)] climb <= 50 m along course)
    for r_chk in rivers_exp:
        b_chk = r_chk.get('bed_m') or []
        for b1_c, b2_c in zip(b_chk, b_chk[1:]):
            assert b2_c <= b1_c + 1e-6, f"River bed_m descent guard failed on {r_chk.get('id')}: {b1_c} -> {b2_c}"
        pts_chk = r_chk.get('px') or []
        if len(pts_chk) >= 2:
            es_chk = [
                float(En_exp[min(NEW_OH - 1, max(0, int(round(py_c)))), min(NEW_OW - 1, max(0, int(round(px_c))))])
                for px_c, py_c in pts_chk
            ]
            min_e_so_far = es_chk[0]
            max_climb_r = 0.0
            for e_c in es_chk:
                if e_c < min_e_so_far:
                    min_e_so_far = e_c
                if e_c - min_e_so_far > max_climb_r:
                    max_climb_r = e_c - min_e_so_far
            assert max_climb_r <= 50.0, (
                f"River map-elevation descent guard failed on {r_chk.get('id')} ({r_chk.get('name')}): max climb = {max_climb_r:.1f} m > 50.0 m"
            )
    # 4. Settlement-pad & Farport tsunami guard
    assert len(worse_problems) == 0, f'Settlement guard failed: {worse_problems}'
    farport_s = next(s for s in setts_exp if s['name'] == 'Farport' or s.get('id') == 's998483c9b')
    fpx, fpy = int(farport_s['px']), int(farport_s['py'])
    assert not whas_exp[fpy, fpx], f'Farport at {(fpx, fpy)} must be on dry land'
    assert float(En_exp[fpy, fpx]) >= 180.0, f'Farport elevation {En_exp[fpy, fpx]:.1f} m must exceed 100 m tsunami run-up ceiling'
    assert whas_exp[588, 290] and abs(float(wlev_exp[588, 290])) <= 0.5, 'Farport estuary harbour at (290, 588) must be at 0.0 m sea level'

    # 5. Round 3 guards: Ancient's Valley 7 blast basins & 17.4 m lake + Southern Inner Wall scarp & Spirladunon
    for bx, by, r_km, b_mode, *_ in anc_blast_specs:
        r_px = r_km / 2.0
        dist_b = np.hypot(X_exp - bx, Y_exp - by)
        c_e = float(En_exp[int(round(by)), int(round(bx))])
        rim_med = float(np.median(En_exp[(dist_b >= 0.85 * r_px) & (dist_b <= 1.35 * r_px)]))
        assert (rim_med - c_e) >= 60.0, f'Blast basin {(bx, by)} rim_med ({rim_med:.1f} m) - centre ({c_e:.1f} m) < 60 m'
        if b_mode == 'dry':
            assert not whas_exp[int(round(by)), int(round(bx))], f'Dry blast basin {(bx, by)} must not be water'
        elif b_mode == 'drowned':
            assert whas_exp[int(round(by)), int(round(bx))], f'Drowned blast basin {(bx, by)} must be in lake'
            assert abs(float(wlev_exp[int(round(by)), int(round(bx))]) - 17.4) <= 0.5, f'Drowned basin {(bx, by)} wlev != 17.4 m'
            assert c_e >= -80.0, f'Drowned blast basin {(bx, by)} floor ({c_e:.1f} m) is too deep (< -80 m)'
    assert abs(float(En_exp[1017, 800]) - spirl_e_orig) <= 5.0, f'Spirladunon at (800, 1017) moved from {spirl_e_orig:.1f} m to {En_exp[1017, 800]:.1f} m'
    print('  All final guards PASSED (vent peaks within 400 m inside 12 km, lakes valid, rivers monotonic, Farport at 212.0 m, 7 blast basins & Southern Inner Wall scarp verified).')

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
    D_new['legacy_shift'] = {'dx': DX, 'dy': DY, 'old_fullW': OLD_OW, 'old_fullH': OLD_OH}
    D_new['tsunami_farside'] = {
        'crest_m': 50.0,
        'crest_range_m': [35.0, 55.0],
        'scour_bench_m': 65.0,
        'chevron_m': 38.0,
        'max_runup_ceiling_m': 100.0,
        'farport_px': [294, 588],
        'farport_elev_m': 212.0,
        'harbour_px': [290, 588],
        'harbour_wlev_m': 0.0,
    }

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
    with open(regs_json_path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(regs_exp, f, indent=1)
        f.write('\n')
    with open(setts_json_path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(setts_exp, f, indent=1)
        f.write('\n')

    # Update `51-region-store.js` and `60-settlements.js` with shifted defaults + `krator.canvas50` localStorage migration
    new_reg_ids_50 = [
        'rmvraoas90co7', 'rmvhighrift100', 'rmvstalkergate', 'rmvmidbasin101',
        'rmvriavalley', 'rmvdoubledelta', 'rmvarachnoids', 'rmvthearch',
        'rmvseamounts', 'rmvthecrook', 'rmvcopperglacier', 'rmvtharnuplands', 'rmvoutlandpass',
        'rmvyiyw8ucd1y', 'rmvyj1kvhx4m4', 'rmvyj4v2ozgb1', 'rmvyk0ubpkdoy', 'rmvyk62bgdvs3',
        'rmvymakpc0pft', 'rmvyl36gozner', 'rmw4vh9t20da4', 'rmw4wizrk66e1', 'rmw4wknusgc7h', 'rmw4wou2y1hhc',
        'rmw4xy4tp9b29', 'rmw52q8d7prwz', 'rmw536m06wlyf', 'rmw5n1w1rx0u2',
        'rmw5ruqmv60t3', 'rmw5rzefnfapk', 'rmw5s3ktxgv0d', 'rmw5sayxeskra',
        'rmw8bqrn3dnx4', 'rmw8ca6baau47', 'rmw8hj62nmugn',
    ]
    sync_reg_ids_52 = [
        'rmuqm8dxeuvhi', 'rmvyiyw8ucd1y', 'rmvyj1kvhx4m4', 'rmvyj4v2ozgb1', 'rmvyk0ubpkdoy', 'rmvyk62bgdvs3',
        'rmvymakpc0pft', 'rmvyl36gozner', 'rmvraoas90co7', 'rmvoutlandpass',
        'rmw4vh9t20da4', 'rmw4wizrk66e1', 'rmw4wknusgc7h', 'rmw4wou2y1hhc', 'rmw4xy4tp9b29', 'rmw52q8d7prwz',
        'rmw536m06wlyf', 'rmw5n1w1rx0u2', 'rmw5ruqmv60t3', 'rmw5rzefnfapk', 'rmw5s3ktxgv0d', 'rmw5sayxeskra',
        'rmw8bqrn3dnx4', 'rmw8ca6baau47', 'rmw8hj62nmugn',
    ]
    removed_reg_ids_58 = ['rmvyj7vb4uawm', 'rmudhwjkmjc1e', 'rmufwoc7586da', 'rmuooahhlhlnu']
    reg_js_new = f"""  function localSave(){{ try{{ localStorage.setItem('krator.regions',JSON.stringify([...regions.values()])); }}catch(e){{}} }}
  function localLoad(){{
    try{{
      if(localStorage.getItem('krator.canvas50')!=='1'){{
        localStorage.removeItem('krator.regions');
        localStorage.removeItem('krator.settlements');
        localStorage.setItem('krator.canvas50','1');
      }}
    }}catch(e){{}}
    const defMap = new Map();
    {{
      const defRegs = {json.dumps(regs_exp)};
      defRegs.forEach(r=>{{ regions.set(r.id,r); defMap.set(r.id,r); }});
    }}
    try{{ const j=JSON.parse(localStorage.getItem('krator.regions')||'[]'); j.forEach(r=>{{ if(r&&r.id&&Array.isArray(r.points)) regions.set(r.id,r); }}); }}catch(e){{}}
    try{{
      if(localStorage.getItem('krator.regAdded.5.0')!=='1'){{
        {json.dumps(new_reg_ids_50)}.forEach(id=>{{
          const d=defMap.get(id); if(d) regions.set(id,d);
        }});
        localStorage.setItem('krator.regAdded.5.0','1');
        localSave();
      }}
      if(localStorage.getItem('krator.regMerged.5.8')!=='1'){{
        {json.dumps(removed_reg_ids_58)}.forEach(id=>regions.delete(id));
        {json.dumps(sync_reg_ids_52)}.forEach(id=>{{
          const d=defMap.get(id); if(d) regions.set(id,d);
        }});
        localStorage.setItem('krator.regMerged.5.8','1');
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
    with open(reg_store_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(reg_store_updated)

    # Update `60-settlements.js`
    sett_added_50 = [s for s in setts_exp if s['id'] in {'sostrukhyuni01', 'sloomspindle01', 'szeij_surpu01', 'szeij_qarnu02', 'szeij_nuru03', 'stallwalls01'}]
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
    with open(sett_store_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(sett_store_updated)

    # Build HTML viewer via model/build.py (only dist/scale-model.html is built in repo)
    print('--- Step 9: Running model/build.py & Exporting Scale Model 5.1 + Verification Crops ---')
    subprocess.check_call([sys.executable, os.path.join(HERE, 'model', 'build.py')])

    dist_html = os.path.join(HERE, 'model', 'dist', 'scale-model.html')
    artifact_dir = 'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc'
    artifact_html = os.path.join(artifact_dir, 'scale-model-artifact.html')
    if os.path.exists(artifact_dir):
        shutil.copy2(dist_html, artifact_html)
        if os.path.exists(river_md_path):
            shutil.copy2(river_md_path, os.path.join(artifact_dir, 'river-names-5.1.md'))

    # Save audit report JSON to history/
    hist_dir = os.path.join(HERE, 'history')
    os.makedirs(hist_dir, exist_ok=True)
    report_path = os.path.join(hist_dir, 'build_425_report.json')
    with open(report_path, 'w', encoding='utf-8', newline='\n') as f:
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
        f.write('\n')

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

    # 7. Focused verification crops for `s highlands`, `great chasm`, `godshearth`, `SE outer wall`, `twins`, `opal valley`, and `Green Valley`:
    for k_name, arr_k in (('st', st_final_exp), ('t', t_final_exp), ('ct', ct_final_exp)):
        Image.fromarray(arr_k[920:1120, 680:980]).save(os.path.join(scratch_dir, f'verify_shighlands_{k_name}.png'))
        Image.fromarray(arr_k[740:1060, 1580:1780]).save(os.path.join(scratch_dir, f'verify_greatchasm_{k_name}.png'))
        Image.fromarray(arr_k[1340:1475, 780:910]).save(os.path.join(scratch_dir, f'verify_godshearth_{k_name}.png'))
        Image.fromarray(arr_k[1120:1375, 975:1375]).save(os.path.join(scratch_dir, f'verify_seouterwall_{k_name}.png'))
        Image.fromarray(arr_k[1395:1595, 910:1120]).save(os.path.join(scratch_dir, f'verify_twins_{k_name}.png'))
        Image.fromarray(arr_k[1600:1720, 940:1170]).save(os.path.join(scratch_dir, f'verify_opalvalley_{k_name}.png'))
        Image.fromarray(arr_k[1175:1375, 550:720]).save(os.path.join(scratch_dir, f'verify_greenvalley_{k_name}.png'))
        Image.fromarray(arr_k[1080:1270, 640:860]).save(os.path.join(artifact_dir, f'shumar_{k_name}.png'))

    print(f'=== Scale Model 5.1 Master Build Completed in {time.time() - t_start:.1f}s ===')


if __name__ == '__main__':
    main()
