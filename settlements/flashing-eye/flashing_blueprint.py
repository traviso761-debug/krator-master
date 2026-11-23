#!/usr/bin/env python3
"""The Order of the Flashing Eye's head house on the east volcano (the Lip at px 881,1527.1): the blueprint.

The site, the walls, the zones, the ways and every building's footprint come from the layout (src/30-fe-layout.js, its rules
src/31-fe-rules.js), read through `node layout_dump.js`: change a footprint there, never here. The rooms inside the monastery
(M1-MR), the Lip Range (L), the Hall of the Ember (H), the Eye Post (P), the Foot House (F) and the upper storeys (E2) are this
blueprint's own. Sheets and the manifest come from the shared generator settlements/voth/palace/blueprint.py, with Longsong's
Xanadu key map and monastery programmes (settlements/longsong/longsong_blueprint.py) and the Beacon's (settlements/beacon/
beacon_blueprint.py), imported, not copied.

Frame (the layout's): u runs SOUTH along the spur (the crater and the cap at the left of a sheet, the bench, the band and the
Rift at the right), v EAST (up a sheet), y up from the bench (1,660 m). Metres. The origin is the middle of the Lip. The kit's
great monastery (kits/qiblai qb_monastery, the crimson dress o.v 0) stands at u -100..-48, v -26..26 with its gate facing
south: kit z -> u = -74 + z, kit x -> v.

    python flashing_blueprint.py        # writes floors/*.png and FURNITURE.md next to this file (needs node)
"""
import json, math, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'voth', 'palace'))
sys.path.insert(0, os.path.join(HERE, '..', 'longsong'))
sys.path.insert(0, os.path.join(HERE, '..', 'beacon'))
import blueprint as B
from blueprint import R, box, C
import longsong_blueprint as LS
from PIL import Image, ImageDraw

OUT = os.path.join(HERE, 'floors')
DUMP = json.loads(subprocess.run(['node', os.path.join(HERE, 'layout_dump.js')], capture_output=True, text=True, check=True, encoding='utf-8').stdout)
L = DUMP['layout']
BAD = [c for c in DUMP['checks'] if not c['pass']]
if BAD:
    sys.exit('the layout fails its rules (node settlements/flashing-eye/test-flashing-eye.js):\n  ' + '\n  '.join(c['name'] + ': ' + c['detail'] for c in BAD))
PARTS = {p['id']: p for p in L['parts']}
WAYS = {w['id']: w for w in L['ways']}
def pb(i): return PARTS[i]['box']

def from_part(p, kind=None, name=None, note=None, n=None, decor=None):
    b = p['box']; r = R(p['n'] if n is None else n, name or p['name'], kind or p['kind'], b[0], b[1], b[2], b[3], p['decor'] if decor is None else decor, p['note'] if note is None else note)
    if p.get('circ'): r['circ'] = True
    return r

AXIS = 'u -> south: the cap and the crater at the left, the bench, the Lip and the Rift at the right; v east, up the sheet'
WALL_COL = (150, 40, 34)
WALL_LINES = [([tuple(w['a']), tuple(w['b'])], WALL_COL, 3 if w.get('parapet') else 5) for w in L['walls']]
def sq(c, h): return [(c[0] - h, c[1] - h), (c[0] + h, c[1] - h), (c[0] + h, c[1] + h), (c[0] - h, c[1] + h)]
GATE_FILLS = [(sq(g['at'], 2.2), (255, 255, 255)) for g in L['gates']]
LIP = [(-L['band']['lipK'] * v * v, v) for v in range(-L['band']['halfLen'], L['band']['halfLen'] + 1, 25)]
LIP_LINE = (LIP, (120, 60, 30), 4, 'the Lip: the band falls 200 m to the Rift side')
BENCH_FILL = ([tuple(p) for p in L['zones']['bench']], (246, 236, 226))
def way_line(i, col, w=3, label=True):
    W = WAYS[i]; return ([(p[0], p[1]) for p in W['pts']], col, w) + ((W['name'].split(' (')[0],) if label else ())

FLOORS = []

# ------------------------------------------------------------------------------------------------ E0 the cone: the rim to the band's foot
CR = L['crater']
def circle(c, r, n=48): return [(c[0] + math.cos(2 * math.pi * k / n) * r, c[1] + math.sin(2 * math.pi * k / n) * r) for k in range(n)]
def bearing_line(o, b, length, label, col, w=3):
    a = math.radians(b); return ([o, (o[0] - math.cos(a) * length, o[1] + math.sin(a) * length)], col, w, label)
SIGHTS = []
for key, origin, ln in (('balcony', tuple(PARTS['lip.mirror']['balcony']), 800), ('post', (-1904, 0), 700)):
    for s in L['sights'][key]['list']:
        if s['id'] in ('alph', 'theodiga', 'qiblai'): continue
        seen = s['clear'] >= 10
        lab = '%s from the %s: %d km, %d deg, %s' % (s['name'].split(' (')[0], 'balcony' if key == 'balcony' else 'Eye Post', s['km'], s['bearing'],
              ('seen +%d m' % s['clear']) if seen else ('hidden %d m' % s['clear']) + (' (by %s)' % s['via'] if s.get('via') else ''))
        SIGHTS.append(bearing_line(origin, s['bearing'], ln, lab if s.get('must') or (key == 'post' and s['id'] == 'g1') else None, (200, 60, 40) if seen else (170, 170, 170), 3 if seen else 2))
SIGHTS = [s if s[3] else s[:3] for s in SIGHTS]
E0_ROOMS = [from_part(p) for p in L['parts'] if 'E0' in p['sheets'] and p['zone'] in ('cap', 'rim', 'band', 'apron')]
# the Way of Shrines (the owner, 2026-11-23): the stacks as circles, the rope bridges from each top to the next landing, the last to the Gate
BW = L['bridgeway']
STACK_FILLS = [(circle((S['u'], S['v']), S['r'], 6), (110, 104, 98), S['shrine'].split(' of ')[-1]) for S in BW['stacks']]
BRIDGE_PTS = [(S['u'], S['v']) for S in BW['stacks']] + [tuple(BW['end']['at'])]
BRIDGE_LINE = ([(360, -100)] + BRIDGE_PTS, (150, 40, 34), 4, 'the Way of Shrines (rope bridges)')
FLOORS.append(dict(R=999, rect=(-2620, 420, -1100, 1100), id='E0', tier=0,
  title='Sheet E0: the cone from the crater to the band\'s foot (3 x 2.2 km)',
  sub='The east volcano of Erewhon\'s lake (881,1526 on the scale model 5.1; the summit 1,838 m before the vent is cut). The crater (*proposed*: 600 m across, 150 m deep, a Strombolian vent that flashes red at night; the owner, question 3) is not yet on the model (step F0): the page draws it. The Way of Breath climbs the cap 2 km at 8 % from the Gate of Breath to the Threshold Chorten, past three chortens and the Halfway Shelter; beyond it only the professed: the Eye Post, the Watch\'s hut and the Open Kora on the rim. The bench and its house on the Lip (sheets E1, E2); the band falls 200 m below it, the Cleft Stair in its cleft, the mule road round its west end, the Stair of the Eye down the spur to the Foot House (sheet F, 6.6 km south). Sights in red are seen by 10 m or more, grey are hidden; from the Mirror Hall\'s balcony and the Eye Post (tools/sights.py).',
  axisnote=AXIS,
  outlines=[(-150, 4, -96, 96, 'the house (E1, E2)')],
  fills=[(circle(CR['centre'], CR['r']), (196, 160, 140), 'the crater'), (circle(CR['vent'], CR['ventR'] * 3), (220, 70, 40), 'the vent'),
         BENCH_FILL + ('the bench',)] + STACK_FILLS,
  lines=[LIP_LINE, way_line('breath', (140, 100, 60), 4), way_line('mule', (110, 90, 70), 3), BRIDGE_LINE,
         way_line('kora.open', (120, 90, 160), 3), ([(p[0], p[1]) for p in WAYS['stair']['pts'] if p[0] < 400], (110, 90, 70), 3, 'the Stair of the Eye (on to the Foot House)')] + SIGHTS,
  rooms=E0_ROOMS))

# ------------------------------------------------------------------------------------------------ E1 the bench, ground floor
SEE = {'monastery': ('see', 'The Red Monastery (sheets M1, M2, MR)'), 'ember': ('see', 'The Ember Tower (sheet H)'),
       'tw.mirror': ('see', 'The Mirror Tower (sheet L)'), 'tw.labrang': ('see', 'The Labrang Tower (sheet L)'),
       'lip.mirror': ('see', 'The Mirror Hall (sheet L)'), 'lip.books': ('see', 'The Book House (sheet L)'), 'lip.guests': ('see', 'Guest House (sheet L)'),
       'lip.labrang': ('see', 'The Labrang (sheet L)')}
E1_ROOMS = []
for p in L['parts']:
    if 'E1' not in p['sheets'] or p['level'] != 0: continue
    k, nm = SEE.get(p['id'], (None, None))
    E1_ROOMS.append(from_part(p, kind=k, name=nm))
ENCL = dict(R=300, rect=(-162, 22, -100, 100), poly=[tuple(p) for p in L['zones']['bench']], axisnote=AXIS)
KORA = (([(p[0], p[1]) for p in WAYS['kora.lower']['pts']], (120, 90, 160), 2))
FLOORS.append(dict(ENCL, id='E1', tier=0,
  title='Sheet E1: the bench, ground floor (behind its wall, 144 x 180 m, on the Lip)',
  sub='The owner (2026-11-16): a cliffside house on the cone, facing the Rift; about 320. The bench is the flat top of the last lava flow, its south edge the Lip. The Lip Range (the Mirror Hall, the Book House, the guest house, the Labrang) stands on the Lip, its two lower storeys in the band\'s top (sheet L); nothing else comes within 12 m of the Lip. The Red Monastery\'s gate faces south across its court to the range and the Rift; the Hall of the Ember stands on its axis to the north, toward the crater. The Mule Gate (west) takes the mule road into the Mule Court, among the kitchen, granary, infirmary and bath; the Gate of Breath (north) leads to the rim; the Gate of the Rift (south-west, on the Lip) is the head of the Cleft Stair. The lower kora (purple) goes round the monastery, eyes lowered. Walls crimson; the Lip brown.',
  fills=[BENCH_FILL] + GATE_FILLS,
  lines=WALL_LINES + [KORA, ([p for p in LIP if -100 <= p[1] <= 100], (120, 60, 30), 4, 'the Lip')]
        + [([(t['u0'], -90), (t['u0'], 90)], (90, 140, 130), 2, 'the %s terrace\'s edge (%+d m)' % (t['id'], t['y'])) for t in L['terraces'] if t['u0'] > -150],
  rooms=E1_ROOMS))

# ------------------------------------------------------------------------------------------------ E2 upper storeys
g = pb('granary'); inf = pb('infirmary'); ch = pb('chapter'); nv = pb('novices'); sc = pb('school'); kt = pb('kitchen')
E2_ROOMS = [
  R(1, 'Lay Brothers\' Dormitory (over the granary)', 'dormitory', g[0], -129, g[2], g[3], 1, 'the granary\'s ten'),
  R(2, 'Upper Granary', 'store', -129, g[1], g[2], g[3], 0, 'the winter\'s grain in bins; the sulfur for fumigation in its own locked bin'),
  R(3, 'Infirmary, upper ward', 'infirmary', *inf, 2, 'the Rim Watch\'s burns and coughs; the infirmarer and his five'),
  R(4, 'Cooks\' Dormitory', 'dormitory', *kt, 1),
  R(5, 'Chapter cells (first floor)', 'cells', *ch, 1, 'fifteen monks, two to a cell'),
  R(6, 'Novices\' Dormitory', 'dormitory', nv[0], nv[1], nv[2], 67, 1, 'fifty boys in two rooms; a lamp lit from the Ember burns all night'),
  R(7, 'Master of Novices', 'chamber', nv[0], -92, 67, nv[3], 2),
  R(8, 'Novices\' School', 'school', -92, nv[1], 67, nv[3], 1, 'the syllabary\'s sound grid on the slate wall: the boys learn to read the flashes before they learn to read'),
  R(9, 'Mirror School Dormitory', 'dormitory', sc[0], sc[1], sc[2], 66, 1, 'thirty keepers in training for the line\'s posts'),
  R(10, 'The Code Room', 'office', sc[0], sc[1], 66, sc[3], 2, 'the signal books, the Book of Flashes\' copies, the call signs of every post on the line'),
  R(11, 'Porters\' loft (the Mule Gate)', 'guard', *pb('g.mule'), 1, 'four lay porters'),
  R(12, 'The Veil Room (over the Gate of Breath)', 'guard', *pb('g.breath'), 2, 'the crimson veils of the professed hang here; a novice keeps the gate'),
  R(13, 'The Red Monastery (sheet M2)', 'see', *pb('monastery'), 4),
  R(14, 'The Hall of the Ember (sheet H)', 'see', *pb('ember'), 4),
  R(15, 'The Lip Range (sheet L)', 'see', -14, 0, -60, 60, 3)]
FLOORS.append(dict(ENCL, id='E2', tier=0,
  title='Sheet E2: the bench, upper storeys',
  sub='The ranges\' upper floors: dormitories over the granary and the kitchen, the infirmary\'s upper ward, the chapter range\'s first floor (its second the same), the novices\' dormitory and school, the Mirror School\'s dormitory and its code room, the porters\' loft and the Veil Room over the gates. The monastery, the Hall of the Ember and the Lip Range have their own sheets.',
  fills=[BENCH_FILL],
  lines=WALL_LINES,
  rooms=E2_ROOMS))

# ------------------------------------------------------------------------------------------------ the Red Monastery (the kit block)
MU = -74
def K(n, name, kind, z0, z1, x0, x1, decor, note=''):
    """a room in the kit block's frame (x across, z toward its gate): u = -74 + z, v = x"""
    return R(n, name, kind, MU + z0, MU + z1, x0, x1, decor, note)
M_FRONT_W = (MU + 19, MU + 26, -9, -5); M_FRONT_E = (MU + 19, MU + 26, 5, 9)
M_BACK = (MU - 26, MU - 22.5, 15, 19); M_HALL = (MU - 2, MU + 0.2, 8, 11.8)
MBLOCK = dict(R=300, rect=(MU - 30, MU + 30, -30, 30), poly=[(MU - 26, -26), (MU + 26, -26), (MU + 26, 26), (MU - 26, 26)],
              axisnote='u -> south: the hall at the left (north, toward the Ember and the crater), the gate at the right facing the Rift; v east, up')
FLOORS.append(dict(MBLOCK, id='M1', tier=0,
  title='Sheet M1: the Red Monastery, ground floor (the Order\'s temple on the kit\'s 52 m plan)',
  sub='The revamp (the owner, 2026-11-23): the Qiblai kit\'s great-monastery plan built as the Order\'s own temple (qb_fe_temple), white ranges under red tiled roofs with upturned eaves, the teal frieze and the crimson cornice; the gate tower and the Assembly Hall under two red tiers. The plan is the kit\'s (QSPOKE[0]: crimson walls 0xa8302a, saffron trim, the oxblood band; two storeys of ranges; the Song drum in the court). Its gate faces south across the Monastery Court to the Lip Range and the Rift. The Assembly Hall at the back under the gilt crown, the Shrine of the Eye behind it on the axis toward the Hall of the Ember; the inner kora round the hall; the chapter two to a cell.',
  rooms=[
    K(1, 'Gate of the Open Eye', 'gatehouse', 19, 26, -5, 5, 3, 'the gate tower; the doorkeeper; the boots and the veils left here'),
    box(2, 'Front stair (west)', 'stair', M_FRONT_W, 0), box(3, 'Front stair (east)', 'stair', M_FRONT_E, 0),
    K(4, 'Sacristy', 'sacristy', 19, 26, -26, -9, 2, 'the hall\'s vestments; the Station\'s night vestments'),
    K(5, 'Lamp room for the Hall', 'store', 19, 26, 9, 26, 0, 'the hall\'s lamps filled with butter here and lit from the Ember\'s lantern'),
    K(6, 'Court of the Drum', 'cloister_court', 3.4, 19, -16.6, 16.6, 2, 'the paving; the spoke\'s piece'),
    C(7, 'Song Drum', 'song_drum', MU + 13.2, 0, 2.2, 3, 'the kit\'s piece for spoke 0: the drum under its little roof'),
    K(8, 'Cloister walk (west)', 'cloister_walk', 3.4, 19, -19, -16.6, 1), K(9, 'Cloister walk (east)', 'cloister_walk', 3.4, 19, 16.6, 19, 1),
    K(10, 'Library of the Eye', 'library', -19, 3.4, -26, -19, 3, 'the crimson spoke\'s commentaries on the eighth turning'),
    K(11, 'Scriptorium', 'scriptorium', 3.4, 19, -26, -19, 2, 'the Book of Breaths copied, a fair copy each year for Qiblai'),
    K(12, 'Chapter House', 'chapter_house', -19, -5, 19, 26, 3, 'the daily chapter: the night\'s breaths and flashes read first'),
    K(13, 'Treasury', 'treasury', -5, 5, 19, 26, 2, 'the offerings and the Order\'s seal'),
    K(14, 'Old Brothers\' Cells', 'cells', 5, 19, 19, 26, 1, 'the watchers too old for the rim'),
    K(15, 'Inner kora (west)', 'kora', -19, 3.4, -19, -12, 2, 'round the hall, wheels on its wall'),
    K(16, 'Inner kora (east)', 'kora', -19, 3.4, 12, 19, 2),
    K(17, 'Porch', 'porch', 0.2, 3.4, -6, 6, 3, 'the painted portico: the eight-spoked wheel with the open eye'),
    K(26, 'Porch flank', 'porch', 0.2, 3.4, -12, -6, 2), K(27, 'Porch flank', 'porch', 0.2, 3.4, 6, 12, 2),
    K(18, 'Assembly Hall', 'assembly', -16.8, 0.2, -12, 12, 4, 'two storeys; the crimson Prismarch\'s throne (his mirror reader stands beside it when he is away); the chapter sings the Song facing south, the Rift'),
    box(19, 'Hall stair', 'stair', M_HALL, 0),
    K(20, 'Inner kora (north)', 'kora', -19, -16.8, -12, 12, 2),
    K(21, 'Shrine of the Eye', 'shrine', -26, -19, -8, 8, 4, 'behind the hall on the axis: the Damsel with her dulcimer, and the wheel with the open eye; its north door looks up the axis to the Hall of the Ember'),
    K(22, 'Chapter cells (west)', 'cells', -26, -19, -26, -8, 1),
    K(23, 'Chapter cells (east)', 'cells', -26, -19, 8, 15, 1), box(24, 'Back stair', 'stair', M_BACK, 0),
    K(28, 'Back stair landing', 'passage', -22.5, -19, 15, 19, 0),
    K(25, 'Chapter cells (north-east)', 'cells', -26, -19, 19, 26, 1)]))
FLOORS.append(dict(MBLOCK, id='M2', tier=1,
  title='Sheet M2: the Red Monastery, upper floor and the hall\'s gallery',
  sub='The chapter\'s cells round the court (100 monks, two to a cell), the Prior and the chant-master over the back stair, the Masters\' Gallery round the Assembly Hall\'s void, the Drum of the Hours in the gate tower, the Rim Watch\'s cells in the front range (their weeks down).',
  rooms=[
    K(1, 'Drum of the Hours', 'drum_room', 19, 26, -5, 5, 2, 'the hours beaten; the day line\'s hours called to the Mirror Hall'),
    box(2, 'Front stair (west)', 'stair', M_FRONT_W, 0), box(3, 'Front stair (east)', 'stair', M_FRONT_E, 0),
    K(4, 'Cells of the Rim Watch', 'cells', 19, 26, -26, -9, 1, 'the twenty-four on rota, their three weeks down'),
    K(5, 'Chapter cells (south-east)', 'cells', 19, 26, 9, 26, 1),
    K(6, 'Chapter cells (west range)', 'cells', -19, 19, -26, -19, 1),
    K(7, 'Chapter cells (east range)', 'cells', -19, 19, 19, 26, 1),
    K(8, 'Masters\' Gallery', 'gallery', -16.8, 0.2, -12, -8, 3), K(9, 'Masters\' Gallery', 'gallery', -16.8, 0.2, 8, 12, 3),
    K(10, 'Assembly Hall (open below)', 'gallery_void', -16.8, 0.2, -8, 8, 0),
    box(11, 'Hall stair', 'stair', M_HALL, 0),
    K(12, 'Prior', 'chamber', -26, -19, -8, 4, 2), K(13, 'Chant-master', 'chamber', -26, -19, 4, 15, 2),
    box(14, 'Back stair', 'stair', M_BACK, 0), K(19, 'Back stair landing', 'passage', -22.5, -19, 15, 19, 0),
    K(15, 'Chapter cells (back range)', 'cells', -26, -19, -26, -8, 1), K(16, 'Chapter cells (back range)', 'cells', -26, -19, 19, 26, 1),
    K(17, 'Court (open)', 'void', -16.8, 19, -19, -12, 0), K(18, 'Court (open)', 'void', 0.2, 19, -12, 19, 0)]))
FLOORS.append(dict(MBLOCK, id='MR', tier=2,
  title='Sheet MR: the Red Monastery, the hall\'s third storey and the roofs',
  sub='The Watchers\' Chapel at the top of the hall (the crimson spoke\'s protector room: dark but for an ember lamp; the veils of the dead watchers on its pillars), the roof terraces, the gilt crown with the wheel and deer over the hall (the holy crown, the kit\'s; one of the two gilt things on the mountain), the gate tower\'s roof with the crimson banner.',
  rooms=[
    K(1, 'Gate tower roof', 'roof', 19, 26, -5, 5, 1, 'the crimson banner; the deer and wheel'),
    K(2, 'Range roofs (south)', 'roof', 19, 26, -26, -5, 0), K(3, 'Range roofs (south)', 'roof', 19, 26, 5, 26, 0),
    K(4, 'Range roofs (west)', 'roof', -19, 19, -26, -19, 0), K(5, 'Range roofs (east)', 'roof', -19, 19, 19, 26, 0),
    K(6, 'Range roofs (north)', 'roof', -26, -19, -26, 26, 0),
    K(7, 'The Watchers\' Chapel', 'keeper_chapel', -16.8, 0.2, -12, 12, 4, 'the hall\'s third storey: the protector of the watch; the veils of the dead watchers on its pillars'),
    box(8, 'Hall stair (to the roof and the crown)', 'stair', M_HALL, 0),
    K(9, 'Court (open)', 'void', 0.2, 19, -19, 19, 0)]))

# ------------------------------------------------------------------------------------------------ L the Lip Range: four floors side by side
def LF(k, rooms):
    out = []
    for r in rooms:
        r = dict(r); r['u0'] += 20 * k; r['u1'] += 20 * k; out.append(r)
    return out
def st(v0): return (-14, -10, v0, v0 + 3)
LR = []
LR += LF(0, [R(1, 'Mirror store', 'store', -14, 0, -60, -33, 0, 'L-2, in the band\'s top: the spare speculum discs in felt, the grinding stones'), box(2, 'Stair', 'stair', st(-33), 0),
             R(3, 'The Vault of Breaths', 'archive', -14, 0, -30, 0, 2, 'L-2: the Book of Breaths from the founding, every volume; cut into the basalt, dry and cool'),
             R(4, 'Guests\' stores and the tank\'s head', 'store', -14, 0, 0, 27, 0), box(5, 'Stair', 'stair', st(27), 0),
             R(6, 'The Labrang\'s treasury', 'treasury', -14, 0, 30, 57, 2), box(7, 'Stair', 'stair', st(57), 0)])
LR += LF(1, [R(8, 'Readers\' Gallery (L-1)', 'signal_room', -14, 0, -60, -33, 2, 'its windows in the face: the readers watch the Beacon\'s line and the Tears\' camp through glasses'), box(9, 'Stair', 'stair', st(-33), 0),
             R(10, 'Stacks', 'archive', -14, 0, -30, 0, 2, 'the Order\'s library: the Song\'s commentaries, the signal books, the Station\'s tables'),
             R(11, 'Guests\' dormitory', 'dormitory', -14, 0, 0, 27, 1, 'thirty pilgrims of the lesser sort'), box(12, 'Stair', 'stair', st(27), 0),
             R(13, 'The household', 'dormitory', -14, 0, 30, 57, 1, 'the Prismarch\'s ten: his secretary, chamberlain, attendant monks, cooks'), box(14, 'Stair', 'stair', st(57), 0)])
LR += LF(2, [R(15, 'The Mirror Hall', 'mirror_hall', -14, 0, -60, -33, 3, 'L0, at the bench\'s level: the readers\' benches and lecterns, the hour board; its balcony on the Lip (the 30 cm mirrors on the parapet)'), box(16, 'Stair', 'stair', st(-33), 0),
             R(17, 'Reading Room', 'library', -14, 0, -30, 0, 3, 'the Book of Flashes on its lectern; the day\'s messages copied for the council'),
             R(18, 'Guest Hall', 'guest_hall', -14, 0, 0, 27, 2, 'the hall where guests eat and wait'), box(19, 'Stair', 'stair', st(27), 0),
             R(20, 'Audience Hall', 'audience', -14, 0, 30, 57, 4, 'the crimson Prismarch receives the Sultan\'s officers and the other houses\' envoys'), box(21, 'Stair', 'stair', st(57), 0)])
LR += LF(3, [R(22, 'The Master of Mirrors', 'office', -14, 0, -60, -33, 2, 'L1: his office over the hall; the line\'s ledger'), box(23, 'Stair', 'stair', st(-33), 0),
             R(24, 'Scriptorium', 'scriptorium', -14, 0, -30, 0, 2),
             R(25, 'Guest chambers', 'lodging', -14, 0, 0, 27, 3, 'thirty beds in rooms for the officers and the monks of the other houses'), box(26, 'Stair', 'stair', st(27), 0),
             R(27, 'The Prismarch\'s cell', 'abbot_cell', -14, -7, 30, 42, 3), R(28, 'His mirror room', 'window_of_light', -7, 0, 30, 57, 4, 'a gallery of tall windows on the Lip: he sits on the council from here, his words flashed to Qiblai on the day line'),
             R(29, 'His oratory', 'chapel', -14, -7, 42, 57, 4), box(30, 'Stair', 'stair', st(57), 0)])
FLOORS.append(dict(R=300, rect=(-18, 66, -64, 64), id='L', tier=0,
  title='Sheet L: the Lip Range (120 x 14 m), its four floors side by side',
  sub='The revamp (2026-11-23): white under one long red tiled roof, the teal frieze, the crimson cornice; the Mirror Tower (the first reference\'s: tapering, a crimson band, a round red cap) at its west end and the Labrang Tower (the second\'s: the painted window bays, a gallery, a broad red roof) at its east, the Prismarch\'s floors in it. The range stands on the Lip, its two lower floors cut into the band\'s top (the Potala effect): L-2 and L-1 have their windows in the cliff\'s face, L0 is at the bench\'s level, L1 above it. West to east: the Mirror Hall (the readers and their balcony toward the Beacon at 245, Erehwon at 284 and the Tears\' camp at 197), the Book House (the Vault of Breaths in the rock), the guest house (60 beds), the Labrang (the crimson Prismarch\'s four floors). The floors are drawn 20 m apart along u, each at u -14..0.',
  axisnote='each floor: u -> south (the face, the Rift at the right); v east, up. L-2, L-1, L0, L1 from the left',
  outlines=[(-14 + 20 * k, 20 * k, -60, 60, ('L-2', 'L-1', 'L0', 'L1')[k]) for k in range(4)],
  rooms=LR))

# ------------------------------------------------------------------------------------------------ H the Hall of the Ember: two floors side by side
EB = pb('ember')   # u -128..-108, v -8..8
def HF(k, rooms):
    out = []
    for r in rooms:
        r = dict(r); r['u0'] += 24 * k - 8; r['u1'] += 24 * k - 8; out.append(r)
    return out
HR = HF(0, [R(1, 'Porch', 'porch', -112, -108, -8, 8, 3, 'facing south to the monastery\'s back: the carried fire comes in here once a year'),
            R(2, 'The Hall', 'ember_hall', -122, -112, -8, 8, 3, 'where every lamp in the house is lit; the lamp-lighters\' benches'),
            R(3, 'The Sanctum of the Ember', 'ember_sanctum', -128, -122, -5, 5, 4, 'gilt within (one of the two gilt things on the mountain): the fire lit from the vent burns in a bronze bowl; the north window frames the plume'),
            R(4, 'Tenders\' room', 'chamber', -128, -122, -8, -5, 1), box(5, 'Stair', 'stair', (-128, -122, 5, 8), 0)])
HR += HF(1, [R(6, 'Gallery of the Hall', 'gallery', -122, -112, -8, 8, 3, 'over the hall; the house watches the Ember lit on the founding night'),
             R(7, 'The Book of the Ember', 'archive', -128, -122, -5, 5, 2, 'each year\'s lighting written down: who carried it, how the mountain breathed'),
             R(8, 'Tenders\' dormitory', 'dormitory', -112, -108, -8, 8, 1, 'the two lay tenders'), R(9, 'Store', 'store', -128, -122, -8, -5, 0), box(10, 'Stair', 'stair', (-128, -122, 5, 8), 0)])
FLOORS.append(dict(R=300, rect=(-140, -88, -12, 12), id='H', tier=0,
  title='Sheet H: the Ember Tower: the Hall of the Ember (20 x 16 m) and its tower, the hall\'s two floors side by side',
  sub='The revamp (2026-11-23): the tallest roof of the house, on the upper terrace: the hall under a red skirt roof, the white tower rising from its back half (five storeys, the crimson band, three red tiers, the sanctum\'s gilt finial). On the axis north of the monastery, toward the crater. Once a year the Ember is lit from the vent on the rim and carried down the Way of Breath to the sanctum; every hearth and lamp in the house is lit from it (the Ateshgah at Baku is the model). H0 (left) the porch, the hall and the sanctum; H1 (right) the gallery and the Book of the Ember. Floors drawn 24 m apart.',
  axisnote='each floor: u -> south (the porch at the right, the sanctum and its north window at the left); v east, up',
  outlines=[(EB[0] + 24 * k, EB[1] + 24 * k, EB[2], EB[3], 'H%d' % k) for k in range(2)],
  rooms=HR))

# ------------------------------------------------------------------------------------------------ P the Eye Post: three levels and the roof side by side
PB = pb('post')   # u -1908..-1900, v -4..4
def PF(k, rooms):
    out = []
    for r in rooms:
        r = dict(r); r['u0'] += 12 * k; r['u1'] += 12 * k; out.append(r)
    return out
P_ST = (-1908, -1906, -4, -1)
PR = []
PR += PF(0, [box(1, 'Stair', 'stair', P_ST, 0), R(2, 'The Watch Room', 'eye_watch', -1906, -1900, -4, 4, 1, 'four of the Rim Watch: the night\'s count of the flashes, the tea copper, the veils'), R(3, 'Juniper store', 'store', -1908, -1906, -1, 4, 0)])
PR += PF(1, [box(4, 'Stair', 'stair', P_ST, 0), R(5, 'The Book of Breaths (the rim\'s copy)', 'eye_book', -1906, -1900, -4, 4, 2, 'every burst, plume and smell written as it comes; the water clock'), R(6, 'Signal store', 'store', -1908, -1906, -1, 4, 0)])
PR += PF(2, [box(7, 'Stair', 'stair', P_ST, 0), R(8, 'The Mirror Room', 'signal_room', -1906, -1900, -4, 4, 2, 'the signal book, the call board; the reader sends and reads the day line here'), R(9, 'Shutter store', 'store', -1908, -1906, -1, 4, 0)])
PR += PF(3, [R(10, 'The Mirror Platform', 'eye_roof', -1908, -1900, -4, 4, 2, 'at 12 m: the 60 cm speculum on its stand (to the Beacon, Erehwon, the Tears) and the shuttered fire basket for the night\'s answer; the parapet')])
FLOORS.append(dict(R=300, rect=(-1912, -1860, -8, 8), id='P', tier=0,
  title='Sheet P: the Eye Post on the crater\'s south rim (8 x 8 m, 12 m), its levels side by side',
  sub='The revamp (2026-11-23): the first reference\'s tower, white and tapering, the crimson band, the lantern under a round red cap. The crater is never unwatched: the Rim Watch keeps the post day and night, four monks a watch, six watches (24 on rota, a week on the rim). P0 the watch room, P1 the rim\'s Book of Breaths, P2 the mirror room, P3 the platform with the 60 cm speculum and the fire basket, lit from the Ember (no oil on the mountain). Levels drawn 12 m apart. A 30 m tower would reach G1 directly on the clearest days (+9 m): question 14.',
  axisnote='each level: u -> south (the bench, 2 km off, at the right); v east, up. P0 to P3 from the left',
  outlines=[(PB[0] + 12 * k, PB[1] + 12 * k, PB[2], PB[3], 'P%d' % k) for k in range(4)],
  rooms=PR))

# ------------------------------------------------------------------------------------------------ F the Foot House
FB = pb('foothouse')   # u 6370..6430, v -40..40
FLOORS.append(dict(R=300, rect=(6364, 6436, -46, 46), id='F', tier=0, poly=[(FB[0], FB[2]), (FB[1], FB[2]), (FB[1], FB[3]), (FB[0], FB[3])],
  title='Sheet F: the Foot House at the spur\'s foot (60 x 80 m; ~460 m, 6.6 km south of the bench)',
  sub='Where the west road from Ti-Teras and the east road from the Eye\'s Ghat meet, at the foot of the Stair of the Eye: the Hosteller and the forty of the Foot House, the pilgrims\' hostel (120 beds, two storeys), the stores, the mule stables (about 40 mules), the kitchen; the gate faces south to the roads. The lower terraces lie east of it.',
  axisnote='u -> south (the roads at the right, the Stair up the spur at the left); v east, up',
  rooms=[R(1, 'Pilgrims\' Hostel', 'hostel', 6370, 6430, -40, -26, 2, 'two storeys, 120 beds; the pilgrims\' book'),
         R(2, 'Mule Stables', 'stable', 6370, 6430, 26, 40, 0, 'about 40 mules of the Stair'),
         R(3, 'Court', 'court', 6386, 6420, -24, 24, 1, 'the loads made up for the Stair'),
         R(4, 'Stores', 'store', 6370, 6386, -24, 0, 0, 'the grain and salt from the capital, the tea from Ti-Teras, the sulfur from Hot-Bath'),
         R(5, 'The Hosteller and the muleteers', 'dormitory', 6370, 6386, 0, 24, 1, 'the forty of the Foot House'),
         R(6, 'Kitchen', 'kitchen', 6420, 6430, -24, -6, 1),
         R(7, 'Gate', 'gatehouse', 6424, 6430, -6, 6, 2, 'to the roads; the gate chorten outside it'),
         R(8, 'Harness room', 'workshop', 6420, 6430, 6, 24, 0)]))

# ------------------------------------------------------------------------------------------------ the manifest
OPEN = {'yard', 'terrace', 'threshing', 'midden', 'tank', 'hives', 'cloister_court', 'cloister_walk', 'song_drum', 'roof', 'see', 'porch', 'cave', 'eye_roof'}
cs = lambda n: max(1, round(n))
def programs():
    return {
      'gatehouse': lambda a, w, d, D: [('xanadu_common_prayer_wheels', 2), ('xanadu_common_bench', 2), ('xanadu_common_lamp', 2)],
      'cells': lambda a, w, d, D: [('xanadu_common_bed', cs(a / 10)), ('xanadu_common_chest', cs(a / 10)), ('xanadu_common_meditation_cushion', cs(a / 10)), ('xanadu_common_candle', cs(a / 20)), ('xanadu_common_prayer_wheels', cs(a / 200))],
      'mirror_hall': lambda a, w, d, D: [('xanadu_signal_lectern', 2), ('xanadu_common_signal_mirror', 3), ('xanadu_common_bench', cs(a / 30)), ('xanadu_common_desk', cs(a / 40)), ('xanadu_common_water_clock', 1), ('xanadu_common_board', 1)],
      'mirror_school': lambda a, w, d, D: [('xanadu_common_desk', cs(a / 25)), ('xanadu_common_chair', cs(a / 25)), ('xanadu_mirror_bench', 2), ('xanadu_common_signal_mirror', 2), ('xanadu_signal_lectern', 1), ('xanadu_common_bookcase', cs(a / 80))],
      'ember_hall': lambda a, w, d, D: [('xanadu_common_bench', cs(a / 20)), ('xanadu_common_butter_lamp_rack', cs(a / 30)), ('xanadu_court_incense_burner', 2), ('xanadu_crimson_banner', 1)],
      'ember_sanctum': lambda a, w, d, D: [('xanadu_ember_hearth', 1), ('xanadu_court_incense_burner', 2), ('xanadu_common_meditation_cushion', 4)],
      'eye_watch': lambda a, w, d, D: [('xanadu_common_bed', 4), ('xanadu_common_chest', 4), ('xanadu_common_tea_copper', 1), ('xanadu_common_table', 1), ('xanadu_veil_rack', 1)],
      'eye_book': lambda a, w, d, D: [('xanadu_book_lectern', 1), ('xanadu_common_water_clock', 1), ('xanadu_common_desk', 1), ('xanadu_common_chair', 1), ('xanadu_common_bookcase', 1)],
      'eye_roof': lambda a, w, d, D: [('xanadu_eye_heliograph', 1), ('xanadu_fire_basket', 1)],
      'shelter': lambda a, w, d, D: [('xanadu_common_bench', 4), ('xanadu_common_hearth', 1), ('xanadu_common_table', 1), ('xanadu_common_store', 1)],
      'hut': lambda a, w, d, D: [('xanadu_common_bed', 4), ('xanadu_common_chest', 2), ('xanadu_common_hearth', 1), ('xanadu_veil_rack', 1)],
      'foot_house': lambda a, w, d, D: [],
      'novices': lambda a, w, d, D: [('xanadu_common_table', cs(a / 40)), ('xanadu_common_bench', cs(a / 20))],
      'labrang': lambda a, w, d, D: [], 'library': lambda a, w, d, D: [('xanadu_court_bookcase' if D >= 3 else 'xanadu_common_bookcase', cs(a / 20)), ('xanadu_common_table', cs(a / 90)), ('xanadu_common_chair', cs(a / 35)), ('xanadu_book_lectern', 1)],
      'refectory': lambda a, w, d, D: [('xanadu_common_table', cs(a / 12)), ('xanadu_common_bench', cs(a / 6)), ('xanadu_common_reader_seat', 1), ('xanadu_common_tea_copper', 1)],
      'byre': lambda a, w, d, D: [('xanadu_trade_stall', cs(a / 30)), ('xanadu_trade_trough', cs(a / 150)), ('generic_churn', 4), ('xanadu_works_churn', 2)],
      'chorten': lambda a, w, d, D: [('xanadu_court_chorten', 1)],
      'sacristy': lambda a, w, d, D: [('xanadu_common_chest', 2), ('xanadu_common_rack', 2), ('xanadu_court_cabinet', 1)],
      'chapter_house': lambda a, w, d, D: [('xanadu_court_throne', 1), ('xanadu_common_meditation_cushion', cs(a / 2.5)), ('xanadu_court_low_table', 1)],
      'tower': lambda a, w, d, D: [('xanadu_common_signal_mirror', 3), ('xanadu_signal_lectern', 1), ('xanadu_common_bench', 2)],
      'corner_tower': lambda a, w, d, D: [('xanadu_common_bench', 2), ('xanadu_common_lamp', 2)],
      'shrine': lambda a, w, d, D: [('xanadu_court_altar', 1), ('xanadu_court_statue', 1), ('xanadu_court_incense_burner', 2), ('xanadu_common_butter_lamp_rack', 2), ('xanadu_crimson_banner', 1)],
      'gallery': lambda a, w, d, D: [('xanadu_common_meditation_cushion', cs(a / 3)), ('xanadu_court_painted_hanging', cs(a / 20))],
      'drum_room': lambda a, w, d, D: [('xanadu_common_hour_drum', 1), ('xanadu_common_bench', 1), ('xanadu_common_water_clock', 1)],
      'keeper_chapel': lambda a, w, d, D: [('xanadu_court_altar', 1), ('xanadu_common_butter_lamp_rack', 4), ('xanadu_court_incense_burner', 2), ('xanadu_court_painted_hanging', cs(a / 30)), ('xanadu_veil_rack', 2)],
      'audience': lambda a, w, d, D: [('xanadu_court_throne', 1), ('xanadu_common_meditation_cushion', 8), ('xanadu_court_low_table', 2), ('xanadu_court_screen', 1), ('xanadu_crimson_banner', 1)],
      'abbot_cell': lambda a, w, d, D: [('xanadu_common_bed', 1), ('xanadu_common_chest', 1), ('xanadu_common_desk', 1), ('xanadu_common_meditation_cushion', 1)],
      'window_of_light': lambda a, w, d, D: [('xanadu_court_throne', 1), ('xanadu_common_meditation_cushion', 6), ('xanadu_court_low_table', 1), ('xanadu_common_signal_mirror', 1), ('xanadu_signal_lectern', 1)],
      'signal_room': lambda a, w, d, D: [('xanadu_signal_lectern', 1), ('xanadu_common_signal_mirror', 1), ('xanadu_common_desk', 1), ('xanadu_common_chair', 2), ('xanadu_common_board', 1), ('xanadu_common_water_clock', 1)],
      'guest_hall': lambda a, w, d, D: [('xanadu_common_table', cs(a / 60)), ('xanadu_common_bench', cs(a / 20)), ('xanadu_common_hearth', 1)],
      'kora': lambda a, w, d, D: [('xanadu_common_prayer_wheels', cs(a / 12)), ('xanadu_common_candle', cs(a / 10))],
      'stable': lambda a, w, d, D: [('xanadu_trade_stall', cs(a / 20)), ('xanadu_trade_trough', cs(a / 60)), ('xanadu_trade_hayrack', cs(a / 60))],
    }

def keymap():
    m = LS.keymap()
    m.update({'generic_lamp': 'xanadu_common_lamp', 'voth_common_cauldron': 'xanadu_common_tea_copper', 'voth_bread_oven': 'xanadu_works_bread_oven'})
    for r in ['bunk', 'locker', 'trough', 'hayrack', 'bin', 'vat', 'barrel', 'larder', 'still', 'lathe', 'press', 'kiln', 'stall']:
        m['generic_trade_' + r] = 'xanadu_trade_' + r
    return m

NEW = {
  'xanadu_eye_heliograph': 'the Eye Post\'s heliograph: a 60 cm disc of polished speculum bronze in a yoke on a stone pier, a second mirror to turn the sun when it stands behind, a sighting vane with a crosswire, and a slatted shutter on a lever',
  'xanadu_fire_basket': 'the night\'s answer: an iron fire basket on a tall stand behind a screen of hinged iron slats worked by a lever (the shutter), juniper piled beside it; lit from the Ember',
  'xanadu_ember_hearth': 'the Ember\'s hearth: a gilt bronze bowl on a stepped basalt altar under a copper hood, a pair of tongs and the brass lantern the fire is carried in',
  'xanadu_book_lectern': 'the Book of Breaths\' lectern: a sloped crimson-lacquered lectern, the great book on it chained, a water clock and a stand of brushes beside it',
  'xanadu_mirror_bench': 'the mirror bench: a grinding wheel and a silvering trough, speculum blanks in felt, rouge and pitch in boxes',
  'xanadu_crimson_banner': 'the Order of the Flashing Eye\'s banner on its lacquer stand: crimson silk, the eight-spoked wheel with an open eye at the hub, rayed',
  'xanadu_veil_rack': 'a rack of the professed\'s crimson veils (worn on the rim against the fumes) on pegs, a basin to wet them',
  'xanadu_signal_lectern': 'the signal book on a lectern beside the shutter key, the sound grid of the syllabary painted above it (shared with the Beacon\'s list)',
  'xanadu_common_hour_drum': 'a big barrel drum on a lacquer stand, beaten for the hours (shared with the Beacon\'s and the Tempest\'s lists)',
  'xanadu_common_reader_seat': 'the refectory reader\'s raised seat and lectern (shared with the Beacon\'s and the Tempest\'s lists)',
  'xanadu_common_signal_mirror': 'a 30 cm signal mirror on a tripod with a sighting vane and a shutter (shared with the Beacon\'s and the Tempest\'s lists)',
}

# ------------------------------------------------------------------------------------------------ the section
PROF = DUMP['profile']
def ground_at(u):
    for (u0, y0, _), (u1, y1, _) in zip(PROF, PROF[1:]):
        if u0 <= u <= u1: return y0 + (y1 - y0) * (u - u0) / (u1 - u0)
    return PROF[0][1] if u < PROF[0][0] else PROF[-1][1]
def model_at(u):
    for (u0, _, m0), (u1, _, m1) in zip(PROF, PROF[1:]):
        if u0 <= u <= u1: return m0 + (m1 - m0) * (u - u0) / (u1 - u0)
    return PROF[0][2] if u < PROF[0][0] else PROF[-1][2]

def draw_section():
    f_t = B.font(40, True); fs = B.font(17); fb = B.font(19, True)
    W, H = 2600, 1700; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Section along the spur (v = 0): the crater, the cap, the bench, the band and the apron (heights x2 above; below, the bench and the band, heights halved)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), 'North (the crater) on the left, south (the Rift) on the right. The ground is FLASHING_EYE.ground over a model surface like the spur\'s (the cap 84 m a km, the flank 196 m a km): the bench filled to 1,660 m, the band\'s face (200 m),', font=fs, fill=(70, 70, 70))
    dr.text((30, 94), 'its talus and the apron cut in front of the Lip, the crater\'s rampart and bowl. The dashed line is the model before the patch. Storeys about 4.2 m; the monastery\'s heights are the kit\'s (qb_monastery: two storeys of ranges, the hall on its plinth).', font=fs, fill=(70, 70, 70))
    # ---- the whole spur
    sx = 2.2 / 4 * 1.0; sy = sx * 2; ox = 40 + 2600 * sx; base = 600
    X = lambda u: ox + u * sx
    Y = lambda h: base - h * sy
    pts = [(X(u), Y(ground_at(u))) for u in range(-2600, 1401, 10)]
    dr.polygon(pts + [(X(1400), Y(-330)), (X(-2600), Y(-330))], fill=(160, 146, 130), outline=(80, 70, 60))
    mp = [(X(u), Y(model_at(u))) for u in range(-2600, 1401, 10)]
    for i in range(0, len(mp) - 1, 2): dr.line([mp[i], mp[i + 1]], fill=(60, 60, 200), width=2)
    vx = L['crater']['centre'][0]; fl = ground_at(vx)
    for k in range(5):
        dr.line([(X(vx), Y(fl)), (X(vx - 30 + 15 * k), Y(fl + 90 + 10 * (k % 2)))], fill=(220, 60, 30), width=3)
    dr.text((X(vx) - 60, Y(fl + 120) - 22), 'the vent flashes (Strombolian)', font=fs, fill=(200, 50, 20))
    dr.text((X(vx - 300), Y(ground_at(vx - 300)) - 40), 'the crater, 600 m across, 150 m deep', font=fs, fill=(0, 0, 0))
    pu = -1904; dr.rectangle([X(pu - 4), Y(ground_at(pu) + 12), X(pu + 4), Y(ground_at(pu))], fill=(168, 48, 42)); dr.text((X(pu) + 6, Y(ground_at(pu) + 12) - 24), 'the Eye Post (12 m)', font=fs, fill=(120, 30, 20))
    for u, nm in [(-1868, 'Threshold Chorten'), (-1005, 'Halfway Shelter'), (-501, 'First Breath')]:
        dr.ellipse([X(u) - 4, Y(ground_at(u)) - 8, X(u) + 4, Y(ground_at(u))], fill=(200, 160, 60)); dr.text((X(u) - 30, Y(ground_at(u)) - 30), nm, font=fs, fill=(0, 0, 0))
    dr.text((X(-1200), Y(ground_at(-1200)) - 60), 'the Way of Breath, 2 km at 8 %', font=fs, fill=(140, 100, 60))
    dr.rectangle([X(-145), Y(16), X(0), Y(0)], outline=(150, 40, 34), width=2); dr.text((X(-145), Y(16) - 24), 'the house', font=fs, fill=(150, 40, 34))
    dr.text((X(80), Y(-120)), 'the band: 200 m', font=fb, fill=(120, 60, 30))
    dr.text((X(400), Y(ground_at(400)) + 10), 'the apron eases into the flank; the Stair of the Eye goes on to the Foot House (~460 m)', font=fs, fill=(80, 60, 40))
    for k in range(0, 4001, 500):
        dr.line([(X(-2600 + k), base + 120), (X(-2600 + k), base + 130)], fill=(0, 0, 0), width=2); dr.text((X(-2600 + k) - 12, base + 134), '%d' % (-2600 + k), font=fs, fill=(0, 0, 0))
    # ---- the bench and the band, x1
    sx2 = 6.5; sy2 = 3.4; ox2 = 60 + 170 * sx2; base2 = 1000 + 30 * sy2
    X2 = lambda u: ox2 + u * sx2
    Y2 = lambda h: base2 - h * sy2
    pts = [(X2(u), Y2(ground_at(u))) for u in range(-170, 181, 1)]
    dr.polygon(pts + [(X2(180), Y2(-215)), (X2(-170), Y2(-215))], fill=(150, 140, 130), outline=(60, 60, 60))
    for c in range(2, 40, 3):   # the colonnade's joints, in the rock behind the face
        gc = ground_at(c)
        if gc > -195: dr.line([(X2(c), Y2(gc - 1)), (X2(c), Y2(-195))], fill=(110, 102, 96), width=1)
    def rect(u0, u1, h0, h1, fill, name=None, col=(0, 0, 0)):
        dr.rectangle([X2(u0), Y2(h1), X2(u1), Y2(h0)], fill=fill, outline=(30, 30, 30), width=2)
        if name: dr.text((X2(u0) + 3, Y2(h1) - 22), name, font=fs, fill=col)
    for k, nm in enumerate(['L-2 (in the rock)', 'L-1 (its windows in the face)', 'L0 the Mirror Hall, the balcony', 'L1 the mirror room']):
        rect(-14, 0, -8.4 + 4.2 * k, -4.2 + 4.2 * k, (230, 200, 190) if k < 2 else (246, 230, 224)); dr.text((X2(40), Y2(-4.2 + 4.2 * k) - 2), nm, font=fs, fill=(0, 0, 0))
    dr.text((X2(-14), Y2(8.4) - 44), 'the Lip Range', font=fb, fill=(150, 40, 34))
    rect(-44, -18, 0, 0.4, (214, 236, 250)); dr.text((X2(-44), Y2(-6) + 4), 'court; the great cistern under it', font=fs, fill=(0, 60, 120))
    dr.rectangle([X2(-42), Y2(-0.5), X2(-20), Y2(-5)], outline=(0, 90, 160), width=2)
    g = 4; P = 1.2   # the middle terrace (+4 m)
    rect(-100, -48, g, g + P, (220, 216, 206))
    rect(-100, -93, g + P, g + P + 6.4, (168, 48, 42), 'back range', (255, 255, 255))
    rect(-90.8, -73.8, g + P + 0.6, g + P + 9.6, (168, 48, 42)); dr.text((X2(-90.8) + 3, Y2(g + P + 9.6) + 2), 'Assembly Hall', font=fs, fill=(255, 255, 255))
    rect(-90.8, -73.8, g + P + 9.6, g + P + 13.2, (168, 48, 42))
    ct = g + P + 13.2
    dr.polygon([(X2(-86), Y2(ct)), (X2(-78.6), Y2(ct)), (X2(-80), Y2(ct + 3)), (X2(-82.3), Y2(ct + 4.5)), (X2(-84.6), Y2(ct + 3))], fill=(238, 200, 90), outline=(120, 80, 0))
    dr.text((X2(-112), Y2(ct + 4.5) - 22), 'the gilt crown', font=fs, fill=(120, 80, 0))
    rect(-55, -48, g + P, g + P + 9.8, (230, 120, 100), 'gate')
    rect(-136, -116, 9, 15.2, (240, 236, 228)); rect(-129.5, -118.5, 15.2, 44, (240, 236, 228)); rect(-129.5, -118.5, 44, 46.2, (168, 48, 42))
    dr.polygon([(X2(-133), Y2(46.2)), (X2(-115), Y2(46.2)), (X2(-124), Y2(56))], fill=(176, 58, 44), outline=(90, 30, 20)); dr.text((X2(-150), Y2(56) - 22), 'the Ember Tower (+9 m terrace)', font=fs, fill=(0, 0, 0))
    rect(-136, -130, 9, 13, (238, 200, 90)); dr.text((X2(-150), Y2(12) - 22), 'its sanctum (gilt), the north window to the plume', font=fs, fill=(120, 80, 0))
    rect(-146, -144, 0, 6, (150, 40, 34)); dr.text((X2(-168), Y2(6) - 22), 'north wall', font=fs, fill=(0, 0, 0))
    dr.line([(X2(-3), Y2(0)), (X2(-3), Y2(2.4))], fill=(150, 40, 34), width=4)
    dr.text((X2(40), Y2(-100)), 'the band\'s face: columnar basalt, the front of the cone\'s last flow', font=fs, fill=(60, 40, 20))
    dr.text((X2(60), Y2(-190) - 4), 'the talus', font=fs, fill=(60, 40, 20))
    dr.text((X2(40), Y2(-60)), 'meditation caves in the columns', font=fs, fill=(60, 40, 20))
    for u, h0, h1, name, col in [(-11, -8.4, 8.4, 'range stair', (0, 0, 0)), (-73, 1.2, 14.4, 'hall stair', (160, 0, 120))]:
        dr.line([(X2(u), Y2(h0)), (X2(u), Y2(h1))], fill=col, width=4); dr.text((X2(u) + 6, Y2(h1) - 24), name, font=fs, fill=col)
    dr.line([(X2(-160), Y2(-200)), (X2(-110), Y2(-200))], fill=(0, 0, 0), width=3); dr.text((X2(-160), Y2(-200) + 4), '50 m', font=fs, fill=(0, 0, 0))
    return img

def main():
    B.KEYMAP.update(keymap()); B.EXTRA_PROGRAMS.update(LS.programs()); B.EXTRA_PROGRAMS.update(programs())
    B.OPEN_KINDS.update(OPEN)
    for k in OPEN: B.KIND_FILL.setdefault(k, (214, 236, 250))
    B.KIND_FILL.update({'terrace': (226, 238, 200), 'see': (246, 236, 226), 'roof': (236, 236, 236), 'midden': (200, 186, 160), 'tank': (190, 214, 236),
                        'threshing': (236, 228, 200), 'hives': (236, 228, 190), 'cave': (150, 140, 130), 'ember_sanctum': (238, 200, 90), 'eye_roof': (230, 200, 190)})
    B.NEW.clear(); B.NEW.update(NEW); B.CITY.clear()
    intro = ('Generated by `flashing_blueprint.py` (on `settlements/voth/palace/blueprint.py`, with Longsong\'s Xanadu key map and room programmes) from the same room data as the sheets; the footprints are the layout\'s (`src/30-fe-layout.js`). Keys are catalog pieces (`kits/catalog`): `xanadu_court_*`, `xanadu_common_*`, `xanadu_trade_*`, `xanadu_works_*`, `generic_churn`. **NEW** marks a piece the catalog lacks; they are listed at the end (four are shared with the Beacon\'s and the Tempest\'s lists). Open grounds (courts, terraces, the roofs, the caves, the platform) are not dressed; the cone sheet\'s zones over 600 m2 are counted at a quarter.\n')
    B.main(floors=FLOORS, out=OUT, here=HERE, title='# The Order of the Flashing Eye\'s head house: furniture manifest\n', intro=intro, section=draw_section, zone_R=999)

if __name__ == '__main__':
    main()
