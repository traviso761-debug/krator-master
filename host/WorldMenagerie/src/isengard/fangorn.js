// ---------- Fangorn ----------
// Fan work from Tolkien.
//
// The old forest on the hills east of the Ring: huge, dark, close-grown, and seen from the plain as a wall along
// the skyline. Its edge is ragged where Saruman's orcs have been cutting it for the furnaces (works.js puts the
// stumps in front of it). The engine's trees are drawn only close to the camera, which is right for a street and
// wrong for a forest seen from five kilometres, so these are the page's: instanced, a trunk and two crowns to a
// tree, broad-crowned and dark, and drawn at every distance.
import { mkRng } from '../core/rng.js';
export const FANGORN_X=5200;
export const fangornEdge=z=>FANGORN_X+500*Math.sin(z/1100)+300*Math.sin(z/370);

export function fangorn(api){
  const {THREE,ctx,scene,groundH,B}=api;
  const R=mkRng(1450),D=new THREE.Object3D();
  const N=14000,trees=[];
  for(let i=0;i<N*4&&trees.length<N;i++){const z=B.z0+200+R()*(B.d-400),x=fangornEdge(z)-40+R()*(B.x1-fangornEdge(z)-200);
    // thicker further in; the eaves are broken
    const inside=x-fangornEdge(z);if(inside<300&&R()>0.35+inside/460)continue;trees.push([x,z,14+R()*16]);}
  const n=trees.length;
  const bark=new THREE.MeshLambertMaterial({color:0x3e3328,flatShading:true});
  const trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5,1.1,1,6).translate(0,0.5,0),bark,n);
  const crownA=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),n);
  const crownB=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),n);
  const greens=[0x2f4424,0x364d28,0x2a3d22,0x3d4a2a,0x324a30].map(h=>new THREE.Color(h));
  trees.forEach(([x,z,h],i)=>{const y=groundH(x,z)-0.5,cw=h*(0.32+R()*0.14);
    D.position.set(x,y,z);D.rotation.set(0,R()*6,0);D.scale.set(h*0.06,h*0.62,h*0.06);D.updateMatrix();trunk.setMatrixAt(i,D.matrix);
    D.position.set(x,y+h*0.72,z);D.scale.set(cw,cw*0.8,cw);D.updateMatrix();crownA.setMatrixAt(i,D.matrix);crownA.setColorAt(i,greens[Math.floor(R()*5)]);
    D.position.set(x+(R()-0.5)*cw*0.6,y+h*0.9,z+(R()-0.5)*cw*0.6);D.scale.set(cw*0.7,cw*0.6,cw*0.7);D.updateMatrix();crownB.setMatrixAt(i,D.matrix);crownB.setColorAt(i,greens[Math.floor(R()*5)]);});
  for(const m of [trunk,crownA,crownB]){m.frustumCulled=false;m.castShadow=false;m.receiveShadow=true;m.userData.noFingerprint=true;scene.add(m);}
  ctx.fangorn={trees,edge:fangornEdge};
  ctx.details=Object.assign(ctx.details||{},{fangorn:n});
}
