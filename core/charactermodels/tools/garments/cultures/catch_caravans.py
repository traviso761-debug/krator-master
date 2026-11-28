"""Caravaneers of the Catch & The Twins Wardrobe Kit (`catch_twins_caravaneers`).

Implements Group A (`A1..A10`) of `catch_twins_and_xanadu_expats_garment_plan.md`
100% procedurally on native MPFB proportions for BOTH `mpfb_male` (`m`) and
`mpfb_female` (`f`) across all 6 slots (`head`, `torso`, `gloves`, `legs`, `feet`, `back`):

- A1 `two_horns_guide`:    Brotherhood of the Two Horns Pass-Master (*Dalil al-Qaranayn*)
- A2 `jabal_salt_syndic`:  Train of Jabal Salt-Syndic & Wakil (Urban Dasri tower-house master)
- A3 `jabal_camel_drover`: Catch Halite-Pan & High-Wagon Teamster (Salt al-Ban / Route B)
- A4 `iziz_tube_packmaster`: Izani *Getmastarz* / *Goldanda* Dark-Tube Pack-Master (Route A)
- A5 `catch_outrider`:     Catch & Twins Caravan Outrider / Stalker-Watch Escort
- A6 `yuni_wagon_factor`:  Yuni Merchants' Guild Oilskin-Wagon Factor (Lasso / Route B)
- A7 `geo_convoy_blaster`: Geomancer Lizard-Patrol & Explosive-Escort Sapper
- A8 `stair_oasis_bailiff`: Stair Polyglot Entrepot Factor & Well-Bailiff
- A9 `stair_bore_diver`:   Stair Hill-Arcology & Dead-Bore Salvage Diver
- A10 `gills_salt_peddler`: White Gills Lung-Salt Peddler & Lava-Tube Smuggler
"""
import math
import numpy as np

from .. import core
from .. import paint as gpaint
from ..core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, ring_points, smooth_push, assemble_garment
)
from ..paint import P, B, PN, C, COTTON, WOOL, sample_cultural_tex
from ..types.torso import (
    torso_tube, collar, stand_collar, collar_disc, cape, tabard, band, crossed_sash, pauldron
)
from ..types.limbs import limb_tube, sleeve, sleeves, trousers
from ..types.footwear import boots, sandal
from ..types.headgear import (
    head_rings, sculpted_faceplate, sculpted_cranium, hood, brim,
    tower_hat, crown_band, crest, wing, horn, turban
)
from ..types.accoutrements import (
    flap, blob, pouch_belt, sash_with_tail, pack_straps, button_row,
    stacked_belts, pendants, strap, tube, tassel, rosette
)


# ===========================================================================================================
# 0. IDEMPOTENT PROCEDURAL MOTIF EXTENSION (No edits to `tools/garments/paint.py`)
# ===========================================================================================================
def _install_caravaneer_motifs():
    """Register Group A & B cultural/environmental motifs onto `gpaint.motif` in memory."""
    if getattr(gpaint.motif, '_caravaneer_installed', False):
        return
    orig_motif = gpaint.motif

    def _caravaneer_motif(style, w, h, fg, bg, aspect=1.0):
        W, H = max(int(w), 2), max(int(h), 2)
        yy, xx = np.mgrid[0:H, 0:W]
        u, v = (xx + 0.5) / W, (yy + 0.5) / H

        if style == 'dasri_juss_ikat':
            # Sana'ani tiraz & juss-frieze woven ikat: chalk-white gypsum chevrons, stepped medallions,
            # paired bronze ibex-horn crescents, and qamariya jewel-glass lozenges on madder & indigo.
            img = np.empty((H, W, 3), dtype=np.float64)
            img[:] = bg
            nx = max(2.0, round(3.0 * max(aspect, 0.4)))
            ny = max(2.0, round(3.0 / max(aspect, 0.4)))
            gu = (u * nx) % 1.0 - 0.5
            gv = (v * ny) % 1.0 - 0.5
            # Indigo & madder warp ikat bands
            warp = ((u * nx * 2.0) % 1.0) < 0.46
            img[warp] = C['ebadindigo']
            # Chalk-white juss gypsum chevrons
            zig = np.abs(np.abs(gv) - (0.36 - 0.42 * np.abs(gu))) < 0.055
            # Stepped qamariya jewel lozenge core
            d_man = np.abs(gu) * 1.6 + np.abs(gv) * 1.6
            loz_rim = (d_man >= 0.28) & (d_man <= 0.40)
            loz_turq = d_man < 0.20
            # Paired bronze ibex-horn arcs flanking top of medallion
            r_hL = np.hypot((gu + 0.16) * 1.5, (gv + 0.16) * 1.5)
            r_hR = np.hypot((gu - 0.16) * 1.5, (gv + 0.16) * 1.5)
            ibex = (((r_hL > 0.14) & (r_hL < 0.21) & (gu < -0.02)) |
                    ((r_hR > 0.14) & (r_hR < 0.21) & (gu > 0.02))) & (gv < 0.04)
            saffron_edge = (np.abs(v - 0.06) < 0.03) | (np.abs(v - 0.94) < 0.03)
            img[zig | loz_rim] = C['jusschalk']
            img[loz_turq] = C['oasisturq']
            img[ibex] = C['rabbitgold']
            img[saffron_edge] = C['saffron']
            tex = sample_cultural_tex('tex.dasri_juss_qamariya', W, H, fg, bg, pal_blend=0.20)
            return (0.42 * img + 0.58 * tex)[:h, :w]

        if style == 'two_horns_brocade':
            # Highland yak-wool brocade: octagonal medallions framing paired black-and-ice volcano cones
            # (Al-Qaranan) and notched Split-Tally staves on basalt & madder with sulfur-saffron borders.
            img = np.empty((H, W, 3), dtype=np.float64)
            img[:] = bg
            nx = max(1.0, round(2.2 * max(aspect, 0.45)))
            ny = max(1.0, round(2.2 / max(aspect, 0.45)))
            gu = ((u * nx) % 1.0 - 0.5) * 2.0
            gv = ((v * ny) % 1.0 - 0.5) * 2.0
            ax, ay = np.abs(gu), np.abs(gv)
            oct_d = np.maximum(np.maximum(ax, ay), (ax + ay) * 0.72)
            in_med = oct_d < 0.84
            oct_rim = (oct_d >= 0.74) & (oct_d <= 0.86)
            img[in_med] = C['madder']
            # Paired twin volcano cones (Al-Qaranan) + white ice caps
            cone_L = (gv > -0.25) & (gv < 0.52) & (np.abs(gu + 0.28) < 0.34 * (gv + 0.32))
            cone_R = (gv > -0.25) & (gv < 0.52) & (np.abs(gu - 0.28) < 0.34 * (gv + 0.32))
            snow_cap = (cone_L | cone_R) & (gv < 0.04)
            img[cone_L | cone_R] = C['basalt']
            img[snow_cap] = C['snowleopard']
            # Notched Split-Tally staves on left & right of medallion
            stave = (np.abs(ax - 0.64) < 0.045) & (ay < 0.58)
            notches = stave & (((np.floor((gv + 1.0) * 8.0)) % 2) == 0)
            img[oct_rim | stave] = C['saffron']
            img[notches] = C['soot']
            tex = sample_cultural_tex('tex.xanadu_two_horns', W, H, fg, bg, pal_blend=0.18)
            return (0.36 * img + 0.64 * tex)[:h, :w]

        if style == 'salt_frost_alkali':
            # Linseed/burlap canvas crusted with chalky-white & pink halite efflorescence tide-lines.
            img = np.empty((H, W, 3), dtype=np.float64)
            img[:] = bg
            tide1 = 0.35 + 0.10 * np.sin(u * 6.0 * math.pi) + 0.05 * np.cos(u * 14.0 * math.pi)
            tide2 = 0.62 + 0.08 * np.cos(u * 8.0 * math.pi - 0.7)
            grain_n = 0.5 + 0.5 * np.sin(u * 41.0 + v * 29.0) * np.cos(u * 19.0 - v * 37.0)
            frost_lo = (v > tide1) & (grain_n > 0.38)
            frost_hi = v > tide2
            pink_vein = (np.abs(v - tide2) < 0.055) | ((v > tide2) & (grain_n > 0.68))
            img[frost_lo] = 0.55 * np.asarray(C['saltlime']) + 0.45 * np.asarray(bg)
            img[frost_hi] = C['brucitewhite']
            img[pink_vein] = C['halitepink']
            tex = sample_cultural_tex('tex.stalker_alkali_patchwork', W, H, C['brucitewhite'], bg, pal_blend=0.28)
            return (0.52 * img + 0.48 * tex)[:h, :w]

        if style == 'topographic_strata':
            # Geomancer elevation contour lines & survey benchmarks on dark oiled canvas.
            img = np.empty((H, W, 3), dtype=np.float64)
            img[:] = bg
            su = u * max(aspect, 0.75) * 2.4
            sv = v * 2.4
            elev = (
                np.sin(su * math.pi * 1.4 + 0.4 * np.cos(sv * math.pi * 1.8))
                + 0.65 * np.cos((su - 0.7) * math.pi * 2.1 - sv * math.pi * 1.5)
            )
            contour_major = np.abs(((elev * 3.0) % 1.0) - 0.5) < 0.065
            contour_minor = np.abs(((elev * 6.0) % 1.0) - 0.5) < 0.040
            grid = (np.abs((u * 6.0) % 1.0 - 0.5) < 0.018) | (np.abs((v * 6.0) % 1.0 - 0.5) < 0.018)
            img[grid] = 0.75 * np.asarray(bg) + 0.25 * np.asarray(C['brass'])
            img[contour_minor] = C['brass']
            img[contour_major] = fg
            tex = sample_cultural_tex('tex.geomancers_circuit_strata', W, H, fg, bg, pal_blend=0.22)
            return (0.42 * img + 0.58 * tex)[:h, :w]

        if style == 'glazier_vein_register':
            # Alecap-purple & indigo Xanadu silk damask woven with 8-spoked Tungang click-wheels,
            # Order-Blue vein cartouches, and cholet cusped-arch borders.
            img = np.empty((H, W, 3), dtype=np.float64)
            img[:] = bg
            nx = max(2.0, round(2.6 * max(aspect, 0.4)))
            ny = max(2.0, round(2.6 / max(aspect, 0.4)))
            gu = ((u * nx) % 1.0 - 0.5) * 2.0
            gv = ((v * ny) % 1.0 - 0.5) * 2.0
            r = np.hypot(gu, gv)
            th = np.arctan2(gv, gu)
            # Cusped cholet lozenge arch
            d_cusp = np.abs(gu) * 0.95 + np.abs(gv) * 0.95
            cusp_band = (d_cusp >= 0.74) & (d_cusp <= 0.88)
            cartouche = r < 0.56
            wheel_rim = ((r >= 0.40) & (r <= 0.50)) | ((r >= 0.14) & (r <= 0.22))
            spokes = (r >= 0.18) & (r <= 0.44) & (np.abs(np.sin(4.0 * th)) < 0.16)
            img[cartouche] = C['orderblue']
            img[cusp_band] = C['lacrose']
            img[(d_cusp >= 0.88) & (d_cusp <= 0.95)] = C['turq']
            img[wheel_rim | spokes] = fg
            img[r < 0.11] = C['moonglass']
            tex = sample_cultural_tex('tex.glazier_vein_register', W, H, fg, bg, pal_blend=0.18)
            return (0.34 * img + 0.66 * tex)[:h, :w]

        if style == 'snowleopard_pelage':
            # Dense pale cream-grey mountain-cat winter pelage with smoky charcoal open rosettes.
            img = np.empty((H, W, 3), dtype=np.float64)
            img[:] = C['snowleopard']
            nx = max(4.0, round(5.0 * max(aspect, 0.6)))
            ny = max(4.0, round(5.0 / max(aspect, 0.6)))
            row_l = np.floor(v * ny).astype(int)
            su = (u * nx + 0.5 * (row_l % 2)) % 1.0 - 0.5
            sv = (v * ny) % 1.0 - 0.5
            ang = np.arctan2(sv, su)
            rad = np.hypot(su * 1.2, sv * 1.2) * (1.0 + 0.18 * np.cos(3.0 * ang) + 0.12 * np.sin(5.0 * ang))
            core_s = rad < 0.30
            rosette_ring = (rad >= 0.20) & (rad <= 0.40) & (np.cos(4.0 * ang + (row_l % 3)) > -0.45)
            img[core_s] = 0.78 * np.asarray(C['snowleopard']) + 0.22 * np.asarray(C['taupe'])
            img[rosette_ring] = C['charcoal']
            return img[:h, :w]

        if style == 'moonglass_greenhouse':
            # Quilted diamond panes of milky translucent potch opal set in bronze & emerald silk leading ribs.
            img = np.empty((H, W, 3), dtype=np.float64)
            img[:] = C['moonglass']
            nx = max(3.0, round(4.5 * max(aspect, 0.5)))
            ny = max(3.0, round(4.5 / max(aspect, 0.5)))
            du = (u * nx + v * ny) % 1.0 - 0.5
            dv = (u * nx - v * ny) % 1.0 - 0.5
            rib = np.minimum(np.abs(du), np.abs(dv))
            irid = 0.5 + 0.5 * np.sin((du * 3.0 + dv * 2.0) * math.pi)
            img[:] = (
                (1.0 - 0.28 * irid[:, :, None]) * np.asarray(C['moonglass'])[None, None, :]
                + (0.28 * irid[:, :, None]) * np.asarray(C['nacregreen'])[None, None, :]
            )
            emerald_welt = (rib >= 0.055) & (rib < 0.105)
            bronze_lead = rib < 0.055
            img[emerald_welt] = C['emerald']
            img[bronze_lead] = C['bronze']
            tex = sample_cultural_tex('tex.xanadu_moonglass', W, H, C['moonglass'], C['bronze'], pal_blend=0.25)
            return (0.64 * img + 0.36 * tex)[:h, :w]

        if style == 'kilim_four_tongue':
            # Stair oasis 4-tongue polyglot patchwork kilim (Dasri, Xanadu, Izani, Yuni strips).
            img = np.empty((H, W, 3), dtype=np.float64)
            band_i = (np.floor(v * 4.0).astype(int)) % 4
            c0 = sample_cultural_tex('tex.nomad_sadu', W, H, C['jusschalk'], C['dragoncrimson'], pal_blend=0.20)
            c1 = sample_cultural_tex('tex.xanadu_cholet_pangden', W, H, C['saffron'], C['oasisturq'], pal_blend=0.20)
            c2 = sample_cultural_tex('tex.iziz_carpet_a', W, H, C['gold'], C['ebadindigo'], pal_blend=0.22)
            c3 = sample_cultural_tex('tex.yuni_rug', W, H, C['yuniyellow'], C['teal'], pal_blend=0.22)
            img[:] = c0
            img[band_i == 1] = c1[band_i == 1]
            img[band_i == 2] = c2[band_i == 2]
            img[band_i == 3] = c3[band_i == 3]
            seam = np.abs(((v * 4.0) % 1.0) - 0.5) > 0.44
            img[seam] = C['jusschalk']
            return img[:h, :w]

        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    _caravaneer_motif._caravaneer_installed = True
    gpaint.motif = _caravaneer_motif


_install_caravaneer_motifs()


# ===========================================================================================================
# 1. SHARED GEOMETRY HELPERS (Strict Conformance & Zero-Float Accoutrements)
# ===========================================================================================================
def _as(parts, role, side=None):
    for p in parts if isinstance(parts, (list, tuple)) else [parts]:
        if getattr(p, 'role', None) is None:
            p.role = role
            if side is not None:
                p.side = side
    return parts


def _head_landmarks():
    """Return `(a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown)` calibrated to true `base.glb` eye/brow primitives."""
    from ..types.headgear import head_landmarks_exact
    return head_landmarks_exact()[:9]


def _box(name, c, out, width, height, depth, paint, rigid_joint='Spine2', role='accessory'):
    """Rounded-rectangular box/trunk/hod/strongbox (`7 x 16 = 112` verts), capped top and bottom."""
    out = np.asarray(out, float)
    out = out / np.linalg.norm(out)
    side = np.cross(np.array([0.0, 0.0, 1.0]), out)
    if np.linalg.norm(side) < 1e-6:
        side = np.array([1.0, 0.0, 0.0])
    else:
        side /= np.linalg.norm(side)
    n = 16
    ring = []
    for ang in np.linspace(0.0, 2.0 * math.pi, n, endpoint=False):
        ca, sa = math.cos(ang), math.sin(ang)
        k = 1.0 / max(abs(ca), abs(sa))
        k = 0.82 * k + 0.18 * (1.0 / math.hypot(ca, sa))
        ring.append(side * (ca * k * width * 0.5) + out * (sa * k * depth * 0.5))
    ring = np.array(ring)
    rows = []
    for dz, s in (
        (height * 0.5, 0.04), (height * 0.5, 1.0), (height * 0.28, 1.0),
        (0.0, 1.0), (-height * 0.28, 1.0), (-height * 0.5, 1.0), (-height * 0.5, 0.04)
    ):
        rows.append(c + np.array([0.0, 0.0, dz]) + ring * s)
    return Part(name, np.array(rows), True, ['body'] * len(rows), paint, rigid_joint=rigid_joint, role=role)


def _goggles(gid, down, strap_p, cup_p, rim_p, lens_p, over=0.0, slit=False, host_parts=None, f_override=None):
    """Raycast eye-socket or brow goggles seated flush (`2-8 mm`) against face or host headgear (never clipping brims/crowns)."""
    from ..types.headgear import head_landmarks_exact
    a, b, up, bk, left, _, f_eyes, f_brow, _, x_eye = head_landmarks_exact()
    h_ab = max(float(np.linalg.norm(b - a)), 1e-6)
    f = f_override if f_override is not None else (f_eyes if down else (f_brow + 0.14))
    host_v = None
    if host_parts:
        flat_hp = []
        for hp in host_parts:
            if isinstance(hp, (list, tuple)):
                flat_hp.extend(x for x in hp if getattr(x, 'P', None) is not None)
            elif getattr(hp, 'P', None) is not None:
                flat_hp.append(hp)
        if not down:
            for hp in flat_hp:
                if 'brim' in (hp.name or '').lower():
                    v_br = hp.P.reshape(-1, 3)
                    front_br = v_br[v_br[:, 1] < float(a[1]) - 0.04]
                    if len(front_br):
                        z_need = float(front_br[:, 2].max()) + 0.032
                        f = max(f, (z_need - float(a[2])) / h_ab)
        crown_blocks = []
        for hp in flat_hp:
            if 'brim' not in (hp.name or '').lower() and 'wing' not in (hp.name or '').lower():
                P_g = hp.P
                crown_blocks.append(P_g.reshape(-1, 3))
                if P_g.ndim == 3 and P_g.shape[0] >= 2:
                    crown_blocks.append((0.5 * (P_g[:-1] + P_g[1:])).reshape(-1, 3))
        if crown_blocks:
            host_v = np.vstack(crown_blocks)

    c = a + (b - a) * f

    def _hit_r(orig, dir_u, pad_skin, pad_host=0.0035):
        du = np.asarray(dir_u, float)
        du /= max(float(np.linalg.norm(du)), 1e-9)
        r_sk = (first_hit(orig, du) or 0.095) + pad_skin
        if host_v is not None:
            near_z = host_v[np.abs(host_v[:, 2] - orig[2]) <= 0.022]
            if len(near_z):
                dv = near_z - orig[None, :]
                dv_xy = dv.copy()
                dv_xy[:, 2] = 0.0
                du_xy = np.array([du[0], du[1], 0.0])
                du_xy /= max(float(np.linalg.norm(du_xy)), 1e-9)
                L_xy = np.linalg.norm(dv_xy, axis=1)
                sec = ((dv_xy @ du_xy) / np.maximum(L_xy, 1e-6)) >= math.cos(0.28)
                if sec.any():
                    r_sk = max(r_sk, float(L_xy[sec].max()) + pad_host)
        return r_sk

    n_st = 36
    angs_st = np.linspace(0.0, 2.0 * math.pi, n_st, endpoint=False)
    ds_st = [bk * math.cos(an) + left * math.sin(an) for an in angs_st]
    st_rows = []
    for f_s in np.linspace(f + 0.036, f - 0.036, 4):
        c_s = a + (b - a) * f_s
        rs_s = np.array([_hit_r(c_s, d_s, max(0.005, 0.005 + over), 0.0025) for d_s in ds_st])
        rs_s = 0.50 * rs_s + 0.25 * np.roll(rs_s, 1) + 0.25 * np.roll(rs_s, -1)
        st_rows.append([c_s + d_s * r_v for d_s, r_v in zip(ds_st, rs_s)])
    strap_pt = Part(gid + '_goggle_strap', np.array(st_rows), True, ['body'] * 4, strap_p, rigid_joint='Head')
    parts = [strap_pt]

    h_nose = _hit_r(c, -bk, over, 0.004)
    ends = []
    for k, sx in enumerate((-1.0, 1.0)):
        p_sock = c + left * (x_eye * sx)
        d = -bk + left * (0.12 * sx)
        d /= np.linalg.norm(d)
        h_s = _hit_r(p_sock, d, over, 0.004)
        p0 = p_sock + d * max(0.04, h_s + (0.001 if host_v is not None else -0.004))
        p1 = p_sock + d * max(h_s + 0.015, h_nose + 0.002)
        parts.append(tube(f'{gid}_goggle_cup{k}', [p0, p1], 0.025, cup_p, n=14, rigid_joint='Head'))
        parts.append(rosette(f'{gid}_goggle_rim{k}', p1, d, left, 0.027, rim_p, n=14, thick=0.006, rigid_joint='Head'))
        lp = lens_p
        if slit:
            lp = P('soot', 0.02, [B('top', 0.42, 0.58, 'solid', 'bone')], fabric='leather.polished')
        parts.append(rosette(f'{gid}_goggle_lens{k}', p1 + d * 0.003, d, left, 0.020, lp,
                             n=12, thick=0.005, rigid_joint='Head'))
        ends.append(p1 - d * 0.004 - left * (0.018 * sx))
        d_tmp = -bk * 0.42 + left * (0.91 * sx)
        d_tmp /= np.linalg.norm(d_tmp)
        h_tmp = _hit_r(c, d_tmp, 0.006 + over, 0.0035)
        parts.append(strap(f'{gid}_goggle_tab{k}', [p1 - d * 0.005 + left * (0.022 * sx), c + d_tmp * h_tmp],
                           0.012, strap_p, rigid_joint='Head'))
    br_mid = c + up * 0.003 - bk * (h_nose + 0.006)
    parts.append(strap(gid + '_goggle_bridge', [ends[0], br_mid, ends[1]], 0.010, rim_p, rigid_joint='Head'))
    return _as(parts, 'headgear')


def _fingerless_gloves(gid, cuff_p, palm_p, cuff_f0=0.72):
    """Fingerless tactile/rope/climbing gloves (`is_arm=True`, bare fingers & nails)."""
    parts = []
    for s in (L, R):
        parts.append(sleeve(f'{gid}_cuff_{s[0]}', s, cuff_p, f0=cuff_f0, f1=0.98,
                            ease=0.013, flare=0.004, rows=5, n=20))
        w_pt = J(s + 'Hand')
        idx1, pnk1 = J(s + 'HandIndex1'), J(s + 'HandPinky1')
        knuckles = 0.25 * (idx1 + J(s + 'HandMiddle1') + J(s + 'HandRing1') + pnk1)
        d_hand = knuckles - w_pt
        u_ax = d_hand / np.linalg.norm(d_hand)
        x_ax = (idx1 - pnk1) - u_ax * np.dot(idx1 - pnk1, u_ax)
        x_ax /= np.linalg.norm(x_ax)
        y_ax = np.cross(u_ax, x_ax)
        y_ax /= np.linalg.norm(y_ax)
        rows_arr = []
        for t in np.linspace(0.0, 0.92, 5):
            cc = w_pt + d_hand * t
            rx, ry = 0.041 + 0.006 * t, 0.022 * (1.0 - 0.10 * t)
            rows_arr.append([
                cc + x_ax * (math.cos(an) * rx) + y_ax * (math.sin(an) * ry)
                for an in np.linspace(0.0, 2.0 * math.pi, 20, endpoint=False)
            ])
        palm = Part(f'{gid}_palm_{s[0]}', np.array(rows_arr), True, ['helper-tights'] * 5,
                    palm_p, rigid_joint=s + 'Hand', role='cuff', side=s[0])
        palm.is_arm = True
        parts.append(palm)
    return parts


def _full_gloves(gid, cuff_p, hand_p, cuff_f0=0.66, knuckle_p=None, ring_p=None):
    """Closed 5-finger phalanx-articulated gauntlets / full gloves covering wrist, palm, fingers, and thumb."""
    from ..types.limbs import full_gloves
    return full_gloves(gid, cuff_p, hand_p, f0=cuff_f0, ease=0.014, knuckle_paint=knuckle_p, ring_paint=ring_p)


# ===========================================================================================================
# A1. `two_horns_guide` — Brotherhood of the Two Horns Pass-Master (*Dalil al-Qaranayn*)
# ===========================================================================================================
def _build_a1_two_horns_guide(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    a, b, up, bk, left, _, _, f_brow, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'catch_twins_caravaneers'
    entries = []

    # 1. HEAD: Fleece-lined basalt hood + twin bronze ibex/split-horn crests + moonglass snow-goggles
    gid_h = f'car_{sex}_twohorns_hood'
    hood_p = P('basalt', 0.06, [
        B('bottom', 0.0, 0.032, 'snowleopard_pelage', 'charcoal', 'snowleopard', 0.08),
        B('top', 0.0, 0.022, 'solid', 'saffron'),
    ], fabric=WOOL)
    parts_h = [_as(hood(gid_h + '_hood', hood_p, ease=0.022, ease_low=0.032), 'headgear')]
    parts_h.extend(_goggles(
        gid_h, False,
        P('leather', 0.04, fabric='leather.polished'),
        P('darkfur', 0.05, [B('top', 0.0, 0.008, 'solid', 'bronze')], fabric='leather.buckskin'),
        P('bronze', 0.02, fabric='metal.bronze'),
        P('moonglass', 0.01, [B('top', 0.0, 0.006, 'solid', 'snowleopard')], fabric='glass.moonglass.leaded'),
        over=0.024, host_parts=parts_h
    ))
    c_tmp = a + (b - a) * (f_brow + 0.16)
    horn_p = P('bronze', 0.02, [B('top', 0.0, 0.55, 'stripes', 'soot', 'bronze', 0.018)], fabric='metal.bronze')
    for tag, sx in (('L', 1.0), ('R', -1.0)):
        d_t = left * (0.82 * sx) - bk * 0.25 + up * 0.32
        d_t /= np.linalg.norm(d_t)
        h_t = (first_hit(c_tmp, d_t) or 0.092) + 0.026
        root_h = c_tmp + d_t * h_t
        parts_h.append(rosette(f'{gid_h}_horn_mount_{tag}', root_h, d_t, up, 0.020, horn_p,
                               n=10, thick=0.008, rigid_joint='Head'))
        h_pts = [
            root_h,
            root_h + left * (0.040 * sx) + up * 0.055 - bk * 0.012,
            root_h + left * (0.052 * sx) + up * 0.115 + bk * 0.032,
            root_h + left * (0.028 * sx) + up * 0.148 + bk * 0.075,
        ]
        parts_h.append(horn(f'{gid_h}_ibex_horn_{tag}', h_pts, 0.016, 0.004, horn_p,
                            n=10, rows=9, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Two Horns Pass-Master Ibex-Crested Snow-Goggle Hood',
                                    'head', culture, parts_h, covers_hair=True, covers_face=False))

    # 2. TORSO: Reversible charcoal/saffron coat w/ unbuttoning lava-tube vent lapel, snow-leopard collar & crossed sash
    gid_t = f'car_{sex}_twohorns_coat'
    parts_t = []
    coat_p = P('charcoal', 0.05, [
        B('top', 0.0, 0.022, 'solid', 'saffron'),
        B('bottom', 0.0, 0.028, 'solid', 'saffron'),
        B('bottom', 0.028, 0.105, 'two_horns_brocade', 'saffron', 'basalt', 0.085),
    ], [
        PN(0.14, 0.36, 'two_horns_brocade', 'saffron', 'charcoal', 0.20),
        PN(0.64, 0.86, 'two_horns_brocade', 'saffron', 'charcoal', 0.20),
        # Unbuttoned reversible saffron lava-tube vent lapel turned back on right chest
        PN(0.50, 0.61, 'solid', 'saffron', 'charcoal', 1.0, down=0.28),
        PN(0.47, 0.50, 'solid', 'madder', 'charcoal', 1.0, down=0.34),
    ], fabric=WOOL)
    flare_t = 0.10 if sex == 'm' else 0.14
    parts_t.append(torso_tube(gid_t + '_coat', TOP, KNEE + 0.02, 0.018, coat_p,
                              n=48, rows=20, hang_from=WAIST - 0.02, flare=flare_t,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    sl_fleece = P('snowleopard', 0.08, [
        B('bottom', 0.0, 0.020, 'solid', 'charcoal'),
    ], [PN(0.0, 1.0, 'snowleopard_pelage', 'charcoal', 'snowleopard', 0.12)], fabric='fur.yak')
    parts_t.append(collar_disc(gid_t + '_leopard_collar', 0.080, sl_fleece,
                               drop=0.066, rows=8, scallop=0.05, ease=0.020))
    parts_t.append(pauldron(gid_t + '_sh_L', L, sl_fleece, reach=0.30, ease=0.023, flare_end=0.96))
    parts_t.append(pauldron(gid_t + '_sh_R', R, sl_fleece, reach=0.30, ease=0.023, flare_end=0.96))

    sash_p = P('madder', 0.05, [
        B('top', 0.0, 0.008, 'solid', 'saffron'),
        B('bottom', 0.0, 0.008, 'solid', 'saffron'),
    ], fabric=WOOL)
    parts_t.append(crossed_sash(gid_t + '_sash', sash_p, width=0.052, ease=0.023))
    parts_t.extend(button_row(gid_t + '_vent_btns', TOP - 0.03, CHEST - 0.06, n_buttons=4,
                              paint=P('bronze', 0.02, fabric='metal.bronze'), ease=0.023))
    belt_p = P('leather', 0.05, [B('top', 0.0, 0.010, 'solid', 'bronze'),
                                 B('bottom', 0.0, 0.010, 'solid', 'bronze')], fabric='leather.polished')
    parts_t.extend(pouch_belt(gid_t, belt_p, P('darkfur', 0.05, [B('top', 0.0, 0.02, 'solid', 'saffron')],
                                               fabric='leather.buckskin'), ease=0.025))
    sl_p = P('charcoal', 0.05, [
        B('bottom', 0.0, 0.025, 'solid', 'saffron'),
        B('bottom', 0.025, 0.075, 'snowleopard_pelage', 'charcoal', 'snowleopard', 0.05),
    ], fabric=WOOL)
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Two Horns Reversible Charcoal-Saffron Pass-Master Coat',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Wool-felt fingerless climbing mitts
    gid_g = f'car_{sex}_twohorns_mitts'
    e_g = assemble_garment(
        gid_g, 'Two Horns Wool-Felt Fingerless Climbing Mitts', 'gloves', culture,
        _fingerless_gloves(
            gid_g,
            P('basalt', 0.06, [B('top', 0.0, 0.016, 'solid', 'saffron')], fabric='cloth.felt.boiled'),
            P('smokebuck', 0.05, [B('bottom', 0.0, 0.010, 'solid', 'charcoal')], fabric='leather.buckskin')
        )
    )
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # 4. LEGS: Tucked quilted basalt mountain breeches
    gid_l = f'car_{sex}_twohorns_breeches'
    leg_p = P('basalt', 0.05, [
        B('top', 0.35, 0.52, 'snowleopard_pelage', 'charcoal', 'snowleopard', 0.06),
        B('bottom', 0.0, 0.035, 'solid', 'saffron'),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'charcoal', 'basalt', 0.10)], fabric='cloth.quilted.diamond')
    entries.append(assemble_garment(gid_l, 'Two Horns Quilted Pass-Climbing Breeches', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.015, ease_end=0.010), legged=True))

    # 5. FEET: 3-wrap iron-crampon mountaineering boots
    gid_f = f'car_{sex}_twohorns_boots'
    parts_f = boots(
        gid_f,
        P('iron', 0.04, [B('bottom', 0.0, 0.012, 'dentils', 'silver', 'soot', 0.02)], fabric='metal.iron'),
        P('basalt', 0.05, [B('bottom', 0.0, 0.025, 'solid', 'iron')], fabric='leather.polished'),
        top=0.52, wraps=3,
        wrap_paint=P('iron', 0.03, [B('top', 0.0, 0.008, 'solid', 'bronze')], fabric='metal.iron'),
        cuff_paint=sl_fleece, ease_top=0.032
    )
    for s in (L, R):
        sgn = 1.0 if s == L else -1.0
        ft = J(s + 'Foot')
        cr_pos = np.array([ft[0] + 0.048 * sgn, ft[1] - 0.045, max(0.022, float(ft[2]) * 0.35)])
        parts_f.append(tube(f'{gid_f}_crampon_bar_{s[0]}',
                            [cr_pos + np.array([0.0, 0.045, 0.0]), cr_pos - np.array([0.0, 0.055, 0.0])],
                            0.007, P('iron', 0.02, fabric='metal.iron'), n=8, rigid_joint=s + 'Foot'))
    entries.append(assemble_garment(gid_f, 'Two Horns 3-Wrap Iron-Crampon Mountaineering Boots',
                                    'feet', culture, parts_f))

    # 6. BACK: Coiled guide-rope, 4 notched Split-Tally sticks (4%+4%), Brass Cinder-Viper Hook & Guide's Needle
    gid_b = f'car_{sex}_twohorns_pack'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    pack_c = back_a + d_bk * 0.048
    parts_b.append(_box(gid_b + '_frame', pack_c, d_bk, 0.23, 0.28, 0.095,
                        P('bark', 0.06, [B('top', 0.0, 0.025, 'solid', 'bronze'),
                                         B('bottom', 0.0, 0.025, 'solid', 'bronze')], fabric='leather.buckskin'),
                        rigid_joint='Spine2'))
    # Coiled yak-hair guide-rope loop mounted flush on outer pack face
    rope_c = pack_c + d_bk * 0.052
    rope_pts = [
        rope_c + np.array([math.cos(an) * 0.088, 0.0, math.sin(an) * 0.095])
        for an in np.linspace(0.0, 2.0 * math.pi, 17)
    ]
    parts_b.append(horn(gid_b + '_guide_rope', rope_pts, 0.017, 0.017,
                        P('oat', 0.08, [B('top', 0.0, 0.50, 'stripes', 'yakbrown', 'oat', 0.02)], fabric=COTTON),
                        n=10, rows=17, rigid_joint='Spine2'))
    # 4 Notched Split-Tally sticks (4% Strongbow + 4% Stair) bundled across top of pack
    tally_p = P('bamboo', 0.04, [
        B('top', 0.15, 0.85, 'dentils', 'madder', 'bamboo', 0.022),
        B('bottom', 0.0, 0.030, 'solid', 'saffron'),
    ], fabric='leather.polished')
    for k_t in range(4):
        tz = pack_c[2] + 0.145 + (k_t % 2) * 0.018
        ty = pack_c[1] + 0.020 + (k_t // 2) * 0.020
        parts_b.append(tube(f'{gid_b}_split_tally_{k_t}',
                            [np.array([-0.145, ty, tz]), np.array([0.145, ty, tz])],
                            0.010, tally_p, n=8, rigid_joint='Spine2'))
    # Brass Cinder-Viper Hook (diagonal right) & 0.7 m Guide's Needle piton-ring (diagonal left)
    brass_p = P('bronze', 0.02, fabric='metal.bronze')
    iron_p = P('iron', 0.02, [B('top', 0.0, 0.04, 'solid', 'silver')], fabric='metal.iron')
    vh_top = pack_c + np.array([0.125, 0.032, 0.210])
    vh_bot = pack_c + np.array([-0.085, 0.032, -0.210])
    parts_b.append(tube(gid_b + '_viper_shaft', [vh_bot, vh_top], 0.010,
                        P('umber', 0.05, [B('top', 0.0, 0.04, 'solid', 'bronze')]), n=8, rigid_joint='Spine2'))
    parts_b.append(horn(gid_b + '_viper_hook',
                        [vh_top, vh_top + np.array([0.035, 0.0, 0.040]), vh_top + np.array([0.065, 0.0, 0.005])],
                        0.011, 0.004, brass_p, n=8, rows=7, rigid_joint='Spine2'))
    gn_top = pack_c + np.array([-0.125, 0.040, 0.220])
    gn_bot = pack_c + np.array([0.085, 0.040, -0.230])
    parts_b.append(horn(gid_b + '_guides_needle', [gn_top, gn_bot], 0.012, 0.004, iron_p,
                        n=8, rows=8, rigid_joint='Spine2'))
    parts_b.append(rosette(gid_b + '_piton_ring', gn_top, d_bk, np.array([1.0, 0.0, 0.0]),
                           0.024, iron_p, n=12, thick=0.007, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, belt_p))
    entries.append(assemble_garment(gid_b, 'Two Horns Split-Tally, Cinder-Viper Hook & Guide-Needle Pack',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# A2. `jabal_salt_syndic` — Train of Jabal Salt-Syndic & Wakil (Urban Dasri tower-house salt master)
# ===========================================================================================================
def _build_a2_jabal_salt_syndic(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE, ANKLE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE, core.ANKLE
    a, b, up, bk, left, _, _, f_brow, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'catch_twins_caravaneers'
    entries = []

    # 1. HEAD: Smooth Yemeni mashadda silk turban + bronze ibex-horn brooch over tucked alkali nape-veil
    gid_h = f'car_{sex}_syndic_turban'
    a_s, b_s, up_s, bk_s, left_s, _, _, f_brow_s, _ = _head_landmarks()
    mashadda_base = P('ebadindigo', 0.04, [
        B('bottom', 0.0, 0.018, 'solid', 'rabbitgold'),
        B('top', 0.0, 0.022, 'solid', 'dragoncrimson'),
    ], [PN(0.0, 1.0, 'dasri_juss_ikat', 'jusschalk', 'dragoncrimson', 0.14)], fabric='cloth.silk')
    mashadda_wrap = P('dragoncrimson', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'jusschalk'),
        B('bottom', 0.0, 0.010, 'solid', 'rabbitgold'),
    ], [PN(0.0, 1.0, 'stripes', 'rabbitgold', 'dragoncrimson', 0.022)], fabric='cloth.silk')
    veil_p = P('jusschalk', 0.04, [
        B('bottom', 0.0, 0.028, 'dasri_juss_ikat', 'dragoncrimson', 'ebadindigo', 0.05),
    ], fabric=COTTON)
    t_dome = turban(gid_h + '_dome', mashadda_base, f0=0.60, f1=1.08, bulge=0.028, ease=0.024, rows=12, n=40)
    t_band = crown_band(gid_h + '_mashadda_fold', mashadda_wrap, f0=0.58, f1=0.79, ease=0.026, flare=0.007, rows=6, n=40)
    c_br_s = a_s + (b_s - a_s) * (f_brow_s + 0.14)
    h_br_s = (first_hit(c_br_s, -bk_s) or 0.098) + 0.031
    brooch_p = P('bronze', 0.02, [B('top', 0.0, 0.008, 'solid', 'rabbitgold')], fabric='metal.bronze')
    parts_h = _as([
        hood(gid_h + '_nape_veil', veil_p, ease=0.015, ease_low=0.026, open_front=1.32, high=0.86, low=-0.34, rows=12, n=36),
        t_dome,
        t_band,
        rosette(gid_h + '_ibex_brooch', c_br_s - bk_s * h_br_s, -bk_s, up_s, 0.024, brooch_p, n=12, thick=0.008, rigid_joint='Head'),
    ], 'headgear')
    entries.append(assemble_garment(gid_h, 'Jabal Salt-Syndic Mashadda Turban & Ibex-Horn Brooch',
                                    'head', culture, parts_h, covers_hair=True, covers_face=False))

    # 2. TORSO: Fired-brick madder & indigo stepped-hem coat over crisp white juss-pleated under-tunic + jambiya
    gid_t = f'car_{sex}_syndic_coat'
    parts_t = []
    coat_p = P('dragoncrimson', 0.04, [
        B('top', 0.0, 0.020, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.026, 'steps', 'jusschalk', 'ebadindigo', 0.055),
        B('bottom', 0.026, 0.115, 'dasri_juss_ikat', 'jusschalk', 'dragoncrimson', 0.085),
    ], [
        # Crisp white juss-pleated center under-tunic visible between open coat lapels
        PN(0.42, 0.58, 'fluted', 'jusschalk', 'linen', 0.09),
        PN(0.39, 0.42, 'dasri_juss_ikat', 'rabbitgold', 'ebadindigo', 0.07),
        PN(0.58, 0.61, 'dasri_juss_ikat', 'rabbitgold', 'ebadindigo', 0.07),
    ], fabric='cloth.bazin.damask')
    parts_t.append(torso_tube(gid_t + '_coat', TOP, ANKLE + 0.10 if sex == 'f' else KNEE - 0.04, 0.016, coat_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.14 if sex == 'm' else 0.18,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('ebadindigo', 0.03, [
        B('top', 0.0, 0.010, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.010, 'solid', 'jusschalk'),
    ], fabric='cloth.silk'), high=0.036))

    sash_p = P('ebadindigo', 0.04, [
        B('top', 0.0, 0.012, 'solid', 'rabbitgold'),
        B('bottom', 0.0, 0.012, 'solid', 'rabbitgold'),
    ], [PN(0.0, 1.0, 'dasri_juss_ikat', 'jusschalk', 'ebadindigo', 0.06)], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_sash', WAIST + 0.042, WAIST - 0.042, 0.021, sash_p,
                              rows=5, n=42, hull_from=WAIST + 0.08, role='belt'))

    # Center-sash curved Yemeni brass jambiya dagger + hip pink Halite Assay Prism
    p_jam = chest_front(WAIST + 0.002, 0.024, x=0.0)
    brass_p = P('brass', 0.02, [B('top', 0.0, 0.25, 'fret', 'rabbitgold', 'umber', 0.025)], fabric='metal.gold')
    parts_t.append(tube(gid_t + '_jambiya_hilt',
                        [p_jam + np.array([-0.012, 0.0, 0.055]), p_jam + np.array([0.0, 0.0, 0.005])],
                        0.014, P('bone', 0.03, [B('top', 0.0, 0.015, 'solid', 'brass')]),
                        n=10, rigid_joint='Hips'))
    parts_t.append(horn(gid_t + '_jambiya_sheath', [
        p_jam + np.array([0.0, 0.0, 0.005]),
        p_jam + np.array([0.018, -0.004, -0.048]),
        p_jam + np.array([0.068, 0.004, -0.022]),
    ], 0.017, 0.005, brass_p, n=10, rows=8, rigid_joint='Hips'))

    d_prism = np.array([-0.78, -0.62, 0.0])
    d_prism /= np.linalg.norm(d_prism)
    p_pr = surface_out(spine_at(WAIST - 0.01), d_prism, 0.024, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_halite_prism',
                        [p_pr + np.array([0.0, 0.0, 0.036]), p_pr - np.array([0.0, 0.0, 0.036])],
                        0.016, P('halitepink', 0.01, [B('top', 0.0, 0.014, 'solid', 'brass'),
                                                      B('bottom', 0.0, 0.012, 'solid', 'brass')],
                                 fabric='glass.moonglass.leaded'),
                        n=6, rigid_joint='Hips'))

    sl_p = P('dragoncrimson', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'jusschalk'),
        B('bottom', 0.025, 0.085, 'dasri_juss_ikat', 'jusschalk', 'ebadindigo', 0.045),
    ], fabric='cloth.bazin.damask')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.016, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Jabal Salt-Syndic Juss-Ikat Coat, Jambiya & Halite Prism',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Kidskin tally-gloves with indigo/gold tiraz cuffs & signet ring
    gid_g = f'car_{sex}_syndic_gloves'
    entries.append(assemble_garment(
        gid_g, 'Jabal Salt-Syndic Kidskin Tally-Gloves', 'gloves', culture,
        _full_gloves(
            gid_g,
            P('ebadindigo', 0.03, [B('top', 0.0, 0.015, 'solid', 'rabbitgold'),
                                   B('bottom', 0.0, 0.015, 'solid', 'jusschalk')], fabric='cloth.silk'),
            P('jusschalk', 0.03, fabric='leather.polished'),
            ring_p=P('rabbitgold', 0.02, [B('top', 0.0, 0.008, 'solid', 'oasisturq')], fabric='metal.gold')
        )
    ))

    # 4. LEGS: Gathered Dasri linen trousers
    gid_l = f'car_{sex}_syndic_trousers'
    trou_p = P('jusschalk', 0.04, [
        B('bottom', 0.0, 0.055, 'dasri_juss_ikat', 'jusschalk', 'ebadindigo', 0.04),
    ], fabric=COTTON)
    entries.append(assemble_garment(gid_l, 'Jabal Salt-Syndic Gathered Juss-Linen Trousers', 'legs', culture,
                                    trousers(gid_l, trou_p, ease=0.020, ease_end=0.014, bag=0.03), legged=True))

    # 5. FEET: Polished madder & brass tower-house boots
    gid_f = f'car_{sex}_syndic_boots'
    entries.append(assemble_garment(
        gid_f, 'Jabal Salt-Syndic Polished Crimson & Brass Boots', 'feet', culture,
        boots(gid_f, P('umber', 0.06, [B('bottom', 0.0, 0.014, 'solid', 'brass')]),
              P('dragoncrimson', 0.03, [B('top', 0.0, 0.035, 'dasri_juss_ikat', 'jusschalk', 'ebadindigo', 0.03),
                                        B('bottom', 0.0, 0.020, 'solid', 'brass')], fabric='leather.polished'),
              top=0.44, ease_top=0.030)
    ))

    # 6. BACK: Cedar & brass salt-ledger strongbox + reference pink halite crystal
    gid_b = f'car_{sex}_syndic_strongbox'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.015), d_bk, 0.021, bvh=core.BVH_T)
    box_c = back_a + d_bk * 0.055
    box_p = P('saddle', 0.04, [
        B('top', 0.0, 0.024, 'solid', 'brass'),
        B('bottom', 0.0, 0.024, 'solid', 'brass'),
    ], [PN(0.12, 0.88, 'dasri_juss_ikat', 'jusschalk', 'ebadindigo', 0.14)], fabric='leather.polished')
    parts_b.append(_box(gid_b + '_cedar_box', box_c, d_bk, 0.25, 0.29, 0.11, box_p, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_seal_scroll',
                        [box_c + np.array([-0.13, 0.01, 0.158]), box_c + np.array([0.13, 0.01, 0.158])],
                        0.026, P('ebadindigo', 0.03, [B('top', 0.0, 0.03, 'solid', 'brass'),
                                                      B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='cloth.silk'),
                        n=12, rigid_joint='Spine2'))
    parts_b.append(rosette(gid_b + '_ibex_lock', box_c + d_bk * 0.056, d_bk, np.array([1.0, 0.0, 0.0]),
                           0.032, P('brass', 0.02, fabric='metal.gold'), n=12, thick=0.009, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('leather', 0.04, [B('top', 0.0, 0.008, 'solid', 'brass')],
                                        fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Jabal Salt-Syndic Cedar & Brass Salt-Ledger Strongbox',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# A3. `jabal_camel_drover` — Catch Halite-Pan & High-Wagon Teamster (Salt al-Ban / Route B)
# ===========================================================================================================
def _build_a3_jabal_camel_drover(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'catch_twins_caravaneers'
    entries = []

    # 1. HEAD: Full karaburan alkali wrap (hood + litham faceplate + horn-slit soda-dust goggles)
    gid_h = f'car_{sex}_drover_litham'
    hood_p = P('shroudoat', 0.07, [
        B('bottom', 0.0, 0.035, 'salt_frost_alkali', 'brucitewhite', 'shroudoat', 0.08),
    ], fabric='cloth.weave.burlap')
    litham_p = P('ebadindigo', 0.05, [
        B('top', 0.0, 0.020, 'solid', 'saltlime'),
        B('bottom', 0.0, 0.028, 'salt_frost_alkali', 'brucitewhite', 'ebadindigo', 0.08),
    ], fabric=COTTON)
    parts_h = [
        _as(hood(gid_h + '_hood', hood_p, ease=0.028, ease_low=0.048), 'headgear'),
        _as(sculpted_faceplate(gid_h + '_litham', litham_p, f_top=0.44, f_bot=-0.06,
                               ease=0.013, span=0.46, rows=14, cols=23), 'headgear'),
    ]
    parts_h.extend(_goggles(
        gid_h, True,
        P('hide', 0.05, fabric='leather.buckskin'),
        P('darkfur', 0.05, [B('top', 0.0, 0.008, 'solid', 'bone')], fabric='leather.buckskin'),
        P('bone', 0.03, fabric='leather.polished'),
        P('soot', 0.02),
        over=0.006, slit=True
    ))
    entries.append(assemble_garment(gid_h, 'Catch Karaburan Litham Veil & Horn-Slit Soda Goggles',
                                    'head', culture, parts_h, covers_hair=True, covers_face=True))

    # 2. TORSO: Salt-frosted burlap/oilskin coat + rawhide halite-carrying shoulder yoke
    gid_t = f'car_{sex}_drover_coat'
    parts_t = []
    coat_p = P('shroudoat', 0.07, [
        B('bottom', 0.0, 0.16, 'salt_frost_alkali', 'brucitewhite', 'shroudoat', 0.14),
    ], [
        PN(0.0, 1.0, 'salt_frost_alkali', 'halitepink', 'taupe', 0.42),
        PN(0.47, 0.53, 'solid', 'hide', 'taupe', 1.0, down=0.34),
    ], fabric='cloth.oiled.alkali')
    parts_t.append(torso_tube(gid_t + '_coat', TOP, KNEE + 0.04, 0.018, coat_p,
                              n=46, rows=20, hang_from=WAIST - 0.02, flare=0.11,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    yoke_p = P('hide', 0.06, [
        B('bottom', 0.0, 0.022, 'dentils', 'saltlime', 'buck', 0.035),
        B('top', 0.0, 0.018, 'solid', 'umber'),
    ], fabric='leather.buckskin')
    parts_t.append(collar_disc(gid_t + '_rawhide_yoke', 0.088, yoke_p,
                               drop=0.072, rows=8, scallop=0.04, ease=0.020))
    parts_t.append(pauldron(gid_t + '_yoke_pad_L', L, yoke_p, reach=0.32, ease=0.024, flare_end=0.96))
    parts_t.append(pauldron(gid_t + '_yoke_pad_R', R, yoke_p, reach=0.32, ease=0.024, flare_end=0.96))
    rope_belt_p = P('oat', 0.08, [B('top', 0.0, 0.50, 'stripes', 'umber', 'oat', 0.02)], fabric='cloth.weave.burlap')
    parts_t.extend(pouch_belt(gid_t, rope_belt_p,
                              P('buck', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'saltlime')],
                                fabric='leather.buckskin'), ease=0.024))
    sl_p = P('taupe', 0.06, [
        B('bottom', 0.0, 0.075, 'salt_frost_alkali', 'brucitewhite', 'taupe', 0.06),
    ], fabric='cloth.oiled.alkali')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.026, rows=9))
    entries.append(assemble_garment(gid_t, 'Catch Salt-Frosted Teamster Coat & Rawhide Halite Yoke',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Salted-rawhide work gauntlets
    gid_g = f'car_{sex}_drover_gloves'
    entries.append(assemble_garment(
        gid_g, 'Catch Salted-Rawhide Halite Gauntlets', 'gloves', culture,
        _full_gloves(
            gid_g,
            P('hide', 0.06, [B('top', 0.0, 0.022, 'solid', 'saltlime')], fabric='leather.buckskin'),
            P('buck', 0.06, [B('bottom', 0.0, 0.015, 'solid', 'saltlime')], fabric='leather.buckskin')
        )
    ))

    # 4. LEGS: Wide desert trousers dusted with alkali
    gid_l = f'car_{sex}_drover_trousers'
    leg_p = P('dunesand', 0.06, [
        B('bottom', 0.0, 0.095, 'salt_frost_alkali', 'brucitewhite', 'dunesand', 0.08),
    ], fabric=COTTON)
    entries.append(assemble_garment(gid_l, 'Catch Wide Alkali-Frosted Teamster Trousers', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.020, ease_end=0.016, bag=0.03), legged=True))

    # 5. FEET: 4-wrap alkali-waxed rawhide-sole boots
    gid_f = f'car_{sex}_drover_boots'
    entries.append(assemble_garment(
        gid_f, 'Catch 4-Wrap Alkali-Waxed Rawhide-Sole Boots', 'feet', culture,
        boots(gid_f, P('brucitewhite', 0.06, fabric='leather.buckskin'),
              P('hide', 0.06, [B('bottom', 0.0, 0.03, 'solid', 'saltlime')], fabric='leather.buckskin'),
              top=0.50, wraps=4, wrap_paint=P('shroudoat', 0.07, fabric='cloth.weave.burlap'), ease_top=0.032)
    ))

    # 6. BACK: Timber salt-hod w/ two cut pink halite slabs + spare mule alkali-goggles + ash-boiled water gourd
    gid_b = f'car_{sex}_drover_hod'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    hod_c = back_a + d_bk * 0.045
    parts_b.append(_box(gid_b + '_timber_hod', hod_c, d_bk, 0.24, 0.26, 0.085,
                        P('umber', 0.06, [B('top', 0.0, 0.02, 'solid', 'hide'),
                                          B('bottom', 0.0, 0.02, 'solid', 'hide')], fabric='leather.buckskin'),
                        rigid_joint='Spine2'))
    slab_p = P('halitepink', 0.02, [
        B('top', 0.0, 0.025, 'solid', 'brucitewhite'),
        B('bottom', 0.0, 0.020, 'solid', 'saltlime'),
    ], fabric='glass.moonglass.leaded')
    for idx_s, dx_s in enumerate((-0.055, 0.055)):
        parts_b.append(_box(f'{gid_b}_halite_slab_{idx_s}',
                            hod_c + np.array([dx_s, 0.052, 0.055]), d_bk, 0.095, 0.22, 0.048,
                            slab_p, rigid_joint='Spine2'))
    # Ash-boiled water gourd on left side of hod + spare mule alkali-goggles on right side
    g_pos = hod_c + np.array([0.132, 0.015, -0.045])
    gourd_p = P('ochre', 0.04, [B('top', 0.0, 0.02, 'solid', 'nahhascopper')], fabric='leather.polished')
    parts_b.append(blob(gid_b + '_gourd_lo', g_pos, (0.085, 0.085, 0.095), gourd_p,
                        n=12, rows=5, out=np.array([1.0, 0.0, 0.0]), rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_gourd_hi', g_pos + np.array([0.0, 0.0, 0.065]), (0.055, 0.055, 0.060), gourd_p,
                        n=10, rows=4, out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))
    for k_m, dz_m in enumerate((0.035, -0.020)):
        mg_c = hod_c + np.array([-0.128, 0.020, dz_m])
        parts_b.append(rosette(f'{gid_b}_mule_goggle_{k_m}', mg_c, np.array([-1.0, 0.0, 0.0]), d_bk,
                               0.028, P('bone', 0.03, [B('top', 0.4, 0.6, 'solid', 'soot')]),
                               n=12, thick=0.010, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('hide', 0.05, fabric='leather.buckskin')))
    entries.append(assemble_garment(gid_b, 'Catch Timber Salt-Hod, Pink Halite Slabs & Mule Goggles',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# A4. `iziz_tube_packmaster` — Izani *Getmastarz* / *Goldanda* Dark-Tube Pack-Master (Route A Lava Tubes)
# ===========================================================================================================
def _build_a4_iziz_tube_packmaster(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    a, b, up, bk, left, _, _, f_brow, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'catch_twins_caravaneers'
    entries = []

    # 1. HEAD: Patrician pleated felt tower_hat + ear-flaps + brow brass tube-lamp & smoked sprint-visor
    gid_h = f'car_{sex}_packmaster_hat'
    parts_h = []
    hat_p = P('crimson', 0.04, [
        B('bottom', 0.0, 0.020, 'solid', 'gold'),
        B('top', 0.0, 0.022, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'fluted', 'gold', 'crimson', 0.07)], fabric='cloth.felt.boiled')
    parts_h.append(tower_hat(gid_h + '_skiadion', 0.155,
                             lambda s: 0.96 + 0.14 * math.sin(s * math.pi * 0.85),
                             hat_p, f=0.52, ease=0.020, rows=10, n=36))
    flap_p = P('iron', 0.05, [B('bottom', 0.0, 0.015, 'solid', 'gold')], fabric=WOOL)
    for tag, sx in (('L', 1.0), ('R', -1.0)):
        parts_h.append(wing(f'{gid_h}_earflap_{tag}', sx, 0.022, 0.085, flap_p,
                            rows=5, cols=7, rise=-0.02, curl=0.01, f=0.46))
    # Brow brass carbide tube-lamp + upturned smoked sprint-visor
    c_lamp = a + (b - a) * (f_brow + 0.14)
    h_l = (first_hit(c_lamp, -bk) or 0.100) + 0.026
    p_lamp = c_lamp - bk * h_l
    parts_h.append(tube(gid_h + '_tube_lamp', [p_lamp + bk * 0.012, p_lamp - bk * 0.018],
                        0.022, P('brass', 0.02, fabric='metal.bronze'), n=12, rigid_joint='Head'))
    parts_h.append(rosette(gid_h + '_lamp_lens', p_lamp - bk * 0.020, -bk, left, 0.019,
                           P('amber', 0.01, [B('top', 0.0, 0.008, 'solid', 'neonyellow')],
                             fabric='glass.moonglass.leaded'),
                           n=12, thick=0.006, rigid_joint='Head'))
    c_vis = a + (b - a) * (f_brow + 0.02)
    vis_pts = []
    for an_v in np.linspace(-0.28 * math.pi, 0.28 * math.pi, 9):
        dv = -bk * math.cos(an_v) + left * math.sin(an_v)
        dv /= np.linalg.norm(dv)
        hv = (first_hit(c_vis, dv) or 0.098) + 0.022
        vis_pts.append(c_vis + dv * hv)
    parts_h.append(horn(gid_h + '_sprint_visor', vis_pts, 0.011, 0.011,
                        P('charcoal', 0.02, [B('top', 0.0, 0.005, 'solid', 'brass')], fabric='beads.glass'),
                        n=8, rows=9, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Izani Dark-Tube Skiadion Hat, Carbide Lamp & Sprint-Visor',
                                    'head', culture, parts_h, covers_hair=True, covers_face=False))

    # 2. TORSO: Split-skirted Getmastarz (crimson/iron) & Goldanda (gold/madder) coat + bronze lavacicle pauldrons
    gid_t = f'car_{sex}_packmaster_coat'
    parts_t = []
    coat_p = P('crimson', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.028, 'fret', 'gold', 'iron', 0.05),
        B('bottom', 0.028, 0.090, 'paisley_vine', 'gold', 'madder', 0.08),
    ], [
        PN(0.0, 0.48, 'paisley_vine', 'iron', 'crimson', 0.20),
        PN(0.52, 1.0, 'paisley_vine', 'gold', 'madder', 0.20),
        PN(0.47, 0.53, 'solid', 'iron', 'gold', 1.0),
    ], fabric=WOOL)
    parts_t.append(torso_tube(gid_t + '_coat', TOP, KNEE + 0.03, 0.017, coat_p,
                              n=48, rows=20, hang_from=WAIST - 0.02, flare=0.13,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('iron', 0.03, [B('top', 0.0, 0.010, 'solid', 'gold')],
                                         fabric='leather.polished'), high=0.036))
    lava_p = P('bronze', 0.02, [
        B('bottom', 0.0, 0.022, 'dentils', 'iron', 'bronze', 0.03),
    ], [PN(0.0, 1.0, 'lorica_lames', 'gold', 'bronze', 0.07)], fabric='metal.bronze')
    parts_t.append(pauldron(gid_t + '_lavacicle_L', L, lava_p, reach=0.35, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_lavacicle_R', R, lava_p, reach=0.35, ease=0.024, flare_end=0.98))

    belt_p = P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'gold'),
                                 B('bottom', 0.0, 0.008, 'solid', 'gold')], fabric='leather.polished')
    parts_t.extend(pouch_belt(gid_t, belt_p, P('crimson', 0.04, [B('top', 0.0, 0.02, 'solid', 'gold')],
                                               fabric='leather.polished'), ease=0.025))
    # Izani Talent brass coin-tube at right hip
    d_ct = np.array([-0.82, -0.57, 0.0])
    d_ct /= np.linalg.norm(d_ct)
    p_ct = surface_out(spine_at(WAIST - 0.015), d_ct, 0.025, bvh=core.BVH_T)
    parts_t.append(tube(gid_t + '_talent_cointube',
                        [p_ct + np.array([0.0, 0.0, 0.050]), p_ct - np.array([0.0, 0.0, 0.050])],
                        0.015, P('gold', 0.02, [B('top', 0.0, 0.2, 'stripes', 'iron', 'gold', 0.015)],
                                 fabric='metal.gold'),
                        n=12, rigid_joint='Hips'))
    sl_p = P('iron', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('bottom', 0.025, 0.075, 'paisley_vine', 'gold', 'crimson', 0.045),
    ], fabric='leather.polished')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Izani Getmastarz-Goldanda Lava-Tube Coat & Lavacicle Pauldrons',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Brass-and-iron knuckled leather gauntlets
    gid_g = f'car_{sex}_packmaster_gauntlets'
    knuck_plate_p = P('iron', 0.03, [
        B('top', 0.0, 0.005, 'solid', 'gold'),
        B('bottom', 0.0, 0.005, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'lorica_lames', 'bronze', 'iron', 0.025)], fabric='metal.bronze')
    entries.append(assemble_garment(
        gid_g, 'Izani Brass-Knuckled Dark-Tube Gauntlets', 'gloves', culture,
        _full_gloves(
            gid_g,
            P('crimson', 0.04, [B('top', 0.0, 0.018, 'solid', 'gold')], fabric='leather.polished'),
            P('leather', 0.04, fabric='leather.polished'),
            knuckle_p=knuck_plate_p
        )
    ))

    # 4. LEGS: Quilted dark-tube breeches
    gid_l = f'car_{sex}_packmaster_breeches'
    leg_p = P('iron', 0.05, [
        B('bottom', 0.0, 0.035, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'madder', 'iron', 0.11)], fabric='cloth.quilted.diamond')
    entries.append(assemble_garment(gid_l, 'Izani Quilted Lava-Tube Breeches', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.016, ease_end=0.011), legged=True))

    # 5. FEET: Hobnailed basalt-scree boots
    gid_f = f'car_{sex}_packmaster_boots'
    entries.append(assemble_garment(
        gid_f, 'Izani Hobnailed Lava-Scree Boots', 'feet', culture,
        boots(gid_f,
              P('iron', 0.04, [B('bottom', 0.0, 0.015, 'beads', 'brass', 'iron', 0.02)], fabric='metal.iron'),
              P('leather', 0.05, [B('top', 0.0, 0.035, 'fret', 'gold', 'crimson', 0.03),
                                  B('bottom', 0.0, 0.020, 'solid', 'bronze')], fabric='leather.polished'),
              top=0.48, wraps=2, wrap_paint=P('bronze', 0.03, fabric='metal.bronze'), ease_top=0.031)
    ))

    # 6. BACK: Lava-tube pack-saddle pannier + Canary-Lichen H2S-detector cage
    gid_b = f'car_{sex}_packmaster_pannier'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    pan_c = back_a + d_bk * 0.052
    parts_b.append(_box(gid_b + '_pannier', pan_c, d_bk, 0.25, 0.27, 0.105,
                        P('leather', 0.05, [B('top', 0.0, 0.025, 'solid', 'bronze'),
                                            B('bottom', 0.0, 0.025, 'solid', 'iron')],
                          [PN(0.15, 0.85, 'paisley_vine', 'gold', 'crimson', 0.14)], fabric='leather.polished'),
                        rigid_joint='Spine2'))
    # Brass Canary-Lichen Cage housing golden H2S-detecting Chrysothrix lichen
    cage_c = pan_c + np.array([0.0, 0.010, 0.185])
    parts_b.append(tube(gid_b + '_lichen_cage',
                        [cage_c - np.array([0.0, 0.0, 0.050]), cage_c + np.array([0.0, 0.0, 0.050])],
                        0.042, P('brass', 0.02, [
                            B('top', 0.0, 0.016, 'solid', 'bronze'),
                            B('bottom', 0.0, 0.016, 'solid', 'bronze'),
                        ], [PN(0.0, 1.0, 'vstripes', 'brass', 'neonyellow', 0.022)], fabric='metal.bronze'),
                        n=14, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_chrysothrix_core', cage_c, (0.056, 0.056, 0.062),
                        P('neonyellow', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'yuniyellow')], fabric=WOOL),
                        n=10, rows=5, out=d_bk, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, belt_p))
    entries.append(assemble_garment(gid_b, 'Izani Lava-Tube Pannier & H2S Canary-Lichen Cage',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# A5. `catch_outrider` — Catch & Twins Caravan Outrider / Stalker-Watch Escort (Golden Tears / House Guard)
# ===========================================================================================================
def _build_a5_catch_outrider(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    a, b, up, bk, left, _, f_eyes, _, f_crown = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'catch_twins_caravaneers'
    entries = []

    # 1. HEAD: Fluted iron & black-lacquer casque + alkali/shrapnel half-mask + amber slit-visor
    gid_h = f'car_{sex}_outrider_casque'
    parts_h = []
    casque_p = P('repblack', 0.03, [
        B('bottom', 0.0, 0.024, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'fluted', 'iron', 'repblack', 0.065)], fabric='metal.iron')
    parts_h.append(sculpted_cranium(gid_h + '_bowl', casque_p, f_top=1.03, f_bot=0.05, ease=0.015, rows=12, n=36))
    parts_h.append(_as(hood(gid_h + '_aventail',
                            P('crimson', 0.04, [B('bottom', 0.0, 0.025, 'solid', 'gold')],
                              [PN(0.0, 1.0, 'lamellar_scale', 'iron', 'repblack', 0.08)], fabric='metal.iron'),
                            ease=0.024, ease_low=0.045, open_front=1.05, high=0.68), 'headgear'))
    mask_p = P('iron', 0.03, [
        B('top', 0.0, 0.018, 'solid', 'gold'),
        B('bottom', 0.0, 0.018, 'solid', 'repblack'),
    ], [PN(0.0, 1.0, 'ancient_hex', 'ancient', 'iron', 0.08)], fabric='metal.iron')
    parts_h.append(sculpted_faceplate(gid_h + '_shrapnel_mask', mask_p, f_top=0.45, f_bot=-0.05,
                                      ease=0.015, span=0.46, rows=14, cols=23))
    c_vis = a + (b - a) * f_eyes
    vis_pts = []
    for an_v in np.linspace(-0.30 * math.pi, 0.30 * math.pi, 11):
        dv = -bk * math.cos(an_v) + left * math.sin(an_v)
        dv /= np.linalg.norm(dv)
        hv = (first_hit(c_vis, dv) or 0.100) + 0.020
        vis_pts.append(c_vis + dv * hv)
    parts_h.append(horn(gid_h + '_amber_visor', vis_pts, 0.011, 0.011,
                        P('amber', 0.01, [B('top', 0.0, 0.004, 'solid', 'gold'),
                                          B('bottom', 0.0, 0.004, 'solid', 'gold')],
                          fabric='glass.moonglass.leaded'),
                        n=8, rows=11, rigid_joint='Head'))
    c_top = a + (b - a) * f_crown
    parts_h.append(blob(gid_h + '_finial', c_top + up * 0.022, (0.032, 0.032, 0.040),
                        P('gold', 0.02, fabric='metal.gold'), n=10, rows=5, out=up, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Catch Outrider Fluted Casque, Shrapnel Mask & Amber Visor',
                                    'head', culture, parts_h, covers_hair=True, covers_face=True))

    # 2. TORSO: Crimson/black khatangu reinforced w/ salvaged Ancient white-metal Stalker-carapace plates + bandolier
    gid_t = f'car_{sex}_outrider_khatangu'
    parts_t = []
    khat_p = P('crimson', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'gold'),
        B('bottom', 0.0, 0.030, 'solid', 'repblack'),
        B('bottom', 0.030, 0.095, 'lamellar_scale', 'ancient', 'repblack', 0.07),
    ], [
        PN(0.0, 0.36, 'diamond_quilt', 'repblack', 'crimson', 0.12),
        PN(0.64, 1.0, 'diamond_quilt', 'repblack', 'crimson', 0.12),
        # Salvaged Ancient white-metal Stalker-carapace chest plastron
        PN(0.36, 0.64, 'ancient_hex', 'ancient', 'steel', 0.14, down=0.36),
    ], fabric='cloth.quilted.diamond')
    parts_t.append(torso_tube(gid_t + '_khatangu', TOP, KNEE + 0.02, 0.019, khat_p,
                              n=48, rows=20, hang_from=WAIST - 0.02, flare=0.14,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    carapace_p = P('ancient', 0.02, [
        B('bottom', 0.0, 0.020, 'solid', 'gold'),
    ], [PN(0.0, 1.0, 'ancient_hex', 'ancient', 'steel', 0.07)], fabric='metal.iron')
    parts_t.append(collar_disc(gid_t + '_stalker_gorget', 0.072, carapace_p,
                               drop=0.058, rows=8, scallop=0.04, ease=0.020))
    parts_t.append(pauldron(gid_t + '_carapace_L', L, carapace_p, reach=0.36, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_carapace_R', R, carapace_p, reach=0.36, ease=0.024, flare_end=0.98))

    band_p = P('repblack', 0.04, [B('top', 0.0, 0.008, 'solid', 'brass'),
                                  B('bottom', 0.0, 0.008, 'solid', 'brass')], fabric='leather.polished')
    parts_t.append(crossed_sash(gid_t + '_petard_bandolier', band_p, width=0.048, ease=0.023))
    for idx_p, (zf, xf) in enumerate(((CHEST + 0.025, 0.058), (CHEST - 0.015, 0.012), (CHEST - 0.055, -0.034))):
        pp = chest_front(zf, 0.024, x=xf)
        parts_t.append(tube(f'{gid_t}_fuse_charge_{idx_p}',
                            [pp - np.array([0.0, 0.0, 0.025]), pp + np.array([0.0, 0.0, 0.025])],
                            0.012, P('crimson', 0.02, [B('top', 0.0, 0.012, 'solid', 'brass'),
                                                       B('bottom', 0.0, 0.012, 'solid', 'brass')],
                                     fabric='metal.bronze'),
                            n=10, rigid_joint='Spine2'))
    parts_t.extend(pouch_belt(gid_t, band_p, carapace_p, ease=0.025))
    sl_p = P('repblack', 0.04, [
        B('bottom', 0.0, 0.085, 'lamellar_scale', 'ancient', 'crimson', 0.05),
    ], fabric='cloth.quilted.diamond')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Catch Outrider Stalker-Carapace Khatangu & Petard Bandolier',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Splinted lamellar gauntlets
    gid_g = f'car_{sex}_outrider_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Catch Outrider Splinted Lamellar Gauntlets', 'gloves', culture,
        _full_gloves(gid_g, carapace_p, P('repblack', 0.04, fabric='leather.polished'),
                     knuckle_p=P('ancient', 0.02, fabric='metal.iron'))
    ))

    # 4. LEGS: Reinforced cavalry riding breeches
    gid_l = f'car_{sex}_outrider_breeches'
    leg_p = P('repblack', 0.04, [
        B('top', 0.30, 0.52, 'ancient_hex', 'ancient', 'iron', 0.06),
        B('bottom', 0.0, 0.035, 'solid', 'crimson'),
    ], fabric='cloth.quilted.diamond')
    entries.append(assemble_garment(gid_l, 'Catch Outrider Armored Riding Breeches', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.016, ease_end=0.010), legged=True))

    # 5. FEET: High stirrup boots
    gid_f = f'car_{sex}_outrider_boots'
    entries.append(assemble_garment(
        gid_f, 'Catch Outrider High Stirrup Boots', 'feet', culture,
        boots(gid_f, P('iron', 0.04, fabric='metal.iron'),
              P('repblack', 0.03, [B('top', 0.0, 0.04, 'fret', 'gold', 'crimson', 0.03),
                                   B('bottom', 0.0, 0.02, 'solid', 'brass')], fabric='leather.polished'),
              top=0.58, ease_top=0.034)
    ))

    # 6. BACK: Carbine/bow case + 3 Brass-Capped Anti-Stalker Petards + harpoon-cutters + sulfur flares
    gid_b = f'car_{sex}_outrider_arsenal'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    case_c = back_a + d_bk * 0.045
    parts_b.append(_box(gid_b + '_weapon_rack', case_c, d_bk, 0.22, 0.28, 0.085,
                        P('repblack', 0.04, [B('top', 0.0, 0.025, 'solid', 'brass'),
                                             B('bottom', 0.0, 0.025, 'solid', 'crimson')], fabric='leather.polished'),
                        rigid_joint='Spine2'))
    # Diagonal oiled-leather carbine scabbard
    parts_b.append(horn(gid_b + '_carbine_case', [
        case_c + np.array([0.115, 0.025, 0.215]),
        case_c + np.array([0.0, 0.035, 0.0]),
        case_c + np.array([-0.105, 0.025, -0.220]),
    ], 0.034, 0.018, P('saddle', 0.04, [B('top', 0.0, 0.04, 'solid', 'brass')], fabric='leather.polished'),
        n=10, rows=9, rigid_joint='Spine2'))
    # 3 Brass-Capped Anti-Stalker Explosive Petards
    petard_p = P('crimson', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'brass'),
        B('bottom', 0.0, 0.022, 'solid', 'brass'),
    ], fabric='metal.bronze')
    for k_p, xp in enumerate((-0.068, 0.0, 0.068)):
        pc = case_c + np.array([xp, 0.052, -0.025])
        parts_b.append(tube(f'{gid_b}_anti_stalker_petard_{k_p}',
                            [pc + np.array([0.0, 0.0, 0.065]), pc - np.array([0.0, 0.0, 0.065])],
                            0.022, petard_p, n=12, rigid_joint='Spine2'))
    # Pneumatic harpoon-cutters + 2 yellow sulfur flare tubes
    parts_b.append(tube(gid_b + '_harpoon_cutter',
                        [case_c + np.array([-0.118, 0.018, 0.160]), case_c + np.array([-0.118, 0.018, -0.130])],
                        0.013, P('steel', 0.02, [B('top', 0.0, 0.05, 'solid', 'ancient')], fabric='metal.iron'),
                        n=10, rigid_joint='Spine2'))
    for kf, zf in enumerate((0.085, 0.035)):
        parts_b.append(tube(f'{gid_b}_sulfur_flare_{kf}',
                            [case_c + np.array([0.118, 0.015, zf + 0.045]), case_c + np.array([0.118, 0.015, zf - 0.045])],
                            0.011, P('yuniyellow', 0.03, [B('top', 0.0, 0.015, 'solid', 'scarlet')], fabric=COTTON),
                            n=8, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, band_p))
    entries.append(assemble_garment(gid_b, 'Catch Outrider Carbine Case, Anti-Stalker Petards & Harpoon-Cutters',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# A6. `yuni_wagon_factor` — Yuni Merchants' Guild Oilskin-Wagon Factor (Lasso / Route B / Qiblai)
# ===========================================================================================================
def _build_a6_yuni_wagon_factor(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    a, b, up, bk, left, _, _, _, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'catch_twins_caravaneers'
    entries = []

    # 1. HEAD: Wide oiled-leather & felt brim hat + upturned brass goggle_eye_cups + buttoned chin-warmer
    gid_h = f'car_{sex}_wagon_hat'
    hat_p = P('saddle', 0.04, [
        B('bottom', 0.0, 0.016, 'solid', 'yuniyellow'),
        B('top', 0.0, 0.016, 'solid', 'umber'),
    ], fabric='cloth.oiled.alkali')
    parts_h = [
        brim(gid_h + '_brim', 0.59, 0.102, hat_p, ease=0.018, rows=5, n=40, droop=0.010, lift=0.008),
        tower_hat(gid_h + '_crown', 0.135, lambda s: 1.0 - 0.16 * (s ** 1.5), hat_p,
                  f=0.57, ease=0.018, rows=9, n=36),
    ]
    parts_h[0].rigid_joint = 'Head'
    parts_h.extend(_goggles(
        gid_h, False,
        P('umber', 0.04, fabric='leather.polished'),
        P('brass', 0.02, fabric='metal.bronze'),
        P('brass', 0.02, fabric='metal.bronze'),
        P('amber', 0.01, fabric='beads.glass'),
        over=0.022, host_parts=parts_h, f_override=0.76
    ))
    entries.append(assemble_garment(gid_h, 'Yuni Wagon-Factor Oilskin Slouch Hat & Brass Brow-Goggles',
                                    'head', culture, parts_h, covers_hair=True, covers_face=False))

    # 2. TORSO: Double-breasted oilskin wagon-duster lined w/ teal/saffron Yuni wool, rain-capelet & waywiser odometer
    gid_t = f'car_{sex}_wagon_duster'
    parts_t = []
    duster_p = P('saddle', 0.04, [
        B('top', 0.0, 0.022, 'solid', 'teal'),
        B('bottom', 0.0, 0.032, 'tartan', 'yuniyellow', 'teal', 0.06),
        B('bottom', 0.032, 0.085, 'salt_frost_alkali', 'saltlime', 'saddle', 0.10),
    ], [
        PN(0.42, 0.58, 'solid', 'ochre', 'saddle', 1.0, down=0.38),
        PN(0.40, 0.42, 'solid', 'teal', 'saddle', 1.0),
        PN(0.58, 0.60, 'solid', 'teal', 'saddle', 1.0),
    ], fabric='cloth.oiled.alkali')
    parts_t.append(torso_tube(gid_t + '_duster', TOP, KNEE - 0.04, 0.018, duster_p,
                              n=48, rows=22, hang_from=WAIST - 0.02, flare=0.16,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    capelet_p = P('ochre', 0.04, [
        B('bottom', 0.0, 0.022, 'solid', 'teal'),
        B('top', 0.0, 0.015, 'solid', 'umber'),
    ], fabric='cloth.oiled.alkali')
    parts_t.append(collar_disc(gid_t + '_rain_capelet', 0.095, capelet_p,
                               drop=0.082, rows=8, scallop=0.06, ease=0.021))
    parts_t.extend(button_row(gid_t, CHEST + 0.04, WAIST + 0.02, n_buttons=4,
                              paint=P('brass', 0.02, fabric='metal.bronze'), ease=0.023, double=True))
    guild_sash = P('teal', 0.04, [
        B('top', 0.0, 0.010, 'solid', 'yuniyellow'),
        B('bottom', 0.0, 0.010, 'solid', 'yuniyellow'),
    ], [PN(0.0, 1.0, 'tartan', 'yuniyellow', 'teal', 0.05)], fabric=WOOL)
    parts_t.extend(sash_with_tail(gid_t, guild_sash, guild_sash, ease=0.022, tail=0.28))

    # Chest-mounted brass wagon-waywiser odometer dial
    p_odo = chest_front(CHEST + 0.005, 0.025, x=0.058)
    parts_t.append(rosette(gid_t + '_waywiser_dial', p_odo, FRONT, np.array([1.0, 0.0, 0.0]),
                           0.030, P('cream', 0.01, [B('top', 0.0, 0.012, 'solid', 'brass'),
                                                    B('bottom', 0.0, 0.012, 'solid', 'brass')],
                                    fabric='metal.bronze'),
                           n=14, thick=0.011, rigid_joint='Spine2'))
    sl_p = P('saddle', 0.04, [
        B('bottom', 0.0, 0.035, 'tartan', 'yuniyellow', 'teal', 0.04),
    ], fabric='cloth.oiled.alkali')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.027, rows=10))
    entries.append(assemble_garment(gid_t, 'Yuni Guild Double-Breasted Oilskin Wagon-Duster & Waywiser',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Oiled driving gauntlets
    gid_g = f'car_{sex}_wagon_gauntlets'
    entries.append(assemble_garment(
        gid_g, 'Yuni Oiled Six-Rein Driving Gauntlets', 'gloves', culture,
        _full_gloves(
            gid_g,
            P('ochre', 0.04, [B('top', 0.0, 0.02, 'solid', 'teal')], fabric='cloth.oiled.alkali'),
            P('saddle', 0.04, fabric='leather.polished')
        )
    ))

    # 4. LEGS: Over-boot wool wagon trousers
    gid_l = f'car_{sex}_wagon_trousers'
    leg_p = P('drab', 0.05, [
        B('bottom', 0.0, 0.04, 'tartan', 'yuniyellow', 'teal', 0.04),
    ], fabric=WOOL)
    entries.append(assemble_garment(gid_l, 'Yuni Over-Boot Wool Wagon Trousers', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.018, ease_end=0.016), legged=True))

    # 5. FEET: Waxed geothermal mud-boots
    gid_f = f'car_{sex}_wagon_boots'
    entries.append(assemble_garment(
        gid_f, 'Yuni Waxed Route-B Geothermal Mud-Boots', 'feet', culture,
        boots(gid_f, P('soot', 0.06, fabric='rubber.tyre'),
              P('umber', 0.04, [B('top', 0.0, 0.03, 'solid', 'ochre'),
                                B('bottom', 0.0, 0.025, 'solid', 'saltlime')], fabric='cloth.oiled.alkali'),
              top=0.46, ease_top=0.031)
    ))

    # 6. BACK: Padded Eternian porcelain & spinner-cord sample trunk + Qiblai customs tube
    gid_b = f'car_{sex}_wagon_trunk'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.015), d_bk, 0.022, bvh=core.BVH_T)
    trk_c = back_a + d_bk * 0.055
    trunk_p = P('teal', 0.04, [
        B('top', 0.0, 0.025, 'solid', 'brass'),
        B('bottom', 0.0, 0.025, 'solid', 'brass'),
    ], [PN(0.14, 0.86, 'trencadis', 'yuniyellow', 'tileblue', 0.14)], fabric='cloth.quilted.diamond')
    parts_b.append(_box(gid_b + '_sample_trunk', trk_c, d_bk, 0.25, 0.28, 0.11, trunk_p, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_qiblai_customs_tube',
                        [trk_c + np.array([-0.14, 0.015, 0.158]), trk_c + np.array([0.14, 0.015, 0.158])],
                        0.028, P('holyred', 0.03, [B('top', 0.0, 0.03, 'solid', 'gold'),
                                                   B('bottom', 0.0, 0.03, 'solid', 'gold')], fabric='leather.polished'),
                        n=12, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('saddle', 0.04, [B('top', 0.0, 0.008, 'solid', 'brass')],
                                        fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Yuni Padded Porcelain Sample Trunk & Qiblai Customs Tube',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# A7. `geo_convoy_blaster` — Geomancer Lizard-Patrol & Explosive-Escort Sapper (Lasso / Route B / Qiblai)
# ===========================================================================================================
def _build_a7_geo_convoy_blaster(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    a, b, up, bk, left, f_nose, f_eyes, _, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'catch_twins_caravaneers'
    entries = []

    # 1. HEAD: Dark-teal oiled hood + canyon_visor + acoustic blast-muff ear-cups + respirator half-mask
    gid_h = f'car_{sex}_blaster_hood'
    hood_p = P('liikofiteal', 0.04, [
        B('bottom', 0.0, 0.028, 'solid', 'bronze'),
    ], [PN(0.0, 1.0, 'topographic_strata', 'godteal', 'liikofiteal', 0.16)], fabric='cloth.lead.oiled')
    resp_p = P('slate', 0.03, [
        B('top', 0.0, 0.018, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.018, 'solid', 'nahhascopper'),
    ], fabric='rubber.tyre')
    parts_h = [
        _as(hood(gid_h + '_hood', hood_p, ease=0.028, ease_low=0.046), 'headgear'),
        _as(sculpted_faceplate(gid_h + '_respirator', resp_p, f_top=0.42, f_bot=-0.05,
                               ease=0.014, span=0.44, rows=12, cols=21), 'headgear'),
    ]
    # Canyon blast-visor bar across eyes
    c_vis = a + (b - a) * f_eyes
    vis_pts = []
    for an_v in np.linspace(-0.32 * math.pi, 0.32 * math.pi, 11):
        dv = -bk * math.cos(an_v) + left * math.sin(an_v)
        dv /= np.linalg.norm(dv)
        hv = (first_hit(c_vis, dv) or 0.100) + 0.022
        vis_pts.append(c_vis + dv * hv)
    parts_h.append(horn(gid_h + '_canyon_visor', vis_pts, 0.014, 0.014,
                        P('amber', 0.01, [B('top', 0.0, 0.005, 'solid', 'bronze'),
                                          B('bottom', 0.0, 0.005, 'solid', 'bronze')],
                          fabric='glass.moonglass.leaded'),
                        n=8, rows=11, rigid_joint='Head'))
    # Acoustic blast-muff ear-cups + respirator cheek filters
    c_ear = a + (b - a) * (f_eyes - 0.04)
    c_chk = a + (b - a) * (f_nose - 0.08)
    muff_p = P('bronze', 0.03, [B('bottom', 0.0, 0.010, 'solid', 'soot')], fabric='metal.bronze')
    for tag, sx in (('L', 1.0), ('R', -1.0)):
        d_e = left * sx
        h_e = (first_hit(c_ear, d_e) or 0.082) + 0.026
        parts_h.append(rosette(f'{gid_h}_blast_muff_{tag}', c_ear + d_e * h_e, d_e, up, 0.036,
                               muff_p, n=14, thick=0.018, rigid_joint='Head'))
        d_c = -bk * 0.78 + left * (0.62 * sx)
        d_c /= np.linalg.norm(d_c)
        h_c = (first_hit(c_chk, d_c) or 0.088) + 0.020
        parts_h.append(rosette(f'{gid_h}_filter_{tag}', c_chk + d_c * h_c, d_c, up, 0.020,
                               P('nahhascopper', 0.02, fabric='metal.bronze'), n=10, thick=0.012, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Geomancer Sapper Hood, Canyon Visor & Acoustic Blast-Muffs',
                                    'head', culture, parts_h, covers_hair=True, covers_face=True))

    # 2. TORSO: Topographic blast-coat (cloth.lead.oiled), blast-gorget collar_disc & crossed sapper harnesses
    gid_t = f'car_{sex}_blaster_coat'
    parts_t = []
    coat_p = P('deepgreen', 0.04, [
        B('top', 0.0, 0.024, 'solid', 'bronze'),
        B('bottom', 0.0, 0.030, 'solid', 'nahhascopper'),
    ], [PN(0.0, 1.0, 'topographic_strata', 'godteal', 'deepgreen', 0.24)], fabric='cloth.lead.oiled')
    parts_t.append(torso_tube(gid_t + '_blast_coat', TOP, KNEE + 0.04, 0.019, coat_p,
                              n=48, rows=20, hang_from=WAIST - 0.02, flare=0.11,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    gorget_p = P('slate', 0.04, [
        B('bottom', 0.0, 0.020, 'solid', 'nahhascopper'),
        B('top', 0.0, 0.018, 'solid', 'bronze'),
    ], [PN(0.0, 1.0, 'diamond_quilt', 'bronze', 'slate', 0.08)], fabric='cloth.lead.oiled')
    parts_t.append(collar_disc(gid_t + '_blast_gorget', 0.085, gorget_p,
                               drop=0.068, rows=8, scallop=0.03, ease=0.021))
    harn_p = P('leather', 0.04, [B('top', 0.0, 0.008, 'solid', 'nahhascopper'),
                                 B('bottom', 0.0, 0.008, 'solid', 'nahhascopper')], fabric='leather.polished')
    parts_t.append(band(gid_t + '_harness_A', WAIST + 0.01, SHOULDER + 0.012, 0.042, 0.023,
                        harn_p, high=math.pi * 0.45, rows=4))
    parts_t.append(band(gid_t + '_harness_B', WAIST + 0.01, SHOULDER + 0.012, 0.042, 0.024,
                        harn_p, high=-math.pi * 0.45, rows=4))
    parts_t.extend(pouch_belt(gid_t, harn_p, P('nahhascopper', 0.03, fabric='metal.bronze'), ease=0.026))
    sl_p = P('deepgreen', 0.04, [
        B('bottom', 0.0, 0.06, 'topographic_strata', 'godteal', 'slate', 0.05),
    ], fabric='cloth.lead.oiled')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.026, rows=10))
    entries.append(assemble_garment(gid_t, 'Geomancer Sapper Topographic Lead-Oiled Blast-Coat & Gorget',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Copper-crimper rubberized gloves
    gid_g = f'car_{sex}_blaster_gloves'
    entries.append(assemble_garment(
        gid_g, 'Geomancer Sapper Non-Sparking Copper & Rubber Gauntlets', 'gloves', culture,
        _full_gloves(
            gid_g,
            P('soot', 0.04, [B('top', 0.0, 0.022, 'solid', 'nahhascopper')], fabric='rubber.tyre'),
            P('slate', 0.04, fabric='rubber.tyre'),
            knuckle_p=P('nahhascopper', 0.02, fabric='metal.bronze')
        )
    ))

    # 4. LEGS: Lizard-riding padded breeches
    gid_l = f'car_{sex}_blaster_breeches'
    leg_p = P('slate', 0.05, [
        B('top', 0.25, 0.55, 'diamond_quilt', 'hide', 'slate', 0.06),
        B('bottom', 0.0, 0.035, 'solid', 'godteal'),
    ], fabric='cloth.quilted.diamond')
    entries.append(assemble_garment(gid_l, 'Geomancer Sapper Lizard-Riding Padded Breeches', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.017, ease_end=0.012), legged=True))

    # 5. FEET: Blast-insulated rubber-sole boots
    gid_f = f'car_{sex}_blaster_boots'
    entries.append(assemble_garment(
        gid_f, 'Geomancer Sapper Blast-Insulated Boots', 'feet', culture,
        boots(gid_f, P('soot', 0.06, fabric='rubber.tyre'),
              P('slate', 0.04, [B('top', 0.0, 0.03, 'solid', 'godteal'),
                                B('bottom', 0.0, 0.025, 'solid', 'nahhascopper')], fabric='cloth.lead.oiled'),
              top=0.48, wraps=2, wrap_paint=P('nahhascopper', 0.03, fabric='metal.bronze'), ease_top=0.032)
    ))

    # 6. BACK: Detonator-Plunger & Power-Cell Rack + 4 Blasting-Gelatin Cylinders + lizard goad-hook
    gid_b = f'car_{sex}_blaster_rack'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    det_c = back_a + d_bk * 0.050
    parts_b.append(_box(gid_b + '_detonator_box', det_c, d_bk, 0.23, 0.25, 0.095,
                        P('saddle', 0.04, [B('top', 0.0, 0.028, 'solid', 'brass'),
                                           B('bottom', 0.0, 0.028, 'solid', 'brass')], fabric='leather.polished'),
                        rigid_joint='Spine2'))
    # T-handle detonator plunger rising from top of box
    pl_top = det_c + np.array([0.0, 0.0, 0.195])
    parts_b.append(tube(gid_b + '_plunger_rod', [det_c + np.array([0.0, 0.0, 0.115]), pl_top],
                        0.010, P('brass', 0.02, fabric='metal.bronze'), n=8, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_plunger_handle',
                        [pl_top - np.array([0.055, 0.0, 0.0]), pl_top + np.array([0.055, 0.0, 0.0])],
                        0.013, P('umber', 0.04, [B('top', 0.0, 0.02, 'solid', 'brass')]), n=8, rigid_joint='Spine2'))
    # 4 Red Blasting-Gelatin Cylinders racked across back face
    gel_p = P('scarlet', 0.03, [
        B('top', 0.0, 0.018, 'solid', 'nahhascopper'),
        B('bottom', 0.0, 0.018, 'solid', 'nahhascopper'),
    ], fabric='cloth.oiled.alkali')
    for kg, xg in enumerate((-0.075, -0.025, 0.025, 0.075)):
        gc = det_c + np.array([xg, 0.055, -0.015])
        parts_b.append(tube(f'{gid_b}_gelatin_{kg}',
                            [gc + np.array([0.0, 0.0, 0.075]), gc - np.array([0.0, 0.0, 0.075])],
                            0.017, gel_p, n=10, rigid_joint='Spine2'))
    # Riding-lizard bronze goad-hook strapped vertically on right
    gh_top = det_c + np.array([0.125, 0.015, 0.185])
    parts_b.append(tube(gid_b + '_lizard_goad', [det_c + np.array([0.125, 0.015, -0.175]), gh_top],
                        0.009, P('nahhascopper', 0.02, fabric='metal.bronze'), n=8, rigid_joint='Spine2'))
    parts_b.append(horn(gid_b + '_goad_hook',
                        [gh_top, gh_top + np.array([0.032, 0.0, 0.030]), gh_top + np.array([0.050, 0.0, -0.005])],
                        0.010, 0.003, P('godteal', 0.02, fabric='metal.bronze'), n=8, rows=6, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, harn_p))
    entries.append(assemble_garment(gid_b, 'Geomancer Sapper Detonator-Plunger & Blasting-Gelatin Rack',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# A8. `stair_oasis_bailiff` — Stair Polyglot Entrepot Factor & Well-Bailiff (Stair / Kolli / Arfwai / Bitta)
# ===========================================================================================================
def _build_a8_stair_oasis_bailiff(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'catch_twins_caravaneers'
    entries = []

    # 1. HEAD: Sun-turban + woven tamarisk shade-brim hybrid
    gid_h = f'car_{sex}_bailiff_hat'
    turb_p = P('oasisturq', 0.04, [
        B('bottom', 0.0, 0.020, 'solid', 'jusschalk'),
    ], [PN(0.0, 1.0, 'kilim_four_tongue', 'saffron', 'oasisturq', 0.14)], fabric=COTTON)
    straw_p = P('totorareed', 0.06, [
        B('bottom', 0.0, 0.018, 'solid', 'oasisturq'),
        B('top', 0.0, 0.014, 'solid', 'madder'),
    ], fabric='straw.reed.plaited')
    parts_h = [
        turban(gid_h + '_turban', turb_p, f0=0.61, f1=1.14, bulge=0.034, ease=0.018),
        brim(gid_h + '_tamarisk_brim', 0.64, 0.110, straw_p, ease=0.022, rows=5, n=40, droop=0.002, lift=0.016),
    ]
    parts_h[1].rigid_joint = 'Head'
    entries.append(assemble_garment(gid_h, 'Stair Well-Bailiff Sun-Turban & Woven Tamarisk Shade-Brim',
                                    'head', culture, parts_h, covers_hair=True, covers_face=False))

    # 2. TORSO: 4-tongue patchwork kilim waistcoat over breathable linen tunic, rolled wide sleeves & 4 well-keys
    gid_t = f'car_{sex}_bailiff_vest'
    parts_t = []
    vest_h = TOP - WAIST + 0.05
    tunic_p = P('linen', 0.04, [
        B('bottom', 0.0, 0.045, 'kilim_four_tongue', 'saffron', 'oasisturq', 0.08),
    ], [
        # 4-tongue patchwork kilim waistcoat covering chest and back down to hips
        PN(0.0, 0.45, 'kilim_four_tongue', 'saffron', 'dragoncrimson', 0.24, down=vest_h),
        PN(0.55, 1.0, 'kilim_four_tongue', 'saffron', 'dragoncrimson', 0.24, down=vest_h),
        PN(0.45, 0.47, 'solid', 'ebadindigo', 'linen', 1.0, down=vest_h),
        PN(0.53, 0.55, 'solid', 'ebadindigo', 'linen', 1.0, down=vest_h),
    ], fabric=COTTON)
    parts_t.append(torso_tube(gid_t + '_tunic_vest', TOP, CROTCH - 0.06, 0.016, tunic_p,
                              n=46, rows=18, hang_from=WAIST - 0.02, flare=0.09,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(collar(gid_t + '_collar', P('oasisturq', 0.04, [B('top', 0.0, 0.008, 'solid', 'saffron')],
                                               fabric=COTTON), height=0.028, flare=0.010, ease=0.020, open_front=True))
    # Double iron-ringed belt + wood-ash filter pouch + 4 Well-Lock Keys + 4-script tally-fan
    parts_t.extend(stacked_belts(gid_t, n_belts=2, ease=0.022))
    iron_p = P('iron', 0.03, [B('top', 0.0, 0.015, 'solid', 'brass')], fabric='metal.iron')
    c_w = spine_at(WAIST - 0.025)
    for k_key, ang_k in enumerate((0.55, 0.65, 0.75, 0.85)):
        dk = np.array([-math.sin(ang_k), -math.cos(ang_k), 0.0])
        pk = surface_out(c_w, dk, 0.024, bvh=core.BVH_T)
        parts_t.append(tube(f'{gid_t}_well_key_{k_key}',
                            [pk + np.array([0.0, 0.0, 0.010]), pk - np.array([0.0, 0.0, 0.065])],
                            0.007, iron_p, n=8, rigid_joint='Hips'))
    d_fan = np.array([0.52, -0.85, 0.0])
    d_fan /= np.linalg.norm(d_fan)
    p_fan = surface_out(c_w, d_fan, 0.024, bvh=core.BVH_T)
    parts_t.append(blob(gid_t + '_tally_fan', p_fan + np.array([0.0, 0.0, 0.025]), (0.065, 0.018, 0.085),
                        P('ivory', 0.03, [B('top', 0.0, 0.5, 'vstripes', 'soot', 'ivory', 0.014)]),
                        n=12, rows=5, out=d_fan, rigid_joint='Hips'))
    sl_p = P('linen', 0.04, [
        B('bottom', 0.0, 0.038, 'kilim_four_tongue', 'saffron', 'oasisturq', 0.045),
    ], fabric=COTTON)
    parts_t.extend(sleeves(gid_t, 'elbow', 0.018, sl_p, ease_end=0.028, rows=7, wide=True))
    entries.append(assemble_garment(gid_t, 'Stair Well-Bailiff 4-Tongue Kilim Waistcoat & Well-Lock Keys',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Fingerless well-rope gloves
    gid_g = f'car_{sex}_bailiff_gloves'
    e_g = assemble_garment(
        gid_g, 'Stair Well-Bailiff Fingerless Rope-Hauling Gloves', 'gloves', culture,
        _fingerless_gloves(
            gid_g,
            P('oasisturq', 0.05, [B('top', 0.0, 0.014, 'solid', 'saffron')], fabric=COTTON),
            P('buck', 0.05, fabric='leather.buckskin')
        )
    )
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # 4. LEGS: Drawstring reed-striped oasis trousers
    gid_l = f'car_{sex}_bailiff_trousers'
    leg_p = P('sealinen', 0.04, [
        B('bottom', 0.0, 0.045, 'stripes', 'oasisturq', 'totorareed', 0.025),
    ], fabric=COTTON)
    entries.append(assemble_garment(gid_l, 'Stair Oasis Drawstring Linen Trousers', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.019, ease_end=0.015), legged=True))

    # 5. FEET: Closed guard sandals
    gid_f = f'car_{sex}_bailiff_sandals'
    entries.append(assemble_garment(
        gid_f, 'Stair Oasis Closed-Heel Guard Sandals', 'feet', culture,
        sandal(gid_f, P('saddle', 0.05, fabric='leather.polished'),
               P('oasisturq', 0.04, [B('top', 0.0, 0.01, 'solid', 'saffron')], fabric='leather.polished'),
               guard=True, laces=2)
    ))

    # 6. BACK: Copper ash-boiling water-urn & tamarisk-fodder steelyard balance
    gid_b = f'car_{sex}_bailiff_urn'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    urn_c = back_a + d_bk * 0.062
    urn_p = P('nahhascopper', 0.03, [
        B('top', 0.0, 0.03, 'solid', 'brass'),
        B('bottom', 0.0, 0.03, 'solid', 'soot'),
    ], [PN(0.0, 1.0, 'kilim_four_tongue', 'oasisturq', 'nahhascopper', 0.12)], fabric='metal.bronze')
    parts_b.append(blob(gid_b + '_cradle', back_a + d_bk * 0.014, (0.19, 0.045, 0.24),
                        P('totorareed', 0.06, fabric='straw.reed.plaited'), n=14, rows=5, out=d_bk, rigid_joint='Spine2'))
    parts_b.append(tube(gid_b + '_copper_urn',
                        [urn_c + np.array([0.0, 0.0, 0.135]), urn_c - np.array([0.0, 0.0, 0.135])],
                        0.062, urn_p, n=18, rigid_joint='Spine2'))
    parts_b.append(blob(gid_b + '_urn_dome', urn_c + np.array([0.0, 0.0, 0.145]), (0.11, 0.11, 0.065),
                        P('brass', 0.02, fabric='metal.bronze'), n=14, rows=5,
                        out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))
    # Brass tamarisk-fodder steelyard balance beam across top
    parts_b.append(tube(gid_b + '_fodder_balance',
                        [urn_c + np.array([-0.155, 0.02, 0.175]), urn_c + np.array([0.155, 0.02, 0.175])],
                        0.009, P('brass', 0.02, fabric='metal.bronze'), n=8, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, P('leather', 0.04, fabric='leather.polished')))
    entries.append(assemble_garment(gid_b, 'Stair Bailiff Ash-Boiling Copper Urn & Tamarisk Balance',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# A9. `stair_bore_diver` — Stair Hill-Arcology & Dead-Bore Salvage Diver (Hill Terraces / Dead Bore)
# ===========================================================================================================
def _build_a9_stair_bore_diver(sex, body_id):
    set_body(body_id)
    TOP, SHOULDER, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.SHOULDER, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    a, b, up, bk, left, _, _, f_brow, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'catch_twins_caravaneers'
    entries = []

    # 1. HEAD: Salvaged polymer-and-brass delver casque + glowing cell-lamp + dust-goggles + spore mask
    gid_h = f'car_{sex}_diver_casque'
    casque_p = P('ancient', 0.03, [
        B('bottom', 0.0, 0.024, 'solid', 'brass'),
    ], [PN(0.0, 1.0, 'ancient_hex', 'ancient', 'slate', 0.09)], fabric='metal.iron')
    spore_p = P('charcoal', 0.04, [
        B('top', 0.0, 0.018, 'solid', 'brass'),
        B('bottom', 0.0, 0.018, 'solid', 'cybercyan'),
    ], fabric='rubber.tyre')
    parts_h = [
        sculpted_cranium(gid_h + '_casque', casque_p, f_top=1.02, f_bot=0.02, ease=0.015, rows=12, n=36),
        sculpted_faceplate(gid_h + '_spore_mask', spore_p, f_top=0.40, f_bot=-0.05,
                           ease=0.014, span=0.44, rows=12, cols=21),
    ]
    parts_h.extend(_goggles(
        gid_h, True,
        P('charcoal', 0.04, fabric='rubber.tyre'),
        P('brass', 0.02, fabric='metal.bronze'),
        P('brass', 0.02, fabric='metal.bronze'),
        P('cybercyan', 0.01, fabric='glass.moonglass.leaded'),
        over=0.008
    ))
    c_lamp = a + (b - a) * (f_brow + 0.18)
    h_l = (first_hit(c_lamp, -bk) or 0.098) + 0.022
    p_lamp = c_lamp - bk * h_l
    parts_h.append(tube(gid_h + '_cell_lamp', [p_lamp + bk * 0.010, p_lamp - bk * 0.018],
                        0.021, P('brass', 0.02, fabric='metal.bronze'), n=12, rigid_joint='Head'))
    parts_h.append(rosette(gid_h + '_cell_glow', p_lamp - bk * 0.020, -bk, left, 0.018,
                           P('cybercyan', 0.01, [B('top', 0.0, 0.006, 'solid', 'white')],
                             fabric='glass.moonglass.leaded'),
                           n=12, thick=0.005, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'Stair Dead-Bore Polymer Casque, Cell-Lamp & Spore Mask',
                                    'head', culture, parts_h, covers_hair=True, covers_face=True))

    # 2. TORSO: Canvas climbing coat, rappelling webbing, Ancient bright-alloy left pauldron & Rare Devisers 8-cog disc
    gid_t = f'car_{sex}_diver_coat'
    parts_t = []
    coat_p = P('khaki', 0.06, [
        B('top', 0.0, 0.020, 'solid', 'charcoal'),
        B('bottom', 0.0, 0.028, 'solid', 'brass'),
    ], [
        PN(0.47, 0.53, 'buttons', 'brass', 'charcoal', 0.08, down=0.35),
    ], fabric='cloth.weave.twill')
    parts_t.append(torso_tube(gid_t + '_coat', TOP, CROTCH - 0.06, 0.017, coat_p,
                              n=46, rows=18, hang_from=WAIST - 0.02, flare=0.08,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02))
    parts_t.append(stand_collar(gid_t, P('charcoal', 0.04, [B('top', 0.0, 0.008, 'solid', 'cybercyan')],
                                         fabric='rubber.tyre'), high=0.034))
    anc_p = P('ancient', 0.02, [B('bottom', 0.0, 0.02, 'solid', 'cybercyan')],
              [PN(0.0, 1.0, 'ancient_hex', 'ancient', 'steel', 0.07)], fabric='metal.iron')
    parts_t.append(pauldron(gid_t + '_alloy_sh_L', L, anc_p, reach=0.36, ease=0.024, flare_end=0.98))
    parts_t.append(pauldron(gid_t + '_rope_pad_R', R,
                            P('leather', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'brass')], fabric='leather.buckskin'),
                            reach=0.30, ease=0.022, flare_end=0.95))
    web_p = P('stewardorange', 0.05, [
        B('top', 0.0, 0.007, 'solid', 'charcoal'),
        B('bottom', 0.0, 0.007, 'solid', 'charcoal'),
    ], fabric='cloth.weave.burlap')
    parts_t.append(band(gid_t + '_webbing_A', WAIST, SHOULDER + 0.012, 0.038, 0.021, web_p, high=math.pi * 0.44, rows=4))
    parts_t.append(band(gid_t + '_webbing_B', WAIST, SHOULDER + 0.012, 0.038, 0.022, web_p, high=-math.pi * 0.44, rows=4))
    parts_t.extend(pouch_belt(gid_t, web_p, P('charcoal', 0.04, [B('top', 0.0, 0.02, 'solid', 'brass')],
                                              fabric='rubber.tyre'), ease=0.024))
    # Rare Devisers 8-cog licence disc flush on left breast
    p_disc = chest_front(CHEST + 0.018, 0.023, x=0.062)
    parts_t.append(rosette(gid_t + '_deviser_cog_disc', p_disc, FRONT, np.array([1.0, 0.0, 0.0]),
                           0.026, P('bronze', 0.02, [B('top', 0.0, 0.5, 'rays', 'cybercyan', 'bronze', 0.04)],
                                    fabric='metal.bronze'),
                           n=12, thick=0.008, rigid_joint='Spine2'))
    sl_p = P('khaki', 0.06, [B('bottom', 0.0, 0.045, 'solid', 'charcoal')], fabric='cloth.weave.twill')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.017, sl_p, ease_end=0.025, rows=9))
    entries.append(assemble_garment(gid_t, 'Stair Bore-Diver Rappelling Coat, Alloy Pauldron & Deviser Disc',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Fingerless tactile salvage gloves
    gid_g = f'car_{sex}_diver_gloves'
    e_g = assemble_garment(
        gid_g, 'Stair Bore-Diver Tactile Salvage Gloves', 'gloves', culture,
        _fingerless_gloves(
            gid_g,
            P('charcoal', 0.04, [B('top', 0.0, 0.015, 'solid', 'cybercyan')], fabric='rubber.tyre'),
            P('ancient', 0.03, [B('bottom', 0.0, 0.012, 'solid', 'brass')], fabric='leather.buckskin')
        )
    )
    e_g.pop('hide_parts', None)
    entries.append(e_g)

    # 4. LEGS: Bright-alloy knee-plated canvas trousers
    gid_l = f'car_{sex}_diver_trousers'
    leg_p = P('khaki', 0.06, [
        B('top', 0.34, 0.52, 'ancient_hex', 'ancient', 'steel', 0.055),
        B('bottom', 0.0, 0.035, 'solid', 'charcoal'),
    ], fabric='cloth.weave.twill')
    entries.append(assemble_garment(gid_l, 'Stair Bore-Diver Alloy-Knee Salvage Trousers', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.016, ease_end=0.011), legged=True))

    # 5. FEET: Tyre-sole arcology boots
    gid_f = f'car_{sex}_diver_boots'
    entries.append(assemble_garment(
        gid_f, 'Stair Bore-Diver Ancient Tyre-Sole Climbing Boots', 'feet', culture,
        boots(gid_f, P('soot', 0.06, fabric='rubber.tyre'),
              P('charcoal', 0.04, [B('top', 0.0, 0.03, 'solid', 'stewardorange'),
                                   B('bottom', 0.0, 0.025, 'solid', 'ancient')], fabric='rubber.tyre'),
              top=0.48, ease_top=0.031)
    ))

    # 6. BACK: Salvage Frame cradling 3 Charged Cyan Ancient Energy Cells + crowbar + 50m shaft cable
    gid_b = f'car_{sex}_diver_frame'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    frm_c = back_a + d_bk * 0.046
    parts_b.append(_box(gid_b + '_salvage_frame', frm_c, d_bk, 0.24, 0.28, 0.088,
                        P('iron', 0.03, [B('top', 0.0, 0.025, 'solid', 'brass'),
                                         B('bottom', 0.0, 0.025, 'solid', 'brass')], fabric='metal.iron'),
                        rigid_joint='Spine2'))
    cell_p = P('cybercyan', 0.01, [
        B('top', 0.0, 0.026, 'solid', 'ancient'),
        B('bottom', 0.0, 0.026, 'solid', 'ancient'),
    ], [PN(0.0, 1.0, 'circuit_schematic', 'white', 'cybercyan', 0.05)], fabric='glass.moonglass.leaded')
    for kc, xc in enumerate((-0.068, 0.0, 0.068)):
        cc = frm_c + np.array([xc, 0.052, 0.015])
        parts_b.append(tube(f'{gid_b}_energy_cell_{kc}',
                            [cc + np.array([0.0, 0.0, 0.082]), cc - np.array([0.0, 0.0, 0.082])],
                            0.022, cell_p, n=12, rigid_joint='Spine2'))
    # 50 m braided steel cable coil at bottom + steel pry-crowbar on left
    cbl_c = frm_c + np.array([0.0, 0.025, -0.145])
    parts_b.append(tube(gid_b + '_shaft_cable',
                        [cbl_c - np.array([0.11, 0.0, 0.0]), cbl_c + np.array([0.11, 0.0, 0.0])],
                        0.032, P('steel', 0.04, [B('top', 0.0, 0.5, 'stripes', 'soot', 'steel', 0.016)],
                                 fabric='metal.iron'),
                        n=12, rigid_joint='Spine2'))
    cb_top = frm_c + np.array([-0.128, 0.015, 0.185])
    parts_b.append(tube(gid_b + '_crowbar', [frm_c + np.array([-0.128, 0.015, -0.155]), cb_top],
                        0.010, P('scarlet', 0.03, [B('top', 0.0, 0.04, 'solid', 'steel')], fabric='metal.iron'),
                        n=8, rigid_joint='Spine2'))
    parts_b.append(horn(gid_b + '_crowbar_claw',
                        [cb_top, cb_top + np.array([-0.026, 0.0, 0.032]), cb_top + np.array([-0.042, 0.0, 0.005])],
                        0.011, 0.004, P('steel', 0.02, fabric='metal.iron'), n=8, rows=6, rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, web_p))
    entries.append(assemble_garment(gid_b, 'Stair Bore-Diver 3-Cell Cyan Salvage Frame, Cable & Crowbar',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# A10. `gills_salt_peddler` — White Gills Lung-Salt Peddler & Lava-Tube Smuggler (White Gills / Feeder Tubes)
# ===========================================================================================================
def _build_a10_gills_salt_peddler(sex, body_id):
    set_body(body_id)
    TOP, CHEST, WAIST, CROTCH, KNEE = core.TOP, core.CHEST, core.WAIST, core.CROTCH, core.KNEE
    a, b, up, bk, left, _, _, f_brow, _ = _head_landmarks()
    d_bk = np.array([0.0, 1.0, 0.0])
    culture = 'catch_twins_caravaneers'
    entries = []

    # 1. HEAD: 4-ear yak-fleece cap hung w/ brucite Breath-Pipe ring talismans (covers_hair=False, covers_face=False)
    gid_h = f'car_{sex}_peddler_cap'
    cap_p = P('yakbrown', 0.08, [
        B('bottom', 0.0, 0.024, 'solid', 'sage'),
        B('top', 0.0, 0.020, 'solid', 'darkfur'),
    ], fabric='fur.yak')
    cuff_p = P('darkfur', 0.09, [B('top', 0.0, 0.010, 'solid', 'brucitewhite')], fabric='fur.yak')
    parts_h = [
        head_rings(gid_h + '_crown', 0.58, 0.98, 0.016, cap_p, n=32, rows=6, apex=True),
        crown_band(gid_h + '_four_ear_brim', cuff_p, f0=0.55, f1=0.76, ease=0.020, flare=0.010, rows=5, n=36),
    ]
    parts_h[0].rigid_joint = 'Head'
    # Carved brucitewhite Breath-Pipe ring talismans at both temples
    c_tmp = a + (b - a) * (f_brow + 0.04)
    brucite_p = P('brucitewhite', 0.02, [B('bottom', 0.0, 0.006, 'solid', 'mint')], fabric='glass.moonglass.leaded')
    for tag, sx in (('L', 1.0), ('R', -1.0)):
        dt = left * (0.92 * sx) - bk * 0.35
        dt /= np.linalg.norm(dt)
        ht = (first_hit(c_tmp, dt) or 0.085) + 0.018
        pt = c_tmp + dt * ht
        parts_h.append(rosette(f'{gid_h}_breathpipe_ring_{tag}', pt, dt, up, 0.019,
                               brucite_p, n=12, thick=0.006, rigid_joint='Head'))
    entries.append(assemble_garment(gid_h, 'White Gills 4-Ear Yak-Fleece Cap & Brucite Breath-Pipe Rings',
                                    'head', culture, parts_h, covers_hair=False, covers_face=False))

    # 2. TORSO: Reversible basalt/lichen-green felt smuggler's coat w/ hidden vial-pockets, mist-capelet & chew-tins
    gid_t = f'car_{sex}_peddler_coat'
    parts_t = []
    coat_p = P('basalt', 0.06, [
        B('top', 0.0, 0.020, 'solid', 'moss'),
        B('bottom', 0.0, 0.035, 'zigzag', 'brucitewhite', 'moss', 0.055),
    ], [
        # Open reversible lichen-green inner lapel revealing hidden lung-salt vial pockets
        PN(0.49, 0.61, 'quilt', 'brucitewhite', 'moss', 0.08, down=0.34),
        PN(0.39, 0.49, 'solid', 'sage', 'basalt', 1.0, down=0.30),
    ], fabric='cloth.felt.boiled')
    parts_t.append(torso_tube(gid_t + '_coat', TOP, KNEE + 0.03, 0.018, coat_p,
                              n=46, rows=20, hang_from=WAIST - 0.02, flare=0.12,
                              group_below=CROTCH + 0.02, hull_from=CHEST + 0.02, jagged=0.04))
    mist_p = P('moss', 0.06, [
        B('bottom', 0.0, 0.025, 'teeth', 'brucitewhite', 'sage', 0.045),
    ], fabric='cloth.felt.boiled')
    parts_t.append(collar_disc(gid_t + '_mist_capelet', 0.088, mist_p,
                               drop=0.076, rows=8, scallop=0.08, ease=0.020))

    # Chest bandolier of 6 hypoxia chew-tins & brucite mist-flasks
    band_p = P('yakbrown', 0.06, [B('top', 0.0, 0.008, 'solid', 'brucitewhite')], fabric='leather.buckskin')
    parts_t.append(crossed_sash(gid_t + '_bandolier', band_p, width=0.046, ease=0.022))
    tin_p = P('brucitewhite', 0.02, [B('top', 0.0, 0.010, 'solid', 'bronze'),
                                     B('bottom', 0.0, 0.010, 'solid', 'moss')], fabric='metal.tin.patchwork')
    for k_v in range(6):
        u_v = k_v / 5.0
        zf = (CHEST + 0.045) * (1.0 - u_v) + (WAIST + 0.045) * u_v
        xf = 0.075 * (1.0 - u_v) - 0.075 * u_v
        pv = chest_front(zf, 0.023, x=xf)
        if k_v % 2 == 0:
            parts_t.append(rosette(f'{gid_t}_chew_tin_{k_v}', pv, FRONT, np.array([1.0, 0.0, 0.0]),
                                   0.017, tin_p, n=10, thick=0.008, rigid_joint='Spine2'))
        else:
            parts_t.append(tube(f'{gid_t}_mist_flask_{k_v}',
                                [pv - np.array([0.0, 0.0, 0.020]), pv + np.array([0.0, 0.0, 0.020])],
                                0.010, brucite_p, n=8, rigid_joint='Spine2'))
    parts_t.extend(pouch_belt(gid_t, band_p, mist_p, ease=0.024))
    sl_p = P('basalt', 0.06, [B('bottom', 0.0, 0.05, 'solid', 'moss')], fabric='cloth.felt.boiled')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, sl_p, ease_end=0.026, rows=9))
    entries.append(assemble_garment(gid_t, 'White Gills Reversible Felt Smuggler Coat & Lung-Salt Bandolier',
                                    'torso', culture, parts_t))

    # 3. GLOVES: Patchwork fleece mitts
    gid_g = f'car_{sex}_peddler_mitts'
    entries.append(assemble_garment(
        gid_g, 'White Gills Patchwork Fleece Smuggler Mitts', 'gloves', culture,
        _full_gloves(
            gid_g,
            P('moss', 0.06, [B('top', 0.0, 0.02, 'solid', 'brucitewhite')], fabric='cloth.felt.boiled'),
            P('yakbrown', 0.07, fabric='cloth.felt.boiled')
        )
    ))

    # 4. LEGS: Felted scree trousers
    gid_l = f'car_{sex}_peddler_trousers'
    leg_p = P('basalt', 0.06, [
        B('bottom', 0.0, 0.045, 'solid', 'moss'),
    ], fabric='cloth.felt.boiled')
    entries.append(assemble_garment(gid_l, 'White Gills Felted Scree Trousers', 'legs', culture,
                                    trousers(gid_l, leg_p, ease=0.017, ease_end=0.012), legged=True))

    # 5. FEET: Muffled felt-soled smuggler boots (silent past Brotherhood tollhouses!)
    gid_f = f'car_{sex}_peddler_boots'
    entries.append(assemble_garment(
        gid_f, 'White Gills Muffled Felt-Soled Tollhouse-Smuggler Boots', 'feet', culture,
        boots(gid_f,
              P('brucitewhite', 0.08, fabric='cloth.felt.boiled'),
              P('basalt', 0.06, [B('top', 0.0, 0.035, 'solid', 'moss'),
                                 B('bottom', 0.0, 0.030, 'solid', 'ash')], fabric='cloth.felt.boiled'),
              top=0.48, wraps=2, wrap_paint=P('sage', 0.06, fabric='cloth.felt.boiled'), ease_top=0.032)
    ))

    # 6. BACK: Wicker & Brucite-Slab Lung-Salt (Lag Solt) Creel
    gid_b = f'car_{sex}_peddler_creel'
    parts_b = []
    back_a = surface_out(spine_at(CHEST - 0.02), d_bk, 0.022, bvh=core.BVH_T)
    crl_c = back_a + d_bk * 0.052
    creel_p = P('bamboo', 0.06, [
        B('top', 0.0, 0.028, 'solid', 'yakbrown'),
        B('bottom', 0.0, 0.025, 'solid', 'yakbrown'),
    ], [PN(0.0, 1.0, 'checks', 'oat', 'bamboo', 0.045)], fabric='straw.reed.plaited')
    parts_b.append(_box(gid_b + '_wicker_creel', crl_c, d_bk, 0.24, 0.27, 0.10, creel_p, rigid_joint='Spine2'))
    for kb, (xb, zb) in enumerate(((-0.055, 0.145), (0.0, 0.162), (0.055, 0.142))):
        parts_b.append(blob(f'{gid_b}_brucite_chunk_{kb}', crl_c + np.array([xb, 0.0, zb]),
                            (0.085, 0.075, 0.070), brucite_p, n=10, rows=5,
                            out=np.array([0.0, 0.0, 1.0]), rigid_joint='Spine2'))
    parts_b.extend(pack_straps(gid_b, band_p))
    entries.append(assemble_garment(gid_b, 'White Gills Wicker & Brucite Lung-Salt Creel',
                                    'back', culture, parts_b))
    return entries


# ===========================================================================================================
# GROUP A ENTRY POINT & TIER OUTFIT MAP
# ===========================================================================================================
GROUP_A_TIER_META = [
    ('two_horns_guide', 0.12, 'Brotherhood of the Two Horns Pass-Master (Dalil al-Qaranayn)',
     'twohorns_hood', 'twohorns_coat', 'twohorns_mitts', 'twohorns_breeches', 'twohorns_boots', 'twohorns_pack', False),
    ('jabal_salt_syndic', 0.08, 'Train of Jabal Salt-Syndic & Wakil (Dasri Salt Master)',
     'syndic_turban', 'syndic_coat', 'syndic_gloves', 'syndic_trousers', 'syndic_boots', 'syndic_strongbox', False),
    ('jabal_camel_drover', 0.14, 'Catch Halite-Pan & High-Wagon Teamster (Salt al-Ban)',
     'drover_litham', 'drover_coat', 'drover_gloves', 'drover_trousers', 'drover_boots', 'drover_hod', True),
    ('iziz_tube_packmaster', 0.10, 'Izani Getmastarz / Goldanda Dark-Tube Pack-Master',
     'packmaster_hat', 'packmaster_coat', 'packmaster_gauntlets', 'packmaster_breeches', 'packmaster_boots', 'packmaster_pannier', False),
    ('catch_outrider', 0.11, 'Catch & Twins Caravan Outrider / Stalker-Watch Escort',
     'outrider_casque', 'outrider_khatangu', 'outrider_gauntlets', 'outrider_breeches', 'outrider_boots', 'outrider_arsenal', True),
    ('yuni_wagon_factor', 0.10, "Yuni Merchants' Guild Oilskin-Wagon Factor",
     'wagon_hat', 'wagon_duster', 'wagon_gauntlets', 'wagon_trousers', 'wagon_boots', 'wagon_trunk', False),
    ('geo_convoy_blaster', 0.08, 'Geomancer Lizard-Patrol & Explosive-Escort Sapper',
     'blaster_hood', 'blaster_coat', 'blaster_gloves', 'blaster_breeches', 'blaster_boots', 'blaster_rack', True),
    ('stair_oasis_bailiff', 0.10, 'Stair Polyglot Entrepot Factor & Well-Bailiff',
     'bailiff_hat', 'bailiff_vest', 'bailiff_gloves', 'bailiff_trousers', 'bailiff_sandals', 'bailiff_urn', False),
    ('stair_bore_diver', 0.08, 'Stair Hill-Arcology & Dead-Bore Salvage Diver',
     'diver_casque', 'diver_coat', 'diver_gloves', 'diver_trousers', 'diver_boots', 'diver_frame', True),
    ('gills_salt_peddler', 0.09, 'White Gills Lung-Salt Peddler & Lava-Tube Smuggler',
     'peddler_cap', 'peddler_coat', 'peddler_mitts', 'peddler_trousers', 'peddler_boots', 'peddler_creel', False),
]


def build_catch_caravans_kit():
    """Compile all 120 Group A (`car_{m|f}_*`) procedural pieces across `mpfb_male` and `mpfb_female`."""
    _install_caravaneer_motifs()
    builders = (
        _build_a1_two_horns_guide,
        _build_a2_jabal_salt_syndic,
        _build_a3_jabal_camel_drover,
        _build_a4_iziz_tube_packmaster,
        _build_a5_catch_outrider,
        _build_a6_yuni_wagon_factor,
        _build_a7_geo_convoy_blaster,
        _build_a8_stair_oasis_bailiff,
        _build_a9_stair_bore_diver,
        _build_a10_gills_salt_peddler,
    )
    entries = []
    for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
        for fn in builders:
            entries.extend(fn(sex, body_id))
    set_body('mpfb_male')
    return entries
