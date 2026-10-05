#!/usr/bin/env python3
"""Split a magenta-keyed cut-out SHEET (an N x N grid of sprites on #ff00ff) into RGBA cut-outs for cards.py.

    python3 tools/textures/sheet.py SHEET.png OUT_DIR --name card-kelp [--grid 3] [--tol 0.35]

Writes OUT_DIR/<name>-<k>.png (k = 0..N*N-1, row-major, RGBA): the key is removed by chroma distance from
magenta (soft edge over `tol`), the magenta spill on edge pixels is pulled back toward the pixel's own green,
and empty cells are skipped. Requires numpy and Pillow.
"""
import argparse, os
import numpy as np
from PIL import Image


def key(a, tol):
    rgb = a[..., :3].astype(np.float32) / 255.0
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    # the key: strong red and blue, weak green; distance in a plane that ignores overall brightness
    d = np.sqrt(((r - 1) ** 2 + g ** 2 + (b - 1) ** 2) / 3.0)
    alpha = np.clip((d - tol * .35) / (tol * .65), 0, 1)
    # despill: wherever red or blue exceed green by a margin the key is showing through (a fringe, a thin stem, the
    # gaps in foliage): red and blue are clamped to the green, so nothing magenta survives for the bleed to spread
    m = np.maximum(r, b) - g
    sp = (m > 0.08) | (alpha < 0.98)
    r2 = np.where(sp, np.minimum(r, g), r); b2 = np.where(sp, np.minimum(b, g), b)
    rgb = np.stack([r2, g, b2], -1)
    # a fringe pixel that is mostly key is dropped outright
    alpha = np.where(m > 0.45, 0.0, alpha)
    out = np.concatenate([np.clip(rgb, 0, 1), alpha[..., None]], -1)
    return (out * 255 + .5).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('sheet'); ap.add_argument('out_dir'); ap.add_argument('--name', required=True)
    ap.add_argument('--grid', type=int, default=3); ap.add_argument('--tol', type=float, default=0.35)
    a = ap.parse_args()
    img = np.asarray(Image.open(a.sheet).convert('RGBA'))
    h, w = img.shape[:2]; n = a.grid
    os.makedirs(a.out_dir, exist_ok=True); k = 0
    for j in range(n):
        for i in range(n):
            cell = img[j * h // n:(j + 1) * h // n, i * w // n:(i + 1) * w // n]
            rgba = key(cell, a.tol)
            if (rgba[..., 3] > 16).mean() < 0.005:
                print('cell', j, i, 'empty, skipped'); continue
            p = os.path.join(a.out_dir, '%s-%d.png' % (a.name, k)); Image.fromarray(rgba, 'RGBA').save(p); print(p); k += 1


if __name__ == '__main__':
    main()
