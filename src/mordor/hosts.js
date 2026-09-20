// ---------- what moves in Mordor: the hosts marching the roads, the Nazgul over the plateau, and the lightning
// in the pall. Nowhere else on the site marches, so it travels with this page instead of with the shared engine,
// and nothing is built unless the city config carries a "hosts" block. ----------
import { mkRng } from '../core/rng.js';

export function hosts(api){
  const {THREE,C,ctx,B,ROADS,scene,camera,animHooks,groundH,joinChains,polyAt,polyLen}=api;

  const K=C.hosts;if(!K)return;
  const HR=mkRng(6626),D=new THREE.Object3D();
  const ironM=new THREE.MeshLambertMaterial({color:0x1e1c1a});
  const fleshM=new THREE.MeshLambertMaterial({color:0x2b2621});
  const dustM=new THREE.MeshLambertMaterial({color:0x3a332b,transparent:true,opacity:0.3,depthWrite:false});

  // the roads they use: the named ones, joined end to end
  const NAMED=new RegExp(K.roads||'Road|Gate|Sauron','i');
  const groups=new Map();
  for(const r of ROADS){if(!r.name||!NAMED.test(r.name))continue;let g=groups.get(r.name);if(!g){g=[];groups.set(r.name,g);}g.push(r);}
  const routes=[];
  for(const [name,rs] of groups)for(const pts of joinChains(rs.map(r=>r.pts),40)){
    const r=polyLen({pts});if(r.len<20000)continue;r.name=name;routes.push(r);}

  // ---- the hosts ----
  // Each army is built once in its own local frame and then moved as a single object: forty thousand
  // instance matrices rewritten every frame would cost more than the whole rest of the land put together.
  const armies=[];
  {const want=K.armies||0,per=K.perArmy||4000,FILE=K.file||62,STEP=K.step||1.9;
   for(let k=0;k<want&&routes.length;k++){
     const r=routes[k%routes.length];
     const g=new THREE.Group();
     const ranks=Math.ceil(per/FILE);
     const bodies=new THREE.InstancedMesh(new THREE.BoxGeometry(0.8,1.9,0.6).translate(0,0.95,0),fleshM,per);
     const spears=new THREE.InstancedMesh(new THREE.BoxGeometry(0.13,3.6,0.13).translate(0,1.8,0),ironM,per);
     let n=0;
     for(let rk=0;rk<ranks&&n<per;rk++)for(let f=0;f<FILE&&n<per;f++){
       const x=(f-(FILE-1)/2)*STEP+(HR()-0.5)*0.5,z=-rk*STEP-(HR()-0.5)*0.4;
       D.position.set(x,0,z);D.rotation.set(0,0,0);D.scale.set(1,0.9+HR()*0.25,1);D.updateMatrix();
       bodies.setMatrixAt(n,D.matrix);
       D.position.set(x+0.35,1.1,z);D.rotation.set(0,0,(HR()-0.5)*0.22);D.updateMatrix();
       spears.setMatrixAt(n,D.matrix);n++;}
     bodies.count=spears.count=n;bodies.frustumCulled=spears.frustumCulled=false;
     g.add(bodies,spears);
     // banners over the column
     for(let b=0;b<6;b++){const bx=(HR()-0.5)*FILE*STEP*0.8,bz=-HR()*ranks*STEP;
       const pole=new THREE.Mesh(new THREE.BoxGeometry(0.22,9,0.22).translate(0,4.5,0),ironM);pole.position.set(bx,0,bz);
       const flag=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.2),new THREE.MeshLambertMaterial({color:0x5a1712,side:THREE.DoubleSide}));
       flag.position.set(bx+1.7,8,bz);g.add(pole,flag);}
     scene.add(g);
     // the dust it raises, trailing behind
     const dust=[];for(let d2=0;d2<7;d2++){const p=new THREE.Mesh(new THREE.SphereGeometry(28,7,5),dustM);
       p.userData.t=d2/7;scene.add(p);dust.push(p);}
     armies.push({g,r,s:HR()*r.len,v:(K.pace||1.4)*(0.8+HR()*0.5),dir:HR()<0.5?-1:1,dust,ranks,STEP});}
   let last=performance.now();
   animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;
     for(const a of armies){a.s+=a.v*dt*a.dir;
       const [px,pz]=polyAt(a.r,a.s,true),[ax,az]=polyAt(a.r,a.s+a.dir*120,true);
       const head=Math.atan2(az-pz,ax-px),gy=groundH(px,pz);
       a.g.position.set(px,gy+Math.abs(Math.sin(now*0.004))*0.12,pz);a.g.rotation.y=-head+Math.PI/2;
       a.dust.forEach((p,i)=>{const t=((now*0.00004)+p.userData.t)%1,back=a.ranks*a.STEP*(0.6+t*2.2);
         p.position.set(px-Math.cos(head)*a.dir*back,gy+8+t*34,pz-Math.sin(head)*a.dir*back);
         p.scale.setScalar(0.7+t*3.2);});}
     if(ctx.details&&now-(ctx._hT||0)>1000){ctx._hT=now;
       ctx.details.hostAt=armies.slice(0,3).map(a=>Math.round(a.g.position.x)+','+Math.round(a.g.position.z)).join(' | ');}});}

  // ---- the Nazgul, on their fellbeasts ----
  const riders=[];
  {const want=K.nazgul||0;
   for(let k=0;k<want;k++){
     const g=new THREE.Group(),S=K.wing||16;
     const body=new THREE.Mesh(new THREE.SphereGeometry(S*0.22,10,7),fleshM);body.scale.set(2.0,0.8,0.9);g.add(body);
     const neck=new THREE.Mesh(new THREE.CylinderGeometry(S*0.05,S*0.11,S*0.7,6).rotateZ(Math.PI/2),fleshM);
     neck.position.set(S*0.5,S*0.06,0);neck.rotation.z=0.25;g.add(neck);
     const head=new THREE.Mesh(new THREE.ConeGeometry(S*0.09,S*0.3,6).rotateZ(-Math.PI/2),fleshM);
     head.position.set(S*0.86,S*0.13,0);g.add(head);
     const tail=new THREE.Mesh(new THREE.ConeGeometry(S*0.1,S*1.3,6).rotateZ(Math.PI/2),fleshM);
     tail.position.set(-S*0.78,0,0);g.add(tail);
     const wings=[];
     for(const sd of [-1,1]){const w=new THREE.Group();
       const inner=new THREE.Mesh(new THREE.BoxGeometry(S*0.5,0.5,S*0.62).translate(0,0,sd*S*0.31),fleshM);
       const outer=new THREE.Mesh(new THREE.BoxGeometry(S*0.32,0.4,S*0.66).translate(0,0,sd*S*0.33),fleshM);
       outer.position.set(-S*0.06,0,sd*S*0.62);w.add(inner,outer);g.add(w);wings.push({w,sd});}
     const rider=new THREE.Mesh(new THREE.CylinderGeometry(S*0.06,S*0.09,S*0.34,6).translate(0,S*0.17,0),ironM);
     rider.position.set(0,S*0.16,0);g.add(rider);
     scene.add(g);
     const around=K.circle||[0,0];
     riders.push({g,wings,cx:around[0]+(HR()-0.5)*(K.spread||120000),cz:around[1]+(HR()-0.5)*(K.spread||120000),
       r:6000+HR()*26000,y:(K.alt||900)+HR()*1800,a:HR()*6.28,v:(0.000035+HR()*0.00004)*(HR()<0.5?-1:1),ph:HR()*6.28});}
   animHooks.push(now=>{
     for(const q of riders){const a=q.a+now*q.v,x=q.cx+Math.cos(a)*q.r,z=q.cz+Math.sin(a)*q.r;
       q.g.position.set(x,groundH(x,z)+q.y+Math.sin(now*0.0004+q.ph)*60,z);
       q.g.rotation.set(0,-a-(q.v>0?Math.PI/2:-Math.PI/2),0.18*(q.v>0?1:-1));
       const beat=Math.sin(now*0.0016+q.ph);
       for(const w of q.wings)w.w.rotation.x=w.sd*beat*0.55;}});}

  // ---- lightning in the pall ----
  if(K.lightning){
    const boltM=new THREE.MeshBasicMaterial({color:0xdfe6ff,transparent:true,opacity:0});
    const bolts=[];
    for(let k=0;k<4;k++){const g=new THREE.Group();
      let x=0,y=0;
      for(let s2=0;s2<9;s2++){const seg=new THREE.Mesh(new THREE.BoxGeometry(90,1400,90),boltM);
        x+=(HR()-0.5)*1400;y-=1400;seg.position.set(x,y,0);seg.rotation.z=(HR()-0.5)*0.4;g.add(seg);}
      g.visible=false;scene.add(g);bolts.push(g);}
    const flashLight=new THREE.HemisphereLight(0xcfd8ff,0x40342c,0);scene.add(flashLight);
    let next=0,active=null,t0=0;
    animHooks.push(now=>{
      if(now>next&&!active){next=now+(K.lightningGap||2600)*(0.5+HR()*1.6);
        active=bolts[Math.floor(HR()*bolts.length)];t0=now;
        const bx=B.cx+(HR()-0.5)*B.w*0.8,bz=B.cz+(HR()-0.5)*B.d*0.8;
        active.position.set(bx,groundH(bx,bz)+16000,bz);active.visible=true;}
      if(active){const u=(now-t0)/260;
        if(u>1){active.visible=false;active=null;boltM.opacity=0;flashLight.intensity=0;}
        else{const f=(u<0.12?1:Math.max(0,1-(u-0.12)/0.88))*(HR()<0.25?0.35:1);
          boltM.opacity=f;flashLight.intensity=f*(K.flash||0.55);}}});}

  ctx.hostAt=()=>armies.map(a=>[Math.round(a.g.position.x),Math.round(a.g.position.z)]);   // for aiming a camera
  ctx.details=Object.assign(ctx.details||{},{hostAt:armies.slice(0,2).map(a=>Math.round(a.g.position.x)+','+Math.round(a.g.position.z)).join(' | '),hosts:armies.length,
    hostStrength:armies.reduce((s,a)=>s+(K.perArmy||4000),0),nazgul:riders.length});
}
