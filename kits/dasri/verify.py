#!/usr/bin/env python3
"""Headless verification and visual inspection runner for the Dasri kit (kits/dasri/PLAN.md section 5).

  python3 verify.py dist/dasri.html [--views "Overview|Dar al-Hajar pinnacle and Jabal cliff cluster"]
                                    [--cut] [--night] [--cam cx,cy,cz,tx,ty,tz] [--assert] [--eval "()=>..."]
                                    [--out shots] [--size 1280x800] [--only key1,key2] [--all-views]

Uses the shared harness (tools/harness.py) with `checks=harness.SURVEY` (samplers, drawn-ground, shader-errors,
eye-not-inside-geometry, gpu-renderer when KRATOR_GL=gpu).
"""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness                                      # noqa: E402  (watchdog and verify cache)
from harness import parse_views, verify_page        # noqa: E402
import check_trades, check_views                    # noqa: E402

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ASSERT_JS = r"""()=>{
 const A=window._api,R=[],F=A.footprints();
 const over=F.filter(f=>f.ex>1.2||f.ez>1.2);
 R.push({name:'inside-declared-footprint',ok:!over.length,detail:over.length?over.map(f=>`${f.key} ${f.bw}x${f.bd} vs ${f.w}x${f.d}`).join(' | '):F.length+' sites within declared footprint + 1.2 m'});
 const hh=F.filter(f=>f.eh>1.2);
 R.push({name:'inside-declared-height',ok:!hh.length,detail:hh.length?hh.map(f=>`${f.key} h ${f.bh} vs ${f.h}`).join(' | '):F.length+' sites within declared height + 1.2 m'});
 R.push({name:'no-nan',ok:A.nanSweep()===0,detail:'nan meshes '+A.nanSweep()});
 const badTyped=Object.keys(A.DEFS).filter(k=>A.DEFS[k].cls==='building'&&!(A.DEFS[k].tags.types||[]).length);
 R.push({name:'buildings-typed',ok:!badTyped.length,detail:badTyped.length?badTyped.join(', '):'every building has culture and BUILDING_TYPES'});
 const TA=A.tags().audit;
 R.push({name:'tags-vocabulary',ok:TA.unknown===0&&TA.missingCulture===0&&TA.missingTypes===0&&TA.records>=45,detail:TA.records+' records, unknown '+TA.unknown+(TA.unknown?' '+JSON.stringify(TA.unknownValues)+JSON.stringify(TA.unknownKeys):'')});
 R.push({name:'every-def-builds',ok:A.kitCoverage().length===0&&Object.keys(A.DEFS).length===28,detail:A.kitCoverage().join(', ')||(Object.keys(A.DEFS).length+' defs, all 28 placed')});
 const heavy=F.filter(f=>f.tris>(f.budget||120000));
 R.push({name:'triangle-budget',ok:!heavy.length,detail:heavy.length?heavy.map(f=>f.key+' '+f.tris+' > '+f.budget).join(' | '):'heaviest '+Math.max(...F.map(f=>f.tris))+' tris'});
 const nf=A.doors().filter(d=>d.cls==='building'&&(!d.front||![d.front.local.x,d.front.local.z,d.front.local.yaw].every(isFinite)||d.front.source==='default'));
 R.push({name:'front-door',ok:!nf.length,detail:nf.length?nf.map(d=>d.key+' ('+(d.front&&d.front.source)+')').join(', '):A.doors().length+' sites carry an explicit or declared front'});
 const fu=A.furniture(),miss=Object.keys(fu.missing);
 R.push({name:'furniture-keys',ok:!miss.length&&fu.placed>=60,detail:miss.length?'missing '+miss.map(k=>k+' x'+fu.missing[k]).join(', '):fu.placed+' catalog pieces placed from '+fu.keys+' keys'});
 const D=A.doorsAudit();
 R.push({name:'doors-open-and-shut',ok:!D.bad.length&&D.doors>=18&&D.panes>=120,detail:D.bad.length?D.bad.slice(0,8).join(', '):D.doors+' operable KDOOR leaves, '+D.locked+' locked, '+D.panes+' KGLASS panes'});
 const RA=A.reachAudit();
 R.push({name:'walk-reach',ok:!RA.bad.length&&RA.buildings>=24,detail:RA.bad.length?RA.bad.map(b=>b.key+' missed '+(b.missed||[b.why]).join('/')).join(', '):RA.buildings+' buildings reached from street front'});
 const RG=A.registerAudit();
 R.push({name:'register-contrast',ok:RG.ok,detail:RG.bad.length?RG.bad.join(' | '):RG.urban+' Jabal urban sites ('+RG.shibam+' Shibam white-crowned) + '+RG.village+' Dasri village/oasis sites'});
 const CA=A.cliffAudit();
 R.push({name:'cliff-lock-contract',ok:CA.ok,detail:CA.bad.length?CA.bad.slice(0,8).join(' | '):CA.jabalCliff+' Jabal cliff sites + '+CA.vilCliff+' village ledge sites + all '+CA.protosTested+' defs verified in cliff mode (negative fails '+CA.negFailed+')'});
 const f1=A.fingerprint(),f2=A.rebuild();
 R.push({name:'deterministic',ok:f1===f2,detail:f1+' then '+f2});
 const M=A.materials();
 R.push({name:'material-records',ok:!!(M&&M.records&&M.records.filter(r=>r.lib).length>=15),detail:M?M.records.length+' records, '+M.records.filter(r=>r.lib).length+' from library':'none'});
 return R;
}"""


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    bad = False
    q = ['t=4']
    if a.only:
        q.append('only=' + a.only)
    async with verify_page(a.html, here=HERE, size=a.size, query='?' + '&'.join(q), settle_ms=0, checks=harness.SURVEY) as V:
        pg, fails = V.page, V.fails
        if not V.ready:
            print('never ready')
            fails.append('build timeout')
        try:
            await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception:
            print('textures still decoding after 120 s')
        await pg.wait_for_timeout(800)
        e = await pg.evaluate("document.getElementById('errs').textContent")
        print('ERROR PANEL:', e.strip() or '(clean)')
        print('build:', json.dumps(await pg.evaluate("window._build||null")))
        errs = list(V.errs) + ['console: ' + t for k, t in pg.krator_console if k == 'error']
        if e.strip() or errs:
            bad = True
        for x in errs[:8]:
            print('pageerror:', x)

        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:900])
                bad |= not r['ok']
            tok, tdet, _ = check_trades.trades_check(HERE)
            print(('PASS ' if tok else 'FAIL ') + 'voth-trades - ' + tdet)
            bad |= not tok
            vfound, vwhere, _, _ = check_views.scan('kits/dasri')
            vbad = [k for k in sorted(vfound) if ': VIEW-NAME ' in k]
            print(('PASS ' if not vbad else 'FAIL ') + 'view-names - ' + ('clean (no apostrophe or colon)' if not vbad else '; '.join(vbad)))
            bad |= bool(vbad)

        if a.cut:
            await pg.evaluate("cutSet(true)")
        if a.night:
            await pg.evaluate("nightSet(true)")
        if a.eval:
            print(json.dumps(await pg.evaluate(a.eval), indent=1)[:8000])
        if a.cam:
            v = [float(t) for t in a.cam.split(',')]
            await pg.evaluate("v=>setView(...v)", v)
            await pg.wait_for_timeout(900)
            await V.shot(os.path.join(a.out, 'cam.png'), view='cam')
            print('shot cam.png')

        views = parse_views(a.views, await pg.evaluate("Object.keys(VIEWS)"))
        if a.all_views:
            views = await pg.evaluate("Object.keys(VIEWS)")
        for i, vn in enumerate(views):
            ok = await pg.evaluate("n=>{if(!VIEWS[n])return false;setView(...VIEWS[n]);return true;}", vn)
            if not ok:
                print('no view', vn)
                continue
            await pg.wait_for_timeout(900)
            fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:46] + '.png')
            await V.shot(fn, view=vn)
            print('shot', fn)

        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e:
            print('ERROR PANEL after views:', e2)
            bad = True
        if bad:
            fails.append('kit checks (error panel, page errors or an assert)')
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--only')
    ap.add_argument('--cut', action='store_true')
    ap.add_argument('--night', action='store_true')
    ap.add_argument('--cam')
    ap.add_argument('--eval')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out', default='shots')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
