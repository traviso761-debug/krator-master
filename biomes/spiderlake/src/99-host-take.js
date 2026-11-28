// ================================================================= HOST — preset views, controls, inspector & probe invariants ([draw])
// Strictly obeys VIEW-NAME (survey item 30): zero apostrophes and zero colons in any preset view name.
const gh=(x,z,dy)=>DRAWN_H(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS=SKEY==='spillway'?{
 'Overview':look(92,-125,36,-26,8,8),
 'Breach cataract':look(-108,-68,14,-36,2,-4),
 'Bridge-curtain arch':look(56,6,8.5,-25,4,14),
 'Reeling weir terrace':look(32,108,5.2,64,132,1.8),
 'Degumming vats':look(44,158,6.5,78,148,0.4),
 'Lake horizon':look(-24,-92,22,155,10,6)
}:SKEY==='narrows'?{
 'Overview':look(-145,78,42,42,-28,10),
 'Golden narrows span':look(-4,48,10.5,14,-44,15),
 'Boat navigation gap':look(16,28,5.5,14,-44,11),
 'Cypress stack anchors':look(-118,-8,9.5,-72,-36,12),
 'Ham-Spi principality site':look(-135,108,18,-235,185,2),
 'Dusk sheen':look(168,95,28,18,-38,12)
}:SKEY==='pavilion'?{
 'Overview':look(-88,-82,32,8,28,10),
 'Brood-pavilion canopy':look(-18,-36,8.5,16,-8,11),
 'Amber mulberry terrace':look(-54,72,7.5,8,96,3.5),
 'Spindle-willow forks':look(32,-48,6.2,-8,-18,9.5),
 'Smudge harvest frame':look(-28,74,3.8,-8,90,1.6),
 'Funnel highway':look(-52,-118,14,-18,-168,12)
}:SKEY==='fen'?{
 'Overview':look(-98,86,32,12,-28,6),
 'Dusk lake-smoke pillars':look(38,42,9.5,-35,-115,48),
 'Alkaline degum springs':look(-4,8,5.8,44,38,0.3),
 'Pitcher snare bog':look(-52,32,3.2,-32,46,0.3),
 'Hau-Gel inflow braid':look(135,98,18,45,18,1),
 'Air-bell fen shallows':look(-82,-12,4.5,-54,-48,-0.2)
}:SKEY==='dolomite'?{
 'Overview':look(-78,-112,34,36,-32,8),
 'Dolomite lake bluff':look(-12,-118,12,78,-108,14),
 'Porphyry dike rib':look(-88,42,14,-18,22,8),
 'Sub-escarpment grotto':look(18,-48,4.6,18,-14,2.2),
 'Celestine calcite hall':look(4,4,14,18,22,-16),
 'Springhollows vista':look(82,88,28,-95,-115,4)
}:SKEY==='haugel'?{
 'Overview':look(-128,-52,38,32,6,8),
 'Hau-Gel inflow chute':look(-28,-22,12,95,8,2),
 'Scalding sinter terrace':look(-8,22,7.5,44,58,0.5),
 'Carnelian ejecta cliffs':look(18,18,14,68,96,12),
 'Gorge mouth curtain':look(-112,8,14,-54,2,14),
 'Silk toll reserve':look(-118,-92,16,-165,-135,2)
}:{
 'Overview':look(-115,-85,34,18,12,8),
 'Ejecta megablock crest':look(-48,32,6.5,12,4,2.5),
 'Two-watersheds divide':look(-18,0,28,120,620,-120),
 'Gossamer balloon ridge':look(42,-28,5.2,4,-6,2.2),
 'Porphyry fern ledges':look(-28,-46,4.2,-4,-22,1.4)
};

function statusSummary(){
 const wMs=Math.hypot(SITE.wind[0],SITE.wind[1]);
 const aero=SPIDER_PHYS.aerodynamicsAt({elevM:SITE.baseElevM,windSpeedMs:wMs,threadDiaUm:4.2,spanM:180.0,anchorHighM:25.0,curtainDropM:12.0});
 const sm=SPIDER_PHYS.lakeSmokeAt({
  shoreDistM:SITE.shoreDistBaseM,
  elevAboveLakeM:SITE.baseElevM-SPIDER_PHYS.CONST.LAKE_DATUM_M,
  seepProximity01:SITE.seepProximity01,
  hour24:SPIDER_STATE.mode==='dawn'?6.75:SPIDER_STATE.mode==='dusk'?19.0:18.5,
  windOnshore01:0.78
 });
 const hv=SPIDER_PHYS.harvestCycleAt({
  dayMod6:SPIDER_STATE.dayMod6,
  smudgeActive01:SPIDER_STATE.smudgeActive01,
  humFreqHz:SPIDER_STATE.humFreqHz,
  strikingBrood:false
 });
 return SITE.id+' ['+aero.pAtm.toFixed(2)+' atm / '+aero.pO2Atm.toFixed(2)+' O2] · midge '+sm.midgeFluxGm2Day.toFixed(1)+' g/m2/d · '+(hv.reelReady?'REEL-READY (0-kill)':'colony spinning');
}

const CONTROLS=(function(){
 const out=[
  {
   button:'Dawn Fog',id:'btn-dawn',
   title:'Set 06:40 dawn radiation lake-fog over the +1,460 m basin and morning emergence peak',
   on(){
    SPIDER_STATE.mode='dawn';
    SPIDER_STATE.fogBoost=0.72;
    SPIDER_STATE.smokeBoost=SITE.hasOpenLake?0.62:0.0;
    if(SKY&&SKY.view)SKY.view();
    KHOST.inspector('Dawn radiation lake-fog -> '+statusSummary());
   }
  },
  {
   button:'Dusk Lake-Smoke',id:'btn-dusk',
   title:'Set 18:50 crepuscular peak: launches 300 m hydrothermal chironomid lake-smoke pillars and lights oiled cocoon lanterns',
   on(){
    SPIDER_STATE.mode='dusk';
    SPIDER_STATE.fogBoost=0.18;
    SPIDER_STATE.smokeBoost=SITE.hasOpenLake?1.0:0.0;
    if(SKY&&SKY.view)SKY.view();
    KHOST.inspector('Dusk 300 m lake-smoke emergence -> '+statusSummary());
   }
  },
  {
   button:'Smudge Harvest',id:'btn-smudge',
   title:'Apply 132 Hz Hum harp cadence + silkbogmyrtle & porphyryfern smudge-smoke: workers retreat peacefully into brood-domes for zero-kill reeling',
   on(){
    const next=SPIDER_STATE.smudgeActive01>0.5?0.0:0.95;
    SPIDER_STATE.smudgeActive01=next;
    SPIDER_STATE.humFreqHz=next>0.5?132.0:0.0;
    KHOST.inspector((next>0.5?'Zero-kill Hum & smudge-myrtle active':'Returned to wild spinning')+' -> '+statusSummary());
   }
  },
  {
   button:'Midday Clear',id:'btn-clear',
   title:'Restore crisp sunlit 1.33 atm highland-lacustrine basin visibility',
   on(){
    SPIDER_STATE.mode='clear';
    SPIDER_STATE.fogBoost=0.0;
    SPIDER_STATE.smokeBoost=SKEY==='fen'?0.45:(SKEY==='spillway'||SKEY==='narrows'?0.28:SITE.hasOpenLake?0.12:0.0);
    if(SKY&&SKY.view)SKY.view();
    KHOST.inspector('Midday clear basin light -> '+statusSummary());
   }
  }
 ];
 if(SKEY==='dolomite'&&typeof KCAVERN!=='undefined'&&KCAVERN.cut){
  out.push({
   button:'Grotto Cutaway',id:'btn-grotto-cut',
   title:'Toggle KCAVERN.cutLayer cutaway to view the warm-brine celestine & calcite crystal hall from above',
   on(){
    const on=!KCAVERN.cut.on;
    KCAVERN.cut.set(on);
    SPIDER_STATE.grottoCut=on;
    KHOST.inspector('Calcite-celestine grotto cutaway '+(on?'OPEN':'CLOSED'));
   }
  });
 }
 out.push({
  button:'Sun shadows',id:'btn-shadow',
  title:'Attach or toggle KSHADOW sun cascade (strictly off at load by default)',
  on(){const on=toggleSpiderShadow();KHOST.inspector('Sun shadows '+(on?'ON':'OFF'));}
 });
 return out;
})();

// Automatically open KCAVERN cutaway when jumping to 'Celestine calcite hall' on dolomite so the underground crystals shine!
if(SKEY==='dolomite'&&typeof KCAVERN!=='undefined'&&KCAVERN.cut){
 KHOST.on(function grottoViewSync(){
  const dHall=Math.hypot(camera.position.x-4,camera.position.z-4);
  if(dHall<6.0&&!KCAVERN.cut.on){KCAVERN.cut.set(true);SPIDER_STATE.grottoCut=true;}
 },'view');
}

function describe(hit){
 const p=hit.point,o=hit.object;
 let best=null;
 for(const r of REG){if(r.r>400)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const instLbl=(o.isInstancedMesh&&typeof BIO.instLabel==='function')?BIO.instLabel(o,hit.instanceId):null;
 const lab=instLbl||o.userData.inspectLabel||o.name||'mesh';
 const isItem=o.isInstancedMesh&&o.userData.biome;
 const rawItem=isItem?(o.name||'').replace(/^biome:(?:[a-z0-9_-]+\|)?/,''):null;
 const SP=rawItem?SPIDERLAKE.speciesOfItem(rawItem):null;
 const head=SP?(SP.name+'  ·  '+lab):(best?best.name+'  ·  '+lab:lab);

 const nrm=DRAWN_N(p.x,p.z,1.0);
 const sl=Math.hypot(nrm[0],nrm[2])/Math.max(0.1,nrm[1]);
 const P=physAt(p.x,p.z,p.y,sl);
 const asl=SITE.baseElevM+p.y;
 const lines=[head];
 if(SP){
  lines.push('Zone: '+SP.tags.zone+' · Climate: '+SP.tags.climate+'/'+SP.tags.aridity+' · Koppen: '+SP.tags.koppen.join(','));
  if(SP.tags.harvest&&SP.tags.harvest.notes)lines.push('Use: '+SP.tags.harvest.notes);
 }
 lines.push('Elev '+asl.toFixed(1)+' m ASL · P '+P.aero.pAtm.toFixed(3)+' atm · pO2 '+P.aero.pO2Atm.toFixed(3)+' atm · rho '+P.aero.rhoKgM3.toFixed(2)+' kg/m3');
 lines.push('Lake-smoke flux '+P.smoke.midgeFluxGm2Day.toFixed(1)+' g/m2/day · eusocial '+P.smoke.eusocialOk+' · max span '+P.aero.maxCastSpanM.toFixed(0)+' m');
 if(P.tp.pool&&P.tp.d<P.tp.pool.r*2.2){
  lines.push('Degumming seep: +'+P.brine.tempC.toFixed(1)+' C · pH '+P.brine.pH.toFixed(2)+' · degumSafe '+P.brine.degumSafeOk);
 }
 lines.push(p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m');
 return lines.join('\n');
}

const BUDGET={
 showcase:{tris:8500000,calls:125},
 cls:{life:4500000,host:2500000},
 type:{'biome':'life','host':'host'}
};

function collectUntexturedLitMeshes(extraList){
 const bad=[];
 const checkMat=(m,ownerName)=>{
  if(!m)return;
  if(m.isShaderMaterial||m.isRawShaderMaterial)return;
  if((m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshBasicMaterial)&&!m.map){
   bad.push(ownerName||m.name||m.type);
  }
 };
 if(extraList){
  extraList.forEach(x=>checkMat(x.material||x,x.name||'test-mat'));
  return bad;
 }
 Object.keys(SPIDERLAKE.M).forEach(k=>checkMat(SPIDERLAKE.M[k],'SPIDERLAKE.M.'+k));
 checkMat(MAT_GROUND,'MAT_GROUND');
 scene.traverse(o=>{
  if(!o.isMesh||o.userData.sky||o===giant||o===giantRing)return;
  const nm=o.name||'';
  if(/^water:|^atmos:/.test(nm))return;
  if(!(o===GROUND||(FAR&&o===FAR.mesh)||(o.userData&&(o.userData.biome||o.userData.host))))return;
  const mats=Array.isArray(o.material)?o.material:[o.material];
  mats.forEach(m=>checkMat(m,nm||o.userData.inspectLabel||'mesh'));
 });
 return bad;
}

const HCHK={
 stationSpecies(st,skey){
  const baseLake=['spindlewillow','crowncypress','ambermulberry','weepingliquidambar','silkbogmyrtle','lakesmokesedge','silkfenpitcher','porphyryfern','bridgecurtain','broodpavilion','weirframe_wild','rampartgossamer'];
  const req=skey==='rampart'
   ?['chinkapinoak','porphyrypine','lakesmokesedge','porphyryfern','bleachfireweed','rampartgossamer','carnelian_organpipe','erythra_veil','agate_window']
   :skey==='haugel'
   ?baseLake.concat(['dolomitebamboo','nurserywildrice','dyersindigo','fensundew','bleachfireweed','carnelian_organpipe','erythra_veil','bladder_tether','agate_window','blood_strangler'])
   :skey==='spillway'
   ?baseLake.concat(['nurserywildrice','dyersindigo','fensundew','shorespiderlily','carnelian_organpipe','erythra_veil','agate_window'])
   :skey==='narrows'
   ?baseLake.concat(['dolomitebamboo','lakelotus','nurserywildrice','dyersindigo','grottocamellia','shorespiderlily'])
   :skey==='pavilion'
   ?baseLake.concat(['lakelotus','nurserywildrice','dyersindigo','grottocamellia','shorespiderlily'])
   :skey==='fen'
   ?baseLake.concat(['lakelotus','nurserywildrice','fensundew'])
   :baseLake.concat(['dolomitebamboo','dyersindigo','grottocamellia','shorespiderlily']);
  const miss=req.filter(k=>!(st&&st[k]>0));
  if(skey==='haugel'){
   if(!(st&&st.carnelianRelicts>=10))miss.push('carnelianRelicts>=10');
   if(!(st&&st.bleachSkeletons>=1))miss.push('bleachSkeletons>=1');
  }else if(skey==='rampart'||skey==='spillway'){
   if(!(st&&st.carnelianRelicts>=6))miss.push('carnelianRelicts>=6');
  }
  return{
   ok:!miss.length,
   detail:miss.length?'missing on '+skey+': '+miss.join(', '):req.map(k=>k+' '+st[k]).join(', ')+(st&&st.carnelianRelicts?', carnelianRelicts '+st.carnelianRelicts:'')
  };
 },
 lakeDatumPhysics(elevM){
  const a=SPIDER_PHYS.aerodynamicsAt({elevM:elevM,windSpeedMs:4.8,threadDiaUm:4.2,spanM:180.0,anchorHighM:25.0,curtainDropM:12.0});
  const ok=Math.abs(a.pAtm-1.333)<=0.005&&Math.abs(a.pO2Atm-0.280)<=0.003&&Math.abs(a.rhoKgM3-1.560)<=0.02&&a.maxCastSpanM>=220.0&&a.boatClearanceM>=6.5;
  return{
   ok:ok,
   detail:'P='+a.pAtm+' atm, pO2='+a.pO2Atm+' atm, rho='+a.rhoKgM3+' kg/m3, maxSpan='+a.maxCastSpanM+' m, boatClear='+a.boatClearanceM+' m'
  };
 },
 atmosSilkAudit(audit,skey){
  if(skey==='rampart'){
   const ok=audit.curtainSpans===0;
   return{ok:ok,detail:ok?'0 eusocial Bridge-Curtains above +2,040 m North Rampart midge line':'unexpected curtains on rampart: '+audit.curtainSpans};
  }
  const ok=audit.anchors>0&&audit.pinnedZero===audit.anchors&&audit.maxAnchorDrift===0&&audit.bellies>0&&audit.minBellyDisp>0.25&&audit.weirMinSlotClearM>=0.03;
  return{
   ok:ok,
   detail:'pinned '+audit.pinnedZero+'/'+audit.anchors+' anchors (drift '+audit.maxAnchorDrift.toFixed(4)+' m), belly disp >= '+audit.minBellyDisp.toFixed(2)+' m, weir slot clear '+audit.weirMinSlotClearM.toFixed(3)+' m'
  };
 },
 trophicAndCovenant(placed,skey,strikingBrood){
  const eusocial=(placed||[]).filter(r=>r[0]==='bridgecurtain'||r[0]==='broodpavilion');
  const badFlux=eusocial.filter(r=>!(r[6]&&r[6].midgeFlux>=12.0));
  const hv=SPIDER_PHYS.harvestCycleAt({dayMod6:5,smudgeActive01:0.95,humFreqHz:132.0,strikingBrood:!!strikingBrood});
  const ok=(skey==='rampart'?eusocial.length===0:eusocial.length>0)&&badFlux.length===0&&hv.reelReady&&hv.broodUnharmed&&hv.killYield===0;
  return{
   ok:ok,
   detail:ok?eusocial.length+' eusocial silk complexes (all flux >= 12 g/m2/d), broodUnharmed=true, killYield=0':'eusocial='+eusocial.length+', badFlux='+badFlux.length+', reelReady='+hv.reelReady+', broodUnharmed='+hv.broodUnharmed
  };
 },
 hydrologyAndPools(site,waterOut){
  if(!site.hasOpenLake){
   const ok=!waterOut.lake&&waterOut.flows===0&&waterOut.thermalSprings===0;
   return{ok:ok,detail:ok?'0 surface water crossing +2,040 m North Rampart divide':'unexpected water on rampart'};
  }
  const pools=site.thermalPools||[];
  const badPool=pools.filter(p=>p.level<site.lakeLevelLocal+0.10);
  const ok=!!waterOut.lake&&!badPool.length&&(site.id!=='spillway'||waterOut.flows>=1);
  return{
   ok:ok,
   detail:ok?'lake datum +1,460.0 m, '+pools.length+' thermal pools >= +0.10 m above lake, flows='+waterOut.flows:'badPool='+badPool.length+', lake='+waterOut.lake
  };
 },
 reserveClean(tagsList){
  const buildings=(tagsList||[]).filter(r=>r&&r.class==='building');
  return{ok:!buildings.length,detail:buildings.length?buildings.length+' unexpected building records in biome station':'0 class=building records in biome reserves'};
 },
 allTextured(extraList){
  const bad=collectUntexturedLitMeshes(extraList);
  return{
   ok:!bad.length,
   detail:bad.length?bad.length+' untextured meshes: '+bad.slice(0,5).join(', '):'0 untextured lit meshes across ground, karst, barks, foliage, silk & works'
  };
 },
 shadowOffDefault(hasQueryShadow,shadowEnabled){
  const ok=hasQueryShadow?true:!shadowEnabled;
  return{ok:ok,detail:ok?'KSHADOW detached at default load (renderer.shadowMap.enabled='+shadowEnabled+')':'shadowMap unexpectedly enabled at default load'};
 },
 samplersBudget(u){
  const n=u&&u.final!=null?u.final:99;
  return{ok:n<=14,detail:'MAT_GROUND uses '+n+' of '+(u?u.max:16)+' texture units (cap 14)'};
 },
 camerasOut(C){
  const bad=C.filter(c=>c.y<DRAWN_H(c.x,c.z)+1.2);
  return{ok:C.length>0&&!bad.length,detail:bad.length?'under ground: '+bad.map(c=>c.view).join(', '):C.length+' preset cameras clear of drawn ground'};
 },
 skyLit(info){
  const ok=!!info&&isFinite(info.exp)&&info.exp>0&&isFinite(info.sunAlt)&&isFinite(info.sunI);
  return{ok:ok,detail:ok?'exposure '+info.exp.toFixed(3)+', sunAlt '+info.sunAlt.toFixed(1)+' deg, sunI '+info.sunI.toFixed(2):'non-finite sky/exposure'};
 },
 treesClearOfRivers(placed,checkFn){
  const woody={spindlewillow:1,crowncypress:1,ambermulberry:1,chinkapinoak:1,porphyrypine:1,weepingliquidambar:1,dolomitebamboo:1};
  const trees=(placed||[]).filter(r=>woody[r[0]]);
  const inRiv=trees.filter(r=>checkFn(r[1],r[3],1.5));
  return{
   ok:!inRiv.length,
   detail:inRiv.length?inRiv.length+' trees inside river channel ('+inRiv[0][0]+' at '+inRiv[0][1].toFixed(1)+','+inRiv[0][3].toFixed(1)+')':'0 of '+trees.length+' woody trees stand inside river/cataract channels'
  };
 }
};

function hostChecks(){
 const R=[],add=(name,r)=>R.push(Object.assign({name:name},r));
 const qShadow=new URLSearchParams(location.search).get('shadow')==='1';
 const tagRecs=(typeof KTAGS!=='undefined'&&KTAGS.page&&KTAGS.page.records)?KTAGS.page.records:[];
 add('signature flora and silk architecture placed on station',HCHK.stationSpecies(window._station,SKEY));
 add('unified 1.33 atm / 0.28 atm O2 lake-datum aerodynamics',HCHK.lakeDatumPhysics(1460.0));
 add('ATMOS wind-pinned silk anchors 0.000 m drift and weir slot clearance',HCHK.atmosSilkAudit(SPIDERLAKE.SILK_AUDIT,SKEY));
 add('lake-smoke trophic gradient and zero-kill harvest covenant',HCHK.trophicAndCovenant(SPIDERLAKE.PLACED,SKEY,false));
 add('unbifurcated SW outlet divide and elevated thermal degumming pools',HCHK.hydrologyAndPools(SITE,window._water));
 add('zero woody trees standing in river or cataract channels',HCHK.treesClearOfRivers(SPIDERLAKE.PLACED,inFlowChannel));
 add('settlement reserve held clear of buildings',HCHK.reserveClean(tagRecs));
 add('100 percent of lit scene meshes carry real textures',HCHK.allTextured(null));
 add('KSHADOW off at default page load',HCHK.shadowOffDefault(qShadow,!!renderer.shadowMap.enabled));
 add('ground shader stays within WebGL sampler budget',HCHK.samplersBudget(window._units));
 add('preset cameras clear of drawn ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('sky model and exposure finite and lit',HCHK.skyLit({exp:renderer.toneMappingExposure,sunAlt:SKY.state&&SKY.state.sunAlt,sunI:sun.intensity}));
 return R;
}

function hostNegatives(){
 const R=[],add=(name,r)=>R.push({name:name,failed:!r.ok,detail:r.detail});
 add('missing signature species fails station check',HCHK.stationSpecies({},SKEY));
 add('thin 6400 m alpine air fails 1.33 atm / 220 m bridge-casting check',HCHK.lakeDatumPhysics(6400.0));
 add('unpinned drifting silk anchor or coplanar weir crossbar fails audit',HCHK.atmosSilkAudit({anchors:4,pinnedZero:3,maxAnchorDrift:0.42,bellies:2,minBellyDisp:0.5,weirMinSlotClearM:0.0,curtainSpans:1},'spillway'));
 add('eusocial brood-pavilion placed on 0-flux North Rampart or striking brood fails',HCHK.trophicAndCovenant([['broodpavilion',0,20,0,2060,'rim_rampart',{midgeFlux:0}]],'rampart',true));
 add('coplanar thermal pool at 0.00 m lake level fails separation check',HCHK.hydrologyAndPools({id:'fen',hasOpenLake:true,lakeLevelLocal:0.0,thermalPools:[{level:0.02}]},{lake:true,flows:1,thermalSprings:1}));
 add('tree placed in active river channel fails check',HCHK.treesClearOfRivers([['spindlewillow',-60,-10,0,1450,'narrows',null]],()=>true));
 add('building placed inside biome reserve fails',HCHK.reserveClean([{id:'bad',class:'building'}]));
 add('untextured lit MeshStandardMaterial is caught',HCHK.allTextured([new THREE.MeshStandardMaterial({color:0x888888})]));
 add('shadowMap enabled at default load fails',HCHK.shadowOffDefault(false,true));
 add('ground over 14-sampler cap fails',HCHK.samplersBudget({final:16,max:16}));
 add('preset camera buried under drawn ground fails',HCHK.camerasOut([{view:'buried',x:0,y:DRAWN_H(0,0)-5,z:0}]));
 add('NaN sky exposure fails',HCHK.skyLit({exp:NaN,sunAlt:NaN,sunI:0}));
 return R;
}

KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');

const HINT=SKEY==='spillway'
 ?'Arachnoid Spillway (1272, 193, +1,460 m, 1.33 atm / 0.28 atm O2): sole 380 m3/s surface outlet of Spider Lake plunging into 9102 Ham-Tsek beneath 170 m wind-billowing Golden Cable Bridge-Curtains, removable cedar Silk-Weir frames, smudge-myrtle & indigo terraces, and Carnelian ejecta stack relicts.'
 :SKEY==='narrows'
 ?'Golden Narrows (1288, 220, +1,460 m, 1.33 atm): emergent dolomite and secondary-ejecta stacks crowned by buttressed bald-cypress knees, jade-culm bamboo, and multi-tier golden Bridge-Curtains over +7.5 m skiff arches, beside the reserved Ham-Spi Principality terrace.'
 :SKEY==='pavilion'
 ?'Brood-Pavilion Grove (1308, 224, +1,463 m, 1.33 atm): mist-drenched spindle-willow, crown-cypress, and weeping ria-amber woods linked canopy-to-canopy by Cloud-Fleece Brood-Pavilions above lotus coves and cut-stone mulberry, smudge-myrtle, tea, and indigo terraces.'
 :SKEY==='fen'
 ?'Hydrothermal Lake-Smoke Midge-Fen (1328, 228, +1,460 m, 1.33 atm): 640 m3/s Hau-Gel inflow delta with +37-44 C alkaline carbonate sericin-degumming springs, sacred lotus & wild-rice nurseries, snare-mouth pitchers & ruby sundews, submerged air-bell domes, and 300 m dusk midge pillars.'
 :SKEY==='dolomite'
 ?'Dolomite Rim & Crystal Grotto (1256, 184, +1,460 m, 1.33 atm): cream carbonate-shelf bluffs with jade-culm bamboo and mist-tea bushes sliced by an imperial red-porphyry dike above tube_ozarks_15, opening into a walk-in KSPELEO.CALCITE celestine-and-calcite crystal chamber.'
 :SKEY==='haugel'
 ?'Hau-Gel Inflow Gorge & Carnelian Ejecta Cliffs (1354, 238, +1,460..+1,505 m, 1.33 atm): 585 m3/s NE 9106 Hau-Gel canyon rushing past scalding sinter terraces and green mulberry benches below dry secondary-ejecta cliffs holding all 5 Carnelian Erythrophyll clades and an orbital Bleach-Scar seam.'
 :'North Ejecta Rampart (1278, 166, +2,040 m, 1.24 atm): unbroken ballistic secondary-ejecta boulder-collar sealing +1,460 m Spider Lake (south) from Ria Valley headwaters (north), holding edaphic Carnelian agate-window, erythra-veil & organ-pipe relicts alongside chinkapin oak, porphyry pine & spiderling gossamer.';

const EXPORT_BOX_BY_STATION=SKEY==='narrows'?[-120,-95,140,135]:SKEY==='dolomite'?[-80,-110,135,95]:[-130,-110,130,130];

KHOST.take({
 build:'spiderlake'+(SKEY==='spillway'?'':'-'+SKEY),
 title:'Krator biome — Spider Lake: '+SITE.name,
 hint:HINT,
 scene:scene,camera:camera,renderer:renderer,ground:DRAWN_H,clear:1.8,registry:REG,regHas:regHas,views:VIEWS,ticks:TICKS,
 controls:CONTROLS,
 clock:{hour:ATMOS.SKY.viewHour},
 draw:SKY.draw,
 inspect:describe,
 stats:()=>'inst '+window._instances+'\n'+statusSummary(),
 layers:{
  'spiderlake flora & brood domes':{match:o=>!!(o.userData&&o.userData.biome)},
  'silk spans, weirs & horizon':{match:o=>!!(o.userData&&o.userData.host)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-spiderlake',version:1,site:SITE,state:SPIDER_STATE,silkAudit:SPIDERLAKE.SILK_AUDIT,placed:SPIDERLAKE.PLACED.length})
 },
 minimap:{title:SITE.name},
 budget:BUDGET,
 types:()=>BIO.stats,
 api:{
  hostChecks:hostChecks,hostNegatives:hostNegatives,
  atmosSilkAudit:()=>SPIDERLAKE.SILK_AUDIT,
  get totals(){const t=BIO.totals();return{tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._station,
  site:()=>SITE,
  placed:()=>SPIDERLAKE.PLACED,
  state:()=>SPIDER_STATE,
  exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos'].concat(SITE.hasOpenLake?['water']:[]),
  exportBox:EXPORT_BOX_BY_STATION,
  at:(x,z)=>{
   const y=DRAWN_H(x,z),o={h:y,asl:SITE.baseElevM+y,water:waterH(x,z)};
   FNAMES.forEach(n=>{o[n]=+FIELD[n](x,z).toFixed(3);});
   return o;
  }
 }
});
