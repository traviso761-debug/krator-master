#!/usr/bin/env python3
"""The Order of the Beacon's head house over the Rift (the east shoulder, px 853,1540): the blueprint.

The site, the walls, the zones and every building's footprint come from the layout (src/30-bc-layout.js, its rules
src/31-bc-rules.js), read through `node layout_dump.js`: change a footprint there, never here. The rooms inside the
monastery (M1-MR), the Labrang (L), the Lamp Plinth (P) and the upper storeys (B2) are this blueprint's own. Sheets and
the manifest come from the shared generator settlements/voth/palace/blueprint.py, with Longsong's Xanadu key map and
monastery programmes (settlements/longsong/longsong_blueprint.py), imported, not copied.

Frame (the layout's): u runs SOUTH along the shoulder (the saddle and the road at the left of a sheet, the knoll, the
fort and the Rift at the right), v EAST (up a sheet), y up from the knoll's crown (863 m). Metres. The origin is the lamp.
The kit's great monastery (kits/qiblai qb_monastery, the gold dress o.v 2) stands at u -128..-76, v -26..26 with its
gate facing south: kit z -> u = -102 + z, kit x -> v.

    python beacon_blueprint.py        # writes floors/*.png and FURNITURE.md next to this file (needs node)
"""
import json, math, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'voth', 'palace'))
sys.path.insert(0, os.path.join(HERE, '..', 'longsong'))
import blueprint as B
from blueprint import R, box, C
import longsong_blueprint as LS
from PIL import Image, ImageDraw

OUT = os.path.join(HERE, 'floors')
DUMP = json.loads(subprocess.run(['node', os.path.join(HERE, 'layout_dump.js')], capture_output=True, text=True, check=True, encoding='utf-8').stdout)
L = DUMP['layout']
BAD = [c for c in DUMP['checks'] if not c['pass']]
if BAD:
    sys.exit('the layout fails its rules (node settlements/beacon/test-beacon.js):\n  ' + '\n  '.join(c['name'] + ': ' + c['detail'] for c in BAD))
PARTS = {p['id']: p for p in L['parts']}
WALLS = {w['id']: w for w in L['walls']}

def from_part(p, kind=None, name=None, note=None, n=None, decor=None):
    b = p['box']; r = R(p['n'] if n is None else n, name or p['name'], kind or p['kind'], b[0], b[1], b[2], b[3], p['decor'] if decor is None else decor, p['note'] if note is None else note)
    if p.get('circ'): r['circ'] = True
    return r

AXIS = 'u -> south: the saddle and the road at the left, the knoll, the fort and the Rift at the right; v east, up the sheet'
TWR = (205, 205, 200)
def sq(c, h): return [(c[0] - h, c[1] - h), (c[0] + h, c[1] - h), (c[0] + h, c[1] + h), (c[0] - h, c[1] + h)]
TOWER_FILLS = [(sq(t['at'], t['w'] / 2), TWR) for t in L['fort']['towers']]
WALL_COL = {'order': (150, 110, 40), 'sultan': (40, 40, 40)}
WALL_LINES = [([tuple(w['a']), tuple(w['b'])], WALL_COL[w['owner']], 5 if w['owner'] == 'sultan' else 4) for w in L['walls']]
GATE_FILLS = [(sq(g['at'], 2.2), (255, 255, 255)) + ((g['name'].split(' (')[0],) if g['id'] in ('gate.ward', 'gate.fort') else ()) for g in L['gates'] if g['wall']]
OUTLINE = [(-240, -60), (-68, -60), (-28.87, -29.27), (-27.6, -28), (14.4, -28), (14.4, 28), (-27.6, 28), (-28.87, 29.27), (-68, 60), (-240, 60)]
LAMPWARD_FILL = ([tuple(p) for p in L['zones']['lampward']], (242, 236, 222))
CABLE = ([tuple(p) for p in L['cable']['pts']], (190, 30, 30), 3)
KORA = ([tuple(p) for p in next(w for w in L['ways'] if w['id'] == 'kora.path')['pts']], (120, 90, 160), 2)

FLOORS = []

# ------------------------------------------------------------------------------------------------ T0 the shoulder
def bearing_line(b, length, label, col, w=3):
    a = math.radians(b); return ([(0, 0), (-math.cos(a) * length, math.sin(a) * length)], col, w, label)
SIGHTS = []
lens = {'g1': 390, 'tempest': 300, 'tears': 390, 'sauropolis': 300, 'tuatara': 390, 'march.s': 230, 'pin': 390, 'komodo': 220, 'erehwon': 390, 'eye': 260}
for s in L['lamp']['sights']:
    if s['id'] not in lens: continue
    seen = s['clear'] > 0
    lab = '%s, %d km, %d deg: %s' % (s['name'].split(' (')[0], s['km'], s['bearing'], ('seen, +%d m' % s['clear']) if seen else ('hidden, %d m' % s['clear']) + (' (by %s)' % s['via'] if s.get('via') else ''))
    SIGHTS.append(bearing_line(s['bearing'], lens[s['id']], lab, (200, 150, 20) if seen else (160, 160, 160), 3 if seen else 2))
for r in L['lamp'].get('relays', []):
    b = (math.degrees(math.atan2(r['px'][0] - L['frame']['px'][0], -(r['px'][1] - L['frame']['px'][1]))) + 360) % 360
    SIGHTS.append(bearing_line(b, 390, '%s, %d km, %d deg (seen +%d m; it sees the Eye +%d m)' % (r['name'].split(' (')[0], r['km'], b, r['seeLamp'], r['seeFar']), (150, 60, 160), 3))
T0_ROOMS = [from_part(p) for p in L['parts'] if 'T0' in p['sheets']]
FLOORS.append(dict(R=999, rect=(-560, 240, -400, 400), id='T0', tier=0,
  title='Sheet T0: the east shoulder round the house (800 x 800 m)',
  sub='The knoll at 863 m (853,1540 on the scale model; 17 C, ~990 mm, Cfb, ~1.44 atm) at the head of a spur that falls south to the Rift floor (-1,600 m within 20 km); the saddle behind it to the north and the rim rising beyond. The ravine of the tune pin is 14 km west. The road from Erehwon comes round the rim and down the saddle to the Gate of the Wheel; the fort road leaves it outside the precinct\'s west wall for the Ward Gate (the Sultan\'s men and the oil carts). Terraces on the saddle\'s flanks and the rising ground north; the byres and dairy, hives, tea, the carters\' yard, the tank. The lamp\'s sights on the 2 km grid (22 m lamp): gold seen, grey hidden. *Proposed* throughout but the site.',
  axisnote=AXIS,
  outlines=[(-246, 20, -62, 62, 'the house (sheets B1, B2)')],
  fills=[LAMPWARD_FILL + ('the lamp ward',), ([(-240, -60), (-68, -60), (-68, 60), (-240, 60)], (246, 240, 226), 'the precinct'),
         ([(-27.6, -28), (14.4, -28), (14.4, 28), (-27.6, 28)], (226, 226, 222), 'the fort')],
  lines=[([tuple(p) for p in w['pts']], (140, 100, 60), 4, w['name'].split(' (')[0]) for w in L['ways'] if w['id'] != 'kora.path']
        + [([(60, -400), (34, -150), (24, -40), (22, 0), (24, 40), (34, 150), (60, 400)], (120, 60, 30), 4, 'the brow: the scarp falls to the Rift')]
        + SIGHTS,
  rooms=T0_ROOMS))

# ------------------------------------------------------------------------------------------------ B1 ground
SEE = {'monastery': ('see', 'The Yellow Monastery (sheets M1, M2, MR)'), 'labrang': ('see', 'The Labrang (sheet L)'), 'plinth': ('see', 'The Lamp Plinth (sheet P)'),
       'novrange': ('school', 'Novices\' School (the range\'s ground floor)')}
B1_ROOMS = []
for p in L['parts']:
    if 'B1' not in p['sheets'] or p['level'] != 0: continue
    k, nm = SEE.get(p['id'], (None, None))
    B1_ROOMS.append(from_part(p, kind=k, name=nm))
ENCL = dict(R=300, rect=(-252, 24, -66, 66), poly=OUTLINE, axisnote=AXIS)
FLOORS.append(dict(ENCL, id='B1', tier=0,
  title='Sheet B1: the house, ground floor (the precinct 172 x 120 m, the lamp ward, the fort 56 x 42 m)',
  sub='The owner\'s forks (2026-11-16): the east shoulder; about 300 monks with the gold Prismarch here; the Sultan\'s watch fort above and the monastery below (Gyantse); the lamp lit every night. Brown walls are the order\'s, black the Sultan\'s. The Gate of the Wheel (north) takes the road into the gate court, the Labrang beyond it receives envoys without opening the cloister; the kora (purple) leads round the Yellow Monastery to its gate, which faces south through the Gate of the Lamp, up the Lamp Stair to the fort\'s gate and its gilt pavilion. The Sultan\'s men and the oil carts come by the fort road to the Ward Gate in Gyantse\'s west wall and never cross the precinct. The cable (red) runs from the Generator House through the fort\'s gate passage to the Lamp Plinth in the keep\'s place. The fort\'s towers are drawn grey.',
  fills=[LAMPWARD_FILL] + TOWER_FILLS + GATE_FILLS,
  lines=WALL_LINES + [CABLE, KORA],
  rooms=B1_ROOMS))

# ------------------------------------------------------------------------------------------------ B2 upper storeys
def pb(i): return PARTS[i]['box']
g = pb('granary'); s = pb('school'); lt = pb('lights')
B2_ROOMS = [
  R(1, 'Porter\'s loft and the wheel\'s gear', 'guard', *pb('roadgate'), 1, 'the lay guard of the Labrang sleeps at the gate on rota'),
  R(2, 'Guest Chambers', 'lodging', *pb('guests'), 2, 'a dozen rooms; the hosteller'),
  R(3, 'Lay Brothers\' Dormitory', 'dormitory', g[0], -219, g[2], g[3], 1, 'the granary\'s ten'),
  R(4, 'Upper Stores', 'store', -219, g[1], g[2], g[3], 0),
  R(5, 'Household Dormitory', 'dormitory', *pb('household'), 1),
  R(6, 'Novices\' Dormitory', 'dormitory', *pb('novrange'), 1, 'sixty boys in two rows; a lamp burns all night'),
  R(7, 'Master of Novices\' chamber', 'chamber', *pb('novmaster'), 2),
  R(8, 'Infirmary, upper ward', 'infirmary', *pb('infirmary'), 2, 'the infirmarer and three lay brothers'),
  R(9, 'Keepers\' Dormitory', 'dormitory', s[0], -148, s[2], s[3], 1, 'thirty-six keepers in training and their masters'),
  R(10, 'Library of Lights', 'library', -148, s[1], s[2], s[3], 3, 'optics, the engines\' books, the signal book\'s copies, the Ancient manuals the Geomancers lent and the order copied'),
  R(11, 'Cooks\' Dormitory', 'dormitory', *pb('kitchen'), 1),
  R(12, 'Gallery of the Register', 'gallery', lt[0], lt[1], lt[2], 38, 3, 'round the Hall of Lights\' void: the Book of Lights read aloud on the order\'s feasts'),
  R(13, 'Hall of Lights (open below)', 'gallery_void', lt[0], lt[1], 38, lt[3], 0),
  R(14, 'Barracks, upper floor (the fort asset\'s)', 'barracks', *pb('barracks'), 1),
  R(15, 'Gate chamber and the gilt pavilion (the fort\'s)', 'guard', -31, -26, -4, 4, 3, 'the fort asset\'s gate: its chamber, the pavilion on its roof'),
  R(16, 'The Yellow Monastery (sheet M2)', 'see', *pb('monastery'), 4),
  R(17, 'The Labrang (sheet L)', 'see', *pb('labrang'), 4),
  R(18, 'The Lamp Plinth (sheet P)', 'see', *pb('plinth'), 3)]
WALKS = [([(-27.6 + 0.8, -27.2), (13.6, -27.2), (13.6, 27.2), (-26.8, 27.2), (-26.8, -27.2)], (150, 120, 170), 2, 'the fort\'s wall walk'),
         ([(-68, -60), (-28.87, -29.27)], (150, 120, 170), 2), ([(-68, 60), (-28.87, 29.27)], (150, 120, 170), 2, 'Gyantse\'s walks to the fort\'s corner towers')]
FLOORS.append(dict(ENCL, id='B2', tier=0,
  title='Sheet B2: the house, upper storeys',
  sub='The ranges\' upper floors: the dormitories over the kitchen, granary, novices\' range, the school and the household; the Library of Lights over the Lamp School; the gallery round the Hall of Lights. Gyantse\'s two walls carry walks (purple) from the precinct\'s south corners up to the fort\'s north-west and north-east towers, so the fort\'s walk and the order\'s are one: in a raid the lay brothers carry water and arrows up them. The monastery, the Labrang and the plinth have their own sheets.',
  fills=[LAMPWARD_FILL] + TOWER_FILLS,
  lines=WALL_LINES + WALKS,
  rooms=B2_ROOMS))

# ------------------------------------------------------------------------------------------------ the Yellow Monastery (the kit block)
MU = -102
def K(n, name, kind, z0, z1, x0, x1, decor, note=''):
    """a room in the kit block's frame (x across, z toward its gate): u = -102 + z, v = x"""
    return R(n, name, kind, MU + z0, MU + z1, x0, x1, decor, note)
M_FRONT_W = (MU + 19, MU + 26, -9, -5)         # the front stairs, one each side of the gate tower
M_FRONT_E = (MU + 19, MU + 26, 5, 9)
M_BACK = (MU - 26, MU - 22.5, 15, 19)          # the back stair: the Prior, the chant-master
M_HALL = (MU - 2, MU + 0.2, 8, 11.8)           # the hall stair: the Masters' Gallery, the Keeper's chapel, the roof
MBLOCK = dict(R=300, rect=(MU - 30, MU + 30, -30, 30), poly=[(MU - 26, -26), (MU + 26, -26), (MU + 26, 26), (MU - 26, 26)],
              axisnote='u -> south: the hall at the left (north), the gate at the right facing the lamp; v east, up')
FLOORS.append(dict(MBLOCK, id='M1', tier=0,
  title='Sheet M1: the Yellow Monastery, ground floor (the kit\'s 52 m great monastery, gold dress)',
  sub='The kit\'s block whole (kits/qiblai qb_monastery, o.v 2: the gold walls 0xd4b040, the red trim, the brown band; two storeys of ranges; the Song drum in the court). Its gate faces south: the Gate of the Light opens on the precinct\'s Gate of the Lamp and the stair to the fort. The Assembly Hall at the back under the gilt crown; the inner kora round the hall; the chapter\'s cells two to a room.',
  rooms=[
    K(1, 'Gate of the Light', 'gatehouse', 19, 26, -5, 5, 3, 'the gate tower; the doorkeeper; the boots left here'),
    box(2, 'Front stair (west)', 'stair', M_FRONT_W, 0), box(3, 'Front stair (east)', 'stair', M_FRONT_E, 0),
    K(4, 'Sacristy', 'sacristy', 19, 26, -26, -9, 2, 'the hall\'s vestments, the processional lamps carried to the fort'),
    K(5, 'Butter and Oil for the Hall', 'store', 19, 26, 9, 26, 0, 'the hall\'s lamps filled here'),
    K(6, 'Court of the Drum', 'cloister_court', 3.4, 19, -16.6, 16.6, 2, 'the paving; the spoke\'s piece'),
    C(7, 'Song Drum', 'song_drum', MU + 13.2, 0, 2.2, 3, 'the kit\'s piece for this spoke: the drum under its little roof, its three gilt rings'),
    K(8, 'Cloister walk (west)', 'cloister_walk', 3.4, 19, -19, -16.6, 1), K(9, 'Cloister walk (east)', 'cloister_walk', 3.4, 19, 16.6, 19, 1),
    K(10, 'Library of the Light', 'library', -19, 3.4, -26, -19, 3, 'the Song\'s commentaries of the gold spoke'),
    K(11, 'Scriptorium', 'scriptorium', 3.4, 19, -26, -19, 2),
    K(12, 'Chapter House', 'chapter_house', -19, -5, 19, 26, 3, 'the daily chapter: the night\'s log of the lamp read first'),
    K(13, 'Treasury', 'treasury', -5, 5, 19, 26, 2, 'the offerings of gold and the order\'s seal'),
    K(14, 'Old Brothers\' Cells', 'cells', 5, 19, 19, 26, 1, 'the keepers too old for the stair'),
    K(15, 'Inner kora (west)', 'kora', -19, 3.4, -19, -12, 2, 'round the hall, wheels on its wall'),
    K(16, 'Inner kora (east)', 'kora', -19, 3.4, 12, 19, 2),
    K(17, 'Porch', 'porch', 0.2, 3.4, -6, 6, 3, 'the painted portico'),
    K(26, 'Porch flank (the kit\'s drums)', 'porch', 0.2, 3.4, -12, -6, 2), K(27, 'Porch flank (the kit\'s drums)', 'porch', 0.2, 3.4, 6, 12, 2),
    K(18, 'Assembly Hall', 'assembly', -16.8, 0.2, -12, 12, 4, 'two storeys; the gold Prismarch\'s throne; the chapter sings the Song facing south, toward the lamp'),
    box(19, 'Hall stair', 'stair', M_HALL, 0),
    K(20, 'Inner kora (north)', 'kora', -19, -16.8, -12, 12, 2),
    K(21, 'Shrine of the Light', 'shrine', -26, -19, -8, 8, 4, 'behind the hall on the axis: the Damsel with her dulcimer and a lamp that is never let out'),
    K(22, 'Chapter cells (west)', 'cells', -26, -19, -26, -8, 1),
    K(23, 'Chapter cells (east)', 'cells', -26, -19, 8, 15, 1), box(24, 'Back stair', 'stair', M_BACK, 0),
    K(28, 'Back stair landing', 'passage', -22.5, -19, 15, 19, 0),
    K(25, 'Chapter cells (north-east)', 'cells', -26, -19, 19, 26, 1)]))
FLOORS.append(dict(MBLOCK, id='M2', tier=1,
  title='Sheet M2: the Yellow Monastery, upper floor and the hall\'s gallery',
  sub='The chapter\'s cells round the court (149 monks, two to a cell), the Prior and the chant-master over the back stair, the Masters\' Gallery round the Assembly Hall\'s void, the Drum of the Hours in the gate tower, the daughter house\'s brothers in the front range.',
  rooms=[
    K(1, 'Drum of the Hours', 'drum_room', 19, 26, -5, 5, 2, 'the gate tower\'s upper storey: the hours beaten, and the lamp\'s lighting at dusk'),
    box(2, 'Front stair (west)', 'stair', M_FRONT_W, 0), box(3, 'Front stair (east)', 'stair', M_FRONT_E, 0),
    K(4, 'Cells of the daughter house\'s brothers', 'cells', 19, 26, -26, -9, 1, 'monks of Qiblai\'s gold house in their years here'),
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
  title='Sheet MR: the Yellow Monastery, the hall\'s third storey and the roofs',
  sub='The Keeper\'s Chapel at the top of the hall (the gold spoke\'s protector room: dark, its lamps, the order\'s first lamp under silk), the roof terraces of the ranges, the gilt crown with the wheel and deer over the hall (the holy crown, the kit\'s), the gate tower\'s roof with the gold banner turned toward the lamp.',
  rooms=[
    K(1, 'Gate tower roof', 'roof', 19, 26, -5, 5, 1, 'the gold banner; the deer and wheel (the kit\'s crown, pav false)'),
    K(2, 'Range roofs (south)', 'roof', 19, 26, -26, -5, 0), K(3, 'Range roofs (south)', 'roof', 19, 26, 5, 26, 0),
    K(4, 'Range roofs (west)', 'roof', -19, 19, -26, -19, 0), K(5, 'Range roofs (east)', 'roof', -19, 19, 19, 26, 0),
    K(6, 'Range roofs (north)', 'roof', -26, -19, -26, 26, 0),
    K(7, 'The Keeper\'s Chapel', 'keeper_chapel', -16.8, 0.2, -12, 12, 4, 'the hall\'s third storey (3.6 m): the protector of lights; the dead keepers\' lamps on its pillars'),
    box(8, 'Hall stair (to the roof and the crown)', 'stair', M_HALL, 0),
    K(9, 'Court (open)', 'void', 0.2, 19, -19, 19, 0)]))

# ------------------------------------------------------------------------------------------------ L the Labrang: four floors side by side
LB = PARTS['labrang']['box']   # u -200..-164, v -18..18
def LF(k, rooms):
    out = []
    for r in rooms:
        r = dict(r); r['u0'] += 44 * k; r['u1'] += 44 * k; out.append(r)
    return out
L_ST = (-200, -194, 10, 18)
LR = []
LR += LF(0, [R(1, 'Envoys\' Hall', 'hall', -200, -188, -10, 10, 3, 'the north door from the gate court: the Sultan\'s commander, the oil factor, envoys'), R(2, 'Guard of the Labrang', 'guard', -200, -188, -18, -10, 1, 'lay brothers, unarmed but for staves'),
             box(3, 'Stair', 'stair', L_ST, 0), R(4, 'Porter', 'guard', -194, -188, 10, 18, 1), R(5, 'Treasury of Offerings', 'treasury', -188, -176, -18, -6, 2),
             R(6, 'Light court', 'court', -188, -176, -6, 6, 2, 'open to the sky through all four floors'), R(7, 'Secretariat of the Register', 'office', -188, -176, 6, 18, 2, 'letters to the order\'s other lights'),
             R(8, 'Hall of Petitions', 'hall', -176, -164, -18, 18, 2, 'the south door onto the kora garden: the brothers come to their Prismarch this way')])
LR += LF(1, [R(9, 'Audience Hall', 'audience', -200, -188, -10, 10, 4, 'the gold Prismarch receives the Sultan\'s commander and the council\'s envoys'), R(10, 'Secretary', 'office', -200, -188, -18, -10, 2),
             box(11, 'Stair', 'stair', L_ST, 0), R(12, 'Robing', 'wardrobe', -194, -188, 10, 18, 2), R(13, 'Council of the Order', 'council', -188, -176, -18, -6, 3, 'the Prismarch, the Prior, the Master of the Lamp, the Master of the School, the Cellarer'),
             R(14, 'Light court (open)', 'void', -188, -176, -6, 6, 0), R(15, 'Archive of the Book of Lights', 'archive', -188, -176, 6, 18, 2),
             R(16, 'Library of the Prismarch', 'library', -176, -164, -18, 18, 3)])
LR += LF(2, [R(17, 'Household monks\' cells', 'cells', -200, -188, -18, 10, 1, 'his eight'), box(18, 'Stair', 'stair', L_ST, 0), R(32, 'Attendant on duty', 'chamber', -194, -188, 10, 18, 1),
             R(19, 'Chamberlain', 'chamber', -188, -176, -18, -6, 2), R(20, 'Light court (open)', 'void', -188, -176, -6, 6, 0), R(21, 'Secretary\'s chamber', 'chamber', -188, -176, 6, 18, 2),
             R(22, 'The Prismarch\'s cell', 'abbot_cell', -176, -164, -18, -4, 3), R(23, 'His study', 'cabinet', -176, -164, -4, 8, 3), R(24, 'His oratory', 'chapel', -176, -164, 8, 18, 4)])
LR += LF(3, [R(25, 'Chapel of the Gold Light', 'shrine', -200, -188, -10, 10, 4, 'the Prismarch\'s own: gilt within'), box(26, 'Stair', 'stair', L_ST, 0), R(27, 'Roof terrace', 'roof', -200, -188, -18, -10, 0), R(33, 'Roof terrace (north-east)', 'roof', -194, -188, 10, 18, 0),
             R(28, 'Roof terrace (west)', 'roof', -188, -176, -18, -6, 0), R(29, 'Light court (open)', 'void', -188, -176, -6, 6, 0), R(30, 'Roof terrace (east)', 'roof', -188, -176, 6, 18, 0),
             R(31, 'The Window of Light', 'window_of_light', -176, -164, -18, 18, 4, 'a gallery of tall windows facing south over the hall\'s crown to the lamp: the Prismarch keeps the night\'s first watch here when he is home')])
FLOORS.append(dict(R=300, rect=(-204, -32, -22, 22), id='L', tier=0,
  title='Sheet L: the Labrang, the gold Prismarch\'s house (36 x 36 m), its four floors side by side',
  sub='L0 (left) the envoys and the order\'s business; L1 audience and council; L2 the Prismarch\'s rooms; L3 his chapel and the Window of Light. The floors are drawn 44 m apart along u; each is the same 36 x 36 m at u -200..-164. A light court breathes through all four. North is at the left of each floor (the gate court), south at the right (the kora garden, the monastery, the lamp).',
  axisnote='each floor: u -> south (the Window of Light at the right); v east, up. Floors L0, L1, L2, L3 from the left',
  outlines=[(LB[0] + 44 * k, LB[1] + 44 * k, LB[2], LB[3], 'L%d' % k) for k in range(4)],
  rooms=LR))

# ------------------------------------------------------------------------------------------------ P the Lamp Plinth: five levels side by side
P_ST = (-5, -2, -5, -1)
def PF(k, rooms):
    out = []
    for r in rooms:
        r = dict(r); r['u0'] += 16 * k; r['u1'] += 16 * k; out.append(r)
    return out
PR = []
PR += PF(0, [box(1, 'Stair', 'stair', P_ST, 0), R(2, 'Switch Room', 'switch_room', -5, 5, -1, 5, 1, 'the cable\'s end from the gate passage; the Ancient switchboard, refitted'), R(3, 'Cable Vault', 'store', -2, 5, -5, -1, 0, 'spare cable, the shutter\'s spare parts')])
PR += PF(1, [box(4, 'Stair', 'stair', P_ST, 0), R(5, 'Signal Room', 'signal_room', -5, 5, -1, 5, 2, 'the order\'s reader and the Sultan\'s signaller side by side: the signal book, the grid of the syllabary'), R(6, 'Log', 'office', -2, 5, -5, -1, 1, 'the lamp\'s night book')])
PR += PF(2, [box(7, 'Stair', 'stair', P_ST, 0), R(8, 'The Lamp Watch', 'lamp_watch', -5, 5, -1, 5, 1, 'three keepers on the night\'s watch; the tea copper'), R(9, 'Keepers\' store', 'store', -2, 5, -5, -1, 0)])
PR += PF(3, [box(10, 'Stair', 'stair', P_ST, 0), R(11, 'Chapel of the Beacon', 'beacon_chapel', -5, 5, -1, 5, 4, 'yellow-washed, its roof and finial gilt: the fort\'s chapel (the forts\' gold, the owner, 2026-11-16)'), R(12, 'Sacristy of the Beacon', 'store', -2, 5, -5, -1, 1)])
PR += PF(4, [R(14, 'Lamp roof', 'roof', -6, 6, -6, 6, 1, 'the parapet walk round the mount'), box(13, 'Hatch', 'stair', P_ST, 0), C(15, 'The lamp on its mount', 'lamp_roof', 1, 1, 1.3, 3, 'the Ancient lamp head on its slewing ring (2.6 m): kits/ancients\' new piece')])
FLOORS.append(dict(R=300, rect=(-8, 72, -10, 10), id='P', tier=0,
  title='Sheet P: the Lamp Plinth in the keep\'s place (12 x 12 m, 18 m), its five levels side by side',
  sub='The fort asset\'s keep footing is the lamp\'s plinth (5.7 of the Strongwall plan): P0 the switch room and cable vault, P1 the signal room the order and the Sultan share, P2 the Lamp Watch, P3 the Chapel of the Beacon (gilt), P4 the roof with the lamp head on its mount at 22 m. One stair in the wall\'s thickness. The order keeps everything here; the fort round it is the Sultan\'s.',
  axisnote='each level: u -> south (the Rift); v east, up. P0 to P4 from the left, 16 m apart',
  outlines=[(-6 + 16 * k, 6 + 16 * k, -6, 6, 'P%d' % k) for k in range(5)],
  rooms=PR))

# ------------------------------------------------------------------------------------------------ the manifest
OPEN = {'yard', 'stair_way', 'terrace', 'field', 'threshing', 'midden', 'tank', 'oil_pit', 'hives', 'cloister_court', 'cloister_walk', 'song_drum',
        'roof', 'see', 'porch', 'lamp_roof'}
cs = lambda n: max(1, round(n))
def programs():
    return {
      'gatehouse': lambda a, w, d, D: [('xanadu_common_prayer_wheels', 2), ('xanadu_common_bench', 2), ('xanadu_common_lamp', 2)],
      'cells': lambda a, w, d, D: [('xanadu_common_bed', cs(a / 10)), ('xanadu_common_chest', cs(a / 10)), ('xanadu_common_meditation_cushion', cs(a / 10)), ('xanadu_common_candle', cs(a / 20)), ('xanadu_common_prayer_wheels', cs(a / 200))],
      'novices': lambda a, w, d, D: [],
      'lamp_school': lambda a, w, d, D: [('xanadu_common_desk', cs(a / 25)), ('xanadu_common_chair', cs(a / 25)), ('order_writing_board', 2), ('xanadu_lens_bench', 2), ('xanadu_common_bookcase', cs(a / 80)), ('xanadu_signal_lectern', 1), ('xanadu_common_signal_mirror', 2)],
      'hall_of_lights': lambda a, w, d, D: [('xanadu_register_of_lights', cs(a / 60)), ('xanadu_court_altar', 1), ('xanadu_common_butter_lamp_rack', cs(a / 40)), ('xanadu_court_bookcase', 2), ('xanadu_court_gold_banner', 1)],
      'butter_lamps': lambda a, w, d, D: [('xanadu_common_butter_lamp_rack', cs(a / 6)), ('xanadu_common_store', 2), ('xanadu_common_tea_copper', 1)],
      'generator': lambda a, w, d, D: [('xanadu_generator_set', 2), ('xanadu_lamp_switchboard', 1), ('job_oil_drum_rack', 2), ('xanadu_common_workbench', 1), ('xanadu_cable_drum', 1)],
      'refectory': lambda a, w, d, D: [('xanadu_common_table', cs(a / 12)), ('xanadu_common_bench', cs(a / 6)), ('xanadu_common_reader_seat', 1), ('xanadu_common_tea_copper', 1)],
      'byre': lambda a, w, d, D: [('xanadu_trade_stall', cs(a / 30)), ('xanadu_trade_trough', cs(a / 150)), ('generic_churn', 4), ('xanadu_works_churn', 2)],
      'chorten': lambda a, w, d, D: [('xanadu_court_chorten', 1)],
      'sacristy': lambda a, w, d, D: [('xanadu_common_chest', 2), ('xanadu_common_rack', 2), ('xanadu_court_cabinet', 1)],
      'chapter_house': lambda a, w, d, D: [('xanadu_court_throne', 1), ('xanadu_common_meditation_cushion', cs(a / 2.5)), ('xanadu_court_low_table', 1)],
      'shrine': lambda a, w, d, D: [('xanadu_court_altar', 1), ('xanadu_court_statue', 1), ('xanadu_court_incense_burner', 2), ('xanadu_common_butter_lamp_rack', 2), ('xanadu_court_gold_banner', 1)],
      'gallery': lambda a, w, d, D: [('xanadu_common_meditation_cushion', cs(a / 3)), ('xanadu_court_painted_hanging', cs(a / 20))],
      'drum_room': lambda a, w, d, D: [('xanadu_common_hour_drum', 1), ('xanadu_common_bench', 1), ('xanadu_common_water_clock', 1)],
      'keeper_chapel': lambda a, w, d, D: [('xanadu_court_altar', 1), ('xanadu_court_relic_lamp', 1), ('xanadu_common_butter_lamp_rack', 4), ('xanadu_court_incense_burner', 2), ('xanadu_court_painted_hanging', cs(a / 30))],
      'audience': lambda a, w, d, D: [('xanadu_court_throne', 1), ('xanadu_common_meditation_cushion', 8), ('xanadu_court_low_table', 2), ('xanadu_court_screen', 1), ('xanadu_court_gold_banner', 1)],
      'abbot_cell': lambda a, w, d, D: [('xanadu_common_bed', 1), ('xanadu_common_chest', 1), ('xanadu_common_desk', 1), ('xanadu_common_meditation_cushion', 1)],
      'window_of_light': lambda a, w, d, D: [('xanadu_court_throne', 1), ('xanadu_common_meditation_cushion', 6), ('xanadu_court_low_table', 1), ('xanadu_common_signal_mirror', 1)],
      'switch_room': lambda a, w, d, D: [('xanadu_lamp_switchboard', 1), ('xanadu_cable_drum', 1), ('xanadu_common_chest', 1)],
      'signal_room': lambda a, w, d, D: [('xanadu_signal_lectern', 1), ('xanadu_common_signal_mirror', 1), ('xanadu_common_desk', 1), ('xanadu_common_chair', 2), ('xanadu_common_board', 1), ('xanadu_common_water_clock', 1)],
      'lamp_watch': lambda a, w, d, D: [('xanadu_common_bed', 3), ('xanadu_common_chest', 3), ('xanadu_common_tea_copper', 1), ('xanadu_common_table', 1), ('xanadu_common_bench', 1)],
      'beacon_chapel': lambda a, w, d, D: [('xanadu_court_altar', 1), ('xanadu_common_butter_lamp_rack', 2), ('xanadu_court_incense_burner', 1), ('xanadu_court_statue', 1), ('xanadu_common_meditation_cushion', 3), ('xanadu_court_gold_banner', 1)],
      'lamp_roof': lambda a, w, d, D: [('anc_beacon_lamp', 1)],
      'workshop': lambda a, w, d, D: [('xanadu_common_workbench', cs(a / 40)), ('xanadu_common_rack', cs(a / 60)), ('xanadu_common_store', cs(a / 60)), ('xanadu_lens_bench', 1), ('xanadu_cable_drum', 1)],
      'pavilion': lambda a, w, d, D: [],
      'caravanserai': lambda a, w, d, D: [('xanadu_trade_trough', cs(a / 100)), ('xanadu_trade_hayrack', cs(a / 100)), ('xanadu_common_bench', cs(a / 200)), ('job_oil_drum_rack', 2)],
      'magazine': lambda a, w, d, D: [('xanadu_common_store', 2)],
      'stable': lambda a, w, d, D: [('xanadu_trade_stall', cs(a / 12)), ('xanadu_trade_trough', cs(a / 60)), ('xanadu_trade_hayrack', cs(a / 60))],
      'guest_hall': lambda a, w, d, D: [('xanadu_common_table', cs(a / 60)), ('xanadu_common_bench', cs(a / 20)), ('xanadu_common_hearth', 1)],
      'kora': lambda a, w, d, D: [('xanadu_common_prayer_wheels', cs(a / 12)), ('xanadu_common_candle', cs(a / 10))],
    }

def keymap():
    m = LS.keymap()
    m.update({'voth_court_armour_stand': 'xanadu_common_armour_stand', 'generic_trade_weapon_rack': 'xanadu_common_weapon_rack',
              'voth_bread_oven': 'xanadu_works_bread_oven', 'generic_lamp': 'xanadu_common_lamp', 'voth_common_cauldron': 'xanadu_common_tea_copper'})
    for r in ['bunk', 'locker', 'trough', 'hayrack', 'bin', 'vat', 'barrel', 'larder', 'still', 'lathe', 'press', 'kiln', 'stall']:
        m['generic_trade_' + r] = 'xanadu_trade_' + r
    return m

NEW = {
  'anc_beacon_lamp': '**kits/ancients, not the catalog**: the Ancient high-intensity lamp head, a fat white-metal drum 1.6 m across and 2.2 m long with a glazed face 1.4 m across and cooling fins, on a slewing yoke and ring 2.6 m across; Xanadui iron straps and a new cable gland. Drawn with the lighthouse beam (89n `lhBeamGeo`)',
  'xanadu_lamp_switchboard': 'the Ancient switchboard refitted: a slate panel of brass levers and dials, the shutter key on a cord, a small lamp that shows the engine is running',
  'xanadu_generator_set': 'an engine set of the Geomancers\' make on an Ancient engine: a cast block on a timber bed, flywheel, exhaust stack through the roof, a day tank',
  'xanadu_cable_drum': 'a timber drum of spare cable on its stand',
  'xanadu_lens_bench': 'the lens bench: a padded cradle, chamois and polishing rouge in a box, a brass gauge, a hooded lamp',
  'xanadu_signal_lectern': 'the signal book on a lectern beside the shutter key, the sound grid of the syllabary painted on a board above it (a syllable is a row and a column of flashes)',
  'xanadu_register_of_lights': 'a stepped shelf of small brass lamps, one for each light the order keeps, a name tablet under each',
  'xanadu_court_gold_banner': 'the Order of the Beacon\'s banner on its lacquer stand: gold silk, the eight-spoked wheel with a ray from its hub',
  'xanadu_court_relic_lamp': 'the order\'s first lamp: a small dead Ancient lamp on a gilt stand under a silk cover',
  'xanadu_common_hour_drum': 'a big barrel drum on a lacquer stand, beaten for the hours (shared with the House of the Tempest\'s list)',
  'xanadu_common_reader_seat': 'the refectory reader\'s raised seat and lectern (shared with the House of the Tempest\'s list)',
  'xanadu_common_signal_mirror': 'a signal mirror on a tripod with a sighting vane and a shutter (shared with the House of the Tempest\'s list)',
}

# ------------------------------------------------------------------------------------------------ the section
def ground_at(u):
    G = L['ground']
    for (u0, y0), (u1, y1) in zip(G, G[1:]):
        if u0 <= u <= u1: return y0 + (y1 - y0) * (u - u0) / (u1 - u0)
    return G[0][1] if u < G[0][0] else G[-1][1]

def draw_section():
    f_t = B.font(40, True); fs = B.font(17)
    W, H = 2500, 900; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Section along the axis (v = 0), from the road gate to the lamp and the scarp (heights x2)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), 'North (the saddle, the road) on the left; south (the Rift) on the right. The ground (the layout\'s, assumed until the region is cut), the storeys (about 4.2 m) and the Labrang\'s height are assumptions;', font=fs, fill=(70, 70, 70))
    dr.text((30, 94), 'the monastery\'s heights are the kit\'s (qb_monastery gold: two storeys of ranges, the hall 5 + 4 + 3.6 m on its plinth), the fort\'s the asset\'s (curtain 6 m, keep 18 m).', font=fs, fill=(70, 70, 70))
    sx = 6.6; sy = 13.2; ox = 40 + 262 * sx; base = H - 230
    X = lambda u: ox + u * sx
    Y = lambda h: base - h * sy
    pts = [(X(u), Y(ground_at(u))) for u in range(-262, 101, 2)]
    dr.polygon(pts + [(X(100), Y(-40)), (X(-262), Y(-40))], fill=(228, 214, 190), outline=(120, 100, 80))
    def rect(u0, u1, h0, h1, fill, name=None, col=(0, 0, 0), up=True):
        dr.rectangle([X(u0), Y(h1), X(u1), Y(h0)], fill=fill, outline=(30, 30, 30), width=2)
        if name: dr.text((X(u0) + 3, Y(h1) - 22 if up else Y(h1) + 3), name, font=fs, fill=col)
    def on(u0, u1): return max(ground_at(u0), ground_at(u1))
    g = on(-246, -234); rect(-246, -234, g, g + 8.4, (236, 232, 218), 'Gate of the Wheel')
    g = on(-200, -164)
    for k, nm in enumerate(['L0 envoys', 'L1 audience', 'L2 the Prismarch', 'L3 Window of Light']):
        rect(-200, -164, g + 4.2 * k, g + 4.2 * (k + 1), (238, 220, 150) if k == 3 else (250, 246, 230)); dr.text((X(-200) + 3, Y(g + 4.2 * (k + 1)) + 2), nm, font=fs, fill=(0, 0, 0))
    dr.text((X(-200), Y(g + 16.8) - 22), 'the Labrang', font=fs, fill=(0, 0, 0))
    dr.text((X(-160), Y(ground_at(-150)) - 24), 'kora garden', font=fs, fill=(0, 90, 0))
    g = ground_at(-102); P = 1.2
    rect(-128, -76, g, g + P, (220, 216, 206))
    rect(-128, -121, g + P, g + P + 6.4, (240, 226, 160), 'back range')
    rect(-118.8, -101.8, g + P + 0.6, g + P + 0.6 + 9, (212, 176, 64)); dr.text((X(-118.8) + 3, Y(g + P + 9.6) + 2), 'Assembly Hall', font=fs, fill=(0, 0, 0))
    rect(-118.8, -101.8, g + P + 9.6, g + P + 13.2, (212, 176, 64)); dr.text((X(-118.8) + 3, Y(g + P + 13.2) + 2), 'Keeper\'s Chapel', font=fs, fill=(0, 0, 0))
    ct = g + P + 13.2
    dr.polygon([(X(-114), Y(ct)), (X(-106.6), Y(ct)), (X(-108), Y(ct + 3)), (X(-110.3), Y(ct + 4.5)), (X(-112.6), Y(ct + 3))], fill=(238, 200, 90), outline=(120, 80, 0))
    dr.text((X(-104), Y(ct + 4.5) - 22), 'the gilt crown', font=fs, fill=(120, 80, 0))
    rect(-101.8, -98.6, g + P + 0.6, g + P + 5.2, (236, 232, 218))
    dr.text((X(-97), Y(g + P) - 24), 'court', font=fs, fill=(0, 0, 0))
    rect(-90.8, -86.8, g + P, g + P + 4.2, (238, 220, 150)); dr.text((X(-93), Y(g + P + 4.2) - 22), 'Song drum', font=fs, fill=(0, 0, 0))
    rect(-83, -76, g + P, g + P + 9.8, (250, 250, 240), 'Gate of the Light')
    gw = ground_at(-68); rect(-69, -67, gw, gw + 6, (200, 170, 110)); dr.text((X(-75), Y(gw + 6) - 44), 'precinct wall, Gate of the Lamp', font=fs, fill=(0, 0, 0))
    dr.line([(X(-65), Y(ground_at(-65))), (X(-40), Y(ground_at(-40)))], fill=(150, 110, 40), width=6); dr.text((X(-64), Y(ground_at(-52)) - 30), 'the Lamp Stair', font=fs, fill=(150, 110, 40))
    rect(-32.4, -26.4, 0, 11, (236, 232, 218), 'fort gate')
    rect(-30.5, -27.5, 11, 13.5, (238, 200, 90)); dr.text((X(-48), Y(13.5) - 22), 'gilt pavilion', font=fs, fill=(120, 80, 0))
    for h0, h1, nm in [(0, 4.5, 'P0 switch room'), (4.5, 9, 'P1 signal room'), (9, 13.5, 'P2 Lamp Watch')]:
        rect(-6, 6, h0, h1, (250, 250, 240)); dr.text((X(-6) + 3, Y(h1) + 2), nm, font=fs, fill=(0, 0, 0))
    rect(-6, 6, 13.5, 18, (238, 220, 150)); dr.text((X(-6) + 3, Y(18) + 2), 'P3 Chapel of the Beacon', font=fs, fill=(0, 0, 0))
    rect(-1.3, 1.3, 18, 19.2, (120, 120, 120))
    dr.rectangle([X(-1.1), Y(22.8), X(1.1), Y(19.2)], fill=(236, 236, 240), outline=(30, 30, 30), width=2)
    dr.text((X(2), Y(23) - 22), 'the Ancient lamp head, 22 m', font=fs, fill=(0, 0, 0))
    for d in (-1, 1):
        dr.line([(X(1.2), Y(21)), (X(100), Y(21 + d * 2.2))], fill=(240, 200, 60), width=2)
    dr.text((X(40), Y(24) - 22), 'the beam, swept over the Rift', font=fs, fill=(160, 120, 0))
    dr.line([(X(-1.1), Y(22.5)), (X(-22), Y(40))], fill=(240, 200, 60), width=2); dr.text((X(-70), Y(40) - 22), 'raised to the Station when it passes', font=fs, fill=(160, 120, 0))
    rect(13.2, 15.6, 0, 6, (236, 232, 218)); dr.text((X(10), Y(6) - 44), 'south curtain', font=fs, fill=(0, 0, 0))
    dr.text((X(40), Y(ground_at(60)) + 6), 'the scarp: the Rift floor at -1,600 m within 20 km', font=fs, fill=(120, 60, 30))
    cl = [(-27.6, 0), (-6, 0)]; dr.line([(X(-50), Y(ground_at(-50) - 0.5)), (X(-27.6), Y(-0.5)), (X(-6), Y(-0.5))], fill=(190, 30, 30), width=3)
    dr.text((X(-58), Y(ground_at(-50)) + 6), 'the cable from the Generator House, under the gate passage', font=fs, fill=(190, 30, 30))
    k = 0
    for u, h0, h1, name, col in [(-197, ground_at(-197), ground_at(-197) + 12.6, 'Labrang stair', (0, 0, 0)), (-80, ground_at(-80) + 1.2, ground_at(-80) + 7.6, 'front stairs', (0, 120, 0)),
                                 (-101, ground_at(-101) + 1.8, ground_at(-101) + 14.4, 'hall stair', (160, 0, 120)), (-3.5, 0, 18.5, 'plinth stair', (0, 0, 160))]:
        dr.line([(X(u), Y(h0)), (X(u), Y(h1))], fill=col, width=5); dr.text((X(u) + 6, Y(h1) - 24 - 20 * (k % 2)), name, font=fs, fill=col); k += 1
    dr.line([(X(-240), Y(-30)), (X(-190), Y(-30))], fill=(0, 0, 0), width=3); dr.text((X(-240), Y(-30) + 4), '50 m', font=fs, fill=(0, 0, 0))
    return img

def main():
    B.KEYMAP.update(keymap()); B.EXTRA_PROGRAMS.update(LS.programs()); B.EXTRA_PROGRAMS.update(programs())
    B.OPEN_KINDS.update(OPEN)
    for k in OPEN: B.KIND_FILL.setdefault(k, (214, 236, 250))
    B.KIND_FILL.update({'terrace': (226, 238, 200), 'field': (226, 238, 200), 'see': (246, 240, 214), 'roof': (236, 236, 236), 'midden': (200, 186, 160),
                        'tank': (190, 214, 236), 'oil_pit': (120, 110, 100), 'stair_way': (210, 190, 150), 'yard': (236, 228, 200), 'hives': (236, 228, 190)})
    B.NEW.clear(); B.NEW.update(NEW); B.CITY.clear()
    intro = ('Generated by `beacon_blueprint.py` (on `settlements/voth/palace/blueprint.py`, with Longsong\'s Xanadu key map and room programmes) from the same room data as the sheets; the footprints are the layout\'s (`src/30-bc-layout.js`). Keys are catalog pieces (`kits/catalog`): `xanadu_court_*`, `xanadu_common_*`, `xanadu_trade_*`, `xanadu_works_*`, the Order\'s `order_*`, `job_oil_drum_rack` (the eastabyss jobs set) and `generic_churn`. **NEW** marks a piece the catalog lacks (the lamp head is kits/ancients\'); they are listed at the end. Open grounds (courts, yards, terraces, the stair, the roofs, the pits) are not dressed; the shoulder sheet\'s zones over 600 m2 are counted at a quarter.\n')
    B.main(floors=FLOORS, out=OUT, here=HERE, title='# The Order of the Beacon\'s head house: furniture manifest\n', intro=intro, section=draw_section, zone_R=999)

if __name__ == '__main__':
    main()
