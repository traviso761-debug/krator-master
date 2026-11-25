#!/usr/bin/env python3
"""Headless & GPU verification for settlements/floating-city via shared tools/harness.py."""
import argparse
import asyncio
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness as _harness  # noqa: E402
from harness import STATS_JS, parse_views, verify_page, Abort  # noqa: E402

DEFAULT_HTML = os.path.join(HERE, 'dist', 'floating-city.html')

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ASSERT_JS = r"""()=>{
const A = window._api;
if (!A) return [{name:'probe', ok:false, detail:'window._api missing'}];
const R = [];
if (A.nanSweep) {
  const n = A.nanSweep();
  R.push({name:'no-nan-geometry', ok:n.meshes===0&&n.instances===0,
          detail:(n.meshes||n.instances)?(n.instances+' instanced, '+n.meshes+' meshes'):'clean'});
}
if (A.hostChecks) {
  for (const c of A.hostChecks()) R.push({name:c.name, ok:c.ok, detail:c.detail});
}
if (A.hostNegatives) {
  for (const n of A.hostNegatives()) R.push({name:'negative '+n.name, ok:n.failed,
    detail:(n.failed?'fails as it must: ':'PASSED A BROKEN INPUT: ')+n.detail});
}
const tagCount = (typeof KTAGS !== 'undefined' && KTAGS.page && KTAGS.page.query) ? KTAGS.page.query({}).length : 0;
R.push({name:'tags-registered', ok:tagCount >= 180, detail:tagCount + ' KTAGS records'});
return R;
}"""


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    html_path = a.html or DEFAULT_HTML
    sw = not _harness.is_gpu()
    async with verify_page(html_path, here=HERE, size=a.size, settle_ms=0 if sw else 2200, checks=_harness.SURVEY) as V:
        pg, errs, fails = V.page, V.errs, V.fails
        if not V.ready:
            print('timed out waiting for floating-city to build', flush=True)
            fails.append('build timeout')
        try:
            await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception:
            print('textures still decoding after 120 s', flush=True)
        await pg.evaluate("()=>{if(typeof FC_WORLD!=='undefined'&&FC_WORLD.ensureAtlasBuilt)FC_WORLD.ensureAtlasBuilt();}")
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
        print('counters:', json.dumps(st['counters'], sort_keys=True), flush=True)

        if a.assert_:
            print('\n--- invariants ---', flush=True)
            for r in await pg.evaluate(ASSERT_JS):
                soft = r.get('budget') and not a.strict_budget
                tag = '  PASS  ' if r['ok'] else ('  OVER  ' if soft else '  FAIL  ')
                print(tag + r['name'] + ' : ' + r['detail'], flush=True)
                if not r['ok'] and not soft:
                    fails.append('assert ' + r['name'])

        presets = await pg.evaluate("()=>typeof VIEWS!=='undefined'?Object.keys(VIEWS):[]")
        views = presets if a.all_views else (
            parse_views(a.views, presets) if a.views else [
                'overview', 'sumeru-mandala-aerial', 'suudme-tooka-pontoons',
                'lower-ria-naga-canal', 'bluff-waterfalls-hoists', 'amber-seal-suudme-bluff'
            ]
        )
        if sw:
            await pg.evaluate("()=>window.__drawNow()")
        await V.shot(os.path.join(a.out, 'initial.png'))
        print('shot: %s' % os.path.join(a.out, 'initial.png'), flush=True)
        for v in views[:8]:
            try:
                await pg.evaluate("(v)=>{if(typeof KHOST!=='undefined'&&KHOST.go)KHOST.go(v);"
                                  "if(typeof FC_WORLD!=='undefined'&&FC_WORLD.setSubmarineCut)FC_WORLD.setSubmarineCut(v==='submarine-kolk-gallery');}", v)
                if sw:
                    await pg.evaluate("()=>window.__drawNow()")
                else:
                    await pg.wait_for_timeout(450)
                fn = os.path.join(a.out, 'view_' + v.replace(' ', '_').replace('/', '-') + '.png')
                await V.shot(fn, view=v)
                print('shot: %s' % fn, flush=True)
            except Exception as e:
                print('view failed:', v, e, flush=True)
                fails.append('view ' + v)
        await pg.evaluate("()=>{if(typeof FC_WORLD!=='undefined'&&FC_WORLD.setSubmarineCut)FC_WORLD.setSubmarineCut(false);}")
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html', nargs='?', default=DEFAULT_HTML)
    ap.add_argument('--views', default='')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--strict-budget', dest='strict_budget', action='store_true')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
