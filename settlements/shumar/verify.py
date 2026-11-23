#!/usr/bin/env python3
"""Headless Playwright + SwiftShader verification for Amaro, capital of Shumar (settlements/shumar/PLAN.md).

  PW_CHROMIUM=/usr/bin/chromium /home/antigravity/.venv/bin/python settlements/shumar/verify.py --assert --no-cache
"""
import argparse, asyncio, datetime, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness as _harness  # noqa: E402
from harness import parse_views, verify_page  # noqa: E402

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ASSERT_JS = r"""()=>{
 const A = window._api;
 const AM_INFO = window._amaro;
 const R = [];

 R.push({name:'no-nan', ok:A.nanSweep()===0, detail:'nan meshes '+A.nanSweep()});

 /* 1. Drawn ground & 4-layer KGROUND terrain */
 {
  const dh = typeof KDRAWN!=='undefined' ? KDRAWN.h(0, -560) : NaN;
  const th = typeof amaroH!=='undefined' ? amaroH(0, -560) : NaN;
  const diff = Math.abs(dh - th);
  const gl = AM_INFO && AM_INFO.groundLayers ? AM_INFO.groundLayers.length : 0;
  R.push({
   name:'drawn-ground-and-layers',
   ok:typeof KDRAWN!=='undefined' && KDRAWN.sources.length>=1 && isFinite(diff) && diff<2.5 && gl>=4,
   detail:typeof KDRAWN!=='undefined'
    ? (KDRAWN.sources.length+' KDRAWN source(s), |KDRAWN.h-amaroH|='+diff.toFixed(2)+' m, kground layers='+gl)
    : 'KDRAWN missing'
  });
 }

 /* 2. Core/water confluence rivers + sabil basin */
 {
  const wBad = typeof WATER!=='undefined' ? WATER.checkPrograms(renderer, scene) : ['WATER missing'];
  const flows = AM_INFO ? AM_INFO.riversCount : 0;
  const stills = AM_INFO ? AM_INFO.stillCount : 0;
  R.push({
   name:'water-shaders-clean',
   ok:wBad.length===0 && flows>=4 && stills>=1,
   detail:wBad.length ? ('shader errs: '+wBad.join('; ')) : (flows+' river/mill-race ribbons + '+stills+' still basin compiled cleanly')
  });
 }

 /* 3. Core/tags vocabulary across all hero, instanced & vacant sites */
 {
  const T = A.tags().audit;
  const ukKeys = Object.keys(T.unknownKeys||{});
  const uv = T.unknownValues||{};
  const uvKeys = Object.keys(uv);
  const onlyShumari = uvKeys.every(k=>k==='culture:shumari');
  R.push({
   name:'tags-vocabulary',
   ok:T.records>=1700 && T.missingCulture===0 && T.missingTypes===0 && ukKeys.length===0 && onlyShumari,
   detail:T.records+' records ('+Object.entries(T.byClass).map(e=>e.join(' ')).join(', ')+'), unknownKeys='+ukKeys.length+', uv='+JSON.stringify(uv)
  });
 }

 /* 4. Owner Call #2: Greater Amaro census (ssgsv5zbd2 + amaro.citadel + amaro.necropolis + amaro.gisr = 12,850 ±5%) + 6 ring hamlets */
 {
  const checkCensus = c => {
   if(!c || !c.bySim) return false;
   const s = c.bySim;
   return Math.abs(c.total - 12850) <= 642
    && Math.abs((s['ssgsv5zbd2']||0) - 10600) <= 530
    && Math.abs((s['amaro.gisr']||0) - 850) <= 120
    && Math.abs((s['amaro.citadel']||0) - 1100) <= 140
    && Math.abs((s['amaro.necropolis']||0) - 300) <= 60;
  };
  const c = AM_INFO && AM_INFO.census;
  const s = (c && c.bySim) || {};
  const ok = checkCensus(c) && AM_INFO.ringVillages===6 && Math.abs(AM_INFO.ringPeople - 1310)<=150 && AM_INFO.totalBuildings>=1750;
  const negOk = !checkCensus({total:12000, bySim:{'ssgsv5zbd2':10600,'amaro.gisr':0,'amaro.citadel':1100,'amaro.necropolis':300}})
   && !checkCensus({total:9000, bySim:{'ssgsv5zbd2':6750,'amaro.gisr':850,'amaro.citadel':1100,'amaro.necropolis':300}});
  R.push({
   name:'greater-amaro-census',
   ok:ok && negOk,
   detail:c ? ('Greater Amaro='+c.total+' (city='+s['ssgsv5zbd2']+', citadel='+s['amaro.citadel']+', necropolis='+s['amaro.necropolis']+', gisr='+s['amaro.gisr']+'), ring='+AM_INFO.ringPeople+' across '+AM_INFO.ringVillages+' hamlets, buildings='+AM_INFO.totalBuildings+', neg='+negOk) : 'missing _amaro.census'
  });
 }

 /* 5. Owner Call #3: Terraced Outlander Customs Shelf (-38 m below Upper City North Gate rim) */
 {
  const checkDrop = d => typeof d==='number' && isFinite(d) && d <= -34.0 && d >= -42.0;
  const d = AM_INFO ? AM_INFO.customsDropM : 0;
  const negOk = !checkDrop(-4.0) && !checkDrop(-115.0) && checkDrop(-38.0);
  R.push({
   name:'customs-shelf-terraced',
   ok:checkDrop(d) && negOk,
   detail:'Babu-Dalab & Babu-Iziz shelf mean Δy = '+d+' m vs Upper City North Gate (target -38 ± 4 m), neg='+negOk
  });
 }

 /* 6. Owner Call #4: Madinat al-Qubab cliff-lip Mamluk dome skyline silhouette */
 {
  const checkSky = (n, blk) => n >= 17 && blk === 0;
  const n = AM_INFO ? AM_INFO.skylineMonuments : 0;
  const blk = AM_INFO ? AM_INFO.skylineBlocked : 99;
  const negOk = !checkSky(8, 0) && !checkSky(17, 2) && checkSky(17, 0);
  R.push({
   name:'qubab-skyline-unblocked',
   ok:checkSky(n, blk) && negOk,
   detail:n+' cliff-crest monuments (15 sm_regiment_qubba + Hall of Blades + Doriyan stele), northern blockers='+blk+', neg='+negOk
  });
 }

 /* 7. Live regional economy simulation (AM_SIM on KREGION + SHUMAR_TUNE) */
 {
  const s = AM_INFO && AM_INFO.sim;
  const ok = !!(s && s.problems===0 && s.settlementsCount>=22 && s.city && s.citadel && s.necropolis && s.gisr && s.vothEmbargoCount>=6 && s.tequilaGloss && s.tequilaGloss.indexOf('Ṣūnu')>=0);
  R.push({
   name:'live-economy-sim',
   ok,
   detail:s ? ('day='+s.day+', settlements='+s.settlementsCount+', problems='+s.problems+', gisrPop='+s.gisr.people+', embargo='+s.vothEmbargoCount+', tequila='+s.tequilaGloss) : 'AM_SIM missing'
  });
 }

 /* 8. Free Giant vs Hearth human portal clearance + Mamluk dome spiral handedness */
 {
  const blds = A.REG.filter(r=>!r.parent && r.cls==='building');
  const summaries = blds.map(r=>{
   const prefix = r.key+'.'+(r._doorOrd==null?0:r._doorOrd)+'.';
   const doors = KDOOR.list.filter(d=>d.id.indexOf(prefix)===0).map(d=>({id:d.id,h:d.h,w:d.w,locked:d.locked}));
   return {key:r.key, v:r.v, giant:!!r.giant, solidMarker:!!r.solidMarker, vaultH:r.vaultH, doors};
  });
  const giants = summaries.filter(s=>s.giant);
  const humans = summaries.filter(s=>!s.giant);
  const badG = summaries.filter(s=>!smGiantValid(s));
  const negG = !smGiantValid({key:'sm_regiment_qubba',giant:true,vaultH:8.8,doors:[{h:2.2,locked:false}]})
   && !smGiantValid({key:'sm_sample_hearth_bay',giant:false,vaultH:3.4,doors:[{h:4.4,locked:false}]});
  R.push({
   name:'giant-clearance',
   ok:giants.length>=35 && humans.length>=6 && badG.length===0 && negG,
   detail:badG.length ? ('failed '+JSON.stringify(badG)) : (giants.length+' Free Giant hero sites and '+humans.length+' Hearth/human hero sites verified, neg='+negG)
  });

  const domes = typeof SM_DOMES!=='undefined' ? SM_DOMES : [];
  const spiralStd = domes.filter(d=>d.style==='spiral' && d.key!=='sm_doriyan_stele' && d.hand===1);
  const spiralMir = domes.filter(d=>d.style==='spiral' && d.key==='sm_doriyan_stele' && d.hand===-1);
  const carved = domes.filter(d=>d.style==='carved');
  const badD = domes.filter(d=>!smDomeValid(d));
  const negD = !smDomeValid({key:'sm_regiment_qubba',style:'spiral',hand:-1,span:7.8,h:6.45})
   && !smDomeValid({key:'sm_doriyan_stele',style:'spiral',hand:1,span:6.2,h:5.08});
  R.push({
   name:'dome-handedness',
   ok:domes.length>=25 && spiralStd.length>=10 && spiralMir.length>=1 && carved.length>=6 && badD.length===0 && negD,
   detail:badD.length ? ('invalid '+JSON.stringify(badD)) : (domes.length+' Mamluk domes ('+spiralStd.length+' +1 spiral, '+spiralMir.length+' -1 Doriyan mirror, '+carved.length+' star-carved), neg='+negD)
  });
 }

 /* 9. Shumar highland flora band + active construction sites */
 {
  const FL = window._flora;
  const flOff = new URLSearchParams(location.search).get('flora')==='0';
  const flOk = flOff || !!(FL && FL.station==='shumar' && FL.trees>=8 && FL.records>=50 && FL.spaceCount>=50);
  R.push({
   name:'shumar-flora',
   ok:flOk,
   detail:flOff ? 'skipped (?flora=0)' : (FL ? ('station='+FL.station+', trees='+FL.trees+', records='+FL.records+', kspace='+FL.spaceCount) : 'missing _flora')
  });

  const vc = AM_INFO ? AM_INFO.vacantCount : 0;
  const cb = AM_INFO ? AM_INFO.consTexBound : 0;
  R.push({
   name:'construction-sites',
   ok:vc>=8 && cb>=6,
   detail:vc+' active KCONS + KCITY.constructMesh sites, '+cb+' construction library materials bound'
  });
 }

 /* 10. Furniture, interiors & exporter */
 {
  const fu = A.furniture();
  const miss = Object.keys(fu.missing||{});
  const ix = A.interiors && A.interiors();
  const ixOk = !!(ix && ix.sets && ix.sets.includes('shumari') && !ix.errors.length && (!ix.on || (ix.buildings>=30 && ix.rooms>=70 && ix.pieces>=400)));
  R.push({
   name:'furniture-and-interiors',
   ok:miss.length===0 && ixOk,
   detail:miss.length ? ('missing furn: '+miss.join(', ')) : ('furn placed='+fu.placed+' ('+fu.keys+' keys), SVIX on='+(ix&&ix.on)+', units='+(ix&&ix.units)+', blds='+(ix&&ix.buildings)+', pieces='+(ix&&ix.pieces))
  });

  const parts = A.exportParts ? A.exportParts() : [];
  const expOk = ['terrain','city','buckets','materials'].every(k=>parts.includes(k));
  R.push({
   name:'exporter-wired',
   ok:expOk,
   detail:'export parts: '+parts.join(', ')
  });
 }

 /* 11. 100% Surface & Furniture Textures Wired (excluding procedural GLSL core/water surfaces) */
 {
  const libOn = typeof KMAT!=='undefined' && KMAT.mode==='lib';
  if(!libOn){
   R.push({name:'surfaces-and-furniture-textured', ok:true, detail:'procedural mode (?mat=proc)'});
  } else {
   const inFurn = o => { for(let p=o;p;p=p.parent){ if(p.userData&&(p.userData.furniture||p.userData.interiors)) return true; } return false; };
   const isWater = (o, mt) => !!((mt.userData && mt.userData.water) || (o.userData && o.userData.water) || (o.name && o.name.indexOf('water:')===0));
   const sMats=new Set(), fMats=new Set(), sUntex=[], fUntex=[];
   scene.traverse(o=>{
    if(!o.isMesh || !o.visible || !o.geometry) return;
    const pos = o.geometry.attributes && o.geometry.attributes.position;
    if(!pos || pos.count===0) return;
    const furn = inFurn(o);
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for(const mt of ms){
     if(!mt || mt.transparent || mt.isMeshBasicMaterial || mt.isShaderMaterial || mt.isRawShaderMaterial || isWater(o, mt)) continue;
     const hasTex = !!(mt.map && mt.map.isTexture);
     if(furn){
      if(!fMats.has(mt)){
       fMats.add(mt);
       const ud = mt.userData||{};
       if(!hasTex) fUntex.push((ud.family||'furn')+(ud.texFamily?'/'+ud.texFamily:''));
      }
     } else {
      if(!sMats.has(mt)){
       sMats.add(mt);
       if(!hasTex) sUntex.push(mt.name || o.name || mt.type);
      }
     }
    }
   });
   const ok = sMats.size>=25 && fMats.size>=8 && sUntex.length===0 && fUntex.length===0;
   R.push({
    name:'surfaces-and-furniture-textured',
    ok,
    detail:ok
     ? ('100% textured: '+sMats.size+' opaque surface/terrain/construction/flora materials and '+fMats.size+' opaque furniture/interior materials carry library maps (0 untextured)')
     : ('untextured surfaces=['+sUntex.join(', ')+'] furniture=['+fUntex.join(', ')+'] (surf='+sMats.size+', furn='+fMats.size+')')
   });
  }
 }

 return R;
}"""


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    bad = False
    q = ['t=4']
    if a.query:
        q.append(a.query.lstrip('?'))
    async with verify_page(a.html, here=HERE, size=a.size, query='?' + '&'.join(q), settle_ms=0, checks=_harness.SURVEY) as V:
        pg, fails = V.page, V.fails
        if not V.ready:
            print('never ready', flush=True)
            fails.append('build timeout')
        try:
            await pg.wait_for_function('(window._texPending||0)===0', timeout=150000)
        except Exception:
            print('textures still decoding after 150 s', flush=True)
        await pg.evaluate("""()=>new Promise(res=>{
            window._origRAF = window.requestAnimationFrame;
            window._khostFrame = null;
            window.requestAnimationFrame = fn => { window._khostFrame = fn; return 0; };
            const poll = () => {
                if (window._khostFrame) { window._khostFrame(); res(); }
                else setTimeout(poll, 50);
            };
            setTimeout(poll, 50);
        })""")
        e = await pg.evaluate("document.getElementById('errs').textContent")
        errs = list(V.errs) + ['console ' + t for k, t in pg.krator_console if k == 'error']
        print('ERROR PANEL:', e.strip() or '(clean)', flush=True)
        print('build:', json.dumps(await pg.evaluate('window._build||null')), flush=True)
        print('render:', json.dumps(await pg.evaluate('({calls:renderer.info.render.calls,tris:renderer.info.render.triangles})')), flush=True)
        print('amaro:', json.dumps(await pg.evaluate('window._amaro||null'))[:3000], flush=True)
        if e.strip() or errs:
            bad = True
        for x in errs[:8]:
            print('pageerror:', x, flush=True)
        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:4000], flush=True)
                bad |= not r['ok']
        if a.export:
            os.makedirs(a.export, exist_ok=True)
            parts = await pg.evaluate('()=>window._api.exportParts()')
            for k in parts:
                data = await pg.evaluate('k=>JSON.stringify(window._api.export(k))', k)
                with open(os.path.join(a.export, k + '.json'), 'w', encoding='utf-8', newline='\n') as fh:
                    fh.write(data)
                print('export %-10s %8d KB' % (k, len(data) // 1024), flush=True)
            files = {f: os.path.getsize(os.path.join(a.export, f)) for f in sorted(os.listdir(a.export)) if f.endswith('.json') and f != 'meta.json'}
            with open(os.path.join(a.export, 'meta.json'), 'w', encoding='utf-8', newline='\n') as fh:
                json.dump({
                    'case': 'shumar',
                    'page': 'settlements/shumar/dist/shumar.html',
                    'kind': 'data',
                    'query': '&'.join(q),
                    'files': files,
                    'page_errors': errs[:20],
                    'exported': datetime.date.today().isoformat()
                }, fh, indent=2)
        if a.cut:
            await pg.evaluate('cutSet(true)')
        if a.night:
            await pg.evaluate('nightSet(true)')
        if a.eval:
            print(json.dumps(await pg.evaluate(a.eval), indent=1)[:12000], flush=True)
        if a.cam:
            v = [float(t) for t in a.cam.split(',')]
            await pg.evaluate('v=>{if(typeof KHOST!=="undefined"&&KHOST.setView)KHOST.setView(...v);else setView(...v);if(window._khostFrame)window._khostFrame();}', v)
            await V.shot(os.path.join(a.out, 'cam.png'), view='cam')
            print('shot cam.png', flush=True)
        all_v = await pg.evaluate('Object.keys(VIEWS)')
        views = [] if a.views == 'none' else (all_v if a.all_views else parse_views(a.views, all_v))
        for i, vn in enumerate(views):
            found = await pg.evaluate('n=>{if(!VIEWS[n])return false;if(typeof KHOST!=="undefined"&&KHOST.go)KHOST.go(n);else setView(...VIEWS[n]);if(window._khostFrame)window._khostFrame();return true;}', vn)
            if not found:
                print('no view', vn, flush=True)
                continue
            fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:48] + '.png')
            await V.shot(fn, view=vn)
            print('shot', fn, flush=True)
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e:
            print('ERROR PANEL after views:', e2, flush=True)
            bad = True
        if bad:
            fails.append('amaro checks (error panel, page errors or an assert)')
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html', nargs='?', default=os.path.join(HERE, 'dist', 'shumar.html'))
    ap.add_argument('--views', default='Opening|Overview|Cliff Lip Overlook|Madinat al-Qubab Skyline|Payaru-Gisr Gorge Bridge|Customs Shelf Babu-Dalab and Babu-Iziz')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--cut', action='store_true')
    ap.add_argument('--night', action='store_true')
    ap.add_argument('--cam', default='')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--eval', default='')
    ap.add_argument('--export', default='')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    ap.add_argument('--size', default='1280x800')
    ap.add_argument('--query', default='')
    sys.exit(asyncio.run(run(ap.parse_args())))
