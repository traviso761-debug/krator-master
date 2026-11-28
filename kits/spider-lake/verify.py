#!/usr/bin/env python3
"""Headless verification for the Spider Lake & Ham-Tsek kit (kits/spider-lake/PLAN.md).

  python3 verify.py dist/spider-lake.html [--views "Opening|Palace, Great Hum Sanctuary and civic halls (SL1 and SL2)"]
                                          [--cut] [--night] [--cam cx,cy,cz,tx,ty,tz] [--assert] [--eval "()=>..."]
                                          [--out shots] [--size 1280x800] [--only key1,key2] [--all-views]

Started from kits/coyote/verify.py (2026-11-16), on the shared harness (tools/harness.py) with the survey's checks
(verify_page(..., checks=harness.SURVEY): samplers and camera eye clearance on the drawn ground).
"""
import argparse, asyncio, json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness                                      # noqa: E402
from harness import parse_views, verify_page        # noqa: E402
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass

ASSERT_JS = r"""()=>{const A=window._api;const R=[];const F=A.footprints();
 const over=F.filter(f=>f.ex>1.6||f.ez>1.6);R.push({name:'inside-declared-footprint',ok:!over.length,detail:over.length?over.map(f=>`${f.key} ${f.bw}x${f.bd} vs ${f.w}x${f.d}`).join(' | '):F.length+' sites within their footprint + 0.8 m'});
 const hh=F.filter(f=>f.eh>1.5);R.push({name:'inside-declared-height',ok:!hh.length,detail:hh.length?hh.map(f=>`${f.key} h ${f.bh} vs ${f.h}`).join(' | '):'ok'});
 R.push({name:'no-nan',ok:A.nanSweep()===0,detail:'nan meshes: '+A.nanSweep()});
 const bad=Object.keys(A.DEFS).filter(k=>A.DEFS[k].cls==='building'&&!(A.DEFS[k].tags.types||[]).length);R.push({name:'buildings-typed',ok:!bad.length,detail:bad.length?bad.join(', '):'every building has a culture and types'});
 const TA=A.tags().audit,UV=TA.unknownValues||{},uk=Object.keys(UV),onlySL=uk.every(k=>k==='culture:spider-lake');
 R.push({name:'tags-vocabulary',ok:onlySL&&!(TA.unknownKeys&&Object.keys(TA.unknownKeys).length)&&TA.missingTypes===0,detail:TA.records+' records, unknown '+TA.unknown+' '+JSON.stringify(UV)+JSON.stringify(TA.unknownKeys||{})+(onlySL&&TA.unknown?' (the culture spider-lake waits for its registration at the next all-builds rebuild: TODO.md)':'')});
 R.push({name:'every-def-builds',ok:A.kitCoverage().length===0&&Object.keys(A.DEFS).length>=45&&!!A.DEFS.sl_caravanserai_silkhead,detail:A.kitCoverage().join(', ')||Object.keys(A.DEFS).length+' defs (incl. sl_caravanserai_silkhead), every one placed'});
 const heavy=F.filter(f=>f.tris>(f.budget||120000));R.push({name:'triangle-budget',ok:!heavy.length,detail:heavy.length?heavy.map(f=>f.key+' '+f.tris+' > '+f.budget).join(' | '):'heaviest '+Math.max(...F.map(f=>f.tris))});
 const nf=A.doors().filter(d=>d.cls==='building'&&(!d.front||![d.front.local.x,d.front.local.z,d.front.local.yaw].every(isFinite)||d.front.source==='default'));R.push({name:'front-door',ok:!nf.length,detail:nf.length?nf.map(d=>d.key+' ('+(d.front&&d.front.source)+')').join(', '):A.doors().length+' sites carry a front'});
 const fu=A.furniture();const miss=Object.keys(fu.missing);R.push({name:'furniture-keys',ok:!miss.length&&fu.placed>=220,detail:miss.length?'missing from the catalog: '+miss.map(k=>k+' x'+fu.missing[k]).join(', '):fu.placed+' pieces placed by the builders from '+fu.keys+' catalog keys'});
 const shFurn=(fu.perSite.find(s=>s.key==='sl_caravanserai_silkhead')||{pieces:0}).pieces;
 const bare=fu.perSite.filter(s=>A.DEFS[s.key].cut&&s.pieces<4);R.push({name:'buildings-furnished',ok:!bare.length&&shFurn>=16,detail:bare.length?bare.map(s=>s.key+' '+s.pieces).join(', '):'every cut-away building has 4+ pieces (sl_caravanserai_silkhead: '+shFurn+')'});
 const D=A.doorsAudit();R.push({name:'doors-open-and-shut',ok:!D.bad.length&&D.doors>=20,detail:D.bad.length?D.bad.slice(0,10).join(', '):D.doors+' doors, '+D.locked+' locked'});
 const RA=A.reachAudit();R.push({name:'walk-reach',ok:!RA.bad.length&&RA.buildings>=40,detail:RA.bad.length?RA.bad.map(b=>b.key+' missed '+(b.missed||[b.why]).join('/')+' (reached '+b.reached+', unreached '+b.unreached+')').join(', '):RA.buildings+' buildings: every floor, upper storey and bridge crown reached from the front'});
 const SW=A.atmosSilkAudit();R.push({name:'atmos-silk-wind',ok:SW.ok,detail:`hooked [${SW.hooked.join(',')}], progIssues ${SW.progIssues}, pinned ${SW.pinnedVerts} (drift ${SW.maxPinDrift}), free ${SW.freeVerts} (maxDisp ${SW.maxWindDisp} m, dtDelta ${SW.timeDeltaMax} m, windTurn ${SW.windTurnDelta} m, downwind ${SW.downwindAligned}), animSynced ${SW.animSynced}`+(SW.unhooked.length?' unhooked:'+SW.unhooked.join(','):'')+(SW.unbound.length?' unbound:'+SW.unbound.join(','):'')});
 const TX=A.texturesAudit();R.push({name:'all-surfaces-textured',ok:TX.ok,detail:TX.bare.length?'untextured: '+TX.bare.join(', '):TX.textured+'/'+TX.meshes+' opaque/lit world & furniture meshes carry decoded library textures'});
 const ZF=A.zfightAudit();R.push({name:'z-fighting',ok:ZF.ok,detail:ZF.conflicts.length?'conflicts: '+ZF.conflicts.map(c=>`${c.site}(${c.m1} vs ${c.m2} ${c.area}m2 @${c.at.join(',')})`).join(' | '):ZF.triangles+' world triangles scanned across buildings, canopies & furniture: 0 coplanar overlaps'});
 const TR=A.tradesAudit();R.push({name:'voth-trades',ok:TR.ok,detail:TR.missing.length?'missing: '+TR.missing.join(', '):TR.carried+'/'+TR.total+' Voth census trades carried'});
 const OR=A.oreAudit();R.push({name:'mine-sources',ok:OR.ok,detail:OR.bad.length?'failed: '+OR.bad.join(', '):OR.mines.map(m=>`${m.key}->${m.source.kind}(${m.source.grade}, ${Math.round(m.source.dist)}m)`).join('; ')+` across ${OR.nodes} kits/resources nodes`});
 const f1=A.fingerprint(),f2=A.rebuild();R.push({name:'deterministic',ok:f1===f2,detail:f1+' then '+f2});
 const M=A.materials();R.push({name:'material-records',ok:!!(M&&M.records&&M.records.length>20),detail:M?M.records.length+' records, '+M.records.filter(r=>r.lib).length+' from the library':'none'});
 return R;}"""


async def run(a):
    os.makedirs(a.out, exist_ok=True); bad = False
    q = ['t=4']
    if a.only: q.append('only=' + a.only)
    async with verify_page(a.html, here=os.path.dirname(os.path.abspath(__file__)), size=a.size, query='?' + '&'.join(q), settle_ms=0,
                           checks=harness.SURVEY) as V:
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
    return V.exit()


if __name__ == '__main__':
    _def_html = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist', 'spider-lake.html')
    ap = argparse.ArgumentParser(); ap.add_argument('html', nargs='?', default=_def_html); ap.add_argument('--views'); ap.add_argument('--all-views', action='store_true'); ap.add_argument('--only')
    ap.add_argument('--cut', action='store_true'); ap.add_argument('--night', action='store_true')
    ap.add_argument('--cam'); ap.add_argument('--eval'); ap.add_argument('--assert', dest='assert_', action='store_true'); ap.add_argument('--out', default='shots'); ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
