#!/usr/bin/env python3
"""The kit sheet's headless check (sheet.py's pages: kits/iziz-vernacular, kits/highlands, kits/xanadu), on tools/harness.py.
Each kit's verify.py calls run() with what is its own (the trades a sheet cannot carry, its texture pack's key):

    python3 verify.py dist/<kit>.html [--assert] [--views "Opening|Overview"] [--all-views] [--only key1,key2]
                                      [--cam cx,cy,cz,tx,ty,tz] [--eval "()=>..."] [--out shots] [--size 1280x800] [--shot sheet.png]

Serves dist/ over HTTP (the harness routes three.min.js to a local r128), loads the page in headless Chromium (SwiftShader),
waits for window._ready and for the library textures to decode (window._texPending), prints the error panel and the
counters, runs the invariants with --assert, and screenshots each view (deviceScaleFactor 1). The harness's universal asserts
run after these. SwiftShader flakes about one run in seven with a null shader-info-log TypeError: re-run before believing it.

The invariants (--assert):
  sheet-built            every def the sheet places built without throwing (window._sheetFails)
  kit-coverage           every def of the kit (SHEET.owns) is on the sheet
  sites-registered       every placed def registered at least one volume (the inspector can name it)
  registered-volumes-non-empty   every registered volume holds geometry (core/host's regOccupancy)
  no-nan-geometry        no NaN vertex or instance matrix (core/host's nanSweep)
  registry-and-bake-ran  REG filled and the kit items baked (window._registered, window._instances)
  tags-vocabulary        core/tags reads every record with no unknown key or value, every building with a culture and types
  reg-tags               every REG volume carries a class, culture, type and wealth (the Vernacular's own tag rule)
  doors                  the doors are core/door records (KDOOR), every one locked (the sheet's bodies are solid), with unique ids,
                         finite positions and walk blocks in core/walk; the glass panes counted
  textures-load          the kit's library pack loaded beside the page (KMAT_SIDE), every map decoded, and the bound
                         materials are KMAT records naming their library set
  voth-trades            the kit's trades table (SHEET.trades, in the page) carries every census trade but the ones run() is
                         told are another kit's (`foreign`); for a kit with no audit in the page, tools/check_trades.py on the
                         kit's src/ (run(census=True): Highlands' HL_TRADES, Xanadu's XA_TRADES)
  showcase-budget        the scene's triangles under SHEET.budget (reported, a failure only with --strict-budget)
"""
import argparse, asyncio, json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
from harness import parse_views, verify_page   # noqa: E402
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ASSERT_JS = r"""(o)=>{const A=window._api,R=[];if(!A)return [{name:'probe',ok:false,detail:'window._api missing (core/host 95-host-probe.js)'}];
 const F=A.fails();R.push({name:'sheet-built',ok:!F.length,detail:F.length?F.slice(0,6).join(' | '):A.totals.sites+' sites of '+A.defs().length+' defs built'});
 const C=A.coverage();R.push({name:'kit-coverage',ok:!C.length,detail:C.length?'not on the sheet: '+C.join(', '):'every def of the kit placed'});
 const U=A.unregistered();R.push({name:'sites-registered',ok:!U.length,detail:U.length?'registered nothing: '+U.join(', '):'every placed def registered'});
 {const occ=A.regOccupancy(),empty=occ.filter(x=>x.n===0),thin=occ.filter(x=>x.n>0).sort((a,b)=>a.n-b.n).slice(0,3).map(x=>x.name+' ('+x.n+')').join(', ');
  R.push({name:'registered-volumes-non-empty',ok:!empty.length,detail:empty.length?empty.length+' empty of '+occ.length+': '+empty.slice(0,6).map(e=>e.name).join(' | '):occ.length+' volumes; thinnest: '+thin});}
 {const n=A.nanSweep();R.push({name:'no-nan-geometry',ok:n.meshes===0&&n.instances===0,detail:(n.meshes||n.instances)?n.instances+' instanced meshes, '+n.meshes+' meshes: '+JSON.stringify(n.first).slice(0,300):'clean'});}
 R.push({name:'registry-and-bake-ran',ok:window._registered>0&&window._instances>0,detail:window._registered+' registered volumes, '+window._instances+' baked instances'});
 {const T=A.tags().audit;R.push({name:'tags-vocabulary',ok:T.unknown===0&&T.missingCulture===0&&T.missingTypes===0,
  detail:T.records+' records ('+Object.entries(T.byClass).map(e=>e.join(' ')).join(', ')+'), unknown '+T.unknown+(T.unknown?' '+JSON.stringify(T.unknownValues).slice(0,300)+JSON.stringify(T.unknownKeys).slice(0,200):'')+', missing culture '+T.missingCulture+', missing types '+T.missingTypes});}
 {const T=A.tagAudit();R.push({name:'reg-tags',ok:T.bad===0,detail:T.bad?T.bad+' volumes lack class/culture/type/wealth: '+T.first.join(' | '):'every volume classed and tagged'});}
 {const D=A.doors(),X=A.doorExport().doors||[],ids=new Set(X.map(d=>d.id)),bad=X.filter(d=>!(d.at||[]).every(isFinite));
  const hol=window._hollowDoors|0;   // a def a builder draws hollow declares its unlocked leaves (kits/xanadu 78d: the Pleasure Dome); every other door is locked
  const ok=D.doors>0&&D.locked===D.doors-hol&&ids.size===X.length&&X.length===D.doors&&!bad.length&&D.blocks>0;
  R.push({name:'doors',ok,detail:D.doors+' doors in KDOOR ('+D.locked+' locked, '+(hol?hol+' unlocked in hollow defs, ':'')+ids.size+' unique ids, '+D.blocks+' walk blocks'+(bad.length?', '+bad.length+' at no finite point':'')+'), '+D.panes+' glass panes, '+D.voids+' dark voids left (not openings)'});}
 {const M=A.materials(),recs=M&&M.records||[],lib=recs.filter(r=>r.lib),side=window.KMAT_SIDE&&window.KMAT_SIDE[o.pack],nf=side?Object.keys(side).length:0;
  R.push({name:'textures-load',ok:nf>0&&A.texPending()===0&&lib.length>0,detail:'pack '+o.pack+': '+nf+' families loaded from the sidecar, '+A.texPending()+' maps still decoding; '+recs.length+' material records, '+lib.length+' bound to a library set'});}
 {const T=A.trades();if(T){const bad=T.bad.filter(b=>!o.foreign.some(f=>b.indexOf(f)===0));
  R.push({name:'voth-trades',ok:!bad.length,detail:bad.length?bad.join(' | '):T.carried+' of '+T.trades+' census trades carried'+(T.na?', '+T.na+' not applicable':'')+(T.bad.length?'; another kit\'s: '+T.bad.join(' | '):'')});}}
 {const T=A.totals,B=A.BUDGET.showcase;R.push({name:'showcase-budget',ok:T.tris<=B.tris,budget:true,detail:T.tris+' / '+B.tris+' triangles in the scene, '+T.meshes+' meshes, '+T.inst+' instances'});}
 return R;}"""


async def _run(a, pack, foreign, census):
    os.makedirs(a.out, exist_ok=True)
    q = []
    if a.only:
        q.append('only=' + a.only)
    here = os.path.dirname(os.path.dirname(os.path.abspath(a.html)))
    async with verify_page(a.html, here=here, size=a.size, query=('?' + '&'.join(q)) if q else '', settle_ms=0) as V:
        pg, fails = V.page, V.fails
        if not V.ready:
            fails.append('build timeout')
        try:
            await pg.wait_for_function("(window._texPending||0)===0", timeout=180000)
        except Exception:
            print('textures still decoding after 180 s')
        await pg.wait_for_timeout(800)
        e = await pg.evaluate("document.getElementById('errs').textContent")
        errs = list(V.errs) + ['console: ' + t for k, t in getattr(pg, 'krator_console', []) if k == 'error']
        print('ERROR PANEL:', e.strip() or '(clean)')
        for x in errs[:8]:
            print('pageerror:', x)
        if e.strip() or errs:
            fails.append('error panel or page errors')
        print('counters:', json.dumps(await pg.evaluate(
            "()=>({sites:window._sites,registered:window._registered,instances:window._instances,doors:window._doors,doorwaysCleared:window._doorwaysCleared,totals:window._api&&window._api.totals})")))
        if a.assert_:
            print('\n--- invariants ---')
            for r in await pg.evaluate(ASSERT_JS, {'pack': pack, 'foreign': list(foreign)}):
                soft = r.get('budget') and not a.strict_budget
                print(('  PASS  ' if r['ok'] else ('  OVER  ' if soft else '  FAIL  ')) + r['name'] + ' : ' + r['detail'][:900])
                if not r['ok'] and not soft:
                    fails.append('assert ' + r['name'])
            if census:   # the kit's trades table against the Voth census (tools/check_trades.py), as the settlements' verify.py ran it
                from check_trades import trades_check
                ok, detail, _ = trades_check(here)
                print(('  PASS  ' if ok else '  FAIL  ') + 'voth-trades : ' + detail[:900])
                if not ok:
                    fails.append('assert voth-trades')
        if a.eval:
            for ev in a.eval:
                print('eval:', json.dumps(await pg.evaluate(ev))[:4000])
        if a.cam:
            v = [float(t) for t in a.cam.split(',')]
            await pg.evaluate("v=>setView(...v)", v)
            await pg.wait_for_timeout(1200)
            fn = os.path.join(a.out, a.shot or 'cam.png')
            await V.shot(fn, view='cam')
            print('shot', fn)
        views = parse_views(a.views, await pg.evaluate("Object.keys(VIEWS)")) if a.views else []
        if a.all_views:
            views = await pg.evaluate("Object.keys(VIEWS)")
        for i, vn in enumerate(views):
            ok = await pg.evaluate("n=>{if(!VIEWS[n])return false;KHOST.setView(...VIEWS[n]);return true;}", vn)
            if not ok:
                print('no view', vn)
                fails.append('view ' + vn)
                continue
            await pg.wait_for_timeout(1200)
            fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png')
            await V.shot(fn, view=vn)
            st = await pg.evaluate("()=>({calls:renderer.info.render.calls,tris:renderer.info.render.triangles})")
            print('shot %s  calls %d  tris %.2fM' % (fn, st['calls'], st['tris'] / 1e6))
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e:
            print('ERROR PANEL after views:', e2)
            fails.append('error panel after views')
    return V.exit()


def run(pack, foreign=(), census=False):
    """Parse the command line and check the sheet; pack: the kit's KMAT pack key; foreign: the trade names (the start of a
    trades-table complaint) whose buildings are another kit's (Iziz's foreign quarter for the Vernacular)."""
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views', default='')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--only')
    ap.add_argument('--cam')
    ap.add_argument('--shot', help='file name for the --cam shot')
    ap.add_argument('--eval', action='append')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--strict-budget', dest='strict_budget', action='store_true')
    ap.add_argument('--out', default='shots')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(_run(ap.parse_args(), pack, foreign, census)))
