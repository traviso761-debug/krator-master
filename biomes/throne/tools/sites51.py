#!/usr/bin/env python3
"""Site each Throne station on scale model 5.1 (tools/scale-model/model/data/h.png, read only) for its far country.

    python3 biomes/throne/tools/sites51.py            # prints the sites; --bake writes each stations/<name>/region.json

A station given as px on the 5.1 canvas (PLAN.md, its 45's header) keeps it. The others are ideal types sited by their 45's own words: a
bearing from the summit (px 847, 834; degrees clockwise from north), a distance (km) and a height (m). The site is the point along that
bearing, between 60 and 140 % of the distance, whose height on the model is nearest the stated one (2 km a px). --bake runs the Godthrone's
region.py (read in place: biomes/godthrone/tools/region.py --kit biomes/throne) for each. Deterministic; every text write names utf-8 and '\\n'.
"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
D = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
mj = {k['key']: k.get('value') for k in json.load(open(os.path.join(D, 'model.json'), encoding='utf-8'))['keys']}
h = np.array(Image.open(os.path.join(D, 'h.png')))
E = mj['lo'] + ((h[..., 0].astype(np.int64) << 8) | h[..., 1]) / 65535 * (mj['hi'] - mj['lo'])
SUMMIT = (847, 834)
# station: ('px', x, y) | ('bearing', degrees, km, metres); the station's folder name ('' = station 1, src/)
SITES = {
    '':           ('bearing', 157.5, 95, 1900),   # the south-east shoulder, the summit to the north-north-west, ~1.9 km up
    'ashdesert':  ('bearing', 135, 65, 2200),     # the south-east flank under the plume's axis, the vent to the north-west
    'blast':      ('bearing', 22.5, 60, 2500),    # 28-32 px north-north-east, 2.2-2.8 km up
    'caldera':    ('px', 847, 834),               # the summit
    'cloudforest': ('bearing', 270, 90, 3000),    # the west flank, the summit due east
    'delta':      ('px', 900, 858),
    'frontier':   ('px', 795, 860),               # Zey'danin's cell (re-surveyed 2026-11-02)
    'glacier':    ('bearing', 315, 60, 6000),     # the north-west flank, the vent to the south-east, 5.6-6.5 km up
    'isle':       ('bearing', 270, 170, 0),       # an inner isle ~170 km west of the summit (sea level)
    'kipuka':     ('bearing', 255, 110, 1500),    # the west flank's windward lowlands, ~110 km out, below the cloud belt
    'penitentes': ('px', 866, 839),
    'savanna':    ('bearing', 180, 100, 1000),    # the south flank, the summit due north, ~1 km up
    'tube':       ('bearing', 150, 100, 1600),    # the south-east shoulder ~1.6 km up, under the plume's edge
    'vents':      ('bearing', 110, 80, 1400),     # the east rift, the vent to the west-north-west
}


def at(x, y):
    i, j = int(round(x)), int(round(y))
    return float(E[j, i])


def site(spec):
    if spec[0] == 'px':
        return spec[1], spec[2]
    _, b, km, m = spec
    sx, sy = math.sin(math.radians(b)), -math.cos(math.radians(b))
    best = None
    for k in range(int(km * .6), int(km * 1.4) + 1, 2):
        x, y = SUMMIT[0] + sx * k / 2, SUMMIT[1] + sy * k / 2
        e = abs(at(x, y) - m)
        if best is None or e < best[0]:
            best = (e, round(x, 1), round(y, 1))
    return best[1], best[2]


if __name__ == '__main__':
    bake = '--bake' in sys.argv
    for name, spec in SITES.items():
        x, y = site(spec)
        print('%-12s px %7.1f %7.1f  model %6.0f m' % (name or 'station 1', x, y, at(x, y)))
        if bake:
            st = name or '_station1'   # station 1's page is src/: its region is written to a scratch station, then moved to src/region.json
            sd = os.path.join(ROOT, 'biomes', 'throne', 'stations', st)
            os.makedirs(sd, exist_ok=True)
            subprocess.run([sys.executable, os.path.join(ROOT, 'biomes', 'godthrone', 'tools', 'region.py'), st, str(x), str(y), '--n', '61',
                            '--cell', '2000', '--kit', 'biomes/throne'], check=True)
            if not name:
                os.replace(os.path.join(sd, 'region.json'), os.path.join(ROOT, 'biomes', 'throne', 'region.json'))
                os.rmdir(sd)
