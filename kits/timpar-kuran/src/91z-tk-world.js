// ================================================================= HOST WORLD HOOK: drawn ground, core/water salmon streams & spring cisterns, ore links
// Runs at 91z, after 91f-furnish.js and before 92-world.js's initial buildWorld(). Scales the ground plane over all 10 rows,
// registers KDRAWN, wires library textures onto door hardware and room fallback materials, draws chasi-noow spring cistern,
// sweat-lodge plunge & clay-settling still pools (WATER.still) plus mountain salmon torrent, canoe slipway & adze-grinder
// flows (WATER.flow), and exposes tkOreLinks() & tkDims().
(function(){
 if(typeof groundM!=='undefined'){
  groundM.name='ground';
  groundM.position.z=-260;
  groundM.scale.set(2.0,2.0,1);
  if(typeof groundMat!=='undefined'){
   for(const t of [groundMat.map,groundMat.normalMap,groundMat.roughnessMap])if(t)t.repeat.multiplyScalar(2.0);
  }
  groundM.updateMatrixWorld(true);
  if(typeof KDRAWN!=='undefined'){
   KDRAWN.add(KDRAWN.fromObject(groundM));
  }
 }
 /* Ensure door hardware and room fallback material carry real library maps too */
 if(typeof svHwMat==='function'&&MAT.copper&&MAT.copper.map){
  const hw=svHwMat();
  hw.map=MAT.copper.map;hw.normalMap=MAT.copper.normalMap;hw.roughnessMap=MAT.copper.roughnessMap;
  const L=MAT.copper.userData&&MAT.copper.userData.lib;
  if(L)matHook(hw,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));
 }
 if(MAT.room&&MAT.megabreccia&&MAT.megabreccia.map&&!MAT.room.map){
  MAT.room.map=MAT.megabreccia.map;MAT.room.normalMap=MAT.megabreccia.normalMap;MAT.room.roughnessMap=MAT.megabreccia.roughnessMap;
 }

 const tkPrevBuild=buildWorld;
 buildWorld=function(){
  if(typeof WATER!=='undefined'){
   for(const D of WATER.drawn||[]){
    if(D.mesh){scene.remove(D.mesh);if(D.mesh.geometry)D.mesh.geometry.dispose();}
    if(D.plunge){scene.remove(D.plunge);if(D.plunge.geometry)D.plunge.geometry.dispose();}
   }
   if(WATER.drawn)WATER.drawn.length=0;
   if(WATER.surfaces)WATER.surfaces.length=0;
  }
  const W0=tkPrevBuild();
  /* Guarantee 100% of non-glow, non-glass furniture meshes in SVF.group carry real library detail maps */
  if(typeof SVF!=='undefined'&&SVF.group){
   SVF.group.traverse(m=>{
    if(m.isMesh&&!m.material.isMeshBasicMaterial&&!m.material.transparent&&!m.material.map){
     m.material.userData.family=m.material.userData.family||'wood';
     if(svfDetail(m.material))SVF.detailed.push(m.material.userData.family);
    }
   });
  }
  /* Draw core/water rainforest spring cisterns/pools (WATER.still) & mountain salmon/slipway/adze streams (WATER.flow) */
  if(typeof WATER!=='undefined'){
   for(const r of REG){
    if(r.stills){
     for(const st of r.stills){
      const S=WATER.still({name:st.name,level:st.level,bounds:st.bounds,poly:st.poly});
      WATER.drawStill(S,{
       THREE,scene,
       color:st.color==null?0x194a4c:st.color,
       roughness:st.roughness==null?.04:st.roughness,
       metalness:st.metalness==null?.18:st.metalness,
       envMapIntensity:st.envMapIntensity==null?.8:st.envMapIntensity
      });
     }
    }
    if(r.river){
     const S=WATER.flow({name:r.river.name,pts:r.river.pts,width:r.river.width,speed:r.river.speed});
     WATER.drawFlow(S,{THREE,scene,shallow:0x3e827e,deep:0x153b42,roughness:.12,envMapIntensity:.35});
    }
   }
  }
  return W0;
 };

 function tkOreLinks(){
  const nodes=REG.filter(r=>r.kind==='res-node').map(r=>({id:r.tid||r.key,key:r.key,kind:r.tags.rock,grade:r.tags.level,x:r.x,z:r.z}));
  const mines=REG.filter(r=>!r.parent&&resWorksOf(r)).map(r=>({id:r.tid||r.key,key:r.key,works:resWorksOf(r),x:r.x,z:r.z}));
  return {nodes,mines:mines.map(m=>Object.assign({},m,{source:resSource(m,nodes)}))};
 }
 function tkDims(){
  const out={};
  for(const k in DEFS){
   const d=DEFS[k];if(d.cls!=='building'&&d.kind!=='res-node')continue;
   out[k]={cls:d.cls,kind:d.kind||null,w:d.w,d:d.d,h:d.h,style:d.tags.style||null,wealth:d.tags.wealth||null,
    types:d.tags.types||null,role:d.tags.role||null,job:d.tags.job||null,cut:!!d.cut};
  }
  return out;
 }
 globalThis.tkOreLinks=tkOreLinks;
 globalThis.tkDims=tkDims;
})();
