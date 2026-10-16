#!/usr/bin/env python3
"""Headless check for Dhelv (settlements/dhelv).

  python3 verify.py dist/dhelv.html [--views "The square|The west mouth"] [--all-views] [--cut] [--night]
                                    [--cam cx,cy,cz,tx,ty,tz] [--assert] [--eval "()=>..."] [--out shots] [--size 1280x800]
                                    [--export ../../godot/data/dhelv]   (the Godot export: 92-dhelv-export.js's parts)

As the kit's verify.py: serves dist/, routes three.min.js to a local r128, loads in headless Chromium (SwiftShader), waits
for window._ready and the textures, prints the error panel and the build counters, runs the invariants with --assert
(91-dhelv-probe.js: the layout placed, the cavern built, no void open to the sky but at its openings, the ways walked from
the outpost's gate to every district; each with its negative), and screenshots each view, the rock round it meshed first
(the page meshes its chunks near the camera only).
"""
import argparse, asyncio, glob, http.server, json, os, re, socketserver, sys, threading

# --------------------------------------------------------------------------
# Harness helpers: the shared copy is tools/harness.py (launching Chromium, the local three.js, --views parsing,
# the UTF-8 console). A fix there reaches every verify.py that imports it.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness as _harness
from harness import GL_ARGS, LOAD_MS, CHROME_ENV, launch_chromium, parse_views
local_three = lambda folder: _harness.local_three(folder, os.path.dirname(os.path.abspath(__file__)))
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass
ASSERT_JS = r"""()=>{const A=window._api;const R=[];const F=A.footprints();
 // footprint: the measured box against the declared w x d x h (guy ropes and stakes are counted in the declaration; 1.6 m slack)
 const over=F.filter(f=>f.ex>1.6||f.ez>1.6);R.push({name:'inside-declared-footprint',ok:!over.length,detail:over.length?over.map(f=>`${f.key} ${f.bw}x${f.bd} vs ${f.w}x${f.d}`).join(' | '):F.length+' sites within their footprint + 0.8 m'});
 const hh=F.filter(f=>f.eh>1.5);R.push({name:'inside-declared-height',ok:!hh.length,detail:hh.length?hh.map(f=>`${f.key} h ${f.bh} vs ${f.h}`).join(' | '):'ok'});
 R.push({name:'no-nan',ok:A.nanSweep()===0,detail:'nan meshes: '+A.nanSweep()});
 const bad=Object.keys(A.DEFS).filter(k=>A.DEFS[k].cls==='building'&&!(A.DEFS[k].tags.types||[]).length);R.push({name:'buildings-typed',ok:!bad.length,detail:bad.length?bad.join(', '):'every building has a culture and types'});
 const T=A.tags().audit;R.push({name:'tags-vocabulary',ok:T.unknown===0&&T.missingCulture===0&&T.missingTypes===0,detail:T.records+' records ('+Object.entries(T.byClass).map(e=>e.join(' ')).join(', ')+'), unknown '+T.unknown+(T.unknown?' '+JSON.stringify(T.unknownValues)+JSON.stringify(T.unknownKeys):'')});
 const heavy=F.filter(f=>f.tris>(f.budget||120000));R.push({name:'triangle-budget',ok:!heavy.length,detail:heavy.length?heavy.map(f=>f.key+' '+f.tris+' > '+f.budget).join(' | '):'heaviest '+Math.max(...F.map(f=>f.tris))});
 const nf=A.doors().filter(d=>!d.front||![d.front.local.x,d.front.local.z,d.front.local.yaw].every(isFinite)||d.front.source==='default');R.push({name:'front-door',ok:!nf.length,detail:nf.length?nf.map(d=>d.key+' ('+(d.front&&d.front.source)+')').join(', '):A.doors().length+' sites carry a front from a door() or a declared front'});
 const fu=A.furniture();const miss=Object.keys(fu.missing);R.push({name:'furniture-keys',ok:!miss.length,detail:miss.length?'missing from the catalog: '+miss.map(k=>k+' x'+fu.missing[k]).join(', '):fu.placed+' pieces from '+fu.keys+' catalog keys, '+fu.tris+' triangles'});
 const M=A.materials();R.push({name:'material-records',ok:!!(M&&M.records&&M.records.length>15),detail:M?M.records.length+' records, '+M.records.filter(r=>r.lib).length+' from the library':'none'});
 /* Dhelv's own invariants (91-dhelv-probe.js), and their negatives: each must FAIL its broken input */
 for(const c of window.hostChecks())R.push({name:c.name,ok:c.ok,detail:c.detail});
 for(const n of window.hostNegatives())R.push({name:'negative '+n.name,ok:n.failed,detail:(n.failed?'fails as it must: ':'PASSED, the check is blind: ')+n.detail});
 return R;}"""
async def run(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html)); os.makedirs(a.out, exist_ok=True)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), lambda *x, **k: http.server.SimpleHTTPRequestHandler(*x, directory=folder, **k)); port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); bad = False
    async with async_playwright() as p:
        b = await launch_chromium(p)
        W, H = [int(t) for t in a.size.split("x")]; pg = await b.new_page(viewport={"width": W, "height": H}); pg.set_default_timeout(600000)
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
        three = local_three(folder)
        await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(route.fulfill(path=three, content_type="application/javascript")))
        q = ['t=4']
        if a.only: q.append('only=' + a.only)
        await pg.goto(f"http://127.0.0.1:{port}/{name}?" + '&'.join(q), timeout=LOAD_MS)
        try: await pg.wait_for_function("window._ready===true||(document.getElementById('errs')&&document.getElementById('errs').style.display==='block')", timeout=LOAD_MS)
        except Exception as e: print('never ready', e)
        try: await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception: print('textures still decoding after 120 s')
        await pg.wait_for_timeout(800)
        e = await pg.evaluate("document.getElementById('errs').textContent")
        print('ERROR PANEL:', e.strip() or '(clean)'); print('build:', json.dumps(await pg.evaluate("window._build||null")))
        if e.strip() or errs: bad = True
        for x in errs[:8]: print('pageerror:', x)
        if a.assert_:
            # the page's files each under the gallery's 16 MB a file (PLAN.md P8); the negative: the same files against 1 MB
            side = [os.path.join(folder, f) for f in os.listdir(folder) if f.startswith(os.path.splitext(name)[0] + '.tex') and f.endswith('.js')]
            sizes = [(os.path.basename(f), os.path.getsize(f)) for f in [os.path.join(folder, name)] + side]
            det = ', '.join('%s %.1f MB' % (f, n / 1e6) for f, n in sizes)
            big = [f for f, n in sizes if n > 16e6]; print(('PASS ' if not big else 'FAIL ') + 'page-size - ' + det); bad |= bool(big)
            neg = [f for f, n in sizes if n > 1e6]; print(('PASS ' if neg else 'FAIL ') + 'negative page-size: a 1 MB limit - ' + ('fails as it must: ' if neg else 'PASSED, the check is blind: ') + ', '.join(neg)); bad |= not neg
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:700]); bad |= not r['ok']
        if a.cut: await pg.evaluate("cutSet(true)")
        if a.night: await pg.evaluate("nightSet(true)")
        if a.eval: print(json.dumps(await pg.evaluate(a.eval), indent=1)[:6000])
        if a.export:   # the Godot export (92-dhelv-export.js): one JSON a part, and the meta every godot/data case carries
            import datetime
            os.makedirs(a.export, exist_ok=True)
            for k in await pg.evaluate("()=>window._api.exportParts()"):
                data = await pg.evaluate("k=>JSON.stringify(window._api.export(k))", k)
                with open(os.path.join(a.export, k + '.json'), 'w', encoding='utf-8') as fh:
                    fh.write(data)
                print("export %-10s %8d KB" % (k, len(data) // 1024))
            files = {f: os.path.getsize(os.path.join(a.export, f)) for f in sorted(os.listdir(a.export)) if f.endswith('.json') and f != 'meta.json'}
            with open(os.path.join(a.export, 'meta.json'), 'w', encoding='utf-8') as fh:
                json.dump({"case": "dhelv", "page": "settlements/dhelv/dist/dhelv.html", "kind": "data", "query": "t=4",
                           "files": files, "page_errors": errs[:20], "exported": datetime.date.today().isoformat()}, fh)
        if a.cam:
            v = [float(t) for t in a.cam.split(',')]; await pg.evaluate("v=>{setView(...v);window._api.meshAround(v[0],v[1],v[2]);}", v); await pg.wait_for_timeout(900); await pg.screenshot(path=os.path.join(a.out, 'cam.png')); print('shot cam.png')
        views = parse_views(a.views, await pg.evaluate("Object.keys(VIEWS)"))
        if a.all_views: views = await pg.evaluate("Object.keys(VIEWS)")
        for i, vn in enumerate(views):
            ok = await pg.evaluate("n=>{if(!VIEWS[n])return false;const v=VIEWS[n];setView(...v);window._api.meshAround(v[0],v[1],v[2]);window._api.meshAround(v[3],v[4],v[5]);return true;}", vn)
            if not ok: print('no view', vn); continue
            await pg.wait_for_timeout(900); fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png'); await pg.screenshot(path=fn); print('shot', fn)
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e: print('ERROR PANEL after views:', e2); bad = True
        await b.close()
    sys.exit(1 if bad else 0)
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--views'); ap.add_argument('--all-views', action='store_true'); ap.add_argument('--only')
    ap.add_argument('--cut', action='store_true'); ap.add_argument('--night', action='store_true')
    ap.add_argument('--cam'); ap.add_argument('--eval'); ap.add_argument('--export', default=''); ap.add_argument('--assert', dest='assert_', action='store_true'); ap.add_argument('--out', default='shots'); ap.add_argument('--size', default='1280x800')
    asyncio.run(run(ap.parse_args()))
