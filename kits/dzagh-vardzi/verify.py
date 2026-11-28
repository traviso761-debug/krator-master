#!/usr/bin/env python3
"""Headless verification for the Petty Gorge-Kingdoms of Dzagh-Vardzi kit (kits/dzagh-vardzi).

  python3 verify.py dist/dzagh-vardzi.html [--views "Opening|Overview"] [--cut] [--night] [--cam cx,cy,cz,tx,ty,tz]
                                           [--assert] [--eval "()=>..."] [--out shots] [--size 1280x800] [--only k1,k2] [--all-views]

Uses the shared harness (tools/harness.py: verify_page with checks=harness.SURVEY) and runs all kit invariants,
including `all-surfaces-textured` (0 untextured building/furniture/fauna/terrain meshes) and `z-fighting`
(world-space coplanar overlapping triangles audit via window._api.zfightAudit()).
"""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness as _harness                          # noqa: E402
from harness import parse_views, verify_page        # noqa: E402

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ASSERT_JS = r"""()=>{
 const A=window._api;const R=[];const F=A.footprints();
 const over=F.filter(f=>f.ex>1.6||f.ez>1.6);
 R.push({name:'inside-declared-footprint',ok:!over.length,detail:over.length?over.map(f=>`${f.key} ${f.bw}x${f.bd} vs ${f.w}x${f.d}`).join(' | '):F.length+' sites within declared footprint'});
 const hh=F.filter(f=>f.eh>1.5);
 R.push({name:'inside-declared-height',ok:!hh.length,detail:hh.length?hh.map(f=>`${f.key} h ${f.bh} vs ${f.h}`).join(' | '):'all sites within declared height'});
 R.push({name:'no-nan',ok:A.nanSweep()===0,detail:'nan meshes: '+A.nanSweep()});
 const bad=Object.keys(A.DEFS).filter(k=>A.DEFS[k].cls==='building'&&!(A.DEFS[k].tags.types||[]).length);
 R.push({name:'buildings-typed',ok:!bad.length,detail:bad.length?bad.join(', '):'every building has culture dzagh-vardzi and types'});
 const T=A.tags().audit,UV=T.unknownValues||{},uk=Object.keys(UV),onlyDV=uk.every(k=>k==='culture:dzagh-vardzi');
 R.push({name:'tags-vocabulary',ok:(T.unknown===0||onlyDV)&&!(T.unknownKeys&&Object.keys(T.unknownKeys).length)&&T.missingCulture===0&&T.missingTypes===0,
  detail:T.records+' records ('+Object.entries(T.byClass).map(e=>e.join(' ')).join(', ')+'), unknown '+T.unknown+(T.unknown?' '+JSON.stringify(UV)+JSON.stringify(T.unknownKeys):'')});
 R.push({name:'kit-coverage',ok:A.kitCoverage().length===0,detail:A.kitCoverage().join(', ')||'every def placed on sheet ('+Object.keys(A.DEFS).length+' defs)'});
 const heavy=F.filter(f=>f.tris>(f.budget||120000));
 R.push({name:'triangle-budget',ok:!heavy.length,detail:heavy.length?heavy.map(f=>f.key+' '+f.tris+' > '+f.budget).join(' | '):'heaviest '+Math.max(...F.map(f=>f.tris))+' tris'});
 const nf=A.doors().filter(d=>!d.front||![d.front.local.x,d.front.local.z,d.front.local.yaw].every(isFinite)||d.front.source==='default');
 R.push({name:'front-door',ok:!nf.length,detail:nf.length?nf.map(d=>d.key+' ('+(d.front&&d.front.source)+')').join(', '):A.doors().length+' sites carry an explicit door() or declared front'});
 const DA=A.doorsAudit();
 R.push({name:'doors-and-waterwheels',ok:!DA.bad.length&&DA.doors>=40&&DA.spinners>=4,detail:DA.bad.length?DA.bad.slice(0,8).join(', '):DA.doors+' operable doors, '+DA.spinners+' animated rotating overshot waterwheels'});
 const fu=A.furniture();const miss=Object.keys(fu.missing);
 R.push({name:'furniture-keys',ok:!miss.length,detail:miss.length?'missing: '+miss.map(k=>k+' x'+fu.missing[k]).join(', '):fu.placed+' pieces from '+fu.keys+' catalog/dzagh-vardzi keys, '+fu.tris+' tris'});
 const cutSites=fu.perSite.filter(s=>A.DEFS[s.key].cut),bare=cutSites.filter(s=>s.pieces<4);
 const furnBldgs=new Set(cutSites.filter(s=>s.pieces>=4).map(s=>s.key)).size;
 R.push({name:'buildings-furnished',ok:!bare.length&&furnBldgs>=45,detail:bare.length?bare.map(s=>s.key+' '+s.pieces).join(', '):'every cut-away building has 4+ pieces ('+furnBldgs+' unique buildings furnished, '+cutSites.length+' cut-away sites)'});
 {
  const TR=window.DV_TRADES||[],tb=[];
  for(const t of TR){if(t.na)continue;const L=(t.dzaghVardzi||[]).filter(k=>A.DEFS[k]);if(!L.length)tb.push(t.trade);}
  const carried=TR.filter(t=>!t.na).length;
  R.push({name:'voth-trades',ok:carried>=38&&!tb.length,detail:tb.length?'missing trade: '+tb.join(', '):carried+' of '+TR.length+' Voth census trades carried (na: '+TR.filter(t=>t.na).map(t=>t.trade).join(', ')+')'});
 }
 {
  const LK=window.dvOreLinks?dvOreLinks():{nodes:[],mines:[]},idle=LK.mines.filter(m=>!m.source),T0=[];
  const ok=(c,t)=>{if(!c)T0.push(t);};
  const n=(id,kind,grade,x,z)=>({id,kind,grade,x,z}),M0={x:0,z:0,works:'mine'};
  ok((resSource(M0,[n('a','iron','low',50,0),n('b','tin','high',100,0)])||{}).node==='a','nearest first');
  ok((resSource(M0,[n('o','oil','high',10,0),n('s','coal','low',60,0)])||{}).node==='s','mine skips oil');
  const nk=Object.keys(RES_ORE.kinds).length*Object.keys(RES_ORE.grades).length;
  ok(LK.nodes.length===nk,'every resource node placed ('+LK.nodes.length+' of '+nk+')');
  R.push({name:'mine-sources',ok:LK.mines.length>0&&!idle.length&&!T0.length,detail:T0.length||idle.length?'failed: '+T0.concat(idle.map(m=>m.key+' idle')).join(', '):
   LK.mines.length+' mines working nearest nodes ('+LK.mines.map(m=>m.key+' -> '+m.source.kind+' '+m.source.grade+' at '+Math.round(m.source.dist)+' m').join('; ')+'); '+LK.nodes.length+' resource nodes placed'});
 }
 const subs=Object.keys(A.DEFS).filter(k=>A.DEFS[k].cls==='building'&&!['aul','flume'].includes(A.DEFS[k].tags.style));
 R.push({name:'mode-styled',ok:!subs.length,detail:subs.length?'missing style aul|flume: '+subs.join(', '):'every building tagged style aul or flume'});
 const lifeRecs=A.REG.filter(r=>r.cls==='life');const nol=lifeRecs.filter(r=>!A.SV_LIFE.some(l=>l.id===r.tid));
 R.push({name:'life-records',ok:!nol.length&&lifeRecs.length>0,detail:nol.length?'missing life data: '+nol.map(r=>r.key).join(', '):lifeRecs.length+' livestock/mounts with faction, sub-faction, job & 24h schedule'});
 const M=A.materials();
 R.push({name:'material-records',ok:!!(M&&M.records&&M.records.length>=25),detail:M?M.records.length+' records, '+M.records.filter(r=>r.lib).length+' from library':'none'});
 /* Mandate 1: ALL surfaces (buildings, ablaq, jade, waterwheels, flumes, ground, fauna, AND furniture) wired to real textures */
 const TA=A.textureAudit();
 R.push({name:'all-surfaces-textured',ok:TA.untextured.length===0&&TA.buildingMeshes>0&&TA.furnitureMeshes>0,
  detail:TA.untextured.length?'UNTEXTURED ('+TA.untextured.length+'): '+TA.untextured.slice(0,12).join(', '):
   '0 untextured meshes ('+TA.textured+' textured: '+TA.buildingMeshes+' building/terrain/prop, '+TA.furnitureMeshes+' furniture batches, '+TA.faunaMeshes+' fauna; '+TA.exemptCount+' intentional glow/glass/sea)'});
 /* Mandate 2b: Outward triangle winding, backface-culling & opaque flumeWater audit */
 const WA=A.windingAudit();
 R.push({name:'winding-and-normals',ok:!!WA.ok&&WA.negDet===0&&WA.vnMismatch===0&&WA.waterGlassMisuse===0&&WA.shellBad.length===0,
  detail:WA.ok?`0 inward/culled triangles across ${WA.totalCheckedTris} world tris (${WA.probes} shell probes: ${Object.entries(WA.counts).map(e=>e.join('=')).join(', ')})`:
   `negDet=${WA.negDet} vnMismatch=${WA.vnMismatch} waterGlass=${WA.waterGlassMisuse} flumeWater=${WA.flumeWaterOk} shellBad(${WA.shellBad.length}): ${WA.shellBad.slice(0,8).join(' | ')}`});
 /* Mandate 3: Geometric world-space coplanar z-fighting audit */
 const ZA=A.zfightAudit({tol:0.0015,pen:0.004});
 R.push({name:'z-fighting',ok:ZA.overlaps===0,
  detail:ZA.overlaps===0?'0 coplanar overlaps across '+ZA.totalTris+' world triangles (tol '+ZA.tolMm+' mm)':
   ZA.overlaps+' coplanar triangle overlaps across '+ZA.totalTris+' tris; worst: '+ZA.pairs.slice(0,10).map(p=>`${p.site} [${p.pair}] x${p.count} @(${p.at})`).join(' | ')});
 /* Mandate 4: Zero white-quartz needle-spires + Hooks 2-4 Wonders placed, walkable, furnished & 0-z-fight */
 const RH=A.retconAndHooksAudit({village:false,zf:ZA});
 R.push({name:'zero-white-quartz-spires',ok:!!RH.quartzOk,
  detail:RH.quartzOk?`0 building/roof quartz tris (${RH.slateCrowns} stepped slate/basalt/crimson-tuff needle crowns, ${RH.crownMatMeshes} slate/basalt/tuff/verdigris meshes; ${RH.resNodeQuartzTris} kits/resources gold-vein outcrop tris)`:
   `quartzBuildingTris=${RH.quartzBuildingTris} (${RH.quartzNames.join(',')}), slateCrowns=${RH.slateCrowns}`});
 R.push({name:'hooks-2-to-4-wonders',ok:!!RH.hooksOk,
  detail:RH.hooksOk?RH.hooks.map(h=>`${h.key} (${h.pieces} furn, walk=${h.walkHits}, zf=${h.zOverlaps})`).join('; ')+' | bespoke: '+Object.entries(RH.bespokeCounts).map(e=>e.join('=')).join(', '):
   'PROBLEMS: '+RH.problems.join(' | ')});
 return R;
}"""

VILLAGE_ASSERT_JS = r"""()=>{
 const A=window._api,FL=window.DV_FLUME_VILLAGE;const R=[];
 const F=A.footprints(),B=F.filter(f=>A.DEFS[f.key]&&A.DEFS[f.key].cls==='building');
 const over=F.filter(f=>f.ex>1.6||f.ez>1.6),hh=F.filter(f=>f.eh>1.5);
 R.push({name:'village-sites',ok:B.length>=10&&B.length<=16&&!over.length&&!hh.length,
  detail:`${B.length} DV kit buildings (${F.length} total sites) within declared footprint & height`+(over.length?' | over: '+over.map(f=>`${f.key} ${f.bw}x${f.bd} vs ${f.w}x${f.d}`).join(','):'')+(hh.length?' | tall: '+hh.map(f=>`${f.key} ${f.bh} vs ${f.h}`).join(','):'')});
 R.push({name:'no-nan',ok:A.nanSweep()===0,detail:'nan meshes: '+A.nanSweep()});
 const T=A.tags().audit,UV=T.unknownValues||{},uk=Object.keys(UV),onlyDV=uk.every(k=>k==='culture:dzagh-vardzi');
 R.push({name:'tags-vocabulary',ok:(T.unknown===0||onlyDV)&&!(T.unknownKeys&&Object.keys(T.unknownKeys).length)&&T.missingCulture===0&&T.missingTypes===0,
  detail:T.records+' records ('+Object.entries(T.byClass).map(e=>e.join(' ')).join(', ')+')'});
 const DA=A.doorsAudit();
 R.push({name:'doors-and-waterwheels',ok:!DA.bad.length&&DA.doors>=10&&DA.spinners>=4,
  detail:DA.bad.length?DA.bad.slice(0,8).join(', '):`${DA.doors} operable doors, ${DA.spinners} animated rotating overshot waterwheels`});
 const fu=A.furniture(),miss=Object.keys(fu.missing);
 R.push({name:'furniture-keys',ok:!miss.length&&fu.placed>=40,
  detail:miss.length?'missing: '+miss.join(', '):`${fu.placed} furniture pieces placed (${fu.tris} tris)`});
 const TA=A.textureAudit();
 R.push({name:'all-surfaces-textured',ok:TA.untextured.length===0&&TA.buildingMeshes>0&&TA.furnitureMeshes>0,
  detail:TA.untextured.length?'UNTEXTURED ('+TA.untextured.length+'): '+TA.untextured.slice(0,12).join(', '):
   `0 untextured meshes (${TA.textured} textured: ${TA.buildingMeshes} building/terrain/flume, ${TA.furnitureMeshes} furniture, ${TA.faunaMeshes} fauna)`});
 const WA=A.windingAudit();
 R.push({name:'winding-and-normals',ok:!!WA.ok&&WA.negDet===0&&WA.vnMismatch===0&&WA.waterGlassMisuse===0&&WA.shellBad.length===0,
  detail:WA.ok?`0 inward/culled triangles across ${WA.totalCheckedTris} world tris (${WA.probes} shell probes)`:
   `negDet=${WA.negDet} vnMismatch=${WA.vnMismatch} shellBad: ${WA.shellBad.slice(0,8).join(' | ')}`});
 const ZA=A.zfightAudit({tol:0.0015,pen:0.004});
 R.push({name:'z-fighting',ok:ZA.overlaps===0,
  detail:ZA.overlaps===0?`0 coplanar overlaps across ${ZA.totalTris} world triangles (tol ${ZA.tolMm} mm)`:
   `${ZA.overlaps} overlaps: `+ZA.pairs.slice(0,8).map(p=>`${p.site} [${p.pair}] x${p.count} @(${p.at})`).join(' | ')});
 const RH=A.retconAndHooksAudit({village:true,zf:ZA});
 R.push({name:'zero-white-quartz-spires',ok:!!RH.quartzOk,
  detail:RH.quartzOk?`0 building/roof quartz tris (${RH.slateCrowns} stepped slate/basalt/crimson-tuff needle crowns)`:
   `quartzBuildingTris=${RH.quartzBuildingTris}, slateCrowns=${RH.slateCrowns}`});
 R.push({name:'hooks-2-to-4-wonders',ok:!!RH.hooksOk,
  detail:RH.hooksOk?RH.hooks.map(h=>`${h.key} (${h.pieces} furn, walk=${h.walkHits}, zf=${h.zOverlaps})`).join('; '):
   'PROBLEMS: '+RH.problems.join(' | ')});
 const FA=FL&&FL.audit?FL.audit():null;
 R.push({name:'gravity-flume-continuity',ok:!!(FA&&FA.ok),
  detail:FA?FA.detail:'DV_FLUME_VILLAGE.audit() missing'});
 return R;
}"""


async def run(a):
    is_village = a.village or (a.html and 'dzagh-vardzi-village' in os.path.basename(a.html))
    html = a.html or os.path.join(HERE, 'dist', 'dzagh-vardzi-village.html' if is_village else 'dzagh-vardzi.html')
    out_dir = a.out or os.path.join(HERE, 'shots', 'village' if is_village else '')
    out_dir = out_dir.rstrip('/\\')
    os.makedirs(out_dir, exist_ok=True)
    bad = False
    q = ['t=4']
    if a.only:
        q.append('only=' + a.only)
    async with verify_page(html, here=HERE, size=a.size, query='?' + '&'.join(q), settle_ms=0, checks=_harness.SURVEY) as V:
        pg, fails = V.page, V.fails
        if not V.ready:
            print('never ready')
            fails.append('build timeout')
        try:
            await pg.wait_for_function("(window._texPending||0)===0", timeout=120000)
        except Exception:
            print('textures still decoding after 120 s')
        await pg.wait_for_timeout(800)
        e = await pg.evaluate("document.getElementById('errs').textContent")
        errs = list(V.errs) + ['console: ' + t for k, t in pg.krator_console if k == 'error']
        print('ERROR PANEL:', e.strip() or '(clean)')
        print('build:', json.dumps(await pg.evaluate("window._build||null")))
        if e.strip() or errs:
            bad = True
        for x in errs[:8]:
            print('pageerror:', x)
        if a.assert_:
            js = VILLAGE_ASSERT_JS if is_village else ASSERT_JS
            for r in await pg.evaluate(js):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:700])
                bad |= not r['ok']
        if a.cut:
            await pg.evaluate("cutSet(true)")
        if a.night:
            await pg.evaluate("nightSet(true)")
        if a.eval:
            print(json.dumps(await pg.evaluate(a.eval), indent=1)[:6000])
        if a.cam:
            v = [float(t) for t in a.cam.split(',')]
            await pg.evaluate("v=>setView(...v)", v)
            await pg.wait_for_timeout(900)
            await V.shot(os.path.join(out_dir, 'cam.png'), view='cam')
            print('shot cam.png')
        all_v = await pg.evaluate("Object.keys(VIEWS)")
        views = all_v if a.all_views else parse_views(a.views, all_v)
        for i, vn in enumerate(views):
            ok = await pg.evaluate("n=>{if(!VIEWS[n])return false;setView(...VIEWS[n]);return true;}", vn)
            if not ok:
                print('no view', vn)
                continue
            await pg.wait_for_timeout(250)
            idx = all_v.index(vn) if vn in all_v else i
            fn = os.path.join(out_dir, ('%02d-' % idx) + ''.join(c if c.isalnum() else '_' for c in vn)[:44] + '.png')
            await V.shot(fn, view=vn)
            print('shot', fn)
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e:
            print('ERROR PANEL after views:', e2)
            bad = True
        await pg.evaluate("window.requestAnimationFrame=()=>0")
        if bad:
            fails.append('kit checks (error panel, page errors or an assert)')
    sys.exit(V.exit())


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html', nargs='?')
    ap.add_argument('--village', action='store_true')
    ap.add_argument('--views')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--only')
    ap.add_argument('--cut', action='store_true')
    ap.add_argument('--night', action='store_true')
    ap.add_argument('--cam')
    ap.add_argument('--eval')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out')
    ap.add_argument('--size', default='1280x800')
    asyncio.run(run(ap.parse_args()))

