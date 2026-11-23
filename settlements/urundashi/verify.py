#!/usr/bin/env python3
"""Headless Playwright + SwiftShader verification for Urundashi (settlements/urundashi/PLAN.md).

  PW_CHROMIUM=/usr/bin/chromium /home/antigravity/.venv/bin/python settlements/urundashi/verify.py --assert --no-cache
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
 const UR_INFO = window._urundashi;
 const R = [];

 R.push({name:'no-nan', ok:A.nanSweep()===0, detail:'nan meshes '+A.nanSweep()});

 /* 1. Drawn ground & 4-layer KGROUND steppe/gravel/basalt/cobble terrain */
 {
  const dh = typeof KDRAWN!=='undefined' ? KDRAWN.h(0, 0) : NaN;
  const th = typeof urundashiH!=='undefined' ? urundashiH(0, 0) : NaN;
  const diff = Math.abs(dh - th);
  const gl = UR_INFO && UR_INFO.groundLayers ? UR_INFO.groundLayers.length : 0;
  R.push({
   name:'drawn-ground-and-layers',
   ok:typeof KDRAWN!=='undefined' && KDRAWN.sources.length>=1 && isFinite(diff) && diff<2.0 && gl>=4,
   detail:typeof KDRAWN!=='undefined'
    ? (KDRAWN.sources.length+' KDRAWN source(s), |KDRAWN.h-urundashiH|='+diff.toFixed(2)+' m, kground layers='+gl)
    : 'KDRAWN missing'
  });
 }

 /* 2. Core/water snowmelt rivers + 2-branch defensive moat + crossroads sabil basin */
 {
  const wBad = typeof WATER!=='undefined' ? WATER.checkPrograms(renderer, scene) : ['WATER missing'];
  const flows = UR_INFO ? UR_INFO.riversCount : 0;
  const moatF = UR_INFO ? UR_INFO.moatFlowsCount : 0;
  const stills = UR_INFO ? UR_INFO.stillCount : 0;
  R.push({
   name:'water-and-moat-shaders',
   ok:wBad.length===0 && flows>=3 && moatF===2 && stills>=1,
   detail:wBad.length ? ('shader errs: '+wBad.join('; ')) : (flows+' snowmelt rivers/leat + '+moatF+' moat branches + '+stills+' sabil basin compiled cleanly')
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
   ok:T.records>=1050 && T.missingCulture===0 && T.missingTypes===0 && ukKeys.length===0 && onlyShumari,
   detail:T.records+' records ('+Object.entries(T.byClass).map(e=>e.join(' ')).join(', ')+'), unknownKeys='+ukKeys.length+', uv='+JSON.stringify(uv)
  });
 }

 /* 4. KCITY.grid irregular square, 4 moat bridges & SHUMAR_TUNE census + 9 works parity */
 {
  const expectedWorks = [
   'urundashi.crucible', 'urundashi.coal-hearth', 'urundashi.bladesmiths',
   'urundashi.armourers', 'urundashi.smithy', 'urundashi.powder',
   'urundashi.nitre', 'urundashi.stills', 'urundashi.stud'
  ];
  const checkUrundashi = u => {
   if(!u || !u.census || !u.census.worksPlaced) return false;
   const c = u.census;
   return Math.abs(c.total - 3500) <= 175
    && Math.abs((c.outlanders||0) - 200) <= 45
    && u.ringVillages === 5
    && Math.abs(u.ringPeople - 990) <= 95
    && u.moatBridges === 4
    && u.gridDroppedEdges >= 1
    && expectedWorks.every(w => (c.worksPlaced[w]||0) >= 1);
  };
  const ok = checkUrundashi(UR_INFO) && UR_INFO.totalBuildings >= 1050;
  const negOk = !checkUrundashi({census:{total:2200, outlanders:10, worksPlaced:{}}, ringVillages:5, ringPeople:990, moatBridges:4, gridDroppedEdges:2})
   && !checkUrundashi({census:{total:3500, outlanders:200, worksPlaced:{'urundashi.crucible':1}}, ringVillages:5, ringPeople:990, moatBridges:4, gridDroppedEdges:2});
  const c = UR_INFO && UR_INFO.census;
  R.push({
   name:'kcity-grid-and-shumar-tune-parity',
   ok:ok && negOk,
   detail:c ? ('town='+c.total+' (wikala outlanders='+c.outlanders+'), ring='+UR_INFO.ringPeople+' across '+UR_INFO.ringVillages+' hamlets, moatBridges='+UR_INFO.moatBridges+', works=9/9, buildings='+UR_INFO.totalBuildings+', neg='+negOk) : 'missing _urundashi'
  });
 }

 /* 5. Live regional economy simulation (UR_SIM on KREGION + SHUMAR_TUNE) */
 {
  const s = UR_INFO && UR_INFO.sim;
  const ok = !!(s && s.problems===0 && s.settlementsCount>=60 && s.urundashi && (s.urundashi.made.steel||0)>0 && (s.urundashi.made.blades||0)>0 && (s.urundashi.made.mounts||0)>0 && s.tequilaGloss && s.tequilaGloss.indexOf('Ṣūnu')>=0);
  R.push({
   name:'live-economy-sim',
   ok,
   detail:s ? ('day='+s.day+', settlements='+s.settlementsCount+', problems='+s.problems+', steel='+Math.round(s.urundashi.made.steel||0)+', blades='+Math.round(s.urundashi.made.blades||0)+', mounts='+(s.urundashi.made.mounts||0).toFixed(2)+', tequila='+s.tequilaGloss) : 'UR_SIM missing'
  });
 }

 /* 6. Free Giant vs Hearth human portal clearance + Mamluk dome spiral handedness */
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
   ok:giants.length>=20 && humans.length>=8 && badG.length===0 && negG,
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
   ok:domes.length>=8 && spiralStd.length>=3 && spiralMir.length>=1 && carved.length>=2 && badD.length===0 && negD,
   detail:badD.length ? ('invalid '+JSON.stringify(badD)) : (domes.length+' Mamluk domes ('+spiralStd.length+' +1 spiral, '+spiralMir.length+' -1 Doriyan mirror, '+carved.length+' star-carved), neg='+negD)
  });
 }

 /* 7. Shumar highland flora + active construction sites */
 {
  const FL = window._flora;
  const flOff = new URLSearchParams(location.search).get('flora')==='0';
  const flOk = flOff || !!(FL && FL.station==='shumar' && FL.trees>=8 && FL.records>=50 && FL.spaceCount>=50);
  R.push({
   name:'shumar-flora',
   ok:flOk,
   detail:flOff ? 'skipped (?flora=0)' : (FL ? ('station='+FL.station+', trees='+FL.trees+', records='+FL.records+', kspace='+FL.spaceCount) : 'missing _flora')
  });

  const vc = UR_INFO ? UR_INFO.vacantCount : 0;
  const cb = UR_INFO ? UR_INFO.consTexBound : 0;
  R.push({
   name:'construction-sites',
   ok:vc>=8 && cb>=6,
   detail:vc+' active KCONS + KCITY.constructMesh sites, '+cb+' construction library materials bound'
  });
 }

 /* 8. Furniture, interiors & exporter */
 {
  const fu = A.furniture();
  const miss = Object.keys(fu.missing||{});
  const ix = A.interiors && A.interiors();
  const ixOk = !!(ix && ix.sets && ix.sets.includes('shumari') && !ix.errors.length && (!ix.on || (ix.buildings>=25 && ix.rooms>=55 && ix.pieces>=320)));
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

 /* 9. 100% Surface & Furniture Textures Wired (excluding procedural GLSL core/water surfaces) */
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
            setTimeout(() => {
                if (window._khostFrame) window._khostFrame();
                res();
            }, 60);
        })""")
        e = await pg.evaluate("document.getElementById('errs').textContent")
        errs = list(V.errs) + ['console ' + t for k, t in pg.krator_console if k == 'error']
        print('ERROR PANEL:', e.strip() or '(clean)', flush=True)
        print('build:', json.dumps(await pg.evaluate('window._build||null')), flush=True)
        print('render:', json.dumps(await pg.evaluate('({calls:renderer.info.render.calls,tris:renderer.info.render.triangles})')), flush=True)
        print('urundashi:', json.dumps(await pg.evaluate('window._urundashi||null'))[:3000], flush=True)
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
                    'case': 'urundashi',
                    'page': 'settlements/urundashi/dist/urundashi.html',
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
            await pg.evaluate('v=>{setView(...v);if(window._khostFrame)window._khostFrame();}', v)
            await V.shot(os.path.join(a.out, 'cam.png'), view='cam')
            print('shot cam.png', flush=True)
        all_v = await pg.evaluate('Object.keys(VIEWS)')
        views = all_v if a.all_views else parse_views(a.views, all_v)
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
            fails.append('urundashi checks (error panel, page errors or an assert)')
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html', nargs='?', default=os.path.join(HERE, 'dist', 'urundashi.html'))
    ap.add_argument('--views', default='Opening|Overview|Babu al-Sarq East Gate and Moat Bridge')
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
