// ---------- what moves in Venice ----------
// Every other city on this site puts its traffic on the roads. Here the roads are the exception: the canals
// are the street network, the calli are footpaths between the buildings, and nothing with wheels has been
// through the middle of it since before there were wheels worth having. So the traffic goes on the water.
//
// The engine's own boats want open water - they keep a margin of clear lake around themselves - and a canal
// four metres wide has no margin at all. These follow the mapped waterway centre lines instead, the way the
// trains follow the rails, which is what a canal is: a route with two banks.
import { mkRng } from '../core/rng.js';

export function boats(api){
  const {THREE,C,ctx,scene,animHooks,WATERWAYS,joinChains,polyLen,polyAt,inWater}=api;
  const K=C.boats;if(!K)return;
  const R=mkRng(1797);

  // the routes: the mapped canals, joined end to end, longest first
  const chains=joinChains(WATERWAYS.map(w=>w.pts),6).map(p=>polyLen({pts:p})).filter(r=>r.len>120)
    .sort((a,b)=>b.len-a.len);
  if(!chains.length)return;
  const grand=chains[0];                                  // the longest is the Grand Canal, near enough

  // Every boat of a kind is one instance of one mesh: its parts merged and coloured by vertex, so a hundred gondolas
  // are one draw, not seven hundred. The gondoliers' oars swing, so they are a mesh of their own.
  function kind(parts){const pos=[],nor=[],col=[];for(const [g0,c,x,y,z,rz=0] of parts){const g=g0.toNonIndexed();if(rz)g.rotateZ(rz);g.translate(x,y,z);const p=g.attributes.position,n=g.attributes.normal,cc=new THREE.Color(c);
      for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));col.push(cc.r,cc.g,cc.b);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g;}
  const Bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d),BLACK='#1d1c1e',BRASS='#b8a06a';   // a gondola is black by law, since 1562
  // the gondola, the gondolier standing at the stern in his striped shirt and straw boater
  const GONDOLA=kind([[Bx(11,0.7,1.35),BLACK,0,0.35,0],[new THREE.ConeGeometry(0.62,2.6,5),BLACK,6.2,0.5,0,-Math.PI/2],[new THREE.ConeGeometry(0.56,2.2,5),BLACK,-6.0,0.5,0,Math.PI/2],
    [Bx(0.16,1.5,0.5),BRASS,7.0,1.3,0],[Bx(2.2,0.5,1.1),'#7a2030',0.5,0.9,0],[Bx(1.2,0.6,1.0),'#7a2030',1.9,1.0,0],
    [Bx(0.22,0.9,0.3),'#1e2430',-4.2,1.15,0],...[0,1,2,3].map(k=>[Bx(0.3,0.12,0.42),k%2?'#f2f0ea':'#1e3a78',-4.2,1.66+k*0.12,0]),
    [new THREE.SphereGeometry(0.13,7,5),'#d9b08c',-4.2,2.22,0],[new THREE.CylinderGeometry(0.26,0.26,0.03,10),'#e6d29a',-4.2,2.34,0],[new THREE.CylinderGeometry(0.14,0.14,0.1,10),'#e6d29a',-4.2,2.39,0]]);
  const OAR=kind([[Bx(4.6,0.12,0.12),'#8a6a44',-1.6,0,0]]);   // pivoting at the forcola, at the gondolier's hands
  const VAPORETTO=kind([[Bx(24,2.2,4.4),'#e6e2d8',0,1.1,0],[Bx(24.2,0.5,4.5),'#3a3a3c',0,0.25,0],[Bx(17,2.6,4.0),'#2d4a63',0,3.4,0],[Bx(16.6,1.0,4.04),'#9ec4d6',0,3.6,0],[Bx(18,0.4,4.4),'#e6e2d8',0,4.8,0],[Bx(0.6,0.6,0.6),'#f0d020',-8,5.3,0]]);
  const BARGE=kind([[Bx(14,1.6,3.4),'#6a5a48',0,0.8,0],[Bx(8,1.8,2.8),'#6a5f4e',-1,2.4,0],[Bx(2.2,1.6,2.8),'#2d4a63',5,2.2,0],[Bx(1.6,0.5,1.6),'#b84a2a',-2.4,3.55,0.6],[Bx(1.4,0.6,1.4),'#3a6a8a',0.6,3.6,-0.5]]);
  // the water taxi: a varnished mahogany motoscafo, a cream cabin, a little flag
  const TAXI=kind([[Bx(10,1.0,2.4),'#7a3f22',0,0.5,0],[new THREE.ConeGeometry(1.2,1.8,6),'#7a3f22',5.6,0.55,0,-Math.PI/2],[Bx(4.6,1.2,2.1),'#ece4d2',-0.6,1.6,0],[Bx(4.4,0.5,2.12),'#2a3a44',-0.6,1.7,0],[Bx(3,0.1,2.3),'#8a4a28',3.2,1.02,0],[Bx(0.05,0.5,0.4),'#c83030',-4.6,2.2,0]]);
  const mat=new THREE.MeshLambertMaterial({vertexColors:true}),fleet=[];
  function add(geo,n,mk){const im=new THREE.InstancedMesh(geo,mat,Math.max(1,n));im.castShadow=true;im.frustumCulled=false;scene.add(im);const list=[];for(let k=0;k<n;k++)list.push(mk(k));fleet.push({im,list});return list;}
  const gond=add(GONDOLA,K.gondolas||0,()=>({r:chains[Math.floor(R()*Math.min(chains.length,40))],s:0,v:(K.speed||2.2)*(0.7+R()*0.5),dir:R()<0.5?-1:1,roll:R()*6.28,oar:true}));
  add(VAPORETTO,K.vaporetti||0,k=>({r:grand,s:0,v:(K.speed||2.2)*2.6,dir:k%2?1:-1,roll:R()*6.28}));
  add(BARGE,K.barges||0,()=>({r:chains[Math.floor(R()*Math.min(chains.length,24))],s:0,v:(K.speed||2.2)*1.5,dir:R()<0.5?-1:1,roll:R()*6.28}));
  add(TAXI,K.taxis||0,()=>({r:chains[Math.floor(R()*Math.min(chains.length,30))],s:0,v:(K.speed||2.2)*3.2,dir:R()<0.5?-1:1,roll:R()*6.28}));
  for(const f of fleet)for(const m of f.list)m.s=8+R()*Math.max(1,m.r.len-16);
  const oars=new THREE.InstancedMesh(OAR,mat,Math.max(1,gond.length));oars.frustumCulled=false;scene.add(oars);
  const d=new THREE.Object3D(),o2=new THREE.Object3D();o2.rotation.order='YXZ';let movers=0;for(const f of fleet)movers+=f.list.length;

  let last=performance.now();
  animHooks.push(now=>{
    const dt=Math.min(0.05,(now-last)/1000);last=now;let oi=0;
    for(const f of fleet){let i=0;for(const m of f.list){
      m.s+=m.dir*m.v*dt;
      if(m.s>m.r.len-8){m.s=m.r.len-8;m.dir=-1;}
      if(m.s<8){m.s=8;m.dir=1;}
      const [x,z,a]=polyAt(m.r,m.s),y=0.1+0.08*Math.sin(now*0.0016+m.roll),ry=-a+(m.dir>0?0:Math.PI);
      d.position.set(x,y,z);d.rotation.set(0.02*Math.sin(now*0.0021+m.roll),ry,0.03*Math.sin(now*0.0013+m.roll));d.updateMatrix();f.im.setMatrixAt(i++,d.matrix);
      if(m.oar){const c=Math.cos(ry),sn=Math.sin(ry),lx=-3.6,lz=0.62;o2.position.set(x+lx*c+lz*sn,y+1.35,z-lx*sn+lz*c);o2.rotation.set(0,ry+0.3*Math.sin(now*0.004+m.roll),0.2);o2.updateMatrix();oars.setMatrixAt(oi++,o2.matrix);}}
      f.im.instanceMatrix.needsUpdate=true;}
    oars.count=oi;oars.instanceMatrix.needsUpdate=true;
  });
  const movingCount=movers;
  ctx.details=Object.assign(ctx.details||{},{canals:chains.length,boats:movingCount,
    grandCanal:Math.round(grand.len)+' m'});
}
