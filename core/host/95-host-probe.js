// ================================================================= CORE HOST — the probe: window._api, built from what the build hands in
// [web] core/host/95-host-probe.js (ROADMAP.md section 10; GODOT-PLAN.md Phase 1: "95-host-probe.js replaces 15 probe.js
// copies"). What verify.py --assert measures, generalised from the biome kits' 91-host-probe.js. The host writes the parts
// every kit wrote the same way; a build adds or replaces fields through o.api (its own checks, totals, extra probes).
//
//   window._api = {
//     BUDGET          o.budget: {showcase:{tris, calls}, cls:{class: limit}, type:{type: class}}
//     REG             o.registry: the registered volumes [{name, x, y?, z, r, h, type?}]
//     regOccupancy()  per volume, how many scene samples fall in it (an instanced item's every instance; a mesh's box centre):
//                     in the cylinder [r, from y-2 to y+h+5], or o.regHas(volume, x, y, z) when the build has its own shapes;
//                     o.probeSample caps the samples taken from one instanced mesh
//     nanSweep()      meshes with a NaN vertex, instanced meshes with a NaN matrix
//     typeStats()     per type (o.types(): {type: {tris, inst, meshes}}, e.g. () => BIO.stats), its class, limit and whether over
//     setView(cx,cy,cz,tx,ty,tz), views(), go(name)
//     ...o.api        the build's own: hostChecks / hostNegatives, a `totals` getter, biome(), at(x, z) ... (getters kept)
//   }
//   window._registered = the registry's length
// Objects with userData.probeSkip are left out of the samples and the sweep, as before (the host's pin is one of them).
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{};
K.probeTake=function(H){const o=H.o,THREE=o.THREE||root.THREE,scene=H.scene,REG=H.registry,BUDGET=o.budget||{showcase:{},cls:{},type:{}};
 function probePoints(){const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),bb=new THREE.Box3(),cap=o.probeSample;
  scene.traverse(ob=>{if(ob.userData&&ob.userData.probeSkip)return;
   if(ob.isInstancedMesh){const st=cap?Math.max(1,Math.floor(ob.count/cap)):1;for(let i=0;i<ob.count;i+=st){ob.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
   if(!ob.isMesh)return;bb.setFromObject(ob);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
   pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);});
  return pts;}
 const inCyl=(r,x,y,z)=>{const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;};
 const has=o.regHas||inCyl;
 function regOccupancy(){const n=new Array(REG.length).fill(0);const P=probePoints();
  REG.forEach((r,i)=>{for(const p of P)if(has(r,p[0],p[1],p[2]))n[i]++;});
  return REG.map((r,i)=>({name:r.name,type:r.type,n:n[i]}));}
 function nanSweep(){const bad=[];let badInst=0;
  scene.traverse(ob=>{if(!ob.isMesh&&!ob.isInstancedMesh)return;if(ob.userData&&ob.userData.probeSkip)return;
   const p=ob.geometry&&ob.geometry.attributes&&ob.geometry.attributes.position;if(p){const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:ob.name||ob.geometry.type,at:i});break;}}
   if(ob.isInstancedMesh){const a=ob.instanceMatrix.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){badInst++;break;}}});
  return {meshes:bad.length,first:bad.slice(0,8),instances:badInst,firstInstances:[]};}
 function typeStats(){const out={},S=o.types?o.types():{},T=BUDGET.type||{},CL=BUDGET.cls||{};
  for(const k in S){const t=S[k],cls=T[k]||'pass';out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:CL[cls],over:t.tris>CL[cls]};}return out;}
 const api={BUDGET,REG,typeStats,regOccupancy,nanSweep,
  setView:(cx,cy,cz,tx,ty,tz)=>K.setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(H.views),go:k=>K.go(k),
  clock:()=>H.clock.state()};
 if(o.api)Object.defineProperties(api,Object.getOwnPropertyDescriptors(o.api));   // getters stay getters
 K.probe={probePoints,regOccupancy,nanSweep,typeStats};
 root._api=api;root._registered=REG.length;};
})(typeof window!=='undefined'?window:globalThis);
