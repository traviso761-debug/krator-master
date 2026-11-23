#!/usr/bin/env python3
"""Stage 2 T2 End-to-End Evaluation & 12-Gate Acceptance Suite (GRAPHICS-TERRAIN-PROPOSAL.md Section 4 T2).

Evaluates the 250 m stream-power + equilibrium uplift + hard G2km projection residual (`D`) on:
  1. High Rift tile `(40, 51)` (+ neighbor `(41, 51)` covering all 3 Section 3.2 `oidong-highrift` steep windows)
  2. Pinnacle tile `(31, 21)` (+ neighbors `(31, 22)`, `(32, 21)` covering all 3 Section 3.2 `pinnacle` steep windows)

Checks all 12 acceptance gates from GRAPHICS-TERRAIN-PROPOSAL.md Section 4 T2.
"""
import argparse, base64, json, math, os, shutil, subprocess, sys, tempfile, time
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import bake_residual as BR  # noqa: E402
import landshade as LS      # noqa: E402
import world_data as WD     # noqa: E402
import world_tiles as WT    # noqa: E402

GODOT_BIN = os.environ.get('GODOT_BIN') or '/shared/user/.gemini/godot/Godot_v4.7.2-stable_linux.x86_64'

SECTION_3_2_WINDOWS = [
    {'id': 'pin_hj_1', 'region': 'pinnacle', 'label': 'pinnacle, hyperjungle (-20000, 34000)', 'box': [-20000.0, 34000.0, -16000.0, 38000.0]},
    {'id': 'pin_nerim', 'region': 'pinnacle', 'label': 'pinnacle, NE rim (36000, -4000)', 'box': [36000.0, -4000.0, 40000.0, 0.0]},
    {'id': 'pin_hj_2', 'region': 'pinnacle', 'label': 'pinnacle, hyperjungle (-16000, 34000)', 'box': [-16000.0, 34000.0, -12000.0, 38000.0]},
    {'id': 'oid_valley', 'region': 'oidong-highrift', 'label': 'oidong, Oidong Valley (-28000, 22000)', 'box': [-28000.0, 22000.0, -24000.0, 26000.0]},
    {'id': 'oid_hr_1', 'region': 'oidong-highrift', 'label': 'oidong, High Rift (14000, 34000)', 'box': [14000.0, 34000.0, 18000.0, 38000.0]},
    {'id': 'oid_hr_2', 'region': 'oidong-highrift', 'label': 'oidong, High Rift (6000, 30000)', 'box': [6000.0, 30000.0, 10000.0, 34000.0]},
]


def stitch_tiles_residual(tile_results, feather_m=0.0):
    """Stitch one or more baked 64 km world-tile `u16` rasters onto a single world-aligned `u16` grid (with 2-cell pad)."""
    txs = [r['meta']['tx'] for r in tile_results]
    tzs = [r['meta']['tz'] for r in tile_results]
    tx0, tx1 = min(txs), max(txs)
    tz0, tz1 = min(tzs), max(tzs)
    core_n = WT.CORE_N
    pad = BR.PAD_N
    cell = WT.CELL_M
    nx = (tx1 - tx0 + 1) * core_n + 2 * pad
    nz = (tz1 - tz0 + 1) * core_n + 2 * pad
    mid_u16 = int(round((0.0 - BR.LO_M) / (BR.HI_M - BR.LO_M) * 65535.0))
    mosaic = np.full((nz, nx), mid_u16, dtype=np.uint16)

    for r in tile_results:
        tx, tz = r['meta']['tx'], r['meta']['tz']
        u16 = r['u16']
        ox_i = (tx - tx0) * core_n
        oz_j = (tz - tz0) * core_n
        mosaic[oz_j:oz_j + core_n + 2 * pad, ox_i:ox_i + core_n + 2 * pad] = u16
    for r in tile_results:
        tx, tz = r['meta']['tx'], r['meta']['tz']
        u16 = r['u16']
        ox_i = (tx - tx0) * core_n + pad
        oz_j = (tz - tz0) * core_n + pad
        mosaic[oz_j:oz_j + core_n, ox_i:ox_i + core_n] = u16[pad:pad + core_n, pad:pad + core_n]

    wx0 = tx0 * WT.TILE_M - pad * cell
    wz0 = tz0 * WT.TILE_M - pad * cell
    core_box = [tx0 * WT.TILE_M, tz0 * WT.TILE_M, (tx1 + 1) * WT.TILE_M, (tz1 + 1) * WT.TILE_M]
    return {
        'format': 'krator-world-residual',
        'version': 1,
        'wx0': wx0,
        'wz0': wz0,
        'cell': cell,
        'nx': int(nx),
        'nz': int(nz),
        'lo': BR.LO_M,
        'hi': BR.HI_M,
        'coreBox': core_box,
        'feather': feather_m,
        'u16_b64': base64.b64encode(np.ascontiguousarray(mosaic, dtype='<u2').tobytes()).decode('ascii'),
        'u16_arr': mosaic,
    }


def verify_gdscript_twin(tile_res, png_path, ox, oz):
    """Generate golden vectors in JS `WRESIDUAL` and verify `godot/tests/relief/wresidual_test.gd` matches to <= 1e-6."""
    meta = tile_res['meta']
    td = tempfile.mkdtemp(prefix='krator_gd_res_')
    try:
        golden_json = os.path.join(td, 'golden_res.json')
        js_code = r"""
const fs = require('fs');
global.window = global;
const WRESIDUAL = require(%s);
const M = %s;
WRESIDUAL.init(Object.assign({ox: %r, oz: %r}, M));
const pts = [];
const cx0 = M.coreBox[0] - %r, cz0 = M.coreBox[1] - %r;
const spanX = M.coreBox[2] - M.coreBox[0], spanZ = M.coreBox[3] - M.coreBox[1];
for (let k = 0; k < 300; k++) {
  const fx = ((k * 7919 + 1013) %% 10000) / 10000.0;
  const fz = ((k * 104729 + 2719) %% 10000) / 10000.0;
  const mw = (k %% 5 === 0) ? 1800.0 : 0.0;
  pts.push([+(cx0 + 500 + fx * (spanX - 1000)).toFixed(2), +(cz0 + 500 + fz * (spanZ - 1000)).toFixed(2), mw]);
}
const at = pts.map(p => WRESIDUAL.at(p[0], p[1], p[2]));
const grad = pts.map(p => WRESIDUAL.grad(p[0], p[1]));
const world_H_samples = pts.slice(0, 60).map((p) => {
  const base = 1250.0 + 0.02 * p[0] - 0.015 * p[1];
  const sc = 0.85;
  const d = WRESIDUAL.at(p[0], p[1], 0.0);
  return {x: p[0], z: p[1], base_plus_micro_no_D: base, scale: sc, js_total_H: base + sc * d};
});
fs.writeFileSync(%s, JSON.stringify({
  ox: %r, oz: %r, wx0: M.wx0, wz0: M.wz0, cell: M.cell, lo: M.lo, hi: M.hi,
  coreBox: M.coreBox, feather: M.feather, points: pts, at, grad, world_H_samples
}));
""" % (
            json.dumps(os.path.join(HERE, '43d-world-residual.js')),
            json.dumps({k: meta[k] for k in ('wx0', 'wz0', 'cell', 'nx', 'nz', 'lo', 'hi', 'coreBox', 'feather', 'u16_b64')}),
            float(ox), float(oz), float(ox), float(oz),
            json.dumps(golden_json), float(ox), float(oz)
        )
        js_file = os.path.join(td, 'gen.js')
        with open(js_file, 'w', encoding='utf-8', newline='\n') as f:
            f.write(js_code)
        subprocess.run([LS.node(), js_file], check=True, capture_output=True, text=True)

        r_gd = subprocess.run([
            GODOT_BIN, '--headless', '--path', os.path.join(ROOT, 'godot'),
            '--script', 'res://tests/relief/wresidual_test.gd',
            '--', '--golden=' + golden_json, '--png=' + os.path.abspath(png_path),
        ], capture_output=True, text=True)
        out_txt = (r_gd.stdout + '\n' + r_gd.stderr).strip()
        return r_gd.returncode == 0, out_txt
    finally:
        shutil.rmtree(td, ignore_errors=True)


def _noncliff_mask_for_windows(data_dir, region, windows, step=10.0):
    """Build a boolean mask per window identifying cells OUTSIDE declared cliffs (`WLAND` fissures/mesas, `carveAt`
    river gorges, `streamAt` slot/box canyons, `WRELIEF.bench` caprock risers, and macro scarps) so Gate 8
    (`Slope p99 outside declared cliffs <= 1.0`) measures ordinary hillslopes."""
    parts = [
        '"use strict";var window=globalThis;\n',
        open(os.path.join(ROOT, 'core', 'rand', '08-core-rand.js'), encoding='utf-8').read(),
        open(os.path.join(ROOT, 'core', 'terrain', '38-core-relief.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '40-world-smooth.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '43-world-relief.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '43m-world-micro.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '43d-world-residual.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '44-world-streams.js'), encoding='utf-8').read(),
        WD.fragment(data_dir, 'var WORLD_KITS=[];\n', 'cliff_mask', 'eval'),
    ]
    for k in WD.land_js(region):
        p = os.path.join(ROOT, *k)
        if os.path.isfile(p):
            parts.append(open(p, encoding='utf-8').read())
    parts.append(open(os.path.join(HERE, '41-world-fields.js'), encoding='utf-8').read())

    td = tempfile.mkdtemp(prefix='krator_cliffm_')
    try:
        spec = {'wins': windows, 'step': step, 'out_dir': td.replace(os.sep, '/')}
        parts.append(r"""
const fs = require('fs');
const SPEC = %s;
WORLD.init(WORLD_R);
const P = {};
for (const w of SPEC.wins) {
  const [x0, z0, x1, z1] = w.box;
  const nx = Math.round((x1 - x0) / SPEC.step) + 1;
  const nz = Math.round((z1 - z0) / SPEC.step) + 1;
  const M = new Uint8Array(nx * nz); // 1 = declared cliff/canyon/riser, 0 = ordinary hillslope
  for (let j = 0; j < nz; j++) {
    const z = z0 + j * SPEC.step;
    for (let i = 0; i < nx; i++) {
      const x = x0 + i * SPEC.step;
      const lf = WORLD.landformAt(x, z);
      WORLD.Hp(x, z, 0, P);
      const inCanyon = P.cd < P.co && P.cut > 14;
      const S = WORLD.style(x, z);
      const inSlotStream = P.sd < P.sw + 28 && Math.max(S.slot || 0, S.box || 0) >= 0.2;
      let onRiser = false;
      if (S.terr > 0.05) {
        const b0 = WRELIEF.bench(P.base, x, z, S, P.rel, 0) - P.base;
        const bx = WRELIEF.bench(P.base, x + 10, z, S, P.rel, 0) - P.base;
        const bz = WRELIEF.bench(P.base, x, z + 10, S, P.rel, 0) - P.base;
        if (Math.hypot(bx - b0, bz - b0) / 10.0 > 0.25) onRiser = true;
      }
      const mbx = (WORLD.baseH(x + 25, z) - WORLD.baseH(x - 25, z)) / 50.0;
      const mbz = (WORLD.baseH(x, z + 25) - WORLD.baseH(x, z - 25)) / 50.0;
      const onScarp = Math.hypot(mbx, mbz) > 0.65;
      M[j * nx + i] = (lf || inCanyon || inSlotStream || onRiser || onScarp) ? 1 : 0;
    }
  }
  fs.writeFileSync(SPEC.out_dir + '/' + w.id + '.u8', Buffer.from(M.buffer));
}
""" % json.dumps(spec))
        js_f = os.path.join(td, 'm.js')
        with open(js_f, 'w', encoding='utf-8', newline='\n') as f:
            f.write(''.join(parts))
        subprocess.run([LS.node(), '--max-old-space-size=4096', js_f], check=True, capture_output=True, text=True)
        out = {}
        for w in windows:
            x0, z0, x1, z1 = w['box']
            nx = int(round((x1 - x0) / step)) + 1
            nz = int(round((z1 - z0) / step)) + 1
            m_arr = np.fromfile(os.path.join(td, w['id'] + '.u8'), dtype=np.uint8).reshape(nz, nx)
            out[w['id']] = (m_arr == 0)
        return out
    finally:
        shutil.rmtree(td, ignore_errors=True)


def _retrace_streams_for_box(data_dir, region, local_box):
    """Re-trace and re-bed `region.json` `streams` over `local_box` (padded by 4 km) using `bake_streams.py` rules
    so `M.streams` follows `WORLD.flowAt` WITH `residual.json` active rather than cutting stale pre-residual beds across spurs."""
    import bake_streams as BS
    parts = [
        '"use strict";var window=globalThis;\n',
        open(os.path.join(ROOT, 'core', 'rand', '08-core-rand.js'), encoding='utf-8').read(),
        open(os.path.join(ROOT, 'core', 'terrain', '38-core-relief.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '40-world-smooth.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '43-world-relief.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '43m-world-micro.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '43d-world-residual.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '44-world-streams.js'), encoding='utf-8').read(),
        WD.fragment(data_dir, 'var WORLD_KITS=[];\n', 'retrace_streams', 'eval'),
        'delete WORLD_DATA.meta.streams;\n',
    ]
    for k in WD.land_js(region):
        p = os.path.join(ROOT, *k)
        if os.path.isfile(p):
            parts.append(open(p, encoding='utf-8').read())
    parts.append(open(os.path.join(HERE, '41-world-fields.js'), encoding='utf-8').read())

    opts = {
        'box': [float(local_box[0]) - 4000.0, float(local_box[1]) - 4000.0,
                float(local_box[2]) + 4000.0, float(local_box[3]) + 4000.0],
        'cell': BS.CELL, 'chan_min': BS.CHANNEL_MIN, 'frac': BS.FRAC,
        'floor': BS.RAIN_FLOOR, 'wet_mm': BS.WET_MM, 'min_len': BS.MIN_LEN,
        'step': BS.STEP, 'relax': BS.RELAX, 'meander': BS.MEANDER, 'incise': BS.INCISE,
    }
    td = tempfile.mkdtemp(prefix='krator_retrace_')
    try:
        sr_out = os.path.join(td, 'streams.json').replace(os.sep, '/')
        parts.append(r"""
const fs = require('fs');
WORLD.init(WORLD_R);
const O = %s;
const WB = WORLD.box();
const bx0 = Math.max(WB[0], O.box[0]), bz0 = Math.max(WB[1], O.box[1]);
const bx1 = Math.min(WB[2], O.box[2]), bz1 = Math.min(WB[3], O.box[3]);
const cell = O.cell, x0 = Math.ceil(bx0 / cell) * cell, z0 = Math.ceil(bz0 / cell) * cell;
const nx = Math.floor((bx1 - x0) / cell) + 1, ny = Math.floor((bz1 - z0) / cell) + 1, n = nx * ny;
const E = new Float32Array(n), K = new Uint8Array(n), RW = new Float32Array(n), RM = new Float32Array(n), F = {}, wcell = cell * cell / 1e6 / 16;
for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
  const c = j * nx + i, x = x0 + i * cell, z = z0 + j * cell;
  if (!WORLD.inside(x, z)) { K[c] = 3; E[c] = WORLD.baseH(x, z); continue; }
  WORLD.flowAt(x, z, F); E[c] = F.h; K[c] = F.K; RM[c] = F.rain; RW[c] = Math.max(F.rain, O.floor) * wcell;
}
const R = WSTREAMS.trace({nx, ny, cell, x0, z0, E, K, RW, RM, amin: O.chan_min * O.frac, chanMin: O.chan_min, wetMM: O.wet_mm, minLen: O.min_len, incise: O.incise});
const SR = {
  version: 1, by: 'core/world/44-world-streams.js (test_residual.py)',
  cell, x0, z0, grid: [nx, ny], step: O.step, relax: O.relax,
  meander: Object.assign({seed: WORLD_DATA.meta.relief.seed}, O.meander),
  ponds: R.ponds, lines: R.lines
};
WORLD_DATA.meta.streams = SR;
WORLD.init(WORLD_R);
const CV = WORLD.streams();
if (WORLD.setMicroFine) WORLD.setMicroFine(false);
R.lines.forEach((L, t) => {
  const P = CV[t].pts, V = WSMOOTH.line(WSTREAMS.decode(L, SR), {step: 1e12, relax: SR.relax});
  let lo = 1e9; const g = P.map(p => lo = Math.min(lo, WORLD.Hbare(p[0], p[1], 0)));
  const B = [g[0]]; let idx = 0;
  for (let k = 0; k < V.length - 1; k++) {
    idx += Math.max(1, Math.ceil(Math.hypot(V[k + 1][0] - V[k][0], V[k + 1][1] - V[k][1]) / SR.step));
    B.push(g[Math.min(idx, g.length - 1)]);
  }
  WSTREAMS.rebed(L, B);
});
fs.writeFileSync(%s, JSON.stringify(SR));
""" % (json.dumps(opts), json.dumps(sr_out)))
        js_f = os.path.join(td, 'rt.js')
        with open(js_f, 'w', encoding='utf-8', newline='\n') as f:
            f.write(''.join(parts))
        subprocess.run([LS.node(), '--stack-size=8000', '--max-old-space-size=6000', js_f], check=True, capture_output=True, text=True)
        return json.load(open(sr_out, encoding='utf-8'))
    finally:
        shutil.rmtree(td, ignore_errors=True)


def _slope_p99_noncliff(E, noncliff_mask, step=10.0):
    k = int(800 / step)
    sz, sx = np.gradient(E, step, step)
    S = np.hypot(sx, sz)[k:-k, k:-k]
    M = noncliff_mask[k:-k, k:-k]
    vals = S[M] if int(M.sum()) >= 100 else S.ravel()
    return float(np.percentile(vals, 99))


def evaluate_region_with_residual(region, stitched_res, windows):
    """Create a temporary copy of `openworld/<region>/data` with `relief.micro = 2` and `residual.json`,
    measure steep-window `texture()` before vs after, `WORLD.H` us/call before vs after, and town-band drift."""
    src_dir = os.path.join(ROOT, 'openworld', region)
    td = tempfile.mkdtemp(prefix='krator_eval_%s_' % region)
    try:
        reg_copy = os.path.join(td, region)
        os.makedirs(reg_copy, exist_ok=True)
        shutil.copytree(os.path.join(src_dir, 'data'), os.path.join(reg_copy, 'data'))
        if os.path.isdir(os.path.join(src_dir, 'plan')):
            shutil.copytree(os.path.join(src_dir, 'plan'), os.path.join(reg_copy, 'plan'))

        rj_path = os.path.join(reg_copy, 'data', 'region.json')
        M = json.load(open(rj_path, encoding='utf-8'))
        M['relief']['micro'] = 2
        with open(rj_path, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(M, f, indent=1)

        win_union_box = [
            min(w['box'][0] for w in windows),
            min(w['box'][1] for w in windows),
            max(w['box'][2] for w in windows),
            max(w['box'][3] for w in windows),
        ]

        noncliff_before = _noncliff_mask_for_windows(os.path.join(reg_copy, 'data'), region, windows, 10.0)

        # 1. Measure baseline (v2 without D) WORLD.H speed and steep windows
        win_before = {}
        us_before_list = []
        for w in windows:
            E_b, us_b, _ = LS.sample(os.path.join(reg_copy, 'data'), w['box'], 10.0, bench=True)
            T_b = LS.texture(E_b, 10.0)
            T_b['slope_p99_noncliff'] = _slope_p99_noncliff(E_b, noncliff_before[w['id']], 10.0)
            win_before[w['id']] = T_b
            if us_b is not None:
                us_before_list.append(float(us_b))

        # 2. Write residual.json, re-trace small streams on the residual-enabled flowAt surface, and measure WITH D
        res_doc = {k: stitched_res[k] for k in ('format', 'version', 'wx0', 'wz0', 'cell', 'nx', 'nz', 'lo', 'hi', 'coreBox', 'feather', 'u16_b64')}
        with open(os.path.join(reg_copy, 'data', 'residual.json'), 'w', encoding='utf-8', newline='\n') as f:
            json.dump(res_doc, f)

        M['streams'] = _retrace_streams_for_box(os.path.join(reg_copy, 'data'), region, win_union_box)
        with open(rj_path, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(M, f, indent=1)

        noncliff_after = _noncliff_mask_for_windows(os.path.join(reg_copy, 'data'), region, windows, 10.0)

        win_after = {}
        us_after_list = []
        for w in windows:
            E_a, us_a, _ = LS.sample(os.path.join(reg_copy, 'data'), w['box'], 10.0, bench=True)
            T_a = LS.texture(E_a, 10.0)
            T_a['slope_p99_noncliff'] = _slope_p99_noncliff(E_a, noncliff_after[w['id']], 10.0)
            win_after[w['id']] = T_a
            if us_a is not None:
                us_after_list.append(float(us_a))

        # 3. Check site / town-band height drift
        parts = [
            '"use strict";var window=globalThis;\n',
            open(os.path.join(ROOT, 'core', 'rand', '08-core-rand.js'), encoding='utf-8').read(),
            open(os.path.join(ROOT, 'core', 'terrain', '38-core-relief.js'), encoding='utf-8').read(),
            open(os.path.join(HERE, '40-world-smooth.js'), encoding='utf-8').read(),
            open(os.path.join(HERE, '43-world-relief.js'), encoding='utf-8').read(),
            open(os.path.join(HERE, '43m-world-micro.js'), encoding='utf-8').read(),
            open(os.path.join(HERE, '43d-world-residual.js'), encoding='utf-8').read(),
            open(os.path.join(HERE, '44-world-streams.js'), encoding='utf-8').read(),
            WD.fragment(os.path.join(reg_copy, 'data'), 'var WORLD_KITS=[];\n', 'site_drift', 'eval'),
        ]
        for k in WD.land_js(region):
            p = os.path.join(ROOT, *k)
            if os.path.isfile(p):
                parts.append(open(p, encoding='utf-8').read())
        parts.append(open(os.path.join(HERE, '41-world-fields.js'), encoding='utf-8').read())
        parts.append(r"""
const sitesList = [];
const seenS = new Set();
for (const s of (WORLD_DATA.meta.sites || []).concat(WORLD_DATA.meta.settlements || [])) {
  const key = Math.round(s.x) + ':' + Math.round(s.z);
  if (!seenS.has(key)) { seenS.add(key); sitesList.push(s); }
}
WORLD_DATA.towns = {towns: sitesList.map(s => ({name: s.name, x: s.x, z: s.z, R: 650, band: 450}))};
const savedRes = WORLD_DATA.residual;
delete WORLD_DATA.residual;
WORLD.init(WORLD_R);
const hNoRes = [];
for (const s of sitesList) {
  for (let r = 0; r <= 650; r += 130) {
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4;
      hNoRes.push([s.x + Math.cos(ang)*r, s.z + Math.sin(ang)*r, WORLD.H(s.x + Math.cos(ang)*r, s.z + Math.sin(ang)*r, 0)]);
    }
  }
}
WORLD_DATA.residual = savedRes;
WORLD.init(WORLD_R);
let maxTownDiff = 0;
for (const [x, z, h0] of hNoRes) {
  const d = Math.abs(WORLD.H(x, z, 0) - h0);
  if (d > maxTownDiff) maxTownDiff = d;
}
console.log(JSON.stringify({sites_tested: sitesList.length, max_town_band_diff_m: +maxTownDiff.toFixed(6)}));
""")
        js_site = os.path.join(td, 'site_check.js')
        with open(js_site, 'w', encoding='utf-8', newline='\n') as f:
            f.write(''.join(parts))
        r_sc = subprocess.run([LS.node(), '--max-old-space-size=4096', js_site], capture_output=True, text=True, check=True)
        site_drift = json.loads(r_sc.stdout.strip().splitlines()[-1])

        return {
            'us_before': round(float(np.median(us_before_list)), 2) if us_before_list else 0.0,
            'us_after': round(float(np.median(us_after_list)), 2) if us_after_list else 0.0,
            'windows_before': win_before,
            'windows_after': win_after,
            'site_drift': site_drift,
        }
    finally:
        shutil.rmtree(td, ignore_errors=True)


def _region_extra_sites(region):
    m = json.load(open(os.path.join(ROOT, 'openworld', region, 'data', 'region.json'), encoding='utf-8'))
    ox, oz = m['frame']['origin_px'][0] * 2000.0, m['frame']['origin_px'][1] * 2000.0
    out = []
    for s in (m.get('sites') or []) + (m.get('settlements') or []):
        out.append({'wx': float(s['x']) + ox, 'wz': float(s['z']) + oz, 'R': 750.0, 'band': 500.0})
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description='Stage 2 T2 2-Tile Acceptance Suite')
    ap.add_argument('--out', default=os.path.join(ROOT, 'godot', 'shots', 'stage2-t2-results.json'))
    args = ap.parse_args(argv)

    out_dir = os.path.join(ROOT, 'godot', 'shots', 't2-tiles')
    os.makedirs(out_dir, exist_ok=True)
    oid_sites = _region_extra_sites('oidong-highrift')
    pin_sites = _region_extra_sites('pinnacle')

    print('=== Baking High Rift world tiles (40, 51) and (41, 51) ===', flush=True)
    png_hr0 = os.path.join(out_dir, 'tile_40_51.png')
    png_hr0_b = os.path.join(out_dir, 'tile_40_51_repeat.png')
    hr_40_51 = BR.bake_world_tile_residual(40, 51, out_png=png_hr0, out_json=os.path.join(out_dir, 'tile_40_51.json'), extra_sites=oid_sites)
    hr_40_51_b = BR.bake_world_tile_residual(40, 51, out_png=png_hr0_b, extra_sites=oid_sites)
    os.remove(png_hr0_b)
    det_identical = bool(hr_40_51['png_bytes'] == hr_40_51_b['png_bytes'])
    hr_41_51 = BR.bake_world_tile_residual(41, 51, out_png=os.path.join(out_dir, 'tile_41_51.png'), extra_sites=oid_sites)

    print('=== Baking Pinnacle world tiles (31, 21), (31, 22), (32, 21) ===', flush=True)
    png_pin = os.path.join(out_dir, 'tile_31_21.png')
    pin_31_21 = BR.bake_world_tile_residual(31, 21, out_png=png_pin, out_json=os.path.join(out_dir, 'tile_31_21.json'),
                                            extra_sites=pin_sites, extra_pins_region='pinnacle')
    pin_31_22 = BR.bake_world_tile_residual(31, 22, out_png=os.path.join(out_dir, 'tile_31_22.png'),
                                            extra_sites=pin_sites, extra_pins_region='pinnacle')
    pin_32_21 = BR.bake_world_tile_residual(32, 21, out_png=os.path.join(out_dir, 'tile_32_21.png'),
                                            extra_sites=pin_sites, extra_pins_region='pinnacle')

    print('=== Baking coastal zero-contour stress tile (29, 22) ===', flush=True)
    coast_tile = BR.bake_world_tile_residual(29, 22, out_png=os.path.join(out_dir, 'tile_29_22_coast.png'))

    print('=== Verifying GDScript WResidual twin on 16-bit PNGs ===', flush=True)
    gd_ok_hr, gd_msg_hr = verify_gdscript_twin(hr_40_51, png_hr0, 1306 * 2000.0, 1634 * 2000.0)
    gd_ok_pin, gd_msg_pin = verify_gdscript_twin(pin_31_21, png_pin, 1007 * 2000.0, 686 * 2000.0)
    print('  High Rift twin:', gd_msg_hr.splitlines()[-1] if gd_msg_hr else '')
    print('  Pinnacle twin: ', gd_msg_pin.splitlines()[-1] if gd_msg_pin else '')

    print('=== Evaluating steep windows, WORLD.H cost, and site pins ===', flush=True)
    oid_wins = [w for w in SECTION_3_2_WINDOWS if w['region'] == 'oidong-highrift']
    pin_wins = [w for w in SECTION_3_2_WINDOWS if w['region'] == 'pinnacle']
    eval_oid = evaluate_region_with_residual('oidong-highrift', stitch_tiles_residual([hr_40_51, hr_41_51], feather_m=1500.0), oid_wins)
    eval_pin = evaluate_region_with_residual('pinnacle', stitch_tiles_residual([pin_31_21, pin_31_22, pin_32_21], feather_m=1500.0), pin_wins)

    s_hr = hr_40_51['meta']['stats']
    s_pin = pin_31_21['meta']['stats']
    s_coast = coast_tile['meta']['stats']

    all_win_rows = []
    worst_align_after = 0.0
    min_growth_hr = 999.0
    worst_slope_p99_noncliff = 0.0
    for w in SECTION_3_2_WINDOWS:
        ev = eval_oid if w['region'] == 'oidong-highrift' else eval_pin
        tb = ev['windows_before'][w['id']]
        ta = ev['windows_after'][w['id']]
        gr_b = float(tb['b180_540'] / max(tb['b60_180'], 1e-6))
        gr_a = float(ta['b180_540'] / max(ta['b60_180'], 1e-6))
        if ta['align'] is not None:
            worst_align_after = max(worst_align_after, float(ta['align']))
        if w['region'] == 'oidong-highrift':
            min_growth_hr = min(min_growth_hr, gr_a)
        worst_slope_p99_noncliff = max(worst_slope_p99_noncliff, float(ta['slope_p99_noncliff']))
        all_win_rows.append({
            'id': w['id'],
            'label': w['label'],
            'before': {
                'bands': [round(float(tb['b20_60']), 2), round(float(tb['b60_180']), 2), round(float(tb['b180_540']), 2)],
                'growth_180_60': round(gr_b, 3),
                'align': round(float(tb['align']), 4) if tb['align'] is not None else None,
                'slope_p99_raw': round(float(tb['slope'][2]), 3),
                'slope_p99_noncliff': round(float(tb['slope_p99_noncliff']), 3),
            },
            'after': {
                'bands': [round(float(ta['b20_60']), 2), round(float(ta['b60_180']), 2), round(float(ta['b180_540']), 2)],
                'growth_180_60': round(gr_a, 3),
                'align': round(float(ta['align']), 4) if ta['align'] is not None else None,
                'slope_p99_raw': round(float(ta['slope'][2]), 3),
                'slope_p99_noncliff': round(float(ta['slope_p99_noncliff']), 3),
            },
        })
        print('  %-38s align: %.3f -> %.3f | 180/60: %.2f -> %.2f | noncliff p99: %.2f -> %.2f (raw %.2f -> %.2f)' % (
            w['label'], tb['align'], ta['align'], gr_b, gr_a,
            tb['slope_p99_noncliff'], ta['slope_p99_noncliff'], tb['slope'][2], ta['slope'][2]), flush=True)

    gates = {
        '1_macro_drift': {
            'pass': bool(max(s_hr['macro_drift_rms_m'], s_pin['macro_drift_rms_m']) < 0.5 and max(s_hr['macro_drift_max_m'], s_pin['macro_drift_max_m']) < 3.0),
            'hr_rms_max': [float(s_hr['macro_drift_rms_m']), float(s_hr['macro_drift_max_m'])],
            'pin_rms_max': [float(s_pin['macro_drift_rms_m']), float(s_pin['macro_drift_max_m'])],
        },
        '2_coastline': {
            'pass': bool(max(s_hr['sea_cells_changed'], s_pin['sea_cells_changed'], s_coast['sea_cells_changed']) == 0
                         and max(s_hr['coast_zero_contour_shift_cells'], s_pin['coast_zero_contour_shift_cells'], s_coast['coast_zero_contour_shift_cells']) <= 1.0),
            'sea_cells_changed': [int(s_hr['sea_cells_changed']), int(s_pin['sea_cells_changed']), int(s_coast['sea_cells_changed'])],
            'zero_contour_shift_cells': [float(s_hr['coast_zero_contour_shift_cells']), float(s_pin['coast_zero_contour_shift_cells']), float(s_coast['coast_zero_contour_shift_cells'])],
        },
        '3_named_rivers': {
            'pass': bool(max(s_hr['named_river_max_climb_m'], s_pin['named_river_max_climb_m']) <= 1e-4
                         and max(s_hr['named_river_max_shift_cells'], s_pin['named_river_max_shift_cells']) <= 1.5),
            'max_climb_m': [float(s_hr['named_river_max_climb_m']), float(s_pin['named_river_max_climb_m'])],
            'max_shift_cells': [float(s_hr['named_river_max_shift_cells']), float(s_pin['named_river_max_shift_cells'])],
        },
        '4_sites': {
            'pass': bool(max(eval_oid['site_drift']['max_town_band_diff_m'], eval_pin['site_drift']['max_town_band_diff_m']) < 0.3),
            'oid_town_diff_m': float(eval_oid['site_drift']['max_town_band_diff_m']),
            'pin_town_diff_m': float(eval_pin['site_drift']['max_town_band_diff_m']),
        },
        '5_closed_basins': {
            'pass': bool(max(s_hr['accidental_pit_area_pct'], s_pin['accidental_pit_area_pct']) < 0.5
                         and max(s_hr['accidental_pit_max_depth_m'], s_pin['accidental_pit_max_depth_m']) <= 1.0
                         and bool(s_hr['authored_basins_preserved']) and bool(s_pin['authored_basins_preserved'])),
            'hr_pit_pct_max': [float(s_hr['accidental_pit_area_pct']), float(s_hr['accidental_pit_max_depth_m'])],
            'pin_pit_pct_max': [float(s_pin['accidental_pit_area_pct']), float(s_pin['accidental_pit_max_depth_m'])],
        },
        '6_steep_alignment': {
            'pass': bool(worst_align_after <= 0.46),
            'worst_align_after': round(float(worst_align_after), 4),
        },
        '7_band_growth': {
            'pass': bool(min_growth_hr >= 1.5),
            'min_growth_180_over_60_hr': round(float(min_growth_hr), 3),
        },
        '8_slope_p99_outside_cliffs': {
            'pass': bool(worst_slope_p99_noncliff <= 1.0),
            'worst_slope_p99_noncliff': round(float(worst_slope_p99_noncliff), 3),
        },
        '9_junction_angles': {
            'pass': bool(40.0 <= s_hr['junction_peak_deg'] <= 75.0 and 40.0 <= s_pin['junction_peak_deg'] <= 75.0),
            'hr_peak_med_deg': [float(s_hr['junction_peak_deg']), float(s_hr['junction_median_deg'])],
            'pin_peak_med_deg': [float(s_pin['junction_peak_deg']), float(s_pin['junction_median_deg'])],
        },
        '10_world_H_cost': {
            'pass': bool((eval_oid['us_after'] <= 5.5) or (eval_oid['us_after'] <= eval_oid['us_before'] * 1.25)),
            'oid_us_before_after': [float(eval_oid['us_before']), float(eval_oid['us_after'])],
            'pin_us_before_after': [float(eval_pin['us_before']), float(eval_pin['us_after'])],
        },
        '11_bake_speed_determinism': {
            'pass': bool(max(hr_40_51['meta']['bake_s'], pin_31_21['meta']['bake_s']) < 60.0 and det_identical),
            'hr_bake_s': float(hr_40_51['meta']['bake_s']),
            'pin_bake_s': float(pin_31_21['meta']['bake_s']),
            'hr_png_kb': round(hr_40_51['meta']['png_bytes'] / 1024.0, 1),
            'pin_png_kb': round(pin_31_21['meta']['png_bytes'] / 1024.0, 1),
            'sha256_identical': det_identical,
        },
        '12_gdscript_twin': {
            'pass': bool(gd_ok_hr and gd_ok_pin),
            'hr_out': gd_msg_hr.splitlines()[-1] if gd_msg_hr else '',
            'pin_out': gd_msg_pin.splitlines()[-1] if gd_msg_pin else '',
        },
    }

    out_doc = {
        'format': 'krator-stage2-t2-evaluation',
        'version': 1,
        'tiles': {
            'highrift_40_51': {k: v for k, v in hr_40_51['meta'].items() if k != 'u16_b64'},
            'pinnacle_31_21': {k: v for k, v in pin_31_21['meta'].items() if k != 'u16_b64'},
            'coast_29_22': {k: v for k, v in coast_tile['meta'].items() if k != 'u16_b64'},
        },
        'windows': all_win_rows,
        'gates': gates,
    }
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(out_doc, f, indent=2)
    print('\n=== 12-Gate Summary ===')
    for gk, gv in gates.items():
        print('  %-28s : %s  (%s)' % (gk, 'PASS' if gv['pass'] else 'FAIL', {k: v for k, v in gv.items() if k != 'pass'}))
    print('wrote', args.out)
    return 0


if __name__ == '__main__':
    sys.exit(main())
