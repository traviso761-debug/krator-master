#!/usr/bin/env python3
"""Jimjam — Decayed Izani Governor's House (Sid'kin-Palu), Order of Historians Chapterhouse & Great Pilgrim's Market.

Runs on settlements/voth/palace/blueprint.py using the shared Jimjam catalog keymap in settlements/jimjam/palace/palace_blueprint.py,
plus Iziz remnants (iziz_*) in the ruined praetorium and Order of Historians fittings (order_*) in the Chapterhouse.

    python settlements/jimjam/landmarks/landmarks_blueprint.py
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'voth', 'palace'))
sys.path.insert(0, os.path.join(HERE, '..', 'palace'))
import blueprint as B
from blueprint import R, box, C
import palace_blueprint as PB
from PIL import Image, ImageDraw

OUT = os.path.join(HERE, 'floors')

# Exact VASSAL-KITS.md §3 coordinates (matching settlements/iziz/palace/vassal_blueprint.py) so the ruin's bones are 100% canonical!
PSTAIR = (17, 20, -6, -3)
BSTAIR = (24, 27, -12, -9)
ESTAIR = (-1.5, 4.2, -28, -18)
LGAL = (-14.3, -1.7, -24.3, -11.7)
RGAL = (-14.3, -1.7, 11.7, 24.3)
LREAR = (19, 29, -23, -13)
RREAR = (19, 29, 13, 23)
LFLANK = (4.4, 11.6, -25.6, -18.4)
RFLANK = (4.4, 11.6, 18.4, 25.6)
KITCH = (27.4, 34.6, -9.6, -2.4)
HALL = (3, 17, -7, 7)

ORDER_SET = {
  'order_bookcase': "Order of Historians bookcase (settlements/yuni/src/59-civic.js)",
  'order_reading_table': "Order of Historians reading table (settlements/yuni/src/59-civic.js)",
  'order_lectern': "Order of Historians lectern (settlements/yuni/src/59-civic.js)",
  'order_library_ladder': "Order of Historians rolling ladder (settlements/yuni/src/59-civic.js)",
  'order_globe_stand': "Order of Historians celestial/terrestrial globe (settlements/yuni/src/59-civic.js)",
  'order_writing_board': "Order of Historians slate writing board (settlements/yuni/src/59-civic.js)",
}

LANDMARK_NEW = {
  'jimjam_common_paper_vat': 'monsoon cotton-rag and reed-pulp vat with bamboo deckle moulds (almanac paper makers)',
  'jimjam_republic_collimator': 'Iron Republic Astronomers\' Guild battery-lit brass collimation bench & cipher ledger',
  'jimjam_heretic_wheel_81': 'covert bronze-and-chalk 81 x 421 = 34,101-day heresy wheel & hooded Second-Fire lamp',
}


def landmark_programs():
    cs = lambda n: max(1, round(n))
    return {
      'rag_paper_court': lambda a, w, d, D: [
        ('jimjam_common_paper_vat', cs(a / 120)),
        ('generic_rack', cs(a / 55)),
        ('generic_workbench', cs(a / 110)),
        ('jimjam_poor_water_jars', cs(a / 80)),
      ],
      'heretic_cellar': lambda a, w, d, D: [
        ('jimjam_heretic_wheel_81', 1),
        ('jimjam_court_new_fire_bowl', 1),
        ('jimjam_poor_diya_stand', 9),
        ('jimjam_common_almanac_shelf', 3),
        ('jimjam_common_takht', 4),
      ],
      'republic_minder': lambda a, w, d, D: [
        ('jimjam_republic_collimator', 1),
        ('jimjam_court_chronograph', 1),
        ('jimjam_common_electric_lamp', 3),
        ('jimjam_common_desk', 2),
        ('jimjam_common_bed', 1),
        ('jimjam_court_strongbox', 1),
      ],
      'ruin_open': lambda a, w, d, D: [
        ('jj_furn_planter', cs(a / 65)),
      ],
      'order_drum_hall': lambda a, w, d, D: [
        ('order_reading_table', 4),
        ('order_bookcase', 10),
        ('order_lectern', 2),
        ('order_globe_stand', 2),
        ('order_library_ladder', 2),
        ('jimjam_common_electric_lamp', 6),
        ('jimjam_poor_mora', 12),
      ],
      'order_archive': lambda a, w, d, D: [
        ('order_bookcase', cs(a / 12)),
        ('jimjam_common_almanac_shelf', cs(a / 18)),
        ('jimjam_court_strongbox', 2),
        ('jimjam_common_electric_lamp', 2),
      ],
      'savant_cell': lambda a, w, d, D: [
        ('jimjam_common_bed', cs(a / 18)),
        ('jimjam_common_desk', cs(a / 18)),
        ('order_writing_board', 1),
        ('jimjam_common_brass_lamp', cs(a / 18)),
        ('jimjam_poor_kist', cs(a / 18)),
      ],
    }


def landmark_floors():
    FL = []

    # ================================================================ IG_B: Decayed Izani Governor's House — Undercroft
    FL.append(dict(
      id='IG_B', tier=-1, R=40, rect=(-16, 42, -30, 30), bar=10,
      title="Sheet IG_B: Decayed Izani Governor's House (Sid'kin-Palu) — Undercroft & Eighty-One Cellar (y = -2.3..+1.2 m)",
      sub=('600-year-old Izani brick-and-ashlar undercroft beneath the cracked 1.2 m praetorium terrace (VASSAL-KITS.md s.3). '
           'Front-right: dry former Imperial Tithe Vault now leased by Dilihan caravan factors for untaxed bales & Cut potash. '
           'Centre & North: collapsed cell vaults and a frog-filled monsoon cistern. Rear-east behind a false fallen-brick '
           'partition: the covert sanctuary where the Eighty-One Heretics tend their unextinguished Second Fire on Double Dark.'),
      axisnote='u = -36..+38 (defaced forecourt gate at left, collapsed garden wall & Wanderer postern at right); v > 0 up',
      outlines=[(-8, 24, -18, 18, 'hall block above'), HALL + ('fallen dome ring above',)],
      rooms=[
        R(1, 'Damp Former Imperial Archive (Mouldering Tax Bricks)', 'store', 3, 17, -18, -7, 0, 'broken Latin tally tablets from Iziz\'s 600-year-old occupation alongside rag-paper bales'),
        R(2, 'Dilihan Factors\' Bonded Bale & Potash Vault', 'store', -4, 3, -11.7, -5, 1, 'the dry former Imperial Treasury; heavy iron door still works, leased from a corrupt palace clerk'),
        R(3, 'Factor Watchman\'s Nook', 'keeper', -4, 3, -5, 1, 1),
        R(4, 'Rag-Pulp Steep Cellar', 'store', 17, 24, -18, -6, 0, 'cool cellar where cotton rags rot into almanac paper stock'),
        R(5, 'Collapsed Wine Vault (Choked with Fallen Stucco)', 'ruin_open', 17, 24, 6, 18, 0, 'impassable; tree roots descend from the ruined garden room above'),
        R(6, 'Flooded Old Cistern (Monsoon Seep)', 'cistern', 3, 17, 7, 18, 0, 'draws water for the forecourt paper-makers'),
        R(7, 'Rusted Guard Armoury Cellar', 'store', LFLANK[0], LFLANK[1], LFLANK[2], LFLANK[3], 0),
        R(8, 'Broken Detention Cells', 'cell', -4, 3, 1, 11.7, 0, 'rusted iron grates'),
        R(9, 'Old Kitchen Cold Pit', 'store', KITCH[0], KITCH[1], KITCH[2], KITCH[3], 0),
        box(10, 'Cracked Private Stair (Hidden Way Down)', 'stair', PSTAIR, 1, 'behind fallen masonry in the ruined cabinet; used at night by the Eighty-One'),
        box(11, 'Service Back Stair', 'stair', BSTAIR, 1),
        R(12, 'Pierced Undercroft Spine (Shored with Timber Props)', 'passage', 3, 20, -7, 7, 0, 'carries the cracked ring piers under the roofless Audience Hall'),
        R(13, 'False-Wall Secret Sanctuary of the Eighty-One Heretics', 'heretic_cellar', 20, 34, -5, 6, 2, 'sealed off the old Imperial escape postern; 81 x 421 = 34,101-day bronze wheel & hooded Second Fire kept burning through Double Dark!'),
        R(14, 'Collapsed Escape Tunnel to Wanderer Scrub', 'passage', 34, 41, -2.5, 0.5, 0, 'low crawlway emerging behind wild figs beside the Uncounted Wanderer Stone Circle'),
      ]))

    # ================================================================ IG_G: Decayed Izani Governor's House — Ground & Grounds
    FL.append(dict(
      id='IG_G', tier=0, R=40, rect=(-36, 40, -30, 30), bar=10,
      title="Sheet IG_G: Decayed Izani Governor's House (Sid'kin-Palu) — Ground Storey & Rag-Paper Forecourt (y = +1.2 m)",
      sub=('Flaking Iziz-orange (#e07a2a) stucco peeling back to dark occupation brick; severed bronze Imperial lamp conduits '
           'hang dead on the pilasters. Forecourt: rag-paper vats and drying frames. Front-right 14 m pavilion: intact Dilihan '
           'Factor Hall. Centre: the 14 m Audience Hall stands OPEN TO THE SKY beneath its fallen dome, a sacred bodhi-fig '
           'splitting its faded Izani sun-mosaic dais.'),
      axisnote='Defaced Gate at left (u = -36); Wanderer Circle postern at right (u = +38); v > 0 up',
      outlines=[(-8, 24, -18, 18, 'hall block'), (-14.3, 34.6, -25.6, 25.6, 'cracked 1.2 m terrace')],
      doors=[(-36, 0), (38, -17), (38, 16)],
      rooms=[
        R(1, 'Defaced Imperial Sun Gate', 'entrance', -36, -31, -5, 5, 1, 'carved Izani Sun-Disc chiselled flat 400 years ago and over-painted in red ochre with Jimjam\'s Three Wheels'),
        R(2, 'Cracked Forecourt: Almanac Rag-Paper Vats & Drying Frames', 'rag_paper_court', -31, -12, -26, 26, 1, 'sheets of wet reed-and-cotton paper dry in the sun across cracked orange-bordered paving'),
        R(3, 'Chipped Marble Terrace Flight', 'stair', -12, -8.5, -6, 6, 1),
        R(4, 'Weathered Patterned-Shaft Loggia', 'hall', -8.5, -4, -11.7, 11.7, 1, 'dead Imperial copper lamp brackets along the soffit'),
        R(5, 'Draughty Vestibule', 'vestibule', -4, 3, -5, 5, 1),
        R(6, 'Squatters\' Tool & Mule Tack Rooms', 'store', -4, 3, -11.7, -5, 0),
        R(7, 'Paper-Makers\' Lime & Rag Shed', 'store', -4, 3, 5, 11.7, 0),
        R(8, 'Roofless Audience Hall (Fallen Dome & Bodhi-Fig Ruin)', 'ruin_open', HALL[0], HALL[1], HALL[2], HALL[3], 1, 'the 14 m Izani dome collapsed a century ago; open sky, monsoon ferns & a bodhi-fig growing out of the cracked mosaic dais'),
        R(9, 'Overgrown Light Courts', 'court', 3, 8, 7, 12, 0),
        R(10, 'South Light Court (Paper Press)', 'rag_paper_court', 3, 8, -12, -7, 1),
        R(11, 'Half-Vaulted Former Governor\'s Cabinet', 'store', 17, 24, -6, 6, 1, 'masked rubble screen hides the Private Stair down to the Eighty-One cellar'),
        box(12, 'Private Stair (masked)', 'stair', PSTAIR, 1),
        R(13, 'Intact NW Pavilion: Dilihan Caravan Factors\' Hall', 'weighing', LGAL[0], LGAL[1], LGAL[2], LGAL[3], 2, 'weather-tight roof; loyalist Dellu-Handu merchants weigh Cut marble, potash & fabrics'),
        R(14, 'Factors\' Ledger & Sample Room', 'office', -1.7, 17, -18, -12, 2),
        box(15, 'Outside Flank Stair (to Republican Minder\'s Suite)', 'stair', ESTAIR, 2, 'the Guild minder climbs here directly from the forecourt without entering the ruin'),
        R(16, 'Guard-Post at Minder\'s Stair (Raja\'s Watchman)', 'guard', LFLANK[0], LFLANK[1], LFLANK[2], LFLANK[3], 1, 'one royal watchman keeps an eye on who visits the Iron Republic minder'),
        R(17, 'Half-Ruined SW Council Pavilion (Cordage & Reed Loft)', 'workshop', RGAL[0], RGAL[1], RGAL[2], RGAL[3], 1, 'tarpaulin-patched dome'),
        R(18, 'Collapsed Orb-and-Sun Shrine (Shell Only)', 'ruin_open', RFLANK[0], RFLANK[1], RFLANK[2], RFLANK[3], 0, 'broken Izani solar altar choked with creepers'),
        R(19, 'Ruined Rear Pavilions (Monsoon Scrub)', 'ruin_open', 19, 29, -23, -13, 0),
        R(20, 'Ruined Family Pavilion', 'ruin_open', 19, 29, 13, 23, 0),
        R(21, 'Old Vented Round Kitchen (Almanac Ink-Boiling Hearth)', 'workshop', KITCH[0], KITCH[1], KITCH[2], KITCH[3], 1, 'soot-blackened dome now boils lampblack & indigo printer\'s ink'),
        box(22, 'Back Stair', 'stair', BSTAIR, 1),
        R(23, 'Rear Cart Yard & Mule Standings', 'court', 27, 38, -28, -10, 1),
        R(24, 'Overgrown Wild Garden & Postern to the Wanderer Circle', 'garden', 29, 38, 2, 28, 1, 'east postern at (u = +38, v = +16) steps directly out to the Uncounted Wanderer Stone Circle'),
      ]))

    # ================================================================ IG_U: Decayed Izani Governor's House — Upper Storey
    FL.append(dict(
      id='IG_U', tier=1, R=38, rect=(-16, 34, -30, 30), bar=10,
      title="Sheet IG_U: Decayed Izani Governor's House — Upper Storey & Iron Republic Minder's Quarters (y = +6.7..11.2 m)",
      sub=('Stark contrast across the upper terrace: three-quarters of the upper Izani palace lies unroofed or dangerous '
           'under monsoon rot, while the weather-tight front-right pavilion (reached directly by the Outside Stair) has been '
           'whitewashed and wired with a battery-electric collimator to house the Iron Republic Astronomers\' Guild Minder.'),
      axisnote='Outside Stair arrives at front-right (v < 0); Audience Hall void in centre lies open to the sky',
      rooms=[
        box(1, 'Outside Flank Stair Landing', 'stair', ESTAIR, 2),
        R(2, 'Iron Republic Guild Minder\'s Optical & Cipher Office (Electric)', 'republic_minder', LGAL[0], LGAL[1], LGAL[2], LGAL[3], 3, 'the one crisp, dry upper drum: Roketstad brass collimator, storage-cell electric lamp, Skywatch/Raja\'s Eye audit ledgers'),
        R(3, 'Minder\'s Bedchamber & Strongbox', 'chamber', -1.7, 8.5, -18, -12, 2),
        R(4, 'Minder\'s Servant & Battery-Charging Closet', 'workshop', 8.5, 17, -18, -12, 1, 'lead-glass cells recharged from a small roof wind-vane / hand dynamo'),
        R(5, 'Minder\'s Roof-Sighting Gallery (ENE Giant & WNW Acropolis View)', 'astronomers', -8.5, -4, -18, 0, 2, 'lets the minder check Acropolis dome openings by spyglass'),
        R(6, 'Fallen Audience-Hall Drum Void (Open to Sky)', 'void', HALL[0], HALL[1], HALL[2], HALL[3], 0, 'jagged ring of orange-stucco pendentives open to rain and birds'),
        R(7, 'Unsafe Cracked Upper Arcade (Barred)', 'ruin_open', -8.5, -4, 0, 18, 0),
        R(8, 'Roofless Former Envoy Pavilion', 'ruin_open', RGAL[0], RGAL[1], RGAL[2], RGAL[3], 0),
        R(9, 'Collapsed Rear Residence Shells', 'ruin_open', 17, 29, -23, 23, 0, 'broken rafters & banyan roots'),
        box(10, 'Back Stair Head (to Ink-Kitchen Roof)', 'stair', BSTAIR, 0),
      ]))

    # ================================================================ CH_G: Order of Historians Small Chapterhouse (48 x 42 m)
    FL.append(dict(
      id='CH_G', tier=0, R=30, rect=(-26, 26, -24, 24), bar=10,
      title="Sheet CH_G: Order of Historians' Small Chapterhouse (Thirteen District, 48 x 42 x 22 m)",
      sub=('The Order\'s canonical chapterhouse programme (76-port-chapterhouse.js / Longsong lineage) translated into Jimjam '
           'banded red/yellow brick with Cut-marble sills and the Order\'s signature saturated cobalt-blue mosaic string course: '
           'parabolic gate between twin pylons, arcaded Stele Court, Round Drum Reading Hall under a conical tile roof and '
           'electric oculus, Long-Count Collation Vault, and guest cells for Yuni, Dalab, Talia, Yonni & Rian scholar-pilgrims.'),
      axisnote='u = -24..+24 (Parabolic Gate on West Street at left, Drum Hall & Vault at right); v across',
      doors=[(-24, 0), (24, -14)],
      rooms=[
        R(1, 'Parabolic Pylon Gate (Cobalt-Blue Mosaic Band)', 'entrance', -24, -18, -5, 5, 3, 'the Order\'s unmistakable silhouette in local brick; clean electric gate lantern'),
        R(2, 'Porter & Lay Warden\'s Lodge', 'guard', -24, -18, 5, 14, 2),
        R(3, 'Public Almanac & Chronicle Copying Porch', 'office', -24, -18, -14, -5, 2, 'townsfolk & kauntavan bring old family deeds for dating'),
        R(4, 'Arcaded Debate & Stele Forecourt', 'court', -18, -2, -12, 12, 3, 'curved gallery wings; multilingual stele comparing the Jamtokku Kauntu with the Order\'s Long Count'),
        C(5, 'Round Drum Reading & Concordance Hall (Electric Oculus)', 'order_drum_hall', 8, 0, 9.5, 4, '19 m brick drum under conical tile roof & glazed lantern; clean electric reading lamps, order_* tables & globes'),
        R(6, 'Long-Count & Raja\'s Eye Ephemeris Vault (Electric)', 'order_archive', 16, 24, 6, 20, 3, 'fireproof brick vault preserving 600 years of eclipse, Veil & Wanderer sightings'),
        R(7, 'Prior-Chronicler\'s Study & Dispatch Room', 'cabinet', 16, 24, -20, -6, 3, 'corresponds with Longsong, Yuni, Dalab & Iziz chapterhouses'),
        R(8, 'North Cloister: Resident History Monks\' Cells (6 Monks)', 'savant_cell', -18, 8, 12, 21, 2),
        R(9, 'South Cloister: Visiting Far-Flung Savants\' Hostel', 'savant_cell', -18, 8, -21, -12, 3, 'lodges visiting Yuni Geomancers, Dalab–Shim savants, Talian astronomers, and White-Pass Yonni & Rian scholars!'),
        R(10, 'Chapter Refectory, Tea Kitchen & Cistern Postern', 'kitchen', 8, 16, -21, -10, 1),
      ]))

    # ================================================================ PM_G: The Great Pilgrim's Market & Cut Caravanserai (320 x 220 m)
    FL.append(dict(
      id='PM_G', tier=0, R=172, rect=(-165, 165, -115, 115), bar=50,
      title="Sheet PM_G: The Great Pilgrim's Market & Cut-Gate Caravanserai Fairground (320 x 220 m — SIM.pilgrimMarket)",
      sub=('Outside the Sun-Road / Cut South Gate: permanent banded-brick pier rows lie quiet in ordinary weeks and burst into '
           'canvas-awninged life during Pilgrim Floods (Double Dark, Day 350 Solstice, Concordance, Veil +-50 deg). Stalls are '
           'causally stocked in 77-sim-6p-pilgrims.js from whichever pilgrim streams reached the city.'),
      axisnote='North (Sun-Road City Gate) is UP (+v); East (jj_caravanserai) is RIGHT (+u); West (Tent Maidan) is LEFT (-u)',
      doors=[(0, 110), (-160, 0), (160, 0), (0, -110)],
      rooms=[
        R(1, 'Sun-Road Gate Apron & Royal Toll Arch', 'entrance', -25, 25, 88, 110, 3, 'Raja\'s market bailiffs collect the treasuryTax on Pilgrim-Market sales'),
        C(2, 'Central Solar Standards, Weights & Currency Exchange Kiosk', 'weighing', 0, 15, 18, 4, 'converts Talents, Eternian tael-bars, Hykkousoi drachms, Rian silver & barter lots'),
        R(3, 'Aisle I — Hykkousoi Sailor-Pilgrim Row (Bio-Reagents & Sea-Nacre)', 'pilgrim_bazaar', -120, -25, 35, 80, 3, 'Tethyan HM-17 flooded-lab bio-reagents, grown Ys abalone nacre, bay-purple murex, Ring-Isles ambergris'),
        R(4, 'Aisle II — Inner Crater, Dalab–Shim & Yuni Savants\' Row (Tech & Biogel)', 'pilgrim_bazaar', 25, 95, 35, 80, 3, 'Dalabite pressure-gel, Yuni Vault energy cells, Talian optical lens blanks, Shumari star-tables'),
        R(5, 'Aisle III — White-Pass Yeti, Yonni & Rian Trans-Rim Row', 'pilgrim_bazaar', -120, -25, -20, 25, 3, 'Whitelake/Leng Khaayken qiviut, goldroot & lung-salt; Yonni (Arkerum) giant-snail nacre/chitin; Rian lodestone compasses & sap-essences!'),
        R(6, 'Aisle IV — Serai, Skywatch & Dam-Basin Salvage Row (Artifacts)', 'pilgrim_bazaar', -120, -25, -75, -30, 2, 'Boatmurder & Veladiga dam-arcology servos/alloys, Serai soda-glass & salt talismans'),
        R(7, 'Aisle V — Inspected Eternal State Quota-Pavilion (+ Covert Rear Flaps)', 'pilgrim_bazaar', 25, 95, -25, 25, 2, 'front counter sells licensed Lux porcelain insulators; covert rear flaps trade forbidden Te-te star-codices when minders look away!'),
        R(8, 'Local Kauntavan Almanac, Brass-Astrolabe & Saffron Row', 'pilgrim_bazaar', 25, 95, -75, -30, 3, 'pilgrims buy souvenir 91-day almanacs, pocket gnomons & blessed New-Fire lamps to carry home'),
        R(9, 'Great Cut-Gate Caravanserai (jj_caravanserai, 57.2 x 71.6 m)', 'caravanserai' if 'caravanserai' in B.EXTRA_PROGRAMS else 'weighing', 102, 159, -36, 36, 3, 'permanent walled courtyard khan with beast yard & well kiosk'),
        R(10, 'West Overflow: Striped Pilgrim Tent-Maidan Lead-In (core/camp)', 'court', -160, -125, -95, 95, 1, 'SIM.pilgrimCampTents pitches seasonal cotton pavilions westward across the 520 x 320 m Lotus Maidan'),
        R(11, 'Pilgrim Soup-Kitchens, Chai Stalls & Lustral Water Troughs', 'kitchen', -95, 95, -105, -80, 1),
      ]))

    return FL


def draw_izani_ruin_section():
    """Longitudinal section of the Decayed Izani Governor's House (Sid'kin-Palu)."""
    f_t = B.font(36, True); f = B.font(19); fs = B.font(16); fb = B.font(18, True)
    W, H = 2400, 1220
    img = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(img)
    dr.text((30, 18), "Longitudinal Section (u): Decayed Izani Governor's House — Sid'kin-Palu (heights x2)", font=f_t, fill=(20, 20, 20))
    dr.text((30, 66), "600-year-old VASSAL-KITS s.3 praetorium in disrepair: rag-paper forecourt, intact NW Republican Minder pavilion, fallen central dome, & covert Eighty-One cellar.", font=f, fill=(70, 70, 70))

    sx = 24.0; sy = 30.0; ox = 38 * sx + 90; base = H - 240
    def X(u): return ox + u * sx
    def Y(h): return base - h * sy

    dr.rectangle([0, Y(0), W, H], fill=(236, 228, 214))
    dr.line([(0, Y(0)), (W, Y(0))], fill=(110, 90, 70), width=2)
    dr.text((24, Y(0) + 8), "SE Bluff Grade (+524.0 m ASL, y = 0)", font=fs, fill=(80, 65, 50))

    # Defaced Gate (u = -36..-31, y = 0..5.5) & Rag-Paper Forecourt (u = -31..-12)
    dr.rectangle([X(-36), Y(5.5), X(-31), Y(0)], fill=(224, 146, 92), outline=(40, 40, 40), width=2)
    dr.text((X(-37), Y(7.0)), "Defaced Sun Gate\n(Three Wheels over-paint)", font=fs, fill=(130, 50, 10))
    dr.text((X(-30.2), Y(2.2)), "Cracked Forecourt:\nRag-paper vats & racks", font=fs, fill=(70, 70, 70))

    # Intact NW Pavilion in background (u = -14.3..-1.7, y = 1.2..14.5)
    dr.rectangle([X(-14.3), Y(11.2), X(-1.7), Y(1.2)], fill=(232, 238, 244), outline=(50, 70, 100), width=2)
    dr.pieslice([X(-13.5), Y(11.2 + 3.5), X(-2.5), Y(11.2 - 3.5)], 180, 360, fill=(140, 152, 166), outline=(40, 40, 40), width=2)
    dr.text((X(-14.0), Y(10.6)), "Intact NW Pavilion Upper:\nIron Republic Minder (Electric)", font=fs, fill=(25, 55, 110))
    dr.text((X(-14.0), Y(7.6)), "Ground: Dilihan Factors", font=fs, fill=(60, 40, 20))

    # Undercroft (u = -8.5..24, y = -2.3..1.2) + Secret Eighty-One Cellar (u = 20..34)
    dr.rectangle([X(-8.5), Y(1.2), X(20), Y(-2.3)], fill=(216, 214, 208), outline=(40, 40, 40), width=2)
    dr.text((X(-7.5), Y(-0.3)), "Undercroft: Dilihan Bonded Vault | Old Archive | Flooded Cistern", font=fs, fill=(40, 40, 40))
    dr.rectangle([X(20), Y(1.2), X(34), Y(-2.3)], fill=(242, 212, 184), outline=(160, 40, 20), width=3)
    dr.text((X(20.6), Y(-0.2)), "SECRET 81-HERETIC CELLAR\n(Covert Second Fire!)", font=fb, fill=(150, 25, 15))
    dr.line([(X(34), Y(-1.2)), (X(41), Y(-0.4))], fill=(150, 25, 15), width=4)
    dr.text((X(34.5), Y(-2.4)), "Crawlway -> Wanderer Stone Circle", font=fs, fill=(150, 25, 15))

    # Hall Block Ground & Ruined Upper (u = -8.5..24)
    dr.rectangle([X(-8.5), Y(6.7), X(3), Y(1.2)], fill=(236, 214, 186), outline=(40, 40, 40), width=2)
    # Roofless Audience Hall (u = 3..17, y = 1.2..13.5 jagged broken drum!)
    dr.rectangle([X(3), Y(12.0), X(17), Y(1.2)], fill=(228, 240, 248), outline=(140, 80, 40), width=2)
    dr.polygon([(X(3), Y(12.0)), (X(5.5), Y(15.2)), (X(8), Y(11.8)), (X(12), Y(11.5)), (X(14.8), Y(14.6)), (X(17), Y(12.0))],
               fill=(224, 146, 92), outline=(80, 40, 20))
    # Bodhi-fig growing in the ruined hall!
    dr.rectangle([X(9.6), Y(8.5), X(10.6), Y(1.2)], fill=(110, 75, 45))
    dr.ellipse([X(6.5), Y(13.5), X(13.8), Y(7.5)], fill=(115, 168, 96), outline=(55, 95, 45), width=2)
    dr.text((X(4.2), Y(16.8)), "FALLEN IZANI DOME (open to sky & bodhi-fig)", font=fb, fill=(150, 60, 15))

    # Ruined rear block & Ink-boiling Round Kitchen (u = 27.4..34.6)
    dr.rectangle([X(17), Y(6.7), X(24), Y(1.2)], fill=(228, 216, 200), outline=(40, 40, 40), width=2)
    dr.rectangle([X(27.4), Y(6.7), X(34.6), Y(1.2)], fill=(216, 198, 184), outline=(40, 40, 40), width=2)
    dr.text((X(27.6), Y(5.4)), "Ink Kitchen", font=fs, fill=(40, 40, 40))

    # Hidden stair line
    dr.line([(X(18.5), Y(-2.3)), (X(18.5), Y(6.7))], fill=(160, 0, 110), width=5)
    dr.text((X(19.0), Y(8.0)), "Masked Stair to 81 Cellar", font=fs, fill=(160, 0, 110))

    return img


def main():
    PB.apply_jj_catalog()
    B.EXTRA_PROGRAMS.update(landmark_programs())
    B.NEW.update(LANDMARK_NEW)
    B.CITY.update(ORDER_SET)
    FL = landmark_floors()
    intro = (
      'Generated by `settlements/jimjam/landmarks/landmarks_blueprint.py` (on `settlements/voth/palace/blueprint.py` '
      'and `settlements/jimjam/palace/palace_blueprint.py`). Covers the Decayed Izani Governor\'s House (*Sid\'kiñ-Pāḷu*, '
      '`IG_B`/`IG_G`/`IG_U`), the Order of Historians\' Small Chapterhouse (`CH_G`), and the Great Pilgrim\'s Market '
      '& Cut-Gate Caravanserai (`PM_G`).\n'
    )
    fm = os.path.join(HERE, 'FURNITURE.md')
    B.main(floors=FL, out=OUT, here=HERE,
           title='# Major Historical & Pilgrim Landmarks of Jimjam: Furniture Manifest\n',
           intro=intro, section=draw_izani_ruin_section, zone_R=172)
    with open(fm, encoding='utf-8') as fh:
        lines = fh.read().split('\n')
    with open(fm, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(l for l in lines if not (l.startswith('- `') and l.endswith('(x0)'))) + '\n')


if __name__ == '__main__':
    main()
