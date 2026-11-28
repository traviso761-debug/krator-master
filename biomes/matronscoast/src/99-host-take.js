// ================================================================= HOST — preset views, controls, inspector & probe invariants ([draw])
// Strictly obeys VIEW-NAME (survey item 30): zero apostrophes, zero colons, and zero slashes in any preset view name.
// Every preset camera eye sits inside SITE.camPads crown-free pads and >= 8.5 m clear above KDRAWN & water surfaces.
const gh=(x,z,dy)=>Math.max(DRAWN_H(x,z),SITE.hasSea?SITE.seaLevel+0.5:-1e9)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS=SKEY==='skerry'?{
 'Overview':look(142,-132,36,-8,0,6),
 'Drowned skerry sound':look(-24,-68,11.5,8,-12,1.5),
 'Coquina conch midden':look(-112,-14,9.5,-72,-22,3.0),
 'Skerry megachiton ledge':look(48,-52,9.0,88,-12,2.0),
 'Shell dammed emerald pool':look(-74,48,9.0,-68,26,1.2),
 'Yonni sealime reserve':look(-148,88,10.5,-118,78,2.0)
}:SKEY==='browsewood'?{
 'Overview':look(-118,-108,34,0,0,8),
 'Browse line cathedral':look(-38,-26,8.5,8,8,2.4),
 'Mucus silver highway':look(22,-32,8.5,0,0,0.8),
 'Pearl plum cauliflory':look(-56,34,8.5,-64,-38,2.2),
 'Midden slipper orchids':look(64,18,8.5,28,34,2.8),
 'Yonni spear plinth':look(86,-54,10.5,116,-78,2.0)
}:SKEY==='kelpfront'?{
 'Overview':look(128,-118,35,6,0,5),
 'Rasped kelp holdfasts':look(48,26,9.0,6,18,1.2),
 'Tower snail grazing line':look(34,-24,8.5,14,0,1.0),
 'Ocean surf and wrack':look(-18,78,10.5,-56,54,1.5),
 'Coquina wrack rampart':look(78,42,9.0,44,-48,2.8),
 'Frontier wrack watch':look(96,-68,10.5,126,-92,2.0)
}:SKEY==='cloudslope'?{
 'Overview':look(118,-96,35,12,0,10),
 'Shell tufa cataract':look(56,-34,10.5,8,0,11),
 'Shag shell mountain snails':look(-24,38,9.0,-12,28,1.5),
 'Upper mist yew gorge':look(-58,-34,10.5,-22,-8,14),
 'Misty plunge tarn':look(38,34,9.0,76,0,1.5),
 'White Pass shrine site':look(84,-48,10.5,112,-68,2.0)
}:{'Overview':look(118,-96,35,12,0,10)};

function statusSummary(){
 const pAtm=SNAIL_PHYS.pressureAtElev(SITE.baseElevM);
 const br=SNAIL_PHYS.browseLineAt(0,0,SITE,{elevM:SITE.baseElevM});
 return SITE.id+' ['+pAtm.toFixed(2)+' atm · +'+SITE.baseElevM.toFixed(0)+' m] · Browse-skirt '+br.treeSkirtM.toFixed(2)+' m · Gliders '+MATRON.WALKERS.length;
}

const CONTROLS=[
 {
  button:'Day',id:'btn-day',
  title:'Set sunlit 1.22-1.59 atm Kande-Sakhil daylight across coquina conch-middens, nacre shells & opalescent mucus highways',
  on(){
   MC_STATE.mode='day';
   MC_STATE.mist01=0.35;
   skyView(0);
   KHOST.inspector('Daylight Snail Coast illumination -> '+statusSummary());
  }
 },
 {
  button:'Advection Mist',id:'btn-mist',
  title:'Set warm onshore ocean advection fog across skerry channels and Sister-Cup sky-ponds',
  on(){
   MC_STATE.mode='mist';
   MC_STATE.mist01=1.0;
   skyView(0);
   KHOST.inspector('Advection sea-mist shroud -> '+statusSummary());
  }
 },
 {
  button:'Sun shadows',id:'btn-shadow',
  title:'Attach or toggle KSHADOW sun cascade (strictly off at page load by default)',
  on(){const on=toggleSnailShadow();KHOST.inspector('Sun shadows '+(on?'ON':'OFF'));}
 }
];

KHOST.on(skyView,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');

function describe(hit){
 const p=hit.point,o=hit.object;
 let best=null;
 for(const r of REG){if(r.r>400)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const instLbl=(o.isInstancedMesh&&typeof BIO.instLabel==='function')?BIO.instLabel(o,hit.instanceId):null;
 const lab=instLbl||o.userData.inspectLabel||o.name||'mesh';
 const isItem=o.isInstancedMesh&&o.userData.biome;
 const rawItem=isItem?(o.name||'').replace(/^biome:(?:[a-z0-9_-]+\|)?/,''):null;
 const SP=rawItem?(MATRON.speciesOfItem(rawItem)||(typeof SHROUDHILLS!=='undefined'&&SHROUDHILLS.speciesOfItem?SHROUDHILLS.speciesOfItem(rawItem):null)):null;
 const head=SP?(SP.name+'  ·  '+lab):(best?best.name+'  ·  '+lab:lab);

 const asl=SITE.baseElevM+p.y;
 const ceil=SNAIL_PHYS.pulmonateCeilingAt(asl,0.96);
 const br=SNAIL_PHYS.browseLineAt(p.x,p.z,SITE,{elevM:asl});
 const mh=SNAIL_PHYS.mucusHighwayAt(p.x,p.z,SITE,FIELD.slope(p.x,p.z));
 const cm=SNAIL_PHYS.coquinaMiddenAt(p.x,p.z,SITE);

 const lines=[head];
 if(SP&&SP.tags&&SP.tags.harvest&&SP.tags.harvest.notes){
  lines.push('Use: '+SP.tags.harvest.notes);
 }
 lines.push('Elev '+asl.toFixed(1)+' m ASL · P '+ceil.pAtm.toFixed(2)+' atm · Max shell '+ceil.maxShellM.toFixed(2)+' m · Browse-skirt '+br.treeSkirtM.toFixed(2)+' m');
 if(mh.trail01>0.08){
  lines.push('Mucus Silver-Highway '+mh.trail01.toFixed(2)+' · Groove '+mh.grooveDepthM.toFixed(2)+' m · Slip risk '+mh.slipRisk01.toFixed(2));
 }
 if(cm.thicknessM>0.1){
  lines.push('Coquina Conch-Midden '+cm.thicknessM.toFixed(2)+' m (pH '+cm.soilPh+') · Sealime '+cm.sealimeKgM2+' kg/m2');
 }
 lines.push(p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m');
 return lines.join('\n');
}

const BUDGET={
 showcase:{tris:6500000,calls:140},
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
 Object.keys(MATRON.M).forEach(k=>checkMat(MATRON.M[k],'MATRON.M.'+k));
 checkMat(MAT_GROUND,'MAT_GROUND');
 scene.traverse(o=>{
  if(!o.isMesh||o.userData.sky)return;
  const nm=o.name||'';
  if(/^water:|^atmos:/.test(nm))return;
  if(!(o===GROUND||(FAR&&o===FAR.mesh)||(o.userData&&(o.userData.biome||o.userData.host))))return;
  const mats=Array.isArray(o.material)?o.material:[o.material];
  mats.forEach(m=>checkMat(m,nm||o.userData.inspectLabel||'mesh'));
 });
 return bad;
}

const HCHK={
 snailBrowseAndAntBarrier(elevM,mucus01){
  const br=SNAIL_PHYS.browseLineAt(0,0,SNAIL_SITES.browsewood,{elevM:elevM});
  const ant=SNAIL_PHYS.antExclusionAt(elevM,mucus01,3920);
  const st=window._station||{};
  const ok=br.treeSkirtM>=2.10&&!ant.drumGallAllowed&&(st.drumGalls||0)===0;
  return{
   ok:ok,
   detail:'browseSkirt='+br.treeSkirtM+'m, antSurvival='+ant.antSurvival01+', drumGalls='+(st.drumGalls||0)
  };
 },
 kelpFrontAndChirality(snailDensity01){
  const kf=SNAIL_PHYS.kelpFrontBalanceAt(-36,24,SNAIL_SITES.kelpfront,{spray01:0.88,snailDensity01:snailDensity01,goatKiln01:0.0});
  let sinN=0;
  for(let i=0;i<1000;i++)if(SNAIL_PHYS.chiralityOf(70000+i,0x51a1).sinistral)sinN++;
  const ok=kf.kelpSuppressed&&kf.survivingStipeM<=1.25&&sinN>=12&&sinN<=32;
  return{
   ok:ok,
   detail:'kelpStipe='+kf.survivingStipeM+'m, sinistralQueenPermil='+sinN
  };
 },
 reservesAndPlaid(extraBuilding){
  const tagRecs=(typeof KTAGS!=='undefined'&&KTAGS.page&&KTAGS.page.records)?KTAGS.page.records:[];
  const blds=extraBuilding?1:tagRecs.filter(r=>r&&r.class==='building').length;
  const resN=tagRecs.filter(r=>r&&r.class==='landmark'&&String(r.id||'').indexOf('site:yonni-')===0).length;
  const plaid=SNAIL_CROPS.canPlaid({wool:false});
  const cropsN=SNAIL_CROPS.queryAll().length;
  return{
   ok:blds===0&&resN>=1&&plaid&&cropsN>=55&&SNAIL_FAUNA.SPECIES.length===7&&HAZARDS.length>=1,
   detail:'buildings='+blds+', yonniReserves='+resN+', canPlaid='+plaid+', crops='+cropsN+', fauna='+SNAIL_FAUNA.SPECIES.length+', hazards='+HAZARDS.length
  };
 },
 vstackAndSamplers(vs,forceShadowOn){
  const shOff=forceShadowOn?false:!renderer.shadowMap.enabled;
  const untex=collectUntexturedLitMeshes();
  const gUnits=typeof samplersOf==='function'?samplersOf(MAT_GROUND):0;
  const ok=!!vs&&vs.indexedItems===true&&vs.lodMerge===true&&vs.roughAAMats>=4&&vs.nacreSheenMats>=3&&vs.drawnSources>=1&&shOff&&untex.length===0&&gUnits>0&&gUnits<13;
  return{
   ok:ok,
   detail:vs?('samplers='+gUnits+' (<13), nacreSheen='+vs.nacreSheenMats+', roughAA='+vs.roughAAMats+', drawnSrc='+vs.drawnSources+', shadowOff='+shOff+', untex='+untex.length):'missing MC_VSTACK'
  };
 }
};

function hostChecks(){
 const vs=typeof MC_VSTACK!=='undefined'?MC_VSTACK.stats:null;
 return[
  {name:'browse-skirt-and-ant-exclusion',ok:HCHK.snailBrowseAndAntBarrier(210.0,0.75).ok,detail:HCHK.snailBrowseAndAntBarrier(210.0,0.75).detail},
  {name:'kelp-suppression-and-queen-chirality',ok:HCHK.kelpFrontAndChirality(0.92).ok,detail:HCHK.kelpFrontAndChirality(0.92).detail},
  {name:'yonni-reserves-plaid-and-fauna',ok:HCHK.reservesAndPlaid(false).ok,detail:HCHK.reservesAndPlaid(false).detail},
  {name:'vstack-nacre-and-samplers-under-13',ok:HCHK.vstackAndSamplers(vs,PQ.get('shadow')==='1'?false:renderer.shadowMap.enabled).ok,detail:HCHK.vstackAndSamplers(vs,PQ.get('shadow')==='1'?false:renderer.shadowMap.enabled).detail}
 ];
}

function hostNegatives(){
 const vs=typeof MC_VSTACK!=='undefined'?MC_VSTACK.stats:null;
 return[
  {name:'unglazed-trunk-admits-shroud-ants',failed:!HCHK.snailBrowseAndAntBarrier(210.0,0.0).ok,detail:HCHK.snailBrowseAndAntBarrier(210.0,0.0).detail},
  {name:'snail-free-coast-overrun-by-landkelp',failed:!HCHK.kelpFrontAndChirality(0.0).ok,detail:HCHK.kelpFrontAndChirality(0.0).detail},
  {name:'building-inside-yonni-reserve-rejected',failed:!HCHK.reservesAndPlaid(true).ok,detail:'class===building inside site:yonni-* reserve fails'},
  {name:'default-shadow-on-rejected',failed:!HCHK.vstackAndSamplers(vs,true).ok,detail:'shadowMap enabled at default load fails'}
 ];
}

const HINT=SKEY==='skerry'
 ?'Matrons Coast Skerry Sound (312, 392, 1.59 atm): drowned 16-island granite-and-coquina archipelago, 4 m cemented spiral Conch-Middens blooming with Twin-Slipper Orchids, 1.1 m 8-plated Skerry Megachitons, and Yonni sealime kiln reserves.'
 :SKEY==='browsewood'
 ?'The 2.2 m Browse-Line Snail Cathedral (356, 424, 1.56 atm): buttressed kohekohe & cauliflorous Pearl-Plum rainforest trimmed to a 2.2 m skirt above opalescent Mucus Silver-Highways, gliding 1 m Matrons Tower-Snails, and Sister-Cup sky-ponds.'
 :SKEY==='kelpfront'
 ?'The Southern Kelp-Grazing Front (298, 476, 1.58 atm): where Farside alien landkelp hits a living wall of giant snail & Megachiton radulae, rasping 30 m kelp stipes down to scarred holdfast stubs along wave-sprayed coquina benches.'
 :'Upper Cfb Cloud-Rainforest & Shell-Tufa Cataract (438, 386, +2,150 m, 1.22 atm): mist-drenched Skerry Mist-Yew & podocarp gorge cascading over 6 shell-cemented tufa steps with furry Shag-Shell Mountain Snails & Painted Lantern-Snails.';

const FNAMES=['slope','rock','wet','coquina','mucus','spray','kelp'];

const IS_SW_GL=(function(){
 try{
  const g=renderer.getContext(),e=g&&g.getExtension('WEBGL_debug_renderer_info');
  const r=g?(e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER)):'';
  return /SwiftShader|llvmpipe|Software/i.test(String(r));
 }catch(err){return false;}
})();

const smartDraw=(function(){
 let lastKey='';
 return function(){
  if(!IS_SW_GL||window.__origRAF||(KHOST.host&&KHOST.host.clock&&KHOST.host.clock.running)){
   SKY.render();
   return;
  }
  const pend=(window._texPending||0)>0?1:0;
  const impW=(BIO.IMP&&BIO.IMP.waiting)?1:0;
  if(lastKey&&(pend||impW))return;
  const e=camera.matrixWorld.elements;
  const key=[e[12].toFixed(2),e[13].toFixed(2),e[14].toFixed(2),e[8].toFixed(3),e[9].toFixed(3),e[10].toFixed(3),
   pend,impW,MC_STATE.mode,MC_STATE.mist01.toFixed(2),renderer.shadowMap.enabled?1:0,
   KHOST.host&&KHOST.host.clock?KHOST.host.clock.hour.toFixed(2):'10.6'].join('|');
  if(key===lastKey)return;
  lastKey=key;
  SKY.render();
 };
})();

KHOST.take({
 build:'matronscoast'+(SKEY==='skerry'?'':'-'+SKEY),
 title:'Krator biome — Matrons Coast: '+SITE.name,
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
 clock:{hour:10.6,onSet:()=>{}},
 draw:smartDraw,
 inspect:describe,
 stats:()=>'inst '+window._instances+'\n'+statusSummary(),
 layers:{
  'snail-coast flora & giant molluscs':{match:o=>!!(o.userData&&o.userData.biome)},
  'coquina middens, skerries & sealime works':{match:o=>!!(o.userData&&o.userData.host)}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-matronscoast',version:1,site:SITE,state:MC_STATE,vstack:MC_VSTACK.stats,placed:MATRON.PLACED.length,walkers:MATRON.WALKERS.length})
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
  placed:()=>MATRON.PLACED,
  state:()=>MC_STATE,
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
