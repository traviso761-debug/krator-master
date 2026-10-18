#!/usr/bin/env python3
"""The governor's palace of Iziz's vassal cities (Pylon, Talia): one programme, two cities. Sheets and the manifest
come from settlements/voth/palace/blueprint.py; the furniture keys are the Iziz sets' (the governor's household is
Izani: settlements/iziz/palace/iziz_blueprint.py), plus each city's own pieces for the rooms where the city shows.

The programme and its reasons: settlements/iziz/VASSAL-KITS.md section 3 (forks settled 2026-10-17: the governor's
kin only, the council pavilion inside the palace, a guard pavilion with the barracks outside, grounds about 70 x 56).

Frame: u along the axis from the forecourt gate (u = -36, drawn on the left) to the rear wall (u = 38); v across
(v > 0 drawn up). Metres; y up from the forecourt. The massing is the owner's govpalace.jpg: a terrace 1.2 m high
carries a hall block (u -8..24, v -18..18), the great drum and dome over the audience hall (14 m across, centred
u 10, v 0) and seven round pavilions: two large (14 m) at the front corners (u -8, v +-18), two medium (10 m) at the
rear corners (u 24, v +-18), two small (7 m) on the flanks (u 8, v +-22) and one small at the rear (the kitchen,
u 31, v -6). A round pavilion is drawn as the square it stands in; read it as a drum.

Storeys: ground 5.5 m (terrace top y 1.2 to 6.7), upper 4.5 m (to 11.2); the undercroft under the terrace from
y -2.3; the dome's drum to y 17, the dome to 24, the lantern to 27.

    python3 vassal_blueprint.py pylon      # kits/pylon/palace/floors/*.png and kits/pylon/palace/FURNITURE.md
    python3 vassal_blueprint.py talia      # the same for kits/talia/palace
"""
import os, sys
HERE0 = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE0)
import iziz_blueprint as IZ                  # its import puts settlements/voth/palace on the path
import blueprint as B
from blueprint import R, box
from PIL import Image, ImageDraw

ROOT = os.path.normpath(os.path.join(HERE0, '..', '..', '..'))

# ---- the fixed tuples every sheet shares (stairs and shafts line up floor to floor)
PSTAIR = (17, 20, -6, -3)      # the private stair: the governor's cabinet up to the residence, down to the hidden way
BSTAIR = (24, 27, -12, -9)     # the back stair: the servery up to the steward and the residence's service side
ESTAIR = (-1.5, 4.2, -28, -18) # the outside stair on the chancery flank: the forecourt to the upper gallery, three runs
LADDER = (9, 11, -1, 1)        # the ladder to the lantern, from the dome's gallery
LGAL = (-14.3, -1.7, -24.3, -11.7)   # the large pavilions (front corners): the squares they stand in
RGAL = (-14.3, -1.7, 11.7, 24.3)
LREAR = (19, 29, -23, -13)     # the medium pavilions (rear corners)
RREAR = (19, 29, 13, 23)
LFLANK = (4.4, 11.6, -25.6, -18.4)   # the small flank pavilions
RFLANK = (4.4, 11.6, 18.4, 25.6)
KITCH = (27.4, 34.6, -9.6, -2.4)     # the small rear pavilion: the round kitchen
HALL = (3, 17, -7, 7)          # the audience hall under the dome

CITY = {
  'pylon': dict(
    name='Pylon', culture='pylon',
    chancery='Chancery and Assay Office', assay='Assay Office (the salvage tithe)',
    assay_note='where the yards\' salvage is weighed and graded and the Emperor\'s tithe taken; scales, parts racks, the seal',
    vault='Tithe Vault', vault_note='assayed Ancient parts, power cells and plate held for Iziz; the governor\'s and the Guild\'s keys both needed',
    council='Hall of the Guilds', council_note='the Salvagers\' masters and the yard bosses meet the governor here; its own door from the forecourt, one door to the vestibule',
    mag_ante='Masters\' Anteroom',
    hidden='The Ancient Passage', hidden_note='the podium\'s own service passage, older than the palace, running under the terrace and the rear wall towards the Monolith\'s foot; the governor\'s last way out',
    undercroft_note='the terrace is an Ancient podium (a fallen tower\'s plinth): the undercroft is Ancient fabric, white panel and board-formed vaults',
    signal_note='the heliograph to Iziz (190 km east, by relay) and the Ancient set the Salvagers keep alive',
    decor_note='white render over concrete, orange-lined pill niches, coffered skylights, mosaic piers; walnut and orange leather; Ancient white panel where the podium shows'),
  'talia': dict(
    name='Talia', culture='talia',
    chancery='Chancery and Customs of the East Road', assay='Customs House of the Passes',
    assay_note='the duties on every caravan that comes down from the passes: the tariff boards, the bonded samples, the seal',
    vault='Customs Treasury', vault_note='customs silver and the caravan houses\' bonds, held for Iziz',
    council='Hall of the Talei Council', council_note='the archons of Talia and the University\'s rector meet the governor here; its own door from the forecourt, one door to the vestibule',
    mag_ante='Archons\' Anteroom',
    hidden='The Postern', hidden_note='a passage from the undercroft under the rear garden to a postern in the wall: the governor\'s last way out',
    undercroft_note='white marble vaults under the terrace',
    signal_note='the heliograph to Iziz (240 km west-south-west, by relay) and to the pass forts',
    decor_note='white marble, orange coffers, vaults and stair treads, mosaic floors (meander and rings), gilt capitals, rosettes and door leaves'),
}


def floors(c):
    K = CITY[c]
    F = []
    # ---------------------------------------------------------------- B: the undercroft
    F.append(dict(id='B', tier=-1, R=40, rect=(-16, 40, -30, 30), title='Undercroft (under the terrace, y -2.3 to 1.2)',
      sub='Bulk is bureaucracy and stores: the archive, the %s, the stores, the wine and the cistern, the guard\'s armoury and cells. The private stair comes down to the hidden way. %s.' % (K['vault'].lower(), K['undercroft_note'][0].upper() + K['undercroft_note'][1:]),
      rooms=[
        R(1, 'Archive', 'archive', 3, 17, -18, -7, 1, 'rolls, the census, the tribute registers, the governor\'s letters from Iziz'),
        R(2, K['vault'], 'treasury_vault', -4, 3, -11.7, -5, 0, K['vault_note']),
        R(3, 'Vault Keeper', 'keeper', -4, 3, -5, 1, 1, 'one officer of the chancery, one of the city: two keys'),
        R(4, 'Stores', 'store', 17, 24, -18, -6, 0),
        R(5, 'Wine and Oil', 'buttery', 17, 24, 6, 18, 0),
        R(6, 'Cistern', 'cistern', 3, 17, 7, 18, 0, 'fed from the roofs and the light courts'),
        R(7, 'Armoury of the Guard', 'armoury', LFLANK[0], LFLANK[1], LFLANK[2], LFLANK[3], 0, 'under the guard pavilion'),
        R(8, 'Cells', 'cell', -4, 3, 1, 11.7, 0, 'two cells for the guard\'s use'),
        R(9, 'Larder', 'larder', KITCH[0], KITCH[1], KITCH[2], KITCH[3], 0, 'under the kitchen, cold'),
        box(10, 'Private Stair', 'stair', PSTAIR, 2),
        box(11, 'Back Stair', 'stair', BSTAIR, 1),
        R(12, K['hidden'], 'passage', 20, 40, -2.5, -0.5, 0, K['hidden_note']),
        R(13, 'Undercroft passage', 'passage', 3, 24, -7, 7, 0, 'under the audience hall: the piers that carry the dome'),
      ], outlines=[(-8, 24, -18, 18, 'the hall block above'), HALL + ('the dome above',)]))

    # ---------------------------------------------------------------- G: the ground storey and the grounds
    F.append(dict(id='G', tier=0, R=40, rect=(-36, 38, -30, 30), title='Ground storey and the grounds (terrace top y 1.2)',
      sub='Depth is rank. Gate, forecourt (petitioners, the guard), the front flight, the loggia, the vestibule between its two guard rooms, the audience hall under the dome, and only then the governor\'s cabinet behind the dais. The city\'s magistrates stop at the %s (front left), which has its own door from the forecourt. Government (the %s, front right) opens off the vestibule, not off the hall. Service runs behind: the kitchen in the round rear pavilion, the servery, the back stair, the cart gate.' % (K['council'], K['chancery']),
      rooms=[
        R(1, 'Gate and Guard Lodge', 'guard', -36, -31, -5, 5, 1, 'the forecourt gate on the city\'s street'),
        R(2, 'Forecourt', 'court', -31, -15, -26, 26, 2, 'petitioners wait here under the arcade\'s shade; the guard parades'),
        R(3, 'Apron', 'court', -15, -12, -10, 10, 2),
        R(4, 'Front Flight', 'stair', -12, -8.5, -6, 6, 3, 'the ceremonial stair onto the terrace (1.2 m, eight steps)'),
        R(5, 'Front Loggia', 'hall', -8.5, -4, -11.7, 11.7, 2, 'the ground arcade; the second threshold\'s porch'),
        R(6, 'Vestibule', 'vestibule', -4, 3, -5, 5, 3, 'the second threshold: the guard rooms either side; the doors to the hall, the chancery and the council'),
        R(7, 'Guard Room', 'guard', -4, 3, -11.7, -5, 1),
        R(8, 'Guard Room', 'guard', -4, 3, 5, 11.7, 1),
        R(9, 'Audience Hall (under the dome)', 'throne', HALL[0], HALL[1], HALL[2], HALL[3], 4, 'two storeys under the drum and dome; the dais on the axis at the back; galleries round it above'),
        R(10, 'Light Court', 'court', 3, 8, 7, 12, 2, 'lights the hall\'s side and the strip rooms'),
        R(11, 'Light Court', 'court', 3, 8, -12, -7, 2),
        R(12, 'The Governor\'s Cabinet', 'cabinet', 17, 24, -3, 3, 3, 'behind the dais: the governor works here, not in the hall'),
        R(13, 'Secretary of the Person', 'office', 17, 24, 3, 8, 2, 'the governor\'s own secretary; the letters to Iziz'),
        box(14, 'Private Stair', 'stair', PSTAIR, 2),
        R(15, 'Cabinet Wardrobe', 'wardrobe', 20, 24, -6, -3, 2, 'the governor robes here for audience'),
        R(16, K['chancery'], 'ministry', LGAL[0], LGAL[1], LGAL[2], LGAL[3], 2, 'the large pavilion, front right: clerks, the seal, the rolls in use'),
        R(17, K['assay'], 'weighing', -1.7, 8.5, -18, -12, 2, K['assay_note']),
        R(18, 'Chief Clerk', 'office', 8.5, 17, -18, -12, 2),
        R(19, 'Clerks\' passage', 'passage', 8, 17, -12, -7, 1, 'the chancery\'s own corridor to the rear; it does not open on the hall'),
        R(20, K['council'], 'council', RGAL[0], RGAL[1], RGAL[2], RGAL[3], 3, K['council_note']),
        R(21, K['mag_ante'], 'antechamber', -1.7, 8.5, 12, 18, 3, 'the magistrates wait here; one door to the vestibule'),
        R(22, 'Shrine Antechamber', 'antechamber', 8.5, 17, 12, 18, 3),
        R(23, 'Household Shrine (the orb and the sun)', 'oratory', RFLANK[0], RFLANK[1], RFLANK[2], RFLANK[3], 3, 'the Izani signs; the flank pavilion off the hall\'s side'),
        R(24, 'Guard Pavilion', 'guard', LFLANK[0], LFLANK[1], LFLANK[2], LFLANK[3], 1, 'the duty guard, at the foot of the outside stair'),
        box(25, 'Outside Stair (chancery flank)', 'stair', ESTAIR, 2),
        R(26, 'Dining Hall', 'banquet', LREAR[0], LREAR[1], LREAR[2], LREAR[3], 3, 'the rear right pavilion: for receiving; the servery beside it'),
        R(27, 'Family Garden Room', 'kin_hall', RREAR[0], RREAR[1], RREAR[2], RREAR[3], 3, 'the residence\'s ground room, open on the garden'),
        R(28, 'Garden Passage', 'passage', 17, 24, 8, 13, 2, 'the cabinet to the family\'s rooms; the residence\'s only door into the house'),
        R(29, 'Servery', 'servery', 24, 27, -9, -3, 1),
        box(30, 'Back Stair', 'stair', BSTAIR, 1),
        R(31, 'Round Kitchen', 'kitchen', KITCH[0], KITCH[1], KITCH[2], KITCH[3], 1, 'a round kitchen under a vented dome (after Glastonbury and Fontevraud)'),
        R(32, 'Service Court', 'court', 27, 38, -28, -10, 1, 'the cart gate in the rear wall; deliveries, wood, water'),
        R(33, 'Cart Gate', 'entrance', 35, 38, -20, -14, 1),
        R(34, 'Garden', 'garden', 29, 38, 2, 28, 2, 'the family\'s garden behind the residence'),
        R(35, 'Hall passage', 'passage', 8, 17, 7, 12, 2, 'from the hall\'s side to the shrine and the garden passage'),
      ], outlines=[(-8, 24, -18, 18, 'the hall block'), (-14.3, 34.6, -25.6, 25.6, 'the terrace (y 1.2)')], doors=[(-36, 0), (38, -17)],
      dais=(15, 0, 1.6)))

    # ---------------------------------------------------------------- U: the upper storey
    F.append(dict(id='U', tier=1, R=40, rect=(-16, 34, -30, 30), title='Upper storey (y 6.7 to 11.2)',
      sub='Two routes, not one: petitioners and clerks climb the outside stair to the chancery\'s upper floor and never cross the hall. The galleries look down into the audience hall. The residence is the rear row and the two rear pavilions, reached only by the private stair from the cabinet and the back stair from the service side. The great officers live where they work: the garrison commander over the guard pavilion, the chief secretary over the chancery, the steward over the servery. An Izani envoy is lodged over the council pavilion.',
      rooms=[
        R(1, 'Upper Gallery (front arcade)', 'hall', -8.5, -4, -11.7, 11.7, 2, 'the upper arcade over the loggia'),
        R(2, 'Gallery of the Hall', 'dome_gallery', -4, 3, -5, 5, 3, 'looks into the dome over the vestibule'),
        R(3, 'Petitions Office', 'petitions', -4, 3, -11.7, -5, 2, 'petitions are taken here, from the outside stair\'s landing'),
        R(4, 'Envoy\'s Antechamber', 'guest_ante', -4, 3, 5, 11.7, 3),
        R(5, 'Records of the Chancery', 'archive', LGAL[0], LGAL[1], LGAL[2], LGAL[3], 1, 'the large pavilion\'s upper drum'),
        R(6, 'Petitioners\' Landing and Hall', 'hall', -1.7, 8.5, -18, -12, 2, 'the outside stair lands here'),
        R(7, 'Chief Secretary\'s Lodging', 'chamber', 8.5, 17, -18, -12, 2),
        R(8, 'The Envoy\'s Suite', 'guest_bed', RGAL[0], RGAL[1], RGAL[2], RGAL[3], 3, 'an Izani envoy or a visiting legate'),
        R(9, 'Library of the Governor', 'library', -1.7, 8.5, 12, 18, 3),
        R(10, 'Map Room', 'library', 8.5, 17, 12, 18, 3, 'the province: the city, its roads, the tithe and the garrisons'),
        R(11, 'Audience Hall (open below)', 'gallery_void', HALL[0], HALL[1], HALL[2], HALL[3], 4, 'a railed gallery round the drum\'s foot'),
        R(12, 'Light Court (open)', 'void', 3, 8, 7, 12, 0),
        R(13, 'Light Court (open)', 'void', 3, 8, -12, -7, 0),
        R(14, 'Gallery passage', 'passage', 8, 17, 7, 12, 2),
        R(15, 'Gallery passage', 'passage', 8, 17, -12, -7, 2),
        box(16, 'Private Stair', 'stair', PSTAIR, 2),
        R(17, 'The Governor\'s Antechamber', 'antechamber', 17, 24, -3, 3, 3),
        R(18, 'Governor\'s Wardrobe', 'wardrobe', 20, 24, -6, -3, 3),
        R(19, 'Governor\'s Bath', 'bath', 17, 24, -12, -6, 3),
        R(20, 'The Governor\'s Bedchamber', 'bedchamber', LREAR[0], LREAR[1], LREAR[2], LREAR[3], 4, 'the rear right pavilion\'s upper drum'),
        R(21, 'The Spouse\'s Suite', 'kin_chamber', RREAR[0], RREAR[1], RREAR[2], RREAR[3], 4, 'the rear left pavilion\'s upper drum'),
        R(22, 'Children\'s Rooms and Tutor', 'school', 17, 24, 3, 13, 3, 'the schoolroom and the children\'s beds; the tutor\'s cot'),
        R(23, 'Family Loggia', 'hall', 24, 27, 2, 12, 3, 'over the garden'),
        R(24, 'Steward', 'chamber', 24, 27, -9, -3, 1, 'over the servery; the back stair arrives beside him'),
        box(25, 'Back Stair', 'stair', BSTAIR, 1),
        R(26, 'Garrison Commander', 'chamber', LFLANK[0], LFLANK[1], LFLANK[2], LFLANK[3], 2, 'over the guard pavilion'),
        R(27, 'Shrine (open below)', 'gallery_void', RFLANK[0], RFLANK[1], RFLANK[2], RFLANK[3], 3, 'the shrine is one tall room'),
        R(28, 'Outside Stair (head landing)', 'stair', -1.5, 4.2, -21, -18, 2),
      ], outlines=[(-8, 24, -18, 18, 'the hall block')]))

    # ---------------------------------------------------------------- L: the roof and the lantern
    F.append(dict(id='L', tier=2, R=40, rect=(-16, 34, -30, 30), title='Roofs, the dome and the lantern (y 11.2 to 27)',
      sub='The flat roofs of the block and the pavilions\' domes; the great dome over the hall, and in its lantern the signal room: a vassal governor\'s first duty is the Emperor\'s post. %s.' % (K['signal_note'][0].upper() + K['signal_note'][1:]),
      rooms=[
        R(1, 'Roof terrace', 'garden', -8.5, 3, -11.7, 11.7, 2, 'behind the parapet over the front'),
        R(2, 'The Great Dome', 'void', HALL[0], HALL[1], HALL[2], HALL[3], 4, 'the drum to y 17, the dome to 24'),
        box(3, 'Ladder to the Lantern', 'stair', LADDER, 1),
        R(4, 'Signal Room (the lantern)', 'signal', 8, 12, 2, 5, 2, 'y 24 to 27; the lantern\'s windows face Iziz'),
      ], outlines=[(-8, 24, -18, 18, 'the hall block roof'), LGAL + ('dome',), RGAL + ('dome',), LREAR + ('dome',), RREAR + ('dome',), LFLANK + ('dome',), RFLANK + ('dome',), KITCH + ('vented dome',)]))
    return F


def programs(c):
    cs = lambda n: max(1, round(n))
    base = IZ.iziz_programs()
    base.update({
      'council': lambda a, w, d, D: [(c + '_council_table', 1), ('iziz_court_throne', 1), ('iziz_common_chair', cs(a / 6)), (c + '_city_banner', 4), ('iziz_court_cabinet', 2), ('iziz_court_screen', 2)],
      'weighing': (lambda a, w, d, D: [('pylon_assay_scale', 2), ('pylon_parts_rack', cs(a / 15)), ('iziz_common_desk', 2), ('iziz_common_chair', 3), ('generic_trade_bin', cs(a / 12)), ('iziz_common_board', 1)]) if c == 'pylon'
                  else (lambda a, w, d, D: [('talia_tariff_board', 2), ('iziz_common_counter', 1), ('iziz_common_desk', 2), ('iziz_common_chair', 3), ('talia_sample_case', cs(a / 20)), ('iziz_court_strongbox', 1)]),
    })
    return base


def city_new(c):
    if c == 'pylon':
        return {
          'pylon_council_table': 'the guild masters\' table: a long concrete-and-walnut slab on two pill-shaped piers, orange leather seats',
          'pylon_city_banner': 'a Salvagers\' Guild banner: the gantry crane and the Monolith in white on orange',
          'pylon_assay_scale': 'an assay scale for salvage: a steel beam balance on a plinth, weights in a rack',
          'pylon_parts_rack': 'a rack of graded Ancient parts: white panel offcuts, cells, coils, tagged',
        }
    return {
      'talia_council_table': 'the archons\' table: a half-round of white marble on gilt lion feet, orange cushions',
      'talia_city_banner': 'a Talei banner: the gate of the passes in gilt on white, orange border',
      'talia_tariff_board': 'the tariff board: a gilt-framed board of the duties by good and by pass',
      'talia_sample_case': 'a glazed case of bonded samples (spice, dye, glass, salt), brass-bound',
    }


def draw_section(c):
    K = CITY[c]
    def draw():
        f_t = B.font(40, True); f = B.font(20); fs = B.font(17)
        W, H = 2400, 1300; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
        dr.text((30, 18), 'Section through the main axis (u): the governor\'s palace of %s (heights x2)' % K['name'], font=f_t, fill=(20, 20, 20))
        dr.text((30, 70), 'Storeys: ground 5.5 m, upper 4.5 m, the terrace 1.2 m, the undercroft 3.5 m (assumed). The forecourt gate is on the left; the dome over the audience hall.', font=f, fill=(70, 70, 70))
        sx = 24.0; sy = 30.0; ox = 36 * sx + 120; base = H - 260
        def X(u): return ox + u * sx
        def Y(h): return base - h * sy
        dr.line([(0, Y(0)), (W, Y(0))], fill=(120, 100, 80), width=2); dr.text((20, Y(0) + 6), 'the forecourt and the city (y 0)', font=fs, fill=(80, 80, 80))
        boxes = [(-14.3, -1.7, 1.2, 11.2, 'large pavilions (beside the axis, at v +-18)', (240, 244, 236)), (19, 29, 1.2, 11.2, 'rear pavilions (v +-18)', (236, 242, 226)),
                 (-8.5, 24, -2.3, 1.2, 'Undercroft: archive, %s, stores, cells; the hidden way' % K['vault'].lower(), (226, 226, 222)),
                 (-8.5, 24, 1.2, 6.7, 'Ground: loggia, vestibule, the audience hall, the cabinet', (238, 220, 150)),
                 (-8.5, 24, 6.7, 11.2, 'Upper: galleries, petitions, the residence at the rear', (212, 226, 176)),
                 (27.4, 34.6, 1.2, 6.7, 'kitchen', (236, 232, 218)), (3, 17, 11.2, 17, 'the drum', (238, 220, 150)), (8.5, 11.5, 24, 27, 'lantern', (224, 236, 214))]
        for u0, u1, h0, h1, name, col in boxes:
            dr.rectangle([X(u0), Y(h1), X(u1), Y(h0)], fill=col, outline=(30, 30, 30), width=2)
            dr.text((X(u0) + 6, Y(h1) + 4), name, font=fs, fill=(0, 0, 0))
        dr.pieslice([X(3), Y(17 + 7), X(17), Y(17 - 7)], 180, 360, fill=(238, 220, 150), outline=(30, 30, 30), width=2)
        dr.rectangle([X(3), Y(17), X(17), Y(1.2)], outline=(120, 80, 0), width=4); dr.text((X(3) + 6, Y(4)), 'AUDIENCE HALL, two storeys, open to the dome', font=fs, fill=(120, 80, 0))
        for u in (-36, 38): dr.rectangle([X(u) - 6, Y(4), X(u) + 6, Y(0)], fill=(200, 196, 190), outline=(30, 30, 30), width=2)
        dr.text((X(-36) - 20, Y(4) - 24), 'gate', font=fs, fill=(0, 0, 0)); dr.text((X(38) - 50, Y(4) - 24), 'rear wall', font=fs, fill=(0, 0, 0))
        dr.polygon([(X(-12), Y(0)), (X(-8.5), Y(1.2)), (X(-8.5), Y(0))], fill=(150, 150, 150)); dr.text((X(-30), Y(1.2) - 26), 'front flight', font=fs, fill=(0, 0, 0))
        k = 0
        for u, h0, h1, name, col in [(18.5, -2.3, 11.2, 'Private Stair (to the hidden way)', (160, 0, 120)), (25.5, 1.2, 11.2, 'Back Stair', (150, 80, 0)), (10, 17, 27, 'Ladder to the lantern', (0, 120, 0)), (1.3, 0, 6.7, 'Outside Stair (on the flank, v -18 to -28)', (0, 0, 160))]:
            dr.line([(X(u), Y(h0)), (X(u), Y(h1))], fill=col, width=5); dr.text((X(u) + 6, Y(h1) - 24 - 20 * (k % 2)), name, font=fs, fill=col); k += 1
        dr.line([(X(20), Y(-1.5)), (X(40), Y(-1.5))], fill=(160, 0, 0), width=4); dr.text((X(26), Y(-1.5) + 6), K['hidden'], font=fs, fill=(160, 0, 0))
        return img
    return draw


def main(c):
    out_here = os.path.join(ROOT, 'kits', c, 'palace')
    out = os.path.join(out_here, 'floors')
    B.KEYMAP.clear(); B.KEYMAP.update(IZ.keymap())
    B.EXTRA_PROGRAMS.clear(); B.EXTRA_PROGRAMS.update(programs(c))
    for k in list(B.NEW): B.NEW.pop(k)
    B.NEW.update(IZ.IZIZ_NEW); B.NEW.update(city_new(c))
    B.CITY.clear()
    K = CITY[c]
    intro = ('Generated by `settlements/iziz/palace/vassal_blueprint.py %s` (on `settlements/voth/palace/blueprint.py`) from the same room data as the floor sheets. The governor\'s household is Izani, so the keys are the Iziz sets\' (`iziz_court_*`, `iziz_common_*`, the bespoke Iziz pieces, `generic_*`), with %s\'s own pieces where the city shows (the council pavilion, the %s). A key marked **NEW** is not in the catalog yet; the list is at the end. Counts are a brief for the furnisher, not a placement. Finishes: %s.\n' % (c, K['name'], K['assay'], K['decor_note']))
    FL = floors(c)
    for F in FL: F['axisnote'] = 'gate at the left; left/right in the notes as seen walking in (v > 0 is left)'
    fm = os.path.join(out_here, 'FURNITURE.md')
    B.main(floors=FL, out=out, here=out_here, title='# The governor\'s palace of %s: furniture manifest\n' % K['name'], intro=intro, section=draw_section(c), zone_R=-1)
    # the NEW list keeps only the pieces this palace uses (the Iziz list carries the citadel's mech and core pieces)
    with open(fm, encoding='utf-8') as fh: lines = fh.read().split('\n')
    with open(fm, 'w', encoding='utf-8', newline='\n') as fh: fh.write('\n'.join(l for l in lines if not (l.startswith('- `') and l.endswith('(x0)'))))


if __name__ == '__main__':
    for c in (sys.argv[1:] or ['pylon', 'talia']):
        main(c)
