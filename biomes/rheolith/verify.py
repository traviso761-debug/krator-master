#!/usr/bin/env python3
"""Headless verification for biomes/rheolith (modeled on biomes/tiers/verify.py; takes harness.SURVEY checks:
items 27 samplers and 28 eye on drawn ground).

Usage:
  python3 verify.py dist/rheolith.html [--views "Graben overlook,Into the throat"] [--all-views]
                                       [--assert] [--out ./shots]
"""
import argparse, asyncio, json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness as _harness
from harness import parse_views, check_profile, verify_page, Abort

EXPORT_BOX = [-150, -150, 150, 150]
EXPORT_PROFILE = ['registry', 'items', 'materials', 'textures', 'terrain', 'stage', 'atmos', 'water']

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
{ R.push({name:'registry-and-bake-ran', ok:window._registered>0&&window._instances>0,
          detail:window._registered+' registered volumes, '+window._instances+' baked instances'}); }
return R;}"""


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    async with verify_page(a.html, here=os.path.dirname(os.path.abspath(__file__)), size=a.size, query=a.query, checks=_harness.SURVEY) as V:
        pg, errs, fails = V.page, V.errs, V.fails
        if not V.ready:
            print('timed out waiting for the kit to build')
            fails.append('build timeout')
        try:
            st = await pg.evaluate(STATS_JS)
        except Exception as e:
            print('PAGE DID NOT INITIALISE:', str(e).splitlines()[0])
            raise Abort(2)
        print('ERROR PANEL:', repr(st['errs']) if st['errs'] else 'clean')
        if st['errs']:
            fails.append('error panel not clean')
        if errs:
            print('PAGE ERRORS:', errs[:5])
            fails.append('page errors')
        print('draw calls:', st['calls'], 'triangles:', st['tris'])
        counters = st['counters']
        print('counters:', json.dumps(counters, sort_keys=True))

        if a.assert_:
            print('\n--- invariants ---')
            for r in await pg.evaluate(ASSERT_JS):
                soft = r.get('budget') and not a.strict_budget
                tag = '  PASS  ' if r['ok'] else ('  OVER  ' if soft else '  FAIL  ')
                print(tag + r['name'] + ' : ' + r['detail'])
                if not r['ok'] and not soft:
                    fails.append('assert ' + r['name'])
            prof = [s.strip() for s in a.profile.split(',') if s.strip()] if a.profile else EXPORT_PROFILE
            box = await pg.evaluate('window._api&&window._api.exportBox?window._api.exportBox:null') or EXPORT_BOX
            pok, lines = await check_profile(pg, box, prof)
            for ln in lines:
                print('  ' + ln)
            print(('  PASS  ' if pok else '  FAIL  ') + 'export-profile : box %s' % box)
            if not pok:
                fails.append('assert export-profile')

        presets = await pg.evaluate("()=>[...document.querySelectorAll('#ui button')].map(b=>b.textContent.trim())")
        views = parse_views(a.views, presets)
        if a.all_views:
            views = presets
        await V.shot(os.path.join(a.out, 'initial.png'))
        for v in views:
            ok = await pg.evaluate(
                "(v)=>{const b=[...document.querySelectorAll('#ui button')].find(b=>b.textContent.trim()===v);if(!b)return false;b.click();return true;}", v)
            if not ok:
                fails.append('view ' + v); continue
            await pg.wait_for_timeout(900)
            fn = os.path.join(a.out, 'view_' + v.replace(' ', '_').replace('/', '-') + '.png')
            await V.shot(fn, view=v)
            print('shot:', fn)
        if a.save_baseline:
            with open(a.save_baseline, 'w', encoding='utf-8', newline='\n') as fh:
                json.dump({'counters': counters, 'tris': st['tris'], 'calls': st['calls']}, fh, indent=1, sort_keys=True)
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views', default='')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--strict-budget', dest='strict_budget', action='store_true')
    ap.add_argument('--baseline', default='')
    ap.add_argument('--save-baseline', default='')
    ap.add_argument('--out', default='./shots')
    ap.add_argument('--query', default='')
    ap.add_argument('--size', default='1280x800')
    ap.add_argument('--profile', default='')
    sys.exit(asyncio.run(run(ap.parse_args())))
