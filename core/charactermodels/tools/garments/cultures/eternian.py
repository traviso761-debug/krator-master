"""The Eternal State (`eternian`) Complete Procedural Cultural Wardrobe Kit.

Implements all 25 canonical procedural tiers from `eternians_garment_plan.md` across
BOTH `mpfb_male` (`etn_m_*`) and `mpfb_female` (`etn_f_*`) bodies at 100% parity:

Pillar I — The Sanctum: True Heirs, Masked Proxies & Bodyguard Cohorts (7 tiers)
  1. `heir_warden_elder`    — Quarantine Warden Elder (True Heir, metallic skin/hair)
  2. `heir_restorer_lord`   — Restorer Expeditionary Lord (True Heir, Calling visor)
  3. `heir_withdrawn_scion` — Withdrawn Lineage Scion (True Heir, pierced-bronze veil)
  4. `withdrawn_proxy`      — Withdrawn Elder's Masked Human Proxy (white closed-eye mask)
  5. `heir_juggernaut`      — True Heir's Stepped-Pier Juggernaut (Sanctum heavy guard)
  6. `heir_sentinel`        — True Heir's Bronze-Tracery Sentinel (Deco-Gothic, zero sun-rays)
  7. `heir_stalker`         — Sanctum Gunmetal Veil-Stalker (Censorate operative, zero red)

Pillar II — The Six Ministries, Censorate & Paper Bureaucracy (6 tiers)
  8. `minister`             — Grand Chancellor / Arch-Minister (Rank 1-2 gold circuit-maze:9)
  9. `censor`               — Censorate Inspector-General (Rank 3-4 black/white-gold maze:7)
 10. `clock_auditor`        — Anker-Clock Time-Auditor (6-moon escapement dial, verdigris)
 11. `tube_runner`          — Pneumatic-Tube Dispatch Runner (capsule bandolier & manifold)
 12. `prefect`              — Examined Circuit Prefect (Rank 5 charcoal/teal/gold maze:5)
 13. `archivist`            — Block-Print & Census Grand Archivist (soot/mulberry/celadon, zero red)

Pillar III — Military, Valley Quarantine & Frontier Armies (5 tiers)
 14. `warden`               — Sanctum Porcelain-and-Bronze Cuirassier (9-fin fan mitre, celadon crackle)
 15. `valley_warden`        — Valley-Cordon Anti-Taint Warden (alabaster-lancet hazard plate)
 16. `hayrant_soldier`      — Outer-Wall Hayrant Yeti-Watch Soldier (quilted white & silver + Ainu fret)
 17. `farport_guard`        — Farport Factory-Quarter Customs Guard (oiled kelp & verdigris bronze)
 18. `canal_gendarme`       — Canal-Town Lock & Highway Gendarme (buffbrick/charcoal brigandine)

Pillar IV — Regional Commons, Kiln Guilds & Farside Coast (7 tiers)
 19. `canal_citizen`        — Canal-Town Bargeman & Lowland Citizen (cotton/buffbrick, pattern-block)
 20. `kiln_master`          — Celadon & Porcelain Kiln-Master (kaolin linen, muffle apron, vase rack)
 21. `wine_lacquer_factor`  — Tone Champagne Cellarman & Urushi Lacquer-Master (pine/urushi)
 22. `glazier_mason`        — Alabaster & Bronze-Tracery Master Glazier (alabaster/onyx pane rack)
 23. `farside_kelper`       — Farside Kelp-Forester & Lung-Octopus Fisher (oiled kelp & coral-lime)
 24. `hayrant_highlander`   — Hayrant Outer-Wall Alpine Highlander (attus bark-cloth & Ainu fret)
 25. `matok_broker`         — Matok Dam-Basin & Portage Toll-Broker (silt-buff duster & permits)

Strict Canon Invariants Enforced at Build Time:
- ZERO RED (`repred`, `crimson`, `scarlet`, `holyred`, `maroon`, `omaroon`, `pomegranate`,
  `madder`, `rustred`, `lacrose`, `oxblood`, `wine`) — sole coastal exception is raw dark
  `etn_wineweed` (`#4a0a12`) cordage restricted exclusively to `farside_kelper`.
- ZERO SUN-RAYS (`sun`, `sun_burst_ikat`, `sentinel_sun_cloak`, `xanadu_sun_wheel`).
- ZERO Warhammer grime/skulls/rust; strictly Gothic + Art Deco + Soviet Monumental +
  closed-eyed faceted cubist ancestor heads + Qing paper-state bureaucracy.
- 100% `mpfb_male` & `mpfb_female` parity, full `legs` + `feet` coverage on every tier.

Run standalone to compile all `.glb` + `.morph.bin` pieces and emit `eternian_manifest.json`:
    python -u tools/garments/cultures/eternian.py
"""
from contextlib import contextmanager
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

from garments import core
from garments import paint as paint_mod
from garments.core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment, frame, ring_points, smooth_push,
)
from garments.paint import P, B, PN, C, COTTON, WOOL, leathery, sample_cultural_tex
from garments.types.torso import (
    torso_tube, collar, stand_collar, collar_disc, cape, tabard, crossed_sash, pauldron, neck_ring,
)
from garments.types.armor import (
    cuirass_plate, gorget_guard, articulated_pauldrons, hinged_tassets, sculpted_vambraces, sculpted_greaves,
)
from garments.types.limbs import limb_tube, sleeve, sleeves, trousers, full_gloves, armbands
from garments.types.footwear import boots, sandal
from garments.types.headgear import (
    head_landmarks_exact, head_rings, sculpted_faceplate, sculpted_cranium,
    hood, brim, tower_hat, conical_hat, crown_band, fan, crest, turban,
)
from garments.types.accoutrements import (
    flap, blob, belt_sash, pouch_belt, pack_straps, tube, strap, rosette, tassel,
)


# ===========================================================================================================
# CANONICAL ETERNIAN PALETTE (SCOPED `etn_*` KEYS) & ANTI-RED / ANTI-SUN GUARDRAILS
# ===========================================================================================================
ETN_COLORS = {
    'etn_etgreen':      (0.050, 0.250, 0.100),  # #3f8a5a State emblem green highlight
    'etn_bronzeorange': (0.680, 0.290, 0.060),  # #d87a38 True Heir court embroidery (orange-bronze, never red)
    'etn_gunmetal':     (0.070, 0.080, 0.100),  # #4a5058 True Heir rank metal & stalker armor
    'etn_alabaster':    (0.860, 0.800, 0.670),  # #efe7d6 Translucent veined alabaster infill
    'etn_buffbrick':    (0.690, 0.600, 0.450),  # #d9cdb4 Canal core pale buff brick tone
    'etn_kelp':         (0.032, 0.028, 0.014),  # #1a160a Farside oiled land-kelp leather
    'etn_corallime':    (0.880, 0.840, 0.760),  # #efe7d6 Calcined spray-coral lime
    'etn_kelpgoat':     (0.760, 0.730, 0.660),  # Shaggy salt-bleached kelp-goat fleece
    'etn_shutter':      (0.240, 0.340, 0.400),  # #7e98a4 Canal-town slate-blue barge cloth
    'etn_silt':         (0.460, 0.390, 0.280),  # #9a8a6e Matok semiarid dust-buff
    'etn_urushi':       (0.045, 0.065, 0.055),  # Cured black-green Tone urushi lacquer
    'etn_wineweed':     (0.110, 0.015, 0.022),  # #4a0a12 Sole canonical coastal exception (farside_kelper cord)
}

FORBIDDEN_ETERNIAN_COLORS = {
    'repred', 'crimson', 'scarlet', 'holyred', 'maroon', 'omaroon',
    'pomegranate', 'madder', 'rustred', 'lacrose', 'oxblood', 'wine',
    'dragoncrimson', 'abysslac',
}
FORBIDDEN_ETERNIAN_MOTIFS = {
    'sun', 'sun_burst_ikat', 'sentinel_sun_cloak', 'xanadu_sun_wheel',
    'iziz_clavus_sun_orb', 'horned_sun_shield',
}

ETN_CUSTOM_MOTIFS = {
    'etn_circuit_maze',
    'etn_closed_eye_ancestors',
    'etn_celadon_crackle',
    'etn_hayrant_ainu_fret',
    'etn_pierced_tracery',
    'etn_pattern_block',
}


def _etn_custom_motif(style, w, h, fg, bg, aspect=1.0):
    base_style = style.split(':')[0]
    rank_n = 5
    if ':' in style:
        try:
            rank_n = int(style.split(':')[1])
        except ValueError:
            rank_n = 5
    rank_n = max(1, min(9, rank_n))

    H = max(int(h), 1)
    W = max(int(w), 1)
    img = np.empty((H, W, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:H, 0:W]
    u = (xx + 0.5) / W
    v = (yy + 0.5) / H

    if base_style == 'etn_circuit_maze':
        # Qing bufu Mandarin rank square: orthogonal PCB trace-and-via labyrinth (1..9 turns)
        cells = rank_n + 2
        nx = max(2.0, round(cells * max(aspect, 0.5)))
        ny = max(2.0, round(cells / max(aspect, 0.5)))
        gu = (u * nx) % 1.0
        gv = (v * ny) % 1.0
        iu = np.floor(u * nx).astype(int)
        iv = np.floor(v * ny).astype(int)
        # Nested concentric rectangular maze traces
        ring_d = np.maximum(np.abs(u - 0.5) * 2.0, np.abs(v - 0.5) * 2.0)
        trace_ring = ((np.floor(ring_d * (rank_n + 1)) % 2) == 0) & (
            (np.abs((ring_d * (rank_n + 1)) % 1.0 - 0.5) < 0.22)
        )
        # Orthogonal PCB bus channels & via pads
        h_bus = (np.abs(gv - 0.5) < 0.14) & (((iu + iv) % 2) == 0)
        v_bus = (np.abs(gu - 0.5) < 0.14) & (((iu * 3 + iv) % 2) == 1)
        via = np.hypot(gu - 0.5, gv - 0.5) < 0.22
        via_hole = np.hypot(gu - 0.5, gv - 0.5) < 0.10
        border = (u < 0.05) | (u > 0.95) | (v < 0.05) | (v > 0.95)
        inner_b = ((u > 0.08) & (u < 0.11)) | ((u > 0.89) & (u < 0.92)) | ((v > 0.08) & (v < 0.11)) | ((v > 0.89) & (v < 0.92))
        img[trace_ring | h_bus | v_bus | via | border | inner_b] = fg
        img[via_hole] = bg
        maze_tex = sample_cultural_tex('tex.eternian_circuit_maze', W, H, fg, bg, pal_blend=0.22)
        img = 0.52 * img + 0.48 * maze_tex

    elif base_style == 'etn_closed_eye_ancestors':
        # Faceted Deco-cubist closed-eyed ancestor faces (strictly closed horizontal slit-eyelids)
        nx = max(1.0, round(2.2 * max(aspect, 0.5)))
        ny = max(1.0, round(2.2 / max(aspect, 0.5)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = ((v * ny) % 1.0 - 0.5) * 2.0
        # Stepped-pier octagonal medallion frame
        d_oct = np.maximum(np.maximum(np.abs(gu), np.abs(gv)), (np.abs(gu) + np.abs(gv)) * 0.72)
        in_face = (np.abs(gu) < 0.52) & (gv > -0.62) & (gv < 0.68) & ((np.abs(gu) + np.maximum(gv - 0.15, 0.0) * 0.75) < 0.62)
        rim = (d_oct > 0.76) & (d_oct < 0.88)
        # Planar brow bar, triangular nasal keel, and STRICTLY CLOSED horizontal slit eyelids
        brow = in_face & (gv > -0.34) & (gv < -0.22) & (np.abs(gu) < 0.42)
        closed_lids = in_face & (np.abs(gv + 0.10) < 0.045) & (np.abs(gu) > 0.10) & (np.abs(gu) < 0.38)
        nose_keel = in_face & (gv > -0.22) & (gv < 0.24) & (np.abs(gu) < 0.075 * (1.0 + (gv + 0.22)))
        mouth_slit = in_face & (np.abs(gv - 0.40) < 0.032) & (np.abs(gu) < 0.18)
        crown_steps = (gv < -0.58) & (gv > -0.82) & (np.abs(gu) < 0.48 - (np.abs(gv + 0.58) * 1.1))
        img[in_face | crown_steps] = fg
        img[rim] = C['etn_etgreen']
        img[brow | nose_keel] = np.clip(np.asarray(fg) * 1.15, 0.0, 1.0)
        img[closed_lids | mouth_slit] = bg
        anc_tex = sample_cultural_tex('tex.eternian_ancestor_damask', W, H, fg, bg, pal_blend=0.22)
        img = 0.54 * img + 0.46 * anc_tex

    elif base_style == 'etn_celadon_crackle':
        # Longquan celadon porcelain craquelure network with bronze mullion border
        img[:] = bg
        # Procedural Voronoi-like glaze craze lines via interfering angular waves
        w1 = np.sin(u * 23.0 + np.cos(v * 17.0) * 1.8)
        w2 = np.cos(v * 27.0 - np.sin(u * 19.0) * 1.6)
        w3 = np.sin((u + v) * 19.0 + np.sin((u - v) * 13.0))
        craze = (np.abs(w1 * w2) < 0.055) | (np.abs(w2 * w3) < 0.045)
        dark_jade = np.asarray(bg) * 0.62
        img[craze] = dark_jade
        # Crisp Deco bronze mullion frame lines
        mullion = (u < 0.04) | (u > 0.96) | (v < 0.04) | (v > 0.96) | (np.abs(v - 0.5) < 0.025)
        img[mullion] = fg

    elif base_style == 'etn_hayrant_ainu_fret':
        # Authentic Ainu moreu (whorl-spiral) & ayus (thorn-bracket) appliqué tape — ZERO RED
        img[:] = bg
        nx = max(2.0, round(3.4 * max(aspect, 0.5)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v - 0.5) * 2.0
        # Outer selvedge rails
        rail = (np.abs(gv) > 0.78) & (np.abs(gv) < 0.90)
        # Double-spiral whorl (moreu) in each repeat cell
        r1 = np.hypot(gu - 0.42, gv)
        r2 = np.hypot(gu + 0.42, gv)
        th1 = np.arctan2(gv, gu - 0.42)
        th2 = np.arctan2(gv, gu + 0.42)
        spiral1 = (r1 < 0.52) & (np.abs((r1 * 4.5 + th1 / (2.0 * math.pi)) % 1.0 - 0.5) < 0.16)
        spiral2 = (r2 < 0.52) & (np.abs((r2 * 4.5 - th2 / (2.0 * math.pi)) % 1.0 - 0.5) < 0.16)
        # Central thorn bracket (ayus) diamond
        ayus = (np.abs(np.abs(gu) + np.abs(gv) * 0.85 - 0.55) < 0.10) | ((np.abs(gu) < 0.09) & (np.abs(gv) < 0.62))
        img[rail | spiral1 | spiral2 | ayus] = fg
        # Slate-indigo accent diamonds inside whorls
        eye_in = (r1 < 0.14) | (r2 < 0.14)
        img[eye_in] = C['slateblue']

    elif base_style == 'etn_pierced_tracery':
        # Deco-Gothic cast bronze mullion-and-transom lancet + oculus grid over alabaster/onyx
        nx = max(2.0, round(3.0 * max(aspect, 0.5)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v - 0.5) * 2.0
        # Tall narrow lancet panes (bg = alabaster/cyan/amber, fg = cast bronze mullions)
        mullion_v = (np.abs(gu) > 0.82) | (np.abs(gu) < 0.10)
        transom_h = (np.abs(gv) > 0.84) | (np.abs(gv + 0.25) < 0.07)
        # Pointed lancet arch head
        lancet_arch = (gv < -0.25) & (np.abs(np.hypot(gu * 1.15, (gv + 0.25) * 0.85) - 0.72) < 0.10)
        # Central oculus ring
        r_oc = np.hypot(gu, gv - 0.22)
        oculus = (r_oc > 0.34) & (r_oc < 0.48)
        img[mullion_v | transom_h | lancet_arch | oculus] = fg
        scr_tex = sample_cultural_tex('tex.eternian_pierced_collar', W, H, fg, bg, pal_blend=0.22)
        img = 0.55 * img + 0.45 * scr_tex

    elif base_style == 'etn_pattern_block':
        # Frank Lloyd Wright geometric cast-block textile trim (strictly geometric, never glyphic)
        nx = max(3.0, round(4.5 * max(aspect, 0.5)))
        ny = max(2.0, round(2.5 / max(aspect, 0.5)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = ((v * ny) % 1.0 - 0.5) * 2.0
        outer_sq = (np.maximum(np.abs(gu), np.abs(gv)) > 0.72) & (np.maximum(np.abs(gu), np.abs(gv)) < 0.88)
        inner_sq = (np.maximum(np.abs(gu), np.abs(gv)) < 0.38) & (np.maximum(np.abs(gu), np.abs(gv)) > 0.22)
        cross_bar = (np.abs(gu) < 0.10) | (np.abs(gv) < 0.10)
        img[outer_sq | inner_sq | cross_bar] = fg

    return np.clip(img, 0.0, 1.0)


@contextmanager
def eternian_motif_scope():
    """Temporarily register `etn_*` palette colors and custom motifs into `paint.py` without permanent mutation."""
    orig_motif = paint_mod.motif
    added_colors = []
    for k, v in ETN_COLORS.items():
        if k not in C:
            C[k] = v
            added_colors.append(k)

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        base = style.split(':')[0] if isinstance(style, str) else ''
        if base in ETN_CUSTOM_MOTIFS:
            return _etn_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped_motif
    try:
        yield
    finally:
        paint_mod.motif = orig_motif
        for k in added_colors:
            C.pop(k, None)


def assert_eternian_lore_safe(gid, parts):
    """Hard build-time assertion: ZERO forbidden red palette keys and ZERO sun-ray motifs."""
    flat = []
    for item in parts:
        if isinstance(item, (list, tuple)):
            flat.extend(x for x in item if x is not None)
        elif item is not None:
            flat.append(item)

    def _check_val(val):
        if isinstance(val, str):
            base = val.split(':')[0]
            if base in FORBIDDEN_ETERNIAN_COLORS:
                raise ValueError(f'Eternian NO-RED violation on {gid}: forbidden color {val!r}')
            if base in FORBIDDEN_ETERNIAN_MOTIFS:
                raise ValueError(f'Eternian NO-SUN-RAY violation on {gid}: forbidden motif {val!r}')
        elif isinstance(val, dict):
            for v in val.values():
                _check_val(v)
        elif isinstance(val, (list, tuple)):
            for v in val:
                _check_val(v)

    for p in flat:
        _check_val(getattr(p, 'paint', None))


def _etn_assemble(gid, label, slot, parts, covers_hair=False, covers_face=False, open_torso=False, legged=False):
    assert_eternian_lore_safe(gid, parts)
    return assemble_garment(
        gid, label, slot, 'eternian', parts,
        covers_hair=covers_hair, covers_face=covers_face,
        open_torso=open_torso, legged=legged,
    )


# ===========================================================================================================
# SHARED ETERNIAN PAINTS
# ===========================================================================================================
def _p_bufu(base='soot', maze_col='gold', rank=7, fabric='cloth.silk'):
    return P(base, 0.04, [
        B('bottom', 0.0, 0.050, f'etn_circuit_maze:{rank}', maze_col, base),
        B('top', 0.0, 0.025, 'solid', maze_col),
    ], [
        PN(0.0, 1.0, f'etn_circuit_maze:{rank}', maze_col, base, 0.14),
    ], fabric=fabric)


def _p_heir_silk(base='celadon', accent='etn_bronzeorange', rank=9):
    return P(base, 0.04, [
        B('bottom', 0.0, 0.065, f'etn_circuit_maze:{rank}', accent, 'teal'),
        B('top', 0.0, 0.028, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'eternian_icons', accent, base, 0.16),
    ], fabric='cloth.silk')


def _p_fish_scale(metal='gold', rim='soot'):
    return P(metal, 0.03, [
        B('bottom', 0.0, 0.025, 'solid', rim),
        B('top', 0.0, 0.020, 'solid', rim),
    ], [
        PN(0.0, 1.0, 'eternian_fish_scale', metal, rim, 0.14),
    ], fabric='metal.gold' if metal == 'gold' else ('metal.iron' if metal in ('silver', 'etn_gunmetal') else 'metal.bronze'))


def _p_celadon_porcelain(base='celadon', mullion='bronze'):
    return P(base, 0.03, [
        B('top', 0.0, 0.022, 'solid', mullion),
        B('bottom', 0.0, 0.024, 'solid', mullion),
    ], [
        PN(0.0, 1.0, 'etn_celadon_crackle', mullion, base, 0.14),
    ], fabric='metal.chrome')


def _p_tracery(pane='etn_alabaster', mullion='bronze'):
    return P(pane, 0.03, [
        B('top', 0.0, 0.020, 'solid', mullion),
        B('bottom', 0.0, 0.020, 'solid', mullion),
    ], [
        PN(0.0, 1.0, 'etn_pierced_tracery', mullion, pane, 0.14),
    ], fabric='metal.bronze')


def _p_ancestors(face_col='gold', bg='soot'):
    return P(bg, 0.03, [
        B('top', 0.0, 0.018, 'solid', 'etn_etgreen'),
        B('bottom', 0.0, 0.018, 'solid', 'etn_etgreen'),
    ], [
        PN(0.0, 1.0, 'etn_closed_eye_ancestors', face_col, bg, 0.15),
    ], fabric='cloth.silk')


def _p_hayrant_quilt(base='white', fret_fg='silver', fret_bg='soot'):
    return P(base, 0.04, [
        B('bottom', 0.0, 0.075, 'etn_hayrant_ainu_fret', fret_fg, fret_bg),
        B('top', 0.0, 0.035, 'etn_hayrant_ainu_fret', fret_fg, fret_bg),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'silver', base, 0.14),
    ], fabric='cloth.quilted.diamond')


def _p_pattern_block(base='cotton', trim='etn_buffbrick', fg='celadon'):
    return P(base, 0.05, [
        B('bottom', 0.0, 0.060, 'etn_pattern_block', fg, trim),
        B('top', 0.0, 0.024, 'solid', fg),
    ], fabric=COTTON)


def _p_kelp_leather(base='etn_kelp', trim='etn_corallime'):
    return leathery(P(base, 0.05, [
        B('bottom', 0.0, 0.028, 'solid', trim),
        B('top', 0.0, 0.018, 'solid', trim),
    ], fabric='cloth.oilskin.tarred_seams'))


def _p_metal(col='bronze', trim='soot', fab='metal.bronze'):
    return P(col, 0.03, [
        B('top', 0.0, 0.018, 'solid', trim),
        B('bottom', 0.0, 0.018, 'solid', trim),
    ], fabric=fab)


# ===========================================================================================================
# SHARED 3D DECO-GOTHIC / QING PRIMITIVES
# ===========================================================================================================
def _etn_cranial_shell(name, paint, f_top=1.14, f_bot=-0.04, ease=0.018, rows=14, n=36):
    """Open-face cranial helmet/cap shell with high, sealed dome (`f_top >= 1.12`, `ease >= 0.018`)
    that never double-tapers into the skull and arches cleanly above the brow (`f_brow=0.60`)."""
    a, b, up, bk, left = head_frame()
    head_len = float(np.linalg.norm(b - a))
    f_top_use = max(float(f_top), 1.12)
    ease_use = max(float(ease), 0.018)
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angs]
    # Equator radii sampled once at mid-cranium (avoids double-taper poke-through near the crown)
    c_mid = a + (b - a) * 0.56
    base_rs = []
    for d in ds:
        h_eq = first_hit(c_mid, d)
        base_rs.append((float(h_eq) if (h_eq is not None and 0.045 < h_eq < 0.145) else 0.098) + ease_use)
    base_rs = np.array([np.mean([base_rs[(j + dj) % n] for dj in (-2, -1, 0, 1, 2)]) for j in range(n)])

    f_brow = min(f_top_use - 0.16, 0.60)
    f_rim = np.full(n, float(f_bot), dtype=np.float64)
    if f_bot < f_brow:
        half_span = 0.56 * math.pi
        for j, an in enumerate(angs):
            ang_front = abs(an - math.pi)
            if ang_front < half_span:
                w = 0.5 + 0.5 * math.cos(math.pi * ang_front / half_span)
                f_rim[j] = float(f_bot) + (f_brow - float(f_bot)) * (w ** 0.82)

    Q = np.zeros((rows, n, 3), dtype=np.float64)
    for i in range(rows):
        u = i / float(max(rows - 1, 1))
        for j, (an, d) in enumerate(zip(angs, ds)):
            f_ij = f_top_use + (float(f_rim[j]) - f_top_use) * u
            c_ij = a + (b - a) * f_ij
            if f_ij > 0.68:
                u_top = min(1.0, (f_ij - 0.68) / max(0.10, f_top_use - 0.68))
                scale_r = max(0.04, math.sqrt(max(0.0, 1.0 - u_top ** 1.75)))
            elif f_ij < 0.20:
                scale_r = 1.0 - 0.10 * ((0.20 - f_ij) / 0.30)
            else:
                scale_r = 1.0 + 0.025 * math.sin((f_ij - 0.20) / 0.48 * math.pi)
            r_ij = float(base_rs[j]) * scale_r
            if f_ij <= 0.96:
                h_hit = first_hit(c_ij, d)
                if h_hit is not None and 0.020 < h_hit < 0.145:
                    r_ij = max(r_ij, float(h_hit) + ease_use)
            Q[i, j] = c_ij + d * r_ij

    # Smoothly domed, completely sealed top cap strictly >= 28mm above skull apex `b`
    apex_c = b + up * max(0.028, (f_top_use - 1.0) * head_len)
    Q[0] = apex_c + (Q[0] - apex_c) * 0.04
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


# Override imported sculpted_cranium so all Eternian caps & helms arch cleanly above the face
sculpted_cranium = _etn_cranial_shell


def _stepped_pier_crown(gid, ranks, band_paint, pier_paint, ease=0.004, f0=0.58, f1=0.74, pier_h=0.095):
    """Snug bare-head band (`ease=0.004`) + stepped organ-pipe Art Deco piers anchored directly on the band."""
    a, b, up, bk, left = head_frame()
    parts = [crown_band(gid + '_band', band_paint, f0=f0, f1=f1, ease=ease, flare=0.004, rows=5, n=36)]
    c_mid = a + (b - a) * (0.5 * (f0 + f1))
    mid_idx = (ranks - 1) * 0.5
    for i in range(ranks):
        ang = math.pi + (i - mid_idx) * (0.145 if ranks <= 5 else 0.115)
        d = bk * math.cos(ang) + left * math.sin(ang)
        h_hit = first_hit(c_mid, d) or 0.096
        step_scale = 1.0 - 0.14 * abs(i - mid_idx)
        p_bot = c_mid + d * (h_hit + ease + 0.002) - up * 0.006
        p_top = p_bot + up * (pier_h * step_scale) + d * 0.004
        parts.append(tube(f'{gid}_pier{i}', [p_bot, p_top], 0.0095 * (0.85 + 0.15 * step_scale),
                          pier_paint, n=6, rigid_joint='Head'))
    return parts


def _closed_eye_mask(gid, face_paint, detail_paint, ease=0.013, open_lower=False, cyan_seam=False):
    """Contoured faceted closed-eyed ancestor faceplate (or upper Calling Visor when `open_lower=True`)."""
    a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    f_top = 0.68 if not open_lower else 0.67
    f_bot = 0.02 if not open_lower else max(f_nose + 0.02, f_eyes - 0.07)
    fp = sculpted_faceplate(
        gid + '_face', face_paint, f_top=f_top, f_bot=f_bot, ease=ease,
        span=0.44 if not open_lower else 0.42,
        rows=14 if not open_lower else 9, cols=23,
        brow_relief=0.014, nose_relief=0.019 if not open_lower else 0.012,
        cheek_relief=0.009, chin_relief=0.008 if not open_lower else 0.0,
    )
    parts = [fp]
    Q = fp.P  # (rows, cols, 3)

    def _fp_pt(v_frac, u_frac, out_push=0.0035):
        ri = int(round(np.clip(v_frac, 0.0, 1.0) * (Q.shape[0] - 1)))
        ci = int(round(np.clip(0.5 + 0.5 * u_frac, 0.0, 1.0) * (Q.shape[1] - 1)))
        p = Q[ri, ci]
        d_out = p - np.array([a[0], a[1], p[2]])
        d_out /= max(np.linalg.norm(d_out), 1e-6)
        return p + d_out * out_push

    # Deco-cubist T-brow & nasal bridge anchored directly onto the sculpted faceplate mesh
    brow_pts = [_fp_pt(0.26, u, 0.0045) for u in np.linspace(-0.72, 0.72, 7)]
    parts.append(tube(gid + '_browbar', brow_pts, 0.0062, detail_paint, n=6, rigid_joint='Head'))
    nose_pts = [_fp_pt(v, 0.0, 0.0042) for v in np.linspace(0.26, 0.60 if not open_lower else 0.85, 4)]
    parts.append(tube(gid + '_nosebar', nose_pts, 0.0048, detail_paint, n=6, rigid_joint='Head'))

    # Prominent recessed dark eye-slits (or glowing cyan Calling seam) + serene closed mouth seam
    slit_p = P('cybercyan', 0.01) if cyan_seam else P('soot', 0.02)
    if cyan_seam:
        seam_pts = [_fp_pt(0.39, u, 0.0048) for u in np.linspace(-0.66, 0.66, 7)]
        parts.append(tube(gid + '_visorseam', seam_pts, 0.0052, slit_p, n=6, rigid_joint='Head'))
    else:
        for sgn, tag in ((-1.0, 'l'), (1.0, 'r')):
            pts = [_fp_pt(0.40, sgn * u, 0.0045) for u in np.linspace(0.16, 0.56, 4)]
            parts.append(tube(f'{gid}_lid_{tag}', pts, 0.0048, slit_p, n=6, rigid_joint='Head'))
    if not open_lower:
        mouth_pts = [_fp_pt(0.75, u, 0.0040) for u in np.linspace(-0.26, 0.26, 4)]
        parts.append(tube(gid + '_mouthseam', mouth_pts, 0.0036, slit_p, n=6, rigid_joint='Head'))
    return parts


def _lineage_halo_rig(gid, n_discs, ring_paint, disc_paints, strap_paint, double_ring=False):
    """Dorsal Spine2 Lineage-Disc Halo connected seamlessly via twin bronze pylons (ZERO floating parts)."""
    parts = pack_straps(gid + '_straps', strap_paint, ease=0.015, width=0.024, thick=0.005)
    c_sp = spine_at(J('Spine2')[2] + 0.02)
    back_p = surface_out(c_sp, np.array([0.0, 1.0, 0.0]), 0.016)
    # Flush dorsal bronze mounting housing
    parts.append(blob(gid + '_mount', back_p + np.array([0.0, 0.018, 0.0]),
                      [0.082, 0.026, 0.105], ring_paint, n=10, rows=5, rigid_joint='Spine2'))
    # Halo center behind upper shoulders/head
    z_halo = J('Neck')[2] + 0.095
    y_halo = back_p[1] + 0.044
    r_halo = 0.235 if n_discs >= 8 else 0.185
    c_halo = np.array([0.0, y_halo, z_halo])

    # Twin structural pylons anchoring mount -> halo ring (guarantees connected geometry)
    for sgn, tag in ((-1.0, 'r'), (1.0, 'l')):
        p0 = back_p + np.array([sgn * 0.048, 0.020, 0.045])
        p1 = c_halo + np.array([sgn * r_halo * 0.42, -0.004, -r_halo * 0.88])
        parts.append(tube(f'{gid}_pylon_{tag}', [p0, 0.5 * (p0 + p1), p1], 0.010, ring_paint, n=6, rigid_joint='Spine2'))

    # Main octagonal bronze halo ring
    n_seg = 16
    ring_pts = [
        c_halo + np.array([r_halo * math.sin(th), 0.0, r_halo * math.cos(th)])
        for th in np.linspace(0.0, 2.0 * math.pi, n_seg + 1)
    ]
    parts.append(tube(gid + '_ring', ring_pts, 0.011, ring_paint, n=8, rigid_joint='Spine2'))

    if double_ring:
        r_in = r_halo * 0.68
        in_pts = [
            c_halo + np.array([r_in * math.sin(th), -0.003, r_in * math.cos(th)])
            for th in np.linspace(0.0, 2.0 * math.pi, n_seg + 1)
        ]
        parts.append(tube(gid + '_inring', in_pts, 0.0085, _p_metal('silver', 'soot', 'metal.iron'), n=8, rigid_joint='Spine2'))
        for k in range(4):
            th = k * 0.5 * math.pi + 0.25 * math.pi
            sp0 = c_halo + np.array([r_in * math.sin(th), -0.002, r_in * math.cos(th)])
            sp1 = c_halo + np.array([r_halo * math.sin(th), 0.0, r_halo * math.cos(th)])
            parts.append(tube(f'{gid}_spoke{k}', [sp0, sp1], 0.006, ring_paint, n=6, rigid_joint='Spine2'))

    # Ancestor rosettes mounted directly onto the ring perimeter
    for k in range(n_discs):
        th = (k / float(n_discs)) * 2.0 * math.pi
        dp = c_halo + np.array([r_halo * math.sin(th), 0.004, r_halo * math.cos(th)])
        parts.append(rosette(
            f'{gid}_disc{k}', dp, np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
            0.026, disc_paints[k % len(disc_paints)], n=10, thick=0.011, rigid_joint='Spine2',
        ))
    return parts


def _dorsal_pack(gid, body_paint, accent_paint, strap_paint, style='docket'):
    """Flush dorsal Spine2 equipment pack anchored with `pack_straps(ease=0.015)`."""
    parts = pack_straps(gid + '_straps', strap_paint, ease=0.015, width=0.024, thick=0.005)
    c_sp = spine_at(J('Spine2')[2] - 0.02)
    bp = surface_out(c_sp, np.array([0.0, 1.0, 0.0]), 0.015)

    if style == 'tubes':
        # Triple vertical polished bronze pneumatic-tube cylinders
        parts.append(blob(gid + '_plate', bp + np.array([0.0, 0.014, 0.0]),
                          [0.115, 0.022, 0.140], strap_paint, n=10, rows=5, rigid_joint='Spine2'))
        for idx, xo in enumerate((-0.068, 0.0, 0.068)):
            p0 = bp + np.array([xo, 0.045, -0.135])
            p1 = bp + np.array([xo, 0.045, 0.165])
            parts.append(tube(f'{gid}_cyl{idx}', [p0, p1], 0.027, body_paint, n=10, rigid_joint='Spine2'))
            parts.append(blob(f'{gid}_cap{idx}', p1 + np.array([0.0, 0.0, 0.008]),
                              [0.029, 0.029, 0.014], accent_paint, n=8, rows=4, rigid_joint='Spine2'))
    elif style == 'relik':
        # Kept Ancient white titanium & pierced-bronze relay pack with live cyan strip
        parts.append(blob(gid + '_core', bp + np.array([0.0, 0.034, 0.01]),
                          [0.120, 0.052, 0.175], body_paint, n=10, rows=6, rigid_joint='Spine2'))
        parts.append(blob(gid + '_cyan', bp + np.array([0.0, 0.078, 0.01]),
                          [0.028, 0.016, 0.125], P('cybercyan', 0.01), n=8, rows=4, rigid_joint='Spine2'))
        for sgn, tag in ((-1.0, 'r'), (1.0, 'l')):
            p0 = bp + np.array([sgn * 0.082, 0.038, -0.105])
            p1 = bp + np.array([sgn * 0.082, 0.038, 0.145])
            parts.append(tube(f'{gid}_rail_{tag}', [p0, p1], 0.013, accent_paint, n=6, rigid_joint='Spine2'))
    elif style == 'reactor':
        # Stepped-pier Juggernaut bronze-tracery dynamo carapace with twin amber turbines
        parts.append(blob(gid + '_cara', bp + np.array([0.0, 0.040, 0.02]),
                          [0.140, 0.062, 0.185], body_paint, n=10, rows=6, rigid_joint='Spine2'))
        for sgn, tag in ((-1.0, 'r'), (1.0, 'l')):
            p0 = bp + np.array([sgn * 0.082, 0.056, -0.09])
            p1 = bp + np.array([sgn * 0.082, 0.056, 0.165])
            parts.append(tube(f'{gid}_turb_{tag}', [p0, p1], 0.030, accent_paint, n=10, rigid_joint='Spine2'))
            parts.append(blob(f'{gid}_glow_{tag}', p1 + np.array([0.0, 0.0, 0.008]),
                              [0.024, 0.024, 0.018], P('amber', 0.02), n=8, rows=4, rigid_joint='Spine2'))
    elif style == 'chime':
        # Anker-Clock bronze escapement frame & automaton hour-bell
        parts.append(blob(gid + '_box', bp + np.array([0.0, 0.036, -0.01]),
                          [0.115, 0.042, 0.145], body_paint, n=10, rows=5, rigid_joint='Spine2'))
        bell_c = bp + np.array([0.0, 0.068, 0.135])
        parts.append(tube(gid + '_arm', [bp + np.array([0.0, 0.040, 0.06]), bell_c], 0.011, accent_paint, n=6, rigid_joint='Spine2'))
        parts.append(rosette(gid + '_dial', bp + np.array([0.0, 0.062, -0.01]),
                             np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                             0.075, accent_paint, n=12, thick=0.016, rigid_joint='Spine2'))
        parts.append(blob(gid + '_bell', bell_c, [0.042, 0.042, 0.038], accent_paint, n=10, rows=5, rigid_joint='Spine2'))
    elif style == 'jars':
        # Kiln-master bamboo frame cradling two celadon crackle baluster vases
        parts.append(blob(gid + '_frame', bp + np.array([0.0, 0.026, -0.01]),
                          [0.135, 0.032, 0.165], accent_paint, n=10, rows=5, rigid_joint='Spine2'))
        for sgn, tag in ((-1.0, 'r'), (1.0, 'l')):
            parts.append(blob(f'{gid}_jar_{tag}', bp + np.array([sgn * 0.065, 0.068, 0.01]),
                              [0.052, 0.052, 0.105], body_paint, n=12, rows=6, rigid_joint='Spine2'))
    elif style == 'pane':
        # Glazier padded timber A-frame carrying alabaster & bronze-tracery lancet pane
        parts.append(blob(gid + '_rack', bp + np.array([0.0, 0.026, 0.01]),
                          [0.145, 0.028, 0.200], accent_paint, n=10, rows=5, rigid_joint='Spine2'))
        parts.append(blob(gid + '_pane', bp + np.array([0.0, 0.048, 0.02]),
                          [0.125, 0.016, 0.185], body_paint, n=10, rows=5, rigid_joint='Spine2'))
    elif style == 'quiver':
        # Hayrant repeating-bolt box quiver + lashed snowshoe slats
        parts.append(blob(gid + '_qbox', bp + np.array([0.0, 0.040, 0.0]),
                          [0.095, 0.044, 0.175], body_paint, n=10, rows=5, rigid_joint='Spine2'))
        for sgn, tag in ((-1.0, 'r'), (1.0, 'l')):
            parts.append(blob(f'{gid}_shoe_{tag}', bp + np.array([sgn * 0.075, 0.058, 0.02]),
                              [0.045, 0.014, 0.165], accent_paint, n=8, rows=5, rigid_joint='Spine2'))
    elif style == 'lantern':
        # Shuttered verdigris harbour/canal inspection storm lantern & ledger tube
        parts.append(blob(gid + '_case', bp + np.array([-0.028, 0.024, -0.01]),
                          [0.092, 0.046, 0.145], body_paint, n=10, rows=5, rigid_joint='Spine2'))
        parts.append(blob(gid + '_lamp', bp + np.array([0.060, 0.042, 0.03]),
                          [0.044, 0.044, 0.075], accent_paint, n=10, rows=5, rigid_joint='Spine2'))
        parts.append(blob(gid + '_core', bp + np.array([0.060, 0.058, 0.03]),
                          [0.026, 0.024, 0.046], P('amber', 0.02), n=8, rows=4, rigid_joint='Spine2'))
    elif style == 'creel':
        # Woven reed / kelp-stipe basketry creel + coiled hawser
        parts.append(blob(gid + '_creel', bp + np.array([0.0, 0.044, -0.02]),
                          [0.125, 0.068, 0.155], body_paint, n=12, rows=6, rigid_joint='Spine2'))
        parts.append(blob(gid + '_rope', bp + np.array([0.0, 0.066, 0.095]),
                          [0.085, 0.034, 0.038], accent_paint, n=10, rows=4, rigid_joint='Spine2'))
    else:
        # 'docket' / 'assay' / 'case' — lacquered/bronze-bound strongbox or ledger rack
        parts.append(blob(gid + '_box', bp + np.array([0.0, 0.046, 0.0]),
                          [0.128, 0.050, 0.165], body_paint, n=10, rows=6, rigid_joint='Spine2'))
        parts.append(blob(gid + '_clasp', bp + np.array([0.0, 0.080, 0.02]),
                          [0.085, 0.020, 0.034], accent_paint, n=8, rows=4, rigid_joint='Spine2'))
    return parts


def _bufu_robe_parts(gid, base_paint, bufu_paint, collar_paint, sleeve_paint, sash_paint,
                     z_bot_off=0.06, ease=0.024, flare=0.075, cape_paint=None, pauldron_paint=None):
    """Floor/calf-length Qing-Deco court robe with cloth chains (`hang_from=WAIST`) & front/back bufu squares."""
    WAIST = J('Spine')[2]
    NECK = J('Neck')[2]
    ANKLE = J('LeftFoot')[2]
    z_bot = ANKLE + z_bot_off
    parts = [
        torso_tube(gid + '_robe', z_bot, NECK + 0.01, ease=ease, paint=base_paint,
                   n=40, hang_from=WAIST, flare=flare, rows=22),
        sleeves(gid + '_slv', 'wrist', ease=0.023, paint=sleeve_paint, rows=10, n=22),
        collar_disc(gid + '_col', 0.115, collar_paint, drop=0.045, rows=6, n=40, scallop=0.0, ease=ease + 0.008),
        belt_sash(gid + '_sash', WAIST - 0.040, WAIST + 0.035, sash_paint, ease=ease + 0.014),
        # Front Qing bufu circuit-maze rank square (back rank maze woven directly into robe torso_tube)
        tabard(gid + '_bufu_f', WAIST + 0.055, NECK - 0.065, bufu_paint, width=0.20, ease=ease + 0.012, front=True, back=False),
    ]
    if cape_paint is not None:
        parts.append(cape(gid + '_cape', WAIST - 0.14, cape_paint, z_top=NECK + 0.01,
                          span=0.52, ease=ease + 0.018, flare=0.08, rows=12, n=24))
    if pauldron_paint is not None:
        parts.append(pauldron(gid + '_pl', L, pauldron_paint, reach=0.34, ease=ease + 0.014))
        parts.append(pauldron(gid + '_pr', R, pauldron_paint, reach=0.34, ease=ease + 0.014))
    return parts


def _armored_cuirass_parts(gid, cuirass_paint, sleeve_paint, skirt_paint, pauldron_paint,
                           belt_paint, chest_badge_paint=None, z_bot_off=0.22,
                           style='gothic', lames=3, haute_piece=True, faulds=3):
    """Sculpted 3D Deco-Gothic rigid plate cuirass + gorget + articulated pauldrons (zero cloth chains)."""
    WAIST = J('Spine')[2]
    NECK = J('Neck')[2]
    parts = [
        torso_tube(gid + '_sub', WAIST - 0.03, NECK + 0.01, ease=0.017, paint=sleeve_paint,
                   n=36, rows=10),
        sleeves(gid + '_slv', 'wrist', ease=0.022, paint=sleeve_paint, rows=10, n=22),
        *cuirass_plate(gid, cuirass_paint, trim_paint=pauldron_paint, style=style, ease=0.024, faulds=faulds),
        *gorget_guard(gid, pauldron_paint, trim_paint=belt_paint, ease=0.025),
        *articulated_pauldrons(gid, pauldron_paint, trim_paint=belt_paint, lames=lames, haute_piece=haute_piece, ease=0.025),
        belt_sash(gid + '_belt', WAIST - 0.040, WAIST + 0.028, belt_paint, ease=0.035),
    ]
    return parts


def _coat_or_tunic_parts(gid, coat_paint, sleeve_paint, sash_paint, z_bot, ease=0.022,
                         flare=0.062, collar_paint=None, apron_paint=None, tabard_paint=None, tabard_back=True):
    """Tailored coat or tunic with proper waist hang & flare over tailored trousers."""
    WAIST = J('Spine')[2]
    NECK = J('Neck')[2]
    parts = [
        torso_tube(gid + '_body', z_bot, NECK + 0.01, ease=ease, paint=coat_paint,
                   n=38, hang_from=WAIST, flare=flare, rows=18),
        sleeves(gid + '_slv', 'wrist', ease=0.023, paint=sleeve_paint, rows=10, n=22),
        belt_sash(gid + '_sash', WAIST - 0.038, WAIST + 0.030, sash_paint, ease=ease + 0.014),
    ]
    if collar_paint is not None:
        parts.append(collar(gid + '_col', collar_paint, height=0.052, flare=0.014, ease=ease + 0.008))
    if apron_paint is not None:
        parts.append(tabard(gid + '_apron', z_bot + 0.02, NECK - 0.09, apron_paint,
                            width=0.25, ease=ease + 0.016, front=True, back=False))
    if tabard_paint is not None:
        parts.append(tabard(gid + '_tabf', z_bot + 0.03, NECK - 0.07, tabard_paint,
                            width=0.19, ease=ease + 0.015, front=True, back=tabard_back))
    return parts


# ===========================================================================================================
# BODY BUILDER — ALL 25 CANONICAL TIERS FOR ONE BODY (`mpfb_male` OR `mpfb_female`)
# ===========================================================================================================
def _build_for_body(sex, body_id):
    set_body(body_id)
    entries = []
    WAIST = J('Spine')[2]
    CROTCH = J('Hips')[2] - 0.06
    KNEE = J('LeftLeg')[2]
    ANKLE = J('LeftFoot')[2]
    NECK = J('Neck')[2]

    def add(gid, label, slot, parts, covers_hair=False, covers_face=False, open_torso=False, legged=False):
        ent = _etn_assemble(gid, label, slot, parts,
                            covers_hair=covers_hair, covers_face=covers_face,
                            open_torso=open_torso, legged=legged)
        ent['_body'] = body_id
        entries.append(ent)

    # -------------------------------------------------------------------------------------------------------
    # SHARED LEGS & FOOTWEAR (ZERO FOREIGN BORROWS, 100% TAILORED CLEARANCE)
    # -------------------------------------------------------------------------------------------------------
    add(f'etn_{sex}_heir_undertrousers', 'True Heir Teal Silk Under-Trousers', 'legs',
        trousers(f'etn_{sex}_heir_ut', P('teal', 0.04, [B('bottom', 0.0, 0.035, 'solid', 'gold')], fabric='cloth.silk'),
                 ease=0.014, bag=0.008), legged=True)
    add(f'etn_{sex}_heir_scale_boots', 'True Heir Gilt Fish-Scale Court Boots', 'feet',
        boots(f'etn_{sex}_heir_sb', P('soot', 0.08), _p_fish_scale('gold', 'teal'),
              top=0.52, ease_top=0.014, cuff_paint=_p_metal('gold', 'soot', 'metal.gold')))

    add(f'etn_{sex}_ministry_trousers', 'Six Ministries Charcoal Silk Trousers', 'legs',
        trousers(f'etn_{sex}_min_tr', P('charcoal', 0.04, [B('bottom', 0.0, 0.030, 'solid', 'celadon')], fabric='cloth.silk'),
                 ease=0.014, bag=0.008), legged=True)
    add(f'etn_{sex}_ministry_boots', 'Six Ministries Upturned Bronze-Sole Boots', 'feet',
        boots(f'etn_{sex}_min_bt', _p_metal('bronze', 'soot'), leathery(P('soot', 0.05, [B('top', 0.0, 0.025, 'solid', 'gold')])),
              top=0.45, ease_top=0.014))

    add(f'etn_{sex}_garrison_breeches', 'Eternal State Garrison Charcoal Breeches', 'legs',
        trousers(f'etn_{sex}_gar_br', P('charcoal', 0.05, [B('bottom', 0.0, 0.035, 'solid', 'bronze')], fabric=WOOL),
                 ease=0.014, bag=0.008), legged=True)

    add(f'etn_{sex}_common_trousers', 'Provincial Charcoal Cotton Trousers', 'legs',
        trousers(f'etn_{sex}_com_tr', P('charcoal', 0.06, [B('bottom', 0.0, 0.025, 'solid', 'etn_buffbrick')], fabric=COTTON),
                 ease=0.014, bag=0.008), legged=True)
    add(f'etn_{sex}_artisan_boots', 'Square-Toed Buff-Leather Guild Boots', 'feet',
        boots(f'etn_{sex}_art_bt', P('soot', 0.08), leathery(P('etn_buffbrick', 0.06, [B('top', 0.0, 0.025, 'solid', 'bronze')])),
              top=0.46, ease_top=0.014))

    # =======================================================================================================
    # PILLAR I — THE SANCTUM: TRUE HEIRS, MASKED PROXIES & BODYGUARD COHORTS (7 TIERS)
    # =======================================================================================================

    # 1. `heir_warden_elder` — Quarantine Warden Elder (open living metallic face!)
    add(f'etn_{sex}_warden_elder_crown', 'Warden Elder Stepped-Pier Deco Crown', 'head',
        _stepped_pier_crown(f'etn_{sex}_we_cr', 5, _p_metal('gold', 'celadon', 'metal.gold'),
                            _p_celadon_porcelain('celadon', 'gold'), ease=0.004, f0=0.58, f1=0.73, pier_h=0.105),
        covers_hair=False, covers_face=False)
    add(f'etn_{sex}_warden_elder_robe', 'Warden Elder Celadon & Fish-Scale Court Robe', 'torso',
        _bufu_robe_parts(f'etn_{sex}_we_rb', _p_heir_silk('celadon', 'etn_bronzeorange', 9),
                         _p_ancestors('gold', 'teal'), _p_fish_scale('gold', 'teal'),
                         _p_heir_silk('teal', 'etn_bronzeorange', 9), _p_metal('gold', 'teal', 'metal.gold'),
                         z_bot_off=0.05, cape_paint=_p_fish_scale('gold', 'celadon')))
    add(f'etn_{sex}_warden_elder_cuffs', 'Warden Elder Pierced-Bronze Cuffs', 'gloves',
        full_gloves(f'etn_{sex}_we_gl', _p_tracery('etn_alabaster', 'bronze'), P('celadon', 0.04, fabric='cloth.silk'),
                    ring_paint=_p_metal('gold', 'soot', 'metal.gold')))
    add(f'etn_{sex}_back_lineage_halo', '12-Disc Portable Lineage Halo', 'back',
        _lineage_halo_rig(f'etn_{sex}_lin_hl', 12, _p_metal('bronze', 'soot'),
                          [_p_ancestors('gold', 'soot'), _p_ancestors('silver', 'soot'),
                           _p_ancestors('bronze', 'soot'), _p_ancestors('etn_gunmetal', 'soot')],
                          _p_metal('bronze', 'teal')))

    # 2. `heir_restorer_lord` — Restorer Expeditionary Lord (Ancient Calling Visor)
    a_h, b_h, up_h, bk_h, lf_h = head_frame()
    add(f'etn_{sex}_head_calling_visor', 'Ancient Calling Visor & Stepped Crown', 'head',
        _stepped_pier_crown(f'etn_{sex}_rl_cr', 3, _p_metal('bronze', 'celadon'),
                            _p_metal('ancient', 'bronze', 'metal.iron'), ease=0.006, f0=0.60, f1=0.76, pier_h=0.090)
        + _closed_eye_mask(f'etn_{sex}_rl_vs', _p_metal('ancient', 'bronze', 'metal.iron'),
                           _p_metal('bronze', 'soot'), ease=0.012, open_lower=True, cyan_seam=True),
        covers_hair=False, covers_face=True)
    add(f'etn_{sex}_restorer_panoply', 'Restorer Expeditionary Court Panoply', 'torso',
        _armored_cuirass_parts(f'etn_{sex}_rl_tr', _p_tracery('etn_alabaster', 'bronze'),
                               _p_heir_silk('teal', 'etn_bronzeorange', 8),
                               _p_heir_silk('celadon', 'etn_bronzeorange', 8),
                               _p_metal('ancient', 'bronze', 'metal.chrome'),
                               _p_metal('bronze', 'soot'),
                               style='cyber_plate', lames=3, haute_piece=True, faulds=3))
    add(f'etn_{sex}_restorer_gauntlets', 'Restorer Titanium & Bronze Gauntlets', 'gloves',
        full_gloves(f'etn_{sex}_rl_gl', _p_metal('ancient', 'bronze', 'metal.chrome'),
                    _p_metal('bronze', 'soot'), knuckle_paint=P('cybercyan', 0.02))
        + sculpted_vambraces(f'etn_{sex}_rl_vm', _p_metal('ancient', 'bronze', 'metal.chrome'),
                             trim_paint=_p_metal('bronze', 'soot'), couter=True, ease=0.016))
    add(f'etn_{sex}_back_kept_relikpack', 'Kept Ancient White & Bronze Relay Pack', 'back',
        _dorsal_pack(f'etn_{sex}_rl_bk', _p_metal('ancient', 'bronze', 'metal.chrome'),
                     _p_metal('bronze', 'soot'), leathery(P('charcoal', 0.05)), style='relik'))
    add(f'etn_{sex}_restorer_breeches', 'Restorer Charcoal & Teal Riding Breeches', 'legs',
        trousers(f'etn_{sex}_rl_lg', P('charcoal', 0.04, [B('bottom', 0.0, 0.040, 'solid', 'teal')], fabric=WOOL),
                 ease=0.014, bag=0.008)
        + hinged_tassets(f'etn_{sex}_rl_ts', _p_metal('ancient', 'bronze', 'metal.chrome'),
                         trim_paint=_p_metal('bronze', 'soot'), lames=4, ease=0.024), legged=True)
    add(f'etn_{sex}_restorer_greaves', 'Restorer Celadon-Porcelain & Bronze Greaves', 'feet',
        boots(f'etn_{sex}_rl_ft', P('soot', 0.06), _p_celadon_porcelain('celadon', 'bronze'),
              top=0.36, ease_top=0.010, cuff_paint=_p_metal('bronze', 'soot'))
        + sculpted_greaves(f'etn_{sex}_rl_gr', _p_celadon_porcelain('celadon', 'bronze'),
                           trim_paint=_p_metal('bronze', 'soot'), poleyn=True, ease=0.016))

    # 3. `heir_withdrawn_scion` — Withdrawn Lineage Scion (pierced-bronze lattice veil)
    add(f'etn_{sex}_withdrawn_veil_crown', 'Withdrawn Scion Pierced-Bronze Veil Crown', 'head',
        _stepped_pier_crown(f'etn_{sex}_ws_cr', 5, _p_metal('etn_gunmetal', 'silver', 'metal.iron'),
                            _p_metal('silver', 'etn_gunmetal', 'metal.iron'), ease=0.005, f0=0.58, f1=0.75, pier_h=0.115)
        + [sculpted_faceplate(f'etn_{sex}_ws_veil', _p_tracery('etn_gunmetal', 'bronze'),
                              f_top=0.66, f_bot=-0.06, ease=0.015, span=0.46, rows=12, cols=21)],
        covers_hair=False, covers_face=True)
    add(f'etn_{sex}_withdrawn_vestment', 'Withdrawn Scion Sanctuary Vestment', 'torso',
        _bufu_robe_parts(f'etn_{sex}_ws_rb', _p_heir_silk('teal', 'etn_bronzeorange', 9),
                         _p_ancestors('silver', 'teal'), _p_fish_scale('etn_gunmetal', 'silver'),
                         _p_heir_silk('celadon', 'etn_bronzeorange', 9), _p_metal('silver', 'teal', 'metal.iron'),
                         z_bot_off=0.04, cape_paint=_p_ancestors('silver', 'teal')))
    add(f'etn_{sex}_withdrawn_hands', 'Withdrawn Elongated Silver Finger-Sheaths', 'gloves',
        full_gloves(f'etn_{sex}_ws_gl', _p_metal('etn_gunmetal', 'silver', 'metal.iron'),
                    _p_metal('silver', 'etn_gunmetal', 'metal.iron')))
    add(f'etn_{sex}_withdrawn_double_halo', 'Withdrawn Twin Oculus Lineage Halo', 'back',
        _lineage_halo_rig(f'etn_{sex}_ws_hl', 8, _p_metal('bronze', 'soot'),
                          [_p_ancestors('silver', 'soot'), _p_ancestors('etn_gunmetal', 'soot')],
                          _p_metal('etn_gunmetal', 'silver', 'metal.iron'), double_ring=True))

    # 4. `withdrawn_proxy` — Withdrawn Elder's Masked Human Proxy
    add(f'etn_{sex}_proxy_elder_mask', 'Withdrawn Proxy Faceted Porcelain Mask', 'head',
        [sculpted_cranium(f'etn_{sex}_px_cr', P('soot', 0.04, fabric='cloth.silk'), f_top=1.02, f_bot=-0.02, ease=0.012)]
        + _closed_eye_mask(f'etn_{sex}_px_mk', P('porcelain', 0.02, fabric='cloth.plain'),
                           _p_metal('bronze', 'soot'), ease=0.013),
        covers_hair=True, covers_face=True)
    add(f'etn_{sex}_proxy_robe', 'Withdrawn Proxy Soot & Onyx Speaker Cassock', 'torso',
        _bufu_robe_parts(f'etn_{sex}_px_rb', _p_bufu('soot', 'white', 9),
                         _p_tracery('soot', 'bronze'), P('celadon', 0.04, fabric='cloth.silk'),
                         _p_bufu('soot', 'white', 9), _p_metal('gold', 'soot', 'metal.gold'), z_bot_off=0.05))
    add(f'etn_{sex}_proxy_gloves', 'Proxy White Silk & Bronze Seal Gloves', 'gloves',
        full_gloves(f'etn_{sex}_px_gl', P('soot', 0.04, fabric='cloth.silk'), P('porcelain', 0.03, fabric='cloth.silk'),
                    ring_paint=_p_metal('bronze', 'soot')))
    add(f'etn_{sex}_proxy_edict_case', 'Proxy Lacquered Po-we Edict Cylinder', 'back',
        _dorsal_pack(f'etn_{sex}_px_bk', P('soot', 0.03, [B('top', 0.0, 0.03, 'solid', 'celadon')]),
                     _p_metal('gold', 'soot', 'metal.gold'), leathery(P('soot', 0.05)), style='docket'))

    # 5. `heir_juggernaut` — True Heir's Stepped-Pier Juggernaut (zero red/sun)
    jg_bowl = sculpted_cranium(f'etn_{sex}_jg_cr', _p_metal('verdigris', 'bronze', 'metal.bronze.verdigris'), f_top=1.14, f_bot=0.06, ease=0.019)
    add(f'etn_{sex}_heir_juggernaut_helm', 'Stepped-Pier Juggernaut Kettle-Helm', 'head',
        [jg_bowl,
         brim(f'etn_{sex}_jg_br', 0.56, 0.052, _p_metal('bronze', 'soot'), ease=0.019, droop=0.012),
         crest(f'etn_{sex}_jg_cs', 0.072, _p_metal('bronze', 'soot'), a0=-0.82, a1=1.40, base_ease=0.019, host_part=jg_bowl)]
        + _closed_eye_mask(f'etn_{sex}_jg_mk', _p_metal('bronze', 'soot'), P('amber', 0.02), ease=0.014),
        covers_hair=True, covers_face=True)
    add(f'etn_{sex}_heir_juggernaut_cuirass', 'Stepped-Pier Juggernaut Fortress Cuirass', 'torso',
        _armored_cuirass_parts(f'etn_{sex}_jg_tr', _p_metal('verdigris', 'bronze', 'metal.bronze'),
                               P('charcoal', 0.05, fabric='cloth.quilted.diamond'),
                               _p_fish_scale('bronze', 'charcoal'),
                               _p_metal('bronze', 'verdigris'),
                               _p_metal('bronze', 'soot'),
                               style='gothic', lames=3, haute_piece=True, faulds=3))
    add(f'etn_{sex}_heir_juggernaut_gauntlets', 'Juggernaut Verdigris-Bronze Gauntlets', 'gloves',
        full_gloves(f'etn_{sex}_jg_gl', _p_metal('verdigris', 'bronze', 'metal.bronze'),
                    _p_metal('bronze', 'soot'))
        + sculpted_vambraces(f'etn_{sex}_jg_vm', _p_metal('verdigris', 'bronze', 'metal.bronze'),
                             trim_paint=_p_metal('bronze', 'soot'), couter=True, ease=0.016))
    add(f'etn_{sex}_heir_juggernaut_reactor', 'Juggernaut Bronze-Tracery Dynamo Carapace', 'back',
        _dorsal_pack(f'etn_{sex}_jg_bk', _p_metal('verdigris', 'bronze', 'metal.bronze'),
                     _p_metal('bronze', 'soot'), leathery(P('charcoal', 0.05)), style='reactor'))
    add(f'etn_{sex}_heir_juggernaut_sabatons', 'Juggernaut Bronze Fortress Sabatons', 'feet',
        boots(f'etn_{sex}_jg_ft', P('soot', 0.06), _p_metal('verdigris', 'bronze', 'metal.bronze'),
              top=0.36, ease_top=0.010, cuff_paint=_p_metal('bronze', 'soot'))
        + sculpted_greaves(f'etn_{sex}_jg_gr', _p_metal('verdigris', 'bronze', 'metal.bronze'),
                           trim_paint=_p_metal('bronze', 'soot'), poleyn=True, ease=0.016))

    # 6. `heir_sentinel` — True Heir's Bronze-Tracery Sentinel (zero sun-rings, zero kasa!)
    add(f'etn_{sex}_heir_sentinel_helm', 'Bronze-Tracery Sentinel Pavilion-Brim Helm', 'head',
        [sculpted_cranium(f'etn_{sex}_sn_cr', _p_metal('verdigris', 'bronze', 'metal.bronze'), f_top=1.12, f_bot=0.04, ease=0.018),
         conical_hat(f'etn_{sex}_sn_pav', _p_metal('verdigris', 'bronze', 'metal.bronze'),
                     f_base=0.60, f_top=1.20, r_base=0.20, r_top=0.024, rows=8, n=12)]
        + _closed_eye_mask(f'etn_{sex}_sn_mk', _p_metal('etn_gunmetal', 'bronze', 'metal.iron'),
                           P('amber', 0.02), ease=0.014),
        covers_hair=True, covers_face=True)
    add(f'etn_{sex}_heir_sentinel_chassis', 'Bronze-Tracery Sentinel Chassis & Celadon Mantle', 'torso',
        _armored_cuirass_parts(f'etn_{sex}_sn_tr', _p_metal('silver', 'bronze', 'metal.steel'),
                               _p_heir_silk('teal', 'etn_bronzeorange', 7),
                               _p_heir_silk('celadon', 'etn_bronzeorange', 7),
                               _p_metal('bronze', 'verdigris'),
                               _p_metal('bronze', 'soot'),
                               style='cyber_plate', lames=3, haute_piece=True, faulds=3))
    add(f'etn_{sex}_heir_sentinel_cyberhands', 'Sentinel Brushed-Silver & Bronze Gauntlets', 'gloves',
        full_gloves(f'etn_{sex}_sn_gl', _p_metal('silver', 'bronze', 'metal.steel'), _p_metal('bronze', 'soot'))
        + sculpted_vambraces(f'etn_{sex}_sn_vm', _p_metal('silver', 'bronze', 'metal.steel'),
                             trim_paint=_p_metal('bronze', 'soot'), couter=True, ease=0.016))
    add(f'etn_{sex}_heir_sentinel_cyberlegs', 'Sentinel Silver-Alloy & Teal Breeches', 'legs',
        trousers(f'etn_{sex}_sn_lg', P('teal', 0.04, [B('bottom', 0.0, 0.045, 'solid', 'silver')], fabric=WOOL),
                 ease=0.014, bag=0.008)
        + hinged_tassets(f'etn_{sex}_sn_ts', _p_metal('silver', 'bronze', 'metal.steel'),
                         trim_paint=_p_metal('bronze', 'soot'), lames=4, ease=0.024), legged=True)
    add(f'etn_{sex}_heir_sentinel_cyberboots', 'Sentinel Verdigris & Silver Greave-Boots', 'feet',
        boots(f'etn_{sex}_sn_ft', P('soot', 0.06), _p_metal('silver', 'bronze', 'metal.steel'),
              top=0.36, ease_top=0.010, cuff_paint=_p_metal('verdigris', 'bronze', 'metal.bronze'))
        + sculpted_greaves(f'etn_{sex}_sn_gr', _p_metal('silver', 'bronze', 'metal.steel'),
                           trim_paint=_p_metal('verdigris', 'bronze', 'metal.bronze'), poleyn=True, ease=0.016))

    # 7. `heir_stalker` — Sanctum Gunmetal Veil-Stalker (100% crimson/maroon purged!)
    add(f'etn_{sex}_heir_stalker_helm', 'Sanctum Gunmetal Veil-Stalker Casque', 'head',
        [sculpted_cranium(f'etn_{sex}_sk_cr', _p_metal('etn_gunmetal', 'celadon', 'metal.iron'), f_top=1.02, f_bot=-0.02, ease=0.013)]
        + _stepped_pier_crown(f'etn_{sex}_sk_pr', 2, _p_metal('bronze', 'etn_gunmetal'),
                              _p_metal('etn_gunmetal', 'bronze', 'metal.iron'), ease=0.015, f0=0.66, f1=0.78, pier_h=0.085)
        + _closed_eye_mask(f'etn_{sex}_sk_mk', _p_metal('silver', 'etn_gunmetal', 'metal.steel'),
                           _p_metal('bronze', 'soot'), ease=0.013, cyan_seam=True),
        covers_hair=True, covers_face=True)
    add(f'etn_{sex}_heir_stalker_armor', 'Sanctum Gunmetal & Celadon Stalker Brigandine', 'torso',
        _armored_cuirass_parts(f'etn_{sex}_sk_tr',
                               _p_metal('etn_gunmetal', 'celadon', 'metal.iron'),
                               P('charcoal', 0.04, [B('bottom', 0.0, 0.030, 'solid', 'celadon')], fabric='cloth.quilted.diamond'),
                               P('charcoal', 0.04, [B('bottom', 0.0, 0.045, 'etn_circuit_maze:6', 'celadon', 'soot')], fabric=WOOL),
                               _p_metal('etn_gunmetal', 'bronze', 'metal.iron'),
                               _p_metal('bronze', 'soot'),
                               style='cyber_plate', lames=2, haute_piece=False, faulds=3))
    add(f'etn_{sex}_heir_stalker_gauntlets', 'Veil-Stalker Charcoal & Celadon Gauntlets', 'gloves',
        full_gloves(f'etn_{sex}_sk_gl', P('charcoal', 0.04, [B('top', 0.0, 0.025, 'solid', 'celadon')]),
                    _p_metal('etn_gunmetal', 'soot', 'metal.iron'))
        + sculpted_vambraces(f'etn_{sex}_sk_vm', _p_metal('etn_gunmetal', 'bronze', 'metal.iron'),
                             trim_paint=_p_metal('bronze', 'soot'), couter=True, ease=0.016))
    add(f'etn_{sex}_heir_stalker_breeches', 'Veil-Stalker Quilted Charcoal Breeches', 'legs',
        trousers(f'etn_{sex}_sk_lg', P('charcoal', 0.04, [B('bottom', 0.0, 0.035, 'solid', 'celadon')], fabric='cloth.quilted.diamond'),
                 ease=0.014, bag=0.008), legged=True)
    add(f'etn_{sex}_heir_stalker_greaves', 'Veil-Stalker Gunmetal & Bronze Greaves', 'feet',
        boots(f'etn_{sex}_sk_ft', P('soot', 0.06), _p_metal('etn_gunmetal', 'bronze', 'metal.iron'),
              top=0.36, ease_top=0.010, cuff_paint=P('cybercyan', 0.02))
        + sculpted_greaves(f'etn_{sex}_sk_gr', _p_metal('etn_gunmetal', 'bronze', 'metal.iron'),
                           trim_paint=_p_metal('bronze', 'soot'), poleyn=True, ease=0.016))

    # =======================================================================================================
    # PILLAR II — THE SIX MINISTRIES, CENSORATE & PAPER BUREAUCRACY (6 TIERS)
    # =======================================================================================================

    # 8. `minister` — Grand Chancellor / Arch-Minister (Rank 1-2 gold circuit-maze:9)
    add(f'etn_{sex}_minister_halo', 'Grand Chancellor Stepped Diadem & Oculus Ring', 'head',
        _stepped_pier_crown(f'etn_{sex}_mn_cr', 5, _p_metal('soot', 'gold'),
                            _p_metal('gold', 'soot', 'metal.gold'), ease=0.004, f0=0.58, f1=0.74, pier_h=0.095),
        covers_hair=False, covers_face=False)
    add(f'etn_{sex}_minister_robe', 'Grand Chancellor Soot & Gold Circuit-Maze:9 Robe', 'torso',
        _bufu_robe_parts(f'etn_{sex}_mn_rb', _p_bufu('soot', 'gold', 9),
                         _p_ancestors('gold', 'soot'), _p_metal('bronze', 'gold'),
                         _p_bufu('soot', 'gold', 9), _p_metal('gold', 'soot', 'metal.gold'), z_bot_off=0.05))
    add(f'etn_{sex}_minister_cuffs', 'Grand Chancellor Gold-Fret Silk Cuffs', 'gloves',
        full_gloves(f'etn_{sex}_mn_gl', _p_bufu('soot', 'gold', 9), P('soot', 0.04, fabric='cloth.silk'),
                    ring_paint=_p_metal('gold', 'soot', 'metal.gold')))
    add(f'etn_{sex}_minister_seal_cape', 'Grand Chancellor Stiffened Seal-Stole', 'back',
        _dorsal_pack(f'etn_{sex}_mn_bk', _p_bufu('soot', 'celadon', 9),
                     _p_metal('gold', 'soot', 'metal.gold'), P('soot', 0.04, fabric='cloth.silk'), style='docket'))

    # 9. `censor` — Censorate Inspector-General (State black + white/gold maze:7, dark spectacles)
    a_c, b_c, up_c, bk_c, lf_c, f_ns, f_ey, f_br, f_cr, x_ey = head_landmarks_exact()
    c_ey = a_c + (b_c - a_c) * f_ey
    h_ey = first_hit(c_ey, -bk_c) or 0.102
    spec_parts = _stepped_pier_crown(f'etn_{sex}_cn_cr', 3, _p_metal('soot', 'gold'),
                                     _p_metal('gold', 'soot', 'metal.gold'), ease=0.004, f0=0.58, f1=0.72, pier_h=0.075)
    # Round dark-tinted examiner spectacles connected directly to headband temple struts
    for sgn, tag in ((1.0, 'l'), (-1.0, 'r')):
        lens_c = c_ey - bk_c * (h_ey + 0.015) + lf_c * (sgn * x_ey)
        spec_parts.append(rosette(f'etn_{sex}_cn_lens_{tag}', lens_c, -bk_c, lf_c, 0.018,
                                  P('soot', 0.02, [B('top', 0.0, 0.015, 'solid', 'gold')]), n=12, thick=0.006, rigid_joint='Head'))
        temple_p = a_c + (b_c - a_c) * 0.62 + lf_c * (sgn * 0.088)
        spec_parts.append(tube(f'etn_{sex}_cn_arm_{tag}', [lens_c + lf_c * (sgn * 0.016), temple_p],
                               0.0035, _p_metal('gold', 'soot', 'metal.gold'), n=6, rigid_joint='Head'))
    spec_parts.append(tube(f'etn_{sex}_cn_bridge',
                           [c_ey - bk_c * (h_ey + 0.016) - lf_c * (x_ey - 0.016),
                            c_ey - bk_c * (h_ey + 0.016) + lf_c * (x_ey - 0.016)],
                           0.0035, _p_metal('gold', 'soot', 'metal.gold'), n=6, rigid_joint='Head'))
    add(f'etn_{sex}_censor_crown', 'Censorate Headband & Dark Examiner Spectacles', 'head',
        spec_parts, covers_hair=False, covers_face=False)
    add(f'etn_{sex}_censor_robe', 'Censorate Soot & White/Gold Circuit-Maze:7 Robe', 'torso',
        _bufu_robe_parts(f'etn_{sex}_cn_rb', _p_bufu('soot', 'white', 7),
                         _p_bufu('soot', 'gold', 7), _p_metal('soot', 'white'),
                         _p_bufu('charcoal', 'white', 7), _p_metal('iron', 'gold', 'metal.iron'), z_bot_off=0.06))
    add(f'etn_{sex}_censor_gloves', 'Censorate Ink-Black Inspection Gloves', 'gloves',
        full_gloves(f'etn_{sex}_cn_gl', leathery(P('soot', 0.05)), leathery(P('soot', 0.04)),
                    ring_paint=_p_metal('gold', 'soot', 'metal.gold')))
    add(f'etn_{sex}_censor_ledger_case', 'Censorate Bronze-Bound Dossier Case', 'back',
        _dorsal_pack(f'etn_{sex}_cn_bk', P('soot', 0.04, [B('top', 0.0, 0.025, 'solid', 'gold')]),
                     _p_metal('bronze', 'soot'), leathery(P('soot', 0.05)), style='docket'))

    # 10. `clock_auditor` — Anker-Clock Time-Auditor (verdigris copper, 6-moon dial)
    add(f'etn_{sex}_clock_mitre', 'Anker-Clock Copper-Ribbed Deco Biretta', 'head',
        [crown_band(f'etn_{sex}_ck_bd', _p_metal('verdigris', 'bronze', 'metal.bronze.verdigris'), f0=0.58, f1=0.76, ease=0.008),
         tower_hat(f'etn_{sex}_ck_tw', 0.13,
                   lambda s: (1.0 - 0.16 * s) if s < 0.52 else (0.76 - 0.12 * (s - 0.52)),
                   _p_metal('charcoal', 'bronze'), f=0.74, ease=0.012, rows=8, n=12)],
        covers_hair=True, covers_face=False)
    add(f'etn_{sex}_clock_cassock', 'Anker-Clock Charcoal & Verdigris Official Cassock', 'torso',
        _bufu_robe_parts(f'etn_{sex}_ck_rb',
                         P('charcoal', 0.04, [B('bottom', 0.0, 0.050, 'etn_circuit_maze:6', 'white', 'charcoal'),
                                              B('top', 0.0, 0.025, 'solid', 'verdigris')], fabric=WOOL),
                         _p_tracery('etn_alabaster', 'bronze'),
                         _p_metal('verdigris', 'bronze', 'metal.bronze.verdigris'),
                         P('charcoal', 0.04, [B('bottom', 0.0, 0.030, 'solid', 'verdigris')], fabric=WOOL),
                         _p_metal('bronze', 'soot'), z_bot_off=0.07))
    add(f'etn_{sex}_clock_cuffs', 'Anker-Clock Calibrated Vernier Bronze Cuffs', 'gloves',
        full_gloves(f'etn_{sex}_ck_gl', _p_metal('bronze', 'verdigris'), P('charcoal', 0.04, fabric=WOOL)))
    add(f'etn_{sex}_clock_chime_rig', 'Anker-Clock Automaton Escapement & Bell Rig', 'back',
        _dorsal_pack(f'etn_{sex}_ck_bk', _p_metal('verdigris', 'bronze', 'metal.bronze.verdigris'),
                     _p_metal('brass', 'soot'), leathery(P('charcoal', 0.05)), style='chime'))

    # 11. `tube_runner` — Pneumatic-Tube Dispatch Runner (Rank 8-9)
    add(f'etn_{sex}_runner_cap', 'Pneumatic-Tube Deco Visor-Cap', 'head',
        [sculpted_cranium(f'etn_{sex}_tr_cr', P('charcoal', 0.04, [B('bottom', 0.0, 0.035, 'solid', 'celadon')], fabric=WOOL),
                          f_top=1.14, f_bot=0.58, ease=0.019),
         brim(f'etn_{sex}_tr_br', 0.59, 0.048, _p_metal('bronze', 'charcoal'), ease=0.019, droop=0.010)],
        covers_hair=True, covers_face=False)
    add(f'etn_{sex}_runner_tunic', 'Pneumatic-Tube Courier Tunic & Capsule Bandolier', 'torso',
        _coat_or_tunic_parts(f'etn_{sex}_tr_tn',
                             P('charcoal', 0.04, [B('bottom', 0.0, 0.045, 'etn_circuit_maze:2', 'white', 'charcoal'),
                                                  B('top', 0.0, 0.024, 'solid', 'celadon')], fabric=WOOL),
                             P('charcoal', 0.04, [B('bottom', 0.0, 0.025, 'solid', 'celadon')], fabric=WOOL),
                             leathery(P('soot', 0.05, [B('top', 0.0, 0.018, 'solid', 'bronze')])),
                             z_bot=KNEE + 0.08, ease=0.022, flare=0.062, collar_paint=P('celadon', 0.04))
        + [crossed_sash(f'etn_{sex}_tr_band', _p_metal('bronze', 'charcoal'), width=0.058, ease=0.032)])
    add(f'etn_{sex}_runner_gloves', 'Courier Padded Pipe-Valve Gloves', 'gloves',
        full_gloves(f'etn_{sex}_tr_gl', leathery(P('etn_buffbrick', 0.06)), leathery(P('charcoal', 0.05))))
    add(f'etn_{sex}_back_tube_manifold', 'Triple Bronze Pneumatic Dispatch Manifold', 'back',
        _dorsal_pack(f'etn_{sex}_tr_bk', _p_metal('bronze', 'soot'), P('celadon', 0.03),
                     leathery(P('charcoal', 0.05)), style='tubes'))
    add(f'etn_{sex}_runner_breeches', 'Courier Charcoal & Celadon-Puttee Breeches', 'legs',
        trousers(f'etn_{sex}_tr_lg', P('charcoal', 0.04, [B('bottom', 0.0, 0.075, 'solid', 'celadon')], fabric=WOOL),
                 ease=0.014, bag=0.008), legged=True)
    add(f'etn_{sex}_runner_boots', 'Courier Canal-Stair Boots', 'feet',
        boots(f'etn_{sex}_tr_ft', P('soot', 0.08), leathery(P('charcoal', 0.05, [B('top', 0.0, 0.025, 'solid', 'celadon')])),
              top=0.42, ease_top=0.013))

    # 12. `prefect` — Examined Circuit Prefect (charcoal/deepsea/celadon/gold maze:5 — ZERO madder red!)
    add(f'etn_{sex}_prefect_cap', 'Examined Circuit Prefect Guan Topknot Crown', 'head',
        _stepped_pier_crown(f'etn_{sex}_pf_cr', 3, P('soot', 0.04, [B('top', 0.0, 0.020, 'solid', 'gold')], fabric='cloth.silk'),
                            _p_metal('gold', 'soot', 'metal.gold'), ease=0.004, f0=0.60, f1=0.76, pier_h=0.080),
        covers_hair=False, covers_face=False)
    add(f'etn_{sex}_prefect_robe', 'Circuit Prefect Charcoal & Deepsea Maze:5 Robe', 'torso',
        _bufu_robe_parts(f'etn_{sex}_pf_rb',
                         P('charcoal', 0.04, [B('bottom', 0.0, 0.055, 'etn_circuit_maze:5', 'gold', 'deepsea'),
                                              B('top', 0.0, 0.028, 'solid', 'celadon')],
                           [PN(0.0, 1.0, 'eternian_icons', 'celadon', 'charcoal', 0.16)], fabric='cloth.silk'),
                         _p_bufu('deepsea', 'gold', 5),
                         P('deepsea', 0.04, [B('bottom', 0.0, 0.025, 'solid', 'gold')], fabric='cloth.silk'),
                         P('deepsea', 0.04, [B('bottom', 0.0, 0.035, 'solid', 'gold')], fabric='cloth.silk'),
                         _p_metal('gold', 'deepsea', 'metal.gold'), z_bot_off=0.06)
        + [neck_ring(f'etn_{sex}_pf_torus', P('teal', 0.04, [B('top', 0.0, 0.025, 'solid', 'gold')], fabric='cloth.silk'),
                     r_tube=0.030, drop=0.018)])
    add(f'etn_{sex}_prefect_cuffs', 'Circuit Prefect Teal & Gold Cuffs', 'gloves',
        full_gloves(f'etn_{sex}_pf_gl', P('deepsea', 0.04, [B('top', 0.0, 0.022, 'solid', 'gold')], fabric='cloth.silk'),
                    P('charcoal', 0.04, fabric='cloth.silk')))

    # 13. `archivist` — Block-Print & Census Grand Archivist (100% repred purged -> soot/cream/celadon/gold)
    a_ar, b_ar, up_ar, bk_ar, lf_ar = head_frame()
    c_top_ar = b_ar + up_ar * 0.032
    add(f'etn_{sex}_archivist_hat', 'Grand Archivist Soot Mortarboard & Porcelain Mask', 'head',
        [sculpted_cranium(f'etn_{sex}_ar_cr', P('soot', 0.04, fabric='cloth.silk'), f_top=1.12, f_bot=0.02, ease=0.018),
         blob(f'etn_{sex}_ar_mb', c_top_ar, [0.165, 0.165, 0.018],
              _p_bufu('soot', 'gold', 4), n=8, rows=4, rigid_joint='Head')]
        + _closed_eye_mask(f'etn_{sex}_ar_mk', P('porcelain', 0.02, [], [PN(0.0, 1.0, 'eternian_icons', 'soot', 'porcelain', 0.14)]),
                           _p_metal('gold', 'soot', 'metal.gold'), ease=0.013),
        covers_hair=True, covers_face=True)
    add(f'etn_{sex}_archivist_robe', 'Grand Archivist Soot & Mulberry-Paper Court Robe', 'torso',
        _bufu_robe_parts(f'etn_{sex}_ar_rb',
                         P('soot', 0.04, [B('bottom', 0.0, 0.060, 'etn_circuit_maze:4', 'gold', 'soot')],
                           [PN(0.0, 1.0, 'eternian_icons', 'cream', 'soot', 0.16)], fabric='cloth.silk'),
                         _p_bufu('soot', 'gold', 4),
                         P('cream', 0.04, [B('bottom', 0.0, 0.025, 'solid', 'celadon')], fabric=COTTON),
                         P('cream', 0.04, [B('bottom', 0.0, 0.035, 'solid', 'soot')], fabric=COTTON),
                         P('celadon', 0.04, [B('top', 0.0, 0.020, 'solid', 'gold')], fabric='cloth.silk'), z_bot_off=0.05))
    add(f'etn_{sex}_archivist_cuffs', 'Grand Archivist Charcoal Linen Cuffs', 'gloves',
        full_gloves(f'etn_{sex}_ar_gl', P('charcoal', 0.05, fabric=COTTON), P('cream', 0.05, fabric=COTTON)))
    add(f'etn_{sex}_archivist_docket_rack', 'Archivist Camphorwood Census Ledger Rack', 'back',
        _dorsal_pack(f'etn_{sex}_ar_bk', P('cream', 0.05, [], [PN(0.0, 1.0, 'eternian_icons', 'soot', 'cream', 0.14)], fabric=COTTON),
                     _p_metal('bronze', 'soot'), leathery(P('soot', 0.05)), style='docket'))

    # =======================================================================================================
    # PILLAR III — MILITARY, VALLEY QUARANTINE & FRONTIER ARMIES (5 TIERS)
    # =======================================================================================================

    # 14. `warden` — Sanctum Porcelain-and-Bronze Cuirassier (9-fin Deco fan-mitre, celadon crackle)
    add(f'etn_{sex}_head_porcelain_fan_helm', 'Sanctum 9-Fin Celadon Porcelain Fan-Helm', 'head',
        [sculpted_cranium(f'etn_{sex}_wd_cr', _p_celadon_porcelain('celadon', 'bronze'), f_top=1.02, f_bot=0.02, ease=0.013),
         fan(f'etn_{sex}_wd_fan', 0.085, 0.215, 2.25, _p_celadon_porcelain('celadon', 'gold'),
             rows=7, cols=15, tilt=0.14, back=0.02, curl=0.02, stiff=0.85, rigid_joint='Head')]
        + _closed_eye_mask(f'etn_{sex}_wd_mk', P('porcelain', 0.02, fabric='cloth.plain'),
                           _p_metal('bronze', 'soot'), ease=0.013),
        covers_hair=True, covers_face=True)
    add(f'etn_{sex}_warden_cuirass', 'Sanctum Celadon-Crackle Porcelain & Bronze Cuirass', 'torso',
        _armored_cuirass_parts(f'etn_{sex}_wd_tr', _p_celadon_porcelain('celadon', 'bronze'),
                               P('charcoal', 0.04, [B('bottom', 0.0, 0.035, 'solid', 'celadon')], fabric=WOOL),
                               _p_celadon_porcelain('celadon', 'bronze'),
                               _p_celadon_porcelain('porcelain', 'bronze'),
                               _p_metal('bronze', 'gold'),
                               style='gothic', lames=3, haute_piece=True, faulds=3))
    add(f'etn_{sex}_warden_gauntlets', 'Sanctum Bronze & Porcelain Plate Gauntlets', 'gloves',
        full_gloves(f'etn_{sex}_wd_gl', _p_celadon_porcelain('celadon', 'bronze'), _p_metal('bronze', 'soot'))
        + sculpted_vambraces(f'etn_{sex}_wd_vm', _p_celadon_porcelain('celadon', 'bronze'),
                             trim_paint=_p_metal('bronze', 'gold'), couter=True, ease=0.016))
    add(f'etn_{sex}_warden_greaves', 'Sanctum Celadon-Crackle Porcelain Greaves', 'feet',
        boots(f'etn_{sex}_wd_ft', P('soot', 0.06), _p_celadon_porcelain('celadon', 'bronze'),
              top=0.36, ease_top=0.010, cuff_paint=_p_metal('bronze', 'gold'))
        + sculpted_greaves(f'etn_{sex}_wd_gr', _p_celadon_porcelain('celadon', 'bronze'),
                           trim_paint=_p_metal('bronze', 'gold'), poleyn=True, ease=0.016))

    # 15. `valley_warden` — Valley-Cordon Anti-Taint Warden (alabaster lancet hazard plate)
    add(f'etn_{sex}_head_valley_lancet_helm', 'Valley-Cordon Alabaster-Lancet Hazard Helm', 'head',
        [sculpted_cranium(f'etn_{sex}_vw_cr', _p_metal('bronze', 'slate'), f_top=1.04, f_bot=-0.04, ease=0.015),
         sculpted_faceplate(f'etn_{sex}_vw_fc', _p_tracery('etn_alabaster', 'bronze'),
                            f_top=0.76, f_bot=-0.06, ease=0.014, span=0.48, rows=14, cols=23)],
        covers_hair=True, covers_face=True)
    add(f'etn_{sex}_valley_cuirass', 'Valley-Cordon Lead-Canvas & Alabaster Containment Cuirass', 'torso',
        _armored_cuirass_parts(f'etn_{sex}_vw_tr', _p_tracery('etn_alabaster', 'bronze'),
                               P('slate', 0.05, [B('bottom', 0.0, 0.030, 'solid', 'bronze')], fabric='cloth.lead.oiled'),
                               P('slate', 0.05, [B('bottom', 0.0, 0.045, 'solid', 'bronze')], fabric='cloth.lead.oiled'),
                               _p_metal('bronze', 'verdigris'),
                               _p_metal('iron', 'bronze', 'metal.iron'),
                               style='laminar', lames=3, haute_piece=True, faulds=3))
    add(f'etn_{sex}_valley_gauntlets', 'Valley-Cordon Lead-Lined Bronze Gauntlets', 'gloves',
        full_gloves(f'etn_{sex}_vw_gl', _p_metal('bronze', 'slate'), P('slate', 0.05, fabric='cloth.lead.oiled'))
        + sculpted_vambraces(f'etn_{sex}_vw_vm', _p_metal('bronze', 'slate'),
                             trim_paint=_p_metal('iron', 'bronze', 'metal.iron'), couter=True, ease=0.016))
    add(f'etn_{sex}_valley_assay_pack', 'Valley-Cordon Taint Assay & Lead Strongbox', 'back',
        _dorsal_pack(f'etn_{sex}_vw_bk', P('slate', 0.04, [B('top', 0.0, 0.030, 'solid', 'bronze')], fabric='cloth.lead.oiled'),
                     _p_metal('verdigris', 'bronze', 'metal.bronze'),
                     leathery(P('soot', 0.05)), style='docket'))
    add(f'etn_{sex}_valley_trousers', 'Valley-Cordon Oiled Lead-Canvas Trousers', 'legs',
        trousers(f'etn_{sex}_vw_lg', P('slate', 0.05, [B('bottom', 0.0, 0.040, 'solid', 'bronze')], fabric='cloth.lead.oiled'),
                 ease=0.014, bag=0.008), legged=True)
    add(f'etn_{sex}_valley_boots', 'Valley-Cordon Bronze-Shod Mountain Boots', 'feet',
        boots(f'etn_{sex}_vw_ft', _p_metal('bronze', 'soot'), leathery(P('slate', 0.05, [B('top', 0.0, 0.030, 'solid', 'bronze')])),
              top=0.36, ease_top=0.010)
        + sculpted_greaves(f'etn_{sex}_vw_gr', _p_metal('bronze', 'soot'),
                           trim_paint=_p_metal('iron', 'bronze', 'metal.iron'), poleyn=True, ease=0.016))

    # 16. `hayrant_soldier` — Outer-Wall Hayrant Yeti-Watch Soldier (quilted white + silver + Ainu fret)
    add(f'etn_{sex}_hayrant_helm', 'Hayrant Hexagonal-Cone Silver Mountain Sallet', 'head',
        [sculpted_cranium(f'etn_{sex}_hs_cr', _p_metal('silver', 'soot', 'metal.iron'), f_top=1.12, f_bot=0.57, ease=0.018),
         conical_hat(f'etn_{sex}_hs_cn', _p_metal('silver', 'slateblue', 'metal.iron'),
                     f_base=0.59, f_top=1.20, r_base=0.148, r_top=0.018, rows=8, n=12)],
        covers_hair=True, covers_face=False)
    add(f'etn_{sex}_hayrant_brigandine', 'Hayrant Quilted White & Silver Yeti-Watch Brigandine', 'torso',
        _coat_or_tunic_parts(f'etn_{sex}_hs_bg', _p_hayrant_quilt('white', 'silver', 'soot'),
                             _p_hayrant_quilt('white', 'white', 'slateblue'),
                             P('slateblue', 0.04, [B('top', 0.0, 0.025, 'etn_hayrant_ainu_fret', 'white', 'soot')], fabric=WOOL),
                             z_bot=KNEE + 0.04, ease=0.026, flare=0.065,
                             collar_paint=_p_metal('silver', 'soot', 'metal.iron')))
    add(f'etn_{sex}_hayrant_mitts', 'Hayrant Silver-Splinted Fleece Mitts', 'gloves',
        full_gloves(f'etn_{sex}_hs_gl', _p_metal('silver', 'slateblue', 'metal.iron'), P('white', 0.05, fabric='fur.wolf')))
    add(f'etn_{sex}_hayrant_quiver_pack', 'Hayrant Repeating-Bolt Quiver & Snowshoes', 'back',
        _dorsal_pack(f'etn_{sex}_hs_bk', P('soot', 0.04, [B('top', 0.0, 0.040, 'etn_hayrant_ainu_fret', 'silver', 'soot')]),
                     P('oat', 0.05, fabric=COTTON), leathery(P('soot', 0.05)), style='quiver'))
    add(f'etn_{sex}_hayrant_trousers', 'Hayrant Quilted White & Slate-Indigo Trousers', 'legs',
        trousers(f'etn_{sex}_hs_lg', P('white', 0.04, [B('bottom', 0.0, 0.055, 'etn_hayrant_ainu_fret', 'white', 'slateblue')],
                                       fabric='cloth.quilted.diamond'),
                 ease=0.014, bag=0.008), legged=True)
    add(f'etn_{sex}_hayrant_boots', 'Hayrant Silver-Cramponed Alpine Boots', 'feet',
        boots(f'etn_{sex}_hs_ft', _p_metal('silver', 'soot', 'metal.iron'),
              P('white', 0.05, [B('top', 0.0, 0.030, 'etn_hayrant_ainu_fret', 'white', 'soot')], fabric='cloth.felt.boiled'),
              top=0.56, ease_top=0.015))

    # 17. `farport_guard` — Farport Factory-Quarter Customs Guard (oiled kelp + steel/verdigris morion)
    fg_bowl = sculpted_cranium(f'etn_{sex}_fg_cr', _p_metal('steel', 'verdigris', 'metal.steel'),
                               f_top=1.14, f_bot=0.58, ease=0.019)
    fg_brim = brim(f'etn_{sex}_fg_br', 0.59, 0.068, _p_metal('steel', 'gold', 'metal.steel'),
                   ease=0.019, lift=0.016, droop=0.0)
    # Upturned crescent morion boat-brim sweep (rises cleanly at front & back, dips slightly at sides)
    _, _, fg_up, _, _ = head_frame()
    _br_rows, _br_n = fg_brim.P.shape[:2]
    _br_angs = np.linspace(0.0, 2.0 * math.pi, _br_n, endpoint=False)
    for _rk in range(_br_rows):
        _s = _rk / float(max(_br_rows - 1, 1))
        for _rj, _an in enumerate(_br_angs):
            _sweep = (0.026 * (math.cos(_an) ** 2) - 0.006 * (math.sin(_an) ** 2)) * (_s ** 1.35)
            fg_brim.P[_rk, _rj] += fg_up * _sweep
    fg_crest = crest(f'etn_{sex}_fg_cs', 0.068, _p_metal('bronze', 'steel', 'metal.bronze'),
                     a0=-0.82, a1=1.40, base_ease=0.019, host_part=fg_bowl)
    add(f'etn_{sex}_farport_morion', 'Farport Wide-Guttered Verdigris Morion', 'head',
        [fg_bowl, fg_brim, fg_crest],
        covers_hair=True, covers_face=False)
    add(f'etn_{sex}_farport_brigandine', 'Farport Oiled Kelp-Leather Customs Brigandine', 'torso',
        _coat_or_tunic_parts(f'etn_{sex}_fg_bg', _p_kelp_leather('etn_kelp', 'verdigris'),
                             _p_kelp_leather('etn_kelp', 'celadon'),
                             P('celadon', 0.04, [B('top', 0.0, 0.022, 'solid', 'silver')], fabric='cloth.silk'),
                             z_bot=KNEE + 0.06, ease=0.024, flare=0.062,
                             collar_paint=_p_metal('verdigris', 'soot', 'metal.bronze.verdigris'),
                             tabard_paint=_p_ancestors('gold', 'soot'), tabard_back=False))
    add(f'etn_{sex}_farport_bracers', 'Farport Verdigris-Bronze & Kelp Vambraces', 'gloves',
        full_gloves(f'etn_{sex}_fg_gl', _p_metal('verdigris', 'soot', 'metal.bronze'), _p_kelp_leather('etn_kelp', 'bronze'))
        + sculpted_vambraces(f'etn_{sex}_fg_vm', _p_metal('verdigris', 'soot', 'metal.bronze'),
                             trim_paint=_p_metal('bronze', 'soot'), couter=False, ease=0.015))
    add(f'etn_{sex}_farport_lantern_pack', 'Farport Shuttered Harbour Storm-Lantern Pack', 'back',
        _dorsal_pack(f'etn_{sex}_fg_bk', _p_kelp_leather('etn_kelp', 'etn_corallime'),
                     _p_metal('verdigris', 'bronze', 'metal.bronze.verdigris'),
                     _p_kelp_leather('etn_kelp', 'bronze'), style='lantern'))
    add(f'etn_{sex}_farport_breeches', 'Farport Waxed Charcoal Rain-Breeches', 'legs',
        trousers(f'etn_{sex}_fg_lg', _p_kelp_leather('charcoal', 'etn_kelp'), ease=0.014, bag=0.008), legged=True)
    add(f'etn_{sex}_farport_boots', 'Farport Oiled Kelp-Leather Cliff-Quay Boots', 'feet',
        boots(f'etn_{sex}_fg_ft', P('soot', 0.08), _p_kelp_leather('etn_kelp', 'verdigris'), top=0.60, ease_top=0.015))

    # 18. `canal_gendarme` — Canal-Town Lock & Highway Gendarme
    add(f'etn_{sex}_gendarme_cabasset', 'Canal Gendarme Fluted Bronze Cabasset', 'head',
        [sculpted_cranium(f'etn_{sex}_cg_cr', _p_metal('bronze', 'charcoal'), f_top=1.14, f_bot=0.58, ease=0.019),
         brim(f'etn_{sex}_cg_br', 0.59, 0.048, _p_metal('charcoal', 'bronze'), ease=0.019, droop=0.014)],
        covers_hair=True, covers_face=False)
    add(f'etn_{sex}_gendarme_coat', 'Canal Gendarme Buffbrick & Charcoal Brigandine Coat', 'torso',
        _coat_or_tunic_parts(f'etn_{sex}_cg_ct',
                             P('charcoal', 0.04, [B('bottom', 0.0, 0.050, 'etn_pattern_block', 'etn_buffbrick', 'charcoal')],
                               [PN(0.0, 1.0, 'diamond_quilt', 'bronze', 'charcoal', 0.14)], fabric='cloth.quilted.diamond'),
                             P('etn_buffbrick', 0.05, [B('bottom', 0.0, 0.030, 'solid', 'charcoal')], fabric=WOOL),
                             leathery(P('soot', 0.05, [B('top', 0.0, 0.018, 'solid', 'bronze')])),
                             z_bot=KNEE + 0.08, ease=0.024, flare=0.062,
                             collar_paint=_p_metal('bronze', 'charcoal'),
                             tabard_paint=P('etn_etgreen', 0.04, [B('bottom', 0.0, 0.035, 'solid', 'gold')], fabric=WOOL)))
    add(f'etn_{sex}_gendarme_vambraces', 'Canal Gendarme Buff-Leather & Bronze Vambraces', 'gloves',
        full_gloves(f'etn_{sex}_cg_gl', _p_metal('bronze', 'etn_buffbrick'), leathery(P('etn_buffbrick', 0.06)))
        + sculpted_vambraces(f'etn_{sex}_cg_vm', _p_metal('bronze', 'etn_buffbrick'),
                             trim_paint=_p_metal('bronze', 'soot'), couter=False, ease=0.015))
    add(f'etn_{sex}_gendarme_pavise_rig', 'Canal Gendarme Watch-Lantern & Docket Rig', 'back',
        _dorsal_pack(f'etn_{sex}_cg_bk', leathery(P('charcoal', 0.05)),
                     _p_metal('bronze', 'etn_etgreen'), leathery(P('etn_buffbrick', 0.06)), style='lantern'))
    add(f'etn_{sex}_gendarme_boots', 'Canal Gendarme Hobnailed Towpath Boots', 'feet',
        boots(f'etn_{sex}_cg_ft', P('soot', 0.08), leathery(P('charcoal', 0.05, [B('top', 0.0, 0.035, 'solid', 'celadon')])),
              top=0.52, ease_top=0.014))

    # =======================================================================================================
    # PILLAR IV — REGIONAL COMMONS, KILN GUILDS & FARSIDE COAST (7 TIERS)
    # =======================================================================================================

    # 19. `canal_citizen` — Canal-Town Bargeman & Lowland Citizen (base crowd 30%)
    add(f'etn_{sex}_canal_hat', 'Canal-Town Hexagonal Woven-Reed Hat', 'head',
        [conical_hat(f'etn_{sex}_cc_ht', P('etn_buffbrick', 0.05, [B('bottom', 0.0, 0.045, 'solid', 'celadon')],
                                           fabric='straw.reed.plaited'),
                     f_base=0.60, f_top=1.16, r_base=0.24, r_top=0.016, rows=8, n=12)],
        covers_hair=True, covers_face=False)
    add(f'etn_{sex}_canal_tunic', 'Canal-Town Sunboll-Cotton & Pattern-Block Tunic', 'torso',
        _coat_or_tunic_parts(f'etn_{sex}_cc_tn', _p_pattern_block('cotton', 'etn_buffbrick', 'celadon'),
                             P('cotton', 0.05, [B('bottom', 0.0, 0.025, 'solid', 'etn_buffbrick')], fabric=COTTON),
                             P('celadon', 0.04, [B('top', 0.0, 0.018, 'solid', 'terracotta')], fabric=COTTON),
                             z_bot=CROTCH - 0.03, ease=0.020, flare=0.058, collar_paint=P('etn_buffbrick', 0.05, fabric=COTTON)))
    add(f'etn_{sex}_canal_creel', 'Canal-Town Woven Reed Towpath Creel', 'back',
        _dorsal_pack(f'etn_{sex}_cc_bk', P('etn_buffbrick', 0.05, fabric='straw.reed.plaited'),
                     P('oat', 0.05, fabric=COTTON), P('celadon', 0.05, fabric=COTTON), style='creel'))
    add(f'etn_{sex}_canal_trousers', 'Canal-Town Slate-Blue Barge Trousers', 'legs',
        trousers(f'etn_{sex}_cc_lg', P('etn_shutter', 0.05, [B('bottom', 0.0, 0.030, 'solid', 'cotton')], fabric=COTTON),
                 ease=0.014, bag=0.008), legged=True)
    add(f'etn_{sex}_canal_sandals', 'Canal-Town Plaited-Reed Quay Sandals', 'feet',
        sandal(f'etn_{sex}_cc_ft', P('etn_buffbrick', 0.06, fabric='straw.reed.plaited'),
               leathery(P('umber', 0.06)), laces=2))

    # 20. `kiln_master` — Celadon & Porcelain Kiln-Master (`Lux`)
    add(f'etn_{sex}_kiln_cap', 'Lux Kaolin-Linen Kiln Cap & Heat Visor', 'head',
        [sculpted_cranium(f'etn_{sex}_km_cr', P('porcelain', 0.04, [B('bottom', 0.0, 0.035, 'solid', 'celadon')], fabric=COTTON),
                          f_top=1.14, f_bot=0.58, ease=0.019),
         brim(f'etn_{sex}_km_br', 0.59, 0.046, P('etn_alabaster', 0.04), ease=0.019, droop=0.012)],
        covers_hair=True, covers_face=False)
    add(f'etn_{sex}_kiln_apron', 'Lux Kiln-Master Linen Shan & Muffle Apron', 'torso',
        _coat_or_tunic_parts(f'etn_{sex}_km_ap', P('porcelain', 0.05, [B('bottom', 0.0, 0.035, 'solid', 'celadon')], fabric=COTTON),
                             P('porcelain', 0.05, fabric=COTTON),
                             leathery(P('umber', 0.06)),
                             z_bot=KNEE + 0.06, ease=0.022, flare=0.060,
                             apron_paint=leathery(P('etn_buffbrick', 0.06, [B('bottom', 0.0, 0.040, 'etn_celadon_crackle', 'bronze', 'celadon')]))))
    add(f'etn_{sex}_kiln_mitts', 'Kiln-Master Quilted Clay-Leather Mitts', 'gloves',
        full_gloves(f'etn_{sex}_km_gl', leathery(P('etn_buffbrick', 0.06)), P('ash', 0.05, fabric='cloth.quilted.diamond')))
    add(f'etn_{sex}_kiln_jar_frame', 'Kiln-Master Celadon Crackle Vase Frame', 'back',
        _dorsal_pack(f'etn_{sex}_km_bk', _p_celadon_porcelain('celadon', 'porcelain'),
                     P('bamboo', 0.05, fabric='straw.reed.plaited'), leathery(P('etn_buffbrick', 0.06)), style='jars'))
    add(f'etn_{sex}_common_shoes', 'Kiln-Master Wooden-Soled Ash Clogs', 'feet',
        boots(f'etn_{sex}_km_ft', P('umber', 0.08), leathery(P('charcoal', 0.06)), top=0.34, ease_top=0.012))

    # 21. `wine_lacquer_factor` — Tone Champagne Cellarman & Urushi Lacquer-Master
    add(f'etn_{sex}_factor_hat', 'Tone Six-Sided Charcoal & Celadon Merchant Cap', 'head',
        [sculpted_cranium(f'etn_{sex}_wl_cr', P('charcoal', 0.04, [B('bottom', 0.0, 0.038, 'solid', 'celadon')], fabric='cloth.silk'),
                          f_top=1.15, f_bot=0.58, ease=0.019),
         crown_band(f'etn_{sex}_wl_bd', P('celadon', 0.04, [B('top', 0.0, 0.018, 'solid', 'gold')], fabric='cloth.silk'),
                    f0=0.58, f1=0.69, ease=0.021)],
        covers_hair=True, covers_face=False)
    add(f'etn_{sex}_factor_coat', 'Tone Pine-Green & Urushi Lacquer Factor Surcoat', 'torso',
        _coat_or_tunic_parts(f'etn_{sex}_wl_ct',
                             P('pine', 0.04, [B('bottom', 0.0, 0.050, 'etn_circuit_maze:1', 'celadon', 'pine')], fabric='cloth.silk'),
                             P('pine', 0.04, [B('bottom', 0.0, 0.035, 'solid', 'celadon')], fabric='cloth.silk'),
                             leathery(P('etn_urushi', 0.04, [B('top', 0.0, 0.018, 'solid', 'gold')])),
                             z_bot=KNEE + 0.04, ease=0.022, flare=0.062,
                             collar_paint=P('celadon', 0.04, fabric='cloth.silk'),
                             apron_paint=leathery(P('etn_urushi', 0.04))))
    add(f'etn_{sex}_factor_gloves', 'Urushi Protective Oiled-Silk Gloves', 'gloves',
        full_gloves(f'etn_{sex}_wl_gl', P('etn_urushi', 0.04, fabric='cloth.silk'), P('charcoal', 0.04, fabric='cloth.silk')))
    add(f'etn_{sex}_factor_case', 'Tone Glossy Urushi Lacquered Sample Chest', 'back',
        _dorsal_pack(f'etn_{sex}_wl_bk', P('etn_urushi', 0.03, [B('top', 0.0, 0.025, 'solid', 'gold')]),
                     P('celadon', 0.03), leathery(P('charcoal', 0.05)), style='docket'))

    # 22. `glazier_mason` — Alabaster & Bronze-Tracery Master Glazier (`Corpus`)
    add(f'etn_{sex}_glazier_cap', 'Corpus Hexagonal Glazier Cap & Amber Loupes', 'head',
        [sculpted_cranium(f'etn_{sex}_gm_cr', P('charcoal', 0.04, [B('bottom', 0.0, 0.035, 'solid', 'bronze')], fabric=WOOL),
                          f_top=1.14, f_bot=0.58, ease=0.019),
         brim(f'etn_{sex}_gm_br', 0.59, 0.042, _p_metal('bronze', 'charcoal'), ease=0.019, droop=0.008)],
        covers_hair=True, covers_face=False)
    add(f'etn_{sex}_glazier_jerkin', 'Corpus Buffbrick & Bronze-Tracery Glazier Coat', 'torso',
        _coat_or_tunic_parts(f'etn_{sex}_gm_jk',
                             P('etn_buffbrick', 0.05, [B('bottom', 0.0, 0.045, 'etn_pattern_block', 'charcoal', 'etn_buffbrick')], fabric=WOOL),
                             P('charcoal', 0.05, [B('bottom', 0.0, 0.028, 'solid', 'bronze')], fabric=WOOL),
                             leathery(P('umber', 0.06, [B('top', 0.0, 0.018, 'solid', 'bronze')])),
                             z_bot=CROTCH - 0.04, ease=0.022, flare=0.058,
                             collar_paint=P('charcoal', 0.05, fabric=WOOL),
                             apron_paint=_p_tracery('etn_alabaster', 'bronze')))
    add(f'etn_{sex}_glazier_cuffs', 'Glazier Cut-Resistant Suede Wrist-Cuffs', 'gloves',
        full_gloves(f'etn_{sex}_gm_gl', leathery(P('etn_buffbrick', 0.06)), leathery(P('charcoal', 0.05))))
    add(f'etn_{sex}_glazier_pane_rack', 'Glazier Veined Alabaster & Bronze Lancet Pane Rack', 'back',
        _dorsal_pack(f'etn_{sex}_gm_bk', _p_tracery('etn_alabaster', 'bronze'),
                     P('umber', 0.06), leathery(P('charcoal', 0.05)), style='pane'))

    # 23. `farside_kelper` — Farside Kelp-Forester & Lung-Octopus Fisher (oiled kelp + coral-lime + raw wineweed cord)
    add(f'etn_{sex}_kelper_hood', 'Farside Oiled Land-Kelp Souwester Hood', 'head',
        [hood(f'etn_{sex}_fk_hd', _p_kelp_leather('etn_kelp', 'etn_corallime'), ease=0.028, ease_low=0.042, open_front=0.95),
         brim(f'etn_{sex}_fk_br', 0.59, 0.062, _p_kelp_leather('etn_kelp', 'etn_corallime'), ease=0.024, droop=0.024)],
        covers_hair=True, covers_face=False)
    add(f'etn_{sex}_kelper_cape_vest', 'Farside Kelp-Goat Fleece & Oiled Kelp Rain-Cape', 'torso',
        _coat_or_tunic_parts(f'etn_{sex}_fk_vs',
                             P('etn_kelpgoat', 0.06, [B('bottom', 0.0, 0.035, 'solid', 'etn_corallime')], fabric='fur.wolf'),
                             _p_kelp_leather('etn_kelp', 'etn_corallime'),
                             P('etn_wineweed', 0.05, [B('top', 0.0, 0.018, 'solid', 'etn_corallime')], fabric=COTTON),
                             z_bot=CROTCH - 0.04, ease=0.024, flare=0.060)
        + [cape(f'etn_{sex}_fk_cp', WAIST - 0.12, _p_kelp_leather('etn_kelp', 'etn_corallime'),
                z_top=NECK + 0.01, span=0.58, ease=0.034, flare=0.09, rows=12, n=24)])
    add(f'etn_{sex}_kelper_wraps', 'Farside Tarred Eelgrass & Goat-Hide Wraps', 'gloves',
        full_gloves(f'etn_{sex}_fk_gl', _p_kelp_leather('etn_kelp', 'etn_corallime'), P('etn_kelpgoat', 0.06, fabric='fur.wolf')))
    add(f'etn_{sex}_kelper_creel', 'Farside Coral-Lime Kelp-Stipe Creel', 'back',
        _dorsal_pack(f'etn_{sex}_fk_bk', P('etn_corallime', 0.05, fabric='straw.reed.plaited'),
                     _p_kelp_leather('etn_kelp', 'etn_corallime'),
                     P('etn_wineweed', 0.05, fabric=COTTON), style='creel'))
    add(f'etn_{sex}_kelper_waders', 'Farside Oiled Kelp-Leather Surf Waders', 'legs',
        trousers(f'etn_{sex}_fk_lg', _p_kelp_leather('etn_kelp', 'etn_corallime'), ease=0.014, bag=0.008), legged=True)
    add(f'etn_{sex}_kelper_boots', 'Farside Coral-Lime & Rawhide Strand Boots', 'feet',
        boots(f'etn_{sex}_fk_ft', P('etn_corallime', 0.06), _p_kelp_leather('etn_kelp', 'etn_corallime'), top=0.56, ease_top=0.015))

    # 24. `hayrant_highlander` — Hayrant Outer-Wall Alpine Highlander (Ainu attus & matampus, zero red!)
    add(f'etn_{sex}_hayrant_matampus', 'Hayrant Woven Matampus Brow-Band', 'head',
        [crown_band(f'etn_{sex}_hh_bd', P('soot', 0.04, [B('top', 0.0, 0.080, 'etn_hayrant_ainu_fret', 'silver', 'soot')],
                                          fabric=WOOL), f0=0.58, f1=0.71, ease=0.004, flare=0.003, rows=5, n=36)],
        covers_hair=False, covers_face=False)
    add(f'etn_{sex}_hayrant_attus', 'Hayrant Bark-Cloth & Wool Attus Mountain Coat', 'torso',
        _coat_or_tunic_parts(f'etn_{sex}_hh_at',
                             P('oat', 0.05, [B('bottom', 0.0, 0.075, 'etn_hayrant_ainu_fret', 'white', 'soot'),
                                             B('top', 0.0, 0.040, 'etn_hayrant_ainu_fret', 'white', 'slateblue')],
                               fabric='cloth.bark.tapa'),
                             P('oat', 0.05, [B('bottom', 0.0, 0.045, 'etn_hayrant_ainu_fret', 'white', 'soot')], fabric='cloth.bark.tapa'),
                             P('slateblue', 0.04, [B('top', 0.0, 0.020, 'solid', 'silver')], fabric=WOOL),
                             z_bot=KNEE - 0.02, ease=0.024, flare=0.065,
                             collar_paint=P('white', 0.05, fabric='fur.wolf')))
    add(f'etn_{sex}_hayrant_cuffs', 'Hayrant Embroidered Bark-Cloth Bracers', 'gloves',
        full_gloves(f'etn_{sex}_hh_gl', P('slateblue', 0.04, [B('top', 0.0, 0.040, 'etn_hayrant_ainu_fret', 'white', 'soot')],
                                          fabric='cloth.bark.tapa'), P('oat', 0.05, fabric='cloth.bark.tapa')))
    add(f'etn_{sex}_hayrant_hod', 'Hayrant Larch-Frame Saltpeter Pannier', 'back',
        _dorsal_pack(f'etn_{sex}_hh_bk', P('oat', 0.05, fabric='cloth.bark.tapa'),
                     P('white', 0.05, fabric=WOOL), P('slateblue', 0.05, fabric=WOOL), style='creel'))
    add(f'etn_{sex}_hayrant_leggings', 'Hayrant Hos Indigo & White Mountain Leggings', 'legs',
        trousers(f'etn_{sex}_hh_lg', P('slateblue', 0.05, [B('bottom', 0.0, 0.060, 'etn_hayrant_ainu_fret', 'white', 'soot')],
                                       fabric=WOOL), ease=0.014, bag=0.008), legged=True)
    add(f'etn_{sex}_hayrant_shoes', 'Hayrant Birch-Tarred Rawhide Alpine Boots', 'feet',
        boots(f'etn_{sex}_hh_ft', _p_metal('silver', 'soot', 'metal.iron'),
              leathery(P('umber', 0.06, [B('top', 0.0, 0.030, 'solid', 'white')])), top=0.50, ease_top=0.014))

    # 25. `matok_broker` — Matok Dam-Basin & Portage Toll-Broker (zero Jimjam red!)
    add(f'etn_{sex}_matok_turban_cap', 'Matok Dust-Wrapped Silt-Linen Toll-Cap', 'head',
        turban(f'etn_{sex}_mb_tb', P('charcoal', 0.04, fabric=WOOL),
               wrap_paint=P('etn_silt', 0.05, [B('bottom', 0.0, 0.025, 'solid', 'celadon')], fabric=COTTON),
               jewel_paint=_p_metal('brass', 'soot'), size=0.88, f0=0.58, f1=1.02, bulge=0.034, ease=0.014),
        covers_hair=True, covers_face=False)
    add(f'etn_{sex}_matok_coat', 'Matok Silt-Buff & Charcoal Portage Duster', 'torso',
        _coat_or_tunic_parts(f'etn_{sex}_mb_ct',
                             P('etn_silt', 0.05, [B('bottom', 0.0, 0.050, 'eternian_icons', 'charcoal', 'etn_silt')],
                               fabric='cloth.quilted.diamond'),
                             P('etn_silt', 0.05, [B('bottom', 0.0, 0.030, 'solid', 'celadon')], fabric=COTTON),
                             leathery(P('charcoal', 0.05, [B('top', 0.0, 0.020, 'solid', 'brass')])),
                             z_bot=KNEE + 0.02, ease=0.024, flare=0.065,
                             collar_paint=P('celadon', 0.04, fabric=COTTON))
        + [crossed_sash(f'etn_{sex}_mb_abacus', _p_metal('brass', 'charcoal'), width=0.048, ease=0.032)])
    add(f'etn_{sex}_matok_gloves', 'Matok Dust-Tan Teamster Gauntlets', 'gloves',
        full_gloves(f'etn_{sex}_mb_gl', leathery(P('etn_silt', 0.06)), leathery(P('umber', 0.06))))
    add(f'etn_{sex}_matok_pack', 'Matok Riveted Strongbox & Water-Gourd Pack', 'back',
        _dorsal_pack(f'etn_{sex}_mb_bk', _p_metal('brass', 'charcoal'),
                     P('etn_alabaster', 0.04), leathery(P('etn_silt', 0.06)), style='docket'))
    add(f'etn_{sex}_matok_breeches', 'Matok Reinforced Silt Riding Breeches', 'legs',
        trousers(f'etn_{sex}_mb_lg', P('etn_silt', 0.05, [B('bottom', 0.0, 0.035, 'solid', 'charcoal')], fabric=WOOL),
                 ease=0.014, bag=0.008), legged=True)
    add(f'etn_{sex}_matok_boots', 'Matok High Salt-Flat Caravan Boots', 'feet',
        boots(f'etn_{sex}_mb_ft', P('soot', 0.08), leathery(P('umber', 0.06, [B('top', 0.0, 0.028, 'solid', 'brass')])),
              top=0.58, ease_top=0.015))

    return entries


# ===========================================================================================================
# TIER SHARES, LABELS, OUTFITS & PEOPLES.JSON ENTRY
# ===========================================================================================================
ETERNIAN_TIER_SHARES = [
    # Pillar IV — Regional Commons, Kiln Guilds & Farside Coast (0.640)
    ['canal_citizen', 0.300],
    ['kiln_master', 0.080],
    ['wine_lacquer_factor', 0.070],
    ['glazier_mason', 0.050],
    ['farside_kelper', 0.050],
    ['hayrant_highlander', 0.050],
    ['matok_broker', 0.040],
    # Pillar III — Military, Valley Quarantine & Frontier Armies (0.200)
    ['canal_gendarme', 0.080],
    ['hayrant_soldier', 0.040],
    ['farport_guard', 0.030],
    ['valley_warden', 0.030],
    ['warden', 0.020],
    # Pillar II — Six Ministries, Censorate & Paper Bureaucracy (0.136)
    ['tube_runner', 0.040],
    ['prefect', 0.030],
    ['archivist', 0.025],
    ['censor', 0.016],
    ['clock_auditor', 0.015],
    ['minister', 0.010],
    # Pillar I — The Sanctum: True Heirs, Masked Proxies & Bodyguards (0.024)
    ['withdrawn_proxy', 0.005],
    ['heir_warden_elder', 0.004],
    ['heir_restorer_lord', 0.004],
    ['heir_juggernaut', 0.003],
    ['heir_sentinel', 0.003],
    ['heir_stalker', 0.003],
    ['heir_withdrawn_scion', 0.002],
]

ETERNIAN_TIER_LABELS = {
    'heir_warden_elder': 'Quarantine Warden Elder (True Heir)',
    'heir_restorer_lord': 'Restorer Expeditionary Lord (True Heir)',
    'heir_withdrawn_scion': 'Withdrawn Lineage Scion (True Heir)',
    'withdrawn_proxy': "Withdrawn Elder's Masked Human Proxy",
    'heir_juggernaut': "True Heir's Stepped-Pier Juggernaut",
    'heir_sentinel': "True Heir's Bronze-Tracery Sentinel",
    'heir_stalker': 'Sanctum Gunmetal Veil-Stalker',
    'minister': 'Grand Chancellor / Arch-Minister',
    'censor': 'Censorate Inspector-General',
    'clock_auditor': 'Anker-Clock Time-Auditor',
    'tube_runner': 'Pneumatic-Tube Dispatch Runner',
    'prefect': 'Examined Circuit Prefect',
    'archivist': 'Block-Print & Census Grand Archivist',
    'warden': 'Sanctum Porcelain-and-Bronze Cuirassier',
    'valley_warden': 'Valley-Cordon Anti-Taint Warden',
    'hayrant_soldier': 'Outer-Wall Hayrant Yeti-Watch Soldier',
    'farport_guard': 'Farport Factory-Quarter Customs Guard',
    'canal_gendarme': 'Canal-Town Lock & Highway Gendarme',
    'canal_citizen': 'Canal-Town Bargeman & Lowland Citizen',
    'kiln_master': 'Celadon & Porcelain Kiln-Master',
    'wine_lacquer_factor': 'Tone Champagne Cellarman & Urushi Lacquer-Master',
    'glazier_mason': 'Alabaster & Bronze-Tracery Master Glazier',
    'farside_kelper': 'Farside Kelp-Forester & Lung-Octopus Fisher',
    'hayrant_highlander': 'Hayrant Outer-Wall Alpine Highlander',
    'matok_broker': 'Matok Dam-Basin & Portage Toll-Broker',
}


def _outfits_for_sex(s):
    return {
        # Pillar I — Sanctum
        'heir_warden_elder': {
            'head': f'etn_{s}_warden_elder_crown',
            'torso': f'etn_{s}_warden_elder_robe',
            'gloves': f'etn_{s}_warden_elder_cuffs',
            'back': f'etn_{s}_back_lineage_halo',
            'legs': f'etn_{s}_heir_undertrousers',
            'feet': f'etn_{s}_heir_scale_boots',
            'region': 'sanctum', 'caste': 'true_heir',
        },
        'heir_restorer_lord': {
            'head': f'etn_{s}_head_calling_visor',
            'torso': f'etn_{s}_restorer_panoply',
            'gloves': f'etn_{s}_restorer_gauntlets',
            'back': f'etn_{s}_back_kept_relikpack',
            'legs': f'etn_{s}_restorer_breeches',
            'feet': f'etn_{s}_restorer_greaves',
            'region': 'sanctum', 'caste': 'true_heir',
        },
        'heir_withdrawn_scion': {
            'head': f'etn_{s}_withdrawn_veil_crown',
            'torso': f'etn_{s}_withdrawn_vestment',
            'gloves': f'etn_{s}_withdrawn_hands',
            'back': f'etn_{s}_withdrawn_double_halo',
            'legs': f'etn_{s}_heir_undertrousers',
            'feet': f'etn_{s}_heir_scale_boots',
            'region': 'sanctum', 'caste': 'true_heir',
        },
        'withdrawn_proxy': {
            'head': f'etn_{s}_proxy_elder_mask',
            'torso': f'etn_{s}_proxy_robe',
            'gloves': f'etn_{s}_proxy_gloves',
            'back': f'etn_{s}_proxy_edict_case',
            'legs': f'etn_{s}_ministry_trousers',
            'feet': f'etn_{s}_ministry_boots',
            'region': 'sanctum',
        },
        'heir_juggernaut': {
            'head': f'etn_{s}_heir_juggernaut_helm',
            'torso': f'etn_{s}_heir_juggernaut_cuirass',
            'gloves': f'etn_{s}_heir_juggernaut_gauntlets',
            'back': f'etn_{s}_heir_juggernaut_reactor',
            'legs': f'etn_{s}_garrison_breeches',
            'feet': f'etn_{s}_heir_juggernaut_sabatons',
            'region': 'sanctum', 'type': 'important_npc',
        },
        'heir_sentinel': {
            'head': f'etn_{s}_heir_sentinel_helm',
            'torso': f'etn_{s}_heir_sentinel_chassis',
            'gloves': f'etn_{s}_heir_sentinel_cyberhands',
            'legs': f'etn_{s}_heir_sentinel_cyberlegs',
            'feet': f'etn_{s}_heir_sentinel_cyberboots',
            'region': 'sanctum', 'type': 'important_npc',
        },
        'heir_stalker': {
            'head': f'etn_{s}_heir_stalker_helm',
            'torso': f'etn_{s}_heir_stalker_armor',
            'gloves': f'etn_{s}_heir_stalker_gauntlets',
            'legs': f'etn_{s}_heir_stalker_breeches',
            'feet': f'etn_{s}_heir_stalker_greaves',
            'region': 'sanctum', 'type': 'important_npc',
        },
        # Pillar II — Ministries
        'minister': {
            'head': f'etn_{s}_minister_halo',
            'torso': f'etn_{s}_minister_robe',
            'gloves': f'etn_{s}_minister_cuffs',
            'back': f'etn_{s}_minister_seal_cape',
            'legs': f'etn_{s}_ministry_trousers',
            'feet': f'etn_{s}_ministry_boots',
            'region': 'ministries',
        },
        'censor': {
            'head': f'etn_{s}_censor_crown',
            'torso': f'etn_{s}_censor_robe',
            'gloves': f'etn_{s}_censor_gloves',
            'back': f'etn_{s}_censor_ledger_case',
            'legs': f'etn_{s}_ministry_trousers',
            'feet': f'etn_{s}_ministry_boots',
            'region': 'ministries',
        },
        'clock_auditor': {
            'head': f'etn_{s}_clock_mitre',
            'torso': f'etn_{s}_clock_cassock',
            'gloves': f'etn_{s}_clock_cuffs',
            'back': f'etn_{s}_clock_chime_rig',
            'legs': f'etn_{s}_ministry_trousers',
            'feet': f'etn_{s}_ministry_boots',
            'region': 'ministries',
        },
        'tube_runner': {
            'head': f'etn_{s}_runner_cap',
            'torso': f'etn_{s}_runner_tunic',
            'gloves': f'etn_{s}_runner_gloves',
            'back': f'etn_{s}_back_tube_manifold',
            'legs': f'etn_{s}_runner_breeches',
            'feet': f'etn_{s}_runner_boots',
            'region': 'ministries',
        },
        'prefect': {
            'head': f'etn_{s}_prefect_cap',
            'torso': f'etn_{s}_prefect_robe',
            'gloves': f'etn_{s}_prefect_cuffs',
            'legs': f'etn_{s}_ministry_trousers',
            'feet': f'etn_{s}_ministry_boots',
            'region': 'ministries',
        },
        'archivist': {
            'head': f'etn_{s}_archivist_hat',
            'torso': f'etn_{s}_archivist_robe',
            'gloves': f'etn_{s}_archivist_cuffs',
            'back': f'etn_{s}_archivist_docket_rack',
            'legs': f'etn_{s}_ministry_trousers',
            'feet': f'etn_{s}_ministry_boots',
            'region': 'ministries',
        },
        # Pillar III — Armies & Quarantine
        'warden': {
            'head': f'etn_{s}_head_porcelain_fan_helm',
            'torso': f'etn_{s}_warden_cuirass',
            'gloves': f'etn_{s}_warden_gauntlets',
            'legs': f'etn_{s}_garrison_breeches',
            'feet': f'etn_{s}_warden_greaves',
            'region': 'lux_kilns',
        },
        'valley_warden': {
            'head': f'etn_{s}_head_valley_lancet_helm',
            'torso': f'etn_{s}_valley_cuirass',
            'gloves': f'etn_{s}_valley_gauntlets',
            'back': f'etn_{s}_valley_assay_pack',
            'legs': f'etn_{s}_valley_trousers',
            'feet': f'etn_{s}_valley_boots',
            'region': 'valley_cordon',
        },
        'hayrant_soldier': {
            'head': f'etn_{s}_hayrant_helm',
            'torso': f'etn_{s}_hayrant_brigandine',
            'gloves': f'etn_{s}_hayrant_mitts',
            'back': f'etn_{s}_hayrant_quiver_pack',
            'legs': f'etn_{s}_hayrant_trousers',
            'feet': f'etn_{s}_hayrant_boots',
            'region': 'hayrant',
        },
        'farport_guard': {
            'head': f'etn_{s}_farport_morion',
            'torso': f'etn_{s}_farport_brigandine',
            'gloves': f'etn_{s}_farport_bracers',
            'back': f'etn_{s}_farport_lantern_pack',
            'legs': f'etn_{s}_farport_breeches',
            'feet': f'etn_{s}_farport_boots',
            'region': 'farside',
        },
        'canal_gendarme': {
            'head': f'etn_{s}_gendarme_cabasset',
            'torso': f'etn_{s}_gendarme_coat',
            'gloves': f'etn_{s}_gendarme_vambraces',
            'back': f'etn_{s}_gendarme_pavise_rig',
            'legs': f'etn_{s}_garrison_breeches',
            'feet': f'etn_{s}_gendarme_boots',
            'region': 'canal_core',
        },
        # Pillar IV — Regional Commons & Guilds
        'canal_citizen': {
            'head': f'etn_{s}_canal_hat',
            'torso': f'etn_{s}_canal_tunic',
            'back': f'etn_{s}_canal_creel',
            'legs': f'etn_{s}_canal_trousers',
            'feet': f'etn_{s}_canal_sandals',
            'region': 'canal_core',
        },
        'kiln_master': {
            'head': f'etn_{s}_kiln_cap',
            'torso': f'etn_{s}_kiln_apron',
            'gloves': f'etn_{s}_kiln_mitts',
            'back': f'etn_{s}_kiln_jar_frame',
            'legs': f'etn_{s}_common_trousers',
            'feet': f'etn_{s}_common_shoes',
            'region': 'lux_kilns',
        },
        'wine_lacquer_factor': {
            'head': f'etn_{s}_factor_hat',
            'torso': f'etn_{s}_factor_coat',
            'gloves': f'etn_{s}_factor_gloves',
            'back': f'etn_{s}_factor_case',
            'legs': f'etn_{s}_ministry_trousers',
            'feet': f'etn_{s}_artisan_boots',
            'region': 'canal_core',
        },
        'glazier_mason': {
            'head': f'etn_{s}_glazier_cap',
            'torso': f'etn_{s}_glazier_jerkin',
            'gloves': f'etn_{s}_glazier_cuffs',
            'back': f'etn_{s}_glazier_pane_rack',
            'legs': f'etn_{s}_common_trousers',
            'feet': f'etn_{s}_artisan_boots',
            'region': 'corpus_matok',
        },
        'farside_kelper': {
            'head': f'etn_{s}_kelper_hood',
            'torso': f'etn_{s}_kelper_cape_vest',
            'gloves': f'etn_{s}_kelper_wraps',
            'back': f'etn_{s}_kelper_creel',
            'legs': f'etn_{s}_kelper_waders',
            'feet': f'etn_{s}_kelper_boots',
            'region': 'farside',
        },
        'hayrant_highlander': {
            'head': f'etn_{s}_hayrant_matampus',
            'torso': f'etn_{s}_hayrant_attus',
            'gloves': f'etn_{s}_hayrant_cuffs',
            'back': f'etn_{s}_hayrant_hod',
            'legs': f'etn_{s}_hayrant_leggings',
            'feet': f'etn_{s}_hayrant_shoes',
            'region': 'hayrant',
        },
        'matok_broker': {
            'head': f'etn_{s}_matok_turban_cap',
            'torso': f'etn_{s}_matok_coat',
            'gloves': f'etn_{s}_matok_gloves',
            'back': f'etn_{s}_matok_pack',
            'legs': f'etn_{s}_matok_breeches',
            'feet': f'etn_{s}_matok_boots',
            'region': 'corpus_matok',
        },
    }


def build_eternian_peoples_entry():
    return {
        'id': 'eternian',
        'name': 'The Eternal State',
        'note': (
            'Deco-Gothic + Qing bureaucratic paper state ruled from the Sanctum by metallic-skinned '
            'True Heirs over human ministries, porcelain cuirassiers, Valley Quarantine wardens, '
            'Hayrant Yeti-Watch soldiers, Farport customs guards, and Canal/Kiln/Farside guilds '
            '(25 canon tiers at 100% M/F parity; strict zero-red and zero-sun-ray law; '
            'tools/garments/cultures/eternian.py).'
        ),
        'ancestry': {
            'african': [0.05, 0.25],
            'asian': [0.55, 0.85],
            'caucasian': [0.10, 0.35],
        },
        'skin': ['#ebd3be', '#d8b496', '#c09674'],
        'hair': ['#120f0d', '#1c1714', '#2a221d'],
        'eyes': ['#2a1a10', '#3b2414', '#4a3520'],
        'grey': 0.45,
        'beard': 0.25,
        'styles': {
            'male': ['short02', 'long01', 'ponytail01'],
            'female': ['o4saken_chinesebob01', 'elvs_braid_bun', 'long01'],
        },
        'caste_presets': {
            'true_heir': {
                'skin': ['#d8b24a', '#c9ccd2', '#9c7a3c', '#5e9c86', '#4a5058'],
                'hair': ['#e2c062', '#d2d6dc', '#a88444', '#525860'],
                'eyes': ['#d8b24a', '#8fb8a0', '#c9ccd2', '#39d6e8'],
                'morph': {'height': [0.75, 1.0], 'muscle': [0.45, 0.70]},
                'grey': 1.1,
                'skin_metal': 0.55,
            },
        },
        'tiers': ETERNIAN_TIER_SHARES,
        'tier_labels': ETERNIAN_TIER_LABELS,
        'outfits': {
            'male': _outfits_for_sex('m'),
            'female': _outfits_for_sex('f'),
        },
    }


def build_eternian_kit():
    """Compile all 25 Eternian tiers across `mpfb_male` and `mpfb_female` inside `eternian_motif_scope()`."""
    with eternian_motif_scope():
        entries = []
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            entries.extend(_build_for_body(sex, body_id))
    return entries


def _validate_manifest(kit_entries, peoples_entry):
    share_sum = sum(sh for tid, sh in peoples_entry['tiers'] if not tid.startswith('pc_'))
    assert abs(share_sum - 1.0) < 1e-9, f'Eternian tier shares sum to {share_sum}, expected 1.00'

    by_body_id = {}
    for ent in kit_entries:
        b_id = ent.get('_body')
        gid = ent.get('id')
        assert b_id in ('mpfb_male', 'mpfb_female'), f'Invalid _body on {gid}: {b_id}'
        assert ent.get('culture') == 'eternian', f'Unexpected culture on {gid}: {ent.get("culture")}'
        key = (b_id, gid)
        assert key not in by_body_id, f'Duplicate kit entry for {key}'
        by_body_id[key] = ent
        glb_p = ROOT / ent['glb']
        morph_p = glb_p.with_suffix('.morph.bin')
        assert glb_p.exists() and glb_p.stat().st_size > 500, f'Missing or empty GLB: {glb_p}'
        assert morph_p.exists() and morph_p.stat().st_size > 100, f'Missing or empty morph.bin: {morph_p}'

    m_keys = set(peoples_entry['outfits']['male'].keys())
    f_keys = set(peoples_entry['outfits']['female'].keys())
    assert m_keys == f_keys, f'M/F tier parity mismatch: {m_keys ^ f_keys}'
    assert len(m_keys) == 25, f'Expected 25 tiers, got {len(m_keys)}'

    for sex_key, body_id in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
        for tid, spec in peoples_entry['outfits'][sex_key].items():
            assert 'torso' in spec and 'legs' in spec and 'feet' in spec, (
                f'Outfit {sex_key}.{tid} missing required torso/legs/feet coverage'
            )
            for slot in ('head', 'torso', 'gloves', 'legs', 'feet', 'back'):
                if slot in spec:
                    pid = spec[slot]
                    assert (body_id, pid) in by_body_id, f'Outfit {sex_key}.{tid}.{slot} -> {pid} missing from {body_id}'
                    assert by_body_id[(body_id, pid)]['slot'] == slot, (
                        f'Slot mismatch on {pid}: expected {slot}, got {by_body_id[(body_id, pid)]["slot"]}'
                    )


def main():
    t0 = time.perf_counter()
    kit_entries = build_eternian_kit()
    peoples_entry = build_eternian_peoples_entry()
    _validate_manifest(kit_entries, peoples_entry)

    manifest_path = CULTURES_DIR / 'eternian_manifest.json'
    manifest_data = {
        'culture': 'eternian',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Eternian pieces ({n_m} male, {n_f} female) across 25 tiers in {dt:.2f}s.')
    print(f'Saved manifest to {manifest_path}')


if __name__ == '__main__':
    main()
