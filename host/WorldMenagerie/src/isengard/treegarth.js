// ---------- the Treegarth of Orthanc ----------
// Fan work from Tolkien.
//
// What the Ents made of it: the works gone, the plain green again, and trees - "avenues and groves of fruitful
// trees" as it had been before Saruman, planted along the old roads and in groves between them - with pools where
// the flood lay longest, and the Ents themselves walking in it, keeping watch on the tower. All of it is the peace
// side of the switch (ctx.peaceParts).
import { mkRng } from '../core/rng.js';
import { RI,ROAD_A,clearOfPlan,plainY,nearChannel } from './plan.js';

export function treegarth(api){
  const {THREE,ctx,scene,animHooks}=api;
  const R=mkRng(1437),D=new THREE.Object3D();
  const PEACE=ctx.peaceParts=ctx.peaceParts||[];
  const add=o=>{o.userData.noFingerprint=true;o.visible=false;scene.add(o);PEACE.push(o);return o;};
  // the sward over the whole plain, laid a hand's breadth over the paving (which it hides)
  {const g=new THREE.CircleGeometry(RI-1,96).rotateX(-Math.PI/2),p=g.attributes.position;
   for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,plainY(Math.hypot(x,z))+0.35);}g.computeVertexNormals();
   const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0x5d7a3e,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6}));m.receiveShadow=true;add(m);}
  // the trees: avenues along the old roads, groves between them; round crowns in a few greens, some in blossom
  const spots=[];
  for(const a of ROAD_A)for(const sd of [-1,1])for(let r=RI-40;r>130;r-=12)spots.push([Math.cos(a)*r-Math.sin(a)*sd*8,Math.sin(a)*r+Math.cos(a)*sd*8]);
  for(let i=0,n=0;n<1400&&i<20000;i++){const a=R()*Math.PI*2,d=150+R()*(RI-180),x=Math.cos(a)*d,z=Math.sin(a)*d;
    if(!clearOfPlan(x,z,4))continue;const g=Math.sin(x/60)*Math.cos(z/70);if(g<-0.1)continue;spots.push([x,z]);n++;}
  const N=spots.length;
  const trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.35,0.55,4.5,5).translate(0,2.25,0),new THREE.MeshLambertMaterial({color:0x5a4634}),N);
  const crown=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(4,1).translate(0,7,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),N);
  const greens=[0x4f7a36,0x5f8a3e,0x6a8f44,0x46703a].map(h=>new THREE.Color(h)),bloom=new THREE.Color(0xe6cfd3);
  spots.forEach(([x,z],i)=>{const s=0.9+R()*0.7;D.position.set(x,plainY(Math.hypot(x,z))+0.2,z);D.rotation.set(0,R()*6,0);D.scale.set(s,s*(0.9+R()*0.3),s);D.updateMatrix();
    trunk.setMatrixAt(i,D.matrix);crown.setMatrixAt(i,D.matrix);crown.setColorAt(i,R()<0.12?bloom:greens[Math.floor(R()*4)]);});
  trunk.frustumCulled=crown.frustumCulled=false;add(trunk);add(crown);
  // pools where the flood lay longest
  for(let k=0;k<7;k++){let x,z,t=0;do{const a=R()*Math.PI*2,d=240+R()*(RI-320);x=Math.cos(a)*d;z=Math.sin(a)*d;t++;}while(t<50&&(!clearOfPlan(x,z,30)||nearChannel(x,z)<80));
    const r=14+R()*22,m=new THREE.Mesh(new THREE.CircleGeometry(r,24).rotateX(-Math.PI/2),new THREE.MeshPhongMaterial({color:0x4a6878,specular:0xffffff,shininess:90,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));
    m.position.set(x,plainY(Math.hypot(x,z))+0.45,z);m.scale.set(1,1,0.6+R()*0.6);m.rotation.y=R()*3;add(m);}
  // ---- the Ents, walking in it ----
  const ents=[];
  for(let k=0;k<7;k++){const g=makeEnt(THREE,R,9+R()*5);add(g.g);ents.push({...g,a:R()*6.28,r:200+R()*(RI-320),v:(R()<0.5?-1:1)*(0.004+R()*0.004),ph:R()*6.28});}
  animHooks.push(now=>{if(ctx.war!==false)return;const t=now/1000;
    for(const e of ents){const a=e.a+t*e.v,x=Math.cos(a)*e.r,z=Math.sin(a)*e.r;e.g.position.set(x,plainY(e.r),z);e.g.rotation.y=Math.atan2(-Math.sin(a)*Math.sign(e.v),Math.cos(a)*Math.sign(e.v));
      e.stride(t*1.1+e.ph);}});
  ctx.details=Object.assign(ctx.details||{},{treegarthTrees:N});
}

// An Ent: a trunk for a body, bark-grey or green-brown, long branching arms, legs like roots, a head of twigs and
// leaves, and it sways as it walks. Built facing +z. Shared with the events (the march on Isengard).
export function makeEnt(THREE,R,H){
  const g=new THREE.Group(),bark=new THREE.MeshLambertMaterial({color:[0x5a4b3c,0x4d5540,0x6a5a48][Math.floor(R()*3)],flatShading:true});
  const leaf=new THREE.MeshLambertMaterial({color:[0x4f6a34,0x5f7a3c,0x6f6a36][Math.floor(R()*3)],flatShading:true});
  const body=new THREE.Group();g.add(body);
  body.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(H*0.07,H*0.1,H*0.55,7).translate(0,H*0.62,0),bark)));
  const head=new THREE.Mesh(new THREE.CylinderGeometry(H*0.06,H*0.075,H*0.14,7).translate(0,H*0.96,0),bark);body.add(head);
  for(let k=0;k<5;k++){const c=new THREE.Mesh(new THREE.IcosahedronGeometry(H*(0.07+R()*0.05),0),leaf);c.position.set((R()-0.5)*H*0.18,H*(1.03+R()*0.08),(R()-0.5)*H*0.18);body.add(c);}
  const legs=[],arms=[];
  for(const sd of [-1,1]){const p=new THREE.Group();p.position.set(sd*H*0.05,H*0.36,0);g.add(p);
    p.add(new THREE.Mesh(new THREE.CylinderGeometry(H*0.035,H*0.05,H*0.36,6).translate(0,-H*0.18,0),bark));legs.push({p,sd});
    const a=new THREE.Group();a.position.set(sd*H*0.09,H*0.84,0);body.add(a);
    a.add(new THREE.Mesh(new THREE.CylinderGeometry(H*0.018,H*0.03,H*0.42,5).translate(0,-H*0.21,0),bark));
    for(let t=0;t<3;t++){const tw=new THREE.Mesh(new THREE.CylinderGeometry(H*0.006,H*0.012,H*0.1,4).translate(0,-H*0.05,0),bark);tw.position.set((R()-0.5)*H*0.04,-H*0.42,(R()-0.5)*H*0.04);tw.rotation.set((R()-0.5)*0.8,0,(R()-0.5)*0.8);a.add(tw);}
    arms.push({a,sd});}
  return {g,H,stride(p){for(const l of legs)l.p.rotation.x=Math.sin(p+(l.sd>0?Math.PI:0))*0.35;for(const a of arms)a.a.rotation.x=-Math.sin(p+(a.sd>0?0:Math.PI))*0.25;body.rotation.z=Math.sin(p)*0.03;}};
}
