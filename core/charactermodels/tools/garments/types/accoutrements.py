"""Layer 2 (Accoutrements): Belts, pouches, sashes with tails, stacked belts, buttons, rosettes, pendants, tassels, eyes, flaps, straps, tubes, and blobs.

Consolidates all accoutrement primitives (`belt_sash`, `pouch_belt`, `sash_with_tail`,
`stacked_belts`, `button_row`, `rosette`, `pendants`, `tassel`, `eye_disc`, `flap`, `strap`,
`tube`, `blob`) into a single module, eliminating cross-culture function vending.
"""
import math
import numpy as np
from .. import core
from ..core import Part, spine_at, first_hit, smooth_push, surface_out, chest_front
from ..paint import P, B
from .torso import torso_tube
from .headgear import horn


def flap(name, top_center, width, length, out, paint, cols=7, rows=10, ease=0.012, group_below=None, sway=0.0, push=True, rigid_joint=None):
    out = np.asarray(out, float)
    out = out / np.linalg.norm(out)
    side = np.cross(np.array([0, 0, 1.0]), out)
    if np.linalg.norm(side) < 1e-6:
        side = np.array([1.0, 0, 0])
    else:
        side /= np.linalg.norm(side)
    P_grid = []
    for i in range(rows):
        v = i / (rows - 1)
        row = []
        for j in range(cols):
            u = j / (cols - 1) - 0.5
            p = top_center + side * u * width * (1 + 0.08 * v) + np.array([0, 0, -length * v]) + out * (sway * v * v)
            row.append(p)
        P_grid.append(row)
    P_grid = np.array(P_grid)
    if push:
        P_grid = smooth_push(P_grid, False, ease, iters=2)
    grp = ['helper-skirt' if (group_below is not None and P_grid[i, :, 2].mean() < group_below) else 'body' for i in range(rows)]
    pt = Part(name, P_grid, False, grp, paint, rigid_joint=rigid_joint)
    if rigid_joint is None and length >= 0.12:
        pt.cloth = {
            'start': 0,
            'stiff': 0.08,
            'layer': 2 if any(k in name for k in ('tail', 'apron', 'stole', 'tabard', 'tasset', 'ribbons', 'sidesash')) else 1,
        }
    return pt


def blob(name, c, size, paint, n=12, rows=5, out=None, rigid_joint=None, role=None):
    out = np.array([0, -1.0, 0]) if out is None else np.asarray(out, float) / np.linalg.norm(out)
    side = np.cross(np.array([0, 0, 1.0]), out)
    if np.linalg.norm(side) < 1e-6:
        side = np.array([1.0, 0, 0])
    else:
        side /= np.linalg.norm(side)
    up = np.cross(out, side)
    up /= np.linalg.norm(up)
    Q = []
    for i in range(rows):
        ph = math.pi * (0.06 + 0.88 * i / (rows - 1))
        r, z = math.sin(ph), math.cos(ph)
        Q.append([c + side * math.cos(a) * r * size[0] / 2 + out * (max(-0.25, math.sin(a)) * r * size[1] / 2) + up * (z * size[2] / 2)
                  for a in np.linspace(0, 2 * math.pi, n, endpoint=False)])
    return Part(name, np.array(Q), True, ['body'] * rows, paint, rigid_joint=rigid_joint, role=role)


def belt_sash(name, z_bot, z_top, paint, ease=0.038):
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    return torso_tube(name, z0, z1, ease, paint, n=40, rows=6, hull_from=z0)


def pouch_belt(gid, paint, pouch_paint, ease=0.042):
    """Waist belt with three utility pouches (de-vendored from `izani_belt`)."""
    c = spine_at(core.WAIST - 0.015)
    parts = [torso_tube(gid + '_belt', core.WAIST + 0.02, core.WAIST - 0.05, ease, paint, rows=3, n=40, hull_from=core.WAIST + 0.1, role='belt')]
    for k, d in enumerate((np.array([-0.75, -0.66, 0]), np.array([0.8, 0.6, 0]), np.array([0.98, -0.2, 0]))):
        d = d / np.linalg.norm(d)
        parts.append(blob('%s_pouch%d' % (gid, k), surface_out(c, d, ease + 0.03), (0.075, 0.04, 0.085), pouch_paint, out=d, role='accessory'))
    return parts


def sash_with_tail(gid, paint, tail_paint, ease=0.026, tail=0.34):
    """Waist sash with hanging side tail (de-vendored from `izani_sash`)."""
    c = spine_at(core.WAIST - 0.02)
    d = np.array([0.85, -0.5, 0])
    d /= np.linalg.norm(d)
    t = flap(gid + '_sash_tail', surface_out(c, d, ease + 0.01), 0.09, tail, d, tail_paint, cols=4, rows=8, ease=0.02, sway=0.02)
    t.cloth['layer'] = 2
    return [torso_tube(gid + '_sash', core.WAIST + 0.03, core.WAIST - 0.045, ease, paint, rows=3, n=40, hull_from=core.WAIST + 0.1, role='band'), t]


def stacked_belts(gid, n_belts=3, ease=0.028):
    """Stacked leather belts with brass studs and side pouches (de-vendored from `animal_belts`)."""
    belt_p = P('leather', 0.05, [B('top', 0.0, 0.25, 'beads', 'brass', 'leather', 0.035)])
    pouch_p = P('saddle', 0.06, [B('top', 0.0, 0.02, 'solid', 'brass')])
    parts = []
    for i in range(n_belts):
        zb = core.WAIST + 0.03 - i * 0.032
        # (role band, not belt: a numbered belt never took the hips' rigid skinning, its suffix is not '_belt')
        parts.append(torso_tube(f'{gid}_belt{i}', zb, zb - 0.026, ease + 0.002 * i, belt_p, rows=3, n=40, hull_from=core.WAIST + 0.1, role='band'))
    c = spine_at(core.WAIST - 0.02)
    for k, d in enumerate((np.array([-0.85, -0.52, 0]), np.array([0.85, -0.52, 0]))):
        d = d / np.linalg.norm(d)
        parts.append(blob(f'{gid}_pouch{k}', surface_out(c, d, ease + 0.028), (0.07, 0.038, 0.08), pouch_p, out=d, role='accessory'))
    return parts


def button_row(gid, z_top, z_bot, n_buttons=5, paint=None, ease=0.024, double=False):
    """Single or double-breasted row of 3D buttons down the chest (de-vendored from `_buttons`)."""
    bp = paint or P('brass', 0.02, fabric='metal.gold')
    out = []
    for i, z in enumerate(np.linspace(z_top, z_bot, n_buttons)):
        if double:
            for k, dx in enumerate((-0.042, 0.042)):
                out.append(blob(f'{gid}_btn_{i}_{k}', chest_front(z, ease, x=dx), (0.018, 0.012, 0.018), bp, n=8, rows=4, role='trinket'))
        else:
            out.append(blob(f'{gid}_btn_{i}', chest_front(z, ease), (0.018, 0.012, 0.018), bp, n=8, rows=4, role='trinket'))
    return out


# Backward-compatible aliases
izani_belt = pouch_belt
izani_sash = sash_with_tail
animal_belts = stacked_belts
_buttons = button_row


def eye_disc(name, at, out, size, paint, iris_paint):
    """Almond eye boss with raised iris (Dalab / Eternal State emblem)."""
    out = np.asarray(out, float) / np.linalg.norm(out)
    return [blob(name, at, (size, size * 0.18, size * 0.6), paint, n=14, rows=6, out=out),
            blob(name + '_iris', at + out * size * 0.1, (size * 0.36, size * 0.12, size * 0.36), iris_paint, n=10, rows=5, out=out)]


def pendants(name, z, angles, size, paint, ease=0.04):
    """Small hanging trophies (claws, teeth, shells, bells) around the body at height z."""
    c = spine_at(z)
    out = []
    for k, an in enumerate(angles):
        d = np.array([math.sin(an), math.cos(an), 0])
        h = first_hit(c, d, bvh=core.BVH_T) or 0.14
        out.append(blob('%s%d' % (name, k), c + d * (h + ease) + np.array([0, 0, -size[2] * 0.6]), size, paint, n=8, rows=5, out=d))
    return out


def tube(name, path, r, paint, n=8, rigid_joint=None):
    pts = np.array(path, float)
    d0 = pts[1] - pts[0]
    d0 /= max(np.linalg.norm(d0), 1e-9)
    d1 = pts[-1] - pts[-2]
    d1 /= max(np.linalg.norm(d1), 1e-9)
    body_rows = max(5, len(pts) * 2)
    body_part = horn(name, pts, r, r, paint, n=n, rows=body_rows, rigid_joint=rigid_joint)
    Q_body = body_part.P
    c_top = pts[0] - d0 * (r * 0.06)
    c_bot = pts[-1] + d1 * (r * 0.06)
    top_rim = c_top + (Q_body[0] - pts[0]) * 0.94
    top_ctr = c_top + (Q_body[0] - pts[0]) * 0.02
    bot_rim = c_bot + (Q_body[-1] - pts[-1]) * 0.94
    bot_ctr = c_bot + (Q_body[-1] - pts[-1]) * 0.02
    Q_capped = np.concatenate([[top_ctr, top_rim], Q_body, [bot_rim, bot_ctr]], axis=0)
    return Part(name, Q_capped, True, ['body'] * len(Q_capped), paint, rigid_joint=rigid_joint)


def strap(name, path, width, paint, rigid_joint=None):
    return horn(name, path, width * 0.5, width * 0.5, paint, n=8, rows=max(5, len(path) * 2), rigid_joint=rigid_joint, role='band')


def tassel(name, top_pos, length, radius, paint, rigid_joint=None):
    bot_pos = np.asarray(top_pos, float) - np.array([0.0, 0.0, length])
    return horn(name, [top_pos, bot_pos], radius * 0.85, radius * 1.15, paint, n=8, rows=6, rigid_joint=rigid_joint, role='accessory')


def rosette(name, center, out_vec, side_vec, radius, paint, n=14, thick=0.014, rigid_joint=None):
    return blob(name, center, (radius * 2.0, thick * 2.0, radius * 2.0), paint,
                n=n, rows=5, out=out_vec, rigid_joint=rigid_joint, role='accessory')
