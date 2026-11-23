#!/usr/bin/env python3
"""Scale model 5.1, edit 27 (2026-11-23 re-run): Lāiṭwāl's bay and wall (settlements/lightwall/PLAN.md section 10, on
claude/lightwall-ground 75121e0ed; the owner, 2026-11-23: "change the world").

    python tools/scale-model/edit_527_lightwall.py [--dry]

The pin 1028,1653 (the town's bench: "the bench" here is Lāiṭwāl's own, not a landform). At the model's 2 km cells:
- **The bay**: the lake (1,315 m) brought up to the bench: row 1654 at px 1027-1029 and row 1655 at px 1026-1028 (which
  joins it to the lake) flooded, the bed 16 m under the level on 1654 and 25 m on 1655; px 1026 and 1030 on row 1654 eased
  down to the shingle (1,318 m). The pin's own cell is untouched.
- **The scarp**: the north boundary fault's face: row 1652 at px 1026-1030 raised to 2,650 m, the upthrown block behind it
  rising ~6 % (row 1651 to 2,760 m, row 1650 to 2,880 m) into the existing range (never lowered), fading over px 1024-1025
  and 1031-1032. The open world gathers the rise into a cliff from the heights (extract_region.py's scarp layers).
New water takes the lake's class, zone and paint; temperatures lapsed, the paint relit. Refuses to run twice (1028,1654
wet is its marker).
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C   # noqa: E402

PIN = (1028, 1653)
LAKE = 1315.05
BAY = {(1027, 1654): LAKE - 16, (1028, 1654): LAKE - 16, (1029, 1654): LAKE - 16,
       (1026, 1655): LAKE - 25, (1027, 1655): LAKE - 25, (1028, 1655): LAKE - 25}
SHINGLE = {(1026, 1654): 1318.0, (1030, 1654): 1318.0}
SCARP = {1652: 2650.0, 1651: 2760.0, 1650: 2880.0}
TAPER = {1024: 0.25, 1025: 0.5, 1026: 1.0, 1027: 1.0, 1028: 1.0, 1029: 1.0, 1030: 1.0, 1031: 0.5, 1032: 0.25}


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    if whas0[1654, 1028]:
        sys.exit('edit_527_lightwall has run already (1028,1654 is water)')
    En, whas, wlev, W1 = E0.copy(), whas0.copy(), wlev0.copy(), W0.copy()
    for (x, y), bed in BAY.items():
        En[y, x] = min(En[y, x], bed); whas[y, x] = True; wlev[y, x] = LAKE; W1[y, x] = True
    for (x, y), h in SHINGLE.items():
        if not whas[y, x]:
            En[y, x] = min(En[y, x], h)
    for y, top in SCARP.items():
        for x, w in TAPER.items():
            En[y, x] = max(En[y, x], En[y, x] + w * (top - En[y, x]))
    new_w = whas & ~whas0
    lake = whas & (np.abs(np.nan_to_num(wlev, nan=-9e9) - LAKE) < 1.0) & ~new_w
    lake_near = lake & (nd.distance_transform_edt(~new_w) <= 6)
    rep = {'edit': '5.1 edit 27: Lāiṭwāl\'s bay and wall', 'date': '2026-11-23', 'pin_m': round(float(En[PIN[1], PIN[0]])),
           'pin_unchanged': bool(En[PIN[1], PIN[0]] == E0[PIN[1], PIN[0]]), 'bay_cells': int(new_w.sum()),
           'scarp_row_1652': {str(x): round(float(En[1652, x])) for x in range(1024, 1033)},
           'lake_within_1_cell_south': bool(whas[PIN[1] + 1, PIN[0]]),
           'wall_within_1_cell_north_m_over_pin': round(float(En[1652, PIN[0]] - En[PIN[1], PIN[0]])),
           'connected_to_lake': bool(nd.label(whas)[0][1654, 1028] == nd.label(whas)[0][1660, 1028])}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    assert rep['pin_unchanged'] and rep['lake_within_1_cell_south'] and rep['wall_within_1_cell_north_m_over_pin'] > 1000
    assert rep['connected_to_lake']
    if dry:
        return
    for k in ('c', 'z'):
        a = P.raster(D, k, 'L').copy()
        a[new_w] = int(np.bincount(a[lake_near]).argmax())
        D[k] = P.b64(Image.fromarray(a, 'L'), optimize=True)
    for k in ('st', 't', 'ct'):
        a = P.raster(D, k).copy()
        a[new_w] = np.median(a[lake_near], 0).astype(np.uint8)
        D[k] = P.jpeg_like(D, k, a)
    D['h'] = P.encode_heights(D, E0, W1)
    D['wl'] = P.encode_levels(D, whas, wlev)
    lap = C.lapse(D, E0, En, whas, wlev)
    for k in C.TEMPS:
        D[k] = lap[k]
    relit, _, _ = PA.relight(D, E0, En)
    for k, v in relit.items():
        D[k] = v
    D['h'] = P.encode_heights(D, En, W1)
    P.save(D)
    json.dump(rep, open(os.path.join(HERE, 'edit_527_lightwall.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
