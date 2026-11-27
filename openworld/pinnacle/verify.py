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
    move of 2026-11-10; the frame's origin is the box's centre since the corridors of 2026-11-11), on dry land in the
    savage hyperjungle, and its kit growing there (the negative reads the site 40 km off, out of the cut); every partner
    at its pixel inside the cut (the negative reads Coyote Canyon 40 km east, out of the box); every corridor's link baked along
    the line it was cut on, inside the cut, with its caravanserais (the negative drops the Shade road);
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
REGION = r"""(neg)=>{const R=[],M=WORLD_DATA.meta,F=M.frame,S=(M.sites||[])[0],bad=[],HJ=WORLD_KITS.findIndex(k=>k.name==='hyperjungle');
 if(!S)bad.push('no site in region.json');else{const x=neg==='site'?S.x+40000:S.x,z=S.z;
  if(S.id!=='staiytii0y')bad.push('the site is '+S.id);if(S.px!==1007||S.py!==686)bad.push('the site at px '+S.px+','+S.py);
  if(S.x!==(S.px-F.origin_px[0])*2000||S.z!==(S.py-F.origin_px[1])*2000)bad.push('the site off its pixel in the frame');
  if(!WORLD.inside(x,z))bad.push('the site outside the cut');else{const A=WORLD.at(x,z);if(!(A.depth<0))bad.push('the site in water');
   const b=WORLD.biomeAt(x,z);if(!b||b.name.toLowerCase()!=='savage hyperjungle')bad.push('the site in '+(b&&b.name));
   if(!(WORLD.kitW(HJ,x,z)>.5))bad.push('the hyperjungle kit weighs '+WORLD.kitW(HJ,x,z).toFixed(2)+' there');}}
 R.push({name:'the region: the site where the cut put it, on dry land in the savage hyperjungle, its kit growing there',ok:!bad.length,
  detail:bad.length?bad.join('; '):S.name+' ('+S.id+') at px '+S.px+','+S.py+' (the frame\'s origin px '+F.origin_px+'); '+WORLD.biomeAt(S.x,S.z).name+', the hyperjungle kit weighs '+WORLD.kitW(HJ,S.x,S.z).toFixed(2)});
 /* the partners: each at its pixel, inside the cut (the negative reads Coyote Canyon 40 km east, out of the box) */
 const want={ski7uk8fjc:[918,698],sghb3jlsk5:[1026,760],s1kaqxmg10:[1049,736],s5c6ysqazg:[1060,831],skukf2qmmq:[1049,841],
  s2199308wr:[996,870],soksvzt1h9:[1265,500],slfozs6c7z:[1085,683]},bad2=[],lines=[];
 for(const id in want){const T=(M.sites||[]).find(s=>s.id===id);if(!T){bad2.push('no site '+id);continue;}
  const x=neg==='partner'&&id==='soksvzt1h9'?T.x+40000:T.x;
  if(T.px!==want[id][0]||T.py!==want[id][1])bad2.push(T.name+' at px '+T.px+','+T.py);
  if(!WORLD.inside(x,T.z))bad2.push(T.name+' outside the cut');else lines.push(T.name+' px '+T.px+','+T.py+' ('+((WORLD.biomeAt(x,T.z)||{}).name||'no biome')+')');}
 R.push({name:'the region: every partner where the cut put it, inside the cut',ok:!bad2.length,detail:bad2.length?bad2.join('; '):lines.join('; ')});
 /* the links: every corridor's road baked, from its town to the other along the line it was cut on, inside the cut, with
    its caravanserais and rest stops (the negative drops the Shade road) */
 const P=WORLD_DATA.sites,C=(M.cut||{}).corridors||[],bad3=[],L3=[];
 for(const c of C){const Lk=(P.links||[]).find(l=>l.from===c.from&&l.to===c.to&&!(neg==='link'&&c.to==='slfozs6c7z'));
  if(!Lk){bad3.push('no link '+c.from+'-'+c.to);continue;}
  const out=Lk.pts.filter(p=>!WORLD.inside(p[0],p[1])).length,km=Lk.length_m/1000,inns=(Lk.stops||[]).filter(s=>s.kind==='inn').length,rests=(Lk.stops||[]).length-inns;
  /* the road keeps to its line: no point of it farther than 6 km (the corridor's half-width and a margin) from the line */
  const Q=c.px.map(q=>[(q[0]-F.origin_px[0])*2000,(q[1]-F.origin_px[1])*2000]);let far=0;
  for(const p of Lk.pts){let d=1e18;for(let i=1;i<Q.length;i++){const a=Q[i-1],b=Q[i],ex=b[0]-a[0],ez=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*ex+(p[1]-a[1])*ez)/(ex*ex+ez*ez||1)));
   d=Math.min(d,Math.hypot(p[0]-a[0]-ex*t,p[1]-a[1]-ez*t));}far=Math.max(far,d);}
  if(out)bad3.push(Lk.id+': '+out+' points outside the cut');if(far>6000)bad3.push(Lk.id+': '+(far/1000).toFixed(1)+' km off its line');
  if(km>30&&!inns)bad3.push(Lk.id+': '+km.toFixed(0)+' km of road and no caravanserai');
  L3.push(Lk.from.slice(0,4)+'-'+Lk.to.slice(0,4)+' '+km.toFixed(0)+' km '+inns+'+'+rests+(Lk.gaps?' ('+Lk.gaps.length+' gaps)':''));}
 if(C.length!==9)bad3.push(C.length+' corridors with a line in region.json, not 9');
 R.push({name:'the links: every corridor\'s road baked along its line, inside the cut, with its stops',ok:!bad3.length,detail:bad3.length?bad3.join('; '):L3.join('; ')});
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
            await VW.negatives(pg, has, fails)   # the world's negatives, each must fail (core/world verify_world.py; S3-26)
            print('--- the region ---')
            for neg in (None, 'site', 'partner', 'link'):
                # each negative breaks one check (the site, a partner, a link); the others it reads as they are
                rs = await pg.evaluate(REGION, neg)
                for r in rs:
                    if neg and {'site': 'the site where', 'partner': 'every partner', 'link': 'the links'}[neg] not in r['name']:
                        continue
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
