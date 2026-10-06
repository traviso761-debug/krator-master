#!/usr/bin/env python3
"""Bake Mav's Refuge's interiors: every unit's furniture, from the built page, into interiors-bake.json.

The page plans and furnishes its rooms itself (src/57a-interiors.js), but furnishing every unit takes tens of seconds,
so it does it near the camera first and the rest in idle frames. The bake is the same records computed once,
headless, and committed: build.py inlines it (generated fragment 57b-interiors-bake.js), and the page then has every
unit's pieces, and every lamp and hearth in its night light volume, from the first frame. README: "Furniture that is
not always drawn is data first".

Run it after anything that changes a plan: the builders' shells or windows (55-arch, 56-levels), 57a-interiors.js,
or the catalog / interiors kit (build.py says the bake is stale when the kit hash moved; the page counts the units
whose own fingerprint moved in _interiors.stale). Then rebuild.

Usage:  python3 build.py && python3 bake_interiors.py && python3 build.py
"""
import asyncio, http.server, json, os, socketserver, sys, threading
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import verify as V          # the harness: launch_chromium, local_three, LOAD_MS

PAGE = os.path.join(HERE, 'mavs-refuge.html')
OUT = os.path.join(HERE, 'interiors-bake.json')


async def bake():
    from playwright.async_api import async_playwright
    handler = lambda *x, **k: http.server.SimpleHTTPRequestHandler(*x, directory=HERE, **k)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        b = await V.launch_chromium(p)
        pg = await b.new_page(viewport={"width": 640, "height": 400})
        pg.set_default_timeout(V.LOAD_MS)
        three = V.local_three(HERE)
        if os.path.exists(three):
            await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(
                route.fulfill(path=three, content_type="application/javascript")))
        await pg.goto(f"http://127.0.0.1:{port}/mavs-refuge.html", timeout=V.LOAD_MS)
        await pg.wait_for_function("window._ready===true || (document.getElementById('errs')&&document.getElementById('errs').textContent.length>0)",
                                   timeout=V.LOAD_MS)
        errs = await pg.evaluate("document.getElementById('errs')?document.getElementById('errs').textContent:''")
        if errs:
            print('the page reports errors; not baking:\n' + errs[:2000])
            await b.close()
            return 1
        await pg.evaluate("()=>{ window.MIX.fillOn = false; }")      # the bake computes everything itself
        data = await pg.evaluate("()=>window.MIX.bakeAll()")
        await b.close()
    if not data or not data.get('kit'):
        print('no bake returned (interiors off?)')
        return 1
    units = data.pop('units')
    lines = ['{', '"what":%s,' % json.dumps(data['what']), '"kit":%s,' % json.dumps(data['kit']), '"n":%d,' % data['n'],
             '"keys":%s,' % json.dumps(data['keys'], separators=(',', ':')), '"units":{']
    keys = sorted(units, key=int)
    for i, k in enumerate(keys):
        lines.append('%s:%s%s' % (json.dumps(k), json.dumps(units[k], separators=(',', ':')), ',' if i < len(keys) - 1 else ''))
    lines += ['}', '}']
    with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(lines) + '\n')
    pieces = sum(len(u['p']) for u in units.values())
    print('wrote %s: %d units, %d pieces, %d piece keys, kit %s, %.0f KB (computed in %d ms)'
          % (os.path.basename(OUT), len(units), pieces, len(data['keys']), data['kit'], os.path.getsize(OUT) / 1024, data['ms']))
    print('now rebuild: python3 build.py')
    return 0


if __name__ == '__main__':
    sys.exit(asyncio.run(bake()))
