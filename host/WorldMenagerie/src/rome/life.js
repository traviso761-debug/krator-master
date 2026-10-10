// ---------- the things that make Rome look like Rome, after the domes ----------
// The stone pines: Pinus pinea, the umbrella pine, a tall bare trunk leaning a little and a flat dark crown on top.
// They stand in every park and on every hill - the Palatine, the Aventine, the Janiculum, the Pincian, the gardens of
// the villas - and from any height they are half the skyline. And the cypresses, dark and narrow, along the
// cemeteries and among the pines. Both are planted in the mapped parks, gardens and woods, never in a building or
// in the Tiber.
//
// Map data (c) OpenStreetMap contributors, ODbL; the geometry is this project's own.
import {mkRng} from '../core/rng.js';

export function life(api){
  const {THREE,C,scene,groundH,buildingsAt,inPoly,inWater,AREAS}=api;
  const K=C.life;if(!K)return;
  const R=mkRng(K.seed||753);
  const PARK=new Set(K.kinds||['park','garden','wood','nature_reserve','grass','cemetery','recreation_ground','scrub']);
  const inBuilding=(x,z)=>buildingsAt(x,z,0).some(b=>inPoly(x,z,b.ring));
  const pines=[],cypresses=[];
  for(const a of AREAS){if(!PARK.has(a.kind))continue;const {x0,x1,z0,z1}=a.bb,area=(x1-x0)*(z1-z0);if(area<1500)continue;
    const n=Math.min(K.perArea||400,Math.round(area*(K.density||0.0011)*(a.kind==='cemetery'?0.6:1)));
    for(let k=0,tries=0;k<n&&tries<n*4;tries++){const x=x0+R()*(x1-x0),z=z0+R()*(z1-z0);if(!inPoly(x,z,a.o)||a.i.some(h=>inPoly(x,z,h))||inWater(x,z)||inBuilding(x,z))continue;k++;
      if(a.kind==='cemetery'||R()<(K.cypress||0.12))cypresses.push([x,z]);else pines.push([x,z]);}
    if(pines.length+cypresses.length>(K.max||7000))break;}
  const o=new THREE.Object3D(),m=new THREE.Matrix4();
  // The trees are drawn in tiles (K.tile metres), each with its own bounds, so a tile out of the frame is not drawn at
  // all; and in two levels: within K.near of the camera a tile draws whole trees - trunks, three or four lobes to a crown,
  // their shadows - and beyond it one low lobe a crown and no trunk, no shadow; beyond K.far nothing. The placements and
  // the random numbers are the same as they always were: only how they are drawn has changed.
  const TILE=K.tile||400,NEAR=K.near||900,FAR=K.far||5000,tiles=new Map();
  const tileOf=(x,z)=>{const k=Math.floor(x/TILE)+','+Math.floor(z/TILE);let t=tiles.get(k);if(!t){t={trunk:[],lobe:[],far:[],cyp:[],cypFar:[],x0:1e9,x1:-1e9,z0:1e9,z1:-1e9,y0:1e9,y1:-1e9};tiles.set(k,t);}return t;};
  const grow=(t,x,y,z,r)=>{t.x0=Math.min(t.x0,x-r);t.x1=Math.max(t.x1,x+r);t.z0=Math.min(t.z0,z-r);t.z1=Math.max(t.z1,z+r);t.y0=Math.min(t.y0,y);t.y1=Math.max(t.y1,y);};
  const mat4=(x,y,z,rx,ry,rz,sx,sy,sz)=>{o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.updateMatrix();return o.matrix.clone();};
  // the pines: a trunk, leaning; a crown of three or four flattened lobes, wide and flat-topped
  let lobeN=0;
  for(const [x,z] of pines){const g=groundH(x,z),h=12+R()*10,lean=(R()-0.5)*0.22,dir=R()*Math.PI*2,tx=x+Math.sin(lean)*Math.cos(dir)*h,tz=z+Math.sin(lean)*Math.sin(dir)*h,top=g+h*Math.cos(lean);
    const lobes=[[tx,top,tz,6+R()*3.5]],nl=2+Math.floor(R()*2);for(let j=0;j<nl;j++){const a=R()*Math.PI*2,d=3+R()*3;lobes.push([tx+Math.cos(a)*d,top-0.8+R()*1.2,tz+Math.sin(a)*d,3.5+R()*2.5]);}
    const t=tileOf(x,z);t.trunk.push(mat4(x,g,z,Math.sin(dir)*lean,0,-Math.cos(dir)*lean,1,h,1));grow(t,x,g,z,1);
    for(const [lx,ly,lz,r] of lobes){t.lobe.push(mat4(lx,ly,lz,0,(lobeN++)*1.3,0,r,r*0.36,r));grow(t,lx,ly+r*0.36,lz,r);}
    t.far.push(mat4(tx,top,tz,0,0,0,lobes[0][3]*1.35,lobes[0][3]*0.42,lobes[0][3]*1.35));}
  // the cypresses: tall dark flames (far off, one plain spike)
  for(const [x,z] of cypresses){const h=13+R()*9,w=1.4+R()*0.8,g=groundH(x,z),t=tileOf(x,z);t.cyp.push(mat4(x,g,z,0,0,0,w,h,w));t.cypFar.push(mat4(x,g,z,0,0,0,w,h,w));grow(t,x,g,z,w);grow(t,x,g+h,z,w);}
  const trunkG=new THREE.CylinderGeometry(0.28,0.55,1,7).translate(0,0.5,0),lobeG=new THREE.IcosahedronGeometry(1,1),farG=new THREE.IcosahedronGeometry(1,0);
  const cypG=new THREE.CylinderGeometry(0.15,1.0,1,8,3).translate(0,0.5,0);{const p=cypG.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),k=Math.sin(Math.PI*Math.min(1,y*1.15))*1.15;p.setX(i,p.getX(i)*k);p.setZ(i,p.getZ(i)*k);}cypG.computeVertexNormals();}
  const cypFarG=new THREE.ConeGeometry(0.75,1,5).translate(0,0.5,0);
  const barkM=new THREE.MeshLambertMaterial({color:0x6a5040}),needleM=new THREE.MeshLambertMaterial({color:0x3d5a32,flatShading:true}),cypM=new THREE.MeshLambertMaterial({color:0x2c4228});
  // one instanced mesh per tile and level, sharing the geometry's buffers but carrying the tile's own bounds
  const inst=(geo,m,list,sphere,cast)=>{if(!list.length)return null;const g=new THREE.BufferGeometry();if(geo.index)g.setIndex(geo.index);for(const k in geo.attributes)g.setAttribute(k,geo.attributes[k]);
    g.boundingSphere=sphere;const im=new THREE.InstancedMesh(g,m,list.length);list.forEach((mm,i)=>im.setMatrixAt(i,mm));im.castShadow=cast;im.receiveShadow=true;im.frustumCulled=true;scene.add(im);return im;};   // culled by the tile's own bounds (an InstancedMesh is not, by default)
  const TL=[];let nearTris=0,farTris=0;
  for(const t of tiles.values()){const c=new THREE.Vector3((t.x0+t.x1)/2,(t.y0+t.y1)/2,(t.z0+t.z1)/2),sphere=new THREE.Sphere(c,Math.hypot(t.x1-t.x0,t.y1-t.y0,t.z1-t.z0)/2+2);
    const near=[inst(trunkG,barkM,t.trunk,sphere,true),inst(lobeG,needleM,t.lobe,sphere,true),inst(cypG,cypM,t.cyp,sphere,true)].filter(Boolean);
    const far=[inst(farG,needleM,t.far,sphere,false),inst(cypFarG,cypM,t.cypFar,sphere,false)].filter(Boolean);
    nearTris+=t.trunk.length*14+t.lobe.length*80+t.cyp.length*48;farTris+=t.far.length*20+t.cypFar.length*5;TL.push({c,r:sphere.radius,near,far});}
  {let last=-1e9;const cam=api.camera,set=(arr,v)=>{for(const m of arr)m.visible=v;};
    // hysteresis: a tile goes near inside NEAR and back to far only past NEAR+HYS, so it does not flicker at the line while the camera moves
    const HYS=K.hysteresis||80,update=()=>{for(const t of TL){const d=cam.position.distanceTo(t.c)-t.r,n=t.isNear?d<NEAR+HYS:d<NEAR;if(n!==t.isNear){t.isNear=n;set(t.near,n);}set(t.far,!n&&d<FAR);}};update();
    api.animHooks.push(now=>{if(now-last<250)return;last=now;update();});}
  api.ctx.details=Object.assign(api.ctx.details||{},{stonePines:pines.length,cypresses:cypresses.length,treeTiles:TL.length,treeTrisNear:nearTris,treeTrisFar:farTris});
}
