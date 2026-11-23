// ================================================================= HOST — preset views, live HUD compass, controls & probe invariants ([draw])
// Strictly obeys VIEW-NAME (survey item 30): zero apostrophes and zero colons in any preset view name.
const gh=(x,z,dy)=>DRAWN_H(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS=(function(){
 if(SKEY==='foundry'){
  const v0=SITE.quenchVents[0],v2=SITE.quenchVents[2];
  return{
   'overview':look(-215,210,58,15,-25,8),
   'compass-leaf-whorl':look(v0.x-26,v0.z+26,5.8,v0.x,v0.z,2.4),
   'iron-sand-ripples':look(v2.x+24,v2.z+22,3.4,v2.x+6,v2.z+4,0.8),
   'quench-trench-lip':look(-165,-168,16,-148,-172,-6),
   'bronze-delver-stelae':look(-166,136,3.4,-136,108,1.2),
   'lodestone-arcology-site':look(-122,92,22,0,0,4)
  };
 }
 if(SKEY==='tors'){
  const s1=SITE.torSpires[1],s2=SITE.torSpires[2];
  return{
   'overview':look(-175,165,64,8,-68,18),
   'magnetite-tor-wall':look(-48,22,14,s2.x,s2.z,10),
   'fulgurite-spire':look(s1.x-24,s1.z+26,6.5,s1.x,s1.z,8.5),
   'flux-lichen-bands':look(s2.x-14,s2.z+14,3.2,s2.x,s2.z,1.2),
   'bronze-quarry-bench':look(-98,82,3.8,-78,64,1.0),
   'squall-horizon':look(115,135,44,-15,-65,16)
  };
 }
 if(SKEY==='cuesta'){
  return{
   'overview':look(-175,145,54,10,-5,8),
   'inversion-saddle':look(-68,4,14,12,0,2.0),
   'pine-pistache-wood':look(-85,-95,12,-35,-65,6),
   'saffron-olive-bench':look(72,-54,4.2,102,-78,1.2),
   'domain-wall-closeup':look(-28,2,3.6,0,0,1.2)
  };
 }
 // Station 4 (gorge)
 return{
  'overview':look(-195,165,62,15,5,6),
  'magnetite-river-narrows':look(-95,68,18,15,-12,2),
  'black-sand-placer':look(-42,58,4.6,12,18,0.6),
  'ham-tsek-post-site':look(88,82,16,138,112,3),
  'mulberry-terrace':look(36,118,6.5,72,118,3.5)
 };
})();

// ---------------------------------------------------------------- Live Bronze-Bezel HUD Compass-Needle Widget
const COMPASS_HUD=(function(){
 const box=document.createElement('div');
 box.id='compass-hud';
 const ns='http://www.w3.org/2000/svg';
 const row=document.createElement('div');
 row.className='ch-row';
 const svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','-24 -24 48 48');
 const ring=document.createElementNS(ns,'circle');
 ring.setAttribute('r','21');ring.setAttribute('fill','rgba(16,15,13,.9)');
 ring.setAttribute('stroke','#c89a54');ring.setAttribute('stroke-width','2');
 svg.appendChild(ring);
 const tickN=document.createElementNS(ns,'line');
 tickN.setAttribute('x1','0');tickN.setAttribute('y1','-21');tickN.setAttribute('x2','0');tickN.setAttribute('y2','-16');
 tickN.setAttribute('stroke','#e6b868');tickN.setAttribute('stroke-width','1.6');
 svg.appendChild(tickN);
 const needleG=document.createElementNS(ns,'g');
 const northHalf=document.createElementNS(ns,'polygon');
 northHalf.setAttribute('points','0,-16 4,0 -4,0');northHalf.setAttribute('fill','#d8523c');
 const southHalf=document.createElementNS(ns,'polygon');
 southHalf.setAttribute('points','0,15 3.6,0 -3.6,0');southHalf.setAttribute('fill','#c8c2b4');
 const hub=document.createElementNS(ns,'circle');
 hub.setAttribute('r','2.6');hub.setAttribute('fill','#e6b868');
 needleG.appendChild(southHalf);needleG.appendChild(northHalf);needleG.appendChild(hub);
 svg.appendChild(needleG);

 const meta=document.createElement('div');meta.className='ch-meta';
 const ttl=document.createElement('div');ttl.className='ch-ttl';ttl.textContent='Local Flux B';
 const val=document.createElement('div');val.className='ch-val';
 const sub=document.createElement('div');sub.className='ch-sub';
 meta.appendChild(ttl);meta.appendChild(val);meta.appendChild(sub);
 row.appendChild(svg);row.appendChild(meta);
 box.appendChild(row);
 document.body.appendChild(box);

 let lastHudKey='';
 const update=()=>{
  const cx=camera.position.x,cz=camera.position.z;
  const hKey=cx.toFixed(2)+','+cz.toFixed(2)+','+(COMPASS_STATE.squall?1:0);
  if(hKey===lastHudKey)return;
  lastHudKey=hKey;
  const f=COMPASS_PHYS.fieldAt(cx,cz,SKEY);
  // Screen-top corresponds to -Z (-pi/2 rad); convert world azimuth (0 = +X, +pi/2 = +Z) to dial degrees
  const deg=((f.azimuthRad*180/Math.PI)+90+360)%360;
  needleG.setAttribute('transform','rotate('+deg.toFixed(1)+')');
  val.textContent=f.bMagMt.toFixed(1)+' mT  '+Math.round(deg)+' deg';
  const pull=COMPASS_PHYS.ferrousPullAt(cx,cz,2.0,f.gradB2,'iron');
  sub.textContent=f.inversionSeam01>0.65?'DOMAIN SEAM (spin)':(pull.wrenchTool?'IRON HAZARD '+Math.round(pull.forceN)+'N':'bronze safe');
 };
 tick(update);
 return{box:box,update:update};
})();

let _dirtyFrames=0,_lastCamSig='';
function markDirty(n){_dirtyFrames=Math.max(_dirtyFrames,n==null?2:n);}
addEventListener('resize',()=>markDirty(2));

function statusSummary(){
 const cx=camera.position.x,cz=camera.position.z;
 const f=COMPASS_PHYS.fieldAt(cx,cz,SKEY);
 const pull=COMPASS_PHYS.ferrousPullAt(cx,cz,2.0,f.gradB2,'iron');
 return SITE.key+' ['+SITE.pAtm.toFixed(2)+' atm '+SITE.koppen+'] · |B| '+f.bMagMt.toFixed(2)+' mT · az '+(f.azimuthRad*180/Math.PI).toFixed(0)+' deg · 2kg-Fe '+pull.forceN.toFixed(1)+' N · squall '+(COMPASS_STATE.squall?'ON':'OFF');
}

const CONTROLS=(function(){
 const out=[];
 out.push({
  button:'Clear sky',id:'btn-clear',
  title:'Restore warm sunlit Mediterranean-continental clear weather',
  on(){
   COMPASS_STATE.squall=false;
   if(SKY&&SKY.setMood)try{SKY.setMood('clear');}catch(e){}
   markDirty(4);
   KHOST.inspector('Clear sky -> '+statusSummary());
  }
 });
 out.push({
  button:'Thunder squall',id:'btn-squall',
  title:'Trigger afternoon convective thunder-squall: fx/lightning.js bolts strike prominent conductive magnetite spires',
  on(){
   COMPASS_STATE.squall=true;
   triggerSpireLightning(0);
   markDirty(6);
   KHOST.inspector('Convective thunder-squall -> spire strike #'+(COMPASS_STATE.strikeCount)+' · '+statusSummary());
  }
 });
 out.push({
  button:'Field overlay',id:'btn-overlay',
  title:'Toggle subtle iron-dust streamline vector overlay across the hills',
  on(){
   COMPASS_STATE.fieldOverlay=!COMPASS_STATE.fieldOverlay;
   if(FIELD_OVERLAY)FIELD_OVERLAY.visible=COMPASS_STATE.fieldOverlay;
   markDirty(4);
   KHOST.inspector('Magnetic field overlay '+(COMPASS_STATE.fieldOverlay?'ON':'OFF')+' -> '+statusSummary());
  }
 });
 out.push({
  button:'Sun shadows',id:'btn-shadow',
  title:'Attach or toggle KSHADOW sun cascade (off at load by default)',
  on(){const on=toggleCompassShadow();markDirty(4);KHOST.inspector('Sun shadows '+(on?'ON':'OFF'));}
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
 const SP=rawItem?COMPASS.speciesOfItem(rawItem):null;
 const head=SP?(SP.name+'  ·  '+lab):(best?best.name+'  ·  '+lab:lab);

 const f=COMPASS_PHYS.fieldAt(p.x,p.z,SKEY);
 const lf=COMPASS_PHYS.leafAzimuthAt(p.x,p.z,SKEY,0.5);
 const pullFe=COMPASS_PHYS.ferrousPullAt(p.x,p.z,2.0,f.gradB2,'iron');
 const pullBr=COMPASS_PHYS.ferrousPullAt(p.x,p.z,2.0,f.gradB2,'tin-bronze');
 const asl=SITE.baseElevM+p.y;
 const lines=[head];
 if(SP){
  lines.push('Zone: '+SP.tags.zone+' · Climate: '+SP.tags.climate+'/'+SP.tags.aridity+' · Koppen: '+SP.tags.koppen.join(','));
  if(SP.tags.harvest&&SP.tags.harvest.notes)lines.push('Use: '+SP.tags.harvest.notes);
 }
 lines.push('Elev '+asl.toFixed(1)+' m ASL · P '+SITE.pAtm.toFixed(2)+' atm · |B| '+f.bMagMt.toFixed(2)+' mT (horiz '+f.bHorizMt.toFixed(2)+' mT, az '+(f.azimuthRad*180/Math.PI).toFixed(1)+' deg)');
 lines.push('Compass-leaf align '+(lf.alignment01*100|0)+'% (noon shade +'+(lf.noonShadeGain01*100|0)+'%) · 2kg Fe pull '+pullFe.forceN.toFixed(1)+' N vs Bronze '+pullBr.forceN.toFixed(4)+' N');
 lines.push(p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m');
 return lines.join('\n');
}

const BUDGET={
 showcase:{tris:8500000,calls:120},
 cls:{life:4500000,host:2500000},
 type:{'biome':'life','host':'host'}
};

function angleDiffDeg(a,b){
 let d=a-b;
 while(d>Math.PI)d-=TAU;
 while(d<-Math.PI)d+=TAU;
 return Math.abs(d)*180/Math.PI;
}

function collectUntexturedLitMeshes(extraList){
 const bad=[];
 const checkMat=(m,ownerName)=>{
  if(!m)return;
  if(m.isShaderMaterial||m.isRawShaderMaterial||m.isLineBasicMaterial||m.isSpriteMaterial)return;
  if((m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshBasicMaterial)&&!m.map){
   bad.push(ownerName||m.name||m.type);
  }
 };
 if(extraList){
  extraList.forEach(x=>checkMat(x.material||x,x.name||'test-mat'));
  return bad;
 }
 Object.keys(COMPASS.M).forEach(k=>checkMat(COMPASS.M[k],'COMPASS.M.'+k));
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
  const req=skey==='gorge'
   ?['compassbush','lodestonespire','fluxlichen','ferrotuft','fluxgrass','gorgeplane','silkmulberry','stonepine','corkoak','ironpistache','macchiasage']
   :['compassbush','lodestonespire','fluxlichen','ferrotuft','fluxgrass','stonepine','corkoak','ironpistache','whorlolive','cuestajuniper','macchiasage'];
  const miss=req.filter(k=>!(st&&st[k]>0));
  return{
   ok:!miss.length,
   detail:miss.length?'missing on '+skey+': '+miss.join(', '):req.map(k=>k+' '+st[k]).join(', ')
  };
 },
 compassAlignment(placed,skey){
  const bushes=(placed||[]).filter(r=>r[0]==='compassbush'&&r[6]);
  if(bushes.length<12)return{ok:false,detail:'too few compassbush instances ('+bushes.length+')'};
  const misaligned=bushes.filter(r=>r[6].bHorizMt>=0.5&&angleDiffDeg(r[6].bladeYawRad,r[6].fieldAzRad)>12.0);
  if(skey==='cuesta'){
   const seamBushes=bushes.filter(r=>r[6].bHorizMt<0.05);
   const highInSeam=seamBushes.filter(r=>r[6].align01>=0.20);
   const fN=COMPASS_PHYS.fieldAt(0,-22,'cuesta'),fS=COMPASS_PHYS.fieldAt(0,22,'cuesta');
   const flip=angleDiffDeg(fN.azimuthRad,fS.azimuthRad);
   const ok=!misaligned.length&&seamBushes.length>=3&&!highInSeam.length&&flip>150.0;
   return{
    ok:ok,
    detail:ok?bushes.length+' compassbush aligned (<=12 deg), '+seamBushes.length+' splayed in seam, '+flip.toFixed(0)+'-deg flip':'misaligned='+misaligned.length+', seam='+seamBushes.length+', highInSeam='+highInSeam.length+', flip='+flip.toFixed(1)
   };
  }
  return{
   ok:!misaligned.length,
   detail:!misaligned.length?bushes.length+' compassbush clumps locked within +-12 deg of local magnetic flux':misaligned.length+' misaligned compassbush clumps'
  };
 },
 matrixBalance(st){
  const sh=st&&st.earthShare!=null?st.earthShare:0;
  const ok=sh>=0.78&&sh<=0.90;
  return{
   ok:ok,
   detail:'Earthlike matrix '+(sh*100).toFixed(1)+'% ('+(st?st.earthlike:0)+' Earthlike / '+(st?st.ferromagnetic:0)+' ferromagnetic; target 78-90%)'
  };
 },
 zeroIronAndReserves(worksRecs,placed,reserve){
  const ironWorks=(worksRecs||[]).filter(r=>r.tags&&/^(iron|steel)$/i.test(r.tags.material||''));
  const buildings=(typeof KTAGS!=='undefined'&&KTAGS.page&&KTAGS.page.records)?KTAGS.page.records.filter(r=>r.class==='building'):[];
  const intrude=reserve?(placed||[]).filter(r=>Math.hypot(r[1]-reserve.x,r[3]-reserve.z)<reserve.r):[];
  const ok=!ironWorks.length&&!buildings.length&&!intrude.length;
  return{
   ok:ok,
   detail:ok?'0 iron works ('+(worksRecs?worksRecs.length:0)+' bronze/nephrite/copper/stone), 0 buildings, 0 reserve intrusions':'ironWorks='+ironWorks.length+', buildings='+buildings.length+', intrude='+intrude.length
  };
 },
 allTextured(extraList){
  const bad=collectUntexturedLitMeshes(extraList);
  return{
   ok:!bad.length,
   detail:bad.length?bad.length+' untextured meshes: '+bad.slice(0,5).join(', '):'0 untextured lit meshes across ground, tors, fulgurite, foliage & bronze/nephrite works'
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
 add('signature ferromagnetic and cuesta species placed on station',HCHK.stationSpecies(window._station,SKEY));
 add('compassbush vertical blades align within 12 deg of local magnetic flux',HCHK.compassAlignment(COMPASS.PLACED,SKEY));
 add('85-15 Earthlike vs ferromagnetic matrix balance holds in 78-90 percent',HCHK.matrixBalance(window._station));
 add('zero-iron delver works and clear settlement/arcology site reserves',HCHK.zeroIronAndReserves(WORKS.records,COMPASS.PLACED,SITE.reserve));
 add('100 percent of lit scene meshes carry real library textures',HCHK.allTextured(null));
 add('KSHADOW off at default page load',HCHK.shadowOffDefault(qShadow,!!renderer.shadowMap.enabled));
 add('ground shader stays within WebGL sampler budget',HCHK.samplersBudget(window._units));
 add('preset cameras clear of drawn ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('sky model and exposure finite and lit',HCHK.skyLit({exp:renderer.toneMappingExposure,sunAlt:SKY.state&&SKY.state.sunAlt,sunI:sun.intensity}));
 return R;
}

function hostNegatives(){
 const R=[],add=(name,r)=>R.push({name:name,failed:!r.ok,detail:r.detail});
 const fakeAligned=Array.from({length:14},(_,i)=>['compassbush',i*4,0,0,880,'cuestawood',{bladeYawRad:1.25,fieldAzRad:0.0,bHorizMt:2.5,align01:0.9}]);
 add('missing signature species fails station check',HCHK.stationSpecies({},SKEY));
 add('compassbush rotated 72 deg away from strong flux vector fails',HCHK.compassAlignment(fakeAligned,'foundry'));
 add('excessive 55 percent ferromagnetic clutter fails 85-15 balance check',HCHK.matrixBalance({earthShare:0.45,earthlike:45,ferromagnetic:55}));
 add('ferrous iron delver prop in high-gradient canton fails zero-iron check',HCHK.zeroIronAndReserves([{tags:{material:'iron'}}],[],null));
 add('untextured lit MeshStandardMaterial is caught',HCHK.allTextured([new THREE.MeshStandardMaterial({color:0x888888})]));
 add('shadowMap enabled at default load fails',HCHK.shadowOffDefault(false,true));
 add('ground over 14-sampler cap fails',HCHK.samplersBudget({final:16,max:16}));
 add('preset camera buried under drawn ground fails',HCHK.camerasOut([{view:'buried',x:0,y:DRAWN_H(0,0)-5,z:0}]));
 add('NaN sky exposure fails',HCHK.skyLit({exp:NaN,sunAlt:NaN,sunI:0}));
 return R;
}

KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(function hudViewTick(){if(COMPASS_HUD&&COMPASS_HUD.update)COMPASS_HUD.update();},'view');

const HINT=SKEY==='foundry'
 ?'Compass Hills — Lodestone Quench-Ring (1058, 224, +876.5 m, 1.43 atm Cfa): arcuate subsided cryo-magnet ring trench around the Lodestone arcology reserve, 360-deg swirling compassbush leaf streamlines, tangent-steered black Fe3O4 sand ripples, and zero-iron nephrite & tin-bronze delver stelae.'
 :SKEY==='tors'
 ?'Compass Hills — Eastern Magnetite Tors (1128, 248, +1,392.3 m, 1.34 atm Cfa): 60 m banded-ironstone cuesta scarp crowned by lightning-struck magnetite spires laced with glassy fulgurite veins, concentric fluxlichen isogauss rings, and tin-bronze quarry wedges.'
 :SKEY==='cuesta'
 ?'Compass Hills — Dry-Summer Csa Dip-Slope (1046, 258, +987.6 m, 1.42 atm Csa): umbrella stone pine, cork oak, iron-pistache, whorl-olive & saffron woodland crossed by a crisp 180-deg magnetic domain-wall saddle where compassbush bearings flip across 40 m.'
 :'Compass Hills — Ham-Tsek Magnetite Narrows (1055, 219, +846.7 m, 1.44 atm Cfa): 9102 Web-Cleaver River (1,080 m^3/s) carving 90 m banded-ironstone palisades with black magnetite-amber placer bars, mulberry groves, and bronze ferry bollards.';

const EXPORT_BOX_BY_STATION=SKEY==='foundry'?[-195,-195,195,195]:SKEY==='tors'?[-165,-110,165,125]:SKEY==='cuesta'?[-145,-125,155,125]:[-155,-95,175,145];

let _postTexFrames=2;
function pacedDraw(scn,cam,dt){
 if(!window._ready){SKY.draw(scn,cam,dt);return;}
 if(window._texPending){_postTexFrames=2;return;}
 if(_postTexFrames>0){_postTexFrames--;SKY.draw(scn,cam,dt);return;}
 const e=cam.matrixWorld.elements;
 const sig=e[12].toFixed(2)+','+e[13].toFixed(2)+','+e[14].toFixed(2)+','+e[8].toFixed(3)+','+e[9].toFixed(3)+','+e[10].toFixed(3);
 if(sig!==_lastCamSig){_lastCamSig=sig;_dirtyFrames=Math.max(_dirtyFrames,1);}
 if(dt>0||COMPASS_STATE.squall)_dirtyFrames=Math.max(_dirtyFrames,1);
 if(_dirtyFrames>0){
  _dirtyFrames--;
  SKY.draw(scn,cam,dt);
 }
}

KHOST.take({
 build:'compasshills'+(SKEY==='foundry'?'':'-'+SKEY),
 title:SITE.title,
 hint:HINT,
 scene:scene,camera:camera,renderer:renderer,ground:DRAWN_H,clear:1.8,registry:REG,regHas:regHas,views:VIEWS,ticks:TICKS,
 controls:CONTROLS,
 clock:{hour:ATMOS.SKY.viewHour},
 draw:pacedDraw,
 inspect:describe,
 stats:()=>'inst '+window._instances+'\n'+statusSummary(),
 layers:{
  'compass flora & spires':{match:o=>!!(o.userData&&o.userData.biome)},
  'bronze works & horizon':{match:o=>!!(o.userData&&o.userData.host)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-compasshills',version:1,site:SITE,state:COMPASS_STATE,placed:COMPASS.PLACED.length,fieldOrigin:COMPASS_PHYS.fieldAt(0,0,SKEY)})
 },
 minimap:{title:SITE.name},
 budget:BUDGET,
 types:()=>BIO.stats,
 api:{
  hostChecks:hostChecks,hostNegatives:hostNegatives,
  get totals(){const t=BIO.totals();return{tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._station,
  site:()=>SITE,
  placed:()=>COMPASS.PLACED,
  spires:()=>COMPASS.SPIRES,
  state:()=>COMPASS_STATE,
  exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','water'],
  exportBox:EXPORT_BOX_BY_STATION,
  at:(x,z)=>{
   const y=DRAWN_H(x,z),mf=COMPASS_PHYS.fieldAt(x,z,SKEY);
   const o={h:y,asl:SITE.baseElevM+y,water:waterH(x,z),bMagMt:mf.bMagMt,azimuthRad:mf.azimuthRad};
   FNAMES.forEach(n=>{o[n]=+FIELD[n](x,z).toFixed(3);});
   return o;
  }
 }
});
