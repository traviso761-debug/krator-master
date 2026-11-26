#!/usr/bin/env python3
"""Verify the Pinnacle region of the open world (openworld/PLAN-SITES.md, the first site).

    python3 verify.py dist/pinnacle.html --assert [--views 0,1,2] [--out DIR]
    python3 verify.py dist/pinnacle.html --list

On the GPU (KRATOR_GL=gpu, under tools/harness.py lock --lane auto) the harness's universal asserts name the renderer.
The checks, each with a negative:
  - the world's own (core/world/91-world-probe.js, round the site): order-free seeding, the land continuous, nothing
    rooted in water or outside the region, spacing across tiles, the highways (here the bands' tracks) on the land at
    their grade, nothing growing on a track or a cleared place, no NaN;
  - the region: the site where the cut put it (WORLD_DATA.meta.sites: Pinnacle Rock at map px 1007,686 since the owner's
    move of 2026-11-10, the frame's origin), on dry land in the savage hyperjungle, and its kit growing there (the
    negative reads the site 40 km off, out of the cut);
  - the sites (core/world/88s-world-sites.js _sites.checks): the baked plan is the plan made again in the browser (the
    negative changes the world seed), every camp whole and apart on good ground with its track at its gate (the negative
    stacks two tents), every camp cleared of flora, tagged and drawn with the kit's pieces (the negative reads the world
    without the camps' clearing).
Uses tools/harness.py (verify_page: the Chromium launcher, the local three.js, the universal asserts).
"""
import argparse, asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness  # noqa: F401
from harness import verify_page, Abort
sys.path.insert(0, os.path.join(HERE, '..', '..', 'core', 'world'))
import verify_world as VW  # noqa: E402  (the resources' and proposals' checks every region shares)
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

APPLIES = {'flora placement is seeded by cell (order-free)': 'kits', 'nothing roots in the water or outside the region': 'kits',
           'trees keep their spacing, across tile edges': 'kits', 'the named rivers carry water to their mouths': 'rivers',
           'the highways lie on the land and keep their grade': 'roads', 'nothing grows on a highway or in a town': 'kits'}
HAS = "({kits:WORLD_KITS.length>0,rivers:(WORLD_DATA.meta.rivers||[]).length>0,roads:!!WORLD_DATA.roads,towns:!!WORLD_DATA.towns})"
REGION = r"""(neg)=>{const R=[],M=WORLD_DATA.meta,S=(M.sites||[])[0],bad=[],HJ=WORLD_KITS.findIndex(k=>k.name==='hyperjungle');
 if(!S)bad.push('no site in region.json');else{const x=neg==='site'?S.x+40000:S.x,z=S.z;
  if(S.id!=='staiytii0y')bad.push('the site is '+S.id);if(S.px!==1007||S.py!==686)bad.push('the site at px '+S.px+','+S.py);
  if(!WORLD.inside(x,z))bad.push('the site outside the cut');else{const A=WORLD.at(x,z);if(!(A.depth<0))bad.push('the site in water');
   const b=WORLD.biomeAt(x,z);if(!b||b.name.toLowerCase()!=='savage hyperjungle')bad.push('the site in '+(b&&b.name));
   if(!(WORLD.kitW(HJ,x,z)>.5))bad.push('the hyperjungle kit weighs '+WORLD.kitW(HJ,x,z).toFixed(2)+' there');}}
 R.push({name:'the region: the site where the cut put it, on dry land in the savage hyperjungle, its kit growing there',ok:!bad.length,
  detail:bad.length?bad.join('; '):S.name+' ('+S.id+') at px '+S.px+','+S.py+', the frame\'s origin; '+WORLD.biomeAt(S.x,S.z).name+', the hyperjungle kit weighs '+WORLD.kitW(HJ,S.x,S.z).toFixed(2)});
 return R;}"""


def say(r, neg=None):
    if neg is None:
        print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
        return not r['ok']
    print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (' + neg + ') ' + r['name'] + ' : ' + r['detail'])
    return r['ok']


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    async with verify_page(a.html, here=HERE, size=a.size, settle_ms=0,
                           ready_js="typeof CAM==='object'&&CAM&&window._api&&window._sites") as V:
        pg, errs, fails = V.page, V.errs, V.fails
        pg.set_default_timeout(900000)
        if not V.ready:
            print('timed out waiting for the page to build'); fails.append('build timeout')
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        if panel:
            print('ERROR PANEL:', panel[:1500]); fails.append('error panel'); raise Abort(1)
        if a.list:
            print('\n'.join(await pg.evaluate('_api.views()'))); raise Abort(0)
        print('settle:', json.dumps(await pg.evaluate('_api.settle(240000)')))
        if a.assert_:
            has = await pg.evaluate(HAS)
            # the world's checks read the flora round the camera: over the floor south-east of the rock, settled
            await pg.evaluate("(()=>{const S=WORLD_DATA.meta.sites[0];CAM.setView(S.x+1500,S.z+1500,300,.78,-.2);})()")
            await pg.evaluate('_api.settle(240000)')
            print("--- the world's checks (core/world/91-world-probe.js, round the site) ---")
            for r in await pg.evaluate('_api.hostChecks()'):
                need = APPLIES.get(r['name'])
                if need and not has[need]:
                    print('  n/a   ' + r['name'] + ' : this region has no ' + need + ' yet'); continue
                if say(r): fails.append(r['name'])
            print('--- the region ---')
            for neg in (None, 'site'):
                for r in await pg.evaluate(REGION, neg):
                    if say(r, neg): fails.append(('negative ' + neg + ' ' if neg else '') + r['name'])
            print('--- the sites (core/world 48s, 88s: the baked plan) ---')
            for r in await pg.evaluate('_sites.checks()'):
                if say(r): fails.append(r['name'])
            for neg, key in (('plan', 'the baked plan'), ('ground', "on the world's ground"), ('clear', 'cleared of flora')):
                r = [x for x in await pg.evaluate('_sites.checks(%r)' % neg) if key in x['name']][0]
                if say(r, neg): fails.append('negative ' + neg)
        if a.assert_:
            await VW.resources(pg, V, a.out, fails)
        for v in [int(t) for t in a.views.split(',') if t.strip()]:
            await pg.evaluate('_api.go(%d)' % v)
            s = await pg.evaluate('_api.settle(240000)')
            out = os.path.join(a.out, 'view%02d.png' % v)
            await V.shot(out, view='view%02d' % v)
            print('view %d: %s  settle %s' % (v, out, s.get('ms') if isinstance(s, dict) else s))
        panel = await pg.evaluate("document.getElementById('errs').textContent")
        if panel: print('ERROR PANEL (after):', panel[:1500]); fails.append('error panel')
        if errs: print('PAGE ERRORS:', errs[:5]); fails.append('page errors')
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views', default='')
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out', default='./shots')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
