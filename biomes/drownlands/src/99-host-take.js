/* ==================== HOST — preset views, tidal/tsunami mode controller, inspector & invariants (KHOST.take) ==================== */
/* View and check names use alphanumeric + spaces/hyphens only (zero apostrophes or colons: survey item 30). */

const drawnOrTerrH=(x,z)=>{
 const dh=(typeof KDRAWN!=='undefined'&&KDRAWN.h)?KDRAWN.h(x,z):null;
 const th=terrainH(x,z);
 return dh==null?th:Math.max(th,dh);
};
const camBaseH=(x,z,dy)=>Math.max(drawnOrTerrH(x,z),0.2)+(dy==null?0:dy);
const tgtBaseH=(x,z,dy)=>Math.max(drawnOrTerrH(x,z),-4.0)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,camBaseH(cx,cz,dyc),cz,tx,tgtBaseH(tx,tz,dyt),tz];

const VIEWS=(function(){
 if(SKEY==='bar'){
  return{
   'Overview':look(-330,-285,105,0,25,4),
   'Boulder chevron':look(-68,-192,16.5,-18,-112,8),
   'Sponge coral flat':look(-56,-24,7.5,-8,38,0.6),
   'Phytomine coppice':look(102,184,8.5,148,150,2.0),
   'Seamount horizon':look(12,-92,18.5,-180,-620,25),
   'Prou-Torre site':look(68,62,7.5,108,96,1.5)
  };
 }
 if(SKEY==='drowned'){
  return{
   'Overview':look(-315,-275,92,-12,10,3),
   'Ghost snag lagoon':look(-96,-74,8.5,-15,10,4.0),
   'Oyster collar trunks':look(30,-22,5.5,-8,14,1.2),
   'Coal seam bank':look(-122,-68,6.8,-172,-42,1.5),
   'Driftwood boom':look(86,-82,6.5,48,-112,0.8),
   'Detachment gut':look(116,-8,9.5,158,35,0.4)
  };
 }
 if(SKEY==='skerry'){
  return{
   'Overview':look(-385,285,128,18,-12,48),
   'Araucaria refuge crown':look(-46,52,16.5,18,-12,10),
   'Trimline scarp':look(-185,88,22.0,-42,22,44),
   'Laterite cuirasse':look(74,-62,14.5,18,-12,12),
   'Whaler lee channel':look(-195,150,11.5,-275,45,0.5)
  };
 }
 return{
  'Overview':look(-355,285,96,-20,20,2),
  'Teal mangrove cove':look(-16,-30,6.8,42,-18,3.8),
  'Brucite chimneys':look(-106,22,6.5,-146,24,1.4),
  'Trench dropoff':look(-146,84,12.5,-230,118,0),
  'Kelp shoal channel':look(84,-60,8.5,15,-18,0),
  'Mooring rings':look(-126,116,6.2,-158,118,1.0)
 };
})();

/* Interactive [Mean Tide] / [Low Water] / [Drawdown] / [Swell] controller (PLAN.md section 3.1) */
const DROWN_TIDE=(function(){
 function setMode(m){
  const st=DROWN_PHYS.tideState(m);
  Object.assign(DROWN_STATE,st);
  if(BIG_DRAW&&BIG_DRAW.mesh)BIG_DRAW.mesh.position.y=st.levelM;
  if(typeof WORKS!=='undefined'&&WORKS.buoyMesh){
   WORKS.buoyMesh.position.y=st.levelM;
  }
  scene.traverse(o=>{
   if(!o.isInstancedMesh||!o.userData.biome)return;
   const nm=o.name||'';
   if(/dl_mangrove_fol|dl_coppice_fol/.test(nm)){
    o.scale.y=st.mode==='Swell'?0.84:1.0;
   }else if(/dl_tidefan|dl_seagrass|dl_kelp_blade/.test(nm)){
    o.scale.y=st.mode==='Swell'?0.48:st.mode==='Drawdown'?0.35:1.0;
   }
  });
  return st;
 }
 return{
  get mode(){return DROWN_STATE.mode;},
  get state(){return DROWN_STATE;},
  setMode
 };
})();
DROWN.tide=DROWN_TIDE;

function describe(hit){
 const p=hit.point,o=hit.object;
 let best=null;
 for(const r of REG){
  if(r.r>600)continue;
  if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;
 }
 const lab=o.userData.inspectLabel||(o.parent&&o.parent.userData.inspectLabel)||o.name||'mesh';
 const isItem=o.isInstancedMesh&&o.userData.biome;
 const item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&DROWN.plantOfItem(item);
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const tg=PLT?PLT.tags:null;
 const eco=physSampleAt(p.x,p.z),tsu=tsunamiSampleAt(p.x,p.z);
 const chemTxt=eco.ultramafic
  ?'ultramafic = '+SITE.ultramaficByte+' · Ni latex '+eco.mangrove.latexNiPct.toFixed(1)+'%'+(eco.brucite.active?' · chimney pH '+eco.brucite.pH.toFixed(2):'')
  :'sedimentary coal = '+SITE.coalByte+' · collar ceiling +'+eco.snag.collarTopM.toFixed(2)+' m';
 return name+'\n'
  +(isItem?'biota · zone '+eco.zone:'terrain / water · zone '+eco.zone)
  +(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' ')+(PLT.gather?' · gather '+PLT.gather:''):'')
  +(tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')
  +'\n'+chemTxt+' · trimline +'+tsu.trimElevM.toFixed(1)+' m · Tier-3 shoal wave '+tsu.shoalWaveM.toFixed(1)+' m'
  +'\n'+p.x.toFixed(0)+', '+p.y.toFixed(1)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';
}

const BUDGET={
 showcase:{tris:9500000,calls:140},
 cls:{life:6000000,host:2500000},
 type:{'drownlands/life':'life','host':'host'}
};

const NEED={
 shoal:['verdigrismangrove','tealcoppice','brucitestack','limeshelf','seepcomb','spongecoral','tidefan','shoalkelp','ribbonseagrass','coconut','skerrycasuarina','skerrypandan','skerryhibiscus','skerrynaupaka','skerryphyllanthus','greymangrove','byssusmussel','skerryoyster','halimedaturf'],
 bar:['verdigrismangrove','tealcoppice','spongecoral','tidefan','shoalkelp','ribbonseagrass','stormwrack','coconut','skerrycasuarina','skerrypandan','skerrynaupaka','skerryphyllanthus','skerryoyster','halimedaturf'],
 drowned:['snaggrove','spongecoral','shoalkelp','ribbonseagrass','stormwrack','coconut','greymangrove','skerrypaperbark','skerryhibiscus','skerrypandan','byssusmussel','halimedaturf'],
 skerry:['araucaria','refugekauri','pycnandra','gymnostoma','verdigris','skerrysedge','skerrypitcher','verdigrismangrove','tealcoppice','skerryphyllanthus','skerrypaperbark','skerrycasuarina','skerrypandan','spongecoral','shoalkelp','ribbonseagrass','coconut','halimedaturf']
}[SKEY];

function collectNonShaderMeshes(){
 const list=[];
 scene.traverse(o=>{
  if(!o.isMesh||!o.visible)return;
  if(o.userData&&o.userData.water!=null)return;
  if(/^water:/.test(o.name||''))return;
  if(o===sky||o===giant||o===giantRing)return;
  const mats=Array.isArray(o.material)?o.material:[o.material];
  for(const m of mats){
   if(!m||m.isShaderMaterial||m.isRawShaderMaterial)continue;
   if(m.userData&&m.userData.impostor)continue;
   list.push({name:o.name||o.userData.inspectLabel||'mesh',mat:m});
  }
 });
 return list;
}

const HCHK={
 placed(st){
  const zero=NEED.filter(k=>!(st&&st[k]>0));
  return{ok:!zero.length,detail:zero.length?'missing: '+zero.join(', '):NEED.map(k=>k+' '+st[k]).join(', ')};
 },
 ultramaficAndTrimline(log,site,trimY){
  const niPlants=log.filter(e=>e.species==='verdigrismangrove'||e.species==='tealcoppice');
  const badNi=niPlants.filter(e=>e.ultramaficByte<128||e.latexNiPct<18.0||e.latexNiPct>24.5);
  const refuge=log.filter(e=>e.woodyRefuge);
  const badRefuge=refuge.filter(e=>e.y<trimY);
  const sedZeroOk=site.ultramaficByte<128?niPlants.length===0:niPlants.length>0;
  const refugeStationOk=site.key==='skerry'?refuge.length>0:refuge.length===0;
  const ok=!badNi.length&&!badRefuge.length&&sedZeroOk&&refugeStationOk;
  return{
   ok,
   detail:!ok
    ?('badNi='+badNi.length+', badRefuge='+badRefuge.length+', niPlants='+niPlants.length+', refuge='+refuge.length)
    :('niPlants='+niPlants.length+' (18-24.5% Ni), refugeCrown='+refuge.length+' (all >= +'+trimY.toFixed(1)+' m)')
  };
 },
 bruciteFidelity(log,site){
  const br=log.filter(e=>e.species==='brucitestack');
  const bad=br.filter(e=>e.ultramaficByte<128||e.pH<10.5||e.stackHeightM<0.6||e.stackHeightM>6.5);
  const want=site.key==='shoal'?br.length>0:site.ultramaficByte<128?br.length===0:true;
  return{
   ok:!bad.length&&want,
   detail:bad.length?bad.length+' brucite stacks outside pH/height window':'brucitestack='+br.length+' (all pH >= 10.5, 0.8-6.5 m)'
  };
 },
 brucitePoolSeparation(pools,openLevel){
  const bad=pools.filter(p=>(p.level-openLevel)<0.12||(p.rimH-p.level)<0.04);
  return{
   ok:pools.length>0&&!bad.length,
   detail:bad.length?bad.length+' pool(s) violate vertical z-separation':pools.length+' brucite pools >= +0.12 m above sea and >= 0.04 m below rim'
  };
 },
 snagCollarCeiling(log){
  const sn=log.filter(e=>e.species==='snaggrove');
  const bad=sn.filter(e=>e.collarTopM>1.801);
  return{
   ok:sn.length>0&&!bad.length,
   detail:bad.length?bad.length+' snag oyster collars exceed +1.80 m ceiling':sn.length+' drowned snags, all oyster collars <= +1.80 m'
  };
 },
 submarineKelp(log){
  const kp=log.filter(e=>e.species==='shoalkelp');
  const bad=kp.filter(e=>e.bedElevM>-0.5||e.bedElevM<-28.5);
  return{
   ok:kp.length>0&&!bad.length,
   detail:bad.length?bad.length+' shoalkelp placed above -0.5 m or below -28.5 m':kp.length+' submarine shoalkelp fronds all at bedElevM <= -0.5 m'
  };
 },
 coconutStrand(log){
  const co=log.filter(e=>e.species==='coconut');
  const bad=co.filter(e=>!(e.y>=2.2&&e.pH>=5.0&&e.pH<=8.8&&e.clearHighM>=1.4));
  return{
   ok:co.length>0&&!bad.length,
   detail:bad.length?bad.length+' coconut(s) in caustic brucite pool or tidal wash':co.length+' drift-sown coconuts on dry pH 5.0-8.8 leeward strand benches'
  };
 },
 noBuildingsAndEscape(recs,site){
  const blds=recs.filter(r=>r&&!r.removed&&r['class']==='building');
  const tsuShoal=DROWN_PHYS.tsunamiAt({px:145,py:520,elevM:6.1,depthM:84,trenchDistM:380,tier:3});
  const tsuBar=DROWN_PHYS.tsunamiAt({px:195,py:420,elevM:14.5,depthM:8,trenchDistM:2150,tier:3});
  const ok=!blds.length&&tsuShoal.arkEscapeOk===true&&tsuBar.prouTorreReq===true;
  return{
   ok,
   detail:blds.length?blds.length+' permanent building(s) found':'0 buildings, shoal arkEscapeOk=true, bar prouTorreReq=true'
  };
 },
 textured(list){
  const bad=list.filter(e=>!(e.mat&&e.mat.map));
  return{
   ok:list.length>0&&!bad.length,
   detail:bad.length?bad.length+' untextured mesh(es): '+bad.slice(0,5).map(b=>b.name).join(', '):list.length+' scene mesh materials, 0 untextured'
  };
 },
 gatherValid(samples){
  const bad=[];
  for(const g of samples){
   if(!g||typeof g!=='object'){bad.push('null');continue;}
   for(const k of Object.keys(g)){
    if(k!=='pasture'&&k!=='fish'&&k!=='salt')bad.push('unknown key '+k);
   }
   if(!(typeof g.pasture==='number'&&g.pasture>=0&&g.pasture<=1))bad.push('pasture out of 0..1');
   if(!(typeof g.fish==='number'&&g.fish>=0&&g.fish<=1))bad.push('fish out of 0..1');
   if(typeof g.salt!=='boolean')bad.push('salt not boolean');
  }
  return{ok:samples.length>0&&!bad.length,detail:bad.length?bad.join('; '):samples.length+' gather samples valid (pasture, fish, salt)'};
 },
 camerasOut(cams){
  const bad=cams.filter(c=>c.y<drawnOrTerrH(c.x,c.z)+0.8);
  return{ok:!bad.length,detail:bad.length?'under drawn ground: '+bad.map(c=>c.view).join(', '):cams.length+' preset cameras clear above drawn ground'};
 }
};

function hostChecks(){
 const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 const st=window._station||{};
 const tagRecs=BIO.tagReg()?BIO.tagReg().records:[];
 add('station-species-placed',HCHK.placed(st));
 add('ultramafic-and-trimline-fidelity',HCHK.ultramaficAndTrimline(DROWN.LOG,SITE,TRIM_ELEV));
 add('brucite-chimney-geochemistry',HCHK.bruciteFidelity(DROWN.LOG,SITE));
 if(SKEY==='shoal')add('brucite-pool-z-separation',HCHK.brucitePoolSeparation(BRUCITE_POOL_RECS,0.0));
 if(SKEY==='drowned')add('snag-oyster-collar-ceiling',HCHK.snagCollarCeiling(DROWN.LOG));
 add('submarine-kelp-bathymetry',HCHK.submarineKelp(DROWN.LOG));
 add('coconut-strand-and-ph-fidelity',HCHK.coconutStrand(DROWN.LOG));
 add('tsunami-escape-and-zero-buildings',HCHK.noBuildingsAndEscape(tagRecs,SITE));
 add('zero-untextured-meshes',HCHK.textured(collectNonShaderMeshes()));
 add('hamlet-gather-contract-valid',HCHK.gatherValid([DROWN.gather(0,0),DROWN.gather(-140,25),DROWN.gather(120,-80)]));
 add('preset-cameras-above-drawn-ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;
}

function hostNegatives(){
 const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 const lastNeed=NEED[NEED.length-1];
 add('missing-required-species',HCHK.placed(Object.assign({},window._station,{[lastNeed]:0})));
 add('araucaria-below-trimline',HCHK.ultramaficAndTrimline(DROWN.LOG.concat([{species:'araucaria',woodyRefuge:true,y:12.0,ultramaficByte:255}]),SITE,TRIM_ELEV));
 add('nickel-mangrove-on-sedimentary',HCHK.ultramaficAndTrimline([{species:'verdigrismangrove',woodyRefuge:false,y:2.0,ultramaficByte:0,latexNiPct:0}],{key:'drowned',ultramaficByte:0},47.0));
 add('brucite-stack-acidic-ph',HCHK.bruciteFidelity([{species:'brucitestack',ultramaficByte:255,pH:6.5,stackHeightM:2.0}],SITE));
 if(SKEY==='shoal')add('coplanar-brucite-pool',HCHK.brucitePoolSeparation([{key:'bad',level:0.02,rimH:0.4}],0.0));
 if(SKEY==='drowned')add('floating-snag-oyster-collar',HCHK.snagCollarCeiling([{species:'snaggrove',collarTopM:3.4}]));
 add('terrestrial-kelp-above-tide',HCHK.submarineKelp([{species:'shoalkelp',bedElevM:2.5}]));
 add('coconut-in-caustic-brucite-pool',HCHK.coconutStrand([{species:'coconut',y:0.4,pH:11.4,clearHighM:-0.3}]));
 add('permanent-building-in-drownlands',HCHK.noBuildingsAndEscape([{'class':'building',at:[0,5,0]}],SITE));
 add('untextured-mesh-detected',HCHK.textured([{name:'bare-mesh',mat:{map:null}}]));
 add('invalid-gather-key-detected',HCHK.gatherValid([{pasture:0.1,fish:0.8,salt:true,extra:1}]));
 add('camera-under-drawn-ground',HCHK.camerasOut([{view:'buried',x:0,y:drawnOrTerrH(0,0)-4,z:0}]));
 return R;
}

KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');

const HINT={
 shoal:'The Drownlands, Station 1 (px 145, 520; -84 to +16 m, 1.60 atm, Am, 1,710 mm/yr): Central Ultramafic Shoal. Waxy dark-green serpentinite skerries skirted by amphibious teal-sap prop-root mangroves (18-24% Ni latex), sunlit < 12 m seagrass and submarine buoy-kelp channels, chalk-white Lost-City brucite-aragonite hydrothermal chimneys (pH 11.4) steaming into perched milky pools, and an abrupt -84 m fault-graben trench mooring reserve for cFlit-qBon Ark-Wards.',
 bar:'The Drownlands, Station 2 (px 195, 420; -69 to +104 m, 1.60 atm, Am, jade = 200): Northern Seamount-Facing Margin, 82 km SSE of Steaming Seamounts. Heavy 1.60 atm rollers hammer a +25 m V-shaped megatsunami serpentinite-and-nephrite boulder-bar chevron sheltering an intertidal ochre-turquoise sponge-coral flat, leeward tealcoppice nickel phytomining plots, and the Prou-Torre inundation refuge reserve.',
 drowned:'The Drownlands, Station 3 (px 95, 545; -18 to +31 m, 1.60 atm, Am, sedimentary coal = 214): Subsiding Drowned-Valley Snag Lagoon. Zero ultramafic flora; hundreds of bleach-white salt-petrified cedar and cypress tsunami snags stand in calm emerald brackish water above black bituminous coal benches, sleeved strictly below +1.8 m in cemented visor-oysters beside boomed Crookshore driftwood rafts.',
 skerry:'The Drownlands, Station 4 (px 145, 495; -86 to +196 m, 1.59 atm, Am): High Ultramafic Horst Skerry and +48 m Megatsunami Trimline. Wave-scoured green serpentinite cliffs and amphibious teal-sap mangrove coves below +48 m give way sharply above +48 m to un-swept brick-red nickel-laterite cuirasse crowned by candelabra araucaria, seve-bleue, maquis she-oak, and verdigris caps.'
}[SKEY]||SITE.name;

const EXPORT_BOXES={
 shoal:[-165,-20,-25,120],
 bar:[-80,-40,60,100],
 drowned:[-85,-60,55,80],
 skerry:[-60,-70,80,70]
};

KHOST.take({
 build:'drownlands'+(SKEY==='shoal'?'':'-'+SKEY),
 title:'Krator biome — The Drownlands ('+SITE.name+')',
 hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,
 stats:()=>'inst '+window._instances+' · '+DROWN_TIDE.mode,
 layers:{
  'flora':{match:o=>!!(o.userData&&o.userData.biome)},
  'works':{match:o=>!!(o.userData&&o.userData.host&&!o.userData.farField)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-drown-phys',version:1,station:SKEY,trimlineM:TRIM_ELEV,site:SITE})
 },
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{
  hostChecks,hostNegatives,
  tide:m=>DROWN_TIDE.setMode(m),
  get totals(){const t=BIO.totals();return{tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._station,
  site:()=>SITE,
  phys:()=>DROWN_PHYS,
  exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','water'],
  exportBox:EXPORT_BOXES[SKEY]||[-220,-160,180,180],
  at:(x,z)=>{
   const o={h:terrainH(x,z),drawn:drawnOrTerrH(x,z),water:waterH(x,z),ecotone:physSampleAt(x,z),tsunami:tsunamiSampleAt(x,z)};
   FNAMES.forEach(n=>{o[n]=+FIELD[n](x,z).toFixed(3);});
   return o;
  }
 }
});
