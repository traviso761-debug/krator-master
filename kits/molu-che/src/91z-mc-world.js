// ================================================================= HOST WORLD HOOK: drawn ground, core/water streams, detail dedup & exports
// Runs at 91z, after 91f-furnish.js / 91r-mc-roomlight.js and before 92-world.js's initial buildWorld(). Scales the steppe
// ground plane over all four Molu-Che rows, registers KDRAWN, wires library textures onto door hardware and room fallback
// material, deduplicates furniture detail shader programs (K1), draws flowing cistern/seep streams, rebuilds KROOMLIGHT, and exposes mcDims().
(function(){
 if(typeof groundM!=='undefined'){
  groundM.name='ground';
  groundM.position.z=-80;
  groundM.scale.set(1.5,1.5,1);
  if(typeof groundMat!=='undefined'){
   for(const t of [groundMat.map,groundMat.normalMap,groundMat.roughnessMap])if(t)t.repeat.multiplyScalar(1.5);
  }
  groundM.updateMatrixWorld(true);
  if(typeof KDRAWN!=='undefined'){
   const half=GROUND_SIZE*1.5*0.5;
   KDRAWN.add(KDRAWN.grid({x0:-half,z0:-80-half,x1:half,z1:-80+half,nx:2,nz:2,h:()=>0}));
  }
 }
 if(typeof svHwMat==='function'&&MAT.bronze&&MAT.bronze.map){
  const hw=svHwMat();
  hw.map=MAT.bronze.map;hw.normalMap=MAT.bronze.normalMap;hw.roughnessMap=MAT.bronze.roughnessMap;
  const L=MAT.bronze.userData&&MAT.bronze.userData.lib;
  if(L)matHook(hw,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));
 }
 if(MAT.room&&MAT.limewash&&MAT.limewash.map&&!MAT.room.map){
  MAT.room.map=MAT.limewash.map;MAT.room.normalMap=MAT.limewash.normalMap;MAT.room.roughnessMap=MAT.limewash.roughnessMap;
  const Ll=MAT.limewash.userData&&MAT.limewash.userData.lib;
  if(Ll)matHook(MAT.room,'lib'+KMAT.libKey(Ll),sh=>KMAT.libHooks(sh,Ll));
 }

 const mcPrevBuild=buildWorld;
 buildWorld=function(){
  if(typeof WATER!=='undefined'){
   for(const D of WATER.drawn||[]){if(D.mesh){scene.remove(D.mesh);if(D.mesh.geometry)D.mesh.geometry.dispose();}}
   if(WATER.drawn)WATER.drawn.length=0;
   if(WATER.surfaces)WATER.surfaces.length=0;
  }
  const W0=mcPrevBuild();
  if(typeof SVF!=='undefined'&&SVF.group){
   SVF.group.traverse(m=>{
    if(!m.isMesh||!m.material)return;
    if(!m.material.isMeshBasicMaterial&&!m.material.transparent&&!m.material.map){
     m.material.userData.family=m.material.userData.family||'wood';
     if(svfDetail(m.material))SVF.detailed.push(m.material.userData.family);
    }
    const hk=m.material.userData&&m.material.userData.hooks;
    if(hk&&hk.length===1&&hk[0].key.indexOf('fdet|')===0){
     m.material.customProgramCacheKey=()=>'fdet';
    }
   });
  }
  if(typeof WATER!=='undefined'){
   for(const r of REG){
    if(!r.river)continue;
    const S=WATER.flow({name:r.river.name,pts:r.river.pts,width:r.river.width,speed:r.river.speed});
    WATER.drawFlow(S,{THREE,scene,shallow:0x44888e,deep:0x204d56,roughness:.12,envMapIntensity:.32});
   }
  }
  if(typeof mcRoomLightRebuild==='function')mcRoomLightRebuild();
  return W0;
 };

 function mcDims(){
  const out={};
  for(const k in DEFS){
   const d=DEFS[k];if(d.cls!=='building')continue;
   out[k]={cls:d.cls,name:d.name,w:d.w,d:d.d,h:d.h,fw:d.w*.92,fd:d.d*.92,
    style:d.tags.style||null,wealth:d.tags.wealth||null,
    types:d.tags.types||null,role:d.tags.role||null,job:d.tags.job||null,
    cut:!!d.cut,variants:1};
  }
  return out;
 }
 globalThis.mcDims=mcDims;
})();
