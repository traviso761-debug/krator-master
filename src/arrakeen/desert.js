// ---------- the deep desert ----------
// Past the last rock, where the basin stops being swept stone and starts being open dune, the only thing
// that happens on this planet happens: a harvester sitting on a spice blow with its tracks down, a carryall
// holding station over it because it has about twenty minutes, spotters quartering the sand upwind, and
// somewhere under all of it the thing they are all watching for.
//
// The worm itself is never drawn. What is drawn is what you would actually see: a ridge of sand running,
// with a wake of dust off it, which is the only warning anybody gets. That is not coyness - it is the same
// decision as Shelob's hole. The dread is in what the sand is doing, not in a model of a mouth.
//
// Fan work; Dune belongs to the Herbert estate and every shape here is this project's own.
import { mkRng } from '../core/rng.js';
import { makeHarvester, makeCarryall, makeThopter } from './machines.js';

export function desert(api){
  const {THREE,C,ctx,scene,animHooks,groundH,box,mergeParts}=api;
  const K=C.desert;if(!K)return;
  const R=mkRng(6161);
  const AT=K.at||[-5200,5600], SP=K.spread||4200;

  const steel=new THREE.MeshPhongMaterial({color:0x7c7468,specular:0x9a9488,shininess:26,flatShading:true});
  const dark=new THREE.MeshLambertMaterial({color:0x4b453c,flatShading:true});
  const rust=new THREE.MeshLambertMaterial({color:0x8a6a44,flatShading:true});
  const sand=new THREE.MeshLambertMaterial({color:0xcbb083,flatShading:true});
  const spice=new THREE.MeshLambertMaterial({color:0xa4562a,flatShading:true});
  const dustM=new THREE.MeshLambertMaterial({color:0xc9ae83,transparent:true,opacity:0.22,depthWrite:false});
  const exhaust=new THREE.MeshLambertMaterial({color:0x8a8072,transparent:true,opacity:0.3,depthWrite:false});

  const statics=[],rigs=[],flyers=[],tracks=[],worms=[];

  // ---- the spice blows ----
  // Where a pre-spice mass has come up and gone off: a stain of raw melange on the sand, cinnamon-coloured
  // and worth more than the city.
  for(let k=0;k<(K.blows||0);k++){
    const x=AT[0]+(R()-0.5)*SP*2, z=AT[1]+(R()-0.5)*SP*2;
    const g=groundH(x,z);
    for(let i=0;i<9;i++){
      const a=R()*6.28, d=R()*180;
      const px=x+Math.cos(a)*d, pz=z+Math.sin(a)*d;
      const p=new THREE.Mesh(new THREE.CylinderGeometry(40+R()*90,50+R()*100,1.6,9),spice);
      p.position.set(px,groundH(px,pz)+0.9,pz);statics.push(p);
    }
  }

  // ---- the harvesters ----
  // A factory on tracks: a hull the size of a building, an intake mouth at the front, separators along the
  // top, and lifting points on the roof because the only way it ever leaves is hanging from one.
  for(let k=0;k<(K.harvesters||0);k++){
    const x=AT[0]+(R()-0.5)*SP, z=AT[1]+(R()-0.5)*SP, gy=groundH(x,z), rot=R()*6.28;
    const g=makeHarvester(THREE,{scale:0.8});
    g.position.set(x,gy,z);g.rotation.y=-rot;scene.add(g);   // its nose (+x) the way it creeps
    const plume=new THREE.Mesh(new THREE.SphereGeometry(16,8,6),dustM);
    plume.userData.noWire=true;scene.add(plume);
    const smoke=new THREE.Mesh(new THREE.SphereGeometry(7,8,6),exhaust);
    smoke.userData.noWire=true;scene.add(smoke);
    rigs.push({g,x,z,gy,rot,plume,smoke,ph:R()*6.28});
  }

  // ---- the carryalls ----
  // A wedge of silver-grey with jet pods at the corners, suspensor bags along the sides and the grapples
  // under it (src/arrakeen/machines.js). It holds station over the harvester with everything running,
  // because that is the whole job.
  for(let k=0;k<(K.carryalls||0);k++){
    const g=makeCarryall(THREE,{scale:1});
    scene.add(g);
    flyers.push({g,over:k%Math.max(1,rigs.length),y:150+R()*90,a:R()*6.28,r:120+R()*180,v:0.00022+R()*0.0002,big:true});
  }

  // ---- the spotters ----
  // Thopters quartering the sand upwind of the work, looking for the thing everybody else is trying not to
  // think about.
  const wingM=new THREE.MeshLambertMaterial({color:0x8e8a7e,side:THREE.DoubleSide,flatShading:true});
  for(let k=0;k<(K.spotters||0);k++){
    const g=makeThopter(THREE,{scale:0.9}),wings=null;
    scene.add(g);
    flyers.push({g,wings,over:-1,cx:AT[0]+(R()-0.5)*SP,cz:AT[1]+(R()-0.5)*SP,
      y:90+R()*160,a:R()*6.28,r:700+R()*1600,v:(0.00016+R()*0.0002)*(R()<0.5?-1:1)});
  }

  // ---- worm sign ----
  // A ridge of sand running, with a wake of dust off it. It comes up from nowhere, crosses, and goes down.
  for(let k=0;k<(K.worms||0);k++){
    const g=new THREE.Group();
    // The segments overlap: spaced wider than their own radius they read as a string of beads rolling
    // across the sand rather than as one thing moving under it.
    for(let i=0;i<22;i++){
      const r=30-Math.abs(i-8)*1.4;
      const seg=new THREE.Mesh(new THREE.SphereGeometry(Math.max(6,r),10,7),sand);
      seg.scale.set(1.7,0.42,1.15);seg.position.x=(i-8)*17;g.add(seg);
    }
    const puffs=[];
    for(let i=0;i<7;i++){
      const p=new THREE.Mesh(new THREE.SphereGeometry(20,8,6),dustM);
      p.userData.noWire=true;g.add(p);puffs.push(p);
    }
    scene.add(g);
    worms.push({g,puffs,cx:AT[0]+(R()-0.5)*SP*1.6,cz:AT[1]+(R()-0.5)*SP*1.6,
      a:R()*6.28,t:R(),T:26+R()*22,len:2600+R()*2600});
  }

  const byMat=new Map();
  for(const m of statics){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
  for(const [mat,list] of byMat){const g=mergeParts(list,mat);g.userData.wireCat='life';scene.add(g);}

  let t0=performance.now();
  animHooks.push(now=>{
    const t=(now-t0)/1000;
    for(const q of rigs){
      q.g.userData.update(now);
      if(q.held)continue;                        // a carryall has it (events.js)
      // it creeps forward along the blow, and the dust off the intake goes with it
      const d=(t*0.5)%180;
      const x=q.x+Math.cos(q.rot)*d, z=q.z+Math.sin(q.rot)*d;
      q.g.position.set(x,groundH(x,z),z);
      q.plume.position.set(x+Math.cos(q.rot)*50,groundH(x,z)+10,z+Math.sin(q.rot)*34);
      q.plume.scale.setScalar(0.9+0.35*Math.sin(t*1.7+q.ph));
      q.smoke.position.set(x-Math.cos(q.rot)*28,groundH(x,z)+52+6*Math.sin(t+q.ph),z-Math.sin(q.rot)*28);
      q.smoke.scale.setScalar(1+0.6*((t*0.3+q.ph)%1));
      q.cur=[x,z];
    }
    for(const q of flyers){
      if(q.held)continue;
      q.g.userData.update(now,q.big?{drop:4,fill:0.3,thrust:0.6}:1);
      let cx,cz;
      if(q.over>=0&&rigs[q.over]&&rigs[q.over].cur){cx=rigs[q.over].cur[0];cz=rigs[q.over].cur[1];}
      else{cx=q.cx;cz=q.cz;}
      const a=q.a+now*q.v;
      const x=cx+Math.cos(a)*q.r, z=cz+Math.sin(a)*q.r;
      q.g.position.set(x,groundH(x,z)+q.y+(q.big?4:16)*Math.sin(now*0.0006+q.a),z);
      q.g.rotation.set(0,-a-(q.v>0?Math.PI/2:-Math.PI/2),q.big?0.05:0.18*(q.v>0?1:-1));
    }
    for(const q of worms){
      q.t+=1/(q.T*60);
      if(q.t>1){q.t=0;q.a=Math.random()*6.28;
        q.cx=AT[0]+(Math.random()-0.5)*SP*1.6;q.cz=AT[1]+(Math.random()-0.5)*SP*1.6;}
      const u=q.t;
      const x=q.cx+Math.cos(q.a)*(u-0.5)*q.len, z=q.cz+Math.sin(q.a)*(u-0.5)*q.len;
      // it rises out of the sand, runs, and goes back down
      const rise=Math.sin(Math.min(1,Math.max(0,(u-0.12)/0.76))*Math.PI);
      q.g.position.set(x,groundH(x,z)-16+rise*20,z);
      q.g.rotation.y=-q.a;
      q.g.scale.set(1,Math.max(0.05,rise),1);
      q.puffs.forEach((p,i)=>{const s=(i+1)/7;
        p.position.set(-160-i*70,10+i*7,(Math.sin(i*1.7+t)*18));
        p.scale.setScalar((0.5+s*2.2)*rise);});
    }
  });

  ctx.arrakeenDesert={rigs,flyers,worms};   // the events (events.js) take these over now and then
  ctx.details=Object.assign(ctx.details||{},{
    harvesters:rigs.length,carryalls:K.carryalls||0,spotters:K.spotters||0,
    wormSign:worms.length,spiceBlows:K.blows||0});
}
