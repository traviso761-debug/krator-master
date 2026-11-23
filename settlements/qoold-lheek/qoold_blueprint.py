#!/usr/bin/env python3
"""Qoold Lheek ('the cold lake'), capital of Khaay Qantir (the Yeti Kingdom): site & architectural blueprint.

Site: scale-model 5.1 pin `s427qb1kma` (px 410, py 506), anchored 3.5 km SE down the Musiq Quli coulee at px 411.4, py 508.1
where the creek's coarse impactite-gravel fan and lateral-moraine terraces step down to Cold Lake (5,680.41 m, 448 km2,
159 m deep). Every zone, snow fence, leat, road, building footprint and KCITY.covered winter tunnel comes from the plain-data
layout (`src/30-ql-layout.js`) and rules (`src/31-ql-rules.js`) via `node layout_dump.js`: change a footprint there, never here.

Sheets and `FURNITURE.md` are rendered through `settlements/voth/palace/blueprint.py` (imported in place, never copied):
  - floors/Q0.png       The Cold Lake coulee-fan site (1,480 x 1,300 m)
  - floors/Q1.png       The Covered Town & Six Kilen Clan Wards + full KCITY.covered tunnel network (420 x 465 m)
  - floors/Q2.png       The State Heart: Quunsul Crown, Khaay Chiip Compound & Shared-Wall Hearth Triad (136 x 112 m)
  - floors/Q3.png       The Lakefront Ice Quarries, Aufeis Pan & Pycrete Works (220 x 254 m)
  - floors/section.png  WNW-ESE terrain section, SW-NE solar-aspect coulee section & 1:50 permafrost/katak cut

Frame (cardinal, southern hemisphere 27.8 deg S):
  u -> EAST (+x, right on every sheet)
  v -> TRUE NORTH (-z, UP on every sheet = THE MIDDAY SUN at 0 deg bearing!)
  y -> metres above Cold Lake's 5,680.41 m surface (Crown terrace at y = +22.0 m)

    python3 settlements/qoold-lheek/qoold_blueprint.py
"""
import json, math, os, subprocess, sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'voth', 'palace'))
import blueprint as B
from blueprint import R, box, C

OUT = os.path.join(HERE, 'floors')
DUMP = json.loads(subprocess.run(
    ['node', os.path.join(HERE, 'layout_dump.js')],
    capture_output=True, text=True, check=True, encoding='utf-8'
).stdout)
L = DUMP['layout']
NET = DUMP['net']
AREA = DUMP['area']
BAD = [c for c in DUMP['checks'] if not c['pass']]
if BAD:
    sys.exit('Qoold Lheek layout fails its rules (node settlements/qoold-lheek/tests/test-qoold-lheek.js):\n  '
             + '\n  '.join(c['name'] + ': ' + c['detail'] for c in BAD))

PARTS = {p['id']: p for p in L['parts']}
AXIS = ('u -> EAST (Cold Lake to the right/SE); v -> TRUE NORTH, UP THE SHEET (= THE MIDDAY SUN at 27.8 deg S; '
        'prevailing 300 deg WNW katabatic wind from upper-left)')


def from_part(p, kind=None, name=None, note=None, n=None, decor=None):
    b = p['box']
    r = R(
        p['n'] if n is None else n,
        name or p['name'],
        kind or p['kind'],
        b[0], b[1], b[2], b[3],
        p['decor'] if decor is None else decor,
        p['note'] if note is None else note,
    )
    if p.get('circ'):
        r['circ'] = True
    return r


def rot_poly(pts, idx):
    pts = [tuple(p) for p in pts]
    return pts[idx:] + pts[:idx]


def box_poly(b):
    return [(b[0], b[2]), (b[1], b[2]), (b[1], b[3]), (b[0], b[3])]


def oct_poly(cx, cz, r):
    return [(cx + r * math.cos(math.pi * k / 4), cz + r * math.sin(math.pi * k / 4)) for k in range(8)]


def clip_ray(u0, v0, bearing_deg, max_len, rect):
    rad = math.radians(bearing_deg)
    du, dv = math.sin(rad), math.cos(rad)
    t = max_len
    if du > 1e-6:
        t = min(t, (rect[1] - 115 - u0) / du)
    elif du < -1e-6:
        t = min(t, (rect[0] + 25 - u0) / du)
    if dv > 1e-6:
        t = min(t, (rect[3] - 25 - v0) / dv)
    elif dv < -1e-6:
        t = min(t, (rect[2] + 28 - v0) / dv)
    t = max(40.0, t)
    return [(u0, v0), (u0 + du * t, v0 + dv * t)]


ZONE_COL = {
    'lake':      (188, 220, 244),
    'coulee':    (198, 214, 222),
    'apron':     (228, 220, 202),
    'northbank': (204, 218, 206),
    'tombridge': (226, 216, 204),
    'watchbrow': (222, 212, 198),
    'sunbench':  (226, 236, 198),
    'town':      (242, 236, 222),
    'state':     (246, 232, 196),
    'pasture':   (218, 228, 204),
}

FLOORS = []

def rect_loop(u0, u1, v0, v1, label_at='tl'):
    # Closed rectangle polyline for F['lines'] (drawn above fills); last point controls where blueprint.py puts label
    if label_at == 'bl':
        return [(u0, v1), (u1, v1), (u1, v0), (u0, v0), (u0, v1)]
    return [(u0, v0), (u1, v0), (u1, v1), (u0, v1), (u0, v0)]  # ends at (u0, v0); 'tl' below ends at (u0, v1)


def rect_tl(u0, u1, v0, v1):
    return [(u0, v1), (u1, v1), (u1, v0), (u0, v0), (u0, v1)]


# ================================================================================================ Q0: THE COLD LAKE SITE
Q0_RECT = (-740, 740, -620, 680)
Q0_FILLS = [
    (rot_poly(L['zones']['lake']['poly'], 2), ZONE_COL['lake'], 'Cold Lake (Qoold Lheek, 5,680.4 m, 1.4 m ice)'),
    (rot_poly(L['zones']['coulee']['poly'], 0), ZONE_COL['coulee'], 'Musiq Quli coulee & winter aufeis channel'),
    (rot_poly(L['zones']['watchbrow']['poly'], 3), ZONE_COL['watchbrow'], 'West Watch Brow (+45..+62 m windbreak)'),
    (rot_poly(L['zones']['sunbench']['poly'], 4), ZONE_COL['sunbench'], 'Sun-Bench (NNE-tilted Three-Gifts terraces)'),
    (rot_poly(L['zones']['northbank']['poly'], 6), ZONE_COL['northbank'], 'Shaded SSW bank (furlarch & -10 C permafrost)'),
    (rot_poly(L['zones']['tombridge']['poly'], 4), ZONE_COL['tombridge'], "Ancestors' Ridge (dry bedrock tombs, +48..+62 m)"),
    (rot_poly(L['zones']['pasture']['poly'], 5), ZONE_COL['pasture'], 'SW silt meadow, labaz caches & Leng muster'),
    (rot_poly(L['zones']['apron']['poly'], 2), ZONE_COL['apron']),
    (rot_poly(L['zones']['town']['poly'], 5), ZONE_COL['town']),
    (rot_poly(L['zones']['state']['poly'], 3), ZONE_COL['state']),
]
for f in L['snowFences']:
    lab = ('26 m leeward drift quarry' if f['id'] == 'fence.1' else None)
    tup = (rot_poly(box_poly(f['driftBox']), 3), (224, 240, 252)) + ((lab,) if lab else ())
    Q0_FILLS.append(tup)

Q0_LINES = [
    (rect_tl(-215, 205, -255, 210), (95, 95, 95), 2, 'Sheet Q1: Covered Town & Six Clan Wards'),
    (rect_tl(-72, 64, -52, 60), (95, 95, 95), 2, 'Sheet Q2: State Heart'),
    (rect_tl(70, 290, -162, 92), (95, 95, 95), 2, 'Sheet Q3: Ice & Pycrete Works'),
]
for i, f in enumerate(L['snowFences']):
    pts = [tuple(f['a']), tuple(f['b'])]
    Q0_LINES.append((pts, (45, 55, 75), 5) + (('3.2 m WNW snow fences',) if i == 3 else ()))

LEAT_STYLE = {
    'leat.sun':      ((25, 110, 195), 4, 'Sun-Bench gravity leat (+38 m)'),
    'leat.tail':     ((45, 145, 155), 3, 'tailwater return'),
    'chute.sawdust': ((185, 110, 25), 4, 'furlarch sawdust chute'),
}
for lt in L['leats']:
    col, w, lab = LEAT_STYLE[lt['id']]
    pts = [tuple(p) for p in lt['pts']]
    if lt['id'] == 'leat.sun':
        pts = pts[::-1]
    Q0_LINES.append((pts, col, w, lab))

WAY_STYLE = {
    'road.leng':  ((135, 90, 48), 4, 'Leng & Jimjam sled/dirt road (186 km SE)', True),
    'iceway.sw':  ((45, 95, 175), 3, 'SW lake-ice highway (7-8 mo/yr)', False),
    'iceway.ne':  ((45, 95, 175), 3, 'NE lake-ice highway (to Isnoo Quli)', False),
    'way.tombs':  ((120, 80, 130), 3, "Ancestors' processional way", False),
    'way.apron':  ((135, 90, 48), 3, None, False),
    'way.watch':  ((135, 90, 48), 3, 'West Watch trail', False),
}
for wy in L['ways']:
    col, w, lab, rev = WAY_STYLE[wy['id']]
    pts = [tuple(p) for p in (wy['pts'][::-1] if rev else wy['pts'])]
    if wy['id'] == 'iceway.ne':
        pts = [(254, -15), (420, 150), (470, 200)]  # keep label cleanly inside Cold Lake left of border
    Q0_LINES.append((pts, col, w) + ((lab,) if lab else ()))

SIGHT_LEN = {'sight.leng': 310.0, 'sight.outlet': 145.0, 'sight.sewall': 330.0, 'sight.coulee': 220.0}
for s in L['sights']:
    src = PARTS[s['from']]['box']
    cu, cv = (src[0] + src[1]) / 2.0, (src[2] + src[3]) / 2.0
    ray = clip_ray(cu, cv, s['bearing'], SIGHT_LEN[s['id']], Q0_RECT)
    lab = '%s (%d deg, %d km, +%d m)' % (s['name'].split(' (')[0], s['bearing'], s['km'], s['clear'])
    Q0_LINES.append((ray, (195, 140, 18), 2, lab))

Q0_LINES.append(([(-40, 560), (-40, 645)], (190, 95, 10), 4, 'TRUE NORTH (0 deg) = MIDDAY SUN (27.8S)'))
Q0_LINES.append(([(-705, 585), (-585, 516)], (55, 85, 135), 4, '300 deg WNW katabatic wind'))

Q0_ROOMS = []
for p in L['parts']:
    if 'Q0' not in p['sheets']:
        continue
    if 'Q3' in p['sheets']:
        Q0_ROOMS.append(from_part(p, kind='see', note='detailed on Sheet Q3 (Ice & Pycrete Works)'))
    elif 'Q1' in p['sheets']:
        Q0_ROOMS.append(from_part(p, kind='see', note='detailed on Sheet Q1 (Covered Town & Northbank)'))
    else:
        Q0_ROOMS.append(from_part(p))

FLOORS.append(dict(
    R=999, rect=Q0_RECT, id='Q0', tier=0,
    title='Sheet Q0: Qoold Lheek on the Cold Lake coulee fan (1,480 x 1,300 m)',
    sub=('Scale-model 5.1 pin s427qb1kma (px 410, 506), anchored 3.5 km SE down Musiq Quli (r466) at px 411.4, 508.1 '
         'where the coulee fan meets Cold Lake (5,680.41 m, 448 km2, 159 m deep; -4.2 C mean, 94 mm, ~0.79 atm, impact '
         'province with high-grade gold/tin placers & saltpeter). At 27.8 deg S the sun stands in the NORTH (up the sheet): '
         'the NNE-tilted right bank carries irrigated snow-potato boulder pockets, sweetroot leats and the thaw-stable gravel '
         'town benches; the shaded SSW left bank holds coppiced furlarch and -10 C permafrost cellars; WNW snow fences trap '
         'clean drift snow while SE leeward tanneries vent out over the frozen lake.'),
    axisnote=AXIS,
    fills=Q0_FILLS,
    lines=Q0_LINES,
    rooms=Q0_ROOMS,
))

# ================================================================================================ Q1: THE COVERED TOWN
Q1_RECT = (-215, 205, -255, 210)
Q1_FILLS = [
    ([(-213, 198), (-198, 198), (-198, -95), (-213, -95)], ZONE_COL['sunbench']),
    (rot_poly(L['zones']['town']['poly'], 5), ZONE_COL['town'], 'Six Kilen Clan Wards (moraine gravel, +12..+24 m)'),
    (rot_poly(L['zones']['state']['poly'], 3), ZONE_COL['state']),
    ([(90, -195), (203, -144), (203, 15), (134, 20), (90, -8)], ZONE_COL['apron']),
    ([(-200, 205), (15, 96), (136, 22), (203, 2), (203, 72), (176, 98), (48, 170), (-95, 208)], ZONE_COL['coulee'], 'Musiq Quli coulee'),
    ([(-60, 208), (54, 174), (184, 104), (203, 115), (203, 208)], ZONE_COL['northbank'], 'Shaded Northbank (-10 C cellars)'),
]
for j in NET['junctions']:
    rad = 2.6 if j['kind'] == 'warming' else 1.7
    col = (244, 176, 76) if j['kind'] == 'warming' else (222, 204, 172)
    Q1_FILLS.append((oct_poly(j['x'], j['z'], rad), col))

Q1_LINES = [
    (rect_tl(-68, 58, -48, 56), (95, 95, 95), 2, 'Quunsul Crown: State Heart (Sheet Q2)'),
    (rect_tl(90, 202, -162, 18), (95, 95, 95), 2, 'Pycrete Apron (Sheet Q3)'),
]
for w in NET['ways']:
    pts = [tuple(p) for p in w['pts']]
    Q1_LINES.append((pts, (186, 92, 18), 4))
# Clean legend callout along the open Crown Spine corridor
Q1_LINES.append(([(-18, 4), (-2, 4)], (186, 92, 18), 4, 'KCITY.covered tunnels (91 ways)'))

Q1_LINES.append(([(-135, -252), (-95, -246), (-86, -196)], (135, 90, 48), 3, 'Leng road portal'))
Q1_LINES.append(([(198, -59), (114, -56), (86, -56)], (135, 90, 48), 3, 'Quarry haul ramp'))
Q1_LINES.append(([(14, 58), (45, 132), (68, 165)], (120, 80, 130), 3, 'Coulee footbridge to cellars'))

Q1_ROOMS = []
for p in L['parts']:
    if 'Q1' not in p['sheets']:
        continue
    if 'Q2' in p['sheets']:
        Q1_ROOMS.append(from_part(p, kind='see', note='State Heart: detailed room-by-room on Sheet Q2'))
    elif 'Q3' in p['sheets']:
        Q1_ROOMS.append(from_part(p, kind='see', note='Lakefront works: detailed on Sheet Q3'))
    else:
        Q1_ROOMS.append(from_part(p))

FLOORS.append(dict(
    R=320, rect=Q1_RECT, id='Q1', tier=0,
    title='Sheet Q1: The Covered Town, Six Kilen Clan Wards & Winter Tunnel Network (420 x 465 m)',
    sub=('All 47 winterNet buildings join one continuous, unblocked KCITY.covered vaulted stone-and-pycrete tunnel tree '
         '(amber lines; amber octagons mark 3.8 m stove-warmed rest domes on runs >= 80 m; buff octagons mark vaulted '
         'street junctions). Six specialized clan wards ring the Quunsul Crown along orthogonal drift-free corridors '
         '(Quraa iron-hearth NW, Qiviut musk-ox weavers W, Qaribuu spear-riders SW, Isnoo pycrete-masons & leeward SE '
         'tanneries S/SE, Isiit sweetroot & leat stewards N, Musiq herd-masters S-central). Every banya shares a stone '
         'thermal wall with a smithy; permafrost ice cellars sit across the coulee in shaded SSW-aspect ground.'),
    axisnote=AXIS,
    fills=Q1_FILLS,
    lines=Q1_LINES,
    rooms=Q1_ROOMS,
))

# ================================================================================================ Q2: THE STATE HEART
Q2_RECT = (-72, 64, -52, 60)
Q2_FILLS = [
    (rot_poly(L['zones']['state']['poly'], 3), ZONE_COL['state'], 'Quunsul Crown cobble & bedrock terrace (+21.6..+24.0 m)'),
    ([(-44.2, 21.6), (-15.8, 21.6), (-15.8, 42.4), (-44.2, 42.4)], (222, 214, 198)),
    ([(4.6, 20.4), (23.4, 20.4), (23.4, 43.6), (4.6, 43.6)], (222, 214, 198)),
    ([(1.2, -32.8), (42.2, -32.8), (42.2, -15.4), (1.2, -15.4)], (216, 204, 186), 'shared ventilated thermal-mass plinth'),
]
for j in NET['junctions']:
    if Q2_RECT[0] <= j['x'] <= Q2_RECT[1] and Q2_RECT[2] <= j['z'] <= Q2_RECT[3]:
        rad = 2.4 if j['kind'] == 'warming' else 1.7
        col = (244, 176, 76) if j['kind'] == 'warming' else (222, 204, 172)
        Q2_FILLS.append((oct_poly(j['x'], j['z'], rad), col))

Q2_LINES = [
    (rect_tl(*PARTS[k]['box']), (90, 90, 90), 2)
    for k in ('chief.hall', 'quunsul.hall', 'shrine.lake', 'guard.dome', 'envoy.dome', 'song.house',
              'bath.state', 'smithy.state', 'kitchen.state')
]
for w in NET['ways']:
    pts = [tuple(p) for p in w['pts']]
    if any(Q2_RECT[0] - 8 <= u <= Q2_RECT[1] + 8 and Q2_RECT[2] - 8 <= v <= Q2_RECT[3] + 8 for u, v in pts):
        clipped = [(max(Q2_RECT[0], min(Q2_RECT[1], u)), max(Q2_RECT[2], min(Q2_RECT[3], v))) for u, v in pts]
        Q2_LINES.append((clipped, (186, 92, 18), 5))
Q2_LINES.append(([(-12.0, 20.6), (8.0, 20.6)], (186, 92, 18), 5, 'Crown vaulted winter gallery (KCITY.covered)'))

for u0, u1, v_n, lab in [
    (-34.0, -26.0, 41.38, '45 deg north-sun ice lens'),
    (11.0, 17.0, 42.58, None),
    (42.0, 46.0, 36.48, None),
    (-30.5, -25.5, -14.72, None),
]:
    Q2_LINES.append(([(u0, v_n), (u1, v_n)], (50, 165, 225), 5) + ((lab,) if lab else ()))

Q2_ROOMS = [
    # --- Khaay Chiip's Compound (yt_chief_hall: -43..-17, 22.63..41.38) ---
    R(1, "Khaay Chiip's Ribbed Audience Dome", 'throne', -37.2, -22.8, 26.8, 37.8, 4,
      '10-ribbed corbelled impactite dome; soapstone fat lamps, Eternian gilt/bronze war masks & porcelain shelves'),
    R(2, 'High Seat & Flue-Warmed Fur Platform', 'Chief_dais', -35.8, -24.2, 37.8, 41.2, 4,
      'carved antler-and-meteoritic-iron High Seat over warm horizontal smoke ducts; north-facing clear ice skylight above'),
    R(3, 'Privy Sleeping Satellite Dome', 'bedchamber', -42.9, -37.2, 31.8, 40.8, 4,
      'double caribou-hide liner over qiviut sleeping furs; private soapstone seal lamp'),
    R(4, 'Stoking & Body-Servants Chamber', 'privy_kitchen', -42.9, -37.2, 23.2, 31.8, 2,
      'tends the under-platform flue stove without smoking the audience dome; herbal & marrow broth kettle'),
    R(5, 'Bead-Chest & Eternian Loot Treasury Dome', 'treasury', -22.8, -17.1, 31.8, 40.8, 4,
      'trade-bead coffers, qiviut state robes, captured Eternian lacquer chests, visor cases & silvered trophy heads'),
    R(6, 'Hearth-Spears Antechamber', 'guard', -22.8, -17.1, 23.2, 31.8, 2,
      'spear & harpoon racks guarding the High Chief threshold'),
    R(7, 'Chief Cold-Trap Katak Vestibule', 'katak', -33.2, -26.8, 22.7, 26.8, 2,
      'sunk -1.2 m floor pools dense cold air below the main hall threshold; fur-curtain airlocks'),
    C(8, 'Royal Serge Hitching Post West', 'serge_court', -35.5, 19.5, 1.5, 3, 'carved larch tethering post for clan speakers'),
    C(9, 'Royal Serge Hitching Post East', 'serge_court', -24.5, 19.5, 1.5, 3, 'carved larch tethering post with antler finial'),

    # --- Quunsul Hall (yt_quunsul_hall: 5.65..22.35, 21.43..42.58) ---
    R(10, 'Quunsul 10-Ribbed Council Hall', 'council', 5.8, 22.2, 26.2, 39.2, 4,
      'two concentric rings of carved clan benches seating the Seven Kilenler speakers'),
    C(11, 'Great Central Mass Stove (3.5 t)', 'stove_core', 14.0, 36.6, 1.75, 4,
      'dry-laid impactite & clay-mortared thermal core radiating heat 18 hours from one furlarch firing'),
    R(12, 'Treaty, Tally & Banner Alcove', 'archive', 7.2, 20.8, 39.2, 42.4, 3,
      'seven clan applique hangings, notched bone winter-raid tallies & Leng tribute chest'),
    R(13, 'Council Cold-Trap Katak & Boot Porch', 'katak', 9.4, 18.6, 21.5, 26.2, 2,
      'snow-beating sticks, crampon racks & sunken cold-air sump opening to the Crown gallery'),

    # --- Shrine of Cold Lake (yt_shrine: 39.25..48.75, 23.53..36.48) ---
    R(14, 'Spirit House of the Nine Masks', 'oratory', 39.4, 48.6, 27.2, 36.3, 3,
      'unheated corbelled stone dome on the east brow: two tiers of soapstone transformation masks & shaman frame drums'),
    R(15, 'Shrine Katak & Votive Antler Porch', 'katak', 41.4, 46.6, 23.6, 27.2, 2,
      'caribou-antler & lake-char offerings left before winter journeys'),

    # --- Hearth-Guards' Stone Dome (-60.91..-51.09, 25.17..38.83) ---
    R(16, 'Crown Watch & Runners Barracks', 'barracks', -60.8, -51.2, 28.8, 38.7, 2,
      'sixteen hearth-guards on fur bunks; bow, crampon & signal-horn racks'),
    R(17, 'West Crown Gate Katak', 'katak', -58.6, -53.4, 25.3, 28.8, 1),

    # --- Envoys' Stone House (-58.91..-49.09, -30.83..-17.17) ---
    R(18, "Envoys' & Ransom Parley Hall", 'guest_hall', -58.8, -49.2, -30.7, -20.8, 3,
      'warm stone dome where Leng caravan factors & foreign messengers lodge outside the clan hearths'),
    R(19, "Envoys' Katak Entry", 'katak', -56.6, -51.4, -20.8, -17.3, 2),

    # --- Great Qaggiq Song House (-35.36..-20.64, -33.28..-14.72) ---
    C(20, 'Qaggiq Catenary Dance & Drum Floor', 'qaggiq', -28.0, -25.8, 6.8, 3,
      '13.6 m clear-span pycrete dome lined with stitched caribou hides on an 18 cm cold air gap; mosaic fur dance circle'),
    R(21, 'Singers Bench & Six Fat-Lamp Plinths', 'music', -35.2, -20.8, -33.1, -31.2, 3,
      'throat-singers & frame-drummers; six soapstone lamps + body heat warm 200 gatherers without melting the shell'),
    R(22, 'Qaggiq North Katak Airlock', 'katak', -31.8, -24.2, -18.8, -14.8, 2),

    # --- Shared-Mass-Wall Hearth Triad: Crown Banya + Royal Smithy + Feast Kitchen ---
    R(23, 'Crown Banya Tiered Steam Chamber', 'hammam', 2.4, 10.6, -31.5, -21.2, 3,
      'three-tier larch sweat benches steamed by ladling meltwater onto red-hot impactite cobbles'),
    R(24, 'Banya Steam-Stone Stove & Water Vats', 'banya_stove', 10.6, 13.7, -31.5, -21.2, 2,
      'abuts the shared thermal wall to capture waste heat from the Royal Smithy'),
    R(25, 'Snow-Plunge & Robing Vestibule', 'katak', 4.6, 11.4, -21.2, -16.4, 2,
      'bathers beat with birch/willow switches and rub clean drift snow before re-entering the warm tunnel'),
    R(26, 'Shared 1.4-m Dry-Impactite Thermal Wall', 'thermal_wall', 13.75, 16.65, -31.2, -17.2, 1,
      'solid boulder-and-flue masonry mass coupling the Smithy forge and Crown Banya on one ventilated gravel pad'),
    R(27, 'Royal Meteoritic-Iron & Bronze Forge', 'smithy_bay', 16.7, 27.2, -31.1, -20.8, 2,
      'forges high-nickel impactite iron (geology.json impact:255, iron:120) and Musiq Quli placer tin/gold'),
    R(28, 'Smithy Katak & Coal/Charcoal Bin', 'katak', 19.0, 25.0, -20.8, -16.8, 1),
    R(29, 'Feast Cauldron & Pemmican Kitchen', 'kitchen', 31.0, 41.0, -30.8, -20.8, 2,
      'two great copper/iron cauldrons boiling caribou marrow broth & snow-potatoes for Quunsul feasts'),
    R(30, 'Kitchen Cold Larder & Katak', 'larder', 33.0, 39.0, -20.8, -17.1, 1),

    # --- Open ceremonial muster plaza between north & south Crown rows ---
    R(31, 'Crown Muster & Oath Court (open gravel)', 'court', -16.0, 4.5, -12.0, 18.0, 2,
      'wind-swept cobble court between the vaulted winter spine and Chief Serge posts for summer oaths'),
]

FLOORS.append(dict(
    R=90, rect=Q2_RECT, id='Q2', tier=0,
    title="Sheet Q2: The State Heart — Quunsul Crown, Khaay Chiip's Hall & Civic Hearth Triad (136 x 112 m)",
    sub=('Every interior room fits inside its exact kits/yeti footprint from src/30-ql-layout.js. Austere dry-stone and '
         'snow-white pycrete outside; warm fur linings, soapstone carvings and captured Eternian bronze/gilt masks, '
         'porcelain and alabaster lamps within (YT_LOOT_N state=9). Heated stone halls sit on 0.45 m ventilated gravel '
         'plinths with -1.2 m cold-trap katak entries and 45 deg north-facing clear lake-ice skylights (cyan bars); the '
         'Crown Banya, Royal Smithy and Feast Kitchen share one continuous thermal-mass plinth.'),
    axisnote=AXIS,
    fills=Q2_FILLS,
    lines=Q2_LINES,
    pillars=[
        (-34.5, 36.2), (-25.5, 36.2), (-36.0, 31.5), (-24.0, 31.5),
        (8.8, 36.5), (19.2, 36.5), (8.2, 30.2), (19.8, 30.2),
    ],
    dais=(-30.0, 39.2, 2.2),
    rooms=Q2_ROOMS,
))

# ================================================================================================ Q3: ICE & PYCRETE WORKS
Q3_RECT = (70, 290, -162, 92)
Q3_FILLS = [
    ([(210, -145), (195, -160), (288, -160), (288, 90), (252, 20)], ZONE_COL['lake'],
     'Cold Lake ice (y = 0 m, 1.4 m thick)'),
    ([(136, 22), (248, -8), (262, 52), (176, 90), (72, 90)], ZONE_COL['coulee'],
     'Musiq Quli mouth & winter aufeis'),
    ([(90, -8), (90, -160), (165, -160), (206, -144), (244, -10), (134, 20)], ZONE_COL['apron'],
     'Coarse impactite-gravel apron (+4..+9 m)'),
    ([(72, -160), (86, -160), (86, 88), (72, 88)], ZONE_COL['town']),
]
for j in NET['junctions']:
    if Q3_RECT[0] <= j['x'] <= Q3_RECT[1] and Q3_RECT[2] <= j['z'] <= Q3_RECT[3]:
        rad = 2.4 if j['kind'] == 'warming' else 1.7
        col = (244, 176, 76) if j['kind'] == 'warming' else (222, 204, 172)
        Q3_FILLS.append((oct_poly(j['x'], j['z'], rad), col))

Q3_LINES = [
    (rect_tl(*PARTS['quarry.n']['box']), (95, 95, 95), 2),
    (rect_tl(*PARTS['quarry.s']['box']), (95, 95, 95), 2),
    (rect_tl(*PARTS['pycrete.n']['box']), (95, 95, 95), 2, 'North Pycrete Yard'),
    (rect_tl(*PARTS['pycrete.c']['box']), (95, 95, 95), 2, 'Central Pycrete Works'),
    (rect_tl(*PARTS['pycrete.s']['box']), (95, 95, 95), 2, 'South Reskinning Yard'),
    (rect_tl(*PARTS['tea.lake']['box']), (95, 95, 95), 2, 'Quarry-Gate Tea Portal'),
    (rect_tl(*PARTS['saltpeter.vat']['box']), (95, 95, 95), 2, 'Saltpeter Sheds'),
    ([(118, 90), (156, 42), (168, -10)], (185, 110, 25), 5, 'furlarch sawdust chute'),
    ([(72, -56), (114, -56), (205, -60), (268, -54)], (135, 90, 48), 4),
    ([(180, -59), (195, -59)], (135, 90, 48), 4, 'caribou-sled ice haul ramp'),
    ([(288, 20), (254, -15)], (45, 95, 175), 3, 'NE lake-ice highway'),
    ([(192, -160), (212, -138)], (45, 95, 175), 3, 'SW lake-ice highway'),
]
for w in NET['ways']:
    pts = [tuple(p) for p in w['pts']]
    if any(Q3_RECT[0] <= u <= Q3_RECT[1] and Q3_RECT[2] <= v <= Q3_RECT[3] for u, v in pts):
        clipped = [(max(Q3_RECT[0], min(Q3_RECT[1], u)), max(Q3_RECT[2], min(Q3_RECT[3], v))) for u, v in pts]
        Q3_LINES.append((clipped, (186, 92, 18), 5))
Q3_LINES.append(([(72, -67), (76, -67)], (186, 92, 18), 5, 'KCITY.covered tunnel'))

# Exact parent boxes on Q3:
#   quarry.n      [268.50, 279.50, -43.50, -28.50]
#   quarry.s      [256.50, 267.50, -85.50, -70.50]
#   pycrete.n     [162.00, 174.00, -28.00, -12.00]
#   pycrete.c     [158.00, 170.00, -66.00, -50.00]
#   pycrete.s     [150.00, 162.00, -106.00, -90.00]
#   tea.lake      [109.04, 118.96, -78.69, -65.32]
#   saltpeter.vat [124.00, 144.00, -148.00, -132.00]
#   aufeis.yard   [ 76.00, 118.00,  60.00,  84.00]
Q3_ROOMS = [
    # --- North Lake-Ice Quarry ---
    R(1, 'North Sawn-Ice Trench & Saw Grid', 'quarry', 273.5, 279.4, -43.4, -28.6, 0,
      'two-man iron ice saws cut 0.9 x 0.45 m crystal blocks from 1.4 m Cold Lake black ice'),
    R(2, 'North Block Winch & Gravel Slipway', 'ice_slip', 268.6, 273.5, -43.4, -28.6, 0,
      'larch shear-legs & bone-runner sled loading stage'),
    # --- South Lake-Ice Quarry ---
    R(3, 'Optical Skylight-Lens Cutting Trench', 'quarry', 261.8, 267.4, -85.4, -70.6, 0,
      'harvests bubble-free upper-column lake ice for 45 deg north-sun dome windows'),
    R(4, 'South Crushing & Aggregate Slipway', 'ice_slip', 256.6, 261.8, -85.4, -70.6, 0),
    # --- Coulee Aufeis Bed ---
    R(5, 'Laminated Coulee Aufeis Quarry Bed', 'quarry', 76.0, 118.0, 60.0, 84.0, 0,
      'Musiq Quli winter overflow freezes in 8-12 cm sheets prized for fast-freezing pycrete slush'),
    # --- North Pycrete Moulding Yard ---
    R(6, 'Chute-Foot Furlarch Sawdust Hopper', 'store', 162.1, 168.0, -19.5, -12.1, 0,
      'receives dry rasped furlarch fibre straight off the Northbank timber chute'),
    R(7, 'Sphagnum & Caribou-Hair Fibre Bins', 'store', 168.0, 173.9, -19.5, -12.1, 0,
      '14% wood/moss fibre by weight gives pycrete slow melt & larch-like tensile toughness'),
    R(8, 'Slush Kettle & Mixing Troughs', 'pycrete_yard', 162.1, 173.9, -27.9, -19.5, 1,
      'low peat fire brings crushed aufeis + sawdust just to 0.5 C slush before pouring into timber forms'),
    # --- Central Pycrete Arch & Block Works ---
    R(9, 'Spiral Dome-Block Freezing Beds', 'pycrete_yard', 158.1, 164.2, -65.9, -50.1, 1,
      'open larch moulds freeze 240 standard curved blocks overnight in -20 C katabatic air'),
    R(10, 'Tunnel-Vault Centring & Slab Yard', 'pycrete_yard', 164.2, 169.9, -65.9, -50.1, 1,
      'casts removable winter-street roof arches for KCITY.covered ways'),
    # --- South Pycrete Slurry & Reskinning Yard ---
    R(11, 'Autumn Ablation-Coat Slurry Vats', 'pycrete_yard', 150.1, 161.9, -98.0, -90.1, 1,
      'fibre-rich white plaster trowelled onto permanent domes every autumn to heal summer sun wear'),
    R(12, 'Cured Pycrete Stack & Sled Dock', 'store', 150.1, 161.9, -105.9, -98.0, 0),
    # --- Quarry-Gate Tea & Warming House ---
    R(13, 'Quarrymen Ivan-Chai Tea & Samovar Dome', 'buttery', 109.2, 118.8, -78.5, -69.2, 2,
      'steaming fireweed tea, salted char & tallow broth beside a stone stove'),
    R(14, 'East Tunnel Portal & Crampon Airlock', 'katak', 110.8, 117.2, -69.2, -65.4, 1,
      'lowest eastern entrance into Qoold Lheek covered winter street network'),
    # --- Saltpeter Sheds ---
    R(15, 'Impactite Nitrate Leaching Vats', 'workshop', 124.1, 135.0, -147.9, -132.1, 0,
      'boils & crystallizes Outer Wall saltpeter (geology.json saltpeter:200) with wood ash'),
    R(16, 'Cask & Hide-Cure Salt Store', 'store', 135.0, 143.9, -147.9, -132.1, 0),
]

FLOORS.append(dict(
    R=180, rect=Q3_RECT, id='Q3', tier=0,
    title='Sheet Q3: The Lakefront Ice Quarries, Aufeis Bed & Pycrete Works (220 x 254 m)',
    sub=('Where the three ingredients of Khaayken pycrete meet on thaw-stable fan gravel (+5..+8 m): 1.4 m clear Cold Lake '
         'ice (right), laminated winter aufeis from Musiq Quli (top-left), and dry furlarch sawdust shot across the coulee '
         'from the shaded Northbank mill (ochre line). Quarry crews step off the sled ramp straight into the Quarry-Gate '
         'Ivan-Chai Tea House (13-14), entering the heated KCITY.covered tunnel spine without walking exposed up the hill.'),
    axisnote=AXIS,
    fills=Q3_FILLS,
    lines=Q3_LINES,
    rooms=Q3_ROOMS,
))

# ================================================================================================ FURNITURE & MANIFEST
OPEN_KINDS = {'quarry', 'serge_court', 'thermal_wall', 'court', 'garden', 'drill', 'cistern', 'see'}
cs = lambda n: max(1, round(n))

# Map Voth palace keys onto real `kits/catalog` `khaayken_*`, `eternian_*` war-loot & `generic_*` keys (or Khaayken NEW keys)
KEYMAP = {
    'voth_court_tapestry':        'khaayken_court_hanging',
    'voth_court_painted_hanging': 'khaayken_court_hanging',
    'voth_court_wall_rug':        'khaayken_court_hanging',
    'voth_court_frieze':          'khaayken_court_mask_board',
    'voth_court_art':             'khaayken_court_mask_board',
    'voth_court_carpet':          'khaayken_fur_platform_rug',
    'voth_common_rug':            'khaayken_fur_platform_rug',
    'voth_court_statue':          'khaayken_court_figure',
    'voth_statue':                'khaayken_court_figure',
    'voth_court_lamp':            'eternian_court_alabaster_lamp',
    'voth_court_candelabra':      'khaayken_common_lamp_shelf',
    'voth_common_lamp':           'khaayken_poor_lamp',
    'generic_lamp':               'khaayken_poor_lamp',
    'voth_court_hanging':         'khaayken_court_hanging',
    'voth_common_hanging':        'khaayken_poor_robes',
    'voth_common_banner':         'khaayken_court_hanging',
    'voth_court_banner':          'khaayken_court_hanging',
    'voth_planter':               'generic_herb_bundles',
    'voth_court_fire':            'khaayken_mass_stove',
    'voth_common_fire':           'khaayken_poor_lamp',
    'voth_court_hearth':          'khaayken_mass_stove',
    'voth_common_hearth':         'khaayken_mass_stove',
    'voth_street_brazier':        'khaayken_mass_stove',
    'voth_common_art':            'khaayken_court_figure',
    'voth_common_scroll':         'generic_writing_supplies',
    'voth_court_sun_throne':      'khaayken_court_high_seat',
    'voth_court_throne':          'khaayken_court_high_seat',
    'voth_court_divan':           'khaayken_court_clan_bench',
    'voth_common_bench':          'khaayken_poor_stone_bench',
    'voth_bench':                 'khaayken_poor_stone_bench',
    'voth_common_chair':          'khaayken_poor_stone_bench',
    'voth_common_stool':          'khaayken_poor_stone_bench',
    'voth_court_low_table':       'khaayken_common_tea_board',
    'voth_court_table':           'khaayken_common_tea_board',
    'voth_common_table':          'khaayken_common_tea_board',
    'voth_court_desk':            'khaayken_common_tea_board',
    'voth_common_desk':           'khaayken_common_tea_board',
    'voth_common_counter':        'khaayken_common_tea_board',
    'voth_court_screen':          'khaayken_court_antler_screen',
    'voth_common_screen':         'khaayken_court_antler_screen',
    'voth_court_cabinet':         'khaayken_court_bead_chest',
    'voth_common_chest':          'khaayken_common_chest',
    'voth_court_strongbox':       'eternian_common_chest',
    'voth_court_bookcase':        'khaayken_common_lamp_shelf',
    'voth_common_bookcase':       'khaayken_common_lamp_shelf',
    'voth_common_wall_shelves':   'khaayken_common_lamp_shelf',
    'voth_common_store':          'generic_storage_jar',
    'voth_common_board':          'khaayken_court_mask_board',
    'voth_common_ladder':         'khaayken_poor_drying_rack',
    'voth_court_armour_stand':    'eternian_court_visor_case',
    'voth_court_trophy_stand':    'eternian_court_visor_case',
    'voth_common_rack':           'khaayken_poor_drying_rack',
    'generic_trade_weapon_rack':  'khaayken_spear_harpoon_rack',
    'voth_court_baldachin_bed':   'khaayken_sleeping_furs',
    'voth_court_bed':             'khaayken_sleeping_furs',
    'voth_common_bed':            'khaayken_sleeping_furs',
    'generic_trade_bunk':         'khaayken_sleeping_furs',
    'generic_trade_locker':       'khaayken_poor_hide_bag',
    'voth_court_bath_pool':       'khaayken_poor_hide_bucket',
    'voth_court_bath_slab':       'khaayken_banya_steam_stove',
    'voth_court_wall_fountain':   'generic_water',
    'voth_court_sun_altar':       'khaayken_court_mask_board',
    'voth_common_ash_niche':      'khaayken_court_figure',
    'voth_court_jug':             'generic_tea_set',
    'voth_common_jug':            'generic_tea_set',
    'voth_court_bowl':            'khaayken_common_pot',
    'voth_common_bowl':           'khaayken_common_pot',
    'voth_common_cauldron':       'khaayken_common_pot',
    'voth_common_spit':           'generic_cured_meat',
    'voth_bread_oven':            'khaayken_mass_stove',
    'voth_common_workbench':      'khaayken_carving_bench',
    'generic_trade_bin':          'generic_floor_basket',
    'generic_trade_larder':       'generic_cured_meat',
    'generic_trade_barrel':       'generic_spirits',
    'generic_trade_vat':          'khaayken_tanning_vat',
    'generic_trade_lathe':        'khaayken_common_comb_stand',
    'voth_loom_display':          'khaayken_common_loom',
    'voth_common_drum_stand':     'khaayken_common_drum',
    'voth_common_ice_box':        'generic_cured_meat',
    'voth_canoe':                 'khaayken_caribou_sled',
}


def extra_programs():
    return {
        'throne': lambda a, w, d, D: [
            ('khaayken_court_high_seat', 1), ('khaayken_court_clan_bench', 6), ('khaayken_court_antler_screen', 2),
            ('khaayken_court_figure', 4), ('khaayken_court_mask_board', 2), ('eternian_court_alabaster_lamp', 3),
            ('eternian_court_visor_case', 2), ('eternian_common_chest', 2), ('khaayken_common_tea_board', 2),
            ('generic_tea_set', 2), ('khaayken_poor_lamp', 4),
        ],
        'Chief_dais': lambda a, w, d, D: [
            ('khaayken_court_high_seat', 1), ('khaayken_sleeping_furs', 2), ('khaayken_court_bead_chest', 2),
            ('khaayken_court_antler_screen', 2), ('eternian_court_alabaster_lamp', 2),
        ],
        'council': lambda a, w, d, D: [
            ('khaayken_court_clan_bench', 14), ('khaayken_court_high_seat', 1), ('khaayken_court_hanging', 7),
            ('khaayken_court_mask_board', 2), ('khaayken_court_figure', 3), ('eternian_court_alabaster_lamp', 2),
            ('khaayken_common_drum', 2), ('khaayken_common_tea_board', 3), ('generic_tea_set', 3),
        ],
        'stove_core': lambda a, w, d, D: [('khaayken_mass_stove', 1), ('generic_fuel', 3), ('khaayken_common_pot', 2)],
        'oratory': lambda a, w, d, D: [
            ('khaayken_court_mask_board', 3), ('khaayken_court_figure', 5), ('khaayken_common_drum', 2),
            ('khaayken_poor_lamp', 4), ('khaayken_court_antler_screen', 1), ('generic_herb_bundles', 2),
        ],
        'qaggiq': lambda a, w, d, D: [
            ('khaayken_fur_platform_rug', 2), ('khaayken_poor_stone_bench', 10), ('khaayken_poor_lamp', 6),
            ('khaayken_common_drum', 4), ('khaayken_court_mask_board', 2),
        ],
        'music': lambda a, w, d, D: [
            ('khaayken_common_drum', cs(a / 18)), ('khaayken_poor_lamp', 6), ('khaayken_poor_stone_bench', cs(a / 12)),
            ('khaayken_court_figure', 2),
        ],
        'katak': lambda a, w, d, D: [
            ('khaayken_poor_drying_rack', 1), ('khaayken_poor_hide_bucket', 1), ('khaayken_poor_robes', 2),
            ('khaayken_poor_lamp', 1),
        ],
        'hammam': lambda a, w, d, D: [
            ('khaayken_banya_steam_stove', 1), ('khaayken_poor_stone_bench', 6), ('khaayken_poor_hide_bucket', 4),
            ('generic_water', 2), ('generic_herb_bundles', 3), ('khaayken_poor_drying_rack', 2),
        ],
        'bath': lambda a, w, d, D: [
            ('khaayken_banya_steam_stove', 1), ('khaayken_poor_stone_bench', 4), ('khaayken_poor_hide_bucket', 3),
            ('generic_water', 2), ('generic_herb_bundles', 2),
        ],
        'banya_stove': lambda a, w, d, D: [
            ('khaayken_banya_steam_stove', 1), ('generic_fuel', 3), ('generic_water', 3), ('khaayken_poor_hide_bucket', 2),
        ],
        'smithy_bay': lambda a, w, d, D: [
            ('khaayken_meteor_forge', 1), ('khaayken_carving_bench', 2), ('khaayken_spear_harpoon_rack', 2),
            ('generic_fuel', 3), ('khaayken_poor_hide_bucket', 2),
        ],
        'kin_hall': lambda a, w, d, D: [
            ('khaayken_court_clan_bench', 6), ('khaayken_court_high_seat', 1), ('khaayken_mass_stove', 1),
            ('khaayken_sleeping_furs', 4), ('khaayken_court_hanging', 3), ('khaayken_court_bead_chest', 2),
            ('khaayken_common_tea_board', 2), ('generic_tea_set', 2), ('eternian_common_chest', 1),
            ('eternian_court_alabaster_lamp', 1),
        ],
        'lodging': lambda a, w, d, D: [
            ('khaayken_sleeping_furs', cs(a / 28)), ('khaayken_mass_stove', cs(a / 180)),
            ('khaayken_common_chest', cs(a / 45)), ('khaayken_common_tea_board', cs(a / 70)),
            ('generic_tea_set', cs(a / 70)), ('khaayken_poor_lamp', cs(a / 40)),
            ('khaayken_poor_drying_rack', cs(a / 60)), ('generic_lamp_oil', cs(a / 80)),
            ('eternian_common_chest', 1 if D >= 2 and a > 250 else 0),
        ],
        'dormitory': lambda a, w, d, D: [
            ('khaayken_sleeping_furs', cs(a / 18)), ('khaayken_poor_hide_bag', cs(a / 22)),
            ('khaayken_poor_lamp', cs(a / 35)), ('khaayken_poor_drying_rack', cs(a / 45)),
            ('khaayken_common_pot', 1), ('generic_lamp_oil', 1),
        ],
        'workshop': lambda a, w, d, D: [
            ('khaayken_carving_bench', cs(a / 32)), ('khaayken_common_loom', 2 if a > 110 else 1),
            ('khaayken_common_comb_stand', 2 if a > 110 else 1), ('khaayken_poor_drying_rack', cs(a / 45)),
            ('generic_floor_basket', cs(a / 35)), ('generic_fuel', 2),
        ],
        'laundry': lambda a, w, d, D: [
            ('khaayken_tanning_vat', cs(a / 30)), ('khaayken_poor_drying_rack', cs(a / 25)),
            ('khaayken_poor_hide_bucket', 4), ('khaayken_carving_bench', 2), ('generic_fuel', 2),
        ],
        'buttery': lambda a, w, d, D: [
            ('khaayken_mass_stove', 1), ('khaayken_common_tea_board', 4), ('generic_tea_set', 4),
            ('khaayken_poor_stone_bench', 6), ('khaayken_common_pot', 3), ('generic_herb_bundles', 4),
            ('generic_snack_bowl', 4),
        ],
        'pycrete_yard': lambda a, w, d, D: [
            ('khaayken_pycrete_mould', cs(a / 18)), ('khaayken_ice_saw_bench', 1), ('khaayken_common_pot', 2),
            ('generic_fuel', 2), ('generic_floor_basket', 3),
        ],
        'ice_slip': lambda a, w, d, D: [
            ('khaayken_ice_saw_bench', 2), ('khaayken_caribou_sled', 2),
        ],
        'ancestors_hall': lambda a, w, d, D: [
            ('khaayken_court_figure', 2), ('khaayken_court_mask_board', 1), ('khaayken_poor_lamp', 2),
            ('khaayken_spear_harpoon_rack', 1),
        ],
        'boathouse': lambda a, w, d, D: [
            ('khaayken_caribou_sled', cs(a / 75)), ('generic_floor_basket', cs(a / 50)),
            ('khaayken_poor_hide_bucket', 4), ('khaayken_poor_drying_rack', 2),
        ],
        'beacon': lambda a, w, d, D: [
            ('khaayken_mass_stove', 1 if a > 25 else 0), ('khaayken_spear_harpoon_rack', 1),
            ('generic_fuel', 2), ('khaayken_poor_lamp', 1),
        ],
    }


NEW = {
    'khaayken_mass_stove': 'dry-laid impactite & clay thermal-mass stove with horizontal under-platform smoke flues and broth kettle niche',
    'khaayken_banya_steam_stove': 'closed boulder steam-hearth of the Khaayken sweat lodge, with red-hot impactite cobbles and larch ladle bucket',
    'khaayken_sleeping_furs': 'raised fur sleeping spread of layered winter caribou pelts and qiviut blankets over willow/larch slats',
    'khaayken_fur_platform_rug': 'stitched geometric caribou-and-musk-ox mosaic floor skin (`kits/yeti` platform pattern)',
    'khaayken_meteor_forge': 'charcoal & peat bellows hearth with an Outer Wall nickel-iron boulder anvil and stone quench trough',
    'khaayken_carving_bench': 'low larch knee-bench with bow-drills, iron gravers and soapstone/antler blanks',
    'khaayken_tanning_vat': 'larch-stave & saltpeter hide-steeping tub with brain-and-oil beaming frame',
    'khaayken_pycrete_mould': 'knock-down pegged larch curved block mould and arch centring frame for casting 14%-sawdust pycrete',
    'khaayken_ice_saw_bench': 'two-man iron lake-ice saw, ice tongs and auger rack on larch trestles',
    'khaayken_caribou_sled': 'sinew-lashed larch freight & raiding sled (`narta`) on bone-and-iron runners',
    'khaayken_spear_harpoon_rack': 'wall rack of meteoritic-iron boar/caribou spears, ice harpoons and recurve horn bows',
}


# ================================================================================================ THREE-PANEL SECTION SHEET
def ground_u(u, v=0.0):
    # Mirror QOOLD.groundAt(L, u, v) along the WNW -> ESE section line
    if u >= 242:
        return 0.0
    if 90 <= u < 242:
        return 4.2 + max(0.0, 220.0 - u) * 0.032
    if -68 <= u <= 58:
        return 21.6 + (v + 48.0) * 0.022
    if -194 <= u < 90:
        return 13.5 + (v + 246.0) * 0.026 + max(0.0, -u) * 0.014
    if -464 <= u < -194:
        return 26.0 + (-u - 198.0) * 0.042 + max(0.0, v + 50.0) * 0.015
    return min(62.0, 48.0 + max(0.0, -u - 468.0) * 0.055)


def draw_section():
    f_t = B.font(36, True)
    f_h = B.font(24, True)
    f_b = B.font(18, True)
    f = B.font(17)
    fs = B.font(15)
    W, H = 2500, 1580
    img = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(img)

    # ---- HEADER ----
    dr.text((34, 16), 'Qoold Lheek — Site, Solar-Aspect & Permafrost Engineering Sections', font=f_t, fill=(20, 20, 20))
    dr.text((34, 62),
            'Datum y = 0 m is Cold Lake (5,680.41 m ASL; 1.4 m winter ice over a 159 m trough). Latitude 27.8 deg S puts the midday sun in TRUE NORTH (0 deg); prevailing 300 deg WNW katabatic winds sweep off the 6,050 m plateau.',
            font=f, fill=(65, 65, 65))

    # ==================================================================== PANEL A: WNW -> ESE LONG SECTION (top)
    dr.rectangle([28, 100, W - 28, 815], fill=(248, 250, 252), outline=(150, 150, 150), width=2)
    dr.text((46, 112), 'A. Long Section WNW -> ESE from West Watch Brow across Sun-Bench, Quunsul Crown & Pycrete Apron to Cold Lake (heights x3.0)',
            font=f_h, fill=(25, 25, 25))

    u_min, u_max = -620.0, 340.0
    sx = (W - 150) / (u_max - u_min)
    sy = sx * 3.0
    ox = 80 - u_min * sx
    base_y = 735

    def XA(u):
        return ox + u * sx

    def YA(h):
        return base_y - h * sy

    # Sky wind arrow cleanly inside Panel A (y ~ 155..185)
    dr.line([(XA(-520), 168), (XA(-390), 184)], fill=(50, 85, 140), width=4)
    dr.polygon([(XA(-390), 184), (XA(-404), 177), (XA(-405), 189)], fill=(50, 85, 140))
    dr.text((XA(-520), 144), '300 deg WNW katabatic Outer Wall gale (5.3-5.9 m/s)', font=f_b, fill=(50, 85, 140))

    # Cold Lake water & 1.4 m ice sheet on the right
    dr.rectangle([XA(242), YA(0), XA(u_max), 805], fill=(150, 196, 232), outline=(90, 130, 170))
    dr.rectangle([XA(242), YA(1.4), XA(u_max), YA(0)], fill=(232, 246, 255), outline=(70, 120, 170), width=2)
    dr.text((XA(245), YA(-5.5)), 'Cold Lake (5,680.4 m, 159 m deep)', font=fs, fill=(25, 65, 110))
    dr.text((XA(245), YA(-1.8)), '1.4 m winter black ice', font=fs, fill=(35, 85, 140))

    # Permafrost table line & ground polygon
    g_pts = [(XA(u), YA(ground_u(u, 10.0))) for u in range(-620, 244, 4)] + [(XA(242), 805), (XA(-620), 805)]
    dr.polygon(g_pts, fill=(224, 214, 196), outline=(110, 95, 78))
    pf_pts = [(XA(u), YA(ground_u(u, 10.0) - 1.2)) for u in range(-620, 240, 8)]
    dr.line(pf_pts, fill=(70, 125, 175), width=2)
    dr.text((XA(-455), YA(16.0)), 'continuous permafrost (-0.8..-1.3 m; impactite bedrock & dry moraine gravel)',
            font=fs, fill=(50, 95, 145))

    def blk(u0, u1, h, col, label=None, dy_lbl=-22, dx_lbl=-4, dome=False, plinth=False):
        g = ground_u((u0 + u1) / 2.0, 10.0) if u0 < 242 else 1.4
        if plinth:
            dr.rectangle([XA(u0 - 1.5), YA(g + 0.55), XA(u1 + 1.5), YA(g)], fill=(165, 160, 150), outline=(70, 70, 70))
            g += 0.55
        if dome:
            dr.pieslice([XA(u0), YA(g + h), XA(u1), YA(g - h)], 180, 360, fill=col, outline=(35, 35, 35), width=2)
        else:
            dr.rectangle([XA(u0), YA(g + h), XA(u1), YA(g)], fill=col, outline=(35, 35, 35), width=2)
        if label:
            cx = XA((u0 + u1) / 2.0)
            ty = YA(g + h) + dy_lbl
            if dy_lbl <= -34:
                dr.line([(cx, YA(g + h) - 2), (cx, ty + 18)], fill=(120, 120, 120), width=1)
            dr.text((XA(u0) + dx_lbl, ty), label, font=fs, fill=(20, 20, 20))

    # Landmarks along WNW -> ESE section (staggered label heights for crisp separation)
    blk(-548, -542, 9.6, (210, 202, 188), 'West Watch Tower (+58 m)', -22, -30)
    fg = ground_u(-472, 10.0)
    dr.line([(XA(-472), YA(fg)), (XA(-472), YA(fg + 3.4))], fill=(40, 50, 70), width=4)
    dr.polygon([(XA(-470), YA(fg)), (XA(-460), YA(fg + 2.8)), (XA(-442), YA(fg))], fill=(224, 242, 255), outline=(110, 155, 195))
    dr.text((XA(-476), YA(fg + 3.4) - 22), '3.2 m Snow Fence + 26 m drift quarry', font=fs, fill=(40, 70, 115))

    for u_t in (-415, -365, -315, -265):
        gt = ground_u(u_t, 10.0)
        dr.rectangle([XA(u_t - 18), YA(gt + 1.1), XA(u_t + 18), YA(gt)], fill=(196, 218, 168), outline=(90, 105, 75))
    dr.text((XA(-425), YA(ground_u(-365, 10.0) + 6.0)),
            'Sun-Bench: boulder snow-potato pockets & sweetroot leat (+27..+38 m)', font=fs, fill=(45, 95, 35))
    blk(-216, -208, 3.2, (232, 226, 206), 'Goldroot Shed', -44, -36)

    # West Clan Wards
    blk(-184, -144, 7.0, (240, 244, 248), 'Clan Winter Street', -22, -8, dome=True, plinth=True)
    blk(-108, -92, 7.9, (228, 222, 208), 'Clan Seat', -44, -18, dome=True, plinth=True)

    # Covered tunnel ribbon across town & Crown
    t_pts = [(XA(u), YA(ground_u(u, 10.0) + 2.5)) for u in range(-144, 118, 8)]
    dr.line(t_pts, fill=(186, 92, 18), width=5)
    dr.text((XA(-82), YA(ground_u(-60, 10.0) - 5.2)), 'KCITY.covered vaulted winter tunnel spine', font=fs, fill=(165, 75, 10))

    # Quunsul Crown (State Heart)
    blk(-43, -17, 10.2, (238, 220, 150), "Khaay Chiip's Hall (10.2 m)", -64, -38, dome=True, plinth=True)
    blk(5.6, 22.4, 11.3, (238, 220, 150), 'Quunsul Hall (11.3 m)', -42, -16, dome=True, plinth=True)
    blk(26, 48, 7.2, (216, 226, 184), 'Shared Banya + Smithy', -22, -4, dome=True, plinth=True)
    blk(69, 79, 6.6, (226, 224, 214), 'Portal Dome', -42, -12, dome=True, plinth=True)

    # Quarry-Gate Tea House, Pycrete Works & Lake Quarries
    blk(109, 119, 5.6, (234, 228, 210), 'Quarry Tea Portal', -22, -22, dome=True, plinth=True)
    blk(156, 174, 3.4, (232, 238, 246), 'Pycrete Yards (+6 m)', -22, -8)
    dr.line([(XA(125), YA(24.0)), (XA(168), YA(9.5))], fill=(185, 110, 25), width=4)
    dr.text((XA(112), YA(26.8)), 'sawdust chute (Northbank)', font=fs, fill=(165, 95, 15))
    blk(260, 278, 2.4, (210, 232, 248), 'Lake-Ice Quarries', -22, -14)

    # Elevation ticks & horizontal scale bar in Panel A
    for h_tick in (0, 20, 40, 60):
        dr.line([(XA(-620), YA(h_tick)), (XA(-612), YA(h_tick))], fill=(60, 60, 60), width=2)
        dr.text((34, YA(h_tick) - 9), '+%d m' % h_tick, font=fs, fill=(60, 60, 60))
    dr.line([(XA(-595), 785), (XA(-495), 785)], fill=(0, 0, 0), width=4)
    dr.text((XA(-595), 760), '100 m horizontal (vertical x3.0)', font=fs, fill=(0, 0, 0))

    # ==================================================================== PANEL B: SW -> NE SOLAR-ASPECT COULEE SECTION (bottom-left)
    dr.rectangle([28, 838, 1230, H - 28], fill=(252, 251, 246), outline=(150, 150, 150), width=2)
    dr.text((46, 850), 'B. Cross-Coulee Solar-Aspect Section (SW -> NE, 27.8 deg S: Sun in TRUE NORTH)', font=f_h, fill=(25, 25, 25))
    dr.text((46, 882), 'Why town & crops take the NNE-facing right bank while furlarch & ice cellars take the shaded SSW-facing left bank:',
            font=fs, fill=(75, 75, 75))

    bx0, by0 = 630, 1440
    bsx, bsy = 2.05, 6.4
    XB = lambda s: bx0 + s * bsx
    YB = lambda h: by0 - h * bsy
    prof = [
        (-260, 40), (-190, 34), (-110, 24), (-45, 16), (-18, 6.5), (0, 5.0),
        (18, 6.5), (65, 20), (140, 36), (215, 50), (260, 54),
    ]
    poly_b = [(XB(s), YB(h)) for s, h in prof] + [(XB(260), YB(-6)), (XB(-260), YB(-6))]
    dr.polygon(poly_b, fill=(224, 216, 198), outline=(100, 90, 75), width=2)
    shade_poly = [(XB(18), YB(6.5)), (XB(65), YB(20)), (XB(140), YB(36)), (XB(215), YB(50)), (XB(215), YB(44)), (XB(65), YB(15)), (XB(18), YB(4))]
    dr.polygon(shade_poly, fill=(184, 202, 214))
    warm_poly = [(XB(-260), YB(40)), (XB(-190), YB(34)), (XB(-110), YB(24)), (XB(-45), YB(16)), (XB(-45), YB(12)), (XB(-190), YB(30)), (XB(-260), YB(36))]
    dr.polygon(warm_poly, fill=(224, 236, 184))
    dr.rectangle([XB(-18), YB(6.6), XB(18), YB(5.0)], fill=(190, 230, 250), outline=(70, 130, 175))
    dr.text((XB(-56), YB(1.5)), 'Musiq Quli aufeis & gold/tin placers', font=fs, fill=(40, 95, 145))

    sun_x, sun_y = XB(225), YB(76)
    dr.ellipse([sun_x - 18, sun_y - 18, sun_x + 18, sun_y + 18], fill=(250, 195, 45), outline=(195, 125, 10), width=2)
    dr.text((sun_x - 265, sun_y - 12), 'NORTHERN SUN (0 deg, winter 38.7 deg)', font=f_b, fill=(185, 110, 10))
    for target_s, target_h in [(-215, 36), (-145, 28), (-75, 19)]:
        dr.line([(sun_x - 14, sun_y + 10), (XB(target_s), YB(target_h))], fill=(235, 175, 35), width=2)

    dr.rectangle([XB(-225), YB(39), XB(-185), YB(35)], fill=(190, 216, 155), outline=(70, 90, 55))
    dr.text((XB(-252), YB(44.5)), "Isnoo-pa'a boulder pockets (+4 C soil)", font=fs, fill=(45, 90, 35))
    dr.pieslice([XB(-128), YB(31), XB(-86), YB(19)], 180, 360, fill=(238, 220, 150), outline=(40, 40, 40), width=2)
    dr.text((XB(-168), YB(35.2)), 'Town & State domes (north ice lenses)', font=fs, fill=(40, 40, 40))

    dr.rectangle([XB(58), YB(21), XB(92), YB(16)], fill=(175, 200, 222), outline=(50, 75, 105), width=2)
    dr.text((XB(38), YB(25.2)), '-10 C permafrost ice cellars (winter shade)', font=fs, fill=(35, 65, 105))
    for tree_s, tree_h in [(125, 33), (142, 36.5), (160, 40)]:
        dr.polygon([(XB(tree_s), YB(tree_h + 6.5)), (XB(tree_s - 7), YB(tree_h)), (XB(tree_s + 7), YB(tree_h))],
                   fill=(75, 120, 82), outline=(40, 70, 45))
    dr.text((XB(95), YB(48.5)), 'Snow-holding furlarch coppice', font=fs, fill=(40, 85, 50))
    dr.rectangle([XB(218), YB(55.5), XB(246), YB(50.5)], fill=(214, 204, 190), outline=(50, 50, 50), width=2)
    dr.text((XB(145), YB(60.5)), 'Dry bedrock Clan Tombs (+52 m)', font=fs, fill=(60, 50, 40))

    # ==================================================================== PANEL C: 1:50 PERMAFROST, KATAK & PYCRETE DETAIL (bottom-right)
    dr.rectangle([1262, 838, W - 28, H - 28], fill=(250, 250, 248), outline=(150, 150, 150), width=2)
    dr.text((1282, 850), 'C. Thermal & Permafrost Cut: Heated Dome + Cold-Trap Katak + Tunnel', font=f_h, fill=(25, 25, 25))
    dr.text((1282, 882), 'How a +16 C fur-lined Khaayken room stands on -4.2 C permafrost without thawing the ground or melting its pycrete shell:',
            font=fs, fill=(75, 75, 75))

    cx0, cy0 = 1850, 1340
    cs_m = 45.0
    XC = lambda x: cx0 + x * cs_m
    YC = lambda y: cy0 - y * cs_m

    # Outer Pycrete Catenary Shell (0.45 m thick) + 18 cm Cold Air Gap + Inner Caribou-Hide Liner
    dr.pieslice([XC(-5.6), YC(5.45), XC(4.4), YC(-4.55)], 180, 360, fill=(235, 243, 250), outline=(45, 65, 90), width=3)
    dr.pieslice([XC(-5.05), YC(4.90), XC(3.85), YC(-4.00)], 180, 360, fill=(208, 228, 246), outline=(90, 130, 170), width=1)
    dr.pieslice([XC(-4.80), YC(4.65), XC(3.60), YC(-3.75)], 180, 360, fill=(248, 234, 204), outline=(135, 85, 35), width=3)
    dr.rectangle([XC(-5.8), YC(0.45), XC(4.6), YC(-3.8)], fill=(250, 250, 248))

    # Permafrost, active layer & 0.45 m Ventilated Coarse-Gravel Plinth
    dr.rectangle([1285, YC(-0.65), W - 46, H - 44], fill=(198, 214, 228), outline=(110, 140, 170))
    dr.text((1300, H - 70), 'Undisturbed Permafrost (-8 to -10 C): stays frozen year-round under ventilated gravel pad',
            font=fs, fill=(35, 70, 110))
    dr.rectangle([1285, YC(0.0), W - 46, YC(-0.65)], fill=(222, 212, 194), outline=(120, 105, 85))
    dr.rectangle([XC(-7.2), YC(0.45), XC(5.6), YC(0.0)], fill=(182, 176, 166), outline=(60, 60, 60), width=2)
    for dx in (-5.5, -3.5, -1.5, 0.5, 2.5, 4.3):
        dr.rectangle([XC(dx - 0.25), YC(0.32), XC(dx + 0.25), YC(0.10)], fill=(235, 245, 255), outline=(70, 95, 125))
    dr.text((XC(-11.4), YC(-0.18)), '0.45 m ventilated cobble plinth (air ducts stop thaw)', font=fs, fill=(45, 45, 45))

    # Raised Fur Sleeping Platform (+1.15 m), Warm Flue & Mass Stove
    dr.rectangle([XC(-4.75), YC(1.20), XC(-0.8), YC(0.45)], fill=(216, 180, 128), outline=(90, 55, 25), width=2)
    dr.text((XC(-4.65), YC(1.66)), 'Fur sleeping platform (+18 C)', font=fs, fill=(95, 45, 15))
    dr.text((XC(-4.60), YC(0.95)), 'under-platform flue', font=fs, fill=(145, 55, 15))
    dr.rectangle([XC(-0.55), YC(1.35), XC(0.35), YC(0.45)], fill=(140, 130, 120), outline=(40, 40, 40), width=2)
    dr.ellipse([XC(-0.2), YC(1.65), XC(0.05), YC(1.35)], fill=(245, 155, 30))

    # Cold-Trap Katak Sump & KCITY.covered Vaulted Winter Tunnel
    dr.rectangle([XC(2.6), YC(0.55), XC(5.4), YC(-0.35)], fill=(214, 232, 248), outline=(50, 80, 120), width=2)
    dr.text((XC(1.0), YC(-0.42)), 'Cold-trap katak (-1.2 m sump pools dense cold air)', font=fs, fill=(30, 65, 115))
    dr.rectangle([XC(4.4), YC(2.55), XC(9.6), YC(0.45)], fill=(238, 224, 198), outline=(165, 85, 20), width=3)
    dr.text((XC(4.6), YC(2.25)), 'KCITY.covered vaulted tunnel', font=fs, fill=(155, 75, 15))
    dr.text((XC(4.6), YC(1.75)), '(snow-banked, -2..+4 C)', font=fs, fill=(90, 65, 40))

    # 45 deg North-Sun Clear Lake-Ice Lens + Crown Vent
    dr.line([(XC(2.2), YC(4.15)), (XC(3.35), YC(3.05))], fill=(45, 175, 235), width=7)
    dr.line([(XC(4.8), YC(5.4)), (XC(2.85), YC(3.65))], fill=(235, 175, 35), width=3)
    dr.text((XC(3.0), YC(5.68)), '45 deg north-sun clear lake-ice lens', font=fs, fill=(25, 115, 175))
    dr.rectangle([XC(-0.85), YC(5.62), XC(-0.35), YC(5.25)], fill=(255, 245, 225), outline=(80, 80, 80))
    dr.text((XC(-2.5), YC(5.98)), 'throttleable crown vent', font=fs, fill=(70, 70, 70))

    # Shell callout on left
    dr.text((XC(-11.8), YC(4.55)), '0.45 m pycrete shell (<0 C)', font=fs, fill=(40, 65, 95))
    dr.text((XC(-11.8), YC(4.05)), '+ 18 cm cold air gap', font=fs, fill=(55, 95, 145))
    dr.text((XC(-11.8), YC(3.55)), '+ stitched caribou-hide liner', font=fs, fill=(125, 70, 25))
    dr.line([(XC(-6.4), YC(4.1)), (XC(-4.7), YC(3.5))], fill=(90, 90, 90), width=2)

    return img


def main():
    B.KEYMAP.update(KEYMAP)
    B.EXTRA_PROGRAMS.update(extra_programs())
    B.OPEN_KINDS.update(OPEN_KINDS)
    B.KIND_FILL.update({
        'quarry':       (194, 224, 246),
        'ice_slip':     (212, 228, 240),
        'pycrete_yard': (228, 236, 246),
        'katak':        (214, 226, 238),
        'stove_core':   (236, 176, 120),
        'Chief_dais':   (242, 210, 132),
        'qaggiq':       (240, 228, 186),
        'banya_stove':  (232, 188, 146),
        'thermal_wall': (172, 166, 158),
        'smithy_bay':   (228, 214, 196),
        'serge_court':  (234, 214, 164),
        'see':          (246, 240, 218),
        'buttery':      (232, 224, 196),
        'ancestors_hall': (218, 212, 204),
    })
    B.NEW.clear()
    B.NEW.update(NEW)
    B.CITY.clear()

    intro = (
        'Generated by `qoold_blueprint.py` (on `settlements/voth/palace/blueprint.py`, imported in place) from the plain-data '
        'layout (`src/30-ql-layout.js`) and rules (`src/31-ql-rules.js`). Every building is counted once: overview sheets mark '
        'buildings detailed on a closer sheet as `see` (`Q0 -> Q1/Q3`, `Q1 -> Q2/Q3`). Keys come from `kits/catalog` '
        '(`khaayken_poor_*`, `khaayken_common_*`, `khaayken_court_*`), captured Eternian war-loot (`eternian_common_chest`, '
        '`eternian_court_alabaster_lamp`, `eternian_court_visor_case`, per `kits/yeti/src/45-yt-inside.js` `YT_LOOT_N`), and '
        '`generic_*` supplies; **NEW** marks Khaayken-specific pieces not yet in `kits/catalog`.\n'
    )
    B.main(
        floors=FLOORS,
        out=OUT,
        here=HERE,
        title='# Qoold Lheek (the Yeti Capital): furniture & works manifest\n',
        intro=intro,
        section=draw_section,
        zone_R=999,
    )


if __name__ == '__main__':
    main()
