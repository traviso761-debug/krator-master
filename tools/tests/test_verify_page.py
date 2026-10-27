#!/usr/bin/env python3
"""The negative cases of tools/harness.py verify_page: a clean fixture page passes every universal assert, and each
broken one fails the assert it breaks (CORE-IMPROVEMENTS.md items 2c, 2d, 3c, 6, 10a). A small page, so SwiftShader
is enough; KRATOR_GL=gpu runs it on the GPU, under the lock.

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


async def one(case):
    async with harness.verify_page(FIXTURE, here=os.path.dirname(FIXTURE), size='640x400', query='?case=' + case, settle_ms=500) as V:
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
    print('%d cases, %d wrong' % (len(CASES) + 1, bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
