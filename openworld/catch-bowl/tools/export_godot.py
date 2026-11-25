#!/usr/bin/env python3
"""The catch-bowl region as Godot data, straight from the scale model (the owner, 2026-11-25: "can we pull up the new
region in godot and give me a godot native host so i can navigate and trigger different weather conditions").

    python3 openworld/catch-bowl/tools/export_godot.py            # writes godot/data/catch-bowl/
    python3 openworld/catch-bowl/tools/export_godot.py --step 1    # 1 px a sample (the default 1 is the model's own)

WHY THIS AND NOT THE USUAL PIPELINE. A region normally reaches Godot as a CUT: `tools/scale-model/cut_site.py` and
`extract_region.py` give `openworld/<region>/data`, a page is built, and `godot/tools/export_spike.py` pulls the export
out of the page in Chromium. **catch-bowl is not cut** -- it waits on three map edits and on the owner's new scale model
(`openworld/catch-bowl/PLAN.md` section 13) -- and cutting it twice is the one thing that plan says not to do. So this
reads the model's own rasters for the region's box and writes the plainest thing Godot can open: a 16-bit heightfield,
the masks beside it, and the sites as records.

WHAT IT THEREFORE IS, AND IS NOT. It is the region's TRUE SHAPE AT MAP RESOLUTION -- 2 km a pixel, the model's own --
which is what is useful before a cut: you can fly the Catch's floor, the Godsgate, the Bowl and the Stalker Gate's
graben and see whether the country reads. It is NOT the 1:1 streamed region: no flora, no settlements drawn, no roads,
no collision mesh beyond the heightfield. When the region is cut, `godot/krator/world_stream.gd` and the usual export
replace this, and this file goes.

It writes, into godot/data/catch-bowl/:
  meta.json     the box, the origin, the metre scale, the height range, the sites, and every weather kind the host offers
  height.png    16-bit greyscale, the box's heights normalised over [lo, hi] from meta.json
  water.png     8-bit: 255 where the model says water
  temp.png      8-bit: (degC + 90) as the model stores it, so the host can read the air at a point
  rain.png      8-bit: the model's own rain byte (x 4000/255 = mm a year)
Nothing here is generated or guessed: every byte is the model's, resampled only by the step.
"""
import os, sys, json
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(REPO, 'tools', 'scale-model')]
import smodel.page as P   # noqa: E402

OUT = os.path.join(REPO, 'godot', 'data', 'catch-bowl')
REGION = 'catch-bowl'
KM_PER_PX = 2.0
M_PER_PX = KM_PER_PX * 1000.0

# The six polygons of PLAN.md section 2, BY NAME AS WELL AS BY ID, because `smodel.geom.region_mask` looks a polygon up
# by its NAME and not its id -- which cost me a run: handed the six ids out of SITES.json it reported "no region named
# 'rmw4xy4tp9b29'" for four of them and silently matched nothing for the other two. The ids are kept beside the names so
# a reader can check both against the model, and so the pair survives a model that reissues ids.
POLYGONS = [('rmvka7icdn1dq', 'the catch'), ('rmvka5413efyi', 'the bowl'), ('rmw4xy4tp9b29', 'SE outer wall'),
            ('rmvkknh1am4fw', 'stalker range'), ('rmvstalkergate', 'Stalker Gate'), ('rmw536m06wlyf', 'twins')]
ORIGIN_PX = [1233, 1306]

# the weather the host offers, each one a thing this region's own plans describe. The Godot side (krator/atmos_fx.gd)
# reads this list, so the panel and the plans cannot drift apart.
WEATHER = [
    dict(id='clear', name='Clear', note='the default: the Catch at 1.83 atm and +47 degC in high summer'),
    dict(id='dust', name='Black storm', note="the Catch's spring karaburan: ATMOS.airLoad, ochre-brown, the walls gone "
                                             "first (biomes/catch/KNOWN_ISSUES.md; core/atmos/fx/89-atmos-fx-airload.js)"),
    dict(id='gale', name='The God-Bore', note='the SE outer wall\'s nocturnal katabatic, 80-130 km/h down the Godsgate '
                                              '(biomes/seouterwall/PLAN.md 2.x; ATMOS.gale)'),
    dict(id='whiteout', name='Rime whiteout', note="the Godsgate's barometric whiteout and freezing rime fog, the pass's "
                                                   'winter window [300, 60]'),
    dict(id='duststorm_season', name='Dust season', note='ATMOS.dustSeason: the floor hazy for weeks, not hours'),
    dict(id='deadheat', name='Dead heat', note="the Bowl's high summer, too hot to work at all "
                                               '(BOWL_TUNE.calendar.windows.deadheat)'),
    dict(id='monsoon', name="Mantis's monsoon", note='1,553 mm on a hot-desert shore: the one wet place in the region '
                                                     '(BOWL_TUNE.calendar.windows.monsoon)'),
]


def main():
    step = 1
    for i, a in enumerate(sys.argv):
        if a == '--step' and i + 1 < len(sys.argv):
            step = max(1, int(sys.argv[i + 1]))
    D = P.load()
    E, _ = P.heights(D)
    whas, _ = P.water_levels(D)
    H, W = E.shape
    from smodel.geom import region_mask
    regs = P.regions()
    grid = P.grid(D)
    mask = np.zeros((H, W), bool)
    got = []
    for rid, name in POLYGONS:
        try:
            m = region_mask(regs, name, *grid, (H, W))
            if not m.any():
                raise ValueError('the polygon resolved to no cells')
            mask |= m
            got.append('%s (%s): %d cells' % (name, rid, int(m.sum())))
        except Exception as ex:
            sys.exit('polygon %r (%s): %s -- region_mask takes the NAME; check it against the model' % (name, rid, ex))
    for g in got:
        print('  ' + g)
    ys, xs = np.nonzero(mask)
    if not len(ys):
        sys.exit('no polygon of the region resolved: nothing to export')
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
    box = (x0, y0, x1, y1)
    sub = E[y0:y1:step, x0:x1:step]
    wsub = whas[y0:y1:step, x0:x1:step]
    msub = mask[y0:y1:step, x0:x1:step]
    lo, hi = float(np.nanmin(sub)), float(np.nanmax(sub))
    os.makedirs(OUT, exist_ok=True)
    h16 = np.clip((sub - lo) / max(1.0, hi - lo) * 65535.0, 0, 65535).astype(np.uint16)
    # Pillow will not take a uint16 array for 'I;16' directly; frombytes does, and keeps the bytes little-endian,
    # which is what Godot's Image.load_png gives back as FORMAT_RGB8's red channel pair.
    Image.frombytes('I;16', (h16.shape[1], h16.shape[0]), h16.astype('<u2').tobytes()).save(os.path.join(OUT, 'height.png'))
    Image.fromarray((wsub * 255).astype(np.uint8), mode='L').save(os.path.join(OUT, 'water.png'))
    Image.fromarray((msub * 255).astype(np.uint8), mode='L').save(os.path.join(OUT, 'inside.png'))
    # the model stores every raster as a base64 PNG in the page, not as an array, so each one is decoded here
    import base64, io as _io
    for key, name in (('tm', 'temp.png'), ('p', 'rain.png')):
        raw = D.get(key)
        if not isinstance(raw, str):
            print('  (no %s raster on the page: %s not written)' % (key, name))
            continue
        im = Image.open(_io.BytesIO(base64.b64decode(raw)))
        a = np.asarray(im.convert('L'))
        Image.fromarray(a[y0:y1:step, x0:x1:step].astype(np.uint8), mode='L').save(os.path.join(OUT, name))
    # the sites, in metres from the region's origin pixel, so the host and the plans share one frame
    # The sites' PIXELS LIVE IN THE MODEL, not in SITES.json: a row there carries its region, its reach and its notes,
    # and only a `"model": false` row (a pin the model does not hold yet, like the two salt works) carries its own px.
    # Reading SITES.json alone gave two sites of sixteen.
    sites = []
    S = json.load(open(os.path.join(REPO, 'openworld', 'SITES.json'), encoding='utf-8'))
    pin = {}
    for d0 in P.settlements():
        pin[d0['id']] = d0
    for sid, row in S['sites'].items():
        if row.get('region') != REGION:
            continue
        m = pin.get(sid)
        px, py = (m['px'], m['py']) if m else (row.get('px'), row.get('py'))
        if px is None:
            print('  (site %s has no pixel in the model and none of its own: left out)' % sid)
            continue
        sites.append(dict(id=sid, name=(m or row).get('name', sid), type=row.get('type', ''), px=px, py=py,
                          from_model=bool(m),
                          x=(px - ORIGIN_PX[0]) * M_PER_PX, z=(py - ORIGIN_PX[1]) * M_PER_PX,
                          m=round(float(E[int(py), int(px)]), 1), reach_km=row.get('reach_km')))
    sites.sort(key=lambda s: s['id'])
    meta = dict(
        region=REGION, note='the scale model at %g km a pixel, NOT the 1:1 cut: see this file\'s own tool' % (KM_PER_PX * step),
        box_px=list(box), step=step, m_per_sample=M_PER_PX * step, origin_px=ORIGIN_PX,
        size=[int(sub.shape[1]), int(sub.shape[0])],
        km=[round(sub.shape[1] * KM_PER_PX * step), round(sub.shape[0] * KM_PER_PX * step)],
        height=dict(lo=round(lo, 1), hi=round(hi, 1)),
        inside_pct=round(100.0 * float(msub.mean()), 1),
        origin_offset_m=[(x0 - ORIGIN_PX[0]) * M_PER_PX, (y0 - ORIGIN_PX[1]) * M_PER_PX],
        polygons=[dict(id=i, name=n) for i, n in POLYGONS], sites=sites, weather=WEATHER,
        temp_offset_c=-90, rain_per_byte=4000.0 / 255.0)
    with open(os.path.join(OUT, 'meta.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(meta, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('godot/data/catch-bowl: %d x %d samples at %g km (%d x %d km), heights %.0f to %.0f m, %.1f %% inside the six polygons, %d sites, %d weather kinds'
          % (sub.shape[1], sub.shape[0], KM_PER_PX * step, meta['km'][0], meta['km'][1], lo, hi, meta['inside_pct'], len(sites), len(WEATHER)))


if __name__ == '__main__':
    main()
