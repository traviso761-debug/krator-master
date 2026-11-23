// ================================================================= HOST — preset views, mode toggles, inspector & probe invariants ([draw])
// Strictly obeys VIEW-NAME (survey item 30): zero apostrophes and zero colons in any preset view name.
const gh=(x,z,dy)=>DRAWN_H(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS=SKEY==='nexus'?{
 'Overview':look(-135,115,44,12,-8,8),
 'Radial dike nexus':look(-76,-58,28,8,6,4),
 'Communal bridge-webs':look(-54,18,16,8,-2,12),
 'Whitewater shut-in':look(-42,38,9,4,-4,2),
 'Saltpeter alcove':look(-34,52,5.5,-66,78,2.0),
 'Hum webgate pier':look(-118,76,8.5,-95,60,1.6)
}:SKEY==='fumarole'?{
 'Overview':look(-165,-18,52,8,-12,6),
 'Dike step-pools':look(-98,-82,11,-28,-48,1.2),
 'Fumarole sinter apron':look(-78,18,8.5,-44,46,1.2),
 'Thermal fern gallery':look(-18,16,6.5,14,48,2.4),
 'Placer riffle bar':look(82,-64,7.5,112,-36,1.2),
 'Inversion mist lid':look(-140,152,32,20,-35,4)
}:SKEY==='ledges'?{
 'Overview':look(-155,78,46,8,-10,8),
 'Columnar ledge woods':look(-58,28,9.5,12,8,6),
 'Dikeclaw cliff face':look(-28,58,8.5,-8,18,8),
 'Smoky quartz kluft':look(28,-22,5.5,36,-62,1.8),
 'Abyss mist overlook':look(18,52,12,45,185,2)
}:{
 'Overview':look(-118,-85,36,12,55,4),
 'Radial chasm lip':look(-48,96,12,24,148,-18),
 'Updraft krummholz flag':look(-18,68,4.2,12,92,0.8),
 'Vitrophyre dike rib':look(-112,-34,8.5,-72,-48,3.5),
 'Frost polygon rim':look(32,-48,4.8,8,-12,0.4)
};

function statusSummary(){
 const p=camera.position,inv=ARACH_PHYS.inversionAt(p.x,p.z,p.y,SITE);
 if(SKEY==='nexus'){
  return 'Nexus [1.47 atm] · mode '+ARACH_STATE.mode+' · '+ARACHNOIDS.WEB_SPANS.length+' catenary bridge-webs (0.75 g) · slot +'+inv.tempC.toFixed(1)+' C';
 }
 if(SKEY==='fumarole'){
  const fm=ARACH_PHYS.fumaroleAt(-52,46,SITE);
  return 'Fumarole [1.43 atm] · mode '+ARACH_STATE.mode+' · '+STEP_POOLS.length+' step-pools · throat +'+fm.groundTempC.toFixed(1)+' C';
 }
 if(SKEY==='ledges'){
  return 'Ledges [1.31 atm, Csa] · mode '+ARACH_STATE.mode+' · Smoky Kluft '+(ALCOVE?ALCOVE.crystals:0)+' crystals · +'+inv.tempC.toFixed(1)+' C';
 }
 const sh=ARACH_PHYS.krummholzShearAt(0,95,SITE);
 return 'Frostrim [0.88 atm, ET] · mode '+ARACH_STATE.mode+' · updraft '+sh.updraftMs.toFixed(1)+' m/s · krummholz H '+sh.prostrateH.toFixed(2)+' m';
}

const CONTROLS=[
 {
  button:'Clear',id:'btn-clear',
  title:'Crisp baseline canyon visibility and steady updraft',
  on(){ARACH_STATE.mode='Clear';ARACH_STATE.mistBoost=0;ARACH_STATE.windGain=1.0;KHOST.inspector('Mode Clear -> '+statusSummary());}
 },
 {
  button:'Slot-Mist',id:'btn-slot-mist',
  title:'Deepen inverted warm canyon-floor river & fumarole mist belt while keeping upper rims clear',
  on(){ARACH_STATE.mode='Slot-Mist';ARACH_STATE.mistBoost=0.95;ARACH_STATE.windGain=0.85;KHOST.inspector('Mode Slot-Mist -> '+statusSummary());}
 },
 {
  button:'Rim-Gale',id:'btn-rim-gale',
  title:'Boost canyon-chimney updraft & rim gale (+85% wind): intensifies bridge-web sway and krummholz flagging',
  on(){ARACH_STATE.mode='Rim-Gale';ARACH_STATE.mistBoost=0.20;ARACH_STATE.windGain=1.85;KHOST.inspector('Mode Rim-Gale -> '+statusSummary());}
 },
 {
  button:'Sun shadows',id:'btn-shadow',
  title:'Attach or toggle KSHADOW sun cascade (off at load by default)',
  on(){const on=toggleArachShadow();KHOST.inspector('Sun shadows '+(on?'ON':'OFF'));}
 }
];

function describe(hit){
 const p=hit.point,o=hit.object;
 let best=null;
 for(const r of REG){if(r.r>400)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const instLbl=(o.isInstancedMesh&&typeof BIO.instLabel==='function')?BIO.instLabel(o,hit.instanceId):null;
 const lab=instLbl||o.userData.inspectLabel||o.name||'mesh';
 const isItem=o.isInstancedMesh&&o.userData.biome;
 const rawItem=isItem?(o.name||'').replace(/^biome:(?:[a-z0-9_-]+\|)?/,''):null;
 const SP=rawItem?ARACHNOIDS.speciesOfItem(rawItem):null;
 const head=SP?(SP.name+'  ·  '+lab):(best?best.name+'  ·  '+lab:lab);

 const P=physAt(p.x,p.z,p.y);
 const asl=SITE.elevM+(p.y-SITE.bedY);
 const lines=[head];
 if(SP){
  lines.push('Zone: '+SP.tags.zone+' · Climate: '+SP.tags.climate+'/'+SP.tags.aridity+' · Koppen: '+SP.tags.koppen.join(','));
  if(SP.tags.harvest&&SP.tags.harvest.notes)lines.push('Use: '+SP.tags.harvest.notes);
 }
 lines.push('Elev '+asl.toFixed(1)+' m ASL · P '+P.inv.pAtm.toFixed(2)+' atm · T '+P.inv.tempC.toFixed(1)+' C · RH '+(P.inv.rh01*100|0)+'% · zone '+P.inv.zoneBand);
 lines.push('Dike spoke '+P.fn.spokeDistM.toFixed(1)+' m · vitrophyre '+(P.fn.vitrophyre01*100|0)+'% · updraft '+P.inv.updraftMs.toFixed(1)+' m/s · frost '+(P.inv.frost01*100|0)+'%');
 if(SKEY==='fumarole'){
  lines.push('Ground T +'+P.fum.groundTempC.toFixed(1)+' C · sinter '+(P.fum.sinterRim01*100|0)+'% · sulfur '+(P.fum.sulfurCrust01*100|0)+'%');
 }
 lines.push(p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m');
 return lines.join('\n');
}

const BUDGET={
 showcase:{tris:6500000,calls:120},
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
 Object.keys(ARACHNOIDS.M).forEach(k=>checkMat(ARACHNOIDS.M[k],'ARACHNOIDS.M.'+k));
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
 ownPolygon(pxPt){
  const ok=ARACH_SITES.inOwnPolygon(pxPt[0],pxPt[1])===true&&ARACH_SITES.inOwnPolygon(1055,219)===false;
  return{
   ok:ok,
   detail:ok?'station ('+pxPt[0]+','+pxPt[1]+') strictly inside Core own; (1055,219) rejected':'outside Core own polygon: ('+pxPt[0]+','+pxPt[1]+')'
  };
 },
 stationSpecies(st,skey){
  const req=skey==='nexus'
   ?['bridgeweb','dikeclaw','webanchorvine','columnarpine','gorgehemlock','canyonbamboo','alpinesedge']
   :skey==='fumarole'
   ?['fumarolefern','sintermat','dikeclaw','gorgehemlock','canyonbamboo','alpinesedge']
   :skey==='ledges'
   ?['columnarpine','ledgeoak','dikeclaw','webanchorvine','alpinesedge']
   :['rimkrummholz','frostcushion','alpinesedge'];
  const miss=req.filter(k=>!(st&&st[k]>0));
  return{
   ok:!miss.length,
   detail:miss.length?'missing on '+skey+': '+miss.join(', '):req.map(k=>k+' '+st[k]).join(', ')
  };
 },
 inversionGuard(placed,skey,site){
  const badHigh=(placed||[]).filter(r=>(r[0]==='bridgeweb'||r[0]==='fumarolefern')&&(r[4]>1450.0||(r[6]&&r[6].frost01>0)));
  if(skey==='frostrim'){
   const lip=ARACH_PHYS.inversionAt(0,85,site.rimY,site);
   const ok=!badHigh.length&&lip.frost01>=0.70;
   return{ok:ok,detail:ok?'frostrim frost01='+lip.frost01+', 0 bridgeweb/fumarolefern above +1450 m':'badHigh='+badHigh.length+', frost01='+lip.frost01};
  }
  const bed=ARACH_PHYS.inversionAt(0,0,site.bedY+5.0,site);
  const rim=ARACH_PHYS.inversionAt(160,140,site.rimY,site);
  const dT=+(bed.tempC-rim.tempC).toFixed(2),dRh=+(bed.rh01-rim.rh01).toFixed(3);
  const ok=!badHigh.length&&dT>=8.5&&dRh>0.30&&bed.frost01===0;
  return{
   ok:ok,
   detail:ok?'slot inversion +'+dT+' C & +'+dRh+' RH over rim, 0 frozen/high bridgeweb or fumarolefern':'dT='+dT+', dRh='+dRh+', badHigh='+badHigh.length
  };
 },
 bridgeWebAudit(audit,skey){
  if(skey!=='nexus')return{ok:audit.spans===0,detail:'station '+skey+' (communal bridge-web shut-in on nexus)'};
  const ok=audit.spans>=4&&audit.anchors>0&&audit.pinnedZero===audit.anchors&&audit.maxAnchorDrift===0&&audit.minWaterClearM>=12.0&&audit.maxAnchorGapM<=0.15&&audit.minBellyDisp>0.25;
  return{
   ok:ok,
   detail:ok?audit.spans+' 0.75g bridge-webs, '+audit.pinnedZero+'/'+audit.anchors+' rock-pinned anchors (0.000 m drift), water clear >='+audit.minWaterClearM+' m':'spans='+audit.spans+', drift='+audit.maxAnchorDrift+', gap='+audit.maxAnchorGapM+', clear='+audit.minWaterClearM
  };
 },
 stepPoolsAndShear(pools,placed,skey){
  if(skey==='fumarole'){
   let prev=1e9,bad=null;
   for(let i=0;i<pools.length;i++){
    if(pools[i].level>=prev-0.30){bad='pool '+i;break;}
    prev=pools[i].level;
   }
   const ok=pools.length>=8&&!bad;
   return{ok:ok,detail:ok?pools.length+' monotone basalt-weir step-pools & KTHERM fumarole aprons':'bad pool step: '+bad};
  }
  if(skey==='frostrim'){
   const kr=(placed||[]).filter(r=>r[0]==='rimkrummholz'&&r[6]&&r[6].prostrateH<=1.95&&r[6].bannerLenM>=1.55);
   const ok=kr.length>=15;
   return{ok:ok,detail:ok?kr.length+' 0.88 atm updraft-sheared prostrate rimkrummholz banners':'krummholz count='+kr.length};
  }
  if(skey==='ledges'){
   const ok=!!ALCOVE&&ALCOVE.crystals>=5;
   return{ok:ok,detail:ok?'KSPELEO.SMOKY radial quartz Kluft ('+ALCOVE.crystals+' crystals) & KRELIEF.slab benches':'missing SMOKY Kluft crystals'};
  }
  const ok=!!ALCOVE&&ALCOVE.crystals>=5;
  return{ok:ok,detail:ok?'KSPELEO.HYPOGENE saltpeter alcove ('+ALCOVE.crystals+' crusts/chandeliers)':'missing HYPOGENE saltpeter crusts'};
 },
 allTextured(extraList){
  const bad=collectUntexturedLitMeshes(extraList);
  return{
   ok:!bad.length,
   detail:bad.length?bad.length+' untextured meshes: '+bad.slice(0,5).join(', '):'0 untextured lit meshes across ground, dikes, alcoves, barks, foliage, bridge-webs & works'
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
 add('station pixel strictly inside Core own polygon',HCHK.ownPolygon(SITE.px));
 add('signature and matrix species placed on station',HCHK.stationSpecies(window._station,SKEY));
 add('inverted canyon microclimate and frost-free bridgeweb/fern ceiling',HCHK.inversionGuard(ARACHNOIDS.PLACED,SKEY,SITE));
 add('0.75g catenary bridge-web rock anchoring and 0.000 m ATMOS pin drift',HCHK.bridgeWebAudit(ARACHNOIDS.WEB_AUDIT,SKEY));
 add('station speleothems, monotone step-pools and 0.88 atm krummholz shear',HCHK.stepPoolsAndShear(STEP_POOLS,ARACHNOIDS.PLACED,SKEY));
 add('100 percent of lit scene meshes carry real library textures',HCHK.allTextured(null));
 add('KSHADOW off at default page load',HCHK.shadowOffDefault(qShadow,!!renderer.shadowMap.enabled));
 add('ground shader stays within WebGL sampler budget',HCHK.samplersBudget(window._units));
 add('preset cameras clear of drawn ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('sky model and exposure finite and lit',HCHK.skyLit({exp:renderer.toneMappingExposure,sunAlt:SKY.state&&SKY.state.sunAlt,sunI:sun.intensity}));
 return R;
}

function hostNegatives(){
 const R=[],add=(name,r)=>R.push({name:name,failed:!r.ok,detail:r.detail});
 add('Compass Hills overlap pixel (1055, 219) fails own-polygon check',HCHK.ownPolygon([1055,219]));
 add('missing signature species fails station check',HCHK.stationSpecies({},SKEY));
 add('fumarolefern placed at +3200 m or frost01 > 0 fails inversion ceiling',HCHK.inversionGuard([['fumarolefern',0,20,0,3200,'frostrim',{frost01:0.75}]],SKEY,SITE));
 add('sky-floating or drifting bridge-web anchor fails web audit',HCHK.bridgeWebAudit({spans:4,anchors:8,pinnedZero:6,maxAnchorDrift:0.35,minWaterClearM:18,maxAnchorGapM:0.45,minBellyDisp:0.5},'nexus'));
 add('uphill non-monotone basalt step-pool fails',HCHK.stepPoolsAndShear([{level:10},{level:10.5},1,2,3,4,5,6],[],'fumarole'));
 add('untextured lit MeshStandardMaterial is caught',HCHK.allTextured([new THREE.MeshStandardMaterial({color:0x888888})]));
 add('shadowMap enabled at default load fails',HCHK.shadowOffDefault(false,true));
 add('ground over 14-sampler cap fails',HCHK.samplersBudget({final:16,max:16}));
 add('preset camera buried under drawn ground fails',HCHK.camerasOut([{view:'buried',x:0,y:DRAWN_H(0,0)-5,z:0}]));
 add('NaN sky exposure fails',HCHK.skyLit({exp:NaN,sunAlt:NaN,sunI:0}));
 return R;
}

KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');

const HINT=SKEY==='nexus'
 ?'Ham-Tsek Radial Dike Nexus (998, 290; +660.6 m, 1.47 atm): 9102 Ham-Tsek (1,295 m3/s) breaching a 3-spoke arch-rift-basalt dike star-junction beneath 35-85 m multi-tier catenary Tsek-Ma communal Bridge-Webs, KSPELEO.HYPOGENE saltpeter overhangs, and Hum silk-hawser toll capstans.'
 :SKEY==='fumarole'
 ?'Cauldron-Slot Fumaroles & Step-Pools (1097, 331; +912.6 m, 1.43 atm, +28 C trough): 9 monotone turquoise basalt-sill plunge pools, KTHERM +68 C sulfur-steam fumaroles, Steam-Plume Tree-Ferns (fumarolefern), thermophilic sintermat cushions, and Hum cassiterite/gold placer riffle-bars below sheer dry cauldron cliffs.'
 :SKEY==='ledges'
 ?'Mid-Wall Columnar Basalt & Tuff Ledge Forest (984, 283; +1,629.0 m, 1.31 atm, Csa): KRELIEF.slab horizontal colonnade and outland-tuff benches with root-clawed columnarpine and evergreen canyon oaks, carmine-silver dikeclaw cliff rosettes, and a walkable KSPELEO.SMOKY smoky-quartz Kluft above a 970 m mist abyss.'
 :'High Alpine Frost-Rim & Updraft Krummholz (919, 281; +4,784.3 m, 0.88 atm, ET -2 C): KFROST sorted stone polygons and clinking jet-black obsidian-vitrophyre dike hogbacks overlooking a 2,000 m cloud-filled radial chasm, with horizontal rimkrummholz banners sheared radially away from rising canyon updrafts.';

const EXPORT_BOX_BY_STATION=SKEY==='nexus'?[-125,-95,115,95]:SKEY==='fumarole'?[-140,-125,135,75]:SKEY==='ledges'?[-115,-85,95,85]:[-125,-75,95,135];

KHOST.take({
 build:'arachnoids'+(SKEY==='nexus'?'':'-'+SKEY),
 title:'Krator biome — Arachnoid Canyons: '+SITE.name,
 hint:HINT,
 scene:scene,camera:camera,renderer:renderer,ground:DRAWN_H,clear:1.8,registry:REG,regHas:regHas,views:VIEWS,ticks:TICKS,
 controls:CONTROLS,
 clock:{hour:ATMOS.SKY.viewHour},
 draw:SKY.draw,
 inspect:describe,
 stats:()=>'inst '+window._instances+'\n'+statusSummary(),
 layers:{
  'arachnoids flora & lithophytes':{match:o=>!!(o.userData&&o.userData.biome)},
  'bridge-webs, dikes, alcoves & works':{match:o=>!!(o.userData&&o.userData.host)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-arachnoids',version:1,site:SITE,state:ARACH_STATE,webAudit:ARACHNOIDS.WEB_AUDIT,webSpans:ARACHNOIDS.WEB_SPANS,placed:ARACHNOIDS.PLACED.length})
 },
 minimap:{title:SITE.name},
 budget:BUDGET,
 types:()=>BIO.stats,
 api:{
  hostChecks:hostChecks,hostNegatives:hostNegatives,
  get totals(){const t=BIO.totals();return{tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._station,
  site:()=>SITE,
  placed:()=>ARACHNOIDS.PLACED,
  webSpans:()=>ARACHNOIDS.WEB_SPANS,
  state:()=>ARACH_STATE,
  exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','water'],
  exportBox:EXPORT_BOX_BY_STATION,
  at:(x,z)=>{
   const y=DRAWN_H(x,z),o={h:y,asl:SITE.elevM+(y-SITE.bedY),water:waterH(x,z)};
   FNAMES.forEach(nm=>{o[nm]=+FIELD[nm](x,z).toFixed(3);});
   return o;
  }
 }
});
