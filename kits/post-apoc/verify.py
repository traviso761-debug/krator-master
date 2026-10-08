#!/usr/bin/env python3
"""Headless check for the Post-Apoc set.

  python3 verify.py dist/post-apoc.html [--views "Opening,Small dwellings"] [--culture iziz] [--cam cx,cy,cz,tx,ty,tz]
                                        [--assert] [--eval "()=>..."] [--out shots] [--size 1280x800] [--only key1,key2]

Serves dist/ over HTTP, routes three.min.js from this folder (r128, offline), loads in headless Chromium (SwiftShader), waits for window._ready,
prints the on-screen error panel and the build counters, runs the invariants with --assert, and screenshots each view.
--only builds just those def keys (page param ?only=) so a fragment can be checked without loading the whole kit.
SwiftShader flakes ~1 run in 7 with a null shader-info-log TypeError: re-run before believing it.
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
 // footprint: declared w x d x h vs measured; overhang allowance 1.6 m each axis
 const over=F.filter(f=>f.ex>2.2||f.ez>2.2);R.push({name:'inside-declared-footprint',ok:!over.length,detail:over.length?over.map(f=>`${f.key} ${f.bw}x${f.bd} vs ${f.w}x${f.d}`).join(' | '):F.length+' buildings within footprint+1.1 m'});
 const hh=F.filter(f=>f.eh>4);R.push({name:'inside-declared-height',ok:!hh.length,detail:hh.length?hh.map(f=>`${f.key} h ${f.bh} vs ${f.h}`).join(' | '):'ok'});
 R.push({name:'no-nan',ok:A.nanSweep()===0,detail:'nan meshes: '+A.nanSweep()});
 const sc=A.socketCounts();const nos=Object.keys(A.DEFS).filter(k=>!sc[k]&&!A.DEFS[k].noSockets);R.push({name:'every-building-declares-sockets',ok:!nos.length,detail:nos.length?nos.join(', '):'all declare'});
 const miss=Object.keys(A.DEFS).filter(k=>!A.DEFS[k].tags||!A.DEFS[k].tags.type||!A.DEFS[k].tags.type.length);R.push({name:'tagged',ok:!miss.length,detail:miss.length?miss.join(', '):'all have type tags'});
 R.push({name:'kit-coverage',ok:A.kitCoverage().length===0,detail:A.kitCoverage().join(', ')||'every def placed'});
 const heavy=F.filter(f=>f.tris>(f.budget||A.DEFS[f.key].budget||120000));   /* f.budget: the declared budget for that placement (a size may raise it) */R.push({name:'triangle-budget',ok:!heavy.length,detail:heavy.length?heavy.map(f=>f.key+' '+f.tris).join(' | '):'heaviest '+Math.max(...F.map(f=>f.tris))});
 const nf=A.doors().filter(d=>!d.front||![d.front.local.x,d.front.local.z,d.front.local.yaw].every(isFinite));R.push({name:'front-door-designated',ok:!nf.length,detail:nf.length?nf.map(d=>d.key).join(', '):A.doors().length+' buildings carry a front door marker ('+A.doors().filter(d=>d.front.source==='default').length+' on the default)'});
 const dflt=A.doors().filter(d=>d.front&&d.front.source==='default');R.push({name:'front-door-not-default',ok:!dflt.length,detail:dflt.length?'on the default (+z edge centre): '+dflt.map(d=>d.key).join(', '):'every front comes from door()/entry() or a declared front'});
 // collision + nav (36-def.js): every building publishes solids; every front door's approach is reachable on the nav grid from the open ground at the border
 const cl=A.colliders().filter(c=>!c.solids);R.push({name:'colliders-published',ok:!cl.length,detail:cl.length?'no solids: '+cl.map(c=>c.key).join(', '):A.colliders().length+' buildings, '+A.colliders().reduce((a,c)=>a+c.solids,0)+' solids, '+A.colliders().reduce((a,c)=>a+c.floors,0)+' floors, '+A.colliders().reduce((a,c)=>a+c.ramps,0)+' ramps, '+A.colliders().reduce((a,c)=>a+c.links,0)+' ladders'});
 const nv=A.nav();R.push({name:'door-approach-reachable',ok:!nv.unreachable.length,detail:nv.unreachable.length?nv.unreachable.join(' | '):nv.doors+' front doors reachable from open ground ('+nv.nx+' x '+nv.nz+' cells of '+nv.cell+' m)'});
 // compounds: every requested slot key placed
 const cps=(window._compounds||[]).filter(c=>c.rejected.length);R.push({name:'compound-slots-filled',ok:!cps.length,detail:cps.length?cps.map(c=>c.size+': '+c.rejected.map(r=>r.key+' ('+r.reason+')').join(', ')).join(' | '):(window._compounds||[]).map(c=>c.size+' '+c.placed.length).join(', ')+' placed, none rejected'});
 return R;}"""
async def run(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html)); here = os.path.dirname(os.path.abspath(__file__)); os.makedirs(a.out, exist_ok=True)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), lambda *x, **k: http.server.SimpleHTTPRequestHandler(*x, directory=folder, **k)); port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start(); bad = False
    async with async_playwright() as p:
        b = await launch_chromium(p)
        W, H = [int(t) for t in a.size.split("x")]; pg = await b.new_page(viewport={"width": W, "height": H}); pg.set_default_timeout(600000)
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
        three = local_three(folder)
        await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(route.fulfill(path=three, content_type="application/javascript")))
        q = []
        if a.culture: q.append('culture=' + a.culture)
        if a.only: q.append('only=' + a.only)
        await pg.goto(f"http://127.0.0.1:{port}/{name}" + ('?' + '&'.join(q) if q else ''), timeout=LOAD_MS)
        try: await pg.wait_for_function("window._ready===true||(document.getElementById('errs')&&document.getElementById('errs').style.display==='block')", timeout=300000)
        except Exception as e: print('never ready', e)
        await pg.wait_for_timeout(800)
        e = await pg.evaluate("document.getElementById('errs').textContent")
        print('ERROR PANEL:', e.strip() or '(clean)'); print('build:', json.dumps(await pg.evaluate("window._build||null")))
        if e.strip() or errs: bad = True
        for x in errs[:8]: print('pageerror:', x)
        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:600]); bad |= not r['ok']
        if a.eval: print(json.dumps(await pg.evaluate(a.eval), indent=1)[:6000])
        if a.cam:
            v = [float(t) for t in a.cam.split(',')]; await pg.evaluate("v=>setView(...v)", v); await pg.wait_for_timeout(600); await pg.screenshot(path=os.path.join(a.out, 'cam.png')); print('shot cam.png')
        views = parse_views(a.views, await pg.evaluate("Object.keys(VIEWS)"))
        if a.all_views: views = await pg.evaluate("Object.keys(VIEWS)")
        for i, vn in enumerate(views):
            ok = await pg.evaluate("n=>{if(!VIEWS[n])return false;setView(...VIEWS[n]);return true;}", vn)
            if not ok: print('no view', vn); continue
            await pg.wait_for_timeout(700); fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:40] + '.png'); await pg.screenshot(path=fn); print('shot', fn)
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e: print('ERROR PANEL after views:', e2); bad = True
        await b.close()
    sys.exit(1 if bad else 0)
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--views'); ap.add_argument('--all-views', action='store_true'); ap.add_argument('--culture'); ap.add_argument('--only')
    ap.add_argument('--cam'); ap.add_argument('--eval'); ap.add_argument('--assert', dest='assert_', action='store_true'); ap.add_argument('--out', default='shots'); ap.add_argument('--size', default='1280x800')
    asyncio.run(run(ap.parse_args()))
