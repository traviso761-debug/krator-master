// ---------- what is moving on the ice ----------
// A station of forty people on a moon with no weather does not have much going on outside, and that is the
// point: what movement there is reads enormously against a surface where nothing else changes. Rovers on
// the lanes, vapour off the bore and the vents, the lights of the site, and the tracks everything has left.
import { mkRng } from '../core/rng.js';

export function life(api){
  const {THREE,C,ctx,scene,animHooks,groundH,box,mergeParts,ROADS,joinChains,polyAt,polyLen,nightF,hour}=api;
  const K=C.life;if(!K)return;
  const R=mkRng(K.seed||1610);

  const steel=new THREE.MeshLambertMaterial({color:0x6e767d,flatShading:true});
  const hull=new THREE.MeshPhongMaterial({color:0x9aa4ac,specular:0xdce4ea,shininess:40,flatShading:true});
  const gold=new THREE.MeshPhongMaterial({color:0xd8b45a,specular:0xfff0c0,shininess:80,flatShading:true});
  const warm=new THREE.MeshBasicMaterial({color:0xffca7a});
  const cold=new THREE.MeshBasicMaterial({color:0x9fd4ff});
  ctx.europaLights={warm,cold};          // the radiation alert turns them red (events.js)
  const trackM=new THREE.MeshLambertMaterial({color:0xb4c2cc,flatShading:true});
  
  const statics=[],rovers=[],lights=[],vents=[];

  // ---- the lanes, and what has been up and down them ----
  // Tracks do not fade here: there is no wind worth the name and no weather at all, so every wheel that has
  // ever crossed this ice is still written on it.
  const routes=[];
  for(const r of ROADS){
    if(!r.name)continue;
    const p=polyLen({pts:r.pts});
    if(p.len>400)routes.push(p);
  }
  for(let k=0;k<(K.tracks||0)&&routes.length;k++){
    const r=routes[Math.floor(R()*routes.length)];
    const s=R()*r.len,[x,z,a]=polyAt(r,s);
    for(const sd of [-1,1]){
      const px=x-Math.sin(a)*sd*2.2, pz=z+Math.cos(a)*sd*2.2;
      const t=box(px,groundH(px,pz)+0.1,pz,5.5,0.2,1.1,trackM);t.rotation.y=-a;statics.push(t);
    }
  }

  // ---- the rovers ----
  // Six wheels, a pressurised cab and a flatbed, and they go at walking pace because the suspension travel
  // is what stops a rock from ending the mission.
  for(let k=0;k<(K.rovers||0)&&routes.length;k++){
    const g=new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(9,3,4.4).translate(0,3.4,0),hull));
    const cab=new THREE.Mesh(new THREE.BoxGeometry(4,3.2,4.2).translate(0,1.6,0),hull);
    cab.position.set(2.2,4.9,0);g.add(cab);
    const win=new THREE.Mesh(new THREE.BoxGeometry(0.4,1.6,3.4),gold);win.position.set(4.3,6.2,0);g.add(win);
    for(let i=0;i<3;i++)for(const sd of [-1,1]){
      const w=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,1.1,10).rotateX(Math.PI/2),steel);
      w.position.set(-3+i*3,1.6,sd*2.6);g.add(w);
    }
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.5,7,5),warm);lamp.position.set(4.6,5.2,0);
    lamp.userData.noWire=true;g.add(lamp);
    scene.add(g);
    const r=routes[Math.floor(R()*routes.length)];
    rovers.push({g,r,s:R()*r.len,v:(2.4+R()*2.4)*(R()<0.5?-1:1)});
  }

  // ---- the lights of the site ----
  // Everything outside is lit, because there is nothing else to see by for three and a half days at a time.
  for(let k=0;k<(K.lights||0);k++){
    const a=R()*Math.PI*2, d=60+Math.sqrt(R())*620;
    const x=Math.cos(a)*d, z=Math.sin(a)*d, g=groundH(x,z);
    statics.push(box(x,g,z,0.5,7+R()*5,0.5,steel));
    const m=new THREE.Mesh(new THREE.SphereGeometry(0.75,7,5),R()<0.25?cold:warm);
    m.position.set(x,g+8+R()*5,z);m.userData.noWire=true;scene.add(m);
    lights.push({m,ph:R()*6.28});
  }

  // ---- the vents ----
  // Every warm thing on this moon is losing water to the vacuum somewhere: a squat stack on the ice, and what
  // comes out of it is src/europa/ice.js's (a jet on ballistic arcs, falling back as frost).
  for(let k=0;k<(K.vents||0);k++){
    const a=R()*Math.PI*2, d=90+R()*420;
    const x=Math.cos(a)*d, z=Math.sin(a)*d, g=groundH(x,z),h=3+R()*3;
    statics.push(box(x,g,z,1.6,h,1.6,steel));
    vents.push([x,g+h,z]);
  }
  ctx.europaVents=vents;

  const byMat=new Map();
  for(const m of statics){let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);}
  for(const [mat,list] of byMat){const g=mergeParts(list,mat);g.userData.wireCat='life';scene.add(g);}

  let last=performance.now(),t0=last;
  animHooks.push(now=>{
    const dt=Math.min(0.05,(now-last)/1000);last=now;const t=(now-t0)/1000;
    for(const q of rovers){
      q.s+=q.v*dt;
      if(q.s<0){q.s=0;q.v=-q.v;}
      if(q.s>q.r.len){q.s=q.r.len;q.v=-q.v;}
      const [x,z,a]=polyAt(q.r,q.s);
      q.g.position.set(x,groundH(x,z),z);
      q.g.rotation.y=-a+(q.v<0?Math.PI:0);
    }
    for(const q of lights)q.m.scale.setScalar(0.9+0.12*Math.sin(t*3+q.ph));
  });

  ctx.details=Object.assign(ctx.details||{},{
    rovers:rovers.length,siteLights:lights.length,vents:vents.length,tracks:K.tracks||0});
}
