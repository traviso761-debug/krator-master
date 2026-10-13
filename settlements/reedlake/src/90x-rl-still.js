// ---------------------------------------------------------------- still water (core/water Phase 4)
// The water in the troughs, the buffalo wallow, the duck pen's pan and the dye vats (every hRLWaterB box the builders put)
// is core/water's still water: each box is a WATER.still record at its top over its turned footprint, so WATER.heightAt and
// core/export read it, and the boxes' one InstancedMesh draws it with WATER.stillMaterial (the sky in it, a faint ripple on
// the one clock) in place of the scrolled canvas map it had (74-rl-mat.js MAT.rlWater, still there for nothing else).
// Loads after 90w-rl-lake.js (ATMOS bound, the sky captured) and after kbake (90-rl-scene.js).
let RL_STILL=[];
if(!window.CITY&&KIT.meshes.hRLWaterB){
 const v=new THREE.Vector3(),q0=new THREE.Quaternion();
 KIT.items.hRLWaterB.forEach((o,i)=>{const s=typeof o.s==='number'?[o.s,o.s,o.s]:o.s,q=o.q||q0,top=[];
  for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]){v.set(a*s[0]/2,s[1]/2,b*s[2]/2).applyQuaternion(q);top.push([o.p[0]+v.x,o.p[1]+v.y,o.p[2]+v.z]);}
  RL_STILL.push(WATER.still({name:'still water '+i,level:Math.max(...top.map(c=>c[1])),poly:top.map(c=>[c[0],c[2]])}));});
 const im=KIT.meshes.hRLWaterB;im.material=WATER.stillMaterial({color:new THREE.Color(.05,.11,.10),roughness:.08,metalness:.1,envMapIntensity:.35});
 im.userData.inspectLabel='still water';
}
window._still=RL_STILL.length;
