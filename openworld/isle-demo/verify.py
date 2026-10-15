#!/usr/bin/env python3
"""Headless check for the isle demo's open world (settlements/isle-demo/PLAN.md, P3).

  python3 verify.py dist/isle-demo.html [--list] [--assert] [--views 0,1,14] [--out ./shots] [--size 1280x800]

The world is little-demo's (its fragments read in place), so its probe's checks (_api.hostChecks) run here too; a check
is NOT APPLICABLE while this region has none of what it checks (no biome kit yet: the flora checks; no named river, no
highway, no town tile). The isle's own checks:
  - the isle fields: every field 43-world-isles.js adds is a number at both towns, and the class weights sum to 1 on land
    (the towns are on land), 0 at sea (a point well out in the Ring Sea);
  - the towns stand on land, the climate the assay found (Kautoa Af, Walapo XA);
  - every geyser vent has its thermal ground (the 'floor' field 1 at the vent).
  - the coast (43-world-isles.js landHook): rays out from both towns cross a lagoon and then a reef crest.
Each check has a negative: the weights summed with a class removed, a town moved out to sea, a vent moved 5 km, the
coast hook switched off.
Uses tools/harness.py (the Chromium launcher, the pinned three.js). On a machine whose headless SwiftShader cannot compile
the sky's capture (ATMOS.skylight: "null ... reading 'trim'"), the page stops at start: little-demo's own page does the
same there (KNOWN_ISSUES.md); run it in the browser pane, or where little-demo's verify passes.
"""
import argparse, asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness
THREE = os.path.join(HERE, '..', '..', 'kits', 'ancients', 'three.min.js')
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# little-demo's checks and what this region must have for each to apply
APPLIES = {'flora placement is seeded by cell (order-free)': 'kits', 'nothing roots in the water or outside the region': 'kits',
           'trees keep their spacing, across tile edges': 'kits', 'the named rivers carry water to their mouths': 'rivers',
           'the highways lie on the land and keep their grade': 'roads', 'nothing grows on a highway or in a town': 'kits'}
HAS = "({kits:WORLD_KITS.length>0,rivers:(WORLD_DATA.meta.rivers||[]).length>0,roads:!!WORLD_DATA.roads,towns:!!WORLD_DATA.towns})"
ISLE = r"""(neg)=>{const R=[],M=WORLD_DATA.meta,F=WORLD.ISLE_FIELDS,KF=F.filter(f=>f.startsWith('koppen:'));
 const town=n=>{const s=M.settlements.find(q=>q.name===n);return neg==='town'&&n==='Walapo'?{x:s.x-60000,z:s.z}:{x:s.x,z:s.z};};
 const sum=A=>KF.reduce((a,f)=>a+(neg==='class'&&f==='koppen:XA'?0:A[f]),0);
 {const bad=[];for(const n of ['Kautoa','Walapo']){const p=town(n),A=WORLD.at(p.x,p.z);for(const f of F)if(typeof A[f]!=='number'||!isFinite(A[f]))bad.push(n+' '+f);
   if(Math.abs(sum(A)-1)>1e-6)bad.push(n+' weights sum '+sum(A).toFixed(3));}
  const S=WORLD.at(-60000,0);if(S.depth>0&&sum(S)!==0)bad.push('sea weights sum '+sum(S));if(!(S.depth>0))bad.push('the sea point is not at sea');
  R.push({name:'the isle fields',ok:!bad.length,detail:bad.length?bad.join('; '):F.length+' fields at both towns; the classes sum to 1 on land, 0 at sea'});}
 {const bad=[],want={Kautoa:'Af',Walapo:'XA'};for(const n in want){const p=town(n),A=WORLD.at(p.x,p.z);if(!(A.depth<0))bad.push(n+' in the water');else if(A.clim!==want[n])bad.push(n+' '+A.clim);}
  R.push({name:'the towns on land, in their climate',ok:!bad.length,detail:bad.length?bad.join('; '):'Kautoa on Af ground, Walapo on XA, both above the sea'});}
 {const bad=[];WORLD.VENTS.forEach(([x,z],i)=>{const A=WORLD.at(neg==='vent'?x+5000:x,z);if(A.floor<.99)bad.push('vent '+(i+1)+' floor '+A.floor.toFixed(2));});
  R.push({name:'every vent has its thermal ground',ok:!bad.length&&WORLD.VENTS.length>0,detail:bad.length?bad.join('; '):WORLD.VENTS.length+' vents, the floor field 1 at each'});}
 {const keep=WORLD.landHook;if(neg==='coast')WORLD.landHook=null;let rays=0,reefs=0;
  try{for(const n of ['Kautoa','Walapo'])for(let a=0;a<24;a++){const s=town(n),dx=Math.cos(a/24*Math.PI*2),dz=Math.sin(a/24*Math.PI*2);let sea=false,lag=false,crest=false;
    for(let r=0;r<16000&&!crest;r+=100){const d=WORLD.lakeWater(s.x+dx*r,s.z+dz*r)-WORLD.H(s.x+dx*r,s.z+dz*r);
     if(!sea){if(d>0)sea=true;else continue;}if(d>1.5&&d<3.2)lag=true;else if(lag&&d>0&&d<.8)crest=true;else if(d>40)break;}
    rays++;if(crest)reefs++;}}finally{WORLD.landHook=keep;}
  R.push({name:'the coast: a lagoon behind a reef crest',ok:reefs>=4,detail:reefs+' of '+rays+' rays from the towns cross a lagoon (1.5-3.2 m) then a crest (under 0.8 m)'});}
 return R;}"""


async def run(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html))
    fails = []
    os.makedirs(a.out, exist_ok=True)
    with harness.serve(folder) as port:
        async with async_playwright() as p:
            b = await harness.launch_chromium(p)
            W, H = [int(t) for t in a.size.split('x')]
            pg = await b.new_page(viewport={'width': W, 'height': H})
            pg.set_default_timeout(900000)
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            if os.path.exists(THREE):
                await pg.route('**/three.min.js', lambda r: asyncio.ensure_future(r.fulfill(path=THREE, content_type='application/javascript')))
            await pg.goto('http://127.0.0.1:%d/%s' % (port, name))
            await pg.wait_for_function("(typeof CAM==='object'&&CAM&&window._api)||(document.getElementById('errs')&&document.getElementById('errs').textContent.length>0)", timeout=600000)
            panel = await pg.evaluate("document.getElementById('errs').textContent")
            if panel:
                print('ERROR PANEL:', panel[:1500]); await b.close(); print('\nFAILED: error panel'); return 1
            if a.list:
                print('\n'.join(await pg.evaluate('_api.views()'))); await b.close(); return 0
            print('settle:', json.dumps(await pg.evaluate('_api.settle(240000)')))
            if a.assert_:
                has = await pg.evaluate(HAS)
                print('--- the world\'s checks (little-demo\'s probe) ---')
                for r in await pg.evaluate('_api.hostChecks()'):
                    need = APPLIES.get(r['name'])
                    if need and not has[need]:
                        print('  n/a   ' + r['name'] + ' : this region has no ' + need + ' yet'); continue
                    print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                    if not r['ok']: fails.append(r['name'])
                print('--- the isle\'s checks ---')
                for r in await pg.evaluate(ISLE, None):
                    print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                    if not r['ok']: fails.append(r['name'])
                print('--- negative controls (each must fail) ---')
                for neg, nm in (('class', 'the isle fields'), ('town', 'the towns on land, in their climate'), ('vent', 'every vent has its thermal ground'), ('coast', 'the coast: a lagoon behind a reef crest')):
                    r = [x for x in await pg.evaluate(ISLE, neg) if x['name'] == nm][0]
                    print(('  PASS  ' if not r['ok'] else '  MISSED') + nm + ' (' + neg + ') : ' + r['detail'])
                    if r['ok']: fails.append('negative ' + neg)
            for v in [int(t) for t in a.views.split(',') if t.strip()]:
                await pg.evaluate('_api.go(%d)' % v)
                s = await pg.evaluate('_api.settle(240000)')
                out = os.path.join(a.out, 'view%02d.png' % v)
                await pg.screenshot(path=out)
                print('view %d: %s  settle %s' % (v, out, s.get('ms') if isinstance(s, dict) else s))
            panel = await pg.evaluate("document.getElementById('errs').textContent")
            if panel: print('ERROR PANEL (after):', panel[:1500]); fails.append('error panel')
            if errs: print('PAGE ERRORS:', errs[:5]); fails.append('page errors')
            await b.close()
    print('\nOK' if not fails else '\nFAILED: ' + ', '.join(fails))
    return 1 if fails else 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views', default='')
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out', default='./shots')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
