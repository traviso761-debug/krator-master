// ================================================================= LIFE LAYER
// Everything that moves. Four populations, one agent list, two draw calls.
//
//   harvesters  out of the dwellings, the lobby and the upper city's gate to
//               the orchards, pick, and back.
//   patrols     round the wall circuit, gate to gate, turning at the corners.
//   pen guards  standing over the captives' pen, pacing their post.
//   the party   a scripted arrival: warriors bring captives in through a gate
//               to the pen, and a little later an escort takes the captives to
//               the Hexahedron, where they go in and do not come out.
//
// Two rules that keep it honest rather than decorative:
//
//   Same surface only. A route only ever joins two points the builders handed
//   over as a pair, and they only pair points on one surface. An agent walking
//   from the ground to a terrace 600 m up would be flying, and the cheapest
//   guarantee is never to build the pair.
//
//   Two draw calls for the lot. Bodies and heads are one InstancedMesh each,
//   rewritten per frame. The kit's own instancing is baked and immutable by the
//   time this runs, so these are separate meshes.
//
// This fragment loads after 90-scene.js, so SCREAM is already populated.
reseed(9490);
(function(){
 if(typeof SCREAM==='undefined'||!SCREAM)return;
 const A=[];                                   // every agent
 const V3=(p)=>({x:p[0],y:p[1],z:p[2]});
 const add=o=>{o.bob=rng()*TAU;A.push(o);return o;};
 const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];

 // ---- harvesters ------------------------------------------------------------
 const shuttle=(a,b,tint)=>add({kind:'shuttle',a:a,b:b,tint:tint,
  t:rng(),dir:rng()<.5?1:-1,wait:0,
  sp:rr(1.2,2.3)/Math.max(18,Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]))});
 (SCREAM.pairs||[]).forEach(P=>shuttle(P[0],P[1],0));
 if(SCREAM.gate&&SCREAM.plazaFruit)
  SCREAM.plazaFruit.forEach((F,i)=>{if(i%2===0)shuttle(SCREAM.gate,F,0);});
 (SCREAM.orchards||[]).forEach((O,i)=>{if(i%3)return;
  const a=rng()*TAU,r=rr(26,60);
  shuttle([O[0],O[1]+.2,O[2]],[O[0]+Math.cos(a)*r,O[1]+.2,O[2]+Math.sin(a)*r],0);});

 // ---- wall patrols ----------------------------------------------------------
 // A closed loop round the corner list, so a patrol walks the whole circuit and
 // comes back rather than pacing one edge.
 const CIRC=SCREAM.circuit||[];
 if(CIRC.length>2){
  let tot=0;const cum=[0];
  for(let i=0;i<CIRC.length;i++){const a=CIRC[i],b=CIRC[(i+1)%CIRC.length];
   tot+=Math.hypot(b[0]-a[0],b[2]-a[2]);cum.push(tot);}
  for(let i=0;i<10;i++)add({kind:'patrol',loop:CIRC,cum:cum,tot:tot,
   u:rng()*tot,sp:rr(6,10),dir:rng()<.5?1:-1,tint:1});}

 // ---- guards on the pen -----------------------------------------------------
 const PEN=SCREAM.pen;
 if(PEN)for(let i=0;i<5;i++){const a=PEN.rot+(i/5-.5)*2.1;
  add({kind:'post',c:[PEN.x+Math.cos(a)*(PEN.r+9),PEN.y+.2,PEN.z+Math.sin(a)*(PEN.r+9)],
   r:rr(5,11),ph:rng()*TAU,sp:rr(.22,.5),tint:1});}

 // ---- the arriving party ----------------------------------------------------
 // Scripted rather than emergent: the whole point is that it is legible from
 // one camera in the first half minute. Phases are in seconds from load.
 const PARTY=[];
 if(PEN&&SCREAM.gates&&SCREAM.gates.length&&SCREAM.lobby){
  const GT=SCREAM.gates[0];
  const OUT=[GT[0]*1.9,GT[1],GT[2]*1.9];                    // off the map
  const PENDOOR=[PEN.x+Math.cos(PEN.rot)*(PEN.r+16),PEN.y+.2,PEN.z+Math.sin(PEN.rot)*(PEN.r+16)];
  const NCAP=1+Math.floor(rng()*3);                         // 1-3 captives
  const mk=(role,off)=>add({kind:'party',role:role,off:off,
   OUT:OUT,GT:GT,PEN:PENDOOR,LOB:SCREAM.lobby,tint:role==='captive'?2:1,p:[0,0,0]});
  for(let i=0;i<4;i++)PARTY.push(mk('warrior',[rr(-7,7),0,rr(-9,9)]));
  for(let i=0;i<NCAP;i++)PARTY.push(mk('captive',[rr(-4,4),0,rr(-5,5)]));
  for(let i=0;i<3;i++)PARTY.push(mk('escort',[rr(-8,8),0,rr(-10,10)]));}

 const N=A.length;if(!N)return;
 // ---- two instanced meshes for the lot --------------------------------------
 const bg=new THREE.BoxGeometry(1.15,3.3,.8);bg.translate(0,1.65,0);
 const bIM=new THREE.InstancedMesh(bg,
  new THREE.MeshStandardMaterial({color:0xffffff,roughness:.94,metalness:0,side:DS}),N);
 const hIM=new THREE.InstancedMesh(new THREE.SphereGeometry(.62,8,6),
  new THREE.MeshStandardMaterial({color:0xc9a17e,roughness:.92,metalness:0}),N);
 [bIM,hIM].forEach(m=>{m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled=false;m.userData.probeSkip=true;scene.add(m);});
 const col=new THREE.Color();
 A.forEach((ag,i)=>{
  if(ag.tint===2)col.setHSL(.08,.10,.62);             // captives, pale and unpainted
  else if(ag.tint===1)col.setHSL(rr(.98,1.04)%1,.42,.26);   // guards, red-brown
  else col.setHSL(rr(0,.11),rr(.18,.45),rr(.22,.42));       // everyone else
  bIM.setColorAt(i,col);});
 if(bIM.instanceColor)bIM.instanceColor.needsUpdate=true;
 REGISTER({name:'Screamer village — the living ('+N+' on the move)',x:0,z:0,r:1200,h:760});

 // ---- the party's timeline, in seconds --------------------------------------
 const T_IN=14,T_HOLD=18,T_LEAD=22,T_GONE=46,T_LOOP=210;
 const partyPos=(ag,t)=>{
  const u=t%T_LOOP;
  if(ag.role==='escort'){
   // the escort waits at the pen, then walks the captives in
   if(u<T_HOLD)return[ag.PEN,0];
   if(u<T_LEAD)return[ag.PEN,0];
   if(u<T_GONE)return[lerp3(ag.PEN,ag.LOB,(u-T_LEAD)/(T_GONE-T_LEAD)),1];
   return null;}
  if(u<T_IN)return[lerp3(ag.OUT,ag.GT,u/T_IN),1];          // in through the gate
  if(u<T_HOLD)return[lerp3(ag.GT,ag.PEN,(u-T_IN)/(T_HOLD-T_IN)),1];
  if(ag.role==='warrior'){
   if(u<T_GONE)return[lerp3(ag.PEN,ag.GT,(u-T_HOLD)/(T_GONE-T_HOLD)),1];
   return null;}
  // captives: held, then led to the Hexahedron, and they do not come out
  if(u<T_LEAD)return[ag.PEN,0];
  if(u<T_GONE)return[lerp3(ag.PEN,ag.LOB,(u-T_LEAD)/(T_GONE-T_LEAD)),1];
  return null;};

 const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P=new THREE.Vector3();
 const S=new THREE.Vector3(1,1,1),S0=new THREE.Vector3(1e-4,1e-4,1e-4),UP=new THREE.Vector3(0,1,0);
 tick((dt,now)=>{
  for(let i=0;i<N;i++){const ag=A[i];
   let x,y,z,hd=ag.hd||0,moving=true,hide=false;
   if(ag.kind==='shuttle'){
    if(ag.wait>0)ag.wait-=dt;
    else{ag.t+=ag.dir*ag.sp*dt;
     if(ag.t>=1){ag.t=1;ag.dir=-1;ag.wait=rr(3,9);}
     else if(ag.t<=0){ag.t=0;ag.dir=1;ag.wait=rr(4,14);}}
    moving=ag.wait<=0;
    x=ag.a[0]+(ag.b[0]-ag.a[0])*ag.t;y=ag.a[1]+(ag.b[1]-ag.a[1])*ag.t;
    z=ag.a[2]+(ag.b[2]-ag.a[2])*ag.t;
    hd=Math.atan2(ag.b[2]-ag.a[2],ag.b[0]-ag.a[0])+(ag.dir<0?Math.PI:0);
   }else if(ag.kind==='patrol'){
    ag.u=(ag.u+ag.dir*ag.sp*dt+ag.tot)%ag.tot;
    let k=0;while(k<ag.cum.length-2&&ag.cum[k+1]<ag.u)k++;
    const a=ag.loop[k],b=ag.loop[(k+1)%ag.loop.length];
    const f=(ag.u-ag.cum[k])/Math.max(1e-6,ag.cum[k+1]-ag.cum[k]);
    x=a[0]+(b[0]-a[0])*f;y=a[1]+(b[1]-a[1])*f;z=a[2]+(b[2]-a[2])*f;
    hd=Math.atan2(b[2]-a[2],b[0]-a[0])+(ag.dir<0?Math.PI:0);
   }else if(ag.kind==='post'){
    const th=ag.ph+now*ag.sp;
    x=ag.c[0]+Math.cos(th)*ag.r;y=ag.c[1];z=ag.c[2]+Math.sin(th)*ag.r;
    hd=th+Math.PI/2;
   }else{                                              // party
    const r=partyPos(ag,now);
    if(!r){hide=true;x=y=z=0;}
    else{const p=r[0];x=p[0]+ag.off[0];y=p[1];z=p[2]+ag.off[2];moving=!!r[1];
     if(ag.lp){const dx=x-ag.lp[0],dz=z-ag.lp[2];
      if(dx*dx+dz*dz>1e-6)hd=Math.atan2(dz,dx);else hd=ag.hd||0;}
     ag.lp=[x,y,z];}}
   ag.hd=hd;
   if(hide){M.compose(P.set(0,-9999,0),Q,S0);bIM.setMatrixAt(i,M);hIM.setMatrixAt(i,M);continue;}
   const bob=moving?Math.abs(Math.sin(now*4.4+ag.bob))*.22:0;
   Q.setFromAxisAngle(UP,-hd+Math.PI/2);
   P.set(x,y+bob,z);M.compose(P,Q,S);bIM.setMatrixAt(i,M);
   P.set(x,y+bob+3.5,z);M.compose(P,Q,S);hIM.setMatrixAt(i,M);}
  bIM.instanceMatrix.needsUpdate=true;hIM.instanceMatrix.needsUpdate=true;});
 // ---- the millipede herd ----------------------------------------------------
 // A moving level of its own. Each animal is a chain of segments that follow
 // the head through a trail buffer, so the body genuinely snakes instead of
 // rotating rigidly: sample the head's own past at increasing lag and the tail
 // traces the path the head took.
 (function(){const RN=SCREAM.ranch;if(!RN)return;
  const NM=8,SEG=13,LAG=5;                       // frames of lag per segment
  const HIST=SEG*LAG+2;
  const herd=[];
  for(let i=0;i<NM;i++){
   const a0=rng()*TAU,r0=rng()*RN[3]*.6;
   herd.push({x:RN[0]+Math.cos(a0)*r0,z:RN[2]+Math.sin(a0)*r0,
    hd:rng()*TAU,sp:rr(2.2,4.6),turn:rr(-.4,.4),tt:0,
    len:rr(13,25),buf:[],bi:0});}
  const bodyG=new THREE.SphereGeometry(1,9,7);
  const legG=new THREE.BoxGeometry(.22,1,.22);legG.translate(0,-.5,0);
  const mBody=new THREE.InstancedMesh(bodyG,
   new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,metalness:.04}),NM*SEG);
  const mLeg=new THREE.InstancedMesh(legG,
   new THREE.MeshStandardMaterial({color:0x3a241c,roughness:.95,metalness:0}),NM*SEG*2);
  [mBody,mLeg].forEach(m=>{m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
   m.frustumCulled=false;m.userData.probeSkip=true;scene.add(m);});
  {const c=new THREE.Color();
   for(let i=0;i<NM;i++)for(let k=0;k<SEG;k++){
    c.setHex(k%3===0?0xb8683e:0x4a2e22);mBody.setColorAt(i*SEG+k,c);}}
  if(mBody.instanceColor)mBody.instanceColor.needsUpdate=true;
  REGISTER({name:'Screamer village — the millipede herd ('+NM+')',
   x:RN[0],z:RN[2],r:RN[3]+10,h:8});
  const MM=new THREE.Matrix4(),QQ=new THREE.Quaternion(),PP=new THREE.Vector3(),
   SS=new THREE.Vector3(),UPV=new THREE.Vector3(0,1,0);
  tick(function(dt){
   for(let i=0;i<NM;i++){const H=herd[i];
    H.tt-=dt;if(H.tt<=0){H.turn=rr(-.5,.5);H.tt=rr(1.5,4);}
    H.hd+=H.turn*dt;
    let nx=H.x+Math.cos(H.hd)*H.sp*dt,nz=H.z+Math.sin(H.hd)*H.sp*dt;
    // turn back at the stockade rather than walking through it
    const dx=nx-RN[0],dz=nz-RN[2],m2=Math.hypot(dx,dz);
    if(m2>RN[3]*.78){H.hd=Math.atan2(RN[2]-H.z,RN[0]-H.x)+rr(-.6,.6);
     nx=H.x+Math.cos(H.hd)*H.sp*dt;nz=H.z+Math.sin(H.hd)*H.sp*dt;}
    H.x=nx;H.z=nz;
    H.buf[H.bi]=[H.x,H.z,H.hd];H.bi=(H.bi+1)%HIST;
    for(let k=0;k<SEG;k++){
     const b=H.buf[(H.bi-1-k*LAG+HIST*3)%HIST]||[H.x,H.z,H.hd];
     const t=k/(SEG-1),r=H.len*.085*(1-.45*Math.abs(t*2-1));
     const idx=i*SEG+k;
     QQ.setFromAxisAngle(UPV,-b[2]);
     PP.set(b[0],RN[1]+r*.85,b[1]);SS.set(r*1.2,r,r*1.1);
     MM.compose(PP,QQ,SS);mBody.setMatrixAt(idx,MM);
     for(let sd=0;sd<2;sd++){
      const off=(sd?1:-1)*r*1.15;
      PP.set(b[0]-Math.sin(b[2])*off,RN[1]+r*.75,b[1]+Math.cos(b[2])*off);
      SS.set(r*.9,r*1.5,r*.9);
      QQ.setFromAxisAngle(UPV,-b[2]);
      MM.compose(PP,QQ,SS);mLeg.setMatrixAt(idx*2+sd,MM);}}}
   mBody.instanceMatrix.needsUpdate=true;mLeg.instanceMatrix.needsUpdate=true;});
  window._millipedes=NM;})();

 window._agents=N;window._life={agents:A,bodies:bIM};
})();
