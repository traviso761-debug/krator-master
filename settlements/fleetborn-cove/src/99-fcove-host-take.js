// ================================================================= HOST TAKE — Views, Interactive Tide & Drydock Panel, Cutaway, Checks & Export
// Hands Fleetborn Cove (`settlements/fleetborn-cove`) to `core/host` (`KHOST.take` + `KHOST.standard`):
// - 7 preset views (`overview`, `arcoforte-prow`, `spring-graving-cradles`, `ark-ward-sanctuary`, `sill-tidal-rotors`,
//   `white-stacks-causeway`, `bastion-fleetborn-hall`), all analytically held clear of KDRAWN.h and +7.2 m spring flood.
// - Interactive Tide & Drydock Panel (`#fcove-tide-panel`): Live / Run / Hold, Spring, Neap, Great Ebb, Great Flood, Double Dark Moot,
//   displaying live FCOVE_TIDE sea level, sill race & slack gate, cradle gates & careened Ark pose, rotor MW & smelt-hearth, mill head, and causeway.
// - Full hostChecks & hostNegatives for verify.py --assert (harness.SURVEY).

const VIEWS=(function buildFcoveViews(){
 const LY=FCOVE_LAYOUT,AF=LY.arcoforte,X=LY.XZ;
 function safeEye(cx,cz,wantY){
  const th=terrainH(cx,cz);
  const dh=(typeof KDRAWN!=='undefined'&&KDRAWN.h)?KDRAWN.h(cx,cz):null;
  const base=Math.max(th,dh==null?th:dh,8.2);
  return Math.max(wantY,base+6.0);
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

 return{
  'overview':cam(pOvEye[0],pOvEye[1],215,pOvTgt[0],pOvTgt[1],pOvTgt[2]),
  'arcoforte-prow':cam(pAfEye[0],pAfEye[1],56,pAfTgt[0],pAfTgt[1],pAfTgt[2]),
  'spring-graving-cradles':cam(pCrEye[0],pCrEye[1],24,pCrTgt[0],4,pCrTgt[1]),
  'ark-ward-sanctuary':cam(pSnEye[0],pSnEye[1],34,pSnTgt[0],8,pSnTgt[1]),
  'sill-tidal-rotors':cam(pSrEye[0],pSrEye[1],28,pSrTgt[0],2,pSrTgt[1]),
  'white-stacks-causeway':cam(pCwEye[0],pCwEye[1],18,pCwTgt[0],-3,pCwTgt[1]),
  'bastion-fleetborn-hall':cam(pBsEye[0],pBsEye[2],pBsEye[1],pBsTgt[0],pBsTgt[1],pBsTgt[2])
 };
})();

const FCOVE_CUTAWAY_VIEWS={
 'bastion-fleetborn-hall':['bastion_west',2]
};

/* ---------------- INTERACTIVE TIDE & DRYDOCK PANEL (#fcove-tide-panel) ---------------- */
const FCOVE_PANEL=(function initFcovePanel(){
 let ui=null;
 const DAY=86400;
 function hm(sec){
  const h=((sec%DAY)+DAY)%DAY/3600,H=Math.floor(h),M=Math.floor((h-H)*60);
  return(H<10?'0':'')+H+':'+(M<10?'0':'')+M;
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
   return snap;
  }
  /* Hold mode: evaluate instantaneous hydraulic rules directly at held sea level `lv` */
  const curMps=lv<-0.5?-3.8:lv>0.5?3.8:0;
  const slack=Math.abs(curMps)<=FCOVE_RULES.sill.slackMaxMps;
  const pMW=Math.min(FCOVE_RULES.rotors.pCapMW,FCOVE_RULES.rotors.kMW*Math.pow(Math.abs(curMps),3));
  const cwyExp=lv<=FCOVE_RULES.causeway.exposeLevel;
  const arkY=FCOVE_RULES.hullWaterlineY(lv,'cradle_deep');
  return{
   t:null,
   day:clk?clk.day:0,
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
   careenedHullY:+arkY.toFixed(2)
  };
 }

 function formatReadout(S){
  const sgn=S.level>=0?'+':'';
  const hdr=S.mode==='hold'
   ?('Sea '+sgn+S.level.toFixed(2)+' m · HELD (manual slider)')
   :('Sea '+sgn+S.level.toFixed(2)+' m · Day '+(S.day+1)+' '+hm(S.t)+' · Spring x'+S.spring.toFixed(2)+' (range '+S.dayRange.toFixed(1)+' m'+(S.mode==='run'?', RUN':'')+')');
  const sv=S.sill.v>=0?'+'+S.sill.v.toFixed(2):S.sill.v.toFixed(2);
  const lnSill='Sill Race: '+sv+' m/s ('+S.sill.state.toUpperCase()+') · Deep Gate: '+(S.sill.deepTransit?'OPEN (slack)':'WAIT SLACK');
  const cd=S.cradles.cradle_deep,cg=S.cradles.cradle_great,cdd=S.cradleDays.cradle_deep,cgd=S.cradleDays.cradle_great;
  const arkTag=cd.afloatInPit?('AFLOAT '+sgn+S.careenedHullY.toFixed(1)+'m'):'ON -3.0m BLOCKS';
  const lnCradles='Cradles: Deep(+5.6m) '+(cdd.open?'OPEN '+cdd.hours.toFixed(1)+'h':'SHUT (neap)')+' ['+arkTag+'] · Great(+6.6m) '+(cgd.open?'MOOT OPEN':'SHUT')+' · Shallow OPEN';
  const lnRot='Rotors: '+S.rotors.powerMW.toFixed(2)+' MW ('+S.rotors.dayMWh.toFixed(1)+' MWh/d) · Smelt Hearth: '+S.rotors.hearthState.toUpperCase();
  const lnMill='Tide Mill: head '+S.mill.dayHeadM.toFixed(1)+' m ('+(S.mill.heavyStampsActive?'Full Ore-Stamps':'Rope-Walk Only')+') · White Stacks(-6m): '+(S.causeway.exposed?'EXPOSED DRY':'SUBMERGED');
  return[hdr,lnSill,lnCradles,lnRot,lnMill].join('\n');
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
  const res=COVE_TIDE.setTide(arg,opt);
  paint();
  return Object.assign({},res,{fcove:status()});
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
  mk(r1,'button','Spring','Jump to next lunar spring high flood',()=>setTide('spring'));
  mk(r1,'button','Neap','Jump to next lunar neap low water',()=>setTide('neap'));
  mk(r1,'button','Great Ebb','Jump to today\'s lowest ebb',()=>setTide('greatEbb'));
  mk(r1,'button','Great Flood','Jump to today\'s highest flood',()=>setTide('greatFlood'));
  mk(r1,'button','Double Dark Moot','Jump to 91-day Double Dark greatest springs',()=>setTide('doubleDark'));

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
 return title+'\n'+(isBio?'flora · '+SITE.name:'settlement / terrain / water')+
  '\ntide '+(S.level>=0?'+':'')+S.level.toFixed(2)+' m · sill '+S.sill.v.toFixed(2)+' m/s · hearth '+S.rotors.hearthState+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';
}

/* ---------------- HOST CHECKS & NEGATIVES ---------------- */
const TALL_TRUNKS=['biome:artrunk','biome:arpycntrunk','biome:arcastrunk','biome:arpalmtrunk','biome:arohiatrunk'];

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

 /* 3. Zero wild biome tall trunks inside Arcoforte 576 m reserve or shipyard */
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
  name:'arcoforte-reserve-zero-trees',
  ok:siteRecs.length>=1&&totalTrees>20&&intrudingTrees===0,
  detail:'site recs '+siteRecs.length+', tall trunks '+totalTrees+', inside 576 m reserve '+intrudingTrees
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

 /* 6. KTAGS vocabulary, salvaged port segments, cradles, rotors, tide-mill, causeway & moored fleet */
 const TA=KTAGS.page.audit();
 const settRecs=KTAGS.page.query({}).filter(r=>r['class']!=='flora'&&r['class']!=='life');
 let settUnknown=0;
 for(let i=0;i<settRecs.length;i++)settUnknown+=KTAGS.norm(settRecs[i].tags).problems.length;
 const worksOk=FCOVE_SCENE.portGroups.length===3&&FCOVE_SCENE.careened.length===2&&FCOVE_SCENE.rotorHubs.length===4&&FCOVE_SCENE.moored.length===14&&!!FCOVE_SCENE.millWheel;
 R.push({
  name:'tags-and-works-complete',
  ok:settRecs.length>=7500&&settUnknown===0&&TA.missingCulture===0&&TA.missingTypes===0&&worksOk,
  detail:settRecs.length+' settlement/arcology records (unknown '+settUnknown+', missCul '+TA.missingCulture+', missTypes '+TA.missingTypes+'); portSegs='+FCOVE_SCENE.portGroups.length+', careened='+FCOVE_SCENE.careened.length+', rotors='+FCOVE_SCENE.rotorHubs.length+', moored='+FCOVE_SCENE.moored.length
 });

 /* 7. Careened 89c Ark-Catamaran rests on -3.0 m blocks (+2.6 m waterline) at low tide and floats at spring flood */
 const yLow=FCOVE_RULES.hullWaterlineY(-6.8,'cradle_deep');
 const yHigh=FCOVE_RULES.hullWaterlineY(6.9,'cradle_deep');
 R.push({
  name:'careened-ark-blocks-and-float',
  ok:Math.abs(yLow-2.6)<1e-6&&Math.abs(yHigh-6.9)<1e-6,
  detail:'careened 89c waterline '+yLow.toFixed(2)+' m at -6.8 m ebb (-3.0 m keel blocks) -> '+yHigh.toFixed(2)+' m at +6.9 m spring flood'
 });

 /* 8. Preset cameras clear of KDRAWN.h and +7.2 m spring flood */
 const badCams=[];
 Object.keys(VIEWS).forEach(vk=>{
  const v=VIEWS[vk],cx=v[0],cy=v[1],cz=v[2];
  const dh=(typeof KDRAWN!=='undefined'&&KDRAWN.h)?KDRAWN.h(cx,cz):null;
  const floorY=Math.max(terrainH(cx,cz),dh==null?-1e9:dh,7.2);
  if(cy<floorY+3.0)badCams.push(vk+' ('+cy.toFixed(1)+' vs '+floorY.toFixed(1)+')');
 });
 R.push({
  name:'preset-cameras-clear',
  ok:Object.keys(VIEWS).length>=7&&badCams.length===0,
  detail:Object.keys(VIEWS).length+' preset views, clipped/submerged '+badCams.length+(badCams.length?': '+badCams.join(', '):'')
 });

 /* 9. Cove landform, 5 Type II travertine curtains (0 rock clips) & water shader programs */
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
 mooredVessels:FCOVE_SCENE.moored.length,
 careenedVessels:FCOVE_SCENE.careened.length
};

const afInt=FCOVE_SCENE.arcoforte&&FCOVE_SCENE.arcoforte.intHost?FCOVE_SCENE.arcoforte.intHost:null;

KHOST.take(KHOST.standard({
 build:'fleetborn-cove',
 title:'Fleetborn Cove — Arcoforte Sanctuary & Macrotidal Drydock',
 hint:'Soleri\'s Arcoforte seated in marginal caretaker state on the +76..+84 m eastern ophiolite cliff-prow of Fleetborn Cove (px 236, 242; 7.5–14.3 m KTIDE lunar tide): zero-pump spring graving cradles (-3 m blocks), salvaged Ancient submarine pens (kits/port d=3), reversible |v|^3 paktong sill rotors, impounding tide-mill, -6 m White Stacks sea-byssus causeway, and moored cFlīt-qBōn & Hueru-Kuran fleets (89c–89h). Press X for cutaway ([ / ]), E for doors, F to walk.',
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
  return'tide '+(S.level>=0?'+':'')+S.level.toFixed(1)+' m · sill '+S.sill.v.toFixed(1)+' m/s\n'+
   'hearth '+S.rotors.hearthState+' · fleet '+(FCOVE_SCENE.moored.length+FCOVE_SCENE.careened.length)+' hulls';
 },
 minimap:{title:'Fleetborn Cove'},
 exporters:{
  biome:()=>BIO.export(),
  tags:()=>KTAGS.page.export(),
  water:()=>WATER.export()
 },
 types:()=>BIO.stats,
 budget:{
  showcase:{tris:10000000,calls:460},
  cls:{life:5000000,host:4500000},
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
