#!/usr/bin/env python3
"""Headless shots and audit for the Voth building catalog.

Usage:
  python3 shoot.py KEY [KEY ...]          2x2 sheet per variant -> shots/KEY-vN.png
  python3 shoot.py --src housing          every entry from registry/voth-housing.js
  python3 shoot.py --all                  every entry in the catalog
  python3 shoot.py KEY --lod              also an L0|L1|L2 strip -> shots/KEY-vN-lod.png
  python3 shoot.py KEY --v 2              one variant only
  python3 shoot.py --audit [--src S]      declared vs measured size, tris per LOD
                                          level, build errors; exit 1 on any error

A sheet's header line carries the measured size and any build error. Console
errors from the page are printed; a registry file that fails to parse shows
up here as a SyntaxError and its entries simply go missing from the audit.
"""
import argparse, asyncio, base64, functools, http.server, json, os, socketserver, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)          # voth/ — the page loads ../three.min.js etc.


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    handler = functools.partial(Quiet, directory=ROOT)
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd.server_address[1]


async def main(a):
    from playwright.async_api import async_playwright
    port = serve()
    out = os.path.join(HERE, a.out)
    os.makedirs(out, exist_ok=True)
    errors = []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"])
        page = await b.new_page(viewport={'width': 800, 'height': 560})
        page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
        page.on('pageerror', lambda e: errors.append('PAGEERROR ' + str(e)))
        q = 'shot=1&lod=auto'
        if a.src: q += '&src=' + a.src
        await page.goto(f'http://127.0.0.1:{port}/catalog/index.html?{q}')
        await page.wait_for_function('window._catalogReady === true', timeout=120000)

        if a.audit:
            rows = await page.evaluate('() => window._auditAll()')
            bad = 0
            for r in rows:
                flag = ''
                if r['err']: flag = 'ERROR ' + r['err']; bad += 1
                elif r['empty']: flag = 'EMPTY'; bad += 1
                else:
                    dw = [m / d if d else 0 for m, d in zip(r['meas'], r['decl'])]
                    if any(x > 1.15 or x < 0.6 for x in dw): flag = 'SIZE'
                print(f"{r['key']:<34} v{r['v']} {r['fam']:<10} decl {r['decl']} meas {r['meas']} tris {r['tris']} {r['ms']}ms {flag}")
            print(f'{len(rows)} builds, {bad} broken')
            for e in errors: print('CONSOLE', e)
            await b.close()
            return 1 if bad or any('PAGEERROR' in e or 'SyntaxError' in e for e in errors) else 0

        keys = a.keys
        if a.all or (a.src and not keys):
            keys = await page.evaluate("(s) => ASSETS.filter(A => !s || (A.source||'').indexOf(s) >= 0).map(A => A.key)", a.src or '')
        for k in keys:
            n = await page.evaluate('(k) => ASSET_BY_KEY[k] ? ASSET_BY_KEY[k].variants : 0', k)
            if not n:
                print('no such key', k); continue
            vs = [a.v] if a.v is not None else range(n)
            for v in vs:
                url = await page.evaluate('([k, v]) => window._shotQuad(k, v)', [k, v])
                fn = os.path.join(out, f'{k}-v{v}.png')
                open(fn, 'wb').write(base64.b64decode(url.split(',')[1]))
                print('wrote', os.path.relpath(fn, HERE))
                if a.lod:
                    url = await page.evaluate('([k, v]) => window._shotLOD(k, v)', [k, v])
                    if url:
                        fn = os.path.join(out, f'{k}-v{v}-lod.png')
                        open(fn, 'wb').write(base64.b64decode(url.split(',')[1]))
                        print('wrote', os.path.relpath(fn, HERE))
        for e in errors: print('CONSOLE', e)
        await b.close()
    return 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('keys', nargs='*')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--src')
    ap.add_argument('--v', type=int)
    ap.add_argument('--lod', action='store_true')
    ap.add_argument('--audit', action='store_true')
    ap.add_argument('--out', default='shots')
    sys.exit(asyncio.run(main(ap.parse_args())))
