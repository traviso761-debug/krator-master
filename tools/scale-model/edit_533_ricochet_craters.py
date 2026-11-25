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

    def link(a, b, col, hw=3.0):
        (pa, fa), (pb, fb) = by[a], by[b]
        mid = ((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2)
        return [([pa, mid], fa, col, hw), ([mid, pb], col, fb, hw)]
    wf = T32.nearest_flank(E0, cls0, codes, by['West'][0], maxr=90, lim=6000.0)
    ef = T32.nearest_flank(E0, cls0, codes, by['East'][0], maxr=90, lim=6000.0)
    by['W flank'] = (wf, None); by['E flank'] = (ef, None)
    lines = (link('W flank', 'West', 6300.0) + link('West', 'North', 6600.0) + link('North', 'old', 7000.0)
             + link('old', 'East', 7000.0) + link('East', 'E flank', 6300.0) + link('South', 'old', 7000.0))
    lines = [(pts, (E0[int(pts[0][1]), int(pts[0][0])] if f0 is None else f0), f1, hw) for pts, f0, f1, hw in lines]
    lines = [(pts, f0, (E0[int(pts[-1][1]), int(pts[-1][0])] if f1 is None else f1), hw) for pts, f0, f1, hw in lines]
    floor_c = T32.carve(E0, En, lines, rise=2000.0)
    fixed = T32.rivers_downhill(D, E0, En, whas)
    moved = np.abs(En - E0) > 1
    floor_mask = (floor | floor_c) & (En < E0 - 1)
    rep = {'edit': "5.1 edit 33: Ricochet Peaks' ejecta craters", 'date': '2026-11-25',
           'craters': {nm: {'centre': list(c), 'floor_m': round(float(En[int(c[1]), int(c[0])])), 'peaks_m_was': round(float(E0[int(c[1]), int(c[0])])),
                            'across_km': round(2 * rf * 2)} for nm, c, fm, rf, rw in CRATERS},
           'flanks': {'W': [round(wf[0]), round(wf[1]), round(float(E0[int(wf[1]), int(wf[0])]))], 'E': [round(ef[0]), round(ef[1]), round(float(E0[int(ef[1]), int(ef[0])]))]},
           'outside_polygon_moved_cells': int((moved & ~poly).sum()),
           'rivers_kept_downhill': fixed, 'land_moved_cells': int(moved.sum()), 'lowered_m_max': round(float((E0 - En).max())),
           'raised_cells': int((En > E0 + 1).sum())}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    out = os.path.join(HERE, 'edit_533_ricochet_craters.report.json')
    json.dump(rep, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    if dry:
        return
    rep['reclimate'] = T32.finish(D, E0, En, W1, whas0, wlev0, whas, wlev, np.zeros(sh, bool), floor_mask, 53301, paint_floor=(104.0, 100.0, 78.0))
    cnow = P.raster(D, 'c', 'L')
    rep['floor_classes'] = {codes[k]: int(v) for k, v in zip(*np.unique(cnow[floor_mask], return_counts=True))}
    P.save(D)
    T32.write_regions([{'id': REG['id'], 'name': REG['name'], 'color': REG['color'], 'points': REG['points'], 'kind': REG['kind'],
                        'notes': "Ricochet Peaks: 9-15 km airless peaks south of the Stalker Peaks, pocked by ejecta craters. Four craters sunk to 5.3-5.8 km and the old 6.9 km ice-tarn crater hold the semi-habitable pockets; notched cols (6.3-7 km) lead from flank to pocket to pocket across the range (the owner, 2026-11-25; scale model 5.1 edit 33)."}],
                       KEY, 'Ricochet Peaks from the live map (edit 33, 2026-11-25)')
    json.dump(rep, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print(json.dumps({'floor_classes': rep['floor_classes'], 'air': rep['reclimate'].get('airless_cells_given_air')}))
    print('saved')


if __name__ == '__main__':
    main()
