// ================================================================= HOST WORLD HOOK (C6): core/water test river and core/ruins watch list
// Runs at 91z, after 91f-furnish.js and before 92-world.js's first buildWorld(), so both the opening build and A.rebuild()
// clear and re-register the Gate's flowing river (WATER.flow + WATER.drawFlow) and every slumped ruin site (KRUINS.watch),
// and shifts/scales the sheet's ground plane so the northern rows (past z = -800) stand on drawn ground.
(function(){
 if(typeof groundM!=='undefined'){
  groundM.position.z=-420;
  groundM.scale.set(1.6,1.6,1);
  if(typeof groundMat!=='undefined'){
   for(const t of [groundMat.map,groundMat.normalMap,groundMat.roughnessMap])if(t)t.repeat.multiplyScalar(1.6);}
  groundM.updateMatrixWorld(true);}
 const cyPrevBuild=buildWorld;
 buildWorld=function(){
  CY_RUINS.length=0;
  if(typeof WATER!=='undefined'){
   for(const D of WATER.drawn||[]){if(D.mesh){scene.remove(D.mesh);if(D.mesh.geometry)D.mesh.geometry.dispose();}}
   if(WATER.drawn)WATER.drawn.length=0;
   if(WATER.surfaces)WATER.surfaces.length=0;}
  if(typeof KRUINS!=='undefined'&&KRUINS.watched)KRUINS.watched.length=0;
  const W0=cyPrevBuild();
  if(typeof WATER!=='undefined'){
   for(const r of REG){if(!r.river)continue;
    const S=WATER.flow({name:r.river.name,pts:r.river.pts,width:r.river.width,speed:r.river.speed});
    WATER.drawFlow(S,{THREE,scene,shallow:0x5f8f82,deep:0x1b4248,roughness:.14,envMapIntensity:.25});}}
  if(typeof KRUINS!=='undefined'){
   for(const q of CY_RUINS){
    const c=Math.cos(q.ry),s=Math.sin(q.ry),hw=q.w/2,hd=q.d/2;
    KRUINS.watch(W0,{
     name:q.name,
     ground:()=>q.y,
     inside:(x,z)=>{const dx=x-q.x,dz=z-q.z;return Math.abs(dx*c-dz*s)<=hw&&Math.abs(dx*s+dz*c)<=hd;}
    });}}
  return W0;};
})();
