// ================================================================= HOST TAKE — Views, Interactive Tide/Fleet/Stocks Panel, Cutaway, Checks & Export
// Hands Fleetborn Cove (`settlements/fleetborn-cove`) to `core/host` (`KHOST.take` + `KHOST.standard`):
// - 11 preset views (`overview`, `arcoforte-prow`, `spring-graving-cradles`, `ark-ward-sanctuary`, `sill-tidal-rotors`,
//   `white-stacks-causeway`, `bastion-fleetborn-hall`, `ash-burners-village`, `spar-chute-gjar-villages`, `outer-sill-saltery`,
//   `double-dark-moot-fleets`), all analytically held clear of KDRAWN.h and +7.2 m spring flood.
// - Interactive Tide, Drydock & Fleet Panel (`#fcove-tide-panel`) + `KHOST.simHolds(SIM)` Stocks (`O`) panel:
//   Live / Run / Hold, Spring, Neap, Great Ebb, Great Flood, Double Dark Moot, syncing dynamic 5-fleet moorings,
//   Moot Pop, Paktong Stock, and 5 Shore-kin client villages live.
// - Full hostChecks & hostNegatives for verify.py --assert (harness.SURVEY).

const VIEWS=(function buildFcoveViews(){
 const LY=FCOVE_LAYOUT,AF=LY.arcoforte,X=LY.XZ;
 function safeEye(cx,cz,wantY){
  const th=terrainH(cx,cz);
  const dh=(typeof KDRAWN!=='undefined'&&KDRAWN.h)?KDRAWN.h(cx,cz):null;
  const base=Math.max(th,dh==null?th:dh,8.2);
  return Math.max(wantY,base+6.5);
 }
 function cam(cx,cz,wantY,tx,ty,tz){
  return[+cx.toFixed(1),+safeEye(cx,cz,wantY).toFixed(1),+cz.toFixed(1),+tx.toFixed(1),+ty.toFixed(1),+tz.toFixed(1)];
 }

 /* 1. overview: sweeping aerial across sill, sanctuary lagoon, moored Ark-Wards, shipyard & 300 m Arcoforte */
 const pOvEye=X(185,LY.centerA(185)-LY.hwW(185)-165);
 const pOvTgt=AF.toWorld(-35,72,-145);

 /* 2. arcoforte-prow: across the cove looking straight at Arcoforte's harbour boat-lift, 7 cliff towers & 300 m Sky-Crown */
 const pAfEye=X(-315,LY.centerA(-315)-145);
 const pAfTgt=AF.toWorld(0,118,-185);

 /* 3. spring-graving-cradles: clear hero angle onto cradle_deep (careened 89c Ark on -3 m blocks), cradle_great, cradle_shallow & smelt-hearth */
 const c0=LY.cradles[0],c1=LY.cradles[1];
 const pCrEye=X(c0.s-28,c0.a0-72);
 const pCrTgt=X(c1.s-8,c0.a0+24);

 /* 4. ark-ward-sanctuary: moored 89g Chained Ark-Wards, 89c Catamarans, 89d Smelt-Barges & salvaged port pens */
 const pSnEye=X(145,LY.centerA(145)-150);
 const pSnTgt=X(95,LY.centerA(95)+35);

 /* 5. sill-tidal-rotors: NNW sill throat, 4 reversible paktong rotors, leading-beacons & Arcoforte beyond */
 const pSrEye=X(-915,LY.sillRotors.centerA-68);
 const pSrTgt=X(-765,LY.sillRotors.centerA+12);

 /* 6. white-stacks-causeway: -6.0 m basalt/tufa causeway, tide-gauge post, golden sea-byssus beds & Lost-City White Stacks */
 const cw=LY.causeway;
 const pCwEye=X(cw.s-52,cw.aStart+12);
 const pCwTgt=X(cw.s+4,cw.aEnd-8);

 /* 7. bastion-fleetborn-hall: close elevated look into Arcoforte's refurbished Fleet-born Dwelling Bastions & Ring */
 const pBsEye=AF.toWorld(-282,148,182);
 const pBsTgt=AF.toWorld(-208,104,136);

 /* 8. ash-burners-village: Pycnandra-Clamps (village_ash) on the +148 m red-laterite plateau with Arcoforte rising behind */
 const vAsh=LY.villages[0];
 const pAshEye=X(vAsh.s+138,vAsh.a-105);
 const pAshTgt=[vAsh.x,vAsh.benchY+6,vAsh.z];

 /* 9. spar-chute-gjar-villages: across the southern cove onto Kauri-Chute (village_spars), 540 m 3D Timber Spar Log-Chute & Dyke-Roast */
 const pChEye=X(735,LY.centerA(735)-158);
 const pChTgt=X(745,LY.eastShoreA(745)+135);

 /* 10. outer-sill-saltery: Sill-Pans (village_saltery) & coastal boat-grid slipway on the NW outer pillow-basalt headland */
 const vSalt=LY.villages[4];
 const pSlEye=X(vSalt.s-155,vSalt.a+92);
 const pSlTgt=[vSalt.x,vSalt.benchY+4,vSalt.z];

 /* 11. double-dark-moot-fleets: elevated sanctuary anchorage view over all 5 converged nomad fleets (34 moored hulls), Harbour Client Hall & Arcoforte */
 const pMtEye=X(455,LY.centerA(455)-136);
 const pMtTgt=X(-65,LY.centerA(-65)+8);

 return{
  'overview':cam(pOvEye[0],pOvEye[1],215,pOvTgt[0],pOvTgt[1],pOvTgt[2]),
  'arcoforte-prow':cam(pAfEye[0],pAfEye[1],56,pAfTgt[0],pAfTgt[1],pAfTgt[2]),
  'spring-graving-cradles':cam(pCrEye[0],pCrEye[1],24,pCrTgt[0],4,pCrTgt[1]),
  'ark-ward-sanctuary':cam(pSnEye[0],pSnEye[1],34,pSnTgt[0],8,pSnTgt[1]),
  'sill-tidal-rotors':cam(pSrEye[0],pSrEye[1],28,pSrTgt[0],2,pSrTgt[1]),
  'white-stacks-causeway':cam(pCwEye[0],pCwEye[1],18,pCwTgt[0],-3,pCwTgt[1]),
  'bastion-fleetborn-hall':cam(pBsEye[0],pBsEye[2],pBsEye[1],pBsTgt[0],pBsTgt[1],pBsTgt[2]),
  'ash-burners-village':cam(pAshEye[0],pAshEye[1],vAsh.benchY+44,pAshTgt[0],pAshTgt[1],pAshTgt[2]),
  'spar-chute-gjar-villages':cam(pChEye[0],pChEye[1],132,pChTgt[0],66,pChTgt[1]),
  'outer-sill-saltery':cam(pSlEye[0],pSlEye[1],48,pSlTgt[0],pSlTgt[1],pSlTgt[2]),
  'double-dark-moot-fleets':cam(pMtEye[0],pMtEye[1],68,pMtTgt[0],14,pMtTgt[1])
 };
})();

const FCOVE_CUTAWAY_VIEWS={
 'bastion-fleetborn-hall':['bastion_west',2]
};

/* ---------------- INTERACTIVE TIDE, DRYDOCK & FLEET PANEL (#fcove-tide-panel) ---------------- */
const FCOVE_PANEL=(function initFcovePanel(){
 let ui=null;
 const DAY=86400;
 function hm(sec){
  const h=((sec%DAY)+DAY)%DAY/3600,H=Math.floor(h),M=Math.floor((h-H)*60);
  return(H<10?'0':'')+H+':'+(M<10?'0':'')+M;
 }

 function simAtDay(dayIdx){
  if(typeof FCOVE_WORLD!=='undefined'&&FCOVE_WORLD&&typeof FCOVE_WORLD.dayState==='function'){
   return FCOVE_WORLD.dayState(dayIdx);
  }
  return null;
 }

 function status(){
  const T=COVE_TIDE.T,lv=T.level;
  const clk=(typeof KHOST!=='undefined'&&KHOST.host)?KHOST.host.clock:null;
  const live=!!(T.site&&T.mode!=='hold');
  const t=live?(T.mode==='run'?T.tw:(clk?KTIDE.worldSeconds(clk):0)):0;
  if(live){
   const snap=FCOVE_RULES.snapshot(t);
   snap.mode=T.mode;
   snap.level=+lv.toFixed(2);
   snap.sim=simAtDay(snap.day);
   return snap;
  }
  /* Hold mode: evaluate instantaneous hydraulic rules directly at held sea level `lv` */
  const curDay=clk?clk.day:44;
  const curMps=lv<-0.5?-3.8:lv>0.5?3.8:0;
  const slack=Math.abs(curMps)<=FCOVE_RULES.sill.slackMaxMps;
  const pMW=Math.min(FCOVE_RULES.rotors.pCapMW,FCOVE_RULES.rotors.kMW*Math.pow(Math.abs(curMps),3));
  const cwyExp=lv<=FCOVE_RULES.causeway.exposeLevel;
  const arkY=FCOVE_RULES.hullWaterlineY(lv,'cradle_deep');
  return{
   t:null,
   day:curDay,
   mode:'hold',
   level:+lv.toFixed(2),
   spring:null,
   dayRange:+(Math.abs(lv)*2).toFixed(1),
   sill:{v:curMps,speed:Math.abs(curMps),state:slack?'slack':curMps>0?'flood':'ebb',slack:slack,deepTransit:slack},
   cradles:{
    cradle_deep:{gateOpen:lv>=5.6,afloatInPit:lv>=2.6,waterlineY:+arkY.toFixed(2)},
    cradle_great:{gateOpen:lv>=6.6,afloatInPit:lv>=6.6},
    cradle_shallow:{gateOpen:lv>=1.6,afloatInPit:lv>=1.6}
   },
   cradleDays:{
    cradle_deep:{open:lv>=5.6,hours:lv>=5.6?2.4:0},
    cradle_great:{open:lv>=6.6,hours:lv>=6.6?1.5:0},
    cradle_shallow:{open:true,hours:6.0}
   },
   rotors:{powerMW:+pMW.toFixed(2),dayMWh:+(pMW*12).toFixed(1),smeltActive:Math.abs(curMps)>3.0,hearthState:Math.abs(curMps)>3.0?'campaign':'banked'},
   mill:{dayHeadM:+Math.max(7.5,Math.abs(lv)*2).toFixed(1),heavyStampsActive:Math.abs(lv)>=5.4,ropeWalkActive:true,state:lv<2.8?'milling':'holding'},
   causeway:{exposed:cwyExp,byssusGatherable:cwyExp},
   careenedHullY:+arkY.toFixed(2),
   sim:simAtDay(curDay)
  };
 }

 function formatReadout(S){
  const sgn=S.level>=0?'+':'';
  const hdr=S.mode==='hold'
   ?('Sea '+sgn+S.level.toFixed(2)+' m · HELD (manual slider) · Day '+(S.day+1))
   :('Sea '+sgn+S.level.toFixed(2)+' m · Day '+(S.day+1)+' '+hm(S.t)+' · Spring x'+S.spring.toFixed(2)+' (range '+S.dayRange.toFixed(1)+' m'+(S.mode==='run'?', RUN':'')+')');
  const sv=S.sill.v>=0?'+'+S.sill.v.toFixed(2):S.sill.v.toFixed(2);
  const lnSill='Sill Race: '+sv+' m/s ('+S.sill.state.toUpperCase()+') · Deep Gate: '+(S.sill.deepTransit?'OPEN (slack)':'WAIT SLACK');
  const cd=S.cradles.cradle_deep,cdd=S.cradleDays.cradle_deep,cgd=S.cradleDays.cradle_great;
  const arkTag=cd.afloatInPit?('AFLOAT '+sgn+S.careenedHullY.toFixed(1)+'m'):'ON -3.0m BLOCKS';
  const lnCradles='Cradles: Deep(+5.6m) '+(cdd.open?'OPEN '+cdd.hours.toFixed(1)+'h':'SHUT (neap)')+' ['+arkTag+'] · Great(+6.6m) '+(cgd.open?'MOOT OPEN':'SHUT')+' · Shallow OPEN';
  const lnRot='Rotors: '+S.rotors.powerMW.toFixed(2)+' MW ('+S.rotors.dayMWh.toFixed(1)+' MWh/d) · Smelt Hearth: '+S.rotors.hearthState.toUpperCase();
  const lnMill='Tide Mill: head '+S.mill.dayHeadM.toFixed(1)+' m ('+(S.mill.heavyStampsActive?'Full Ore-Stamps':'Rope-Walk Only')+') · White Stacks(-6m): '+(S.causeway.exposed?'EXPOSED DRY':'SUBMERGED');
  const lines=[hdr,lnSill,lnCradles,lnRot,lnMill];
  if(S.sim){
   lines.push('Fleets in Cove: '+S.sim.fleetCount+'/5 ('+S.sim.totalHullsInCove+' hulls) · Moot Pop: '+S.sim.mootPop+' · Paktong Stock: '+S.sim.stocks.paktong+' ingots · Shore-kin Villages: '+S.sim.shorekinVillages+' ('+S.sim.shorekinPop+' clients)');
  }
  return lines.join('\n');
 }

 function paint(){
  if(!ui)return;
  const S=status();
  ui.readout.textContent=formatReadout(S);
  if(document.activeElement!==ui.slider)ui.slider.value=String(S.level);
  ui.bLive.classList.toggle('on',S.mode==='live');
  ui.bRun.classList.toggle('on',S.mode==='run');
  ui.bHold.classList.toggle('on',S.mode==='hold');
 }

 function setTide(arg,opt){
  const clk=(typeof KHOST!=='undefined'&&KHOST.host)?KHOST.host.clock:null;
  let cmd=arg;
  if(clk&&!(opt&&opt.keepDay)){
   if(arg==='neap'){
    /* Jump straight to true lunar neap day 67 (~7.5 m range, 1/5 visiting fleets, banked hearth, shut deep cradle) */
    clk.day=67;
    if(clk.set)clk.set(12.0);else clk.hour=12.0;
    cmd='greatEbb';
   }else if(arg==='spring'){
    const mod=((clk.day%91)+91)%91;
    const inMoot=(mod>=0&&mod<=2)||(mod>=43&&mod<=46)||(mod>=89&&mod<=90);
    if(inMoot){
     clk.day=24;
     if(clk.set)clk.set(8.0);else clk.hour=8.0;
    }
   }else if(arg==='doubleDark'){
    clk.day=89;
    if(clk.set)clk.set(12.0);else clk.hour=12.0;
   }
  }
  const res=COVE_TIDE.setTide(cmd,opt);
  const S=status();
  if(typeof FCOVE_SCENE!=='undefined'&&FCOVE_SCENE&&FCOVE_SCENE.syncFleetsForDay){
   FCOVE_SCENE.syncFleetsForDay(S.day);
   S.sim=simAtDay(S.day);
  }
  paint();
  return Object.assign({},res,{fcove:S});
 }

 function mount(){
  if(ui||typeof document==='undefined')return;
  const bar=document.getElementById('bar');
  if(!bar)return;
  if(COVE_TIDE.T.site&&COVE_TIDE.T.mode!=='hold'){
   COVE_TIDE.setTide(COVE_TIDE.T.mode);
  }
  const wrap=document.createElement('div');
  wrap.className='row';
  wrap.id='fcove-tide-panel';
  wrap.style.cssText='display:flex;flex-direction:column;gap:4px;padding:4px 0';
  const mk=(par,tag,txt,title,fn)=>{
   const e=document.createElement(tag);
   if(txt!=null)e.textContent=txt;
   if(title)e.title=title;
   if(fn)e.onclick=fn;
   par.appendChild(e);
   return e;
  };
  const r1=document.createElement('div');
  r1.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:4px';
  wrap.appendChild(r1);
  mk(r1,'span','tide & drydock').className='lbl';
  const bLive=mk(r1,'button','Live','Follow world clock on KTIDE',()=>setTide('live'));
  const bRun=mk(r1,'button','Run','Cycle 1 tidal day in 48 s',()=>setTide('run'));
  const bHold=mk(r1,'button','Hold','Hold sea level at slider',()=>setTide(COVE_TIDE.T.level,{instant:true}));
  mk(r1,'button','Spring','Jump to mid-cycle lunar spring high flood',()=>setTide('spring'));
  mk(r1,'button','Neap','Jump to lunar neap low water (day 68, 1/5 visiting fleets)',()=>setTide('neap'));
  mk(r1,'button','Great Ebb','Jump to today\'s lowest ebb',()=>setTide('greatEbb'));
  mk(r1,'button','Great Flood','Jump to today\'s highest flood',()=>setTide('greatFlood'));
  mk(r1,'button','Double Dark Moot','Jump to 91-day Double Dark greatest springs (5/5 fleets)',()=>setTide('doubleDark'));

  const r2=document.createElement('div');
  r2.style.cssText='display:flex;align-items:center;gap:8px';
  wrap.appendChild(r2);
  const slider=document.createElement('input');
  slider.type='range';
  slider.min='-7.6';
  slider.max='7.6';
  slider.step='0.1';
  slider.value=String(COVE_TIDE.T.level);
  slider.style.cssText='width:140px';
  slider.oninput=()=>setTide(+slider.value,{instant:true});
  r2.appendChild(slider);

  const readout=document.createElement('pre');
  readout.style.cssText='margin:2px 0 0 0;color:#a8ecff;font:11px/1.35 ui-monospace,Menlo,monospace;white-space:pre-wrap';
  wrap.appendChild(readout);

  const anchor=document.getElementById('khost-time')||document.getElementById('khost-export');
  if(anchor&&anchor.parentNode===bar)bar.insertBefore(wrap,anchor);
  else bar.appendChild(wrap);
  ui={wrap:wrap,bLive:bLive,bRun:bRun,bHold:bHold,slider:slider,readout:readout};
  paint();
 }

 let ptAcc=0;
 tick(function stepFcovePanel(dt){
  ptAcc+=(dt==null?0.016:dt);
  if(ptAcc>=0.2){ptAcc=0;paint();}
 });

 return{mount:mount,paint:paint,setTide:setTide,status:status};
})();
window.FCOVE_PANEL=FCOVE_PANEL;

/* ---------------- INSPECTOR DESCRIBE ---------------- */
function describeHit(hit){
 const p=hit.point,o=hit.object;
 let best=null;
 for(let i=0;i<REG.length;i++){
  const r=REG[i];
  if(r.r>1200)continue;
  const dx=p.x-r.x,dz=p.z-r.z,ry=r.y==null?0:r.y;
  if(dx*dx+dz*dz<=r.r*r.r&&p.y>=ry-3&&p.y<=ry+r.h+6&&(!best||r.r<best.r))best=r;
 }
 const lab=o.userData.inspectLabel||(o.parent&&o.parent.userData&&o.parent.userData.inspectLabel)||o.name||'mesh';
 const isBio=!!(o.isInstancedMesh&&o.userData.biome);
 const item=isBio?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&typeof ARCHB!=='undefined'&&ARCHB.plantOfItem?ARCHB.plantOfItem(item):null;
 const title=PLT?(PLT.name+' · '+lab):(best?(best.name+' · '+lab):lab);
 const S=FCOVE_PANEL.status();
 const flTxt=S.sim?(' · fleets '+S.sim.fleetCount+'/5'):'';
 return title+'\n'+(isBio?'flora · '+SITE.name:'settlement / terrain / water')+
  '\ntide '+(S.level>=0?'+':'')+S.level.toFixed(2)+' m · sill '+S.sill.v.toFixed(2)+' m/s · hearth '+S.rotors.hearthState+flTxt+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';
}

/* ---------------- HOST CHECKS & NEGATIVES ---------------- */
const TALL_TRUNKS=[
 'biome:artrunk','biome:arkauri_trunk','biome:arpycntrunk','biome:artreefern_trunk',
 'biome:arpaperbark_trunk','biome:arrata_trunk','biome:arcastrunk','biome:arpalmtrunk','biome:arohiatrunk'
];

function fcoveChecks(){
 const R=[];
 const LY=FCOVE_LAYOUT,AF=LY.arcoforte;

 /* 1. KTIDE + FCOVE_TIDE live coherence */
 const st=COVE_TIDE.state();
 const seaLv=WATER.PRESETS.sea.level;
 R.push({
  name:'fcove-ktide-and-rules',
  ok:!!st.ktide&&Math.abs(seaLv-st.level)<0.05&&FCOVE_RULES.cradleDay('cradle_deep',44).open&&!FCOVE_RULES.cradleDay('cradle_deep',67).open,
  detail:'seaLevel '+seaLv.toFixed(2)+' m, d44 deep open='+FCOVE_RULES.cradleDay('cradle_deep',44).open+', d67 deep open='+FCOVE_RULES.cradleDay('cradle_deep',67).open
 });

 /* 2. Arcoforte marginal state & sockets seated on prow */
 const afBuilt=FCOVE_SCENE.arcoforte;
 const afOk=!!(afBuilt&&afBuilt.plan&&afBuilt.root&&afBuilt.archTris>5000);
 R.push({
  name:'arcoforte-seated-marginal',
  ok:afOk,
  detail:afBuilt?('state '+afBuilt.state+', tris '+Math.round(afBuilt.archTris)+', socket '+JSON.stringify(afBuilt.socketInfo)):'missing FCOVE_SCENE.arcoforte'
 });

 /* 3. Zero wild biome tall trunks inside Arcoforte 576 m reserve, shipyard, log-chute or any of the 5 Shore-kin villages */
 const m4=new THREE.Matrix4(),pv=new THREE.Vector3(),qv=new THREE.Quaternion(),sv=new THREE.Vector3();
 let intrudingTrees=0,totalTrees=0;
 scene.traverse(M=>{
  if(!M.isInstancedMesh||!M.userData.biome||TALL_TRUNKS.indexOf(M.name)<0)return;
  for(let i=0;i<M.count;i++){
   M.getMatrixAt(i,m4);m4.decompose(pv,qv,sv);
   totalTrees++;
   if(LY.inReserve(pv.x,pv.z))intrudingTrees++;
  }
 });
 const siteRecs=KTAGS.page.query({key:'site:fleetborn-arcoforte'});
 R.push({
  name:'reserves-zero-tall-trees',
  ok:siteRecs.length>=1&&totalTrees>20&&intrudingTrees===0,
  detail:'site recs '+siteRecs.length+', tall trunks '+totalTrees+', inside Arcoforte/yard/chute/5-villages '+intrudingTrees
 });

 /* 4. Zero cliff rock clipping into Arcoforte park, ring, sub-cliff bench or Linear City */
 let rockClips=0,rockChecked=0;
 for(let lz=-240;lz<=460;lz+=28){
  for(let lx=-260;lx<=260;lx+=28){
   if(AF.envelopeDist(lx,lz)>-6)continue;
   const wp=AF.toWorld(lx,0,lz);
   const gh=terrainH(wp[0],wp[2]);
   const expect=ARCOFORTE.groundAt(null,lx,lz);
   rockChecked++;
   if(gh>expect+1.5)rockClips++;
  }
 }
 R.push({
  name:'arcoforte-zero-cliff-clipping',
  ok:rockChecked>=80&&rockClips===0,
  detail:'checked '+rockChecked+' interior/park/bench grid points, rock clips '+rockClips
 });

 /* 5. KRUINS audit on ruined sub-cliff vaults & marginal upper structures */
 const rr=KRUINS.report();
 const rBad=rr.filter(x=>!x.ok);
 R.push({
  name:'ruins-seated',
  ok:rr.length>=1&&rBad.length===0,
  detail:rBad.length?rBad.map(x=>x.name+': '+x.detail).join('; '):rr.map(x=>x.name+': '+x.detail).join(' | ')
 });

 /* 6. P4: All 5 Shore-kin client hinterland villages + Harbour Client Hall + 3D Timber Spar Log-Chute */
 const W=FCOVE_SCENE.world;
 const vData=W?W.villagesData:null;
 const skErrs=(typeof SKK!=='undefined'&&SKK&&SKK.errors)?SKK.errors:[];
 const minVilY=vData?Math.min.apply(null,vData.villages.map(v=>v.minY)):0;
 const clientHallRecs=KTAGS.page.query({key:'shore-kin:sk_client_hall'});
 const chuteRecs=KTAGS.page.query({key:'fcove:spar_log_chute'});
 const p4Ok=!!(
  vData&&vData.errors.length===0&&vData.villages.length===5&&
  vData.totalShorekinPop>=950&&vData.totalShorekinPop<=1350&&
  minVilY>=8.5&&skErrs.length===0&&
  FCOVE_SCENE.villagePlacedCount>=180&&FCOVE_SCENE.villageMeshes>0&&FCOVE_SCENE.villageMeshes<=42&&
  clientHallRecs.length>=1&&chuteRecs.length===1&&
  FCOVE_SCENE.sparChute.bents>=28&&FCOVE_SCENE.sparChute.logs>=12
 );
 R.push({
  name:'shorekin-villages-and-chute',
  ok:p4Ok,
  detail:vData
   ?('villages='+vData.villages.length+' (pop '+vData.totalShorekinPop+', minY '+minVilY.toFixed(1)+' m, placed '+FCOVE_SCENE.villagePlacedCount+' in '+FCOVE_SCENE.villageMeshes+' batches, skErrs '+skErrs.length+'), chute bents='+FCOVE_SCENE.sparChute.bents+' logs='+FCOVE_SCENE.sparChute.logs)
   :'missing villagesData'
 });

 /* 7. P4+P5: 92-day coupled SIM + FCOVE_TIDE + KHAMLET + KCAMP.fleetWorld audit */
 const simAud=W?W.audit():null;
 R.push({
  name:'fcove-sim-92d-solvency',
  ok:!!(simAud&&simAud.ok&&simAud.paktongSmeltedBanked===0&&simAud.paktongSmeltedSpring>=80&&simAud.neapDeepCareens===0&&simAud.deepWardCareens===0),
  detail:simAud
   ?('ok='+simAud.ok+', ledgerOk='+simAud.ledgerOk+', springPaktong='+simAud.paktongSmeltedSpring+', bankedPaktong='+simAud.paktongSmeltedBanked+', neapDeepCareens='+simAud.neapDeepCareens+', deepWardCareens='+simAud.deepWardCareens)
   :'missing FCOVE_WORLD.audit()'
 });

 /* 8. P5: Dynamic Nomad Fleet convergence (5/5 at Double Dark & Double Full vs < 5 on mid-cycle neap) */
 const dMoot=W?W.dayState(90):null;
 const dFull=W?W.dayState(44):null;
 const dNeap=W?W.dayState(67):null;
 R.push({
  name:'nomad-fleets-dynamic',
  ok:!!(dMoot&&dFull&&dNeap&&dMoot.fleetCount===5&&dFull.fleetCount===5&&dMoot.mootPop===2480&&dNeap.fleetCount>=1&&dNeap.fleetCount<5),
  detail:dMoot&&dNeap
   ?('d90 DoubleDark fleets='+dMoot.fleetCount+'/5 (pop '+dMoot.mootPop+', hulls '+dMoot.totalHullsInCove+'), d44 DoubleFull='+dFull.fleetCount+'/5, d67 Neap='+dNeap.fleetCount+'/5 (hulls '+dNeap.totalHullsInCove+')')
   :'missing dayState'
 });

 /* 9. KTAGS vocabulary, salvaged port segments, cradles, rotors, tide-mill, causeway & 34 moored fleet berths */
 const TA=KTAGS.page.audit();
 const settRecs=KTAGS.page.query({}).filter(r=>r['class']!=='flora'&&r['class']!=='life');
 let settUnknown=0;
 for(let i=0;i<settRecs.length;i++)settUnknown+=KTAGS.norm(settRecs[i].tags).problems.length;
 const worksOk=FCOVE_SCENE.portGroups.length===3&&FCOVE_SCENE.careened.length===2&&FCOVE_SCENE.rotorHubs.length===4&&FCOVE_SCENE.moored.length===34&&!!FCOVE_SCENE.millWheel;
 R.push({
  name:'tags-and-works-complete',
  ok:settRecs.length>=7700&&settUnknown===0&&TA.missingCulture===0&&TA.missingTypes===0&&worksOk,
  detail:settRecs.length+' settlement/arcology/village records (unknown '+settUnknown+', missCul '+TA.missingCulture+', missTypes '+TA.missingTypes+'); portSegs='+FCOVE_SCENE.portGroups.length+', careened='+FCOVE_SCENE.careened.length+', rotors='+FCOVE_SCENE.rotorHubs.length+', moored='+FCOVE_SCENE.moored.length
 });

 /* 10. Careened 89c Ark-Catamaran rests on -3.0 m blocks (+2.6 m waterline) at low tide and floats at spring flood */
 const yLow=FCOVE_RULES.hullWaterlineY(-6.8,'cradle_deep');
 const yHigh=FCOVE_RULES.hullWaterlineY(6.9,'cradle_deep');
 R.push({
  name:'careened-ark-blocks-and-float',
  ok:Math.abs(yLow-2.6)<1e-6&&Math.abs(yHigh-6.9)<1e-6,
  detail:'careened 89c waterline '+yLow.toFixed(2)+' m at -6.8 m ebb (-3.0 m keel blocks) -> '+yHigh.toFixed(2)+' m at +6.9 m spring flood'
 });

 /* 11. Preset cameras clear of KDRAWN.h and +7.2 m spring flood */
 const badCams=[];
 Object.keys(VIEWS).forEach(vk=>{
  const v=VIEWS[vk],cx=v[0],cy=v[1],cz=v[2];
  const dh=(typeof KDRAWN!=='undefined'&&KDRAWN.h)?KDRAWN.h(cx,cz):null;
  const floorY=Math.max(terrainH(cx,cz),dh==null?-1e9:dh,7.2);
  if(cy<floorY+3.0)badCams.push(vk+' ('+cy.toFixed(1)+' vs '+floorY.toFixed(1)+')');
 });
 R.push({
  name:'preset-cameras-clear',
  ok:Object.keys(VIEWS).length>=11&&badCams.length===0,
  detail:Object.keys(VIEWS).length+' preset views, clipped/submerged '+badCams.length+(badCams.length?': '+badCams.join(', '):'')
 });

 /* 12. Cove landform, 5 Type II travertine curtains (0 rock clips) & water shader programs */
 const wp=WATER.checkPrograms?WATER.checkPrograms(renderer,scene):[];
 const ca=COVE_TIDE.T.curtainAudit;
 R.push({
  name:'cove-curtains-and-water-programs',
  ok:wp.length===0&&!!(ca&&ca.weeps===5&&ca.clipped===0),
  detail:'water errs '+wp.length+', curtains '+(ca?ca.weeps+' (clipped '+ca.clipped+')':'missing')
 });

 return R;
}

function fcoveNegatives(){
 const R=[];
 const add=(name,caught,detail)=>R.push({name:name,ok:!!caught,failed:!!caught,detail:detail});
 const st=KRUINS.selfTest();
 add('ruins-self-test',!!st.ok,st.detail);
 add('neap-blocks-deep-cradle',FCOVE_RULES.cradleDay('cradle_deep',67).open===false,'day 67 deep cradle shut');
 const d44=FCOVE_RULES.daySummary(44);
 add('race-blocks-sill-transit',FCOVE_RULES.sillAt(d44.greatFloodT-3*3600,'ark_catamaran').deepTransit===false,'peak flood blocks sill transit');
 add('neap-submerges-causeway',FCOVE_RULES.causewayDay(67).exposed===false,'day 67 causeway submerged');
 const W=FCOVE_SCENE.world;
 add('banked-neap-zero-paktong',!!(W&&W.dailyLog[67]&&W.dailyLog[67].paktongSmelted===0),'neap day 67 smelts 0 paktong');
 add('deep-ward-zero-deep-careen',!!(typeof KCAMP!=='undefined'&&KCAMP.PORTS&&KCAMP.PORTS.deep_ward.tideRange_m<2.2&&W&&W.audit().deepWardCareens===0),'Deep-Ward 1.9 m diurnal tide performs 0 deep careenings');
 return R;
}

KHOST.on(SKY.view,'view');
KHOST.on(function fcoveLodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');

/* Door proximity tip & tick for Arcoforte exterior doors */
if(typeof KDOORHOST!=='undefined'){
 const doorTip=KDOORHOST.tip(()=>camera.position,()=>!!(KHOST.cam&&KHOST.cam.ctl&&KHOST.cam.ctl.walk));
 tick(function stepFcoveDoors(dt){
  KDOORHOST.tick(dt==null?0.016:dt);
  doorTip();
 });
}

window._build={
 settlement:'fleetborn-cove',
 px:SITE.px,
 tideMeanRange:FCOVE_TIDE.SPEC.meanRange,
 arcoforteState:FCOVE_SCENE.arcoforte?FCOVE_SCENE.arcoforte.state:'none',
 cradles:FCOVE_LAYOUT.cradles.length,
 portSegments:FCOVE_SCENE.portGroups.length,
 sillRotors:FCOVE_SCENE.rotorHubs.length,
 shorekinVillages:FCOVE_SCENE.world?FCOVE_SCENE.world.villagesData.villages.length:0,
 shorekinPop:FCOVE_SCENE.world?FCOVE_SCENE.world.villagesData.totalShorekinPop:0,
 shorekinBuildings:FCOVE_SCENE.villagePlacedCount,
 sparChuteLengthM:FCOVE_SCENE.sparChute.lengthM,
 visitingFleets:5,
 mooredVessels:FCOVE_SCENE.moored.length,
 careenedVessels:FCOVE_SCENE.careened.length
};

const afInt=FCOVE_SCENE.arcoforte&&FCOVE_SCENE.arcoforte.intHost?FCOVE_SCENE.arcoforte.intHost:null;

KHOST.take(KHOST.standard({
 build:'fleetborn-cove',
 title:'Fleetborn Cove — Arcoforte Sanctuary & Macrotidal Drydock',
 hint:'Soleri\'s Arcoforte seated in marginal caretaker state on the +76..+84 m eastern ophiolite cliff-prow of Fleetborn Cove (px 236, 242; 7.5–14.3 m KTIDE lunar tide): zero-pump spring graving cradles (-3 m blocks), salvaged Ancient submarine pens (kits/port d=3), reversible |v|^3 paktong sill rotors, impounding tide-mill, -6 m White Stacks sea-byssus causeway, 5 Shore-kin client villages (kits/shore-kin) + 540 m spar log-chute, and 5 dynamic cFlīt-qBōn & Hueru-Kuran nomad fleets (Deep-Ward <-> Arcoforte). Press O for Stocks, X for cutaway ([ / ]), E for doors, F to walk.',
 scene:scene,
 camera:camera,
 renderer:renderer,
 ground:terrainH,
 floor:(x,z)=>{
  const wh=waterH(x,z),gh=terrainH(x,z);
  const dh=(typeof KDRAWN!=='undefined'&&KDRAWN.h)?KDRAWN.h(x,z):null;
  const gMax=dh==null?gh:Math.max(gh,dh);
  return wh>-1e8&&wh>gMax?wh:gMax;
 },
 walk:typeof KWALK!=='undefined'?KWALK:null,
 clear:1.8,
 minR:4,
 maxR:8500,
 registry:REG,
 views:VIEWS,
 onView:vn=>{
  if(typeof KHOST==='undefined'||!KHOST.cut||!afInt)return;
  const cv=FCOVE_CUTAWAY_VIEWS[vn];
  if(cv)KHOST.cut.to(cv[0],cv[1]);
  else if(KHOST.cut.on)KHOST.cut.off();
 },
 ticks:TICKS,
 clock:{day:44,hour:10.5},
 draw:SKY.draw,
 std:{
  door:typeof KDOORHOST!=='undefined'?()=>KDOORHOST.toggleNear(camera.position,!!(KHOST.cam&&KHOST.cam.ctl&&KHOST.cam.ctl.walk)):undefined
 },
 holds:(typeof KHOST.simHolds==='function'&&typeof SIM!=='undefined')?KHOST.simHolds(SIM):undefined,
 cutaway:afInt?{
  units:afInt.cutawayUnits,
  cutAt:2.3,
  margin:2.5,
  show:afInt.showUnit,
  bar:afInt.barText
 }:undefined,
 describe:describeHit,
 records:()=>KTAGS.page.query({}),
 stats:()=>{
  const S=FCOVE_PANEL.status();
  const fl=S.sim?(S.sim.fleetCount+'/5 fleets ('+S.sim.totalHullsInCove+' hulls)'):((FCOVE_SCENE.moored.length+FCOVE_SCENE.careened.length)+' hulls');
  return'tide '+(S.level>=0?'+':'')+S.level.toFixed(1)+' m · sill '+S.sill.v.toFixed(1)+' m/s\n'+
   'hearth '+S.rotors.hearthState+' · '+fl;
 },
 minimap:{title:'Fleetborn Cove'},
 exporters:{
  biome:()=>BIO.export(),
  tags:()=>KTAGS.page.export(),
  water:()=>WATER.export(),
  sim:()=>SIM.export()
 },
 types:()=>BIO.stats,
 budget:{
  showcase:{tris:13500000,calls:480},
  cls:{life:5500000,host:8000000},
  type:{'arch/life':'life','arch/combs':'life','host':'host'}
 },
 api:{
  hostChecks:fcoveChecks,
  hostNegatives:fcoveNegatives,
  setTide:(m,o)=>FCOVE_PANEL.setTide(m,o),
  tideStatus:()=>FCOVE_PANEL.status()
 }
}));

FCOVE_PANEL.mount();
