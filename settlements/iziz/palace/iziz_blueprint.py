#!/usr/bin/env python3
"""The Iziz palace citadel blueprint: the precinct on the mesa, the tiered palace block, the tower, and the Ancient
levels in the mesa (the depot and the core). Sheets and the manifest come from settlements/voth/palace/blueprint.py.

Frame: u runs from the citadel gate inward (the gate is at u = -84, drawn on the left; the palace block's grand
entrance faces it); v across (v > 0 drawn up). Metres. The block is 96 across (v) by 84 deep (u), centred 20 m behind
the hill's centre, so it spans u -22..62, v -48..48 (settlements/iziz/src/78-transplant.js 'palace',
targets/city/90a-city-world.js places it). Tier 2 spans u -5..53, v -25..33 (y 14..28); tier 3 is the hangar hall
(u 8..22, v -10..8, 11 m high, open to the terrace), its flanks and the rear mass (u 22..48, v -15..31, y 28..50);
the tower stands on the rear mass's east part (u 20..40, v 6..26, y 50..80, a 14 m cap to 91).

    python3 iziz_blueprint.py        # writes floors/*.png and FURNITURE.md next to this file
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'voth', 'palace'))
import blueprint as B
from blueprint import R, box
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'floors')

# the stairs and shafts, the same on every sheet they pass
WELL = (6, 24, -12, 10)        # the Well of the Machine: the Ancient hangar lift, depot to the hall
GSTAIR = (24, 32, -17, -9)     # the Great Stair, base tier to the lararium's west end on the hall level
DSTAIR = (50, 62, -8, 8)       # the Depot Stair, the palace's rear to the depot in the mesa
TSTAIR = (22, 28, 6, 18)       # the Tower Stair, from the emperor's apartments up the tower
CSTAIR = (-40, -32, -8, 8)     # the Core Stair, the depot down to the core

FLOORS = []

# ---- IU2 the Core
FLOORS.append(dict(id='IU2', tier=-2, R=60, rect=(-50, 50, -40, 40), title='Level U2: the Core (the Ancient heart under the mesa)',
  sub='the deepest Ancient level: the power core that still lights the citadel, its control room, the keepers (the Salvagers\' trusted few, sworn to the emperor), the Reliquary of the Empire and the imperial vault. One stair in, one tunnel out.',
  rooms=[
    box(1, 'Stair from the Depot', 'stair', CSTAIR, 1),
    R(2, 'Keepers\' Vestibule', 'vestibule', -32, -10, -8, 8, 2, 'the Salvagers\' trusted few; a sealed Ancient door'),
    R(3, 'Control Room', 'control_room', -10, 20, -16, 16, 3, 'the Ancients\' consoles: the citadel\'s power and the shield are read and switched here'),
    R(4, 'The Core', 'core', 20, 50, -20, 20, 3, 'the Ancient power core in its cage of light; nobody enters but the keepers'),
    R(5, 'Keepers\' Quarters', 'dormitory', -50, -10, 8, 30, 1),
    R(6, 'Keepers\' Workshop', 'workshop', -50, -10, -30, -8, 1, 'where the parts the Salvagers bring are tried'),
    R(7, 'Reliquary of the Empire', 'reliquary', -10, 20, 16, 40, 4, 'mech cores, the founders\' relics, the first orb; the emperor\'s own key'),
    R(8, 'Imperial Vault', 'treasury_vault', -10, 20, -40, -16, 3, 'the House\'s gold and the Empire\'s reserve'),
    R(9, 'Cistern of the Mesa', 'cistern', 20, 50, 20, 40, 0),
    R(10, 'Escape Tunnel', 'passage', 20, 50, -40, -20, 0, 'an Ancient service tunnel to the jungle beyond the moat; the emperor\'s last way out'),
    R(11, 'Cold Vault (sealed)', 'store', -50, -32, -8, 8, 0, 'the Ancients\' own stores, never opened'),
  ]))

# ---- IU1 the Depot
FLOORS.append(dict(id='IU1', tier=-1, R=110, rect=(-70, 70, -60, 60), title='Level U1: the Depot (the Empire\'s last mech hangar, in the mesa)',
  sub='the Ancient hangar floor at the foot of the mesa: four mech bays, the Forgemasters\' repair shop and forge, the parts and power-cell stores, the shield generator, the armoury of the legions, the guard\'s drill hall. The Mech Gate\'s blast doors open on the hill\'s rear face; the hangar lift carries one machine up to the hall for the emperor\'s parades.',
  rooms=[
    R(1, 'Mech Gate (blast doors)', 'entrance', 70, 80, -10, 10, 2, 'the Ancients\' doors on the hill\'s rear face; a ramp road to the city'),
    R(2, 'Approach Tunnel', 'passage', 80, 110, -8, 8, 1),
    R(3, 'Gate Guard', 'guard', 60, 70, 10, 24, 1),
    R(4, 'Gate Guard', 'guard', 60, 70, -24, -10, 1),
    R(5, 'The Concourse (west)', 'hall', -32, 6, -8, 8, 2, 'the hangar floor: mechs walk it'),
    R(6, 'The Concourse (east)', 'hall', 24, 50, -8, 8, 2),
    box(7, 'The Hangar Lift (platform)', 'lift_hall', WELL, 3, 'the Ancient lift: one mech at a time up to the hall, 40 m above'),
    R(8, 'Mech Bay I', 'mech_bay', -40, -16, 8, 40, 1, 'a cradle, gantries, the machine\'s own tools'),
    R(9, 'Mech Bay II', 'mech_bay', -16, 6, 8, 40, 1),
    R(10, 'Mech Bay III', 'mech_bay', -40, -16, -40, -8, 1),
    R(11, 'Mech Bay IV', 'mech_bay', -16, 6, -40, -8, 1),
    R(12, 'Repair Shop (the Forgemasters\')', 'repair_shop', 24, 60, 8, 40, 1, 'hoists, lathes, the plate press'),
    R(13, 'Forge and Foundry', 'forge', 24, 60, -40, -8, 1),
    R(14, 'Parts and Plate Store', 'store', -70, -40, 8, 40, 0),
    R(15, 'Power Cells and Fuel (the charge room)', 'cells', -70, -40, -40, -8, 0, 'the Salvagers\' cells on their racks; no flame'),
    R(16, 'Armoury of the Legions', 'armoury', -70, -40, -8, 8, 1),
    box(17, 'Depot Stair (from the palace)', 'stair', DSTAIR, 1),
    box(18, 'Stair to the Core', 'stair', CSTAIR, 1),
    R(19, 'Drill Hall of the Guard', 'drill', -40, 24, 40, 60, 1),
    R(20, 'Mechwrights\' Quarters', 'dormitory', 24, 70, 40, 60, 1),
    R(21, 'Munitions', 'store', -70, -20, -60, -40, 0, 'shot, powder, the Ancient charges'),
    R(22, 'Brig', 'cell', -20, 10, -60, -40, 0),
    R(23, 'Shield Generator Hall', 'shield', 10, 70, -60, -40, 2, 'the citadel\'s shield emitter, the Ancients\' machine the Forgemasters keep alive'),
  ], doors=[(70, 0)]))

# ---- I0 the precinct and the base tier's ground storey
FLOORS.append(dict(id='I0', tier=0, R=84, circle=True, title='Level 0: the Citadel precinct and the base tier (ground)',
  sub='inside the Ancient curtain wall: the gate, the triumphal plaza with the orb-bearer, the two Praetorian barracks and their drill yards, the Praetorium of the general staff (east), the Hall of Embassies (west), the services on the rear arc, and the palace block: the grand entrance, the atrium, the Well of the Machine, the two secretariats, the kitchens and the slaves.',
  outlines=[(-22, 62, -48, 48, 'palace block, tier 1'), (-5, 53, -25, 33, 'tier 2 above'), (8, 48, -17.5, 31, 'tier 3 above')],
  rooms=[
    R(1, 'Citadel Gate', 'entrance', -92, -80, -8, 8, 3, 'the one gate in the curtain wall, from the axis road up the hill'),
    R(2, 'Triumphal Plaza', 'court', -80, -36, -30, 30, 3, 'lamp columns, banner poles; mech parades end here'),
    R(3, 'The Orb-bearer', 'monument', -50, -42, -4, 4, 4, 'the triumphal statue: raised arms and the orb'),
    R(4, 'Praetorian Barracks I', 'barracks', -30, 0, 55, 69, 1, 'three floors (existing block); doors to the court'),
    R(5, 'Praetorian Barracks II', 'barracks', -30, 0, -69, -55, 1),
    R(6, 'Drill Yard', 'drill', -30, 0, 69, 80, 1),
    R(7, 'Drill Yard', 'drill', -30, 0, -80, -69, 1),
    R(8, 'Praetorium: Hall of the Standards', 'trophy', 2, 16, 50, 72, 3, 'the legions\' eagles and the trophies of Hook'),
    R(9, 'Praetorium: Legates\' Offices', 'office', 16, 38, 50, 61, 2),
    R(10, 'Praetorium: Records of the Legions', 'archive', 16, 38, 61, 72, 2),
    R(11, 'Embassies: Audience of Envoys', 'reception', 2, 16, -72, -50, 3, 'where envoys wait on the Master of Embassies'),
    R(12, 'Embassies: Interpreters and Scribes', 'office', 16, 38, -61, -50, 2),
    R(13, 'Embassies: Gifts and Tribute Room', 'treasury', 16, 38, -72, -61, 2),
    R(14, 'Precinct Kitchens', 'kitchen', 64, 76, -34, -10, 1, 'feed the guard and the precinct'),
    R(15, 'Guard Mess', 'servants_hall', 64, 78, -10, 10, 1),
    R(16, 'Beast Stables', 'stable', 64, 76, 10, 34, 1, 'the emperor\'s mounts and the couriers\' beasts'),
    R(17, 'Cistern Head', 'cistern', 62, 68, 36, 44, 0),
    R(18, 'Grand Entrance', 'entrance', -36, -22, -8, 8, 4, 'the landing and steps, two pylons with banners, bronze leaves, the crest with the orb'),
    R(19, 'Vestibule of the Orb', 'vestibule', -22, -8, -8, 8, 4, 'two storeys; the lit doorway'),
    R(20, 'Praetorian Guard Room', 'guard', -22, -8, 8, 22, 2),
    R(21, 'Praetorian Guard Room', 'guard', -22, -8, -22, -8, 2),
    R(22, 'Ushers and the Register', 'office', -22, -8, 22, 34, 2),
    R(23, 'Cloaks and Arms', 'store', -22, -8, -34, -22, 1, 'visitors leave their weapons'),
    R(24, 'The Atrium', 'atrium', -8, 6, -14, 14, 4, 'two storeys; the impluvium; lit by a slot at its front edge through the roof garden'),
    box(25, 'The Well of the Machine', 'lift_hall', WELL, 4, 'the Ancient lift shaft from the depot to the hall: a railed gallery round the grating'),
    box(26, 'Great Stair', 'stair', GSTAIR, 4, 'to the Domus and the hall level'),
    R(27, 'War Secretariat: Clerks\' Hall', 'office', -8, 12, 14, 30, 2),
    R(28, 'Map Room of the Legions', 'map_room', 12, 32, 14, 30, 3),
    R(29, 'Legates\' Waiting Room', 'antechamber', -8, 12, 30, 48, 3),
    R(30, 'Couriers and Signals Office', 'office', 12, 32, 30, 48, 2),
    R(31, 'Embassies Secretariat: Correspondence', 'office', -8, 12, -30, -14, 2, 'the ab epistulis: the Empire\'s letters'),
    R(32, 'Envoys\' Waiting Room', 'antechamber', -8, 12, -48, -30, 3),
    R(33, 'Treaty Archive', 'archive', 12, 32, -30, -14, 2),
    R(34, 'Interpreters', 'office', 12, 32, -48, -30, 2),
    R(35, 'Palace Kitchen', 'kitchen', 32, 50, 14, 34, 1),
    R(36, 'Larder and Cellar Stair', 'larder', 50, 62, 14, 34, 0),
    R(37, 'Slaves\' and Servants\' Hall', 'servants_hall', 32, 62, 34, 48, 1),
    R(38, 'Steward\'s Office (a rationibus)', 'office', 32, 50, -8, 8, 2),
    box(39, 'Depot Stair', 'stair', DSTAIR, 1, 'down to the depot in the mesa'),
    R(40, 'Guard of the Depot Stair', 'guard', 50, 62, 8, 14, 1),
    R(41, 'Physician and Infirmary', 'infirmary', 32, 50, -34, -14, 2),
    R(42, 'Slaves\' Quarters', 'dormitory', 32, 62, -48, -34, 0),
    R(43, 'Stores', 'store', 50, 62, -34, -8, 0),
    R(44, 'Lamp columns and banner poles (precinct)', 'monument', -70, -62, 26, 30, 2, 'two pairs on the plaza, lamp posts along the block\'s front'),
  ], doors=[(-22, 0), (62, 0), (20, 48), (20, -48)]))

# ---- I1 the base tier, upper storeys
FLOORS.append(dict(id='I1', tier=0, R=62, rect=(-22, 62, -48, 48), title='Level 1: the base tier, second storey (the third repeats it)',
  sub='over the secretariats: the Magister Militum\'s rooms and the Council of Legates east, the Master of Embassies, the Hall of the Envoys and their lodgings west; the household\'s clerks and dormitories behind. The third storey repeats this plan as lodgings for the freedmen officials and the kin\'s attendants, with the Library of the Palace over the Hall of the Envoys. The precinct buildings\' upper floors are listed too.',
  outlines=[(-5, 53, -25, 33, 'tier 2 above')],
  rooms=[
    R(1, 'Vestibule (void)', 'gallery_void', -22, -8, -8, 8, 4),
    R(2, 'Praetorian Officers', 'office', -22, -8, 8, 22, 2),
    R(3, 'Praetorian Officers', 'office', -22, -8, -22, -8, 2),
    R(4, 'Register Archive', 'archive', -22, -8, 22, 34, 2),
    R(5, 'Arms Store', 'store', -22, -8, -34, -22, 1),
    R(6, 'Atrium gallery (void)', 'gallery_void', -8, 6, -14, 14, 4),
    box(7, 'Well of the Machine (void, railed)', 'gallery_void', WELL, 4),
    box(8, 'Great Stair', 'stair', GSTAIR, 4),
    R(9, 'Magister Militum\'s Rooms', 'cabinet', -8, 12, 14, 30, 3, 'the commander of the legions under the emperor'),
    R(10, 'Council of Legates', 'council', 12, 32, 14, 30, 4),
    R(11, 'Legions\' Rolls', 'archive', -8, 12, 30, 48, 2),
    R(12, 'Quartermasters', 'office', 12, 32, 30, 48, 2),
    R(13, 'Master of Embassies\' Rooms', 'cabinet', -8, 12, -30, -14, 3),
    R(14, 'Hall of the Envoys', 'reception', 12, 32, -30, -14, 4, 'receptions short of the emperor'),
    R(15, 'Envoys\' Lodgings', 'guest_bed', -8, 12, -48, -30, 3),
    R(16, 'Envoys\' Lodgings', 'guest_bed', 12, 32, -48, -30, 3),
    R(17, 'Household Clerks', 'office', 32, 50, 14, 34, 2),
    R(18, 'Stores', 'store', 50, 62, 14, 34, 0),
    R(19, 'Servants\' Dormitory', 'dormitory', 32, 62, 34, 48, 0),
    R(20, 'Steward\'s Chambers', 'chamber', 32, 50, -8, 8, 3),
    box(21, 'Depot Stair', 'stair', DSTAIR, 1),
    R(22, 'Nurses and the Apothecary', 'infirmary', 32, 50, -34, -14, 2),
    R(23, 'Slaves\' Dormitory', 'dormitory', 32, 62, -48, -34, 0),
    R(24, 'Stores', 'store', 50, 62, -34, -8, 0),
    R(25, 'Guard', 'guard', 50, 62, 8, 14, 1),
    R(26, 'Barracks I and II, upper floors', 'barracks', -30, 0, 55, 69, 1, 'dormitories and the centurions\' rooms (both blocks; drawn once)'),
    R(27, 'Praetorium, upper floors', 'ministry', 2, 38, 50, 72, 3, 'the general staff: the Magister\'s council, the maps, the legions\' archive, the signal office; four storeys'),
    R(28, 'Hall of Embassies, upper floors', 'ministry', 2, 38, -72, -50, 3, 'the envoys\' apartments and the Treaty Hall; three storeys'),
  ]))

# ---- I2a-c tier 2, the Domus (y 14..28, three storeys)
DOMUS = dict(tier=1, R=62, rect=(-5, 53, -25, 33), outlines=[(8, 48, -17.5, 31, 'tier 3 above')])
FLOORS.append(dict(DOMUS, id='I2a', title='Level 2a: the Domus, first storey (tier 2): the empress and the kin',
  sub='the imperial family in the Roman manner: no seclusion, apartments off the same stairs the court uses. The empress\'s suite east, the kin\'s apartments west, the nursery behind; the loggia across the front looks over the roof garden and the city.',
  rooms=[
    R(1, 'Family Loggia', 'gallery', -5, 8, -12, 12, 3, 'windows over the roof garden and the city'),
    R(2, 'Empress\'s Antechamber', 'antechamber', -5, 8, 12, 33, 4),
    R(3, 'Kin\'s Antechamber', 'antechamber', -5, 8, -25, -12, 3),
    box(4, 'Well of the Machine (void)', 'gallery_void', WELL, 4),
    box(5, 'Great Stair', 'stair', GSTAIR, 4),
    R(6, 'Empress\'s Reception', 'reception', 8, 24, 10, 33, 4),
    R(7, 'Empress\'s Bedchamber', 'bedchamber', 24, 40, 10, 33, 4),
    R(8, 'Empress\'s Bath', 'bath', 40, 53, 10, 33, 4),
    R(9, 'Kin Apartment I', 'kin_chamber', 8, 24, -25, -12, 3, 'the emperor\'s brother'),
    R(10, 'Kin Apartment II', 'kin_chamber', 24, 40, -25, -12, 3),
    R(11, 'Kin Apartment III', 'kin_chamber', 40, 53, -25, -12, 3),
    R(12, 'Nursery and the Children\'s Day Rooms', 'school', 32, 53, -12, 10, 3, 'lit by a light well'),
    R(13, 'Light Well', 'court', 40, 46, -4, 2, 2),
  ]))
FLOORS.append(dict(DOMUS, id='I2b', title='Level 2b: the Domus, second storey: the consorts',
  sub='the secondary consorts\' suites, each a bedchamber with an anteroom, their bath, the kin\'s upper rooms, the tutors and the schoolroom.',
  rooms=[
    R(1, 'Loggia (upper)', 'gallery', -5, 8, -12, 12, 3),
    R(2, 'Consort Suite I', 'bedchamber', -5, 8, 12, 33, 3),
    R(3, 'Consort Suite II', 'bedchamber', -5, 8, -25, -12, 3),
    box(4, 'Well of the Machine (void)', 'gallery_void', WELL, 4),
    box(5, 'Great Stair', 'stair', GSTAIR, 4),
    R(6, 'Consort Suite III', 'bedchamber', 8, 24, 10, 33, 3),
    R(7, 'Consort Suite IV', 'bedchamber', 24, 40, 10, 33, 3),
    R(8, 'Consorts\' Bath', 'bath', 40, 53, 10, 33, 3),
    R(9, 'Kin Apartment I (upper)', 'kin_chamber', 8, 24, -25, -12, 3),
    R(10, 'Kin Apartment II (upper)', 'kin_chamber', 24, 40, -25, -12, 3),
    R(11, 'Kin Apartment III (upper)', 'kin_chamber', 40, 53, -25, -12, 3),
    R(12, 'Tutors and the Schoolroom', 'school', 32, 53, -12, 10, 2),
    R(13, 'Light Well (void)', 'void', 40, 46, -4, 2, 2),
  ]))
FLOORS.append(dict(DOMUS, id='I2c', title='Level 2c: the Domus, third storey: the children and the household',
  sub='the children\'s bedchambers and their nurses, the women\'s attendants, the wardrobe and treasury of the House, the household shrine, the library and music room. The terrace garden lies on this storey\'s roof.',
  rooms=[
    R(1, 'Belvedere of the House', 'gallery', -5, 8, -12, 12, 3, 'under the terrace\'s edge'),
    R(2, 'Nurses', 'dormitory', -5, 8, 12, 33, 1),
    R(3, 'Kin\'s Attendants', 'dormitory', -5, 8, -25, -12, 1),
    box(4, 'Well of the Machine (void)', 'gallery_void', WELL, 4),
    box(5, 'Great Stair', 'stair', GSTAIR, 4),
    R(6, 'Children\'s Bedchambers', 'bedchamber', 8, 24, 10, 33, 3),
    R(7, 'Children\'s Bedchambers', 'bedchamber', 24, 40, 10, 33, 3),
    R(8, 'Women\'s Attendants', 'dormitory', 40, 53, 10, 33, 1),
    R(9, 'Wardrobe of the House', 'wardrobe', 8, 24, -25, -12, 2),
    R(10, 'Treasury of the House (plate and jewels)', 'treasury', 24, 40, -25, -12, 3),
    R(11, 'Household Shrine (the lares)', 'chapel', 40, 53, -25, -12, 3),
    R(12, 'Library and Music Room', 'library', 32, 53, -12, 10, 3),
    R(13, 'Light Well (void)', 'void', 40, 46, -4, 2, 2),
  ]))

# ---- I3 tier 3, the hall level (y 28..39)
HALLV = dict(tier=2, R=62, rect=(-5, 53, -25, 33))
FLOORS.append(dict(HALLV, id='I3', title='Level 3: the Hangar Hall level (tier 3, y 28)',
  sub='the state level: the garden terrace on tier 2\'s roof under the great orange awning; the converted Ancient hangar, open to the terrace, where Izani and foreign nobles are entertained and a mech can be raised on the old lift for a triumph; the great door into the Aula Regia; the Lararium of the Emperors; the triclinium; the Consilium in the east flank.',
  outlines=[(20, 40, 6, 26, 'the tower above')],
  rooms=[
    R(1, 'Garden Terrace', 'garden', -5, 8, -25, 33, 3, 'balustrade, planters, hedges, benches, lamp posts; stairs down the flanks to the roof garden; the awning on its stone poles'),
    R(2, 'West Terrace Walk', 'garden', 8, 48, -25, -17.5, 2),
    R(3, 'Rear Terrace', 'garden', 48, 53, -25, 33, 2),
    R(4, 'The Hangar Hall', 'hall_hangar', 8, 22, -10, 8, 4, '11 m high; two rows of pale columns; a coffered ceiling of lamps; the floor medallion is the lift\'s platform'),
    R(5, 'Stair of the Hall', 'stair', 8, 22, -17.5, -10, 3, 'the west flank: up to the loggia and the apartments'),
    R(6, 'The Consilium (war council)', 'council', 8, 22, 8, 31, 4, 'the east flank; two storeys with a gallery'),
    R(7, 'The Great Door', 'passage', 22, 24, -4, 4, 4, 'bronze, 8 m, into the Aula'),
    R(8, 'Aula Regia (the throne room)', 'throne', 24, 44, -6, 18, 4, '11 m high; the imperial throne on its dais against the rear wall; the orb above it'),
    R(9, 'Regalia and Robing', 'wardrobe', 44, 48, -6, 18, 4),
    box(10, 'Great Stair (head)', 'stair', GSTAIR, 4, 'arrives in the lararium\'s west end'),
    R(11, 'Lararium: the Shrine of the Emperors', 'ancestors_hall', 32, 48, -15, -6, 4, 'the deified emperors\' busts, the first orb\'s copy, the altar of the House'),
    R(12, 'Triclinium (the emperor\'s dining room)', 'feast_private', 22, 48, 18, 31, 4),
    R(13, 'Imperial Guard of the Aula', 'guard', 22, 24, 4, 18, 2),
    R(14, 'Imperial Guard of the Aula', 'guard', 22, 24, -6, -4, 2),
  ]))

# ---- I4a tier 3, level B (y 39..44.5): the emperor's apartments
FLOORS.append(dict(HALLV, id='I4a', title='Level 4a: the emperor\'s apartments (tier 3, y 39)',
  sub='over the Aula\'s ceiling and in the lintel mass over the hall: the emperor\'s loggia, his tablinum, bedchamber and bath, the Oratory of the Orb, the guard of the person; the Consilium\'s gallery.',
  outlines=[(20, 40, 6, 26, 'the tower above')],
  rooms=[
    R(1, 'Emperor\'s Loggia', 'gallery', 8, 22, -10, 8, 4, 'in the lintel mass; over the terrace and the city'),
    R(2, 'Stair of the Hall', 'stair', 8, 22, -17.5, -10, 3),
    R(3, 'Consilium gallery (void)', 'gallery_void', 8, 22, 8, 31, 4),
    box(4, 'Great Stair (well)', 'stair', GSTAIR, 2, 'no landing: a lamp-lit well'),
    box(5, 'Tower Stair', 'stair', TSTAIR, 4),
    R(6, 'Tablinum (the emperor\'s study)', 'cabinet', 28, 34, -9, 6, 4),
    R(7, 'Emperor\'s Bedchamber', 'bedchamber', 34, 48, -6, 12, 4),
    R(8, 'Emperor\'s Bath', 'bath', 34, 48, 12, 31, 4),
    R(9, 'Wardrobe and Body Servants', 'wardrobe', 28, 34, 6, 18, 3),
    R(10, 'Upper Triclinium (intimates)', 'feast_private', 22, 34, 18, 31, 4),
    R(11, 'Oratory of the Orb', 'oratory', 40, 48, -15, -6, 4),
    R(12, 'Guard of the Person', 'guard', 32, 40, -15, -6, 2),
    R(13, 'Antechamber of the Emperor', 'antechamber', 22, 28, -9, 6, 4),
  ]))
FLOORS.append(dict(HALLV, id='I4b', title='Level 4b: the private apartments, upper (tier 3, y 44.5)',
  sub='the top of the rear mass: the Library of the Emperor, his secretaries of the person, the chamberlain and freedmen, the music room and the winter dining room, the Treasury of the Orb; the lantern garden on the hall\'s roof; the Consilium\'s archive.',
  outlines=[(20, 40, 6, 26, 'the tower above')],
  rooms=[
    R(1, 'Lantern Garden (the hall\'s roof)', 'garden', 8, 22, -10, 8, 3),
    R(2, 'Stair of the Hall (head)', 'stair', 8, 22, -17.5, -10, 3),
    R(3, 'Archive of the Consilium', 'archive', 8, 22, 8, 31, 2),
    box(4, 'Great Stair (well)', 'stair', GSTAIR, 2),
    box(5, 'Tower Stair', 'stair', TSTAIR, 4),
    R(6, 'Library of the Emperor', 'library', 28, 34, -9, 6, 4),
    R(7, 'Secretaries of the Person', 'office', 34, 48, -6, 12, 3),
    R(8, 'Chamberlain and Freedmen', 'chamber', 34, 48, 12, 31, 3),
    R(9, 'Music Room', 'music', 28, 34, 6, 18, 3),
    R(10, 'Winter Dining Room', 'feast_private', 22, 34, 18, 31, 3),
    R(11, 'Treasury of the Orb (regalia)', 'treasury', 40, 48, -15, -6, 4),
    R(12, 'Guard', 'guard', 32, 40, -15, -6, 2),
    R(13, 'Antechamber (upper)', 'antechamber', 22, 28, -9, 6, 3),
  ]))

# ---- I5 the tower: six floors drawn side by side
def tower_floor(i, n, name, kind, decor, note):
    u0 = -84 + i * 28
    return [R(n, name, kind, u0, u0 + 20, -10, 10, decor, note), R(n + 1, 'Tower Stair', 'stair', u0 + 2, u0 + 8, 4, 10, 2)]
FLOORS.append(dict(id='I5', tier=3, R=90, rect=(-86, 86, -14, 14), title='Level 5: the Tower (y 50 to 91), its six floors and the cap, drawn side by side',
  sub='the tower on the rear mass\'s east part, 20 m square: the emperor\'s own height. From the bottom: the Map of the Empire, the Council of War, the Treasury of the House, the Signal Room, the Observatory, the Beacon Chamber; the 14 m cap holds the beacon itself under the finial.',
  rooms=sum([
    tower_floor(0, 1, 'Floor 1 (y 50): the Map of the Empire', 'map_room', 4, 'the whole crater inlaid in the floor; the legions as bronze markers'),
    tower_floor(1, 3, 'Floor 2 (y 55): Council of War', 'council', 4, 'the emperor, the Magister Militum and the legates'),
    tower_floor(2, 5, 'Floor 3 (y 60): Treasury of the House', 'treasury', 3, 'strongboxes; the House\'s own, not the Empire\'s'),
    tower_floor(3, 7, 'Floor 4 (y 65): Signal Room', 'signal', 2, 'the heliograph to Fort Vaklu and the Ancient set the Salvagers nursed back'),
    tower_floor(4, 9, 'Floor 5 (y 70): Observatory', 'astronomers', 2, 'the rings and the gnomon'),
    tower_floor(5, 11, 'Floor 6 (y 75): Beacon Chamber', 'beacon', 1, 'fuel and the keepers; the cap above holds the fire'),
  ], [])))

# ------------------------------------------------------------------------------------------------ the Iziz keys
C = 'iziz'
def keymap():
    m = {}
    roles_court = ['bed', 'throne', 'divan', 'table', 'low_table', 'desk', 'cabinet', 'bookcase', 'hearth', 'fire', 'lamp', 'candelabra', 'hanging', 'carpet', 'screen', 'tapestry', 'banner', 'frieze', 'wall_rug', 'scroll', 'painted_hanging', 'art', 'statue', 'jug', 'bowl']
    roles_common = ['bed', 'bench', 'chair', 'stool', 'table', 'low_table', 'desk', 'chest', 'bookcase', 'wall_shelves', 'store', 'hearth', 'fire', 'lamp', 'candle', 'hanging', 'rug', 'screen', 'counter', 'workbench', 'loom', 'rack', 'ladder', 'board', 'art', 'banner', 'scroll', 'pennants', 'bowl', 'jug', 'books']
    for r in roles_court: m['voth_court_' + r] = 'iziz_court_' + r
    for r in roles_common: m['voth_common_' + r] = 'iziz_common_' + r
    m.update({
      'voth_court_armour_stand': 'generic_trade_armour_stand', 'voth_planter': 'iziz_planter', 'voth_bench': 'iziz_bench', 'voth_statue': 'iziz_statue',
      'voth_street_brazier': 'iziz_common_fire', 'voth_canoe': None, 'voth_craft_brewer': 'generic_trade_still', 'voth_loom_display': 'iziz_common_loom',
      'voth_common_ash_niche': 'iziz_court_bust_niche', 'voth_bread_oven': 'iziz_common_hearth', 'voth_cell_grate': 'iziz_common_cell_grate', 'hl_rep_roofed_well': 'iziz_fountain',
      'voth_court_sun_throne': 'iziz_court_imperial_throne', 'voth_court_judge_dais': None, 'voth_court_wall_fountain': 'iziz_court_wall_fountain',
      'voth_court_bath_slab': 'iziz_court_bath_slab', 'voth_court_bath_pool': 'iziz_court_bath_pool', 'voth_court_sun_altar': 'iziz_court_altar_of_the_house',
      'voth_court_staff_stand': None, 'voth_court_strongbox': 'iziz_court_strongbox', 'voth_court_map_table': 'iziz_court_map_table', 'voth_court_lectern': 'iziz_court_lectern',
      'voth_court_armillary': 'iziz_court_armillary', 'voth_court_palanquin': None, 'voth_court_trophy_stand': 'iziz_court_standard', 'voth_court_baldachin_bed': 'iziz_court_bed',
      'voth_common_drum_stand': 'iziz_common_drum_stand', 'voth_common_spit': 'iziz_common_spit', 'voth_common_cauldron': 'iziz_common_cauldron',
      'voth_common_drying_rack': 'iziz_vern_drying_rack', 'voth_common_copper': 'iziz_common_copper', 'voth_common_manacles': 'iziz_common_manacles',
      'voth_common_pit_grate': None, 'voth_common_ice_box': 'iziz_common_ice_box', 'voth_common_litter_rack': None, 'voth_common_bath_basin': 'iziz_common_bath_basin',
      'generic_trade_training_dummy': 'iziz_training_training_dummy', 'generic_trade_archery_butt': 'iziz_training_archery_butt'})
    return m

IZIZ_NEW = {
  'iziz_court_imperial_throne': 'the imperial throne: a high-backed gilt seat on a marble dais, the orb on a bronze stand behind it',
  'iziz_court_bust_niche': 'a niche with a marble bust (the lararium and the household shrine)',
  'iziz_court_altar_of_the_house': 'the altar of the House: a marble block with a bronze fire and the orb',
  'iziz_court_bath_slab': 'a heated marble slab', 'iziz_court_bath_pool': 'a sunken marble pool with steps and teal tile',
  'iziz_court_strongbox': 'a bronze-bound mahogany strongbox', 'iziz_court_map_table': 'a map table with the crater inlaid',
  'iziz_court_lectern': 'a bronze lectern', 'iziz_court_armillary': 'the astronomers\' rings and gnomon, bronze',
  'iziz_court_standard': 'a legion standard on its stand: the eagle, the sun disc, the battle honours',
  'iziz_common_drum_stand': 'drums and a stand', 'iziz_common_spit': 'a roasting spit', 'iziz_common_cauldron': 'a cauldron on a tripod',
  'iziz_common_copper': 'a laundry copper', 'iziz_common_manacles': 'wall manacles', 'iziz_common_ice_box': 'an ice chest', 'iziz_common_bath_basin': 'a stone basin with a tap',
  'iziz_common_cell_grate': 'a brig grate', 'iziz_common_lift_platform': 'the Ancient lift platform with its grating and bollards (unique)',
  'iziz_mech_cradle': 'a mech cradle: a frame the machine stands in, with gantries and a ladder',
  'iziz_mech_hoist': 'a chain hoist on a rail', 'iziz_cell_rack': 'a rack of power cells, lit', 'iziz_shield_emitter': 'the shield emitter: an Ancient column of coils and a glass crown (unique)',
  'iziz_ancient_core': 'the power core in its cage of light (unique)', 'iziz_relic_case': 'a glass relic case on a bronze stand',
  'iziz_court_heliograph': 'the heliograph on its tripod', 'iziz_ancient_set': 'the Ancient radio set the Salvagers repaired (unique)',
}
def iziz_programs():
    cs = lambda n: max(1, round(n))
    return {
      'mech_bay': lambda a, w, d, D: [('iziz_mech_cradle', 1), ('iziz_mech_hoist', 1), ('iziz_common_workbench', 2), ('iziz_common_rack', 2), ('generic_trade_bin', 2), ('iziz_common_lamp', 2), ('iziz_common_ladder', 1)],
      'repair_shop': lambda a, w, d, D: [('iziz_common_workbench', cs(a / 60)), ('generic_trade_forge', 1), ('generic_trade_anvil', 1), ('generic_trade_lathe', 2), ('iziz_mech_hoist', 2), ('iziz_common_rack', cs(a / 80)), ('generic_trade_bin', cs(a / 70)), ('iziz_common_lamp', cs(a / 60))],
      'forge': lambda a, w, d, D: [('generic_trade_forge', 2), ('generic_trade_anvil', 2), ('generic_trade_grindstone', 1), ('generic_trade_vat', 1), ('generic_trade_bin', cs(a / 80)), ('iziz_common_workbench', 3), ('iziz_common_rack', 2)],
      'cells': lambda a, w, d, D: [('iziz_cell_rack', cs(a / 60)), ('generic_trade_bin', cs(a / 100)), ('iziz_common_lamp', 2)],
      'shield': lambda a, w, d, D: [('iziz_shield_emitter', 1), ('iziz_common_console', 4), ('iziz_common_workbench', 2), ('iziz_common_rack', 2), ('iziz_common_chair', 4)],
      'control_room': lambda a, w, d, D: [('iziz_common_console', cs(a / 60)), ('iziz_common_chair', cs(a / 60)), ('iziz_common_table', 1), ('iziz_common_board', 2), ('iziz_common_lamp', cs(a / 80))],
      'core': lambda a, w, d, D: [('iziz_ancient_core', 1), ('iziz_common_console', 2)],
      'reliquary': lambda a, w, d, D: [('iziz_relic_case', cs(a / 60)), ('iziz_court_statue', 2), ('iziz_court_candelabra', 4), ('iziz_court_carpet', 2), ('iziz_court_cabinet', 2)],
      'lift_hall': lambda a, w, d, D: [('iziz_common_lift_platform', 1), ('iziz_common_console', 1), ('iziz_court_lamp' if D >= 3 else 'iziz_common_lamp', 4)],
      'hall_hangar': lambda a, w, d, D: [('iziz_court_table', 6), ('iziz_common_chair', 48), ('iziz_court_divan', 6), ('iziz_court_low_table', 4), ('iziz_court_statue', 4), ('iziz_planter', 8), ('iziz_court_fire', 4), ('iziz_court_banner', 8), ('iziz_court_candelabra', 10), ('iziz_court_jug', 12), ('iziz_court_bowl', 18)],
      'atrium': lambda a, w, d, D: [('iziz_fountain', 1), ('iziz_planter', 6), ('iziz_bench', 4), ('iziz_court_statue', 2), ('iziz_court_fire', 2), ('iziz_court_divan', 2)],
      'map_room': lambda a, w, d, D: [('iziz_court_map_table', 2 if a > 200 else 1), ('iziz_common_desk', cs(a / 60)), ('iziz_common_bookcase', cs(a / 50)), ('iziz_common_board', 2), ('iziz_common_chair', cs(a / 35))],
      'signal': lambda a, w, d, D: [('iziz_court_heliograph', 1), ('iziz_ancient_set', 1), ('iziz_common_console', 1), ('iziz_common_desk', 1), ('iziz_common_chair', 2), ('iziz_common_board', 1)],
      'stable': lambda a, w, d, D: [('generic_trade_trough', cs(a / 70)), ('generic_trade_hayrack', cs(a / 70)), ('iziz_common_rack', 2), ('generic_trade_bin', 2)],
      'monument': lambda a, w, d, D: [('iziz_statue', 1)],
      'barracks': lambda a, w, d, D: [('generic_trade_bunk', cs(a / 8)), ('generic_trade_locker', cs(a / 16)), ('iziz_common_table', cs(a / 150)), ('iziz_common_bench', cs(a / 75)), ('generic_trade_weapon_rack', cs(a / 100))],
    }

def draw_section():
    f_t = B.font(40, True); f = B.font(20); fs = B.font(17)
    W, H = 2400, 1500; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Section through the main axis (u): the mesa, the citadel, the tiers and the tower (heights x2)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), 'Tier heights are the build\'s (78-transplant.js); the depot and core depths and the mesa\'s height over the city are assumed. The precinct wall is 14 m; the gate side is on the left.', font=f, fill=(70, 70, 70))
    sx = 7.0; sy = 7.0; ox = W / 2 - 100; base = H - 430
    def X(u): return ox + u * sx
    def Y(h): return base - h * sy
    # the mesa: the top at 0, the city at -40
    mesa = [(X(-170), Y(-40)), (X(-100), Y(-2)), (X(100), Y(-2)), (X(170), Y(-40))]
    dr.polygon(mesa, fill=(228, 214, 190), outline=(120, 100, 80))
    dr.line([(0, Y(-40)), (W, Y(-40))], fill=(120, 100, 80), width=2); dr.text((20, Y(-40) + 6), 'the city', font=fs, fill=(80, 80, 80))
    # the Ancient levels
    for u0, u1, h0, h1, name, col in [(-70, 110, -40, -28, 'U1 the Depot: mech bays, repair shop, forge, shield generator; the Mech Gate on the rear face', (210, 210, 206)), (-50, 50, -52, -40, 'U2 the Core: control room, the core, the Reliquary, the vault', (196, 200, 210))]:
        dr.rectangle([X(u0), Y(h1), X(u1), Y(h0)], fill=col, outline=(30, 30, 30), width=2); dr.text((X(u0) + 6, Y(h1) + 4), name, font=f, fill=(0, 0, 0))
    # the curtain wall and gate
    for u in (-84, 84): dr.rectangle([X(u) - 10, Y(14), X(u) + 10, Y(0)], fill=(200, 196, 190), outline=(30, 30, 30), width=2)
    dr.text((X(-84) - 60, Y(14) - 24), 'curtain wall and gate', font=fs, fill=(0, 0, 0)); dr.text((X(84) - 40, Y(14) - 24), 'curtain wall', font=fs, fill=(0, 0, 0))
    dr.text((X(-70), Y(2) - 22), 'Triumphal Plaza, the Orb-bearer', font=fs, fill=(0, 0, 0))
    # the tiers
    tiers = [(-22, 62, 0, 14, 'Tier 1: entrance, atrium, the secretariats of war and embassies, kitchens; three storeys', (236, 232, 218)),
             (-5, 53, 14, 28, 'Tier 2: the Domus, three storeys (empress, kin, consorts, children)', (212, 226, 176)),
             (8, 48, 28, 39, 'Tier 3: the Hangar Hall, the Aula Regia, the Lararium, the Consilium', (238, 220, 150)),
             (22, 48, 39, 50, 'the emperor\'s apartments, two storeys', (238, 220, 150)),
             (8, 22, 39, 50, 'loggia', (238, 220, 150)),
             (20, 40, 50, 80, 'the Tower: map, war council, treasury, signals, observatory, beacon', (224, 236, 214)),
             (23, 37, 80, 91, 'cap', (224, 236, 214))]
    for u0, u1, h0, h1, name, col in tiers:
        dr.rectangle([X(u0), Y(h1), X(u1), Y(h0)], fill=col, outline=(30, 30, 30), width=2)
        dr.text((X(u0) + 6, Y(h1) + 4), name, font=fs, fill=(0, 0, 0))
    # the hall opening and the awning
    dr.rectangle([X(8), Y(39), X(22), Y(28)], fill=(250, 244, 226), outline=(120, 80, 0), width=3); dr.text((X(8) + 4, Y(33)), 'HALL', font=fs, fill=(120, 80, 0))
    dr.line([(X(8), Y(39)), (X(-14), Y(46))], fill=(224, 122, 42), width=6); dr.text((X(-30), Y(48) - 20), 'the great awning over the terrace', font=fs, fill=(200, 100, 30))
    dr.text((X(-22), Y(14) - 22), 'roof garden (tier 1)', font=fs, fill=(0, 90, 0)); dr.text((X(-5), Y(28) - 22), 'garden terrace', font=fs, fill=(0, 90, 0))
    # the shafts and stairs
    k = 0
    for u, h0, h1, name, col in [(15, -40, 28, 'the Well of the Machine (Ancient lift)', (160, 0, 120)), (28, 0, 39, 'Great Stair', (0, 0, 0)), (56, -40, 14, 'Depot Stair', (150, 80, 0)), (25, 39, 80, 'Tower Stair', (0, 120, 0)), (-36, -52, -28, 'Core Stair', (0, 0, 160)), (15, 28, 50, 'Stair of the Hall', (120, 120, 120))]:
        dr.line([(X(u), Y(h0)), (X(u), Y(h1))], fill=col, width=5); dr.text((X(u) + 6, Y(h1) - 24 - 20 * (k % 2)), name, font=fs, fill=col); k += 1
    dr.text((X(-60), Y(-10)), 'barracks and the Praetorium / Hall of Embassies stand on the flanks (not in this plane)', font=fs, fill=(80, 80, 80))
    return img

def main():
    for F in FLOORS:
        if F['id'].startswith('I2'): F['rooms'].append(R(14, 'Passage of the Domus', 'passage', 24, 32, -9, 10, 3, 'between the stair and the nursery; the family\'s own corridor'))
    B.KEYMAP.update(keymap()); B.EXTRA_PROGRAMS.update(iziz_programs()); B.NEW.update(IZIZ_NEW)
    for k in list(B.NEW):
        if k.startswith('voth_'): B.NEW.pop(k)
    B.CITY.clear()
    intro = ('Generated by `iziz_blueprint.py` (on `settlements/voth/palace/blueprint.py`) from the same room data as the floor sheets. Keys are catalog pieces (`kits/catalog`): `iziz_court_*` and `iziz_common_*` from the Iziz sets, `iziz_training_*`, the bespoke Iziz pieces (`iziz_statue`, `iziz_fountain`, `iziz_planter`, `iziz_bench`, `iziz_common_console`, `iziz_court_wall_fountain`, `iziz_vern_*`), `generic_*` and `generic_trade_*` from the poor set. A key marked **NEW** is not in the catalog yet; the list is at the end. Counts are a brief for the furnisher, not a placement.\n')
    B.main(floors=FLOORS, out=OUT, here=HERE, title='# The Iziz palace citadel: furniture manifest\n', intro=intro, section=draw_section, zone_R=84)

if __name__ == '__main__':
    main()
