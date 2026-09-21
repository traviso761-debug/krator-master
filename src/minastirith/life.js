// ---------- a city with people in it ----------
// The massing is a hill of white stone and it reads as a monument rather than as somewhere thirty thousand
// people are currently having a bad week. What a city under siege has that a monument does not: banners on
// every wall and tower, because that is what walls were for; smoke, because every one of those houses is
// cooking on wood; stalls in the gate yard and on the wider circles, because the Pelennor has been emptied
// into the city and all of it has to be sold or given away somewhere; and fire on the walls after dark.
//
// All of it is small - a banner is four metres and the city is a kilometre - so it is placed in quantity and
// merged. Fan work from Tolkien; the geometry is this project's own.
import { mkRng } from '../core/rng.js';

export function life(api){
  const {THREE,C,ctx,scene,animHooks,groundH,roofAt,box,mergeParts,nightF,hour}=api;
  const K=C.life;if(!K)return;
  const R=mkRng(K.seed||3019);
  const R_OUT=K.outer||520, R_STEP=K.step||66, TIERS=K.tiers||7, BASE=K.base||76, LIFT=K.lift||30;

  const BLACK=new THREE.MeshLambertMaterial({color:0x17161c,side:THREE.DoubleSide});
  const SILVER=new THREE.MeshLambertMaterial({color:0xcfd4dc,side:THREE.DoubleSide});
  const wood=new THREE.MeshLambertMaterial({color:0x6b5540,flatShading:true});
  const canvas=[0xd8d2c0,0xb9ae95,0xa8b49a,0xc4b48a].map(h=>
    new THREE.MeshLambertMaterial({color:h,side:THREE.DoubleSide,flatShading:true}));
  const smokeM=new THREE.MeshBasicMaterial({color:0xc4bdb0,transparent:true,opacity:0.09,depthWrite:false});
  const fireM=new THREE.MeshBasicMaterial({color:0xffae4a,transparent:true,opacity:0.9,depthWrite:false});
  const iron=new THREE.MeshLambertMaterial({color:0x35322e});

  const statics=[],banners=[],smokes=[],fires=[];

  // ---- the banners ----
  // Hung from the parapet of every circle, all the way round, and from the towers: the Steward's plain black
  // most of them, and the White Tree on the seventh because that is where the Citadel's own guard stands.
  for(let k=0;k<TIERS;k++){
    const r=R_OUT-k*R_STEP, y=BASE+k*LIFT+(k===0?26:19);
    const n=Math.max(8,Math.round(r*0.16));
    for(let i=0;i<n;i++){
      if(R()<0.45)continue;
      const a=i/n*Math.PI*2+k*0.2;
      const x=Math.cos(a)*(r+1.2), z=Math.sin(a)*(r+1.2);
      const w=1.6+R()*1.2, h=4+R()*3.4;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h,1,3),k===TIERS-1&&R()<0.5?SILVER:BLACK);
      m.position.set(x,y-h/2-0.6,z);m.rotation.y=-a+Math.PI/2;
      scene.add(m);
      banners.push({m,base:m.geometry.attributes.position.array.slice(),ph:R()*6.28,a});
      statics.push(box(x,y-0.5,z,0.5,0.5,w*1.1,iron));
    }
  }

  // ---- the smoke ----
  // Every house in the lower circles is cooking, and the smoke leans the same way because the wind comes off
  // the Pelennor. It is the one thing that makes a stone city look inhabited from a mile away.
  for(let k=0;k<(K.chimneys||0);k++){
    const a=R()*Math.PI*2, r=R()*(R_OUT-30);
    const x=Math.cos(a)*r, z=Math.sin(a)*r;
    const h=roofAt(x,z);if(h<5)continue;
    statics.push(box(x,h,z,1.1,1.8,1.1,wood));
    for(let i=0;i<3;i++){
      const p=new THREE.Mesh(new THREE.SphereGeometry(1.0+R()*1.1,6,5),smokeM);
      p.position.set(x,h+2,z);scene.add(p);
      smokes.push({p,x,z,y0:h+2,ph:(i+R())/3,drift:0.7+R()*0.7});
    }
  }

  // ---- the stalls ----
  // In the Gate Yard and along the wider stretches of each circle: a trestle, a canvas over it, and crates.
  for(let k=0;k<(K.stalls||0);k++){
    const tier=Math.floor(R()*4);
    const r=R_OUT-tier*R_STEP-R_STEP*0.45;
    const a=R()*Math.PI*2;
    const x=Math.cos(a)*r, z=Math.sin(a)*r;
    const g=groundH(x,z);
    if(roofAt(x,z)>0)continue;                        // not inside somebody's house
    const w=2.4+R()*1.6, d=1.4+R()*0.9;
    statics.push(box(x,g,z,w,1.0,d,wood));
    const top=new THREE.Mesh(new THREE.BoxGeometry(w*1.3,0.14,d*1.7),canvas[Math.floor(R()*canvas.length)]);
    top.position.set(x,g+2.3,z);top.rotation.y=-a;statics.push(top);
    for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])
      statics.push(box(x+dx*w*0.55,g,z+dz*d*0.7,0.12,2.3,0.12,wood));
    if(R()<0.6)statics.push(box(x+(R()-0.5)*3,g,z+(R()-0.5)*3,0.8,0.7,0.8,wood));
  }

  // ---- fire on the walls ----
  for(let k=0;k<TIERS;k++){
    const r=R_OUT-k*R_STEP, y=BASE+k*LIFT+(k===0?28:21);
    const n=6+k;
    for(let i=0;i<n;i++){
      const a=i/n*Math.PI*2+0.3*k;
      const x=Math.cos(a)*(r-2), z=Math.sin(a)*(r-2);
      statics.push(box(x,y,z,1.0,1.4,1.0,iron));
      const f=new THREE.Mesh(new THREE.ConeGeometry(0.8,2.2,6),fireM);
      f.position.set(x,y+2.1,z);scene.add(f);fires.push({f,ph:R()*6.28});
    }
  }

  const byMat=new Map();
  for(const m of statics){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
  for(const [mat,list] of byMat){const g=mergeParts(list,mat);g.userData.wireCat='life';scene.add(g);}

  let t0=performance.now();
  animHooks.push(now=>{
    const t=(now-t0)/1000, n=nightF(hour());
    // the banners: a wave down each one, and they all lean the same way because it is the same wind
    for(const q of banners){
      const pos=q.m.geometry.attributes.position, b=q.base;
      for(let i=0;i<pos.count;i++){
        const py=b[i*3+1];
        pos.array[i*3+2]=b[i*3+2]+Math.sin(t*1.7+q.ph+py*0.5)*0.22*(0.4-py*0.12);
      }
      pos.needsUpdate=true;
    }
    for(const q of smokes){
      const u=((t*0.07)+q.ph)%1;
      q.p.position.set(q.x+u*22*q.drift,q.y0+u*30,q.z+u*7*q.drift);
      q.p.scale.setScalar(0.6+u*2.6);q.p.material.opacity=0.1*(1-u);
    }
    fireM.opacity=(0.35+0.55*n);
    for(const q of fires)q.f.scale.set(0.8+0.3*Math.sin(t*6+q.ph),0.75+0.5*Math.sin(t*9+q.ph),0.8+0.3*Math.cos(t*5+q.ph));
  });

  ctx.details=Object.assign(ctx.details||{},{
    banners:banners.length,chimneys:Math.round(smokes.length/3),stalls:K.stalls||0,braziers:fires.length});
}
