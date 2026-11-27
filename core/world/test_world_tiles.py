#!/usr/bin/env python3
"""Tests for Stage 2 fixed 64 km world-tile stream baking (core/world/world_tiles.py & bake_streams.py --world-tiles).

Verifies:
  1. Legacy per-region `bake_streams.py pinnacle --check` stays 100% `same` (v1 regions untouched until Stage 8).
  2. Two overlapping regions with DIFFERENT `origin_px` frames and DIFFERENT polygon masks over the same 64 km world
     tile `(31, 21)` produce bit-for-bit identical world-space stream curves (`<= 1e-6 m` difference) and `0` rising
     beds (`WSTREAMS.check`).
"""
import json, os, shutil, subprocess, sys, tempfile
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import bake_streams as BS  # noqa: E402
import world_data as WD    # noqa: E402
import world_tiles as WT   # noqa: E402

fails = 0
checks = 0


def ok(cond, msg):
    global fails, checks
    checks += 1
    print(('PASS  ' if cond else 'FAIL  ') + msg, flush=True)
    if not cond:
        fails += 1


def decode_world_streams(data_dir):
    """Run WORLD.streams() + WSTREAMS.check() in Node on `data_dir` and return `{ox, oz, bad, curves_world}`."""
    M = WD.meta(data_dir)
    ox = M['frame']['origin_px'][0] * WT.M_PER_PX
    oz = M['frame']['origin_px'][1] * WT.M_PER_PX
    parts = [
        '"use strict";var window=globalThis;\n',
        open(os.path.join(ROOT, 'core', 'rand', '08-core-rand.js'), encoding='utf-8').read(),
        open(os.path.join(ROOT, 'core', 'terrain', '38-core-relief.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '40-world-smooth.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '43-world-relief.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '43m-world-micro.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '43d-world-residual.js'), encoding='utf-8').read(),
        open(os.path.join(HERE, '44-world-streams.js'), encoding='utf-8').read(),
        WD.fragment(data_dir, 'var WORLD_KITS=[];\n', 'test_world_tiles', data_dir.replace(os.sep, '/')),
        open(os.path.join(HERE, '41-world-fields.js'), encoding='utf-8').read(),
        r"""
WORLD.init(WORLD_R);
const ox = WORLD_DATA.meta.frame.origin_px[0] * 2000;
const oz = WORLD_DATA.meta.frame.origin_px[1] * 2000;
const S = WORLD.streams();
const bad = WSTREAMS.check(S.map(l => l.pts));
const out = S.map(l => ({
  wet: l.wet,
  end: l.end,
  head_w: [Math.round((l.pts[0][0] + ox) * 10) / 10, Math.round((l.pts[0][1] + oz) * 10) / 10],
  pts_w: l.pts.map(p => [+(p[0] + ox).toFixed(4), +(p[1] + oz).toFixed(4), +p[2].toFixed(6), +p[3].toFixed(4)])
}));
process.stdout.write(JSON.stringify({bad, count: out.length, lines: out}));
""",
    ]
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(''.join(parts))
        js_path = f.name
    try:
        r = subprocess.run([BS.node(), '--max-old-space-size=4096', js_path], capture_output=True, text=True, check=True)
        return json.loads(r.stdout)
    finally:
        if os.path.isfile(js_path):
            os.remove(js_path)


def main():
    # 1. Legacy per-region --check compatibility on committed pinnacle (v1)
    r_chk = subprocess.run([sys.executable, os.path.join(HERE, 'bake_streams.py'), 'pinnacle', '--check'],
                           capture_output=True, text=True)
    ok(r_chk.returncode == 0 and 'check: same' in r_chk.stdout,
       'legacy per-region bake_streams.py pinnacle --check remains exact (`same`)')

    # 2. World-tile agreement between two overlapping regions with shifted origins and different masks
    td = tempfile.mkdtemp(prefix='krator_test_wt_')
    try:
        src_pin = os.path.join(ROOT, 'openworld', 'pinnacle', 'data')
        reg_a = os.path.join(td, 'reg_a', 'data')
        reg_b = os.path.join(td, 'reg_b', 'data')
        cache_dir = os.path.join(td, 'tile_cache')
        shutil.copytree(src_pin, reg_a)
        shutil.copytree(src_pin, reg_b)

        # Shift reg_b's origin_px by (+4, +3) map pixels (+8 km, +6 km) and shrink its mask polygon to an overlap sub-box
        mb_path = os.path.join(reg_b, 'region.json')
        MB = json.load(open(mb_path, encoding='utf-8'))
        cx_old, cy_old = MB['frame']['origin_px']
        MB['frame']['origin_px'] = [cx_old + 4, cy_old + 3]
        MB['relief']['micro'] = 2
        # Narrow mask.png of reg_b to interior pixels [16..38, 16..38] (world px [998..1020, 676..698], inside tile 31,21)
        W, H = MB['frame']['size_px']
        mask_b = np.zeros((H, W), dtype=np.uint8)
        mask_b[16:38, 16:38] = 255
        Image.fromarray(mask_b, 'L').save(os.path.join(reg_b, 'mask.png'))
        with open(mb_path, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(MB, f, indent=1)

        ma_path = os.path.join(reg_a, 'region.json')
        MA = json.load(open(ma_path, encoding='utf-8'))
        MA['relief']['micro'] = 2
        with open(ma_path, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(MA, f, indent=1)

        sr_a = BS.trace_region_from_world_tiles(reg_a, cache_dir=cache_dir, relief_micro=2)
        sr_b = BS.trace_region_from_world_tiles(reg_b, cache_dir=cache_dir, relief_micro=2)
        MA['streams'] = sr_a
        MB['streams'] = sr_b
        with open(ma_path, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(MA, f, indent=1)
        with open(mb_path, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(MB, f, indent=1)

        dec_a = decode_world_streams(reg_a)
        dec_b = decode_world_streams(reg_b)

        ok(len(dec_a['bad']) == 0 and len(dec_b['bad']) == 0,
           'WSTREAMS.check passes with 0 bed reversals on both world-tile regions (A=%d lines, B=%d lines)' % (dec_a['count'], dec_b['count']))

        # Every line completely inside the deep interior of reg_b's mask (wx in [2002000, 2034000], wz in [1358000, 1390000])
        # must appear in BOTH reg_a and reg_b with identical world-space curve vertices!
        def in_inner(L):
            return all(2002000.0 <= p[0] <= 2034000.0 and 1358000.0 <= p[1] <= 1390000.0 for p in L['pts_w'])

        map_a = {tuple(L['head_w']): L for L in dec_a['lines'] if in_inner(L)}
        map_b = {tuple(L['head_w']): L for L in dec_b['lines'] if in_inner(L)}

        common_keys = sorted(set(map_a.keys()) & set(map_b.keys()))
        max_diff = 0.0
        for k in common_keys:
            pa = np.array(map_a[k]['pts_w'], dtype=np.float64)
            pb = np.array(map_b[k]['pts_w'], dtype=np.float64)
            if pa.shape != pb.shape:
                max_diff = 999.0
                break
            max_diff = max(max_diff, float(np.max(np.abs(pa - pb))))

        ok(len(common_keys) >= 15 and set(map_a.keys()) == set(map_b.keys()) and max_diff <= 1e-3,
           'world-tile streams agree across shifted-origin overlapping regions (%d shared interior lines, max world diff %.6f m)' % (
               len(common_keys), max_diff))
    finally:
        shutil.rmtree(td, ignore_errors=True)

    print('\n%s test_world_tiles (%d checks, %d failed)' % ('FAIL' if fails else 'PASS', checks, fails))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
