// ================================================================= HOST WORLD HOOK: drawn ground, core/water pools & races, detail dedup & exports
// Runs at 91z, after 91f-furnish.js / 91r-sk-roomlight.js and before 92-world.js's initial buildWorld().
(function(){
 if(typeof groundM!=='undefined'){
  groundM.name='ground';
  groundM.position.z=-60;
  groundM.scale.set(1.4,1.4,1);
  if(typeof groundMat!=='undefined'){
   for(const t of [groundMat.map,groundMat.normalMap,groundMat.roughnessMap])if(t)t.repeat.multiplyScalar(1.4);
  }
  groundM.updateMatrixWorld(true);
  if(typeof KDRAWN!=='undefined'){
   const half=GROUND_SIZE*1.4*0.5;
   KDRAWN.add(KDRAWN.grid({x0:-half,z0:-60-half,x1:half,z1:-60+half,nx:2,nz:2,h:()=>0}));
  }
 }
 if(typeof svHwMat==='function'&&MAT.paktong&&MAT.paktong.map){
  const hw=svHwMat();
  hw.map=MAT.paktong.map;hw.normalMap=MAT.paktong.normalMap;hw.roughnessMap=MAT.paktong.roughnessMap;
  const L=MAT.paktong.userData&&MAT.paktong.userData.lib;
  if(L)matHook(hw,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));
 }
 if(MAT.room&&MAT.limewash&&MAT.limewash.map&&!MAT.room.map){
  MAT.room.map=MAT.limewash.map;MAT.room.normalMap=MAT.limewash.normalMap;MAT.room.roughnessMap=MAT.limewash.roughnessMap;
  const Lp=MAT.limewash.userData&&MAT.limewash.userData.lib;
  if(Lp)matHook(MAT.room,'lib'+KMAT.libKey(Lp),sh=>KMAT.libHooks(sh,Lp));
 }

 const skPrevBuild=buildWorld;
 buildWorld=function(){
  if(typeof WATER!=='undefined'){
   for(const D of WATER.drawn||[]){
    if(D.mesh){scene.remove(D.mesh);if(D.mesh.geometry)D.mesh.geometry.dispose();}
    if(D.plunge){scene.remove(D.plunge);if(D.plunge.geometry)D.plunge.geometry.dispose();}
   }
   if(WATER.drawn)WATER.drawn.length=0;
   if(WATER.surfaces)WATER.surfaces.length=0;
  }
  const W0=skPrevBuild();
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
    if(r.stills){
     for(const st of r.stills){
      const x0=st.cx-st.rx,z0=st.cz-st.rz,x1=st.cx+st.rx,z1=st.cz+st.rz;
      const S=WATER.still({
       name:st.name,level:st.level,
       bounds:[x0,z0,x1,z1],
       poly:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]]
      });
      WATER.drawStill(S,{
       THREE,scene,
       color:st.deep==null?0x184c52:st.deep,
       roughness:.05,metalness:.16,envMapIntensity:.75
      });
     }
    }
    if(r.flows){
     for(const fl of r.flows){
      const S=WATER.flow({name:fl.name,pts:fl.pts,width:fl.width,speed:fl.speed});
      WATER.drawFlow(S,{THREE,scene,shallow:0x3e888a,deep:0x17444e,roughness:.12,envMapIntensity:.35});
     }
    }
   }
  }
  if(typeof skRoomLightRebuild==='function')skRoomLightRebuild();
  return W0;
 };

 function skDims(){
  const out={};
  for(const k in DEFS){
   const d=DEFS[k];if(d.cls!=='building')continue;
   out[k]={
    cls:d.cls,name:d.name,w:d.w,d:d.d,h:d.h,fw:d.w*.92,fd:d.d*.92,
    style:d.tags.style||null,wealth:d.tags.wealth||null,
    types:d.tags.types||null,role:d.tags.role||null,job:d.tags.job||null,
    materials:d.materials||null,bill:d.bill||null,
    cut:!!d.cut,variants:1
   };
  }
  return out;
 }
 globalThis.skDims=skDims;
})();
