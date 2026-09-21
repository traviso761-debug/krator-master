// ---------- what makes Arrakeen Arrakeen ----------
// The massing is right and it still reads as a generic hot-country town, because the thing that makes this
// city what it is is not its plan but what is bolted to it. On a world with no open water:
//
//   a windtrap on every roof, turned into the wind, because the air is the only place there is any water
//   dew collectors along the parapets - chromed cones that the night condenses on and a gutter under them
//   awnings strung across the lanes, because shade is the only free comfort there is
//   cisterns, sealed, guarded, and the single most valuable thing on any street
//   stalls in the water market, and the queue at the public taps
//   dust devils out on the basin floor, and thopters crossing it
//
// All of it is small and all of it is merged. Fan work; Dune belongs to the Herbert estate and the geometry
// is this project's own.
import { mkRng } from '../core/rng.js';

export function life(api){
  const {THREE,C,ctx,scene,animHooks,groundH,roofAt,box,mergeParts,nightF,hour,B}=api;
  const K=C.life;if(!K)return;
  const R=mkRng(K.seed||10191);

  const metal=new THREE.MeshPhongMaterial({color:0x8d8b84,specular:0x5a5852,shininess:26,flatShading:true});
  const chrome=new THREE.MeshPhongMaterial({color:0xb8bcc0,specular:0xffffff,shininess:90,flatShading:true});
  const shade=new THREE.MeshLambertMaterial({color:0x7d6c52,flatShading:true});
  const canvasM=[0xb9a077,0x9c8a6a,0xa8916d,0xc2ab84,0x8d7c60].map(h=>
    new THREE.MeshLambertMaterial({color:h,side:THREE.DoubleSide,flatShading:true}));
  const stoneM=new THREE.MeshLambertMaterial({color:0x9d8a6c,flatShading:true});
  const dustM=new THREE.MeshLambertMaterial({color:0xc6ac81,transparent:true,opacity:0.1,depthWrite:false});

  const statics=[],devils=[],thopters=[];
  const CITY=1500;

  // ---- the windtraps ----
  // A scoop on a mast, all of them pointing the same way because there is only one wind that matters, and
  // a down-pipe into the house. They are what a roofline is made of here.
  let traps=0;
  for(let k=0;k<(K.windtraps||0);k++){
    const a=R()*Math.PI*2, r=Math.sqrt(R())*(CITY-200);
    const x=Math.cos(a)*r, z=Math.sin(a)*r;
    const h=roofAt(x,z);if(h<4)continue;
    const turn=-0.5+(R()-0.5)*0.5;
    const mast=box(x,h,z,1.1,5+R()*4,1.1,metal);statics.push(mast);
    const sc=new THREE.Mesh(new THREE.BoxGeometry(5.5+R()*3,4.5+R()*2.5,1.2),metal);
    sc.position.set(x,h+6+R()*3,z);sc.rotation.set(0.35,turn,0);statics.push(sc);
    for(let v=0;v<3;v++){
      const vane=new THREE.Mesh(new THREE.BoxGeometry(5.2,0.35,1.6),chrome);
      vane.position.set(x,h+5+v*1.5,z);vane.rotation.set(0,turn,0);statics.push(vane);
    }
    statics.push(box(x+0.9,h,z+0.9,0.7,4.5,0.7,shade));       // the down-pipe
    traps++;
  }

  // ---- the dew collectors ----
  // Along the parapets: a cone of something that loses heat fast, and a gutter under it. Each one is worth
  // a thimbleful a night and everybody has a dozen.
  for(let k=0;k<(K.collectors||0);k++){
    const a=R()*Math.PI*2, r=Math.sqrt(R())*(CITY-160);
    const x=Math.cos(a)*r, z=Math.sin(a)*r;
    const h=roofAt(x,z);if(h<4)continue;
    const n=2+Math.floor(R()*3);
    for(let i=0;i<n;i++){
      const px=x+(R()-0.5)*14, pz=z+(R()-0.5)*14;
      const c=new THREE.Mesh(new THREE.ConeGeometry(0.75,1.9,6),chrome);
      c.position.set(px,h+1.6,pz);statics.push(c);
      statics.push(box(px,h+0.2,pz,1.9,0.3,1.9,metal));
    }
  }

  // ---- the awnings ----
  // Strung across the lanes at first-floor height. In a city this dense they are most of what you see when
  // you are in it.
  for(let k=0;k<(K.awnings||0);k++){
    const a=R()*Math.PI*2, r=Math.sqrt(R())*(CITY-240);
    const x=Math.cos(a)*r, z=Math.sin(a)*r;
    if(roofAt(x,z)>0)continue;                                // it goes over the street, not the house
    const g=groundH(x,z), ang=R()*Math.PI, len=7+R()*9;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(len,3.4+R()*2.6),canvasM[Math.floor(R()*canvasM.length)]);
    m.position.set(x,g+5.2+R()*2,z);m.rotation.set(-Math.PI/2+0.12*Math.sin(k),ang,0);
    statics.push(m);
    for(const sd of [-1,1])
      statics.push(box(x+Math.cos(ang)*sd*len*0.5,g,z+Math.sin(ang)*sd*len*0.5,0.3,5.2,0.3,shade));
  }

  // ---- the cisterns and the taps ----
  for(let k=0;k<(K.cisterns||0);k++){
    const a=R()*Math.PI*2, r=Math.sqrt(R())*(CITY-260);
    const x=Math.cos(a)*r, z=Math.sin(a)*r;
    if(roofAt(x,z)>0)continue;
    const g=groundH(x,z);
    statics.push(box(x,g,z,5+R()*4,3.4,4+R()*3,stoneM));
    statics.push(box(x,g+3.4,z,6,0.8,5,shade));
    statics.push(box(x+2,g,z,0.5,2.4,0.5,metal));
  }

  // ---- the market ----
  for(let k=0;k<(K.stalls||0);k++){
    const x=320+(R()-0.5)*220, z=300+(R()-0.5)*170;
    if(roofAt(x,z)>0)continue;
    const g=groundH(x,z), w=2.6+R()*2;
    statics.push(box(x,g,z,w,1.1,w*0.7,shade));
    const top=new THREE.Mesh(new THREE.BoxGeometry(w*1.4,0.16,w),canvasM[Math.floor(R()*canvasM.length)]);
    top.position.set(x,g+2.6,z);top.rotation.y=R()*3;statics.push(top);
    for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])
      statics.push(box(x+dx*w*0.6,g,z+dz*w*0.45,0.14,2.6,0.14,shade));
  }

  // ---- out on the basin ----
  // Dust devils, which on a planet with this much loose material and this much sun are permanent, and the
  // thopters that are the only sane way to cross any of it.
  for(let k=0;k<(K.dustDevils||0);k++){
    const g=new THREE.Group();
    // Spheres, not an open cylinder: a one-sided tube of dust shows its own inside at the edges and reads
    // as a hard cream wedge rather than as a column of air with sand in it.
    for(let i=0;i<9;i++){
      const p=new THREE.Mesh(new THREE.SphereGeometry(7+i*3.2,8,6),dustM);
      p.position.set((R()-0.5)*8,10+i*19,(R()-0.5)*8);p.userData.noWire=true;g.add(p);
    }
    const x=(R()-0.5)*B.w*0.7, z=(R()-0.5)*B.d*0.7;
    g.position.set(x,groundH(x,z),z);scene.add(g);
    devils.push({g,x,z,a:R()*6.28,v:0.00004+R()*0.00007,r:300+R()*2600,ph:R()*6.28});
  }

  // an ornithopter: a body, a tail, and four wings that beat. At the size they are on this map they read as
  // a dragonfly, which is exactly right.
  const thopterM=new THREE.MeshLambertMaterial({color:0x6e6a60,flatShading:true});
  const wingM=new THREE.MeshLambertMaterial({color:0x8e8a7e,side:THREE.DoubleSide,flatShading:true});
  for(let k=0;k<(K.thopters||0);k++){
    const g=new THREE.Group(), S=7;
    const body=new THREE.Mesh(new THREE.CylinderGeometry(S*0.16,S*0.1,S*1.5,7).rotateZ(Math.PI/2),thopterM);
    g.add(body);
    const nose=new THREE.Mesh(new THREE.ConeGeometry(S*0.17,S*0.5,7).rotateZ(-Math.PI/2),thopterM);
    nose.position.x=S*0.95;g.add(nose);
    const tail=new THREE.Mesh(new THREE.BoxGeometry(S*0.5,S*0.3,0.2),thopterM);tail.position.x=-S*0.85;g.add(tail);
    const fin=new THREE.Mesh(new THREE.BoxGeometry(S*0.4,0.2,S*0.35),thopterM);fin.position.set(-S*0.85,S*0.14,0);g.add(fin);
    const wings=[];
    for(const sd of [-1,1])for(const fr of [0.3,-0.2]){
      const w=new THREE.Group();
      const blade=new THREE.Mesh(new THREE.BoxGeometry(S*0.26,0.12,S*1.1).translate(0,0,sd*S*0.55),wingM);
      w.add(blade);w.position.set(S*fr,S*0.1,0);g.add(w);wings.push({w,sd});
    }
    const x=(R()-0.5)*B.w*0.5, z=(R()-0.5)*B.d*0.5;
    g.position.set(x,groundH(x,z)+120+R()*260,z);scene.add(g);
    thopters.push({g,wings,cx:x,cz:z,r:600+R()*2400,a:R()*6.28,
      v:(0.00011+R()*0.00016)*(R()<0.5?-1:1),y:120+R()*300,ph:R()*6.28});
  }

  const byMat=new Map();
  for(const m of statics){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
  for(const [mat,list] of byMat){const g=mergeParts(list,mat);g.userData.wireCat='life';scene.add(g);}

  animHooks.push(now=>{
    const t=now/1000;
    for(const q of devils){
      const a=q.a+now*q.v;
      const x=q.x+Math.cos(a)*q.r, z=q.z+Math.sin(a)*q.r;
      q.g.position.set(x,groundH(x,z),z);
      q.g.rotation.y=now*0.001+q.ph;
      q.g.scale.set(0.7+0.4*Math.sin(t*0.3+q.ph),0.8+0.5*Math.sin(t*0.21+q.ph),0.7+0.4*Math.cos(t*0.27+q.ph));
    }
    for(const q of thopters){
      const a=q.a+now*q.v;
      const x=q.cx+Math.cos(a)*q.r, z=q.cz+Math.sin(a)*q.r;
      q.g.position.set(x,groundH(x,z)+q.y+22*Math.sin(now*0.0005+q.ph),z);
      q.g.rotation.set(0,-a-(q.v>0?Math.PI/2:-Math.PI/2),0.2*(q.v>0?1:-1));
      const beat=Math.sin(now*0.02+q.ph);
      for(const w of q.wings)w.w.rotation.x=w.sd*beat*0.7;
    }
  });

  ctx.details=Object.assign(ctx.details||{},{
    windtraps:traps,dewCollectors:K.collectors||0,awnings:K.awnings||0,
    cisterns:K.cisterns||0,dustDevils:devils.length,thopters:thopters.length});
}
