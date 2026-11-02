// ---------- Sarajevo: the street dogs ----------
// Sarajevo has thousands of street dogs: big, calm, mostly tan or black, sleeping in the sun on the pavement or in a
// park, trotting along a lane in twos and threes, a yellow tag in one ear from the city's catch-and-release. They are
// placed here along the lanes and streets and in the parks (C.dogs: how many, the box, the share asleep, how many
// to a pack), each from a hash of its place; the awake ones trot up and down their stretch of street, the sleepers
// lie curled. Two instanced meshes, standing and lying; only the walkers are moved, and only near the camera.
import {hash3,mkRng} from '../core/rng.js';

export function dogs(api){
  const {THREE,C,scene,ROADS,AREAS,P,groundH,inWater,inPoly,buildingsAt,animHooks,camera}=api;const K=C.dogs;if(!K)return;
  const [s,w,n,e]=K.box,[x0,z1]=P([s,w]),[x1,z0]=P([n,e]),R=mkRng(K.seed||2003),NEAR=K.near||450;
  // the body plan, built facing +z, a big dog about 0.6 m at the shoulder
  const merge=gs=>{const pos=[];for(const g of gs){const a=g.toNonIndexed().attributes.position.array;for(let i=0;i<a.length;i++)pos.push(a[i]);}
    const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.computeVertexNormals();return ge;};
  const bx=(w,h,d,x,y,z,rx=0)=>new THREE.BoxGeometry(w,h,d).rotateX(rx).translate(x,y,z);
  const STAND=merge([bx(0.34,0.34,0.86,0,0.58,-0.02),bx(0.36,0.4,0.3,0,0.6,0.3),          // the body, the deep chest
    bx(0.2,0.24,0.22,0,0.82,0.48,-0.6),bx(0.26,0.25,0.3,0,0.95,0.6),bx(0.15,0.13,0.2,0,0.9,0.82),   // the neck, the head, the muzzle
    bx(0.08,0.15,0.05,-0.09,1.12,0.55,0.25),bx(0.08,0.15,0.05,0.09,1.12,0.55,0.25),                    // the ears, up
    bx(0.1,0.46,0.1,-0.11,0.2,0.32),bx(0.1,0.46,0.1,0.11,0.2,0.32),bx(0.11,0.46,0.12,-0.11,0.2,-0.32),bx(0.11,0.46,0.12,0.11,0.2,-0.32),
    bx(0.08,0.08,0.38,0,0.78,-0.55,-0.9)]);                                                          // the tail, curled up
  const LIE=merge([bx(0.44,0.3,0.8,0,0.15,0),bx(0.3,0.22,0.24,0.04,0.11,0.42),                         // the body, the haunch
    bx(0.24,0.24,0.28,0.1,0.3,0.5),bx(0.14,0.12,0.2,0.12,0.24,0.7),                                     // the head, raised, its muzzle
    bx(0.07,0.12,0.05,0.03,0.46,0.47,0.3),bx(0.07,0.12,0.05,0.17,0.46,0.47,0.3),
    bx(0.1,0.07,0.36,-0.06,0.035,0.55),bx(0.1,0.07,0.36,0.16,0.035,0.55),                               // the forepaws, out in front
    bx(0.08,0.07,0.42,-0.22,0.04,-0.2,0.1)]);                                                           // the tail, along the side
  const COAT=['#c8a070','#b8905a','#d8b888','#2a2622','#3a302a','#7a5232','#e8e2d6','#8a8580','#a8784a'].map(c=>new THREE.Color(c));
  // where: a stretch of lane or street, or a spot in a park
  const ways=ROADS.filter(r=>(K.classes||['pedestrian','living_street','residential','service','footway','unclassified','tertiary']).includes(r.c)&&r.len>20&&r.pts.some(([x,z])=>x>=x0&&x<=x1&&z>=z0&&z<=z1));
  const parks=AREAS.filter(a=>['park','grass','garden','recreation_ground'].includes(a.kind)&&a.bb.x0<x1&&a.bb.x1>x0&&a.bb.z0<z1&&a.bb.z1>z0);
  const clear=(x,z)=>x>=x0&&x<=x1&&z>=z0&&z<=z1&&!inWater(x,z)&&!buildingsAt(x,z,1).some(b=>inPoly(x,z,b.ring));
  const D=[];let tries=0;
  while(D.length<(K.count||160)&&tries++<(K.count||160)*30){
    const inPark=parks.length&&R()<(K.parks||0.3);let x,z,road=null,u=0;
    if(inPark){const a=parks[Math.floor(R()*parks.length)];x=a.bb.x0+R()*(a.bb.x1-a.bb.x0);z=a.bb.z0+R()*(a.bb.z1-a.bb.z0);if(!inPoly(x,z,a.o))continue;}
    else{road=ways[Math.floor(R()*ways.length)];if(!road)break;u=R()*road.len;const k=at(road,u);x=k[0]+(R()-0.5)*road.w*0.8;z=k[1]+(R()-0.5)*road.w*0.8;}
    if(!clear(x,z))continue;
    // a pack: one to three more nearby, of the same mood
    const pack=1+(R()<(K.packs||0.35)?1+Math.floor(R()*3):0),asleep=R()<(K.asleep||0.45);
    for(let i=0;i<pack&&D.length<(K.count||160);i++){const px=x+(i?(R()-0.5)*4:0),pz=z+(i?(R()-0.5)*4:0);if(!clear(px,pz))continue;
      D.push({x:px,z:pz,ry:R()*Math.PI*2,col:COAT[Math.floor(hash3(px,pz,1)*COAT.length)],asleep,road:!asleep&&road?road:null,u:u+(i?-1.5*i:0),dir:R()<0.5?1:-1,v:0.9+R()*0.8,off:(R()-0.5)*2,ph:R()*6,sc:0.95+R()*0.35,idle:R()<0.3});}}
  function at(r,u){let s0=0;for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx2,bz]=r.pts[i+1],L=Math.hypot(bx2-ax,bz-az);if(s0+L>=u||i+2===r.pts.length){const f=L?Math.min(1,Math.max(0,(u-s0)/L)):0;return [ax+(bx2-ax)*f,az+(bz-az)*f,Math.atan2(bx2-ax,bz-az)];}s0+=L;}return [r.pts[0][0],r.pts[0][1],0];}
  const lying=D.filter(d=>d.asleep),up=D.filter(d=>!d.asleep);
  const mat=new THREE.MeshLambertMaterial({color:0xffffff}),o=new THREE.Object3D();
  const imL=new THREE.InstancedMesh(LIE,mat,Math.max(1,lying.length)),imS=new THREE.InstancedMesh(STAND,mat,Math.max(1,up.length));
  lying.forEach((d,i)=>{o.position.set(d.x,groundH(d.x,d.z)+0.02,d.z);o.rotation.set(0,d.ry,0);o.scale.setScalar(d.sc);o.updateMatrix();imL.setMatrixAt(i,o.matrix);imL.setColorAt(i,d.col);});
  up.forEach((d,i)=>imS.setColorAt(i,d.col));imL.count=lying.length;imS.count=up.length;
  for(const im of [imL,imS]){if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=true;im.receiveShadow=true;im.userData.noFingerprint=true;scene.add(im);}
  // the walkers: up and down their stretch of street, now and then stopping to look about
  let last=performance.now();
  const pose=(now,dt)=>{const p=camera.position;for(let i=0;i<up.length;i++){const d=up[i];if(Math.abs(p.x-d.x)>NEAR||Math.abs(p.z-d.z)>NEAR)continue;
      let x=d.x,z=d.z,ry=d.ry,bob=0;
      if(d.road&&!d.idle){d.u+=d.dir*d.v*dt;if(d.u<2||d.u>d.road.len-2){d.dir*=-1;d.u=Math.max(2,Math.min(d.road.len-2,d.u));}
        const k=at(d.road,d.u);x=k[0]+Math.cos(k[2])*d.off;z=k[1]-Math.sin(k[2])*d.off;ry=k[2]+(d.dir<0?Math.PI:0);bob=Math.abs(Math.sin(now*0.012*d.v+d.ph))*0.04;d.x=x;d.z=z;}
      else ry=d.ry+Math.sin(now*0.0004+d.ph)*0.6;
      o.position.set(x,groundH(x,z)+bob,z);o.rotation.set(0,ry,0);o.scale.setScalar(d.sc);o.updateMatrix();imS.setMatrixAt(i,o.matrix);}
    imS.instanceMatrix.needsUpdate=true;};
  pose(last,0);
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;const p=camera.position,vis=p.y-groundH(p.x,p.z)<NEAR*1.2;imS.visible=imL.visible=vis;if(vis)pose(now,dt);});
  api.ctx.details=Object.assign(api.ctx.details||{},{dogs:{asleep:lying.length,about:up.length}});
}
