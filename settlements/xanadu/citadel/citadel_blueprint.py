#!/usr/bin/env python3
"""Erewhon's citadel: the Sultan's Palace, the Pleasure Dome (the harem palace), the Grand Vizier's palace, the great
officers' houses, the envoys' house, the court temple and the guard, inside the citadel wall. Sheets and the manifest
come from settlements/voth/palace/blueprint.py.

Frame: WORLD coordinates of the Erewhon page (targets/erewhon/87-er-layout.js): u = x (east), v = -z (north up).
The citadel wall is Travis's polygon CIT_POLY; the buildings stand where CIT_SITES puts them, enlarged on the
8 m garden grid (owner, 2026-10-16): the palace curtain 110 x 90 (was 60 x 56), the Pleasure Dome's precinct 105 x
110 (was 94 x 94) with wings round its garden, the Vizier's palace 44 x 54, the officers' houses about 36 x 36.
Levels: the citadel steps in 1.5 m garden tiles; each building's block is level. Storeys: the kit's (4.6 and 4.2 in
the palace's white base, 4.2 and 3.8 in the ochre block; 9 m under the Dome's drum).

    python3 citadel_blueprint.py        # writes floors/*.png and FURNITURE.md next to this file
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'voth', 'palace'))
import blueprint as B
from blueprint import R, box
from PIL import Image, ImageDraw

OUT = os.path.join(HERE, 'floors')
CIT_POLY = [(-230.0, 283.6), (-234.7, 152.9), (-233.7, 134.2), (-283.3, 131.8), (-284.7, 67.0), (-285.5, 30.3), (-400.7, 21.4), (-405.1, 68.9), (-444.1, 69.2),
            (-533.9, 69.4), (-516.4, 140.7), (-459.0, 196.4), (-440.7, 213.7), (-438.3, 237.4), (-423.1, 268.2), (-405.0, 290.0), (-394.2, 303.2), (-344.3, 308.8)]
RAMP = (-366, -346, 282, 298)        # the Ramp of the Sultan: a broad spiral ramp, every storey of the palace (he is carried)
PSTAIR = (-310, -304, 290, 298)      # the palace's service stair, east range
DSTAIR = (-343, -337, 190, 196)      # the Dome's stair to its galleries (east)
DSTAIR2 = (-377, -371, 190, 196)     # the Dome's stair (west)
VSTAIR = (-400, -394, 244, 250)      # the Vizier's palace stair

FLOORS = []

# ---- E0 the citadel
FLOORS.append(dict(id='E0', tier=0, R=160, rect=(-540, -225, 15, 315), poly=CIT_POLY, title='Sheet E0: the citadel of Erewhon (the Sultan\'s precinct inside its wall)',
  sub='the citadel gate from the plaza; the First Court with the guard\'s barracks and the Master of Mines\' house; the Avenue up the east side to the Second Court; the Pleasure Dome\'s walled garden in the middle; the Sultan\'s fortress-palace at the north with the Golden Way joining it to the Dome; the Grand Vizier\'s palace and his pool garden west; the court temple after Ortakoy; the envoys\' house; the citadel kitchens; the Treasurer\'s and the Chancellor\'s houses east. Garden tiles everywhere else.',
  outlines=[(-390, -280, 215, 305, 'Sultan\'s Palace, E1-E2'), (-410, -305, 95, 205, 'Pleasure Dome, E3-E4'), (-438, -394, 196, 250, 'Vizier\'s palace, E5')],
  rooms=[
    R(1, 'Citadel Gate', 'entrance', -346, -324, 20, 32, 4, 'the palace gate of the build (xa_palace_gate), facing the plaza; the saffron flags'),
    R(2, 'First Court', 'court', -398, -286, 32, 95, 3, 'the parade before the Dome\'s gate; a fountain tile on the axis; the guard musters here'),
    R(3, 'Barracks of the Citadel Guard', 'barracks', -350, -310, 40, 78, 1, 'the gate company (the kit\'s xa_barracks); the army proper is in the garrison in town'),
    R(4, 'House of the Master of Mines and Mints', 'lodging', -395, -355, 40, 78, 3, 'half home, half bureau: the assay room, the ore samples, the mint\'s counting room (E6)'),
    R(5, 'The Avenue of the Citadel', 'passage', -300, -284, 95, 150, 3, 'lamp posts and cypresses up the east side'),
    R(6, 'Second Court', 'court', -300, -275, 150, 215, 3, 'before the palace gate; the Treasurer\'s and the Chancellor\'s doors open on it'),
    R(7, 'Pleasure Dome precinct (E3-E4)', 'void', -410, -305, 95, 205, 4, 'the harem palace in its walled garden; one gate south, the Golden Way door north'),
    R(8, 'The Golden Way', 'passage', -372, -340, 205, 215, 4, 'a screened, covered court between the Dome\'s north door and the palace\'s harem postern: the Sultan\'s litter passes unseen'),
    R(9, 'Sultan\'s Palace (E1-E2)', 'void', -390, -280, 215, 305, 4, 'the fortress-palace: curtain, corner towers, the gate iwan, the white palace under twin turquoise domes'),
    R(10, 'Grand Vizier\'s Palace (E5)', 'void', -438, -394, 196, 250, 3, 'two storeys of arcaded loggias (the kit\'s xa_vizier)'),
    R(11, 'Vizier\'s Pool Garden', 'garden', -438, -394, 160, 196, 3, 'the Eram pool between marigold beds and cypresses; the Vizier walks here pulling his beard'),
    R(12, 'Envoys\' House', 'lodging', -466, -442, 140, 178, 3, 'a walled house with its own kitchen and guard: the Izizian, Yuni and Historian envoys lodge here (E6)'),
    R(13, 'Court Temple (after Ortakoy)', 'chapel', -500, -440, 86, 130, 4, 'the court\'s own temple: the prayer hall and the drum circuit; the priests\' rooms (E6)'),
    R(14, 'Citadel Kitchens, Ice House and Stores', 'kitchen', -532, -505, 72, 135, 1, 'feed the guard and the houses; ice from the Caves of Ice; the stables of the citadel (E6)'),
    R(15, 'House of the Treasurer', 'lodging', -270, -234, 165, 205, 3, 'the ledgers\' hall, the strongroom, the tax farmers\' room; residence above (E6)'),
    R(16, 'House of the Chancellor of Seals and Provinces', 'lodging', -270, -234, 225, 270, 3, 'the seals, the provincial clerks, the Chancellor\'s audience; residence above (E6)'),
    R(17, 'Palace Gardens', 'garden', -440, -410, 95, 196, 2, 'the 8 m garden tiles that fill the rest of the citadel: parterres, rills, chhatri kiosks, cypresses'),
    R(18, 'Palace Gardens (west)', 'garden', -516, -440, 135, 196, 2),
    R(19, 'Palace Gardens (south-west)', 'garden', -532, -400, 24, 72, 2),
    R(20, 'North-east Gardens', 'garden', -278, -236, 272, 305, 2, 'beside the palace along the cliff wall; the Chancellor\'s garden door'),
  ], doors=[(-335, 20)]))

# ---- E1 the Sultan's Palace, ground
PAL = dict(R=60, rect=(-392, -278, 213, 307))
FLOORS.append(dict(PAL, id='E1', tier=1, title='Sheet E1: the Sultan\'s Palace, ground: the curtain, the forecourt, the audience',
  sub='a residence and a diplomatic house, not a seat of government: the gate iwan, the forecourt with its long pool, the Hall of Audience on the axis with the Hall of Gifts and the Vizier\'s room either side, the state dining hall behind; the ranges inside the curtain hold the kitchens, the litter house and the bearers, the chancery of letters and the treasury of gifts. The Sultan is carried: the palace has a ramp, not a state stair.',
  rooms=[
    R(1, 'Gate Iwan', 'entrance', -341, -329, 211, 222, 4, 'the tall iwan through the front wall, guldasta turrets, a gilt pavilion on top, the Sultan\'s roundel'),
    R(2, 'Forecourt', 'court', -366, -304, 222, 258, 4, 'paving, cypresses, lamps'),
    R(3, 'The Long Pool', 'pool', -340, -330, 226, 254, 4),
    R(4, 'Guard of the Gate', 'guard', -366, -346, 222, 232, 2), R(5, 'Guard of the Gate', 'guard', -324, -304, 222, 232, 2),
    R(6, 'Harem Postern', 'entrance', -366, -356, 215, 222, 4, 'the Golden Way\'s door into the west range; screened'),
    R(7, 'Palace Kitchens', 'kitchen', -382, -366, 222, 250, 1, 'the Sultan eats like three men'),
    R(8, 'Litter House and the Bearers\' Hall', 'litter_house', -382, -366, 250, 272, 2, 'the palanquins and the four bearers; the way to the ramp'),
    R(9, 'Servants\' Hall and Dormitory', 'servants_hall', -382, -366, 272, 298, 1),
    R(10, 'Guard Hall and Armoury', 'guard', -304, -288, 222, 246, 2),
    R(11, 'Chancery of Letters', 'office', -304, -288, 246, 272, 3, 'the diplomatic correspondence; the dragomans of Izizian and Yuni'),
    R(12, 'Treasury of Gifts', 'treasury', -304, -288, 272, 298, 3, 'what the envoys bring and what the Sultan gives'),
    R(13, 'Hall of Audience', 'throne', -350, -320, 258, 282, 4, 'the Sultan on the Great Divan under the jharokhas; envoys and petitioners of rank'),
    R(14, 'Hall of Gifts', 'reception', -366, -350, 258, 282, 4, 'the gifts displayed before the audience'),
    R(15, 'Room of the Vizier', 'cabinet', -320, -304, 258, 282, 3, 'where the Grand Vizier waits on the Sultan each morning with the ledgers'),
    box(16, 'Ramp of the Sultan', 'ramp', RAMP, 4, 'a broad spiral ramp for the litter, every storey'),
    R(17, 'State Dining Hall', 'feast_private', -346, -320, 282, 298, 4, 'the envoys\' banquets; the Sultan dines on a couch'),
    R(18, 'Steward of the Palace', 'office', -320, -310, 282, 298, 2),
    box(19, 'Service Stair', 'stair', PSTAIR, 1),
    R(20, 'Corner Towers', 'guard', -390, -382, 297, 305, 1, 'four round towers under tiled bulbs (one drawn)'),
    R(21, 'Curtain Walk', 'passage', -382, -288, 298, 305, 1, 'the wall walk behind the palace block; the north gardens below the cliff wall'),
  ], doors=[(-335, 213), (-361, 213)]))

# ---- E2a the white base, second storey
FLOORS.append(dict(PAL, id='E2a', tier=1, title='Sheet E2a: the Sultan\'s Palace, second storey of the white base: the Sultan\'s rooms',
  sub='the private floor: the day room behind the jharokhas, the Great Bedchamber, the bath, the Sultan\'s own dining room, his wardrobe and body servants; the guest apartments of state in the east range; the ranges\' dormitories.',
  rooms=[
    R(1, 'Forecourt (void)', 'void', -366, -304, 222, 258, 4),
    R(2, 'Sultan\'s Day Room', 'cabinet', -350, -320, 258, 270, 4, 'the jharokhas over the forecourt; he receives favourites here'),
    R(3, 'Great Bedchamber', 'bedchamber', -350, -320, 270, 298, 4, 'the bed on its dais, reached by the ramp; a hoist from the bath'),
    R(4, 'Sultan\'s Bath', 'bath', -366, -350, 258, 282, 4, 'a sunken pool with steps and a chair; gold taps'),
    R(5, 'Sultan\'s Dining Room', 'feast_private', -320, -304, 258, 282, 4, 'alone or with favourites; the confectionery\'s trays come by the service stair'),
    R(6, 'Wardrobe and Body Servants', 'wardrobe', -320, -310, 282, 298, 3),
    box(7, 'Ramp of the Sultan', 'ramp', RAMP, 4), box(8, 'Service Stair', 'stair', PSTAIR, 1),
    R(9, 'Cooks\' Dormitory', 'dormitory', -382, -366, 222, 250, 0),
    R(10, 'Bearers\' Dormitory', 'dormitory', -382, -366, 250, 272, 1),
    R(11, 'Servants (upper)', 'dormitory', -382, -366, 272, 298, 0),
    R(12, 'Guest Apartments of State', 'guest_bed', -304, -288, 222, 272, 3, 'the Izizian legate, the Yuni envoy: two suites'),
    R(13, 'Treasury of Gifts (upper)', 'treasury', -304, -288, 272, 298, 3),
  ]))
# ---- E2b the ochre block
FLOORS.append(dict(PAL, id='E2b', tier=2, title='Sheet E2b: the ochre upper block under the twin turquoise domes',
  sub='set back on the white base\'s roof: the Loggia of Appearances along its front, the Gallery of Gifts, the Kiosk of the Domes, the ramp\'s head and the roof terrace.',
  rooms=[
    R(1, 'Roof Terrace of the White Base', 'garden', -366, -304, 258, 298, 3, 'parapet, gold corners, planters; the ochre block stands on it'),
    R(2, 'Loggia of Appearances', 'gallery', -355, -315, 266, 274, 4, 'the arcaded loggia over the forecourt: the Sultan is shown to the court on his couch'),
    R(3, 'Gallery of Gifts', 'trophy', -355, -335, 274, 292, 4, 'the Sultan\'s collection: Izizian clockwork, Yuni glass, Ancient trinkets'),
    R(4, 'Kiosk of the Domes', 'pavilion', -335, -315, 274, 292, 4, 'his private pleasure room under the twin domes: divans, a fountain, musicians behind a screen'),
    box(5, 'Ramp of the Sultan (head)', 'ramp', RAMP, 4),
    R(6, 'Roof Guard', 'guard', -312, -304, 282, 298, 1),
  ]))

# ---- E3 the Pleasure Dome, ground
DOME = dict(R=60, rect=(-412, -303, 93, 207))
FLOORS.append(dict(DOME, id='E3', tier=1, title='Sheet E3: the Pleasure Dome, ground: the harem palace',
  sub='Topkapi\'s harem in Xanadu\'s gold: the garden gate and the chahar bagh, the great domed feasting hall, the baths east and the Valide\'s court west, the consorts\' apartments, the concubines\' dormitories and school, the eunuchs\' court at the north door where the Golden Way comes in, the princes\' cage, the harem kitchens and confectionery.',
  rooms=[
    R(1, 'Garden Gate', 'entrance', -362, -352, 93, 100, 3, 'the arched gate in the garden wall; kiosks at the corners'),
    R(2, 'Chahar Bagh', 'garden', -400, -315, 100, 150, 4, 'four parterres, rills, fountains, cypress walks'),
    R(3, 'Reflecting Pool', 'pool', -362, -352, 100, 146, 4),
    R(4, 'The Dome: Hall of Feasts', 'feast_dome', -377, -337, 150, 190, 4, 'the square hall under the great dome, arcaded on four faces; the feasts and orgies of the Pleasure Dome; the Sultan\'s couch under the oculus'),
    R(5, 'Hall of the Musicians', 'music', -377, -357, 190, 203, 3), R(6, 'Harem Kitchens and Confectionery', 'kitchen', -357, -337, 190, 203, 1, 'sorbets, sweets, the roasts'),
    R(7, 'Hospital of the Harem', 'infirmary', -408, -377, 100, 125, 2),
    R(8, 'Consorts\' Apartments', 'harem_apartment', -408, -377, 125, 150, 4, 'the four kadins: a court each in little'),
    R(9, 'Valide\'s Court (open)', 'court', -405, -385, 150, 178, 4, 'the Sultan\'s mother\'s own court: a fountain, orange trees'),
    R(10, 'Valide\'s Apartments', 'harem_apartment', -385, -377, 150, 178, 4, 'reception, bedchamber, prayer room (the kit: a row of drums); she rules the Dome'),
    R(11, 'Cage of the Princes', 'cage', -408, -377, 178, 203, 4, 'the gilded apartments round a walled garden where the Sultan\'s sons wait; lattice windows'),
    R(12, 'Baths of the Dome', 'hammam', -337, -307, 100, 135, 4, 'under domes with gold oculus bosses: hot, warm and cold rooms, the great pool'),
    R(13, 'Concubines\' Dormitories', 'concubine_dorm', -337, -307, 135, 160, 3),
    R(14, 'Harem School', 'school', -337, -307, 160, 175, 3, 'music, letters, the arts of pleasing'),
    R(15, 'Eunuchs\' Court', 'court', -337, -317, 175, 203, 3, 'the chamberlains of the Dome keep the north door'),
    R(16, 'Eunuchs\' Dormitory and the Chief Eunuch', 'dormitory', -317, -307, 175, 203, 2),
    R(17, 'North Door (the Golden Way)', 'entrance', -362, -352, 203, 207, 4, 'guarded by the eunuchs; the Sultan\'s litter comes and goes'),
    box(18, 'Gallery Stair', 'stair', DSTAIR, 2), box(19, 'Gallery Stair', 'stair', DSTAIR2, 2),
    R(20, 'Harem Treasury and Wardrobe', 'treasury', -377, -367, 203, 207, 3, 'in the north wall\'s thickness (small)'),
    R(21, 'Garden Wall Kiosks', 'pavilion', -410, -400, 93, 100, 3, 'chhatris at the four corners (one drawn)'),
  ], doors=[(-357, 93), (-357, 207)]))
# ---- E4 the Pleasure Dome, upper
FLOORS.append(dict(DOME, id='E4', tier=2, title='Sheet E4: the Pleasure Dome, upper: the galleries, the favourites, the roof kiosks',
  sub='the dome hall\'s gallery with the musicians\' box and the Sultan\'s lattice, the favourites\' apartments over the consorts, the Valide\'s upper rooms, the concubines\' upper dormitories, the eunuchs above their court, and the roof terraces with their kiosks under the dome\'s turrets.',
  rooms=[
    R(1, 'Chahar Bagh (below)', 'void', -400, -315, 100, 150, 4),
    R(2, 'Hall of Feasts: gallery (void)', 'gallery_void', -377, -337, 150, 190, 4, 'the musicians\' box and the Sultan\'s lattice box'),
    R(3, 'Musicians\' Box', 'music', -377, -357, 190, 203, 3), R(4, 'Confectionery Stores', 'store', -357, -337, 190, 203, 0),
    R(5, 'Favourites\' Apartments', 'harem_apartment', -408, -377, 100, 150, 4, 'the gozde, the favourites of the hour'),
    R(6, 'Valide\'s Court (void)', 'void', -405, -385, 150, 178, 4),
    R(7, 'Valide\'s Upper Rooms', 'harem_apartment', -385, -377, 150, 178, 4),
    R(8, 'Cage: upper apartments', 'cage', -408, -377, 178, 203, 4),
    R(9, 'Baths: rest rooms', 'bedchamber', -337, -307, 100, 135, 4, 'divans and sherbet after the bath'),
    R(10, 'Concubines\' Dormitories (upper)', 'concubine_dorm', -337, -307, 135, 160, 3),
    R(11, 'Mistress of the Harem', 'chamber', -337, -307, 160, 175, 3),
    R(12, 'Eunuchs (upper)', 'dormitory', -337, -307, 175, 203, 2),
    box(13, 'Gallery Stair', 'stair', DSTAIR, 2), box(14, 'Gallery Stair', 'stair', DSTAIR2, 2),
    R(15, 'Roof Terrace and Kiosks', 'garden', -410, -305, 93, 100, 3, 'round the dome: the four turrets, kiosks on the wings\' roofs (one strip drawn)'),
  ]))

# ---- E5 the Vizier's palace
VIZ = dict(R=40, rect=(-440, -392, 158, 252))
FLOORS.append(dict(VIZ, id='E5a', tier=1, title='Sheet E5a: the Grand Vizier\'s Palace, ground: the Divan and the chancery',
  sub='the machinery of state: the Divan Hall where the Vizier presides over the council of the Sultanate, the Hall of Petitions, the treasury antechamber, the long clerks\' hall of the chancery; the Eram pool garden in front.',
  rooms=[
    R(1, 'Vizier\'s Pool Garden', 'garden', -438, -394, 160, 196, 3, 'the long turquoise pool between marigold beds and cypresses; the tall central arch of the loggia faces it'),
    R(2, 'Loggia of the Garden', 'gallery', -438, -394, 196, 204, 3, 'the ground-floor arcade on slender columns'),
    R(3, 'Divan Hall', 'divan', -438, -410, 220, 250, 4, 'the council: the Vizier, the Treasurer, the Chancellor, the Master of Mines, the Master of the Guard; the Sultan rarely'),
    R(4, 'Hall of Petitions and the Tax Farmers', 'petitions', -438, -410, 204, 220, 3, 'the valley\'s petitions; the farmers of the mine tithes'),
    R(5, 'Chancery of the Realm (clerks\' hall)', 'ministry', -410, -394, 204, 244, 2, 'edicts, the provinces, the mines\' returns'),
    box(6, 'Stair', 'stair', VSTAIR, 2),
    R(7, 'Archive of the Realm', 'archive', -438, -410, 250, 252, 2, 'in the back range (continues in the undercroft)'),
  ]))
FLOORS.append(dict(VIZ, id='E5b', tier=2, title='Sheet E5b: the Grand Vizier\'s Palace, upper: the Vizier\'s house',
  sub='the upper loggia; the Vizier\'s study with the ledgers, his family\'s apartments, the harem of a modest man, the archive\'s upper room.',
  rooms=[
    R(1, 'Pool Garden (below)', 'void', -438, -394, 160, 196, 3),
    R(2, 'Upper Loggia', 'gallery', -438, -394, 196, 204, 3, 'a rail between the columns; the octagonal bays'),
    R(3, 'Vizier\'s Study', 'cabinet', -438, -418, 220, 250, 4, 'the ledgers running red; the beard'),
    R(4, 'Vizier\'s Reception', 'reception', -418, -394, 220, 250, 3),
    R(5, 'Family Apartments', 'kin_chamber', -438, -410, 204, 220, 3),
    R(6, 'Archive (upper) and Clerks\' Chambers', 'archive', -410, -394, 204, 220, 2),
    box(7, 'Stair', 'stair', VSTAIR, 2),
  ]))

# ---- E6 the houses, the envoys, the guard, the temple, the kitchens
FLOORS.append(dict(id='E6', tier=0, R=160, rect=(-540, -225, 15, 315), poly=CIT_POLY, title='Sheet E6: the other buildings of the citadel, ground floors',
  sub='the three great officers\' houses (bureau below, residence above), the envoys\' house, the barracks of the guard, the court temple, the citadel kitchens and stables.',
  rooms=[
    R(1, 'Mines: Assay Room', 'assay', -395, -375, 40, 60, 2, 'the ore samples, the scales, the furnace'),
    R(2, 'Mines: Bureau of the Mines', 'office', -375, -355, 40, 60, 2), R(3, 'Mint: Counting Room and Strongroom', 'treasury', -395, -355, 60, 78, 3, 'the struck gold under two locks; residence above'),
    R(4, 'Barracks: Mess and Guard Hall', 'servants_hall', -350, -330, 40, 60, 1), R(5, 'Barracks: Dormitories', 'barracks', -330, -310, 40, 78, 0), R(6, 'Barracks: Armoury', 'armoury', -350, -330, 60, 78, 1),
    R(7, 'Treasurer: Hall of Ledgers', 'ledgers', -270, -250, 165, 205, 3, 'the ledgers of the Sultanate, running red'),
    R(8, 'Treasurer: Strongroom', 'treasury_vault', -250, -234, 165, 185, 3), R(9, 'Treasurer: Tax Farmers\' Room', 'office', -250, -234, 185, 205, 2),
    R(10, 'Chancellor: Hall of Seals', 'office', -270, -250, 225, 270, 3, 'the seals of the provinces; the Chancellor\'s audience'), R(11, 'Chancellor: Provincial Clerks', 'office', -250, -234, 225, 250, 2), R(12, 'Chancellor: Archive', 'archive', -250, -234, 250, 270, 2),
    R(13, 'Envoys\' House: Court', 'court', -466, -442, 140, 152, 3), R(14, 'Envoys\' House: Hall and Kitchen', 'guest_hall', -466, -442, 152, 164, 3), R(15, 'Envoys\' Apartments', 'guest_bed', -466, -442, 164, 178, 3, 'three suites; their own guard at the gate'),
    R(16, 'Court Temple: Prayer Hall', 'assembly', -490, -450, 92, 124, 4, 'gilded; the great drums; the court worships here, not in the city'),
    R(17, 'Temple: Drum Circuit', 'kora', -500, -440, 86, 92, 3), R(18, 'Temple: Priests\' Rooms', 'chamber', -500, -490, 92, 130, 2), R(19, 'Temple: Vestry', 'wardrobe', -450, -440, 92, 130, 2),
    R(20, 'Citadel Kitchens', 'kitchen', -532, -505, 100, 135, 1), R(21, 'Ice House', 'larder', -532, -518, 72, 100, 0, 'ice from the Caves of Ice, straw-packed'), R(22, 'Stables of the Citadel', 'stable', -518, -505, 72, 100, 1, 'the officers\' mounts; the Sultan does not ride'),
    R(23, 'Citadel Gate House', 'guard', -346, -324, 20, 32, 2),
  ]))

# ------------------------------------------------------------------------------------------------ keys and programs
sys.path.insert(0, os.path.join(HERE, '..', '..', 'longsong'))
import longsong_blueprint as LS

E_NEW = {
  'xanadu_common_planter': 'a planter', 'xanadu_common_well': 'a courtyard well', 'xanadu_court_wall_fountain': 'a tiled wall fountain',
  'xanadu_court_bath_pool': 'a sunken tiled pool under a dome', 'xanadu_court_altar': 'the altar: a lacquer table, the wheel, butter lamps',
  'xanadu_court_strongbox': 'a gold-cornered strongbox', 'xanadu_court_map_table': 'a map table', 'xanadu_court_armillary': 'the astronomers\' rings',
  'xanadu_common_tea_copper': 'a great copper on its hearth', 'xanadu_common_drying_rack': 'a drying rack', 'xanadu_common_bath_basin': 'a stone basin',
  'xanadu_common_skylight_column': 'a painted column carrying a lantern well', 'xanadu_court_card_cabinet': 'a cabinet of small drawers', 'xanadu_common_scroll_rack': 'a scroll rack',
  'xanadu_common_relic_case': 'a glass case on a lacquer stand', 'xanadu_common_meditation_cushion': 'a row of cushions on a low platform',
  'xanadu_court_palanquin': 'the Sultan\'s palanquin: a gilt litter with four poles and a canopy (four bearers)',
  'xanadu_court_great_divan': 'the Great Divan: a reinforced gilt couch for a tremendously fat man, with its own steps',
  'xanadu_court_dining_couch': 'a gilt dining couch and its tray tables', 'xanadu_court_lattice_box': 'a screened box of carved lattice (the Sultan watches unseen)',
  'xanadu_court_musicians_dais': 'a musicians\' dais with cushions and instrument stands', 'xanadu_court_sorbet_table': 'a sorbet table: a marble slab with ice wells',
  'xanadu_court_hoist': 'a silk-roped hoist with a gilt chair (bath to bed)', 'xanadu_common_assay_furnace': 'an assay furnace with scales and crucibles',
  'xanadu_court_harem_lattice': 'a gilt window lattice (the cage and the harem windows)',
}
def programs():
    cs = lambda n: max(1, round(n))
    P = LS.programs()
    P.update({
      'litter_house': lambda a, w, d, D: [('xanadu_court_palanquin', 2), ('xanadu_common_bench', 4), ('xanadu_common_rack', 2), ('xanadu_common_chest', 2), ('xanadu_common_lamp', 2)],
      'feast_dome': lambda a, w, d, D: [('xanadu_court_dining_couch', 12), ('xanadu_court_great_divan', 1), ('xanadu_court_low_table', 16), ('xanadu_court_musicians_dais', 1), ('xanadu_court_candelabra', 12), ('xanadu_court_hanging', 4), ('xanadu_court_jug', 16), ('xanadu_court_bowl', 24), ('xanadu_court_incense_burner', 8), ('xanadu_court_statue', 4), ('xanadu_court_sorbet_table', 2), ('xanadu_court_carpet', 6), ('xanadu_court_wall_fountain', 4)],
      'harem_apartment': lambda a, w, d, D: [('xanadu_court_bed', cs(a / 120)), ('xanadu_court_divan', cs(a / 40)), ('xanadu_court_low_table', cs(a / 60)), ('xanadu_court_cabinet', cs(a / 80)), ('xanadu_court_screen', cs(a / 60)), ('xanadu_court_harem_lattice', cs(a / 50)), ('xanadu_court_hearth', cs(a / 150)), ('xanadu_court_incense_burner', cs(a / 80))],
      'concubine_dorm': lambda a, w, d, D: [('xanadu_common_bed', cs(a / 8)), ('xanadu_common_chest', cs(a / 16)), ('xanadu_court_screen', cs(a / 60)), ('xanadu_court_harem_lattice', cs(a / 60)), ('xanadu_court_divan', cs(a / 100))],
      'cage': lambda a, w, d, D: [('xanadu_court_bed', cs(a / 150)), ('xanadu_court_divan', cs(a / 60)), ('xanadu_court_low_table', cs(a / 80)), ('xanadu_court_harem_lattice', cs(a / 30)), ('xanadu_court_cabinet', cs(a / 120)), ('xanadu_court_bookcase', 1), ('xanadu_common_planter', cs(a / 100))],
      'ledgers': lambda a, w, d, D: [('xanadu_common_desk', cs(a / 20)), ('xanadu_common_chair', cs(a / 20)), ('xanadu_common_bookcase', cs(a / 25)), ('xanadu_court_desk', 1), ('xanadu_court_strongbox', 2), ('xanadu_court_card_cabinet', 2)],
      'assay': lambda a, w, d, D: [('xanadu_common_assay_furnace', 1), ('xanadu_common_workbench', cs(a / 40)), ('xanadu_common_wall_shelves', cs(a / 40)), ('xanadu_common_desk', 1), ('xanadu_court_strongbox', 1)],
      'ramp': lambda a, w, d, D: [('xanadu_court_lamp', 4)],
      'throne': lambda a, w, d, D: [('xanadu_court_great_divan', 1), ('xanadu_court_divan', 6), ('xanadu_court_low_table', 4), ('xanadu_court_screen', 2), ('xanadu_court_fire', 2), ('xanadu_court_statue', 4), ('xanadu_court_banner', 6), ('xanadu_court_incense_burner', 4)],
      'bedchamber': lambda a, w, d, D: [('xanadu_court_bed', 1), ('xanadu_court_great_divan' if a > 500 else 'xanadu_court_divan', 2), ('xanadu_court_cabinet', 2), ('xanadu_court_low_table', 2), ('xanadu_court_screen', 2), ('xanadu_court_hearth', 1), ('xanadu_court_hoist', 1 if a > 500 else 0), ('xanadu_court_jug', 1)],
      'bath': lambda a, w, d, D: [('xanadu_court_bath_pool', 1), ('xanadu_court_wall_fountain', 2), ('xanadu_court_divan', 2), ('xanadu_court_screen', 2), ('xanadu_court_hoist', 1 if D >= 4 else 0), ('xanadu_court_fire', 1)],
      'pavilion': lambda a, w, d, D: [('xanadu_court_great_divan' if D >= 4 else 'xanadu_court_divan', 1), ('xanadu_court_divan', 4), ('xanadu_court_low_table', 3), ('xanadu_court_wall_fountain', 1), ('xanadu_court_lattice_box', 1 if D >= 4 else 0), ('xanadu_court_incense_burner', 2), ('xanadu_common_planter', 4)],
      'music': lambda a, w, d, D: [('xanadu_court_musicians_dais', 1), ('xanadu_common_chair', cs(a / 20)), ('xanadu_court_lattice_box', 1 if D >= 3 else 0), ('xanadu_common_chest', 2)],
      'divan': lambda a, w, d, D: [('xanadu_court_throne', 1), ('xanadu_court_divan', 10), ('xanadu_court_low_table', 4), ('xanadu_court_desk', 2), ('xanadu_common_chair', 6), ('xanadu_court_screen', 3), ('xanadu_court_cabinet', 2), ('xanadu_court_map_table', 1)],
    })
    return P

def draw_section():
    f_t = B.font(40, True); f = B.font(20); fs = B.font(17)
    W, H = 2400, 900; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Section south to north: gate, First Court, the Pleasure Dome, the Golden Way, the Sultan\'s Palace (heights x2)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), 'The plateau steps in 1.5 m garden tiles (drawn flat); the kit\'s storeys; the Dome\'s drum and dome from the build.', font=f, fill=(70, 70, 70))
    sx = 7.0; sy = 9.0; ox = 160; base = H - 140
    def X(v): return ox + (v - 15) * sx
    def Y(h): return base - h * sy
    dr.rectangle([0, Y(0), W, H], fill=(228, 214, 190))
    for v0, v1, h, name, col in [(20, 32, 11, 'Citadel Gate', (212, 226, 176)), (40, 78, 9, 'Barracks / Master of Mines (flanks)', (236, 232, 218)),
                                 (95, 100, 3, 'garden gate', (236, 232, 218)), (100, 150, 0.2, '', (214, 236, 250)), (150, 190, 10.2, 'Hall of Feasts', (238, 220, 150)), (190, 203, 8, 'musicians / kitchens', (236, 232, 218)),
                                 (205, 215, 4, 'Golden Way', (238, 220, 150)), (215, 222, 11, 'gate iwan', (236, 232, 218)), (222, 258, 0.2, '', (214, 236, 250)), (258, 298, 10.2, 'white base: audience below, the Sultan above', (250, 250, 240)), (298, 305, 7, 'curtain', (236, 232, 218))]:
        if h > 0.5: dr.rectangle([X(v0), Y(h), X(v1), Y(0)], fill=col, outline=(30, 30, 30), width=2)
        else: dr.rectangle([X(v0), Y(0.4), X(v1), Y(0)], fill=col, outline=(30, 30, 30), width=1)
        if name: dr.text((X(v0) + 4, Y(h) - 22), name, font=fs, fill=(0, 0, 0))
    dr.pieslice([X(150), Y(10.2 + 4.2 + 9.2 * 2), X(190), Y(10.2 + 4.2 - 9.2 * 2 + 9.2 * 2 - 9.2 * 2 + 9.2 * 2)], 180, 360, fill=(120, 190, 190), outline=(30, 30, 30), width=2)
    dr.rectangle([X(150), Y(10.2 + 4.2), X(190), Y(10.2)], fill=(238, 220, 150), outline=(30, 30, 30), width=2); dr.text((X(152), Y(10.2 + 4.2) + 4), 'mosaic drum', font=fs, fill=(0, 0, 0))
    dr.text((X(150), Y(10.2 + 4.2 + 18.4) - 24), 'the great turquoise dome', font=fs, fill=(0, 90, 90))
    dr.rectangle([X(266), Y(10.2 + 8), X(292), Y(10.2)], fill=(214, 180, 120), outline=(30, 30, 30), width=2); dr.text((X(266) + 4, Y(18.2) + 4), 'ochre block', font=fs, fill=(0, 0, 0))
    for v in (272, 286): dr.pieslice([X(v) - 3.4 * sx, Y(18.2 + 2.2 + 3.4), X(v) + 3.4 * sx, Y(18.2 + 2.2 - 3.4)], 180, 360, fill=(120, 190, 190), outline=(30, 30, 30), width=2)
    dr.text((X(266), Y(26) - 24), 'twin turquoise domes', font=fs, fill=(0, 90, 90))
    dr.line([(X(290), Y(0)), (X(290), Y(18.2))], fill=(160, 0, 120), width=5); dr.text((X(290) + 6, Y(18.2) - 24), 'Ramp of the Sultan', font=fs, fill=(160, 0, 120))
    dr.text((X(100), Y(0) + 30), 'chahar bagh and the reflecting pool', font=fs, fill=(0, 90, 0)); dr.text((X(222), Y(0) + 30), 'forecourt and the long pool', font=fs, fill=(0, 90, 0))
    dr.text((X(30), Y(0) + 60), 'the Vizier\'s palace, the officers\' houses, the temple and the envoys\' house stand off this line', font=fs, fill=(80, 80, 80))
    return img

def main():
    B.KEYMAP.update(LS.keymap()); B.EXTRA_PROGRAMS.update(programs())
    for k in list(B.NEW):
        if not k.startswith('xanadu_') or k not in E_NEW: B.NEW.pop(k)
    B.NEW.update(E_NEW); B.CITY.clear()
    intro = ('Generated by `citadel_blueprint.py` (on `settlements/voth/palace/blueprint.py`) from the same room data as the sheets. Keys are catalog pieces (`kits/catalog`): `xanadu_court_*` (the Sultan\'s gold: canopied lacquer beds, audience divans, gold lanterns and candelabra, wheel hangings, guardian lions, jade bowls) and `xanadu_common_*`, `xanadu_court_incense_burner`, `xanadu_common_prayer_wheels`, `generic_trade_*`. A key marked **NEW** is not in the catalog yet; the list is at the end. Counts are a brief for the furnisher, not a placement.\n')
    B.main(floors=FLOORS, out=OUT, here=HERE, title='# Erewhon\'s citadel: furniture manifest\n', intro=intro, section=draw_section, zone_R=160)

if __name__ == '__main__':
    main()
