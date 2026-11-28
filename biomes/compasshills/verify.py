#!/usr/bin/env python3
"""Headless verification for biomes/compasshills via shared tools/harness.py (SURVEY checks: < 15 samplers, eye on drawn ground).

Usage:
  python3 biomes/compasshills/verify.py --assert --no-cache
      Runs Node unit tests + verifies dist/compasshills.html, dist/compasshills-tors.html,
      dist/compasshills-cuesta.html, and dist/compasshills-gorge.html.
  python3 biomes/compasshills/verify.py dist/compasshills.html --assert [--all-views]
  python3 biomes/compasshills/verify.py --station tors --assert
"""
import argparse, asyncio, json, os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
if not os.environ.get('KRATOR_CHROME') and os.path.exists('/usr/bin/chromium'):
    os.environ['KRATOR_CHROME'] = '/usr/bin/chromium'
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness as _harness                          # noqa: E402  (top-level import enables watchdog & verify cache)
from harness import parse_views, check_profile, verify_page, Abort  # noqa: E402

EXPORT_BOX = [-180, -180, 180, 180]
EXPORT_PROFILE = ['registry', 'items', 'buckets', 'materials', 'textures', 'terrain', 'stage', 'atmos', 'water']

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
{ R.push({name:'window-compass-api', ok:!!(window.COMPASS&&window.COMPASS.SPECIES&&window.COMPASS.SPECIES.length===25&&window.COMPASS_PHYS),
          detail:window.COMPASS?('COMPASS.SPECIES='+window.COMPASS.SPECIES.length):'missing window.COMPASS'}); }
{ R.push({name:'registry-and-bake-ran', ok:window._registered>0&&window._instances>0,
          detail:window._registered+' registered volumes, '+window._instances+' baked instances'}); }
return R;}"""


async def run_one(html_path, out_dir, a):
    t0 = time.time()
    os.makedirs(out_dir, exist_ok=True)
    print('\n=== VERIFYING %s ===' % os.path.relpath(html_path, HERE).replace(os.sep, '/'), flush=True)
    sw = not _harness.is_gpu()
    async with verify_page(html_path, here=HERE, size=a.size, query=a.query, settle_ms=0 if sw else 2500, checks=_harness.SURVEY) as V:
        print('[+%.1fs] page opened (ready=%s)' % (time.time() - t0, V.ready), flush=True)
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
        print('[+%.1fs] ERROR PANEL: %s' % (time.time() - t0, repr(st['errs']) if st['errs'] else 'clean'), flush=True)
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
            print('[+%.1fs] asserts evaluated; checking export profile...' % (time.time() - t0), flush=True)
            sprof = await pg.evaluate('()=>window._api&&window._api.exportProfile||null')
            prof = [s.strip() for s in a.profile.split(',') if s.strip()] if a.profile else (sprof or EXPORT_PROFILE)
            box = await pg.evaluate('()=>window._api&&window._api.exportBox||null') or EXPORT_BOX
            pok, lines = await check_profile(pg, box, prof)
            for ln in lines:
                print('  ' + ln, flush=True)
            print(('  PASS  ' if pok else '  FAIL  ') + 'export-profile : box %s' % box, flush=True)
            if not pok:
                fails.append('assert export-profile')

        presets = await pg.evaluate("()=>[...document.querySelectorAll('#viewsel option')].map(o=>o.textContent.trim())")
        if not presets:
            presets = await pg.evaluate("()=>[...document.querySelectorAll('#ui div button')].map(b=>b.textContent.trim())")
        views = presets if a.all_views else parse_views(a.views, presets)
        print('[+%.1fs] taking shots (%s)...' % (time.time() - t0, views), flush=True)
        if sw:
            await pg.evaluate("()=>window.__drawNow()")
        await V.shot(os.path.join(out_dir, 'initial.png'))
        for v in views:
            ok = await pg.evaluate(
                "(v)=>{const b=[...document.querySelectorAll('#ui div button, #ui button')].find(b=>b.textContent.trim()===v);if(!b)return false;b.click();return true;}",
                v
            )
            if not ok:
                fails.append('view ' + v)
                continue
            if sw:
                await pg.evaluate("()=>window.__drawNow()")
            else:
                await pg.wait_for_timeout(450)
            fn = os.path.join(out_dir, 'view_' + v.replace(' ', '_').replace('/', '-') + '.png')
            await V.shot(fn, view=v)
            print('[+%.1fs] shot: %s' % (time.time() - t0, fn), flush=True)
        if a.save_baseline:
            with open(a.save_baseline, 'w', encoding='utf-8', newline='\n') as fh:
                json.dump({'counters': counters, 'tris': st['tris'], 'calls': st['calls']}, fh, indent=1, sort_keys=True)
    return V.exit()


async def run(a):
    rc = 0
    dist = os.path.join(HERE, 'dist')
    if a.html:
        return await run_one(a.html, a.out, a)
    if a.station:
        fname = 'compasshills.html' if a.station == 'foundry' else ('compasshills-%s.html' % a.station)
        return await run_one(os.path.join(dist, fname), os.path.join(a.out, a.station), a)

    tscript = os.path.join(HERE, 'tests', 'test-compasshills.js')
    if os.path.isfile(tscript):
        print('=== NODE TESTS: tests/test-compasshills.js ===', flush=True)
        tr = subprocess.run(['node', tscript])
        if tr.returncode != 0:
            rc |= 1
    pages = [
        ('foundry', os.path.join(dist, 'compasshills.html')),
        ('tors', os.path.join(dist, 'compasshills-tors.html')),
        ('cuesta', os.path.join(dist, 'compasshills-cuesta.html')),
        ('gorge', os.path.join(dist, 'compasshills-gorge.html')),
    ]
    for st_name, p in pages:
        if not os.path.isfile(p):
            print('MISSING BUILT PAGE:', p, flush=True)
            rc |= 1
            continue
        rc |= await run_one(p, os.path.join(a.out, st_name), a)
    return rc


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
