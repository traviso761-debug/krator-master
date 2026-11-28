// ================================================================= HOST — preset views, controls, inspector & probe invariants ([draw])
// Strictly obeys VIEW-NAME (survey item 30): ZERO apostrophes, ZERO colons, and ZERO slashes in any preset view name!
// Every preset camera eye sits >= 7.5 m clear above KDRAWN surfaces and inside CAM_CLEAR crown-free circles.
const gh=(x,z,dy)=>DRAWN_H(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS=SKEY==='ringlake'?{
 'Overview':look(84,-78,34,0,0,12),
 'Central rebound peak':look(0,-62,10.5,0,-6,18),
 'Annular moat lake':look(-68,42,11.0,-158,86,0.5),
 'Shatter cone tors':look(44,-14,9.5,18,14,8),
 'Yuni mosaic shrine':look(-142,-98,12.5,18,-58,3),
 'Pioneer clearing site':look(28,68,11.0,52,-36,2)
}:SKEY==='notch'?{
 'Overview':look(-58,-44,32,0,0,6),
 'Skippers Notch pass':look(0,-18,9.5,48,0,2),
 'West doublet lake':look(-42,36,12.0,-185,12,-8),
 'North crater overlook':look(56,34,12.5,195,-14,-14),
 'Bandit timber abatis':look(46,-46,9.5,24,-12,2),
 'Suevite overhang eyrie':look(12,72,11.5,6,-34,3)
}:SKEY==='vents'?{
 'Overview':look(64,-96,32,-18,0,4),
 'Boiling fumarole pools':look(-24,-54,9.5,-56,-18,2),
 'Silica sinter terraces':look(-74,-34,9.5,-66,-38,2),
 'Emerald hot lake':look(94,24,10.5,26,12,0.5),
 'Snow bare oasis ring':look(-18,-136,10.5,-8,-146,2.5),
 'Yuni bathhouse claim':look(138,16,11.5,152,24,3)
}:SKEY==='glasssheet'?{
 'Overview':look(-96,-72,30,10,0,2),
 'Tagamite melt floor':look(-14,-52,8.5,28,-12,1),
 'Meteoric nickel creek':look(54,-24,8.5,24,12,0.5),
 'Blue nickel heather':look(-64,14,8.0,-36,-22,1),
 'Bonsai melt pines':look(22,42,9.0,18,74,5),
 'Meteoric ore outcrop':look(-62,-84,9.5,-54,-92,2.5)
}:{
 'Overview':look(24,-84,30,-18,4,4),
 'Erebus ice chimneys':look(-24,-6,8.5,-42,-18,6),
 'Frozen crater tarn':look(68,-34,9.5,36,14,0.5),
 'Cryofumarole moss rim':look(-64,-28,8.5,-58,24,4),
 'Warm steam cave mouth':look(-76,-68,8.5,-94,-56,3),
 'Permafrost polygons':look(-88,18,9.5,-118,38,2)
};

function statusSummary(){
 const pAtm=RICOCHET_PHYS.pressureAtElev(SITE.baseElevM);
 const ht=RICOCHET_PHYS.heatAt(0,0,SITE);
 return SITE.id+' ['+pAtm.toFixed(2)+' atm · +'+SITE.baseElevM.toFixed(0)+' m · '+SITE.koppen+'] · surf '+ht.surfaceTempC.toFixed(1)+' C';
}

const CONTROLS=[
 {
  button:'Day',id:'btn-day',
  title:'Set crisp high-altitude crater daylight across golden shatter-larches, sapphire moat lakes & suevite walls',
  on(){
   RP_STATE.mode='day';
   RP_STATE.dusk01=0.0;
   if(ATMOS.snow){ATMOS.snow.depth=SKEY==='highbowl'?0.72:(SKEY==='vents'?0.48:0.16);ATMOS.U.snowDepth.value=ATMOS.snow.depth;}
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector('Crater daylight -> '+statusSummary());
  }
 },
 {
  button:'Ring-Shadow Dusk',id:'btn-dusk',
  title:'Set early crater ring-shadow dusk & katabatic drainage illumination',
  on(){
   RP_STATE.mode='dusk';
   RP_STATE.dusk01=1.0;
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector('Crater ring-shadow dusk & katabatic drainage -> '+statusSummary());
  }
 },
 {
  button:'Winter Snow',id:'btn-snow',
  title:'Deepen crater snowpack (highlighting the green hydrothermal snowBare oasis around East Hearth fumaroles!)',
  on(){
   if(ATMOS.snow){
    ATMOS.snow.depth=ATMOS.snow.depth>0.65?0.16:0.82;
    ATMOS.U.snowDepth.value=ATMOS.snow.depth;
    KHOST.inspector('Crater snow depth '+ATMOS.snow.depth.toFixed(2)+' -> '+statusSummary());
   }
  }
 },
 {
  button:'Sun shadows',id:'btn-shadow',
  title:'Attach or toggle KSHADOW sun cascade (strictly off at page load by default)',
  on(){const on=toggleRicochetShadow();KHOST.inspector('Sun shadows '+(on?'ON':'OFF'));}
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
 const SP=rawItem?RICOCHET.speciesOfItem(rawItem):null;
 const head=SP?(SP.name+'  ·  '+lab):(best?best.name+'  ·  '+lab:lab);

 const asl=SITE.baseElevM+p.y;
 const pAtm=RICOCHET_PHYS.pressureAtElev(asl);
 const ht=RICOCHET_PHYS.heatAt(p.x,p.z,SITE);
 const bt=RICOCHET_PHYS.bowlTreelineAt(p.x,p.z,p.y-2.0,ht.heatLiftC,SITE);
 const ma=RICOCHET_PHYS.meteoricAnomalyAt(p.x,p.z,SITE);
 const lines=[head];
 if(SP){
  lines.push('Zone: '+SP.tags.zone+' · Kin: '+(SP.tags.kin||'native'));
  if(SP.tags.harvest&&SP.tags.harvest.notes)lines.push('Use: '+SP.tags.harvest.notes);
 }
 lines.push('Elev '+asl.toFixed(1)+' m ASL · P '+pAtm.toFixed(3)+' atm · Band: '+bt.band+' · Ground '+ht.surfaceTempC.toFixed(1)+' C');
 if(ma.niPpm>600)lines.push('Meteoric anomaly: Ni '+ma.niPpm+' ppm · Fe '+ma.feWtPct+'% · Au '+ma.auPpb+' ppb');
 lines.push(p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m');
 return lines.join('\n');
}

const BUDGET={
 showcase:{tris:6500000,calls:145},
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
 Object.keys(RICOCHET.M).forEach(k=>checkMat(RICOCHET.M[k],'RICOCHET.M.'+k));
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
 bowlTreelineAndCatch(wallReliefM,apronElevM){
  const oc=RICOCHET_PHYS.orographicCatchAt(26.0,wallReliefM,220.0);
  const hollow=RICOCHET_PHYS.bowlTreelineAt(180,0,1.2,0.0,RICOCHET_SITES.ringlake);
  const belt=RICOCHET_PHYS.bowlTreelineAt(45,-20,apronElevM,0.0,RICOCHET_SITES.ringlake);
  const ok=oc.lakeSustained&&oc.effectiveMmYr>=600&&hollow.band==='frost_hollow'&&belt.thermalBelt01>0.70;
  return{
   ok:ok,
   detail:'catch='+oc.effectiveMmYr+' mm/yr, hollow='+hollow.band+', apronBelt='+belt.thermalBelt01
  };
 },
 hydrothermalSnowBare(pt){
  const ht=RICOCHET_PHYS.heatAt(pt[0],pt[1],RICOCHET_SITES.vents);
  const ok=ht.surfaceTempC>55.0&&ht.snowMelted01>0.90;
  return{
   ok:ok,
   detail:'ventTemp='+ht.surfaceTempC+' C, snowMelted01='+ht.snowMelted01
  };
 },
 reservesAndResources(extraBuilding){
  const tagRecs=(typeof KTAGS!=='undefined'&&KTAGS.page&&KTAGS.page.records)?KTAGS.page.records:[];
  const blds=extraBuilding?1:tagRecs.filter(r=>r&&r.class==='building').length;
  const resN=tagRecs.filter(r=>r&&r.kind==='res-node').length;
  const lmN=tagRecs.filter(r=>r&&r.class==='landmark').length;
  return{
   ok:blds===0&&resN>=3&&lmN>=1,
   detail:'buildings='+blds+', resNodes='+resN+', reserves='+lmN
  };
 },
 vstackGraphics(vs,forceShadowOn){
  const shOff=forceShadowOn?false:!renderer.shadowMap.enabled;
  const untex=collectUntexturedLitMeshes();
  const samp=typeof samplersOf==='function'?samplersOf(MAT_GROUND):0;
  const ok=!!vs&&vs.indexedItems===true&&vs.lodMerge===true&&vs.roughAAMats>=4&&vs.chromaticGroundVerts>1000&&vs.drawnSources>=1&&shOff&&untex.length===0&&samp<13;
  return{
   ok:ok,
   detail:vs?('indexed='+vs.indexedItems+', roughAA='+vs.roughAAMats+', drawnSrc='+vs.drawnSources+', groundSamplers='+samp+', shadowOff='+shOff+', untex='+untex.length):'missing RP_VSTACK'
  };
 }
};

function hostChecks(){
 const vs=typeof RP_VSTACK!=='undefined'?RP_VSTACK.stats:null;
 const cropsN=RICOCHET_CROPS.queryAll({works:['dark-beds'],nodes:['iron','nickel','gold']}).length;
 return[
  {name:'crater-orographic-catch-and-bowl-treeline',ok:HCHK.bowlTreelineAndCatch(5000.0,32.0).ok,detail:HCHK.bowlTreelineAndCatch(5000.0,32.0).detail},
  {name:'hydrothermal-snowbare-oasis',ok:HCHK.hydrothermalSnowBare([-58,-18]).ok,detail:HCHK.hydrothermalSnowBare([-58,-18]).detail},
  {name:'reserves-and-meteoric-resources',ok:HCHK.reservesAndResources(false).ok,detail:HCHK.reservesAndResources(false).detail},
  {name:'crops-and-fauna-contracts',ok:cropsN>=35&&RICOCHET_FAUNA.SPECIES.length===6&&HAZARDS.length>=1&&RICOCHET.PLACED.length>=40,
   detail:'crops='+cropsN+', fauna='+RICOCHET_FAUNA.SPECIES.length+', hazards='+HAZARDS.length+', placed='+RICOCHET.PLACED.length},
  {name:'vstack-graphics-and-samplers',ok:HCHK.vstackGraphics(vs,PQ.get('shadow')==='1'?false:renderer.shadowMap.enabled).ok,
   detail:HCHK.vstackGraphics(vs,PQ.get('shadow')==='1'?false:renderer.shadowMap.enabled).detail}
 ];
}

function hostNegatives(){
 const vs=typeof RP_VSTACK!=='undefined'?RP_VSTACK.stats:null;
 return[
  {name:'frost-hollow-rejects-thermal-taiga',failed:!HCHK.bowlTreelineAndCatch(5000.0,1.0).ok,detail:HCHK.bowlTreelineAndCatch(5000.0,1.0).detail},
  {name:'cold-wall-rejects-snowbare-oasis',failed:!HCHK.hydrothermalSnowBare([-480,-480]).ok,detail:HCHK.hydrothermalSnowBare([-480,-480]).detail},
  {name:'building-inside-reserve-rejected',failed:!HCHK.reservesAndResources(true).ok,detail:'class===building inside reserve fails'},
  {name:'default-shadow-on-rejected',failed:!HCHK.vstackGraphics(vs,true).ok,detail:'shadowMap enabled at default load fails'}
 ];
}

const HINT=SKEY==='ringlake'
 ?'Yuni-Gate Central-Peak Ring-Lake (1205, 1482, +3,250 m, 1.07 atm, Dfb/Dfc): forested central rebound island ringed by an annular sapphire moat-lake and 5 km snow-crowned suevite walls, with radial shatter-cone tors and a pioneering Yuni curved adobe, Gaudi-mosaic & snow-shingle shrine.'
 :SKEY==='notch'
 ?'Skippers Notch Doublet Breach & Bandit Toll-Eyrie (1285, 1508, +3,820 m, 0.99 atm, Dfc): 180 m breached suevite septum looking into two boreal crater-lakes on opposite sides, with wind-flagged melt-pines and outlaw timber abatis & watch-platform.'
 :SKEY==='vents'
 ?'East Hearth Hydrothermal Boreal Oasis (1450, 1558, +3,180 m, 1.08 atm, Dfb): six steaming fumarole pools, white silica sinter terraces, and an emerald hot-spring lake whose hydrothermal heat melts a snow-free green oasis inside winter crater walls.'
 :SKEY==='glasssheet'
 ?'Glass-Pan Impact-Melt Floor & Meteoric Nickel Creek (1158, 1522, +3,580 m, 1.02 atm, Dfc): frost-cracked jet-black tagamite impact-glass pavement, twisted copper-barked bonsai melt-pines, silver reindeer moss, and metallic-blue nickel-heather marking Fe-Ni-Au impactor ore.'
 :'Old Rim Crater Erebus Steam-Ice Chimneys & Frozen Tarn (1375, 1525, +5,100 m, 0.82 atm, ET): hollow 7-13 m rime-ice fumarole towers and warm steam-caves venting into -18 C thin air beside a polygon-cracked frozen crater tarn.';

const FNAMES=['rock','wet','glass','heat','sinter','nickel','frost'];

KHOST.take({
 build:'ricochetpeaks'+(SKEY==='ringlake'?'':'-'+SKEY),
 title:'Krator biome — Ricochet Peaks: '+SITE.name,
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
  'ricochet boreal & thermal flora':{match:o=>!!(o.userData&&o.userData.biome)},
  'suevite tors, ice chimneys & frontier works':{match:o=>!!(o.userData&&o.userData.host)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-ricochetpeaks',version:1,site:SITE,state:RP_STATE,vstack:RP_VSTACK.stats,placed:RICOCHET.PLACED.length})
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
  placed:()=>RICOCHET.PLACED,
  state:()=>RP_STATE,
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
