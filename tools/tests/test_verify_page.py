#!/usr/bin/env python3
"""The negative cases of tools/harness.py verify_page: a clean fixture page passes every universal assert, and each
broken one fails the assert it breaks (CORE-IMPROVEMENTS.md items 2c, 2d, 3c, 6, 10a); the survey's checks (2026-11-11):
a case the opt-in check catches passes with it off and fails with it on (27 samplers, 28 the drawn ground), and a lane lock
held without KRATOR_GL=gpu fails gpu-renderer whatever the ratchet says (22). A small page, so SwiftShader is enough;
KRATOR_GL=gpu runs it on the GPU, under the lock (the lane-no-gpu case then does not apply: run it in SwiftShader).

    python3 tools/tests/test_verify_page.py
"""
import asyncio, os, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..'))
import harness   # noqa: E402

FIXTURE = os.path.join(HERE, 'verify_page', 'fixture.html')
# case -> the universal assert it must fail (None: every assert passes)
CASES = {'clean': None, 'broken-shader': 'shader-errors', 'lfs-texture': 'textures-decoded', 'eye-inside': 'eye:as loaded',
         'eye-under': 'eye:as loaded', 'nan': 'no-nan-geometry', 'instance-cap': 'instance-cap',
         'error-panel': 'error-panel', 'empty-volume': 'registered-volumes-non-empty'}


# the survey's opt-in checks (items 27, 28): case -> (checks, the assert it must fail with them on; off, the case passes)
OPTIN = {'eye-under-drawn': (('drawn-ground',), 'eye:as loaded'), 'samplers-16': (('samplers',), 'samplers'),
         'samplers-15': (('samplers',), None)}


async def one(case, checks=None):
    async with harness.verify_page(FIXTURE, here=os.path.dirname(FIXTURE), size='640x400', query='?case=' + case, settle_ms=500,
                                   checks=checks) as V:
        pass
    return {n for n, ok, d in V.universal if not ok}, V


async def main():
    bad = 0
    for case, want in CASES.items():
        failed, V = await one(case)
        ok = failed == ({want} if want else set())
        bad += not ok
        print('%s  %-14s fails %s%s' % ('ok  ' if ok else 'FAIL', case, sorted(failed) or 'nothing',
                                        '' if ok else '   (expected %s)' % (want or 'nothing')), flush=True)
        if not ok:
            for n, o, d in V.universal:
                print('        %s %s: %s' % ('PASS' if o else 'FAIL', n, d[:200]))
    for case, (checks, want) in OPTIN.items():
        off, _ = await one(case)
        on, V = await one(case, checks)
        ok = not off and on == ({want} if want else set())
        if case == 'samplers-15':   # warns, does not fail
            ok = ok and any(n == 'samplers' and d.startswith('WARN: ') for n, o, d in V.universal)
        bad += not ok
        print('%s  %-14s off: fails %s; with %s: fails %s%s' % ('ok  ' if ok else 'FAIL', case, sorted(off) or 'nothing', ','.join(checks),
                                                                 sorted(on) or 'nothing', '' if ok else '   (expected %s)' % (want or 'a warning')), flush=True)
        if not ok:
            for n, o, d in V.universal:
                print('        %s %s: %s' % ('PASS' if o else 'FAIL', n, d[:240]))
    # item 22: a lane lock held without KRATOR_GL=gpu is a hard fail, the ratchet cannot excuse it
    os.environ['KRATOR_GPU_LOCK_HELD'], os.environ['KRATOR_GPU_LANE_HELD'] = 'harness pid=0 (test)', 'arc'
    try:
        failed, V = await one('clean')
    finally:
        os.environ.pop('KRATOR_GPU_LOCK_HELD', None); os.environ.pop('KRATOR_GPU_LANE_HELD', None)
    ok = failed == {'gpu-renderer'} and 'gpu-renderer' in harness.HARD and V.renderer
    bad += not ok
    print('%s  lane-no-gpu    fails %s (renderer %s)' % ('ok  ' if ok else 'FAIL', sorted(failed) or 'nothing', V.renderer), flush=True)
    # the winding sweep reports, it does not fail: the clean page lists nothing, an inverted mesh is named
    _, V = await one('inside-out')
    w = V.winding or {}
    ok = [x['name'] for x in w.get('suspects', [])] == ['inverted rock']
    _, V = await one('clean')
    ok = ok and not (V.winding or {'suspectN': 1})['suspectN']
    bad += not ok
    print('%s  winding        %s' % ('ok  ' if ok else 'FAIL', w))
    # an LFS pointer instead of a page: refused before any browser starts
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as fh:
        fh.write('version https://git-lfs.github.com/spec/v1\noid sha256:00\nsize 8000000\n')
    try:
        async with harness.verify_page(fh.name):
            pass
        print('FAIL  lfs-pointer    the page opened'); bad += 1
    except SystemExit as e:
        print('%s  lfs-pointer    exit %s' % ('ok  ' if e.code == 1 else 'FAIL', e.code)); bad += e.code != 1
    finally:
        os.remove(fh.name)
    print('%d cases, %d wrong' % (len(CASES) + len(OPTIN) + 3, bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
