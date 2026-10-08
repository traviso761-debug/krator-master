#!/usr/bin/env python3
"""Headless check for Noah's Regret.

  python3 verify.py dist/noahs-regret.html [--views "Opening|Plan: the bridge (D4)"] [--cut LEVEL] [--night] [--cam cx,cy,cz,tx,ty,tz]
                                     [--assert] [--eval "()=>..."] [--out shots] [--size 1280x800] [--all-views]

Serves dist/ over HTTP, routes three.min.js to a local r128 (offline), loads in headless Chromium (SwiftShader), waits for
window._ready and for the inlined library textures to decode (window._texPending), prints the error panel and the build
counters, runs the invariants with --assert, and screenshots each view (a view carries its own deck cut and night).
--cut LEVEL cuts the decks at a named level (92-camera.js NR_LEVELS, e.g. "D3") for --cam shots; --night lights the lamps.
The clock is pinned (?t=4).
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
ASSERT_JS = r"""()=>{const A=window._api;const R=[];
 R.push({name:'no-nan',ok:A.nanSweep()===0,detail:'nan meshes: '+A.nanSweep()+' '+A.nanSweep(true).join(' | ')});
 const bad=Object.keys(A.DEFS).filter(k=>A.DEFS[k].cls==='building'&&!(A.DEFS[k].tags.types||[]).length);R.push({name:'buildings-typed',ok:!bad.length,detail:bad.length?bad.join(', '):'every building has a culture and types'});
 const T=A.tags().audit;R.push({name:'tags-vocabulary',ok:T.unknown===0&&T.missingCulture===0&&T.missingTypes===0,detail:T.records+' records ('+Object.entries(T.byClass).map(e=>e.join(' ')).join(', ')+'), unknown '+T.unknown+(T.unknown?' '+JSON.stringify(T.unknownValues)+JSON.stringify(T.unknownKeys):'')+', missing culture '+T.missingCulture+', missing types '+T.missingTypes});
 R.push({name:'kit-coverage',ok:A.kitCoverage().length===0,detail:A.kitCoverage().join(', ')||'every def placed'});
 const F=A.footprints();const hh=F.filter(f=>!f.top&&f.eh>2.5);R.push({name:'deck-buildings-height',ok:!hh.length,detail:hh.length?hh.map(f=>`${f.key} h ${f.bh} vs ${f.h}`).join(' | '):F.filter(f=>!f.top).length+' deck buildings within their declared height'});
 const heavy=F.filter(f=>f.tris>(f.budget||400000));R.push({name:'triangle-budget',ok:!heavy.length,detail:heavy.length?heavy.map(f=>f.key+' '+f.tris+' > '+f.budget).join(' | '):'heaviest '+Math.max(...F.map(f=>f.tris))});
 const fu=A.furniture();const miss=Object.keys(fu.missing);R.push({name:'furniture-keys',ok:!miss.length,detail:miss.length?'missing from the catalog: '+miss.map(k=>k+' x'+fu.missing[k]).join(', '):fu.placed+' pieces from '+fu.keys+' catalog keys, '+fu.tris+' drawn triangles (batch), '+fu.lights+' lights as halos'});
 const I=A.interiors();if(I){R.push({name:'interiors-required',ok:I.missingRequired.length===0,detail:I.missingRequired.length?I.missingRequired.slice(0,12).join(' | ')+(I.missingRequired.length>12?' ... '+I.missingRequired.length:''):I.rooms+' rooms furnished ('+Object.entries(I.byKind).map(e=>e[0]+' '+e[1]).join(', ')+'), every required piece placed'});
  R.push({name:'interiors-audit',ok:I.auditFails.length===0,detail:I.auditFails.length?I.auditFails.slice(0,10).join(' | '):I.audited+' template rooms audited (inside, overlap, doors, clearance, reach)'});
  R.push({name:'cabins-inhabited',ok:I.cabinsBare===0&&I.cabinsFurnished>0,detail:I.cabinsFurnished+' inhabited cabins furnished on D3-D4, '+I.cabinsBare+' bare; D1-D2 stripped: '+I.cabinsEmpty});
  R.push({name:'residences',ok:I.residenceFails.length===0,detail:I.residenceFails.length?I.residenceFails.join(' | '):I.residences+' deck buildings pass the residence rule (bed, food and item containers per unit)'});
  R.push({name:'public-rooms',ok:I.publicRooms.every(r=>r.pieces>=r.min),detail:I.publicRooms.map(r=>r.id+' '+r.pieces+(r.pieces<r.min?' < '+r.min:'')).join(', ')});
  const SR=I.shipRooms||[];R.push({name:'ship-rooms',ok:SR.length>=12&&SR.every(r=>r.pieces>=3),detail:SR.length+" ship's rooms: "+SR.map(r=>r.id+' '+r.pieces).join(', ')});}
 else R.push({name:'interiors',ok:false,detail:'window._interiors missing'});
 R.push({name:'no-life-layer',ok:A.faction().life.length===0,detail:'the brief: furniture, no life layer yet (faction data kept for it)'});
 const M=A.materials();R.push({name:'material-records',ok:!!(M&&M.records&&M.records.length>15),detail:M?M.records.length+' records, '+M.records.filter(r=>r.lib).length+' from the library':'none'});
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
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:700]); bad |= not r['ok']
        if a.cut: await pg.evaluate("n=>cutSet(n)", a.cut)
        if a.night: await pg.evaluate("nightSet(true)")
        if a.eval: print(json.dumps(await pg.evaluate(a.eval), indent=1)[:6000])
        if a.cam:
            v = [float(t) for t in a.cam.split(',')]; await pg.evaluate("v=>setView(...v)", v); await pg.wait_for_timeout(900); await pg.screenshot(path=os.path.join(a.out, 'cam.png')); print('shot cam.png')
        views = parse_views(a.views, await pg.evaluate("Object.keys(VIEWS)"))
        if a.all_views: views = await pg.evaluate("Object.keys(VIEWS)")
        for i, vn in enumerate(views):
            ok = await pg.evaluate("n=>{if(!VIEWS[n])return false;setView(...VIEWS[n]);return true;}", vn)
            if not ok: print('no view', vn); continue
            await pg.wait_for_timeout(900); fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png'); await pg.screenshot(path=fn); print('shot', fn)
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e: print('ERROR PANEL after views:', e2); bad = True
        await b.close()
    sys.exit(1 if bad else 0)
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--views'); ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--cut'); ap.add_argument('--night', action='store_true')
    ap.add_argument('--cam'); ap.add_argument('--eval'); ap.add_argument('--assert', dest='assert_', action='store_true'); ap.add_argument('--out', default='shots'); ap.add_argument('--size', default='1280x800')
    asyncio.run(run(ap.parse_args()))
