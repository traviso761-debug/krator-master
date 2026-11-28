"""Lizardmen (`lizardmen`) Procedural Wardrobe Kit — Great Rift Autarky (6 Castes at 1.25x).

Implements the complete 6 biological/settlement castes of the Lizardmen (`LORE.md` §6.20,
`dalab_kimr_fellgangs_lizardmen_garment_plan.md` §1.4 & §3.4) across BOTH `mpfb_male` and
`mpfb_female` (`72` procedural pieces, prefix `liz_{m,f}_*`):
  1. `skink_forager`        — Tender Caste: Hatchery Relic-Keeper & Reed-Tally Forager
  2. `iguana_fisher`        — Maker Caste: Lagoon Fisher, Chitin-Lacquerer & Bronze-Caster
  3. `gila_venom_spitter`   — Drover Caste: Aposematic Sledge-Drover & Caustic Venom-Spitter
  4. `tuatara_crest_priest` — Interpreter Caste: 7-Turn Leiwen Spiral Oracle & Calendar-Priest
  5. `basilisk_stalker`     — Rift-Fen Vanguard: Sail-Crest Harpoon Skirmisher & Stalker
  6. `komodo_juggernaut`    — Line-Warrior / Bulwark Caste: Taotie Cast-Bronze Shock Juggernaut

Strict Nonhuman & Cultural Invariants:
- Zero trade, zero iron/steel, zero woven cloth: everything is archaic Shang/Zhou verdigris cast
  bronze (`leiwen` squared thunder-spirals, `whorl` bosses, `taotie` split-jaw masks), oxblood &
  ebony beetle-wing lacquer, butchered hexapod chitin, carved bone, and bundled marsh-reed.
- Beast-Head Fit (`mod_head_lizard`): every `slot == 'head'` entry sets `fits_beast = True`,
  `covers_hair = True`, `covers_face = False`, and conforms cleanly (`f >= 0.63`, `ease >= 0.019`)
  outside BOTH the human skull and `mod_head_lizard.glb` upper cranium above the eyes & snout.
- Dorsal Crest & Tail Clearance (`mod_head_lizard` `crest_neck` + `mod_tail`):
  * All `torso` pieces use `open_torso=True` and keep the dorsal cervical midline open so
    `Mod.head_lizard_crest_neck` and scaly reptile skin are never hidden.
  * All `back` pieces mount via a flush dorsal `Spine2` pad (`z >= WAIST + 0.08`, zero `pack_straps`).
  * All `legs` pieces use a high iliac waist-girdle + split front-and-hip aprons/tassets
    (`arc = (0.28*pi, 1.72*pi)`, `z0 = WAIST - 0.046`) leaving a 100-degree open rear sacral port
    for `mod_tail`.
- Clawed Hands & Feet: forearm bracers end at `f1 <= 0.92`; all `feet` use open-clawed `sandal()`
  assemblies (`hides == 4 <= 40`).
- Manifest-only build (`tools/garments/cultures/lizardmen_manifest.json`).
"""
from contextlib import contextmanager
import json
import math
import struct
import sys
import time
from pathlib import Path
import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import connected_components
from scipy.spatial import cKDTree

CULTURES_DIR = Path(__file__).resolve().parent
ROOT = CULTURES_DIR.parents[2]  # core/charactermodels
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

import arms2  # noqa: E402
import glbio  # noqa: E402
from garments import core  # noqa: E402
from garments import paint as paint_mod  # noqa: E402
from garments.core import (  # noqa: E402
    Part, J, L, R, FastBVH, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment,
)
from garments.paint import P, B, PN, C, leathery, sample_cultural_tex  # noqa: E402
from garments.types.torso import (  # noqa: E402
    torso_tube, band, crossed_sash, pauldron,
)
from garments.types.armor import (  # noqa: E402
    cuirass_plate, articulated_pauldron, articulated_pauldrons,
    hinged_tassets, sculpted_vambraces, sculpted_greaves,
)
from garments.types.limbs import limb_tube, sleeve  # noqa: E402
from garments.types.footwear import sandal  # noqa: E402
from garments.types.headgear import crest, horn, fan  # noqa: E402
from garments.types.accoutrements import (  # noqa: E402
    blob, pendants, tube, rosette, flap,
)


# ===========================================================================================================
# LIZARDMEN ARCHAIC SHANG-BRONZE, OXBLOOD LACQUER & HEXAPOD CHITIN PALETTE
# ===========================================================================================================
LIZ_COLORS = {
    'liz_verdigris':   (0.145, 0.420, 0.340),  # Patinated archaic Shang cast-bronze verdigris
    'liz_castbronze':  (0.380, 0.265, 0.105),  # Dark cupro-tin Shang ritual bronze
    'liz_giltbronze':  (0.640, 0.460, 0.145),  # Burnished bright bronze spiral boss highlight
    'liz_oxblood':     (0.245, 0.022, 0.028),  # Oxblood beetle-wing & tree-sap lacquer
    'liz_ebonlac':     (0.032, 0.026, 0.028),  # Mirror-black charred chitin lacquer
    'liz_chitinmoss':  (0.085, 0.165, 0.095),  # Butchered Great-Rift hexapod dorsal carapace
    'liz_gilaamber':   (0.720, 0.340, 0.035),  # Aposematic Gila-banded amber-orange lacquer
    'liz_boneivory':   (0.740, 0.690, 0.560),  # Carved megafauna/reptile bone & tooth ivory
    'liz_marshreed':   (0.390, 0.365, 0.205),  # Bundled hypertropic Rift-marsh sedge & reed
    'liz_rawhide':     (0.285, 0.195, 0.115),  # Oiled reptile-sinew & smoked rawhide lashing
    'liz_riverjade':   (0.115, 0.390, 0.255),  # Carved Great-Rift nephrite oracle jade
}

LIZ_CUSTOM_MOTIFS = {
    'liz_leiwen_whorl',
    'liz_taotie_lacquer',
    'liz_chitin_scute',
    'liz_gila_aposematic',
    'liz_reed_bundle',
}

_BEAST_BVH_CACHE = {}


def _get_lizard_head_bvh(body_id: str) -> FastBVH:
    """Load `mod_head_lizard.glb` upper skull (excluding thin sagittal crest blades) as a FastBVH."""
    if body_id in _BEAST_BVH_CACHE:
        return _BEAST_BVH_CACHE[body_id]
    glb_p = ROOT / 'pieces' / body_id / 'mod_head_lizard.glb'
    j, buf = glbio.read_glb(glb_p.read_bytes())
    pts, tris = [], []
    voff = 0
    for m in j['meshes']:
        for pr in m['primitives']:
            if 'POSITION' not in pr['attributes'] or 'indices' not in pr:
                continue
            mat_nm = j['materials'][pr['material']].get('name', '') if 'material' in pr else ''
            if 'crest' in mat_nm.lower() or 'eye' in mat_nm.lower():
                continue
            P_bl = arms2.from_gl(glbio.accessor(j, buf, pr['attributes']['POSITION']))
            T_arr = glbio.accessor(j, buf, pr['indices']).reshape(-1, 3)
            # Exclude thin midline crest blades (`|x| < 0.009` and `y > 0.04`) so radial skull rays hit the cranium
            tri_ctr = (P_bl[T_arr[:, 0]] + P_bl[T_arr[:, 1]] + P_bl[T_arr[:, 2]]) / 3.0
            keep = ~((np.abs(tri_ctr[:, 0]) < 0.009) & (tri_ctr[:, 1] > 0.045))
            if keep.any():
                pts.append(P_bl)
                tris.append(T_arr[keep] + voff)
                voff += len(P_bl)
    bvh = FastBVH(np.vstack(pts), np.vstack(tris))
    _BEAST_BVH_CACHE[body_id] = bvh
    return bvh


def _liz_custom_motif(style, w, h, fg, bg, aspect=1.0):
    base_style = style.split(':')[0]
    H = max(int(h), 1)
    W = max(int(w), 1)
    img = np.empty((H, W, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:H, 0:W]
    u = (xx + 0.5) / W
    v = (yy + 0.5) / H

    if base_style == 'liz_leiwen_whorl':
        # Archaic Shang squared thunder-spiral (leiwen) + raised bronze whorl bosses + Codex lamellar blend
        nx = max(2.0, round(4.0 * max(aspect, 0.45)))
        ny = max(2.0, round(3.0 / max(aspect, 0.45)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = ((v * ny) % 1.0 - 0.5) * 2.0
        box = np.maximum(np.abs(gu), np.abs(gv))
        ring1 = (box > 0.72) & (box < 0.86)
        ring2 = (box > 0.40) & (box < 0.54)
        hook = (np.abs(gu) < 0.18) & (gv > 0.0) & (gv < 0.54)
        whorl = np.hypot(gu, gv) < 0.20
        rail = (v < 0.08) | (v > 0.92)
        img[ring1 | ring2 | hook] = fg
        img[whorl] = C['liz_giltbronze']
        img[rail] = C['liz_castbronze']
        shang = sample_cultural_tex('tex.lizardmen_shang_leiwen', W, H, fg, bg, pal_blend=0.28)
        img = 0.54 * img + 0.46 * shang

    elif base_style == 'liz_taotie_lacquer':
        # Bilateral Shang taotie split-jaw mask eyes, hooked fangs & verdigris ridges over oxblood lacquer
        nx = max(1.0, round(2.0 * max(aspect, 0.5)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        ax = np.abs(gu)
        eye_boss = (np.hypot((ax - 0.42) / 0.16, (v - 0.46) / 0.18) < 1.0)
        pupil = (np.hypot((ax - 0.42) / 0.07, (v - 0.46) / 0.08) < 1.0)
        horn_crest = (np.abs((v - 0.22) - 0.16 * np.cos(ax * math.pi * 1.4)) < 0.075) & (ax < 0.86)
        nasal = (ax < 0.09) & (v > 0.16) & (v < 0.82)
        fang = (np.abs(ax - 0.28) < 0.065) & (v > 0.68) & (v < 0.90)
        img[horn_crest | nasal] = fg
        img[eye_boss] = C['liz_giltbronze']
        img[pupil] = C['liz_ebonlac']
        img[fang] = C['liz_boneivory']
        shang = sample_cultural_tex('tex.lizardmen_shang_leiwen', W, H, fg, bg, pal_blend=0.35)
        img = 0.68 * img + 0.32 * shang

    elif base_style == 'liz_chitin_scute':
        # Overlapping hexagonal hexapod-chitin & bone lamellar scales laced with dark sinew
        ny = max(3.0, round(5.0 / max(aspect, 0.45)))
        nx = max(3.0, round(5.0 * max(aspect, 0.45)))
        row = np.floor(v * ny).astype(int)
        gv = (v * ny) % 1.0
        gu = ((u * nx + 0.5 * (row % 2)) % 1.0 - 0.5) * 2.0
        arch = gv + 0.28 * (gu ** 2)
        rim = (arch > 0.82) & (arch < 0.96)
        lace = (np.abs(gu) < 0.12) & (gv < 0.28)
        img[arch >= 0.96] = C['liz_ebonlac']
        img[rim] = fg
        img[lace] = C['liz_rawhide']
        sc = sample_cultural_tex('tex.lamellar_chitin', W, H, fg, bg, pal_blend=0.35)
        img = 0.60 * img + 0.40 * sc

    elif base_style == 'liz_gila_aposematic':
        # Gila monster stepped beaded mosaic bands (amber-orange, ebony lacquer & bone)
        nx = max(4.0, round(8.0 * max(aspect, 0.45)))
        ny = max(4.0, round(6.0 / max(aspect, 0.45)))
        ix = np.floor(u * nx).astype(int)
        iy = np.floor(v * ny).astype(int)
        gu = (u * nx) % 1.0 - 0.5
        gv = (v * ny) % 1.0 - 0.5
        bead = np.hypot(gu, gv) < 0.44
        wave_band = ((ix + iy * 2) % 5) < 2
        img[:] = C['liz_ebonlac']
        img[bead & wave_band] = fg
        img[bead & (~wave_band)] = bg

    elif base_style == 'liz_reed_bundle':
        # Vertical bundled marsh-reeds bound with horizontal rawhide & bronze wire lashings
        nx = max(6.0, round(14.0 * max(aspect, 0.45)))
        gu = (u * nx) % 1.0
        stalk_hi = (gu > 0.25) & (gu < 0.68)
        stalk_gap = (gu < 0.10) | (gu > 0.90)
        lash = (np.abs(v - 0.18) < 0.045) | (np.abs(v - 0.52) < 0.040) | (np.abs(v - 0.84) < 0.045)
        img[stalk_hi] = np.clip(np.asarray(bg) * 1.16, 0.0, 1.0)
        img[stalk_gap] = np.asarray(bg) * 0.55
        img[lash] = fg

    return np.clip(img, 0.0, 1.0)


@contextmanager
def _liz_paint_context():
    saved_colors = {k: C.get(k) for k in LIZ_COLORS}
    C.update(LIZ_COLORS)
    orig_motif = paint_mod.motif

    def _patched_motif(style, w, h, fg, bg, aspect=1.0):
        base = style.split(':')[0] if isinstance(style, str) else ''
        if base in LIZ_CUSTOM_MOTIFS:
            return _liz_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _patched_motif
    try:
        yield
    finally:
        paint_mod.motif = orig_motif
        for k, v in saved_colors.items():
            if v is None:
                C.pop(k, None)
            else:
                C[k] = v


# ===========================================================================================================
# SHARED PAINTS (ZERO CLOTH — CAST BRONZE, OXBLOOD LACQUER, CHITIN, BONE & REED)
# ===========================================================================================================
def _p_shang_bronze(base='liz_verdigris', accent='liz_giltbronze'):
    return P(base, 0.05, [
        B('top', 0.0, 0.030, 'liz_leiwen_whorl', accent, 'liz_castbronze'),
        B('bottom', 0.0, 0.035, 'liz_leiwen_whorl', accent, 'liz_castbronze'),
    ], [
        PN(0.0, 1.0, 'liz_leiwen_whorl', accent, base, 0.22),
    ], fabric='metal.bronze')


def _p_taotie_bronze(base='liz_castbronze', accent='liz_verdigris'):
    return P(base, 0.05, [
        B('top', 0.0, 0.025, 'solid', 'liz_giltbronze'),
        B('bottom', 0.0, 0.032, 'liz_leiwen_whorl', accent, base),
    ], [
        PN(0.0, 1.0, 'liz_taotie_lacquer', accent, base, 0.26),
    ], fabric='metal.bronze.verdigris')


def _p_oxblood_chitin(base='liz_oxblood', accent='liz_verdigris'):
    return P(base, 0.04, [
        B('top', 0.0, 0.022, 'solid', accent),
        B('bottom', 0.0, 0.028, 'liz_leiwen_whorl', 'liz_giltbronze', base),
    ], [
        PN(0.0, 1.0, 'liz_chitin_scute', accent, base, 0.20),
    ], fabric='armor.lamellar.urushi')


def _p_moss_chitin():
    return P('liz_chitinmoss', 0.05, [
        B('top', 0.0, 0.020, 'solid', 'liz_verdigris'),
        B('bottom', 0.0, 0.025, 'liz_chitin_scute', 'liz_boneivory', 'liz_chitinmoss'),
    ], [
        PN(0.0, 1.0, 'liz_chitin_scute', 'liz_verdigris', 'liz_chitinmoss', 0.18),
    ], fabric='armor.lamellar.chitin')


def _p_gila_lacquer():
    return P('liz_ebonlac', 0.04, [
        B('top', 0.0, 0.024, 'solid', 'liz_gilaamber'),
        B('bottom', 0.0, 0.028, 'solid', 'liz_oxblood'),
    ], [
        PN(0.0, 1.0, 'liz_gila_aposematic', 'liz_gilaamber', 'liz_oxblood', 0.18),
    ], fabric='armor.lamellar.urushi')


def _p_marsh_reed(trim='liz_rawhide'):
    return P('liz_marshreed', 0.06, [
        B('top', 0.0, 0.024, 'solid', trim),
        B('bottom', 0.0, 0.028, 'liz_reed_bundle', trim, 'liz_marshreed'),
    ], [
        PN(0.0, 1.0, 'liz_reed_bundle', trim, 'liz_marshreed', 0.16),
    ], fabric='straw.reed.plaited')


def _p_carved_bone():
    return P('liz_boneivory', 0.04, [
        B('top', 0.0, 0.018, 'solid', 'liz_oxblood'),
        B('bottom', 0.0, 0.018, 'solid', 'liz_verdigris'),
    ], [
        PN(0.0, 1.0, 'osteoderm_scute', 'liz_rawhide', 'liz_boneivory', 0.18),
    ], fabric='armor.osteoderm.scute')


def _p_rawhide():
    return leathery(P('liz_rawhide', 0.05, [
        B('top', 0.0, 0.018, 'solid', 'liz_castbronze'),
    ], fabric='leather.reptile.scute'))


# ===========================================================================================================
# REPTILIAN CRANIUM, DORSAL-OPEN TORSO, FLUSH SPINE2 BACK & TAIL-CLEARING KILT HELPERS
# ===========================================================================================================
def _saurian_cranial_band(name, paint, f_bot=0.65, f_top=0.82, ease=0.020, flare=0.010, rows=7, n=40, brow_arch=0.04):
    """Upper-cranium saurian crown/casque ring seated cleanly outside BOTH `base.glb` and `mod_head_lizard.glb`
    while staying <= 14mm of the underlying human skull so disconnected checks and beast-head clearance both pass!"""
    a, b, up, bk, left = head_frame()
    liz_bvh = _get_lizard_head_bvh(core.BODY_ID)
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angs]
    Q = []
    fs = np.linspace(f_top, f_bot, rows)
    for i, f_base in enumerate(fs):
        v = i / float(max(rows - 1, 1))
        row = []
        for an, d in zip(angs, ds):
            # Arch slightly higher over front snout/eyes (`an ~ pi`) and rear dorsal crest (`an ~ 0`)
            front_w = max(0.0, math.cos(an - math.pi)) ** 1.6
            back_w = max(0.0, math.cos(an)) ** 2.4
            f_ij = f_base + v * (brow_arch * front_w + 0.025 * back_w)
            c_ij = a + (b - a) * f_ij
            c_ray = a + (b - a) * min(max(f_ij, 0.56), 0.88)
            h_hum = first_hit(c_ray, d) or 0.092
            h_liz = liz_bvh.ray_cast(c_ray, d, maxd=0.28)
            r_base = max(float(h_hum), float(h_liz) if h_liz is not None else 0.0)
            # Cap radial overhang over human skull so crown never floats >16mm off human base while clearing lizard brow
            r_cap = float(h_hum) + 0.028
            r_use = min(r_base + ease, r_cap) + flare * (1.0 - v)
            row.append(c_ij + d * r_use)
        Q.append(row)
    Q = np.array(Q, dtype=np.float64)
    # Smooth circumferential ring radii
    for _ in range(2):
        Q = 0.50 * Q + 0.25 * (np.roll(Q, 1, axis=1) + np.roll(Q, -1, axis=1))
    return Part(name, Q, True, ['top'] + ['body'] * (rows - 2) + ['bottom'], paint, rigid_joint='Head')


def _anchor_on_part(host_part: Part, target_pt, sink=0.0025):
    """Return `(anchor_pt, out_normal)` snapped & sunk `sink` metres into the nearest vertex of `host_part`."""
    P_flat = host_part.P.reshape(-1, 3)
    target = np.asarray(target_pt, dtype=np.float64)
    idx = int(np.argmin(np.linalg.norm(P_flat - target[None, :], axis=1)))
    pt = P_flat[idx].copy()
    ctr = P_flat.mean(axis=0)
    out = pt - ctr
    nrm = float(np.linalg.norm(out))
    out = (out / nrm) if nrm > 1e-6 else np.array([0.0, -1.0, 0.0])
    return pt - out * sink, out


def _mark_beast_head(ent):
    ent['fits_beast'] = True
    return ent


def _dorsal_open_collar(name, paint, drop=0.085, ease=0.019, z_off=-0.026, rows=8, n=34):
    """Anterior & shoulder crescent collar (`arc = (0.24*pi, 1.76*pi)`) leaving the dorsal cervical spine
    (`Mod.head_lizard_crest_neck`) completely open and unoccluded."""
    z_top = core.TOP + float(z_off)
    zs = np.linspace(z_top, z_top - float(drop), rows)
    angs = np.linspace(0.24 * math.pi, 1.76 * math.pi, n)
    x, y = np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0])
    Q = np.zeros((rows, n, 3), dtype=np.float64)
    for k, zz in enumerate(zs):
        u = k / float(max(rows - 1, 1))
        ek = ease + 0.005 * u
        c = spine_at(min(zz, core.TOP))
        for j, an in enumerate(angs):
            d = x * math.cos(an) + y * math.sin(an)
            d /= np.linalg.norm(d)
            h = first_hit(c, d, bvh=core.BVH_T) or 0.085
            px, py = c[0] + d[0] * (h + ek), c[1] + d[1] * (h + ek)
            pz = zz
            if abs(px) >= 0.065 and abs(py - c[1]) <= 0.068 and pz >= core.SHOULDER - 0.035:
                hd = first_hit(np.array([px, py, core.TOP + 0.12]), np.array([0.0, 0.0, -1.0]), maxd=0.28, bvh=core.BVH_T)
                if hd is not None:
                    pz = (core.TOP + 0.12 - float(hd)) + ek
            Q[k, j] = [px, py, pz]
    return Part(name, Q, False, ['top'] + ['body'] * (rows - 2) + ['bottom'], paint, role='collar')


def _tail_safe_kilt(gid, belt_paint, kilt_paint, z_bot, flare=0.075, jagged=0.0, front_plaque_paint=None):
    """High iliac bronze/rawhide girdle (`[WAIST-0.012, WAIST+0.030]`) + split front-and-hip tasset skirt
    (`arc=(0.28*pi, 1.72*pi)`, `z0=WAIST-0.046`) leaving a wide 100-degree rear sacral port for `mod_tail`."""
    belt = torso_tube(
        f'{gid}_girdle', core.WAIST + 0.030, core.WAIST - 0.012, 0.017, belt_paint,
        n=40, rows=5, hull_from=core.WAIST + 0.06, role='belt',
    )
    z0 = core.WAIST - 0.046
    kilt = torso_tube(
        f'{gid}_split_kilt', z0, z_bot, 0.025, kilt_paint,
        n=34, rows=16, arc=(0.28 * math.pi, 1.72 * math.pi),
        hang_from=z0, flare=flare, jagged=jagged,
        group_below=core.CROTCH + 0.02, hull_from=z0, stiff=0.16,
    )
    parts = [belt, kilt]
    if front_plaque_paint is not None:
        anch, out_v = _anchor_on_part(belt, chest_front(core.WAIST + 0.008, 0.018), sink=0.002)
        parts.append(blob(f'{gid}_buckle_boss', anch, (0.068, 0.024, 0.062), front_plaque_paint, n=14, rows=6, out=out_v, role='trinket'))
    return parts


def _dorsal_spine2_frame(gid, pad_paint, w_pad=0.15, h_pad=0.18, z_off=0.0):
    """Flush dorsal mounting pad (`blob` weighted rigidly to `Spine2`, zero `pack_straps`) above `WAIST + 0.08`."""
    z_ctr = 0.5 * (core.CHEST + core.SHOULDER) - 0.02 + z_off
    c_sp = spine_at(z_ctr)
    d_bk = np.array([0.0, 1.0, 0.0])
    h_bk = first_hit(c_sp, d_bk, maxd=0.28, bvh=core.BVH_T)
    y_surf = float(c_sp[1]) + (float(h_bk) if h_bk is not None else 0.105)
    pad_ctr = np.array([float(c_sp[0]), y_surf + 0.022, z_ctr], dtype=np.float64)
    pad = blob(f'{gid}_dorsal_pad', pad_ctr, (w_pad, 0.032, h_pad), pad_paint, n=18, rows=8, out=d_bk, rigid_joint='Spine2')
    return pad, pad_ctr, d_bk


def _claw_cuffs(gid, paint, boss_paint=None, f0=0.45, f1=0.91, ease=0.011):
    """Paired forearm bracers/vambraces stopping at `f1 <= 0.92` so reptile claws stay completely exposed."""
    out = []
    for side in (L, R):
        sl = sleeve(f'{gid}_{side[0]}', side, paint, f0=f0, f1=f1, ease=ease, flare=0.003, rows=9, n=20)
        out.append(sl)
        if boss_paint is not None:
            mid_r = sl.P[sl.P.shape[0] // 2]
            idx_top = int(np.argmax(mid_r[:, 2]))
            anch = mid_r[idx_top].copy()
            c_row = mid_r.mean(axis=0)
            out_v = anch - c_row
            out_v /= max(float(np.linalg.norm(out_v)), 1e-6)
            out.append(blob(
                f'{gid}_boss_{side[0]}', anch - out_v * 0.002, (0.032, 0.018, 0.042),
                boss_paint, n=12, rows=5, out=out_v, rigid_joint=side + 'ForeArm',
            ))
    return out


# ===========================================================================================================
# CASTE 1: SKINK FORAGER (`skink_forager` — Tender Caste)
# ===========================================================================================================
def _build_skink_forager(p):
    entries = []
    # Head: Bundled marsh-reed & carved bone cranial crest-circlet
    band_h = _saurian_cranial_band(f'{p}_skink_reed_crest_band', _p_marsh_reed('liz_oxblood'), f_bot=0.66, f_top=0.79, ease=0.019)
    cr_h = crest(f'{p}_skink_reed_crest_quills', 0.075, _p_carved_bone(), rows=5, cols=15, sweep=0.055, a0=-0.55, a1=1.45, thick=0.009, host_part=band_h)
    anch_f, out_f = _anchor_on_part(band_h, band_h.P[2, band_h.P.shape[1] // 2], sink=0.002)
    boss_h = blob(f'{p}_skink_reed_crest_jade', anch_f, (0.034, 0.018, 0.030), P('liz_riverjade', 0.03, fabric='shell.nacre'), n=12, rows=5, out=out_f, rigid_joint='Head')
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_skink_reed_crest', 'Tender Bundled-Reed & Bone Cranial Crest', 'head', 'lizardmen',
        [band_h, cr_h, boss_h], covers_hair=True, covers_face=False,
    )))

    # Torso: Throat crescent + diagonal rawhide band + spiral bronze tally disc
    col = _dorsal_open_collar(f'{p}_skink_collar', _p_marsh_reed('liz_castbronze'), drop=0.082, ease=0.018, z_off=-0.028)
    sash = crossed_sash(f'{p}_skink_sash', _p_rawhide(), width=0.048, ease=0.020)
    anch_t, out_t = _anchor_on_part(sash, chest_front(core.CHEST - 0.01, 0.020), sink=0.002)
    tally = blob(f'{p}_skink_tally_disc', anch_t, (0.068, 0.022, 0.068), _p_shang_bronze(), n=16, rows=6, out=out_t, role='trinket')
    entries.append(assemble_garment(
        f'{p}_skink_tally_collar', 'Tender Reed Throat-Crescent & Spiral Bronze Tally', 'torso', 'lizardmen',
        [col, sash, tally], open_torso=True,
    ))

    # Gloves: Plaited marsh-reed forearm cuffs
    entries.append(assemble_garment(
        f'{p}_skink_reed_cuffs', 'Tender Plaited Marsh-Reed Forearm Cuffs', 'gloves', 'lizardmen',
        _claw_cuffs(f'{p}_skink_cuff', _p_marsh_reed('liz_verdigris'), f0=0.60, f1=0.91),
    ))

    # Legs: Split bundled-reed & bone-scute apron
    entries.append(assemble_garment(
        f'{p}_skink_reed_apron', 'Tender Bundled-Reed & Bone Split Apron', 'legs', 'lizardmen',
        _tail_safe_kilt(f'{p}_skink_apron', _p_rawhide(), _p_marsh_reed('liz_oxblood'), core.CROTCH - 0.11, flare=0.065, jagged=0.04, front_plaque_paint=_p_carved_bone()),
    ))

    # Feet: Open ankle-ring marsh sandals
    entries.append(assemble_garment(
        f'{p}_skink_anklets', 'Tender Bronze Ankle-Ring Marsh Sandals', 'feet', 'lizardmen',
        sandal(f'{p}_skink_anklets', _p_marsh_reed(), _p_shang_bronze(), guard=False, laces=2),
    ))

    # Back: Woven marsh-reed hatchery egg/relic cradle on flush Spine2 pad
    pad, p_ctr, d_bk = _dorsal_spine2_frame(f'{p}_skink_cradle', _p_rawhide(), w_pad=0.15, h_pad=0.17)
    n_b, rows_b = 22, 16
    angs_b = np.linspace(0.0, 2.0 * math.pi, n_b, endpoint=False)
    Q_b = np.zeros((rows_b, n_b, 3), dtype=np.float64)
    for i in range(rows_b):
        v = i / float(rows_b - 1)
        z_i = p_ctr[2] + 0.11 - 0.22 * v
        rx = 0.088 * (1.0 - 0.38 * v) * (0.18 if i in (0, rows_b - 1) else 1.0)
        ry = 0.062 * (1.0 - 0.35 * v) * (0.18 if i in (0, rows_b - 1) else 1.0)
        y_i = p_ctr[1] + 0.048 - 0.010 * v
        for j, an in enumerate(angs_b):
            Q_b[i, j] = [p_ctr[0] + math.cos(an) * rx, y_i + math.sin(an) * ry, z_i]
    basket = Part(f'{p}_skink_cradle_basket', Q_b, True, ['body'] * rows_b, _p_marsh_reed('liz_oxblood'), rigid_joint='Spine2')
    egg_anch, _ = _anchor_on_part(basket, [p_ctr[0], p_ctr[1] + 0.05, p_ctr[2] + 0.095], sink=0.008)
    relic = blob(f'{p}_skink_cradle_relic', egg_anch, (0.095, 0.068, 0.075), _p_shang_bronze(), n=14, rows=6, out=np.array([0.0, 0.3, 1.0]), rigid_joint='Spine2')
    entries.append(assemble_garment(
        f'{p}_skink_egg_cradle', 'Tender Marsh-Reed Hatchery Relic Cradle', 'back', 'lizardmen',
        [pad, basket, relic],
    ))
    return entries


# ===========================================================================================================
# CASTE 2: IGUANA FISHER (`iguana_fisher` — Maker Caste)
# ===========================================================================================================
def _build_iguana_fisher(p):
    entries = []
    # Head: Spiny iguana-fin bronze & oxblood cranial crown
    band_h = _saurian_cranial_band(f'{p}_iguana_crown_band', _p_shang_bronze(), f_bot=0.65, f_top=0.80, ease=0.020)
    cr_h = crest(f'{p}_iguana_crown_fin', 0.105, _p_oxblood_chitin(), rows=6, cols=17, sweep=0.075, a0=-0.65, a1=1.55, thick=0.010, host_part=band_h)
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_iguana_spine_crown', 'Maker Verdigris-Bronze & Chitin Iguana Fin-Crown', 'head', 'lizardmen',
        [band_h, cr_h], covers_hair=True, covers_face=False,
    )))

    # Torso: Oxblood-lacquered chitin chest-shield + crossed foundry/harpoon bands
    sash1 = band(f'{p}_iguana_band_l', core.WAIST + 0.01, core.SHOULDER + 0.012, 0.052, 0.020, _p_rawhide(), high=math.pi * 0.45, rows=5)
    sash2 = band(f'{p}_iguana_band_r', core.WAIST + 0.01, core.SHOULDER + 0.012, 0.052, 0.020, _p_rawhide(), high=-math.pi * 0.45, rows=5)
    plaque = torso_tube(
        f'{p}_iguana_pectoral', core.CHEST + 0.065, core.WAIST + 0.035, 0.024, _p_oxblood_chitin(),
        n=22, rows=8, arc=(0.66 * math.pi, 1.34 * math.pi),
    )
    anch_p, out_p = _anchor_on_part(plaque, chest_front(core.CHEST + 0.01, 0.026), sink=0.002)
    whorl = blob(f'{p}_iguana_whorl', anch_p, (0.072, 0.024, 0.072), _p_shang_bronze(), n=16, rows=6, out=out_p, role='trinket')
    entries.append(assemble_garment(
        f'{p}_iguana_carapace_harness', 'Maker Oxblood-Chitin Carapace & Bronze Whorl Harness', 'torso', 'lizardmen',
        [sash1, sash2, plaque, whorl], open_torso=True,
    ))

    # Gloves: Oxblood chitin foundry/harpoon bracers
    entries.append(assemble_garment(
        f'{p}_iguana_chitin_bracers', 'Maker Oxblood-Lacquered Chitin Bracers', 'gloves', 'lizardmen',
        _claw_cuffs(f'{p}_iguana_bracer', _p_oxblood_chitin(), boss_paint=_p_shang_bronze(), f0=0.44, f1=0.91),
    ))

    # Legs: Bronze leiwen waist-girdle + chitin hip-scute split wrap
    entries.append(assemble_garment(
        f'{p}_iguana_hip_scutes', 'Maker Chitin Hip-Scutes & Leiwen Split Kilt', 'legs', 'lizardmen',
        _tail_safe_kilt(f'{p}_iguana_scutes', _p_shang_bronze(), _p_oxblood_chitin(), core.CROTCH - 0.13, flare=0.072, front_plaque_paint=_p_taotie_bronze()),
    ))

    # Feet: Open-clawed marsh wading sandals
    entries.append(assemble_garment(
        f'{p}_iguana_marsh_sandals', 'Maker Lacquered-Chitin Wading Sandals', 'feet', 'lizardmen',
        sandal(f'{p}_iguana_sandals', _p_rawhide(), _p_oxblood_chitin(), guard=True, laces=2, strap_paint2=_p_shang_bronze()),
    ))

    # Back: Bundled-reed fish-creel & cast-bronze ingot rack on Spine2 pad
    pad, p_ctr, d_bk = _dorsal_spine2_frame(f'{p}_iguana_creel', _p_oxblood_chitin(), w_pad=0.16, h_pad=0.19)
    n_c, rows_c = 22, 16
    angs_c = np.linspace(0.0, 2.0 * math.pi, n_c, endpoint=False)
    Q_c = np.zeros((rows_c, n_c, 3), dtype=np.float64)
    for i in range(rows_c):
        v = i / float(rows_c - 1)
        taper = 0.20 if i in (0, rows_c - 1) else 1.0
        Q_c[i] = [[p_ctr[0] + math.cos(an) * 0.082 * taper, p_ctr[1] + 0.050 + math.sin(an) * 0.052 * taper, p_ctr[2] + 0.12 - 0.24 * v] for an in angs_c]
    creel = Part(f'{p}_iguana_creel_body', Q_c, True, ['body'] * rows_c, _p_marsh_reed('liz_verdigris'), rigid_joint='Spine2')
    ing_l, _ = _anchor_on_part(creel, [p_ctr[0] - 0.065, p_ctr[1] + 0.055, p_ctr[2]], sink=0.004)
    ing_r, _ = _anchor_on_part(creel, [p_ctr[0] + 0.065, p_ctr[1] + 0.055, p_ctr[2]], sink=0.004)
    tongs_l = tube(f'{p}_iguana_ingot_l', [ing_l + np.array([0, 0, -0.09]), ing_l + np.array([0, 0, 0.11])], 0.018, _p_shang_bronze(), n=10, rigid_joint='Spine2')
    tongs_r = tube(f'{p}_iguana_ingot_r', [ing_r + np.array([0, 0, -0.09]), ing_r + np.array([0, 0, 0.11])], 0.018, _p_shang_bronze(), n=10, rigid_joint='Spine2')
    entries.append(assemble_garment(
        f'{p}_iguana_ingot_creel', 'Maker Reed Fish-Creel & Cast-Bronze Ingot Rack', 'back', 'lizardmen',
        [pad, creel, tongs_l, tongs_r],
    ))
    return entries


# ===========================================================================================================
# CASTE 3: GILA VENOM SPITTER (`gila_venom_spitter` — Drover Caste)
# ===========================================================================================================
def _build_gila_venom_spitter(p):
    entries = []
    # Head: Beaded Gila amber-and-ebony sun-crest crown
    band_h = _saurian_cranial_band(f'{p}_gila_crest_band', _p_gila_lacquer(), f_bot=0.65, f_top=0.81, ease=0.020)
    a, b, up, bk, left = head_frame()
    parts_h = [band_h]
    for k_sp, col_idx in enumerate((6, 12, 18, 22, 28, 34)):
        anch_s, out_s = _anchor_on_part(band_h, band_h.P[1, col_idx % band_h.P.shape[1]], sink=0.003)
        dir_s = 0.65 * up + 0.35 * out_s + 0.22 * bk
        dir_s /= np.linalg.norm(dir_s)
        parts_h.append(horn(
            f'{p}_gila_ray_{k_sp}', [anch_s, anch_s + dir_s * 0.055, anch_s + dir_s * 0.105 + bk * 0.018],
            0.013, 0.003, _p_carved_bone() if k_sp % 2 else _p_shang_bronze(), n=8, rows=7, rigid_joint='Head',
        ))
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_gila_bead_crest', 'Drover Gila-Mosaic Sun-Ray Cranial Crest', 'head', 'lizardmen',
        parts_h, covers_hair=True, covers_face=False,
    )))

    # Torso: Heavy bone & Gila-lacquered sledge-drover harness + bronze whorl boss
    col = _dorsal_open_collar(f'{p}_gila_yoke_col', _p_gila_lacquer(), drop=0.090, ease=0.020, z_off=-0.025)
    b_l = band(f'{p}_gila_sledge_l', core.WAIST + 0.005, core.SHOULDER + 0.014, 0.058, 0.021, _p_gila_lacquer(), high=math.pi * 0.45, rows=5)
    b_r = band(f'{p}_gila_sledge_r', core.WAIST + 0.005, core.SHOULDER + 0.014, 0.058, 0.021, _p_gila_lacquer(), high=-math.pi * 0.45, rows=5)
    anch_c, out_c = _anchor_on_part(b_l, chest_front(core.CHEST, 0.022), sink=0.002)
    boss_c = blob(f'{p}_gila_whorl_boss', anch_c, (0.082, 0.026, 0.082), _p_taotie_bronze(), n=16, rows=6, out=out_c, role='trinket')
    entries.append(assemble_garment(
        f'{p}_gila_yoke_harness', 'Drover Gila-Lacquer Sledge Yoke & Bronze Whorl Harness', 'torso', 'lizardmen',
        [col, b_l, b_r, boss_c], open_torso=True,
    ))

    # Gloves: Aposematic Gila-banded venom-nozzle bracers
    entries.append(assemble_garment(
        f'{p}_gila_venom_bracers', 'Drover Gila-Banded Chitin Venom Bracers', 'gloves', 'lizardmen',
        _claw_cuffs(f'{p}_gila_bracer', _p_gila_lacquer(), boss_paint=_p_shang_bronze(), f0=0.40, f1=0.92, ease=0.012),
    ))

    # Legs: Gila-mosaic split battle-kilt
    entries.append(assemble_garment(
        f'{p}_gila_sledge_kilt', 'Drover Gila-Lacquer & Bronze Split Sledge-Kilt', 'legs', 'lizardmen',
        _tail_safe_kilt(f'{p}_gila_kilt', _p_shang_bronze(), _p_gila_lacquer(), core.CROTCH - 0.14, flare=0.075, jagged=0.05, front_plaque_paint=_p_shang_bronze()),
    ))

    # Feet: Open-clawed Gila-lacquer shin-greave sandals
    entries.append(assemble_garment(
        f'{p}_gila_shin_greaves', 'Drover Gila-Lacquer Shin-Greave Sandals', 'feet', 'lizardmen',
        sandal(f'{p}_gila_greaves', _p_rawhide(), _p_gila_lacquer(), guard=True, greave=_p_gila_lacquer()),
    ))

    # Back: Sealed venom-gourds & clapperless bronze tally-bell frame on Spine2 pad
    pad, p_ctr, d_bk = _dorsal_spine2_frame(f'{p}_gila_rack', _p_gila_lacquer(), w_pad=0.17, h_pad=0.19)
    n_f, rows_f = 20, 16
    angs_f = np.linspace(0.0, 2.0 * math.pi, n_f, endpoint=False)
    Q_f = np.zeros((rows_f, n_f, 3), dtype=np.float64)
    for i in range(rows_f):
        v = i / float(rows_f - 1)
        swell = 1.0 + 0.25 * math.sin(v * math.pi * 2.0)
        taper = 0.22 if i in (0, rows_f - 1) else swell
        Q_f[i] = [[p_ctr[0] + math.cos(an) * 0.075 * taper, p_ctr[1] + 0.052 + math.sin(an) * 0.048 * taper, p_ctr[2] + 0.12 - 0.23 * v] for an in angs_f]
    gourd = Part(f'{p}_gila_venom_vessel', Q_f, True, ['body'] * rows_f, _p_gila_lacquer(), rigid_joint='Spine2')
    b_anch, _ = _anchor_on_part(gourd, [p_ctr[0], p_ctr[1] + 0.088, p_ctr[2] - 0.04], sink=0.004)
    bell = blob(f'{p}_gila_tally_bell', b_anch, (0.068, 0.052, 0.085), _p_shang_bronze(), n=14, rows=6, out=d_bk, rigid_joint='Spine2')
    entries.append(assemble_garment(
        f'{p}_gila_gourd_bell_rack', 'Drover Sealed Venom-Vessel & Clapperless Bronze Bell', 'back', 'lizardmen',
        [pad, gourd, bell],
    ))
    return entries


# ===========================================================================================================
# CASTE 4: TUATARA CREST PRIEST (`tuatara_crest_priest` — Interpreter Caste)
# ===========================================================================================================
def _build_tuatara_crest_priest(p):
    entries = []
    # Head: Sacred 7-turn Shang leiwen spiral cast-bronze & oxblood crown + river-jade third-eye boss
    band_h = _saurian_cranial_band(f'{p}_tuatara_crown_base', _p_shang_bronze('liz_verdigris', 'liz_giltbronze'), f_bot=0.64, f_top=0.83, ease=0.021, flare=0.014)
    a, b, up, bk, left = head_frame()
    parts_h = [band_h]
    coil_cols = (20, 15, 25, 11, 29, 6, 34)
    for idx_h, c_idx in enumerate(coil_cols):
        anch_h, out_h = _anchor_on_part(band_h, band_h.P[0, c_idx % band_h.P.shape[1]], sink=0.003)
        sgn_twist = -1.0 if idx_h == 4 else 1.0
        h_len = 0.135 - 0.010 * (idx_h // 2)
        p0 = anch_h
        p1 = anch_h + up * (0.45 * h_len) + out_h * 0.018 + left * (0.014 * sgn_twist)
        p2 = anch_h + up * (0.88 * h_len) + bk * 0.022 - left * (0.012 * sgn_twist)
        p3 = anch_h + up * h_len + out_h * 0.010 + bk * 0.032
        parts_h.append(horn(
            f'{p}_tuatara_coil_{idx_h}', [p0, p1, p2, p3], 0.015, 0.004,
            _p_shang_bronze('liz_giltbronze', 'liz_verdigris') if idx_h == 0 else _p_oxblood_chitin(),
            n=10, rows=9, rigid_joint='Head',
        ))
    anch_j, out_j = _anchor_on_part(band_h, band_h.P[2, band_h.P.shape[1] // 2], sink=0.002)
    parts_h.append(blob(f'{p}_tuatara_parietal_jade', anch_j, (0.038, 0.020, 0.038), P('liz_riverjade', 0.02, fabric='shell.nacre'), n=14, rows=6, out=out_j, rigid_joint='Head'))
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_tuatara_coil_crown', 'Interpreter 7-Turn Leiwen Spiral Bronze Crown', 'head', 'lizardmen',
        parts_h, covers_hair=True, covers_face=False,
    )))

    # Torso: 7-ring concentric Shang bronze & oxblood collar-pectoral + oracle chest-stela
    col = _dorsal_open_collar(
        f'{p}_tuatara_pectoral',
        P('liz_verdigris', 0.04, [
            B('top', 0.0, 0.14, 'solid', 'liz_giltbronze'),
            B('body', 0.18, 0.34, 'liz_leiwen_whorl', 'liz_giltbronze', 'liz_oxblood'),
            B('body', 0.42, 0.58, 'liz_leiwen_whorl', 'liz_verdigris', 'liz_castbronze'),
            B('bottom', 0.0, 0.18, 'liz_taotie_lacquer', 'liz_giltbronze', 'liz_oxblood'),
        ], fabric='metal.bronze.verdigris'),
        drop=0.125, ease=0.020, z_off=-0.022, rows=10, n=36,
    )
    b_l = band(f'{p}_tuatara_stole_l', core.WAIST + 0.01, core.SHOULDER + 0.014, 0.056, 0.021, _p_oxblood_chitin(), high=math.pi * 0.45, rows=5)
    b_r = band(f'{p}_tuatara_stole_r', core.WAIST + 0.01, core.SHOULDER + 0.014, 0.056, 0.021, _p_oxblood_chitin(), high=-math.pi * 0.45, rows=5)
    anch_st, out_st = _anchor_on_part(b_l, chest_front(core.CHEST - 0.015, 0.023), sink=0.002)
    oracle = blob(f'{p}_tuatara_oracle_disc', anch_st, (0.088, 0.026, 0.095), _p_taotie_bronze('liz_giltbronze', 'liz_verdigris'), n=16, rows=6, out=out_st, role='trinket')
    entries.append(assemble_garment(
        f'{p}_tuatara_seven_pectoral', 'Interpreter Seven-Ring Shang Bronze & Oxblood Pectoral', 'torso', 'lizardmen',
        [col, b_l, b_r, oracle], open_torso=True,
    ))

    # Gloves: Coiled 7-turn spiral bronze & nephrite cuffs
    entries.append(assemble_garment(
        f'{p}_tuatara_spiral_cuffs', 'Interpreter Coiled Bronze & Nephrite Oracle Cuffs', 'gloves', 'lizardmen',
        _claw_cuffs(f'{p}_tuatara_cuff', _p_shang_bronze('liz_giltbronze', 'liz_verdigris'), boss_paint=P('liz_riverjade', 0.03, fabric='shell.nacre'), f0=0.38, f1=0.92),
    ))

    # Legs: Inscribed Shang leiwen stela front/hip split apron
    entries.append(assemble_garment(
        f'{p}_tuatara_stela_apron', 'Interpreter Leiwen Stela Bronze Split Apron', 'legs', 'lizardmen',
        _tail_safe_kilt(f'{p}_tuatara_apron', _p_taotie_bronze('liz_giltbronze', 'liz_verdigris'), _p_shang_bronze(), core.KNEE + 0.03, flare=0.085, front_plaque_paint=P('liz_riverjade', 0.03, fabric='shell.nacre')),
    ))

    # Feet: Ceremonial gilt-bronze ankle-talon sandals
    entries.append(assemble_garment(
        f'{p}_tuatara_gilt_talons', 'Interpreter Gilt-Bronze Ankle-Ring Sandals', 'feet', 'lizardmen',
        sandal(f'{p}_tuatara_talons', _p_oxblood_chitin(), _p_shang_bronze('liz_giltbronze', 'liz_verdigris'), guard=True, laces=3),
    ))

    # Back: Horned taotie bronze dorsal arch suspending 3 clapperless bianzhong bells on flush Spine2 pad
    pad, p_ctr, d_bk = _dorsal_spine2_frame(f'{p}_tuatara_arch', _p_taotie_bronze(), w_pad=0.18, h_pad=0.19)
    arch_path = [
        p_ctr + np.array([-0.145, 0.018, -0.04]),
        p_ctr + np.array([-0.125, 0.042, 0.08]),
        p_ctr + np.array([0.0, 0.056, 0.135]),
        p_ctr + np.array([0.125, 0.042, 0.08]),
        p_ctr + np.array([0.145, 0.018, -0.04]),
    ]
    arch = horn(f'{p}_tuatara_arch_beam', arch_path, 0.024, 0.024, _p_shang_bronze('liz_giltbronze', 'liz_verdigris'), n=20, rows=18, rigid_joint='Spine2')
    parts_bk = [pad, arch]
    for kb, (r_idx, b_sz) in enumerate(((4, 0.068), (8, 0.082), (13, 0.068))):
        b_top = arch.P[r_idx].mean(axis=0)
        parts_bk.append(blob(
            f'{p}_tuatara_bell_{kb}', b_top + np.array([0.0, 0.008, -0.048]),
            (b_sz * 0.78, b_sz * 0.58, b_sz * 1.15), _p_shang_bronze(), n=14, rows=6, out=d_bk, rigid_joint='Spine2',
        ))
    entries.append(assemble_garment(
        f'{p}_tuatara_bell_arch', 'Interpreter Three-Bell Taotie Bronze Arch', 'back', 'lizardmen',
        parts_bk,
    ))
    return entries


# ===========================================================================================================
# CASTE 5: BASILISK STALKER (`basilisk_stalker` — Rift-Fen Skirmisher Vanguard)
# ===========================================================================================================
def _build_basilisk_stalker(p):
    entries = []
    # Head: Streamlined verdigris-bronze & moss-chitin casque with tall swept basilisk sail-fin crest
    band_h = _saurian_cranial_band(f'{p}_basilisk_casque_bowl', _p_moss_chitin(), f_bot=0.64, f_top=0.84, ease=0.020)
    cr_h = crest(f'{p}_basilisk_sail_crest', 0.125, _p_shang_bronze(), rows=6, cols=19, sweep=0.095, a0=-0.75, a1=1.65, thick=0.010, host_part=band_h)
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_basilisk_fin_casque', 'Basilisk Sail-Fin Chitin & Bronze Casque', 'head', 'lizardmen',
        [band_h, cr_h], covers_hair=True, covers_face=False,
    )))

    # Torso: Sculpted laminar cast-bronze breastplate + asymmetric right articulated taotie pauldron (open_torso=True, tail & neck-crest clear)
    cuir_b = cuirass_plate(
        f'{p}_basilisk_cuir', _p_shang_bronze('liz_castbronze', 'liz_verdigris'),
        trim_paint=_p_taotie_bronze(), style='laminar',
        z_top=core.TOP - 0.042, z_bot=core.WAIST + 0.018,
        ease=0.020, keel=0.014, faulds=0, open_torso=True,
    )
    pld_r = articulated_pauldron(
        f'{p}_basilisk_pld', R, _p_taotie_bronze(),
        trim_paint=_p_shang_bronze(), lames=3, haute_piece=False, ease=0.014,
    )
    anch_b, out_b = _anchor_on_part(cuir_b[0], chest_front(core.CHEST + 0.015, 0.026), sink=0.002)
    boss_b = blob(f'{p}_basilisk_taotie_boss', anch_b, (0.076, 0.024, 0.074), _p_shang_bronze('liz_giltbronze', 'liz_verdigris'), n=14, rows=6, out=out_b, role='trinket')
    entries.append(assemble_garment(
        f'{p}_basilisk_stalker_harness', 'Basilisk Laminar Cast-Bronze & Taotie Skirmisher Harness', 'torso', 'lizardmen',
        cuir_b + pld_r + [boss_b], open_torso=True,
    ))

    # Gloves: Sculpted fluted cast-bronze vambraces & winged elbow couters (claws exposed)
    entries.append(assemble_garment(
        f'{p}_basilisk_fin_vambraces', 'Basilisk Sculpted Bronze Fluted Vambraces', 'gloves', 'lizardmen',
        sculpted_vambraces(f'{p}_basilisk_vambrace', _p_shang_bronze(), trim_paint=_p_taotie_bronze(), couter=True, ease=0.014),
    ))

    # Legs: Laced moss-chitin & verdigris-bronze skirmisher pteruges
    entries.append(assemble_garment(
        f'{p}_basilisk_pteruges', 'Basilisk Chitin & Bronze Split Pteruges', 'legs', 'lizardmen',
        _tail_safe_kilt(f'{p}_basilisk_kilt', _p_shang_bronze(), _p_moss_chitin(), core.CROTCH - 0.15, flare=0.080, jagged=0.06, front_plaque_paint=_p_shang_bronze()),
    ))

    # Feet: Sculpted verdigris-bronze keel shin-greaves & knee poleyns over open-clawed sandals
    entries.append(assemble_garment(
        f'{p}_basilisk_fen_greaves', 'Basilisk Sculpted Verdigris-Bronze Shin-Greaves', 'feet', 'lizardmen',
        sandal(f'{p}_basilisk_greaves', _p_rawhide(), _p_moss_chitin(), guard=True, laces=2)
        + sculpted_greaves(f'{p}_basilisk_sgrv', _p_shang_bronze(), trim_paint=_p_taotie_bronze(), poleyn=True, ease=0.014),
    ))

    # Back: Lacquered carapace war-quiver holding 3 barbed bronze harpoon-javelins on Spine2 pad
    pad, p_ctr, _ = _dorsal_spine2_frame(f'{p}_basilisk_quiver', _p_moss_chitin(), w_pad=0.15, h_pad=0.19)
    q_bot = p_ctr + np.array([-0.035, 0.042, -0.12])
    q_top = p_ctr + np.array([0.045, 0.048, 0.14])
    quiv = horn(f'{p}_basilisk_quiver_case', [q_bot, 0.5 * (q_bot + q_top), q_top], 0.040, 0.052, _p_moss_chitin(), n=20, rows=16, rigid_joint='Spine2')
    parts_q = [pad, quiv]
    q_dir = (q_top - q_bot) / np.linalg.norm(q_top - q_bot)
    for kj, dx_j in enumerate((-0.018, 0.0, 0.018)):
        j_start = q_top - q_dir * 0.05 + np.array([dx_j, 0.0, 0.0])
        j_end = q_top + q_dir * 0.16 + np.array([dx_j * 1.2, 0.004, 0.0])
        parts_q.append(horn(f'{p}_basilisk_jav_{kj}', [j_start, j_end], 0.008, 0.004, _p_shang_bronze('liz_giltbronze', 'liz_verdigris'), n=8, rows=6, rigid_joint='Spine2'))
    entries.append(assemble_garment(
        f'{p}_basilisk_war_quiver', 'Basilisk Chitin Harpoon-Javelin War Quiver', 'back', 'lizardmen',
        parts_q,
    ))
    return entries


# ===========================================================================================================
# CASTE 6: KOMODO JUGGERNAUT (`komodo_juggernaut` — Line-Warrior / Bulwark Caste)
# ===========================================================================================================
def _build_komodo_juggernaut(p):
    entries = []
    # Head: Cyclopean horned Shang taotie cast-bronze war-casque + oxblood crest
    band_h = _saurian_cranial_band(f'{p}_komodo_casque_bowl', _p_taotie_bronze(), f_bot=0.63, f_top=0.85, ease=0.022, flare=0.012)
    cr_h = crest(f'{p}_komodo_casque_crest', 0.095, _p_oxblood_chitin(), rows=5, cols=17, sweep=0.065, a0=-0.65, a1=1.55, thick=0.012, host_part=band_h)
    a, b, up, bk, left = head_frame()
    parts_h = [band_h, cr_h]
    for sgn, tag, col_idx in ((1.0, 'L', 10), (-1.0, 'R', 30)):
        anch_hn, _ = _anchor_on_part(band_h, band_h.P[2, col_idx % band_h.P.shape[1]], sink=0.003)
        h_path = [
            anch_hn,
            anch_hn + left * (0.055 * sgn) + up * 0.035 + bk * 0.015,
            anch_hn + left * (0.095 * sgn) + up * 0.095 + bk * 0.035,
            anch_hn + left * (0.075 * sgn) + up * 0.145 + bk * 0.010,
        ]
        parts_h.append(horn(f'{p}_komodo_horn_{tag}', h_path, 0.020, 0.005, _p_shang_bronze('liz_giltbronze', 'liz_castbronze'), n=10, rows=9, rigid_joint='Head'))
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_komodo_taotie_casque', 'Bulwark Horned Taotie Cast-Bronze War-Casque', 'head', 'lizardmen',
        parts_h, covers_hair=True, covers_face=False,
    )))

    # Torso: Sculpted 3D Shang lamellar cast-bronze cuirass + paired articulated taotie pauldrons
    # (open_torso=True, z_top=TOP-0.040 keeps Mod.head_lizard_crest_neck clear, faulds=0 keeps mod_tail sacral zone clear)
    cuir_k = cuirass_plate(
        f'{p}_komodo_cuir', _p_shang_bronze(), trim_paint=_p_taotie_bronze('liz_giltbronze', 'liz_oxblood'),
        style='lamellar', z_top=core.TOP - 0.040, z_bot=core.WAIST + 0.012,
        ease=0.022, keel=0.018, faulds=0, open_torso=True,
    )
    plds_k = articulated_pauldrons(
        f'{p}_komodo_pld', _p_taotie_bronze(), trim_paint=_p_shang_bronze('liz_giltbronze', 'liz_verdigris'),
        lames=3, haute_piece=True, ease=0.014,
    )
    anch_t, out_t = _anchor_on_part(cuir_k[0], chest_front(core.CHEST + 0.015, 0.032), sink=0.002)
    mask_boss = blob(f'{p}_komodo_chest_taotie', anch_t, (0.096, 0.028, 0.092), _p_taotie_bronze('liz_giltbronze', 'liz_oxblood'), n=16, rows=6, out=out_t, role='trinket')
    entries.append(assemble_garment(
        f'{p}_komodo_bronze_lamellar', 'Bulwark Shang Cast-Bronze & Oxblood Lamellar Cuirass', 'torso', 'lizardmen',
        cuir_k + plds_k + [mask_boss], open_torso=True,
    ))

    # Gloves: Sculpted fluted cast-bronze cestus vambraces & winged couters (claws exposed)
    entries.append(assemble_garment(
        f'{p}_komodo_bronze_cestus', 'Bulwark Sculpted Cast-Bronze Leiwen Cestus Vambraces', 'gloves', 'lizardmen',
        sculpted_vambraces(f'{p}_komodo_cestus', _p_shang_bronze(), trim_paint=_p_taotie_bronze('liz_giltbronze', 'liz_oxblood'), couter=True, ease=0.014),
    ))

    # Legs: Heavy verdigris-bronze hinged thigh tassets over tail-safe split bronze apron
    entries.append(assemble_garment(
        f'{p}_komodo_bronze_tassets', 'Bulwark Cast-Bronze Hinged Tassets & Split Apron', 'legs', 'lizardmen',
        _tail_safe_kilt(f'{p}_komodo_tassets', _p_taotie_bronze(), _p_shang_bronze(), core.KNEE + 0.035, flare=0.092, front_plaque_paint=_p_taotie_bronze('liz_giltbronze', 'liz_verdigris'))
        + hinged_tassets(f'{p}_komodo_htass', _p_taotie_bronze(), trim_paint=_p_shang_bronze('liz_giltbronze', 'liz_verdigris'), lames=3, ease=0.028),
    ))

    # Feet: Sculpted cast-bronze anterior-keel shin-greaves & winged knee poleyns over open-clawed sandals
    entries.append(assemble_garment(
        f'{p}_komodo_digi_greaves', 'Bulwark Sculpted Cast-Bronze Taotie Shin-Greaves', 'feet', 'lizardmen',
        sandal(f'{p}_komodo_greaves', _p_oxblood_chitin(), _p_shang_bronze(), guard=True, laces=2)
        + sculpted_greaves(f'{p}_komodo_sgrv', _p_taotie_bronze(), trim_paint=_p_shang_bronze('liz_giltbronze', 'liz_verdigris'), poleyn=True, ease=0.014),
    ))

    # Back: Cyclopean cast-bronze taotie war-totem & twin megafauna horn-rack on Spine2 pad
    pad, p_ctr, d_bk = _dorsal_spine2_frame(f'{p}_komodo_rack', _p_taotie_bronze(), w_pad=0.19, h_pad=0.21)
    n_s, rows_s = 22, 16
    angs_s = np.linspace(0.0, 2.0 * math.pi, n_s, endpoint=False)
    Q_s = np.zeros((rows_s, n_s, 3), dtype=np.float64)
    for i in range(rows_s):
        v = i / float(rows_s - 1)
        taper = 0.22 if i in (0, rows_s - 1) else (1.0 - 0.15 * v)
        Q_s[i] = [[p_ctr[0] + math.cos(an) * 0.115 * taper, p_ctr[1] + 0.046 + math.sin(an) * 0.032 * taper, p_ctr[2] + 0.13 - 0.25 * v] for an in angs_s]
    shield_totem = Part(f'{p}_komodo_totem_shield', Q_s, True, ['body'] * rows_s, _p_taotie_bronze(), rigid_joint='Spine2')
    parts_bk = [pad, shield_totem]
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        anch_rk, _ = _anchor_on_part(shield_totem, [p_ctr[0] + 0.095 * sgn, p_ctr[1] + 0.050, p_ctr[2] + 0.08], sink=0.004)
        parts_bk.append(horn(
            f'{p}_komodo_totem_horn_{tag}',
            [anch_rk, anch_rk + np.array([0.055 * sgn, 0.015, 0.065]), anch_rk + np.array([0.085 * sgn, 0.025, 0.145])],
            0.020, 0.005, _p_carved_bone(), n=10, rows=8, rigid_joint='Spine2',
        ))
    entries.append(assemble_garment(
        f'{p}_komodo_horn_rack', 'Bulwark Taotie Bronze War-Totem & Horn Rack', 'back', 'lizardmen',
        parts_bk,
    ))
    return entries


# ===========================================================================================================
# BUILD ORCHESTRATION, PEOPLES ENTRY & SELF-VERIFICATION
# ===========================================================================================================
TIER_ORDER = [
    ('skink_forager', 0.24, 'Tender Caste · Marsh-Reed & Bronze-Tally Forager'),
    ('iguana_fisher', 0.22, 'Maker Caste · Lagoon Fisher & Chitin-Bronze Artisan'),
    ('gila_venom_spitter', 0.16, 'Drover Caste · Gila-Lacquer Sledge-Drover & Venom-Spitter'),
    ('basilisk_stalker', 0.16, 'Basilisk Vanguard · Sail-Crest Harpoon Skirmisher'),
    ('komodo_juggernaut', 0.14, 'Line-Warrior / Bulwark · Taotie Cast-Bronze Juggernaut'),
    ('tuatara_crest_priest', 0.08, 'Interpreter Caste · 7-Turn Leiwen Spiral Crest-Priest'),
]


def build_lizardmen_kit():
    entries = []
    with _liz_paint_context():
        for body_id, sex_tok in (('mpfb_male', 'm'), ('mpfb_female', 'f')):
            set_body(body_id)
            pref = f'liz_{sex_tok}'
            entries.extend(_build_skink_forager(pref))
            entries.extend(_build_iguana_fisher(pref))
            entries.extend(_build_gila_venom_spitter(pref))
            entries.extend(_build_tuatara_crest_priest(pref))
            entries.extend(_build_basilisk_stalker(pref))
            entries.extend(_build_komodo_juggernaut(pref))
    return entries


def build_lizardmen_peoples_entry():
    def _outfits_for(sex_tok):
        p = f'liz_{sex_tok}'
        return {
            'skink_forager': {
                'head': f'{p}_skink_reed_crest',
                'torso': f'{p}_skink_tally_collar',
                'gloves': f'{p}_skink_reed_cuffs',
                'legs': f'{p}_skink_reed_apron',
                'feet': f'{p}_skink_anklets',
                'back': f'{p}_skink_egg_cradle',
            },
            'iguana_fisher': {
                'head': f'{p}_iguana_spine_crown',
                'torso': f'{p}_iguana_carapace_harness',
                'gloves': f'{p}_iguana_chitin_bracers',
                'legs': f'{p}_iguana_hip_scutes',
                'feet': f'{p}_iguana_marsh_sandals',
                'back': f'{p}_iguana_ingot_creel',
            },
            'gila_venom_spitter': {
                'head': f'{p}_gila_bead_crest',
                'torso': f'{p}_gila_yoke_harness',
                'gloves': f'{p}_gila_venom_bracers',
                'legs': f'{p}_gila_sledge_kilt',
                'feet': f'{p}_gila_shin_greaves',
                'back': f'{p}_gila_gourd_bell_rack',
            },
            'tuatara_crest_priest': {
                'head': f'{p}_tuatara_coil_crown',
                'torso': f'{p}_tuatara_seven_pectoral',
                'gloves': f'{p}_tuatara_spiral_cuffs',
                'legs': f'{p}_tuatara_stela_apron',
                'feet': f'{p}_tuatara_gilt_talons',
                'back': f'{p}_tuatara_bell_arch',
            },
            'basilisk_stalker': {
                'head': f'{p}_basilisk_fin_casque',
                'torso': f'{p}_basilisk_stalker_harness',
                'gloves': f'{p}_basilisk_fin_vambraces',
                'legs': f'{p}_basilisk_pteruges',
                'feet': f'{p}_basilisk_fen_greaves',
                'back': f'{p}_basilisk_war_quiver',
            },
            'komodo_juggernaut': {
                'head': f'{p}_komodo_taotie_casque',
                'torso': f'{p}_komodo_bronze_lamellar',
                'gloves': f'{p}_komodo_bronze_cestus',
                'legs': f'{p}_komodo_bronze_tassets',
                'feet': f'{p}_komodo_digi_greaves',
                'back': f'{p}_komodo_horn_rack',
            },
        }

    return {
        'id': 'lizardmen',
        'name': 'Lizardmen',
        'note': (
            'Hypertropic ectothermic saurian autarky of the Great Rift (LORE.md §6.20): six biological size/role castes '
            'at 1.25x scale wearing reptile heads and counterbalancing tails (`mod_head_lizard`, `mod_tail`). Zero trade, '
            'zero iron/steel, and zero woven cloth — all regalia and panoply are archaic Shang/Zhou verdigris cast bronze '
            '(`leiwen` thunder-spirals, `whorl` coils, `taotie` masks), oxblood & ebony beetle-wing lacquer, butchered '
            'hexapod chitin, carved bone, and bundled marsh-reed (6 castes at 100% M/F parity; tools/garments/cultures/lizardmen.py).'
        ),
        'scale': 1.25,
        'mods': ['mod_head_lizard', 'mod_tail'],
        'ancestry': {
            'african': [0.25, 0.45],
            'asian': [0.35, 0.55],
            'caucasian': [0.15, 0.35],
        },
        'skin': [
            '#5c6e3e',
            '#465931',
            '#3a4d2c',
            '#6b633b',
            '#2f4028',
        ],
        'hair': [
            '#1e2418',
            '#2b3022',
            '#3a3d2c',
        ],
        'eyes': [
            '#d49b24',
            '#c47a18',
            '#b8a028',
            '#8f5614',
        ],
        'grey': 0.85,
        'beard': 0.0,
        'morph': {
            'muscle': [0.25, 0.85],
            'height': [-0.10, 0.55],
            'weight': [-0.05, 0.45],
        },
        'styles': {
            'male': ['short02', 'long01'],
            'female': ['long01', 'braid01'],
        },
        'tiers': [[tid, sh] for tid, sh, _ in TIER_ORDER],
        'tier_labels': {tid: lbl for tid, _, lbl in TIER_ORDER},
        'outfits': {
            'male': _outfits_for('m'),
            'female': _outfits_for('f'),
        },
    }


def _read_glb_pos_tris(glb_path: Path):
    d = glb_path.read_bytes()
    ln = struct.unpack('<I', d[12:16])[0]
    j = json.loads(d[20:20 + ln])
    off = 20 + ln
    bl = struct.unpack('<I', d[off:off + 4])[0]
    b = d[off + 8:off + 8 + bl]
    nd = next(n for n in j['nodes'] if 'mesh' in n)
    pr = j['meshes'][nd['mesh']]['primitives'][0]
    P_arr = glbio.accessor(j, b, pr['attributes']['POSITION']).astype(np.float64)
    T_arr = glbio.accessor(j, b, pr['indices']).reshape(-1, 3)
    return j, b, nd, pr, P_arr, T_arr


def _mesh_components(n_verts, tris):
    re_i = np.concatenate([tris[:, 0], tris[:, 1], tris[:, 2]])
    ce_i = np.concatenate([tris[:, 1], tris[:, 2], tris[:, 0]])
    adj = csr_matrix((np.ones(len(re_i), dtype=np.int8), (re_i, ce_i)), shape=(n_verts, n_verts))
    n_comp, labels = connected_components(adj, directed=False)
    order = np.argsort(labels, kind='mergesort')
    counts = np.bincount(labels, minlength=n_comp)
    splits = np.cumsum(counts)[:-1]
    return [grp for grp in np.split(order, splits) if len(grp) > 1]


def _dense_samples(P_arr, T_arr):
    if not len(T_arr):
        return P_arr
    va, vb, vc = P_arr[T_arr[:, 0]], P_arr[T_arr[:, 1]], P_arr[T_arr[:, 2]]
    return np.vstack([
        P_arr,
        (va + vb + vc) / 3.0,
        0.5 * (va + vb), 0.5 * (vb + vc), 0.5 * (vc + va),
        0.6 * va + 0.2 * vb + 0.2 * vc,
        0.2 * va + 0.6 * vb + 0.2 * vc,
        0.2 * va + 0.2 * vb + 0.6 * vc,
    ])


def _self_verify(kit_entries, p_ent):
    assert p_ent['id'] == 'lizardmen'
    assert p_ent['scale'] == 1.25
    assert p_ent['mods'] == ['mod_head_lizard', 'mod_tail']
    sh_sum = sum(sh for _, sh in p_ent['tiers'] if sh > 0.0)
    assert abs(sh_sum - 1.0) < 1e-9, f'Tier share sum = {sh_sum}'
    assert len(p_ent['outfits']['male']) == 6
    assert set(p_ent['outfits']['male'].keys()) == set(p_ent['outfits']['female'].keys())

    by_key = {(e['_body'], e['id']): e for e in kit_entries}
    assert len(by_key) == 72, f'Expected 72 pieces, got {len(by_key)}'

    max_island_mm = 0.0
    for body_id, sex_key in (('mpfb_male', 'male'), ('mpfb_female', 'female')):
        set_body(body_id)
        y_crotch = float(core.RIG.jpos[core.RIG.J['LeftUpLeg']][1])
        _, _, _, _, BP, BT = _read_glb_pos_tris(ROOT / 'pieces' / body_id / 'base.glb')
        body_tree = cKDTree(_dense_samples(BP, BT))

        for tid, spec in p_ent['outfits'][sex_key].items():
            for slot in ('head', 'torso', 'gloves', 'legs', 'feet', 'back'):
                pid = spec[slot]
                ent = by_key[(body_id, pid)]
                assert ent['slot'] == slot
                glb_p = ROOT / ent['glb']
                morph_p = glb_p.with_suffix('.morph.bin')
                assert glb_p.exists() and glb_p.stat().st_size > 500
                assert morph_p.exists() and morph_p.stat().st_size > 100
                if slot == 'head':
                    assert ent.get('fits_beast') is True, f'{pid} missing fits_beast=True!'
                    assert 'Human.lips' not in (ent.get('hide_parts') or []), f'{pid} must have covers_face=False!'
                if slot == 'feet':
                    assert ent.get('hides', 0) <= 40, f'{pid} hides {ent.get("hides")} > 40!'
                if slot == 'torso':
                    assert 'hide' not in ent, f'{pid} must keep open_torso=True so crest_neck stays visible!'

        for (b_id, gid), ent in by_key.items():
            if b_id != body_id:
                continue
            j, b, nd, pr, P_arr, T_arr = _read_glb_pos_tris(ROOT / ent['glb'])
            if ent['slot'] == 'torso':
                assert not (float(P_arr[:, 1].min()) < y_crotch - 0.065 and 'cloth' not in ent)
            comps = _mesh_components(len(P_arr), T_arr)
            if len(comps) >= 2:
                max_len = max(len(c) for c in comps)
                for comp in comps:
                    if len(comp) == max_len or len(comp) > 280:
                        continue
                    cp_chk = P_arr[comp]
                    d_body = float(body_tree.query(cp_chk)[0].min())
                    other_v = np.ones(len(P_arr), dtype=bool)
                    other_v[comp] = False
                    other_t = other_v[T_arr].all(axis=1)
                    ref_pts = _dense_samples(P_arr, T_arr[other_t]) if other_t.any() else P_arr[other_v]
                    d_garm = float(cKDTree(ref_pts).query(cp_chk)[0].min())
                    d_mm = min(d_body, d_garm) * 1000.0
                    max_island_mm = max(max_island_mm, d_mm)
                    assert d_mm <= 18.0, f'{body_id}/{gid} island ({len(comp)}v) floats {d_mm:.2f}mm > 18.0mm!'

    print(f'[LIZARDMEN SELF-VERIFY PASS] 72 pieces across 6 M/F castes verified (max island gap: {max_island_mm:.2f}mm <= 18.0mm).')


def main():
    t0 = time.perf_counter()
    kit_entries = build_lizardmen_kit()
    peoples_entry = build_lizardmen_peoples_entry()
    _self_verify(kit_entries, peoples_entry)

    manifest_path = CULTURES_DIR / 'lizardmen_manifest.json'
    manifest_data = {
        'culture': 'lizardmen',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    print(f'Successfully built {len(kit_entries)} Lizardmen pieces in {dt:.2f}s -> {manifest_path}')


if __name__ == '__main__':
    main()
