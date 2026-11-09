#!/usr/bin/env python3
"""Headless check for the Tents kit.

  python3 verify.py dist/tents.html [--views "Opening|One tent in every dress"] [--cut] [--night] [--cam cx,cy,cz,tx,ty,tz]
                                    [--assert] [--eval "()=>..."] [--out shots] [--size 1280x800] [--only key1,key2] [--all-views]

Serves dist/ over HTTP through the shared harness (tools/harness.py: Chromium on SwiftShader, the local three.js), waits for
window._ready and for the inlined library textures to decode, prints the error panel and the build counters, runs the
invariants with --assert, and screenshots each view (deviceScaleFactor 1). --only builds just those def keys (?only=); --cut
opens the tents (the cut-away) and --night lights the lamps before the shots. The clock is pinned (?t=4).

The asserts (--assert): every def builds and is placed; each top-level site inside its declared box and height and under its
triangle budget; no NaN; every building typed; the core/tags vocabulary; a front for every site; no catalog key missing;
every enclosed tent's interior furnished (3+ pieces, no required piece missing, the residence rule kept); every door opens
and shuts (core/door: the leaf moves, its core/walk blocks switch); every interior reachable from outside its door with the
doors open (KWALK.reach); no floating stake; the page deterministic (a second build has the same fingerprint); every dress
placed and an unknown culture falling back to 'generic'; the pennants painted; both camps pitched whole by core/camp (no
overlap, nothing short, every record placed; the band's census); the material records.
"""
import argparse, asyncio, json, os, sys

# Harness helpers: the shared copy is tools/harness.py (launching Chromium, the local three.js, --views parsing, the UTF-8
# console). A fix there reaches every verify.py that imports it.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness as _harness
from harness import parse_views, verify_page
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass
ASSERT_JS = r"""()=>{const A=window._api;const R=[];const F=A.footprints();const T=A.tents();
 const over=F.filter(f=>f.ex>1.6||f.ez>1.6);R.push({name:'inside-declared-footprint',ok:!over.length,detail:over.length?over.map(f=>`${f.key} ${f.bw}x${f.bd} vs ${f.w}x${f.d}`).join(' | '):F.length+' sites within their footprint + 0.8 m'});
 const hh=F.filter(f=>f.eh>1.5);R.push({name:'inside-declared-height',ok:!hh.length,detail:hh.length?hh.map(f=>`${f.key} h ${f.bh} vs ${f.h}`).join(' | '):'ok'});
 R.push({name:'no-nan',ok:A.nanSweep()===0,detail:'nan meshes: '+A.nanSweep()});
 const bad=Object.keys(A.DEFS).filter(k=>A.DEFS[k].cls==='building'&&!(A.DEFS[k].tags.types||[]).length);R.push({name:'buildings-typed',ok:!bad.length,detail:bad.length?bad.join(', '):'every building has a culture and types'});
 const TA=A.tags().audit;R.push({name:'tags-vocabulary',ok:TA.unknown===0&&TA.missingCulture===0&&TA.missingTypes===0,detail:TA.records+' records ('+Object.entries(TA.byClass).map(e=>e.join(' ')).join(', ')+'), unknown '+TA.unknown+(TA.unknown?' '+JSON.stringify(TA.unknownValues)+JSON.stringify(TA.unknownKeys):'')});
 R.push({name:'every-def-builds',ok:A.kitCoverage().length===0&&Object.keys(A.DEFS).length>=27,detail:A.kitCoverage().join(', ')||Object.keys(A.DEFS).length+' defs, every one placed'});
 const heavy=F.filter(f=>f.tris>(f.budget||120000));R.push({name:'triangle-budget',ok:!heavy.length,detail:heavy.length?heavy.map(f=>f.key+' '+f.tris+' > '+f.budget).join(' | '):'heaviest '+Math.max(...F.map(f=>f.tris))});
 const nf=A.doors().filter(d=>!d.front||![d.front.local.x,d.front.local.z,d.front.local.yaw].every(isFinite)||d.front.source==='default');R.push({name:'front-door',ok:!nf.length,detail:nf.length?nf.map(d=>d.key+' ('+(d.front&&d.front.source)+')').join(', '):A.doors().length+' sites carry a front'});
 const fu=A.furniture();const miss=Object.keys(fu.missing);R.push({name:'furniture-keys',ok:!miss.length,detail:miss.length?'missing from the catalog: '+miss.map(k=>k+' x'+fu.missing[k]).join(', '):fu.placed+' pieces placed by the builders from '+fu.keys+' catalog keys'});
 const IX=A.interiors();const thin=IX.filter(i=>i.pieces<3),req=IX.filter(i=>i.missing.length),res=IX.filter(i=>i.residence&&i.fails.length);
 R.push({name:'interiors-furnished',ok:IX.length>=40&&!thin.length,detail:thin.length?thin.map(i=>i.key+'@'+i.role+'('+i.culture+') '+i.pieces).join(', '):IX.length+' interiors, '+IX.reduce((a,i)=>a+i.pieces,0)+' pieces'});
 R.push({name:'interiors-required-pieces',ok:!req.length,detail:req.length?req.map(i=>i.key+'@'+i.role+'('+i.culture+'): '+i.missing.join('/')).join(', '):'every room kind has its required pieces'});
 R.push({name:'residence-rule',ok:!res.length,detail:res.length?res.map(i=>i.key+'('+i.culture+'): '+i.fails.join('/')).join(', '):IX.filter(i=>i.residence).length+' residences with a bed, food and an item container'});
 const D=A.doorsAudit();R.push({name:'doors-open-and-shut',ok:!D.bad.length&&D.doors>=40,detail:D.bad.length?D.bad.slice(0,10).join(', '):D.doors+' doors ('+JSON.stringify(D.kinds)+'), '+D.locked+' locked'});
 const RA=A.reachAudit();R.push({name:'interiors-reachable',ok:!RA.bad.length&&RA.tents>=40,detail:RA.bad.length?RA.bad.slice(0,10).map(b=>b.key+'('+b.dress+') reached '+b.reached+' unreached '+b.unreached+(b.why?' '+b.why:'')).join(', '):RA.tents+' tents: every floor reached from outside its door, doors open'});
 const S=A.stakes();R.push({name:'no-floating-stakes',ok:S.floating===0&&S.n>200,detail:S.floating?S.bad.map(s=>s.key+' foot '+s.foot+' ground '+s.ground).join(', '):S.n+' stakes and pegs, every foot in the ground'});
 const f1=A.fingerprint(),f2=A.rebuild();R.push({name:'deterministic',ok:f1===f2,detail:f1+' then '+f2});
 const dr=new Set(T.filter(t=>!t.parent).map(t=>t.dress)),want=TN_DRESS_ORDER.filter(d=>!dr.has(d)),fb=tnDress('nonesuch');
 R.push({name:'every-dress',ok:!want.length&&fb.key==='generic'&&fb.fallback==='nonesuch'&&tnDress('nomad').key==='desert',detail:want.length?'not placed: '+want.join(', '):dr.size+' dresses placed; an unknown culture falls back to generic, culture keys alias'});
 const pn=TN_EMBLEMS.filter(k=>TN_DRESS[k].emblem&&!(MAT['emb_'+k]&&MAT['emb_'+k].map));R.push({name:'pennants-painted',ok:!pn.length,detail:pn.length?pn.join(', '):TN_EMBLEMS.length+' pennants from core/sockets symbols'});
 const C=A.camps();const cb=C.filter(c=>c.short.length||c.check.overlaps||c.check.offGround||c.check.outside||c.placed!==c.records);
 const band=C.find(c=>c.id==='band');R.push({name:'camps-pitched',ok:C.length===2&&!cb.length&&band&&band.pop>=40&&band.pop<=80&&band.households>=5,detail:C.map(c=>c.id+' ('+c.formation+', '+c.dress+'): '+c.placed+'/'+c.records+' placed, short '+c.short.length+', overlaps '+c.check.overlaps+(c.pop?', pop '+c.pop+' in '+c.households+' households, '+c.staffed+' at work':'')).join(' | ')});
 const M=A.materials();R.push({name:'material-records',ok:!!(M&&M.records&&M.records.length>15),detail:M?M.records.length+' records, '+M.records.filter(r=>r.lib).length+' from the library':'none'});
 return R;}"""


async def run(a):
    os.makedirs(a.out, exist_ok=True); bad = False
    q = ['t=4']
    if a.only: q.append('only=' + a.only)
    async with verify_page(a.html, here=os.path.dirname(os.path.abspath(__file__)), size=a.size, query='?' + '&'.join(q), settle_ms=0) as V:
        pg, fails = V.page, V.fails
        if not V.ready: print('never ready'); fails.append('build timeout')
        try: await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception: print('textures still decoding after 120 s')
        await pg.wait_for_timeout(800)
        e = await pg.evaluate("document.getElementById('errs').textContent")
        print('ERROR PANEL:', e.strip() or '(clean)'); print('build:', json.dumps(await pg.evaluate("window._build||null")))
        errs = list(V.errs) + ['console: ' + t for k, t in pg.krator_console if k == 'error']
        if e.strip() or errs: bad = True
        for x in errs[:8]: print('pageerror:', x)
        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:900]); bad |= not r['ok']
        if a.cut: await pg.evaluate("cutSet(true)")
        if a.night: await pg.evaluate("nightSet(true)")
        if a.eval: print(json.dumps(await pg.evaluate(a.eval), indent=1)[:8000])
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
        if bad: fails.append('kit checks (error panel, page errors or an assert)')
    sys.exit(V.exit())
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--views'); ap.add_argument('--all-views', action='store_true'); ap.add_argument('--only')
    ap.add_argument('--cut', action='store_true'); ap.add_argument('--night', action='store_true')
    ap.add_argument('--cam'); ap.add_argument('--eval'); ap.add_argument('--assert', dest='assert_', action='store_true'); ap.add_argument('--out', default='shots'); ap.add_argument('--size', default='1280x800')
    asyncio.run(run(ap.parse_args()))
