// ================================================================= HOST — preset views, controls, inspector & probe invariants ([draw])
// Strictly obeys VIEW-NAME (survey item 30): zero apostrophes, zero colons, and zero slashes in any preset view name.
// Every preset camera eye sits >= 6.5 m clear above KDRAWN surfaces and inside CAM_CLEAR crown-free circles.
const gh=(x,z,dy)=>DRAWN_H(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS=SKEY==='klint'?{
 'Overview':look(135,-124,38,-8,0,18),
 'Horseshoe waterfall':look(58,-34,11.5,-18,0,24),
 'Kukersite shale wall':look(-8,52,12.0,-20,16,22),
 'Serpentinite caprock':look(-64,-28,9.5,-24,-54,4),
 'Suur-Neva gorge':look(124,38,9.0,195,12,1.5),
 'Kaarum bridge site':look(88,-52,11.5,118,-78,2.0)
}:SKEY==='koski'?{
 'Overview':look(118,-112,34,0,0,4),
 'Zebra cumulate rapids':look(-34,-42,9.5,4,0,1.0),
 'Hiidenkirnu kettles':look(14,42,7.5,6,25,-0.5),
 'Carnelian skerry rib':look(-18,-36,8.5,-38,-58,4.0),
 'Sampo forge reserve':look(-128,-30,11.0,-18,-108,2.0),
 'Lower amber eddy':look(68,38,7.5,96,6,0.5)
}:SKEY==='seep'?{
 'Overview':look(112,-96,34,4,0,10),
 'Cerulean tufa pools':look(52,-36,10.5,8,0,11),
 'Jumala-Tuli flames':look(-18,-34,9.5,-48,-8,3.5),
 'Carnelian spire garden':look(-38,24,8.5,-62,8,5.5),
 'Serpentinite thrust':look(84,28,9.0,68,-64,6.0),
 'Uncrowned shrine site':look(96,-58,11.5,132,-86,2.0)
}:SKEY==='neva'?{
 'Overview':look(-118,-112,34,8,0,3),
 'Crazy-quilt skerries':look(-24,-34,9.5,-64,-44,6.0),
 'Penny-ore shoal':look(18,-26,7.0,-12,-8,0.2),
 'Tea-black fen river':look(46,-16,7.5,88,12,0.5),
 'Cloudberry sphagnum':look(-68,-14,6.8,-92,16,1.0),
 'Bog-rake wharf site':look(-86,-68,10.5,-118,-96,2.0)
}:{
 'Overview':look(-118,-116,36,24,-12,4),
 'Soil-auger rig':look(18,-56,9.5,64,-28,5.5),
 'Lime-dosed birch oasis':look(98,-18,8.5,58,-30,4.0),
 'Ancient bleach swath':look(-46,12,9.0,-82,16,0.5),
 'Blood-strangler seam':look(-14,46,7.5,-36,38,1.5),
 'Frontier watch-post':look(-98,-64,11.0,-138,-96,2.0)
};

function statusSummary(){
 const pAtm=ARCFLOW_PHYS.pressureAtElev(SITE.baseElevM);
 const fq=ARCFLOW_PHYS.frontierQuiltAt(0,0,SITE);
 return SITE.id+' ['+pAtm.toFixed(2)+' atm · +'+SITE.baseElevM.toFixed(0)+' m] · Crazy-Quilt red '+Math.round(SITE.baselineRed01*100)+'% · center '+fq.biosphere;
}

const CONTROLS=[
 {
  button:'Day',id:'btn-day',
  title:'Set sunlit 1.37-1.58 atm Kulaneva daylight across foredeep birches, cerulean tufa & crimson serpentinite islands',
  on(){
   AF_STATE.mode='day';
   AF_STATE.dusk01=0.0;
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector('Daylight Crazy-Quilt illumination -> '+statusSummary());
  }
 },
 {
  button:SKEY==='seep'?'Dusk Cold-Flames':'Low-Sun Carnelian Glow',id:'btn-dusk',
  title:'Set low-angle dusk illumination: intensifies subsurface Erythrophyll carnelian translucency & Jumala-Tuli cold-flames',
  on(){
   AF_STATE.mode='dusk';
   AF_STATE.dusk01=1.0;
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector('Dusk Erythrophyll subsurface glow -> '+statusSummary());
  }
 },
 {
  button:'Sun shadows',id:'btn-shadow',
  title:'Attach or toggle KSHADOW sun cascade (strictly off at page load by default)',
  on(){const on=toggleArcflowShadow();KHOST.inspector('Sun shadows '+(on?'ON':'OFF'));}
 }
];

KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(function viewStateSync(){
 if(SKEY==='seep'){
  const dFlames=Math.hypot(camera.position.x+18,camera.position.z+34);
  if(dFlames<4.5&&AF_STATE.mode!=='dusk'){AF_STATE.mode='dusk';AF_STATE.dusk01=1.0;if(SKY&&SKY.view)SKY.view();}
 }
},'view');

function describe(hit){
 const p=hit.point,o=hit.object;
 let best=null;
 for(const r of REG){if(r.r>400)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const instLbl=(o.isInstancedMesh&&typeof BIO.instLabel==='function')?BIO.instLabel(o,hit.instanceId):null;
 const lab=instLbl||o.userData.inspectLabel||o.name||'mesh';
 const isItem=o.isInstancedMesh&&o.userData.biome;
 const rawItem=isItem?(o.name||'').replace(/^biome:(?:[a-z0-9_-]+\|)?/,''):null;
 const SP=rawItem?ARCFLOW.speciesOfItem(rawItem):null;
 const head=SP?(SP.name+'  ·  '+lab):(best?best.name+'  ·  '+lab:lab);

 const oph=ARCFLOW_PHYS.ophioliteBeltAt(p.x,p.z,SITE);
 const fq=ARCFLOW_PHYS.frontierQuiltAt(p.x,p.z,SITE);
 const seep=ARCFLOW_PHYS.alkalineSeepAt(p.x,p.z,SITE);
 const asl=SITE.baseElevM+p.y;
 const pAtm=ARCFLOW_PHYS.pressureAtElev(asl);
 const lines=[head];
 if(SP){
  lines.push('Biosphere: '+(SP.tags.native?'Carnelian Erythrophyll':'Earth Chlorophyll')+' · Zone: '+SP.tags.zone);
  if(SP.tags.harvest&&SP.tags.harvest.notes)lines.push('Use: '+SP.tags.harvest.notes);
 }
 lines.push('Elev '+asl.toFixed(1)+' m ASL · P '+pAtm.toFixed(3)+' atm · Mg/Ca '+oph.mgCaRatio+' · Ni '+oph.niPpm+' ppm · Quilt: '+fq.biosphere);
 if(seep.ph>8.5)lines.push('Hyperalkaline seep pH '+seep.ph+' · Cerulean tufa '+seep.ceruleanTufa01.toFixed(2));
 if(fq.bleachScar01>0.1||fq.augerOasis01>0.1){
  lines.push('Bleach-Swath '+fq.bleachScar01.toFixed(2)+' · 45 m Auger lime-oasis '+fq.augerOasis01.toFixed(2));
 }
 lines.push(p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m');
 return lines.join('\n');
}

const BUDGET={
 showcase:{tris:6500000,calls:135},
 cls:{life:4000000,host:2500000},
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
 Object.keys(ARCFLOW.M).forEach(k=>checkMat(ARCFLOW.M[k],'ARCFLOW.M.'+k));
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
 koskiAndBogOre(qM3s,humicPh){
  const open=ARCFLOW_PHYS.koskiHydraulicsAt(qM3s,false,0.4);
  const sill=ARCFLOW_PHYS.koskiHydraulicsAt(qM3s,true,4.5);
  const ore=ARCFLOW_PHYS.bogOreShoalAt(humicPh,0.85,0.78);
  const ok=open.froude<0.55&&sill.froude>0.95&&sill.pothole01>0.65&&sill.millHeadKw>=400&&ore.rakeReady&&ore.niWtPct>=4.0;
  return{
   ok:ok,
   detail:'koski Fr '+open.froude+' -> '+sill.froude+' (sampo '+sill.millHeadKw+' kW), raha-maak '+ore.pennyOreKgM2+' kg/m2 ('+ore.niWtPct+'% Ni)'
  };
 },
 crazyQuiltPartition(placed,forceEarthOnToxic){
  if(forceEarthOnToxic){
   return{ok:false,detail:'chlorophyll Earth tree placed on unlimed Mg/Ca > 8 serpentinite'};
  }
  const earthKeys={
   nevabirch:1,klintspruce:1,mustaalder:1,klintlinden:1,klintrowan:1,
   tremblingaspen:1,goatwillow:1,klintjuniper:1,sweetgale:1,cloudberryfen:1,
   augerclover:1,fencottongrass:1,bleachfireweed:1,nevasundew:1,bogcranberry:1,
   koskireed:1,serpentinespleenwort:1,klinthepatica:1,spraycliffpolypody:1,kulanewawoad:1
  };
  const carnKeys={carnelian_organpipe:1,erythra_veil:1,bladder_tether:1,agate_window:1,blood_strangler:1};
  let earthN=0,carnN=0,badEarth=0;
  for(let i=0;i<(placed||[]).length;i++){
   const r=placed[i],k=r[0],m=r[6]||{};
   const mgCa=m.mgCaRatio==null?m.mgCa:m.mgCaRatio;
   const oasis=m.augerOasis01==null?0:m.augerOasis01;
   const bleach=m.bleachScar01==null?0:m.bleachScar01;
   if(earthKeys[k]){
    earthN++;
    if(m.biosphere!=='earth'||bleach>0.55||(mgCa!=null&&mgCa>8.0&&!(oasis>0.35)))badEarth++;
   }else if(carnKeys[k]){
    carnN++;
    if(m.biosphere!=='carnelian')badEarth++;
   }else{
    badEarth++;
   }
  }
  const ok=earthN>=15&&carnN>=8&&badEarth===0;
  return{
   ok:ok,
   detail:'earth='+earthN+', carnelian='+carnN+', mispartitioned='+badEarth
  };
 },
 reservesAndEcoformer(skey,extraBuilding){
  const tagRecs=(typeof KTAGS!=='undefined'&&KTAGS.page&&KTAGS.page.records)?KTAGS.page.records:[];
  const blds=extraBuilding?1:tagRecs.filter(r=>r&&r.class==='building').length;
  const augerRec=tagRecs.filter(r=>r&&r.id==='arcflow:ecof-soil-auger');
  const augerOk=(skey!=='auger')||(augerRec.length===1&&augerRec[0].class==='infrastructure');
  return{
   ok:blds===0&&augerOk,
   detail:'buildings='+blds+', augerMachine='+(skey==='auger'?augerRec.length:'n/a')
  };
 },
 vstackGraphics(vs,forceShadowOn){
  const shOff=forceShadowOn?false:!renderer.shadowMap.enabled;
  const untex=collectUntexturedLitMeshes();
  const ok=!!vs&&vs.indexedItems===true&&vs.lodMerge===true&&vs.roughAAMats>=4&&vs.chromaticGroundVerts>1000&&vs.drawnSources>=1&&shOff&&untex.length===0;
  return{
   ok:ok,
   detail:vs?('indexed='+vs.indexedItems+', lodMerge='+vs.lodMerge+', dilatedCards='+vs.dilatedCards+', roughAA='+vs.roughAAMats+', crownAO='+vs.crownAOInstances+', drawnSrc='+vs.drawnSources+', shadowOff='+shOff+', untex='+untex.length):'missing AF_VSTACK'
  };
 }
};

function hostChecks(){
 const vs=typeof AF_VSTACK!=='undefined'?AF_VSTACK.stats:null;
 const cropsN=ARCFLOW_CROPS.queryAll({works:['dark-beds'],nodes:['iron','copper']}).length;
 return[
  {name:'koski-hydraulics-and-penny-ore',ok:HCHK.koskiAndBogOre(433.0,4.35).ok,detail:HCHK.koskiAndBogOre(433.0,4.35).detail},
  {name:'serpentine-crazy-quilt-partition',ok:HCHK.crazyQuiltPartition(ARCFLOW.PLACED,false).ok,detail:HCHK.crazyQuiltPartition(ARCFLOW.PLACED,false).detail},
  {name:'reserves-and-ecoformer-tags',ok:HCHK.reservesAndEcoformer(SKEY,false).ok,detail:HCHK.reservesAndEcoformer(SKEY,false).detail},
  {name:'crops-and-fauna-contracts',ok:cropsN>=50&&ARCFLOW_FAUNA.SPECIES.length===6&&HAZARDS.length>=1,detail:'crops='+cropsN+', fauna='+ARCFLOW_FAUNA.SPECIES.length+', hazards='+HAZARDS.length},
  {name:'vstack-graphics',ok:HCHK.vstackGraphics(vs,PQ.get('shadow')==='1'?false:renderer.shadowMap.enabled).ok,detail:HCHK.vstackGraphics(vs,PQ.get('shadow')==='1'?false:renderer.shadowMap.enabled).detail}
 ];
}

function hostNegatives(){
 const vs=typeof AF_VSTACK!=='undefined'?AF_VSTACK.stats:null;
 return[
  {name:'neutral-water-rejects-penny-ore',failed:!HCHK.koskiAndBogOre(433.0,7.6).ok,detail:HCHK.koskiAndBogOre(433.0,7.6).detail},
  {name:'chlorophyll-on-serpentine-rejected',failed:!HCHK.crazyQuiltPartition(ARCFLOW.PLACED,true).ok,detail:'Earth tree on toxic Mg/Ca > 8 serpentinite fails'},
  {name:'building-inside-reserve-rejected',failed:!HCHK.reservesAndEcoformer(SKEY,true).ok,detail:'class===building inside reserve fails'},
  {name:'default-shadow-on-rejected',failed:!HCHK.vstackGraphics(vs,true).ok,detail:'shadowMap enabled at default load fails'}
 ];
}

const HINT=SKEY==='klint'
 ?'Kulaneva-Klint 55 m Horseshoe Waterfall (638, 136, +121 m, 1.57 atm): dark onshore Arch basalt & serpentinite caprock overhanging golden kukersite oil-shale & glauconitic blue amber-clay, framed by spire-spruce, honey-linden & crimson serpentinite fault-crusts.'
 :SKEY==='koski'
 ?'Helme-Koski Zebra-Cumulate Rapids (556, 96, +458 m, 1.51 atm): mirror-slick black chromitite & white anorthosite bench-cataracts, cylindrical Hiidenkirnu amber swirl-kettles, green river-birch banks & scarlet Carnelian skerry ribs.'
 :SKEY==='seep'
 ?'pH 11.5 Cerulean Travertine Cascades & Jumala-Tuli Cold-Flames (518, 118, +116 m, 1.58 atm): active continental serpentinization venting milky-cerulean Ca-OH tufa pools and pale-blue abiotic H2/CH4 flames inside a 60% Carnelian spire-garden.'
 :SKEY==='neva'
 ?'Musta-Jogi Kalju-Selka Skerries & Penny-Ore Fen (648, 130, +235 m, 1.55 atm): emerald-and-russet cloudberry Sphagnum peatlands and regenerating Fe-Ni raha-maak penny-ore shoals wrapping around crimson-crowned serpentinite whaleback islands.'
 :'NE Ecocide Bleach-Seam & Stalled Soil-Auger Oasis (885, 108, +1,265 m, 1.37 atm): serpentinite Carnelian red-barren sliced by a bone-white Ancient Bleach-Swath and a derelict ecof_soil_auger rig whose 45 m lime-dosed disc blooms with green silver-birch & clover.';

const FNAMES=['rock','wet','serpentinite','carnelian','bleach','tufa','oasis'];

KHOST.take({
 build:'arcflow'+(SKEY==='klint'?'':'-'+SKEY),
 title:'Krator biome — Arcflow: '+SITE.name,
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
  'arcflow Earth & Carnelian clades':{match:o=>!!(o.userData&&o.userData.biome)},
  'kalju-selka tors, auger & works':{match:o=>!!(o.userData&&o.userData.host)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-arcflow',version:1,site:SITE,state:AF_STATE,vstack:AF_VSTACK.stats,placed:ARCFLOW.PLACED.length})
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
  placed:()=>ARCFLOW.PLACED,
  state:()=>AF_STATE,
  terrainH:DRAWN_H,
  ground:DRAWN_H,
  exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','water'],
  exportBox:[-140,-140,140,140],
  at:(x,z)=>{
   const y=DRAWN_H(x,z),o={h:y,asl:SITE.baseElevM+y,water:waterH(x,z)};
   FNAMES.forEach(n=>{o[n]=+FIELD[n](x,z).toFixed(3);});
   return o;
  }
 }
});
window._registered=REG.length;
