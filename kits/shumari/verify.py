#!/usr/bin/env python3
"""Headless Playwright + SwiftShader verification for the Shumari kit (kits/shumari/PLAN.md).

  PW_CHROMIUM=/usr/bin/chromium /home/antigravity/.venv/bin/python kits/shumari/verify.py --assert --no-cache
"""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness as _harness  # noqa: E402
from harness import parse_views, verify_page  # noqa: E402
from check_trades import trades_check  # noqa: E402

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ASSERT_JS = r"""()=>{
 const A=window._api;
 const R=[];
 const F=A.footprints();

 const over=F.filter(f=>f.ex>1.6||f.ez>1.6);
 R.push({name:'inside-declared-footprint',ok:!over.length,
  detail:over.length?over.map(f=>`${f.key} ${f.bw}x${f.bd} vs ${f.w}x${f.d}`).join(' | '):F.length+' sites within declared footprint'});

 const hh=F.filter(f=>f.eh>1.5);
 R.push({name:'inside-declared-height',ok:!hh.length,
  detail:hh.length?hh.map(f=>`${f.key} h ${f.bh} vs ${f.h}`).join(' | '):'all sites within declared height'});

 R.push({name:'no-nan',ok:A.nanSweep()===0,detail:'nan meshes '+A.nanSweep()});

 const badType=Object.keys(A.DEFS).filter(k=>A.DEFS[k].cls==='building'&&!(A.DEFS[k].tags.types||[]).length);
 R.push({name:'buildings-typed',ok:!badType.length,
  detail:badType.length?badType.join(', '):'every building carries culture and types'});

 /* Pre-SM5 core/tags check: zero missingCulture, zero missingTypes, zero unknownKeys; only culture:shumari allowed in unknownValues */
 const T=A.tags().audit;
 const ukKeys=Object.keys(T.unknownKeys||{});
 const uv=T.unknownValues||{};
 const uvKeys=Object.keys(uv);
 const onlyShumari=uvKeys.every(k=>k==='culture:shumari');
 R.push({name:'tags-vocabulary',
  ok:T.missingCulture===0&&T.missingTypes===0&&ukKeys.length===0&&onlyShumari,
  detail:T.records+' records ('+Object.entries(T.byClass).map(e=>e.join(' ')).join(', ')+'), unknownKeys=0, pre-SM5 '+JSON.stringify(uv)});

 R.push({name:'kit-coverage',ok:A.kitCoverage().length===0,
  detail:A.kitCoverage().join(', ')||'every def placed on sheet ('+Object.keys(A.DEFS).length+' defs)'});

 const heavy=F.filter(f=>f.tris>(f.budget||180000));
 R.push({name:'triangle-budget',ok:!heavy.length,
  detail:heavy.length?heavy.map(f=>f.key+' '+f.tris).join(' | '):'heaviest site '+Math.max(...F.map(f=>f.tris))+' tris'});

 const nf=A.doors().filter(d=>!d.front||![d.front.local.x,d.front.local.z,d.front.local.yaw].every(isFinite)||d.front.source==='default');
 R.push({name:'front-door',ok:!nf.length,
  detail:nf.length?nf.map(d=>d.key).join(', '):A.doors().length+' sites carry explicit door() or declared front'});

 const fu=A.furniture();
 const miss=Object.keys(fu.missing);
 R.push({name:'furniture-keys',ok:!miss.length,
  detail:miss.length?'missing '+miss.join(', '):fu.placed+' catalog pieces from '+fu.keys+' keys ('+fu.tris+' tris)'});

 const ix=A.interiors&&A.interiors();
 const bare=(ix&&ix.on)?[]:fu.perSite.filter(s=>A.DEFS[s.key].cut&&s.pieces<4);
 R.push({name:'buildings-furnished',
  ok:(ix&&ix.on)?(ix.buildings>=49&&ix.rooms>=110&&ix.pieces>=700&&!ix.errors.length):!bare.length,
  detail:(ix&&ix.on)?('SVIX furnished '+ix.buildings+' buildings, '+ix.rooms+' rooms, '+ix.pieces+' pieces (replaced '+ix.replaced+', errors '+ix.errors.length+')'):(bare.length?bare.map(s=>s.key+' '+s.pieces).join(', '):'cut-away buildings carry 4+ catalog pieces')});

 R.push({name:'interiors-set-wired',
  ok:!!(ix&&ix.sets&&ix.sets.includes('shumari')&&ix.units>=49&&!ix.errors.length),
  detail:ix?('sets='+ix.sets.join(',')+', units='+ix.units+', items='+ix.items+', on='+ix.on):'SVIX missing'});

 const unstyled=Object.keys(A.DEFS).filter(k=>A.DEFS[k].cls==='building'&&!['sword','hearth','cadet','state'].includes(A.DEFS[k].tags.style));
 R.push({name:'caste-styled',ok:!unstyled.length,
  detail:unstyled.length?unstyled.join(', '):'every building carries sword|hearth|cadet|state style'});

 const M=A.materials();
 R.push({name:'material-records',ok:!!(M&&M.records&&M.records.length>=20),
  detail:M?M.records.length+' materials, '+M.records.filter(r=>r.lib).length+' packed from library':'none'});

 R.push({name:'drawn-ground-registered',
  ok:typeof KDRAWN!=='undefined'&&KDRAWN.sources.length>=1&&KDRAWN.h(0,0)===0,
  detail:typeof KDRAWN!=='undefined'?KDRAWN.sources.length+' KDRAWN source(s), h(0,0)='+KDRAWN.h(0,0):'no KDRAWN'});

 /* Walk-reach: open unlocked KDOOR leaves and walk 0.25 m grid from outside target to all interior targets on the raw shell */
 if(!(ix&&ix.on)){
  const W=KWALK,st=.25,out=[],bad=[];
  const DOP=typeof KDOOR!=='undefined'?KDOOR.list.filter(d=>!d.locked).flatMap(d=>d.blocks).map(B=>[B,!B.off]):[];
  DOP.forEach(([B])=>W.setBlock(B,false));
  const allT=r=>(r.walkTargets||[]).map(t=>Object.assign({who:r.key},t)).concat(...r.children.map(allT));
  for(const r of A.REG.filter(q=>!q.parent&&q.cls==='building')){
   const Tg=allT(r);
   if(Tg.length<2)continue;
   const s0=Tg.find(t=>t.outside)||Tg[0];
   const b=r.bbox,m=4;
   const x0=b.mn[0]-m,x1=b.mx[0]+m,z0=b.mn[2]-m,z1=b.mx[2]+m;
   const seen=new Map(),q=[[s0.x,s0.z,s0.y]];
   const K=(x,z,y)=>Math.round(x/st)+','+Math.round(z/st)+','+Math.round(y*5);
   seen.set(K(s0.x,s0.z,s0.y),1);
   const V=[];
   let n=0;
   while(q.length&&n<160000){
    const [x,z,y]=q.pop();n++;V.push([x,z,y]);
    for(const [dx,dz] of [[st,0],[-st,0],[0,st],[0,-st]]){
     const nx=x+dx,nz=z+dz;
     if(nx<x0||nx>x1||nz<z0||nz>z1)continue;
     const fb=W.floorBelow(nx,nz,y,.6);
     let ny=fb?fb[0]:-1e9;
     if(!W.floorsAt(nx,nz).length&&0<=y+.6)ny=0;
     if(ny<-1e8)continue;
     if(W.blocked(nx,ny+.45,nz,.22,1.2))continue;
     const k=K(nx,nz,ny);
     if(seen.has(k))continue;
     seen.set(k,1);
     q.push([nx,nz,ny]);
    }
   }
   const miss=Tg.filter(t=>!V.some(v=>Math.abs(v[0]-t.x)<.45&&Math.abs(v[1]-t.z)<.45&&Math.abs(v[2]-t.y)<.4));
   out.push(r.key+'(v'+r.v+') '+(Tg.length-miss.length)+'/'+Tg.length);
   if(miss.length)bad.push(r.key+'(v'+r.v+') missed '+miss.map(t=>t.name).join(','));
  }
  DOP.forEach(([B,on])=>W.setBlock(B,on));
  R.push({name:'walk-reach',ok:!bad.length&&out.length===A.REG.filter(q=>!q.parent&&q.cls==='building').length,
   detail:bad.length?bad.join(' | '):out.length+' sites walked cleanly'});
 }

 /* Shumari Check 1: Free Giant (>= 4.2 m door, >= 5.0 m vault) vs Hearth human (< 3.0 m door) clearances + negative control */
 {
  const blds=A.REG.filter(r=>!r.parent&&r.cls==='building');
  const summaries=blds.map(r=>{
   const prefix=r.key+'.'+(r._doorOrd==null?0:r._doorOrd)+'.';
   const doors=KDOOR.list.filter(d=>d.id.indexOf(prefix)===0).map(d=>({id:d.id,h:d.h,w:d.w,locked:d.locked}));
   return {key:r.key,v:r.v,giant:!!r.giant,solidMarker:!!r.solidMarker,vaultH:r.vaultH,doors};
  });
  const giants=summaries.filter(s=>s.giant);
  const humans=summaries.filter(s=>!s.giant);
  const badG=summaries.filter(s=>!smGiantValid(s));
  R.push({
   name:'giant-clearance',
   ok:giants.length>=22&&humans.length>=30&&badG.length===0,
   detail:badG.length?'failed '+JSON.stringify(badG):giants.length+' Free Giant sites (>=4.2 m portals, >=5.0 m vaults) and '+humans.length+' human/open sites verified'
  });
  const negOk=!smGiantValid({key:'sm_regiment_qubba',giant:true,vaultH:8.8,doors:[{h:2.2,locked:false}]})
   &&!smGiantValid({key:'sm_sample_hearth_bay',giant:false,vaultH:3.4,doors:[{h:4.4,locked:false}]})
   &&!smGiantValid({key:'sm_wayside_cairn',giant:true,solidMarker:true,vaultH:0,doors:[]})
   &&smGiantValid({key:'sm_wayside_cairn',giant:false,solidMarker:true,vaultH:0,doors:[]})
   &&smGiantValid({key:'sm_regiment_qubba',giant:true,vaultH:8.8,doors:[{h:4.4,locked:false}]});
  R.push({
   name:'giant-clearance-neg',
   ok:negOk,
   detail:negOk?'negative controls rejected 2.2 m door on Giant building, 4.4 m door on human building, and Giant flag on solid marker':'negative control failed'
  });
 }

 /* Shumari Check 2: Mamluk dome profile & spiral handedness (+1 standard, -1 on sm_doriyan_stele) + negative control */
 {
  const domes=typeof SM_DOMES!=='undefined'?SM_DOMES:[];
  const spiralStd=domes.filter(d=>d.style==='spiral'&&d.key!=='sm_doriyan_stele'&&d.hand===1);
  const spiralMir=domes.filter(d=>d.style==='spiral'&&d.key==='sm_doriyan_stele'&&d.hand===-1);
  const carved=domes.filter(d=>d.style==='carved');
  const badD=domes.filter(d=>!smDomeValid(d));
  R.push({
   name:'dome-handedness',
   ok:domes.length>=8&&spiralStd.length>=4&&spiralMir.length>=1&&carved.length>=3&&badD.length===0,
   detail:badD.length?'invalid domes '+JSON.stringify(badD):domes.length+' Mamluk domes verified ('+spiralStd.length+' right-hand spiral, '+spiralMir.length+' Doriyan mirror spiral, '+carved.length+' carved star-relief)'
  });
  const negDome=!smDomeValid({key:'sm_regiment_qubba',style:'spiral',hand:-1,span:7.8,h:6.45})
   &&!smDomeValid({key:'sm_doriyan_stele',style:'spiral',hand:1,span:6.2,h:5.08})
   &&!smDomeValid({key:'sm_regiment_qubba',style:'carved',hand:0,span:7.8,h:3.1})
   &&smDomeValid({key:'sm_doriyan_stele',style:'spiral',hand:-1,span:6.2,h:5.08});
  R.push({
   name:'dome-handedness-neg',
   ok:negDome,
   detail:negDome?'negative controls rejected flipped spiral hands and saucer profile':'negative control failed'
  });
 }

 /* Shumari Check 3: Station 4 (shumar) highland flora band (ropepine, coiljuniper, helixpoplar, whorlapricot, spiralsage, ichu) */
 {
  const FL=window._flora;
  const on=typeof SM_FLORA!=='undefined'&&!!SM_FLORA&&new URLSearchParams(location.search).get('flora')!=='0';
  const sp=FL&&FL.species||{};
  const un=FL&&FL.under||{};
  const spOk=!!(FL&&(sp.ropepine||0)>=1&&(sp.coiljuniper||0)>=1&&(sp.helixpoplar||0)>=1&&(sp.whorlapricot||0)>=1&&(un.sage||0)>=1&&(un.bunch||0)>=1&&FL.records>0&&FL.spaceCount>0);
  R.push({
   name:'shumar-flora-band',
   ok:!on||spOk,
   detail:!on?'flora band skipped (?only or ?flora=0)':FL?('shighlands/'+FL.station+' trees='+FL.trees+' (ropepine='+(sp.ropepine||0)+', coiljuniper='+(sp.coiljuniper||0)+', helixpoplar='+(sp.helixpoplar||0)+', whorlapricot='+(sp.whorlapricot||0)+'), sage='+(un.sage||0)+', ichu='+(un.bunch||0)+', tags='+FL.records+', kspace='+FL.spaceCount):'no flora built'
  });
 }

 return R;
}"""


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    bad = False
    q = ['t=4']
    if a.only:
        q.append('only=' + a.only)
    if a.query:
        q.append(a.query.lstrip('?'))
    async with verify_page(a.html, here=HERE, size=a.size, query='?' + '&'.join(q), settle_ms=0, checks=_harness.SURVEY) as V:
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
        errs = list(V.errs) + ['console ' + t for k, t in pg.krator_console if k == 'error']
        print('ERROR PANEL:', e.strip() or '(clean)')
        print('build:', json.dumps(await pg.evaluate("window._build||null")))
        if e.strip() or errs:
            bad = True
        for x in errs[:8]:
            print('pageerror:', x)
        if a.assert_:
            for r in await pg.evaluate(ASSERT_JS):
                print(('PASS ' if r['ok'] else 'FAIL ') + r['name'] + ' - ' + r['detail'][:4000])
                bad |= not r['ok']
            t_ok, t_detail, _ = trades_check(HERE)
            print(('PASS ' if t_ok else 'FAIL ') + 'voth-trades - ' + t_detail[:700])
            bad |= not t_ok
        if a.cut:
            await pg.evaluate("cutSet(true)")
        if a.night:
            await pg.evaluate("nightSet(true)")
        if a.eval:
            print(json.dumps(await pg.evaluate(a.eval), indent=1)[:12000])
        if a.cam:
            v = [float(t) for t in a.cam.split(',')]
            await pg.evaluate("v=>setView(...v)", v)
            await pg.wait_for_timeout(800)
            await V.shot(os.path.join(a.out, 'cam.png'), view='cam')
            print('shot cam.png')
        all_v = await pg.evaluate("Object.keys(VIEWS)")
        views = all_v if a.all_views else parse_views(a.views, all_v)
        for i, vn in enumerate(views):
            found = await pg.evaluate("n=>{if(!VIEWS[n])return false;setView(...VIEWS[n]);return true;}", vn)
            if not found:
                print('no view', vn)
                continue
            await pg.wait_for_timeout(800)
            fn = os.path.join(a.out, ('%02d-' % i) + ''.join(c if c.isalnum() else '_' for c in vn)[:48] + '.png')
            await V.shot(fn, view=vn)
            print('shot', fn)
        e2 = await pg.evaluate("document.getElementById('errs').textContent")
        if e2.strip() and e2 != e:
            print('ERROR PANEL after views:', e2)
            bad = True
        if bad:
            fails.append('kit checks (error panel, page errors or an assert)')
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html', nargs='?', default=os.path.join(HERE, 'dist', 'shumari.html'))
    ap.add_argument('--views', default='Overview|Gorge street under the qubba|Domes of the Subaru-su|Spiral qubba and pishtaq|Sword captain bayt compound|Diwan hall and kattu chancery|Citadel and Payaru minaret|Copper stills and lake jetty|Shumar highland flora')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--cut', action='store_true')
    ap.add_argument('--night', action='store_true')
    ap.add_argument('--cam', default='')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--eval', default='')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    ap.add_argument('--size', default='1280x800')
    ap.add_argument('--only', default='')
    ap.add_argument('--query', default='')
    sys.exit(asyncio.run(run(ap.parse_args())))
