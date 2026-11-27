#!/usr/bin/env python3
"""The East Abyss basin & near-environs as Godot data straight from the scale model
(modeled on openworld/catch-bowl/tools/export_godot.py, incorporating geology landforms,
dense-air monsoon/haze weather presets, and all 16 East Abyss settlements).

    python3 openworld/east-abyss/tools/export_godot.py            # writes godot/data/east-abyss/
    python3 openworld/east-abyss/tools/export_godot.py --step 1
"""
import json, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(REPO, 'tools', 'scale-model')]
import smodel.page as P   # noqa: E402

OUT = os.path.join(REPO, 'godot', 'data', 'east-abyss')
REGION = 'east-abyss'
KM_PER_PX = 2.0
M_PER_PX = KM_PER_PX * 1000.0
LANDFORMS = ['none', 'mesa', 'pedestal', 'hoodoo', 'karst', 'evaporite', 'breccia', 'tor']
POLYGONS = [
    ('rmuqltx63f4do', 'e abysss'),
    ('rmuvlpgkd7v7w', 'Yuni Valley'),
    ('rmuvkd2jtd3zm', 'east rim'),
]
ORIGIN_PX = [1285, 875]

WEATHER = [
    dict(id='clear', name='Clear dense-air', note='1.9-2.2 atm East Abyss floor, warm turquoise salt lakes and sunbeams'),
    dict(id='humid', name='Abyssal steam haze', note='thick tropical-abyssal humidity hanging over the canopy and salt marshes'),
    dict(id='monsoon', name='East Abyss monsoon', note='heavy seasonal rain cascading off the eastern cliff walls into the salt lakes'),
    dict(id='saltmist', name='Salt-pan mist', note='morning evaporative mist rising off the closed-basin brine lakes'),
    dict(id='dust', name='Rim-wind haze', note='warm ochre dust spilling over the western escarpment from the SE desert'),
]


def classify_geology(box, sub, wsub, step):
    import base64 as _b64
    x0, y0, x1, y1 = box
    geo_path = os.path.join(REPO, 'kits', 'resources', 'data', 'geology-gemini.json')
    if not os.path.isfile(geo_path):
        return np.zeros(sub.shape, dtype=np.uint8), {}
    GJ = json.load(open(geo_path, encoding='utf-8'))
    gw, gh, gcell = int(GJ['grid']['w']), int(GJ['grid']['h']), float(GJ['grid']['cell_km'])

    def glayer(name):
        raw = GJ['layers'].get(name)
        if raw is None:
            return np.zeros((gh, gw), dtype=np.uint8)
        b = np.frombuffer(_b64.b64decode(raw), dtype=np.uint8)
        return np.repeat(b[1::2], b[0::2].astype(np.int32) + 1).reshape(gh, gw)

    def at(name):
        a = glayer(name)
        ys = np.clip((np.arange(y0, y1, step) * KM_PER_PX / gcell).astype(int), 0, gh - 1)
        xs = np.clip((np.arange(x0, x1, step) * KM_PER_PX / gcell).astype(int), 0, gw - 1)
        return a[np.ix_(ys, xs)].astype(float)

    stone, impact, iron = at('stone'), at('impactite'), at('iron')
    tuff, lime, halite, saltp = at('tuff'), at('limestone'), at('halite'), at('saltpeter')
    gy_, gx_ = np.gradient(sub, 2000.0)
    gslope = np.hypot(gx_, gy_)
    fam = np.zeros(sub.shape, dtype=np.uint8)
    fam[(stone >= 120) & (gslope < 0.14)] = LANDFORMS.index('mesa')
    fam[(iron >= 140) & (stone >= 90) & (gslope < 0.10)] = LANDFORMS.index('pedestal')
    fam[(impact >= 170) & (gslope < 0.30)] = LANDFORMS.index('breccia')
    fam[tuff >= 60] = LANDFORMS.index('hoodoo')
    fam[lime >= 90] = LANDFORMS.index('karst')
    fam[((halite >= 60) | (saltp >= 190)) & (gslope < 0.05)] = LANDFORMS.index('evaporite')
    fam[gslope >= 0.30] = LANDFORMS.index('tor')
    fam[wsub] = 0
    famcount = {LANDFORMS[i]: int((fam == i).sum()) for i in range(len(LANDFORMS))}
    return fam, famcount


def main():
    import base64, io as _io
    step = 1
    for i, a in enumerate(sys.argv):
        if a == '--step' and i + 1 < len(sys.argv):
            step = max(1, int(sys.argv[i + 1]))
    D = P.load()
    E, _ = P.heights(D)
    whas, wlev = P.water_levels(D)
    H, W = E.shape
    from smodel.geom import region_mask
    regs = P.regions()
    grid = P.grid(D)
    mask = np.zeros((H, W), bool)
    for rid, name in POLYGONS:
        m = region_mask(regs, name, *grid, (H, W))
        mask |= m
        print('  %s (%s): %d cells' % (name, rid, int(m.sum())))
    ys, xs = np.nonzero(mask)
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
    box = (x0, y0, x1, y1)
    sub = E[y0:y1:step, x0:x1:step]
    wsub = whas[y0:y1:step, x0:x1:step]
    msub = mask[y0:y1:step, x0:x1:step]
    wlsub = np.asarray(wlev, dtype=float)[y0:y1:step, x0:x1:step]
    lo, hi = float(np.nanmin(sub)), float(np.nanmax(sub))
    os.makedirs(OUT, exist_ok=True)
    h16 = np.clip((sub - lo) / max(1.0, hi - lo) * 65535.0, 0, 65535).astype(np.uint16)
    Image.frombytes('I;16', (h16.shape[1], h16.shape[0]), h16.astype('<u2').tobytes()).save(os.path.join(OUT, 'height.png'))
    Image.fromarray((wsub * 255).astype(np.uint8), mode='L').save(os.path.join(OUT, 'water.png'))
    wl16 = np.where(wsub, np.clip((wlsub - lo) / max(1.0, hi - lo) * 65535.0, 1, 65535), 0).astype(np.uint16)
    Image.frombytes('I;16', (wl16.shape[1], wl16.shape[0]), wl16.astype('<u2').tobytes()).save(os.path.join(OUT, 'wlevel.png'))
    Image.fromarray((msub * 255).astype(np.uint8), mode='L').save(os.path.join(OUT, 'inside.png'))
    geo, famcount = classify_geology(box, sub, wsub, step)
    Image.fromarray(geo, mode='L').save(os.path.join(OUT, 'geology.png'))

    for key, name in (('tm', 'temp.png'), ('p', 'rain.png')):
        raw = D.get(key)
        if not isinstance(raw, str):
            continue
        im = Image.open(_io.BytesIO(base64.b64decode(raw)))
        a = np.asarray(im.convert('L'))
        Image.fromarray(a[y0:y1:step, x0:x1:step].astype(np.uint8), mode='L').save(os.path.join(OUT, name))

    setts = [s for s in P.settlements() if x0 <= s['px'] < x1 and y0 <= s['py'] < y1]
    sites = [{
        'id': s['id'], 'name': s['name'], 'type': s['type'], 'polity': s.get('polity', ''),
        'px': [s['px'], s['py']],
        'x': round((s['px'] - ORIGIN_PX[0]) * M_PER_PX, 1),
        'z': round((s['py'] - ORIGIN_PX[1]) * M_PER_PX, 1),
        'elev_m': round(float(E[s['py'], s['px']]), 1),
    } for s in setts]
    meta = {
        'region': REGION, 'box_px': [x0, y0, x1, y1], 'origin_px': ORIGIN_PX,
        'step': step, 'm_per_px': M_PER_PX, 'elev_lo_m': round(lo, 2), 'elev_hi_m': round(hi, 2),
        'size': [int(sub.shape[1]), int(sub.shape[0])],
        'landforms': LANDFORMS, 'landform_counts': famcount, 'weather': WEATHER, 'sites': sites,
    }
    with open(os.path.join(OUT, 'meta.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(meta, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    print('Exported godot/data/east-abyss/ (%dx%d, elev %.0f..%.0f m, %d sites, landforms=%s)' % (
        sub.shape[1], sub.shape[0], lo, hi, len(sites), famcount))


if __name__ == '__main__':
    main()
