// ---------- groves: the woods and parks filled with broadleaf trees ----------
// A city's mapped woods, parks and gardens planted with round-crowned trees (Tokyo's camphors, zelkovas and oaks; in a
// wood shoulder to shoulder, in a park and a garden with room between), never in a building, the water or a road.
// C.groves: {density: {kind: trees per m²}, max, seed, tile, near, far, colours: [crown colours]}.
//
// Drawn in tiles, each with its own bounds so a tile out of the frame is not drawn at all; within `near` a tile draws
// whole trees (a trunk and two lobes to a crown, with shadows), beyond it one low lobe and no trunk, beyond `far`
// nothing - with hysteresis, so a tile does not flicker at the line while the camera moves.
// Map data (c) OpenStreetMap contributors, ODbL.
import {mkRng} from './rng.js';

export function groves(api){
  const {THREE,C,scene,groundH,buildingsAt,inPoly,inWater,roadsNear,AREAS,animHooks,camera}=api;const K=C.groves;if(!K)return;
  const R=mkRng(K.seed||1920),DEN=Object.assign({wood:0.0045,park:0.0016,garden:0.0012,cemetery:0.0012,nature_reserve:0.004,scrub:0.002},K.density||{});
  const TILE=K.tile||500,NEAR=K.near||650,FAR=K.far||4500,HYS=K.hysteresis||80,MAX=K.max||30000;
  const COLS=(K.colours||['#3f6a34','#4a7a3a','#36602e','#557f40','#2f5a2c','#5f8a44']).map(c=>new THREE.Color(c));
  const tiles=new Map(),tileOf=(x,z)=>{const k=Math.floor(x/TILE)+','+Math.floor(z/TILE);let t=tiles.get(k);if(!t){t={near:[],far:[],col:[],x0:1e9,x1:-1e9,z0:1e9,z1:-1e9,y0:1e9,y1:-1e9};tiles.set(k,t);}return t;};
  const o=new THREE.Object3D();let n=0;
  for(const a of AREAS){const den=DEN[a.kind];if(!den)continue;const {x0,x1,z0,z1}=a.bb,area=(x1-x0)*(z1-z0);if(area<600)continue;
    const want=Math.round(area*den);
    for(let k=0,tries=0;k<want&&tries<want*3&&n<MAX;tries++){const x=x0+R()*(x1-x0),z=z0+R()*(z1-z0);
      if(!inPoly(x,z,a.o)||(a.i||[]).some(h=>inPoly(x,z,h))||inWater(x,z)||buildingsAt(x,z,1).some(b=>inPoly(x,z,b.ring))||roadsNear(x,z,1).length)continue;k++;n++;
      const g=groundH(x,z),h=8+R()*10,w=h*(0.42+R()*0.18),t=tileOf(x,z);
      o.position.set(x,g,z);o.rotation.set(0,R()*6.28,0);o.scale.set(w,h,w);o.updateMatrix();t.near.push(o.matrix.clone());t.col.push(COLS[Math.floor(R()*COLS.length)]);
      t.x0=Math.min(t.x0,x-w);t.x1=Math.max(t.x1,x+w);t.z0=Math.min(t.z0,z-w);t.z1=Math.max(t.z1,z+w);t.y0=Math.min(t.y0,g);t.y1=Math.max(t.y1,g+h);}}
  // a tree one unit across and one high: a trunk, a crown of two lobes; far off, one lobe
  const trunkG=new THREE.CylinderGeometry(0.035,0.05,0.42,6).translate(0,0.21,0);
  const crownG=(()=>{const a=new THREE.IcosahedronGeometry(0.42,1).translate(0,0.66,0),b=new THREE.IcosahedronGeometry(0.3,1).translate(0.16,0.82,0.08);
    const pos=[...a.toNonIndexed().attributes.position.array,...b.toNonIndexed().attributes.position.array];const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g;})();
  const farG=new THREE.IcosahedronGeometry(0.45,0).translate(0,0.66,0);
  const barkM=new THREE.MeshLambertMaterial({color:0x5a4a3a}),leafM=new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true});
  const inst=(geo,m,list,cols,sphere,cast)=>{const g=new THREE.BufferGeometry();if(geo.index)g.setIndex(geo.index);for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);g.boundingSphere=sphere;
    const im=new THREE.InstancedMesh(g,m,list.length);list.forEach((mm,i)=>{im.setMatrixAt(i,mm);if(cols)im.setColorAt(i,cols[i]);});im.castShadow=cast;im.receiveShadow=true;im.frustumCulled=true;scene.add(im);return im;};
  const TL=[];
  for(const t of tiles.values()){if(!t.near.length)continue;const c=new THREE.Vector3((t.x0+t.x1)/2,(t.y0+t.y1)/2,(t.z0+t.z1)/2),sphere=new THREE.Sphere(c,Math.hypot(t.x1-t.x0,t.y1-t.y0,t.z1-t.z0)/2+2);
    TL.push({c,r:sphere.radius,near:[inst(trunkG,barkM,t.near,null,sphere,true),inst(crownG,leafM,t.near,t.col,sphere,true)],far:[inst(farG,leafM,t.near,t.col,sphere,false)],isNear:false});}
  const set=(arr,v)=>{for(const m of arr)m.visible=v;};let last=-1e9;
  const update=()=>{for(const t of TL){const d=camera.position.distanceTo(t.c)-t.r,nr=t.isNear?d<NEAR+HYS:d<NEAR;if(nr!==t.isNear){t.isNear=nr;}set(t.near,nr);set(t.far,!nr&&d<FAR);}};update();
  animHooks.push(now=>{if(now-last<250)return;last=now;update();});
  api.ctx.details=Object.assign(api.ctx.details||{},{groveTrees:n,groveTiles:TL.length});
}
