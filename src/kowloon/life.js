// ---------- what made it a place people lived ----------
// The massing is right and it is dead: three hundred and fifty grey boxes with windows on them. What the
// Walled City actually looked like was the stuff bolted to the outside of the boxes and strung between them,
// and almost none of it was put there by anyone who owned the building.
//
// So: washing on lines across every gap wide enough to string one; the cages people put over their windows
// and the air conditioners hung under them; the water pipes, which ran up the outside because there was no
// room inside and no plumber who would go in; the mail of neon over the shops at street level; steam off the
// noodle factories and the dai pai dongs; and on the roof - the only open ground the place had - the aerials,
// the washing again, and the people, because the roof was where you went.
//
// Everything is instanced or merged: this adds several thousand objects to a page that has to stay under a
// second, and none of it is worth a draw call of its own.
import { mkRng } from '../core/rng.js';

export function life(api){
  const {THREE,C,ctx,scene,animHooks,groundH,roofAt,buildingsAt,inPoly,box,mergeParts,nightF,hour}=api;
  const K=C.life;if(!K)return;
  const R=mkRng(K.seed||1993);
  const A=K.angle||0.14, W=K.width||210, D=K.depth||120;
  const c=Math.cos(A), s=Math.sin(A);
  const BP=(u,v)=>[u*c-v*s,u*s+v*c];                 // the block's own frame, as the generator uses it

  // ---- materials ----
  const LAUNDRY=[0xd9d2c4,0xb44a3c,0x3f6a9c,0xe0c15a,0x6d8f52,0xcf8cb0,0xe8e4da,0x4b4f58];
  const laundryM=LAUNDRY.map(h=>new THREE.MeshLambertMaterial({color:h,side:THREE.DoubleSide}));
  const lineM=new THREE.MeshLambertMaterial({color:0x3a3a38});
  const pipeM=new THREE.MeshLambertMaterial({color:0x5f6560});
  const rustM=new THREE.MeshLambertMaterial({color:0x7a5a46});
  const cageM=new THREE.MeshLambertMaterial({color:0x4a5048});
  const acM=new THREE.MeshLambertMaterial({color:0xb9b4a8});
  const steamM=new THREE.MeshBasicMaterial({color:0xd8d4cc,transparent:true,opacity:0.14,depthWrite:false});
  const NEON=[0xff3b6b,0x36e0d0,0xffc63b,0x5ad84a,0xff7a2a,0xe04adc];
  const neonM=NEON.map(h=>new THREE.MeshBasicMaterial({color:h}));
  const skinM=new THREE.MeshLambertMaterial({color:0xb08968});
  const shirtM=[0xcf4a3c,0x3f6a9c,0xe8e4da,0x4b4f58,0x6d8f52].map(h=>new THREE.MeshLambertMaterial({color:h}));

  const statics={pipes:[],cages:[],acs:[],lines:[],rails:[]};
  const cloth=[],neons=[],steams=[],folk=[];

  // ---- where things are allowed to be ----
  // Everything here hangs on a wall or stands on a roof, so everything here has to find a real one first.
  // roofAt() answers with a height for any point within twenty metres of a building, which is what it is for
  // - a spire needs to know what it is standing near - and using it to place things left washing lines and
  // neon signs hanging in mid-air over the lanes and the light wells.
  function onBuilding(){
    for(let t=0;t<50;t++){
      const u=(R()-0.5)*W, v=(R()-0.5)*D, [x,z]=BP(u,v);
      for(const b of buildingsAt(x,z,0))if(inPoly(x,z,b.ring))return {b,x,z,h:b.h};
    }
    return null;
  }
  // the nearest wall of a footprint, as a point on it and the direction out of it
  function wallNear(b,x,z){
    let best=null;
    for(let i=0,j=b.ring.length-1;i<b.ring.length;j=i++){
      const [ax,az]=b.ring[j],[bx2,bz2]=b.ring[i];
      const dx=bx2-ax,dz=bz2-az,L2=dx*dx+dz*dz;if(!L2)continue;
      const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/L2));
      const px=ax+dx*t,pz=az+dz*t,d=Math.hypot(x-px,z-pz);
      if(!best||d<best.d){
        let nx=dz/Math.sqrt(L2),nz=-dx/Math.sqrt(L2);
        // point the normal away from the middle of the footprint
        let cx=0,cz=0;for(const [rx,rz] of b.ring){cx+=rx;cz+=rz;}cx/=b.ring.length;cz/=b.ring.length;
        if((px-cx)*nx+(pz-cz)*nz<0){nx=-nx;nz=-nz;}
        best={d,x:px,z:pz,nx,nz,ang:Math.atan2(nz,nx)};
      }
    }
    return best;
  }
  // is there open air this far out from a wall? a sign or a line needs somewhere to hang
  const clearOut=(w,dist)=>{
    const x=w.x+w.nx*dist,z=w.z+w.nz*dist;
    for(const b of buildingsAt(x,z,0))if(inPoly(x,z,b.ring))return false;
    return true;
  };

  // ---- washing lines ----
  // Strung between whatever is on either side of a gap: across the lanes, across the light wells, and from
  // a window to the building opposite. The sheets hang from them and move, because that is the one thing in
  // a photograph of this place that is never still.
  for(let k=0;k<(K.lines||0);k++){
    const hit=onBuilding();if(!hit)continue;
    const w=wallNear(hit.b,hit.x,hit.z);if(!w)continue;
    // how far out the gap goes before it hits something again: that is what the line can span
    let span=0;
    for(let d=2;d<=16;d+=1){if(!clearOut(w,d)){span=d;break;}}
    if(span<3)continue;                                // nothing opposite: no line
    const y=6+R()*Math.max(1,hit.h-9);
    const ax=w.x+w.nx*1.0, az=w.z+w.nz*1.0;
    const bx=w.x+w.nx*(span-0.6), bz=w.z+w.nz*(span-0.6);
    const len=Math.hypot(bx-ax,bz-az);
    const line=new THREE.Mesh(new THREE.BoxGeometry(len,0.07,0.07),lineM);
    line.position.set((ax+bx)/2,y,(az+bz)/2);line.rotation.y=-w.ang;statics.lines.push(line);
    const n=1+Math.floor(R()*4);
    for(let i=0;i<n;i++){
      const t=(i+0.7)/(n+0.4), px=ax+(bx-ax)*t, pz=az+(bz-az)*t;
      const cw=0.6+R()*1.0, dh=0.7+R()*1.5;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(cw,dh,1,2),laundryM[Math.floor(R()*laundryM.length)]);
      m.position.set(px,y-dh/2-0.1,pz);m.rotation.y=-w.ang+Math.PI/2;scene.add(m);
      cloth.push({m,ph:R()*6.28,ang:w.ang});
    }
  }

  // ---- what is bolted to the walls ----
  // Cages over the windows, an air conditioner under about one in three of them, and the water pipes: the
  // mains went up the outside of the block in bundles because there was nowhere else to put them.
  for(let k=0;k<(K.facades||0);k++){
    const hit=onBuilding();if(!hit)continue;
    const w=wallNear(hit.b,hit.x,hit.z);if(!w||!clearOut(w,1.6))continue;
    const ox=w.nx*0.45, oz=w.nz*0.45;                  // just proud of the wall, not floating off it
    if(R()<0.5){                                       // a bundle of pipes up the whole face
      const n=2+Math.floor(R()*4);
      for(let i=0;i<n;i++){
        const off=(i-n/2)*0.4;
        const p=new THREE.Mesh(new THREE.CylinderGeometry(0.1+R()*0.06,0.1+R()*0.06,hit.h-4,5),R()<0.3?rustM:pipeM);
        p.position.set(w.x+ox-w.nz*off,(hit.h-4)/2+2,w.z+oz+w.nx*off);statics.pipes.push(p);
      }
    }
    for(let fl=1;fl*2.9<hit.h-3;fl++){
      if(R()<0.45)continue;
      const y=fl*2.9+1.2, off=(R()-0.5)*4.0;
      const cg=box(w.x+ox-w.nz*off,y,w.z+oz+w.nx*off,1.3,1.2,0.6,cageM);
      cg.rotation.y=-w.ang;statics.cages.push(cg);
      if(R()<0.3){
        const ac=box(w.x+w.nx*0.95-w.nz*(off+1.0),y-0.5,w.z+w.nz*0.95+w.nx*(off+1.0),0.75,0.55,0.5,acM);
        ac.rotation.y=-w.ang;statics.acs.push(ac);
      }
    }
  }

  // ---- the shops at street level ----
  // Signs out over the lane, at head height and above it, because the only way anyone found anything in
  // here was by reading their way along. They are the only colour in the place.
  for(let k=0;k<(K.signs||0);k++){
    const hit=onBuilding();if(!hit)continue;
    const w=wallNear(hit.b,hit.x,hit.z);if(!w)continue;
    const reach=1.6+R()*2.4;
    if(!clearOut(w,reach+0.8))continue;                // it has to hang over something you can walk down
    const y=4+R()*Math.min(9,Math.max(1,hit.h-6));
    const sw=1.2+R()*2.0, hh=0.5+R()*1.2;
    const m=neonM[Math.floor(R()*neonM.length)];
    const sign=new THREE.Mesh(new THREE.BoxGeometry(0.16,hh,sw),m);
    sign.position.set(w.x+w.nx*reach,y,w.z+w.nz*reach);sign.rotation.y=-w.ang;scene.add(sign);
    const arm=box(w.x+w.nx*(reach*0.5),y,w.z+w.nz*(reach*0.5),reach,0.09,0.09,lineM);
    arm.rotation.y=-w.ang;statics.rails.push(arm);
    neons.push({m:sign,mat:m,ph:R()*6.28,flick:R()<0.25});
  }

  // ---- steam ----
  // Off the noodle factories, the dai pai dongs and the extract fans, all day, because the ground floor of
  // the Walled City was mostly food and the ventilation was a hole in the wall.
  for(let k=0;k<(K.steam||0);k++){
    const hit=onBuilding();if(!hit)continue;
    const w=wallNear(hit.b,hit.x,hit.z);if(!w)continue;
    const roof=R()<0.4;
    const x=roof?hit.x:w.x+w.nx*0.8, z=roof?hit.z:w.z+w.nz*0.8;
    const y=roof?hit.h+1:3+R()*5;
    if(!roof&&!clearOut(w,1.4))continue;
    for(let i=0;i<3;i++){
      const p=new THREE.Mesh(new THREE.SphereGeometry(0.9+R()*1.2,6,5),steamM);
      p.position.set(x,y,z);scene.add(p);
      steams.push({p,y0:y,ph:(i+R())/3,x,z});
    }
  }

  // ---- the roof ----
  // The one place with daylight. Aerials and tanks are in the generator; what is missing is the people, and
  // the washing, and the fact that the roof of one building is the floor of somebody's afternoon.
  for(let k=0;k<(K.roofFolk||0);k++){
    const hit=onBuilding();if(!hit||hit.h<12)continue;
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.42,1.1,0.3),shirtM[Math.floor(R()*shirtM.length)]);
    body.position.y=0.55;const head=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.28,0.26),skinM);
    head.position.y=1.25;g.add(body,head);
    g.position.set(hit.x,hit.h,hit.z);g.rotation.y=R()*6.28;
    scene.add(g);folk.push({g,ph:R()*6.28,x:hit.x,z:hit.z,r:0.5+R()*1.4,a:R()*6.28,
      sp:(R()<0.5?-1:1)*(0.1+R()*0.25),b:hit.b});
  }

  // ---- everything static, merged ----
  const merged=[];
  for(const [key,mat] of [['pipes',pipeM],['cages',cageM],['acs',acM],['lines',lineM],['rails',lineM]]){
    const list=statics[key].filter(m=>m.material===mat);
    if(list.length)merged.push(mergeParts(list,mat));
  }
  {const rusty=statics.pipes.filter(m=>m.material===rustM);if(rusty.length)merged.push(mergeParts(rusty,rustM));}
  for(const m of merged){m.userData.wireCat='life';scene.add(m);}

  // ---- it moves ----
  let t0=performance.now();
  animHooks.push(now=>{
    const t=(now-t0)/1000, n=nightF(hour());
    for(const q of cloth){const sw=Math.sin(t*0.9+q.ph)*0.18+Math.sin(t*2.3+q.ph)*0.05;
      q.m.rotation.z=sw;q.m.rotation.x=Math.sin(t*1.3+q.ph)*0.09;}
    // a quarter of the signs have a tube on the way out, which is the other thing every photograph has
    for(const q of neons){const on=q.flick?(Math.sin(t*7+q.ph)>-0.7?1:0.3):1;
      q.m.scale.setScalar(0.92+0.08*on+0.06*n);}
    for(const q of steams){const u=((t*0.16)+q.ph)%1;
      q.p.position.set(q.x+Math.sin(t*0.7+q.ph)*u*2.2,q.y0+u*7,q.z+Math.cos(t*0.5+q.ph)*u*1.6);
      q.p.scale.setScalar(0.5+u*2.4);q.p.material.opacity=0.16*(1-u);}
    for(const q of folk){q.a+=q.sp*0.016;
      const nx=q.x+Math.cos(q.a)*q.r,nz=q.z+Math.sin(q.a)*q.r;
      if(inPoly(nx,nz,q.b.ring))q.g.position.set(nx,q.g.position.y,nz);   // nobody walks off the roof
      q.g.rotation.y=-q.a+Math.PI/2;}
  });

  ctx.details=Object.assign(ctx.details||{},{
    washing:cloth.length,signs:neons.length,pipes:statics.pipes.length,
    cages:statics.cages.length,roofFolk:folk.length,steam:steams.length});
}
