// ================================================================= ROKETSTAD — screen-size LOD for the kit's instances (round 8)
// Travis: "implement LOD to free up triangle room". Every kit InstancedMesh (not the biome's, which has its own LOD) keeps
// its full instance list aside; when the camera has moved a little, each mesh is rewritten with only the instances whose
// SIZE / DISTANCE clears RKLOD.K — a rivet (0.1 m) shows inside ~30 m, a window frame (1 m) inside ~300 m, a wall (8 m)
// to 2.4 km — and its draw count is cut to them. The dropped instances are simply not drawn: fewer triangles, same look
// at the distance they vanish. The probe (_probePoints, used by the invariants) sees the full lists.
const RKLOD={K:1/300,meshes:[],last:null,step:10,kept:0,total:0};
(function rkLodInit(){const skip=new Set(BIO.baked||[]);const v=new THREE.Vector3(),m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(o=>{if(!o.isInstancedMesh||skip.has(o)||(o.userData&&o.userData.probeSkip)||o.count<24)return;
  o.geometry.computeBoundingSphere();const gr=o.geometry.boundingSphere.radius,gc=o.geometry.boundingSphere.center;const n=o.count;
  const M=o.instanceMatrix.array.slice(0,n*16),C=o.instanceColor?o.instanceColor.array.slice(0,n*3):null;const P=new Float32Array(n*3),S=new Float32Array(n);
  for(let i=0;i<n;i++){m.fromArray(M,i*16);m.decompose(v,q,sc);const c=gc.clone().applyMatrix4(m);P[i*3]=c.x;P[i*3+1]=c.y;P[i*3+2]=c.z;S[i]=2*gr*Math.max(Math.abs(sc.x),Math.abs(sc.y),Math.abs(sc.z));}
  RKLOD.meshes.push({o,n,M,C,P,S});RKLOD.total+=n;});})();
function rkLodUpdate(force){if(RKLOD.on===false)return;const p=camera.position;if(!force&&RKLOD.last&&RKLOD.last.distanceToSquared(p)<RKLOD.step*RKLOD.step)return;RKLOD.last=p.clone();
 const inv=1/RKLOD.K;let kept=0;
 for(const L of RKLOD.meshes){const A=L.o.instanceMatrix.array,Ca=L.C?L.o.instanceColor.array:null;let k=0;
  for(let i=0;i<L.n;i++){const dx=L.P[i*3]-p.x,dy=L.P[i*3+1]-p.y,dz=L.P[i*3+2]-p.z,r=L.S[i]*inv;
   if(dx*dx+dy*dy+dz*dz>r*r)continue;if(k!==i){A.set(L.M.subarray(i*16,i*16+16),k*16);if(Ca)Ca.set(L.C.subarray(i*3,i*3+3),k*3);}k++;}
  if(L.o.count!==k||force){L.o.count=k;L.o.instanceMatrix.needsUpdate=true;if(Ca)L.o.instanceColor.needsUpdate=true;}kept+=k;}
 RKLOD.kept=kept;}
function rkLodFull(){for(const L of RKLOD.meshes){L.o.instanceMatrix.array.set(L.M);if(L.C)L.o.instanceColor.array.set(L.C);L.o.count=L.n;L.o.instanceMatrix.needsUpdate=true;if(L.C)L.o.instanceColor.needsUpdate=true;}}
const _rkProbe0=_probePoints;
_probePoints=function(){rkLodFull();const r=_rkProbe0();RKLOD.last=null;rkLodUpdate(true);return r;};
FRAME_HOOKS.push(()=>rkLodUpdate(false));rkLodUpdate(true);
window._api.town.lod=()=>({meshes:RKLOD.meshes.length,total:RKLOD.total,kept:RKLOD.kept,K:RKLOD.K});
RKLOD.on=true;
uiButton('LOD',true,()=>{RKLOD.on=!RKLOD.on;if(RKLOD.on){RKLOD.last=null;rkLodUpdate(true);}else rkLodFull();return RKLOD.on;});
// The shared LOD (core/lod) leaves these instanced sets to RKLOD, which already rewrites them as the camera moves;
// it takes over the rest (merged meshes, the biome, sets under 24 instances).
{const rk=new Set(RKLOD.meshes.map(L=>L.o)),O=window.LOD_OPTIONS||{},s0=O.skip;
 window.LOD_OPTIONS=Object.assign(O,{skip:o=>rk.has(o)||(s0?s0(o):false)});}
