"""The Sultanate of Xanadu Wardrobe Kit (`xanadu`).

Implements the complete cultural wardrobe of the Sultanate of Xanadu (Erewhon, Pearl of Xanadu)
across male (`mpfb_male`) and female (`mpfb_female`) bodies (complementing the base `town` and
`rich` sets in `tools/make_garments.py`):
1. `town` addition (`xan_f_town_cap`): Embroidered Tibetan/Palopó felt pillbox cap completing
   the female townsfolk outfit.
2. `guild` (Goldsmith, Spicer & Alchemist Guildmaster / Palopó Bazaar Factor): Lapis-and-turquoise
   Persian/Turkish *qaba* coat with `xanadu_mosaic` star-tile front panels, Andean *cholet* stepped
   trim, maroon *penbey* sash with Gold Sun-and-Moon seal, and brass Assay & Spice-Scale bandolier;
   dorsal Gilded Assay Strongbox, Copper Alchemical Retort & Spice-Ledger pack (`back` slot);
   Palopó-cuffed *shalwar* trousers; upturned bazaar boots; and Astrakhan *kulah* hat with brass
   assay-balance badge.
3. `magnate` (Grand Karavan-Bashi & Master of Mines — Sable Pelisse Magnate): Floor-length plush
   sable-fur pelisse coat over a deep-green silk tunic and crimson-gold brocade skirt, adorned with
   dual 3D gold chains and a scalloped solid-gold pectoral medallion; gilded crimson Morocco-leather
   riding boots; and gold-embroidered crimson silk *kufi* skullcap with 3D wool pom-pom.
4. `priest` (Temple Grammarian & Kora Wheel-Priest — Ortaköy & Grand Temple Clergy): Layered
   Tibetan-Persian sanctum vestment in maroon (`omaroon`/`holyred`) and saffron (`saffron`/`kesar`)
   with a maroon *penbey* chest band studded with 3D Gold Dharma Wheels, a central apron printed
   with the **Tocharian Sound-Grid Syllabary & Eight-Spoked Wheel** (`tocharian_wheel`), gilded
   roof-horn shoulder mantles, and a **3D Handheld Gilded Prayer Wheel (*Mani Khorlo*)** at the
   right hip; sanctum felt boots; and a **Gilded Five-Leaf Kora Crown & Turquoise Dome Mitre**.
5. `pleasure` (Pleasure-Dome Courtesan, Musician & Valide's Courtier — Topkapı Harem & Hall of
   Feasts): Opulent Ottoman-Persian *entari* / feast caftan in iridescent peacock-turquoise,
   royal violet, and spun gold with a Persian mosaic center panel (`xanadu_mosaic`), jewelled
   harem-lattice girdle with hanging gold coins, and draped silk sleeves; voluminous silk harem
   *şalvar* trousers; and a **Pleasure-Dome Gilded Hotoz / Feasting Taj** with *sorguç* plume
   and pearl-and-gold temple chains.
6. `vizier` (Grand Vizier, Divan Chancellor & Sultan's Court Sovereign): Monumental floor-length
   Safavid/Ottoman imperial *khalat* state caftan in spun gold, royal lapis, and maroon woven with
   the **Sun-and-Moon Roundel & Eight-Spoked Wheel** (`xanadu_sun_wheel`), flared gilt-roof
   shoulder epaulettes, a 3D Chancellor's Chain of State Seals, and a Jade-and-Gold Divan Ledger
   case; curled lapis-and-gold court shoes; and the towering **Imperial *Kallavi* / *Taj-i-Xanadu*
   Turban-Crown** with blazing Sun-and-Moon ruby aigrette.
7. `askari` (Dzong Citadel Guard & Askari Mirror-Infantry): Crimson-and-lapis diamond-quilted
   *alkhalig* gambeson overlaid with 3D steel-and-gold **Four-Mirror (*Chahar-Aina*)** armor plates
   (`chahar_aina`), gilded laminar *bazuband* bracers, and Tibetan dzong pauldrons; lapis military
   breeches; gilded steel & crimson felt greaves; and a **Gold-Damascened *Kulah-Khud* Spired Helm**
   with sliding nasal bar, twin plumes, and scale *aventail*.
8. `icewarden` (Warden of the Caves of Ice & High-Pass Stalker-Hunter): High-altitude Himalayan
   yak-fur and frost-turquoise coat armored with gold-laced Tibetan lamellar (*byang bu*) and a
   glowing **3D Blue Ice-Crystal / Salvaged Stalker-Core Talisman** from the sacred river Alph's
   source; dorsal **Gilded *Dhal* Buckler, Quiver & Ice-Axe Pack** (`back` slot); quilted mountain
   trousers; cramponed yak-fur boots; and a **Himalayan Fur-Eared Helm with Glacier-Gem Brow**.
"""
import math
import numpy as np

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, ring_points, smooth_push, assemble_garment
)
from ..paint import P, B, PN, C, COTTON, WOOL
from ..types.torso import (
    torso_tube, collar, stand_collar, collar_disc, cape, band, crossed_sash, pauldron
)
from ..types.limbs import limb_tube, sleeve, sleeves, trousers
from ..types.footwear import boots, sandal
from ..types.headgear import (
    head_rings, sculpted_faceplate, sculpted_cranium, hood, brim,
    tower_hat, crown_band, crest, horn
)
from ..types.accoutrements import (
    flap, blob, pouch_belt, button_row, pendants, strap, tube, tassel, rosette
)


# ===============================================================================================================
# 1. TOWN ADDITION: Female Townsfolk Embroidered Tibetan / Palopó Pillbox Cap (`xan_f_town_cap`)
# ===============================================================================================================
def _build_f_town_cap():
    set_body('mpfb_female')
    gid = 'xan_f_town_cap'
    parts = []
    cap_paint = P('lacrose', 0.04, [
        B('bottom', 0.0, 0.015, 'solid', 'gold'),
        B('bottom', 0.015, 0.042, 'diamonds', 'kesar', 'peacock', 0.04),
        B('top', 0.0, 0.015, 'stripes', 'gold', 'peacock', 0.02),
    ], fabric=WOOL)
    parts.append(head_rings(gid + '_crown', 0.58, 1.0, 0.014, cap_paint, n=32, rows=6, apex=True))
    # Upturned fur-and-brocade front cuff (Tibetan gokhar style)
    cuff_paint = P('peacock', 0.04, [
        B('top', 0.0, 0.008, 'solid', 'gold'),
        B('bottom', 0.0, 0.008, 'solid', 'gold'),
    ], [
        PN(0.35, 0.65, 'diamonds', 'gold', 'kesar', 0.035),
    ], fabric='cloth.silk')
    parts.append(crown_band(gid + '_cuff', cuff_paint, f0=0.54, f1=0.72, ease=0.018, flare=0.006, n=32))
    return [assemble_garment(gid, 'Townsfolk Embroidered Pillbox Cap', 'head', 'xanadu', parts,
                             covers_hair=False, covers_face=False)]


# ===============================================================================================================
# 2. GUILD: Six Great Guilds & Palopó Bazaar Factor (Goldsmith, Spicer, Alchemist, Miner, Mason & Farmer)
# ===============================================================================================================
def _build_guild_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Guildmaster's Astrakhan Kulah & Mosaic Band (`xan_m/f_guild_hat`) ---
    gid_h = f'xan_{sex}_guild_hat'
    parts_h = []
    kulah_paint = P('darkfur', 0.09, [
        B('top', 0.0, 0.022, 'stripes', 'gold', 'kesar', 0.03),
    ], fabric='fur.astrakhan')
    parts_h.append(tower_hat(gid_h + '_kulah', 0.165, lambda s: 0.96 + 0.14 * math.sin(s * math.pi * 0.82),
                             kulah_paint, f=0.50, ease=0.022, rows=10, n=36))
    # 3D Wrapped Persian Mosaic Silk Band around the base of the Astrakhan Kulah
    mband_paint = P('mongolblue', 0.03, [
        B('top', 0.0, 0.008, 'solid', 'gold'),
        B('bottom', 0.0, 0.008, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'xanadu_mosaic', 'turq', 'mongolblue', 0.10),
    ], fabric='cloth.silk')
    parts_h.append(crown_band(gid_h + '_mosaic_band', mband_paint, f0=0.48, f1=0.76, ease=0.025, flare=0.008, rows=6, n=36))

    # Gold Sun-and-Moon & Assay-Scale Guild Badge on front of the kulah
    c_brow = a + (b - a) * 0.62
    h_brow = first_hit(c_brow, -bk) or 0.102
    badge_c = c_brow - bk * (h_brow + 0.036)
    parts_h.append(rosette(gid_h + '_badge', badge_c, -bk, up, 0.028,
                           P('gold', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'turq')], fabric='metal.gold'),
                           n=12, thick=0.010, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Guildmaster Astrakhan Kulah & Mosaic Band', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Goldsmith, Spicer & Alchemist Qaba Coat & Assay Bandolier (`xan_m/f_guild_coat`) ---
    gid_t = f'xan_{sex}_guild_coat'
    parts_t = []
    qaba_paint = P('mongolblue', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.085, 'steps', 'kesar', 'turq', 0.05),
        B('bottom', 0.085, 0.120, 'diamonds', 'gold', 'lacrose', 0.045),
    ], [
        # Center-front Persian star-mosaic & gold-trimmed lapel opening
        PN(0.39, 0.42, 'stripes', 'gold', 'kesar', 0.025),
        PN(0.58, 0.61, 'stripes', 'gold', 'kesar', 0.025),
        PN(0.42, 0.58, 'xanadu_mosaic', 'turq', 'mongolblue', 0.18),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_qaba', TOP, KNEE + 0.04, 0.015, qaba_paint,
                              n=44, rows=20, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Carved Cholet-colored standing collar
    parts_t.append(stand_collar(gid_t,
                                P('turq', 0.03, [B('top', 0.0, 0.012, 'solid', 'gold'),
                                                 B('bottom', 0.0, 0.012, 'solid', 'kesar')], fabric='cloth.silk'),
                                high=0.048))

    # Maroon Penbey twig-band waist sash with Gold Sun-and-Moon Guild Seal
    sash_paint = P('maroon', 0.05, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
        B('bottom', 0.0, 0.012, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'diamonds', 'gold', 'maroon', 0.04),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.045, WAIST - 0.040, 0.026, sash_paint,
                              rows=5, n=40, hull_from=WAIST + 0.08))

    p_seal = chest_front(WAIST + 0.005, 0.040, x=0.0)
    parts_t.append(rosette(gid_t + '_seal', p_seal, FRONT, np.array([1.0, 0.0, 0.0]), 0.038,
                           P('gold', 0.02, [B('bottom', 0.0, 0.01, 'solid', 'turq')], fabric='metal.gold'),
                           n=12, thick=0.012, rigid_joint='Spine1'))

    # Diagonal Leather & Brass Assay/Alchemist Bandolier with Spice/Acid Phials & Gold Bullion Ingots
    parts_t.append(crossed_sash(gid_t + '_bandolier',
                                P('leather', 0.06, [B('top', 0.0, 0.008, 'solid', 'gold'),
                                                    B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric='leather.polished'),
                                width=0.048, ease=0.030))
    for idx, (z_f, x_off, col_phial) in enumerate([
        (CHEST + 0.03, -0.065, 'turq'),
        (CHEST - 0.01, -0.020, 'saffron'),
        (CHEST - 0.05,  0.025, 'lacrose'),
        (WAIST + 0.06,  0.068, 'gold'),
    ]):
        p_ph = chest_front(z_f, 0.038, x=x_off)
        parts_t.append(tube(f'{gid_t}_phial_{idx}',
                            [p_ph - np.array([0.0, 0.0, 0.026]), p_ph + np.array([0.0, 0.0, 0.026])],
                            0.013,
                            P(col_phial, 0.02, [B('top', 0.0, 0.012, 'solid', 'gold'),
                                                B('bottom', 0.0, 0.010, 'solid', 'gold')], fabric='metal.gold'),
                            n=10, rigid_joint='Spine2'))

    # Sleeves with Palopó turquoise-and-gold cuffs
    sl_paint = P('mongolblue', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.085, 'xanadu_mosaic', 'turq', 'mongolblue', 0.04),
    ], fabric='cloth.silk')
    parts_t += sleeves(gid_t, 'wrist', 0.016, sl_paint, ease_end=0.032, rows=9)
    entries.append(assemble_garment(gid_t, 'Guildmaster Mosaic Qaba Coat & Assay Bandolier', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Gilded Assay Strongbox, Copper Alchemical Retort & Spice-Ledger Satchel (`xan_m/f_guild_pack`) ---
    gid_b = f'xan_{sex}_guild_pack'
    parts_b = []
    c_back = spine_at(CHEST - 0.01)
    d_back = first_hit(c_back, np.array([0.0, 1.0, 0.0])) or 0.115
    box_c = c_back + np.array([0.0, d_back + 0.068, 0.0])
    box_paint = P('yakbrown', 0.06, [
        B('top', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
    ], [
        PN(0.15, 0.85, 'xanadu_sun_wheel', 'gold', 'maroon', 0.20),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_strongbox', box_c, (0.25, 0.13, 0.30), box_paint,
                        n=18, rows=8, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    # Copper Alchemical Retort Flask mounted atop the strongbox
    retort_c = box_c + np.array([-0.045, 0.010, 0.165])
    parts_b.append(blob(gid_b + '_retort_bulb', retort_c, (0.09, 0.09, 0.10),
                        P('copper', 0.03, [B('bottom', 0.0, 0.015, 'solid', 'turq')], fabric='metal.bronze'),
                        n=14, rows=6, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_retort_neck',
                        [retort_c + np.array([0.0, 0.0, 0.040]), retort_c + np.array([0.095, 0.0, 0.010])],
                        0.014, P('copper', 0.03, fabric='metal.bronze'), n=10, rigid_joint='Spine2'))
    # Rolled Spice-Market Ledger cylinder strapped below strongbox
    roll_y = box_c[1] + 0.010
    roll_z = box_c[2] - 0.155
    parts_b.append(tube(gid_b + '_ledger_roll',
                        [np.array([-0.14, roll_y, roll_z]), np.array([0.14, roll_y, roll_z])],
                        0.036,
                        P('kesar', 0.04, [B('top', 0.0, 0.03, 'solid', 'gold'),
                                          B('bottom', 0.0, 0.03, 'solid', 'gold')], fabric='cloth.silk'),
                        n=14, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_b, 'Guildmaster Assay Strongbox, Copper Retort & Ledger Pack', 'back', 'xanadu', parts_b))

    # --- 4. LEGS: Palopó-Cuffed Bazaar Shalwar (`xan_m/f_guild_trousers`) ---
    gid_l = f'xan_{sex}_guild_trousers'
    trou_paint = P('lacrose', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.075, 'diamonds', 'turq', 'kesar', 0.04),
    ], fabric='cloth.silk')
    entries.append(assemble_garment(gid_l, 'Guildmaster Palopo-Cuffed Shalwar', 'legs', 'xanadu',
                                    trousers(gid_l, trou_paint, ease=0.014, ease_end=0.016), legged=True))

    # --- 5. FEET: Upturned Bazaar Boots (`xan_m/f_guild_boots`) ---
    gid_f = f'xan_{sex}_guild_boots'
    sole_p = P('earth', 0.08, [B('bottom', 0.0, 0.015, 'solid', 'gold')])
    cuff_p = P('turq', 0.04, [
        B('top', 0.0, 0.035, 'stripes', 'gold', 'kesar', 0.015),
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
    ], fabric='leather.polished')
    entries.append(assemble_garment(gid_f, 'Guildmaster Turquoise & Gold Bazaar Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, cuff_p, top=0.45, ease_top=0.030)))
    return entries


# ===============================================================================================================
# 3. MAGNATE: Grand Karavan-Bashi & Master of Mines (Sable Pelisse Magnate)
# ===============================================================================================================
def _build_magnate_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    ANKLE = core.ANKLE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Gold-Embroidered Crimson Kufi & Wool Pom-Pom (`xan_m/f_magnate_kufi`) ---
    gid_h = f'xan_{sex}_magnate_kufi'
    parts_h = []
    kufi_paint = P('holyred', 0.05, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
        B('bottom', 0.018, 0.055, 'fret', 'gold', 'holyred', 0.05),
        B('bottom', 0.055, 0.090, 'diamonds', 'gold', 'crimson', 0.045),
        B('top', 0.0, 0.025, 'beads', 'gold', 'holyred', 0.035),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_cap', 0.135, lambda s: 1.04 * (1.0 - 0.52 * (s ** 2.4)), kufi_paint,
                             f=0.48, ease=0.028, rows=10, n=36))
    pom_c = a + (b - a) * 0.48 + up * 0.142
    parts_h.append(blob(gid_h + '_pompom', pom_c, (0.068, 0.068, 0.064), P('holyred', 0.08, fabric=WOOL),
                        n=12, rows=5, out=up, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Karavan-Bashi Gold-Embroidered Crimson Kufi & Pom-Pom', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Floor-Length Sable Fur Pelisse, Gold Medallion & Crimson Brocade (`xan_m/f_magnate_pelisse`) ---
    gid_t = f'xan_{sex}_magnate_pelisse'
    parts_t = []
    pelisse_paint = P('sable', 0.10, [
        B('bottom', 0.0, 0.035, 'fret', 'gold', 'soot', 0.045),
        B('top', 0.0, 0.04, 'solid', 'darkfur'),
    ], [
        PN(0.0, 0.38, 'fluted', 'darkfur', 'sable', 0.14),
        PN(0.62, 1.0, 'fluted', 'darkfur', 'sable', 0.14),
        PN(0.38, 0.41, 'solid', 'darkfur', 'sable', 1.0),
        PN(0.59, 0.62, 'solid', 'darkfur', 'sable', 1.0),
        PN(0.41, 0.59, 'brocade_skirt', 'gold', 'holyred', 0.32),
        PN(0.41, 0.59, 'solid', 'deepgreen', 'deepgreen', 1.0, down=0.58),
        PN(0.45, 0.55, 'diamonds', 'gold', 'soot', 0.08, down=0.22),
    ], fabric='fur.short')
    parts_t.append(torso_tube(gid_t + '_pelisse', TOP + 0.01, ANKLE + 0.04, 0.024, pelisse_paint,
                              n=52, hang_from=WAIST - 0.02, flare=0.10,
                              group_below=CROTCH + 0.02, hull_from=WAIST, over_arms=False))

    # Multi-strand 3D gold bead chains & large scalloped solid-gold pectoral medallion
    gold_paint = P('gold', 0.02, [B('top', 0.0, 0.006, 'solid', 'ochre')], fabric='metal.gold')
    for loop_idx, (w_loop, drop_z, n_beads) in enumerate(((0.062, 0.14, 13), (0.082, 0.24, 17))):
        for k in range(n_beads):
            u_b = k / float(n_beads - 1)
            ang_b = (u_b - 0.5) * math.pi
            bx_off = math.sin(ang_b) * w_loop
            bz = TOP - 0.01 - math.cos(ang_b) * drop_z
            b_pos = chest_front(bz, 0.032 + 0.004 * loop_idx, x=bx_off)
            parts_t.append(blob(f'{gid_t}_chain_{loop_idx}_{k}', b_pos, (0.016, 0.014, 0.016), gold_paint,
                                n=8, rows=4, out=FRONT, rigid_joint='Spine2'))

    med_c = chest_front(CHEST - 0.07, 0.038, x=0.0)
    parts_t.append(blob(gid_t + '_medallion', med_c, (0.095, 0.020, 0.105),
                        P('gold', 0.02, [B('top', 0.0, 0.02, 'dentils', 'ochre', 'gold', 0.02)], fabric='metal.gold'),
                        n=16, rows=6, out=FRONT, rigid_joint='Spine2'))

    fur_paint = P('sable', 0.11, [
        B('bottom', 0.0, 0.05, 'solid', 'soot'),
        B('top', 0.0, 0.05, 'solid', 'darkfur'),
    ], [
        PN(0.0, 1.0, 'fluted', 'darkfur', 'sable', 0.14),
    ], fabric='fur.short')
    zs_shawl = np.linspace(TOP + 0.065, CHEST + 0.03, 7)
    angs_shawl = np.linspace(-0.74 * math.pi, 0.74 * math.pi, 36)
    Shawl_pts = np.array([
        ring_points(spine_at(z), np.array([0, 1.0, 0]), np.array([1.0, 0, 0]), angs_shawl,
                    0.030 + 0.018 * math.sin(math.pi * k / 6.0), rmin=0.06)
        for k, z in enumerate(zs_shawl)
    ])
    parts_t.append(Part(gid_t + '_fur_collar', Shawl_pts, False, ['body'] * 7, fur_paint))
    parts_t.append(pauldron(gid_t + '_fur_sh_L', L, fur_paint, reach=0.48, ease=0.048, flare_end=1.18))
    parts_t.append(pauldron(gid_t + '_fur_sh_R', R, fur_paint, reach=0.48, ease=0.048, flare_end=1.18))

    sl_paint = P('sable', 0.10, [
        B('bottom', 0.0, 0.18, 'fret', 'gold', 'holyred', 0.045),
        B('bottom', 0.18, 0.20, 'solid', 'gold'),
    ], fabric='fur.short')
    parts_t += sleeves(gid_t, 'wrist', 0.026, sl_paint, ease_end=0.034, rows=10, n=20)
    entries.append(assemble_garment(gid_t, 'Karavan-Bashi Sable Fur Pelisse, Gold Medallion & Crimson Brocade', 'torso', 'xanadu', parts_t))

    # --- 3. FEET: Gilded Crimson Morocco-Leather Riding Boots (`xan_m/f_magnate_boots`) ---
    gid_f = f'xan_{sex}_magnate_boots'
    sole_p = P('soot', 0.08, [B('bottom', 0.0, 0.015, 'solid', 'gold')])
    cuff_p = P('holyred', 0.04, [
        B('top', 0.0, 0.035, 'fret', 'gold', 'holyred', 0.03),
        B('bottom', 0.0, 0.020, 'solid', 'gold'),
    ], fabric='leather.polished')
    entries.append(assemble_garment(gid_f, 'Magnate Gilded Morocco-Leather Riding Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, cuff_p, top=0.58, ease_top=0.036)))
    return entries


# ===============================================================================================================
# 4. PRIEST: Temple Grammarian & Kora Wheel-Priest (Ortaköy & Grand Temple Clergy)
# ===============================================================================================================
def _build_priest_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    ANKLE = core.ANKLE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Gilded Five-Leaf Kora Crown & Turquoise Dome Mitre (`xan_m/f_priest_crown`) ---
    gid_h = f'xan_{sex}_priest_crown'
    parts_h = []
    # Inner turquoise-and-gold mosaic dome (like the Ortaköy & Grand Temple domes)
    dome_paint = P('turq', 0.03, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
        B('top', 0.0, 0.025, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'xanadu_mosaic', 'turq', 'mongolblue', 0.14),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_dome', 0.175, lambda s: 0.98 * (1.0 - 0.58 * (s ** 2.0)),
                             dome_paint, f=0.52, ease=0.022, rows=10, n=36))

    # Gilded Five-Leaf Tibetan/Persian Kora Diadem rising around the lower dome
    diadem_paint = P('gold', 0.02, [
        B('bottom', 0.0, 0.012, 'beads', 'holyred', 'gold', 0.02),
        B('top', 0.0, 0.010, 'dentils', 'saffron', 'gold', 0.035),
    ], [
        PN(0.38, 0.62, 'xanadu_sun_wheel', 'gold', 'maroon', 0.08),
    ], fabric='metal.gold')
    parts_h.append(crown_band(gid_h + '_diadem', diadem_paint, f0=0.48, f1=0.84, ease=0.024, flare=0.014, rows=7, n=40))

    # Five 3D Gilded Kora Leaf-Plaques around the front & sides of the crown
    c_crown = a + (b - a) * 0.72
    for idx, ang_leaf in enumerate((-0.42 * math.pi, -0.21 * math.pi, 0.0, 0.21 * math.pi, 0.42 * math.pi)):
        d_leaf = -bk * math.cos(ang_leaf) + left * math.sin(ang_leaf)
        d_leaf /= np.linalg.norm(d_leaf)
        h_l = first_hit(c_crown, d_leaf) or 0.10
        p_leaf = c_crown + d_leaf * (h_l + 0.034)
        parts_h.append(blob(f'{gid_h}_leaf_{idx}', p_leaf, (0.042, 0.016, 0.068),
                            P('gold', 0.02, [B('bottom', 0.0, 0.015, 'solid', 'turq')], fabric='metal.gold'),
                            n=12, rows=5, out=d_leaf, rigid_joint='Head'))

    # Golden Prayer-Wheel Spire Finial atop the mitre dome
    c_apex = a + (b - a) * 0.52 + up * 0.180
    parts_h.append(tube(gid_h + '_wheel_drum',
                        [c_apex - up * 0.010, c_apex + up * 0.048],
                        0.024,
                        P('maroon', 0.03, [B('top', 0.0, 0.010, 'solid', 'gold'),
                                           B('bottom', 0.0, 0.010, 'solid', 'gold')], fabric='metal.gold'),
                        n=16, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_wheel_spire', c_apex + up * 0.062, (0.032, 0.032, 0.052),
                        P('gold', 0.02, fabric='metal.gold'), n=12, rows=5, out=up, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Kora Wheel-Priest Five-Leaf Crown & Turquoise Mitre', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Sanctum Robe of the Eight-Spoked Wheel & Tocharian Syllabary (`xan_m/f_priest_robe`) ---
    gid_t = f'xan_{sex}_priest_robe'
    parts_t = []
    robe_paint = P('holyred', 0.04, [
        B('top', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.0, 0.030, 'solid', 'gold'),
        B('bottom', 0.030, 0.105, 'fret', 'gold', 'omaroon', 0.055),
        B('bottom', 0.105, 0.135, 'solid', 'saffron'),
    ], [
        # Saffron side-pleat panels & center-front Tocharian Sound-Grid Syllabary & 8-Spoked Wheel apron
        PN(0.18, 0.36, 'fluted', 'saffron', 'kesar', 0.06),
        PN(0.64, 0.82, 'fluted', 'saffron', 'kesar', 0.06),
        PN(0.36, 0.40, 'solid', 'gold', 'gold', 1.0),
        PN(0.60, 0.64, 'solid', 'gold', 'gold', 1.0),
        PN(0.40, 0.60, 'tocharian_wheel', 'gold', 'omaroon', 0.24),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_robe', TOP, ANKLE + 0.04, 0.015, robe_paint,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.18,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Maroon Penbey chest-frieze band (like the maroon twig band with gold roundels under temple roofs!)
    frieze_paint = P('omaroon', 0.05, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_penbey_band', CHEST + 0.055, CHEST - 0.025, 0.024, frieze_paint,
                              n=40, rows=4, hull_from=CHEST + 0.06))

    # Three 3D Gold Eight-Spoked Dharma Wheel Roundels across the maroon Penbey chest band
    for idx, x_off in enumerate((-0.075, 0.0, 0.075)):
        p_rnd = chest_front(CHEST + 0.015, 0.036, x=x_off)
        r_wheel = 0.034 if idx == 1 else 0.026
        parts_t.append(rosette(f'{gid_t}_wheel_roundel_{idx}', p_rnd, FRONT, np.array([1.0, 0.0, 0.0]),
                               r_wheel,
                               P('gold', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'turq')], fabric='metal.gold'),
                               n=8, thick=0.010, rigid_joint='Spine2'))

    # Gilded Roof-Horn Shoulder Mantles (echoing xnGiltRoof on Xanadu temples)
    gilt_sh_paint = P('gold', 0.02, [
        B('bottom', 0.0, 0.020, 'dentils', 'holyred', 'gold', 0.025),
        B('top', 0.0, 0.015, 'solid', 'omaroon'),
    ], fabric='metal.gold')
    parts_t.append(pauldron(gid_t + '_gilt_sh_L', L, gilt_sh_paint, reach=0.45, ease=0.032, flare_end=1.22))
    parts_t.append(pauldron(gid_t + '_gilt_sh_R', R, gilt_sh_paint, reach=0.45, ease=0.032, flare_end=1.22))

    # Saffron & Gold Liturgical Sash
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.04, WAIST - 0.035, 0.026,
                              P('saffron', 0.03, [B('top', 0.0, 0.010, 'solid', 'gold'),
                                                  B('bottom', 0.0, 0.010, 'solid', 'gold')], fabric='cloth.silk'),
                              rows=4, n=40, hull_from=WAIST + 0.08))

    # Handheld / Hip-Mounted 3D Gilded Prayer Wheel (Mani Khorlo) at the right hip, proud of the sash
    d_hip = np.array([0.78, -0.62, 0.0])
    d_hip /= np.linalg.norm(d_hip)
    p_hip = surface_out(spine_at(WAIST + 0.01), d_hip, 0.062)
    parts_t.append(tube(gid_t + '_mani_drum',
                        [p_hip - np.array([0.0, 0.0, 0.045]), p_hip + np.array([0.0, 0.0, 0.045])],
                        0.032,
                        P('omaroon', 0.03, [
                            B('top', 0.0, 0.014, 'solid', 'gold'),
                            B('bottom', 0.0, 0.014, 'solid', 'gold'),
                        ], [
                            PN(0.0, 1.0, 'tocharian_wheel', 'gold', 'omaroon', 0.06),
                        ], fabric='metal.gold'),
                        n=18, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_mani_handle',
                        [p_hip - np.array([0.0, 0.0, 0.115]), p_hip - np.array([0.0, 0.0, 0.045])],
                        0.011, P('yakbrown', 0.05, [B('bottom', 0.0, 0.015, 'solid', 'gold')]),
                        n=10, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_mani_spire', p_hip + np.array([0.0, 0.0, 0.058]), (0.038, 0.038, 0.046),
                        P('gold', 0.02, fabric='metal.gold'), n=10, rows=4, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Hips'))

    # Wide Saffron & Maroon Liturgical Sleeves
    sl_paint = P('saffron', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.085, 'diamonds', 'gold', 'holyred', 0.045),
    ], fabric='cloth.silk')
    parts_t += sleeves(gid_t, 'wrist', 0.018, sl_paint, ease_end=0.052, rows=9)
    entries.append(assemble_garment(gid_t, 'Sanctum Robe of the Eight-Spoked Wheel & Tocharian Syllabary', 'torso', 'xanadu', parts_t))

    # --- 3. FEET: Sanctum Wheel-Priest Boots (`xan_m/f_priest_boots`) ---
    gid_f = f'xan_{sex}_priest_boots'
    sole_p = P('gold', 0.03, fabric='metal.gold')
    cuff_p = P('omaroon', 0.04, [
        B('top', 0.0, 0.045, 'stripes', 'gold', 'saffron', 0.015),
        B('bottom', 0.0, 0.020, 'solid', 'gold'),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_f, 'Sanctum Wheel-Priest Saffron & Maroon Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, cuff_p, top=0.50, ease_top=0.032)))
    return entries


# ===============================================================================================================
# 5. PLEASURE: Pleasure-Dome Courtesan, Musician & Valide's Courtier (Topkapı Harem & Hall of Feasts)
# ===============================================================================================================
def _build_pleasure_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Pleasure-Dome Gilded Hotoz / Feasting Taj & Pearl-Lattice Chains (`xan_m/f_pleasure_headdress`) ---
    gid_h = f'xan_{sex}_pleasure_headdress'
    parts_h = []
    taj_paint = P('peacock', 0.03, [
        B('bottom', 0.0, 0.018, 'beads', 'gold', 'pomegranate', 0.022),
        B('bottom', 0.018, 0.058, 'xanadu_mosaic', 'turq', 'violet', 0.045),
        B('top', 0.0, 0.024, 'solid', 'gold'),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_hotoz', 0.150, lambda s: 0.94 + 0.18 * math.sin(s * math.pi * 0.75),
                             taj_paint, f=0.52, ease=0.020, rows=10, n=36))

    # Jewelled Gold & Ruby Sorguç (Aigrette) & Plume on the front brow
    c_brow = a + (b - a) * 0.65
    h_brow = first_hit(c_brow, -bk) or 0.102
    aig_c = c_brow - bk * (h_brow + 0.030)
    parts_h.append(rosette(gid_h + '_aigrette', aig_c, -bk, up, 0.030,
                           P('gold', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'pomegranate')], fabric='metal.gold'),
                           n=10, thick=0.010, rigid_joint='Head'))
    parts_h.append(horn(gid_h + '_plume',
                        [aig_c + up * 0.015, aig_c + up * 0.085 - bk * 0.018, aig_c + up * 0.145 + bk * 0.010],
                        0.024, 0.006,
                        P('turq', 0.03, [B('top', 0.0, 0.025, 'solid', 'gold'),
                                         B('bottom', 0.0, 0.020, 'solid', 'pomegranate')], fabric='cloth.silk'),
                        n=10, rows=7, rigid_joint='Head'))

    # Twin Gold & Pearl Temple-Pendants framing the cheeks (leaving the face open)
    for s_tag, s_sign in (('L', 1.0), ('R', -1.0)):
        p_t0 = a + (b - a) * 0.50 + left * (s_sign * 0.095) - bk * 0.035
        for k_b in range(4):
            p_bead = p_t0 - up * (0.022 * k_b)
            col_b = 'gold' if k_b % 2 == 0 else 'nacre'
            parts_h.append(blob(f'{gid_h}_temple_{s_tag}_{k_b}', p_bead, (0.020, 0.020, 0.024),
                                P(col_b, 0.02, fabric='metal.gold' if col_b == 'gold' else 'shell.nacre'),
                                n=8, rows=4, out=left * s_sign, rigid_joint='Head'))

    entries.append(assemble_garment(gid_h, 'Pleasure-Dome Gilded Hotoz, Sorguc Plume & Pearl Chains', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Pleasure-Dome Gilded Mosaic Entari / Feast Caftan (`xan_m/f_pleasure_caftan`) ---
    gid_t = f'xan_{sex}_pleasure_caftan'
    parts_t = []
    entari_paint = P('peacock', 0.03, [
        B('top', 0.0, 0.022, 'beads', 'gold', 'pomegranate', 0.025),
        B('bottom', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.028, 0.095, 'xanadu_mosaic', 'turq', 'violet', 0.055),
    ], [
        # Side skirt panels in royal violet with gold brocade; center-front stained-glass mosaic panel
        PN(0.12, 0.38, 'brocade_skirt', 'gold', 'violet', 0.22),
        PN(0.62, 0.88, 'brocade_skirt', 'gold', 'violet', 0.22),
        PN(0.38, 0.41, 'solid', 'gold', 'gold', 1.0),
        PN(0.59, 0.62, 'solid', 'gold', 'gold', 1.0),
        PN(0.41, 0.59, 'xanadu_mosaic', 'turq', 'pomegranate', 0.16),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_entari', TOP, KNEE - 0.02, 0.014, entari_paint,
                              n=48, rows=20, hang_from=WAIST, flare=0.22,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Jewelled Harem-Lattice Girdle (Cummerbund) with dangling gold coin pendants
    girdle_paint = P('gold', 0.02, [
        B('top', 0.0, 0.012, 'beads', 'pomegranate', 'gold', 0.022),
        B('bottom', 0.0, 0.012, 'beads', 'turq', 'gold', 0.022),
    ], [
        PN(0.0, 1.0, 'diamonds', 'pomegranate', 'gold', 0.035),
    ], fabric='metal.gold')
    parts_t.append(torso_tube(gid_t + '_girdle', WAIST + 0.038, WAIST - 0.038, 0.024, girdle_paint,
                              rows=5, n=44, hull_from=WAIST + 0.08))
    coin_angs = np.linspace(0, 2 * math.pi, 14, endpoint=False)
    parts_t += pendants(gid_t + '_coins', WAIST - 0.035, coin_angs, (0.026, 0.012, 0.032),
                        P('gold', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'pomegranate')], fabric='metal.gold'),
                        ease=0.032)

    # Jewelled Collar Disc
    parts_t.append(collar_disc(gid_t + '_collar', 0.062,
                               P('gold', 0.02, [B('top', 0.0, 0.025, 'beads', 'turq', 'gold', 0.022)], fabric='metal.gold'),
                               drop=0.024, scallop=0.012, ease=0.028, z_off=0.008, rows=4))

    # Draped Silk & Gold-Banded Sleeves
    sl_paint = P('violet', 0.03, [
        B('bottom', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.028, 0.085, 'stripes', 'turq', 'gold', 0.025),
    ], fabric='cloth.silk')
    parts_t += sleeves(gid_t, 'wrist', 0.016, sl_paint, ease_end=0.048, rows=9)
    entries.append(assemble_garment(gid_t, 'Pleasure-Dome Gilded Mosaic Entari & Coin-Girdle', 'torso', 'xanadu', parts_t))

    # --- 3. LEGS: Voluminous Silk Harem Şalvar (`xan_m/f_pleasure_shalwar`) ---
    gid_l = f'xan_{sex}_pleasure_shalwar'
    shalwar_paint = P('turq', 0.03, [
        B('bottom', 0.0, 0.030, 'solid', 'gold'),
        B('bottom', 0.030, 0.085, 'diamonds', 'gold', 'pomegranate', 0.04),
    ], fabric='cloth.silk')
    entries.append(assemble_garment(gid_l, 'Pleasure-Dome Silk Harem Salvar', 'legs', 'xanadu',
                                    trousers(gid_l, shalwar_paint, ease=0.020, ease_end=0.014), legged=True))
    return entries


# ===============================================================================================================
# 6. VIZIER: Grand Vizier, Divan Chancellor & Sultan's Court Sovereign
# ===============================================================================================================
def _build_vizier_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    ANKLE = core.ANKLE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Imperial Kallavi / Taj-i-Xanadu Turban-Crown (`xan_m/f_vizier_kavuk`) ---
    gid_h = f'xan_{sex}_vizier_kavuk'
    parts_h = []
    # Tall fluted Ottoman Kallavi / Safavid Taj crown wrapped in cream-and-gold silk with diagonal gold galloon
    kavuk_paint = P('cream', 0.03, [
        B('bottom', 0.0, 0.020, 'solid', 'gold'),
        B('bottom', 0.020, 0.065, 'stripes', 'gold', 'mongolblue', 0.025),
        B('top', 0.0, 0.038, 'fluted', 'gold', 'omaroon', 0.03),
    ], [
        PN(0.0, 1.0, 'chevrons', 'gold', 'cream', 0.055),
        PN(0.40, 0.60, 'xanadu_sun_wheel', 'gold', 'maroon', 0.09),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_kallavi', 0.215,
                             lambda s: 0.96 + 0.22 * math.sin(s * math.pi * 0.68) - 0.18 * (s ** 2.2),
                             kavuk_paint, f=0.48, ease=0.026, rows=12, n=40))

    # Blazing 3D Gold Sun-and-Moon & Ruby Sorguç on the front of the Kallavi
    c_brow = a + (b - a) * 0.66
    h_brow = first_hit(c_brow, -bk) or 0.102
    sun_c = c_brow - bk * (h_brow + 0.038)
    parts_h.append(rosette(gid_h + '_sun_jewel', sun_c, -bk, up, 0.036,
                           P('gold', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'holyred')], fabric='metal.gold'),
                           n=12, thick=0.012, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Imperial Kallavi & Sun-and-Moon Turban-Crown', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Imperial Khalat of the Divan & Sun-and-Moon Sovereign Regalia (`xan_m/f_vizier_robe`) ---
    gid_t = f'xan_{sex}_vizier_robe'
    parts_t = []
    khalat_paint = P('mongolblue', 0.03, [
        B('top', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.0, 0.032, 'solid', 'gold'),
        B('bottom', 0.032, 0.115, 'xanadu_mosaic', 'turq', 'mongolblue', 0.065),
        B('bottom', 0.115, 0.145, 'fret', 'gold', 'omaroon', 0.045),
    ], [
        # Spun-gold brocade side panels & center-front Sun-and-Moon Sovereign panel
        PN(0.10, 0.36, 'brocade_skirt', 'gold', 'mongolblue', 0.25),
        PN(0.64, 0.90, 'brocade_skirt', 'gold', 'mongolblue', 0.25),
        PN(0.36, 0.40, 'solid', 'gold', 'gold', 1.0),
        PN(0.60, 0.64, 'solid', 'gold', 'gold', 1.0),
        PN(0.40, 0.60, 'xanadu_sun_wheel', 'gold', 'omaroon', 0.22),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_khalat', TOP, ANKLE + 0.04, 0.016, khalat_paint,
                              n=50, rows=22, hang_from=WAIST - 0.01, flare=0.22,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Gilded Roof-Eave Sovereign Epaulettes & Collar of State
    ep_paint = P('gold', 0.02, [
        B('bottom', 0.0, 0.022, 'fret', 'omaroon', 'gold', 0.03),
        B('top', 0.0, 0.014, 'solid', 'turq'),
    ], fabric='metal.gold')
    parts_t.append(pauldron(gid_t + '_ep_L', L, ep_paint, reach=0.50, ease=0.036, flare_end=1.25))
    parts_t.append(pauldron(gid_t + '_ep_R', R, ep_paint, reach=0.50, ease=0.036, flare_end=1.25))
    parts_t.append(collar_disc(gid_t + '_collar', 0.070,
                               P('gold', 0.02, [B('top', 0.0, 0.028, 'beads', 'holyred', 'gold', 0.025)], fabric='metal.gold'),
                               drop=0.028, scallop=0.010, ease=0.028, z_off=0.008, rows=4))

    # 3D Chancellor's Chain of State Seals across the chest
    for k in range(9):
        u_s = k / 8.0
        ang_s = (u_s - 0.5) * 0.92 * math.pi
        x_s = math.sin(ang_s) * 0.088
        z_s = TOP - 0.02 - math.cos(ang_s) * 0.145
        p_s = chest_front(z_s, 0.038, x=x_s)
        r_s = 0.028 if k == 4 else 0.018
        parts_t.append(rosette(f'{gid_t}_state_seal_{k}', p_s, FRONT, np.array([1.0, 0.0, 0.0]),
                               r_s,
                               P('gold', 0.02, [B('bottom', 0.0, 0.006, 'solid', 'jade' if k == 4 else 'holyred')], fabric='metal.gold'),
                               n=8, thick=0.010, rigid_joint='Spine2'))

    # Spun-Gold & Maroon Divan Sash with Jade-and-Gold Ledger Scroll Tube at left hip
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.045, WAIST - 0.040, 0.028,
                              P('gold', 0.02, [B('top', 0.0, 0.014, 'solid', 'omaroon'),
                                               B('bottom', 0.0, 0.014, 'solid', 'omaroon')], fabric='metal.gold'),
                              rows=5, n=42, hull_from=WAIST + 0.08))
    d_scroll = np.array([-0.78, -0.62, 0.0])
    d_scroll /= np.linalg.norm(d_scroll)
    p_scroll = surface_out(spine_at(WAIST + 0.01), d_scroll, 0.062)
    parts_t.append(tube(gid_t + '_jade_ledger',
                        [p_scroll - np.array([0.0, 0.02, 0.075]), p_scroll + np.array([0.0, -0.02, 0.075])],
                        0.024,
                        P('jade', 0.03, [B('top', 0.0, 0.022, 'solid', 'gold'),
                                         B('bottom', 0.0, 0.022, 'solid', 'gold')], fabric='metal.gold'),
                        n=14, rigid_joint='Hips'))

    # Imperial Gold-and-Lapis Sleeves
    sl_paint = P('mongolblue', 0.03, [
        B('bottom', 0.0, 0.032, 'solid', 'gold'),
        B('bottom', 0.032, 0.110, 'fret', 'gold', 'omaroon', 0.04),
    ], fabric='cloth.silk')
    parts_t += sleeves(gid_t, 'wrist', 0.018, sl_paint, ease_end=0.044, rows=10)
    entries.append(assemble_garment(gid_t, 'Imperial Khalat of the Divan & State Seals', 'torso', 'xanadu', parts_t))

    # --- 3. FEET: Imperial Lapis & Gold Court Slippers (`xan_m/f_vizier_slippers`) ---
    gid_f = f'xan_{sex}_vizier_slippers'
    sole_p = P('gold', 0.02, fabric='metal.gold')
    cuff_p = P('mongolblue', 0.03, [
        B('top', 0.0, 0.035, 'diamonds', 'gold', 'holyred', 0.025),
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
    ], fabric='cloth.silk')
    entries.append(assemble_garment(gid_f, 'Imperial Lapis & Gold Court Slippers', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, cuff_p, top=0.22, ease_top=0.024)))
    return entries


# ===============================================================================================================
# 7. ASKARI: Dzong Citadel Guard & Askari Mirror-Infantry (`xan_m/f_askari_*`)
# ===============================================================================================================
def _build_askari_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Gold-Damascened Kulah-Khud Spired Helm & Nasal Bar (`xan_m/f_askari_helm`) ---
    gid_h = f'xan_{sex}_askari_helm'
    parts_h = []
    bowl_paint = P('steel', 0.03, [
        B('bottom', 0.0, 0.018, 'fret', 'gold', 'steel', 0.035),
        B('top', 0.0, 0.024, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'fluted', 'gold', 'steel', 0.045),
    ], fabric='metal.iron')
    parts_h.append(head_rings(gid_h + '_bowl', 0.56, 1.0, 0.016, bowl_paint, n=36, rows=7, apex=True))

    # Gilded Rim Band with 3D Sliding Nasal Bar between the eyes (leaving face visible!)
    rim_paint = P('gold', 0.02, [
        B('top', 0.0, 0.008, 'solid', 'holyred'),
        B('bottom', 0.0, 0.008, 'solid', 'steel'),
    ], fabric='metal.gold')
    parts_h.append(crown_band(gid_h + '_rim', rim_paint, f0=0.52, f1=0.66, ease=0.019, flare=0.004, n=36))

    c_brow = a + (b - a) * 0.56
    h_brow = first_hit(c_brow, -bk) or 0.102
    nasal_top = c_brow - bk * (h_brow + 0.026) + up * 0.032
    nasal_bot = c_brow - bk * (h_brow + 0.030) - up * 0.048
    parts_h.append(tube(gid_h + '_nasal_bar', [nasal_top, nasal_bot], 0.009,
                        P('gold', 0.02, [B('top', 0.0, 0.018, 'solid', 'holyred')], fabric='metal.gold'),
                        n=10, rigid_joint='Head'))

    # Tall Central Gilded Spike & Twin Saffron/Crimson Plume Sockets
    c_apex = a + (b - a) * 1.0 + up * 0.015
    parts_h.append(horn(gid_h + '_spike',
                        [c_apex, c_apex + up * 0.105],
                        0.022, 0.003,
                        P('gold', 0.02, [B('bottom', 0.0, 0.025, 'solid', 'holyred')], fabric='metal.gold'),
                        n=12, rows=6, rigid_joint='Head'))
    for s_tag, s_sign, col_plume in (('L', 1.0, 'saffron'), ('R', -1.0, 'holyred')):
        p_pl0 = c_brow + left * (s_sign * 0.048) - bk * (h_brow + 0.020) + up * 0.035
        d_pl = up * 0.88 + left * (s_sign * 0.35) - bk * 0.25
        d_pl /= np.linalg.norm(d_pl)
        parts_h.append(horn(f'{gid_h}_plume_{s_tag}',
                            [p_pl0, p_pl0 + d_pl * 0.090],
                            0.018, 0.005,
                            P(col_plume, 0.03, [B('bottom', 0.0, 0.020, 'solid', 'gold')], fabric='cloth.silk'),
                            n=10, rows=5, rigid_joint='Head'))

    # Gilded Scale & Mail Aventail protecting the back and sides of the neck
    av_paint = P('steel', 0.04, [
        B('bottom', 0.0, 0.018, 'solid', 'holyred'),
    ], [
        PN(0.0, 1.0, 'coin_scales', 'gold', 'steel', 0.035),
    ], fabric='metal.iron')
    angs_av = np.linspace(-0.62 * math.pi, 0.62 * math.pi, 26)
    Av_rows = []
    for k, f_z in enumerate(np.linspace(0.50, 0.05, 6)):
        c_row = a + (b - a) * f_z
        flare_r = 0.016 + 0.024 * (k / 5.0)
        Av_rows.append(ring_points(c_row, bk, left, angs_av, flare_r, rmin=0.055))
    parts_h.append(Part(gid_h + '_aventail', np.array(Av_rows), False, ['body'] * len(Av_rows), av_paint, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Askari Gold-Damascened Kulah-Khud Helm & Aventail', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Gold-Damascened Chahar-Aina (Four-Mirror) Cuirass & Crimson Alkhalig (`xan_m/f_askari_cuirass`) ---
    gid_t = f'xan_{sex}_askari_cuirass'
    parts_t = []
    # Quilted crimson-and-lapis Alkhalig gambeson coat with Chahar-Aina Four-Mirror plates over the chest & back
    alkhalig_paint = P('holyred', 0.05, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.028, 0.085, 'fret', 'gold', 'mongolblue', 0.045),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'holyred', 'omaroon', 0.16),
        # Front & Back Chahar-Aina ("Four-Mirror") damascened steel-and-gold armor plates
        PN(0.41, 0.59, 'chahar_aina', 'gold', 'steel', 0.24, down=0.46),
        PN(0.0, 0.10, 'chahar_aina', 'gold', 'steel', 0.24, down=0.46),
        PN(0.90, 1.0, 'chahar_aina', 'gold', 'steel', 0.24, down=0.46),
    ], fabric='cloth.quilted')
    parts_t.append(torso_tube(gid_t + '_alkhalig', TOP, KNEE + 0.02, 0.017, alkhalig_paint,
                              n=48, rows=20, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Raised 3D Front & Back Chahar-Aina Mirror Plates & Gold Xanadu Wheel Boss
    mirror_paint = P('steel', 0.03, [
        B('top', 0.0, 0.015, 'solid', 'gold'),
        B('bottom', 0.0, 0.015, 'solid', 'gold'),
    ], [
        PN(0.15, 0.85, 'chahar_aina', 'gold', 'steel', 0.18),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_cuirass_band', CHEST + 0.07, WAIST + 0.04, 0.025, mirror_paint,
                              n=44, rows=7, hull_from=CHEST + 0.08))

    p_boss = chest_front(CHEST - 0.01, 0.040, x=0.0)
    parts_t.append(rosette(gid_t + '_wheel_boss', p_boss, FRONT, np.array([1.0, 0.0, 0.0]), 0.042,
                           P('gold', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'holyred')], fabric='metal.gold'),
                           n=8, thick=0.014, rigid_joint='Spine2'))

    # Flared Tibetan-Dzong Lamellar Pauldrons
    pauld_paint = P('steel', 0.03, [
        B('bottom', 0.0, 0.022, 'dentils', 'gold', 'holyred', 0.03),
        B('top', 0.0, 0.015, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'coin_scales', 'gold', 'steel', 0.045),
    ], fabric='metal.iron')
    parts_t.append(pauldron(gid_t + '_pauld_L', L, pauld_paint, reach=0.52, ease=0.032, flare_end=1.20))
    parts_t.append(pauldron(gid_t + '_pauld_R', R, pauld_paint, reach=0.52, ease=0.032, flare_end=1.20))

    # Saffron & Lapis Military Sash
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.04, WAIST - 0.035, 0.027,
                              P('saffron', 0.04, [B('top', 0.0, 0.010, 'solid', 'mongolblue'),
                                                  B('bottom', 0.0, 0.010, 'solid', 'mongolblue')], fabric=WOOL),
                              rows=4, n=40, hull_from=WAIST + 0.08))

    # Sleeves with Gilded Steel Bazuband (Forearm Vambraces)
    sl_paint = P('holyred', 0.05, [
        B('bottom', 0.0, 0.15, 'fluted', 'gold', 'steel', 0.03),
        B('bottom', 0.15, 0.17, 'solid', 'gold'),
    ], fabric='cloth.quilted')
    parts_t += sleeves(gid_t, 'wrist', 0.017, sl_paint, ease_end=0.026, rows=10)
    entries.append(assemble_garment(gid_t, 'Askari Gold-Damascened Chahar-Aina Cuirass & Crimson Alkhalig', 'torso', 'xanadu', parts_t))

    # --- 3. LEGS: Lapis Military Shalwar Breeches (`xan_m/f_askari_trousers`) ---
    gid_l = f'xan_{sex}_askari_trousers'
    trou_paint = P('mongolblue', 0.05, [
        B('bottom', 0.0, 0.03, 'solid', 'gold'),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'Askari Lapis Military Breeches', 'legs', 'xanadu',
                                    trousers(gid_l, trou_paint, ease=0.013, ease_end=0.015), legged=True))

    # --- 4. FEET: Gilded Steel & Crimson Felt Dzong Greaves (`xan_m/f_askari_greaves`) ---
    gid_f = f'xan_{sex}_askari_greaves'
    sole_p = P('soot', 0.08, [B('bottom', 0.0, 0.015, 'solid', 'gold')])
    cuff_p = P('steel', 0.03, [
        B('top', 0.0, 0.045, 'stripes', 'gold', 'holyred', 0.018),
        B('bottom', 0.0, 0.030, 'solid', 'holyred'),
    ], [
        PN(0.25, 0.75, 'fluted', 'gold', 'steel', 0.035),
    ], fabric='metal.iron')
    entries.append(assemble_garment(gid_f, 'Askari Gilded Steel & Crimson Felt Greaves', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, cuff_p, top=0.65, ease_top=0.034)))
    return entries


# ===============================================================================================================
# 8. ICEWARDEN: Warden of the Caves of Ice & High-Pass Stalker-Hunter (`xan_m/f_icewarden_*`)
# ===============================================================================================================
def _build_icewarden_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Himalayan Fur-Eared Helm & Glacier-Gem Brow (`xan_m/f_icewarden_hat`) ---
    gid_h = f'xan_{sex}_icewarden_hat'
    parts_h = []
    helm_paint = P('darkfur', 0.09, [
        B('bottom', 0.0, 0.022, 'solid', 'fur'),
        B('top', 0.0, 0.035, 'diamonds', 'gold', 'turq', 0.035),
    ], fabric='fur.short')
    parts_h.append(head_rings(gid_h + '_dome', 0.54, 1.0, 0.018, helm_paint, n=34, rows=7, apex=True))

    # Upturned Himalayan Yak-Fur Ear-Flaps & Neck-Flap
    flap_paint = P('fur', 0.09, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.012, 'solid', 'turq'),
    ], fabric='fur.short')
    parts_h.append(crown_band(gid_h + '_fur_flaps', flap_paint, f0=0.44, f1=0.78, ease=0.025, flare=0.012, rows=6, n=36))

    # Pierced Brass & Glacier-Crystal Snow-Glare Brow Gem (sits above eyes so face is visible)
    c_brow = a + (b - a) * 0.52
    h_brow = first_hit(c_brow, -bk) or 0.102
    visor_c = c_brow - bk * (h_brow + 0.032)
    parts_h.append(rosette(gid_h + '_ice_gem', visor_c + up * 0.018, -bk, up, 0.024,
                           P('godteal', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric='metal.gold'),
                           n=8, thick=0.010, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Caves-of-Ice Fur-Eared Helm & Glacier-Gem Brow', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Caves-of-Ice Fur-Lined Lamellar Coat & Glacier-Crystal Harness (`xan_m/f_icewarden_coat`) ---
    gid_t = f'xan_{sex}_icewarden_coat'
    parts_t = []
    coat_paint = P('turq', 0.05, [
        B('top', 0.0, 0.035, 'solid', 'darkfur'),
        B('bottom', 0.0, 0.040, 'solid', 'darkfur'),
        B('bottom', 0.040, 0.095, 'steps', 'gold', 'cream', 0.05),
    ], [
        # Tibetan gold-and-brass lamellar chest/back armor over frost-turquoise & cream quilted mountain coat
        PN(0.0, 0.36, 'diamond_quilt', 'cream', 'turq', 0.18),
        PN(0.64, 1.0, 'diamond_quilt', 'cream', 'turq', 0.18),
        PN(0.36, 0.64, 'stripes', 'turq', 'cream', 0.05),
        PN(0.36, 0.64, 'bone_lamellar', 'gold', 'omaroon', 0.16, down=0.52),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_coat', TOP, KNEE + 0.03, 0.018, coat_paint,
                              n=46, rows=20, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Heavy Yak-Fur Shoulder Mantle & Collar against the unnatural chill of the Caves of Ice
    yak_paint = P('darkfur', 0.10, [
        B('bottom', 0.0, 0.020, 'solid', 'fur'),
    ], [
        PN(0.0, 1.0, 'fluted', 'darkfur', 'fur', 0.12),
    ], fabric='fur.short')
    parts_t.append(collar_disc(gid_t + '_fur_mantle', 0.085, yak_paint, drop=0.035, scallop=0.015, rows=4))
    parts_t.append(pauldron(gid_t + '_fur_sh_L', L, yak_paint, reach=0.48, ease=0.038, flare_end=1.18))
    parts_t.append(pauldron(gid_t + '_fur_sh_R', R, yak_paint, reach=0.48, ease=0.038, flare_end=1.18))

    # Glowing 3D Caves-of-Ice Crystal & Salvaged Stalker-Core Talisman on the chest
    p_crys = chest_front(CHEST - 0.01, 0.040, x=0.0)
    parts_t.append(rosette(gid_t + '_stalker_bezel', p_crys, FRONT, np.array([1.0, 0.0, 0.0]), 0.038,
                           P('gold', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'steel')], fabric='metal.gold'),
                           n=8, thick=0.010, rigid_joint='Spine2'))
    parts_t.append(blob(gid_t + '_ice_crystal', p_crys + FRONT * 0.012, (0.040, 0.028, 0.056),
                        P('cybercyan', 0.02, [B('top', 0.0, 0.008, 'solid', 'white')]),
                        n=10, rows=5, out=FRONT, rigid_joint='Spine2'))

    # Mountain Belt with Brass Crampon-Hooks & Pouches
    parts_t += pouch_belt(gid_t + '_belt',
                          P('leather', 0.06, [B('top', 0.0, 0.008, 'solid', 'gold'),
                                              B('bottom', 0.0, 0.008, 'solid', 'gold')]),
                          P('yakbrown', 0.06, [B('top', 0.0, 0.015, 'solid', 'turq')]),
                          ease=0.028)

    # Fur-Cuffed Sleeves
    sl_paint = P('turq', 0.05, [
        B('bottom', 0.0, 0.055, 'solid', 'darkfur'),
        B('bottom', 0.055, 0.080, 'solid', 'gold'),
    ], fabric=WOOL)
    parts_t += sleeves(gid_t, 'wrist', 0.018, sl_paint, ease_end=0.034, rows=9)
    entries.append(assemble_garment(gid_t, 'Caves-of-Ice Fur-Lined Lamellar Coat & Glacier-Crystal Talisman', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: High-Pass Gilded Dhal Buckler, Quiver & Ice-Axe Pack (`xan_m/f_icewarden_pack`) ---
    gid_b = f'xan_{sex}_icewarden_pack'
    parts_b = []
    c_back = spine_at(CHEST + 0.01)
    d_back = first_hit(c_back, np.array([0.0, 1.0, 0.0])) or 0.115
    sh_c = c_back + np.array([0.0, d_back + 0.048, 0.0])
    # Curved Indo-Persian Gilded Dhal Shield with Sun-and-Moon roundel
    dhal_paint = P('omaroon', 0.03, [
        B('bottom', 0.0, 0.022, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'xanadu_sun_wheel', 'gold', 'omaroon', 0.18),
    ], fabric='metal.gold')
    parts_b.append(rosette(gid_b + '_dhal_shield', sh_c, np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                           0.185, dhal_paint, n=24, thick=0.022, rigid_joint='Spine2'))
    # Diagonal Ice-Axe & Quiver Tube behind the Dhal shield
    parts_b.append(tube(gid_b + '_quiver',
                        [sh_c + np.array([-0.08, 0.022, -0.14]), sh_c + np.array([0.11, 0.022, 0.18])],
                        0.032,
                        P('leather', 0.06, [B('top', 0.0, 0.025, 'solid', 'gold'),
                                            B('bottom', 0.0, 0.025, 'solid', 'turq')]),
                        n=12, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_b, 'High-Pass Gilded Dhal Shield & Quiver Pack', 'back', 'xanadu', parts_b))

    # --- 4. LEGS: Quilted Yak-Wool Mountain Trousers (`xan_m/f_icewarden_trousers`) ---
    gid_l = f'xan_{sex}_icewarden_trousers'
    trou_paint = P('yakbrown', 0.06, [
        B('bottom', 0.0, 0.035, 'stripes', 'turq', 'gold', 0.02),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'Caves-of-Ice Quilted Mountain Trousers', 'legs', 'xanadu',
                                    trousers(gid_l, trou_paint, ease=0.015, ease_end=0.018), legged=True))

    # --- 5. FEET: Yak-Fur & Brass-Cramponed Mountain Boots (`xan_m/f_icewarden_boots`) ---
    gid_f = f'xan_{sex}_icewarden_boots'
    sole_p = P('gold', 0.04, [B('bottom', 0.0, 0.018, 'solid', 'steel')], fabric='metal.gold')
    cuff_p = P('pomegranate', 0.05, [
        B('top', 0.0, 0.055, 'solid', 'darkfur'),
        B('bottom', 0.0, 0.025, 'diamonds', 'gold', 'turq', 0.025),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_f, 'Caves-of-Ice Yak-Fur & Cramponed Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, cuff_p, top=0.58, ease_top=0.038)))
    return entries


# ===============================================================================================================
# PUBLIC ENTRY POINT
# ===============================================================================================================
def build_xanadu_kit():
    entries = []
    entries.extend(_build_f_town_cap())
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        entries.extend(_build_guild_for_sex(sex, body_id))
        entries.extend(_build_magnate_for_sex(sex, body_id))
        entries.extend(_build_priest_for_sex(sex, body_id))
        entries.extend(_build_pleasure_for_sex(sex, body_id))
        entries.extend(_build_vizier_for_sex(sex, body_id))
        entries.extend(_build_askari_for_sex(sex, body_id))
        entries.extend(_build_icewarden_for_sex(sex, body_id))
    return entries
