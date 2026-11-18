#!/usr/bin/env python3
"""The House of the Tempest, the Order of the Violet Storm's mother house on the West Arm (px 886,1619): the blueprint.
Sheets and the manifest come from settlements/voth/palace/blueprint.py; the Xanadu key map and the monastery room
programmes are Longsong's (settlements/longsong/longsong_blueprint.py), imported, not copied.

Frame: u runs from the Main Gate (east, toward Strongwall; drawn on the left) west along the axis toward Komodo's side;
v across, v > 0 north (drawn up). Metres. The outer curtain's line is u -130..130, v -95..95; the barbican stands
before the Main Gate (u -162..-138). The inner ward is concentric (the owner, 2026-11-16: "Concentric"): its curtain
u -55..55, v -48..48 on a 4 m talus, the kit's 52 m great monastery (kits/qiblai qb_monastery, the violet dress, o.v 6)
in it at u -20..32, v -26..26 with its gate facing east, the Prismarch's tower (the utse) astride the inner curtain's
east face at u -63..-41, v -11..11 with the inner gate through its base. Storeys about 4.5 m in the ranges.

    python tempest_blueprint.py        # writes floors/*.png and FURNITURE.md next to this file
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'voth', 'palace'))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'longsong'))
import blueprint as B
from blueprint import R, box, C
import longsong_blueprint as LS
from PIL import Image, ImageDraw

OUT = os.path.join(HERE, 'floors')

# ------------------------------------------------------------------------------------------------ fixed stairs
# the great monastery (the kit block's frame: front u -20, back u 32; kit z -> u = 6 - z, kit x -> v)
MS_N = (-13, -9.5, 19, 26)     # the north front stair: the chapter's cells
MS_S = (-13, -9.5, -26, -19)   # the south front stair
MS_B = (25, 32, 12, 15.5)      # the back stair: the Prior, the chant-master, the guests
MS_H = (19, 22.8, 8, 12)       # the hall stair: the Masters' Gallery, the Protectors' Chapel, the roof
# the enclosure
NE_ST = (-128, -114, 79, 93)   # corner stairs to the wall walk and the upper floors (and the garderobes)
SE_ST = (-128, -114, -93, -79)
NV_ST = (80, 86, 75, 81)       # the novices' stair
FW_ST = (48, 52, -26, -20)
SW_ST = (116, 128, -93, -81)  # the south-west corner stair
ST_ST = (132, 140, 4, 12)     # the Storm Tower's stair     # the Founder's Way: the stair down to the tunnel

FLOORS = []

# ------------------------------------------------------------------------------------------------ T0 the crest
FLOORS.append(dict(R=510, rect=(-500, 500, -400, 400), id='T0', tier=0,
  title='Sheet T0: the West Arm\'s crest round the House (1,000 x 800 m)',
  sub='The flat crest at 519 m (Cfb, 19 C, ~990 mm), between Komodo\'s roads. The Strongwall road arrives from the east past the caravan halt into the barbican. The sally tracks leave the north and south sally gates down the crest\'s flanks: north across the Maydan toward the trough road and the Vale road (31 km north-west), south between the terraces to the Kruk Warra road (16 km). The horse ground is east and north: the Maydan and its horse-archery track, the remounts\' night paddock, the hay barns, the byres, the great tank, the commons, which run on beyond the sheet over the West Arm (some 24 x 18 km). The barley terraces west and south take the middens\' muck and give two fifths of the House\'s grain. The beacon line runs east to Strongwall (66 km, in sight), the relay west to the brow lookout (879,1618), which sees Komodo. *Proposed* throughout.',
  axisnote='u -> west (Komodo\'s side); the Main Gate faces east (left), toward Strongwall; v north, up the sheet',
  lines=[([(-500, -150), (-300, -140), (-200, -90), (-162, -30)], (140, 100, 60), 5, 'the Strongwall road (road.sw-tempest, 80 km)'),
         ([(-16, 101), (0, 230), (160, 400)], (140, 100, 60), 3, 'north sally track: to the trough road'),
         ([(-16, -101), (5, -140), (5, -400)], (140, 100, 60), 3, 'south sally track: to the Kruk Warra road'),
         ([(-60, 12), (-500, 60)], (110, 60, 150), 3, 'the beacon line to Strongwall, 66 km east'),
         ([(500, 12), (140, 0)], (110, 60, 150), 3, 'the relay line to the brow lookout, 14 km west'),
         ([(-60, 218), (240, 218)], (90, 60, 30), 4, 'horse-archery track, 300 m'),
         ([(50, -23), (165, -25)], (160, 0, 0), 3)],
  rooms=[
    R(1, 'The House of the Tempest (sheets T1, T2)', 'void', -130, 130, -95, 95, 4, 'the outer curtain 260 x 190 m, the inner ward on the crest\'s crown'),
    R(2, 'Barbican', 'lists', -162, -138, -26, 26, 1, 'the road enters on its south side and turns west to the Main Gate'),
    R(3, 'The Maydan', 'maydan', -100, 250, 130, 230, 1, 'the riders\' ground before the North Sally Gate: the companies form, wheel and charge here; the horse-archery track along its north edge (the Mamluk maydan, the yabusame)'),
    R(4, 'Remounts\' Paddock', 'horse_park', -420, -200, -360, -140, 0, 'a walled night paddock for some 300 remounts and the off-duty companies\' war horses (the duty rota, proposed); by day they graze the commons under the herdsmen'),
    R(5, 'Byres and the Herdsmen\'s Huts', 'byres', -200, -130, -360, -300, 1, 'the milking herd (milk is a sacrament of the Decree), the herdsmen\'s huts'),
    R(6, 'The Great Tank', 'cistern', -300, -220, -110, -40, 0, 'rain off the crest for the herds and the remounts; the House drinks from its own cisterns'),
    R(7, 'Barley Terraces (west)', 'field', 190, 500, -400, 120, 1, 'low banked terraces on the crest\'s west flank; open ground under the Storm Tower\'s eye'),
    R(8, 'Barley Terraces (south-east)', 'field', -130, -5, -400, -160, 1),
    R(9, 'Barley Terraces (south-west)', 'field', 15, 180, -400, -160, 1),
    R(10, 'Threshing Floors', 'threshing', 140, 180, -150, -110, 0),
    R(11, 'Tea Garden', 'field', 260, 480, 180, 380, 2),
    R(12, 'Hives', 'field', 260, 320, 125, 170, 1, 'the honey of the sacrament'),
    R(13, 'Commons of the Crest', 'field', -500, -160, 130, 400, 0, 'the near corner of the commons: the herds and remounts graze on over the West Arm beyond the sheet, the hay meadows with them'),
    R(14, 'Hay Barns and Ricks', 'hay', -190, -140, -250, -160, 0, 'the year\'s hay from the crest\'s meadows (about 530 t for the stabled half under the duty rota, proposed), carted in weekly to the hay sheds in the lists'),
    R(15, 'Midden (south)', 'midden', -60, -25, -150, -115, 0, 'the south stables\' muck, out by the South Sally Gate, to the terraces'),
    R(16, 'Midden (north)', 'midden', -70, -35, 106, 126, 0, 'the north stables\' muck, carted round to the west terraces'),
    R(17, 'Caravan Halt', 'caravan_halt', -240, -170, 20, 80, 1, 'the donkey trains from Strongwall (grain, arms, salt and tea) unload here before the barbican'),
    R(18, 'Thorn Brake', 'field', 160, 182, -42, -12, 0, 'the Founder\'s Way comes out here, under scrub on the crest\'s edge'),
  ]))

# ------------------------------------------------------------------------------------------------ T1 the enclosure, ground
OUTER = [(-130, -95), (130, -95), (130, 95), (-130, 95)]
INNER_LINE = ([(-55, -48), (55, -48), (55, 48), (-55, 48), (-55, -48)], (70, 40, 100), 6)
TALUS = ([(-59, -52), (59, -52), (59, 52), (-59, 52)], (236, 228, 210))
WALK = ([(-128.5, -93.5), (128.5, -93.5), (128.5, 93.5), (-128.5, 93.5), (-128.5, -93.5)], (150, 120, 170), 2)
ENCL = dict(R=170, rect=(-165, 145, -108, 108), poly=OUTER,
  axisnote='u -> west (Komodo\'s side); the Main Gate east (left), toward Strongwall; v north, up the sheet')

TWR = (205, 205, 200)
def octo(u, v, r):
    import math
    return [(u + r * math.cos(math.pi / 8 + k * math.pi / 4), v + r * math.sin(math.pi / 8 + k * math.pi / 4)) for k in range(8)]
def sq(u, v, h):
    return [(u - h, v - h), (u + h, v - h), (u + h, v + h), (u - h, v + h)]
# the towers as records (the export reads these too): at, kind, form, r (a drum's radius, a square's half side)
TOWERS = ([dict(at=(u, v), kind='corner', form='drum', r=7) for (u, v) in [(-130, 95), (130, 95), (-130, -95), (130, -95)]]
  + [dict(at=(u, s * 98), kind='interval', form='square', r=3) for u in (-98, -46, 8, 60, 84, 108) for s in (1, -1)]
  + [dict(at=(-133, v), kind='interval', form='square', r=3) for v in (-70, -40, 40, 70)]
  + [dict(at=(133, v), kind='interval', form='square', r=3) for v in (-62, -30, 30, 62)]
  + [dict(at=(u, v), kind='inner', form='drum', r=5) for (u, v) in [(-55, 48), (55, 48), (-55, -48), (55, -48)]])
TOWER_FILLS = [((octo if t['form'] == 'drum' else sq)(t['at'][0], t['at'][1], t['r']), TWR) for t in TOWERS]
N_TOWERS = len(TOWERS)

FLOORS.append(dict(ENCL, id='T1', tier=0,
  title='Sheet T1: the House, ground floor (outer curtain 260 x 190 m; concentric)',
  sub='The owner\'s forks (2026-11-16): concentric wards; the Prismarch in the utse; the novices in their own court; the horses inside with three gates. The Main Gate (the gilt pavilion) east behind its bent barbican; the muster court before the Prismarch\'s tower; the stables along the north and south curtains, each flank with its sally gate, its hay shed in the lists and its garderobe turrets; the novices\' court north-west, the refectory and kitchens south-west, the Storm Tower on the west front toward Komodo; the archery range in the south lists, the drill court in the west. The inner ward on its 4 m talus: the inner court, the violet great monastery (sheets M1-MR), the infirmary, the Field of the Fallen, the Founder\'s Garden and the hidden Founder\'s Way (red). The towers are drawn grey (one entry in the key); the wall walk is reached from the corner stairs, the gate towers, the captains\' stairs (T2) and the Storm Tower.',
  fills=[TALUS + ('the talus (4 m)',)] + TOWER_FILLS,
  lines=[INNER_LINE,
         ([(50, -23), (90, -23), (130, -20), (145, -20)], (160, 0, 0), 3),
         ([(-172, -40), (-162, -30), (-150, -26)], (140, 100, 60), 5)],
  rooms=[
    R(1, 'Barbican', 'lists', -162, -138, -26, 26, 1, 'walled; the road enters from the south and turns west, so no charge meets the leaves straight (Krak\'s bent ramp, the fort asset\'s bent entrance)'),
    R(2, 'Main Gate', 'gatehouse', -138, -114, -9, 9, 3, 'the iwan between two towers, the Sultan\'s roundel, the gilt pavilion over it (the fort asset\'s gate); murder holes in the vault; a stair in each tower'),
    R(3, 'Guard of the Gate', 'guard', -128, -114, 9, 19, 1),
    R(4, 'Guard of the Gate', 'guard', -128, -114, -19, -9, 1),
    R(5, 'Sword Hall (the armoury)', 'armoury', -128, -114, 19, 57, 1, 'the order\'s swords and bows, the lamellar and the helmets; no powder'),
    R(6, 'Marshal\'s Hall', 'office', -128, -114, 57, 79, 2, 'the muster rolls, the remount book, the Marshal\'s table'),
    R(7, 'Gate Stable', 'stable', -128, -114, -57, -19, 0, 'the officers\', the couriers\' and the Prismarch\'s horses: the first out'),
    R(8, 'Guest House', 'guest_hall', -128, -114, -79, -57, 2, 'the Sultan\'s riders, the Golden Tears\' factors, monks of the daughter house, pilgrims'),
    box(9, 'Corner stair and garderobe', 'stair', NE_ST, 0),
    box(10, 'Corner stair and garderobe', 'stair', SE_ST, 0),
    R(11, 'Stables of the North (east)', 'stable', -114, -22, 81, 93, 0, 'two rows of stalls, the aisle between; the companies sleep over them'),
    R(12, 'North Sally Gate', 'sally_gate', -22, -10, 81, 101, 2, 'onto the Maydan and the north flank: the trough road; a stair in its tower'),
    R(13, 'Stables of the North (west)', 'stable', -10, 80, 81, 93, 0),
    R(14, 'Stables of the South (east)', 'stable', -114, -22, -93, -81, 0),
    R(15, 'South Sally Gate', 'sally_gate', -22, -10, -101, -81, 2, 'onto the south flank and the Kruk Warra road; a stair in its tower'),
    R(16, 'Stables of the South (west)', 'stable', -10, 80, -93, -81, 0),
    R(17, 'Novices\' Yard', 'yard', 86, 116, 51, 81, 1, 'the boys\' practice ground: posts, a short butt, the well'),
    R(18, 'School of the Song', 'song_school', 80, 104, 81, 93, 2, 'the Song in the morning'),
    R(19, 'Novices\' Refectory', 'novice_refectory', 104, 128, 81, 93, 1, 'and its kitchen'),
    R(20, 'Master of Novices', 'chamber', 116, 128, 69, 81, 2),
    R(21, 'The Little Armoury', 'novice_armoury', 116, 128, 51, 69, 1, 'wooden swords, boys\' bows, blunt arrows'),
    R(22, 'Novices\' Wash House', 'wash', 116, 128, 39, 51, 1),
    R(23, 'Novices\' Gate and Arcade', 'passage', 80, 86, 51, 75, 1, 'onto the drill court: the court\'s one door'),
    box(24, 'Novices\' Stair', 'stair', NV_ST, 1),
    R(25, 'Hall of the Bow', 'bow_hall', 80, 116, 39, 51, 1, 'a covered hall for the draw, the knots and the stance; the bow in the afternoon'),
    R(26, 'Great Refectory', 'refectory', 80, 116, -61, -39, 2, 'the order eats together, in silence, the Song sung from the reader\'s seat; rises through both storeys'),
    R(27, 'Great Kitchen', 'kitchen', 80, 104, -81, -61, 1),
    R(28, 'Bakehouse', 'bakehouse', 104, 116, -81, -61, 1),
    R(29, 'Granary', 'granary', 116, 128, -81, -39, 0, 'a half-year\'s grain against a siege, about 75 t'),
    R(30, 'Larder, Tea and Butter', 'larder', 80, 100, -93, -81, 0),
    R(31, 'Dairy', 'dairy', 100, 116, -93, -81, 1, 'butter for the lamps and the tea'),
    box(32, 'Corner stair and garderobe', 'stair', SW_ST, 0),
    R(33, 'West Watch', 'guard', 114, 140, -12, 4, 2, 'the Storm Tower\'s ground floor: the guard of the west front toward Komodo'),
    R(34, 'Beacon Fuel Store', 'store', 114, 132, 4, 12, 0, 'wood and pitch for the tower\'s fire'),
    box(35, 'Storm Tower Stair', 'stair', ST_ST, 1, 'to the signal room, the watch and the roof'),
    R(36, 'Smithy and Farriery', 'smithy', 114, 128, 12, 39, 1),
    R(37, 'Bowyers and Fletchers', 'bowyers', 114, 128, -39, -12, 1, 'horn, sinew and glue; the shafts straightened, the arrows fletched'),
    R(38, 'Muster Court', 'muster', -114, -63, -79, 79, 2, 'the eight companies form here before the Prismarch\'s tower; the alarm gong'),
    R(39, 'Well and Troughs of the Muster', 'well', -104, -92, -70, -58, 1, 'over the great cistern under the court'),
    R(40, 'Riders\' Lane (north lists)', 'lists', -63, 80, 52, 81, 1, 'the north companies saddle and form here for the North Sally Gate'),
    R(41, 'South Lists', 'lists', -63, 80, -81, -52, 1),
    R(42, 'Hay Shed (north)', 'hay', 56, 80, 69, 81, 0, 'a week\'s hay and barley for the north stables'),
    R(43, 'Hay Shed (south)', 'hay', -63, -51, -80, -66, 0, 'for the south stables'),
    R(44, 'Archery Range', 'archery', -50, 76, -74, -58, 2, 'four lanes, 120 m, shot from the east end; the long shots go on the Maydan'),
    R(45, 'Stop Bank', 'bank', 76, 80, -76, -56, 0, 'an earth bank behind the butts'),
    R(46, 'Drill Court', 'drill_court', 63, 114, -39, 39, 2, 'the sword yard: pells, stance stones, the sand floor (Shaolin\'s worn floor)'),
    R(47, 'Utse (sheet U)', 'void', -63, -41, -11, 11, 3, 'the Prismarch\'s tower, astride the inner curtain: the inner gate climbs 4 m through its base'),
    R(48, 'Inner Court', 'inner_court', -41, -20, -26, 26, 3, 'the oath stone, where vows are taken and the companies swear before a sally'),
    R(49, 'The great monastery (sheets M1, M2, MR)', 'void', -20, 32, -26, 26, 4, 'the Qiblai kit\'s great monastery in its violet dress'),
    R(50, 'Infirmary of the Order', 'infirmary', -51, 0, 30, 46, 2, 'the wounded beside the hall, an altar at its end (the Hospitallers\')'),
    R(51, 'Apothecary', 'apothecary', 0, 12, 30, 46, 2),
    R(52, 'Physic Garden', 'garden', 12, 51, 30, 46, 2),
    R(53, 'Bath House of the Brothers', 'wash', -51, -25, -46, -30, 1, 'hot baths for the wounded and the tired'),
    R(54, 'Cistern and Well-house', 'cistern', -25, -5, -46, -30, 0, 'the inner ward\'s water, fed from its roofs'),
    R(55, 'Field of the Fallen', 'fallen', -5, 51, -46, -30, 3, 'small chortens of the masters, the wall of names of the brothers (Shaolin\'s pagoda forest)'),
    R(56, 'Founder\'s Garden', 'garden', 34, 53, -26, 26, 3),
    R(57, 'Founder\'s Chorten', 'founder', 38, 48, -5, 5, 4, 'the founder of the Violet Storm and his sword'),
    box(58, 'Founder\'s Way (stair head)', 'stair', FW_ST, 1, 'the hidden way out: a tunnel under the drill court and the west curtain to the thorn brake on the crest\'s edge (T0)'),
    R(59, 'Garderobe Turret', 'garderobe', -70, -64, 93, 99, 0, 'off the north captains\' stair (the dansker of Malbork, small)'),
    R(60, 'Garderobe Turret', 'garderobe', 32, 38, 93, 99, 0),
    R(61, 'Garderobe Turret', 'garderobe', -70, -64, -99, -93, 0),
    R(62, 'Garderobe Turret', 'garderobe', 32, 38, -99, -93, 0),
    C(63, 'Towers (grey): 4 corner drums, 20 interval towers at about 30 m, 4 inner drums', 'towers', -130, 95, 7, 0, 'the fort asset\'s march rule; each a guard post with arrows and a stair to the walk'),
  ]))

# ------------------------------------------------------------------------------------------------ T2 the enclosure, upper
FLOORS.append(dict(ENCL, id='T2', tier=1,
  title='Sheet T2: the House, upper storey of the ranges (about 4.5 m)',
  sub='The eight companies of the professed (*proposed*: forty each, named for the eight winds) sleep over their horses, dressed, their arms at their beds; between each pair of halls a stair rises from the stables past the captains\' cells to the wall walk (violet line), so at the gong each company mans its own stretch of curtain or goes down to its horses (the Templars\' rule). The Bow Loft and the Quiver House over the Sword Hall; the Marshal over his hall; the gate chambers with the gilt pavilion; the novices\' dormitories; the lay brothers over the kitchens; the Storm Tower\'s signal room and the west watch. The inner ward\'s upper floors are the infirmary\'s; the monastery and the utse have their own sheets.',
  fills=[TALUS] + TOWER_FILLS, lines=[INNER_LINE, WALK],
  outlines=[(-114, -63, -79, 79, 'muster court'), (63, 114, -39, 39, 'drill court'), (-63, 80, 52, 81, 'north lists'), (-63, 80, -81, -52, 'south lists'), (86, 116, 51, 81, 'novices\' yard')],
  rooms=[
    R(1, 'Gate Chamber, gilt pavilion', 'gatehouse', -138, -114, -9, 9, 3, 'the winch of the leaves, the murder holes; the pavilion over it is the fort\'s gold'),
    R(2, 'Gate Watch', 'barracks', -128, -114, 9, 19, 1),
    R(3, 'Gate Watch', 'barracks', -128, -114, -19, -9, 1),
    R(4, 'Bow Loft', 'bow_loft', -128, -114, 19, 40, 1, 'the strung bows and the spares'),
    R(5, 'Quiver House', 'quiver_house', -128, -114, 40, 57, 1, 'arrows by the sheaf: issued at the muster'),
    R(6, 'The Marshal\'s Rooms', 'chamber', -128, -114, 57, 79, 2),
    R(7, 'Grooms\' and Couriers\' Loft', 'lay_dorm', -128, -114, -57, -35, 1),
    R(8, 'Hay Loft', 'store', -128, -114, -35, -19, 0),
    R(9, 'Guest Chambers', 'hostel', -128, -114, -79, -57, 2),
    box(10, 'Corner stair', 'stair', NE_ST, 0), box(11, 'Corner stair', 'stair', SE_ST, 0),
    R(12, 'Company of the North Wind', 'company_hall', -114, -70, 81, 93, 1),
    R(13, 'Stair and Captains\' Cells', 'captains', -70, -64, 81, 93, 2, 'up to the wall walk; the garderobe turret off it'),
    R(14, 'Company of the North-East Wind', 'company_hall', -64, -22, 81, 93, 1),
    R(15, 'North Sally Gate chamber', 'gatehouse', -22, -10, 81, 101, 1),
    R(16, 'Company of the North-West Wind', 'company_hall', -10, 32, 81, 93, 1),
    R(17, 'Stair and Captains\' Cells', 'captains', 32, 38, 81, 93, 2),
    R(18, 'Company of the West Wind', 'company_hall', 38, 80, 81, 93, 1),
    R(19, 'Company of the South Wind', 'company_hall', -114, -70, -93, -81, 1),
    R(20, 'Stair and Captains\' Cells', 'captains', -70, -64, -93, -81, 2),
    R(21, 'Company of the South-East Wind', 'company_hall', -64, -22, -93, -81, 1),
    R(22, 'South Sally Gate chamber', 'gatehouse', -22, -10, -101, -81, 1),
    R(23, 'Company of the South-West Wind', 'company_hall', -10, 32, -93, -81, 1),
    R(24, 'Stair and Captains\' Cells', 'captains', 32, 38, -93, -81, 2),
    R(25, 'Company of the East Wind', 'company_hall', 38, 80, -93, -81, 1),
    R(26, 'Novices\' Dormitory (north)', 'novice_dorm', 80, 128, 81, 93, 1),
    R(27, 'Novices\' Dormitory (west)', 'novice_dorm', 116, 128, 39, 81, 1),
    R(28, 'Elder Novices', 'novice_dorm', 80, 104, 39, 51, 1, 'the year before the vows'),
    R(29, 'Masters of Arms', 'chamber', 104, 116, 39, 51, 2, 'the sword-master and the bow-master live with the boys'),
    box(30, 'Novices\' Stair', 'stair', NV_ST, 1),
    R(31, 'Great Refectory (rises through)', 'void', 80, 116, -61, -39, 2),
    R(32, 'Lay Brothers\' Dormitory', 'lay_dorm', 80, 116, -81, -61, 1, 'the fifty lay brothers: cooks, grooms, smiths, herdsmen off the crest'),
    R(33, 'The Cellarer', 'office', 80, 100, -93, -81, 2),
    R(34, 'Stores', 'store', 100, 116, -93, -81, 0),
    box(35, 'Corner stair', 'stair', SW_ST, 0),
    R(36, 'Granary Loft', 'store', 116, 128, -81, -39, 0),
    R(37, 'Signal Room of the Storm Tower', 'signal', 114, 140, -12, 0, 2, 'the brow relay\'s mirrors by day and fires by night are read here and sent to the utse'),
    R(38, 'Barrack of the West Watch', 'barracks', 114, 132, 0, 12, 1, 'the duty half-company of the west front'),
    box(39, 'Storm Tower Stair', 'stair', ST_ST, 1),
    R(40, 'Armourers\' Loft', 'armourers', 114, 128, 12, 39, 1, 'lamellar laced in violet, helmets, mending'),
    R(41, 'Bow-curing Loft', 'bow_loft', 114, 128, -39, -12, 1, 'warm and dry over the glue hearth: a composite bow cures a year on its form'),
    R(42, 'Utse (sheet U)', 'void', -63, -41, -11, 11, 3),
    R(43, 'The great monastery (sheet M2)', 'void', -20, 32, -26, 26, 4),
    R(44, 'Infirmary, Upper Ward', 'infirmary', -51, -12, 30, 46, 2),
    R(45, 'The Infirmarer', 'chamber', -12, 0, 30, 46, 2),
    R(46, 'Herb Drying Loft', 'drying', 0, 12, 30, 46, 1),
  ]))

# ------------------------------------------------------------------------------------------------ the great monastery
MON = dict(R=30, rect=(-22, 34, -28, 28), axisnote='u -> west; the Gate of the Song east (left), from the inner court; v north, up')
PART = (110, 110, 110)
def cells_u(u0, u1, v0, v1, n):
    """partition lines across a cell row that runs along u: n cells"""
    return [([(u0 + (u1 - u0) * k / n, v0), (u0 + (u1 - u0) * k / n, v1)], PART, 1) for k in range(1, n)]
def cells_v(u0, u1, v0, v1, n):
    """partition lines across a cell row that runs along v"""
    return [([(u0, v0 + (v1 - v0) * k / n), (u1, v0 + (v1 - v0) * k / n)], PART, 1) for k in range(1, n)]
CROWN = ([(11.6, -3.84), (17.0, -3.84), (17.0, 3.84), (11.6, 3.84), (11.6, -3.84)], (190, 140, 20), 4)

FLOORS.append(dict(MON, id='M1', tier=0,
  title='Sheet M1: the great monastery, ground floor (the kit\'s 52 m block, violet dress)',
  sub='qb_monastery with o.v 6 (the violet spoke): four cell ranges of two storeys round a cloistered court, the gate tower in front, the assembly hall (24 x 17 m, three storeys) at the back of the court under the gilt crown; the court\'s piece is the Song drum. No blade passes the Gate of the Song: the porter takes the brothers\' swords and bows into the Blade Room. The hall stands in a kora: the cloister walks, the court\'s arms either side of the hall and the passage behind it make one ring, walked three times with eyes lowered. The tea kitchen serves the hall at the morning assembly by the north kora. The old brothers\' cells (ten) are on the ground floor, off the south walk.',
  lines=cells_u(-9.5, 25, -26, -19, 10),
  rooms=[
    R(1, 'Gate of the Song', 'song_gate', -20.5, -12.5, -5, 5, 3, 'no blade past this door'),
    R(2, 'Porter\'s Lodge', 'chamber', -20, -13, 5, 11, 2, 'the porter keeps the door and the Blade Room\'s key'),
    R(3, 'Blade Room', 'blade_room', -20, -13, 11, 26, 2, 'each brother\'s sword and bow on its peg while he is in the cloister'),
    R(4, 'Sacristy', 'sacristy', -20, -13, -26, -5, 2, 'the violet robes, the lamps, the hall\'s silks'),
    R(5, 'Cloister Court', 'cloister_court', -13, 5.8, -16.8, 16.8, 3),
    R(6, 'Wheel of the Storm (the Song drum)', 'song_drum', -9.2, -5.2, -2, 2, 4, 'turned day and night'),
    R(7, 'Cloister Walk (north)', 'kora', -13, 25, 16.8, 19, 2, 'jali in every third bay, the prayer drums'),
    R(8, 'Cloister Walk (south)', 'kora', -13, 25, -19, -16.8, 2),
    R(9, 'Kora beside the Hall (north)', 'kora', 5.8, 22.8, 12, 16.8, 2, 'the court\'s arm along the hall: prayer drums on the hall\'s wall'),
    R(10, 'Kora beside the Hall (south)', 'kora', 5.8, 22.8, -16.8, -12, 2),
    R(11, 'Kora behind the Hall', 'kora', 22.8, 25, -16.8, 16.8, 2),
    R(12, 'Porch of the Hall', 'porch', 2.6, 5.8, -6, 6, 3, 'the painted portico, a prayer-drum row either side'),
    R(13, 'Assembly Hall (dukhang)', 'assembly', 5.8, 19, -12, 12, 4, 'two storeys high, lit from the light well under the crown; the Prismarch\'s seat'),
    R(14, 'Shrine of the Storm', 'shrine', 19, 22.8, -12, 8, 4, 'the Damsel with her dulcimer, the eight-spoked wheel, the order\'s relic'),
    box(15, 'Hall Stair', 'stair', MS_H, 2),
    R(16, 'Library of the Song', 'song_library', -9.5, 9, 19, 26, 3, 'the Song in the sound-grid script; the order\'s books of war'),
    R(17, 'Scriptorium of the Drums', 'scriptorium', 9, 17, 19, 26, 2, 'the Song written out for the prayer drums'),
    R(18, 'Tea Kitchen', 'tea_kitchen', 17, 25, 19, 26, 1, 'the butter tea for the assembly, carried in by the north kora'),
    R(19, 'Cells of the Old Brothers (ten)', 'cells', -9.5, 25, -26, -19, 1, 'no stair for the old and the lame'),
    R(20, 'Chapter House', 'chapter_house', 25, 32, -12, 12, 3, 'the daily chapter: faults confessed, the rota read, the companies\' captains heard'),
    R(21, 'Treasury of the Order', 'treasury', 25, 32, 15.5, 26, 2, 'the grants of esteem, the order\'s silver'),
    box(22, 'Back Stair', 'stair', MS_B, 1),
    R(23, 'Lamp, Butter and Robe Store', 'store', 25, 32, -20, -12, 0),
    R(24, 'Latrines', 'latrine', 25, 32, -26, -20, 0, 'in the corner, over a shaft to the talus'),
    box(25, 'Stair (north)', 'stair', MS_N, 1), box(26, 'Stair (south)', 'stair', MS_S, 1),
  ]))
FLOORS.append(dict(MON, id='M2', tier=1,
  title='Sheet M2: the great monastery, upper floor (the cells; the hall\'s gallery)',
  sub='The chapter\'s cells on the upper floor of the ranges (*proposed*: 39 cells here and the ten old brothers\' below, the young Song-singers two to a cell: about 65 of the chapter). The side ranges\' cells are the range\'s full 7 m, a sleeping alcove behind, their doors on a gallery over the cloister\'s roof; the front ranges\' open on a corridor along the court. The back range holds the Prior, the chant-master and the guests of the daughter house, on a gallery over the kora behind the hall. The hall\'s gallery is a storey higher (the hall is 5 m), round the void, reached by the hall stair.',
  lines=cells_u(-9.5, 25, 19, 26, 10) + cells_u(-9.5, 25, -26, -19, 10) + cells_v(-20, -15.4, 5, 26, 6) + cells_v(-20, -15.4, -26, -5, 6)
        + cells_v(25, 32, 15.5, 26, 3) + cells_v(25, 32, -26, -12, 4),
  rooms=[
    R(1, 'Drum of the Hours', 'drum_room', -20.5, -12.5, -5, 5, 2, 'the gate tower\'s second storey: the hours beaten for the cloister'),
    R(2, 'Cells (front, north: six)', 'cells', -20, -15.4, 5, 26, 1),
    R(3, 'Corridor', 'passage', -15.4, -13, 5, 26, 1),
    R(4, 'Cells (front, south: six)', 'cells', -20, -15.4, -26, -5, 1),
    R(5, 'Corridor', 'passage', -15.4, -13, -26, -5, 1),
    R(6, 'Cells of the Chapter (north: ten)', 'cells', -9.5, 25, 19, 26, 1),
    R(7, 'Cells of the Chapter (south: ten)', 'cells', -9.5, 25, -26, -19, 1),
    R(8, 'Gallery on the Cloister Roof', 'passage', -13, 25, 16.8, 19, 1),
    R(9, 'Gallery on the Cloister Roof', 'passage', -13, 25, -19, -16.8, 1),
    R(10, 'Gallery over the Kora', 'passage', 22.8, 25, -16.8, 16.8, 1, 'behind the hall, to the back range'),
    R(11, 'The Prior', 'chamber', 25, 32, -12, 0, 3, 'the Prismarch\'s deputy in the Song'),
    R(12, 'The Chant-master', 'chamber', 25, 32, 0, 12, 2),
    R(13, 'Guest Cells of the Daughter House (four)', 'cells', 25, 32, -26, -12, 2, 'monks of Qiblai\'s violet monastery'),
    R(14, 'Cells (three)', 'cells', 25, 32, 15.5, 26, 1),
    box(15, 'Back Stair', 'stair', MS_B, 1),
    R(16, 'Masters\' Gallery (north)', 'gallery', 5.8, 19, 9, 12, 3, 'the masters sit here at the assembly, over the brothers'),
    R(17, 'Masters\' Gallery (south)', 'gallery', 5.8, 19, -12, -9, 3),
    R(18, 'Masters\' Gallery (west)', 'gallery', 16, 19, -9, 9, 3),
    R(19, 'Assembly Hall below', 'void', 5.8, 16, -9, 9, 4),
    R(20, 'Shrine below (rises through)', 'void', 19, 22.8, -12, 8, 4),
    box(21, 'Hall Stair', 'stair', MS_H, 2),
    R(22, 'Cloister Court (open)', 'void', -13, 5.8, -16.8, 16.8, 3),
    box(23, 'Stair (north)', 'stair', MS_N, 1), box(24, 'Stair (south)', 'stair', MS_S, 1),
  ]))
FLOORS.append(dict(MON, id='MR', tier=2,
  title='Sheet MR: the great monastery, the hall\'s third storey and the roofs',
  sub='The hall\'s top storey is the Hall of Vigil round the light well, where the Song-singers keep the night under the gilt crown (gold outline): the crown\'s pavilion is the hall\'s lantern, lighting the assembly through the well. Behind it, windowless, the Protectors\' Chapel (the gonkhang), its pillars hung with the arms of the order\'s dead, as the Tibetan protector chapels hang old weapons. The ranges\' flat roofs (gilt corners, the violet band) are reached by the three stairs: prayer flags on their masts, the incense altar (sang) on the back range, the gate tower\'s top storey the cloister\'s lookout, banners and the deer on its roof.',
  lines=[CROWN],
  rooms=[
    R(1, 'Hall of Vigil', 'gallery', 5.8, 11.6, -12, 12, 4, 'the Song-singers\' night vigil round the light well'),
    R(2, 'Light Well (under the crown)', 'void', 11.6, 17, -3.84, 3.84, 4, 'the crown\'s pavilion lights the hall two storeys below'),
    R(3, 'Protectors\' Chapel (gonkhang)', 'protectors', 17, 22.8, -12, 8, 4, 'dark: the oldest blades, the arms of the fallen, the protector\'s image veiled'),
    box(4, 'Hall Stair (head)', 'stair', MS_H, 2),
    R(5, 'Lookout of the Song', 'watch', -20.5, -12.5, -5, 5, 1, 'the gate tower\'s third storey'),
    R(6, 'Roof (north range)', 'roof', -9.5, 25, 19, 26, 1, 'prayer-flag masts'),
    R(7, 'Roof (south range)', 'roof', -9.5, 25, -26, -19, 1),
    R(8, 'Roof (back range)', 'roof', 25, 32, -26, 12, 1),
    R(9, 'Roof (front range)', 'roof', -20, -13, 5, 26, 1),
    R(10, 'Roof (front range)', 'roof', -20, -13, -26, -5, 1),
    R(11, 'Incense Altar (sang)', 'sang', 26, 31, -3, 3, 2, 'juniper burned at dawn and before a sally'),
    box(12, 'Back Stair (head)', 'stair', MS_B, 1), box(13, 'Stair (north, head)', 'stair', MS_N, 1), box(14, 'Stair (south, head)', 'stair', MS_S, 1),
    R(15, 'Roof (back range)', 'roof', 25, 32, 15.5, 26, 1),
    R(16, 'Cloister Court (open)', 'void', -13, 5.8, -16.8, 16.8, 3),
    R(17, 'Hall of Vigil (north arm)', 'gallery', 11.6, 17, 3.84, 12, 4),
    R(18, 'Hall of Vigil (south arm)', 'gallery', 11.6, 17, -12, -3.84, 4),
    R(19, 'Landing', 'passage', 17, 19, 8, 12, 2, 'from the hall stair to the vigil and the chapel\'s door'),
  ]))

# ------------------------------------------------------------------------------------------------ U the Prismarch's tower
# the utse is 22 x 22 m (real u -63..-41, v -11..11); its five floors are drawn side by side in panels of local
# coordinates (0..22, -11..11): row 0 above (U0-U2), row 1 below (U3, U4)
US = (17, 22, 6, 11)
UPAN = {'U0': (0, 0), 'U1': (1, 0), 'U2': (2, 0), 'U3': (0, 1), 'U4': (1, 1)}
def up(pid, n, name, kind, u0, u1, v0, v1, decor, note=''):
    c, r = UPAN[pid]; du = -63 + c * 30; dv = 16 if r == 0 else -16
    return R(n, '%s: %s' % (pid, name), kind, u0 + du, u1 + du, v0 + dv, v1 + dv, decor, note)
def ubox(pid, n, name, kind, b, decor, note=''):
    return up(pid, n, name, kind, b[0], b[1], b[2], b[3], decor, note)
def upanel(pid, label):
    c, r = UPAN[pid]; du = -63 + c * 30; dv = 16 if r == 0 else -16
    return (du - 4, du + 23, dv - 12, dv + 12, label)
FLOORS.append(dict(R=50, rect=(-68, 21, -29, 29), id='U', tier=0,
  title='Sheet U: the Prismarch\'s tower (the utse), its five floors side by side',
  sub='The owner, 2026-11-16: the violet Prismarch lives here, in a tower between the wards: the war room and the order\'s banner below, his cell in the middle, his chapel and the beacon on top; he rides to Qiblai for the councils. 22 x 22 m, battered, about 23 m to the roof; the inner gate climbs 4 m through its base, under the murder gallery. One stair serves every floor; a rope hoist in its well carries the runners\' notes up to the War Room. The balcony on U2\'s east face looks down on the muster court. In each panel the Main Gate side (east) is on the left.',
  axisnote='each panel: east (the muster court) on the left, the inner court on the right; north up',
  outlines=[upanel('U0', 'U0 ground (0 m)'), upanel('U1', 'U1 (5 m)'), upanel('U2', 'U2 (9.5 m)'), upanel('U3', 'U3 (14.5 m)'), upanel('U4', 'U4 top (18.5 m)')],
  rooms=[
    up('U0', 1, 'Inner Gate passage', 'passage', 0, 22, -3, 3, 2, 'a covered ramp up 4 m to the inner court; two leaves, murder holes'),
    up('U0', 2, 'Keepers of the Inner Gate', 'guard', 0, 17, 3, 11, 1),
    ubox('U0', 3, 'Stair', 'stair', US, 2),
    up('U0', 0, 'Lobby', 'passage', 17, 22, 3, 6, 1, 'the stair\'s foot, off the passage behind the keepers\' door'),
    up('U0', 4, 'Runners\' Room', 'runners', 0, 22, -11, -3, 1, 'messages from the Storm Tower and the posts come in here and go up'),
    up('U1', 5, 'War Room', 'war_room', 0, 22, -11, -3, 3, 'the map of Lizard country and the Kruk Warra, the beacon codes, the raid ledger; the Marshal and the captains in council'),
    up('U1', 6, 'Murder Gallery', 'murder', 0, 17, -3, 3, 1, 'over the passage: the holes in its floor, the leaves\' winch'),
    up('U1', 7, 'Clerks of the Raid Ledger', 'office', 0, 17, 3, 11, 2),
    ubox('U1', 8, 'Stair', 'stair', US, 2),
    up('U1', 0, 'Landing', 'passage', 17, 22, -3, 6, 1, 'the hoist comes up here from the runners'),
    up('U2', 9, 'Hall of the Banner', 'banner_hall', 0, 17, -11, 11, 3, 'the Violet Storm\'s banner and the eight companies\''),
    up('U2', 10, 'Balcony', 'balcony', -2.5, 0, -6, 6, 3, 'where the Prismarch shows himself to the companies at the muster (the dzong\'s festival balcony)'),
    up('U2', 11, 'Antechamber', 'antechamber', 17, 22, -11, 6, 2),
    ubox('U2', 12, 'Stair', 'stair', US, 2),
    up('U3', 13, 'Audience Room', 'audience', 0, 11, -11, 11, 3, 'small: the Prismarch rules in a small room'),
    up('U3', 14, 'The Prismarch\'s Cell', 'abbot_cell', 11, 22, -11, 1, 2, 'a monk\'s cell with his own sword and bow'),
    up('U3', 15, 'Secretary', 'office', 11, 17, 1, 11, 2),
    up('U3', 16, 'Attendant and Garderobe', 'attendant', 17, 22, 1, 6, 1, 'the attendant sleeps by the stair'),
    ubox('U3', 17, 'Stair', 'stair', US, 2),
    up('U4', 18, 'Roof Terrace', 'roof', 0, 22, -11, 11, 2),
    up('U4', 19, 'Chapel of the Prismarch', 'chapel', 3, 19, -8, 8, 4, 'the keep\'s gilt chapel of the fort asset (its gilt finial)'),
    up('U4', 20, 'Beacon', 'beacon', 0, 5, -11, -6, 1, 'the fire basket and the signal mirror: the line east to Strongwall and the watch posts'),
    ubox('U4', 21, 'Stair (head)', 'stair', US, 2),
  ]))
for _i, _r in enumerate(FLOORS[-1]['rooms']): _r['n'] = _i + 1   # sheet U is numbered in list order

# ------------------------------------------------------------------------------------------------ the programmes
cs = lambda n: max(1, round(n))
def programs():
    return {
      'gatehouse': lambda a, w, d, D: [('xanadu_common_bench', 2), ('xanadu_common_weapon_rack', 2), ('xanadu_common_fire', 1), ('xanadu_common_alarm_gong', 1)],
      'sally_gate': lambda a, w, d, D: [('xanadu_common_bench', 2), ('xanadu_common_weapon_rack', 1), ('xanadu_common_mounting_block', 2)],
      'tower': lambda a, w, d, D: [('xanadu_common_weapon_rack', 1), ('xanadu_arms_arrow_bin', 1), ('xanadu_common_bench', 1)],
      'stable': lambda a, w, d, D: [('xanadu_trade_stall', cs(a / 15)), ('xanadu_trade_trough', cs(a / 60)), ('xanadu_trade_hayrack', cs(a / 60)), ('xanadu_arms_saddle_rack', cs(a / 40)), ('xanadu_common_mounting_block', cs(a / 300))],
      'company_hall': lambda a, w, d, D: [('xanadu_common_bed', cs(a / 13)), ('xanadu_common_chest', cs(a / 13)), ('xanadu_common_armour_stand', cs(a / 13)), ('xanadu_common_weapon_rack', cs(a / 26)), ('xanadu_arms_bow_rack', cs(a / 26)), ('xanadu_common_table', cs(a / 120)), ('xanadu_common_bench', cs(a / 60)), ('xanadu_common_prayer_wheels', 1)],
      'captains': lambda a, w, d, D: [('xanadu_common_bed', 2), ('xanadu_common_desk', 2), ('xanadu_common_chair', 2), ('xanadu_common_chest', 2), ('xanadu_common_armour_stand', 2), ('xanadu_common_weapon_rack', 2)],
      'armoury': lambda a, w, d, D: [('xanadu_common_weapon_rack', cs(a / 12)), ('xanadu_common_armour_stand', cs(a / 15)), ('xanadu_arms_bow_rack', cs(a / 20)), ('xanadu_arms_arrow_bin', cs(a / 20)), ('xanadu_trade_grindstone', 1), ('xanadu_common_workbench', 2), ('xanadu_common_chest', cs(a / 60)), ('xanadu_common_desk', 1)],
      'bow_loft': lambda a, w, d, D: [('xanadu_arms_bow_form', cs(a / 6)), ('xanadu_arms_bow_rack', cs(a / 30)), ('xanadu_common_workbench', 2), ('xanadu_common_store', cs(a / 60))],
      'quiver_house': lambda a, w, d, D: [('xanadu_arms_arrow_bin', cs(a / 4)), ('xanadu_common_wall_shelves', cs(a / 30)), ('xanadu_common_desk', 1)],
      'bowyers': lambda a, w, d, D: [('xanadu_arms_fletching_bench', cs(a / 25)), ('xanadu_arms_bow_form', cs(a / 40)), ('xanadu_common_workbench', cs(a / 40)), ('xanadu_common_wall_shelves', cs(a / 40)), ('xanadu_common_stool', cs(a / 30)), ('xanadu_common_hearth', 1)],
      'armourers': lambda a, w, d, D: [('xanadu_common_workbench', cs(a / 40)), ('xanadu_common_armour_stand', cs(a / 30)), ('xanadu_common_stool', cs(a / 30)), ('xanadu_common_wall_shelves', cs(a / 60))],
      'smithy': lambda a, w, d, D: [('xanadu_trade_forge', cs(a / 120)), ('xanadu_trade_anvil', cs(a / 80)), ('xanadu_trade_grindstone', cs(a / 150)), ('xanadu_common_workbench', cs(a / 80)), ('xanadu_common_rack', cs(a / 80)), ('xanadu_trade_trough', 1)],
      'muster': lambda a, w, d, D: [('xanadu_common_alarm_gong', 1), ('xanadu_common_mounting_block', cs(a / 1000))],
      'well': lambda a, w, d, D: [('xanadu_common_well', 1), ('xanadu_trade_trough', 4)],
      'drill_court': lambda a, w, d, D: [('xanadu_training_training_dummy', cs(a / 200)), ('xanadu_training_pell', cs(a / 200)), ('xanadu_training_stance_stones', 2), ('xanadu_common_weapon_rack', 4), ('xanadu_common_bench', 4)],
      'archery': lambda a, w, d, D: [('xanadu_training_archery_butt', cs(d / 4)), ('xanadu_arms_arrow_bin', 4), ('xanadu_common_bench', 2)],
      'bow_hall': lambda a, w, d, D: [('xanadu_training_archery_butt', 3), ('xanadu_arms_bow_rack', 2), ('xanadu_common_bench', 4), ('xanadu_common_board', 1)],
      'yard': lambda a, w, d, D: [('xanadu_training_training_dummy', 3), ('xanadu_training_pell', 2), ('xanadu_training_archery_butt', 1), ('xanadu_common_well', 1)],
      'maydan': lambda a, w, d, D: [('xanadu_training_horse_target', 6), ('xanadu_training_archery_butt', 4), ('xanadu_common_mounting_block', 2)],
      'horse_park': lambda a, w, d, D: [('xanadu_trade_trough', 8), ('xanadu_trade_hayrack', 8)],
      'byres': lambda a, w, d, D: [('xanadu_trade_trough', 4), ('xanadu_trade_hayrack', 4), ('xanadu_works_churn', 2), ('xanadu_common_bed', 6), ('xanadu_common_hearth', 2)],
      'lay_dorm': lambda a, w, d, D: [('xanadu_common_bed', cs(a / 18)), ('xanadu_common_chest', cs(a / 18)), ('xanadu_common_stool', cs(a / 40))],
      'hay': lambda a, w, d, D: [('xanadu_trade_hayrack', cs(a / 30)), ('xanadu_trade_bin', cs(a / 40))],
      'midden': lambda a, w, d, D: [], 'garderobe': lambda a, w, d, D: [],
      'towers': lambda a, w, d, D: [('xanadu_common_weapon_rack', N_TOWERS), ('xanadu_arms_arrow_bin', N_TOWERS), ('xanadu_common_bench', N_TOWERS)],
      'caravan_halt': lambda a, w, d, D: [('xanadu_trade_trough', 4), ('xanadu_trade_hayrack', 4), ('xanadu_common_bench', 4)],
      'tea_kitchen': lambda a, w, d, D: [('xanadu_common_tea_copper', 2), ('xanadu_common_hearth', 1), ('xanadu_works_churn', 2), ('xanadu_common_workbench', 1), ('xanadu_common_jug', 12)],
      'latrine': lambda a, w, d, D: [],
      'murder': lambda a, w, d, D: [('xanadu_common_weapon_rack', 2), ('xanadu_arms_arrow_bin', 2), ('xanadu_common_store', 2)],
      'balcony': lambda a, w, d, D: [], 'attendant': lambda a, w, d, D: [('xanadu_common_bed', 1), ('xanadu_common_chest', 1)], 'sang': lambda a, w, d, D: [('xanadu_court_incense_burner', 1)],
      'lists': lambda a, w, d, D: [], 'bank': lambda a, w, d, D: [], 'field': lambda a, w, d, D: [], 'threshing': lambda a, w, d, D: [], 'cloister_court': lambda a, w, d, D: [],
      'roof': lambda a, w, d, D: [],
      'refectory': lambda a, w, d, D: [('xanadu_common_table', cs(a / 19)), ('xanadu_common_bench', cs(a / 9.5)), ('xanadu_common_reader_seat', 1), ('xanadu_common_bowl', cs(a / 4)), ('xanadu_common_jug', cs(a / 19))],
      'novice_refectory': lambda a, w, d, D: [('xanadu_common_table', cs(a / 25)), ('xanadu_common_bench', cs(a / 12)), ('xanadu_common_hearth', 1), ('xanadu_common_tea_copper', 1), ('xanadu_common_wall_shelves', 2), ('xanadu_common_bowl', cs(a / 6))],
      'novice_dorm': lambda a, w, d, D: [('xanadu_common_bed', cs(a / 8)), ('xanadu_common_chest', cs(a / 16)), ('xanadu_common_prayer_wheels', 1)],
      'novice_armoury': lambda a, w, d, D: [('xanadu_common_weapon_rack', cs(a / 15)), ('xanadu_arms_bow_rack', cs(a / 20)), ('xanadu_arms_arrow_bin', 2), ('xanadu_common_chest', 2)],
      'song_school': lambda a, w, d, D: [('xanadu_common_meditation_cushion', cs(a / 3)), ('xanadu_common_low_table', cs(a / 6)), ('xanadu_common_board', 2), ('xanadu_common_scroll_rack', 2), ('xanadu_common_prayer_wheels', 1)],
      'wash': lambda a, w, d, D: [('xanadu_common_bath_basin', cs(a / 15)), ('xanadu_common_bench', 2), ('xanadu_common_hearth', 1)],
      'granary': lambda a, w, d, D: [('xanadu_trade_bin', cs(a / 20)), ('xanadu_works_weigh_scale', 1), ('xanadu_works_tally_board', 1), ('xanadu_common_ladder', 1)],
      'dairy': lambda a, w, d, D: [('xanadu_works_churn', cs(a / 30)), ('xanadu_works_cheese_press', cs(a / 60)), ('xanadu_common_store', cs(a / 30)), ('xanadu_common_wall_shelves', cs(a / 40))],
      'infirmary': lambda a, w, d, D: [('xanadu_works_sickbed', cs(a / 12)), ('xanadu_works_herb_bench', 1), ('xanadu_common_wall_shelves', cs(a / 60)), ('xanadu_common_chest', cs(a / 60)), ('xanadu_court_altar', 1), ('xanadu_common_hearth', 1)],
      'apothecary': lambda a, w, d, D: [('xanadu_works_herb_bench', 2), ('xanadu_common_wall_shelves', cs(a / 15)), ('xanadu_common_store', 2), ('xanadu_common_desk', 1)],
      'drying': lambda a, w, d, D: [('xanadu_common_drying_rack', cs(a / 12)), ('xanadu_common_store', 2)],
      'signal': lambda a, w, d, D: [('xanadu_common_signal_mirror', 2), ('xanadu_common_board', 2), ('xanadu_common_desk', 1), ('xanadu_common_chair', 2), ('xanadu_common_store', 2)],
      'guard': lambda a, w, d, D: [('xanadu_common_table', 1), ('xanadu_common_bench', 2), ('xanadu_common_armour_stand', 2), ('xanadu_common_weapon_rack', 2), ('xanadu_arms_arrow_bin', 1), ('xanadu_common_fire', 1)],
      'inner_court': lambda a, w, d, D: [('xanadu_court_oath_stone', 1), ('xanadu_common_prayer_wheels', 2)],
      'fallen': lambda a, w, d, D: [('xanadu_court_chorten', cs(a / 40)), ('xanadu_court_name_wall', 2), ('xanadu_common_butter_lamp_rack', 1)],
      'founder': lambda a, w, d, D: [('xanadu_court_chorten', 1), ('xanadu_common_butter_lamp_rack', 2), ('xanadu_court_incense_burner', 1)],
      'song_gate': lambda a, w, d, D: [('xanadu_common_bench', 2), ('xanadu_common_lamp', 2)],
      'blade_room': lambda a, w, d, D: [('xanadu_common_weapon_rack', cs(a / 8)), ('xanadu_arms_bow_rack', cs(a / 12)), ('xanadu_common_desk', 1), ('xanadu_common_chair', 1)],
      'sacristy': lambda a, w, d, D: [('xanadu_court_cabinet', cs(a / 20)), ('xanadu_common_chest', cs(a / 20)), ('xanadu_common_butter_lamp_rack', 2), ('xanadu_common_rack', 2)],
      'song_drum': lambda a, w, d, D: [('xanadu_common_butter_lamp_rack', 1)],
      'porch': lambda a, w, d, D: [('xanadu_common_prayer_wheels', 2)],
      'shrine': lambda a, w, d, D: [('xanadu_court_altar', 1), ('xanadu_court_statue', 1), ('xanadu_court_incense_burner', 2), ('xanadu_common_butter_lamp_rack', 2), ('xanadu_court_storm_banner', 1)],
      'song_library': lambda a, w, d, D: [('xanadu_common_scroll_rack', cs(a / 8)), ('xanadu_common_low_table', cs(a / 25)), ('xanadu_common_meditation_cushion', cs(a / 12)), ('xanadu_common_bookcase', cs(a / 40)), ('xanadu_court_map_table', 1)],
      'chapter_house': lambda a, w, d, D: [('xanadu_court_throne', 1), ('xanadu_common_meditation_cushion', cs(a / 2.5)), ('xanadu_court_low_table', 1)],
      'gallery': lambda a, w, d, D: [('xanadu_common_meditation_cushion', cs(a / 3)), ('xanadu_court_painted_hanging', cs(a / 20))],
      'drum_room': lambda a, w, d, D: [('xanadu_common_hour_drum', 1), ('xanadu_common_bench', 1), ('xanadu_common_water_clock', 1)],
      'watch': lambda a, w, d, D: [('xanadu_common_bench', 1)],
      'protectors': lambda a, w, d, D: [('xanadu_court_protector_pillar', cs(a / 30)), ('xanadu_court_altar', 1), ('xanadu_court_incense_burner', 2), ('xanadu_common_candle', cs(a / 8)), ('xanadu_court_painted_hanging', cs(a / 40))],
      'runners': lambda a, w, d, D: [('xanadu_common_bench', 4), ('xanadu_common_board', 1), ('xanadu_common_chest', 1), ('xanadu_common_hour_drum', 1)],
      'war_room': lambda a, w, d, D: [('xanadu_court_map_table', 1), ('xanadu_court_council_table', 1), ('xanadu_common_chair', 12), ('xanadu_common_board', 3), ('xanadu_court_bookcase', 2)],
      'banner_hall': lambda a, w, d, D: [('xanadu_court_storm_banner', 1), ('xanadu_court_banner', 8), ('xanadu_common_weapon_rack', 2), ('xanadu_court_oath_stone', 0)],
      'audience': lambda a, w, d, D: [('xanadu_court_throne', 1), ('xanadu_common_meditation_cushion', 8), ('xanadu_court_low_table', 2), ('xanadu_court_screen', 1)],
      'abbot_cell': lambda a, w, d, D: [('xanadu_common_bed', 1), ('xanadu_common_chest', 1), ('xanadu_common_desk', 1), ('xanadu_common_meditation_cushion', 1), ('xanadu_common_armour_stand', 1), ('xanadu_common_weapon_rack', 1), ('xanadu_arms_bow_rack', 1)],
      'beacon': lambda a, w, d, D: [('xanadu_common_beacon_basket', 1), ('xanadu_common_signal_mirror', 1), ('xanadu_common_store', 2)],
    }

OPEN = {'muster', 'lists', 'drill_court', 'archery', 'bank', 'yard', 'maydan', 'horse_park', 'field', 'threshing', 'cloister_court',
        'fallen', 'founder', 'song_drum', 'roof', 'well', 'inner_court', 'porch', 'watch', 'hay', 'midden', 'garderobe', 'caravan_halt', 'sang', 'balcony'}

def keymap():
    m = LS.keymap()
    m.update({'voth_court_armour_stand': 'xanadu_common_armour_stand', 'generic_trade_weapon_rack': 'xanadu_common_weapon_rack',
              'voth_bread_oven': 'xanadu_works_bread_oven', 'generic_lamp': 'xanadu_common_lamp', 'voth_common_cauldron': 'xanadu_common_tea_copper'})
    for r in ['bunk', 'locker', 'trough', 'hayrack', 'bin', 'vat', 'barrel', 'larder', 'still', 'lathe', 'press', 'kiln', 'stall']:
        m['generic_trade_' + r] = 'xanadu_trade_' + r
    return m

NEW = {
  'xanadu_arms_bow_rack': 'strung horn-and-sinew recurve bows on wall pegs, a quiver hung under each, violet cords',
  'xanadu_arms_arrow_bin': 'a slatted bin of arrows in sheaves of thirty, fletched violet and white',
  'xanadu_arms_bow_form': 'a composite bow lashed to its shaped wooden form to cure (a loft holds them in rows for a year)',
  'xanadu_arms_fletching_bench': 'the fletcher\'s bench: shafts, a feather box, a glue pot on a brazier, a straightening iron',
  'xanadu_arms_saddle_rack': 'saddles on wall pegs, bridles and the violet saddle-cloths below',
  'xanadu_training_pell': 'a stout scarred post sunk in the sand for sword cuts',
  'xanadu_training_stance_stones': 'a row of shallow foot-hollows worn into stone slabs (Shaolin\'s floor), a floor piece',
  'xanadu_training_horse_target': 'a small square board on a post beside the riding track, for the mounted archer',
  'xanadu_common_mounting_block': 'a stepped stone mounting block',
  'xanadu_common_alarm_gong': 'the great bronze alarm gong in a timber frame, its beater on a chain',
  'xanadu_common_hour_drum': 'a big barrel drum on a lacquer stand, beaten for the hours',
  'xanadu_common_reader_seat': 'the refectory reader\'s raised seat and lectern, where a monk sings the Song at meals',
  'xanadu_common_signal_mirror': 'a signal mirror on a tripod with a sighting vane and a shutter',
  'xanadu_common_beacon_basket': 'an iron fire basket on a stone pedestal, the fuel stacked beside it (the fort asset\'s beacon, as furniture)',
  'xanadu_court_storm_banner': 'the Violet Storm\'s banner on its lacquer stand: violet silk, the eight-spoked wheel struck through by lightning',
  'xanadu_court_protector_pillar': 'a gonkhang pillar dressed with old swords, bows, lamellar coats and helmets bound in silk scarves',
  'xanadu_court_oath_stone': 'the oath stone: a waist-high block with the wheel carved on its face, worn by hands',
}

# ------------------------------------------------------------------------------------------------ the section
def draw_section():
    f_t = B.font(40, True); f = B.font(20); fs = B.font(17)
    W, H = 2500, 760; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Section along the axis (v = 0): barbican, Main Gate, muster court, utse, monastery, drill court, Storm Tower (heights x2)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), 'East (the Main Gate, toward Strongwall) on the left. The talus (4 m), the storeys and the towers\' heights are assumptions; the monastery\'s are the kit\'s (qb_monastery, violet: two-storey ranges, the hall 5 + 4 + 3.6 m on a 1.8 m plinth).', font=fs, fill=(70, 70, 70))
    sx = 7.0; sy = 14.0; ox = 40 + 170 * sx; base = H - 150
    def X(u): return ox + u * sx
    def Y(h): return base - h * sy
    def rect(u0, u1, h0, h1, fill, name=None, col=(0, 0, 0), up=True):
        dr.rectangle([X(u0), Y(h1), X(u1), Y(h0)], fill=fill, outline=(30, 30, 30), width=2)
        if name: dr.text((X(u0) + 3, Y(h1) - 22 if up else Y(h1) + 3), name, font=fs, fill=col)
    dr.polygon([(X(-170), Y(0)), (X(-59), Y(0)), (X(-55), Y(4)), (X(55), Y(4)), (X(59), Y(0)), (X(150), Y(0)), (X(150), Y(-8)), (X(-170), Y(-8))], fill=(228, 214, 190), outline=(120, 100, 80))
    rect(-162, -160, 0, 6, (236, 232, 218)); dr.text((X(-166), Y(6) - 44), 'barbican', font=fs, fill=(0, 0, 0))
    rect(-138, -114, 0, 14, (236, 232, 218), 'Main Gate', up=False)
    rect(-131, -121, 14, 18, (238, 220, 150), 'gilt pavilion', (120, 80, 0))
    dr.text((X(-110), Y(0) - 24), 'muster court', font=fs, fill=(0, 0, 0))
    for h0, h1, nm in [(0, 5, 'U0 the inner gate'), (5, 9.5, 'U1 War Room'), (9.5, 14.5, 'U2 Hall of the Banner'), (14.5, 18.5, 'U3 the Prismarch')]:
        rect(-63, -41, h0, h1, (250, 250, 240)); dr.text((X(-63) + 3, Y(h1) + 2), nm, font=fs, fill=(0, 0, 0))
    rect(-60, -44, 18.5, 22.5, (238, 220, 150)); dr.text((X(-60) + 3, Y(22.5) + 2), 'U4 chapel', font=fs, fill=(0, 0, 0))
    dr.line([(X(-52), Y(22.5)), (X(-52), Y(25.5))], fill=(180, 140, 20), width=4); dr.text((X(-75), Y(25.5) - 22), 'gilt finial; the beacon', font=fs, fill=(120, 80, 0))
    dr.line([(X(-63), Y(1)), (X(-41), Y(4))], fill=(160, 0, 0), width=3)
    dr.text((X(-38), Y(4) - 22), 'inner court', font=fs, fill=(0, 0, 0))
    rect(-20, 32, 4, 5.2, (220, 216, 206))
    rect(-20.5, -12.5, 5.2, 15.0, (250, 250, 240), 'gate tower')
    rect(-12.5, 25, 5.2, 11.6, (238, 228, 242)); dr.text((X(-12.5) + 3, Y(11.6) - 22), 'side ranges', font=fs, fill=(110, 90, 120))
    dr.rectangle([X(-9.2), Y(9.4), X(-5.2), Y(5.2)], fill=(238, 220, 150), outline=(30, 30, 30)); dr.text((X(-12), Y(9.4) - 22), 'Song drum', font=fs, fill=(0, 0, 0))
    rect(2.6, 5.8, 5.8, 9.0, (236, 232, 218))
    rect(5.8, 22.8, 5.8, 14.8, (200, 160, 210)); dr.text((X(5.8) + 3, Y(14.8) + 2), 'Assembly Hall', font=fs, fill=(0, 0, 0))
    dr.text((X(5.8) + 3, Y(14.8) + 22), '(two storeys)', font=fs, fill=(0, 0, 0))
    rect(5.8, 11.6, 14.8, 18.4, (200, 160, 210)); dr.text((X(5.8) + 3, Y(18.4) + 2), 'vigil', font=fs, fill=(0, 0, 0))
    rect(17.0, 22.8, 14.8, 18.4, (150, 110, 160)); dr.text((X(23.5), Y(18.4) - 4), 'gonkhang', font=fs, fill=(90, 50, 100))
    rect(11.6, 17.0, 14.8, 18.4, (255, 255, 240))
    for du in (1.2, 2.7, 4.2):
        dr.line([(X(11.6 + du), Y(18.4)), (X(11.0 + du), Y(12.5))], fill=(220, 180, 60), width=2)
    dr.polygon([(X(11.6), Y(18.4)), (X(17.0), Y(18.4)), (X(16), Y(21)), (X(14.3), Y(22.5)), (X(12.6), Y(21))], fill=(238, 220, 150), outline=(120, 80, 0))
    dr.text((X(18), Y(22.5) - 22), 'the gilt crown: its light falls through the well into the hall', font=fs, fill=(120, 80, 0))
    rect(25, 32, 5.2, 11.6, (200, 160, 210)); dr.text((X(20), Y(4) + 4), 'back range', font=fs, fill=(0, 0, 0))
    rect(38, 48, 4, 12, (238, 220, 150)); dr.text((X(36), Y(12) - 22), "Founder's Chorten", font=fs, fill=(0, 0, 0))
    rect(53, 57, 0, 12, (236, 232, 218)); dr.text((X(48), Y(12) - 44), 'inner curtain 12 m', font=fs, fill=(0, 0, 0))
    dr.text((X(70), Y(0) - 24), 'drill court', font=fs, fill=(0, 0, 0))
    for h0, h1, nm in [(0, 5, 'west watch'), (5, 10, 'signal room'), (10, 15, 'watch'), (15, 20, 'mirrors, fire')]:
        rect(114, 140, h0, h1, (236, 232, 218)); dr.text((X(114) + 3, Y(h1) + 2), nm, font=fs, fill=(0, 0, 0))
    dr.text((X(108), Y(20) - 22), 'Storm Tower', font=fs, fill=(0, 0, 0))
    dr.line([(X(50), Y(4)), (X(52), Y(-4)), (X(150), Y(-4))], fill=(160, 0, 0), width=3); dr.text((X(62), Y(-4) + 4), "the Founder's Way (tunnel) to the brow's scrub", font=fs, fill=(160, 0, 0))
    k = 0
    for u, h0, h1, name, col in [(-43.5, 0, 22.5, 'utse stair', (0, 0, 0)), (-11.2, 5.2, 11.6, 'front stairs', (0, 120, 0)), (20.9, 5.8, 18.4, 'hall stair', (160, 0, 120)),
                                 (28.5, 5.2, 11.6, 'back stair', (0, 0, 160)), (137, 0, 20, 'tower stair', (120, 80, 0))]:
        dr.line([(X(u), Y(h0)), (X(u), Y(h1))], fill=col, width=5)
        dr.line([(X(-80) + k * 150, Y(-6) + 6), (X(-80) + k * 150 + 26, Y(-6) + 6)], fill=col, width=5); dr.text((X(-80) + k * 150 + 32, Y(-6) - 4), name, font=fs, fill=col); k += 1
    dr.line([(X(-170), Y(0)), (X(150), Y(0))], fill=(80, 80, 80), width=1)
    for hh in range(0, 30, 5):
        dr.line([(X(146), Y(hh)), (X(148), Y(hh))], fill=(0, 0, 0), width=2); dr.text((X(148) + 4, Y(hh) - 10), '%d m' % hh, font=fs, fill=(90, 90, 90))
    dr.line([(X(146), Y(0)), (X(146), Y(25))], fill=(0, 0, 0), width=2)
    dr.line([(X(-160), Y(-6)), (X(-110), Y(-6))], fill=(0, 0, 0), width=3); dr.text((X(-160), Y(-6) + 4), '50 m', font=fs, fill=(0, 0, 0))
    return img

def main():
    B.KEYMAP.update(keymap()); B.EXTRA_PROGRAMS.update(LS.programs()); B.EXTRA_PROGRAMS.update(programs())
    B.OPEN_KINDS.update(OPEN)
    for k in OPEN: B.KIND_FILL.setdefault(k, (214, 236, 250))
    B.KIND_FILL.update({'field': (226, 238, 200), 'maydan': (236, 228, 200), 'horse_park': (226, 238, 200), 'roof': (236, 236, 236), 'bank': (200, 186, 160), 'midden': (200, 186, 160), 'hay': (236, 228, 190), 'towers': (205, 205, 200), 'garderobe': (205, 205, 200)})
    B.NEW.clear(); B.NEW.update(NEW); B.CITY.clear()
    intro = ('Generated by `tempest_blueprint.py` (on `settlements/voth/palace/blueprint.py`, with Longsong\'s Xanadu key map and room programmes) from the same room data as the sheets. Keys are catalog pieces (`kits/catalog`): `xanadu_court_*`, `xanadu_common_*` (with the Arms file\'s `xanadu_common_weapon_rack` and `xanadu_common_armour_stand`), `xanadu_training_*`, `xanadu_trade_*` (the horse stall, trough, fodder rack, forge) and `xanadu_works_*` (sickbed, herb bench, churn, weigh scale). **NEW** marks a piece the catalog lacks; they are listed at the end. Open grounds (the muster court, lists, drill court, the range, the Maydan, the fields, the cloister court, the Field of the Fallen, roofs) are not dressed; nothing is counted at a quarter except the crest sheet\'s zones.\n')
    B.main(floors=FLOORS, out=OUT, here=HERE, title='# The House of the Tempest: furniture manifest\n', intro=intro, section=draw_section, zone_R=510)

if __name__ == '__main__':
    main()
