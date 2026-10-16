#!/usr/bin/env python3
"""The Palace canton blueprint: one labelled sheet per floor, a section, and the furniture manifest.

Every room is data (FLOORS below) in the suite frame of targets/voth-city/40b-vc-suites.js:
u runs along the main axis, in from the -x face where the Ancestry bridge lands (u = -R is the
entrance side, drawn on the left); v runs across (v > 0 is the "north" service hall's side, drawn
up). Metres. A room is (number, name, kind, u0, u1, v0, v1, decor, note); decor 0 bare, 1 plain,
2 fine, 3 rich, 4 sumptuous. The furniture manifest comes from each room's kind, area and decor.

    python3 blueprint.py            # writes floors/*.png and FURNITURE.md next to this file
"""
import math, os, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'floors')
FONT_DIR = 'C:/Windows/Fonts/' if os.name == 'nt' else '/usr/share/fonts/truetype/dejavu/'
def font(size, bold=False):
    for name in ([('arialbd.ttf' if bold else 'arial.ttf'), ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')]):
        try: return ImageFont.truetype(FONT_DIR + name, size)
        except Exception: pass
    return ImageFont.load_default()

# tier radii (half-widths) assumed from the canton's stack: read them off VC.INT.cantons.Palace.tiers when wiring
R0, R1, R2, R3 = 200, 140, 95, 70
CORE = (-30, -10, 33, 53)      # the core stair: TUNE.interiors.core = 10 about (-20, 43)
SWAY = (40, 52, 66, 80)        # the Servants' Way, the back stair that runs dock to summit
KSTAIR = (-48, -36, -66, -46)  # the Kitchen Stair, tier 0 kitchens to the state floor's servery
CSTAIR = (-84, -72, 70, 84)    # the Chancery Stair, the ministries to the court offices and archives
GSTAIR = (3, 15, -60, -45)     # the Gaol Stair, the Quiet Office to the oubliette
ISTAIR = (84, 96, 12, 26)      # the Inner Stair, Tzintzun's chambers to the treasury and the hammam
XSTAIR = (84, 96, -26, -12)    # the Secret Stair, Tzintzun's antechamber down to the oubliette

def R(n, name, kind, u0, u1, v0, v1, decor, note=''):
    return dict(n=n, name=name, kind=kind, u0=u0, u1=u1, v0=v0, v1=v1, decor=decor, note=note)

def box(n, name, kind, b, decor, note=''):
    return R(n, name, kind, b[0], b[1], b[2], b[3], decor, note)

# ------------------------------------------------------------------------------------------------ the floors
FLOORS = []

# ---- F-1 the oubliette and the cellars (under tier 0's dock storey)
FLOORS.append(dict(id='F-1', tier=0, R=R0, title='Floor -1: the Oubliette and the Cellars',
  sub='under the dock storey of tier 0, below the water line of the apron. Cellars under the stores and kitchens; the oubliette under the Quiet Office. No door out but the Death Gate.',
  rooms=[
    R(1, 'Wine Cellars', 'store', -196, -150, 3, 135, 0, 'under the oil and wine stores'),
    R(2, 'Root and Grain Cellars', 'store', -196, -150, 135, 196, 0),
    R(3, 'Cold Cellars', 'store', -150, -100, 3, 196, 0, 'ice from the Giant Country caravans, straw-packed'),
    R(4, 'Cistern of the Palace', 'cistern', -100, -30, 3, 90, 0, 'rain from the terraces; the kitchens draw from it'),
    R(5, 'Garrison Cellars (powder and oil)', 'store', -100, -30, 90, 196, 0),
    R(6, 'Kitchen Cellars', 'store', -100, -30, -120, -3, 0, 'under the household kitchen: barrels, jars'),
    R(7, 'Quay Cellars', 'store', -100, -30, -196, -120, 0),
    R(8, 'Laundry Cistern', 'cistern', -196, -150, -120, -3, 0),
    R(9, 'Dead Store', 'store', -196, -100, -196, -120, 0, 'broken furniture, old banners: the palace\'s attic, below'),
    R(10, 'Slaves\' Cellars', 'store', -150, -100, -120, -3, 0),
    box(11, 'Gaol Stair (from the Quiet Office)', 'stair', GSTAIR, 0),
    R(12, 'Warders\' Room', 'guardroom_dungeon', 3, 40, -45, -3, 0, 'the only lit room: brazier, table, the keys'),
    R(13, 'Dungeon Gallery', 'passage', 15, 100, -45, -39, 0),
  ] + [R(14 + i, 'Cell', 'cell', 15 + 12 * i, 27 + 12 * i, -39, -27, 0) for i in range(7)]
    + [R(21 + i, 'Cell', 'cell', 15 + 12 * i, 27 + 12 * i, -57, -45, 0) for i in range(7)]
    + [
    R(28, 'The Oubliette (the pit)', 'pit', 40, 60, -80, -57, 0, 'a shaft under a grate in the Warders\' floor above; no stair, no door'),
    R(29, 'Interrogation', 'interrogation', 15, 40, -80, -57, 0),
    R(30, 'Gaol Stores', 'store', 60, 100, -80, -57, 0, 'chains, straw, the cauldron'),
    R(31, 'The Forgotten Gallery', 'passage', 3, 15, -190, -60, 0, 'a dead-straight tunnel to the Death Gate: the condemned leave by water, unseen'),
    R(32, 'Death Gate (hidden water stair)', 'stair', 3, 30, -200, -190, 0, 'a low arch at the water line on the south face, barred'),
    box(33, 'Secret Stair foot (Tzintzun\'s)', 'stair', XSTAIR, 1, 'his own way down from the Privy Antechamber: he may visit a prisoner unseen'),
    R(34, 'Treasury Cellars', 'treasury', 100, 196, -60, -3, 1, 'the strongest vaults: bullion from the Assay above, behind two doors'),
    R(35, 'Treasury Guard', 'guard', 100, 196, -110, -60, 1),
    R(36, 'Ships\' Stores Cellars', 'store', 100, 196, -196, -110, 0),
    R(37, 'Workshop Cellars', 'store', 3, 100, 3, 150, 0),
    R(38, 'Boat Slips (water)', 'boathouse', 3, 100, 150, 196, 0, 'the boat house\'s slips come down to the water here'),
    R(39, 'Household Cellars', 'store', 100, 196, 3, 196, 0),
    R(40, 'West Hall (cellar)', 'hall', -200, 200, -3, 3, 0),
    R(41, 'Cross Hall (cellar)', 'hall', -3, 3, -200, 200, 0),
    box(42, 'Core Stair', 'stair', CORE, 1),
  ]))

# ---- F0 the dock storey (tier 0, ground)
FLOORS.append(dict(id='F0', tier=0, R=R0, title='Floor 0: the Dock Storey (tier 0, ground)',
  sub='the Water Gate under the bridge porch, the stores by the dock, the garrison, the kitchens of the household, the workshops, the Quiet Office. Everything heavy comes in here by water.',
  rooms=[
    R(1, 'Water Gate', 'entrance', -212, -200, -10, 10, 3, 'the ferry pier\'s door under the bridge porch; the dock flight climbs to it'),
    R(2, 'Gate of Carts (the goods quay)', 'entrance', -10, 10, -212, -200, 1, 'barges unload here; nothing but goods and slaves pass'),
    R(3, 'North Water Door', 'entrance', -10, 10, 200, 212, 1, 'the household\'s boats'),
    R(4, 'East Door', 'entrance', 200, 212, -10, 10, 2, 'onto the apron where the terrace flights land: the officials\' way in'),
    R(5, 'Water Guard', 'guard', -196, -170, 3, 25, 1, 'Ordinators of the gate'),
    R(6, 'Weighing Hall', 'weighing', -170, -120, 3, 30, 1, 'every load in is tallied here'),
    R(7, 'Clerk of the Stores', 'office', -120, -100, 3, 20, 2),
    R(8, 'Granary of the Palace', 'store', -196, -150, 25, 80, 0),
    R(9, 'Oil and Wine Cellars', 'store', -196, -150, 80, 135, 0),
    R(10, 'Salt, Spice and Cacao', 'store', -196, -150, 135, 190, 0),
    R(11, 'Cloth and Hide Store', 'store', -150, -110, 30, 80, 0),
    R(12, 'Stores Court', 'court', -150, -110, 80, 120, 0, 'open to the sky; carts turn here'),
    R(13, 'Timber and Metal Store', 'store', -150, -110, 120, 190, 0),
    R(14, 'Stores Corridor', 'hall', -110, -100, 20, 190, 1),
    R(15, 'Guard Hall of the Garrison', 'guard', -100, -60, 3, 40, 1, 'the Ordinators\' palace garrison'),
    R(16, 'Barracks I', 'barracks', -100, -60, 40, 90, 0),
    R(17, 'Drill Court', 'drill', -100, -40, 90, 140, 0, 'open; training posts and butts'),
    R(18, 'Barracks II', 'barracks', -100, -60, 140, 190, 0),
    R(19, 'Armoury of the Garrison', 'armoury', -60, -30, 3, 33, 1),
    R(20, 'Captain and Officers', 'office', -60, -30, 53, 90, 2),
    R(21, 'Mess of the Guard', 'servants_hall', -40, -3, 90, 140, 1),
    R(22, 'Garrison Stores', 'store', -60, -3, 140, 190, 0),
    R(23, 'Household Kitchen', 'kitchen', -100, -50, -45, -3, 1, 'feeds the household of 150 and the guard; the Kitchen Stair takes dishes up'),
    R(24, 'Scullery', 'scullery', -50, -30, -25, -3, 0),
    box(25, 'Kitchen Stair', 'stair', KSTAIR, 1, 'to the state floor\'s servery'),
    R(26, 'Kitchen Court (the well)', 'court', -100, -50, -80, -45, 0),
    R(27, 'Bakehouse', 'bakehouse', -100, -70, -120, -80, 1),
    R(28, 'Brewhouse', 'brewhouse', -70, -40, -120, -80, 1),
    R(29, 'Butchery and Fish', 'butchery', -100, -60, -160, -120, 0),
    R(30, 'Larders and Cold Store', 'larder', -60, -30, -160, -120, 0),
    R(31, 'Firewood and Charcoal', 'store', -100, -30, -190, -160, 0),
    R(32, 'Goods Hall of the Quay', 'weighing', -30, 30, -190, -120, 1, 'inside the Gate of Carts'),
    R(33, 'Porters\' Lodge', 'dormitory', -30, -3, -120, -80, 0),
    R(34, 'Laundry', 'laundry', -196, -150, -60, -3, 1, 'vats and coppers'),
    R(35, 'Drying Court', 'court', -196, -150, -100, -60, 0),
    R(36, 'Soap and Lye', 'store', -196, -150, -130, -100, 0),
    R(37, 'Tallow and Lamp Oil', 'store', -196, -150, -190, -130, 0),
    R(38, 'Slaves\' Quarters', 'dormitory', -150, -100, -60, -3, 0, 'Nazarite and Wingman slaves of the household'),
    R(39, 'Slaves\' Court', 'court', -150, -100, -100, -60, 0),
    R(40, 'Slaves\' Quarters', 'dormitory', -150, -100, -190, -100, 0),
    R(41, 'Carpenters and Gilders', 'workshop', 3, 40, 3, 50, 1, 'the palace is always being regilded'),
    R(42, 'Lamp and Candle Makers', 'workshop', 3, 40, 50, 90, 1),
    R(43, 'Workshop Court', 'court', 3, 40, 90, 150, 0),
    R(44, 'Tailors and Weavers of the Household', 'workshop', 52, 100, 3, 50, 1),
    R(45, 'Potters and Tinkers', 'workshop', 52, 100, 50, 90, 1),
    box(46, 'Servants\' Way', 'stair', SWAY, 1, 'the back stair: dock to summit'),
    R(47, 'Litter Bearers and Runners', 'dormitory', 52, 100, 90, 150, 0),
    R(48, 'Barge Quay and Boat House', 'boathouse', 3, 100, 150, 196, 1, 'the state barge, the household\'s canoes'),
    R(49, 'Ordinators\' Water Post', 'guard', 100, 130, 150, 196, 1),
    R(50, 'Household Stores (east)', 'store', 100, 196, 3, 60, 0),
    R(51, 'Livery Wardrobe of the Household', 'wardrobe', 100, 150, 60, 110, 1),
    R(52, 'East Court', 'court', 150, 196, 60, 110, 0),
    R(53, 'Officials\' Entrance Hall', 'hall', 100, 196, 110, 150, 2, 'the East Door\'s hall: the officials come in from the terrace flights'),
    R(54, 'Doorkeepers', 'guard', 130, 196, 150, 196, 1),
    R(55, 'The Quiet Office', 'office', 3, 40, -45, -3, 2, 'the Ordinators\' hidden branch: files, a stair of its own, no sign on the door'),
    R(56, 'Interrogation', 'interrogation', 40, 70, -45, -3, 0),
    box(57, 'Gaol Stair', 'stair', GSTAIR, 0, 'down to the oubliette'),
    R(58, 'Holding Cells', 'cell', 15, 70, -80, -45, 0),
    R(59, 'Death Gate Passage', 'passage', 3, 15, -120, -60, 0, 'to the hidden water stair below'),
    R(60, 'Court of the Quiet Office', 'court', 15, 70, -120, -80, 0, 'walled; the only daylight the held see'),
    R(61, 'Keepers\' Quarters', 'dormitory', 70, 100, -80, -3, 0),
    R(62, 'Goods Stores of the Quay', 'store', 30, 100, -190, -120, 0),
    R(63, 'Stores', 'store', 100, 196, -60, -3, 0),
    R(64, 'Stores Court', 'court', 100, 150, -110, -60, 0),
    R(65, 'Hide and Rope', 'store', 150, 196, -110, -60, 0),
    R(66, 'Chandlery (the barge\'s stores)', 'store', 100, 196, -150, -110, 0),
    R(67, 'Guard of the South-East', 'guard', 100, 196, -190, -150, 1),
    R(68, 'Water Gate Hall', 'hall', -200, 200, -3, 3, 2, 'the spine of the dock storey, gate to East Door'),
    R(69, 'Cross Hall', 'hall', -3, 3, -200, 200, 1),
    box(70, 'Core Stair', 'stair', CORE, 2),
  ]))

# ---- F1 the household and the court town (tier 0, storey 1)
FLOORS.append(dict(id='F1', tier=0, R=R0, title='Floor 1: the Household and the Court Town (tier 0, storey 1)',
  sub='where the 150 of the household sleep and eat, and the residences of the great officers: the Vizier, the Commander of the Ordinators, the Chief Steward, the Keeper of the Treasury, the Master of Ceremonies, the Chamberlain, the Physician (the Kuge-machi lesson: the court lives round the palace).',
  rooms=[
    R(1, 'Household Hall (dining)', 'servants_hall', -196, -130, 3, 50, 1, 'long tables; the household eats by rank'),
    R(2, 'Chapel of the Household', 'chapel', -130, -100, 3, 30, 2, 'a sun altar and the ancestors\' niches'),
    R(3, 'Dormitories (men)', 'dormitory', -196, -150, 50, 120, 0),
    R(4, 'Dormitories (women)', 'dormitory', -196, -150, 120, 190, 0),
    R(5, 'Stores Court (void)', 'void', -150, -110, 80, 120, 0),
    R(6, 'Senior Servants\' Chambers', 'chamber', -150, -110, 30, 80, 1),
    R(7, 'Senior Servants\' Chambers', 'chamber', -150, -110, 120, 190, 1),
    R(8, 'Corridor', 'hall', -110, -100, 20, 190, 1),
    R(9, 'Ordinators\' Dormitories', 'dormitory', -100, -60, 3, 90, 0),
    R(10, 'Drill Court (void)', 'void', -100, -40, 90, 140, 0),
    R(11, 'Ordinators\' Dormitories', 'dormitory', -100, -60, 140, 190, 0),
    R(12, 'Officers\' Lodging', 'lodging', -60, -30, 3, 33, 2),
    R(13, 'Commander of the Ordinators: residence', 'lodging', -60, -3, 53, 90, 3, 'hall, chamber, study, his own guard room'),
    R(14, 'Infirmary of the Household', 'infirmary', -40, -3, 140, 190, 1),
    R(15, 'Cooks\' and Bakers\' Dormitory', 'dormitory', -100, -50, -45, -3, 0),
    box(16, 'Kitchen Stair', 'stair', KSTAIR, 1),
    R(17, 'Kitchen Court (void)', 'void', -100, -50, -80, -45, 0),
    R(18, 'Stewards of the Kitchen', 'office', -100, -40, -120, -80, 1),
    R(19, 'Dry Stores', 'store', -100, -30, -160, -120, 0),
    R(20, 'Grain Loft', 'store', -100, -30, -190, -160, 0),
    R(21, 'Quay Clerks', 'office', -30, 30, -190, -120, 1),
    R(22, 'Laundresses', 'dormitory', -196, -150, -60, -3, 0),
    R(23, 'Drying Court (void)', 'void', -196, -150, -100, -60, 0),
    R(24, 'Linen Store', 'store', -196, -150, -130, -100, 0),
    R(25, 'Dormitory', 'dormitory', -196, -150, -190, -130, 0),
    R(26, 'Slaves\' Quarters', 'dormitory', -150, -100, -60, -3, 0),
    R(27, 'Slaves\' Court (void)', 'void', -150, -100, -100, -60, 0),
    R(28, 'Slaves\' Quarters', 'dormitory', -150, -100, -190, -100, 0),
    R(29, 'Chief Steward: residence', 'lodging', 3, 40, 3, 50, 3),
    R(30, 'Keeper of the Treasury: residence', 'lodging', 3, 40, 50, 90, 3),
    R(31, 'Workshop Court (void)', 'void', 3, 40, 90, 150, 0),
    box(32, 'Servants\' Way', 'stair', SWAY, 1),
    R(33, 'Master of Ceremonies: residence', 'lodging', 52, 100, 3, 50, 3),
    R(34, 'Chamberlain: residence', 'lodging', 52, 100, 50, 90, 3),
    R(35, 'Physician: residence and dispensary', 'lodging', 52, 100, 90, 150, 2),
    R(36, 'Sailmakers and Boatwrights', 'workshop', 3, 100, 150, 196, 1, 'over the boat house'),
    R(37, 'The Vizier\'s Residence', 'lodging', 100, 196, 3, 110, 4, 'a compound of its own: hall of reception, divan room, chambers, bath, kitchen, round its court; a door onto the east terrace'),
    R(38, 'East Court (void)', 'void', 150, 196, 60, 110, 0),
    R(39, 'Vizier\'s Household', 'dormitory', 100, 196, 110, 150, 1),
    R(40, 'Vizier\'s Guard', 'guard', 130, 196, 150, 196, 1),
    R(41, 'Water Post (upper)', 'guard', 100, 130, 150, 196, 1),
    R(42, 'Quiet Office: archive of informers', 'archive', 3, 40, -45, -3, 1),
    R(43, 'Quiet Office: chambers', 'dormitory', 40, 70, -45, -3, 1),
    box(44, 'Gaol Stair', 'stair', GSTAIR, 0),
    R(45, 'Wardens', 'dormitory', 15, 70, -80, -45, 0),
    R(46, 'Court of the Quiet Office (void)', 'void', 15, 70, -120, -80, 0),
    R(47, 'Keepers', 'dormitory', 70, 100, -80, -3, 0),
    R(48, 'Captain of the Quay: lodging', 'lodging', 30, 100, -190, -120, 2),
    R(49, 'Clerks\' Lodgings', 'lodging', 100, 196, -60, -3, 2, 'the senior clerks of the Chancery above live over their work'),
    R(50, 'Stores Court (void)', 'void', 100, 150, -110, -60, 0),
    R(51, 'Clerks\' Lodgings', 'lodging', 150, 196, -110, -60, 2),
    R(52, 'Clerks\' Lodgings', 'lodging', 100, 196, -150, -110, 2),
    R(53, 'Guard (upper)', 'dormitory', 100, 196, -190, -150, 0),
    R(54, 'West Hall', 'hall', -200, 200, -3, 3, 1),
    R(55, 'Cross Hall', 'hall', -3, 3, -200, 200, 1),
    box(56, 'Core Stair', 'stair', CORE, 2),
  ]))

# ---- F2 the Chancery (tier 0, storey 2)
FLOORS.append(dict(id='F2', tier=0, R=R0, title='Floor 2: the Chancery (tier 0, storey 2)',
  sub='the kingdom\'s government under the state floor (the Heian Greater Palace and the Bangkok Outer Court): the Hall of Petitions open to the public from the terrace, the ministries round the light courts, the Vizier\'s Divan, the Chancery Stair up to the Hall of Judgment\'s offices.',
  rooms=[
    R(1, 'Hall of Petitions', 'petitions', -196, -130, -45, 45, 3, 'the public\'s door to government: petitions are received here by officials, never by the ruler; benches, a dais for the officer of the day'),
    R(2, 'Petitions Clerks', 'office', -130, -100, 3, 45, 2),
    R(3, 'Petitions Clerks', 'office', -130, -100, -45, -3, 2),
    R(4, 'Ministry of Granaries and Tribute', 'ministry', -196, -110, 45, 120, 2, 'the tribute rolls of Shim, Almua, Temora, Zey-Danin, Hook, Torus and Drum'),
    R(5, 'Stores Court (void)', 'void', -150, -110, 80, 120, 0),
    R(6, 'Ministry of the Provinces', 'ministry', -196, -110, 120, 190, 2),
    R(7, 'Ministry of Works and Canals', 'ministry', -100, -40, 3, 90, 2, 'the chinampas, the causeways, the walls'),
    box(8, 'Chancery Stair', 'stair', CSTAIR, 1, 'up to the court offices and the archives'),
    R(9, 'Drill Court (void)', 'void', -100, -40, 90, 140, 0),
    R(10, 'Ministry of the Fleet and Harbours', 'ministry', -100, -40, 140, 190, 2),
    R(11, 'Census and the Rolls of Persons', 'ministry', -60, -3, 53, 90, 2),
    R(12, 'Archive of Edicts', 'archive', -40, -3, 90, 140, 2),
    R(13, 'Ministry of the Treasury (the counting hall)', 'ministry', -100, -30, -45, -3, 3, 'over the kitchens: the counting tables, the strongboxes, the Keeper\'s dais'),
    box(14, 'Kitchen Stair', 'stair', KSTAIR, 1),
    R(15, 'Kitchen Court (void)', 'void', -100, -50, -80, -45, 0),
    R(16, 'Tax Rolls', 'archive', -100, -40, -120, -80, 2),
    R(17, 'Assay and Mint', 'workshop', -100, -30, -160, -120, 2, 'the gold of the kingdom weighed and struck'),
    R(18, 'Treasury Guard', 'guard', -100, -30, -190, -160, 1),
    R(19, 'Customs of the Quay', 'office', -30, 30, -190, -120, 2),
    R(20, 'Ministry of Slaves', 'ministry', -196, -150, -60, -3, 2, 'the rolls of the enslaved Nazarites and Wingmen'),
    R(21, 'Drying Court (void)', 'void', -196, -150, -100, -60, 0),
    R(22, 'Scribes\' Hall', 'scriptorium', -196, -150, -190, -100, 2),
    R(23, 'Ministry of Rites and the Calendar', 'ministry', -150, -100, -60, -3, 2, 'the priests\' liaison: the solstice, the processions'),
    R(24, 'Slaves\' Court (void)', 'void', -150, -100, -100, -60, 0),
    R(25, 'Scribes\' Hall', 'scriptorium', -150, -100, -190, -100, 2),
    R(26, 'Court of the Vizier (the Divan)', 'divan', 3, 52, 3, 90, 4, 'the daily council the Vizier presides; Tzintzun may listen unseen from a screened loggia off the Servants\' Way (Topkapi\'s grille)'),
    R(27, 'Workshop Court (void)', 'void', 3, 40, 90, 150, 0),
    box(28, 'Servants\' Way', 'stair', SWAY, 1),
    R(29, 'Vizier\'s Secretariat', 'office', 52, 100, 3, 90, 3),
    R(30, 'Ministry of Embassies', 'ministry', 52, 100, 90, 150, 2, 'the Foreign canton\'s business'),
    R(31, 'Chancery of Seals', 'office', 3, 40, 150, 196, 3, 'edicts sealed with the orb'),
    R(32, 'Heralds and the Registers of Clans', 'ministry', 40, 100, 150, 196, 2),
    R(33, 'Ministry of the Household (the Steward\'s bureaus)', 'ministry', 100, 196, 3, 110, 2),
    R(34, 'East Court (void)', 'void', 150, 196, 60, 110, 0),
    R(35, 'Officials\' Hall', 'hall', 100, 196, 110, 150, 2, 'the officials\' own way up from the East Door'),
    R(36, 'Doorkeepers (upper)', 'guard', 130, 196, 150, 196, 1),
    R(37, 'Water Post (upper)', 'guard', 100, 130, 150, 196, 1),
    R(38, 'Ministry of the Ordinators', 'ministry', 3, 70, -45, -3, 2, 'the open face of the secret police: the rolls of the Ordinators, the hunt for History Monks'),
    box(39, 'Gaol Stair', 'stair', GSTAIR, 0),
    R(40, 'Records of the Condemned', 'archive', 15, 70, -80, -45, 1),
    R(41, 'Court of the Quiet Office (void)', 'void', 15, 70, -120, -80, 0),
    R(42, 'Keepers (upper)', 'dormitory', 70, 100, -80, -3, 0),
    R(43, 'Ministry of Arsenals', 'ministry', 30, 100, -190, -120, 2, 'the Arsenal canton\'s business'),
    R(44, 'Clerks\' Halls', 'office', 100, 196, -60, -3, 2),
    R(45, 'Stores Court (void)', 'void', 100, 150, -110, -60, 0),
    R(46, 'Clerks\' Halls', 'office', 150, 196, -110, -60, 2),
    R(47, 'Ministry of Mines and Quarries', 'ministry', 100, 196, -150, -110, 2),
    R(48, 'Archive of the Chancery', 'archive', 100, 196, -190, -150, 1),
    R(49, 'West Hall', 'hall', -200, 200, -3, 3, 2),
    R(50, 'Cross Hall', 'hall', -3, 3, -200, 200, 2),
    box(51, 'Core Stair', 'stair', CORE, 2),
  ]))

# ---- F3 the state floor, storey 1 (tier 1)
def guests_S(n0, kind, name, decor):
    return [R(n0 + i, name, kind, 40 + 14 * i, 54 + 14 * i, -66, -46, decor) for i in range(6)]

FLOORS.append(dict(id='F3', tier=1, R=R1, title='Floor 3: the State Floor, storey 1 (tier 1, the bridge tier)',
  sub='the owner\'s chain from the Ancestry bridge: Bridge Porch, Foyer of the Ancestors, Banquet Hall, the Octagon of the Sun, then the Privy Door and the ruler\'s own suite, the Hall of Judgment off the north hall, the great kitchen beside the banquet hall. Guards at every threshold; two service halls with doors onto the terrace gardens at their ends.',
  rooms=[
    R(1, 'Bridge Porch', 'entrance', -150, -140, -8, 8, 4, 'the gilt main entrance where the Ancestry bridge lands'),
    R(2, 'Entrance Passage', 'passage', -140, -132, -3.5, 3.5, 4),
    R(3, 'Guard Room of the Bridge', 'guard', -132, -118, 28, 40, 2, 'Ordinators of the door'),
    R(4, 'Guard Room of the Bridge', 'guard', -132, -118, -40, -28, 2),
    R(5, 'Foyer of the Ancestors', 'foyer', -132, -82, -28, 28, 4, '3 storeys; six pillars with the ancestors\' gilt statues; the grand stairs; the brothers\' frescos over the doors'),
    R(6, 'Ushers of the Door', 'office', -118, -100, 28, 40, 2, 'the visitors\' register'),
    R(7, 'Cloak and Arms Room', 'store', -118, -100, -40, -28, 1, 'visitors leave their weapons'),
    R(8, 'Banquet Hall', 'banquet', -82, -2, -18, 18, 4, '2 storeys; ten pillars; the tapestries hung at 45 degrees; the feast (VC.suiteFeast)'),
    R(9, 'Great Kitchen', 'kitchen', -80, -48, 18, 40, 1, 'cooks for the banquet hall (owner); hearths on the outer wall; a door into the north hall'),
    R(10, 'Larder', 'larder', -48, -36, 28, 40, 0),
    R(11, 'Scullery', 'scullery', -36, -24, 28, 40, 0),
    R(12, 'Buttery', 'buttery', -82, -62, -40, -28, 1, 'drink and cups for the hall'),
    R(13, 'Hall Steward', 'office', -62, -50, -40, -28, 2),
    R(14, 'Musicians\' Room', 'music', -50, -36, -40, -28, 2, 'under their gallery'),
    R(15, 'Servery', 'servery', -36, -24, -40, -28, 1, 'dishes from the Kitchen Stair are marshalled here before the hall'),
    R(16, 'Throne Room: the Octagon of the Sun', 'throne', -2, 62, -32, 32, 4, '3 storeys; corners cut by diagonal walls; the corbelled dome; the octagonal dais; the sun-giant-Krator chandelier'),
    R(17, 'Heralds and Criers', 'office', -2, 20, 32, 40, 2),
    R(18, 'Throne Guard', 'guard', 20, 42, 32, 40, 2),
    R(19, 'Robes of Audience', 'wardrobe', 42, 62, 32, 40, 2),
    R(20, 'Throne Guard', 'guard', -2, 20, -40, -32, 2),
    R(21, 'Waiting Room of the Summoned', 'antechamber', 20, 62, -40, -32, 3, 'those called before the throne wait here (Versailles\' Oeil-de-Boeuf)'),
    R(22, 'Vestibule of the Sun (the Privy Door)', 'vestibule', 62, 70, -8, 8, 4, 'the one threshold between the court and the ruler'),
    R(23, 'Privy Guard', 'guard', 62, 70, 8, 26, 2, 'Ordinators sworn to the person'),
    R(24, 'Ushers of the Chamber', 'office', 62, 70, -26, -8, 2),
    R(25, 'Privy Passage', 'passage', 70, 84, -4, 4, 4),
    R(26, 'Council Chamber', 'council', 70, 84, 4, 26, 4, 'the Vizier and the councillors before the ruler; the Orb table'),
    R(27, 'Cabinet of the Orb', 'cabinet', 70, 84, -26, -4, 4, 'his day room and study: where the work is done (Seiryoden, not Shishinden)'),
    R(28, 'Privy Antechamber', 'antechamber', 84, 96, -12, 12, 4, 'the hinge of the suite: the Inner Stair north, the Secret Stair south'),
    box(29, 'Inner Stair', 'stair', ISTAIR, 4, 'to the Robing Room, the Chamber of the Staff, the Treasury of the Sun and the Hammam'),
    box(30, 'Secret Stair', 'stair', XSTAIR, 2, 'down to the oubliette, unseen'),
    R(31, 'Privy Gallery', 'gallery', 96, 110, 8, 26, 3, 'a screened walk round the court'),
    R(32, 'Privy Gallery', 'gallery', 96, 110, -26, -8, 3),
    R(33, 'Privy Court', 'court', 96, 110, -8, 8, 3, 'open to the sky (tier 2\'s wall stands west of it); a pool and planting'),
    R(34, 'Bedchamber', 'bedchamber', 110, 130, 4, 26, 4, 'the state bed under its canopy'),
    R(35, 'Bath', 'bath', 110, 130, -10, 4, 4, 'warm pool and basins'),
    R(36, 'Oratory of the Sun', 'oratory', 110, 130, -26, -10, 4, 'faces the morning; the private sun altar'),
    R(37, 'Sun Guard Dormitory', 'dormitory', 70, 86, 28, 40, 1),
    R(38, 'Privy Servants', 'dormitory', 86, 104, 28, 40, 1, 'the body servants'),
    R(39, 'Privy Kitchen', 'privy_kitchen', 104, 124, 28, 40, 1, '(owner) cooks for the ruler alone; a door to the bedchamber side'),
    R(40, 'Robe Stores', 'wardrobe', 70, 90, -40, -28, 2),
    R(41, 'Physician of the Person', 'infirmary', 90, 104, -40, -28, 2),
    R(42, 'Privy Chamberlain', 'office', 104, 124, -40, -28, 3),
    R(43, 'North Service Hall', 'hall', -124, 124, 40, 46, 2, 'a garden door at each end'),
    R(44, 'South Service Hall', 'hall', -124, 124, -46, -40, 2, 'a garden door at each end'),
    box(45, 'Core Stair', 'stair', CORE, 2, 'every storey and tier'),
    R(46, 'Hall of Judgment', 'judgment', -126, -84, 46, 106, 4, '2 storeys; the ruler\'s dais against the far wall, two plaintiffs\' daises, the spectators\' galleries'),
    R(47, 'Advocates and Clerks of the Court', 'office', -84, -60, 46, 70, 2),
    R(48, 'Records of Judgment', 'archive', -60, -30, 46, 70, 2),
    box(49, 'Chancery Stair', 'stair', CSTAIR, 1, 'down to the ministries'),
    R(50, 'Court Passage', 'passage', -72, -60, 70, 90, 1),
    R(51, 'Court Light Court', 'court', -60, -30, 70, 90, 2, 'open; light to the offices (Westminster\'s courts)'),
    R(52, 'Gallery of the Summoned', 'antechamber', -84, -30, 90, 106, 3, 'the waiting hall of those called to judgment'),
    R(53, 'State Guest Suite I: antechamber', 'guest_ante', -10, 6, 46, 60, 3, 'for Izani and foreign nobles'),
    R(54, 'Suite I: chamber', 'guest_bed', -10, 6, 60, 76, 3),
    R(55, 'State Guest Suite II: antechamber', 'guest_ante', 6, 22, 46, 60, 3),
    R(56, 'Suite II: chamber', 'guest_bed', 6, 22, 60, 76, 3),
    R(57, 'State Guest Suite III: antechamber', 'guest_ante', 22, 40, 46, 60, 3),
    R(58, 'Suite III: chamber', 'guest_bed', 22, 40, 60, 76, 3),
    R(59, 'Guests\' Dining Hall', 'guest_hall', -10, 22, 76, 106, 3),
    R(60, 'Guests\' Light Court', 'court', 22, 40, 76, 92, 2),
    R(61, 'Guests\' Bath', 'bath', 22, 40, 92, 106, 3),
    R(62, 'Servants\' Hall', 'servants_hall', 40, 64, 46, 66, 1, 'the state floor\'s servants eat here'),
    R(63, 'Servants\' Dormitory (men)', 'dormitory', 64, 82, 46, 66, 0),
    R(64, 'Servants\' Dormitory (women)', 'dormitory', 82, 100, 46, 66, 0),
    R(65, 'Linen and Household Stores', 'store', 100, 124, 46, 66, 0),
    box(66, 'Servants\' Way', 'stair', SWAY, 1, 'the service spine, dock to summit'),
    R(67, 'Service Light Court', 'court', 64, 100, 66, 86, 1),
    R(68, 'Chamberlain\'s Offices', 'office', 100, 124, 66, 86, 2),
    R(69, 'Household Stores', 'store', 52, 110, 86, 106, 0),
    R(70, 'Garden Door Guard', 'guard', 110, 124, 86, 106, 1),
    R(71, 'Guard Hall of the Ordinators', 'guard', -124, -100, -70, -46, 2, 'the state floor\'s watch'),
    R(72, 'Armoury', 'armoury', -124, -100, -90, -70, 1),
    R(73, 'Captain of the Watch', 'office', -124, -100, -106, -90, 2),
    R(74, 'Duty Dormitory', 'dormitory', -100, -84, -106, -46, 0),
    R(75, 'Steward of the Palace', 'office', -84, -66, -66, -46, 3),
    R(76, 'Treasurer of the Household', 'office', -66, -48, -66, -46, 3),
    box(77, 'Kitchen Stair', 'stair', KSTAIR, 1, 'from the tier 0 kitchens; lands by the servery'),
    R(78, 'Counting Room', 'treasury', -84, -56, -86, -66, 2, 'the household\'s money; strongboxes'),
    R(79, 'South Light Court', 'court', -56, -30, -86, -66, 2),
    R(80, 'Scriptorium', 'scriptorium', -84, -30, -106, -86, 2, '(owner) copyists in garden light'),
    R(81, 'Gallery of Victories', 'trophy', -30, 40, -66, -46, 4, 'Voth means Victory: the trophies of Nazar, Wing, Hook, Torus and Drum (Versailles\' Hall of Battles)'),
    R(82, 'Library of the Sun', 'library', -30, 10, -106, -66, 4, '2 storeys with a gallery; the kingdom\'s books and the Ancients\' relics the staff legend rests on'),
    R(83, 'Map Room', 'library', 10, 40, -86, -66, 3),
    R(84, 'Reading Room', 'library', 10, 40, -106, -86, 3),
  ] + guests_S(85, 'guest_bed', 'Guest Chamber', 3) + [
    R(91, 'Guests\' Court', 'court', 40, 70, -106, -66, 2),
    R(92, 'Hammam of the Guests', 'hammam', 70, 96, -106, -66, 3, 'hot, warm and cold rooms, the slab (the Ottoman habit)'),
    R(93, 'Infirmary', 'infirmary', 96, 124, -106, -66, 1),
  ],
  pillars=[(u, v) for u in (-120, -108, -96) for v in (-16, 16)] + [(u, v) for u in (-70, -56, -42, -28, -14) for v in (-11, 11)],
  octagon=(-2, 62, -32, 32, 14), dais=(30, 0, 8), doors=[(-140, 43), (-140, -43), (140, 43), (140, -43)]))

# ---- F4 the state floor, storey 2
FLOORS.append(dict(id='F4', tier=1, R=R1, title='Floor 4: the State Floor, storey 2 (tier 1)',
  sub='the galleries round the tall rooms; the ruler\'s upper rooms (the Robing Room and the Chamber of the Staff over the council and the cabinet); the guest suites stacked as Versailles stacks them; the household above the household.',
  rooms=[
    R(1, 'Foyer: first gallery (void)', 'gallery_void', -132, -82, -28, 28, 4, 'the grand stairs arrive here'),
    R(2, 'Banquet Hall: gallery (void)', 'gallery_void', -82, -2, -18, 18, 4),
    R(3, 'Throne Room: first gallery (void)', 'gallery_void', -2, 62, -32, 32, 4, 'the octagon\'s ring'),
    R(4, 'Hall of Judgment: spectators\' galleries (void)', 'gallery_void', -126, -84, 46, 106, 4),
    R(5, 'Guard (upper)', 'guard', -132, -118, 28, 40, 1),
    R(6, 'Guard (upper)', 'guard', -132, -118, -40, -28, 1),
    R(7, 'Ushers\' Chambers', 'chamber', -118, -100, 28, 40, 2),
    R(8, 'Door Stores', 'store', -118, -100, -40, -28, 0),
    R(9, 'Cooks\' Dormitory', 'dormitory', -80, -48, 18, 40, 0),
    R(10, 'Dry Stores', 'store', -48, -24, 28, 40, 0),
    R(11, 'Hall Officers', 'office', -82, -50, -40, -28, 2),
    R(12, 'Musicians\' Gallery', 'music', -50, -24, -40, -28, 3, 'opens on the banquet hall'),
    R(13, 'Clerks of the Chamber', 'office', -2, 30, 32, 40, 2),
    R(14, 'Keeper of the Orb', 'office', 30, 62, 32, 40, 3),
    R(15, 'Chamberlains\' Room', 'office', -2, 30, -40, -32, 2),
    R(16, 'Archive of Audiences', 'archive', 30, 62, -40, -32, 2),
    R(17, 'Privy Guard (upper)', 'guard', 62, 70, -26, 26, 2),
    R(18, 'Privy Passage (upper)', 'passage', 70, 84, -4, 4, 4),
    R(19, 'Robing Room', 'wardrobe', 70, 84, 4, 26, 4, 'the robes of the Sun; over the Council'),
    R(20, 'Chamber of the Staff', 'treasury', 70, 84, -26, -4, 4, 'the golden staff on its stand, under guard; over the Cabinet'),
    R(21, 'Privy Antechamber (upper)', 'antechamber', 84, 96, -12, 12, 4),
    box(22, 'Inner Stair', 'stair', ISTAIR, 4),
    box(23, 'Secret Stair', 'stair', XSTAIR, 2),
    R(24, 'Privy Gallery (upper)', 'gallery', 96, 110, 8, 26, 3),
    R(25, 'Privy Gallery (upper)', 'gallery', 96, 110, -26, -8, 3),
    R(26, 'Privy Court (void)', 'void', 96, 110, -8, 8, 3),
    R(27, 'Sleeping Loggia', 'bedchamber', 110, 130, 4, 26, 4, 'his summer bed; opens onto the terrace garden'),
    R(28, 'Private Library', 'library', 110, 130, -10, 4, 4),
    R(29, 'Astronomer\'s Closet', 'astronomers', 110, 130, -26, -10, 3, 'the reader of the sun\'s path attends him here'),
    R(30, 'Sun Guard (upper)', 'dormitory', 70, 86, 28, 40, 1),
    R(31, 'Privy Wardrobe', 'wardrobe', 86, 104, 28, 40, 2),
    R(32, 'Privy Pantry', 'larder', 104, 124, 28, 40, 0),
    R(33, 'Privy Secretaries', 'office', 70, 90, -40, -28, 3),
    R(34, 'Apothecary', 'infirmary', 90, 104, -40, -28, 2),
    R(35, 'Treasurer of the Chamber', 'office', 104, 124, -40, -28, 3),
    R(36, 'North Service Hall', 'hall', -124, 124, 40, 46, 2),
    R(37, 'South Service Hall', 'hall', -124, 124, -46, -40, 2),
    box(38, 'Core Stair', 'stair', CORE, 2),
    R(39, 'Clerks\' Offices', 'office', -84, -60, 46, 70, 2),
    R(40, 'Court Archive', 'archive', -60, -30, 46, 70, 2),
    box(41, 'Chancery Stair', 'stair', CSTAIR, 1),
    R(42, 'Court Passage', 'passage', -72, -60, 70, 90, 1),
    R(43, 'Court Light Court (void)', 'void', -60, -30, 70, 90, 2),
    R(44, 'Judges\' Retiring Room', 'office', -84, -30, 90, 106, 3),
    R(45, 'Suite I: servants and wardrobe', 'dormitory', -10, 6, 46, 60, 1),
    R(46, 'Suite I: upper chamber', 'guest_bed', -10, 6, 60, 76, 3),
    R(47, 'Suite II: servants and wardrobe', 'dormitory', 6, 22, 46, 60, 1),
    R(48, 'Suite II: upper chamber', 'guest_bed', 6, 22, 60, 76, 3),
    R(49, 'Suite III: servants and wardrobe', 'dormitory', 22, 40, 46, 60, 1),
    R(50, 'Suite III: upper chamber', 'guest_bed', 22, 40, 60, 76, 3),
    R(51, 'Guests\' Sitting Rooms', 'guest_ante', -10, 22, 76, 106, 3),
    R(52, 'Guests\' Court (void)', 'void', 22, 40, 76, 92, 2),
    R(53, 'Guests\' Servants', 'dormitory', 22, 40, 92, 106, 0),
    R(54, 'Stewards\' Room', 'office', 40, 64, 46, 66, 2),
    R(55, 'Dormitory', 'dormitory', 64, 82, 46, 66, 0),
    R(56, 'Dormitory', 'dormitory', 82, 100, 46, 66, 0),
    R(57, 'Wardrobe of State', 'wardrobe', 100, 124, 46, 66, 2, 'the court\'s ceremonial dress'),
    box(58, 'Servants\' Way', 'stair', SWAY, 1),
    R(59, 'Service Court (void)', 'void', 64, 100, 66, 86, 1),
    R(60, 'Chamberlain (upper)', 'office', 100, 124, 66, 86, 2),
    R(61, 'Household Stores', 'store', 52, 110, 86, 106, 0),
    R(62, 'Guard', 'guard', 110, 124, 86, 106, 1),
    R(63, 'Ordinators\' Dormitory', 'dormitory', -124, -100, -70, -46, 0),
    R(64, 'Ordinators\' Dormitory', 'dormitory', -124, -100, -90, -70, 0),
    R(65, 'Officers', 'office', -124, -100, -106, -90, 2),
    R(66, 'Duty Dormitory', 'dormitory', -100, -84, -106, -46, 0),
    R(67, 'Household Archives', 'archive', -84, -48, -66, -46, 2),
    box(68, 'Kitchen Stair', 'stair', KSTAIR, 1),
    R(69, 'Strongroom', 'treasury', -84, -56, -86, -66, 2),
    R(70, 'South Court (void)', 'void', -56, -30, -86, -66, 2),
    R(71, 'Illuminators', 'scriptorium', -84, -30, -106, -86, 2),
    R(72, 'Armoury of Honour', 'trophy', -30, 40, -66, -46, 4, 'ceremonial arms and the banners of the conquered, over the Gallery of Victories'),
    R(73, 'Library: gallery (void)', 'gallery_void', -30, 10, -106, -66, 4),
    R(74, 'Scholars\' Cells', 'office', 10, 40, -86, -66, 2),
    R(75, 'Scholars\' Cells', 'office', 10, 40, -106, -86, 2),
  ] + guests_S(76, 'guest_bed', 'Guest Chamber (upper)', 3) + [
    R(82, 'Guests\' Court (void)', 'void', 40, 70, -106, -66, 2),
    R(83, 'Rest Room of the Hammam', 'guest_ante', 70, 96, -106, -66, 3),
    R(84, 'Infirmary Wards', 'infirmary', 96, 124, -106, -66, 1),
  ], doors=[(-140, 43), (-140, -43), (140, 43), (140, -43)]))

# ---- F5 the state floor, storey 3
FLOORS.append(dict(id='F5', tier=1, R=R1, title='Floor 5: the State Floor, storey 3 (tier 1)',
  sub='the top galleries of the foyer and the octagon; the Skylit Gallery over the banquet hall (the owner\'s skylights: a Hall of Mirrors on the roof of the feast); the Treasury of the Sun over the ruler\'s rooms, reached by the Inner Stair alone; the senior household\'s chambers.',
  rooms=[
    R(1, 'Foyer: top gallery (void)', 'gallery_void', -132, -82, -28, 28, 4),
    R(2, 'Skylit Gallery', 'skylit_gallery', -82, -2, -18, 18, 4, 'over the banquet hall\'s ceiling; a promenade of receptions under glass; the sun\'s path painted on the beams'),
    R(3, 'Throne Room: second gallery (void)', 'gallery_void', -2, 62, -32, 32, 4),
    R(4, 'Archive of Judgments', 'archive', -126, -84, 46, 106, 2, 'over the Hall of Judgment\'s ceiling'),
    R(5, 'Guard (upper)', 'guard', -132, -118, 28, 40, 1),
    R(6, 'Guard (upper)', 'guard', -132, -118, -40, -28, 1),
    R(7, 'Ushers\' Chambers', 'chamber', -118, -100, 28, 40, 2),
    R(8, 'Door Stores', 'store', -118, -100, -40, -28, 0),
    R(9, 'Spice and Dry Store', 'store', -80, -48, 18, 40, 0),
    R(10, 'Lamp and Candle Store', 'store', -48, -24, 28, 40, 0),
    R(11, 'Senior Household: chambers', 'chamber', -82, -50, -40, -28, 3),
    R(12, 'Senior Household: chambers', 'chamber', -50, -24, -40, -28, 3),
    R(13, 'Clerks', 'office', -2, 30, 32, 40, 2),
    R(14, 'Master of the Household', 'chamber', 30, 62, 32, 40, 3),
    R(15, 'Chamberlains', 'chamber', -2, 30, -40, -32, 3),
    R(16, 'Chamberlains', 'chamber', 30, 62, -40, -32, 3),
    R(17, 'Keeper of the Treasury: antechamber', 'keeper', 62, 70, -26, 26, 3, 'the Keeper sits here; the only door to the vaults'),
    R(18, 'Vault Passage', 'passage', 70, 84, -4, 4, 2),
    R(19, 'Treasury Vault I: gold', 'treasury_vault', 70, 84, 4, 26, 3),
    R(20, 'Treasury Vault II: jewels and regalia', 'treasury_vault', 70, 84, -26, -4, 3),
    R(21, 'Vault Antechamber', 'antechamber', 84, 96, -12, 12, 3),
    box(22, 'Inner Stair', 'stair', ISTAIR, 4),
    R(23, 'Secret Stair (well, no landing)', 'stair', 84, 96, -26, -12, 1, 'passes this storey without a door'),
    R(24, 'Vault Gallery', 'gallery', 96, 110, 8, 26, 2),
    R(25, 'Vault Gallery', 'gallery', 96, 110, -26, -8, 2),
    R(26, 'Privy Court (void)', 'void', 96, 110, -8, 8, 3),
    R(27, 'Treasury Vault III: tribute', 'treasury_vault', 110, 130, 4, 26, 2),
    R(28, 'Counting and Assay of the Treasury', 'treasury', 110, 130, -10, 4, 2),
    R(29, 'Keeper\'s Chamber', 'chamber', 110, 130, -26, -10, 3),
    R(30, 'Treasury Guard', 'guard', 70, 104, 28, 40, 1),
    R(31, 'Treasury Clerks', 'office', 104, 124, 28, 40, 2),
    R(32, 'Treasury Clerks', 'office', 70, 104, -40, -28, 2),
    R(33, 'Treasury Records', 'archive', 104, 124, -40, -28, 2),
    R(34, 'North Service Hall', 'hall', -124, 124, 40, 46, 2),
    R(35, 'South Service Hall', 'hall', -124, 124, -46, -40, 2),
    box(36, 'Core Stair', 'stair', CORE, 2),
    R(37, 'Clerks', 'office', -84, -60, 46, 70, 2),
    R(38, 'Archive', 'archive', -60, -30, 46, 70, 2),
    box(39, 'Chancery Stair (head)', 'stair', CSTAIR, 1),
    R(40, 'Court Passage', 'passage', -72, -60, 70, 90, 1),
    R(41, 'Court Light Court (void)', 'void', -60, -30, 70, 90, 2),
    R(42, 'Advocates\' Chambers', 'chamber', -84, -30, 90, 106, 2),
    R(43, 'Suite I: upper rooms', 'guest_ante', -10, 6, 46, 76, 2),
    R(44, 'Suite II: upper rooms', 'guest_ante', 6, 22, 46, 76, 2),
    R(45, 'Suite III: upper rooms', 'guest_ante', 22, 40, 46, 76, 2),
    R(46, 'Guests\' Upper Sitting Room', 'guest_ante', -10, 22, 76, 106, 3),
    R(47, 'Guests\' Court (void)', 'void', 22, 40, 76, 92, 2),
    R(48, 'Guests\' Servants', 'dormitory', 22, 40, 92, 106, 0),
    R(49, 'Linen Rooms', 'store', 40, 64, 46, 66, 0),
    R(50, 'Dormitory', 'dormitory', 64, 82, 46, 66, 0),
    R(51, 'Dormitory', 'dormitory', 82, 100, 46, 66, 0),
    R(52, 'Tailors and Menders', 'workshop', 100, 124, 46, 66, 1),
    box(53, 'Servants\' Way', 'stair', SWAY, 1),
    R(54, 'Service Court (void)', 'void', 64, 100, 66, 86, 1),
    R(55, 'Lamplighters and Gilders', 'workshop', 100, 124, 66, 86, 1),
    R(56, 'Stores', 'store', 52, 110, 86, 106, 0),
    R(57, 'Guard', 'guard', 110, 124, 86, 106, 1),
    R(58, 'Ordinators\' Officers\' Chambers', 'chamber', -124, -100, -70, -46, 2),
    R(59, 'Dormitory', 'dormitory', -124, -100, -90, -70, 0),
    R(60, 'Chapel of the Guard', 'chapel', -124, -100, -106, -90, 2),
    R(61, 'Duty Dormitory', 'dormitory', -100, -84, -106, -46, 0),
    R(62, 'Archives of the Treasury', 'archive', -84, -48, -66, -46, 2),
    box(63, 'Kitchen Stair (head)', 'stair', KSTAIR, 1),
    R(64, 'Strongroom (upper)', 'treasury', -84, -56, -86, -66, 2),
    R(65, 'South Court (void)', 'void', -56, -30, -86, -66, 2),
    R(66, 'Bookbinders', 'scriptorium', -84, -30, -106, -86, 1),
    R(67, 'Banner Hall', 'trophy', -30, 40, -66, -46, 3, 'the standards of the regiments, over the Armoury of Honour'),
    R(68, 'Library: upper gallery (void)', 'gallery_void', -30, 10, -106, -66, 4),
    R(69, 'Scholars\' Cells', 'office', 10, 40, -86, -66, 2),
    R(70, 'Scholars\' Cells', 'office', 10, 40, -106, -86, 2),
  ] + guests_S(71, 'guest_bed', 'Guest Chamber (upper)', 2) + [
    R(77, 'Guests\' Court (void)', 'void', 40, 70, -106, -66, 2),
    R(78, 'Guests\' Servants', 'dormitory', 70, 96, -106, -66, 0),
    R(79, 'Infirmary Wards', 'infirmary', 96, 124, -106, -66, 1),
  ], doors=[(-140, 43), (-140, -43), (140, 43), (140, -43)]))

# ---- F6 the Inner Court (tier 2, storey 0)
FLOORS.append(dict(id='F6', tier=2, R=R2, title='Floor 6: the Inner Court of the Solar House (tier 2, storey 0)',
  sub='the private palace: the Hall of the Ancestors over the foyer, facing the Ancestry bridge; the dome rising through; the Solar House (Tzintzun\'s adopted kin and heirs, no consorts) round its garden court; the pleasure side south; the Hammam of the Sun east, where the Inner Stair arrives. Outside the tier wall, the upper terrace gardens on tier 1\'s roof.',
  rooms=[
    R(1, 'Hall of the Ancestors', 'ancestors_hall', -93, -50, -24, 24, 4, 'the ancestors\' altars and urns; the grand stair arrives from the foyer\'s top gallery; a window to the bridge'),
    R(2, 'Hall of Screens (antechamber of the Inner Court)', 'vestibule', -50, -2, -20, 20, 4, 'purple filigree screens; the Inner Guard'),
    R(3, 'Inner Guard', 'guard', -50, -30, 20, 34, 2),
    R(4, 'Inner Guard', 'guard', -50, -30, -34, -20, 2),
    R(5, 'The Dome (void over the throne room)', 'void', -2, 62, -32, 32, 4, 'the corbelled dome rises through this tier (keepAbove)'),
    R(6, 'Dome Gallery', 'dome_gallery', -2, 62, 32, 40, 3, 'a ring walk round the drum; windows into the throne room'),
    R(7, 'Dome Gallery', 'dome_gallery', -2, 62, -40, -32, 3),
    R(8, 'Dome Gallery (east)', 'dome_gallery', 62, 70, -26, 26, 3),
    R(9, 'Stair of the Sun', 'stair', 62, 70, 26, 40, 4, 'to the summit: the Dawn Pavilion'),
    R(10, 'Hammam of the Sun', 'hammam', 70, 93, -12, 12, 4, 'his own bath: hot, warm and cold rooms, the slab, wall fountains'),
    box(11, 'Inner Stair (landing)', 'stair', ISTAIR, 4, 'from the bedchamber and the treasury'),
    R(12, 'Rest Room of the Bath', 'bedchamber', 70, 84, 12, 26, 4),
    R(13, 'Furnace of the Bath', 'store', 70, 93, -40, -12, 0, 'the hypocaust, stoked from the Servants\' Way side'),
    R(14, 'Attendants of the Bath', 'dormitory', 62, 70, -40, -26, 0),
    R(15, 'Hall of the Solar House', 'kin_hall', -10, 30, 40, 70, 4, 'the kin dine and receive here'),
    R(16, 'Garden Court of the Solar House', 'court', -30, 30, 70, 93, 3, 'open to the sky; a pool and trees'),
    R(17, 'Kin Suite I', 'kin_chamber', -93, -60, 40, 66, 3, 'an heir: antechamber and chamber'),
    R(18, 'Kin Suite II', 'kin_chamber', -93, -60, 66, 93, 3),
    R(19, 'School of the Heirs', 'school', -60, -30, 40, 70, 3, 'the tutors teach the sun\'s law here'),
    R(20, 'Tutors', 'chamber', -60, -30, 70, 93, 2),
    R(21, 'Mistress of the House', 'chamber', 30, 62, 40, 66, 3, 'the matron who rules the Inner Court'),
    R(22, 'Servants of the House', 'dormitory', 52, 62, 66, 93, 0),
    R(23, 'Kin Suite III', 'kin_chamber', 62, 93, 40, 66, 3),
    R(24, 'Kin Suite IV', 'kin_chamber', 62, 93, 66, 93, 3),
    box(25, 'Servants\' Way', 'stair', SWAY, 1),
    R(26, 'Inner Kitchen', 'privy_kitchen', 30, 40, 66, 93, 1),
    R(27, 'Service Passage', 'passage', 40, 52, 80, 93, 1),
    R(28, 'Private Feast Hall', 'feast_private', -30, 30, -70, -40, 4, 'the pleasure side: music, dancers, the small feasts'),
    R(29, 'Music Room', 'music', -60, -30, -70, -40, 3),
    R(30, 'Garden Court (south)', 'court', -30, 30, -93, -70, 3),
    R(31, 'Astronomers\' College', 'astronomers', 30, 62, -70, -40, 3, 'the priests who read the sun'),
    box(32, 'Astronomers\' Stair', 'stair', (50, 62, -52, -40), 2, 'to the instruments on the summit'),
    R(33, 'Astronomers\' Cells', 'chamber', 30, 62, -93, -70, 2),
    R(34, 'Favourites\' Chambers', 'kin_chamber', -93, -60, -66, -40, 3),
    R(35, 'Favourites\' Chambers', 'kin_chamber', -93, -60, -93, -66, 3),
    R(36, 'Wardrobe of the Inner Court', 'wardrobe', -60, -30, -93, -70, 2),
    R(37, 'Plate Room', 'treasury', 62, 93, -66, -40, 2, 'the gold plate of the feasts'),
    R(38, 'Servants of the Feast', 'dormitory', 62, 93, -93, -66, 0),
    R(39, 'Passage of the Ancestors', 'passage', -30, -10, 53, 70, 2),
    box(40, 'Core Stair', 'stair', CORE, 2),
    R(41, 'Upper Terrace Gardens (tier 1\'s roof)', 'garden', -140, 140, -140, 140, 3, 'the ruler\'s garden east (over his rooms, round the open Privy Court), the Solar House\'s north, the astronomers\' south, the Ancestors\' west; reached from the state floor\'s third storey by the terrace flights'),
  ], ring=True, doors=[(95, 0), (-95, 0)]))

# ---- F7 the Inner Court, storey 1 (tier 2)
FLOORS.append(dict(id='F7', tier=2, R=R2, title='Floor 7: the Inner Court, storey 1 (tier 2)',
  sub='the upper rooms of the Solar House; the ruler\'s loggia over the Hall of Screens, from which he watches the Hall of the Ancestors unseen; the drum gallery of the dome; the cool rooms of the hammam.',
  rooms=[
    R(1, 'Hall of the Ancestors: gallery (void)', 'gallery_void', -93, -50, -24, 24, 4),
    R(2, 'Loggia of the Ruler', 'gallery', -50, -2, -20, 20, 4, 'screened; he watches the hall below and the bridge beyond'),
    R(3, 'Inner Guard (upper)', 'dormitory', -50, -30, 20, 34, 1),
    R(4, 'Inner Guard (upper)', 'dormitory', -50, -30, -34, -20, 1),
    R(5, 'The Dome (void)', 'void', -2, 62, -32, 32, 4),
    R(6, 'Drum Gallery (the mosaic ring)', 'dome_gallery', -2, 62, 32, 40, 4, 'the ringed giant\'s mosaic seen close'),
    R(7, 'Drum Gallery', 'dome_gallery', -2, 62, -40, -32, 4),
    R(8, 'Drum Gallery (east)', 'dome_gallery', 62, 70, -26, 26, 4),
    R(9, 'Stair of the Sun', 'stair', 62, 70, 26, 40, 4),
    R(10, 'Cool Room and Terrace of the Bath', 'bedchamber', 70, 93, -12, 12, 4, 'divans; opens east over the terrace garden'),
    box(11, 'Inner Stair (head)', 'stair', ISTAIR, 4),
    R(12, 'Rest Room (upper)', 'bedchamber', 70, 84, 12, 26, 3),
    R(13, 'Bath Stores', 'store', 70, 93, -40, -12, 0),
    R(14, 'Attendants (upper)', 'dormitory', 62, 70, -40, -26, 0),
    R(15, 'Hall of the Solar House: gallery (void)', 'gallery_void', -10, 30, 40, 70, 4),
    R(16, 'Garden Court (void)', 'void', -30, 30, 70, 93, 3),
    R(17, 'Kin Suite I: bedchamber', 'kin_chamber', -93, -60, 40, 66, 3),
    R(18, 'Kin Suite II: bedchamber', 'kin_chamber', -93, -60, 66, 93, 3),
    R(19, 'Dormitory of the Heirs', 'dormitory', -60, -30, 40, 70, 2),
    R(20, 'Tutors (upper)', 'chamber', -60, -30, 70, 93, 2),
    R(21, 'Mistress of the House: bedchamber', 'chamber', 30, 62, 40, 66, 3),
    R(22, 'Servants (upper)', 'dormitory', 52, 62, 66, 93, 0),
    R(23, 'Kin Suite III: bedchamber', 'kin_chamber', 62, 93, 40, 66, 3),
    R(24, 'Kin Suite IV: bedchamber', 'kin_chamber', 62, 93, 66, 93, 3),
    box(25, 'Servants\' Way', 'stair', SWAY, 1),
    R(26, 'Inner Kitchen: stores', 'store', 30, 40, 66, 93, 0),
    R(27, 'Service Passage', 'passage', 40, 52, 80, 93, 1),
    R(28, 'Private Feast Hall: gallery (void)', 'gallery_void', -30, 30, -70, -40, 4),
    R(29, 'Instrument Store', 'store', -60, -30, -70, -40, 1),
    R(30, 'Garden Court (void)', 'void', -30, 30, -93, -70, 3),
    R(31, 'Astronomers\' Library', 'library', 30, 62, -70, -40, 3),
    box(32, 'Astronomers\' Stair', 'stair', (50, 62, -52, -40), 2),
    R(33, 'Astronomers\' Cells (upper)', 'chamber', 30, 62, -93, -70, 2),
    R(34, 'Favourites (upper)', 'kin_chamber', -93, -60, -66, -40, 3),
    R(35, 'Favourites (upper)', 'kin_chamber', -93, -60, -93, -66, 3),
    R(36, 'Wardrobe (upper)', 'wardrobe', -60, -30, -93, -70, 2),
    R(37, 'Plate Room (upper)', 'treasury', 62, 93, -66, -40, 2),
    R(38, 'Servants (upper)', 'dormitory', 62, 93, -93, -66, 0),
    R(39, 'Passage', 'passage', -30, -10, 53, 70, 2),
    box(40, 'Core Stair', 'stair', CORE, 2),
  ]))

# ---- F8 the summit (tier 3)
FLOORS.append(dict(id='F8', tier=3, R=R3, title='Floor 8: the Summit (tier 3): the Dawn Pavilion and the High Garden',
  sub='the top deck: the dome\'s lantern at its centre, the Dawn Pavilion east of it where Tzintzun greets the sun, the solar altar, the astronomers\' instruments, a pool on the axis, the Kiosk of the Evening facing the Ancestry.',
  rooms=[
    R(1, 'Lantern of the Dome', 'lantern', 16, 44, -14, 14, 4, 'the oculus over the throne room: gilt ribs and glass'),
    R(2, 'Dawn Pavilion', 'pavilion', 46, 68, -18, 18, 4, 'an open kiosk facing the sunrise; a gilt seat; the morning rite'),
    R(3, 'Solar Altar', 'altar', 30, 46, 22, 40, 4, 'the private rite of the Sun'),
    R(4, 'Astronomers\' Instruments', 'astronomers', 0, 30, 24, 50, 2, 'the gnomon, the rings, the sighting stones'),
    R(5, 'Stair of the Sun (head)', 'stair', 62, 70, 26, 40, 4),
    box(6, 'Astronomers\' Stair (head)', 'stair', (50, 62, -52, -40), 2),
    R(7, 'Kiosk of the Evening', 'pavilion', -68, -46, -18, 18, 3, 'faces the Ancestry canton and the sunset'),
    R(8, 'Pool of the Sky', 'court', -40, 14, -10, 10, 3, 'a long reflecting pool on the axis to the lantern'),
    R(9, 'Beacon', 'beacon', -50, -36, 36, 50, 1, 'the palace\'s fire, seen from the sea'),
    box(10, 'Core Stair House', 'stair', CORE, 1),
    R(11, 'Gardeners\' Store and the Servants\' Way head', 'store', 40, 52, 48, 60, 0),
    R(12, 'Grove of the Ancestors', 'garden', -60, -20, -60, -20, 3, 'cypress-like trees in porphyry tubs'),
    R(13, 'Guard Kiosk', 'guard', -20, 0, -60, -40, 1),
    R(14, 'High Garden', 'garden', -70, 70, -70, 70, 3, 'the rest of the deck: beds, pergolas, gilt railings'),
  ]))

# ------------------------------------------------------------------------------------------------ furniture
# catalog keys: voth_court_<role> and voth_common_<role> (kits/catalog FK.set), generic_<role> and generic_trade_<role>
# (the poor set), the bespoke Voth pieces, and the city's own set (VC.intPrograms). NEW marks a piece the catalog lacks.
NEW = {
  'voth_court_sun_throne': 'the Throne of the Sun: a gilt octagonal seat under its own small baldachin, the orb above the back',
  'voth_court_judge_dais': 'the judge\'s bench on its dais (the Hall of Judgment keeps the daises as decor; this is the bench itself)',
  'voth_court_wall_fountain': 'a gilt wall fountain with a green-tile basin (the hammams, the privy court)',
  'voth_court_bath_slab': 'the hammam\'s heated slab, marble, octagonal',
  'voth_court_bath_pool': 'a sunken pool with steps, green tile',
  'voth_court_sun_altar': 'the altar of the Sun: a gilt disc on a porphyry block, a fire bowl before it',
  'voth_court_staff_stand': 'the reliquary stand of the Golden Staff (unique)',
  'voth_court_strongbox': 'an iron-bound gilt coffer with three locks',
  'voth_court_map_table': 'a map table with the Ring Sea inlaid',
  'voth_court_lectern': 'a gilt lectern',
  'voth_court_armillary': 'the astronomers\' rings and gnomon',
  'voth_court_palanquin': 'the ruler\'s litter, parked',
  'voth_court_trophy_stand': 'a trophy stand: captured arms and a banner of the conquered city',
  'voth_court_baldachin_bed': 'the state bed with a full canopy (voth_court_bed has hangings; this one a tester on four posts)',
  'voth_common_drum_stand': 'drums and a stand (the musicians)',
  'voth_common_spit': 'a roasting spit over an open hearth',
  'voth_common_cauldron': 'a great cauldron on a tripod',
  'voth_common_drying_rack': 'a laundry drying rack',
  'voth_common_copper': 'a laundry copper on its fire',
  'voth_common_manacles': 'wall manacles and chains',
  'voth_common_pit_grate': 'the oubliette\'s grate',
  'voth_common_ice_box': 'a straw-packed ice chest',
  'voth_common_litter_rack': 'a rack for the litter bearers\' poles',
  'voth_common_bath_basin': 'a stone basin with a tap (the guests\' bath)',
}
CITY = {'voth_bread_oven': 'the Voth set\'s bread oven (VC)', 'voth_cell_grate': 'the Voth set\'s cell grate (VC)'}

def dressing(a, per, D):
    """the hangings, lamps, rugs, plants and statues by decor level: a is the area, per the perimeter"""
    out = []
    if D >= 4:
        out += [('voth_court_tapestry', max(2, round(per / 10))), ('voth_court_painted_hanging', max(1, round(per / 30))),
                ('voth_court_frieze', max(2, round(per / 14))), ('voth_court_carpet', max(1, round(a / 60))),
                ('voth_court_statue', max(2, round(a / 120))), ('voth_court_lamp', max(2, round(a / 30))),
                ('voth_court_hanging', max(1, round(a / 70))), ('voth_court_candelabra', max(1, round(a / 80))),
                ('voth_planter', max(2, round(a / 90))), ('voth_court_fire', max(1, round(a / 150))), ('voth_court_art', max(1, round(per / 24)))]
    elif D == 3:
        out += [('voth_court_tapestry', max(1, round(per / 16))), ('voth_court_wall_rug', max(1, round(per / 30))),
                ('voth_court_carpet', max(1, round(a / 80))), ('voth_court_lamp', max(1, round(a / 40))),
                ('voth_court_hanging', max(1, round(a / 90))), ('voth_planter', max(1, round(a / 120))),
                ('voth_court_art', max(1, round(per / 30))), ('voth_court_statue', round(a / 300))]
    elif D == 2:
        out += [('voth_common_rug', max(1, round(a / 60))), ('voth_common_lamp', max(1, round(a / 45))),
                ('voth_common_art', max(1, round(per / 30))), ('voth_common_banner', round(per / 40)),
                ('voth_common_hanging', round(a / 100)), ('voth_common_scroll', round(per / 50))]
    elif D == 1:
        out += [('voth_common_lamp', max(1, round(a / 60))), ('voth_common_hanging', round(a / 120)), ('voth_common_banner', round(per / 80))]
    else:
        out += [('generic_lamp', max(1, round(a / 90)))]
    return [(k, n) for k, n in out if n > 0]

def program(kind, a, w, d, D):
    """the pieces a room kind needs, before its dressing. Counts scale with the area where it matters."""
    big = a > 400
    cs = lambda n: max(1, round(n))
    P = {
      'entrance': [('voth_court_statue', 2), ('voth_court_fire', 2), ('voth_court_banner', 4)],
      'passage': [], 'hall': [('voth_court_lamp' if D >= 2 else 'voth_common_lamp', cs(a / 60)), ('voth_common_bench', cs(a / 120))],
      'stair': [('voth_common_lamp', 1)], 'void': [], 'gallery_void': [('voth_court_banner', cs(a / 90))],
      'guard': [('voth_common_table', 1), ('voth_common_bench', 2), ('voth_court_armour_stand', 2), ('voth_common_rack', 2), ('voth_common_fire', 1), ('voth_common_chest', 1)],
      'office': [('voth_common_desk', cs(a / 40)), ('voth_common_chair', cs(a / 30)), ('voth_common_bookcase', cs(a / 50)), ('voth_common_chest', 1), ('voth_common_board', 1)],
      'store': [('voth_common_store', cs(a / 25)), ('generic_trade_bin', cs(a / 40)), ('voth_common_wall_shelves', cs(a / 60)), ('voth_common_ladder', 1)],
      'foyer': [('voth_court_divan', 6), ('voth_court_low_table', 3), ('voth_planter', 8), ('voth_court_statue', 6), ('voth_court_fire', 4)],
      'banquet': [('voth_court_table', 12), ('voth_court_throne', 2), ('voth_court_divan', 4), ('voth_common_chair', 96), ('voth_court_jug', 24), ('voth_court_bowl', 36), ('voth_court_candelabra', 12), ('voth_court_cabinet', 4)],
      'throne': [('voth_court_sun_throne', 1), ('voth_court_throne', 2), ('voth_common_bench', 12), ('voth_court_fire', 4), ('voth_court_statue', 8), ('voth_court_banner', 8)],
      'judgment': [('voth_court_judge_dais', 1), ('voth_court_throne', 3), ('voth_court_desk', 4), ('voth_common_chair', 8), ('voth_common_bench', 24), ('voth_court_lectern', 2), ('voth_court_banner', 6)],
      'vestibule': [('voth_court_divan', 2), ('voth_court_statue', 2), ('voth_court_screen', 2), ('voth_court_fire', 1)],
      'antechamber': [('voth_court_divan', cs(a / 40)), ('voth_court_low_table', cs(a / 60)), ('voth_common_chair', cs(a / 25)), ('voth_court_screen', 1)],
      'council': [('voth_court_table', 1), ('voth_court_throne', 1), ('voth_common_chair', 12), ('voth_court_map_table', 1), ('voth_court_cabinet', 2), ('voth_court_bookcase', 2), ('voth_court_screen', 2)],
      'cabinet': [('voth_court_desk', 1), ('voth_court_throne', 1), ('voth_court_divan', 2), ('voth_court_bookcase', 4), ('voth_court_cabinet', 2), ('voth_court_low_table', 1), ('voth_court_screen', 1), ('voth_court_hearth', 1)],
      'bedchamber': [('voth_court_baldachin_bed' if D >= 4 else 'voth_court_bed', 1), ('voth_court_divan', 2), ('voth_court_cabinet', 2), ('voth_court_low_table', 1), ('voth_court_screen', 2), ('voth_court_hearth', 1), ('voth_court_jug', 1)],
      'bath': [('voth_court_bath_pool', 1), ('voth_court_wall_fountain', 2), ('voth_court_divan', 2), ('voth_court_screen', 2), ('voth_court_cabinet', 1), ('voth_court_fire', 1)],
      'hammam': [('voth_court_bath_slab', 1), ('voth_court_bath_pool', 1), ('voth_court_wall_fountain', 4), ('voth_court_divan', 4), ('voth_court_screen', 3), ('voth_common_bench', 4), ('voth_court_fire', 2)],
      'oratory': [('voth_court_sun_altar', 1), ('voth_court_fire', 1), ('voth_court_carpet', 2), ('voth_common_ash_niche', 3), ('voth_court_candelabra', 2)],
      'library': [('voth_court_bookcase' if D >= 3 else 'voth_common_bookcase', cs(a / 20)), ('voth_court_table' if D >= 3 else 'voth_common_table', cs(a / 90)), ('voth_common_chair', cs(a / 35)), ('voth_court_lectern' if D >= 3 else 'voth_common_desk', cs(a / 150)), ('voth_common_ladder', cs(a / 200)), ('voth_court_map_table', 1 if 'map' in kind else 0)],
      'scriptorium': [('voth_common_desk', cs(a / 18)), ('voth_common_chair', cs(a / 18)), ('voth_common_bookcase', cs(a / 60)), ('voth_common_board', 1), ('voth_common_lamp', cs(a / 30))],
      'archive': [('voth_common_bookcase', cs(a / 15)), ('voth_common_desk', cs(a / 100)), ('voth_common_chair', cs(a / 100)), ('voth_common_ladder', cs(a / 150)), ('voth_common_chest', cs(a / 60))],
      'treasury': [('voth_court_strongbox', cs(a / 25)), ('voth_court_table', cs(a / 100)), ('voth_common_chair', cs(a / 60)), ('voth_court_cabinet', cs(a / 60)), ('voth_court_armour_stand', 1)],
      'treasury_vault': [('voth_court_strongbox', cs(a / 15)), ('generic_trade_bin', cs(a / 40)), ('voth_court_cabinet', cs(a / 60))],
      'keeper': [('voth_court_desk', 1), ('voth_court_throne', 1), ('voth_common_chair', 2), ('voth_court_cabinet', 2), ('voth_court_strongbox', 1), ('voth_court_screen', 1)],
      'guest_ante': [('voth_court_divan', cs(a / 45)), ('voth_court_low_table', 1), ('voth_common_chair', cs(a / 40)), ('voth_court_screen', 1), ('voth_court_cabinet', 1)],
      'guest_bed': [('voth_court_bed' if D >= 3 else 'voth_common_bed', 1), ('voth_common_chest', 1), ('voth_court_divan' if D >= 3 else 'voth_common_chair', 1), ('voth_common_table', 1), ('voth_court_screen' if D >= 3 else 'voth_common_screen', 1), ('voth_court_jug', 1)],
      'guest_hall': [('voth_court_table', cs(a / 60)), ('voth_common_chair', cs(a / 8)), ('voth_court_divan', 2), ('voth_court_cabinet', 2), ('voth_court_jug', cs(a / 60))],
      'servants_hall': [('voth_common_table', cs(a / 35)), ('voth_common_bench', cs(a / 18)), ('voth_common_store', 2), ('voth_common_hearth', 1), ('voth_common_jug', cs(a / 40)), ('voth_common_bowl', cs(a / 40))],
      'dormitory': [('generic_trade_bunk' if D == 0 else 'voth_common_bed', cs(a / 9)), ('generic_trade_locker' if D == 0 else 'voth_common_chest', cs(a / 18)), ('voth_common_stool', cs(a / 40))],
      'chamber': [('voth_common_bed', 1), ('voth_common_chest', 1), ('voth_common_chair', 2), ('voth_common_table', 1), ('voth_common_desk', 1), ('voth_common_screen', 1)],
      'kin_chamber': [('voth_court_bed', 1), ('voth_court_divan', 2), ('voth_court_low_table', 1), ('voth_court_cabinet', 2), ('voth_court_desk', 1), ('voth_court_screen', 2), ('voth_court_hearth', 1)],
      'kin_hall': [('voth_court_table', 3), ('voth_court_throne', 1), ('voth_common_chair', 24), ('voth_court_divan', 4), ('voth_court_cabinet', 2), ('voth_court_jug', 6)],
      'school': [('voth_common_desk', 8), ('voth_common_chair', 10), ('voth_common_board', 2), ('voth_common_bookcase', 4), ('voth_court_desk', 1), ('voth_court_throne', 1)],
      'kitchen': [('voth_court_hearth' if D >= 3 else 'voth_common_hearth', cs(a / 90)), ('voth_common_spit', cs(a / 250)), ('voth_bread_oven', cs(a / 300)), ('voth_common_workbench', cs(a / 50)), ('voth_common_table', cs(a / 90)), ('voth_common_store', cs(a / 35)), ('voth_common_wall_shelves', cs(a / 60)), ('voth_common_cauldron', cs(a / 200)), ('voth_common_jug', cs(a / 40)), ('voth_common_bowl', cs(a / 40))],
      'privy_kitchen': [('voth_common_hearth', 2), ('voth_common_workbench', 2), ('voth_common_store', 4), ('voth_common_wall_shelves', 2), ('voth_common_table', 1), ('voth_common_jug', 2)],
      'larder': [('generic_trade_larder', cs(a / 20)), ('voth_common_store', cs(a / 25)), ('voth_common_wall_shelves', cs(a / 40)), ('voth_common_ice_box', 1 if 'Cold' in kind else 0)],
      'scullery': [('voth_common_workbench', 2), ('voth_common_store', 3), ('voth_common_wall_shelves', 2), ('voth_common_bowl', 6)],
      'buttery': [('generic_trade_barrel', cs(a / 20)), ('voth_common_store', cs(a / 30)), ('voth_common_counter', 1), ('voth_common_jug', 8)],
      'servery': [('voth_common_counter', 2), ('voth_common_table', 2), ('voth_common_wall_shelves', 2), ('voth_common_jug', 6), ('voth_common_bowl', 8)],
      'music': [('voth_common_chair', cs(a / 20)), ('voth_common_drum_stand', 2), ('voth_court_divan', 1 if D >= 3 else 0), ('voth_common_chest', 2)],
      'wardrobe': [('voth_court_cabinet' if D >= 2 else 'voth_common_chest', cs(a / 20)), ('voth_common_rack', cs(a / 30)), ('voth_common_table', 1), ('voth_court_screen' if D >= 3 else 'voth_common_screen', 1)],
      'infirmary': [('voth_common_bed', cs(a / 20)), ('voth_common_table', cs(a / 100)), ('voth_common_wall_shelves', cs(a / 60)), ('voth_common_store', 2), ('voth_common_chair', cs(a / 80)), ('voth_common_hearth', 1)],
      'trophy': [('voth_court_trophy_stand', cs(a / 70)), ('voth_court_armour_stand', cs(a / 100)), ('voth_court_statue', cs(a / 150)), ('voth_court_banner', cs(a / 50)), ('voth_court_divan', 2)],
      'skylit_gallery': [('voth_court_divan', 8), ('voth_court_low_table', 4), ('voth_court_statue', 6), ('voth_planter', 12), ('voth_court_candelabra', 8)],
      'court': [('voth_planter', cs(a / 30)), ('voth_bench', cs(a / 80)), ('voth_court_wall_fountain' if D >= 3 else 'hl_rep_roofed_well', 1), ('voth_statue', 1 if D >= 3 else 0)],
      'garden': [('voth_planter', cs(a / 150)), ('voth_bench', cs(a / 300)), ('voth_statue', cs(a / 800)), ('voth_street_brazier', cs(a / 600))],
      'cell': [('voth_cell_grate', cs(a / 144)), ('generic_bed', cs(a / 36)), ('generic_bowl', cs(a / 36)), ('voth_common_manacles', cs(a / 72))],
      'guardroom_dungeon': [('voth_common_table', 1), ('voth_common_bench', 2), ('voth_common_fire', 1), ('voth_common_rack', 1), ('voth_common_chest', 1), ('voth_common_pit_grate', 1)],
      'interrogation': [('voth_common_table', 1), ('voth_common_chair', 2), ('voth_common_manacles', 2), ('voth_common_fire', 1), ('voth_common_rack', 1)],
      'pit': [('voth_common_manacles', 2)],
      'cistern': [], 'boathouse': [('voth_canoe', cs(a / 150)), ('voth_common_rack', cs(a / 100)), ('voth_common_workbench', 1)],
      'armoury': [('voth_court_armour_stand', cs(a / 30)), ('generic_trade_weapon_rack', cs(a / 25)), ('voth_common_rack', cs(a / 40)), ('voth_common_workbench', 1), ('voth_common_chest', cs(a / 60))],
      'barracks': [('generic_trade_bunk', cs(a / 8)), ('generic_trade_locker', cs(a / 16)), ('voth_common_table', cs(a / 150)), ('voth_common_bench', cs(a / 75)), ('voth_common_rack', cs(a / 100))],
      'drill': [('generic_trade_training_dummy', cs(a / 250)), ('generic_trade_archery_butt', cs(a / 600)), ('voth_common_rack', 4), ('voth_bench', 4)],
      'laundry': [('generic_trade_vat', cs(a / 60)), ('voth_common_copper', cs(a / 150)), ('voth_common_drying_rack', cs(a / 80)), ('voth_common_workbench', cs(a / 120)), ('voth_common_store', cs(a / 100))],
      'workshop': [('voth_common_workbench', cs(a / 40)), ('voth_common_rack', cs(a / 60)), ('voth_common_store', cs(a / 60)), ('voth_common_stool', cs(a / 40)), ('generic_trade_lathe', cs(a / 400)), ('voth_loom_display', cs(a / 600))],
      'bakehouse': [('voth_bread_oven', cs(a / 150)), ('voth_common_workbench', cs(a / 80)), ('voth_common_store', cs(a / 60)), ('generic_trade_bin', cs(a / 80))],
      'brewhouse': [('voth_craft_brewer', 1), ('generic_trade_still', cs(a / 200)), ('generic_trade_vat', cs(a / 100)), ('generic_trade_barrel', cs(a / 30))],
      'butchery': [('voth_common_workbench', cs(a / 100)), ('voth_common_rack', cs(a / 100)), ('voth_common_store', cs(a / 60)), ('voth_common_cauldron', 2)],
      'weighing': [('voth_common_counter', cs(a / 150)), ('voth_common_desk', 1), ('voth_common_chair', 2), ('generic_trade_bin', cs(a / 60)), ('voth_common_board', 1)],
      'lodging': [('voth_court_bed' if D >= 3 else 'voth_common_bed', cs(a / 400)), ('voth_court_divan' if D >= 3 else 'voth_common_chair', cs(a / 150)), ('voth_court_table' if D >= 3 else 'voth_common_table', cs(a / 300)), ('voth_common_chair', cs(a / 100)), ('voth_court_cabinet' if D >= 3 else 'voth_common_chest', cs(a / 200)), ('voth_court_desk' if D >= 3 else 'voth_common_desk', 1), ('voth_court_hearth' if D >= 3 else 'voth_common_hearth', cs(a / 500)), ('voth_court_screen' if D >= 3 else 'voth_common_screen', cs(a / 300)), ('voth_common_store', cs(a / 400))],
      'chapel': [('voth_court_sun_altar', 1), ('voth_common_ash_niche', 4), ('voth_common_bench', cs(a / 40)), ('voth_court_fire', 1)],
      'petitions': [('voth_court_throne', 1), ('voth_court_desk', 2), ('voth_common_bench', cs(a / 30)), ('voth_common_desk', 4), ('voth_common_chair', 6), ('voth_court_banner', 6), ('voth_court_screen', 2)],
      'ministry': [('voth_common_desk', cs(a / 35)), ('voth_common_chair', cs(a / 30)), ('voth_common_bookcase', cs(a / 40)), ('voth_court_desk', cs(a / 800)), ('voth_court_throne', cs(a / 800)), ('voth_common_chest', cs(a / 100)), ('voth_common_board', cs(a / 400)), ('voth_common_table', cs(a / 300))],
      'divan': [('voth_court_throne', 1), ('voth_court_divan', 10), ('voth_court_low_table', 4), ('voth_court_desk', 2), ('voth_common_chair', 6), ('voth_court_screen', 3), ('voth_court_cabinet', 2)],
      'ancestors_hall': [('voth_court_sun_altar', 1), ('voth_common_ash_niche', 12), ('voth_court_statue', 8), ('voth_court_fire', 4), ('voth_common_bench', 8), ('voth_court_candelabra', 6)],
      'dome_gallery': [('voth_common_bench', cs(a / 60)), ('voth_court_banner', cs(a / 60))],
      'feast_private': [('voth_court_table', 4), ('voth_court_divan', 10), ('voth_court_low_table', 6), ('voth_court_throne', 1), ('voth_court_cabinet', 2), ('voth_court_jug', 10), ('voth_court_bowl', 12), ('voth_common_drum_stand', 2)],
      'astronomers': [('voth_court_armillary', 1 if a < 500 else 3), ('voth_common_desk', cs(a / 60)), ('voth_common_chair', cs(a / 50)), ('voth_common_bookcase', cs(a / 80)), ('voth_court_map_table', 1), ('voth_common_board', 1)],
      'pavilion': [('voth_court_throne', 1), ('voth_court_divan', 4), ('voth_court_low_table', 2), ('voth_court_fire', 2), ('voth_planter', 6), ('voth_court_banner', 4)],
      'altar': [('voth_court_sun_altar', 1), ('voth_court_fire', 2), ('voth_court_statue', 2), ('voth_court_carpet', 1)],
      'lantern': [('voth_court_candelabra', 4)], 'beacon': [('voth_street_brazier', 1), ('voth_common_store', 2), ('voth_common_rack', 1)],
    }
    if kind in EXTRA_PROGRAMS: return [(k, n) for k, n in EXTRA_PROGRAMS[kind](a, w, d, D) if n > 0]
    return [(k, n) for k, n in P.get(kind, []) if n > 0]

def manifest_for(room):
    w = room['u1'] - room['u0']; d = room['v1'] - room['v0']; a = w * d; per = 2 * (w + d)
    kind = room['kind']; D = room['decor']
    items = program(kind if kind != 'library' or 'Map' not in room['name'] else 'library', a, w, d, D)
    if 'Map' in room['name'] and kind == 'library': items.append(('voth_court_map_table', 2))
    if 'Cold' in room['name'] and kind == 'larder': items.append(('voth_common_ice_box', 2))
    if kind not in ('void', 'gallery_void', 'stair', 'passage', 'cistern', 'pit', 'lantern', 'garden', 'court', 'drill', 'boathouse'):
        items += dressing(a, per, D)
    # merge duplicates; a tier 0 zone is drawn as one room where the planner will cut rooms round corridors and
    # courts, so a quarter of its floor is furnished (the census sets the real numbers: 150 household, the garrison)
    agg = {}
    for k, n in items:
        k = KEYMAP.get(k, k)                  # another culture's blueprint maps the Voth keys onto its own sets
        if k: agg[k] = agg.get(k, 0) + n
    if room.get('zone'):
        agg = dict((k, max(1, round(n * 0.25))) for k, n in agg.items())
    return agg, a

KEYMAP = {}
EXTRA_PROGRAMS = {}   # another culture's room kinds: kind -> function(a, w, d, D) -> [(key, n)]

# ------------------------------------------------------------------------------------------------ drawing
DECOR_FILL = {0: (226, 226, 222), 1: (236, 232, 218), 2: (224, 236, 214), 3: (212, 226, 176), 4: (238, 220, 150)}
DECOR_NAME = {0: 'bare', 1: 'plain', 2: 'fine', 3: 'rich', 4: 'sumptuous'}
KIND_FILL = {'court': (214, 236, 250), 'void': (246, 246, 246), 'gallery_void': (250, 244, 226), 'stair': (150, 150, 150), 'ramp': (170, 160, 150), 'pool': (170, 214, 240),
             'garden': (214, 236, 206), 'passage': (240, 240, 236), 'hall': (240, 240, 236), 'cistern': (200, 222, 240), 'pit': (60, 60, 60)}

def wrap(dr, text, f, maxw):
    words = text.split(); lines = []; cur = ''
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if dr.textlength(t, font=f) <= maxw or not cur: cur = t
        else: lines.append(cur); cur = wd
    if cur: lines.append(cur)
    return lines

def draw_floor(F):
    Rr = F['R']; ring = F.get('ring')
    ext = 150 if ring else Rr + 16
    cu = cv = 0.0
    if F.get('rect') and not F.get('circle'):
        q = F['rect']; cu = (q[0] + q[1]) / 2.0; cv = (q[2] + q[3]) / 2.0; ext = max(q[1] - q[0], q[3] - q[2]) / 2.0 + 8
    s = 1700.0 / (2 * ext)
    PW = int(2 * ext * s); margin = 30; legendW = 1240
    f_t = font(40, True); f_s = font(22); f_l = font(21); f_lb = font(21, True); f_r = font(17, True); f_rn = font(15)
    # legend height estimate
    tmp = Image.new('RGB', (10, 10)); dt = ImageDraw.Draw(tmp)
    entries = []
    for r in F['rooms']:
        a = (r['u1'] - r['u0']) * (r['v1'] - r['v0'])
        head = '%d. %s' % (r['n'], r['name'])
        tail = ' (%s; %s; %d m2)' % (r['kind'].replace('_', ' '), DECOR_NAME[r['decor']], a) if r['kind'] not in ('void', 'gallery_void') else ''
        note = ('  ' + r['note']) if r['note'] else ''
        entries.append((head, tail, note))
    colw = (legendW - 40) // 2
    lines_total = 0; ent_lines = []
    for head, tail, note in entries:
        ls = wrap(dt, head + tail + note, f_l, colw)
        ent_lines.append(ls); lines_total += len(ls) + 0.35
    sub_lines = wrap(dt, F['sub'], f_s, PW + legendW)
    header = 60 + 30 * len(sub_lines) + 20
    legend_h = int(lines_total * 25 / 2) + 60
    H = header + max(PW, legend_h) + margin * 2
    W = PW + legendW + margin * 3
    img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((margin, 18), F['title'], font=f_t, fill=(20, 20, 20))
    for i, ln in enumerate(sub_lines): dr.text((margin, 64 + 30 * i), ln, font=f_s, fill=(70, 70, 70))
    ox, oy = margin, header + margin
    def X(u): return ox + (u - cu + ext) * s
    def Y(v): return oy + (ext - (v - cv)) * s
    # the tier outlines (the stack is eight-sided: corners cut)
    def octo(Rq, cut):
        return [(X(-Rq + cut), Y(Rq)), (X(Rq - cut), Y(Rq)), (X(Rq), Y(Rq - cut)), (X(Rq), Y(-Rq + cut)), (X(Rq - cut), Y(-Rq)), (X(-Rq + cut), Y(-Rq)), (X(-Rq), Y(-Rq + cut)), (X(-Rq), Y(Rq - cut))]
    if ring:
        dr.polygon(octo(140, 32), fill=(214, 236, 206), outline=(120, 140, 110))
    if F.get('circle'):
        dr.ellipse([X(-Rr), Y(Rr), X(Rr), Y(-Rr)], fill=(250, 250, 248), outline=(30, 30, 30), width=3)
    elif F.get('poly'):
        dr.polygon([(X(u), Y(v)) for u, v in F['poly']], fill=(250, 250, 248), outline=(30, 30, 30), width=4)
    elif F.get('rect'):
        q = F['rect']; dr.rectangle([X(q[0]), Y(q[3]), X(q[1]), Y(q[2])], fill=(250, 250, 248), outline=(30, 30, 30), width=3)
    else:
        dr.polygon(octo(Rr, Rr * 0.22), fill=(250, 250, 248), outline=(30, 30, 30))
    for q in F.get('outlines', []):
        dr.rectangle([X(q[0]), Y(q[3]), X(q[1]), Y(q[2])], outline=(110, 110, 110), width=2)
        if len(q) > 4: dr.text((X(q[0]) + 4, Y(q[3]) + 2), q[4], font=f_rn, fill=(110, 110, 110))
    # the north arrow / axis note
    dr.text((X(-ext) + 6, Y(ext) + 6), F.get('axisnote', 'u (main axis) ->   the entrance side at the left; v across, up on the sheet'), font=f_rn, fill=(90, 90, 90))
    for r in F['rooms']:
        if r['kind'] == 'garden' and r['u1'] - r['u0'] > 2 * Rr * 0.9: continue
        x0, x1, y0, y1 = X(r['u0']), X(r['u1']), Y(r['v1']), Y(r['v0'])
        fill = KIND_FILL.get(r['kind'], DECOR_FILL[r['decor']])
        dr.rectangle([x0, y0, x1, y1], fill=fill, outline=(40, 40, 40), width=2 if r['decor'] >= 3 else 1)
        if r['kind'] in ('void', 'gallery_void'):
            for k in range(int(x0), int(x1), 14): dr.line([(k, y1), (min(k + (y1 - y0), x1), max(y0, y1 - (x1 - k)))], fill=(200, 200, 200), width=1)
        if r['kind'] == 'stair':
            dr.line([(x0, y0), (x1, y1)], fill=(255, 255, 255), width=2); dr.line([(x0, y1), (x1, y0)], fill=(255, 255, 255), width=2)
        if r['kind'] == 'ramp':
            dr.ellipse([x0 + 4, y0 + 4, x1 - 4, y1 - 4], outline=(255, 255, 255), width=3)
        w, h = x1 - x0, y1 - y0
        lbl = str(r['n'])
        tw = dr.textlength(lbl, font=f_r)
        if w > 26 and h > 18:
            dr.text((x0 + w / 2 - tw / 2, y0 + h / 2 - 10), lbl, font=f_r, fill=(0, 0, 0))
            if w > 110 and h > 44:
                ls = wrap(dr, r['name'], f_rn, w - 10)[:3]
                for i, ln in enumerate(ls):
                    tw2 = dr.textlength(ln, font=f_rn)
                    dr.text((x0 + w / 2 - tw2 / 2, y0 + h / 2 + 10 + 16 * i), ln, font=f_rn, fill=(40, 40, 40))
        elif w > 14 and h > 14:
            dr.text((x0 + 2, y0 + 1), lbl, font=f_rn, fill=(0, 0, 0))
    for (u, v) in F.get('pillars', []):
        dr.ellipse([X(u) - 5, Y(v) - 5, X(u) + 5, Y(v) + 5], fill=(60, 60, 60))
    if F.get('octagon'):
        u0, u1, v0, v1, c = F['octagon']
        pts = [(X(u0 + c), Y(v1)), (X(u1 - c), Y(v1)), (X(u1), Y(v1 - c)), (X(u1), Y(v0 + c)), (X(u1 - c), Y(v0)), (X(u0 + c), Y(v0)), (X(u0), Y(v0 + c)), (X(u0), Y(v1 - c))]
        dr.polygon(pts, outline=(0, 0, 0), width=3)
    if F.get('dais'):
        u, v, rr = F['dais']; dr.regular_polygon((X(u), Y(v), rr * s), 8, fill=(220, 180, 60), outline=(0, 0, 0))
    for (u, v) in F.get('doors', []):
        dr.rectangle([X(u) - 7, Y(v) - 7, X(u) + 7, Y(v) + 7], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
        dr.text((X(u) + 10 if u < 0 else X(u) - 72, Y(v) - 20), 'door', font=f_rn, fill=(0, 0, 0))
    # scale bar
    bx, by = X(-ext) + 10, Y(-ext) - 12
    dr.line([(bx, by), (bx + 50 * s, by)], fill=(0, 0, 0), width=3); dr.text((bx, by - 22), '50 m', font=f_rn, fill=(0, 0, 0))
    # legend
    lx = ox + PW + margin; ly = oy - 10
    dr.text((lx, ly), 'Key', font=f_lb, fill=(0, 0, 0)); ly += 30
    # decor swatches
    sx = lx
    for Dv in range(5):
        dr.rectangle([sx, ly, sx + 18, ly + 18], fill=DECOR_FILL[Dv], outline=(0, 0, 0)); dr.text((sx + 24, ly - 2), DECOR_NAME[Dv], font=f_rn, fill=(0, 0, 0)); sx += 110
    dr.rectangle([sx, ly, sx + 18, ly + 18], fill=KIND_FILL['court'], outline=(0, 0, 0)); dr.text((sx + 24, ly - 2), 'open court', font=f_rn, fill=(0, 0, 0)); sx += 110
    dr.rectangle([sx, ly, sx + 18, ly + 18], fill=KIND_FILL['stair'], outline=(0, 0, 0)); dr.text((sx + 24, ly - 2), 'stair', font=f_rn, fill=(0, 0, 0)); sx += 80
    dr.rectangle([sx, ly, sx + 18, ly + 18], fill=KIND_FILL['void'], outline=(0, 0, 0)); dr.text((sx + 24, ly - 2), 'void (open to below)', font=f_rn, fill=(0, 0, 0))
    ly += 34
    col = 0; cy = ly; half = lines_total / 2.0; acc = 0
    for (head, tail, note), ls in zip(entries, ent_lines):
        if col == 0 and acc >= half: col = 1; cy = ly
        cx = lx + col * (colw + 40)
        for i, ln in enumerate(ls):
            if i == 0:
                dr.text((cx, cy), ln[:len(head)] if ln.startswith(head) else ln, font=f_lb if ln.startswith(head) else f_l, fill=(0, 0, 0))
                if ln.startswith(head):
                    dr.text((cx + dr.textlength(head, font=f_lb), cy), ln[len(head):], font=f_l, fill=(60, 60, 60))
            else: dr.text((cx + 18, cy), ln, font=f_l, fill=(60, 60, 60))
            cy += 25
        cy += 8; acc += len(ls) + 0.35
    return img

def draw_section():
    f_t = font(40, True); f = font(20); fb = font(20, True); fs = font(17)
    W, H = 2400, 1400; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Section through the main axis (u): the tiers, the storeys and the stairs (heights x3)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), "Storey heights are the planner's least (6.5 m in the Palace; the state floor's three are taller) and the tier radii are assumed: read both from VC.INT.cantons.Palace.tiers when wiring. Water at the apron.", font=f, fill=(70, 70, 70))
    sx = 4.6; sy = 12.0; ox = W / 2 - 60; base = H - 150
    def X(u): return ox + u * sx
    def Y(h): return base - h * sy
    dr.rectangle([0, Y(0), W, H], fill=(214, 236, 250))
    tiers = [(R0, [('F-1 Oubliette and cellars', -5.2, 0, (226, 226, 222)), ('F0 Dock storey: water gate, stores, garrison, kitchens, workshops, the Quiet Office', 0, 7, (236, 232, 218)), ('F1 Household and the court town', 7, 14, (236, 232, 218)), ('F2 Chancery: the ministries, the Hall of Petitions, the Divan', 14, 21, (224, 236, 214))]),
             (R1, [("F3 State floor 1: porch, foyer, banquet, throne, the privy door, the ruler's suite, judgment", 21, 31, (238, 220, 150)), ('F4 State floor 2: galleries, robing room, chamber of the staff', 31, 41, (238, 220, 150)), ('F5 State floor 3: skylit gallery, treasury of the Sun', 41, 51, (238, 220, 150))]),
             (R2, [('F6 Inner Court: Hall of the Ancestors, the Solar House, the hammam', 51, 58, (212, 226, 176)), ("F7 Inner Court upper: the ruler's loggia, the drum gallery", 58, 65, (212, 226, 176))]),
             (R3, [('F8 Summit: lantern, Dawn Pavilion, altar, high garden', 65, 72, (214, 236, 206))])]
    for Rq, sts in tiers:
        for name, h0, h1, col in sts:
            dr.rectangle([X(-Rq), Y(h1), X(Rq), Y(h0)], fill=col, outline=(30, 30, 30), width=2)
            dr.text((X(-Rq) + 8, Y(h1) + 6), name, font=fb if 'State' in name else f, fill=(0, 0, 0))
    dr.pieslice([X(-2), Y(72 + 12), X(62), Y(72 - 12)], 180, 360, fill=(238, 220, 150), outline=(30, 30, 30), width=2)
    dr.rectangle([X(16), Y(86), X(44), Y(81)], fill=(250, 240, 200), outline=(30, 30, 30), width=2); dr.text((X(16) + 4, Y(86) - 24), 'lantern of the dome', font=fs, fill=(0, 0, 0))
    for u0, u1, h0, h1, name in [(-132, -82, 21, 51, 'Foyer, 3 storeys'), (-82, -2, 21, 41, 'Banquet Hall, 2 storeys'), (-82, -2, 41, 51, 'Skylit Gallery'), (-2, 62, 21, 51, 'Octagon of the Sun, 3 storeys; the dome above'), (62, 130, 21, 31, 'Privy Door, the suite'), (62, 130, 41, 51, 'Treasury of the Sun'), (70, 93, 51, 58, 'Hammam')]:
        dr.rectangle([X(u0), Y(h1), X(u1), Y(h0)], outline=(120, 80, 0), width=3)
        dr.text((X(u0) + 6, Y(h0) - 24), name, font=fs, fill=(120, 80, 0))
    k = 0
    for u, h0, h1, name, col in [(-20, -5.2, 72, 'Core Stair', (0, 0, 0)), (46, 0, 72, "Servants' Way", (0, 120, 0)), (-42, 0, 51, 'Kitchen Stair', (150, 80, 0)), (-78, 14, 51, 'Chancery Stair', (0, 0, 160)), (90, 21, 65, 'Inner Stair', (160, 0, 120)), (96, -5.2, 31, 'Secret Stair', (160, 0, 0)), (9, -5.2, 21, 'Gaol Stair', (80, 80, 80)), (66, 51, 72, 'Stair of the Sun', (200, 120, 0))]:
        dr.line([(X(u), Y(h0)), (X(u), Y(h1))], fill=col, width=5)
        dr.text((X(u) + 6, Y(h1) - 24 - 20 * (k % 2)), name, font=fs, fill=col); k += 1
    dr.line([(X(-290), Y(21)), (X(-140), Y(21))], fill=(80, 80, 80), width=8); dr.text((X(-290), Y(21) - 26), 'the Ancestry bridge -> Bridge Porch', font=fs, fill=(0, 0, 0))
    dr.line([(X(-260), Y(0)), (X(-200), Y(0))], fill=(80, 80, 80), width=8); dr.text((X(-260), Y(0) - 26), 'ferry pier -> Water Gate', font=fs, fill=(0, 0, 0))
    dr.text((X(-196), Y(-5.2) + 6), 'Death Gate: a hidden arch at the water line on the south face (not in this plane)', font=fs, fill=(120, 0, 0))
    dr.text((X(140) + 10, Y(21) - 26), "terrace gardens on tier 0's roof: the service halls' doors", font=fs, fill=(0, 90, 0))
    dr.text((X(95) + 10, Y(51) - 26), "upper terrace gardens on tier 1's roof; the Privy Court open to the sky", font=fs, fill=(0, 90, 0))
    dr.text((X(70) + 10, Y(72) - 26), 'high garden', font=fs, fill=(0, 90, 0))
    return img

# ------------------------------------------------------------------------------------------------ main
def main(floors=None, out=None, here=None, title=None, intro=None, section=None, zone_R=None):
    floors = floors or FLOORS; out = out or OUT; here = here or HERE; zone_R = zone_R or R0
    os.makedirs(out, exist_ok=True)
    totals = {}; lines = []
    lines.append(title or '# The Palace canton: furniture manifest\n')
    lines.append(intro or 'Generated by `blueprint.py` from the same room data as the floor sheets. Keys are catalog pieces (`kits/catalog`): `voth_court_*` and `voth_common_*` from the Voth sets, `generic_*` and `generic_trade_*` from the poor set, the bespoke Voth pieces, and the Voth city set\'s own (`VC`). A key marked **NEW** is not in the catalog yet; the list of them is at the end. Counts are a brief for the furnisher, not a placement: `furnishRoom` keeps what fits.\n')
    lines.append('Decor: 0 bare (stores, cells), 1 plain (service), 2 fine (offices, the lesser guests), 3 rich (state guests, kin, officials\' residences), 4 sumptuous (the state rooms, the ruler\'s own).\n')
    for F in floors:
        print('drawing', F['id'])
        img = draw_floor(F); img.save(os.path.join(out, F['id'] + '.png'))
        lines.append('\n## %s\n' % F['title'])
        lines.append(F['sub'] + '\n')
        lines.append('| # | Room | Kind | Decor | m2 | Pieces |')
        lines.append('|---|---|---|---|---|---|')
        for r in F['rooms']:
            if F['R'] == zone_R and (r['u1'] - r['u0']) * (r['v1'] - r['v0']) > 600: r['zone'] = True
            agg, a = manifest_for(r)
            if not agg and r['kind'] in ('void', 'gallery_void', 'passage', 'cistern'): continue
            parts = []
            for k in sorted(agg):
                parts.append('%s x%d%s' % (k, agg[k], ' **NEW**' if k in NEW else (' (VC)' if k in CITY else '')))
                totals[k] = totals.get(k, 0) + agg[k]
            lines.append('| %d | %s | %s | %s | %d | %s |' % (r['n'], r['name'], r['kind'].replace('_', ' '), DECOR_NAME[r['decor']], a, ', '.join(parts)))
    sec = (section or draw_section)(); sec.save(os.path.join(out, 'section.png'))
    lines.append('\n## Totals by piece\n')
    lines.append('| Key | Count | Note |'); lines.append('|---|---|---|')
    for k in sorted(totals, key=lambda q: -totals[q]):
        lines.append('| %s | %d | %s |' % (k, totals[k], NEW.get(k, CITY.get(k, ''))))
    lines.append('\n## Pieces the catalog lacks (NEW)\n')
    for k in sorted(NEW):
        lines.append('- `%s`: %s (x%d)' % (k, NEW[k], totals.get(k, 0)))
    if CITY: lines.append('\nVoth city set pieces (VC.intPrograms, not in `kits/catalog`): ' + ', '.join('`%s` (%s)' % (k, v) for k, v in CITY.items()) + '.\n')
    with open(os.path.join(here, 'FURNITURE.md'), 'w', encoding='utf-8') as fh: fh.write('\n'.join(lines))
    print('wrote', len(floors), 'sheets, section, FURNITURE.md; pieces total', sum(totals.values()))

if __name__ == '__main__':
    main()
