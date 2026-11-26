"""The Sultanate of Xanadu — Society, Court, Chartered Houses & Regional Artisans (`xanadu_society`).

Module 2 of the Xanadu Garment Expansion across male (`mpfb_male`) and female (`mpfb_female`) bodies:
0. `pc_floral_envoy` Completion (`xan_m/f_pc_envoy_turban`, `xan_m/f_pc_envoy_bracers`, `xan_m/f_pc_envoy_cape`):
   Silk peony-brocade envoy turban with jade-and-gold peony rosette & plume; gilded silk & peacock leather
   diplomat bracer-gloves; shoulder-to-calf imperial peacock & gold peony-brocade diplomat's mantle.
1. `house_golden_tears` (Chartered House of the Golden Tears — Armed Rift Gold-Prospectors):
   Gilded steel wide-rimmed sun-hat kettle helm with sculpted 3D gold tear-nugget brow boss & maroon neck
   dust-curtain; expeditionary coin-scale brigandine qaba with Komodo lizard-scale pauldrons, 3 gold-dust
   pokes & brass touchstone balance; dorsal iron-bound prospector coffer, copper batea pan & pickaxe;
   expedition breeches; reinforced gold-buckled Rift prospector boots.
2. `house_rare_devisers` (Chartered House of the Rare Devisers — Theodiga Arcology & Godshearth Delvers):
   Leather & brass delver's kulah cap with glowing moonglass-opal headlamp & perforated brass sulfur-fume
   respirator; machine-waxed oiled canvas & violet silk arcology coat with 5 bronze Descent-Clearance
   plaques on a continuous chain, verdigris/brass pauldrons, and diagonal caliper/wax-canister harness;
   salvaged Ancient silver/brass tubular pack with cybercyan capacitor core & stoppered amber sulfur jar;
   waxed slate & verdigris-piped trousers; heavy brass-cleated arcology boots.
3. `house_two_horns` (Brotherhood of the Two Horns — Twins-Pass & Glyptodont Drovers):
   Thick fleece pass-warden cap mounted symmetrically with twin curved bone/ivory ibex/yak horns;
   sheepskin-lined yakbrown & pomegranate chuba with hexagonal glyptodont-scute pauldrons, fleece collar,
   notched wooden 4% Split-Tally sticks & bronze caravan bell; timber drover's saddle-frame pack with
   coiled yak-hair rope & bronze-tipped glyptodont goad; fleece-cuffed pass-warden boots.
4. `sultan_court` (The Sultan of Xanadu & The Heir at Pher — Pleasure-Dome Regalia):
   Fluted gold & moonglass-opal Taj-i-Qubla imperial turban-crown with gold diadem & triple sorguc plumes;
   floor-length woven gold & imperial violet xanadu_sun_wheel caftan with plush snow-leopard fur capelet,
   gilded pauldrons, dual interlocking gold chains suspending an electric-filament Pleasure-Dome pectoral
   jewel, and spun-gold sash; solid gold & violet opal-studded court slippers.
5. `mint_assessor` (Master of the Mint & Assessor of the Sultan's Fifth — 20%):
   Tall omaroon & gold fluted kavuk pinned with a struck gold qud-coin & balance badge; mongolblue &
   omaroon silk assay robe with scorch-proof gilded leather apron, continuous chain of 9 struck gold qud
   coin-dies, and precision brass assay balance at the sash.
6. `hired_musketeer` (Hired Northern Musketeer & Cannoneer):
   Northern iron/steel combed morion helm wrapped in a Xanadui gold-and-holyred silk pay-scarf & plume;
   buff-leather musketeer coat over blackened iron half-cuirass, Twelve-Apostle wooden powder-charge
   bandolier, and silk pay-sash; dorsal brass-bound matchlock arquebus crossed with forked shooting-rest
   staff; slashed northern mercenary breeches; folded-cuff riding-and-march boots.
7. `glazier_mara` (Laitwal Glazier & Opal-Cutter — Mara, Half-Tungang / Half-Xanadui):
   Hybrid peacock & kesar silk turban pierced by a Tungang gold cloud-hairpin & flip-down brass/moonglass
   lapidary loupe; hybrid indigo Tungang crossover shan jacket over kesar & cholet_pangden chuba skirt,
   waterproof leather wet-grinding apron, dop-wax sticks & copper scoring-wheel; wooden A-frame glazier
   rack carrying layered diamond-leaded moonglass panes framed in copper; waxed indigo & leather boots.
8. `lake_boatman` (Lake Atitlan Cayuco Boatman & Net-Fisher — 20 Lake Towns):
   Wide woven tule-reed lake hat with cholet_pangden Xocomil wind-band; elbow-sleeved oiled-cotton lake
   kurta in stepped wave-stripes with braided net-line sash & carved bone fish-hook/float belt; diagonal
   carved cedar cayuco paddle & woven reed fish-trap creel; rolled-calf wading breeches; reed lake sandals.
9. `koldlod_miner` (Kold-Lod High-Tundra Gold & Opal Miner — 4,812 m, -6 C):
   Frost-rimmed yak-fleece hood with forehead brass butter-lamp bracket & warm amber flame housing;
   double-thick quilted yakbrown wool & rawhide mining chuba with fleece collar, rawhide rock-chafe
   pauldrons, iron rock-chisels & sample pokes; rawhide-and-timber tapered ore hod heaped with gold-veined
   white quartz chunks & strapped iron sledgehammer.
"""
import math
import numpy as np

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, ring_points, assemble_garment
)
from ..paint import P, B, PN, COTTON, WOOL
from ..types.torso import (
    torso_tube, collar, stand_collar, collar_disc, cape, tabard, band, pauldron
)
from ..types.limbs import sleeve, sleeves, trousers
from ..types.footwear import boots, sandal
from ..types.headgear import head_rings, hood, brim, tower_hat, crown_band, horn
from ..types.accoutrements import (
    blob, pouch_belt, sash_with_tail, button_row, pendants, strap, tube, rosette
)
from .xanadu import _dorsal_pad


# ===============================================================================================================
# SHARED HELPERS
# ===============================================================================================================
def _build_chest_gold_chain(gid_prefix, z_neck, w_loop, drop_z, coat_ease, paint, n_links=33):
    """Build a continuous 3D metal chain loop with closely interlocking links resting flush on the chest."""
    parts = []
    curve_pts = []
    n_curve = 25
    for k in range(n_curve):
        u = k / float(n_curve - 1)
        ang = (u - 0.5) * 0.94 * math.pi
        bx = math.sin(ang) * w_loop
        bz = z_neck - math.cos(ang) * drop_z
        curve_pts.append(chest_front(bz, coat_ease + 0.0035, x=bx))
    parts.append(horn(f'{gid_prefix}_cord', curve_pts, 0.0065, 0.0065, paint, n=8, rows=n_curve,
                      rigid_joint='Spine2', role='trinket'))
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


def _bracer_gloves(gid, palm_p, cuff_p):
    """Paired forearm diplomat bracer cuffs + anatomically fitted fingerless silk palm wraps."""
    parts = []
    for s in (L, R):
        parts.append(sleeve(f'{gid}_cuff_{s[0]}', s, cuff_p, f0=0.68, f1=0.98, ease=0.013, flare=0.004, rows=5, n=20))
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
        for t in np.linspace(0.0, 0.90, 5):
            cc = w_pt + d_hand * t
            rx, ry = 0.040 + 0.006 * t, 0.021 * (1.0 - 0.10 * t)
            rows.append([cc + x_ax * (math.cos(an) * rx) + y_ax * (math.sin(an) * ry)
                         for an in np.linspace(0, 2 * math.pi, 20, endpoint=False)])
        palm = Part(f'{gid}_palm_{s[0]}', np.array(rows), True, ['helper-tights'] * 5, palm_p,
                    rigid_joint=s + 'Hand', role='cuff', side=s[0])
        palm.is_arm = True
        parts.append(palm)
    return parts


# ===============================================================================================================
# 0. PC FLORAL ENVOY COMPLETION (`pc_floral_envoy`: Turban, Bracers & Mantle Cape)
# ===============================================================================================================
def _build_pc_floral_envoy_completion(sex, body_id):
    set_body(body_id)
    SHOULDER = core.SHOULDER
    ANKLE = core.ANKLE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Silk Peony-Brocade Envoy Turban (`xan_{sex}_pc_envoy_turban`) ---
    gid_h = f'xan_{sex}_pc_envoy_turban'
    parts_h = []
    turb_paint = P('lacrose', 0.03, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
        B('top', 0.0, 0.026, 'stripes', 'gold', 'turq', 0.024),
    ], [
        PN(0.0, 1.0, 'peony_brocade', 'lacrose', 'cream', 0.14),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_crown', 0.155,
                             lambda s: 0.96 + 0.17 * math.sin(s * math.pi * 0.78) - 0.12 * (s ** 2.1),
                             turb_paint, f=0.50, ease=0.021, rows=10, n=36))

    wrap_paint = P('turq', 0.03, [
        B('top', 0.0, 0.008, 'solid', 'gold'),
        B('bottom', 0.0, 0.008, 'solid', 'gold'),
    ], [
        PN(0.10, 0.90, 'peony_brocade', 'gold', 'turq', 0.10),
    ], fabric='cloth.silk')
    parts_h.append(crown_band(gid_h + '_wrap', wrap_paint, f0=0.46, f1=0.76, ease=0.024, flare=0.010, rows=6, n=36))

    c_brow = a + (b - a) * 0.63
    h_brow = first_hit(c_brow, -bk) or 0.102
    p_ros = c_brow - bk * (h_brow + 0.030)
    parts_h.append(rosette(gid_h + '_peony_mount', p_ros, -bk, up, 0.031,
                           P('gold', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'lacrose')], fabric='metal.gold'),
                           n=12, thick=0.010, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_jade_core', p_ros - bk * 0.007, (0.025, 0.012, 0.025),
                        P('jade', 0.02, [B('top', 0.0, 0.006, 'solid', 'gold')], fabric='metal.gold'),
                        n=10, rows=4, out=-bk, rigid_joint='Head'))
    parts_h.append(horn(gid_h + '_plume',
                        [p_ros + up * 0.016,
                         p_ros + up * 0.088 - bk * 0.014 + left * 0.012,
                         p_ros + up * 0.150 + bk * 0.016 + left * 0.022],
                        0.022, 0.005,
                        P('turq', 0.03, [B('bottom', 0.0, 0.025, 'solid', 'gold'),
                                         B('top', 0.0, 0.030, 'solid', 'lacrose')], fabric='cloth.silk'),
                        n=10, rows=7, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Xanadu Peony-Brocade Envoy Turban', 'head', 'xanadu', parts_h,
                           covers_hair=True, covers_face=False)
    e_h['type'] = 'pc'
    entries.append(e_h)

    # --- 2. GLOVES: Gilded Silk & Peacock Leather Diplomat Bracer-Gloves (`xan_{sex}_pc_envoy_bracers`) ---
    gid_g = f'xan_{sex}_pc_envoy_bracers'
    cuff_p = P('peacock', 0.03, [
        B('top', 0.0, 0.018, 'solid', 'gold'),
        B('bottom', 0.0, 0.016, 'solid', 'gold'),
    ], [
        PN(0.08, 0.92, 'peony_brocade', 'lacrose', 'peacock', 0.09),
    ], fabric='leather.polished')
    palm_p = P('soot', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'gold'),
        B('bottom', 0.0, 0.010, 'solid', 'peacock'),
    ], fabric='cloth.silk')
    e_g = assemble_garment(gid_g, 'Xanadu Peony-Brocade Diplomat Bracer-Gloves', 'gloves', 'xanadu',
                           _bracer_gloves(gid_g, palm_p, cuff_p))
    e_g.pop('hide_parts', None)
    e_g['type'] = 'pc'
    entries.append(e_g)

    # --- 3. BACK: Imperial Peacock & Gold Peony-Brocade Diplomat's Mantle (`xan_{sex}_pc_envoy_cape`) ---
    gid_b = f'xan_{sex}_pc_envoy_cape'
    cape_p = P('peacock', 0.03, [
        B('top', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.0, 0.032, 'solid', 'gold'),
        B('bottom', 0.032, 0.115, 'xanadu_sun_wheel', 'gold', 'lacrose', 0.08),
    ], [
        PN(0.0, 0.08, 'solid', 'gold', 'peacock', 1.0),
        PN(0.92, 1.0, 'solid', 'gold', 'peacock', 1.0),
        PN(0.08, 0.92, 'peony_brocade', 'lacrose', 'peacock', 0.28),
    ], fabric='cloth.silk')
    parts_b = [cape(gid_b + '_mantle', ANKLE + 0.18, cape_p, z_top=SHOULDER + 0.01,
                    span=0.40 * math.pi, ease=0.038, flare=0.11, rows=18, n=30)]
    e_b = assemble_garment(gid_b, 'Xanadu Peony-Brocade Diplomat Mantle', 'back', 'xanadu', parts_b)
    e_b['type'] = 'pc'
    entries.append(e_b)
    return entries


# ===============================================================================================================
# 1. HOUSE OF THE GOLDEN TEARS (`house_golden_tears` — Armed Rift Gold-Prospectors)
# ===============================================================================================================
def _build_house_golden_tears(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Gilded Steel Sun-Hat Kettle Helm & Gold Tear-Nugget Boss (`xan_{sex}_tears_helm`) ---
    gid_h = f'xan_{sex}_tears_helm'
    parts_h = []
    bowl_p = P('steel', 0.03, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
        B('top', 0.0, 0.026, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'chahar_aina', 'gold', 'steel', 0.085),
    ], fabric='metal.iron')
    bowl = head_rings(gid_h + '_bowl', 0.54, 1.0, 0.016, bowl_p, n=36, rows=7, apex=True)
    bowl.rigid_joint = 'Head'
    parts_h.append(bowl)

    brim_p = P('steel', 0.03, [
        B('bottom', 0.0, 0.016, 'solid', 'gold'),
        B('top', 0.0, 0.012, 'solid', 'omaroon'),
    ], [
        PN(0.0, 1.0, 'chahar_aina', 'gold', 'steel', 0.09),
    ], fabric='metal.iron')
    k_brim = brim(gid_h + '_brim', 0.56, 0.092, brim_p, ease=0.017, rows=5, n=40, droop=0.022)
    k_brim.rigid_joint = 'Head'
    parts_h.append(k_brim)

    c_brow = a + (b - a) * 0.68
    h_brow = first_hit(c_brow, -bk) or 0.100
    p_tear = c_brow - bk * (h_brow + 0.022)
    parts_h.append(rosette(gid_h + '_tear_bezel', p_tear, -bk, up, 0.026,
                           P('gold', 0.02, [B('bottom', 0.0, 0.006, 'solid', 'omaroon')], fabric='metal.gold'),
                           n=12, thick=0.008, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_tear_nugget', p_tear - bk * 0.008, (0.032, 0.020, 0.046),
                        P('gold', 0.02, [B('top', 0.0, 0.012, 'solid', 'amber')], fabric='metal.gold'),
                        n=12, rows=6, out=-bk, rigid_joint='Head'))

    curt_p = P('omaroon', 0.05, [
        B('bottom', 0.0, 0.020, 'cholet_pangden', 'gold', 'omaroon', 0.035),
        B('top', 0.0, 0.012, 'solid', 'gold'),
    ], fabric='cloth.quilted.diamond')
    angs_curt = np.linspace(-0.60 * math.pi, 0.60 * math.pi, 26)
    curt_rows = []
    for k, f_z in enumerate(np.linspace(0.54, 0.04, 6)):
        c_row = a + (b - a) * f_z
        flare_r = 0.017 + 0.026 * (k / 5.0)
        curt_rows.append(ring_points(c_row, bk, left, angs_curt, flare_r, rmin=0.055))
    parts_h.append(Part(gid_h + '_dust_curtain', np.array(curt_rows), False, ['body'] * len(curt_rows),
                        curt_p, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Golden Tears Kettle Sun-Helm & Nugget Boss', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Coin-Scale Brigandine Qaba, Komodo Pauldrons & Gold-Dust Belt (`xan_{sex}_tears_coat`) ---
    gid_t = f'xan_{sex}_tears_coat'
    parts_t = []
    qaba_p = P('omaroon', 0.05, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.026, 'solid', 'gold'),
        B('bottom', 0.026, 0.088, 'cholet_pangden', 'gold', 'turq', 0.055),
    ], [
        PN(0.10, 0.36, 'lamellar_scale', 'gold', 'omaroon', 0.14),
        PN(0.64, 0.90, 'lamellar_scale', 'gold', 'omaroon', 0.14),
        PN(0.36, 0.40, 'solid', 'gold', 'gold', 1.0),
        PN(0.60, 0.64, 'solid', 'gold', 'gold', 1.0),
        PN(0.40, 0.60, 'chahar_aina', 'gold', 'omaroon', 0.20),
    ], fabric='cloth.quilted.diamond')
    parts_t.append(torso_tube(gid_t + '_qaba', TOP, KNEE + 0.03, 0.016, qaba_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('omaroon', 0.04, [B('top', 0.0, 0.012, 'solid', 'gold'),
                                                           B('bottom', 0.0, 0.010, 'solid', 'jade')], fabric='cloth.silk'),
                                high=0.036))

    brig_p = P('gold', 0.02, [
        B('top', 0.0, 0.014, 'solid', 'omaroon'),
        B('bottom', 0.0, 0.014, 'solid', 'omaroon'),
    ], [
        PN(0.12, 0.88, 'chahar_aina', 'gold', 'steel', 0.16),
    ], fabric='metal.gold')
    parts_t.append(torso_tube(gid_t + '_coin_brig', CHEST + 0.012, WAIST + 0.035, 0.019, brig_p,
                              rows=6, n=44, hull_from=CHEST + 0.015, role='band'))

    komodo_p = P('jade', 0.04, [
        B('bottom', 0.0, 0.020, 'solid', 'gold'),
        B('top', 0.0, 0.014, 'solid', 'omaroon'),
    ], [
        PN(0.0, 1.0, 'quetzal_scale', 'gold', 'turq', 0.07),
    ], fabric='leather.polished')
    parts_t.append(pauldron(gid_t + '_pauld_L', L, komodo_p, reach=0.35, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_pauld_R', R, komodo_p, reach=0.35, ease=0.024, flare_end=0.98))

    belt_p = P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'gold'),
                                 B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric='leather.polished')
    poke_p = P('buck', 0.05, [B('top', 0.0, 0.022, 'solid', 'gold'),
                              B('bottom', 0.0, 0.018, 'beads', 'gold', 'omaroon', 0.025)], fabric='leather.buckskin')
    parts_t.extend(pouch_belt(gid_t + '_belt', belt_p, poke_p, ease=0.022))

    # Brass touchstone balance connected to the belt at right-front hip via 3D bracket
    d_bal = np.array([-0.68, -0.73, 0.0])
    d_bal /= np.linalg.norm(d_bal)
    t_bal = np.array([-d_bal[1], d_bal[0], 0.0])
    p_belt_b = surface_out(spine_at(WAIST - 0.010), d_bal, 0.019, bvh=core.BVH_T)
    p_bal = surface_out(spine_at(WAIST - 0.010), d_bal, 0.023, bvh=core.BVH_T)
    brass_p = P('brass', 0.02, fabric='metal.bronze')
    parts_t.append(tube(gid_t + '_bal_bracket', [p_belt_b, p_bal], 0.009, brass_p, n=8, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_bal_beam', [p_bal - t_bal * 0.038, p_bal + t_bal * 0.038], 0.006, brass_p,
                        n=8, rigid_joint='Hips'))
    for idx_pan, sgn_p in enumerate((-1.0, 1.0)):
        parts_t.append(blob(f'{gid_t}_bal_pan_{idx_pan}', p_bal + t_bal * (sgn_p * 0.034) - np.array([0.0, 0.0, 0.032]),
                            (0.028, 0.024, 0.014), brass_p, n=10, rows=4, out=d_bal, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_touchstone', p_bal - np.array([0.0, 0.0, 0.044]), (0.024, 0.016, 0.036),
                        P('basalt', 0.04, [B('top', 0.0, 0.008, 'solid', 'gold')], fabric='metal.iron'),
                        n=10, rows=4, out=d_bal, rigid_joint='Hips'))

    sl_p = P('omaroon', 0.05, [
        B('bottom', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.024, 0.082, 'quetzal_scale', 'gold', 'jade', 0.045),
    ], fabric='cloth.quilted.diamond')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Golden Tears Coin-Scale Brigandine & Komodo Qaba', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Iron-Bound Prospector Coffer, Copper Batea Pan & Pickaxe (`xan_{sex}_tears_pack`) ---
    gid_b = f'xan_{sex}_tears_pack'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    coffer_c = p_bk + d_bk * 0.022
    coffer_p = P('yakbrown', 0.06, [
        B('top', 0.0, 0.026, 'solid', 'iron'),
        B('bottom', 0.0, 0.026, 'solid', 'iron'),
    ], [
        PN(0.18, 0.82, 'chahar_aina', 'gold', 'yakbrown', 0.18),
        PN(0.0, 0.12, 'solid', 'iron', 'yakbrown', 1.0),
        PN(0.88, 1.0, 'solid', 'iron', 'yakbrown', 1.0),
    ], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_coffer', coffer_c, (0.25, 0.14, 0.29), coffer_p,
                        n=18, rows=8, out=d_bk, rigid_joint='Spine2'))
    pan_c = coffer_c + d_bk * 0.068
    parts_b.append(rosette(gid_b + '_batea_pan', pan_c, d_bk, np.array([1.0, 0.0, 0.0]), 0.132,
                           P('copper', 0.03, [B('bottom', 0.0, 0.018, 'solid', 'gold'),
                                              B('top', 0.0, 0.012, 'solid', 'amber')], fabric='metal.bronze'),
                           n=22, thick=0.016, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_pick_shaft',
                        [coffer_c + np.array([-0.105, 0.046, -0.19]), coffer_c + np.array([0.105, 0.046, 0.19])],
                        0.013, P('saddle', 0.05, [B('top', 0.0, 0.022, 'solid', 'iron')]),
                        n=10, rigid_joint='Spine2'))
    parts_b.append(horn(gid_b + '_pick_head',
                        [coffer_c + np.array([0.025, 0.050, 0.215]),
                         coffer_c + np.array([0.095, 0.050, 0.175]),
                         coffer_c + np.array([0.175, 0.050, 0.105])],
                        0.015, 0.005,
                        P('iron', 0.03, [B('top', 0.0, 0.015, 'solid', 'steel')], fabric='metal.iron'),
                        n=10, rows=7, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'gold')], fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Golden Tears Prospector Coffer, Batea Pan & Pickaxe', 'back', 'xanadu', parts_b))

    # --- 4. LEGS: Expedition Breeches (`xan_{sex}_tears_trousers`) ---
    gid_l = f'xan_{sex}_tears_trousers'
    trou_p = P('yakbrown', 0.06, [
        B('bottom', 0.0, 0.032, 'solid', 'omaroon'),
        B('bottom', 0.032, 0.068, 'cholet_pangden', 'gold', 'omaroon', 0.035),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'Golden Tears Expedition Breeches', 'legs', 'xanadu',
                                    trousers(gid_l, trou_p, ease=0.015, ease_end=0.016), legged=True))

    # --- 5. FEET: Gold-Buckled Rift Prospector Boots (`xan_{sex}_tears_boots`) ---
    gid_f = f'xan_{sex}_tears_boots'
    sole_p = P('soot', 0.08, [B('bottom', 0.0, 0.016, 'solid', 'gold')])
    upper_p = P('leather', 0.04, [
        B('top', 0.0, 0.035, 'stripes', 'gold', 'omaroon', 0.018),
        B('bottom', 0.0, 0.022, 'solid', 'gold'),
    ], fabric='leather.polished')
    wrap_p = P('gold', 0.02, [B('top', 0.0, 0.006, 'solid', 'leather')], fabric='metal.gold')
    entries.append(assemble_garment(gid_f, 'Golden Tears Gold-Buckled Rift Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, upper_p, top=0.52, wraps=2, wrap_paint=wrap_p, ease_top=0.034)))
    return entries


# ===============================================================================================================
# 2. HOUSE OF THE RARE DEVISERS (`house_rare_devisers` — Theodiga Arcology & Godshearth Delvers)
# ===============================================================================================================
def _build_house_rare_devisers(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Delver's Kulah Cap, Moonglass Headlamp & Sulfur Respirator (`xan_{sex}_deviser_hat`) ---
    gid_h = f'xan_{sex}_deviser_hat'
    parts_h = []
    kulah_p = P('leather', 0.05, [
        B('bottom', 0.0, 0.018, 'solid', 'brass'),
        B('top', 0.0, 0.024, 'stripes', 'brass', 'violet', 0.025),
    ], [
        PN(0.38, 0.62, 'hex', 'brass', 'leather', 0.055),
    ], fabric='leather.polished')
    parts_h.append(tower_hat(gid_h + '_kulah', 0.142, lambda s: 0.98 * (1.0 - 0.38 * (s ** 2.0)),
                             kulah_p, f=0.52, ease=0.019, rows=10, n=36))
    parts_h.append(crown_band(gid_h + '_harness_band',
                              P('brass', 0.02, [B('top', 0.0, 0.006, 'solid', 'verdigris'),
                                                B('bottom', 0.0, 0.006, 'solid', 'leather')], fabric='metal.bronze'),
                              f0=0.49, f1=0.66, ease=0.022, flare=0.005, rows=5, n=36))

    # Glowing moonglass_opal brow headlamp
    c_brow = a + (b - a) * 0.63
    h_brow = first_hit(c_brow, -bk) or 0.102
    p_l0 = c_brow - bk * (h_brow + 0.016)
    p_l1 = c_brow - bk * (h_brow + 0.044)
    parts_h.append(tube(gid_h + '_lamp_bezel', [p_l0, p_l1], 0.026,
                        P('brass', 0.02, [B('top', 0.0, 0.008, 'solid', 'verdigris')], fabric='metal.bronze'),
                        n=14, rigid_joint='Head'))
    parts_h.append(rosette(gid_h + '_lamp_lens', p_l1 - bk * 0.003, -bk, left, 0.023,
                           P('cybercyan', 0.01, [
                               B('bottom', 0.0, 0.006, 'moonglass_opal', 'cybercyan', 'violet', 0.03),
                           ], [
                               PN(0.0, 1.0, 'moonglass_opal', 'cybercyan', 'lilywhite', 0.04),
                           ], fabric='glass.moonglass.leaded'),
                           n=14, thick=0.006, rigid_joint='Head'))

    # Perforated brass sulfur-fume nose/mouth respirator + cheek filter canisters
    c_resp = a + (b - a) * 0.22
    h_resp = first_hit(c_resp, -bk) or 0.106
    p_snout = c_resp - bk * (h_resp + 0.018)
    parts_h.append(blob(gid_h + '_respirator', p_snout, (0.076, 0.042, 0.066),
                        P('brass', 0.02, [
                            B('top', 0.0, 0.012, 'solid', 'leather'),
                            B('bottom', 0.0, 0.016, 'beads', 'soot', 'brass', 0.018),
                        ], [
                            PN(0.20, 0.80, 'beads', 'soot', 'brass', 0.016),
                        ], fabric='metal.bronze'),
                        n=14, rows=6, out=-bk, rigid_joint='Head'))
    for s_tag, sx in (('L', 1.0), ('R', -1.0)):
        d_chk = -bk * 0.70 + left * (sx * 0.71)
        d_chk /= np.linalg.norm(d_chk)
        p_c0 = p_snout + left * (sx * 0.032) + bk * 0.006
        p_c1 = p_c0 + d_chk * 0.028 - up * 0.006
        parts_h.append(tube(f'{gid_h}_canister_{s_tag}', [p_c0, p_c1], 0.019,
                            P('verdigris', 0.03, [B('top', 0.0, 0.007, 'solid', 'brass'),
                                                  B('bottom', 0.0, 0.007, 'solid', 'brass')], fabric='metal.bronze'),
                            n=12, rigid_joint='Head'))
        p_ear = a + (b - a) * 0.36 + left * (sx * 0.084) + bk * 0.008
        parts_h.append(strap(f'{gid_h}_resp_strap_{s_tag}', [p_c0 + bk * 0.006, p_ear], 0.009,
                             P('leather', 0.05), rigid_joint='Head'))

    entries.append(assemble_garment(gid_h, 'Rare Deviser Kulah, Moonglass Lamp & Sulfur Respirator', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Oiled-Canvas & Violet Silk Arcology Coat & Clearance Chain (`xan_{sex}_deviser_coat`) ---
    gid_t = f'xan_{sex}_deviser_coat'
    parts_t = []
    coat_p = P('saddle', 0.05, [
        B('top', 0.0, 0.022, 'solid', 'brass'),
        B('bottom', 0.0, 0.026, 'solid', 'brass'),
        B('bottom', 0.026, 0.088, 'xanadu_mosaic', 'verdigris', 'violet', 0.06),
    ], [
        PN(0.37, 0.41, 'solid', 'brass', 'saddle', 1.0),
        PN(0.59, 0.63, 'solid', 'brass', 'saddle', 1.0),
        PN(0.41, 0.59, 'moonglass_opal', 'cybercyan', 'violet', 0.18),
    ], fabric='cloth.canvas.oiled')
    parts_t.append(torso_tube(gid_t + '_coat', TOP, KNEE + 0.02, 0.016, coat_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('violet', 0.03, [B('top', 0.0, 0.012, 'solid', 'brass'),
                                                          B('bottom', 0.0, 0.010, 'solid', 'verdigris')], fabric='cloth.silk'),
                                high=0.036))

    pauld_p = P('verdigris', 0.03, [
        B('bottom', 0.0, 0.020, 'dentils', 'brass', 'verdigris', 0.03),
        B('top', 0.0, 0.014, 'solid', 'brass'),
    ], [
        PN(0.0, 1.0, 'hex', 'brass', 'verdigris', 0.06),
    ], fabric='metal.bronze')
    parts_t.append(pauldron(gid_t + '_pauld_L', L, pauld_p, reach=0.34, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_pauld_R', R, pauld_p, reach=0.34, ease=0.024, flare_end=0.98))

    # Continuous bronze chest chain suspending 5 Descent-Clearance plaques
    bronze_chain_p = P('bronze', 0.02, [B('top', 0.0, 0.006, 'solid', 'verdigris')], fabric='metal.bronze')
    parts_t.extend(_build_chest_gold_chain(f'{gid_t}_clearance_chain', TOP - 0.018, 0.084, 0.142, 0.019,
                                           bronze_chain_p, n_links=29))
    for k in range(5):
        u_p = 0.14 + 0.18 * k
        ang_p = (u_p - 0.5) * 0.94 * math.pi
        bx = math.sin(ang_p) * 0.084
        bz = TOP - 0.018 - math.cos(ang_p) * 0.142 - 0.012
        parts_t.append(blob(f'{gid_t}_plaque_{k}', chest_front(bz, 0.022, x=bx),
                            (0.028, 0.011, 0.038),
                            P('bronze', 0.02, [B('top', 0.0, 0.008, 'solid', 'verdigris'),
                                               B('bottom', 0.0, 0.008, 'solid', 'cybercyan' if k == 2 else 'brass')],
                              fabric='metal.bronze'),
                            n=10, rows=5, out=FRONT, rigid_joint='Spine2', role='trinket'))

    # Diagonal instrument band() harness (left shoulder +X to right hip -X) with brass calipers & wax canisters
    parts_t.append(band(gid_t + '_harness', WAIST, SHOULDER + 0.01, 0.044, 0.021,
                        P('leather', 0.05, [B('top', 0.0, 0.007, 'solid', 'brass'),
                                            B('bottom', 0.0, 0.007, 'solid', 'brass')], fabric='leather.polished'),
                        high=math.pi * 0.45, rows=5))
    for idx_w, (z_w, x_w, col_w) in enumerate(((CHEST + 0.024, 0.060, 'amber'), (WAIST + 0.065, -0.060, 'lacrose'))):
        pw = chest_front(z_w, 0.021, x=x_w)
        parts_t.append(tube(f'{gid_t}_wax_can_{idx_w}',
                            [pw - np.array([0.0, 0.0, 0.024]), pw + np.array([0.0, 0.0, 0.024])],
                            0.012,
                            P(col_w, 0.03, [B('top', 0.0, 0.010, 'solid', 'brass'),
                                            B('bottom', 0.0, 0.010, 'solid', 'brass')], fabric='metal.bronze'),
                            n=10, rigid_joint='Spine2'))
    p_cal = chest_front(CHEST - 0.035, 0.023, x=0.0)
    brass_p = P('brass', 0.02, fabric='metal.bronze')
    parts_t.append(rosette(gid_t + '_caliper_pivot', p_cal, FRONT, np.array([1.0, 0.0, 0.0]), 0.014,
                           brass_p, n=10, thick=0.007, rigid_joint='Spine2'))
    for s_leg, dx_l in (('L', 0.020), ('R', -0.020)):
        parts_t.append(horn(f'{gid_t}_caliper_{s_leg}',
                            [p_cal, p_cal + np.array([dx_l, 0.0, -0.052])],
                            0.006, 0.0025, brass_p, n=8, rows=5, rigid_joint='Spine2'))

    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.035, WAIST - 0.035, 0.020,
                              P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'brass'),
                                                  B('bottom', 0.0, 0.008, 'solid', 'verdigris')], fabric='leather.polished'),
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))

    sl_p = P('saddle', 0.05, [
        B('bottom', 0.0, 0.025, 'solid', 'brass'),
        B('bottom', 0.025, 0.078, 'stripes', 'violet', 'verdigris', 0.025),
    ], fabric='cloth.canvas.oiled')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Rare Deviser Arcology Coat & Descent-Clearance Plaques', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Salvaged Ancient Tubular Frame, Cybercyan Capacitor & Sulfur Jar (`xan_{sex}_deviser_pack`) ---
    gid_b = f'xan_{sex}_deviser_pack'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    silv_p = P('silver', 0.02, [B('top', 0.0, 0.015, 'solid', 'brass')], fabric='metal.iron')
    for s_tag, sx in (('L', 1.0), ('R', -1.0)):
        parts_b.append(tube(f'{gid_b}_rail_{s_tag}',
                            [p_bk + np.array([sx * 0.095, 0.014, -0.15]), p_bk + np.array([sx * 0.095, 0.014, 0.16])],
                            0.013, silv_p, n=10, rigid_joint='Spine2'))
    for idx_cb, z_cb in enumerate((-0.13, 0.0, 0.14)):
        parts_b.append(tube(f'{gid_b}_cross_{idx_cb}',
                            [p_bk + np.array([-0.105, 0.016, z_cb]), p_bk + np.array([0.105, 0.016, z_cb])],
                            0.011, brass_p, n=10, rigid_joint='Spine2'))

    cap_bot = p_bk + np.array([0.044, 0.056, -0.11])
    cap_top = p_bk + np.array([0.044, 0.056, 0.12])
    parts_b.append(tube(gid_b + '_cap_core', [cap_bot, cap_top], 0.040,
                        P('cybercyan', 0.01, [
                            B('top', 0.0, 0.022, 'solid', 'lilywhite'),
                            B('bottom', 0.0, 0.022, 'solid', 'lilywhite'),
                        ], [
                            PN(0.0, 1.0, 'moonglass_opal', 'cybercyan', 'violet', 0.08),
                        ], fabric='glass.moonglass.leaded'),
                        n=16, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_cap_end_top', [cap_top - np.array([0.0, 0.0, 0.018]), cap_top + np.array([0.0, 0.0, 0.018])],
                        0.045, brass_p, n=16, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_cap_end_bot', [cap_bot - np.array([0.0, 0.0, 0.018]), cap_bot + np.array([0.0, 0.0, 0.018])],
                        0.045, brass_p, n=16, rigid_joint='Spine2'))

    jar_c = p_bk + np.array([-0.052, 0.048, -0.02])
    parts_b.append(blob(gid_b + '_sulfur_jar', jar_c, (0.092, 0.086, 0.145),
                        P('amber', 0.02, [B('top', 0.0, 0.024, 'solid', 'brass'),
                                          B('bottom', 0.0, 0.020, 'solid', 'brass')], fabric='glass.moonglass.leaded'),
                        n=14, rows=6, out=d_bk, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_jar_stopper',
                        [jar_c + np.array([0.0, 0.0, 0.065]), jar_c + np.array([0.0, 0.0, 0.096])],
                        0.022, P('brass', 0.02, [B('top', 0.0, 0.010, 'solid', 'holyred')], fabric='metal.bronze'),
                        n=12, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'brass')], fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Rare Deviser Capacitor Core & Sulfur Jar Frame', 'back', 'xanadu', parts_b))

    # --- 4. LEGS: Waxed Slate & Verdigris-Piped Delver Trousers (`xan_{sex}_deviser_trousers`) ---
    gid_l = f'xan_{sex}_deviser_trousers'
    trou_p = P('slate', 0.05, [
        B('bottom', 0.0, 0.028, 'solid', 'verdigris'),
        B('bottom', 0.028, 0.044, 'solid', 'brass'),
    ], [
        PN(0.22, 0.27, 'solid', 'verdigris', 'slate', 1.0),
        PN(0.73, 0.78, 'solid', 'verdigris', 'slate', 1.0),
    ], fabric='cloth.canvas.oiled')
    entries.append(assemble_garment(gid_l, 'Rare Deviser Waxed Delver Trousers', 'legs', 'xanadu',
                                    trousers(gid_l, trou_p, ease=0.014, ease_end=0.015), legged=True))

    # --- 5. FEET: Heavy Brass-Cleated Arcology Boots (`xan_{sex}_deviser_boots`) ---
    gid_f = f'xan_{sex}_deviser_boots'
    sole_p = P('brass', 0.03, [B('bottom', 0.0, 0.014, 'dentils', 'soot', 'brass', 0.022)], fabric='metal.bronze')
    upper_p = P('leather', 0.04, [
        B('top', 0.0, 0.032, 'solid', 'verdigris'),
        B('bottom', 0.0, 0.024, 'solid', 'brass'),
    ], fabric='leather.polished')
    entries.append(assemble_garment(gid_f, 'Rare Deviser Brass-Cleated Arcology Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, upper_p, top=0.50, wraps=2, wrap_paint=brass_p, ease_top=0.033)))
    return entries


# ===============================================================================================================
# 3. BROTHERHOOD OF THE TWO HORNS (`house_two_horns` — Twins-Pass & Glyptodont Drovers)
# ===============================================================================================================
def _build_house_two_horns(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Asiatic Tibetan-Mongol Spired Kulah Helm, Brocade Ear-Lappets & Swept Argali Crest-Horns (`xan_{sex}_twohorns_hat`) ---
    gid_h = f'xan_{sex}_twohorns_hat'
    parts_h = []

    # Conical fluted iron & gilded-bronze Turco-Mongol / Tibetan spired kulah bowl
    kulah_p = P('iron', 0.03, [
        B('bottom', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.022, 0.054, 'cholet_pangden', 'pomegranate', 'turq', 0.032),
        B('top', 0.0, 0.032, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'lamellar_scale', 'gold', 'iron', 0.075),
    ], fabric='metal.iron')
    kulah = tower_hat(gid_h + '_kulah', 0.176,
                      lambda s: 1.02 * ((1.0 - s) ** 0.72) + 0.06,
                      kulah_p, f=0.52, ease=0.018, rows=11, n=36)
    kulah.rigid_joint = 'Head'
    parts_h.append(kulah)

    # Tibetan lotus-bud & turquoise finial spire at the apex
    p_apex = a + (b - a) * 0.52 + up * 0.172
    parts_h.append(rosette(gid_h + '_lotus_base', p_apex, up, -bk, 0.028,
                           P('gold', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'pomegranate')], fabric='metal.gold'),
                           n=12, thick=0.009, rigid_joint='Head'))
    parts_h.append(horn(gid_h + '_spire',
                        [p_apex + up * 0.004, p_apex + up * 0.038, p_apex + up * 0.072],
                        0.016, 0.003,
                        P('gold', 0.02, [B('bottom', 0.0, 0.018, 'solid', 'turq')], fabric='metal.gold'),
                        n=10, rows=6, rigid_joint='Head'))

    # Quilted pomegranate-brocade & yak-fleece Tibetan/Mongol cheek-and-nape lappets (`tsering` / `bashlyk` flaps)
    lappet_p = P('pomegranate', 0.04, [
        B('bottom', 0.0, 0.024, 'solid', 'cream'),
        B('bottom', 0.024, 0.058, 'cholet_pangden', 'gold', 'turq', 0.035),
        B('top', 0.0, 0.012, 'solid', 'gold'),
    ], [
        PN(0.15, 0.85, 'diamond_quilt', 'gold', 'pomegranate', 0.08),
    ], fabric='cloth.quilted.diamond')
    angs_lap = np.linspace(-0.66 * math.pi, 0.66 * math.pi, 28)
    lap_rows = []
    for k_l, f_z in enumerate(np.linspace(0.54, 0.00, 7)):
        c_row = a + (b - a) * f_z
        u_l = k_l / 6.0
        flare_r = 0.018 + 0.024 * (u_l ** 1.15)
        lap_rows.append(ring_points(c_row, bk, left, angs_lap, flare_r, rmin=0.056))
    parts_h.append(Part(gid_h + '_lappets', np.array(lap_rows), False, ['body'] * len(lap_rows),
                        lappet_p, rigid_joint='Head'))

    # Upturned yak-fleece & gilded rim band around the brow
    fleece_brim = crown_band(gid_h + '_fleece_band',
                             P('cream', 0.09, [B('top', 0.0, 0.009, 'solid', 'gold'),
                                               B('bottom', 0.0, 0.010, 'solid', 'yakbrown')], fabric='fur.yak'),
                             f0=0.49, f1=0.66, ease=0.022, flare=0.008, rows=5, n=36)
    fleece_brim.rigid_joint = 'Head'
    parts_h.append(fleece_brim)

    # Central gilded Twin-Peaks & Turquoise mountain-pass brow clasp
    c_brow = a + (b - a) * 0.64
    h_brow = first_hit(c_brow, -bk) or 0.100
    p_clasp = c_brow - bk * (h_brow + 0.026)
    parts_h.append(rosette(gid_h + '_brow_clasp', p_clasp, -bk, up, 0.028,
                           P('gold', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'turq')], fabric='metal.gold'),
                           n=12, thick=0.009, rigid_joint='Head'))

    # Brow-mounted dark ridged Asiatic wild-yak / argali crest-horns sweeping UPWARD & BACKWARD along the spire
    # (never horizontal out of the temples like a Viking helmet!)
    horn_p = P('soot', 0.04, [
        B('bottom', 0.0, 0.028, 'solid', 'gold'),
        B('top', 0.0, 0.032, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'stripes', 'darkfur', 'soot', 0.014),
    ], fabric='leather.polished')
    for s_tag, sx in (('L', 1.0), ('R', -1.0)):
        d_mount = -bk * 0.88 + left * (sx * 0.36) + up * 0.18
        d_mount /= np.linalg.norm(d_mount)
        h_m = first_hit(c_brow, d_mount) or 0.098
        p0 = c_brow + d_mount * (h_m + 0.020)
        parts_h.append(rosette(f'{gid_h}_socket_{s_tag}', p0 + d_mount * 0.004, d_mount, up, 0.020,
                               P('gold', 0.02, [B('bottom', 0.0, 0.006, 'solid', 'turq')], fabric='metal.gold'),
                               n=10, thick=0.007, rigid_joint='Head'))
        p1 = p0 + up * 0.042 - bk * 0.006 + left * (sx * 0.018)
        p2 = p1 + up * 0.056 + bk * 0.032 + left * (sx * 0.024)
        p3 = p2 + up * 0.052 + bk * 0.046 + left * (sx * 0.014)
        p4 = p3 + up * 0.036 + bk * 0.034 - left * (sx * 0.010)
        parts_h.append(horn(f'{gid_h}_horn_{s_tag}', [p0, p1, p2, p3, p4], 0.022, 0.004,
                            horn_p, n=12, rows=11, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Two Horns Spired Kulah-Bashlyk Helm & Swept Argali Crest-Horns', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Sheepskin Chuba, Glyptodont-Scute Pauldrons & Split-Tallies (`xan_{sex}_twohorns_coat`) ---
    gid_t = f'xan_{sex}_twohorns_coat'
    parts_t = []
    chuba_p = P('yakbrown', 0.06, [
        B('top', 0.0, 0.028, 'solid', 'cream'),
        B('bottom', 0.0, 0.035, 'solid', 'cream'),
        B('bottom', 0.035, 0.095, 'cholet_pangden', 'pomegranate', 'turq', 0.055),
    ], [
        PN(0.14, 0.36, 'solid', 'pomegranate', 'yakbrown', 1.0),
        PN(0.64, 0.86, 'solid', 'pomegranate', 'yakbrown', 1.0),
        PN(0.36, 0.40, 'solid', 'gold', 'yakbrown', 1.0),
        PN(0.60, 0.64, 'solid', 'gold', 'yakbrown', 1.0),
        PN(0.40, 0.60, 'cholet_pangden', 'pomegranate', 'turq', 0.14),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_chuba', TOP, KNEE - 0.02, 0.018, chuba_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.15,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    fleece_p = P('cream', 0.10, [B('bottom', 0.0, 0.020, 'solid', 'yakbrown')], fabric='fur.yak')
    parts_t.append(collar_disc(gid_t + '_fleece_collar', 0.078, fleece_p, drop=0.062, rows=6, scallop=0.05, ease=0.019))

    scute_p = P('bone', 0.05, [
        B('bottom', 0.0, 0.020, 'dentils', 'ochre', 'yakbrown', 0.03),
        B('top', 0.0, 0.015, 'solid', 'ochre'),
    ], [
        PN(0.0, 1.0, 'hex', 'ochre', 'bone', 0.055),
    ], fabric='leather.buckskin')
    parts_t.append(pauldron(gid_t + '_scute_L', L, scute_p, reach=0.36, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_scute_R', R, scute_p, reach=0.36, ease=0.024, flare_end=0.98))

    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.04, WAIST - 0.035, 0.020,
                              P('pomegranate', 0.04, [B('top', 0.0, 0.010, 'solid', 'turq'),
                                                      B('bottom', 0.0, 0.010, 'solid', 'gold')],
                                [PN(0.0, 1.0, 'cholet_pangden', 'turq', 'pomegranate', 0.05)], fabric=WOOL),
                              rows=5, n=42, hull_from=WAIST + 0.08, role='belt'))

    # 3 Notched wooden 4% Split-Tally sticks on left-front hip (0.022 ease)
    d_tly = np.array([0.74, -0.67, 0.0])
    d_tly /= np.linalg.norm(d_tly)
    t_tly = np.array([-d_tly[1], d_tly[0], 0.0])
    p_tly_in = surface_out(spine_at(WAIST - 0.008), d_tly, 0.019, bvh=core.BVH_T)
    p_tly = surface_out(spine_at(WAIST - 0.008), d_tly, 0.022, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_tally_ring', [p_tly_in, p_tly], 0.009,
                        P('bronze', 0.03, fabric='metal.bronze'), n=8, rigid_joint='Hips'))
    tally_p = P('bamboo', 0.05, [B('top', 0.0, 0.012, 'solid', 'pomegranate')],
                [PN(0.0, 1.0, 'stripes', 'yakbrown', 'bamboo', 0.014)], fabric='leather.buckskin')
    for k_t, off_t in enumerate((-0.018, 0.0, 0.018)):
        pt_s = p_tly + t_tly * off_t
        parts_t.append(tube(f'{gid_t}_tally_{k_t}',
                            [pt_s + np.array([0.0, 0.0, 0.012]), pt_s - np.array([0.004 * (k_t - 1), 0.0, 0.082])],
                            0.008, tally_p, n=8, rigid_joint='Hips'))

    # Bronze caravan bell on right-front hip (0.022 ease)
    d_bell = np.array([-0.74, -0.67, 0.0])
    d_bell /= np.linalg.norm(d_bell)
    p_b_in = surface_out(spine_at(WAIST - 0.008), d_bell, 0.019, bvh=core.BVH_T)
    p_bell = surface_out(spine_at(WAIST - 0.008), d_bell, 0.022, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_bell_loop', [p_b_in, p_bell], 0.009,
                        P('bronze', 0.03, fabric='metal.bronze'), n=8, rigid_joint='Hips'))
    parts_t.append(blob(gid_t + '_caravan_bell', p_bell - np.array([0.0, 0.0, 0.034]), (0.044, 0.040, 0.052),
                        P('bronze', 0.02, [B('bottom', 0.0, 0.012, 'solid', 'verdigris'),
                                           B('top', 0.0, 0.010, 'solid', 'gold')], fabric='metal.bronze'),
                        n=12, rows=5, out=d_bell, rigid_joint='Hips'))

    sl_p = P('yakbrown', 0.06, [
        B('bottom', 0.0, 0.038, 'solid', 'cream'),
        B('bottom', 0.038, 0.080, 'cholet_pangden', 'pomegranate', 'turq', 0.04),
    ], fabric=WOOL)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.028, rows=10))
    entries.append(assemble_garment(gid_t, 'Two Horns Glyptodont-Scute Chuba & Split-Tallies', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Timber Saddle-Frame, Coiled Yak-Hair Rope & Glyptodont Goad (`xan_{sex}_twohorns_pack`) ---
    gid_b = f'xan_{sex}_twohorns_pack'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    wood_p = P('saddle', 0.06, [B('top', 0.0, 0.018, 'solid', 'bronze'),
                                B('bottom', 0.0, 0.018, 'solid', 'bronze')], fabric='leather.polished')
    for s_tag, sx in (('L', 1.0), ('R', -1.0)):
        parts_b.append(tube(f'{gid_b}_timber_{s_tag}',
                            [p_bk + np.array([sx * 0.092, 0.018, -0.16]), p_bk + np.array([sx * 0.072, 0.018, 0.17])],
                            0.015, wood_p, n=10, rigid_joint='Spine2'))
    for idx_s, z_s in enumerate((-0.12, 0.01, 0.13)):
        parts_b.append(tube(f'{gid_b}_slat_{idx_s}',
                            [p_bk + np.array([-0.11, 0.022, z_s]), p_bk + np.array([0.11, 0.022, z_s])],
                            0.012, wood_p, n=10, rigid_joint='Spine2'))

    # Coiled darkfur yak-hair rope loop strapped to the saddle-frame
    rope_pts = []
    for k_r in range(21):
        an_r = 2.0 * math.pi * (k_r / 20.0)
        rope_pts.append(p_bk + np.array([0.082 * math.cos(an_r), 0.048 + 0.006 * math.sin(2 * an_r), 0.105 * math.sin(an_r)]))
    parts_b.append(horn(gid_b + '_yak_rope', rope_pts, 0.020, 0.020,
                        P('darkfur', 0.10, [B('top', 0.0, 0.02, 'solid', 'pomegranate')], fabric='fur.yak'),
                        n=10, rows=21, rigid_joint='Spine2'))

    # Long bronze-tipped glyptodont goad strapped diagonally
    g_bot = p_bk + np.array([-0.125, 0.062, -0.23])
    g_top = p_bk + np.array([0.115, 0.062, 0.22])
    parts_b.append(tube(gid_b + '_goad_shaft', [g_bot, g_top], 0.013, wood_p, n=10, rigid_joint='Spine2'))
    g_dir = (g_top - g_bot) / np.linalg.norm(g_top - g_bot)
    parts_b.append(horn(gid_b + '_goad_spike', [g_top, g_top + g_dir * 0.085], 0.015, 0.003,
                        P('bronze', 0.02, [B('bottom', 0.0, 0.018, 'solid', 'turq')], fabric='metal.bronze'),
                        n=10, rows=6, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('yakbrown', 0.06, [B('top', 0.0, 0.008, 'solid', 'pomegranate')], fabric='leather.buckskin')))
    entries.append(assemble_garment(gid_b, 'Two Horns Timber Saddle-Frame, Yak-Rope & Goad', 'back', 'xanadu', parts_b))

    # --- 4. FEET: Fleece-Cuffed Pass-Warden Boots (`xan_{sex}_twohorns_boots`) ---
    gid_f = f'xan_{sex}_twohorns_boots'
    sole_p = P('soot', 0.08, [B('bottom', 0.0, 0.015, 'solid', 'ochre')])
    upper_p = P('yakbrown', 0.05, [
        B('bottom', 0.0, 0.026, 'cholet_pangden', 'turq', 'pomegranate', 0.03),
    ], fabric='leather.buckskin')
    cuff_p = P('cream', 0.10, [B('bottom', 0.0, 0.012, 'solid', 'turq')], fabric='fur.yak')
    entries.append(assemble_garment(gid_f, 'Two Horns Fleece-Cuffed Pass-Warden Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, upper_p, top=0.55, cuff_paint=cuff_p, ease_top=0.035)))
    return entries


# ===============================================================================================================
# 4. THE SULTAN OF XANADU & THE HEIR AT PHER (`sultan_court` — Pleasure-Dome Regalia)
# ===============================================================================================================
def _build_sultan_court(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    CHEST = core.CHEST
    ANKLE = core.ANKLE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Fluted Gold & Moonglass-Opal Taj-i-Qubla Imperial Crown (`xan_{sex}_sultan_taj`) ---
    gid_h = f'xan_{sex}_sultan_taj'
    parts_h = []
    taj_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.022, 'beads', 'cybercyan', 'gold', 0.022),
        B('top', 0.0, 0.035, 'fluted', 'gold', 'violet', 0.028),
    ], [
        PN(0.0, 0.36, 'fluted', 'gold', 'violet', 0.045),
        PN(0.64, 1.0, 'fluted', 'gold', 'violet', 0.045),
        PN(0.36, 0.64, 'xanadu_sun_wheel', 'gold', 'violet', 0.10),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_taj', 0.205,
                             lambda s: 0.96 + 0.24 * math.sin(s * math.pi * 0.72) - 0.14 * (s ** 2.2),
                             taj_p, f=0.49, ease=0.024, rows=12, n=40))

    diadem_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.012, 'beads', 'cybercyan', 'gold', 0.020),
        B('top', 0.0, 0.014, 'dentils', 'lilywhite', 'gold', 0.030),
    ], [
        PN(0.25, 0.75, 'moonglass_opal', 'cybercyan', 'violet', 0.07),
    ], fabric='metal.gold')
    parts_h.append(crown_band(gid_h + '_diadem', diadem_p, f0=0.46, f1=0.78, ease=0.026, flare=0.014, rows=7, n=40))

    c_brow = a + (b - a) * 0.66
    h_brow = first_hit(c_brow, -bk) or 0.102
    aig_c = c_brow - bk * (h_brow + 0.034)
    parts_h.append(rosette(gid_h + '_sorguc_brooch', aig_c, -bk, up, 0.034,
                           P('gold', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'cybercyan')], fabric='metal.gold'),
                           n=14, thick=0.010, rigid_joint='Head'))
    for idx_pl, (dx_pl, h_pl, col_pl) in enumerate(((-0.032, 0.135, 'cybercyan'),
                                                    (0.0, 0.168, 'lilywhite'),
                                                    (0.032, 0.135, 'cybercyan'))):
        p_base = aig_c + up * 0.015 + left * (dx_pl * 0.45)
        parts_h.append(horn(f'{gid_h}_plume_{idx_pl}',
                            [p_base,
                             p_base + up * (h_pl * 0.55) + left * dx_pl - bk * 0.014,
                             p_base + up * h_pl + left * (dx_pl * 1.45) + bk * 0.016],
                            0.020, 0.004,
                            P(col_pl, 0.02, [B('bottom', 0.0, 0.024, 'solid', 'gold'),
                                             B('top', 0.0, 0.024, 'solid', 'gold')], fabric='cloth.silk'),
                            n=10, rows=7, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Sultan Taj-i-Qubla Imperial Crown & Triple Sorguc', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Pleasure-Dome Sovereign Caftan, Snow-Leopard Capelet & Electric Pectoral (`xan_{sex}_sultan_robe`) ---
    gid_t = f'xan_{sex}_sultan_robe'
    parts_t = []
    caftan_p = P('violet', 0.03, [
        B('top', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.0, 0.035, 'solid', 'gold'),
        B('bottom', 0.035, 0.125, 'xanadu_sun_wheel', 'gold', 'violet', 0.085),
        B('bottom', 0.125, 0.150, 'beads', 'cybercyan', 'gold', 0.030),
    ], [
        PN(0.08, 0.36, 'xanadu_sun_wheel', 'gold', 'violet', 0.24),
        PN(0.64, 0.92, 'xanadu_sun_wheel', 'gold', 'violet', 0.24),
        PN(0.36, 0.40, 'solid', 'gold', 'gold', 1.0),
        PN(0.60, 0.64, 'solid', 'gold', 'gold', 1.0),
        PN(0.40, 0.60, 'xanadu_sun_wheel', 'gold', 'pomegranate', 0.20),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_caftan', TOP, ANKLE + 0.04, 0.016, caftan_p,
                              n=52, rows=24, hang_from=WAIST - 0.01, flare=0.22,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    # Plush snow-leopard spotted fur capelet + gilded pauldrons
    leop_p = P('snowleopard', 0.09, [
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
        B('top', 0.012, 0.040, 'beads', 'charcoal', 'snowleopard', 0.030),
    ], [
        PN(0.0, 1.0, 'orb', 'soot', 'snowleopard', 0.045),
    ], fabric='fur.yak')
    parts_t.append(collar_disc(gid_t + '_leopard_capelet', 0.086, leop_p, drop=0.070, rows=6, scallop=0.06, ease=0.020))

    gilt_pauld_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.022, 'dentils', 'violet', 'gold', 0.028),
        B('top', 0.0, 0.014, 'beads', 'cybercyan', 'gold', 0.022),
    ], fabric='metal.gold')
    parts_t.append(pauldron(gid_t + '_pauld_L', L, gilt_pauld_p, reach=0.35, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_pauld_R', R, gilt_pauld_p, reach=0.35, ease=0.024, flare_end=0.98))

    # Dual continuous interlocking gold chains + Pleasure-Dome electric-filament pectoral jewel
    gold_chain_p = P('gold', 0.02, [B('top', 0.0, 0.006, 'solid', 'amber')], fabric='metal.gold')
    parts_t.extend(_build_chest_gold_chain(f'{gid_t}_chain_in', TOP - 0.016, 0.068, 0.110, 0.019, gold_chain_p, n_links=29))
    parts_t.extend(_build_chest_gold_chain(f'{gid_t}_chain_out', TOP - 0.016, 0.090, 0.165, 0.020, gold_chain_p, n_links=37))

    p_pec = chest_front(TOP - 0.016 - 0.165, 0.025, x=0.0)
    parts_t.append(rosette(gid_t + '_pectoral_bezel', p_pec, FRONT, np.array([1.0, 0.0, 0.0]), 0.042,
                           P('gold', 0.02, [B('bottom', 0.0, 0.010, 'solid', 'violet')], fabric='metal.gold'),
                           n=16, thick=0.010, rigid_joint='Spine2'))
    parts_t.append(blob(gid_t + '_pectoral_opal', p_pec + FRONT * 0.008, (0.048, 0.020, 0.056),
                        P('cybercyan', 0.01, [B('top', 0.0, 0.012, 'solid', 'lilywhite')],
                          [PN(0.0, 1.0, 'moonglass_opal', 'cybercyan', 'lilywhite', 0.04)],
                          fabric='glass.moonglass.leaded'),
                        n=14, rows=6, out=FRONT, rigid_joint='Spine2'))

    sash_p = P('gold', 0.02, [
        B('top', 0.0, 0.012, 'solid', 'violet'),
        B('bottom', 0.0, 0.012, 'solid', 'cybercyan'),
    ], [
        PN(0.0, 1.0, 'moonglass_opal', 'gold', 'violet', 0.06),
    ], fabric='metal.gold')
    parts_t.extend(sash_with_tail(gid_t, sash_p, sash_p, ease=0.020, tail=0.34))

    sl_p = P('violet', 0.03, [
        B('bottom', 0.0, 0.032, 'solid', 'gold'),
        B('bottom', 0.032, 0.105, 'xanadu_sun_wheel', 'gold', 'pomegranate', 0.055),
    ], fabric='cloth.silk')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.028, rows=10))
    entries.append(assemble_garment(gid_t, 'Sultan Pleasure-Dome Gold Caftan & Snow-Leopard Regalia', 'torso', 'xanadu', parts_t))

    # --- 3. FEET: Solid Gold & Violet Opal-Studded Court Slippers (`xan_{sex}_sultan_slippers`) ---
    gid_f = f'xan_{sex}_sultan_slippers'
    sole_p = P('gold', 0.02, fabric='metal.gold')
    upper_p = P('gold', 0.02, [
        B('top', 0.0, 0.032, 'beads', 'cybercyan', 'violet', 0.022),
        B('bottom', 0.0, 0.018, 'solid', 'violet'),
    ], [
        PN(0.20, 0.80, 'moonglass_opal', 'cybercyan', 'gold', 0.04),
    ], fabric='metal.gold')
    entries.append(assemble_garment(gid_f, 'Sultan Gold & Moonglass-Opal Court Slippers', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, upper_p, top=0.22, ease_top=0.024)))
    return entries


# ===============================================================================================================
# 5. MASTER OF THE MINT & ASSESSOR OF THE SULTAN'S FIFTH (`mint_assessor`)
# ===============================================================================================================
def _build_mint_assessor(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    ANKLE = core.ANKLE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Tall Omaroon & Gold Bureaucratic Kavuk (`xan_{sex}_mint_kavuk`) ---
    gid_h = f'xan_{sex}_mint_kavuk'
    parts_h = []
    kavuk_p = P('omaroon', 0.03, [
        B('bottom', 0.0, 0.020, 'solid', 'gold'),
        B('top', 0.0, 0.032, 'stripes', 'gold', 'omaroon', 0.022),
    ], [
        PN(0.0, 1.0, 'fluted', 'gold', 'omaroon', 0.04),
    ], fabric='cloth.silk')
    parts_h.append(tower_hat(gid_h + '_kavuk', 0.195,
                             lambda s: 0.95 + 0.18 * math.sin(s * math.pi * 0.72) - 0.08 * (s ** 2.0),
                             kavuk_p, f=0.50, ease=0.022, rows=11, n=38))

    band_p = P('gold', 0.02, [
        B('top', 0.0, 0.008, 'solid', 'omaroon'),
        B('bottom', 0.0, 0.008, 'solid', 'omaroon'),
    ], [
        PN(0.0, 1.0, 'tocharian_wheel', 'gold', 'omaroon', 0.08),
    ], fabric='cloth.silk')
    parts_h.append(crown_band(gid_h + '_wheel_band', band_p, f0=0.47, f1=0.74, ease=0.024, flare=0.009, rows=6, n=38))

    c_brow = a + (b - a) * 0.65
    h_brow = first_hit(c_brow, -bk) or 0.102
    badge_c = c_brow - bk * (h_brow + 0.033)
    parts_h.append(rosette(gid_h + '_qud_badge', badge_c, -bk, up, 0.032,
                           P('gold', 0.02, [B('bottom', 0.0, 0.008, 'solid', 'omaroon')], fabric='metal.gold'),
                           n=14, thick=0.010, rigid_joint='Head'))
    parts_h.append(tube(gid_h + '_badge_beam',
                        [badge_c - left * 0.026 - bk * 0.008, badge_c + left * 0.026 - bk * 0.008],
                        0.004, P('brass', 0.02, fabric='metal.gold'), n=8, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Mint Assessor Fluted Kavuk & Qud-Coin Badge', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Silk Assay Robe, Scorch-Proof Apron & 9 Qud Coin-Dies (`xan_{sex}_mint_robe`) ---
    gid_t = f'xan_{sex}_mint_robe'
    parts_t = []
    robe_p = P('mongolblue', 0.03, [
        B('top', 0.0, 0.024, 'solid', 'gold'),
        B('bottom', 0.0, 0.030, 'solid', 'gold'),
        B('bottom', 0.030, 0.105, 'tocharian_wheel', 'gold', 'omaroon', 0.075),
    ], [
        PN(0.12, 0.36, 'fluted', 'omaroon', 'mongolblue', 0.055),
        PN(0.64, 0.88, 'fluted', 'omaroon', 'mongolblue', 0.055),
        PN(0.36, 0.64, 'xanadu_mosaic', 'gold', 'omaroon', 0.18),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_robe', TOP, ANKLE + 0.03, 0.016, robe_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.18,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('omaroon', 0.03, [B('top', 0.0, 0.012, 'solid', 'gold'),
                                                           B('bottom', 0.0, 0.010, 'solid', 'gold')], fabric='cloth.silk'),
                                high=0.036))

    # Scorch-proof gilded leather chest/waist apron
    apron_p = P('leather', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.028, 'dentils', 'gold', 'omaroon', 0.03),
    ], [
        PN(0.12, 0.88, 'tocharian_wheel', 'gold', 'leather', 0.18),
    ], fabric='leather.polished')
    parts_t.extend(tabard(gid_t + '_apron', KNEE + 0.02, CHEST + 0.02, apron_p,
                          width=0.22, ease=0.021, front=True, back=False))

    # Continuous chest chain of 9 struck gold qud coin-dies
    gold_p = P('gold', 0.02, [B('top', 0.0, 0.006, 'solid', 'ochre')], fabric='metal.gold')
    parts_t.extend(_build_chest_gold_chain(f'{gid_t}_die_chain', TOP - 0.018, 0.086, 0.150, 0.022, gold_p, n_links=31))
    for k in range(9):
        u_d = k / 8.0
        ang_d = (u_d - 0.5) * 0.94 * math.pi
        bx = math.sin(ang_d) * 0.086
        bz = TOP - 0.018 - math.cos(ang_d) * 0.150
        sz_d = 0.032 if k == 4 else 0.023
        parts_t.append(blob(f'{gid_t}_qud_die_{k}', chest_front(bz, 0.025, x=bx), (sz_d, 0.012, sz_d),
                            P('gold', 0.02, [B('top', 0.0, 0.006, 'solid', 'omaroon')], fabric='metal.gold'),
                            n=12, rows=5, out=FRONT, role='trinket'))

    # Conformed sash + precision brass assay balance at right-front hip (0.023 ease)
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.042, WAIST - 0.038, 0.022,
                              P('omaroon', 0.03, [B('top', 0.0, 0.012, 'solid', 'gold'),
                                                  B('bottom', 0.0, 0.012, 'solid', 'gold')], fabric='cloth.silk'),
                              rows=5, n=42, hull_from=WAIST + 0.08, role='band'))
    d_ass = np.array([-0.74, -0.67, 0.0])
    d_ass /= np.linalg.norm(d_ass)
    t_ass = np.array([-d_ass[1], d_ass[0], 0.0])
    p_s_in = surface_out(spine_at(WAIST), d_ass, 0.019, bvh=core.BVH_T)
    p_ass = surface_out(spine_at(WAIST), d_ass, 0.023, bvh=core.BVH_T)
    brass_p = P('brass', 0.02, fabric='metal.bronze')
    parts_t.append(tube(gid_t + '_assay_bracket', [p_s_in, p_ass], 0.009, brass_p, n=8, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_assay_pillar', [p_ass - np.array([0.0, 0.0, 0.036]), p_ass + np.array([0.0, 0.0, 0.022])],
                        0.007, brass_p, n=8, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_assay_beam',
                        [p_ass - t_ass * 0.042 + np.array([0.0, 0.0, 0.018]),
                         p_ass + t_ass * 0.042 + np.array([0.0, 0.0, 0.018])],
                        0.006, brass_p, n=8, rigid_joint='Hips'))
    for idx_sc, sgn_sc in enumerate((-1.0, 1.0)):
        parts_t.append(blob(f'{gid_t}_scale_pan_{idx_sc}',
                            p_ass + t_ass * (sgn_sc * 0.038) - np.array([0.0, 0.0, 0.028]),
                            (0.030, 0.026, 0.014), brass_p, n=10, rows=4, out=d_ass, rigid_joint='Hips'))

    sl_p = P('mongolblue', 0.03, [
        B('bottom', 0.0, 0.028, 'solid', 'gold'),
        B('bottom', 0.028, 0.095, 'tocharian_wheel', 'gold', 'omaroon', 0.05),
    ], fabric='cloth.silk')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.027, rows=10))
    entries.append(assemble_garment(gid_t, 'Mint Assessor Silk Robe, Scorch-Apron & 9 Qud Dies', 'torso', 'xanadu', parts_t))
    return entries


# ===============================================================================================================
# 6. HIRED NORTHERN MUSKETEER & CANNONEER (`hired_musketeer`)
# ===============================================================================================================
def _build_hired_musketeer(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Northern Combed Morion Helm & Xanadui Silk Pay-Scarf (`xan_{sex}_musketeer_morion`) ---
    gid_h = f'xan_{sex}_musketeer_morion'
    parts_h = []
    bowl_p = P('iron', 0.03, [
        B('bottom', 0.0, 0.018, 'beads', 'brass', 'iron', 0.026),
        B('top', 0.0, 0.028, 'solid', 'steel'),
    ], [
        PN(0.0, 1.0, 'fluted', 'steel', 'iron', 0.05),
    ], fabric='metal.iron')
    bowl = head_rings(gid_h + '_bowl', 0.54, 1.04, 0.016, bowl_p, n=36, rows=8, apex=True)
    bowl.rigid_joint = 'Head'
    parts_h.append(bowl)

    mbrim = brim(gid_h + '_brim', 0.55, 0.068,
                 P('steel', 0.03, [B('bottom', 0.0, 0.012, 'solid', 'brass')], fabric='metal.iron'),
                 ease=0.017, rows=5, n=40, lift=0.024)
    # Boat-peaked front/back upturn characteristic of northern combed morions
    angs_m = np.linspace(0, 2 * math.pi, 40, endpoint=False)
    for rk in range(mbrim.P.shape[0]):
        sk = rk / float(mbrim.P.shape[0] - 1)
        for jk, an_m in enumerate(angs_m):
            mbrim.P[rk, jk] += up * (0.022 * (sk ** 1.2) * math.cos(2.0 * an_m))
    mbrim.rigid_joint = 'Head'
    parts_h.append(mbrim)

    # Longitudinal raised steel comb horn from front brow over apex to nape
    c_mid = a + (b - a) * 0.58
    comb_pts = []
    for phi in np.linspace(-0.92, 0.96, 9):
        d_c = up * math.cos(phi) + bk * math.sin(phi)
        d_c /= np.linalg.norm(d_c)
        h_c = first_hit(c_mid, d_c) or 0.102
        arch_h = 0.022 + 0.032 * math.cos(phi * 1.15)
        comb_pts.append(c_mid + d_c * (h_c + arch_h))
    parts_h.append(horn(gid_h + '_comb', comb_pts, 0.016, 0.014,
                        P('steel', 0.03, [B('top', 0.0, 0.008, 'solid', 'brass')], fabric='metal.iron'),
                        n=10, rows=9, rigid_joint='Head'))

    scarf_p = P('holyred', 0.03, [
        B('top', 0.0, 0.008, 'solid', 'gold'),
        B('bottom', 0.0, 0.008, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'stripes', 'gold', 'holyred', 0.024),
    ], fabric='cloth.silk')
    parts_h.append(crown_band(gid_h + '_pay_scarf', scarf_p, f0=0.52, f1=0.67, ease=0.020, flare=0.006, rows=5, n=36))

    p_pl0 = a + (b - a) * 0.62 + left * 0.088 + bk * 0.015
    parts_h.append(horn(gid_h + '_plume',
                        [p_pl0, p_pl0 + up * 0.075 + bk * 0.045 + left * 0.018, p_pl0 + up * 0.135 + bk * 0.095 + left * 0.010],
                        0.022, 0.005,
                        P('holyred', 0.03, [B('bottom', 0.0, 0.028, 'solid', 'gold'),
                                            B('top', 0.0, 0.030, 'solid', 'saffron')], fabric='cloth.silk'),
                        n=10, rows=7, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Hired Musketeer Combed Morion & Pay-Scarf', 'head', 'xanadu', parts_h,
                                    covers_hair=False, covers_face=False))

    # --- 2. TORSO: Buff-Leather Coat, Half-Cuirass & Twelve-Apostle Bandolier (`xan_{sex}_musketeer_coat`) ---
    gid_t = f'xan_{sex}_musketeer_coat'
    parts_t = []
    buff_p = P('buck', 0.05, [
        B('top', 0.0, 0.022, 'solid', 'saddle'),
        B('bottom', 0.0, 0.028, 'solid', 'saddle'),
        B('bottom', 0.028, 0.068, 'stripes', 'gold', 'holyred', 0.030),
    ], [
        PN(0.45, 0.48, 'solid', 'saddle', 'buck', 1.0),
        PN(0.52, 0.55, 'solid', 'saddle', 'buck', 1.0),
        PN(0.48, 0.52, 'solid', 'holyred', 'buck', 1.0),
    ], fabric='leather.buckskin')
    parts_t.append(torso_tube(gid_t + '_buff_coat', TOP, KNEE + 0.05, 0.016, buff_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('saddle', 0.05, [B('top', 0.0, 0.010, 'solid', 'gold')], fabric='leather.polished'),
                                high=0.034))

    # Blackened iron half-cuirass strictly below armpits (z_top = CHEST + 0.012 <= CHEST + 0.015)
    cuirass_p = P('iron', 0.03, [
        B('top', 0.0, 0.014, 'beads', 'brass', 'iron', 0.026),
        B('bottom', 0.0, 0.014, 'beads', 'brass', 'iron', 0.026),
    ], [
        PN(0.35, 0.65, 'chahar_aina', 'gold', 'iron', 0.16),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_cuirass', CHEST + 0.012, WAIST + 0.035, 0.019, cuirass_p,
                              rows=6, n=44, hull_from=CHEST + 0.015, role='band'))

    # Diagonal Twelve-Apostle wooden powder-charge bandolier (6 visible hanging wooden/brass charge tubes at 0.024 ease)
    parts_t.append(band(gid_t + '_bandolier', WAIST - 0.01, SHOULDER + 0.01, 0.044, 0.022,
                        P('saddle', 0.05, [B('top', 0.0, 0.007, 'solid', 'brass'),
                                            B('bottom', 0.0, 0.007, 'solid', 'brass')], fabric='leather.polished'),
                        high=math.pi * 0.45, rows=5))
    charge_p = P('yakbrown', 0.05, [
        B('top', 0.0, 0.016, 'solid', 'brass'),
        B('bottom', 0.0, 0.010, 'solid', 'brass'),
    ], fabric='metal.bronze')
    for idx_ap in range(6):
        u_ap = idx_ap / 5.0
        z_ap = (CHEST + 0.035) * (1.0 - u_ap) + (WAIST + 0.055) * u_ap
        x_ap = 0.082 * (1.0 - u_ap) - 0.082 * u_ap
        p_ap = chest_front(z_ap, 0.024, x=x_ap)
        parts_t.append(tube(f'{gid_t}_apostle_{idx_ap}',
                            [p_ap + np.array([0.0, 0.0, 0.012]), p_ap - np.array([0.0, 0.0, 0.044])],
                            0.012, charge_p, n=10, rigid_joint='Spine2'))

    pay_sash_p = P('holyred', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'gold'),
        B('bottom', 0.0, 0.012, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'stripes', 'gold', 'holyred', 0.035),
    ], fabric='cloth.silk')
    parts_t.extend(sash_with_tail(gid_t, pay_sash_p, pay_sash_p, ease=0.021, tail=0.32))

    sl_p = P('buck', 0.05, [
        B('bottom', 0.0, 0.030, 'solid', 'saddle'),
        B('bottom', 0.030, 0.095, 'vstripes', 'holyred', 'gold', 0.028),
    ], fabric='leather.buckskin')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Hired Musketeer Buff-Coat, Cuirass & Twelve-Apostles', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Brass-Bound Matchlock Arquebus & Forked Shooting-Rest (`xan_{sex}_musketeer_arquebus`) ---
    gid_b = f'xan_{sex}_musketeer_arquebus'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)

    stock_p = P('yakbrown', 0.05, [B('top', 0.0, 0.022, 'solid', 'brass'),
                                   B('bottom', 0.0, 0.024, 'solid', 'brass')], fabric='leather.polished')
    p_butt = p_bk + np.array([-0.115, 0.024, -0.21])
    p_breech = p_bk + np.array([-0.015, 0.028, -0.02])
    p_muz = p_bk + np.array([0.135, 0.032, 0.29])
    parts_b.append(blob(gid_b + '_buttstock', (p_butt + p_breech) * 0.5, (0.055, 0.038, 0.22),
                        stock_p, n=12, rows=6, out=d_bk, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_forestock', [p_breech, (p_breech + p_muz) * 0.55], 0.017,
                        stock_p, n=10, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_barrel', [p_breech, p_muz], 0.014,
                        P('iron', 0.03, [B('top', 0.0, 0.022, 'solid', 'brass'),
                                         B('bottom', 0.0, 0.022, 'solid', 'brass')], fabric='metal.iron'),
                        n=12, rigid_joint='Spine2'))
    parts_b.append(rosette(gid_b + '_lockplate', p_breech + d_bk * 0.018, d_bk, np.array([1.0, 0.0, 0.0]), 0.028,
                           P('brass', 0.02, fabric='metal.bronze'), n=10, thick=0.008, rigid_joint='Spine2'))
    parts_b.append(horn(gid_b + '_serpentine',
                        [p_breech + np.array([-0.015, 0.026, -0.01]),
                         p_breech + np.array([0.018, 0.030, 0.020]),
                         p_breech + np.array([0.004, 0.030, 0.048])],
                        0.006, 0.004, P('brass', 0.02, fabric='metal.bronze'), n=8, rows=6, rigid_joint='Spine2'))

    # Crossed forked iron-tipped shooting-rest staff
    r_bot = p_bk + np.array([0.115, 0.052, -0.24])
    r_top = p_bk + np.array([-0.115, 0.052, 0.24])
    parts_b.append(tube(gid_b + '_rest_staff', [r_bot, r_top], 0.012,
                        P('saddle', 0.05, [B('bottom', 0.0, 0.035, 'solid', 'iron'),
                                           B('top', 0.0, 0.025, 'solid', 'brass')]),
                        n=10, rigid_joint='Spine2'))
    iron_p = P('steel', 0.03, fabric='metal.iron')
    for s_fk, sx_fk in (('L', 1.0), ('R', -1.0)):
        parts_b.append(horn(f'{gid_b}_fork_{s_fk}',
                            [r_top,
                             r_top + np.array([sx_fk * 0.034 - 0.012, 0.0, 0.028]),
                             r_top + np.array([sx_fk * 0.042 - 0.024, 0.0, 0.068])],
                            0.008, 0.004, iron_p, n=8, rows=6, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('saddle', 0.05, [B('top', 0.0, 0.007, 'solid', 'brass')], fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Hired Musketeer Matchlock Arquebus & Shooting-Rest', 'back', 'xanadu', parts_b))

    # --- 4. LEGS: Slashed Northern Mercenary Breeches (`xan_{sex}_musketeer_breeches`) ---
    gid_l = f'xan_{sex}_musketeer_breeches'
    breech_p = P('slate', 0.05, [
        B('bottom', 0.0, 0.032, 'solid', 'gold'),
        B('top', 0.0, 0.030, 'solid', 'holyred'),
    ], [
        PN(0.0, 1.0, 'vstripes', 'holyred', 'slate', 0.045),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'Hired Musketeer Slashed Mercenary Breeches', 'legs', 'xanadu',
                                    trousers(gid_l, breech_p, ease=0.016, bag=0.028, ease_end=0.014), legged=True))

    # --- 5. FEET: Folded-Cuff Riding-and-March Boots (`xan_{sex}_musketeer_boots`) ---
    gid_f = f'xan_{sex}_musketeer_boots'
    sole_p = P('soot', 0.08, [B('bottom', 0.0, 0.015, 'solid', 'brass')])
    upper_p = P('leather', 0.04, [B('bottom', 0.0, 0.022, 'solid', 'brass')], fabric='leather.polished')
    cuff_p = P('buck', 0.05, [B('top', 0.0, 0.014, 'solid', 'holyred')], fabric='leather.buckskin')
    entries.append(assemble_garment(gid_f, 'Hired Musketeer Folded-Cuff Riding Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, upper_p, top=0.58, cuff_paint=cuff_p, ease_top=0.036)))
    return entries


# ===============================================================================================================
# 7. LAITWAL GLAZIER & OPAL-CUTTER (`glazier_mara` — Half-Tungang / Half-Xanadui)
# ===============================================================================================================
def _build_glazier_mara(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Hybrid Silk Turban, Tungang Gold Cloud-Hairpin & Lapidary Loupe (`xan_{sex}_glazier_turban`) ---
    gid_h = f'xan_{sex}_glazier_turban'
    parts_h = []
    dome_p = P('peacock', 0.03, [
        B('top', 0.0, 0.025, 'solid', 'kesar'),
        B('bottom', 0.0, 0.018, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'xanadu_mosaic', 'turq', 'peacock', 0.09),
    ], fabric='cloth.silk')
    dome = head_rings(gid_h + '_dome', 0.52, 1.04, 0.018, dome_p, n=36, rows=8, apex=True)
    dome.rigid_joint = 'Head'
    parts_h.append(dome)

    wrap_p = P('kesar', 0.03, [
        B('top', 0.0, 0.008, 'solid', 'gold'),
        B('bottom', 0.0, 0.008, 'solid', 'peacock'),
    ], [
        PN(0.0, 1.0, 'stripes', 'peacock', 'kesar', 0.030),
    ], fabric='cloth.silk')
    parts_h.append(crown_band(gid_h + '_wrap', wrap_p, f0=0.48, f1=0.78, ease=0.022, flare=0.009, rows=6, n=36))

    # Diagonal Tungang gold cloud-hairpin piercing through the upper turban
    c_pin = a + (b - a) * 0.78
    pin_a = c_pin - left * 0.115 + bk * 0.012 - up * 0.020
    pin_b = c_pin + left * 0.125 - bk * 0.012 + up * 0.032
    gold_p = P('gold', 0.02, fabric='metal.gold')
    parts_h.append(tube(gid_h + '_hairpin_shaft', [pin_a, pin_b], 0.006, gold_p, n=8, rigid_joint='Head'))
    parts_h.append(rosette(gid_h + '_cloud_finial', pin_b + left * 0.008, left, -bk, 0.024,
                           P('gold', 0.02, [B('bottom', 0.0, 0.007, 'solid', 'jade')], fabric='metal.gold'),
                           n=12, thick=0.008, rigid_joint='Head'))

    # Flip-down brass & moonglass_opal lapidary loupe over the right eye
    eye_f = 0.38
    c_eye = a + (b - a) * eye_f
    h_eye = first_hit(c_eye, -bk) or 0.108
    p_loupe0 = c_eye - left * 0.034 - bk * (h_eye + 0.012)
    p_loupe1 = c_eye - left * 0.034 - bk * (h_eye + 0.036)
    p_hinge = a + (b - a) * 0.52 - left * 0.044 - bk * (h_eye + 0.018)
    brass_p = P('brass', 0.02, fabric='metal.bronze')
    parts_h.append(horn(gid_h + '_loupe_arm', [p_hinge, p_loupe0 + up * 0.014], 0.006, 0.005,
                        brass_p, n=8, rows=5, rigid_joint='Head'))
    parts_h.append(tube(gid_h + '_loupe_barrel', [p_loupe0, p_loupe1], 0.020, brass_p, n=14, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_loupe_lens', p_loupe1 - bk * 0.004, (0.034, 0.012, 0.034),
                        P('cybercyan', 0.01, [B('bottom', 0.0, 0.005, 'solid', 'brass')],
                          [PN(0.0, 1.0, 'moonglass_opal', 'cybercyan', 'kesar', 0.03)],
                          fabric='glass.moonglass.leaded'),
                        n=12, rows=5, out=-bk, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Glazier Mara Silk Turban, Cloud-Pin & Opal Loupe', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Hybrid Indigo Shan Jacket, Kesar Chuba Skirt & Grinding Apron (`xan_{sex}_glazier_jacket`) ---
    gid_t = f'xan_{sex}_glazier_jacket'
    parts_t = []
    bodice_h = TOP - WAIST + 0.04
    jacket_p = P('kesar', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'peacock'),
        B('bottom', 0.0, 0.028, 'solid', 'indigo'),
        B('bottom', 0.028, 0.095, 'cholet_pangden', 'peacock', 'kesar', 0.055),
    ], [
        # Upper indigo Tungang crossover shan jacket over the lower kesar & cholet_pangden chuba skirt
        PN(0.0, 1.0, 'solid', 'indigo', 'indigo', 1.0, down=bodice_h),
        PN(0.42, 0.46, 'solid', 'peacock', 'indigo', 1.0, down=bodice_h),
        PN(0.46, 0.56, 'xanadu_mosaic', 'turq', 'indigo', 0.10, down=bodice_h * 0.78),
        PN(0.56, 0.59, 'solid', 'gold', 'indigo', 1.0, down=bodice_h),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_shan_chuba', TOP, KNEE + 0.02, 0.015, jacket_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('indigo', 0.03, [B('top', 0.0, 0.010, 'solid', 'gold'),
                                                          B('bottom', 0.0, 0.010, 'solid', 'peacock')], fabric='cloth.silk'),
                                high=0.035))
    parts_t.extend(button_row(gid_t, TOP - 0.03, WAIST + 0.05, n_buttons=4, paint=gold_p, ease=0.019))

    # Waterproof leather wet-grinding apron
    apron_p = P('leather', 0.04, [
        B('top', 0.0, 0.020, 'solid', 'copper'),
        B('bottom', 0.0, 0.024, 'solid', 'indigo'),
    ], [
        PN(0.15, 0.85, 'moonglass_opal', 'peacock', 'leather', 0.22),
    ], fabric='leather.polished')
    parts_t.extend(tabard(gid_t + '_apron', KNEE - 0.01, CHEST + 0.01, apron_p,
                          width=0.23, ease=0.021, front=True, back=False))

    parts_t.append(torso_tube(gid_t + '_belt', WAIST + 0.035, WAIST - 0.035, 0.021,
                              P('saddle', 0.05, [B('top', 0.0, 0.008, 'solid', 'copper'),
                                                 B('bottom', 0.0, 0.008, 'solid', 'copper')], fabric='leather.polished'),
                              rows=4, n=42, hull_from=WAIST + 0.08, role='belt'))

    # Dop-wax sticks on left hip & copper scoring-wheel on right hip (0.022 ease)
    copper_p = P('copper', 0.02, fabric='metal.bronze')
    d_dop = np.array([0.76, -0.65, 0.0])
    d_dop /= np.linalg.norm(d_dop)
    t_dop = np.array([-d_dop[1], d_dop[0], 0.0])
    p_d_in = surface_out(spine_at(WAIST - 0.01), d_dop, 0.019, bvh=core.BVH_T)
    p_dop = surface_out(spine_at(WAIST - 0.01), d_dop, 0.022, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_dop_holder', [p_d_in, p_dop], 0.010, copper_p, n=8, rigid_joint='Hips'))
    for k_d, (off_d, col_d) in enumerate(((-0.015, 'lacrose'), (0.0, 'kesar'), (0.015, 'cybercyan'))):
        pd = p_dop + t_dop * off_d
        parts_t.append(tube(f'{gid_t}_dop_stick_{k_d}',
                            [pd + np.array([0.0, 0.0, 0.018]), pd - np.array([0.0, 0.0, 0.068])],
                            0.007, P('yakbrown', 0.05, [B('top', 0.0, 0.016, 'solid', col_d)]),
                            n=8, rigid_joint='Hips'))

    d_scr = np.array([-0.76, -0.65, 0.0])
    d_scr /= np.linalg.norm(d_scr)
    p_s_in = surface_out(spine_at(WAIST - 0.01), d_scr, 0.019, bvh=core.BVH_T)
    p_scr = surface_out(spine_at(WAIST - 0.01), d_scr, 0.022, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_score_loop', [p_s_in, p_scr], 0.009, copper_p, n=8, rigid_joint='Hips'))
    parts_t.append(tube(gid_t + '_score_handle', [p_scr + np.array([0.0, 0.0, 0.022]), p_scr - np.array([0.0, 0.0, 0.052])],
                        0.009, P('indigo', 0.04, [B('bottom', 0.0, 0.018, 'solid', 'copper')]), n=8, rigid_joint='Hips'))
    parts_t.append(rosette(gid_t + '_score_wheel', p_scr - np.array([0.0, 0.0, 0.062]), d_scr, np.array([0.0, 0.0, 1.0]),
                           0.020, copper_p, n=12, thick=0.006, rigid_joint='Hips'))

    sl_p = P('indigo', 0.04, [
        B('bottom', 0.0, 0.032, 'solid', 'peacock'),
        B('bottom', 0.032, 0.068, 'cholet_pangden', 'kesar', 'gold', 0.035),
    ], fabric='cloth.silk')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_p, ease_end=0.025, rows=10))
    entries.append(assemble_garment(gid_t, 'Glazier Mara Hybrid Shan-Chuba & Wet-Grinding Apron', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Wooden A-Frame Rack & Layered Leaded Moonglass Panes (`xan_{sex}_glazier_frame`) ---
    gid_b = f'xan_{sex}_glazier_frame'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)
    rack_p = P('yakbrown', 0.06, [B('top', 0.0, 0.018, 'solid', 'copper'),
                                  B('bottom', 0.0, 0.018, 'solid', 'copper')], fabric='leather.polished')
    for s_tag, sx in (('L', 1.0), ('R', -1.0)):
        parts_b.append(tube(f'{gid_b}_a_strut_{s_tag}',
                            [p_bk + np.array([sx * 0.115, 0.018, -0.17]), p_bk + np.array([sx * 0.035, 0.018, 0.19])],
                            0.013, rack_p, n=10, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_shelf_bot',
                        [p_bk + np.array([-0.125, 0.032, -0.15]), p_bk + np.array([0.125, 0.032, -0.15])],
                        0.014, rack_p, n=10, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_shelf_mid',
                        [p_bk + np.array([-0.090, 0.020, 0.02]), p_bk + np.array([0.090, 0.020, 0.02])],
                        0.011, rack_p, n=10, rigid_joint='Spine2'))

    # Copper-framed layered diamond-leaded moonglass panes
    for s_tag, sx in (('L', 1.0), ('R', -1.0)):
        parts_b.append(tube(f'{gid_b}_cu_frame_{s_tag}',
                            [p_bk + np.array([sx * 0.105, 0.044, -0.14]), p_bk + np.array([sx * 0.105, 0.044, 0.14])],
                            0.008, copper_p, n=8, rigid_joint='Spine2'))
    for tag_tb, z_tb in (('top', 0.14), ('bot', -0.14)):
        parts_b.append(tube(f'{gid_b}_cu_{tag_tb}',
                            [p_bk + np.array([-0.105, 0.044, z_tb]), p_bk + np.array([0.105, 0.044, z_tb])],
                            0.008, copper_p, n=8, rigid_joint='Spine2'))

    pane1_p = P('turq', 0.01, [
        B('top', 0.0, 0.018, 'solid', 'copper'),
        B('bottom', 0.0, 0.018, 'solid', 'copper'),
    ], [
        PN(0.0, 1.0, 'moonglass_opal', 'cybercyan', 'peacock', 0.10),
    ], fabric='glass.moonglass.leaded')
    pane2_p = P('cybercyan', 0.01, [
        B('top', 0.0, 0.016, 'solid', 'copper'),
        B('bottom', 0.0, 0.016, 'solid', 'copper'),
    ], [
        PN(0.0, 1.0, 'moonglass_opal', 'lacrose', 'cybercyan', 0.08),
    ], fabric='glass.moonglass.leaded')
    parts_b.append(blob(gid_b + '_pane_main', p_bk + np.array([0.0, 0.042, 0.0]), (0.21, 0.026, 0.28),
                        pane1_p, n=16, rows=7, out=d_bk, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_pane_front', p_bk + np.array([0.0, 0.060, -0.015]), (0.17, 0.022, 0.22),
                        pane2_p, n=16, rows=7, out=d_bk, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'copper')], fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Glazier Mara A-Frame & Leaded Moonglass Panes', 'back', 'xanadu', parts_b))

    # --- 4. FEET: Waxed Indigo & Leather Glazier Work Boots (`xan_{sex}_glazier_boots`) ---
    gid_f = f'xan_{sex}_glazier_boots'
    sole_p = P('leather', 0.07, [B('bottom', 0.0, 0.015, 'solid', 'copper')])
    upper_p = P('indigo', 0.04, [
        B('top', 0.0, 0.032, 'cholet_pangden', 'kesar', 'peacock', 0.025),
        B('bottom', 0.0, 0.028, 'solid', 'leather'),
    ], fabric='leather.polished')
    entries.append(assemble_garment(gid_f, 'Glazier Mara Waxed Indigo & Leather Boots', 'feet', 'xanadu',
                                    boots(gid_f, sole_p, upper_p, top=0.46, ease_top=0.032)))
    return entries


# ===============================================================================================================
# 8. LAKE ATITLAN CAYUCO BOATMAN & NET-FISHER (`lake_boatman` — 20 Lake Towns)
# ===============================================================================================================
def _build_lake_boatman(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    entries = []

    # --- 1. HEAD: Wide Tule-Reed Lake Hat & Xocomil Wind-Band (`xan_{sex}_boatman_hat`) ---
    gid_h = f'xan_{sex}_boatman_hat'
    parts_h = []
    reed_p = P('bamboo', 0.07, [
        B('top', 0.0, 0.022, 'stripes', 'ochre', 'cream', 0.020),
        B('bottom', 0.0, 0.014, 'solid', 'ochre'),
    ], fabric='straw.reed.plaited')
    crown = head_rings(gid_h + '_crown', 0.58, 1.02, 0.015, reed_p, n=36, rows=7, apex=True)
    crown.rigid_joint = 'Head'
    parts_h.append(crown)

    reed_brim = brim(gid_h + '_brim', 0.58, 0.132,
                     P('bamboo', 0.07, [B('bottom', 0.0, 0.018, 'stripes', 'peacock', 'kesar', 0.025)],
                       fabric='straw.reed.plaited'),
                     ease=0.016, rows=6, n=42, droop=0.018)
    reed_brim.rigid_joint = 'Head'
    parts_h.append(reed_brim)

    wind_p = P('peacock', 0.04, [
        B('top', 0.0, 0.007, 'solid', 'kesar'),
        B('bottom', 0.0, 0.007, 'solid', 'kesar'),
    ], [
        PN(0.0, 1.0, 'cholet_pangden', 'lacrose', 'peacock', 0.06),
    ], fabric=COTTON)
    parts_h.append(crown_band(gid_h + '_windband', wind_p, f0=0.56, f1=0.72, ease=0.019, flare=0.005, rows=5, n=36))
    entries.append(assemble_garment(gid_h, 'Lake Atitlan Tule-Reed Hat & Xocomil Wind-Band', 'head', 'xanadu', parts_h,
                                    covers_hair=False, covers_face=False))

    # --- 2. TORSO: Elbow-Sleeved Oiled-Cotton Lake Kurta & Bone Float Belt (`xan_{sex}_boatman_vest`) ---
    gid_t = f'xan_{sex}_boatman_vest'
    parts_t = []
    kurta_p = P('peacock', 0.04, [
        B('top', 0.0, 0.020, 'solid', 'kesar'),
        B('bottom', 0.0, 0.024, 'solid', 'lacrose'),
        B('bottom', 0.024, 0.095, 'cholet_pangden', 'kesar', 'lacrose', 0.065),
        B('bottom', 0.095, 0.145, 'wave', 'cream', 'peacock', 0.08),
    ], [
        PN(0.42, 0.58, 'cholet_pangden', 'lacrose', 'kesar', 0.09, down=0.36),
        PN(0.39, 0.42, 'solid', 'cream', 'peacock', 1.0, down=0.36),
        PN(0.58, 0.61, 'solid', 'cream', 'peacock', 1.0, down=0.36),
    ], fabric='cloth.canvas.oiled')
    parts_t.append(torso_tube(gid_t + '_kurta', TOP, CROTCH - 0.09, 0.015, kurta_p,
                              n=46, rows=18, hang_from=WAIST - 0.02, flare=0.09,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(collar(gid_t + '_collar',
                          P('lacrose', 0.04, [B('top', 0.0, 0.008, 'solid', 'kesar')], fabric='cloth.canvas.oiled'),
                          height=0.028, flare=0.014, ease=0.020, open_front=True))

    net_sash_p = P('cream', 0.05, [
        B('top', 0.0, 0.009, 'solid', 'peacock'),
        B('bottom', 0.0, 0.009, 'solid', 'kesar'),
    ], [
        PN(0.0, 1.0, 'diamonds', 'peacock', 'cream', 0.035),
    ], fabric=COTTON)
    parts_t.extend(sash_with_tail(gid_t, net_sash_p, net_sash_p, ease=0.019, tail=0.26))

    float_angs = np.linspace(0.18 * math.pi, 1.82 * math.pi, 10)
    parts_t.extend(pendants(gid_t + '_floats_', WAIST - 0.032, float_angs, (0.022, 0.014, 0.034),
                            P('bone', 0.04, [B('top', 0.0, 0.010, 'solid', 'peacock'),
                                             B('bottom', 0.0, 0.008, 'solid', 'kesar')], fabric='leather.buckskin'),
                            ease=0.020))

    sl_p = P('peacock', 0.04, [
        B('bottom', 0.0, 0.020, 'solid', 'kesar'),
        B('bottom', 0.020, 0.065, 'cholet_pangden', 'lacrose', 'cream', 0.045),
    ], fabric='cloth.canvas.oiled')
    parts_t.extend(sleeves(gid_t, 'elbow', 0.016, sl_p, ease_end=0.022, rows=7))
    entries.append(assemble_garment(gid_t, 'Lake Atitlan Oiled-Cotton Kurta & Bone Float Sash', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Carved Cedar Cayuco Paddle & Woven Reed Fish-Trap Creel (`xan_{sex}_boatman_paddle`) ---
    gid_b = f'xan_{sex}_boatman_paddle'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)

    creel_p = P('bamboo', 0.07, [
        B('top', 0.0, 0.022, 'solid', 'peacock'),
        B('bottom', 0.0, 0.022, 'solid', 'lacrose'),
    ], [
        PN(0.0, 1.0, 'diamonds', 'cream', 'bamboo', 0.05),
    ], fabric='straw.reed.plaited')
    parts_b.append(tube(gid_b + '_creel',
                        [p_bk + np.array([-0.115, 0.046, -0.06]), p_bk + np.array([0.095, 0.046, 0.05])],
                        0.058, creel_p, n=16, rigid_joint='Spine2'))

    cedar_p = P('saddle', 0.05, [B('top', 0.0, 0.020, 'solid', 'peacock')], fabric='leather.polished')
    pad_top = p_bk + np.array([-0.095, 0.098, 0.25])
    pad_neck = p_bk + np.array([0.055, 0.098, -0.07])
    parts_b.append(tube(gid_b + '_paddle_shaft', [pad_top, pad_neck], 0.013, cedar_p, n=10, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_paddle_tgrip',
                        [pad_top + np.array([-0.032, 0.0, 0.015]), pad_top + np.array([0.032, 0.0, -0.015])],
                        0.012, cedar_p, n=10, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_paddle_blade', p_bk + np.array([0.105, 0.098, -0.18]), (0.112, 0.022, 0.24),
                        P('saddle', 0.05, [
                            B('bottom', 0.0, 0.065, 'cholet_pangden', 'peacock', 'kesar', 0.04),
                            B('top', 0.0, 0.025, 'wave', 'lacrose', 'saddle', 0.04),
                        ], fabric='leather.polished'),
                        n=16, rows=7, out=d_bk, rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('bamboo', 0.06, [B('top', 0.0, 0.008, 'solid', 'peacock')], fabric='straw.reed.plaited')))
    entries.append(assemble_garment(gid_b, 'Lake Atitlan Cedar Cayuco Paddle & Reed Creel', 'back', 'xanadu', parts_b))

    # --- 4. LEGS: Rolled-Calf Lake-Wading Breeches (`xan_{sex}_boatman_breeches`) ---
    gid_l = f'xan_{sex}_boatman_breeches'
    breech_p = P('cream', 0.05, [
        B('bottom', 0.0, 0.032, 'solid', 'peacock'),
        B('bottom', 0.032, 0.075, 'cholet_pangden', 'lacrose', 'kesar', 0.04),
    ], [
        PN(0.0, 1.0, 'vstripes', 'peacock', 'cream', 0.04),
    ], fabric=COTTON)
    entries.append(assemble_garment(gid_l, 'Lake Atitlan Rolled-Calf Wading Breeches', 'legs', 'xanadu',
                                    trousers(gid_l, breech_p, ease=0.015, ease_end=0.018, cuff=KNEE - 0.12), legged=True))

    # --- 5. FEET: Cord-Laced Leather & Reed Lake Sandals (`xan_{sex}_boatman_sandals`) ---
    gid_f = f'xan_{sex}_boatman_sandals'
    sole_p = P('bamboo', 0.07, [B('bottom', 0.0, 0.012, 'solid', 'leather')], fabric='straw.reed.plaited')
    strap_p = P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'peacock')], fabric='leather.polished')
    cord_p = P('cream', 0.05, [B('top', 0.0, 0.006, 'solid', 'lacrose')])
    entries.append(assemble_garment(gid_f, 'Lake Atitlan Cord-Laced Reed Sandals', 'feet', 'xanadu',
                                    sandal(gid_f, sole_p, strap_p, guard=True, laces=2, strap_paint2=cord_p)))
    return entries


# ===============================================================================================================
# 9. KOLD-LOD HIGH-TUNDRA GOLD & OPAL MINER (`koldlod_miner` — 4,812 m, -6 C)
# ===============================================================================================================
def _build_koldlod_miner(sex, body_id):
    set_body(body_id)
    TOP = core.TOP
    CHEST = core.CHEST
    WAIST = core.WAIST
    CROTCH = core.CROTCH
    KNEE = core.KNEE
    a, b, up, bk, left = head_frame()
    entries = []

    # --- 1. HEAD: Frost-Rimmed Yak-Fleece Hood & Brass Butter-Lamp (`xan_{sex}_miner_hood`) ---
    gid_h = f'xan_{sex}_miner_hood'
    parts_h = []
    hood_p = P('yakbrown', 0.09, [
        B('top', 0.0, 0.036, 'solid', 'cream'),
        B('bottom', 0.0, 0.032, 'cholet_pangden', 'saffron', 'yakbrown', 0.04),
    ], [
        PN(0.0, 0.14, 'solid', 'cream', 'yakbrown', 1.0),
        PN(0.86, 1.0, 'solid', 'cream', 'yakbrown', 1.0),
    ], fabric='fur.yak')
    parts_h.append(hood(gid_h + '_hood', hood_p, ease=0.032, ease_low=0.048, open_front=0.92,
                        low=-0.52, rows=14, n=34, peak=0.04, high=1.02))

    c_brow = a + (b - a) * 0.68
    h_brow = first_hit(c_brow, -bk) or 0.102
    p_br = c_brow - bk * (h_brow + 0.032)
    brass_p = P('brass', 0.02, fabric='metal.bronze')
    parts_h.append(rosette(gid_h + '_lamp_plate', p_br, -bk, up, 0.026, brass_p, n=12, thick=0.008, rigid_joint='Head'))
    p_cup_bot = p_br - bk * 0.016 - up * 0.006
    p_cup_top = p_cup_bot + up * 0.024
    parts_h.append(tube(gid_h + '_butter_cup', [p_cup_bot, p_cup_top], 0.021, brass_p, n=12, rigid_joint='Head'))
    parts_h.append(blob(gid_h + '_flame_housing', p_cup_top + up * 0.018, (0.038, 0.034, 0.046),
                        P('amber', 0.02, [B('top', 0.0, 0.012, 'solid', 'brass'),
                                          B('bottom', 0.0, 0.008, 'solid', 'saffron')], fabric='glass.moonglass.leaded'),
                        n=12, rows=6, out=up, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Kold-Lod Frost-Rimmed Yak Hood & Butter-Lamp', 'head', 'xanadu', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- 2. TORSO: Double-Thick Quilted Wool & Rawhide Mining Chuba (`xan_{sex}_miner_chuba`) ---
    gid_t = f'xan_{sex}_miner_chuba'
    parts_t = []
    chuba_p = P('yakbrown', 0.06, [
        B('top', 0.0, 0.028, 'solid', 'cream'),
        B('bottom', 0.0, 0.035, 'solid', 'cream'),
        B('bottom', 0.035, 0.095, 'cholet_pangden', 'saffron', 'yakbrown', 0.055),
    ], [
        PN(0.0, 0.36, 'diamond_quilt', 'yakbrown', 'hide', 0.16),
        PN(0.64, 1.0, 'diamond_quilt', 'yakbrown', 'hide', 0.16),
        PN(0.36, 0.40, 'solid', 'saffron', 'yakbrown', 1.0),
        PN(0.60, 0.64, 'solid', 'saffron', 'yakbrown', 1.0),
        PN(0.40, 0.60, 'diamond_quilt', 'hide', 'yakbrown', 0.14),
    ], fabric='cloth.quilted.diamond')
    parts_t.append(torso_tube(gid_t + '_chuba', TOP, KNEE - 0.02, 0.018, chuba_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))

    fleece_p = P('cream', 0.10, [B('bottom', 0.0, 0.022, 'solid', 'yakbrown')], fabric='fur.yak')
    parts_t.append(collar_disc(gid_t + '_fleece_collar', 0.080, fleece_p, drop=0.064, rows=6, scallop=0.04, ease=0.020))

    raw_p = P('hide', 0.06, [
        B('bottom', 0.0, 0.020, 'beads', 'iron', 'leather', 0.03),
        B('top', 0.0, 0.015, 'solid', 'saffron'),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'hide', 'yakbrown', 0.08),
    ], fabric='leather.buckskin')
    parts_t.append(pauldron(gid_t + '_pauld_L', L, raw_p, reach=0.36, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_pauld_R', R, raw_p, reach=0.36, ease=0.024, flare_end=0.98))

    belt_p = P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'iron'),
                                 B('bottom', 0.0, 0.008, 'solid', 'saffron')], fabric='leather.polished')
    poke_p = P('hide', 0.06, [B('top', 0.0, 0.020, 'solid', 'saffron'),
                              B('bottom', 0.0, 0.016, 'solid', 'turq')], fabric='leather.buckskin')
    parts_t.extend(pouch_belt(gid_t + '_belt', belt_p, poke_p, ease=0.022))

    # Iron rock-chisels connected to belt at left-front hip (0.022 ease)
    d_ch = np.array([0.72, -0.69, 0.0])
    d_ch /= np.linalg.norm(d_ch)
    t_ch = np.array([-d_ch[1], d_ch[0], 0.0])
    p_c_in = surface_out(spine_at(WAIST - 0.01), d_ch, 0.019, bvh=core.BVH_T)
    p_ch = surface_out(spine_at(WAIST - 0.01), d_ch, 0.022, bvh=core.BVH_T)
    iron_p = P('iron', 0.03, [B('top', 0.0, 0.014, 'solid', 'steel')], fabric='metal.iron')
    parts_t.append(tube(gid_t + '_chisel_loop', [p_c_in, p_ch], 0.010,
                        P('leather', 0.05, fabric='leather.polished'), n=8, rigid_joint='Hips'))
    for k_c, off_c in enumerate((-0.014, 0.014)):
        pc = p_ch + t_ch * off_c
        parts_t.append(tube(f'{gid_t}_chisel_{k_c}',
                            [pc + np.array([0.0, 0.0, 0.022]), pc - np.array([0.0, 0.0, 0.088])],
                            0.009, iron_p, n=8, rigid_joint='Hips'))

    sl_p = P('yakbrown', 0.06, [
        B('bottom', 0.0, 0.034, 'solid', 'cream'),
        B('bottom', 0.034, 0.075, 'cholet_pangden', 'saffron', 'hide', 0.04),
    ], fabric='cloth.quilted.diamond')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.027, rows=10))
    entries.append(assemble_garment(gid_t, 'Kold-Lod Quilted Rawhide Chuba & Rock-Chisels', 'torso', 'xanadu', parts_t))

    # --- 3. BACK: Tapered Rawhide Ore Hod, Gold-Veined Quartz & Sledgehammer (`xan_{sex}_miner_orebasket`) ---
    gid_b = f'xan_{sex}_miner_orebasket'
    parts_b = []
    d_bk = np.array([0.0, 1.0, 0.0])
    p_bk = surface_out(spine_at(CHEST - 0.02), d_bk, 0.020, bvh=core.BVH_T)

    # Twin timber back-skids anchored flush against the upper back
    timber_p = P('yakbrown', 0.06, [B('top', 0.0, 0.018, 'solid', 'saffron')], fabric='leather.polished')
    for s_tag, sx in (('L', 1.0), ('R', -1.0)):
        parts_b.append(tube(f'{gid_b}_skid_{s_tag}',
                            [p_bk + np.array([sx * 0.075, 0.014, -0.16]), p_bk + np.array([sx * 0.085, 0.014, 0.15])],
                            0.013, timber_p, n=10, rigid_joint='Spine2'))

    hod_p = P('hide', 0.06, [
        B('top', 0.0, 0.024, 'solid', 'yakbrown'),
        B('bottom', 0.0, 0.024, 'solid', 'yakbrown'),
    ], [
        PN(0.0, 1.0, 'fluted', 'yakbrown', 'hide', 0.065),
    ], fabric='leather.buckskin')
    h_bot = p_bk + np.array([0.0, 0.072, -0.15])
    h_mid = p_bk + np.array([0.0, 0.088, 0.0])
    h_top = p_bk + np.array([0.0, 0.104, 0.15])
    parts_b.append(horn(gid_b + '_ore_hod', [h_bot, h_mid, h_top], 0.066, 0.116,
                        hod_p, n=18, rows=9, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_hod_base', h_bot, (0.132, 0.128, 0.042),
                        timber_p, n=14, rows=5, out=-np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))

    # Heaped gold-veined white quartz & opal-matrix chunks crowning the top of the hod
    quartz_p = P('white', 0.04, [
        B('top', 0.0, 0.016, 'stripes', 'gold', 'white', 0.018),
        B('bottom', 0.0, 0.014, 'solid', 'gold'),
    ], [
        PN(0.20, 0.80, 'moonglass_opal', 'gold', 'white', 0.05),
    ], fabric='metal.gold')
    for idx_q, (ox, oy, oz, sz_q) in enumerate((
        (0.0, 0.0, 0.018, (0.145, 0.135, 0.085)),
        (-0.048, 0.012, 0.032, (0.082, 0.078, 0.068)),
        (0.046, -0.010, 0.030, (0.084, 0.076, 0.066)),
        (0.008, 0.022, 0.048, (0.070, 0.068, 0.058)),
    )):
        parts_b.append(blob(f'{gid_b}_quartz_{idx_q}', h_top + np.array([ox, oy, oz]), sz_q,
                            quartz_p, n=12, rows=5, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))

    # Strapped iron sledgehammer on the right side of the hod
    sl_bot = p_bk + np.array([-0.125, 0.065, -0.20])
    sl_top = p_bk + np.array([-0.135, 0.085, 0.16])
    parts_b.append(tube(gid_b + '_sledge_shaft', [sl_bot, sl_top], 0.013, timber_p, n=10, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_sledge_head', sl_top, (0.052, 0.105, 0.054),
                        P('iron', 0.03, [B('top', 0.0, 0.012, 'solid', 'steel')], fabric='metal.iron'),
                        n=12, rows=5, out=np.array([-1.0, 0.0, 0.0]), rigid_joint='Spine2'))
    parts_b.extend(_dorsal_pad(gid_b, P('hide', 0.06, [B('top', 0.0, 0.008, 'solid', 'saffron')], fabric='leather.buckskin')))
    entries.append(assemble_garment(gid_b, 'Kold-Lod Tapered Ore Hod, Gold-Quartz & Sledgehammer', 'back', 'xanadu', parts_b))
    return entries


# ===============================================================================================================
# PUBLIC ENTRY POINT
# ===============================================================================================================
def build_xanadu_society_kit():
    """Compile all 78 Xanadu Society, Court, Chartered House & Regional Artisan pieces (39 per sex x 2 sexes)."""
    entries = []
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        entries.extend(_build_pc_floral_envoy_completion(sex, body_id))
        entries.extend(_build_house_golden_tears(sex, body_id))
        entries.extend(_build_house_rare_devisers(sex, body_id))
        entries.extend(_build_house_two_horns(sex, body_id))
        entries.extend(_build_sultan_court(sex, body_id))
        entries.extend(_build_mint_assessor(sex, body_id))
        entries.extend(_build_hired_musketeer(sex, body_id))
        entries.extend(_build_glazier_mara(sex, body_id))
        entries.extend(_build_lake_boatman(sex, body_id))
        entries.extend(_build_koldlod_miner(sex, body_id))
    return entries
