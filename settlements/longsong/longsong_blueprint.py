#!/usr/bin/env python3
"""Longsong, the main monastery of the History Monks at Oidong: the blueprint. Sheets and the manifest come from
settlements/voth/palace/blueprint.py.

Frame: u runs from the Great Gate uphill along the main axis (the gate is at u = -110, drawn on the left; the rock
and the main mass are at the back, u > 0); v across. Metres. The walled grounds are 220 x 220 m (four times the
Islander Port Authority block, 2 x 2): the lower ward on the flat in front (u -110..0), the rock behind it rising
about 20 m, the main mass on the rock (u 10..100, v -60..60 at its base, stepping back as it climbs), the Red
Palace on top (u 58..100, v -40..40), the Vault cut into the rock beneath it. Storeys 4.5 m.

    python3 longsong_blueprint.py        # writes floors/*.png and FURNITURE.md next to this file
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'voth', 'palace'))
import blueprint as B
from blueprint import R, box
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'floors')

GSTAIR = (28, 40, -6, 6)      # the Great Stair inside the mass: the stair hall at every level up to the Red vestibule
DSTAIR = (92, 100, 24, 32)    # the Deep Stair: the Red Palace's east strip down to the Vault, passing L1 (keepers only)
WSTAIR = (40, 46, 28, 34)     # the east service stair (kitchens, bath, laundry, library)
ESTAIR = (40, 46, -34, -28)   # the west service stair (school, labs, cells)
MASS = dict(R=70, rect=(10, 100, -60, 60))

FLOORS = []

# ---- L0 the grounds (400 x 400 m)
GROUNDS = dict(R=208, rect=(-200, 200, -200, 200))
FLOORS.append(dict(GROUNDS, id='L0', tier=0, title='Sheet L0: the grounds (400 x 400 m inside the wall)',
  sub='the Great Gate and the pilgrims\' square; the lower ward either side of the avenue in three rows (printing and paper, workshops and smiths, the wardens; caravanserai, hostel and the Geomancers\' lodge, the lay servants and the valley\'s market, the dairy and the pilgrims\' camp); the rock behind with the Great Stair up its face; the outer kora round the rock with the drum rows at its foot; the physic terraces and orchards west, the hermits\' cliff and groves east, the spring gardens behind.',
  outlines=[(15, 150, -90, 90, 'main mass, level 1'), (37, 150, -90, 90, 'level 2'), (60, 150, -82, 82, 'White Palace, levels 3 and 4'), (87, 150, -60, 60, 'Red Palace')],
  rooms=[
    R(1, 'Great Gate', 'entrance', -208, -198, -12, 12, 3, 'the Order\'s parabolic gate between two battered pylons (the chapterhouses\' forecourt gate), set in a Xanadu dzong wall; the valley road'),
    R(2, 'Pilgrims\' Square', 'court', -192, -122, -45, 45, 2, 'the drum circuit begins here; tea sellers at festivals; the stele of the Order\'s vow'),
    R(3, 'The Avenue', 'passage', -122, -12, -8, 8, 2, 'poplars and lamp posts to the foot of the rock'),
    R(4, 'Gatehouse Guard', 'guard', -198, -184, 12, 28, 1, 'the Wardens of the gate'),
    R(5, 'Gatehouse Guard', 'guard', -198, -184, -28, -12, 1),
    R(6, 'Paper Mill', 'paper_mill', -190, -140, -90, -50, 1, 'on the mill race: vats, presses, drying lofts'),
    R(7, 'Printing House', 'printing_house', -130, -70, -90, -50, 2, 'woodblocks and the press: the Order\'s copies for the chapterhouses'),
    R(8, 'Granaries and Oil', 'store', -60, -12, -90, -50, 0),
    R(9, 'Smiths and Founders', 'forge', -190, -140, -150, -100, 1),
    R(10, 'Workshops Court', 'court', -130, -60, -150, -100, 1, 'open; the workshops round it: potters, dyers, the tool makers'),
    R(11, 'Wardens\' Barracks', 'barracks', -55, -12, -150, -100, 1, 'the Order\'s own guard: a hundred wardens'),
    R(12, 'Orchard of the Ward', 'garden', -190, -140, -196, -160, 2),
    R(13, 'Glass and Lens Workshop', 'lens_workshop', -130, -95, -196, -160, 1, 'for the instruments'),
    R(14, 'Carpenters and Joiners', 'workshop', -95, -60, -196, -160, 1),
    R(15, 'Wardens\' Drill Ground', 'drill', -55, -12, -196, -160, 1),
    R(16, 'Mill Race', 'cistern', -196, -100, -96, -90, 0),
    R(17, 'Caravanserai and Stables', 'caravanserai', -190, -130, 50, 90, 1, 'traders and the pack beasts; the courtyard'),
    R(18, 'Pilgrims\' Hostel', 'hostel', -120, -70, 50, 90, 1),
    R(19, 'Geomancers\' Lodge', 'lodge', -60, -12, 50, 90, 3, 'a walled compound for the friends from Yuni; its own shrine and bath'),
    R(20, 'Lay Servants\' Quarters', 'dormitory', -190, -140, 100, 150, 0),
    R(21, 'Valley Market and Tea Houses', 'market', -130, -60, 100, 150, 1, 'the valley\'s folk trade and drink here on festival days'),
    R(22, 'Infirmary of the Ward', 'infirmary', -55, -12, 100, 150, 1, 'for the lay folk and travellers; the monks\' own is in the mass'),
    R(23, 'Dairy and Beast Pens', 'stable', -190, -140, 160, 196, 0),
    R(24, 'Pilgrims\' Camp Ground', 'court', -130, -60, 160, 196, 1, 'tents on festival days'),
    R(25, 'Kitchen Gardens of the Ward', 'garden', -55, -12, 160, 196, 1),
    R(26, 'The Great Stair', 'stair', -12, 18, -15, 15, 3, 'zigzags up the rock face to the mass\'s lower gate'),
    R(27, 'Prayer-drum Row', 'kora', 0, 10, -90, -15, 2, 'the pilgrims\' circuit: turning drums along the rock\'s foot'),
    R(28, 'Prayer-drum Row', 'kora', 0, 10, 15, 90, 2),
    R(29, 'Outer Kora (west)', 'kora', 0, 165, -102, -92, 2, 'the walk round the rock'),
    R(30, 'Outer Kora (east)', 'kora', 0, 165, 92, 102, 2),
    R(31, 'Physic Terraces', 'garden', 0, 150, -160, -108, 2, 'the herb terraces; the apothecary\'s drying house'),
    R(32, 'Orchard Terraces', 'garden', 0, 150, -196, -164, 2, 'apricots and walnuts on the warm side'),
    R(33, 'Hermits\' Cliff', 'hermitage', 30, 150, 108, 122, 2, 'cells cut in the rock face, reached by ladders; the masters\' retreats'),
    R(34, 'Hermits\' Walk', 'garden', 30, 150, 122, 160, 2),
    R(35, 'Meditation Groves', 'garden', 30, 150, 164, 196, 3, 'cypress and juniper; stone seats; silence'),
    R(36, 'Spring Garden and the Pool', 'garden', 165, 200, -92, 92, 3, 'the spring behind the mass; a pool, willows, the kora passes'),
    R(37, 'Upper Orchards', 'garden', 165, 200, -196, -102, 2),
    R(38, 'Reservoir of the Spring', 'cistern', 165, 200, 102, 130, 0, 'the stone tank that feeds the mass\'s cisterns and the fields'),
    R(43, 'Barley Terraces', 'garden', 165, 200, 130, 196, 1, 'the monastery\'s own grain; the threshing floor by the reservoir'),
    R(44, 'Beehives and Dye Garden', 'garden', -130, -60, -160, -150, 1, 'between the workshops and the lens house; wax for the lamps, indigo for the Order\'s blue'),
    R(39, 'West Postern', 'entrance', -12, 0, -200, -190, 1),
    R(40, 'East Postern', 'entrance', -12, 0, 190, 200, 1),
    R(41, 'Rear Postern', 'entrance', 200, 208, -10, 10, 1, 'the hermits\' and the spring-keepers\' door'),
    R(42, 'Main Mass (see L1 to LR)', 'void', 15, 150, -90, 90, 3, 'on the rock, 30 m above the ward'),
  ]))

# ---- LV the Vault
FLOORS.append(dict(R=50, rect=(58, 100, -40, 40), id='LV', tier=-1, title='Sheet LV: the Vault (in the rock under the Red Palace)',
  sub='the containment side: one way in, the Deep Stair from the Red Palace\'s east strip past level 1, through the Warden\'s gate. The open vault of study pieces, the closed vault of dangerous technology, the quiet cells for the time relics (one each, lead-lined, a bell at the door), the Unmaking Room, and the Sealed Library of forbidden records with its single reading room and the Oath Room before it.',
  rooms=[
    box(1, 'Deep Stair (foot)', 'stair', DSTAIR, 1),
    R(2, 'Warden\'s Gate', 'guard', 84, 92, 24, 40, 1, 'two wardens day and night; the keys are split'),
    R(3, 'Keepers\' Vestibule', 'vestibule', 62, 84, 24, 40, 2, 'robing, the register of entries, the lamps lit here'),
    R(4, 'Open Vault', 'open_vault', 62, 84, 0, 24, 2, 'the study pieces in their cases: what a master may take to the Restoration Halls'),
    R(5, 'Closed Vault', 'closed_vault', 84, 100, -16, 24, 1, 'the dangerous technology, crated and sealed; two keepers to open any crate'),
    R(6, 'Quiet Passage', 'passage', 62, 84, -6, 0, 1, 'lamps only; no clocks'),
  ] + [R(7 + i, 'Quiet Cell', 'quiet_cell', 62 + i * 7, 69 + i * 7, -16, -6, 1, 'one time relic; lead-lined; a bell at the door') for i in range(3)]
    + [
    R(10, 'Unmaking Room', 'unmaking', 84, 100, -32, -16, 0, 'the furnace and the acid vats: what the Order decides must not exist'),
    R(11, 'Oath Room', 'antechamber', 62, 76, -28, -16, 2, 'the reader swears before the Sealed Library\'s one door'),
    R(12, 'Sealed Library: the Reading Room', 'reading_room', 62, 76, -40, -28, 3, 'one desk, one lamp, one reader'),
    R(13, 'Sealed Library: the Stacks', 'sealed_library', 76, 100, -40, -32, 1, 'the forbidden records; the Librarian of the Seal alone'),
    R(14, 'Keepers\' Lodge', 'dormitory', 62, 76, 0, 12, 1, 'the two keepers on watch sleep here'),
    R(15, 'Cistern of the Rock', 'cistern', 58, 62, -40, 40, 0),
  ]))

# ---- L1 the base level (y 0, the rock's top)
FLOORS.append(dict(MASS, id='L1', tier=0, title='Sheet L1: the main mass, level 1 (the base, on the rock)',
  sub='the lower gate at the Great Stair\'s head, the hall of pillars, the stores and cisterns west, the Closed Ward east with its garden on the open step, the keepers\' quarters and the heavy workshop behind under the Red Palace; the Deep Stair passes through to the Vault.',
  outlines=[(25, 100, -60, 60, 'level 2 above'), (58, 100, -40, 40, 'Red Palace above')],
  rooms=[
    R(1, 'Lower Gate', 'entrance', 10, 16, -8, 8, 3, 'the Great Stair arrives; a painted-column portico between two drum pavilions under tile cones (the chapterhouses\' paired drums)'),
    R(2, 'Wardens of the Gate', 'guard', 10, 25, 8, 15, 1),
    R(3, 'Wardens of the Gate', 'guard', 10, 25, -15, -8, 1),
    R(4, 'Hall of Pillars', 'hall', 16, 28, -8, 8, 3, 'the undercroft hall; the stair hall beyond'),
    box(5, 'Great Stair (hall)', 'stair', GSTAIR, 3, 'to every level up to the Red vestibule'),
    R(6, 'Granary', 'store', 10, 40, -60, -15, 0, 'barley and the valley\'s tithe'),
    R(7, 'Cisterns', 'cistern', 40, 58, -60, -40, 0),
    R(8, 'Oil, Salt and Tea Store', 'store', 40, 58, -40, -15, 0),
    R(9, 'Firewood and Dung Store', 'store', 58, 80, -60, -40, 0),
    R(10, 'Lamp Oil and Wax', 'store', 80, 100, -60, -40, 0),
    R(11, 'Keepers\' Quarters', 'dormitory', 58, 92, -40, -8, 1, 'the keepers of the Vault live over it'),
    R(12, 'Keepers\' Hall', 'servants_hall', 58, 92, -8, 8, 1),
    box(13, 'Deep Stair (passing)', 'stair', DSTAIR, 1, 'no door at this level'),
    R(14, 'Heavy Workshop of the Restorers', 'forge', 58, 92, 8, 24, 1, 'forge, lathes and presses for the labs above'),
    R(15, 'Workshop Stores', 'store', 92, 100, -40, 24, 0),
    R(16, 'Ward Door and Warden', 'guard', 25, 32, 15, 25, 1, 'the one door of the Closed Ward'),
    R(17, 'Ward Garden (open to the sky)', 'court', 10, 25, 15, 55, 2, 'the step below level 2: a walled garden the ward looks onto'),
    R(18, 'Closed Ward: the Hall', 'reception', 32, 46, 15, 40, 2, 'the Touched and the fallen Historians eat and sit here; a physician always'),
  ] + [R(19 + i, 'Ward Cell', 'ward_cell', 46 + 7 * (i % 2), 53 + 7 * (i % 2), 15 + 8 * (i // 2), 23 + 8 * (i // 2), 2, 'a bed, a desk, a window on the garden') for i in range(10)]
    + [
    R(29, 'Ward Physician', 'infirmary', 32, 46, 40, 55, 2),
    R(30, 'Specimen Hall', 'specimen', 25, 46, 55, 60, 1, 'what comes back from the Lizardmen\'s country, in jars'),
    R(31, 'Ward Corridor', 'passage', 25, 60, 10, 15, 1),
    R(32, 'Ward Stores', 'store', 60, 100, 24, 60, 0),
  ]))

# ---- L2 the school (y 4.5)
FLOORS.append(dict(MASS, id='L2', tier=0, title='Sheet L2: level 2, the School of Operatives',
  sub='where Keepwell\'s proven operatives are taught: the drill hall, four lecture halls, the trainees\' cells, the Debate Court open to the sky at the heart of the White Palace; the infirmary, the bath house, the laundry and the lay servants east.',
  outlines=[(40, 100, -55, 55, 'White Palace above'), (58, 100, -40, 40, 'Red Palace above')],
  rooms=[
    box(1, 'Great Stair (hall)', 'stair', GSTAIR, 3),
    R(2, 'Hall of Arrival', 'vestibule', 25, 40, -12, 12, 3, 'the newcomer\'s first room: the masters receive here'),
    R(3, 'Debate Court (open to the sky)', 'debate_court', 40, 65, -25, 25, 3, 'the Tibetan debating court: questions and the clap of hands; festivals; the Assembly Hall\'s drum at its head; curved arcaded galleries on both sides, as the chapterhouses\' wings'),
    R(4, 'Court Colonnade', 'passage', 40, 65, 25, 28, 2), R(5, 'Court Colonnade', 'passage', 40, 65, -28, -25, 2),
    R(6, 'Drill Hall', 'drill', 25, 55, -60, -28, 1, 'two storeys; posts, ropes, the lanes; the operatives\' art'),
    R(7, 'Lecture Hall: the Cataclysm', 'lecture', 55, 67, -60, -28, 2),
    R(8, 'Lecture Hall: the Peoples', 'lecture', 67, 79, -60, -28, 2),
    R(9, 'Lecture Hall: the Machines', 'lecture', 79, 91, -60, -28, 2),
    R(10, 'Lecture Hall: the Discipline of Acting', 'lecture', 91, 100, -60, -28, 2, 'when a Historian acts and when not'),
    R(11, 'Trainees\' Cells', 'dormitory', 65, 100, -25, -5, 1, 'two to a cell; the operatives in training'),
    R(12, 'Trainees\' Cells', 'dormitory', 65, 100, 5, 25, 1),
    R(13, 'Trainees\' Corridor', 'passage', 65, 100, -5, 5, 1),
    R(14, 'Infirmary of the Monks', 'infirmary', 25, 55, 28, 60, 2, 'wards and the apothecary; the physic terraces supply it'),
    R(15, 'Bath House', 'bath', 55, 75, 28, 60, 2, 'hot room under a dome, cold basins'),
    R(16, 'Laundry and Latrines', 'laundry', 75, 90, 28, 60, 0),
    R(17, 'Lay Servants\' Hall', 'servants_hall', 90, 100, 28, 60, 1),
    box(18, 'West Service Stair', 'stair', ESTAIR, 1), box(19, 'East Service Stair', 'stair', WSTAIR, 1),
    R(20, 'Masters of Arms', 'office', 25, 40, 12, 28, 2),
    R(21, 'Master of Novices', 'office', 25, 40, -28, -12, 2, 'keeps the register of the proven'),
  ]))

# ---- L3 the White Palace, lower (y 9)
FLOORS.append(dict(dict(MASS, rect=(40, 100, -55, 55), R=60), id='L3', tier=1, title='Sheet L3: level 3, the White Palace lower: the Assembly Hall, the cells, the refectory',
  sub='the Great Assembly Hall two storeys tall under its skylight columns (the dormitory plan\'s circle); the monks\' cells in the west range; the refectory, the kitchen and the tea hall east; the Debate Court\'s void with its gallery.',
  outlines=[(58, 100, -40, 40, 'Red Palace above')],
  rooms=[
    box(1, 'Great Stair (hall)', 'stair', GSTAIR, 3),
    R(2, 'Debate Court (void)', 'void', 40, 65, -25, 25, 3),
    R(3, 'Court Gallery', 'gallery', 40, 65, 25, 28, 2), R(4, 'Court Gallery', 'gallery', 40, 65, -28, -25, 2),
    R(5, 'Hall of Welcome', 'antechamber', 65, 68, -28, 28, 3, 'the porch of the Assembly Hall over the court'),
    R(6, 'Great Assembly Hall', 'assembly', 68, 100, -28, 28, 4, 'two storeys; a great drum under a tile cone and lantern as the chapterhouses\' reading halls are, the ring of skylight columns inside it, round relief-ringed windows; the whole Order sits here; the abbot\'s seat at the far end'),
    R(7, 'Monks\' Cells (west range)', 'cells', 40, 100, -55, -28, 1, 'one to a cell along a corridor; a window each on the valley'),
    R(8, 'Refectory', 'servants_hall', 40, 68, 28, 55, 2, 'long tables; a reader\'s pulpit; silence'),
    R(9, 'Kitchen', 'kitchen', 68, 90, 28, 55, 1, 'tea in the great coppers; the bakehouse'),
    R(10, 'Tea Hall and Stores', 'buttery', 90, 100, 28, 55, 1),
    box(11, 'West Service Stair', 'stair', ESTAIR, 1), box(12, 'East Service Stair', 'stair', WSTAIR, 1),
  ]))

# ---- L4 the White Palace, upper (y 13.5)
FLOORS.append(dict(dict(MASS, rect=(40, 100, -55, 55), R=60), id='L4', tier=1, title='Sheet L4: level 4, the White Palace upper: testimony, the Restoration Halls, the library, the scriptorium',
  sub='the Hall of Testimony where returning operatives are heard; the Restoration Halls (the Order\'s laboratories for salvaged technology) west; the Library\'s reading rooms, the scriptorium and the bindery east; the Assembly Hall\'s gallery.',
  outlines=[(58, 100, -40, 40, 'Red Palace above')],
  rooms=[
    box(1, 'Great Stair (hall)', 'stair', GSTAIR, 3),
    R(2, 'Debate Court (void)', 'void', 40, 65, -25, 25, 3),
    R(3, 'Court Gallery', 'gallery', 40, 65, 25, 28, 2), R(4, 'Court Gallery', 'gallery', 40, 65, -28, -25, 2),
    R(5, 'Assembly Hall: gallery (void)', 'gallery_void', 68, 100, -28, 28, 4, 'the skylight columns pass through'),
    R(6, 'Hall of Testimony', 'testimony', 40, 62, -55, -28, 3, 'the returned operative tells all before three masters; the Chronicle takes it down'),
    R(7, 'Restoration Hall: Instruments', 'restoration', 62, 78, -55, -28, 2, 'lenses, clocks, the measuring of things'),
    R(8, 'Restoration Hall: Machines', 'restoration', 78, 92, -55, -28, 2),
    R(9, 'Cold Room of the Ancients', 'restoration', 92, 100, -55, -28, 2, 'the electronics, kept dry and dark'),
    R(10, 'Library Reading Rooms', 'reading_room', 40, 62, 28, 55, 3, 'the open library: any monk may read here'),
    R(11, 'Scriptorium', 'scriptorium', 62, 86, 28, 55, 2, 'copyists; the woodblock cutters'),
    R(12, 'Bindery', 'bindery', 86, 100, 28, 55, 1),
    R(13, 'Loggia of the Court', 'gallery', 40, 44, -25, 25, 3, 'over the Hall of Arrival; the masters watch the debates'),
    box(14, 'West Service Stair', 'stair', ESTAIR, 1), box(15, 'East Service Stair', 'stair', WSTAIR, 1),
  ]))

RED = dict(R=50, rect=(58, 100, -40, 40))
# ---- R1 the Red Palace, first level (y 18)
FLOORS.append(dict(RED, id='R1', tier=2, title='Sheet R1: the Red Palace, first level: the Hall of the Founders and the inner kora',
  sub='the sacred heart: the Hall of the Founders two storeys tall with the reliquaries of the first Historians and the great abbots, the inner kora round it (the Jokhang\'s Nangkor), the Chapel of the Lost Monastery and the Lamp Hall west, the Archive\'s catalogue and the Deep Stair east, the Red Vestibule in front.',
  rooms=[
    R(1, 'Red Vestibule', 'vestibule', 58, 62, -22, 22, 4, 'the Great Stair\'s head; the doors of the Red Palace'),
    box(2, 'Great Stair (head)', 'stair', (58, 62, -30, -22), 3),
    R(3, 'Inner Kora', 'kora', 62, 98, -22, 22, 4, 'the circumambulation corridor round the hall: drums, murals of the Cataclysm, butter lamps'),
    R(4, 'Hall of the Founders', 'founders_hall', 66, 94, -18, 18, 4, 'two storeys; the reliquary chortens of the founders and the abbots; the altar of the Order; the first Chronicle under glass'),
    R(5, 'Chapel of the Lost Monastery', 'lost_chapel', 62, 84, -40, -22, 4, 'an empty hall: the names of what burned under the Lesser Throne on its walls; one lamp'),
    R(6, 'Lamp Hall', 'lamp_hall', 84, 100, -40, -22, 3, 'the butter lamps are filled and kept here'),
    R(7, 'Catalogue of the Archive', 'catalogue', 62, 84, 22, 40, 3, 'the cabinets of cards; the Archivist\'s desk'),
    R(8, 'Archivist and the Keepers\' Door', 'office', 84, 92, 22, 40, 3, 'the one door to the Deep Stair'),
    box(9, 'Deep Stair (head)', 'stair', DSTAIR, 2, 'down to the Vault, keepers only'),
    R(10, 'Rear Kora Shrine', 'chapel', 94, 98, -8, 8, 4, 'behind the hall, in the kora: the shrine of the Discipline'),
  ]))
# ---- R2 (y 22.5)
FLOORS.append(dict(RED, id='R2', tier=2, title='Sheet R2: the Red Palace, second level: the Great Archive',
  sub='the stacks of the Order\'s archive on three sides, the gallery round the Founders\' hall, the conservators and the map room.',
  rooms=[
    R(1, 'Archive Stair', 'stair', 58, 62, -30, -22, 2),
    R(2, 'Archive Lobby', 'antechamber', 58, 62, -22, 22, 3),
    R(3, 'Founders\' Hall gallery (void)', 'gallery_void', 66, 94, -18, 18, 4),
    R(4, 'Gallery of the Hall', 'gallery', 62, 98, -22, 22, 3, 'a railed walk; the murals continue'),
    R(5, 'Archive Stacks I: the Peoples', 'archive_stacks', 62, 100, -40, -22, 2),
    R(6, 'Archive Stacks II: the Ancients', 'archive_stacks', 62, 84, 22, 40, 2),
    R(7, 'Conservators', 'restoration', 84, 100, 22, 40, 2, 'mending, the dry room'),
    R(8, 'Map Room', 'map_room', 94, 100, -22, 22, 3, 'the crater as the Order has measured it'),
  ]))
# ---- R3 (y 27)
FLOORS.append(dict(RED, id='R3', tier=2, title='Sheet R3: the Red Palace, third level: the Chronicle Hall, the Council, the Abbot',
  sub='over the Founders\' hall the Chronicle Hall, where the history of the world is written; the Council of the Order east; the Abbot\'s apartments west; the Hall of Stillness in front, where the time techniques are practised.',
  rooms=[
    R(1, 'Stair', 'stair', 58, 62, -30, -22, 2),
    R(2, 'Hall of Stillness', 'stillness', 58, 66, -22, 22, 4, 'the practice of the slow and the quick: cushions, no clocks, a single bell; masters only'),
    R(3, 'Chronicle Hall', 'chronicle', 66, 94, -18, 18, 4, 'the master Chronicle and its writers under the skylights of the gilded roof'),
    R(4, 'Chroniclers\' Cells', 'office', 94, 100, -22, 22, 2),
    R(5, 'Abbot\'s Antechamber', 'antechamber', 62, 74, -40, -22, 3),
    R(6, 'Abbot\'s Study', 'cabinet', 74, 88, -40, -22, 4),
    R(7, 'Abbot\'s Bedchamber', 'bedchamber', 88, 100, -40, -22, 3, 'a cell like the others, with a better window'),
    R(8, 'Council of the Order', 'council', 62, 88, 22, 40, 4, 'the abbot and the twelve masters; Keepwell\'s commander by letter'),
    R(9, 'Council Clerks', 'office', 88, 100, 22, 40, 2),
    R(10, 'Gallery (void over the hall)', 'passage', 66, 94, -22, -18, 3), R(11, 'Gallery', 'passage', 66, 94, 18, 22, 3),
  ]))
# ---- LR the roof (y 31.5)
FLOORS.append(dict(RED, id='LR', tier=3, title='Sheet LR: the roof: the gilded roofs, the Observatory, the Hall of Hours, the Eastern Watch',
  sub='the summit: the gilded roof over the Chronicle Hall and the Founders\' hall, the Observatory and the Hall of Hours (the Order\'s clocks: water, sand and the Ancient one), the Eastern Watch toward the Lizardmen\'s country with its instruments, the roof walk, the masters\' meditation cells.',
  rooms=[
    R(1, 'Stair House', 'stair', 58, 62, -30, -22, 1),
    R(2, 'Roof Walk', 'garden', 58, 100, -22, 22, 3, 'parapets, pennant lines, the view of the valley'),
    R(3, 'Gilded Roof of the Chronicle Hall', 'roof', 66, 94, -18, 18, 4, 'the gold hip roof with its horns and bells; skylights between the beams'),
    R(4, 'Observatory', 'astronomers', 62, 80, -40, -22, 3, 'the rings, the gnomon, the long glass'),
    R(5, 'Hall of Hours', 'hall_of_hours', 80, 100, -40, -22, 3, 'the Order keeps time: the water clock, the sand, the Ancient clock that still runs'),
    R(6, 'Eastern Watch', 'eastern_watch', 84, 100, 22, 40, 3, 'the Order\'s Sankore-type spire, bristling with toron, facing the Lizardmen\'s country: the bell at its top, the instruments that read the strangeness there in its room'),
    R(7, 'Masters\' Meditation Cells', 'meditation_cell', 62, 84, 22, 40, 2, 'six cells open to the roof walk'),
  ]))

# ------------------------------------------------------------------------------------------------ the Xanadu keys
def keymap():
    m = {}
    court = ['bed', 'throne', 'divan', 'table', 'low_table', 'desk', 'cabinet', 'bookcase', 'hearth', 'fire', 'lamp', 'candelabra', 'hanging', 'carpet', 'screen', 'tapestry', 'banner', 'frieze', 'wall_rug', 'scroll', 'painted_hanging', 'art', 'statue', 'jug', 'bowl']
    common = ['bed', 'bench', 'chair', 'stool', 'table', 'low_table', 'desk', 'chest', 'bookcase', 'wall_shelves', 'store', 'hearth', 'fire', 'lamp', 'candle', 'hanging', 'rug', 'screen', 'counter', 'workbench', 'loom', 'rack', 'ladder', 'board', 'art', 'banner', 'scroll', 'pennants', 'bowl', 'jug', 'books']
    for r in court: m['voth_court_' + r] = 'xanadu_court_' + r
    for r in common: m['voth_common_' + r] = 'xanadu_common_' + r
    m.update({
      'voth_court_armour_stand': 'generic_trade_armour_stand', 'voth_planter': 'xanadu_common_planter', 'voth_bench': 'xanadu_common_bench', 'voth_statue': 'xanadu_court_statue',
      'voth_street_brazier': 'xanadu_common_fire', 'voth_canoe': None, 'voth_craft_brewer': 'generic_trade_still', 'voth_loom_display': 'xanadu_common_loom',
      'voth_common_ash_niche': 'xanadu_common_prayer_wheels', 'voth_bread_oven': 'xanadu_common_hearth', 'voth_cell_grate': None, 'hl_rep_roofed_well': 'xanadu_common_well',
      'voth_court_sun_throne': 'xanadu_court_throne', 'voth_court_judge_dais': None, 'voth_court_wall_fountain': 'xanadu_court_wall_fountain',
      'voth_court_bath_slab': None, 'voth_court_bath_pool': 'xanadu_court_bath_pool', 'voth_court_sun_altar': 'xanadu_court_altar',
      'voth_court_staff_stand': None, 'voth_court_strongbox': 'xanadu_court_strongbox', 'voth_court_map_table': 'xanadu_court_map_table', 'voth_court_lectern': 'order_lectern',
      'voth_court_armillary': 'xanadu_court_armillary', 'voth_court_palanquin': None, 'voth_court_trophy_stand': None, 'voth_court_baldachin_bed': 'xanadu_court_bed',
      'voth_common_drum_stand': None, 'voth_common_spit': None, 'voth_common_cauldron': 'xanadu_common_tea_copper', 'voth_common_drying_rack': 'xanadu_common_drying_rack',
      'voth_common_copper': 'xanadu_common_tea_copper', 'voth_common_manacles': None, 'voth_common_pit_grate': None, 'voth_common_ice_box': None, 'voth_common_litter_rack': None,
      'voth_common_bath_basin': 'xanadu_common_bath_basin', 'generic_trade_training_dummy': 'xanadu_training_training_dummy', 'generic_trade_archery_butt': 'xanadu_training_archery_butt'})
    return m

LS_NEW = {
  'xanadu_common_planter': 'a planter (the kit has none indoors)', 'xanadu_common_well': 'a courtyard well',
  'xanadu_court_wall_fountain': 'a tiled wall fountain', 'xanadu_court_bath_pool': 'a sunken tiled pool under the bath\'s dome',
  'xanadu_court_altar': 'the altar of the Order: a lacquer table, the wheel, butter lamps', 'xanadu_court_strongbox': 'a gold-cornered strongbox',
  'xanadu_court_map_table': 'a map table with the crater inlaid','xanadu_court_armillary': 'the astronomers\' rings and gnomon',
  'xanadu_common_tea_copper': 'a great tea copper on its hearth', 'xanadu_common_drying_rack': 'a drying rack (paper, cloth, herbs)', 'xanadu_common_bath_basin': 'a stone basin',
  'xanadu_court_chorten': 'a reliquary chorten (stupa), gilt, with the founder\'s name', 'xanadu_common_meditation_cushion': 'a row of meditation cushions on a low platform',
  'xanadu_common_skylight_column': 'a skylight column: a painted column carrying a lantern well (the assembly hall\'s ring)', 'xanadu_court_card_cabinet': 'a catalogue cabinet of small drawers',
  'xanadu_common_scroll_rack': 'a scroll rack: pigeonholes for rolled records', 'xanadu_common_relic_case': 'a glass relic case on a lacquer stand', 'xanadu_common_relic_crate': 'a sealed, banded crate',
  'xanadu_common_lead_case': 'a lead-lined case on a stone block, with its bell', 'xanadu_common_furnace': 'the unmaking furnace and its acid vats', 'xanadu_common_water_clock': 'the water clock',
  'xanadu_common_ancient_clock': 'the Ancient clock that still runs (unique)', 'xanadu_common_anomaly_instrument': 'an instrument of the Eastern Watch: brass, glass and a needle that should not move',
  'xanadu_common_press': 'the printing press and its woodblock table', 'xanadu_common_paper_vat': 'a paper vat and its moulds', 'xanadu_common_debate_dais': 'the debating dais and the questioner\'s stone',
  'xanadu_court_name_wall': 'the wall of names (a carved panel)', 'xanadu_common_specimen_jar': 'a specimen jar on a shelf',
}
def programs():
    cs = lambda n: max(1, round(n))
    return {
      'kora': lambda a, w, d, D: [('xanadu_common_prayer_wheels', cs(a / 12)), ('xanadu_common_candle', cs(a / 10)), ('xanadu_court_painted_hanging' if D >= 3 else 'xanadu_common_art', cs(a / 40))],
      'assembly': lambda a, w, d, D: [('xanadu_common_skylight_column', 12), ('xanadu_common_meditation_cushion', cs(a / 8)), ('xanadu_court_throne', 1), ('xanadu_court_altar', 1), ('xanadu_court_tapestry', cs(a / 40)), ('xanadu_common_candle', cs(a / 10)), ('xanadu_court_hanging', cs(a / 60)), ('xanadu_court_incense_burner', 4)],
      'founders_hall': lambda a, w, d, D: [('xanadu_court_chorten', 9), ('xanadu_court_altar', 1), ('xanadu_common_relic_case', 2), ('xanadu_common_candle', cs(a / 6)), ('xanadu_court_tapestry', cs(a / 30)), ('xanadu_court_statue', 2), ('xanadu_court_incense_burner', 6), ('xanadu_court_carpet', 2)],
      'lost_chapel': lambda a, w, d, D: [('xanadu_court_name_wall', 6), ('xanadu_common_candle', 1), ('xanadu_court_carpet', 1)],
      'lamp_hall': lambda a, w, d, D: [('xanadu_common_store', cs(a / 20)), ('xanadu_common_workbench', 2), ('xanadu_common_wall_shelves', cs(a / 30)), ('xanadu_common_candle', cs(a / 4))],
      'chapel': lambda a, w, d, D: [('xanadu_court_altar', 1), ('xanadu_common_candle', 8), ('xanadu_court_tapestry', 1)],
      'archive_stacks': lambda a, w, d, D: [('order_bookcase', cs(a / 10)), ('xanadu_common_scroll_rack', cs(a / 14)), ('order_library_ladder', cs(a / 100)), ('xanadu_common_desk', cs(a / 150)), ('xanadu_common_lamp', cs(a / 50))],
      'catalogue': lambda a, w, d, D: [('xanadu_court_card_cabinet', cs(a / 20)), ('xanadu_court_desk', 1), ('xanadu_common_desk', 3), ('xanadu_common_chair', 4), ('order_lectern', 2)],
      'reading_room': lambda a, w, d, D: [('order_reading_table', cs(a / 40)), ('xanadu_common_chair', cs(a / 12)), ('order_lectern', cs(a / 100)), ('order_bookcase', cs(a / 40)), ('order_globe_stand', cs(a / 150)), ('order_library_ladder', cs(a / 150)), ('xanadu_common_lamp', cs(a / 25))],
      'sealed_library': lambda a, w, d, D: [('order_bookcase', cs(a / 12)), ('xanadu_common_scroll_rack', cs(a / 16)), ('xanadu_court_strongbox', cs(a / 60)), ('xanadu_common_lamp', cs(a / 60))],
      'bindery': lambda a, w, d, D: [('generic_trade_press', cs(a / 60)), ('xanadu_common_workbench', cs(a / 40)), ('xanadu_common_wall_shelves', cs(a / 40)), ('xanadu_common_stool', cs(a / 40))],
      'printing_house': lambda a, w, d, D: [('xanadu_common_press', cs(a / 80)), ('xanadu_common_workbench', cs(a / 50)), ('xanadu_common_drying_rack', cs(a / 60)), ('xanadu_common_wall_shelves', cs(a / 50)), ('xanadu_common_stool', cs(a / 40))],
      'paper_mill': lambda a, w, d, D: [('xanadu_common_paper_vat', cs(a / 80)), ('generic_trade_press', cs(a / 150)), ('xanadu_common_drying_rack', cs(a / 50)), ('xanadu_common_workbench', cs(a / 100))],
      'lens_workshop': lambda a, w, d, D: [('generic_trade_lathe', 2), ('generic_trade_kiln', 1), ('xanadu_common_workbench', cs(a / 30)), ('xanadu_common_wall_shelves', 2), ('xanadu_common_stool', 4)],
      'restoration': lambda a, w, d, D: [('xanadu_common_workbench', cs(a / 30)), ('xanadu_common_relic_case', cs(a / 60)), ('xanadu_common_wall_shelves', cs(a / 40)), ('xanadu_common_stool', cs(a / 30)), ('xanadu_common_lamp', cs(a / 30)), ('xanadu_common_chest', cs(a / 80))],
      'debate_court': lambda a, w, d, D: [('xanadu_common_debate_dais', 1), ('xanadu_common_bench', cs(a / 40)), ('xanadu_common_planter', cs(a / 100))],
      'lecture': lambda a, w, d, D: [('order_writing_board', 2), ('order_master_chair', 1), ('order_pupil_desk', cs(a / 10)), ('order_mat_rack', 1), ('order_bookcase', 2)],
      'stillness': lambda a, w, d, D: [('xanadu_common_meditation_cushion', cs(a / 14)), ('xanadu_common_candle', 1), ('xanadu_court_screen', 2)],
      'meditation_cell': lambda a, w, d, D: [('xanadu_common_meditation_cushion', cs(a / 60)), ('xanadu_common_candle', cs(a / 60)), ('xanadu_common_rug', cs(a / 60))],
      'hermitage': lambda a, w, d, D: [('xanadu_common_meditation_cushion', cs(a / 80)), ('xanadu_common_bed', cs(a / 80)), ('xanadu_common_candle', cs(a / 80))],
      'testimony': lambda a, w, d, D: [('xanadu_court_desk', 3), ('xanadu_court_throne', 3), ('xanadu_common_chair', 1), ('xanadu_common_desk', 1), ('xanadu_court_screen', 2), ('xanadu_court_tapestry', 2)],
      'chronicle': lambda a, w, d, D: [('order_lectern', 1), ('xanadu_common_desk', cs(a / 25)), ('xanadu_common_chair', cs(a / 25)), ('xanadu_court_bookcase', cs(a / 60)), ('xanadu_court_hanging', cs(a / 80)), ('xanadu_court_tapestry', cs(a / 60))],
      'cells': lambda a, w, d, D: [('xanadu_common_bed', cs(a / 14)), ('xanadu_common_chest', cs(a / 14)), ('xanadu_common_desk', cs(a / 14)), ('xanadu_common_candle', cs(a / 14)), ('xanadu_common_prayer_wheels', cs(a / 200))],
      'ward_cell': lambda a, w, d, D: [('xanadu_common_bed', 1), ('xanadu_common_desk', 1), ('xanadu_common_chair', 1), ('xanadu_common_rug', 1), ('xanadu_common_candle', 1)],
      'specimen': lambda a, w, d, D: [('xanadu_common_wall_shelves', cs(a / 15)), ('xanadu_common_specimen_jar', cs(a / 3)), ('xanadu_common_workbench', 1), ('xanadu_common_lamp', 2)],
      'open_vault': lambda a, w, d, D: [('xanadu_common_relic_case', cs(a / 15)), ('xanadu_common_wall_shelves', cs(a / 40)), ('xanadu_common_desk', 1), ('xanadu_common_lamp', cs(a / 40))],
      'closed_vault': lambda a, w, d, D: [('xanadu_common_relic_crate', cs(a / 10)), ('xanadu_court_strongbox', cs(a / 40)), ('xanadu_common_lamp', cs(a / 60))],
      'quiet_cell': lambda a, w, d, D: [('xanadu_common_lead_case', 1), ('xanadu_common_candle', 1)],
      'unmaking': lambda a, w, d, D: [('xanadu_common_furnace', 1), ('generic_trade_vat', 2), ('xanadu_common_workbench', 2), ('xanadu_common_rack', 1)],
      'hall_of_hours': lambda a, w, d, D: [('xanadu_common_water_clock', 1), ('xanadu_common_ancient_clock', 1), ('xanadu_court_desk', 1), ('xanadu_common_board', 2), ('xanadu_common_bookcase', 2), ('xanadu_court_armillary', 1)],
      'eastern_watch': lambda a, w, d, D: [('xanadu_common_anomaly_instrument', 4), ('xanadu_court_armillary', 1), ('xanadu_common_desk', 2), ('xanadu_common_chair', 2), ('xanadu_common_board', 1)],
      'caravanserai': lambda a, w, d, D: [('generic_trade_trough', cs(a / 100)), ('generic_trade_hayrack', cs(a / 100)), ('xanadu_common_bed', cs(a / 40)), ('xanadu_common_table', cs(a / 100)), ('xanadu_common_bench', cs(a / 60)), ('xanadu_common_store', cs(a / 80))],
      'hostel': lambda a, w, d, D: [('xanadu_common_bed', cs(a / 10)), ('xanadu_common_chest', cs(a / 20)), ('xanadu_common_table', cs(a / 80)), ('xanadu_common_bench', cs(a / 40)), ('xanadu_common_hearth', cs(a / 200))],
      'market': lambda a, w, d, D: [('generic_trade_stall', cs(a / 80)), ('xanadu_common_counter', cs(a / 100)), ('xanadu_common_table', cs(a / 60)), ('xanadu_common_bench', cs(a / 40)), ('xanadu_common_hearth', cs(a / 300))],
      'stable': lambda a, w, d, D: [('generic_trade_trough', cs(a / 60)), ('generic_trade_hayrack', cs(a / 60)), ('xanadu_common_rack', 2)],
      'roof': lambda a, w, d, D: [], 'void': lambda a, w, d, D: [],
      'barracks': lambda a, w, d, D: [('generic_trade_bunk', cs(a / 8)), ('generic_trade_locker', cs(a / 16)), ('xanadu_common_table', cs(a / 150)), ('xanadu_common_bench', cs(a / 75)), ('generic_trade_weapon_rack', cs(a / 100))],
    }

def draw_section():
    f_t = B.font(40, True); f = B.font(20); fs = B.font(17)
    W, H = 2400, 980; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Section along the main axis (u): the ward, the rock, the mass and the Red Palace (heights x2)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), 'The rock\'s 20 m and the storeys of 4.5 m are assumptions for the build to settle; the gate is on the left.', font=f, fill=(70, 70, 70))
    sx = 8.5; sy = 9.0; ox = W / 2 + 60; base = H - 160
    def X(u): return ox + u * sx
    def Y(h): return base - h * sy
    # the ground: flat ward, then the rock
    rock = [(X(-115), Y(0)), (X(-2), Y(0)), (X(10), Y(20)), (X(100), Y(20)), (X(110), Y(14)), (X(118), Y(0))]
    dr.polygon(rock, fill=(228, 214, 190), outline=(120, 100, 80))
    # the vault in the rock
    dr.rectangle([X(58), Y(20), X(100), Y(14)], fill=(196, 200, 210), outline=(30, 30, 30), width=2); dr.text((X(58) + 6, Y(20) + 4), 'LV the Vault', font=fs, fill=(0, 0, 0))
    # the ward buildings
    for u0, u1, h, name in [(-104, -72, 8, 'paper mill'), (-66, -30, 9, 'printing house'), (-26, -2, 8, 'granaries / Geomancers\' lodge')]:
        dr.rectangle([X(u0), Y(h), X(u1), Y(0)], fill=(236, 232, 218), outline=(30, 30, 30), width=2); dr.text((X(u0) + 4, Y(h) + 4), name, font=fs, fill=(0, 0, 0))
    dr.rectangle([X(-118), Y(10), X(-108), Y(0)], fill=(212, 226, 176), outline=(30, 30, 30), width=2); dr.text((X(-118), Y(10) - 22), 'Great Gate', font=fs, fill=(0, 0, 0))
    dr.rectangle([X(108), Y(8), X(118), Y(0)], fill=(212, 226, 176), outline=(30, 30, 30), width=2); dr.text((X(104), Y(8) - 22), 'wall', font=fs, fill=(0, 0, 0))
    # the mass
    lv = [(10, 100, 20, 24.5, 'L1 base: stores, the Closed Ward, the keepers', (236, 232, 218)), (25, 100, 24.5, 29, 'L2 the School: drill hall, lecture halls, the Debate Court open above', (236, 232, 218)),
          (40, 100, 29, 33.5, 'L3 White Palace: the Assembly Hall (2 storeys), cells, refectory', (250, 250, 240)), (40, 100, 33.5, 38, 'L4 White Palace: Testimony, the Restoration Halls, the library', (250, 250, 240)),
          (58, 100, 38, 42.5, 'R1 Red Palace: the Founders, the inner kora', (214, 120, 110)), (58, 100, 42.5, 47, 'R2 the Great Archive', (214, 120, 110)), (58, 100, 47, 51.5, 'R3 the Chronicle Hall, the Council, the Abbot', (214, 120, 110)),
          (66, 94, 51.5, 58, 'gilded roof', (238, 220, 150))]
    for u0, u1, h0, h1, name, col in lv:
        dr.rectangle([X(u0), Y(h1), X(u1), Y(h0)], fill=col, outline=(30, 30, 30), width=2); dr.text((X(u0) + 6, Y(h1) + 4), name, font=fs, fill=(0, 0, 0))
    dr.rectangle([X(40), Y(38), X(65), Y(24.5)], fill=(214, 236, 250), outline=(30, 30, 30), width=2); dr.text((X(41), Y(31)), 'Debate Court', font=fs, fill=(0, 0, 0))
    dr.rectangle([X(62), Y(58), X(80), Y(51.5)], fill=(224, 236, 214), outline=(30, 30, 30), width=2); dr.text((X(62) + 4, Y(58) - 22), 'Observatory, Hall of Hours (roof)', font=fs, fill=(0, 0, 0))
    # the great stair on the face
    for i in range(4):
        dr.line([(X(-8 + i * 4.5), Y(i * 5)), (X(-3.5 + i * 4.5), Y((i + 1) * 5))], fill=(0, 0, 0), width=4)
    dr.text((X(-30), Y(12)), 'Great Stair, zigzag', font=fs, fill=(0, 0, 0))
    k = 0
    for u, h0, h1, name, col in [(34, 20, 38, 'Great Stair (hall)', (0, 0, 0)), (96, 14, 42.5, 'Deep Stair', (160, 0, 0)), (43, 24.5, 38, 'service stairs', (0, 120, 0)), (60, 38, 51.5, 'Red stair', (160, 0, 120))]:
        dr.line([(X(u), Y(h0)), (X(u), Y(h1))], fill=col, width=5); dr.text((X(u) + 6, Y(h1) - 24 - 20 * (k % 2)), name, font=fs, fill=col); k += 1
    dr.text((X(-60), Y(0) + 30), 'the lower ward (the Shol): printing, paper, workshops, wardens, caravanserai, hostel, lodge, servants, market', font=fs, fill=(80, 80, 80))
    dr.text((X(0), Y(20) + 6), 'prayer-drum row and the outer kora at the rock\'s foot', font=fs, fill=(0, 90, 0))
    return img

MASS_SCALE = 1.5
def scale_floor(F, k):
    for r in F['rooms']:
        for key in ('u0', 'u1', 'v0', 'v1'): r[key] = r[key] * k
    if F.get('rect'): F['rect'] = tuple(x * k for x in F['rect'])
    F['R'] = F['R'] * k
    F['outlines'] = [tuple(x * k for x in q[:4]) + tuple(q[4:]) for q in F.get('outlines', [])]

def main():
    for F in FLOORS:
        if F['id'] != 'L0': scale_floor(F, MASS_SCALE)
    B.KEYMAP.update(keymap()); B.EXTRA_PROGRAMS.update(programs()); B.NEW.update(LS_NEW)
    for k in list(B.NEW):
        if k.startswith('voth_') or k.startswith('iziz_'): B.NEW.pop(k)
    B.CITY.clear()
    for k in ['order_bookcase', 'order_reading_table', 'order_lectern', 'order_library_ladder', 'order_globe_stand', 'order_pupil_desk', 'order_master_chair', 'order_writing_board', 'order_mat_rack']:
        B.CITY[k] = "the Order's own set, settlements/yuni/src/59-civic.js"
    intro = ('Generated by `longsong_blueprint.py` (on `settlements/voth/palace/blueprint.py`) from the same room data as the sheets. Keys are catalog pieces (`kits/catalog`): `xanadu_court_*` and `xanadu_common_*` from the Xanadu sets (saffron lanterns, butter lamps, jali screens, celadon, lacquer), `xanadu_training_*`, `xanadu_common_prayer_wheels`, `xanadu_court_incense_burner`, `generic_trade_*`. A key marked **NEW** is not in the catalog yet; the list is at the end. Counts are a brief for the furnisher, not a placement.\n')
    import section_longsong
    B.main(floors=FLOORS, out=OUT, here=HERE, title='# Longsong: furniture manifest\n', intro=intro, section=lambda: section_longsong.draw_section(B, MASS_SCALE), zone_R=208)

if __name__ == '__main__':
    main()
