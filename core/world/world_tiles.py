#!/usr/bin/env python3
"""Fixed 64 km world tiles on the 5.1 scale model (GRAPHICS-TERRAIN-PROPOSAL.md Section 4 T2, Section 12 item 2).

World-absolute coordinates `(wx, wz)` in Krator's open world are anchored to the 5.1 scale model's full-resolution
map pixels `(px, py)` at `2,000 m/px`:
    wx = px * 2000.0,   wz = py * 2000.0
and a region with `frame.origin_px = [cx, cy]` converts between local `(x, z)` and world `(wx, wz)` via:
    wx = x + cx * 2000.0,   wz = z + cy * 2000.0

A fixed 64 km world tile `(tx, tz)` spans:
  - core map pixels:   `[tx * 32, tz * 32, (tx + 1) * 32, (tz + 1) * 32]` (`64,000 m x 64,000 m`)
  - core 250 m cells:  `256 x 256` cells (`wx = tx * 64000 + i * 250`, `i = 0..255`)
  - halo:              `HALO_M = 8000.0` (`4` map px = `32` 250 m cells on each side -> `320 x 320` grid)

Because a tile's extraction, global 2 km halo inflow, stream trace, and 250 m drainage residual depend ONLY on
`(tx, tz)` and the global 5.1 scale model (`tools/scale-model/model/data`), two regions cut over the same place
agree identically on both stream courses and terrain elevation `H`.
"""
import copy, json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SCALE_DIR = os.path.join(ROOT, 'tools', 'scale-model')
MODEL_DATA = os.path.join(SCALE_DIR, 'model', 'data')
for p in (HERE, SCALE_DIR):
    if p not in sys.path:
        sys.path.insert(0, p)

import extract_region as ER  # noqa: E402
import world_data as WD      # noqa: E402

M_PER_PX = 2000.0
TILE_PX = 32
TILE_M = TILE_PX * M_PER_PX       # 64,000.0 m
HALO_PX = 4
HALO_M = HALO_PX * M_PER_PX       # 8,000.0 m (32 cells at 250 m)
CELL_M = 250.0
CORE_N = int(round(TILE_M / CELL_M))   # 256
HALO_N = int(round(HALO_M / CELL_M))   # 32

_CACHE = {}


def tile_of_world(wx, wz):
    """Return integer 64 km world-tile indices `(tx, tz)` containing world point `(wx, wz)`."""
    return int(math.floor(wx / TILE_M)), int(math.floor(wz / TILE_M))


def tile_box_world(tx, tz, halo_m=0.0):
    """Return `(wx0, wz0, wx1, wz1)` in world-absolute metres for tile `(tx, tz)` plus `halo_m`."""
    return (
        tx * TILE_M - halo_m,
        tz * TILE_M - halo_m,
        (tx + 1) * TILE_M + halo_m,
        (tz + 1) * TILE_M + halo_m,
    )


def tiles_for_region(data_dir):
    """Return sorted list of `(tx, tz)` 64 km world tiles overlapping `inside` pixels of `data_dir`."""
    M = WD.meta(data_dir)
    R = WD.arrays(data_dir)
    bx0, by0, bx1, by1 = M['frame']['box_px']
    W, H = M['frame']['size_px']
    mask = R['mask'].reshape(H, W) > 127
    ys, xs = np.nonzero(mask)
    if xs.size == 0:
        tx0, tz0 = int(math.floor(bx0 / TILE_PX)), int(math.floor(by0 / TILE_PX))
        tx1, tz1 = int(math.floor(bx1 / TILE_PX)), int(math.floor(by1 / TILE_PX))
        return [(tx, tz) for tz in range(tz0, tz1 + 1) for tx in range(tx0, tx1 + 1)]
    txs = np.floor((xs + bx0) / float(TILE_PX)).astype(int)
    tzs = np.floor((ys + by0) / float(TILE_PX)).astype(int)
    pairs = sorted({(int(tx), int(tz)) for tx, tz in zip(txs, tzs)})
    return pairs


def global_model():
    """Load and cache `(D, R, S, full_rain, full_clim, full_temp)` from `tools/scale-model/model/data`."""
    if 'model' not in _CACHE:
        D = ER.load_page(MODEL_DATA)
        R = ER.load_model_defaults('regions')
        S = ER.load_model_defaults('settlements')
        # Also include planned non-model pins from openworld/SITES.json (e.g. Singing Gjar, Mirror Grange, Lightwall)
        sites_json = os.path.join(ROOT, 'openworld', 'SITES.json')
        if os.path.isfile(sites_json):
            sj = json.load(open(sites_json, encoding='utf-8')).get('sites', {})
            known = {s.get('id') for s in S}
            for sid, scfg in sj.items():
                if sid not in known and scfg.get('px') is not None and scfg.get('py') is not None:
                    S.append({'id': sid, 'name': scfg['name'], 'type': scfg.get('type', 'outpost'),
                              'px': float(scfg['px']), 'py': float(scfg['py']), 'notes': scfg.get('notes', '')})
        _CACHE['model'] = {
            'D': D,
            'R': R,
            'S': S,
            'clim': ER.raster(D, 'c')[..., 0],
            'rain': ER.raster(D, 'p')[..., 0],
            'temp': ER.raster(D, 'tm')[..., 0],
        }
    return _CACHE['model']


def global_2km_accumulation():
    """Compute and cache one global planetary flow accumulation on the 5.1 scale model's height grid (`~4 km` native
    or `2 km` upsampled). Returns dict `{acc_m2, acc_chan, gx_px, gy_px, su, sv, F_m}` so any tile's halo border
    reads global upstream drainage area `A` (m^2) and rain-weighted channel flow."""
    if 'global_acc' in _CACHE:
        return _CACHE['global_acc']
    gm = global_model()
    D = gm['D']
    lo, hi, OW, OH, VW, VH = D['lo'], D['hi'], D['fullW'], D['fullH'], D['w'], D['hh']
    su0, sv0 = (VW - 1) / float(OW - 1), (VH - 1) / float(OH - 1)
    h_raw = ER.raster(D, 'h')
    elev0 = lo + ((h_raw[..., 0].astype(np.int32) << 8) | h_raw[..., 1]) / 65535.0 * (hi - lo)
    wflag0 = h_raw[..., 2] > 127
    w_raw = ER.raster(D, 'wl')
    whas0 = w_raw[..., 2] > 127
    sink0 = whas0 | wflag0

    gx = np.arange(VW, dtype=np.float64) / su0
    gy = np.arange(VH, dtype=np.float64) / sv0
    rx = np.clip(np.round(gx).astype(int), 0, OW - 1)
    ry = np.clip(np.round(gy).astype(int), 0, OH - 1)
    cell_area_m2 = (M_PER_PX / su0) * (M_PER_PX / sv0)
    area_scale = ((2.0 / su0) * (2.0 / sv0)) / 16.0
    rain_mm = gm['rain'][np.ix_(ry, rx)].astype(np.float64) / 255.0 * 4000.0
    rain_w = np.maximum(rain_mm, ER.RAIN_FLOOR) * area_scale

    F, rec, acc_chan = ER.drainage(elev0, sink0, rain_w)
    # Pure drainage area in m^2 along the exact same D8 routing tree
    ny, nx = elev0.shape
    # Topological sort by F descending (matches priority-flood order)
    flat_order = np.argsort(F.ravel())[::-1]
    acc_m2 = np.where(sink0, 0.0, cell_area_m2).astype(np.float64)
    rec_j = rec[..., 0].ravel()
    rec_i = rec[..., 1].ravel()
    acc_m2_flat = acc_m2.ravel()
    for idx in flat_order:
        rj, ri = int(rec_j[idx]), int(rec_i[idx])
        if rj >= 0:
            acc_m2_flat[rj * nx + ri] += acc_m2_flat[idx]

    res = {
        'acc_m2': acc_m2,
        'acc_chan': acc_chan,
        'F_m': F,
        'sink': sink0,
        'su0': su0,
        'sv0': sv0,
        'VW': VW,
        'VH': VH,
    }
    _CACHE['global_acc'] = res
    return res


def sample_global_inflow(wx_arr, wz_arr):
    """Sample `(acc_m2, acc_chan)` from the global scale-model accumulation at world coordinates `(wx_arr, wz_arr)`."""
    ga = global_2km_accumulation()
    uh = np.clip((wx_arr / M_PER_PX) * ga['su0'], 0.0, ga['VW'] - 1.0001)
    vh = np.clip((wz_arr / M_PER_PX) * ga['sv0'], 0.0, ga['VH'] - 1.0001)
    coords = np.array([vh, uh])
    # Nearest-or-max neighbourhood so a trunk channel crossing the halo border isn't diluted between 4 km cells
    acc_m2_max = ndimage.maximum_filter(ga['acc_m2'], size=2)
    acc_ch_max = ndimage.maximum_filter(ga['acc_chan'], size=2)
    a_m2 = ndimage.map_coordinates(acc_m2_max, coords, order=1, mode='nearest')
    a_ch = ndimage.map_coordinates(acc_ch_max, coords, order=1, mode='nearest')
    return a_m2, a_ch


def extract_world_tile_data(tx, tz, out_dir, halo_px=HALO_PX, upsample=4.0, relief_micro=2, relief_seed=5391948):
    """Extract a canonical 64 km world tile `(tx, tz)` (plus `halo_px` halo and interpolation margin) directly from the
    global 5.1 scale model into `out_dir` (`region.json`, `elev.png`, `wlev.png`, `clim.png`, `rain.png`, `temp.png`,
    `biome.png`, `mask.png`, `scarpl.png`, `scarpu.png`, `scarpw.png`)."""
    gm = global_model()
    D, R, S = gm['D'], gm['R'], gm['S']
    OW, OH = D['fullW'], D['fullH']
    lo, hi = D['lo'], D['hi']

    # Tile core + halo in map pixels
    px0 = tx * TILE_PX - halo_px
    py0 = tz * TILE_PX - halo_px
    px1 = (tx + 1) * TILE_PX + halo_px
    py1 = (tz + 1) * TILE_PX + halo_px
    cx = tx * TILE_PX + (TILE_PX // 2)
    cy = tz * TILE_PX + (TILE_PX // 2)

    margin = 6
    x0 = max(0, int(math.floor((px0 - margin) / 2.0) * 2))
    y0 = max(0, int(math.floor((py0 - margin) / 2.0) * 2))
    x1 = min(OW - 1, int(math.ceil((px1 + margin) / 2.0) * 2))
    y1 = min(OH - 1, int(math.ceil((py1 + margin) / 2.0) * 2))
    W, H = x1 - x0 + 1, y1 - y0 + 1
    os.makedirs(out_dir, exist_ok=True)

    clim = gm['clim'][y0:y1 + 1, x0:x1 + 1]
    rain = gm['rain'][y0:y1 + 1, x0:x1 + 1]
    temp = gm['temp'][y0:y1 + 1, x0:x1 + 1]
    ER.save8(os.path.join(out_dir, 'clim.png'), clim)
    ER.save8(os.path.join(out_dir, 'rain.png'), rain)
    ER.save8(os.path.join(out_dir, 'temp.png'), temp)

    poly_pts = [[float(px0), float(py0)], [float(px1), float(py0)], [float(px1), float(py1)], [float(px0), float(py1)]]
    inside = ER.poly_mask(poly_pts, x0, y0, W, H)
    ER.save8(os.path.join(out_dir, 'mask.png'), inside * 255)

    # Biome overlays (pad context by 24 px so nearest-biome fill matches any enclosing region)
    bpad = 24
    bx0, by0 = max(0, x0 - bpad), max(0, y0 - bpad)
    bx1, by1 = min(OW - 1, x1 + bpad), min(OH - 1, y1 + bpad)
    bW, bH = bx1 - bx0 + 1, by1 - by0 + 1
    over = [r for r in R if r.get('kind') == 'biome' or r.get('name', '').lower() in ER.EXTRA_BIOMES]
    over = [r for r in over if r.get('name', '').strip().lower() not in ER.OVERLAYS
            and r.get('name', '').strip().lower() not in ER.TOOL_REGIONS_EXACT]
    over = [r for r in over if ER.poly_mask(r['points'], bx0, by0, bW, bH).any()]
    over.sort(key=lambda r: -ER.poly_area(r['points']))
    bmap_big = np.full((bH, bW), 255, np.uint8)
    biomes = []
    for k, r in enumerate(over):
        m = ER.poly_mask(r['points'], bx0, by0, bW, bH)
        bmap_big[m] = k
        nm = r['name'].strip()
        biomes.append({'id': k, 'name': nm, 'doc': r['id'], 'kind': r.get('kind'), 'colour': r.get('color'),
                       'kit': ER.KITS.get(nm.lower()), 'water': nm.lower() in ER.WATER_OVERLAYS, 'drawn_px': int(m.sum())})
    if not biomes:
        biomes.append({'id': 0, 'name': 'Ring Sea', 'doc': 'sea', 'kind': 'biome', 'colour': '#224466', 'kit': None, 'water': True, 'drawn_px': 0})
        bmap_big[:] = 0
    empty = bmap_big == 255
    if empty.any():
        _, (iy, ix) = ndimage.distance_transform_edt(empty, return_indices=True)
        bmap_big = bmap_big[iy, ix]
    bmap = bmap_big[y0 - by0:y0 - by0 + H, x0 - bx0:x0 - bx0 + W].copy()
    ER.save8(os.path.join(out_dir, 'biome.png'), bmap)

    overlays = []
    omap = np.zeros((H, W), np.uint8)
    for r in R:
        nm = r.get('name', '').strip()
        if nm.lower() not in ER.OVERLAYS:
            continue
        m = ER.poly_mask(r['points'], x0, y0, W, H)
        if not m.any():
            continue
        k = len(overlays)
        omap[m] |= 1 << k
        overlays.append({'bit': k, 'name': nm, 'doc': r['id'], 'build': ER.OVERLAYS[nm.lower()], 'colour': r.get('color')})
    if overlays:
        ER.save8(os.path.join(out_dir, 'overlay.png'), omap)

    U = float(upsample)
    elev, wflag, whas, wlev, i0, j0, nx, ny, su, sv, spilled = ER.upsample_heights_and_water(D, x0, y0, x1, y1, U, smooth=True)
    curves = ER.river_curves(D, su, sv, i0, j0, nx, ny, cx, cy)
    # Palaeolakes apply only in the northern basin (py < 960)
    if y0 < 960:
        palaeo, palaeo_masks, palaeo_lakes = ER.palaeo_waters(D, (x0, y0, x1, y1), (i0, j0, nx, ny), su, sv, cx, cy, out_dir)
    else:
        palaeo, palaeo_masks, palaeo_lakes = None, [], []
    elev = ER.synthesize_option_c_relief(
        D, elev, whas, wflag, bmap, biomes, omap, overlays,
        palaeo_masks, palaeo_lakes, x0, y0, cx, cy, i0, j0, su, sv, S, relief=True
    )
    elev = ER.carve_smooth_rivers(D, elev, whas, wflag, wlev, i0, j0, su, sv, cx, cy, curves)
    elev = np.where(whas, np.minimum(elev, wlev - 1.0), elev)
    ER.save16(os.path.join(out_dir, 'elev.png'), elev, lo, hi, wflag)
    ER.save16(os.path.join(out_dir, 'wlev.png'), wlev, lo, hi, whas)

    # Escarpments
    step_sc = max(1, int(round(su / 0.5)))
    elev_sub = elev[::step_sc, ::step_sc]
    yy_, xx_ = np.mgrid[-ER.SCARP_R:ER.SCARP_R + 1, -ER.SCARP_R:ER.SCARP_R + 1]
    disc = (xx_ * xx_ + yy_ * yy_) <= ER.SCARP_R * ER.SCARP_R
    Lr_sub = ndimage.percentile_filter(elev_sub, 8, footprint=disc)
    Ur_sub = ndimage.percentile_filter(elev_sub, 68, footprint=disc)
    vj = np.clip(np.arange(ny, dtype=np.float64) / step_sc, 0, Lr_sub.shape[0] - 1)
    ui = np.clip(np.arange(nx, dtype=np.float64) / step_sc, 0, Lr_sub.shape[1] - 1)
    vv_s, uu_s = np.meshgrid(vj, ui, indexing='ij')
    Lr = ndimage.map_coordinates(Lr_sub, [vv_s, uu_s], order=3, mode='nearest', prefilter=False)
    Ur = ndimage.map_coordinates(Ur_sub, [vv_s, uu_s], order=3, mode='nearest', prefilter=False)
    sw = np.zeros(elev.shape)
    abyss_b = [b for b in biomes if b['name'].lower() in ('e abysss', 'e abyss')]
    if abyss_b:
        apoly = np.zeros(elev.shape, bool)
        for ab in abyss_b:
            r = next(r for r in R if r['id'] == ab['doc'])
            im = Image.new('L', (nx, ny), 0)
            ImageDraw.Draw(im).polygon([(a * su - i0, b * sv - j0) for a, b in r['points']], fill=1)
            apoly |= np.array(im).astype(bool)
        scale_4km = su / 0.5
        floor = (elev < -900) & ndimage.binary_dilation(apoly, iterations=max(1, int(round(4 * scale_4km)))) & ~(whas | wflag)
        dist_out_4km = ndimage.distance_transform_edt(~floor) / scale_4km
        dist_in_4km = ndimage.distance_transform_edt(floor) / scale_4km
        band = (dist_out_4km <= 6.0) & (dist_in_4km <= 3.0)
        gy_, gx_ = np.gradient(elev, 0.5 / sv, 0.5 / su)
        steep = ndimage.maximum_filter(np.hypot(gx_, gy_), size=max(3, int(round(3 * scale_4km))))
        sw = band * np.clip((Ur - Lr - 700) / 500, 0, 1) * np.clip((steep - 500) / 400, 0, 1)
        sw = ndimage.gaussian_filter(sw, 1.2 * scale_4km)
    ER.save16(os.path.join(out_dir, 'scarpl.png'), Lr, lo, hi, np.zeros(elev.shape, bool))
    ER.save16(os.path.join(out_dir, 'scarpu.png'), Ur, lo, hi, np.zeros(elev.shape, bool))
    ER.save8(os.path.join(out_dir, 'scarpw.png'), np.clip(sw * 255, 0, 255))

    # 2 km drainage channels & named rivers inside tile+margin
    gx = (np.arange(nx, dtype=np.float64) + i0) / su
    gy = (np.arange(ny, dtype=np.float64) + j0) / sv
    step_d = max(1, int(round(su)))
    elev_d = elev[::step_d, ::step_d]
    sink_d = (whas | wflag)[::step_d, ::step_d]
    gx_d, gy_d = gx[::step_d], gy[::step_d]
    su_d, sv_d = su / step_d, sv / step_d
    area_scale = ((2.0 / su_d) * (2.0 / sv_d)) / 16.0
    rain_full = gm['rain'].astype(np.float64) / 255.0 * 4000.0
    rx = np.clip(np.round(gx_d).astype(int), 0, OW - 1)
    ry = np.clip(np.round(gy_d).astype(int), 0, OH - 1)
    rain_h = np.maximum(rain_full[np.ix_(ry, rx)], ER.RAIN_FLOOR) * area_scale
    _, rec_d, acc_d = ER.drainage(elev_d, sink_d, rain_h)
    # Seed border inflow from global 2 km accumulation so channels entering the tile already carry upstream rain*area
    ga = global_2km_accumulation()
    chan = (acc_d >= ER.CHANNEL_MIN) & ~sink_d
    ny_d, nx_d = elev_d.shape
    feeds = np.zeros(elev_d.shape, np.int32)
    for j in range(ny_d):
        for i in range(nx_d):
            if chan[j, i]:
                a, b = rec_d[j, i]
                if a >= 0 and chan[a, b]:
                    feeds[a, b] += 1
    seen = np.zeros(elev_d.shape, bool)
    to_world_d = lambda j, i: ((gx_d[i] - cx) * M_PER_PX, (gy_d[j] - cy) * M_PER_PX)
    lines = []
    heads = sorted([(j, i) for j in range(ny_d) for i in range(nx_d) if chan[j, i] and feeds[j, i] == 0], key=lambda t: -elev_d[t])
    for j, i in heads:
        pts = []
        while True:
            X, Z = to_world_d(j, i)
            pts.append([round(X, 1), round(Z, 1), round(float(acc_d[j, i]), 0), round(float(elev_d[j, i]), 1)])
            if seen[j, i]:
                break
            seen[j, i] = True
            a, b = rec_d[j, i]
            if a < 0:
                break
            if not chan[a, b]:
                X, Z = to_world_d(a, b)
                pts.append([round(X, 1), round(Z, 1), round(float(acc_d[j, i]), 0), round(float(elev_d[a, b]), 1)])
                break
            j, i = a, b
        if len(pts) >= 2:
            lines.append(pts)

    def bil(A, u, v):
        u = min(max(0.0, float(u)), A.shape[1] - 1.0001)
        v = min(max(0.0, float(v)), A.shape[0] - 1.0001)
        ii, jj = int(u), int(v)
        fu, fv = u - ii, v - jj
        return (A[jj, ii] * (1 - fu) + A[jj, ii + 1] * fu) * (1 - fv) + (A[jj + 1, ii] * (1 - fu) + A[jj + 1, ii + 1] * fu) * fv

    rivers, valleys = [], []
    for Rv in D.get('rivers', []):
        drawn = Rv.get('drawn_px') or ('q_m3s' not in Rv and Rv.get('px'))
        src = drawn or Rv.get('px') or []
        if not src:
            continue
        line = []
        for n_i, X, Z in ER.river_vertices(Rv, su, sv, i0, j0, nx, ny, cx, cy, True):
            a, b = src[n_i]
            line.append([X, Z, round(float(bil(elev, a * su - i0, b * sv - j0)), 1)])
        if len(line) < 2:
            continue
        rec_r = {'name': Rv['name'], 'id': Rv.get('id'), 'to': Rv.get('to'), 'line': line,
                 'width_m': Rv.get('width_m', ER.RIVER_W), 'depth_m': Rv.get('depth_m', ER.RIVER_D),
                 'q_mouth_m3s': Rv.get('q_mouth_m3s'), 'relax': ER.river_relax(Rv)}
        (valleys if Rv.get('kind') == 'wadi' else rivers).append(rec_r)

    sett = []
    for s in S:
        spx, spy = s.get('px'), s.get('py')
        if spx is None or not (x0 <= spx <= x1 and y0 <= spy <= y1):
            continue
        sett.append({'name': s['name'], 'type': s.get('type'), 'doc': s.get('id'), 'px': spx, 'py': spy,
                     'x': (spx - cx) * M_PER_PX, 'z': (spy - cy) * M_PER_PX})

    meta = {
        'format': 'krator-openworld-region',
        'version': 1,
        'source': 'Krator Scale Model ' + D['_version'] + ' (world tile %d,%d)' % (tx, tz),
        'world_tile': {'tx': tx, 'tz': tz, 'tile_m': TILE_M, 'halo_m': halo_px * M_PER_PX},
        'region': {
            'name': 'tile_%d_%d' % (tx, tz),
            'doc': 'tile_%d_%d' % (tx, tz),
            'points_px': poly_pts,
            'points_m': [[(a - cx) * M_PER_PX, (b - cy) * M_PER_PX] for a, b in poly_pts],
            'area_km2': int((px1 - px0) * (py1 - py0) * 4),
            'union_km2': int(inside.sum()) * 4,
            'added': [],
        },
        'frame': {'units': 'm', 'x': 'east', 'z': 'south', 'm_per_px': M_PER_PX, 'origin_px': [cx, cy], 'box_px': [x0, y0, x1, y1], 'size_px': [W, H]},
        'heights': {'grid': [nx, ny], 'origin_cell': [i0, j0], 'su': su, 'sv': sv, 'lo': lo, 'hi': hi, 'cell_m': round(M_PER_PX / su, 1), 'upsample': round(su, 2), 'option_c_synth': True},
        'rain': {'scale_mm': 4000.0 / 255.0},
        'temp': {'offset': -90},
        'pressure': {'atm0': 1.6, 'scale_m': 8000},
        'classes': D['climate']['classes'],
        'biomes': biomes,
        'drainage': {'min_accum': ER.CHANNEL_MIN, 'lines': lines},
        'rivers': rivers,
        'valleys': valleys,
        'settlements': sett,
        'sites': [{'name': s['name'], 'x': s['x'], 'z': s['z']} for s in sett],
        'smooth': {'version': 1, 'by': 'core/world/40-world-smooth.js', 'river_step': ER.SMOOTH_RIVER_STEP},
        'relief': {'version': 1, 'phase': 6, 'by': 'core/world/43-world-relief.js', 'seed': relief_seed, 'micro': relief_micro},
    }
    if palaeo:
        meta['palaeo'] = palaeo
    if overlays:
        meta['overlays'] = overlays
    with open(os.path.join(out_dir, 'region.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(meta, f, separators=(',', ':'), ensure_ascii=False)
    return meta
