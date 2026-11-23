#!/usr/bin/env python3
"""Headless Chromium verification for biomes/springhollows (takes harness.SURVEY checks: samplers < 15, eye on drawn ground, water-mouths, leaf-stems).

Usage:
  python3 biomes/springhollows/verify.py --assert --no-cache
      Runs tests/test-springhollows.js + verifies all 4 stations (spring, shutin, fenestre, glade).
  python3 biomes/springhollows/verify.py dist/springhollows.html --assert [--all-views]
  python3 biomes/springhollows/verify.py --station fenestre --assert
"""
import argparse
import asyncio
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness as _harness  # noqa: E402  (top-level import enables stall watchdog & verify cache)
from harness import parse_views, check_profile, verify_page, Abort  # noqa: E402

EXPORT_BOX = [-140, -140, 140, 140]
EXPORT_PROFILE = ['registry', 'items', 'buckets', 'materials', 'textures', 'terrain', 'stage', 'atmos', 'water']
STATIONS = [
    ('spring', 'springhollows.html'),
    ('shutin', 'springhollows-shutin.html'),
    ('fenestre', 'springhollows-fenestre.html'),
    ('glade', 'springhollows-glade.html'),
]

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

STATS_JS = """()=>{const w={};for(const k of Object.keys(window)){if(!k.startsWith('_')||k==='__THREE__')continue;
 const v=window[k];if(typeof v==='function'||typeof v==='object'&&v&&!Array.isArray(v)&&k==='_api')continue;
 let s=null;try{s=JSON.stringify(v);}catch(e){continue;}w[k]=(s&&s.length<600)?v:'(large)';}
return {errs:document.getElementById('errs')?document.getElementById('errs').textContent:'(no #errs)',
        calls:renderer.info.render.calls,tris:renderer.info.render.triangles,counters:w};}"""

ASSERT_JS = r"""()=>{
const A=window._api; if(!A) return [{name:'probe',ok:false,detail:'window._api missing'}];
const R=[];
{ const occ=A.regOccupancy(); const empty=occ.filter(o=>o.n===0);
  const thin=occ.filter(o=>o.n>0).sort((a,b)=>a.n-b.n).slice(0,3).map(o=>o.name+' ('+o.n+')').join(', ');
  R.push({name:'registered-volumes-non-empty', ok:!empty.length,
          detail: empty.length ? empty.length+' empty of '+occ.length+': '+empty.slice(0,6).map(e=>e.name).join(' | ')
                               : occ.length+' volumes; thinnest: '+thin}); }
{ const n=A.nanSweep();
  R.push({name:'no-nan-geometry', ok:n.meshes===0&&n.instances===0,
          detail: (n.meshes||n.instances) ? n.instances+' instanced items, '+n.meshes+' meshes' : 'clean'}); }
{ const ts=A.typeStats(); const over=Object.keys(ts).filter(k=>ts[k].over).sort((a,b)=>ts[b].tris-ts[a].tris);
  const worst=Object.keys(ts).sort((a,b)=>ts[b].tris-ts[a].tris)[0];
  R.push({name:'per-type-triangle-budget', ok:!over.length, budget:true,
          detail: over.length ? over.map(k=>k+' '+ts[k].tris+' > '+ts[k].limit+' ('+ts[k].cls+')').join(' | ')
                              : Object.keys(ts).length+' type/decay pairs, heaviest '+(worst||'none')}); }
{ const T=A.totals, B=A.BUDGET.showcase;
  R.push({name:'showcase-triangle-budget', ok:T.tris<=B.tris, budget:true, detail:T.tris+' / '+B.tris+' scene triangles'});
  R.push({name:'showcase-draw-calls', ok:renderer.info.render.calls<=B.calls, budget:true,
          detail:renderer.info.render.calls+' / '+B.calls+' draw calls at this camera'}); }
if(A.hostChecks){ for(const c of A.hostChecks()) R.push({name:c.name, ok:c.ok, detail:c.detail});
  for(const n of A.hostNegatives()) R.push({name:'negative: '+n.name, ok:n.failed,
    detail:(n.failed?'fails as it must: ':'PASSED A BROKEN INPUT: ')+n.detail}); }
{ R.push({name:'window-springhollows-api', ok:!!(window.SPRINGHOLLOWS&&window.SPRINGHOLLOWS.SPECIES&&window.SPRINGHOLLOWS.SPECIES.length===8),
          detail:window.SPRINGHOLLOWS?('SPRINGHOLLOWS.SPECIES='+window.SPRINGHOLLOWS.SPECIES.length):'missing window.SPRINGHOLLOWS'}); }
{ R.push({name:'registry-and-bake-ran', ok:window._registered>0&&window._instances>0,
          detail:window._registered+' registered volumes, '+window._instances+' baked instances'}); }
return R;}"""


async def run_one(html_path, out_dir, a):
    os.makedirs(out_dir, exist_ok=True)
    sw = not _harness.is_gpu()
    print('\n=== VERIFYING %s ===' % os.path.relpath(html_path, HERE).replace(os.sep, '/'), flush=True)
    async with verify_page(html_path, here=HERE, size=a.size, query=a.query, settle_ms=0 if sw else 2500, checks=_harness.SURVEY) as V:
        pg, errs, fails = V.page, V.errs, V.fails
        if not V.ready:
            print('timed out waiting for the kit to build', flush=True)
            fails.append('build timeout')
        try:
            await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception:
            print('textures still decoding after 120 s', flush=True)
        if sw:
            await pg.evaluate("()=>{if(!window.__origRAF){const _r=window.__origRAF=window.requestAnimationFrame.bind(window);"
                              "window.__drawNow=()=>new Promise(res=>_r(t=>{if(window.__frameFn)window.__frameFn(t);_r(()=>res());}));"
                              "window.requestAnimationFrame=cb=>{window.__frameFn=cb;return 0;};}}")
            await pg.evaluate("()=>window.__drawNow()")
        try:
            st = await pg.evaluate(STATS_JS)
        except Exception as e:
            print('PAGE DID NOT INITIALISE:', str(e).splitlines()[0], flush=True)
            raise Abort(2)
        print('ERROR PANEL:', repr(st['errs']) if st['errs'] else 'clean', flush=True)
        if st['errs']:
            fails.append('error panel not clean')
        if errs:
            print('PAGE ERRORS:', errs[:5], flush=True)
            fails.append('page errors')
        print('draw calls:', st['calls'], 'triangles:', st['tris'], flush=True)
        counters = st['counters']
        print('counters:', json.dumps(counters, sort_keys=True), flush=True)

        if a.assert_:
            print('\n--- invariants ---', flush=True)
            for r in await pg.evaluate(ASSERT_JS):
                soft = r.get('budget') and not a.strict_budget
                tag = '  PASS  ' if r['ok'] else ('  OVER  ' if soft else '  FAIL  ')
                print(tag + r['name'] + ' : ' + r['detail'], flush=True)
                if not r['ok'] and not soft:
                    fails.append('assert ' + r['name'])
            sprof = await pg.evaluate('()=>window._api&&window._api.exportProfile?window._api.exportProfile:null')
            prof = [s.strip() for s in a.profile.split(',') if s.strip()] if a.profile else (sprof or EXPORT_PROFILE)
            box = await pg.evaluate('()=>window._api&&window._api.exportBox?window._api.exportBox:null') or EXPORT_BOX
            pok, lines = await check_profile(pg, box, prof)
            for ln in lines:
                print('  ' + ln, flush=True)
            print(('  PASS  ' if pok else '  FAIL  ') + 'export-profile : box %s' % box, flush=True)
            if not pok:
                fails.append('assert export-profile')

        presets = await pg.evaluate("()=>[...document.querySelectorAll('#ui button')].map(b=>b.textContent.trim())")
        views = parse_views(a.views, presets)
        if a.all_views:
            views = presets[:6]

        if sw:
            await pg.evaluate("()=>window.__drawNow()")
        await V.shot(os.path.join(out_dir, 'initial.png'))
        print('shot:', os.path.join(out_dir, 'initial.png'), flush=True)
        for v in views:
            ok = await pg.evaluate(
                "(v)=>{const b=[...document.querySelectorAll('#ui button')].find(b=>b.textContent.trim()===v);if(!b)return false;b.click();return true;}",
                v
            )
            if not ok:
                fails.append('view ' + v)
                continue
            if sw:
                await pg.evaluate("()=>window.__drawNow()")
            else:
                await pg.wait_for_timeout(750)
            fn = os.path.join(out_dir, 'view_' + v.replace(' ', '_').replace('/', '-') + '.png')
            await V.shot(fn, view=v)
            print('shot:', fn, flush=True)
        if a.save_baseline:
            with open(a.save_baseline, 'w', encoding='utf-8', newline='\n') as fh:
                json.dump({'counters': counters, 'tris': st['tris'], 'calls': st['calls']}, fh, indent=1, sort_keys=True)
    return V.exit()


async def run(a):
    rc = 0
    if not a.html and not a.station:
        tscript = os.path.join(HERE, 'tests', 'test-springhollows.js')
        if os.path.isfile(tscript):
            print('=== NODE TESTS: tests/test-springhollows.js ===', flush=True)
            tr = subprocess.run(['node', tscript])
            if tr.returncode != 0:
                rc |= 1
        for st_name, fname in STATIONS:
            p = os.path.join(HERE, 'dist', fname)
            if not os.path.isfile(p):
                print('MISSING BUILT PAGE:', p, flush=True)
                rc |= 1
                continue
            rc |= await run_one(p, os.path.join(a.out, st_name), a)
        return rc
    if a.station:
        st_key = 'glade' if a.station == 'labyrinth' else a.station
        fname = 'springhollows.html' if st_key == 'spring' else 'springhollows-%s.html' % st_key
        return await run_one(os.path.join(HERE, 'dist', fname), os.path.join(a.out, st_key), a)
    return await run_one(a.html, a.out, a)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html', nargs='?', default='')
    ap.add_argument('--station', default='')
    ap.add_argument('--views', default='')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--strict-budget', dest='strict_budget', action='store_true')
    ap.add_argument('--baseline', default='')
    ap.add_argument('--save-baseline', default='')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    ap.add_argument('--query', default='')
    ap.add_argument('--size', default='1280x800')
    ap.add_argument('--profile', default='')
    sys.exit(asyncio.run(run(ap.parse_args())))
