#!/usr/bin/env python3
"""Headless verification for the 'little demo' open world.

Usage:
  python verify.py dist/little-demo.html [--views 2,4,8] [--all-views] [--assert]
                                         [--cam x,z,agl,yaw,pitch] [--out ./shots] [--size 1280x800] [--eval '()=>...']

  1. Serves the page's folder over HTTP and loads it in headless Chromium (SwiftShader), three.js r128 served
     from the repo instead of the CDN.
  2. Prints the error panel and the streaming stats once the first view has loaded.
  3. --assert: the probe's checks (src/91-world-probe.js: cell seeding in three orders, a continuous land, nothing
     rooted in water or outside the region, no NaN) and their NEGATIVE CONTROLS, each of which must fail.
  4. Screenshots: --views takes the "Go to" list's indices (python verify.py ... --list prints it); --cam a custom
     view. Each view is streamed to completion (window._api.settle) before it is drawn.

Exit code is non-zero if the error panel is dirty, a check fails or a negative passes.
Software GL is slow: a view takes 20-60 s to settle and draw. Requires: pip install playwright && python -m
playwright install chromium (KRATOR_CHROME=/path/to/chrome launches a Chromium already on the machine).
"""
import argparse, asyncio, functools, http.server, json, os, socketserver, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
from harness import verify_page, Abort   # the launcher (KRATOR_CHROME), the server and the pinned three.js
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    async with verify_page(a.html, here=HERE, size=a.size, settle_ms=0,
                           ready_js="typeof CAM==='object'&&CAM&&window._api") as V:
        pg, errs, fails = V.page, V.errs, V.fails
        pg.set_default_timeout(900000)
        if not V.ready:
            print('timed out waiting for the page to build'); fails.append('build timeout')
        if a.list:
            print('\n'.join(await pg.evaluate('_api.views()')))
            raise Abort(0)
        settle = await pg.evaluate('_api.settle(240000)')
        st = await pg.evaluate('_api.stats()')
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        print('ERROR PANEL:', repr(panel) if panel else 'clean')
        if panel:
            fails.append('error panel')
        if errs:
            print('PAGE ERRORS:', errs[:5])
            fails.append('page errors')
        print('settle:', json.dumps(settle))
        print('stats:', json.dumps(st))
        if a.assert_:
            print('\n--- checks ---')
            for r in await pg.evaluate('_api.hostChecks()'):
                print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                if not r['ok']:
                    fails.append(r['name'])
            print('--- negative controls (each must fail) ---')
            for r in await pg.evaluate('_api.hostNegatives()'):
                print(('  PASS  ' if not r['ok'] else '  MISSED') + r['name'] + ' : ' + r['detail'])
                if r['ok']:
                    fails.append('negative ' + r['name'])
        views = []
        if a.all_views:
            views = list(range(len(await pg.evaluate('_api.views()'))))
        elif a.views:
            views = [int(v) for v in a.views.split(',') if v.strip()]
        shots = [('view%02d' % v, '_api.go(%d)' % v) for v in views]
        for i, c in enumerate(a.cam or []):
            x, z, agl, yaw, pitch = [float(t) for t in c.split(',')]
            shots.append(('cam%d' % i, '_api.view(%r,%r,%r,%r,%r)' % (x, z, agl, yaw, pitch)))
        for label, js in shots:
            await pg.evaluate(js)
            tw = await pg.evaluate('_api.towns ? _api.towns() : null')
            if tw and (tw['failed'] or tw['loaded']):
                print('   towns: %d loaded, %d meshes, %.2f M triangles%s' % (tw['loaded'], tw['meshes'], tw['tris'] / 1e6,
                      ('; FAILED ' + '; '.join(tw['failed'])) if tw['failed'] else ''))
            s = await pg.evaluate('_api.settle(240000)')
            r = await pg.evaluate('_api.render()')
            out = os.path.join(a.out, label + '.png')
            await V.shot(out, view=label)
            print('%s: %s  settle %s  draws %d  tris %d' % (label, out, s['ms'], r['calls'], r['triangles']))
            for e in a.eval or []:
                print('   eval: %s' % await pg.evaluate(e))
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        if panel and 'error panel' not in fails:
            print('ERROR PANEL (after views):', panel[:2000])
            fails.append('error panel after views')
        print('\nBUILD CHECKS:', 'OK' if not fails else 'FAILED: ' + ', '.join(fails))
    return V.exit()

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views', default='')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--cam', action='append')
    ap.add_argument('--out', default='./shots')
    ap.add_argument('--size', default='1280x800')
    ap.add_argument('--eval', action='append', help='a JS function (source) run after each view; its value printed')
    sys.exit(asyncio.run(run(ap.parse_args())))
