// ================================================================= TEXTURE GUARD, SPINNERS & KDRAWN REGISTRATION
// Wraps buildWorld() after 91f-furnish.js so:
//   1. ynSpinnerReset() / ynSpinnerFlush(WORLD) build and attach rotating squall-turbine rotors;
//   2. Any non-glow/non-glass furniture mesh whose family was empty or missed gets `f_plain` triplanar detail map attached;
//   3. KDRAWN records the sculpted groundM mesh for drawn-ground camera and placement audits.
{
 const prevBuildWorld=buildWorld;
 buildWorld=function(){
  ynSpinnerReset();
  const W0=prevBuildWorld();
  ynSpinnerFlush(W0);
  if(W0&&KMAT.mode==='lib'){
   const patchedMats=new Set();
   W0.traverse(m=>{
    if(!m.isMesh||!m.material||Array.isArray(m.material)||m.material.map||m.material.isMeshBasicMaterial)return;
    const mk=m.userData&&m.userData.mk,f=m.material.userData&&m.material.userData.family;
    if(mk==='glow'||mk==='glass'||mk==='water'||f==='glow'||f==='glass'||(m.material.userData&&m.material.userData.kglass))return;
    if(!patchedMats.has(m.material)){
     m.material.userData=m.material.userData||{};
     m.material.userData.family=f||'bone';
     if(svfDetail(m.material)&&SVF&&SVF.detailed)SVF.detailed.push(m.material.userData.family);
     patchedMats.add(m.material);
    }
   });
  }
  if(typeof KDRAWN!=='undefined'&&groundM){
   KDRAWN.clear();
   KDRAWN.add(KDRAWN.fromObject(groundM,{cell:8}));
  }
  return W0;
 };
}
