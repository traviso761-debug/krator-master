// ================================================================= OPEN WORLD — the sea and the lakes on core/water (Phase 2)
// [draw] Each water body of the scale model (WORLD.waterBodies: the Ring Sea, the abyss's salt lakes, the highland lakes,
// each one level) is one core/water open surface (core/water/README.md), drawn by WATER.draw on the CDLOD water mesh:
//  * clipped to its MASK, the body's 4 km cells and the ring round them refined by a flood at about 500 m
//    (WORLD.waterBodies), so no body shows in a basin that is not its own (the sea's level stands over the abyss's
//    floors, which the old per-chunk sheet could flood where it ran on);
//  * near the camera, on a SHORE WINDOW (8 km at 32 m: WATER.shoreJob, re-baked a slice at a time as the camera moves):
//    the flood from the body's own cells over the ground under its level, so a lower hollow beside a lake inside its
//    ring stays dry, and the shore grid's breakers, shoaling and wet-sand band (the ground does not take the band yet:
//    the terrain is this world's own ShaderMaterial; KNOWN_ISSUES.md);
//  * at 1:1: 17 CDLOD levels (a 524 km root, the horizon in reach) and a camera-relative origin (the mesh stands within 2 km
//    of the camera and the vertex shader draws relative to it: no float jitter a million metres out, as the terrain's
//    chunks have their own origins).
// The sky in the water is core/atmos's skylight (a capture of this world's dome and giant, given to the water only).
// The named rivers are core/water's flow (83-world-water.js, which binds core/atmos first). SEAS.update(ms) runs the window jobs
// (START.pump drives it; settle waits for it: SEAS.pending()).
var SEAS;LATE.push(()=>{SEAS=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,WIN=8192,CELL=32,NEAR=12000;
{const env=new THREE.Scene(),HOLD={environment:null};env.add(new THREE.Mesh(SKY.sky.geometry,SKY.sky.material));
 ATMOS.skylight({renderer:HOST.renderer,sky:env,scene:HOLD,ground:()=>new THREE.Color(0x6a5a48)});}
const L=WATER.surfaces.length,list=[],t0=performance.now(),BODIES=WORLD.waterBodies(),bodyMs=performance.now()-t0;
for(const B of BODIES){const big=B.cells>1000,salt=B.salt>.5,id=B.id;
 const S=WATER.open({name:big?'The Ring Sea':(salt?'salt lake ':'lake ')+id,level:B.level,field:big?.8:salt?.25:.4,tilt:salt?.6:1,bounds:B.box,mask:B.mask,
  bed:(x,z)=>WORLD.H(x,z,48),shore:{window:WIN,cell:CELL,band:big?120:60,seeds:(x,z)=>WORLD.waterBodyAt(x,z)===id}});
 const D=WATER.draw(S,{color:salt?0x6fa79c:0x1d3c48,shallow:salt?0xc8dccd:0x6d9c92,deep:salt?0x6fa79c:0x1d3c48,roughness:salt?.3:.16,metalness:.1,
  envMapIntensity:salt?.25:.45,transparent:true,renderOrder:2,cdlod:{levels:17},origin:2048,hideEmpty:true});
 D.mesh.userData.inspectLabel=S.name;list.push({B,S,D,job:null,at:null});}
// the body's nearest point to the camera (its box), and whether the window there is stale
const near=(e,P)=>{const b=e.B.box,dx=Math.max(b[0]-P.x,0,P.x-b[2]),dz=Math.max(b[1]-P.z,0,P.z-b[3]);return Math.hypot(dx,dz);};
const stale=(e,P)=>!e.at||Math.hypot(P.x-e.at[0],P.z-e.at[1])>WIN/4;
let jobs=0;
// step the window jobs within ms: the nearest body first; one job at a time
function update(ms){const P=camera.position,t0=performance.now();
 for(const e of list){const d=near(e,P);e.D.active=d<400000;if(!e.job&&d<NEAR&&stale(e,P)&&!list.some(o=>o.job)){e.job=WATER.shoreJob(e.S,P.x,P.z);e.at=[P.x,P.z];}}
 for(const e of list){if(!e.job)continue;while(e.job&&performance.now()-t0<ms)if(e.job.step(512)){e.job=null;jobs++;}}}
const pending=()=>{const P=camera.position;return list.filter(e=>e.job||(near(e,P)<NEAR&&stale(e,P))).length;};
return{list,update,pending,stats:()=>({bodies:list.length,drawn:list.filter(e=>e.D.mesh.visible).length,nodes:list.reduce((a,e)=>a+(e.D.mesh.visible?e.D.nodes:0),0),windows:jobs,pending:pending(),bodyMs:Math.round(bodyMs),maskTexels:list.reduce((a,e)=>a+e.B.mask.nx*e.B.mask.nz,0)}),first:L};
})();});
