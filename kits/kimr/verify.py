#!/usr/bin/env python3
"""Headless check for the Kimr kit (the example house: a clan's pueblo on its rock, on core/pueblo).

  python3 verify.py dist/kimr.html [--views "Opening"] [--cut] [--night] [--cam cx,cy,cz,tx,ty,tz]
                                [--assert] [--eval "()=>..."] [--out shots] [--size 1280x800] [--only key1,key2] [--all-views]

Taken from kits/resources/verify.py (2026-11-11): the shared harness (tools/harness.py) serves the page, waits for window._ready,
prints the error panel and the build counters, runs the invariants with --assert (each kit check with its negative), and
screenshots each view. The clock is pinned (?t=4).
"""
import argparse, asyncio, glob, http.server, json, os, re, socketserver, sys, threading

# --------------------------------------------------------------------------
# Harness helpers: the shared copy is tools/harness.py (launching Chromium, the local three.js, --views parsing,
# the UTF-8 console). A fix there reaches every verify.py that imports it.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness as _harness
from harness import GL_ARGS, LOAD_MS, CHROME_ENV, launch_chromium, parse_views, verify_page
local_three = lambda folder: _harness.local_three(folder, os.path.dirname(os.path.abspath(__file__)))
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass
ASSERT_JS = r"""()=>{const A=window._api;const R=[];const F=A.footprints();
 const over=F.filter(f=>f.ex>1.6||f.ez>1.6);R.push({name:'inside-declared-footprint',ok:!over.length,detail:over.length?over.map(f=>`${f.key} ${f.bw}x${f.bd} vs ${f.w}x${f.d}`).join(' | '):F.length+' sites within their footprint + 0.8 m'});
 const hh=F.filter(f=>f.eh>1.5);R.push({name:'inside-declared-height',ok:!hh.length,detail:hh.length?hh.map(f=>`${f.key} h ${f.bh} vs ${f.h}`).join(' | '):'ok'});
 R.push({name:'no-nan',ok:A.nanSweep()===0,detail:'nan meshes: '+A.nanSweep()});
 const T=A.tags().audit;R.push({name:'tags-vocabulary',ok:T.unknown===0&&T.missingCulture===0,detail:T.records+' records ('+Object.entries(T.byClass).map(e=>e.join(' ')).join(', ')+'), unknown '+T.unknown+(T.unknown?' '+JSON.stringify(T.unknownValues)+JSON.stringify(T.unknownKeys):'')});
 R.push({name:'kit-coverage',ok:A.kitCoverage().length===0,detail:A.kitCoverage().join(', ')||'every def placed'});
 const heavy=F.filter(f=>f.tris>(f.budget||120000));R.push({name:'triangle-budget',ok:!heavy.length,detail:heavy.length?heavy.map(f=>f.key+' '+f.tris+' > '+f.budget).join(' | '):'heaviest '+Math.max(...F.map(f=>f.tris))});
 const nf=A.doors().filter(d=>!d.front||d.front.source==='default');R.push({name:'front-declared',ok:!nf.length,detail:nf.length?nf.map(d=>d.key).join(', '):A.doors().length+' houses carry a declared front'});
 /* the houses: each plan passes core/pueblo's checks, every cell, door and hatch drawn, the rock 7-10 m, the long ladders reaching its
    top from the floor, the plan registered under the house; the negative: a plan with a front room raised over the cell behind it */
 const H=A.REG.filter(r=>r.key==='km-house'),E=[];const ok=(c,t)=>{if(!c)E.push(t);};
 for(const r of H){const P=KM.plan(r.v),S=r.km||{},C=KPUEBLO.checkAll(P),St=KM.site(P),bad=Object.keys(C).filter(k=>!C[k].ok);
  ok(!bad.length&&!P.errors.length,P.id+' core/pueblo checks: '+bad.join(','));ok(S.cells===P.cells.length,P.id+' cells drawn '+S.cells);
  ok(S.doors===P.rooms.filter(q=>q.face==='door').length,P.id+' doors drawn '+S.doors);ok(S.hatches===P.hatches.length,P.id+' hatches drawn '+S.hatches);
  ok(S.ladders===P.ladders.length&&S.entries===2,P.id+' ladders');ok(St.rock.h>=7&&St.rock.h<=10&&S.rockH===St.rock.h,P.id+' rock '+St.rock.h);
  ok(St.entries.every(e=>e.y0===-St.rock.h&&e.y1===0),P.id+' the long ladders do not span the rock');ok(S.crest===1&&S.round===1&&S.pen===1&&S.ribs>10,P.id+' dress');
  ok(r.bbox.mn[1]<r.y+.5&&r.bbox.mx[1]>r.y+St.rock.h+P.bounds.h,P.id+' drawn height');
  const kids=A.tags&&SVTAGS?SVTAGS.query({parent:r.tid}):[];ok(kids.filter(k=>k.kind==='room').length===P.rooms.length,P.id+' rooms registered '+kids.filter(k=>k.kind==='room').length);}
 const P2=JSON.parse(JSON.stringify(KM.plan(0)));Object.defineProperty(P2,'byId',{value:KPUEBLO.link(P2.cells),enumerable:false});
 const fc=P2.cells.find(c=>c.block==='back'&&c.row===0);if(fc)fc.storeys=9;const neg=KPUEBLO.check.terraces(P2);
 R.push({name:'kimr-house',ok:H.length===3&&!E.length&&!neg.ok,detail:(E.length?'FAILED '+E.join(' | '):H.map(r=>r.km.plan+': '+r.km.rooms+' rooms, '+r.km.pop+' people, rock '+r.km.rockH+' m, '+r.tris+' tris').join('; '))+(neg.ok?'  [its negative did not fail]':'  (negative fails: a front room raised to nine storeys)')});
 return R;}"""
async def run(a):
    os.makedirs(a.out, exist_ok=True); bad = False
    q = ['t=4']
    if a.only: q.append('only=' + a.only)
    async with verify_page(a.html, here=os.path.dirname(os.path.abspath(__file__)), size=a.size, query='?' + '&'.join(q), settle_ms=0) as V:
        pg, fails = V.page, V.fails
        # page errors, then console errors: the harness has watched the console since before the load; take what the build
        # already logged, then listen on
        cons = ['console: ' + t for k, t in pg.krator_console if k == 'error']
        pg.on("console", lambda m: cons.append('console: ' + m.text) if m.type == 'error' else None)
        if not V.ready: print('never ready')
        try: await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception: print('textures still decoding after 120 s')
        await pg.wait_for_timeout(800)
        e = await pg.evaluate("document.getElementById('errs').textContent")
        print('ERROR PANEL:', e.strip() or '(clean)'); print('build:', json.dumps(await pg.evaluate("window._build||null")))
        errs = V.errs + cons
        if e.strip() or errs: bad = True
        for x in errs[:8]: print('pageerror:', x)
        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:700]); bad |= not r['ok']
        if a.cut: await pg.evaluate("cutSet(true)")
        if a.night: await pg.evaluate("nightSet(true)")
        if a.eval: print(json.dumps(await pg.evaluate(a.eval), indent=1)[:6000])
        if a.cam:
            v = [float(t) for t in a.cam.split(',')]; await pg.evaluate("v=>setView(...v)", v); await pg.wait_for_timeout(900); await V.shot(os.path.join(a.out, 'cam.png'), view='cam'); print('shot cam.png')
        views = parse_views(a.views, await pg.evaluate("Object.keys(VIEWS)"))
        if a.all_views: views = await pg.evaluate("Object.keys(VIEWS)")
        for i, vn in enumerate(views):
            ok = await pg.evaluate("n=>{if(!VIEWS[n])return false;setView(...VIEWS[n]);return true;}", vn)
            if not ok: print('no view', vn); continue
            await pg.wait_for_timeout(900); fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png'); await V.shot(fn, view=vn); print('shot', fn)
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e: print('ERROR PANEL after views:', e2); bad = True
        if bad: fails.append('error panel, page errors or an invariant')
    return V.exit()
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--views'); ap.add_argument('--all-views', action='store_true'); ap.add_argument('--only')
    ap.add_argument('--cut', action='store_true'); ap.add_argument('--night', action='store_true')
    ap.add_argument('--cam'); ap.add_argument('--eval'); ap.add_argument('--assert', dest='assert_', action='store_true'); ap.add_argument('--out', default='shots'); ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
