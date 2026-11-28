"""Frogmen (`frogmen`) Procedural Wardrobe Kit — Batrachian Confederacies of the SW Highlands (`0.95x`).

Implements all 14 M+F paired karst-fen tiers across the four Frogmen confederacies (`FM1–FM4`,
`LORE.md` §6.22, `frogmen_and_korona_garment_plan.md` §1.1–2.1 & §3.1) at 100% `mpfb_male` and
`mpfb_female` parity (prefix `frg_{m,f}_*`, `scale: 0.95`, `"mods": ["mod_head_frog"]`):
  1. `fen_spearer`             — FM1 Jrrmiah / Vrrm-Reed Spawning-Fen Spearer (0.15)
  2. `beadcone_reeler`         — FM1 Brrml-Silk Bead-Cone Silk Reeler & Brush-Oil Presser (0.11)
  3. `sump_diver`              — FM1 Grrmp-Sump Flooded Inner-Wall Bore Diver (0.08)
  4. `placer_washer`           — FM1 Krrok-Wash Coldkeep Gold-Panner & Bog-Iron Tender (0.09)
  5. `thunderdome_brave`       — FM2 Trrmb-Pillar Span Thunderdome Leaper-Brave (0.10)
  6. `span_proselyte`          — FM2 Span Dalab-Convert & Salt-Cake Porter (0.06)
  7. `scrap_broker`            — FM3 Jrrmiah / Krrmt Border Trader & Marsh-Fair Broker (0.11)
  8. `opalshell_carver`        — FM3 Srrmk-Fens Opal-Shell Ammolite Artisan (0.08)
  9. `venom_ambusher`          — FM1/FM3 Fishing-Bridge Poison-Dart Hunter & Blowpipe Warden (0.08)
 10. `torpor_warden`           — FM4 Rrrmk-Spring +5,045m Karst-Spring Torpor Shaman (0.06)
 11. `chorus_elder`            — FM1–FM4 Spawning-Pool Chorus Elder & Law-Speaker (0.04)
 12. `warcroak_marshal`        — FM1–FM4 Confederacy War-Croak Marshal (0.04)
 13. `pc_thunderdome_champion` — PC Starter: Span & Jrrmiah Thunderdome Champion (0.00)
 14. `hero_jrrmiah_chorus_lord`— Important NPC: High Chorus-Lord & Fen-King of Jrrmiah (0.00)

Strict Batrachian Anatomy & Cutaneous Respiration Invariants:
- Beast-Head & Eye-Turret Fit (`mod_head_frog`): every `slot == 'head'` entry sets
  `fits_beast = True`, `covers_hair = True`, `covers_face = False`, and seats on the upper
  cranium (`f >= 0.65`, `ease >= 0.019`) arching cleanly above `mod_head_frog` dorsal eye turrets
  and wide mouth/gular throat-sac.
- Gular Throat-Sac & Cutaneous Exposure: every `torso` garment uses `open_torso = True` and
  scoops the anterior throat (`z_top <= TOP - 0.038` across the front) so `face_jaw` gular vocal
  pouch inflation never clips cloth and spotted/marbled amphibian skin stays exposed.
- Webbed Hands & Feet: `gloves` are strictly forearm cuffs/vambraces (`f1 <= 0.92`, preserving
  `Mod.head_frog_webs` 0.60-finger webbing and pads); `feet` are strictly open-toed `sandal()`
  assemblies (`hides == 4 <= 40`).
- Zero `pack_straps()` over open/bare-shoulder torsos: all dorsal packs/quivers/standards anchor
  via a flush `Spine2` pad (`blob`), and court/shaman capes use single-mesh `cape()` (`stiff=0.36`).
- Manifest-only build (`tools/garments/cultures/frogmen_manifest.json`).
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
    chest_front, assemble_garment,
)
from garments.paint import P, B, PN, C, leathery, sample_cultural_tex  # noqa: E402
from garments.types.torso import (  # noqa: E402
    torso_tube, cape, band, crossed_sash, pauldron,
)
from garments.types.armor import (  # noqa: E402
    cuirass_plate, articulated_pauldron, articulated_pauldrons,
    hinged_tassets, sculpted_vambraces, sculpted_greaves,
)
from garments.types.limbs import sleeve  # noqa: E402
from garments.types.footwear import sandal  # noqa: E402
from garments.types.headgear import horn  # noqa: E402
from garments.types.accoutrements import blob, tube  # noqa: E402


# ===========================================================================================================
# CANONICAL FROGMEN PALETTE (`FM_C` — `frogmen_and_korona_garment_plan.md` §3.1)
# ===========================================================================================================
FRG_COLORS = {
    'frg_reed_drab':        (0.111, 0.127, 0.051),  # #5E6442 Retted Vrrm-Reed & Jrrmiah lakeside sedge
    'frg_sphagnum_wet':     (0.046, 0.101, 0.019),  # #3F5A2A Live water-saturated karst sphagnum pads
    'frg_lotus_leaf':       (0.082, 0.215, 0.076),  # Waxed highland bog-lotus canopy green
    'frg_beadcone_ecru':    (0.632, 0.573, 0.400),  # #CFC6A8 Unbleached Brrml-Silk bead-cone cocoon silk
    'frg_brush_oiled':      (0.066, 0.040, 0.013),  # #4A3B24 Brush-oil waterproofed polypore leather
    'frg_peat_hide':        (0.020, 0.013, 0.008),  # #2B241C Bog-tanned Krrmt fen-fungoid & salamander hide
    'frg_fungoid_cap':      (0.148, 0.074, 0.094),  # #6B4E57 Cured shelf-coral & violet polypore armor
    'frg_opal_crimson':     (0.488, 0.034, 0.019),  # #B8372A Red-flash opal-shell ammolite cabochon
    'frg_opal_emerald':     (0.013, 0.302, 0.139),  # #239468 Green-flash opal-shell ammolite & cave-moss
    'frg_cell_amber':       (0.694, 0.330, 0.020),  # #D89A2B Bioluminescent cell-lamp cave-bladder amber
    'frg_bog_iron':         (0.038, 0.031, 0.027),  # #3A3531 Krrok-Wash peat-smelted bog-iron bloom
    'frg_sump_alloy':       (0.198, 0.263, 0.276),  # #7A8B8E Grrmp-Sump corrosion-free ancient-alloys
    'frg_verdigris_bronze': (0.070, 0.205, 0.148),  # #4C7C6B Hrrm-Pass tin-bronze & Span arena prize-plate
    'frg_coldkeep_gold':    (0.586, 0.349, 0.033),  # #C89E36 Waywater Coldkeep stream-placer gold
    'frg_span_godteal':     (0.010, 0.157, 0.191),  # #1F6E78 Dalab Genepriest proselyte-dyed ramie
}

FRG_CUSTOM_MOTIFS = {
    'frg_opal_ammolite',
    'frg_beadcone_chevron',
    'frg_dartfrog_retic',
    'frg_lotus_reed',
}

_FROG_BVH_CACHE = {}
_FROG_ANAT_CACHE = {}


def _get_frog_head_anat(body_id: str) -> dict:
    """Extract exact Batrachian cranial & dorsal eye-turret geometry from `mod_head_frog.glb`."""
    if body_id in _FROG_ANAT_CACHE:
        return _FROG_ANAT_CACHE[body_id]
    glb_p = ROOT / 'pieces' / body_id / 'mod_head_frog.glb'
    j, buf = glbio.read_glb(glb_p.read_bytes())
    sk_pts, sk_tris = [], []
    eye_pts = []
    voff = 0
    for m in j['meshes']:
        for pr in m['primitives']:
            if 'POSITION' not in pr['attributes'] or 'indices' not in pr:
                continue
            mat_name = j['materials'][pr['material']]['name'] if 'material' in pr and j.get('materials') else ''
            P_bl = arms2.from_gl(glbio.accessor(j, buf, pr['attributes']['POSITION']))
            if float(np.abs(P_bl[:, 0]).max()) > 0.25 or len(P_bl) < 12:
                continue
            T_arr = glbio.accessor(j, buf, pr['indices']).reshape(-1, 3)
            if mat_name == 'Mod.head_frog_eye':
                eye_pts.append(P_bl)
            elif mat_name in ('Mod.head_frog', 'Mod.head_frog_jaw'):
                sk_pts.append(P_bl)
                sk_tris.append(T_arr + voff)
                voff += len(P_bl)
    S = np.vstack(sk_pts)
    ST = np.vstack(sk_tris)
    E = np.vstack(eye_pts)
    el = E[E[:, 0] > 0.0]
    er = E[E[:, 0] < 0.0]
    el_c = el.mean(axis=0)
    er_c = er.mean(axis=0)
    r_el = float(np.linalg.norm(el - el_c[None, :], axis=1).max())
    r_er = float(np.linalg.norm(er - er_c[None, :], axis=1).max())
    skull_bvh = FastBVH(S, ST)
    # Sample nasal inter-orbital bridge height (`x ~ 0, y in [-0.115, -0.075]`)
    nose_m = (np.abs(S[:, 0]) < 0.018) & (S[:, 1] > -0.115) & (S[:, 1] < -0.075)
    z_nose = float(S[nose_m, 2].max()) if nose_m.any() else float(E[:, 2].min() + 0.008)
    # Sample broad post-orbital parietal skull table (`|x| < 0.045, y in [-0.015, +0.065]`)
    par_m = (np.abs(S[:, 0]) < 0.045) & (S[:, 1] > -0.015) & (S[:, 1] < 0.065)
    z_parietal = float(S[par_m, 2].max()) if par_m.any() else float(S[:, 2].max())
    anat = {
        'skull_bvh': skull_bvh,
        'skull_pts': S,
        'skull_tris': ST,
        'eye_pts': E,
        'el_c': el_c,
        'er_c': er_c,
        'r_el': r_el,
        'r_er': r_er,
        'z_eye_min': float(E[:, 2].min()),
        'z_eye_max': float(E[:, 2].max()),
        'z_nose': z_nose,
        'z_parietal': z_parietal,
        'c_xy': np.array([0.0, -0.015], dtype=np.float64),
    }
    _FROG_ANAT_CACHE[body_id] = anat
    _FROG_BVH_CACHE[body_id] = skull_bvh
    return anat


def _get_frog_head_bvh(body_id: str) -> FastBVH:
    return _get_frog_head_anat(body_id)['skull_bvh']


def _frg_custom_motif(style, w, h, fg, bg, aspect=1.0):
    base_style = style.split(':')[0]
    H = max(int(h), 1)
    W = max(int(w), 1)
    img = np.empty((H, W, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:H, 0:W]
    u = (xx + 0.5) / W
    v = (yy + 0.5) / H

    if base_style == 'frg_opal_ammolite':
        # Fractured crimson/emerald iridescent fossil-shell ammolite platelets + stone.ammolite.opalshell blend
        nx = max(3.0, round(5.0 * max(aspect, 0.45)))
        ny = max(2.0, round(4.0 / max(aspect, 0.45)))
        row = np.floor(v * ny).astype(int)
        col = np.floor(u * nx + 0.5 * (row % 2)).astype(int)
        gu = ((u * nx + 0.5 * (row % 2)) % 1.0 - 0.5) * 2.0
        gv = ((v * ny) % 1.0 - 0.5) * 2.0
        hex_d = np.maximum(np.abs(gu) * 0.866 + np.abs(gv) * 0.5, np.abs(gv))
        seam = hex_d > 0.84
        alt = ((row * 3 + col * 5) % 3) == 0
        gold_fleck = hex_d < 0.22
        img[alt] = C['frg_opal_emerald']
        img[~alt] = fg
        img[gold_fleck] = C['frg_coldkeep_gold']
        img[seam] = C['frg_bog_iron']
        op = sample_cultural_tex('tex.ammolite_opalshell', W, H, fg, bg, pal_blend=0.26)
        img = 0.52 * img + 0.48 * op

    elif base_style == 'frg_beadcone_chevron':
        # Interlocked 6-strand diagonal cocoon-filament chevron weave
        nx = max(4.0, round(8.0 * max(aspect, 0.45)))
        ny = max(3.0, round(6.0 / max(aspect, 0.45)))
        zig = np.abs(((u * nx) % 2.0) - 1.0)
        wave = (v * ny + 0.65 * zig) % 1.0
        rib = (wave > 0.18) & (wave < 0.52)
        fine = (wave > 0.68) & (wave < 0.84)
        img[rib] = fg
        img[fine] = np.clip(0.55 * np.asarray(fg) + 0.45 * np.asarray(bg), 0.0, 1.0)

    elif base_style == 'frg_dartfrog_retic':
        # Bold aposematic poison-dart reticulated cell-wall mesh
        nx = max(3.0, round(5.5 * max(aspect, 0.45)))
        ny = max(3.0, round(4.5 / max(aspect, 0.45)))
        gu = np.sin(u * nx * math.pi * 2.0 + 0.6 * np.sin(v * ny * math.pi * 2.0))
        gv = np.cos(v * ny * math.pi * 2.0 + 0.6 * np.cos(u * nx * math.pi * 2.0))
        cell = np.hypot(gu, gv)
        web = (cell > 0.72) & (cell < 1.08)
        spot = cell < 0.30
        img[:] = bg
        img[web] = fg
        img[spot] = C['frg_cell_amber']

    elif base_style == 'frg_lotus_reed':
        # Radial lotus-leaf veining & plaited bog-sedge rib texture
        nx = max(6.0, round(12.0 * max(aspect, 0.45)))
        vein = np.abs(((u * nx) % 1.0) - 0.5) < 0.09
        cross = np.abs(((v * 6.0 + 0.25 * np.sin(u * nx * math.pi)) % 1.0) - 0.5) < 0.08
        img[vein] = fg
        img[cross] = np.clip(np.asarray(bg) * 0.72, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def _frg_paint_context():
    saved_colors = {k: C.get(k) for k in FRG_COLORS}
    C.update(FRG_COLORS)
    orig_motif = paint_mod.motif

    def _patched_motif(style, w, h, fg, bg, aspect=1.0):
        base = style.split(':')[0] if isinstance(style, str) else ''
        if base in FRG_CUSTOM_MOTIFS:
            return _frg_custom_motif(style, w, h, fg, bg, aspect=aspect)
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
# SHARED PAINTS
# ===========================================================================================================
def _p_beadcone(base='frg_beadcone_ecru', trim='frg_opal_emerald'):
    return P(base, 0.05, [
        B('top', 0.0, 0.022, 'solid', trim),
        B('bottom', 0.0, 0.038, 'frg_beadcone_chevron', trim, base),
    ], [
        PN(0.0, 1.0, 'frg_beadcone_chevron', trim, base, 0.20),
    ], fabric='cloth.silk.beadcone')


def _p_ammolite(base='frg_opal_crimson'):
    return P(base, 0.04, [
        B('top', 0.0, 0.024, 'solid', 'frg_coldkeep_gold'),
        B('bottom', 0.0, 0.028, 'solid', 'frg_sump_alloy'),
    ], [
        PN(0.0, 1.0, 'frg_opal_ammolite', base, 'frg_opal_emerald', 0.22),
    ], fabric='stone.ammolite.opalshell')


def _p_sedge_reed(base='frg_reed_drab', trim='frg_sphagnum_wet'):
    return P(base, 0.06, [
        B('top', 0.0, 0.022, 'solid', 'frg_brush_oiled'),
        B('bottom', 0.0, 0.030, 'frg_lotus_reed', trim, base),
    ], [
        PN(0.0, 1.0, 'frg_lotus_reed', trim, base, 0.18),
    ], fabric='straw.reed.plaited')


def _p_lotus_canopy(trim='frg_opal_emerald'):
    return P('frg_lotus_leaf', 0.05, [
        B('bottom', 0.0, 0.035, 'frg_lotus_reed', trim, 'frg_lotus_leaf'),
    ], [
        PN(0.0, 1.0, 'frg_lotus_reed', 'frg_sphagnum_wet', 'frg_lotus_leaf', 0.22),
    ], fabric='cloth.oiled')


def _p_sphagnum():
    return P('frg_sphagnum_wet', 0.07, [
        B('top', 0.0, 0.020, 'solid', 'frg_brush_oiled'),
        B('bottom', 0.0, 0.020, 'solid', 'frg_reed_drab'),
    ], fabric='cloth.felt.boiled')


def _p_polypore(base='frg_fungoid_cap', trim='frg_brush_oiled'):
    return leathery(P(base, 0.06, [
        B('top', 0.0, 0.022, 'solid', trim),
        B('bottom', 0.0, 0.028, 'frg_beadcone_chevron', 'frg_verdigris_bronze', base),
    ], fabric='leather.cuir_bouilli'))


def _p_sump_alloy(accent='frg_cell_amber'):
    return P('frg_sump_alloy', 0.04, [
        B('top', 0.0, 0.022, 'solid', accent),
        B('bottom', 0.0, 0.026, 'ancient_hex', accent, 'frg_sump_alloy'),
    ], [
        PN(0.0, 1.0, 'ancient_hex', 'frg_bog_iron', 'frg_sump_alloy', 0.20),
    ], fabric='metal.paktong.brushed')


def _p_thunder_bronze(accent='frg_opal_crimson'):
    return P('frg_verdigris_bronze', 0.05, [
        B('top', 0.0, 0.024, 'solid', 'frg_coldkeep_gold'),
        B('bottom', 0.0, 0.030, 'frg_opal_ammolite', accent, 'frg_verdigris_bronze'),
    ], [
        PN(0.0, 1.0, 'lamellar_scale', 'frg_coldkeep_gold', 'frg_verdigris_bronze', 0.22),
    ], fabric='metal.bronze.verdigris')


def _p_dart_war():
    return P('frg_opal_crimson', 0.05, [
        B('top', 0.0, 0.025, 'solid', 'frg_bog_iron'),
        B('bottom', 0.0, 0.038, 'frg_opal_ammolite', 'frg_opal_crimson', 'frg_opal_emerald'),
    ], [
        PN(0.0, 1.0, 'frg_dartfrog_retic', 'frg_bog_iron', 'frg_opal_crimson', 0.22),
    ], fabric='cloth.silk.beadcone')


# ===========================================================================================================
# BATRACHIAN GEOMETRY HELPERS (TURRET-SAFE HATS/CROWNS, GULAR-SCOOP TORSOS, WEBBED CUFFS & SANDALS)
# ===========================================================================================================
def _mark_beast_head(ent):
    ent['fits_beast'] = True
    return ent


def _anchor_on_part(host_part: Part, target_pt, sink=0.0025):
    P_flat = host_part.P.reshape(-1, 3)
    target = np.asarray(target_pt, dtype=np.float64)
    idx = int(np.argmin(np.linalg.norm(P_flat - target[None, :], axis=1)))
    pt = P_flat[idx].copy()
    ctr = P_flat.mean(axis=0)
    out = pt - ctr
    nrm = float(np.linalg.norm(out))
    out = (out / nrm) if nrm > 1e-6 else np.array([0.0, -1.0, 0.0])
    return pt - out * sink, out


def _ang_diff(a1: float, a2: float) -> float:
    return abs((a1 - a2 + math.pi) % (2.0 * math.pi) - math.pi)


def _repel_from_frog_eyes(Q: np.ndarray, anat: dict, pad: float = 0.0085) -> np.ndarray:
    """Guarantee strict clearance around both `Mod.head_frog_eye` spheres & their forward sightlines."""
    out = Q.copy()
    for ec, re in ((anat['el_c'], anat['r_el']), (anat['er_c'], anat['r_er'])):
        r_safe = re + pad
        dv = out - ec[None, None, :]
        dist = np.linalg.norm(dv, axis=-1)
        m = dist < r_safe
        if np.any(m):
            # Push downward onto sub-orbital shelf or radially away from eye center
            u_dir = dv[m] / np.maximum(dist[m, None], 1e-6)
            u_dir[:, 2] = np.minimum(u_dir[:, 2], -0.35)
            u_dir /= np.maximum(np.linalg.norm(u_dir, axis=1, keepdims=True), 1e-6)
            out[m] = ec[None, :] + u_dir * r_safe
    return out


def _dorsal_frog_z(bvh: FastBVH, x: float, y: float, z_Top: float, fallback: float) -> float:
    h = bvh.ray_cast(np.array([x, y, z_Top], dtype=np.float64), np.array([0.0, 0.0, -1.0], dtype=np.float64), maxd=0.22)
    return (z_Top - float(h)) if h is not None else fallback


def _frog_postorbital_ring(anat: dict, angs: np.ndarray, crown_h: float = 0.026, ease_sk: float = 0.0035, with_prow: bool = True):
    """Build a true Batrachian Post-Orbital Braincase + Inter-Orbital V-Prow contour seated directly on `Mod.head_frog`:
    - Centered on the wide parietal braincase BEHIND the eyes (`c_post = (0.0, +0.030)`),
    - Wraps flush around the occipital & temporal skull (`y_bl in [-0.034 .. +0.112]`),
    - Stays strictly BEHIND both protruding dorsal eye turrets (`y_bl >= y_eye_back + 0.009` laterally) so it NEVER
      straps across the frog's cheeks/snout or clips the rear of either eyeball, and
    - Optionally extends a regal central inter-orbital V-prow (`with_prow=True`) forward between the two eyes (`|x| < 0.024`).
    """
    bvh = anat['skull_bvh']
    z_par = anat['z_parietal']
    z_emin = anat['z_eye_min']
    # Posterior boundary of the eye turrets in Blender space (`y_bl` is negative forward; `eye_pts[:, 1].max()` is back of eye)
    y_eye_back = float(anat['eye_pts'][:, 1].max())  # ~ -0.047
    c_post = np.array([0.0, 0.032], dtype=np.float64)

    xs_b, ys_b, zs_b = [], [], []
    xs_t, ys_t, zs_t = [], [], []
    for an in angs:
        dx, dy = math.sin(an), math.cos(an)
        d_vec = np.array([dx, dy, 0.0], dtype=np.float64)
        w_front = max(0.0, -dy)
        w_prow = math.exp(-((_ang_diff(an, math.pi) / (0.135 * math.pi)) ** 2)) if with_prow else 0.0

        if dy >= -0.15:
            # Posterior & lateral braincase: horizontal ray from `c_post` onto `Mod.head_frog`
            zb = z_emin - 0.016
            zt = z_par + 0.004 + crown_h * (0.72 + 0.28 * max(0.0, dy))
            hb = bvh.ray_cast(np.array([c_post[0], c_post[1], min(zb, z_par - 0.018)]), d_vec, maxd=0.22)
            rb = (float(hb) if hb is not None else 0.082) + ease_sk
            ht = bvh.ray_cast(np.array([c_post[0], c_post[1], min(zt, z_par - 0.010)]), d_vec, maxd=0.22)
            rt_raw = (float(ht) if ht is not None else (rb - ease_sk)) + ease_sk
            rt = max(0.038, rt_raw - 0.28 * max(0.0, zt - (z_par - 0.004)))
            xb, yb = c_post[0] + dx * rb, c_post[1] + dy * rb
            xt, yt = c_post[0] + dx * rt, c_post[1] + dy * rt
        else:
            # Anterior post-orbital brow rim: rests ON TOP OF the dorsal cranium behind the eyes, with central V-prow between eyes!
            hb = bvh.ray_cast(np.array([c_post[0], c_post[1], z_emin - 0.016]), d_vec, maxd=0.22)
            r_side = min((float(hb) if hb is not None else 0.080), 0.082)
            # Base post-orbital arch stays behind `y_eye_back + 0.010` (~ -0.037), while central V-prow reaches y = -0.082 between eyes!
            y_target = (y_eye_back + 0.011) * (1.0 - w_prow) + (-0.082) * w_prow
            x_target = dx * r_side * (1.0 - 0.52 * w_prow)
            # Ensure lateral points outside the inter-orbital corridor never intrude into eye X/Y footprint
            xb, yb = x_target, max(y_target, (c_post[1] + dy * r_side))
            z_surf = _dorsal_frog_z(bvh, xb, yb, z_par + 0.08, anat['z_nose'])
            zb = z_surf + 0.0022
            h_front = (0.016 + 0.45 * crown_h) * (1.0 - 0.25 * w_front) + 0.006 * w_prow
            zt = zb + h_front
            xt, yt = xb * 0.94, yb + 0.004 * (1.0 - w_prow)

        xs_b.append(xb); ys_b.append(yb); zs_b.append(zb)
        xs_t.append(xt); ys_t.append(yt); zs_t.append(zt)

    Pb = np.column_stack([xs_b, ys_b, zs_b])
    Pt = np.column_stack([xs_t, ys_t, zs_t])
    for _ in range(2):
        Pb = 0.50 * Pb + 0.25 * (np.roll(Pb, 1, axis=0) + np.roll(Pb, -1, axis=0))
        Pt = 0.50 * Pt + 0.25 * (np.roll(Pt, 1, axis=0) + np.roll(Pt, -1, axis=0))
    return Pb, Pt


def _frog_cranial_band(name, paint, f_bot=0.66, f_top=0.82, ease=0.020, flare=0.012, rows=8, n=40):
    """True Batrachian Post-Orbital Crown / Casque / Diadem seated flush on `Mod.head_frog` behind the eyes,
    with a sculpted central inter-orbital V-prow nestled cleanly between the two protruding golden eyes."""
    anat = _get_frog_head_anat(core.BODY_ID)
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    crown_h = max(0.016, (float(f_top) - float(f_bot)) * 0.18)
    ease_sk = max(0.0030, min(0.0050, float(ease) * 0.18))
    Pb, Pt = _frog_postorbital_ring(anat, angs, crown_h=crown_h, ease_sk=ease_sk, with_prow=True)
    c_post = np.array([0.0, 0.032, 0.0], dtype=np.float64)

    Q = np.zeros((rows, n, 3), dtype=np.float64)
    for i in range(rows):
        v = i / float(max(rows - 1, 1))  # 0 = top rim, 1 = bottom rim
        pts = Pt * (1.0 - v) + Pb * v
        rad_xy = pts[:, :2] - c_post[:2][None, :]
        rn = np.maximum(np.linalg.norm(rad_xy, axis=1, keepdims=True), 1e-6)
        u_xy = rad_xy / rn
        # Gentle outward crown flare on upper rows across posterior/lateral braincase only
        back_w = np.clip((pts[:, 1] - (-0.025)) / 0.05, 0.0, 1.0)[:, None]
        pts[:, :2] += u_xy * (float(flare) * ((1.0 - v) ** 1.3)) * back_w
        Q[i] = pts

    Q = _repel_from_frog_eyes(Q, anat, pad=0.010)
    return Part(name, Q, True, ['top'] + ['body'] * (rows - 2) + ['bottom'], paint, rigid_joint='Head')


def _frog_canopy_hat(name, paint, r_brim=0.25, h_cone=0.11, droop=0.015, scallop=0.04, n=48):
    """Batrachian Post-Orbital Lotus/Sedge Canopy Hat:
    - Snug woven inner skull-ring seats strictly on the post-orbital braincase BEHIND the eye turrets (zero nose-chute!),
    - Wide canopy vaults cleanly ABOVE both golden Frogman eyes (`+10 deg` aft rake + twin orbital brow-arches) so both
      eyes are 100% open and framed underneath a crisp vaulted brim."""
    anat = _get_frog_head_anat(core.BODY_ID)
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    Pb, Pt = _frog_postorbital_ring(anat, angs, crown_h=0.012, ease_sk=0.0035, with_prow=False)

    c_can_xy = np.array([0.0, 0.026], dtype=np.float64)
    an_el = math.atan2(float(anat['el_c'][0] - c_can_xy[0]), float(anat['el_c'][1] - c_can_xy[1])) % (2.0 * math.pi)
    an_er = math.atan2(float(anat['er_c'][0] - c_can_xy[0]), float(anat['er_c'][1] - c_can_xy[1])) % (2.0 * math.pi)
    z_brim_base = anat['z_eye_max'] + 0.018
    z_apex = z_brim_base + float(h_cone) * 0.92

    Q = []
    # Rows 0..5: apex down to wide vaulted brim (raked aft so front rim floats high above both eyes!)
    for k in range(6):
        u = k / 5.0
        row = []
        for j, an in enumerate(angs):
            dx, dy = math.sin(an), math.cos(an)
            d_eye = min(_ang_diff(an, an_el), _ang_diff(an, an_er))
            w_eye = math.exp(-((d_eye / (0.18 * math.pi)) ** 2))
            aft_rake = -0.024 * dy * u
            eye_arch = 0.016 * w_eye * u
            r_cur = (0.008 + (float(r_brim) - 0.008) * (u ** 0.92)) * (1.0 + float(scallop) * math.cos(8.0 * an) * u)
            zz = z_apex * (1.0 - u) + (z_brim_base - float(droop) * max(0.0, 0.3 + 0.7 * dy) * (u * u)) * u + aft_rake + eye_arch
            row.append([c_can_xy[0] + dx * r_cur, c_can_xy[1] + dy * r_cur, zz])
        Q.append(row)

    # Row 6: flat/vaulted underside return smoothly converging back to the post-orbital crown top ABOVE eye level!
    outer_brim = Q[-1]
    row_under = []
    for j in range(n):
        p_out = np.asarray(outer_brim[j])
        p_top = Pt[j].copy()
        p_top[2] = max(p_top[2] + 0.008, anat['z_eye_max'] + 0.012)
        p_mid = 0.32 * p_out + 0.68 * p_top
        p_mid[2] = max(p_mid[2], anat['z_eye_max'] + 0.014)
        row_under.append(p_mid.tolist())
    Q.append(row_under)

    # Rows 7..8: snug post-orbital braincase sweatband behind the eyes (`Pt -> Pb`, zero front chute!)
    Q.append((0.75 * Pt + 0.25 * Pb).tolist())
    Q.append(Pb.tolist())

    Q_arr = np.array(Q, dtype=np.float64)
    Q_arr = _repel_from_frog_eyes(Q_arr, anat, pad=0.010)
    return Part(name, Q_arr, True, ['body'] * len(Q_arr), paint, rigid_joint='Head')
    Q_arr = _repel_from_frog_eyes(Q_arr, anat, pad=0.0090)
    return Part(name, Q_arr, True, ['body'] * len(Q_arr), paint, rigid_joint='Head')


def _gular_open_vest(name, paint, z_bot, z_top_back=None, ease=0.018, open_arc=0.30):
    """Seamless 360-degree closed wrap-vest/bolero (`closed=True`) whose anterior neckline scoops
    deeply down to `CHEST + 0.02` (`>12 cm` below `TOP`) so `mod_head_frog` gular vocal sac inflation
    never touches cloth while shoulders and back seat cleanly without open-panel flap hover."""
    zt = z_top_back if z_top_back is not None else (core.SHOULDER + 0.018)
    zt = min(float(zt), core.TOP - 0.024)
    zb = float(z_bot)
    rows = 12
    n = 38
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    x, y = np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0])
    scoop_depth = max(0.065, min(0.145, (zt - zb) * 0.52))
    Q = np.zeros((rows, n, 3), dtype=np.float64)
    for k in range(rows):
        v = k / float(rows - 1)
        ek = float(ease) + 0.003 * v
        for j, an in enumerate(angs):
            front_w = max(0.0, math.cos(an - math.pi)) ** 1.8
            z_top_j = zt - scoop_depth * front_w
            zz = z_top_j * (1.0 - v) + zb * v
            c = spine_at(min(zz, core.TOP))
            d = x * math.cos(an) + y * math.sin(an)
            d /= np.linalg.norm(d)
            h = first_hit(c, d, bvh=core.BVH_T) or 0.115
            px, py = c[0] + d[0] * (h + ek), c[1] + d[1] * (h + ek)
            pz = zz
            if abs(px) >= 0.068 and abs(py - c[1]) <= 0.068 and pz >= core.SHOULDER - 0.035:
                hd = first_hit(np.array([px, py, core.TOP + 0.12]), np.array([0.0, 0.0, -1.0]), maxd=0.28, bvh=core.BVH_T)
                if hd is not None:
                    pz = min(pz, (core.TOP + 0.12 - float(hd)) + ek)
            Q[k, j] = [px, py, pz]
    for _ in range(2):
        Q_nb = 0.50 * Q + 0.25 * (np.roll(Q, 1, axis=1) + np.roll(Q, -1, axis=1))
        Q[1:-1] = 0.65 * Q_nb[1:-1] + 0.175 * (Q_nb[:-2] + Q_nb[2:])
        Q[0] = Q_nb[0]
        Q[-1] = Q_nb[-1]
    return Part(name, Q, True, ['top'] + ['body'] * (rows - 2) + ['bottom'], paint, role='trunk')


def _gular_pectoral_collar(name, paint, drop=0.095, ease=0.019):
    """Ceremonial pectoral collar seated strictly below `TOP - 0.040` on the anterior chest so the inflating
    gular vocal pouch rides freely above it."""
    z_top = core.TOP - 0.042
    zs = np.linspace(z_top, z_top - float(drop), 8)
    angs = np.linspace(0.0, 2.0 * math.pi, 38, endpoint=False)
    x, y = np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0])
    Q = np.zeros((8, 38, 3), dtype=np.float64)
    for k, zz in enumerate(zs):
        ek = ease + 0.004 * (k / 7.0)
        c = spine_at(zz)
        for j, an in enumerate(angs):
            d = x * math.cos(an) + y * math.sin(an)
            d /= np.linalg.norm(d)
            h = first_hit(c, d, bvh=core.BVH_T) or 0.095
            px, py = c[0] + d[0] * (h + ek), c[1] + d[1] * (h + ek)
            pz = zz
            if abs(px) >= 0.068 and abs(py - c[1]) <= 0.068 and pz >= core.SHOULDER - 0.035:
                hd = first_hit(np.array([px, py, core.TOP + 0.12]), np.array([0.0, 0.0, -1.0]), maxd=0.28, bvh=core.BVH_T)
                if hd is not None:
                    pz = min(pz, (core.TOP + 0.12 - float(hd)) + ek)
            Q[k, j] = [px, py, pz]
    return Part(name, Q, True, ['top'] + ['body'] * 6 + ['bottom'], paint, role='collar')


def _fen_kilt(gid, belt_paint, skirt_paint, z_bot, flare=0.075, jagged=0.0, pouch_paint=None):
    """Non-overlapping rigid waist sash (`[WAIST-0.012, WAIST+0.030]`) + cloth kilt starting strictly below
    at `z0 = WAIST - 0.045` (zero suprapubic z-fighting!)."""
    belt = torso_tube(
        f'{gid}_belt', core.WAIST + 0.030, core.WAIST - 0.012, 0.017, belt_paint,
        n=40, rows=5, hull_from=core.WAIST + 0.06, role='belt',
    )
    z0 = core.WAIST - 0.045
    sk = torso_tube(
        f'{gid}_kilt', z0, z_bot, 0.024, skirt_paint,
        n=38, rows=16, hang_from=z0, flare=flare, jagged=jagged,
        group_below=core.CROTCH + 0.02, hull_from=z0, stiff=0.14,
    )
    parts = [belt, sk]
    if pouch_paint is not None:
        for idx_p, col_k in enumerate((9, 31)):
            anch_p, out_p = _anchor_on_part(belt, belt.P[2, col_k % belt.P.shape[1]], sink=0.003)
            parts.append(blob(
                f'{gid}_gourd_{idx_p}', anch_p, (0.058, 0.036, 0.068),
                pouch_paint, n=12, rows=6, out=out_p, role='accessory',
            ))
    return parts


def _web_safe_cuffs(gid, paint, boss_paint=None, f0=0.52, f1=0.91, ease=0.011):
    """Forearm cuffs ending strictly proximal to wrist/metacarpals (`f1 <= 0.92`) so `Mod.head_frog_webs`
    webbed fingers and pads remain 100% uncovered."""
    out = []
    for side in (L, R):
        sl = sleeve(f'{gid}_{side[0]}', side, paint, f0=f0, f1=f1, ease=ease, flare=0.003, rows=8, n=20)
        out.append(sl)
        if boss_paint is not None:
            mid_r = sl.P[sl.P.shape[0] // 2]
            idx_top = int(np.argmax(mid_r[:, 2]))
            anch = mid_r[idx_top].copy()
            out_v = anch - mid_r.mean(axis=0)
            out_v /= max(float(np.linalg.norm(out_v)), 1e-6)
            out.append(blob(
                f'{gid}_gem_{side[0]}', anch - out_v * 0.002, (0.028, 0.016, 0.034),
                boss_paint, n=12, rows=5, out=out_v, rigid_joint=side + 'ForeArm',
            ))
    return out


def _dorsal_pad(gid, paint, w_pad=0.15, h_pad=0.18):
    z_ctr = 0.5 * (core.CHEST + core.SHOULDER) - 0.02
    c_sp = spine_at(z_ctr)
    d_bk = np.array([0.0, 1.0, 0.0])
    h_bk = first_hit(c_sp, d_bk, maxd=0.28, bvh=core.BVH_T)
    y_surf = float(c_sp[1]) + (float(h_bk) if h_bk is not None else 0.105)
    pad_ctr = np.array([float(c_sp[0]), y_surf + 0.022, z_ctr], dtype=np.float64)
    pad = blob(f'{gid}_pad', pad_ctr, (w_pad, 0.030, h_pad), paint, n=18, rows=8, out=d_bk, rigid_joint='Spine2')
    return pad, pad_ctr, d_bk


def _cyl_pack(name, p_ctr, rx, ry, h_tot, paint):
    n_p, rows_p = 22, 16
    angs = np.linspace(0.0, 2.0 * math.pi, n_p, endpoint=False)
    Q = np.zeros((rows_p, n_p, 3), dtype=np.float64)
    for i in range(rows_p):
        v = i / float(rows_p - 1)
        taper = 0.20 if i in (0, rows_p - 1) else 1.0
        Q[i] = [[p_ctr[0] + math.cos(an) * rx * taper, p_ctr[1] + 0.048 + math.sin(an) * ry * taper, p_ctr[2] + 0.5 * h_tot - h_tot * v] for an in angs]
    return Part(name, Q, True, ['body'] * rows_p, paint, rigid_joint='Spine2')


# ===========================================================================================================
# SHARED GLOVES & OPEN-TOE SANDALS POOL + 14 UNIQUE TIER BUILDERS
# ===========================================================================================================
def _build_shared_limb_pieces(p):
    entries = []
    # Shared Gloves (9 distinct batrachian forearm cuff sets)
    entries.append(assemble_garment(
        f'{p}_sphagnum_cuffs', 'Wet-Sphagnum Cutaneous Hydration Wrist-Cuffs', 'gloves', 'frogmen',
        _web_safe_cuffs(f'{p}_sphagnum_cuff', _p_sphagnum(), f0=0.62, f1=0.91),
    ))
    entries.append(assemble_garment(
        f'{p}_reeler_armguards', 'Bead-Cone Silk & Polypore Reeling Forearm Guards', 'gloves', 'frogmen',
        _web_safe_cuffs(f'{p}_reeler_guard', _p_beadcone(), boss_paint=_p_polypore(), f0=0.46, f1=0.90),
    ))
    entries.append(assemble_garment(
        f'{p}_diver_lamp_bracers', 'Cell-Lamp Bioluminescent & Sump-Alloy Dive Bracers', 'gloves', 'frogmen',
        _web_safe_cuffs(f'{p}_diver_bracer', _p_sump_alloy(), boss_paint=P('frg_cell_amber', 0.02, fabric='beads.glass'), f0=0.45, f1=0.91),
    ))
    entries.append(assemble_garment(
        f'{p}_washer_iron_cuffs', 'Krrok-Wash Bog-Iron Slag-Guard Wristlets', 'gloves', 'frogmen',
        _web_safe_cuffs(f'{p}_washer_cuff', P('frg_bog_iron', 0.05, fabric='metal.iron'), boss_paint=P('frg_coldkeep_gold', 0.02, fabric='metal.gold'), f0=0.55, f1=0.91),
    ))
    entries.append(assemble_garment(
        f'{p}_thunderdome_vambraces', 'Span Thunderdome Sculpted Bronze Vambraces', 'gloves', 'frogmen',
        sculpted_vambraces(f'{p}_thunder_vam', _p_thunder_bronze(), trim_paint=P('frg_coldkeep_gold', 0.03, fabric='metal.gold'), couter=True, ease=0.014),
    ))
    entries.append(assemble_garment(
        f'{p}_broker_brass_cuffs', 'Krrmt Marsh-Fair Brass-Studded Silk Wrist-Wraps', 'gloves', 'frogmen',
        _web_safe_cuffs(f'{p}_broker_cuff', _p_beadcone('frg_beadcone_ecru', 'frg_coldkeep_gold'), boss_paint=P('frg_coldkeep_gold', 0.02, fabric='metal.gold'), f0=0.54, f1=0.91),
    ))
    entries.append(assemble_garment(
        f'{p}_ambusher_bark_bracers', 'Fishing-Bridge Bark-Cord & Lichen Blowgun Bracers', 'gloves', 'frogmen',
        _web_safe_cuffs(f'{p}_ambusher_bracer', _p_sedge_reed('frg_peat_hide', 'frg_sphagnum_wet'), f0=0.44, f1=0.91),
    ))
    entries.append(assemble_garment(
        f'{p}_torpor_quilted_cuffs', 'Rrrmk-Spring Quilted Sphagnum Thermal Forearm Sleeves', 'gloves', 'frogmen',
        _web_safe_cuffs(f'{p}_torpor_cuff', P('frg_sphagnum_wet', 0.06, fabric='cloth.quilted.diamond'), f0=0.26, f1=0.91, ease=0.013),
    ))
    entries.append(assemble_garment(
        f'{p}_gold_ammolite_cuffs', 'Coldkeep Gold & Opal-Shell Ammolite Royal Bracers', 'gloves', 'frogmen',
        _web_safe_cuffs(f'{p}_royal_cuff', P('frg_coldkeep_gold', 0.03, fabric='metal.gold'), boss_paint=_p_ammolite(), f0=0.38, f1=0.92),
    ))
    entries.append(assemble_garment(
        f'{p}_marshal_alloy_vambraces', 'War-Croak Sculpted Sump-Alloy Fluted Vambraces', 'gloves', 'frogmen',
        sculpted_vambraces(f'{p}_marshal_vam', _p_sump_alloy('frg_opal_crimson'), trim_paint=P('frg_coldkeep_gold', 0.03, fabric='metal.gold'), couter=True, ease=0.014),
    ))

    # Shared Open-Toe Sandals / Bog-Spats (`sandal()`, `hides == 4 <= 40` across all 8 sets!)
    entries.append(assemble_garment(
        f'{p}_sedge_bog_spats', 'Open-Toe Plaited Bog-Sedge & Sphagnum Spat Sandals', 'feet', 'frogmen',
        sandal(f'{p}_sedge_spats', _p_sedge_reed(), _p_sphagnum(), guard=False, laces=2),
    ))
    entries.append(assemble_garment(
        f'{p}_lotus_ring_sandals', 'Open-Toe Bead-Cone Silk & Lotus Ankle-Ring Sandals', 'feet', 'frogmen',
        sandal(f'{p}_lotus_sandals', _p_sedge_reed(), _p_beadcone(), guard=False, laces=1),
    ))
    entries.append(assemble_garment(
        f'{p}_diver_lead_sandals', 'Grrmp-Sump Ballast-Ring Dive Stirrup Sandals', 'feet', 'frogmen',
        sandal(f'{p}_diver_sandals', _p_polypore('frg_peat_hide'), _p_sump_alloy(), guard=True, laces=2),
    ))
    entries.append(assemble_garment(
        f'{p}_karst_stirrup_sandals', 'Open-Forefoot Polypore Karst Stirrup Sandals', 'feet', 'frogmen',
        sandal(f'{p}_karst_sandals', _p_polypore(), _p_sedge_reed(), guard=True, laces=2),
    ))
    entries.append(assemble_garment(
        f'{p}_thunderdome_greaves', 'Span Thunderdome Sculpted Bronze Open-Toe Greaves', 'feet', 'frogmen',
        sandal(f'{p}_thunder_greaves', _p_polypore(), _p_thunder_bronze(), guard=True, laces=2)
        + sculpted_greaves(f'{p}_thunder_sgrv', _p_thunder_bronze(), trim_paint=P('frg_coldkeep_gold', 0.03, fabric='metal.gold'), poleyn=True, ease=0.014),
    ))
    entries.append(assemble_garment(
        f'{p}_torpor_karst_gaiters', 'Insulated Sphagnum-Silk Open-Toe Karst Gaiter Sandals', 'feet', 'frogmen',
        sandal(f'{p}_torpor_gaiters', _p_polypore(), _p_sphagnum(), guard=True, laces=3, greave=_p_sphagnum()),
    ))
    entries.append(assemble_garment(
        f'{p}_gold_ankle_sandals', 'Coldkeep Gold & Opal-Shell Ceremonial Ankle-Ring Sandals', 'feet', 'frogmen',
        sandal(f'{p}_gold_sandals', _p_beadcone(), P('frg_coldkeep_gold', 0.03, fabric='metal.gold'), guard=True, laces=2),
    ))
    entries.append(assemble_garment(
        f'{p}_marshal_alloy_greaves', 'War-Croak Sculpted Sump-Alloy Open-Toe Shin-Greaves', 'feet', 'frogmen',
        sandal(f'{p}_marshal_greaves', _p_polypore('frg_peat_hide'), _p_sump_alloy(), guard=True, laces=2)
        + sculpted_greaves(f'{p}_marshal_sgrv', _p_sump_alloy('frg_opal_crimson'), trim_paint=P('frg_coldkeep_gold', 0.03, fabric='metal.gold'), poleyn=True, ease=0.014),
    ))
    return entries


def _build_frogmen_tiers(p):
    entries = []
    a, b, up, bk, left = head_frame()

    # --- TIER 1: FEN SPEARER (`fen_spearer`) ---
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_spearer_lotus_canopy', 'Spawning-Fen Waxed Lotus-Leaf Sun Canopy', 'head', 'frogmen',
        [_frog_canopy_hat(f'{p}_spearer_canopy', _p_lotus_canopy(), r_brim=0.23, h_cone=0.085, droop=0.018, scallop=0.06)],
        covers_hair=True, covers_face=False,
    )))
    sash_sp = crossed_sash(f'{p}_spearer_baldric', _p_sedge_reed(), width=0.056, ease=0.020)
    anch_sp, out_sp = _anchor_on_part(sash_sp, chest_front(core.WAIST + 0.05, 0.022), sink=0.002)
    salt_gourd = blob(f'{p}_spearer_salt_gourd', anch_sp, (0.056, 0.036, 0.068), P('frg_cell_amber', 0.03, fabric='beads.glass'), n=12, rows=6, out=out_sp, role='trinket')
    entries.append(assemble_garment(
        f'{p}_spearer_sedge_baldric', 'Plaited Bog-Sedge Baldric & Sealed Salt-Gourd', 'torso', 'frogmen',
        [sash_sp, salt_gourd], open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_spearer_reed_kilt', 'Split Vrrm-Reed Spawning-Fen Fringe Kilt', 'legs', 'frogmen',
        _fen_kilt(f'{p}_spearer_kilt', _p_polypore('frg_brush_oiled'), _p_sedge_reed(), core.CROTCH - 0.12, flare=0.070, jagged=0.05),
    ))
    pad1, ctr1, _ = _dorsal_pad(f'{p}_spearer_quiv', _p_sphagnum())
    q1 = horn(f'{p}_spearer_quiv_tube', [ctr1 + np.array([-0.03, 0.042, -0.11]), ctr1 + np.array([0.04, 0.048, 0.13])], 0.036, 0.046, _p_sedge_reed(), n=20, rows=16, rigid_joint='Spine2')
    entries.append(assemble_garment(
        f'{p}_spearer_harpoon_quiver', 'Bog-Reed Harpoon Quiver & Sphagnum Hydration Pad', 'back', 'frogmen',
        [pad1, q1],
    ))

    # --- TIER 2: BEADCONE REELER (`beadcone_reeler`) ---
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_reeler_silk_canopy', 'Brrml-Silk Pleated Bead-Cone Sun Canopy', 'head', 'frogmen',
        [_frog_canopy_hat(f'{p}_reeler_hat', _p_beadcone(), r_brim=0.24, h_cone=0.095, droop=0.012, scallop=0.03)],
        covers_hair=True, covers_face=False,
    )))
    entries.append(assemble_garment(
        f'{p}_reeler_silk_bolero', 'Cropped Bead-Cone Silk Gular-Scoop Bolero', 'torso', 'frogmen',
        [_gular_open_vest(f'{p}_reeler_bolero', _p_beadcone(), core.CHEST - 0.04, ease=0.021, open_arc=0.34)],
        open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_reeler_silk_sarong', 'Natural Ecru Bead-Cone Silk Wrap-Sarong', 'legs', 'frogmen',
        _fen_kilt(f'{p}_reeler_sarong', _p_polypore('frg_brush_oiled'), _p_beadcone(), core.KNEE - 0.02, flare=0.075),
    ))
    pad2, ctr2, _ = _dorsal_pad(f'{p}_reeler_rack', _p_polypore('frg_brush_oiled'))
    entries.append(assemble_garment(
        f'{p}_reeler_bobbin_rack', 'Bead-Cone Silk Reel & Brush-Oil Gourd Frame', 'back', 'frogmen',
        [pad2, _cyl_pack(f'{p}_reeler_spool', ctr2, 0.078, 0.048, 0.22, _p_beadcone())],
    ))

    # --- TIER 3: SUMP DIVER (`sump_diver`) ---
    band_dv = _frog_cranial_band(f'{p}_diver_band', _p_sump_alloy(), f_bot=0.67, f_top=0.80, ease=0.019)
    anch_dv, out_dv = _anchor_on_part(band_dv, band_dv.P[1, band_dv.P.shape[1] // 2], sink=0.002)
    lamp_dv = blob(f'{p}_diver_cell_lens', anch_dv, (0.036, 0.022, 0.032), P('frg_cell_amber', 0.02, fabric='beads.glass'), n=14, rows=6, out=out_dv, rigid_joint='Head')
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_diver_lamp_circlet', 'Grrmp-Sump Ancient-Alloy & Cell-Lamp Dive Circlet', 'head', 'frogmen',
        [band_dv, lamp_dv], covers_hair=True, covers_face=False,
    )))
    b_dl = band(f'{p}_diver_str_l', core.WAIST + 0.01, core.SHOULDER + 0.010, 0.048, 0.020, _p_sump_alloy(), high=math.pi * 0.45, rows=5)
    b_dr = band(f'{p}_diver_str_r', core.WAIST + 0.01, core.SHOULDER + 0.010, 0.048, 0.020, _p_sump_alloy(), high=-math.pi * 0.45, rows=5)
    entries.append(assemble_garment(
        f'{p}_diver_alloy_harness', 'Inner-Wall Bore Salvage-Cord & Alloy Dive Harness', 'torso', 'frogmen',
        [b_dl, b_dr], open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_diver_ballast_wrap', 'Oiled Polypore Swim-Wrap & Tin Ballast Belt', 'legs', 'frogmen',
        _fen_kilt(f'{p}_diver_wrap', _p_sump_alloy(), _p_polypore('frg_peat_hide'), core.CROTCH - 0.08, flare=0.055, pouch_paint=_p_sump_alloy()),
    ))
    pad3, ctr3, _ = _dorsal_pad(f'{p}_diver_pack', _p_sump_alloy())
    entries.append(assemble_garment(
        f'{p}_diver_salvage_pack', 'Flooded-Bore Relay Salvage Net & Alloy Canister', 'back', 'frogmen',
        [pad3, _cyl_pack(f'{p}_diver_canister', ctr3, 0.075, 0.052, 0.23, _p_sump_alloy())],
    ))

    # --- TIER 4: PLACER WASHER (`placer_washer`) ---
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_washer_sedge_hat', 'Krrok-Wash Wide-Brimmed Woven Sedge Rain-Hat', 'head', 'frogmen',
        [_frog_canopy_hat(f'{p}_washer_hat', _p_sedge_reed('frg_reed_drab', 'frg_brush_oiled'), r_brim=0.27, h_cone=0.105, droop=0.020, scallop=0.02)],
        covers_hair=True, covers_face=False,
    )))
    vest_pw = _gular_open_vest(f'{p}_washer_vest', _p_polypore('frg_brush_oiled'), core.WAIST + 0.02, ease=0.022, open_arc=0.28)
    entries.append(assemble_garment(
        f'{p}_washer_polypore_harness', 'Oiled Fungoid-Cap Polypore Bloomery Harness', 'torso', 'frogmen',
        [vest_pw], open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_washer_placer_kilt', 'Coldkeep Gold-Washer Bog-Reed Kilt & Nugget Pouches', 'legs', 'frogmen',
        _fen_kilt(f'{p}_washer_kilt', P('frg_bog_iron', 0.05, fabric='metal.iron'), _p_sedge_reed(), core.KNEE + 0.05, flare=0.068, pouch_paint=P('frg_coldkeep_gold', 0.03, fabric='metal.gold')),
    ))
    pad4, ctr4, d_bk4 = _dorsal_pad(f'{p}_washer_pan', _p_polypore())
    pan = _cyl_pack(f'{p}_washer_pan_disc', ctr4, 0.115, 0.028, 0.21, P('frg_bog_iron', 0.05, fabric='metal.iron'))
    entries.append(assemble_garment(
        f'{p}_washer_pan_rack', 'Waywater Coldkeep Gold-Washing Pan & Bloomery Rack', 'back', 'frogmen',
        [pad4, pan],
    ))

    # --- TIER 5: THUNDERDOME BRAVE (`thunderdome_brave`) ---
    band_tb = _frog_cranial_band(f'{p}_brave_band', _p_thunder_bronze(), f_bot=0.65, f_top=0.81, ease=0.020)
    parts_tb = [band_tb]
    for sgn, tag, col_k in ((1.0, 'L', 8), (-1.0, 'R', 32)):
        anch_bh, _ = _anchor_on_part(band_tb, band_tb.P[1, col_k], sink=0.003)
        parts_tb.append(horn(
            f'{p}_brave_horn_{tag}',
            [anch_bh, anch_bh + left * (0.045 * sgn) + up * 0.055, anch_bh + left * (0.035 * sgn) + up * 0.115 + bk * 0.020],
            0.016, 0.004, _p_ammolite(), n=10, rows=8, rigid_joint='Head',
        ))
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_brave_bronze_crest', 'Span Thunderdome Bronze & Opal-Shell Horn-Crest', 'head', 'frogmen',
        parts_tb, covers_hair=True, covers_face=False,
    )))
    cuir_tb = cuirass_plate(
        f'{p}_brave_cuir', _p_thunder_bronze(), trim_paint=P('frg_coldkeep_gold', 0.03, fabric='metal.gold'),
        style='musculata', z_top=core.TOP - 0.044, z_bot=core.WAIST + 0.015,
        ease=0.020, keel=0.012, faulds=0, open_torso=True,
    )
    pld_tb = articulated_pauldron(
        f'{p}_brave_pld', R, _p_thunder_bronze(),
        trim_paint=P('frg_coldkeep_gold', 0.03, fabric='metal.gold'),
        lames=3, haute_piece=True, ease=0.014,
    )
    entries.append(assemble_garment(
        f'{p}_brave_arena_harness', 'Thunderdome Sculpted Bronze Musculata & Articulated Pauldron', 'torso', 'frogmen',
        cuir_tb + pld_tb, open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_brave_pteruges', 'Scalloped Polypore & Bronze-Stud Gladiator Pteruges', 'legs', 'frogmen',
        _fen_kilt(f'{p}_brave_kilt', _p_thunder_bronze(), _p_dart_war(), core.CROTCH - 0.14, flare=0.080, jagged=0.06),
    ))
    pad5, ctr5, _ = _dorsal_pad(f'{p}_brave_targe', _p_polypore())
    entries.append(assemble_garment(
        f'{p}_brave_targe_back', 'Opal-Shell & Hammered-Bronze Arena Targe', 'back', 'frogmen',
        [pad5, _cyl_pack(f'{p}_brave_shield', ctr5, 0.125, 0.026, 0.24, _p_thunder_bronze())],
    ))

    # --- TIER 6: SPAN PROSELYTE (`span_proselyte`) ---
    godteal_p = P('frg_span_godteal', 0.05, [
        B('top', 0.0, 0.024, 'solid', 'frg_coldkeep_gold'),
        B('bottom', 0.0, 0.036, 'frg_beadcone_chevron', 'frg_beadcone_ecru', 'frg_span_godteal'),
    ], fabric='cloth.ramie.stepped')
    band_pr = _frog_cranial_band(f'{p}_proselyte_band', godteal_p, f_bot=0.67, f_top=0.80, ease=0.019)
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_proselyte_teal_diadem', 'Span Proselyte Godteal Ramie & Bronze Brow-Crown', 'head', 'frogmen',
        [band_pr], covers_hair=True, covers_face=False,
    )))
    stole_pr = crossed_sash(f'{p}_proselyte_stole', godteal_p, width=0.070, ease=0.021)
    anch_pr, out_pr = _anchor_on_part(stole_pr, chest_front(core.CHEST - 0.01, 0.022), sink=0.002)
    tally_pr = blob(f'{p}_proselyte_tally', anch_pr, (0.062, 0.020, 0.062), P('frg_coldkeep_gold', 0.02, fabric='metal.gold'), n=14, rows=6, out=out_pr, role='trinket')
    entries.append(assemble_garment(
        f'{p}_proselyte_godteal_stole', 'Dalab Godteal Ramie Stole & Bronze Salt-Tally', 'torso', 'frogmen',
        [stole_pr, tally_pr], open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_proselyte_teal_kilt', 'Godteal & Ecru Bead-Cone Pleated Knee-Kilt', 'legs', 'frogmen',
        _fen_kilt(f'{p}_proselyte_kilt', _p_thunder_bronze(), godteal_p, core.KNEE, flare=0.075),
    ))
    pad6, ctr6, _ = _dorsal_pad(f'{p}_proselyte_salt', godteal_p)
    entries.append(assemble_garment(
        f'{p}_proselyte_salt_pack', 'Sealed Cell-Lamp Bladder Salt-Cake Carrier', 'back', 'frogmen',
        [pad6, _cyl_pack(f'{p}_proselyte_jar', ctr6, 0.082, 0.056, 0.23, P('frg_cell_amber', 0.03, fabric='beads.glass'))],
    ))

    # --- TIER 7: SCRAP BROKER (`scrap_broker` — Jrrmiah / Krrmt Border Trader) ---
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_broker_coin_hat', 'Jrrmiah Border-Trader Silk & Tin-Coin Fen Hat', 'head', 'frogmen',
        [_frog_canopy_hat(f'{p}_broker_hat', _p_beadcone('frg_beadcone_ecru', 'frg_sump_alloy'), r_brim=0.25, h_cone=0.095, droop=0.010, scallop=0.04)],
        covers_hair=True, covers_face=False,
    )))
    entries.append(assemble_garment(
        f'{p}_broker_silk_vest', 'Jrrmiah Merchant Open-Front Bead-Cone Silk Vest', 'torso', 'frogmen',
        [_gular_open_vest(f'{p}_broker_vest', _p_beadcone('frg_beadcone_ecru', 'frg_coldkeep_gold'), core.WAIST + 0.01, ease=0.022, open_arc=0.30)],
        open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_broker_fair_sarong', 'Marsh-Fair Bead-Cone Calf-Sarong & Brass Tally Pouches', 'legs', 'frogmen',
        _fen_kilt(f'{p}_broker_sarong', P('frg_coldkeep_gold', 0.03, fabric='metal.gold'), _p_beadcone('frg_reed_drab', 'frg_beadcone_ecru'), core.ANKLE + 0.16, flare=0.085, pouch_paint=_p_polypore()),
    ))
    pad7, ctr7, _ = _dorsal_pad(f'{p}_broker_box', _p_polypore())
    entries.append(assemble_garment(
        f'{p}_broker_scale_pack', 'Agropolitan Fair Strongbox & Brass Scale-Beam Pack', 'back', 'frogmen',
        [pad7, _cyl_pack(f'{p}_broker_chest', ctr7, 0.092, 0.055, 0.22, _p_sump_alloy('frg_coldkeep_gold'))],
    ))

    # --- TIER 8: OPALSHELL CARVER (`opalshell_carver`) ---
    band_oc = _frog_cranial_band(f'{p}_carver_band', _p_ammolite('frg_opal_emerald'), f_bot=0.66, f_top=0.81, ease=0.019)
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_carver_ammolite_band', 'Srrmk-Fens Opal-Shell Ammolite Mosaic Crown-Band', 'head', 'frogmen',
        [band_oc], covers_hair=True, covers_face=False,
    )))
    entries.append(assemble_garment(
        f'{p}_carver_opal_pectoral', 'Iridescent Opal-Shell Ammolite Bead-Pectoral', 'torso', 'frogmen',
        [_gular_pectoral_collar(f'{p}_carver_pec', _p_ammolite(), drop=0.105, ease=0.019)],
        open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_carver_polypore_apron', 'Oiled Polypore Lapidary Tool-Apron & Silk Wrap', 'legs', 'frogmen',
        _fen_kilt(f'{p}_carver_apron', _p_ammolite(), _p_polypore(), core.KNEE + 0.03, flare=0.070, pouch_paint=_p_beadcone()),
    ))
    pad8, ctr8, _ = _dorsal_pad(f'{p}_carver_cradle', _p_sedge_reed())
    entries.append(assemble_garment(
        f'{p}_carver_slab_cradle', 'Fossil Opal-Shell Limestone Slab & Chisel Cradle', 'back', 'frogmen',
        [pad8, _cyl_pack(f'{p}_carver_slab', ctr8, 0.088, 0.045, 0.22, _p_ammolite('frg_opal_emerald'))],
    ))

    # --- TIER 9: VENOM AMBUSHER (`venom_ambusher` — Blowpipe Fen-Warden & Poison-Dart Hunter) ---
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_ambusher_moss_canopy', 'Living-Sphagnum & Shelf-Fungus Camouflage Canopy', 'head', 'frogmen',
        [_frog_canopy_hat(f'{p}_ambusher_canopy', _p_lotus_canopy('frg_sphagnum_wet'), r_brim=0.25, h_cone=0.085, droop=0.025, scallop=0.08)],
        covers_hair=True, covers_face=False,
    )))
    col_va = _gular_pectoral_collar(f'{p}_ambusher_ghillie', _p_sphagnum(), drop=0.095, ease=0.020)
    sash_va = crossed_sash(f'{p}_ambusher_bandolier', _p_polypore('frg_peat_hide'), width=0.055, ease=0.021)
    anch_va, out_va = _anchor_on_part(sash_va, chest_front(core.CHEST - 0.02, 0.022), sink=0.002)
    vial_va = blob(f'{p}_ambusher_venom_pot', anch_va, (0.052, 0.032, 0.062), _p_dart_war(), n=12, rows=6, out=out_va, role='trinket')
    entries.append(assemble_garment(
        f'{p}_ambusher_dart_harness', 'Sphagnum Ghillie Collar & Cave-Venom Dart Bandolier', 'torso', 'frogmen',
        [col_va, sash_va, vial_va], open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_ambusher_ghillie_kilt', 'Jagged Sedge-Leaf Camouflage Loin-Kilt', 'legs', 'frogmen',
        _fen_kilt(f'{p}_ambusher_kilt', _p_polypore('frg_peat_hide'), _p_sedge_reed('frg_sphagnum_wet', 'frg_reed_drab'), core.CROTCH - 0.13, flare=0.075, jagged=0.07, pouch_paint=_p_dart_war()),
    ))
    pad9, ctr9, _ = _dorsal_pad(f'{p}_ambusher_quiv', _p_sphagnum())
    bp_tube = horn(f'{p}_ambusher_blowpipe', [ctr9 + np.array([-0.05, 0.042, -0.15]), ctr9 + np.array([0.06, 0.048, 0.18])], 0.032, 0.036, _p_sedge_reed('frg_peat_hide', 'frg_opal_crimson'), n=20, rows=16, rigid_joint='Spine2')
    entries.append(assemble_garment(
        f'{p}_ambusher_blowpipe_quiver', 'Reed Blowpipe & Fishing-Bridge Venom Quiver', 'back', 'frogmen',
        [pad9, bp_tube],
    ))

    # --- TIER 10: TORPOR WARDEN (`torpor_warden` — Karst-Spring Torpor Shaman) ---
    band_tw = _frog_cranial_band(f'{p}_torpor_crown_base', _p_sedge_reed('frg_sphagnum_wet', 'frg_cell_amber'), f_bot=0.66, f_top=0.86, ease=0.021, flare=0.018)
    parts_tw = [band_tw]
    for k_tw, col_tw in enumerate((4, 8, 20, 32, 36)):
        anch_tw, _ = _anchor_on_part(band_tw, band_tw.P[0, col_tw], sink=0.003)
        parts_tw.append(horn(
            f'{p}_torpor_reed_spire_{k_tw}',
            [anch_tw, anch_tw + up * 0.075 + bk * 0.012, anch_tw + up * 0.135 + bk * 0.024],
            0.014, 0.005, _p_sedge_reed('frg_beadcone_ecru', 'frg_sphagnum_wet'), n=8, rows=7, rigid_joint='Head',
        ))
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_torpor_shaman_crown', 'Rrrmk-Spring Tall Shamanic Reed & Sphagnum Crown', 'head', 'frogmen',
        parts_tw, covers_hair=True, covers_face=False,
    )))
    entries.append(assemble_garment(
        f'{p}_torpor_hydration_vest', 'Quilted Brush-Oil & Wet-Sphagnum Shaman Vest', 'torso', 'frogmen',
        [_gular_open_vest(f'{p}_torpor_vest', P('frg_sphagnum_wet', 0.06, [B('bottom', 0.0, 0.04, 'frg_beadcone_chevron', 'frg_cell_amber', 'frg_sphagnum_wet')], fabric='cloth.quilted.diamond'), core.WAIST + 0.01, ease=0.024, open_arc=0.28)],
        open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_torpor_moss_kilt', 'Heavy Oiled Bead-Cone & Moss-Padded Brumation Kilt', 'legs', 'frogmen',
        _fen_kilt(f'{p}_torpor_kilt', _p_sump_alloy(), _p_beadcone('frg_sphagnum_wet', 'frg_beadcone_ecru'), core.KNEE - 0.05, flare=0.080),
    ))
    entries.append(assemble_garment(
        f'{p}_torpor_moss_cape', 'Karst-Spring Quilted Sphagnum Hydration Mantle', 'back', 'frogmen',
        [cape(f'{p}_torpor_cape', core.CROTCH + 0.08, _p_sphagnum(), ease=0.025, flare=0.08, stiff=0.36, back_push=0.055)],
    ))

    # --- TIER 11: CHORUS ELDER (`chorus_elder`) ---
    band_ce = _frog_cranial_band(f'{p}_elder_tiara_base', _p_ammolite(), f_bot=0.66, f_top=0.85, ease=0.020, flare=0.020)
    anch_ce, out_ce = _anchor_on_part(band_ce, band_ce.P[1, band_ce.P.shape[1] // 2], sink=0.002)
    orb_ce = blob(f'{p}_elder_amber_orb', anch_ce, (0.036, 0.022, 0.034), P('frg_cell_amber', 0.02, fabric='beads.glass'), n=14, rows=6, out=out_ce, rigid_joint='Head')
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_elder_chorus_tiara', 'Spawning-Pool Opal-Shell & Cell-Lamp Resonant Tiara', 'head', 'frogmen',
        [band_ce, orb_ce], covers_hair=True, covers_face=False,
    )))
    entries.append(assemble_garment(
        f'{p}_elder_chorus_stole', 'Iridescent Bead-Cone Silk & Coldkeep-Gold Chorus Collar', 'torso', 'frogmen',
        [_gular_pectoral_collar(f'{p}_elder_collar', _p_beadcone('frg_beadcone_ecru', 'frg_coldkeep_gold'), drop=0.115, ease=0.020)],
        open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_elder_chorus_skirt', 'Bead-Cone Silk & Ammolite-Bordered Chorus Wrap-Skirt', 'legs', 'frogmen',
        _fen_kilt(f'{p}_elder_skirt', P('frg_coldkeep_gold', 0.03, fabric='metal.gold'), _p_beadcone('frg_beadcone_ecru', 'frg_opal_crimson'), core.ANKLE + 0.09, flare=0.095),
    ))
    entries.append(assemble_garment(
        f'{p}_elder_silk_mantle', 'Ceremonial Bead-Cone Silk Chorus Mantle', 'back', 'frogmen',
        [cape(f'{p}_elder_mantle', core.CROTCH + 0.06, _p_beadcone('frg_beadcone_ecru', 'frg_opal_emerald'), ease=0.025, flare=0.09, stiff=0.36, back_push=0.055)],
    ))

    # --- TIER 12: WARCROAK MARSHAL (`warcroak_marshal`) ---
    band_wm = _frog_cranial_band(f'{p}_marshal_helm_bowl', _p_sump_alloy('frg_opal_crimson'), f_bot=0.64, f_top=0.84, ease=0.021, flare=0.010)
    parts_wm = [band_wm]
    for sgn, tag, col_m in ((1.0, 'L', 8), (-1.0, 'R', 32)):
        anch_wm, _ = _anchor_on_part(band_wm, band_wm.P[1, col_m], sink=0.003)
        parts_wm.append(horn(
            f'{p}_marshal_fin_{tag}',
            [anch_wm, anch_wm + left * (0.040 * sgn) + up * 0.065 + bk * 0.025, anch_wm + left * (0.030 * sgn) + up * 0.125 + bk * 0.055],
            0.018, 0.005, _p_ammolite(), n=10, rows=8, rigid_joint='Head',
        ))
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_marshal_ridge_helm', 'Confederacy Sump-Alloy & Bog-Iron Batrachian Ridge-Helm', 'head', 'frogmen',
        parts_wm, covers_hair=True, covers_face=False,
    )))
    cor_wm = cuirass_plate(
        f'{p}_marshal_cuir', _p_sump_alloy('frg_opal_crimson'),
        trim_paint=P('frg_coldkeep_gold', 0.03, fabric='metal.gold'),
        style='lamellar', z_top=core.TOP - 0.042, z_bot=core.WAIST + 0.005,
        ease=0.022, keel=0.016, faulds=2, open_torso=True,
    )
    plds_wm = articulated_pauldrons(
        f'{p}_marshal_pld', _p_sump_alloy('frg_coldkeep_gold'),
        trim_paint=_p_thunder_bronze(), lames=3, haute_piece=True, ease=0.014,
    )
    entries.append(assemble_garment(
        f'{p}_marshal_lamellar_corselet', 'Opal-Shell & Sump-Alloy Sculpted Lamellar War-Cuirass', 'torso', 'frogmen',
        cor_wm + plds_wm, open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_marshal_war_kilt', 'Dart-Reticulated Bead-Cone & Alloy Hinged-Tasset War-Kilt', 'legs', 'frogmen',
        _fen_kilt(f'{p}_marshal_kilt', _p_sump_alloy('frg_coldkeep_gold'), _p_dart_war(), core.KNEE + 0.02, flare=0.088)
        + hinged_tassets(f'{p}_marshal_htass', _p_sump_alloy('frg_opal_crimson'), trim_paint=P('frg_coldkeep_gold', 0.03, fabric='metal.gold'), lames=3, ease=0.028),
    ))
    pad12, ctr12, _ = _dorsal_pad(f'{p}_marshal_std', _p_sump_alloy())
    std_pole = _cyl_pack(f'{p}_marshal_drum', ctr12, 0.085, 0.048, 0.24, _p_ammolite())
    anch_st1, _ = _anchor_on_part(std_pole, [ctr12[0] - 0.055, ctr12[1] + 0.048, ctr12[2] + 0.09], sink=0.004)
    anch_st2, _ = _anchor_on_part(std_pole, [ctr12[0] + 0.055, ctr12[1] + 0.048, ctr12[2] + 0.09], sink=0.004)
    mast_l = horn(f'{p}_marshal_mast_L', [anch_st1, anch_st1 + np.array([-0.02, 0.01, 0.20])], 0.012, 0.006, P('frg_coldkeep_gold', 0.02, fabric='metal.gold'), n=8, rows=7, rigid_joint='Spine2')
    mast_r = horn(f'{p}_marshal_mast_R', [anch_st2, anch_st2 + np.array([0.02, 0.01, 0.20])], 0.012, 0.006, P('frg_coldkeep_gold', 0.02, fabric='metal.gold'), n=8, rows=7, rigid_joint='Spine2')
    entries.append(assemble_garment(
        f'{p}_marshal_war_standard', 'Confederacy War-Croak Resonator & Banner Standard', 'back', 'frogmen',
        [pad12, std_pole, mast_l, mast_r],
    ))

    # --- TIER 13: PC THUNDERDOME CHAMPION (`pc_thunderdome_champion`) ---
    band_pc = _frog_cranial_band(f'{p}_champ_laurel_band', P('frg_coldkeep_gold', 0.03, fabric='metal.gold'), f_bot=0.65, f_top=0.82, ease=0.020, flare=0.015)
    parts_pc = [band_pc]
    for sgn, tag, col_c in ((1.0, 'L', 8), (-1.0, 'R', 32)):
        anch_pc, _ = _anchor_on_part(band_pc, band_pc.P[1, col_c], sink=0.003)
        parts_pc.append(horn(
            f'{p}_champ_laurel_{tag}',
            [anch_pc, anch_pc + left * (0.048 * sgn) + up * 0.065, anch_pc + left * (0.020 * sgn) + up * 0.130 + bk * 0.025],
            0.016, 0.004, _p_ammolite(), n=10, rows=8, rigid_joint='Head',
        ))
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_champ_opal_laurels', 'Thunderdome Champion Coldkeep-Gold & Opal-Shell Laurels', 'head', 'frogmen',
        parts_pc, covers_hair=True, covers_face=False,
    )))
    cuir_pc = cuirass_plate(
        f'{p}_champ_cuir', P('frg_coldkeep_gold', 0.03, fabric='metal.gold'),
        trim_paint=_p_sump_alloy('frg_coldkeep_gold'),
        style='musculata', z_top=core.TOP - 0.042, z_bot=core.WAIST + 0.005,
        ease=0.022, keel=0.015, faulds=2, open_torso=True,
    )
    plds_pc = articulated_pauldrons(
        f'{p}_champ_pld', P('frg_coldkeep_gold', 0.03, fabric='metal.gold'),
        trim_paint=_p_sump_alloy('frg_coldkeep_gold'), lames=3, haute_piece=True, ease=0.014,
    )
    anch_pcc, out_pcc = _anchor_on_part(cuir_pc[0], chest_front(core.CHEST, 0.028), sink=0.002)
    med_pc = blob(f'{p}_champ_medallion', anch_pcc, (0.078, 0.024, 0.078), _p_ammolite(), n=16, rows=6, out=out_pcc, role='trinket')
    entries.append(assemble_garment(
        f'{p}_champ_arena_panoply', 'Champion Coldkeep-Gold Sculpted Musculata & Articulated Pauldrons', 'torso', 'frogmen',
        cuir_pc + plds_pc + [med_pc], open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_champ_pteruges_kilt', 'Champion Dalab-Bronze & Hinged-Tasset Split War-Kilt', 'legs', 'frogmen',
        _fen_kilt(f'{p}_champ_kilt', P('frg_coldkeep_gold', 0.03, fabric='metal.gold'), _p_dart_war(), core.KNEE + 0.03, flare=0.085, jagged=0.04, pouch_paint=P('frg_cell_amber', 0.02, fabric='beads.glass'))
        + hinged_tassets(f'{p}_champ_htass', P('frg_coldkeep_gold', 0.03, fabric='metal.gold'), trim_paint=_p_thunder_bronze(), lames=3, ease=0.028),
    ))
    pad13, ctr13, _ = _dorsal_pad(f'{p}_champ_targe', P('frg_coldkeep_gold', 0.03, fabric='metal.gold'))
    entries.append(assemble_garment(
        f'{p}_champ_trophy_targe', 'Thunderdome Champion Gold & Opal-Shell Trophy Targe', 'back', 'frogmen',
        [pad13, _cyl_pack(f'{p}_champ_shield', ctr13, 0.132, 0.028, 0.25, _p_ammolite())],
    ))

    # --- TIER 14: HERO JRRMIAH CHORUS LORD (`hero_jrrmiah_chorus_lord` — Fen-King) ---
    band_fk = _frog_cranial_band(f'{p}_fenking_crown_base', P('frg_coldkeep_gold', 0.02, fabric='metal.gold'), f_bot=0.64, f_top=0.85, ease=0.021, flare=0.022)
    parts_fk = [band_fk]
    for idx_ar, col_fk in enumerate((20, 8, 32)):
        anch_fk, out_fk = _anchor_on_part(band_fk, band_fk.P[0, col_fk], sink=0.003)
        h_ar = 0.145 if idx_ar == 0 else 0.115
        parts_fk.append(horn(
            f'{p}_fenking_arch_{idx_ar}',
            [anch_fk, anch_fk + up * (0.55 * h_ar) + out_fk * 0.015, anch_fk + up * h_ar + bk * 0.020],
            0.016, 0.005, _p_sump_alloy('frg_coldkeep_gold') if idx_ar else P('frg_cell_amber', 0.02, fabric='beads.glass'),
            n=10, rows=8, rigid_joint='Head',
        ))
    entries.append(_mark_beast_head(assemble_garment(
        f'{p}_fenking_triarch_crown', 'Fen-King of Jrrmiah Tri-Arch Alloy & Cell-Lamp Crown', 'head', 'frogmen',
        parts_fk, covers_hair=True, covers_face=False,
    )))
    pec_fk = _gular_pectoral_collar(f'{p}_fenking_pec', _p_ammolite(), drop=0.125, ease=0.020)
    b_fkl = band(f'{p}_fenking_sash_l', core.WAIST + 0.01, core.SHOULDER + 0.012, 0.056, 0.021, P('frg_coldkeep_gold', 0.02, fabric='metal.gold'), high=math.pi * 0.45, rows=5)
    b_fkr = band(f'{p}_fenking_sash_r', core.WAIST + 0.01, core.SHOULDER + 0.012, 0.056, 0.021, P('frg_coldkeep_gold', 0.02, fabric='metal.gold'), high=-math.pi * 0.45, rows=5)
    entries.append(assemble_garment(
        f'{p}_fenking_royal_pectoral', 'Fen-King Coldkeep-Gold & Opal-Shell Mosaic Pectoral', 'torso', 'frogmen',
        [pec_fk, b_fkl, b_fkr], open_torso=True,
    ))
    entries.append(assemble_garment(
        f'{p}_fenking_royal_skirt', 'Tiered Bead-Cone Silk & Ammolite Royal Fen-King Skirt', 'legs', 'frogmen',
        _fen_kilt(f'{p}_fenking_skirt', _p_sump_alloy('frg_coldkeep_gold'), _p_ammolite('frg_opal_emerald'), core.ANKLE + 0.06, flare=0.105),
    ))
    entries.append(assemble_garment(
        f'{p}_fenking_court_mantle', 'Fen-King Bead-Cone Silk & Opal-Shell Mosaic Court Mantle', 'back', 'frogmen',
        [cape(f'{p}_fenking_mantle', core.CROTCH + 0.05, _p_ammolite(), ease=0.026, flare=0.10, stiff=0.36, back_push=0.060)],
    ))

    return entries


# ===========================================================================================================
# BUILD ORCHESTRATION, PEOPLES ENTRY & SELF-VERIFICATION
# ===========================================================================================================
TIER_SPECS = [
    ('fen_spearer', 0.15, 'FM1 Jrrmiah / Vrrm-Reed Spawning-Fen Spearer', None),
    ('beadcone_reeler', 0.11, 'FM1 Brrml-Silk Bead-Cone Reeler & Oil-Presser', None),
    ('sump_diver', 0.08, 'FM1 Grrmp-Sump Flooded Inner-Wall Bore Diver', None),
    ('placer_washer', 0.09, 'FM1 Krrok-Wash Coldkeep Gold-Panner & Bloomery Tender', None),
    ('thunderdome_brave', 0.10, 'FM2 Trrmb-Pillar Span Thunderdome Leaper-Brave', None),
    ('span_proselyte', 0.06, 'FM2 Span Dalab-Convert & Salt-Cake Porter', None),
    ('scrap_broker', 0.11, 'FM3 Jrrmiah / Krrmt Marsh-Fair Border Trader', None),
    ('opalshell_carver', 0.08, 'FM3 Srrmk-Fens Opal-Shell Ammolite Artisan', None),
    ('venom_ambusher', 0.08, 'FM1/FM3 Fishing-Bridge Blowpipe Poison-Dart Hunter', None),
    ('torpor_warden', 0.06, 'FM4 Rrrmk-Spring Karst-Spring Torpor Shaman', None),
    ('chorus_elder', 0.04, 'FM1–FM4 Spawning-Pool Chorus Elder & Law-Speaker', None),
    ('warcroak_marshal', 0.04, 'FM1–FM4 Confederacy War-Croak Marshal', None),
    ('pc_thunderdome_champion', 0.0, 'Span & Jrrmiah Thunderdome Champion (PC)', 'pc'),
    ('hero_jrrmiah_chorus_lord', 0.0, 'High Chorus-Lord & Fen-King of Jrrmiah', 'important_npc'),
]


def build_frogmen_kit():
    entries = []
    with _frg_paint_context():
        for body_id, sex_tok in (('mpfb_male', 'm'), ('mpfb_female', 'f')):
            set_body(body_id)
            pref = f'frg_{sex_tok}'
            entries.extend(_build_shared_limb_pieces(pref))
            entries.extend(_build_frogmen_tiers(pref))
    return entries


def build_frogmen_peoples_entry():
    def _outfits_for(sex_tok):
        p = f'frg_{sex_tok}'
        out = {
            'fen_spearer': {
                'head': f'{p}_spearer_lotus_canopy',
                'torso': f'{p}_spearer_sedge_baldric',
                'gloves': f'{p}_sphagnum_cuffs',
                'legs': f'{p}_spearer_reed_kilt',
                'feet': f'{p}_sedge_bog_spats',
                'back': f'{p}_spearer_harpoon_quiver',
            },
            'beadcone_reeler': {
                'head': f'{p}_reeler_silk_canopy',
                'torso': f'{p}_reeler_silk_bolero',
                'gloves': f'{p}_reeler_armguards',
                'legs': f'{p}_reeler_silk_sarong',
                'feet': f'{p}_lotus_ring_sandals',
                'back': f'{p}_reeler_bobbin_rack',
            },
            'sump_diver': {
                'head': f'{p}_diver_lamp_circlet',
                'torso': f'{p}_diver_alloy_harness',
                'gloves': f'{p}_diver_lamp_bracers',
                'legs': f'{p}_diver_ballast_wrap',
                'feet': f'{p}_diver_lead_sandals',
                'back': f'{p}_diver_salvage_pack',
            },
            'placer_washer': {
                'head': f'{p}_washer_sedge_hat',
                'torso': f'{p}_washer_polypore_harness',
                'gloves': f'{p}_washer_iron_cuffs',
                'legs': f'{p}_washer_placer_kilt',
                'feet': f'{p}_karst_stirrup_sandals',
                'back': f'{p}_washer_pan_rack',
            },
            'thunderdome_brave': {
                'head': f'{p}_brave_bronze_crest',
                'torso': f'{p}_brave_arena_harness',
                'gloves': f'{p}_thunderdome_vambraces',
                'legs': f'{p}_brave_pteruges',
                'feet': f'{p}_thunderdome_greaves',
                'back': f'{p}_brave_targe_back',
            },
            'span_proselyte': {
                'head': f'{p}_proselyte_teal_diadem',
                'torso': f'{p}_proselyte_godteal_stole',
                'gloves': f'{p}_sphagnum_cuffs',
                'legs': f'{p}_proselyte_teal_kilt',
                'feet': f'{p}_karst_stirrup_sandals',
                'back': f'{p}_proselyte_salt_pack',
            },
            'scrap_broker': {
                'head': f'{p}_broker_coin_hat',
                'torso': f'{p}_broker_silk_vest',
                'gloves': f'{p}_broker_brass_cuffs',
                'legs': f'{p}_broker_fair_sarong',
                'feet': f'{p}_lotus_ring_sandals',
                'back': f'{p}_broker_scale_pack',
            },
            'opalshell_carver': {
                'head': f'{p}_carver_ammolite_band',
                'torso': f'{p}_carver_opal_pectoral',
                'gloves': f'{p}_reeler_armguards',
                'legs': f'{p}_carver_polypore_apron',
                'feet': f'{p}_lotus_ring_sandals',
                'back': f'{p}_carver_slab_cradle',
            },
            'venom_ambusher': {
                'head': f'{p}_ambusher_moss_canopy',
                'torso': f'{p}_ambusher_dart_harness',
                'gloves': f'{p}_ambusher_bark_bracers',
                'legs': f'{p}_ambusher_ghillie_kilt',
                'feet': f'{p}_sedge_bog_spats',
                'back': f'{p}_ambusher_blowpipe_quiver',
            },
            'torpor_warden': {
                'head': f'{p}_torpor_shaman_crown',
                'torso': f'{p}_torpor_hydration_vest',
                'gloves': f'{p}_torpor_quilted_cuffs',
                'legs': f'{p}_torpor_moss_kilt',
                'feet': f'{p}_torpor_karst_gaiters',
                'back': f'{p}_torpor_moss_cape',
            },
            'chorus_elder': {
                'head': f'{p}_elder_chorus_tiara',
                'torso': f'{p}_elder_chorus_stole',
                'gloves': f'{p}_gold_ammolite_cuffs',
                'legs': f'{p}_elder_chorus_skirt',
                'feet': f'{p}_gold_ankle_sandals',
                'back': f'{p}_elder_silk_mantle',
            },
            'warcroak_marshal': {
                'head': f'{p}_marshal_ridge_helm',
                'torso': f'{p}_marshal_lamellar_corselet',
                'gloves': f'{p}_marshal_alloy_vambraces',
                'legs': f'{p}_marshal_war_kilt',
                'feet': f'{p}_marshal_alloy_greaves',
                'back': f'{p}_marshal_war_standard',
            },
            'pc_thunderdome_champion': {
                'head': f'{p}_champ_opal_laurels',
                'torso': f'{p}_champ_arena_panoply',
                'gloves': f'{p}_thunderdome_vambraces',
                'legs': f'{p}_champ_pteruges_kilt',
                'feet': f'{p}_thunderdome_greaves',
                'back': f'{p}_champ_trophy_targe',
                'type': 'pc',
            },
            'hero_jrrmiah_chorus_lord': {
                'head': f'{p}_fenking_triarch_crown',
                'torso': f'{p}_fenking_royal_pectoral',
                'gloves': f'{p}_gold_ammolite_cuffs',
                'legs': f'{p}_fenking_royal_skirt',
                'feet': f'{p}_gold_ankle_sandals',
                'back': f'{p}_fenking_court_mantle',
                'type': 'important_npc',
            },
        }
        return out

    return {
        'id': 'frogmen',
        'name': 'Frogmen',
        'note': (
            'Batrachian Confederacies of the SW Highlands (`Jrrmiah`, `Trrmb-Pillar`, `Krrmt`, `Rrrmk-Spring` — LORE.md §6.22): '
            'compact 0.95x plantigrade amphibians (`mod_head_frog` with dorsal eye turrets, gular vocal pouch, and webbed hands) '
            'respiring partly through brush-oiled skin. Dressed in `bead-cone` cocoon silk, `opal-shell` ammolite mosaic, '
            'wet-sphagnum hydration cuffs, polypore bracket leather, flooded-bore `ancient-alloys`, and `Span` Thunderdome '
            'prize-bronze (14 M/F paired tiers; tools/garments/cultures/frogmen.py).'
        ),
        'scale': 0.95,
        'mods': ['mod_head_frog'],
        'ancestry': {
            'african': [0.25, 0.45],
            'asian': [0.35, 0.55],
            'caucasian': [0.15, 0.35],
        },
        'skin': [
            '#2e4a1c',
            '#4a6a2e',
            '#5f8a36',
            '#93ac5a',
            '#5a4028',
            '#7a3a22',
        ],
        'hair': [
            '#1e2a12',
            '#2e4a1c',
            '#3a2a1c',
        ],
        'eyes': [
            '#d8a420',
            '#e6b830',
            '#c47e18',
            '#b89c38',
        ],
        'grey': 0.85,
        'beard': 0.0,
        'morph': {
            'height': [-0.18, 0.04],
            'weight': [-0.08, 0.22],
            'muscle': [0.12, 0.45],
            'proportions': [-0.05, 0.12],
        },
        'styles': {
            'male': ['short02', 'long01'],
            'female': ['long01', 'braid01'],
        },
        'tiers': [[tid, sh] for tid, sh, _, _ in TIER_SPECS],
        'tier_labels': {tid: lbl for tid, _, lbl, _ in TIER_SPECS},
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
    assert p_ent['id'] == 'frogmen'
    assert p_ent['scale'] == 0.95
    assert p_ent['mods'] == ['mod_head_frog']
    sh_sum = sum(sh for _, sh in p_ent['tiers'] if sh > 0.0)
    assert abs(sh_sum - 1.0) < 1e-9, f'Tier share sum = {sh_sum}'
    assert len(p_ent['outfits']['male']) == 14
    assert set(p_ent['outfits']['male'].keys()) == set(p_ent['outfits']['female'].keys())

    by_key = {(e['_body'], e['id']): e for e in kit_entries}
    assert len(by_key) == len(kit_entries), 'Duplicate kit entry detected!'

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
                if slot == 'gloves':
                    assert 'Human.fingernails' not in (ent.get('hide_parts') or []), f'{pid} hides webbed fingers!'
                if slot == 'torso':
                    assert 'hide' not in ent, f'{pid} must keep open_torso=True!'

        anat_v = _get_frog_head_anat(body_id)
        f_eye_tree = cKDTree(anat_v['eye_pts'])
        f_sk_tree = cKDTree(anat_v['skull_pts'])

        for (b_id, gid), ent in by_key.items():
            if b_id != body_id:
                continue
            j, b, nd, pr, P_arr, T_arr = _read_glb_pos_tris(ROOT / ent['glb'])
            if ent['slot'] == 'head':
                P_bl_h = arms2.from_gl(P_arr)
                d_eye_mm = float(f_eye_tree.query(P_bl_h)[0].min()) * 1000.0
                d_fsk_mm = float(f_sk_tree.query(P_bl_h)[0].min()) * 1000.0
                assert d_eye_mm >= 4.5, f'{body_id}/{gid} encroaches on Frogman eye ({d_eye_mm:.2f}mm < 4.5mm)!'
                assert d_fsk_mm <= 6.0, f'{body_id}/{gid} hovers off Frogman skull ({d_fsk_mm:.2f}mm > 6.0mm)!'
                for ec, re in ((anat_v['el_c'], anat_v['r_el']), (anat_v['er_c'], anat_v['r_er'])):
                    in_eye = int(np.sum(np.linalg.norm(P_bl_h - ec[None, :], axis=1) < re + 0.004))
                    assert in_eye == 0, f'{body_id}/{gid} has {in_eye} verts inside Frogman eye sphere!'
            if ent['slot'] == 'torso':
                assert not (float(P_arr[:, 1].min()) < y_crotch - 0.065 and 'cloth' not in ent)
            comps = _mesh_components(len(P_arr), T_arr)
            if len(comps) >= 2:
                has_cloth_v = np.zeros(len(P_arr), dtype=bool)
                if 'skin' in nd and 'JOINTS_0' in pr['attributes']:
                    sk = j['skins'][nd['skin']]
                    rnames = [j['nodes'][k].get('name', '') for k in sk['joints']]
                    cj = [idx for idx, nm in enumerate(rnames) if nm.startswith(('c_', 'cloth:'))]
                    if cj:
                        JJ = glbio.accessor(j, b, pr['attributes']['JOINTS_0'])
                        WW = glbio.accessor(j, b, pr['attributes']['WEIGHTS_0'])
                        has_cloth_v = (np.isin(JJ, cj) & (WW > 0.02)).any(axis=1)
                max_len = max(len(c) for c in comps)
                for comp in comps:
                    if len(comp) == max_len or len(comp) > 280 or has_cloth_v[comp].any():
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

    print(f'[FROGMEN SELF-VERIFY PASS] {len(kit_entries)} pieces across 14 M/F tiers verified (max island gap: {max_island_mm:.2f}mm <= 18.0mm).')


def main():
    t0 = time.perf_counter()
    kit_entries = build_frogmen_kit()
    peoples_entry = build_frogmen_peoples_entry()
    _self_verify(kit_entries, peoples_entry)

    manifest_path = CULTURES_DIR / 'frogmen_manifest.json'
    manifest_data = {
        'culture': 'frogmen',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    print(f'Successfully built {len(kit_entries)} Frogmen pieces in {dt:.2f}s -> {manifest_path}')


if __name__ == '__main__':
    main()
