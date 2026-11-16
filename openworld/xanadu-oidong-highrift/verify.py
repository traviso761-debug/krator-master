#!/usr/bin/env python3
"""Verify the Xanadu, Oidong and High Rift region of the open world (openworld/PLAN-SITES.md, the second region).

    python3 verify.py dist/xanadu-oidong-highrift.html --assert [--views 0,1,4] [--out DIR]
    python3 verify.py dist/xanadu-oidong-highrift.html --list

On the GPU (KRATOR_GL=gpu, under tools/harness.py lock --lane auto) the harness's universal asserts name the renderer.
The checks, each with a negative:
  - the world's own (core/world/91-world-probe.js, round Qiblai's first village): order-free seeding, the land
    continuous, nothing in water or outside the region, spacing across tiles, the rivers that carry water (a dry course
    and a river's stations outside the polygon are not judged), the villages' roads on the land at their grade, nothing
    growing on a road or a village, no NaN;
  - the region: each site where the cut put it (Erehwon px 805,1516 (on its caldera lake's south shore since edit 5.1-512) and Qiblai 922,1595 (at the cataracts since 2026-11-11) in the 'xanadu' overlay, Longsong
    1226,1626 in the 'oidong valley'), on dry land, its kit growing there (the negative reads Erehwon at Longsong's spot,
    in the Oidong Valley, where the Xanadu kit does not grow);
  - the lake's small islands (src/44-world-landforms.js, the scale model's landform records): each over its lake at its
    centre with the lake round it, the Pleasure Dome's isle at the Erewhon page's island (the negative reads the land
    without the stamp);
  - the sites (core/world/88s-world-sites.js _sites.checks): the baked plan is the plan made again in the browser (the
    negative changes the world seed), every village whole, its buildings apart and on good ground, every road at its lane
    end (the negative stacks two buildings), every village cleared of flora, tagged and drawn with the kit's pieces (the
    negative reads the world without the villages' clearing).
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
REGION = r"""(neg)=>{const R=[],M=WORLD_DATA.meta,bad=[],lines=[];
 const want={s57bkv9741:{px:[805,1516],biome:'xanadu',kit:'xanadu'},skm4jjo2vl:{px:[922,1595],biome:'xanadu',kit:'xanadu'},sq80bzd7ep:{px:[1226,1626],biome:'oidong valley',kit:'oidong'}};
 for(const id in want){const S=(M.sites||[]).find(s=>s.id===id),W=want[id];if(!S){bad.push('no site '+id);continue;}
  const L=(M.sites||[]).find(s=>s.id==='sq80bzd7ep'),moved=neg==='site'&&id==='s57bkv9741'&&L;   /* the negative: Erehwon read at Longsong's spot, in the Oidong Valley */
  const x=moved?L.x:S.x,z=moved?L.z:S.z,k=WORLD_KITS.findIndex(q=>q.name===W.kit);
  if(S.px!==W.px[0]||S.py!==W.px[1])bad.push(S.name+' at px '+S.px+','+S.py);
  if(!WORLD.inside(x,z)){bad.push(S.name+' outside the cut');continue;}
  const A=WORLD.at(x,z),b=WORLD.biomeAt(x,z),w=WORLD.kitW(k,x,z);
  if(!(A.depth<0))bad.push(S.name+' in water');if(!b||b.name.toLowerCase()!==W.biome)bad.push(S.name+' in '+(b&&b.name));if(!(w>.5))bad.push(S.name+': the '+W.kit+' kit weighs '+w.toFixed(2));
  lines.push(S.name+' px '+S.px+','+S.py+' in '+(b&&b.name)+' ('+W.kit+' '+w.toFixed(2)+')');}
 R.push({name:'the region: each site where the cut put it, on dry land, its kit growing there',ok:!bad.length,detail:bad.length?bad.join('; '):lines.join('; ')});
 /* Lāiṭwāl (settlements/lightwall/PLAN.md, steps L0 and L5): on the bench, the great lake at its feet to the south, the north
    boundary fault's wall rising behind it (Opal Valley grows no kit here yet: KNOWN_ISSUES.md). The negative reads it 40 km out
    in the lake's middle */
 {const S=(M.sites||[]).find(s=>s.id==='slaitwal0001');if(!S)R.push({name:'Lāiṭwāl on its bench under the wall, the lake at its feet',ok:false,detail:'no site slaitwal0001'});
  else{const x=S.x,z=S.z+(neg==='site'?14000:0),dry=WORLD.at(x,z).depth<0,h=WORLD.H(x,z);   /* WORLD.at's record is shared: read it at once */let lake=null;for(let d=500;d<=8000&&lake==null;d+=250){const B=WORLD.at(x,z+d);if(B.depth>0)lake=d;}
   const wall=Math.max(...[3000,6000,9000].map(d=>WORLD.H(x,z-d)))-h;
   R.push({name:'Lāiṭwāl on its bench under the wall, the lake at its feet',ok:S.px===1028&&S.py===1653&&dry&&lake!=null&&wall>1500,
    detail:'px '+S.px+','+S.py+', ground '+Math.round(h)+' m'+(dry?' (dry)':' (in water)')+', the lake '+(lake==null?'not within 8 km south':(lake/1000).toFixed(2)+' km south')+', the wall '+Math.round(wall)+' m higher within 9 km north'});}}
 /* the lake's small islands (src/44): each stands over its lake at its centre, the lake goes on round it (1.9 radii out,
    four ways), and the Pleasure Dome's isle is the Erewhon page's island (its ISLAND_C, 70,-613 m from the page's centre
    on Erehwon's pin). The negative reads the land without the stamp: every centre under the water */
 const LF=WORLD.LANDFORMS,bad2=[],l2=[];LF.off=neg==='landforms';WORLD.H(0,0);
 const E=(M.sites||[]).find(s=>s.id==='s57bkv9741');
 if(!LF.length)bad2.push('no landforms stamped');
 for(const I of LF){const h=WORLD.H(I.x,I.z),wl=WORLD.water(I.x,I.z);
  if(!(h>wl+.5*(I.crest-I.water)))bad2.push(I.id+' at '+h.toFixed(1)+' m under its lake '+wl);
  for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=I.x+a*1.9*I.rx*1.25,z=I.z+b*1.9*I.rz*1.25;if(!(WORLD.H(x,z)<WORLD.water(x,z)))bad2.push(I.id+': dry '+Math.round(Math.hypot(x-I.x,z-I.z))+' m off');}
  l2.push(I.id+' '+(h-wl).toFixed(1)+' m over the lake');}
 const PD=LF.find(I=>I.id==='lf_pleasure_dome_isle');
 if(!PD||!E)bad2.push('no Pleasure Dome isle or no Erehwon');else{const d=Math.hypot(PD.x-(E.x+70),PD.z-(E.z-613));if(d>10)bad2.push('the Pleasure Dome isle '+d.toFixed(0)+' m off the page\'s island');else l2.push('the Pleasure Dome isle '+d.toFixed(1)+' m off the page\'s island');}
 LF.off=false;
 R.push({name:'the lake\'s small islands stand over the water at their records, the Pleasure Dome\'s at the page\'s island',ok:!bad2.length,detail:bad2.length?bad2.join('; '):l2.join('; ')});
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
            # the world's checks read the flora round the camera: over Qiblai's first village, settled
            await pg.evaluate("(()=>{const S=WORLD_DATA.sites.sites.find(s=>s.name==='Qiblai'),V=S.hamlets[0];CAM.setView(V.site.x+1500,V.site.z+1500,400,.78,-.25);})()")
            await pg.evaluate('_api.settle(240000)')
            print("--- the world's checks (core/world/91-world-probe.js, round Qiblai's first village) ---")
            for r in await pg.evaluate('_api.hostChecks()'):
                need = APPLIES.get(r['name'])
                if need and not has[need]:
                    print('  n/a   ' + r['name'] + ' : this region has no ' + need + ' yet'); continue
                if say(r): fails.append(r['name'])
            print('--- the region ---')
            for neg in (None, 'site', 'landforms'):
                for r in await pg.evaluate(REGION, neg):
                    # a negative is judged on the check it breaks: the site's on the region, the stamp's on the islands
                    if neg and (neg == 'landforms') != ('islands' in r['name']):
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
