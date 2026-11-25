/* ================================================================= HOST — preset views, lithophone chime synthesizer, controls & invariants ([draw])
   Strictly obeys VIEW-NAME (survey item 30): zero apostrophes, zero colons, zero slashes in any preset view name,
   and every preset camera eye sits >= 3.2 m (>= 2.2 m rule) clear above KDRAWN ground & cleft walls!
*/
const gh=(x,z,dy)=>DRAWN_H(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];

const VIEWS=SKEY==='apron'?{
 'Overview':look(96,-118,34,-18,8,2),
 'Gnamma sky mirrors':look(-52,-38,5.2,-34,-22,0.2),
 'Onion-skin steps':look(74,34,8.5,12,86,2.0),
 'A-tent lithophone arch':look(-18,46,3.8,-18,24,1.4),
 'Pan bonsai island':look(38,-28,4.6,20,-14,1.2),
 'Sheetwash flutes':look(-42,44,7.5,-70,96,1.0)
}:SKEY==='moat'?{
 'Overview':look(16,48,26,-16,-68,8),
 'Ring-dike hogback':look(-12,18,9.5,-18,-94,18),
 'Seepage pitcher fen':look(24,8,4.2,-18,-18,0.4),
 'Sheetwash apron toe':look(8,52,6.8,-44,72,1.2),
 'Whispering wall alcove':look(16,-8,4.8,0,-92,14),
 'Moat waystation site':look(112,-16,12.5,158,-42,2.0)
}:SKEY==='crown'?{
 'Overview':look(-128,-118,36,0,0,6),
 'Concentric treeline garlands':look(-72,-68,18,24,38,3),
 'Lenticular crown veil':look(68,-68,12,-12,12,16),
 'Crown rosette gnammas':look(34,-52,4.4,18,-64,0.4),
 'Dome observatory plinth':look(0,-34,5.2,0,4,2.0)
}:SKEY==='eastflank'?{
 'Overview':look(96,-112,34,-12,4,6),
 'Perimeter kill line':look(28,-56,9.5,4,12,1.5),
 'Carnelian sky island':look(-18,-32,10.5,-78,18,3.5),
 'Active mist pylon':look(32,-48,6.5,62,-18,8.0),
 'East gnamma mirrors':look(56,-84,5.4,74,-62,0.4),
 'Flank lithophone arch':look(82,62,4.8,104,46,1.2)
}:{
 'Overview':look(-136,-92,34,8,0,-8),
 'Radial kluft throat':look(-74,-1.8,5.6,22,0.5,-2.5),
 'Smoky-quartz pocket':[6,gh(6,2.0,4.2),2.0,14,-30.5,-10.5],
 'Barometric fern gallery':look(-18,-1.2,4.5,24,6.2,1.8),
 'Wedged chockstone bridge':look(24,0.4,5.4,54,1.2,0.6)
};

/* WebAudio 65-140 Hz flexural stone-gong lithophone synthesizer driven by DOME_PHYS.acousticsAt */
let _audioCtx=null;
function playLithophoneChime(hz,boom01){
 const f0=clamp((hz==null||hz<=0)?88.0:hz,62.0,148.0),amp=clamp(boom01==null?0.6:boom01,0.12,1.0);
 DOME_STATE.lastChimeHz=f0;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return f0;
  if(!_audioCtx)_audioCtx=new AC();
  if(_audioCtx.state==='suspended')_audioCtx.resume();
  const now=_audioCtx.currentTime;
  const g=_audioCtx.createGain();
  g.gain.setValueAtTime(0.001,now);
  g.gain.exponentialRampToValueAtTime(0.22*amp,now+0.018);
  g.gain.exponentialRampToValueAtTime(0.0008,now+1.85);
  g.connect(_audioCtx.destination);
  [1.0,2.76,5.40].forEach((mult,idx)=>{
   const osc=_audioCtx.createOscillator();
   const og=_audioCtx.createGain();
   osc.type=idx===0?'sine':'triangle';
   osc.frequency.setValueAtTime(f0*mult,now);
   og.gain.value=idx===0?0.72:idx===1?0.22:0.08;
   osc.connect(og);og.connect(g);
   osc.start(now);osc.stop(now+1.9);
  });
 }catch(e){}
 return f0;
}

/* Footstep hook: walking across detached hollow A-tent slabs triggers flexural bass lithophone booms automatically */
{
 let _lastStepX=1e9,_lastStepZ=1e9;
 tick(()=>{
  const cx=camera.position.x,cz=camera.position.z,cy=camera.position.y;
  if(Math.hypot(cx-_lastStepX,cz-_lastStepZ)<2.2)return;
  _lastStepX=cx;_lastStepZ=cz;
  if(cy-DRAWN_H(cx,cz)>3.2)return;
  const ac=DOME_PHYS.acousticsAt(cx,cz,SITE);
  if(ac.hollowBoom01>0.15&&ac.lithophoneHz>=62.0){
   playLithophoneChime(ac.lithophoneHz,ac.hollowBoom01*0.65);
  }
 });
}

function statusSummary(){
 const pEnv=DOME_PHYS.pressureAt(SITE.baseElevM);
 const ac=DOME_PHYS.acousticsAt(camera.position.x,camera.position.z,SITE);
 const tag=ac.lithophoneHz>0?('lithophone '+ac.lithophoneHz.toFixed(0)+' Hz'):ac.whisperFocusDb>4?('whisper +'+ac.whisperFocusDb.toFixed(1)+' dB'):ac.baroFlowMs>0.5?('baro '+ac.baroFlowMs.toFixed(1)+' m/s'):('hydro '+(DOME_STATE.hydroperiod01*100).toFixed(0)+'%');
 return SITE.id+' ['+pEnv.pAtm.toFixed(2)+' atm · '+SITE.koppen+'] · '+DOME_STATE.mode+' · '+tag;
}

const CONTROLS=[
 {
  button:'Vernal-Brim',id:'btn-brim',
  title:'Fill perched gnamma solution-pan sky-mirrors to post-storm brim and unfurl emerald gnammamoss rims',
  on(){
   DOME_STATE.mode='Vernal-Brim';
   DOME_STATE.mistBoost=SKEY==='crown'?0.65:0.08;
   syncHydroperiod(0.96);
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector('Vernal-Brim sky-mirrors active -> '+statusSummary());
  }
 },
 {
  button:'Sun-Baked Dry',id:'btn-dry',
  title:'Desiccate perched gnamma pans between storms, shifting resurrection gnammamoss to curled copper-crimson',
  on(){
   DOME_STATE.mode='Sun-Baked Dry';
   DOME_STATE.mistBoost=0.0;
   syncHydroperiod(0.06);
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector('Sun-Baked Dry edaphic drought -> '+statusSummary());
  }
 },
 {
  button:'Crown-Mist',id:'btn-mist',
  title:'Thicken the lenticular Crown-Veil cap-cloud and horizontal fog-drip across contour-riser garlands',
  on(){
   DOME_STATE.mode='Crown-Mist';
   DOME_STATE.mistBoost=0.84;
   syncHydroperiod(0.82);
   if(SKY&&SKY.view)SKY.view();
   KHOST.inspector('Crown-Veil lenticular mist -> '+statusSummary());
  }
 },
 {
  button:'Lithophone Chime',id:'btn-chime',
  title:'Strike nearest hollow A-tent granite slab to hear its 65-140 Hz flexural stone-gong fundamental',
  on(){
   const sampleX=SITE.aTents&&SITE.aTents.length?SITE.aTents[0].x:camera.position.x;
   const sampleZ=SITE.aTents&&SITE.aTents.length?SITE.aTents[0].z:camera.position.z;
   const ac=DOME_PHYS.acousticsAt(sampleX,sampleZ,SITE);
   const hz=playLithophoneChime(ac.lithophoneHz>0?ac.lithophoneHz:92.0,0.85);
   KHOST.inspector('Struck stone lithophone at '+hz.toFixed(1)+' Hz -> '+statusSummary());
  }
 },
 {
  button:'Sun shadows',id:'btn-shadow',
  title:'Attach or toggle KSHADOW sun cascade (strictly off at page load by default)',
  on(){const on=toggleDomeShadow();KHOST.inspector('Sun shadows '+(on?'ON':'OFF'));}
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
 const SP=rawItem?THEDOME.speciesOfItem(rawItem):null;
 const head=SP?(SP.name+'  ·  '+lab):(best?best.name+'  ·  '+lab:lab);

 const sh=DOME_PHYS.shellAt(p.x,p.z,SITE);
 const gn=DOME_PHYS.gnammaAt(p.x,p.z,DOME_STATE.hydroperiod01,SITE);
 const ac=DOME_PHYS.acousticsAt(p.x,p.z,SITE);
 const asl=SITE.baseElevM+p.y;
 const pEnv=DOME_PHYS.pressureAt(asl);
 const lines=[head];
 if(SP){
  lines.push('Zone: '+SP.tags.zone+' · Climate: '+SP.tags.climate+'/'+SP.tags.aridity+' · Koppen: '+SP.tags.koppen.join(','));
  if(SP.tags.harvest&&SP.tags.harvest.notes)lines.push('Use: '+SP.tags.harvest.notes);
 }
 lines.push('Elev '+asl.toFixed(1)+' m ASL · P '+pEnv.pAtm.toFixed(3)+' atm · slope '+sh.slopeDeg.toFixed(1)+' deg · shellStep '+sh.shellStep01.toFixed(2));
 if(gn.inPan)lines.push('Gnamma pan '+gn.panId+': r '+gn.panRadiusM+' m · waterDepth '+gn.waterDepthM.toFixed(2)+' m · rimGrit '+gn.rimGrit01.toFixed(2));
 if(ac.lithophoneHz>0)lines.push('Hollow A-tent lithophone: '+ac.lithophoneHz.toFixed(1)+' Hz (gap '+ac.hollowGapM.toFixed(2)+' m)');
 if(ac.whisperFocusDb>2)lines.push('Ring-dike acoustic focus: +'+ac.whisperFocusDb.toFixed(1)+' dB');
 if(ac.baroFlowMs>0.2)lines.push('Radial Kluft barometric breath: '+ac.baroFlowMs.toFixed(2)+' m/s · Aeolian '+ac.aeolianChordHz.toFixed(0)+' Hz');
 lines.push(p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m');
 return lines.join('\n');
}

const BUDGET={
 showcase:{tris:5200000,calls:105},
 cls:{life:3200000,host:2000000},
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
 Object.keys(THEDOME.M).forEach(k=>checkMat(THEDOME.M[k],'THEDOME.M.'+k));
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
  const req=(skey==='apron'||skey==='eastflank')?['gnammamoss','panbonsai','cloudgarlandpine','cleftfilmyfern','ringlichen']
   :skey==='moat'?['moatpitcher','ringlichen','moatcedar']
   :skey==='crown'?['gnammamoss','cloudgarlandpine','crownrosette','ringlichen']
   :['cloudgarlandpine','crownrosette','cleftfilmyfern','ringlichen'];
  const miss=req.filter(k=>!(st&&st[k]>0));
  if(skey==='eastflank'){
   if(!(st&&st.carnelianSkyIsland>=25))miss.push('carnelianSkyIsland>=25');
   const tagRecs=(typeof KTAGS!=='undefined'&&KTAGS.page&&KTAGS.page.records)?KTAGS.page.records:[];
   const hasPylon=tagRecs.some(r=>r&&r.id==='thedome:ecof-mist-pylon'&&r.class==='infrastructure');
   if(!hasPylon)miss.push('thedome:ecof-mist-pylon');
  }
  return{ok:!miss.length,detail:miss.length?'missing on '+skey+': '+miss.join(', '):req.map(k=>k+' '+st[k]).join(', ')+(skey==='eastflank'?', carnelianSkyIsland '+st.carnelianSkyIsland:'')};
 },
 ownDmFootprint(px,py){
  const fp=DOME_PHYS.inDomeFootprint(px,py);
  return{ok:fp.inPolygon&&fp.inOwnDm,detail:'px ('+px+','+py+') inPolygon='+fp.inPolygon+', inOwnDm='+fp.inOwnDm+', r='+fp.domeRadiusKm+' km'};
 },
 gnammaRimSill(pans){
  if(!pans||!pans.length)return{ok:true,detail:'0 gnamma pans on '+SKEY};
  let bad=0,minClear=99;
  for(let i=0;i<pans.length;i++){
   const P=pans[i],wY=P.sillY-0.08;
   for(let a=0;a<12;a++){
    const ang=(a/12)*TAU,rx=P.x+Math.cos(ang)*P.r*1.04,rz=P.z+Math.sin(ang)*P.r*1.04;
    const clear=terrainH(rx,rz)-wY;
    if(clear<minClear)minClear=clear;
    if(clear<0.04)bad++;
   }
  }
  return{ok:bad===0,detail:pans.length+' gnamma pans, min 360 deg rock-rim freeboard +'+minClear.toFixed(3)+' m (>= +0.040 m)'};
 },
 baldApronTreeExclusion(trees){
  const list=trees||[];
  const bad=list.filter(t=>t.H>4.0&&!t.moatCollar&&t.shellStep01<0.55&&!t.inPan);
  const badGarland=list.filter(t=>t.key==='cloudgarlandpine'&&t.shellStep01<0.70);
  const ok=bad.length===0&&badGarland.length===0;
  return{ok:ok,detail:ok?list.length+' trees audited: 0 >4 m trees on bare aprons, 100% cloudgarlandpine on shellStep01 >= 0.70':'badApron='+bad.length+', badGarland='+badGarland.length};
 },
 lithophoneAndKluft(site,kluft){
  const solid=DOME_PHYS.acousticsAt(180,180,site);
  let tentOk=true,tentHz=0;
  if(site.aTents&&site.aTents.length){
   const ac=DOME_PHYS.acousticsAt(site.aTents[0].x,site.aTents[0].z,site);
   tentHz=ac.lithophoneHz;
   tentOk=ac.lithophoneHz>=62.0&&ac.lithophoneHz<=148.0&&ac.hollowBoom01>0;
  }
  const cleftOk=site.id!=='cleft'||(!!kluft&&kluft.crystals>=8&&kluft.blocks>=1);
  const ok=solid.hollowBoom01===0&&solid.lithophoneHz===0&&tentOk&&cleftOk;
  return{ok:ok,detail:'solidBoom='+solid.hollowBoom01+', tentHz='+tentHz.toFixed(1)+', kluftCrystals='+(kluft?kluft.crystals:0)};
 },
 vstackGraphics(vs){
  const ok=!!vs&&vs.m1Loaded&&vs.indexedItems&&vs.lodMerge&&vs.roughAAMats>=3&&vs.chromaticGroundVerts>1000&&vs.drawnSources>=1&&vs.groundLayers>=1&&vs.groundLayers<=3;
  return{ok:ok,detail:vs?('M1='+vs.m1Loaded+', index='+vs.indexedItems+', roughAA='+vs.roughAAMats+', S6verts='+vs.chromaticGroundVerts+', KDRAWN='+vs.drawnSources+', KGROUND='+vs.groundLayers):'missing _vstack'};
 },
 reserveClean(tagsList){
  const buildings=(tagsList||[]).filter(r=>r&&r.class==='building');
  return{ok:!buildings.length,detail:buildings.length?buildings.length+' unexpected building records':'0 class=building records in sacred dome reserves'};
 },
 allTextured(extraList){
  const bad=collectUntexturedLitMeshes(extraList);
  return{ok:!bad.length,detail:bad.length?bad.length+' untextured: '+bad.slice(0,5).join(', '):'0 untextured lit meshes'};
 },
 shadowOffDefault(hasQueryShadow,shadowEnabled){
  const ok=hasQueryShadow?true:!shadowEnabled;
  return{ok:ok,detail:'KSHADOW detached at default load (shadowMap.enabled='+shadowEnabled+')'};
 },
 samplersBudget(u){
  const n=u&&u.final!=null?u.final:99;
  return{ok:n<=13,detail:'MAT_GROUND uses '+n+' of '+(u?u.max:16)+' texture units (cap 13 < 15)'};
 },
 camerasOut(C){
  const bad=C.filter(c=>c.y<DRAWN_H(c.x,c.z)+2.2);
  return{ok:C.length>0&&!bad.length,detail:bad.length?'under +2.2 m clearance: '+bad.map(c=>c.view).join(', '):C.length+' preset cameras >= 2.2 m clear of KDRAWN ground'};
 }
};

function hostChecks(){
 const R=[],add=(name,r)=>R.push(Object.assign({name:name},r));
 const qShadow=new URLSearchParams(location.search).get('shadow')==='1';
 const tagRecs=(typeof KTAGS!=='undefined'&&KTAGS.page&&KTAGS.page.records)?KTAGS.page.records:[];
 add('signature laccolith flora guilds placed on station',HCHK.stationSpecies(window._station,SKEY));
 add('station pixel verified strictly inside rmweubdnyts8y own_dm',HCHK.ownDmFootprint(SITE.px[0],SITE.px[1]));
 add('perched gnamma sky-mirrors have >= +0.04 m 360 deg rock rim freeboard',HCHK.gnammaRimSill(SITE.gnammas));
 add('zero >4 m trees on bare aprons and 100 percent garlands on shellStep01 >= 0.70',HCHK.baldApronTreeExclusion(THEDOME.TREE_RECS));
 add('62-148 Hz A-tent lithophone physics and KSPELEO.SMOKY Kluft crystals',HCHK.lithophoneAndKluft(SITE,window._kluft));
 add('vstack-graphics B1-B5 S6 KMAT_M1 roughAA and KDRAWN active',HCHK.vstackGraphics(window._vstack));
 add('sacred sanctuary reserves held clear of buildings',HCHK.reserveClean(tagRecs));
 add('100 percent of lit scene meshes carry real textures',HCHK.allTextured(null));
 add('KSHADOW off at default page load',HCHK.shadowOffDefault(qShadow,!!renderer.shadowMap.enabled));
 add('ground shader stays within <= 13 WebGL sampler budget',HCHK.samplersBudget(window._units));
 add('preset cameras >= 2.2 m clear of KDRAWN ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;
}

function hostNegatives(){
 const R=[],add=(name,r)=>R.push({name:name,failed:!r.ok,detail:r.detail});
 add('missing signature species fails station check',HCHK.stationSpecies({},SKEY));
 add('pixel outside rmweubdnyts8y or inside Spider Lake collar fails own_dm check',HCHK.ownDmFootprint(1330,185));
 add('full-stature >4 m tree on unfractured bare exfoliation apron fails',HCHK.baldApronTreeExclusion([{key:'cloudgarlandpine',H:8.5,shellStep01:0.20,inPan:false}]));
 add('missing KMAT_M1 or >3 KGROUND layers fails vstack-graphics',HCHK.vstackGraphics({m1Loaded:false,groundLayers:5}));
 add('building placed inside dome sanctuary reserve fails',HCHK.reserveClean([{id:'bad',class:'building'}]));
 add('untextured lit MeshStandardMaterial is caught',HCHK.allTextured([new THREE.MeshStandardMaterial({color:0x888888})]));
 add('shadowMap enabled at default load fails',HCHK.shadowOffDefault(false,true));
 add('ground over 13-sampler cap fails',HCHK.samplersBudget({final:15,max:16}));
 add('preset camera < 2.2 m above KDRAWN ground fails',HCHK.camerasOut([{view:'low',x:0,y:DRAWN_H(0,0)+1.0,z:0}]));
 return R;
}

KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');

const HINT=SKEY==='apron'
 ?'Onion-Skin Exfoliation Apron (1336, 128, +2,268.5 m, 1.20 atm, Cfa): curved rose-grey quartz-porphyry & leucogranite carapace stepped with 128 sky-reflecting gnamma solution pans, resurrection gnammamoss rims, twisted bonsai pines, and 3 hollow A-tent lithophone arches booming at 78-102 Hz.'
 :SKEY==='moat'
 ?'Concentric Ring-Dike Moat (1317, 117, +1,749.1 m, 1.29 atm, Cfa): radial sheetwash rills cascading down the bare inner dome toe into a tannin-amber moatpitcher & sphagnum seepage fen impounded behind an arcuate +18 dB whispering-gallery porphyry ring-dike hogback.'
 :SKEY==='crown'
 ?'Lenticular Cloud-Cap Crown (1328, 150, +2,924.8 m true apex, 1.11 atm, Cfb): bathed in The Crown-Veil stationary cap-cloud, concentric cloudgarlandpine treeline ribbons trace exfoliation step-risers around silvery crownrosette fog-cushions and site:dome-observatory.'
 :SKEY==='eastflank'
 ?'East Flank Carnelian Sky-Island & Perimeter Kill-Line (1384, 142, +2,361.1 m, 1.19 atm, Cfa): unbroken crimson Erythrophyll spire-and-fan refuge holding the upper quartz-porphyry shoulder upslope of a bone-white Ancient Kill-Line and an active solar Atmospheric Defoliant Mist-Pylon.'
 :'Radial Unloading Kluft Cleft (1372, 148, +2,537.7 m, 1.17 atm, Cfa): walkable wedged-chockstone descent into a 40 m rose-granite tension fissure lined with KSPELEO.SMOKY smoky-quartz & chlorite-dusted microcline megaprisms, breath-ferns, and barometric shimmer wisps.';

const EXPORT_BOX=[-130,-110,130,130];

KHOST.take({
 build:'thedome'+(SKEY==='apron'?'':'-'+SKEY),
 title:'Krator biome — The Dome: '+SITE.name,
 hint:HINT,
 scene:scene,camera:camera,renderer:renderer,ground:DRAWN_H,clear:2.0,registry:REG,regHas:regHas,views:VIEWS,ticks:TICKS,
 controls:CONTROLS,
 clock:{hour:ATMOS.SKY.viewHour},
 draw:SKY.draw,
 inspect:describe,
 stats:()=>'inst '+window._instances+'\n'+statusSummary(),
 layers:{
  'thedome flora & lichens':{match:o=>!!(o.userData&&o.userData.biome)},
  'exfoliation arches, hogbacks, Kluft & works':{match:o=>!!(o.userData&&o.userData.host)},
  'rings':{objects:()=>[giantRing]}
 },
 exporters:{
  biome:()=>BIO.export(),
  physics:()=>({format:'krator-thedome',version:1,site:SITE,state:DOME_STATE,vstack:window._vstack,kluft:window._kluft,placed:THEDOME.PLACED.length})
 },
 minimap:{title:SITE.name},
 budget:BUDGET,
 types:()=>BIO.stats,
 api:{
  hostChecks:hostChecks,hostNegatives:hostNegatives,
  vstack:()=>window._vstack,
  get totals(){const t=BIO.totals();return{tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._station,
  site:()=>SITE,
  placed:()=>THEDOME.PLACED,
  state:()=>DOME_STATE,
  exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','water'],
  exportBox:EXPORT_BOX,
  at:(x,z)=>{
   const y=DRAWN_H(x,z),o={h:y,asl:SITE.baseElevM+y,water:waterH(x,z)};
   FNAMES.forEach(n=>{o[n]=+FIELD[n](x,z).toFixed(3);});
   return o;
  }
 }
});
