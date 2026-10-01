#!/usr/bin/env python3
"""Headless verification for kits/interiors (dist/interiors.html).

Usage:
  python3 verify.py dist/interiors.html [--assert] [--seeds 3] [--out ./shots] [--rooms] [--eval "()=>..."]

What it does:
  1. Serves kits/ over HTTP (the page loads ../../catalog/*.js by path) and routes
     three.min.js to the catalog's local r128 copy: no CDN.
  2. Loads the demo in headless Chromium with software WebGL (SwiftShader).
  3. Prints the error panel (#errs) and page errors; either fails the run.
  4. --assert, for every demo room, at seed 0 and seeds 1..--seeds-1 (window._interiors.audit):
       inside           every footprint inside the room polygon (declared) and every built
                        piece's measured box inside it (measured-inside, tol max(6 cm, 4 %))
       height           y >= floor, y + h <= ceiling; measured too (measured-height)
       overlap          no two footprints overlap on one layer (surface pieces sit on a host)
       door             no footprint in a door's swing zone
       clearance        no footprint in another piece's declared clearance (seat at its table excepted)
       reach            on the occupancy grid every door reaches every door and every usable piece
       required         every required piece of the room kind placed, or reported none-in-catalog
       determinism      furnishing again gives identical placements; and the whole sheet
                        re-furnished at seed 0 after other seeds hashes the same
       builds           every piece built, has a mesh, no NaN
     plus tests/core_test.js in node on dist/interiors-core.js with a fake catalog (surface,
     ceiling and wall pieces, a rotated L-shaped room, an empty culture, 12 seeds), and coverage:
     at least 20 rooms, the kinds hall bedroom kitchen tavern workshop store
     shrine, at least 5 cultures, at least one rectangular and one non-rectangular room.
  5. --out: screenshots: overview, overview with outlines, a close-up per row (--rooms: every
     room), one with the walk grid and paths, one per cut-away mode.

Exit code is non-zero if the error panel is dirty, the page threw, or an assertion fails.
Requires: pip install playwright (Chromium at /opt/pw-browsers/chromium or PW_CHROMIUM).
"""
import argparse, asyncio, hashlib, http.server, json, os, socketserver, sys, threading

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
KITS = os.path.dirname(HERE)
THREE = os.path.join(KITS, 'catalog', 'three.min.js')
KINDS = ['hall', 'bedroom', 'kitchen', 'tavern', 'workshop', 'store', 'shrine']


def _exe():
    for c in (os.environ.get('PW_CHROMIUM'), '/opt/pw-browsers/chromium'):
        if c and os.path.exists(c):
            return {'executable_path': c}
    return {}


SNAP_JS = "()=>JSON.stringify(window._interiors.plans.map(p=>KratorInteriors.exportPlan(p)))"


async def run(a):
    from playwright.async_api import async_playwright
    path = os.path.abspath(a.html)
    rel = os.path.relpath(path, KITS).replace(os.sep, '/')
    if a.out:
        os.makedirs(a.out, exist_ok=True)

    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x):
            pass
    handler = lambda *x, **k: Quiet(*x, directory=KITS, **k)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(('127.0.0.1', 0), handler)
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    fails = []
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(**_exe(), args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
            W, H = [int(t) for t in a.size.split('x')]
            pg = await b.new_page(viewport={'width': W, 'height': H})
            pg.set_default_timeout(600000)
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.route('**/three.min.js', lambda route: asyncio.ensure_future(
                route.fulfill(path=THREE, content_type='application/javascript')))
            await pg.goto('http://127.0.0.1:%d/%s' % (port, rel), timeout=300000)
            try:
                await pg.wait_for_function("window._ready===true || document.getElementById('errs').textContent.length>0",
                                           timeout=300000)
            except Exception:
                print('timed out waiting for the demo to build'); fails.append('build timeout')
            await pg.wait_for_timeout(1000)
            panel = await pg.evaluate("document.getElementById('errs').textContent")
            print('ERROR PANEL:', repr(panel[:1500]) if panel else 'clean')
            if panel:
                fails.append('error panel not clean')
            if errs:
                print('PAGE ERRORS:', errs[:5]); fails.append('page errors')
            info = await pg.evaluate("()=>({ready:!!window._ready,calls:renderer.info.render.calls,tris:renderer.info.render.triangles,"
                                     "rooms:window._interiors?window._interiors.rooms.length:0})")
            print('ready:', info['ready'], ' rooms:', info['rooms'], ' draw calls:', info['calls'], ' triangles:', info['tris'])

            for ev in (a.eval or []):
                print('eval:', json.dumps(await pg.evaluate(ev))[:4000])

            if a.assert_:
                import subprocess
                core = os.path.join(os.path.dirname(path), 'interiors-core.js')
                r = subprocess.run(['node', os.path.join(HERE, 'tests', 'core_test.js'), core], capture_output=True, text=True)
                print('\ncore test (node, fake catalog: surface, ceiling, wall pieces, rotated L room, fallback):',
                      'ok' if r.returncode == 0 else 'FAIL')
                print('  ' + (r.stdout + r.stderr).strip()[:1500])
                if r.returncode:
                    fails.append('core test')
            if a.assert_ and info['ready']:
                snap0 = await pg.evaluate(SNAP_JS)
                h0 = hashlib.sha1(snap0.encode()).hexdigest()[:12]
                cov = await pg.evaluate("""()=>{const R=window._interiors.rooms;return {n:R.length,
                    kinds:[...new Set(R.map(r=>r.kind))], cultures:[...new Set(R.map(r=>r.culture))],
                    rect:R.filter(r=>r.poly.length===4).length, irregular:R.filter(r=>r.poly.length!==4).length,
                    rotated:R.filter(r=>r.walls.some(w=>Math.abs(w.t[0])>1e-3&&Math.abs(w.t[1])>1e-3)).length}}""")
                print('\ncoverage: %d rooms, kinds %s, cultures %s, %d rectangular, %d other, %d with slanted walls'
                      % (cov['n'], ' '.join(cov['kinds']), ' '.join(cov['cultures']), cov['rect'], cov['irregular'], cov['rotated']))
                if cov['n'] < 20: fails.append('coverage: fewer than 20 rooms')
                for k in KINDS:
                    if k not in cov['kinds']: fails.append('coverage: no %s room' % k)
                if len(cov['cultures']) < 5: fails.append('coverage: fewer than 5 cultures')
                if not cov['rect'] or not cov['irregular']: fails.append('coverage: need rectangular and irregular rooms')
                tot_fail = 0
                for s in range(a.seeds):
                    if s:
                        await pg.evaluate("(s)=>window._interiors.reseed(s)", s)
                    res = await pg.evaluate("()=>window._interiors.audit()")
                    print('\n--- seed %d: %d rooms, %d pieces placed, %d usable pieces, %d reached from every door, %d culture fallbacks ---'
                          % (s, res['rooms'], res['pieces'], res['usable'], res['reached'], res['fallbacks']))
                    if s == 0 or a.verbose:
                        print('  %-30s %-6s %-6s %-34s %s' % ('room', 'pieces', 'reach', 'required', 'fallbacks / missing'))
                        for r in res['perRoom']:
                            extra = '; '.join(x for x in (r['fallbacks'], r['missing'], 'thin culture' if r['thin'] else '') if x)
                            print('  %-30s %-6d %-6s %-34s %s%s' % (r['id'], r['pieces'], '%d/%d' % (r['reached'], r['usable']),
                                                                   r['required'], extra, '  FAIL x%d' % r['fails'] if r['fails'] else ''))
                    by = {}
                    for f in res['fails']:
                        by.setdefault(f['check'], []).append(f['msg'])
                    for c in ['inside', 'measured-inside', 'height', 'measured-height', 'overlap', 'door', 'clearance', 'reach',
                              'required', 'determinism', 'builds']:
                        n = len(by.get(c, []))
                        print('  %-16s %s' % (c, 'ok' if not n else 'FAIL x%d' % n))
                        for m in by.get(c, [])[:6]:
                            print('      ' + m)
                    tot_fail += len(res['fails'])
                if tot_fail:
                    fails.append('%d assertion failures' % tot_fail)
                if a.seeds > 1:
                    await pg.evaluate("()=>window._interiors.reseed(0)")
                snap1 = await pg.evaluate(SNAP_JS)
                h1 = hashlib.sha1(snap1.encode()).hexdigest()[:12]
                print('\nsheet determinism: seed 0 placements %s, again after reseeding %s -> %s' % (h0, h1, 'same' if h0 == h1 else 'DIFFERENT'))
                if h0 != h1:
                    fails.append('sheet not deterministic')
                panel = await pg.evaluate("document.getElementById('errs').textContent")
                if panel:
                    print('ERROR PANEL after audit:', repr(panel[:1500])); fails.append('error panel not clean after audit')

            if a.out and info['ready']:
                async def shot(name):
                    await pg.wait_for_timeout(400)
                    fn = os.path.join(a.out, name + '.png'); await pg.screenshot(path=fn); print('shot:', fn)
                await pg.evaluate("()=>{window._interiors.cutaway('cut');window._interiors.setOutline(false,false);window._interiors.overview();}")
                await shot('overview')
                await pg.evaluate("()=>window._interiors.setOutline(true,false)")
                await shot('overview_outline')
                await pg.evaluate("()=>window._interiors.setOutline(false,false)")
                n = await pg.evaluate("()=>window._interiors.rooms.length")
                pick = list(range(n)) if a.rooms else await pg.evaluate(
                    "()=>{const s=new Set(),o=[];window._interiors.rooms.forEach((r,i)=>{const k=r.kind+(r.id.startsWith('house')?'h':'');if(!s.has(k)){s.add(k);o.push(i);}});return o;}")
                for i in pick:
                    rid = await pg.evaluate("(i)=>{window._interiors.gotoRoom(i);return window._interiors.rooms[i].id;}", i)
                    await shot('room_%02d_%s' % (i, rid.replace('.', '_')))
                await pg.evaluate("()=>{window._interiors.gotoRoom(window._interiors.rooms.findIndex(r=>r.id==='tavern.beast-rider'));window._interiors.setOutline(true,true);}")
                await shot('grid_tavern')
                await pg.evaluate("()=>{window._interiors.setOutline(false,false);window._interiors.gotoRoom(window._interiors.rooms.findIndex(r=>r.id==='house.hall'));}")
                for m in ('cut', 'fade', 'roof', 'off'):
                    await pg.evaluate("(m)=>window._interiors.cutaway(m)", m)
                    await shot('cutaway_%s' % m)
                await pg.evaluate("()=>window._interiors.cutaway('cut')")
        httpd.shutdown()
    finally:
        pass
    if fails:
        print('\nFAILED: ' + '; '.join(fails))
        return 1
    print('\nOK')
    return 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--seeds', type=int, default=3, help='with --assert: audit seeds 0..N-1 (default 3)')
    ap.add_argument('--verbose', action='store_true', help='with --assert: print the per-room table for every seed')
    ap.add_argument('--out', default='')
    ap.add_argument('--rooms', action='store_true', help='with --out: a close-up of every room, not one per kind')
    ap.add_argument('--eval', action='append')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
