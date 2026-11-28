#!/usr/bin/env python3
"""Scale model 5.1, edit 37 (2026-11-27):
1. Anneal Region 177 into SW outer wall (syncing the live Veiled Mountains / mist valley / silent vale / Timpar-Kuran
   polygons) and carve 7 mountain and boreal lakes stepping down northward toward Veiled Mountains (3 northern boreal
   paternoster lakes at 2,920-3,460 m in Dfb/Dfc, 4 mid-northern moraine/cirque mountain tarns at 3,920-5,080 m).
2. Expand and tune Ricochet Peaks into a 12-crater grazing ricochet-ejecta swarm: 10 main craters sunk to 3,180-3,750 m
   (with central rebound peaks, annular/floor WH lakes, winding 3,850-4,650 m breach-notches to the Yuni Emirate,
   Oidong, High Rift and Siphon Pits, and East Hearth Crater's hydrothermal pool & fumaroles) so their floors hold a
   cold, habitable boreal climate (Dfc/Dfb), plus 2 perched 4,850-5,100 m ET/cryofumarole satellite bowls.

    python3 tools/scale-model/edit_537_sw_wall_ricochet.py [--dry]
"""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.geom as G   # noqa: E402
import edit_532_sw_wall_trigemini as T32    # noqa: E402
import edit_535_veiled_mountains as T35     # noqa: E402

KEY = '5.1e37'

# 1. Updated & annealed polygons (5.1 px)
SW_OUTER_WALL_ANNEALED = [
    [521, 1345], [668, 1427], [678, 1350], [657, 1323], [635, 1309], [617, 1250], [587, 1211],
    [484, 1197], [428, 1176], [359, 1093], [335, 1048], [327, 1035], [317, 979], [305, 895],
    [312, 862], [244, 858], [220, 961], [237, 1049], [225, 1077], [213, 1136], [213, 1166],
    [270, 1194], [328, 1219], [386, 1223], [435, 1235], [477, 1256], [520, 1307], [517, 1340],
    [653, 1417]
]
VEILED_MOUNTAINS_EXPANDED = [
    [252, 609], [306, 622], [336, 633], [322, 690], [305, 773], [312, 862],
    [244, 858], [220, 961], [154, 979], [123, 942], [160, 835], [162, 740], [221, 673]
]
SILENT_VALE_SHIFTED = [
    [154, 979], [220, 972], [237, 1049], [244, 1082], [226, 1145], [207, 1144], [177, 1100], [154, 1022]
]
TIMPAR_KURAN_POLITICAL = [
    [129, 945], [220, 961], [271, 825], [281, 666], [271, 612], [224, 638], [162, 740], [160, 835], [126, 936]
]

# Northern SW Outer Wall lakes: (name, centre, lake_level_m, flat_r_px, wall_r_px, boreal_flag)
SW_LAKES = [
    ('Veil-Foot Tarn N',  (256.0, 882.0), 2920.0, 3.2, 4.2, True),
    ('Paternoster Mid',   (266.0, 912.0), 3180.0, 3.4, 4.4, True),
    ('Larch-Fen Tarn S',  (276.0, 944.0), 3460.0, 3.0, 4.2, True),
    ('Moraine Tarn 1',    (268.0, 978.0), 3920.0, 2.6, 3.8, False),
    ('Cirque Tarn 2',     (296.0, 1002.0), 4280.0, 2.5, 3.6, False),
    ('Krummholz Tarn 3',  (274.0, 1026.0), 4680.0, 2.6, 3.8, False),
    ('Trigemini Step 4',  (306.0, 1052.0), 5080.0, 2.3, 3.5, False),
]

# Ricochet Peaks 12-crater grazing ejecta swarm:
# (name, centre, floor_m, rx_px, ry_px, rot_rad, wall_px, has_lake, has_rebound_peak)
RICOCHET_CRATERS = [
    ('Yuni-Gate',      (1205.0, 1482.0), 3250.0, 8.0, 6.2,  0.22, 5.5, True,  True),
    ('Glass-Pan',      (1158.0, 1522.0), 3580.0, 6.8, 5.2,  0.18, 5.0, False, False),
    ('West',           (1215.0, 1535.0), 3350.0, 8.2, 7.0,  0.15, 5.8, True,  False),
    ('Skipper-W',      (1272.0, 1498.0), 3450.0, 6.8, 5.6,  0.28, 5.0, True,  True),
    ('North',          (1298.0, 1518.0), 3520.0, 7.8, 6.6,  0.20, 5.5, False, False),
    ('South',          (1335.0, 1592.0), 3620.0, 7.2, 6.0, -0.12, 5.5, True,  False),
    ('Central-Kettle', (1352.0, 1496.0), 3680.0, 6.4, 5.0,  0.25, 4.8, True,  False),
    ('Yuni-East',      (1442.0, 1458.0), 3320.0, 7.4, 5.8, -0.20, 5.2, True,  True),
    ('East Hearth',    (1450.0, 1558.0), 3180.0, 8.6, 7.4,  0.14, 6.0, True,  False),
    ('Siphon-Lip',     (1516.0, 1554.0), 3750.0, 6.2, 5.0,  0.30, 4.8, False, False),
    ('Rim-West',       (1136.0, 1546.0), 4850.0, 4.6, 4.0,  0.10, 4.2, False, False),
    ('Old Ice-Bowl',   (1375.0, 1525.0), 5100.0, 5.6, 5.0,  0.05, 4.8, True,  False),
]


def elliptical_crater(En, E0, whas0, c, fm, rx, ry, rot, rw, peak=False, rim_h=210.0):
    """Carve an oblique elliptical ricochet crater with ejecta rim and optional central rebound peak."""
    sh = En.shape
    YY, XX = np.mgrid[0:sh[0], 0:sh[1]]
    dx = XX - c[0]
    dy = YY - c[1]
    cs, sn = math.cos(rot), math.sin(rot)
    u = dx * cs + dy * sn
    v = -dx * sn + dy * cs
    # Normalized radial distance (1.0 at flat-floor edge)
    rmean = 0.5 * (rx + ry)
    rn = np.hypot(u / rx, v / ry)
    r_px = rn * rmean
    R_rim = rmean + rw
    # Ejecta rim apron (stronger downrange +u for oblique ricochet look)
    asym = 1.0 + 0.25 * np.tanh(u / (rx + 1e-6))
    rim = np.where(r_px <= R_rim,
                   rim_h * asym * np.exp(-((r_px - R_rim) / 1.7) ** 2),
                   rim_h * asym * np.clip(1.0 - (r_px - R_rim) / R_rim, 0.0, 1.0) ** 2)
    En += np.where(~whas0 & (r_px <= 2.1 * R_rim), rim, 0.0)
    # Bowl profile
    wall_t = np.clip((r_px - rmean) / max(rw, 1.0), 0.0, 1.0)
    prof = fm + 2800.0 * (wall_t ** 1.85)
    if peak:
        # Central rebound peak rising ~260 m at centre, leaving an annular moat at rn = 0.35..0.95
        pk = 260.0 * np.exp(-((rn / 0.26) ** 2))
        prof = prof + pk
    inside = r_px <= (rmean + 2.2 * rw)
    En[inside] = np.minimum(En[inside], prof[inside])
    floor_m = r_px <= (rmean + 0.35 * rw)
    moat_m = (rn >= (0.30 if peak else 0.0)) & (rn <= (0.72 if peak else 0.46))
    return floor_m, moat_m


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    if D.get('edit_537') == KEY:
        sys.exit('edit_537 has run already')
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = E0.shape
    codes = T32.codes_of(D)
    cls0 = P.raster(D, 'c', 'L')
    YY, XX = np.mgrid[0:sh[0], 0:sh[1]]

    En, whas, wlev, W1 = E0.copy(), whas0.copy(), wlev0.copy(), W0.copy()
    rng = np.random.default_rng(53701)

    # Read current store regions to grab existing polygons/colors
    fr = os.path.join(HERE, 'model', 'src', '51-region-store.js')
    s_store = open(fr, encoding='utf-8').read()
    i_st = s_store.index('const defRegs = ') + len('const defRegs = ')
    j_st = s_store.index('\n', i_st)
    store_regs = {r['name']: r for r in json.loads(s_store[i_st:j_st].rstrip()[:-1])}

    sw_poly = G.poly([tuple(p) for p in SW_OUTER_WALL_ANNEALED], 1.0, 1.0, sh)
    rp_poly = G.poly([tuple(p) for p in store_regs['Ricochet Peaks']['points']], 1.0, 1.0, sh)

    # =========================================================================
    # PART A: Northern SW Outer Wall (ex-Region 177 annealed) valley & 7 lakes
    # =========================================================================
    sw_floor = np.zeros(sh, bool)
    sw_boreal = np.zeros(sh, bool)
    sw_lakes_mask = np.zeros(sh, bool)
    sw_lake_rep = {}

    # Carve a winding glaciated trough linking Veilpass south flank -> 7 lakes -> Trigemini approach
    sw_chain = [(250.0, 862.0)] + [lk[1] for lk in SW_LAKES] + [(284.0, 1086.0)]
    sw_elevs = [2760.0] + [lk[2] + 15.0 for lk in SW_LAKES] + [5550.0]
    keep_sw = nd.binary_dilation(sw_poly, iterations=4)
    for (pa, ea), (pb, eb) in zip(zip(sw_chain[:-1], sw_elevs[:-1]), zip(sw_chain[1:], sw_elevs[1:])):
        pts = T32.route(E0, pa, pb, rng, keep=keep_sw, pad=10, wander=0.45)
        f_, _, _ = T32.valley(E0, En, pts, ea, None, eb, 4.2, rng, rise=1650.0, breathe=0.35)
        sw_floor |= f_
        if max(ea, eb) < 3800.0:
            sw_boreal |= f_

    for nm, c, lvl, rf, rw, is_bor in SW_LAKES:
        bmask = T32.bowl(En, c, lvl - 22.0, rf, rise=1350.0, r_wall=rw)
        sw_floor |= bmask
        if is_bor:
            sw_boreal |= nd.binary_dilation(bmask, iterations=3)
        lab, _ = nd.label(bmask & (En < lvl))
        lid = lab[int(round(c[1])), int(round(c[0]))]
        lk = (lab == lid) if lid > 0 else (np.hypot(XX - c[0], YY - c[1]) <= rf * 0.75)
        whas[lk] = True
        wlev[lk] = lvl
        W1[lk] = True
        En[lk] = np.minimum(En[lk], lvl - 14.0)
        shore = nd.binary_dilation(lk, iterations=2) & ~lk & ~whas
        En[shore] = np.maximum(En[shore], np.minimum(E0[shore], lvl + 2.0))
        sw_lakes_mask |= lk
        sw_lake_rep[nm] = {'centre': list(c), 'level_m': round(lvl), 'cells': int(lk.sum()), 'km2': int(lk.sum() * 4)}

    # =========================================================================
    # PART B: Ricochet Peaks — 12-crater grazing ricochet swarm (habitable Dfc/Dfb)
    # =========================================================================
    # Clear edit_533's tiny high-altitude East crater pool before re-carving at 3,180 m
    old_ec = (1450.0, 1558.0)
    old_pool = np.hypot(XX - old_ec[0], YY - old_ec[1]) <= 3.5
    whas[old_pool] = False
    wlev[old_pool] = 0.0
    W1[old_pool] = False

    rp_floor = np.zeros(sh, bool)
    rp_lakes_mask = np.zeros(sh, bool)
    rp_crater_rep = {}
    by_c = {}

    for nm, c, fm, rx, ry, rot, rw, has_lk, has_pk in RICOCHET_CRATERS:
        fl_m, moat_m = elliptical_crater(En, E0, whas0, c, fm, rx, ry, rot, rw, peak=has_pk)
        rp_floor |= fl_m
        by_c[nm] = (c, fm + (20.0 if has_pk else 0.0))
        lk_cells = 0
        if has_lk:
            lvl = fm - 6.0
            En[moat_m] = np.minimum(En[moat_m], lvl - 12.0)
            whas[moat_m] = True
            wlev[moat_m] = lvl
            W1[moat_m] = True
            rp_lakes_mask |= moat_m
            lk_cells = int(moat_m.sum())
        rp_crater_rep[nm] = {
            'centre': list(c), 'target_floor_m': round(fm),
            'across_km': [round(2 * rx * 2), round(2 * ry * 2)],
            'lake_cells': lk_cells, 'rebound_peak': has_pk
        }

    # Breach-notch passes connecting the craters and linking to Yuni Emirate (N), Oidong (SW), High Rift (SE), Siphon Pits (NE)
    by_c['Yuni-N-W'] = ((1202.0, 1444.0), None)
    by_c['Yuni-N-E'] = ((1448.0, 1416.0), None)
    by_c['Oidong-SW'] = (T32.nearest_flank(E0, cls0, codes, (1215.0, 1535.0), maxr=85, lim=4800.0), None)
    by_c['HighRift-SE'] = (T32.nearest_flank(E0, cls0, codes, (1450.0, 1558.0), maxr=85, lim=4800.0), None)
    by_c['Siphon-NE'] = ((1535.0, 1512.0), None)

    LINKS = [
        ('Yuni-N-W', 'Yuni-Gate', 3850.0),
        ('Yuni-Gate', 'Glass-Pan', 4150.0),
        ('Yuni-Gate', 'West', 3920.0),
        ('Yuni-Gate', 'Skipper-W', 3980.0),
        ('Skipper-W', 'North', 3820.0),        # Skipper's Notch doublet breach!
        ('West', 'Oidong-SW', 4150.0),
        ('North', 'South', 4280.0),
        ('North', 'Central-Kettle', 4120.0),
        ('Central-Kettle', 'Yuni-East', 4250.0),
        ('Yuni-East', 'Yuni-N-E', 3950.0),
        ('Central-Kettle', 'East Hearth', 4220.0),
        ('East Hearth', 'HighRift-SE', 3980.0),
        ('East Hearth', 'Siphon-Lip', 4180.0),
        ('Siphon-Lip', 'Siphon-NE', 4450.0),
        ('Central-Kettle', 'Old Ice-Bowl', 5350.0),
        ('Glass-Pan', 'Rim-West', 5050.0),
    ]
    Er = En.copy()
    rp_cols = {}
    for a, b, col in LINKS:
        (pa, fa), (pb, fb) = by_c[a], by_c[b]
        pts = T32.route(Er, pa, pb, rng, pad=12, wander=0.38)
        # Avoid bulldozing across newly placed crater lake cells except at endpoints
        f_, cm, colp = T32.valley(E0, En, pts, fa, col, fb, 2.8, rng, rise=1900.0, breathe=0.3)
        rp_floor |= (f_ & ~rp_lakes_mask)
        rp_cols['%s->%s' % (a, b)] = {'col_m': round(cm), 'col_px': [round(colp[0], 1), round(colp[1], 1)]}

    # Re-enforce crater lake depths where valley passes touched shores
    En[rp_lakes_mask] = np.minimum(En[rp_lakes_mask], wlev[rp_lakes_mask] - 10.0)
    En[sw_lakes_mask] = np.minimum(En[sw_lakes_mask], wlev[sw_lakes_mask] - 12.0)

    # East Hearth Crater hydrothermal field (at new 3,180 m floor) + Old Ice-Bowl cryofumaroles (at 5,100 m)
    ec = (1450.0, 1558.0)
    ang = np.array([0.4, 1.35, 2.2, 3.3, 4.4, 5.45])
    rad = np.array([4.8, 6.2, 5.4, 6.8, 5.1, 6.0])
    vx = ec[0] + rad * np.cos(ang)
    vy = ec[1] + rad * np.sin(ang)
    heat = np.zeros(sh)
    near_vent = np.zeros(sh)
    for x_, y_ in zip(vx, vy):
        dv = np.hypot(XX - x_, YY - y_)
        heat += 6.5 * np.exp(-(dv / 2.6) ** 2)
        near_vent = np.maximum(near_vent, np.exp(-(dv / 1.2) ** 2))
    re_ = np.hypot(XX - ec[0], YY - ec[1])
    heat += 3.0 * (1.0 - G.sstep(7.5, 10.5, re_))
    heat = np.minimum(heat, 10.5)

    # Replace old East crater fumarole records in D['vents'] and add 3 cryofumaroles on Old Ice-Bowl
    kept_vents = [v for v in D.get('vents', []) if v.get('name') != 'East crater fumaroles']
    new_vents = [
        {'px': [round(float(x_), 2), round(float(y_), 2)],
         'floor': round(float(En[int(round(y_)), int(round(x_))]), 1),
         'scale': 0.14, 'radius': 1.0, 'kind': 'fumarole',
         'region': 'Ricochet Peaks', 'name': 'East Hearth fumaroles'}
        for x_, y_ in zip(vx, vy)
    ] + [
        {'px': [round(1375.0 + 3.2 * math.cos(a_), 2), round(1525.0 + 3.2 * math.sin(a_), 2)],
         'floor': round(float(En[int(round(1525.0 + 3.2 * math.sin(a_))), int(round(1375.0 + 3.2 * math.cos(a_)))]), 1),
         'scale': 0.10, 'radius': 0.8, 'kind': 'fumarole',
         'region': 'Ricochet Peaks', 'name': 'Old Ice-Bowl cryofumaroles'}
        for a_ in (0.6, 2.7, 4.8)
    ]

    fixed = T32.rivers_downhill(D, E0, En, whas)
    all_lakes = sw_lakes_mask | rp_lakes_mask
    all_floors = ((sw_floor | rp_floor) & ~all_lakes) & (np.abs(En - E0) > 1)

    rep = {
        'edit': '5.1 edit 37: SW outer wall annealed with Region 177 + 7 northern lakes; Ricochet Peaks 12-crater boreal tuning',
        'date': '2026-11-27',
        'sw_lakes': sw_lake_rep,
        'ricochet_craters': rp_crater_rep,
        'ricochet_cols': rp_cols,
        'vents_added': len(new_vents),
        'rivers_kept_downhill': fixed,
        'land_moved_cells': int((np.abs(En - E0) > 1).sum()),
    }
    out = os.path.join(HERE, 'edit_537_sw_wall_ricochet.report.json')
    if dry:
        print(json.dumps(rep, indent=1))
        return

    # Orographic snow-trap & Veil-spill moisture on the carved basins, plus Köppen consistency
    rp_hab = rp_floor & (En < 4450.0) & ~whas
    sw_bor_land = sw_boreal & (En < 4300.0) & ~whas
    sw_alp_land = sw_floor & ~sw_boreal & (En < 5400.0) & ~whas

    def rain_set(rain):
        # Veil-spill moisture into northern SW Outer Wall boreal lakes (680-980 mm), tapering south to 420 mm
        lat_k = np.clip((1060.0 - YY) / 195.0, 0.0, 1.0)
        sw_target = 420.0 + 540.0 * lat_k
        rain[sw_bor_land] = np.maximum(rain[sw_bor_land], sw_target[sw_bor_land])
        rain[sw_alp_land] = np.maximum(rain[sw_alp_land], 380.0)
        # Orographic crater-wall snowmelt harvest on Ricochet Peaks habitable bowls (560-820 mm)
        depth_k = np.clip((4450.0 - En) / 1250.0, 0.0, 1.0)
        rp_target = 460.0 + 340.0 * depth_k
        rain[rp_hab] = np.maximum(rain[rp_hab], rp_target[rp_hab])
        return rain

    def after_reclimate(D_, rain, cls, zon):
        T_ = {k: P.raster(D_, k, 'L').astype(float) - 90.0 for k in ('tm', 'tw', 'tc')}
        target_mask = (sw_floor | rp_floor) & ~whas & (En < 6600.0)
        for j, i in zip(*np.nonzero(target_mask)):
            tw_, tc_, tm_, pr_ = T_['tw'][j, i], T_['tc'][j, i], T_['tm'][j, i], rain[j, i]
            if tw_ < 10.0:
                nc = 'ET' if tw_ > 0.0 else 'EF'
            else:
                pth = 20.0 * tm_ + 140.0
                if pr_ < pth:
                    nc = 'BSk'
                else:
                    third = 'a' if tw_ >= 22.0 else ('b' if tw_ >= 14.0 else 'c')
                    nc = ('C' if tc_ > -3.0 else 'D') + 'f' + third
            if nc in codes:
                cls[j, i] = codes.index(nc)
        return rain, cls, zon

    boreal_paint = np.where((rp_hab | sw_bor_land) & ~whas, 0.78, 0.0)
    sinter_paint = np.where((rp_floor | rp_lakes_mask) & (near_vent > 0.05), 0.80 * near_vent, 0.0)

    rep['reclimate'] = T32.finish(
        D, E0, En, W1, whas0, wlev0, whas, wlev, all_lakes, all_floors, 53702,
        paint_floor=(88.0, 96.0, 74.0),
        heat=heat,
        rain_set=rain_set,
        after_reclimate=after_reclimate,
        paint_extra=[
            (boreal_paint, (46.0, 76.0, 48.0)),      # dark boreal spruce-larch forest green
            (sinter_paint, (224.0, 216.0, 188.0)),   # East Hearth hydrothermal sinter
        ]
    )

    cnow = P.raster(D, 'c', 'L')
    rep['sw_north_classes'] = {codes[k]: int(v) for k, v in zip(*np.unique(cnow[sw_floor & ~whas], return_counts=True))}
    rep['ricochet_floor_classes'] = {codes[k]: int(v) for k, v in zip(*np.unique(cnow[rp_floor & ~whas], return_counts=True))}
    T_final = {k: P.raster(D, k, 'L').astype(float) - 90.0 for k in ('tm', 'tw', 'tc')}
    rep['ricochet_hab_temps_C'] = {k: round(float(np.median(T_final[k][rp_hab])), 1) for k in T_final}
    rep['sw_boreal_temps_C'] = {k: round(float(np.median(T_final[k][sw_bor_land])), 1) for k in T_final}

    D['vents'] = kept_vents + new_vents
    D['edit_537'] = KEY
    P.save(D)

    # Update region store: anneal Region 177 into SW outer wall, sync Veiled Mountains, mist valley 2, mist valley, silent vale, Timpar-Kuran, Ricochet Peaks
    r_vm_old = store_regs.get('Veiled Mountains', {'id': 'rmwx28eysqk2e', 'color': '#4e7a5c'})
    r_174 = store_regs.get('Region 174', {'id': 'rmwx2eaiwaen8', 'color': '#5da05c', 'points': []})
    r_175 = store_regs.get('Region 175', {'id': 'rmwx2k9csuncc', 'color': '#5da05c', 'points': []})
    r_sv = store_regs.get('silent vale', {'id': 'rmw4wizrk66e1', 'color': '#6c7a86'})
    r_sw = store_regs['SW outer wall']
    r_rp = store_regs['Ricochet Peaks']

    recs = [
        {'id': r_sw['id'], 'name': 'SW outer wall', 'color': r_sw['color'], 'points': SW_OUTER_WALL_ANNEALED, 'kind': 'biome',
         'notes': "The SW outer wall (with Region 177 annealed onto its north end, edit 37): mostly cold and low-pressure (6-15 km, airless on the southern crest), stepping down northward through 4 glacial moraine mountain tarns (3.9-5.1 km) to 3 habitable boreal paternoster lakes (2.9-3.5 km, Dfb/Dfc) beside the Veiled Mountains; crossed at its waist by the Trigemini Pass (5,680 m Cold Tarn, edit 32)."},
        {'id': r_vm_old['id'], 'name': 'Veiled Mountains', 'color': r_vm_old['color'], 'points': VEILED_MOUNTAINS_EXPANDED, 'kind': 'biome',
         'notes': "The Veiled Mountains: omnipresent-mist Hoh-scale cool temperate-boreal rainforest valleys (Veilpass, mist valley, mist valley 2; 2.1-3.1 km floors) walled by tilted impact-megabreccia mountains; homeland of the Timpar-Kuran round the shattered arcology Kanopi (edits 35-37)."},
        {'id': r_174['id'], 'name': 'mist valley 2', 'color': r_174['color'], 'points': r_174['points'], 'kind': 'biome',
         'notes': "Northern branching rainforest U-valley of the Veiled Mountains (was Region 174), floor 2.1-2.75 km, Cfb/Dfb mist forest (edits 35, 37)."},
        {'id': r_175['id'], 'name': 'mist valley ', 'color': r_175['color'], 'points': r_175['points'], 'kind': 'biome',
         'notes': "Western flank rainforest U-valley of the Veiled Mountains (was Region 175), floor 2.15-2.7 km, Dfb/Cfb mist forest (edits 35, 37)."},
        {'id': r_sv['id'], 'name': 'silent vale', 'color': r_sv['color'], 'points': SILENT_VALE_SHIFTED, 'kind': 'biome',
         'notes': "The Silent Vale, shifted south below the expanded Veiled Mountains (y 972-1145, edit 37)."},
        {'id': 'rmwzqi9dwnd31', 'name': 'Timpar-Kuran', 'color': '#3f7a5e', 'points': TIMPAR_KURAN_POLITICAL, 'kind': 'political',
         'notes': "Unconquered mountain clan territory of the Timpar-Kuran ('Timber-Clans', third branch of the Utari-Kuran complex with the Hayrant and Hueru-Kuran, descended from ruined Kanopi; LORE.md 6.25)."},
        {'id': r_rp['id'], 'name': 'Ricochet Peaks', 'color': r_rp['color'], 'points': r_rp['points'], 'kind': 'biome',
         'notes': "Ricochet Peaks: 9-15 km southern cordillera gouged by a 12-crater grazing ricochet-ejecta swarm. Ten main bowls sunk to 3.18-3.75 km (with annular central-peak lakes, 3.85-4.45 km breach-notches to Yuni, Oidong, High Rift and Siphon Pits, and East Hearth's hydrothermal oasis) hold a cold, habitable boreal taiga (Dfc/Dfb) haunted by bandits and pioneering Yuni settlers (edits 33, 37)."},
    ]
    T32.write_regions(recs, KEY, 'SW outer wall + Region 177 lakes, Veiled Mountains/Timpar-Kuran sync, Ricochet Peaks 12 boreal craters (edit 37, 2026-11-27)')
    json.dump(rep, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print(json.dumps({
        'sw_north_classes': rep['sw_north_classes'],
        'sw_boreal_temps_C': rep['sw_boreal_temps_C'],
        'ricochet_floor_classes': rep['ricochet_floor_classes'],
        'ricochet_hab_temps_C': rep['ricochet_hab_temps_C'],
        'sw_lakes': len(sw_lake_rep),
        'ricochet_craters': len(rp_crater_rep),
    }, indent=1))
    print('saved')


if __name__ == '__main__':
    main()
