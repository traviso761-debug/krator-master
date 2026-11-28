// ================================================================= HOST WORLD HOOK: drawn ground, core/water ribbon lakes & millraces, ore links
// Runs at 91z, after 91f-furnish.js and before 92-world.js's initial buildWorld(). Scales the ground plane over all 11 rows,
// registers KDRAWN, wires library textures onto door hardware and room fallback materials, draws mirror-calm ribbon-lake &
// sanctuary basins (WATER.still) plus silent lapidary, granary & terrace-farm rills (WATER.flow), and exposes hsOreLinks() & hsDims().
(function(){
 if(typeof groundM!=='undefined'){
  groundM.name='ground';
  groundM.position.z=-290;
  groundM.scale.set(2.2,2.2,1);
  if(typeof groundMat!=='undefined'){
   for(const t of [groundMat.map,groundMat.normalMap,groundMat.roughnessMap])if(t)t.repeat.multiplyScalar(2.2);
  }
  groundM.updateMatrixWorld(true);
  if(typeof KDRAWN!=='undefined'){
   KDRAWN.add(KDRAWN.fromObject(groundM));
  }
 }
 /* Ensure door hardware and room fallback material carry real library maps too */
 if(typeof svHwMat==='function'&&MAT.bronze&&MAT.bronze.map){
  const hw=svHwMat();
  hw.map=MAT.bronze.map;hw.normalMap=MAT.bronze.normalMap;hw.roughnessMap=MAT.bronze.roughnessMap;
  const L=MAT.bronze.userData&&MAT.bronze.userData.lib;
  if(L)matHook(hw,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));
 }
 if(MAT.room&&MAT.granite&&MAT.granite.map&&!MAT.room.map){
  MAT.room.map=MAT.granite.map;MAT.room.normalMap=MAT.granite.normalMap;MAT.room.roughnessMap=MAT.granite.roughnessMap;
 }

 const hsPrevBuild=buildWorld;
 buildWorld=function(){
  if(typeof WATER!=='undefined'){
   for(const D of WATER.drawn||[]){
    if(D.mesh){scene.remove(D.mesh);if(D.mesh.geometry)D.mesh.geometry.dispose();}
    if(D.plunge){scene.remove(D.plunge);if(D.plunge.geometry)D.plunge.geometry.dispose();}
   }
   if(WATER.drawn)WATER.drawn.length=0;
   if(WATER.surfaces)WATER.surfaces.length=0;
  }
  const W0=hsPrevBuild();
  /* Guarantee 100% of non-glow, non-glass furniture meshes in SVF.group carry real library detail maps */
  if(typeof SVF!=='undefined'&&SVF.group){
   SVF.group.traverse(m=>{
    if(m.isMesh&&!m.material.isMeshBasicMaterial&&!m.material.transparent&&!m.material.map){
     m.material.userData.family=m.material.userData.family||'wood';
     if(svfDetail(m.material))SVF.detailed.push(m.material.userData.family);
    }
   });
  }
  /* Draw core/water mirror-calm ribbon-lake basins (WATER.still) & silent lapidary/granary/terrace millraces (WATER.flow) */
  if(typeof WATER!=='undefined'){
   for(const r of REG){
    if(r.stills){
     for(const st of r.stills){
      const S=WATER.still({name:st.name,level:st.level,bounds:st.bounds,poly:st.poly});
      WATER.drawStill(S,{
       THREE,scene,
       color:st.color==null?0x194c5e:st.color,
       roughness:st.roughness==null?.03:st.roughness,
       metalness:st.metalness==null?.18:st.metalness,
       envMapIntensity:st.envMapIntensity==null?.85:st.envMapIntensity
      });
     }
    }
    if(r.river){
     const S=WATER.flow({name:r.river.name,pts:r.river.pts,width:r.river.width,speed:r.river.speed});
     WATER.drawFlow(S,{THREE,scene,shallow:0x3e8692,deep:0x163e4e,roughness:.1,envMapIntensity:.4});
    }
   }
  }
  return W0;
 };

 function hsOreLinks(){
  const nodes=REG.filter(r=>r.kind==='res-node').map(r=>({id:r.tid||r.key,key:r.key,kind:r.tags.rock,grade:r.tags.level,x:r.x,z:r.z}));
  const mines=REG.filter(r=>!r.parent&&resWorksOf(r)).map(r=>({id:r.tid||r.key,key:r.key,works:resWorksOf(r),x:r.x,z:r.z}));
  return {nodes,mines:mines.map(m=>Object.assign({},m,{source:resSource(m,nodes)}))};
 }
 function hsDims(){
  const out={};
  for(const k in DEFS){
   const d=DEFS[k];if(d.cls!=='building'&&d.kind!=='res-node')continue;
   out[k]={cls:d.cls,kind:d.kind||null,w:d.w,d:d.d,h:d.h,style:d.tags.style||null,wealth:d.tags.wealth||null,
    types:d.tags.types||null,role:d.tags.role||null,job:d.tags.job||null,cut:!!d.cut};
  }
  return out;
 }
 globalThis.hsOreLinks=hsOreLinks;
 globalThis.hsDims=hsDims;
})();
