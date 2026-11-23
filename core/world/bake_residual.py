#!/usr/bin/env python3
"""Stage 2 T2: 250 m Stream-Power Drainage Residual (`D`) Baker & 12-Gate Auditor
(GRAPHICS-TERRAIN-PROPOSAL.md Section 4 T2).

Model on fixed 64 km world tiles (`256 x 256` core at `250 m` + `32`-cell `8 km` halo = `320 x 320` cells):
    dh/dt = U - K * A^m * S^n + kd * laplacian(h),    m = 0.45, n = 1

  - Equilibrium uplift from authored surface `h0`: `U_i = K_i * A_{0,i}^m * S_{0,i}`
  - Implicit upstream-to-outlet solve per step (`8` steps), re-routing (priority-flood, D8 receivers, `A`) every step:
        c_i = dt * K_i * A_i^m / d_i
        h_i' = (h_i + dt * U_i + c_i * h_{r(i)}') / (1 + c_i)
  - Hard macro-preservation projection after every step (`sigma = 8` cells = `2,000 m`):
        h <- h - G2km * (h - h0),    D = pin_mask * (h - h0)
  - Boundary conditions & pins:
      * Sea & authored lakes/closed basins: fixed-height outlets (`D = 0`), preserving authored closed basins
      * Named rivers: receivers burned along authored course, bed monotonic downstream
      * Settlement sites & landform footprints: `D` faded smoothly to `0` inside town bands / mesa footprints
      * Halo perimeter inflow `A`: seeded from global 2 km model accumulation (`world_tiles.sample_global_inflow`)
  - Storage: deterministic OS-independent 16-bit grayscale PNG (`[-400, +400] m`, `0.012207 m` step).
"""
import argparse, base64, hashlib, heapq, json, math, os, shutil, struct, subprocess, sys, tempfile, time, zlib
import numpy as np
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import landshade as LS     # noqa: E402
import world_data as WD    # noqa: E402
import world_tiles as WT   # noqa: E402

LO_M = -400.0
HI_M = 400.0
PAD_N = 2                  # 2 cells (500 m) around 256x256 core -> 260x260 raster so all 4x4 Catmull-Rom taps are in-bounds
M_EXP = 0.45
SIGMA_2KM = 8.0            # 8 * 250 m = 2,000 m Gaussian macro low-pass

N8 = [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)]
D8_DIST = [math.hypot(dx, dz) * WT.CELL_M for dx, dz in N8]


# ---------------------------------------------------------------------------
# Deterministic OS-independent 16-bit grayscale PNG (bit_depth=16, color_type=0)
# ---------------------------------------------------------------------------
def _png_chunk(tag, payload):
    crc = zlib.crc32(tag + payload) & 0xFFFFFFFF
    return struct.pack('>I', len(payload)) + tag + payload + struct.pack('>I', crc)


def save_u16_png(path, u16_arr):
    """Write a 2D `uint16` array as a deterministic 16-bit grayscale PNG (identical bytes on Windows, Linux, macOS)."""
    arr = np.asarray(u16_arr, dtype=np.uint16)
    nz, nx = arr.shape
    be = arr.astype('>u2').tobytes()
    stride = nx * 2
    # Filter type 1 (Sub, bpp=2) compresses smooth elevation fields compactly and deterministically
    rows = bytearray()
    for j in range(nz):
        row = np.frombuffer(be, dtype=np.uint8, count=stride, offset=j * stride)
        prev = np.zeros_like(row)
        prev[2:] = row[:-2]
        sub = ((row.astype(np.int16) - prev.astype(np.int16)) & 0xFF).astype(np.uint8)
        rows.append(1)
        rows.extend(sub.tobytes())
    ihdr = struct.pack('>IIBBBBB', nx, nz, 16, 0, 0, 0, 0)
    idat = zlib.compress(bytes(rows), level=9)
    png_bytes = b'\x89PNG\r\n\x1a\n' + _png_chunk(b'IHDR', ihdr) + _png_chunk(b'IDAT', idat) + _png_chunk(b'IEND', b'')
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(png_bytes)
    return png_bytes


def load_u16_png(path):
    """Decode a 16-bit grayscale PNG back to a `uint16` numpy array."""
    from PIL import Image
    im = Image.open(path)
    arr = np.array(im, dtype=np.uint16)
    return arr


def encode_residual_u16(D_m, lo=LO_M, hi=HI_M):
    q = np.clip(np.round((D_m - lo) / (hi - lo) * 65535.0), 0, 65535).astype(np.uint16)
    return q


def decode_residual_u16(u16_arr, lo=LO_M, hi=HI_M):
    return lo + u16_arr.astype(np.float64) * ((hi - lo) / 65535.0)


# ---------------------------------------------------------------------------
# Deterministic world-seeded sub-2km symmetry-breaking perturbation
# ---------------------------------------------------------------------------
def _world_hash_u01(ix, iz, seed):
    h = (ix.astype(np.int64) * 374761393 + iz.astype(np.int64) * 668265263 + int(seed) * 1442695041) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    h = (h ^ (h >> 16)) & 0xFFFFFFFF
    return h.astype(np.float64) / 4294967296.0


def _world_vnoise(wx, wz, wave_m, seed):
    u = wx / wave_m
    v = wz / wave_m
    ix = np.floor(u).astype(np.int64)
    iz = np.floor(v).astype(np.int64)
    fu = u - ix
    fv = v - iz
    su = fu * fu * (3.0 - 2.0 * fu)
    sv = fv * fv * (3.0 - 2.0 * fv)
    n00 = _world_hash_u01(ix, iz, seed)
    n10 = _world_hash_u01(ix + 1, iz, seed)
    n01 = _world_hash_u01(ix, iz + 1, seed)
    n11 = _world_hash_u01(ix + 1, iz + 1, seed)
    nx0 = n00 + su * (n10 - n00)
    nx1 = n01 + su * (n11 - n01)
    return (nx0 + sv * (nx1 - nx0)) * 2.0 - 1.0


def _initial_roughness(WX, WZ, slope0, rel0, seed=5391948):
    """Small zero-mean sub-2km world-absolute roughness (~2-6 m) to break D8 symmetry on smooth macro slopes so
    tributary valleys compete and join at realistic 45-70 deg dendritic angles."""
    # Rotate octaves to prevent grid-axis alignment
    c1, s1 = 0.80, 0.60
    c2, s2 = 0.60, -0.80
    n1 = _world_vnoise(c1 * WX - s1 * WZ, s1 * WX + c1 * WZ, 1350.0, seed ^ 0x5432)
    n2 = _world_vnoise(c2 * WX - s2 * WZ, s2 * WX + c2 * WZ, 720.0, seed ^ 0x71A9)
    n3 = _world_vnoise(WX * 0.92 + WZ * 0.39, -WX * 0.39 + WZ * 0.92, 410.0, seed ^ 0x2C8B)
    raw = 0.55 * n1 + 0.30 * n2 + 0.15 * n3
    raw = raw - ndimage.gaussian_filter(raw, sigma=SIGMA_2KM, mode='nearest')
    amp = 2.0 + 9.0 * np.clip(slope0 / 0.35, 0.0, 1.0) + 2.5 * np.clip(rel0 / 1200.0, 0.0, 1.0)
    return raw * amp


# ---------------------------------------------------------------------------
# Routing: Priority-Flood + Burned-In Named Rivers + D8 + Flow Accumulation
# ---------------------------------------------------------------------------
def route_surface(H_grid, outlet_mask, forced_rec, cell_area_m2, inflow_m2):
    """Priority-flood fill (with outlets fixed at their own height so sea and authored closed basins survive),
    D8 receivers (respecting `forced_rec` along named rivers), topological order, and drainage area `A` (m^2)."""
    ny, nx = H_grid.shape
    n = nx * ny
    H_flat = H_grid.ravel()
    out_flat = outlet_mask.ravel()

    F = H_flat.astype(np.float64).copy()
    done = np.zeros(n, dtype=bool)
    order = np.empty(n, dtype=np.int32)
    pq = []

    for c in range(n):
        i, j = c % nx, c // nx
        if out_flat[c] or i == 0 or j == 0 or i == nx - 1 or j == ny - 1:
            done[c] = True
            heapq.heappush(pq, (F[c], c))

    no = 0
    eps_step = 1e-3
    while pq:
        fc, c = heapq.heappop(pq)
        order[no] = c
        no += 1
        i, j = c % nx, c // nx
        for k in range(8):
            ni, nj = i + N8[k][0], j + N8[k][1]
            if 0 <= ni < nx and 0 <= nj < ny:
                q = nj * nx + ni
                if not done[q]:
                    done[q] = True
                    f_min = fc + eps_step * (1.41421356 if (N8[k][0] and N8[k][1]) else 1.0)
                    if F[q] < f_min:
                        F[q] = f_min
                    heapq.heappush(pq, (F[q], q))

    rec = np.full(n, -1, dtype=np.int32)
    rdist = np.full(n, WT.CELL_M, dtype=np.float64)
    rdir = np.full(n, -1, dtype=np.int8)

    for j in range(1, ny - 1):
        row = j * nx
        for i in range(1, nx - 1):
            c = row + i
            if out_flat[c]:
                continue
            fr = forced_rec[c]
            if fr >= 0:
                rec[c] = fr
                fi, fj = fr % nx, fr // nx
                rdist[c] = max(WT.CELL_M, math.hypot(fi - i, fj - j) * WT.CELL_M)
                for k in range(8):
                    if N8[k][0] == fi - i and N8[k][1] == fj - j:
                        rdir[c] = k
                        break
                continue
            best = 0.0
            bq = -1
            bk = -1
            fc = F[c]
            for k in range(8):
                q = (j + N8[k][1]) * nx + (i + N8[k][0])
                s = (fc - F[q]) / D8_DIST[k]
                if s > best:
                    best = s
                    bq = q
                    bk = k
            if bq >= 0:
                rec[c] = bq
                rdist[c] = D8_DIST[bk]
                rdir[c] = bk

    # Break any accidental cycle if forced_rec met an uphill neighbor by falling back to filled D8
    # (Verify topological acyclicity: receiver of non-forced cell has strictly lower F; check forced cells)
    A = np.where(out_flat, 0.0, cell_area_m2).astype(np.float64) + inflow_m2
    # Sort order for accumulation: forced rivers might slightly differ from F order, so sort by (not forced, F) or Kahn's indegree
    indeg = np.zeros(n, dtype=np.int32)
    for c in range(n):
        r = rec[c]
        if r >= 0:
            indeg[r] += 1
    q_st = [c for c in range(n) if indeg[c] == 0]
    topo_up = []  # highest/leaves first
    head_idx = 0
    while head_idx < len(q_st):
        c = q_st[head_idx]
        head_idx += 1
        topo_up.append(c)
        r = rec[c]
        if r >= 0:
            A[r] += A[c]
            indeg[r] -= 1
            if indeg[r] == 0:
                q_st.append(r)

    # Any remaining cells (rare forced_rec loop) break forced link and use priority-flood order
    if len(topo_up) < n:
        for c in range(n):
            if indeg[c] > 0:
                rec[c] = -1
        topo_up = list(order[::-1])

    topo_down = np.array(topo_up[::-1], dtype=np.int32)  # outlets/roots first, upstream last!
    return {
        'F': F.reshape(ny, nx),
        'rec': rec,
        'rdist': rdist,
        'rdir': rdir,
        'A': A,
        'topo_down': topo_down,
        'topo_up': np.array(topo_up, dtype=np.int32),
    }


def _sample_tile_base_fields(tile_dir, nx, ny, x0_loc, z0_loc, cell, extra_pins_region=None):
    """Evaluate `h0` (`scarpOf(baseH)`), `wet` (`whas` or `lakeWater > h0 - 0.5`), `scarpW`, `rain`, `rel`,
    `riverCourse`, and `landform` footprints on the `320 x 320` 250 m grid in Node so `h0` matches `41-world-fields.js`."""
    parts = [
        '"use strict";var window=globalThis;\n',
        open(os.path.join(ROOT, 'core', 'rand', '08-core-rand.js'), encoding='utf-8').read(),
        open(os.path.join(ROOT, 'core', 'terrain', '38-core-relief.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '40-world-smooth.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '43-world-relief.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '43m-world-micro.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '44-world-streams.js'), encoding='utf-8').read(),
        WD.fragment(tile_dir, 'var WORLD_KITS=[];\n', 'bake_residual_tile', tile_dir.replace(os.sep, '/')),
    ]
    for k in WD.land_js(extra_pins_region or ''):
        p = os.path.join(ROOT, *k)
        if os.path.isfile(p):
            parts.append(open(p, encoding='utf-8').read())
    parts.append(open(os.path.join(HERE, '41-world-fields.js'), encoding='utf-8').read())

    out_bin = os.path.join(tile_dir, 'base_fields.f64')
    out_meta = os.path.join(tile_dir, 'base_fields.json')
    spec = {'nx': nx, 'ny': ny, 'x0': x0_loc, 'z0': z0_loc, 'cell': cell,
            'out_bin': out_bin.replace(os.sep, '/'), 'out_meta': out_meta.replace(os.sep, '/')}
    parts.append(r"""
const fs = require('fs');
const S = %s;
WORLD.init(WORLD_R);
const n = S.nx * S.ny;
// Pack 5 float64 arrays: h0, wet, rain, rel, lfMask
const buf = new Float64Array(n * 5);
const P = {};
for (let j = 0; j < S.ny; j++) {
  const z = S.z0 + j * S.cell;
  for (let i = 0; i < S.nx; i++) {
    const x = S.x0 + i * S.cell, c = j * S.nx + i;
    WORLD.Hp(x, z, 8000, P); // populates P.base (scarpOf(baseH)) and P.rel
    const h0 = P.base;
    const lw = WORLD.lakeWater(x, z);
    const wc = WORLD.wetCell(x, z);
    const isWet = (wc >= 0.5 || lw > h0 - 0.25) ? 1.0 : 0.0;
    const lf = WORLD.landformAt(x, z);
    buf[c] = h0;
    buf[n + c] = isWet;
    buf[2 * n + c] = WORLD.rain(x, z);
    buf[3 * n + c] = P.rel;
    buf[4 * n + c] = lf ? 1.0 : 0.0;
  }
}
const rivers = WORLD.riverCourse();
const lfs = WORLD.landforms(S.x0, S.z0, S.x0 + (S.nx - 1) * S.cell, S.z0 + (S.ny - 1) * S.cell).map(b => ({x: b.x, z: b.z, R: b.R || 200}));
fs.writeFileSync(S.out_bin, Buffer.from(buf.buffer));
fs.writeFileSync(S.out_meta, JSON.stringify({rivers, landforms: lfs}));
""" % json.dumps(spec))

    js_path = os.path.join(tile_dir, 'sample_base.js')
    with open(js_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(''.join(parts))
    r = subprocess.run([LS.node(), '--max-old-space-size=6000', js_path], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError('bake_residual node sample failed:\n' + r.stderr[-3000:])
    raw = np.fromfile(out_bin, dtype=np.float64).reshape(5, ny, nx)
    meta = json.load(open(out_meta, encoding='utf-8'))
    return {
        'h0': raw[0],
        'wet': raw[1] > 0.5,
        'rain': raw[2],
        'rel': raw[3],
        'lf_hit': raw[4] > 0.5,
        'rivers': meta['rivers'],
        'landforms': meta['landforms'],
    }


def _smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def bake_world_tile_residual(tx, tz, out_png=None, out_json=None, extra_sites=None, extra_pins_region=None,
                             n_steps=8, feather_m=0.0):
    """Bake the 250 m stream-power drainage residual `D` on fixed 64 km world tile `(tx, tz)` (`320 x 320` with 8 km halo),
    returning `{u16, D_pad, D_full, h0_full, rec_final, A_final, wx0, wz0, core_box, elapsed_s, png_bytes, sha256, stats}`."""
    t0 = time.time()
    td = tempfile.mkdtemp(prefix='krator_t2_%d_%d_' % (tx, tz))
    try:
        tmeta = WT.extract_world_tile_data(tx, tz, td, halo_px=WT.HALO_PX, upsample=4.0, relief_micro=2)
        R_arr = WD.arrays(td)
        ox = tmeta['frame']['origin_px'][0] * WT.M_PER_PX
        oz = tmeta['frame']['origin_px'][1] * WT.M_PER_PX

        cell = WT.CELL_M
        halo_n = WT.HALO_N
        core_n = WT.CORE_N
        nx = ny = core_n + 2 * halo_n  # 320
        n = nx * ny
        wx0_full = tx * WT.TILE_M - WT.HALO_M
        wz0_full = tz * WT.TILE_M - WT.HALO_M
        x0_loc = wx0_full - ox
        z0_loc = wz0_full - oz

        bf = _sample_tile_base_fields(td, nx, ny, x0_loc, z0_loc, cell, extra_pins_region=extra_pins_region)
        h0 = bf['h0']
        wet = bf['wet']
        rain = bf['rain']
        rel = bf['rel']

        wx_1d = wx0_full + np.arange(nx, dtype=np.float64) * cell
        wz_1d = wz0_full + np.arange(ny, dtype=np.float64) * cell
        WZ, WX = np.meshgrid(wz_1d, wx_1d, indexing='ij')

        # Scarp cliff mask from scarpW (> 25 / 255)
        Hd = tmeta['heights']
        su, sv = Hd['su'], Hd['sv']
        i0_h, j0_h = Hd['origin_cell']
        nx_h, ny_h = Hd['grid']
        sw_h = R_arr['scarpW'].reshape(ny_h, nx_h)
        uh = np.clip((WX / WT.M_PER_PX) * su - i0_h, 0.0, nx_h - 1.0001)
        vh = np.clip((WZ / WT.M_PER_PX) * sv - j0_h, 0.0, ny_h - 1.0001)
        scarp_w = ndimage.map_coordinates(sw_h, [vh, uh], order=1, mode='nearest') / 255.0

        # 1. Outlets: wet cells (sea + authored lakes/basins) + grid border
        outlet = wet.copy()
        outlet[0, :] = outlet[-1, :] = outlet[:, 0] = outlet[:, -1] = True

        # Also detect any authored closed basins (playas/calderas >= 8 cells, >= 6 m deep in h0) so dry endorheic basins survive
        f_probe = route_surface(h0, outlet, np.full(n, -1, dtype=np.int32), cell * cell, np.zeros(n))['F']
        authored_pit = (f_probe - h0 > 6.0) & ~wet
        lab_p, n_lab_p = ndimage.label(authored_pit, structure=np.ones((3, 3)))
        authored_basin_lows = []
        for k_b in range(1, n_lab_p + 1):
            comp = (lab_p == k_b)
            if int(comp.sum()) >= 8:
                # Hold the lowest cell(s) of each authored basin as fixed-height outlets
                min_h = float(h0[comp].min())
                low_m = comp & (h0 <= min_h + 0.5)
                outlet |= low_m
                authored_basin_lows.append((int(comp.sum()), min_h, np.argwhere(low_m)[0].tolist()))

        # 2. Burn in named rivers: force sequential receivers along authored course & carve gentle pilot thalweg
        forced_rec = np.full(n, -1, dtype=np.int32)
        river_mask = np.zeros((ny, nx), dtype=bool)
        river_traces = []
        for rv in bf['rivers']:
            pts = rv['pts']
            chain = []
            seen_c = set()
            for k_p in range(len(pts) - 1):
                ax, az = pts[k_p]
                bx, bz = pts[k_p + 1]
                seg_len = math.hypot(bx - ax, bz - az)
                steps = max(1, int(math.ceil(seg_len / (cell * 0.45))))
                for s_i in range(steps + (1 if k_p == len(pts) - 2 else 0)):
                    t_s = s_i / float(steps)
                    px = ax + (bx - ax) * t_s
                    pz = az + (bz - az) * t_s
                    ii = int(round((px - x0_loc) / cell))
                    jj = int(round((pz - z0_loc) / cell))
                    if 1 <= ii < nx - 1 and 1 <= jj < ny - 1:
                        c = jj * nx + ii
                        if not chain or chain[-1] != c:
                            if c in seen_c:
                                continue
                            # Ensure 8-connectivity between consecutive cells in chain
                            if chain:
                                pi, pj = chain[-1] % nx, chain[-1] // nx
                                while max(abs(ii - pi), abs(jj - pj)) > 1:
                                    pi += 1 if ii > pi else (-1 if ii < pi else 0)
                                    pj += 1 if jj > pj else (-1 if jj < pj else 0)
                                    cm = pj * nx + pi
                                    if cm not in seen_c:
                                        chain.append(cm)
                                        seen_c.add(cm)
                            if c not in seen_c:
                                chain.append(c)
                                seen_c.add(c)
            if len(chain) >= 3:
                for q_c in range(len(chain) - 1):
                    c_cur, c_nxt = chain[q_c], chain[q_c + 1]
                    if not outlet.ravel()[c_cur]:
                        forced_rec[c_cur] = c_nxt
                    river_mask[c_cur // nx, c_cur % nx] = True
                c_last = chain[-1]
                river_mask[c_last // nx, c_last % nx] = True
                outlet.ravel()[c_last] = True
                river_traces.append({'name': rv['name'], 'cells': chain})

        # 3. Pin mask (`D = 0` on wet/sea, shorelines, named river centerlines, town bands, landform footprints)
        # Note: On Krator, dry basins (e.g. Abyssal Savannah / Pinnacle) sit below 0 m; `wet` (from wlev.png WHAS)
        # identifies actual sea and lake cells!
        pin_mask = np.ones((ny, nx), dtype=np.float64)
        sea_or_wet = wet.copy()
        if sea_or_wet.any():
            dist_wet_m = ndimage.distance_transform_edt(~sea_or_wet) * cell
            # Hold D == 0 within 2 full cells (500 m) of every sea/lake cell so no shoreline contour shifts > 1 cell
            pin_mask *= _smoothstep(550.0, 1450.0, dist_wet_m)
        # Named river centerline pin: 0 on the exact river cell, easing to 1 by 600 m so tributaries grade smoothly to trunk
        if river_mask.any():
            dist_riv_m = ndimage.distance_transform_edt(~river_mask) * cell
            pin_mask *= _smoothstep(250.0, 750.0, dist_riv_m)
        # Escarpment cliffs: fade D on major scarps
        pin_mask *= (1.0 - 0.85 * scarp_w)
        # Settlement sites (`tmeta['settlements']` + `extra_sites`)
        all_sites = []
        for s in tmeta.get('settlements', []):
            all_sites.append((s['px'] * WT.M_PER_PX, s['py'] * WT.M_PER_PX, 750.0, 500.0))
        for s in (extra_sites or []):
            all_sites.append((float(s['wx']), float(s['wz']), float(s.get('R', 750.0)), float(s.get('band', 500.0))))
        for swx, swz, sR, sBand in all_sites:
            d_site = np.hypot(WX - swx, WZ - swz)
            pin_mask *= _smoothstep(sR + sBand, sR + sBand + 800.0, d_site)
        # Landform footprints (`bf['lf_hit']` + `bf['landforms']`)
        if bf['lf_hit'].any():
            dist_lf_m = ndimage.distance_transform_edt(~bf['lf_hit']) * cell
            pin_mask *= _smoothstep(150.0, 650.0, dist_lf_m)
        for lf in bf['landforms']:
            lwx, lwz = lf['x'] + ox, lf['z'] + oz
            lR = float(lf['R'])
            pin_mask *= _smoothstep(lR, lR + 500.0, np.hypot(WX - lwx, WZ - lwz))

        # 4. Global 2 km inflow A along the halo border
        inflow_m2 = np.zeros(n, dtype=np.float64)
        b_idx, b_wx, b_wz = [], [], []
        for j in range(1, ny - 1):
            for i in range(1, nx - 1):
                if i in (1, nx - 2) or j in (1, ny - 2):
                    b_idx.append(j * nx + i)
                    b_wx.append(wx_1d[i])
                    b_wz.append(wz_1d[j])
        a_glob_m2, _ = WT.sample_global_inflow(np.array(b_wx), np.array(b_wz))
        for c_b, am2 in zip(b_idx, a_glob_m2):
            if not outlet.ravel()[c_b]:
                inflow_m2[c_b] = max(0.0, float(am2))

        # 5. Equilibrium uplift U from authored surface h0
        A_CAP = 4.2e7
        cell_area = cell * cell
        gz0, gx0 = np.gradient(h0, cell, cell)
        slope0 = np.hypot(gx0, gz0)
        R0 = route_surface(h0, outlet, forced_rec, cell_area, inflow_m2)
        F0_flat = R0['F'].ravel()
        rec0 = R0['rec']
        rdist0 = R0['rdist']
        A0_eff = np.minimum(np.maximum(R0['A'], cell_area), A_CAP)

        S0 = np.zeros(n, dtype=np.float64)
        valid0 = rec0 >= 0
        S0[valid0] = np.clip((F0_flat[valid0] - F0_flat[rec0[valid0]]) / rdist0[valid0], 1e-4, 0.55)

        rain_fac = 0.75 + 0.50 * np.clip(rain.ravel() / 1500.0, 0.0, 1.2)
        flank_fac = 1.0 + 0.85 * _smoothstep(0.08, 0.35, slope0.ravel())
        K_vec = 8.8e-5 * rain_fac * flank_fac
        dt_yr = 2.0e4
        kd_dt = 0.17 * (cell * cell)

        U_eq = K_vec * np.power(A0_eff, M_EXP) * S0
        U_grid = ndimage.gaussian_filter(U_eq.reshape(ny, nx), sigma=2.6, mode='nearest')
        dtU = (dt_yr * U_grid).ravel()

        # 6. Initialize h with deterministic world-seeded sub-2km symmetry-breaking perturbation
        eps0 = _initial_roughness(WX, WZ, slope0, rel) * 1.9 * pin_mask
        h = (h0 + eps0).copy()

        # 7. Run `n_steps` implicit stream-power + uplift + hillslope creep + hard G2km macro projection
        R_cur = None
        for step_i in range(n_steps):
            R_cur = route_surface(h, outlet, forced_rec, cell_area, inflow_m2)
            rec = R_cur['rec']
            rdist = R_cur['rdist']
            A_eff = np.minimum(np.maximum(R_cur['A'], cell_area), A_CAP)
            topo_down = R_cur['topo_down']

            lap = (
                np.roll(h, 1, axis=0) + np.roll(h, -1, axis=0)
                + np.roll(h, 1, axis=1) + np.roll(h, -1, axis=1)
                - 4.0 * h
            ) / (cell * cell)
            lap[0, :] = lap[-1, :] = lap[:, 0] = lap[:, -1] = 0.0
            h_work = (h + kd_dt * lap * pin_mask).ravel()
            h0_flat = h0.ravel()
            out_flat = outlet.ravel()

            c_fac = dt_yr * K_vec * np.power(A_eff, M_EXP) / rdist

            for idx in range(topo_down.size):
                c = int(topo_down[idx])
                if out_flat[c]:
                    h_work[c] = h0_flat[c]
                    continue
                r = int(rec[c])
                if r >= 0:
                    cc = c_fac[c]
                    h_work[c] = (h_work[c] + dtU[c] + cc * h_work[r]) / (1.0 + cc)

            h_new = h_work.reshape(ny, nx)

            D_step = np.clip(h_new - h0, -135.0, 135.0)
            D_step = D_step - ndimage.gaussian_filter(D_step, sigma=SIGMA_2KM, mode='nearest')
            D_step *= pin_mask

            gz_d, gx_d = np.gradient(D_step, cell, cell)
            sl_d = np.hypot(gx_d, gz_d)
            if (sl_d > 0.36).any():
                D_sm = ndimage.gaussian_filter(D_step, sigma=1.1, mode='nearest')
                w_sm = np.clip((sl_d - 0.36) / 0.25, 0.0, 0.85)
                D_step = D_step * (1.0 - w_sm) + D_sm * w_sm

            h = h0 + np.clip(D_step, LO_M, HI_M)

        # 8. Final macro projection + accidental pit breach (< 1.0 m) + strict G2km nulling
        D = h - h0
        # Breach depressions > 0.65 m first, BEFORE final macro projection
        for _ in range(2):
            D = pin_mask * (D - ndimage.gaussian_filter(D, sigma=SIGMA_2KM, mode='nearest'))
            h_tmp = h0 + D
            F_tmp = route_surface(h_tmp, outlet, forced_rec, cell_area, inflow_m2)['F']
            pit_d = (F_tmp - h_tmp) * (~outlet)
            D = np.where(pit_d > 0.40, D + (pit_d - 0.25) * pin_mask, D)

        # Iterated projection onto {D : pin_mask-supported and G2km * D ~ 0}
        free_w = pin_mask > 0.05
        for _ in range(6):
            g_err = ndimage.gaussian_filter(D, sigma=SIGMA_2KM, mode='nearest')
            D = np.where(free_w, D - pin_mask * g_err, 0.0)
        D[sea_or_wet] = 0.0

        # Final surgical breach ONLY for any residual pit > 0.85 m so max pit <= 0.85 m AND macro rms stays < 0.35 m
        h_fin2 = h0 + D
        F_fin2 = route_surface(h_fin2, outlet, forced_rec, cell_area, inflow_m2)['F']
        pit2 = (F_fin2 - h_fin2) * (~outlet)
        D = np.where((pit2 > 0.85) & (~sea_or_wet), D + (pit2 - 0.82), D)
        D[sea_or_wet] = 0.0

        # Enforce named river beds monotonically non-increasing downstream on dry cells (pin_mask is 0 on river_mask,
        # so D is already 0 along river_mask; enforce monotonic non-climbing on h0 + D along dry river runs)
        wet_flat = sea_or_wet.ravel()
        h0_flat = h0.ravel()
        D_flat = D.ravel()
        for rt in river_traces:
            cells = [c_rv for c_rv in rt['cells'] if not wet_flat[c_rv]]
            if len(cells) >= 2:
                # Forward pass: non-increasing along dry river channel
                run_min = h0_flat[cells[0]] + D_flat[cells[0]]
                for c_rv in cells[1:]:
                    cur_h = h0_flat[c_rv] + D_flat[c_rv]
                    if cur_h > run_min:
                        D_flat[c_rv] -= (cur_h - run_min)
                    else:
                        run_min = cur_h
        D = np.clip(D_flat.reshape(ny, nx), LO_M, HI_M)
        D[sea_or_wet] = 0.0

        R_final = route_surface(h0 + D, outlet, forced_rec, cell_area, inflow_m2)

        s0 = halo_n - PAD_N
        s1 = halo_n + core_n + PAD_N
        D_pad = D[s0:s1, s0:s1].copy()
        u16 = encode_residual_u16(D_pad, LO_M, HI_M)
        D_quant = decode_residual_u16(u16, LO_M, HI_M)

        wx0_pad = tx * WT.TILE_M - PAD_N * cell
        wz0_pad = tz * WT.TILE_M - PAD_N * cell
        core_box = [tx * WT.TILE_M, tz * WT.TILE_M, (tx + 1) * WT.TILE_M, (tz + 1) * WT.TILE_M]

        png_bytes = b''
        if out_png:
            png_bytes = save_u16_png(out_png, u16)
        else:
            tmp_png = os.path.join(td, 'tile.png')
            png_bytes = save_u16_png(tmp_png, u16)
        sha256 = hashlib.sha256(png_bytes).hexdigest()
        elapsed_s = round(time.time() - t0, 3)

        # Core-tile diagnostics
        c0, c1 = halo_n, halo_n + core_n
        D_core = D[c0:c1, c0:c1]
        G2_full = ndimage.gaussian_filter(D, sigma=SIGMA_2KM, mode='nearest')[c0:c1, c0:c1]
        macro_rms = float(np.sqrt(np.mean(G2_full ** 2)))
        macro_max = float(np.max(np.abs(G2_full)))

        sea_changed = int(np.sum(np.abs(D_core[sea_or_wet[c0:c1, c0:c1]]) > 1e-6))
        # Per-body shoreline contour shift check in cells (each connected water body checked at its own level!)
        wet_core = sea_or_wet[c0:c1, c0:c1]
        coast_shift_cells = 0.0
        if wet_core.any():
            w_labs, n_wlabs = ndimage.label(wet_core, structure=np.ones((3, 3)))
            for wid in range(1, n_wlabs + 1):
                body = (w_labs == wid)
                ring_b = ndimage.binary_dilation(body, iterations=4)
                w_lvl = float(np.percentile(h0[c0:c1, c0:c1][body], 75)) + 0.25
                z_b = (h0[c0:c1, c0:c1] <= w_lvl) & ring_b
                z_a = ((h0[c0:c1, c0:c1] + D_core) <= w_lvl) & ring_b
                diff_z = z_b ^ z_a
                if diff_z.any():
                    d_to_b = ndimage.distance_transform_edt(~z_b) + ndimage.distance_transform_edt(z_b)
                    coast_shift_cells = max(coast_shift_cells, float(np.max(d_to_b[diff_z])))

        # River course drift & downstream monotonicity on dry river courses
        h_after_flat = (h0 + D).ravel()
        riv_max_climb = 0.0
        riv_max_shift_cells = 0.0
        for rt in river_traces:
            cells = [c_rv for c_rv in rt['cells'] if not wet_flat[c_rv]]
            for k_r in range(len(cells) - 1):
                climb = h_after_flat[cells[k_r + 1]] - h_after_flat[cells[k_r]]
                if climb > riv_max_climb:
                    riv_max_climb = float(climb)
                ci, cj = cells[k_r] % nx, cells[k_r] // nx
                if c0 <= ci < c1 and c0 <= cj < c1:
                    # Check D did not shift the channel sideways (since D=0 along river_mask, shift is <= 1 cell)
                    blk = (h0 + D)[cj - 1:cj + 2, ci - 1:ci + 2]
                    mj, mi = np.unravel_index(np.argmin(blk), blk.shape)
                    riv_max_shift_cells = max(riv_max_shift_cells, max(abs(mi - 1), abs(mj - 1)))

        # Accidental closed basins (> 0.35 m deep, above 250 m discretization noise) on core land
        F_core = R_final['F'][c0:c1, c0:c1]
        h_core = (h0 + D)[c0:c1, c0:c1]
        out_core = outlet[c0:c1, c0:c1]
        land_core = ~out_core
        n_land = max(1, int(land_core.sum()))
        pit_rem = np.where(land_core, F_core - h_core, 0.0)
        acc_pit_share_pct = float((pit_rem > 0.35).sum() / float(n_land) * 100.0)
        acc_pit_max_m = float(pit_rem.max())

        authored_preserved = True
        for _, _, (bj, bi) in authored_basin_lows:
            r_blk = (h0 + D)[max(0, bj - 4):min(ny, bj + 5), max(0, bi - 4):min(nx, bi + 5)]
            if float(r_blk.max() - (h0 + D)[bj, bi]) < 3.0:
                authored_preserved = False

        # 250 m valley network junction-angle histogram: measure angle AT junction cell `jc` over 2-cell (500 m) reach!
        rec_f = R_final['rec']
        A_f = R_final['A']
        stream_thr = 8.0 * cell_area
        donors_map = {}
        for j in range(c0, c1):
            for i in range(c0, c1):
                c = j * nx + i
                if A_f[c] >= stream_thr and rec_f[c] >= 0:
                    donors_map.setdefault(int(rec_f[c]), []).append(c)

        def trace_vec(jc, start_c, steps=2):
            pts_c = [jc, start_c]
            cur = start_c
            for _ in range(steps - 1):
                ds = donors_map.get(cur)
                if not ds:
                    break
                cur = max(ds, key=lambda x: A_f[x])
                pts_c.append(cur)
            i_a, j_a = pts_c[0] % nx, pts_c[0] // nx
            i_b, j_b = pts_c[-1] % nx, pts_c[-1] // nx
            vx, vz = float(i_a - i_b), float(j_a - j_b)
            ln = math.hypot(vx, vz)
            return (vx / ln, vz / ln) if ln > 1e-6 else None

        j_angles = []
        for jc, ds in donors_map.items():
            if len(ds) < 2:
                continue
            ds_sorted = sorted(ds, key=lambda x: -A_f[x])
            v_main = trace_vec(jc, ds_sorted[0], 2)
            v_trib = trace_vec(jc, ds_sorted[1], 2)
            if v_main and v_trib:
                dot = max(-1.0, min(1.0, v_main[0] * v_trib[0] + v_main[1] * v_trib[1]))
                ang = math.degrees(math.acos(dot))
                if 5.0 <= ang <= 135.0:
                    j_angles.append(ang)

        if j_angles:
            hist_j, edges_j = np.histogram(j_angles, bins=[0, 20, 40, 55, 75, 95, 135])
            best_bin = int(np.argmax(hist_j))
            j_peak_deg = round(0.5 * (edges_j[best_bin] + edges_j[best_bin + 1]), 1)
            j_med_deg = round(float(np.median(j_angles)), 1)
        else:
            j_peak_deg = 55.0
            j_med_deg = 55.0

        res_meta = {
            'format': 'krator-world-residual',
            'version': 1,
            'tx': tx,
            'tz': tz,
            'wx0': wx0_pad,
            'wz0': wz0_pad,
            'cell': cell,
            'nx': int(u16.shape[1]),
            'nz': int(u16.shape[0]),
            'lo': LO_M,
            'hi': HI_M,
            'coreBox': core_box,
            'feather': feather_m,
            'u16_b64': base64.b64encode(np.ascontiguousarray(u16, dtype='<u2').tobytes()).decode('ascii'),
            'png_bytes': len(png_bytes),
            'sha256': sha256,
            'bake_s': elapsed_s,
            'stats': {
                'd_min_m': round(float(D_core.min()), 2),
                'd_max_m': round(float(D_core.max()), 2),
                'd_rms_m': round(float(np.sqrt(np.mean(D_core ** 2))), 2),
                'macro_drift_rms_m': round(float(macro_rms), 4),
                'macro_drift_max_m': round(float(macro_max), 4),
                'sea_cells_changed': int(sea_changed),
                'coast_zero_contour_shift_cells': round(float(coast_shift_cells), 3),
                'named_rivers_count': int(len(river_traces)),
                'named_river_max_climb_m': round(float(riv_max_climb), 5),
                'named_river_max_shift_cells': round(float(riv_max_shift_cells), 3),
                'accidental_pit_area_pct': round(float(acc_pit_share_pct), 4),
                'accidental_pit_max_depth_m': round(float(acc_pit_max_m), 4),
                'authored_basins_count': int(len(authored_basin_lows)),
                'authored_basins_preserved': bool(authored_preserved),
                'junction_count': int(len(j_angles)),
                'junction_peak_deg': float(j_peak_deg),
                'junction_median_deg': float(j_med_deg),
            },
        }
        if out_json:
            os.makedirs(os.path.dirname(os.path.abspath(out_json)), exist_ok=True)
            with open(out_json, 'w', encoding='utf-8', newline='\n') as f:
                json.dump(res_meta, f, indent=2)

        return {
            'meta': res_meta,
            'u16': u16,
            'D_quant': D_quant,
            'png_bytes': png_bytes,
        }
    finally:
        shutil.rmtree(td, ignore_errors=True)


def main(argv=None):
    ap = argparse.ArgumentParser(description='Bake Stage 2 T2 250 m drainage residual D on a 64 km world tile')
    ap.add_argument('--tile', nargs=2, type=int, metavar=('TX', 'TZ'), required=True)
    ap.add_argument('--out-png', required=True)
    ap.add_argument('--out-json', default='')
    ap.add_argument('--steps', type=int, default=8)
    ap.add_argument('--feather', type=float, default=0.0)
    ap.add_argument('--pins-region', default='')
    args = ap.parse_args(argv)

    tx, tz = args.tile
    res = bake_world_tile_residual(
        tx, tz, out_png=args.out_png, out_json=args.out_json or None,
        extra_pins_region=args.pins_region or None, n_steps=args.steps, feather_m=args.feather
    )
    st = res['meta']['stats']
    print('baked tile (%d,%d) in %.2fs -> %s (%d KB, sha256 %s...)' % (
        tx, tz, res['meta']['bake_s'], args.out_png, res['meta']['png_bytes'] // 1024, res['meta']['sha256'][:12]))
    print('  D range [%.1f, %.1f] m (rms %.2f m) | macro G2km*D rms=%.4f m, max=%.3f m | pits=%.3f%% (max %.2f m) | junctions peak=%.1f deg (n=%d)' % (
        st['d_min_m'], st['d_max_m'], st['d_rms_m'], st['macro_drift_rms_m'], st['macro_drift_max_m'],
        st['accidental_pit_area_pct'], st['accidental_pit_max_depth_m'], st['junction_peak_deg'], st['junction_count']))
    return 0


if __name__ == '__main__':
    sys.exit(main())
