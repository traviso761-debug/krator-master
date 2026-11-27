#!/usr/bin/env python3
"""Scale model 5.1, edit 34 (2026-11-25): a young shield volcano banked against the Tharn Uplands' west face, the
"half dome" (the owner: "another, even larger shield volcano trying to form at the very edge of the continental rock of
the tharn uplands. would this create a 'halfdome' volcano as the volcano can't run uphill?"; site A, the west face).

    python tools/scale-model/edit_534_half_dome.py [--dry]

The Tharn Uplands' west face is a broad scarp, ~2.7 km at its foot to ~6.8 km 40 px in. The vent stands at its foot
(1520,128). Lava runs downhill, so the shield builds out over the low country and banks against the scarp; it cannot
climb it. That is Kīlauea against Mauna Loa, or Etna against the Peloritani, and the unbuttressed side slides away.
At the model's 2 km cells:
- the shield's surface falls from a 6,500 m summit to its foot (the land 118-124 px out on the low side) over a
  120 px reach, 240 km (h = foot + (6500 - foot)(1 - u^1.6)^1.4; twice the first cut's 60 px at the owner's word,
  2026-11-26, its west foot meeting the Dome's). The land takes the higher of the two everywhere: the volcano only adds,
  and toward the upland the rising scarp stands clear of it (the half dome);
- a rift zone along the scarp (NNE-SSW), a wandering, broken chain of cones ~110 m high fading down the flanks, and
  fresh lava's fine texture;
- a summit caldera 12 km across and ~250 m deep, a lava vent in it (vents.json, glowing on the page);
- on the free west flank a landslide amphitheatre (like Etna's Valle del Bove), up to ~550 m deep and opening downhill,
  and its hummocky debris apron spread past the foot.
Temperatures are lapsed (cells taken over the air limit stay airless); rain, class and zone re-derived; the young lava
painted basalt-dark toward the summit, the scar raw; relit. A biome region traced round the shield, "the half-dome
(to be named)", reconcile key 5.1e30. Refuses to run twice (the summit).
"""
import json, math, os, sys
import numpy as np
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.geom as G   # noqa: E402
import edit_532_sw_wall_trigemini as T32    # noqa: E402

KEY = '5.1e30'
VENT = (1520.0, 128.0)
SUMMIT = 6500.0
REACH = 120.0           # 240 km: twice the first cut's (the owner: "make the new volcano twice as wide")
RID = 'rmwhalfdome01'


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    if E0[int(VENT[1]), int(VENT[0])] > SUMMIT - 600:
        sys.exit('edit_534 has run already (the summit stands at the vent)')
    sh = E0.shape
    YY, XX = np.mgrid[0:sh[0], 0:sh[1]]
    cx, cy = VENT
    r = np.hypot(XX - cx, YY - cy)
    th = np.arctan2(YY - cy, XX - cx)
    u = r / REACH
    rng = np.random.default_rng(53401)
    # the foot: the low country's own height round the reach (the west half, where the shield spreads)
    ring = (r > REACH - 2) & (r <= REACH + 4) & ~whas0 & (XX < cx)
    foot = float(np.median(E0[ring]))
    shield = foot + (SUMMIT - foot) * np.clip(1 - np.clip(u, 0, 1) ** 1.6, 0, 1) ** 1.4
    # the rift zone along the scarp (its strike, NNE-SSW): a ridge fading down the flanks
    strike = math.atan2(1.0, -0.25)                     # the scarp runs from (1544,60) to (1514,180)
    ax, ay = math.cos(strike), math.sin(strike)
    along_s = (XX - cx) * ax + (YY - cy) * ay
    wob = 2.6 * np.sin(along_s / 7.0 + 0.8) + 1.4 * np.sin(along_s / 3.1)        # the rift wanders
    dperp = np.abs(-(XX - cx) * ay + (YY - cy) * ax - wob)
    broken = np.clip(0.55 + 0.6 * nd.gaussian_filter(rng.standard_normal(sh), 2.5) / 0.11, 0, 1)   # a chain of cones, not a wall
    shield += 110.0 * np.exp(-(dperp / 3.0) ** 2) * np.clip(1 - u, 0, 1) * broken
    fine = nd.gaussian_filter(rng.standard_normal(sh), 1.0) * 18.0 * np.clip(1 - u, 0, 1)
    shield += fine
    # the summit caldera
    cald = r < 3.0
    shield = np.where(cald, SUMMIT - 250.0 + 30.0 * (r / 3.0) ** 4, shield)
    # the shield's last fifth fades into the land (a single foot height would otherwise end in a step where the land
    # beyond lies lower)
    fade = G.sstep(0.8, 1.0, u)
    shield = shield * (1 - fade) + E0 * fade
    inside = (u <= 1.0)
    En = E0.copy()
    take = inside & ~whas0 & (shield > E0)
    En[take] = shield[take]
    # the free flank's collapse: an amphitheatre opening west-south-west, its floor sloping downhill, and the debris apron
    bear = math.radians(195.0)
    dth = np.angle(np.exp(1j * (th - bear)))
    # the amphitheatre: a rounded head upslope (at u ~0.28), its sides ragged, its floor open downslope to the toe
    bx, by_ = math.cos(bear), math.sin(bear)
    a_ = ((XX - cx) * bx + (YY - cy) * by_) / REACH           # along the slide, from the vent
    c_ = (-(XX - cx) * by_ + (YY - cy) * bx) / REACH          # across it
    rag = 1.0 + 0.18 * nd.gaussian_filter(rng.standard_normal(sh), 1.6) / 0.17
    Wc = (0.13 + 0.07 * np.clip((a_ - 0.28) / 0.5, 0, 1)) * rag   # widening downslope
    head = np.clip((0.28 - a_) / 0.09, 0, None)
    re_ = np.sqrt(head ** 2 + (c_ / Wc) ** 2)
    scar = 550.0 * np.clip(1 - re_ ** 2, 0, 1) * (1 - G.sstep(0.78, 0.92, a_)) * (1 - 0.45 * np.clip((a_ - 0.3) / 0.5, 0, 1))
    wedge = np.exp(-(np.clip(np.abs(c_) / 0.22, 0, None)) ** 4)    # the debris apron's spread
    En = np.where(take, En - scar, En)
    hum = nd.gaussian_filter(rng.standard_normal(sh), 1.1); hum = np.clip(hum / (hum.std() + 1e-9), -1.5, 2.5)
    apron = wedge * G.sstep(0.8, 0.95, u) * (1 - G.sstep(1.15, 1.45, u))
    add = apron * (70.0 + 45.0 * hum)
    En = np.where(~whas0, En + np.maximum(add, 0.0), En)
    moved = np.abs(En - E0) > 1
    fixed = T32.rivers_downhill(D, E0, En, whas0)
    # the region: the shield traced round by bearing (where it raised the land 30 m or more)
    raised = (En - E0 > 30) & ~whas0
    poly = []
    for b in np.linspace(-math.pi, math.pi, 28, endpoint=False):
        rr = np.arange(1.0, REACH * 1.5, 0.5)
        xs_, ys_ = cx + rr * math.cos(b), cy + rr * math.sin(b)
        ok = raised[np.clip(np.round(ys_).astype(int), 0, sh[0] - 1), np.clip(np.round(xs_).astype(int), 0, sh[1] - 1)]
        k = int(np.nonzero(ok)[0].max()) if ok.any() else 0
        poly.append([int(round(xs_[k])), int(round(ys_[k]))])
    vent = {'px': [cx, cy], 'floor': round(SUMMIT - 250.0, 1), 'scale': 0.6, 'radius': 3.0, 'name': 'the half-dome (to be named)',
            'region': 'the half-dome (to be named)'}
    east = [int(round(cx + k * 0.97)) for k in (5, 10, 15, 20)]
    rep = {'edit': '5.1 edit 34: the half-dome shield', 'date': '2026-11-25', 'vent': list(VENT), 'summit_m': round(float(En[int(cy), int(cx) + 4])),
           'caldera_floor_m': round(float(En[int(cy), int(cx)])), 'foot_m': round(foot), 'reach_km': round(REACH * 2),
           'profile_west_m': [round(float(En[int(cy), int(cx) - k])) for k in (10, 20, 40, 60, 80, 100, 120)],
           'profile_east_m': [round(float(En[int(cy), x_])) for x_ in east],
           'land_east_was_m': [round(float(E0[int(cy), x_])) for x_ in east],
           'scar_depth_m_max': round(float(scar.max())), 'land_moved_cells': int(moved.sum()), 'raised_km2': int(raised.sum() * 4),
           'rivers_kept_downhill': fixed, 'region_points': len(poly)}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    out = os.path.join(HERE, 'edit_534_half_dome.report.json')
    json.dump(rep, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    if dry:
        return
    young = np.where(raised, np.clip(1.15 - u, 0, 1) ** 1.3 * 0.7, 0.0)
    scarw = np.where(raised, np.clip(scar / 300.0, 0, 1) * 0.6, 0.0)
    W1 = W0.copy()
    rep['reclimate'] = T32.finish(D, E0, En, W1, whas0, wlev0, whas0.copy(), wlev0.copy(), np.zeros(sh, bool), np.zeros(sh, bool), 53402,
                                  paint_extra=[(young, (60.0, 56.0, 54.0)), (scarw, (120.0, 104.0, 88.0))])
    D['vents'] = D['vents'] + [vent]
    P.save(D)
    T32.write_regions([{'id': RID, 'name': 'the half-dome (to be named)', 'color': '#8a6f5a', 'points': poly, 'kind': 'biome',
                        'notes': "A young shield volcano banked against the Tharn Uplands' west face (the owner, 2026-11-25). Its vent is at the scarp's foot (1520,128). Lava cannot climb, so it builds out over the low country, ~240 km in reach and ~6.5 km at the summit, its west foot meeting the Dome's, and leans on the rising scarp: a half dome, as Kīlauea leans on Mauna Loa and Etna on the Peloritani. A rift zone runs along the scarp, a summit caldera holds a lava vent, and its unbuttressed west flank has slid away in a landslide amphitheatre (like Etna's Valle del Bove) with a hummocky debris apron. Scale model 5.1 edit 34."}],
                       KEY, 'the half-dome from edit 34 (2026-11-25)')
    json.dump(rep, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print('saved')


if __name__ == '__main__':
    main()
