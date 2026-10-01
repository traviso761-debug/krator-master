// ---------- Isengard: the smaller things ----------
// Fan work from Tolkien; every shape is this project's own.
//
// What the large pieces (the Ring, the tower, the works, the dam) leave out, and what makes them read as a place
// and not a model of one:
//
//   on the Ring      torches along the top of the wall and orcs walking it; the White Hand hung on its inner face
//   at the gate      a paved forecourt outside, watch-fires, a guard, and standards either side of the arch
//   on Orthanc       the slits of windows up the piers, and Saruman's banner hanging under his balcony
//   on the plain     pits with fire in them; the iron wheels "revolving endlessly" over the shafts; timber cranes;
//                    pens of wargs; stacks of timber from Fangorn; carts on the roads
//   outside          the camp of the Uruk-hai south-west of the gate; timber piled along the Fangorn track; the
//                    burned trunks at the eaves; the great old trees at the edge of Fangorn, and mist under them
//   in the Treegarth Treebeard, standing by the tower
//
// Everything of Saruman's is the war's (ctx.warParts) and goes in the Treegarth; things on the wall go with the
// length of wall they are on when it is broken (ctx.ring.segs).
import { mkRng } from '../core/rng.js';
import { createDust } from '../core/dust.js';
import { RI,RO,ROAD_A,GATE_A,clearOfPlan,plainY } from './plan.js';
import { fangornEdge } from './fangorn.js';
import { makeEnt } from './treegarth.js';

export function details(api){
  const {THREE,ctx,scene,animHooks,groundH,mergeParts,nightF,hour,ROADS}=api;
  const R=mkRng(1777),D=new THREE.Object3D(),ZERO=new THREE.Matrix4().makeScale(0,0,0);
  const WAR=ctx.warParts=ctx.warParts||[],PEACE=ctx.peaceParts=ctx.peaceParts||[];
  const add=(o,list)=>{o.traverse(q=>{q.userData.noFingerprint=true;});if(o.isInstancedMesh)o.frustumCulled=false;scene.add(o);if(list)list.push(o);return o;};
  const inst=(geo,mat,n,list)=>add(new THREE.InstancedMesh(geo,mat,n),list);
  const Rg=ctx.ring,O=ctx.orthanc,W=ctx.works;
  const flameM=new THREE.MeshBasicMaterial({color:0xff8a30,transparent:true,opacity:0.92,depthWrite:false,blending:THREE.AdditiveBlending});
  const ironM=new THREE.MeshLambertMaterial({color:0x2a2826,flatShading:true});
  const woodM=new THREE.MeshLambertMaterial({color:0x5a4634,flatShading:true});
  const orcM=new THREE.MeshLambertMaterial({color:0x221e1b,flatShading:true});
  const smoke=createDust(api,{max:5000,size:18,color:0x2a2622,drag:0.4,gravity:-1.4,wind:[3,0,1.5]});
  const mist=createDust(api,{max:4000,size:60,color:0xc8ccc8,drag:0.3,gravity:0,wind:[-1.2,0,0.3]});

  // the White Hand: a black field, and a white hand on it
  const handTex=(()=>{const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d');
    g.fillStyle='#111013';g.fillRect(0,0,128,256);g.fillStyle='#ecebe6';
    g.beginPath();g.ellipse(64,150,24,30,0,0,7);g.fill();
    for(const [dx,len,a] of [[-18,48,-0.25],[-6,58,-0.08],[6,58,0.06],[18,48,0.22]]){g.save();g.translate(64+dx,128);g.rotate(a);g.fillRect(-5,-len,10,len);g.beginPath();g.arc(0,-len,5,0,7);g.fill();g.restore();}
    g.save();g.translate(38,160);g.rotate(-0.9);g.fillRect(-5,-34,10,34);g.beginPath();g.arc(0,-34,5,0,7);g.fill();g.restore();
    g.beginPath();g.moveTo(0,256);g.lineTo(32,226);g.lineTo(64,256);g.lineTo(96,226);g.lineTo(128,256);g.fillStyle='#000';g.fill();
    return new THREE.CanvasTexture(c);})();
  const bannerM=new THREE.MeshLambertMaterial({map:handTex,side:THREE.DoubleSide,transparent:true,alphaTest:0.5});

  // ---- on the Ring: torches, the watch, and the White Hand ----
  const onWall=[];     // [instancedMesh, index, segment, matrix]
  if(Rg){const top=Rg.base+Rg.H,rm=(RI+RO)/2,open=a=>Rg.openings.some(o=>Math.abs(((a-o.a)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI)<o.w*1.5);
    const nT=260,torches=inst(new THREE.ConeGeometry(0.7,2.2,6).translate(0,1.1,0),flameM,nT,WAR),posts=inst(new THREE.BoxGeometry(0.3,2.4,0.3).translate(0,1.2,0),ironM,nT,WAR);
    for(let i=0;i<nT;i++){const a=i/nT*Math.PI*2;if(open(a))continue;const r=i%2?RI+3:RO-3;D.position.set(Math.cos(a)*r,top+1,Math.sin(a)*r);D.rotation.set(0,0,0);D.scale.set(1,1,1);D.updateMatrix();
      const seg=Rg.segAt(a);posts.setMatrixAt(i,D.matrix);onWall.push([posts,i,seg,D.matrix.clone()]);D.position.y+=2.4;D.updateMatrix();torches.setMatrixAt(i,D.matrix);onWall.push([torches,i,seg,D.matrix.clone()]);}
    const nB=36,banners=inst(new THREE.PlaneGeometry(7,16).translate(0,-8,0),bannerM,nB,WAR);
    for(let i=0;i<nB;i++){let a=(i+0.5)/nB*Math.PI*2;if(open(a))a+=0.05;const [px,pz]=[Math.cos(a)*(RI-0.8),Math.sin(a)*(RI-0.8)];
      D.position.set(px,top-1,pz);D.rotation.set(0,-a-Math.PI/2,0);D.scale.set(1,1,1);D.updateMatrix();banners.setMatrixAt(i,D.matrix);onWall.push([banners,i,Rg.segAt(a),D.matrix.clone()]);}
    var wallWatch=inst(new THREE.BoxGeometry(0.8,1.9,0.6).translate(0,0.95,0),orcM,32,WAR),watch=[];
    for(let i=0;i<32;i++)watch.push({a:R()*Math.PI*2,v:(R()<0.5?-1:1)*(0.0012+R()*0.001),r:rm+(R()-0.5)*30});
    var wallTop=top;
    torches.userData.flicker=true;}
  let lastBroken=-1;
  const refreshWall=()=>{if(!Rg)return;const nb=Rg.segs.filter(q=>q.isBroken).length;if(nb===lastBroken)return;lastBroken=nb;
    const touched=new Set();for(const [m,i,seg,mat] of onWall){m.setMatrixAt(i,Rg.segs[seg].isBroken?ZERO:mat);touched.add(m);}for(const m of touched)m.instanceMatrix.needsUpdate=true;};

  // ---- at the gate ----
  {const gx=Math.cos(GATE_A)*RO,gz=Math.sin(GATE_A)*RO,parts=[];
   const pave=new THREE.Mesh(new THREE.PlaneGeometry(70,90).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x2e2d2b,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));
   pave.position.set(gx,groundH(gx,gz+45)+0.2,gz+45);add(pave,WAR);
   const fires=[];for(const sd of [-1,1]){const x=gx+sd*20,z=gz+14,y=groundH(x,z);
     const bowl=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.0,1.6,8).translate(0,4.2,0),ironM),leg=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.5,4,6).translate(0,2,0),ironM);
     bowl.position.set(x,y,z);leg.position.set(x,y,z);parts.push(bowl,leg);
     const f=new THREE.Mesh(new THREE.ConeGeometry(1.5,4,7).translate(0,6.6,0),flameM);f.position.set(x,y,z);add(f,WAR);fires.push(f);
     const pole=new THREE.Mesh(new THREE.BoxGeometry(0.4,22,0.4).translate(0,11,0),ironM);pole.position.set(gx+sd*32,groundH(gx+sd*32,gz+8),gz+8);parts.push(pole);
     const b=new THREE.Mesh(new THREE.PlaneGeometry(6,13).translate(0,14,0),bannerM);b.position.set(gx+sd*32+3.2*0,groundH(gx+sd*32,gz+8),gz+8.3);add(b,WAR);}
   const g=inst(new THREE.BoxGeometry(0.85,2,0.6).translate(0,1,0),orcM,14,WAR);
   for(let i=0;i<14;i++){const x=gx+(i%7-3)*4.5,z=gz+18+Math.floor(i/7)*5;D.position.set(x,groundH(x,z),z);D.rotation.set(0,0,0);D.scale.setScalar(1.15);D.updateMatrix();g.setMatrixAt(i,D.matrix);}
   const m=mergeParts(parts,ironM);add(m,WAR);var gateFires=fires;}

  // ---- on Orthanc ----
  if(O){const slits=inst(new THREE.BoxGeometry(0.9,3.2,0.9),new THREE.MeshBasicMaterial({color:0x050506}),400,null);let n=0;
    for(const [su,sv] of [[1,1],[1,-1],[-1,1],[-1,-1]]){const px=O.x+su*O.OFF,pz=O.z+sv*O.OFF,out=Math.atan2(sv,su);
      for(let y=O.base+24;y<O.base+O.PH-12;y+=11)for(const da of [-0.35,0.35]){if(R()<0.25)continue;const a=out+da,r=O.PR*0.9;
        D.position.set(px+Math.cos(a)*r,y+(R()-0.5)*3,pz+Math.sin(a)*r);D.rotation.set(0,-a,0);D.scale.set(1,1,1);D.updateMatrix();slits.setMatrixAt(n++,D.matrix);}}
    slits.count=n;
    // Saruman's banner under his balcony: the White Hand, twelve metres of it
    const [bx,by,bz]=O.balcony,b=new THREE.Mesh(new THREE.PlaneGeometry(7,15).translate(0,-8,0),bannerM);
    b.position.set(bx+Math.cos(O.face)*1.6,by-1,bz+Math.sin(O.face)*1.6);b.rotation.y=-O.face+Math.PI/2;add(b,WAR);}

  // ---- on the plain ----
  const taken=(W&&W.taken)||[];
  const free=(x,z,r)=>clearOfPlan(x,z,r)&&!taken.some(([tx,tz,tr])=>Math.hypot(x-tx,z-tz)<r+tr+5);
  const place=(n,r,d0,d1,fn)=>{for(let i=0,k=0;k<n&&i<n*400;i++){const a=R()*Math.PI*2,d=d0+R()*(d1-d0),x=Math.cos(a)*d,z=Math.sin(a)*d;if(!free(x,z,r))continue;taken.push([x,z,r]);fn(x,z,plainY(d),k++);}};
  // fire pits
  const pits=[];const rimM=new THREE.MeshLambertMaterial({color:0x2b2926,flatShading:true}),glowM=new THREE.MeshBasicMaterial({color:0xd8481a});
  place(12,11,230,RI-120,(x,z,y)=>{const r=6+R()*4;const rim=new THREE.Mesh(new THREE.TorusGeometry(r,1.1,5,18).rotateX(Math.PI/2),rimM);rim.position.set(x,y+0.4,z);add(rim,WAR);
    const g=new THREE.Mesh(new THREE.CircleGeometry(r-0.6,18).rotateX(-Math.PI/2),glowM);g.position.set(x,y+0.15,z);add(g,WAR);pits.push({x,y,z,r});});
  const pitFire=inst(new THREE.ConeGeometry(1,1,6).translate(0,0.5,0),flameM,pits.length*5,WAR);
  // the iron wheels
  const wheels=[];place(8,9,240,RI-100,(x,z,y)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=R()*3;
    for(const sd of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(0.8,11,0.8).translate(0,5.5,0),ironM);p.position.z=sd*1.6;g.add(p);}
    const w=new THREE.Group();w.position.y=10;g.add(w);w.add(new THREE.Mesh(new THREE.TorusGeometry(7,0.5,6,24),ironM));
    for(let k=0;k<8;k++){const s=new THREE.Mesh(new THREE.BoxGeometry(0.3,14,0.3),ironM);s.rotation.z=k/8*Math.PI;w.add(s);}
    add(g,WAR);wheels.push({w,v:0.3+R()*0.4});});
  // timber cranes over the shafts
  const cranes=[];place(10,10,220,RI-110,(x,z,y)=>{const g=new THREE.Group();g.position.set(x,y,z);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1,20,1).translate(0,10,0),woodM));const boom=new THREE.Group();boom.position.y=19;g.add(boom);
    boom.add(new THREE.Mesh(new THREE.BoxGeometry(22,0.7,0.7).translate(8,0,0),woodM));const ch=new THREE.Mesh(new THREE.BoxGeometry(0.15,10,0.15).translate(0,-5,0),ironM);ch.position.x=17;boom.add(ch);
    const load=new THREE.Mesh(new THREE.BoxGeometry(2,1.6,2),woodM);load.position.set(17,-10.5,0);boom.add(load);add(g,WAR);cranes.push({boom,ph:R()*6.28});});
  // warg pens
  const wargs=[];const wargM=new THREE.MeshLambertMaterial({color:0x3a342c,flatShading:true});
  const pens=[];place(3,22,280,RI-140,(x,z,y)=>{pens.push({x,z,y});const posts=inst(new THREE.BoxGeometry(0.4,3,0.4).translate(0,1.5,0),woodM,48,WAR);
    for(let k=0;k<48;k++){const a=k/48*Math.PI*2;D.position.set(x+Math.cos(a)*18,y,z+Math.sin(a)*18);D.rotation.set(0,0,0);D.scale.set(1,1,1);D.updateMatrix();posts.setMatrixAt(k,D.matrix);}
    const rail=new THREE.Mesh(new THREE.TorusGeometry(18,0.18,4,48).rotateX(Math.PI/2),woodM);rail.position.set(x,y+2.4,z);add(rail,WAR);
    for(let k=0;k<12;k++)wargs.push({cx:x,cz:z,y,a:R()*6.28,r:3+R()*12,v:(R()<0.5?-1:1)*(0.2+R()*0.4)});});
  const wargGeo=(()=>{const b=new THREE.BoxGeometry(1.1,1.1,2.6).translate(0,1.2,0),h=new THREE.BoxGeometry(0.8,0.8,1.1).translate(0,1.6,1.6);
    const P=[...b.toNonIndexed().attributes.position.array,...h.toNonIndexed().attributes.position.array];const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();return g;})();
  const wargMesh=inst(wargGeo,wargM,wargs.length,WAR);
  // stacks of timber by the forges, and carts on the roads
  const logs=inst(new THREE.CylinderGeometry(0.45,0.45,9,6).rotateZ(Math.PI/2),woodM,40*9,WAR);{let n=0;
    for(let s=0;s<40&&s<taken.length;s++){const [fx,fz,fr]=taken[Math.floor(R()*Math.min(70,taken.length))],a=R()*6,x=fx+Math.cos(a)*(fr+6),z=fz+Math.sin(a)*(fr+6),y=plainY(Math.hypot(x,z));
      for(let k=0;k<9;k++){const row=k<4?0:k<7?1:2,col=k<4?k:k<7?k-4:k-7;D.position.set(x+Math.cos(a+1.57)*(col-1.5+row*0.5)*0.95,y+0.45+row*0.8,z+Math.sin(a+1.57)*(col-1.5+row*0.5)*0.95);D.rotation.set(0,-a,0);D.scale.set(1,1,1);D.updateMatrix();logs.setMatrixAt(n++,D.matrix);}}
    logs.count=n;}
  const carts=[];for(let k=0;k<18;k++)carts.push({a:ROAD_A[k%8],off:(k%2?1:-1)*4.2,ph:R(),v:(0.8+R()*0.6)/700});
  const cartGeo=(()=>{const parts=[new THREE.BoxGeometry(2.4,1.2,4.2).translate(0,1.4,0)];for(const sx of [-1.3,1.3])for(const sz of [-1.4,1.4])parts.push(new THREE.CylinderGeometry(0.7,0.7,0.3,8).rotateZ(Math.PI/2).translate(sx,0.7,sz));
    const P=[];for(const g of parts)P.push(...g.toNonIndexed().attributes.position.array);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();return g;})();
  const cartMesh=inst(cartGeo,woodM,carts.length,WAR);

  // ---- outside: the camp, the timber, the burned trees, and the eaves of Fangorn ----
  {const tentM=new THREE.MeshLambertMaterial({color:0x3a332b,flatShading:true}),N=200,tents=inst(new THREE.ConeGeometry(3.4,4.2,5).translate(0,2.1,0),tentM,N,WAR);let n=0;
   for(let i=0;i<N*3&&n<N;i++){const x=-760+R()*560,z=RO+160+R()*620;if(x>-180)continue;D.position.set(x,groundH(x,z)-0.2,z);D.rotation.set(0,R()*6,0);D.scale.set(1,0.8+R()*0.4,1);D.updateMatrix();tents.setMatrixAt(n++,D.matrix);}
   tents.count=n;var campFires=[];for(let k=0;k<12;k++){const x=-700+R()*480,z=RO+200+R()*560;campFires.push([x,groundH(x,z),z]);}
   var campFireMesh=inst(new THREE.ConeGeometry(1.6,4,6).translate(0,2,0),flameM,12,WAR);
   const std=inst(new THREE.PlaneGeometry(4,8).translate(2,12,0),bannerM,10,WAR),poles=inst(new THREE.BoxGeometry(0.3,16,0.3).translate(0,8,0),ironM,10,WAR);
   for(let k=0;k<10;k++){const x=-720+R()*500,z=RO+180+R()*580;D.position.set(x,groundH(x,z),z);D.rotation.set(0,R()*6,0);D.scale.set(1,1,1);D.updateMatrix();std.setMatrixAt(k,D.matrix);poles.setMatrixAt(k,D.matrix);}}
  {const piles=inst(new THREE.CylinderGeometry(0.5,0.5,10,6).rotateZ(Math.PI/2),woodM,15*12,WAR);let n=0;
   for(let s=0;s<15;s++){const x=1200+s*260,z=-600+300*Math.sin(x/900)+(R()<0.5?-14:14),y=groundH(x,z),a=R()*0.4;
     for(let k=0;k<12;k++){const row=Math.floor(k/5),col=k%5;D.position.set(x+(col-2+row*0.5)*1.05,y+0.5+row*0.9,z);D.rotation.set(0,a,0);D.updateMatrix();piles.setMatrixAt(n++,D.matrix);}}
   piles.count=n;}
  {const charM=new THREE.MeshLambertMaterial({color:0x1c1916,flatShading:true}),N=90,dead=inst(new THREE.CylinderGeometry(0.4,0.9,1,5).translate(0,0.5,0),charM,N,WAR);
   for(let i=0;i<N;i++){const z=-3000+R()*6000,x=fangornEdge(z)-180-R()*260;D.position.set(x,groundH(x,z),z);D.rotation.set((R()-0.5)*0.3,R()*6,(R()-0.5)*0.3);D.scale.set(1,5+R()*9,1);D.updateMatrix();dead.setMatrixAt(i,D.matrix);}}
  // the great trees at the very edge of the forest: older, darker, and twice the height of the rest
  {const N=80,trunk=inst(new THREE.CylinderGeometry(1.2,2.4,1,7).translate(0,0.5,0),new THREE.MeshLambertMaterial({color:0x362c22,flatShading:true}),N,null),
     crown=inst(new THREE.IcosahedronGeometry(1,1),new THREE.MeshLambertMaterial({color:0x26381f,flatShading:true}),N*2,null);
   for(let i=0;i<N;i++){const z=-9000+R()*18000,x=fangornEdge(z)+20+R()*80,y=groundH(x,z),h=34+R()*16;
     D.position.set(x,y-1,z);D.rotation.set(0,R()*6,0);D.scale.set(1,h*0.6,1);D.updateMatrix();trunk.setMatrixAt(i,D.matrix);
     for(let k=0;k<2;k++){const s=h*(0.34-k*0.08);D.position.set(x+(R()-0.5)*8,y+h*(0.66+k*0.2),z+(R()-0.5)*8);D.scale.set(s,s*0.75,s);D.updateMatrix();crown.setMatrixAt(i*2+k,D.matrix);}}}

  // ---- in the Treegarth: Treebeard, by the tower ----
  const tb=makeEnt(THREE,R,22);tb.g.position.set(O?O.x+70:70,O?O.base:466,O?O.z+60:60);tb.g.rotation.y=Math.PI*1.2;add(tb.g,PEACE);tb.g.visible=false;

  // ---- what moves ----
  let t0=performance.now(),last=t0;
  animHooks.push(now=>{const t=(now-t0)/1000,dt=Math.min(0.05,(now-last)/1000);last=now;
    if(ctx.war===false){tb.stride(Math.sin(t*0.4)*0.25);return;}
    refreshWall();const n=nightF(hour()),live=1-((W&&W.quenched)||0);
    // the watch walking the wall, off the broken lengths
    if(Rg&&wallWatch){watch.forEach((q,i)=>{const a=q.a+t*q.v,seg=Rg.segAt(a);
        if(Rg.segs[seg].isBroken){wallWatch.setMatrixAt(i,ZERO);return;}
        D.position.set(Math.cos(a)*q.r,wallTop,Math.sin(a)*q.r);D.rotation.set(0,Math.atan2(-Math.sin(a)*Math.sign(q.v),Math.cos(a)*Math.sign(q.v)),0);D.scale.setScalar(1.15);D.updateMatrix();wallWatch.setMatrixAt(i,D.matrix);});
      wallWatch.instanceMatrix.needsUpdate=true;}
    for(const f of gateFires||[])f.scale.set(1,0.8+0.3*Math.sin(t*9+f.position.x),1);
    // the pits
    let k2=0;for(const p of pits)for(let j=0;j<5;j++){const a=j/5*Math.PI*2+t*0.3,r=p.r*0.5;D.position.set(p.x+Math.cos(a)*r,p.y,p.z+Math.sin(a)*r);D.rotation.set(0,0,0);
      const s=live*(0.9+0.4*Math.sin(t*7+j+p.x));D.scale.set(1.6*s,Math.max(0.001,(3+2*Math.sin(t*5+j))*s),1.6*s);D.updateMatrix();pitFire.setMatrixAt(k2++,D.matrix);
      if(R()<0.04*live)smoke.emit(p.x,p.y+3,p.z,(R()-0.5),3+R()*2,(R()-0.5),10,16);}
    pitFire.instanceMatrix.needsUpdate=true;glowM.color.setHSL(0.04,0.8,(0.2+0.25*n)*live+0.05);
    for(const w of wheels)w.w.rotation.z=t*w.v*live;
    for(const c of cranes)c.boom.rotation.y=Math.sin(t*0.12+c.ph)*1.2;
    wargs.forEach((q,i)=>{const a=q.a+t*q.v*0.3;D.position.set(q.cx+Math.cos(a)*q.r,q.y,q.cz+Math.sin(a)*q.r);D.rotation.set(0,Math.atan2(-Math.sin(a)*Math.sign(q.v),Math.cos(a)*Math.sign(q.v)),0);D.scale.setScalar(1);D.updateMatrix();wargMesh.setMatrixAt(i,D.matrix);});
    wargMesh.instanceMatrix.needsUpdate=true;
    carts.forEach((c,i)=>{const u=((t*c.v)+c.ph)%2,s=u<1?u:2-u,r=RI-50-s*(RI-200),x=Math.cos(c.a)*r-Math.sin(c.a)*c.off,z=Math.sin(c.a)*r+Math.cos(c.a)*c.off;
      D.position.set(x,plainY(Math.hypot(x,z)),z);D.rotation.set(0,Math.atan2(Math.cos(c.a),Math.sin(c.a))+(u<1?Math.PI:0),0);D.scale.setScalar(1);D.updateMatrix();cartMesh.setMatrixAt(i,D.matrix);});
    cartMesh.instanceMatrix.needsUpdate=true;
    (campFires||[]).forEach(([x,y,z],i)=>{D.position.set(x,y,z);D.rotation.set(0,0,0);D.scale.set(1,0.8+0.4*Math.sin(t*8+i),1);D.updateMatrix();campFireMesh.setMatrixAt(i,D.matrix);if(R()<0.03)smoke.emit(x,y+4,z,0,3,0,10,14);});
    campFireMesh.instanceMatrix.needsUpdate=true;
    // mist in under the eaves of Fangorn, drifting out a little way
    if(R()<0.5){const z=-6000+R()*12000,x=fangornEdge(z)+R()*120;mist.emit(x,groundH(x,z)+4+R()*10,z,-1-R(),0.1,(R()-0.5)*0.4,30,60+R()*40);}});
  ctx.details=Object.assign(ctx.details||{},{pits:pits.length,wheels:wheels.length,cranes:cranes.length,wargs:wargs.length});
}
