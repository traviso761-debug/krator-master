#!/usr/bin/env python3
"""Grēṭ-Āil, the head monastery of the Order of the Azure Dream: the blueprint. Sheets and the manifest come from
settlements/voth/palace/blueprint.py, with Longsong's Xanadu key map and room programmes (settlements/longsong).

Frame (PLAN.md section 1): the origin is the cove's head on the waterline, scale-model px 846, 1508.703
(tools/scale-model/edit_517_azure.report.json); u runs due north up column 846, inland and uphill toward the isle's crest;
v runs east along the shore, toward the isle's east tip, drawn up on the sheet. Metres. u < 0 is the lake. The heights over the lake are assumptions until
core/world draws the isle at 1:1 (PLAN.md section 1): the wharf +2 to +5 m, the lower ward +5 to +20, the Stair of
Lowered Eyes +20 to +60, the upper precinct +60 (the gate) to +76 (the Hall of Dreaming's terrace).

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
# the natural waterline runs straight along the shore here (core/world's ground down column 846: edit_517_azure.report.json);
# the cove is the water between the two headlands, which stand out into the lake past this sheet's left edge
SHORE = [(-80, -200), (-80, -330), (0, -330), (2, -120), (2, 120), (0, 330), (-80, 330)]
FLOORS = []

# the cove's two headlands (tools/scale-model/edit_517_azure.py): island records 300 m in radius at their waterline,
# 200 m out from the cove's head (u -200) and 480 m either side of its centre line, clipped to a sheet's frame
LAND = (232, 226, 206)
def headland(sgn, rect, label):
    import math
    pts = [(-200 + 300 * math.cos(a * math.pi / 24), sgn * 480 + 300 * math.sin(a * math.pi / 24)) for a in range(48)]
    pts = [(min(max(u, rect[0]), rect[1]), min(max(v, rect[2]), rect[3])) for u, v in pts]
    first = max(pts, key=lambda p: (sgn * p[1], -p[0]))   # the label sits at the frame's top or bottom edge, clear of the lake's
    return (pts[pts.index(first):] + pts[:pts.index(first)], LAND, label)

def Rf(sheet, *a, **k):
    """a room on the grounds sheet that a closer sheet draws and furnishes: counted there, not twice"""
    d = R(*a, **k); d['ref'] = sheet; return d

# ---- G the grounds: the cove, the lower ward, the stair and the upper precinct (720 x 660 m)
FLOORS.append(dict(id='G', tier=0, R=368, rect=(-80, 640, -330, 330),
  title='Sheet G: Grēṭ-Āil, the grounds (the cove facing Erehwon to the Hall of Dreaming)',
  sub='u from the cove\'s waterline (left) uphill to the brow (right); v along the isle, its east tip up. The wharf on the cove: the pilgrims\' landing and the mole on the west, the fishermonks\' jetties, beach, boathouse and racks on the east. The lower ward on the first terraces (pilgrims below, the Order\'s farm and workshops beside them); the Stair of Lowered Eyes up the slope; the walled upper precinct on the brow: the Blue Gate, the great monastery in the blue dress, the cells and the Prismarch\'s house, the Lotus Garden, and the Hall of Dreaming wrapped in its kora at the head of the axis. The Dream Road leaves the back gate for the summit kora, 8 km up the isle (sheet S).',
  axisnote='u -> north, uphill from the cove\'s head (px 846, 1508.703); v up = east along the shore; the lake at the left',
  fills=[(SHORE, WATER, 'the lake (-520 m); Erehwon 20 km off, south-south-west'),
         headland(-1, (-80, 640, -330, 330), 'west headland (35 m)'), headland(1, (-80, 640, -330, 330), 'east headland (40 m)')],
  outlines=[(280, 600, -170, 170, 'the upper precinct\'s wall'), (476, 550, -25, 25, '')],
  lines=[([(600, 0), (640, 0)], (120, 80, 30), 5)],
  rooms=[
    # the wharf, west: the pilgrims
    Rf('W', 1, 'The Mole and the Barge Berth', 'quay', -54, 0, -8, 8, 1, 'a stone mole 54 m into the cove; the Order\'s ferry barge from Erehwon lies along it (daily, 4 to 5 hours under sail and oar)'),
    Rf('W', 2, 'Wave-wheel Shrine', 'wave_shrine', -62, -54, -6, 6, 2, 'at the mole head: a prayer wheel turned by a paddle in the lake\'s swell; its lamp is the cove\'s light'),
    Rf('W', 3, 'The Lustral Steps', 'ghat', 0, 14, -70, -12, 2, 'the pilgrims\' landing ghat (qb_ghats): stone steps into the lake where every arrival bathes before going up'),
    Rf('W', 4, 'Threshold Chorten', 'chorten', 14, 26, -6, 6, 3, 'at the mole\'s foot: the first chorten, the first circuit'),
    Rf('W', 5, 'Ferry House', 'ferry_house', 22, 50, -76, -30, 1, 'the Order\'s porters and boatmen; the waiting hall; the list of tonight\'s sleepers'),
    # the wharf, east: the fishermonks
    Rf('W', 6, 'Fishermonks\' Jetty', 'jetty', -40, 2, 30, 36, 1, 'timber on piles; the night boats tie up here'),
    Rf('W', 7, 'Fishermonks\' Jetty', 'jetty', -36, 2, 50, 56, 1),
    Rf('W', 8, 'Fishermonks\' Jetty', 'jetty', -32, 2, 70, 76, 1),
    Rf('W', 9, 'Dugout Beach', 'beach', -6, 10, 36, 96, 1, 'the dugouts hauled up in rows; paddles stood in racks'),
    Rf('W', 10, 'Boathouse', 'boathouse', -4, 26, 100, 146, 1, 'a Qiblai cube on the shore, its lake face open in four bays with slips; the dugouts wintered and mended here'),
    Rf('W', 11, 'Net Racks', 'net_racks', 12, 44, 30, 96, 1, 'pole frames, the nets hung to dry in the morning'),
    Rf('W', 12, 'Fish-drying Racks', 'fish_racks', 48, 74, 30, 80, 1, 'split fish on rails in the sun and the lake wind'),
    Rf('W', 13, 'Smokehouses', 'smokehouse', 48, 70, 84, 112, 1, 'two: the lake has no salt near it (Erehwon\'s ledger), so the catch keeps by smoke'),
    Rf('W', 14, 'Net Loft and Fish Store', 'net_loft', 30, 60, 150, 186, 1, 'the loft over the cool store; the catch weighed and the Order\'s share set aside'),
    Rf('W', 15, 'Ropewalk', 'ropewalk', 76, 84, 30, 210, 1, 'a 180 m covered walk where the net cord and the mooring ropes are laid'),
    Rf('W', 16, 'Boatwrights\' Yard', 'workshop', 30, 72, 116, 146, 1, 'the dugouts are cut from single dawn-redwood trunks floated round from the isle\'s woods'),
    Rf('W', 17, 'Fishermonks\' House', 'fishermonks_house', 92, 136, 50, 120, 2, 'the fifty fishermonks keep night hours, so they live by their boats, below the hill and far from the sleepers: cells, a refectory, their chapel'),
    # the lower ward
    R(18, 'The Lower Way', 'passage', 26, 204, -8, 8, 2, 'the processional way from the mole to the stair; prayer flags in the Order\'s blue'),
    R(19, 'Pilgrims\' Hostel (east range)', 'hostel', 60, 120, -96, -40, 1, 'qb_hostel; the pilgrims wait here a day, fasting on honey and milk'),
    R(20, 'Pilgrims\' Hostel (west range)', 'hostel', 60, 120, -160, -100, 1, 'qb_hostel; the festival overflow and the families'),
    R(21, 'Hall of Fasting', 'fast_hall', 128, 172, -132, -60, 2, 'the pilgrims\' refectory: the day before the night, honey and milk only (the sacraments); the dream-keepers question each pilgrim here and give them a turning'),
    R(22, 'Waiting Garden', 'garden', 128, 196, -52, -14, 2, 'willows and benches by a rill; the pilgrims\' talk stays below the stair'),
    R(23, 'Lay Servants\' Houses', 'dormitory', 92, 136, 130, 200, 0, 'the Order\'s lay families (seventy-six)'),
    R(24, 'Granary and Stores', 'store', 142, 182, 20, 72, 0, 'grain from the isle\'s terraces and from Erehwon; lamp oil; incense'),
    R(25, 'Dairy and Byres', 'dairy', 142, 196, 80, 140, 1, 'the milk of the sacrament: the Order\'s herd grazes the isle\'s meadows'),
    R(26, 'Lower Gate', 'entrance', 196, 206, -14, 14, 2, 'a gate tower at the stair\'s foot; past it, eyes lowered and no talk'),
    # the slope
    R(27, 'Stair of Lowered Eyes', 'stair', 206, 280, -10, 10, 3, 'a zigzag stair up 40 m in eight flights (one a turning of the Song) with a landing and a chorten at each turn'),
    R(28, 'Prayer-wheel Row (west)', 'kora', 206, 280, -16, -10, 2, 'wheels along the stair\'s side, turned on the way up'),
    R(29, 'Prayer-wheel Row (east)', 'kora', 206, 280, 10, 16, 2),
    R(30, 'Terraced Orchards (west)', 'garden', 206, 280, -170, -24, 2, 'apricot and persimmon on the warm slope; the hives among them (honey of the sacrament)'),
    R(31, 'Terraced Orchards (east)', 'garden', 206, 280, 24, 170, 2, 'and the kitchen terraces'),
    R(32, 'Apiary', 'apiary', 206, 236, 176, 230, 1, 'the bee walls: hives in niches in the terrace walls'),
    # the upper precinct
    R(33, 'The Blue Gate', 'entrance', 280, 294, -14, 14, 3, 'the gate temple (qb_gate_temple) in the blue dress, the bell and drum in its towers: the precinct\'s only bells, 200 m from the sleepers'),
    R(34, 'Court of Arrival', 'court', 294, 340, -60, 60, 2, 'the Order\'s chorten in the middle; the pilgrims circle it once and are counted in'),
    R(35, 'The Great Monastery (blue dress)', 'monastery_core', 340, 392, -26, 26, 4, 'qb_monastery v5, as in Qiblai: the Assembly Hall (dukhang) at the court\'s head, the cloister of the senior monks; the Order\'s chapter meets here'),
    R(36, 'The Prismarch\'s House', 'abbot_house', 340, 392, -112, -46, 3, 'the abbot\'s house; the abbot is the Order\'s Prismarch, in Qiblai for the council half the year, when the Prior keeps it'),
    R(37, 'Prior\'s and Officers\' House', 'office', 400, 444, -112, -66, 2, 'the Prior, the Cellarer, the Master of the Wharf, the Master of the Hall'),
    R(38, 'Novices\' College', 'school', 340, 392, 46, 110, 2, 'forty novices; the sound-grid script and the Song by heart'),
    R(39, 'Refectory and Kitchen', 'refectory', 400, 444, 66, 112, 1, 'one meal at noon, one at dusk; the fish comes up from the wharf'),
    R(40, 'Monks\' Cells (west range)', 'cells', 296, 444, -164, -122, 1, 'seventy cells in two storeys'),
    R(41, 'Monks\' Cells (east range)', 'cells', 296, 444, 122, 164, 1, 'seventy cells; the dream-keepers\' novices at the east end'),
    R(42, 'The Lotus Garden', 'garden', 400, 466, -50, 50, 3, 'the Garden of Lowered Voices: blue lotus in four still ponds (the biome\'s lotus), gravel walks; the last talk allowed before the hall'),
    Rf('H1', 43, 'Lustral Bath', 'bath', 466, 504, 32, 74, 2, 'the sleepers\' bath at dusk (qb_bath in the blue dress)'),
    Rf('H1', 44, 'The Cup House', 'cup_house', 510, 536, 32, 60, 2, 'the dream cup is poured here: honey, milk and steeped blue lotus'),
    Rf('H1', 45, 'Kora Gallery of the Hall', 'kora', 476, 550, -25, 25, 3, 'the covered prayer-wheel gallery round the hall, walked three times with eyes lowered; its wheels are braked at the Lulling (sheet H1)'),
    Rf('H1', 46, 'The Hall of Dreaming', 'dream_hall_ext', 480, 546, -16, 16, 4, 'two hundred and fifty-six cots under one roof (sheets H1, H2)'),
    Rf('H1', 47, 'The Waking Gallery', 'waking_booths', 478, 518, -64, -29, 3, 'sixteen booths: the dream is told to a scribe before the dreamer speaks to anyone'),
    Rf('H1', 48, 'The Register', 'register', 518, 572, -84, -29, 3, 'the archive of dreams in the sound-grid script, shelved by year and turning'),
    R(49, 'Readers\' Court', 'court', 466, 516, -112, -68, 2, 'the readers meet the dreamers here in the afternoon'),
    R(50, 'Dream-keepers\' House', 'cells', 522, 590, -134, -90, 2, 'thirty keepers, scribes and readers, men and women: they sleep by day'),
    Rf('H1', 51, 'Cells of the Seven Nights', 'long_sleep', 558, 596, 30, 84, 2, 'eight cells for the pilgrims who sleep a week in the hall; the sick the White Lily sends'),
    R(52, 'The Quiet Walk', 'garden', 556, 600, -24, 24, 3, 'juniper and stone; behind the hall\'s head, the back gate to the Dream Road'),
    R(53, 'Kitchen Terraces of the Precinct', 'garden', 450, 600, 96, 164, 1, 'and the hives\' summer stands'),
  ]))

# ---- W the wharf, closer (the cove's east half and the mole)
FLOORS.append(dict(id='W', tier=0, R=128, rect=(-70, 150, -90, 220),
  title='Sheet W: the fishermonks\' wharf',
  sub='The cove faces Erehwon across 20 km of water, the bay isle (a lamp chorten, the Threshold Light) 6 km out on the line. The barge berth and the Lustral Steps on the west; three jetties, the dugout beach, the boathouse, the racks, the smokehouses, the ropewalk and the fishermonks\' own house on the east. The fishermonks fish the lake the Atitlán way, from dugouts with nets and lines, and by night with lamps: from the Hall of Dreaming\'s terrace the night fleet is a second, lower sky.',
  axisnote='u -> uphill from the waterline; v up = toward the isle\'s east tip; the lake at the left',
  fills=[([(-70, -90), (-24, -90), (-2, -76), (0, -20), (2, 0), (2, 60), (-2, 120), (-14, 180), (-26, 220), (-70, 220)], WATER, 'the cove'), headland(1, (-70, 150, -90, 220), 'east headland')],
  rooms=[
    R(1, 'The Mole and the Barge Berth', 'quay', -54, 0, -8, 8, 1, 'the barge, 22 m, lateen sail and eight oars, forty pilgrims; dugouts never use this side'),
    R(2, 'Wave-wheel Shrine', 'wave_shrine', -62, -54, -6, 6, 2, 'the wheel turns with the swell: on a still night it stops, and the fishermonks say the lake is dreaming'),
    R(3, 'The Lustral Steps', 'ghat', 0, 14, -70, -12, 2, 'men to the north half, women to the south, a screen between'),
    R(4, 'Threshold Chorten', 'chorten', 14, 26, -6, 6, 3),
    R(5, 'Ferry House', 'ferry_house', 22, 50, -76, -30, 1),
    R(6, 'Jetty of the Night Boats', 'jetty', -40, 2, 30, 36, 1, 'each boat\'s lamp hangs on its post by day'),
    R(7, 'Jetty of the Line Boats', 'jetty', -36, 2, 50, 56, 1),
    R(8, 'Jetty of the Net Boats', 'jetty', -32, 2, 70, 76, 1),
    R(9, 'Dugout Beach', 'beach', -6, 10, 36, 96, 1, 'some thirty dugouts, 4 to 7 m, one or two monks each'),
    R(10, 'Boathouse', 'boathouse', -4, 26, 100, 146, 1, 'four slips; the loft above for sails and paddles'),
    R(11, 'Net Racks', 'net_racks', 12, 44, 30, 96, 1),
    R(12, 'Fish-drying Racks', 'fish_racks', 48, 74, 30, 80, 1),
    R(13, 'Smokehouses', 'smokehouse', 48, 70, 84, 112, 1),
    R(14, 'Net Loft and Fish Store', 'net_loft', 30, 60, 150, 186, 1),
    R(15, 'Ropewalk', 'ropewalk', 76, 84, 30, 210, 1),
    R(16, 'Boatwrights\' Yard', 'workshop', 30, 72, 116, 146, 1),
    R(17, 'Fishermonks\' House: cells', 'cells', 92, 136, 90, 120, 1, 'fifty cells round a court'),
    R(18, 'Fishermonks\' House: refectory and chapel', 'fishermonks_house', 92, 136, 50, 86, 2, 'they eat at dawn when the boats come in; the chapel\'s wheel is a lake-wheel too'),
    R(19, 'The Lower Way', 'passage', 26, 150, -8, 8, 2),
  ]))

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

# ---- S the summit and the high kora (8 km up the isle)
SUMMIT_RING = [(round(260 * __import__('math').cos(t * 3.14159265 / 8), 1), round(260 * __import__('math').sin(t * 3.14159265 / 8), 1)) for t in range(16)]
FLOORS.append(dict(id='S', tier=0, R=300, rect=(-300, 300, -300, 300), circle=False,
  title='Sheet S: the summit of Grēṭ-Āil and the High Kora',
  sub='The isle\'s crest, about 300 m over the lake and 8 km from the monastery up the Dream Road, which has a chorten at every kilometre (eight, one a turning). The High Kora rings the summit at 260 m out (1.6 km round), with sixteen wheel houses; the pilgrims walk it on the Station\'s nights, when the whole Order comes up. The Station Watch keeps the sky and signals the monastery by lamp when the Station is due; the Summit Chorten bears the isle\'s one gilt crown visible from every shore.',
  axisnote='u -> along the Dream Road\'s last stretch (from the monastery, at the left); v up = toward the isle\'s east tip',
  lines=[([(SUMMIT_RING[i][0], SUMMIT_RING[i][1]) for i in list(range(16)) + [0]], (60, 90, 170), 6, 'the High Kora')],
  rooms=[
    C(1, 'Summit Chorten', 'chorten', 0, 0, 14, 4, 'qb_chorten (large) with a gilt crown and the Order\'s blue banners'),
    R(2, 'Wheel House of the Summit', 'wheel_house', -40, -16, -12, 12, 3, 'qb_wheel_house: the great wheel of the isle, turned by pilgrims in a ring'),
    R(3, 'The Station Watch', 'astronomers', 24, 52, -14, 14, 2, 'four monks keep the Station\'s passes and the Dark Wheel; a signal lamp to the monastery 8 km off'),
    R(4, 'Pilgrims\' Shelter', 'hostel', -110, -70, -40, 0, 1, 'for the nights of the Station: the High Kora is walked three times before dawn'),
    R(5, 'Dream Road (last km)', 'passage', -300, -110, -6, 6, 1, 'the eighth chorten at the kora\'s edge'),
  ] + [R(6 + i, 'Wheel House %d' % (i + 1), 'wheel_house', u - 6, u + 6, v - 6, v + 6, 2, 'qb_wheel_house (small)' if i == 0 else '') for i, (u, v) in enumerate(SUMMIT_RING)]))

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
    f_t = B.font(40, True); f = B.font(20); fs = B.font(17)
    W, H = 2600, 1000; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Section along u: the cove, the wharf, the lower ward, the Stair of Lowered Eyes, the precinct and the Hall of Dreaming (heights x3)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), 'Heights over the lake are assumptions until core/world draws the isle at 1:1 (PLAN.md section 1). The lake on the left; the Dream Road leaves on the right for the summit, 8 km on and 220 m higher.', font=f, fill=(70, 70, 70))
    sx = 3.2; sy = 6.5; ox = 330; base = H - 170
    def X(u): return ox + u * sx
    def Y(h): return base - h * sy
    dr.rectangle([0, Y(0), X(0), H], fill=WATER)
    ground = [(X(0), Y(0)), (X(0), Y(3)), (X(40), Y(5)), (X(120), Y(10)), (X(200), Y(20)), (X(280), Y(60)), (X(400), Y(60)), (X(410), Y(68)), (X(470), Y(68)), (X(476), Y(76)), (X(640), Y(80)), (X(700), Y(84)), (X(700), H), (X(0), H)]
    dr.polygon(ground, fill=(228, 214, 190), outline=(120, 100, 80))
    dr.rectangle([X(-54), Y(1.5), X(0), Y(0)], fill=(170, 160, 150), outline=(30, 30, 30)); dr.text((X(-54), Y(1.5) - 24), 'mole, barge', font=fs, fill=(0, 0, 0))
    for u0, u1, h0, h, name, col in [(-4, 26, 3, 9, 'boathouse', (236, 232, 218)), (48, 70, 6, 6, 'smokehouses', (236, 232, 218)), (60, 120, 8, 10, 'hostel', (236, 232, 218)),
                                     (128, 172, 12, 8, 'Hall of Fasting', (224, 236, 214)), (196, 206, 20, 12, 'Lower Gate', (212, 226, 176)), (280, 294, 60, 14, 'Blue Gate', (212, 226, 176)),
                                     (340, 392, 60, 16, 'great monastery, the Assembly Hall', (60, 90, 170)), (400, 466, 68, 0.6, 'Lotus Garden', (214, 236, 206)), (556, 600, 76, 0.6, 'Quiet Walk', (214, 236, 206))]:
        dr.rectangle([X(u0), Y(h0 + h), X(u1), Y(h0)], fill=col, outline=(30, 30, 30), width=2)
        dr.text((X(u0) + 4, Y(h0 + h) - 22), name, font=fs, fill=(0, 0, 0))
    # the Hall of Dreaming: the kora gallery, the hall, the clerestory, the crown
    dr.rectangle([X(476), Y(76 + 5), X(550), Y(76)], fill=(214, 226, 240), outline=(30, 30, 30), width=2)
    dr.rectangle([X(480), Y(76 + 7), X(546), Y(76)], fill=(70, 100, 180), outline=(30, 30, 30), width=2)
    dr.rectangle([X(489), Y(76 + 12), X(537), Y(76 + 7)], fill=(120, 150, 220), outline=(30, 30, 30), width=2)
    dr.rectangle([X(537), Y(76 + 14), X(544), Y(76 + 7)], fill=(238, 220, 150), outline=(30, 30, 30), width=2)
    dr.text((X(480), Y(76 + 14) - 26), 'Hall of Dreaming: cots to +7 m, the clerestory to +12, the gilt lantern over the shrine', font=fs, fill=(0, 0, 0))
    for i in range(8):
        dr.line([(X(206 + i * 9.25), Y(20 + i * 5)), (X(206 + (i + 1) * 9.25), Y(20 + (i + 1) * 5))], fill=(0, 0, 0), width=4)
    dr.text((X(150), Y(46)), 'Stair of Lowered Eyes: eight flights, a chorten at each landing', font=fs, fill=(0, 0, 0))
    dr.text((X(10), Y(0) + 30), 'the wharf: jetties, the dugout beach, racks and smokehouses (the fishermonks)', font=fs, fill=(30, 60, 120))
    dr.text((X(60), Y(10) + 40), 'the lower ward: pilgrims, the Order\'s farm and workshops', font=fs, fill=(80, 80, 80))
    dr.text((X(300), Y(60) + 40), 'the upper precinct: monks, keepers, the hall (no bells past the Blue Gate)', font=fs, fill=(80, 80, 80))
    dr.text((X(-90), Y(0) - 50), 'the lake, -520 m', font=fs, fill=(30, 60, 120))
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
