// ================================================================= HOST — preset views, surge demo, inspector & invariant checks (KHOST.take)
// View and check names use alphanumeric + spaces/hyphens only (zero apostrophes or colons: survey item 30).
const drawnOrTerrH=(x,z)=>{
 const dh=(typeof KDRAWN!=='undefined'&&KDRAWN.h)?KDRAWN.h(x,z):null;
 const th=terrainH(x,z);
 return dh==null?th:Math.max(th,dh);
};
const gh=(x,z,dy)=>drawnOrTerrH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS=(function(){
 if(SKEY==='bitumen'){
  return{
   'Overview':look(-1750,1380,175,-80,-80,1),
   'Bitumen seep':look(-48,-248,7.5,-120,-180,0.2),
   'Amber scour bar':look(-215,48,6.8,-290,-20,0.2),
   'Blue clay cutbank':look(515,-160,9.0,420,-230,-0.5),
   'Tussock marsh':look(210,380,7.5,60,220,0.8),
   'Amber sluice':look(-218,-76,5.5,-248,-46,0.8)
  };
 }
 if(SKEY==='throat'){
  return{
   'Overview':look(-1850,1520,210,420,-120,25),
   'Delta throat vista':look(1060,-180,22,-650,60,2),
   'Tsunami trimline':look(-120,-420,28,560,-220,38),
   'Slipway bench':look(335,-195,11,460,-120,1.5),
   'Ria Sound reserve':look(1020,-310,24,1180,-160,2),
   'Throat silt plume':look(-1680,-480,38,-1250,140,0)
  };
 }
 return{
  'Overview':look(-1850,1450,185,-120,-60,2),
  'Chimney bioherm':look(-285,-265,9.5,-160,-140,2.5),
  'Seapen meadow':look(-1180,-320,6.5,-1040,-180,0.5),
  'Tethered peat mat':look(690,-760,8.5,520,-640,0.5),
  'Silt plume front':look(-1580,520,34,-1260,120,0),
  'Driftwood wrack':look(-980,-360,7.5,-940,-180,0.5)
 };
})();

/* Interactive [Calm] / [Drawdown] / [Surge] hydro-elastic reconfiguration state controller */
const DDELTA_SURGE=(function(){
 let mode='calm';
 function setMode(m){
  mode=m||'calm';
  const drop=mode==='drawdown'?-1.15:mode==='surge'?2.4:0;
  for(const fd of FLOW_DRAWS){if(fd.D&&fd.D.mesh)fd.D.mesh.position.y=drop*0.45;}
  if(BIG_DRAW&&BIG_DRAW.mesh)BIG_DRAW.mesh.position.y=drop*0.55;
  /* Scale elastic bioherm & sea-pen instanced meshes in surge mode to demonstrate DDELTA_PHYS.elasticity */
  scene.traverse(o=>{
   if(!o.isInstancedMesh||!o.userData.biome)return;
   const nm=o.name||'';
   if(/ddchimney|ddorgan|ddmound|ddbrain/.test(nm)){
    o.scale.y=mode==='surge'?0.62:mode==='drawdown'?0.94:1.0;
   }else if(/ddseapen|ddwhippen|ddhydroid|ddreed/.test(nm)){
    o.scale.y=mode==='surge'?0.28:1.0;
   }
  });
  return mode;
 }
 return{get mode(){return mode;},setMode};
})();
DOUBLEDELTA.surge=DDELTA_SURGE;

function describe(hit){
 const p=hit.point,o=hit.object;
 let best=null;
 for(const r of REG){
  if(r.r>1500)continue;
  if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;
 }
 const lab=o.userData.inspectLabel||(o.parent&&o.parent.userData.inspectLabel)||o.name||'mesh';
 const isItem=o.isInstancedMesh&&o.userData.biome;
 const item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&DOUBLEDELTA.plantOfItem(item);
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const tg=PLT?PLT.tags:null;
 const psu=PSU_AT(p.x,p.z),si=SILICA_AT(p.x,p.z),bore=BORE_AT(p.x,p.z),eco=ECOTONE_AT(p.x,p.z);
 const res=DOUBLEDELTA.resourcesAt(p.x,p.z);
 const resTxt=res.amber>0.35?' · ria-amber lag '+res.amber.toFixed(2):res.bitumen>0.25?' · bitumen seep '+res.bitumen.toFixed(2):'';
 return name+'\n'
  +(isItem?'biota ('+(tg&&tg.origin||'delta')+') · zone '+eco.zone:'terrain / water · zone '+eco.zone)
  +(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' ')+(PLT.gather?' · gather '+PLT.gather:''):'')
  +(tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')
  +'\nsalinity '+psu.toFixed(1)+' PSU · H4SiO4 '+si.toFixed(1)+' mg/L · Tier-2 Ghost Bore '+bore.depthM.toFixed(1)+' m @ '+bore.velMs.toFixed(1)+' m/s'+resTxt
  +'\n'+p.x.toFixed(0)+', '+p.y.toFixed(1)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';
}

const BUDGET={
 showcase:{tris:10000000,calls:140},
 cls:{life:6000000,host:2500000},
 type:{'doubledelta/life':'life','host':'host'}
};

const NEED={
 bioherm:['chimneysponge','brainsponge','glassbasket','seapen','whippen','snaphydroid','penshell','visoroyster','bellowsreed','bamboorice','tetherpad','driftwrack','driftwood'],
 bitumen:['tarfelt','riaamber','brimreed','fensedge','brainsponge','chimneysponge','bellowsreed','driftwood'],
 throat:['chimneysponge','brainsponge','seapen','visoroyster','bellowsreed','wildrice','bluffoak','bluffcedar','bluffcypress','bluffpine','bluffbamboo']
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
 trimline(log){
  const bad=log.filter(e=>e.woody&&e.y<MIN_WOODY_Y);
  const woodyN=log.filter(e=>e.woody).length;
  const bowlN=log.filter(e=>!e.woody&&e.y<25.0).length;
  return{
   ok:!bad.length&&(SKEY==='throat'?woodyN>0:woodyN===0)&&bowlN>0,
   detail:bad.length?bad.length+' woody trees below trimline '+MIN_WOODY_Y.toFixed(1)+' m (first '+bad[0].species+' at y='+bad[0].y.toFixed(1)+')'
    :'woody trees '+woodyN+' (all >= '+MIN_WOODY_Y.toFixed(1)+' m), delta bowl biota '+bowlN
  };
 },
 noBowlBuildings(recs){
  const blds=recs.filter(r=>r&&!r.removed&&r['class']==='building'&&r.at&&r.at[1]<45.0);
  return{
   ok:!blds.length,
   detail:blds.length?blds.length+' permanent building(s) below +45 m in tsunami zone':'0 permanent buildings in tsunami bowl ('+recs.length+' KTAGS records)'
  };
 },
 riaReserve(recs){
  const hit=recs.find(r=>r&&!r.removed&&(r.key==='site:ria-sound'||(r.tags&&r.tags.destination==='ria-sound')));
  const y=hit&&hit.at?hit.at[1]:-1;
  return{
   ok:!!hit&&y>=65.0&&y<=145.0,
   detail:hit?'site:ria-sound registered at y='+y.toFixed(1)+' m (+65..+140 m safe bluff)':'missing site:ria-sound reserve in KTAGS'
  };
 },
 noBasaltIslands(siteRec){
  const prov=siteRec&&siteRec.province;
  const um=siteRec&&siteRec.geology?siteRec.geology.ultramafic||0:0;
  return{
   ok:prov==='sedimentary'&&um===0,
   detail:'province='+prov+', ultramafic='+um+' (flat island-less sedimentary bowl)'
  };
 },
 spongeFidelity(log){
  const sp=log.filter(e=>e.species==='chimneysponge'||e.species==='glassbasket');
  const bad=sp.filter(e=>e.silicaMgL<14.0||e.psu<0.1||e.psu>29.0);
  return{
   ok:sp.length>0&&!bad.length,
   detail:bad.length?bad.length+' siliceous sponges outside silica/PSU envelope':sp.length+' siliceous sponges all at H4SiO4 >= 14 mg/L'
  };
 },
 amberFidelity(log){
  const am=log.filter(e=>e.species==='riaamber');
  const bad=am.filter(e=>!(e.amberLag01>0.35));
  return{
   ok:am.length>0&&!bad.length,
   detail:bad.length?bad.length+' ria-amber nodules outside scoured blue-clay lag':am.length+' ria-amber nodules all on scoured blue-clay lag > 0.35'
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
 },
 waterMouths(flows,opens,ground){
  const bad=[];
  for(const F of (flows||[])){
   if(F.kind!=='flow'||!F.pts||F.pts.length<2)continue;
   const keep=F.keepAt||(F.ribbonOpt&&F.ribbonOpt.keep)||null;
   let overRun=0;
   for(let i=0;i+1<F.pts.length;i++){
    const a=F.pts[i],b=F.pts[i+1],L0=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(L0/6));
    for(let k=0;k<n;k++){
     const u=k/n,x=a.x+(b.x-a.x)*u,z=a.z+(b.z-a.z)*u,ds=L0/n;
     if(keep&&keep(x,z)<0.25){overRun=0;continue;}
     const inOpen=(opens||[]).some(O=>O.kind==='open'&&O.contains(x,z)&&ground(x,z)<(O.levelAt?O.levelAt(0):0)-0.02);
     overRun=inOpen?(overRun+ds):0;
     if(overRun>24){bad.push(F.name+' runs '+overRun.toFixed(0)+' m over open water at ('+x.toFixed(0)+','+z.toFixed(0)+')');break;}
    }
    if(overRun>24)break;
   }
  }
  return{ok:!bad.length,detail:bad.length?bad.join('; '):(flows||[]).length+' flows terminate cleanly at shoreline'};
 }
};

function hostChecks(){
 const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 const st=window._station||{};
 const tagRecs=BIO.tagReg()?BIO.tagReg().records:[];
 add('station-species-placed',HCHK.placed(st));
 add('zero-woody-below-trimline',HCHK.trimline(DOUBLEDELTA.LOG));
 add('zero-buildings-in-bowl',HCHK.noBowlBuildings(tagRecs));
 if(SKEY==='throat')add('ria-sound-reserve-safe-elevation',HCHK.riaReserve(tagRecs));
 add('zero-interior-basalt-islands',HCHK.noBasaltIslands(SITE));
 add('sponge-silica-and-salinity-fidelity',HCHK.spongeFidelity(DOUBLEDELTA.LOG));
 if(SKEY==='bitumen')add('amber-nodules-strictly-in-scour',HCHK.amberFidelity(DOUBLEDELTA.LOG));
 add('water-flows-terminate-at-shoreline',HCHK.waterMouths(WATER.surfaces.filter(s=>s.kind==='flow'),WATER.surfaces.filter(s=>s.kind==='open'),terrainH));
 add('zero-untextured-meshes',HCHK.textured(collectNonShaderMeshes()));
 add('hamlet-gather-contract-valid',HCHK.gatherValid([DOUBLEDELTA.gather(0,0),DOUBLEDELTA.gather(-600,200),DOUBLEDELTA.gather(800,-150)]));
 add('preset-cameras-above-drawn-ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;
}

function hostNegatives(){
 const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 const lastNeed=NEED[NEED.length-1];
 add('missing-required-species',HCHK.placed(Object.assign({},window._station,{[lastNeed]:0})));
 add('woody-tree-in-tsunami-bowl',HCHK.trimline(DOUBLEDELTA.LOG.concat([{species:'bluffoak',woody:true,y:4.2}])));
 add('permanent-building-in-bowl',HCHK.noBowlBuildings([{'class':'building',at:[0,4.0,0]}]));
 if(SKEY==='throat')add('ria-reserve-placed-too-low',HCHK.riaReserve([{key:'site:ria-sound',at:[400,18.0,-100]}]));
 add('basalt-island-in-sedimentary-bowl',HCHK.noBasaltIslands({province:'ultramafic',geology:{ultramafic:255}}));
 add('sponge-in-silica-starved-water',HCHK.spongeFidelity([{species:'chimneysponge',silicaMgL:4.0,psu:12}]));
 if(SKEY==='bitumen')add('amber-nodule-on-unscoured-peat',HCHK.amberFidelity([{species:'riaamber',amberLag01:0.05}]));
 add('river-running-into-open-ocean',HCHK.waterMouths([{kind:'flow',name:'bad-river',pts:[{x:-1500,z:0},{x:-1800,z:0}]}],[{kind:'open',levelAt:()=>0,contains:()=>true}],()=>-3.0));
 add('untextured-mesh-detected',HCHK.textured([{name:'bare-mesh',mat:{map:null}}]));
 add('invalid-gather-key-detected',HCHK.gatherValid([{pasture:0.2,fish:0.5,salt:false,extra:1}]));
 add('camera-under-drawn-ground',HCHK.camerasOut([{view:'buried',x:0,y:drawnOrTerrH(0,0)-4,z:0}]));
 return R;
}

KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');

const HINT={
 bioherm:'The Great Double Delta, Station 1 (px 556, 160; 0 to +18 m, 1.60 atm, Am, 2,557 mm/yr): outer-mid Ghost-Tsunami sponge-bioherm and sea-pen delta flats. Flat, island-less 95.3% sedimentary bowl swept every 20-35 years by silent WNW Farside Shield bores: house-sized colonial siliceous chimney, organ-pipe and reef-mound sponges exhaling warm mist, flexible calcified sea-pen meadows, Sea-Byssus shell-lag bars, tethered floating bamboo-rice peat-mats, Riwa-Wata golden silt plume, and tsunami driftwood wrack lines. Zero permanent settlements in the bowl.',
 bitumen:'The Great Double Delta, Station 2 (px 572, 130; -3.5 to +9.5 m, 1.60 atm, Am, bitumen = 118, amber = 120): natural bitumen/asphalt tar-seeps ringed by iridescent tarfelt mats and trapped driftwood logs, beside incised tsunami backwash scour-channels cutting black coal = 228 lignite over slate-blue glauconitic clay studded with golden ria-amber lag nodules and tussock sedge marshes.',
 throat:'The Great Double Delta, Station 3 (Ria Sound, px 626, 140; 0 to +145 m, 1.58 atm, Am/Cfa): eastern delta throat exiting beneath the carbonate-shelf limestone and loess-capped Ria Sound bluff. Wave-washed +41.3 m lower stone slipway bench, crisp tsunami trimline with maritime oak, redcedar, cypress, stone-pine and bamboo bluff woods above +38 m, and the +65..+140 m permanent Ria Sound settlement reserve held safely above Ghost-Tsunami runup.'
}[SKEY]||SITE.name;

const EXPORT_BOXES={
 bioherm:[-260,-240,20,40],
 bitumen:[-320,-240,-60,20],
 throat:[-120,160,180,440]
};

KHOST.take({
 build:'doubledelta'+(SKEY==='bioherm'?'':'-'+SKEY),
 title:'Krator biome — Double Delta ('+SITE.name+')',
 hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,
 stats:()=>'inst '+window._instances+' · mode '+DDELTA_SURGE.mode,
 layers:{
  'flora':{match:o=>!!(o.userData&&o.userData.biome)},
  'works':{match:o=>!!(o.userData&&o.userData.host&&!o.userData.farField)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-ddelta-phys',version:1,station:SKEY,trimlineM:MIN_WOODY_Y,site:SITE})
 },
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{
  hostChecks,hostNegatives,
  surge:m=>DDELTA_SURGE.setMode(m),
  get totals(){const t=BIO.totals();return{tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._station,
  site:()=>SITE,
  phys:()=>DDELTA_PHYS,
  exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
  exportBox:EXPORT_BOXES[SKEY]||[-380,-360,120,140],
  at:(x,z)=>{
   const o={h:terrainH(x,z),drawn:drawnOrTerrH(x,z),water:waterH(x,z),psu:PSU_AT(x,z),silicaMgL:SILICA_AT(x,z),ecotone:ECOTONE_AT(x,z)};
   FNAMES.forEach(n=>{o[n]=+FIELD[n](x,z).toFixed(3);});
   return o;
  }
 }
});
