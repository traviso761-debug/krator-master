#!/usr/bin/env python3
"""Verify the Lake Shore province of Erewhon's lake (settlements/xanadu/BUILD-OUT.md; README.md).

    python3 verify.py dist/xanadu-lake-shore.html --assert [--views 0,1,4] [--out DIR]
    python3 verify.py dist/xanadu-lake-shore.html --list

On the GPU (KRATOR_GL=gpu, under tools/harness.py lock --lane auto) the harness's universal asserts name the renderer.
The checks, each with a negative:
  - the world's own (core/world/91-world-probe.js, round Erehwon's first village);
  - the region: Erehwon where the cut put it (px 841,1507.9: the vale ring's bench 841,1507.64 lay under the lake on the 11-23 re-run, re-seated 520 m south), on dry land, the Xanadu kit growing there; the negative reads
    it 8 km north, out on the lake, in the water;
  - the shore towns and isles: each of the sixteen where SITES.json put it, inside the cut, on dry land or with dry land
    within 1 km (a shore cell of the model; an isle is one cell of it); the negative reads Ālph-Hēḍ in the lake's middle;
  - the landforms inside the cut (core/world/41l-world-landforms.js WLAND.check: the Pleasure Dome's isle by Erehwon)
    stand over the lake; the negative moves each into the open lake (px 850,1511), where no stamp stands it up;
  - the pitched camps (src/48t, 88t; settlements/xanadu/WORKS-PLAN.md W2: _worldCamps.checks): each camp pitched whole on the
    world's ground, its form (the Tears' ring: one gate, the gold room, the sluices in the bed; the caravan's laager: its wagons and
    the escort's ring), pitched in its season and struck out of it, with the negatives `plan` and `season`; a camp whose site the
    cut does not hold yet is n/a (awaiting the region's recut);
  - the sites (core/world/88s-world-sites.js _sites.checks), with their negatives;
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
REGION = r"""(neg)=>{const R=[],M=WORLD_DATA.meta,O=M.frame.origin_px,fx=(px,py)=>[(px-O[0])*2000,(py-O[1])*2000];
 /* Erehwon: where the cut put it, on dry land, the Xanadu kit growing there */
 {const bad=[],lines=[],S=(M.sites||[]).find(s=>s.id==='s57bkv9741');
  if(!S)bad.push('no site s57bkv9741');else{let x=S.x,z=S.z;if(neg==='site')z=S.z-8000;   /* the negative: Erehwon read 8 km north, on the lake */
   if(S.px!==841||Math.abs(S.py-1507.9)>0.01)bad.push('Erehwon at px '+S.px+','+S.py);   /* re-seated on the re-run's dry shore (2026-11-23) */
   if(!WORLD.inside(x,z))bad.push('Erehwon outside the cut');else{const A=WORLD.at(x,z),b=WORLD.biomeAt(x,z);
    if(!(A.depth<0))bad.push('Erehwon in water');
    const k=WORLD_KITS.findIndex(q=>q.name==='xanadu'),w=WORLD.kitW(k,x,z);if(!(w>.5))bad.push('Erehwon: the xanadu kit weighs '+w.toFixed(2));
    lines.push('Erehwon px '+S.px+','+S.py+' in '+(b&&b.name)+', '+WORLD.H(x,z).toFixed(0)+' m, kit '+w.toFixed(2));}}
  R.push({name:'the region: Erehwon where the cut put it, on dry land, the Xanadu kit growing there',ok:!bad.length,detail:bad.length?bad.join('; '):lines.join('; ')});}
 /* the shore towns and the isles: each inside the cut, on dry land or with dry land within 1 km of its point */
 {const bad=[],lines=[],T=(M.sites||[]).filter(s=>/^sxanlk/.test(s.id));
  if(T.length!==16)bad.push(T.length+' of 16 shore towns and isles in the cut');
  const dry=(x,z)=>WORLD.inside(x,z)&&WORLD.at(x,z).depth<0;
  for(const S of T){let x=S.x,z=S.z;if(neg==='shore'&&S.id==='sxanlkalph01'){const p=fx(835,1500);x=p[0];z=p[1];}   /* the negative: Ālph-Hēḍ read in the open lake (835,1500 since the vale ring narrowed it: 850,1511 is Erehwon's shore now) */
   if(!WORLD.inside(x,z)){bad.push(S.name+' outside the cut');continue;}
   let d=dry(x,z)?0:null;
   for(const r of [500,1000])for(let a=0;a<8&&d==null;a++)if(dry(x+r*Math.cos(a*Math.PI/4),z+r*Math.sin(a*Math.PI/4)))d=r;
   if(d==null)bad.push(S.name+' no dry land within 1 km');else lines.push(S.name+(d?' (shore '+d+' m)':'')+' '+WORLD.H(x,z).toFixed(0)+' m');}
  R.push({name:'the shore towns and isles: each in the cut, on dry land or at the shore',ok:!bad.length,detail:bad.length?bad.join('; '):lines.join(', ')});}
 /* the landforms in the cut: WLAND's own check (its top at the crest, the waterline round it at its radius). A record
    joined to the shore passes when its top is at its crest and its seaward rays cross the waterline near its radius */
 {const bad=[],l2=[],LS=WLAND.list.filter(L=>WORLD.inside(L.x,L.z));
  if(!LS.length)bad.push('no landform record inside the cut');
  if(WLAND.skipped.length)bad.push('skipped: '+JSON.stringify(WLAND.skipped));
  const C=WLAND.check(),byId={};C.forEach(c=>byId[c.id]=c);
  const joined=c=>c&&Math.abs(c.top-c.crest)<.2*(c.crest+520)+3&&c.waterline.filter(w=>w!=null&&w>.7&&w<1.35).length>=3;
  const open=fx(835,1500);   /* the open lake since the vale ring narrowed it */
  for(const L of LS){let c=byId[L.id];if(c)c=Object.assign({},c,{ok:c.ok||joined(c)});
   if(neg==='landforms'){const top=WORLD.Hbare(open[0],open[1]);c={id:L.id,ok:top>L.water,top};}
   if(!c||!c.ok)bad.push(L.id+' '+JSON.stringify(c));else l2.push(L.id+' top '+c.top+' m (crest '+L.crest+')');}
  R.push({name:'the landforms in the cut stand over the lake at their records',ok:!bad.length,detail:bad.length?bad.join('; '):l2.join('; ')});}
 /* the lake towns (settlements/xanadu-lake, step L3 on: openworld/SITES.json's towns for this region): each its own ground in
    the world, as xanadu-north-shore checks its own (core/world 41t WTOWN.check: the page's shore where the world's water meets
    its ground, its stream the page's own, one lake) */
 {const C=typeof WTOWN!=='undefined'?(WTOWN.check()||[]):[],TS=(WORLD_DATA.towns&&WORLD_DATA.towns.towns)||[];   /* no WTOWN on the page: every town fails (the region must take 41t) */
  if(!TS.length)R.push({name:'the lake towns stand in the world (WTOWN.check)',ok:false,detail:'the region carries no town'});
  for(const t of TS){const c=C.find(q=>q.town===t.name),det=c?JSON.stringify({shore:c.shore,river:c.river&&(c.river.ok?{ok:true}:{inTown:c.river.inTown}),body:c.body&&{one:c.body.one}}).slice(0,400):'no town '+t.name;
   R.push({name:t.name+' stands in the world: its shore, its stream and its lake (WTOWN.check)',ok:!!c&&c.ok,detail:det});}}
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


NEG_OF = {'site': 'Erehwon where', 'shore': 'shore towns', 'landforms': 'the landforms'}


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    async with verify_page(a.html, here=HERE, size=a.size, settle_ms=0,
                           ready_js="typeof CAM==='object'&&CAM&&window._api&&window._sites&&window._worldCamps") as V:
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
            # the world's checks read the flora round the camera: over Erehwon's first village, settled
            await pg.evaluate("(()=>{const S=WORLD_DATA.sites.sites.find(s=>s.id==='s57bkv9741'),V=S.hamlets[0];CAM.setView(V.site.x+1500,V.site.z+1500,400,.78,-.25);})()")
            await pg.evaluate('_api.settle(240000)')
            print("--- the world's checks (core/world/91-world-probe.js, round Erehwon's first village) ---")
            for r in await pg.evaluate('_api.hostChecks()'):
                need = APPLIES.get(r['name'])
                if need and not has[need]:
                    print('  n/a   ' + r['name'] + ' : this region has no ' + need + ' yet'); continue
                if say(r): fails.append(r['name'])
            print('--- the region ---')
            for neg in (None, 'site', 'shore', 'landforms'):
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
            # the pitched camps (src/48t, 88t; settlements/xanadu/WORKS-PLAN.md W2): planned at load, each with its negatives
            print('--- the pitched camps (src/48t-world-camps.js, 88t: core/camp) ---')
            for r in await pg.evaluate('_worldCamps.checks()'):
                if r.get('na'):
                    print('  n/a   ' + r['name'] + ' : ' + r['detail']); continue
                if say(r): fails.append(r['name'])
            for neg, key in (('plan', 'pitched whole'), ('season', 'pitched in its season')):
                rs = [x for x in await pg.evaluate('_worldCamps.checks(%r)' % neg) if key in x['name']]
                if rs and say(rs[0], neg): fails.append('negative ' + neg)
            errs_plan = await pg.evaluate('window._sites.stats.errors')
            if errs_plan:
                print('  NOTE  the plan\'s errors: ' + '; '.join(errs_plan))
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
