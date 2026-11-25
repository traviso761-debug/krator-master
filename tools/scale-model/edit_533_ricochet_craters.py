#!/usr/bin/env python3
"""Scale model 5.1, edit 33 (2026-11-25): Ricochet Peaks' ejecta craters (the owner: "we should modify Ricochet Peaks to
have a few ejecta craters leading to a few semi-habitable pockets").

    python tools/scale-model/edit_533_ricochet_craters.py [--dry]

The polygon is the live map's (edit_532_live.json). Ricochet Peaks held one crater pocket, at 1375,1525: a 6,900 m floor
with an ice tarn (EF). Its other land was 9-15 km and airless. This edit adds four more ejecta craters, as bowls sunk
into the peaks:
- the West crater at 1215,1535 (floor 5,400 m);
- the North crater at 1295,1515 (5,800 m);
- the South crater at 1335,1592 (5,600 m);
- the East crater at 1450,1558 (5,300 m).
Each floor is flat to 14-16 km across. The walls rise to the peaks, and an ejecta rim stands 250 m over the land round
it, its apron fading to twice the radius. The floors are the semi-habitable pockets. Notched cols lead from pocket to
pocket, with a spur to the South crater. The chain runs from the breathable southern flank by Longsong, through the
West, North, old and East craters, to the southern flank by the High Rift:
- the flank cols are at 6,300 m;
- the West-North col is at 6,600 m;
- the cols to the old crater are at 7,000 m (its floor is at 6,900).
Each col's course is routed over the peaks by their own low ground and cut as a winding valley (edit 32's route and
valley), not ruled lines.
The East crater, the lowest and nearest the High Rift's volcanism, holds a hydrothermal field (the owner: "at least
one of those craters be semi-habitable? cryofumarole type ecology"). The impact fractured the crust under it, and the
rift's heat drives water through the fractures, as at Haughton and Chicxulub:
- six fumaroles (vent records, kind fumarole, steam on the page);
- a hot-spring pool at the floor's centre (5,292 m);
- warm ground up to +13 C over the air's temperature, most in the cold months.
Steam freezes into ice towers and caves in the thin air, as on Erebus. The warm wet ground round the vents is Dfc
(moss, microbial mats, low scrub), the rest of the floor ET, with fog-drip ~380 mm. It is painted moss green, with
white sinter at the vents.
The rasters are finished as in edit 32: temperatures lapsed; cells that were airless take the temperatures of nearby
land at their new height; rain, class and zone re-derived; the floors painted a tundra dun; relit. The page: Ricochet
Peaks becomes a default biome region, reconcile key 5.1e29. Refuses to run twice (the West crater's floor is the marker).
"""
import json, math, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.geom as G   # noqa: E402
import edit_532_sw_wall_trigemini as T32    # noqa: E402

KEY = '5.1e29'
REG = next(r for r in T32.LIVE['regions'] if r['name'] == 'Ricochet Peaks')
OLD = (1375.0, 1525.0)
# (name, centre, floor m, flat radius px, wall px)
CRATERS = [('West', (1215.0, 1535.0), 5400.0, 7.5, 6.0), ('North', (1295.0, 1515.0), 5800.0, 7.0, 5.5),
           ('South', (1335.0, 1592.0), 5600.0, 7.0, 5.5), ('East', (1450.0, 1558.0), 5300.0, 8.0, 6.0)]


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    cw = CRATERS[0]
    if E0[int(cw[1][1]), int(cw[1][0])] < cw[2] + 50:
        sys.exit('edit_533 has run already (the West crater is in place)')
    sh = E0.shape
    codes = T32.codes_of(D)
    cls0 = P.raster(D, 'c', 'L')
    YY, XX = np.mgrid[0:sh[0], 0:sh[1]]
    En, whas, wlev, W1 = E0.copy(), whas0.copy(), wlev0.copy(), W0.copy()
    poly = G.poly([tuple(p) for p in REG['points']], 1.0, 1.0, sh)
    # the ejecta rims and aprons first (raised over the land), then the bowls (cut)
    floor = np.zeros(sh, bool)
    for nm, c, fm, rf, rw in CRATERS:
        r = np.hypot(XX - c[0], YY - c[1])
        R = rf + rw
        rim = np.where(r <= R, 250.0 * np.exp(-((r - R) / 1.6) ** 2), 250.0 * np.clip(1 - (r - R) / R, 0, 1) ** 2)
        En += np.where(~whas0 & (r <= 2 * R), rim, 0.0)
    for nm, c, fm, rf, rw in CRATERS:
        floor |= T32.bowl(En, c, fm, rf, rise=2400.0, r_wall=rw)
    # the cols that lead from pocket to pocket
    by = {nm: (c, fm) for nm, c, fm, rf, rw in CRATERS}
    by['old'] = (OLD, 6900.0)

    wf = T32.nearest_flank(E0, cls0, codes, by['West'][0], maxr=90, lim=6000.0)
    ef = T32.nearest_flank(E0, cls0, codes, by['East'][0], maxr=90, lim=6000.0)
    by['W flank'] = (wf, None); by['E flank'] = (ef, None)
    rng = np.random.default_rng(53302)
    floor_c = np.zeros(sh, bool)
    cols = {}
    # each link routed over the peaks by their own low ground (edit 32's route) and cut as a valley rising to its col at
    # the course's saddle; routed on the land with the craters already sunk, so a link leaves each bowl by its low side
    Er = En.copy()
    for a, b, col in (('W flank', 'West', 6300.0), ('West', 'North', 6600.0), ('North', 'old', 7000.0),
                      ('old', 'East', 7000.0), ('East', 'E flank', 6300.0), ('South', 'old', 7000.0)):
        (pa, fa), (pb, fb) = by[a], by[b]
        pts = T32.route(Er, pa, pb, rng, pad=14)
        f_, cm, cp = T32.valley(E0, En, pts, fa, col, fb, 3.0, rng, rise=2000.0)
        floor_c |= f_
        cols['%s-%s' % (a, b)] = {'col_m': round(cm), 'col_px': [round(cp[0], 1), round(cp[1], 1)], 'km': round(len(pts) * 0.5 * 2)}
    # ---- the East crater's hydrothermal field (the owner: "is it possible to have at least one of those craters be
    # semi-habitable? cryofumarole type ecology if plausible geologically maybe?"). Plausible: an impact fractures the
    # crust under its floor kilometres deep, and where there is heat below (here the High Rift's young volcanism, a
    # few tens of km south-east) meltwater circulates through the fractures for a long time (Haughton, Chicxulub). This
    # crater is the lowest and nearest the rift. Fumaroles, warm ground and hot springs on its floor: in the thin cold
    # air the steam freezes into ice towers and caves (as on Erebus), and the warm wet ground round them holds moss,
    # microbial mats and low scrub. A hot-spring pool fills the floor's centre.
    ec, efl, erf = by['East'][0], by['East'][1], 8.0
    re_ = np.hypot(XX - ec[0], YY - ec[1])
    pool = re_ <= 2.2
    PL = efl - 8.0
    En[pool] = np.minimum(En[pool], PL - 10.0)
    whas[pool] = True; wlev[pool] = PL; W1[pool] = True
    ang = np.array([0.4, 1.35, 2.2, 3.3, 4.4, 5.45])
    rad = np.array([3.6, 5.2, 4.1, 5.8, 3.9, 5.0])
    vx = ec[0] + rad * np.cos(ang); vy = ec[1] + rad * np.sin(ang)
    heat = np.zeros(sh)
    near_vent = np.zeros(sh)
    for x_, y_ in zip(vx, vy):
        dv = np.hypot(XX - x_, YY - y_)
        heat += 8.0 * np.exp(-(dv / 2.4) ** 2)
        near_vent = np.maximum(near_vent, np.exp(-(dv / 1.1) ** 2))
    heat += 4.0 * (1 - G.sstep(erf - 1.0, erf + 1.5, re_))         # the whole floor warm a little
    heat = np.minimum(heat, 13.0)
    efloor = (re_ <= erf + 0.5) & ~pool
    vents = [{'px': [round(float(x_), 2), round(float(y_), 2)], 'floor': round(float(En[int(round(y_)), int(round(x_))]), 1), 'scale': 0.12,
              'radius': 0.9, 'kind': 'fumarole', 'region': REG['name'], 'name': 'East crater fumaroles'} for x_, y_ in zip(vx, vy)]
    fixed = T32.rivers_downhill(D, E0, En, whas)
    moved = np.abs(En - E0) > 1
    floor_mask = (floor | floor_c) & (En < E0 - 1)
    rep = {'edit': "5.1 edit 33: Ricochet Peaks' ejecta craters", 'date': '2026-11-25',
           'craters': {nm: {'centre': list(c), 'floor_m': round(float(En[int(c[1]), int(c[0])])), 'peaks_m_was': round(float(E0[int(c[1]), int(c[0])])),
                            'across_km': round(2 * rf * 2)} for nm, c, fm, rf, rw in CRATERS},
           'cols': cols,
           'east_hydrothermal': {'pool_cells': int(pool.sum()), 'pool_level_m': round(PL), 'fumaroles': len(vents),
                                 'heat_C_max': round(float(heat.max()), 1), 'floor_cells_over_6C': int((efloor & (heat >= 6)).sum())},
           'flanks': {'W': [round(wf[0]), round(wf[1]), round(float(E0[int(wf[1]), int(wf[0])]))], 'E': [round(ef[0]), round(ef[1]), round(float(E0[int(ef[1]), int(ef[0])]))]},
           'outside_polygon_moved_cells': int((moved & ~poly).sum()),
           'rivers_kept_downhill': fixed, 'land_moved_cells': int(moved.sum()), 'lowered_m_max': round(float((E0 - En).max())),
           'raised_cells': int((En > E0 + 1).sum())}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    out = os.path.join(HERE, 'edit_533_ricochet_craters.report.json')
    json.dump(rep, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    if dry:
        return
    rep['reclimate'] = T32.finish(
        D, E0, En, W1, whas0, wlev0, whas, wlev, pool, floor_mask & ~pool, 53301, paint_floor=(104.0, 100.0, 78.0),
        heat=heat, force=[(efloor & (heat >= 6.0), 'Dfc'), (efloor & (heat < 6.0), 'ET')], rain_min=(efloor, 380.0),
        paint_extra=[(np.where(efloor, 0.65 * G.sstep(4.0, 8.0, heat), 0.0), (66.0, 92.0, 56.0)),
                     (np.where(efloor | pool, 0.8 * near_vent, 0.0), (224.0, 216.0, 186.0))])
    cnow = P.raster(D, 'c', 'L')
    rep['floor_classes'] = {codes[k]: int(v) for k, v in zip(*np.unique(cnow[floor_mask & ~pool], return_counts=True))}
    T_ = {k: P.raster(D, k, 'L').astype(float) - 90 for k in ('tm', 'tw', 'tc')}
    rep['east_hydrothermal']['floor_temps_C'] = {k: round(float(np.median(T_[k][efloor])), 1) for k in T_}
    D['vents'] = D['vents'] + vents
    P.save(D)
    T32.write_regions([{'id': REG['id'], 'name': REG['name'], 'color': REG['color'], 'points': REG['points'], 'kind': REG['kind'],
                        'notes': "Ricochet Peaks: 9-15 km airless peaks south of the Stalker Peaks, pocked by ejecta craters. Four craters sunk to 5.3-5.8 km and the old 6.9 km ice-tarn crater hold the semi-habitable pockets; notched cols (6.3-7 km) lead from flank to pocket to pocket across the range (the owner, 2026-11-25; scale model 5.1 edit 33)."}],
                       KEY, 'Ricochet Peaks from the live map (edit 33, 2026-11-25)')
    json.dump(rep, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print(json.dumps({'floor_classes': rep['floor_classes'], 'air': rep['reclimate'].get('airless_cells_given_air')}))
    print('saved')


if __name__ == '__main__':
    main()
