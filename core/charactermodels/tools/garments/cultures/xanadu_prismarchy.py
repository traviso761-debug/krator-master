"""The Sultanate of Xanadu — Prismarchy of Qiblai Monastic Orders (`xanadu_prismarchy`).

Implements Module 1 of the Xanadu Garment Expansion: the **Seven Monastic Orders of the
Prismarchy of Qiblai** plus shared reinforced monastic/Rift-scarp breeches across male
(`mpfb_male`) and female (`mpfb_female`) bodies:

0. Shared Monastic Breeches (`xan_m/f_priest_trousers`): Reinforced `omaroon` & volcanic
   `basalt` monastic/Rift-climbing breeches with `gold` & `holyred` ankle cuff bands.
1. `monk_crimson` — Order of the Flashing Eye (Rift Lizardman Scouts & Heliograph Signalers):
   Peaked `basalt` & `omaroon` Rift-scout hood crowned with a bronze Open-Eye disc, silk
   Crimson Veil of Dread over nose-tip/mouth/jaw, and flip-down brass Rift spyglass loupe;
   knee-length split-hem `basalt` slate-wool scout robe with Tibetan dzong bands, `tocharian_wheel`
   frieze, `holyred` chest tabard with 3D Open-Eye boss, leather pauldrons, diagonal spyglass &
   speculum flash-mirror bandolier, and scout pouch belt; dorsal collapsible tripod, gimbaled
   `speculum` Heliograph Relay Mirror & climbing-rope rig; silent `basalt`-soled Rift boots.
2. `monk_beacon` — Order of the Beacon (*Chiraghan* / Searchlight & Shutter-Lamp):
   Gold-brocade pandit cap with upturned ear-flaps & pivoting brass smoked glare-goggles;
   quilted `gold` & `saffron` coat with oil-proof `charcoal` leather work-apron, 3D brass
   rayed-wheel sternum badge, generator key-ring & oil flask; dorsal louvered brass shutter-vane
   signal lantern with glowing `cybercyan`/`amber` core & strapped Tocharian codebook tome;
   oil-proof `charcoal` & `gold`-piped engineer boots.
3. `monk_viridian` — Order of Viridian Thought (*Mist-Gardan* Tea Master & Simples):
   Conical woven `bamboo` mist hat with `viridian` silk band & bronze tea-leaf pin; `viridian`
   & `pine` highland wool *chuba* with `cholet_pangden` placket, `celadon` collar, `pine` shawl,
    belt-hung 3D `celadon` tea-bowl & 6 simples herb pouches; woven `bamboo` tea-plucker's dorsal
   creel mounded with fresh `viridian` spring-flush leaves & strapped `copper` mortar; `pine`
   mist-scarp trousers; woven `bamboo` & `viridian` cord sandals.
4. `monk_iridescent` — The Iridescent Order (*Renbo-Phal* & *Opal-Phord* Prism-Monk):
   `turq`/`peacock` silk mitre crowned by a 7-prism `moonglass_opal` & `gold` fan diadem;
   spray-shedding `peacock` & `turq` silk robe with `xanadu_sun_wheel` side panels, leaded
   `moonglass_opal` central panel & prism collar, and `violet`/`gold` sash with opal-drop
   pendants; rainbow-piped `peacock` & `gold` boots.
5. `monk_azure` — Order of the Azure Dream (*Gret-Ail* Silent Felt & Blue Vigil Lamp):
   Soundless `midnight` & `azure` felt vigil hood with `gold` & `cybercyan` blue-lotus crescent
   badge; quilted `azure` & `midnight` felt robe with `cream` felt collar, `cybercyan` wrist-thread
   cuffs, hip wax-tablet & brass stylus, and hooded `cybercyan` blue-glass vigil lamp; dorsal
   trapezoidal wooden *santur* box-dulcimer & `silver` Dream Cup flask; soft `midnight` felt
   trousers; thick silent `cream` & `azure` felt shoes.
6. `monk_violet_storm` — Order of the Violet Storm (*House of the Tempest* Cavalry Warrior-Monk):
   Damascened `steel` *Kulah-Khud* bowl wrapped in a `violet` & `gold` monastic turban-fold with
   storm-wheel brow boss & apex spike; `violet` diamond-quilt cavalry coat with `chahar_aina`
   four-mirror cuirass band, gilded storm-wheel boss, contoured `steel`/`gold` pauldrons, diagonal
   `saffron` *zen* sash, and `chahar_aina` *bazuband* forearm cuffs; dorsal curved horn bow in
   `xanadu_sun_wheel` *gorytos* bow-case & `peacock`-fletched quiver; reinforced `violet` & `gold`
   riding breeches; tall `violet` & gilded `steel` cavalry boots.
7. `monk_white_lily` — Order of the White Lily (Qiblai Grand Hospital & Kirstabal Latex House):
   Crisp `lilywhite` silk wrapped physician's turban pinned with a gilded White-Lily & Eight-Spoke
   Wheel brooch; bleached `lilywhite` hospitaler robe with `celadon` collar & capelet, waxed `cream`
   surgical half-apron, 4 `ivory` alabaster salve-pots & `brass` poppy-scoring knife case; clean
   `celadon` & waxed `lilywhite` physician's cuffs & gloves; cedar-wood & `brass`-cornered
   apothecary drawer chest; quiet `lilywhite` & `celadon` hospital slippers.
"""
import math
import numpy as np

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment
)
from ..paint import P, B, PN, COTTON, WOOL
from ..types.torso import (
    torso_tube, stand_collar, collar_disc, tabard, band, pauldron
)
from ..types.limbs import limb_tube, sleeve, sleeves, trousers
from ..types.footwear import boots, sandal
from ..types.headgear import (
    head_rings, sculpted_faceplate, hood, brim, tower_hat, crown_band, horn
)
from ..types.accoutrements import (
    blob, pouch_belt, pendants, tube, rosette, eye_disc
)
from .xanadu import _dorsal_pad


def _physician_gloves(gid, palm_paint, cuff_paint):
    """Clean physician's forearm cuffs and waxed palm wraps (zero lower-spine bleed, Check #8 safe)."""
    parts = []
    for s in (L, R):
        parts.append(sleeve(f'{gid}_cuff_{s[0]}', s, cuff_paint,
                            f0=0.72, f1=0.98, ease=0.013, flare=0.004, rows=5, n=20))
        w_pt = J(s + 'Hand')
        idx1, pnk1 = J(s + 'HandIndex1'), J(s + 'HandPinky1')
        knuckles = 0.25 * (idx1 + J(s + 'HandMiddle1') + J(s + 'HandRing1') + pnk1)
        d_hand = knuckles - w_pt
        u_ax = d_hand / np.linalg.norm(d_hand)
        x_ax = (idx1 - pnk1) - u_ax * np.dot(idx1 - pnk1, u_ax)
        x_ax /= np.linalg.norm(x_ax)
        y_ax = np.cross(u_ax, x_ax)
        y_ax /= np.linalg.norm(y_ax)
        rows = []
        for t in np.linspace(0.0, 0.92, 5):
            cc = w_pt + d_hand * t
            rx, ry = 0.041 + 0.006 * t, 0.022 * (1.0 - 0.10 * t)
            rows.append([cc + x_ax * (math.cos(an) * rx) + y_ax * (math.sin(an) * ry)
                         for an in np.linspace(0.0, 2.0 * math.pi, 20, endpoint=False)])
        palm = Part(f'{gid}_palm_{s[0]}', np.array(rows), True, ['helper-tights'] * len(rows),
                    palm_paint, rigid_joint=s + 'Hand', role='cuff', side=s[0])
        palm.is_arm = True
        parts.append(palm)
    return parts


# ===============================================================================================================
# 0. SHARED MONASTIC BREECHES (`xan_m/f_priest_trousers`)
# ===============================================================================================================
def _build_shared_priest_trousers_for_sex(sex, body_id):
    set_body(body_id)
    gid_l = f'xan_{sex}_priest_trousers'
    seat_p = P('basalt', 0.06, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
    ], fabric=WOOL)
    leg_p = P('omaroon', 0.05, [
        B('bottom', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.022, 0.056, 'stripes', 'holyred', 'gold', 0.016),
        B('bottom', 0.056, 0.115, 'solid', 'basalt'),
    ], [
        PN(0.38, 0.62, 'diamond_quilt', 'basalt', 'omaroon', 0.12),
    ], fabric=WOOL)
    return [assemble_garment(gid_l, 'Prismarchy Reinforced Monastic Breeches', 'legs', 'xanadu',
                             trousers(gid_l, leg_p, ease=0.014, ease_end=0.015, seat_paint=seat_p),
                             legged=True)]


# ===============================================================================================================
# 1. MONK_CRIMSON — Order of the Flashing Eye (Rift Lizardman Scouts & Heliograph Signalers)
# ===============================================================================================================
def _build_monk_crimson_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Peaked Rift-Scout Hood, Open-Eye Brow, Crimson Veil of Dread & Brass Loupe (`xan_m/f_flashing_crown`) ---
    gid_h = f'xan_{sex}_flashing_crown'
    parts_h = []
    hood_paint = P('basalt', 0.06, [
        B('bottom', 0.0, 0.020, 'solid', 'cream'),
        B('bottom', 0.020, 0.042, 'solid', 'holyred'),
        B('top', 0.0, 0.030, 'solid', 'omaroon'),
    ], [
        PN(0.32, 0.68, 'fluted', 'omaroon', 'basalt', 0.08),
    ], fabric=WOOL)
    parts_h.append(hood(gid_h + '_hood', hood_paint, ease=0.030, ease_low=0.048,
                        open_front=0.92, low=-0.52, rows=14, n=36, peak=0.055, high=1.02))

    brow_band_p = P('omaroon', 0.04, [
        B('top', 0.0, 0.008, 'solid', 'gold'),
        B('bottom', 0.0, 0.008, 'solid', 'cream'),
    ], fabric=WOOL)
    parts_h.append(crown_band(gid_h + '_brow_band', brow_band_p, f0=0.58, f1=0.72, ease=0.022, flare=0.005, rows=5, n=36))

    # Bronze Open-Eye disc crowning the brow
    c_brow = a + (b - a) * 0.66
    h_brow = first_hit(c_brow, -bk) or 0.100
    p_eye = c_brow - bk * (h_brow + 0.030)
    eye_pts = eye_disc(
        gid_h + '_open_eye', p_eye, -bk, 0.064,
        P('speculum', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric='metal.bronze'),
        P('holyred', 0.02, [B('top', 0.0, 0.006, 'solid', 'gold')], fabric='metal.gold')
    )
    for pt in eye_pts:
        pt.rigid_joint = 'Head'
    parts_h.extend(eye_pts)

    # Crimson Veil of Dread covering nose-tip, mouth, and jaw while leaving both eyes wide open
    veil_paint = P('holyred', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
        B('bottom', 0.0, 0.016, 'fret', 'gold', 'omaroon', 0.025),
    ], [
        PN(0.36, 0.64, 'diamonds', 'gold', 'holyred', 0.035),
    ], fabric='cloth.silk')
    veil_pt = sculpted_faceplate(
        gid_h + '_veil', veil_paint,
        f_top=0.31, f_bot=-0.04, ease=0.020, span=0.46, rows=12, cols=23,
        brow_relief=0.0, nose_relief=0.018, cheek_relief=0.010, chin_relief=0.012, jaw_narrow=0.22
    )
    # Guarantee radial clearance over actual nose-tip and lips across both bodies while preserving veil drape
    for ri in range(veil_pt.P.shape[0]):
        v_r = ri / float(veil_pt.P.shape[0] - 1)
        f_r = 0.31 + (-0.04 - 0.31) * v_r
        c_r = a + (b - a) * max(f_r, 0.06)
        for cj in range(veil_pt.P.shape[1]):
            vec = veil_pt.P[ri, cj] - np.array([c_r[0], c_r[1], veil_pt.P[ri, cj, 2]])
            r_xy = math.hypot(vec[0], vec[1])
            if r_xy > 1e-6:
                d_xy = np.array([vec[0] / r_xy, vec[1] / r_xy, 0.0])
                h_sk = first_hit(np.array([c_r[0], c_r[1], max(veil_pt.P[ri, cj, 2], a[2] + 0.01)]), d_xy)
                if h_sk is not None and h_sk < 0.14:
                    r_min_req = float(h_sk) + 0.012 + 0.008 * v_r
                    if r_xy < r_min_req:
                        veil_pt.P[ri, cj, 0] = c_r[0] + d_xy[0] * r_min_req
                        veil_pt.P[ri, cj, 1] = c_r[1] + d_xy[1] * r_min_req
    veil_pt.rigid_joint = 'Head'
    parts_h.append(veil_pt)

    # Flip-down brass Rift spyglass loupe mounted on the right brow/temple (-left)
    c_lp = a + (b - a) * 0.56
    d_lp = -bk * 0.80 - left * 0.60
    d_lp /= np.linalg.norm(d_lp)
    h_lp = first_hit(c_lp, d_lp) or 0.098
    lp_base = c_lp + d_lp * (h_lp + 0.018)
    lp_tip = lp_base + (-bk * 0.94 - up * 0.12) * 0.036
    brass_p = P('brass', 0.02, [B('top', 0.0, 0.008, 'solid', 'gold')], fabric='metal.bronze')
    parts_h.append(tube(gid_h + '_loupe_barrel', [lp_base, lp_tip], 0.015, brass_p, n=12, rigid_joint='Head'))
    parts_h.append(rosette(gid_h + '_loupe_lens', lp_tip - bk * 0.004, -bk, left, 0.016,
                           P('cybercyan', 0.01, [B('bottom', 0.0, 0.005, 'solid', 'brass')], fabric='beads.glass'),
                           n=12, thick=0.005, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Flashing-Eye Rift Scout Hood, Veil of Dread & Brass Loupe', 'head', 'xanadu',
                                    parts_h, covers_hair=True, covers_face=False))

    # --- 2. TORSO: High-Mobility Rift-Scout Robe, Open-Eye Boss, Spyglass & Flash-Mirror (`xan_m/f_flashing_robe`) ---
    gid_t = f'xan_{sex}_flashing_robe'
    parts_t = []
    robe_paint = P('basalt', 0.05, [
        B('top', 0.0, 0.020, 'solid', 'cream'),
        B('top', 0.020, 0.040, 'solid', 'holyred'),
        B('bottom', 0.0, 0.022, 'solid', 'cream'),
        B('bottom', 0.022, 0.045, 'solid', 'holyred'),
        B('bottom', 0.045, 0.115, 'tocharian_wheel', 'gold', 'omaroon', 0.075),
    ], [
        PN(0.16, 0.36, 'fluted', 'slate', 'basalt', 0.07),
        PN(0.64, 0.84, 'fluted', 'slate', 'basalt', 0.07),
        PN(0.47, 0.53, 'solid', 'omaroon', 'basalt', 1.0),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_robe', TOP, KNEE + 0.04, 0.016, robe_paint,
                              n=48, rows=20, hang_from=WAIST - 0.02, flare=0.13,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('holyred', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'cream'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], fabric=WOOL), high=0.036))

    # Central crimson chest/skirt tabard bearing 3D bronze Open-Eye pectoral boss
    tab_paint = P('holyred', 0.04, [
        B('top', 0.0, 0.018, 'solid', 'gold'),
        B('bottom', 0.0, 0.022, 'solid', 'cream'),
        B('bottom', 0.022, 0.085, 'tocharian_wheel', 'gold', 'omaroon', 0.065),
    ], [
        PN(0.0, 0.12, 'solid', 'cream', 'holyred', 1.0),
        PN(0.88, 1.0, 'solid', 'cream', 'holyred', 1.0),
    ], fabric='cloth.silk')
    parts_t.extend(tabard(gid_t + '_tabard', KNEE + 0.06, CHEST + 0.01, tab_paint, width=0.19, ease=0.024, front=True))

    p_pect = chest_front(CHEST - 0.018, 0.026, x=0.0)
    pect_eye = eye_disc(
        gid_t + '_pectoral_eye', p_pect, FRONT, 0.078,
        P('speculum', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric='metal.bronze'),
        P('holyred', 0.02, [B('top', 0.0, 0.006, 'solid', 'gold')], fabric='metal.gold')
    )
    for pt in pect_eye:
        pt.rigid_joint = 'Spine2'
    parts_t.extend(pect_eye)

    # Contoured basalt leather pauldrons
    pauld_p = P('basalt', 0.05, [
        B('bottom', 0.0, 0.020, 'dentils', 'holyred', 'cream', 0.025),
        B('top', 0.0, 0.014, 'solid', 'gold'),
    ], fabric='leather.polished')
    parts_t.append(pauldron(gid_t + '_pauld_L', L, pauld_p, reach=0.34, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_pauld_R', R, pauld_p, reach=0.34, ease=0.024, flare_end=0.98))

    # Diagonal scout bandolier with 3D brass spyglass at chest & handheld speculum flash-mirror at hip
    band_p = P('omaroon', 0.05, [
        B('top', 0.0, 0.008, 'solid', 'gold'),
        B('bottom', 0.0, 0.008, 'solid', 'cream'),
    ], fabric='leather.polished')
    parts_t.append(band(gid_t + '_bandolier', WAIST + 0.01, SHOULDER + 0.02, 0.046, 0.022,
                        band_p, high=math.pi * 0.45, rows=5))

    p_spy = chest_front(CHEST - 0.058, 0.025, x=0.052)
    spy_dir = np.array([0.52, -0.05, -0.85])
    spy_dir /= np.linalg.norm(spy_dir)
    parts_t.append(tube(gid_t + '_spyglass_body',
                        [p_spy - spy_dir * 0.048, p_spy + spy_dir * 0.026],
                        0.016,
                        P('brass', 0.02, [B('top', 0.0, 0.014, 'solid', 'leather'),
                                          B('bottom', 0.0, 0.012, 'solid', 'gold')], fabric='metal.bronze'),
                        n=12, rigid_joint='Spine2'))
    parts_t.append(tube(gid_t + '_spyglass_draw',
                        [p_spy + spy_dir * 0.024, p_spy + spy_dir * 0.062],
                        0.011, P('gold', 0.02, fabric='metal.gold'), n=10, rigid_joint='Spine2'))

    # Conformed omaroon scout pouch belt + hip-hung circular speculum flash-mirror on 3D bracket
    parts_t.extend(pouch_belt(
        gid_t + '_scout',
        P('omaroon', 0.05, [B('top', 0.0, 0.008, 'solid', 'gold'), B('bottom', 0.0, 0.008, 'solid', 'cream')], fabric='leather.polished'),
        P('basalt', 0.06, [B('top', 0.0, 0.015, 'solid', 'holyred')], fabric='leather.polished'),
        ease=0.022
    ))
    d_mir = np.array([-0.78, -0.62, 0.0])
    d_mir /= np.linalg.norm(d_mir)
    p_mir_in = surface_out(spine_at(WAIST - 0.005), d_mir, 0.018, bvh=core.BVH_T)
    p_mir_out = surface_out(spine_at(WAIST - 0.005), d_mir, 0.024, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_mirror_bracket', [p_mir_in, p_mir_out], 0.009,
                        P('brass', 0.02, fabric='metal.bronze'), n=8, rigid_joint='Hips'))
    parts_t.append(rosette(gid_t + '_flash_mirror', p_mir_out - np.array([0.0, 0.0, 0.028]), d_mir, np.array([0.0, 0.0, 1.0]),
                           0.042,
                           P('speculum', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'gold')], fabric='metal.bronze'),
                           n=16, thick=0.008, rigid_joint='Hips'))

    sl_paint = P('basalt', 0.05, [
        B('bottom', 0.0, 0.020, 'solid', 'cream'),
        B('bottom', 0.020, 0.048, 'solid', 'holyred'),
        B('bottom', 0.048, 0.062, 'solid', 'gold'),
    ], fabric=WOOL)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_paint, ease_end=0.024, rows=10))
    entries.append(assemble_garment(gid_t, 'Flashing-Eye Rift-Scout Robe, Spyglass & Flash-Mirror', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Dorsal Heliograph Relay Mirror, Tripod Staves & Climbing Rope (`xan_m/f_flashing_heliograph`) ---
    gid_b = f'xan_{sex}_flashing_heliograph'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    parts_b.append(blob(gid_b + '_harness_pad', p_bk + d_bk * 0.016, (0.20, 0.040, 0.24),
                        P('basalt', 0.06, [B('top', 0.0, 0.015, 'solid', 'omaroon')], fabric='leather.polished'),
                        n=14, rows=6, out=d_bk, rigid_joint='Spine2'))

    # Three bundled collapsible wooden/brass tripod staves
    stave_p = P('yakbrown', 0.05, [
        B('top', 0.0, 0.032, 'solid', 'brass'),
        B('bottom', 0.0, 0.032, 'solid', 'brass'),
    ], fabric='leather.polished')
    for idx_s, x_st in enumerate((-0.095, -0.068, -0.041)):
        parts_b.append(tube(f'{gid_b}_stave_{idx_s}',
                            [p_bk + d_bk * 0.038 + np.array([x_st, 0.0, -0.18]),
                             p_bk + d_bk * 0.038 + np.array([x_st + 0.012, 0.0, 0.19])],
                            0.013, stave_p, n=10, rigid_joint='Spine2'))

    # Circular speculum-bronze Heliograph Relay Mirror in a brass gimbal ring
    mir_c = p_bk + d_bk * 0.066 + np.array([0.032, 0.0, 0.035])
    parts_b.append(rosette(gid_b + '_heliograph_mirror', mir_c, d_bk, np.array([1.0, 0.0, 0.0]),
                           0.118,
                           P('speculum', 0.02, [
                               B('bottom', 0.0, 0.016, 'solid', 'brass'),
                           ], [
                               PN(0.0, 1.0, 'sun', 'gold', 'speculum', 0.20),
                           ], fabric='metal.bronze'),
                           n=22, thick=0.012, rigid_joint='Spine2'))
    gimbal_pts = [
        mir_c + np.array([math.cos(an) * 0.132, 0.0, math.sin(an) * 0.132])
        for an in np.linspace(0.0, 2.0 * math.pi, 17)
    ]
    parts_b.append(horn(gid_b + '_gimbal_ring', gimbal_pts, 0.010, 0.010,
                        P('brass', 0.02, fabric='metal.bronze'), n=10, rows=17, rigid_joint='Spine2'))
    for s_tag, sx in (('L', 1.0), ('R', -1.0)):
        p_tr = mir_c + np.array([sx * 0.132, 0.0, 0.0])
        parts_b.append(tube(f'{gid_b}_trunnion_{s_tag}', [p_tr - d_bk * 0.048, p_tr], 0.010,
                            P('brass', 0.02, fabric='metal.bronze'), n=8, rigid_joint='Spine2'))

    # Coiled Rift-scarp climbing rope loop at base of pack
    rope_c = p_bk + d_bk * 0.048 + np.array([0.025, 0.0, -0.125])
    rope_pts = [
        rope_c + np.array([math.cos(an) * 0.072, math.sin(an) * 0.012, math.sin(an) * 0.052])
        for an in np.linspace(0.0, 2.0 * math.pi, 15)
    ]
    parts_b.append(horn(gid_b + '_climbing_rope', rope_pts, 0.020, 0.020,
                        P('bamboo', 0.07, [B('top', 0.0, 0.02, 'stripes', 'cream', 'bamboo', 0.02)], fabric='straw.reed.plaited'),
                        n=10, rows=15, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('slate', 0.05, [B('top', 0.0, 0.008, 'solid', 'brass')], fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Flashing-Eye Heliograph Mirror, Tripod & Rope Rig', 'back', 'xanadu', parts_b))

    # --- 4. FEET: Silent Basalt-Soled Rift-Scarp Climbing Boots (`xan_m/f_flashing_boots`) ---
    gid_f = f'xan_{sex}_flashing_boots'
    sole_p = P('basalt', 0.08, [B('bottom', 0.0, 0.012, 'solid', 'slate')])
    upper_p = P('omaroon', 0.05, [
        B('top', 0.0, 0.032, 'solid', 'cream'),
        B('bottom', 0.0, 0.026, 'solid', 'slate'),
    ], fabric='leather.buckskin')
    wrap_p = P('slate', 0.05, [B('top', 0.0, 0.008, 'solid', 'holyred')], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_f, 'Flashing-Eye Basalt-Soled Rift Climbing Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, upper_p, top=0.50, wraps=3, wrap_paint=wrap_p, ease_top=0.032)))
    return entries


# ===============================================================================================================
# 2. MONK_BEACON — Order of the Beacon (Chiraghan / Searchlight & Shutter-Lamp)
# ===============================================================================================================
def _build_monk_beacon_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Gold-Brocade Pandit Cap & Brass Smoked Glare-Goggles (`xan_m/f_beacon_cap`) ---
    gid_h = f'xan_{sex}_beacon_cap'
    parts_h = []
    cap_p = P('gold', 0.03, [
        B('bottom', 0.0, 0.048, 'tocharian_wheel', 'gold', 'omaroon', 0.055),
        B('top', 0.0, 0.022, 'solid', 'saffron'),
    ], [
        PN(0.0, 1.0, 'xanadu_sun_wheel', 'gold', 'saffron', 0.16),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_crown', 0.145, lambda s: 1.02 * (1.0 - 0.46 * (s ** 2.1)),
                             cap_p, f=0.52, ease=0.020, rows=10, n=36))

    flap_p = P('saffron', 0.04, [
        B('bottom', 0.0, 0.012, 'solid', 'gold'),
        B('top', 0.0, 0.010, 'solid', 'omaroon'),
    ], fabric='cloth.silk')
    brim_pt = brim(gid_h + '_earflaps', 0.50, 0.042, flap_p, ease=0.019, rows=5, n=40, droop=0.026, scallop=0.08)
    brim_pt.rigid_joint = 'Head'
    parts_h.append(brim_pt)

    # Pivoting brass smoked glare-goggles perched on the brow (blob lenses + horn strap)
    c_gog = a + (b - a) * 0.66
    strap_pts = []
    for an in np.linspace(-0.82 * math.pi, 0.82 * math.pi, 15):
        d_s = -bk * math.cos(an) + left * math.sin(an)
        d_s /= np.linalg.norm(d_s)
        h_s = first_hit(c_gog, d_s) or 0.098
        strap_pts.append(c_gog + d_s * (h_s + 0.026))
    parts_h.append(horn(gid_h + '_goggle_strap', strap_pts, 0.008, 0.008,
                        P('charcoal', 0.05, [B('top', 0.0, 0.004, 'solid', 'brass')], fabric='leather.polished'),
                        n=8, rows=15, rigid_joint='Head'))

    for idx_g, sx in enumerate((-1.0, 1.0)):
        d_g = -bk * 0.92 + left * (0.34 * sx)
        d_g /= np.linalg.norm(d_g)
        h_g = first_hit(c_gog, d_g) or 0.098
        p_bezel = c_gog + d_g * (h_g + 0.028)
        parts_h.append(blob(f'{gid_h}_goggle_rim_{idx_g}', p_bezel, (0.054, 0.024, 0.046),
                            P('brass', 0.02, fabric='metal.gold'),
                            n=14, rows=5, out=d_g, rigid_joint='Head'))
        parts_h.append(blob(f'{gid_h}_goggle_lens_{idx_g}', p_bezel + d_g * 0.008, (0.042, 0.016, 0.036),
                            P('soot', 0.01, [B('top', 0.0, 0.008, 'solid', 'amber')], fabric='beads.glass'),
                            n=12, rows=5, out=d_g, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Chiraghan Pandit Cap & Brass Smoked Glare-Goggles', 'head', 'xanadu',
                                    parts_h, covers_hair=True, covers_face=False))

    # --- 2. TORSO: Quilted Gold & Saffron Coat, Charcoal Work-Apron, Key-Ring & Oil Flask (`xan_m/f_beacon_robe`) ---
    gid_t = f'xan_{sex}_beacon_robe'
    parts_t = []
    coat_p = P('saffron', 0.05, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.095, 'tocharian_wheel', 'gold', 'omaroon', 0.07),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'gold', 'saffron', 0.16),
    ], fabric='cloth.quilted.diamond')
    parts_t.append(torso_tube(gid_t + '_coat', TOP, KNEE + 0.03, 0.017, coat_p,
                              n=48, rows=20, hang_from=WAIST - 0.02, flare=0.13,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('charcoal', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'saffron'),
    ], fabric='leather.polished'), high=0.036))

    # Oil-proof charcoal leather chest/skirt work-apron
    apron_p = P('charcoal', 0.04, [
        B('top', 0.0, 0.018, 'beads', 'brass', 'charcoal', 0.03),
        B('bottom', 0.0, 0.024, 'solid', 'brass'),
    ], [
        PN(0.0, 0.09, 'solid', 'brass', 'charcoal', 1.0),
        PN(0.91, 1.0, 'solid', 'brass', 'charcoal', 1.0),
    ], fabric='leather.polished')
    parts_t.extend(tabard(gid_t + '_apron', KNEE + 0.05, core.SHOULDER - 0.022, apron_p, width=0.36, ease=0.028, front=True))

    # 3D brass rayed-wheel sternum badge seated cleanly in front of the leather work-apron
    p_badge = chest_front(CHEST - 0.018, 0.044, x=0.0)
    parts_t.append(rosette(gid_t + '_rayed_wheel', p_badge, FRONT, np.array([1.0, 0.0, 0.0]), 0.038,
                           P('brass', 0.02, [
                               B('bottom', 0.0, 0.008, 'solid', 'amber'),
                           ], [
                               PN(0.0, 1.0, 'sun', 'gold', 'omaroon', 0.09),
                           ], fabric='metal.gold'),
                           n=12, thick=0.010, rigid_joint='Spine2'))

    # Conformed engineer belt with brass generator key-ring (left hip) & oil flask (right hip)
    belt_p = P('charcoal', 0.05, [
        B('top', 0.0, 0.008, 'solid', 'brass'),
        B('bottom', 0.0, 0.008, 'solid', 'brass'),
    ], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.035, WAIST - 0.035, 0.021, belt_p,
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))

    # Left hip (+X): brass generator key-ring & keys at 0.023 ease
    d_key = np.array([0.78, -0.62, 0.0])
    d_key /= np.linalg.norm(d_key)
    p_key_in = surface_out(spine_at(WAIST - 0.005), d_key, 0.018, bvh=core.BVH_T)
    p_key = surface_out(spine_at(WAIST - 0.005), d_key, 0.023, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_key_bracket', [p_key_in, p_key], 0.008,
                        P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))
    parts_t.append(rosette(gid_t + '_key_ring', p_key - np.array([0.0, 0.0, 0.018]), d_key, np.array([0.0, 0.0, 1.0]),
                           0.022, P('brass', 0.02, fabric='metal.gold'), n=12, thick=0.006, rigid_joint='Hips'))
    for ik, dz_k in enumerate((-0.014, 0.0, 0.014)):
        k_top = p_key + np.array([0.0, dz_k, -0.030])
        parts_t.append(tube(f'{gid_t}_gen_key_{ik}', [k_top, k_top - np.array([0.0, 0.0, 0.048])], 0.006,
                            P('gold', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))

    # Right hip (-X): brass lamp-oil flask at 0.023 ease
    d_oil = np.array([-0.78, -0.62, 0.0])
    d_oil /= np.linalg.norm(d_oil)
    p_oil_in = surface_out(spine_at(WAIST - 0.005), d_oil, 0.018, bvh=core.BVH_T)
    p_oil = surface_out(spine_at(WAIST - 0.005), d_oil, 0.023, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_oil_bracket', [p_oil_in, p_oil], 0.009,
                        P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_oil_flask', p_oil - np.array([0.0, 0.0, 0.034]), (0.064, 0.046, 0.076),
                        P('brass', 0.02, [B('top', 0.0, 0.018, 'solid', 'copper'),
                                          B('bottom', 0.0, 0.016, 'solid', 'charcoal')], fabric='metal.bronze'),
                        n=14, rows=6, out=d_oil, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_oil_spout', [p_oil + np.array([0.0, 0.0, 0.002]), p_oil + np.array([0.0, 0.0, 0.028])],
                        0.011, P('gold', 0.02, fabric='metal.gold'), n=10, rigid_joint='Hips'))

    sl_p = P('saffron', 0.05, [
        B('bottom', 0.0, 0.065, 'solid', 'charcoal'),
        B('bottom', 0.065, 0.082, 'solid', 'brass'),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'gold', 'saffron', 0.12),
    ], fabric='cloth.quilted.diamond')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.025, rows=10))
    entries.append(assemble_garment(gid_t, 'Chiraghan Quilted Coat, Oil-Proof Apron & Oil Flask', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Dorsal Brass Shutter-Vane Signal Lantern & Tocharian Codebook (`xan_m/f_beacon_pack`) ---
    gid_b = f'xan_{sex}_beacon_pack'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    parts_b.append(blob(gid_b + '_cradle', p_bk + d_bk * 0.018, (0.21, 0.042, 0.25),
                        P('charcoal', 0.05, [B('top', 0.0, 0.016, 'solid', 'brass')], fabric='leather.polished'),
                        n=14, rows=6, out=d_bk, rigid_joint='Spine2'))

    # Brass shutter-vane signal lantern cylinder + glowing glass core + gold dome cap
    lan_c = p_bk + d_bk * 0.072 + np.array([-0.038, 0.0, 0.015])
    shutter_p = P('brass', 0.02, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.024, 'solid', 'gold'),
        B('top', 0.024, 0.165, 'stripes', 'charcoal', 'brass', 0.018),
    ], fabric='metal.gold')
    parts_b.append(tube(gid_b + '_lantern_body',
                        [lan_c - np.array([0.0, 0.0, 0.095]), lan_c + np.array([0.0, 0.0, 0.095])],
                        0.052, shutter_p, n=18, rigid_joint='Spine2'))
    parts_b.append(rosette(gid_b + '_lantern_lens', lan_c + d_bk * 0.050, d_bk, np.array([1.0, 0.0, 0.0]),
                           0.038,
                           P('cybercyan', 0.01, [B('bottom', 0.0, 0.010, 'solid', 'amber')], fabric='beads.glass'),
                           n=16, thick=0.010, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_lantern_dome', lan_c + np.array([0.0, 0.0, 0.112]), (0.106, 0.106, 0.068),
                        P('gold', 0.02, [B('bottom', 0.0, 0.015, 'dentils', 'amber', 'gold', 0.02)], fabric='metal.gold'),
                        n=16, rows=6, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))

    # Strapped omaroon/gold Tocharian sound-grid codebook tome
    tome_c = p_bk + d_bk * 0.052 + np.array([0.068, 0.0, -0.015])
    tome_p = P('omaroon', 0.04, [
        B('top', 0.0, 0.016, 'solid', 'gold'),
        B('bottom', 0.0, 0.016, 'solid', 'gold'),
    ], [
        PN(0.15, 0.85, 'tocharian_wheel', 'gold', 'omaroon', 0.14),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_codebook_tome', tome_c, (0.115, 0.054, 0.175), tome_p,
                        n=14, rows=6, out=d_bk, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('charcoal', 0.05, [B('top', 0.0, 0.008, 'solid', 'brass')], fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Chiraghan Shutter-Vane Signal Lantern & Tocharian Codebook', 'back', 'xanadu', parts_b))

    # --- 4. FEET: Oil-Proof Charcoal Leather & Gold-Piped Engineer Boots (`xan_m/f_beacon_boots`) ---
    gid_f = f'xan_{sex}_beacon_boots'
    sole_p = P('soot', 0.08, [B('bottom', 0.0, 0.014, 'solid', 'brass')])
    upper_p = P('charcoal', 0.04, [
        B('top', 0.0, 0.028, 'stripes', 'gold', 'saffron', 0.014),
        B('bottom', 0.0, 0.022, 'solid', 'gold'),
    ], fabric='leather.polished')
    entries.append(assemble_garment(gid_f, 'Chiraghan Oil-Proof Charcoal & Gold Engineer Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, upper_p, top=0.48, ease_top=0.032)))
    return entries


# ===============================================================================================================
# 3. MONK_VIRIDIAN — Order of Viridian Thought (Mist-Gardan Tea Master & Simples)
# ===============================================================================================================
def _build_monk_viridian_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Conical Woven Bamboo Mist Hat & Bronze Tea-Leaf Pin (`xan_m/f_viridian_hat`) ---
    gid_h = f'xan_{sex}_viridian_hat'
    parts_h = []
    crown_p = P('bamboo', 0.07, [
        B('top', 0.0, 0.022, 'solid', 'pine'),
    ], fabric='straw.reed.plaited')
    parts_h.append(head_rings(gid_h + '_crown', 0.58, 1.02, 0.016, crown_p, n=36, rows=7, apex=True))

    brim_p = P('bamboo', 0.07, [
        B('bottom', 0.0, 0.018, 'solid', 'viridian'),
        B('top', 0.0, 0.020, 'stripes', 'viridian', 'bamboo', 0.02),
    ], fabric='straw.reed.plaited')
    brim_pt = brim(gid_h + '_brim', 0.62, 0.148, brim_p, ease=0.016, rows=6, n=44, droop=0.052, lift=0.008)
    brim_pt.rigid_joint = 'Head'
    parts_h.append(brim_pt)

    band_p = P('viridian', 0.03, [
        B('top', 0.0, 0.006, 'solid', 'gold'),
        B('bottom', 0.0, 0.006, 'solid', 'celadon'),
    ], fabric='cloth.silk')
    parts_h.append(crown_band(gid_h + '_silk_band', band_p, f0=0.58, f1=0.72, ease=0.020, flare=0.005, rows=5, n=36))

    c_pin = a + (b - a) * 0.66
    d_pin = -bk * 0.88 + left * 0.46
    d_pin /= np.linalg.norm(d_pin)
    h_pin = first_hit(c_pin, d_pin) or 0.098
    parts_h.append(blob(gid_h + '_tealeaf_pin', c_pin + d_pin * (h_pin + 0.026), (0.028, 0.014, 0.054),
                        P('bronze', 0.02, [B('top', 0.0, 0.012, 'solid', 'viridian')], fabric='metal.bronze'),
                        n=12, rows=5, out=d_pin, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Mist-Gardan Woven Bamboo Hat & Bronze Tea-Leaf Pin', 'head', 'xanadu',
                                    parts_h, covers_hair=False, covers_face=False))

    # --- 2. TORSO: Viridian & Pine Chuba, Pine Shawl, Celadon Tea-Bowl & Herb Pouches (`xan_m/f_viridian_robe`) ---
    gid_t = f'xan_{sex}_viridian_robe'
    parts_t = []
    chuba_p = P('viridian', 0.05, [
        B('top', 0.0, 0.022, 'solid', 'celadon'),
        B('bottom', 0.0, 0.025, 'solid', 'pine'),
        B('bottom', 0.025, 0.090, 'cholet_pangden', 'viridian', 'cream', 0.06),
    ], [
        PN(0.0, 0.34, 'fluted', 'pine', 'viridian', 0.08),
        PN(0.66, 1.0, 'fluted', 'pine', 'viridian', 0.08),
        PN(0.44, 0.56, 'cholet_pangden', 'viridian', 'cream', 0.08, down=0.46),
        PN(0.42, 0.44, 'solid', 'cream', 'viridian', 1.0, down=0.46),
        PN(0.56, 0.58, 'solid', 'saffron', 'viridian', 1.0, down=0.46),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_chuba', TOP, KNEE - 0.06, 0.016, chuba_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.15,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('celadon', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'cream'),
        B('bottom', 0.0, 0.010, 'solid', 'pine'),
    ], fabric='cloth.silk'), high=0.036))

    # Shoulder-draped pine shawl
    shawl_p = P('pine', 0.05, [
        B('bottom', 0.0, 0.020, 'cholet_pangden', 'celadon', 'cream', 0.045),
        B('top', 0.0, 0.014, 'solid', 'celadon'),
    ], fabric=WOOL)
    parts_t.append(collar_disc(gid_t + '_shawl', 0.076, shawl_p, drop=0.064, rows=6, scallop=0.05, ease=0.019))

    # Conformed belt with 3D celadon tea-bowl & 6 bamboo/cream simples herb pouches
    sash_p = P('cream', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'viridian'),
        B('bottom', 0.0, 0.010, 'solid', 'pine'),
    ], [
        PN(0.0, 1.0, 'cholet_pangden', 'viridian', 'cream', 0.05),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.035, WAIST - 0.035, 0.020, sash_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='band'))

    d_bowl = np.array([-0.74, -0.67, 0.0])
    d_bowl /= np.linalg.norm(d_bowl)
    p_bowl_in = surface_out(spine_at(WAIST - 0.008), d_bowl, 0.018, bvh=core.BVH_T)
    p_bowl = surface_out(spine_at(WAIST - 0.008), d_bowl, 0.023, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_bowl_loop', [p_bowl_in, p_bowl], 0.009,
                        P('bamboo', 0.06, fabric='straw.reed.plaited'), n=8, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_celadon_bowl', p_bowl - np.array([0.0, 0.0, 0.026]), (0.062, 0.052, 0.046),
                        P('celadon', 0.02, [B('top', 0.0, 0.010, 'solid', 'cream'),
                                            B('bottom', 0.0, 0.012, 'solid', 'bamboo')], fabric='cloth.silk'),
                        n=14, rows=6, out=d_bowl, rigid_joint='Hips'))

    herb_angles = [math.pi + a_off for a_off in (-1.35, -0.95, -0.52, 0.55, 0.98, 1.38)]
    herb_p = P('bamboo', 0.06, [
        B('top', 0.0, 0.014, 'solid', 'viridian'),
        B('bottom', 0.0, 0.012, 'solid', 'cream'),
    ], fabric=COTTON)
    parts_t.extend(pendants(gid_t + '_simples_', WAIST - 0.018, herb_angles, (0.042, 0.030, 0.052), herb_p, ease=0.020))

    sl_p = P('viridian', 0.05, [
        B('bottom', 0.0, 0.038, 'solid', 'celadon'),
        B('bottom', 0.038, 0.058, 'solid', 'cream'),
    ], fabric=WOOL)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.027, rows=10))
    entries.append(assemble_garment(gid_t, 'Viridian Thought Chuba, Pine Shawl & Celadon Tea-Bowl', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Woven Bamboo Tea-Plucker's Creel & Copper Apothecary Mortar (`xan_m/f_viridian_creel`) ---
    gid_b = f'xan_{sex}_viridian_creel'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    parts_b.append(blob(gid_b + '_woven_pad', p_bk + d_bk * 0.016, (0.18, 0.036, 0.22),
                        P('pine', 0.06, fabric=WOOL), n=12, rows=5, out=d_bk, rigid_joint='Spine2'))

    creel_bot = p_bk + d_bk * 0.082 + np.array([-0.015, 0.0, -0.13])
    creel_top = p_bk + d_bk * 0.098 + np.array([-0.015, 0.0, 0.11])
    creel_p = P('bamboo', 0.07, [
        B('top', 0.0, 0.024, 'solid', 'pine'),
        B('bottom', 0.0, 0.024, 'solid', 'pine'),
        B('top', 0.070, 0.095, 'stripes', 'viridian', 'bamboo', 0.02),
    ], fabric='straw.reed.plaited')
    parts_b.append(horn(gid_b + '_creel_basket', [creel_bot, creel_top], 0.066, 0.102,
                        creel_p, n=18, rows=10, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_tea_leaves', creel_top + np.array([0.0, 0.0, 0.008]), (0.185, 0.185, 0.072),
                        P('viridian', 0.08, [
                            B('bottom', 0.0, 0.018, 'solid', 'pine'),
                            B('top', 0.0, 0.022, 'beads', 'celadon', 'viridian', 0.03),
                        ], fabric=COTTON),
                        n=16, rows=6, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))

    # Strapped copper apothecary mortar & pestle
    mor_c = p_bk + d_bk * 0.056 + np.array([0.098, 0.0, -0.055])
    parts_b.append(tube(gid_b + '_copper_mortar',
                        [mor_c - np.array([0.0, 0.0, 0.045]), mor_c + np.array([0.0, 0.0, 0.045])],
                        0.032,
                        P('copper', 0.03, [B('top', 0.0, 0.015, 'solid', 'celadon'),
                                           B('bottom', 0.0, 0.015, 'solid', 'bronze')], fabric='metal.bronze'),
                        n=14, rigid_joint='Spine2'))
    parts_b.append(horn(gid_b + '_bronze_pestle',
                        [mor_c + np.array([0.0, 0.0, 0.020]), mor_c + np.array([0.022, 0.010, 0.095])],
                        0.010, 0.015, P('bronze', 0.02, fabric='metal.bronze'), n=10, rows=6, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('bamboo', 0.06, [B('top', 0.0, 0.008, 'solid', 'pine')], fabric='straw.reed.plaited')))
    entries.append(assemble_garment(gid_b, 'Mist-Gardan Bamboo Tea-Creel & Copper Mortar', 'back', 'xanadu', parts_b))

    # --- 4. LEGS: Pine Wool Mist-Scarp Trousers (`xan_m/f_viridian_trousers`) ---
    gid_l = f'xan_{sex}_viridian_trousers'
    trou_p = P('pine', 0.05, [
        B('bottom', 0.0, 0.022, 'solid', 'saffron'),
        B('bottom', 0.022, 0.062, 'stripes', 'viridian', 'celadon', 0.018),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'Mist-Gardan Pine Wool Trousers', 'legs', 'xanadu',
                                    trousers(gid_l, trou_p, ease=0.014, ease_end=0.016), legged=True))

    # --- 5. FEET: Woven Bamboo & Viridian Cord Sandals (`xan_m/f_viridian_sandals`) ---
    gid_f = f'xan_{sex}_viridian_sandals'
    sole_p = P('bamboo', 0.08, [B('bottom', 0.0, 0.010, 'solid', 'pine')], fabric='straw.reed.plaited')
    strap_p = P('viridian', 0.05, [B('top', 0.0, 0.008, 'solid', 'cream')], fabric='straw.reed.plaited')
    lace_p = P('celadon', 0.04, fabric='straw.reed.plaited')
    entries.append(assemble_garment(gid_f, 'Mist-Gardan Woven Bamboo & Viridian Cord Sandals', 'feet', 'xanadu',
                                    sandal(gid_f, sole_p, strap_p, guard=True, laces=3, strap_paint2=lace_p)))
    return entries


# ===============================================================================================================
# 4. MONK_IRIDESCENT — The Iridescent Order (Renbo-Phal & Opal-Phord Prism-Monk)
# ===============================================================================================================
def _build_monk_iridescent_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    ANKLE = core.ANKLE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Peacock Silk Mitre & 7-Prism Moonglass-Opal Fan Diadem (`xan_m/f_iridescent_diadem`) ---
    gid_h = f'xan_{sex}_iridescent_diadem'
    parts_h = []
    mitre_p = P('peacock', 0.03, [
        B('bottom', 0.0, 0.020, 'solid', 'gold'),
        B('top', 0.0, 0.024, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'xanadu_sun_wheel', 'gold', 'turq', 0.16),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_mitre', 0.168, lambda s: 0.98 * (1.0 - 0.54 * (s ** 2.1)),
                             mitre_p, f=0.52, ease=0.021, rows=10, n=36))

    diadem_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.012, 'beads', 'violet', 'gold', 0.02),
        B('top', 0.0, 0.012, 'dentils', 'cybercyan', 'gold', 0.03),
    ], [
        PN(0.25, 0.75, 'moonglass_opal', 'cybercyan', 'violet', 0.08),
    ], fabric='metal.gold')
    parts_h.append(crown_band(gid_h + '_diadem_band', diadem_p, f0=0.48, f1=0.78, ease=0.024, flare=0.012, rows=6, n=40))

    # 7 radially fanned crystal-opal prisms across the brow in leaded moonglass
    c_crown = a + (b - a) * 0.68
    prism_tints = ('violet', 'lacrose', 'saffron', 'cybercyan', 'saffron', 'lacrose', 'violet')
    for idx_p, (ang_p, tint_c) in enumerate(zip(np.linspace(-0.44 * math.pi, 0.44 * math.pi, 7), prism_tints)):
        d_p = -bk * math.cos(ang_p) + left * math.sin(ang_p)
        d_p /= np.linalg.norm(d_p)
        h_p = first_hit(c_crown, d_p) or 0.098
        p_root = c_crown + d_p * (h_p + 0.026)
        u_mid = 1.0 - abs(idx_p - 3) / 3.5
        len_p = 0.060 + 0.044 * u_mid
        dir_spire = up * 0.86 + d_p * 0.51
        dir_spire /= np.linalg.norm(dir_spire)
        parts_h.append(blob(f'{gid_h}_prism_mount_{idx_p}', p_root, (0.026, 0.018, 0.026),
                            P('gold', 0.02, fabric='metal.gold'), n=8, rows=4, out=d_p, rigid_joint='Head'))
        opal_p = P(tint_c, 0.02, [
            B('bottom', 0.0, 0.015, 'solid', 'gold'),
        ], [
            PN(0.0, 1.0, 'moonglass_opal', 'cybercyan', tint_c, 0.06),
        ], fabric='glass.moonglass.leaded')
        parts_h.append(horn(f'{gid_h}_prism_{idx_p}', [p_root, p_root + dir_spire * len_p],
                            0.018, 0.004, opal_p, n=6, rows=6, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Iridescent Order Peacock Mitre & Seven-Prism Opal Diadem', 'head', 'xanadu',
                                    parts_h, covers_hair=True, covers_face=False))

    # --- 2. TORSO: Peacock & Turquoise Silk Robe, Moonglass-Opal Front & Opal-Drop Sash (`xan_m/f_iridescent_robe`) ---
    gid_t = f'xan_{sex}_iridescent_robe'
    parts_t = []
    robe_p = P('peacock', 0.03, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.026, 'solid', 'gold'),
        B('bottom', 0.026, 0.095, 'moonglass_opal', 'cybercyan', 'violet', 0.08),
    ], [
        PN(0.08, 0.36, 'xanadu_sun_wheel', 'gold', 'turq', 0.22),
        PN(0.64, 0.92, 'xanadu_sun_wheel', 'gold', 'turq', 0.22),
        PN(0.36, 0.40, 'solid', 'gold', 'gold', 1.0),
        PN(0.60, 0.64, 'solid', 'gold', 'gold', 1.0),
        PN(0.40, 0.60, 'moonglass_opal', 'cybercyan', 'violet', 0.20),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_robe', TOP, ANKLE + 0.04, 0.016, robe_p,
                              n=50, rows=22, hang_from=WAIST - 0.02, flare=0.18,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Leaded moonglass-opal central front stole panel
    opal_panel_p = P('cybercyan', 0.02, [
        B('top', 0.0, 0.018, 'solid', 'gold'),
        B('bottom', 0.0, 0.024, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'moonglass_opal', 'cybercyan', 'violet', 0.16),
    ], fabric='glass.moonglass.leaded')
    parts_t.extend(tabard(gid_t + '_opal_panel', KNEE - 0.04, CHEST + 0.01, opal_panel_p, width=0.18, ease=0.023, front=True))

    # Semicircular prism collar_disc in gold & moonglass_opal
    collar_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.022, 'dentils', 'cybercyan', 'gold', 0.025),
        B('top', 0.0, 0.014, 'solid', 'violet'),
    ], [
        PN(0.0, 1.0, 'moonglass_opal', 'cybercyan', 'gold', 0.08),
    ], fabric='glass.moonglass.leaded')
    parts_t.append(collar_disc(gid_t + '_prism_collar', 0.078, collar_p, drop=0.066, rows=6, scallop=0.07, ease=0.019))

    p_gem = chest_front(CHEST - 0.012, 0.026, x=0.0)
    parts_t.append(rosette(gid_t + '_prism_cabochon', p_gem, FRONT, np.array([1.0, 0.0, 0.0]), 0.032,
                           P('cybercyan', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric='glass.moonglass.leaded'),
                           n=12, thick=0.010, rigid_joint='Spine2'))

    # Violet & gold sash with 7 iridescent opal-drop pendants
    sash_p = P('violet', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'diamonds', 'gold', 'violet', 0.04),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.04, WAIST - 0.035, 0.020, sash_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='band'))

    drop_angles = [math.pi + a_off for a_off in np.linspace(-1.25, 1.25, 7)]
    drop_p = P('cybercyan', 0.02, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'moonglass_opal', 'cybercyan', 'lacrose', 0.05),
    ], fabric='glass.moonglass.leaded')
    parts_t.extend(pendants(gid_t + '_opal_drop_', WAIST - 0.022, drop_angles, (0.028, 0.022, 0.048), drop_p, ease=0.020))

    sl_p = P('turq', 0.03, [
        B('bottom', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.024, 0.090, 'moonglass_opal', 'cybercyan', 'violet', 0.055),
    ], fabric='cloth.silk')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.028, rows=10))
    entries.append(assemble_garment(gid_t, 'Iridescent Order Peacock Silk & Moonglass-Opal Robe', 'torso', 'xanadu', parts_t))

    # --- 3. FEET: Peacock & Gold Rainbow-Piped Boots (`xan_m/f_iridescent_boots`) ---
    gid_f = f'xan_{sex}_iridescent_boots'
    sole_p = P('gold', 0.02, fabric='metal.gold')
    upper_p = P('peacock', 0.03, [
        B('top', 0.0, 0.048, 'stripes', 'saffron', 'violet', 0.014),
        B('bottom', 0.0, 0.022, 'solid', 'gold'),
    ], [
        PN(0.30, 0.70, 'moonglass_opal', 'cybercyan', 'peacock', 0.06),
    ], fabric='leather.polished')
    entries.append(assemble_garment(gid_f, 'Iridescent Order Peacock & Rainbow-Piped Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, upper_p, top=0.50, ease_top=0.032)))
    return entries


# ===============================================================================================================
# 5. MONK_AZURE — Order of the Azure Dream (Gret-Ail Silent Felt & Blue Vigil Lamp)
# ===============================================================================================================
def _build_monk_azure_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    ANKLE = core.ANKLE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Soundless Midnight & Azure Felt Vigil Cowl & Blue-Lotus Crescent (`xan_m/f_azure_cowl`) ---
    gid_h = f'xan_{sex}_azure_cowl'
    parts_h = []
    hood_p = P('midnight', 0.05, [
        B('bottom', 0.0, 0.024, 'solid', 'cream'),
        B('bottom', 0.024, 0.046, 'solid', 'azure'),
        B('top', 0.0, 0.028, 'solid', 'azure'),
    ], [
        PN(0.28, 0.72, 'diamond_quilt', 'azure', 'midnight', 0.10),
    ], fabric='cloth.felt.boiled')
    parts_h.append(hood(gid_h + '_cowl', hood_p, ease=0.032, ease_low=0.050,
                        open_front=0.92, low=-0.52, rows=14, n=36, peak=0.045, high=1.02))

    parts_h.append(crown_band(gid_h + '_felt_band',
                              P('azure', 0.04, [B('bottom', 0.0, 0.008, 'solid', 'cream')], fabric='cloth.felt.boiled'),
                              f0=0.58, f1=0.70, ease=0.021, flare=0.004, rows=5, n=36))

    # Gold & cybercyan blue-lotus crescent brow badge
    c_brow = a + (b - a) * 0.65
    h_brow = first_hit(c_brow, -bk) or 0.100
    p_badge = c_brow - bk * (h_brow + 0.030)
    parts_h.append(rosette(gid_h + '_crescent_disc', p_badge, -bk, up, 0.026,
                           P('gold', 0.02, [B('bottom', 0.0, 0.007, 'solid', 'midnight')], fabric='metal.gold'),
                           n=14, thick=0.008, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_blue_lotus', p_badge - bk * 0.008 + up * 0.006, (0.034, 0.018, 0.042),
                        P('cybercyan', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'gold')], fabric='beads.glass'),
                        n=12, rows=5, out=-bk, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Azure Dream Soundless Felt Vigil Cowl & Blue-Lotus Badge', 'head', 'xanadu',
                                    parts_h, covers_hair=True, covers_face=False))

    # --- 2. TORSO: Soundless Quilted Azure Felt Robe, Wax-Tablet & Blue-Glass Vigil Lamp (`xan_m/f_azure_robe`) ---
    gid_t = f'xan_{sex}_azure_robe'
    parts_t = []
    robe_p = P('azure', 0.05, [
        B('top', 0.0, 0.024, 'solid', 'cream'),
        B('bottom', 0.0, 0.028, 'solid', 'cream'),
        B('bottom', 0.028, 0.095, 'rose', 'cybercyan', 'midnight', 0.075),
    ], [
        PN(0.0, 0.38, 'diamond_quilt', 'azure', 'midnight', 0.14),
        PN(0.62, 1.0, 'diamond_quilt', 'azure', 'midnight', 0.14),
        PN(0.38, 0.62, 'fluted', 'midnight', 'azure', 0.07),
    ], fabric='cloth.felt.boiled')
    parts_t.append(torso_tube(gid_t + '_robe', TOP, ANKLE + 0.04, 0.017, robe_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.17,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Soft cream felt collar_disc
    collar_p = P('cream', 0.05, [
        B('bottom', 0.0, 0.018, 'solid', 'azure'),
        B('top', 0.0, 0.012, 'solid', 'cybercyan'),
    ], fabric='cloth.felt.boiled')
    parts_t.append(collar_disc(gid_t + '_felt_collar', 0.072, collar_p, drop=0.060, rows=6, scallop=0.05, ease=0.019))

    # Conformed cream felt sash
    sash_p = P('cream', 0.05, [
        B('top', 0.0, 0.010, 'solid', 'azure'),
        B('bottom', 0.0, 0.010, 'solid', 'cybercyan'),
    ], fabric='cloth.felt.boiled')
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.04, WAIST - 0.035, 0.020, sash_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='band'))

    # Left hip (+X): Dream-recording wax-tablet & brass stylus at 0.022 ease
    d_tab = np.array([0.78, -0.62, 0.0])
    d_tab /= np.linalg.norm(d_tab)
    p_tab_in = surface_out(spine_at(WAIST - 0.005), d_tab, 0.018, bvh=core.BVH_T)
    p_tab = surface_out(spine_at(WAIST - 0.005), d_tab, 0.022, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_tablet_loop', [p_tab_in, p_tab], 0.008,
                        P('cream', 0.05, fabric='cloth.felt.boiled'), n=8, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_wax_tablet', p_tab - np.array([0.0, 0.0, 0.038]), (0.076, 0.024, 0.102),
                        P('midnight', 0.03, [B('top', 0.0, 0.014, 'solid', 'yakbrown'),
                                             B('bottom', 0.0, 0.014, 'solid', 'yakbrown')], fabric='leather.polished'),
                        n=12, rows=5, out=d_tab, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_brass_stylus',
                        [p_tab + d_tab * 0.012 + np.array([-0.018, 0.0, 0.005]),
                         p_tab + d_tab * 0.012 + np.array([0.018, 0.0, -0.078])],
                        0.006, P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))

    # Right hip (-X): Hooded cybercyan blue-glass vigil lamp on brass bracket
    d_lmp = np.array([-0.78, -0.62, 0.0])
    d_lmp /= np.linalg.norm(d_lmp)
    p_lmp_in = surface_out(spine_at(WAIST - 0.005), d_lmp, 0.018, bvh=core.BVH_T)
    p_lmp = surface_out(spine_at(WAIST - 0.005), d_lmp, 0.025, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_lamp_bracket', [p_lmp_in, p_lmp], 0.009,
                        P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_vigil_lamp',
                        [p_lmp - np.array([0.0, 0.0, 0.072]), p_lmp - np.array([0.0, 0.0, 0.006])],
                        0.024,
                        P('cybercyan', 0.02, [B('top', 0.0, 0.014, 'solid', 'brass'),
                                              B('bottom', 0.0, 0.016, 'solid', 'brass')], fabric='beads.glass'),
                        n=14, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_lamp_hood', p_lmp + np.array([0.0, 0.0, 0.004]), (0.056, 0.056, 0.036),
                        P('midnight', 0.03, [B('bottom', 0.0, 0.010, 'solid', 'brass')], fabric='metal.gold'),
                        n=12, rows=5, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Hips'))

    # Sleeves with sacred cybercyan wrist-thread cuff bands
    sl_p = P('azure', 0.05, [
        B('bottom', 0.0, 0.018, 'solid', 'cream'),
        B('bottom', 0.018, 0.052, 'stripes', 'cybercyan', 'midnight', 0.012),
    ], fabric='cloth.felt.boiled')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Azure Dream Soundless Felt Robe, Wax-Tablet & Vigil Lamp', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Trapezoidal Wooden Santur Dulcimer & Silver Dream Cup Flask (`xan_m/f_azure_dulcimer`) ---
    gid_b = f'xan_{sex}_azure_dulcimer'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    parts_b.append(blob(gid_b + '_felt_pad', p_bk + d_bk * 0.016, (0.20, 0.036, 0.22),
                        P('cream', 0.05, fabric='cloth.felt.boiled'), n=12, rows=5, out=d_bk, rigid_joint='Spine2'))

    # Trapezoidal santur box-dulcimer soundboard + angled rails + gold strings
    san_c = p_bk + d_bk * 0.042 + np.array([-0.020, 0.0, 0.0])
    san_p = P('saddle', 0.04, [
        B('top', 0.0, 0.020, 'solid', 'gold'),
        B('bottom', 0.0, 0.020, 'solid', 'gold'),
        B('top', 0.030, 0.230, 'stripes', 'gold', 'yakbrown', 0.014),
    ], [
        PN(0.25, 0.75, 'xanadu_mosaic', 'cybercyan', 'yakbrown', 0.10),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_santur_soundboard', san_c, (0.23, 0.052, 0.26), san_p,
                        n=16, rows=7, out=d_bk, rigid_joint='Spine2'))

    # Crisp trapezoidal side & bridge rails around the soundboard
    rail_p = P('yakbrown', 0.04, [B('top', 0.0, 0.02, 'solid', 'gold')], fabric='leather.polished')
    tl = san_c + np.array([0.082, 0.012, 0.125])
    tr = san_c + np.array([-0.082, 0.012, 0.125])
    bl = san_c + np.array([0.132, 0.012, -0.125])
    br = san_c + np.array([-0.132, 0.012, -0.125])
    for r_tag, p0, p1 in (('top', tl, tr), ('bot', bl, br), ('left', bl, tl), ('right', br, tr)):
        parts_b.append(tube(f'{gid_b}_santur_rail_{r_tag}', [p0, p1], 0.011, rail_p, n=10, rigid_joint='Spine2'))

    # Silver milk-and-honey Dream Cup flask strapped beside the santur
    flk_c = p_bk + d_bk * 0.048 + np.array([0.125, 0.0, 0.025])
    parts_b.append(tube(gid_b + '_dream_cup_flask',
                        [flk_c - np.array([0.0, 0.0, 0.068]), flk_c + np.array([0.0, 0.0, 0.068])],
                        0.026,
                        P('silver', 0.02, [B('top', 0.0, 0.020, 'solid', 'gold'),
                                           B('bottom', 0.0, 0.020, 'solid', 'azure')], fabric='metal.iron'),
                        n=14, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_dream_cup_cap', flk_c + np.array([0.0, 0.0, 0.080]), (0.042, 0.042, 0.036),
                        P('cybercyan', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'silver')], fabric='metal.iron'),
                        n=12, rows=5, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('cream', 0.05, [B('top', 0.0, 0.008, 'solid', 'azure')], fabric='cloth.felt.boiled')))
    entries.append(assemble_garment(gid_b, 'Azure Dream Santur Box-Dulcimer & Silver Dream-Cup Flask', 'back', 'xanadu', parts_b))

    # --- 4. LEGS: Soft Midnight Felt Vigil Trousers (`xan_m/f_azure_trousers`) ---
    gid_l = f'xan_{sex}_azure_trousers'
    trou_p = P('midnight', 0.05, [
        B('bottom', 0.0, 0.025, 'solid', 'cream'),
        B('bottom', 0.025, 0.055, 'solid', 'azure'),
    ], fabric='cloth.felt.boiled')
    entries.append(assemble_garment(gid_l, 'Azure Dream Soft Midnight Felt Trousers', 'legs', 'xanadu',
                                    trousers(gid_l, trou_p, ease=0.015, ease_end=0.017), legged=True))

    # --- 5. FEET: Thick Silent Cream & Azure Felt Shoes (`xan_m/f_azure_feltshoes`) ---
    gid_f = f'xan_{sex}_azure_feltshoes'
    sole_p = P('cream', 0.06, [B('bottom', 0.0, 0.012, 'solid', 'midnight')], fabric='cloth.felt.boiled')
    upper_p = P('azure', 0.05, [
        B('top', 0.0, 0.030, 'solid', 'cream'),
        B('bottom', 0.0, 0.022, 'solid', 'cream'),
    ], fabric='cloth.felt.boiled')
    entries.append(assemble_garment(gid_f, 'Azure Dream Thick Silent Felt Vigil Shoes', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, upper_p, top=0.35, ease_top=0.030)))
    return entries


# ===============================================================================================================
# 6. MONK_VIOLET_STORM — Order of the Violet Storm (House of the Tempest Cavalry Warrior-Monk)
# ===============================================================================================================
def _build_monk_violet_storm_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Damascened Kulah-Khud Helm & Violet Monastic Turban-Fold (`xan_m/f_tempest_helm`) ---
    gid_h = f'xan_{sex}_tempest_helm'
    parts_h = []
    bowl_p = P('steel', 0.03, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
        B('top', 0.0, 0.024, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'chahar_aina', 'gold', 'steel', 0.08),
    ], fabric='metal.iron')
    parts_h.append(head_rings(gid_h + '_bowl', 0.56, 1.02, 0.016, bowl_p, n=36, rows=8, apex=True))

    # Thick violet & gold monastic turban-fold wrapped around the lower rim
    turban_fold_p = P('violet', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'saffron'),
    ], [
        PN(0.0, 1.0, 'stripes', 'gold', 'violet', 0.03),
    ], fabric='cloth.silk')
    parts_h.append(crown_band(gid_h + '_turban_fold', turban_fold_p, f0=0.46, f1=0.76, ease=0.026, flare=0.016, rows=7, n=40))

    c_torus = a + (b - a) * 0.58
    torus_pts = []
    for an in np.linspace(0.0, 2.0 * math.pi, 25):
        d_t = -bk * math.cos(an) + left * math.sin(an)
        d_t /= np.linalg.norm(d_t)
        h_t = first_hit(c_torus, d_t) or 0.098
        torus_pts.append(c_torus + d_t * (h_t + 0.034) + up * (0.005 * math.sin(3.0 * an)))
    parts_h.append(horn(gid_h + '_turban_twist', torus_pts, 0.016, 0.016,
                        P('violet', 0.04, [B('top', 0.0, 0.012, 'stripes', 'gold', 'violet', 0.025)], fabric='cloth.silk'),
                        n=10, rows=25, rigid_joint='Head'))

    # Gilded storm-wheel brow boss & apex spike
    c_brow = a + (b - a) * 0.62
    h_brow = first_hit(c_brow, -bk) or 0.100
    parts_h.append(rosette(gid_h + '_storm_wheel_boss', c_brow - bk * (h_brow + 0.044), -bk, up, 0.030,
                           P('gold', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'violet')], fabric='metal.gold'),
                           n=10, thick=0.010, rigid_joint='Head'))
    c_apex = a + (b - a) * 1.02 + up * 0.012
    parts_h.append(horn(gid_h + '_apex_spike', [c_apex, c_apex + up * 0.105], 0.022, 0.003,
                        P('gold', 0.02, [B('bottom', 0.0, 0.024, 'solid', 'violet')], fabric='metal.gold'),
                        n=12, rows=6, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Violet Storm Kulah-Khud Helm & Monastic Turban-Fold', 'head', 'xanadu',
                                    parts_h, covers_hair=True, covers_face=False))

    # --- 2. TORSO: Violet Diamond-Quilt Cavalry Coat, Chahar-Aina Cuirass & Zen Sash (`xan_m/f_tempest_coat`) ---
    gid_t = f'xan_{sex}_tempest_coat'
    parts_t = []
    coat_p = P('violet', 0.05, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.026, 'solid', 'gold'),
        B('bottom', 0.026, 0.090, 'xanadu_sun_wheel', 'gold', 'purple', 0.065),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'violet', 'purple', 0.15),
    ], fabric='cloth.quilted.diamond')
    parts_t.append(torso_tube(gid_t + '_coat', TOP, KNEE + 0.02, 0.017, coat_p,
                              n=48, rows=20, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('purple', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'saffron'),
    ], fabric='cloth.quilted.diamond'), high=0.036))

    # Chahar-Aina four-mirror cuirass band strictly below armpits (z_top = CHEST + 0.012 <= CHEST + 0.015)
    mirror_p = P('steel', 0.03, [
        B('top', 0.0, 0.014, 'solid', 'gold'),
        B('bottom', 0.0, 0.014, 'solid', 'gold'),
    ], [
        PN(0.12, 0.88, 'chahar_aina', 'gold', 'steel', 0.18),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_cuirass_band', CHEST + 0.012, WAIST + 0.04, 0.019, mirror_p,
                              n=44, rows=7, hull_from=CHEST + 0.02, role='band'))

    # Gilded storm-wheel chest boss
    p_boss = chest_front(CHEST - 0.038, 0.029, x=0.0)
    parts_t.append(rosette(gid_t + '_storm_boss', p_boss, FRONT, np.array([1.0, 0.0, 0.0]), 0.040,
                           P('gold', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'violet')], fabric='metal.gold'),
                           n=10, thick=0.011, rigid_joint='Spine2'))

    # Contoured steel/gold pauldrons
    pauld_p = P('steel', 0.03, [
        B('bottom', 0.0, 0.022, 'dentils', 'gold', 'violet', 0.03),
        B('top', 0.0, 0.014, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'chahar_aina', 'gold', 'steel', 0.065),
    ], fabric='metal.iron')
    parts_t.append(pauldron(gid_t + '_pauld_L', L, pauld_p, reach=0.35, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_pauld_R', R, pauld_p, reach=0.35, ease=0.024, flare_end=0.98))

    # Diagonal saffron monastic zen sash
    zen_p = P('saffron', 0.04, [
        B('top', 0.0, 0.008, 'solid', 'gold'),
        B('bottom', 0.0, 0.008, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'saffron_kesa', 'gold', 'saffron', 0.08),
    ], fabric='cloth.silk')
    parts_t.append(band(gid_t + '_zen_sash', WAIST + 0.01, SHOULDER + 0.02, 0.052, 0.022,
                        zen_p, high=math.pi * 0.45, rows=5))

    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.035, WAIST - 0.035, 0.021,
                              P('purple', 0.04, [B('top', 0.0, 0.010, 'solid', 'gold'),
                                                 B('bottom', 0.0, 0.010, 'solid', 'gold')], fabric='leather.polished'),
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))

    # Sleeves with chahar_aina archer's bazuband forearm cuffs
    sl_p = P('violet', 0.05, [
        B('bottom', 0.0, 0.155, 'chahar_aina', 'gold', 'steel', 0.045),
        B('bottom', 0.155, 0.175, 'solid', 'gold'),
    ], fabric='cloth.quilted.diamond')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.024, rows=10))
    bazu_p = P('steel', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
        B('bottom', 0.0, 0.012, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'chahar_aina', 'gold', 'steel', 0.06),
    ], fabric='metal.iron')
    for s in (L, R):
        fa, hnd = J(s + 'ForeArm'), J(s + 'Hand')
        p_b0 = fa + (hnd - fa) * 0.22
        p_b1 = fa + (hnd - fa) * 0.88
        parts_t.append(limb_tube(f'{gid_t}_bazuband_{s[0]}', p_b0, p_b1, 0.022, bazu_p,
                                 n=18, rows=5, ease_end=0.025, bvh=core.BVH_A, rmax=0.11, role='cuff', side=s[0]))
    entries.append(assemble_garment(gid_t, 'Violet Storm Cavalry Coat, Chahar-Aina Cuirass & Bazubands', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Gorytos Bow-Case with Curved Horn Bow & Peacock-Fletched Quiver (`xan_m/f_tempest_bowpack`) ---
    gid_b = f'xan_{sex}_tempest_bowpack'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)

    # Violet & gold xanadu_sun_wheel brocade gorytos bow-case + curved composite horn bow tip
    gor_c = p_bk + d_bk * 0.038 + np.array([-0.052, 0.0, -0.025])
    gor_p = P('violet', 0.04, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.022, 'solid', 'gold'),
    ], [
        PN(0.10, 0.90, 'xanadu_sun_wheel', 'gold', 'violet', 0.16),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_gorytos_case', gor_c, (0.155, 0.064, 0.275), gor_p,
                        n=16, rows=7, out=d_bk, rigid_joint='Spine2'))

    bow_pts = [
        gor_c + np.array([0.0, 0.0, 0.08]),
        gor_c + np.array([-0.028, 0.006, 0.145]),
        gor_c + np.array([-0.068, 0.012, 0.205]),
        gor_c + np.array([-0.052, 0.016, 0.265]),
        gor_c + np.array([-0.082, 0.020, 0.305]),
    ]
    parts_b.append(horn(gid_b + '_horn_bow_tip', bow_pts, 0.018, 0.007,
                        P('soot', 0.04, [B('bottom', 0.0, 0.035, 'solid', 'ivory'),
                                         B('top', 0.0, 0.025, 'solid', 'gold')], fabric='leather.polished'),
                        n=10, rows=9, rigid_joint='Spine2'))

    # Peacock-fletched arrow quiver
    qv_bot = p_bk + d_bk * 0.052 + np.array([-0.010, 0.0, -0.135])
    qv_top = p_bk + d_bk * 0.058 + np.array([0.088, 0.0, 0.125])
    qv_dir = (qv_top - qv_bot) / np.linalg.norm(qv_top - qv_bot)
    parts_b.append(tube(gid_b + '_quiver', [qv_bot, qv_top], 0.032,
                        P('purple', 0.04, [B('top', 0.0, 0.028, 'chahar_aina', 'gold', 'steel', 0.04),
                                           B('bottom', 0.0, 0.024, 'solid', 'gold')], fabric='leather.polished'),
                        n=14, rigid_joint='Spine2'))
    for ia, (dx_a, dz_a, col_f) in enumerate((
        (-0.014, 0.008, 'peacock'),
        (0.0, 0.014, 'turq'),
        (0.014, 0.006, 'peacock'),
        (-0.006, -0.010, 'gold'),
    )):
        f_base = qv_top + np.array([dx_a, 0.0, dz_a]) - qv_dir * 0.015
        parts_b.append(horn(f'{gid_b}_arrow_fletch_{ia}', [f_base, f_base + qv_dir * 0.075], 0.006, 0.013,
                            P(col_f, 0.03, [B('bottom', 0.0, 0.015, 'solid', 'gold')], fabric='cloth.silk'),
                            n=8, rows=5, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('purple', 0.04, [B('top', 0.0, 0.008, 'solid', 'gold')], fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Violet Storm Gorytos Horn-Bow & Peacock-Fletched Quiver', 'back', 'xanadu', parts_b))

    # --- 4. LEGS: Reinforced Violet & Gold Cavalry Riding Breeches (`xan_m/f_tempest_breeches`) ---
    gid_l = f'xan_{sex}_tempest_breeches'
    seat_p = P('purple', 0.05, [B('top', 0.0, 0.024, 'solid', 'gold')], fabric='leather.buckskin')
    leg_p = P('violet', 0.05, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.065, 'stripes', 'saffron', 'violet', 0.018),
    ], [
        PN(0.36, 0.64, 'diamond_quilt', 'violet', 'purple', 0.12),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'Violet Storm Reinforced Cavalry Breeches', 'legs', 'xanadu',
                                    trousers(gid_l, leg_p, ease=0.014, ease_end=0.015, seat_paint=seat_p),
                                    legged=True))

    # --- 5. FEET: Tall Violet & Gilded Steel Cavalry Boots (`xan_m/f_tempest_boots`) ---
    gid_f = f'xan_{sex}_tempest_boots'
    sole_p = P('soot', 0.08, [B('bottom', 0.0, 0.014, 'solid', 'gold')])
    upper_p = P('violet', 0.04, [
        B('top', 0.0, 0.045, 'stripes', 'gold', 'saffron', 0.016),
        B('bottom', 0.0, 0.028, 'solid', 'gold'),
    ], [
        PN(0.28, 0.72, 'chahar_aina', 'gold', 'steel', 0.055),
    ], fabric='metal.iron')
    entries.append(assemble_garment(gid_f, 'Violet Storm Tall Gilded-Steel Cavalry Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, upper_p, top=0.62, ease_top=0.034)))
    return entries


# ===============================================================================================================
# 7. MONK_WHITE_LILY — Order of the White Lily (Qiblai Grand Hospital & Kirstabal Latex House)
# ===============================================================================================================
def _build_monk_white_lily_for_sex(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    ANKLE = core.ANKLE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Crisp Lilywhite Silk Physician's Turban & White-Lily Brooch (`xan_m/f_lily_turban`) ---
    gid_h = f'xan_{sex}_lily_turban'
    parts_h = []
    dome_p = P('lilywhite', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'celadon'),
    ], [
        PN(0.0, 1.0, 'fluted', 'cream', 'lilywhite', 0.06),
    ], fabric='cloth.silk')
    parts_h.append(head_rings(gid_h + '_dome', 0.54, 1.04, 0.018, dome_p, n=36, rows=8, apex=True))

    fold1_p = P('lilywhite', 0.03, [
        B('top', 0.0, 0.008, 'solid', 'celadon'),
        B('bottom', 0.0, 0.008, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'stripes', 'cream', 'lilywhite', 0.028),
    ], fabric='cloth.silk')
    parts_h.append(crown_band(gid_h + '_wrap_low', fold1_p, f0=0.48, f1=0.78, ease=0.024, flare=0.014, rows=6, n=40))
    parts_h.append(crown_band(gid_h + '_wrap_high',
                              P('lilywhite', 0.03, [B('bottom', 0.0, 0.008, 'solid', 'celadon')], fabric='cloth.silk'),
                              f0=0.64, f1=0.92, ease=0.026, flare=0.010, rows=5, n=38))

    # Gilded Eight-Spoke Wheel & White-Lily petal brooch
    c_brow = a + (b - a) * 0.65
    h_brow = first_hit(c_brow, -bk) or 0.100
    p_brooch = c_brow - bk * (h_brow + 0.036)
    parts_h.append(rosette(gid_h + '_wheel_brooch', p_brooch, -bk, up, 0.028,
                           P('gold', 0.02, [B('bottom', 0.0, 0.007, 'solid', 'celadon')], fabric='metal.gold'),
                           n=8, thick=0.009, rigid_joint='Head'))
    for idx_pt, (dx_l, dz_l, h_pet) in enumerate(((-0.016, 0.014, 0.036), (0.0, 0.022, 0.046), (0.016, 0.014, 0.036))):
        p_pet = p_brooch - bk * 0.008 + left * dx_l + up * dz_l
        parts_h.append(blob(f'{gid_h}_lily_petal_{idx_pt}', p_pet, (0.020, 0.014, h_pet),
                            P('white', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric='cloth.silk'),
                            n=10, rows=5, out=-bk, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'White Lily Physician Silk Turban & Gilded Lily-Wheel Brooch', 'head', 'xanadu',
                                    parts_h, covers_hair=True, covers_face=False))

    # --- 2. TORSO: Bleached Hospitaler Robe, Waxed Half-Apron, 4 Salve-Pots & Knife Case (`xan_m/f_lily_robe`) ---
    gid_t = f'xan_{sex}_lily_robe'
    parts_t = []
    robe_p = P('lilywhite', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'celadon'),
        B('bottom', 0.0, 0.026, 'solid', 'celadon'),
        B('bottom', 0.026, 0.088, 'rose', 'celadon', 'lilywhite', 0.065),
    ], [
        PN(0.46, 0.54, 'solid', 'celadon', 'lilywhite', 1.0, down=0.38),
    ], fabric=COTTON)
    parts_t.append(torso_tube(gid_t + '_robe', TOP, ANKLE + 0.04, 0.016, robe_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.16,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('celadon', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'lilywhite'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], fabric='cloth.silk'), high=0.036))

    capelet_p = P('lilywhite', 0.04, [
        B('bottom', 0.0, 0.022, 'solid', 'celadon'),
        B('bottom', 0.022, 0.032, 'solid', 'gold'),
        B('top', 0.0, 0.012, 'solid', 'gold'),
    ], fabric=COTTON)
    parts_t.append(collar_disc(gid_t + '_capelet', 0.106, capelet_p, drop=0.092, rows=10, n=52, scallop=0.024, ease=0.021))

    # Waxed cream Kirstabal surgical half-apron in cloth.oiled
    apron_p = P('cream', 0.03, [
        B('top', 0.0, 0.018, 'solid', 'celadon'),
        B('bottom', 0.0, 0.022, 'solid', 'celadon'),
    ], [
        PN(0.0, 0.08, 'solid', 'lilywhite', 'cream', 1.0),
        PN(0.92, 1.0, 'solid', 'lilywhite', 'cream', 1.0),
    ], fabric='cloth.canvas.oiled')
    parts_t.extend(tabard(gid_t + '_half_apron', KNEE + 0.03, WAIST + 0.025, apron_p, width=0.25, ease=0.023, front=True))

    # Celadon & gold sash fitted flush (0.022 ease) with 4 ivory alabaster salve-pots & brass poppy-scoring knife case
    sash_p = P('celadon', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'gold'),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.04, WAIST - 0.035, 0.020, sash_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='band'))

    salve_p = P('ivory', 0.02, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'celadon'),
    ], fabric='leather.polished')
    for idx_s, ang_s in enumerate((-0.78, -0.44, 0.44, 0.78)):
        d_s = np.array([math.sin(ang_s), -math.cos(ang_s), 0.0])
        d_s /= np.linalg.norm(d_s)
        p_in = surface_out(spine_at(WAIST - 0.005), d_s, 0.018, bvh=core.BVH_T)
        p_pot = surface_out(spine_at(WAIST - 0.005), d_s, 0.022, bvh=core.BVH_T)
        parts_t.append(tube(f'{gid_t}_pot_loop_{idx_s}', [p_in, p_pot], 0.007,
                            P('gold', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))
        parts_t.append(blob(f'{gid_t}_salve_pot_{idx_s}', p_pot - np.array([0.0, 0.0, 0.022]), (0.038, 0.032, 0.048),
                            salve_p, n=12, rows=5, out=d_s, rigid_joint='Hips'))

    d_kn = np.array([-0.92, -0.38, 0.0])
    d_kn /= np.linalg.norm(d_kn)
    p_kn_in = surface_out(spine_at(WAIST - 0.005), d_kn, 0.018, bvh=core.BVH_T)
    p_kn = surface_out(spine_at(WAIST - 0.005), d_kn, 0.022, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_knife_loop', [p_kn_in, p_kn], 0.008,
                        P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_poppy_knife_case',
                        [p_kn + np.array([0.0, -0.014, 0.032]), p_kn + np.array([0.0, 0.014, -0.072])],
                        0.013,
                        P('brass', 0.02, [B('top', 0.0, 0.022, 'solid', 'ivory'),
                                          B('bottom', 0.0, 0.016, 'solid', 'celadon')], fabric='metal.gold'),
                        n=10, rigid_joint='Hips'))

    sl_p = P('lilywhite', 0.04, [
        B('bottom', 0.0, 0.032, 'solid', 'celadon'),
        B('bottom', 0.032, 0.046, 'solid', 'gold'),
    ], fabric=COTTON)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_p, ease_end=0.021, rows=10))
    entries.append(assemble_garment(gid_t, 'White Lily Hospitaler Robe, Waxed Apron & Salve-Pots', 'torso', 'xanadu', parts_t))

    # --- 3. GLOVES: Clean Celadon & Waxed Lilywhite Physician's Cuffs & Gloves (`xan_m/f_lily_gloves`) ---
    gid_g = f'xan_{sex}_lily_gloves'
    palm_p = P('lilywhite', 0.02, [
        B('top', 0.0, 0.012, 'solid', 'celadon'),
    ], fabric='cloth.canvas.oiled')
    cuff_p = P('celadon', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
        B('bottom', 0.0, 0.014, 'solid', 'lilywhite'),
    ], fabric='cloth.canvas.oiled')
    entries.append(assemble_garment(gid_g, 'White Lily Kirstabal-Latex Physician Gloves & Cuffs', 'gloves', 'xanadu',
                                    _physician_gloves(gid_g, palm_p, cuff_p)))

    # --- 4. BACK: Cedar-Wood & Brass-Cornered Apothecary Drawer Chest (`xan_m/f_lily_chest`) ---
    gid_b = f'xan_{sex}_lily_chest'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)

    chest_c = p_bk + d_bk * 0.042
    chest_p = P('saddle', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'brass'),
        B('bottom', 0.0, 0.022, 'solid', 'brass'),
    ], [
        PN(0.10, 0.90, 'gold_grid', 'brass', 'yakbrown', 0.09),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_cedar_chest', chest_c, (0.23, 0.105, 0.28), chest_p,
                        n=18, rows=8, out=d_bk, rigid_joint='Spine2'))

    # Brass corner reinforcement rails
    for s_tag, sx in (('L', 0.105), ('R', -0.105)):
        parts_b.append(tube(f'{gid_b}_brass_corner_{s_tag}',
                            [chest_c + np.array([sx, 0.032, -0.125]), chest_c + np.array([sx, 0.032, 0.125])],
                            0.010, P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Spine2'))

    # 6 small brass apothecary drawer pulls
    for ir, dz_d in enumerate((-0.075, 0.0, 0.075)):
        for ic, dx_d in enumerate((-0.048, 0.048)):
            p_pull = chest_c + d_bk * 0.052 + np.array([dx_d, 0.0, dz_d])
            parts_b.append(blob(f'{gid_b}_drawer_pull_{ir}_{ic}', p_pull, (0.024, 0.016, 0.018),
                                P('brass', 0.02, fabric='metal.gold'), n=8, rows=4, out=d_bk, rigid_joint='Spine2'))

    # Rolled clean surgical linen bandage roll strapped atop the cedar chest
    roll_y = chest_c[1] + 0.008
    roll_z = chest_c[2] + 0.152
    parts_b.append(tube(gid_b + '_bandage_roll',
                        [np.array([-0.105, roll_y, roll_z]), np.array([0.105, roll_y, roll_z])],
                        0.030,
                        P('lilywhite', 0.04, [B('top', 0.0, 0.028, 'solid', 'celadon'),
                                              B('bottom', 0.0, 0.028, 'solid', 'celadon')], fabric=COTTON),
                        n=14, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('yakbrown', 0.04, [B('top', 0.0, 0.008, 'solid', 'brass')], fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'White Lily Cedar & Brass Apothecary Drawer Chest', 'back', 'xanadu', parts_b))

    # --- 5. FEET: Quiet Lilywhite & Celadon Hospital Slippers (`xan_m/f_lily_slippers`) ---
    gid_f = f'xan_{sex}_lily_slippers'
    sole_p = P('cream', 0.05, [B('bottom', 0.0, 0.012, 'solid', 'celadon')], fabric='cloth.felt.boiled')
    upper_p = P('lilywhite', 0.04, [
        B('top', 0.0, 0.028, 'solid', 'celadon'),
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
    ], fabric=COTTON)
    entries.append(assemble_garment(gid_f, 'White Lily Quiet Hospitaler Slippers', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, upper_p, top=0.25, ease_top=0.025)))
    return entries


# ===============================================================================================================
# PUBLIC ENTRY POINT
# ===============================================================================================================
def build_xanadu_prismarchy_kit():
    entries = []
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        entries.extend(_build_shared_priest_trousers_for_sex(sex, body_id))
        entries.extend(_build_monk_crimson_for_sex(sex, body_id))
        entries.extend(_build_monk_beacon_for_sex(sex, body_id))
        entries.extend(_build_monk_viridian_for_sex(sex, body_id))
        entries.extend(_build_monk_iridescent_for_sex(sex, body_id))
        entries.extend(_build_monk_azure_for_sex(sex, body_id))
        entries.extend(_build_monk_violet_storm_for_sex(sex, body_id))
        entries.extend(_build_monk_white_lily_for_sex(sex, body_id))
    return entries
