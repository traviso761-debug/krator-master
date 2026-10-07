#!/usr/bin/env python3
"""Headless verification for kits/ancients-interiors (dist/ancients-interiors.html).

Usage:
  python3 verify.py dist/ancients-interiors.html [--assert] [--out ./shots] [--all] [--size 1280x800]

  1. Serves kits/ over HTTP (the page loads ../../catalog/*.js by path), routes three.min.js to the local r128 copy,
     and loads the sheet in headless Chromium with software WebGL.
  2. Prints the error panel (#errs) and page errors; either fails the run.
  3. --assert:
       core-node        the core in node on kits/interiors' core: install() adds the seven ship programmes once
       halls            every recipe in both dresses builds pieces, and its audit (AI.audit) passes: every key in the
                        catalog, every piece inside the room, no two solid pieces in one place, the door clear, the
                        reserved floor clear, the recipe's minimum counts, no dress role without a piece
       halls-drawn      every placement the recipe made was built by the catalog
       ship-rooms       every ship's room is furnished by the placer with its programme met (no required need missing)
                        and passes kits/interiors' audit (inside, overlap, doors, clearance, reach)
       cabins           every cabin furnished and audited the same way
  4. --out: screenshots: the overview, then one hall per recipe in the 'ancient' dress, the occupied mess, one
     ship's room and one cabin (--all: every hall in both dresses and every room).

Exit code is non-zero if the error panel is dirty, the page threw, or an assertion fails.
Requires: pip install playwright (Chromium at /opt/pw-browsers/chromium or PW_CHROMIUM).
"""
import argparse, asyncio, http.server, json, os, socketserver, subprocess, sys, threading

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
KITS = os.path.dirname(HERE)
THREE = os.path.join(KITS, 'catalog', 'three.min.js')


def _exe():
    for c in (os.environ.get('PW_CHROMIUM'), '/opt/pw-browsers/chromium'):
        if c and os.path.exists(c):
            return {'executable_path': c}
    return {}


SNAP = """()=>{const A=window._ancientsInteriors;return {
  halls:A.halls.map(h=>({name:h.name,dress:h.dress,n:h.res.placements.length,drawn:h.objects,ok:h.audit.ok,fails:h.audit.fails.slice(0,6),skipped:h.res.skipped.length})),
  rooms:A.rooms.map(r=>({id:r.id,kind:r.kind,n:r.plan.placements.length,ok:r.audit.ok,fails:(r.audit.fails||[]).slice(0,4).map(f=>f.msg||String(f)),
    missing:(r.plan.report&&r.plan.report.missing||[]).filter(m=>m.reason).map(m=>m.need)}))}}"""


def core_node():
    ixc = os.path.join(KITS, 'interiors', 'dist', 'interiors-core.js')
    aic = os.path.join(HERE, 'dist', 'ancients-interiors-core.js')
    js = ('global.KratorInteriors=require(process.argv[1]);const IX=KratorInteriors,AI=require(process.argv[2]);'
          'const before=Object.keys(IX.PROGRAMS).length;AI.install(IX);AI.install(IX);'
          'const add=Object.keys(IX.PROGRAMS).length-before;const miss=AI.SHIP_KINDS.filter(k=>!IX.PROGRAMS[k]||!IX.KIND_ALIAS[k]);'
          'console.log("programmes added "+add+", missing "+miss.length);process.exit(add===AI.SHIP_KINDS.length&&!miss.length?0:1);')
    r = subprocess.run(['node', '-e', js, ixc, aic], capture_output=True, text=True)
    return r.returncode == 0, (r.stdout + r.stderr).strip()


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
                await pg.wait_for_function("window._ready===true || document.getElementById('errs').textContent.length>0", timeout=300000)
            except Exception:
                print('timed out waiting for the sheet to build'); fails.append('build timeout')
            await pg.wait_for_timeout(1000)
            panel = await pg.evaluate("document.getElementById('errs').textContent")
            print('ERROR PANEL:', repr(panel[:1500]) if panel else 'clean')
            if panel:
                fails.append('error panel not clean')
            if errs:
                print('PAGE ERRORS:', errs[:5]); fails.append('page errors')
            info = await pg.evaluate("()=>({ready:!!window._ready,calls:renderer.info.render.calls,tris:renderer.info.render.triangles})")
            print('ready:', info['ready'], ' draw calls:', info['calls'], ' triangles:', info['tris'])

            if a.assert_ and info['ready']:
                ok, msg = core_node()
                print('\n%s core-node : %s' % ('PASS' if ok else 'FAIL', msg))
                if not ok:
                    fails.append('core-node')
                S = await pg.evaluate(SNAP)
                print('\n  %-9s %-14s %6s %6s %8s  %s' % ('dress', 'hall', 'pieces', 'drawn', 'skipped', 'audit'))
                bad = drawn = 0
                for h in S['halls']:
                    good = h['ok'] and h['n'] > 0
                    bad += not good
                    drawn += h['drawn'] != h['n']
                    print('  %-9s %-14s %6d %6d %8d  %s' % (h['dress'], h['name'], h['n'], h['drawn'], h['skipped'], 'ok' if good else '; '.join(h['fails']) or 'empty'))
                print('%s halls : %d recipes x 2 dresses, %d fail' % ('FAIL' if bad else 'PASS', len(S['halls']) // 2, bad))
                print('%s halls-drawn : %d halls drew fewer pieces than placed' % ('FAIL' if drawn else 'PASS', drawn))
                if bad:
                    fails.append('halls')
                if drawn:
                    fails.append('halls-drawn')
                for label, pick in (('ship-rooms', lambda r: not r['id'].startswith('cabin.')), ('cabins', lambda r: r['id'].startswith('cabin.'))):
                    rs = [r for r in S['rooms'] if pick(r)]
                    badr = [r for r in rs if not r['ok'] or r['missing'] or not r['n']]
                    print('%s %s : %d rooms, %d pieces; %s' % ('FAIL' if badr else 'PASS', label, len(rs), sum(r['n'] for r in rs),
                          ', '.join('%s %d' % (r['id'].split('.')[-1] if label == 'ship-rooms' else r['id'][6:], r['n']) for r in rs)))
                    for r in badr:
                        print('    %s: %s %s' % (r['id'], '; '.join(r['fails']), ('missing ' + ', '.join(r['missing'])) if r['missing'] else ''))
                    if badr:
                        fails.append(label)
                panel = await pg.evaluate("document.getElementById('errs').textContent")
                if panel:
                    print('ERROR PANEL after the checks:', repr(panel[:1500])); fails.append('error panel not clean after the checks')

            if a.out and info['ready']:
                async def shot(name):
                    await pg.wait_for_timeout(500)
                    fn = os.path.join(a.out, name + '.png'); await pg.screenshot(path=fn); print('shot:', fn)
                await pg.evaluate("()=>window._ancientsInteriors.overview()")
                await shot('00_overview')
                halls = await pg.evaluate("()=>window._ancientsInteriors.halls.map(h=>h.dress+'_'+h.name)")
                for i, nm in enumerate(halls):
                    if a.all or nm.startswith('ancient_') or nm in ('occupied_crew-mess', 'occupied_plaza'):
                        await pg.evaluate("(i)=>window._ancientsInteriors.gotoHall(i)", i)
                        await shot('hall_%02d_%s' % (i, nm))
                rooms = await pg.evaluate("()=>window._ancientsInteriors.rooms.map(r=>r.id)")
                for i, rid in enumerate(rooms):
                    if a.all or rid in ('sickbay', 'cabin.bunkroom.4.8'):
                        await pg.evaluate("(i)=>window._ancientsInteriors.gotoRoom(i)", i)
                        await shot('room_%02d_%s' % (i, rid.replace('.', '_')))
            await b.close()
    finally:
        httpd.shutdown()
    print('\n' + ('FAILED: ' + ', '.join(fails) if fails else 'OK'))
    return 1 if fails else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))


if __name__ == '__main__':
    main()
