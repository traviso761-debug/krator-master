#!/usr/bin/env python3
"""Unit and negative tests for Stage 1 budgets (samplers, vram_mb) and route_harness.py."""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.dirname(HERE)
ROOT = os.path.dirname(TOOLS)
sys.path.insert(0, TOOLS)

import check_budgets as CB  # noqa: E402
import harness as H         # noqa: E402
import route_harness as RH  # noqa: E402

fails = 0
checks = 0


def ok(cond, msg):
    global fails, checks
    checks += 1
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails += 1


def test_vram_js_in_node():
    js = """
    globalThis.window = globalThis;
    const tex1 = { isTexture: true, image: { width: 512, height: 512 }, generateMipmaps: true, minFilter: 1008 };
    const texData = { isTexture: true, isDataTexture: true, image: { data: new Uint8Array(256 * 256 * 4) }, generateMipmaps: false, minFilter: 1006 };
    const sharedBuf = new Float32Array(3000); // 12,000 bytes
    const geom1 = { attributes: { position: { array: sharedBuf }, normal: { data: { array: sharedBuf } } }, index: { array: new Uint16Array(1500) } };
    const instArr = new Float32Array(16 * 100); // 6,400 bytes
    const mesh1 = { material: { map: tex1, uniforms: { uData: { value: texData } } }, geometry: geom1, isInstancedMesh: true, instanceMatrix: { array: instArr } };
    const mesh2 = { material: { map: tex1 }, geometry: geom1 }; // shares tex1 and geom1 -> must NOT double count
    globalThis.scene = { isScene: true, traverse: (fn) => { fn(mesh1); fn(mesh2); } };
    globalThis.camera = { isCamera: true };
    const fn = %s;
    console.log(JSON.stringify(fn()));
    """ % H.VRAM_JS
    r = subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True)
    v = json.loads(r.stdout.strip())
    # tex1: 512*512*4 * 4/3 = 1,398,101 B; texData: 262,144 B -> total tex = 1.58 MB
    # geom: sharedBuf (12,000) + index (3,000) + instArr (6,400) = 21,400 B = 0.02 MB
    ok(v['texN'] == 2 and v['geomN'] == 1 and abs(v['texMB'] - 1.58) <= 0.02 and abs(v['geomMB'] - 0.02) <= 0.01,
       'VRAM_JS deduplicates shared textures/geometries/InterleavedBuffers: %s' % v)


def test_budget_entries_and_ratchet():
    sample = {
        'what': 'test budget',
        'pages': {
            'foo.html': {
                'bytes': 8388608,
                'tris': 2000000,
                'calls': 250,
                'samplers': 14,
                'vram_mb': 320,
                'why': 'Initial Stage 1 route baseline with samplers and estimated VRAM.',
                'raised': '2026-11-19',
            }
        }
    }
    ent = dict(CB.entries(sample))
    ok(('pages', 'foo.html') in ent and ent[('pages', 'foo.html')]['samplers'] == 14 and ent[('pages', 'foo.html')]['vram_mb'] == 320,
       'check_budgets.entries parses samplers and vram_mb ceilings')

    # Test route_harness compare_baselines pass & negative regression catches
    with tempfile.TemporaryDirectory() as td:
        b_path = os.path.join(td, 'base.json')
        c_ok_path = os.path.join(td, 'cur_ok.json')
        c_bad_path = os.path.join(td, 'cur_bad.json')
        base_doc = {
            'stops': [{
                'id': 'city_block',
                'samplers_max': 12,
                'vram': {'totalMB': 200.0},
                'plant_ground': {'worst_m': 0.12},
                'hours': [{'hour': 12.0, 'calls': 100, 'tris': 500000}],
            }]
        }
        cur_ok = {
            'stops': [{
                'id': 'city_block',
                'samplers_max': 12,
                'vram': {'totalMB': 205.0},
                'plant_ground': {'worst_m': 0.14},
                'hours': [{'hour': 12.0, 'calls': 102, 'tris': 505000}],
            }]
        }
        cur_bad = {
            'stops': [{
                'id': 'city_block',
                'samplers_max': 16,
                'vram': {'totalMB': 260.0},
                'plant_ground': {'worst_m': 1.85},
                'hours': [{'hour': 12.0, 'calls': 145, 'tris': 700000}],
            }]
        }
        for p, d in ((b_path, base_doc), (c_ok_path, cur_ok), (c_bad_path, cur_bad)):
            with open(p, 'w', encoding='utf-8') as f:
                json.dump(d, f)
        p_ok, _, p_fails = RH.compare_baselines(b_path, c_ok_path)
        ok(p_ok and not p_fails, 'route_harness.compare_baselines passes within tolerance')
        n_ok, _, n_fails = RH.compare_baselines(b_path, c_bad_path)
        ok((not n_ok) and len(n_fails) == 5,
           'negative: route_harness.compare_baselines catches sampler, VRAM, draw-call, triangle & plant-grounding regressions (%d caught)' % len(n_fails))


def test_existing_repo_budgets():
    rc = CB.main([])
    ok(rc == 0, 'check_budgets.py passes across all existing builds in repo')


if __name__ == '__main__':
    test_vram_js_in_node()
    test_budget_entries_and_ratchet()
    test_existing_repo_budgets()
    print('\n%s test_route_and_budgets (%d checks, %d failed)' % ('FAIL' if fails else 'PASS', checks, fails))
    sys.exit(1 if fails else 0)
