#!/usr/bin/env python3
"""Card cut-outs against the plants in their images and the geometry that draws them (the owner, 2026-10-26: "many cutout
textures seem to be loading as a sheet rather than discretely"; 2026-10-27: "these imposters improperly split the cutout
textures. this seems to keep happening").

A library card (core/materials/library/card.*/albedo.png) is one plant or a sheet of several (3x3, 3x1, uneven boxes). A
build's materials.json slot names the plant it draws: `"cell": [x0, y0, x1, y1]` (fractions from the image's top left:
BIO.libSwap windows the texture to it) or `"sheet": "geometry"` (its card geometry carries a sheet's cells in its own uv:
BIO.geo.cells), and `"base"` (bottom, top, left, right, centre): the edge of the cell where its plant attaches. A core
geometry that holds its plant by one end (BIO.geo.frond, ribbon, hang: their stem or hung end at v 0; the clump's tripod, which
shows its image upside down) is turned by BIO.def so that end meets the base, and a frond or ribbon spans the plant once
instead of a copy a segment (core/biome/20-core-kit.js, "A LIBRARY CARD ON ITS GEOMETRY'S AXES").

This measures each image's plants (the even grid from the alpha's empty bands, or uneven boxes; within each cell, the plant's
tight alpha box) and its plants' bases (a single plant's from its meta.json `processing.options.anchor`, which cards.py cropped
it to; a sheet's from card-bases.json beside the library, set by hand), reads which geometry draws each slot from the build's
own src/ (the BIO.def line that names the slot's material), and reports, with the cut it proposes:

  WHOLE SHEET    a sheet drawn whole on one card (no cell, no "sheet": "geometry"): a grid of plants on every card
  CELL CUTS      a cell that cuts into its plant (a fragment of it: the old CELL ON ONE, a cell cut from a single plant)
  CELL OFF GRID  a cell that holds no one plant of the sheet (it straddles two, or holds none)
  LOOSE          a single plant drawn whole, or a cell much wider than its plant, on a geometry that holds it by one end: the
                 margin hangs the plant away from its stem
  NO BASE        a geometry that holds its plant by one end, and no "base": the plant is drawn sideways, upside down, or
                 a copy a segment (the Rift's floating fern fronds, 2026-10-27)
  BASE WRONG     a "base" other than the plant's
  BASE UNKNOWN   a sheet's plant on such a geometry whose base is not in card-bases.json: look at the image and add it

  python3 tools/textures/check_cells.py                 every materials.json under biomes/, kits/, settlements/, openworld/
  python3 tools/textures/check_cells.py biomes/nhighlands [...]
  --fix      write the proposed cell and base into the named builds' materials.json (not a WHOLE SHEET on a crown: that
             takes "sheet": "geometry" and BIO.geo.cells in the build's code); --slots=a,b only those slots. Look at each
             proposal first (a sheet whose plants overlap can be read wrong: --plants), then tools/textures/pack.py <build>,
             rebuild, and look at the items in the page
  --plants   print each named card's plants (boxes, bases), e.g. --plants card.fern card.sword
  --strict   exit 1 on any fault (test_all can take it once the final rebuild has fixed the builds)
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB = os.path.join(ROOT, 'core', 'materials', 'library')
BASES = os.path.join(LIB, 'card-bases.json')
_cache, _plants = {}, {}
EDGES = ('left', 'top', 'right', 'bottom', 'centre')
ANCHOR = {'bottom': 'bottom', 'top': 'top', 'center': 'centre', 'centre': 'centre'}   # cards.py crop anchor -> base

# the geometries the core declares (30-core-foliage.js, geo.userData.card): where each holds its plant, and whether a library
# plant spans it once. 'sheet': cut into a sheet's cells (never turned); 'stem': a spray or leaf card on its own stem point
# (31b-core-leafset.js, which places the image itself); 'flat': a mat or bloom seen from above or across (no end)
GEO = [('cells', r'geo\.cells\(|\bSHEET\('), ('stem', r'geo\.spray\(|geo\.leafCard\(|stem\s*:'),
       ('frond', r'geo\.frond\('), ('ribbon', r'geo\.ribbon\('), ('hang', r'geo\.hang\('), ('clump', r'geo\.clump\('),
       ('flat', r'geo\.mat\(|geo\.bloom\(')]
HOLDS = {'frond': 'top', 'ribbon': 'top', 'hang': 'top', 'clump': 'top'}   # the edge of the uv that holds the plant
ONE_END = ('frond', 'ribbon', 'hang')   # a plant held by one end: its cell and base matter most


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


def alpha(lib, n):
    from PIL import Image
    im = Image.open(os.path.join(LIB, lib, 'albedo.png')).convert('RGBA')
    return im.getchannel('A').resize((n, n), Image.BOX)


def grid(lib):
    """the readings of a library card's grid: [(columns, rows)], each a list of (lo, hi) cell fractions (one each for a single
    plant); the first is the grid read from the alpha, the last the uneven boxes when there are any. None when the image is
    missing or still an LFS pointer"""
    if lib in _cache:
        return _cache[lib]
    g = None
    try:
        n = 192
        px = alpha(lib, n).load()
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

        def uneven(cover):
            """the plants along an axis when they are not on an even grid (2026-10-27: the Rift's croton sheet, three leaves 3
            across at uneven widths, passed as one plant): runs of cover separated by near-empty bands (under 15% of the mean, at
            least 4 samples wide), each run at least 15% of the axis; read only where the even grid saw one plant"""
            mean = sum(cover) / len(cover) or 1
            rs = [r for r in runs([c > .15 * mean for c in cover], 4) if r[1] - r[0] >= .15 * n]
            return [(a / n, b / n) for a, b in rs]
        uc, ur = (uneven(col), uneven(row)) if nc == 1 and nr == 1 else ([], [])
        if len(uc) > 1 or len(ur) > 1:
            g.append((uc or [(0, 1)], ur or [(0, 1)]))
    except Exception:
        g = None
    _cache[lib] = g
    return g


def hand_bases():
    if '_bases' not in _plants:
        try:
            with open(BASES, encoding='utf-8') as f:
                _plants['_bases'] = {k: v for k, v in json.load(f).items() if not k.startswith('_')}
        except FileNotFoundError:
            _plants['_bases'] = {}
    return _plants['_bases']


def meta_anchor(lib):
    try:
        with open(os.path.join(LIB, lib, 'meta.json'), encoding='utf-8') as f:
            return json.load(f).get('processing', {}).get('options', {}).get('anchor')
    except (OSError, ValueError):
        return None


def plants(lib):
    """a card's plants: [{'box': [x0, y0, x1, y1], 'base': edge or None}], row by row from the top left; each box the plant's
    tight alpha box inside its cell (specks under 3 px of 512 dropped), padded half a percent. None when the image is missing"""
    if lib in _plants:
        return _plants[lib]
    g = grid(lib)
    if g is None:
        _plants[lib] = None
        return None
    cols, rows = g[-1] if len(g[0][0]) * len(g[0][1]) == 1 else g[0]   # the uneven boxes, where the even grid saw one plant
    if len(cols) != len(rows) and len(g) > 1:
        # one axis saw no lines: plants touching across them (card.paddle's leaves, card.weeper's plumes, 3 x 3 sheets read as
        # 3 x 1). It is a sheet, not a strip, when the cover along that axis dips at the square grid's lines to under 3/4 of the
        # cover at its cells' middles (a strip's frond runs through them unbroken)
        k = max(len(cols), len(rows))
        px = alpha(lib, 192).load()
        n = 192
        ax = [sum(1 for x in range(n) if px[x, y] > 24) for y in range(n)] if len(rows) < k else [sum(1 for y in range(n) if px[x, y] > 24) for x in range(n)]
        mids = [sum(ax[max(0, int((i + .5) * n / k) - 6):int((i + .5) * n / k) + 7]) / 13 for i in range(k)]
        lines = [min(ax[max(0, int(j * n / k) - 4):int(j * n / k) + 5]) for j in range(1, k)]
        if min(mids) > 0 and all(v < .75 * min(mids) for v in lines):
            cols, rows = g[1]
    import numpy as np
    n = 512
    a = np.asarray(alpha(lib, n)) > 24

    def cut(i0, i1, j0, j1, depth=0):
        """the plants in a region: its tight box, split again at an empty band across it (an XY cut: the grid misses a sheet's
        rows when its plants overlap the even lines, as the bloom sheet's two by three); specks under 3 px dropped"""
        sub = a[j0:j1, i0:i1]
        cx, cy = np.nonzero(sub.sum(0) >= 3)[0], np.nonzero(sub.sum(1) >= 3)[0]
        if not len(cx) or not len(cy):
            return []
        i0, i1, j0, j1 = i0 + cx[0], i0 + cx[-1] + 1, j0 + cy[0], j0 + cy[-1] + 1
        if depth < 4:
            sub = a[j0:j1, i0:i1]
            for axis, lo, hi in ((0, i0, i1), (1, j0, j1)):
                prof = sub.sum(axis)
                empty = prof <= max(2, .02 * prof.mean())
                # the widest empty band at least 1.5% of the image wide, both sides holding a plant at least 12% of the image
                best, k = None, 0
                while k < len(empty):
                    if empty[k]:
                        e = k
                        while e < len(empty) and empty[e]:
                            e += 1
                        if e - k >= .015 * n and k >= .12 * n and len(empty) - e >= .12 * n and (best is None or e - k > best[1] - best[0]):
                            best = (k, e)
                        k = e
                    else:
                        k += 1
                if best:
                    m = lo + (best[0] + best[1]) // 2
                    if axis == 0:
                        return cut(i0, m, j0, j1, depth + 1) + cut(m, i1, j0, j1, depth + 1)
                    return cut(i0, i1, j0, m, depth + 1) + cut(i0, i1, m, j1, depth + 1)
        return [(i0, i1, j0, j1)]
    out = []
    for (y0, y1) in rows:
        for (x0, x1) in cols:
            for i0, i1, j0, j1 in cut(int(round(x0 * n)), int(round(x1 * n)), int(round(y0 * n)), int(round(y1 * n))):
                p = .005
                box = [max(0., i0 / n - p), max(0., j0 / n - p), min(1., i1 / n + p), min(1., j1 / n + p)]
                out.append({'box': [round(float(v), 3) for v in box], 'base': None})
    out.sort(key=lambda q: (round((q['box'][1] + q['box'][3]) * 4), q['box'][0]))   # row by row from the top left
    hb = hand_bases().get(lib)
    if len(out) == 1:
        out[0]['base'] = ANCHOR.get(meta_anchor(lib))
    if isinstance(hb, str):
        for p in out:
            p['base'] = hb
    elif isinstance(hb, list):
        for p, b in zip(out, hb):
            p['base'] = b
    _plants[lib] = out
    return out


def overlap(c, b):
    """the fraction of box b inside box c"""
    w = max(0, min(c[2], b[2]) - max(c[0], b[0])) * max(0, min(c[3], b[3]) - max(c[1], b[1]))
    return w / max(1e-9, (b[2] - b[0]) * (b[3] - b[1]))


def centre_plant(ps):
    return min(ps, key=lambda p: abs((p['box'][0] + p['box'][2]) / 2 - .5) + abs((p['box'][1] + p['box'][3]) / 2 - .5))


# ------------------------------------------------------------------ which geometry draws a slot (the build's own source)
def lib_branch(rest):
    """`X.LIB.k ? libGeo : procGeo` -> the library branch, as far as the matching ':' at depth 0"""
    m = re.search(r'LIB\.\w+(?:&&[^?]*)?\?', rest)
    if not m:
        return rest
    d, i = 0, m.end()
    for j in range(i, len(rest)):
        ch = rest[j]
        if ch in '([{':
            d += 1
        elif ch in ')]}':
            d -= 1
        elif ch == ':' and d == 0:
            return rest[i:j]
    return rest


def geometry(build_dir):
    """{material key: set of geometry kinds} from the build's BIO.def lines; 'other' for a kit's own geometry"""
    kinds = {}
    for f in sorted(glob.glob(os.path.join(build_dir, 'src', '*.js'))):
        with open(f, encoding='utf-8', errors='replace') as fh:
            for line in fh:
                for m in re.finditer(r"BIO\.def\(\s*['\"][^'\"]+['\"]\s*,(.*?)(?=BIO\.def\(|$)", line):
                    rest = m.group(1)
                    # the geometry expression runs to the material: the first top-level comma
                    d, cut = 0, len(rest)
                    for j, ch in enumerate(rest):
                        if ch in '([{':
                            d += 1
                        elif ch in ')]}':
                            d -= 1
                        elif ch == ',' and d == 0:
                            cut = j
                            break
                    gexpr, mexpr = lib_branch(rest[:cut]), rest[cut + 1:]
                    kind = next((k for k, rx in GEO if re.search(rx, gexpr)), 'other')
                    mm = re.match(r'\s*([\w.$\[\]\'"]+)', mexpr)
                    if not mm:
                        continue
                    key = re.split(r'[.\[]', mm.group(1).replace("'", '').replace('"', '').rstrip(']'))[-1]
                    kinds.setdefault(key, set()).add(kind)
    return kinds


def kinds_of(slot, gk):
    if slot in gk:
        return gk[slot]
    base = re.sub(r'\d+$', '', slot)   # a variant's slot (hang1: the pool of 'hang', core/biome 32-core-variants.js)
    return gk.get(base, set())


# ------------------------------------------------------------------ the check
def check_slot(slot, e, ks):
    """[(fault, why, proposal)] for one card slot; proposal a dict of the fields to set (None: needs code or an eye)"""
    ps = plants(e['lib'])
    if not ps:
        return []
    out = []
    many = len(ps) > 1
    held = [k for k in ks if k in HOLDS]
    one_end = any(k in ONE_END for k in ks)
    cell = e.get('cell')
    sheet_geo = e.get('sheet') == 'geometry' or 'cells' in ks
    plant = None
    if cell is None:
        if many and not sheet_geo:
            if one_end or not ks & {'clump', 'stem', 'cells'}:
                plant = centre_plant(ps)
                out.append(('WHOLE SHEET', '%d plants, no cell' % len(ps), {'cell': plant['box']}))
            else:
                out.append(('WHOLE SHEET', '%d plants, no cell (a crown: "sheet": "geometry" and BIO.geo.cells in the code)' % len(ps), None))
                return out
        elif many:
            return out
        else:
            plant = ps[0]
            b = plant['box']
            if one_end and max(b[0], b[1], 1 - b[2], 1 - b[3]) > .06:
                out.append(('LOOSE', 'one plant drawn whole, its box %s' % b, {'cell': b}))
    else:
        if sheet_geo:
            out.append(('CELL OFF GRID', 'a cell on a geometry that cuts the sheet itself', None))
            return out
        # a cell given back to front (x0 > x1 or y0 > y1) mirrors its plant: kept in what is proposed
        fx, fy = cell[0] > cell[2], cell[1] > cell[3]
        c = [min(cell[0], cell[2]), min(cell[1], cell[3]), max(cell[0], cell[2]), max(cell[1], cell[3])]

        def as_cell(b):
            return [b[2] if fx else b[0], b[3] if fy else b[1], b[0] if fx else b[2], b[1] if fy else b[3]]
        best = max(ps, key=lambda p: overlap(c, p['box']))
        holds = [p for p in ps if overlap(c, p['box']) > .5]
        if many and len(holds) != 1:
            plant = best
            out.append(('CELL OFF GRID', 'cell %s holds %d plants' % (cell, len(holds)), {'cell': as_cell(best['box'])}))
        else:
            plant = holds[0] if holds else best
            b = plant['box']
            if overlap(c, b) < .9:
                out.append(('CELL CUTS', 'cell %s shows %d%% of its plant %s' % (cell, round(100 * overlap(c, b)), b), {'cell': as_cell(b)}))
            elif one_end and max(b[0] - c[0], b[1] - c[1], c[2] - b[2], c[3] - b[3]) > .06:
                out.append(('LOOSE', 'cell %s is much wider than its plant %s' % (cell, b), {'cell': as_cell(b)}))
        if (fx or fy) and held:
            out.append(('BASE WRONG', 'a mirrored cell on a geometry the core turns: give the plain cell and a base', None))
            return out
    if plant is None or not held:
        return out
    want, has = plant['base'], e.get('base')
    if want is None:
        if one_end and has is None:
            out.append(('BASE UNKNOWN', 'a %s holds its plant by one end; add %s to card-bases.json' % ('/'.join(sorted(held)), e['lib']), None))
        return out
    if has is None:
        if one_end or (want in ('bottom', 'left', 'right')):   # a clump shows a centre spray either way up
            out.append(('NO BASE', 'the plant attaches at its %s; a %s holds it at its top' % (want, '/'.join(sorted(held))), {'base': want}))
    elif has != want:
        out.append(('BASE WRONG', 'base %s, the plant attaches at its %s' % (has, want), {'base': want}))
    return out


def check_build(mj, fix=False, only=None):
    with open(mj, encoding='utf-8', newline='') as f:
        raw = f.read()
    d = json.loads(raw)
    fams = d.get('families', d)
    rel = os.path.relpath(mj, ROOT).replace(os.sep, '/')
    gk = geometry(os.path.dirname(mj))
    out, changed = [], False
    for slot, e in sorted(fams.items()):
        if not isinstance(e, dict) or not str(e.get('lib', '')).startswith('card.'):
            continue
        ks = kinds_of(slot, gk)
        for fault, why, prop in check_slot(slot, e, ks):
            out.append((fault, rel, slot, e['lib'], '/'.join(sorted(ks)) or '-', why, prop))
            if fix and prop and (only is None or slot in only):
                e.update(prop)
                changed = True
    if fix and changed:
        # written back in the file's own layout (json.dumps indent 1, as the builds write it); a file in any other is left alone
        style = next((ea for ea in (False, True) if json.dumps(json.loads(raw), indent=1, ensure_ascii=ea) + '\n' == raw), None)
        if style is None:
            print('%s: not in json.dumps(indent=1) layout; make the changes above by hand' % rel)
        else:
            with open(mj, 'w', encoding='utf-8', newline='\n') as f:
                f.write(json.dumps(d, indent=1, ensure_ascii=style) + '\n')
    return out


def main(argv):
    strict, fix = '--strict' in argv, '--fix' in argv
    if '--plants' in argv:
        for lib in [a for a in argv if a.startswith('card.')]:
            print(lib, json.dumps(plants(lib)))
        return 0
    dirs = [a for a in argv if not a.startswith('--')]
    if fix and not dirs:
        print('--fix takes the builds to fix by name')
        return 2
    if dirs:
        files = [os.path.join(ROOT, d, 'materials.json') for d in dirs]
    else:
        files = []
        for top in ('biomes', 'kits', 'settlements', 'openworld'):
            files += glob.glob(os.path.join(ROOT, top, '**', 'materials.json'), recursive=True)
        files = [f for f in files if os.sep + 'dist' + os.sep not in f and os.sep + 'archive' + os.sep not in f]
    only = next((set(a.split('=', 1)[1].split(',')) for a in argv if a.startswith('--slots=')), None)
    faults = []
    for f in sorted(files):
        if os.path.isfile(f):
            faults += check_build(f, fix, only)
    for k, rel, slot, lib, ks, why, prop in faults:
        print('%-13s %-42s %-12s %-24s %-12s %s%s' % (k, rel, slot, lib, ks, why, ('  -> ' + json.dumps(prop)) if prop else ''))
    print('card cells: %d fault(s) in %d materials.json%s' % (len(faults), len(files), ' (fixed where a cut was proposed)' if fix else ''))
    return 1 if strict and faults else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
