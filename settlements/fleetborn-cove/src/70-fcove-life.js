// ================================================================= FLEETBORN COVE — articulated multi-part 3D citizen crowds & ray-picker (FCOVE_LIFE)  [draw]
// Renders the tide- and moot-reactive citizens planned by FCOVE_LIFE_PLAN (src/43-fcove-life-plan.js) in 5 InstancedMesh
// draw calls (<= 6 draw calls total):
//   1. _bodyMesh : sculpted tunic/torso, waist sash & striding/leaning/swimming legs (tunicHex per citizen)
//   2. _headMesh : head & neck tinted strictly from peoples.json skin stops (cflit_qbon, shore_kin, hueru_kuran)
//   3. _hatMesh  : cropped/braided hair, seal-slick dive-hood + bone-goggle brow, or woven pandanus sun-hat
//   4. _armsMesh : twin articulated arms swinging live for walking, scraping, caulking, raking, conversing, or swimming
//   5. _toolMesh : held tools swinging with the working arm (paktong dive-spear, barnacle scraper, caulking mallet,
//                  golden sea-byssus basket, or kiln/foundry ash-rake)
// Exposes click-to-inspect & 12 px hover ray-pick (pickRay / inspectHit) for core/host's inspector.
const FCOVE_LIFE=(function buildFcoveLife(){
 const CAP=860;
 const LY=FCOVE_LAYOUT;
 const W=typeof FCOVE_WORLD!=='undefined'?FCOVE_WORLD:(FCOVE_SCENE&&FCOVE_SCENE.world?FCOVE_SCENE.world:null);

 const plan=FCOVE_LIFE_PLAN.create({
  layout:LY,
  names:FCOVE_NAMES,
  ksched:KSCHED,
  terrainH:terrainH,
  villagesData:W?W.villagesData:null,
  peoples:typeof FCOVE_PEOPLES!=='undefined'?FCOVE_PEOPLES:null
 });

 if(typeof SIM!=='undefined')plan.registerSimActors(SIM);
 const tagIds=(typeof KTAGS!=='undefined'&&KTAGS.page)?plan.registerTags(KTAGS.page):[];

 function mergeGeos(list){
  let nv=0,ni=0;
  for(let i=0;i<list.length;i++){
   const g=list[i];
   nv+=g.attributes.position.count;
   ni+=g.index?g.index.count:g.attributes.position.count;
  }
  const P=new Float32Array(nv*3),N=new Float32Array(nv*3),I=new Uint16Array(ni);
  let vo=0,io=0;
  for(let i=0;i<list.length;i++){
   const g=list[i],pa=g.attributes.position.array,na=g.attributes.normal.array,vc=g.attributes.position.count;
   P.set(pa,vo*3);
   N.set(na,vo*3);
   if(g.index){
    const ix=g.index.array;
    for(let k=0;k<ix.length;k++)I[io+k]=ix[k]+vo;
    io+=ix.length;
   }else{
    for(let k=0;k<vc;k++)I[io+k]=vo+k;
    io+=vc;
   }
   vo+=vc;
   g.dispose();
  }
  const out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.BufferAttribute(P,3));
  out.setAttribute('normal',new THREE.BufferAttribute(N,3));
  out.setIndex(new THREE.BufferAttribute(I,1));
  out.computeBoundingSphere();
  out.computeBoundingBox();
  return out;
 }

 /* 1. Articulated humanoid body (legs + kilt/hips + tapered torso, foot at y = 0, shoulder at y = 1.38 m) */
 const legL=new THREE.CylinderGeometry(0.068,0.055,0.74,6);
 legL.translate(-0.10,0.37,0.02);
 const legR=new THREE.CylinderGeometry(0.068,0.055,0.74,6);
 legR.translate(0.10,0.37,-0.02);
 const hips=new THREE.CylinderGeometry(0.19,0.22,0.28,8);
 hips.translate(0,0.82,0);
 const torso=new THREE.CylinderGeometry(0.21,0.18,0.52,8);
 torso.translate(0,1.16,0);
 const bodyGeo=mergeGeos([legL,legR,hips,torso]);

 /* 2. Head & neck (origin at y = 0 so same base transform or pitched swimmer transform seats cleanly) */
 const neck=new THREE.CylinderGeometry(0.065,0.075,0.12,6);
 neck.translate(0,1.44,0);
 const skull=new THREE.SphereGeometry(0.145,8,6);
 skull.scale(0.92,1.06,0.96);
 skull.translate(0,1.58,0.01);
 const headGeo=mergeGeos([neck,skull]);

 /* 3. Headgear / hair-bun / sun-hat / dive-hood */
 const capCrown=new THREE.CylinderGeometry(0.08,0.17,0.11,8);
 capCrown.translate(0,1.69,0);
 const capBrim=new THREE.CylinderGeometry(0.22,0.24,0.03,8);
 capBrim.translate(0,1.64,0);
 const hatGeo=mergeGeos([capCrown,capBrim]);

 /* 4. Twin articulated arms (pivoted at shoulder origin y = 0, hanging/extending forward along +z/-y) */
 const armL=new THREE.CylinderGeometry(0.052,0.042,0.56,6);
 armL.rotateX(0.32);
 armL.translate(-0.24,-0.24,0.10);
 const armR=new THREE.CylinderGeometry(0.052,0.042,0.56,6);
 armR.rotateX(0.52);
 armR.translate(0.24,-0.22,0.16);
 const armsGeo=mergeGeos([armL,armR]);

 /* 5. Held working tool / spear / basket / mallet / rake (pivoted at shoulder origin with right hand at [0.24, -0.44, 0.30]) */
 const shaft=new THREE.CylinderGeometry(0.022,0.022,1.15,5);
 shaft.rotateX(1.18);
 shaft.translate(0.24,-0.34,0.48);
 const headBit=new THREE.BoxGeometry(0.16,0.12,0.20);
 headBit.translate(0.24,-0.16,0.88);
 const toolGeo=mergeGeos([shaft,headBit]);

 const bodyMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.82,metalness:0.04});
 const headMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.74,metalness:0.02});
 const hatMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.78,metalness:0.06});
 const armsMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.76,metalness:0.03});
 const toolMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.42,metalness:0.48});

 const lifeGrp=new THREE.Group();
 lifeGrp.name='fcove:citizens-life';
 lifeGrp.userData.probeSkip=true;
 lifeGrp.userData.lodSkip=true;

 function mkInst(geo,mat,nm){
  const m=new THREE.InstancedMesh(geo,mat,CAP);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(CAP*3).fill(1),3);
  m.count=0;
  m.frustumCulled=false;
  m.castShadow=false;
  m.receiveShadow=false;
  m.name=nm;
  m.userData.probeSkip=true;
  m.userData.lodSkip=true;
  m.userData.fcoveLife=true;
  m.userData.inspectLabel='Fleetborn Cove Citizen';
  lifeGrp.add(m);
  return m;
 }

 const _bodyMesh=mkInst(bodyGeo,bodyMat,'fcove:life-body');
 const _headMesh=mkInst(headGeo,headMat,'fcove:life-head');
 const _hatMesh=mkInst(hatGeo,hatMat,'fcove:life-hat');
 const _armsMesh=mkInst(armsGeo,armsMat,'fcove:life-arms');
 const _toolMesh=mkInst(toolGeo,toolMat,'fcove:life-tool');
 scene.add(lifeGrp);

 const TOOL_HEX={
  spear:0xd8d4c8,
  scraper:0xcad0cc,
  mallet:0x7c5332,
  basket:0xd4a438,
  rake:0x969e9c,
  none:0x888888
 };

 const _m4=new THREE.Matrix4();
 const _eu=new THREE.Euler(0,0,0,'YXZ');
 const _q4=new THREE.Quaternion();
 const _pos=new THREE.Vector3();
 const _scl=new THREE.Vector3(1,1,1);
 const _zero=new THREE.Vector3(0,0,0);
 const _col=new THREE.Color();

 let curPoses=[];
 let curSummary=null;
 let lastColorSig='';
 let lifeClock=0;
 let tagSyncAcc=0;

 function readLiveState(motionSec){
  const T=(typeof COVE_TIDE!=='undefined'&&COVE_TIDE.T)?COVE_TIDE.T:null;
  const lv=T?T.level:0;
  const live=!!(T&&T.site&&T.mode!=='hold');
  const clk=(typeof KHOST!=='undefined'&&KHOST.host)?KHOST.host.clock:null;
  const wSec=live?(T.mode==='run'?T.tw:(clk?KTIDE.worldSeconds(clk):0)):0;
  const curMps=live?FCOVE_RULES.sillVelocity(wSec):(lv<-0.5?-3.8:lv>0.5?3.8:0);
  const dayIdx=live?Math.floor(wSec/86400):(clk?clk.day:(FCOVE_SCENE?FCOVE_SCENE.syncedDay:44));
  const rDay=FCOVE_RULES.rotorDay(dayIdx);
  const smeltOn=live?rDay.smeltActive:(Math.abs(curMps)>3.0);
  const activeFleets=(W&&typeof W.dayState==='function')?W.dayState(dayIdx).fleetIds:[];
  return{
   seaLevel:lv,
   sillVelocity:curMps,
   smeltActive:smeltOn,
   day:dayIdx,
   activeFleetIds:activeFleets,
   motionSec:motionSec
  };
 }

 function update(dt){
  const step=dt==null?0.016:Math.max(0,Math.min(0.1,dt));
  lifeClock+=step;
  const st=readLiveState(lifeClock);
  const poses=plan.poseAll(st);
  const n=Math.min(CAP,poses.length);
  curPoses=poses;

  const sig=n+'|'+st.activeFleetIds.join(',');
  const recolor=(sig!==lastColorSig);
  if(recolor)lastColorSig=sig;

  for(let i=0;i<n;i++){
   const p=poses[i],c=p.citizen;
   const ph=(i*1.71)%6.283;
   let pitch=0,bob=0,armPitch=0,hatScaleX=1,hatScaleY=1;

   if(p.isDiving){
    pitch=p.mode==='diving'?1.38:1.16;
    bob=0.06*Math.sin(lifeClock*2.4+ph);
    armPitch=-0.55+0.58*Math.sin(lifeClock*3.1+ph);
    hatScaleX=0.72;hatScaleY=0.85;
   }else if(p.mode==='walking'){
    pitch=0.04;
    bob=Math.abs(Math.sin(lifeClock*5.4+ph))*0.045;
    armPitch=0.42*Math.sin(lifeClock*5.4+ph);
   }else if(p.action==='careen_scrape'||p.action==='careen_caulk'||p.action==='smelt_campaign'){
    pitch=0.22+0.06*Math.sin(lifeClock*4.8+ph);
    armPitch=-0.52+0.55*Math.sin(lifeClock*4.8+ph);
   }else if(p.action==='byssus_gather'){
    pitch=0.34+0.08*Math.sin(lifeClock*3.2+ph);
    armPitch=-0.35+0.38*Math.sin(lifeClock*3.2+ph);
   }else{
    pitch=0.02;
    armPitch=-0.18+0.24*Math.sin(lifeClock*2.6+ph);
   }

   if(c.hatKind!=='sun_hat'){hatScaleX=0.72;hatScaleY=0.82;}

   _pos.set(p.x,p.y+bob,p.z);
   _eu.set(pitch,p.yaw,0,'YXZ');
   _q4.setFromEuler(_eu);
   _scl.set(1,1,1);
   _m4.compose(_pos,_q4,_scl);
   _bodyMesh.setMatrixAt(i,_m4);
   _headMesh.setMatrixAt(i,_m4);

   _scl.set(hatScaleX,hatScaleY,hatScaleX);
   _m4.compose(_pos,_q4,_scl);
   _hatMesh.setMatrixAt(i,_m4);

   /* Shoulder pivot in world space */
   const shLocalY=1.34;
   const cy=Math.cos(p.yaw),sy=Math.sin(p.yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
   const shX=p.x+sy*sp*shLocalY;
   const shY=p.y+bob+cp*shLocalY;
   const shZ=p.z+cy*sp*shLocalY;
   _pos.set(shX,shY,shZ);
   _eu.set(pitch+armPitch,p.yaw,0,'YXZ');
   _q4.setFromEuler(_eu);
   _scl.set(1,1,1);
   _m4.compose(_pos,_q4,_scl);
   _armsMesh.setMatrixAt(i,_m4);

   if(p.tool&&p.tool!=='none'){
    if(p.tool==='spear')_scl.set(0.85,0.85,1.45);
    else if(p.tool==='basket')_scl.set(1.55,1.35,0.55);
    else if(p.tool==='rake')_scl.set(0.95,0.95,1.28);
    else _scl.set(1,1,1);
    _m4.compose(_pos,_q4,_scl);
    _toolMesh.setMatrixAt(i,_m4);
   }else{
    _m4.compose(_pos,_q4,_zero);
    _toolMesh.setMatrixAt(i,_m4);
   }

   if(recolor){
    _col.setHex(c.tunicHex).convertSRGBToLinear();
    _bodyMesh.setColorAt(i,_col);
    _col.setStyle(c.skin).convertSRGBToLinear();
    _headMesh.setColorAt(i,_col);
    _armsMesh.setColorAt(i,_col);
    if(c.hatKind==='dive_hood')_col.setHex(0x1b2836).convertSRGBToLinear();
    else if(c.hatKind==='sun_hat')_col.setHex(0xc4a45e).convertSRGBToLinear();
    else _col.setStyle(c.hair).convertSRGBToLinear();
    _hatMesh.setColorAt(i,_col);
    _col.setHex(TOOL_HEX[p.tool]==null?0x999999:TOOL_HEX[p.tool]).convertSRGBToLinear();
    _toolMesh.setColorAt(i,_col);
   }
  }

  [_bodyMesh,_headMesh,_hatMesh,_armsMesh,_toolMesh].forEach(m=>{
   m.count=n;
   m.instanceMatrix.needsUpdate=true;
   if(recolor&&m.instanceColor)m.instanceColor.needsUpdate=true;
  });

  curSummary=plan.summary(st);

  tagSyncAcc+=step;
  if(tagSyncAcc>=1.5&&typeof KTAGS!=='undefined'&&KTAGS.page){
   tagSyncAcc=0;
   for(let i=0;i<n;i++){
    const p=poses[i];
    const r=KTAGS.page.get('life.'+p.citizen.id);
    if(r)r.at=[p.x,p.y,p.z];
   }
  }
  return n;
 }

 function formatCitizenCard(p){
  const c=p.citizen;
  const st=readLiveState(lifeClock);
  const sgn=st.seaLevel>=0?'+':'';
  return c.name+' — '+c.roleLabel+'\n'+
   'People: '+c.peopleLabel+' · Dive: '+c.diveLabel+'\n'+
   'Affiliation: '+c.affiliationLabel+' · Mode: '+p.mode.toUpperCase()+'\n'+
   'Task: '+p.task+'\n'+
   'Tide '+sgn+st.seaLevel.toFixed(2)+' m · at ['+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+']';
 }

 /* Screen-space ~12 px angular cone ray-picker against all active citizens */
 function pickRay(ray,cam,maxPx,viewH){
  if(!ray||!curPoses.length)return null;
  const ox=ray.origin.x,oy=ray.origin.y,oz=ray.origin.z;
  const dx=ray.direction.x,dy=ray.direction.y,dz=ray.direction.z;
  const fovRad=((cam&&cam.fov)?cam.fov:52)*Math.PI/180;
  const vh=viewH==null?(typeof window!=='undefined'&&window.innerHeight?window.innerHeight:800):viewH;
  const pxTol=maxPx==null?12:maxPx;
  const radPerPx=2*Math.tan(fovRad*0.5)/Math.max(200,vh);

  let bestIdx=-1,bestDist=1e9;
  for(let i=0;i<curPoses.length;i++){
   const p=curPoses[i];
   const cy=p.isDiving?(p.y+0.25):(p.y+0.92);
   const vx=p.x-ox,vy=cy-oy,vz=p.z-oz;
   const t=vx*dx+vy*dy+vz*dz;
   if(t<1.0||t>bestDist)continue;
   const px=vx-dx*t,py=vy-dy*t,pz=vz-dz*t;
   const perp=Math.hypot(px,py,pz);
   const allow=Math.max(0.58,t*radPerPx*pxTol);
   if(perp<=allow&&Math.abs(py)<=Math.max(1.05,allow*1.15)){
    bestDist=t;
    bestIdx=i;
   }
  }
  if(bestIdx<0)return null;
  const hitPose=curPoses[bestIdx];
  const tagRec=(typeof KTAGS!=='undefined'&&KTAGS.page)?KTAGS.page.get('life.'+hitPose.citizen.id):null;
  if(tagRec)tagRec.at=[hitPose.x,hitPose.y,hitPose.z];
  return{
   index:bestIdx,
   distance:bestDist,
   pose:hitPose,
   citizen:hitPose.citizen,
   rec:tagRec,
   point:new THREE.Vector3(hitPose.x,hitPose.y+0.9,hitPose.z),
   t:formatCitizenCard(hitPose)
  };
 }

 function inspectHit(hit,cam){
  if(!hit)return null;
  if(hit.object&&hit.object.userData&&hit.object.userData.fcoveLife&&hit.instanceId!=null&&hit.instanceId<curPoses.length){
   const hp=curPoses[hit.instanceId];
   const tagRec=(typeof KTAGS!=='undefined'&&KTAGS.page)?KTAGS.page.get('life.'+hp.citizen.id):null;
   if(tagRec)tagRec.at=[hp.x,hp.y,hp.z];
   return{
    pose:hp,
    citizen:hp.citizen,
    rec:tagRec,
    point:hit.point||new THREE.Vector3(hp.x,hp.y+0.9,hp.z),
    t:formatCitizenCard(hp)
   };
  }
  if(cam&&hit.point){
   const dir=hit.point.clone().sub(cam.position);
   const hitDist=dir.length();
   if(hitDist>0.5){
    dir.divideScalar(hitDist);
    const picked=pickRay({origin:cam.position,direction:dir},cam,12);
    if(picked&&picked.distance<=hitDist+1.5)return picked;
   }
  }
  return null;
 }

 update(0);
 tick(function stepFcoveLife(dt){
  update(dt);
 });

 return{
  plan:plan,
  group:lifeGrp,
  meshes:[_bodyMesh,_headMesh,_hatMesh,_armsMesh,_toolMesh],
  drawCalls:5,
  tagIds:tagIds,
  update:update,
  poses:()=>curPoses,
  status:()=>curSummary||plan.summary(readLiveState(lifeClock)),
  audit:()=>plan.auditState(readLiveState(lifeClock)),
  pickRay:pickRay,
  inspectHit:inspectHit
 };
})();
window.FCOVE_LIFE=FCOVE_LIFE;
