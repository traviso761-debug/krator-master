#!/usr/bin/env python3
"""Headless check for the Yeti kit.

  python3 verify.py dist/yeti.html [--views "Opening|Small tents"] [--cut] [--night] [--cam cx,cy,cz,tx,ty,tz]
                                     [--assert] [--eval "()=>..."] [--out shots] [--size 1280x800] [--only key1,key2] [--all-views]

Serves dist/ over HTTP, routes three.min.js to a local r128 (offline), loads in headless Chromium (SwiftShader), waits for
window._ready and for the inlined library textures to decode (window._texPending), prints the error panel and the build
counters, runs the invariants with --assert, and screenshots each view. --only builds just those def keys (?only=);
--cut opens the buildings (the cut-away) and --night lights the lamps before the shots. The clock is pinned (?t=4).
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
 // footprint: the measured box against the declared w x d x h (guy ropes and stakes are counted in the declaration; 1.6 m slack)
 const over=F.filter(f=>f.ex>1.6||f.ez>1.6);R.push({name:'inside-declared-footprint',ok:!over.length,detail:over.length?over.map(f=>`${f.key} ${f.bw}x${f.bd} vs ${f.w}x${f.d}`).join(' | '):F.length+' sites within their footprint + 0.8 m'});
 const hh=F.filter(f=>f.eh>1.5);R.push({name:'inside-declared-height',ok:!hh.length,detail:hh.length?hh.map(f=>`${f.key} h ${f.bh} vs ${f.h}`).join(' | '):'ok'});
 R.push({name:'no-nan',ok:A.nanSweep()===0,detail:'nan meshes: '+A.nanSweep()});
 const bad=Object.keys(A.DEFS).filter(k=>A.DEFS[k].cls==='building'&&!(A.DEFS[k].tags.types||[]).length);R.push({name:'buildings-typed',ok:!bad.length,detail:bad.length?bad.join(', '):'every building has a culture and types'});
 const T=A.tags().audit;R.push({name:'tags-vocabulary',ok:T.unknown===0&&T.missingCulture===0&&T.missingTypes===0,detail:T.records+' records ('+Object.entries(T.byClass).map(e=>e.join(' ')).join(', ')+'), unknown '+T.unknown+(T.unknown?' '+JSON.stringify(T.unknownValues)+JSON.stringify(T.unknownKeys):'')});
 R.push({name:'kit-coverage',ok:A.kitCoverage().length===0,detail:A.kitCoverage().join(', ')||'every def placed'});
 const heavy=F.filter(f=>f.tris>(f.budget||120000));R.push({name:'triangle-budget',ok:!heavy.length,detail:heavy.length?heavy.map(f=>f.key+' '+f.tris+' > '+f.budget).join(' | '):'heaviest '+Math.max(...F.map(f=>f.tris))});
 const nf=A.doors().filter(d=>!d.front||![d.front.local.x,d.front.local.z,d.front.local.yaw].every(isFinite)||d.front.source==='default');R.push({name:'front-door',ok:!nf.length,detail:nf.length?nf.map(d=>d.key+' ('+(d.front&&d.front.source)+')').join(', '):A.doors().length+' sites carry a front from a door() or a declared front'});
 const fu=A.furniture();const miss=Object.keys(fu.missing);R.push({name:'furniture-keys',ok:!miss.length,detail:miss.length?'missing from the catalog: '+miss.map(k=>k+' x'+fu.missing[k]).join(', '):fu.placed+' pieces from '+fu.keys+' catalog keys, '+fu.tris+' triangles'});
 const bare=fu.perSite.filter(s=>A.DEFS[s.key].cut&&s.pieces<4);R.push({name:'buildings-furnished',ok:!bare.length,detail:bare.length?bare.map(s=>s.key+' '+s.pieces).join(', '):'every building with a cut-away has 4+ pieces: '+fu.perSite.filter(s=>A.DEFS[s.key].cut).map(s=>s.key+' '+s.pieces).join(', ')});
 const subs=Object.keys(A.DEFS).filter(k=>A.DEFS[k].cls==='building'&&!['state','rich','common','poor'].includes(A.DEFS[k].tags.style));R.push({name:'tier-styled',ok:!subs.length,detail:subs.length?'no style state|rich|common|poor: '+subs.join(', '):'every building has a tier style'});
 const lifeRecs=A.REG.filter(r=>r.cls==='life');const nol=lifeRecs.filter(r=>!A.SV_LIFE.some(l=>l.id===r.tid));R.push({name:'life-records',ok:!nol.length,detail:nol.length?'no life data: '+nol.map(r=>r.key).join(', '):lifeRecs.length+' life records (the kit keeps no beasts)'});
 {const dom=A.REG.filter(r=>r.heat);const noH=dom.filter(r=>(!r.heat.open&&(!r.layers||!r.layers.length))||(r.heat.heated&&(!r.heat.inlet||!r.heat.crownVent)));
  R.push({name:'heat-records',ok:dom.length>0&&!noH.length,detail:noH.length?'no layers, or heated without an inlet or crown vent: '+noH.map(r=>r.key).join(', '):dom.length+' records carry their layers; every heated one an inlet and a crown vent (PLAN.md section 4)'});
  const fr=A.REG.filter(r=>r.frost&&!r.frost.none&&!r.frost.unheated),bad=fr.filter(r=>!r.frost.ok);
  R.push({name:'frost-rule',ok:!bad.length,detail:bad.length?'a heated pycrete shell would thaw on its inner face: '+bad.map(r=>r.key+' crown '+r.frost.crown.t+' base '+r.frost.base.t).join(' | '):fr.length+' heated pycrete shells stay frozen on their inner face (warmest: '+Math.max(...fr.map(r=>Math.max(r.frost.crown.t,r.frost.base.t)))+' C)'});
  const st=dom.filter(r=>r.heat.heated&&r.layers.some(l=>l.k==='stone')),naked=st.filter(r=>{const i=r.layers.findIndex(l=>l.k==='stone');return !r.layers.slice(i+1).some(l=>['moss','turf','snow','felt'].includes(l.k));});
  R.push({name:'mass-inside',ok:!naked.length,detail:naked.length?'heated stone with no insulation outside it: '+naked.map(r=>r.key).join(', '):st.length+' heated stone houses wrapped outside their mass'});}
 /* walk-reach (core/walk): from each building's first target, walk the registered floors (a step up of 0.6 m at most,
    the ground at y 0 only where no floor is registered: a dug room or trench has no ground over it; never into a block taller than a 0.45 m step-over) on a 0.25 m grid; every target it registered, and its
    children's, must be reached */
 {const W=KWALK,st=.25,out=[],bad=[];const all=r=>(r.walkTargets||[]).map(t=>Object.assign({who:r.key},t)).concat(...r.children.map(all));
  for(const r of A.REG.filter(q=>!q.parent)){const T=all(r);if(T.length<2)continue;const s0=T.find(t=>!t.opt)||T[0],b=r.bbox,m=4;
   const x0=b.mn[0]-m,x1=b.mx[0]+m,z0=b.mn[2]-m,z1=b.mx[2]+m,seen=new Map(),q=[[s0.x,s0.z,s0.y]],K=(x,z,y)=>Math.round(x/st)+','+Math.round(z/st)+','+Math.round(y*5);
   seen.set(K(s0.x,s0.z,s0.y),1);const V=[];let n=0;
   while(q.length&&n<120000){const [x,z,y]=q.pop();n++;V.push([x,z,y]);
    for(const [dx,dz] of [[st,0],[-st,0],[0,st],[0,-st]]){const nx=x+dx,nz=z+dz;if(nx<x0||nx>x1||nz<z0||nz>z1)continue;
     const fb=W.floorBelow(nx,nz,y,.6);let ny=fb?fb[0]:-1e9;if(!W.floorsAt(nx,nz).length&&0<=y+.6)ny=0;if(ny<-1e8)continue;
     if(W.blocked(nx,ny+.45,nz,.22,1.2))continue;const k=K(nx,nz,ny);if(seen.has(k))continue;seen.set(k,1);q.push([nx,nz,ny]);}}
   const miss=T.filter(t=>!t.opt&&!V.some(v=>Math.abs(v[0]-t.x)<.45&&Math.abs(v[1]-t.z)<.45&&Math.abs(v[2]-t.y)<.4));
   out.push(r.key+' '+(T.filter(t=>!t.opt).length-miss.length)+'/'+T.filter(t=>!t.opt).length);if(miss.length)bad.push(r.key+'(v'+r.v+'): '+miss.map(t=>t.who+':'+t.name).join(','));}
  R.push({name:'walk-reach',ok:!bad.length&&out.length>0,detail:bad.length?'unreached: '+bad.join(' | '):out.length+' buildings walked: '+out.join(', ')});}
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
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:4000]); bad |= not r['ok']
            sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
            from check_trades import trades_check   # the Voth census table (src/68-yt-trades.js), checked against the source
            t_ok, t_detail, _ = trades_check(os.path.dirname(os.path.abspath(__file__)))
            print(('PASS ' if t_ok else 'FAIL ') + 'voth-trades - ' + t_detail[:700]); bad |= not t_ok
        if a.cut: await pg.evaluate("cutSet(true)")
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
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--views'); ap.add_argument('--all-views', action='store_true'); ap.add_argument('--only')
    ap.add_argument('--cut', action='store_true'); ap.add_argument('--night', action='store_true')
    ap.add_argument('--cam'); ap.add_argument('--eval'); ap.add_argument('--assert', dest='assert_', action='store_true'); ap.add_argument('--out', default='shots'); ap.add_argument('--size', default='1280x800')
    asyncio.run(run(ap.parse_args()))
