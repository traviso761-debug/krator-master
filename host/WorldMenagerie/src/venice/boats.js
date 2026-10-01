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

  const woodM=new THREE.MeshLambertMaterial({color:0x1d1c1e});      // a gondola is black by law, since 1562
  const trimM=new THREE.MeshLambertMaterial({color:0xb8a06a});
  const hullM=new THREE.MeshLambertMaterial({color:0xe6e2d8});
  const cabinM=new THREE.MeshLambertMaterial({color:0x2d4a63});
  const cargoM=new THREE.MeshLambertMaterial({color:0x6a5f4e});
  const movers=[];

  // ---- gondolas ----
  // Eleven metres long, thirty-eight centimetres out of true - they are built asymmetric so that one oar on
  // the right side drives them straight - and the ferro on the bow, which is the only ornament they carry.
  {
    const n=K.gondolas||0;
    for(let k=0;k<n;k++){
      const r=chains[Math.floor(R()*Math.min(chains.length,40))];
      const g=new THREE.Group();
      const hull=new THREE.Mesh(new THREE.BoxGeometry(11,0.7,1.35),woodM);hull.position.y=0.35;g.add(hull);
      const bow=new THREE.Mesh(new THREE.ConeGeometry(0.62,2.6,5).rotateZ(-Math.PI/2),woodM);
      bow.position.set(6.2,0.5,0);g.add(bow);
      const stern=new THREE.Mesh(new THREE.ConeGeometry(0.56,2.2,5).rotateZ(Math.PI/2),woodM);
      stern.position.set(-6.0,0.5,0);g.add(stern);
      const ferro=new THREE.Mesh(new THREE.BoxGeometry(0.16,1.5,0.5),trimM);ferro.position.set(7.0,1.3,0);g.add(ferro);
      const seat=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.5,1.1),trimM);seat.position.set(0.5,0.9,0);g.add(seat);
      const oar=new THREE.Mesh(new THREE.BoxGeometry(4.6,0.12,0.12),trimM);
      oar.position.set(-3.4,1.2,0.7);oar.rotation.z=0.18;g.add(oar);
      const man=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.8,0.4),new THREE.MeshLambertMaterial({color:0x20242c}));
      man.position.set(-4.2,1.6,0);g.add(man);
      scene.add(g);movers.push({g,r,s:R()*r.len,v:(K.speed||2.2)*(0.7+R()*0.5),dir:R()<0.5?-1:1,roll:R()*6.28,oar});
    }
  }
  // ---- the vaporetti, which are the buses, and the barges, which are everything else ----
  {
    const n=K.vaporetti||0;
    for(let k=0;k<n;k++){
      const g=new THREE.Group();
      const hull=new THREE.Mesh(new THREE.BoxGeometry(24,2.2,4.4),hullM);hull.position.y=1.1;g.add(hull);
      const cab=new THREE.Mesh(new THREE.BoxGeometry(17,2.6,4.0),cabinM);cab.position.y=3.4;g.add(cab);
      const roof=new THREE.Mesh(new THREE.BoxGeometry(18,0.4,4.4),hullM);roof.position.y=4.8;g.add(roof);
      scene.add(g);movers.push({g,r:grand,s:R()*grand.len,v:(K.speed||2.2)*2.6,dir:k%2?1:-1,roll:R()*6.28});
    }
    const nb=K.barges||0;
    for(let k=0;k<nb;k++){
      const r=chains[Math.floor(R()*Math.min(chains.length,24))];
      const g=new THREE.Group();
      const hull=new THREE.Mesh(new THREE.BoxGeometry(14,1.6,3.4),hullM);hull.position.y=0.8;g.add(hull);
      const load=new THREE.Mesh(new THREE.BoxGeometry(8,1.8,2.8),cargoM);load.position.set(-1,2.4,0);g.add(load);
      const wheel=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.6,2.8),cabinM);wheel.position.set(5,2.2,0);g.add(wheel);
      scene.add(g);movers.push({g,r,s:R()*r.len,v:(K.speed||2.2)*1.5,dir:R()<0.5?-1:1,roll:R()*6.28});
    }
  }

  let last=performance.now();
  animHooks.push(now=>{
    const dt=Math.min(0.05,(now-last)/1000);last=now;
    for(const m of movers){
      m.s+=m.dir*m.v*dt;
      if(m.s>m.r.len-8){m.s=m.r.len-8;m.dir=-1;}
      if(m.s<8){m.s=8;m.dir=1;}
      const [x,z,a]=polyAt(m.r,m.s);
      m.g.position.set(x,0.1+0.08*Math.sin(now*0.0016+m.roll),z);
      m.g.rotation.set(0.02*Math.sin(now*0.0021+m.roll),-a+(m.dir>0?0:Math.PI),0.03*Math.sin(now*0.0013+m.roll));
      if(m.oar)m.oar.rotation.y=0.3*Math.sin(now*0.004+m.roll);
    }
  });
  ctx.details=Object.assign(ctx.details||{},{canals:chains.length,boats:movers.length,
    grandCanal:Math.round(grand.len)+' m'});
}
