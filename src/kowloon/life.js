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
  const {THREE,C,ctx,scene,animHooks,groundH,roofAt,buildingsAt,box,mergeParts,nightF,hour}=api;
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

  // the top of the block at a point, and nothing if there is no building there
  const top=(x,z)=>{const h=roofAt(x,z);return h>0?h:null;};

  // ---- washing lines ----
  // Strung between whatever is on either side of a gap: across the lanes, across the light wells, and from
  // a window to the building opposite. The sheets hang from them and move, because that is the one thing in
  // a photograph of this place that is never still.
  for(let k=0;k<K.lines||0;k++){
    const u=(R()-0.5)*W*0.94, v=(R()-0.5)*D*0.94;
    const [x,z]=BP(u,v);
    const h=top(x,z);if(h===null)continue;
    const y=h-R()*22-4;if(y<10)continue;
    const ang=A+(R()<0.5?0:Math.PI/2)+(R()-0.5)*0.3, len=7+R()*14;
    const ax=x-Math.cos(ang)*len/2, az=z-Math.sin(ang)*len/2;
    const bx=x+Math.cos(ang)*len/2, bz=z+Math.sin(ang)*len/2;
    const line=new THREE.Mesh(new THREE.BoxGeometry(len,0.08,0.08),lineM);
    line.position.set(x,y,z);line.rotation.y=-ang;statics.lines.push(line);
    const n=2+Math.floor(R()*5);
    for(let i=0;i<n;i++){
      const t=(i+0.6)/(n+0.2), px=ax+(bx-ax)*t, pz=az+(bz-az)*t;
      const w=0.7+R()*1.1, dh=0.8+R()*1.6;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,dh,1,2),laundryM[Math.floor(R()*laundryM.length)]);
      m.position.set(px,y-dh/2-0.1,pz);m.rotation.y=-ang;scene.add(m);
      cloth.push({m,ph:R()*6.28,ang});
    }
  }

  // ---- what is bolted to the walls ----
  // Cages over the windows, an air conditioner under about one in three of them, and the water pipes: the
  // mains went up the outside of the block in bundles because there was nowhere else to put them.
  for(let k=0;k<(K.facades||0);k++){
    const u=(R()-0.5)*W, v=(R()-0.5)*D;
    const [x,z]=BP(u,v);
    const h=top(x,z);if(h===null)continue;
    const ang=A+Math.floor(R()*4)*Math.PI/2;
    const ox=Math.cos(ang)*3.6, oz=Math.sin(ang)*3.6;
    // a bundle of pipes up the whole face
    if(R()<0.5){
      const n=2+Math.floor(R()*4);
      for(let i=0;i<n;i++){
        const off=(i-n/2)*0.4;
        const p=new THREE.Mesh(new THREE.CylinderGeometry(0.1+R()*0.07,0.1+R()*0.07,h-4,5),R()<0.3?rustM:pipeM);
        p.position.set(x+ox-Math.sin(ang)*off,(h-4)/2+2,z+oz+Math.cos(ang)*off);statics.pipes.push(p);
      }
    }
    // cages and air conditioners, storey by storey
    for(let fl=1;fl*2.9<h-3;fl++){
      if(R()<0.45)continue;
      const y=fl*2.9+1.2, off=(R()-0.5)*4.5;
      const cg=box(x+ox-Math.sin(ang)*off,y,z+oz+Math.cos(ang)*off,1.4,1.3,0.7,cageM);
      cg.rotation.y=-ang;statics.cages.push(cg);
      if(R()<0.3){
        const ac=box(x+ox*1.1-Math.sin(ang)*(off+1.1),y-0.5,z+oz*1.1+Math.cos(ang)*(off+1.1),0.8,0.6,0.55,acM);
        ac.rotation.y=-ang;statics.acs.push(ac);
      }
    }
  }

  // ---- the shops at street level ----
  // Signs out over the lane, at head height and above it, because the only way anyone found anything in
  // here was by reading their way along. They are the only colour in the place.
  for(let k=0;k<(K.signs||0);k++){
    const u=(R()-0.5)*W*0.98, v=(R()-0.5)*D*0.98;
    const [x,z]=BP(u,v);
    const h=top(x,z);if(h===null)continue;
    const ang=A+Math.floor(R()*4)*Math.PI/2;
    const y=4+R()*9;
    const w=1.4+R()*2.6, hh=0.5+R()*1.4;
    const m=neonM[Math.floor(R()*neonM.length)];
    const sign=new THREE.Mesh(new THREE.BoxGeometry(0.16,hh,w),m);
    sign.position.set(x+Math.cos(ang)*(3.4+w*0.4),y,z+Math.sin(ang)*(3.4+w*0.4));
    sign.rotation.y=-ang;scene.add(sign);
    const arm=box(x+Math.cos(ang)*3.2,y,z+Math.sin(ang)*3.2,0.9,0.09,0.09,lineM);
    arm.rotation.y=-ang;statics.rails.push(arm);
    neons.push({m:sign,mat:m,ph:R()*6.28,flick:R()<0.25});
  }

  // ---- steam ----
  // Off the noodle factories, the dai pai dongs and the extract fans, all day, because the ground floor of
  // the Walled City was mostly food and the ventilation was a hole in the wall.
  for(let k=0;k<(K.steam||0);k++){
    const u=(R()-0.5)*W*0.9, v=(R()-0.5)*D*0.9;
    const [x,z]=BP(u,v);
    const h=top(x,z);if(h===null)continue;
    const y=R()<0.6?3+R()*6:h+1;
    for(let i=0;i<3;i++){
      const p=new THREE.Mesh(new THREE.SphereGeometry(1.1+R()*1.4,6,5),steamM);
      p.position.set(x,y,z);scene.add(p);
      steams.push({p,y0:y,ph:(i+R())/3,x,z});
    }
  }

  // ---- the roof ----
  // The one place with daylight. Aerials and tanks are in the generator; what is missing is the people, and
  // the washing, and the fact that the roof of one building is the floor of somebody's afternoon.
  for(let k=0;k<(K.roofFolk||0);k++){
    const u=(R()-0.5)*W*0.86, v=(R()-0.5)*D*0.86;
    const [x,z]=BP(u,v);
    const h=top(x,z);if(h===null)continue;
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.42,1.1,0.3),shirtM[Math.floor(R()*shirtM.length)]);
    body.position.y=0.55;const head=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.28,0.26),skinM);
    head.position.y=1.25;g.add(body,head);
    g.position.set(x+(R()-0.5)*3,h,z+(R()-0.5)*3);g.rotation.y=R()*6.28;
    scene.add(g);folk.push({g,ph:R()*6.28,x:g.position.x,z:g.position.z,r:0.6+R()*2.2,a:R()*6.28,
      sp:(R()<0.5?-1:1)*(0.1+R()*0.25)});
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
      q.g.position.set(q.x+Math.cos(q.a)*q.r,q.g.position.y,q.z+Math.sin(q.a)*q.r);
      q.g.rotation.y=-q.a+Math.PI/2;}
  });

  ctx.details=Object.assign(ctx.details||{},{
    washing:cloth.length,signs:neons.length,pipes:statics.pipes.length,
    cages:statics.cages.length,roofFolk:folk.length,steam:steams.length});
}
