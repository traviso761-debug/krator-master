#!/usr/bin/env python3
"""Card sheets against the cells the builds cut from them (the owner, 2026-10-26: "many cutout textures seem to be loading
as a sheet rather than discretely").

A library card (core/materials/library/card.*/albedo.png) is either one plant or a sheet of several (3x3, 3x1...). A build
names the plant it draws in its materials.json slot: `"cell": [x0, y0, x1, y1]` (BIO.libSwap cuts the texture to it), or
`"sheet": "geometry"` when its card geometry carries the cells in its own uv (core/biome BIO.geo.cells; the Cut's cards).
This finds each image's grid from its alpha (a sheet cut n x n has near-empty bands along its cell lines) and reports:

  WHOLE SHEET   a sheet drawn whole on one card (no cell, no "sheet": "geometry"): a grid of plants on every card
  CELL ON ONE   a cell cut from an image that holds one plant: the card shows a fragment of it
  CELL OFF GRID a cell that does not cover one plant of the sheet (it straddles two, or holds none)

  python3 tools/textures/check_cells.py                 every materials.json under biomes/, kits/, settlements/, openworld/
  python3 tools/textures/check_cells.py biomes/nhighlands [...]
  --strict   exit 1 on any fault (test_all can take it once the final rebuild has fixed the builds)
"""
import glob, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB = os.path.join(ROOT, 'core', 'materials', 'library')
_cache = {}


def runs(cover, gap):
    """the occupied runs of a coverage profile (index ranges), split at gaps of at least `gap` empty samples"""
    out, start, empty = [], None, 0
    for i, c in enumerate(cover):
        if c:
            if start is None:
                start = i
            empty = 0
        elif start is not None:
            empty += 1
            if empty >= gap:
                out.append((start, i - empty + 1))
                start, empty = None, 0
    if start is not None:
        out.append((start, len(cover) - empty))
    return out


def grid(lib):
    """(columns, rows) of a library card's grid, each a list of (lo, hi) cell fractions (one each for a single plant); None
    when the image is missing or still an LFS pointer"""
    if lib in _cache:
        return _cache[lib]
    from PIL import Image
    path = os.path.join(LIB, lib, 'albedo.png')
    g = None
    try:
        im = Image.open(path).convert('RGBA')
        n = 192
        a = im.getchannel('A').resize((n, n), Image.BOX)
        px = a.load()
        col = [sum(1 for y in range(n) if px[x, y] > 24) / n for x in range(n)]
        row = [sum(1 for x in range(n) if px[x, y] > 24) / n for y in range(n)]

        def divisions(cover):
            """how many cells an axis is cut into: the first n (3, then 2) whose cell lines run through near-empty bands
            (each band's coverage under a quarter of the mean); 1 when none does"""
            mean = sum(cover) / len(cover) or 1
            for k in (3, 2):
                bands = []
                for j in range(1, k):
                    c = int(j * n / k)
                    lo, hi = max(0, c - 3), min(n, c + 4)
                    bands.append(min(cover[lo:hi]))
                if all(v < .25 * mean for v in bands):
                    return k
            return 1
        nc, nr = divisions(col), divisions(row)
        # most library sheets are square grids, and overlapping plants can hide one axis's lines; a strip (bracken's three
        # fronds) is k x 1. Both readings are kept: a cell is right if it holds one plant under either
        g = [([(i / nc, (i + 1) / nc) for i in range(nc)], [(i / nr, (i + 1) / nr) for i in range(nr)])]
        if nc != nr:
            k = max(nc, nr)
            g.append(([(i / k, (i + 1) / k) for i in range(k)], [(i / k, (i + 1) / k) for i in range(k)]))
    except Exception:
        g = None
    _cache[lib] = g
    return g


def check_build(mj):
    with open(mj, encoding='utf-8') as f:
        d = json.load(f)
    fams = d.get('families', d)
    rel = os.path.relpath(mj, ROOT).replace(os.sep, '/')
    out = []
    for slot, e in sorted(fams.items()):
        if not isinstance(e, dict) or not str(e.get('lib', '')).startswith('card.'):
            continue
        g = grid(e['lib'])
        if g is None:
            continue
        cols, rows = g[-1]
        many = len(cols) > 1 or len(rows) > 1
        cell = e.get('cell')
        if cell is None:
            if many and e.get('sheet') != 'geometry':
                out.append(('WHOLE SHEET', rel, slot, e['lib'], '%dx%d plants, no cell' % (len(cols), len(rows))))
            continue
        if not many:
            out.append(('CELL ON ONE', rel, slot, e['lib'], 'one plant; cell %s' % cell))
            continue
        # the cell must hold exactly one column and one row of the grid (a plant), mostly inside it, under some reading
        def inside(rs, lo, hi):
            return [r for r in rs if min(hi, r[1]) - max(lo, r[0]) > .5 * (r[1] - r[0])]
        if not any(len(inside(c, cell[0], cell[2])) == 1 and len(inside(r, cell[1], cell[3])) == 1 for c, r in g):
            out.append(('CELL OFF GRID', rel, slot, e['lib'], 'cell %s is not one plant of a %dx%d sheet' % (cell, len(cols), len(rows))))
    return out


def main(argv):
    strict = '--strict' in argv
    dirs = [a for a in argv if not a.startswith('--')]
    if dirs:
        files = [os.path.join(ROOT, d, 'materials.json') for d in dirs]
    else:
        files = []
        for top in ('biomes', 'kits', 'settlements', 'openworld'):
            files += glob.glob(os.path.join(ROOT, top, '**', 'materials.json'), recursive=True)
        files = [f for f in files if os.sep + 'dist' + os.sep not in f and os.sep + 'archive' + os.sep not in f]
    faults = []
    for f in sorted(files):
        if os.path.isfile(f):
            faults += check_build(f)
    for k, rel, slot, lib, why in faults:
        print('%-13s %-48s %-14s %-26s %s' % (k, rel, slot, lib, why))
    print('card cells: %d fault(s) in %d materials.json' % (len(faults), len(files)))
    return 1 if strict and faults else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
