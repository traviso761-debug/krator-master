#!/usr/bin/env python3
"""Jimjam — The Raja's Palace & Great Sunray Plaza blueprint (plus Sheet S0_site city masterplan).

Built on settlements/voth/palace/blueprint.py, mapping furniture keys onto kits/catalog/krator-master-furniture-jimjam.js
(jimjam_court_*, jimjam_common_*, jimjam_poor_*, plus JJFURN outdoor pieces from settlements/jimjam/src/84-jj-furniture.js
and generic_trade_* / order_* where shared). Also exports the shared Jimjam keymap/programs for temples_blueprint.py and
landmarks_blueprint.py.

Frame for Palace sheets (B, L1, L2, L3, LR):
  u = -z (metres along the processional axis from the front of Great Sunray Plaza u = -125 through the Ceremonial Gateway
      u = -35 and Recessed Loggia u = -14..-10 to the rear wall u = +40);
  v = +x (metres across, v > 0 drawn UP = left-hand / NE side walking in from the NNW Harbour Avenue).
Exact match to settlements/jimjam/src/75-jj-palace.js:
  PL = 4.5 m podium, 3 storeys x 6.0 m (RY = 22.78 m), main block u = -10..+40, v = -48..+48, front side sections
  u = -14..-10, v = +-(24..48), forecourt wings u = -36..-14, v = +-(34..48), central pavilion u = +2..+26, v = -16..+16
  under r = 9.6 m gold onion dome at (u = +14, v = 0), side gold domes at (u = +14, v = +-32), rear slate lantern domes
  at (u = +32, v = +-32), 4 clustered chimney stacks at (u = +35, v = +-20) and (u = +23, v = +-41), 6 corner/gate spires.

    python settlements/jimjam/palace/palace_blueprint.py
"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'voth', 'palace'))
import blueprint as B
from blueprint import R, box, C
from PIL import Image, ImageDraw

OUT = os.path.join(HERE, 'floors')

# ---- Shared Jimjam catalog keymap (kits/catalog/krator-master-furniture-jimjam.js + JJFURN + generic_trade_*) ----
JJ_FURN_SET = {
  'jj_furn_bench': 'Jimjam carved brick-and-terracotta bench (src/84-jj-furniture.js)',
  'jj_furn_fountain': 'Jimjam marble-and-yellow-brick court fountain (src/84-jj-furniture.js)',
  'jj_furn_statue': 'Jimjam bronze-and-gold sun guardian statue (src/84-jj-furniture.js)',
  'jj_furn_brazier': 'Jimjam whorl-olive oil brazier (src/84-jj-furniture.js)',
  'jj_furn_oil_lamp': 'Jimjam tall brass-and-marble standing oil lamp (src/84-jj-furniture.js)',
  'jj_furn_banner_pole': 'Jimjam Three-Wheels banner pole (src/84-jj-furniture.js)',
  'jj_furn_planter': 'Jimjam terracotta-and-ochre court planter (src/84-jj-furniture.js)',
  'jj_furn_pool': 'Jimjam marble-rimmed reflecting pool (src/84-jj-furniture.js)',
  'jj_furn_market_stall': 'Jimjam brick-and-marble awning market stall (src/84-jj-furniture.js)',
}

JJ_NEW = {
  'jimjam_court_armillary': 'brass-and-emerald Kauntavan armillary sphere and vernier ring on carved marble plinth',
  'jimjam_court_gnomon_pillar': 'graduated white Cut-marble meridian gnomon and shadow-scale slab',
  'jimjam_court_strongbox': 'iron-bound teak and brass double-keyed royal treasury chest',
  'jimjam_court_map_table': 'inlaid stone-and-brass table of the handu land grid and Great Trough Lake routes',
  'jimjam_court_dream_jali': 'pierced Vellai-kal alabaster whispering screen between petitioner and coin-veiled Dream-Sibyl',
  'jimjam_court_chronograph': 'electric-regulated precision brass-and-quartz astronomical chronograph (Raja\'s Eye / Vault circuit)',
  'jimjam_court_telescope': 'the Raja\'s Eye brass-and-emerald refractor tube on cast Ardent-bronze azimuth mount',
  'jimjam_court_bell_wheel': '13-hour Companion bronze gong-wheel with water-escapement striker',
  'jimjam_court_bath_pool': 'stepped brick-and-marble sunken lotus bath basin',
  'jimjam_common_desk': 'low sloped Jamtokku scribe and kauntavan reckoning desk with reed-pen well',
  'jimjam_common_table': 'carved monsoon-timber dining and work table',
  'jimjam_common_counter': 'banded-brick and marble shop/assay counter',
  'jimjam_common_almanac_press': 'woodblock and brass-frame Royal Almanac printing press',
  'jimjam_common_dye_vat': 'sunken glazed-brick humoral dye vat (indigo, saffron, wineweed)',
  'jimjam_common_electric_lamp': 'caged brass institutional electric lamp (selective precision/vault circuit)',
}


def jj_keymap():
    m = {
      # Court set -> jimjam_court_* & jimjam_common_*
      'voth_court_sun_throne': 'jimjam_court_gaddi',
      'voth_court_throne': 'jimjam_court_gaddi',
      'voth_court_baldachin_bed': 'jimjam_common_bed',
      'voth_court_bed': 'jimjam_common_bed',
      'voth_court_divan': 'jimjam_court_jhula',
      'voth_court_judge_dais': 'jimjam_court_gaddi',
      'voth_court_table': 'jimjam_court_sunray_table',
      'voth_court_low_table': 'jimjam_court_sunray_table',
      'voth_court_desk': 'jimjam_common_desk',
      'voth_court_cabinet': 'jimjam_common_almirah',
      'voth_court_bookcase': 'jimjam_common_almanac_shelf',
      'voth_court_hearth': 'jimjam_common_chimney_hearth',
      'voth_court_fire': 'jimjam_court_new_fire_bowl',
      'voth_court_sun_altar': 'jimjam_court_new_fire_bowl',
      'voth_court_lamp': 'jimjam_common_brass_lamp',
      'voth_court_candelabra': 'jimjam_common_brass_lamp',
      'voth_court_screen': 'jimjam_common_carved_screen',
      'voth_court_banner': 'jimjam_court_banner',
      'voth_court_hanging': 'jimjam_court_banner',
      'voth_court_tapestry': 'jimjam_court_banner',
      'voth_court_painted_hanging': 'jimjam_court_banner',
      'voth_court_frieze': 'jimjam_common_count_wheels',
      'voth_court_wall_rug': 'generic_rug',
      'voth_court_carpet': 'generic_rug',
      'voth_court_scroll': 'jimjam_common_almanac_shelf',
      'voth_court_art': 'jimjam_common_count_wheels',
      'voth_court_statue': 'jj_furn_statue',
      'voth_court_jug': 'jimjam_poor_water_jars',
      'voth_court_bowl': 'generic_bowl',
      'voth_court_armillary': 'jimjam_court_armillary',
      'voth_court_map_table': 'jimjam_court_map_table',
      'voth_court_strongbox': 'jimjam_court_strongbox',
      'voth_court_lectern': 'jimjam_common_desk',
      'voth_court_bath_pool': 'jimjam_court_bath_pool',
      'voth_court_bath_slab': 'jimjam_common_takht',
      'voth_court_wall_fountain': 'jj_furn_fountain',
      'voth_court_armour_stand': 'generic_trade_armour_stand',
      'voth_court_staff_stand': 'jimjam_common_count_wheels',
      'voth_court_palanquin': 'jimjam_court_jhula',
      'voth_court_trophy_stand': 'jimjam_court_banner',
      # Common / poor set -> jimjam_common_* & jimjam_poor_*
      'voth_common_bed': 'jimjam_common_bed',
      'voth_common_bench': 'jimjam_common_takht',
      'voth_common_chair': 'jimjam_poor_mora',
      'voth_common_stool': 'jimjam_poor_mora',
      'voth_common_table': 'jimjam_common_table',
      'voth_common_low_table': 'jimjam_court_sunray_table',
      'voth_common_desk': 'jimjam_common_desk',
      'voth_common_chest': 'jimjam_poor_kist',
      'voth_common_bookcase': 'jimjam_common_almanac_shelf',
      'voth_common_wall_shelves': 'jimjam_common_almanac_shelf',
      'voth_common_store': 'jimjam_poor_kist',
      'voth_common_hearth': 'jimjam_common_chimney_hearth',
      'voth_common_fire': 'jimjam_poor_chulha',
      'voth_common_lamp': 'jimjam_common_brass_lamp',
      'voth_common_candle': 'jimjam_poor_diya_stand',
      'voth_common_hanging': 'jimjam_court_banner',
      'voth_common_rug': 'generic_rug',
      'voth_common_screen': 'jimjam_common_carved_screen',
      'voth_common_counter': 'jimjam_common_counter',
      'voth_common_workbench': 'generic_workbench',
      'voth_common_loom': 'generic_trade_loom',
      'voth_common_rack': 'generic_rack',
      'voth_common_ladder': 'generic_ladder',
      'voth_common_board': 'jimjam_common_count_wheels',
      'voth_common_art': 'jimjam_common_count_wheels',
      'voth_common_banner': 'jimjam_court_banner',
      'voth_common_scroll': 'jimjam_common_almanac_shelf',
      'voth_common_pennants': 'jimjam_court_banner',
      'voth_common_bowl': 'generic_bowl',
      'voth_common_jug': 'jimjam_poor_water_jars',
      'voth_common_books': 'generic_books',
      'voth_common_ash_niche': 'jimjam_poor_fire_niche',
      'voth_common_cauldron': 'jimjam_poor_chulha',
      'voth_common_spit': 'jimjam_common_chimney_hearth',
      'voth_common_copper': 'jimjam_poor_chulha',
      'voth_common_drying_rack': 'generic_rack',
      'voth_common_bath_basin': 'jimjam_poor_water_jars',
      'voth_common_drum_stand': None,
      'voth_common_manacles': None,
      'voth_common_pit_grate': None,
      'voth_common_ice_box': 'jimjam_poor_water_jars',
      'voth_common_litter_rack': None,
      # Outdoor / city pieces -> JJFURN
      'voth_bench': 'jj_furn_bench',
      'voth_planter': 'jj_furn_planter',
      'voth_statue': 'jj_furn_statue',
      'voth_street_brazier': 'jj_furn_brazier',
      'hl_rep_roofed_well': 'jj_furn_fountain',
      'voth_bread_oven': 'jimjam_common_chimney_hearth',
      'voth_craft_brewer': 'generic_trade_still',
      'voth_loom_display': 'generic_trade_loom',
      'voth_canoe': None,
      'voth_cell_grate': None,
    }
    return m


def jj_programs():
    cs = lambda n: max(1, round(n))
    return {
      'electric_vault': lambda a, w, d, D: [
        ('jimjam_court_strongbox', cs(a / 14)),
        ('jimjam_common_almirah', cs(a / 28)),
        ('jimjam_common_electric_lamp', cs(a / 25)),
        ('jimjam_court_chronograph', 1),
      ],
      'electric_chancery': lambda a, w, d, D: [
        ('jimjam_common_desk', cs(a / 16)),
        ('jimjam_poor_mora', cs(a / 14)),
        ('jimjam_common_almanac_shelf', cs(a / 20)),
        ('jimjam_court_strongbox', 2),
        ('jimjam_common_electric_lamp', cs(a / 24)),
        ('jimjam_common_count_wheels', 2),
      ],
      'dream_oracle': lambda a, w, d, D: [
        ('jimjam_court_dream_jali', cs(max(1, w / 5))),
        ('jimjam_court_jhula', cs(a / 22)),
        ('jimjam_court_jharokha_seat', 2),
        ('jimjam_poor_diya_stand', cs(a / 12)),
        ('jimjam_common_brass_lamp', cs(a / 20)),
        ('jimjam_common_almanac_shelf', 2),
      ],
      'zenana_hall': lambda a, w, d, D: [
        ('jimjam_court_jhula', cs(a / 24)),
        ('jimjam_court_jharokha_seat', cs(a / 35)),
        ('jimjam_court_sunray_table', cs(a / 30)),
        ('jimjam_common_carved_screen', cs(a / 28)),
        ('jimjam_common_brass_lamp', cs(a / 18)),
        ('jimjam_common_almirah', 2),
      ],
      'observatory_dome': lambda a, w, d, D: [
        ('jimjam_court_telescope', 1),
        ('jimjam_court_armillary', 2),
        ('jimjam_court_chronograph', 2),
        ('jimjam_common_electric_lamp', 4),
        ('jimjam_common_desk', 3),
        ('jimjam_common_almanac_shelf', 4),
      ],
      'solstice_sanctuary': lambda a, w, d, D: [
        ('jimjam_court_new_fire_bowl', 3),
        ('jimjam_court_gnomon_pillar', 1),
        ('jimjam_common_count_wheels', 4),
        ('jimjam_common_brass_lamp', 8),
        ('jj_furn_statue', 2),
      ],
      'moon_sanctuary': lambda a, w, d, D: [
        ('jimjam_court_new_fire_bowl', 2),
        ('jimjam_court_armillary', 1),
        ('jimjam_common_count_wheels', 2),
        ('jimjam_common_brass_lamp', cs(a / 16)),
        ('jimjam_poor_diya_stand', cs(a / 10)),
        ('jimjam_common_takht', cs(a / 30)),
      ],
      'dial_rotunda': lambda a, w, d, D: [
        ('jimjam_court_gnomon_pillar', 1),
        ('jimjam_court_bell_wheel', 1),
        ('jimjam_common_count_wheels', 13),
        ('jimjam_common_brass_lamp', 6),
        ('jimjam_common_desk', 4),
      ],
      'almanac_press': lambda a, w, d, D: [
        ('jimjam_common_almanac_press', cs(a / 45)),
        ('jimjam_common_almanac_shelf', cs(a / 20)),
        ('jimjam_common_table', cs(a / 30)),
        ('jimjam_poor_mora', cs(a / 20)),
        ('jimjam_common_brass_lamp', cs(a / 25)),
      ],
      'humoral_bath': lambda a, w, d, D: [
        ('jimjam_court_bath_pool', 1),
        ('jimjam_common_takht', cs(a / 24)),
        ('jimjam_poor_water_jars', cs(a / 14)),
        ('jimjam_common_brass_lamp', cs(a / 25)),
      ],
      'sunray_plaza': lambda a, w, d, D: [
        ('jimjam_court_gnomon_pillar', 1),
        ('jj_furn_brazier', 8),
        ('jj_furn_banner_pole', 16),
        ('jj_furn_oil_lamp', 8),
      ],
      'jharokha_oriel': lambda a, w, d, D: [
        ('jimjam_court_jharokha_seat', 1),
        ('jimjam_poor_diya_stand', 2),
      ],
      'pilgrim_bazaar': lambda a, w, d, D: [
        ('jj_furn_market_stall', cs(a / 55)),
        ('jimjam_common_counter', cs(a / 80)),
        ('jimjam_poor_kist', cs(a / 45)),
        ('jj_furn_oil_lamp', cs(a / 90)),
      ],
    }


def apply_jj_catalog():
    B.KEYMAP.clear()
    B.KEYMAP.update(jj_keymap())
    B.EXTRA_PROGRAMS.clear()
    B.EXTRA_PROGRAMS.update(jj_programs())
    B.OPEN_KINDS.clear()
    B.OPEN_KINDS.update({'sunray_plaza', 'pilgrim_bazaar'})
    for k in list(B.NEW):
        B.NEW.pop(k)
    B.NEW.update(JJ_NEW)
    B.CITY.clear()
    B.CITY.update(JJ_FURN_SET)


# ---- Fixed vertical shafts & stair cores across B -> L1 -> L2 -> L3 -> LR ----
STAIR_N = (-2, 4, 16, 20)      # North State Stair (L1 vestibule -> L2/L3 galleries)
STAIR_S = (-2, 4, -20, -16)    # South State Stair (L1 vestibule -> L2/L3 galleries)
STAIR_CH = (-26, -20, -40, -35) # Chancery & Guard Stair (B -> L1 South Wing -> L2)
STAIR_TX = (-26, -20, 35, 40)  # Tax & Assay Wing Stair (L1 North Wing -> L2)
STAIR_PV = (26, 31, -22, -17)  # Raja's Privy Stair (B vault/postern -> L1 -> L2 Cabinet -> L3 Raja Suite & Oracle Booth)
STAIR_ZN = (26, 31, 17, 22)    # Sealed Ruby Zenana Stair (L1 Steward lock -> L2 -> L3 Zenana; separate from Raja!)
STAIR_KN = (31, 36, 36, 42)    # North Kitchen & Zenana Service Stair (B cellars -> L1 Kitchens -> L2/L3)
STAIR_KS = (31, 36, -42, -36)  # South Kitchen & Banquet Service Stair (B cellars -> L1 Kitchens -> L2/L3)
DOME_VOID = (2, 26, -16, 16)   # Central 24 x 32 m Darbar Hall & Onion Dome core (centred at u = +14, v = 0)
LCOURT_N = (4, 24, 20, 30)     # North Lotus Light-Court
LCOURT_S = (4, 24, -30, -20)   # South Lotus Light-Court


def palace_floors():
    FL = []

    # ---------------------------------------------------------------- B: Podium Undercroft (y = 0.0..4.5 m)
    FL.append(dict(
      id='B', tier=-1, R=62, rect=(-44, 44, -58, 58),
      title='Sheet B: Podium Undercroft (y = 0.0 to +4.5 m inside the 112 x 81 m plinth)',
      sub=('Dry brick-vaulted undercroft inside the 4.5 m masonry podium above +496.0 m grade. Holds the two-keyed '
           'electric-lit Royal Bullion, Emerald & Alabaster Vault, the Handu copper-plate land archive, monsoon roof '
           'cisterns, grain and whorl-olive lamp-oil cellars under the kitchens, the guard armoury, and the rear service gate.'),
      axisnote='u = -z (Sunray Plaza & harbour approach at left, rear postern at right); v = +x up (NE / Zenana flank)',
      outlines=[(-38, 43, -56, 56, 'podium footprint (112 x 81 m)'), (-10, 40, -48, 48, 'main block above'),
                DOME_VOID + ('central Darbar & dome piers',)],
      doors=[(43, 0), (-38, -28)],
      rooms=[
        R(1, 'Undercroft Spine Vault', 'passage', -38, 43, -4, 4, 1, 'heavy brick pier gallery carrying the Darbar floor above; rear cart/postern gate at u = +43'),
        R(2, 'Royal Bullion & Emerald Vault (Electric)', 'electric_vault', 6, 24, -16, -4, 3, 'two keys (Chamberlain + Chief Kauntavan); electric security lamps & quartz clock; beryl cabochons, Cut silver, tax gold'),
        R(3, 'Veil-Marble & Alabaster Reserve Vault (Electric)', 'electric_vault', -8, 6, -16, -4, 2, 'dressed Cut/Eternian white marble slabs, Vellai-kal alabaster jali blanks & optical glass ingots'),
        R(4, 'Vault Keeper & Two-Key Watch', 'keeper', -16, -8, -16, -4, 2, 'armoured wicket; logs every opening against the 13 Companion hours'),
        R(5, 'Archive of the Handu & Long-Count Copper Plates', 'archive', -16, 24, 4, 16, 2, 'solar-surveyed handu allotment rolls, Serai & Dilihan treaty plates, sealed census tallies'),
        R(6, 'North Monsoon Cistern', 'cistern', 4, 24, 20, 44, 0, 'fed by terracotta downspouts from the North Lotus Light-Court and roof deck'),
        R(7, 'South Monsoon Cistern', 'cistern', 4, 24, -44, -20, 0, 'fed from the South Light-Court; supplies the royal hammam hypocaust and kitchens'),
        R(8, 'Whorl-Olive Lamp-Oil Cellar', 'buttery', -36, -16, 4, 28, 0, 'stone jars of clarified whorl-olive oil for the palace\'s 600 traditional brass dīpam lamps'),
        R(9, 'Royal Granary & Rice Vaults', 'store', -36, -16, 28, 52, 0, 'tax rice, saffron chests, tamarisk-manna and dried citron'),
        R(10, 'Palace Guard Armoury', 'armoury', -36, -16, -34, -4, 1, 'matchlocks, Ardent bronze-hilted pikes, ceremonial sun-shields'),
        R(11, 'Guard Detention Cells', 'cell', -36, -24, -52, -34, 0, 'four dry brick cells for customs/coinage offenders awaiting Darbar judgment'),
        R(12, 'Guard Watchroom & Side Postern', 'guard', -24, -16, -52, -34, 1, 'watches the south-front undercroft postern'),
        R(13, 'North Kitchen Larders & Cold Jars', 'larder', 24, 42, 22, 48, 0, 'directly under the North Kitchens; evaporative porous-clay cooling'),
        R(14, 'South Banquet Cellars & Arrack Store', 'buttery', 24, 42, -48, -22, 0, 'aged grain whiskey/arrack, spiced cordials, copper cauldrons'),
        R(15, 'Fuelwood, Husk & Charcoal Vault', 'store', 31, 42, -16, 16, 0, 'monsoon timber and pressed rice-husk briquettes for the 4 chimney stacks'),
        box(16, 'Raja\'s Privy Stair (foot)', 'stair', STAIR_PV, 2, 'descends from the Cabinet & Raja\'s Suite to the Bullion Vault and rear postern'),
        box(17, 'Chancery & Guard Stair', 'stair', STAIR_CH, 1),
        box(18, 'North Kitchen Stair', 'stair', STAIR_KN, 1),
        box(19, 'South Kitchen Stair', 'stair', STAIR_KS, 1),
      ]))

    # ---------------------------------------------------------------- L1: Sunray Plaza, Podium & Ground Storey (y = +4.5..10.5 m)
    FL.append(dict(
      id='L1', tier=0, R=92, rect=(-128, 46, -58, 58),
      title='Sheet L1: Great Sunray Plaza, Forecourt & Ground Storey (podium deck y = +4.5 to +10.5 m)',
      sub=('Locked palace + plaza axial pair (JJ_PAL_PLAZA_OFFSET = 85 m): the 82 x 71 m Great Sunray Plaza with its 26 m '
           'sunray inlay and Sun Column meets the palace landing flush at y = +4.5 m. Taxpayers and factors stop in the two '
           'Forecourt Wings; litigants enter through the 5-bay recessed loggia into the Ground Petitions and Three-Wheels '
           'halls round twin Lotus Light-Courts; four kitchens at the rear vent up the clustered Tudor brick chimney stacks.'),
      axisnote='u = -z (NNW Harbour Avenue -> Sunray Plaza -> Ceremonial Gateway -> Main Block); v = +x up',
      outlines=[(-116, -45, -41, 41, 'jj_palace_plaza deck (y 4.5)'), (-38, 43, -56, 56, 'jj_palace podium (y 4.5)'),
                (-10, 40, -48, 48, 'main block (96 x 50 m)')],
      doors=[(-125, 0), (-80.5, 50), (-80.5, -50), (-35, 0), (40, 0)],
      dais=(-80.5, 0, 7.0),
      rooms=[
        R(1, 'Plaza Front Stair (Harbour Spine)', 'stair', -125, -116, -12, 12, 3, '30 marble steps up from the Companion/Harbour avenue to +4.5 m'),
        R(2, 'Plaza North Lateral Flight', 'stair', -90.5, -70.5, 41, 50, 2),
        R(3, 'Plaza South Lateral Flight', 'stair', -90.5, -70.5, -50, -41, 2),
        R(4, 'Great Sunray Plaza (16-Ray Deck & Sun Column)', 'sunray_plaza', -116, -45, -41, 41, 4, '26 m sunray disc, 32 red/yellow marble rays, central 12.5 m spiral-brick Sun Column, 16 banner columns, 4 corner chhatris'),
        R(5, 'Palace Bridge Landing & Flank Flights', 'court', -45, -37.5, -15, 15, 3, 'flush seam between plaza z = -40 and palace z = +45; lateral stairs descend to v = +-45'),
        R(6, 'Ceremonial Gateway (Sun-Disc Arch)', 'entrance', -37.5, -32.5, -10, 10, 4, '17 m gatehouse (z = +35) crowned by chhatri and gold sun-discs, flanked by twin staged gate spires at v = +-13 and 18 m portholed screen walls'),
        R(7, 'Palace Forecourt', 'court', -32.5, -14, -34, 34, 3, 'marble-flagged court between the two-storey wings; petitioners wait in arcade shade'),
        R(8, 'North Forecourt Wing: Handu Land-Tax & White-Pass/Serai Assay', 'ministry', -36, -14, 34, 48, 2, 'gnomon-surveyed land registry, caravan weight standards & Serai, Cut, and White-Pass (Whitelake Yeti / Yonni) customs tally'),
        box(9, 'Tax Wing Stair', 'stair', STAIR_TX, 2),
        R(10, 'South Forecourt Wing: Palace Guard & Concordance Chancery (Electric)', 'electric_chancery', -36, -14, -48, -34, 2, 'duty guardhouse + sealed Concordance writ & almanac-licensing desk (electric precision circuit)'),
        box(11, 'Chancery & Guard Stair', 'stair', STAIR_CH, 2),
        R(12, 'Front Side Projection (North): Ushers & Seal Clerks', 'office', -14, -10, 24, 48, 2),
        R(13, 'Front Side Projection (South): Captain of the Gate', 'guard', -14, -10, -48, -24, 2),
        R(14, 'Five-Bay Recessed Front Loggia', 'hall', -14, -10, -24, 24, 3, 'ground arcade on patterned brick columns (z = +10..+14); brass oil lamps flank the 4.9 m portal'),
        R(15, 'Great Vestibule', 'vestibule', -10, 2, -12, 12, 3, 'second threshold; framed between the two State Stairs and Inner Guard rooms'),
        R(16, 'Inner Guard (North)', 'guard', -10, -2, 12, 20, 1),
        R(17, 'Inner Guard (South)', 'guard', -10, -2, -20, -12, 1),
        box(18, 'North State Stair', 'stair', STAIR_N, 3, 'climbs to the Piano Nobile Darbar & Council'),
        box(19, 'South State Stair', 'stair', STAIR_S, 3, 'climbs to the Piano Nobile Darbar & Banquet'),
        R(20, 'Lower Hall of Concordance Pillars', 'hall', 2, 26, -16, 16, 3, 'hypostyle marble-and-brick pier hall supporting the Great Darbar floor above; public New-Fire and Count proclamations read here in monsoon rain'),
        R(21, 'Hall of Public Petitions', 'petition', -10, 4, 20, 48, 3, 'magistrates hear town and handu petitions before the North Light-Court'),
        R(22, 'Envoys\' & Pilgrims\' Waiting Hall', 'antechamber', -10, 4, -48, -20, 3, 'credentialed Serai, Hykkousoi, Eternian, Dilihan and Ardent delegations wait here'),
        box(23, 'North Lotus Light-Court', 'court', LCOURT_N, 3, 'open to the sky; stepped pool, bodhi-fig shade, ventilates the 50 m block in 1.51 atm heat'),
        box(24, 'South Lotus Light-Court', 'court', LCOURT_S, 3, 'open to the sky; marble fountain & citron planters'),
        R(25, 'Steward of the Household & Zenana Lock', 'keeper', 4, 26, 30, 48, 2, 'controls household stores and the sole guarded ground vestibule to the sealed Zenana Stair'),
        R(26, 'Chamberlain\'s Counting House', 'treasury', 4, 26, -48, -30, 2, 'tallies tribute before descent via the Privy Stair to the Bullion Vault'),
        box(27, 'Raja\'s Privy Stair', 'stair', STAIR_PV, 3),
        box(28, 'Ruby Zenana Stair (sealed)', 'stair', STAIR_ZN, 3, 'eunuch/matron-guarded; no male clerk crosses past Room 25'),
        R(29, 'Royal Spice Kitchen & Sweetmeat Hearth', 'kitchen', 26, 40, 22, 36, 1, 'vents up the 5-flue Tudor brick chimney stack at (z = -35, x = +20)'),
        R(30, 'Zenana & Household Kitchen', 'kitchen', 26, 40, 42, 48, 1, 'vents up the 6-flue side chimney stack at (z = -23, x = +41)'),
        R(31, 'State Banquet Kitchen & Roasting Hearths', 'kitchen', 26, 40, -36, -22, 1, 'vents up the 4-flue Tudor chimney stack at (z = -35, x = -20)'),
        R(32, 'Royal Bakehouse & Scullery', 'bakehouse', 26, 40, -48, -42, 1, 'vents up the 3-flue side chimney stack at (z = -23, x = -41)'),
        R(33, 'Central Servery & Rear Postern Passage', 'servery', 26, 40, -17, 17, 1, 'links kitchens to the service stairs; rear podium door at u = +40, v = 0'),
        box(34, 'North Kitchen Stair', 'stair', STAIR_KN, 1),
        box(35, 'South Kitchen Stair', 'stair', STAIR_KS, 1),
      ]))

    # ---------------------------------------------------------------- L2: Piano Nobile / State Floor (y = +10.5..16.5 m)
    FL.append(dict(
      id='L2', tier=1, R=56, rect=(-40, 44, -52, 52),
      title='Sheet L2: Piano Nobile — The Great Darbar, Council of Three Wheels & State Banquet (y = +10.5 to +16.5 m)',
      sub=('The state floor (storey 2 of 75-jj-palace.js, marked outside by the upper 5-bay loggia and all 8 projecting '
           'marble-jali jharokha balconies). Centre: the two-storey Great Darbar Hall under the r = 9.6 m Gold Onion Dome. '
           'North: Council of the Three Wheels under the north gold ribbed dome. South: State Banquet Hall under the south '
           'gold ribbed dome. Rear: the Raja\'s Privy Cabinet and Astrological Chart Room behind the throne dais.'),
      axisnote='u = -z (upper loggia & forecourt wings at left, rear jharokhas at right); v = +x up',
      outlines=[(-10, 40, -48, 48, 'main block'), (-36, -14, 34, 48, 'N wing upper'), (-36, -14, -48, -34, 'S wing upper')],
      dais=(23, 0, 2.8),
      rooms=[
        R(1, 'Upper Five-Bay Loggia (Darbar Appearance Balcony)', 'gallery', -14, -10, -24, 24, 4, 'balustraded upper arcade (z = +10..+14) from which the Raja salutes crowds in the Forecourt'),
        R(2, 'State Foyer & Banner Gallery', 'vestibule', -10, 2, -16, 16, 4, 'links the two State Stairs to the Darbar threshold and Upper Loggia'),
        box(3, 'North State Stair (landing)', 'stair', STAIR_N, 3),
        box(4, 'South State Stair (landing)', 'stair', STAIR_S, 3),
        R(5, 'Great Darbar Hall of the Concordance', 'throne', 2, 26, -16, 16, 4, '32 x 24 m double-height state hall open to the central pavilion and r = 9.6 m Gold Onion Dome; sunray marble floor, gaddi dais at u = +23, whorl-olive brass lamp trees'),
        R(6, 'Council of the Three Wheels (North Gold Dome)', 'council', 4, 24, 30, 48, 4, 'centred under the r = 5.2 m gold ribbed dome (u = +14, v = +32); Chief Kauntavan, High Judge & Ministers debate the Count'),
        R(7, 'North Flank Jharokha Oriels (x2)', 'jharokha_oriel', 1, 23, 48, 49.3, 4, 'projecting marble-jali balconies at z = -1, -23 on the +x facade'),
        R(8, 'State Banquet Hall (South Gold Dome)', 'banquet', 4, 24, -48, -30, 4, 'centred under the r = 5.2 m gold ribbed dome (u = +14, v = -32); low sunray tables, takht divans & musicians\' screen'),
        R(9, 'South Flank Jharokha Oriels (x2)', 'jharokha_oriel', 1, 23, -49.3, -48, 4, 'projecting marble-jali balconies on the -x facade'),
        box(10, 'North Lotus Light-Court (void)', 'void', LCOURT_N, 3),
        box(11, 'South Lotus Light-Court (void)', 'void', LCOURT_S, 3),
        R(12, 'North Forecourt Wing Upper: Cadastral Map & Almanac Rolls', 'library', -36, -14, 34, 48, 3, 'four jharokhas on courtyard/outer faces; master handu maps'),
        box(13, 'Tax Wing Stair (head)', 'stair', STAIR_TX, 2),
        R(14, 'South Forecourt Wing Upper: Diplomatic & Treaty Chancery', 'office', -36, -14, -48, -34, 3, 'four jharokhas; Eternal State barge quotas, Dilihan & Ardent compacts'),
        box(15, 'Chancery Stair (head)', 'stair', STAIR_CH, 2),
        R(16, 'North Front Salon & Jharokha (Envoys of Serai, Ardent, White-Pass Yeti & Yonni/Ria)', 'antechamber', -14, 4, 20, 48, 3, 'includes front jharokha at (z = +14, x = +35); receives Khaayken Whitelake toll-factors and Yonni/Rian savant envoys'),
        R(17, 'South Front Salon & Jharokha (Envoys of Hykkousoi, Dilihan & Eternal State)', 'antechamber', -14, 4, -48, -20, 3, 'includes front jharokha at (z = +14, x = -35)'),
        R(18, 'The Raja\'s Privy Cabinet', 'cabinet', 26, 40, -16, 0, 4, 'directly behind the Darbar dais; private audience, sealed dispatches to Skywatch'),
        R(19, 'Royal Astrological & Ephemeris Chart Room', 'astronomers', 26, 40, 0, 16, 4, 'armillary spheres, Veil +-50 deg tables, daily briefings with the four schools'),
        R(20, 'Rear North Minister\'s Reception & Jharokha', 'office', 24, 40, 22, 36, 3, 'rear jharokha at (z = -40, x = +20)'),
        R(21, 'Rear South Servery & Banquet Pantry (with Jharokha)', 'servery', 24, 40, -36, -22, 2, 'rear jharokha at (z = -40, x = -20); dishes arrive hot up South Kitchen Stair'),
        R(22, 'Zenana Guarded Antechamber', 'keeper', 24, 40, 36, 48, 2, 'matrons\' watch; bridges North Kitchen deliveries without breaking Zenana seclusion'),
        R(23, 'Plate & Golden Ewer Pantry', 'treasury', 24, 40, -48, -36, 2),
        box(24, 'Raja\'s Privy Stair', 'stair', STAIR_PV, 4),
        box(25, 'Ruby Zenana Stair', 'stair', STAIR_ZN, 3),
        box(26, 'North Kitchen Stair', 'stair', STAIR_KN, 1),
        box(27, 'South Kitchen Stair', 'stair', STAIR_KS, 1),
      ]))

    # ---------------------------------------------------------------- L3: Upper Royal & Ruby Zenana Storey (y = +16.5..22.5 m)
    FL.append(dict(
      id='L3', tier=2, R=54, rect=(-18, 44, -52, 52),
      title='Sheet L3: Upper Royal Apartments & The Ruby Zenana (y = +16.5 to +22.5 m)',
      sub=('Storey 3 of the main block (the forecourt wings have ended below at +16.8 m, becoming parapeted roof walks). '
           'North-rear under the r = 4.6 m Slate Lantern Dome: the secluded Ruby Zenana & Grand Dream-Sibyl\'s Inner '
           'Sanctuary behind Vellai-kal alabaster jalis. South-rear under the matching Slate Lantern Dome: the Raja\'s '
           'Private Apartments & Hammam. Between them at u = +28..+40, v = -4..+4 sits the split Dream-Oracle Screen: '
           'the Raja enters from the south, the Sibyls from the north, speaking only through pierced alabaster.'),
      axisnote='u = -z (front porthole range at left, rear slate-lantern suites at right); v = +x up (Ruby Zenana)',
      outlines=[(-14, 40, -48, 48, 'main block storey 3'), (-36, -14, 34, 48, 'N wing roof terrace'),
                (-36, -14, -48, -34, 'S wing roof terrace')],
      rooms=[
        R(1, 'Great Darbar Upper Void', 'void', 2, 26, -16, 16, 4, 'open to the Darbar floor below and the Central Roof Pavilion above'),
        R(2, 'Screened Darbar Gallery (North — Zenana Viewing Jali)', 'dome_gallery', 2, 26, 16, 20, 4, 'royal women and Sibyls watch Darbar ceremonies unseen behind marble jalis'),
        R(3, 'Darbar Musicians\' & Banner Gallery (South)', 'dome_gallery', 2, 26, -20, -16, 3),
        R(4, 'Royal Library of the Counts (7 Front Portholes)', 'library', -14, 2, -24, 24, 4, 'lit by the 7 gold-rimmed portholes on z = +14; illuminated Kauntu codices & Skywatch glass plates'),
        box(5, 'North State Stair (head)', 'stair', STAIR_N, 3),
        box(6, 'South State Stair (head)', 'stair', STAIR_S, 3),
        R(7, 'North Front Regalia & Saffron Robing Rooms', 'wardrobe', -14, 4, 24, 48, 3),
        R(8, 'South Front Honours & Guest Suite', 'kin_chamber', -14, 4, -48, -24, 3),
        box(9, 'North Lotus Light-Court (void)', 'void', LCOURT_N, 3),
        box(10, 'South Lotus Light-Court (void)', 'void', LCOURT_S, 3),
        C(11, 'North Gold Dome Drum Void (over Council)', 'void', 14, 32, 5.0, 3),
        C(12, 'South Gold Dome Drum Void (over Banquet)', 'void', 14, -32, 5.0, 3),
        R(13, 'Ruby Zenana: Salon of the Coin-Veiled Sibyls (Slate Lantern Dome)', 'zenana_hall', 24, 40, 22, 42, 4, 'crowned by the r = 4.6 m slate ribbed dome & glowing lantern at (u = +32, v = +32); jhula swings, alabaster breeze screens'),
        R(14, 'Zenana Kin & Consorts\' Chambers', 'kin_chamber', 4, 24, 38, 48, 3, 'overlooking the NE Giant vista'),
        R(15, 'Sibyls\' Dream-Scroll Scriptorium & Wardrobes', 'scriptorium', 24, 40, 42, 48, 3, 'records royal and Two-Day occultation dreams in crimson ink'),
        R(16, 'Sibyl\'s Side of the Alabaster Dream-Screen', 'dream_oracle', 28, 40, 0, 17, 4, 'entered ONLY from the Ruby Zenana (v > 0); pierced Vellai-kal alabaster wall along v = 0'),
        R(17, 'Raja\'s Side of the Alabaster Dream-Screen', 'dream_oracle', 28, 40, -17, 0, 4, 'entered ONLY from the Raja\'s Privy Stair (v < 0); on Double Dark & Two-Day occultations the Raja recounts his dreams through the v = 0 jali'),
        R(18, 'The Raja\'s Bedchamber (South Slate Lantern Dome)', 'bedchamber', 24, 40, -38, -22, 4, 'crowned by the r = 4.6 m slate ribbed dome & glowing lantern at (u = +32, v = -32)'),
        R(19, 'Royal Lotus Hammam & Cool Divan', 'hammam', 24, 40, -48, -38, 4, 'heated by the south-flank chimney hypocaust; scented citron steam'),
        R(20, 'Heirs\' & Royal Kin Chambers', 'kin_chamber', 4, 24, -48, -38, 3),
        box(21, 'Raja\'s Privy Stair (head)', 'stair', STAIR_PV, 4, 'continues by turret stair to the Roof Pavilion'),
        box(22, 'Ruby Zenana Stair (head)', 'stair', STAIR_ZN, 3),
        box(23, 'North Service Stair (head)', 'stair', STAIR_KN, 1),
        box(24, 'South Service Stair (head)', 'stair', STAIR_KS, 1),
      ]))

    # ---------------------------------------------------------------- LR: Roof, Central Pavilion & Domes (y = +22.8..52.0 m)
    FL.append(dict(
      id='LR', tier=3, R=56, rect=(-40, 44, -52, 52),
      title='Sheet LR: Roof Walk, Central Drum Pavilion, Domes, Chhatris & Spires (y = +22.8 to +52.0 m)',
      sub=('Exact roofline of 75-jj-palace.js: terracotta-paved roof inside marble-coped crenellated parapets; the 32 x 24 m '
           'Central Pavilion (y = +22.8..29.1 m) carrying 4 corner chhatris and the r = 9.6 m Gold Onion Dome (summit +52 m); '
           'two r = 5.2 m gold ribbed domes; two r = 4.6 m slate lantern domes; 4 front breeze chhatris; 4 clustered Tudor '
           'chimney stacks; and the 6 staged gold-capped corner and gateway spires.'),
      axisnote='u = -z (front chhatris & gateway spire crown at left, rear lantern domes & corner spires at right); v = +x up',
      outlines=[(-14, 40, -48, 48, 'main roof parapet (y 22.8)'), (-37.5, -32.5, -10, 10, 'ceremonial gateway chhatri (+22.7 m)')],
      rooms=[
        R(1, 'Terracotta Roof Walk & Evening Giant-Gaze Parapet', 'garden', -14, 40, -48, 48, 3, 'crenellated parapet; faces ENE Giant (Az 70.5 deg) and NNW Great Trough Lake'),
        R(2, 'Central Roof Pavilion & Upper Clerestory Gallery', 'dome_gallery', 2, 26, -16, 16, 4, '32 x 24 x 6 m drum base (y = +22.8..29.1 m) with 4 corner chhatris; looks down into Darbar'),
        C(3, 'Great Gold Onion Dome & 10-Porthole Drum', 'lantern', 14, 0, 9.6, 4, 'r = 9 m patterned-shaft drum + r = 9.6 m gold onion dome & 3.2 m finial spike to y = +52 m'),
        C(4, 'North Gold Ribbed Dome (over Council)', 'lantern', 14, 32, 5.2, 3),
        C(5, 'South Gold Ribbed Dome (over Banquet)', 'lantern', 14, -32, 5.2, 3),
        C(6, 'North-Rear Slate Ribbed Dome & Lantern (over Ruby Zenana)', 'lantern', 32, 32, 4.6, 4),
        C(7, 'South-Rear Slate Ribbed Dome & Lantern (over Raja\'s Suite)', 'lantern', 32, -32, 4.6, 4),
        R(8, 'Front Breeze Chhatri (Outer North)', 'pavilion', -10.4, -6.8, 40.2, 43.8, 3, 'open 4-column marble-and-gold dome kiosk at z = +8.6, x = +42'),
        R(9, 'Front Breeze Chhatri (Inner North)', 'pavilion', -10.2, -7.0, 19.4, 22.6, 3, 'at z = +8.6, x = +21'),
        R(10, 'Front Breeze Chhatri (Inner South)', 'pavilion', -10.2, -7.0, -22.6, -19.4, 3, 'at z = +8.6, x = -21'),
        R(11, 'Front Breeze Chhatri (Outer South)', 'pavilion', -10.4, -6.8, -43.8, -40.2, 3, 'at z = +8.6, x = -42'),
        R(12, 'Clustered Tudor Chimney Stack (5 flues, Spice Kitchen)', 'beacon', 33.5, 36.5, 18.0, 22.0, 1, 'doused strictly to zero smoke on every Double Dark'),
        R(13, 'Clustered Tudor Chimney Stack (4 flues, Banquet Kitchen)', 'beacon', 33.5, 36.5, -22.0, -18.0, 1),
        R(14, 'Clustered Tudor Chimney Stack (6 flues, Zenana Kitchen)', 'beacon', 21.0, 25.0, 39.5, 42.5, 1),
        R(15, 'Clustered Tudor Chimney Stack (3 flues, Bakehouse & Hammam)', 'beacon', 21.0, 25.0, -42.5, -39.5, 1),
        C(16, 'Rear Staged Gold Spire (NE, 4 stages)', 'beacon', 37.8, 47.0, 4.2, 3),
        C(17, 'Rear Staged Gold Spire (SE, 4 stages)', 'beacon', 37.8, -47.0, 4.2, 3),
        C(18, 'Front Staged Gold Spire (NW, 3 stages)', 'beacon', -14.0, 48.0, 4.0, 3),
        C(19, 'Front Staged Gold Spire (SW, 3 stages)', 'beacon', -14.0, -48.0, 4.0, 3),
        C(20, 'Gateway Staged Gold Spire (N)', 'beacon', -35.0, 13.0, 3.0, 3),
        C(21, 'Gateway Staged Gold Spire (S)', 'beacon', -35.0, -13.0, 3.0, 3),
        box(22, 'Roof Turret Stair (from Privy Stair)', 'stair', STAIR_PV, 2),
      ]))

    return FL


def draw_palace_section():
    f_t = B.font(38, True); f = B.font(20); fs = B.font(16); fb = B.font(18, True)
    W, H = 2500, 1320
    img = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(img)
    dr.text((30, 18), "Longitudinal Section along Processional Axis u = -z: Great Sunray Plaza & Raja's Palace (heights x1.8)", font=f_t, fill=(20, 20, 20))
    dr.text((30, 68), "Exact geometry of src/75-jj-palace.js: PL = 4.5 m podium (Undercroft inside), 3 x 6.0 m storeys (RY = 22.8 m), 6 m roof pavilion, 7 m drum & r = 9.6 m gold onion dome (+52 m).", font=f, fill=(70, 70, 70))
    sx = 12.8; sy = 17.5; ox = 132 * sx + 60; base = H - 170
    def X(u): return ox + u * sx
    def Y(h): return base - h * sy

    # Ground datum (+496.0 m ASL)
    dr.rectangle([0, Y(0), W, H], fill=(238, 232, 220))
    dr.line([(0, Y(0)), (W, Y(0))], fill=(110, 90, 70), width=3)
    dr.text((24, Y(0) + 8), 'Levelled axial pad (+496.0 m ASL, y = 0)', font=fs, fill=(80, 65, 50))

    # Sunray Plaza podium (u = -116..-45, y = 0..4.5) & front stair
    dr.polygon([(X(-125), Y(0)), (X(-116), Y(4.5)), (X(-116), Y(0))], fill=(180, 180, 180), outline=(40, 40, 40))
    dr.rectangle([X(-116), Y(4.5), X(-45), Y(0)], fill=(238, 220, 150), outline=(30, 30, 30), width=2)
    dr.text((X(-113), Y(3.2)), 'Great Sunray Plaza (16-ray deck, y = +4.5 m)', font=fb, fill=(90, 50, 10))
    # Sun Column at u = -80.5
    dr.rectangle([X(-87.5), Y(6.0), X(-73.5), Y(4.5)], fill=(245, 245, 240), outline=(40, 40, 40))
    dr.rectangle([X(-81.7), Y(18.5), X(-79.3), Y(6.0)], fill=(196, 92, 64), outline=(40, 40, 40))
    dr.ellipse([X(-82.5), Y(22.2), X(-78.5), Y(18.5)], fill=(235, 190, 50), outline=(40, 40, 40))
    dr.text((X(-77), Y(15)), 'Sun Column (+21.3 m)', font=fs, fill=(120, 60, 10))

    # Bridge landing (u = -45..-38) & Undercroft podium (u = -38..+43, y = 0..4.5)
    dr.rectangle([X(-45), Y(4.5), X(-38), Y(0)], fill=(216, 206, 194), outline=(30, 30, 30), width=2)
    dr.rectangle([X(-38), Y(4.5), X(43), Y(0)], fill=(222, 222, 216), outline=(30, 30, 30), width=2)
    dr.text((X(-35), Y(3.1)), 'B Undercroft (y 0..4.5 m):Lamp-oil & grain cellars | Electric Bullion & Emerald Vault | Cisterns | Rear Postern', font=fs, fill=(30, 30, 30))

    # Ceremonial Gateway at u = -37.5..-32.5 (y = 4.5..21.5 + chhatri to 26.5)
    dr.rectangle([X(-37.5), Y(21.5), X(-32.5), Y(4.5)], fill=(208, 112, 82), outline=(30, 30, 30), width=2)
    dr.rectangle([X(-36.5), Y(26.0), X(-33.5), Y(21.5)], fill=(238, 220, 150), outline=(30, 30, 30), width=2)
    dr.text((X(-42), Y(27.6)), 'Ceremonial Gateway (+26 m)', font=fs, fill=(0, 0, 0))

    # Forecourt & background 2-storey Wing outline (u = -36..-14, y = 4.5..16.5)
    dr.rectangle([X(-36), Y(16.5), X(-14), Y(4.5)], fill=(244, 240, 228), outline=(130, 130, 130), width=2)
    dr.text((X(-34.5), Y(15.2)), 'Forecourt (open) & 2-storey Tax/Chancery Wings behind (v +-34..48)', font=fs, fill=(90, 90, 90))

    # Main Block storeys L1, L2, L3 (u = -14..+40, y = 4.5..22.8)
    storeys = [
      (-14, 40, 4.5, 10.5, 'L1 Ground: 5-bay Loggia | Vestibule | Hypostyle Hall | Kitchens & Servery', (236, 232, 218)),
      (-14, 40, 10.5, 16.5, 'L2 Piano Nobile: Upper Loggia | Foyer | Great Darbar | Privy Cabinet & Chart Room', (238, 220, 150)),
      (-14, 40, 16.5, 22.8, 'L3 Upper: Count Library | Darbar Galleries | Dream-Oracle Jali | Raja Suite & Ruby Zenana', (212, 226, 176)),
    ]
    for u0, u1, h0, h1, label, col in storeys:
        dr.rectangle([X(u0), Y(h1), X(u1), Y(h0)], fill=col, outline=(30, 30, 30), width=2)
        dr.text((X(u0) + 8, Y(h1) + 5), label, font=fs, fill=(20, 20, 20))

    # Central Roof Pavilion (u = 2..26, y = 22.8..29.1), Drum (u = 5..23, y = 29.1..36.7), Gold Onion Dome (r = 9.6 -> y = 48.8 + 3.2 spike = 52.0)
    dr.rectangle([X(2), Y(29.1), X(26), Y(22.8)], fill=(238, 220, 150), outline=(30, 30, 30), width=2)
    dr.text((X(3), Y(27.8)), 'Central Roof Pavilion (32x24m)', font=fs, fill=(0, 0, 0))
    dr.rectangle([X(5), Y(36.7), X(23), Y(29.1)], fill=(214, 132, 96), outline=(30, 30, 30), width=2)
    dr.text((X(6.2), Y(34.2)), '10-porthole drum', font=fs, fill=(255, 255, 255))
    dr.pieslice([X(4.4), Y(36.7 + 12.0), X(23.6), Y(36.7 - 12.0)], 180, 360, fill=(238, 192, 58), outline=(30, 30, 30), width=3)
    dr.line([(X(14), Y(48.7)), (X(14), Y(52.0))], fill=(210, 160, 20), width=4)
    dr.text((X(15.5), Y(51.5)), 'Gold Onion Dome Finial (+52.0 m)', font=fb, fill=(130, 85, 0))

    # Rear Slate Lantern Dome projection (u = 27.4..36.6, y = 22.8..34.5)
    dr.rectangle([X(27.6), Y(26.4), X(36.4), Y(22.8)], fill=(225, 205, 140), outline=(80, 80, 80), width=2)
    dr.pieslice([X(27.4), Y(26.4 + 4.6), X(36.6), Y(26.4 - 4.6)], 180, 360, fill=(130, 142, 156), outline=(50, 50, 50), width=2)
    dr.text((X(27.2), Y(33.2)), 'Rear Slate Lantern Domes (v +-32)', font=fs, fill=(70, 80, 95))

    # Highlight two-storey + dome Great Darbar void (u = 2..26, y = 10.5..36.7)
    dr.rectangle([X(2), Y(36.7), X(26), Y(10.5)], outline=(150, 85, 0), width=4)
    dr.text((X(4), Y(13.8)), 'GREAT DARBAR HALL (open to onion dome)', font=fb, fill=(140, 70, 0))

    # Vertical stairs
    stairs = [
      (1.0, 4.5, 22.8, 'State Stairs (v +-18)', (0, 80, 160)),
      (28.5, 0.0, 29.1, "Raja's Privy Stair (Vault -> Cabinet -> Suite -> Roof)", (160, 0, 110)),
      (33.5, 0.0, 22.8, 'Kitchen & Zenana Service Stairs', (0, 125, 60)),
    ]
    for idx, (u, h0, h1, name, col) in enumerate(stairs):
        dr.line([(X(u), Y(h0)), (X(u), Y(h1))], fill=col, width=5)
        dr.text((X(u) + 6, Y(h1) - 22 - 20 * idx), name, font=fs, fill=col)

    return img


def draw_city_site_sheet():
    """Render Sheet S0_site.png directly from settlements/jimjam/site/jimjam-site.json."""
    site_path = os.path.join(HERE, '..', 'site', 'jimjam-site.json')
    with open(site_path, encoding='utf-8') as fh:
        S = json.load(fh)

    W, H = 2800, 2200
    img = Image.new('RGB', (W, H), (248, 245, 238))
    dr = ImageDraw.Draw(img)
    f_t = B.font(38, True); f_s = B.font(21); f_b = B.font(19, True); f_n = B.font(16); f_l = B.font(18)

    dr.text((34, 20), "Sheet S0: Jimjam (st5e01l76v) — Voth-Sized 50,000-Resident City & Celestial District Blueprint", font=f_t, fill=(20, 20, 20))
    dr.text((34, 68), "Scale Model 5.1 px (745, 546) | Lat -34.34 deg S | Pin +486.2 m above Great Trough Lake (+429.78 m) | 50,000 urban + 8,500 slice hinterland (12.82 km2 urban envelope)", font=f_s, fill=(65, 65, 65))

    # Map viewport: x in [-2350, +2650] (5000 m), z in [-2250, +2050] (4300 m); North (-z) UP!
    x0, x1, z0, z1 = -2350.0, 2650.0, -2250.0, 2050.0
    map_w = 1820.0
    sc = map_w / (x1 - x0)
    map_h = (z1 - z0) * sc
    ox, oy = 36.0, 120.0
    def PX(x): return ox + (x - x0) * sc
    def PZ(z): return oy + (z - z0) * sc

    dr.rectangle([ox, oy, ox + map_w, oy + map_h], fill=(236, 230, 214), outline=(40, 40, 40), width=3)

    # Great Trough Lake (+429.78 m) NNW pocket cove & open NW lake water
    lake_poly = [(-2350, -2250), (2650, -2250), (2650, -1920), (1350, -1680), (1150, -1580),
                 (-350, -1620), (-520, -1860), (-840, -1860), (-1020, -1580), (-1950, -1350), (-2350, -1100)]
    dr.polygon([(PX(x), PZ(z)) for x, z in lake_poly], fill=(178, 214, 238), outline=(90, 140, 175))
    dr.text((PX(-2150), PZ(-2080)), "GREAT TROUGH LAKE (lbl=77, +429.78 m, 28,704 km2)", font=f_b, fill=(35, 80, 120))
    dr.text((PX(-960), PZ(-1960)), "NNW Sheltered Barge Cove (dredged 3.5 m)", font=f_n, fill=(35, 80, 120))

    # Handu hinterland grid hint
    dr.text((PX(-2310), PZ(-320)), "WSW Headland\nWindmills &\nHandu Fields\n(No sails in\nAz 239-249 deg!)", font=f_n, fill=(95, 110, 75))
    dr.text((PX(1820), PZ(1420)), "ESE Rhythmite\nBrick-Clay &\nGypsum Pits\n(KHAMLET)", font=f_n, fill=(110, 85, 65))

    zone_palette = {
      'zone1.sun': (248, 224, 152),
      'zone2.companion': (236, 232, 184),
      'zone3.giant': (196, 226, 224),
      'zone4.twoday': (222, 218, 234),
      'zone5.week': (224, 236, 206),
      'zone6.thirteen': (238, 214, 188),
      'zone7.fourday': (204, 234, 212),
      'zone8.day': (234, 196, 182),
      'zone9.izani': (238, 186, 142),
      'zone10.pilgrim_gates': (242, 226, 198),
    }

    for z in S['zones']:
        if 'poly' not in z:
            continue
        pts = [(PX(p[0]), PZ(p[1])) for p in z['poly']]
        col = zone_palette.get(z['id'], (230, 230, 230))
        dr.polygon(pts, fill=col, outline=(70, 70, 70), width=2)
        if z.get('sightlineCorridor'):
            sc_pts = [(PX(p[0]), PZ(p[1])) for p in z['sightlineCorridor']['poly']]
            dr.polygon(sc_pts, fill=(246, 242, 190), outline=(180, 130, 20), width=2)
        cx = sum(p[0] for p in z['poly']) / len(z['poly'])
        cz = sum(p[1] for p in z['poly']) / len(z['poly'])
        short = z['name'].split('(')[0].strip()
        dr.text((PX(cx) - 70, PZ(cz) - 10), '%s\n(%s pop)' % (short, format(z['population'], ',')), font=f_n, fill=(45, 45, 45))

    # Extramural Pilgrim Tent Maidans (core/camp)
    for mp, lbl in [([(-580, 1320), (-220, 1320), (-220, 1760), (-580, 1760)], 'Cut-Gate Tent Maidan'),
                    ([(2280, -60), (2600, -60), (2600, 320), (2280, 320)], 'Serai-Gate Maidan')]:
        dr.polygon([(PX(x), PZ(z)) for x, z in mp], fill=(245, 208, 176), outline=(160, 80, 40), width=2)
        dr.text((PX(mp[0][0]) + 4, PZ(mp[0][1]) + 6), lbl, font=f_n, fill=(130, 50, 20))

    # Walled circuit outline (including White-Pass North Gate at 380, -1480)
    wall_ring = [(-1150, -1580), (-680, -1580), (380, -1480), (1150, -1250), (1450, -1050), (2250, -1050),
                 (2250, 850), (1750, 850), (1750, 1350), (60, 1250), (-1850, 1250), (-1850, -450), (-1750, -1250)]
    dr.line([(PX(x), PZ(z)) for x, z in wall_ring + [wall_ring[0]]], fill=(120, 42, 32), width=5)

    # Processional avenues (including White-Pass / Skywatch northern road)
    aves = [
      [(-680, -1580), (-80, -860), (-35, -38), (0, 40), (60, 1250), (60, 1850)],
      [(380, -2150), (380, -1480), (-80, -860)],
      [(-1850, 640), (-920, 740), (180, 720), (460, 640), (1680, 220), (2250, 120), (2620, 120)],
      [(-820, -80), (-35, -38), (860, -560), (1150, -1250)],
    ]
    for av in aves:
        dr.line([(PX(x), PZ(z)) for x, z in av], fill=(130, 95, 55), width=3)

    # Astronomical Sightline Rays!
    rays = [
      ((-820, -80), 244.04, 1650, (210, 95, 0), 'Solstice Sunset Az 244.04 deg WSW'),
      ((-820, -80), 294.04, 1550, (140, 80, 170), 'Veil +50 deg Az 294.0 deg WNW'),
      ((-820, -80), 194.04, 1550, (140, 80, 170), 'Veil -50 deg Az 194.0 deg SSW'),
      ((-860, -340), 70.50, 2200, (0, 120, 150), 'Fixed Ringed Giant Az 70.5 deg ENE (Alt +28.1 deg)'),
      ((-80, -860), 353.30, 1100, (40, 110, 60), 'Fixed Companion Az 353.3 deg N (Alt +56.1 deg)'),
    ]
    for (rx, rz), az, length, col, lbl in rays:
        ar = math.radians(az)
        ex, ez = rx + math.sin(ar) * length, rz - math.cos(ar) * length
        dr.line([(PX(rx), PZ(rz)), (PX(ex), PZ(ez))], fill=col, width=3)
        tx = max(ox + 10, min(ox + map_w - 260, PX(ex) - 80))
        tz = max(oy + 8, min(oy + map_h - 28, PZ(ez) - 20))
        dr.text((tx, tz), lbl, font=f_n, fill=col)

    # Gates
    for g in S['gates']:
        gx, gz = g['pos']
        dr.rectangle([PX(gx) - 7, PZ(gz) - 7, PX(gx) + 7, PZ(gz) + 7], fill=(255, 255, 255), outline=(120, 30, 20), width=3)

    # Numbered Landmarks + right-hand Legend
    lx, ly = ox + map_w + 34, oy
    dr.text((lx, ly), "Landmarks & Major Structures (22)", font=f_b, fill=(20, 20, 20))
    ly += 32
    for idx, lm in enumerate(S['landmarks'], 1):
        px, pz = lm['pos']
        w, d = max(28.0, lm['sizeM'][0]), max(28.0, lm['sizeM'][1])
        dr.rectangle([PX(px - w / 2), PZ(pz - d / 2), PX(px + w / 2), PZ(pz + d / 2)],
                     fill=(210, 65, 45) if 'temple' in lm['id'] or 'palace' in lm['id'] else (80, 95, 140),
                     outline=(20, 20, 20), width=2)
        dr.ellipse([PX(px) - 12, PZ(pz) - 12, PX(px) + 12, PZ(pz) + 12], fill=(255, 248, 210), outline=(20, 20, 20), width=2)
        s_i = str(idx)
        dr.text((PX(px) - dr.textlength(s_i, font=f_n) / 2, PZ(pz) - 9), s_i, font=f_n, fill=(0, 0, 0))
        line = "%2d. %s (Az %.1f deg)" % (idx, lm['name'], lm['azDeg'])
        for wrapped in B.wrap(dr, line, f_l, W - lx - 28):
            dr.text((lx, ly), wrapped, font=f_l, fill=(35, 35, 35))
            ly += 23
        ly += 5

    ly += 16
    dr.text((lx, ly), "City Gates (White Squares)", font=f_b, fill=(120, 30, 20)); ly += 28
    for g in S['gates']:
        dr.text((lx, ly), "- %s (%d, %d)" % (g['name'], g['pos'][0], g['pos'][1]), font=f_l, fill=(50, 50, 50))
        ly += 24

    # Scale bar (1,000 m) & North arrow
    bx, by = ox + 24, oy + map_h + 26
    dr.line([(bx, by), (bx + 1000 * sc, by)], fill=(0, 0, 0), width=4)
    dr.text((bx, by + 8), "1,000 m (1 km)   |   North (-z) is UP, East (+x) is RIGHT   |   Red line = Modular jj_wall_* circuit", font=f_s, fill=(30, 30, 30))
    return img


def main():
    apply_jj_catalog()
    FL = palace_floors()
    intro = (
      'Generated by `settlements/jimjam/palace/palace_blueprint.py` (on `settlements/voth/palace/blueprint.py`) '
      'from the exact geometry of `src/75-jj-palace.js` (`jj_palace` + `jj_palace_plaza`). Keys map onto '
      '`kits/catalog/krator-master-furniture-jimjam.js` (`jimjam_court_*`, `jimjam_common_*`, `jimjam_poor_*`), '
      'outdoor `JJFURN` pieces (`src/84-jj-furniture.js`), and shared `generic_trade_*` items. Lighting follows '
      'Jimjam\'s liturgical ethos: warm `whorl-olive` oil lamps and braziers throughout, with clean electric '
      'circuits restricted strictly to the Undercroft Bullion/Alabaster Vaults and Concordance Chancery.\n'
    )
    fm = os.path.join(HERE, 'FURNITURE.md')
    B.main(floors=FL, out=OUT, here=HERE,
           title="# The Raja's Palace & Great Sunray Plaza: Furniture Manifest\n",
           intro=intro, section=draw_palace_section, zone_R=-1)
    # Trim unused NEW entries (x0) and ensure LF endings
    with open(fm, encoding='utf-8') as fh:
        lines = fh.read().split('\n')
    with open(fm, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(l for l in lines if not (l.startswith('- `') and l.endswith('(x0)'))) + '\n')

    site_img = draw_city_site_sheet()
    site_img.save(os.path.join(OUT, 'S0_site.png'))
    print('wrote S0_site.png')


if __name__ == '__main__':
    main()
