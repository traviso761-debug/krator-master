"""Tungang Wardrobe Kit (`tungang`): the Rift line's tunnel people (kits/tungang/PLAN.md sections 1.5 and 1.5.1,
LORE.md section 6.1 "Friendly Morlocks").

Four outfits on both bodies (`mpfb_male`, `mpfb_female`), fitted salvage, dark and dull with one bright accent each:
1. `crew` (poor and common): a dark canvas jacket with a felt vest of the mat, a grey blanket over the back with its
   red stripe, a felt cowl, a pouch belt; canvas trousers in felt boots soled with Ancient tyre; a felt hood.
2. `fixer` (the Fixers): plain canvas coveralls with the sleeves rolled, a fungus-leather apron on a halter, a tool
   belt with a hip spanner and the gauge, an amber neckerchief (amber is the lamp code's word for work).
3. `steward` (rank is shine): the crews' orange, faded, as a tabard over dark canvas sleeves, with stripes of
   ground-glass beads, the berth number stencilled on the back in rust-pink, three enamel crew badges.
4. `bookman` (the Bookmen): a long soot-black coat with brass buttons, a red enamel badge at the collar, the Book in a
   fungus-leather satchel on a cross strap.
Head pieces: `goggles_up` (on the brow, indoors and in the holds) and `goggles_down` (over the eyes, on the surface
by day), bare-headed and over the crew's hood. Fingerless gloves (the fingers climb and feel).

Colours are the plan's section 1.5.1, in hex, turned linear here; nothing is added to the shared palette. One GLB has
one opaque material, so the visor glass is opaque, the beads take the garment's gloss and no lamp glows: see
TUNGANG-OUTFITS.md, "Owed".
"""
import math
import numpy as np

from .. import core
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame, surface_out, chest_front, assemble_garment
)
from ..paint import P, B, PN
from ..types.torso import torso_tube, collar, stand_collar, cape, tabard, band
from ..types.limbs import sleeve, sleeves, trousers
from ..types.footwear import boots
from ..types.headgear import head_rings, hood
from ..types.accoutrements import blob, pouch_belt, button_row, strap, tube, rosette


def _lin(hx):
    """a hex colour (sRGB) as the palette's linear triple"""
    return tuple(round(((hx >> s & 255) / 255.0) ** 2.2, 4) for s in (16, 8, 0))


# kits/tungang/PLAN.md section 1.5.1. `canvas_dark` and `shine_shadow` are derived (the plan says "dark canvas" and
# gives the canvas alone; a bead strip needs a second tone to read as beads)
T = {
    'orange': _lin(0xc8783e), 'orange_worn': _lin(0xb46a3a), 'shine': _lin(0xdcdcd4), 'shine_shadow': _lin(0x9a9a94),
    'felt': _lin(0x6a5a48), 'leather': _lin(0xb59a72), 'leather_dark': _lin(0x8a7450), 'visor': _lin(0x2e3438),
    'coat': _lin(0x2c2a30), 'canvas': _lin(0x8a8264), 'canvas_dark': _lin(0x45423a),
    'blanket_grey': _lin(0x6a6a64), 'blanket_brown': _lin(0x5e4a3a), 'blanket_red': _lin(0x8a3028),
    'enamel_cream': _lin(0xe2d8bc), 'enamel_red': _lin(0xa8382c), 'chip': _lin(0x2a2826), 'brass': _lin(0xb08a48),
    'rose': _lin(0xc88478), 'amber': _lin(0xf0a63a), 'steel': _lin(0x70726e),
}
CANVAS, WOOL, FELT, LEATHER = 'cloth.canvas.oiled', 'cloth.wool.fulled', 'cloth.felt.boiled', 'leather.cuir_bouilli'
BERTH = {'m': '47', 'f': '12'}


def _brass():
    return P(T['brass'], 0.02, fabric='metal.bronze')


def _enamel(top='enamel_red', base='enamel_cream'):
    """an enamel badge: two fields and a chipped rim"""
    return P(T[base], 0.0, [B('top', 0.0, 0.016, 'solid', T[top]), B('bottom', 0.0, 0.004, 'solid', T['chip'])],
             fabric='beads.glass')


def _as(parts, role, side=None):
    """give the parts a type left without a role their role (and side) for the assembly rules"""
    for p in parts if isinstance(parts, (list, tuple)) else [parts]:
        if getattr(p, 'role', None) is None:
            p.role = role
            if side is not None:
                p.side = side
    return parts


def _box(name, c, out, width, height, depth, paint, rigid_joint):
    """a riveted box or a satchel: a rounded rectangle section (width across, depth along `out`), capped top and bottom"""
    out = np.asarray(out, float)
    out = out / np.linalg.norm(out)
    side = np.cross(np.array([0, 0, 1.0]), out)
    side /= np.linalg.norm(side)
    n = 16
    ring = []
    for a in np.linspace(0, 2 * math.pi, n, endpoint=False):
        ca, sa = math.cos(a), math.sin(a)
        k = 1.0 / max(abs(ca), abs(sa))
        k = 0.82 * k + 0.18 * (1.0 / math.hypot(ca, sa))
        ring.append(side * (ca * k * width / 2) + out * (sa * k * depth / 2))
    ring = np.array(ring)
    rows = []
    for dz, s in ((height / 2, 0.05), (height / 2, 1.0), (height * 0.30, 1.0), (0.0, 1.0), (-height * 0.30, 1.0),
                  (-height / 2, 1.0), (-height / 2, 0.05)):
        rows.append(c + np.array([0, 0, dz]) + ring * s)
    return Part(name, np.array(rows), True, ['body'] * len(rows), paint, rigid_joint=rigid_joint, role='accessory')


def _goggles(gid, down, over=0.0):
    """the smoked goggles of Ancient visor glass: two leather cups with brass rims on a strap, on the brow or over the
    eyes, raycast per-eye-socket so cups and nasal bridge connect flush to the face or hood."""
    a, b, up, bk, left = head_frame()
    f = 0.395 if down else 0.685
    c = a + (b - a) * f
    strap_p = P(T['leather_dark'], 0.04, [B('top', 0.0, 0.004, 'solid', T['chip'])], fabric=LEATHER)
    cup_p = P(T['leather'], 0.04, [B('top', 0.0, 0.008, 'solid', T['brass'])], fabric=LEATHER)
    lens_p = P(T['visor'], 0.0, [B('top', 0.0, 0.006, 'solid', T['shine_shadow'])], fabric='beads.glass')
    parts = [head_rings(gid + '_strap', f - 0.045, f + 0.045, 0.006 + over, strap_p, n=36, rows=4)]
    h_nose = (first_hit(c, -bk) or 0.104) + over
    ends = []
    for k, sx in enumerate((-1.0, 1.0)):
        p_sock = c + left * (0.032 * sx)
        d = -bk + left * (0.14 * sx)
        d /= np.linalg.norm(d)
        h_s = (first_hit(p_sock, d) or 0.092) + over
        p0 = p_sock + d * (h_s - 0.006)
        p1 = p_sock + d * max(h_s + 0.018, h_nose - 0.002)
        parts.append(tube(f'{gid}_cup{k}', [p0, p1], 0.028, cup_p, n=14, rigid_joint='Head'))
        parts.append(rosette(f'{gid}_rim{k}', p1, d, left, 0.030, _brass(), n=14, thick=0.006, rigid_joint='Head'))
        parts.append(rosette(f'{gid}_lens{k}', p1 + d * 0.003, d, left, 0.023, lens_p, n=12, thick=0.005, rigid_joint='Head'))
        ends.append(p1 - d * 0.006 - left * (0.020 * sx))
        # Side tab connecting goggle cup into the wrap-around head strap
        d_tmp = -bk * 0.42 + left * (0.91 * sx)
        d_tmp /= np.linalg.norm(d_tmp)
        h_tmp = (first_hit(c, d_tmp) or 0.088) + 0.006 + over
        p_tab_end = c + d_tmp * h_tmp
        parts.append(strap(f'{gid}_tab{k}', [p1 - d * 0.008 + left * (0.024 * sx), p_tab_end],
                           0.014, strap_p, rigid_joint='Head'))
    br_mid = c + up * 0.003 - bk * (h_nose + 0.003)
    parts.append(strap(gid + '_bridge', [ends[0], br_mid, ends[1]], 0.012, strap_p, rigid_joint='Head'))
    return _as(parts, 'headgear')


def _fingerless(gid, paint, cuff_paint):
    """fingerless gloves: a wrist cuff and a palm wrap to the knuckles; the fingers and thumb stay bare"""
    parts = []
    for s in (L, R):
        parts.append(sleeve(f'{gid}_cuff_{s[0]}', s, cuff_paint, f0=0.80, f1=0.98, ease=0.012, flare=0.004, rows=5, n=20))
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
        palm = Part(f'{gid}_palm_{s[0]}', np.array(rows), True, ['helper-tights'] * len(rows), paint,
                    rigid_joint=s + 'Hand', role='cuff', side=s[0])
        palm.is_arm = True
        parts.append(palm)
    return parts


def _shared(sex, body_id):
    """the pieces every tier draws on: trousers, boots, gloves, the bare-headed goggles"""
    set_body(body_id)
    entries = []
    pre = f'tungang_{sex}'

    gid = pre + '_trousers'
    trou_p = P(T['canvas_dark'], 0.07, [B('bottom', 0.0, 0.03, 'solid', T['felt'])], fabric=CANVAS)
    entries.append(assemble_garment(gid, 'Tungang dark canvas trousers', 'legs', 'tungang',
                                    trousers(gid, trou_p, ease=0.012, ease_end=0.006, cuff=core.ANKLE + 0.06), legged=True))

    gid = pre + '_boots'
    upper_p = P(T['felt'], 0.06, [B('top', 0.0, 0.03, 'solid', T['leather_dark']),
                                  B('bottom', 0.0, 0.035, 'solid', T['chip'])], fabric=FELT)
    entries.append(assemble_garment(gid, 'Tungang felt boots, tyre soles', 'feet', 'tungang',
                                    boots(gid, P(T['chip'], 0.08), upper_p, top=0.52, ease_top=0.032)))

    gid = pre + '_fingerless'
    glove_p = P(T['leather'], 0.05, [B('bottom', 0.0, 0.008, 'solid', T['leather_dark'])], fabric=LEATHER)
    cuff_p = P(T['felt'], 0.06, [B('top', 0.0, 0.012, 'solid', T['leather_dark'])], fabric=FELT)
    e = assemble_garment(gid, 'Tungang fingerless gloves', 'gloves', 'tungang', _fingerless(gid, glove_p, cuff_p))
    e.pop('hide_parts', None)       # fingerless: the nails show
    entries.append(e)

    for down in (False, True):
        gid = pre + ('_goggles_down' if down else '_goggles_up')
        entries.append(assemble_garment(gid, 'Tungang smoked goggles, ' + ('over the eyes' if down else 'on the brow'),
                                        'head', 'tungang', _goggles(gid, down)))
    return entries


def _crew(sex, body_id):
    """1. the crew: layered dark canvas and grey blanket, hooded"""
    set_body(body_id)
    entries = []
    gid = f'tungang_{sex}_crew_layers'
    vest_h = core.TOP - core.WAIST + 0.03
    felt_panel = lambda u0, u1: PN(u0, u1, 'quilt', T['blanket_brown'], T['felt'], 0.14, down=vest_h)
    jacket_p = P(T['canvas_dark'], 0.07, [
        B('bottom', 0.0, 0.025, 'solid', T['felt']),
    ], [
        # the mat's felt as a sleeveless vest over the canvas (armholes at u = 0.17..0.33 and 0.67..0.83)
        felt_panel(0.00, 0.17), felt_panel(0.83, 1.00), felt_panel(0.33, 0.47), felt_panel(0.53, 0.67),
        PN(0.47, 0.485, 'solid', T['leather_dark'], T['felt'], 1.0, down=vest_h),
        PN(0.515, 0.53, 'solid', T['leather_dark'], T['felt'], 1.0, down=vest_h),
    ], fabric=CANVAS)
    sl_p = P(T['canvas_dark'], 0.07, [B('bottom', 0.0, 0.05, 'solid', T['felt'])], fabric=CANVAS)
    blanket_p = P(T['blanket_grey'], 0.08, [
        B('bottom', 0.03, 0.065, 'solid', T['blanket_red']),
        B('bottom', 0.085, 0.10, 'solid', T['blanket_brown']),
        B('top', 0.0, 0.02, 'solid', T['blanket_brown']),
    ], fabric=WOOL)
    hem = core.CROTCH - (0.06 if sex == 'm' else 0.08)
    # (the sides hang from the hips' width, not the waist's: hung from the waist, the trouser legs came through at the
    # outer hips in the A-pose)
    jacket = torso_tube(gid, core.TOP, hem, 0.020, jacket_p, hang_from=core.WAIST - 0.02, hang_side=core.CROTCH + 0.05, flare=0.04,
                        group_below=core.CROTCH + 0.02, hull_from=core.WAIST)
    parts = [jacket]
    parts.extend(sleeves(gid, 'wrist', 0.020, sl_p, ease_end=0.030, rows=9))
    parts.append(_as(cape(gid + '_blanket', core.WAIST - 0.06, blanket_p, span=0.40, ease=0.032, flare=0.14), 'drape'))
    parts.append(collar(gid + '_cowl', P(T['felt'], 0.06, [B('top', 0.0, 0.01, 'solid', T['blanket_brown'])], fabric=FELT),
                        height=0.036, flare=0.006, ease=0.022))
    belt_p = P(T['canvas'], 0.06, [B('top', 0.0, 0.008, 'solid', T['chip'])],
               [PN(0.47, 0.53, 'solid', T['brass'], T['canvas'], 1.0)], fabric=CANVAS)
    pouch_p = P(T['leather'], 0.05, [B('top', 0.0, 0.025, 'solid', T['leather_dark'])], fabric=LEATHER)
    parts.extend(pouch_belt(gid, belt_p, pouch_p, ease=0.034))
    entries.append(assemble_garment(gid, 'Tungang crew canvas, felt vest & grey blanket', 'torso', 'tungang', parts))

    hood_p = P(T['felt'], 0.06, [B('bottom', 0.0, 0.02, 'solid', T['blanket_brown'])], fabric=FELT)
    for down in (False, True):
        gid = f'tungang_{sex}_hood_goggles_' + ('down' if down else 'up')
        hd = hood(gid, hood_p, ease=0.022, ease_low=0.024, open_front=0.92, low=-0.16, rows=14, n=36, peak=0.04)
        # Trim/seat any lateral earflap or shoulder-wing flare flush to the neck/jawline
        z_nk_lim = float(core.NECK[2]) + 0.055
        for ri in range(hd.P.shape[0]):
            for ci in range(hd.P.shape[1]):
                pz = float(hd.P[ri, ci, 2])
                if pz < z_nk_lim:
                    u_nk = float(np.clip((z_nk_lim - pz) / 0.095, 0.0, 1.0))
                    x_cap = 0.112 * (1.0 - u_nk) + 0.096 * u_nk
                    if abs(hd.P[ri, ci, 0]) > x_cap:
                        hd.P[ri, ci, 0] = math.copysign(x_cap, hd.P[ri, ci, 0])
        # Separate Spine2/Neck-weighted lower hood mantle collar so head rotation NEVER wings the mantle
        mantle = collar(gid + '_mantle', hood_p, height=0.042, flare=0.012, ease=0.020, rows=5, n=36)
        mantle.rigid_joint = 'Spine2'
        parts = [_as(hd, 'headgear'), _as(mantle, 'headgear')]
        parts.extend(_goggles(gid, down, over=0.0 if down else 0.024))
        entries.append(assemble_garment(gid, 'Tungang felt hood, goggles ' + ('over the eyes' if down else 'on the brow'),
                                        'head', 'tungang', parts, covers_hair=True))
    return entries


def _fixer(sex, body_id):
    """2. the Fixers: canvas coveralls, a fungus-leather apron, a tool belt"""
    set_body(body_id)
    entries = []
    gid = f'tungang_{sex}_fixer_coveralls'
    cover_p = P(T['canvas'], 0.07, [
        B('bottom', 0.0, 0.02, 'solid', T['canvas_dark']),
    ], [
        PN(0.49, 0.51, 'buttons', T['brass'], T['canvas_dark'], 0.07, down=core.TOP - core.WAIST),
        PN(0.36, 0.44, 'solid', T['canvas_dark'], T['canvas'], 1.0, down=0.022),
    ], fabric=CANVAS)
    sl_p = P(T['canvas'], 0.07, [B('bottom', 0.0, 0.045, 'solid', T['canvas_dark'])], fabric=CANVAS)
    # (one piece with the legs: the top ends under the belt, so no hem stands off the hips to come through the apron)
    top = torso_tube(gid, core.TOP, core.WAIST - 0.045, 0.014, cover_p, hull_from=core.WAIST)
    top.cloth = None
    parts = [top]
    parts.extend(sleeves(gid, 'elbow', 0.020, sl_p, ease_end=0.030, rows=6))
    parts.append(collar(gid + '_kerchief', P(T['amber'], 0.05, [B('bottom', 0.0, 0.008, 'solid', T['orange_worn'])],
                                             fabric='cloth.cotton.coarse'), height=0.036, flare=0.016, ease=0.022))
    apron_p = P(T['leather'], 0.05, [
        B('top', 0.0, 0.02, 'solid', T['leather_dark']),
        B('bottom', 0.0, 0.015, 'solid', T['leather_dark']),
        B('top', 0.30, 0.42, 'quilt', T['leather_dark'], T['leather'], 0.10),
    ], fabric='leather.foundry.pigskin')
    parts.extend(tabard(gid + '_apron', core.KNEE + 0.08, core.CHEST + 0.03, apron_p, width=0.41, ease=0.044,
                        front=True, back=False))
    parts.append(band(gid + '_apron_halter', core.CHEST + 0.02, core.SHOULDER + 0.015, 0.022, 0.030,
                      P(T['leather_dark'], 0.04, fabric=LEATHER), high=0.0, rows=3))
    belt_p = P(T['leather_dark'], 0.05, [B('top', 0.0, 0.008, 'solid', T['chip']), B('bottom', 0.0, 0.008, 'solid', T['chip'])],
               [PN(0.47, 0.53, 'solid', T['brass'], T['leather_dark'], 1.0)], fabric=LEATHER)
    pouch_p = P(T['leather'], 0.05, [B('top', 0.0, 0.03, 'solid', T['leather_dark']),
                                     B('top', 0.03, 0.038, 'solid', T['brass'])], fabric=LEATHER)
    parts.extend(pouch_belt(gid, belt_p, pouch_p, ease=0.056))
    # the hip spanner (the long spanner is a prop) and the Fixers' gauge, a brass disc on the belt
    c_hip = spine_at(core.WAIST - 0.03)
    d_sp = np.array([-0.93, 0.36, 0.0])
    d_sp /= np.linalg.norm(d_sp)
    p_top = surface_out(c_hip, d_sp, 0.078) + np.array([0, 0, 0.07])
    steel_p = P(T['steel'], 0.02, fabric='metal.iron')
    # (tucked through the belt and kept above the crotch: a part hung below it is gathered into the skirt's weights)
    parts.append(_as(tube(gid + '_spanner', [p_top, p_top + np.array([0, 0, -0.17])], 0.008, steel_p, n=8,
                          rigid_joint='Hips'), 'accessory'))
    parts.append(blob(gid + '_spanner_jaw', p_top + np.array([0, 0, 0.022]), (0.052, 0.014, 0.06), steel_p, n=10, rows=5,
                      out=d_sp, rigid_joint='Hips', role='accessory'))
    d_g = np.array([0.42, -0.90, 0.0])
    d_g /= np.linalg.norm(d_g)
    parts.append(rosette(gid + '_gauge', surface_out(c_hip, d_g, 0.072), d_g, FRONT, 0.030,
                         P(T['enamel_cream'], 0.0, [B('top', 0.0, 0.012, 'solid', T['brass']),
                                                    B('bottom', 0.0, 0.012, 'solid', T['brass'])], fabric='metal.bronze'),
                         n=14, thick=0.010, rigid_joint='Hips'))
    entries.append(assemble_garment(gid, 'Tungang Fixer coveralls, leather apron & tool belt', 'torso', 'tungang', parts))

    gid = f'tungang_{sex}_fixer_legs'
    leg_p = P(T['canvas'], 0.07, [
        B('top', 0.34, 0.50, 'quilt', T['leather_dark'], T['leather'], 0.06),
        B('bottom', 0.0, 0.03, 'solid', T['canvas_dark']),
    ], fabric=CANVAS)
    seat_p = P(T['canvas'], 0.07, fabric=CANVAS)
    entries.append(assemble_garment(gid, 'Tungang Fixer coverall legs, knee patches', 'legs', 'tungang',
                                    trousers(gid, leg_p, ease=0.012, ease_end=0.006, cuff=core.ANKLE + 0.06, seat_paint=seat_p),
                                    legged=True))
    return entries


def _steward(sex, body_id):
    """3. the steward: the crews' orange, faded, with the shine; a berth number on the back; enamel crew badges"""
    set_body(body_id)
    gid = f'tungang_{sex}_steward_tabard'
    hem = core.CROTCH - (0.08 if sex == 'm' else 0.10)
    length = core.TOP - hem
    stripe_h = length - 0.105
    beads = lambda u0, u1: PN(u0, u1, 'beads', T['shine'], T['shine_shadow'], 0.014, down=stripe_h)
    n0, n1 = BERTH[sex]
    tab_p = P(T['orange'], 0.07, [
        B('bottom', 0.0, 0.03, 'solid', T['orange_worn']),
        B('bottom', 0.06, 0.125, 'highvis_bead_stencil', T['shine'], T['orange_worn'], 0.08),
        B('top', 0.0, 0.015, 'solid', T['orange_worn']),
    ], [
        # the Ancients' reflective strips, remembered: two bead stripes over the shoulders, front (u = 0.5) and back
        beads(0.385, 0.415), beads(0.585, 0.615), beads(0.115, 0.145), beads(0.855, 0.885),
        # the berth number between the back stripes, a digit each side of the strip's seam at the spine
        # (on a dark canvas patch: the plan's rust-pink is the orange's own value and does not read on it bare)
        # (the strip's u runs right to left seen from behind, so the cells are mirrored and the second digit comes first)
        PN(0.900, 1.000, 'stencil<:' + n1, T['rose'], T['chip'], 0.30, down=0.30),
        PN(0.000, 0.100, 'stencil<:' + n0, T['rose'], T['chip'], 0.30, down=0.30),
        PN(0.900, 1.000, 'solid', T['orange'], T['orange'], 1.0, down=0.125),
        PN(0.000, 0.100, 'solid', T['orange'], T['orange'], 1.0, down=0.125),
    ], fabric=CANVAS)
    sl_p = P(T['canvas_dark'], 0.07, [B('bottom', 0.0, 0.04, 'solid', T['felt'])], fabric=CANVAS)
    tab = torso_tube(gid, core.TOP, hem, 0.024, tab_p, hang_from=core.WAIST - 0.02, hang_side=core.CROTCH + 0.05, flare=0.04,
                     group_below=core.CROTCH + 0.02, hull_from=core.WAIST)
    parts = [tab]
    parts.extend(sleeves(gid, 'wrist', 0.020, sl_p, ease_end=0.030, rows=9))
    parts.append(stand_collar(gid, P(T['canvas_dark'], 0.06, [B('top', 0.0, 0.008, 'solid', T['felt'])], fabric=CANVAS),
                              high=0.05))
    belt_p = P(T['leather_dark'], 0.05, [B('top', 0.0, 0.008, 'solid', T['chip'])],
               [PN(0.47, 0.53, 'solid', T['brass'], T['leather_dark'], 1.0)], fabric=LEATHER)
    parts.extend(pouch_belt(gid, belt_p, P(T['leather'], 0.05, [B('top', 0.0, 0.025, 'solid', T['leather_dark'])],
                                           fabric=LEATHER), ease=0.044))
    # three enamel crew badges on the left breast
    for k, (dx, dz, top) in enumerate(((0.062, 0.035, 'enamel_red'), (0.098, 0.035, 'chip'), (0.080, 0.000, 'enamel_red'))):
        parts.append(rosette(f'{gid}_badge{k}', chest_front(core.CHEST + dz, 0.032, x=dx), FRONT, np.array([1.0, 0, 0]),
                             0.015, _enamel(top), n=12, thick=0.006, rigid_joint='Spine2'))
    return [assemble_garment(gid, "Tungang steward's orange tabard, bead stripes & berth number", 'torso', 'tungang', parts)]


def _bookman(sex, body_id):
    """4. the Bookmen: a long dark coat, the Book in a satchel"""
    set_body(body_id)
    gid = f'tungang_{sex}_bookman_coat'
    coat_p = P(T['coat'], 0.05, [
        B('bottom', 0.0, 0.02, 'solid', T['chip']),
    ], [
        PN(0.492, 0.508, 'solid', T['chip'], T['coat'], 1.0),
    ], fabric=WOOL)
    sl_p = P(T['coat'], 0.05, [B('bottom', 0.0, 0.05, 'solid', T['chip']),
                               B('bottom', 0.05, 0.058, 'solid', T['brass'])], fabric=WOOL)
    coat = torso_tube(gid, core.TOP, core.KNEE - 0.16, 0.018, coat_p, hang_from=core.WAIST - 0.02, hang_side=core.CROTCH + 0.05, flare=0.08,
                      group_below=core.CROTCH + 0.02, hull_from=core.WAIST)
    parts = [coat]
    parts.append(stand_collar(gid, P(T['coat'], 0.05, [B('top', 0.0, 0.008, 'solid', T['brass'])], fabric=WOOL), high=0.06))
    parts.extend(sleeves(gid, 'wrist', 0.020, sl_p, ease_end=0.030, rows=9))
    parts.extend(button_row(gid, core.CHEST + 0.05, core.WAIST - 0.08, n_buttons=6, paint=_brass(), ease=0.024))
    parts.append(rosette(gid + '_badge', chest_front(core.TOP - 0.035, 0.024, x=0.045), FRONT, np.array([1.0, 0, 0]),
                         0.014, _enamel('enamel_red'), n=12, thick=0.006, rigid_joint='Spine2'))
    strap_p = P(T['leather'], 0.05, [B('top', 0.0, 0.006, 'solid', T['leather_dark']),
                                     B('bottom', 0.0, 0.006, 'solid', T['leather_dark'])], fabric=LEATHER)
    parts.append(band(gid + '_satchel_strap', core.WAIST - 0.06, core.SHOULDER + 0.015, 0.04, 0.044, strap_p,
                      high=math.pi / 2, rows=4))
    # the Book's satchel on the right hip: 0.35 x 0.1 x 0.28 m at the Tungangs' 0.94, so 0.33 x 0.095 x 0.26 here
    d_s = np.array([-0.96, -0.22, 0.0])
    d_s /= np.linalg.norm(d_s)
    c_s = surface_out(spine_at(core.WAIST - 0.14), d_s, 0.095)
    satchel_p = P(T['leather'], 0.05, [
        B('top', 0.0, 0.11, 'solid', T['leather_dark']),
        B('top', 0.11, 0.118, 'solid', T['chip']),
        B('bottom', 0.0, 0.012, 'solid', T['leather_dark']),
    ], [PN(0.70, 0.80, 'solid', T['brass'], T['leather_dark'], 1.0, down=0.125)], fabric=LEATHER)
    parts.append(_box(gid + '_satchel', c_s, d_s, 0.33, 0.26, 0.095, satchel_p, 'Hips'))
    return [assemble_garment(gid, "Tungang Bookman's long coat & the Book's satchel", 'torso', 'tungang', parts)]


def build_tungang_kit():
    """Build the Tungang outfits for both bodies."""
    entries = []
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        entries.extend(_shared(sex, body_id))
        entries.extend(_crew(sex, body_id))
        entries.extend(_fixer(sex, body_id))
        entries.extend(_steward(sex, body_id))
        entries.extend(_bookman(sex, body_id))
    set_body('mpfb_male')
    return entries
