#!/usr/bin/env python3
"""Verify the north shore of Erewhon's lake (settlements/pher/PLAN.md step P2; README.md).

    python3 verify.py dist/xanadu-north-shore.html --assert [--views 0,1,4] [--out DIR]
    python3 verify.py dist/xanadu-north-shore.html --list

On the GPU (KRATOR_GL=gpu, under tools/harness.py lock --lane auto) the harness's universal asserts name the renderer.
The checks, each with a negative:
  - the world's own (core/world/91-world-probe.js, round Phēr's first village);
  - the region: each site where the cut put it (Phēr px 843,1491, Thalaba 840,1463), on dry land, the Xanadu kit growing
    at Phēr; the long isle (845,1504) outside the cut (the owner: "don't take the long isle"). The negative reads Phēr at
    a spot out on the lake, in the water;
  - the landforms (core/world/41l-world-landforms.js WLAND.check): Phēr's headland and the cove's east point stand over
    the lake at their crests with the waterline round them. The negative runs the same check on a record moved 6 km out
    into the open lake, where no stamp stands it up;
  - the Swīṭ Siṭrīm: its course runs downhill on the land to the lake beside Phēr (the negative reverses it);
  - the sites (core/world/88s-world-sites.js _sites.checks), with their negatives, and the Thalaba road's length
    (about 105 km up the Qol valley, settlements/pher/PLAN.md section 3);
  - the resources (core/world/verify_world.py).
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
REGION = r"""(neg)=>{const R=[],M=WORLD_DATA.meta,bad=[],lines=[],O=M.frame.origin_px,fx=(px,py)=>[(px-O[0])*2000,(py-O[1])*2000];
 const want={spher0north1:{px:[843,1491],kit:'xanadu'},shvo49k0y2:{px:[840,1463]}};
 for(const id in want){const S=(M.sites||[]).find(s=>s.id===id),W=want[id];if(!S){bad.push('no site '+id);continue;}
  let x=S.x,z=S.z;if(neg==='site'&&id==='spher0north1'){x=S.x;z=S.z+8000;}   /* the negative: Phēr read 8 km out on the lake */
  if(S.px!==W.px[0]||S.py!==W.px[1])bad.push(S.name+' at px '+S.px+','+S.py);
  if(!WORLD.inside(x,z)){bad.push(S.name+' outside the cut');continue;}
  const A=WORLD.at(x,z),b=WORLD.biomeAt(x,z);
  if(!(A.depth<0))bad.push(S.name+' in water');
  if(W.kit){const k=WORLD_KITS.findIndex(q=>q.name===W.kit),w=WORLD.kitW(k,x,z);if(!(w>.5))bad.push(S.name+': the '+W.kit+' kit weighs '+w.toFixed(2));}
  lines.push(S.name+' px '+S.px+','+S.py+' in '+(b&&b.name)+', '+WORLD.H(x,z).toFixed(0)+' m');}
 const isle=fx(845,1504);if(WORLD.inside(isle[0],isle[1]))bad.push('the long isle is inside the cut');else lines.push('the long isle outside the cut');
 R.push({name:'the region: each site where the cut put it, on dry land, the kit at Phēr, the long isle left out',ok:!bad.length,detail:bad.length?bad.join('; '):lines.join('; ')});
 /* the landforms: WLAND's own check (its top at the crest, the waterline round it at its radius) on Phēr's records. They
    are joined to the shore (a headland, a point), so a ray toward the land finds no waterline: a record passes when its
    top is at its crest and its three seaward rays (south-east, south, south-west: WLAND's directions 1-3) cross the
    waterline at its radius. The negative runs it on a copy of each moved 6 km south into the open lake, where no stamp
    stands it up */
 const bad2=[],l2=[],LS=WLAND.list.filter(L=>/^lf_pher_/.test(L.id));
 if(LS.length!==3)bad2.push(LS.length+' of 3 of Phēr\'s records stamped');
 if(WLAND.skipped.length)bad2.push('skipped: '+JSON.stringify(WLAND.skipped));
 const C=WLAND.check(),byId={};C.forEach(c=>byId[c.id]=c);
 const joined=c=>c&&Math.abs(c.top-c.crest)<.2*(c.crest+520)+3&&[1,2,3].every(i=>c.waterline[i]!=null&&c.waterline[i]>.7&&c.waterline[i]<1.35);
 for(const L of LS){let c=byId[L.id];if(c)c=Object.assign({},c,{ok:c.ok||joined(c)});
  if(neg==='landforms'){const top=WORLD.Hbare(L.x,L.z+6000);c={id:L.id,ok:top>L.water,top};}
  if(!c||!c.ok)bad2.push(L.id+' '+JSON.stringify(c));else l2.push(L.id+' top '+c.top+' m (crest '+L.crest+')');}
 R.push({name:'the landforms: Phēr\'s headland and the cove\'s east point stand over the lake at their records',ok:!bad2.length,detail:bad2.length?bad2.join('; '):l2.join('; ')});
 /* the Swīṭ Siṭrīm: its course falling to the lake beside Phēr. Inside Phēr's footprint (P7: the town's own ground,
    core/world 41t) the stream is the town's (WTOWN.rivers(), mouth first), the model's line cut outside the band and led in
    to it; so the course judged is the model's line down to its cut (its water), then the town's from its head
    down to its mouth on the town's ground (WORLD.H: inside R the page's, which replaced the model's), with its water
    (41t 'over': [x, z, half-width, water]) never climbing */
 const bad3=[],l3=[],Rv=(M.rivers||[]).find(r=>r.id==='r_pher_swit'),TR=typeof WTOWN!=='undefined'?WTOWN.rivers().find(r=>r.town==='Phēr'||r.name==='Swīṭ Siṭrīm'):null;
 if(!Rv&&!TR)bad3.push('no r_pher_swit in the region');else{
  /* the model's line by its own water where it carries it (the cut's point falls between the model's 2 km nodes, on the land's noise) */
  const courses=[];if(Rv&&Rv.line.length>1){const wl=Rv.line.every(p=>typeof p[2]==='number');
   courses.push(['the model\'s line',Rv.line.map(p=>[p[0],p[1],wl?p[2]:null]),wl?((x,z,p)=>p[2]):((x,z)=>WORLD.Hbare(x,z))]);}
  if(TR)courses.push(['the town\'s',TR.pts.map(p=>[p[0],p[1],p[3]]).reverse(),(x,z)=>WORLD.H(x,z)]);
  for(const [nm,P0,G] of courses){const pts=neg==='stream'?P0.slice().reverse():P0,hs=pts.map(p=>G(p[0],p[1],p));
   for(let i=1;i<hs.length;i++)if(!(hs[i]<hs[i-1]+2))bad3.push(nm+' rises '+(hs[i]-hs[i-1]).toFixed(1)+' m at point '+i);
   for(let i=1;i<pts.length;i++)if(pts[i][2]!=null&&pts[i][2]>pts[i-1][2]+1e-6){bad3.push(nm+' water climbs at point '+i);break;}
   l3.push(nm+' from '+hs[0].toFixed(0)+' m to '+hs[hs.length-1].toFixed(0)+' m in '+hs.length+' points');}
  const e=courses[courses.length-1][1],m=neg==='stream'?e[0]:e[e.length-1],P=(M.sites||[]).find(s=>s.id==='spher0north1');
  if(Math.hypot(m[0]-P.x,m[1]-P.z)>3000)bad3.push('its mouth '+Math.round(Math.hypot(m[0]-P.x,m[1]-P.z))+' m from Phēr');}
 R.push({name:'the Swīṭ Siṭrīm runs downhill to the lake at Phēr',ok:!bad3.length,detail:bad3.length?bad3.slice(0,4).join('; '):l3.join('; ')});
 /* Phēr's own ground in the world (P7: core/world 41t WTOWN.check: the page's shore where the world's water meets its
    ground, the stream continuous into the model's, one lake). Its negatives are core/world/test-town-water.js's */
 if(typeof WTOWN!=='undefined'){const C=WTOWN.check()||[],c=C.find(q=>q.town==='Phēr');const ok=!!c&&c.ok,det=c?JSON.stringify({shore:c.shore,river:c.river&&(c.river.ok?{ok:true}:{inTown:c.river.inTown,line:c.river.line}),body:c.body&&{one:c.body.one}}).slice(0,400):'no town Phēr';
  R.push({name:'Phēr stands in the world: its shore, its stream and its lake (WTOWN.check)',ok,detail:det});
  /* the lake towns (settlements/xanadu-lake, step L0 on): each town the region carries besides Phēr, its own ground in the
     world the same way (its stream the page's own, joined to no model river) */
  const others=(WORLD_DATA.towns&&WORLD_DATA.towns.towns||[]).filter(t=>t.name!=='Phēr');
  for(const t of others){const c2=C.find(q=>q.town===t.name),det2=c2?JSON.stringify({shore:c2.shore,river:c2.river&&(c2.river.ok?{ok:true}:{inTown:c2.river.inTown}),body:c2.body&&{one:c2.body.one}}).slice(0,400):'no town '+t.name;
   R.push({name:t.name+' stands in the world: its shore, its stream and its lake (WTOWN.check)',ok:!!c2&&c2.ok,detail:det2});}}
 /* the Thalaba road: the link up the Qol valley, about 105 km (the plan's trace), its hans on the way */
 const L=(WORLD_DATA.sites.links||[]).find(l=>l.id==='spher0north1/link/shvo49k0y2'),len=L?L.length_m*(neg==='road'?.65:1):0;
 R.push({name:'the Thalaba road goes up the Qol valley, about 105 km with its hans',ok:!!L&&len>95000&&len<115000&&(L.stops||[]).length>=4,
  detail:L?(len/1000).toFixed(1)+' km, '+(L.stops||[]).length+' stops, max grade '+L.maxGrade:'no link'});
 /* the countryside sample (core/world 48v, 88r; HAMLETS-PLAN section 3, A9): laid, every village whole and off the region's
    places and roads, its people under the province's bulk; its negative: a village moved onto a site is caught */
 {const S=window._sample,c=S&&S.check?S.check():null,n=S&&S.check?S.check(true):null;
  R.push({name:'the countryside sample: villages laid off the places and roads, under the province\'s bulk',ok:!!c&&c.ok,detail:c?c.detail:'no window._sample (core/world 88r)'});
  R.push({name:' negative (sample) the countryside sample: a village on a site is caught',ok:!!n&&!n.ok,detail:n?n.detail.slice(0,200):'-'});}
 return R;}"""


def say(r, neg=None):
    if neg is None:
        print(('  PASS  ' if r['ok'] else '  FAIL  ') + r['name'] + ' : ' + r['detail'])
        return not r['ok']
    print(('  PASS  ' if not r['ok'] else '  MISSED') + ' negative (' + neg + ') ' + r['name'] + ' : ' + r['detail'])
    return r['ok']


NEG_OF = {'site': 'the region', 'landforms': 'the landforms', 'stream': 'Swīṭ', 'road': 'Thalaba road'}


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
            # the world's checks read the flora round the camera: over Phēr's first village, settled
            await pg.evaluate("(()=>{const S=WORLD_DATA.sites.sites.find(s=>s.id==='spher0north1'),V=S.hamlets[0];CAM.setView(V.site.x+1500,V.site.z+1500,400,.78,-.25);})()")
            await pg.evaluate('_api.settle(240000)')
            print("--- the world's checks (core/world/91-world-probe.js, round Phēr's first village) ---")
            for r in await pg.evaluate('_api.hostChecks()'):
                need = APPLIES.get(r['name'])
                if need and not has[need]:
                    print('  n/a   ' + r['name'] + ' : this region has no ' + need + ' yet'); continue
                if say(r): fails.append(r['name'])
            await VW.negatives(pg, has, fails)   # the world's negatives, each must fail (core/world verify_world.py; S3-26)
            print('--- the region ---')
            for neg in (None, 'site', 'landforms', 'stream', 'road'):
                for r in await pg.evaluate(REGION, neg):
                    # a negative is judged on the check it breaks
                    if neg and NEG_OF[neg] not in r['name']:
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
