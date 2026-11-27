// ================================================================= HOST WORLD HOOK: drawn ground, core/water step-wells & millraces, detail maps
// Runs at 91z, after 91f-furnish.js and before 92-world.js's initial buildWorld(). Scales the ground plane over all northern
// rows, registers KDRAWN, wires library textures onto door hardware and room fallback materials, draws Santa Cristina aquifer
// mirror pools (WATER.still + WATER.drawStill) and sawmill/flume/caldera streams (WATER.flow + WATER.drawFlow), and exposes
// hkOreLinks() and hkDims().
(function(){
 if(typeof groundM!=='undefined'){
  groundM.name='ground';
  groundM.position.z=-230;
  groundM.scale.set(1.75,1.75,1);
  if(typeof groundMat!=='undefined'){
   for(const t of [groundMat.map,groundMat.normalMap,groundMat.roughnessMap])if(t)t.repeat.multiplyScalar(1.75);
  }
  groundM.updateMatrixWorld(true);
  if(typeof KDRAWN!=='undefined'){
   const half=GROUND_SIZE*1.75*0.5;
   KDRAWN.add(KDRAWN.grid({x0:-half,z0:-230-half,x1:half,z1:-230+half,nx:2,nz:2,h:()=>0}));
  }
 }
 /* Ensure door hardware and room fallback material carry real library maps too */
 if(typeof svHwMat==='function'&&MAT.bronze&&MAT.bronze.map){
  const hw=svHwMat();
  hw.map=MAT.bronze.map;hw.normalMap=MAT.bronze.normalMap;hw.roughnessMap=MAT.bronze.roughnessMap;
  const L=MAT.bronze.userData&&MAT.bronze.userData.lib;
  if(L)matHook(hw,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));
 }
 if(MAT.room&&MAT.basalt&&MAT.basalt.map&&!MAT.room.map){
  MAT.room.map=MAT.basalt.map;MAT.room.normalMap=MAT.basalt.normalMap;MAT.room.roughnessMap=MAT.basalt.roughnessMap;
 }

 const hkPrevBuild=buildWorld;
 buildWorld=function(){
  if(typeof WATER!=='undefined'){
   for(const D of WATER.drawn||[]){
    if(D.mesh){scene.remove(D.mesh);if(D.mesh.geometry)D.mesh.geometry.dispose();}
    if(D.plunge){scene.remove(D.plunge);if(D.plunge.geometry)D.plunge.geometry.dispose();}
   }
   if(WATER.drawn)WATER.drawn.length=0;
   if(WATER.surfaces)WATER.surfaces.length=0;
  }
  const W0=hkPrevBuild();
  /* Guarantee 100% of non-glow, non-glass furniture meshes in SVF.group carry real library detail maps */
  if(typeof SVF!=='undefined'&&SVF.group){
   SVF.group.traverse(m=>{
    if(m.isMesh&&!m.material.isMeshBasicMaterial&&!m.material.transparent&&!m.material.map){
     m.material.userData.family=m.material.userData.family||'wood';
     if(svfDetail(m.material))SVF.detailed.push(m.material.userData.family);
    }
   });
  }
  /* Draw core/water Santa Cristina aquifer mirror pools (WATER.still) & sawmill/flume/caldera streams (WATER.flow) */
  if(typeof WATER!=='undefined'){
   for(const r of REG){
    if(r.stills){
     for(const st of r.stills){
      const S=WATER.still({name:st.name,level:st.level,bounds:st.bounds,poly:st.poly});
      WATER.drawStill(S,{
       THREE,scene,
       color:st.color==null?0x184c4e:st.color,
       roughness:st.roughness==null?.04:st.roughness,
       metalness:st.metalness==null?.18:st.metalness,
       envMapIntensity:st.envMapIntensity==null?.8:st.envMapIntensity
      });
     }
    }
    if(r.river){
     const S=WATER.flow({name:r.river.name,pts:r.river.pts,width:r.river.width,speed:r.river.speed});
     WATER.drawFlow(S,{THREE,scene,shallow:0x468886,deep:0x173f46,roughness:.12,envMapIntensity:.35});
    }
   }
  }
  return W0;
 };

 function hkOreLinks(){
  const nodes=REG.filter(r=>r.kind==='res-node').map(r=>({id:r.tid||r.key,key:r.key,kind:r.tags.rock,grade:r.tags.level,x:r.x,z:r.z}));
  const mines=REG.filter(r=>!r.parent&&resWorksOf(r)).map(r=>({id:r.tid||r.key,key:r.key,works:resWorksOf(r),x:r.x,z:r.z}));
  return {nodes,mines:mines.map(m=>Object.assign({},m,{source:resSource(m,nodes)}))};
 }
 function hkDims(){
  const out={};
  for(const k in DEFS){
   const d=DEFS[k];if(d.cls!=='building'&&d.kind!=='res-node')continue;
   out[k]={cls:d.cls,kind:d.kind||null,w:d.w,d:d.d,h:d.h,style:d.tags.style||null,wealth:d.tags.wealth||null,
    types:d.tags.types||null,role:d.tags.role||null,job:d.tags.job||null,cut:!!d.cut};
  }
  return out;
 }
 globalThis.hkOreLinks=hkOreLinks;
 globalThis.hkDims=hkDims;
})();
