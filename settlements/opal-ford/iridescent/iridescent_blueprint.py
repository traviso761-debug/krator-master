#!/usr/bin/env python3
"""The Iridescent Order's house at Ōpal-Phōrḍ (the cataract's foot), its second great house and its house of studies: the
blueprint (settlements/opal-ford/PLAN.md section 2b, step OF1b). Sheets and the manifest come from
settlements/voth/palace/blueprint.py; the Xanadu key map and the monastery room programmes are Longsong's and the House of the
Tempest's (settlements/longsong/longsong_blueprint.py, settlements/strongwall/tempest/tempest_blueprint.py), imported, not copied.

Frame (the site, sheets S0, H1, H2, C, G): u runs up the river toward the fall (drawn to the right), v across it, v > 0
north-east away from the river (drawn up). Metres. It is the town page's frame shifted: u = page z - 2860, v = page x - 300
(settlements/opal-ford/targets/town/89zp-of-site.js, OF.PRECINCT: u -280..160, v -210..260). The fall stands at u 240 off the
sheet's right, the river's north-east edge at about v -255. The great monastery's sheets (M1, M2, MR) are in the kit block's own
frame, as the Tempest's are (kits/qiblai qb_monastery: local u from the gate to the back range, v across); the block stands with
its gate north-east and its hall toward the river: site u = 50 + local v, site v = 26 - local u.

    python iridescent_blueprint.py        # writes floors/*.png and FURNITURE.md next to this file
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.join(HERE, '..', '..', '..')
sys.path.insert(0, os.path.join(REPO, 'settlements', 'voth', 'palace'))
sys.path.insert(0, os.path.join(REPO, 'settlements', 'longsong'))
sys.path.insert(0, os.path.join(REPO, 'settlements', 'strongwall', 'tempest'))
import blueprint as B
from blueprint import R, box
import longsong_blueprint as LS
import tempest_blueprint as TB
from PIL import Image, ImageDraw

OUT = os.path.join(HERE, 'floors')
FLOORS = []
cs = lambda n: max(1, round(n))
def beds(r, n):
    """a sleeping room's designed headcount: its beds, chests, desks and candles are n, not scaled by area"""
    r['beds'] = n; return r
def seats(r, n):
    """a hall's designed seating: its benches, tables and bowls are for n, not scaled by area"""
    r['seats'] = n; return r

# ------------------------------------------------------------------------------------------------ the ground (the town page's closed form)
# A copy of the page's profile for the section only (targets/town/89zp-of-site.js ofW, ofFloor, ofH on the north-east bank)
def sm(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)
def of_w(z):
    s0, s1, rise, down, up = -1500, 2500, .0008, .012, .009
    y = s0 * rise + (z - s0) * down if z < s0 else (z * rise if z <= s1 else s1 * rise + (z - s1) * up)
    return y + 20 * sm(3100 - 45, 3100 + 45, z)
def of_floor(z):
    return of_w(z) - 20 * sm(3055, 3145, z) + 20 * sm(3100 - 420, 3145, z)
def of_cx(z): return 30 * math.sin((z - 200) / 1300.0)
def of_hw(z): return 26 + 18 * math.exp(-(z * z) / 12100.0) - 8 * math.exp(-((z - 3100) / 160.0) ** 2)
def of_h_ne(x, z):
    w, c, hw = of_w(z), of_cx(z), of_hw(z); a = x - c
    if a < hw: t = abs(a) / hw; return w - (2.4 - 1.8 * math.exp(-(z * z) / 12100.0)) * (1 - t * t)
    e = a - hw; lift = max(0.0, of_floor(z) - w)
    y = w + (lift + 1.6) * sm(0, 14 + 2 * lift, e) + 7.4 * sm(260, 380, e) + .008 * max(0.0, min(e, 1100) - 380)
    return y

# ------------------------------------------------------------------------------------------------ S0 the precinct
# the great monastery's block in the site frame (its 52 m square: local u -22..34 -> site v 48..-8, local v -28..28 -> site u 22..78)
BLK = (22, 78, -8, 48)
COLL = (-150, -70, 140, 220)           # the house of studies, 80 x 80 m round its debate court
TERR = [(-70 - 35 * k) for k in range(4)]   # the cell terraces' upper edges (v), stepping down toward the gorge
CUT = 2.2                                   # each terrace graded 2.2 m below the one above (the page's OF.HOUSE.cut: the ledge stays over the water)
FLOORS.append(dict(R=300, rect=(-290, 190, -270, 275), id='S0', tier=0,
  title='Sheet S0: the Iridescent Order\'s house at the cataract\'s foot, the precinct (480 x 545 m)',
  sub='On the north-east bank below the bow\'s fall (off the sheet to the right, at u 240): the flats, the riser of the first rise above the flood and the bench\'s edge, the gorge wall falling to the river at the bottom. '
      'The river road from the town arrives at the Gate of the Road (left). The great monastery (the Qiblai kit\'s 52 m block, the Turquoise dress) stands with its gate to the north-east and its Hall of the Bow toward the river: '
      'its moonglass gallery and the Bow Terrace below it face south-west over the plunge pool, where the morning bow stands in the spray with the sun behind the watcher. '
      'The cells step down the gorge wall on four terraces beside the fall; the Kora of the Falls goes down them to the pool\'s ledge, over the Bridge of the Spray and up to the chorten on the far lip. '
      'The house of studies (the novitiate: the owner, 2026-11-23, "House of studies") on the bench, the guest house and the service ranges by the gate. About 450 (the owner\'s ~450): some 110 monks and 165 novices, 60 lay servants and their households, 60 guests.',
  axisnote='u -> up the river, toward the fall (right); v north-east, away from the river (up)',
  lines=[([(-290, 98), (-268, 110)], (140, 100, 60), 5, 'the river road from the town (900 m)'),
         ([(-268, 110), (-60, 110), (20, 96), (50, 80)], (150, 130, 90), 4, 'the Way of the Colours: the mani walls and the eight chortens'),
         ([(50, -30), (130, -62), (163, -62), (163, -200), (160, -212)], (60, 120, 160), 3, 'the Kora of the Falls: down the Spray Stair'),
         ([(160, -212), (160, -330)], (60, 120, 160), 3, 'the Bridge of the Spray, over the river below the pool'),
         ([(-290, -255), (190, -258)], (90, 150, 170), 6, 'the river\'s north-east edge (the gorge\'s foot)'),
         ([(-290, -228), (60, -232), (190, -236)], (120, 100, 80), 2, 'the gorge\'s lip'),
         ([(190, -262), (240, -262)], (90, 150, 170), 6, 'to the fall (u 240), 20 m')],
  rooms=[
    R(1, 'The great monastery (sheets M1, M2, MR)', 'void', BLK[0], BLK[1], BLK[2], BLK[3], 4, 'the kit block, gate north-east; the Hall of the Bow at the back toward the river under the gilt crown'),
    R(2, 'Forecourt of the White Light', 'court', 30, 70, 48, 92, 2, 'the incense altar, the prayer-wheel gallery, the eighth chorten at the gate'),
    R(3, 'The Bow Terrace', 'bow_terrace', 20, 140, -62, -22, 3, 'the summer office, sung at sunrise facing the spray; a parapet of turquoise tile'),
    R(4, 'The Prismarch\'s Lodge', 'guest_suite', 92, 122, 28, 58, 3, 'kept for the Prismarch of the Turquoise spoke on his way to Qiblai\'s councils (the owner: "A prior under Rēnbō-Phāl")'),
    R(5, 'Garden of the Bow', 'garden', 92, 150, 66, 124, 2, 'rills and a fountain cut to throw a bow at noon; the Prior\'s garden'),
    R(6, 'Cell terraces I-IV (sheet C)', 'void', 88, 170, -200, -66, 1, 'four terraces of cells down the gorge wall, a window on the spray in every cell'),
    R(7, 'The pool\'s ledge', 'kora', 145, 178, -212, -200, 2, 'the kora\'s lowest station: the spray on the face'),
    R(8, 'The house of studies (sheets H1, H2)', 'void', COLL[0], COLL[1], COLL[2], COLL[3], 3, 'the Order\'s novitiate and school of the divided light'),
    R(9, 'Service court: refectory, kitchens, stores (sheet G)', 'void', -62, 2, 128, 196, 1),
    R(10, 'The Prism Workshop (sheet G)', 'void', -62, -26, 200, 232, 2, 'the Glaziers\' lodge: the moonglass mended, the prisms ground'),
    R(11, 'Guest house and stable yard (sheet G)', 'void', -262, -196, 128, 250, 2, 'pilgrims, the opal road\'s travellers, the head house\'s monks'),
    R(12, 'Infirmary (sheet G)', 'void', -190, -156, 160, 206, 2),
    R(13, 'Gate of the Road', 'road_gate', -280, -266, 100, 122, 2, 'the gate on the river road; the porter\'s lodge beside it'),
    R(14, 'Physic garden', 'garden', -60, 14, -60, 60, 1, 'the infirmary\'s herbs, the dyers\' plants for the colour charts'),
    R(15, 'Orchard', 'orchard', -262, -80, -150, 96, 0, 'pomegranate, apricot and the opal-bark kin (biomes/opalvalley)'),
    R(16, 'Tea garden', 'orchard', -262, -150, -210, -158, 0),
    R(17, 'The Way of the Colours', 'kora', -260, -60, 102, 118, 2, 'from the gate to the forecourt between mani walls, eight chortens in the eight colours'),
    R(18, 'Tank', 'cistern', -60, -20, 72, 98, 0, 'fed from a leat off the river above the fall'),
  ]))

# ------------------------------------------------------------------------------------------------ M the great monastery (the kit block)
MON = TB.MON
cells_u, cells_v = TB.cells_u, TB.cells_v
MS_N, MS_S, MS_B, MS_H = TB.MS_N, TB.MS_S, TB.MS_B, TB.MS_H
MON_NOTE = ' The block in the site: its gate north-east (site u = 50 + local v, site v = 26 - local u).'
FLOORS.append(dict(MON, id='M1', tier=0, axisnote='u -> the back (south-west, the river); the Gate of the White Light north-east (left); v across',
  title='Sheet M1: the great monastery, ground floor (the kit\'s 52 m block, Turquoise dress)',
  sub='qb_monastery in the Turquoise spoke\'s dress (QSPOKE 4): four ranges of two storeys round a cloistered court, the gate tower in front, the assembly hall (24 x 17 m, three storeys) at the back of the court under the gilt crown, the Hall of the Bow. '
      'The court\'s piece is a crystal prism on a pillar that throws the morning colours across the flags.' + MON_NOTE,
  lines=cells_u(-9.5, 25, -26, -19, 10),
  rooms=[
    R(1, 'Gate of the White Light', 'song_gate', -20.5, -12.5, -5, 5, 3, 'the light before it is divided: plain white plaster, no colour on it'),
    R(2, 'Porter\'s Lodge', 'chamber', -20, -13, 5, 11, 2),
    R(3, 'Robe Room', 'sacristy', -20, -13, 11, 26, 2, 'the brothers\' outer robes and the guests\' shoes'),
    R(4, 'Sacristy', 'sacristy', -20, -13, -26, -5, 2, 'the turquoise robes, the lamps, the hall\'s silks in the eight colours'),
    R(5, 'Cloister Court', 'cloister_court', -13, 5.8, -16.8, 16.8, 3),
    R(6, 'The Court\'s Prism', 'song_drum', -9.2, -5.2, -2, 2, 4, 'a crystal-opal prism on a pillar (the Glaziers\' work): the colours walk the court each morning'),
    R(7, 'Cloister Walk (north)', 'kora', -13, 25, 16.8, 19, 2, 'prayer drums, a colour chart in every bay'),
    R(8, 'Cloister Walk (south)', 'kora', -13, 25, -19, -16.8, 2),
    R(9, 'Kora beside the Hall (north)', 'kora', 5.8, 22.8, 12, 16.8, 2),
    R(10, 'Kora beside the Hall (south)', 'kora', 5.8, 22.8, -16.8, -12, 2),
    R(11, 'Kora behind the Hall', 'kora', 22.8, 25, -16.8, 16.8, 2),
    R(12, 'Porch of the Hall', 'porch', 2.6, 5.8, -6, 6, 3),
    R(13, 'The Hall of the Bow (dukhang)', 'assembly', 5.8, 19, -12, 12, 4, 'two storeys, lit by the moonglass gallery above it; the Prior\'s seat, the Prismarch\'s when he is here'),
    R(14, 'Shrine of the Divided Light', 'shrine_bow', 19, 22.8, -12, 8, 4, 'the white lamp before the prism, the eight colours fanned on the wall behind'),
    box(15, 'Hall Stair', 'stair', MS_H, 2),
    R(16, 'Library of the Colours', 'colour_library', -9.5, 9, 19, 26, 3, 'the charts of the divided light, the Order\'s optics, the records of the bows seen'),
    R(17, 'Scriptorium', 'scriptorium', 9, 17, 19, 26, 2, 'the charts painted on silk'),
    R(18, 'Tea Kitchen', 'tea_kitchen', 17, 25, 19, 26, 1),
    beds(R(19, 'Cells of the Old Brothers (ten)', 'cells', -9.5, 25, -26, -19, 1, 'no stair for the old'), 10),
    R(20, 'Chapter House', 'chapter_house', 25, 32, -12, 12, 3, 'the daily chapter under the Prior'),
    R(21, 'Treasury', 'treasury', 25, 32, 15.5, 26, 2, 'Qiblai\'s grant to the eight Orders, the pilgrims\' gifts'),
    box(22, 'Back Stair', 'stair', MS_B, 1),
    R(23, 'Lamp, Butter and Robe Store', 'store', 25, 32, -20, -12, 0),
    R(24, 'Latrines', 'latrine', 25, 32, -26, -20, 0, 'over a shaft to the riser'),
    box(25, 'Stair (north)', 'stair', MS_N, 1), box(26, 'Stair (south)', 'stair', MS_S, 1),
  ]))
FLOORS.append(dict(MON, id='M2', tier=1, axisnote='u -> the back (south-west, the river); the gate north-east (left); v across',
  title='Sheet M2: the great monastery, upper floor (the cells; the hall\'s gallery)',
  sub='The chapter\'s cells on the upper floor of the ranges (*proposed*: 39 here and the ten old brothers below: about 65 of the house\'s monks; the rest in the cell terraces, sheet C). The Prior and the Master of Colours in the back range.' + MON_NOTE,
  lines=cells_u(-9.5, 25, 19, 26, 10) + cells_u(-9.5, 25, -26, -19, 10) + cells_v(-20, -15.4, 5, 26, 6) + cells_v(-20, -15.4, -26, -5, 6)
        + cells_v(25, 32, 15.5, 26, 3) + cells_v(25, 32, -26, -12, 4),
  rooms=[
    R(1, 'Drum of the Hours', 'drum_room', -20.5, -12.5, -5, 5, 2),
    beds(R(2, 'Cells (front, north: six)', 'cells', -20, -15.4, 5, 26, 1), 6),
    R(3, 'Corridor', 'passage', -15.4, -13, 5, 26, 1),
    beds(R(4, 'Cells (front, south: six)', 'cells', -20, -15.4, -26, -5, 1), 6),
    R(5, 'Corridor', 'passage', -15.4, -13, -26, -5, 1),
    beds(R(6, 'Cells of the Chapter (north: ten)', 'cells', -9.5, 25, 19, 26, 1), 10),
    beds(R(7, 'Cells of the Chapter (south: ten)', 'cells', -9.5, 25, -26, -19, 1), 10),
    R(8, 'Gallery on the Cloister Roof', 'passage', -13, 25, 16.8, 19, 1),
    R(9, 'Gallery on the Cloister Roof', 'passage', -13, 25, -19, -16.8, 1),
    R(10, 'Gallery over the Kora', 'passage', 22.8, 25, -16.8, 16.8, 1),
    R(11, 'The Prior', 'prior_cell', 25, 32, -12, 0, 3, 'the house\'s head, under Rēnbō-Phāl\'s (the owner, 2026-11-23)'),
    R(12, 'The Master of Colours', 'chamber', 25, 32, 0, 12, 2, 'keeps the charts and the bow-book'),
    beds(R(13, 'Guest Cells of the Head House (four)', 'cells', 25, 32, -26, -12, 2, 'monks of Rēnbō-Phāl going down to Qiblai'), 4),
    beds(R(14, 'Cells (three)', 'cells', 25, 32, 15.5, 26, 1), 3),
    box(15, 'Back Stair', 'stair', MS_B, 1),
    R(16, 'Masters\' Gallery (north)', 'gallery', 5.8, 19, 9, 12, 3),
    R(17, 'Masters\' Gallery (south)', 'gallery', 5.8, 19, -12, -9, 3),
    R(18, 'Masters\' Gallery (west)', 'gallery', 16, 19, -9, 9, 3),
    R(19, 'Hall of the Bow below', 'void', 5.8, 16, -9, 9, 4),
    R(20, 'Shrine below (rises through)', 'void', 19, 22.8, -12, 8, 4),
    box(21, 'Hall Stair', 'stair', MS_H, 2),
    R(22, 'Cloister Court (open)', 'void', -13, 5.8, -16.8, 16.8, 3),
    box(23, 'Stair (north)', 'stair', MS_N, 1), box(24, 'Stair (south)', 'stair', MS_S, 1),
  ]))
MOON = ([(22.8, -12), (22.8, 12)], (60, 170, 170), 6)
FLOORS.append(dict(MON, id='MR', tier=2, axisnote='u -> the back (south-west, the river); the gate north-east (left); v across',
  title='Sheet MR: the great monastery, the hall\'s third storey and the roofs: the moonglass gallery',
  sub='The hall\'s top storey rises above the back range\'s roof. At its back, toward the river, is the Gallery of the Bow: its south-west wall (teal line) all moonglass panes by the Glaziers, a prism set in each, facing the spray. '
      'In winter the morning office is sung here when the bow stands in the fall and the prisms throw the eight colours down the light well into the hall (the owner, 2026-11-23: "Moonglass hall, gilt crown"). '
      'The gilt crown (gold outline) is the hall\'s lantern; the Chapel of the Unbroken Light, dark and white, at the front.' + MON_NOTE,
  lines=[TB.CROWN, MOON],
  rooms=[
    R(1, 'Chapel of the Unbroken Light', 'chapel', 5.8, 11.6, -12, 12, 4, 'the white before the bow: no colour, one lamp'),
    R(2, 'Light Well (under the crown)', 'void', 11.6, 17, -3.84, 3.84, 4, 'the crown lights the hall; the gallery\'s colours fall through it'),
    R(3, 'The Gallery of the Bow', 'prism_gallery', 17, 22.8, -12, 8, 4, 'the moonglass wall on its south-west face, a prism in every pane; the winter office'),
    box(4, 'Hall Stair (head)', 'stair', MS_H, 2),
    R(5, 'Lookout of the Gate', 'watch', -20.5, -12.5, -5, 5, 1),
    R(6, 'Roof (north range)', 'roof', -9.5, 25, 19, 26, 1, 'prayer-flag masts in the eight colours'),
    R(7, 'Roof (south range)', 'roof', -9.5, 25, -26, -19, 1),
    R(8, 'Roof (back range)', 'roof', 25, 32, -26, 12, 1, 'below the gallery\'s glass: it sees over it'),
    R(9, 'Roof (front range)', 'roof', -20, -13, 5, 26, 1),
    R(10, 'Roof (front range)', 'roof', -20, -13, -26, -5, 1),
    R(11, 'Incense Altar (sang)', 'sang', 26, 31, -3, 3, 2, 'juniper at dawn before the office'),
    box(12, 'Back Stair (head)', 'stair', MS_B, 1), box(13, 'Stair (north, head)', 'stair', MS_N, 1), box(14, 'Stair (south, head)', 'stair', MS_S, 1),
    R(15, 'Roof (back range)', 'roof', 25, 32, 15.5, 26, 1),
    R(16, 'Cloister Court (open)', 'void', -13, 5.8, -16.8, 16.8, 3),
    R(17, 'Gallery (north arm)', 'gallery', 11.6, 17, 3.84, 12, 3),
    R(18, 'Gallery (south arm)', 'gallery', 11.6, 17, -12, -3.84, 3),
    R(19, 'Landing', 'passage', 17, 19, 8, 12, 2),
  ]))

# ------------------------------------------------------------------------------------------------ H the house of studies (site frame)
U0, U1, V0, V1 = COLL
D = 12                                  # the ranges' depth
CO = (U0 + D, U1 - D, V0 + D, V1 - D)   # the debate court
H_ST = [(U0 + D, U0 + D + 6, V1 - D - 8, V1 - D - 2), (U1 - D - 6, U1 - D, V0 + D + 2, V0 + D + 8)]   # the two stairs in the court's corners
HOUSE = dict(R=48, rect=(U0 - 4, U1 + 4, V0 - 4, V1 + 4), axisnote='u -> up the river (right); v north-east (up); the gate on the south-west face, from the Way of the Colours')
FLOORS.append(dict(HOUSE, id='H1', tier=0,
  title='Sheet H1: the house of studies, ground floor (80 x 80 m round its debate court)',
  sub='The Order\'s novitiate and school (the owner, 2026-11-23: "House of studies"): the novices come down to it from Qiblai\'s Turquoise spoke and from Lāiṭwāl, five years under the Novice-master before their vows at Rēnbō-Phāl. '
      'The school of the divided light (optics, the colours, the reading of the bow), the Song and the Decree. Ranges of two storeys, 12 m deep, round the debate court; the gate on the south-west face.',
  rooms=[
    R(1, 'Gate of the Novices', 'road_gate', -116, -104, V0, V0 + D, 2),
    R(2, 'The Novice-master', 'prior_cell', U0, -116, V0, V0 + D, 3, 'his rooms by the gate: he sees who goes out'),
    R(3, 'Reading Room', 'reading_room', -104, U1, V0, V0 + D, 3, 'the college\'s books; windows on the court'),
    seats(R(4, 'Novices\' Refectory', 'novice_refectory', U0, U0 + D, V0 + D, 186, 1, 'the Song read at meals'), 170),
    R(5, 'Kitchen of the House', 'kitchen', U0, U0 + D, 186, V1 - D, 1, 'from the service court\'s stores'),
    R(6, 'Lecture Hall of the Divided Light', 'lecture', U0, -104, V1 - D, V1, 2, 'optics: the prism, the lens, the bow\'s angle'),
    R(7, 'Lecture Hall of the Decree', 'lecture', -104, U1, V1 - D, V1, 2),
    R(8, 'Colour Library (the college\'s)', 'colour_library', U1 - D, U1, 172, V1 - D, 3, 'the charts copied for teaching'),
    R(9, 'Catalogue and Scriptorium', 'scriptorium', U1 - D, U1, V0 + D, 172, 2),
    R(10, 'The Debate Court', 'debate_court', CO[0], CO[1], CO[2], CO[3], 2, 'the novices dispute in the afternoons, as at Sera; a prism pillar at its middle'),
    R(11, 'The Prism Pillar', 'song_drum', -113, -107, 177, 183, 3, 'a turning prism on a stone pillar, the novices\' first lesson'),
    box(12, 'Stair (north-west)', 'stair', H_ST[0], 1), box(13, 'Stair (south-east)', 'stair', H_ST[1], 1),
  ]))
FLOORS.append(dict(HOUSE, id='H2', tier=1,
  title='Sheet H2: the house of studies, upper floor (the novices\' dormitories, the masters)',
  sub='About 150 novices sleep in the long dormitories over the refectory, the lecture halls and the reading room, ten to a bay, the eldest at the ends; the masters of the school have cells over the library. Galleries look into the court.',
  lines=cells_v(U1 - D, U1, V0 + D, V1 - D, 8),
  rooms=[
    beds(R(1, 'Novices\' Dormitory (south-west)', 'novice_dorm', U0, U1, V0, V0 + D, 1, 'over the gate, the Novice-master\'s and the reading room'), 60),
    beds(R(2, 'Novices\' Dormitory (north-east)', 'novice_dorm', U0, U1, V1 - D, V1, 1, 'over the lecture halls'), 60),
    beds(R(3, 'Novices\' Dormitory (north-west)', 'novice_dorm', U0, U0 + D, V0 + D, V1 - D, 1, 'over the refectory'), 45),
    beds(R(4, 'Cells of the Masters (eight)', 'cells', U1 - D, U1, V0 + D, V1 - D, 2, 'the school\'s masters over the library'), 8),
    R(5, 'Gallery round the court', 'passage', CO[0], CO[1], CO[3] - 3, CO[3], 1),
    R(6, 'Gallery round the court', 'passage', CO[0], CO[1], CO[2], CO[2] + 3, 1),
    R(7, 'Debate Court below', 'void', CO[0], CO[1], CO[2] + 3, CO[3] - 3, 2),
    R(8, 'Washroom', 'wash', U0, U0 + D, V0 + D, V0 + D + 10, 1),
    box(9, 'Stair (north-west)', 'stair', H_ST[0], 1), box(10, 'Stair (south-east)', 'stair', H_ST[1], 1),
  ]))

# ------------------------------------------------------------------------------------------------ C the cell terraces (site frame)
SPRAY = (163, 169, -205, -62)   # the Spray Stair: from the Bow Terrace down past every terrace to the pool's ledge
crooms = []
n = 1
for k, vt in enumerate(TERR):
    crooms.append(beds(R(n, 'Terrace %s: cells (twelve)' % 'I II III IV'.split()[k], 'cells', 92, 152, vt - 10, vt, 1,
                    'each cell 5 m wide, its window on the spray' + ('; the eldest nearest the office' if k == 0 else '')), 12))
    crooms.append(R(n + 1, 'Terrace %s: the walk' % 'I II III IV'.split()[k], 'kora', 92, 163, vt - 15, vt - 10, 2, 'the kora\'s station: a prayer drum at each door'))
    crooms.append(R(n + 2, 'Terrace %s: shrine' % 'I II III IV'.split()[k], 'chapel', 152, 163, vt - 10, vt, 2,
                    ['the bow\'s first colour, red', 'orange and yellow', 'green and turquoise', 'blue and violet: the last'][k]))
    n += 3
crooms += [box(n, 'The Spray Stair', 'stair', SPRAY, 1, 'the kora goes down it; the cells open off its landings'),
           R(n + 1, 'The pool\'s ledge', 'kora', 145, 178, -212, -205, 2, 'the lowest station, in the spray'),
           R(n + 2, 'Hermitages (two)', 'meditation_cell', 92, 108, -205, -195, 1, 'cut into the gorge wall under terrace IV: the long retreats'),
           R(n + 3, 'The Bow Terrace (above)', 'bow_terrace', 92, 170, -62, -50, 3)]
FLOORS.append(dict(R=80, rect=(86, 182, -216, -46), id='C', tier=0,
  title='Sheet C: the cell terraces down the gorge wall beside the fall (four terraces, drawn in place)',
  sub='Forty-eight cells on four terraces stepping down toward the gorge, each graded 2.2 m below the one above into the level bank, the pool\'s ledge 10 m below the Bow Terrace and some 2.5 m over the water (the page\'s ground: OF.HOUSE), every cell with its window on the spray of the fall 80 m up the river. '
      'Each terrace has its walk in front (the kora\'s station), its shrine at the fall\'s end in one of the bow\'s colours, red at the top to violet at the foot. The Spray Stair links them to the Bow Terrace and the pool\'s ledge.',
  axisnote='u -> up the river, toward the fall (right); v north-east (up); the river below',
  lines=[([(86, -214), (182, -214)], (90, 150, 170), 4, 'the river\'s edge below the ledge')],
  rooms=crooms))

# ------------------------------------------------------------------------------------------------ G the outer ranges (site frame)
FLOORS.append(dict(R=140, rect=(-282, 4, 96, 256), id='G', tier=0,
  title='Sheet G: the outer ranges: the gate, the guest house, the infirmary, the service court, the Prism Workshop',
  sub='By the Gate of the Road, off the Way of the Colours: the guest house for the pilgrims who come to see the bow and the travellers of the opal road (60 beds), its stable yard; the infirmary and its apothecary; '
      'the service court with the monks\' refectory, the kitchens, the granary and the stores; the Glaziers\' lodge where the moonglass is mended and the prisms ground. Single storeys but the guest house (two).',
  axisnote='u -> up the river (right); v north-east (up)',
  rooms=[
    R(1, 'Gate of the Road', 'road_gate', -280, -266, 100, 122, 2),
    R(2, 'Porter\'s Lodge', 'chamber', -280, -266, 122, 134, 1),
    seats(R(3, 'Guest Hall', 'guest_hall', -262, -230, 128, 150, 2, 'the pilgrims\' common room and its hearth'), 64),
    beds(R(4, 'Guest Dormitories (two storeys)', 'hostel', -262, -196, 150, 190, 1, '60 beds, men and women apart'), 48),
    beds(R(5, 'Guest Rooms (eight)', 'lodging', -230, -196, 128, 150, 2, 'merchants of the opal road, the Glaziers\' masters'), 12),
    R(6, 'Guest Kitchen', 'kitchen', -262, -240, 190, 204, 1),
    R(7, 'Stable Yard', 'stable', -262, -196, 204, 250, 0, 'mules and the guests\' horses; a trough, the hay loft over the north side'),
    R(8, 'Infirmary', 'infirmary', -190, -156, 160, 190, 2, 'for the house and the town'),
    R(9, 'Apothecary', 'apothecary', -190, -156, 190, 206, 2),
    seats(R(10, 'Refectory of the Monks', 'refectory', -62, -30, 128, 156, 2, 'the reader\'s seat, the Song at meals; the 110 monks and the guests of the house'), 130),
    R(11, 'Great Kitchen', 'kitchen', -30, 2, 128, 156, 1, 'for the monks, the house of studies (by its own kitchen) and the guests'),
    R(12, 'Service Court', 'court', -62, 2, 156, 172, 0),
    R(13, 'Granary', 'granary', -62, -36, 172, 196, 0, 'the house\'s rice from the town\'s paddies (its tithe)'),
    R(14, 'Stores', 'store', -36, -12, 172, 196, 0),
    R(15, 'Laundry and Dye House', 'laundry', -12, 2, 172, 196, 1, 'the robes dyed turquoise, the silks in the eight colours'),
    R(16, 'The Prism Workshop (the Glaziers\' lodge)', 'prism_workshop', -62, -38, 200, 232, 2, 'two Glaziers from Lāiṭwāl: the moonglass mended, the prisms ground and polished'),
    R(17, 'Glass Store', 'glaze_store', -38, -26, 200, 232, 1, 'moonglass panes packed in straw from the wall\'s kilns'),
    beds(R(18, 'Lay Servants\' Houses', 'lay_dorm', -150, -70, 230, 252, 1, 'the house\'s 60 lay servants and their households (more in the town)'), 60),
    R(19, 'Tank', 'cistern', -60, -20, 100, 124, 0),
  ]))

# ------------------------------------------------------------------------------------------------ programmes, key map and new pieces
def programs():
    return {
      'assembly': lambda a, w, d, D: [('xanadu_common_skylight_column', 12), ('xanadu_common_meditation_cushion', cs(a / 8)), ('xanadu_court_throne', 1), ('xanadu_court_altar', 1),
                                     ('xanadu_court_bow_banner', 2), ('xanadu_common_candle', cs(a / 10))],
      'shrine_bow': lambda a, w, d, D: [('xanadu_court_altar', 1), ('xanadu_court_prism_stand', 1), ('xanadu_court_incense_burner', 2), ('xanadu_common_butter_lamp_rack', 2), ('xanadu_court_bow_banner', 1)],
      'prism_gallery': lambda a, w, d, D: [('xanadu_court_prism_stand', cs(w / 3)), ('xanadu_common_meditation_cushion', cs(a / 3)), ('xanadu_court_moonglass_screen', 2)],
      'colour_library': lambda a, w, d, D: [('xanadu_common_colour_chart_rack', cs(a / 10)), ('xanadu_common_scroll_rack', cs(a / 16)), ('xanadu_common_low_table', cs(a / 25)),
                                           ('xanadu_court_prism_stand', 1), ('xanadu_common_meditation_cushion', cs(a / 12))],
      'prism_workshop': lambda a, w, d, D: [('xanadu_common_lens_grinding_wheel', cs(a / 60)), ('xanadu_common_workbench', cs(a / 30)), ('xanadu_common_wall_shelves', 2), ('xanadu_common_stool', 4),
                                           ('xanadu_court_prism_stand', 1)],
      'glaze_store': lambda a, w, d, D: [('xanadu_common_store', cs(a / 15)), ('xanadu_common_wall_shelves', cs(a / 30))],
      'prior_cell': lambda a, w, d, D: [('xanadu_common_bed', 1), ('xanadu_common_chest', 1), ('xanadu_common_desk', 1), ('xanadu_common_meditation_cushion', 1), ('xanadu_court_prism_stand', 1),
                                       ('xanadu_court_low_table', 1)],
      'guest_suite': lambda a, w, d, D: [('xanadu_court_bed', 1), ('xanadu_court_throne', 1), ('xanadu_common_meditation_cushion', 8), ('xanadu_court_low_table', 2), ('xanadu_court_bow_banner', 1),
                                        ('xanadu_common_bed', 4), ('xanadu_common_chest', 4)],
      'road_gate': lambda a, w, d, D: [('xanadu_common_bench', 2), ('xanadu_common_lamp', 2), ('xanadu_common_prayer_wheels', 1)],
      'debate_court': lambda a, w, d, D: [('xanadu_common_debate_dais', 1), ('xanadu_common_bench', 12), ('xanadu_common_planter', 4)],
      'stable': lambda a, w, d, D: [('xanadu_trade_stall', 20), ('xanadu_trade_trough', 3), ('xanadu_trade_hayrack', 3), ('xanadu_arms_saddle_rack', 4), ('xanadu_common_mounting_block', 2)],
      'bow_terrace': lambda a, w, d, D: [], 'orchard': lambda a, w, d, D: [], 'garden': lambda a, w, d, D: [],
      'guest_hall': lambda a, w, d, D: [('xanadu_common_table', cs(a / 25)), ('xanadu_common_bench', cs(a / 12)), ('xanadu_common_hearth', 1), ('xanadu_common_tea_copper', 1)],
      'lodging': lambda a, w, d, D: [('xanadu_common_bed', cs(a / 18)), ('xanadu_common_chest', cs(a / 18)), ('xanadu_common_low_table', cs(a / 36))],
    }
OPEN = set(TB.OPEN) | {'bow_terrace', 'orchard', 'garden', 'court', 'road_gate', 'debate_court', 'stable'}
NEW_HERE = {
  'xanadu_court_prism_stand': 'a prism of the Glaziers\' crystal-opal on a turning lacquer stand, turquoise and gilt, set where the morning light falls',
  'xanadu_court_moonglass_screen': 'a folding screen of moonglass panes in turquoise lacquer frames (the Glaziers\' milky glass)',
  'xanadu_common_colour_chart_rack': 'the Order\'s colour charts: painted silk scrolls of the divided light, hung on a rack in the eight colours\' order',
  'xanadu_common_lens_grinding_wheel': 'a treadle grinding wheel and its lap for prisms and lenses, a water drip, the grits in jars',
  'xanadu_court_bow_banner': 'the Iridescent Order\'s banner on its lacquer stand: turquoise silk, the eight colours fanned from a white prism',
}

_MF = B.manifest_for
def manifest_for(room):
    agg, a = _MF(room)
    n = room.get('beds')
    if n is not None:
        for k in ('xanadu_common_bed', 'xanadu_common_chest', 'xanadu_common_desk', 'xanadu_common_candle'):
            if k in agg: agg[k] = n
        if 'xanadu_common_bench' in agg: agg['xanadu_common_bench'] = min(agg['xanadu_common_bench'], cs(n / 6))
    m = room.get('seats')
    if m is not None:   # a hall's diners: a bench seats four, a table eight
        for k, per in (('xanadu_common_bench', 4), ('xanadu_common_table', 8), ('xanadu_common_bowl', 1)):
            if k in agg: agg[k] = cs(m / per)
    return agg, a

def main():
    B.manifest_for = manifest_for
    B.KEYMAP.update(TB.keymap()); B.EXTRA_PROGRAMS.update(LS.programs()); B.EXTRA_PROGRAMS.update(TB.programs()); B.EXTRA_PROGRAMS.update(programs())
    B.OPEN_KINDS.update(OPEN)
    for k in OPEN: B.KIND_FILL.setdefault(k, (214, 236, 250))
    B.KIND_FILL.update({'orchard': (220, 236, 200), 'garden': (214, 236, 206), 'bow_terrace': (206, 232, 230), 'roof': (236, 236, 236), 'prism_gallery': (200, 236, 236)})
    # the NEW list: the pieces this house's rooms use that the catalog lacks (Longsong's, the Tempest's and its own)
    pool = {}; pool.update(LS.LS_NEW); pool.update(TB.NEW); pool.update(NEW_HERE)
    used = set()
    for F in FLOORS:
        for r in F['rooms']:
            agg, _ = manifest_for(dict(r))
            used |= set(agg)
    B.NEW.clear(); B.NEW.update({k: v for k, v in pool.items() if k in used}); B.CITY.clear()
    intro = ('Generated by `iridescent_blueprint.py` (on `settlements/voth/palace/blueprint.py`, with Longsong\'s and the House of the Tempest\'s Xanadu key maps and room programmes) from the same room data as the sheets. '
             'Keys are catalog pieces (`kits/catalog`): `xanadu_court_*`, `xanadu_common_*` and the rest; **NEW** marks a piece the catalog lacks (listed at the end). Open grounds, courts, gardens and voids are not dressed.\n')
    B.main(floors=FLOORS, out=OUT, here=HERE, title='# The Iridescent Order\'s house at Ōpal-Phōrḍ: furniture manifest\n', intro=intro, section=draw_section, zone_R=300)

# ------------------------------------------------------------------------------------------------ the section
def draw_section():
    """across the river at the monastery's axis (site u 50, page z 2910): from the forecourt down through the block, the Bow
    Terrace, the cell terraces and the gorge wall to the river; heights from the page's ground, x3"""
    f_t = B.font(36, True); f = B.font(19); fs = B.font(16)
    W, H = 2400, 900; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Section across the river at the monastery\'s axis (site u 50): the forecourt, the block, the Bow Terrace, the cells, the gorge (heights x3)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 66), 'North-east (the bench, the forecourt) on the left, the river on the right. The ground is the town page\'s closed form at page z 2910; the block\'s heights are the kit\'s (qb_monastery); the cell terraces\' steps are proposed. The fall is 190 m up the river, behind this plane.', font=fs, fill=(70, 70, 70))
    z = 2910.0
    sx = 4.2; sy = 12.6; base = H - 120
    vmax, vmin = 130, -290
    def X(v): return 40 + (vmax - v) * sx
    def gn(v): return of_h_ne(v + 300, z)
    gflat = gn(-150)
    def gy(v):
        """the ground with the terraces' cuts (proposed: the page's bank is level here; step OF1b grades the cuts into its ground)"""
        if v > TERR[0]: return gn(v)
        if v <= -203: return min(gn(v), gflat - 10)          # the pool's ledge (OF.HOUSE.ledge.below)
        k = min(3, int((TERR[0] - v) // 35))
        return min(gn(v), gflat - CUT * (k + 1))
    y0 = min(gy(v) for v in range(vmin, vmax + 1)) - 4
    def Y(h): return base - (h - y0) * sy
    pts = [(X(v), Y(gy(v))) for v in range(vmax, vmin - 1, -2)]
    dr.polygon(pts + [(X(vmin), base + 40), (X(vmax), base + 40)], fill=(228, 214, 190), outline=(120, 100, 80))
    wv = of_w(z); dr.rectangle([X(-255), Y(wv), X(vmin), Y(wv) + 3], fill=(120, 180, 190)); dr.text((X(-262), Y(wv) + 8), 'the river (water %.1f m over the ford\'s)' % wv, font=fs, fill=(40, 90, 110))
    def blk(v0, v1, h0, h1, fill, name=None, col=(0, 0, 0)):
        dr.rectangle([X(v1), Y(h1), X(v0), Y(h0)], fill=fill, outline=(30, 30, 30), width=2)
        if name: dr.text((X(v1) + 3, Y(h1) - 22), name, font=fs, fill=col)
    g0 = gy(20)
    blk(48, 92, g0, g0 + .3, (214, 236, 250), 'forecourt')
    blk(40, 48, g0, g0 + 9.8, (250, 250, 240), 'gate tower')
    blk(-1, 40, g0, g0 + 6.4, (226, 236, 236), 'ranges and court')
    blk(-1, 18, g0 + .6, g0 + 9.6, (190, 226, 226), 'Hall of the Bow')
    blk(1, 7, g0 + 9.6, g0 + 13.2, (180, 236, 236), 'moonglass gallery', (20, 110, 110))
    blk(7, 14, g0 + 9.6, g0 + 13.2, (238, 238, 238))
    dr.rectangle([X(14), Y(g0 + 15.2), X(9), Y(g0 + 13.2)], fill=(238, 220, 150), outline=(30, 30, 30)); dr.text((X(18), Y(g0 + 15.2) - 22), 'gilt crown', font=fs, fill=(120, 80, 0))
    blk(-8, -1, g0, g0 + 6.4, (236, 232, 218), 'back range')
    gt = gy(-40); blk(-62, -22, gt, gt + .4, (206, 232, 230), 'Bow Terrace', (20, 110, 110))
    for k, vt in enumerate(TERR):
        h = gy(vt - 5); blk(vt - 10, vt, h, h + 3.4, (236, 232, 218)); dr.text((X(vt) + 2, Y(h + 3.4) - 20), 'cells ' + 'I II III IV'.split()[k], font=fs, fill=(0, 0, 0))
    hl = gy(-208); blk(-212, -205, hl, hl + .3, (206, 232, 230)); dr.text((X(-200), Y(hl) - 40), "pool's ledge", font=fs, fill=(20, 110, 110))
    # the morning sun behind the watcher on the terrace, the bow in the spray before him
    dr.line([(X(120), Y(g0 + 26)), (X(-40), Y(gt + 1.7))], fill=(200, 150, 0), width=3); dr.text((X(128), Y(g0 + 26) - 22), 'the morning sun (east, behind the watcher)', font=fs, fill=(150, 100, 0))
    dr.arc([X(-232), Y(wv + 16), X(-288), Y(wv - 6)], 180, 360, fill=(170, 60, 160), width=4); dr.text((X(-236), Y(wv + 16) - 24), 'the bow in the spray', font=fs, fill=(140, 40, 130))
    for v in range(-280, 140, 40):
        dr.line([(X(v), base + 44), (X(v), base + 52)], fill=(0, 0, 0)); dr.text((X(v) - 14, base + 54), str(v), font=fs, fill=(0, 0, 0))
    dr.text((X(130), base + 74), 'site v (m)', font=fs, fill=(0, 0, 0))
    return img

if __name__ == '__main__':
    main()
