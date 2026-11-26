#!/usr/bin/env python3
"""Theodiga today: the shrine of the Decree in the Ancients' dam arcology, and its pilgrims' town. Floorplan sheets, a
section, an elevation and the furniture manifest, on the shared generator settlements/voth/palace/blueprint.py.

The owner's brief and answers (2026-11-15) are in BLUEPRINT.md. In short: only the Dome and the three levels just under
it are lived in, and only partly (the crest, the gallery inside the dam under it, the heads of the upper fins: 370-420 m);
the Dome is the shrine; priests, monks and scholars live in the arcology (about 900), the History Monks keep a delegation;
everything lower is ruined and sealed; the town (scrap Xanadu, about 4,100) stands on the east rim.

Geometry is the drawn dam's (kits/ancients/targets/theodiga/77-dam.js, buildDam, the RUINED state, and the Dome on the Water,
kits/ancients/targets/theodiga/77a-77b), in the dam group's frame: x across the span (+x east: the Notch is west),
z along the stream (-z upstream, the lake), y up. Each sheet says its own frame:
  T0 site      plan: u = x, v = -z (upstream up)
  T1 dome      plan about the dome's centre: u = x, v = -(z + 205)
  T2, T3       the dam UNROLLED: u = arc length along the crest's line from the centre (east +), v = metres downstream of the
               upstream face, negative (so the lake side is up). Approximate: z offsets, not normals.
Heights are the drawn ones: crest 400 m, crest blocks to 418, the dome's deck 420, its drum to 436, crown 553.

    python3 theodiga_blueprint.py        # writes floors/*.png and FURNITURE.md next to this file
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'voth', 'palace'))
sys.path.insert(0, os.path.join(HERE, '..', 'longsong'))
import blueprint as B
from blueprint import R, C
import longsong_blueprint as LS
from PIL import Image, ImageDraw

OUT = os.path.join(HERE, 'floors')

# ------------------------------------------------------------------------------------------------ the dam's geometry
H, SPAN, BOW = 400.0, 640.0, 140.0
def zc(x): return -BOW * (1 - (x / (SPAN / 2)) ** 2)          # the arc in plan; the upstream face is zc - 2
def th(y): return 50 + 110 * (1 - y / H)                         # thickness: the downstream face is zc + th(y)
def s_of(x):                                                     # arc length from the centre along zc
    n = 200; acc = 0.0; sg = 1 if x >= 0 else -1; X = abs(x)
    for i in range(n):
        t = (i + .5) / n * X; acc += math.sqrt(1 + (2 * BOW * t / (SPAN / 2) ** 2) ** 2) * X / n
    return sg * acc
def vU(x, z): return (zc(x) - 2) - z                              # unrolled v: 0 at the upstream face, down is downstream
DOME_Z, DOME_R, DECK_R = -205.0, 120.0, 124.0
LAKE_Y = 272.0      # the lake held at the Notch's sill: the river still passes, as a cascade through the Notch (the owner, 2026-11-15)
TEAR_A0, TEAR_W, TEAR_R = math.degrees(math.atan2(0.7316, -0.6816)), math.degrees(0.5), 62.0   # in (u, v) of T1: 133 deg
NOTCH_TOP = (-281.0, -161.0)                                     # the Notch at the crest (x); 128 m deep, floor 272 m
FIN_X = [k * 46 for k in range(-3, 4)]                           # the upper fins (244-410 m); +92 broke in the ruin
FIN_W, FIN_Z = 30.0, (-73.9, -29.9)                              # buildDam places every fin at zc(0)'s face: z -74 to -30

# ------------------------------------------------------------------------------------------------ T0 the site
def band(x0, x1, za, zb, n=24, frame='plan'):
    """a strip along the dam between z = zc + za and zc + zb, as a polygon"""
    xs = [x0 + (x1 - x0) * i / n for i in range(n + 1)]
    if frame == 'plan':
        return [(x, -(zc(x) + za)) for x in xs] + [(x, -(zc(x) + zb)) for x in reversed(xs)]
    return [(s_of(x), vU(x, zc(x) + za)) for x in xs] + [(s_of(x), vU(x, zc(x) + zb)) for x in reversed(xs)]
def circle(cu, cv, r, a0=0, a1=360, n=48):
    return [(cu + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cv + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]

ROCK = (205, 190, 165); LAKE = (178, 208, 230); SILT = (214, 220, 180); FLOOR = (226, 214, 190); YARD = (200, 190, 175)
GOLD = (190, 130, 20); SAFFRON = (230, 140, 20); MAROON = (130, 30, 40); ORDER = (40, 70, 160); SULTAN = (150, 30, 120)

T0 = dict(id='T0', tier=0, R=1000, rect=(-820, 1240, -640, 760), poly=[(-820, -640), (1240, -640), (1240, 760), (-820, 760)],
  title='Sheet T0: Theodiga today, the site: the dam, the Dome, the town on the east rim, the fields and the yards',
  sub='Plan, u = x (east right), v = -z (upstream up). The rim and the plateau stand at 440 m, the crest at 400, the Dome\'s floor at 420, '
      'the lake at 272 (held at the Notch\'s sill, silt flats round it), the river pouring through the Notch as a 272 m cascade to the canyon floor at 0. The canyon runs out of the drawn page at v -600 and +700. '
      'The town (scrap Xanadu, about 4,100) is laid out by core/city later: these are its quarters, not its lots.',
  axisnote='u = x, east ->;  v = -z, upstream (the lake) up;  metres',
  fills=[
    ([(-820, -640), (-330, -640), (-330, 760), (-820, 760)], ROCK, 'west rim and plateau (440 m)'),
    ([(330, -640), (1240, -640), (1240, 760), (330, 760)], (232, 222, 196), ''),
    ([(-320, 700), (320, 700)] + [(x, -(zc(x) - 2)) for x in [320 - 640 * i / 32 for i in range(33)]], SILT, 'the lake bed: silt flats, terraced into fields (272-300 m)'),
    ([(-250, 640), (250, 640)] + [(x, -(zc(x) - 2) + 4) for x in [250 - 500 * i / 20 for i in range(21)]], LAKE, 'the lake (272 m), held at the Notch\'s sill'),
    ([(-310, -600), (310, -600)] + [(x, -(zc(x) + 160)) for x in [310 - 620 * i / 20 for i in range(21)]], FLOOR, 'the canyon floor (0 m): the salvage yards'),
    (band(-320, 320, -2, 50), (236, 236, 230), ''),
    (band(-146, 320, -2, 50), (238, 214, 150), 'the crest (T2); the gallery and fin heads under it (T3)'),
    (band(-320, 320, 50, 160), (215, 215, 208), ''),
    (band(NOTCH_TOP[0], NOTCH_TOP[1], -2, 160, 8), (120, 120, 120), 'the Notch'),
  ],
  rooms=[
    C(1, 'The Dome: the shrine of the Decree and of the ancestors (Sheet T1)', 'court', 0, -DOME_Z, DECK_R, 4, 'the deck at 420 m on its piers; torn on the west, upstream side (the Tear), kept open as a relic'),
    R(3, 'Gate Square: the head of the Stair of Descent', 'court', 340, 440, -10, 70, 2, 'pilgrims leave the town here; the Stair of Descent goes down 40 m in the east abutment to the crest\'s Pilgrims\' Gate'),
    R(4, 'Warden\'s House and the Sultanate\'s guard', 'guard', 340, 440, -90, -10, 2, 'the Sultan\'s warden holds one of the two keys of the Gatehouse of the Deep; 40 soldiers'),
    R(5, 'Bazaar Street', 'market', 440, 760, 10, 60, 2, 'from the east gate to Gate Square: offerings, wheels, honey and milk, food, guides'),
    R(6, 'Pilgrims\' Hostels', 'hostel', 440, 700, 60, 200, 2, 'dormitories by the night; at the festival of the Station\'s pass the town doubles'),
    R(7, 'The Terminus Serai', 'caravanserai', 760, 860, -40, 90, 2, 'where Xanadu\'s short Ancient line ends (from Strongbow): caravans, stables, the customs clerk'),
    R(8, 'East Gate', 'entrance', 860, 890, 0, 40, 2, 'the girder gate on the Ancient line'),
    R(9, 'Wheel-makers and the Sound-Grid Printers', 'workshop', 440, 600, -150, 10, 2, 'prayer wheels, drums printed with the Song in the sound-grid syllabary'),
    R(10, 'The Dairies and the Hives', 'workshop', 600, 760, -150, 10, 2, 'honey and milk, the sacraments: the temple estates\' herds graze the plateau'),
    R(11, 'Houses (panel houses and rows)', 'lodging', 600, 860, -330, -150, 1, 'the town\'s middle ring'),
    R(12, 'The Salvagers\' Quarter', 'workshop', 340, 600, -330, -150, 1, 'the guild that may take only what the Dome has let fall; the head of the Salvage Road down to the canyon floor'),
    R(13, 'The Farmers\' Quarter', 'lodging', 440, 760, 200, 330, 1, 'the head of the Silt Road down to the fields on the lake bed'),
    R(14, 'Granary and stores', 'store', 760, 860, 200, 300, 1),
    R(15, 'The Bath', 'bath', 760, 860, 100, 190, 2),
    R(16, 'The poor tier (tank houses, hull houses)', 'lodging', 860, 1000, -330, 200, 0, 'the outer ring, toward the upland fields'),
    R(17, 'Upland fields and pasture', 'garden', 1000, 1230, -620, 740, 0, 'the temple estates\' barley, beans and the herds'),
    R(18, 'The Order\'s Gate (the History Monks)', 'guard', -420, -340, 30, 70, 2, 'on the west rim: the delegation\'s own door and road; the Order\'s Bridge spans the Notch to their fin'),
    R(19, 'Salvage yards (what fell)', 'workshop', -300, 300, -470, -330, 0, 'the fallen fin, the Notch\'s spill, the Dome\'s fallen sector on the lake bed: cut and sorted, then hauled up the Salvage Road'),
  ],
  lines=[
    ([(x, -(zc(x) + 30)) for x in [320 - 466 * i / 30 for i in range(31)]], SAFFRON, 5, 'the middle kora (the crest)'),
    (circle(0, -DOME_Z, 116), SAFFRON, 4),
    ([(330, 120), (330, 760), (1010, 760), (1010, -640), (330, -640), (330, 120)], SAFFRON, 3, 'the outer kora (round the town)'),
    ([(340, 40), (320, 30), (330, 15), (318, 6)], (60, 60, 60), 5, 'Stair of Descent (440 -> 400 m)'),
    ([(470, 330), (400, 420), (330, 440), (300, 520)], (90, 120, 40), 5, 'the Silt Road (down 170 m)'),
    ([(-221, -(zc(-221) - 2)), (-221, -(zc(-221) + 160)), (-200, -300), (-150, -480), (-120, -640)], (40, 110, 200), 9, 'the river: through the Notch, the cascade, then down the canyon'),
    ([(420, -330), (380, -420), (330, -470), (300, -470)], (110, 90, 60), 5, 'the Salvage Road (down 440 m)'),
    ([(890, 20), (1240, 40)], (60, 60, 60), 7, 'Xanadu\'s Ancient line (to Strongbow)'),
    ([(-138, 45), (-250, 50), (-340, 50)], ORDER, 6, 'the Order\'s Bridge over the Notch and its cascade'),
  ])

# ------------------------------------------------------------------------------------------------ T1 the Dome (420 m)
def tear_poly():
    a0, a1 = TEAR_A0 - TEAR_W, TEAR_A0 + TEAR_W
    return list(reversed(circle(0, 0, DECK_R - 4, a0, a1, 16))) + circle(0, 0, TEAR_R, a0, a1, 16)   # the label sits at the first point
T1 = dict(id='T1', tier=1, R=DECK_R, circle=True,
  title='Sheet T1: the Dome, 420 m: the shrine of the Decree and of the ancestors',
  sub='The deck under the great dome (240 m across, its crown at 553 m, the oculus open), on its piers over the lake. The Tear (upstream and west) is '
      'kept open as a relic: the Fall is doctrine, so the faithful never roof it, and the holiest place in Theodiga faces it. The rest of the frame is re-glazed '
      'with salvaged panes on bronze. The crest\'s blocks run under the deck\'s downstream chord: the pilgrims come up from the middle kora by two stairs; the '
      'clergy by their own from the undercroft. Frame: u = x, v = -(z + 205): the dome\'s centre at 0,0, upstream up.',
  axisnote='u = x (east ->), v = -(z + 205): the dome\'s centre at 0, 0; upstream up; the crest along the bottom',
  fills=[(tear_poly(), (205, 225, 240), 'THE TEAR (open to the sky)')],
  rooms=[
    C(1, 'The Hall of the Song (the old fluted dome)', 'sanctum', 0, 0, 44, 4, 'under the oculus: the Song is sung whole here at each of the Station\'s passes; the master wheel and the Khan\'s empty seat'),
    C(2, 'The Great Wheel', 'wheel_house', 0, -75, 14, 4, 'a great prayer wheel turned by the dam\'s water, brought up through the crest by the rising main: it has not stopped since it was hung'),
    C(3, 'The Threshold of the Fall', 'altar', -36.8, 39.5, 6, 4, 'the last whole floor before the Tear: the kora pauses here; offerings are thrown to the lake'),
    R(4, 'The Ancestors\' Relic Hall', 'ancestors_hall', 62, 104, -25, 30, 3, 'the Theodigans\' relics in glass: the dead the Xanadui descend from, named in the sound-grid script'),
    C(5, 'The Damsel\'s Shrine', 'damsel_shrine', 66, 66, 10, 4, 'the dulcimer under a canopy; the prophet\'s day is sung here'),
    R(6, 'Offering Hall of Honey and Milk', 'offering_hall', -104, -62, -40, 5, 3, 'the sacraments given and received: the honey-dew and the milk of Paradise'),
    R(7, 'Lamp Hall', 'lamp_hall', 10, 50, 52, 82, 3, 'butter lamps by the thousand, lit at the Station\'s pass'),
    R(8, 'Pilgrims\' Stair, east (up from the crest)', 'stair', 52, 64, -102, -90, 2),
    R(9, 'Pilgrims\' Stair, west (up from the crest)', 'stair', -64, -52, -102, -90, 2),
    R(10, 'Clergy Stair (from the undercroft)', 'stair', -30, -18, -86, -74, 1),
    R(11, 'Vestry (the singers\' robes)', 'wardrobe', -58, -34, -96, -72, 2),
    R(12, 'Treasury of the Dome', 'treasury', 14, 44, -100, -74, 2, 'the gold of the offerings, under the custodian\'s seal'),
    R(13, 'Choir of the Singers', 'music', 46, 90, -70, -40, 3, 'the Song is never silent: three choirs keep the hours'),
  ],
  lines=[(circle(0, 0, 116), SAFFRON, 5, 'the inner kora: the drum\'s arcade, 730 m round, walked three times, eyes lowered'),
         ([(-58, -96), (-30, -60), (-20, -46)], SAFFRON, 3), ([(58, -96), (30, -60), (20, -46)], SAFFRON, 3)])

# ------------------------------------------------------------------------------------------------ T2 the crest (400-418 m)
# buildDam's crest: for k = -13..13 at x = 22k, block A (15 x 28, z zc-6 .. zc+22, to 418 m) and block B (18 x 22,
# z zc+39 .. zc+61, to 416 m); the promenade between (zc+22 .. zc+39). The ruin drops k = -13..-7 (the Notch). Four storeys.
CREST = {
  13: (('Pilgrims\' Gate (the foot of the Stair of Descent)', 'entrance', 2, 'the crest\'s one door to the town; the middle kora starts here'),
       ('Warden\'s Post', 'guard', 1, 'the Sultanate\'s guard on the crest: the warden\'s deputy and twelve men')),
  12: (('Gatehouse of the Deep', 'gatehouse_deep', 1, 'the one stair down to the sealed levels, behind two locks: the warden\'s key and the custodian\'s'),
       ('Register of Descents', 'office', 2, 'every descent written down by the custodian\'s clerk and by a History Monk')),
  11: (('Guest House', 'guest_bed', 3, 'visiting abbots of Qiblai, envoys, the Sultan\'s officers'), ('Guest House (hall)', 'guest_hall', 3)),
  10: (('Almonry', 'office', 1, 'the pilgrims\' doctor and the alms'), ('Infirmary', 'infirmary', 1)),
  9: (('Empty (kept clean)', 'empty', 0, 'more crest than the clergy need'), ('Stores', 'store', 0)),
  8: (('Monks\' cells', 'cells', 1), ('Novices\' School (the outer chapel above)', 'school', 1, 'under the small dome at x 170: the Novices\' Chapel')),
  7: (('Monks\' cells', 'cells', 1), ('Scriptorium of the Song', 'scriptorium', 2, 'the Song copied onto wheel drums in the sound-grid script: a false syllable is a false note')),
  6: (('Monks\' cells', 'cells', 1), ('Chapterhouse (under the small dome)', 'assembly', 3, 'the monks\' chapter; the small dome at x 130')),
  5: (('Monks\' cells', 'cells', 1), ('Wheel-makers\' workshop', 'workshop', 1)),
  4: (('Lay Refectory', 'servants_hall', 1, 'the servants and the guard'), ('Chapel of the Khan (under the small dome)', 'chapel', 3, 'the small dome at x 90: the Khan who decreed the dome')),
  3: (('Sacristy (under the deck)', 'wardrobe', 2), ('Kitchen', 'kitchen', 1)),
  2: (('Singers\' House (under the deck)', 'cells', 2), ('Brothers\' Refectory', 'servants_hall', 2)),
  1: (('Singers\' House (under the deck)', 'cells', 2), ('Bakehouse', 'bakehouse', 1)),
  0: (('The Rising Main (under the Great Wheel)', 'rising_main', 1, 'the dam\'s water lifted to the Wheel; its keepers\' room'), ('Dairy and Hives Store', 'larder', 1, 'honey and milk for the Offering Hall: cool, under the deck')),
  -1: (('Priests\' House (the Clergy Stair)', 'lodging', 2, 'the stair up to the Dome rises here'), ('Treasury of Offerings (strongroom)', 'treasury', 1)),
  -2: (('Priests\' House', 'lodging', 2), ('Archive of Offerings', 'archive', 1, 'the ledgers: every gift since the conversion')),
  -3: (('Priests\' House', 'lodging', 2), ('Lamp Store and Chandlery', 'store', 1)),
  -4: (('The Keeper of the Dome\'s House (the abbot)', 'chamber', 3, 'the Keeper heads the clergy and holds the custodian\'s key'), ('Chapel of the Ancestors (under the small dome)', 'chapel', 3, 'the small dome at x -90')),
  -5: (('College of the Grammarians: lecture', 'lecture', 2), ('Library of the Song: reading room', 'reading_room', 2)),
  -6: (('College of the Grammarians: cells', 'cells', 1, 'the last whole block before the Notch: propped'), ('Chapel of the Sound-Grid (under the small dome)', 'chapel', 3, 'the small dome at x -130; the outer west chapel (x -170) fell into the Notch')),
}
def crest_rooms():
    rooms = []; n = 1
    for k in range(13, -7, -1):
        x = 22 * k; s = s_of(x); za, zb = CREST[k]
        for (lo, hi, half), spec in ((( -6, 22, 7.5), za), ((39, 61, 9.0), zb)):
            name, kind, decor = spec[0], spec[1], spec[2]; note = spec[3] if len(spec) > 3 else ''
            v0, v1 = vU(x, zc(x) + hi), vU(x, zc(x) + lo)
            rooms.append(R(n, name, kind, s - half, s + half, v0, v1, decor, ('block %+d%s. ' % (k, 'A' if lo < 0 else 'B')) + note)); n += 1
    rooms.append(R(n, 'Order\'s Bridge (head)', 'passage', s_of(-150) - 6, s_of(-150) + 6, -40, -24, 1, 'the History Monks\' bridge from their fin over the Notch to the west rim')); n += 1
    return rooms
def deck_under_crest():
    pts = []
    xs = [-98 + 196 * i / 28 for i in range(29)]
    for x in xs: pts.append((s_of(x), vU(x, zc(x) - 6)))
    for x in reversed(xs):
        zd = DOME_Z + math.sqrt(max(0.0, DECK_R ** 2 - x * x)); pts.append((s_of(x), max(vU(x, zd), vU(x, zc(x) + 61)) if zd > zc(x) - 6 else vU(x, zc(x) - 6)))
    return pts
T2 = dict(id='T2', tier=2, R=330, rect=(s_of(-300), s_of(320) + 4, -95, 25), poly=band(-320, 320, -2, 50, 40, 'unrolled'),
  title='Sheet T2: the crest, 400-418 m: the clergy\'s houses and the middle kora',
  sub='The crest\'s blocks (four storeys each; numbers are block pairs k = 13 east to -6 west at x = 22k) with the promenade between them, the middle kora, '
      'from the Pilgrims\' Gate at the east abutment to the Notch. Under the Dome\'s deck (shaded) the blocks are the undercroft. Block A on the lake side '
      '(up), block B on the face side (down), the six small domes on B blocks. Unrolled: u along the crest from its centre, v downstream of the upstream face.',
  axisnote='u = metres along the crest (east ->); v = metres downstream of the upstream face (down); unrolled, approximate',
  fills=[(deck_under_crest(), (238, 228, 196), 'under the Dome\'s deck'),
         (band(NOTCH_TOP[0], NOTCH_TOP[1], -2, 50, 8, 'unrolled'), (150, 150, 150), 'THE NOTCH: fallen, 128 m deep (blocks -13 to -7 gone)')],
  rooms=crest_rooms(),
  lines=[([(s_of(x), vU(x, zc(x) + 30)) for x in [320 - 466 * i / 40 for i in range(41)]], SAFFRON, 5, 'the middle kora (the promenade)')])

# ------------------------------------------------------------------------------------------------ T3 the gallery and the fin heads (370-410 m)
Y3 = 390.0
def seg(n, name, kind, x0, x1, za, zb, decor, note=''):
    """a room inside the dam between x0 and x1, z = zc + za .. zc + zb, drawn as its unrolled box (the band's common part)"""
    v0 = max(vU(x0, zc(x0) + zb), vU(x1, zc(x1) + zb)); v1 = min(vU(x0, zc(x0) + za), vU(x1, zc(x1) + za))
    return R(n, name, kind, s_of(x0), s_of(x1), min(v0, v1), max(v0, v1), decor, note)
TF = th(Y3)
FIN_USE = {
  -138: ('The History Monks\' Fin: the delegation of the Order', 'cells', 2, 'about 25 monks: their hall, cells and archive in the top storeys; their own stair, and the Order\'s Bridge over the Notch to their gate on the west rim. They keep the second register of descents'),
  -92: ('The Scholars\' Fin', 'cells', 2, 'about 120: grammarians, archivists, the Song\'s readers'),
  -46: ('The Novices\' Fin', 'dormitory', 1, 'the novices and their masters'),
  0: ('The Priests\' Fin', 'lodging', 2, 'about 200 priests and the singers\' masters'),
  46: ('The Monks\' Fin', 'dormitory', 1, 'about 350 monks with the novices\' fin'),
  92: ('The Broken Fin (fallen)', 'void', 0, 'its head fell at the Cataclysm (to 319 m); what is left is sealed with the levels below'),
  138: ('The Servants\' Fin', 'dormitory', 1, 'about 150 lay servants and the dome\'s keepers; nearest the Pilgrims\' Gate'),
}
def gallery_rooms():
    rooms = []; n = 1
    for x0, x1, name, kind, d, note in [
        (250, 318, 'The Deep Stair and its second lock', 'gatehouse_deep', 0, 'the Gatehouse of the Deep\'s stair continues down; the lock on this level is the Sultanate\'s'),
        (170, 250, 'Scholars\' cells (lake side)', 'cells', 1, ''),
        (95, 170, 'Library of the Song: the stacks', 'archive_stacks', 1, 'the Ancients\' learning-centre is far below and sealed: this is the faith\'s own'),
        (-95, 95, 'Undercroft of the Wheel: the penstock gallery and its gearing', 'rising_main', 1, 'the dam\'s water rises here to turn the Great Wheel'),
        (-160, -95, 'Archive of the Decree: the master drums', 'archive', 2, 'the sound-grid masters every wheel is printed from'),
    ]:
        rooms.append(seg(n, name, kind, x0, x1, -2, 22, d, note)); n += 1
    for x0, x1, name, kind, d, note in [
        (250, 318, 'East Cistern', 'cistern', 0, ''),
        (170, 250, 'Stores', 'store', 0, ''),
        (95, 170, 'Library of the Song: the copyists', 'scriptorium', 1, ''),
        (-95, 95, 'Honey and Milk Cellars', 'larder', 1, 'cold behind the dam\'s mass'),
        (-160, -95, 'Copyists\' hall', 'scriptorium', 1, ''),
    ]:
        rooms.append(seg(n, name, kind, x0, x1, 28, TF - 2, d, note)); n += 1
    rooms.append(seg(n, 'The Long Gallery (the arcology\'s spine at this level)', 'passage', -160, 318, 22, 28, 1, 'from the Deep Stair to the Notch\'s edge')); n += 1
    for x in FIN_X:
        name, kind, d, note = FIN_USE[x]; s = s_of(x)
        v0, v1 = vU(x, FIN_Z[1]), vU(x, FIN_Z[0])
        rooms.append(R(n, name, kind, s - FIN_W / 2, s + FIN_W / 2, v0, v1, d, 'fin at x %+d, 370-410 m: eleven storeys. ' % x + note)); n += 1
        face = vU(x, zc(x) + TF)
        if v1 < face - 1 and x != 92:
            rooms.append(R(n, 'bridge', 'passage', s - 3, s + 3, v1, face, 1)); n += 1
    return rooms
T3 = dict(id='T3', tier=3, R=330, rect=(s_of(-300), s_of(320) + 4, -120, 10), poly=band(-320, 320, -2, TF, 40, 'unrolled'),
  title='Sheet T3: the gallery inside the dam and the fin heads, 370-410 m',
  sub='The second and third inhabited levels. Inside the dam under the crest (382-400 m, four storeys): the Long Gallery with the library, the archive of the Decree, '
      'the Wheel\'s undercroft and the Deep Stair. Off the downstream face, across short bridges: the heads of the six standing upper fins, eleven storeys each '
      '(the seventh, +92, broke). buildDam stands every fin at the centre\'s face, so the outer fins cut into the dam at the ends. Below 370 m everything is sealed. '
      'Unrolled frame as T2.',
  axisnote='u = metres along the crest (east ->); v = metres downstream of the upstream face (down); unrolled, approximate',
  fills=[(band(-278, -164, -2, TF, 8, 'unrolled'), (150, 150, 150), 'THE NOTCH'),
         (band(-320, -278, -2, TF, 6, 'unrolled'), (190, 190, 190), 'cut off')],
  rooms=gallery_rooms())

for _F in (T0, T1):
    for _i, _r in enumerate(_F['rooms']): _r['n'] = _i + 1

def halve(F, x0, x1, suffix, which):
    """the unrolled strip is 660 m long on a square page: draw it as two sheets, east and west, each clipped to its half"""
    U0, U1 = s_of(x0), s_of(x1)
    def cl(pts): return [(min(U1, max(U0, u)), v) for u, v in pts]
    G = dict(F); G['id'] = F['id'] + suffix
    G['title'] = F['title'] + ' (' + which + ' half)'
    q = F['rect']; G['rect'] = (U0 - 4, U1 + 4, q[2], q[3])
    G['poly'] = cl(F['poly'])
    G['fills'] = [(cl(f[0]),) + tuple(f[1:]) for f in F.get('fills', []) if max(p[0] for p in f[0]) > U0 and min(p[0] for p in f[0]) < U1]
    G['lines'] = [(cl(l[0]),) + tuple(l[1:]) for l in F.get('lines', [])]
    rooms = []
    for r in F['rooms']:
        if r['u1'] <= U0 or r['u0'] >= U1: continue
        r2 = dict(r); cut = r['u0'] < U0 or r['u1'] > U1
        r2['u0'], r2['u1'] = max(U0, r['u0']), min(U1, r['u1'])
        if cut: r2['note'] = (r['note'] + ' ' if r['note'] else '') + '(continues on the other half)'
        rooms.append(r2)
    for i, r in enumerate(rooms): r['n'] = i + 1
    G['rooms'] = rooms
    return G

FLOORS = [T0, T1, halve(T2, -11, 322, 'e', 'east'), halve(T2, -322, -11, 'w', 'west'),
          halve(T3, -11, 322, 'e', 'east'), halve(T3, -322, -11, 'w', 'west')]

# ------------------------------------------------------------------------------------------------ the section and the elevation
def draw_section():
    """across the stream through the dam's centre (x = 0): the lake, the piers, the Dome, the crest, the face and its fins, the works"""
    f_t = B.font(40, True); f = B.font(20); fb = B.font(20, True); fs = B.font(17)
    W, Hh = 2400, 1300; img = Image.new('RGB', (W, Hh), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Section along the stream through the centre (x = 0): who lives where (heights x1)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), 'Upstream (the lake) left, downstream right. Gold: lived in (the Dome and 370-420 m). Grey: sealed and ruined. Red: the lowest works, where treasures remain; entry only by the Gatehouse of the Deep.', font=f, fill=(70, 70, 70))
    sx = 1.55; sy = 1.75; ox = 1250; base = Hh - 90
    def X(z): return ox + z * sx
    def Y(h): return base - h * sy
    dr.rectangle([0, Y(0), W, Hh], fill=FLOOR)
    dr.rectangle([X(-700), Y(LAKE_Y), X(-142), Y(0)], fill=LAKE)
    dr.polygon([(X(-700), Y(244)), (X(-142), Y(262)), (X(-142), Y(0)), (X(-700), Y(0))], fill=(196, 196, 170)); dr.text((X(-560), Y(200)), 'silt', font=fs, fill=(80, 80, 60))
    dr.text((X(-690), Y(LAKE_Y) - 26), 'the lake at 272 m, held at the Notch\'s sill: the river leaves through the Notch (west, not in this plane)', font=fs, fill=(30, 60, 100))
    body = [(X(-142), Y(0)), (X(-142), Y(400))] + [(X(zc(0) + th(h)), Y(h)) for h in range(400, -1, -20)]
    dr.polygon(body, fill=(205, 205, 200), outline=(40, 40, 40))
    def bandz(h0, h1, col, label=None, z0=-142):
        pts = [(X(z0), Y(h0)), (X(z0), Y(h1))] + [(X(zc(0) + th(h)), Y(h)) for h in range(int(h1), int(h0) - 1, -5)]
        dr.polygon(pts, fill=col, outline=(40, 40, 40))
        if label: dr.text((X(z0) + 6, Y(h1) + 4), label, font=fs, fill=(0, 0, 0))
    bandz(28, 370, (200, 200, 196), None)
    for h in range(40, 370, 30): dr.line([(X(-142), Y(h)), (X(zc(0) + th(h)), Y(h))], fill=(180, 180, 176), width=1)
    bandz(0, 28, (214, 150, 140), 'the works (0-28 m): turbine halls, outlets, stores: sealed; treasures', -142)
    bandz(370, 400, (238, 214, 150), 'gallery 382-400 (T3)')
    dr.rectangle([X(-146), Y(418), X(-118), Y(400)], fill=(238, 214, 150), outline=(40, 40, 40))
    dr.rectangle([X(-101), Y(416), X(-79), Y(400)], fill=(238, 214, 150), outline=(40, 40, 40))
    dr.text((X(FIN_Z[1]) + 6, Y(418) - 26), 'crest 400-418 (T2), under the deck\'s edge', font=fs, fill=(0, 0, 0))
    dr.rectangle([X(FIN_Z[0]), Y(410), X(FIN_Z[1]), Y(370)], fill=(238, 214, 150), outline=(40, 40, 40))
    dr.rectangle([X(FIN_Z[0]), Y(370), X(FIN_Z[1]), Y(244)], fill=(200, 200, 196), outline=(40, 40, 40))
    dr.text((X(FIN_Z[1]) + 6, Y(400)), 'fin head 370-410 (T3): the Priests\' Fin', font=fs, fill=(0, 0, 0))
    dr.text((X(FIN_Z[1]) + 6, Y(320)), 'the fin below: sealed', font=fs, fill=(90, 90, 90))
    dr.rectangle([X(-96), Y(241), X(-52), Y(215)], fill=(200, 200, 196), outline=(40, 40, 40)); dr.text((X(-40), Y(232)), 'the learning-centre beam (228 m): sealed', font=fs, fill=(90, 90, 90))
    for z in (8, 56): dr.rectangle([X(z - 24), Y(28), X(z + 24), Y(0)], outline=(120, 40, 30), width=2)
    dr.rectangle([X(-329), Y(420), X(-81), Y(416.5)], fill=(238, 214, 150), outline=(40, 40, 40))
    for z in (-319, -267, -205, -143): dr.rectangle([X(z) - 4, Y(416), X(z) + 4, Y(0)], fill=(205, 205, 200), outline=(80, 80, 80))
    dr.rectangle([X(-325), Y(436), X(-85), Y(420)], fill=(240, 236, 220), outline=(40, 40, 40))
    dr.pieslice([X(-325), Y(436 + 117), X(-85), Y(436 - 117)], 180, 360, fill=(220, 236, 244), outline=(40, 40, 40), width=2)
    dr.rectangle([X(-221), Y(559), X(-189), Y(553)], fill=(240, 236, 220), outline=(40, 40, 40)); dr.text((X(-186), Y(562)), 'the oculus, open (553 m)', font=fs, fill=(0, 0, 0))
    dr.pieslice([X(-249), Y(420 + 26), X(-161), Y(420 - 26)], 180, 360, fill=(238, 214, 150), outline=(40, 40, 40), width=2)
    dr.text((X(-260), Y(446) - 24), 'the Hall of the Song', font=fs, fill=(0, 0, 0))
    dr.text((X(-325), Y(436 + 60)), 'THE DOME (T1): the shrine', font=fb, fill=GOLD)
    dr.text((X(-560), Y(330)), 'the piers stand 145 m bare over the water', font=fs, fill=(60, 60, 60))
    dr.line([(X(-132), Y(400)), (X(-132), Y(436))], fill=SAFFRON, width=5); dr.text((X(-132) + 6, Y(436) - 4), 'Pilgrims\' Stairs', font=fs, fill=SAFFRON)
    dr.line([(X(-130), Y(400)), (X(-130), Y(0))], fill=(150, 0, 0), width=3); dr.text((X(-128), Y(140)), 'the Deep Stair (east end, not in this plane)', font=fs, fill=(150, 0, 0))
    dr.text((X(120), Y(30)), 'the canyon floor: salvage yards', font=fs, fill=(90, 70, 40))
    return img

def draw_elevation():
    """the downstream face, looking upstream, with the canyon's rims: the town, the Stair of Descent, the Order's Bridge"""
    f_t = B.font(40, True); f = B.font(20); fb = B.font(20, True); fs = B.font(17)
    W, Hh = 2600, 1200; img = Image.new('RGB', (W, Hh), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Elevation of the downstream face, looking upstream: the Dome, the crest, the fins, the Notch and the rims (heights x1)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), 'West left, east right (the town). Gold: lived in. Grey: sealed and ruined. The Order\'s Bridge spans the Notch from the History Monks\' fin to their gate on the west rim.', font=f, fill=(70, 70, 70))
    sx = 1.25; sy = 1.6; ox = 1000; base = Hh - 80
    def X(x): return ox + x * sx
    def Y(h): return base - h * sy
    dr.rectangle([X(-800), Y(440), X(-320), Y(0)], fill=ROCK); dr.rectangle([X(320), Y(440), X(1240), Y(0)], fill=ROCK)
    dr.text((X(-790), Y(440) - 24), 'west rim (440 m)', font=fs, fill=(0, 0, 0)); dr.text((X(900), Y(440) + 8), 'east rim and plateau (440 m)', font=fs, fill=(0, 0, 0))
    dr.rectangle([X(-320), Y(400), X(320), Y(0)], fill=(205, 205, 200), outline=(40, 40, 40))
    for h in range(40, 370, 30): dr.line([(X(-320), Y(h)), (X(320), Y(h))], fill=(186, 186, 182), width=1)
    dr.rectangle([X(-320), Y(28), X(320), Y(0)], fill=(214, 150, 140), outline=(40, 40, 40)); dr.text((X(-300), Y(28) + 4), 'the works: sealed; treasures', font=fs, fill=(0, 0, 0))
    dr.rectangle([X(-320), Y(400), X(320), Y(370)], fill=(238, 214, 150), outline=(40, 40, 40)); dr.text((X(160), Y(400) + 6), 'gallery 382-400', font=fs, fill=(0, 0, 0))
    for x in (-130, -78, -26, 26, 78, 130):
        dr.rectangle([X(x - 17), Y(214), X(x + 17), Y(50)], fill=(196, 196, 192), outline=(90, 90, 90))
    dr.rectangle([X(-170), Y(241), X(170), Y(215)], fill=(196, 196, 192), outline=(90, 90, 90)); dr.text((X(-160), Y(215) + 4), 'learning-centre beam: sealed', font=fs, fill=(80, 80, 80))
    for x in FIN_X:
        top = 319 if x == 92 else 410
        dr.rectangle([X(x - 15), Y(min(top, 370)), X(x + 15), Y(244)], fill=(196, 196, 192), outline=(90, 90, 90))
        if top > 370: dr.rectangle([X(x - 15), Y(410), X(x + 15), Y(370)], fill=(238, 214, 150), outline=(40, 40, 40))
    dr.text((X(92) - 40, Y(319) - 22), 'broken fin', font=fs, fill=(80, 80, 80))
    for k in range(-6, 14):
        x = 22 * k; dr.rectangle([X(x - 9), Y(418), X(x + 9), Y(400)], fill=(238, 214, 150), outline=(40, 40, 40))
    def nw(y): return 14 + 46 * max(0.0, min(1.0, (y - 272) / 128.0))
    notch = [(X(-221 - nw(y)), Y(y)) for y in range(420, 271, -8)] + [(X(-221 + nw(y)), Y(y)) for y in range(272, 421, 8)]
    dr.polygon(notch, fill=(255, 255, 255), outline=(40, 40, 40)); dr.text((X(-330), Y(300)), 'THE NOTCH', font=fb, fill=(80, 80, 80))
    # the river: the lake stands at the Notch's sill (272 m) and pours over it down the face to the canyon floor
    dr.polygon([(X(-235), Y(LAKE_Y)), (X(-207), Y(LAKE_Y)), (X(-200), Y(0)), (X(-242), Y(0))], fill=(150, 196, 236), outline=(60, 120, 190))
    dr.ellipse([X(-275), Y(28), X(-167), Y(-8)], fill=(214, 232, 246), outline=(150, 190, 220))
    dr.rectangle([X(-320), Y(4), X(320), Y(0)], fill=(120, 170, 220))
    dr.text((X(-200) + 8, Y(150)), 'the cascade (272 m)', font=fb, fill=(30, 80, 150))
    dr.rectangle([X(-124), Y(420), X(124), Y(416.5)], fill=(238, 214, 150), outline=(40, 40, 40))
    dr.rectangle([X(-120), Y(436), X(120), Y(420)], fill=(240, 236, 220), outline=(40, 40, 40))
    dr.pieslice([X(-120), Y(436 + 117), X(120), Y(436 - 117)], 180, 360, fill=(220, 236, 244), outline=(40, 40, 40), width=2)
    dr.rectangle([X(-16), Y(559), X(16), Y(553)], fill=(240, 236, 220), outline=(40, 40, 40))
    dr.text((X(-120), Y(560) - 22), 'THE DOME (the Tear is on the far, upstream side)', font=fb, fill=GOLD)
    for x in (90, 130, 170, -90, -130):
        dr.pieslice([X(x - 15), Y(416 + 12), X(x + 15), Y(416 - 12)], 180, 360, fill=(240, 236, 220), outline=(40, 40, 40))
    dr.line([(X(320), Y(400)), (X(345), Y(415)), (X(325), Y(425)), (X(350), Y(440))], fill=(60, 60, 60), width=5)
    dr.text((X(355), Y(425)), 'the Stair of Descent', font=fs, fill=(0, 0, 0))
    for i, x in enumerate(range(360, 1200, 60)):
        h = 10 + (i % 3) * 5; dr.rectangle([X(x), Y(440 + h), X(x + 44), Y(440)], fill=(236, 226, 206), outline=(90, 90, 90))
    dr.text((X(560), Y(470)), 'the town (scrap Xanadu, about 4,100)', font=fb, fill=(0, 0, 0))
    dr.line([(X(-138), Y(408)), (X(-230), Y(420)), (X(-340), Y(440))], fill=ORDER, width=6)
    dr.rectangle([X(-420), Y(462), X(-340), Y(440)], fill=(210, 220, 240), outline=ORDER, width=2); dr.text((X(-520), Y(462) - 22), 'the Order\'s Gate', font=fs, fill=ORDER)
    dr.text((X(-300), Y(470)), 'the Order\'s Bridge', font=fs, fill=ORDER)
    dr.line([(X(260), Y(400)), (X(260), Y(0))], fill=(150, 0, 0), width=4); dr.text((X(266), Y(200)), 'the Deep Stair (behind two locks)', font=fs, fill=(150, 0, 0))
    return img

# ------------------------------------------------------------------------------------------------ keys and programs
T_NEW = {
  'xanadu_court_great_wheel': 'the Great Wheel: a prayer wheel the height of three men, turned by water from below through a bronze shaft, its drum printed with the whole Song',
  'xanadu_court_master_wheel': 'the master wheel of the Hall of the Song: gilt, hand-turned at the Station\'s passes',
  'xanadu_court_empty_seat': 'the Khan\'s empty seat: a gilt throne under a canopy, never sat in',
  'xanadu_court_dulcimer_shrine': 'the Damsel\'s dulcimer on a lacquer stand under a gilt canopy',
  'xanadu_court_honey_altar': 'an offering table of honey jars and comb under a brass lid',
  'xanadu_court_milk_altar': 'an offering table of milk bowls and a churn',
  'xanadu_court_reliquary_wall': 'a wall of glass reliquary niches, each named in the sound-grid script',
  'xanadu_common_two_lock_door': 'an iron door with two locks (the warden\'s and the custodian\'s)',
  'xanadu_common_register_desk': 'the register of descents: a slanted desk with the great book and a chain',
  'xanadu_common_penstock_valve': 'a bronze valve wheel on the rising main, with gauges',
  'xanadu_common_drum_rack': 'a rack of printed wheel drums, ready to be hung',
}
def programs():
    cs = lambda n: max(1, round(n))
    P = LS.programs()
    P.update({
      'sanctum': lambda a, w, d, D: [('xanadu_court_master_wheel', 1), ('xanadu_court_empty_seat', 1), ('xanadu_common_meditation_cushion', cs(a / 30)), ('xanadu_common_prayer_wheels', cs(a / 60)), ('xanadu_court_candelabra', cs(a / 200))],
      'wheel_house': lambda a, w, d, D: [('xanadu_court_great_wheel', 1), ('xanadu_common_prayer_wheels', 8), ('xanadu_court_lamp', 4)],
      'damsel_shrine': lambda a, w, d, D: [('xanadu_court_dulcimer_shrine', 1), ('xanadu_common_meditation_cushion', 4), ('xanadu_court_lamp', 4)],
      'offering_hall': lambda a, w, d, D: [('xanadu_court_honey_altar', cs(a / 400)), ('xanadu_court_milk_altar', cs(a / 400)), ('xanadu_common_bench', cs(a / 60)), ('xanadu_common_store', cs(a / 150))],
      'ancestors_hall': lambda a, w, d, D: [('xanadu_court_reliquary_wall', cs((w + d) / 12)), ('xanadu_common_relic_case', cs(a / 80)), ('xanadu_common_meditation_cushion', cs(a / 60))],
      'gatehouse_deep': lambda a, w, d, D: [('xanadu_common_two_lock_door', 1), ('xanadu_common_bench', 2), ('xanadu_common_lamp', 2), ('xanadu_common_chest', 1)],
      'rising_main': lambda a, w, d, D: [('xanadu_common_penstock_valve', cs(a / 300)), ('xanadu_common_workbench', 1), ('xanadu_common_lamp', cs(a / 150))],
      'empty': lambda a, w, d, D: [],
    })
    return P

def main():
    B.KEYMAP.update(LS.keymap()); B.EXTRA_PROGRAMS.update(programs())
    allnew = dict(LS.LS_NEW); allnew.update(T_NEW)
    used = set()
    for F in FLOORS[1:]:
        for r in F['rooms']: used.update(B.manifest_for(dict(r))[0])
    B.NEW.clear(); B.NEW.update({k: v for k, v in allnew.items() if k in used}); B.CITY.clear()
    os.makedirs(OUT, exist_ok=True)
    B.draw_floor(T0).save(os.path.join(OUT, 'T0.png'))      # the site's quarters are not rooms: drawn, not furnished
    print('drew T0 (not in the manifest)')
    intro = ('Generated by `theodiga_blueprint.py` (on `settlements/voth/palace/blueprint.py`) from the same room data as the sheets. Keys are catalog '
             'pieces (`kits/catalog`): `xanadu_court_*` and `xanadu_common_*` (the Xanadu sets, through Longsong\'s key map), `order_*`, `generic_*`. '
             'Each room is counted for ONE storey: the crest\'s blocks have four, the gallery four, a fin head eleven; the census (BLUEPRINT.md) '
             'says how many are lived in. The site sheet (T0) is the town\'s quarters, not rooms: it is not furnished here; core/city lays its lots.\n')
    B.main(floors=FLOORS[1:], out=OUT, here=HERE, title='# Theodiga today: furniture manifest\n', intro=intro, section=draw_section, zone_R=1000)
    draw_elevation().save(os.path.join(OUT, 'elevation.png'))
    print('wrote elevation.png')

# ------------------------------------------------------------------------------------------------ the export for the page
def arc_units():
    """The inhabited levels' units (one program each, as the sheets give them) in the dam group's frame, for the page's
    interiors (src/43-th-arc-program.js; T-arc-1): the Dome's rooms on the deck, the crest's blocks, the gallery's segments
    along the arc, the standing fin heads. Each: id, area, name, kind (the sheets' program), decor, note, shape ('box' x0..x1,
    z0..z1; 'circle' cx, cz, r; 'arc' x0..x1 at z = zc(x) + za .. zc(x) + zb), y0 (the first storey's floor), n storeys of h."""
    U = []
    for r in T1['rooms']:
        u = dict(id='th.arc.dome.%d' % r['n'], area='dome', name=r['name'], kind=r['kind'], decor=r['decor'], note=r['note'], y0=420.0, n=1, h=5.0)
        if r.get('circ'): u.update(shape='circle', cx=(r['u0'] + r['u1']) / 2, cz=-(r['v0'] + r['v1']) / 2 + DOME_Z, r=(r['u1'] - r['u0']) / 2)
        else: u.update(shape='box', x0=r['u0'], x1=r['u1'], z0=-r['v1'] + DOME_Z, z1=-r['v0'] + DOME_Z)
        U.append(u)
    for k in range(13, -7, -1):
        x = 22 * k; za, zb = CREST[k]
        for (lo, hi, half, top, tag), spec in (((-6, 22, 7.5, 418.0, 'A'), za), ((39, 61, 9.0, 416.0, 'B'), zb)):
            U.append(dict(id='th.arc.crest.%+d%s' % (k, tag), area='crest', name=spec[0], kind=spec[1], decor=spec[2], note=spec[3] if len(spec) > 3 else '',
                          shape='box', x0=x - half, x1=x + half, z0=zc(x) + lo, z1=zc(x) + hi, y0=H, n=4, h=(top - H) / 4))
    G = [(250, 318, -2, 22, 'The Deep Stair and its second lock', 'gatehouse_deep'), (170, 250, -2, 22, 'Scholars\' cells (lake side)', 'cells'),
         (95, 170, -2, 22, 'Library of the Song: the stacks', 'archive_stacks'), (-95, 95, -2, 22, 'Undercroft of the Wheel', 'rising_main'),
         (-160, -95, -2, 22, 'Archive of the Decree: the master drums', 'archive'), (250, 318, 28, TF - 2, 'East Cistern', 'cistern'),
         (170, 250, 28, TF - 2, 'Stores', 'store'), (95, 170, 28, TF - 2, 'Library of the Song: the copyists', 'scriptorium'),
         (-95, 95, 28, TF - 2, 'Honey and Milk Cellars', 'larder'), (-160, -95, 28, TF - 2, 'Copyists\' hall', 'scriptorium'),
         (-160, 318, 22, 28, 'The Long Gallery', 'passage')]
    for i, (x0, x1, za, zb, name, kind) in enumerate(G):
        U.append(dict(id='th.arc.gallery.%d' % i, area='gallery', name=name, kind=kind, decor=1, note='', shape='arc', x0=x0, x1=x1, za=za, zb=zb, y0=382.0, n=4, h=4.5))
    for x in FIN_X:
        if x == 92: continue
        name, kind, d, note = FIN_USE[x]
        U.append(dict(id='th.arc.fin.%+d' % x, area='fin', name=name, kind=kind, decor=d, note=note, shape='box', x0=x - FIN_W / 2, x1=x + FIN_W / 2,
                      z0=FIN_Z[0], z1=FIN_Z[1], y0=370.0, n=11, h=40.0 / 11))
    return U

def export_js(path):
    import json
    U = arc_units()
    rnd = lambda v: round(v, 3) if isinstance(v, float) else v
    lines = ['/* GENERATED by settlements/theodiga/theodiga_blueprint.py --export (the sheets\' programs, T1-T3): do not edit; edit the',
             '   blueprint and run it again. [G data] The inhabited levels\' units in the dam group\'s frame (x east, z downstream, y up):',
             '   ' + str(len(U)) + ' units, read by src/43-th-arc.js (TH_ARC). */',
             'var TH_ARC_PROGRAM=[']
    for u in U:
        lines.append(' ' + json.dumps({k: rnd(v) for k, v in u.items()}, ensure_ascii=False) + ',')
    lines.append('];')
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines) + '\n')
    print('wrote %s: %d units' % (os.path.relpath(path, HERE).replace(os.sep, '/'), len(U)))

if __name__ == '__main__':
    if '--export' in sys.argv:
        export_js(os.path.join(HERE, 'src', '43-th-arc-program.js'))
    else:
        main()
