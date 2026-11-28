// ================================================================= HOST — Arcoforte, port, cradles, rotors, Shore-kin villages, log-chute & dynamic fleets
// Runs at 86 (after 84-host-ground.js builds GROUND & KDRAWN.grid, before 88-host-place.js places flora and 89v builds cove water):
// 1. Instantiates FCOVE_WORLD (FCOVE_SIM.create + 92-day run) and pre-registers all settlement sites, 5 Shore-kin villages,
//    219 SKK buildings, spar log-chute, harbour works, cradles, port segments, rotors, mill, causeway, and 36 vessels in KTAGS.page BEFORE drawing.
// 2. Seats Arcoforte (FCOVE_ARCOFORTE) on the +76..+84 m eastern cliff-prow, watching its ruined zones on KRUINS.
// 3. Seats salvaged Ancient port segments (slPen, ddShed, ddYard at d = 3) along the sheltered +6 m shipyard quay.
// 4. Builds the three stepped graving cradles, Paktong Reverberatory Smelt-Hearth, Impounding Basin & Tide-Mill,
//    4-rotor Sill-Race Turbine Array, -6.0 m White Stacks Causeway, and the 540 m 3D Timber Spar Log-Chute.
// 5. Seats all 5 Shore-kin client hinterland villages + Harbour Client Work-Bench (SKK.proto merged by material into ~28 draw calls).
// 6. Moors the 4 Caretaker guard-hulls + 5 dynamic visiting Sea-Nomad fleets (30 berths across ward_ring, smelt_fleet,
//    trench_fleet, outer_whalers, island_traders) synced live to KCAMP.fleetsAt(W, 'arcoforte', day).
const FCOVE_SCENE=(function buildFcoveWorksAndFleet(){
 const LY=FCOVE_LAYOUT,AF=LY.arcoforte,TG=KTAGS.page;
 if(typeof KTAGS!=='undefined'&&KTAGS.VOCAB&&KTAGS.VOCAB.cultureAlias){
  const V=KTAGS.VOCAB;
  if(!V.cultureAlias.fleetborn)V.cultureAlias.fleetborn={culture:'islander',style:'fleetborn'};
  if(!V.cultureAlias['cflit-qbon'])V.cultureAlias['cflit-qbon']={culture:'islander',style:'fleetborn'};
  if(!V.cultureAlias.shorekin)V.cultureAlias.shorekin={culture:'islander',style:'shorekin'};
  if(!V.cultureAlias['shore-kin'])V.cultureAlias['shore-kin']={culture:'islander',style:'shorekin'};
 }

 const out={
  arcoforte:null,
  world:null,
  villagesGroup:null,
  villageMeshes:0,
  villagePlacedCount:0,
  sparChute:{bents:0,logs:0,lengthM:LY.sparChute.lengthM},
  portGroups:[],
  careened:[],
  moored:[],
  caretakerGroup:null,
  fleetGroups:{},
  activeFleetIds:[],
  activeFleetCount:0,
  activeMooredCount:0,
  mootPop:0,
  syncedDay:-1,
  syncFleetsForDay:null,
  rotorHubs:[],
  millWheel:null,
  hearthGlowMat:null,
  basinWaterMesh:null,
  tagIds:[]
 };

 /* ---------------- 1. INSTANTIATE FCOVE_SIM & PRE-REGISTER EVERYTHING IN KTAGS.PAGE BEFORE DRAWING ---------------- */
 const FCOVE_WORLD=FCOVE_SIM.create({
  layout:LY,
  khamlet:KHAMLET,
  kcamp:KCAMP,
  sim:SIM,
  tideRules:FCOVE_RULES,
  terrainH:terrainH,
  waterH:waterH,
  skDims:(typeof SKK!=='undefined'&&SKK&&SKK.dims)?SKK.dims():null,
  tags:TG
 });
 FCOVE_WORLD.runDays(0,92);
 out.world=FCOVE_WORLD;
 window.FCOVE_WORLD=FCOVE_WORLD;
 for(let i=0;i<FCOVE_WORLD.tagIds.length;i++)out.tagIds.push(FCOVE_WORLD.tagIds[i]);

 /* Update or add site:fleetborn-arcoforte with full 576 m horseshoe polygon */
 {
  const existing=TG.query({key:'site:fleetborn-arcoforte'});
  const py=terrainH(AF.x,AF.z);
  if(existing&&existing.length){
   const hit=existing[0];
   hit.at=[AF.x,py,AF.z];
   hit.r=320;
   hit.poly=AF.footprint;
   hit.note='576 m Soleri Arcoforte horseshoe cliff-prow and sub-cliff harbour reserve';
  }else{
   TG.add({
    id:'site:fleetborn-arcoforte',
    'class':'landmark',
    kind:'site',
    key:'site:fleetborn-arcoforte',
    name:'Fleetborn Cove — Arcoforte Prow Reserve',
    at:[AF.x,py,AF.z],
    r:320,
    poly:AF.footprint,
    tags:{landmark:true}
   });
  }
 }

 LY.cradles.forEach(c=>{
  const p=LY.XZ(c.s,c.a0+c.len*0.5);
  const rec=TG.add({
   id:'fcove.'+c.id,
   'class':'building',
   kind:'drydock',
   key:'fcove:'+c.id,
   name:c.name,
   at:[+p[0].toFixed(2),c.blocks,+p[1].toFixed(2)],
   size:[c.w,c.len,c.deckY-c.pitFloor],
   tags:{culture:'cflit-qbon',types:['infrastructure','industry'],state:'intact'}
  });
  out.tagIds.push(rec.id);
 });

 {
  const sh=LY.smeltHearth;
  const rec=TG.add({
   id:sh.id,
   'class':'building',
   kind:'foundry',
   key:'fcove:paktong_smelt_hearth',
   name:sh.name,
   at:[sh.x,sh.y,sh.z],
   r:sh.r,
   h:sh.h,
   tags:{culture:'cflit-qbon',types:['industry'],state:'intact'}
  });
  out.tagIds.push(rec.id);
 }

 LY.portSegs.forEach(ps=>{
  const rec=TG.add({
   id:ps.id,
   'class':'building',
   kind:'port_segment',
   key:'port:'+ps.key,
   name:ps.name,
   at:[ps.x,LY.yardDeckY,ps.z],
   size:[ps.W,ps.LAND+ps.SEA,28],
   tags:{culture:'ancient',types:['infrastructure','industry'],state:'intact'}
  });
  out.tagIds.push(rec.id);
 });

 {
  const tm=LY.tideMill;
  const rec=TG.add({
   id:tm.id,
   'class':'building',
   kind:'tide_mill',
   key:'fcove:impounding_tide_mill',
   name:tm.name,
   at:[tm.x,0,tm.z],
   size:[tm.w,tm.basinLen+14,16],
   tags:{culture:'cflit-qbon',types:['industry','infrastructure'],state:'intact'}
  });
  out.tagIds.push(rec.id);
 }

 {
  const sr=LY.sillRotors;
  const rec=TG.add({
   id:sr.id,
   'class':'building',
   kind:'tidal_rotors',
   key:'fcove:sill_paktong_rotors',
   name:sr.name,
   at:[sr.x,-5.6,sr.z],
   r:98,
   h:20,
   tags:{culture:'cflit-qbon',types:['infrastructure','industry'],state:'intact',landmark:true}
  });
  out.tagIds.push(rec.id);
 }

 {
  const cw=LY.causeway;
  const rec=TG.add({
   id:cw.id,
   'class':'building',
   kind:'causeway',
   key:'fcove:white_stacks_causeway',
   name:cw.name,
   at:[cw.x,cw.crestY,cw.z],
   size:[cw.width+6,cw.aEnd-cw.aStart,6],
   tags:{culture:'cflit-qbon',types:['infrastructure','farm'],state:'intact'}
  });
  out.tagIds.push(rec.id);
 }

 /* Pre-register careened hulls, 4 Caretaker House guard-hulls, and all 30 visiting Nomad Fleet berths */
 LY.cradles.forEach(c=>{
  if(!c.vesselKey)return;
  const p=LY.XZ(c.s,c.a0+c.len*0.48);
  const dim=(typeof FCOVE_RINGSEA!=='undefined'&&FCOVE_RINGSEA.dims[c.vesselKey])?FCOVE_RINGSEA.dims[c.vesselKey]:{L:36,B:14,H:20,name:c.vesselKey};
  const rec=TG.add({
   id:'fcove.careened.'+c.id,
   'class':'prop',
   kind:'vessel',
   key:'ringsea:'+c.vesselKey,
   name:'Careened '+dim.name+' ('+c.name+')',
   at:[+p[0].toFixed(2),c.blocks,+p[1].toFixed(2)],
   size:[dim.B,dim.L,dim.H],
   tags:{culture:'cflit-qbon',types:['infrastructure','dwelling-multi']}
  });
  out.tagIds.push(rec.id);
 });

 const caretakerSpecs=FCOVE_SIM.CARETAKER_HULLS.map((ch,ci)=>{
  const ca=LY.centerA(ch.s)+ch.da,p=LY.XZ(ch.s,ca);
  const yaw=Math.atan2(-LY.axis[1]*ch.bowS,LY.axis[0]*ch.bowS)+(ci-1.5)*0.04;
  const dim=(typeof FCOVE_RINGSEA!=='undefined'&&FCOVE_RINGSEA.dims[ch.rsKey])?FCOVE_RINGSEA.dims[ch.rsKey]:{L:28,B:12,H:16,name:ch.rsKey};
  const rec=TG.add({
   id:ch.id,
   'class':'prop',
   kind:'vessel',
   key:'ringsea:'+ch.rsKey,
   name:ch.name,
   at:[+p[0].toFixed(2),0,+p[1].toFixed(2)],
   size:[dim.B,dim.L,dim.H],
   tags:{culture:'cflit-qbon',types:['dwelling-multi','infrastructure']}
  });
  out.tagIds.push(rec.id);
  return{
   id:ch.id,
   fleetId:'caretaker_house',
   rsKey:ch.rsKey,
   ruleKey:ch.ruleKey,
   name:ch.name,
   culture:ch.culture,
   x:+p[0].toFixed(2),
   z:+p[1].toFixed(2),
   yaw:+yaw.toFixed(4),
   r:ch.r
  };
 });

 LY.fleetSlots.forEach(v=>{
  const dim=(typeof FCOVE_RINGSEA!=='undefined'&&FCOVE_RINGSEA.dims[v.rsKey])?FCOVE_RINGSEA.dims[v.rsKey]:{L:28,B:12,H:16,name:v.rsKey};
  const cul=v.culture==='hueru-kuran'?'hueru-kuran':'cflit-qbon';
  const rec=TG.add({
   id:v.id,
   'class':'prop',
   kind:'vessel',
   key:'ringsea:'+v.rsKey,
   name:v.name,
   at:[v.x,0,v.z],
   size:[dim.B,dim.L,dim.H],
   tags:{culture:cul,types:v.rsKey==='arkSmelter'?['industry']:['dwelling-multi','infrastructure']}
  });
  out.tagIds.push(rec.id);
 });

 /* ---------------- 2. SEAT ARCOFORTE ON THE EASTERN CLIFF-PROW ---------------- */
 if(typeof FCOVE_ARCOFORTE!=='undefined'&&FCOVE_ARCOFORTE.build){
  out.arcoforte=FCOVE_ARCOFORTE.build({
   scene:scene,
   renderer:renderer,
   frame:AF,
   tags:TG,
   register:REGISTER,
   walk:typeof KWALK!=='undefined'?KWALK:null,
   ruins:typeof KRUINS!=='undefined'?KRUINS:null,
   drawn:typeof KDRAWN!=='undefined'?KDRAWN:null
  });
 }

 /* ---------------- 3. SEAT SALVAGED ANCIENT PORT SEGMENTS (d = 3) ---------------- */
 if(typeof FCOVE_PORT!=='undefined'&&FCOVE_PORT.placeSeg){
  LY.portSegs.forEach(ps=>{
   const g=FCOVE_PORT.placeSeg(ps.key,ps.x,ps.z,ps.yaw,ps.d,{
    scene:scene,
    register:REGISTER,
    ground:terrainH
   });
   if(g)out.portGroups.push({spec:ps,group:g});
  });
 }

 /* ---------------- 4. DRAW CRADLES, HEARTH, TIDE-MILL, ROTORS, CAUSEWAY, LOG-CHUTE & VILLAGE PLINTHS ---------------- */
 const M_CONC=new THREE.MeshStandardMaterial({color:0x8a8377,roughness:0.9,metalness:0.03});
 const M_STONE=new THREE.MeshStandardMaterial({color:0x4b524c,roughness:0.92,metalness:0.02});
 const M_SERP=new THREE.MeshStandardMaterial({color:0x3f5448,roughness:0.88,metalness:0.03});
 const M_LATERITE=new THREE.MeshStandardMaterial({color:0x8c4732,roughness:0.90,metalness:0.02});
 const M_TUFA=new THREE.MeshStandardMaterial({color:0xd8d2c4,roughness:0.82,metalness:0.02});
 const M_TIMB=new THREE.MeshStandardMaterial({color:0x5e3824,roughness:0.84,metalness:0.02});
 const M_SPAR=new THREE.MeshStandardMaterial({color:0xb5884e,roughness:0.74,metalness:0.02});
 const M_PAK=new THREE.MeshStandardMaterial({color:0xd8d4c8,roughness:0.28,metalness:0.84});
 const M_BRZ=new THREE.MeshStandardMaterial({color:0x9e7638,roughness:0.38,metalness:0.72});
 const M_JADE=new THREE.MeshStandardMaterial({color:0x237a52,roughness:0.26,metalness:0.08,emissive:0x0c3422,emissiveIntensity:0.45});
 const M_BYSSUS=new THREE.MeshStandardMaterial({color:0xd4a438,roughness:0.46,metalness:0.34});
 const M_HEARTH=new THREE.MeshStandardMaterial({color:0xff7824,emissive:0xe85814,emissiveIntensity:1.4,roughness:0.6});
 out.hearthGlowMat=M_HEARTH;

 /* Merged geometry accumulator for static cove works, spar chute & village plinths */
 const BK=new Map();
 const worksProbe=[];
 function addGeo(mat,geo){
  let list=BK.get(mat);
  if(!list){list=[];BK.set(mat,list);}
  list.push(geo);
 }
 function putBox(mat,wx,wy,wz,sx,sy,sz,yaw){
  const g=new THREE.BoxGeometry(sx,sy,sz);
  if(yaw)g.rotateY(yaw);
  g.translate(wx,wy,wz);
  addGeo(mat,g);
  worksProbe.push(wx,wy,wz);
 }
 function putCyl(mat,wx,wy,wz,rt,rb,h,segs,yaw,rx){
  const g=new THREE.CylinderGeometry(rt,rb,h,segs==null?12:segs);
  if(rx)g.rotateX(rx);
  if(yaw)g.rotateY(yaw);
  g.translate(wx,wy,wz);
  addGeo(mat,g);
  worksProbe.push(wx,wy,wz);
 }
 function putBeam(mat,a,b,r){
  const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz);
  if(L<0.05)return;
  const g=new THREE.CylinderGeometry(r,r,L,8);
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/L,dy/L,dz/L));
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));
  g.translate((a[0]+b[0])*0.5,(a[1]+b[1])*0.5,(a[2]+b[2])*0.5);
  addGeo(mat,g);
 }

 const shoreYaw=Math.atan2(LY.across[0],LY.across[1]);

 /* 4A. Quay apron wall, Harbour Client Work-Bench retaining terrace (+9.2 m) & Three Stepped Graving Cradles */
 {
  for(let s=6;s<=102;s+=12){
   const qA=LY.quayA(s),p=LY.XZ(s,qA+52);
   putBox(M_CONC,p[0],LY.yardDeckY-0.35,p[1],12.4,0.7,104,shoreYaw);
  }
  /* Retaining wall & stone steps for the +9.2 m Shore-kin Harbour Client Work-Bench */
  for(let s=26;s<=154;s+=16){
   const qA=LY.quayA(s),pW=LY.XZ(s,qA+88),pDeck=LY.XZ(s,qA+116);
   putBox(M_SERP,pW[0],(LY.yardDeckY+LY.harbourBenchY)*0.5-0.4,pW[1],16.4,LY.harbourBenchY-LY.yardDeckY+1.2,2.6,shoreYaw);
   putBox(M_CONC,pDeck[0],LY.harbourBenchY-0.25,pDeck[1],16.4,0.6,54,shoreYaw);
  }
  {
   const qSt=LY.quayA(96);
   for(let st=0;st<8;st++){
    const f=(st+0.5)/8,ps=LY.XZ(96,qSt+84+st*0.85);
    putBox(M_TUFA,ps[0],LY.yardDeckY+f*(LY.harbourBenchY-LY.yardDeckY)*0.5,ps[1],6.4,f*(LY.harbourBenchY-LY.yardDeckY),1.1,shoreYaw);
   }
  }

  LY.cradles.forEach((c,ci)=>{
   const midA=c.a0+c.len*0.5,pMid=LY.XZ(c.s,midA);
   putBox(M_CONC,pMid[0],c.pitFloor-0.4,pMid[1],c.w+4,0.8,c.len+4,shoreYaw);
   const nSteps=4,totH=c.deckY-c.pitFloor;
   for(let st=0;st<nSteps;st++){
    const f=(st+1)/nSteps,yTop=c.pitFloor+totH*f,hSt=yTop-(c.pitFloor-0.5);
    for(const side of[-1,1]){
     const sW=c.s+side*(c.w*0.5-1.6+(st*0.9));
     const pw=LY.XZ(sW,midA);
     putBox(M_CONC,pw[0],(c.pitFloor-0.5)+hSt*0.5,pw[1],2.4,hSt,c.len+2,shoreYaw);
    }
    const pHead=LY.XZ(c.s,c.a0+c.len+1.2+st*0.8);
    putBox(M_CONC,pHead[0],(c.pitFloor-0.5)+hSt*0.5,pHead[1],c.w+3,hSt,2.6,shoreYaw);
   }
   const pSill=LY.XZ(c.s,c.a0+1.1);
   const sillH=Math.max(0.8,c.sill-(c.pitFloor-0.6));
   putBox(M_CONC,pSill[0],(c.pitFloor-0.6)+sillH*0.5,pSill[1],c.w,sillH,2.4,shoreYaw);
   for(const side of[-1,1]){
    const pGate=LY.XZ(c.s+side*(c.w*0.42),c.a0+0.6);
    putBox(M_PAK,pGate[0],c.sill+3.2,pGate[1],1.1,6.8,4.6,shoreYaw+side*0.48);
    const pBoll=LY.XZ(c.s+side*(c.w*0.5+2.2),c.a0+2.0);
    putCyl(M_PAK,pBoll[0],c.deckY+0.55,pBoll[1],0.38,0.46,1.1,10,0,0);
   }
   const keelOffsets=c.id==='cradle_shallow'?[0]:[-4.7,4.7];
   const blockH=Math.max(0.35,c.blocks-c.pitFloor);
   for(let dA=6;dA<=c.len-6;dA+=3.4){
    for(let ki=0;ki<keelOffsets.length;ki++){
     const ko=keelOffsets[ki],pk=LY.XZ(c.s+ko,c.a0+dA);
     putBox(M_CONC,pk[0],c.pitFloor+blockH*0.35,pk[1],1.8,blockH*0.7,1.3,shoreYaw);
     putBox(M_TIMB,pk[0],c.pitFloor+blockH*0.85,pk[1],1.9,blockH*0.3,1.4,shoreYaw);
    }
    if(dA>10&&dA<c.len-10&&Math.round(dA)%6===0){
     for(const side of[-1,1]){
      const pAlt=LY.XZ(c.s+side*(c.w*0.5-1.5),c.a0+dA);
      const pHull=LY.XZ(c.s+side*(c.id==='cradle_shallow'?2.2:5.8),c.a0+dA);
      putBeam(M_TIMB,[pAlt[0],c.blocks+1.6,pAlt[1]],[pHull[0],c.blocks+2.8,pHull[1]],0.16);
     }
    }
   }
   if(ci===0){
    const pL=LY.XZ(c.s-c.w*0.55,c.a0+c.len-4),pR=LY.XZ(c.s+c.w*0.55,c.a0+c.len-4),pBack=LY.XZ(c.s,c.a0+c.len+14);
    const pTop=LY.XZ(c.s,c.a0+c.len-9);
    const top=[pTop[0],c.deckY+17.5,pTop[1]];
    putBeam(M_TIMB,[pL[0],c.deckY,pL[1]],top,0.38);
    putBeam(M_TIMB,[pR[0],c.deckY,pR[1]],top,0.38);
    putBeam(M_PAK,[pBack[0],c.deckY,pBack[1]],top,0.14);
    putCyl(M_PAK,top[0],top[1]-4.0,top[2],0.08,0.08,8.0,8,0,0);
   }
   REGISTER({name:c.name,x:pMid[0],y:c.pitFloor,z:pMid[1],r:Math.max(16,c.len*0.55),h:c.deckY-c.pitFloor+14});
   if(typeof KWALK!=='undefined'){
    for(const side of[-1,1]){
     const pq=LY.XZ(c.s+side*(c.w*0.5+4),midA);
     KWALK.floor({rect:[pq[0]-6,pq[0]+6,pq[1]-22,pq[1]+22],y:c.deckY,name:c.name+' Quay'});
    }
   }

   if(c.vesselKey&&typeof FCOVE_RINGSEA!=='undefined'){
    const made=FCOVE_RINGSEA.make(c.vesselKey);
    if(made&&made.group){
     const pv=LY.XZ(c.s,c.a0+c.len*0.48);
     const g=made.group;
     const bowOutYaw=Math.atan2(LY.across[1],-LY.across[0]);
     const initY=FCOVE_RULES.hullWaterlineY(0,c.id,{draft:c.vesselDraft});
     g.position.set(pv[0],initY,pv[1]);
     g.rotation.y=bowOutYaw;
     g.userData.inspectLabel='Careened '+c.vesselKey+' in '+c.name+' (blocks '+c.blocks.toFixed(1)+' m)';
     const foamMeshes=[];
     g.traverse(m=>{
      if(m.isMesh&&m.material&&m.material.transparent&&m.material.opacity<0.6)foamMeshes.push(m);
     });
     scene.add(g);
     out.careened.push({cradle:c,group:g,foamMeshes:foamMeshes,x:pv[0],z:pv[1]});
    }
   }
  });
 }

 /* 4B. Paktong Reverberatory Smelt-Hearth Cupola */
 {
  const sh=LY.smeltHearth;
  putCyl(M_STONE,sh.x,sh.y+2.2,sh.z,9.6,10.8,4.4,16,0,0);
  putCyl(M_TUFA,sh.x,sh.y+6.8,sh.z,6.8,9.2,4.8,16,0,0);
  putCyl(M_PAK,sh.x,sh.y+11.8,sh.z,2.4,6.6,5.2,16,0,0);
  for(const off of[-2.8,2.8]){
   const pf=LY.XZ(sh.s+off,sh.a);
   putCyl(M_CONC,pf[0],sh.y+15.6,pf[1],0.95,1.35,7.6,12,0,0);
   putCyl(M_PAK,pf[0],sh.y+19.6,pf[1],1.15,0.95,0.6,12,0,0);
  }
  const pMouth=LY.XZ(sh.s,sh.a-9.4);
  putBox(M_HEARTH,pMouth[0],sh.y+2.4,pMouth[1],3.4,2.8,1.2,shoreYaw);
  for(let i=0;i<4;i++){
   const pi=LY.XZ(sh.s-8+i*5.2,sh.a-13.5);
   putBox(M_PAK,pi[0],sh.y+0.6,pi[1],2.4,1.2,1.4,shoreYaw);
  }
  REGISTER({name:sh.name,x:sh.x,y:sh.y,z:sh.z,r:16,h:21});
 }

 /* 4C. Impounding Basin Weir Wall, Flap-Gates, 9.6 m Paktong Tide-Wheel, Stamping Mill & Rope-Walk */
 {
  const tm=LY.tideMill;
  putBox(M_STONE,tm.x,(tm.weirTop-8)*0.5,tm.z,tm.w,tm.weirTop+8,4.2,shoreYaw);
  for(const side of[-1,1]){
   const pSide=LY.XZ(tm.s+side*(tm.w*0.5),tm.aWeir+tm.basinLen*0.5);
   putBox(M_STONE,pSide[0],(tm.weirTop-6)*0.5,pSide[1],3.6,tm.weirTop+6,tm.basinLen,shoreYaw);
  }
  for(const ds of[-16,0,16]){
   const pg=LY.XZ(tm.s+ds,tm.aWeir-2.2);
   putBox(M_BRZ,pg[0],2.6,pg[1],3.6,3.8,0.45,shoreYaw);
  }
  const pHouse=LY.XZ(tm.s-12,tm.aWeir+4);
  putBox(M_CONC,pHouse[0],tm.weirTop+3.4,pHouse[1],14,6.8,12,shoreYaw);
  putBox(M_TIMB,pHouse[0],tm.weirTop+7.6,pHouse[1],15.2,1.8,13.2,shoreYaw);
  const pWalk=LY.XZ(tm.s+22,tm.aWeir+26);
  putBox(M_TIMB,pWalk[0],LY.yardDeckY+2.2,pWalk[1],7.5,4.4,54,shoreYaw);

  const wheelGrp=new THREE.Group();
  const pWh=LY.XZ(tm.s-12,tm.aWeir-3.2);
  wheelGrp.position.set(pWh[0],1.6,pWh[1]);
  wheelGrp.rotation.y=shoreYaw;
  const rimG=new THREE.TorusGeometry(tm.wheelR,0.28,8,24);
  rimG.rotateY(Math.PI/2);
  wheelGrp.add(new THREE.Mesh(rimG,M_PAK));
  const axleM=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,3.4,10),M_BRZ);
  axleM.rotation.z=Math.PI/2;
  wheelGrp.add(axleM);
  for(let b=0;b<16;b++){
   const ang=b/16*Math.PI*2;
   const paddle=new THREE.Mesh(new THREE.BoxGeometry(2.6,0.18,1.35),M_PAK);
   paddle.position.set(0,Math.cos(ang)*tm.wheelR,Math.sin(ang)*tm.wheelR);
   paddle.rotation.x=-ang;
   wheelGrp.add(paddle);
  }
  wheelGrp.userData.inspectLabel='Paktong Tide-Mill Wheel (driven by impounding basin ebb head)';
  scene.add(wheelGrp);
  out.millWheel=wheelGrp;

  const bGeo=new THREE.PlaneGeometry(tm.w-6,tm.basinLen-4);
  bGeo.rotateX(-Math.PI/2);
  const bMat=new THREE.MeshStandardMaterial({color:0x1e606e,roughness:0.14,metalness:0.08,transparent:true,opacity:0.86});
  const bMesh=new THREE.Mesh(bGeo,bMat);
  bMesh.position.set(tm.basinX,3.5,tm.basinZ);
  bMesh.rotation.y=shoreYaw;
  bMesh.userData.probeSkip=true;
  bMesh.userData.inspectLabel='Impounding Tide-Mill Basin (fills at dayHighest through flap-gates)';
  scene.add(bMesh);
  out.basinWaterMesh=bMesh;
  REGISTER({name:tm.name,x:tm.x,y:-2,z:tm.z,r:34,h:18});
 }

 /* 4D. NNW Sill-Throat Reversible Paktong Rotor Array */
 {
  const sr=LY.sillRotors;
  const sillYaw=Math.atan2(LY.axis[0],LY.axis[1]);
  sr.units.forEach((u,ui)=>{
   putBox(M_CONC,u.x,(u.pierTopY+u.bedY)*0.5,u.z,6.4,u.pierTopY-u.bedY,11.5,sillYaw);
   putCyl(M_PAK,u.x,0.5*(u.hubY+u.pierTopY+2.4),u.z,0.34,0.34,u.pierTopY+2.4-u.hubY,10,0,0);
   putCyl(M_BRZ,u.x,u.pierTopY+2.6,u.z,1.35,1.55,1.4,12,0,0);
   if(ui===1||ui===2){
    putCyl(M_CONC,u.x,u.pierTopY+5.2,u.z,0.7,1.0,4.2,10,0,0);
    putCyl(M_JADE,u.x,u.pierTopY+8.0,u.z,0.85,0.85,1.5,10,0,0);
   }
   const hub=new THREE.Group();
   hub.position.set(u.x,u.hubY,u.z);
   hub.rotation.y=sillYaw;
   const nose=new THREE.Mesh(new THREE.ConeGeometry(0.85,2.4,12),M_PAK);
   nose.rotation.x=Math.PI/2;
   hub.add(nose);
   const noseB=new THREE.Mesh(new THREE.ConeGeometry(0.85,2.4,12),M_PAK);
   noseB.rotation.x=-Math.PI/2;
   hub.add(noseB);
   const shroud=new THREE.Mesh(new THREE.TorusGeometry(u.bladeR+0.25,0.26,8,20),M_CONC);
   hub.add(shroud);
   const spinner=new THREE.Group();
   for(let b=0;b<5;b++){
    const ang=b/5*Math.PI*2;
    const bl=new THREE.Mesh(new THREE.BoxGeometry(0.22,u.bladeR*0.92,0.88),M_PAK);
    bl.position.set(Math.cos(ang)*u.bladeR*0.48,Math.sin(ang)*u.bladeR*0.48,0);
    bl.rotation.z=ang-Math.PI/2;
    bl.rotation.y=0.42;
    spinner.add(bl);
   }
   hub.add(spinner);
   hub.userData.inspectLabel='Reversible Paktong Sill-Race Rotor #'+(ui+1)+' (|v|^3 shaft power)';
   scene.add(hub);
   out.rotorHubs.push({unit:u,group:hub,spinner:spinner});
  });
  putBeam(M_PAK,[sr.units[0].x,sr.units[0].pierTopY+0.8,sr.units[0].z],[sr.units[1].x,sr.units[1].pierTopY+0.8,sr.units[1].z],0.35);
  putBeam(M_PAK,[sr.units[2].x,sr.units[2].pierTopY+0.8,sr.units[2].z],[sr.units[3].x,sr.units[3].pierTopY+0.8,sr.units[3].z],0.35);
  REGISTER({name:sr.name,x:sr.x,y:-11,z:sr.z,r:96,h:24});
 }

 /* 4E. Low-Water -6.0 m White Stacks Causeway, Tide-Gauge Posts & Golden Sea-Byssus Beds */
 {
  const cw=LY.causeway,nSeg=18;
  for(let i=0;i<=nSeg;i++){
   const u=i/nSeg,a=cw.aStart+(cw.aEnd-cw.aStart)*u,p=LY.XZ(cw.s,a);
   const yTop=u<0.18?(2.4+(cw.crestY-2.4)*(u/0.18)):cw.crestY;
   putBox(i%3===0?M_TUFA:M_STONE,p[0],yTop-1.1,p[1],cw.width,2.2,5.6,shoreYaw);
   if(i>=4&&i%2===0){
    for(const side of[-1,1]){
     const pb=LY.XZ(cw.s+side*(cw.width*0.5+1.4),a);
     putCyl(M_BYSSUS,pb[0],cw.byssusY+0.25,pb[1],1.15,1.45,0.55,8,0,0);
    }
   }
  }
  for(let k=0;k<4;k++){
   const pSt=LY.XZ(cw.s+(k-1.5)*4.2,cw.aEnd+3.5+(k%2)*2.8);
   const hSt=5.8+k*1.3;
   putCyl(M_TUFA,pSt[0],cw.crestY-1.5+hSt*0.5,pSt[1],0.75,1.85,hSt,10,0,0);
  }
  const pGauge=LY.XZ(cw.s+cw.width*0.45,cw.aStart+26);
  putCyl(M_PAK,pGauge[0],1.0,pGauge[1],0.22,0.28,15.2,10,0,0);
  for(const markY of[-6.0,0.0,5.6,6.6]){
   putCyl(markY>=5.6?M_JADE:M_BRZ,pGauge[0],markY,pGauge[1],0.56,0.56,0.24,12,0,0);
  }
  REGISTER({name:cw.name,x:cw.x,y:cw.crestY-2,z:cw.z,r:52,h:16});
 }

 /* 4F. 540 m 3D Timber Spar Log-Chute from Kauri-Chute (village_spars) down to the Southern Cove Boatyard */
 {
  const sc=LY.sparChute;
  const hx=sc.headXZ[0],hz=sc.headXZ[1],fx=sc.footXZ[0],fz=sc.footXZ[1];
  const dx=fx-hx,dz=fz-hz,L=Math.hypot(dx,dz);
  const ux=dx/L,uz=dz/L,nx=-uz,nz=ux;
  const chuteYaw=Math.atan2(ux,uz);
  const nB=sc.nBents;
  const hStart=terrainH(hx,hz)+2.4;
  const hEnd=Math.max(terrainH(fx,fz),LY.yardDeckY)+2.2;
  const nodes=[];
  for(let i=0;i<=nB;i++){
   const t=i/nB,px=hx+dx*t,pz=hz+dz*t;
   const gh=terrainH(px,pz);
   const yIdeal=lerp(hStart,hEnd,Math.pow(t,0.92));
   const cy=Math.max(gh+2.2,yIdeal);
   nodes.push({t:t,x:px,z:pz,gh:gh,y:cy});
  }
  /* Smooth one pass upward so trough never kinks over an intermediate rock rib */
  for(let pass=0;pass<3;pass++){
   for(let i=1;i<nB;i++){
    const avg=0.5*(nodes[i-1].y+nodes[i+1].y);
    nodes[i].y=Math.max(nodes[i].gh+2.1,Math.max(nodes[i].y,avg));
   }
  }
  /* Bents: battered mangrove/Araucaria trestle legs anchored 1.5 m into rock + cross-caps + sway X-braces */
  for(let i=0;i<=nB;i++){
   const nd=nodes[i],legH=nd.y-nd.gh;
   const spreadTop=1.75,spreadBot=1.75+Math.min(5.5,legH*0.20);
   const yFoot=nd.gh-1.5;
   const pLT=[nd.x-nx*spreadTop,nd.y-0.35,nd.z-nz*spreadTop];
   const pRT=[nd.x+nx*spreadTop,nd.y-0.35,nd.z+nz*spreadTop];
   const pLB=[nd.x-nx*spreadBot,yFoot,nd.z-nz*spreadBot];
   const pRB=[nd.x+nx*spreadBot,yFoot,nd.z+nz*spreadBot];
   putBeam(M_TIMB,pLB,pLT,0.28);
   putBeam(M_TIMB,pRB,pRT,0.28);
   putBeam(M_TIMB,[nd.x-nx*(spreadTop+0.45),nd.y-0.32,nd.z-nz*(spreadTop+0.45)],[nd.x+nx*(spreadTop+0.45),nd.y-0.32,nd.z+nz*(spreadTop+0.45)],0.24);
   putBox(M_SERP,pLB[0],nd.gh-0.25,pLB[2],1.4,1.3,1.4,chuteYaw);
   putBox(M_SERP,pRB[0],nd.gh-0.25,pRB[2],1.4,1.3,1.4,chuteYaw);
   if(legH>4.5){
    const yMid=0.5*(nd.gh+nd.y-0.35);
    const spM=0.5*(spreadTop+spreadBot);
    putBeam(M_TIMB,[nd.x-nx*spM,yMid,nd.z-nz*spM],[nd.x+nx*spM,nd.y-0.45,nd.z+nz*spM],0.14);
    putBeam(M_TIMB,[nd.x+nx*spM,yMid,nd.z+nz*spM],[nd.x-nx*spM,nd.y-0.45,nd.z-nz*spM],0.14);
   }
   if(i%2===0){
    putBox(M_PAK,nd.x,nd.y+0.12,nd.z,3.6,0.34,0.42,chuteYaw);
   }
   worksProbe.push(nd.x,nd.y,nd.z);
  }
  /* Continuous V-trough flume cheeks, bottom keel runner, catwalk & peeled Araucaria spar logs sliding down */
  let logCount=0;
  for(let i=0;i<nB;i++){
   const A=nodes[i],B=nodes[i+1];
   putBeam(M_TIMB,[A.x,A.y-0.18,A.z],[B.x,B.y-0.18,B.z],0.26);
   for(const side of[-1,1]){
    putBeam(M_TIMB,[A.x+nx*side*1.28,A.y+0.42,A.z+nz*side*1.28],[B.x+nx*side*1.28,B.y+0.42,B.z+nz*side*1.28],0.24);
    putBeam(M_TIMB,[A.x+nx*side*0.72,A.y+0.02,A.z+nz*side*0.72],[B.x+nx*side*0.72,B.y+0.02,B.z+nz*side*0.72],0.22);
   }
   /* Side inspection boardwalk */
   putBeam(M_TIMB,[A.x+nx*2.05,A.y-0.12,A.z+nz*2.05],[B.x+nx*2.05,B.y-0.12,B.z+nz*2.05],0.22);
   if(i%2===0){
    const la=lerp(A.x,B.x,0.12),lza=lerp(A.z,B.z,0.12),lya=lerp(A.y,B.y,0.12)+0.42;
    const lb=lerp(A.x,B.x,0.86),lzb=lerp(A.z,B.z,0.86),lyb=lerp(A.y,B.y,0.86)+0.42;
    putBeam(M_SPAR,[la,lya,lza],[lb,lyb,lzb],0.34);
    logCount++;
   }
  }
  /* Head rollway deck & loading sheerlegs at Kauri-Chute + boatyard catch-crib & spar rack at foot */
  {
   const H0=nodes[0],F0=nodes[nB];
   putBox(M_SERP,H0.x-ux*6,H0.gh+0.7,H0.z-uz*6,11.5,2.6,10.5,chuteYaw);
   putBeam(M_TIMB,[H0.x-nx*4.2,H0.gh,H0.z-nz*4.2],[H0.x,H0.y+7.2,H0.z],0.28);
   putBeam(M_TIMB,[H0.x+nx*4.2,H0.gh,H0.z+nz*4.2],[H0.x,H0.y+7.2,H0.z],0.28);
   for(let k=0;k<4;k++){
    const sx0=H0.x-ux*(4.5+k*0.95)-nx*3.8,sz0=H0.z-uz*(4.5+k*0.95)-nz*3.8;
    const sx1=H0.x-ux*(4.5+k*0.95)+nx*3.8,sz1=H0.z-uz*(4.5+k*0.95)+nz*3.8;
    putBeam(M_SPAR,[sx0,H0.gh+2.35,sz0],[sx1,H0.gh+2.35,sz1],0.32);
   }
   putBox(M_SERP,F0.x+ux*5.5,F0.gh+0.9,F0.z+uz*5.5,12.5,3.2,13.5,chuteYaw);
   for(let k=0;k<5;k++){
    const bx0=F0.x+ux*(2.2+k*1.35)-nx*4.6,bz0=F0.z+uz*(2.2+k*1.35)-nz*4.6;
    const bx1=F0.x+ux*(2.2+k*1.35)+nx*4.6,bz1=F0.z+uz*(2.2+k*1.35)+nz*4.6;
    putBeam(M_SPAR,[bx0,F0.gh+2.85,bz0],[bx1,F0.gh+2.85,bz1],0.34);
   }
  }
  out.sparChute={bents:nB+1,logs:logCount,lengthM:sc.lengthM};
  REGISTER({name:sc.name,x:sc.x,y:(hStart+hEnd)*0.5,z:sc.z,r:Math.max(48,sc.lengthM*0.48),h:hStart-hEnd+18});
 }

 /* ---------------- 5. SEAT ALL 5 SHORE-KIN CLIENT HINTERLAND VILLAGES + HARBOUR CLIENT WORK-BENCH ---------------- */
 const skPlacements=[];
 {
  const plinthMatOf=pm=>pm==='laterite'?M_LATERITE:pm==='serpentinite'?M_SERP:M_STONE;
  function queueSkBuilding(rec,plinthMat,labelPrefix){
   const hw=rec.w*0.48,hd=rec.d*0.48;
   const c=Math.cos(rec.ry),s=Math.sin(rec.ry);
   let yTop=-1e9,yLow=1e9;
   const pts=[[0,0],[-hw,-hd],[hw,-hd],[-hw,hd],[hw,hd]];
   for(let i=0;i<pts.length;i++){
    const lx=pts[i][0],lz=pts[i][1];
    const wx=rec.x+lx*c+lz*s,wz=rec.z-lx*s+lz*c;
    const gh=terrainH(wx,wz);
    if(gh>yTop)yTop=gh;
    if(gh<yLow)yLow=gh;
   }
   yTop=Math.max(yTop,8.5);
   const pBot=yLow-1.4,pTop=yTop+0.02,pH=Math.max(1.2,pTop-pBot);
   putBox(plinthMat,rec.x,pBot+pH*0.5,rec.z,rec.w+1.4,pH,rec.d+1.4,rec.ry);
   /* Stepped stone threshold on front (+z in SKK local frame -> (+sin(ry), +cos(ry)) in world) */
   const fx=rec.x+s*(hd+0.95),fz=rec.z+c*(hd+0.95);
   putBox(M_TUFA,fx,yTop-0.35,fz,Math.min(4.2,rec.w*0.38),0.9,1.8,rec.ry);
   skPlacements.push({
    key:rec.key,
    v:0,
    x:rec.x,
    y:yTop,
    z:rec.z,
    ry:rec.ry,
    w:rec.w,
    d:rec.d,
    h:rec.h,
    label:labelPrefix
   });
   const rFoot=Math.hypot(rec.w,rec.d)*0.54;
   OBSTACLES.push({x:rec.x,z:rec.z,r:rFoot+2.5});
   REGISTER({name:labelPrefix,x:rec.x,y:yTop,z:rec.z,r:Math.max(6,rFoot),h:rec.h+2.5});
   if(typeof KWALK!=='undefined'){
    const half=Math.max(rec.w,rec.d)*0.44;
    KWALK.block([rec.x-half,rec.x+half,rec.z-half,rec.z+half,yTop,yTop+rec.h],rec.id);
   }
  }

  /* 5A. Harbour Shore-kin Client Hall, Foundry & Boat-Grid Shed on the +9.2 m Work-Bench */
  FCOVE_WORLD.villagesData.harbourBuildings.forEach(hb=>{
   queueSkBuilding(hb,M_SERP,hb.name+' ('+hb.key+')');
  });

  /* 5B. All 5 Hinterland Client Villages */
  FCOVE_WORLD.villagesData.villages.forEach(vd=>{
   const vs=vd.spec,vl=vd.village,pMat=plinthMatOf(vs.plinthMat);
   /* Village central shell-lime / stone green court pad */
   const gy=terrainH(vl.site.x,vl.site.z);
   putCyl(M_TUFA,vl.site.x,gy-0.25,vl.site.z,13.5,14.8,0.75,16,0,0);
   putCyl(pMat,vl.site.x,gy+0.18,vl.site.z,2.4,2.8,0.45,12,0,0);
   /* Stepped stone lane markers along KHAMLET lanes */
   const lanes=vl.lanes||[];
   for(let li=0;li<lanes.length;li++){
    const pts=lanes[li].points||[];
    for(let pi=0;pi<pts.length-1;pi++){
     const A=pts[pi],B=pts[pi+1],segL=Math.hypot(B.x-A.x,B.z-A.z);
     const nSt=Math.max(1,Math.round(segL/9));
     const lyaw=Math.atan2(B.x-A.x,B.z-A.z);
     for(let k=0;k<nSt;k++){
      const u=(k+0.5)/nSt,lx=lerp(A.x,B.x,u),lz=lerp(A.z,B.z,u);
      const lh=terrainH(lx,lz);
      putBox(pMat,lx,lh-0.12,lz,lanes[li].w*0.78,0.42,Math.min(8.5,segL/nSt*0.88),lyaw);
     }
    }
   }
   /* Coastal basalt slipway ramp for Sill-Pans (village_saltery) */
   if(vs.landing){
    const ld=vs.landing,lyaw=Math.atan2(ld.ux,ld.uz);
    for(let k=-2;k<=6;k++){
     const dS=k*4.2,px=ld.x+ld.ux*dS,pz=ld.z+ld.uz*dS;
     const py=Math.max(-3.5,terrainH(px,pz));
     putBox(M_STONE,px,py-0.45,pz,9.5,1.2,4.4,lyaw);
    }
   }
   REGISTER({name:vs.name,x:vl.site.x,y:gy,z:vl.site.z,r:vs.rFlat*0.75,h:18});
   const recs=vl.records||[];
   for(let r=0;r<recs.length;r++){
    const b=recs[r];
    if(!b)continue;
    queueSkBuilding(b,pMat,vs.epithet+' — '+b.key+' ('+vs.focus+' client village)');
   }
  });
 }

 /* Flush merged cove works, spar chute & village plinths into one BufferGeometry per material */
 {
  const worksGrp=new THREE.Group();
  worksGrp.name='fcove:tidal-works-and-chute';
  worksGrp.userData.probePoints=worksProbe;
  BK.forEach((geos,mat)=>{
   let nv=0,ni=0;
   for(let i=0;i<geos.length;i++){
    nv+=geos[i].attributes.position.count;
    ni+=geos[i].index?geos[i].index.count:geos[i].attributes.position.count;
   }
   const P=new Float32Array(nv*3),N=new Float32Array(nv*3),I=new Uint32Array(ni);
   let vo=0,io=0;
   for(let i=0;i<geos.length;i++){
    const g=geos[i],pa=g.attributes.position.array,na=g.attributes.normal.array,c=g.attributes.position.count;
    P.set(pa,vo*3);
    N.set(na,vo*3);
    if(g.index){
     const ix=g.index.array;
     for(let k=0;k<ix.length;k++)I[io+k]=ix[k]+vo;
     io+=ix.length;
    }else{
     for(let k=0;k<c;k++)I[io+k]=vo+k;
     io+=c;
    }
    vo+=c;
    g.dispose();
   }
   const mg=new THREE.BufferGeometry();
   mg.setAttribute('position',new THREE.BufferAttribute(P,3));
   mg.setAttribute('normal',new THREE.BufferAttribute(N,3));
   mg.setIndex(new THREE.BufferAttribute(I,1));
   mg.computeBoundingSphere();
   mg.computeBoundingBox();
   const m=new THREE.Mesh(mg,mat);
   m.castShadow=true;
   m.receiveShadow=true;
   m.userData.inspectLabel='Fleetborn Cove Tidal Drydock, Spar Log-Chute and Village Plinths';
   worksGrp.add(m);
  });
  scene.add(worksGrp);
  if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.fromObject(worksGrp));
 }

 /* Merge all ~219 Shore-kin SKK.proto buildings into world-space batches by material (~28 draw calls total!) */
 if(typeof SKK!=='undefined'&&SKK&&typeof SKK.proto==='function'&&skPlacements.length){
  const protoCache={};
  function getProtoParts(key,v){
   const ck=key+'|'+(v|0);
   if(protoCache[ck])return protoCache[ck];
   const grp=SKK.proto(key,v|0);
   const parts=[];
   if(grp){
    grp.updateMatrixWorld(true);
    grp.traverse(m=>{
     if(!m.isMesh||!m.geometry||!m.geometry.attributes||!m.geometry.attributes.position)return;
     parts.push({
      geo:m.geometry,
      mat:m.material,
      mk:(m.userData&&m.userData.mk)?m.userData.mk:'',
      ro:m.renderOrder==null?0:m.renderOrder
     });
    });
   }
   protoCache[ck]=parts;
   return parts;
  }

  const buckets=new Map();
  const skProbe=[];
  const m4=new THREE.Matrix4(),n3=new THREE.Matrix3(),v3=new THREE.Vector3(),eu=new THREE.Euler();

  for(let pi=0;pi<skPlacements.length;pi++){
   const pl=skPlacements[pi];
   const parts=getProtoParts(pl.key,pl.v);
   if(!parts.length)continue;
   out.villagePlacedCount++;
   skProbe.push(pl.x,pl.y+1.5,pl.z);
   eu.set(0,pl.ry,0,'YXZ');
   m4.compose(new THREE.Vector3(pl.x,pl.y,pl.z),new THREE.Quaternion().setFromEuler(eu),new THREE.Vector3(1,1,1));
   n3.getNormalMatrix(m4);

   for(let mi=0;mi<parts.length;mi++){
    const pt=parts[mi],g=pt.geo,at=g.attributes;
    const hasFlut=!!at.aFlut,hasCut=!!at.aCut,hasFlk=!!at.aFlk,hasForm=!!at.aForm;
    const bKey=pt.mat.uuid+'|'+(hasFlut?1:0)+(hasCut?1:0)+(hasFlk?1:0)+(hasForm?1:0)+'|'+pt.ro;
    let B=buckets.get(bKey);
    if(!B){
     B={mat:pt.mat,mk:pt.mk,ro:pt.ro,hasFlut:hasFlut,hasCut:hasCut,hasFlk:hasFlk,hasForm:hasForm,items:[],nv:0,ni:0};
     buckets.set(bKey,B);
    }
    const vc=at.position.count;
    const ic=g.index?g.index.count:vc;
    B.items.push({geo:g,m4:m4.clone(),n3:n3.clone(),cx:pl.x,cy:pl.y,cz:pl.z});
    B.nv+=vc;
    B.ni+=ic;
   }
  }

  const skGrp=new THREE.Group();
  skGrp.name='fcove:shorekin-villages';
  skGrp.userData.probePoints=skProbe;

  buckets.forEach(B=>{
   const P=new Float32Array(B.nv*3);
   const N=new Float32Array(B.nv*3);
   const U=new Float32Array(B.nv*2);
   const C=new Float32Array(B.nv*3);
   const FL=B.hasFlut?new Float32Array(B.nv*3):null;
   const CT=B.hasCut?new Float32Array(B.nv*4):null;
   const FK=B.hasFlk?new Float32Array(B.nv):null;
   const FM=B.hasForm?new Float32Array(B.nv*3):null;
   const I=B.nv>65535?new Uint32Array(B.ni):new Uint16Array(B.ni);

   let vo=0,io=0;
   for(let ii=0;ii<B.items.length;ii++){
    const it=B.items[ii],g=it.geo,at=g.attributes,vc=at.position.count;
    const pa=at.position.array,na=at.normal?at.normal.array:null,ua=at.uv?at.uv.array:null,ca=at.color?at.color.array:null;
    const fa=FL&&at.aFlut?at.aFlut.array:null;
    const ka=CT&&at.aCut?at.aCut.array:null;
    const wa=FK&&at.aFlk?at.aFlk.array:null;
    const xa=FM&&at.aForm?at.aForm.array:null;

    for(let v=0;v<vc;v++){
     const o3=(vo+v)*3,s3=v*3;
     v3.set(pa[s3],pa[s3+1],pa[s3+2]).applyMatrix4(it.m4);
     P[o3]=v3.x;P[o3+1]=v3.y;P[o3+2]=v3.z;
     if(na){
      v3.set(na[s3],na[s3+1],na[s3+2]).applyMatrix3(it.n3).normalize();
      N[o3]=v3.x;N[o3+1]=v3.y;N[o3+2]=v3.z;
     }else{
      N[o3]=0;N[o3+1]=1;N[o3+2]=0;
     }
     if(ua){
      U[(vo+v)*2]=ua[v*2];U[(vo+v)*2+1]=ua[v*2+1];
     }
     if(ca){
      C[o3]=ca[s3];C[o3+1]=ca[s3+1];C[o3+2]=ca[s3+2];
     }else{
      C[o3]=1;C[o3+1]=1;C[o3+2]=1;
     }
     if(FL){
      if(fa){
       v3.set(fa[s3],fa[s3+1],fa[s3+2]).applyMatrix3(it.n3);
       FL[o3]=v3.x;FL[o3+1]=v3.y;FL[o3+2]=v3.z;
      }
     }
     if(CT){
      const o4=(vo+v)*4;
      CT[o4]=it.cx;CT[o4+1]=it.cz;CT[o4+2]=it.cy;CT[o4+3]=ka?0:0;
     }
     if(FK&&wa)FK[vo+v]=wa[v];
     if(FM&&xa){
      FM[o3]=xa[s3];FM[o3+1]=xa[s3+1];FM[o3+2]=xa[s3+2];
     }
    }

    if(g.index){
     const ix=g.index.array;
     for(let k=0;k<ix.length;k++)I[io+k]=ix[k]+vo;
     io+=ix.length;
    }else{
     for(let k=0;k<vc;k++)I[io+k]=vo+k;
     io+=vc;
    }
    vo+=vc;
   }

   const mg=new THREE.BufferGeometry();
   mg.setAttribute('position',new THREE.BufferAttribute(P,3));
   mg.setAttribute('normal',new THREE.BufferAttribute(N,3));
   mg.setAttribute('uv',new THREE.BufferAttribute(U,2));
   mg.setAttribute('color',new THREE.BufferAttribute(C,3));
   if(FL)mg.setAttribute('aFlut',new THREE.BufferAttribute(FL,3));
   if(CT)mg.setAttribute('aCut',new THREE.BufferAttribute(CT,4));
   if(FK)mg.setAttribute('aFlk',new THREE.BufferAttribute(FK,1));
   if(FM)mg.setAttribute('aForm',new THREE.BufferAttribute(FM,3));
   mg.setIndex(new THREE.BufferAttribute(I,1));
   mg.computeBoundingSphere();
   mg.computeBoundingBox();

   let matUse=B.mat;
   if(matUse&&matUse.side===THREE.FrontSide&&!matUse.transparent){
    let totA=0,downA=0;
    const nt=Math.floor(I.length/3);
    for(let ti=0;ti<nt;ti++){
     const a0=I[ti*3]*3,b0=I[ti*3+1]*3,c0=I[ti*3+2]*3;
     const ex=P[b0]-P[a0],ey=P[b0+1]-P[a0+1],ez=P[b0+2]-P[a0+2];
     const fx=P[c0]-P[a0],fy=P[c0+1]-P[a0+1],fz=P[c0+2]-P[a0+2];
     const cx=ey*fz-ez*fy,cy=ez*fx-ex*fz,cz=ex*fy-ey*fx;
     const len=Math.hypot(cx,cy,cz);
     if(len>0){
      totA+=len;
      if(cy/len<-0.3)downA+=len;
     }
    }
    if(totA>0&&downA/totA>0.48){
     matUse=B.mat.clone();
     matUse.side=THREE.DoubleSide;
     if(B.mat.onBeforeCompile)matUse.onBeforeCompile=B.mat.onBeforeCompile;
     if(B.mat.customProgramCacheKey)matUse.customProgramCacheKey=B.mat.customProgramCacheKey;
     matUse.userData=Object.assign({},B.mat.userData);
    }
   }

   const mesh=new THREE.Mesh(mg,matUse);
   mesh.name='fcove:sk-'+(B.mk||'mesh');
   mesh.userData.mk=B.mk;
   mesh.userData.inspectLabel='Shore-Kin Client Villages and Harbour Works (kits/shore-kin)';
   const isTrans=!!(B.ro>=2||B.mk==='glass'||B.mk==='water'||B.mk==='glow'||(matUse&&matUse.transparent));
   if(B.ro)mesh.renderOrder=B.ro;
   if(!isTrans){
    mesh.castShadow=true;
    mesh.receiveShadow=true;
   }
   skGrp.add(mesh);
   out.villageMeshes++;
  });

  scene.add(skGrp);
  out.villagesGroup=skGrp;
  if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.fromObject(skGrp));
 }

 /* ---------------- 6. MOOR CARETAKER GUARD-HULLS + 5 DYNAMIC PELAGIC SANCTUARY FLEETS (89c..89h, merged per fleet) ---------------- */
 const fleetAnimList=[];
 if(typeof FCOVE_RINGSEA!=='undefined'){
  const buoyGeo=new THREE.TorusGeometry(0.95,0.28,8,16);
  buoyGeo.rotateX(Math.PI/2);
  const rsProtoCache={};
  function getRsParts(rsKey){
   if(rsProtoCache[rsKey])return rsProtoCache[rsKey];
   const made=FCOVE_RINGSEA.make(rsKey);
   const parts=[];
   if(made&&made.group){
    made.group.updateMatrixWorld(true);
    made.group.traverse(m=>{
     if(!m.isMesh||!m.geometry||!m.geometry.attributes||!m.geometry.attributes.position)return;
     parts.push({geo:m.geometry,mat:m.material});
    });
   }
   rsProtoCache[rsKey]=parts;
   return parts;
  }

  function buildMergedFleetGroup(fleetId,specs,phaseSeed){
   const fg=new THREE.Group();
   fg.name='fcove:fleet-'+fleetId;
   const fb=new Map();
   const buoyGeos=[];
   const fleetProbe=[];
   const fm4=new THREE.Matrix4(),fn3=new THREE.Matrix3(),fv3=new THREE.Vector3(),feu=new THREE.Euler();

   for(let si=0;si<specs.length;si++){
    const v=specs[si];
    const parts=getRsParts(v.rsKey);
    if(!parts.length)continue;
    feu.set(0,v.yaw,0,'YXZ');
    fm4.compose(new THREE.Vector3(v.x,0,v.z),new THREE.Quaternion().setFromEuler(feu),new THREE.Vector3(1,1,1));
    fn3.getNormalMatrix(fm4);
    for(let pi=0;pi<parts.length;pi++){
     const pt=parts[pi],g=pt.geo,at=g.attributes;
     const hasAux=!!(at.rsAux&&at.rsAux2);
     const bk=pt.mat.uuid+'|'+(hasAux?1:0);
     let B=fb.get(bk);
     if(!B){B={mat:pt.mat,hasAux:hasAux,items:[],nv:0};fb.set(bk,B);}
     B.items.push({geo:g,m4:fm4.clone(),n3:fn3.clone()});
     B.nv+=at.position.count;
    }
    const bx=v.x+Math.cos(v.yaw)*(v.r*0.72),bz=v.z-Math.sin(v.yaw)*(v.r*0.72);
    const bg=buoyGeo.clone();
    bg.translate(bx,0.12,bz);
    buoyGeos.push(bg);
    fleetProbe.push(v.x,2.0,v.z);
    REGISTER({name:v.name,x:v.x,y:-8,z:v.z,r:v.r,h:28});
    out.moored.push({spec:v,fleetId:fleetId,group:fg,parent:fg,phase:phaseSeed+si*0.41});
   }
   fg.userData.probePoints=fleetProbe;

   fb.forEach(B=>{
    const P=new Float32Array(B.nv*3),N=new Float32Array(B.nv*3),U=new Float32Array(B.nv*2),C=new Float32Array(B.nv*3);
    const X1=B.hasAux?new Float32Array(B.nv*4):null,X2=B.hasAux?new Float32Array(B.nv*4):null;
    let vo=0;
    for(let ii=0;ii<B.items.length;ii++){
     const it=B.items[ii],g=it.geo,at=g.attributes,vc=at.position.count;
     const pa=at.position.array,na=at.normal.array,ua=at.uv.array,ca=at.color.array;
     const a1=X1?at.rsAux.array:null,a2=X2?at.rsAux2.array:null;
     for(let k=0;k<vc;k++){
      const o3=(vo+k)*3,s3=k*3;
      fv3.set(pa[s3],pa[s3+1],pa[s3+2]).applyMatrix4(it.m4);
      P[o3]=fv3.x;P[o3+1]=fv3.y;P[o3+2]=fv3.z;
      fv3.set(na[s3],na[s3+1],na[s3+2]).applyMatrix3(it.n3).normalize();
      N[o3]=fv3.x;N[o3+1]=fv3.y;N[o3+2]=fv3.z;
      U[(vo+k)*2]=ua[k*2];U[(vo+k)*2+1]=ua[k*2+1];
      C[o3]=ca[s3];C[o3+1]=ca[s3+1];C[o3+2]=ca[s3+2];
      if(X1){
       const o4=(vo+k)*4,s4=k*4;
       fv3.set(a1[s4],a1[s4+1],a1[s4+2]).applyMatrix4(it.m4);
       X1[o4]=fv3.x;X1[o4+1]=fv3.y;X1[o4+2]=fv3.z;X1[o4+3]=a1[s4+3];
       X2[o4]=a2[s4];X2[o4+1]=a2[s4+1];X2[o4+2]=a2[s4+2];X2[o4+3]=a2[s4+3];
      }
     }
     vo+=vc;
    }
    const mg=new THREE.BufferGeometry();
    mg.setAttribute('position',new THREE.BufferAttribute(P,3));
    mg.setAttribute('normal',new THREE.BufferAttribute(N,3));
    mg.setAttribute('uv',new THREE.BufferAttribute(U,2));
    mg.setAttribute('color',new THREE.BufferAttribute(C,3));
    if(X1){
     mg.setAttribute('rsAux',new THREE.BufferAttribute(X1,4));
     mg.setAttribute('rsAux2',new THREE.BufferAttribute(X2,4));
    }
    mg.computeBoundingSphere();
    const mesh=new THREE.Mesh(mg,B.mat);
    mesh.userData.inspectLabel='Moored Sea-Nomad Sanctuary Fleet ('+fleetId+', riding KTIDE)';
    fg.add(mesh);
   });

   if(buoyGeos.length){
    let bnv=0,bni=0;
    for(let i=0;i<buoyGeos.length;i++){
     bnv+=buoyGeos[i].attributes.position.count;
     bni+=buoyGeos[i].index.count;
    }
    const BP=new Float32Array(bnv*3),BN=new Float32Array(bnv*3),BI=new Uint16Array(bni);
    let bvo=0,bio=0;
    for(let i=0;i<buoyGeos.length;i++){
     const bg=buoyGeos[i],vc=bg.attributes.position.count,ix=bg.index.array;
     BP.set(bg.attributes.position.array,bvo*3);
     BN.set(bg.attributes.normal.array,bvo*3);
     for(let k=0;k<ix.length;k++)BI[bio+k]=ix[k]+bvo;
     bvo+=vc;bio+=ix.length;
     bg.dispose();
    }
    const bmg=new THREE.BufferGeometry();
    bmg.setAttribute('position',new THREE.BufferAttribute(BP,3));
    bmg.setAttribute('normal',new THREE.BufferAttribute(BN,3));
    bmg.setIndex(new THREE.BufferAttribute(BI,1));
    bmg.computeBoundingSphere();
    const bMesh=new THREE.Mesh(bmg,M_JADE);
    bMesh.userData.probeSkip=true;
    bMesh.userData.inspectLabel='Nephrite-and-Paktong Trench Mooring Rings ('+fleetId+')';
    fg.add(bMesh);
   }

   scene.add(fg);
   fleetAnimList.push({id:fleetId,group:fg,phase:phaseSeed});
   return fg;
  }

  out.caretakerGroup=buildMergedFleetGroup('caretaker_house',caretakerSpecs,0.0);

  ['ward_ring','smelt_fleet','trench_fleet','outer_whalers','island_traders'].forEach((fid,fi)=>{
   const fSpecs=LY.fleetSlots.filter(s=>s.fleetId===fid);
   out.fleetGroups[fid]=buildMergedFleetGroup(fid,fSpecs,(fi+1)*1.17);
  });
 }

 out.syncFleetsForDay=function syncFleetsForDay(dayIdx){
  const st=FCOVE_WORLD.dayState(dayIdx==null?44:dayIdx);
  Object.keys(out.fleetGroups).forEach(fid=>{
   out.fleetGroups[fid].visible=st.fleetIds.indexOf(fid)>=0;
  });
  out.activeFleetIds=st.fleetIds.slice();
  out.activeFleetCount=st.fleetCount;
  out.activeMooredCount=st.visitingHulls+st.caretakerHulls;
  out.mootPop=st.mootPop;
  out.syncedDay=st.day;
  return st;
 };
 out.syncFleetsForDay(44);

 /* ---------------- 7. LIVE FRAME TICK: TIDE-LOCKED FLEETS, CAREENED ARK, ROTORS, HEARTH, MILL & SKK FLUTTER ---------------- */
 let wallClock=0;
 tick(function stepFcoveTideWorks(dt){
  const d=clamp(dt==null?0.016:dt,0,0.1);
  wallClock+=d;
  if(typeof FCOVE_RINGSEA!=='undefined'&&FCOVE_RINGSEA.tick)FCOVE_RINGSEA.tick(wallClock);
  if(typeof SKK!=='undefined'&&SKK&&SKK.ANIMU){
   SKK.ANIMU.uTime.value=wallClock;
   if(SKK.ANIMU.uCam&&typeof camera!=='undefined')SKK.ANIMU.uCam.value.copy(camera.position);
  }

  const T=(typeof COVE_TIDE!=='undefined'&&COVE_TIDE.T)?COVE_TIDE.T:null;
  const lv=T?T.level:0;
  const live=!!(T&&T.site&&T.mode!=='hold');
  const clk=(typeof KHOST!=='undefined'&&KHOST.host)?KHOST.host.clock:null;
  const wSec=live?(T.mode==='run'?T.tw:(clk?KTIDE.worldSeconds(clk):0)):0;
  const curMps=live?FCOVE_RULES.sillVelocity(wSec):(lv<-0.5?-3.8:lv>0.5?3.8:0);
  const dayIdx=live?Math.floor(wSec/86400):(clk?clk.day:out.syncedDay);
  if(dayIdx!==out.syncedDay)out.syncFleetsForDay(dayIdx);

  /* Moored fleet groups ride live tide + gentle sanctuary wave motion */
  for(let i=0;i<fleetAnimList.length;i++){
   const fa=fleetAnimList[i];
   if(!fa.group.visible)continue;
   const heave=0.055*Math.sin(wallClock*1.12+fa.phase);
   fa.group.position.y=lv+heave;
  }
  if(REG){
   for(let i=0;i<out.moored.length;i++)out.moored[i].spec._lastY=lv;
  }

  /* Careened hulls rest firmly on keel blocks until tide exceeds floatLevel (+2.6 m for cradle_deep!) */
  for(let i=0;i<out.careened.length;i++){
   const cr=out.careened[i],c=cr.cradle;
   const wy=FCOVE_RULES.hullWaterlineY(lv,c.id,{draft:c.vesselDraft});
   const afloat=lv>=wy-0.02;
   cr.group.position.y=wy+(afloat?0.03*Math.sin(wallClock*1.1+i):0);
   cr.group.rotation.z=afloat?0.01*Math.sin(wallClock*0.9):0;
   for(let k=0;k<cr.foamMeshes.length;k++)cr.foamMeshes[k].visible=afloat;
  }

  /* Sill rotors spin with reversible velocity curMps (pausing at slack!) */
  for(let i=0;i<out.rotorHubs.length;i++){
   out.rotorHubs[i].spinner.rotation.z+=d*curMps*0.58;
  }

  /* Smelt-hearth glows bright on spring rotor campaigns and dims when banked on neaps */
  const rDay=FCOVE_RULES.rotorDay(dayIdx);
  const active=live?rDay.smeltActive:(Math.abs(curMps)>3.0);
  out.hearthGlowMat.emissiveIntensity=active?(1.35+0.2*Math.sin(wallClock*5.0)):0.22;

  /* Impounding basin & tide-wheel */
  if(out.millWheel&&out.basinWaterMesh){
   const mAt=live?FCOVE_RULES.millAt(wSec):{basinTop:Math.max(lv,4.8),milling:lv<2.8};
   const bLv=Math.max(LY.tideMill.basinFloor+0.8,Math.min(LY.tideMill.weirTop-0.3,Math.max(lv,mAt.basinTop-1.2)));
   out.basinWaterMesh.position.y=bLv;
   if(mAt.milling)out.millWheel.rotation.x+=d*1.15;
  }
 });

 return out;
})();
