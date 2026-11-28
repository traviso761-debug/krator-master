// ================================================================= HOST WORLD HOOK: drawn ground, core/water streams, detail dedup & exports
// Runs at 91z, after 91f-furnish.js / 91r-ra-roomlight.js and before 92-world.js's initial buildWorld(). Scales the ground
// plane over all four dynastic rows, registers KDRAWN, wires library textures onto door hardware and room fallback material,
// deduplicates furniture detail shader programs (K1), draws flowing core/water streams, rebuilds Stage 7 KROOMLIGHT, and exposes raDims().
(function(){
 if(typeof groundM!=='undefined'){
  groundM.name='ground';
  groundM.position.z=-110;
  groundM.scale.set(1.6,1.6,1);
  if(typeof groundMat!=='undefined'){
   for(const t of [groundMat.map,groundMat.normalMap,groundMat.roughnessMap])if(t)t.repeat.multiplyScalar(1.6);
  }
  groundM.updateMatrixWorld(true);
  if(typeof KDRAWN!=='undefined'){
   const half=GROUND_SIZE*1.6*0.5;
   KDRAWN.add(KDRAWN.grid({x0:-half,z0:-110-half,x1:half,z1:-110+half,nx:2,nz:2,h:()=>0}));
  }
 }
 if(typeof svHwMat==='function'&&MAT.bronze&&MAT.bronze.map){
  const hw=svHwMat();
  hw.map=MAT.bronze.map;hw.normalMap=MAT.bronze.normalMap;hw.roughnessMap=MAT.bronze.roughnessMap;
  const L=MAT.bronze.userData&&MAT.bronze.userData.lib;
  if(L)matHook(hw,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));
 }
 if(MAT.room&&MAT.plaster&&MAT.plaster.map&&!MAT.room.map){
  MAT.room.map=MAT.plaster.map;MAT.room.normalMap=MAT.plaster.normalMap;MAT.room.roughnessMap=MAT.plaster.roughnessMap;
  const Lp=MAT.plaster.userData&&MAT.plaster.userData.lib;
  if(Lp)matHook(MAT.room,'lib'+KMAT.libKey(Lp),sh=>KMAT.libHooks(sh,Lp));
 }

 const raPrevBuild=buildWorld;
 buildWorld=function(){
  if(typeof WATER!=='undefined'){
   for(const D of WATER.drawn||[]){if(D.mesh){scene.remove(D.mesh);if(D.mesh.geometry)D.mesh.geometry.dispose();}}
   if(WATER.drawn)WATER.drawn.length=0;
   if(WATER.surfaces)WATER.surfaces.length=0;
  }
  const W0=raPrevBuild();
  if(typeof SVF!=='undefined'&&SVF.group){
   SVF.group.traverse(m=>{
    if(!m.isMesh||!m.material)return;
    if(!m.material.isMeshBasicMaterial&&!m.material.transparent&&!m.material.map){
     m.material.userData.family=m.material.userData.family||'wood';
     if(svfDetail(m.material))SVF.detailed.push(m.material.userData.family);
    }
    /* K1 Furniture Shader Program Deduplication: svfDetail uses uniforms uDetTile & uDetGain with identical GLSL across all f_* families */
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
    WATER.drawFlow(S,{THREE,scene,shallow:0x3e888a,deep:0x184852,roughness:.12,envMapIntensity:.32});
   }
  }
  if(typeof raRoomLightRebuild==='function')raRoomLightRebuild();
  return W0;
 };

 function raDims(){
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
 globalThis.raDims=raDims;
})();
