#!/usr/bin/env python3
"""Cut one region of the Krator Scale Model out as the data an open-world build reads.

    python3 tools/scale-model/extract_region.py <page.html> <regions dir> <settlements dir> "<region name>" <out dir>

<page.html>        the scale model page as saved (Artifact read); its DATA object holds the rasters
<regions dir>      the artifact's `regions` collection: a folder of one JSON file per document (ArtifactData list with
                   out_dir), or one JSON list of them (openworld/<name>/source/regions.json)
<settlements dir>  the artifact's `settlements` collection, the same way
<region name>      the polygon that bounds the cut (a region of any layer: 'little demo')
<out dir>          openworld/<name>/data: region.json and the rasters as PNG

Map pixels are the scale model's full grid (fullW x fullH, 2 km a pixel); its heights are a half-resolution grid
(DATA.w x DATA.hh, about 4 km a pixel) that the page samples at u = px*(w-1)/(fullW-1). World coordinates: metres,
x east, z south, the origin at the region's centre pixel, so x = (px - cx)*2000, z = (py - cy)*2000.

What it writes (every raster cropped to the region's box plus a margin):
  elev.png    the heights on their own half-resolution grid, 16 bits in R,G (lo..hi as the page has them), B = water
  wlev.png    the water level there (16 bits in R,G), B = this pixel has water
  clim.png    the climate class index (DATA.climate.classes), full resolution
  rain.png    rain, 0..255 = 0..4000 mm/yr, full resolution
  temp.png    the annual mean temperature + 90 (deg C), full resolution
  scarpl.png, scarpu.png  the escarpments' floor and plateau levels per height cell, scarpw.png their weight (the open world
              makes cliffs of them)
  biome.png   the biome overlay index (region.json "biomes"), full resolution. Overlapping overlays: the smaller wins.
              A pixel no overlay covers takes the nearest overlay's index (pixel distance); a pixel of the bounding
              polygon itself is 'inside' in region.json's mask (mask.png: 255 inside, 0 outside)
  region.json the frame, the class table, the biome table, the drainage network, the settlements inside the polygon
              and the canyon candidates for each ruin (the nearest troughs in the heights: CANYON_MIN)

The drainage network: the heights are priority-flood filled (lakes and the sea are sinks), each cell drains to its
steepest neighbour (D8), and the flow is accumulated weighted by rain (mm/yr, at least RAIN_FLOOR so a desert still
gathers its wadis). A cell carrying at least CHANNEL_MIN units is a channel; channels are written as polylines from their
heads to the water or the box edge, each vertex [x, z, accum, elevation]. The open world carves its river beds and
canyons along them (openworld/<name>/src/20-world-fields.js).

Deterministic: no randomness anywhere.
"""
import base64, glob, heapq, io, json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

MARGIN = 10          # map pixels of context round the polygon's box
RIVER_W, RIVER_D = 60.0, 6.0   # a named river's width and water depth at 1:1 (m)
CHANNEL_MIN = 3.0e4  # accumulated rain-weighted cells (mm/yr x cells) that make a channel
RAIN_FLOOR = 150     # mm/yr: every cell counts at least this much, so a desert still gathers its wadis
RUIN_TYPES = ('ruin', 'ruined arcology')
SCARP_R = 6        # height cells: the disc that finds an escarpment's floor and plateau (as edit_heights.py)
SPILL_SLACK = 600  # m: a lake this far over its shore is a data error (a lake that spills over falls, as the 1,150 m one does, stands a few hundred m over it)
CANYON_MIN = (120, 150)  # m: a trough this deep one and two height cells out (about 4 and 8 km) is a canyon
# biome overlays read from the 'geographic' layer as well (named by the owner as biomes still to make)
EXTRA_BIOMES = ('e highlands',)
# which biome kit grows each overlay; None leaves it bare ground for now
KITS = {'sedesert': 'sedesert', 'e abysss': 'eastabyss', 'hyperjungle': 'hyperjungle', 'e badlands': 'ebadlands'}
WATER_OVERLAYS = ('ring sea',)


def load_page(path):
    import re
    html = open(path, encoding='utf8').read()
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
    """a collection as a folder of one JSON file per document, or one JSON list of documents (each with its 'id')"""
    if os.path.isfile(folder):
        return json.load(open(folder, encoding='utf8'))
    out = []
    for f in sorted(glob.glob(os.path.join(folder, '*.json'))):
        d = json.load(open(f, encoding='utf8'))
        d['id'] = os.path.splitext(os.path.basename(f))[0]
        out.append(d)
    return out


def poly_mask(pts, x0, y0, W, H):
    im = Image.new('L', (W, H), 0)
    ImageDraw.Draw(im).polygon([(a - x0, b - y0) for a, b in pts], fill=1)
    return np.array(im).astype(bool)


def poly_area(pts):
    s = 0.0
    for i in range(len(pts)):
        a, b = pts[i], pts[(i + 1) % len(pts)]
        s += a[0] * b[1] - b[0] * a[1]
    return abs(s) / 2


def save16(path, v, lo, hi, flag):
    q = np.clip(np.round((v - lo) / (hi - lo) * 65535), 0, 65535).astype(np.uint32)
    rgb = np.stack([(q >> 8) & 255, q & 255, np.where(flag, 255, 0)], -1).astype(np.uint8)
    Image.fromarray(rgb, 'RGB').save(path, optimize=True)


def save8(path, v):
    Image.fromarray(np.asarray(v).astype(np.uint8), 'L').save(path, optimize=True)


def drainage(E, sink, rain_w):
    """Priority-flood fill, D8 directions and rain-weighted accumulation on grid E (sink: cells that drain out)."""
    ny, nx = E.shape
    F = E.astype(np.float64).copy()
    done = np.zeros(E.shape, bool)
    pq = []
    for j in range(ny):
        for i in range(nx):
            if sink[j, i] or i == 0 or j == 0 or i == nx - 1 or j == ny - 1:
                heapq.heappush(pq, (F[j, i], j, i))
                done[j, i] = True
    N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    order = []
    while pq:
        h, j, i = heapq.heappop(pq)
        order.append((j, i))
        for dj, di in N8:
            a, b = j + dj, i + di
            if 0 <= a < ny and 0 <= b < nx and not done[a, b]:
                done[a, b] = True
                F[a, b] = max(F[a, b], h + 1e-3 * math.hypot(dj, di))   # an epsilon slope across flats
                heapq.heappush(pq, (F[a, b], a, b))
    # D8 on the filled surface: the steepest downhill neighbour (sinks and edges drain nowhere)
    rec = -np.ones(E.shape + (2,), np.int32)
    for j in range(ny):
        for i in range(nx):
            if sink[j, i] or i == 0 or j == 0 or i == nx - 1 or j == ny - 1:
                continue
            best, bj, bi = 0.0, -1, -1
            for dj, di in N8:
                a, b = j + dj, i + di
                s = (F[j, i] - F[a, b]) / math.hypot(dj, di)
                if s > best:
                    best, bj, bi = s, a, b
            rec[j, i] = (bj, bi)
    acc = rain_w.astype(np.float64).copy()
    for j, i in reversed(order):          # highest first: every cell hands its flow down before its receiver does
        a, b = rec[j, i]
        if a >= 0:
            acc[a, b] += acc[j, i]
    return F, rec, acc


def main():
    if len(sys.argv) != 6:
        sys.exit(__doc__)
    page, rdir, sdir, name, out = sys.argv[1:]
    D = load_page(page)
    R = docs(rdir)
    S = docs(sdir)
    reg = [r for r in R if r.get('name') == name]
    if not reg:
        sys.exit('no region named %r' % name)
    reg = reg[0]
    OW, OH, VW, VH = D['fullW'], D['fullH'], D['w'], D['hh']
    lo, hi = D['lo'], D['hi']
    xs = [p[0] for p in reg['points']]
    ys = [p[1] for p in reg['points']]
    x0 = int(math.floor((min(xs) - MARGIN) / 2) * 2)
    y0 = int(math.floor((min(ys) - MARGIN) / 2) * 2)
    x1 = int(math.ceil((max(xs) + MARGIN) / 2) * 2)
    y1 = int(math.ceil((max(ys) + MARGIN) / 2) * 2)
    x0, y0, x1, y1 = max(0, x0), max(0, y0), min(OW - 1, x1), min(OH - 1, y1)
    W, H = x1 - x0 + 1, y1 - y0 + 1
    cx, cy = (min(xs) + max(xs)) // 2, (min(ys) + max(ys)) // 2
    os.makedirs(out, exist_ok=True)

    # ---- heights and water, on their own grid
    su, sv = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
    i0, j0 = max(0, int(math.floor(x0 * su)) - 2), max(0, int(math.floor(y0 * sv)) - 2)
    i1, j1 = min(VW - 1, int(math.ceil(x1 * su)) + 2), min(VH - 1, int(math.ceil(y1 * sv)) + 2)
    h = raster(D, 'h')[j0:j1 + 1, i0:i1 + 1]
    elev = lo + ((h[..., 0].astype(np.int32) << 8) | h[..., 1]) / 65535 * (hi - lo)
    wflag = h[..., 2] > 127
    w = raster(D, 'wl')[j0:j1 + 1, i0:i1 + 1]
    whas = w[..., 2] > 127
    wlev = np.where(whas, lo + ((w[..., 0].astype(np.int32) << 8) | w[..., 1]) / 65535 * (hi - lo), lo)
    # A lake cannot stand above the lowest point of its own shore: it would spill. A few bodies in the model carry a
    # level kilometres over the ground round them (the abyss's floor holds pools at 0 m and -900 m over a floor near
    # -2,300 m). Each connected body standing more than SPILL_SLACK over it is clamped to its spill height: the lower quartile of the dry cells touching it, not
    # counting the box's edge (a body cut by the box continues outside it).
    # (a body is one level: two lakes at different levels can touch, the sea's edge and a pool below it)
    ring = ndimage.binary_dilation(whas, structure=np.ones((3, 3))) & ~whas
    ring[0, :] = ring[-1, :] = ring[:, 0] = ring[:, -1] = False
    spilled = 0
    bodies = []
    for lv in np.unique(np.round(wlev[whas])):
        lab, nlab = ndimage.label(whas & (np.round(wlev) == lv), structure=np.ones((3, 3)))
        bodies += [lab == k for k in range(1, nlab + 1)]
    for body in bodies:
        shore = ndimage.binary_dilation(body, structure=np.ones((3, 3))) & ring
        if not shore.any():
            continue
        spill = float(np.percentile(elev[shore], 25))   # a quarter of its shore: one low 4 km cell is not an outlet
        over = body & (wlev > spill + SPILL_SLACK)
        if over.any():
            spilled += int(over.sum())
            wlev[over] = spill
    save16(os.path.join(out, 'elev.png'), elev, lo, hi, wflag)
    save16(os.path.join(out, 'wlev.png'), wlev, lo, hi, whas)

    # ---- full-resolution rasters
    crop = lambda a: a[y0:y1 + 1, x0:x1 + 1]
    clim = crop(raster(D, 'c')[..., 0])
    rain = crop(raster(D, 'p')[..., 0])
    temp = crop(raster(D, 'tm')[..., 0])
    save8(os.path.join(out, 'clim.png'), clim)
    save8(os.path.join(out, 'rain.png'), rain)
    save8(os.path.join(out, 'temp.png'), temp)
    inside = poly_mask(reg['points'], x0, y0, W, H)
    save8(os.path.join(out, 'mask.png'), inside * 255)

    # ---- biome overlays: the smaller polygon wins an overlap; the rest of the box takes the nearest overlay
    over = [r for r in R if r.get('kind') == 'biome' or r.get('name', '').lower() in EXTRA_BIOMES]
    over = [r for r in over if poly_mask(r['points'], x0, y0, W, H).any()]
    over.sort(key=lambda r: -poly_area(r['points']))        # largest first, so a smaller one paints over it
    bmap = np.full((H, W), 255, np.uint8)
    biomes = []
    for k, r in enumerate(over):
        m = poly_mask(r['points'], x0, y0, W, H)
        bmap[m] = k
        nm = r['name'].strip()
        kit = KITS.get(nm.lower())
        biomes.append({'id': k, 'name': nm, 'doc': r['id'], 'kind': r.get('kind'), 'colour': r.get('color'),
                       'kit': kit, 'water': nm.lower() in WATER_OVERLAYS,
                       'drawn_px': int(m.sum()), 'notes': r.get('notes', '')})
    empty = bmap == 255
    filled = int(empty.sum())
    if empty.any():
        _, (iy, ix) = ndimage.distance_transform_edt(empty, return_indices=True)
        bmap = bmap[iy, ix]
    for b in biomes:
        b['px'] = int((bmap == b['id']).sum())
        b['px_in_region'] = int(((bmap == b['id']) & inside).sum())
    save8(os.path.join(out, 'biome.png'), bmap)

    # ---- the escarpments: where the land drops from a plateau to a floor (the eastern abyss's rim), the open world
    # sharpens the drop into a cliff at 1:1 (WORLD.H). Per height cell: the floor's level L and the plateau's level U
    # (low and high percentiles over a disc of SCARP_R cells, as edit_heights.py finds them) and a weight, 1 on the rim
    # band round the abyss's floor where the rise exceeds 700 m, feathered to 0. scarpl.png and scarpu.png: L and U,
    # 16 bits in R,G (lo..hi; no alpha: a canvas would premultiply it); scarpw.png: the weight, 0..255.
    abyss_b = [b for b in biomes if b['name'].lower() == 'e abysss']
    sw = np.zeros(elev.shape)
    yy_, xx_ = np.mgrid[-SCARP_R:SCARP_R + 1, -SCARP_R:SCARP_R + 1]
    disc = (xx_ * xx_ + yy_ * yy_) <= SCARP_R * SCARP_R
    Lr = ndimage.percentile_filter(elev, 8, footprint=disc)
    Ur = ndimage.percentile_filter(elev, 68, footprint=disc)
    if abyss_b:
        r = next(r for r in R if r['id'] == abyss_b[0]['doc'])
        im = Image.new('L', (elev.shape[1], elev.shape[0]), 0)
        ImageDraw.Draw(im).polygon([(a * su - i0, b * sv - j0) for a, b in r['points']], fill=1)
        apoly = np.array(im).astype(bool)
        floor = (elev < -900) & ndimage.binary_dilation(apoly, iterations=4) & ~(whas | wflag)
        band = (ndimage.distance_transform_edt(~floor) <= 6) & (ndimage.distance_transform_edt(floor) <= 3)
        # only where the model itself is steep (its escarpment, ~1,000 m or more per cell): a rim the owner keeps
        # gentle (4.17's 'east rim', the valley of Yuni's mouth) gets no cliff at 1:1 either
        gy_, gx_ = np.gradient(elev)
        steep = ndimage.maximum_filter(np.hypot(gx_, gy_), size=3)
        sw = band * np.clip((Ur - Lr - 700) / 500, 0, 1) * np.clip((steep - 500) / 400, 0, 1)
        # and never along a named river (DATA.rivers): the scale model has carved its course to fall as the owner wants
        # (the valley of Yuni's mouth is a gentle descent), and the cliff's top there would be the ranges' crests, so the
        # rule would sink the valley floor into a pit. Off within 3 cells of the course, back by 6.
        if D.get('rivers'):
            im = Image.new('L', (elev.shape[1], elev.shape[0]), 0)
            for Rv in D['rivers']:
                ImageDraw.Draw(im).line([(a * su - i0, b * sv - j0) for a, b in Rv['px']], fill=1, width=1)
            dr = ndimage.distance_transform_edt(~np.array(im).astype(bool))
            sw = sw * np.clip((dr - 3) / 3, 0, 1)
        sw = ndimage.gaussian_filter(sw, 1.2)
    save16(os.path.join(out, 'scarpl.png'), Lr, lo, hi, np.zeros(elev.shape, bool))
    save16(os.path.join(out, 'scarpu.png'), Ur, lo, hi, np.zeros(elev.shape, bool))
    save8(os.path.join(out, 'scarpw.png'), np.clip(sw * 255, 0, 255))

    # ---- drainage on the height grid: lakes and the sea are sinks, rain from the full grid
    ny, nx = elev.shape
    gx = (np.arange(nx) + i0) / su            # each height cell's full-res pixel position
    gy = (np.arange(ny) + j0) / sv
    rain_full = raster(D, 'p')[..., 0].astype(np.float64) / 255 * 4000
    rx = np.clip(np.round(gx).astype(int), 0, OW - 1)
    ry = np.clip(np.round(gy).astype(int), 0, OH - 1)
    rain_h = np.maximum(rain_full[np.ix_(ry, rx)], RAIN_FLOOR)
    sink = whas | wflag
    F, rec, acc = drainage(elev, sink, rain_h)
    chan = (acc >= CHANNEL_MIN) & ~sink
    # polylines: start at every channel cell no channel cell drains into, follow receivers while in a channel
    feeds = np.zeros(elev.shape, np.int32)
    for j in range(ny):
        for i in range(nx):
            if chan[j, i]:
                a, b = rec[j, i]
                if a >= 0 and chan[a, b]:
                    feeds[a, b] += 1
    seen = np.zeros(elev.shape, bool)
    to_world = lambda j, i: ((gx[i] - cx) * 2000.0, (gy[j] - cy) * 2000.0)
    lines = []
    heads = [(j, i) for j in range(ny) for i in range(nx) if chan[j, i] and feeds[j, i] == 0]
    heads.sort(key=lambda t: -acc[t])
    # trunk first: longest flow paths claim their cells, tributaries stop where they join
    starts = sorted(heads, key=lambda t: -elev[t])
    for j, i in starts:
        pts = []
        while True:
            X, Z = to_world(j, i)
            pts.append([round(X, 1), round(Z, 1), round(float(acc[j, i]), 0), round(float(elev[j, i]), 1)])
            if seen[j, i]:
                break
            seen[j, i] = True
            a, b = rec[j, i]
            if a < 0:
                break
            if not chan[a, b]:
                X, Z = to_world(a, b)       # the mouth: into a lake, the sea or a non-channel sink
                pts.append([round(X, 1), round(Z, 1), round(float(acc[j, i]), 0), round(float(elev[a, b]), 1)])
                break
            j, i = a, b
        if len(pts) >= 2:
            lines.append(pts)

    # ---- the rivers the scale model names (DATA.rivers, 4.19): their drawn course, every 4th point, with the carved
    # height under each (bilinear on the height grid), inside the frame. The world carves them as channels and gives
    # them water; the drainage lines above follow the same carved cells and are kept as they are.
    def bil(A, u, v):
        i, j = int(u), int(v)
        fu, fv = u - i, v - j
        return (A[j, i] * (1 - fu) + A[j, i + 1] * fu) * (1 - fv) + (A[j + 1, i] * (1 - fu) + A[j + 1, i + 1] * fu) * fv
    rivers = []
    for Rv in D.get('rivers', []):
        P = Rv['px'][::4] + ([Rv['px'][-1]] if (len(Rv['px']) - 1) % 4 else [])
        line = [[round((a - cx) * 2000.0, 1), round((b - cy) * 2000.0, 1), round(float(bil(elev, a * su - i0, b * sv - j0)), 1)]
                for a, b in P if 0 <= a * su - i0 < nx - 1 and 0 <= b * sv - j0 < ny - 1]
        if len(line) >= 2:
            rivers.append({'name': Rv['name'], 'to': Rv.get('to'), 'width_m': RIVER_W, 'depth_m': RIVER_D, 'line': line})

    # ---- settlements inside the polygon
    def inside_px(px, py):
        X, Y = int(round(px)) - x0, int(round(py)) - y0
        return 0 <= X < W and 0 <= Y < H and bool(inside[Y, X])
    sett, seen_names = [], set()
    for s in sorted(S, key=lambda s: (s.get('name', ''), s.get('createdAt', ''))):
        px, py = s.get('px'), s.get('py')
        if px is None or not inside_px(px, py):
            continue
        key = (s['name'], px, py)
        if key in seen_names:       # the store holds a few duplicates (same name, same place)
            continue
        seen_names.add(key)
        b = int(bmap[int(round(py)) - y0, int(round(px)) - x0])
        sett.append({'name': s['name'], 'type': s.get('type'), 'doc': s['id'], 'px': px, 'py': py,
                     'x': (px - cx) * 2000.0, 'z': (py - cy) * 2000.0, 'biome': biomes[b]['name'],
                     'notes': s.get('notes', '')})

    # ---- canyon candidates for the ruins: troughs in the heights near the marker. A cell is in a trough across an axis
    # when the heights one and two cells out on BOTH sides along it stand above it; its depth is the lower side's height
    # over it. A canyon: deeper than CANYON_MIN at one cell and at two (so not a single dimple), not water.
    def trough(r):
        best, axis = np.full(elev.shape, -1e9), np.zeros(elev.shape, np.int8)
        for k, (dj, di) in enumerate([(0, 1), (1, 0), (1, 1), (1, -1)]):
            A = np.roll(elev, (-r * dj, -r * di), (0, 1))
            B = np.roll(elev, (r * dj, r * di), (0, 1))
            v = np.minimum(A, B) - elev
            axis = np.where(v > best, k, axis)
            best = np.maximum(best, v)
        return best, axis
    V1, ax1 = trough(1)
    V2, _ = trough(2)
    canyon = (V1 > CANYON_MIN[0]) & (V2 > CANYON_MIN[1]) & ~sink
    canyon[:2, :] = canyon[-2:, :] = canyon[:, :2] = canyon[:, -2:] = False
    runs = ['north-south', 'east-west', 'north-east to south-west', 'north-west to south-east']   # the trough runs across its axis
    cand = {}
    for s in sett:
        if s['type'] not in RUIN_TYPES:
            continue
        best = []
        for j, i in zip(*np.nonzero(canyon)):
            X, Z = to_world(j, i)
            d = math.hypot(X - s['x'], Z - s['z'])
            best.append({'x': round(float(X), 1), 'z': round(float(Z), 1), 'dist_m': round(d), 'floor_m': round(float(elev[j, i])),
                         'depth_m': round(float(V1[j, i])), 'depth2_m': round(float(V2[j, i])), 'runs': runs[int(ax1[j, i])]})
        best.sort(key=lambda c: c['dist_m'])
        cand[s['name']] = best[:5]

    classes = D['climate']['classes']
    meta = {
        'format': 'krator-openworld-region', 'version': 1, 'source': 'Krator Scale Model ' + D['_version'],
        'region': {'name': reg['name'], 'doc': reg['id'], 'points_px': reg['points'],
                   'points_m': [[(a - cx) * 2000.0, (b - cy) * 2000.0] for a, b in reg['points']],
                   'area_km2': round(poly_area(reg['points']) * 4)},
        'frame': {'units': 'm', 'x': 'east', 'z': 'south', 'm_per_px': 2000.0, 'origin_px': [cx, cy],
                  'box_px': [x0, y0, x1, y1], 'size_px': [W, H]},
        'heights': {'grid': [nx, ny], 'origin_cell': [i0, j0], 'su': su, 'sv': sv, 'lo': lo, 'hi': hi,
                    'note': 'cell (i,j) sits at full px ((i+i0)/su, (j+j0)/sv); elev.png and wlev.png are this grid'},
        'rain': {'scale_mm': 4000 / 255}, 'temp': {'offset': -90},
        'pressure': {'atm0': 1.6, 'scale_m': 8000},
        'classes': classes, 'biomes': biomes, 'biome_fill_px': filled,
        'drainage': {'min_accum': CHANNEL_MIN, 'lines': lines},
        'rivers': rivers,
        'water': {'spilled_cells': spilled, 'note': 'lake levels above their lowest shore cell were lowered to it'},
        'settlements': sett, 'canyon_candidates': cand,
        'volcano': D.get('volc'), 'vents': [v for v in D.get('vents', []) if x0 <= v['px'][0] <= x1 and y0 <= v['px'][1] <= y1],
    }
    json.dump(meta, open(os.path.join(out, 'region.json'), 'w'), separators=(',', ':'))
    print('region %s: box px %s, %d x %d px, polygon %d km2' % (reg['name'], [x0, y0, x1, y1], W, H, meta['region']['area_km2']))
    print('heights %d x %d cells; %d channels, %d vertices; %d water cells lowered to their spill height' % (nx, ny, len(lines), sum(len(l) for l in lines), spilled))
    for r in rivers:
        print('  river %s: %d points, %.0f m to %.0f m' % (r['name'], len(r['line']), r['line'][0][2], r['line'][-1][2]))
    for b in biomes:
        print('  biome %2d %-16s kit %-12s %7d px (%d in region)' % (b['id'], b['name'], b['kit'], b['px'], b['px_in_region']))
    print('  %d px took the nearest overlay' % filled)
    for s in sett:
        print('  settlement %-14s %-16s px (%s, %s) -> (%.0f, %.0f) m  in %s' % (s['name'], s['type'], s['px'], s['py'], s['x'], s['z'], s['biome']))
    for k, v in cand.items():
        print('  canyon for %s: %s' % (k, v[:2]))


if __name__ == '__main__':
    main()
