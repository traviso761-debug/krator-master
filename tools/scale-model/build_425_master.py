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
import smodel.volcanoes as VOLC  # noqa: E402
import smodel.east_abyss as EA   # noqa: E402
import smodel.tier1_biomes as T1 # noqa: E402
import smodel.nw_expansion as NW # noqa: E402

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
    print('=== Scale Model 5.0 Master Build (1821x1723 Unified 2 km/cell Grid) ===')

    # Ensure expansion_ref.jpg is present
    ref_src = 'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc/.user_uploaded/media_1793494252884_beac5e73.jpg'
    ref_path = os.path.join(HERE, 'expansion_ref.jpg')
    if os.path.exists(ref_src) and not os.path.exists(ref_path):
        shutil.copy2(ref_src, ref_path)

    # Load D_old from model/data/ (if already expanded to 1821x1723 by a prior run, restore 1549x1393 baseline from HEAD)
    D_old = P.load()
    if (D_old['fullH'], D_old['fullW']) != (OLD_OH, OLD_OW):
        print('  Restoring 1549x1393 baseline data from HEAD before running 5.0 master pipeline...')
        subprocess.check_call([
            'git', 'checkout', 'HEAD', '--',
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
    # STEP 2: Run the 3 Interior Enhancement Passes on (1393, 1549)
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
    En3, whas3_1393, wlev3_1393_num, ch_t1 = T1.remodel_tier1_biomes(
        En2, whas2_1393, np.nan_to_num(wlev2_1393, nan=0.0),
        regs_1393, setts_1393, D_old['rivers']
    )
    wlev3_1393 = np.where(whas3_1393, wlev3_1393_num, np.nan)
    print(f'  Tier-1 Biomes remodeled: {int(ch_t1.sum()):,} cells changed on 1393x1549')

    # Protect the completed 5-region SE complex (`Region 99`, `Siphon Pits`, `Mid Basin`, `Stalker Gate`, `High Rift`)
    # so its terrain, water levels, and climate stay 100% intact
    se5_ids = {'rmvraoas90co7', 'rmvra9zogfm9t', 'rmvmidbasin101', 'rmvstalkergate', 'rmvhighrift100'}
    mask_se5_1393 = np.zeros((OLD_OH, OLD_OW), dtype=bool)
    for r in regs_1393:
        if r.get('id') in se5_ids:
            mask_se5_1393 |= G.poly(r['points'], 1.0, 1.0, (OLD_OH, OLD_OW))
    En3 = np.where(mask_se5_1393, Eo_1393, En3)
    whas3_1393 = np.where(mask_se5_1393, whas0_1393, whas3_1393)
    wlev3_1393 = np.where(mask_se5_1393, wlev0_1393, wlev3_1393)

    # =========================================================================
    # STEP 3: Recompute Interior Climate & Paint on (1393, 1549)
    # =========================================================================
    print('--- Step 3: Recomputing Interior Rain, Climate Classes, and Shiveria Zonation on (1393, 1549) ---')
    codes = [c['code'] for c in D_old['climate']['classes']]
    idx = {c: i for i, c in enumerate(codes)}

    # Force-lock the 5-region SE complex and The Cut's existing forced classes during reclimate
    forced_1393 = mask_se5_1393.copy()
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
    ch_interior = ch_volc | ch_ea | ch_t1
    new_int_lakes = ch_interior & whas3_1393 & ~whas0_1393
    cls_int[new_int_lakes & (wlev3_1393 > 200.0)] = idx['WH']
    cls_int[new_int_lakes & (wlev3_1393 <= -900.0)] = idx['WX']
    zon_int[new_int_lakes] = 4

    volc_high = ch_volc & ~whas3_1393
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

    # Retint st_int and t_int where elevation moved significantly (e.g. Godthrone collar removal, Lesser Throne cone, East Abyss benches)
    ok_retint = ch_interior & ~whas3_1393 & ~mask_se5_1393
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
    nw_edit_land = ((w_nw_clim > 0.15) | is_new_area) & ~whas_exp
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
    in_copper_glacier = nw_edit_land & (X_exp >= 48.0) & (X_exp <= 365.0) & (Y_exp >= 1085.0) & (Y_exp <= 1385.0) & (w_sw_outer < 0.35)
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
    # STEP 6: Synthesize & Blend `st`, `t`, `rt`, `ct` on (1723, 1821)
    # =========================================================================
    print('--- Step 6: Synthesizing Seamless Satellite (st), Relief (t), Rain (rt), and Climate (ct) Maps on 1821x1723 ---')
    rs_paint = np.random.RandomState(SEED + 19)
    fine_grain_exp = 1.0 + nd.gaussian_filter(rs_paint.normal(0.0, 0.032, (NEW_OH, NEW_OW)), 0.9)[..., None]
    shade_exp = compute_clean_hillshade(En_exp, zf=5.0, az_deg=315.0, alt_deg=45.0) * fine_grain_exp

    # Strip the 10-pixel top/left canvas frame bevel of `st_int`, `t_int`, `rt_int`, `ct_int` before padding
    # so the old `1549x1393` edge shadow never creates a line at X=272 or Y=330!
    for arr_i in (st_int, t_int, rt_int, ct_int):
        arr_i[:10, :, :] = arr_i[10:11, :, :]
        arr_i[:, :10, :] = arr_i[:, 10:11, :]

    # Embed interior `(1393, 1549)` painted maps into `[DY:, DX:]`
    st_pad = np.pad(st_int, ((DY, 0), (DX, 0), (0, 0)), mode='edge')
    t_pad = np.pad(t_int, ((DY, 0), (DX, 0), (0, 0)), mode='edge')
    rt_pad = np.pad(rt_int, ((DY, 0), (DX, 0), (0, 0)), mode='edge')
    ct_pad = np.pad(ct_int, ((DY, 0), (DX, 0), (0, 0)), mode='edge')

    # Organic domain-warped blending weight for the new N/W area + trans-boundary NE Outland Pass,
    # SW Crook–Rift Pass, Arachnoid Canyon/Breach, and Unified NW Ocean:
    w_seam = np.where(old_lake_guard, G.sstep(0.0, 16.0, d_into_new), G.sstep(-24.0, 26.0, sd_new))
    w_arach_paint = np.clip(
        w_canyon + 0.85 * arach_trough_w + 0.65 * np.clip(meta_nw['arach_rib_h'] / 210.0, 0.0, 1.0) + 0.78 * w_n_korona_breach,
        0.0, 1.0
    )
    w_nw_sea_unify = (
        whas_exp.astype(float)
        * (1.0 - G.sstep(475.0, 540.0, X_exp))
        * (1.0 - G.sstep(525.0, 595.0, Y_exp))
    )
    w_exp_paint = np.maximum(
        np.maximum(w_seam, w_nw_sea_unify),
        np.maximum(w_arach_paint, np.maximum(w_ne_connector, w_sw_connector)),
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

    # 6. High Alpine Snow & Glaciers (`4,150 m <= En_exp < 8,200 m`) & Airless Dark Rust-Red Outer Plateau (`En_exp >= 7,600 m`):
    # Matches the exact elevation-driven snow rim + dark rust-red airless outer flank of the existing map!
    snow_thresh = np.where(w_tharn > 0.3, 5650.0, 4150.0)
    w_snow_exp = (
        G.sstep(snow_thresh, snow_thresh + 750.0, En_exp)
        * (1.0 - G.sstep(7400.0, 8600.0, En_exp))
        * (~whas_exp).astype(float)
        * (1.0 - 0.72 * w_cop_glac)
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

    # 7D. Shift `rivers`, append `meta_nw['new_rivers']`, and enforce monotonic `bed_m` on `En_exp`
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
    D_new['rivers'] = rivers_exp
    print(f'  Total rivers on expanded map: {len(rivers_exp)} (enforced 0 climbing segments; clamped {climbing_fixed} vertices)')

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
        # 1. Submerged in water when it shouldn't be (or >8 m deep for Mungo/Reed)
        submerged_bad = False
        if new_wet:
            if nm in SHALLOW_WATER_ALLOWED:
                depth = (new_wlev or 0.0) - new_elev
                if depth > 12.0:
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
        r'  try\{.*?  Object\.keys\(SETT_ADDED\)',
        lambda m: sett_block_new + '\n  Object.keys(SETT_ADDED)',
        sett_store_txt,
        flags=re.S
    )
    with open(sett_store_path, 'w', encoding='utf-8') as f:
        f.write(sett_store_updated)

    # Build HTML viewer via model/build.py
    print('--- Step 9: Running model/build.py & Exporting Scale Model 5.0 + Verification Crops ---')
    subprocess.check_call([sys.executable, os.path.join(HERE, 'model', 'build.py')])

    dist_html = os.path.join(HERE, 'model', 'dist', 'scale-model.html')
    out_50 = os.path.join(HERE, 'scale-model-5.0.html')
    out_424 = os.path.join(HERE, 'scale-model-4.24.html')
    shutil.copy2(dist_html, out_50)
    shutil.copy2(dist_html, out_424)

    artifact_dir = 'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc'
    artifact_html = os.path.join(artifact_dir, 'scale-model-artifact.html')
    if os.path.exists(artifact_dir):
        shutil.copy2(dist_html, artifact_html)

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

    # 4. Crop: Volcanoes (Throne, Lesser Throne, Godthrone, Catch/Xanadu Twin Cones) (X=650..1220, Y=700..1620)
    Image.fromarray(st_final_exp[700:1620, 650:1220]).save(os.path.join(artifact_dir, 'master425_volcanoes_st.png'))
    Image.fromarray(t_final_exp[700:1620, 650:1220]).save(os.path.join(artifact_dir, 'master425_volcanoes_t.png'))

    # 5. Crop: East Abyss & The Bowl Shiveria Rift (X=920..1420, Y=600..1240)
    Image.fromarray(st_final_exp[600:1240, 920:1420]).save(os.path.join(artifact_dir, 'master425_east_abyss_st.png'))
    Image.fromarray(ct_final_exp[600:1240, 920:1420]).save(os.path.join(artifact_dir, 'master425_east_abyss_ct.png'))

    print(f'=== Scale Model 4.25 Master Build Completed in {time.time() - t_start:.1f}s ===')


if __name__ == '__main__':
    main()
