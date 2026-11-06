"""Yuni Wardrobe Kit (`yuni`) + Re-Homed Abyssal Sahelian Tiers (`abyssal`).

Implements the complete Yuni cultural wardrobe across male (`mpfb_male`) and female (`mpfb_female`) bodies:
1. `peasant` (Outback Stockman & Bush-Hand): Sun-bleached linen bush-shirt, moleskin/saddle-leather vest,
   red desert bandana, stockman trousers, elastic-sided stockman boots, and wide-brimmed Outback Cork-Hat / Akubra.
2. `trade` (Caravan Drover & Station Factor): Long oiled-cotton Outback Drover Duster Coat with shoulder weather-cape,
   corded riding trousers, gaitered drover boots, and Oilskin Akubra with brass desert dust-goggles.
3. `noble` & `emmo` (University Convocation Fellow & High Emmo / Emeritus): Oxbridge/UNIV. pleated academic gown
   over a Yuni-yellow waistcoat, draped with a Gaudi trencadis mosaic degree hood & liripipe stole and brass
   Chancellor's Chain of Office, paired with either a square Academic Mortarboard Trencher Cap (`noble`) or
   the Emeritus Hyperboloid Crown (`emmo`).
4. `trooper` (ANZAC-Style WWI Light-Horse Trooper): Butternut-and-tan 4-pocket WWI service tunic, Sam Browne
   cross-belt & curved 9-pouch leather ammo bandolier, aether-cell side canister, flared riding breeches,
   spiral wool puttees over ankle boots, and the iconic pinned-brim Australian Slouch Hat with marsh-emu plume.
5. `geomancer` (British-Explorer Alchemical Geomancer): Colonial khaki Norfolk safari jacket, bandolier of
   glowing `godteal` & `yuniyellow` alchemical phials, brass aether-compass, dorsal Ley-Line & Drill-Core
   Scanner Pack (`back` slot), expedition breeches, laced gaiter boots, and Solar Pith Helmet (*sola topee*)
   with flip-down brass optical loupe & telemetry aerial.
6. Re-homes and recolors Yuni's legacy Sahelian pieces (`boubou`, `wrapper`, `cone hat`, `kufi`, `gele`) to
   `abyssal` (`abyssal_m/f_peasant_*`, `abyssal_m/f_trade_*`) in Eastern Abyssal marsh-reed, teal, red-lacquer,
   and gold palettes.
"""
import math
import numpy as np

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, ring_points, smooth_push, assemble_garment
)
from ..paint import P, B, PN, C
from ..types.torso import torso_tube, collar, stand_collar, collar_disc, cape, band, pauldron
from ..types.limbs import limb_tube, sleeve, sleeves, trousers
from ..types.footwear import boots, sandal
from ..types.headgear import head_rings, brim, tower_hat, fan, crest, horn
from ..types.accoutrements import (
    flap, blob, pouch_belt, button_row, pendants, strap, tube, tassel, rosette
)


def _akubra_hat(gid, crown_paint, brim_paint, band_paint, corks=False, goggles=False, slouch_left=False):
    """Shared Australian Akubra / Bush-Hat / WWI Slouch-Hat builder with optional corks, goggles, or pinned left brim."""
    a, b, up, bk, left = head_frame()
    parts = []

    # Pinched cattleman / slouch felt crown (f=0.58 to 1.02)
    parts.append(head_rings(gid + '_crown', 0.58, 1.02, 0.022, crown_paint, n=36, rows=7, apex=True))
    # Hatband / puggaree (f=0.58 to 0.68)
    parts.append(head_rings(gid + '_band', 0.58, 0.69, 0.027, band_paint, n=36, rows=3))

    # Custom brim supporting classic Outback droop or WWI Slouch Hat left turn-up
    c = a + (b - a) * 0.60
    n_b, rows_b = 44, 6
    angles = np.linspace(0, 2 * math.pi, n_b, endpoint=False)
    inner = []
    for an in angles:
        d = bk * math.cos(an) + left * math.sin(an)
        h = first_hit(c, d) or 0.092
        inner.append((d, h + 0.018))

    width = 0.145 if not slouch_left else 0.140
    Q = []
    for k in range(rows_b):
        s = k / (rows_b - 1)
        row = []
        for (d, r), an in zip(inner, angles):
            # an = pi/2 is left side (`left`), an = 0 is back (`bk`), an = pi is front (`-bk`)
            left_ness = max(0.0, math.sin(an))
            front_back = abs(math.cos(an))
            if slouch_left and left_ness > 0.15:
                # Sharply turn up the left side of the brim against the crown!
                turn = (left_ness ** 1.6) * s
                rad = r + s * width * (1.0 - 0.58 * (left_ness ** 1.5) * s)
                dz = (0.095 * turn) - 0.018 * front_back * s * s * (1.0 - left_ness)
            else:
                rad = r + s * width
                # Outback bush curve: slight dip front & back, gentle curl at sides
                dz = -0.028 * (front_back ** 1.3) * s * s + 0.010 * (1.0 - front_back) * s * s
            row.append(c + d * rad + up * dz)
        Q.append(row)
    parts.append(Part(gid + '_brim', np.array(Q), True, ['body'] * rows_b, brim_paint, rigid_joint='Head'))

    if corks:
        # 8 dangling cork bobs on short strings around the outer brim edge (offset by half-step so none blocks nose/eyes)
        outer_ring = Q[-1]
        cork_p = P('ochre', 0.08, [B('top', 0.0, 0.25, 'solid', 'saddle')], fabric='leather.buckskin')
        cord_p = P('sand', 0.04)
        for ci in range(8):
            idx = int(((ci + 0.5) * n_b) / 8) % n_b
            pt_top = outer_ring[idx]
            pt_bot = pt_top - up * 0.048
            parts.append(strap(f'{gid}_cord{ci}', [pt_top, pt_bot], 0.004, cord_p, rigid_joint='Head'))
            parts.append(blob(f'{gid}_cork{ci}', pt_bot - up * 0.010, (0.016, 0.016, 0.024), cork_p, n=8, rows=5, rigid_joint='Head'))

    if goggles:
        # Brass-rimmed desert dust-goggles with glowing/tinted cyan-teal lenses resting on the front crown
        c_gog = a + (b - a) * 0.72
        brass_p = P('brass', 0.02, fabric='metal.bronze')
        lens_p = P('godteal', 0.02, [B('top', 0.0, 0.2, 'solid', 'white')], fabric='shell.nacre')
        for side_i, sx in enumerate((-0.036, 0.036)):
            d_g = -bk + left * (sx * 4.5)
            d_g /= np.linalg.norm(d_g)
            h_g = first_hit(c_gog, d_g) or 0.095
            pos = c_gog + d_g * (h_g + 0.032)
            parts.append(rosette(f'{gid}_gog_rim{side_i}', pos, d_g, left, 0.024, brass_p, n=12, thick=0.012, rigid_joint='Head'))
            parts.append(rosette(f'{gid}_gog_lens{side_i}', pos + d_g * 0.006, d_g, left, 0.017, lens_p, n=12, thick=0.008, rigid_joint='Head'))

    if slouch_left:
        # Brass Rising-Hyperboloid pin badge on the upturned left brim + sweeping Marsh-Emu feather plume
        c_pin = c + left * 0.115 + up * 0.055
        parts.append(rosette(gid + '_badge', c_pin, left, bk, 0.026,
                             P('brass', 0.02, [B('top', 0.0, 0.4, 'rays', 'yuniyellow', 'brass', 0.03)], fabric='metal.gold'),
                             n=12, thick=0.010, rigid_joint='Head'))
        plume_p = P('fur', 0.06, [
            B('top', 0.0, 0.35, 'feather', 'cream', 'fur', 0.03),
            B('bottom', 0.0, 0.20, 'solid', 'ochre'),
        ])
        parts.append(horn(gid + '_emu_plume', [
            c + left * 0.105 + up * 0.035 - bk * 0.01,
            c + left * 0.125 + up * 0.115 + bk * 0.02,
            c + left * 0.100 + up * 0.175 + bk * 0.08,
        ], 0.024, 0.006, plume_p, n=10, rows=10, rigid_joint='Head'))

    return parts


def _build_yuni_peasant(sex, body_id):
    """1. Outback Stockman & Bush-Hand (`yuni_m/f_peasant_*`)."""
    set_body(body_id)
    entries = []

    # --- TORSO: Sun-bleached bush-shirt + moleskin/leather stockman vest + red bandana + canteen belt ---
    gid_t = f'yuni_{sex}_peasant_bushshirt'
    parts_t = []
    vest_h = core.TOP - core.WAIST + 0.02
    shirt_p = P('cream', 0.05, [
        B('bottom', 0.0, 0.025, 'solid', 'khaki'),
        B('top', 0.0, 0.02, 'solid', 'sand'),
    ], [
        # Sleeveless saddle-leather & khaki stockman vest over the cream bush-shirt (armholes at u=0.17..0.33 & 0.67..0.83)
        PN(0.00, 0.17, 'quilt', 'khaki', 'saddle', 0.16, down=vest_h),
        PN(0.83, 1.00, 'quilt', 'khaki', 'saddle', 0.16, down=vest_h),
        PN(0.33, 0.45, 'quilt', 'khaki', 'saddle', 0.16, down=vest_h),
        PN(0.55, 0.67, 'quilt', 'khaki', 'saddle', 0.16, down=vest_h),
        PN(0.45, 0.47, 'solid', 'leather', 'saddle', 1.0, down=vest_h),
        PN(0.53, 0.55, 'solid', 'leather', 'saddle', 1.0, down=vest_h),
    ], fabric='cloth.cotton.coarse')
    sl_p = P('cream', 0.05, [
        B('bottom', 0.0, 0.08, 'stripes', 'sand', 'cream', 0.02),
        B('bottom', 0.0, 0.025, 'solid', 'khaki'),
    ], fabric='cloth.cotton.coarse')
    bandana_p = P('rustred', 0.04, [
        B('bottom', 0.0, 0.02, 'dots', 'cream', 'rustred', 0.03),
        B('top', 0.0, 0.015, 'solid', 'yuniyellow'),
    ])

    hem = core.CROTCH - 0.10 if sex == 'm' else core.CROTCH - 0.14
    shirt_tube = torso_tube(gid_t, core.TOP, hem, 0.014, shirt_p, hang_from=core.WAIST - 0.02, flare=0.06,
                            group_below=core.CROTCH + 0.02, hull_from=core.WAIST)
    shirt_tube.cloth = None
    parts_t.append(shirt_tube)
    parts_t.extend(sleeves(gid_t, 'elbow', 0.024, sl_p, ease_end=0.034, rows=6))
    parts_t.append(collar(gid_t + '_bandana', bandana_p, height=0.045, flare=0.016, ease=0.022))
    # Knotted bandana triangle at the throat
    parts_t.append(flap(gid_t + '_knot', chest_front(core.TOP - 0.01, 0.026), 0.09, 0.11, FRONT, bandana_p, cols=5, rows=6, ease=0.020))
    # Brass-buckled stockman pouch belt + round canvas water-canteen on left hip
    belt_p = P('leather', 0.05, [B('top', 0.0, 0.01, 'solid', 'brass'), B('bottom', 0.0, 0.01, 'solid', 'brass')],
               [PN(0.47, 0.53, 'solid', 'brass', 'leather', 1.0)])
    pouch_p = P('saddle', 0.06, [B('top', 0.0, 0.03, 'solid', 'brass')])
    parts_t.extend(pouch_belt(gid_t, belt_p, pouch_p, ease=0.034))
    c_hip = spine_at(core.WAIST - 0.05)
    d_cant = np.array([0.85, -0.45, 0.0])
    d_cant /= np.linalg.norm(d_cant)
    parts_t.append(rosette(gid_t + '_canteen', surface_out(c_hip, d_cant, 0.055), d_cant, FRONT, 0.058,
                           P('khaki', 0.05, [B('top', 0.0, 0.25, 'solid', 'brass')], fabric='cloth.oiled'),
                           n=14, thick=0.028, rigid_joint='Hips'))
    entries.append(assemble_garment(gid_t, 'Outback Bush-Shirt, Vest & Canteen', 'torso', 'yuni', parts_t))

    # --- LEGS: Moleskin stockman trousers ---
    gid_l = f'yuni_{sex}_peasant_trousers'
    trou_p = P('umber' if sex == 'm' else 'khaki', 0.06, [
        B('bottom', 0.0, 0.03, 'solid', 'saddle'),
        B('bottom', 0.03, 0.05, 'solid', 'ochre'),
    ], fabric='cloth.weave.twill')
    parts_l = trousers(gid_l, trou_p, ease=0.012, ease_end=0.022, cuff=core.ANKLE + 0.05)
    entries.append(assemble_garment(gid_l, 'Outback Moleskin Stockman Trousers', 'legs', 'yuni', parts_l, legged=True))

    # --- FEET: Elastic-sided Stockman Boots ---
    gid_f = f'yuni_{sex}_peasant_boots'
    boot_p = P('saddle', 0.04, [
        B('top', 0.0, 0.03, 'solid', 'ochre'),
    ], [
        PN(0.20, 0.30, 'solid', 'soot', 'saddle', 1.0),
        PN(0.70, 0.80, 'solid', 'soot', 'saddle', 1.0),
    ], fabric='leather.polished')
    parts_f = boots(gid_f, P('soot', 0.08), boot_p, top=0.36, ease_top=0.026)
    entries.append(assemble_garment(gid_f, 'Elastic-Sided Outback Stockman Boots', 'feet', 'yuni', parts_f))

    # --- HEAD: Outback Cork-Hat / Bush Akubra ---
    gid_h = f'yuni_{sex}_peasant_akubra'
    crown_p = P('sand', 0.06, fabric='cloth.felt')
    brim_p = P('sand', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'saddle')], fabric='cloth.felt')
    band_p = P('saddle', 0.04, [B('top', 0.0, 0.3, 'diamonds', 'yuniyellow', 'saddle', 0.035)], fabric='leather.polished')
    parts_h = _akubra_hat(gid_h, crown_p, brim_p, band_p, corks=True)
    entries.append(assemble_garment(gid_h, 'Outback Bush Akubra & Cork-Brim Hat', 'head', 'yuni', parts_h, covers_hair=True))
    return entries


def _build_yuni_trade(sex, body_id):
    """2. Caravan Drover & Station Factor (`yuni_m/f_trade_*`)."""
    set_body(body_id)
    entries = []

    # --- TORSO: Oiled-Cotton Outback Drover Duster Coat with Shoulder Weather-Cape ---
    gid_t = f'yuni_{sex}_trade_duster'
    parts_t = []
    duster_p = P('ochre' if sex == 'm' else 'dunesand', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'saddle'),
        B('bottom', 0.025, 0.065, 'fret', 'yuniyellow', 'saddle', 0.06),
        B('top', 0.0, 0.025, 'solid', 'leather'),
    ], [
        # Center waistcoat visible between open duster lapels (u=0.45..0.55)
        PN(0.45, 0.55, 'diamonds', 'yuniyellow', 'tileblue', 0.08, down=core.TOP - core.WAIST + 0.02),
        PN(0.43, 0.45, 'solid', 'saddle', 'ochre', 1.0),
        PN(0.55, 0.57, 'solid', 'saddle', 'ochre', 1.0),
    ], fabric='cloth.oiled')
    cape_p = P('saddle', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'yuniyellow'),
        B('top', 0.0, 0.02, 'solid', 'leather'),
    ], fabric='cloth.oiled')
    sl_p = P('ochre' if sex == 'm' else 'dunesand', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'saddle'),
        B('bottom', 0.04, 0.055, 'solid', 'yuniyellow'),
    ], fabric='cloth.oiled')

    duster_tube = torso_tube(gid_t, core.TOP, core.KNEE - 0.14, 0.018, duster_p, hang_from=core.WAIST - 0.02,
                             flare=0.09, group_below=core.CROTCH + 0.02, hull_from=core.WAIST)
    duster_tube.cloth = None
    parts_t.append(duster_tube)
    # Overlapping Drover's Shoulder Weather-Cape (radial pelerine cape over the shoulders and upper chest)
    sh_cape = collar_disc(gid_t + '_shoulder_cape', 0.165, cape_p, drop=0.135, rows=8, n=44, scallop=0.05, ease=0.036)
    sh_cape.cloth = None
    parts_t.append(sh_cape)
    parts_t.append(stand_collar(gid_t, P('leather', 0.04, [B('top', 0.0, 0.01, 'solid', 'yuniyellow')]), high=0.055))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.020, sl_p, ease_end=0.032, rows=9))
    parts_t.extend(button_row(gid_t, core.CHEST + 0.02, core.WAIST - 0.04, n_buttons=5, ease=0.026, double=True))
    # Cross-body leather factor's strap + waist belt
    strap_p = P('leather', 0.04, [B('top', 0.0, 0.01, 'solid', 'brass'), B('bottom', 0.0, 0.01, 'solid', 'brass')])
    parts_t.append(band(gid_t + '_satchel_strap', core.WAIST - 0.02, core.SHOULDER + 0.03, 0.045, 0.036, strap_p, high=math.pi / 2, rows=4))
    parts_t.extend(pouch_belt(gid_t, strap_p, P('saddle', 0.05, [B('top', 0.0, 0.02, 'solid', 'yuniyellow')]), ease=0.038))
    entries.append(assemble_garment(gid_t, 'Outback Drover Oilskin Duster & Shoulder-Cape', 'torso', 'yuni', parts_t))

    # --- LEGS: Corded Riding Trousers ---
    gid_l = f'yuni_{sex}_trade_trousers'
    trou_p = P('sand', 0.05, [B('bottom', 0.0, 0.025, 'solid', 'yuniyellow')], fabric='cloth.weave.twill')
    parts_l = trousers(gid_l, trou_p, ease=0.012, ease_end=0.020, cuff=core.ANKLE + 0.06)
    entries.append(assemble_garment(gid_l, 'Drover Corded Riding Trousers', 'legs', 'yuni', parts_l, legged=True))

    # --- FEET: Gaitered Drover Riding Boots ---
    gid_f = f'yuni_{sex}_trade_boots'
    parts_f = boots(gid_f, P('soot', 0.08),
                    P('leather', 0.04, [B('top', 0.0, 0.03, 'solid', 'brass')]),
                    top=0.52, ease_top=0.032,
                    cuff_paint=P('khaki', 0.05, [B('top', 0.0, 0.02, 'solid', 'yuniyellow')], fabric='cloth.oiled'))
    entries.append(assemble_garment(gid_f, 'Gaitered Drover Riding Boots', 'feet', 'yuni', parts_f))

    # --- HEAD: Drover's Oilskin Akubra with Brass Dust-Goggles ---
    gid_h = f'yuni_{sex}_trade_akubra'
    crown_p = P('saddle', 0.04, fabric='cloth.oiled')
    brim_p = P('saddle', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'yuniyellow')], fabric='cloth.oiled')
    band_p = P('tileblue', 0.03, [B('top', 0.0, 0.35, 'diamonds', 'yuniyellow', 'tileblue', 0.035)])
    parts_h = _akubra_hat(gid_h, crown_p, brim_p, band_p, corks=False, goggles=True)
    entries.append(assemble_garment(gid_h, 'Drover Oilskin Akubra & Brass Dust-Goggles', 'head', 'yuni', parts_h, covers_hair=True))
    return entries


def _build_yuni_noble(sex, body_id):
    """3. University Convocation Fellow & Emeritus Family (`yuni_m/f_noble_*`)."""
    set_body(body_id)
    entries = []

    # --- TORSO: Oxbridge / UNIV. Pleated Academic Gown + Gaudi Trencadis Degree Hood & Chancellor's Chain ---
    gid_t = f'yuni_{sex}_noble_gown'
    parts_t = []
    gown_p = P('indigo', 0.03, [
        B('bottom', 0.0, 0.025, 'solid', 'yuniyellow'),
        B('bottom', 0.025, 0.14, 'trencadis', 'tileblue', 'yuniyellow', 0.06),
        B('bottom', 0.14, 0.155, 'solid', 'tilegreen'),
        B('top', 0.0, 0.02, 'solid', 'yuniyellow'),
    ], [
        # Open front revealing rich Yuni-yellow bazin waistcoat/kirtle (u=0.45..0.55)
        PN(0.45, 0.55, 'diamonds', 'tileblue', 'yuniyellow', 0.09),
        # Gaudi trencadis academic velvet facings / liripipe stoles flanking the opening (u=0.39..0.45, 0.55..0.61)
        PN(0.39, 0.45, 'trencadis', 'coral', 'tileblue', 0.06),
        PN(0.55, 0.61, 'trencadis', 'coral', 'tileblue', 0.06),
    ], fabric='cloth.silk')
    hood_p = P('tileblue', 0.02, [
        B('top', 0.0, 0.45, 'trencadis', 'yuniyellow', 'tileblue', 0.045),
        B('bottom', 0.0, 0.02, 'solid', 'yuniyellow'),
    ], fabric='cloth.silk')
    sl_p = P('indigo', 0.03, [
        B('bottom', 0.0, 0.09, 'trencadis', 'violet', 'yuniyellow', 0.05),
        B('bottom', 0.09, 0.11, 'solid', 'tilegreen'),
    ], fabric='cloth.silk')
    cape_p = P('charcoal', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'yuniyellow'),
        B('bottom', 0.03, 0.16, 'trencadis', 'tilegreen', 'yuniyellow', 0.06),
    ], fabric='cloth.silk')

    gown_tube = torso_tube(gid_t, core.TOP, core.ANKLE + 0.04, 0.015, gown_p,
                           hang_from=core.WAIST - 0.02, hang_side=core.WAIST, flare=0.095,
                           group_below=core.CROTCH + 0.02, hull_from=core.WAIST)
    gown_tube.cloth = None
    parts_t.append(gown_tube)
    # Gaudi Trencadis Academic Degree Hood & Shoulder Epitoge
    deg_hood = collar_disc(gid_t + '_degree_hood', 0.125, hood_p, drop=0.052, scallop=0.04, ease=0.022)
    deg_hood.cloth = None
    parts_t.append(deg_hood)
    conv_cape = cape(gid_t + '_convocation_cape', core.KNEE - 0.06, cape_p, flare=0.14, span=1.10, ease=0.038, top=core.TOP - 0.02)
    conv_cape.cloth = None
    parts_t.append(conv_cape)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.075, rows=10))
    # Chancellor's Chain of Office + Golden Hyperboloid Medallion on chest
    gold_p = P('gold', 0.02, fabric='metal.gold')
    parts_t.append(rosette(gid_t + '_univ_medallion', chest_front(core.CHEST - 0.01, 0.028), FRONT, np.array([1.0, 0, 0]),
                           0.038, P('yuniyellow', 0.02, [B('top', 0.0, 0.4, 'trencadis', 'tileblue', 'yuniyellow', 0.03)], fabric='metal.gold'),
                           n=14, thick=0.012, rigid_joint='Spine2'))
    for k, ang in enumerate(np.linspace(-0.55, 0.55, 7)):
        z_link = core.CHEST + 0.02 + 0.045 * (ang ** 2 / 0.30)
        parts_t.append(blob(f'{gid_t}_chain{k}', chest_front(z_link, 0.025, x=ang * 0.16), (0.018, 0.010, 0.018), gold_p, n=8, rows=4, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_t, 'UNIV. Academic Convocation Gown & Trencadis Hood', 'torso', 'yuni', parts_t))

    # --- LEGS: Academic Court Trousers ---
    gid_l = f'yuni_{sex}_noble_trousers'
    trou_p = P('charcoal', 0.04, [
        B('bottom', 0.0, 0.03, 'trencadis', 'tileblue', 'yuniyellow', 0.04),
    ], fabric='cloth.silk')
    parts_l = trousers(gid_l, trou_p, ease=0.010, ease_end=0.018, cuff=core.ANKLE + 0.05)
    entries.append(assemble_garment(gid_l, 'Academic Convocation Trousers', 'legs', 'yuni', parts_l, legged=True))

    # --- FEET: Mosaic-Trimmed Chancellor's Shoes ---
    gid_f = f'yuni_{sex}_noble_slippers'
    parts_f = boots(gid_f, P('tileblue', 0.04),
                    P('violet', 0.03, [B('top', 0.0, 0.025, 'trencadis', 'yuniyellow', 'tileblue', 0.03)]),
                    top=0.10, ease_top=0.016)
    entries.append(assemble_garment(gid_f, 'Chancellor Mosaic Court Shoes', 'feet', 'yuni', parts_f))

    # --- HEAD 1: Academic Mortarboard Trencher Cap (`yuni_m/f_noble_mortarboard`) ---
    gid_h = f'yuni_{sex}_noble_mortarboard'
    a, b, up, bk, left = head_frame()
    parts_h = []
    cap_p = P('indigo', 0.03, [
        B('bottom', 0.0, 0.045, 'trencadis', 'yuniyellow', 'tileblue', 0.04),
    ], fabric='cloth.silk')
    parts_h.append(head_rings(gid_h + '_skullcap', 0.56, 0.94, 0.018, cap_p, n=36, rows=6, apex=True))

    # Flat square diamond-oriented academic mortarboard on top of the crown
    c_board = a + (b - a) * 0.94
    board_p = P('charcoal', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'yuniyellow'),
        B('top', 0.0, 0.03, 'trencadis', 'tileblue', 'yuniyellow', 0.04),
    ], fabric='cloth.velvet')
    n_sq, rows_sq = 40, 5
    angs_sq = np.linspace(0, 2 * math.pi, n_sq, endpoint=False)
    Q_sq = []
    half_side = 0.155
    for kr in range(rows_sq):
        s = 0.12 + 0.88 * (kr / (rows_sq - 1))
        row = []
        for an in angs_sq:
            # Square profile in polar coordinates (diamond-oriented: corners front, back, left, right)
            l1_norm = max(abs(math.cos(an)), abs(math.sin(an)), 0.707)
            r_sq = (half_side / l1_norm) * s
            d = bk * math.cos(an) + left * math.sin(an)
            row.append(c_board + d * r_sq + up * (0.008 * (1.0 - s)))
        Q_sq.append(row)
    parts_h.append(Part(gid_h + '_board', np.array(Q_sq), True, ['body'] * rows_sq, board_p, rigid_joint='Head'))
    # Central golden hyperboloid button + hanging Yuni-yellow silk tassel on the left edge
    parts_h.append(blob(gid_h + '_button', c_board + up * 0.014, (0.032, 0.032, 0.018),
                        P('yuniyellow', 0.02, fabric='metal.gold'), n=10, rows=4, rigid_joint='Head'))
    tassel_edge = c_board + left * (half_side * 0.92) - bk * 0.02
    parts_h.append(strap(gid_h + '_cord', [c_board + up * 0.012, tassel_edge], 0.006, P('yuniyellow', 0.02), rigid_joint='Head'))
    parts_h.append(tassel(gid_h + '_tassel', tassel_edge, 0.095, 0.014, P('yuniyellow', 0.02, [B('bottom', 0.0, 0.25, 'solid', 'tileblue')]), rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'UNIV. Academic Mortarboard Trencher Cap', 'head', 'yuni', parts_h, covers_hair=True))

    # --- HEAD 2: High Emmo / Emeritus Hyperboloid Crown (`yuni_m/f_noble_hyperboloid`) ---
    gid_hyp = f'yuni_{sex}_noble_hyperboloid'
    hyp_prof = lambda t: 0.62 + 1.25 * (t - 0.55) ** 2 + 0.12 * t
    hyp_p = P('yuniyellow', 0.02, [
        B('bottom', 0.0, 0.03, 'solid', 'tileblue'),
        B('bottom', 0.03, 0.14, 'trencadis', 'tileblue', 'yuniyellow', 0.05),
        B('top', 0.0, 0.025, 'solid', 'violet'),
        B('top', 0.025, 0.30, 'rays', 'yuniyellow', 'coral', 0.02),
    ])
    parts_hyp = [tower_hat(gid_hyp, 0.35 if sex == 'm' else 0.30, hyp_prof, hyp_p, rows=14)]
    entries.append(assemble_garment(gid_hyp, 'Emeritus Hyperboloid Crown of Yuni', 'head', 'yuni', parts_hyp, covers_hair=True))
    return entries


def _build_yuni_trooper(sex, body_id):
    """4. ANZAC-Style WWI Light-Horse Trooper (`yuni_m/f_trooper_*`)."""
    set_body(body_id)
    entries = []

    # --- TORSO: Butternut & Tan 4-Pocket WWI Service Tunic + Sam Browne Ammo Bandolier + Aether Canister ---
    gid_t = f'yuni_{sex}_trooper_tunic'
    parts_t = []
    tunic_p = P('ochre', 0.05, [
        B('top', 0.0, 0.025, 'solid', 'khaki'),
        B('bottom', 0.0, 0.025, 'solid', 'saddle'),
        B('bottom', 0.025, 0.045, 'solid', 'khaki'),
    ], [
        # Center button placket & 4 pleated service pockets in tan/khaki
        PN(0.48, 0.52, 'solid', 'khaki', 'ochre', 1.0),
        PN(0.37, 0.45, 'quilt', 'khaki', 'ochre', 0.14, down=core.TOP - core.WAIST - 0.01),
        PN(0.55, 0.63, 'quilt', 'khaki', 'ochre', 0.14, down=core.TOP - core.WAIST - 0.01),
    ], fabric='cloth.weave.twill')
    sl_p = P('ochre', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'khaki'),
        B('bottom', 0.04, 0.055, 'chevron', 'yuniyellow', 'saddle', 0.04),
    ], fabric='cloth.weave.twill')
    leather_p = P('saddle', 0.04, [
        B('top', 0.0, 0.012, 'solid', 'brass'),
        B('bottom', 0.0, 0.012, 'solid', 'brass'),
    ], fabric='leather.polished')
    ep_p = P('khaki', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'brass'),
        B('top', 0.0, 0.25, 'stripes', 'yuniyellow', 'khaki', 0.02),
    ], fabric='cloth.weave.twill')

    tunic_tube = torso_tube(gid_t, core.TOP, core.CROTCH - 0.08, 0.018, tunic_p,
                            hang_from=core.WAIST - 0.02, flare=0.07,
                            group_below=core.CROTCH + 0.02, hull_from=core.WAIST)
    tunic_tube.cloth = None
    parts_t.append(tunic_tube)
    parts_t.append(stand_collar(gid_t, P('khaki', 0.04, [B('top', 0.0, 0.01, 'solid', 'brass')]), high=0.05))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.020, sl_p, ease_end=0.024, rows=9))
    parts_t.append(pauldron(gid_t + '_epL', L, ep_p, reach=0.26, ease=0.036))
    parts_t.append(pauldron(gid_t + '_epR', R, ep_p, reach=0.26, ease=0.036))
    parts_t.extend(button_row(gid_t, core.TOP - 0.04, core.WAIST - 0.02, n_buttons=5, ease=0.025))
    # Sam Browne Cross-Belt + 5 3D Leather Ammo-Clip Pouches across the chest
    parts_t.append(band(gid_t + '_bandolier', core.WAIST - 0.01, core.SHOULDER + 0.035, 0.055, 0.030, leather_p, high=math.pi / 2, rows=4))
    pouch_p = P('saddle', 0.04, [B('top', 0.0, 0.25, 'solid', 'brass')], fabric='leather.polished')
    for kp, zp in enumerate(np.linspace(core.WAIST + 0.04, core.CHEST + 0.05, 5)):
        xp = -0.09 + 0.045 * kp
        parts_t.append(blob(f'{gid_t}_ammopouch{kp}', chest_front(zp, 0.038, x=xp), (0.036, 0.026, 0.054), pouch_p, n=10, rows=5, rigid_joint='Spine2'))
    # Waist belt + Science-Fantasy Brass & Godteal Aether-Cell Canister at right hip
    parts_t.extend(pouch_belt(gid_t, leather_p, pouch_p, ease=0.034))
    c_hip = spine_at(core.WAIST - 0.03)
    d_cell = np.array([-0.85, -0.45, 0.0])
    d_cell /= np.linalg.norm(d_cell)
    p_cell = surface_out(c_hip, d_cell, 0.052)
    parts_t.append(tube(gid_t + '_aethercell', [p_cell + np.array([0, 0, 0.055]), p_cell - np.array([0, 0, 0.055])],
                        0.028, P('godteal', 0.02, [B('top', 0.0, 0.22, 'solid', 'brass'), B('bottom', 0.0, 0.22, 'solid', 'brass')], fabric='metal.bronze'),
                        rigid_joint='Hips'))
    entries.append(assemble_garment(gid_t, 'Light-Horse Butternut Tunic & Ammo Bandolier', 'torso', 'yuni', parts_t))

    # --- LEGS: Tan Corded Riding Breeches (Jodhpurs) ---
    gid_l = f'yuni_{sex}_trooper_breeches'
    breech_p = P('khaki', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'saddle'),
    ], fabric='cloth.weave.twill')
    parts_l = trousers(gid_l, breech_p, ease=0.016, ease_end=0.014, cuff=core.ANKLE + 0.08)
    entries.append(assemble_garment(gid_l, 'Light-Horse Tan Riding Breeches', 'legs', 'yuni', parts_l, legged=True))

    # --- FEET: Ankle Boots & Spiral Wool Puttees ---
    gid_f = f'yuni_{sex}_trooper_puttees'
    puttee_p = P('drab', 0.06, [B('top', 0.0, 0.25, 'stripes', 'khaki', 'drab', 0.015)], fabric='cloth.wool')
    parts_f = boots(gid_f, P('soot', 0.08), P('saddle', 0.04, fabric='leather.polished'),
                    top=0.68, wraps=7, wrap_paint=puttee_p, ease_top=0.032, wrap_over=0.18)
    entries.append(assemble_garment(gid_f, 'Field Boots & Spiral Khaki Puttees', 'feet', 'yuni', parts_f))

    # --- HEAD: Pinned-Brim Australian WWI Slouch Hat with Marsh-Emu Plume ---
    gid_h = f'yuni_{sex}_trooper_slouch'
    crown_p = P('khaki', 0.05, fabric='cloth.felt')
    brim_p = P('khaki', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'ochre')], fabric='cloth.felt')
    puggaree_p = P('sand', 0.04, [B('top', 0.0, 0.5, 'stripes', 'ochre', 'sand', 0.015)], fabric='cloth.plain')
    parts_h = _akubra_hat(gid_h, crown_p, brim_p, puggaree_p, slouch_left=True)
    entries.append(assemble_garment(gid_h, 'Light-Horse Pinned Slouch Hat & Emu Plume', 'head', 'yuni', parts_h, covers_hair=True))
    return entries


def _build_yuni_geomancer(sex, body_id):
    """5. British-Explorer Alchemical Geomancer (`yuni_m/f_geomancer_*`)."""
    set_body(body_id)
    entries = []

    # --- TORSO: Colonial Khaki Safari Jacket + Alchemical Phial Bandolier & Brass Aether-Compass ---
    gid_t = f'yuni_{sex}_geomancer_coat'
    parts_t = []
    safari_p = P('sand', 0.04, [
        B('top', 0.0, 0.025, 'solid', 'leather'),
        B('bottom', 0.0, 0.03, 'solid', 'khaki'),
        B('bottom', 0.03, 0.06, 'circuit_schematic', 'yuniyellow', 'khaki', 0.06),
    ], [
        #Norfolk box-pleats & cravat
        PN(0.46, 0.54, 'solid', 'tileblue', 'yuniyellow', 1.0, down=0.12),
        PN(0.36, 0.41, 'solid', 'khaki', 'sand', 1.0),
        PN(0.59, 0.64, 'solid', 'khaki', 'sand', 1.0),
    ], fabric='cloth.weave.twill')
    sl_p = P('sand', 0.04, [
        B('bottom', 0.0, 0.045, 'solid', 'leather'),
        B('bottom', 0.045, 0.06, 'solid', 'brass'),
    ], fabric='cloth.weave.twill')
    patch_p = P('leather', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='leather.polished')
    band_p = P('leather', 0.04, [
        B('top', 0.0, 0.015, 'solid', 'brass'),
        B('bottom', 0.0, 0.015, 'solid', 'brass'),
    ], fabric='leather.polished')

    safari_tube = torso_tube(gid_t, core.TOP, core.CROTCH - 0.10, 0.018, safari_p,
                             hang_from=core.WAIST - 0.02, flare=0.08,
                             group_below=core.CROTCH + 0.02, hull_from=core.WAIST)
    safari_tube.cloth = None
    parts_t.append(safari_tube)
    parts_t.append(collar(gid_t + '_cravat', P('tileblue', 0.03, [B('top', 0.0, 0.02, 'solid', 'yuniyellow')]), height=0.048, flare=0.015, ease=0.022))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.020, sl_p, ease_end=0.026, rows=9))
    parts_t.append(pauldron(gid_t + '_patchL', L, patch_p, reach=0.32, ease=0.036))
    parts_t.append(pauldron(gid_t + '_patchR', R, patch_p, reach=0.32, ease=0.036))
    # Alchemical Bandolier with 6 Glowing `godteal` & `yuniyellow` Reagent Phials
    parts_t.append(band(gid_t + '_alch_band', core.WAIST - 0.01, core.SHOULDER + 0.035, 0.052, 0.030, band_p, high=-math.pi / 2, rows=4))
    phial_teal = P('godteal', 0.02, [B('top', 0.0, 0.25, 'solid', 'brass'), B('bottom', 0.0, 0.20, 'solid', 'brass')], fabric='shell.nacre')
    phial_gold = P('yuniyellow', 0.02, [B('top', 0.0, 0.25, 'solid', 'brass'), B('bottom', 0.0, 0.20, 'solid', 'brass')], fabric='metal.gold')
    for kv, zv in enumerate(np.linspace(core.WAIST + 0.04, core.CHEST + 0.06, 6)):
        xv = 0.095 - 0.038 * kv
        p_vial = chest_front(zv, 0.038, x=xv)
        parts_t.append(tube(f'{gid_t}_phial{kv}', [p_vial + np.array([0, 0, 0.028]), p_vial - np.array([0, 0, 0.028])],
                            0.013, phial_teal if kv % 2 == 0 else phial_gold, rigid_joint='Spine2'))
    # Waist belt + Brass Aether-Compass & Pressure Dial at front-left hip
    parts_t.extend(pouch_belt(gid_t, band_p, patch_p, ease=0.035))
    c_comp = chest_front(core.WAIST - 0.02, 0.048, x=0.085)
    parts_t.append(rosette(gid_t + '_aether_compass', c_comp, FRONT, np.array([1.0, 0, 0]), 0.038,
                           P('brass', 0.02, [B('top', 0.0, 0.35, 'rays', 'godteal', 'brass', 0.03)], fabric='metal.gold'),
                           n=14, thick=0.016, rigid_joint='Hips'))
    entries.append(assemble_garment(gid_t, 'Geomancer Norfolk Safari Coat & Alchemical Bandolier', 'torso', 'yuni', parts_t))

    # --- BACK: Geomancer's Ley-Line & Drill-Core Scanner Pack (`yuni_m/f_geomancer_pack`) ---
    gid_b = f'yuni_{sex}_geomancer_pack'
    parts_b = []
    BACK = np.array([0.0, 1.0, 0.0])
    c_pack = surface_out(spine_at(core.CHEST - 0.02), BACK, 0.065, bvh=core.BVH_T)
    frame_p = P('saddle', 0.05, [B('top', 0.0, 0.15, 'solid', 'brass'), B('bottom', 0.0, 0.15, 'solid', 'brass')], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_case', c_pack, (0.22, 0.11, 0.28), frame_p, n=16, rows=7, out=BACK, rigid_joint='Spine2'))
    # Twin glowing Alchemical Condenser Cylinders on left & right of pack
    cond_p = P('godteal', 0.02, [B('top', 0.0, 0.2, 'solid', 'brass'), B('bottom', 0.0, 0.2, 'solid', 'brass')], fabric='metal.bronze')
    for sc, sx in enumerate((-0.095, 0.095)):
        p_cyl = c_pack + np.array([sx, 0.02, 0.0])
        parts_b.append(tube(f'{gid_b}_condenser{sc}', [p_cyl + np.array([0, 0, 0.13]), p_cyl - np.array([0, 0, 0.13])], 0.032, cond_p, n=12, rigid_joint='Spine2'))
    # Rising Brass Telemetry Mast + Parabolic Scanner Dish above right shoulder
    mast_base = c_pack + np.array([-0.085, 0.02, 0.10])
    mast_top = mast_base + np.array([-0.035, 0.01, 0.34])
    brass_p = P('brass', 0.02, fabric='metal.gold')
    parts_b.append(tube(gid_b + '_mast', [mast_base, mast_top], 0.011, brass_p, n=8, rigid_joint='Spine2'))
    parts_b.append(rosette(gid_b + '_scanner_dish', mast_top, FRONT, np.array([1.0, 0, 0]), 0.068,
                           P('brass', 0.02, [B('top', 0.0, 0.4, 'rays', 'godteal', 'brass', 0.03)], fabric='metal.gold'),
                           n=16, thick=0.018, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_b, 'Geomancer Ley-Line & Alchemical Scanner Pack', 'back', 'yuni', parts_b))

    # --- LEGS: Expedition Breeches ---
    gid_l = f'yuni_{sex}_geomancer_breeches'
    parts_l = trousers(gid_l, P('khaki', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'leather')], fabric='cloth.weave.twill'),
                       ease=0.014, ease_end=0.018, cuff=core.ANKLE + 0.06)
    entries.append(assemble_garment(gid_l, 'Geomancer Expedition Breeches', 'legs', 'yuni', parts_l, legged=True))

    # --- FEET: Laced Explorer Field Boots ---
    gid_f = f'yuni_{sex}_geomancer_boots'
    parts_f = boots(gid_f, P('soot', 0.08),
                    P('leather', 0.04, [B('top', 0.0, 0.03, 'solid', 'brass')], fabric='leather.polished'),
                    top=0.56, ease_top=0.030,
                    cuff_paint=P('sand', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'brass')], fabric='cloth.weave.twill'))
    entries.append(assemble_garment(gid_f, 'Explorer Laced Field Boots & Gaiters', 'feet', 'yuni', parts_f))

    # --- HEAD: British-Explorer Solar Pith Helmet (*Sola Topee*) with Flip-Down Brass Optical Loupe ---
    gid_h = f'yuni_{sex}_geomancer_pith'
    a, b, up, bk, left = head_frame()
    parts_h = []
    pith_p = P('cream', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'khaki'),
        B('top', 0.0, 0.12, 'solid', 'brass'),
    ], fabric='cloth.plain')
    puggaree_p = P('khaki', 0.04, [
        B('top', 0.0, 0.4, 'stripes', 'yuniyellow', 'khaki', 0.02),
    ], fabric='cloth.plain')
    # Steeply domed pith-helmet shell + sloped safari brim + top brass ventilator finial
    parts_h.append(head_rings(gid_h + '_dome', 0.58, 1.04, 0.026, pith_p, n=36, rows=8, apex=True, scale=(1.08, 1.02)))
    parts_h.append(head_rings(gid_h + '_puggaree', 0.58, 0.69, 0.031, puggaree_p, n=36, rows=3, scale=(1.08, 1.02)))
    parts_h.append(brim(gid_h + '_brim', 0.59, 0.080, P('cream', 0.04, [B('bottom', 0.0, 0.025, 'solid', 'saddle')]),
                        ease=0.024, droop=0.018, rows=5, n=40))
    parts_h.append(horn(gid_h + '_finial', [b + up * 0.01, b + up * 0.065], 0.022, 0.008,
                        P('brass', 0.02, fabric='metal.gold'), n=10, rows=6, rigid_joint='Head'))
    # Flip-Down Multi-Lens Brass Optical Loupe & Spectroscope over the right eye + Side Telemetry Coil
    c_eye = a + (b - a) * 0.22 - bk * 0.105 - left * 0.035
    brass_p = P('brass', 0.02, fabric='metal.gold')
    lens_p = P('godteal', 0.02, [B('top', 0.0, 0.25, 'solid', 'white')], fabric='shell.nacre')
    parts_h.append(rosette(gid_h + '_loupe_housing', c_eye, -bk, left, 0.025, brass_p, n=12, thick=0.018, rigid_joint='Head'))
    parts_h.append(rosette(gid_h + '_loupe_lens', c_eye - bk * 0.011, -bk, left, 0.018, lens_p, n=12, thick=0.010, rigid_joint='Head'))
    parts_h.append(strap(gid_h + '_loupe_arm', [a + (b - a) * 0.56 - bk * 0.095 - left * 0.060, c_eye], 0.008, brass_p, rigid_joint='Head'))
    # Side copper telemetry aerial on right temple
    c_ant = a + (b - a) * 0.62 - left * 0.105
    parts_h.append(horn(gid_h + '_aerial', [c_ant, c_ant + up * 0.14 - left * 0.015], 0.010, 0.003,
                        P('copper', 0.02, [B('top', 0.0, 0.3, 'solid', 'godteal')], fabric='metal.bronze'),
                        n=8, rows=8, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Geomancer Solar Pith Helmet & Optical Loupe', 'head', 'yuni', parts_h, covers_hair=True))
    return entries


def _build_rehomed_abyssal(sex, body_id):
    """Re-homed & recolored legacy Sahelian pieces -> Eastern Abyssal (`abyssal_m/f_peasant_*`, `abyssal_m/f_trade_*`)."""
    set_body(body_id)
    entries = []

    # 1. Abyssal Peasant (Marsh-Stilt Weaver): Recolored boubou/blouse, trousers/wrapper, sandals, cone-hat/wrap
    # in Eastern Abyssal teal, red-lacquer (`holyred`), ochre, and pastel cream with step-fret & star borders
    gid_pt = f'abyssal_{sex}_peasant_boubou'
    marsh_cloth = P('teal', 0.05, [
        B('bottom', 0.0, 0.015, 'solid', 'gold'),
        B('bottom', 0.018, 0.08, 'bogolan', 'cream', 'holyred', 0.06),
        B('top', 0.0, 0.015, 'solid', 'gold'),
        B('top', 0.03, 0.09, 'steps', 'gold', 'teal', 0.06),
    ])
    hem = core.CROTCH - 0.16 if sex == 'm' else core.HIPS[2] - 0.06
    p_boubou = torso_tube(gid_pt, core.TOP, hem, 0.016, marsh_cloth, hang_from=core.WAIST - 0.02, hang_side=core.WAIST,
                          flare=0.07, group_below=core.CROTCH + 0.02, hull_from=core.WAIST)
    p_boubou.cloth = None
    parts_pt = [p_boubou] + \
               sleeves(gid_pt, 'elbow', 0.024, P('teal', 0.05, [B('bottom', 0.0, 0.035, 'steps', 'gold', 'holyred', 0.04)]), ease_end=0.05, rows=6)
    entries.append(assemble_garment(gid_pt, 'Abyssal Marsh-Weaver Boubou' if sex == 'm' else 'Abyssal Marsh-Weaver Blouse',
                                    'torso', 'abyssal', parts_pt))

    if sex == 'm':
        gid_pl = 'abyssal_m_peasant_trousers'
        parts_pl = trousers(gid_pl, P('cream', 0.05, [B('bottom', 0.0, 0.025, 'solid', 'holyred')]),
                            ease=0.008, ease_end=0.034, cuff=core.ANKLE + 0.04)
        entries.append(assemble_garment(gid_pl, 'Abyssal Marsh Trousers', 'legs', 'abyssal', parts_pl, legged=True))
    else:
        gid_pl = 'abyssal_f_peasant_wrapper'
        wrap_p = P('holyred', 0.05, [
            B('top', 0.0, 0.03, 'solid', 'gold'),
            B('bottom', 0.0, 0.02, 'solid', 'gold'),
            B('bottom', 0.025, 0.12, 'bogolan', 'cream', 'teal', 0.07),
        ])
        w_tube = torso_tube(gid_pl, core.WAIST + 0.01, core.ANKLE + 0.06, 0.008, wrap_p,
                            hang_from=core.WAIST - 0.02, flare=0.08, group_below=core.CROTCH + 0.04, rows=22, hull_from=core.WAIST)
        w_tube.cloth = None
        parts_pl = [w_tube]
        entries.append(assemble_garment(gid_pl, 'Abyssal Lacquer-Red & Teal Wrapper', 'legs', 'abyssal', parts_pl, legged=False))

    gid_pf = f'abyssal_{sex}_sandals'
    entries.append(assemble_garment(gid_pf, 'Abyssal Delta Sandals', 'feet', 'abyssal',
                                    sandal(gid_pf, P('umber', 0.08), P('teal', 0.05))))

    if sex == 'm':
        gid_ph = 'abyssal_m_peasant_hat'
        parts_ph = [
            brim(gid_ph, 0.74, 0.20, P('sand', 0.07, [
                B('top', 0.0, 0.3, 'rays', 'teal', 'sand', 0.025),
                B('bottom', 0.0, 0.018, 'solid', 'holyred'),
            ], fabric='straw.plaited'), droop=0.06, rows=6, n=40, ease=0.012),
            head_rings(gid_ph + '_crown', 0.74, 1.0, 0.016, P('holyred', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'gold')]), n=32, rows=5, apex=True),
            horn(gid_ph + '_tip', [J('Head', 'tail'), J('Head', 'tail') + np.array([0, 0, 0.17])], 0.05, 0.006,
                 P('gold', 0.03, [B('top', 0.0, 0.3, 'stripes', 'holyred', 'gold', 0.0)], fabric='metal.gold'), n=16, rows=6),
        ]
        entries.append(assemble_garment(gid_ph, 'Abyssal Gilded-Tip Reed Cone Hat', 'head', 'abyssal', parts_ph, covers_hair=True))
    else:
        gid_ph = 'abyssal_f_peasant_wrap'
        parts_ph = [head_rings(gid_ph, 0.50, 1.0, 0.03, P('godteal', 0.04, [B('bottom', 0.0, 0.025, 'solid', 'holyred')]), n=32, rows=8, apex=True)]
        entries.append(assemble_garment(gid_ph, 'Abyssal Teal & Lacquer Head-Wrap', 'head', 'abyssal', parts_ph, covers_hair=True))

    # 2. Abyssal Trade (Salt-Delta Factor): Layered Teal & Indigo Grand Boubou with Hammered Gold Disc Pectoral & Tall Red Fez
    gid_tt = f'abyssal_{sex}_trade_boubou'
    base_c = 'peacock' if sex == 'm' else 'coral'
    bou_p = P(base_c, 0.03, [
        B('top', 0.0, 0.025, 'solid', 'gold'),
        B('top', 0.03, 0.14, 'fret', 'gold', 'teal', 0.06),
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.03, 0.11, 'fret', 'gold', base_c, 0.06),
    ], [
        # Deep indigo/navy center-front inner tunic panel & diagonal teal/emerald layered boubou wrap
        PN(0.40, 0.56, 'fluted', 'indigo', 'charcoal', 0.09),
        PN(0.35, 0.41, 'fret', 'gold', 'godteal', 0.06),
        PN(0.55, 0.62, 'diamonds', 'gold', 'teal', 0.06),
    ], fabric='cloth.bazin')
    bou_sl_p = P(base_c, 0.03, [
        B('bottom', 0.0, 0.02, 'solid', 'gold'),
        B('bottom', 0.025, 0.085, 'fret', 'gold', 'godteal', 0.05),
    ], fabric='cloth.bazin')
    t_boubou = torso_tube(gid_tt, core.TOP + 0.005, core.ANKLE + 0.10, 0.020, bou_p, n=48,
                          hang_from=core.WAIST - 0.02, hang_side=core.WAIST, flare=0.075,
                          group_below=core.CROTCH + 0.02, hull_from=core.WAIST)
    t_boubou.cloth = None
    parts_tt = [
        t_boubou,
        sleeve(gid_tt + '_under_L', L, P('indigo', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'gold')]), f0=0.42, f1=0.92, ease=0.014, flare=0.006, rows=6),
        sleeve(gid_tt + '_under_R', R, P('indigo', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'gold')]), f0=0.42, f1=0.92, ease=0.014, flare=0.006, rows=6),
    ] + sleeves(gid_tt, 'elbow', 0.026, bou_sl_p, ease_end=0.065, rows=7)
    # Cluster of 5 hammered gold disc pectorals & hanging gold rods across the upper chest (matching ref image!)
    gold_m = P('gold', 0.02, [B('top', 0.0, 0.25, 'solid', 'brass')], fabric='metal.gold')
    for kd, (xd, zd, rd) in enumerate(((-0.065, 0.02, 0.026), (-0.032, -0.005, 0.030), (0.0, -0.018, 0.034), (0.032, -0.005, 0.030), (0.065, 0.02, 0.026))):
        c_disc = chest_front(core.CHEST + zd, 0.032, x=xd)
        parts_tt.append(rosette(f'{gid_tt}_gold_disc_{kd}', c_disc, FRONT, np.array([1.0, 0, 0]), rd, gold_m, n=12, thick=0.009, rigid_joint='Spine2'))
        parts_tt.append(tassel(f'{gid_tt}_gold_rod_{kd}', c_disc - np.array([0.0, 0.0, rd * 0.85]), 0.055 + 0.015 * (2 - abs(kd - 2)), 0.005, gold_m, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_tt, 'Abyssal Salt-Factor Grand Boubou & Gold Disc Pectoral', 'torso', 'abyssal', parts_tt))

    gid_tl = f'abyssal_{sex}_trade_trousers'
    entries.append(assemble_garment(gid_tl, 'Abyssal Factor Under-Trousers', 'legs', 'abyssal',
                                    trousers(gid_tl, P('indigo', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'gold')]),
                                             ease=0.008, ease_end=0.026, cuff=core.ANKLE + 0.04), legged=True))

    gid_tf = f'abyssal_{sex}_trade_slippers'
    entries.append(assemble_garment(gid_tf, 'Abyssal Factor Babouches', 'feet', 'abyssal',
                                    boots(gid_tf, P('ochre', 0.06), P('holyred', 0.04, [B('top', 0.0, 0.018, 'solid', 'gold')]),
                                          top=0.06, ease_top=0.014)))

    if sex == 'm':
        gid_th = 'abyssal_m_trade_kufi'
        kufi_p = P('holyred', 0.03, [
            B('bottom', 0.0, 0.028, 'solid', 'gold'),
            B('bottom', 0.028, 0.075, 'diamonds', 'gold', 'holyred', 0.045),
            B('top', 0.0, 0.022, 'solid', 'gold'),
        ], [
            PN(0.44, 0.56, 'chevron', 'gold', 'holyred', 0.08),
        ])
        parts_th = [tower_hat(gid_th, 0.165, lambda s: 1.02 - 0.08 * s, kufi_p, f=0.52, ease=0.016, rows=9, n=36)]
        entries.append(assemble_garment(gid_th, 'Abyssal Tall Crimson & Gold Fez-Kufi', 'head', 'abyssal', parts_th, covers_hair=True))
    else:
        gid_th = 'abyssal_f_trade_gele'
        g = fan(gid_th + '_fan', 0.05, 0.24, 1.2, P('coral', 0.03, [
            B('top', 0.0, 0.5, 'stripes', 'gold', 'coral', 0.0),
            B('bottom', 0.0, 0.03, 'solid', 'godteal'),
        ]), rows=6, cols=15, tilt=0.05, back=0.03, curl=0.06)
        g.cloth = None
        parts_th = [head_rings(gid_th, 0.50, 1.0, 0.03, P('coral', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'gold')]), n=32, rows=8, apex=True), g]
        entries.append(assemble_garment(gid_th, 'Abyssal Factor Fan-Gele', 'head', 'abyssal', parts_th, covers_hair=True))

    return entries


def build_yuni_kit():
    """Build all Yuni male & female tiers plus re-homed Abyssal Sahelian tiers."""
    entries = []
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        entries.extend(_build_yuni_peasant(sex, body_id))
        entries.extend(_build_yuni_trade(sex, body_id))
        entries.extend(_build_yuni_noble(sex, body_id))
        entries.extend(_build_yuni_trooper(sex, body_id))
        entries.extend(_build_yuni_geomancer(sex, body_id))
        entries.extend(_build_rehomed_abyssal(sex, body_id))
    set_body('mpfb_male')
    return entries
