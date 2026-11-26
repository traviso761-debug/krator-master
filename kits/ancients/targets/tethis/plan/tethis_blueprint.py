#!/usr/bin/env python3
"""Tethis, the pelagic saucer arcology: architectural master sheets, numbered interior floorplans, axial section,
AREAS.md, and FURNITURE.md.

Driven directly by the [G data] layout `kits/ancients/targets/tethis/8az0-tethis-plan.js` evaluated in node (and
checked against `TETHIS.RULES` before drawing), plus the shared floorplan generator `settlements/voth/palace/blueprint.py`.

    python3 kits/ancients/targets/tethis/plan/tethis_blueprint.py
"""
import json
import math
import os
import subprocess
import sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
TARGET_DIR = os.path.dirname(HERE)
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
OUT = os.path.join(HERE, 'sheets')

sys.path.insert(0, os.path.join(ROOT, 'settlements', 'voth', 'palace'))
import blueprint as B  # noqa: E402
from blueprint import R, C, font  # noqa: E402

JS_DUMP = r"""
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.argv[1];
const ctx = { Math, Set, Object, Array, JSON, console };
vm.createContext(ctx);
for (const f of ['core/rand/08-core-rand.js', 'kits/ancients/targets/tethis/8az0-tethis-plan.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8') + '\n;this.TETHIS=typeof TETHIS!=="undefined"?TETHIS:this.TETHIS;', ctx, { filename: f });
}
const N = ctx.TETHIS, P = N.plan();
const checks = Object.keys(N.RULES).map(k => ({ name: k, pass: !!N.RULES[k](P) }));
const bathy = [];
for (let x = -800; x <= 800; x += 20) bathy.push([x, N.seabedAt(x, 0)]);
process.stdout.write(JSON.stringify({ plan: P, checks, bathy }));
"""


def load_layout():
    res = subprocess.run(['node', '-e', JS_DUMP, ROOT], capture_output=True, text=True, encoding='utf-8', check=True)
    data = json.loads(res.stdout)
    bad = [c['name'] for c in data['checks'] if not c['pass']]
    if bad:
        sys.exit('Tethis layout failed rules: ' + ', '.join(bad))
    return data['plan'], data['bathy']


def circle_pts(cu, cv, rad, a0=0.0, a1=360.0, n=64):
    return [
        (
            cu + rad * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
            cv + rad * math.sin(math.radians(a0 + (a1 - a0) * i / n))
        )
        for i in range(n + 1)
    ]


def sector_box(n, name, kind, r0, r1, deg_center, half_deg, decor, note='', cu=0.0, cv=0.0, r_max=None, r_min=None):
    """Place an axis-aligned room box at polar (r_mid, deg_center), automatically fitted so all 4 corners stay inside
    the saucer's outer rim `r_max` and outside its inner well `r_min`."""
    rm = 0.5 * (r0 + r1)
    dr_len = (r1 - r0) * 0.78
    arc = 2.0 * rm * math.sin(math.radians(half_deg)) * 0.74
    ang = math.radians(deg_center)
    ca, sa = abs(math.cos(ang)), abs(math.sin(ang))
    hw = 0.5 * (dr_len * ca + arc * sa)
    hh = 0.5 * (dr_len * sa + arc * ca)
    lim_out = (r1 if r_max is None else r_max) - 2.5
    lim_in = (r0 if r_min is None else r_min) + 1.5
    for _ in range(32):
        uc = rm * math.cos(ang)
        vc = rm * math.sin(ang)
        corners = [math.hypot(uc + sx * hw, vc + sy * hh) for sx in (-1, 1) for sy in (-1, 1)]
        if max(corners) <= lim_out and min(corners) >= lim_in:
            break
        if max(corners) > lim_out:
            rm -= 0.8
            hw *= 0.96
            hh *= 0.96
        if min(corners) < lim_in:
            rm += 0.6
            hw *= 0.96
            hh *= 0.96
    uc = cu + rm * math.cos(ang)
    vc = cv + rm * math.sin(ang)
    return R(n, name, kind, round(uc - hw, 1), round(uc + hw, 1), round(vc - hh, 1), round(vc + hh, 1), decor, note)


def pill_label(dr, cx, cy, text, f, fg=(20, 24, 30), bg=(255, 255, 255), border=None, pad_x=6, pad_y=3):
    tw = dr.textlength(text, font=f)
    bbox = dr.textbbox((0, 0), text, font=f)
    th = bbox[3] - bbox[1]
    x0, y0 = cx - tw / 2 - pad_x, cy - pad_y
    x1, y1 = cx + tw / 2 + pad_x, cy + th + pad_y + 2
    dr.rectangle([x0, y0, x1, y1], fill=bg, outline=border, width=1 if border else 0)
    dr.text((cx - tw / 2, cy), text, font=f, fill=fg)


# ------------------------------------------------------------------------- Furniture key mapping (Ancient + Hykkousoi)
B.KEYMAP.update({
    'voth_court_bed': 'hykkousoi_shell_cradle_bed',
    'voth_common_bed': 'ancients_bed',
    'generic_bed': 'ancients_bunk',
    'generic_trade_bunk': 'ancients_bunk',
    'generic_trade_locker': 'ancients_locker',
    'voth_court_divan': 'hykkousoi_cushion_ring',
    'voth_court_table': 'hykkousoi_pearl_table',
    'voth_common_table': 'ancients_desk',
    'voth_court_low_table': 'ancients_low_table',
    'voth_common_chair': 'ancients_chair',
    'voth_common_stool': 'hykkousoi_shell_stool',
    'voth_common_bench': 'ancients_bath_bench',
    'voth_bench': 'ancients_bath_bench',
    'voth_court_desk': 'hykkousoi_chart_table',
    'voth_common_desk': 'ancients_workstation',
    'voth_common_bookcase': 'hykkousoi_scroll_rack',
    'voth_court_cabinet': 'hykkousoi_nacre_chest',
    'voth_common_chest': 'hykkousoi_sea_chest',
    'voth_common_store': 'ancients_cargo_pods',
    'voth_common_wall_shelves': 'ancients_shelf',
    'voth_common_rack': 'hykkousoi_net_rack',
    'voth_common_hearth': 'hykkousoi_hearth_basin',
    'voth_court_hearth': 'hykkousoi_hearth_basin',
    'voth_court_fire': 'hykkousoi_jar_lamp',
    'voth_common_fire': 'hykkousoi_jar_lamp',
    'voth_street_brazier': 'ancients_lamp_standard',
    'voth_court_candelabra': 'ancients_light_strip_ring',
    'voth_planter': 'ancients_planting_bed',
    'voth_court_wall_fountain': 'ancients_plaza_fountain',
    'hl_rep_roofed_well': 'ancients_plaza_fountain',
    'voth_common_counter': 'ancients_counter',
    'voth_common_workbench': 'ancients_lab_bench',
    'generic_trade_larder': 'hykkousoi_oyster_larder',
    'voth_court_throne': 'hykkousoi_tide_niche',
    'voth_court_sun_altar': 'hykkousoi_pearl_altar',
    'voth_court_map_table': 'hykkousoi_chart_table',
    'voth_court_armillary': 'tethis_tide_harmonic_dial',
    'voth_common_board': 'ancients_board',
    'voth_canoe': 'ancients_bollard',
    'generic_trade_weapon_rack': 'ancients_weapon_rack',
    'voth_court_wardrobe': 'ancients_wardrobe',
    'voth_common_drying_rack': 'hykkousoi_fish_rack'
})

B.NEW = {
    'tethis_desal_still': 'Ancient multi-stage flash desalination drum in seamed white alloy and copper condenser coils',
    'tethis_otec_turbine': 'Silent vertical OTEC thermal-gradient turbine casing with tarnished bronze manifold rings',
    'tethis_kelp_spore_vat': 'Cylindrical blue-glass mariculture photobioreactor ring with cyan strip collar',
    'tethis_tide_harmonic_dial': 'Brass-and-cyan mechanical predictor gearing Krator giant-tides and the counting moons',
    'hykkousoi_etched_gene_stele': 'Submerged corrosion-proof titanium/ceramic tablet rack inscribed in Greek-symbol gene notation (LORE 6.16)',
    'hykkousoi_pearl_altar': 'Grown giant-tridacna nacre basin on bronze tripod for flooded and dry sanctuary offerings'
}
B.CITY = {}


def setup_extra_programs():
    cs = lambda x: max(1, int(round(x)))
    B.EXTRA_PROGRAMS.update({
        'benthic_lab': lambda a, w, d, D: [
            ('ancients_lab_bench', cs(a / 35)), ('tethis_kelp_spore_vat', cs(a / 70)),
            ('hykkousoi_etched_gene_stele', cs(a / 55)), ('ancients_light_strip_ring', cs(a / 80))
        ],
        'flooded_shrine': lambda a, w, d, D: [
            ('hykkousoi_pearl_altar', 2), ('hykkousoi_tide_niche', 6),
            ('hykkousoi_etched_gene_stele', 8), ('hykkousoi_oyster_larder', cs(a / 45))
        ],
        'desal_works': lambda a, w, d, D: [
            ('tethis_desal_still', cs(a / 90)), ('ancients_control_stand', cs(a / 75)),
            ('ancients_deck_vent', cs(a / 60)), ('ancients_cargo_pods', cs(a / 50))
        ],
        'otec_hall': lambda a, w, d, D: [
            ('tethis_otec_turbine', max(2, cs(a / 140))), ('ancients_control_stand', 4),
            ('ancients_server_rack', 4), ('hykkousoi_tide_niche', 2)
        ],
        'foundry_hyk': lambda a, w, d, D: [
            ('hykkousoi_hearth_basin', cs(a / 65)), ('ancients_lab_bench', cs(a / 50)),
            ('hykkousoi_sea_chest', cs(a / 60)), ('ancients_cargo_pods', cs(a / 70))
        ],
        'capsule_pod': lambda a, w, d, D: [
            ('hykkousoi_shell_cradle_bed', 1), ('ancients_bed', 1),
            ('hykkousoi_nacre_chest', 1), ('ancients_workstation', 1), ('hykkousoi_jar_lamp', 2)
        ],
        'hydro_conservatory': lambda a, w, d, D: [
            ('ancients_planting_bed', cs(a / 24)), ('tethis_kelp_spore_vat', cs(a / 110)),
            ('hykkousoi_jar_lamp', cs(a / 50)), ('ancients_plaza_fountain', 1)
        ],
        'harbour_quay': lambda a, w, d, D: [
            ('ancients_bollard', cs(a / 35)), ('ancients_capstan', cs(a / 90)),
            ('hykkousoi_net_rack', cs(a / 40)), ('hykkousoi_fish_rack', cs(a / 45)),
            ('hykkousoi_oyster_larder', cs(a / 55))
        ]
    })
    B.KIND_FILL.update({
        'benthic_lab': (184, 224, 238),
        'flooded_shrine': (162, 210, 236),
        'desal_works': (218, 212, 198),
        'otec_hall': (206, 204, 194),
        'foundry_hyk': (234, 206, 176),
        'capsule_pod': (236, 226, 192),
        'hydro_conservatory': (194, 234, 196),
        'harbour_quay': (208, 222, 232)
    })


def build_interior_sheets(P):
    """Five detailed room-by-room floorplan sheets rendered via settlements/voth/palace/blueprint.py."""
    floors = []

    # ---- N1: Submerged Benthic Rotunda U0 (y = -19.5 .. -7.5 m) & Subsea Tube Locks ----
    u0_rooms = [
        C(1, 'Central Trunk Wet-Core & Lift Caisson', 'void', 0, 0, 23, 0,
          'P0 central trunk plunging to coral shelf (-21.5 m); flooded lift shaft now used as vertical gill-chimney'),
        sector_box(2, 'North Benthic Gene-Lab', 'benthic_lab', 30, 52, 90, 24, 3,
                   'Original: marine genome sequencing. Modern Hykkousoi: Drowned Gene-Scriptorium holding etched Greek-symbol titanium tablets (LORE 6.16)',
                   r_max=67, r_min=28),
        sector_box(3, 'East Kelp-Spore & Bioreactor Hall', 'benthic_lab', 29, 48, 8, 20, 2,
                   'Original: photobioreactor rings. Modern: flooded giant-kelp nursery tended by gill-divers',
                   r_max=67, r_min=28),
        sector_box(4, 'South Subsea Observation Rotunda', 'flooded_shrine', 30, 54, -90, 25, 4,
                   'Original: 180-deg curved acrylic reef lounge (Ref 2). Modern: Flooded Sanctuary of the Pearl & Giant-Oyster Beds',
                   r_max=67, r_min=28),
        sector_box(5, 'West Hyperbaric & Diver Lock Hall', 'benthic_lab', 30, 52, 180, 24, 2,
                   'Original: submarine moon-pool & decompression ward. Modern: dry/wet air-pocket bell for visiting air-breathers',
                   r_max=67, r_min=28),
        sector_box(6, 'NE Tube Lock -> U1 Oyster Larder', 'harbour_quay', 48, 66, 44, 15, 2,
                   'Portal to Subsea Tube ST_0_1 (-14 m); Modern: clear flooded swim-way to P1 subsea cold-vaults',
                   r_max=67, r_min=28),
        sector_box(7, 'SE Tube Lock -> U4 Reef Court', 'harbour_quay', 48, 66, -44, 15, 3,
                   'Portal to Subsea Tube ST_0_4 (-14 m); Modern: ceremonial underwater procession tube',
                   r_max=67, r_min=28),
        sector_box(8, 'East Tube Lock -> U6 OTEC Vault', 'harbour_quay', 52, 66, -12, 11, 1,
                   'Portal to breached ST_0_6; Modern: barred with Hykkousoi bronze grille against deep reef eels',
                   r_max=67, r_min=28),
        sector_box(9, 'NW Reef Viewport Gallery', 'flooded_shrine', 44, 65, 136, 20, 3,
                   'Curved perimeter viewport ring looking into sunlit coral pilings; encrusted with luminous nacre',
                   r_max=67, r_min=28),
        sector_box(10, 'SW Specimen & Seed Vault', 'store', 44, 65, -136, 20, 1,
                   'Original: cryo-marine seed bank. Modern: sealed ceramic amphora cache',
                   r_max=67, r_min=28),
        R(11, 'North Diving Bell Stair', 'stair', -5, 5, 23, 30, 1, 'Pressurized spiral trunk stair up to P0 lagoon quay'),
        R(12, 'South Gill-Well Shaft', 'stair', -5, 5, -30, -23, 2, 'Open wet shaft straight up into P0 sheltered lagoon')
    ]
    floors.append(dict(
        id='N1_benthic_rotunda', tier=0, R=72, circle=True,
        title='Sheet N1: Submerged Benthic Rotunda U0 (y = -19.5 to -7.5 m, below P0 Lagoon)',
        sub='Suspended 8 m beneath the waves on P0\'s central trunk and 12 inner pylons over the -21.5 m coral shelf (Ref 2). '
            'Originally the Ancients\' benthic genetics lab, mariculture hatchery, and subsea transit hub; today intentionally '
            'flooded at ambient sea pressure as the Hykkousoi\'s unassailable underwater Gene-Scriptorium and Pearl Sanctuary.',
        axisnote='u = x (east ->), v = -z (north up); R_out = 68 m, central trunk R = 26 m; submerged below Mean Sea Level',
        fills=[
            (circle_pts(0, 0, 68), (212, 236, 248)),
            (circle_pts(0, 0, 26), (175, 206, 226))
        ],
        lines=[
            (circle_pts(0, 0, 68), (20, 80, 130), 4),
            ([(56, 48), (69, 59)], (30, 110, 170), 6),
            ([(56, -48), (69, -59)], (30, 110, 170), 6),
            ([(64, -12), (75, -14)], (160, 70, 60), 5)
        ],
        rooms=u0_rooms
    ))

    # ---- N2: Central Nexus Saucer P0 (y = +24 .. +53.4 m, Main Promenade Cut at y = +32.4 m) ----
    p0_rooms = [
        C(1, 'Inner Harbour Lagoon Well (open to sea below)', 'pool', 0, 0, 54, 0,
          '108 m sheltered sea-well open to waterline sea-gates below; T0 mushroom trunk (R=26 m) rises from its centre; Hykkousoi pearl rafts moored around trunk'),
        C(2, 'T0 Trunk & Helical Conch-Stair Foot', 'stair', 0, 0, 26, 3,
          'Ribbed trunk of the 218 m Great Mushroom Tower; Hykkousoi grown nacre conch-stair spirals upward from +48 m roof'),
        # 6 Skybridge Portals around outer balcony rim
        sector_box(3, 'East Spoke Portal (-> P6 Works)', 'entrance', 132, 149, 0, 9, 3, 'Lands B_0_6 balcony viaduct (+24 m)', r_max=150, r_min=56),
        sector_box(4, 'NE Spoke Portal (-> P1 Residences)', 'entrance', 132, 149, 60, 9, 3, 'Lands B_0_1 promenade viaduct (+26 m)', r_max=150, r_min=56),
        sector_box(5, 'NW Spoke Portal (-> P2 Academy)', 'entrance', 132, 149, 120, 9, 3, 'Lands B_0_2 promenade viaduct (+26 m)', r_max=150, r_min=56),
        sector_box(6, 'West Spoke Portal (-> P5 Harbour)', 'entrance', 132, 149, 180, 9, 4, 'Main ceremonial entry from Harbour Ring B_0_5', r_max=150, r_min=56),
        sector_box(7, 'SW Spoke Portal (-> P3 Gardens)', 'entrance', 132, 149, -120, 9, 3, 'Lands B_0_3 aqueduct garden viaduct', r_max=150, r_min=56),
        sector_box(8, 'SE Spoke Portal (-> P4 Baths)', 'entrance', 132, 149, -60, 9, 3, 'Lands B_0_4 festival balcony viaduct', r_max=150, r_min=56),
        # 6 Radial Light-Courts
        sector_box(9, 'Light-Court I (NE)', 'court', 84, 114, 30, 7, 2, 'Open sky-slot ventilating mid-ring; hung with sea-linen awnings', r_max=150, r_min=56),
        sector_box(10, 'Light-Court II (N)', 'court', 84, 114, 90, 7, 2, 'Open sky-slot with rainwater catch-basin', r_max=150, r_min=56),
        sector_box(11, 'Light-Court III (NW)', 'court', 84, 114, 150, 7, 2, 'Open sky-slot', r_max=150, r_min=56),
        sector_box(12, 'Light-Court IV (SW)', 'court', 84, 114, -150, 7, 2, 'Open sky-slot', r_max=150, r_min=56),
        sector_box(13, 'Light-Court V (S)', 'court', 84, 114, -90, 7, 2, 'Open sky-slot', r_max=150, r_min=56),
        sector_box(14, 'Light-Court VI (SE)', 'court', 84, 114, -30, 7, 2, 'Open sky-slot', r_max=150, r_min=56),
        # Civic, Work & Recreation Mid-Ring Chambers
        sector_box(15, 'Hall of Tides / Amphitriton Agora', 'divan', 78, 122, 180, 15, 4,
                   'Original: Soleri civic assembly hall. Modern: Council Seat where Hykkousoi poleis settle disputes under the Archon', r_max=150, r_min=56),
        sector_box(16, 'Chart-House & Dry Scriptorium', 'library', 78, 122, 120, 14, 3,
                   'Original: central data library. Modern: sea-linen navigational charts & dry transcriptions from U0 below', r_max=150, r_min=56),
        sector_box(17, 'Tide-Harmonic & Weather Bureau', 'astronomers', 78, 122, 60, 14, 3,
                   'Strut-stair climbs to S0b Tide-Clock Satellite Dish (+62 m)', r_max=150, r_min=56),
        sector_box(18, 'Central Exchange & Assay', 'weighing', 78, 122, 0, 14, 2,
                   'Original: arcology logistics hub. Modern: pearl, bronze, and spice tally hall', r_max=150, r_min=56),
        sector_box(19, 'Marine Clinic & Gill-Ward', 'infirmary', 78, 122, -60, 14, 2,
                   'Original: hyperbaric hospital. Modern: mist-humidified gill-wither infirmary & apothecary', r_max=150, r_min=56),
        sector_box(20, 'Great Communal Refectory & Galley', 'banquet', 78, 122, -120, 14, 3,
                   'Fire-cooked fish, olive, and grain feast hall (LORE 6.16: Hykkousoi prize fire-cooked food on dry decks)', r_max=150, r_min=56),
        # Outer Sunlit Perimeter Residential Sectors (LIVE)
        sector_box(21, 'NE Sea-Rim Apartments (LIVE)', 'lodging', 118, 145, 30, 13, 3,
                   'Stepped ribbon-window duplexes; Modern: ribbed nacre barnacle-pods grown onto storm-broken bays', r_max=148, r_min=56),
        sector_box(22, 'North Sea-Rim Apartments (LIVE)', 'lodging', 118, 145, 90, 13, 3,
                   'Sunlit family suites opening onto continuous bullnose balcony', r_max=148, r_min=56),
        sector_box(23, 'NW Conservatory-Rim Flats (LIVE)', 'lodging', 118, 145, 150, 13, 3,
                   'Adjacent to S0a Medicinal Dish strut lobby', r_max=148, r_min=56),
        sector_box(24, 'SW Orchard-View Flats (LIVE)', 'lodging', 118, 145, -150, 13, 3,
                   'Sheltered leeward apartments with scallop-shell balconies', r_max=148, r_min=56),
        sector_box(25, 'South Solarium-Rim Suites (LIVE)', 'lodging', 118, 145, -90, 13, 4,
                   'Archon & envoys suites beneath S0c Sky-Bath Dish', r_max=148, r_min=56),
        sector_box(26, 'SE Lagoon-Breeze Flats (LIVE)', 'lodging', 118, 145, -30, 13, 3,
                   'Pearl-captains residences', r_max=148, r_min=56),
        # Inner Lagoon Promenade & Lagoon-View Flats
        sector_box(27, 'North Lagoon Gallery & Flats (LIVE)', 'lodging', 56, 75, 90, 30, 2,
                   'Overlooks inner harbour well; bronze hoists lower baskets to boats at y=0', r_max=148, r_min=55),
        sector_box(28, 'South Water-Theatre Overlook', 'dome_gallery', 56, 75, -90, 30, 3,
                   'Stepped balcony watching regattas and gill-divers in the central lagoon', r_max=148, r_min=55)
    ]
    floors.append(dict(
        id='N2_nexus_hub_saucer', tier=1, R=156, circle=True,
        title='Sheet N2: Nexus Hub Saucer P0 — Civic, Live & Promenade Deck (y = +32.4 m, R = 152 m)',
        sub='Soleri concentric zoning in action: daylight-lit residences line the stepped outer sea-balcony (21-26) and inner lagoon '
            'gallery (27); civic, medical, and scholarly halls (15-20) occupy the mid-ring ventilated by six radial light-courts (9-14). '
            'Three diagonal struts launch outward from the upper rim to cantilevered satellite saucers S0a, S0b, and S0c (Ref 2).',
        axisnote='u = x (east ->), v = -z (north up); 6 radial skybridges at 60-deg hex intervals; inner lagoon R = 54 m',
        fills=[
            (circle_pts(0, 0, 152), (248, 246, 240)),
            (circle_pts(0, 0, 54), (178, 218, 242))
        ],
        lines=[
            (circle_pts(0, 0, 149), (80, 120, 90), 3),
            ([(-120, 94), (-148, 116)], (140, 90, 40), 5),
            ([(120, 94), (148, 116)], (140, 90, 40), 5),
            ([(0, -148), (0, -166)], (140, 90, 40), 5)
        ],
        rooms=p0_rooms
    ))

    # ---- N3: Residential Saucer P1 (left) + Capsule-Studded Tower T1a Drum Plan (right) ----
    p1_cx = -82.0
    t1_cx, t1_scale = 148.0, 2.0
    n3_rooms = [
        C(1, 'P1 Lagoon Light-Well (R = 32 m)', 'pool', p1_cx, 0, 32, 0,
          'Sheltered sea-well; diving ladders descend to U1 Oyster-Larder pod (-18.5 m)'),
        sector_box(2, 'Terrace Duplex Arc I (LIVE)', 'lodging', 94, 122, 25, 20, 3,
                   'Stepped 2-storey apartments; Modern: Hykkousoi nacre barnacle-pods accreted on outer bullnose',
                   cu=p1_cx, r_max=124, r_min=34),
        sector_box(3, 'Terrace Duplex Arc II (LIVE)', 'lodging', 94, 122, 85, 20, 3,
                   'North-facing sea-breeze family apartments + T1a/T1b sky-lobby transfer',
                   cu=p1_cx, r_max=124, r_min=34),
        sector_box(4, 'Terrace Duplex Arc III (LIVE)', 'lodging', 94, 122, 145, 20, 2,
                   'Sunlit terrace dwellings with rooftop rain-planters',
                   cu=p1_cx, r_max=124, r_min=34),
        sector_box(5, 'Terrace Duplex Arc IV (LIVE)', 'lodging', 94, 122, -155, 20, 3,
                   'SW spoke landing from Nexus P0 (B_0_1) + family apartments',
                   cu=p1_cx, r_max=124, r_min=34),
        sector_box(6, 'Terrace Duplex Arc V (LIVE)', 'lodging', 94, 122, -95, 20, 3,
                   'Sunny south-rim dwellings; dense Hykkousoi conch-shell balconies',
                   cu=p1_cx, r_max=124, r_min=34),
        sector_box(7, 'Terrace Duplex Arc VI (LIVE)', 'lodging', 94, 122, -35, 20, 2,
                   'SE ring-bridge landing (B_6_1 Hykkousoi grown rib-bridge)',
                   cu=p1_cx, r_max=124, r_min=34),
        sector_box(8, 'Radial Light-Courts (x6)', 'court', 62, 90, 55, 10, 2,
                   'Daylight & cross-ventilation court', cu=p1_cx, r_max=124, r_min=34),
        sector_box(9, 'Radial Light-Court South', 'court', 62, 90, -65, 10, 2,
                   'Rainwater cistern court', cu=p1_cx, r_max=124, r_min=34),
        sector_box(10, 'Communal Kitchens & Hearths', 'kitchen', 62, 90, -125, 19, 2,
                   'Shared neighbourhood cooking hearths & amphora stores', cu=p1_cx, r_max=124, r_min=34),
        sector_box(11, 'Quarter Bathhouse & Mist Basin', 'bath', 62, 90, 175, 17, 2,
                   'Saltwater plunge & humidified gill-care baths', cu=p1_cx, r_max=124, r_min=34),
        sector_box(12, 'Net, Sail & Shell Craft Lofts (WORK)', 'workshop', 62, 90, -5, 17, 1,
                   'Inbuilt light cottage industry in the mid-ring', cu=p1_cx, r_max=124, r_min=34),
        sector_box(13, 'Nursery & Youth School', 'lodging', 62, 90, 115, 17, 2,
                   'Opens onto sheltered internal court', cu=p1_cx, r_max=124, r_min=34),
        sector_box(14, 'Inner Lagoon Gallery Flats (LIVE)', 'lodging', 34, 58, 90, 38, 2,
                   'Single-aspect flats ringing the calm inner lagoon', cu=p1_cx, r_max=124, r_min=34),
        sector_box(15, 'Lagoon Boat-Hoist & Wet-Stair', 'harbour_quay', 34, 58, -90, 36, 1,
                   'Direct stair to waterline skiffs and U1 underwater vault', cu=p1_cx, r_max=124, r_min=34),
        # Enlarged detail of Capsule-Studded Tower T1a on the right
        C(16, 'T1a Hollow Lift & Service Core (x2 detail)', 'stair', t1_cx, 12, 12 * t1_scale, 1,
          'R = 12 m structural concrete cylinder; Modern: wooden & shell spiral stairs inside dead lift shaft')
    ]
    for k in range(8):
        ang = k * 45.0
        n3_rooms.append(sector_box(
            17 + k, 'Plug-In Capsule Pair %d (LIVE)' % (k + 1), 'capsule_pod',
            13.5 * t1_scale, 36.5 * t1_scale, ang, 18, 2,
            'Cantilevered modular 45 m2 family pods (Ref 4 molar drum); Modern: portholes glazed in translucent shell & nacre',
            cu=t1_cx, cv=12.0, r_max=37 * t1_scale, r_min=12.5 * t1_scale
        ))
    n3_rooms.append(R(25, 'Open Sky-Loggia Recreation Neck (every 11th floor)', 'garden',
                      t1_cx - 68, t1_cx + 68, -118, -82, 2,
                      'Recessed breeze gallery between stacked capsule drums (Ref 4): hanging gardens & rope-bridge to T1b'))

    floors.append(dict(
        id='N3_residential_and_capsules', tier=1, R=240, rect=(-218, 236, -138, 138),
        title='Sheet N3: Residential Saucer P1 (left, R = 126 m) & Capsule Tower T1a Drum Detail (right, 2x scale)',
        sub='Left: Stepped Residential Saucer P1 (+28.2 m) housing sunlit duplexes on both the outer sea rim and inner lagoon '
            'well, with communal kitchens, baths, and cottage crafts in the court-lit middle ring. Right (2x scale): one storey of '
            'Ref 4\'s cylindrical capsule-studded towers (R = 37 m), cantilevering radial dwelling pods off a hollow core.',
        axisnote='Left: P1 plan in metres; Right: T1a cellular drum enlarged 2x for room legibility',
        fills=[
            (circle_pts(p1_cx, 0, 126), (246, 242, 232)),
            (circle_pts(p1_cx, 0, 32), (178, 218, 242)),
            (circle_pts(t1_cx, 12, 37 * t1_scale), (242, 236, 220))
        ],
        lines=[
            (circle_pts(p1_cx, 0, 126), (40, 40, 40), 3),
            (circle_pts(t1_cx, 12, 37 * t1_scale), (40, 40, 40), 3)
        ],
        rooms=n3_rooms
    ))

    # ---- N4: Work Ring P6 (left) vs Botanical Garden Saucer P3 (right) ----
    w_cx, g_cx = -142.0, 142.0
    n4_rooms = [
        # Left: P6 Industrial, Desalination & OTEC Works Ring (non-overlapping radial layout!)
        C(1, 'P6 Condenser & Barge Hoist Well (R = 38 m)', 'pool', w_cx, 0, 38, 0,
          'Heavy gantry hoists lift ore, scrap alloy, and sea-salt directly from barges below'),
        sector_box(2, 'Flash Desalination Stills I (WORK)', 'desal_works', 44, 114, 122, 24, 1,
                   'Ancient multi-stage vapour stills; Modern: lower vats collect solar-distilled & cistern brine',
                   cu=w_cx, r_max=118, r_min=40),
        sector_box(3, 'OTEC Turbine & Power Hall (WORK)', 'otec_hall', 44, 114, 72, 20, 1,
                   'Original: thermal ocean-gradient generators over U6. Modern: silent brass turbines venerated by smith-guilds',
                   cu=w_cx, r_max=118, r_min=40),
        C(8, 'T6a Condenser & Draft Column Base', 'stair', w_cx + 68, 34, 15, 1,
          '150 m industrial stack & T-crane; drafts the Hykkousoi furnaces'),
        sector_box(4, 'Electrolysis -> Hykkousoi Bronze Foundry', 'foundry_hyk', 44, 114, -72, 20, 2,
                   'Original: alloy & hydrogen hall. Modern: high-draft bronze-smelting furnaces & shell-lime kilns',
                   cu=w_cx, r_max=118, r_min=40),
        C(9, 'T6b Fractionating Column Base', 'stair', w_cx + 68, -34, 14, 0,
          '136 m silent chemical column hung with storm-warning bells'),
        sector_box(5, 'Hull & Machine Fabrication Hangar', 'workshop', 44, 114, -124, 24, 1,
                   'Original: subsea hull shop. Modern: trireme bronze-ram casting & salvage stripping hall',
                   cu=w_cx, r_max=118, r_min=40),
        sector_box(6, 'West Works Spoke Landing (from P0)', 'harbour_quay', 78, 116, 180, 18, 1,
                   'Heavy cargo ramp from B_0_6 viaduct + workers mess hall', cu=w_cx, r_max=118, r_min=40),
        sector_box(7, 'Collapsed B_6_8 Bridge Stub (-> P8)', 'void', 96, 118, 0, 10, 0,
                   'Severed viaduct end looking across 85 m of open water to cut-off Salvage Island P8',
                   cu=w_cx, r_max=119, r_min=40),

        # Right: P3 Botanical & Orchard Garden Saucer (clean non-overlapping quadrants!)
        C(10, 'P3 Fresh-Water Lily & Cistern Well (R = 24 m)', 'pool', g_cx, 0, 24, 2,
          'Central rainwater & mist catch-basin feeding concentric orchard channels'),
        sector_box(11, 'Ribbon-Glazed Seed Conservatory (Ref 1)', 'hydro_conservatory', 48, 114, 95, 30, 3,
                   'Curved warm-lit glass pavilion on saucer deck (Ref 1!); Modern: translucent shell panes shelter citrus, spice & gill-herbs',
                   cu=g_cx, r_max=120, r_min=26),
        sector_box(12, 'Concentric Olive & Fig Terrace (GARDEN)', 'garden', 44, 114, 22, 28, 3,
                   'Open-air stepped soil terraces irrigated from T3 Dew-Spire & T0 aqueduct spoke',
                   cu=g_cx, r_max=120, r_min=26),
        sector_box(13, 'Sea-Linen, Gourd & Reed Beds (GARDEN)', 'garden', 44, 114, -48, 28, 2,
                   'Produces Hykkousoi sea-linen fibre for sails & garments plus fresh greens',
                   cu=g_cx, r_max=120, r_min=26),
        sector_box(14, 'Hydroponic & Orchid Promenade', 'hydro_conservatory', 44, 112, -112, 20, 3,
                   'Covered botanical walk & public pleasure park; rill overflows down B_3_3a ramp to Lower Herb Saucer S3a',
                   cu=g_cx, r_max=120, r_min=26),
        C(16, 'T3 Dew-Spire & Botanists Stalk Base', 'stair', g_cx - 66, -42, 16, 2,
          '136 m tower hung with Hykkousoi sea-linen fog-nets condensing mist into cistern #10'),
        sector_box(15, 'Tea, Music & Sunset Pavilion (RECREATION)', 'pavilion', 76, 116, 165, 18, 4,
                   'Open colonnaded belvedere overlooking the western sea and S3a hanging gardens',
                   cu=g_cx, r_max=120, r_min=26)
    ]
    floors.append(dict(
        id='N4_work_vs_garden_saucers', tier=1, R=278, rect=(-276, 276, -138, 138),
        title='Sheet N4: Functional Specialization — Works Ring P6 (left) vs. Botanical Garden Saucer P3 (right)',
        sub='How Soleri functional zoning shapes modern survival: Industrial Ring P6 (+20.2 m, left) placed high-heat stills and '
            'foundries downwind on the east, naturally becoming the Hykkousoi\'s ventilated bronze-foundry and shell-lime works '
            '(with outer smelter P8 left cut off as a salvage quarry). Garden Saucer P3 (+26.2 m, right) became their rain-fed orchard.',
        axisnote='Left: P6 Works Ring (R = 120 m); Right: P3 Botanical & Orchard Saucer (R = 122 m); metres',
        fills=[
            (circle_pts(w_cx, 0, 120), (234, 228, 216)),
            (circle_pts(w_cx, 0, 38), (170, 206, 228)),
            (circle_pts(g_cx, 0, 122), (214, 238, 204)),
            (circle_pts(g_cx, 0, 24), (178, 224, 246))
        ],
        lines=[
            (circle_pts(w_cx, 0, 120), (50, 50, 50), 3),
            (circle_pts(g_cx, 0, 122), (40, 90, 40), 3),
            ([(g_cx - 92, -80), (g_cx - 122, -108)], (70, 130, 180), 5)
        ],
        rooms=n4_rooms
    ))

    # ---- N5: Great Central Mushroom Tower Cap T0 (y = +158 .. +188 m, R = 108 m, Ref 3!) ----
    t0_rooms = [
        C(1, 'Central Ribbed Trunk & Dead Lift Bank', 'stair', 0, 0, 18, 1,
          '8-shaft express Ancient lift core (silent); encircled by HYK_T0_helix grown nacre conch-stair arriving from +48 m'),
        C(2, 'Council of the Archon & Beacon Rotunda', 'throne', 0, 36, 15, 4,
          'Crowned by the +218 m central cupola & sensor mast (Ref 3); highest assembly & signal watch over the Ring Sea'),
        C(3, 'Gravity Rainwater Header Ring', 'cistern', 0, -36, 14, 1,
          'Fed by the concave white-metal upper dome; feeds P0-P5 gardens and fountains by gravity alone (no pumps needed!)'),
        sector_box(4, 'North Sky-Villa Terrace (LIVE)', 'lodging', 62, 102, 90, 22, 4,
                   'Stepped panoramic apartments cantilevered over the radial amber-lit soffit ribs (Ref 3)',
                   r_max=105, r_min=54),
        sector_box(5, 'NE Sky-Villa Terrace (LIVE)', 'lodging', 62, 102, 30, 22, 3,
                   'High-caste Ancient residences; Modern: Pearl-Admirals & Lore-Masters sky-lodgings',
                   r_max=105, r_min=54),
        sector_box(6, 'SE Sky-Villa Terrace (LIVE)', 'lodging', 62, 102, -30, 22, 3,
                   'Glazed outer rim patched with storm-shutters of bronze and nacre',
                   r_max=105, r_min=54),
        sector_box(7, 'South Horizon Banquet & Loggia (RECREATION)', 'banquet', 62, 102, -90, 22, 4,
                   'Double-height horizon gallery looking 50 km out to sea',
                   r_max=105, r_min=54),
        sector_box(8, 'SW Aeroponic & Cloud-Orchard Sector', 'hydro_conservatory', 62, 102, -150, 22, 3,
                   'Mist-fed high nursery growing salt-sensitive figs, herbs, and medicinal mosses',
                   r_max=105, r_min=54),
        sector_box(9, 'NW Observatory & Signal Deck (CIVIC)', 'astronomers', 62, 102, 150, 22, 3,
                   'Heliograph mirrors and storm-watch instruments',
                   r_max=105, r_min=54),
        sector_box(10, 'East Radial Sky-Court', 'garden', 32, 56, 0, 20, 3,
                   'Open oculus court letting zenith sunlight into the mushroom cap',
                   r_max=105, r_min=22),
        sector_box(11, 'West Radial Sky-Court', 'garden', 32, 56, 180, 20, 3,
                   'Sheltered courtyard garden 168 m above the waves',
                   r_max=105, r_min=22)
    ]
    floors.append(dict(
        id='N5_great_mushroom_cap', tier=3, R=114, circle=True,
        title='Sheet N5: Great Mushroom Tower Cap T0 (y = +166.4 m, R = 108 m; Spire to +218 m)',
        sub='Crowning the central trunk 158 m above the sea (Ref 3): 24 radial structural truss ribs (glowing warm amber/cyan in '
            'the underside soffit) cantilever a 216 m saucer dish. Its concave roof dome harvests pure rainwater into header '
            'cistern #3, gravity-feeding the entire Hykkousoi settlement below without electric pumps.',
        axisnote='u = x (east ->), v = -z (north up); R_cap = 108 m at y = +158..+188 m; radial soffit ribs in gold',
        fills=[(circle_pts(0, 0, 108), (248, 245, 236))],
        lines=[
            (
                [(26 * math.cos(math.radians(a)), 26 * math.sin(math.radians(a))),
                 (108 * math.cos(math.radians(a)), 108 * math.sin(math.radians(a)))],
                (210, 165, 95), 2
            )
            for a in range(0, 360, 15)
        ] + [(circle_pts(0, 0, 108), (30, 30, 30), 4)],
        rooms=t0_rooms
    ))

    return floors


# ------------------------------------------------------------------------- Architectural Macro & Section Plates
ZONE_COL = {
    'live': (240, 198, 122),        # warm ochre-gold: residential saucers & capsule towers
    'work': (182, 196, 210),        # steel-slate: harbour, desalination, OTEC, smelters
    'recreation': (162, 218, 196),  # seafoam-mint: lagoon parks, baths, amphitheatre
    'garden': (146, 208, 136),      # lush botanical green: orchard & conservatory saucers
    'civic': (228, 176, 154),       # coral-terracotta: nexus agora, academy, tide-clock
    'infra': (196, 186, 216)        # violet-stone: sea-gate pharos & deep OTEC pods
}

MOD_COL = {
    'hyk_accreted': (236, 196, 152),     # nacre/pearl & bronze inhabited host
    'kept_dry': (216, 226, 192),         # kept intact dry Ancient structure
    'garden_rainfed': (142, 206, 132),   # active rain-fed orchards & mist beds
    'flooded_habitable': (92, 178, 224), # intentionally flooded Hykkousoi gill-chambers
    'flooded_ruin': (98, 128, 156),      # deep flooded turbine ruin
    'salvage_ruin': (196, 118, 102),     # cut-off P8 salvage quarry
    'worn_idle': (180, 180, 176)
}


def draw_master_site_sheet(P):
    W, H = 2780, 1840
    img = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fr, fn = font(40, True), font(21), font(20, True), font(16, True), font(15)

    dr.text((36, 18), 'Sheet N0: Tethis — Master Pelagic Lattice & Original Live / Work / Recreation Plan', font=ft, fill=(18, 24, 32))
    st = P['stats']
    sub = (
        'Hexagonal 390 m geometric lattice on clustered pylons in open sea (%d x %d m; height +%d m; submerged to %.1f m). '
        'Total built floor %.1f ha: %.1f ha LIVE (%d peak Ancient residents at 45 m2), %.1f ha WORK, %.1f ha RECREATION, '
        '%.1f ha CIVIC, plus %.1f ha open rooftop gardens and %.1f ha sheltered inner sea-lagoons.'
        % (st['spanX'], st['spanZ'], st['maxHeight'], st['minSubmergedY'], st['totalFloor'] / 1e4,
           st['liveFloor'] / 1e4, st['peakPop'], st['workFloor'] / 1e4, st['recFloor'] / 1e4,
           st['civicFloor'] / 1e4, st['gardenArea'] / 1e4, st['lagoonArea'] / 1e4)
    )
    for i, ln in enumerate(B.wrap(dr, sub, fs, W - 72)):
        dr.text((36, 68 + 28 * i), ln, font=fs, fill=(60, 68, 76))

    mx0, my0, mw, mh = 36, 148, 1900, 1640
    dr.rectangle([mx0, my0, mx0 + mw, my0 + mh], fill=(208, 232, 246), outline=(40, 70, 95), width=3)
    s = 1.15
    cx, cy = mx0 + mw * 0.5, my0 + mh * 0.48
    X = lambda x: cx + x * s
    Y = lambda z: cy + z * s

    for rad, col, lbl in [
        (680, (192, 222, 240), 'seabed -32 m'),
        (460, (178, 214, 236), 'reef bench -26 m'),
        (210, (164, 206, 232), 'coral shoal -21.5 m')
    ]:
        dr.ellipse([X(-rad), Y(-rad * 0.78), X(rad), Y(rad * 0.78)], fill=col, outline=(145, 190, 218), width=2)
        dr.text((X(-rad * 0.65), Y(-rad * 0.78) + 8), lbl, font=fn, fill=(75, 120, 150))

    hex_ring = [q for q in P['platforms'] if q['id'] in ('P1', 'P2', 'P5', 'P3', 'P4', 'P6')]
    for q in hex_ring:
        dr.line([(X(0), Y(0)), (X(q['x']), Y(q['z']))], fill=(170, 198, 216), width=1)

    for b in P['bridges']:
        if b['kind'] == 'subsea_tube':
            pts = [(X(p[0]), Y(p[1])) for p in b['pts']]
            dr.line(pts, fill=(30, 130, 190), width=5)

    for b in P['bridges']:
        if b['kind'] == 'subsea_tube':
            continue
        pts = [(X(p[0]), Y(p[1])) for p in b['pts']]
        dr.line(pts, fill=(55, 58, 64), width=max(5, int(b['w'] * s * 0.85)))
        dr.line(pts, fill=(238, 224, 186), width=max(2, int(b['w'] * s * 0.5)))

    for j in P['junctions']:
        rj = j['r'] * s
        dr.regular_polygon((X(j['x']), Y(j['z']), rj), 6, fill=(232, 216, 180), outline=(40, 40, 40))
        dr.text((X(j['x']) - 10, Y(j['z']) - 8), j['id'], font=fn, fill=(20, 20, 20))

    for p in P['platforms']:
        ro, rw = p['rOut'] * s, p['rWell'] * s
        col = ZONE_COL.get(p['zone'], (230, 230, 225))
        dr.ellipse([X(p['x']) - ro, Y(p['z']) - ro, X(p['x']) + ro, Y(p['z']) + ro], fill=col, outline=(28, 32, 36), width=3)
        for k in (0.86, 0.72):
            dr.ellipse([X(p['x']) - ro * k, Y(p['z']) - ro * k, X(p['x']) + ro * k, Y(p['z']) + ro * k],
                       outline=(95, 95, 90), width=1)
        dr.ellipse([X(p['x']) - rw, Y(p['z']) - rw, X(p['x']) + rw, Y(p['z']) + rw],
                   fill=(158, 210, 238), outline=(35, 75, 105), width=2)
        if p.get('canalWidth'):
            cw = p['canalWidth'] * 0.5 * s
            dr.rectangle([X(p['x']) - ro - 3, Y(p['z']) - cw, X(p['x']) - rw + 3, Y(p['z']) + cw],
                         fill=(158, 210, 238), outline=None)
        for si in range(p['slips']):
            ang = math.radians(si * (360.0 / p['slips']) + 25.0)
            x0, z0 = p['x'] + p['rOut'] * math.cos(ang), p['z'] + p['rOut'] * math.sin(ang)
            x1, z1 = p['x'] + (p['rOut'] + 22) * math.cos(ang), p['z'] + (p['rOut'] + 22) * math.sin(ang)
            dr.line([(X(x0), Y(z0)), (X(x1), Y(z1))], fill=(90, 90, 95), width=4)

    for u in P['submerged']:
        ru = u['rOut'] * s
        dr.ellipse([X(u['x']) - ru, Y(u['z']) - ru, X(u['x']) + ru, Y(u['z']) + ru],
                   outline=(20, 115, 175), width=3)

    for py in P['pylons']:
        rp = max(3, py['r'] * s)
        dr.ellipse([X(py['x']) - rp, Y(py['z']) - rp, X(py['x']) + rp, Y(py['z']) + rp],
                   fill=(75, 78, 82), outline=(25, 25, 25))

    by_id = {p['id']: p for p in P['platforms']}
    for sat in P['satellites']:
        if sat['mount'] == 'cantilever_strut':
            par = by_id[sat['parent']]
            dr.line([(X(par['x']), Y(par['z'])), (X(sat['x']), Y(sat['z']))], fill=(110, 90, 65), width=4)
        rs = sat['rOut'] * s
        dr.ellipse([X(sat['x']) - rs, Y(sat['z']) - rs, X(sat['x']) + rs, Y(sat['z']) + rs],
                   fill=ZONE_COL.get(sat['zone'], (200, 230, 200)), outline=(25, 30, 30), width=3)
        dr.text((X(sat['x']) - 16, Y(sat['z']) - 9), sat['id'], font=fr, fill=(15, 15, 15))

    for t in P['towers']:
        if t.get('rCap'):
            rc = t['rCap'] * s
            rt = t['rTrunk'] * s
            dr.ellipse([X(t['x']) - rc, Y(t['z']) - rc, X(t['x']) + rc, Y(t['z']) + rc],
                       outline=(185, 95, 25), width=4)
            dr.ellipse([X(t['x']) - rt, Y(t['z']) - rt, X(t['x']) + rt, Y(t['z']) + rt],
                       fill=(235, 175, 100), outline=(30, 30, 30), width=2)
            dr.text((X(t['x']) - 28, Y(t['z']) - 9), '%s +%dm' % (t['id'], int(t['spireTop'])), font=fr, fill=(20, 20, 20))
        else:
            rd = t['rDrum'] * s
            rc = t['rCore'] * s
            dr.ellipse([X(t['x']) - rd, Y(t['z']) - rd, X(t['x']) + rd, Y(t['z']) + rd],
                       fill=(248, 224, 168) if t['zone'] == 'live' else (204, 212, 222), outline=(30, 30, 30), width=2)
            dr.ellipse([X(t['x']) - rc, Y(t['z']) - rc, X(t['x']) + rc, Y(t['z']) + rc],
                       fill=(90, 90, 95), outline=(30, 30, 30), width=1)
            dr.text((X(t['x']) - 14, Y(t['z']) - 8), t['id'], font=fn, fill=(15, 15, 15))

    # Position platform labels clear of towers (south of lagoon on P0, P1, P2; north of lagoon on P3, P4, P5, P6, P7, P8)
    for p in P['platforms']:
        south_side = p['id'] in ('P0', 'P1', 'P2')
        ly = Y(p['z']) + (p['rWell'] * s + 12 if south_side else -p['rWell'] * s - 28)
        if p['id'] in ('P7', 'P8'):
            ly = Y(p['z']) - p['rOut'] * s - 26
        lbl = '%s: %s' % (p['id'], p['name'].split('&')[0].strip())
        pill_label(dr, X(p['x']), ly, lbl, fr, border=(120, 125, 130))

    bx, by = mx0 + 28, my0 + mh - 36
    dr.line([(bx, by), (bx + 200 * s, by)], fill=(0, 0, 0), width=4)
    dr.text((bx, by - 24), '200 m  (x east ->, z south down, -z north up)', font=fr, fill=(0, 0, 0))

    lx, ly = mx0 + mw + 28, my0
    col_w = W - lx - 32
    dr.text((lx, ly), 'Soleri Functional Zoning', font=fb, fill=(20, 20, 20))
    ly += 32
    for zk, label in [
        ('live', 'LIVE: Sunlit Residential Saucers & Capsule Drums'),
        ('work', 'WORK: Harbour, Desalination, OTEC, Foundries'),
        ('garden', 'GARDEN: Irrigated Orchard & Conservatory Dishes'),
        ('recreation', 'RECREATION: Diving Lagoon, Baths & Amphitheatre'),
        ('civic', 'CIVIC: Nexus Agora, Scriptorium, Academy, Clinic'),
        ('infra', 'INFRA: Sea-Gate Pharos & Subsea Intake Pods')
    ]:
        dr.rectangle([lx, ly, lx + 22, ly + 20], fill=ZONE_COL[zk], outline=(30, 30, 30))
        dr.text((lx + 30, ly + 1), label, font=fn, fill=(30, 30, 30))
        ly += 27
    dr.ellipse([lx, ly, lx + 22, ly + 20], outline=(185, 95, 25), width=3)
    dr.text((lx + 30, ly + 1), 'Mushroom Saucer Cap Outlines (T0 +218m, T4 +166m)', font=fn, fill=(30, 30, 30))
    ly += 27
    dr.ellipse([lx, ly, lx + 22, ly + 20], outline=(20, 115, 175), width=3)
    dr.text((lx + 30, ly + 1), 'Submerged Aquatic Pods & Tubes (U0, U1, U4, U6)', font=fn, fill=(15, 95, 150))
    ly += 36

    dr.text((lx, ly), 'Platform & Submerged Schedule', font=fb, fill=(20, 20, 20))
    ly += 28
    for item in P['platforms'] + P['submerged']:
        head = '%s — %s (%.1f ha, y %+.0f..%+.0fm)' % (
            item['id'], item['name'], item['floorArea'] / 1e4, item['y0'], item['y1']
        )
        for hln in B.wrap(dr, head, fr, col_w):
            dr.text((lx, ly), hln, font=fr, fill=(15, 20, 25))
            ly += 20
        for wln in B.wrap(dr, item['role'], fn, col_w - 12)[:2]:
            dr.text((lx + 12, ly), wln, font=fn, fill=(75, 80, 88))
            ly += 18
        ly += 6

    return img


def draw_modern_hykkousoi_sheet(P):
    W, H = 2780, 1840
    img = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(img)
    ft, fs, fb, fr, fn = font(40, True), font(21), font(20, True), font(16, True), font(15)

    dr.text((36, 18), 'Sheet N6: Modern Hykkousoi Condition — How Original Zoning Guides Present Adaptation', font=ft, fill=(18, 24, 32))
    sub = (
        'Occupied by ~6,420 Hykkousoi (rib-gilled seafarers, LORE 6.16): ~5,120 inhabit the dry upper residential/garden saucers '
        'with grown nacre barnacle-pods and conch stairs, while ~1,300 work and worship in the intentionally flooded underwater '
        'rotundas (U0, U1, U4) that air-breathing enemies cannot enter. Collapsed bridge B_6_8 isolates P8 as a salvage quarry.'
    )
    for i, ln in enumerate(B.wrap(dr, sub, fs, W - 72)):
        dr.text((36, 68 + 28 * i), ln, font=fs, fill=(60, 68, 76))

    mx0, my0, mw, mh = 36, 148, 1880, 1640
    dr.rectangle([mx0, my0, mx0 + mw, my0 + mh], fill=(196, 226, 240), outline=(40, 70, 95), width=3)
    s = 1.14
    cx, cy = mx0 + mw * 0.5, my0 + mh * 0.48
    X = lambda x: cx + x * s
    Y = lambda z: cy + z * s

    for u in P['submerged']:
        ru = u['rOut'] * s
        c = MOD_COL.get(u['modern']['state'], (120, 180, 220))
        dr.ellipse([X(u['x']) - ru, Y(u['z']) - ru, X(u['x']) + ru, Y(u['z']) + ru],
                   fill=c, outline=(12, 75, 130), width=3)

    b_style = {
        'intact_kept': ((65, 70, 75), 8),
        'hyk_rib_bridge': ((196, 126, 54), 9),
        'hyk_drawbridge': ((165, 65, 135), 9),
        'collapsed': ((195, 45, 40), 6),
        'flooded_swimway': ((20, 125, 195), 6),
        'breached_ruin': ((145, 75, 75), 5)
    }
    bridge_callouts = []
    for b in P['bridges']:
        col, wid = b_style.get(b['modernState'], ((80, 80, 80), 6))
        pts = [(X(p[0]), Y(p[1])) for p in b['pts']]
        if b['modernState'] == 'collapsed':
            p0, p1 = pts[0], pts[-1]
            m1 = (p0[0] * 0.74 + p1[0] * 0.26, p0[1] * 0.74 + p1[1] * 0.26)
            m2 = (p0[0] * 0.26 + p1[0] * 0.74, p0[1] * 0.26 + p1[1] * 0.74)
            dr.line([p0, m1], fill=col, width=wid)
            dr.line([m2, p1], fill=col, width=wid)
            bridge_callouts.append(((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - 34, 'B_6_8 COLLAPSED', (180, 30, 30)))
        else:
            dr.line(pts, fill=col, width=wid)
            if b['modernState'] == 'hyk_rib_bridge':
                bridge_callouts.append(((pts[0][0] + pts[-1][0]) / 2 + 24, (pts[0][1] + pts[-1][1]) / 2 - 12,
                                        'Hyk. grown rib-bridge', col))
            elif b['modernState'] == 'hyk_drawbridge':
                bridge_callouts.append(((pts[0][0] + pts[-1][0]) / 2, (pts[0][1] + pts[-1][1]) / 2 + 28,
                                        'Hyk. drawbridge', col))

    for p in P['platforms']:
        ro, rw = p['rOut'] * s, p['rWell'] * s
        col = MOD_COL.get(p['modern']['state'], (220, 220, 215))
        dr.ellipse([X(p['x']) - ro, Y(p['z']) - ro, X(p['x']) + ro, Y(p['z']) + ro], fill=col, outline=(30, 30, 30), width=3)
        dr.ellipse([X(p['x']) - rw, Y(p['z']) - rw, X(p['x']) + rw, Y(p['z']) + rw], fill=(142, 202, 232), outline=(30, 70, 100), width=2)

    for sat in P['satellites']:
        rs = sat['rOut'] * s
        dr.ellipse([X(sat['x']) - rs, Y(sat['z']) - rs, X(sat['x']) + rs, Y(sat['z']) + rs],
                   fill=MOD_COL.get(sat['modern']['state'], (180, 220, 180)), outline=(30, 30, 30), width=2)

    for h in P['hykkousoi']:
        if h['kind'] == 'conch_helical_stair':
            rh = h['r'] * s
            dr.ellipse([X(h['x']) - rh, Y(h['z']) - rh, X(h['x']) + rh, Y(h['z']) + rh], outline=(190, 95, 30), width=4)
        elif h['kind'] == 'pearl_oyster_lines':
            rh = h['r'] * s
            dr.ellipse([X(h['x']) - rh, Y(h['z']) - rh, X(h['x']) + rh, Y(h['z']) + rh], outline=(245, 245, 255), width=2)
        else:
            rh = max(4, h['r'] * s)
            dr.ellipse([X(h['x']) - rh, Y(h['z']) - rh, X(h['x']) + rh, Y(h['z']) + rh],
                       fill=(252, 236, 214), outline=(145, 80, 35), width=2)

    for p in P['platforms']:
        lbl = '%s (%s)' % (p['id'], p['modern']['state'].replace('_', ' '))
        ly = Y(p['z']) + (p['rWell'] * s + 12 if p['id'] in ('P0', 'P1', 'P2') else -p['rWell'] * s - 28)
        if p['id'] in ('P7', 'P8'):
            ly = Y(p['z']) - p['rOut'] * s - 28
        pill_label(dr, X(p['x']), ly, lbl, fr, border=(110, 110, 115))

    for u in P['submerged']:
        north_u = u['id'] in ('U0', 'U1')
        uy = Y(u['z']) - u['rOut'] * s - 24 if north_u else Y(u['z']) + u['rOut'] * s + 8
        pill_label(dr, X(u['x']), uy,
                   '%s: %s' % (u['id'], u['modern']['state'].replace('_', ' ')),
                   fn, fg=(10, 65, 115), bg=(232, 246, 255), border=(80, 145, 195))

    for bcx, bcy, btxt, bcol in bridge_callouts:
        pill_label(dr, bcx, bcy, btxt, fr, fg=bcol, border=bcol)

    lx, ly = mx0 + mw + 28, my0
    col_w = W - lx - 32
    dr.text((lx, ly), 'Original -> Modern Hykkousoi Rule', font=fb, fill=(20, 20, 20))
    ly += 30
    for st_key, desc in [
        ('hyk_accreted', 'Hykkousoi Accreted: nacre barnacle-pods & shell balconies on lit rims'),
        ('garden_rainfed', 'Rain-Fed Groves: concave saucer roofs irrigate olive, citrus & sea-linen'),
        ('kept_dry', 'Kept Dry Fabric: ventilated bronze-foundry (P6), baths (P4), tide dish'),
        ('flooded_habitable', 'Flooded Habitable: underwater gill-folk sanctuary, gene-archive & larders'),
        ('salvage_ruin', 'Cut-Off Salvage Island (P8): collapsed bridge; mined by boat crews'),
        ('flooded_ruin', 'Flooded Deep Ruin (U6): silted OTEC turbines, bronze-barred')
    ]:
        dr.rectangle([lx, ly, lx + 22, ly + 20], fill=MOD_COL[st_key], outline=(30, 30, 30))
        for wln in B.wrap(dr, desc, fn, col_w - 34):
            dr.text((lx + 30, ly), wln, font=fn, fill=(25, 25, 25))
            ly += 19
        ly += 7

    ly += 12
    dr.text((lx, ly), 'Part-by-Part Adaptation Notes', font=fb, fill=(20, 20, 20))
    ly += 28
    for item in P['platforms'] + P['submerged'] + [P['towers'][0], P['towers'][7]]:
        dr.text((lx, ly), '%s — %s' % (item['id'], item['name']), font=fr, fill=(15, 20, 28))
        ly += 20
        for wln in B.wrap(dr, item['modern']['use'], fn, col_w - 12)[:3]:
            dr.text((lx + 10, ly), wln, font=fn, fill=(65, 72, 80))
            ly += 18
        ly += 7

    return img


def draw_axial_section_sheet(P, bathy):
    """West-to-East vertical cross-section along z = 0 (P7 -> P5 -> P0/T0/U0 -> P6/T6a/U6 -> P8), heights x2.4."""
    W, H = 2680, 1320
    img = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(img)
    ft, fs, fr, fn = font(38, True), font(20), font(16, True), font(15)

    dr.text((36, 16), 'Sheet N7: West-East Axial Section (z = 0, through P7 - P5 - P0/T0/U0 - P6/U6 - P8; vertical x2.4)', font=ft, fill=(18, 24, 32))
    dr.text((36, 64), 'Shows how clustered pylons root into the -21.5..-35 m coral shelf, carrying submerged pods below y = 0, stepped saucers at +12..+53 m, capsule columns to +192 m, and the +218 m Great Mushroom Spire.', font=fs, fill=(65, 72, 80))

    sx = 1.54
    sy = sx * 2.4
    ox = W * 0.5
    sea_y = 975
    X = lambda x: ox + x * sx
    Y = lambda y: sea_y - y * sy

    dr.rectangle([36, 112, W - 36, sea_y], fill=(238, 245, 252))
    dr.rectangle([36, sea_y, W - 36, H - 54], fill=(168, 214, 238))

    bed_poly = [(X(x), Y(y)) for x, y in bathy] + [(X(800), H - 54), (X(-800), H - 54)]
    dr.polygon(bed_poly, fill=(198, 184, 158), outline=(110, 95, 75))
    dr.line([(X(-800), sea_y), (X(800), sea_y)], fill=(15, 95, 175), width=4)

    by_id = {x['id']: x for x in P['platforms'] + P['submerged'] + P['towers']}

    # Ghost background tower T1a drawn FIRST so foreground labels and helix sit cleanly in front
    for tid, ghost in [('T1a', True), ('T5', False), ('T6a', False)]:
        t = by_id[tid]
        tx = t['x']
        rc, rd = t['rCore'], t['rDrum']
        outline = (155, 160, 168) if ghost else (35, 35, 40)
        core_fill = (232, 235, 240) if ghost else (196, 202, 208)
        drum_fill = (244, 236, 214) if ghost else ((240, 204, 135) if t['zone'] != 'work' else (188, 198, 210))
        dr.rectangle([X(tx - rc), Y(t['y1']), X(tx + rc), Y(t['y0'])], fill=core_fill, outline=outline, width=2)
        drum_h = t['stPerDrum'] * 3.6
        gap_h = 5.0
        for d_idx in range(t['drums']):
            dy0 = t['y0'] + 4.0 + d_idx * (drum_h + gap_h)
            dy1 = min(t['y1'], dy0 + drum_h)
            dr.rectangle([X(tx - rd), Y(dy1), X(tx + rd), Y(dy0)], fill=drum_fill, outline=outline, width=2)
        dr.line([(X(tx), Y(t['y1'])), (X(tx), Y(t['spireTop']))], fill=outline, width=3)
        if tid == 'T6a':
            dr.line([(X(tx - 24), Y(t['spireTop'])), (X(tx + 24), Y(t['spireTop']))], fill=(40, 40, 45), width=4)
        tag = '%s%s (+%.0fm)' % (tid, ' (NE ring behind)' if ghost else '', t['spireTop'])
        pill_label(dr, X(tx), Y(t['spireTop']) - 24, tag, fn,
                   fg=(100, 105, 112) if ghost else (20, 20, 20),
                   bg=(245, 248, 252) if ghost else (255, 255, 255))

    # Pylons
    for py in P['pylons']:
        if abs(py['z']) > 95:
            continue
        x0, x1 = X(py['x'] - py['r']), X(py['x'] + py['r'])
        dr.rectangle([x0, Y(py['y1']), x1, Y(py['y0'])], fill=(158, 162, 168), outline=(70, 72, 76))

    # Submerged Tube & Pods
    dr.rectangle([X(68), Y(-12.5), X(310), Y(-16.5)], fill=(120, 185, 215), outline=(30, 90, 130), width=2)
    for uid in ('U0', 'U6'):
        u = by_id[uid]
        col = (145, 206, 238) if uid == 'U0' else (150, 168, 184)
        dr.rounded_rectangle([X(u['x'] - u['rOut']), Y(u['y1']), X(u['x'] + u['rOut']), Y(u['y0'])],
                             radius=12, fill=col, outline=(20, 65, 105), width=3)

    # Axial Skybridges
    bridge_labels = []
    for x0, x1, y, broken, lbl in [
        (-567, -514, 18.0, False, 'B_5_7 viaducts (+18m)'),
        (-266, -152, 24.0, False, 'B_0_5 Spoke (+24m)'),
        (152, 270, 24.0, False, 'B_0_6 Spoke (+24m)'),
        (510, 565, 20.0, True, 'B_6_8 COLLAPSED')
    ]:
        if broken:
            dr.rectangle([X(x0), Y(y + 3), X(x0 + 16), Y(y)], fill=(185, 70, 60), outline=(60, 20, 20))
            dr.rectangle([X(x1 - 16), Y(y + 3), X(x1), Y(y)], fill=(185, 70, 60), outline=(60, 20, 20))
            dr.polygon([(X(x0 + 20), Y(-31)), (X(x0 + 42), Y(-27)), (X(x0 + 48), Y(-32))], fill=(140, 110, 100))
            bridge_labels.append(((X(x0) + X(x1)) / 2, Y(y + 22), lbl, (175, 30, 30)))
        else:
            dr.rectangle([X(x0), Y(y + 3.5), X(x1), Y(y)], fill=(232, 216, 178), outline=(45, 45, 45), width=2)
            bridge_labels.append(((X(x0) + X(x1)) / 2, Y(y - 9), lbl, (45, 45, 45)))

    # Axial Platforms P7, P5, P0, P6, P8
    for pid in ('P7', 'P5', 'P0', 'P6', 'P8'):
        p = by_id[pid]
        if p.get('baseRing'):
            br = p['baseRing']
            dr.rectangle([X(p['x'] - br['rOut']), Y(br['y1']), X(p['x'] + br['rOut']), Y(br['y0'])],
                         fill=(206, 212, 218), outline=(45, 50, 55), width=2)
        for k in range(p['st']):
            inset = k * 2.4
            yk0 = p['y0'] + k * 4.2
            yk1 = yk0 + 4.2
            c = ZONE_COL.get(p['zone'], (230, 225, 215))
            if pid == 'P8':
                c = (206, 146, 132)
            dr.rectangle([X(p['x'] - p['rOut'] + inset), Y(yk1), X(p['x'] + p['rOut'] - inset), Y(yk0)],
                         fill=c, outline=(45, 45, 45), width=1)
        dr.rectangle([X(p['x'] - p['rWell']), Y(p['y1']), X(p['x'] + p['rWell']), Y(p['y0'])],
                     outline=(40, 105, 160), width=2)

    # Cantilevered Satellite Dishes S0a / S0b
    for sx_c, sy0, sr, slbl in [(-142, 58.0, 40, 'S0a Spice Dish (+58m)'), (142, 62.0, 38, 'S0b Tide-Clock Dish (+62m)')]:
        dr.line([(X(sx_c * 0.62), Y(44)), (X(sx_c), Y(sy0))], fill=(120, 95, 65), width=5)
        dr.polygon([(X(sx_c - sr), Y(sy0 + 8)), (X(sx_c + sr), Y(sy0 + 8)),
                    (X(sx_c + sr * 0.72), Y(sy0)), (X(sx_c - sr * 0.72), Y(sy0))],
                   fill=(176, 224, 168), outline=(35, 45, 35))
        pill_label(dr, X(sx_c), Y(sy0 + 19), slbl, fn, fg=(25, 65, 25), border=(110, 155, 110))

    # Great Central Mushroom Tower T0
    t0 = by_id['T0']
    dr.polygon([(X(-44), Y(0)), (X(-26), Y(36)), (X(26), Y(36)), (X(44), Y(0))],
               fill=(218, 222, 226), outline=(40, 40, 40))
    dr.rectangle([X(-26), Y(158), X(26), Y(36)], fill=(226, 228, 232), outline=(35, 35, 40), width=2)
    for h_turn in range(52, 154, 26):
        dr.line([(X(-28), Y(h_turn)), (X(28), Y(h_turn + 14))], fill=(195, 105, 35), width=4)
        dr.line([(X(28), Y(h_turn + 14)), (X(-28), Y(h_turn + 26))], fill=(195, 105, 35), width=4)
    for pod in t0['stemPods']:
        dr.rounded_rectangle([X(-pod['r']), Y(pod['y'] + 7.2), X(pod['r']), Y(pod['y'])],
                             radius=6, fill=(238, 206, 145), outline=(40, 40, 40), width=2)
    dr.polygon([
        (X(-28), Y(150)), (X(-108), Y(164)), (X(-108), Y(174)),
        (X(-72), Y(188)), (X(72), Y(188)), (X(108), Y(174)), (X(108), Y(164)), (X(28), Y(150))
    ], fill=(244, 212, 148), outline=(30, 30, 30))
    dr.line([(X(-102), Y(162)), (X(102), Y(162))], fill=(235, 145, 35), width=4)
    dr.pieslice([X(-36), Y(198), X(36), Y(178)], 180, 360, fill=(246, 248, 250), outline=(30, 30, 30), width=2)
    dr.line([(X(0), Y(198)), (X(0), Y(218))], fill=(40, 40, 45), width=4)

    # Clean foreground callout pills (never obscured by geometry!)
    pill_label(dr, X(0), Y(226),
               'T0 Great Mushroom Cap (+158..+188m, R=108m; spire +218m): Sky-Villas, Archon Watch & Rain-Catchment Dome',
               fr, border=(140, 110, 60))
    pill_label(dr, X(-115), Y(116), 'HYK_T0_helix conch-stair (+48..+158m)', fn, fg=(165, 80, 20), border=(195, 120, 60))
    for pid, dy in [('P7', 26), ('P5', 26), ('P0', -10), ('P6', 26), ('P8', 26)]:
        p = by_id[pid]
        ly = Y(p['y1']) - dy if dy > 0 else Y(p['y0'] + 14)
        pill_label(dr, X(p['x']), ly, '%s (+%.0f..+%.0fm)' % (pid, p['y0'], p['y1']), fr, border=(90, 95, 100))

    for bx_c, by_c, blbl, bcol in bridge_labels:
        pill_label(dr, bx_c, by_c, blbl, fn, fg=bcol, border=bcol)

    pill_label(dr, X(0), Y(-14), 'U0 Submerged Gene-Scriptorium & Pearl Sanctuary (-19.5..-7.5m)', fn,
               fg=(10, 50, 90), bg=(226, 245, 255), border=(30, 95, 150))
    pill_label(dr, X(190), Y(-21), 'ST_0_6 subsea tube (-14.5m; breached)', fn,
               fg=(15, 70, 110), bg=(226, 245, 255), border=(80, 130, 170))
    pill_label(dr, X(390), Y(-18), 'U6 Flooded OTEC Vault (-24.5..-11.5m)', fn,
               fg=(25, 45, 65), bg=(228, 236, 244), border=(70, 95, 120))

    dr.text((X(-790), sea_y + 8), 'Mean Sea Level (y = 0 m)', font=fr, fill=(10, 75, 145))
    dr.text((X(-790), Y(-33) + 8), 'Carbonate Coral Seabed (-21.5 m shoal under P0 to -35 m outer channels)', font=fn, fill=(85, 70, 50))

    dr.line([(56, H - 24), (56 + 200 * sx, H - 24)], fill=(0, 0, 0), width=4)
    dr.text((56, H - 48), '200 m horizontal  (vertical exaggerated x2.4)', font=fr, fill=(0, 0, 0))
    for elev in (-30, -15, 0, 25, 50, 100, 150, 200):
        dr.line([(W - 58, Y(elev)), (W - 44, Y(elev))], fill=(100, 100, 100), width=2)
        dr.text((W - 110, Y(elev) - 8), '%+d m' % elev, font=fn, fill=(80, 80, 80))

    return img


def write_areas_md(P):
    st = P['stats']
    lines = [
        '# Tethis: Areas & Population Schedule (`AREAS.md`)\n',
        '*Generated by `plan/tethis_blueprint.py` from `8az0-tethis-plan.js`. Do not edit by hand.*\n',
        '## Summary\n',
        '| Metric | Value | Notes |',
        '|---|---|---|',
        '| Lattice Footprint | **%d x %d m** | 9 platforms (`HEX = %d m`), 4 satellite dishes, 10 towers, 4 submerged pods |' % (st['spanX'], st['spanZ'], P['dim']['HEX']),
        '| Vertical Envelope | **%.1f m to +%d m** | Submerged OTEC/benthic pods (`y < 0`) to `T0` Mushroom Spire (`+%d m`) |' % (st['minSubmergedY'], st['maxHeight'], st['maxHeight']),
        '| Total Built Floor | **%.1f ha** (%d m2) | Across all saucers, base rings, towers, satellites, and submerged pods |' % (st['totalFloor'] / 1e4, st['totalFloor']),
        '| **LIVE** (Daylight Lit) | **%.1f ha** | 100%% within %.0f m of sea rim, lagoon well, radial court, or capsule skin |' % (st['liveFloor'] / 1e4, P['dim']['LIT_DEPTH']),
        '| **WORK** (Industry/Harbour/Labs) | **%.1f ha** | Harbour quays, desalination stills, OTEC halls, foundries, benthic labs |' % (st['workFloor'] / 1e4),
        '| **RECREATION** (Indoor/Covered) | **%.1f ha** | Thalasso baths, amphitheatres, conservatories, banquet galleries |' % (st['recFloor'] / 1e4),
        '| **CIVIC** (Governance/Lore/Med) | **%.1f ha** | Hall of Tides, scriptorium, academy, clinic, tide-clock observatory |' % (st['civicFloor'] / 1e4),
        '| Open Rooftop Gardens | **%.1f ha** | Irrigated saucer orchards, mist beds, and mushroom-crown gardens |' % (st['gardenArea'] / 1e4),
        '| Sheltered Sea-Lagoons | **%.1f ha** | Calm annular harbour & diving wells inside `P0..P8` |' % (st['lagoonArea'] / 1e4),
        '| **Peak Ancient Population** | **%d** | At `%.0f m2` gross daylight-lit residential floor per resident |' % (st['peakPop'], P['dim']['M2_PER_PERSON']),
        '| **Modern Hykkousoi Population** | **%d** | ~5,120 on kept/accreted upper decks + ~1,300 gill-folk in wet/flooded halls |\n' % st['modernPop'],
        '## Volume-by-Volume Breakdown\n',
        '| ID | Name | Kind / Zone | Elev (m) | Floor (ha) | Live (ha) | Work (ha) | Rec+Civ (ha) | Garden (ha) | Modern Hykkousoi State |',
        '|---|---|---|---|---|---|---|---|---|---|'
    ]
    for grp in (P['platforms'], P['satellites'], P['towers'], P['submerged']):
        for v in grp:
            rc = (v['recFloor'] + v['civicFloor']) / 1e4
            lines.append('| `%s` | %s | %s | `%+.1f..%+.1f` | %.2f | %.2f | %.2f | %.2f | %.2f | `%s` |' % (
                v['id'], v['name'], v['zone'], v['y0'], v['y1'],
                v['floorArea'] / 1e4, v['litLiveFloor'] / 1e4, v['workFloor'] / 1e4, rc, v['gardenArea'] / 1e4,
                v['modern']['state']
            ))
    lines.append('')
    with open(os.path.join(HERE, 'AREAS.md'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(lines))


def main():
    os.makedirs(OUT, exist_ok=True)
    setup_extra_programs()
    P, bathy = load_layout()

    print('drawing N0_master_site.png')
    draw_master_site_sheet(P).save(os.path.join(OUT, 'N0_master_site.png'))

    floors = build_interior_sheets(P)
    B.main(
        floors=floors,
        out=OUT,
        here=HERE,
        title='# Tethis: Interior Programme & Furniture Manifest (`FURNITURE.md`)\n',
        intro=(
            'Generated by `plan/tethis_blueprint.py` via `settlements/voth/palace/blueprint.py` from the interior '
            'sheets (`N1`..`N5`). Keys combine preserved `ancients_*` fittings (`kits/catalog/krator-master-furniture.js`) '
            'with modern `hykkousoi_*` shell, nacre, and mariculture pieces (`krator-master-furniture-hykkousoi.js`), '
            'reflecting the Hykkousoi occupation of the arcology. Six marine-arcology pieces not yet in `kits/catalog` '
            'are listed under **NEW** at the end.\n'
        ),
        section=lambda: draw_axial_section_sheet(P, bathy),
        zone_R=9999
    )
    sec_default = os.path.join(OUT, 'section.png')
    sec_named = os.path.join(OUT, 'N7_axial_section.png')
    if os.path.exists(sec_default):
        os.replace(sec_default, sec_named)

    print('drawing N6_modern_hykkousoi.png')
    draw_modern_hykkousoi_sheet(P).save(os.path.join(OUT, 'N6_modern_hykkousoi.png'))

    write_areas_md(P)
    print('wrote AREAS.md, FURNITURE.md, and 8 sheets in', OUT)


if __name__ == '__main__':
    main()
