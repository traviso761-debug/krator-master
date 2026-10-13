// ---------------------------------------------------------------- still water (core/water Phase 4)
// The kit's standing water (the rill basins, pools, channels, the garden bowls: every xWaterB box and xDiscWater disc the
// builders put) is core/water's still water: each flat box or disc is a WATER.still record at its top over its turned
// footprint, so WATER.heightAt and core/export read it, and the two InstancedMeshes draw it with WATER.stillMaterial (the
// sky in it, a faint ripple on the one clock) in place of the plain MAT.xWater. The palette's water tint stays on each
// instance (the material is white under it). A box taller than it is wide or deep is a falling sheet (xnWaterSheet), not a
// pool, and a tilted one is a rill ramp or a mill race running down (flowing water, not still): both keep the material
// but get no record.
// Kit page only: Erewhon bakes per chunk and has its own sky (KNOWN_ISSUES.md). Loads after 90-scene.js (kbake, the sky).
let XA_STILL=[];
if(!window.CITY){
 ATMOS.init({THREE,scene,camera,hour:()=>13,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:3157,
  err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
 const env=new THREE.Scene();
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(4000);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:{environment:null},ground:()=>new THREE.Color(0x6a5a3a)});
 const v=new THREE.Vector3(),q0=new THREE.Quaternion(),mat=()=>WATER.stillMaterial({color:0xffffff,roughness:.1,metalness:.25,envMapIntensity:.6});
 const top=(o,pts)=>{const s=typeof o.s==='number'?[o.s,o.s,o.s]:o.s,q=o.q||q0,out=[];
  for(const [a,b] of pts){v.set(a*s[0],s[1]/2,b*s[2]).applyQuaternion(q);out.push([o.p[0]+v.x,o.p[1]+v.y,o.p[2]+v.z]);}return out;};
 const rec=(name,c)=>XA_STILL.push(WATER.still({name,level:Math.max(...c.map(p=>p[1])),poly:c.map(p=>[p[0],p[2]])}));
 const box=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]],disc=[];for(let i=0;i<16;i++){const a=i*Math.PI*2/16;disc.push([Math.cos(a),Math.sin(a)]);}
 for(const [k,shape] of [['xWaterB',box],['xDiscWater',disc]]){const im=KIT.meshes[k];if(!im)continue;
  KIT.items[k].forEach((o,i)=>{const s=typeof o.s==='number'?[o.s,o.s,o.s]:o.s;if(s[1]>Math.min(s[0],s[2])||v.set(0,1,0).applyQuaternion(o.q||q0).y<.995)return;rec(k+' '+i,top(o,shape));});
  im.material=mat();im.userData.inspectLabel='still water';}   // one material each: the boxes carry instance colours, the discs none (r128 keeps one program per material)
}
window._still=XA_STILL.length;
