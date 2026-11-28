// ================================================================= HOST — preset views, controls, inspector & probe invariants ([draw])
// Strictly obeys VIEW-NAME (item 30): zero apostrophes and zero colons in any preset view name.
const gh=(x,z,dy)=>DRAWN_H(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS=SKEY==='shore'?{
 'Overview':look(-115,120,48,55,15,18),
 'Spray-bench sponges':look(-36,24,4.2,-18,16,0.8),
 'Tsunami trimline bluff':look(18,52,18,92,48,14),
 'Canopy cup-sponges':look(112,36,12,138,44,16),
 'Caldera lagoon collar':look(108,-115,36,210,-170,2),
 'Kopa-Kawa plume mouth':look(-88,-95,26,10,-48,2)
}:SKEY==='wash'?{
 'Overview':look(-185,95,62,-15,-25,12),
 'Stepped rimstone pools':look(-136,-62,6.5,-96,-88,0.4),
 'Porcelain-margin skarn ferns':look(-54,-22,3.6,-32,-48,0.8),
 'Burnished skarn-cedars':look(12,-28,8.5,38,-56,8),
 'Chambered bamboo brake':look(6,-68,9.5,38,-98,6),
 'Rain-shadow aspect split':look(-95,12,48,25,85,18)
}:{
 'Overview':look(-65,-115,54,35,35,6),
 'Hearth-ring snow wells':look(18,28,3.6,38,48,0.3),
 'Malachite cushion tundra':look(-58,8,3.2,-38,24,0.4),
 'Subalpine larch tarn':look(-32,96,16,-125,35,1),
 'Singing seed-chimneys':look(118,-48,4.2,145,-34,1.2),
 'Silent Vales Hush threshold':look(168,-44,5.2,228,-35,1.2)
};

function statusSummary(){
 if(SKEY==='shore'){
  const sp=CROOK_PHYS.sprayTrimAt({elevM:18,coastDistKm:0.2,wnwExposure01:0.9,silicaByte:150,drawdownM:CROOK_STATE.drawdownM});
  return 'Crookshore [1.60 atm] · trim +'+sp.trimElevM+' m · drawdown -'+CROOK_STATE.drawdownM.toFixed(0)+' m · sponge ostia '+(sp.ostiaOpen01*100|0)+'% open';
 }
 if(SKEY==='wash'){
  const wMs=Math.hypot(SITE.wind[0],SITE.wind[1])*(1+CROOK_STATE.updraftBoost);
  const ar=CROOK_PHYS.aeroResonanceAt({culmDiaM:0.095,chamberLenM:0.34,apertureDiaM:0.024,pAtm:SITE.atm,windSpeedMs:wMs,hushSuppression01:0});
  return 'Crookwash [1.20 atm] · '+RIM_POOLS.length+' rimstone steps · brake chord '+ar.f0Hz.toFixed(0)+'/'+ar.harmonicHz.toFixed(0)+' Hz ('+ar.splDb.toFixed(0)+' dB)';
 }
 const hx=camera.position.x,hz=camera.position.z;
 const hu=CROOK_PHYS.hushAt({x:hx,z:hz,passLineX:SITE.hushPass.lineX,passNormalXZ:SITE.hushPass.normalXZ,bandWidthM:SITE.hushPass.bandWidthM});
 const ar=CROOK_PHYS.aeroResonanceAt({culmDiaM:0.034,chamberLenM:0.29,apertureDiaM:0.012,pAtm:0.92,windSpeedMs:8.5,hushSuppression01:hu.suppression01});
 return 'Crookhead [1.07 atm] · Hush '+(hu.suppression01*100|0)+'% · chimney sigh '+(ar.audible01*100|0)+'% audible · wind sway '+(hu.visualWindScale*100|0)+'%';
}

const CONTROLS=(function(){
 const out=[];
 if(SKEY==='shore'){
  out.push({
   button:'Tsunami drawdown',id:'btn-drawdown',
   title:'Simulate -12 m pre-Ghost-Tsunami ocean shelf withdrawal: coastal lithistid sponges seal their ostia and the Hueru-Kuran step-well nephrite float drops',
   on(){CROOK_STATE.drawdownM=12;KHOST.inspector('Pre-bore Ghost Tsunami drawdown (-12 m) -> '+statusSummary());}
  });
  out.push({
   button:'Normal tide',id:'btn-tide',
   title:'Restore normal 0 m sea level and surf spray',
   on(){CROOK_STATE.drawdownM=0;KHOST.inspector('Restored normal sea level -> '+statusSummary());}
  });
 }else if(SKEY==='wash'){
  out.push({
   button:'Canyon updraft',id:'btn-updraft',
   title:'Boost 1.20 atm afternoon gorge updraft (+95% wind): intensifies chambered bamboo Helmholtz fifths and porcelain-margin skarn-fern clinks',
   on(){CROOK_STATE.updraftBoost=0.95;KHOST.inspector('Afternoon gorge updraft -> '+statusSummary());}
  });
  out.push({
   button:'Calm gorge',id:'btn-calm',
   title:'Return canyon wind to steady baseline',
   on(){CROOK_STATE.updraftBoost=0;KHOST.inspector('Baseline gorge breeze -> '+statusSummary());}
  });
 }else{
  out.push({
   button:'Step east into Hush',id:'btn-hush-east',
   title:'Cross east of the Silent Vales pass cairns (x > 195): seed-chimneys keep swaying visibly in ATMOS wind while aero-acoustic sound drops to 0',
   on(){
    CROOK_STATE.hushStepEast=true;
    const v=look(226,-42,4.2,262,-34,1.0);
    if(window._api&&window._api.setView)window._api.setView(v[0],v[1],v[2],v[3],v[4],v[5]);
    KHOST.inspector('Entered Silent Vales Great Hush -> '+statusSummary());
   }
  });
  out.push({
   button:'West of pass',id:'btn-hush-west',
   title:'Step back west onto the Crookhead approach where fluted seed-chimneys sigh in ridge gusts',
   on(){
    CROOK_STATE.hushStepEast=false;
    const v=VIEWS['Singing seed-chimneys'];
    if(window._api&&window._api.setView)window._api.setView(v[0],v[1],v[2],v[3],v[4],v[5]);
    KHOST.inspector('Returned to Crookhead windward side -> '+statusSummary());
   }
  });
 }
 out.push({
  button:'Sun shadows',id:'btn-shadow',
  title:'Attach or toggle KSHADOW sun cascade (off at load by default)',
  on(){const on=toggleCrookShadow();KHOST.inspector('Sun shadows '+(on?'ON':'OFF'));}
 });
 return out;
})();

function describe(hit){
 const p=hit.point,o=hit.object;
 let best=null;
 for(const r of REG){if(r.r>400)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const instLbl=(o.isInstancedMesh&&typeof BIO.instLabel==='function')?BIO.instLabel(o,hit.instanceId):null;
 const lab=instLbl||o.userData.inspectLabel||o.name||'mesh';
 const isItem=o.isInstancedMesh&&o.userData.biome;
 const rawItem=isItem?(o.name||'').replace(/^biome:(?:[a-z0-9_-]+\|)?/,''):null;
 const SP=rawItem?CROOK.speciesOfItem(rawItem):null;
 const head=SP?(SP.name+'  ·  '+lab):(best?best.name+'  ·  '+lab:lab);

 const nrm=DRAWN_N(p.x,p.z,1.0);
 const sl=Math.hypot(nrm[0],nrm[2])/Math.max(0.1,nrm[1]);
 const P=physAt(p.x,p.z,p.y,nrm[0],nrm[2],sl);
 const asl=SITE.baseElevM+p.y;
 const lines=[head];
 if(SP){
  lines.push('Zone: '+SP.tags.zone+' · Climate: '+SP.tags.climate+'/'+SP.tags.aridity+' · Koppen: '+SP.tags.koppen.join(','));
  if(SP.tags.harvest&&SP.tags.harvest.notes)lines.push('Use: '+SP.tags.harvest.notes);
 }
 lines.push('Elev '+asl.toFixed(1)+' m ASL · P '+P.ac.pAtm.toFixed(2)+' atm · T '+P.ac.effTempC.toFixed(1)+' degC · zone '+P.ac.zoneBand);
 if(SKEY==='shore'){
  lines.push('Trimline +'+P.sp.trimElevM.toFixed(1)+' m · spray '+(P.sp.sprayMist01*100|0)+'% · fog-belt '+(P.sp.fogBelt01*100|0)+'% · woodyOk '+P.sp.woodyOk);
 }else if(SKEY==='wash'){
  lines.push('Skarn silica-glaze '+(P.bm.silicaGlaze01*100|0)+'% · rust-scale '+(P.bm.rustScale01*100|0)+'% · sunny '+(P.ac.sunny01*100|0)+'%');
 }else{
  const mw=nearestMeltWell(p.x,p.z);
  if(mw.well&&mw.d<3.0)lines.push('Thermogenic melt-well: core +'+mw.well.coreTempC+' degC · well diam '+mw.well.diamM+' m');
  lines.push('Malachite rind '+(P.bm.malachiteRind01*100|0)+'% · Great Hush '+(P.hush.suppression01*100|0)+'% (visual wind '+(P.hush.visualWindScale*100|0)+'%)');
 }
 lines.push(p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m');
 return lines.join('\n');
}

const BUDGET={
 showcase:{tris:8500000,calls:120},
 cls:{life:4500000,host:2500000},
 type:{'biome':'life','host':'host'}
};

// Collect all biome, ground, farfield, and host-works meshes to verify 100% real texture binding (0 untextured meshes)
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
 // Check every material in CROOK.M + MAT_GROUND + every biome/ground/far/works mesh in scene (excluding core/water & core/atmos FX shaders)
 Object.keys(CROOK.M).forEach(k=>checkMat(CROOK.M[k],'CROOK.M.'+k));
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
  const req=skey==='shore'
   ?['coastspruce','westernredcedar','redcypress','bigleafmaple','gorgealder','cloudtreefern','coconut','calderapalm','salmonberry','swamplantern','calderaseagrass','gorgeswordfern','gorgerhodo','devilsclub','basaltchimney','spraycushion','canopycup','spongebeard']
   :skey==='wash'
   ?['redcypress','silverfir','westernredcedar','canyonyew','gorgealder','gorgerhodo','salmonberry','gorgeswordfern','ironsaxifrage','rustcedar','skarnfern','jadeequisetum','rimstonemoss','chamberbamboo','morainesedge']
   :['furlarch','malachitecushion','frostsedge','tarncottongrass','cobaltgentian','hearthring','cryosnow','seedchimney','morainesedge'];
  const miss=req.filter(k=>!(st&&st[k]>0));
  return{
   ok:!miss.length,
   detail:miss.length?'missing on '+skey+': '+miss.join(', '):req.map(k=>k+' '+st[k]).join(', ')
  };
 },
 trimlinePartition(placed,skey){
  if(skey!=='shore'){
   const coldPalms=(placed||[]).filter(r=>r[0]==='coconut'||r[0]==='calderapalm');
   return{ok:!coldPalms.length,detail:coldPalms.length?coldPalms.length+' coastal palms on cold montane/alpine '+skey:'inland station ('+skey+'), 0 cold-intolerant palms'};
  }
  const woody={coastspruce:1,westernredcedar:1,redcypress:1,bigleafmaple:1,gorgealder:1,cloudtreefern:1,coconut:1,calderapalm:1,salmonberry:1,gorgerhodo:1,devilsclub:1};
  const lowTrees=(placed||[]).filter(r=>woody[r[0]]&&r[4]<65.0);
  const highPalms=(placed||[]).filter(r=>r[0]==='coconut'&&r[4]>120.0);
  const palms=(placed||[]).filter(r=>r[0]==='coconut');
  const highBasalt=(placed||[]).filter(r=>(r[0]==='basaltchimney'||r[0]==='spraycushion')&&r[4]>=65.0);
  const sponges=(placed||[]).filter(r=>r[0]==='basaltchimney'||r[0]==='spraycushion');
  const ok=!lowTrees.length&&!highPalms.length&&palms.length>=5&&!highBasalt.length&&sponges.length>=25;
  return{
   ok:ok,
   detail:ok?sponges.length+' < +65 m lithistid sponges, '+palms.length+' +65..+116 m coastal coconuts, 0 woody trees below +65 m':'violations: lowTrees='+lowTrees.length+', highPalms='+highPalms.length+', palms='+palms.length+', highBasalt='+highBasalt.length+', sponges='+sponges.length
  };
 },
 allTextured(extraList){
  const bad=collectUntexturedLitMeshes(extraList);
  return{
   ok:!bad.length,
   detail:bad.length?bad.length+' untextured meshes: '+bad.slice(0,5).join(', '):'0 untextured lit meshes across ground, rocks, barks, foliage, sponges & works'
  };
 },
 rimstoneMonotone(pools,skey){
  if(skey!=='wash')return{ok:true,detail:'station '+skey+' (rimstone showcase on wash)'};
  if(!pools||pools.length<8)return{ok:false,detail:'too few rimstone pools'};
  let prev=1e9,bad=null;
  for(let i=0;i<pools.length;i++){
   const p=pools[i];
   if(p.level>=prev-0.20){bad='step '+i+' ('+p.level+' vs '+prev+')';break;}
   if(p.crest-p.level<0.04){bad='step '+i+' lip too low';break;}
   prev=p.level;
  }
  return{ok:!bad,detail:bad?'non-monotone/coplanar rimstone: '+bad:pools.length+' monotone iron-jade rimstone pools (>= 0.20 m step separation)'};
 },
 hearthAndHush(placed,skey){
  if(skey!=='head')return{ok:true,detail:'station '+skey+' (hearth-rings & Great Hush on head)'};
  const wells=(placed||[]).filter(r=>r[0]==='hearthring'&&r[6]&&r[6].coreTempC>=14.0&&r[6].wellDiamM>=1.0&&r[6].wellDiamM<=2.3);
  const westCh=(placed||[]).filter(r=>r[0]==='seedchimney'&&r[6]&&r[6].audible>0.5);
  const eastCh=(placed||[]).filter(r=>r[0]==='seedchimney'&&r[6]&&r[6].hush>=0.99&&r[6].audible===0);
  const hushTest=CROOK_PHYS.hushAt({x:260,z:-35,passLineX:195,passNormalXZ:[1,0],bandWidthM:120});
  const ok=wells.length>=30&&westCh.length>=5&&eastCh.length>=5&&hushTest.visualWindScale===1.0;
  return{
   ok:ok,
   detail:ok?wells.length+' +15 degC hearth-ring snow wells, '+westCh.length+' singing west chimneys & '+eastCh.length+' silent swaying Hush chimneys':'wells='+wells.length+', westCh='+westCh.length+', eastCh='+eastCh.length
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
 }
};

function hostChecks(){
 const R=[],add=(name,r)=>R.push(Object.assign({name:name},r));
 const qShadow=new URLSearchParams(location.search).get('shadow')==='1';
 add('signature and matrix species placed on station',HCHK.stationSpecies(window._station,SKEY));
 add('tsunami +65 m trimline partitions sponges and woody trees',HCHK.trimlinePartition(CROOK.PLACED,SKEY));
 add('100 percent of lit scene meshes carry real textures',HCHK.allTextured(null));
 add('rimstone pools step monotonically without coplanar overlap',HCHK.rimstoneMonotone(RIM_POOLS,SKEY));
 add('thermogenic +15 degC snow wells and Great Hush pass cutoff',HCHK.hearthAndHush(CROOK.PLACED,SKEY));
 add('KSHADOW off at default page load',HCHK.shadowOffDefault(qShadow,!!renderer.shadowMap.enabled));
 add('ground shader stays within WebGL sampler budget',HCHK.samplersBudget(window._units));
 add('preset cameras clear of drawn ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('sky model and exposure finite and lit',HCHK.skyLit({exp:renderer.toneMappingExposure,sunAlt:SKY.state&&SKY.state.sunAlt,sunI:sun.intensity}));
 return R;
}

function hostNegatives(){
 const R=[],add=(name,r)=>R.push({name:name,failed:!r.ok,detail:r.detail});
 add('missing signature species fails station check',HCHK.stationSpecies({},SKEY));
 add('woody Sitka spruce placed at +18 m below tsunami trimline fails',HCHK.trimlinePartition([['coastspruce',-20,18,10,18,'spraybench',null]],'shore'));
 add('untextured lit MeshStandardMaterial is caught',HCHK.allTextured([new THREE.MeshStandardMaterial({color:0x888888})]));
 add('uphill or coplanar rimstone pool step is caught',HCHK.rimstoneMonotone([{level:20,crest:20.1},{level:20.05,crest:20.15},1,2,3,4,5,6],'wash'));
 add('seed-chimneys leaking sound inside Great Hush fail',HCHK.hearthAndHush([['seedchimney',240,60,-35,3200,'fellpass',{hush:1.0,audible:0.5}]],'head'));
 add('shadowMap enabled at default load fails',HCHK.shadowOffDefault(false,true));
 add('ground over 14-sampler cap fails',HCHK.samplersBudget({final:16,max:16}));
 add('preset camera buried under drawn ground fails',HCHK.camerasOut([{view:'buried',x:0,y:DRAWN_H(0,0)-5,z:0}]));
 add('NaN sky exposure fails',HCHK.skyLit({exp:NaN,sunAlt:NaN,sunI:0}));
 return R;
}

KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');

const HINT=SKEY==='shore'
 ?'Crookshore (0..+950 m, 1.60 atm): wave-planed columnar basalt benches below the +65 m megatsunami trimline encrusted with ochre, slate-blue, and rust-orange lithistid chimney- and cushion-sponges, stepping sharply above +65 m into Sitka spruce, redcedar, benihi red-cypress, bigleaf maple, and tree-fern cloud-forest hung with celadon and amber canopy sponges.'
 :SKEY==='wash'
 ?'Crookwash (+950..+2,800 m, 1.20 atm): deeply incised V-gorge red-cypress, silver fir, and rhododendron forest with metallic-bark skarn-cedars and porcelain-margin jade-ferns over nephrite seeps, 16 monotone-stepped terracotta/ochre/celadon rimstone pools, and wind-tuned chambered bamboo brakes.'
 :'Crookhead (+1,800..+6,000 m, 1.07 atm): subalpine krummholz larch and moraine tarn country with malachite-teal & rust-ochre mineral-rind cushion-heaths, spun frost-glass silica sedges, 48 thermogenic +15 degC hearth-ring rosettes melting 1-2 m circular snow wells ringed by cryo-snow algae, and bone-white wind-fluted seed-chimneys crossing into Silent Vales.';

const EXPORT_BOX_BY_STATION=SKEY==='shore'?[-90,-85,125,85]:SKEY==='wash'?[-120,-105,55,45]:[-155,-20,65,95];

KHOST.take({
 build:'crook'+(SKEY==='shore'?'':'-'+SKEY),
 title:'Krator biome — The Crook: '+SITE.name,
 hint:HINT,
 scene:scene,camera:camera,renderer:renderer,ground:DRAWN_H,clear:1.8,registry:REG,regHas:regHas,views:VIEWS,ticks:TICKS,
 controls:CONTROLS,
 clock:{hour:ATMOS.SKY.viewHour},
 draw:SKY.draw,
 inspect:describe,
 stats:()=>'inst '+window._instances+'\n'+statusSummary(),
 layers:{
  'crook flora & sponges':{match:o=>!!(o.userData&&o.userData.biome)},
  'cairns & horizon':{match:o=>!!(o.userData&&o.userData.host)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-crook',version:1,site:SITE,state:CROOK_STATE,placed:CROOK.PLACED.length})
 },
 minimap:{title:SITE.name},
 budget:BUDGET,
 types:()=>BIO.stats,
 api:{
  hostChecks:hostChecks,hostNegatives:hostNegatives,
  get totals(){const t=BIO.totals();return{tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._station,
  site:()=>SITE,
  placed:()=>CROOK.PLACED,
  state:()=>CROOK_STATE,
  exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','water'],
  exportBox:EXPORT_BOX_BY_STATION,
  at:(x,z)=>{
   const y=DRAWN_H(x,z),o={h:y,asl:SITE.baseElevM+y,water:waterH(x,z)};
   FNAMES.forEach(n=>{o[n]=+FIELD[n](x,z).toFixed(3);});
   return o;
  }
 }
});
