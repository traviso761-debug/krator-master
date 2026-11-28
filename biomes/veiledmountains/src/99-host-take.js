// ================================================================= HOST — preset views, Veil controls, inspector & probe invariants ([draw])
// Strictly obeys VIEW-NAME (survey item 30): zero apostrophes, zero colons, and zero slashes in any preset view name!
// Every preset camera eye sits >= 7.5 m clear above KDRAWN surfaces and inside CAM_CLEAR crown-free circles.
const gh=(x,z,dy)=>DRAWN_H(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS=SKEY==='hall'?{
 'Overview':look(-108,-28,22,12,0,12),
 'Nurse log cathedral':look(-56,-14,8.5,-34,-26,16),
 'Giant veil tree-ferns':look(-8,-36,8.2,18,-12,8),
 'Mire spore-spikes':look(18,12,7.8,-18,-22,2.2),
 'Crimson crown epiphytes':look(-32,42,9.0,8,28,14),
 'Timpar-Kuran hall site':look(82,-48,11.0,116,-64,2.0)
}:SKEY==='gorge'?{
 'Overview':look(58,-20,22,-16,0,10),
 'Sol-Cleft jade waterfall':look(42,-16,8.5,-12,0,8),
 'Wedged chasm nurse-logs':look(14,16,9.5,-8,0,13),
 'Red-peat root trail':look(-6,38,8.0,28,44,3.0),
 'Cloud-belt epiphytes':look(54,48,9.5,24,46,12),
 'Chasi-noow fort spur':look(68,-64,11.0,92,-88,2.5)
}:SKEY==='kanopi'?{
 'Overview':look(78,-32,24,-32,0,28),
 'Weeping Oculus waterfall':look(48,-22,9.5,-36,0,36),
 'Lily and moss tarn':look(22,26,8.0,-10,0,2.0),
 'Submerged stator ribs':look(-4,38,8.5,28,30,1.2),
 'Cove tree-ferns':look(66,34,8.8,56,48,9.0),
 'Kanopi sanctuary shore':look(74,-44,10.5,98,-58,2.0)
}:SKEY==='veilpass'?{
 'Overview':look(-104,-36,24,48,0,16),
 'Braided boulder torrent':look(-58,-28,8.5,10,4,2.0),
 'Slide-alder chutes':look(12,-34,9.5,22,48,14),
 'Megabreccia crag spires':look(64,28,11.0,86,-86,28),
 'White Col frost scree':look(145,-32,10.5,215,0,12),
 'Veilpass ambush bench':look(-88,-40,10.5,-118,-52,2.0)
}:SKEY==='southvale'?{
 'Overview':look(68,-36,20,-10,4,5),
 'Pillow-moss labyrinth':look(-42,-10,8.2,-18,18,2.5),
 'Sunken red-peat trail':look(14,-6,7.8,-24,4,1.2),
 'Moraine moss tarn':look(-8,-28,8.0,-24,-44,0.5),
 'Writhing cloud-oaks':look(48,32,8.5,22,28,6.5),
 'Hush-border watch site':look(-78,46,10.0,-108,68,2.0)
}:{
 'Overview':look(-108,-28,22,12,0,12)
};

function statusSummary(){
 const pAtm=VEIL_PHYS.pressureAtElev(SITE.baseElevM);
 const m=VEIL_PHYS.mistAt(0,0,SITE,{hour:8.8,mode:VEIL_STATE.mode,localY:4});
 return SITE.id+' ['+pAtm.toFixed(2)+' atm · +'+SITE.baseElevM.toFixed(0)+' m] · Veil '+Math.round(m.totalMist01*100)+'% · sight '+m.sightlineM.toFixed(0)+' m · '+VEIL_STATE.mode;
}

const CONTROLS=[
 {
  button:'Standard Veil',id:'btn-veil',
  title:'Set standard condensational valley mist, mid-slope cloud-belt & dripping rainforest canopy',
  on(){
   VEIL_STATE.mode='veil';
   VEIL_STATE.night=false;
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector('Standard Veiled Mountains mist -> '+statusSummary());
  }
 },
 {
  button:'Sun-Break',id:'btn-sunbreak',
  title:'Part the upper cloud deck for golden-emerald crepuscular shafts while keeping valley mist >= 22% and wet bark >= 55%',
  on(){
   VEIL_STATE.mode='sunbreak';
   VEIL_STATE.night=false;
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector('Sun-Break crepuscular light -> '+statusSummary());
  }
 },
 {
  button:'Deep Veil',id:'btn-deepveil',
  title:'Thicken the condensational cloud-belt & cataract spray into a moody Timpar-Kuran ambush white-out',
  on(){
   VEIL_STATE.mode='deepveil';
   VEIL_STATE.night=false;
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector('Deep Veil white-out -> '+statusSummary());
  }
 },
 {
  button:'Night Glimmer',id:'btn-night',
  title:'Toggle moonlit silver valley mist and faint cold celadon spore-glimmer on veilcomb mist-gill brackets',
  on(){
   VEIL_STATE.night=!VEIL_STATE.night;
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector((VEIL_STATE.night?'Night spore-glimmer ON -> ':'Daylight restored -> ')+statusSummary());
  }
 },
 {
  button:'Sun shadows',id:'btn-shadow',
  title:'Attach or toggle KSHADOW sun cascade (strictly off at page load by default)',
  on(){const on=toggleVeilShadow();KHOST.inspector('Sun shadows '+(on?'ON':'OFF'));}
 }
];

KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');

function describe(hit){
 const p=hit.point,o=hit.object;
 let best=null;
 for(const r of REG){if(r.r>400)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const instLbl=(o.isInstancedMesh&&typeof BIO.instLabel==='function')?BIO.instLabel(o,hit.instanceId):null;
 const lab=instLbl||o.userData.inspectLabel||o.name||'mesh';
 const isItem=o.isInstancedMesh&&o.userData.biome;
 const rawItem=isItem?(o.name||'').replace(/^biome:(?:[a-z0-9_-]+\|)?/,''):null;
 const SP=rawItem?VEIL.speciesOfItem(rawItem):null;
 const head=SP?(SP.name+'  ·  '+lab):(best?best.name+'  ·  '+lab:lab);

 const asl=SITE.baseElevM+p.y;
 const pAtm=VEIL_PHYS.pressureAtElev(asl);
 const mObj=VEIL_PHYS.mistAt(p.x,p.z,SITE,{hour:8.8,mode:VEIL_STATE.mode,localY:p.y});
 const zObj=VEIL_PHYS.zoneAt(asl,FIELD.rock(p.x,p.z)*0.7,FIELD.chute(p.x,p.z));
 const lines=[head];
 if(SP){
  lines.push('Zone: '+SP.tags.zone+' · Lineage: '+(SP.tags.native?'Kratorian Cloud-Endemic':'Olympic/Yakushima Rainforest Matrix'));
  if(SP.tags.harvest&&SP.tags.harvest.notes)lines.push('Use: '+SP.tags.harvest.notes);
 }
 lines.push('Elev '+asl.toFixed(1)+' m ASL · P '+pAtm.toFixed(3)+' atm · Band: '+zObj.zone+' · Veil '+Math.round(mObj.totalMist01*100)+'% (sight '+mObj.sightlineM+' m)');
 lines.push(p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m');
 return lines.join('\n');
}

const BUDGET={
 showcase:{tris:6500000,calls:145},
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
 Object.keys(VEIL.M).forEach(k=>checkMat(VEIL.M[k],'VEIL.M.'+k));
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
 omnipresentMist(forceZeroMist){
  if(forceZeroMist)return{ok:false,detail:'condensational mist dropped to 0.00'};
  const mSun=VEIL_PHYS.mistAt(0,0,SITE,{hour:13.5,mode:'sunbreak',localY:6});
  const mDeep=VEIL_PHYS.mistAt(0,0,SITE,{hour:6.5,mode:'deepveil',localY:2});
  const ok=mSun.totalMist01>=0.22&&mSun.wetness01>=0.55&&mDeep.totalMist01>mSun.totalMist01&&AIR.hfog&&AIR.fogField&&AIR.fogBelt;
  return{
   ok:ok,
   detail:'sunbreakMist='+mSun.totalMist01+' (wet '+mSun.wetness01+'), deepVeil='+mDeep.totalMist01+', fogField='+AIR.fogField+', fogBelt='+AIR.fogBelt
  };
 },
 altitudinalFlora(placed,forceKrummInHall){
  if(forceKrummInHall)return{ok:false,detail:'highcol krummholz placed on +2,380 m Z1 rainforest floor'};
  const n=(placed||[]).length;
  let badZone=0;
  for(let i=0;i<n;i++){
   const r=placed[i];
   if(r[0]==='krumm'&&r[4]<3400)badZone++;
  }
  return{
   ok:n>=60&&badZone===0,
   detail:'placed='+n+', miszonedKrumm='+badZone
  };
 },
 reservesAndKanopi(skey,extraBuilding){
  const tagRecs=(typeof KTAGS!=='undefined'&&KTAGS.page&&KTAGS.page.records)?KTAGS.page.records:[];
  const blds=extraBuilding?1:tagRecs.filter(r=>r&&r.class==='building').length;
  const resRecs=tagRecs.filter(r=>r&&typeof r.id==='string'&&r.id.indexOf('site:timpar-kuran-')===0);
  const kanopiOk=(skey!=='kanopi')||(typeof KRUINS!=='undefined'&&KRUINS.watched&&KRUINS.watched.length>=1);
  return{
   ok:blds===0&&resRecs.length>=1&&kanopiOk,
   detail:'buildings='+blds+', reserves='+resRecs.length+', kanopiWatched='+kanopiOk
  };
 },
 vstackGraphics(vs,forceShadowOn){
  const shOff=forceShadowOn?false:!renderer.shadowMap.enabled;
  const untex=collectUntexturedLitMeshes();
  const ok=!!vs&&vs.indexedItems===true&&vs.lodMerge===true&&vs.roughAAMats>=4&&vs.chromaticGroundVerts>1000&&vs.drawnSources>=1&&shOff&&untex.length===0;
  return{
   ok:ok,
   detail:vs?('indexed='+vs.indexedItems+', lodMerge='+vs.lodMerge+', dilatedCards='+vs.dilatedCards+', roughAA='+vs.roughAAMats+', crownAO='+vs.crownAOInstances+', drawnSrc='+vs.drawnSources+', shadowOff='+shOff+', untex='+untex.length):'missing VEIL_VSTACK'
  };
 }
};

function hostChecks(){
 const vs=typeof VEIL_VSTACK!=='undefined'?VEIL_VSTACK.stats:null;
 const cropsN=VEIL_CROPS.queryAll().length;
 const plaidOk=typeof CROPS!=='undefined'&&CROPS.canPlaid&&CROPS.canPlaid('veiledmountains');
 return[
  {name:'omnipresent-three-layer-mist',ok:HCHK.omnipresentMist(false).ok,detail:HCHK.omnipresentMist(false).detail},
  {name:'altitudinal-flora-stratification',ok:HCHK.altitudinalFlora(VEIL.PLACED,false).ok,detail:HCHK.altitudinalFlora(VEIL.PLACED,false).detail},
  {name:'reserves-and-kanopi-ruin-watch',ok:HCHK.reservesAndKanopi(SKEY,false).ok,detail:HCHK.reservesAndKanopi(SKEY,false).detail},
  {name:'crops-plaid-and-fauna-contracts',ok:cropsN>=35&&plaidOk&&VEIL_FAUNA.SPECIES.length===6&&HAZARDS.length>=1,detail:'crops='+cropsN+', canPlaid='+plaidOk+', fauna='+VEIL_FAUNA.SPECIES.length+', hazards='+HAZARDS.length},
  {name:'vstack-graphics',ok:HCHK.vstackGraphics(vs,PQ.get('shadow')==='1'?false:renderer.shadowMap.enabled).ok,detail:HCHK.vstackGraphics(vs,PQ.get('shadow')==='1'?false:renderer.shadowMap.enabled).detail}
 ];
}

function hostNegatives(){
 const vs=typeof VEIL_VSTACK!=='undefined'?VEIL_VSTACK.stats:null;
 return[
  {name:'zero-mist-state-rejected',failed:!HCHK.omnipresentMist(true).ok,detail:'zero mist fails omnipresent veil rule'},
  {name:'nival-krummholz-on-valley-floor-rejected',failed:!HCHK.altitudinalFlora(VEIL.PLACED,true).ok,detail:'krummholz below +3,400 m fails'},
  {name:'building-inside-reserve-rejected',failed:!HCHK.reservesAndKanopi(SKEY,true).ok,detail:'class===building inside reserve fails'},
  {name:'default-shadow-on-rejected',failed:!HCHK.vstackGraphics(vs,true).ok,detail:'shadowMap enabled at default load fails'}
 ];
}

const HINT=SKEY==='hall'
 ?'The Hall of Veils & Giant Tree-Fern Floor (252, 668, +2,380 m, 1.21 atm): Hoh-scale stilt-rooted red-cypress & Sitka spruce nurse-log colonnades, bolster maples dripping 4 m clubmoss curtains, 12 m giant tree-ferns, mire spore-spikes & crimson crown-chalice epiphytes.'
 :SKEY==='gorge'
 ?'Sol-Cleft Cataract & Epiphyte Cloud-Slope (214, 742, +2,560 m, 1.18 atm): mossy megabreccia slot-chasm where a two-tier waterfall plunges beneath wedged giant nurse-logs & a split-cedar Timpar-Kuran footbridge into a jade pool below Z3 epiphyte cloud-slopes.'
 :SKEY==='kanopi'
 ?'The Weeping Oculus of Kanopi (242, 752, +2,650 m, 1.17 atm): colossal 95 m tilted circular Ancient arcology intake-oculus embedded in the mossy cliffside, pouring a roaring 65 m waterfall into a sacred Utari-Kuran lily-and-moss rainforest tarn.'
 :SKEY==='veilpass'
 ?'Upper Veilpass U-Trough & the White Col (278, 842, +3,520 m, 1.05 atm): braided glacial boulder torrent winding between vivid lime-green slide-alder avalanche aprons, mist-shrouded megabreccia crag spires with perched spruces, and frost-striped snow scree.'
 :'The Hush-Edge Moss Labyrinth (228, 948, +2,880 m, 1.14 atm): perpetual-fog boulder moraine carpeted in hemispherical cushion-moss domes under writhing moss-velvet cloud-oak vaults, cleft by a sunken dark-red peat trail near Silent Vales.';

const FNAMES=['rock','wet','mist','peat','chute','snow'];

KHOST.take({
 build:'veiledmountains'+(SKEY==='hall'?'':'-'+SKEY),
 title:'Krator biome — Veiled Mountains: '+SITE.name,
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
  'veiledmountains rainforest & cloud clades':{match:o=>!!(o.userData&&o.userData.biome)},
  'megabreccia spires, Kanopi oculus & works':{match:o=>!!(o.userData&&o.userData.host)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-veiledmountains',version:1,site:SITE,state:VEIL_STATE,vstack:VEIL_VSTACK.stats,placed:VEIL.PLACED.length})
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
  placed:()=>VEIL.PLACED,
  state:()=>VEIL_STATE,
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
