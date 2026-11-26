"""The Sultanate of Xanadu Wardrobe Kit (`xanadu`).

Implements the complete cultural wardrobe of the Sultanate of Xanadu (Erewhon, Pearl of Xanadu)
across male (`mpfb_male`) and female (`mpfb_female`) bodies:
1. `town` (`xan_m/f_town_tunic`, `xan_f_town_cap`): High-resolution contoured Townsman's embroidered
   *kurta* with `cholet_pangden` placket, Mandarin collar, and 3D sash with tail; Townswoman's
   Tibetan *chuba* over a silk blouse collar with a 3D contoured `cholet_pangden` striped *pangden*
   apron and sash; plus the embroidered Tibetan/Palopó felt pillbox cap (`xan_f_town_cap`).
2. `rich` (`xan_m/f_rich_jama`): High-waisted pleated Persian-Mughal silk *jama* coat in royal violet
   and spun gold woven with `xanadu_sun_wheel` (`khalat-wheel-brocade`), crossover *angarkha* lapel
   with 3D gold buttons, shoulder-draped jewelled collar, and 3D `kesar`-and-gold sash with hanging tail.
3. `guild` (Goldsmith, Spicer & Alchemist Guildmaster / Palopó Bazaar Factor): Lapis-and-turquoise
   Persian/Turkish *qaba* coat with `xanadu_mosaic` star-tile front panels, Andean *cholet* stepped
   trim, maroon *penbey* sash with flush Gold Sun-and-Moon seal, and brass Assay & Spice-Scale bandolier;
   dorsal Gilded Assay Strongbox, Copper Alchemical Retort & Spice-Ledger pack (`back` slot);
   Palopó-cuffed *shalwar* trousers; upturned bazaar boots; and Astrakhan *kulah* hat.
4. `magnate` (Grand Karavan-Bashi & Master of Mines — Sable Pelisse Magnate): Floor-length plush
   sable-fur pelisse coat over a deep-green silk tunic and crimson-gold brocade skirt, shoulder-draped
   sable fur mantle, dual continuous interlocking 3D gold chains suspending a scalloped solid-gold
   pectoral medallion flush on the chest; gilded crimson Morocco-leather riding boots; and
   gold-embroidered crimson silk *kufi* skullcap with flush finial pom-pom.
5. `priest` (Temple Grammarian & Kora Wheel-Priest — Ortaköy & Grand Temple Clergy): Layered
   Tibetan-Persian sanctum vestment in maroon (`omaroon`/`holyred`) and saffron (`saffron`/`kesar`)
   with a maroon *penbey* chest band studded with 3 flush 3D Gold Dharma Wheels, a central apron printed
   with the **Prismarchy Eight-Spoke Wheel & Tocharian Sound-Grid Syllabary** (`tocharian_wheel`),
   contoured gilded shoulder mantles, and a belt-mounted **3D Gilded Prayer Wheel (*Mani Khorlo*)** at
   the right hip; sanctum felt boots; and a **Gilded Five-Leaf Kora Crown & Turquoise Dome Mitre**.
6. `pleasure` (Pleasure-Dome Courtesan, Musician & Valide's Courtier — Topkapı Harem & Hall of
   Feasts): Opulent Ottoman-Persian *entari* / feast caftan in iridescent peacock-turquoise,
   royal violet, and spun gold with a Persian mosaic center panel (`xanadu_mosaic`), jewelled
   harem-lattice girdle with hanging gold coins, shoulder-draped collar disc, and draped silk sleeves;
   voluminous silk harem *şalvar* trousers; and a **Pleasure-Dome Gilded Hotoz / Feasting Taj**.
7. `vizier` (Grand Vizier, Divan Chancellor & Sultan's Court Sovereign): Monumental floor-length
   Safavid/Ottoman imperial *khalat* state caftan in spun gold, royal lapis, and maroon woven with
   the **Sun-and-Moon Roundel & Eight-Spoked Wheel** (`xanadu_sun_wheel`), contoured gilt shoulder
   epaulettes, a continuous double-strand 3D Chancellor's Gold Chain of State Seals, and a belt-mounted
   Jade-and-Gold Divan Ledger case; curled lapis-and-gold court shoes; and the towering **Imperial
   *Kallavi* / *Taj-i-Xanadu* Turban-Crown**.
8. `askari` (Dzong Citadel Guard & Askari Mirror-Infantry): Crimson-and-lapis diamond-quilted
   *alkhalig* gambeson overlaid with 3D steel-and-gold **Four-Mirror (*Chahar-Aina*)** armor plates
   (`chahar_aina`), flush gold wheel boss, gilded laminar *bazuband* bracers, and contoured dzong
   pauldrons; lapis military breeches; gilded steel & crimson felt greaves; and a **Gold-Damascened
   *Kulah-Khud* Spired Helm**.
9. `icewarden` (Warden of the Caves of Ice & High-Pass Stalker-Hunter): High-altitude Himalayan
   yak-fur and frost-turquoise coat armored with gold-laced Tibetan lamellar (*byang bu*), shoulder-draped
   yak-fur mantle, and a flush **3D Blue Ice-Crystal / Salvaged Stalker-Core Talisman**; dorsal
   **Gilded *Dhal* Buckler, Quiver & Ice-Axe Pack** (`back` slot); quilted mountain trousers;
   cramponed yak-fur boots; and a **Himalayan Fur-Eared Helm with Glacier-Gem Brow**.
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
    torso_tube, collar, stand_collar, collar_disc, cape, tabard, band, crossed_sash, pauldron
)
from ..types.limbs import limb_tube, sleeve, sleeves, trousers
from ..types.footwear import boots, sandal
from ..types.headgear import (
    head_rings, sculpted_faceplate, sculpted_cranium, hood, brim,
    tower_hat, crown_band, crest, horn
)
from ..types.accoutrements import (
    flap, blob, pouch_belt, sash_with_tail, button_row, pendants, strap, tube, tassel, rosette
)


def _dorsal_pad(gid, pad_paint, z_off=-0.01, pad_size=(0.18, 0.052, 0.22), clearance=0.022):
    """Flush Spine2-weighted dorsal mounting pad seated against the upper back (replaces loose front pack_straps)."""
    c_sp = spine_at(core.CHEST + z_off)
    anc = surface_out(c_sp, np.array([0.0, 1.0, 0.0]), clearance, bvh=core.BVH_T)
    return [blob(f'{gid}_dorsal_pad', anc, pad_size, pad_paint, n=14, rows=6,
                 out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2')]


def _build_chest_gold_chain(gid_prefix, z_neck, w_loop, drop_z, coat_ease, paint, n_links=33):
    """Build a continuous 3D gold chain loop with closely interlocking links resting flush on the chest."""
    parts = []
    curve_pts = []
    n_curve = 25
    for k in range(n_curve):
        u = k / float(n_curve - 1)
        ang = (u - 0.5) * 0.94 * math.pi
        bx = math.sin(ang) * w_loop
        bz = z_neck - math.cos(ang) * drop_z
        curve_pts.append(chest_front(bz, coat_ease + 0.0035, x=bx))
    # Continuous solid gold inner chain core pinned rigidly to Spine2 so links never shear or float
    parts.append(horn(f'{gid_prefix}_cord', curve_pts, 0.0065, 0.0065, paint, n=8, rows=n_curve,
                      rigid_joint='Spine2', role='trinket'))
    # Interlocking sculpted 3D oval gold chain links along the cord (overlapping by ~28%)
    for k in range(n_links):
        u = k / float(n_links - 1)
        ang = (u - 0.5) * 0.94 * math.pi
        bx = math.sin(ang) * w_loop
        bz = z_neck - math.cos(ang) * drop_z
        b_pos = chest_front(bz, coat_ease + 0.0040, x=bx)
        sx = 0.015 if (k % 2 == 0) else 0.012
        sz = 0.012 if (k % 2 == 0) else 0.015
        parts.append(blob(f'{gid_prefix}_link_{k}', b_pos, (sx, 0.010, sz), paint,
                          n=8, rows=4, out=FRONT, rigid_joint='Spine2', role='trinket'))
    return parts


# ===============================================================================================================
# 1. TOWN & RICH BASE SETS: Upgraded High-Resolution Xanadui Kurta / Chuba & Pangden + Silk Jama
# ===============================================================================================================
def _build_f_town_cap():
    set_body('mpfb_female')
    gid = 'xan_f_town_cap'
    parts = []
    cap_paint = P('lacrose', 0.04, [
        B('bottom', 0.0, 0.015, 'solid', 'gold'),
        B('bottom', 0.015, 0.042, 'cholet_pangden', 'kesar', 'peacock', 0.04),
        B('top', 0.0, 0.015, 'stripes', 'gold', 'peacock', 0.02),
    ], fabric=WOOL)
    parts.append(head_rings(gid + '_crown', 0.58, 1.0, 0.014, cap_paint, n=32, rows=6, apex=True))
    cuff_paint = P('peacock', 0.04, [
        B('top', 0.0, 0.008, 'solid', 'gold'),
        B('bottom', 0.0, 0.008, 'solid', 'gold'),
    ], [
        PN(0.35, 0.65, 'diamonds', 'gold', 'kesar', 0.035),
    ], fabric='cloth.silk')
    parts.append(crown_band(gid + '_cuff', cuff_paint, f0=0.54, f1=0.72, ease=0.018, flare=0.006, n=32))
    return [assemble_garment(gid, 'Townsfolk Embroidered Pillbox Cap', 'head', 'xanadu', parts,
                             covers_hair=False, covers_face=False)]


def _build_town_and_rich_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    ANKLE = core.ANKLE
    entries = []

    # --- 1. TOWN TORSO (`xan_m/f_town_tunic`): Contoured Kurta (Male) / Tibetan Chuba & 3D Pangden Apron (Female) ---
    gid_tt = f'xan_{sex}_town_tunic'
    parts_tt = []
    if sex == 'm':
        kurta_paint = P('kesar', 0.04, [
            B('top', 0.0, 0.020, 'solid', 'peacock'),
            B('bottom', 0.0, 0.022, 'solid', 'peacock'),
            B('bottom', 0.022, 0.085, 'cholet_pangden', 'peacock', 'kesar', 0.06),
        ], [
            PN(0.45, 0.55, 'cholet_pangden', 'peacock', 'gold', 0.08, down=0.36),
            PN(0.43, 0.45, 'solid', 'gold', 'peacock', 1.0, down=0.36),
            PN(0.55, 0.57, 'solid', 'gold', 'peacock', 1.0, down=0.36),
        ], fabric=COTTON)
        parts_tt.append(torso_tube(gid_tt + '_kurta', TOP, KNEE + 0.05, 0.014, kurta_paint,
                                   n=48, rows=22, hang_from=WAIST - 0.02, flare=0.12,
                                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02, iters=4))
        parts_tt.append(stand_collar(gid_tt,
                                     P('peacock', 0.03, [B('top', 0.0, 0.010, 'solid', 'gold'),
                                                         B('bottom', 0.0, 0.010, 'solid', 'kesar')], fabric='cloth.silk'),
                                     high=0.034))
        parts_tt.extend(button_row(gid_tt, TOP - 0.02, CHEST - 0.04, n_buttons=4,
                                   paint=P('gold', 0.02, fabric='metal.gold'), ease=0.018))
        sash_p = P('peacock', 0.04, [
            B('top', 0.0, 0.010, 'solid', 'gold'),
            B('bottom', 0.0, 0.010, 'solid', 'gold'),
        ], [PN(0.0, 1.0, 'cholet_pangden', 'kesar', 'peacock', 0.05)], fabric=WOOL)
        parts_tt.extend(sash_with_tail(gid_tt, sash_p, sash_p, ease=0.019, tail=0.26))
        sl_p = P('kesar', 0.04, [
            B('bottom', 0.0, 0.020, 'solid', 'gold'),
            B('bottom', 0.020, 0.065, 'cholet_pangden', 'peacock', 'kesar', 0.045),
        ], fabric=COTTON)
        parts_tt.extend(sleeves(gid_tt, 'wrist', 0.014, sl_p, ease_end=0.020, rows=12, rmax=0.112))
        entries.append(assemble_garment(gid_tt, 'Xanadui kurta', 'torso', 'xanadu', parts_tt))
    else:
        chuba_paint = P('yakbrown', 0.05, [
            B('top', 0.0, 0.022, 'solid', 'lacrose'),
            B('bottom', 0.0, 0.028, 'solid', 'lacrose'),
            B('bottom', 0.028, 0.085, 'cholet_pangden', 'lacrose', 'peacock', 0.06),
        ], [
            # Diagonal Tibetan chuba wrap lapel across the chest
            PN(0.42, 0.58, 'solid', 'cream', 'lacrose', 1.0, down=0.22),
            PN(0.39, 0.42, 'stripes', 'gold', 'lacrose', 0.03, down=0.38),
            PN(0.58, 0.61, 'stripes', 'gold', 'peacock', 0.03, down=0.38),
        ], fabric=WOOL)
        parts_tt.append(torso_tube(gid_tt + '_chuba', TOP, ANKLE + 0.05, 0.014, chuba_paint,
                                   n=48, rows=24, hang_from=WAIST - 0.02, flare=0.15,
                                   group_below=CROTCH + 0.02, hull_from=CHEST + 0.02, iters=4))
        parts_tt.append(stand_collar(gid_tt,
                                     P('cream', 0.03, [B('top', 0.0, 0.010, 'solid', 'peacock'),
                                                       B('bottom', 0.0, 0.010, 'solid', 'lacrose')], fabric='cloth.silk'),
                                     high=0.032))
        # Separate 3D contoured Cholet-Pangden woven striped apron over the front skirt
        pangden_paint = P('lacrose', 0.05, [
            B('top', 0.0, 0.018, 'solid', 'gold'),
            B('bottom', 0.0, 0.022, 'solid', 'peacock'),
        ], [
            PN(0.0, 1.0, 'cholet_pangden', 'kesar', 'peacock', 0.14),
        ], fabric=WOOL)
        parts_tt.extend(tabard(gid_tt + '_pangden', KNEE - 0.04, WAIST + 0.01, pangden_paint,
                               width=0.22, ease=0.024, front=True, back=True))
        sash_p = P('lacrose', 0.04, [
            B('top', 0.0, 0.010, 'solid', 'gold'),
            B('bottom', 0.0, 0.010, 'solid', 'peacock'),
        ], fabric=WOOL)
        parts_tt.append(torso_tube(gid_tt + '_sash', WAIST + 0.032, WAIST - 0.032, 0.034, sash_p, n=48, rows=5))
        sl_p = P('yakbrown', 0.05, [
            B('bottom', 0.0, 0.022, 'solid', 'gold'),
            B('bottom', 0.022, 0.072, 'cholet_pangden', 'lacrose', 'peacock', 0.045),
            B('bottom', 0.072, 0.145, 'solid', 'cream'),
            B('bottom', 0.145, 0.158, 'solid', 'lacrose'),
        ], fabric=WOOL)
        parts_tt.extend(sleeves(gid_tt, 'wrist', 0.014, sl_p, ease_end=0.021, rows=12, rmax=0.112))
        entries.append(assemble_garment(gid_tt, 'Xanadui chuba and apron', 'torso', 'xanadu', parts_tt))

    # --- 1B. TOWN BOOTS (`xan_m/f_town_boots`): Closed-Heel Contoured Xanadui Felt Boots ---
    gid_tb = f'xan_{sex}_town_boots'
    tb_sole = P('earth', 0.10, fabric='leather.buckskin')
    tb_upper = P('pomegranate', 0.05, [
        B('top', 0.0, 0.05, 'stripes', 'peacock', 'kesar', 0.012),
    ], fabric='cloth.felt.boiled')
    entries.append(assemble_garment(gid_tb, 'Xanadui felt boots', 'feet', 'xanadu',
                                    boots(gid_tb, tb_sole, tb_upper, top=0.52, ease_top=0.022)))

    # --- 1C. RICH SLIPPERS (`xan_m/f_rich_slippers`): Closed-Heel Silk & Gold Court Slippers ---
    gid_rs = f'xan_{sex}_rich_slippers'
    rs_sole = P('earth', 0.08, fabric='leather.polished')
    rs_upper = P('violet', 0.04, [
        B('top', 0.0, 0.025, 'solid', 'gold'),
    ], fabric='cloth.silk')
    entries.append(assemble_garment(gid_rs, 'Xanadui silk slippers', 'feet', 'xanadu',
                                    boots(gid_rs, rs_sole, rs_upper, top=0.28, ease_top=0.016)))

    # --- 2. RICH TORSO (`xan_m/f_rich_jama`): High-Resolution Pleated Persian-Mughal Silk Jama & Sash ---
    gid_rj = f'xan_{sex}_rich_jama'
    parts_rj = []
    jama_paint = P('violet', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.105, 'xanadu_sun_wheel', 'gold', 'violet', 0.08),
        B('bottom', 0.105, 0.120, 'solid', 'gold'),
    ], [
        # Side pleated silk panels & center-front imperial brocade chest plastron
        PN(0.12, 0.38, 'brocade_skirt', 'gold', 'violet', 0.22),
        PN(0.62, 0.88, 'brocade_skirt', 'gold', 'violet', 0.22),
        PN(0.38, 0.41, 'solid', 'gold', 'gold', 1.0),
        PN(0.59, 0.62, 'solid', 'gold', 'gold', 1.0),
        PN(0.41, 0.59, 'xanadu_sun_wheel', 'gold', 'pomegranate', 0.18, down=0.44),
    ], fabric='cloth.silk')
    parts_rj.append(torso_tube(gid_rj + '_jama', TOP, ANKLE + 0.06, 0.015, jama_paint,
                               n=52, rows=24, hang_from=WAIST + 0.01, flare=0.18,
                               group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    # Contoured shoulder-hugging jewelled collar disc + standing silk neck collar
    parts_rj.append(collar_disc(gid_rj + '_collar', 0.068,
                                P('gold', 0.02, [B('top', 0.0, 0.024, 'beads', 'pomegranate', 'gold', 0.022)], fabric='metal.gold'),
                                drop=0.064, scallop=0.06, ease=0.018, rows=8))
    parts_rj.append(stand_collar(gid_rj + '_neck',
                                 P('pomegranate', 0.03, [B('top', 0.0, 0.010, 'solid', 'gold')], fabric='cloth.silk'),
                                 high=0.032))
    # Flush ruby-and-gold pectoral brooch at the sternum
    p_brooch = chest_front(CHEST + 0.01, 0.021, x=0.0)
    parts_rj.append(rosette(gid_rj + '_brooch', p_brooch, FRONT, np.array([1.0, 0.0, 0.0]), 0.028,
                            P('gold', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'pomegranate')], fabric='metal.gold'),
                            n=12, thick=0.010, rigid_joint='Spine2'))
    # Conformed kesar-and-gold silk cummerbund sash with pleated hanging tail
    rich_sash_p = P('kesar', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
        B('bottom', 0.0, 0.012, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'diamonds', 'gold', 'kesar', 0.04)], fabric='cloth.silk')
    parts_rj.extend(sash_with_tail(gid_rj, rich_sash_p, rich_sash_p, ease=0.019, tail=0.32))
    sl_rj = P('violet', 0.03, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.080, 'xanadu_sun_wheel', 'gold', 'pomegranate', 0.045),
    ], fabric='cloth.silk')
    parts_rj.extend(sleeves(gid_rj, 'wrist', 0.015, sl_rj, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_rj, 'Silk jama and sash', 'torso', 'xanadu', parts_rj))
    return entries


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
    mband_paint = P('mongolblue', 0.03, [
        B('top', 0.0, 0.008, 'solid', 'gold'),
        B('bottom', 0.0, 0.008, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'xanadu_mosaic', 'turq', 'mongolblue', 0.10),
    ], fabric='cloth.silk')
    parts_h.append(crown_band(gid_h + '_mosaic_band', mband_paint, f0=0.48, f1=0.76, ease=0.025, flare=0.008, rows=6, n=36))

    c_brow = a + (b - a) * 0.62
    h_brow = first_hit(c_brow, -bk) or 0.102
    badge_c = c_brow - bk * (h_brow + 0.032)
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
        B('bottom', 0.025, 0.085, 'cholet_pangden', 'kesar', 'turq', 0.05),
        B('bottom', 0.085, 0.120, 'diamonds', 'gold', 'lacrose', 0.045),
    ], [
        PN(0.39, 0.42, 'stripes', 'gold', 'kesar', 0.025),
        PN(0.58, 0.61, 'stripes', 'gold', 'kesar', 0.025),
        PN(0.42, 0.58, 'xanadu_mosaic', 'turq', 'mongolblue', 0.18),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_qaba', TOP, KNEE + 0.04, 0.015, qaba_paint,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    parts_t.append(stand_collar(gid_t,
                                P('turq', 0.03, [B('top', 0.0, 0.012, 'solid', 'gold'),
                                                 B('bottom', 0.0, 0.012, 'solid', 'kesar')], fabric='cloth.silk'),
                                high=0.038))

    # Maroon Penbey twig-band waist sash with flush Gold Sun-and-Moon Guild Seal
    sash_paint = P('maroon', 0.05, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
        B('bottom', 0.0, 0.012, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'diamonds', 'gold', 'maroon', 0.04),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.045, WAIST - 0.040, 0.020, sash_paint,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='band'))

    p_seal = chest_front(WAIST + 0.005, 0.022, x=0.0)
    parts_t.append(rosette(gid_t + '_seal', p_seal, FRONT, np.array([1.0, 0.0, 0.0]), 0.034,
                           P('gold', 0.02, [B('bottom', 0.0, 0.01, 'solid', 'turq')], fabric='metal.gold'),
                           n=12, thick=0.010, rigid_joint='Spine1'))

    # Diagonal Leather & Brass Assay/Alchemist Bandolier with flush Spice/Acid Phials (raised +12mm over clavicle/shoulder)
    parts_t.append(crossed_sash(gid_t + '_bandolier',
                                P('leather', 0.06, [B('top', 0.0, 0.008, 'solid', 'gold'),
                                                    B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric='leather.polished'),
                                width=0.046, ease=0.033))
    for idx, (z_f, x_off, col_phial) in enumerate([
        (CHEST + 0.03,  0.065, 'turq'),
        (CHEST - 0.01,  0.020, 'saffron'),
        (CHEST - 0.05, -0.025, 'lacrose'),
        (WAIST + 0.06, -0.068, 'gold'),
    ]):
        p_ph = chest_front(z_f, 0.034, x=x_off)
        parts_t.append(tube(f'{gid_t}_phial_{idx}',
                            [p_ph - np.array([0.0, 0.0, 0.024]), p_ph + np.array([0.0, 0.0, 0.024])],
                            0.011,
                            P(col_phial, 0.02, [B('top', 0.0, 0.012, 'solid', 'gold'),
                                                B('bottom', 0.0, 0.010, 'solid', 'gold')], fabric='metal.gold'),
                            n=10, rigid_joint='Spine2'))

    sl_paint = P('mongolblue', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.085, 'xanadu_mosaic', 'turq', 'mongolblue', 0.04),
    ], fabric='cloth.silk')
    parts_t += sleeves(gid_t, 'wrist', 0.016, sl_paint, ease_end=0.026, rows=10)
    entries.append(assemble_garment(gid_t, 'Guildmaster Mosaic Qaba Coat & Assay Bandolier', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Gilded Assay Strongbox, Copper Alchemical Retort & Spice-Ledger Satchel (`xan_m/f_guild_pack`) ---
    gid_b = f'xan_{sex}_guild_pack'
    parts_b = []
    c_back = spine_at(CHEST - 0.01)
    d_back = first_hit(c_back, np.array([0.0, 1.0, 0.0])) or 0.115
    box_c = c_back + np.array([0.0, d_back + 0.062, 0.0])
    box_paint = P('yakbrown', 0.06, [
        B('top', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
    ], [
        PN(0.15, 0.85, 'xanadu_sun_wheel', 'gold', 'maroon', 0.20),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_strongbox', box_c, (0.25, 0.13, 0.30), box_paint,
                        n=18, rows=8, out=np.array([0.0, 1.0, 0.0]), rigid_joint='Spine2'))
    retort_c = box_c + np.array([-0.045, 0.010, 0.165])
    parts_b.append(blob(gid_b + '_retort_bulb', retort_c, (0.09, 0.09, 0.10),
                        P('copper', 0.03, [B('bottom', 0.0, 0.015, 'solid', 'turq')], fabric='metal.bronze'),
                        n=14, rows=6, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_retort_neck',
                        [retort_c + np.array([0.0, 0.0, 0.040]), retort_c + np.array([0.095, 0.0, 0.010])],
                        0.014, P('copper', 0.03, fabric='metal.bronze'), n=10, rigid_joint='Spine2'))
    roll_y = box_c[1] + 0.010
    roll_z = box_c[2] - 0.155
    parts_b.append(tube(gid_b + '_ledger_roll',
                        [np.array([-0.14, roll_y, roll_z]), np.array([0.14, roll_y, roll_z])],
                        0.036,
                        P('kesar', 0.04, [B('top', 0.0, 0.03, 'solid', 'gold'),
                                          B('bottom', 0.0, 0.03, 'solid', 'gold')], fabric='cloth.silk'),
                        n=14, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'gold'),
                                                          B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Guildmaster Assay Strongbox, Copper Retort & Ledger Pack', 'back', 'xanadu', parts_b))

    # --- 4. LEGS: Palopó-Cuffed Bazaar Shalwar (`xan_m/f_guild_trousers`) ---
    gid_l = f'xan_{sex}_guild_trousers'
    trou_paint = P('lacrose', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.075, 'cholet_pangden', 'turq', 'kesar', 0.04),
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

    # --- 1. HEAD: Gold-Embroidered Crimson Kufi & Flush Opal-Gilt Pom-Pom (`xan_m/f_magnate_kufi`) ---
    gid_h = f'xan_{sex}_magnate_kufi'
    parts_h = []
    kufi_paint = P('holyred', 0.05, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
        B('bottom', 0.018, 0.055, 'fret', 'gold', 'holyred', 0.05),
        B('bottom', 0.055, 0.090, 'diamonds', 'gold', 'crimson', 0.045),
        B('top', 0.0, 0.025, 'beads', 'gold', 'holyred', 0.035),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_cap', 0.135, lambda s: 1.04 * (1.0 - 0.52 * (s ** 2.4)), kufi_paint,
                             f=0.48, ease=0.026, rows=10, n=36))
    # Flush gold finial mount + wool pom-pom seated directly on the crown apex (no gap)
    pom_c = a + (b - a) * 0.48 + up * 0.124
    parts_h.append(rosette(gid_h + '_finial_mount', pom_c - up * 0.006, up, -bk, 0.032,
                           P('gold', 0.02, fabric='metal.gold'), n=12, thick=0.008, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_pompom', pom_c + up * 0.008, (0.062, 0.062, 0.052), P('holyred', 0.08, fabric=WOOL),
                        n=12, rows=5, out=up, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Karavan-Bashi Gold-Embroidered Crimson Kufi & Pom-Pom', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Floor-Length Sable Fur Pelisse, Interlocking Gold Chains & Medallion (`xan_m/f_magnate_pelisse`) ---
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
        PN(0.41, 0.59, 'xanadu_sun_wheel', 'gold', 'holyred', 0.24),
        PN(0.41, 0.59, 'solid', 'deepgreen', 'deepgreen', 1.0, down=0.58),
        PN(0.45, 0.55, 'diamonds', 'gold', 'soot', 0.08, down=0.22),
    ], fabric='fur.sable.sheared')
    parts_t.append(torso_tube(gid_t + '_pelisse', TOP + 0.01, ANKLE + 0.04, 0.022, pelisse_paint,
                              n=52, hang_from=WAIST - 0.02, flare=0.10,
                              group_below=CROTCH + 0.02, hull_from=WAIST, over_arms=False))

    # Shoulder-draped Sable Fur Shawl Mantle + Sleek Contoured Sable Shoulder Caps (no floating ring around jaw!)
    fur_paint = P('sable', 0.11, [
        B('bottom', 0.0, 0.025, 'solid', 'soot'),
        B('top', 0.0, 0.025, 'solid', 'darkfur'),
    ], [
        PN(0.0, 1.0, 'fluted', 'darkfur', 'sable', 0.14),
    ], fabric='fur.sable.sheared')
    parts_t.append(collar_disc(gid_t + '_fur_collar', 0.088, fur_paint, drop=0.068, scallop=0.04, ease=0.022, rows=6))
    parts_t.append(pauldron(gid_t + '_fur_sh_L', L, fur_paint, reach=0.33, ease=0.025, flare_end=0.96))
    parts_t.append(pauldron(gid_t + '_fur_sh_R', R, fur_paint, reach=0.33, ease=0.025, flare_end=0.96))

    # Dual Continuous Interlocking 3D Gold Chains + Scalloped Solid-Gold Pectoral Medallion anchored at the lower chain apex
    gold_paint = P('gold', 0.02, [B('top', 0.0, 0.006, 'solid', 'ochre')], fabric='metal.gold')
    parts_t.extend(_build_chest_gold_chain(f'{gid_t}_chain_inner', TOP - 0.015, 0.068, 0.115, 0.023, gold_paint, n_links=29))
    parts_t.extend(_build_chest_gold_chain(f'{gid_t}_chain_outer', TOP - 0.015, 0.088, 0.175, 0.024, gold_paint, n_links=37))

    med_c = chest_front(TOP - 0.015 - 0.175, 0.025, x=0.0)
    parts_t.append(blob(gid_t + '_medallion', med_c, (0.088, 0.018, 0.094),
                        P('gold', 0.02, [B('top', 0.0, 0.02, 'dentils', 'ochre', 'gold', 0.02)], fabric='metal.gold'),
                        n=16, rows=6, out=FRONT, rigid_joint='Spine2', role='trinket'))

    sl_paint = P('sable', 0.10, [
        B('bottom', 0.0, 0.16, 'fret', 'gold', 'holyred', 0.045),
        B('bottom', 0.16, 0.18, 'solid', 'gold'),
    ], fabric='fur.sable.sheared')
    parts_t += sleeves(gid_t, 'wrist', 0.022, sl_paint, ease_end=0.028, rows=10, n=20)
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
    dome_paint = P('turq', 0.03, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
        B('top', 0.0, 0.025, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'xanadu_mosaic', 'turq', 'mongolblue', 0.14),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_dome', 0.175, lambda s: 0.98 * (1.0 - 0.58 * (s ** 2.0)),
                             dome_paint, f=0.52, ease=0.022, rows=10, n=36))

    diadem_paint = P('gold', 0.02, [
        B('bottom', 0.0, 0.012, 'beads', 'holyred', 'gold', 0.02),
        B('top', 0.0, 0.010, 'dentils', 'saffron', 'gold', 0.035),
    ], [
        PN(0.38, 0.62, 'xanadu_sun_wheel', 'gold', 'maroon', 0.08),
    ], fabric='metal.gold')
    parts_h.append(crown_band(gid_h + '_diadem', diadem_paint, f0=0.48, f1=0.84, ease=0.024, flare=0.014, rows=7, n=40))

    c_crown = a + (b - a) * 0.72
    for idx, ang_leaf in enumerate((-0.42 * math.pi, -0.21 * math.pi, 0.0, 0.21 * math.pi, 0.42 * math.pi)):
        d_leaf = -bk * math.cos(ang_leaf) + left * math.sin(ang_leaf)
        d_leaf /= np.linalg.norm(d_leaf)
        h_l = first_hit(c_crown, d_leaf) or 0.10
        p_leaf = c_crown + d_leaf * (h_l + 0.030)
        parts_h.append(blob(f'{gid_h}_leaf_{idx}', p_leaf, (0.042, 0.015, 0.066),
                            P('gold', 0.02, [B('bottom', 0.0, 0.015, 'solid', 'turq')], fabric='metal.gold'),
                            n=12, rows=5, out=d_leaf, rigid_joint='Head'))

    c_apex = a + (b - a) * 0.52 + up * 0.172
    parts_h.append(tube(gid_h + '_wheel_drum',
                        [c_apex - up * 0.012, c_apex + up * 0.042],
                        0.024,
                        P('maroon', 0.03, [B('top', 0.0, 0.010, 'solid', 'gold'),
                                           B('bottom', 0.0, 0.010, 'solid', 'gold')], fabric='metal.gold'),
                        n=16, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_wheel_spire', c_apex + up * 0.052, (0.032, 0.032, 0.048),
                        P('gold', 0.02, fabric='metal.gold'), n=12, rows=5, out=up, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Kora Wheel-Priest Five-Leaf Crown & Turquoise Mitre', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Sanctum Robe of the Eight-Spoked Wheel & Tocharian Syllabary (`xan_m/f_priest_robe`) ---
    gid_t = f'xan_{sex}_priest_robe'
    parts_t = []
    robe_paint = P('holyred', 0.04, [
        B('top', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.0, 0.030, 'solid', 'gold'),
        B('bottom', 0.030, 0.105, 'tocharian_wheel', 'gold', 'omaroon', 0.08),
        B('bottom', 0.105, 0.135, 'solid', 'saffron'),
    ], [
        PN(0.18, 0.36, 'fluted', 'saffron', 'kesar', 0.06),
        PN(0.64, 0.82, 'fluted', 'saffron', 'kesar', 0.06),
        PN(0.36, 0.40, 'solid', 'gold', 'gold', 1.0),
        PN(0.60, 0.64, 'solid', 'gold', 'gold', 1.0),
        PN(0.40, 0.60, 'tocharian_wheel', 'gold', 'omaroon', 0.24),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_robe', TOP, ANKLE + 0.04, 0.015, robe_paint,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.18,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Maroon Penbey chest-frieze band (seated cleanly across the ribcage below the armpits)
    frieze_paint = P('omaroon', 0.05, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_penbey_band', CHEST + 0.012, CHEST - 0.055, 0.017, frieze_paint,
                              n=42, rows=4, hull_from=CHEST + 0.02, role='band'))

    # Three flush 3D Gold Eight-Spoked Dharma Wheel Roundels sitting directly on the maroon Penbey chest band
    for idx, x_off in enumerate((-0.072, 0.0, 0.072)):
        p_rnd = chest_front(CHEST - 0.022, 0.028, x=x_off)
        r_wheel = 0.032 if idx == 1 else 0.024
        parts_t.append(rosette(f'{gid_t}_wheel_roundel_{idx}', p_rnd, FRONT, np.array([1.0, 0.0, 0.0]),
                               r_wheel,
                               P('gold', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'turq')], fabric='metal.gold'),
                               n=8, thick=0.009, rigid_joint='Spine2'))

    # Contoured Gilded Shoulder Epaulettes + Shoulder-Draped Mantle Collar
    gilt_sh_paint = P('gold', 0.02, [
        B('bottom', 0.0, 0.020, 'dentils', 'holyred', 'gold', 0.025),
        B('top', 0.0, 0.015, 'solid', 'omaroon'),
    ], fabric='metal.gold')
    parts_t.append(collar_disc(gid_t + '_collar', 0.060, gilt_sh_paint, drop=0.052, scallop=0.06, ease=0.018, rows=6))
    parts_t.append(pauldron(gid_t + '_gilt_sh_L', L, gilt_sh_paint, reach=0.34, ease=0.023, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_gilt_sh_R', R, gilt_sh_paint, reach=0.34, ease=0.023, flare_end=0.98))

    # Saffron & Gold Liturgical Sash
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.04, WAIST - 0.035, 0.020,
                              P('saffron', 0.03, [B('top', 0.0, 0.010, 'solid', 'gold'),
                                                  B('bottom', 0.0, 0.010, 'solid', 'gold')], fabric='cloth.silk'),
                              rows=5, n=42, hull_from=WAIST + 0.08, role='band'))

    # Belt-Mounted 3D Gilded Prayer Wheel (Mani Khorlo) at the right hip, touching the sash via a 3D gold bracket
    d_hip = np.array([0.78, -0.62, 0.0])
    d_hip /= np.linalg.norm(d_hip)
    p_sash_attach = surface_out(spine_at(WAIST + 0.005), d_hip, 0.018)
    p_hip = surface_out(spine_at(WAIST + 0.005), d_hip, 0.030)
    parts_t.append(tube(gid_t + '_mani_bracket',
                        [p_sash_attach, p_hip],
                        0.010, P('gold', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_mani_drum',
                        [p_hip - np.array([0.0, 0.0, 0.042]), p_hip + np.array([0.0, 0.0, 0.042])],
                        0.026,
                        P('omaroon', 0.03, [
                            B('top', 0.0, 0.014, 'solid', 'gold'),
                            B('bottom', 0.0, 0.014, 'solid', 'gold'),
                        ], [
                            PN(0.0, 1.0, 'tocharian_wheel', 'gold', 'omaroon', 0.06),
                        ], fabric='metal.gold'),
                        n=18, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_mani_handle',
                        [p_hip - np.array([0.0, 0.0, 0.105]), p_hip - np.array([0.0, 0.0, 0.042])],
                        0.010, P('yakbrown', 0.05, [B('bottom', 0.0, 0.015, 'solid', 'gold')]),
                        n=10, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_mani_spire', p_hip + np.array([0.0, 0.0, 0.050]), (0.032, 0.032, 0.038),
                        P('gold', 0.02, fabric='metal.gold'), n=10, rows=4, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Hips'))

    sl_paint = P('saffron', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.085, 'tocharian_wheel', 'gold', 'holyred', 0.055),
    ], fabric='cloth.silk')
    parts_t += sleeves(gid_t, 'wrist', 0.018, sl_paint, ease_end=0.028, rows=10)
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

    c_brow = a + (b - a) * 0.65
    h_brow = first_hit(c_brow, -bk) or 0.102
    aig_c = c_brow - bk * (h_brow + 0.028)
    parts_h.append(rosette(gid_h + '_aigrette', aig_c, -bk, up, 0.030,
                           P('gold', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'pomegranate')], fabric='metal.gold'),
                           n=10, thick=0.010, rigid_joint='Head'))
    parts_h.append(horn(gid_h + '_plume',
                        [aig_c + up * 0.015, aig_c + up * 0.085 - bk * 0.018, aig_c + up * 0.145 + bk * 0.010],
                        0.024, 0.006,
                        P('turq', 0.03, [B('top', 0.0, 0.025, 'solid', 'gold'),
                                         B('bottom', 0.0, 0.020, 'solid', 'pomegranate')], fabric='cloth.silk'),
                        n=10, rows=7, rigid_joint='Head'))

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
        PN(0.12, 0.38, 'xanadu_sun_wheel', 'gold', 'violet', 0.22),
        PN(0.62, 0.88, 'xanadu_sun_wheel', 'gold', 'violet', 0.22),
        PN(0.38, 0.41, 'solid', 'gold', 'gold', 1.0),
        PN(0.59, 0.62, 'solid', 'gold', 'gold', 1.0),
        PN(0.41, 0.59, 'moonglass_opal', 'turq', 'pomegranate', 0.16),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_entari', TOP, KNEE - 0.02, 0.014, entari_paint,
                              n=48, rows=20, hang_from=WAIST, flare=0.22,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Jewelled Harem-Lattice Girdle (Cummerbund) with flush dangling gold coin pendants
    girdle_paint = P('gold', 0.02, [
        B('top', 0.0, 0.012, 'beads', 'pomegranate', 'gold', 0.022),
        B('bottom', 0.0, 0.012, 'beads', 'turq', 'gold', 0.022),
    ], [
        PN(0.0, 1.0, 'diamonds', 'pomegranate', 'gold', 0.035),
    ], fabric='metal.gold')
    parts_t.append(torso_tube(gid_t + '_girdle', WAIST + 0.038, WAIST - 0.038, 0.019, girdle_paint,
                              rows=5, n=44, hull_from=WAIST + 0.08, role='band'))
    coin_angs = np.linspace(0, 2 * math.pi, 16, endpoint=False)
    parts_t += pendants(gid_t + '_coins', WAIST - 0.035, coin_angs, (0.024, 0.010, 0.030),
                        P('gold', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'pomegranate')], fabric='metal.gold'),
                        ease=0.018)

    # Shoulder-Draped Jewelled Collar Mantle + Standing Silk Neckband (seated flush onto entari & shoulders)
    parts_t.append(collar_disc(gid_t + '_collar', 0.078,
                               P('gold', 0.02, [
                                   B('top', 0.0, 0.022, 'beads', 'turq', 'gold', 0.022),
                                   B('bottom', 0.0, 0.016, 'dentils', 'pomegranate', 'gold', 0.024),
                               ], fabric='metal.gold'),
                               drop=0.072, scallop=0.06, ease=0.017, rows=9, z_off=-0.002))
    parts_t.append(stand_collar(gid_t + '_neck',
                                P('pomegranate', 0.03, [B('top', 0.0, 0.010, 'solid', 'gold')], fabric='cloth.silk'),
                                high=0.028))

    sl_paint = P('violet', 0.03, [
        B('bottom', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.028, 0.085, 'stripes', 'turq', 'gold', 0.025),
    ], fabric='cloth.silk')
    parts_t += sleeves(gid_t, 'wrist', 0.016, sl_paint, ease_end=0.028, rows=9)
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

    c_brow = a + (b - a) * 0.66
    h_brow = first_hit(c_brow, -bk) or 0.102
    sun_c = c_brow - bk * (h_brow + 0.034)
    parts_h.append(rosette(gid_h + '_sun_jewel', sun_c, -bk, up, 0.034,
                           P('gold', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'holyred')], fabric='metal.gold'),
                           n=12, thick=0.010, rigid_joint='Head'))
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
        PN(0.10, 0.36, 'xanadu_sun_wheel', 'gold', 'mongolblue', 0.24),
        PN(0.64, 0.90, 'xanadu_sun_wheel', 'gold', 'mongolblue', 0.24),
        PN(0.36, 0.40, 'solid', 'gold', 'gold', 1.0),
        PN(0.60, 0.64, 'solid', 'gold', 'gold', 1.0),
        PN(0.40, 0.60, 'xanadu_sun_wheel', 'gold', 'omaroon', 0.22),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_khalat', TOP, ANKLE + 0.04, 0.016, khalat_paint,
                              n=50, rows=22, hang_from=WAIST - 0.01, flare=0.22,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Shoulder-Draped Collar of State & Contoured Sovereign Epaulettes
    ep_paint = P('gold', 0.02, [
        B('bottom', 0.0, 0.022, 'fret', 'omaroon', 'gold', 0.03),
        B('top', 0.0, 0.014, 'solid', 'turq'),
    ], fabric='metal.gold')
    parts_t.append(collar_disc(gid_t + '_collar', 0.072,
                               P('gold', 0.02, [B('top', 0.0, 0.028, 'beads', 'holyred', 'gold', 0.025)], fabric='metal.gold'),
                               drop=0.058, scallop=0.06, ease=0.019, rows=6))
    parts_t.append(pauldron(gid_t + '_ep_L', L, ep_paint, reach=0.35, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_ep_R', R, ep_paint, reach=0.35, ease=0.024, flare_end=0.98))

    # Continuous 3D Chancellor's Gold Chain of State Seals across the chest
    gold_chain_p = P('gold', 0.02, [B('top', 0.0, 0.006, 'solid', 'ochre')], fabric='metal.gold')
    parts_t.extend(_build_chest_gold_chain(f'{gid_t}_seal_chain', TOP - 0.020, 0.088, 0.145, 0.018, gold_chain_p, n_links=33))
    for k in range(9):
        u_s = k / 8.0
        ang_s = (u_s - 0.5) * 0.94 * math.pi
        x_s = math.sin(ang_s) * 0.088
        z_s = TOP - 0.020 - math.cos(ang_s) * 0.145
        p_s = chest_front(z_s, 0.023, x=x_s)
        r_s = 0.028 if k == 4 else 0.017
        parts_t.append(rosette(f'{gid_t}_state_seal_{k}', p_s, FRONT, np.array([1.0, 0.0, 0.0]),
                               r_s,
                               P('gold', 0.02, [B('bottom', 0.0, 0.006, 'solid', 'jade' if k == 4 else 'holyred')], fabric='metal.gold'),
                               n=10, thick=0.009, rigid_joint='Spine2'))

    # Spun-Gold & Maroon Divan Sash with Belt-Mounted Jade-and-Gold Ledger Scroll Tube at left hip
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.045, WAIST - 0.040, 0.021,
                              P('gold', 0.02, [B('top', 0.0, 0.014, 'solid', 'omaroon'),
                                               B('bottom', 0.0, 0.014, 'solid', 'omaroon')], fabric='metal.gold'),
                              rows=5, n=42, hull_from=WAIST + 0.08, role='band'))
    d_scroll = np.array([-0.78, -0.62, 0.0])
    d_scroll /= np.linalg.norm(d_scroll)
    p_sash_l = surface_out(spine_at(WAIST + 0.005), d_scroll, 0.019)
    p_scroll = surface_out(spine_at(WAIST + 0.005), d_scroll, 0.028)
    parts_t.append(tube(gid_t + '_ledger_loop',
                        [p_sash_l, p_scroll],
                        0.010, P('gold', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_jade_ledger',
                        [p_scroll - np.array([0.0, 0.015, 0.070]), p_scroll + np.array([0.0, -0.015, 0.070])],
                        0.022,
                        P('jade', 0.03, [B('top', 0.0, 0.022, 'solid', 'gold'),
                                         B('bottom', 0.0, 0.022, 'solid', 'gold')], fabric='metal.gold'),
                        n=14, rigid_joint='Hips'))

    sl_paint = P('mongolblue', 0.03, [
        B('bottom', 0.0, 0.032, 'solid', 'gold'),
        B('bottom', 0.032, 0.110, 'xanadu_sun_wheel', 'gold', 'omaroon', 0.05),
    ], fabric='cloth.silk')
    parts_t += sleeves(gid_t, 'wrist', 0.018, sl_paint, ease_end=0.028, rows=10)
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
        PN(0.0, 1.0, 'chahar_aina', 'gold', 'steel', 0.08),
    ], fabric='metal.iron')
    parts_h.append(head_rings(gid_h + '_bowl', 0.56, 1.0, 0.016, bowl_paint, n=36, rows=7, apex=True))

    rim_paint = P('gold', 0.02, [
        B('top', 0.0, 0.008, 'solid', 'holyred'),
        B('bottom', 0.0, 0.008, 'solid', 'steel'),
    ], fabric='metal.gold')
    parts_h.append(crown_band(gid_h + '_rim', rim_paint, f0=0.52, f1=0.66, ease=0.019, flare=0.004, n=36))

    c_brow = a + (b - a) * 0.58
    h_brow = first_hit(c_brow, -bk) or 0.102
    nasal_br = c_brow - bk * (h_brow + 0.018)
    nasal_top = c_brow - bk * (h_brow + 0.024) + up * 0.028
    nasal_bot = c_brow - bk * (h_brow + 0.026) - up * 0.046
    parts_h.append(blob(gid_h + '_nasal_clamp', nasal_br + up * 0.004, (0.028, 0.016, 0.020),
                        P('gold', 0.02, fabric='metal.gold'), n=10, rows=4, out=-bk, rigid_joint='Head'))
    parts_h.append(tube(gid_h + '_nasal_bar', [nasal_top, nasal_bot], 0.008,
                        P('gold', 0.02, [B('top', 0.0, 0.018, 'solid', 'holyred')], fabric='metal.gold'),
                        n=10, rigid_joint='Head'))

    c_apex_ray = a + (b - a) * 0.85
    h_apex = first_hit(c_apex_ray, up)
    apex_surf = (c_apex_ray + up * (h_apex + 0.015)) if h_apex is not None else (a + (b - a) * 1.0 + up * 0.012)
    parts_h.append(rosette(gid_h + '_spike_base', apex_surf, up, -bk, 0.028,
                           P('gold', 0.02, fabric='metal.gold'), n=12, thick=0.010, rigid_joint='Head'))
    parts_h.append(horn(gid_h + '_spike',
                        [apex_surf - up * 0.010, apex_surf + up * 0.100],
                        0.020, 0.003,
                        P('gold', 0.02, [B('bottom', 0.0, 0.025, 'solid', 'holyred')], fabric='metal.gold'),
                        n=12, rows=6, rigid_joint='Head'))
    c_sock = a + (b - a) * 0.68
    for s_tag, s_sign, col_plume in (('L', 1.0, 'saffron'), ('R', -1.0, 'holyred')):
        d_sock = -bk * 0.82 + left * (s_sign * 0.50) + up * 0.26
        d_sock /= np.linalg.norm(d_sock)
        h_sock = first_hit(c_sock, d_sock) or 0.096
        p_bowl = c_sock + d_sock * (h_sock + 0.015)
        parts_h.append(rosette(f'{gid_h}_plume_socket_{s_tag}', p_bowl, d_sock, up, 0.020,
                               P('gold', 0.02, fabric='metal.gold'), n=10, thick=0.010, rigid_joint='Head'))
        d_pl = up * 0.84 + left * (s_sign * 0.34) + bk * 0.18
        d_pl /= np.linalg.norm(d_pl)
        p_pl0 = p_bowl - d_sock * 0.008
        p_pl1 = p_bowl + d_pl * 0.048 + d_sock * 0.010
        p_pl2 = p_bowl + d_pl * 0.098 + bk * 0.018
        parts_h.append(horn(f'{gid_h}_plume_{s_tag}',
                            [p_pl0, p_pl1, p_pl2],
                            0.016, 0.005,
                            P(col_plume, 0.03, [B('bottom', 0.0, 0.022, 'solid', 'gold')], fabric='cloth.silk'),
                            n=10, rows=6, rigid_joint='Head'))

    av_paint = P('steel', 0.04, [
        B('bottom', 0.0, 0.018, 'solid', 'holyred'),
    ], [
        PN(0.0, 1.0, 'chahar_aina', 'gold', 'steel', 0.055),
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
    alkhalig_paint = P('holyred', 0.05, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.028, 0.085, 'fret', 'gold', 'mongolblue', 0.045),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'holyred', 'omaroon', 0.16),
        PN(0.41, 0.59, 'chahar_aina', 'gold', 'steel', 0.24, down=0.46),
        PN(0.0, 0.10, 'chahar_aina', 'gold', 'steel', 0.24, down=0.46),
        PN(0.90, 1.0, 'chahar_aina', 'gold', 'steel', 0.24, down=0.46),
    ], fabric='cloth.quilted.diamond')
    parts_t.append(torso_tube(gid_t + '_alkhalig', TOP, KNEE + 0.02, 0.017, alkhalig_paint,
                              n=48, rows=20, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Raised 3D Front & Back Chahar-Aina Mirror Plates & Flush Gold Xanadu Wheel Boss
    mirror_paint = P('steel', 0.03, [
        B('top', 0.0, 0.015, 'solid', 'gold'),
        B('bottom', 0.0, 0.015, 'solid', 'gold'),
    ], [
        PN(0.15, 0.85, 'chahar_aina', 'gold', 'steel', 0.18),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_cuirass_band', CHEST + 0.016, WAIST + 0.035, 0.019, mirror_paint,
                              n=44, rows=7, hull_from=CHEST + 0.02, role='band'))

    p_boss = chest_front(CHEST - 0.045, 0.029, x=0.0)
    parts_t.append(rosette(gid_t + '_wheel_boss', p_boss, FRONT, np.array([1.0, 0.0, 0.0]), 0.040,
                           P('gold', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'holyred')], fabric='metal.gold'),
                           n=8, thick=0.011, rigid_joint='Spine2'))

    # Contoured Tibetan-Dzong Lamellar Pauldrons
    pauld_paint = P('steel', 0.03, [
        B('bottom', 0.0, 0.022, 'dentils', 'gold', 'holyred', 0.03),
        B('top', 0.0, 0.015, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'chahar_aina', 'gold', 'steel', 0.065),
    ], fabric='metal.iron')
    parts_t.append(pauldron(gid_t + '_pauld_L', L, pauld_paint, reach=0.36, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_pauld_R', R, pauld_paint, reach=0.36, ease=0.024, flare_end=0.98))

    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.04, WAIST - 0.035, 0.021,
                              P('saffron', 0.04, [B('top', 0.0, 0.010, 'solid', 'mongolblue'),
                                                  B('bottom', 0.0, 0.010, 'solid', 'mongolblue')], fabric=WOOL),
                              rows=4, n=40, hull_from=WAIST + 0.08, role='band'))

    sl_paint = P('holyred', 0.05, [
        B('bottom', 0.0, 0.15, 'chahar_aina', 'gold', 'steel', 0.045),
        B('bottom', 0.15, 0.17, 'solid', 'gold'),
    ], fabric='cloth.quilted.diamond')
    parts_t += sleeves(gid_t, 'wrist', 0.017, sl_paint, ease_end=0.025, rows=10)
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
        PN(0.25, 0.75, 'chahar_aina', 'gold', 'steel', 0.05),
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
    ], fabric='fur.yak')
    parts_h.append(head_rings(gid_h + '_dome', 0.54, 1.0, 0.018, helm_paint, n=34, rows=7, apex=True))

    flap_paint = P('fur', 0.09, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.012, 'solid', 'turq'),
    ], fabric='fur.yak')
    parts_h.append(crown_band(gid_h + '_fur_flaps', flap_paint, f0=0.44, f1=0.78, ease=0.025, flare=0.012, rows=6, n=36))

    c_brow = a + (b - a) * 0.52
    h_brow = first_hit(c_brow, -bk) or 0.102
    visor_c = c_brow - bk * (h_brow + 0.028)
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
        B('bottom', 0.040, 0.095, 'cholet_pangden', 'gold', 'cream', 0.05),
    ], [
        PN(0.0, 0.36, 'diamond_quilt', 'cream', 'turq', 0.18),
        PN(0.64, 1.0, 'diamond_quilt', 'cream', 'turq', 0.18),
        PN(0.36, 0.64, 'stripes', 'turq', 'cream', 0.05),
        PN(0.36, 0.64, 'bone_lamellar', 'gold', 'omaroon', 0.16, down=0.52),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_coat', TOP, KNEE + 0.03, 0.018, coat_paint,
                              n=46, rows=20, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Shoulder-Draped Yak-Fur Mantle & Contoured Shoulder Caps (no floating ring)
    yak_paint = P('darkfur', 0.10, [
        B('bottom', 0.0, 0.020, 'solid', 'fur'),
    ], [
        PN(0.0, 1.0, 'fluted', 'darkfur', 'fur', 0.12),
    ], fabric='fur.yak')
    parts_t.append(collar_disc(gid_t + '_fur_mantle', 0.082, yak_paint, drop=0.064, scallop=0.05, ease=0.020, rows=6))
    parts_t.append(pauldron(gid_t + '_fur_sh_L', L, yak_paint, reach=0.35, ease=0.024, flare_end=0.96))
    parts_t.append(pauldron(gid_t + '_fur_sh_R', R, yak_paint, reach=0.35, ease=0.024, flare_end=0.96))

    # Flush 3D Caves-of-Ice Crystal & Salvaged Stalker-Core Talisman on the chest
    p_crys = chest_front(CHEST - 0.01, 0.023, x=0.0)
    parts_t.append(rosette(gid_t + '_stalker_bezel', p_crys, FRONT, np.array([1.0, 0.0, 0.0]), 0.036,
                           P('gold', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'steel')], fabric='metal.gold'),
                           n=8, thick=0.009, rigid_joint='Spine2'))
    parts_t.append(blob(gid_t + '_ice_crystal', p_crys + FRONT * 0.009, (0.038, 0.022, 0.052),
                        P('cybercyan', 0.02, [B('top', 0.0, 0.008, 'solid', 'white')]),
                        n=10, rows=5, out=FRONT, rigid_joint='Spine2'))

    # Mountain Belt with Conformed Pouches
    parts_t += pouch_belt(gid_t + '_belt',
                          P('leather', 0.06, [B('top', 0.0, 0.008, 'solid', 'gold'),
                                              B('bottom', 0.0, 0.008, 'solid', 'gold')]),
                          P('yakbrown', 0.06, [B('top', 0.0, 0.015, 'solid', 'turq')]),
                          ease=0.022)

    sl_paint = P('turq', 0.05, [
        B('bottom', 0.0, 0.055, 'solid', 'darkfur'),
        B('bottom', 0.055, 0.080, 'solid', 'gold'),
    ], fabric=WOOL)
    parts_t += sleeves(gid_t, 'wrist', 0.018, sl_paint, ease_end=0.028, rows=9)
    entries.append(assemble_garment(gid_t, 'Caves-of-Ice Fur-Lined Lamellar Coat & Glacier-Crystal Talisman', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: High-Pass Gilded Dhal Buckler, Quiver & Ice-Axe Pack (`xan_m/f_icewarden_pack`) ---
    gid_b = f'xan_{sex}_icewarden_pack'
    parts_b = []
    c_back = spine_at(CHEST + 0.01)
    d_back = first_hit(c_back, np.array([0.0, 1.0, 0.0])) or 0.115
    sh_c = c_back + np.array([0.0, d_back + 0.044, 0.0])
    dhal_paint = P('omaroon', 0.03, [
        B('bottom', 0.0, 0.022, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'xanadu_sun_wheel', 'gold', 'omaroon', 0.18),
    ], fabric='metal.gold')
    parts_b.append(rosette(gid_b + '_dhal_shield', sh_c, np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                           0.185, dhal_paint, n=24, thick=0.020, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_quiver',
                        [sh_c + np.array([-0.08, 0.020, -0.14]), sh_c + np.array([0.11, 0.020, 0.18])],
                        0.030,
                        P('leather', 0.06, [B('top', 0.0, 0.025, 'solid', 'gold'),
                                            B('bottom', 0.0, 0.025, 'solid', 'turq')]),
                        n=12, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'gold')], fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'High-Pass Gilded Dhal Shield & Quiver Pack', 'back', 'xanadu', parts_b))

    # --- 4. LEGS: Quilted Yak-Wool Mountain Trousers (`xan_m/f_icewarden_trousers`) ---
    gid_l = f'xan_{sex}_icewarden_trousers'
    trou_paint = P('yakbrown', 0.06, [
        B('bottom', 0.0, 0.035, 'cholet_pangden', 'turq', 'gold', 0.025),
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
    from .xanadu_prismarchy import build_xanadu_prismarchy_kit
    from .xanadu_society import build_xanadu_society_kit
    entries = []
    entries.extend(_build_f_town_cap())
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        entries.extend(_build_town_and_rich_for_sex(sex, body_id))
        entries.extend(_build_guild_for_sex(sex, body_id))
        entries.extend(_build_magnate_for_sex(sex, body_id))
        entries.extend(_build_priest_for_sex(sex, body_id))
        entries.extend(_build_pleasure_for_sex(sex, body_id))
        entries.extend(_build_vizier_for_sex(sex, body_id))
        entries.extend(_build_askari_for_sex(sex, body_id))
        entries.extend(_build_icewarden_for_sex(sex, body_id))
    entries.extend(build_xanadu_prismarchy_kit())
    entries.extend(build_xanadu_society_kit())
    return entries
