#!/usr/bin/env python3
"""Cut one region of the Krator Scale Model out as the data an open-world build reads (Option C Super-Resolution).

    python3 tools/scale-model/extract_region.py <page.html> <regions dir> <settlements dir> "<region name>" <out dir> [--add <polygons.json>] [--upsample <N|auto>] [--no-synth] [--legacy-px]

<page.html>        the model's data: tools/scale-model/model/data (the build's source), or a saved page (Artifact read,
                   or model/dist/scale-model.html), whose DATA object holds the rasters
<regions dir>      the artifact's `regions` collection: a folder of one JSON file per document (ArtifactData list with
                   out_dir), or one JSON list of them (openworld/<name>/source/regions.json)
<settlements dir>  the artifact's `settlements` collection, the same way
<region name>      the polygon that bounds the cut (a region of any layer: 'little demo')
<out dir>          openworld/<name>/data: region.json and the rasters as PNG
--add <file>       (optional) more polygons that are part of the cut: a JSON list of {name, map_px:[[x, y], ...]} (map
                   pixels, as the open world's polygon tool copies them). The box covers them all and the mask is the
                   union; region.json records each as 'added'. Without it the cut is the named region's alone.
--upsample <N>     (optional, Option C) height-grid super-sampling factor relative to full map pixels (2 km/px):
                   1 = 2,000 m/cell, 2 = 1,000 m/cell, 4 = 500 m/cell, 8 = 250 m/cell, or 'auto' (default: 4 for
                   regional/biome/settlement cuts <= 180k map px, 2 for sub-continental cuts > 180k map px).
--no-synth         (optional) disable Option C sub-cell geomorphological and fluvial synthesis on the upsampled grid.

Map pixels are the scale model's full grid (fullW x fullH, 2 km a pixel); its heights sit on a grid sampled at
u = px*su - i0, v = py*sv - j0 (where su, sv are cells per map pixel). World coordinates: metres,
x east, z south, the origin at the region's centre pixel, so x = (px - cx)*2000, z = (py - cy)*2000.

What it writes (every raster cropped to the region's box plus a margin):
  elev.png    the heights on the regional height grid (Option C super-sampled), 16 bits in R,G (lo..hi), B = water
  wlev.png    the water level there (16 bits in R,G), B = this pixel has water
  clim.png    the climate class index (DATA.climate.classes), full resolution (2 km/px)
  rain.png    rain, 0..255 = 0..4000 mm/yr, full resolution (2 km/px)
  temp.png    the annual mean temperature + 90 (deg C), full resolution (2 km/px)
  scarpl.png, scarpu.png  the escarpments' floor and plateau levels per height cell, scarpw.png their weight (the open world
              makes cliffs of them)
  biome.png   the biome overlay index (region.json "biomes"), full resolution. Overlapping overlays: the smaller wins.
              A pixel no overlay covers takes the nearest overlay's index (pixel distance); a pixel of the bounding
              polygon itself is 'inside' in region.json's mask (mask.png: 255 inside, 0 outside). The regions in
              OVERLAYS and the owner's tool polygons ('Region 65', 'Region 87') are not biomes and stay out of it
  dist.png    each biome's distance field (a species' reach, biomes/hyperjungle/PLAN-LANDS.md H1): the squared distance in
              map pixels from each pixel's centre to the nearest pixel of that biome's drawn polygon, 24 bits in R,G,B
              (R high), exact (the Euclidean distance transform; core/mask's KMASK.distance gives the same integers). The
              biomes are bands stacked down the image, band k = region.json "biomes"[k] (its 'dist_band'), each the box's
              size. The polygon is drawn DIST_PAD pixels past the box, so a distance up to DIST_PAD is exact
  overlay.png the OVERLAYS (biomes/nsemiarid/PLAN.md, section 3: layers that own no ground and lie over any biome),
              full resolution: bit k set where region.json "overlays"[k]'s polygon is drawn. Only when one is in the box
  palaeo.png  the old water bodies (DATA.palaeolakes, and the flood lake the dams' breach filled), on the height grid:
              bit k set where region.json "palaeo".lakes[k] stood, dilated by PALAEO_PAD cells so the world's own
              contour at the level (WORLD.H < level) draws the shore. Only when one is in the box
  region.json the frame, the class table, the biome table, the drainage network, the settlements inside the polygon,
              lava tubes (DATA.tubes), and the canyon candidates for each ruin (the nearest troughs in the heights)

Deterministic: no randomness anywhere.
"""
import base64, copy, glob, heapq, io, json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import smodel.page   # noqa: E402

MARGIN = 10          # map pixels of context round the polygon's box
RIVER_W, RIVER_D = 60.0, 6.0   # a named river's width and water depth at 1:1 (m)
CHANNEL_MIN = 3.0e4  # accumulated rain-weighted 16-km2-equivalent cells (mm/yr x cells) that make a channel
RAIN_FLOOR = 150     # mm/yr: every cell counts at least this much, so a desert still gathers its wadis
RUIN_TYPES = ('ruin', 'ruined arcology')
SCARP_R = 6        # 4-km height cells (24 km): the disc that finds an escarpment's floor and plateau
SPILL_SLACK = 600  # m: a lake this far over its shore is a data error
CANYON_MIN = (120, 150)  # m: a trough this deep one and two 4-km cells out (about 4 and 8 km) is a canyon
# biome overlays read from the 'geographic' layer as well (named by the owner as biomes still to make)
EXTRA_BIOMES = ('e highlands',)
# which biome kit grows each overlay; covers all 39 biome directories across the 5.1 planetary map
KITS = {
    'sedesert': 'sedesert',
    'the bowl': 'sedesert',
    'e abysss': 'eastabyss',
    'e abyss': 'eastabyss',
    'hyperjungle': 'hyperjungle',
    'hyperjungle n': 'hyperjungle',
    'hyperjungle s': 'hyperjungle',
    'savage hyperjungle': 'hyperjungle',
    'e badlands': 'ebadlands',
    'oidong valley': 'oidong',
    'e inner wall': 'ehighlands',
    'e highlands': 'ehighlands',
    'n highlands': 'nhighlands',
    's highlands': 'shighlands',
    'sw highlands': 'swhighlands',
    'korona / ne': 'korona',
    'arachnoid canyons': 'korona',
    'throne/volcano': 'throne',
    'godthrone': 'godthrone',
    'godstep valley': 'godstep',
    'crater drylands': 'crater-drylands',
    'crater drylands n': 'crater-drylands',
    'crater drylands s': 'crater-drylands',
    'e savannah rim': 'abyssal-savannah',
    'se savannah rim': 'abyssal-savannah',
    'ne rim': 'abyssal-savannah',
    'sw bay': 'swbay',
    'nw bay': 'nwbay',
    'k-guilin': 'k-guilin',
    'sw lowlands': 'swlowlands',
    "ancient's valley": 'swlowlands',
    'nw lowlands': 'nwlowlands',
    'double delta': 'nwlowlands',
    'n semiarid': 'nsemiarid',
    'ria valley': 'nsemiarid',
    'farside': 'farside',
    'the arch': 'farside',
    'the crook': 'farside',
    'copper glacier': 'nwouterwall',
    'nw outer wall': 'nwouterwall',
    'nw boreal': 'nwouterwall',
    'tharn uplands': 'nwouterwall',
    'w outer wall': 'wouterwall',
    'painted highlands': 'paintedhighlands',
    'yuni valley': 'necanyons',
    'the cut': 'cut',
    'rift': 'rift',
    'high rift': 'rift',
    'rift rim n': 'riftrim',
    'rift rim s': 'riftrim',
    'w rift highland': 'riftrim',
    'xanadu': 'xanadu',
    'the catch': 'catch',
    'region 99': 'loom-chasms',
    'loom chasms': 'loom-chasms',     # region 99's name since 5.1 edit 3 (2026-11-11)
    'siphon pits': 'siphon-pits',
    'n outlands': 'outlands',
    's outlands': 'outlands',
    'tiers': 'outlands',
    'stalker range': 'outlands',
    'stalker gate': 'outlands',
    'outland gate': 'outlandgate',
    'ne outer wall': 'neouterwall',
    'mid basin': 'outlands',
    'steaming seamounts': 'geyser',
}
WATER_OVERLAYS = ('ring sea', 'nwern ocean', 'bay of voth', 'lake of shim')
# the overlays: regions of the biome layer that own no ground (biomes/nsemiarid/PLAN.md, section 3), each with the build
# that draws it. They stay out of biome.png, each its own bit in overlay.png
OVERLAYS = {'floodzone': 'scablands', 'dam': 'dambasins', 'dam 2': 'dambasins'}
# the owner's tool polygons ('Region 65': edit_rivers.py's LOWER; 'Region 87') are no biome, whereas 'Region 99' is loom-chasms
TOOL_REGIONS_EXACT = {'region 65', 'region 87', 'lower', 'lower2'}
# the old water bodies (palaeo.png, region.json "palaeo")
RING_M = 30.0        # m: the bathtub ring under a dam lake's full level, its yearly drawdown (the owner, 2026-10-20)
PALAEO_PAD = 2       # 4-km height cells round an old lake's bed in palaeo.png
DAM_R = 5            # 4-km height cells: a dam's body, for the lake held behind it (as edit_dams.py stands it)
DIST_PAD = 128       # map pixels (256 km) past the box that dist.png's polygons are drawn in: every reach is shorter
EXPAND_DX, EXPAND_DY = smodel.page.LEGACY_SHIFT  # 5.0/5.1 N/W canvas expansion shift (1549x1393 -> 1821x1723)
AUTO_UPSAMPLE_MAX_PX = 180000     # map px threshold: <= 180k px uses 4x (500 m/cell), > 180k px uses 2x (1,000 m/cell)


def load_page(path):
    """DATA from a saved page or the build's data folder (smodel.page), with the model's version"""
    D = smodel.page.load(path)
    D['_version'] = smodel.page.version(path)
    return D


raster = smodel.page.raster     # (D, key) -> RGB array
docs = smodel.page.docs


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


def dist2(mask):
    """the squared distance in pixels from each pixel's centre to the nearest True pixel's (0 on one), int64; -1 when none.
    Exact: the transform's nearest pixel gives the integer di^2 + dj^2, as KMASK.distance's d2 (core/mask)"""
    if not mask.any():
        return np.full(mask.shape, -1, np.int64)
    _, (iy, ix) = ndimage.distance_transform_edt(~mask, return_indices=True)
    Y, X = np.indices(mask.shape)
    return (iy - Y).astype(np.int64) ** 2 + (ix - X).astype(np.int64) ** 2


def save24(path, v):
    q = np.clip(v, 0, (1 << 24) - 1).astype(np.uint32)
    rgb = np.stack([(q >> 16) & 255, (q >> 8) & 255, q & 255], -1).astype(np.uint8)
    Image.fromarray(rgb, 'RGB').save(path, optimize=True)


def save16(path, v, lo, hi, flag):
    q = np.clip(np.round((v - lo) / (hi - lo) * 65535), 0, 65535).astype(np.uint32)
    rgb = np.stack([(q >> 8) & 255, q & 255, np.where(flag, 255, 0)], -1).astype(np.uint8)
    Image.fromarray(rgb, 'RGB').save(path, optimize=True)


def save8(path, v):
    Image.fromarray(np.asarray(v).astype(np.uint8), 'L').save(path, optimize=True)


def _extract_js_array(text, var_name):
    """Extract a JSON array assigned to `const <var_name> = [...]` inside a JS/HTML source file."""
    marker = 'const ' + var_name
    idx = text.find(marker)
    if idx < 0:
        return []
    start = text.find('[', idx)
    if start < 0:
        return []
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == '\\':
                esc = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == '[':
                depth += 1
            elif ch == ']':
                depth -= 1
                if depth == 0:
                    return json.loads(text[start:i + 1])
    return []


def load_model_defaults(kind):
    """Load canonical 5.1 regions (`defRegs`) or settlements (`defSetts`) from tools/scale-model/model/src/."""
    here = os.path.dirname(os.path.abspath(__file__))
    if kind == 'regions':
        src = os.path.join(here, 'model', 'src', '51-region-store.js')
        var_name = 'defRegs'
    else:
        src = os.path.join(here, 'model', 'src', '60-settlements.js')
        var_name = 'defSetts'
    if os.path.isfile(src):
        return _extract_js_array(open(src, encoding='utf-8').read(), var_name)
    return []


def load_collection(path, kind):
    """Load regions or settlements from a JSON file/folder (`docs`), or from the scale model (`model`/`auto`/`.js`/`.html`)."""
    if path.lower() in ('model', 'auto', 'default') or os.path.abspath(path) == os.path.abspath(smodel.page.DATA_DIR):
        return load_model_defaults(kind)
    if os.path.isfile(path) and path.lower().endswith(('.js', '.html')):
        var_name = 'defRegs' if kind == 'regions' else 'defSetts'
        return _extract_js_array(open(path, encoding='utf-8').read(), var_name)
    return docs(path)


def auto_shift_collections(D, R, S, added, target_name='', legacy_px_flag=False):
    """Ensure R, S, and added are on the 5.1 (1821x1723) canvas.
    If `--legacy-px` is passed, shift 4.23/4.24 (1549x1393) coordinates explicitly via `smodel.page.legacy_px`.
    If `--legacy-px` is NOT passed and the collection is in 4.23/4.24 coordinates, raise a clear error instead of silently guessing."""
    if (D.get('fullW'), D.get('fullH')) != (1821, 1723):
        return R, S, added
    is_legacy_r = False
    for r in R:
        nm = r.get('name', '').strip().lower()
        if nm == 'throne/volcano' and r.get('points'):
            cx_r = sum(p[0] for p in r['points']) / len(r['points'])
            is_legacy_r = (cx_r < 680)
            break
    if not legacy_px_flag and is_legacy_r:
        raise ValueError(
            'Regions collection is in 4.23/4.24 (1549x1393) coordinates while model is 5.1 (1821x1723); '
            'pass --legacy-px to shift by (+272, +330) or use a 5.1 regions file.'
        )
    if legacy_px_flag:
        R_new = []
        for r in R:
            r2 = copy.deepcopy(r)
            if 'points' in r2:
                r2['points'] = [smodel.page.legacy_px(p, D=D) for p in r2['points']]
            R_new.append(r2)
        R = R_new
        if added:
            added_new = []
            for a in added:
                a2 = copy.deepcopy(a)
                if 'map_px' in a2:
                    a2['map_px'] = [smodel.page.legacy_px(p, D=D) for p in a2['map_px']]
                added_new.append(a2)
            added = added_new
    if target_name and not any(r.get('name', '').lower() == target_name.lower() for r in R):
        known_ids = {r.get('id') for r in R}
        for r_def in load_model_defaults('regions'):
            if r_def.get('id') not in known_ids:
                R.append(r_def)
    is_legacy_s = False
    for s in S:
        if s.get('name') == 'Iziz' and s.get('px') is not None:
            is_legacy_s = (s['px'] < 750)
            break
    if not legacy_px_flag and is_legacy_s:
        raise ValueError(
            'Settlements collection is in 4.23/4.24 (1549x1393) coordinates while model is 5.1 (1821x1723); '
            'pass --legacy-px to shift by (+272, +330) or use a 5.1 settlements file.'
        )
    if legacy_px_flag:
        S_new = []
        for s in S:
            s2 = copy.deepcopy(s)
            if s2.get('px') is not None:
                s2['px'], s2['py'] = smodel.page.legacy_px(s2['px'], s2['py'], D=D)
            S_new.append(s2)
        S = S_new
    return R, S, added


# ==============================================================================
# Option C Deterministic Sub-Cell Noise & Geomorphological Synthesis
# ==============================================================================

def _hash2(ix, iy, seed):
    """Deterministic 32-bit integer hash on numpy integer arrays -> float64 in [0, 1)."""
    h = (ix.astype(np.int64) * 374761393 + iy.astype(np.int64) * 668265263 + int(seed) * 1442695041) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    h = (h ^ (h >> 16)) & 0xFFFFFFFF
    return h.astype(np.float64) / 4294967296.0


def _vnoise(x, y, seed):
    """Smooth C1 value noise in [-1, 1] on 2D coordinate arrays (x, y)."""
    ix = np.floor(x).astype(np.int64)
    iy = np.floor(y).astype(np.int64)
    fx = x - ix
    fy = y - iy
    ux = fx * fx * (3.0 - 2.0 * fx)
    uy = fy * fy * (3.0 - 2.0 * fy)
    n00 = _hash2(ix, iy, seed)
    n10 = _hash2(ix + 1, iy, seed)
    n01 = _hash2(ix, iy + 1, seed)
    n11 = _hash2(ix + 1, iy + 1, seed)
    nx0 = n00 + ux * (n10 - n00)
    nx1 = n01 + ux * (n11 - n01)
    return (nx0 + uy * (nx1 - nx0)) * 2.0 - 1.0


def _fbm(x, y, octaves=3, seed=101):
    """Multi-octave fractional Brownian motion in [-1, 1]."""
    val = np.zeros_like(x, dtype=np.float64)
    amp = 0.5
    freq = 1.0
    norm = 0.0
    # Slight rotation between octaves to eliminate grid-axis alignment
    c, s = 0.8, 0.6
    xr, yr = x, y
    for k in range(octaves):
        val += amp * _vnoise(xr * freq, yr * freq, seed + k * 97)
        norm += amp
        amp *= 0.5
        freq *= 2.02
        xr, yr = c * xr - s * yr, s * xr + c * yr
    return val / max(norm, 1e-9)


def _ridged(x, y, octaves=3, seed=202):
    """Multi-octave ridged multifractal in [0, 1] (sharp crests at 1, troughs at 0)."""
    val = np.zeros_like(x, dtype=np.float64)
    amp = 0.5
    freq = 1.0
    norm = 0.0
    c, s = 0.8, 0.6
    xr, yr = x, y
    for k in range(octaves):
        r = 1.0 - np.abs(_vnoise(xr * freq, yr * freq, seed + k * 131))
        val += amp * (r * r)
        norm += amp
        amp *= 0.5
        freq *= 2.03
        xr, yr = c * xr - s * yr, s * xr + c * yr
    return val / max(norm, 1e-9)


def _smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def upsample_heights_and_water(D, x0, y0, x1, y1, U):
    """Super-sample the scale model's height and water rasters around box (x0, y0, x1, y1) to su = sv = U cells per map px."""
    lo, hi, OW, OH, VW, VH = D['lo'], D['hi'], D['fullW'], D['fullH'], D['w'], D['hh']
    su0, sv0 = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
    if abs(U - 1.0) < 1e-6 and VW == OW and VH == OH:
        su, sv = su0, sv0
        pad = 2
    elif U <= 0.55 and VW != OW:
        su, sv = su0, sv0
        pad = 2
    else:
        su, sv = float(U), float(U)
        pad = max(2, int(round(2 * su)))

    max_i = int(round((OW - 1) * su))
    max_j = int(round((OH - 1) * sv))
    i0 = max(0, int(math.floor(x0 * su)) - pad)
    j0 = max(0, int(math.floor(y0 * sv)) - pad)
    i1 = min(max_i, int(math.ceil(x1 * su)) + pad)
    j1 = min(max_j, int(math.ceil(y1 * sv)) + pad)
    nx, ny = i1 - i0 + 1, j1 - j0 + 1

    # Crop model height & water grids with a margin for interpolation
    gx = (np.arange(nx, dtype=np.float64) + i0) / su
    gy = (np.arange(ny, dtype=np.float64) + j0) / sv
    uh = gx * su0
    vh = gy * sv0

    ui0 = max(0, int(math.floor(uh[0])) - 3)
    uj0 = max(0, int(math.floor(vh[0])) - 3)
    ui1 = min(VW - 1, int(math.ceil(uh[-1])) + 3)
    uj1 = min(VH - 1, int(math.ceil(vh[-1])) + 3)

    h_raw = raster(D, 'h')[uj0:uj1 + 1, ui0:ui1 + 1]
    elev0 = lo + ((h_raw[..., 0].astype(np.int32) << 8) | h_raw[..., 1]) / 65535.0 * (hi - lo)
    wflag0 = h_raw[..., 2] > 127

    w_raw = raster(D, 'wl')[uj0:uj1 + 1, ui0:ui1 + 1]
    whas0 = w_raw[..., 2] > 127
    wlev0 = np.where(whas0, lo + ((w_raw[..., 0].astype(np.int32) << 8) | w_raw[..., 1]) / 65535.0 * (hi - lo), lo)

    # Exact 1:1 crop when no upsampling is needed
    if abs(su - su0) < 1e-6 and abs(sv - sv0) < 1e-6:
        s_i0, s_j0 = i0 - ui0, j0 - uj0
        elev = elev0[s_j0:s_j0 + ny, s_i0:s_i0 + nx].copy()
        wflag = wflag0[s_j0:s_j0 + ny, s_i0:s_i0 + nx].copy()
        whas = whas0[s_j0:s_j0 + ny, s_i0:s_i0 + nx].copy()
        wlev = wlev0[s_j0:s_j0 + ny, s_i0:s_i0 + nx].copy()
    else:
        vv, uu = np.meshgrid(vh - uj0, uh - ui0, indexing='ij')
        coords = np.array([vv, uu])
        # Monotone-clamped cubic spline for elevation (prevents ringing at cliffs/shores)
        elev_cub = ndimage.map_coordinates(elev0, coords, order=3, mode='nearest')
        elev_min = ndimage.minimum_filter(elev0, size=3)
        elev_max = ndimage.maximum_filter(elev0, size=3)
        lo_env = ndimage.map_coordinates(elev_min, coords, order=1, mode='nearest')
        hi_env = ndimage.map_coordinates(elev_max, coords, order=1, mode='nearest')
        elev = np.clip(elev_cub, lo_env, hi_env)

        # Nearest-cell indices for water masks & basin levels
        nn_j = np.clip(np.round(vh - uj0).astype(np.int32), 0, elev0.shape[0] - 1)
        nn_i = np.clip(np.round(uh - ui0).astype(np.int32), 0, elev0.shape[1] - 1)
        wflag_nn = wflag0[np.ix_(nn_j, nn_i)]
        whas_nn = whas0[np.ix_(nn_j, nn_i)]

        # Propagate water levels cleanly across shoreline cells without interpolating with dry `lo`
        wlev_fill = wlev0.copy()
        if whas0.any() and (~whas0).any():
            _, (wy, wx) = ndimage.distance_transform_edt(~whas0, return_indices=True)
            wlev_fill = wlev0[wy, wx]
        wlev_near = wlev_fill[np.ix_(nn_j, nn_i)]

        # Smooth bilinear water fraction for sub-cell shoreline refinement
        whas_f = ndimage.map_coordinates(whas0.astype(np.float64), coords, order=1, mode='nearest')
        wflag_f = ndimage.map_coordinates(wflag0.astype(np.float64), coords, order=1, mode='nearest')
        whas = (whas_f >= 0.5) | ((whas_f >= 0.18) & (elev <= wlev_near - 0.5))
        wflag = (wflag_f >= 0.5) | (whas & wflag_nn)
        wlev = np.where(whas, wlev_near, lo)
        # Ensure core wet cells stay below their water surface
        core_wet = whas & (whas_f >= 0.65)
        elev = np.where(core_wet, np.minimum(elev, wlev - 1.5), elev)

    # Clamp any water body standing > SPILL_SLACK above the 25th percentile of its shore
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
        spill = float(np.percentile(elev[shore], 25))
        over = body & (wlev > spill + SPILL_SLACK)
        if over.any():
            spilled += int(over.sum())
            wlev[over] = spill

    return elev, wflag, whas, wlev, i0, j0, nx, ny, su, sv, spilled


def synthesize_option_c_relief(D, elev, whas, wflag, bmap, biomes, omap, overlays, palaeo_masks, palaeo_lakes,
                               x0, y0, cx, cy, i0, j0, su, sv, S):
    """Option C sub-cell geomorphological synthesis on the super-sampled regional height grid (su >= 2.0).
    Bakes sub-kilometre (250 m - 3,000 m) biome-specific landforms that lie below the 2 km/px Nyquist limit of the
    global scale model, guarded around settlements and shorelines."""
    ny, nx = elev.shape
    gx = (np.arange(nx, dtype=np.float64) + i0) / su
    gy = (np.arange(ny, dtype=np.float64) + j0) / sv
    GY, GX = np.meshgrid(gy, gx, indexing='ij')

    # World coordinates in km relative to global map origin (deterministic across any region cut!)
    X_km = GX * 2.0
    Z_km = GY * 2.0

    # Map-grid indices (clamped to the cropped full-res box W x H)
    H_box, W_box = bmap.shape
    mx = np.clip(np.round(GX - x0).astype(np.int32), 0, W_box - 1)
    my = np.clip(np.round(GY - y0).astype(np.int32), 0, H_box - 1)
    b_idx = bmap[my, mx]

    # Guard mask: 0 on wet cells & within 2 cells of water, and 0 within 2.5 km of any settlement
    wet = whas | wflag
    shore_cells = max(2, int(round(1.5 * su)))
    dist_water_km = ndimage.distance_transform_edt(~wet) * (2.0 / su)
    guard = _smoothstep(1.0, 3.2, dist_water_km)
    for s in S:
        spx, spy = s.get('px'), s.get('py')
        if spx is None or not (x0 - 5 <= spx <= x0 + W_box + 5 and y0 - 5 <= spy <= y0 + H_box + 5):
            continue
        d_km = np.hypot((GX - spx) * 2.0, (GY - spy) * 2.0)
        guard *= _smoothstep(2.2, 5.0, d_km)

    # Local slope & 4-km relief on the height grid
    step_4km = max(1, int(round(2.0 * su)))
    rel_local = ndimage.maximum_filter(elev, size=2 * step_4km + 1) - ndimage.minimum_filter(elev, size=2 * step_4km + 1)
    gy_e, gx_e = np.gradient(elev, 2.0 / sv, 2.0 / su)   # m per km
    slope_m_km = np.hypot(gx_e, gy_e)

    # Shared sub-cell noise fields (wavelengths 0.6 km to 3.2 km, below the 4 km Nyquist limit of the 2 km/px map)
    n_meso = _fbm(X_km / 2.2, Z_km / 2.2, octaves=3, seed=501)
    n_fine = _fbm(X_km / 0.85, Z_km / 0.85, octaves=2, seed=509)
    r_meso = _ridged(X_km / 2.4, Z_km / 2.4, octaves=3, seed=601)
    r_fine = _ridged(X_km / 0.95, Z_km / 0.95, octaves=2, seed=613)

    dh = np.zeros_like(elev, dtype=np.float64)

    # Group biome IDs by geomorphological family
    fam_ids = {
        'karst': [],       # k-guilin, nw bay
        'scabland': [],    # n semiarid, ria valley
        'maar_chasm': [],  # siphon pits, region 99
        'ringfold': [],    # sw highlands
        'badland': [],     # e badlands, painted highlands, yuni valley
        'tableland': [],   # sedesert, w outer wall, tiers, the cut, crater drylands, savannah rims
        'yardang': [],     # the bowl, the catch, e abysss, e abyss
        'volcanic': [],    # throne/volcano, godthrone, godstep valley, steaming seamounts
        'alpine': [],      # n/s/e highlands, nw outer wall, copper glacier, tharn uplands, rift rims, stalker, outlands
        'tepui_rift': [],  # korona / ne, arachnoid canyons, rift, high rift, xanadu
        'humid': [],       # hyperjungle N/S, savage hyperjungle, sw/nw lowlands, double delta, farside, arch, crook, sw bay
        'oidong': [],      # oidong valley
    }
    for b in biomes:
        nm = b['name'].lower()
        bid = b['id']
        if nm in ('k-guilin', 'nw bay'):
            fam_ids['karst'].append(bid)
        elif nm in ('n semiarid', 'ria valley'):
            fam_ids['scabland'].append(bid)
        elif nm in ('siphon pits', 'region 99', 'loom chasms'):
            fam_ids['maar_chasm'].append(bid)
        elif nm == 'sw highlands':
            fam_ids['ringfold'].append(bid)
        elif nm in ('e badlands', 'painted highlands', 'yuni valley'):
            fam_ids['badland'].append(bid)
        elif nm in ('sedesert', 'w outer wall', 'tiers', 'the cut', 'crater drylands', 'crater drylands n',
                    'crater drylands s', 'e savannah rim', 'se savannah rim', 'ne rim'):
            fam_ids['tableland'].append(bid)
        elif nm in ('the bowl', 'the catch', 'e abysss', 'e abyss'):
            fam_ids['yardang'].append(bid)
        elif nm in ('throne/volcano', 'godthrone', 'godstep valley', 'steaming seamounts'):
            fam_ids['volcanic'].append(bid)
        elif nm in ('n highlands', 's highlands', 'e inner wall', 'e highlands', 'nw outer wall', 'copper glacier',
                    'tharn uplands', 'rift rim n', 'rift rim s', 'w rift highland', 'stalker range', 'stalker gate',
                    'mid basin', 'n outlands', 's outlands'):
            fam_ids['alpine'].append(bid)
        elif nm in ('korona / ne', 'arachnoid canyons', 'rift', 'high rift', 'xanadu'):
            fam_ids['tepui_rift'].append(bid)
        elif nm == 'oidong valley':
            fam_ids['oidong'].append(bid)
        else:
            fam_ids['humid'].append(bid)

    def fam_weight(ids):
        if not ids:
            return None
        m = np.isin(b_idx, ids).astype(np.float64)
        if not m.any():
            return None
        return ndimage.gaussian_filter(m, sigma=max(1.0, 1.2 * su))

    # 1. Karst Tower & Cockpit Synthesis (k-guilin, nw bay): sub-cell fenglin spires (+35..+85 m) & cockpit dolines (-22 m)
    w_karst = fam_weight(fam_ids['karst'])
    if w_karst is not None:
        # Steep cellular cones on uplands above the flat alluvial poljes
        polje_keep = _smoothstep(18.0, 65.0, slope_m_km) * _smoothstep(-1480.0, -1120.0, elev)
        spires = np.power(np.clip(r_fine, 0.0, 1.0), 2.2) * 72.0 + np.clip(n_fine, 0.0, 1.0) * 24.0
        dolines = -22.0 * np.power(np.clip(-n_meso, 0.0, 1.0), 2.5) * _smoothstep(-950.0, -650.0, elev)
        dh += w_karst * (polje_keep * spires + dolines)

    # 2. Ring-Fold Hogback & Joint-Pillar Tableland Synthesis (sw highlands)
    w_ring = fam_weight(fam_ids['ringfold'])
    if w_ring is not None:
        # Sub-cell second-harmonic bedding ridges and joint-pillar rim crenellations
        bed_fins = (r_meso - 0.42) * 48.0 * _smoothstep(25.0, 110.0, slope_m_km)
        joint_towers = np.power(np.clip(r_fine, 0.0, 1.0), 2.4) * 34.0 * _smoothstep(1800.0, 2600.0, elev)
        dh += w_ring * (bed_fins + joint_towers)

    # 3. Danxia Cuesta & Dendritic Badland Rill Synthesis (e badlands, painted highlands, yuni valley)
    w_bad = fam_weight(fam_ids['badland'])
    if w_bad is not None:
        gully_incision = -36.0 * np.power(np.clip(1.0 - r_fine, 0.0, 1.0), 3.0) * _smoothstep(20.0, 120.0, slope_m_km)
        step_m = 48.0
        frac = (elev / step_m) - np.floor(elev / step_m)
        ledge = (_smoothstep(0.78, 0.96, frac) - frac) * step_m * 0.32 * _smoothstep(35.0, 160.0, rel_local)
        dh += w_bad * (gully_incision + ledge + 14.0 * n_fine)

    # 4. Stepped Tableland, Mesa Caprock & Loess Yuan Synthesis (sedesert, w outer wall, tiers, the cut, crater drylands)
    w_tab = fam_weight(fam_ids['tableland'])
    if w_tab is not None:
        step_m = 60.0
        frac = (elev / step_m) - np.floor(elev / step_m)
        ledge = (_smoothstep(0.80, 0.96, frac) - frac) * step_m * 0.35 * _smoothstep(45.0, 220.0, rel_local)
        yuan_gully = -24.0 * np.power(np.clip(1.0 - r_meso, 0.0, 1.0), 3.2) * _smoothstep(25.0, 95.0, slope_m_km)
        dh += w_tab * (ledge + yuan_gully + 10.0 * n_fine)

    # 5. Kalut Megayardang Flutes & Deflated Erg Dunes (the bowl, the catch, e abysss)
    w_yard = fam_weight(fam_ids['yardang'])
    if w_yard is not None:
        # NW-SE wind-aligned yardang corridors (anisotropic along X_km*0.75 + Z_km*0.66)
        u_along = (X_km * 0.75 + Z_km * 0.66) / 3.8 + 0.35 * n_meso
        u_cross = (-X_km * 0.66 + Z_km * 0.75) / 0.75 + 0.25 * n_fine
        yard_flute = np.sin(u_cross * 2.0 * math.pi) * (0.6 + 0.4 * _vnoise(u_along, u_cross * 0.2, 701))
        flat_mask = _smoothstep(90.0, 22.0, slope_m_km) * _smoothstep(18.0, 6.0, dist_water_km)
        dh += w_yard * flat_mask * (22.0 * yard_flute + 10.0 * n_fine)

    # 6. Maar-Caldera Arête & Chasm Fault-Ledge Synthesis (siphon pits, region 99)
    w_maar = fam_weight(fam_ids['maar_chasm'])
    if w_maar is not None:
        arete_crisp = (r_fine - 0.38) * 38.0 * _smoothstep(30.0, 140.0, slope_m_km)
        step_m = 55.0
        frac = (elev / step_m) - np.floor(elev / step_m)
        chasm_ledge = (_smoothstep(0.82, 0.97, frac) - frac) * step_m * 0.38 * _smoothstep(80.0, 350.0, rel_local)
        dh += w_maar * (arete_crisp + chasm_ledge)

    # 7. Volcanic Barranco Chutes & Flood-Basalt Lava Steps (throne/volcano, godthrone, godstep valley)
    w_volc = fam_weight(fam_ids['volcanic'])
    if w_volc is not None:
        barranco = -28.0 * np.power(np.clip(1.0 - r_fine, 0.0, 1.0), 2.8) * _smoothstep(35.0, 160.0, slope_m_km)
        step_m = 36.0
        frac = (elev / step_m) - np.floor(elev / step_m)
        lava_step = (_smoothstep(0.76, 0.95, frac) - frac) * step_m * 0.30 * _smoothstep(120.0, 35.0, slope_m_km)
        dh += w_volc * (barranco + lava_step + 12.0 * n_fine)

    # 8. Alpine Arête, Cirque & Permafrost Alas Synthesis (highlands, outer walls, rift rims, outlands)
    w_alp = fam_weight(fam_ids['alpine'])
    if w_alp is not None:
        high_w = _smoothstep(2400.0, 4200.0, elev)
        arete = (r_meso * 0.65 + r_fine * 0.35 - 0.42) * 52.0 * high_w * _smoothstep(25.0, 110.0, slope_m_km)
        low_rough = 14.0 * n_meso * (1.0 - 0.5 * high_w)
        dh += w_alp * (arete + low_rough)

    # 9. Tepui Escarpment, Arachnoid Fracture & Sky-Island Horst Synthesis (korona, arachnoids, rift, xanadu)
    w_tep = fam_weight(fam_ids['tepui_rift'])
    if w_tep is not None:
        scarp_crisp = (r_fine - 0.40) * 42.0 * _smoothstep(45.0, 180.0, slope_m_km)
        table_flat = 8.0 * n_fine * _smoothstep(80.0, 20.0, slope_m_km)
        dh += w_tep * (scarp_crisp + table_flat)

    # 10. Oidong Mirror-Pool Valley & Lateral Granite Crags (oidong valley)
    w_oid = fam_weight(fam_ids['oidong'])
    if w_oid is not None:
        wall_crag = (r_fine - 0.35) * 32.0 * _smoothstep(40.0, 130.0, slope_m_km)
        dh += w_oid * wall_crag

    # 11. Humid Lowlands, Hyperjungle Micro-Tepuis & Scabland Basalt Benches
    w_hum = fam_weight(fam_ids['humid'] + fam_ids['scabland'])
    if w_hum is not None:
        dh += w_hum * (12.0 * n_meso + 6.0 * n_fine) * _smoothstep(12.0, 65.0, slope_m_km)

    # 12. Scabland Overlay (floodzone) & Breached Dam Courses (DATA.floods): sub-cell basalt coulee steps & dry falls
    floods0 = D.get('floods') or []
    for f in floods0:
        pts_f = f.get('px') or []
        beds_f = f.get('bed_m') or []
        if len(pts_f) < 2 or len(beds_f) < 2:
            continue
        fx = [p[0] for p in pts_f]
        fy = [p[1] for p in pts_f]
        if max(fx) < x0 - 15 or min(fx) > x0 + W_box + 15 or max(fy) < y0 - 15 or min(fy) > y0 + H_box + 15:
            continue
        # Rasterize flood course centerline onto height grid and compute distance in km
        im_f = Image.new('L', (nx, ny), 0)
        ImageDraw.Draw(im_f).line([(p[0] * su - i0, p[1] * sv - j0) for p in pts_f], fill=1, width=1)
        mask_f = np.array(im_f, dtype=bool)
        if not mask_f.any():
            continue
        dist_f_km = ndimage.distance_transform_edt(~mask_f) * (2.0 / su)
        floor_hw = 0.5 * float(f.get('floor_km', 8.0))
        wall_w = float(f.get('walls_km', 6.0))
        in_coulee = _smoothstep(floor_hw + wall_w, floor_hw, dist_f_km)
        if in_coulee.max() > 0.01:
            # Flood-basalt flow step benches (28 m flows) & streamlined island / kolk pothole relief
            step_b = 28.0
            fb = (elev / step_b) - np.floor(elev / step_b)
            basalt_ledge = (_smoothstep(0.72, 0.94, fb) - fb) * step_b * 0.42
            kolk_cut = -18.0 * np.power(np.clip(-n_fine, 0.0, 1.0), 2.6)
            dh += in_coulee * (basalt_ledge + kolk_cut)

    # 13. Palaeolake Full-Pool Wave-Cut Shoreline Benches (+900 m, +1,050 m, +834 m)
    if palaeo_masks and palaeo_lakes:
        for pm, pl in zip(palaeo_masks, palaeo_lakes):
            lvl = float(pl['level_m'])
            wb = 18.0 if pl.get('kind') != 'flood lake' else 10.0
            u_b = (elev - lvl) / wb
            in_band = (np.abs(u_b) < 1.0) & pm
            if in_band.any():
                # Monotone wave-cut bench inflection at full pool level
                v_b = 1.0 - u_b * u_b
                bench_dh = -u_b * (v_b * v_b) * wb * (0.65 if pl.get('kind') != 'flood lake' else 0.40)
                dh = np.where(in_band, dh + bench_dh, dh)

    return elev + dh * guard


def carve_subcell_rivers(D, elev, whas, wflag, wlev, i0, j0, su, sv):
    """Carve sub-cell river and wadi channels along DATA.rivers onto the super-sampled height grid (su >= 2.0)
    so every named river and wadi has a monotonically descending thalweg and resolved gorge cross-section."""
    rivers0 = D.get('rivers') or []
    if not rivers0:
        return elev
    ny, nx = elev.shape
    wet = whas | wflag
    cell_m = 2000.0 / su
    out = elev.copy()

    for Rv in rivers0:
        drawn = Rv.get('drawn_px') or ('q_m3s' not in Rv and Rv.get('px'))
        src = drawn or Rv.get('px') or []
        if len(src) < 2:
            continue
        # Convert to height-grid coordinates (u, v)
        uv = [(p[0] * su - i0, p[1] * sv - j0) for p in src]
        us = [p[0] for p in uv]
        vs = [p[1] for p in uv]
        if max(us) < -4 or min(us) > nx + 3 or max(vs) < -4 or min(vs) > ny + 3:
            continue

        # Dense sub-cell sampling along the polyline (every 0.45 height cells)
        samples = []
        for k in range(len(uv) - 1):
            u0, v0 = uv[k]
            u1, v1 = uv[k + 1]
            seg_len = math.hypot(u1 - u0, v1 - v0)
            n_steps = max(1, int(math.ceil(seg_len / 0.45)))
            for s in range(n_steps if k < len(uv) - 2 else n_steps + 1):
                t = s / max(1, n_steps)
                u = u0 + (u1 - u0) * t
                v = v0 + (v1 - v0) * t
                ui, vi = int(round(u)), int(round(v))
                if 0 <= ui < nx and 0 <= vi < ny:
                    samples.append((vi, ui, float(out[vi, ui]), bool(wet[vi, ui])))
        if len(samples) < 2:
            continue

        # Target incision depth from river width / discharge (8 m for small wadis up to 48 m for major trunk rivers)
        w_m = float(Rv.get('width_m', RIVER_W))
        q_m3s = float(Rv.get('q_mouth_m3s') or 25.0)
        is_wadi = Rv.get('kind') == 'wadi'
        base_cut = np.clip(6.0 + 5.5 * math.log10(max(1.0, q_m3s)) + 0.04 * w_m, 7.0, 46.0)
        if is_wadi:
            base_cut *= 0.65

        # Enforce monotonically non-increasing thalweg profile from source to mouth
        thalweg = [s[2] - base_cut * (0.0 if s[3] else 1.0) for s in samples]
        for k in range(1, len(thalweg)):
            if thalweg[k] > thalweg[k - 1]:
                thalweg[k] = thalweg[k - 1]
        # Never carve a dry river cell below an adjacent lake's water level + 0.8 m
        reach_cells = max(1, min(4, int(round((w_m * 1.5 + 450.0) / cell_m))))
        for idx_s, (vj, ui, h0, is_wet_s) in enumerate(samples):
            if is_wet_s:
                continue
            bed_h = thalweg[idx_s]
            # Check local water floor so dry river bank does not flood into adjacent lake level
            j_lo, j_hi = max(0, vj - reach_cells), min(ny - 1, vj + reach_cells)
            i_lo, i_hi = max(0, ui - reach_cells), min(nx - 1, ui + reach_cells)
            local_wet = wet[j_lo:j_hi + 1, i_lo:i_hi + 1]
            if local_wet.any():
                max_wl = float(wlev[j_lo:j_hi + 1, i_lo:i_hi + 1][local_wet].max())
                bed_h = max(bed_h, max_wl + 0.8)
            for dj in range(-reach_cells, reach_cells + 1):
                jj = vj + dj
                if jj < 0 or jj >= ny:
                    continue
                for di in range(-reach_cells, reach_cells + 1):
                    ii = ui + di
                    if ii < 0 or ii >= nx or wet[jj, ii]:
                        continue
                    r_norm = math.hypot(dj, di) / (reach_cells + 0.35)
                    if r_norm >= 1.0:
                        continue
                    w_prof = (1.0 - r_norm * r_norm) ** 2
                    target_h = out[jj, ii] * (1.0 - w_prof) + bed_h * w_prof
                    if target_h < out[jj, ii]:
                        out[jj, ii] = target_h
    return out


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


def palaeo_waters(D, box, hbox, su, sv, cx, cy, out):
    """the old water bodies of the north basin (scale model 4.20: DATA.palaeolakes, DATA.dams, DATA.floods), as the
    overlays read them (biomes/nsemiarid/PLAN.md, section 2). Computed on the model's height grid (since a basin runs
    past any box), then resampled to the region's Option C height grid `hbox = (i0, j0, nx, ny)` at scale `(su, sv)`.

    Writes palaeo.png (one bit per body, on the cropped height grid) and returns (palaeo_meta, cropped_masks, lakes)."""
    lakes0, dams0, floods0 = D.get('palaeolakes') or [], D.get('dams') or [], D.get('floods') or []
    if not lakes0:
        return None, [], []
    lo, hi, OW, OH, VW, VH = D['lo'], D['hi'], D['fullW'], D['fullH'], D['w'], D['hh']
    su0, sv0 = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
    KM2 = (2.0 / su0) * (2.0 / sv0)
    h = raster(D, 'h')
    E = lo + ((h[..., 0].astype(np.int32) << 8) | h[..., 1]) / 65535.0 * (hi - lo)
    w = raster(D, 'wl')
    whas = w[..., 2] > 127
    wlev = np.where(whas, lo + ((w[..., 0].astype(np.int32) << 8) | w[..., 1]) / 65535.0 * (hi - lo), np.nan)
    cell = lambda p: (
        min(VH - 1, max(0, int(round(p[1] * sv0)))),
        min(VW - 1, max(0, int(round(p[0] * su0)))),
    )
    to_px = lambda j, i: [round(i / su0, 1), round(j / sv0, 1)]
    S8 = np.ones((3, 3))
    jj, ii = np.mgrid[0:VH, 0:VW]
    dam_r_cells = max(3, int(round(DAM_R * (su0 / 0.5))))
    barrier = np.zeros(E.shape, bool)
    for d in dams0:
        j, i = cell(d['site_px'])
        barrier |= (np.hypot(jj - j, ii - i) <= dam_r_cells) & (E < d['crest_m'])

    def comp(seed, level, bar=None):
        m = E <= level
        if bar is not None:
            m &= ~bar
        lab, _ = ndimage.label(m, structure=S8)
        return (lab == lab[seed]) & (lab > 0)

    def vol(m, base, level):
        return float(np.clip(level - np.maximum(E[m], base[m] if np.ndim(base) else base), 0, None).sum() * KM2 / 1000)

    wl_lab, _ = ndimage.label(whas, structure=S8)

    def remnants(m):
        out_ = []
        for k in np.unique(wl_lab[m & whas]):
            if k == 0:
                continue
            b = wl_lab == k
            if (b & m).sum() < 0.5 * b.sum():
                continue
            j, i = np.argwhere(b).mean(0)
            out_.append({'level_m': round(float(np.nanmedian(wlev[b])), 1), 'km2': round(float(b.sum() * KM2)), 'at_px': to_px(j, i)})
        return sorted(out_, key=lambda r: -r['km2'])

    lakes, masks = [], []
    for L in lakes0:
        seed = cell(L['seed_px'])
        m = comp(seed, L['level_m'], barrier)
        dam = next((d for d in dams0 if d.get('basin') == L['basin']), None)
        sill = float(dam['foot_m']) if dam else None
        rec = {'name': L['basin'], 'kind': 'dam lake', 'level_m': L['level_m'], 'sill_m': sill, 'ring_m': RING_M,
               'seed_px': L['seed_px'], 'km2': round(float(m.sum() * KM2)), 'dry_km2': round(float((m & ~whas).sum() * KM2)),
               'model_km2': L.get('km2'), 'model_km3': L.get('km3'), 'remnants': remnants(m)}
        if sill is not None:
            rec['volume_above_sill_km3'] = round(vol(m, sill, L['level_m']))
            rec['volume_below_sill_km3'] = round(vol(m & (E < sill), -1e9, sill))
        lakes.append(rec)
        masks.append(m)
    # the flood lake: the water over every sill pooled where the last breach ends
    last = max(floods0, key=lambda f: f.get('order', 0)) if floods0 else None
    if last is not None and all('volume_above_sill_km3' in r for r in lakes):
        jt, it = cell(last['px'][-1])
        ys, xs = np.nonzero(wl_lab > 0)
        c = np.argmin((ys - jt) ** 2 + (xs - it) ** 2)
        tb = wl_lab == wl_lab[ys[c], xs[c]]
        t_level = float(np.nanmedian(wlev[tb]))
        tseed = (int(ys[c]), int(xs[c]))
        flood = sum(r['volume_above_sill_km3'] for r in lakes)
        base = np.full(E.shape, t_level)
        for r, m in zip(lakes, masks):
            base[m & (E < r['sill_m'])] = r['sill_m']      # a dam basin stood full to its sill when the flood came
        a, b = t_level, hi
        for _ in range(40):
            mid = (a + b) / 2
            if vol(comp(tseed, mid), base, mid) < flood:
                a = mid
            else:
                b = mid
        fm = comp(tseed, a)
        lakes.append({'name': 'flood lake', 'kind': 'flood lake', 'level_m': round(a, 1), 'before_m': round(t_level, 1),
                      'volume_km3': round(flood), 'seed_px': to_px(*tseed), 'km2': round(float(fm.sum() * KM2)),
                      'dry_km2': round(float((fm & ~whas).sum() * KM2)), 'remnants': remnants(fm),
                      'note': "every dam lake's water over its sill, pooled where the last breach ends; the body there "
                              "taken at its level today (the owner, 2026-10-20)"})
        masks.append(fm)

    # Map dilated masks onto the region's Option C height grid (i0, j0, nx, ny) at scale (su, sv)
    i0, j0, nx, ny = hbox
    gx = (np.arange(nx, dtype=np.float64) + i0) / su
    gy = (np.arange(ny, dtype=np.float64) + j0) / sv
    uh_idx = np.clip(np.round(gx * su0).astype(np.int32), 0, VW - 1)
    vh_idx = np.clip(np.round(gy * sv0).astype(np.int32), 0, VH - 1)

    pad_base = max(2, int(round(PALAEO_PAD * (su0 / 0.5))))
    pad_target = max(2, int(round(PALAEO_PAD * (su / 0.5))))
    pal = np.zeros((ny, nx), np.uint8)
    cropped_masks = []
    for k, m in enumerate(masks):
        md = ndimage.binary_dilation(m, structure=S8, iterations=pad_base)
        mc = md[np.ix_(vh_idx, uh_idx)]
        cropped_masks.append(mc)
        lakes[k]['bit'] = k
        pal |= (mc.astype(np.uint8) << k)

    x0, y0, x1, y1 = box
    inb = lambda p: x0 <= p[0] <= x1 and y0 <= p[1] <= y1
    floods = []
    for f in floods0:
        if not any(inb(p) for p in f['px']):
            continue
        floods.append({'name': f['name'], 'order': f.get('order'), 'from': f.get('from'), 'to': f.get('to'),
                       'floor_km': f.get('floor_km'), 'walls_km': f.get('walls_km'), 'px': f['px'],
                       'm': [[round((a - cx) * 2000.0, 1), round((b - cy) * 2000.0, 1)] for a, b in f['px']],
                       'bed_m': f.get('bed_m'),
                       'note': 'bed_m runs evenly along the course, first to last'})
    dams = [dict(d, m=[round((d['site_px'][0] - cx) * 2000.0, 1), round((d['site_px'][1] - cy) * 2000.0, 1)])
            for d in dams0 if inb(d['site_px'])]
    if not pal.any() and not floods and not dams:
        return None, [], []
    save8(os.path.join(out, 'palaeo.png'), pal)
    return {'lakes': lakes, 'dams': dams, 'floods': floods, 'grid': 'the height grid (elev.png)', 'pad_cells': pad_target}, cropped_masks, lakes


def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')   # the rivers' names are in their tongues
    except Exception:
        pass
    argv = sys.argv[1:]
    added = []
    upsample_arg = 'auto'
    do_synth = True
    legacy_px_flag = False
    while '--add' in argv or '--upsample' in argv or '--no-synth' in argv or '--legacy-px' in argv:
        if '--add' in argv:
            k = argv.index('--add')
            added = json.load(open(argv[k + 1], encoding='utf-8'))
            argv = argv[:k] + argv[k + 2:]
        elif '--upsample' in argv:
            k = argv.index('--upsample')
            upsample_arg = argv[k + 1]
            argv = argv[:k] + argv[k + 2:]
        elif '--no-synth' in argv:
            k = argv.index('--no-synth')
            do_synth = False
            argv = argv[:k] + argv[k + 1:]
        elif '--legacy-px' in argv:
            k = argv.index('--legacy-px')
            legacy_px_flag = True
            argv = argv[:k] + argv[k + 1:]
    if len(argv) != 5:
        sys.exit(__doc__)
    page, rdir, sdir, name, out = argv
    D = load_page(page)
    R = load_collection(rdir, 'regions')
    S = load_collection(sdir, 'settlements')
    R, S, added = auto_shift_collections(D, R, S, added, target_name=name, legacy_px_flag=legacy_px_flag)
    reg = [r for r in R if r.get('name') == name]
    if not reg:
        reg = [r for r in R if r.get('name', '').lower() == name.lower()]
    if not reg:
        sys.exit('no region named %r' % name)
    reg = reg[0]
    OW, OH, VW, VH = D['fullW'], D['fullH'], D['w'], D['hh']
    lo, hi = D['lo'], D['hi']
    xs = [p[0] for p in reg['points']] + [p[0] for a in added for p in a['map_px']]
    ys = [p[1] for p in reg['points']] + [p[1] for a in added for p in a['map_px']]
    x0 = int(math.floor((min(xs) - MARGIN) / 2) * 2)
    y0 = int(math.floor((min(ys) - MARGIN) / 2) * 2)
    x1 = int(math.ceil((max(xs) + MARGIN) / 2) * 2)
    y1 = int(math.ceil((max(ys) + MARGIN) / 2) * 2)
    x0, y0, x1, y1 = max(0, x0), max(0, y0), min(OW - 1, x1), min(OH - 1, y1)
    W, H = x1 - x0 + 1, y1 - y0 + 1
    cx, cy = int((min(xs) + max(xs)) // 2), int((min(ys) + max(ys)) // 2)
    os.makedirs(out, exist_ok=True)

    # Determine Option C super-sampling factor U (cells per 2 km map pixel)
    if str(upsample_arg).lower() == 'auto':
        U = 4.0 if (W * H <= AUTO_UPSAMPLE_MAX_PX) else 2.0
    else:
        U = float(upsample_arg)

    # ---- full-resolution rasters (computed first so biome & overlay masks can inform Option C height synthesis)
    crop = lambda a: a[y0:y1 + 1, x0:x1 + 1]
    clim = crop(raster(D, 'c')[..., 0])
    rain = crop(raster(D, 'p')[..., 0])
    temp = crop(raster(D, 'tm')[..., 0])
    save8(os.path.join(out, 'clim.png'), clim)
    save8(os.path.join(out, 'rain.png'), rain)
    save8(os.path.join(out, 'temp.png'), temp)
    inside = poly_mask(reg['points'], x0, y0, W, H)
    for a in added:   # the added polygons (--add): the cut is the union
        inside = inside | poly_mask(a['map_px'], x0, y0, W, H)
    save8(os.path.join(out, 'mask.png'), inside * 255)

    # ---- biome overlays: the smaller polygon wins an overlap; the rest of the box takes the nearest overlay
    over = [r for r in R if r.get('kind') == 'biome' or r.get('name', '').lower() in EXTRA_BIOMES]
    over = [r for r in over if r.get('name', '').strip().lower() not in OVERLAYS
            and r.get('name', '').strip().lower() not in TOOL_REGIONS_EXACT]
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

    # ---- each biome's distance field (dist.png): its drawn polygon in a box DIST_PAD past this one, so a polygon that
    # runs out of the box still measures from where it is
    P = DIST_PAD
    dist = np.zeros((H * len(over), W), np.int64)
    for k, r in enumerate(over):
        dist[k * H:(k + 1) * H] = dist2(poly_mask(r['points'], x0 - P, y0 - P, W + 2 * P, H + 2 * P))[P:P + H, P:P + W]
        biomes[k]['dist_band'] = k
    if over:
        save24(os.path.join(out, 'dist.png'), dist)

    # ---- the overlays: drawn polygons, one bit each (no nearest-fill: an overlay is only where it is drawn)
    overlays = []
    omap = np.zeros((H, W), np.uint8)
    for r in R:
        nm = r.get('name', '').strip()
        if nm.lower() not in OVERLAYS:
            continue
        m = poly_mask(r['points'], x0, y0, W, H)
        if not m.any():
            continue
        k = len(overlays)
        omap[m] |= 1 << k
        overlays.append({'bit': k, 'name': nm, 'doc': r['id'], 'build': OVERLAYS[nm.lower()], 'colour': r.get('color'),
                         'drawn_px': int(m.sum()), 'px_in_region': int((m & inside).sum()), 'notes': r.get('notes', '')})
    if overlays:
        save8(os.path.join(out, 'overlay.png'), omap)

    # ---- Option C heights and water, super-sampled to (su, sv) with sub-cell geomorphological & fluvial synthesis
    elev, wflag, whas, wlev, i0, j0, nx, ny, su, sv, spilled = upsample_heights_and_water(D, x0, y0, x1, y1, U)
    palaeo, palaeo_masks, palaeo_lakes = palaeo_waters(D, (x0, y0, x1, y1), (i0, j0, nx, ny), su, sv, cx, cy, out)
    if do_synth and su >= 1.5:
        elev = synthesize_option_c_relief(D, elev, whas, wflag, bmap, biomes, omap, overlays,
                                          palaeo_masks, palaeo_lakes, x0, y0, cx, cy, i0, j0, su, sv, S)
        elev = carve_subcell_rivers(D, elev, whas, wflag, wlev, i0, j0, su, sv)
        # Re-verify wet cells remain below water surface after synthesis
        elev = np.where(whas, np.minimum(elev, wlev - 1.0), elev)

    save16(os.path.join(out, 'elev.png'), elev, lo, hi, wflag)
    save16(os.path.join(out, 'wlev.png'), wlev, lo, hi, whas)

    # ---- the escarpments: where the land drops from a plateau to a floor (the eastern abyss's rim), the open world
    # sharpens the drop into a cliff at 1:1 (WORLD.H). Per height cell: the floor's level L and the plateau's level U
    # (low and high percentiles over a disc of SCARP_R 4-km cells = 24 km) and a weight, 1 on the rim band round the
    # abyss's floor where the rise exceeds 700 m, feathered to 0.
    abyss_b = [b for b in biomes if b['name'].lower() in ('e abysss', 'e abyss')]
    sw = np.zeros(elev.shape)
    # Compute Lr and Ur on a ~4 km grid and bilinearly map to (ny, nx) so large percentile filters stay instantaneous
    step_sc = max(1, int(round(su / 0.5)))
    elev_sub = elev[::step_sc, ::step_sc]
    yy_, xx_ = np.mgrid[-SCARP_R:SCARP_R + 1, -SCARP_R:SCARP_R + 1]
    disc = (xx_ * xx_ + yy_ * yy_) <= SCARP_R * SCARP_R
    Lr_sub = ndimage.percentile_filter(elev_sub, 8, footprint=disc)
    Ur_sub = ndimage.percentile_filter(elev_sub, 68, footprint=disc)
    if step_sc == 1:
        Lr, Ur = Lr_sub, Ur_sub
    else:
        vj = np.clip(np.arange(ny, dtype=np.float64) / step_sc, 0, Lr_sub.shape[0] - 1)
        ui = np.clip(np.arange(nx, dtype=np.float64) / step_sc, 0, Lr_sub.shape[1] - 1)
        vv_s, uu_s = np.meshgrid(vj, ui, indexing='ij')
        Lr = ndimage.map_coordinates(Lr_sub, [vv_s, uu_s], order=1, mode='nearest')
        Ur = ndimage.map_coordinates(Ur_sub, [vv_s, uu_s], order=1, mode='nearest')
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
        # Gradient in m per 4 km cell so the threshold (steep > 500 m / 4 km) is resolution-invariant
        gy_, gx_ = np.gradient(elev, 0.5 / sv, 0.5 / su)
        steep = ndimage.maximum_filter(np.hypot(gx_, gy_), size=max(3, int(round(3 * scale_4km))))
        sw = band * np.clip((Ur - Lr - 700) / 500, 0, 1) * np.clip((steep - 500) / 400, 0, 1)
        # Keep cliff sharpening off within 3 4-km cells (12 km) of a drawn river course, easing back by 6 (24 km)
        if D.get('rivers'):
            im = Image.new('L', (nx, ny), 0)
            for Rv in D['rivers']:
                drawn = Rv.get('drawn_px') or ('q_m3s' not in Rv and Rv.get('px'))
                if drawn:
                    ImageDraw.Draw(im).line([(a * su - i0, b * sv - j0) for a, b in drawn], fill=1, width=1)
            dr_4km = ndimage.distance_transform_edt(~np.array(im).astype(bool)) / scale_4km
            sw = sw * np.clip((dr_4km - 3.0) / 3.0, 0, 1)
        sw = ndimage.gaussian_filter(sw, 1.2 * scale_4km)
    save16(os.path.join(out, 'scarpl.png'), Lr, lo, hi, np.zeros(elev.shape, bool))
    save16(os.path.join(out, 'scarpu.png'), Ur, lo, hi, np.zeros(elev.shape, bool))
    save8(os.path.join(out, 'scarpw.png'), np.clip(sw * 255, 0, 255))

    # ---- drainage on a 2 km/cell (su_d <= 1.0) grid with 16-km2-normalized accumulation so CHANNEL_MIN is invariant
    gx = (np.arange(nx, dtype=np.float64) + i0) / su            # each height cell's full-res pixel position
    gy = (np.arange(ny, dtype=np.float64) + j0) / sv
    step_d = max(1, int(round(su)))                             # ~2 km spacing for fast, unfragmented D8 routing
    elev_d = elev[::step_d, ::step_d]
    sink_d = (whas | wflag)[::step_d, ::step_d]
    gx_d = gx[::step_d]
    gy_d = gy[::step_d]
    su_d, sv_d = su / step_d, sv / step_d
    km2_d = (2.0 / su_d) * (2.0 / sv_d)
    area_scale = km2_d / 16.0                                   # normalize cell weight to reference 4x4 km (16 km2) cell

    rain_full = raster(D, 'p')[..., 0].astype(np.float64) / 255.0 * 4000.0
    rx = np.clip(np.round(gx_d).astype(int), 0, OW - 1)
    ry = np.clip(np.round(gy_d).astype(int), 0, OH - 1)
    rain_h = np.maximum(rain_full[np.ix_(ry, rx)], RAIN_FLOOR) * area_scale
    F, rec, acc = drainage(elev_d, sink_d, rain_h)
    chan = (acc >= CHANNEL_MIN) & ~sink_d
    ny_d, nx_d = elev_d.shape
    feeds = np.zeros(elev_d.shape, np.int32)
    for j in range(ny_d):
        for i in range(nx_d):
            if chan[j, i]:
                a, b = rec[j, i]
                if a >= 0 and chan[a, b]:
                    feeds[a, b] += 1
    seen = np.zeros(elev_d.shape, bool)
    to_world_d = lambda j, i: ((gx_d[i] - cx) * 2000.0, (gy_d[j] - cy) * 2000.0)
    lines = []
    heads = [(j, i) for j in range(ny_d) for i in range(nx_d) if chan[j, i] and feeds[j, i] == 0]
    heads.sort(key=lambda t: -acc[t])
    starts = sorted(heads, key=lambda t: -elev_d[t])
    for j, i in starts:
        pts = []
        while True:
            X, Z = to_world_d(j, i)
            pts.append([round(X, 1), round(Z, 1), round(float(acc[j, i]), 0), round(float(elev_d[j, i]), 1)])
            if seen[j, i]:
                break
            seen[j, i] = True
            a, b = rec[j, i]
            if a < 0:
                break
            if not chan[a, b]:
                X, Z = to_world_d(a, b)       # the mouth: into a lake, the sea or a non-channel sink
                pts.append([round(X, 1), round(Z, 1), round(float(acc[j, i]), 0), round(float(elev_d[a, b]), 1)])
                break
            j, i = a, b
        if len(pts) >= 2:
            lines.append(pts)

    # ---- the rivers the scale model designates (DATA.rivers: perennial rivers and dry wadis)
    def bil(A, u, v):
        u = min(max(0.0, float(u)), A.shape[1] - 1.0001)
        v = min(max(0.0, float(v)), A.shape[0] - 1.0001)
        i, j = int(u), int(v)
        fu, fv = u - i, v - j
        return (A[j, i] * (1 - fu) + A[j, i + 1] * fu) * (1 - fv) + (A[j + 1, i] * (1 - fu) + A[j + 1, i + 1] * fu) * fv

    rivers, valleys = [], []
    for Rv in D.get('rivers', []):
        drawn = Rv.get('drawn_px') or ('q_m3s' not in Rv and Rv.get('px'))
        src = drawn or Rv.get('px') or []
        if not src:
            continue
        step = 4 if drawn else 1
        idx = list(range(0, len(src), step)) + ([len(src) - 1] if (len(src) - 1) % step else [])
        qs = Rv.get('q_m3s')
        line = []
        for n in idx:
            a, b = src[n]
            if not (0 <= a * su - i0 < nx - 1 and 0 <= b * sv - j0 < ny - 1):
                continue
            v = [round((a - cx) * 2000.0, 1), round((b - cy) * 2000.0, 1), round(float(bil(elev, a * su - i0, b * sv - j0)), 1)]
            if qs:
                v.append(qs[min(len(qs) - 1, round(n / max(1, len(src) - 1) * (len(qs) - 1)))])
            line.append(v)
        if len(line) < 2:
            continue
        rec_r = {'name': Rv['name'], 'id': Rv.get('id'), 'to': Rv.get('to'), 'line': line,
                 'width_m': Rv.get('width_m', RIVER_W), 'depth_m': Rv.get('depth_m', RIVER_D),
                 'q_mouth_m3s': Rv.get('q_mouth_m3s'), 'order': Rv.get('order'), 'catchment_km2': Rv.get('catchment_km2')}
        (valleys if Rv.get('kind') == 'wadi' else rivers).append(rec_r)

    # ---- subterranean lava tubes & caverns (DATA.tubes) inside the box
    tubes = []
    for tb in D.get('tubes', []):
        pts_tb = tb.get('px') or tb.get('pts') or []
        all_pts = list(pts_tb)
        for br in tb.get('branches', []):
            all_pts.extend(br.get('px') or [])
        for cv in tb.get('caverns', []):
            if 'px' in cv:
                all_pts.append(cv['px'])
        if not any(x0 <= p[0] <= x1 and y0 <= p[1] <= y1 for p in all_pts):
            continue
        tb_rec = copy.deepcopy(tb)
        tb_rec['m'] = [[round((p[0] - cx) * 2000.0, 1), round((p[1] - cy) * 2000.0, 1)] for p in pts_tb]
        for br in tb_rec.get('branches', []):
            if br.get('px'):
                br['m'] = [[round((p[0] - cx) * 2000.0, 1), round((p[1] - cy) * 2000.0, 1)] for p in br['px']]
        for key_sub in ('caverns', 'skylights', 'entrances'):
            if tb_rec.get(key_sub):
                for item in tb_rec[key_sub]:
                    if 'px' in item:
                        item['m'] = [round((item['px'][0] - cx) * 2000.0, 1), round((item['px'][1] - cy) * 2000.0, 1)]
        tubes.append(tb_rec)

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
                     'x': (px - cx) * 2000.0, 'z': (py - cy) * 2000.0, 'biome': biomes[b]['name'] if b < len(biomes) else None,
                     'notes': s.get('notes', '')})

    # ---- canyon candidates for the ruins: troughs in the heights near the marker (evaluated at ~4 km and ~8 km offsets)
    r1_cells = max(1, int(round(2.0 * su_d)))
    r2_cells = max(2, int(round(4.0 * su_d)))
    def trough(r):
        best, axis = np.full(elev_d.shape, -1e9), np.zeros(elev_d.shape, np.int8)
        for k, (dj, di) in enumerate([(0, 1), (1, 0), (1, 1), (1, -1)]):
            A = np.roll(elev_d, (-r * dj, -r * di), (0, 1))
            B = np.roll(elev_d, (r * dj, r * di), (0, 1))
            v = np.minimum(A, B) - elev_d
            axis = np.where(v > best, k, axis)
            best = np.maximum(best, v)
        return best, axis
    V1, ax1 = trough(r1_cells)
    V2, _ = trough(r2_cells)
    canyon = (V1 > CANYON_MIN[0]) & (V2 > CANYON_MIN[1]) & ~sink_d
    canyon[:r2_cells, :] = canyon[-r2_cells:, :] = canyon[:, :r2_cells] = canyon[:, -r2_cells:] = False
    runs = ['north-south', 'east-west', 'north-east to south-west', 'north-west to south-east']
    cand = {}
    for s in sett:
        if s['type'] not in RUIN_TYPES:
            continue
        best = []
        for j, i in zip(*np.nonzero(canyon)):
            X, Z = to_world_d(j, i)
            d = math.hypot(X - s['x'], Z - s['z'])
            best.append({'x': round(float(X), 1), 'z': round(float(Z), 1), 'dist_m': round(d), 'floor_m': round(float(elev_d[j, i])),
                         'depth_m': round(float(V1[j, i])), 'depth2_m': round(float(V2[j, i])), 'runs': runs[int(ax1[j, i])]})
        best.sort(key=lambda c: c['dist_m'])
        cand[s['name']] = best[:5]

    classes = D['climate']['classes']
    meta = {
        'format': 'krator-openworld-region', 'version': 1, 'source': 'Krator Scale Model ' + D['_version'],
        'region': {'name': reg['name'], 'doc': reg['id'], 'points_px': reg['points'],
                   'points_m': [[(a - cx) * 2000.0, (b - cy) * 2000.0] for a, b in reg['points']],
                   'area_km2': round(poly_area(reg['points']) * 4), 'union_km2': int(inside.sum()) * 4,
                   'added': [{'name': a.get('name', ''), 'points_px': a['map_px'], 'area_km2': round(poly_area(a['map_px']) * 4)} for a in added]},
        'frame': {'units': 'm', 'x': 'east', 'z': 'south', 'm_per_px': 2000.0, 'origin_px': [cx, cy],
                  'box_px': [x0, y0, x1, y1], 'size_px': [W, H]},
        'heights': {'grid': [nx, ny], 'origin_cell': [i0, j0], 'su': su, 'sv': sv, 'lo': lo, 'hi': hi,
                    'cell_m': round(2000.0 / su, 1), 'upsample': round(su, 2), 'option_c_synth': bool(do_synth and su >= 1.5),
                    'note': 'cell (i,j) sits at full px ((i+i0)/su, (j+j0)/sv); elev.png and wlev.png are this grid'},
        'rain': {'scale_mm': 4000 / 255}, 'temp': {'offset': -90},
        'pressure': {'atm0': 1.6, 'scale_m': 8000},
        'classes': classes, 'biomes': biomes, 'biome_fill_px': filled,
        'dist': {'file': 'dist.png', 'bands': len(over), 'band_px': [W, H], 'encoding': 'R<<16 | G<<8 | B',
                 'value': 'squared distance in map pixels to the biome\'s drawn polygon (pixel centres; 0 inside)',
                 'pad_px': DIST_PAD, 'note': 'exact up to pad_px; metres = sqrt(value) * m_per_px (core/mask KMASK.distance)'},
        'drainage': {'min_accum': CHANNEL_MIN, 'lines': lines},
        'rivers': rivers, 'valleys': valleys,
        'water': {'spilled_cells': spilled, 'note': 'lake levels above their lowest shore cell were lowered to it'},
        'settlements': sett, 'canyon_candidates': cand,
        'volcano': D.get('volc'), 'vents': [v for v in D.get('vents', []) if x0 <= v['px'][0] <= x1 and y0 <= v['px'][1] <= y1],
    }
    if tubes:
        meta['tubes'] = tubes
    if overlays:
        meta['overlays'] = overlays
    if palaeo:
        meta['palaeo'] = palaeo
    json.dump(meta, open(os.path.join(out, 'region.json'), 'w', encoding='utf-8', newline='\n'), separators=(',', ':'))
    print('region %s: box px %s, %d x %d px, polygon %d km2' % (reg['name'], [x0, y0, x1, y1], W, H, meta['region']['area_km2']))
    print('heights %d x %d cells (%.0f m/cell, su=%.2f, synth=%s); %d channels, %d vertices; %d water cells lowered to their spill height' % (
        nx, ny, 2000.0 / su, su, bool(do_synth and su >= 1.5), len(lines), sum(len(l) for l in lines), spilled))
    for r in rivers:
        print('  river %s: %d points, %.0f m to %.0f m, %s m wide' % (r['name'], len(r['line']), r['line'][0][2], r['line'][-1][2], r['width_m']))
    print('  %d dry valleys' % len(valleys))
    if tubes:
        print('  %d lava tubes/caverns' % len(tubes))
    for b in biomes:
        print('  biome %2d %-18s kit %-16s %7d px (%d in region)' % (b['id'], b['name'], b['kit'], b['px'], b['px_in_region']))
    print('  %d px took the nearest overlay' % filled)
    for o in overlays:
        print('  overlay %d %-16s build %-12s %7d px (%d in region)' % (o['bit'], o['name'], o['build'], o['drawn_px'], o['px_in_region']))
    for L in (palaeo or {}).get('lakes', []):
        print('  old water %d %-16s level %6.0f m  sill %s  %6d km2 (%d km2 dry today)  %s' % (
            L['bit'], L['name'], L['level_m'], L.get('sill_m'), L['km2'], L['dry_km2'], L.get('volume_above_sill_km3', '')))
    for s in sett:
        print('  settlement %-14s %-16s px (%s, %s) -> (%.0f, %.0f) m  in %s' % (s['name'], s['type'], s['px'], s['py'], s['x'], s['z'], s['biome']))
    for k, v in cand.items():
        print('  canyon for %s: %s' % (k, v[:2]))


if __name__ == '__main__':
    main()
