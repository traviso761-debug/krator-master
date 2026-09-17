// ---------- streetscape at the focus corners (North & Ashland, the six corners at North/Damen/Milwaukee):
// shopfronts along the diagonal, street lights, traffic signals, CTA bus shelters, parked cars, people on the sidewalks ----------
await stage('streetscape');
section('streetscape',()=>{
  if(!FOCUS.length)return;
  const inFocus=(x,z,pad)=>FOCUS.some(f=>Math.hypot(f.x-x,f.z-z)<f.r+(pad||0));
  const near=STREETS.filter(s=>(s.major||s.axis==='d')&&FOCUS.some(f=>segDist(f.x,f.z,s.a[0],s.a[1],s.b[0],s.b[1])<f.r));
  const R=mkRng(1600);
  // intersections between those streets, inside a focus
  const xings=[];for(let i=0;i<near.length;i++)for(let j=i+1;j<near.length;j++){const h=segHit(near[i].a,near[i].b,near[j].a,near[j].b);if(!h||!inFocus(h.x,h.z,0))continue;if(xings.some(q=>Math.hypot(q.x-h.x,q.z-h.z)<20))continue;xings.push({x:h.x,z:h.z,s:[near[i],near[j]]});}
  const nearXing=(x,z,r)=>xings.some(q=>Math.hypot(q.x-x,q.z-z)<r);
  // walk a street inside the focus, calling fn(x,z,dirx,dirz) every `step` metres
  const along=(s,step,fn)=>{const L=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]),dx=(s.b[0]-s.a[0])/L,dz=(s.b[1]-s.a[1])/L;for(let u=step/2;u<L;u+=step){const x=s.a[0]+dx*u,z=s.a[1]+dz*u;if(inFocus(x,z,0))fn(x,z,dx,dz);}};
  // 1. shopfronts along the diagonals (Milwaukee), which the block grid leaves ragged
  const occupied=(x,z,r)=>lots.some(l=>Math.abs(l.x-x)<l.w/2+r&&Math.abs(l.z-z)<l.dpt/2+r);
  const BODY_D=[];let dshops=0;
  for(const s of near){if(s.axis!=='d')continue;along(s,11,(x,z,dx,dz)=>{if(nearXing(x,z,22))return;
    for(const sd of [-1,1]){if(R()<0.12)continue;const depth=16+R()*6,off=s.w/2+3.5+depth/2,bx=x-dz*sd*off,bz=z+dx*sd*off,h=10+R()*8;
      if(!inMap(bx,bz,20)||inWater(bx,bz)||parkAt(bx,bz)||occupied(bx,bz,2)||nearLandmark(bx,bz,4))continue;
      const ang=Math.atan2(dz,dx),col=BRICK[Math.floor(R()*BRICK.length)];
      BODY_D.push([bx,bz,11.2,h,depth,ang,col]);lots.push({x:bx,z:bz,w:9,dpt:9,h,ry:ang,kind:'shop',district:districtAt(bx,bz),fixed:false});dshops++;}});}
  // rotated boxes need their own instances: body, cornice, shop glass, awning
  {const n=BODY_D.length,body=new THREE.InstancedMesh(boxG,brickM,n),trim=new THREE.InstancedMesh(boxG,trimM,n),glass=new THREE.InstancedMesh(boxG,shopM,n),awn=new THREE.InstancedMesh(boxG,awningM,n),d=new THREE.Object3D();
   BODY_D.forEach(([x,z,w,h,depth,ang,col],i)=>{const face=[-Math.sin(ang),Math.cos(ang)],fx=(x0,z0)=>[x0,z0];
     const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-ang),set=(im,px,py,pz,sx,sy,sz,c)=>{d.position.set(px,py,pz);d.quaternion.copy(q);d.scale.set(sx,sy,sz);d.updateMatrix();im.setMatrixAt(i,d.matrix);if(c)im.setColorAt(i,c);};
     // which side faces the street: the one nearer the diagonal's centre line
     const s0=near.find(s=>s.axis==='d'&&segDist(x,z,s.a[0],s.a[1],s.b[0],s.b[1])<depth/2+s.w/2+8)||near[0],toward=Math.sign((s0.a[0]-x)*face[0]+(s0.a[1]-z)*face[1])||1;
     set(body,x,0,z,w,h,depth,col);set(trim,x,h,z,w+0.6,0.9,depth+0.6,new THREE.Color(col).multiplyScalar(0.7));
     const gx=x+face[0]*toward*(depth/2+0.2),gz=z+face[1]*toward*(depth/2+0.2);set(glass,gx,0.3,gz,w-0.8,3.8,0.5);
     set(awn,x+face[0]*toward*(depth/2+1),4.2,z+face[1]*toward*(depth/2+1),w-1,0.35,2,AWNING[i%AWNING.length]);});
   for(const im of [body,trim,glass,awn]){im.castShadow=im!==glass&&im!==awn;im.receiveShadow=true;scene.add(im);}}
  // 2. street lights: a pole every 30 m on both sidewalks, the head lit at dusk
  const lights=[];for(const s of near)along(s,30,(x,z,dx,dz)=>{if(nearXing(x,z,12))return;for(const sd of [-1,1])lights.push([x-dz*sd*(s.w/2+1.2),z+dx*sd*(s.w/2+1.2),Math.atan2(dz,dx)+(sd>0?Math.PI/2:-Math.PI/2)]);});
  const poleM=new THREE.MeshLambertMaterial({color:0x3a3d40}),headM=new THREE.MeshLambertMaterial({color:0xe8e4d8,emissive:0x000000});
  {const n=lights.length,pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12,0.16,1,6).translate(0,0.5,0),poleM,n),arm=new THREE.InstancedMesh(boxG,poleM,n),head=new THREE.InstancedMesh(boxG,headM,n),d=new THREE.Object3D();
   lights.forEach(([x,z,a],i)=>{d.rotation.set(0,-a,0);d.position.set(x,0,z);d.scale.set(1,9,1);d.updateMatrix();pole.setMatrixAt(i,d.matrix);
     const ex=Math.cos(a)*1.6,ez=Math.sin(a)*1.6;d.position.set(x+ex,8.8,z+ez);d.scale.set(3.2,0.15,0.15);d.updateMatrix();arm.setMatrixAt(i,d.matrix);d.position.set(x+ex*2,8.4,z+ez*2);d.scale.set(1,0.35,0.5);d.updateMatrix();head.setMatrixAt(i,d.matrix);});
   pole.castShadow=true;scene.add(pole,arm,head);animHooks.push(()=>{const w=nightF(hourCur);headM.emissive.setRGB(w,w*0.85,w*0.55);});}
  // 3. traffic signals: a mast arm on two corners of every intersection, heads cycling between the two streets
  const sigHeads=[];const sigM=new THREE.MeshLambertMaterial({color:0x2a2c2e});
  for(const q of xings){const [a,b]=q.s,da=[a.b[0]-a.a[0],a.b[1]-a.a[1]],la=Math.hypot(...da);const ux=da[0]/la,uz=da[1]/la;
    for(const sd of [-1,1]){const cx=q.x+ux*sd*(b.w/2+4)-uz*sd*(a.w/2+2),cz=q.z+uz*sd*(b.w/2+4)+ux*sd*(a.w/2+2);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,7,8),sigM);pole.position.set(cx,3.5,cz);scene.add(pole);
      const armLen=a.w*0.55,mast=new THREE.Mesh(new THREE.BoxGeometry(armLen,0.25,0.25),sigM);mast.position.set(cx+uz*sd*armLen/2,6.8,cz-ux*sd*armLen/2);mast.rotation.y=-Math.atan2(-ux,uz);scene.add(mast);
      for(const k of [0.5,1]){const hx=cx+uz*sd*armLen*k,hz=cz-ux*sd*armLen*k,head=new THREE.Group();head.position.set(hx,5.6,hz);
        const housing=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.5,0.5),sigM);head.add(housing);const lamps=[0xff2a1a,0xffb020,0x30e060].map((c,li)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(0.16,6,4),new THREE.MeshBasicMaterial({color:0x202020}));m.position.set(0,0.45-li*0.45,0.28);m.userData.on=c;head.add(m);return m;});
        head.rotation.y=-Math.atan2(ux*sd,uz*sd);scene.add(head);sigHeads.push({lamps,phase:(sd>0?0:0)+(xings.indexOf(q)%2)*0});}}}
  // one cycle: the diagonal/first street gets 18 s green, 3 s amber, then the cross street
  animHooks.push(now=>{const t=(now/1000)%42;const state=t<18?2:t<21?1:0;for(const h of sigHeads)h.lamps.forEach((m,li)=>m.material.color.setHex(li===state?m.userData.on:0x202020));});
  // 4. CTA bus shelters near the corners
  const glassM=new THREE.MeshLambertMaterial({color:0xa8c8d8,transparent:true,opacity:0.45}),frameM=new THREE.MeshLambertMaterial({color:0x2a3a4a});let shelters=0;
  for(const q of xings){for(const s of q.s){if(s.axis==='d'&&R()<0.5)continue;const L=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]),dx=(s.b[0]-s.a[0])/L,dz=(s.b[1]-s.a[1])/L,sd=R()<0.5?-1:1,off=34;
    const x=q.x+dx*off*sd-dz*sd*(s.w/2+2.4),z=q.z+dz*off*sd+dx*sd*(s.w/2+2.4);if(!inMap(x,z,10)||inWater(x,z))continue;const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=-Math.atan2(dz,dx);
    const back=new THREE.Mesh(new THREE.BoxGeometry(4.2,2.3,0.08),glassM);back.position.set(0,1.35,-sd*0.8);const roof=new THREE.Mesh(new THREE.BoxGeometry(4.6,0.18,1.9),frameM);roof.position.y=2.6;
    const side=new THREE.Mesh(new THREE.BoxGeometry(0.08,2.3,1.5),glassM);side.position.set(2.1,1.35,0);const bench=new THREE.Mesh(new THREE.BoxGeometry(3,0.1,0.45),frameM);bench.position.set(0,0.5,-sd*0.5);
    const sign=new THREE.Mesh(new THREE.BoxGeometry(0.08,3.2,0.08),frameM);sign.position.set(-2.6,1.6,sd*0.6);g.add(back,roof,side,bench,sign);scene.add(g);shelters++;}}
  // 5. parked cars along both curbs, clear of the corners and the bus stops
  const parked=[];for(const s of near){if(s.w<20)continue;along(s,6.8,(x,z,dx,dz)=>{if(nearXing(x,z,28))return;for(const sd of [-1,1]){if(R()<0.3)continue;const px=x-dz*sd*(s.w/2-1.4),pz=z+dx*sd*(s.w/2-1.4);if(inWater(px,pz)||onBridge(px,pz))continue;parked.push([px,pz,Math.atan2(dz,dx)]);}});}
  {const n=parked.length,body=new THREE.InstancedMesh(new THREE.BoxGeometry(4.5,1.0,1.9).translate(0,0.75,0),new THREE.MeshLambertMaterial({color:0xffffff}),n),cab=new THREE.InstancedMesh(new THREE.BoxGeometry(2.4,0.7,1.7).translate(-0.2,1.6,0),new THREE.MeshLambertMaterial({color:0x2a3440}),n),d=new THREE.Object3D(),c=new THREE.Color();
   parked.forEach(([x,z,a],i)=>{d.position.set(x,0,z);d.rotation.set(0,-a,0);d.scale.set(1,1,1);d.updateMatrix();body.setMatrixAt(i,d.matrix);cab.setMatrixAt(i,d.matrix);body.setColorAt(i,c.setHSL(R(),R()<0.4?0.05:0.5,0.2+R()*0.55));});
   body.castShadow=true;scene.add(body,cab);}
  // 6. people walking the sidewalks
  const walkers=[];for(const s of near){const L=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]);along(s,9,(x,z,dx,dz)=>{if(R()<0.45)return;const sd=R()<0.5?-1:1;walkers.push({s,L,u:0,x0:x,z0:z,dx,dz,sd,off:s.w/2+2+R()*1.8,v:(R()<0.5?-1:1)*(1.1+R()*0.5),t:R()*100,col:R()});});}
  {const n=walkers.length,body=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22,0.26,1.35,6).translate(0,0.68,0),new THREE.MeshLambertMaterial({color:0xffffff}),n),head=new THREE.InstancedMesh(new THREE.SphereGeometry(0.13,6,5).translate(0,1.52,0),new THREE.MeshLambertMaterial({color:0xc8a080}),n),d=new THREE.Object3D(),c=new THREE.Color();
   walkers.forEach((w,i)=>body.setColorAt(i,c.setHSL(w.col,0.4,0.25+0.35*((w.col*7)%1))));body.userData.life=true;body.frustumCulled=head.frustumCulled=false;scene.add(body,head);
   let last=performance.now();animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;
     walkers.forEach((w,i)=>{w.t+=w.v*dt;if(Math.abs(w.t)>60){w.v=-w.v;w.t=Math.sign(w.t)*60;}
       const x=w.x0+w.dx*w.t-w.dz*w.sd*w.off,z=w.z0+w.dz*w.t+w.dx*w.sd*w.off,bob=Math.abs(Math.sin(now*0.009+i))*0.05;
       d.position.set(x,bob,z);d.rotation.set(0,-Math.atan2(w.dz*Math.sign(w.v),w.dx*Math.sign(w.v)),0);d.updateMatrix();body.setMatrixAt(i,d.matrix);head.setMatrixAt(i,d.matrix);});
     body.instanceMatrix.needsUpdate=head.instanceMatrix.needsUpdate=true;});}
  ctx.details=Object.assign(ctx.details||{},{focusShops:dshops,streetLights:lights.length,signals:sigHeads.length,shelters,parkedCars:parked.length,people:walkers.length,intersections:xings.length});
});
