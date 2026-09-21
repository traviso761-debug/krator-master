// ---------- what the valley is doing while you look at it ----------
// The massing gets the shape of the place, which is the important half. What it does not get is that this
// is a valley full of noise and movement: water coming off the rim on every side, smoke standing up out of
// the trees, lanterns along the galleries from dusk, and leaves going down the river all year because the
// woods here are famously never quite done turning.
//
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
import { mkRng } from '../core/rng.js';

export function life(api){
  const {THREE,C,ctx,scene,animHooks,groundH,roofAt,box,mergeParts,nightF,hour,B}=api;
  const K=C.life;if(!K)return;
  const R=mkRng(K.seed||3021);

  const brass=new THREE.MeshLambertMaterial({color:0x8a7a4a,flatShading:true});
  const glowM=new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:0.9,depthWrite:false});
  const smokeM=new THREE.MeshBasicMaterial({color:0xcfd4cc,transparent:true,opacity:0.1,depthWrite:false});
  const clothM=[0x8c4a3a,0x3f5f74,0x6a7a42,0x8a7a4a].map(h=>
    new THREE.MeshLambertMaterial({color:h,side:THREE.DoubleSide}));
  const leafM=[0xc8a13a,0xb4772c,0x8a9a42,0xd8b558].map(h=>
    new THREE.MeshLambertMaterial({color:h,side:THREE.DoubleSide}));
  const birdM=new THREE.MeshLambertMaterial({color:0x2e2a26,side:THREE.DoubleSide});

  const statics=[],lamps=[],smokes=[],flags=[],leaves=[],birds=[];

  // ---- the lanterns ----
  // Along every gallery and every path, close enough together that the whole valley is outlined after dark.
  for(let k=0;k<(K.lanterns||0);k++){
    const x=B.x0+R()*B.w, z=B.z0+R()*B.d;
    const h=roofAt(x,z);
    const y=h>2?h:groundH(x,z);
    if(Math.abs(x)>900)continue;                        // the valley only
    statics.push(box(x,y,z,0.24,2.6+R()*1.4,0.24,brass));
    const g=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,0),glowM);
    g.position.set(x,y+3.2,z);g.userData.noWire=true;scene.add(g);
    lamps.push({g,ph:R()*6.28});
  }

  // ---- the hearths ----
  for(let k=0;k<(K.chimneys||0);k++){
    const x=B.x0+R()*B.w, z=B.z0+R()*B.d;
    const h=roofAt(x,z);if(h<4)continue;
    for(let i=0;i<3;i++){
      const p=new THREE.Mesh(new THREE.SphereGeometry(1.4+R()*1.2,7,5),smokeM);
      p.position.set(x,h+2,z);p.userData.noWire=true;scene.add(p);
      smokes.push({p,x,z,y0:h+2,ph:(i+R())/3,drift:0.5+R()*0.6});
    }
  }

  // ---- the banners on the galleries ----
  for(let k=0;k<(K.banners||0);k++){
    const x=B.x0+R()*B.w, z=B.z0+R()*B.d;
    const h=roofAt(x,z);if(h<5)continue;
    const w=1.1+R()*0.9, d=2.4+R()*2;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d,1,3),clothM[Math.floor(R()*clothM.length)]);
    m.position.set(x,h-d/2-0.4,z);m.rotation.y=R()*3;
    m.userData.noWire=true;scene.add(m);
    flags.push({m,base:m.geometry.attributes.position.array.slice(),ph:R()*6.28});
  }

  // ---- what is in the air ----
  // Leaves coming down the valley on the wind, and birds over the rim. Both are single quads and both are
  // doing the same job: making a still model move at a scale you can see from anywhere in it.
  for(let k=0;k<(K.leaves||0);k++){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.34),leafM[Math.floor(R()*leafM.length)]);
    m.userData.noWire=true;scene.add(m);
    leaves.push({m,x:(R()-0.5)*1400,z:B.z0+R()*B.d,y:320+R()*260,
      v:8+R()*14,spin:(R()-0.5)*4,ph:R()*6.28,fall:2+R()*4});
  }
  for(let k=0;k<(K.birds||0);k++){
    const g=new THREE.Group();
    for(const sd of [-1,1]){
      const w=new THREE.Mesh(new THREE.PlaneGeometry(1.8,0.5),birdM);
      w.position.z=sd*0.9;w.rotation.x=-Math.PI/2;g.add(w);
    }
    g.userData.noWire=true;scene.add(g);
    birds.push({g,cx:(R()-0.5)*2000,cz:(R()-0.5)*3000,r:120+R()*420,
      y:560+R()*160,a:R()*6.28,v:(0.0004+R()*0.0005)*(R()<0.5?-1:1),ph:R()*6.28});
  }

  const byMat=new Map();
  for(const m of statics){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
  for(const [mat,list] of byMat){const g=mergeParts(list,mat);g.userData.wireCat='life';scene.add(g);}

  let t0=performance.now();
  animHooks.push(now=>{
    const t=(now-t0)/1000, n=nightF(hour());
    glowM.opacity=0.35+0.6*n;
    for(const q of lamps)q.g.scale.setScalar(0.85+0.2*Math.sin(t*2.2+q.ph));
    for(const q of smokes){
      const u=((t*0.06)+q.ph)%1;
      q.p.position.set(q.x+u*16*q.drift,q.y0+u*42,q.z+u*9*q.drift);
      q.p.scale.setScalar(0.7+u*3.2);q.p.material.opacity=0.12*(1-u);
    }
    for(const q of flags){
      const pos=q.m.geometry.attributes.position,b=q.base;
      for(let i=0;i<pos.count;i++){
        const py=b[i*3+1];
        pos.array[i*3+2]=b[i*3+2]+Math.sin(t*1.9+q.ph+py*0.6)*0.14;
      }
      pos.needsUpdate=true;
    }
    for(const q of leaves){
      q.z-=q.v*0.016;q.y-=q.fall*0.016;
      if(q.y<250||q.z<B.z0){q.z=B.z0+B.d;q.y=320+Math.random()*260;q.x=(Math.random()-0.5)*1400;}
      q.m.position.set(q.x+Math.sin(t*1.4+q.ph)*6,q.y,q.z);
      q.m.rotation.set(t*q.spin,t*q.spin*0.7,t*q.spin*1.3);
    }
    for(const q of birds){
      const a=q.a+now*q.v;
      q.g.position.set(q.cx+Math.cos(a)*q.r,q.y+9*Math.sin(t*0.6+q.ph),q.cz+Math.sin(a)*q.r);
      q.g.rotation.set(0,-a,0.2*Math.sin(t*2+q.ph));
      const beat=Math.sin(t*9+q.ph)*0.5;
      q.g.children[0].rotation.x=-Math.PI/2+beat;
      q.g.children[1].rotation.x=-Math.PI/2-beat;
    }
  });

  ctx.details=Object.assign(ctx.details||{},{
    lanterns:lamps.length,hearths:Math.round(smokes.length/3),banners:flags.length,
    leaves:leaves.length,birds:birds.length});
}
