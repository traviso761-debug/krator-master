// ---------- the City: a sample of the stack ----------
// Fan work after Tsutomu Nihei's Blame!. Nothing of his is used: every shape here comes out of a seeded
// generator and the numbers in data/cities/blame.json.
//
// What is built is a block 48 km square and 25 km high: four layers of the City and the five Megastructure
// slabs between them, bottom to top -
//
//   the Arcade    3.2 km   walls of arched windows, canyons, bridges thrown across them
//   the Works     2.6 km   machine towers floor to ceiling, girders at every angle, pipes kilometres long
//   the Plain     9 km     a ruled floor with towers clustered on its seams, weather, a spire hung from the roof
//   the Hanging   3.6 km   structure grown down from the ceiling; Killy, on a platform 1,450 m up
//
// - with a shaft 900 m across dropped through two of the slabs, so that from its rim you look down through the
// Plain into the Works. The block is a sample. In the manga there are thousands of layers, and the whole
// thing is a shell round the Sun as wide as Jupiter's orbit; sphere.js draws that.
//
// Everything is instanced. A layer is a few thousand boxes, prisms and cylinders in half a dozen
// InstancedMeshes, each instance with its own grey; what makes a box a wall of windows or a machine is the
// material's pattern (mats.js), not geometry. The only things modelled at human scale are round Killy's
// platform, because that is the one place you will ever stand close enough to need them.
import {mkRng} from '../core/rng.js';
import {makeFigures} from './figures.js';
import {details,TRUNK_LEVELS} from './detail.js';
import {makeBuilders} from './builders.js';

export function buildCity(api){
  const {THREE,C,scene,mats,tex}=api;
  const R=mkRng(C.seed*7919+1);
  const rr=(a,b)=>a+(b-a)*R(),pick=a=>a[Math.floor(R()*a.length)];
  const HALF=C.block/2;
  const rows=[];                                     // the fingerprint: every instance placed

  // ---- the stack ----
  const stack=[];let y=0;
  for(const s of C.stack){
    if(s.slab){stack.push({kind:'slab',y0:y,y1:y+s.slab,h:s.slab});y+=s.slab;}
    else{stack.push({kind:'layer',key:s.layer,name:s.name,y0:y,y1:y+s.h,h:s.h,fog:s.fog,note:s.note});y+=s.h;}
  }
  const TOP=y;
  const L={};for(const s of stack)if(s.kind==='layer')L[s.key]=s;
  const slabUnder=k=>stack[stack.indexOf(L[k])-1],slabOver=k=>stack[stack.indexOf(L[k])+1];

  // ---- instancing ----
  const G={
    box:new THREE.BoxGeometry(1,1,1),
    cyl:new THREE.CylinderGeometry(1,1,1,24,1),
    cyl8:new THREE.CylinderGeometry(1,1,1,10,1),
    // a hanging prism: square, wide at the top and drawn to a point below
    drip:new THREE.CylinderGeometry(0.71,0.12,1,4,1).rotateY(Math.PI/4),
    arch:archGeometry(THREE),
    dome:new THREE.SphereGeometry(1,16,6,0,Math.PI*2,0,Math.PI/2),
    cyl6:new THREE.CylinderGeometry(1,1,1,6,1),cyl12:new THREE.CylinderGeometry(1,1,1,12,1),
    pyr:new THREE.ConeGeometry(0.71,1,4,1).rotateY(Math.PI/4),
  };
  // The trunks go through everything, so whatever the layers would have put where a trunk stands is not put.
  const trunks=C.trunks||[];
  const reg={arcade:[],works:[],drips:[]};
  const batches=[];
  const o3=new THREE.Object3D();o3.rotation.order='YXZ';
  const col=new THREE.Color();
  function batch(name,geo,mat){const b={name,geo,mat,m:[],c:[]};batches.push(b);return b;}
  // put(b, centre x y z, size x y z, grey, heading, pitch about local z, free) - returns the instance, or -1
  // if a trunk is standing there (free: put it anyway; the Megastructure's own pieces go through the trunks)
  function put(b,x,y,z,sx,sy,sz,grey,ry,rz,free){
    if(!free)for(const t of trunks)if(Math.abs(x-t.x)<t.w/2+Math.max(sx,sz)*0.3&&Math.abs(z-t.z)<t.d/2+Math.max(sx,sz)*0.3)return -1;
    o3.position.set(x,y,z);o3.rotation.set(0,ry||0,rz||0);o3.scale.set(sx,sy,sz);o3.updateMatrix();
    b.m.push(o3.matrix.clone());b.c.push(grey);
    rows.push({x,z,w:sx,dpt:sz,h:y,ry:ry||0,kind:b.name,fixed:false});
    return b.m.length-1;
  }
  const lights=[],lightCol=[];
  function light(x,y,z,warm){lights.push(x,y,z);
    if(warm)lightCol.push(1,0.78,0.5);else{const k=0.85+R()*0.15;lightCol.push(k,k,1);}}
  // a few lights scattered over the sides of an instance already placed
  function speckle(b,i,n,warmP){if(i<0)return;const m=b.m[i],v=new THREE.Vector3();
    for(let k=0;k<n;k++){const f=Math.floor(R()*4),a=R()-0.5,h=R()-0.5;
      v.set(f===0?0.505:f===1?-0.505:a,h,f===2?0.505:f===3?-0.505:a).applyMatrix4(m);light(v.x,v.y,v.z,R()<(warmP||0.15));}}
  const cables=[];
  function cable(a,b,sag,n){n=n||14;let px=a[0],py=a[1],pz=a[2];
    for(let i=1;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,yy=a[1]+(b[1]-a[1])*t-sag*4*t*(1-t);
      cables.push(px,py,pz,x,yy,z);px=x;py=yy;pz=z;}}

  const M={
    mega:mats.mk('mega',{color:0x85888c}),
    arcade:mats.mk('arcade',{color:0xffffff}),
    machine:mats.mk('machine',{color:0xffffff}),
    concrete:mats.mk('concrete',{color:0xffffff}),
    hanging:mats.mk('hanging',{color:0xffffff}),
  };

  // ---- the Megastructure: the slabs, with their holes ----
  const S=C.shaft;
  const holes=new Map();                                   // slab index -> [[x,z,r]]
  const addHole=(slab,x,z,r)=>{const k=stack.indexOf(slab);if(!holes.has(k))holes.set(k,[]);holes.get(k).push([x,z,r]);};
  addHole(slabUnder('hanging'),S.x,S.z,S.r);
  addHole(slabUnder('plain'),S.x,S.z,S.r*0.92);
  // light wells: smaller holes, placed away from everything that matters
  for(const [k,n,r0,r1] of [['arcade',3,90,240],['works',4,120,300],['plain',5,140,360],['hanging',4,120,280]]){
    const slab=slabOver(k);
    for(let i=0;i<n;i++){const x=rr(-17000,17000),z=rr(-17000,17000);
      if(Math.hypot(x-S.x,z-S.z)<3000||Math.hypot(x,z)<3500)continue;addHole(slab,x,z,rr(r0,r1));}
  }
  stack.forEach((s,k)=>{
    if(s.kind!=='slab')return;
    const sh=new THREE.Shape();sh.moveTo(-HALF,-HALF);sh.lineTo(HALF,-HALF);sh.lineTo(HALF,HALF);sh.lineTo(-HALF,HALF);sh.lineTo(-HALF,-HALF);
    for(const [x,z,r] of holes.get(k)||[]){const p=new THREE.Path();p.absarc(x,z,r,0,Math.PI*2,true);sh.holes.push(p);}
    const g=new THREE.ExtrudeGeometry(sh,{depth:s.h,bevelEnabled:false,curveSegments:48});
    g.rotateX(Math.PI/2);g.translate(0,s.y1,0);
    const m=new THREE.Mesh(g,M.mega);m.userData.kind='megastructure';scene.add(m);
    s.holes=holes.get(k)||[];
    rows.push({x:0,z:0,w:C.block,dpt:s.holes.length,h:s.y0,ry:0,kind:'slab',fixed:true});
  });
  // ---- the air: what a layer looks like from outside the block ----
  // From inside, the fog is the air. From outside there is no fog to speak of, and a layer would be an empty
  // slot with things standing in it; so each layer gets a box of its own air, drawn only from outside (main.js
  // shows and hides it) - a wall of its haze at the back, and a thin veil of it at the front.
  const air=new THREE.Group();air.userData.noWire=true;scene.add(air);
  for(const s of stack){if(s.kind!=='layer')continue;
    const g=new THREE.BoxGeometry(C.block-4,s.h-2,C.block-4);g.translate(0,(s.y0+s.y1)/2,0);
    const back=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:s.fog[0],side:THREE.BackSide,fog:false,transparent:true,opacity:0.92,depthWrite:false}));
    const veil=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:s.fog[0],side:THREE.FrontSide,fog:false,transparent:true,opacity:0.2,depthWrite:false}));
    back.renderOrder=-1;veil.userData.veil=true;air.add(back,veil);}
  const inHole=(slab,x,z,pad)=>(slab.holes||[]).some(([hx,hz,r])=>Math.hypot(x-hx,z-hz)<r+(pad||0));

  // =====================================================================================================
  // the Arcade: an old city copied upwards
  // =====================================================================================================
  {
    const A=L.arcade,f=A.y0,H=A.h,fl=slabUnder('arcade');
    const bA=batch('arcade',G.box,M.arcade),bR=batch('arcade-round',G.cyl,M.arcade),bB=batch('bridge',G.arch,M.arcade),
          bS=batch('arcade-roof',G.box,M.concrete);
    const STEP=1150,N=Math.floor(19000/STEP),blocks=new Map();
    for(let gx=-N;gx<=N;gx++)for(let gz=-N;gz<=N;gz++){
      const cx=gx*STEP+rr(-120,120),cz=gz*STEP+rr(-120,120);
      if(R()<0.1||inHole(fl,cx,cz,500))continue;
      const w=rr(300,820),d=rr(300,820);
      const hgt=R()<0.2?H:Math.min(H,450+Math.pow(R(),1.4)*2600);
      const grey=rr(0.8,0.93);
      let roof=null;
      if(R()<0.13){const r=Math.min(w,d)*0.5;const i=put(bR,cx,f+hgt/2,cz,r,hgt,r,grey);speckle(bR,i,3);}
      else{
        // a base and one or two setbacks, as a wall that kept being added to
        let y0=f,ww=w,dd=d,left=hgt,ox=0,oz=0;
        for(let s=0;s<3&&left>1;s++){
          const hh=s===2?left:Math.min(left,left*rr(0.4,0.75));
          const i=put(bA,cx+ox,y0+hh/2,cz+oz,ww,hh,dd,grey*rr(0.97,1.03));speckle(bA,i,2+Math.floor(hh/500));
          if(i>=0)roof={x:cx+ox,z:cz+oz,w:ww,d:dd,y:y0+hh};
          y0+=hh;left-=hh;ww*=rr(0.6,0.9);dd*=rr(0.6,0.9);ox+=rr(-0.1,0.1)*w;oz+=rr(-0.1,0.1)*d;
        }
        // the houses on the roof, where the roof is not the ceiling
        if(hgt<H-80&&R()<0.6)for(let k=0;k<rr(6,22);k++){const sw=rr(8,40),sh=rr(6,45);
          put(bS,cx+ox+rr(-0.35,0.35)*ww,y0+sh/2,cz+oz+rr(-0.35,0.35)*dd,sw,sh,rr(8,40),rr(0.7,0.9));}
      }
      const blk={x:cx,z:cz,w,d,h:hgt,roof};blocks.set(gx+','+gz,blk);if(roof)reg.arcade.push(blk);
    }
    // bridges across the canyons, at whatever height the two walls have in common
    for(const [key,a] of blocks){
      const [gx,gz]=key.split(',').map(Number);
      for(const [dx,dz] of [[1,0],[0,1]]){
        const b=blocks.get((gx+dx)+','+(gz+dz));if(!b||R()<0.35)continue;
        const top=Math.min(a.h,b.h)-60;if(top<200)continue;
        const along=dx?0:1;
        const e0=along?a.z+a.d/2:a.x+a.w/2,e1=along?b.z-b.d/2:b.x-b.w/2;const span=e1-e0;if(span<60)continue;
        const lo=along?Math.max(a.x-a.w/2,b.x-b.w/2):Math.max(a.z-a.d/2,b.z-b.d/2);
        const hi=along?Math.min(a.x+a.w/2,b.x+b.w/2):Math.min(a.z+a.d/2,b.z-b.d/2+b.d);
        if(hi-lo<40)continue;
        for(let k=0;k<1+Math.floor(R()*3);k++){
          const yb=f+rr(120,Math.max(140,(top-f)*0.55)),wid=rr(12,34),ah=span*rr(0.28,0.5),c=rr(lo+wid,hi-wid);
          const mid=(e0+e1)/2;
          put(bB,along?c:mid,yb-ah/2,along?mid:c,span+8,ah,wid,rr(0.8,0.9),along?Math.PI/2:0);
        }
      }
    }
  }

  // =====================================================================================================
  // the Works: machine, packed
  // =====================================================================================================
  {
    const W=L.works,f=W.y0,H=W.h,fl=slabUnder('works');
    const bT=batch('works',G.box,M.machine),bM=batch('works-module',G.box,M.machine),bG=batch('girder',G.box,M.concrete),
          bP=batch('pipe',G.cyl8,M.concrete),bD=batch('deck',G.box,M.machine);
    const STEP=820,N=Math.floor(20000/STEP),towers=new Map();
    for(let gx=-N;gx<=N;gx++)for(let gz=-N;gz<=N;gz++){
      if(R()<0.28)continue;
      const cx=gx*STEP+rr(-200,200),cz=gz*STEP+rr(-200,200);if(inHole(fl,cx,cz,260))continue;
      const fw=rr(90,330),hgt=R()<0.32?H:rr(260,H*0.85),grey=rr(0.5,0.84);
      let y0=f,w=fw,d=fw*rr(0.6,1.4);
      while(y0<f+hgt-1){const sh=Math.min(f+hgt-y0,rr(140,560));
        const i=put(bT,cx+rr(-0.12,0.12)*fw,y0+sh/2,cz+rr(-0.12,0.12)*fw,w*rr(0.75,1.15),sh,d*rr(0.75,1.15),grey*rr(0.94,1.06));
        speckle(bT,i,1+Math.floor(sh/260),0.35);y0+=sh;}
      for(let k=0;k<rr(1,6);k++){const s=rr(18,90),yy=f+rr(0.1,0.95)*hgt,side=Math.floor(R()*4);
        const ox=side<2?(side?1:-1)*(fw/2+s/2-4):rr(-0.4,0.4)*fw,oz=side>=2?(side===2?1:-1)*(d/2+s/2-4):rr(-0.4,0.4)*d;
        put(bM,cx+ox,yy,cz+oz,s,rr(20,140),s*rr(0.6,1.4),grey*rr(0.85,1.1));}
      // fins down the faces, and slabs cantilevered off them
      for(let k=0;k<rr(0,5);k++){const fh=rr(80,Math.min(700,hgt)),yy=f+rr(0,hgt-fh)+fh/2,side=Math.floor(R()*4),fd=rr(8,34);
        const ox=side<2?(side?1:-1)*(fw/2+fd/2-2):rr(-0.45,0.45)*fw,oz=side>=2?(side===2?1:-1)*(d/2+fd/2-2):rr(-0.45,0.45)*d;
        put(bM,cx+ox,yy,cz+oz,side<2?fd:rr(2,7),fh,side<2?rr(2,7):fd,grey*rr(0.8,1));}
      if(R()<0.35){const cl=rr(60,260),yy=f+rr(0.2,0.9)*hgt,a=Math.floor(R()*4)*Math.PI/2;
        put(bD,cx+Math.cos(a)*(fw/2+cl/2-10),yy,cz-Math.sin(a)*(fw/2+cl/2-10),cl,rr(8,24),rr(30,120),grey*rr(0.85,1.05),a);}
      towers.set(gx+','+gz,{x:cx,z:cz,h:hgt,w:fw});reg.works.push({x:cx,z:cz,h:hgt,w:fw});
    }
    // decks and cables between neighbours
    for(const [key,a] of towers){
      const [gx,gz]=key.split(',').map(Number);
      for(const [dx,dz] of [[1,0],[0,1],[1,1]]){const b=towers.get((gx+dx)+','+(gz+dz));if(!b)continue;
        const top=Math.min(a.h,b.h);
        if(R()<0.22&&top>200&&(dx^dz)){const yy=f+rr(80,top-40),len=Math.hypot(b.x-a.x,b.z-a.z);
          put(bD,(a.x+b.x)/2,yy,(a.z+b.z)/2,len,rr(10,34),rr(16,60),rr(0.55,0.72),-Math.atan2(b.z-a.z,b.x-a.x));}
        if(R()<0.5)cable([a.x,f+rr(0.3,1)*a.h,a.z],[b.x,f+rr(0.3,1)*b.h,b.z],rr(20,220));
      }
    }
    // girders at every angle, floor to ceiling, the way the film has them
    for(let i=0;i<170;i++){const ang=rr(0.55,1.25),len=H/Math.sin(ang)+10,x=rr(-19000,19000),z=rr(-19000,19000);
      if(inHole(fl,x,z,600))continue;
      put(bG,x,f+H/2,z,len,rr(14,42),rr(14,42),rr(0.45,0.62),R()*Math.PI*2,ang*(R()<0.5?1:-1));}
    // pipes, kilometres of them
    for(let i=0;i<240;i++){const r=rr(5,26),len=rr(1500,8000),x=rr(-19000,19000),z=rr(-19000,19000),yy=f+rr(60,H-60),ry=pick([0,Math.PI/2,R()*Math.PI]);
      put(bP,x,yy,z,r,len,r,rr(0.5,0.7),ry,Math.PI/2);}
  }

  // =====================================================================================================
  // the Plain: a ruled floor, weather, and a spire hung from the roof
  // =====================================================================================================
  const clouds=new THREE.Group();clouds.userData.noWire=true;scene.add(clouds);
  {
    const P=L.plain,f=P.y0,H=P.h,top=P.y1,fl=slabUnder('plain');
    const bS=batch('plain-spire',G.box,M.concrete),bB=batch('plain-block',G.box,M.machine),bY=batch('pylon',G.cyl8,M.concrete),
          bH=batch('spire',G.box,M.hanging),bK=batch('spike',G.box,M.concrete),bC=batch('collar',G.cyl,M.hanging),bI=batch('ceiling-spire',G.drip,M.hanging);
    // towers gathered on the seams, like parts soldered to a board
    for(let gx=-14;gx<=14;gx++)for(let gz=-14;gz<=14;gz++){
      if(R()>0.36)continue;const cx=gx*1600,cz=gz*1600;if(inHole(fl,cx,cz,700))continue;
      const n=Math.floor(rr(4,28)),alongX=R()<0.5,big=R()<0.12;
      for(let k=0;k<n;k++){const t=rr(-500,500)*(R()<0.3?2:1),off=rr(-26,26);
        const x=cx+(alongX?t:off),z=cz+(alongX?off:t);
        const w=rr(8,55),h=big&&k<3?rr(600,1800):20+Math.pow(R(),3)*700;
        const i=put(bS,x,f+h/2,z,w,h,w*rr(0.5,1.6),rr(0.7,0.88));if(h>200)speckle(bS,i,2,0.1);}
      for(let k=0;k<rr(0,4);k++)put(bB,cx+rr(-300,300),f+15,cz+rr(-300,300),rr(80,260),rr(20,110),rr(80,260),rr(0.66,0.8));
      // the seams are lit along their length, as far as the fog lets you see
    }
    for(let i=-14;i<=14;i++)for(let t=-22000;t<22000;t+=90){
      if(R()<0.2)light(i*1600+rr(-14,14),f+1.5,t,false);
      if(R()<0.2)light(t,f+1.5,i*1600+rr(-14,14),false);
      if(R()<0.05)light(i*1600,top-1.5,t,false);
    }
    // the thin pylons, floor to ceiling: from a distance the only way to tell how high the ceiling is
    for(let i=0;i<34;i++){const x=rr(-21000,21000),z=rr(-21000,21000);if(inHole(fl,x,z,300)||Math.hypot(x-C.spire.x,z-C.spire.z)<3000)continue;
      const r=rr(10,46);const k=put(bY,x,f+H/2,z,r,H,r,rr(0.55,0.7));
      for(let j=0;j<rr(0,4);j++)put(bB,x,f+rr(800,H-800),z,r*rr(3,7),rr(30,160),r*rr(3,7),rr(0.6,0.75));
      speckle(bY,k,6);}
    // the spire
    {const sp=C.spire;let yy=top,w=1150,d=820,hang=0;
      put(bH,sp.x,top-45,sp.z,2800,90,2300,0.52);put(bH,sp.x,top-110,sp.z,1900,70,1600,0.56);
      put(bY,sp.x,f+H/2,sp.z,34,H,34,0.5);
      for(let s=0;s<12;s++){const h=rr(240,560);const i=put(bH,sp.x+rr(-60,60),yy-h/2,sp.z+rr(-60,60),w,h,d,rr(0.55,0.72));
        speckle(bH,i,20,0.3);yy-=h;hang+=h;w*=rr(0.72,0.92);d*=rr(0.75,0.95);
        if(R()<0.6)put(bC,sp.x,yy+rr(0,h),sp.z,Math.max(w,d)*rr(0.7,1.05),rr(20,45),Math.max(w,d)*rr(0.7,1.05),0.6);}
      // the spikes it bristles with, and the cables they let down to the floor
      for(let i=0;i<96;i++){const hy=top-rr(150,hang),len=rr(250,1900),a=R()*Math.PI*2,wd=rr(10,42);
        const ex=sp.x+Math.cos(a)*(len+250),ez=sp.z-Math.sin(a)*(len+250);
        put(bK,sp.x+Math.cos(a)*(len/2+200),hy,sp.z-Math.sin(a)*(len/2+200),len,wd,wd,rr(0.6,0.8),a,rr(-0.08,0.08));
        if(R()<0.05)cable([ex,hy,ez],[ex+rr(-3000,3000),f,ez+rr(-3000,3000)],rr(100,600),20);
        if(R()<0.15)cable([ex,hy,ez],[ex+rr(-800,800),top,ez+rr(-800,800)],rr(30,200),10);}
    }
    // what else hangs from the roof of the Plain: nothing much, which is the point
    for(let i=0;i<160;i++){const x=rr(-21000,21000),z=rr(-21000,21000),len=rr(60,900),w=rr(20,160);
      put(bI,x,top-len/2,z,w,len,w,rr(0.5,0.68),R()*Math.PI);}
    // weather: cumulus in heaps, between two and six kilometres up
    const ct=tex.cloud,cm=[0.55,0.68,0.8,0.92].map(o=>new THREE.SpriteMaterial({map:ct,color:0xf2f4f6,transparent:true,depthWrite:false,opacity:o}));
    for(let p=0;p<34;p++){
      const px=p<3?C.spire.x+rr(-3000,3000):rr(-21000,21000),pz=p<3?C.spire.z+rr(-3000,3000):rr(-21000,21000),py=f+rr(2200,6200),n=Math.floor(rr(5,15));
      for(let k=0;k<n;k++){const s=new THREE.Sprite(pick(cm));const sz=rr(700,2600);s.scale.set(sz*rr(1.4,2.2),sz,1);
        s.position.set(px+rr(-2400,2400),py+rr(-300,300),pz+rr(-2400,2400));clouds.add(s);}
    }
  }

  // =====================================================================================================
  // the Hanging: stalactites, a column, and Killy
  // =====================================================================================================
  const K=C.killy,KY=L.hanging.y0+K.up;
  {
    const Hg=L.hanging,f=Hg.y0,H=Hg.h,top=Hg.y1,fl=slabUnder('hanging'),cl=C.column;
    const bD=batch('drip',G.drip,M.hanging),bN=batch('needle',G.box,M.hanging),bL=batch('hanging-floor',G.box,M.concrete),
          bT=batch('hanging-tower',G.box,M.machine),bC=batch('column',G.cyl,M.concrete),bRg=batch('ring',G.cyl,M.hanging),bCm=batch('column-module',G.box,M.machine);
    const clear=(x,z)=>Math.hypot(x-K.x,z-K.z);
    for(let c=0;c<460;c++){
      const cx=rr(-21000,21000),cz=rr(-21000,21000),dk=clear(cx,cz);
      if(Math.hypot(cx-cl.x,cz-cl.z)<cl.r+300)continue;
      // round the platform the stalactites are kept high, so you look out under them rather than into them
      const maxLen=dk<900?220:dk<2500?H-K.up-280:H*0.8;
      const n=Math.floor(rr(3,13)),main=rr(0.35,1)*maxLen;
      for(let k=0;k<n;k++){const a=R()*Math.PI*2,r=Math.pow(R(),0.8)*rr(80,420),len=main*Math.pow(1-r/520,1.6)*rr(0.5,1.1)+40,w=rr(40,260)*(0.5+len/maxLen*0.6);
        const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
        const ry=R()*Math.PI,i=put(bD,x,top-len/2,z,w,len,w,rr(0.48,0.66),ry);if(len>600)speckle(bD,i,2,0.1);
        if(i>=0)reg.drips.push({x,z,w,len,ry});
        // ledges round the big ones, where they were built out and then built down again
        if(len>600&&R()<0.55)for(let j=0;j<rr(1,4);j++){const t=rr(0.12,0.7),wj=w*(1-t*0.8)*rr(1.3,1.9);
          put(bL,x,top-len*t,z,wj,rr(10,45),wj*rr(0.7,1.3),rr(0.5,0.64),ry);}
        // and what drips off the end
        if(R()<0.45&&dk>600){const nl=rr(60,Math.min(900,top-len-f-K.up*0.3));if(nl>30){put(bN,x+rr(-6,6),top-len-nl/2+len*0.1,z+rr(-6,6),rr(2,9),nl,rr(2,9),0.5);
          if(R()<0.3)cable([x,top-len,z],[x+rr(-400,400),top-len-rr(100,700),z+rr(-400,400)],rr(10,90),8);}}
      }
    }
    // the floor: low blocks, a few towers, a few full columns
    for(let t=0;t<220;t++){const tx=rr(-21000,21000),tz=rr(-21000,21000),rad=rr(150,700);
      if(inHole(fl,tx,tz,rad+100)||clear(tx,tz)<rad+200||Math.hypot(tx-cl.x,tz-cl.z)<cl.r+rad)continue;
      for(let k=0;k<rr(12,46);k++){const a=R()*Math.PI*2,r=Math.sqrt(R())*rad,w=rr(12,90),h=rr(8,60)*(1+(1-r/rad)*2);
        put(bL,tx+Math.cos(a)*r,f+h/2,tz+Math.sin(a)*r,w,h,w*rr(0.4,1.6),rr(0.56,0.8),Math.floor(R()*2)*Math.PI/4);}}
    for(let i=0;i<2400;i++){const x=rr(-21000,21000),z=rr(-21000,21000);if(inHole(fl,x,z,120)||clear(x,z)<140)continue;
      if(Math.hypot(x-cl.x,z-cl.z)<cl.r+60)continue;
      const tall=R()<0.08,w=tall?rr(60,170):rr(40,300),h=tall?rr(500,Math.min(1900,clear(x,z)<1500?K.up-250:1900)):rr(20,260);
      const i2=put(tall?bT:bL,x,f+h/2,z,w,h,w*rr(0.5,1.5),rr(0.6,0.8));if(tall)speckle(bT,i2,4,0.3);}
    for(let i=0;i<34;i++){const x=rr(-21000,21000),z=rr(-21000,21000);if(inHole(fl,x,z,400)||clear(x,z)<2200)continue;
      const w=rr(120,340);const k=put(bT,x,f+H/2,z,w,H,w*rr(0.6,1.4),rr(0.58,0.72));speckle(bT,k,10,0.2);}
    // the column: a kilometre and a third across, ringed like the tower Nihei draws with lightning round it
    put(bC,cl.x,f+H/2,cl.z,cl.r,H,cl.r,0.74);
    for(let yy=f+rr(80,200);yy<top-60;yy+=rr(160,420)){const r=cl.r*rr(1.04,1.38);
      put(bRg,cl.x+rr(-40,40),yy,cl.z+rr(-40,40),r,rr(18,80),r,rr(0.6,0.76));}
    for(let i=0;i<90;i++){const a=R()*Math.PI*2,yy=f+rr(50,H-50),s=rr(30,140);
      const k=put(bCm,cl.x+Math.cos(a)*(cl.r+s*0.3),yy,cl.z+Math.sin(a)*(cl.r+s*0.3),s,rr(30,220),s,rr(0.6,0.78),-a);speckle(bCm,k,2,0.4);}
    for(let i=0;i<40;i++){const a=R()*Math.PI*2,b=a+rr(-1,1);
      cable([cl.x+Math.cos(a)*cl.r*1.1,f+rr(300,H-200),cl.z+Math.sin(a)*cl.r*1.1],[cl.x+Math.cos(b)*rr(2000,6000),f+rr(0,H),cl.z+Math.sin(b)*rr(2000,6000)],rr(40,400),18);}
  }

  // ---- the great shaft: a stair down its wall, sixteen hundred metres of it, and then some ----
  {
    const sl=slabUnder('hanging'),bF=batch('stair',G.box,M.concrete);
    const r=S.r-4,RUN=60,DROP=28,WID=5;let a=0.4,yy=sl.y1;
    const endY=sl.y0-340;                                  // it goes on past the slab, into the air of the Plain
    while(yy>endY){
      const da=RUN/r,am=a+da/2;
      const x=S.x+Math.cos(am)*r,z=S.z+Math.sin(am)*r;
      const tx=-Math.sin(am),tz=Math.cos(am);
      put(bF,x,yy-DROP/2,z,RUN+2,1.2,WID,0.6,Math.atan2(-tz,tx),-Math.atan2(DROP,RUN));
      a+=da+8/r;yy-=DROP;
      const la=a-4/r;put(bF,S.x+Math.cos(la)*r,yy,S.z+Math.sin(la)*r,8,1.2,WID,0.58,Math.atan2(-Math.cos(la),-Math.sin(la)));
      if(yy<sl.y0&&R()<0.5)cable([S.x+Math.cos(la)*r,yy,S.z+Math.sin(la)*r],[S.x+Math.cos(la)*(S.r+2),sl.y0,S.z+Math.sin(la)*(S.r+2)],0,2);
    }
  }

  // ---- Killy's platform: the one place built at the size of a person ----
  const figures=new THREE.Group();scene.add(figures);
  {
    const f=L.hanging.y0,bT=batch('killy-tower',G.box,M.machine),bP=batch('killy-pipe',G.cyl8,M.concrete),bJ=batch('killy-junk',G.box,M.concrete),
          bTank=batch('killy-tank',G.cyl,M.concrete),bSt=batch('killy-stair',G.box,M.concrete);
    const tx=K.x,tz=K.z;
    // the tower it stands on, and the tank that is the platform
    put(bT,tx-3,f+(K.up-10)/2,tz+4,64,K.up-10,70,0.66);
    put(bT,tx+30,f+(K.up-120)/2,tz-26,40,K.up-120,34,0.62);
    put(bTank,tx,KY-5,tz,8.5,10,8.5,0.6);
    put(bTank,tx,KY-0.2,tz,8.9,0.4,8.9,0.56);
    put(bTank,tx+12,KY-7,tz+12,4,6,4,0.7);
    // a stair from the platform down to the roof of the tower
    for(let s=0;s<24;s++)put(bSt,tx-8.4-s*0.34,KY-0.4-s*0.4,tz+5,0.36,0.2,1.5,0.72);
    // the roof: vents and boxes
    for(let i=0;i<22;i++){const s=rr(0.8,5),x=rr(-28,28),z=rr(-28,34);if(Math.hypot(x,z)<12)continue;put(bJ,tx+x,KY-10+s/2,tz+z,s*rr(0.6,2),s,s*rr(0.6,2),rr(0.55,0.75));}
    // pipes down the face
    for(let i=0;i<14;i++){const r=rr(0.4,2.2),len=rr(80,K.up*0.8),side=R()<0.5;
      put(bP,side?tx-35.5-r:tx+rr(-28,28),KY-10-len/2,side?tz+rr(-30,38):tz+39+r,r,len,r,rr(0.5,0.65));}
    // the ducts: ribbed hoses out of the tank, over the edge and down the side of the tower
    const ductMat=new THREE.MeshLambertMaterial({map:tex.ribs,color:0xb4b6b9});
    const ducts=[[[7.5,-4,-2],[14,-9,-3],[37,-40,-2],[38,-160,-6],[37,-420,-4]],
                 [[6,-6,5],[11,-8,14],[18,-14,40],[6,-60,42],[-4,-260,40]],
                 [[-5,-7,-6.5],[-20,-12,-10],[-35,-50,-10],[-37,-200,-30]],
                 [[-7,-3,4],[-14,-9,18],[-30,-20,38],[-37,-120,39]],
                 [[3,-8,-8],[8,-10,-24],[20,-9,-38],[33,-30,-37],[36,-90,-37]]];
    for(const d of ducts){const pts=d.map(p=>new THREE.Vector3(tx+p[0],KY+p[1],tz+p[2]));
      const curve=new THREE.CatmullRomCurve3(pts);const r=rr(0.9,2.1);
      const t=tex.ribs.clone();t.needsUpdate=true;t.repeat.set(curve.getLength()/(r*0.9),1);
      const m=ductMat.clone();m.map=t;
      const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.ceil(curve.getLength()/3)+8,r,12,false),m);scene.add(mesh);
      rows.push({x:pts[0].x,z:pts[0].z,w:r,dpt:pts.length,h:pts[0].y,ry:0,kind:'duct',fixed:true});}
    for(let i=0;i<5;i++)light(tx+rr(-30,30),KY-rr(20,300),tz+39.2,true);
    // Killy, and Cibo at the edge
    const F=makeFigures(THREE);
    const killy=F.killy();killy.root.position.set(tx+2.2,KY,tz-2.4);killy.root.rotation.y=Math.atan2(C.column.x-tx,C.column.z-tz)+0.25;figures.add(killy.root);
    const cibo=F.cibo();cibo.root.position.set(tx-5.4,KY,tz+3.2);cibo.root.rotation.y=Math.atan2(C.column.x-tx,C.column.z-tz)-0.5;figures.add(cibo.root);
    figures.userData.update=t=>{killy.update(t);cibo.update(t);};
  }

  // ---- the second pass: the Megastructure's own structure, and the furniture of every layer ----
  const D=details({THREE,R,rr,pick,put,batch,G,M,cable,light,speckle,L,stack,slabUnder,slabOver,inHole,C,K,KY,HALF,reg,trunks,TOP});

  // ---- lifts: on the column, the pylons of the Plain and the faces of the machine towers ----
  const lifts=[];
  {const cl=C.column,Hg=L.hanging;
   for(let i=0;i<18;i++){const a=R()*Math.PI*2,s=rr(8,22);
     lifts.push({x:cl.x+Math.cos(a)*(cl.r+s/2),z:cl.z+Math.sin(a)*(cl.r+s/2),y0:Hg.y0+s,range:Hg.h-2*s-40,speed:rr(8,22),ph:R()*2,s,ry:Math.PI/2-a,warm:R()<0.5});}
   const P=L.plain;
   for(let i=0;i<24;i++){const x=rr(-18000,18000),z=rr(-18000,18000),s=rr(10,30);
     lifts.push({x,z,y0:P.y0+s,range:P.h-2*s,speed:rr(20,60),ph:R()*2,s,ry:R()*Math.PI,warm:R()<0.3});
     const bY=batches.find(b=>b.name==='pylon');put(bY,x,P.y0+P.h/2,z,rr(4,8),P.h,rr(4,8),0.5,0,0,true);}
   const Wk=L.works;
   for(let i=0;i<40;i++){const t=pick(reg.works),s=rr(5,14),a=Math.floor(R()*4)*Math.PI/2;
     lifts.push({x:t.x+Math.sin(a)*(t.w/2+s/2+1),z:t.z+Math.cos(a)*(t.w/2+s/2+1),y0:Wk.y0+s,range:Math.max(40,t.h-2*s),speed:rr(5,14),ph:R()*2,s,ry:a,warm:R()<0.6});}}

  // ---- building it ----
  for(const b of batches){
    if(!b.m.length)continue;
    const im=new THREE.InstancedMesh(b.geo,b.mat,b.m.length);
    b.m.forEach((m,i)=>{im.setMatrixAt(i,m);im.setColorAt(i,col.setScalar(b.c[i]));});
    im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
    im.userData.kind=b.name;
    // instanced meshes are culled on the bounding sphere of one instance; this block is 48 km across
    im.frustumCulled=false;scene.add(im);
  }
  const lg=new THREE.BufferGeometry();
  lg.setAttribute('position',new THREE.Float32BufferAttribute(lights,3));lg.setAttribute('color',new THREE.Float32BufferAttribute(lightCol,3));
  const lightPts=new THREE.Points(lg,new THREE.PointsMaterial({size:2.4,sizeAttenuation:false,map:tex.dot,vertexColors:true,transparent:true,depthWrite:false,alphaTest:0.02}));
  lightPts.userData.noWire=true;lightPts.frustumCulled=false;scene.add(lightPts);
  const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(cables,3));
  const cableLines=new THREE.LineSegments(cg,new THREE.LineBasicMaterial({color:0x2a2c30,transparent:true,opacity:0.75}));
  cableLines.frustumCulled=false;cableLines.userData.noWire=true;scene.add(cableLines);

  // ---- the Builders: animated, so outside the fingerprint (builders.js) ----
  const builders=makeBuilders({THREE,scene,mats,M,sites:D.sites,lifts,dot:tex.dot});

  // ---- more of the City: the stack does not stop at the edge of the sample ----
  // Copies of the block above and below it, sharing its geometry and its instance buffers, so they cost draw
  // calls but no memory: the next two blocks each way with everything in them, dimmed, and then six more each
  // way that are only slabs and air, dimmer, going off into the dark. Offsets make the end slabs coincide, so
  // each copy leaves out the slab it would share. Only drawn from outside the block (main.js), since from
  // inside a layer the slabs hide them anyway.
  const ghosts=new THREE.Group();ghosts.userData.noWire=true;ghosts.visible=false;scene.add(ghosts);
  {const STEP=TOP-stack[0].h,dimMats=new Map();
   const dimOf=(mat,dim)=>{const key=mat.uuid+':'+dim;if(!dimMats.has(key)){const st=Object.keys(M).find(k=>M[k]===mat);
     dimMats.set(key,st?mats.mk(st,{color:mat.color.getHex(),dim:{value:dim}}):mat);}return dimMats.get(key);};
   const slabMeshes=scene.children.filter(o=>o.userData.kind==='megastructure');
   const big=scene.children.filter(o=>o.isInstancedMesh&&o.count>0&&!/killy|stair|junk|duct|roof|module|old-town|works-floor|dwelling|plate|figure|builder/.test(o.userData.kind||''));
   for(let lv=1;lv<=TRUNK_LEVELS;lv++)for(const sgn of [1,-1]){
     const dim=lv===1?0.6:Math.max(0.06,0.42-0.05*(lv-2)),g=new THREE.Group();g.position.y=sgn*lv*STEP;ghosts.add(g);
     slabMeshes.forEach((m,i)=>{if((sgn>0&&i===0)||(sgn<0&&i===slabMeshes.length-1))return;
       const c=new THREE.Mesh(m.geometry,dimOf(m.material,dim));c.userData.ghost=true;g.add(c);});
     for(const s of stack){if(s.kind!=='layer')continue;
       const a=new THREE.Mesh(new THREE.BoxGeometry(C.block-4,s.h-2,C.block-4).translate(0,(s.y0+s.y1)/2,0),
         new THREE.MeshBasicMaterial({color:new THREE.Color(s.fog[0]).multiplyScalar(dim*1.1),side:THREE.BackSide,fog:false,transparent:true,opacity:0.95,depthWrite:false}));
       a.renderOrder=-1;g.add(a);}
     if(lv>1)continue;
     for(const im of big){const c=new THREE.InstancedMesh(im.geometry,dimOf(im.material,dim),im.count);
       c.instanceMatrix=im.instanceMatrix;if(im.instanceColor)c.instanceColor=im.instanceColor;c.frustumCulled=false;g.add(c);}
     const cl=new THREE.LineSegments(cableLines.geometry,new THREE.LineBasicMaterial({color:0x2a2c30,transparent:true,opacity:0.5*dim}));cl.frustumCulled=false;g.add(cl);
   }}

  rows.sort((p,q)=>p.x-q.x||p.h-q.h||p.z-q.z);
  return {stack,L,TOP,HALF,rows,clouds,figures,lightPts,cableLines,air,ghosts,builders,trunks,STEP:TOP-stack[0].h,
    killy:{x:K.x+2.2,y:KY,z:K.z-2.4,eye:KY+1.62},
    count:{top:batches.map(b=>[b.name,b.m.length*((b.geo.index?b.geo.index.count:b.geo.attributes.position.count)/3)]).sort((p,q)=>q[1]-p[1]).slice(0,14).map(x=>x[0]+':'+Math.round(x[1]/1000)+'k').join(' '),
      instances:batches.reduce((s,b)=>s+b.m.length,0),lights:lights.length/3,cables:cables.length/6},
    layerAt(yy){for(const s of stack)if(yy>=s.y0&&yy<s.y1)return s;return null;}};
}

// A bridge: the spandrel of one arch, span 1 along x, 1 high with its deck on top, 1 wide along z.
function archGeometry(THREE){
  const s=new THREE.Shape();
  s.moveTo(-0.5,0);s.lineTo(-0.5,1);s.lineTo(0.5,1);s.lineTo(0.5,0);
  s.absellipse(0,0,0.47,0.84,0,Math.PI,false);s.lineTo(-0.5,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,curveSegments:7});
  g.translate(0,-0.5,-0.5);return g;
}
