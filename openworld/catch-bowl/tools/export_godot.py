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
  geology.png   8-bit: the LANDFORM FAMILY at each sample, as an index into meta.json's `landforms`. Rock does not
                weather into one shape: flat-lying sandstone gives mesas, buttes and arches; a hard ironstone cap over
                soft rock gives a pedestal; tuff gives hoodoos; limestone gives undercut towers; an evaporite pan
                gives fluted pillars; and shocked impact breccia gives jagged ridges of angular block. The Catch and
                the Bowl have all six in different places (kits/resources/data/geology-gemini.json over this box:
                stone 214, impactite 148, saltpeter 159, iron 110, with limestone, halite and tuff in pockets), so the
                family is decided here, from the geology, once, rather than guessed per rock in the host.
  wlevel.png    16-bit: the water SURFACE height over the same [lo, hi] as height.png, 0 where there is no water.
                Without it a host can only put water on the lake bed, which draws as wet ground rather than as a
                lake: the model keeps the level apart from the ground for exactly this reason.
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
# The landform families, in the order their indices run. 0 is nothing in particular: most ground is not a landform.
LANDFORMS = ['none', 'mesa', 'pedestal', 'hoodoo', 'karst', 'evaporite', 'breccia', 'tor']
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


def _gate_network(E, whas, box, step):
    """Compute the Stalker Gate graben routes (west, northeast, southeast — never south, which was withdrawn at 11,025 m,
    and NEVER any trail toward Hub 01!), plus the 10 kept wayhouses and 39 unmanned day-march bothies."""
    sys.path[:0] = [HERE]
    import gate_route as GR
    cost = GR.cost_grid(E, whas)
    routes_out = []
    for bname, bend, bnote in GR.BRANCHES:
        if bname == 'south':
            continue
        p = GR.route(cost, GR.HQ, bend)
        if not p:
            continue
        # subsample polyline every 2 steps to keep meta.json compact while hugging every graben bend
        pts = [[int(x), int(y)] for idx, (x, y) in enumerate(p) if idx % 2 == 0 or idx == len(p) - 1]
        km = sum(KM_PER_PX * (1.4142 if ax != bx and ay != by else 1.0) for (ax, ay), (bx, by) in zip(p[:-1], p[1:]))
        routes_out.append(dict(
            id='gate.' + bname,
            name='Stalker Gate ' + bname + ' trail (' + bnote + ')',
            kind='trail',
            cls='stalker_gate',
            underground=False,
            km=round(km, 1),
            px=pts
        ))
    kept_posts = [
        dict(id='gate.w1', name='Wayhouse 1 (west trunk)', branch='west', px=1402, py=1200, m=1903, people=8, kept=True),
        dict(id='gate.w2', name='Wayhouse 2 (west trunk)', branch='west', px=1389, py=1167, m=1903, people=8, kept=True),
        dict(id='gate.w3', name='Wayhouse 3 (west trunk)', branch='west', px=1372, py=1129, m=1829, people=8, kept=True),
        dict(id='gate.w4', name='Wayhouse 4 (west trunk)', branch='west', px=1344, py=1099, m=1831, people=8, kept=True),
        dict(id='gate.w5', name='Wayhouse 5 (west trunk)', branch='west', px=1303, py=1090, m=1790, people=8, kept=True),
        dict(id='gate.e1', name='The High Wayhouse (east trunk summit)', branch='east', px=1462, py=1231, m=2824, people=10, kept=True),
        dict(id='gate.ne1', name='NE Fork Wayhouse', branch='northeast', px=1504, py=1225, m=2376, people=8, kept=True),
        dict(id='gate.ne2', name='The Loom Wayhouse', branch='northeast', px=1509, py=1185, m=2297, people=8, kept=True),
        dict(id='gate.se1', name='SE Fork Wayhouse', branch='southeast', px=1505, py=1270, m=2162, people=8, kept=True),
        dict(id='gate.se2', name='The Slabfield Wayhouse', branch='southeast', px=1509, py=1313, m=2140, people=8, kept=True),
    ]
    # Place the 39 unmanned day-march bothies evenly along the three branches (17 west, 5+7=12 NE, 10 SE = 39 total)
    bothy_counts = {'gate.west': 17, 'gate.northeast': 12, 'gate.southeast': 10}
    bothies = []
    for r in routes_out:
        nb = bothy_counts.get(r['id'], 0)
        pts = r['px']
        for k in range(1, nb + 1):
            idx = min(len(pts) - 1, max(0, int(round(k * (len(pts) - 1) / (nb + 1)))))
            bx, by = pts[idx]
            bothies.append(dict(id='%s.bothy.%d' % (r['id'], k), branch=r['id'].split('.')[1], px=bx, py=by,
                                m=round(float(E[int(by), int(bx)]), 1), kept=False))
    return routes_out, kept_posts, bothies


def _network_and_sim(E, whas, box, step):
    x0, y0, x1, y1 = box
    in_box = lambda px, py: (x0 <= px < x1) and (y0 <= py < y1)
    routes = []

    # 1. Recorded scale-model routes from net51-gemini.json inside the Catch-Bowl box
    #    RULING (PLAN.md 2b & 12): NEVER export any route to or from Hub 01 ("Hub 01 to Stair" is excluded!)
    net_path = os.path.join(REPO, 'openworld', 'net51-gemini.json')
    if os.path.isfile(net_path):
        NJ = json.load(open(net_path, encoding='utf-8'))
        raw_routes = NJ.get('routes', {})
        items = raw_routes.items() if isinstance(raw_routes, dict) else [(str(i), r) for i, r in enumerate(raw_routes)]
        for rid, r in items:
            rname = str(r.get('name', rid))
            if 'hub 01' in rname.lower() or 'sodpa02bfv' in rname.lower():
                continue
            pts = r.get('px', [])
            clipped = [[round(float(p[0]), 1), round(float(p[1]), 1)] for p in pts if in_box(p[0], p[1])]
            if len(clipped) < 2:
                continue
            rcls = str(r.get('class') or r.get('kind') or 'trunk')
            under = (rcls in ('line', 'possible')) or ('bore' in rname.lower())
            routes.append(dict(
                id='net.' + str(rid),
                name=rname,
                kind='bore' if under else 'road',
                cls=rcls,
                underground=under,
                px=clipped
            ))

    # 2. Stalker Gate waystation network (Dijkstra graben trails + 10 kept wayhouses + 39 bothies)
    gate_routes, kept_posts, bothies = _gate_network(E, whas, box, step)
    routes.extend(gate_routes)

    # 3. Twins crossing routes (Route B Steaming-Stone Dash surface trail + Route A Dark-Tube underground tubes + Catch descents)
    twins_routes = [
        dict(id='twins.route_b', name='Route B: The Steaming-Stone Dash (Brotherhood trail)', kind='trail', cls='twins_trail',
             underground=False, px=[[996, 1504], [1005, 1489], [1016, 1479], [1031, 1473], [1056, 1462], [1083, 1474], [1106, 1442]]),
        dict(id='twins.route_a', name='Route A: The Dark-Tube Road (lava tubes A1-A4 & 3 open sprints)', kind='tube', cls='twins_tube',
             underground=True, px=[[938, 1496], [952, 1489], [966, 1479], [978, 1468], [982, 1466], [994, 1467], [1002, 1469],
                                   [1006, 1468], [1014, 1464], [1020, 1461], [1024, 1459], [1038, 1452]]),
        dict(id='twins.arch_descent', name='Route A North Arch descent to Bitta & Stair', kind='trail', cls='twins_trail',
             underground=False, px=[[1038, 1452], [1088, 1455], [1106, 1442]]),
        dict(id='twins.hermitage_path', name='Monks\' turn-off to the White Gills Hermitage', kind='path', cls='twins_path',
             underground=False, px=[[1038, 1452], [1015, 1430]]),
        # Catch & Bowl active caravan tracks connecting the oases, Godsgate and salt pans
        dict(id='catch.godsgate_stair', name='The Godsgate crossing (Parabola -> Bab al-Hawa -> Kolli -> Arfwai -> Stair)',
             kind='trail', cls='caravan', underground=False,
             px=[[970, 1186], [1027, 1258], [1058, 1367], [1090, 1387], [1106, 1442]]),
        dict(id='catch.salt_road', name='Train of Jabal salt road (Jabal -> Solta -> Mantis -> Parabola & Salt al-Ban -> Stair)',
             kind='trail', cls='caravan', underground=False,
             px=[[1225, 1149], [1169, 1150], [1113, 1164], [1080, 1428], [1090, 1387], [1106, 1442]]),
    ]
    for tr in twins_routes:
        tr['px'] = [p for p in tr['px'] if in_box(p[0], p[1])]
        if len(tr['px']) >= 2:
            routes.append(tr)

    # 4. Named setpiece stops: Twins oases, Bab al-Hawa, SE outer wall highland tarns, and the Rangers' Last Cairn
    setpieces = [
        dict(id='twins.sinter', name='Sinter-Gate (Bab al-Bukhar toll house)', kind='waystation', faction='horns', px=996, py=1504),
        dict(id='twins.kettle', name='Mud-Kettle Hollow (maar mud pots)', kind='waystation', faction='horns', px=1005, py=1489),
        dict(id='twins.brazier', name='The Brazier (Shrine of the Split Horn)', kind='waystation', faction='horns', px=1016, py=1479),
        dict(id='twins.tarn', name='Brimstone-Tarn (sulfur diggings)', kind='waystation', faction='horns', px=1031, py=1473),
        dict(id='twins.lookout', name='Catch-Lookout Spring (eye-wash basins)', kind='waystation', faction='horns', px=1056, py=1462),
        dict(id='twins.hall', name='Hall of the Tally-Marks (tube A3 cistern)', kind='tube_hall', faction='horns', px=1014, py=1464, underground=True),
        dict(id='twins.arch', name='18 m Basalt Arch (Route A north mouth)', kind='setpiece', faction='horns', px=1038, py=1452),
        dict(id='godsgate.babalhawa', name='Bab al-Hawa (Vent-Shaft Caravanserai)', kind='caravanserai', faction='stair', px=1027, py=1258),
        dict(id='rangers.last_cairn', name='The Rangers\' Last Cairn (no trail beyond)', kind='cairn', faction='yunicrown', px=1378, py=1322),
        dict(id='tarn.1', name='West Godsgate Cirque Tarn', kind='tarn', faction=None, px=1016, py=1236),
        dict(id='tarn.2', name='East Godsgate Cirque Tarn', kind='tarn', faction=None, px=1064, py=1272),
        dict(id='tarn.3', name='Mid-Wall Tarn', kind='tarn', faction=None, px=1134, py=1218),
        dict(id='tarn.4', name='High Bench Tarn', kind='tarn', faction=None, px=1208, py=1254),
        dict(id='tarn.5', name='Bowl-Rim Tarn', kind='tarn', faction=None, px=1288, py=1184),
    ]
    all_stops = []
    for sp in kept_posts + setpieces:
        if not in_box(sp['px'], sp['py']):
            continue
        row = dict(sp)
        row['x'] = (row['px'] - ORIGIN_PX[0]) * M_PER_PX
        row['z'] = (row['py'] - ORIGIN_PX[1]) * M_PER_PX
        if 'm' not in row:
            row['m'] = round(float(E[int(row['py']), int(row['px'])]), 1)
        all_stops.append(row)

    # 5. Live caravan rounds (`CATCH_TUNE` + `BOWL_TUNE` + `STALKER_TUNE` patrols) for moving markers in catch_bowl.gd
    caravans = [
        dict(id='caravan.getmastarz', name='House Getmastarz (Godsgate -> Stair -> Twins)', faction='getmastarz',
             color='#d9822b', speed_km_day=30.0, trains=3, guard=6, kit=[],
             px=[[1016, 1058], [970, 1186], [1027, 1258], [1058, 1367], [1090, 1387], [1106, 1442], [1083, 1474], [1056, 1462], [1016, 1479], [996, 1504]]),
        dict(id='caravan.goldanda', name='House Goldanda (Mantis -> Godsgate -> Stair)', faction='goldanda',
             color='#e6b830', speed_km_day=30.0, trains=2, guard=7, kit=[],
             px=[[1113, 1164], [970, 1186], [1027, 1258], [1058, 1367], [1106, 1442], [1088, 1455], [1038, 1452]]),
        dict(id='caravan.train_jabal', name='The Train of Jabal (Jabal -> Solta -> Salt al-Ban -> Stair)', faction='train',
             color='#e8dcc4', speed_km_day=28.0, trains=4, guard=6, kit=[],
             px=[[1225, 1149], [1169, 1150], [1113, 1164], [1080, 1428], [1090, 1387], [1106, 1442]]),
        dict(id='caravan.geomancers', name='Geomancer Drilling Train (armed with explosives)', faction='geomancer',
             color='#48b8d0', speed_km_day=28.0, trains=2, guard=6, kit=['explosives'],
             px=[[1263, 1089], [1113, 1164], [1106, 1442], [1083, 1474], [1056, 1462]]),
        dict(id='caravan.rangers.west', name='Ranger HQ West Supply Convoy', faction='yunicrown',
             color='#5ec476', speed_km_day=24.0, trains=3, guard=9, kit=['arms', 'explosives'],
             px=next((r['px'] for r in gate_routes if r['id'] == 'gate.west'), [[1420, 1242], [1263, 1089]])),
        dict(id='caravan.rangers.ne', name='Ranger HQ North-East Patrol', faction='yunicrown',
             color='#5ec476', speed_km_day=24.0, trains=2, guard=8, kit=['arms'],
             px=next((r['px'] for r in gate_routes if r['id'] == 'gate.northeast'), [[1420, 1242], [1520, 1140]])),
        dict(id='caravan.rangers.se', name='Ranger HQ South-East Patrol', faction='yunicrown',
             color='#5ec476', speed_km_day=24.0, trains=2, guard=8, kit=['arms'],
             px=next((r['px'] for r in gate_routes if r['id'] == 'gate.southeast'), [[1420, 1242], [1530, 1350]])),
    ]

    # 6. Outlaw brotherhood camps (`BF-05`, `BF-06`, `BF-07` — visible on outlaw/bounty map) vs silent Stalker hunting grounds
    #    (kept strictly separate and NEVER given visible pins/labels or tied to Hub 01's id in UI!)
    outlaws = [
        dict(id='BF-05', name='The Salt-Thirsters (Dust-Cloaks)', boss='Dry-Tongue', zone='the bowl',
             hq_px=[1138, 1158], subs_px=[[1152, 1152], [1095, 1168]], wants=['water', 'grain', 'salt'], bounty_talents=650),
        dict(id='BF-06', name='The Glass-Eaters (Naphtha-Breathers)', boss='The Cracked Retort', zone='Stalker Gate',
             hq_px=[1385, 1110], subs_px=[[1330, 1095], [1295, 1125]], wants=['oil', 'sulfur', 'water', 'grain'], bounty_talents=900),
        dict(id='BF-07', name='The Tin-Skulls (Stalker-Mimics)', boss='Unit Zero-Nine', zone='the catch',
             hq_px=[1112, 1434], subs_px=[[1034, 1266], [1076, 1466]], wants=['alloy', 'cells', 'tools', 'water'], bounty_talents=850),
    ]
    # Stalker hunting envelopes (used ONLY by hazard/encounter evaluation, never drawn as map pins or named as Hub 01's!)
    stalker_envelopes = [
        dict(id='stalker.catch_floor', center_px=[1072, 1408], radius_km=95.0, kind='hunter'),
        dict(id='stalker.east_wall', center_px=[1185, 1310], radius_km=110.0, kind='hunter'),
        dict(id='stalker.range', center_px=[1360, 1320], radius_km=140.0, kind='hunter'),
    ]
    hazard_rules = dict(
        thin_air_start_atm=0.60,
        thin_air_lethal_atm=0.18,
        death_zone_m=8000.0,
        hot_start_c=38.0,
        hot_worst_c=52.0,
        cold_start_c=0.0,
        cold_worst_c=-30.0,
        black_storm_days=[70, 112],
        whiteout_days=[300, 60],
        deadheat_days=[20, 70],
    )
    ranger_bounties = dict(
        issuer='sz85a8i5js',
        polity='yunicrown',
        exchange_warrants=[
            dict(id='bounty.rangers.stalker.gun', target='st_harpooner', trophy_good='stalker_guns',
                 exchange_talents=420, standing=True,
                 use='mounted as gate guns at important places throughout the Yuni lands'),
            dict(id='bounty.rangers.stalker.blade', target='st_blade', trophy_good='stalker_blades',
                 exchange_talents=280, standing=True,
                 use='used by the White-Blade Watch elite Ranger unit at Ranger HQ'),
        ],
        elite_unit=dict(id='rangers.blade_watch', name='The White-Blade Watch (Elite Ranger Unit)',
                        settlement='sz85a8i5js', weapon='stalker_blades', blades_per_trooper=2, max_troopers=60),
        gate_gun_sites=[
            'sz85a8i5js.lake_gate', 'yuni.caravan_gate', 'yuni.north_gate', 'yuni.grand_vault',
            'yuni.shepherds_gate', 'yuni.river_gate', 'yuni.potters_gate', 'locus.causeway_gate', 'verge.lower_gate'
        ],
    )
    return routes, all_stops, bothies, caravans, outlaws, stalker_envelopes, hazard_rules, ranger_bounties


def main():
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
    # the water surface on height.png's own scale, so a host reads it with the same lo/hi and no second range
    wl = np.asarray(wlev, dtype=float)[y0:y1:step, x0:x1:step]
    wl16 = np.where(wsub, np.clip((wl - lo) / max(1.0, hi - lo) * 65535.0, 1, 65535), 0).astype(np.uint16)
    Image.frombytes('I;16', (wl16.shape[1], wl16.shape[0]), wl16.astype('<u2').tobytes()).save(os.path.join(OUT, 'wlevel.png'))
    # --- the landform family per sample, from the geology
    import base64 as _b64
    GJ = json.load(open(os.path.join(REPO, 'kits', 'resources', 'data', 'geology-gemini.json'), encoding='utf-8'))
    gw, gh, gcell = int(GJ['grid']['w']), int(GJ['grid']['h']), float(GJ['grid']['cell_km'])

    def glayer(name):
        raw = GJ['layers'].get(name)
        if raw is None:
            return np.zeros((gh, gw), dtype=np.uint8)
        b = np.frombuffer(_b64.b64decode(raw), dtype=np.uint8)
        return np.repeat(b[1::2], b[0::2].astype(np.int32) + 1).reshape(gh, gw)

    def at(name):
        # the layer on the box own samples; nearest, since the geology grid is 4 km and the box 2 km
        a = glayer(name)
        ys = np.clip((np.arange(y0, y1, step) * KM_PER_PX / gcell).astype(int), 0, gh - 1)
        xs = np.clip((np.arange(x0, x1, step) * KM_PER_PX / gcell).astype(int), 0, gw - 1)
        return a[np.ix_(ys, xs)].astype(float)

    stone, impact, iron = at('stone'), at('impactite'), at('iron')
    tuff, lime, halite, saltp = at('tuff'), at('limestone'), at('halite'), at('saltpeter')
    gy_, gx_ = np.gradient(sub, 2000.0)
    gslope = np.hypot(gx_, gy_)
    fam = np.zeros(sub.shape, dtype=np.uint8)
    # the order matters: the rarer and more particular a family is, the earlier it claims its ground
    fam[(stone >= 120) & (gslope < 0.14)] = LANDFORMS.index('mesa')
    fam[(iron >= 140) & (stone >= 90) & (gslope < 0.10)] = LANDFORMS.index('pedestal')
    fam[(impact >= 170) & (gslope < 0.30)] = LANDFORMS.index('breccia')
    fam[tuff >= 60] = LANDFORMS.index('hoodoo')
    fam[lime >= 90] = LANDFORMS.index('karst')
    fam[((halite >= 60) | (saltp >= 190)) & (gslope < 0.05)] = LANDFORMS.index('evaporite')
    fam[gslope >= 0.30] = LANDFORMS.index('tor')   # steep ground sheds blocks whatever it is made of
    fam[wsub] = 0
    Image.fromarray(fam, mode='L').save(os.path.join(OUT, 'geology.png'))
    famcount = {LANDFORMS[i]: int((fam == i).sum()) for i in range(len(LANDFORMS))}

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
        # Hub 01 (`sodpa02bfv`): keep in `sites` for the 16-site count, marked `ancient_ruin: true` & `no_pin_label: true`
        # so the host draws a silent dark monolith silhouette rather than a bright settlement beacon or road!
        is_hub = (sid == 'sodpa02bfv')
        sites.append(dict(id=sid, name='Unmarked Ancient Ruin' if is_hub else (m or row).get('name', sid),
                          type='ruin' if is_hub else row.get('type', ''), px=px, py=py,
                          from_model=bool(m),
                          ancient_ruin=is_hub,
                          x=(px - ORIGIN_PX[0]) * M_PER_PX, z=(py - ORIGIN_PX[1]) * M_PER_PX,
                          m=round(float(E[int(py), int(px)]), 1), reach_km=row.get('reach_km')))
    sites.sort(key=lambda s: s['id'])
    routes, stops, bothies, caravans, outlaws, stalker_env, hazard_rules, ranger_bounties = _network_and_sim(E, whas, box, step)
    meta = dict(
        region=REGION, note='the scale model at %g km a pixel, NOT the 1:1 cut: see this file\'s own tool' % (KM_PER_PX * step),
        box_px=list(box), step=step, m_per_sample=M_PER_PX * step, origin_px=ORIGIN_PX,
        size=[int(sub.shape[1]), int(sub.shape[0])],
        km=[round(sub.shape[1] * KM_PER_PX * step), round(sub.shape[0] * KM_PER_PX * step)],
        height=dict(lo=round(lo, 1), hi=round(hi, 1)),
        landforms=LANDFORMS,
        landform_counts=famcount,
        inside_pct=round(100.0 * float(msub.mean()), 1),
        origin_offset_m=[(x0 - ORIGIN_PX[0]) * M_PER_PX, (y0 - ORIGIN_PX[1]) * M_PER_PX],
        polygons=[dict(id=i, name=n) for i, n in POLYGONS], sites=sites, weather=WEATHER,
        routes=routes, stops=stops, bothies=bothies, caravans=caravans, outlaws=outlaws,
        stalker_envelopes=stalker_env, hazard_rules=hazard_rules, ranger_bounties=ranger_bounties,
        temp_offset_c=-90, rain_per_byte=4000.0 / 255.0)
    with open(os.path.join(OUT, 'meta.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(meta, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('  landforms: ' + ', '.join('%s %d' % (k, v) for k, v in famcount.items() if v))
    print('  network: %d routes (%d surface, %d underground), %d stops/setpieces, %d bothies, %d caravan rounds, %d outlaw brotherhoods'
          % (len(routes), sum(1 for r in routes if not r.get('underground')), sum(1 for r in routes if r.get('underground')),
             len(stops), len(bothies), len(caravans), len(outlaws)))
    print('godot/data/catch-bowl: %d x %d samples at %g km (%d x %d km), heights %.0f to %.0f m, %.1f %% inside the six polygons, %d sites, %d weather kinds'
          % (sub.shape[1], sub.shape[0], KM_PER_PX * step, meta['km'][0], meta['km'][1], lo, hi, meta['inside_pct'], len(sites), len(WEATHER)))


if __name__ == '__main__':
    main()
