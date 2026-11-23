#!/usr/bin/env python3
"""Stage 2 T1 Contour-Alignment Ablation (GRAPHICS-TERRAIN-PROPOSAL.md Section 4 T1, Section 3.2).

Evaluates the six steep 4 km windows of Section 3.2 (plus oidong-highrift's 95000, 42000 High Rift flank) at 10 m
spacing across six ablation configurations on WMICRO v2 (`KRATOR_MICRO = 2`):
  1. baseline          — WMICRO v2, benches on, landforms on, DEPTH = 0.55
  2. no_benches        — WRELIEF.bench disabled (returns h)
  3. no_landforms      — WLAND.apply disabled (returns h)
  4. erode_2x          — WMICRO erosion DEPTH doubled (0.55 -> 1.10, ceiling 0.75 -> 1.50)
  5. no_bench_no_land  — both WRELIEF.bench and WLAND.apply disabled
  6. macro_only        — baseH + N1/N2/N3 + channels only (WMICRO off, benches off, landforms off, small streams off)

Outputs JSON metrics and a Markdown summary table identifying which pass drives the 0.55–0.73 contour-parallel
alignment and the High Rift spectral inversion (180-540 m < 60-180 m).
"""
import argparse, json, os, subprocess, sys, tempfile
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import landshade as LS   # noqa: E402
import world_data as WD  # noqa: E402

WINDOWS = [
    {'id': 'pin_hj_1', 'region': 'pinnacle', 'label': 'pinnacle, hyperjungle (-20000, 34000)', 'box': [-20000.0, 34000.0, -16000.0, 38000.0]},
    {'id': 'pin_nerim', 'region': 'pinnacle', 'label': 'pinnacle, NE rim (36000, -4000)', 'box': [36000.0, -4000.0, 40000.0, 0.0]},
    {'id': 'pin_hj_2', 'region': 'pinnacle', 'label': 'pinnacle, hyperjungle (-16000, 34000)', 'box': [-16000.0, 34000.0, -12000.0, 38000.0]},
    {'id': 'oid_valley', 'region': 'oidong-highrift', 'label': 'oidong, Oidong Valley (-28000, 22000)', 'box': [-28000.0, 22000.0, -24000.0, 26000.0]},
    {'id': 'oid_hr_1', 'region': 'oidong-highrift', 'label': 'oidong, High Rift (14000, 34000)', 'box': [14000.0, 34000.0, 18000.0, 38000.0]},
    {'id': 'oid_hr_2', 'region': 'oidong-highrift', 'label': 'oidong, High Rift (6000, 30000)', 'box': [6000.0, 30000.0, 10000.0, 34000.0]},
    {'id': 'oid_hr_steep', 'region': 'oidong-highrift', 'label': 'oidong, High Rift flank (95000, 42000)', 'box': [95000.0, 42000.0, 99000.0, 46000.0]},
]

MODES = [
    ('baseline', 'Baseline (v2, all on)'),
    ('no_benches', 'Benches off'),
    ('no_landforms', 'Landforms off'),
    ('erode_2x', 'Erosion depth 2x'),
    ('no_bench_no_land', 'Benches + Landforms off'),
    ('macro_only', 'Macro + hills/ridges only'),
]


def sample_region_windows(region, wins, step=10.0):
    """Run one Node process for `region` to sample all `wins` across all `MODES` cleanly and quickly."""
    data_dir = os.path.join(ROOT, 'openworld', region, 'data')
    micro_src = open(os.path.join(HERE, '43m-world-micro.js'), encoding='utf-8').read()
    # Build a second copy of WMICRO with doubled DEPTH (1.10) and doubled slope-depth cap (1.50)
    micro_2x = micro_src.replace('var WMICRO=', 'var WMICRO_2X=')
    micro_2x = micro_2x.replace('DEPTH=.55', 'DEPTH=1.10').replace('Math.min(.75,DEPTH*g)', 'Math.min(1.50,DEPTH*g)')
    micro_2x = micro_2x.replace('module.exports=WMICRO;', '')

    parts = [
        '"use strict";var window=globalThis;var KRATOR_MICRO=2;\n',
        open(os.path.join(ROOT, 'core', 'rand', '08-core-rand.js'), encoding='utf-8').read(),
        open(os.path.join(ROOT, 'core', 'terrain', '38-core-relief.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '40-world-smooth.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '43-world-relief.js'), encoding='utf-8').read(),
        micro_src,
        '\n',
        micro_2x,
        '\n',
        open(os.path.join(HERE, '44-world-streams.js'), encoding='utf-8').read(),
        WD.fragment(data_dir, 'var WORLD_KITS=[];\n', 'ablate_t1', data_dir),
    ]
    for k in WD.land_js(region):
        parts.append(open(os.path.join(ROOT, *k), encoding='utf-8').read())
    parts.append(open(os.path.join(HERE, '41-world-fields.js'), encoding='utf-8').read())

    tmp_dir = tempfile.mkdtemp(prefix='krator_t1_')
    spec = {
        'wins': wins,
        'modes': [m[0] for m in MODES],
        'step': step,
        'out_dir': tmp_dir.replace(os.sep, '/'),
    }
    parts.append(r"""
const fs = require('fs');
const SPEC = %s;
WORLD.init(WORLD_R);
WMICRO_2X.init({ox: WORLD_DATA.meta.frame.origin_px[0]*2000, oz: WORLD_DATA.meta.frame.origin_px[1]*2000, seed: WORLD_DATA.meta.relief.seed ^ 0x4D4943, version: 2});

const origBench = WRELIEF.bench;
const origLand = typeof WLAND !== 'undefined' ? WLAND.apply : null;
const origErode = WMICRO.erode;
const origHills = WMICRO.hills;
const origGrain = WMICRO.grain;
const origStreams = WORLD_DATA.meta.streams;

function setMode(mode) {
  WRELIEF.bench = origBench;
  if (origLand) WLAND.apply = origLand;
  WMICRO.erode = origErode;
  WMICRO.hills = origHills;
  WMICRO.grain = origGrain;
  if (mode === 'no_benches') {
    WRELIEF.bench = (h) => h;
  } else if (mode === 'no_landforms') {
    if (origLand) WLAND.apply = (h) => h;
  } else if (mode === 'erode_2x') {
    WMICRO.erode = WMICRO_2X.erode;
  } else if (mode === 'no_bench_no_land') {
    WRELIEF.bench = (h) => h;
    if (origLand) WLAND.apply = (h) => h;
  } else if (mode === 'macro_only') {
    WRELIEF.bench = (h) => h;
    if (origLand) WLAND.apply = (h) => h;
    WMICRO.erode = (h) => h;
    WMICRO.hills = () => 0;
    WMICRO.grain = () => 0;
  }
}

const metaOut = {};
for (const w of SPEC.wins) {
  const [x0, z0, x1, z1] = w.box;
  const cx = (x0 + x1) * 0.5, cz = (z0 + z1) * 0.5;
  const B = WORLD.biomeAt(cx, cz), S = WORLD.style(cx, cz);
  const nx = Math.round((x1 - x0) / SPEC.step) + 1;
  const nz = Math.round((z1 - z0) / SPEC.step) + 1;
  metaOut[w.id] = {biome: B && B.name, style: S, nx, nz};
  for (const mode of SPEC.modes) {
    setMode(mode);
    const A = new Float64Array(nx * nz);
    for (let j = 0; j < nz; j++) {
      const z = z0 + j * SPEC.step;
      for (let i = 0; i < nx; i++) {
        A[j * nx + i] = WORLD.Hbare(x0 + i * SPEC.step, z, 0);
      }
    }
    fs.writeFileSync(SPEC.out_dir + '/' + w.id + '__' + mode + '.f64', Buffer.from(A.buffer));
  }
}
fs.writeFileSync(SPEC.out_dir + '/meta.json', JSON.stringify(metaOut));
""" % json.dumps(spec))

    js_path = os.path.join(tmp_dir, 'run.js')
    with open(js_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(''.join(parts))

    r = subprocess.run([LS.node(), '--max-old-space-size=6000', js_path], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError('ablate_t1 node failed (%s):\n%s' % (region, r.stderr[-3000:]))

    wmeta = json.load(open(os.path.join(tmp_dir, 'meta.json'), encoding='utf-8'))
    results = {}
    for w in wins:
        wid = w['id']
        nx, nz = wmeta[wid]['nx'], wmeta[wid]['nz']
        m_res = {}
        for mode_id, _ in MODES:
            fpath = os.path.join(tmp_dir, '%s__%s.f64' % (wid, mode_id))
            E = np.fromfile(fpath, dtype=np.float64).reshape(nz, nx)
            T = LS.texture(E, step)
            s_band, c_band = LS.bands(E, step)
            tr, tn = LS.rings(E, step)
            ratio = (T['b180_540'] / max(T['b60_180'], 1e-6)) if T else None
            m_res[mode_id] = {
                'b20_60': round(T['b20_60'], 2) if T else None,
                'b60_180': round(T['b60_180'], 2) if T else None,
                'b180_540': round(T['b180_540'], 2) if T else None,
                'growth_180_over_60': round(ratio, 3) if ratio is not None else None,
                'align': round(T['align'], 4) if (T and T['align'] is not None) else None,
                'slope_p50_p90_p99': [round(x, 3) for x in T['slope']] if T else None,
                'ringed_pct': round(tr * 100.0, 1),
                'band_step_m': s_band,
                'band_contrast': round(float(c_band), 2),
            }
            os.remove(fpath)
        results[wid] = {
            'id': wid,
            'region': region,
            'label': w['label'],
            'box': w['box'],
            'biome': wmeta[wid]['biome'],
            'terr': round(float(wmeta[wid]['style'].get('terr', 0.0)), 2),
            'modes': m_res,
        }
    for fn in os.listdir(tmp_dir):
        os.remove(os.path.join(tmp_dir, fn))
    os.rmdir(tmp_dir)
    return results


def to_markdown(all_res):
    lines = [
        '# Stage 2 T1 Ablation — Contour-Parallel Relief & Spectral Growth',
        '',
        '| Window | Biome (`terr`) | Config | 20-60 / 60-180 / 180-540 m | 180/60 Ratio | Alignment | Slope p50 / p90 / p99 | Ringed Tiles |',
        '|---|---|---|---|---:|---:|---|---:|',
    ]
    for w in WINDOWS:
        r = all_res[w['id']]
        for i, (mid, mlabel) in enumerate(MODES):
            m = r['modes'][mid]
            sl = m['slope_p50_p90_p99']
            lines.append('| %s | %s (`%.2f`) | %s | `%.1f / %.1f / %.1f` | `%.2f` | **`%s`** | `%.2f / %.2f / %.2f` | `%.0f%%` |' % (
                r['label'] if i == 0 else '',
                r['biome'] if i == 0 else '',
                r['terr'] if i == 0 else 0.0,
                mlabel,
                m['b20_60'], m['b60_180'], m['b180_540'],
                m['growth_180_over_60'],
                '%.2f' % m['align'] if m['align'] is not None else '-',
                sl[0], sl[1], sl[2],
                m['ringed_pct'],
            ))
    lines.append('')
    return '\n'.join(lines)


def main(argv=None):
    ap = argparse.ArgumentParser(description='Stage 2 T1 Contour-Alignment Ablation')
    ap.add_argument('--step', type=float, default=10.0)
    ap.add_argument('--out', default='')
    ap.add_argument('--md', default='')
    args = ap.parse_args(argv)

    all_res = {}
    for reg in ('pinnacle', 'oidong-highrift'):
        rwins = [w for w in WINDOWS if w['region'] == reg]
        print('T1 ablating %s (%d windows at %g m)...' % (reg, len(rwins), args.step), flush=True)
        res = sample_region_windows(reg, rwins, step=args.step)
        all_res.update(res)
        for w in rwins:
            r = res[w['id']]
            b = r['modes']['baseline']
            nb = r['modes']['no_benches']
            nl = r['modes']['no_landforms']
            e2 = r['modes']['erode_2x']
            nbl = r['modes']['no_bench_no_land']
            mo = r['modes']['macro_only']
            print('  %-38s align: base=%s  noBench=%s  noLand=%s  erode2x=%s  noBenchLand=%s  macro=%s  | 180/60=%s' % (
                w['label'], b['align'], nb['align'], nl['align'], e2['align'], nbl['align'], mo['align'], b['growth_180_over_60']), flush=True)

    doc = {'format': 'krator-t1-ablation', 'version': 1, 'step_m': args.step, 'windows': [all_res[w['id']] for w in WINDOWS]}
    if args.out:
        os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
        with open(args.out, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(doc, f, indent=2)
        print('wrote', args.out)
    if args.md:
        os.makedirs(os.path.dirname(os.path.abspath(args.md)), exist_ok=True)
        with open(args.md, 'w', encoding='utf-8', newline='\n') as f:
            f.write(to_markdown(all_res))
        print('wrote', args.md)
    return 0


if __name__ == '__main__':
    sys.exit(main())
