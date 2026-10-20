#!/usr/bin/env python3
"""Headless check for the isle demo's open world (settlements/isle-demo/PLAN.md, P3).

  python3 verify.py dist/isle-demo.html [--list] [--assert] [--views 0,1,14] [--out ./shots] [--size 1280x800]

The world is little-demo's (its fragments read in place), so its probe's checks (_api.hostChecks) run here too; a check
is NOT APPLICABLE while this region has none of what it checks (no biome kit yet: the flora checks; no named river, no
highway, no town tile). The isle's own checks:
  - the isle fields: every field 43-world-isles.js adds is a number at both towns, and the class weights sum to 1 on land
    (the towns are on land), 0 at sea (a point well out in the Ring Sea);
  - the towns stand on land, the climate the assay found (Kautoa Af, Valapo XA);
  - every geyser vent has its thermal ground (the 'floor' field 1 at the vent).
  - the coast (43-world-isles.js landHook): rays out from both towns cross a lagoon and then a reef crest;
  - the hamlets (core/hamlet H4): the four resource villages made with no error, on dry ground, at most 500 people each,
    every record's tags known (the negative drops the salt village).
  - the towns (M7, 48t/88t-world-towns.js): Kautoa and Valapo planned here as the city page plans them (no error, their
    census, every one of the city page's own plan checks, the sim declared); the world's land is each town's ground
    inside its square (24 samples a town, to 5 cm); the flora and floor keep off every lot (WORLD.townW at each lot);
  - the towns lived in (M7, 88c-world-life.js): the sim caught up to the world's clock and following it (the clock moved
    15 minutes, the towns with it), the canoe line's sea route on water all the way (no longer than 1.8 times the
    straight line), each carrier's vessel at its berth or on its route where its passage puts it, the citizens near the
    camera where the sim poses them;
  - the towns' HLOD (88t): every lot drawn exactly once round the camera, in full, baked or as massing (the negative
    draws one twice);
  - the export profile (moved here from the city page, M7): Kautoa's ceremonial centre (EXPORT_BOX, the town's frame) under
    EXPORT_PROFILE, as godot/data/world-isle-kautoa is cut (the same records, ids and sim as the city page's case).
Each check has a negative: the weights summed with a class removed, a town moved out to sea, a vent moved 5 km, the
coast hook switched off, a town's plan dropped, a town's ground read 50 m off, the keep-clear hook switched off, the
straight line taken as the route, a vessel moved 500 m, a citizen moved 50 m, the clock read an hour off.
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
 const town=n=>{const s=M.settlements.find(q=>q.name===n);return neg==='town'&&n==='Valapo'?{x:s.x-60000,z:s.z}:{x:s.x,z:s.z};};
 const sum=A=>KF.reduce((a,f)=>a+(neg==='class'&&f==='koppen:XA'?0:A[f]),0);
 {const bad=[];for(const n of ['Kautoa','Valapo']){const p=town(n),A=WORLD.at(p.x,p.z);for(const f of F)if(typeof A[f]!=='number'||!isFinite(A[f]))bad.push(n+' '+f);
   if(Math.abs(sum(A)-1)>1e-6)bad.push(n+' weights sum '+sum(A).toFixed(3));}
  const S=WORLD.at(-60000,0);if(S.depth>0&&sum(S)!==0)bad.push('sea weights sum '+sum(S));if(!(S.depth>0))bad.push('the sea point is not at sea');
  R.push({name:'the isle fields',ok:!bad.length,detail:bad.length?bad.join('; '):F.length+' fields at both towns; the classes sum to 1 on land, 0 at sea'});}
 {const bad=[],want={Kautoa:'Af',Valapo:'XA'};for(const n in want){const p=town(n),A=WORLD.at(p.x,p.z);if(!(A.depth<0))bad.push(n+' in the water');else if(A.clim!==want[n])bad.push(n+' '+A.clim);}
  R.push({name:'the towns on land, in their climate',ok:!bad.length,detail:bad.length?bad.join('; '):'Kautoa on Af ground, Valapo on XA, both above the sea'});}
 {const bad=[];WORLD.VENTS.forEach(([x,z],i)=>{const A=WORLD.at(neg==='vent'?x+5000:x,z);if(A.floor<.99)bad.push('vent '+(i+1)+' floor '+A.floor.toFixed(2));});
  R.push({name:'every vent has its thermal ground',ok:!bad.length&&WORLD.VENTS.length>0,detail:bad.length?bad.join('; '):WORLD.VENTS.length+' vents, the floor field 1 at each'});}
 {const keep=WORLD.landHook;if(neg==='coast')WORLD.landHook=null;let rays=0,reefs=0;
  try{for(const n of ['Kautoa','Valapo'])for(let a=0;a<24;a++){const s=town(n),dx=Math.cos(a/24*Math.PI*2),dz=Math.sin(a/24*Math.PI*2);let sea=false,lag=false,crest=false;
    for(let r=0;r<16000&&!crest;r+=100){const d=WORLD.lakeWater(s.x+dx*r,s.z+dz*r)-WORLD.H(s.x+dx*r,s.z+dz*r);
     if(!sea){if(d>0)sea=true;else continue;}if(d>1.5&&d<3.2)lag=true;else if(lag&&d>0&&d<.8)crest=true;else if(d>40)break;}
    rays++;if(crest)reefs++;}}finally{WORLD.landHook=keep;}
  R.push({name:'the coast: a lagoon behind a reef crest',ok:reefs>=4,detail:reefs+' of '+rays+' rays from the towns cross a lagoon (1.5-3.2 m) then a crest (under 0.8 m)'});}
 {const HM=window._hamlets,bad=[];if(!HM)bad.push('no hamlets on the page');else{
   const V=HM.villages.filter(v=>!(neg==='hamlet'&&v.focus==='salt')),want=['salt','mine','lumber','ranch'];
   for(const f of want){const v=V.find(q=>q.focus===f);if(!v){bad.push('no '+f+' village');continue;}
    if(v.error)bad.push(v.id+': '+v.error);if(!v.site)bad.push(v.id+': no site');
    if(!(v.census&&v.census.pop>0&&v.census.pop<=500))bad.push(v.id+': population '+(v.census&&v.census.pop));
    if(v.site&&WORLD.water(v.site.x,v.site.z)>WORLD.H(v.site.x,v.site.z)-.5)bad.push(v.id+': its green is in the water');}
   HM.stats.errors.forEach(e=>bad.push(e));const A=HM.tags();if(A.unknown)bad.push(A.unknown+' unknown tag values');}
  R.push({name:'the hamlets: four resource villages, each on dry ground, at most 500 people, tagged',ok:!bad.length,
   detail:bad.length?bad.join('; '):HM.villages.map(v=>v.focus+' '+v.census.pop+' people, '+v.buildings+' buildings').join('; ')});}
 return R;}"""


# M7: the towns planned and drawn here (48t-world-towns.js, 88t-world-towns.js)
TOWNS_JS = r"""(neg)=>{const R=[],T=window._isleTowns,W=ISLE_TOWNS_W;
 {const bad=[];if(!T)bad.push('no towns on the page');else{T.errors.forEach(e=>bad.push(String(e).slice(0,200)));if(W.stats.simError)bad.push('sim: '+W.stats.simError.slice(0,200));
   const L=T.towns.filter(t=>!(neg==='plan'&&t.town==='Valapo'));for(const n of ['Kautoa','Valapo']){const t=L.find(q=>q.town===n);if(!t){bad.push('no '+n);continue;}
    if(!(t.lots>0&&t.census&&t.census.buildings>0))bad.push(n+': '+t.lots+' lots');(t.checks||[]).forEach(c=>{if(!c.ok)bad.push(n+': '+c.name);});}}
  R.push({name:'the towns planned here, as the city page plans them',ok:!bad.length,detail:bad.length?bad.join('; '):T.towns.map(t=>t.town+' '+t.lots+' lots, '+t.census.buildings+' buildings, '+(t.checks||[]).length+' plan checks').join('; ')+'; the sim declared'});}
 {let worst=0,at=null,n=0;for(const P of W.plans){const G=P.G,F=G.frame,e=G.half-W.BAND-10,dx=neg==='ground'?50:0;
   for(let i=0;i<24;i++){const a=i*2.399963,r=e*Math.sqrt((i+.5)/24),lx=Math.cos(a)*r,lz=Math.sin(a)*r,d=Math.abs(WORLD.H(F.x+lx,F.z+lz)-(G.h(lx+dx,lz)+F.sea));n++;if(d>worst){worst=d;at=P.town+' '+Math.round(lx)+','+Math.round(lz);}}}
  R.push({name:"the world's land is each town's ground",ok:n>=48&&worst<0.05,detail:n+' samples, worst '+worst.toFixed(3)+' m at '+at});}
 {const keep=WORLD.clearHook;if(neg==='clear')WORLD.clearHook=null;let n=0,off=0;
  try{for(const P of W.plans){const F=P.G.frame;P.R.lots.forEach((L,i)=>{if(i%5)return;n++;if(!(WORLD.townW(F.x+L.x,F.z+L.z)>0))off++;});}}finally{WORLD.clearHook=keep;}
  R.push({name:"the flora and floor keep off the towns' lots",ok:n>100&&!off,detail:off+' of '+n+' lots (every fifth) open to the flora'});}
 return R;}"""
# the export profile, moved here from the city page (M7; core/export/README.md, "Profiles"): Kautoa's ceremonial centre,
# in the town's frame, as godot/data/world-isle-kautoa is cut (settlements/isle-demo/verify.py keeps it as a report)
EXPORT_BOX = [320, 780, 820, 1220]
EXPORT_PROFILE = ['registry', 'materials', 'terrain', 'city', 'sim', 'items', 'buckets', 'textures', 'fixtures', 'stage', 'interiors?', 'furniture?']


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
                for neg, nm in (('class', 'the isle fields'), ('town', 'the towns on land, in their climate'), ('vent', 'every vent has its thermal ground'), ('coast', 'the coast: a lagoon behind a reef crest'),
                                ('hamlet', 'the hamlets: four resource villages, each on dry ground, at most 500 people, tagged')):
                    r = [x for x in await pg.evaluate(ISLE, neg) if x['name'] == nm][0]
                    print(('  PASS  ' if not r['ok'] else '  MISSED') + nm + ' (' + neg + ') : ' + r['detail'])
                    if r['ok']: fails.append('negative ' + neg)
                print('--- the towns (M7) ---')
                for r in await pg.evaluate(TOWNS_JS, None):
                    print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
                    if not r['ok']: fails.append(r['name'])
                for neg, nm in (('plan', 'the towns planned here, as the city page plans them'), ('ground', "the world's land is each town's ground"),
                                ('clear', "the flora and floor keep off the towns' lots")):
                    r = [x for x in await pg.evaluate(TOWNS_JS, neg) if x['name'] == nm][0]
                    print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (' + neg + ') : ' + r['detail'])
                    if r['ok']: fails.append('negative ' + neg)
                # the export: the camera over the box first, so the stage reads the terrain there
                await pg.evaluate("(()=>{const F=ISLE.cur.G.frame;CAM.setView(F.x+570-450,F.z+1000-550,260,0,-.3);CAM.lookAt(F.x+570,WORLD.H(F.x+570,F.z+1000),F.z+1000);})()")
                await pg.evaluate('_api.settle(240000)')
                pok, lines = await harness.check_profile(pg, EXPORT_BOX, EXPORT_PROFILE)
                print(('  PASS  ' if pok else '  FAIL  ') + 'export-profile : %s, box %s, %s' % (await pg.evaluate('ISLE.cur.town'), EXPORT_BOX, ', '.join(EXPORT_PROFILE)))
                for ln in lines: print('        ' + ln)
                if not pok: fails.append('export-profile')
                # the towns' HLOD (88t): the camera's rings rebuilt and every piece baked first
                await pg.evaluate("(()=>{let last=-1,same=0,n=0;while(same<4&&n<4000){for(const f of HOST.TICKS)f(.016,performance.now()/1000);n++;const b=_isleTowns.hlod.bakes;if(b===last)same++;else same=0;last=b;}})()")
                r = await pg.evaluate('_isleTowns.hlodCheck()')
                print(('  PASS  ' if r['ok'] else '  FAIL  ') + 'the towns drawn once each, full, baked or massing : ' + r['detail'])
                if not r['ok']: fails.append('hlod')
                rn = await pg.evaluate('_isleTowns.hlodCheck({twice:true})')
                print(('  PASS  ' if not rn['ok'] else '  MISSED') + ' negative (hlod) : ' + rn['detail'])
                if rn['ok']: fails.append('negative hlod')
                # the towns lived in (88c): the sim caught up first, the citizens chosen round the camera set above
                print('--- the towns lived in (M7) ---')
                await pg.evaluate('_isleLife.follow(Infinity)')
                for key, nm, neg in (('route', "the canoe line's sea route is on water", '{straight:true}'),
                                     ('canoes', 'each carrier drawn at its berth or on its route', '{shift:true}'),
                                     ('citizens', 'the citizens drawn where the sim poses them', '{shift:true}'),
                                     ('clock', "the towns follow the world's clock", '{off:true}')):
                    r = await pg.evaluate('_isleLife.checks.%s()' % key)
                    print(('  PASS  ' if r['ok'] else '  FAIL  ') + nm + ' : ' + r['detail'])
                    if not r['ok']: fails.append(nm)
                    rn = await pg.evaluate('_isleLife.checks.%s(%s)' % (key, neg))
                    print(('  PASS  ' if not rn['ok'] else '  MISSED') + ' negative (%s) : ' % key + rn['detail'])
                    if rn['ok']: fails.append('negative ' + key)
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
