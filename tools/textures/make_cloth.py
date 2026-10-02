#!/usr/bin/env python3
"""Procedural, tintable base weaves as material-library sets (core/materials/PLAN.md, "Cloth").

    python3 tools/textures/make_cloth.py [--only cloth.weave.twill] [--size 1024]

Writes core/materials/library/<id>/{albedo.jpg, normal.png, roughness.png, meta.json}:
  cloth.weave.plain   plain weave, fine         cloth.weave.twill   2/2 twill, diagonal rib
  cloth.weave.canvas  heavy plain weave          cloth.weave.burlap  loose coarse weave with gaps
  cloth.felt          pressed fibre, no weave    cloth.knit          stockinette knit

Each weave is a woven-thread height field: a cell grid of N warp x N weft threads, where the thread that is
"over" in a cell shows a rounded cross-section across its width and a hump along its length that dives under at
the ends. Thread index, not pixel index, drives every random value, and N is a whole number, so the set tiles
exactly by construction (no seam repair). The normal map is taken from that height field, so it carries the real
weave. The colour map is near-neutral grey (tint: true): the culture's tint supplies the colour.
Deterministic. Requires numpy and Pillow.
"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageFile
from process import blur, lum                      # periodic FFT blur, luminance

ImageFile.MAXBLOCK = 1 << 26
VERSION = 1
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def pfield(rng, n, sy, sx):
    """Periodic noise, n x n, zero mean, unit std, smoothed anisotropically (sigma y, x in px). Tiles exactly."""
    f = rng.standard_normal((n, n))
    fy = np.fft.fftfreq(n)[:, None]; fx = np.fft.fftfreq(n)[None, :]
    g = np.exp(-2 * np.pi ** 2 * ((sy * fy) ** 2 + (sx * fx) ** 2))
    f = np.real(np.fft.ifft2(np.fft.fft2(f) * g))
    return (f - f.mean()) / (f.std() + 1e-9)


def grid(n, size):
    """Per-pixel cell index and local coordinate in [0,1) for n cells across `size` px."""
    t = (np.arange(size) + 0.5) * n / size
    i = np.floor(t).astype(int)
    return i % n, (t - np.floor(t))


def round_profile(t, width=1.0):
    d = np.abs(2 * t - 1) / width
    return np.sqrt(np.clip(1 - d * d, 0, 1))


def weave(size, n, over, rng, width=0.92, gap=0.0, slub=0.25, wobble=0.0, fibre=0.35):
    """over(i, j) -> bool array: True where the warp (vertical) thread is on top in cell (col i, row j)."""
    ix, u = grid(n, size); iy, v = grid(n, size)
    I, J = np.meshgrid(ix, iy); U, V = np.meshgrid(u, v)
    warp_top = over(I, J)
    # per-thread variation: thickness and tone from the thread index only (so it tiles)
    tw_w = 1 + slub * (rng.random(n) - 0.5); tw_f = 1 + slub * (rng.random(n) - 0.5)
    tone_w = 1 + 0.16 * (rng.random(n) - 0.5); tone_f = 1 + 0.16 * (rng.random(n) - 0.5)
    # a thread wanders sideways along its length: a periodic 1D noise per thread, whole-cell periodic
    wob_w = rng.standard_normal((n, n)) * wobble; wob_f = rng.standard_normal((n, n)) * wobble
    # warp thread i, running down: cross-section coordinate U (+wobble), along coordinate V
    Uw = np.clip(U + wob_w[I, J] * 0.5, 0, 1); Vf = np.clip(V + wob_f[I, J] * 0.5, 0, 1)
    w_across = round_profile(Uw, width * tw_w[I]); w_along = 0.45 + 0.55 * np.sin(np.pi * V) ** 0.8
    f_across = round_profile(Vf, width * tw_f[J]); f_along = 0.45 + 0.55 * np.sin(np.pi * U) ** 0.8
    hw = w_across * w_along; hf = f_across * f_along
    h = np.where(warp_top, hw, hf)
    # the thread underneath still shows a little between gaps
    under = np.where(warp_top, hf, hw) * 0.35
    h = np.maximum(h, under * (1 - gap))
    if gap > 0:
        h = h * (1 - 0.0) - gap * 0.25 * (h < 0.12)
    tone = np.where(warp_top, tone_w[I], tone_f[J])
    # fibre texture runs along the thread: warp fibres vertical, weft horizontal
    fv = pfield(rng, size, size / 14.0, 0.9); fh = pfield(rng, size, 0.9, size / 14.0)
    fib = np.where(warp_top, fv, fh)
    h = h + fibre * 0.06 * fib * (h > 0.05)
    return h, tone, fib


def finish(h, tone, fib, base_l, ao=0.55, fibre_tone=0.05, tint=(1.0, 1.0, 1.0)):
    hn = (h - h.min()) / max(h.max() - h.min(), 1e-6)
    l = base_l * (1 - ao + ao * np.clip(hn, 0, 1) ** 0.6) * tone * (1 + fibre_tone * fib)
    rgb = np.clip(l[..., None] * np.array(tint)[None, None, :], 0, 1)
    return rgb, hn


def normal_from(h, strength, size):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5 * strength * 8 * size / 1024.0
    dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5 * strength * 8 * size / 1024.0
    n = np.stack([-dx, dy, np.ones_like(h)], -1)
    return n / np.linalg.norm(n, axis=-1, keepdims=True)


# ---------------------------------------------------------------- the six sets
def plain(size, rng):
    h, t, f = weave(size, 64, lambda i, j: (i + j) % 2 == 0, rng, width=0.95, slub=0.3, fibre=0.5)
    return h, t, f, dict(base=0.62, ao=0.6, ns=1.6, rough=0.86, scale=[0.5, 0.5])


def twill(size, rng):
    h, t, f = weave(size, 64, lambda i, j: ((i + j) % 4) < 2, rng, width=1.0, slub=0.25, fibre=0.5)
    return h, t, f, dict(base=0.60, ao=0.6, ns=1.6, rough=0.84, scale=[0.5, 0.5])


def canvas(size, rng):
    h, t, f = weave(size, 40, lambda i, j: (i + j) % 2 == 0, rng, width=0.97, slub=0.5, wobble=0.15, fibre=0.9)
    return h, t, f, dict(base=0.64, ao=0.62, ns=2.0, rough=0.92, scale=[1.0, 1.0])


def burlap(size, rng):
    h, t, f = weave(size, 28, lambda i, j: (i + j) % 2 == 0, rng, width=0.80, gap=0.5, slub=0.6, wobble=0.5, fibre=1.2)
    return h, t, f, dict(base=0.70, ao=0.62, ns=2.0, rough=0.95, scale=[1.0, 1.0])


def felt(size, rng):
    """Pressed fibre: many short oriented strokes, each from a differently-oriented anisotropic blur."""
    acc = np.zeros((size, size))
    fy = np.fft.fftfreq(size)[:, None]; fx = np.fft.fftfreq(size)[None, :]
    for k in range(10):
        a = np.pi * k / 10 + 0.3 * rng.random()
        u = fx * np.cos(a) + fy * np.sin(a); v = -fx * np.sin(a) + fy * np.cos(a)
        g = np.exp(-2 * np.pi ** 2 * ((size / 55.0 * u) ** 2 + (1.1 * v) ** 2))
        z = np.real(np.fft.ifft2(np.fft.fft2(rng.standard_normal((size, size))) * g))
        acc += np.abs(z / (z.std() + 1e-9))
    acc += 0.9 * pfield(rng, size, 1.5, 1.5) + 0.25 * pfield(rng, size, size / 60.0, size / 60.0)
    h = (acc - acc.mean()) / acc.std() * 0.15 + 0.5
    tone = 1 + 0.04 * pfield(rng, size, size / 50.0, size / 50.0)
    return h, tone, pfield(rng, size, 1, 1), dict(base=0.60, ao=0.35, ns=0.7, rough=0.97, scale=[0.5, 0.5])


def knit(size, rng):
    """Stockinette: 24 wales x 32 courses of V-shaped stitches (two slanted yarn legs per stitch)."""
    nx, ny = 24, 32
    ix, u = grid(nx, size); iy, v = grid(ny, size)
    I, J = np.meshgrid(ix, iy); U, V = np.meshgrid(u, v)
    legs = []
    for sgn in (-1, 1):
        # leg centre-line: meets the other leg at the bottom of the cell, spreads toward the top
        uc = 0.5 + sgn * 0.30 * (1 - V)
        d = (U - uc) * 0.84                       # horizontal distance, foreshortened by the slant
        prof = np.sqrt(np.clip(1 - (d / 0.23) ** 2, 0, 1))
        lift = 0.40 + 0.60 * np.sin(np.pi * np.clip(V * 0.95 + 0.04, 0, 1)) ** 0.7
        # yarn twist: fine diagonal ridges along the leg
        twist = 0.5 + 0.5 * np.sin(2 * np.pi * (V * 4.5 + sgn * (U - uc) * 2.2))
        legs.append(prof * lift * (0.82 + 0.18 * twist))
    h = np.maximum(legs[0], legs[1])
    sv = 1 + 0.5 * (rng.random((ny, nx)) - 0.5) * 0.3     # per-stitch looseness
    h = h * sv[J, I]
    tone = 1 + 0.12 * (rng.random((ny, nx))[J, I] - 0.5)
    fib = pfield(rng, size, 0.9, 0.9)
    h = h + 0.02 * fib
    return h, tone, fib, dict(base=0.62, ao=0.7, ns=1.9, rough=0.9, scale=[0.35, 0.45])


SETS = [
    ('cloth.weave.plain', plain, 11, 'plain weave, 64 threads a tile', 'cloth'),
    ('cloth.weave.twill', twill, 12, '2/2 twill, 64 threads a tile', 'cloth'),
    ('cloth.weave.canvas', canvas, 13, 'heavy plain weave, 40 threads a tile, slubs and wander', 'cloth'),
    ('cloth.weave.burlap', burlap, 14, 'loose coarse weave, 28 threads a tile, open gaps', 'cloth'),
    ('cloth.felt', felt, 15, 'pressed fibre mat', 'cloth'),
    ('cloth.knit', knit, 16, 'stockinette knit, 24 wales x 32 courses a tile', 'cloth'),
]


def build(sid, fn, seed, desc, family, size):
    rng = np.random.default_rng(seed)
    h, tone, fib, p = fn(size, rng)
    rgb, hn = finish(h, tone, fib, p['base'], p['ao'])
    n = normal_from(h, p['ns'], size)
    r = np.clip(p['rough'] + (0.5 - hn) * 0.12 + 0.03 * fib, 0.3, 1.0)
    out = os.path.join(ROOT, 'core/materials/library', sid)
    os.makedirs(out, exist_ok=True)
    u8 = lambda a: (np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)
    Image.fromarray(u8(rgb)).save(os.path.join(out, 'albedo.jpg'), quality=92, subsampling=0, optimize=True)
    Image.fromarray(u8(n * 0.5 + 0.5)).save(os.path.join(out, 'normal.png'), optimize=True)
    Image.fromarray(u8(r), 'L').save(os.path.join(out, 'roughness.png'), optimize=True)
    meta = {
        'record': {'id': sid, 'family': family, 'colour': '#ffffff', 'roughness': p['rough'], 'metal': 0,
                   'scale': p['scale'], 'tint': True, 'doubleSided': True},
        'maps': {'map': 'albedo.jpg', 'normalMap': 'normal.png', 'roughnessMap': 'roughness.png'},
        'source': {'generator': 'procedural: tools/textures/make_cloth.py', 'description': desc, 'seed': seed,
                   'licence': 'generated by script for this project (CC0)'},
        'processing': {'script': 'tools/textures/make_cloth.py', 'version': VERSION,
                       'options': {'size': size, 'albedo': 'near-neutral grey, tint by culture'}, 'tiles': 'exact by construction'},
    }
    with open(os.path.join(out, 'meta.json'), 'w') as fh:
        json.dump(meta, fh, indent=1, sort_keys=True)
    seam = float(np.abs(rgb[:, 0] - rgb[:, -1]).mean() / (np.abs(np.diff(rgb, axis=1)).mean() + 1e-6))
    print('%-20s %s  seam x %.2f' % (sid, desc, seam))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--only'); ap.add_argument('--size', type=int, default=1024)
    a = ap.parse_args()
    for s in SETS:
        if not a.only or s[0] == a.only:
            build(*s, a.size)


if __name__ == '__main__':
    main()
