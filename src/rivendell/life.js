// ---------- what the valley is doing while you look at it ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// The water moves on its own (water.js). This is the rest: lanterns along the paths and the terrace edge,
// lit at dusk ("the elves had brought bright lanterns to the shore"); smoke standing up out of the chimneys
// and the two hearths of the Hall of Fire, which are never out; leaves going down the river when it is
// autumn; and birds over the valley.
import { mkRng } from '../core/rng.js';

export function life(api){
  const {THREE,C,ctx,scene,animHooks,groundH}=api;
  const K=C.life||{},V=ctx.valley;if(!V)return;
  const R=mkRng(K.seed||3021);
  const hour=()=>api.hour?api.hour():12,nightF=()=>api.nightF?api.nightF(hour()):0;
  const house=V.sites.house;

  // ---- the lanterns ----
  const post=new THREE.MeshLambertMaterial({color:0x6a5a3a,flatShading:true});
  const glowM=new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:0.9,depthWrite:false});
  const posts=[],lamps=[];
  const roads=(api.ROADS||[]).filter(r=>r.c!=='primary');
  let n=0;
  for(const r of roads){const p=r.pts;for(let i=0;i+1<p.length&&n<(K.lanterns||120);i++){const [ax,az]=p[i],[bx,bz]=p[i+1],L=Math.hypot(bx-ax,bz-az);
    for(let s=R()*14;s<L&&n<(K.lanterns||120);s+=16+R()*10){const t=s/L,x=ax+(bx-ax)*t,z=az+(bz-az)*t;
      if(Math.hypot(x-house.x,z-house.z)>1100)continue;
      const nx=-(bz-az)/L,nz=(bx-ax)/L,side=R()<0.5?-1:1,px=x+nx*side*2.4,pz=z+nz*side*2.4,y=groundH(px,pz);
      const m=new THREE.Mesh(new THREE.BoxGeometry(0.16,2.6,0.16).translate(0,1.3,0),post);m.position.set(px,y,pz);posts.push(m);
      const g=new THREE.Mesh(new THREE.IcosahedronGeometry(0.34,0),glowM);g.position.set(px,y+2.75,pz);g.userData.noWire=true;scene.add(g);lamps.push({g,ph:R()*6.28});n++;}}}
  if(posts.length){const g=api.mergeParts?api.mergeParts(posts,post):null;if(g&&g.isObject3D)scene.add(g);else for(const m of posts)scene.add(m);}

  // ---- smoke from the hearths ----
  const smokeTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(220,222,218,0.55)');gr.addColorStop(1,'rgba(220,222,218,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const smokeM=new THREE.SpriteMaterial({map:smokeTex,transparent:true,depthWrite:false,opacity:0.5});
  const puffs=[];
  for(const [x,y,z] of (ctx.rivSmoke||[]))for(let k=0;k<8;k++){const sp=new THREE.Sprite(smokeM);sp.userData.noWire=true;scene.add(sp);puffs.push({sp,x,y,z,ph:k/8});}

  // ---- leaves on the river ----
  const leafM=[0xc8a13a,0xb4772c,0xd8b558,0x9a5a24].map(h=>new THREE.MeshLambertMaterial({color:h,side:THREE.DoubleSide}));
  const leaves=[],rv=V.river,Ltot=rv.length;
  for(let i=0;i<(K.leaves||0);i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.35).rotateX(-Math.PI/2),leafM[i%4]);m.userData.noWire=true;m.userData.noFingerprint=true;scene.add(m);
    leaves.push({m,s:R()*Ltot,off:(R()*2-1),sp:0.7+R()*0.6});}

  // ---- birds ----
  const birdM=new THREE.MeshLambertMaterial({color:0x2e2a26,side:THREE.DoubleSide});
  const birdG=new THREE.BufferGeometry();birdG.setAttribute('position',new THREE.Float32BufferAttribute([-1,0,0.2, 0,0,-0.3, 0,0,0.3, 1,0,0.2, 0,0,-0.3, 0,0,0.3],3));birdG.computeVertexNormals();
  const birds=[];for(let i=0;i<(K.birds||0);i++){const m=new THREE.Mesh(birdG,birdM);m.scale.setScalar(0.6);m.userData.noWire=true;m.userData.noFingerprint=true;scene.add(m);
    birds.push({m,cx:house.x+(R()-0.5)*1600,cz:house.z+(R()-0.5)*500,cy:house.y+60+R()*260,r:40+R()*160,w:(R()<0.5?-1:1)*(0.08+R()*0.12),ph:R()*6.28});}

  animHooks.push(now=>{
    const t=now/1000,nf=nightF();
    // lanterns: on from dusk, flickering a little
    for(const l of lamps){l.g.visible=nf>0.25;l.g.scale.setScalar(0.9+0.12*Math.sin(t*3+l.ph));}
    // smoke: puffs rising and spreading, leaning downstream on the valley's air
    for(const p of puffs){const a=(t*0.06+p.ph)%1;p.sp.position.set(p.x-a*14,p.y+a*26,p.z+a*4);p.sp.scale.setScalar(2+a*9);p.sp.material.opacity=0.5*(1-a);}
    // leaves: carried down the river at its speed, only when there are leaves to fall
    const season=ctx.rivSeason||0;
    for(const l of leaves){l.m.visible=season>0.3;if(!l.m.visible)continue;
      l.s=(l.s+l.sp*0.016*2.6/8)%(Ltot-1);const i=Math.floor(l.s),f=l.s-i,a=rv[i],b=rv[i+1];
      const x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f,y=a[2]+(b[2]-a[2])*f,hw=a[3]*0.8;
      l.m.position.set(x,y+0.12,z+l.off*hw);l.m.rotation.y=t*0.5+l.off*3;}
    // birds: wheeling over the valley
    for(const b of birds){const a=b.ph+t*b.w;b.m.position.set(b.cx+Math.cos(a)*b.r,b.cy+Math.sin(t*0.3+b.ph)*8,b.cz+Math.sin(a)*b.r);
      b.m.rotation.y=-a+(b.w>0?0:Math.PI);b.m.scale.y=1;b.m.rotation.z=Math.sin(t*6+b.ph)*0.5;}
  });
  ctx.details=Object.assign(ctx.details||{},{lanterns:lamps.length,chimneys:(ctx.rivSmoke||[]).length});
}
