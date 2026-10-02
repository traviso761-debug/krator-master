#!/usr/bin/env python3
"""Contact sheet for checking library sets: a 3x3 tiling preview and a lit preview per set.

    python3 tools/textures/preview.py OUT.jpg SET_DIR [SET_DIR ...] [--per-sheet 4] [--tint "#b8683e"]

Per set, one row: [3x3 colour tiling] [one tile, lit] [2x2 tiling, lit]. The lit panels use the set's normal
(OpenGL, +Y up) and roughness: Lambert plus a Blinn highlight from the upper left, so a wrong normal sign,
a seam in the normal map or a shiny-where-it-should-be-matt roughness all show. Seams in the colour map show
in the first panel. --tint multiplies the colour map by a colour, to see a muted set as a culture would use it.
Requires numpy and Pillow.
"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageDraw

P = 360


def load_set(d):
    meta = json.load(open(os.path.join(d, 'meta.json')))
    m = meta.get('maps', {})
    def get(k, default):
        rel = m.get(k, default)
        p = os.path.normpath(os.path.join(d, rel))
        return p
    alb = np.asarray(Image.open(get('map', 'albedo.jpg')).convert('RGB')).astype(np.float32) / 255
    nor = np.asarray(Image.open(get('normalMap', 'normal.png')).convert('RGB')).astype(np.float32) / 255
    rg = np.asarray(Image.open(get('roughnessMap', 'roughness.png')).convert('L')).astype(np.float32) / 255
    return meta, alb, nor, rg


def lit(alb, nor, rg, tint=None):
    n = nor * 2 - 1
    n /= np.maximum(np.linalg.norm(n, axis=-1, keepdims=True), 1e-6)
    L = np.array([-0.55, 0.55, 0.63]); L /= np.linalg.norm(L)
    V = np.array([0, 0, 1.0]); H = (L + V) / np.linalg.norm(L + V)
    diff = np.clip((n * L).sum(-1), 0, 1)
    r = np.clip(rg, 0.05, 1)
    shin = 2 / (r ** 4) - 2
    spec = np.clip((n * H).sum(-1), 0, 1) ** shin * (1 - r) * 0.6
    c = alb ** 2.2
    if tint is not None:
        c = c * tint ** 2.2
    out = c * (0.22 + 0.95 * diff[..., None]) + spec[..., None]
    return np.clip(out, 0, 1) ** (1 / 2.2)


def tile(a, k):
    return np.tile(a, (k, k, 1))


def to_img(a, size=P):
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)).resize((size, size), Image.LANCZOS)


def row(d, tint):
    meta, alb, nor, rg = load_set(d)
    t = None if tint is None else np.array(tint, np.float32)
    a = alb if t is None else np.clip(alb * t, 0, 1)
    p1 = to_img(tile(a, 3))
    p2 = to_img(lit(alb, nor, rg, t))
    p3 = to_img(tile(lit(alb, nor, rg, t), 2))
    return meta['record']['id'], [p1, p2, p3]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('out'); ap.add_argument('sets', nargs='+')
    ap.add_argument('--per-sheet', type=int, default=4)
    ap.add_argument('--tint')
    a = ap.parse_args()
    tint = None
    if a.tint:
        h = a.tint.lstrip('#'); tint = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    rows = [row(d, tint) for d in a.sets]
    base, ext = os.path.splitext(a.out)
    for si in range(0, len(rows), a.per_sheet):
        chunk = rows[si:si + a.per_sheet]
        sheet = Image.new('RGB', (3 * P, len(chunk) * (P + 16)), (20, 20, 20))
        d = ImageDraw.Draw(sheet)
        for i, (name, ps) in enumerate(chunk):
            y = i * (P + 16)
            d.text((6, y + 2), name, fill=(240, 240, 240))
            for k, p in enumerate(ps):
                sheet.paste(p, (k * P, y + 16))
        path = a.out if len(rows) <= a.per_sheet else '%s-%d%s' % (base, si // a.per_sheet + 1, ext or '.jpg')
        sheet.save(path, quality=88)
        print(path)


if __name__ == '__main__':
    main()
