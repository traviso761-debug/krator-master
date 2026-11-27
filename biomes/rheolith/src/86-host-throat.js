// ================================================================= HOST — abiotic bismuth pockets (KGEODE) & live THROAT valve (PLAN.md sections 4, 6, 7)
// 1. Places KGEODE native bismuth hopper-crystal pockets round the fumaroles so abiotic stepped hoppers sit visibly beside
//    biogenic Bismuth Hair-Nest whiskers.
// 2. Drives the interactive central Breached Throat ([Gag throat], [Salt seam], [Heavy dross], [Reset vent]) through
//    RHEO_PHYS.choke(...), moving the inner Choke-Coral baffle ring, Flux-Creeper cushions, surface SiF4 frost bloom, and
//    the geyser column's cycle/height in real time.
const BISMUTH=(function(){
 if(typeof KGEODE==='undefined'||!KGEODE.around||!KGEODE.draw)return{n:0,pockets:[]};
 const normal=(x,z)=>DRAWN_N(x,z,.5);
 const sources=VENTS.map((v,i)=>({x:v.x,z:v.z,R:i===0?PIT.r*1.12:8.5,s:i===3?1:.75}));
 const R=KGEODE.around({
  sources,world:5166,ground:DRAWN_H,normal,
  n:[3,6],reach:.65,r:[.18,.44],minerals:{bismuth:1},steep:.35,
  accept:r=>waterH(r.x,r.z)<DRAWN_H(r.x,r.z)-.2&&Math.hypot(r.x-PIT.x,r.z-PIT.z)>PIT.throatR*1.25
 });
 const D=KGEODE.draw(R,{THREE,chunk:400});
 D.group.userData.host=true;
 D.group.userData.inspectLabel='Abiotic Native Bismuth Hopper Pocket (stepped rectangular spirals, contrasting with biogenic Bismuth Hair-Nests)';
 const pp=[];
 R.forEach(p=>pp.push(p.x,p.y,p.z));
 D.group.userData.probePoints=pp;
 scene.add(D.group);
 TICKS.push(()=>D.update(camera.position));
 D.update(camera.position);
 if(R.length){
  REGISTER({
   name:'Native bismuth hopper pockets round the fumaroles ('+R.length+' pockets)',
   key:'bismuth.vents',x:0,z:0,y:PIT.floor-4,r:120,h:60,
   tags:{geode:{kind:'vent',mineral:'bismuth',n:R.length}}
  });
 }
 BIO.tally(D.tris,R.length,D.meshes==null?1:D.meshes,'host');
 return{n:R.length,tris:D.tris,pockets:R,group:D.group,draw:D};
})();

const THROAT=(function(){
 const baseRec={aperture:PIT.aperture0,pressure:0.22,heatMW:15,tempC:PIT.throatT,graze:0.15};
 const doses={gagCake:0,fluxSalt:0,heavyDross:0};
 let tHours=0.6,blastAt=-1e9,mode='natural';

 // Finds exact radial point on the drawn inner shaft wall where DRAWN_H reaches targetY
 function wallAtY(ang,targetY){
  const ca=Math.cos(ang),sa=Math.sin(ang);
  let lo=PIT.throatR*.50,hi=PIT.r*.92;
  for(let k=0;k<14;k++){
   const mid=(lo+hi)*.5;
   if(DRAWN_H(PIT.x+ca*mid,PIT.z+sa*mid)<targetY)lo=mid;else hi=mid;
  }
  const r=(lo+hi)*.5,x=PIT.x+ca*r,z=PIT.z+sa*r,y=DRAWN_H(x,z),n=DRAWN_N(x,z,.45);
  return{x,y,z,r,n};
 }

 // Live dynamic meshes rooted directly into the central shaft wall (12 Choke-Coral jaws + 12 Flux-Creeper cushions + 12 rim frost patches)
 const nJaws=12,jaws=[];
 const jawGroup=new THREE.Group();jawGroup.userData.host=true;scene.add(jawGroup);
 const coralGeo=RHEO.GEO.chokecoral,creepGeo=RHEO.GEO.fluxcreeper,frostGeo=RHEO.GEO.etchfrost;
 const jawMesh=new THREE.InstancedMesh(coralGeo,RHEO.M.sinter,nJaws);
 jawMesh.userData.host=true;jawMesh.userData.probeSkip=true;
 jawMesh.userData.inspectLabel='Live Choke-Coral Constrictor Ring (throttles the main conduit)';
 jawGroup.add(jawMesh);

 const creepMesh=new THREE.InstancedMesh(creepGeo,RHEO.M.creeper,nJaws);
 creepMesh.userData.host=true;creepMesh.userData.probeSkip=true;
 creepMesh.userData.inspectLabel='Live Flux-Creeper Grazer Ring (dissolves silicate baffles when salted)';
 jawGroup.add(creepMesh);

 const frostMesh=new THREE.InstancedMesh(frostGeo,RHEO.M.frost,nJaws);
 frostMesh.userData.host=true;frostMesh.userData.probeSkip=true;
 frostMesh.userData.inspectLabel='Fresh SiF4 Etch-Halo Bloom (condenses as fluoride flux dissolves the plug)';
 jawGroup.add(frostMesh);

 for(let i=0;i<nJaws;i++){
  const a=i/nJaws*TAU;
  const wJaw=wallAtY(a,-13.4+.55*Math.sin(i*1.7));
  const wCreep=wallAtY(a+.12,-10.8+.45*Math.cos(i*1.3));
  const rRim=PIT.r*.96,rx0=PIT.x+Math.cos(a+.08)*rRim,rz0=PIT.z+Math.sin(a+.08)*rRim;
  const rn=DRAWN_N(rx0,rz0,.6),ry0=DRAWN_H(rx0,rz0);
  const jn=[wJaw.n[0]*.78,wJaw.n[1]*.78+.22,wJaw.n[2]*.78],jL=Math.hypot(jn[0],jn[1],jn[2])||1;
  jaws.push({
   a,
   jx:wJaw.x-wJaw.n[0]*.06,jy:wJaw.y-wJaw.n[1]*.06,jz:wJaw.z-wJaw.n[2]*.06,jq:qUp([jn[0]/jL,jn[1]/jL,jn[2]/jL],a+Math.PI).clone(),
   cx:wCreep.x-wCreep.n[0]*.05,cy:wCreep.y-wCreep.n[1]*.05,cz:wCreep.z-wCreep.n[2]*.05,cq:qUp(wCreep.n,a).clone(),
   rx:rx0-rn[0]*.05,ry:ry0-rn[1]*.05,rz:rz0-rn[2]*.05,rq:qUp(rn,a).clone()
  });
  jawMesh.setColorAt(i,RHEO.C(RHEO.PAL.coral[i%RHEO.PAL.coral.length]));
  creepMesh.setColorAt(i,RHEO.C(RHEO.PAL.creeper[i%RHEO.PAL.creeper.length]));
  frostMesh.setColorAt(i,RHEO.C(RHEO.PAL.frost[i%RHEO.PAL.frost.length]));
 }
 if(jawMesh.instanceColor)jawMesh.instanceColor.needsUpdate=true;
 if(creepMesh.instanceColor)creepMesh.instanceColor.needsUpdate=true;
 if(frostMesh.instanceColor)frostMesh.instanceColor.needsUpdate=true;

 const m4=new THREE.Matrix4(),p3=new THREE.Vector3(),sc3=new THREE.Vector3();
 let cur=RHEO_PHYS.choke(baseRec,tHours,doses);
 window._throatState=cur;

 function syncMeshes(){
  const ap=cur.aperture,fr=cur.frost,poison=cur.state==='poisoned';
  const jawScale=1.05+1.45*(1-ap);
  const creepScale=.42+1.10*clamp(doses.fluxSalt+.18,0,1.2)*(poison?.45:1);
  const frostScale=doses.fluxSalt>.05?(.32+1.15*fr):Math.max(.02,.32*fr);
  for(let i=0;i<nJaws;i++){
   const J=jaws[i];
   p3.set(J.jx,J.jy,J.jz);
   sc3.set(jawScale,jawScale*(poison?.74:1.12),jawScale);
   m4.compose(p3,J.jq,sc3);
   jawMesh.setMatrixAt(i,m4);

   p3.set(J.cx,J.cy,J.cz);
   sc3.set(creepScale,creepScale,creepScale);
   m4.compose(p3,J.cq,sc3);
   creepMesh.setMatrixAt(i,m4);

   p3.set(J.rx,J.ry,J.rz);
   sc3.set(frostScale,frostScale,frostScale);
   m4.compose(p3,J.rq,sc3);
   frostMesh.setMatrixAt(i,m4);
  }
  jawMesh.instanceMatrix.needsUpdate=true;
  creepMesh.instanceMatrix.needsUpdate=true;
  frostMesh.instanceMatrix.needsUpdate=true;
 }

 function recompute(){
  cur=RHEO_PHYS.choke(baseRec,tHours,doses);
  window._throatState=cur;
  syncMeshes();
  return cur;
 }

 function gag(){
  mode='gag';
  doses.gagCake=1.35;doses.fluxSalt=0;doses.heavyDross=0;
  tHours=Math.max(tHours,7.5);
  return recompute();
 }
 function salt(){
  // If salted from an open throat, carry the primed state if gagCake was active; else dose strong alkali-fluorite salt
  mode='salt';
  if(doses.gagCake<.25&&baseRec.aperture>=.34)doses.gagCake=.45;
  doses.fluxSalt=0.92;doses.heavyDross=0;
  tHours=0.22;
  blastAt=performance.now()*0.001;
  return recompute();
 }
 function dross(){
  mode='dross';
  doses.heavyDross=1.2;doses.fluxSalt=0;doses.gagCake=0.1;
  tHours=2.5;
  return recompute();
 }
 function reset(){
  mode='natural';
  doses.gagCake=0;doses.fluxSalt=0;doses.heavyDross=0;
  tHours=0.6;blastAt=-1e9;
  return recompute();
 }

 syncMeshes();
 tick(()=>{
  if(mode==='gag'&&cur.state!=='blowout'){
   tHours=Math.min(34,tHours+0.018);
   const prev=cur.state;
   recompute();
   if(prev!=='blowout'&&cur.state==='blowout')blastAt=performance.now()*0.001;
  }
 });

 return{
  get state(){return cur;},
  get doses(){return doses;},
  get tHours(){return tHours;},
  get blastAt(){return blastAt;},
  jaws,baseRec,gag,salt,dross,reset
 };
})();
window.THROAT=THROAT;
