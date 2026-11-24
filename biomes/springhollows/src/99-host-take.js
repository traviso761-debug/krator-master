// ================================================================= HOST — preset views, controls, inspector & probe invariants ([draw])
// Strictly obeys VIEW-NAME (survey item 30): zero apostrophes, zero colons, and zero slashes in any preset view name.
// Every preset camera eye sits >= 3.2 m clear above KDRAWN surface/cavern floors and inside CAM_CLEAR crown-free circles.
const gh=(x,z,dy)=>DRAWN_H(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS=SKEY==='spring'?{
 'Overview':look(120,-135,38,-28,0,6),
 'Sapphire spring boil':look(-16,-36,7.5,-76,0,1.5),
 'Cypress spring run':look(82,34,6.5,148,12,2.5),
 'Cave arch tufa':look(-54,-24,8.2,-94,0,10.5),
 'Dusk bryophyte glow':look(-48,24,7.8,-92,0,11.0),
 'Porphyry riffle':look(165,-38,9.5,196,12,1.2)
}:SKEY==='shutin'?{
 'Overview':look(134,-34,34,-6,0,2),
 'Porphyry shut-in chute':look(-24,-28,9.5,16,0,-1.5),
 'Dike dolomite contact':look(-56,46,12.0,-4,8,4.0),
 'Porphyry bald glade':look(28,68,6.5,4,98,3.5),
 'Boat-lift terrace site':look(8,-72,10.5,8,-108,2.0),
 'Upper calm pool':look(-138,-32,8.5,-215,4,0.5)
}:SKEY==='fenestre'?{
 'Overview':look(-48,-54,30,6,4,-8),
 'Fenestre sunbeam':[0,DRAWN_H(0,0)+7.6,0,22,-22.0,18],
 'Red porphyry cathedral':[-2.4,DRAWN_H(-2.4,-2.4)+6.8,-2.4,26,-15.5,20],
 'Celestine megabeams':[0,DRAWN_H(0,0)+5.8,0,18,-18.5,16],
 'Calcite druse sump':look(22,22,16.5,38,24,-24.5),
 'Galena vein wall':look(44,-18,15.5,36,16,-20.0)
}:SKEY==='glade'?{
 'Overview':look(-125,-128,38,16,12,4),
 'Chert bridge portal':look(-14,-52,9.5,-38,-36,-2.5),
 'Banded onyx columns':look(-16,-24,15.5,-38,-8,-8.0),
 'Ancient bleach belt':look(-148,112,11.0,-112,92,0.5),
 'Strangler front':look(-98,74,6.5,-124,96,1.2),
 'Hydro-arcology site':look(118,-98,14.0,156,-138,2.0)
}:{};

function statusSummary(){
 const pAtm=HOLLOW_PHYS.pressureAtElev(SITE.baseElevM);
 const glow=HOLLOW_PHYS.caveMouthGlowAt({skyOpenness01:0.19,springHumidity01:0.88,isNight:SH_STATE.mode==='dusk'});
 return SITE.id+' ['+pAtm.toFixed(2)+' atm · +'+SITE.baseElevM.toFixed(0)+' m] · '+(SH_STATE.mode==='dusk'?'Dusk 495 nm glow '+glow.biolumRadiance01.toFixed(2):'Daylight tufa accretion '+glow.tufaAccretionMmYr.toFixed(1)+' mm/yr');
}

const CONTROLS=(function(){
 const out=[
  {
   button:'Day',id:'btn-day',
   title:'Set sunlit 1.33-1.41 atm Cfa karst daylight: crystal-sapphire boils, fenestre sunbeams & tufa precipitation',
   on(){
    SH_STATE.mode='day';
    SH_STATE.glow01=0.0;
    if(SKY&&SKY.view)SKY.view();
    KHOST.inspector('Daylight karst & porphyry illumination -> '+statusSummary());
   }
  },
  {
   button:'Dusk Cave-Glow',id:'btn-dusk',
   title:'Set crepuscular hollow dusk: activates 495 nm cyan-jade tufabryum cave-mouth curtains & fenestregnat swarms',
   on(){
    SH_STATE.mode='dusk';
    SH_STATE.glow01=1.0;
    if(SKY&&SKY.view)SKY.view();
    KHOST.inspector('Dusk 495 nm cyan-jade tufabryum cave-glow -> '+statusSummary());
   }
  }
 ];
 if(CAVERN&&typeof KCAVERN!=='undefined'&&KCAVERN.cut){
  out.push({
   button:'Cavern Cutaway',id:'btn-cavern-cut',
   title:'Toggle KCAVERN.cutLayer cutaway to inspect walk-in celestine megabeams, calcite druse & onyx columns from above',
   on(){
    const on=!KCAVERN.cut.on;
    KCAVERN.cut.set(on);
    SH_STATE.cavernCut=on;
    KHOST.inspector('Cavern cutaway '+(on?'OPEN':'CLOSED'));
   }
  });
 }
 out.push({
  button:'Sun shadows',id:'btn-shadow',
  title:'Attach or toggle KSHADOW sun cascade (strictly off at page load by default)',
  on(){const on=toggleHollowShadow();KHOST.inspector('Sun shadows '+(on?'ON':'OFF'));}
 });
 return out;
})();

KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');

// Sync dusk/cutaway states automatically on specialized preset views (keep vault solid on Red porphyry cathedral!)
KHOST.on(function viewStateSync(){
 if(SKEY==='spring'){
  const dDusk=Math.hypot(camera.position.x+48,camera.position.z-24);
  if(dDusk<4.0&&SH_STATE.mode!=='dusk'){SH_STATE.mode='dusk';SH_STATE.glow01=1.0;if(SKY&&SKY.view)SKY.view();}
 }
 if(CAVERN&&typeof KCAVERN!=='undefined'&&KCAVERN.cut){
  if(SKEY==='fenestre'){
   const aboveHall=(Math.hypot(camera.position.x-22,camera.position.z-22)<5.0||Math.hypot(camera.position.x-44,camera.position.z+18)<5.0);
   if(aboveHall!==KCAVERN.cut.on){KCAVERN.cut.set(aboveHall);SH_STATE.cavernCut=aboveHall;}
  }else if(SKEY==='glade'){
   const onyxCut=Math.hypot(camera.position.x+16,camera.position.z+24)<5.0;
   if(onyxCut!==KCAVERN.cut.on){KCAVERN.cut.set(onyxCut);SH_STATE.cavernCut=onyxCut;}
  }
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
 const SP=rawItem?SPRINGHOLLOWS.speciesOfItem(rawItem):null;
 const head=SP?(SP.name+'  ·  '+lab):(best?best.name+'  ·  '+lab:lab);

 const dk=HOLLOW_PHYS.porphyryDikeAt(p.x,p.z,SITE);
 const scar=HOLLOW_PHYS.ecocideScarAt(p.x,p.z,SITE);
 const asl=SITE.baseElevM+p.y;
 const pAtm=HOLLOW_PHYS.pressureAtElev(asl);
 const lines=[head];
 if(SP){
  lines.push('Zone: '+SP.tags.zone+' · Climate: '+SP.tags.climate+'/'+SP.tags.aridity+' · Koppen: '+SP.tags.koppen.join(','));
  if(SP.tags.harvest&&SP.tags.harvest.notes)lines.push('Use: '+SP.tags.harvest.notes);
 }
 lines.push('Elev '+asl.toFixed(1)+' m ASL · P '+pAtm.toFixed(3)+' atm · Strata: '+dk.strataKind+' (hardness '+dk.rockHardness01.toFixed(2)+')');
 if(scar.hardpan01>0.1){
  lines.push('Ancient bleach-belt hardpan '+scar.hardpan01.toFixed(2)+' · Strangler-front '+scar.stranglerFront01.toFixed(2));
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
 Object.keys(SPRINGHOLLOWS.M).forEach(k=>checkMat(SPRINGHOLLOWS.M[k],'SPRINGHOLLOWS.M.'+k));
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
 shutInHydraulics(qM3s){
  const open=HOLLOW_PHYS.shutInFlowAt({qM3s:qM3s,inDike:false,signedDistM:85.0,baseSlope:0.0014});
  const chute=HOLLOW_PHYS.shutInFlowAt({qM3s:qM3s,inDike:true,signedDistM:-32.0,baseSlope:0.0014});
  const ok=open.channelWidthM>=65.0&&open.froude<0.35&&!open.liftBypassReq&&chute.channelWidthM<=24.0&&chute.froude>1.15&&chute.whitewater01>0.85&&chute.liftBypassReq;
  return{
   ok:ok,
   detail:'open W='+open.channelWidthM+' m (Fr '+open.froude+') -> porphyry chute W='+chute.channelWidthM+' m (Fr '+chute.froude+', liftBypass='+chute.liftBypassReq+')'
  };
 },
 mvtAndCavern(skey,cav,depthM){
  const mvt=HOLLOW_PHYS.mvtCrystalAt({dikeDistM:8.0,spiderSeepShare01:0.56,depthBelowTableM:depthM,gKrator:7.4});
  const cavOk=(skey==='shutin')?(cav===null):(!!cav&&cav.crystals>=6&&(skey!=='fenestre'||cav.maxBeamLenM>=10.0));
  return{
   ok:mvt.speleoPreset==='CALCITE'&&mvt.maxBeamLenM>=14.0&&cavOk,
   detail:'0.75 g maxBeam='+mvt.maxBeamLenM+' m, station cavern='+(cav?cav.crystals+' speleothems (maxBeam '+cav.maxBeamLenM+' m)':'none on shutin')
  };
 },
 tufabryumConfinement(placed,overrideSkyOpen){
  if(overrideSkyOpen!=null){
   const g=HOLLOW_PHYS.caveMouthGlowAt({skyOpenness01:overrideSkyOpen,springHumidity01:0.90,isNight:true});
   return{ok:g.bryoCover01>0.05,detail:'skyOpen='+overrideSkyOpen+' -> bryoCover='+g.bryoCover01};
  }
  const tufas=(placed||[]).filter(r=>r[0]==='tufabryum'&&(!r[6]||!r[6].darkFungus));
  const bad=tufas.filter(r=>!r[6]||r[6].skyOpenness01<0.04||r[6].skyOpenness01>0.42);
  const needTufa=SKEY!=='shutin';
  const ok=(!needTufa||tufas.length>=12)&&bad.length===0;
  return{
   ok:ok,
   detail:tufas.length+' twilight tufabryum curtains (outside 0.04..0.42 window: '+bad.length+')'
  };
 },
 lithologyAndReserves(placed,waterOut,extraBuilding){
  const pines=(placed||[]).filter(r=>r[0]==='porphyrypine');
  const badPine=pines.filter(r=>!r[6]||r[6].inDike!==true);
  const oaks=(placed||[]).filter(r=>r[0]==='chinkapinoak');
  const badOak=oaks.filter(r=>r[6]&&r[6].inBleachBelt===true);
  const tagRecs=(typeof KTAGS!=='undefined'&&KTAGS.page&&KTAGS.page.records)?KTAGS.page.records:[];
  const blds=extraBuilding?1:tagRecs.filter(r=>r&&r.class==='building').length;
  const stepOk=(waterOut.poolStepMinM==null?0.10:waterOut.poolStepMinM)>=0.06;
  const ok=pines.length>0&&badPine.length===0&&oaks.length>0&&badOak.length===0&&blds===0&&stepOk;
  return{
   ok:ok,
   detail:'porphyrypine='+pines.length+' (off-dike '+badPine.length+'), oak='+oaks.length+' (in-bleach '+badOak.length+'), buildings='+blds+', poolStep='+waterOut.poolStepMinM+' m'
  };
 },
 vstackGraphics(vs,forceShadowOn){
  const shOff=forceShadowOn?false:!renderer.shadowMap.enabled;
  const untex=collectUntexturedLitMeshes();
  const ok=!!vs&&vs.indexedItems===true&&vs.lodMerge===true&&vs.roughAAMats>=4&&vs.chromaticGroundVerts>1000&&vs.drawnSources>=1&&shOff&&untex.length===0;
  return{
   ok:ok,
   detail:vs?('indexed='+vs.indexedItems+', lodMerge='+vs.lodMerge+', dilatedCards='+vs.dilatedCards+', roughAA='+vs.roughAAMats+', crownAO='+vs.crownAOInstances+', drawnSrc='+vs.drawnSources+', shadowOff='+shOff+', untex='+untex.length):'missing SH_VSTACK'
  };
 }
};

function hostChecks(){
 const vs=typeof SH_VSTACK!=='undefined'?SH_VSTACK.stats:null;
 const cropsN=SPRINGHOLLOWS_CROPS.queryAll({works:['dark-beds'],nodes:['iron','copper']}).length;
 return[
  {name:'shutin-hydraulic-pinch',ok:HCHK.shutInHydraulics(195.0).ok,detail:HCHK.shutInHydraulics(195.0).detail},
  {name:'mvt-crystal-and-cavern',ok:HCHK.mvtAndCavern(SKEY,CAVERN,52.0).ok,detail:HCHK.mvtAndCavern(SKEY,CAVERN,52.0).detail},
  {name:'tufabryum-twilight-confinement',ok:HCHK.tufabryumConfinement(SPRINGHOLLOWS.PLACED,null).ok,detail:HCHK.tufabryumConfinement(SPRINGHOLLOWS.PLACED,null).detail},
  {name:'lithology-hygiene-and-reserves',ok:HCHK.lithologyAndReserves(SPRINGHOLLOWS.PLACED,window._water||{},false).ok,detail:HCHK.lithologyAndReserves(SPRINGHOLLOWS.PLACED,window._water||{},false).detail},
  {name:'crops-and-fauna-contracts',ok:cropsN>=71&&SPRINGHOLLOWS_FAUNA.SPECIES.length===6&&HAZARDS.length>=1,detail:'crops='+cropsN+', fauna='+SPRINGHOLLOWS_FAUNA.SPECIES.length+', hazards='+HAZARDS.length},
  {name:'vstack-graphics',ok:HCHK.vstackGraphics(vs,PQ.get('shadow')==='1'?false:renderer.shadowMap.enabled).ok,detail:HCHK.vstackGraphics(vs,PQ.get('shadow')==='1'?false:renderer.shadowMap.enabled).detail}
 ];
}

function hostNegatives(){
 const vs=typeof SH_VSTACK!=='undefined'?SH_VSTACK.stats:null;
 return[
  {name:'surface-terrain-rejects-mvt-megabeams',failed:!HCHK.mvtAndCavern(SKEY,CAVERN,0.5).ok,detail:HCHK.mvtAndCavern(SKEY,CAVERN,0.5).detail},
  {name:'sunlit-hillside-rejects-tufabryum',failed:!HCHK.tufabryumConfinement(SPRINGHOLLOWS.PLACED,0.85).ok,detail:'open sky 0.85 must have 0 tufabryum cover'},
  {name:'building-inside-reserve-rejected',failed:!HCHK.lithologyAndReserves(SPRINGHOLLOWS.PLACED,window._water||{},true).ok,detail:'class===building inside reserve fails'},
  {name:'default-shadow-on-rejected',failed:!HCHK.vstackGraphics(vs,true).ok,detail:'shadowMap enabled at default load fails'}
 ];
}

const HINT=SKEY==='spring'
 ?'Cav Ozarks Resurgence (1144, 168, +996 m, 1.41 atm): 26 m3/s sapphire artesian mammoth-spring boiling out of a 24 m cherty-dolomite cave arch draped in twilight 495 nm cyan-jade tufabryum curtains, bald-cypress knees, and High-Ria cut-dolomite spring-gauge stelae.'
 :SKEY==='shutin'
 ?'Tlila-Wada Red-Porphyry Shut-In Gorge (1224, 158, +1,480 m, 1.33 atm): flat cream carbonate-shelf dolostone sliced by a strike-aligned purple-red rhyolite porphyry dike, pinching the river into a foaming 16 m whitewater chute beside the reserved Eastern Dynasty counterweight boat-lift bench.'
 :SKEY==='fenestre'
 ?'Sinkhole Fern-Fenestre & Cathedral of the Red Porphyry Vein (1212, 174, +1,257 m, 1.37 atm): collapsed 18 m daylight skylight dropping via a walk-in breccia ramp into tube_ozarks_15, lined with 10-14 m pale-blue celestine megabeams, honey calcite druse, banded onyx, and zinc=90 galena ore.'
 :'Cherty-Dolomite & Red-Porphyry Glade (1176, 184, +1,107 m, 1.39 atm): sunny igneous glades, terraced High-Ria saffron & whorl-olive benches, suspended chert natural bridge over 20 m banded cave-onyx columns, and the western plateau Ancient defoliant bleach-belt scar.';

const FNAMES=['rock','wet','porphyry','bleach','terrace'];

KHOST.take({
 build:'springhollows'+(SKEY==='spring'?'':'-'+SKEY),
 title:'Krator biome — Springhollows: '+SITE.name,
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
  'springhollows flora & tufabryum':{match:o=>!!(o.userData&&o.userData.biome)},
  'karst caverns, porphyry & stelae':{match:o=>!!(o.userData&&o.userData.host)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-springhollows',version:1,site:SITE,state:SH_STATE,cavern:window._cavern,vstack:SH_VSTACK.stats,placed:SPRINGHOLLOWS.PLACED.length})
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
  placed:()=>SPRINGHOLLOWS.PLACED,
  state:()=>SH_STATE,
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
