// ================================================================= HOST WORLD HOOK: drawn ground, core/water canals, detail maps & exports
// Runs at 91z, after 91f-furnish.js and before 92-world.js's initial buildWorld(). Scales the ground plane over all northern
// rows, registers KDRAWN, wires library textures onto door hardware and any untagged furniture bucket, draws flowing canal
// streams (WATER.flow + WATER.drawFlow), and exposes slOreLinks() and slDims().
(function(){
 if(typeof groundM!=='undefined'){
  groundM.name='ground';
  groundM.position.z=-220;
  groundM.scale.set(1.6,1.6,1);
  if(typeof groundMat!=='undefined'){
   for(const t of [groundMat.map,groundMat.normalMap,groundMat.roughnessMap])if(t)t.repeat.multiplyScalar(1.6);
  }
  groundM.updateMatrixWorld(true);
  if(typeof KDRAWN!=='undefined'){
   const half=GROUND_SIZE*1.6*0.5;
   KDRAWN.add(KDRAWN.grid({x0:-half,z0:-220-half,x1:half,z1:-220+half,nx:2,nz:2,h:()=>0}));
  }
 }
 /* Ensure door hardware and room fallback material carry real library maps too */
 if(typeof svHwMat==='function'&&MAT.bronze&&MAT.bronze.map){
  const hw=svHwMat();
  hw.map=MAT.bronze.map;hw.normalMap=MAT.bronze.normalMap;hw.roughnessMap=MAT.bronze.roughnessMap;
  const L=MAT.bronze.userData&&MAT.bronze.userData.lib;
  if(L)matHook(hw,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));
 }
 if(MAT.room&&MAT.plaster&&MAT.plaster.map&&!MAT.room.map){
  MAT.room.map=MAT.plaster.map;MAT.room.normalMap=MAT.plaster.normalMap;MAT.room.roughnessMap=MAT.plaster.roughnessMap;
 }

 const slPrevBuild=buildWorld;
 buildWorld=function(){
  if(typeof WATER!=='undefined'){
   for(const D of WATER.drawn||[]){if(D.mesh){scene.remove(D.mesh);if(D.mesh.geometry)D.mesh.geometry.dispose();}}
   if(WATER.drawn)WATER.drawn.length=0;
   if(WATER.surfaces)WATER.surfaces.length=0;
  }
  const W0=slPrevBuild();
  /* Guarantee 100% of non-glow, non-glass furniture meshes in SVF.group carry real library detail maps */
  if(typeof SVF!=='undefined'&&SVF.group){
   SVF.group.traverse(m=>{
    if(m.isMesh&&!m.material.isMeshBasicMaterial&&!m.material.transparent&&!m.material.map){
     m.material.userData.family=m.material.userData.family||'wood';
     if(svfDetail(m.material))SVF.detailed.push(m.material.userData.family);
    }
   });
  }
  /* Draw core/water canal streams under sl_dyehouse_canal and sl_ferry_bridge */
  if(typeof WATER!=='undefined'){
   for(const r of REG){
    if(!r.river)continue;
    const S=WATER.flow({name:r.river.name,pts:r.river.pts,width:r.river.width,speed:r.river.speed});
    WATER.drawFlow(S,{THREE,scene,shallow:0x4e8c88,deep:0x1c4a52,roughness:.12,envMapIntensity:.3});
   }
  }
  return W0;
 };

 function slOreLinks(){
  const nodes=REG.filter(r=>r.kind==='res-node').map(r=>({id:r.tid||r.key,key:r.key,kind:r.tags.rock,grade:r.tags.level,x:r.x,z:r.z}));
  const mines=REG.filter(r=>!r.parent&&resWorksOf(r)).map(r=>({id:r.tid||r.key,key:r.key,works:resWorksOf(r),x:r.x,z:r.z}));
  return {nodes,mines:mines.map(m=>Object.assign({},m,{source:resSource(m,nodes)}))};
 }
 function slDims(){
  const out={};
  for(const k in DEFS){
   const d=DEFS[k];if(d.cls!=='building'&&d.kind!=='res-node')continue;
   out[k]={cls:d.cls,kind:d.kind||null,w:d.w,d:d.d,h:d.h,style:d.tags.style||null,wealth:d.tags.wealth||null,
    types:d.tags.types||null,role:d.tags.role||null,job:d.tags.job||null,cut:!!d.cut};
  }
  return out;
 }
 globalThis.slOreLinks=slOreLinks;
 globalThis.slDims=slDims;
})();
