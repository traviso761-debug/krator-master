#!/usr/bin/env python3
"""Bake the scale model's geology: a province per cell, a prospectivity byte per resource family per cell, the
river-carried placers and the ringed evaporite basins, as one data file the Resources kit, the open world and Godot read
the same (kits/resources/PLACEMENT-RESEARCH.md, features 1 and 3; kits/resources/GEOLOGY.md is the format).

    python3 tools/scale-model/geology.py <page.html> <regions dir> <settlements dir> <out.json> [--preview <dir>]
    python3 tools/scale-model/geology.py --carbonate <geology.json> <regions> [--shift dx,dy]

<page.html>        the scale model page as saved (Artifact read); its DATA object holds the rasters
<regions dir>      the artifact's `regions` collection (a folder of one JSON per document, or one JSON list)
<settlements dir>  the artifact's `settlements` collection, the same way
<out.json>         kits/resources/data/geology.json
--preview <dir>    also write province.png and one PNG per family there (for the eye; not shipped)
--carbonate        add the carbonate province and the limestone layer to a bake made before them, in place, leaving every
                   other byte as it was: <regions> is a collection as above or a region store (model/src/51-region-store.js,
                   its default regions); --shift moves the regions' px onto the bake's canvas (-272,-330 takes 5.1's onto 4.23's)

Reads (never edits) the page: the heights `h` and water `wl` (the half-resolution grid, ~4 km a cell: the grid this bake
writes on), rain `p`, the mean temperature `tm`, `DATA.vents`, `DATA.basins`, `DATA.palaeolakes`, `DATA.dams`,
`DATA.rivers`, and the regions (political, geographic, biome layers) and settlements of the artifact's database.

The provinces (one byte a cell; bit 7 = Ancient-ruin ground, over the geology):
  0 water  1 sedimentary basin  2 crystalline upland (and the airless rim)  3 volcanic arc or vent field  4 evaporite
  5 rift  6 carbonate (a limestone and dolomite platform: carbonate())
The families: the ore kinds of kits/resources (42r-res-ore.js RES_ORE.kinds), four that only the ledger reads
(stone, clay, wood, water: the basics every polity needs within a day's travel), and the rock layers no node field or
ledger reads yet (limestone: biomes/KARST-SITES-5.1.md).

The node field (KRES.nodesIn, kits/resources/src/45r-res-field.js) reads the families' bytes; this bake also runs the
same field for the gold and tin lodes (KRAND, in numpy: the same integers as core/rand), so the placers it routes start
at the very nodes the page and Godot place. Deterministic: no randomness but KRAND's.
"""
import base64, glob, io, json, math, os, sys, hashlib
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

VERSION = 1
WORLD = 20261026            # the node field's world seed (KRAND.child(WORLD, 'res:' + family))
# per family: the placement cell (m) and the jitter inset (a share of the cell kept clear at each side: a minimum spacing
# of 2 x inset x cell with no neighbour reads). Rarer kinds take larger cells.
FIELD = {'iron': 3000, 'copper': 4000, 'gold': 5000, 'tin': 4000, 'silver': 5000, 'rare-earth': 6000, 'coal': 3000,
         'sulfur': 2000, 'saltpeter': 4000, 'oil': 5000, 'gypsum': 2500, 'halite': 2500, 'potash': 2500, 'alkali': 2500}
INSET = 0.15
NODE_FAMILIES = list(FIELD)
LEDGER_FAMILIES = ['stone', 'clay', 'wood', 'water']
ROCK_FAMILIES = ['limestone']
FAMILIES = NODE_FAMILIES + LEDGER_FAMILIES + ROCK_FAMILIES
PROVINCES = ['water', 'sedimentary', 'crystalline', 'volcanic', 'evaporite', 'rift', 'carbonate']
RUIN_BIT = 128
# the mask byte: bit 0 water (a lake or the sea), bit 1 cliff (the cell's slope over CLIFF), bit 2 airless (over AIRLESS_M),
# bit 3 sea (a water body of SEA_CELLS cells or more: the Ring Sea, the north-west ocean: salt water to boil)
CLIFF = 0.35                # rise over run across one cell (~1,400 m in 4 km)
AIRLESS_M = 8000.0
SEA_CELLS = 5000
# volcanic provinces by name (biome layer, lower case) beside the vents: the Throne, the Godthrone, Korona, the rift's rims
VOLCANIC_REGIONS = ('throne/volcano', 'godthrone', 'korona / ne', 'rift rim n', 'rift rim s', 'godstep valley')
RIFT_REGIONS = ('rift', 'the rift')
RUIN_REGIONS = ('ruins of nazar',)
RUIN_TYPES = ('ruin', 'ruined arcology')
RUIN_KM = 12.0
UPLAND_M = 5000.0           # crystalline upland: higher than this (a high flat shelf is plateau sediment, not shield),
UPLAND_RELIEF = 1000.0      # or more relief than this in a 5x5 window (~20 km): ranges, scarps, the walls
# evaporites: the closed basins' dry strand rings (gypsum at the rim, halite inside, potash and alkali at the last-dry
# margin by the brine), and the old dam lakes' trapped water, which evaporated
STRAND_M = 120.0
BURIED_SALT = 40.0          # the bedded rock salt's byte under a flat, dry sedimentary basin
BASIN_I = {'salt lake': 1.0, 'unbalanced': 0.6}
PALAEO_I = 0.5
SODA_REGIONS = ('the catch',)   # the owner: the Catch's brine is alkaline (volcanic rock), biomes/catch/PLAN.md 6a
# placers: walked down every river and wadi from its source
PICK_KM = 6.0               # a lode node this near a vertex feeds the river's load
DECAY_KM = 60.0             # the load's e-folding length downstream
FLAT = 0.4                  # a drop where the slope falls under FLAT x the slope of the three segments above it
MIN_UP = 1.5                # m/km: ... and that upstream slope was at least this
PLACER_GAP_KM = 10.0        # no two placers of one kind closer along one river
PLACER_MIN = 0.35           # the smallest load dropped as a placer (a low-grade node's yield is 0.5)
PLACER_FAMILIES = ('gold', 'tin')
# carbonate (the owner, 2026-11-03; biomes/KARST-SITES-5.1.md): read from the bake's own layers and the biome regions only, so
# a full bake and --carbonate on a saved one give the same bytes. The platforms are the old marine carbonate the lore names
# (the Hykkousoi limestone, the Neo-Ozarks' dolomite; swhighlands' ring folds are limestone ridges among sandstones and shales)
CARBONATE_REGIONS = {'k-guilin': 1.0, 'nw bay': 0.9, 'neo-ozarks': 1.0, 'spider lake': 0.6, 'sw highlands': 0.45}
CARB_PROVINCE = 128         # a platform byte at least this makes a sedimentary or crystalline cell the carbonate province
LAKE_FRINGE = 0.6           # lake limestone and marl: the first salt a drying lake lays, outside its gypsum ring
TUFA = 0.5                  # tufa and lake carbonate round the soda lakes
RIFT_LIME = 70              # the rift fill's stromatolite limestones and marls (thin, patchy: core/terrain/STRATA-PLAN.md `rift`)
CALCRETE = 50               # caliche in semi-arid basin soils, at its most where the rain is ~400 mm

M32 = 0xFFFFFFFF
INV = 1.0 / 4294967296.0


# ---------------------------------------------------------------- KRAND in numpy (core/rand/08-core-rand.js; test_rand.py is the scalar twin)
def _imul(a, b):
    return (np.asarray(a, np.uint64) * np.asarray(b, np.uint64)) & np.uint64(M32)


def _mix32(h):
    h = np.asarray(h, np.uint64) & np.uint64(M32)
    h ^= h >> np.uint64(16); h = _imul(h, 0x85EBCA6B)
    h ^= h >> np.uint64(13); h = _imul(h, 0xC2B2AE35)
    h ^= h >> np.uint64(16)
    return h


def _step(h, v):
    v = np.asarray(np.floor(v), np.int64) & M32
    h = _imul(np.asarray(h, np.uint64) ^ v.astype(np.uint64), 0x9E3779B1)
    return ((h << np.uint64(13)) | (h >> np.uint64(19))) & np.uint64(M32)


def k_hash(seed, *vals):
    h = (np.asarray(seed, np.uint64) & np.uint64(M32)) ^ np.uint64(0x2545F491)
    for v in vals:
        h = _step(h, v)
    return _mix32(h ^ np.uint64(len(vals)))


def k_cell(seed, ix, iz):
    return k_hash(seed, ix, iz, 0x51ED)


def k_child(seed, name):
    h = 0x811C9DC5
    b = name.encode('utf-16-le')
    for k in range(0, len(b), 2):
        h = int(_imul(h ^ (b[k] | b[k + 1] << 8), 0x01000193))
    return int(k_hash(seed, h))


def k_unit(u):
    return np.asarray(u, np.float64) * INV


# ---------------------------------------------------------------- the page and the database
def load_page(path):
    html = open(path, encoding='utf8').read()
    import re
    ver = re.search(r'scale model (4\.\d+) ', html)
    for line in html.split('\n'):
        if line.startswith('const DATA = {'):
            D = json.loads(line[line.index('{'):line.rindex('}') + 1])
            D['_version'] = ver.group(1) if ver else '?'
            return D
    sys.exit('no DATA object in ' + path)


def raster(D, key):
    return np.array(Image.open(io.BytesIO(base64.b64decode(D[key]))).convert('RGB'))


def docs(folder):
    if os.path.isfile(folder):
        return json.load(open(folder, encoding='utf8'))
    out = []
    for f in sorted(glob.glob(os.path.join(folder, '*.json'))):
        d = json.load(open(f, encoding='utf8'))
        d['id'] = os.path.splitext(os.path.basename(f))[0]
        out.append(d)
    return out


def rle(a):
    """row-major bytes as (run-1, value) pairs, base64: the format GEOLOGY.md documents (runs of at most 256)"""
    v = np.asarray(a, np.uint8).ravel()
    out = bytearray()
    i, n = 0, len(v)
    change = np.flatnonzero(np.diff(v)) + 1
    starts = np.concatenate([[0], change]); ends = np.concatenate([change, [n]])
    for s, e in zip(starts, ends):
        val = int(v[s]); run = int(e - s)
        while run > 0:
            r = min(run, 256); out += bytes((r - 1, val)); run -= r
    return base64.b64encode(bytes(out)).decode('ascii')


def unrle(s, n):
    b = base64.b64decode(s); out = np.empty(n, np.uint8); k = 0
    for i in range(0, len(b), 2):
        r = b[i] + 1; out[k:k + r] = b[i + 1]; k += r
    assert k == n
    return out


def poly_mask(pts, VW, VH, su, sv, shift=(0, 0)):
    im = Image.new('L', (VW, VH), 0)
    ImageDraw.Draw(im).polygon([((x + shift[0]) * su, (y + shift[1]) * sv) for x, y in pts], fill=1)
    return np.array(im).astype(bool)


def platform_weight(regions, VW, VH, su, sv, shift=(0, 0)):
    """the carbonate platforms' weight per cell (0-1): CARBONATE_REGIONS' biome polygons, the strongest where they overlap"""
    w = np.zeros((VH, VW))
    for r in regions:
        k = r['name'].strip().lower()
        if k in CARBONATE_REGIONS and r.get('kind') == 'biome' and len(r['points']) >= 3:
            w = np.maximum(w, CARBONATE_REGIONS[k] * poly_mask(r['points'], VW, VH, su, sv, shift))
    return w


def carbonate(prov, mask, P, platform):
    """the limestone byte and the province with its carbonate cells, from the bake's layers (prov without the ruin bit).
    Five sources, the strongest wins: the platforms; lake limestone and marl outside each basin's gypsum ring; tufa round the
    soda lakes; the rift fill's thin limestones; calcrete in semi-arid basins (the aridity is saltpeter's, 200 x arid + 40 on
    evaporites)"""
    land = (mask & 1) == 0
    gyp, alk = P['gypsum'].astype(float), P['alkali'].astype(float)
    arid = np.clip((P['saltpeter'].astype(float) - 40.0 * (prov == 4)) / 200.0, 0, 1)
    plat = 255.0 * platform * ((prov == 1) | (prov == 2) | (prov == 4) | (prov == 5))
    fringe = LAKE_FRINGE * ndimage.maximum_filter(gyp, 5) * (gyp < 80)
    tufa = TUFA * ndimage.maximum_filter(alk, 3)
    rift = RIFT_LIME * (prov == 5)
    calcrete = CALCRETE * np.clip(1 - np.abs(arid - 0.4) / 0.4, 0, 1) * (prov == 1)
    lime = np.clip(np.round(np.maximum.reduce([plat, fringe, tufa, rift, calcrete]) * land), 0, 255).astype(np.uint8)
    out = prov.copy()
    out[(plat >= CARB_PROVINCE) & ((prov == 1) | (prov == 2)) & land] = PROVINCES.index('carbonate')
    return lime, out


def add_carbonate(argv):
    """--carbonate: the carbonate province and the limestone layer added to a bake made before them, in place"""
    path, src = argv[2], argv[3]
    sh = [a.split('=', 1)[1] for a in argv if a.startswith('--shift=')] or \
         [argv[k + 1] for k, a in enumerate(argv) if a == '--shift']
    shift = tuple(float(v) for v in sh[0].split(',')) if sh else (0, 0)
    data = json.load(open(path, encoding='utf-8'))
    if 'limestone' in data['families']:
        sys.exit(path + ' already has the limestone layer')
    g = data['grid']; VW, VH = g['w'], g['h']; su, sv = (VW - 1) / (g['fullW'] - 1), (VH - 1) / (g['fullH'] - 1)
    n = VW * VH
    if src.endswith('.js'):
        import re
        regions = json.loads(re.search(r'const defRegs = (\[.*?\]);\n', open(src, encoding='utf-8').read(), re.S).group(1))
    else:
        regions = docs(src)
    L = lambda k: unrle(data['layers'][k], n).reshape(VH, VW)
    prov_b, mask = L('province'), L('mask')
    P = {k: L(k) for k in ('gypsum', 'alkali', 'saltpeter')}
    lime, prov = carbonate(prov_b & 127, mask, P, platform_weight(regions, VW, VH, su, sv, shift))
    prov_b = prov | (prov_b & RUIN_BIT)
    land = (mask & 1) == 0
    data['provinces'] = PROVINCES
    data['families'] = data['families'] + ROCK_FAMILIES
    data['rockFamilies'] = ROCK_FAMILIES
    data['layers']['province'] = rle(prov_b)
    data['layers']['limestone'] = rle(lime)
    data['stats']['province_cells'] = {PROVINCES[k]: int((prov == k).sum()) for k in range(len(PROVINCES))}
    data['stats']['mean']['limestone'] = round(float(lime[land].mean()), 2)
    with open(path, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(data, fh, separators=(',', ':'), sort_keys=True)
    print('added carbonate to %s: %s, limestone mean %s' % (path, json.dumps(data['stats']['province_cells']),
                                                            data['stats']['mean']['limestone']))


def main(argv):
    if '--carbonate' in argv[1:2]:
        return add_carbonate(argv)
    if len(argv) < 5:
        sys.exit(__doc__)
    page, regs_dir, setts_dir, out = argv[1:5]
    prev = argv[argv.index('--preview') + 1] if '--preview' in argv else None
    D = load_page(page)
    lo, hi, OW, OH, VW, VH = D['lo'], D['hi'], D['fullW'], D['fullH'], D['w'], D['hh']
    su, sv = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
    CELL_KM = 2.0 / su
    h = raster(D, 'h')
    E = lo + ((h[..., 0].astype(np.int32) << 8) | h[..., 1]) / 65535 * (hi - lo)
    wl = raster(D, 'wl')
    water = wl[..., 2] > 127
    wlev = np.where(water, lo + ((wl[..., 0].astype(np.int32) << 8) | wl[..., 1]) / 65535 * (hi - lo), np.nan)
    # the full-resolution layers, sampled at each cell's centre (nearest pixel: nothing interpolated)
    jj, ii = np.mgrid[0:VH, 0:VW]
    pj = np.clip(np.round(jj / sv).astype(int), 0, OH - 1); pi = np.clip(np.round(ii / su).astype(int), 0, OW - 1)
    rain = np.array(Image.open(io.BytesIO(base64.b64decode(D['p']))).convert('L')).astype(float)[pj, pi] / 255 * 4000
    temp = np.array(Image.open(io.BytesIO(base64.b64decode(D['tm']))).convert('L')).astype(float)[pj, pi] - 90
    regions = docs(regs_dir); setts = docs(setts_dir)

    def poly(pts):
        return poly_mask(pts, VW, VH, su, sv)

    def named(names, kinds=None):
        m = np.zeros((VH, VW), bool)
        for r in regions:
            if r['name'].strip().lower() in names and (kinds is None or r.get('kind') in kinds) and len(r['points']) >= 3:
                m |= poly(r['points'])
        return m

    land = ~water
    airless = E > AIRLESS_M
    gy, gx = np.gradient(E)
    slope = np.hypot(gx, gy) / (CELL_KM * 1000)
    cliff = slope > CLIFF
    relief = ndimage.maximum_filter(E, 5) - ndimage.minimum_filter(E, 5)

    # ---- volcanic: the vents' fields and the named volcanic provinces
    ventd = np.full((VH, VW), 1e9)
    volcanic = named(VOLCANIC_REGIONS, ('biome',))
    for v in D['vents']:
        cx, cy = v['px'][0] * su, v['px'][1] * sv
        d = np.hypot(ii - cx, jj - cy) * CELL_KM
        ventd = np.minimum(ventd, d)
        reach = 10.0 + 4.0 * v.get("radius", 3)
        volcanic |= d <= reach
    rift = named(RIFT_REGIONS)
    upland = (E > UPLAND_M) | (relief > UPLAND_RELIEF) | airless
    # ---- ruin ground: the ruins' settlements and the named ruin regions
    ruin = named(RUIN_REGIONS)
    for s in setts:
        if (s.get('type') or '').lower() in RUIN_TYPES:
            ruin |= np.hypot(ii - s['px'] * su, jj - s['py'] * sv) * CELL_KM <= RUIN_KM
    soda_reg = named(SODA_REGIONS)

    # ---- evaporites: each closed basin's strand, ringed by height
    ev = {k: np.zeros((VH, VW)) for k in ('gypsum', 'halite', 'potash', 'alkali')}
    volc_share = ndimage.uniform_filter(volcanic.astype(float), 51)          # ~100 km round
    arid = np.clip((600 - rain) / 500, 0, 1)
    basins_out = []
    tri = lambda z, c, w: np.clip(1 - np.abs(z - c) / w, 0, 1)
    jobs = []
    for k, b in enumerate(D['basins']):
        if b['kind'] in BASIN_I:
            jobs.append(('basin:%d' % k, b['at_px'], b['level_m'], b['level_m'] + STRAND_M, BASIN_I[b['kind']], True, b))
    foot = {d['basin']: d['foot_m'] for d in D.get('dams') or []}
    for k, p in enumerate(D.get('palaeolakes') or []):
        jobs.append(('palaeo:%d' % k, p['seed_px'], None, foot.get(p['basin'], p['level_m']), PALAEO_I, False, p))
    for bid, at, level, top, I, wet, b in jobs:
        sj, si = int(round(at[1] * sv)), int(round(at[0] * su))
        lab, _ = ndimage.label(E <= top)
        if not (0 <= sj < VH and 0 <= si < VW) or lab[sj, si] == 0:
            continue
        dom = lab == lab[sj, si]
        km2 = b.get('km2', 0)
        rmax = max(4.0, 2.5 * math.sqrt(max(km2, 1) / math.pi) / CELL_KM + 2)
        dom &= np.hypot(ii - si, jj - sj) <= rmax
        dry = dom & land
        if not dry.any():
            continue
        base = level if wet else float(E[dry].min())
        z = np.clip((E - base) / max(top - base, 1.0), 0, 1)
        soda = np.clip(volc_share * 2.0 + arid * 0.5, 0, 1)
        soda = np.where(soda_reg, 1.0, soda)
        sd = float(soda[dry].mean())
        ev['gypsum'] = np.maximum(ev['gypsum'], np.where(dry, I * 255 * tri(z, 0.82, 0.3), 0))
        ev['halite'] = np.maximum(ev['halite'], np.where(dry, I * 255 * tri(z, 0.5, 0.3), 0))
        ev['potash'] = np.maximum(ev['potash'], np.where(dry, I * 255 * (1 - 0.3 * soda) * tri(z, 0.12, 0.25), 0))
        ev['alkali'] = np.maximum(ev['alkali'], np.where(dry, I * 255 * soda * tri(z, 0.18, 0.3), 0))
        basins_out.append({'id': bid, 'at_px': [round(at[0], 1), round(at[1], 1)], 'kind': b.get('kind', 'palaeolake'),
                           'level_m': level if level is not None else round(top, 1), 'top_m': round(top, 1),
                           'cells': int(dry.sum()), 'soda': round(sd, 3), 'intensity': I})
    evap = np.maximum.reduce([ev[k] for k in ev]) > 40

    # ---- the province
    prov = np.ones((VH, VW), np.uint8)
    prov[upland] = 2
    prov[rift] = 5
    prov[volcanic] = 3
    prov[evap] = 4
    prov[water] = 0
    V, C, S, Rf = (prov == 3), (prov == 2), (prov == 1), (prov == 5)
    margin = S & ndimage.binary_dilation(C | V, iterations=3)
    low = np.clip((1500 - E) / 1500, 0, 1)
    wet = np.clip((rain - 600) / 1200, 0, 1)
    flatness = 1 - np.clip(relief / 1500, 0, 1)
    f = {}
    f['copper'] = 210 * V + 120 * Rf + 50 * C + 10 * S
    f['silver'] = 150 * V + 110 * C + 80 * Rf
    f['gold'] = 140 * V + 110 * C + 90 * Rf
    f['sulfur'] = np.where(ventd < 40, 255 * np.exp(-ventd / 10.0), 0) + 60 * V
    f['tin'] = 180 * C + 50 * Rf + 20 * V
    f['rare-earth'] = 140 * C + 190 * Rf + 30 * V
    f['iron'] = 160 * C + 140 * margin + 60 * V + 40 * S + 70 * Rf
    coal = 230 * S * low * (0.25 + 0.75 * wet) * flatness
    f['coal'] = coal
    f['oil'] = 0.9 * ndimage.uniform_filter(coal, 11) * (0.5 + 0.5 * (margin | (S & (relief > 200) & (relief < 1200)))) + 110 * Rf * low
    f['saltpeter'] = 200 * arid + 40 * evap
    for k in ev:
        f[k] = ev[k]
    # bedded rock salt under the sedimentary basins (old seas and lakes buried: salt springs, Hallstatt): faint, but a salt
    # town's reason to be where no basin dries today
    f['halite'] = np.maximum(f['halite'], BURIED_SALT * S * flatness * (0.3 + 0.7 * arid))
    f['stone'] = 60 + 195 * np.clip(relief / 900, 0, 1) * ((prov == 2) | (prov == 3) | (prov == 5) | (S & (relief > 200)))
    riv = np.zeros((VH, VW), bool)
    for r in D['rivers']:
        for x, y in r['px']:
            j, i = int(round(y * sv)), int(round(x * su))
            if 0 <= j < VH and 0 <= i < VW:
                riv[j, i] = True
    shore = land & ndimage.binary_dilation(water, iterations=1)
    flood = riv & (slope < 0.02)
    f['clay'] = 230 * (flood | (shore & (E < 2000))) + 60 * S * wet
    f['wood'] = 255 * np.clip((rain - 350) / 700, 0, 1) * ((temp > -5) & (temp < 34) & (E < 4500))
    f['water'] = np.maximum(255 * (riv | shore), 255 * np.clip((rain - 200) / 600, 0, 1))
    hard = ~(prov == 4)
    for k in ('copper', 'silver', 'gold', 'tin', 'rare-earth', 'iron', 'coal', 'oil'):
        f[k] = f[k] * hard
    P = {}
    for k in NODE_FAMILIES + LEDGER_FAMILIES:
        a = np.clip(np.round(f[k]), 0, 255).astype(np.uint8)
        if k not in ('water',):
            a[water] = 0
        P[k] = a
    wlab, nw = ndimage.label(water)
    sizes = np.bincount(wlab.ravel())
    sea = water & (sizes[wlab] >= SEA_CELLS)
    mask = (water.astype(np.uint8)) | (cliff.astype(np.uint8) << 1) | (airless.astype(np.uint8) << 2) | (sea.astype(np.uint8) << 3)
    P['limestone'], prov = carbonate(prov, mask, P, platform_weight(regions, VW, VH, su, sv))
    prov_b = prov | np.where(ruin & land, RUIN_BIT, 0).astype(np.uint8)

    # ---- the lode nodes of the placer families: the node field itself (45r-res-field.js), on the coarse mask
    def lode_nodes(fam):
        Cm = FIELD[fam]; nx, nz = int(math.ceil(OW * 2000 / Cm)), int(math.ceil(OH * 2000 / Cm))
        iz, ix = np.mgrid[0:nz, 0:nx]
        base = k_child(WORLD, 'res:' + fam)
        s = k_cell(base, ix, iz)
        fx, fz = k_unit(k_hash(s, 2)), k_unit(k_hash(s, 3))
        x = (ix + INSET + (1 - 2 * INSET) * fx) * Cm; z = (iz + INSET + (1 - 2 * INSET) * fz) * Cm
        ci = np.floor(x / 2000.0 * su + 0.5).astype(int); cj = np.floor(z / 2000.0 * sv + 0.5).astype(int)
        ok = (ci >= 0) & (ci < VW) & (cj >= 0) & (cj < VH)
        ci, cj = np.clip(ci, 0, VW - 1), np.clip(cj, 0, VH - 1)
        p = P[fam][cj, ci].astype(int)
        keep = ok & (np.floor(k_unit(k_hash(s, 1)) * 255) < p) & ((mask[cj, ci] & 3) == 0)
        g = k_unit(k_hash(s, 4)); q = g * (1.15 - 0.5 * p / 255.0)
        yld = np.where(q < 0.15, 2.0, np.where(q < 0.55, 1.0, 0.5))
        return x[keep], z[keep], yld[keep], ix[keep], iz[keep]

    lodes = {fam: lode_nodes(fam) for fam in PLACER_FAMILIES}
    digest = {}
    for fam, (x, z, y, ix, iz) in lodes.items():
        order = np.lexsort((ix, iz))
        txt = ';'.join('%d,%d,%g' % (ix[k], iz[k], y[k]) for k in order)
        digest[fam] = {'count': int(len(x)), 'sha1': hashlib.sha1(txt.encode()).hexdigest()[:16]}

    # ---- the placers: carried down the rivers from the lodes, dropped where the gradient flattens
    rivers = D['rivers']; by_id = {r['id']: r for r in rivers}
    inflow = {r['id']: {fam: [] for fam in PLACER_FAMILIES} for r in rivers}   # (vertex index, load) handed in by tributaries
    # tributaries first: a river handing into another goes before it (a fixed order: by the length of its chain down)
    down = {}
    for r in rivers:
        n, cur, guard = 0, r, 0
        while cur['to'].get('river') in by_id and guard < 200:
            cur = by_id[cur['to']['river']]; n += 1; guard += 1
        down[r['id']] = n
    order = sorted(rivers, key=lambda r: (-down[r['id']], r['id']))
    placers = []
    lode_xy = {fam: np.stack([lodes[fam][0], lodes[fam][1]], -1) for fam in PLACER_FAMILIES}
    from scipy.spatial import cKDTree
    trees = {fam: cKDTree(lode_xy[fam]) if len(lode_xy[fam]) else None for fam in PLACER_FAMILIES}
    for r in order:
        pts = r['px']; bed = r.get('bed_m') or [0] * len(pts)
        if len(pts) < 2:
            continue
        X = np.array([p[0] * 2000.0 for p in pts]); Z = np.array([p[1] * 2000.0 for p in pts])
        seg = np.hypot(np.diff(X), np.diff(Z)) / 1000.0
        sl = np.maximum(0.0, -np.diff(np.array(bed, float))) / np.maximum(seg, 1e-3)    # m/km falling
        half = (r.get('width_m') or 60) / 2.0 + 15.0
        for fam in PLACER_FAMILIES:
            load, last = 0.0, -1e9
            tin = {k: v for k, v in inflow[r['id']][fam]}
            run = 0.0
            for k in range(len(pts)):
                if k:
                    load *= math.exp(-seg[k - 1] / DECAY_KM); run += seg[k - 1]
                load += tin.get(k, 0.0)
                if trees[fam] is not None:
                    for q in trees[fam].query_ball_point([X[k], Z[k]], PICK_KM * 1000):
                        load += float(lodes[fam][2][q]) * 0.5
                why = None
                if k >= 2:
                    up = float(np.mean(sl[max(0, k - 4):k - 1])) if k - 1 > max(0, k - 4) else float(sl[k - 2])
                    if up >= MIN_UP and sl[k - 1] < FLAT * up:
                        why = 'flatten'
                if k == len(pts) - 1:
                    why = 'confluence' if r['to'].get('river') in by_id else 'mouth'
                if why and load >= PLACER_MIN and run - last >= PLACER_GAP_KM:
                    drop = load * 0.5
                    load -= drop; last = run
                    # the bar: on the inside of the bend, past the channel's edge
                    a = max(0, k - 1); b = min(len(pts) - 1, k + 1)
                    tx, tz = X[b] - X[a], Z[b] - Z[a]; L = math.hypot(tx, tz) or 1.0
                    nx_, nz_ = -tz / L, tx / L
                    cross = 0.0
                    if 0 < k < len(pts) - 1:
                        cross = (X[k] - X[a]) * (Z[b] - Z[k]) - (Z[k] - Z[a]) * (X[b] - X[k])
                    side = -1.0 if cross > 0 else 1.0
                    px_, pz_ = X[k] + nx_ * half * side, Z[k] + nz_ * half * side
                    grade = 'high' if drop >= 2.0 else 'medium' if drop >= 0.9 else 'low'
                    placers.append({'id': 'res:placer-%s:%s:%d' % (fam, r['id'], k), 'kind': fam, 'grade': grade,
                                    'x': round(px_, 1), 'z': round(pz_, 1), 'placer': True, 'river': r['id'],
                                    'why': why, 'load': round(drop, 3)})
            if r['to'].get('river') in by_id and load > 0.05:
                R2 = by_id[r['to']['river']]; at = r['to']['at_px']
                d2 = [(p[0] - at[0]) ** 2 + (p[1] - at[1]) ** 2 for p in R2['px']]
                inflow[R2['id']][fam].append((int(np.argmin(d2)), load))
    placers.sort(key=lambda p: p['id'])

    # ---- the polities and settlements (for the ledger: 46r-res-ledger.js)
    polities = [{'name': r['name'], 'points': r['points']} for r in sorted(regions, key=lambda r: r['name'])
                if r.get('kind') == 'political' and len(r['points']) >= 3]
    settl = [{'name': s['name'], 'px': s['px'], 'py': s['py'], 'type': s.get('type')} for s in
             sorted(setts, key=lambda s: (s['name'], s['px'], s['py']))]

    stats = {'province_cells': {PROVINCES[k]: int((prov == k).sum()) for k in range(len(PROVINCES))},
             'ruin_cells': int(((prov_b & RUIN_BIT) > 0).sum()),
             'mean': {k: round(float(P[k][land].mean()), 2) for k in FAMILIES},
             'lodes': digest, 'placers': {fam: sum(1 for p in placers if p['kind'] == fam) for fam in PLACER_FAMILIES},
             'evaporite_basins': len(basins_out)}
    data = {'format': 'krator-geology', 'version': VERSION, 'source': 'Krator Scale Model ' + D['_version'],
            'grid': {'w': VW, 'h': VH, 'fullW': OW, 'fullH': OH, 'px_m': 2000, 'cell_km': round(CELL_KM, 6)},
            'provinces': PROVINCES, 'ruinBit': RUIN_BIT,
            'mask': {'water': 1, 'cliff': 2, 'airless': 4, 'sea': 8},
            'field': {'world': WORLD, 'inset': INSET, 'cells': FIELD, 'families': NODE_FAMILIES,
                      'grade': {'tilt': 0.5, 'high': 0.15, 'medium': 0.55}},
            'families': FAMILIES, 'ledgerFamilies': LEDGER_FAMILIES, 'rockFamilies': ROCK_FAMILIES,
            'layers': {'province': rle(prov_b), 'mask': rle(mask), **{k: rle(P[k]) for k in FAMILIES}},
            'placers': placers, 'basins': basins_out, 'polities': polities, 'settlements': settl, 'stats': stats}
    # the round trip, so a reader that decodes the format gets these bytes
    n = VW * VH
    assert (unrle(data['layers']['iron'], n) == P['iron'].ravel()).all()
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with open(out, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(data, fh, separators=(',', ':'), sort_keys=True)
    print('wrote %s (%.0f KB): %s' % (out, os.path.getsize(out) / 1024, json.dumps(stats['province_cells'])))
    print('placers', stats['placers'], 'lodes', digest, 'basins', len(basins_out))
    if prev:
        os.makedirs(prev, exist_ok=True)
        pal = np.array([[60, 90, 150], [200, 180, 120], [150, 150, 160], [190, 70, 40], [240, 240, 230], [70, 150, 110],
                        [120, 200, 210]], np.uint8)
        im = pal[prov]
        im[(prov_b & RUIN_BIT) > 0] = (im[(prov_b & RUIN_BIT) > 0] * 0.6 + np.array([255, 0, 255]) * 0.4).astype(np.uint8)
        Image.fromarray(im).save(os.path.join(prev, 'province.png'))
        for k in FAMILIES:
            Image.fromarray(P[k]).save(os.path.join(prev, 'p-%s.png' % k))


if __name__ == '__main__':
    main(sys.argv)
