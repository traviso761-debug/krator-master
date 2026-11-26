// ================================================================= HOST — Arcoforte seating, salvaged port, graving cradles, rotors, causeway & fleet
// Runs at 86 (after 84-host-ground.js builds GROUND & KDRAWN.grid, before 88-host-place.js places flora and 89v builds cove water):
// 1. Registers all settlement sites, structures, cradles, port segments, rotors, mill, causeway, and 16 vessels in KTAGS.page BEFORE drawing.
// 2. Seats Arcoforte (FCOVE_ARCOFORTE) on the +76..+84 m eastern cliff-prow, watching its ruined zones on KRUINS.
// 3. Seats salvaged Ancient port segments (slPen, ddShed, ddYard at d = 3) along the sheltered +6 m shipyard quay.
// 4. Builds the three stepped graving cradles (with careened 89c Ark-Catamaran on -3 m blocks & 89f Trimaran on -1 m blocks),
//    the Paktong Reverberatory Smelt-Hearth, the Impounding Basin & Tide-Mill, the 4-rotor Sill-Race Turbine Array, and the
//    -6.0 m White Stacks Sea-Byssus Causeway.
// 5. Moors 14 Fleet-born & Hueru-Kuran vessels (89c..89h) in the -45..-59 m inner sanctuary cove riding KTIDE water height live.
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
  portGroups:[],
  careened:[],
  moored:[],
  rotorHubs:[],
  millWheel:null,
  hearthGlowMat:null,
  basinWaterMesh:null,
  tagIds:[]
 };

 /* ---------------- 1. PRE-REGISTER EVERYTHING IN KTAGS.PAGE BEFORE DRAWING ---------------- */
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

 /* Register careened + moored Fleet-born & Hueru-Kuran vessels */
 LY.cradles.forEach(c=>{
  if(!c.vesselKey)return;
  const p=LY.XZ(c.s,c.a0+c.len*0.48);
  const dim=(typeof FCOVE_RINGSEA!=='undefined'&&FCOVE_RINGSEA.dims[c.vesselKey])||{L:36,B:14,H:20};
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

 LY.fleet.forEach(v=>{
  const dim=(typeof FCOVE_RINGSEA!=='undefined'&&FCOVE_RINGSEA.dims[v.rsKey])||{L:28,B:12,H:16};
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

 /* ---------------- 4. DRAW CRADLES, SMELT-HEARTH, TIDE-MILL, ROTORS & CAUSEWAY ---------------- */
 const M_CONC=new THREE.MeshStandardMaterial({color:0x8a8377,roughness:0.9,metalness:0.03});
 const M_STONE=new THREE.MeshStandardMaterial({color:0x4b524c,roughness:0.92,metalness:0.02});
 const M_TUFA=new THREE.MeshStandardMaterial({color:0xd8d2c4,roughness:0.82,metalness:0.02});
 const M_TIMB=new THREE.MeshStandardMaterial({color:0x5e3824,roughness:0.84,metalness:0.02});
 const M_PAK=new THREE.MeshStandardMaterial({color:0xd8d4c8,roughness:0.28,metalness:0.84});
 const M_BRZ=new THREE.MeshStandardMaterial({color:0x9e7638,roughness:0.38,metalness:0.72});
 const M_JADE=new THREE.MeshStandardMaterial({color:0x237a52,roughness:0.26,metalness:0.08,emissive:0x0c3422,emissiveIntensity:0.45});
 const M_BYSSUS=new THREE.MeshStandardMaterial({color:0xd4a438,roughness:0.46,metalness:0.34});
 const M_HEARTH=new THREE.MeshStandardMaterial({color:0xff7824,emissive:0xe85814,emissiveIntensity:1.4,roughness:0.6});
 out.hearthGlowMat=M_HEARTH;

 /* Merged geometry accumulator for static cove works (1 mesh per material -> 8 draw calls total!) */
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

 /* 4A. Quay apron wall & Three Stepped Macrotidal Graving Cradles */
 {
  for(let s=6;s<=102;s+=12){
   const qA=LY.quayA(s),p=LY.XZ(s,qA+52);
   putBox(M_CONC,p[0],LY.yardDeckY-0.35,p[1],12.4,0.7,104,shoreYaw);
  }
  LY.cradles.forEach((c,ci)=>{
   const midA=c.a0+c.len*0.5,pMid=LY.XZ(c.s,midA);
   /* Pit floor slab */
   putBox(M_CONC,pMid[0],c.pitFloor-0.4,pMid[1],c.w+4,0.8,c.len+4,shoreYaw);
   /* 4 stepped cyclopean altar walls on NNW & SSE sides + head wall */
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
   /* Jammed-open Ancient caisson sill lip & wedged paktong/steel gate leaves at c.a0 */
   const pSill=LY.XZ(c.s,c.a0+1.1);
   const sillH=Math.max(0.8,c.sill-(c.pitFloor-0.6));
   putBox(M_CONC,pSill[0],(c.pitFloor-0.6)+sillH*0.5,pSill[1],c.w,sillH,2.4,shoreYaw);
   for(const side of[-1,1]){
    const pGate=LY.XZ(c.s+side*(c.w*0.42),c.a0+0.6);
    putBox(M_PAK,pGate[0],c.sill+3.2,pGate[1],1.1,6.8,4.6,shoreYaw+side*0.48);
    const pBoll=LY.XZ(c.s+side*(c.w*0.5+2.2),c.a0+2.0);
    putCyl(M_PAK,pBoll[0],c.deckY+0.55,pBoll[1],0.38,0.46,1.1,10,0,0);
   }
   /* Red-cypress & granite keel blocks along twin catamaran / central keel lines */
   const keelOffsets=c.id==='cradle_shallow'?[0]:[-4.7,4.7];
   const blockH=Math.max(0.35,c.blocks-c.pitFloor);
   for(let dA=6;dA<=c.len-6;dA+=3.4){
    for(let ki=0;ki<keelOffsets.length;ki++){
     const ko=keelOffsets[ki],pk=LY.XZ(c.s+ko,c.a0+dA);
     putBox(M_CONC,pk[0],c.pitFloor+blockH*0.35,pk[1],1.8,blockH*0.7,1.3,shoreYaw);
     putBox(M_TIMB,pk[0],c.pitFloor+blockH*0.85,pk[1],1.9,blockH*0.3,1.4,shoreYaw);
    }
    /* Angled timber breast-shores bracing from the lower altar steps */
    if(dA>10&&dA<c.len-10&&Math.round(dA)%6===0){
     for(const side of[-1,1]){
      const pAlt=LY.XZ(c.s+side*(c.w*0.5-1.5),c.a0+dA);
      const pHull=LY.XZ(c.s+side*(c.id==='cradle_shallow'?2.2:5.8),c.a0+dA);
      putBeam(M_TIMB,[pAlt[0],c.blocks+1.6,pAlt[1]],[pHull[0],c.blocks+2.8,pHull[1]],0.16);
     }
    }
   }
   /* Heavy cypress & paktong sheerlegs A-frame crane straddling the Deep Cradle head */
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

   /* Place careened Ringsea vessel inside cradle (rests on blocks at low tide, floats with KTIDE above floatLevel!) */
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

 /* 4B. Paktong Reverberatory Smelt-Hearth Cupola (inshore of cradle_great) */
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
  /* Glowing reverberatory hearth arch facing the cradles */
  const pMouth=LY.XZ(sh.s,sh.a-9.4);
  putBox(M_HEARTH,pMouth[0],sh.y+2.4,pMouth[1],3.4,2.8,1.2,shoreYaw);
  /* Nickel-ash bales & stacked paktong ingots */
  for(let i=0;i<4;i++){
   const pi=LY.XZ(sh.s-8+i*5.2,sh.a-13.5);
   putBox(M_PAK,pi[0],sh.y+0.6,pi[1],2.4,1.2,1.4,shoreYaw);
  }
  REGISTER({name:sh.name,x:sh.x,y:sh.y,z:sh.z,r:16,h:21});
 }

 /* 4C. Impounding Basin Weir Wall, Flap-Gates, 9.6 m Paktong Tide-Wheel, Stamping Mill & Rope-Walk */
 {
  const tm=LY.tideMill;
  /* Battered basalt & concrete impounding weir across the basin mouth */
  putBox(M_STONE,tm.x,(tm.weirTop-8)*0.5,tm.z,tm.w,tm.weirTop+8,4.2,shoreYaw);
  for(const side of[-1,1]){
   const pSide=LY.XZ(tm.s+side*(tm.w*0.5),tm.aWeir+tm.basinLen*0.5);
   putBox(M_STONE,pSide[0],(tm.weirTop-6)*0.5,pSide[1],3.6,tm.weirTop+6,tm.basinLen,shoreYaw);
  }
  /* Three bronze flood flap-gates set in the weir wall */
  for(const ds of[-16,0,16]){
   const pg=LY.XZ(tm.s+ds,tm.aWeir-2.2);
   putBox(M_BRZ,pg[0],2.6,pg[1],3.6,3.8,0.45,shoreYaw);
  }
  /* Wheelhouse & Stamping Mill astride the sluice race + 64 m covered Rope-Walk */
  const pHouse=LY.XZ(tm.s-12,tm.aWeir+4);
  putBox(M_CONC,pHouse[0],tm.weirTop+3.4,pHouse[1],14,6.8,12,shoreYaw);
  putBox(M_TIMB,pHouse[0],tm.weirTop+7.6,pHouse[1],15.2,1.8,13.2,shoreYaw);
  const pWalk=LY.XZ(tm.s+22,tm.aWeir+26);
  putBox(M_TIMB,pWalk[0],LY.yardDeckY+2.2,pWalk[1],7.5,4.4,54,shoreYaw);

  /* Animated 9.6 m Paktong Tide-Wheel */
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

  /* Impounded basin water surface (tracks impounded high-water head on the ebb!) */
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

 /* 4D. NNW Sill-Throat Reversible Paktong Rotor Array (4 submerged axial turbines + piers & beacons) */
 {
  const sr=LY.sillRotors;
  const sillYaw=Math.atan2(LY.axis[0],LY.axis[1]);
  sr.units.forEach((u,ui)=>{
   /* Cyclopean concrete sill pier & ice/driftwood fender nose */
   putBox(M_CONC,u.x,(u.pierTopY+u.bedY)*0.5,u.z,6.4,u.pierTopY-u.bedY,11.5,sillYaw);
   putCyl(M_PAK,u.x,0.5*(u.hubY+u.pierTopY+2.4),u.z,0.34,0.34,u.pierTopY+2.4-u.hubY,10,0,0);
   putCyl(M_BRZ,u.x,u.pierTopY+2.6,u.z,1.35,1.55,1.4,12,0,0);
   /* Fairway leading-beacon on the inner two piers */
   if(ui===1||ui===2){
    putCyl(M_CONC,u.x,u.pierTopY+5.2,u.z,0.7,1.0,4.2,10,0,0);
    putCyl(M_JADE,u.x,u.pierTopY+8.0,u.z,0.85,0.85,1.5,10,0,0);
   }
   /* Submerged reversible 5-bladed paktong rotor hub spinning about the cove channel axis */
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
  /* Overhead maintenance catwalk linking same-side rotor piers */
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
  /* Terminal White Stack cluster & Tide-Mark Shrine Post at the seaward end of the causeway */
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

 /* Flush merged cove works into one BufferGeometry per material */
 {
  const worksGrp=new THREE.Group();
  worksGrp.name='fcove:tidal-works';
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
   m.userData.inspectLabel='Fleetborn Cove Tidal Drydock, Rotors and Causeway';
   worksGrp.add(m);
  });
  scene.add(worksGrp);
  if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.fromObject(worksGrp));
 }

 /* ---------------- 5. MOOR THE PELAGIC SANCTUARY FLEET (89c..89h) IN THE -45..-59 M COVE ---------------- */
 if(typeof FCOVE_RINGSEA!=='undefined'){
  const buoyGeo=new THREE.TorusGeometry(0.95,0.28,8,16);
  buoyGeo.rotateX(Math.PI/2);
  LY.fleet.forEach((v,vi)=>{
   const made=FCOVE_RINGSEA.make(v.rsKey);
   if(!made||!made.group)return;
   const g=made.group;
   g.position.set(v.x,0,v.z);
   g.rotation.y=v.yaw;
   g.userData.inspectLabel=v.name+' ('+v.rsKey+', riding KTIDE)';
   scene.add(g);
   const buoy=new THREE.Mesh(buoyGeo,M_JADE);
   const bx=v.x+Math.cos(v.yaw)*(v.r*0.72),bz=v.z-Math.sin(v.yaw)*(v.r*0.72);
   buoy.position.set(bx,0.12,bz);
   buoy.userData.probeSkip=true;
   buoy.userData.inspectLabel='Nephrite-and-Paktong Trench Mooring Ring';
   scene.add(buoy);
   REGISTER({name:v.name,x:v.x,y:-4,z:v.z,r:v.r,h:22});
   out.moored.push({spec:v,group:g,buoy:buoy,phase:vi*0.83});
  });
 }

 /* ---------------- 6. LIVE FRAME TICK: TIDE-LOCKED VESSELS, CAREENED ARK, ROTORS, HEARTH & MILL ---------------- */
 let wallClock=0;
 tick(function stepFcoveTideWorks(dt){
  const d=clamp(dt==null?0.016:dt,0,0.1);
  wallClock+=d;
  if(typeof FCOVE_RINGSEA!=='undefined'&&FCOVE_RINGSEA.tick)FCOVE_RINGSEA.tick(wallClock);

  const T=(typeof COVE_TIDE!=='undefined'&&COVE_TIDE.T)?COVE_TIDE.T:null;
  const lv=T?T.level:0;
  const live=!!(T&&T.site&&T.mode!=='hold');
  const clk=(typeof KHOST!=='undefined'&&KHOST.host)?KHOST.host.clock:null;
  const wSec=live?(T.mode==='run'?T.tw:(clk?KTIDE.worldSeconds(clk):0)):0;
  const curMps=live?FCOVE_RULES.sillVelocity(wSec):(lv<-0.5?-3.8:lv>0.5?3.8:0);
  const dayIdx=Math.floor(wSec/86400);

  /* Moored vessels ride live tide + gentle sanctuary wave motion */
  for(let i=0;i<out.moored.length;i++){
   const m=out.moored[i];
   const heave=0.055*Math.sin(wallClock*1.15+m.phase);
   m.group.position.y=lv+heave;
   m.group.rotation.z=0.014*Math.sin(wallClock*0.92+m.phase);
   m.group.rotation.x=0.009*Math.cos(wallClock*0.78+m.phase);
   m.buoy.position.y=lv+0.12+heave*0.8;
   if(REG){
    /* keep moored vessel above water in floor queries */
    m.spec._lastY=lv;
   }
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
