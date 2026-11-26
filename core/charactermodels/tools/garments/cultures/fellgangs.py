"""The Fellgangs Wardrobe Kit (`fellgangs` — Blakhed, West Rift Rim, Wildcat, Travellers & Kradz).

Builds all 8 canon Fellgangs tiers across both `mpfb_male` (`fg_m_*`) and `mpfb_female` (`fg_f_*`)
bodies (plus reusing the existing Meshy hero boast-mask `fell_m_wildcat_mask` / `fell_f_wildcat_mask`
on the `wildcat_boast_hero` tier):

1. `blakhed_stairman`  — Chimes Gorge Porter & Townsfolk (flatcap, padded jerkin, A-frame gorge kreel, clogs)
2. `fowler_icecutter`  — Cliff Fowler & Glacier Ice-Sawyer (tarred sou'wester, oiled smock, ice-hook coil, crampon boots)
3. `drover_slate`      — Drovers' Rest & Slatebank Quarrier (drover brim, slate-rust maud plaid, salt pannier, hobnails)
4. `coppersmith`       — West-Rift Malachite Smelter (perforated copper-mesh furnace hood, riveted copper apron, tinker frame)
5. `traveller`         — Winterings Vardo Wagon Trader (vardo hat, painted harlequin oilcloth longcoat, pedlar box)
6. `barricade_picket`  — Highway-Choke Toll Raider (cut gas-cylinder rebar helm, roadsign/tyre brigandine, STOP buckler)
7. `wildcat_boast_hero`— Wildcat Fellgang-Kimr Boss (existing Meshy boast-mask, sloth/roadsign cuirass, trophy rack)
8. `kradz_caver`       — Feral Deep-Karst Blind-Caver (jawbone coif, cave-chitin harness, glow-fungus rib cage, karst sandals)

Run standalone to compile all `.glb` + `.morph.bin` pieces and emit `fellgangs_manifest.json`:
    python tools/garments/cultures/fellgangs.py
"""
import json
import math
import sys
import time
from pathlib import Path
import numpy as np

CULTURES_DIR = Path(__file__).resolve().parent
ROOT = CULTURES_DIR.parents[2]  # core/charactermodels
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment,
)
from ..paint import P, B, PN, COTTON, WOOL, leathery
from ..types.torso import (
    torso_tube, collar, stand_collar, collar_disc, crossed_sash, pauldron,
)
from ..types.limbs import limb_tube, sleeves, trousers, full_gloves
from ..types.footwear import boots, sandal
from ..types.headgear import (
    head_landmarks_exact, head_rings, hood, brim, horn, sculpted_faceplate,
)
from ..types.accoutrements import (
    flap, blob, belt_sash, pack_straps, button_row, tube, strap, rosette,
)


FELLGANGS_TIER_SHARES = [
    ['blakhed_stairman', 0.18],
    ['fowler_icecutter', 0.14],
    ['drover_slate', 0.14],
    ['coppersmith', 0.12],
    ['traveller', 0.12],
    ['barricade_picket', 0.14],
    ['wildcat_boast_hero', 0.08],
    ['kradz_caver', 0.08],
]

FELLGANGS_TIER_LABELS = {
    'blakhed_stairman': 'Blakhed Chimes-Gorge Stairman & Porter',
    'fowler_icecutter': 'Cliff Fowler & Glacier Ice-Sawyer',
    'drover_slate': "Drovers' Rest & Slatebank Quarrier",
    'coppersmith': 'West-Rift Malachite Smelter & Tinker',
    'traveller': 'Winterings Vardo Wagon Trader',
    'barricade_picket': 'Highway-Choke Barricade Toll Raider',
    'wildcat_boast_hero': 'Wildcat Fellgang-Kimr Boast Boss',
    'kradz_caver': 'Kradz Deep-Karst Blind-Caver',
}


# ===========================================================================================================
# SHARED FELLGANGS PAINTS
# ===========================================================================================================
def _p_roadsign(base='repochre', trim='soot'):
    return P(base, 0.05, [
        B('top', 0.0, 0.018, 'solid', trim),
        B('bottom', 0.0, 0.022, 'solid', trim),
    ], [
        PN(0.0, 1.0, 'fellgang_roadsign_plaid', 'soot', base, 0.18),
    ], fabric='metal.iron')


def _p_maud_plaid():
    return P('slate', 0.06, [
        B('bottom', 0.0, 0.036, 'fellgang_roadsign_plaid', 'rust', 'slate'),
        B('top', 0.0, 0.016, 'solid', 'peatumber'),
    ], [
        PN(0.0, 1.0, 'fellgang_roadsign_plaid', 'rust', 'slate', 0.22),
    ], fabric=WOOL)


def _p_peat_wool(base='peatumber', trim='slate'):
    return P(base, 0.06, [
        B('bottom', 0.0, 0.022, 'solid', trim),
        B('top', 0.0, 0.014, 'solid', trim),
    ], fabric=WOOL)


def _p_oiled(base='slate', trim='charcoal'):
    return P(base, 0.04, [
        B('bottom', 0.0, 0.020, 'solid', trim),
    ], fabric='cloth.oiled')


def _p_tyre():
    return leathery(P('charcoal', 0.05, [
        B('top', 0.0, 0.012, 'solid', 'soot'),
        B('bottom', 0.0, 0.012, 'solid', 'soot'),
    ], fabric='leather.cuir_bouilli'))


def _p_copper():
    return P('copper', 0.03, [
        B('bottom', 0.0, 0.018, 'solid', 'verdigris'),
        B('top', 0.0, 0.012, 'solid', 'soot'),
    ], fabric='metal.brass')


def _p_sloth_fur():
    return P('yakbrown', 0.07, [
        B('bottom', 0.0, 0.024, 'solid', 'umber'),
    ], fabric='fur.yak')


def _p_chitin():
    return P('bone', 0.05, [
        B('bottom', 0.0, 0.016, 'solid', 'taupe'),
    ], fabric='armor.lamellar.chitin')


# ===========================================================================================================
# SHARED FELLGANGS PROCEDURAL PRIMITIVES
# ===========================================================================================================
def _dorsal_anchor(z_off=-0.02):
    """Return `(back_surface_pt, back_normal)` at mid-scapula height for flush Spine2-rigged dorsal packs."""
    sp = spine_at(core.CHEST + z_off)
    b_dir = np.array([0.0, 1.0, 0.0])
    d = first_hit(sp, b_dir, 0.35)
    return sp + b_dir * (float(d) if d is not None else 0.13), b_dir


def _head_box():
    """Return `(hc, fwd, rgt, up, z_bot, z_top, rx, ry)` from `head_landmarks_exact()`."""
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    fwd = -bk
    rgt = -left
    z_bot, z_top = float(a[2]), float(b[2])
    hv = core.CO[core.CO[:, 2] >= z_bot]
    xc = 0.5 * (float(hv[:, 0].min()) + float(hv[:, 0].max()))
    yc = 0.5 * (float(hv[:, 1].min()) + float(hv[:, 1].max()))
    rx = 0.5 * (float(hv[:, 0].max()) - float(hv[:, 0].min()))
    ry = 0.5 * (float(hv[:, 1].max()) - float(hv[:, 1].min()))
    return np.array([xc, yc, 0.5 * (z_bot + z_top)]), fwd, rgt, up, z_bot, z_top, rx, ry


def _fg_sleeves(gid, end, ease, paint, ease_end=0.017, rows=12, n=22, rmax=0.135):
    """Fellgangs sleeves with deep shoulder-root overlap (`start_back=0.058`) and full wrist overlap (`0.98`)."""
    out = []
    for s in (L, R):
        a, e, h = J(s + 'Arm'), J(s + 'ForeArm'), J(s + 'Hand')
        if end == 'elbow':
            path = [a, e]
        elif end == 'wrist':
            path = [a, e, h - (h - e) * 0.02]
        else:
            path = [a, a + (e - a) * float(end)]
        out.append(limb_tube(f'{gid}_sleeve_{s[0]}', None, None, ease, paint, n=n, rows=rows,
                             ease_end=ease_end, start_back=0.058, path=path, bvh=core.BVH_A,
                             rmax=rmax, role='sleeve', side=s[0]))
    return out


def _bracers(gid, paint, f0=0.52, f1=0.97, ease=0.019, trim_paint=None):
    parts = []
    for s in (L, R):
        e, w = J(s + 'ForeArm'), J(s + 'Hand')
        parts.append(limb_tube(f'{gid}_bracer_{s[0]}', e + (w - e) * f0, e + (w - e) * f1,
                               ease, paint, n=18, rows=8, side=s[0]))
        if trim_paint is not None:
            parts.append(limb_tube(f'{gid}_trim_{s[0]}', e + (w - e) * (f0 + 0.08), e + (w - e) * (f1 - 0.08),
                                   ease + 0.004, trim_paint, n=18, rows=4, side=s[0]))
    return parts


def _back_gorge_kreel(gid, wood_p, sack_p, strap_p):
    """Ash-wood A-frame Chimes Gorge *kreel* + lashed salt/grain sacks on flush Spine2 dorsal pad."""
    hit, b_dir = _dorsal_anchor(-0.02)
    parts = [blob(f'{gid}_dpad', hit + b_dir * 0.014, (0.118, 0.026, 0.150), strap_p,
                  n=10, rows=5, out=b_dir, rigid_joint='Spine2')]
    c_k = hit + b_dir * 0.022
    # A-frame vertical ash-wood rails + crossbars
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        p0 = c_k + np.array([sgn * 0.11, 0.004, -0.22])
        p1 = c_k + np.array([sgn * 0.075, 0.012, 0.24])
        parts.append(tube(f'{gid}_rail_{tag}', [p0, p1], 0.014, wood_p, n=8, rigid_joint='Spine2'))
    for ci, dz in enumerate((-0.14, 0.02, 0.16)):
        hw = 0.105 - 0.012 * ci
        parts.append(tube(f'{gid}_rung_{ci}',
                          [c_k + np.array([-hw, 0.010, dz]), c_k + np.array([hw, 0.010, dz])],
                          0.011, wood_p, n=8, rigid_joint='Spine2'))
    # Twin lashed salt/grain sacks seated inside A-frame
    parts.append(blob(f'{gid}_sack_lo', c_k + np.array([0.0, 0.048, -0.07]), (0.135, 0.068, 0.105),
                      sack_p, rigid_joint='Spine2'))
    parts.append(blob(f'{gid}_sack_hi', c_k + np.array([0.0, 0.046, 0.085]), (0.115, 0.062, 0.090),
                      sack_p, rigid_joint='Spine2'))
    return parts


def _back_ice_hook_coil(gid, rope_p, iron_p, strap_p):
    """Coiled tarred abseil rope & forged glacier ice-hook on flush Spine2 dorsal pad."""
    hit, b_dir = _dorsal_anchor(-0.02)
    parts = [blob(f'{gid}_dpad', hit + b_dir * 0.014, (0.118, 0.026, 0.150), strap_p,
                  n=10, rows=5, out=b_dir, rigid_joint='Spine2')]
    c_r = hit + b_dir * 0.026
    # Coiled rope torus ring seated against back
    n_c = 18
    pts = [c_r + np.array([math.cos(a) * 0.115, 0.010, math.sin(a) * 0.125])
           for a in np.linspace(0.0, 2.0 * math.pi, n_c + 1)]
    parts.append(tube(f'{gid}_coil', pts, 0.024, rope_p, n=10, rigid_joint='Spine2'))
    # Diagonal forged glacier ice-hook & ash haft
    h0 = c_r + np.array([-0.10, 0.028, -0.18])
    h1 = c_r + np.array([0.10, 0.032, 0.22])
    parts.append(tube(f'{gid}_haft', [h0, h1], 0.013, P('umber', 0.05, fabric='wood.painted'), n=8, rigid_joint='Spine2'))
    hook_pts = [h1 - np.array([0.02, 0.0, 0.02]), h1 + np.array([0.06, 0.01, 0.02]), h1 + np.array([0.10, 0.01, -0.04])]
    parts.append(horn(f'{gid}_hook', hook_pts, 0.014, 0.004, iron_p, n=8, rows=6, rigid_joint='Spine2'))
    return parts


def _back_box_or_pannier(gid, body_p, trim_p, strap_p, dims=(0.145, 0.078, 0.165), lid=True):
    """Dorsal salt pannier or painted vardo pedlar's box on snug `pack_straps`."""
    parts = list(pack_straps(gid, strap_p, ease=0.015, width=0.025))
    hit, b_dir = _dorsal_anchor(-0.03)
    c_b = hit + b_dir * (dims[1] * 0.55)
    parts.append(blob(f'{gid}_box', c_b, dims, body_p, n=16, rows=7, rigid_joint='Spine2'))
    if lid:
        parts.append(blob(f'{gid}_lid', c_b + np.array([0.0, 0.006, dims[2] * 0.78]),
                          (dims[0] * 1.04, dims[1] * 1.04, 0.032), trim_p, n=16, rows=4, rigid_joint='Spine2'))
    return parts


def _back_tinker_frame(gid, copper_p, wood_p, strap_p):
    """West-Rift smelter's copper-pipe & ingot tinker frame on snug `pack_straps`."""
    parts = list(pack_straps(gid, strap_p, ease=0.015, width=0.026))
    hit, b_dir = _dorsal_anchor(-0.02)
    c_f = hit + b_dir * 0.028
    # Twin copper condenser/ingot cylinders
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        p0 = c_f + np.array([sgn * 0.072, 0.022, -0.15])
        p1 = c_f + np.array([sgn * 0.072, 0.022, 0.18])
        parts.append(tube(f'{gid}_cyl_{tag}', [p0, p1], 0.044, copper_p, n=12, rigid_joint='Spine2'))
    parts.append(tube(f'{gid}_pipe', [c_f + np.array([-0.072, 0.022, 0.17]),
                                      c_f + np.array([0.0, 0.026, 0.24]),
                                      c_f + np.array([0.072, 0.022, 0.17])],
                      0.014, wood_p, n=8, rigid_joint='Spine2'))
    return parts


def _back_barricade_buckler(gid, sign_p, rim_p, strap_p):
    """Octagonal sheared-highway STOP/YIELD sign buckler slung on snug `pack_straps`."""
    parts = list(pack_straps(gid, strap_p, ease=0.015, width=0.026))
    hit, b_dir = _dorsal_anchor(-0.02)
    c_s = hit + b_dir * 0.024
    parts.append(rosette(f'{gid}_oct_sign', c_s, b_dir, np.array([1.0, 0.0, 0.0]),
                         0.20, sign_p, n=8, thick=0.016, rigid_joint='Spine2'))
    parts.append(rosette(f'{gid}_boss', c_s + b_dir * 0.012, b_dir, np.array([1.0, 0.0, 0.0]),
                         0.055, rim_p, n=8, thick=0.014, rigid_joint='Spine2'))
    return parts


def _back_wildcat_trophy_rack(gid, iron_p, bone_p, sign_p, strap_p):
    """Spiked rebar & megafauna-horn boast-trophy rack on snug `pack_straps`."""
    parts = list(pack_straps(gid, strap_p, ease=0.015, width=0.028))
    hit, b_dir = _dorsal_anchor(-0.02)
    c_r = hit + b_dir * 0.024
    parts.append(rosette(f'{gid}_plate', c_r, b_dir, np.array([1.0, 0.0, 0.0]),
                         0.125, sign_p, n=8, thick=0.016, rigid_joint='Spine2'))
    # Crossed rebar spikes + twin sweeping megafauna trophy horns
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        r0 = c_r + np.array([sgn * 0.04, 0.008, -0.10])
        r1 = c_r + np.array([sgn * 0.16, 0.022, 0.30])
        parts.append(tube(f'{gid}_rebar_{tag}', [r0, r1], 0.011, iron_p, n=8, rigid_joint='Spine2'))
        h0 = c_r + np.array([sgn * 0.07, 0.014, 0.08])
        h1 = h0 + np.array([sgn * 0.12, 0.032, 0.09])
        h2 = h1 + np.array([sgn * 0.04, 0.016, 0.11])
        parts.append(horn(f'{gid}_horn_{tag}', [h0, h1, h2], 0.024, 0.005, bone_p, n=10, rows=7, rigid_joint='Spine2'))
    return parts


def _back_kradz_bone_cage(gid, bone_p, glow_p, strap_p):
    """Curved cave-predator ribcage basket holding luminous pale-cyan glow-fungus on snug `pack_straps`."""
    parts = list(pack_straps(gid, strap_p, ease=0.015, width=0.022))
    hit, b_dir = _dorsal_anchor(-0.02)
    c_g = hit + b_dir * 0.032
    # Luminous glow-fungus cluster inside rib cage
    parts.append(blob(f'{gid}_fungus', c_g, (0.072, 0.052, 0.092), glow_p, n=12, rows=6, rigid_joint='Spine2'))
    # 4 curved bone ribs framing the fungus cluster (flush against back & fungus)
    for ri, dz in enumerate((-0.065, -0.020, 0.025, 0.070)):
        rib_pts = [
            c_g + np.array([-0.070, -0.026, dz]),
            c_g + np.array([-0.055, 0.044, dz + 0.008]),
            c_g + np.array([0.0, 0.060, dz + 0.012]),
            c_g + np.array([0.055, 0.044, dz + 0.008]),
            c_g + np.array([0.070, -0.026, dz]),
        ]
        parts.append(tube(f'{gid}_rib_{ri}', rib_pts, 0.010, bone_p, n=6, rigid_joint='Spine2'))
    return parts


# ===========================================================================================================
# TIER BUILDERS (1..8)
# ===========================================================================================================
def _build_blakhed_stairman(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH = core.TOP, core.CHEST, core.WAIST, core.CROTCH
    entries = []
    peat_p = _p_peat_wool('peatumber', 'slate')
    slate_p = _p_peat_wool('slate', 'peatumber')

    # HEAD: Greased slate-wool pit flatcap (`covers_hair=True, covers_face=False`, clear eyeline)
    gid_h = f'fg_{sex}_flatcap'
    parts_h = [
        head_rings(f'{gid_h}_crown', 0.60, 1.02, 0.016, slate_p, n=36, rows=9, apex=True, scale=(1.04, 1.08)),
        brim(f'{gid_h}_peak', 0.60, 0.048, P('charcoal', 0.05, fabric=WOOL), ease=0.014, droop=0.010),
    ]
    entries.append(assemble_garment(gid_h, 'Blakhed Slate-Wool Pit Flatcap', 'head', 'fellgangs', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Padded shoulder-bolster porter jerkin over peat wool vest (cleanly separated shoulder layers: sleeve 0.016 < jerkin 0.022 < bolster 0.030)
    gid_t = f'fg_{sex}_porter_jerkin'
    bolster_p = leathery(P('saddle', 0.06, [B('bottom', 0.0, 0.016, 'solid', 'soot')], fabric='leather.polished'))
    parts_t = [
        torso_tube(f'{gid_t}_jerkin', TOP, WAIST - 0.06, ease=0.022, ease_bottom=0.044, paint=peat_p,
                   hang_from=WAIST + 0.02, flare=0.12, rows=18, n=40),
        pauldron(f'{gid_t}_bolster_L', L, bolster_p, reach=0.28, ease=0.030),
        pauldron(f'{gid_t}_bolster_R', R, bolster_p, reach=0.28, ease=0.030),
        belt_sash(f'{gid_t}_belt', WAIST - 0.024, WAIST + 0.028, bolster_p, ease=0.032),
    ]
    parts_t.extend(_fg_sleeves(gid_t, 'wrist', 0.016, slate_p, ease_end=0.015))
    entries.append(assemble_garment(gid_t, 'Blakhed Padded Porter Jerkin', 'torso', 'fellgangs', parts_t))

    # BACK: Ash-wood A-frame Chimes Gorge kreel
    gid_b = f'fg_{sex}_gorge_kreel'
    entries.append(assemble_garment(gid_b, 'Chimes Gorge Ash-Wood A-Frame Kreel', 'back', 'fellgangs',
                                    _back_gorge_kreel(gid_b, P('umber', 0.05, fabric='wood.painted'),
                                                      P('oat', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'peatumber')],
                                                        fabric='cloth.cotton.coarse'),
                                                      bolster_p)))

    # GLOVES: Tarred hemp rope-hauling wraps
    gid_g = f'fg_{sex}_hemp_grips'
    entries.append(assemble_garment(gid_g, 'Blakhed Tarred Hemp Rope-Grips', 'gloves', 'fellgangs',
                                    _bracers(gid_g, P('oat', 0.06, fabric='straw.reed.plaited'), f0=0.58, f1=0.97)))

    # LEGS: Heavy peat-brown corduroy pit breeches (tight seat clears jerkin hem; cuff overlaps clog-boots)
    gid_l = f'fg_{sex}_cord_breeches'
    entries.append(assemble_garment(gid_l, 'Blakhed Peat-Wool Pit Breeches', 'legs', 'fellgangs',
                                    list(trousers(gid_l, peat_p, ease=0.011, ease_end=0.012,
                                                  cuff=core.ANKLE + 0.015, bag=0.004)), legged=True))

    # FEET: Iron-shod wooden-soled clog-boots
    gid_f = f'fg_{sex}_clog_boots'
    entries.append(assemble_garment(gid_f, 'Blakhed Iron-Shod Clog-Boots', 'feet', 'fellgangs',
                                    boots(gid_f, P('umber', 0.05, fabric='wood.painted'),
                                          leathery(P('charcoal', 0.05, fabric='leather.polished')),
                                          top=0.42, wraps=1, wrap_paint=P('iron', 0.03, fabric='metal.iron'))))
    return entries


def _build_fowler_icecutter(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH = core.TOP, core.CHEST, core.WAIST, core.CROTCH
    entries = []
    oil_p = _p_oiled('slate', 'charcoal')
    oil_dk = _p_oiled('charcoal', 'soot')

    # HEAD: Broad-brimmed tarred oilcloth sou'wester
    gid_h = f'fg_{sex}_tarred_souwester'
    parts_h = [
        head_rings(f'{gid_h}_dome', 0.58, 1.03, 0.016, oil_dk, n=36, rows=10, apex=True),
        brim(f'{gid_h}_brim', 0.59, 0.095, oil_dk, ease=0.016, droop=0.035),
    ]
    entries.append(assemble_garment(gid_h, 'Fellgang Tarred Oilcloth Souwester', 'head', 'fellgangs', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Oiled waterfowl/wool smock + hemp abseil harness (sealed neckline, armhole gussets, deep-rooted wrist sleeves)
    gid_t = f'fg_{sex}_fowler_smock'
    hemp_p = P('oat', 0.06, fabric='straw.reed.plaited')
    parts_t = [
        torso_tube(f'{gid_t}_smock', TOP + 0.016, WAIST - 0.06, ease=0.022, ease_bottom=0.044, paint=oil_p,
                   hang_from=WAIST + 0.02, flare=0.12, rows=18, n=40),
        collar(f'{gid_t}_incol', oil_dk, height=0.050, flare=0.020, ease=0.011),
        collar_disc(f'{gid_t}_capelet', 0.16, oil_dk, drop=0.075, ease=0.026),
        crossed_sash(f'{gid_t}_abseil', hemp_p, width=0.048, ease=0.032),
        belt_sash(f'{gid_t}_belt', WAIST - 0.024, WAIST + 0.028, hemp_p, ease=0.035),
    ]
    for side in (L, R):
        parts_t.append(blob(f'{gid_t}_gusset_{side[0]}', J(side + 'Arm'), (0.062, 0.062, 0.066), oil_p,
                            n=12, rows=6, rigid_joint=side + 'Arm'))
    parts_t.extend(_fg_sleeves(gid_t, 'wrist', 0.018, oil_p, ease_end=0.017))
    entries.append(assemble_garment(gid_t, 'Fowler Oiled Smock & Abseil Harness', 'torso', 'fellgangs', parts_t))

    # BACK: Coiled tarred abseil rope & glacier ice-hook
    gid_b = f'fg_{sex}_ice_hook_coil'
    entries.append(assemble_garment(gid_b, 'Glacier Ice-Hook & Abseil Rope Coil', 'back', 'fellgangs',
                                    _back_ice_hook_coil(gid_b, hemp_p, P('iron', 0.03, fabric='metal.iron'), oil_dk)))

    # GLOVES: Tallow-greased climbing mitts (overlap sleeve cuffs cleanly)
    gid_g = f'fg_{sex}_tallow_mitts'
    entries.append(assemble_garment(gid_g, 'Fowler Tallow-Greased Climbing Mitts', 'gloves', 'fellgangs',
                                    list(full_gloves(gid_g, oil_dk, leathery(P('umber', 0.05, fabric='leather.buckskin')),
                                                     f0=0.54, ease=0.018))))

    # LEGS: Tarred oilcloth overtrousers (tight seat clears smock hem; cuff overlaps crampon boots)
    gid_l = f'fg_{sex}_oiled_overtrousers'
    entries.append(assemble_garment(gid_l, 'Fowler Tarred Oilcloth Overtrousers', 'legs', 'fellgangs',
                                    list(trousers(gid_l, oil_dk, ease=0.011, ease_end=0.012,
                                                  cuff=core.ANKLE + 0.015, bag=0.004)), legged=True))

    # FEET: Iron-strapped glacier crampon boots
    gid_f = f'fg_{sex}_crampon_boots'
    entries.append(assemble_garment(gid_f, 'Ice-Sawyer Iron-Strapped Crampon Boots', 'feet', 'fellgangs',
                                    boots(gid_f, P('iron', 0.03, fabric='metal.iron'), oil_dk,
                                          top=0.52, wraps=3, wrap_paint=P('steel', 0.03, fabric='metal.iron'))))
    return entries


def _build_drover_slate(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH = core.TOP, core.CHEST, core.WAIST, core.CROTCH
    entries = []
    plaid_p = _p_maud_plaid()
    slate_p = _p_peat_wool('slate', 'rust')

    # HEAD: Wide-brimmed felted slate-wool drover hat
    gid_h = f'fg_{sex}_drover_brim'
    parts_h = [
        head_rings(f'{gid_h}_crown', 0.59, 1.06, 0.016, slate_p, n=36, rows=10, apex=True),
        brim(f'{gid_h}_brim', 0.60, 0.088, slate_p, ease=0.016, droop=0.016),
        head_rings(f'{gid_h}_cord', 0.60, 0.68, 0.018, P('rust', 0.05, fabric=WOOL), n=36, rows=3),
    ]
    entries.append(assemble_garment(gid_h, 'Drovers Rest Felted Slate Brim-Hat', 'head', 'fellgangs', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Slate-and-rust maud plaid tunic & shawl pinned with copper ring-brooch
    gid_t = f'fg_{sex}_drover_plaid'
    parts_t = [
        torso_tube(f'{gid_t}_tunic', TOP, WAIST - 0.06, ease=0.025, ease_bottom=0.044, paint=slate_p,
                   hang_from=WAIST + 0.02, flare=0.11, rows=18, n=40),
        collar_disc(f'{gid_t}_maud', 0.22, plaid_p, drop=0.13, ease=0.024, scallop=0.10),
        belt_sash(f'{gid_t}_belt', WAIST - 0.024, WAIST + 0.028,
                  leathery(P('saddle', 0.05, fabric='leather.polished')), ease=0.032),
    ]
    parts_t.extend(_fg_sleeves(gid_t, 'wrist', 0.024, slate_p))
    cf = chest_front(CHEST + 0.06, 0.028) + np.array([0.045, 0.0, 0.0])
    parts_t.append(rosette(f'{gid_t}_brooch', cf, np.array([0.0, -1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                           0.028, _p_copper(), n=14, thick=0.010, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_t, 'Slatebank Maud-Plaid & Copper Brooch', 'torso', 'fellgangs', parts_t))

    # BACK: Woven willow salt pannier basket
    gid_b = f'fg_{sex}_salt_pannier'
    entries.append(assemble_garment(gid_b, 'Drovers Rest Salt-Block Pannier', 'back', 'fellgangs',
                                    _back_box_or_pannier(gid_b, P('oat', 0.06, [B('top', 0.0, 0.02, 'solid', 'rust')],
                                                                  fabric='straw.reed.plaited'),
                                                         plaid_p, leathery(P('saddle', 0.05, fabric='leather.polished')))))

    # GLOVES: Quarryman's cuffed leather gloves
    gid_g = f'fg_{sex}_cuff_gloves'
    entries.append(assemble_garment(gid_g, 'Slatebank Cuffed Quarry Gloves', 'gloves', 'fellgangs',
                                    list(full_gloves(gid_g, leathery(P('saddle', 0.05, fabric='leather.polished')),
                                                     leathery(P('umber', 0.05, fabric='leather.buckskin')),
                                                     f0=0.54, ease=0.018))))

    # LEGS: Slate-wool trousers with buckled gaiters
    gid_l = f'fg_{sex}_gaiter_trousers'
    entries.append(assemble_garment(gid_l, 'Drovers Slate-Wool Gaiter Trousers', 'legs', 'fellgangs',
                                    list(trousers(gid_l, slate_p, ease=0.011, ease_end=0.012,
                                                  cuff=core.ANKLE + 0.015, bag=0.004)), legged=True))

    # FEET: Stout hobnailed quarry boots
    gid_f = f'fg_{sex}_hobnail_boots'
    entries.append(assemble_garment(gid_f, 'Slatebank Hobnailed Quarry Boots', 'feet', 'fellgangs',
                                    boots(gid_f, P('soot', 0.04, fabric='metal.iron'),
                                          leathery(P('saddle', 0.05, fabric='leather.polished')),
                                          top=0.48, wraps=2, wrap_paint=P('umber', 0.05, fabric='leather.polished'))))
    return entries


def _build_coppersmith(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []
    cop_p = _p_copper()
    hide_p = leathery(P('umber', 0.06, [B('bottom', 0.0, 0.028, 'solid', 'copper')], fabric='leather.cuir_bouilli'))

    # HEAD: Perforated copper-mesh furnace visor hood (`covers_hair=True, covers_face=True`)
    gid_h = f'fg_{sex}_smelter_hood'
    parts_h = [
        head_rings(f'{gid_h}_hood', -0.04, 1.04, 0.020, hide_p, n=36, rows=12, apex=True),
        sculpted_faceplate(f'{gid_h}_visor', cop_p, f_top=0.74, f_bot=0.04, ease=0.018, span=0.48),
    ]
    entries.append(assemble_garment(gid_h, 'West-Rift Copper-Mesh Smelter Hood', 'head', 'fellgangs', parts_h,
                                    covers_hair=True, covers_face=True))

    # TORSO: Riveted scrap-copper & scorched hide apron (cloth-sim below waist!) over wool tunic
    gid_t = f'fg_{sex}_smith_apron'
    parts_t = [
        torso_tube(f'{gid_t}_apron', KNEE + 0.06, TOP, ease=0.022, ease_bottom=0.040, paint=hide_p,
                   hang_from=WAIST, flare=0.11, rows=20, n=40),
        torso_tube(f'{gid_t}_chest_copper', WAIST + 0.02, CHEST + 0.08, ease=0.028, paint=cop_p, rows=10, n=36),
        belt_sash(f'{gid_t}_belt', WAIST - 0.030, WAIST + 0.030, cop_p, ease=0.034),
    ]
    parts_t.extend(_fg_sleeves(gid_t, 'wrist', 0.022, _p_peat_wool('charcoal', 'copper')))
    entries.append(assemble_garment(gid_t, 'West-Rift Riveted Copper Smelter Apron', 'torso', 'fellgangs', parts_t))

    # BACK: Copper-pipe & ingot tinker frame
    gid_b = f'fg_{sex}_tinker_frame'
    entries.append(assemble_garment(gid_b, 'Malachite Smelter Copper Tinker Frame', 'back', 'fellgangs',
                                    _back_tinker_frame(gid_b, cop_p, P('umber', 0.05, fabric='wood.painted'), hide_p)))

    # GLOVES: Elbow-length copper-cuffed furnace gauntlets
    gid_g = f'fg_{sex}_furnace_gauntlets'
    entries.append(assemble_garment(gid_g, 'Smelter Copper-Cuffed Furnace Gauntlets', 'gloves', 'fellgangs',
                                    list(full_gloves(gid_g, cop_p, hide_p, f0=0.45, ease=0.018))))

    # LEGS: Charred-leather & soot-wool smelter trousers
    gid_l = f'fg_{sex}_smith_trousers'
    entries.append(assemble_garment(gid_l, 'West-Rift Soot-Wool Smelter Trousers', 'legs', 'fellgangs',
                                    list(trousers(gid_l, _p_peat_wool('charcoal', 'umber'), ease=0.012,
                                                  ease_end=0.012, cuff=core.ANKLE + 0.015, bag=0.004)),
                                    legged=True))
    return entries


def _build_traveller(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    entries = []
    vardo_p = P('crimson', 0.04, [
        B('bottom', 0.0, 0.065, 'fellgang_roadsign_plaid', 'repochre', 'teal'),
        B('top', 0.0, 0.022, 'solid', 'repochre'),
    ], [PN(0.0, 1.0, 'diamonds', 'repochre', 'crimson', 0.14)], fabric='cloth.oiled')
    teal_p = P('teal', 0.04, [B('bottom', 0.0, 0.018, 'solid', 'repochre')], fabric='cloth.oiled')

    # HEAD: Tall-crowned painted vardo trader's brimmed hat
    gid_h = f'fg_{sex}_vardo_hat'
    parts_h = [
        head_rings(f'{gid_h}_crown', 0.59, 1.16, 0.016, teal_p, n=36, rows=11, apex=True),
        brim(f'{gid_h}_brim', 0.60, 0.092, teal_p, ease=0.016, droop=0.012),
        head_rings(f'{gid_h}_ribbon', 0.60, 0.72, 0.018, P('crimson', 0.04, fabric='cloth.silk'), n=36, rows=4),
    ]
    entries.append(assemble_garment(gid_h, 'Winterings Vardo Painted Oilcloth Hat', 'head', 'fellgangs', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Painted harlequin/scroll oilcloth longcoat (cloth-sim below waist!)
    gid_t = f'fg_{sex}_vardo_coat'
    parts_t = [
        torso_tube(f'{gid_t}_coat', KNEE - 0.04, TOP, ease=0.022, paint=vardo_p,
                   hang_from=WAIST, flare=0.14, rows=22, n=42),
        stand_collar(gid_t, teal_p, high=0.045),
        belt_sash(f'{gid_t}_sash', WAIST - 0.032, WAIST + 0.032, teal_p, ease=0.032),
    ]
    parts_t.extend(button_row(gid_t, TOP - 0.03, WAIST + 0.04, n_buttons=5,
                              paint=P('brass', 0.02, fabric='metal.brass'), ease=0.024))
    parts_t.extend(_fg_sleeves(gid_t, 'wrist', 0.022, vardo_p))
    entries.append(assemble_garment(gid_t, 'Winterings Vardo Painted Oilcloth Longcoat', 'torso', 'fellgangs', parts_t))

    # BACK: Painted wooden vardo pedlar's trinket box
    gid_b = f'fg_{sex}_pedlar_box'
    entries.append(assemble_garment(gid_b, 'Winterings Vardo Painted Pedlar Box', 'back', 'fellgangs',
                                    _back_box_or_pannier(gid_b, P('teal', 0.04, [B('top', 0.0, 0.02, 'solid', 'repochre')],
                                                                  fabric='wood.painted'),
                                                         P('crimson', 0.04, fabric='wood.painted'),
                                                         leathery(P('oxblood', 0.05, fabric='leather.polished')),
                                                         dims=(0.15, 0.075, 0.16))))

    # GLOVES: Brass-ringed fingerless trader wristlets
    gid_g = f'fg_{sex}_fingerless_rings'
    entries.append(assemble_garment(gid_g, 'Vardo Brass-Ringed Trader Wristlets', 'gloves', 'fellgangs',
                                    _bracers(gid_g, leathery(P('oxblood', 0.05, fabric='leather.polished')),
                                             f0=0.58, f1=0.97, trim_paint=P('brass', 0.02, fabric='metal.brass'))))

    # LEGS: Checked plaid wool trousers
    gid_l = f'fg_{sex}_checked_trousers'
    entries.append(assemble_garment(gid_l, 'Winterings Checked Wool Trousers', 'legs', 'fellgangs',
                                    list(trousers(gid_l, _p_maud_plaid(), ease=0.012, ease_end=0.012,
                                                  cuff=core.ANKLE + 0.015, bag=0.004)), legged=True))

    # FEET: Brass-buttoned oxblood trader boots
    gid_f = f'fg_{sex}_button_boots'
    entries.append(assemble_garment(gid_f, 'Vardo Brass-Buttoned Oxblood Boots', 'feet', 'fellgangs',
                                    boots(gid_f, P('soot', 0.04, fabric='leather.polished'),
                                          leathery(P('oxblood', 0.05, fabric='leather.polished')),
                                          top=0.58, wraps=2, wrap_paint=P('brass', 0.02, fabric='metal.brass'))))
    return entries


def _build_barricade_picket(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH = core.TOP, core.CHEST, core.WAIST, core.CROTCH
    entries = []
    sign_p = _p_roadsign('repochre', 'soot')
    tyre_p = _p_tyre()
    iron_p = P('iron', 0.05, [B('bottom', 0.0, 0.018, 'solid', 'rust')], fabric='metal.iron')

    # HEAD: Cut gas-cylinder pot-helm with yellow-black hazard rim & rebar brow-bar (`covers_hair=True, covers_face=False`)
    gid_h = f'fg_{sex}_rebar_helm'
    hc, fwd, rgt, up, z_bot, z_top, rx, ry = _head_box()
    pot = head_rings(f'{gid_h}_pot', 0.57, 1.06, 0.018, iron_p, n=36, rows=10, apex=True)
    parts_h = [
        pot,
        head_rings(f'{gid_h}_hazard', 0.56, 0.66, 0.020, sign_p, n=36, rows=4),
    ]
    # Rebar brow-guard welded across front rim of pot-helm (strictly above eyeline!)
    r_brow = pot.P[1]
    rc = r_brow.mean(axis=0)
    p_l = r_brow[int(np.argmax((r_brow - rc) @ (fwd * 0.72 - rgt * 0.70)))]
    p_m = r_brow[int(np.argmax((r_brow - rc) @ fwd))] + fwd * 0.016
    p_r = r_brow[int(np.argmax((r_brow - rc) @ (fwd * 0.72 + rgt * 0.70)))]
    parts_h.append(tube(f'{gid_h}_rebar', [p_l, p_m, p_r], 0.0085, iron_p, n=8, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Barricade Cut-Cylinder Rebar Pot-Helm', 'head', 'fellgangs', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Riveted highway-sign & tyre-rubber brigandine + asymmetric sheared-sign pauldron
    gid_t = f'fg_{sex}_sign_brigandine'
    parts_t = [
        torso_tube(f'{gid_t}_under', TOP, WAIST - 0.06, ease=0.024, ease_bottom=0.044, paint=tyre_p,
                   hang_from=WAIST + 0.02, flare=0.11, rows=16, n=38),
        torso_tube(f'{gid_t}_plates', CHEST + 0.08, WAIST - 0.01, ease=0.029, paint=sign_p, rows=12, n=36),
        pauldron(f'{gid_t}_pauld_R', R, sign_p, reach=0.36, ease=0.028),
        pauldron(f'{gid_t}_pauld_L', L, tyre_p, reach=0.26, ease=0.024),
        belt_sash(f'{gid_t}_belt', WAIST - 0.024, WAIST + 0.028, tyre_p, ease=0.035),
    ]
    parts_t.extend(_fg_sleeves(gid_t, 'wrist', 0.024, _p_peat_wool('charcoal', 'rust')))
    entries.append(assemble_garment(gid_t, 'Barricade Highway-Sign & Tyre Brigandine', 'torso', 'fellgangs', parts_t))

    # BACK: Octagonal STOP/YIELD highway-sign buckler
    gid_b = f'fg_{sex}_barricade_buckler'
    stop_p = P('repred', 0.04, [B('top', 0.0, 0.022, 'solid', 'jusschalk'),
                                B('bottom', 0.0, 0.022, 'solid', 'jusschalk')],
               [PN(0.0, 1.0, 'fellgang_roadsign_plaid', 'jusschalk', 'repred', 0.22)], fabric='metal.iron')
    entries.append(assemble_garment(gid_b, 'Barricade Octagonal Road-Sign Buckler', 'back', 'fellgangs',
                                    _back_barricade_buckler(gid_b, stop_p, iron_p, tyre_p)))

    # GLOVES: Ribbed conveyor-belt tyre-tread bracers
    gid_g = f'fg_{sex}_tyre_bracers'
    entries.append(assemble_garment(gid_g, 'Barricade Tyre-Tread Forearm Bracers', 'gloves', 'fellgangs',
                                    _bracers(gid_g, tyre_p, f0=0.45, f1=0.97, trim_paint=iron_p)))

    # LEGS: Charcoal trousers with riveted scrap-tin knee/shin plates
    gid_l = f'fg_{sex}_scrap_greaves_legs'
    entries.append(assemble_garment(gid_l, 'Barricade Scrap-Tin Greaved Trousers', 'legs', 'fellgangs',
                                    list(trousers(gid_l, _p_peat_wool('charcoal', 'rust'), ease=0.011,
                                                  ease_end=0.012, cuff=core.ANKLE + 0.015, bag=0.004)),
                                    legged=True))

    # FEET: Vulcanized truck-tyre tread raider boots
    gid_f = f'fg_{sex}_tyre_boots'
    entries.append(assemble_garment(gid_f, 'Fellgang Truck-Tyre Tread Boots', 'feet', 'fellgangs',
                                    boots(gid_f, P('soot', 0.05, fabric='leather.cuir_bouilli'), tyre_p,
                                          top=0.55, wraps=3, wrap_paint=iron_p)))
    return entries


def _build_wildcat_boast_hero(sex, body_id):
    """Wildcat Fellgang-Kimr Boss — pairs with existing Meshy hero `fell_{m,f}_wildcat_mask`."""
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH = core.TOP, core.CHEST, core.WAIST, core.CROTCH
    entries = []
    sign_p = _p_roadsign('repochre', 'soot')
    fur_p = _p_sloth_fur()
    tyre_p = _p_tyre()
    iron_p = P('iron', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'rust')], fabric='metal.iron')

    # TORSO: Asymmetrical sloth-pelt left pauldron + highway-sign steel right pauldron over slate-wool & tyre brigandine
    gid_t = f'fg_{sex}_wildcat_cuirass'
    parts_t = [
        torso_tube(f'{gid_t}_jacket', TOP, WAIST - 0.06, ease=0.024, ease_bottom=0.044, paint=_p_maud_plaid(),
                   hang_from=WAIST + 0.02, flare=0.11, rows=16, n=38),
        torso_tube(f'{gid_t}_brigandine', CHEST + 0.09, WAIST - 0.01, ease=0.030, paint=tyre_p, rows=12, n=36),
        collar_disc(f'{gid_t}_fur_mantle', 0.18, fur_p, drop=0.09, ease=0.024, scallop=0.14),
        pauldron(f'{gid_t}_pauld_L', L, fur_p, reach=0.38, ease=0.030),
        pauldron(f'{gid_t}_pauld_R', R, sign_p, reach=0.38, ease=0.030),
        belt_sash(f'{gid_t}_belt', WAIST - 0.026, WAIST + 0.028, sign_p, ease=0.036),
    ]
    parts_t.extend(_fg_sleeves(gid_t, 'wrist', 0.024, _p_peat_wool('slate', 'soot')))
    cf = chest_front(CHEST - 0.01, 0.032)
    parts_t.append(rosette(f'{gid_t}_boss_sign', cf, np.array([0.0, -1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                           0.050, sign_p, n=8, thick=0.014, rigid_joint='Spine2'))
    entries.append(assemble_garment(gid_t, 'Wildcat Sloth-Pelt & Road-Sign Boss Cuirass', 'torso', 'fellgangs', parts_t))

    # BACK: Spiked rebar & megafauna-horn boast-trophy rack
    gid_b = f'fg_{sex}_wildcat_trophy_rack'
    entries.append(assemble_garment(gid_b, 'Wildcat Rebar & Megafauna-Horn Trophy Rack', 'back', 'fellgangs',
                                    _back_wildcat_trophy_rack(gid_b, iron_p,
                                                              P('ivory', 0.04, fabric='armor.osteoderm.scute'),
                                                              sign_p, tyre_p)))

    # GLOVES: Riveted steel & rebar-spiked boss gauntlets
    gid_g = f'fg_{sex}_spiked_vambraces'
    entries.append(assemble_garment(gid_g, 'Wildcat Riveted Boss Gauntlets', 'gloves', 'fellgangs',
                                    list(full_gloves(gid_g, sign_p, tyre_p, f0=0.48, ease=0.018))))

    # LEGS: Roadsign-plaid & scrap-tin tasset breeches
    gid_l = f'fg_{sex}_wildcat_kilt_tassets'
    entries.append(assemble_garment(gid_l, 'Wildcat Roadsign-Plaid Boss Breeches', 'legs', 'fellgangs',
                                    list(trousers(gid_l, _p_maud_plaid(), ease=0.011, ease_end=0.012,
                                                  cuff=core.ANKLE + 0.015, bag=0.004)), legged=True))
    return entries


def _build_kradz_caver(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH = core.TOP, core.CHEST, core.WAIST, core.CROTCH
    entries = []
    bat_p = leathery(P('taupe', 0.06, [B('bottom', 0.0, 0.018, 'solid', 'charcoal')], fabric='leather.buckskin'))
    chitin_p = _p_chitin()
    bone_p = P('ivory', 0.04, fabric='armor.osteoderm.scute')
    glow_p = P('cybercyan', 0.02, [B('top', 0.0, 0.02, 'solid', 'mint')], fabric='beads.glass')

    # HEAD: Pale bat-leather karst coif crowned with curved cave-predator jawbone crest (`covers_hair=True, covers_face=False`)
    gid_h = f'fg_{sex}_kradz_jaw_coif'
    cap = head_rings(f'{gid_h}_coif', 0.58, 1.03, 0.014, bat_p, n=36, rows=10, apex=True)
    parts_h = [cap]
    r_top = cap.P[2]
    rc = r_top.mean(axis=0)
    hc, fwd, rgt, up, z_bot, z_top, rx, ry = _head_box()
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        p0 = r_top[int(np.argmax((r_top - rc) @ (fwd * 0.55 + rgt * (sgn * 0.82))))]
        p1 = p0 + fwd * 0.022 + rgt * (sgn * 0.018) + up * 0.048
        p2 = p1 - fwd * 0.014 - rgt * (sgn * 0.026) + up * 0.042
        parts_h.append(horn(f'{gid_h}_jaw_{tag}', [p0, p1, p2], 0.016, 0.005, bone_p, n=8, rows=6, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Kradz Bat-Leather & Jawbone Karst Coif', 'head', 'fellgangs', parts_h,
                                    covers_hair=True, covers_face=False))

    # TORSO: Sinew-lashed pale cave-chitin & fungus-leather climbing harness over dark caver jerkin
    gid_t = f'fg_{sex}_kradz_chitin_harness'
    parts_t = [
        torso_tube(f'{gid_t}_jerkin', TOP, WAIST - 0.05, ease=0.024, ease_bottom=0.042, paint=bat_p,
                   hang_from=WAIST + 0.02, flare=0.10, rows=16, n=38),
        torso_tube(f'{gid_t}_chitin', CHEST + 0.07, WAIST + 0.01, ease=0.028, paint=chitin_p, rows=10, n=36),
        belt_sash(f'{gid_t}_belt', WAIST - 0.024, WAIST + 0.028, bone_p, ease=0.033),
    ]
    parts_t.extend(_fg_sleeves(gid_t, 'elbow', 0.020, bat_p, ease_end=0.017))
    entries.append(assemble_garment(gid_t, 'Kradz Cave-Chitin & Fungus-Leather Harness', 'torso', 'fellgangs', parts_t))

    # BACK: Curved cave-predator ribcage basket holding luminous glow-fungus
    gid_b = f'fg_{sex}_kradz_bone_cage'
    entries.append(assemble_garment(gid_b, 'Kradz Glow-Fungus Rib Lantern Cage', 'back', 'fellgangs',
                                    _back_kradz_bone_cage(gid_b, bone_p, glow_p, bat_p)))

    # GLOVES: Bone-clawed karst climbing wraps
    gid_g = f'fg_{sex}_kradz_claw_wraps'
    entries.append(assemble_garment(gid_g, 'Kradz Bone-Splint Karst Climbing Wraps', 'gloves', 'fellgangs',
                                    _bracers(gid_g, bat_p, f0=0.48, f1=0.96, ease=0.017, trim_paint=bone_p)))

    # LEGS: Fungus-leather & chitin-plated karst climbing trousers
    gid_l = f'fg_{sex}_kradz_loin_kneepads'
    entries.append(assemble_garment(gid_l, 'Kradz Fungus-Leather Karst Trousers', 'legs', 'fellgangs',
                                    list(trousers(gid_l, bat_p, ease=0.012, ease_end=0.012,
                                                  cuff=core.ANKLE + 0.015, bag=0.004)), legged=True))

    # FEET: Open bare-toe karst climbing sandals
    gid_f = f'fg_{sex}_kradz_heel_straps'
    entries.append(assemble_garment(gid_f, 'Kradz Bare-Toe Karst Climbing Sandals', 'feet', 'fellgangs',
                                    sandal(gid_f, P('charcoal', 0.05, fabric='leather.buckskin'),
                                           bat_p, guard=True, laces=2)))
    return entries


# ===========================================================================================================
# OUTFIT MATRIX, PEOPLES ENTRY & MODULE ENTRYPOINT
# ===========================================================================================================
def _outfits_for_sex(sex):
    return {
        'blakhed_stairman': {
            'head': f'fg_{sex}_flatcap',
            'torso': f'fg_{sex}_porter_jerkin',
            'back': f'fg_{sex}_gorge_kreel',
            'gloves': f'fg_{sex}_hemp_grips',
            'legs': f'fg_{sex}_cord_breeches',
            'feet': f'fg_{sex}_clog_boots',
        },
        'fowler_icecutter': {
            'head': f'fg_{sex}_tarred_souwester',
            'torso': f'fg_{sex}_fowler_smock',
            'back': f'fg_{sex}_ice_hook_coil',
            'gloves': f'fg_{sex}_tallow_mitts',
            'legs': f'fg_{sex}_oiled_overtrousers',
            'feet': f'fg_{sex}_crampon_boots',
        },
        'drover_slate': {
            'head': f'fg_{sex}_drover_brim',
            'torso': f'fg_{sex}_drover_plaid',
            'back': f'fg_{sex}_salt_pannier',
            'gloves': f'fg_{sex}_cuff_gloves',
            'legs': f'fg_{sex}_gaiter_trousers',
            'feet': f'fg_{sex}_hobnail_boots',
        },
        'coppersmith': {
            'head': f'fg_{sex}_smelter_hood',
            'torso': f'fg_{sex}_smith_apron',
            'back': f'fg_{sex}_tinker_frame',
            'gloves': f'fg_{sex}_furnace_gauntlets',
            'legs': f'fg_{sex}_smith_trousers',
            'feet': f'fg_{sex}_clog_boots',
        },
        'traveller': {
            'head': f'fg_{sex}_vardo_hat',
            'torso': f'fg_{sex}_vardo_coat',
            'back': f'fg_{sex}_pedlar_box',
            'gloves': f'fg_{sex}_fingerless_rings',
            'legs': f'fg_{sex}_checked_trousers',
            'feet': f'fg_{sex}_button_boots',
        },
        'barricade_picket': {
            'head': f'fg_{sex}_rebar_helm',
            'torso': f'fg_{sex}_sign_brigandine',
            'back': f'fg_{sex}_barricade_buckler',
            'gloves': f'fg_{sex}_tyre_bracers',
            'legs': f'fg_{sex}_scrap_greaves_legs',
            'feet': f'fg_{sex}_tyre_boots',
        },
        'wildcat_boast_hero': {
            'head': f'fell_{sex}_wildcat_mask',
            'torso': f'fg_{sex}_wildcat_cuirass',
            'back': f'fg_{sex}_wildcat_trophy_rack',
            'gloves': f'fg_{sex}_spiked_vambraces',
            'legs': f'fg_{sex}_wildcat_kilt_tassets',
            'feet': f'fg_{sex}_tyre_boots',
        },
        'kradz_caver': {
            'head': f'fg_{sex}_kradz_jaw_coif',
            'torso': f'fg_{sex}_kradz_chitin_harness',
            'back': f'fg_{sex}_kradz_bone_cage',
            'gloves': f'fg_{sex}_kradz_claw_wraps',
            'legs': f'fg_{sex}_kradz_loin_kneepads',
            'feet': f'fg_{sex}_kradz_heel_straps',
        },
    }


def build_fellgangs_peoples_entry():
    return {
        'id': 'fellgangs',
        'name': 'Fellgangs (West Rift & Blakhed)',
        'note': (
            'Daylight surface pit-clans of Blakhed, Chimes Gorge, West Rift Rim, Winterings Vardo Travellers, '
            'Wildcat, and deep-karst Kradz: sheared Ancient highway-sign pauldrons & bucklers, conveyor-belt '
            'tyre brigandines, greased slate-wool maud plaids, A-frame gorge kreels, painted vardo oilcloth coats, '
            'and pale cave-chitin karst harnesses.'
        ),
        'ancestry': {'african': [0.05, 0.15], 'asian': [0.10, 0.25], 'caucasian': [0.60, 0.80]},
        'skin': ['#e2c3ad', '#cfa990', '#b88e72', '#9b7459'],
        'hair': ['#1a1512', '#382418', '#5e341e', '#785a3a', '#4a4540'],
        'eyes': ['#3b4a56', '#4a5a3a', '#523822', '#2c343c'],
        'grey': 0.40,
        'beard': 0.65,
        'styles': {
            'male': ['short02', 'Short_Hair_B', 'ponytail01', 'long01', 'braid01'],
            'female': ['long01', 'braid01', 'fhair01', 'elvs_double_mh_braid', 'fourstrandbraid'],
        },
        'tiers': FELLGANGS_TIER_SHARES,
        'tier_labels': FELLGANGS_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_fellgangs_kit():
    """Compile all 8 Fellgangs tiers across `mpfb_male` and `mpfb_female`."""
    entries = []
    builders = (
        _build_blakhed_stairman,
        _build_fowler_icecutter,
        _build_drover_slate,
        _build_coppersmith,
        _build_traveller,
        _build_barricade_picket,
        _build_wildcat_boast_hero,
        _build_kradz_caver,
    )
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        for fn in builders:
            entries.extend(fn(sex, body_id))
    return entries


def main():
    t0 = time.perf_counter()
    kit_entries = build_fellgangs_kit()
    peoples_entry = build_fellgangs_peoples_entry()
    manifest_path = CULTURES_DIR / 'fellgangs_manifest.json'
    manifest_path.write_text(json.dumps({
        'culture': 'fellgangs',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Fellgangs pieces ({n_m} male, {n_f} female) across 8 tiers in {dt:.2f}s.')


if __name__ == '__main__':
    main()
