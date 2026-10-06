#!/usr/bin/env python3
"""Headless verification for the 'little demo' open world.

Usage:
  python verify.py dist/little-demo.html [--views 2,4,8] [--all-views] [--assert]
                                         [--cam x,z,agl,yaw,pitch] [--out ./shots] [--size 1280x800]

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

GL_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]
HERE = os.path.dirname(os.path.abspath(__file__))
THREE = os.path.join(HERE, '..', '..', 'kits', 'ancients', 'three.min.js')
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass


async def launch_chromium(p):
    for k in ("KRATOR_CHROME", "PW_CHROME", "CHROME_PATH"):
        if os.environ.get(k):
            return await p.chromium.launch(executable_path=os.environ[k], args=GL_ARGS)
    return await p.chromium.launch(args=GL_ARGS)


async def run(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html))
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=folder)
    handler.log_message = lambda *x: None
    httpd = socketserver.TCPServer(('127.0.0.1', 0), handler)
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    fails = []
    os.makedirs(a.out, exist_ok=True)
    async with async_playwright() as p:
        b = await launch_chromium(p)
        W, H = [int(t) for t in a.size.split('x')]
        pg = await b.new_page(viewport={'width': W, 'height': H})
        pg.set_default_timeout(900000)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        if os.path.exists(THREE):
            await pg.route('**/three.min.js', lambda r: asyncio.ensure_future(r.fulfill(path=THREE, content_type='application/javascript')))
        await pg.goto('http://127.0.0.1:%d/%s' % (port, name))
        await pg.wait_for_function("(typeof CAM==='object'&&CAM&&window._api)||(document.getElementById('errs')&&document.getElementById('errs').textContent.length>0)", timeout=600000)
        if a.list:
            print('\n'.join(await pg.evaluate('_api.views()')))
            await b.close()
            return 0
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
            await pg.screenshot(path=out)
            print('%s: %s  settle %s  draws %d  tris %d' % (label, out, s['ms'], r['calls'], r['triangles']))
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        if panel and 'error panel' not in fails:
            print('ERROR PANEL (after views):', panel[:2000])
            fails.append('error panel after views')
        await b.close()
    httpd.shutdown()
    print('\nOK' if not fails else '\nFAILED: ' + ', '.join(fails))
    return 1 if fails else 0


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
    sys.exit(asyncio.run(run(ap.parse_args())))
