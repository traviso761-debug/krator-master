// ================================================================= HOST — preset views, controls, inspector & probe invariants ([draw])
// Strictly obeys VIEW-NAME (survey item 30): zero apostrophes, zero colons, and zero slashes in any preset view name.
// Every preset camera eye sits >= 9.0 m clear above KDRAWN surfaces and inside CAM_CLEAR crown-free circles.
const gh=(x,z,dy)=>DRAWN_H(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS=SKEY==='boreallakes'?{
 'Overview':look(-148,-96,36,-8,-4,8),
 'Paternoster boulder riffle':look(-36,-54,11.5,-6,-2,5),
 'Lower larch bay':look(38,-44,10.5,102,12,2),
 'Quaking sphagnum fen':look(-104,54,9.0,-104,26,1.2),
 'North peat raft':look(94,-64,9.5,94,-32,1.2),
 'Veil portage landing':look(-112,-64,10.5,-106,-18,2.0)
}:SKEY==='morainetarn'?{
 'Overview':look(124,-84,36,-16,-6,6),
 'Terminal moraine dam':look(82,-18,11.0,-16,-6,2),
 'Cirque meltwater cascade':look(-118,-48,11.5,-158,-6,6),
 'Sorted stone polygons':look(-52,66,9.0,-18,42,1.0),
 'Spring aufeis sheet':look(22,-96,9.5,-35,-98,1.0),
 'Fellgang tarn camp':look(108,-58,10.5,82,-24,2.5)
}:SKEY==='trigemini'?{
 'Overview':look(132,-98,38,0,4,6),
 'Dalab waypost cairns':look(76,-32,10.5,18,-8,2.5),
 'Copper Glacier arm':look(-88,-52,11.5,-168,-28,6.0),
 'South shore ice shelf':look(-44,82,9.5,8,28,1.0),
 'North ice crack lead':look(18,-86,9.5,-6,-24,1.0),
 'Bellows cushion bench':look(94,-72,9.0,56,-44,1.2)
}:{
 'Overview':look(14,132,36,-4,-48,26),
 'Hypoxia headwall ceiling':look(-42,68,12.5,0,-210,165),
 'Breath pocket cushions':look(58,42,9.5,12,8,1.5),
 'Frozen rime seep':look(-64,-18,9.5,-8,18,1.0),
 'Sunblood megabreccia crag':look(46,-28,11.0,96,-110,48),
 'Courier refuge reserve':look(68,58,10.0,32,26,2.0)
};

function statusSummary(){
 const tr=SWOW_PHYS.transectAt(SITE.px[1],SITE.baseElevM);
 const ice=SWOW_PHYS.iceShareAt(SITE.baseElevM,0.18,0.35);
 return SITE.id+' ['+tr.pressureAtm.toFixed(2)+' atm · +'+SITE.baseElevM.toFixed(0)+' m · '+tr.koppen+'] · tarn ice '+Math.round(ice*100)+'%';
}

const CONTROLS=[
 {
  button:'Day',id:'btn-day',
  title:'Set crisp SW Outer Wall daylight across glaciated megabreccia troughs, lakes & alpine benches',
  on(){
   SWOW_STATE.mode='day';
   SWOW_STATE.dawn01=0.0;
   if(typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock)KHOST.host.clock.set(10.5);
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector('Daylight SW Outer Wall illumination -> '+statusSummary());
  }
 },
 {
  button:SKEY==='boreallakes'?'Dawn Frost-Smoke':'Katabatic Dawn',id:'btn-dawn',
  title:'Set cold 06:20 dawn: raises frost-smoke mist over boreal lakes and katabatic drainage winds down outer-wall troughs',
  on(){
   SWOW_STATE.mode='dawn';
   SWOW_STATE.dawn01=1.0;
   if(typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock)KHOST.host.clock.set(6.35);
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector('Katabatic dawn & frost-smoke mist -> '+statusSummary());
  }
 },
 {
  button:'Sun shadows',id:'btn-shadow',
  title:'Attach or toggle KSHADOW sun cascade (strictly off at page load by default)',
  on(){const on=toggleSwowShadow();KHOST.inspector('Sun shadows '+(on?'ON':'OFF'));}
 }
];

KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');

function resolveHitSpecies(rawItem){
 if(!rawItem)return null;
 const own=SWOW.speciesOfItem(rawItem);
 if(own)return own;
 if(typeof NWOW!=='undefined'&&NWOW.SPECIES){
  for(let i=0;i<NWOW.SPECIES.length;i++){
   if(NWOW.SPECIES[i].items&&NWOW.SPECIES[i].items.indexOf(rawItem)>=0)return NWOW.SPECIES[i];
  }
 }
 if(typeof COPPERG!=='undefined'&&COPPERG.SPECIES){
  for(let i=0;i<COPPERG.SPECIES.length;i++){
   if(COPPERG.SPECIES[i].items&&COPPERG.SPECIES[i].items.indexOf(rawItem)>=0)return COPPERG.SPECIES[i];
  }
 }
 return null;
}

function describe(hit){
 const p=hit.point,o=hit.object;
 let best=null;
 for(const r of REG){if(r.r>400)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const instLbl=(o.isInstancedMesh&&typeof BIO.instLabel==='function')?BIO.instLabel(o,hit.instanceId):null;
 const lab=instLbl||o.userData.inspectLabel||o.name||'mesh';
 const isItem=o.isInstancedMesh&&o.userData.biome;
 const rawItem=isItem?(o.name||'').replace(/^biome:(?:[a-z0-9_-]+\|)?/,''):null;
 const SP=resolveHitSpecies(rawItem);
 const head=SP?(SP.name+'  ·  '+lab):(best?best.name+'  ·  '+lab:lab);

 const asl=SITE.baseElevM+p.y;
 const tr=SWOW_PHYS.transectAt(SITE.px[1],asl);
 const lc=SWOW_PHYS.lungcushionAt(asl,0.88,0.30);
 const lines=[head];
 if(SP&&SP.tags){
  lines.push('Zone: '+(SP.tags.zone||'alpine')+' · Clade: '+(SP.tags.native?'Endemic Hypoxic Outer-Wall':'Boreal / Alpine Kin'));
  if(SP.tags.harvest&&SP.tags.harvest.notes)lines.push('Use: '+SP.tags.harvest.notes);
 }
 lines.push('Elev '+asl.toFixed(1)+' m ASL · P '+tr.pressureAtm.toFixed(3)+' atm · Koppen '+tr.koppen+' · Belt '+tr.belt);
 if(tr.lethalHypoxia){
  lines.push('HAZARD: < 0.60 atm lethal outer-wall hypoxia ceiling (vascular plant limit '+SWOW_PHYS.HYPOXIA_CEILING_M+' m)');
 }else if(tr.hypoxic){
  lines.push('Exertion hypoxia (< 0.76 atm) · Lungcushion dome +'+lc.deltaTC+' C / '+lc.internalO2Pct+'% O2 ('+lc.effectivePAtm.toFixed(2)+' atm eq)');
 }
 lines.push(p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m');
 return lines.join('\n');
}

const BUDGET={
 showcase:{tris:6500000,calls:140},
 cls:{life:4200000,host:2300000},
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
 Object.keys(SWOW.M).forEach(k=>checkMat(SWOW.M[k],'SWOW.M.'+k));
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
 transectAndHypoxia(placed,forceVascularAboveCeiling){
  if(forceVascularAboveCeiling){
   return{ok:false,detail:'vascular plant placed above < 0.60 atm hypoxia ceiling'};
  }
  const pNorth=SWOW_PHYS.pressureAt(3040);
  const pTri=SWOW_PHYS.pressureAt(5680);
  const pCeil=SWOW_PHYS.pressureAt(SWOW_PHYS.HYPOXIA_CEILING_M+20);
  const lc=SWOW_PHYS.lungcushionAt(5680,0.90,0.25);
  let vascAbove=0,headwallCrust=0;
  for(let i=0;i<(placed||[]).length;i++){
   const r=placed[i],k=r[0],asl=r[4];
   if(asl>SWOW_PHYS.HYPOXIA_CEILING_M+0.5){
    if(k==='sunblood_crust')headwallCrust++;
    else vascAbove++;
   }
  }
  const breathOk=SKEY!=='breathvale'||(vascAbove===0&&headwallCrust>=3);
  const ok=pNorth>1.05&&pTri<=0.76&&pCeil<0.60&&lc.relievesHypoxia&&vascAbove===0&&breathOk;
  return{
   ok:ok,
   detail:'P(3040)='+pNorth.toFixed(2)+' atm, P(5680)='+pTri.toFixed(2)+' atm, lungO2='+lc.internalO2Pct+'%, vascAbove0.60='+vascAbove+(SKEY==='breathvale'?', headwallSunblood='+headwallCrust:'')
  };
 },
 nativeAndKinFlora(skey){
  const kinOff=PQ.get('kin')==='0';
  const st=window._station||{};
  const kinOk=kinOff||((st.kinTotal||0)>=8);
  const ok=SWOW.SPECIES.length===8&&SWOW.PLACED.length>=40&&kinOk;
  return{
   ok:ok,
   detail:'species='+SWOW.SPECIES.length+', placed='+SWOW.PLACED.length+', kin='+(st.kinTotal||0)+' (skey='+skey+')'
  };
 },
 waterAndFrost(wInfo,forceAuditFail){
  if(forceAuditFail||!wInfo){
   return{ok:false,detail:'water surface audit reported open-edge or mouth mismatch'};
  }
  const frostOk=SKEY==='boreallakes'?true:!!FROST;
  const hydroOk=SKEY==='boreallakes'?(wInfo.opens===2&&wInfo.flows===1)
   :SKEY==='morainetarn'?(wInfo.opens===1&&wInfo.flows===1)
   :SKEY==='trigemini'?(wInfo.opens===1&&wInfo.ices===2)
   :(wInfo.ices===1);
  const ok=wInfo.auditFindings===0&&frostOk&&hydroOk;
  return{
   ok:ok,
   detail:'audit='+wInfo.auditFindings+', opens='+wInfo.opens+', ices='+wInfo.ices+', flows='+wInfo.flows+', frost='+!!FROST
  };
 },
 reservesCropsFaunaHazards(extraBuilding){
  const tagRecs=(typeof KTAGS!=='undefined'&&KTAGS.page&&KTAGS.page.records)?KTAGS.page.records:[];
  const blds=extraBuilding?1:tagRecs.filter(r=>r&&r.class==='building').length;
  const cropsN=SWOW_CROPS.queryAll({works:['dark-beds'],nodes:['iron','copper']}).length;
  const khazOk=typeof KHAZ!=='undefined'&&typeof KHAZ.ambient==='function'&&HAZARDS.length>=1;
  const ok=blds===0&&cropsN>=30&&SWOW_FAUNA.SPECIES.length===6&&khazOk;
  return{
   ok:ok,
   detail:'buildings='+blds+', crops='+cropsN+', fauna='+SWOW_FAUNA.SPECIES.length+', hazards='+HAZARDS.length
  };
 },
 vstackGraphics(vs,forceShadowOn){
  const shOff=forceShadowOn?false:!renderer.shadowMap.enabled;
  const untex=collectUntexturedLitMeshes();
  const gUnits=typeof samplersOf==='function'?samplersOf(MAT_GROUND):0;
  const ok=!!vs&&vs.indexedItems===true&&vs.lodMerge===true&&vs.roughAAMats>=4&&vs.chromaticGroundVerts>1000&&vs.drawnSources>=1&&gUnits<13&&shOff&&untex.length===0;
  return{
   ok:ok,
   detail:vs?('indexed='+vs.indexedItems+', lodMerge='+vs.lodMerge+', dilatedCards='+vs.dilatedCards+', roughAA='+vs.roughAAMats+', groundSamplers='+gUnits+', drawnSrc='+vs.drawnSources+', shadowOff='+shOff+', untex='+untex.length):'missing SWOW_VSTACK'
  };
 }
};

function hostChecks(){
 const vs=typeof SWOW_VSTACK!=='undefined'?SWOW_VSTACK.stats:null;
 return[
  {name:'transect-and-hypoxia-physics',ok:HCHK.transectAndHypoxia(SWOW.PLACED,false).ok,detail:HCHK.transectAndHypoxia(SWOW.PLACED,false).detail},
  {name:'native-and-kin-flora',ok:HCHK.nativeAndKinFlora(SKEY).ok,detail:HCHK.nativeAndKinFlora(SKEY).detail},
  {name:'water-and-frost-integrity',ok:HCHK.waterAndFrost(window._water,false).ok,detail:HCHK.waterAndFrost(window._water,false).detail},
  {name:'reserves-crops-fauna-hazards',ok:HCHK.reservesCropsFaunaHazards(false).ok,detail:HCHK.reservesCropsFaunaHazards(false).detail},
  {name:'vstack-graphics',ok:HCHK.vstackGraphics(vs,PQ.get('shadow')==='1'?false:renderer.shadowMap.enabled).ok,detail:HCHK.vstackGraphics(vs,PQ.get('shadow')==='1'?false:renderer.shadowMap.enabled).detail}
 ];
}

function hostNegatives(){
 const vs=typeof SWOW_VSTACK!=='undefined'?SWOW_VSTACK.stats:null;
 return[
  {name:'vascular-above-hypoxia-ceiling-rejected',failed:!HCHK.transectAndHypoxia(SWOW.PLACED,true).ok,detail:'vascular plant above < 0.60 atm hypoxia ceiling fails'},
  {name:'water-audit-defect-rejected',failed:!HCHK.waterAndFrost(window._water,true).ok,detail:'water surface audit mismatch fails'},
  {name:'building-inside-reserve-rejected',failed:!HCHK.reservesCropsFaunaHazards(true).ok,detail:'class===building inside reserve fails'},
  {name:'default-shadow-on-rejected',failed:!HCHK.vstackGraphics(vs,true).ok,detail:'shadowMap enabled at default load fails'}
 ];
}

const HINT=SKEY==='boreallakes'
 ?'Northern Boreal Paternoster Lakes & Veil-Spill Larch Fen (264, 904, +3,040 m, 1.10 atm): two stepped dark boreal lakes linked by a boulder riffle, ringed by Tarn Spire-Spruce, Fur Larch, floating Quaking Sphagnum rafts & dawn frost-smoke.'
 :SKEY==='morainetarn'
 ?'Mid-Northern Turquoise Moraine Lake, Krummholz & Sorted Stone Rings (276, 1024, +4,360 m, 0.91 atm): milky-turquoise glacial-flour tarn impounded behind a terminal moraine, framed by Stone-Pine krummholz, flame-gold Moraine Birch & KFROST polygons.'
 :SKEY==='trigemini'
 ?'Trigemini Pass Junction & Half-Frozen Cold Tarn (279, 1120, +5,680 m, 0.76 atm): three megabreccia glacial U-troughs (Copper Glacier, Dalab, W Rift Highland) meeting around shore-ice shelves, Bellows Cushion O2 domes & Dalab way-cairns.'
 :'Southern Hanging Breath-Vale at the Airless 0.60 atm Threshold (410, 1213, +6,100 m, 0.69->0.58 atm): sheltered breath-pocket of Bellows Cushions & Rime-Lantern Gentians beneath a cobalt-violet sky where vascular life stops dead at the < 0.60 atm headwall.';

const FNAMES=['rock','wet','poly','snow','aufeis','pressure'];

KHOST.take({
 build:'swouterwall'+(SKEY==='boreallakes'?'':'-'+SKEY),
 title:'Krator biome — SW Outer Wall: '+SITE.name,
 hint:HINT,
 scene:scene,
 camera:camera,
 renderer:renderer,
 ground:DRAWN_H,
 clear:1.8,
 registry:REG,
 regHas:regHas,
 views:VIEWS,
 ticks:TICKS,
 controls:CONTROLS,
 clock:{hour:ATMOS.SKY.viewHour},
 draw:SKY.draw,
 inspect:describe,
 stats:()=>'inst '+window._instances+'\n'+statusSummary(),
 layers:{
  'swouterwall native & kin flora':{match:o=>!!(o.userData&&o.userData.biome)},
  'megabreccia tors, aufeis & pass cairns':{match:o=>!!(o.userData&&o.userData.host)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-swouterwall',version:1,site:SITE,state:SWOW_STATE,vstack:SWOW_VSTACK.stats,placed:SWOW.PLACED.length})
 },
 minimap:{title:SITE.name},
 budget:BUDGET,
 types:()=>BIO.stats,
 api:{
  hostChecks:hostChecks,
  hostNegatives:hostNegatives,
  get totals(){const t=BIO.totals();return{tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._station,
  site:()=>SITE,
  placed:()=>SWOW.PLACED,
  state:()=>SWOW_STATE,
  terrainH:DRAWN_H,
  ground:DRAWN_H,
  exportProfile:(SKEY==='boreallakes'||SKEY==='morainetarn')
   ?['registry','items','buckets','materials','textures','terrain','stage','atmos','water']
   :['registry','items','materials','textures','terrain','stage','atmos','water'],
  exportBox:[-140,-140,140,140],
  at:(x,z)=>{
   const y=DRAWN_H(x,z),o={h:y,asl:SITE.baseElevM+y,water:waterH(x,z)};
   FNAMES.forEach(n=>{o[n]=+FIELD[n](x,z).toFixed(3);});
   return o;
  }
 }
});
window._registered=REG.length;
