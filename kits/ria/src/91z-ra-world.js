// ================================================================= HOST WORLD HOOK: drawn ground, core/water streams, detail maps & exports
// Runs at 91z, after 91f-furnish.js and before 92-world.js's initial buildWorld(). Scales the ground plane over both dynastic
// rows, registers KDRAWN, wires library textures onto door hardware and room fallback material, draws flowing core/water
// canal, spring-pool and boat-lift streams, and exposes raDims().
(function(){
 if(typeof groundM!=='undefined'){
  groundM.name='ground';
  groundM.position.z=-60;
  groundM.scale.set(1.5,1.5,1);
  if(typeof groundMat!=='undefined'){
   for(const t of [groundMat.map,groundMat.normalMap,groundMat.roughnessMap])if(t)t.repeat.multiplyScalar(1.5);
  }
  groundM.updateMatrixWorld(true);
  if(typeof KDRAWN!=='undefined'){
   const half=GROUND_SIZE*1.5*0.5;
   KDRAWN.add(KDRAWN.grid({x0:-half,z0:-60-half,x1:half,z1:-60+half,nx:2,nz:2,h:()=>0}));
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
    if(m.isMesh&&!m.material.isMeshBasicMaterial&&!m.material.transparent&&!m.material.map){
     m.material.userData.family=m.material.userData.family||'wood';
     if(svfDetail(m.material))SVF.detailed.push(m.material.userData.family);
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
  return W0;
 };

 function raDims(){
  const out={};
  for(const k in DEFS){
   const d=DEFS[k];if(d.cls!=='building')continue;
   out[k]={cls:d.cls,w:d.w,d:d.d,h:d.h,style:d.tags.style||null,wealth:d.tags.wealth||null,
    types:d.tags.types||null,role:d.tags.role||null,job:d.tags.job||null,cut:!!d.cut};
  }
  return out;
 }
 globalThis.raDims=raDims;
})();
