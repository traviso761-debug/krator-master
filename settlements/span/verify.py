#!/usr/bin/env python3
"""Headless check for Span's page (PLAN.md SP3).

  python3 verify.py dist/span.html [--assert] [--views "The Cross from the bay|..."] [--all-views] [--cam cx,cy,cz,tx,ty,tz]
                                   [--eval "()=>..."] [--out shots] [--size 1280x800]

Serves dist/ over HTTP (the page's texture sidecar beside it), routes three.min.js to the local r128 (tools/harness.py),
loads in headless Chromium, waits for window._ready and the library textures, prints the error panel; with --assert runs
the page's checks (99-host-take.js: the layout's rules, every part placed, the tags) and their negatives, the probe's NaN
sweep and the inspector volumes, and fails on any; then screenshots the views.
SwiftShader flakes ~1 run in 7 with a null shader-info-log TypeError: re-run before believing it.
"""
import argparse, asyncio, http.server, json, os, socketserver, sys, threading

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness as _harness
from harness import LOAD_MS, launch_chromium, parse_views, verify_page, Abort
local_three = lambda folder: _harness.local_three(folder, os.path.dirname(os.path.abspath(__file__)))
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass

ASSERT_JS = r"""()=>{const A=window._api,R=[];
 for(const c of A.hostChecks())R.push(c);
 for(const n of A.hostNegatives())R.push({name:'negative: '+n.name,ok:n.ok,detail:n.ok?'fails as it should':'did not fail'});
 const nan=A.nanSweep();R.push({name:'no NaN geometry',ok:Array.isArray(nan)?nan.length===0:typeof nan==='object'?!(nan.meshes||nan.instances):nan===0,detail:JSON.stringify(nan).slice(0,300)});
 const occ=A.regOccupancy(),empty=occ.filter(o=>!o.n);R.push({name:'every inspector volume holds something drawn',ok:!empty.length,detail:occ.length+' volumes'+(empty.length?'; empty: '+empty.slice(0,8).map(o=>o.name).join(', '):'')});
 return R;}"""


async def run(a):
    os.makedirs(a.out, exist_ok=True); bad = False
    async with verify_page(a.html, here=os.path.dirname(os.path.abspath(__file__)), size=a.size, query="?chrome=1", settle_ms=0) as V:
        pg, errs = V.page, V.errs
        if not V.ready: print('never ready')
        # console errors fail the run, but for core/host's optional marks.json (absent here: a 404). The harness has watched
        # the console since before the load (pg.krator_console, text only: a 404 there cannot be told apart by URL, so
        # every resource 404 logged during the load is let through; textures are covered by the universal asserts); listen on.
        cerrs = ['console: ' + t for k, t in pg.krator_console if k == 'error' and not t.startswith('Failed to load resource')]
        pg.on("console", lambda m: cerrs.append('console: ' + m.text) if m.type == 'error' and not (m.location or {}).get('url', '').endswith('/marks.json') else None)
        try: await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception: print('textures still decoding after 120 s')
        await pg.wait_for_timeout(800)
        e = await pg.evaluate("document.getElementById('errs').textContent")
        print('ERROR PANEL:', e.strip() or '(clean)')
        print('span:', json.dumps(await pg.evaluate("window._api&&window._api.span?window._api.span():null")))
        if e.strip() or errs or cerrs: bad = True
        for x in (errs + cerrs)[:8]: print('pageerror:', x)
        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + (' - ' + str(r.get('detail', ''))[:600] if r.get('detail') else '')); bad |= not r['ok']
        if a.eval: print(json.dumps(await pg.evaluate(a.eval), indent=1)[:6000])
        if a.cam:
            v = [float(t) for t in a.cam.split(',')]; await pg.evaluate("v=>window._api.setView(...v)", v); await pg.wait_for_timeout(900)
            await V.shot(os.path.join(a.out, 'cam.png')); print('shot cam.png')
        names = await pg.evaluate("window._api.views()")
        views = names if a.all_views else parse_views(a.views or '', names)
        for i, vn in enumerate(views):
            await pg.evaluate("n=>window._api.go(n)", vn); await pg.wait_for_timeout(1200)
            fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png'); await V.shot(fn, view=vn); print('shot', fn)
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() != e.strip(): print('ERROR PANEL after views:', e2); bad = True
        if bad: V.fails.append('span checks')
    sys.exit(V.exit())


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--views'); ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--cam'); ap.add_argument('--eval'); ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out', default='shots'); ap.add_argument('--size', default='1280x800')
    asyncio.run(run(ap.parse_args()))
