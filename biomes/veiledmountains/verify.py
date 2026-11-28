#!/usr/bin/env python3
"""Headless Chromium verification for biomes/veiledmountains (takes harness.SURVEY checks: samplers < 15, eye on drawn ground, water-mouths, leaf-stems).

Usage:
  python3 biomes/veiledmountains/verify.py --assert --no-cache
      Runs tests/test-veil.js + verifies all 5 stations (hall, gorge, kanopi, veilpass, southvale).
  python3 biomes/veiledmountains/verify.py dist/veiledmountains.html --assert [--all-views]
  python3 biomes/veiledmountains/verify.py --station kanopi --assert
"""
import argparse
import asyncio
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness as _harness  # noqa: E402
from harness import parse_views, check_profile, verify_page, Abort  # noqa: E402

EXPORT_BOX = [-140, -140, 140, 140]
EXPORT_PROFILE = ['registry', 'items', 'buckets', 'materials', 'textures', 'terrain', 'stage', 'atmos', 'water']
STATIONS = [
    ('hall', 'veiledmountains.html'),
    ('gorge', 'veiledmountains-gorge.html'),
    ('kanopi', 'veiledmountains-kanopi.html'),
    ('veilpass', 'veiledmountains-veilpass.html'),
    ('southvale', 'veiledmountains-southvale.html'),
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
{ const reqKeys=['veilcedar','sitkaspruce','clubmaple','cloudoak','umbrellaelm','veilfern','sporespike','crimsonchalice','tankstrap','veilcomb','clubdrape','pillowmoss','swordfern','devilsclub','slidealder','furlarch','krumm'];
  const bk=window.VEIL&&window.VEIL.byKey||{};
  const missK=reqKeys.filter(k=>!bk[k]||!bk[k].tags||!bk[k].tags.harvest);
  R.push({name:'window-veil-api', ok:!!(window.VEIL&&window.VEIL.SPECIES&&window.VEIL.SPECIES.length>=16&&!missK.length),
          detail:window.VEIL?('VEIL.SPECIES='+window.VEIL.SPECIES.length+(missK.length?' missing:'+missK.join(','):'')):'missing window.VEIL'}); }
{ R.push({name:'registry-and-bake-ran', ok:window._registered>0&&window._instances>0,
          detail:window._registered+' registered volumes, '+window._instances+' baked instances'}); }
return R;}"""


SW_RAF_INIT_JS = """(()=>{
 if(window.__origRAF)return;
 const _r=window.__origRAF=window.requestAnimationFrame.bind(window);
 let _f=0;
 window.__rafPaused=false;
 window.requestAnimationFrame=cb=>{
  window.__frameFn=cb;
  if(window.__rafPaused)return 0;
  if(_f<1){_f++;return _r(cb);}
  window.__rafPaused=true;
  return 0;
 };
 window.__drawOnce=()=>{
  if(typeof SKY!=='undefined'&&SKY.draw)SKY.draw();
  else if(window.__frameFn)window.__frameFn(performance.now());
  _r(()=>{});
 };
})();"""


async def run_one(html_path, out_dir, a):
    import tempfile
    os.makedirs(out_dir, exist_ok=True)
    sw = not _harness.is_gpu()
    sw_init_path = None
    if sw:
        fd, sw_init_path = tempfile.mkstemp(prefix='krator_veil_sw_', suffix='.js')
        with os.fdopen(fd, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(SW_RAF_INIT_JS)
    print('\n=== VERIFYING %s ===' % os.path.relpath(html_path, HERE).replace(os.sep, '/'), flush=True)
    try:
        async with verify_page(
            html_path,
            here=HERE,
            size=a.size,
            query=a.query,
            init=(sw_init_path,) if sw_init_path else (),
            settle_ms=0 if sw else 2500,
            checks=_harness.SURVEY,
        ) as V:
            pg, errs, fails = V.page, V.errs, V.fails
            if not V.ready:
                print('timed out waiting for the kit to build', flush=True)
                fails.append('build timeout')
            try:
                await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
            except Exception:
                print('textures still decoding after 120 s', flush=True)
            if sw:
                await pg.evaluate("()=>window.__drawOnce&&window.__drawOnce()")
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
                if sw:
                    await pg.evaluate('([c,t])=>{if(typeof renderer!=="undefined"&&renderer.info){renderer.info.render.calls=c;renderer.info.render.triangles=t;}}', [st['calls'], st['tris']])
                for ln in lines:
                    print('  ' + ln, flush=True)
                print(('  PASS  ' if pok else '  FAIL  ') + 'export-profile : box %s' % box, flush=True)
                if not pok:
                    fails.append('assert export-profile')

            presets = await pg.evaluate("()=>[...document.querySelectorAll('#ui button')].map(b=>b.textContent.trim())")
            views = parse_views(a.views, presets)
            if a.all_views:
                views = presets[:6]

            async def take_shot(fn, view_name=None, redraw=True):
                if sw:
                    if redraw:
                        await pg.evaluate("()=>window.__drawOnce&&window.__drawOnce()")
                    else:
                        await pg.evaluate("()=>window.__origRAF&&window.__origRAF(()=>{})")
                await V.shot(fn, view=view_name)
                print('shot:', fn, flush=True)

            await take_shot(os.path.join(out_dir, 'initial.png'), redraw=False)
            for v in views:
                ok = await pg.evaluate(
                    "(v)=>{const b=[...document.querySelectorAll('#ui button')].find(b=>b.textContent.trim()===v);if(!b)return false;b.click();return true;}",
                    v
                )
                if not ok:
                    fails.append('view ' + v)
                    continue
                if not sw:
                    await pg.wait_for_timeout(750)
                fn = os.path.join(out_dir, 'view_' + v.replace(' ', '_').replace('/', '-') + '.png')
                await take_shot(fn, view_name=v, redraw=True)
            if a.save_baseline:
                with open(a.save_baseline, 'w', encoding='utf-8', newline='\n') as fh:
                    json.dump({'counters': counters, 'tris': st['tris'], 'calls': st['calls']}, fh, indent=1, sort_keys=True)
        return V.exit()
    finally:
        if sw_init_path and os.path.isfile(sw_init_path):
            try:
                os.remove(sw_init_path)
            except OSError:
                pass


async def run(a):
    rc = 0
    if not a.html and not a.station:
        tscript = os.path.join(HERE, 'tests', 'test-veil.js')
        if os.path.isfile(tscript):
            print('=== NODE TESTS: tests/test-veil.js ===', flush=True)
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
        st_key = a.station
        fname = 'veiledmountains.html' if st_key == 'hall' else 'veiledmountains-%s.html' % st_key
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
