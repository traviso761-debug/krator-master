#!/usr/bin/env python3
"""Grēṭ-Āil, the head monastery of the Order of the Azure Dream: the blueprint. Sheets and the manifest come from
settlements/voth/palace/blueprint.py, with Longsong's Xanadu key map and room programmes (settlements/longsong).

Frame: the page's (src/89zaa-ad-ground.js). The origin is the cove's head on the 1:1 waterline at the scarp's toe, scale-model
px 846.075, 1508.493; u runs due north, inland and uphill toward the isle's crest; v runs east along the shore, drawn up on the
sheet. Metres. Sheets G, W and S and the section are drawn from what the built pages placed (export_records.py writes
floors/page-isle.json and floors/page-summit.json): a room's rectangle is its records' footprint, the lake is the 1:1 ground
under the lake's level, the terraces, walls and ways are the page's. A room the page does not hold yet is listed on its sheet.
H1 and H2 draw the Hall of Dreaming in its own frame, as its builder (src/89qa-ad-hall.js) does.

    python3 build.py && python3 export_records.py   # the pages, then their records
    python3 azure_blueprint.py        # writes floors/*.png and FURNITURE.md next to this file
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'voth', 'palace'))
sys.path.insert(0, os.path.join(HERE, '..', 'longsong'))
import blueprint as B
from blueprint import R, C
import longsong_blueprint as LS
from PIL import Image, ImageDraw

OUT = os.path.join(HERE, 'floors')
WATER = (186, 214, 236)
FLOORS = []

# ------------------------------------------------------------------------------------------------ the page's records
# The sheets are drawn from what the pages placed (export_records.py writes floors/page-<target>.json from the built pages):
# each room's rectangle is the footprint of the record(s) it stands for, turned, in the plan's frame (u = -z uphill, v = x
# east); the lake is the 1:1 ground under the lake's level; the precinct's wall, the terraces and the ways are the page's.
# A room the page does not hold yet is listed on its sheet (MISSING) instead of drawn.
import json, math
def _page(t):
    with open(os.path.join(OUT, 'page-%s.json' % t), encoding='utf-8') as fh:
        return json.load(fh)
PAGE = {t: _page(t) for t in ('isle', 'summit')}
MISSING = {}
LEN_Z = {'qb_ad_mole', 'qb_ad_jetty'}          # built along their local z, o.len long
LEN_X = {'qb_ad_ropewalk', 'qb_wall'}          # along their local x

def _foot(p):
    w, d = p['w'], p['d']
    if p.get('len') is not None and p['key'] in LEN_Z: d = p['len']
    if p.get('len') is not None and p['key'] in LEN_X: w = p['len']
    c, s, hw, hd = math.cos(p['ry']), math.sin(p['ry']), w / 2, d / 2
    return [(-(p['z'] - a * s + b * c), p['x'] + a * c + b * s) for a, b in ((-hw, -hd), (hw, -hd), (hw, hd), (-hw, hd))]

def pick(t, sel):
    out = []
    for p in PAGE[t]['places']:
        if any((s.endswith('*') and p['id'].startswith(s[:-1])) or p['id'] == s for s in sel):
            out.append(p)
    return out

def box(ps):
    pts = [q for p in ps for q in _foot(p)]
    return min(u for u, v in pts), max(u for u, v in pts), min(v for u, v in pts), max(v for u, v in pts)

def RP(sheet, t, n, name, kind, sel, decor, note='', ref=None, part=None):
    """a room drawn where the page placed it: the box round its records' footprints (part(u0, u1, v0, v1) takes a share)"""
    ps = pick(t, sel)
    if not ps:
        MISSING.setdefault(sheet, []).append(name); return None
    q = box(ps)
    if part: q = part(*q)
    d = R(n, name, kind, round(q[0], 1), round(q[1], 1), round(q[2], 1), round(q[3], 1), decor, note)
    if ref: d['ref'] = ref
    return d

def RW(sheet, t, n, name, kind, test, decor, note=''):
    """a room on a way of the page (its points' box, widened by its width)"""
    for w in PAGE[t]['ways']:
        if test(w):
            us = [-z for x, z in w['pts']]; vs = [x for x, z in w['pts']]
            return R(n, name, kind, round(min(us) - w['w'] / 2, 1), round(max(us) + w['w'] / 2, 1), round(min(vs) - w['w'] / 2, 1), round(max(vs) + w['w'] / 2, 1), decor, note)
    MISSING.setdefault(sheet, []).append(name); return None

def RPad(sheet, t, n, name, kind, pid, decor, note=''):
    for p in PAGE[t]['pads']:
        if p['id'] == pid:
            return R(n, name, kind, round(-p['z1'], 1), round(-p['z0'], 1), round(p['x0'], 1), round(p['x1'], 1), decor, note)
    MISSING.setdefault(sheet, []).append(name); return None

def lake(t, rect):
    """the lake's cells (runs of 8 m along x) in (u, v), clipped to the sheet's rect: draw_floor paints them under the rooms"""
    P, c, out = PAGE[t], PAGE[t]['cell'], []
    for z, x0, x1 in P['water']:
        u0, u1, v0, v1 = max(-(z + c), rect[0]), min(-z, rect[1]), max(x0, rect[2]), min(x1, rect[3])
        if u1 > u0 and v1 > v0: out.append([(u0, v0), (u1, v0), (u1, v1), (u0, v1)])
    return out

def walls(t):
    out = []
    for p in PAGE[t]['places']:
        if p['key'] == 'qb_wall':
            c, s, L = math.cos(p['ry']), math.sin(p['ry']), p['len'] / 2
            out.append(([(-(p['z'] - a * s), p['x'] + a * c) for a in (-L, L)], (70, 70, 90), 5))
    return out

def _clip(a, b, r):
    """the part of segment a-b inside rect r (u0, u1, v0, v1), or None (Liang-Barsky)"""
    t0, t1, du, dv = 0.0, 1.0, b[0] - a[0], b[1] - a[1]
    for p, q in ((-du, a[0] - r[0]), (du, r[1] - a[0]), (-dv, a[1] - r[2]), (dv, r[3] - a[1])):
        if p == 0:
            if q < 0: return None
            continue
        t = q / p
        if p < 0: t0 = max(t0, t)
        else: t1 = min(t1, t)
        if t0 > t1: return None
    return [(a[0] + du * t0, a[1] + dv * t0), (a[0] + du * t1, a[1] + dv * t1)]

def ways(t, kinds, colour, width, rect):
    """the page's ways of those kinds as lines, each segment clipped to the sheet's rect"""
    out = []
    for w in PAGE[t]['ways']:
        if w['kind'] not in kinds: continue
        P = [(-z, x) for x, z in w['pts']]
        for a, b in zip(P, P[1:]):
            s = _clip(a, b, rect)
            if s: out.append((s, colour, width))
    return out

def terraces(t, prefixes):
    return [(round(-p['z1'], 1), round(-p['z0'], 1), round(p['x0'], 1), round(p['x1'], 1), '%s +%g' % (p['id'].split(':', 1)[1], p['y']))
            for p in PAGE[t]['pads'] if any(p['id'].startswith(x) for x in prefixes)]

ISLE = PAGE['isle']
FRAME = 'scale-model px %.3f, %.3f' % tuple(ISLE['px'])

# ---- G the grounds: the cove, the lower ward, the stair, the orchards and the upper precinct
G_RECT = (-80, 640, -330, 330)
FLOORS.append(dict(id='G', tier=0, R=368, rect=G_RECT,
  title='Sheet G: Grēṭ-Āil, the grounds (the cove facing Erehwon to the Hall of Dreaming)',
  sub='Drawn from the page (floors/page-isle.json, export_records.py): the cove\'s head on the 1:1 waterline at the scarp\'s toe; u uphill (right), v along the isle, its east tip up. The wharf in the cove: the mole and the Lustral Steps on the west, the fishermonks\' jetties, beach, boathouse and racks on the east. The lower ward on the drowned flat\'s dry edge under the scarp; the Stair of Lowered Eyes zigzags up the scarp\'s face between the terraced orchards and their bee walls; the walled upper precinct on four terraces above it: the Blue Gate and the court, the great monastery in the blue dress, the cells, the Lotus Garden, and the Hall of Dreaming wrapped in its kora. The Dream Road leaves the back gate for the summit (sheet S) past the relay lamp, 1 km up.',
  axisnote='u -> north, uphill from the cove\'s head (%s); v up = east along the shore; the lake at the left' % FRAME,
  outlines=terraces('isle', ('terrace:', 'orchard:')),
  lines=walls('isle') + ways('isle', ('way',), (120, 80, 30), 4, G_RECT),
  lake=lake('isle', G_RECT),
  rooms=[r for r in [
    # the wharf (sheet W draws it closer)
    RP('G', 'isle', 1, 'The Mole and the Barge Berth', 'quay', ['mole'], 1, 'a stone mole into the cove; the Order\'s ferry barge from Erehwon lies along it', ref='W', part=lambda u0, u1, v0, v1: (u0 + 8, u1, v0, v1)),
    RP('G', 'isle', 2, 'Wave-wheel Shrine', 'wave_shrine', ['mole'], 2, 'at the mole\'s head: a prayer wheel turned by the lake\'s swell; its lamp is the cove\'s light', ref='W', part=lambda u0, u1, v0, v1: (u0, u0 + 8, v0, v1)),
    RP('G', 'isle', 3, 'The Lustral Steps', 'ghat', ['lustral-steps'], 2, 'the pilgrims\' landing ghat: every arrival bathes before going up', ref='W'),
    RP('G', 'isle', 4, 'Threshold Chorten', 'chorten', ['threshold-chorten'], 3, 'at the mole\'s foot: the first chorten, the first circuit', ref='W'),
    RP('G', 'isle', 5, 'Ferry House', 'ferry_house', ['ferry-house'], 1, 'the porters and boatmen; the waiting hall; the list of tonight\'s sleepers', ref='W'),
    RP('G', 'isle', 6, 'Jetty of the Night Boats', 'jetty', ['jetty:0'], 1, ref='W'),
    RP('G', 'isle', 7, 'Jetty of the Line Boats', 'jetty', ['jetty:1'], 1, ref='W'),
    RP('G', 'isle', 8, 'Jetty of the Net Boats', 'jetty', ['jetty:2'], 1, ref='W'),
    RP('G', 'isle', 9, 'Dugout Beach', 'beach', ['dugout:beach:*'], 1, ref='W'),
    RP('G', 'isle', 10, 'Boathouse', 'boathouse', ['boathouse'], 1, ref='W'),
    RP('G', 'isle', 11, 'Net Racks', 'net_racks', ['net-racks'], 1, ref='W'),
    RP('G', 'isle', 12, 'Fish-drying Racks', 'fish_racks', ['fish-racks'], 1, ref='W'),
    RP('G', 'isle', 13, 'Smokehouses', 'smokehouse', ['smokehouse:*'], 1, ref='W'),
    RP('G', 'isle', 14, 'Net Loft and Fish Store', 'net_loft', ['net-loft'], 1, ref='W'),
    RP('G', 'isle', 15, 'Ropewalk', 'ropewalk', ['ropewalk'], 1, ref='W'),
    RP('G', 'isle', 16, 'Boatwrights\' Yard', 'workshop', ['boatwrights:*'], 1, ref='W'),
    RP('G', 'isle', 17, 'Fishermonks\' House', 'fishermonks_house', ['fishermonks'], 2, 'the fifty fishermonks keep night hours, so they live by their boats, below the hill and far from the sleepers', ref='W'),
    # the lower ward
    RW('G', 'isle', 18, 'The Lower Way', 'passage', lambda w: w['kind'] == 'way' and w['w'] == 8, 2, 'the processional way from the mole to the stair\'s foot'),
    RP('G', 'isle', 19, 'Pilgrims\' Hostel (the men\'s range)', 'hostel', ['hostel:men:*'], 1, 'qb_hostel; the pilgrims wait here a day, fasting on honey and milk'),
    RP('G', 'isle', 20, 'Pilgrims\' Hostel (the women\'s range)', 'hostel', ['hostel:women:*'], 1, 'qb_hostel; the festival overflow and the families'),
    RP('G', 'isle', 21, 'Hall of Fasting', 'fast_hall', ['hall-of-fasting'], 2, 'the pilgrims\' refectory the day before the night: honey and milk only; the dream-keepers give each pilgrim a turning (the grammarians\' college stands in)'),
    RP('G', 'isle', 22, 'Waiting Garden', 'garden', ['waiting-garden'], 2, 'the pilgrims\' talk stays below the stair'),
    RP('G', 'isle', 23, 'Lay Servants\' Houses', 'dormitory', ['lay:*'], 0, 'the Order\'s lay families'),
    RP('G', 'isle', 24, 'Granary and Stores', 'store', ['granary'], 0, 'grain from the isle\'s terraces and from Erehwon; lamp oil; incense'),
    RP('G', 'isle', 25, 'Dairy', 'dairy', ['dairy:*'], 1, 'the milk of the sacrament (two workshops stand in)'),
    RP('G', 'isle', 26, 'Lower Gate', 'entrance', ['lower-gate'], 2, 'the gate temple at the stair\'s foot; past it, eyes lowered and no talk'),
    # the scarp
    RP('G', 'isle', 27, 'Stair of Lowered Eyes', 'stair', ['stair:*'], 3, 'a zigzag up the scarp\'s face in six runs, a landing at each turn'),
    RP('G', 'isle', 30, 'Terraced Orchards (west)', 'garden', ['orchard:west:*'], 2, 'two terraces: the Vale apricot below, the Frost persimmon above (kits/crops)'),
    RP('G', 'isle', 31, 'Terraced Orchards (east)', 'garden', ['orchard:east:*'], 2, 'the same, east of the stair'),
    RP('G', 'isle', 32, 'Apiary (east)', 'apiary', ['bee-wall:east:*'], 1, 'the bee walls: clay hives in niches against the upper terrace\'s face (the honey of the sacrament)'),
    RP('G', 'isle', 54, 'Apiary (west)', 'apiary', ['bee-wall:west:*'], 1),
    # the upper precinct
    RP('G', 'isle', 33, 'The Blue Gate', 'entrance', ['blue-gate'], 3, 'the gate temple in the blue dress, the bell and drum in its towers: the precinct\'s only bells'),
    RPad('G', 'isle', 34, 'Court of Arrival', 'court', 'terrace:court', 2, 'the Order\'s chorten in the middle; the pilgrims circle it once and are counted in'),
    RP('G', 'isle', 35, 'The Great Monastery (blue dress)', 'monastery_core', ['great-monastery'], 4, 'qb_monastery v5, as in Qiblai: the Assembly Hall at the court\'s head; the Order\'s chapter meets here'),
    RP('G', 'isle', 36, 'The Prismarch\'s House', 'abbot_house', ['prismarch-house'], 3, 'the abbot\'s house; the Prismarch is in Qiblai half the year, when the Prior keeps it'),
    RP('G', 'isle', 37, 'Prior\'s and Officers\' Houses', 'office', ['prior-house:*'], 2, 'the Prior, the Cellarer, the Master of the Wharf, the Master of the Hall'),
    RP('G', 'isle', 38, 'Novices\' College', 'school', ['novices-college'], 2, 'forty novices; the sound-grid script and the Song by heart'),
    RP('G', 'isle', 39, 'Refectory and Kitchen', 'refectory', ['refectory'], 1, 'one meal at noon, one at dusk (a pilgrims\' hostel stands in)'),
    RP('G', 'isle', 40, 'Monks\' Cells (west range)', 'cells', ['cells:west:*'], 1, 'in two storeys, stepping with the terraces'),
    RP('G', 'isle', 41, 'Monks\' Cells (east range)', 'cells', ['cells:east:*'], 1),
    RP('G', 'isle', 42, 'The Lotus Garden', 'garden', ['lotus-garden:*', 'lotus-pond:*'], 3, 'the Garden of Lowered Voices: blue lotus in four still ponds; the last talk allowed before the hall'),
    RP('G', 'isle', 43, 'Lustral Bath', 'bath', ['lustral-bath'], 2, 'the sleepers\' bath at dusk', ref='H1'),
    RP('G', 'isle', 44, 'The Cup House', 'cup_house', ['cup-house'], 2, 'the dream cup: honey, milk and steeped blue lotus', ref='H1'),
    RP('G', 'isle', 45, 'Kora Gallery of the Hall', 'kora', ['hall-of-dreaming'], 3, 'the covered prayer-wheel gallery round the hall; its wheels are braked at the Lulling (sheet H1)', ref='H1'),
    RP('G', 'isle', 46, 'The Hall of Dreaming', 'dream_hall_ext', ['hall-of-dreaming'], 4, 'two hundred and fifty-six cots under one roof (sheets H1, H2)', ref='H1',
       part=lambda u0, u1, v0, v1: ((u0 + u1) / 2 - 29, (u0 + u1) / 2 + 29, (v0 + v1) / 2 - 16.2, (v0 + v1) / 2 + 16.2)),
    RP('G', 'isle', 47, 'The Waking Gallery', 'waking_booths', ['waking-range'], 3, 'sixteen booths: the dream told to a scribe before the dreamer speaks to anyone', ref='H1', part=lambda u0, u1, v0, v1: (u0, (u0 + u1) / 2, v0, v1)),
    RP('G', 'isle', 48, 'The Register', 'register', ['waking-range'], 3, 'the archive of dreams in the sound-grid script, shelved by year and turning', ref='H1', part=lambda u0, u1, v0, v1: ((u0 + u1) / 2, u1, v0, v1)),
    RP('G', 'isle', 49, 'Readers\' Court', 'court', ['readers-court'], 2, 'the readers meet the dreamers here in the afternoon'),
    RP('G', 'isle', 50, 'Dream-keepers\' House', 'cells', ['dream-keepers-house'], 2, 'thirty keepers, scribes and readers: they sleep by day'),
    RP('G', 'isle', 51, 'Cells of the Seven Nights', 'long_sleep', ['seven-nights:*'], 2, 'for the pilgrims who sleep a week in the hall; the sick the White Lily sends', ref='H1'),
  ] if r]))
MISSING.setdefault('G', []).extend(['Prayer-wheel Rows by the stair', 'The Quiet Walk', 'Kitchen Terraces of the Precinct'])

# ---- W the wharf, closer
W_RECT = (-70, 150, -90, 220)
FLOORS.append(dict(id='W', tier=0, R=128, rect=W_RECT,
  title='Sheet W: the fishermonks\' wharf',
  sub='Drawn from the page (floors/page-isle.json). The cove faces Erehwon across 20 km of water. The barge berth and the Lustral Steps on the west; three jetties, the dugout beach, the boathouse, the racks, the smokehouses, the ropewalk and the fishermonks\' own house on the east. The fishermonks fish the lake from dugouts with nets and lines, and by night with lamps: from the Hall of Dreaming\'s terrace the night fleet is a second, lower sky.',
  axisnote='u -> uphill from the cove\'s head (%s); v up = toward the isle\'s east tip; the lake at the left' % FRAME,
  lines=ways('isle', ('way', 'wharf'), (120, 80, 30), 4, W_RECT),
  lake=lake('isle', W_RECT),
  rooms=[r for r in [
    RP('W', 'isle', 1, 'The Mole and the Barge Berth', 'quay', ['mole'], 1, 'the barge, 22 m, lateen sail and eight oars, forty pilgrims; dugouts never use this side', part=lambda u0, u1, v0, v1: (u0 + 8, u1, v0, v1)),
    RP('W', 'isle', 2, 'Wave-wheel Shrine', 'wave_shrine', ['mole'], 2, 'the wheel turns with the swell: on a still night it stops, and the fishermonks say the lake is dreaming', part=lambda u0, u1, v0, v1: (u0, u0 + 8, v0, v1)),
    RP('W', 'isle', 3, 'The Lustral Steps', 'ghat', ['lustral-steps'], 2, 'men to the north half, women to the south, a screen between'),
    RP('W', 'isle', 4, 'Threshold Chorten', 'chorten', ['threshold-chorten'], 3),
    RP('W', 'isle', 5, 'Ferry House', 'ferry_house', ['ferry-house'], 1),
    RP('W', 'isle', 6, 'Jetty of the Night Boats', 'jetty', ['jetty:0'], 1, 'each boat\'s lamp hangs on its post by day'),
    RP('W', 'isle', 7, 'Jetty of the Line Boats', 'jetty', ['jetty:1'], 1),
    RP('W', 'isle', 8, 'Jetty of the Net Boats', 'jetty', ['jetty:2'], 1),
    RP('W', 'isle', 9, 'Dugout Beach', 'beach', ['dugout:beach:*'], 1, 'the dugouts drawn up in rows'),
    RP('W', 'isle', 10, 'Boathouse', 'boathouse', ['boathouse'], 1, 'its slips; the loft above for sails and paddles'),
    RP('W', 'isle', 11, 'Net Racks', 'net_racks', ['net-racks'], 1),
    RP('W', 'isle', 12, 'Fish-drying Racks', 'fish_racks', ['fish-racks'], 1),
    RP('W', 'isle', 13, 'Smokehouses', 'smokehouse', ['smokehouse:*'], 1),
    RP('W', 'isle', 14, 'Net Loft and Fish Store', 'net_loft', ['net-loft'], 1),
    RP('W', 'isle', 15, 'Ropewalk', 'ropewalk', ['ropewalk'], 1),
    RP('W', 'isle', 16, 'Boatwrights\' Yard', 'workshop', ['boatwrights:*'], 1),
    RP('W', 'isle', 17, 'Fishermonks\' House: cells', 'cells', ['fishermonks'], 1, 'fifty cells round a court', part=lambda u0, u1, v0, v1: (u0, u1, (v0 + v1) / 2, v1)),
    RP('W', 'isle', 18, 'Fishermonks\' House: refectory and chapel', 'fishermonks_house', ['fishermonks'], 2, 'they eat at dawn when the boats come in; the chapel\'s wheel is a lake-wheel too', part=lambda u0, u1, v0, v1: (u0, u1, v0, (v0 + v1) / 2)),
    RW('W', 'isle', 19, 'The Lower Way', 'passage', lambda w: w['kind'] == 'way' and w['w'] == 8, 2),
  ] if r]))

# ---- H1 the Hall of Dreaming, the sleepers' floor (its own frame: u from the foot, v across)
PILLARS = [(u, v) for u in range(9, 58, 3) for v in (-12, -9, -6, -3, 3, 6, 9, 12)]
TURN = []
for side, sgn in (('east', 1), ('west', -1)):
    for k in range(4):
        u0 = 9 + 12 * k if sgn > 0 else 45 - 12 * k
        n = k + 1 if sgn > 0 else k + 5
        v0, v1 = (3, 15) if sgn > 0 else (-15, -3)
        TURN.append(R(5 + n, 'Turning %d (%s)' % (n, ['the Decree', 'the Garden', 'the Chasm', 'the Fountain', 'the Dome and the Caves', 'the Damsel', 'the Song Revived', 'the Circle Thrice'][n - 1]),
                      'dream_turning', u0, u0 + 12, v0, v1, 3, ('the women\'s side: ' if sgn > 0 else 'the men\'s side: ') + '32 cots, two to a bay, heads to the outer wall; a low painted screen at each end'))
FLOORS.append(dict(id='H1', tier=0, R=83, rect=(-50, 76, -76, 80),
  title='Sheet H1: the Hall of Dreaming, the sleepers\' floor',
  sub='A Tibetan pillared hall (a dukhang) 54 x 30 m inside, on a 3 m grid: 18 bays long, 10 across. Two bays down the middle are the Keepers\' Walk under the clerestory; four bays either side hold the cots, two to a bay, 256 in all, in eight turnings of 32 named for the Song\'s eight turnings, read round the hall clockwise from the foot: the east side (1-4) the women\'s, the west (5-8) the men\'s, a low lattice down the walk between them. The Damsel\'s shrine and the Lulling dais at the head; the Porlock Screen at the foot. Round the hall, the covered kora with its wheels. West of the foot, the waking way: the Waking Gallery\'s sixteen booths and the Register. East, the sleepers\' way in: the Lustral Bath and the Cup House.',
  axisnote='u -> from the hall\'s foot (the door) to its head (the shrine); v across; the Lotus Garden to the left, the Quiet Walk to the right',
  outlines=[(4, 62, -16.2, 16.2, 'the hall\'s walls (1.2 m, felt-lined)'), (0, 66, -21, 21, '')],
  pillars=PILLARS,
  rooms=[
    R(1, 'Kora Gallery (foot)', 'kora', 0, 4, -21, 21, 3, 'the gallery crosses the foot; the hall\'s one door opens off it'),
    R(2, 'Kora Gallery (east side)', 'kora', 4, 62, 16.2, 21, 3, 'an arcade on the court side, the wheels on the hall side: 48 wheels each long side'),
    R(3, 'Kora Gallery (west side)', 'kora', 4, 62, -21, -16.2, 3),
    R(4, 'Kora Gallery (head)', 'kora', 62, 66, -21, 21, 3, 'behind the shrine: the great wheel of the hall, the last one braked at the Lulling and the first freed at dawn'),
    R(5, 'Porlock Screen', 'porlock', 4, 9, -3, 3, 3, 'the door and two felt curtains 2 m apart: no light and no sound passes. The keeper of the door sits inside it all night; no one enters after the Lulling, and no one is ever woken'),
    *TURN,
    R(14, 'Keepers\' Walk', 'dream_nave', 9, 57, -3, 3, 4, 'felt runner on a timber floor; the azure lamps in floor niches every 3 m, blue glass over butter lamps; three censers burning lotus resin and juniper until the first watch'),
    R(15, 'Foot Bay (keepers\' station)', 'keepers', 4, 9, -15, -3, 2, 'the senior keeper\'s seat and the wax-tablet racks: words spoken in sleep are taken down at the cot'),
    R(16, 'Foot Bay (lamp and blanket store)', 'store', 4, 9, 3, 15, 1, 'blankets, bolsters, the keepers\' hooded lamps, spare reed mats'),
    R(17, 'Head Bay: the Lulling Dais', 'lulling', 57, 60, -15, 15, 4, 'at dusk one keeper plays the first turning on the dulcimer, then the wheels are braked and the hall is still'),
    R(18, 'The Damsel\'s Shrine', 'damsel_shrine', 60, 64, -8, 8, 4, 'the gilt image of the Damsel with her dulcimer; the one lamp in the hall that is gold, never put out'),
    R(19, 'Keepers\' Rest', 'keepers', 60, 62, -15, -8, 1, 'a bench and water between watches'),
    R(20, 'Shutter Stair', 'stair', 60, 62, 8, 15, 1, 'up to the clerestory catwalk (sheet H2)'),
    # the waking way (west)
    R(21, 'Waking Door', 'passage', 4, 9, -16.2, -15, 2, 'the wakers leave by the west door at the foot, never back through the hall'),
    R(22, 'The Waking Gallery', 'waking_booths', -2, 38, -56, -26, 3, 'sixteen booths, eight a side of a felt-floored passage (the women\'s side and the men\'s): a scribe at a desk behind a screen, the dreamer on a cushion; the dream is told before any other word is spoken'),
    R(23, 'Scribes\' Room', 'scriptorium', -26, -2, -56, -26, 2, 'the night\'s tablets copied fair into the sound-grid script'),
    R(24, 'The Register', 'register', -48, -26, -74, -26, 3, 'the bound books of dreams by year and turning; the readers\' index of dreams that sound the Song'),
    R(25, 'Readers\' Room', 'reading_room', 8, 38, -74, -58, 3, 'where a dream is read with its dreamer in the afternoon'),
    # the sleepers' way in (east)
    R(26, 'Lustral Bath', 'bath', 0, 24, 26, 58, 2, 'the dusk bath in two halves, the women\'s and the men\'s; warm water from the kitchen\'s boilers'),
    R(27, 'Robing Room', 'robing', 26, 40, 26, 46, 1, 'in two halves: the sleepers leave their clothes and take the blue sleeping robe'),
    R(28, 'The Cup House', 'cup_house', 42, 66, 26, 52, 2, 'honey, milk and steeped blue lotus, poured from one silver jug; the keepers note each cup'),
    R(29, 'Cells of the Seven Nights', 'long_sleep', 42, 76, 54, 78, 2, 'eight cells for the long sleepers, a keeper\'s cell among them'),
    R(30, 'The Lotus Garden', 'garden', -50, -14, -24, 24, 3, 'the hall\'s foot faces it; no talk past its last pond'),
  ]))

# ---- H2 the Hall of Dreaming's upper works
FLOORS.append(dict(id='H2', tier=1, R=83, rect=(-50, 76, -76, 80),
  title='Sheet H2: the Hall of Dreaming, upper works (+4 m to +12 m)',
  sub='The cot bays are roofed at +7 m under a ceiling painted as the night: deep blue, gold stars, and over the Keepers\' Walk the Wheel drawn whole (the Station as it was). The two middle bays rise to a clerestory at +12 m, its windows closed by the Station Shutters: on the nights the Station crosses, the keepers open them from the catwalk and its light falls down the walk. The Foot Gallery at +4 m looks the hall\'s length; the hall\'s blue glow through the clerestory is what Erehwon sees of Grēṭ-Āil at night.',
  axisnote='u -> from the foot to the head; v across',
  outlines=[(4, 62, -16.2, 16.2, 'the walls'), (9, 57, -15, 15, 'the painted ceiling at +7 m')],
  pillars=[(u, v) for u in range(9, 58, 3) for v in (-3, 3)],
  rooms=[
    R(1, 'Foot Gallery', 'keepers', 4, 9, -15, 15, 2, 'at +4 m over the foot bays: the Master of the Hall watches the hall\'s length from here; reached by a stair in the keepers\' station'),
    R(2, 'Clerestory over the Walk', 'void', 9, 57, -3, 3, 3, 'open from the floor to +12 m'),
    R(3, 'Shutter Catwalk (east)', 'passage', 9, 57, 3, 4.2, 1, 'a timber walk at +9 m along the clerestory\'s foot'),
    R(4, 'Shutter Catwalk (west)', 'passage', 9, 57, -4.2, -3, 1),
    R(5, 'Ceiling over the East Turnings', 'roof', 9, 57, 4.2, 15, 3, 'the painted night at +7 m; the roof terrace above it'),
    R(6, 'Ceiling over the West Turnings', 'roof', 9, 57, -15, -4.2, 3),
    R(7, 'Bell-less Lantern', 'lantern_room', 57, 64, -8, 8, 3, 'over the shrine: the gilt crown of the hall (one of the few gilt roofs on the isle), with the Damsel\'s Lamp seen through its lattice'),
    R(8, 'Keepers\' Loft', 'keepers', 57, 62, 8, 15, 1, 'the shutter poles and the spare lamps; the head of the shutter stair'),
    R(9, 'Register Upper Stacks', 'register', -48, -26, -74, -26, 2, 'the older books'),
    R(10, 'Scribes\' Dormitory', 'dormitory', -26, 38, -56, -26, 1, 'over the Waking Gallery: the scribes sleep by day, above the booths'),
  ]))

# ---- S the summit and the High Kora, drawn from the summit's page (floors/page-summit.json)
SUM = PAGE['summit']
def _centre(t, pid):
    p = pick(t, [pid])
    return (-p[0]['z'], p[0]['x'], p[0]) if p else None
_sc = _centre('summit', 'summit-chorten')
FLOORS.append(dict(id='S', tier=0, R=300, rect=(-300, 300, -300, 300), circle=False,
  title='Sheet S: the summit of Grēṭ-Āil and the High Kora',
  sub='Drawn from the page (floors/page-summit.json). The crest of the isle\'s dome at 1:1, +308 m over the lake, 8 km up the Dream Road from the monastery\'s back gate (the road\'s line runs off the sheet toward the bottom left: south-south-east). The High Kora rings the summit 260 m out (1.6 km round) with sixteen wheel houses on its inner side, the road meeting it between two of them by its chorten; the pilgrims walk it on the Station\'s nights. The Station Watch keeps the sky; its signal lamp is answered by the relay lamp on the shoulder above the monastery, which the dome hides from here. The Summit Chorten, twice the kit\'s large one, bears the isle\'s gilt crown.',
  axisnote='u -> north (scale-model px %.2f, %.2f at the centre); v up = east' % tuple(SUM['px']),
  lines=ways('summit', ('kora',), (60, 90, 170), 6, (-300, 300, -300, 300)) + ways('summit', ('way',), (120, 80, 30), 4, (-300, 300, -300, 300)),
  rooms=[r for r in [
    C(1, 'Summit Chorten', 'chorten', round(_sc[0], 1), round(_sc[1], 1), round(max(_sc[2]['w'], _sc[2]['d']) / 2, 1), 4, 'qb_chorten (large) at twice its size, about 40 m to the gilt crown') if _sc else None,
    RP('S', 'summit', 2, 'Wheel House of the Summit', 'wheel_house', ['great-wheel'], 3, 'the great wheel of the isle, turned by pilgrims in a ring (qb_great_wheel)'),
    RP('S', 'summit', 3, 'The Station Watch', 'astronomers', ['station-watch'], 2, 'four monks keep the Station\'s passes; the signal lamp on its tower (qb_ad_station_watch)'),
    RP('S', 'summit', 4, 'Pilgrims\' Shelter', 'hostel', ['pilgrims-shelter'], 1, 'for the nights of the Station: the High Kora is walked three times before dawn'),
    RP('S', 'summit', 5, 'Dream Road Chorten (the eighth)', 'chorten', ['road-chorten'], 2, 'where the Dream Road meets the kora'),
  ] + [RP('S', 'summit', 6 + i, 'Wheel House %d' % (i + 1), 'wheel_house', ['wheel-house:%d' % i], 2, 'qb_wheel_house, open onto the kora' if i == 0 else '') for i in range(16)] if r]))

# ------------------------------------------------------------------------------------------------ the Xanadu keys
AD_NEW = {
  'xanadu_common_dream_cot': 'the dream cot: a low timber frame 0.8 x 1.95 m, a reed (tul) mat, a blue wool blanket and a round bolster, the turning\'s syllable painted on the foot rail',
  'xanadu_common_azure_lamp': 'an azure lamp: a butter lamp under blue glass in a floor niche with a pierced brass cover (the Keepers\' Walk)',
  'xanadu_common_keeper_lamp': 'a keeper\'s hooded lamp: a brass lantern shaded to throw light only downward, on a hook or carried',
  'xanadu_common_censer_stand': 'a standing censer on a tripod, lidded, for lotus resin and juniper',
  'xanadu_common_turning_screen': 'a low painted screen (1.2 m) marking a turning\'s end, its number in the sound-grid script',
  'xanadu_common_tablet_rack': 'a rack of wax tablets and styluses for the words spoken in sleep',
  'xanadu_court_lulling_dais': 'the Lulling dais: a low lacquer platform, a cushion and the dulcimer (ḍalsimar) on its stand',
  'xanadu_court_damsel_image': 'the gilt image of the Damsel with her dulcimer, on a lotus throne, under a canopy',
  'xanadu_common_waking_booth': 'a waking booth: a scribe\'s low desk and inkstone behind a lattice screen, a cushion for the dreamer, a blue thread to tie on the wrist',
  'xanadu_common_register_press': 'a register press: a cupboard of bound dream books by year and turning, its doors lettered',
  'xanadu_common_cup_table': 'the cup table: a silver jug, a honey jar, a milk pail and the lotus steeping bowl; a tray of small cups',
  'xanadu_common_robe_rack': 'a pegged rack of blue sleeping robes',
  'xanadu_common_net_rack': 'an outdoor net rack: pole frames 3 m apart with nets hung over the top rail (the port kit\'s hbNetRack is the form)',
  'xanadu_common_fish_rack': 'an outdoor fish rack: two A-frames and rails, split fish hung by the tail',
  'xanadu_common_smoke_rack': 'a smokehouse rack: tiers of slatted trays over a fire pit',
  'xanadu_common_paddle_rack': 'a paddle rack: paddles stood on end in a timber frame, a lamp pole beside',
  'xanadu_common_creel': 'a fish creel and a stack of baskets',
  'xanadu_common_rope_walk_post': 'a ropewalk post: a T-post carrying the strands, every 6 m down the walk',
  'xanadu_common_wave_wheel': 'a wave wheel: a prayer wheel on a post at the mole head, turned by a paddle in the water',
  'xanadu_common_dugout': 'a dugout canoe hauled out on two chocks (the Iziz Vernacular\'s vldDugout is the form)',
  'xanadu_common_hive_wall': 'a bee wall: hive niches in a terrace wall',
}
def ad_programs():
    cs = lambda n: max(1, round(n))
    return {
      'dream_turning': lambda a, w, d, D: [('xanadu_common_dream_cot', 32), ('xanadu_common_turning_screen', 2), ('xanadu_common_prayer_wheels', 0)],
      'dream_nave': lambda a, w, d, D: [('xanadu_common_azure_lamp', 16), ('xanadu_common_censer_stand', 3), ('xanadu_common_skylight_column', 0)],
      'porlock': lambda a, w, d, D: [('xanadu_common_meditation_cushion', 1), ('xanadu_common_keeper_lamp', 1)],
      'keepers': lambda a, w, d, D: [('xanadu_common_tablet_rack', cs(a / 20)), ('xanadu_common_bench', cs(a / 30)), ('xanadu_common_keeper_lamp', cs(a / 15))],
      'lulling': lambda a, w, d, D: [('xanadu_court_lulling_dais', 1), ('xanadu_court_incense_burner', 2), ('xanadu_court_carpet', 1)],
      'damsel_shrine': lambda a, w, d, D: [('xanadu_court_damsel_image', 1), ('xanadu_court_altar', 1), ('xanadu_common_butter_lamp_rack', 2)],
      'waking_booths': lambda a, w, d, D: [('xanadu_common_waking_booth', 16), ('xanadu_common_keeper_lamp', 4)],
      'register': lambda a, w, d, D: [('xanadu_common_register_press', cs(a / 12)), ('xanadu_common_scroll_rack', cs(a / 60)), ('order_reading_table', 1), ('xanadu_common_lamp', cs(a / 60))],
      'cup_house': lambda a, w, d, D: [('xanadu_common_cup_table', 1), ('xanadu_common_bench', cs(a / 40)), ('xanadu_common_store', 2)],
      'long_sleep': lambda a, w, d, D: [('xanadu_common_dream_cot', 8), ('xanadu_common_chest', 8), ('xanadu_common_keeper_lamp', 2)],
      'dream_hall_ext': lambda a, w, d, D: [], 'monastery_core': lambda a, w, d, D: [],
      'abbot_house': lambda a, w, d, D: [('xanadu_court_bed', 1), ('xanadu_court_desk', 2), ('xanadu_court_throne', 1), ('xanadu_court_bookcase', 3), ('xanadu_court_altar', 1), ('xanadu_common_chair', 8), ('xanadu_court_table', 1)],
      'refectory': lambda a, w, d, D: [('xanadu_common_table', cs(a / 40)), ('xanadu_common_bench', cs(a / 20)), ('xanadu_common_hearth', 2), ('xanadu_common_tea_copper', 2), ('xanadu_common_store', cs(a / 100))],
      'fishermonks_house': lambda a, w, d, D: [('xanadu_common_table', cs(a / 60)), ('xanadu_common_bench', cs(a / 30)), ('xanadu_common_hearth', 1), ('xanadu_court_altar', 1), ('xanadu_common_prayer_wheels', 2)],
      'fast_hall': lambda a, w, d, D: [('xanadu_common_table', cs(a / 40)), ('xanadu_common_bench', cs(a / 20)), ('xanadu_common_cup_table', 2), ('xanadu_common_desk', 4)],
      'ferry_house': lambda a, w, d, D: [('xanadu_common_bench', cs(a / 25)), ('xanadu_common_desk', 1), ('xanadu_common_store', 3), ('xanadu_common_rack', 2)],
      'quay': lambda a, w, d, D: [('xanadu_common_creel', 4)],
      'jetty': lambda a, w, d, D: [('xanadu_common_creel', cs(a / 60)), ('xanadu_common_paddle_rack', 1)],
      'beach': lambda a, w, d, D: [('xanadu_common_dugout', cs(a / 40)), ('xanadu_common_paddle_rack', cs(a / 200))],
      'boathouse': lambda a, w, d, D: [('xanadu_common_dugout', cs(a / 120)), ('xanadu_common_workbench', 2), ('xanadu_common_rack', cs(a / 150)), ('xanadu_common_paddle_rack', 2)],
      'net_racks': lambda a, w, d, D: [('xanadu_common_net_rack', cs(a / 60))],
      'fish_racks': lambda a, w, d, D: [('xanadu_common_fish_rack', cs(a / 40))],
      'smokehouse': lambda a, w, d, D: [('xanadu_common_smoke_rack', cs(a / 30)), ('xanadu_common_store', 2)],
      'net_loft': lambda a, w, d, D: [('xanadu_common_net_rack', cs(a / 150)), ('xanadu_common_creel', cs(a / 40)), ('xanadu_common_store', cs(a / 60)), ('xanadu_common_workbench', 2)],
      'ropewalk': lambda a, w, d, D: [('xanadu_common_rope_walk_post', cs(w / 6 if w > d else d / 6)), ('xanadu_common_workbench', 1)],
      'wave_shrine': lambda a, w, d, D: [('xanadu_common_wave_wheel', 1), ('xanadu_common_butter_lamp_rack', 1)],
      'ghat': lambda a, w, d, D: [('xanadu_court_screen', 1), ('xanadu_common_bench', 4)],
      'chorten': lambda a, w, d, D: [('xanadu_court_chorten', 1), ('xanadu_common_butter_lamp_rack', 1)],
      'wheel_house': lambda a, w, d, D: [('xanadu_common_prayer_wheels', 1), ('xanadu_common_butter_lamp_rack', 1)],
      'lantern_room': lambda a, w, d, D: [('xanadu_common_butter_lamp_rack', 1)],
      'dairy': lambda a, w, d, D: [('generic_trade_trough', cs(a / 100)), ('generic_trade_hayrack', cs(a / 100)), ('xanadu_common_store', cs(a / 150)), ('xanadu_common_workbench', 2)],
      'apiary': lambda a, w, d, D: [('xanadu_common_hive_wall', cs(a / 60))],
      'robing': lambda a, w, d, D: [('xanadu_common_robe_rack', cs(a / 20)), ('xanadu_common_bench', cs(a / 30)), ('xanadu_common_chest', cs(a / 15))],
    }

def draw_section():
    """the section up the page's axis (v = 0), from the page (floors/page-isle.json): the 1:1 ground under its pads and
    terraces, and every building within 40 m of the axis at its level and height"""
    f_t = B.font(40, True); f = B.font(20); fs = B.font(17)
    W, H = 2600, 1000; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    sx, sy, base = 2.9, 4.6, H - 120
    ox = 30 + 120 * sx
    def X(u): return ox + u * sx
    def Y(h): return base - h * sy
    dr.text((30, 18), 'Section along u: the cove, the wharf, the lower ward, the scarp, the precinct and the Hall of Dreaming (heights x%.1f)' % (sy / sx), font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), 'From the page at 1:1 (floors/page-isle.json): the ground up the axis under its pads and terraces; the buildings within 40 m of it at their levels.', font=f, fill=(70, 70, 70))
    prof = ISLE['profile']
    dr.rectangle([X(prof[0][0]), Y(0), X(prof[-1][0]), H], fill=WATER)
    dr.polygon([(X(u), Y(max(h, -12))) for u, h in prof] + [(X(prof[-1][0]), H), (X(prof[0][0]), H)], fill=(228, 214, 190), outline=(120, 100, 80))
    shown = set()
    for p in sorted(ISLE['places'], key=lambda p: -p['h']):
        if abs(p['x']) > 40 or p['h'] <= 0 or p['kind'] in ('boat', 'wall') or p['key'] in ('qb_terrace_stair',): continue
        u0, u1, v0, v1 = box([p])
        if u1 < prof[0][0] or u0 > prof[-1][0]: continue
        sacred = p['kind'] == 'sacred'
        dr.rectangle([X(u0), Y(p['y'] + p['h']), X(u1), Y(p['y'])], fill=(60, 90, 170) if sacred else (236, 232, 218), outline=(30, 30, 30), width=2)
        if u1 - u0 > 14 and p['name'] not in shown:
            shown.add(p['name']); dr.text((X(u0) + 2, Y(p['y'] + p['h']) - 22), p['name'], font=fs, fill=(0, 0, 0))
    st = pick('isle', ['stair:*'])
    if st:
        us = [-q['z'] for q in st]
        dr.text((X(min(us)) - 60, Y(max(q['y'] for q in st)) - 24), 'Stair of Lowered Eyes: six runs up the scarp', font=fs, fill=(0, 0, 0))
    dr.text((X(-110), Y(0) + 12), 'the lake, -520 m', font=fs, fill=(30, 60, 120))
    return img
# the hall's rooms and the wharf take no generic dressing (no fires, statues or planters among sleepers and nets)
UNDRESSED = {'dream_turning', 'dream_nave', 'porlock', 'keepers', 'lulling', 'damsel_shrine', 'waking_booths', 'long_sleep', 'cup_house',
             'quay', 'jetty', 'beach', 'boathouse', 'net_racks', 'fish_racks', 'smokehouse', 'net_loft', 'ropewalk', 'wave_shrine', 'ghat',
             'chorten', 'wheel_house', 'lantern_room', 'dairy', 'apiary', 'kora', 'dream_hall_ext', 'monastery_core'}
# the generator draws its axis note and 50 m bar at u = -ext, v = -ext, off the sheet when the frame is not centred on 0
# (Longsong's grounds were): draw them again where the sheet's own corner is, using the generator's own layout numbers
_draw_floor = B.draw_floor
def draw_floor(F):
    note = F.get('axisnote', ''); F['axisnote'] = ' '
    img = _draw_floor(F); F['axisnote'] = note
    q = F['rect']; cu = (q[0] + q[1]) / 2.0; cv = (q[2] + q[3]) / 2.0; ext = max(q[1] - q[0], q[3] - q[2]) / 2.0 + 8
    s = 1700.0 / (2 * ext); PW = int(2 * ext * s); margin = 30
    dr = ImageDraw.Draw(img); f_rn = B.font(15)
    header = 60 + 30 * len(B.wrap(dr, F['sub'], B.font(22), PW + 1240)) + 20
    ox, oy = margin, header + margin
    X = lambda u: ox + (u - cu + ext) * s; Y = lambda v: oy + (ext - (v - cv)) * s
    if F.get('lake'):   # the lake under the rooms: painted only where the sheet's own ground still shows (the generator outlines every fill)
        from PIL import ImageChops
        m = Image.new('L', img.size, 0); md = ImageDraw.Draw(m)
        for poly in F['lake']: md.polygon([(X(u), Y(v)) for u, v in poly], fill=255)
        bg = Image.new('L', img.size, 0)
        for col in ((250, 250, 248), (255, 255, 255)):
            bg = ImageChops.lighter(bg, ImageChops.difference(img.convert('RGB'), Image.new('RGB', img.size, col)).convert('L').point(lambda v: 255 if v < 4 else 0))
        img.paste(Image.new('RGB', img.size, WATER), mask=ImageChops.multiply(m, bg))
        dr = ImageDraw.Draw(img)
    miss = MISSING.get(F['id'])
    if miss: dr.text((X(cu - ext) + 10, Y(cv - ext) - 64), 'Not on the page yet: ' + '; '.join(miss), font=f_rn, fill=(150, 60, 40))
    dr.text((X(cu - ext) + 6, Y(cv + ext) + 6), note, font=f_rn, fill=(90, 90, 90))
    if abs(cu) < 1e-6 and abs(cv) < 1e-6: return img   # centred: the generator's bar is already in place
    bx, by = X(cu - ext) + 10, Y(cv - ext) - 12
    dr.rectangle([0, by - 26, ox + PW, by + 4], fill=(255, 255, 255))   # the generator's own bar, misplaced, is on this row
    dr.line([(bx, by), (bx + 50 * s, by)], fill=(0, 0, 0), width=3); dr.text((bx, by - 22), '50 m', font=f_rn, fill=(0, 0, 0))
    return img

_manifest_for = B.manifest_for
def manifest_for(room):
    if room.get('ref'): return {},(room['u1'] - room['u0']) * (room['v1'] - room['v0'])
    if room['kind'] not in UNDRESSED: return _manifest_for(room)
    keep = B.dressing; B.dressing = lambda a, per, D: []
    try: return _manifest_for(room)
    finally: B.dressing = keep

def main():
    B.manifest_for = manifest_for; B.draw_floor = draw_floor
    B.KEYMAP.update(LS.keymap()); B.EXTRA_PROGRAMS.update(LS.programs()); B.EXTRA_PROGRAMS.update(ad_programs())
    B.NEW.clear(); B.NEW.update(AD_NEW)
    B.CITY.clear()
    B.CITY['order_reading_table'] = "the History Monks' set, settlements/yuni/src/59-civic.js (the Register's reading table)"
    intro = ('Generated by `azure_blueprint.py` (on `settlements/voth/palace/blueprint.py`, with Longsong\'s Xanadu key map and room programmes) from the same room data as the sheets. Keys are catalog pieces (`kits/catalog`): `xanadu_court_*` and `xanadu_common_*` from the Xanadu sets, `generic_trade_*`. A key marked **NEW** is not in the catalog yet; the list is at the end. Counts are a brief for the furnisher, not a placement. Big zones on the grounds sheet (over 600 m2) are counted at a quarter, as in the other blueprints; the turnings of the Hall of Dreaming are counted whole (their cots are a fixed grid, PLAN.md section 5).\n')
    B.main(floors=FLOORS, out=OUT, here=HERE, title='# Grēṭ-Āil, the Azure Dream\'s head monastery: furniture manifest\n', intro=intro, section=draw_section, zone_R=368)

if __name__ == '__main__':
    main()
