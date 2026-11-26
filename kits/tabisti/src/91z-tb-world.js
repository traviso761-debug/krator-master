/* ================================================================= HOST WORLD HOOK: drawn ground, core/water shadirvans, detail dedup & exports
   Runs at 91z, after 91f-furnish.js / 91r-tb-roomlight.js and before 92-world.js's initial buildWorld(). Scales the ground
   plane over all five Urban Tabisti rows, registers KDRAWN, wires library textures onto door hardware and room fallback material,
   deduplicates furniture detail shader programs (K1), draws flowing turquoise core/water shadirvans & canals, rebuilds KROOMLIGHT,
   and exposes tbDims(). */
(function(){
 if(typeof groundM!=='undefined'){
  groundM.name='ground';
  groundM.position.z=-105;
  groundM.scale.set(1.75,1.75,1);
  if(typeof groundMat!=='undefined'){
   for(const t of [groundMat.map,groundMat.normalMap,groundMat.roughnessMap])if(t)t.repeat.multiplyScalar(1.75);
   const Lg=KMAT.packed&&KMAT.packed(KIT.pack,'ground');
   if(Lg){
    Lg._fam='ground';
    matHook(groundMat,'lib'+KMAT.libKey(Lg),sh=>KMAT.libHooks(sh,Lg));
   }
  }
  groundM.updateMatrixWorld(true);
  if(typeof KDRAWN!=='undefined'){
   const half=GROUND_SIZE*1.75*0.5;
   KDRAWN.add(KDRAWN.grid({x0:-half,z0:-105-half,x1:half,z1:-105+half,nx:2,nz:2,h:()=>0}));
  }
 }
 if(typeof svHwMat==='function'&&MAT.bronze&&MAT.bronze.map){
  const hw=svHwMat();
  hw.map=MAT.bronze.map;hw.normalMap=MAT.bronze.normalMap;hw.roughnessMap=MAT.bronze.roughnessMap;
  const L=MAT.bronze.userData&&MAT.bronze.userData.lib;
  if(L)matHook(hw,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));
 }
 if(MAT.room&&MAT.stucco&&MAT.stucco.map&&!MAT.room.map){
  MAT.room.map=MAT.stucco.map;MAT.room.normalMap=MAT.stucco.normalMap;MAT.room.roughnessMap=MAT.stucco.roughnessMap;
  const Ls=MAT.stucco.userData&&MAT.stucco.userData.lib;
  if(Ls)matHook(MAT.room,'lib'+KMAT.libKey(Ls),sh=>KMAT.libHooks(sh,Ls));
 }

 const tbPrevBuild=buildWorld;
 buildWorld=function(){
  if(typeof WATER!=='undefined'){
   for(const D of WATER.drawn||[]){if(D.mesh){scene.remove(D.mesh);if(D.mesh.geometry)D.mesh.geometry.dispose();}}
   if(WATER.drawn)WATER.drawn.length=0;
   if(WATER.surfaces)WATER.surfaces.length=0;
  }
  const W0=tbPrevBuild();
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
    for(const rv of (r.rivers||[])){
     const S=WATER.flow({name:rv.name,pts:rv.pts,width:rv.width,speed:rv.speed});
     WATER.drawFlow(S,{THREE,scene,shallow:0x2aa09a,deep:0x145058,roughness:.11,envMapIntensity:.35});
    }
   }
  }
  if(typeof tbRoomLightRebuild==='function')tbRoomLightRebuild();
  return W0;
 };

 function tbDims(){
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
 globalThis.tbDims=tbDims;
})();
