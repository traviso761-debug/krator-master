"""Layer 2 (Limbs): Sleeves, armbands, four-armed garment adapters, trousers, skirts, and loincloths.

Consolidates all limb-type primitives (`limb_tube`, `sleeve`, `sleeves`, `armbands`, `trousers`,
`skirt`, `loincloth`) into a single garment-type module.
"""
import math
import numpy as np
from .. import core
from ..core import Part, J, frame, ring_points, smooth_push, L, R
from .torso import torso_tube


def limb_tube(name, a, b, ease, paint, n=20, rows=8, ease_end=None, start_back=0.0, arc=None, group='body', path=None, bvh=None, rmax=0.25,
              role=None, side=None):
    _plen = float(np.linalg.norm(np.diff(np.array(path if path is not None else [a, b], float), axis=0), axis=1).sum())
    if bvh is core.BVH_A and role != 'pauldron' and _plen >= 0.18:
        # issue 4 (REVIEW-GARMENTS-2026-11-06.md): a sleeve's ease is capped at 2 cm and its flare at 2.8 cm here, in
        # the tube every arm part is built on, not only in sleeve(): sleeves() and the builders' own calls bypassed
        # the cap, and the push has no trunk capsule to catch a sleeve that stands too far off the arm. A sleeve is an
        # arm tube 18 cm or longer: a pauldron or an armband stands off by design
        ease = min(float(ease), 0.020)
        if ease_end is not None:
            ease_end = min(float(ease_end), ease + 0.028)
    pts = np.array(path if path is not None else [a, b], float)
    t0 = (pts[1] - pts[0]) / np.linalg.norm(pts[1] - pts[0])
    pts[0] = pts[0] - t0 * start_back
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    cum = np.concatenate([[0], np.cumsum(seg)])
    total = cum[-1]
    if arc:
        angles = np.linspace(arc[0], arc[1], n)
    else:
        angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    Es = np.linspace(ease, ease_end if ease_end is not None else ease, rows)
    if start_back > 0.02 and arc is None and rows >= 5:
        Es[0] = min(Es[0] * 0.35, 0.006)
        Es[1] = min(Es[1] * 0.72, 0.014)
    x, _ = frame(t0)
    rings = []
    for k in range(rows):
        sdist = total * k / (rows - 1)
        i = min(len(seg) - 1, int(np.searchsorted(cum, sdist, side='right') - 1))
        f = (sdist - cum[i]) / seg[i]
        c = pts[i] + (pts[i + 1] - pts[i]) * f
        t = (pts[i + 1] - pts[i]) / seg[i]
        if i + 1 < len(seg) and f > 0.7:
            t2 = (pts[i + 2] - pts[i + 1]) / seg[i + 1]
            w = (f - 0.7) / 0.6
            t = t * (1 - w) + t2 * w
        if i > 0 and f < 0.3:
            t1 = (pts[i] - pts[i - 1]) / seg[i - 1]
            w = (0.3 - f) / 0.6
            t = t * (1 - w) + t1 * w
        t = t / np.linalg.norm(t)
        x = x - t * x.dot(t)
        x = x / np.linalg.norm(x)
        y = np.cross(t, x)
        rings.append(ring_points(c, x, y, angles, Es[k], rmin=0.02, rmax=rmax, bvh=bvh))
    P_grid = np.array(rings)
    P_grid = smooth_push(P_grid, arc is None, ease, iters=2, rows_ease=Es, bvh=bvh)
    pt = Part(name, P_grid, arc is None, [group] * rows, paint, role=role, side=side)
    pt.is_arm = (bvh is core.BVH_A)
    return pt


def sleeve(name, side, paint, f0=0.0, f1=0.92, ease=0.020, flare=0.008, rows=12, n=22):
    """Single-arm sleeve from fraction f0 to f1 along the arm (0=shoulder, 0.5=elbow, 1.0=wrist)."""
    ease_c = min(float(ease), 0.020)
    flare_c = min(float(flare), 0.028)
    a, e, h = J(side + 'Arm'), J(side + 'ForeArm'), J(side + 'Hand')
    def pt_at(f):
        if f <= 0.5:
            return a + (e - a) * (f / 0.5)
        return e + (h - e) * ((f - 0.5) / 0.5)
    if f0 < 0.48 and f1 > 0.52:
        path = [pt_at(f0), e, pt_at(f1)]
    else:
        path = [pt_at(f0), pt_at(f1)]
    sb = 0.048 if f0 < 0.05 else 0.0
    return limb_tube(name, None, None, ease_c, paint, n=n, rows=rows,
                     ease_end=ease_c + flare_c, start_back=sb, path=path, bvh=core.BVH_A, rmax=0.135, role='sleeve', side=side[0])


def sleeves(gid, end, ease, paint, ease_end=None, rows=8, n=22, rmax=0.135):
    """Paired left and right sleeves ('elbow', 'wrist', or fraction of upper arm)."""
    out = []
    for s in (L, R):
        a, e, h = J(s + 'Arm'), J(s + 'ForeArm'), J(side + 'Hand') if False else J(s + 'Hand')
        path = [a, e] if end == 'elbow' else [a, e, h - (h - e) * 0.08] if end == 'wrist' else [a, a + (e - a) * end]
        out.append(limb_tube('%s_sleeve_%s' % (gid, s[0]), None, None, ease, paint, n=n, rows=rows, ease_end=ease_end,
                             start_back=0.048, path=path, bvh=core.BVH_A, rmax=rmax, role='sleeve', side=s[0]))
    return out


def armbands(gid, paint, f=0.45, w=0.035):
    """Paired upper-arm bands (de-vendored from Dalab)."""
    out = []
    for s in (L, R):
        a, e = J(s + 'Arm'), J(s + 'ForeArm')
        c = a + (e - a) * f
        out.append(limb_tube('%s_armband_%s' % (gid, s[0]), c, c + (e - a) / np.linalg.norm(e - a) * w, 0.008, paint,
                             n=16, rows=2, bvh=core.BVH_A, role='band', side=s[0]))
    return out


def trousers(gid, paint, ease=0.018, ease_end=None, cuff=None, seat_paint=None, n=22, rows=14, ankle_f=None, bag=0.025):
    """Unified trousers builder supporting both cuff height (`cuff=...`) and shin fraction (`ankle_f=...`)."""
    out = [torso_tube(gid + '_seat', core.WAIST + 0.01, core.CROTCH + 0.01, ease, seat_paint or paint,
                      n=36, rows=6, hull_from=core.WAIST, role='trunk')]
    ee = ease_end if ease_end is not None else (ease + bag * 0.5)
    for s in (L, R):
        hip, knee, foot = J(s + 'UpLeg'), J(s + 'Leg'), J(s + 'Foot')
        if ankle_f is not None:
            end = knee + (foot - knee) * min(1.0, float(ankle_f))
        else:
            z = cuff if cuff is not None else core.ANKLE + 0.05
            f = (knee[2] - z) / max(1e-6, knee[2] - foot[2])
            end = knee + (foot - knee) * min(1.0, f)
        out.append(limb_tube('%s_leg_%s' % (gid, s[0]), None, None, ease + 0.004, paint, n=n, rows=rows,
                             ease_end=ee, start_back=0.06, path=[hip, knee, end], rmax=0.22, role='leg', side=s[0]))
    return out


def skirt(name, z_bot, z_top, paint, ease=0.024, flare=0.08, rows=18, n=40):
    """Full or knee-length skirt hanging from the waist."""
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    return torso_tube(name, z0, z1, ease, paint, n=n, rows=rows,
                      hang_from=z0 - 0.02, flare=flare,
                      group_below=core.CROTCH + 0.02, hull_from=z0)
