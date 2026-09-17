// ---------- streetscape in the detailed areas (Magnificent Mile, Riverwalk, North & Ashland, the six corners, Wrigleyville), on the OSM streets:
// crosswalks and signals where streets really meet, street lights, Michigan Avenue's planters and median gardens, parked cars, people ----------
await stage('streetscape');
section('streetscape',()=>{
  if(!FOCUS.length)return;
  const R=mkRng(1600),MAIN=new Set(['trunk','primary','secondary','tertiary']);
  const inF=(x,z)=>focusAt(x,z);
  const near=ROADS.filter(r=>MAIN.has(r.c)&&!r.bridge&&!r.layer&&r.pts.some(([x,z])=>inF(x,z)));
  // intersections: a vertex shared by two named main streets with different names (OSM ways meet at shared nodes)
  const vkey=([x,z])=>Math.round(x*2)+','+Math.round(z*2),byV=new Map();
  for(const r of near)r.pts.forEach((p,i)=>{if(!inF(p[0],p[1]))return;const k=vkey(p);let a=byV.get(k);if(!a){a=[];byV.set(k,a);}a.push({r,i});});
  const xings=[];for(const [k,a] of byV){const names=new Set(a.map(q=>q.r.name));if(names.size<2)continue;const p=a[0].r.pts[a[0].i];if(xings.some(q=>Math.hypot(q.x-p[0],q.z-p[1])<25))continue;xings.push({x:p[0],z:p[1],roads:a});}
  const nearXing=(x,z,r)=>xings.some(q=>Math.hypot(q.x-x,q.z-z)<r);
  const along=(r,step,fn)=>{let carry=step/2;for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.1)continue;const dx=(bx-ax)/L,dz=(bz-az)/L;
    for(let u=carry;u<L;u+=step){const x=ax+dx*u,z=az+dz*u;const f=inF(x,z);if(f)fn(x,z,dx,dz,f);}carry=Math.max(0,step-((L-carry)%step));}};
  const d=new THREE.Object3D();
  // crosswalk bars across each arm of every intersection
  {const zebra=[];for(const q of xings)for(const {r,i} of q.roads)for(const j of [i-1,i+1]){if(j<0||j>=r.pts.length)continue;const [x2,z2]=r.pts[j],L=Math.hypot(x2-q.x,z2-q.z);if(L<12)continue;
      const dx=(x2-q.x)/L,dz=(z2-q.z)/L,off=Math.max(9,r.w*0.7),cx=q.x+dx*off,cz=q.z+dz*off;for(let k=-r.w/2+1;k<r.w/2;k+=1.6)zebra.push([cx-dz*k,cz+dx*k,Math.atan2(dz,dx)]);}
   const zm=new THREE.InstancedMesh(new THREE.BoxGeometry(3.2,0.05,0.6),new THREE.MeshLambertMaterial({color:0xe8e6dc,polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-16}),Math.max(1,zebra.length));
   zebra.forEach(([x,z,a],i)=>{d.position.set(x,0.03,z);d.rotation.set(0,-a,0);d.scale.set(1,1,1);d.updateMatrix();zm.setMatrixAt(i,d.matrix);});zm.count=zebra.length;zm.receiveShadow=true;scene.add(zm);}
  // street lights every 30 m both sides; Michigan Avenue gets the tall double-armed poles
  const lights=[];for(const r of near)along(r,30,(x,z,dx,dz)=>{if(nearXing(x,z,14))return;for(const sd of [-1,1]){const lx=x-dz*sd*(r.w/2+1.3),lz=z+dx*sd*(r.w/2+1.3);if(!inWater(lx,lz))lights.push([lx,lz,Math.atan2(dz,dx)+(sd>0?Math.PI/2:-Math.PI/2)]);}});
  const poleM=new THREE.MeshLambertMaterial({color:0x2e3134}),headM=new THREE.MeshLambertMaterial({color:0xe8e4d8,emissive:0x000000});
  {const n=Math.max(1,lights.length),pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12,0.16,1,6).translate(0,0.5,0),poleM,n),arm=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),poleM,n),head=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),headM,n);
   lights.forEach(([x,z,a],i)=>{d.rotation.set(0,-a,0);d.position.set(x,0,z);d.scale.set(1,9,1);d.updateMatrix();pole.setMatrixAt(i,d.matrix);const ex=Math.cos(a)*1.6,ez=Math.sin(a)*1.6;
     d.position.set(x+ex,8.8,z+ez);d.scale.set(3.2,0.15,0.15);d.updateMatrix();arm.setMatrixAt(i,d.matrix);d.position.set(x+ex*2,8.5,z+ez*2);d.scale.set(1,0.35,0.5);d.updateMatrix();head.setMatrixAt(i,d.matrix);});
   pole.count=arm.count=head.count=lights.length;pole.castShadow=true;scene.add(pole,arm,head);animHooks.push(()=>{const w=nightF(hourCur);headM.emissive.setRGB(w,w*0.85,w*0.55);});}
  // signals: a mast arm on two corners of each intersection, cycling between the streets
  const sigM=new THREE.MeshLambertMaterial({color:0x2a2c2e}),lampsAll=[],sigPoles=[],sigHeads=[];
  for(const q of xings){const r=q.roads[0].r,i=q.roads[0].i,p2=r.pts[Math.min(r.pts.length-1,i+1)]===r.pts[i]?r.pts[i-1]:r.pts[Math.min(r.pts.length-1,i+1)],L=Math.hypot(p2[0]-q.x,p2[1]-q.z)||1,ux=(p2[0]-q.x)/L,uz=(p2[1]-q.z)/L;
    q.roads.forEach((arm,ai)=>{if(ai>1)return;for(const sd of [-1,1]){const cx=q.x+ux*sd*(arm.r.w/2+4)-uz*sd*(r.w/2+3),cz=q.z+uz*sd*(arm.r.w/2+4)+ux*sd*(r.w/2+3);
      sigPoles.push([cx,cz]);sigHeads.push([cx+uz*sd*3,cz-ux*sd*3,-Math.atan2(ux*sd,uz*sd)+(ai?Math.PI/2:0),ai]);}});}
  // all poles, heads and lamps are instanced; the lamps change colour once a second
  {const np=Math.max(1,sigPoles.length),nh=Math.max(1,sigHeads.length),poles=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2,0.25,7,8).translate(0,3.5,0),sigM,np),heads=new THREE.InstancedMesh(new THREE.BoxGeometry(0.5,1.5,0.5),sigM,nh),
     lamps=new THREE.InstancedMesh(new THREE.SphereGeometry(0.16,6,4),new THREE.MeshBasicMaterial({color:0xffffff}),nh*3),q=new THREE.Vector3(),ON=[0xff2a1a,0xffb020,0x30e060].map(h=>new THREE.Color(h)),OFF=new THREE.Color(0x202020);
   sigPoles.forEach(([x,z],i)=>{d.position.set(x,0,z);d.rotation.set(0,0,0);d.scale.set(1,1,1);d.updateMatrix();poles.setMatrixAt(i,d.matrix);});
   sigHeads.forEach(([x,z,a],i)=>{d.position.set(x,5.6,z);d.rotation.set(0,a,0);d.updateMatrix();heads.setMatrixAt(i,d.matrix);for(let li=0;li<3;li++){q.set(0,0.45-li*0.45,0.28).applyEuler(d.rotation);d.position.set(x+q.x,5.6+q.y,z+q.z);d.updateMatrix();lamps.setMatrixAt(i*3+li,d.matrix);lamps.setColorAt(i*3+li,OFF);}});
   poles.count=sigPoles.length;heads.count=lamps.count=sigHeads.length;lamps.count=sigHeads.length*3;scene.add(poles,heads,lamps);
   let lastS=-1;animHooks.push(now=>{const sec=Math.floor(now/1000);if(sec===lastS)return;lastS=sec;const t=sec%44;sigHeads.forEach(([,,,ph],i)=>{const tt=(t+(ph?22:0))%44,state=tt<18?2:tt<21?1:0;for(let li=0;li<3;li++)lamps.setColorAt(i*3+li,li===state?ON[li]:OFF);});if(lamps.instanceColor)lamps.instanceColor.needsUpdate=true;});
   lampsAll.length=sigHeads.length;}
  // Michigan Avenue's median gardens and sidewalk planters, on the Magnificent Mile only
  {const mich=near.filter(r=>/Michigan Avenue/i.test(r.name));const plM=new THREE.MeshLambertMaterial({color:0x6a6258}),flM=new THREE.MeshLambertMaterial({color:0xffffff}),trM=new THREE.MeshLambertMaterial({color:0x3f7a3a});
   const pl=[],med=[];for(const r of mich)along(r,16,(x,z,dx,dz,f)=>{if(!f.planters||nearXing(x,z,22))return;med.push([x,z,Math.atan2(dz,dx)]);for(const sd of [-1,1])pl.push([x-dz*sd*(r.w/2+2.6),z+dx*sd*(r.w/2+2.6),Math.atan2(dz,dx)]);});
   const all=med.concat(pl),n=Math.max(1,all.length),box=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),plM,n),fl=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),flM,n),tree=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),trM,n),c=new THREE.Color();
   all.forEach(([x,z,a],i)=>{const isMed=i<med.length;d.position.set(x,0,z);d.rotation.set(0,-a,0);d.scale.set(isMed?12:3,0.7,isMed?1.8:1.4);d.updateMatrix();box.setMatrixAt(i,d.matrix);
     d.position.set(x,0.7,z);d.scale.set(isMed?11.4:2.6,0.35,isMed?1.4:1.1);d.updateMatrix();fl.setMatrixAt(i,d.matrix);fl.setColorAt(i,c.setHSL([0.95,0.12,0.8,0.02][Math.floor(R()*4)],0.7,0.55));
     d.position.set(x,isMed?3.2:2.6,z);d.scale.setScalar(isMed?2.4:1.3);d.updateMatrix();tree.setMatrixAt(i,d.matrix);});
   box.count=fl.count=tree.count=all.length;tree.castShadow=true;scene.add(box,fl,tree);ctx.details=Object.assign(ctx.details||{},{michiganPlanters:all.length});}
  // parked cars along the curbs (not on Michigan Avenue or the Riverwalk area)
  const parked=[];for(const r of near){if(r.w<13)continue;along(r,6.8,(x,z,dx,dz,f)=>{if(f.parked===false||nearXing(x,z,26))return;for(const sd of [-1,1]){if(R()<0.3)continue;const px=x-dz*sd*(r.w/2-1.3),pz=z+dx*sd*(r.w/2-1.3);if(!inWater(px,pz))parked.push([px,pz,Math.atan2(dz,dx)]);}});}
  {const n=Math.max(1,parked.length),body=new THREE.InstancedMesh(new THREE.BoxGeometry(4.5,1.0,1.9).translate(0,0.75,0),new THREE.MeshLambertMaterial({color:0xffffff}),n),cab=new THREE.InstancedMesh(new THREE.BoxGeometry(2.4,0.7,1.7).translate(-0.2,1.6,0),new THREE.MeshLambertMaterial({color:0x2a3440}),n),c=new THREE.Color();
   parked.forEach(([x,z,a],i)=>{d.position.set(x,0,z);d.rotation.set(0,-a,0);d.scale.set(1,1,1);d.updateMatrix();body.setMatrixAt(i,d.matrix);cab.setMatrixAt(i,d.matrix);body.setColorAt(i,c.setHSL(R(),R()<0.4?0.05:0.5,0.2+R()*0.55));});
   body.count=cab.count=parked.length;body.castShadow=true;scene.add(body,cab);}
  // people on the sidewalks, busier on Michigan Avenue
  const walkers=[];for(const r of near)along(r,9,(x,z,dx,dz,f)=>{if(R()<(f.planters?0.4:0.7))return;const sd=R()<0.5?-1:1;walkers.push({x0:x,z0:z,dx,dz,sd,off:r.w/2+2.2+R()*1.6,v:(R()<0.5?-1:1)*(1.1+R()*0.5),t:0,col:R()});});
  {const n=Math.max(1,walkers.length),body=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22,0.26,1.35,6).translate(0,0.68,0),new THREE.MeshLambertMaterial({color:0xffffff}),n),head=new THREE.InstancedMesh(new THREE.SphereGeometry(0.13,6,5).translate(0,1.52,0),new THREE.MeshLambertMaterial({color:0xc8a080}),n),c=new THREE.Color();
   walkers.forEach((w,i)=>body.setColorAt(i,c.setHSL(w.col,0.4,0.25+0.35*((w.col*7)%1))));body.count=head.count=walkers.length;body.frustumCulled=head.frustumCulled=false;scene.add(body,head);
   let last=performance.now();animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;
     walkers.forEach((w,i)=>{w.t+=w.v*dt;if(Math.abs(w.t)>40){w.v=-w.v;w.t=Math.sign(w.t)*40;}const x=w.x0+w.dx*w.t-w.dz*w.sd*w.off,z=w.z0+w.dz*w.t+w.dx*w.sd*w.off;
       d.position.set(x,Math.abs(Math.sin(now*0.009+i))*0.05,z);d.rotation.set(0,-Math.atan2(w.dz*Math.sign(w.v),w.dx*Math.sign(w.v)),0);d.scale.set(1,1,1);d.updateMatrix();body.setMatrixAt(i,d.matrix);head.setMatrixAt(i,d.matrix);});
     body.instanceMatrix.needsUpdate=head.instanceMatrix.needsUpdate=true;});}
  ctx.details=Object.assign(ctx.details||{},{intersections:xings.length,streetLights:lights.length,signals:lampsAll.length,parkedCars:parked.length,people:walkers.length});
});
