// ---------- the night city: neon on every facade, billboards and holograms over the street, flying traffic in
// its lanes, flare stacks out on the flats, steam off the gratings, and rain. Only a city whose config has a
// "neon" block gets any of this; every other city skips the section. ----------
section('neon',()=>{
  const N=C.neon;if(!N)return;
  const NR=mkRng(7749),D=new THREE.Object3D(),cc=new THREE.Color();
  // the palette: nothing here is white. Signage is sodium, magenta, cyan and a sick green.
  const NEON=(N.colours||['#ff2e6b','#12e6ff','#ffc21e','#b14bff','#25ff92','#ff6a1e','#ff1e3c','#57d0ff']).map(h=>new THREE.Color(h));
  const pickNeon=()=>NEON[Math.floor(NR()*NEON.length)];
  const lit=[];   // everything that brightens after dark, dimmed again by day

  // ---- facade neon: vertical signs bolted to whatever wall faces the street ----
  let signs=0;
  {const want=N.signs||0;
   const barG=new THREE.BoxGeometry(0.5,1,0.5),panelG=new THREE.BoxGeometry(0.28,1,1);
   const barM=new THREE.MeshBasicMaterial({vertexColors:true}),panM=new THREE.MeshBasicMaterial({vertexColors:true});
   const bars=new THREE.InstancedMesh(barG,barM,Math.max(1,want)),pans=new THREE.InstancedMesh(panelG,panM,Math.max(1,want));
   const streets=ROADS.filter(r=>r.c==='residential'||r.c==='secondary'||r.c==='tertiary');
   const STEP=N.signStep||11;
   for(let pass=0;pass<3&&signs<want;pass++)for(const r of streets){if(signs>=want)break;
     for(let i=0;i+1<r.pts.length&&signs<want;i++){
       const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<6)continue;
       const dx=(bx-ax)/L,dz=(bz-az)/L;
       for(let u=NR()*STEP;u<L&&signs<want;u+=STEP){if(NR()>0.55)continue;
       const sd=NR()<0.5?-1:1;
       const px=ax+dx*u-dz*sd*(r.w/2+1.4),pz=az+dz*u+dx*sd*(r.w/2+1.4);
       if(!inMap(px,pz,10)||inWater(px,pz))continue;
       const roof=roofAt(px-dz*sd*3,pz+dx*sd*3)||roofAt(px-dz*sd*6,pz+dx*sd*6);if(roof<8)continue;
       const gy=groundH(px,pz),head=Math.atan2(dz,dx),c=pickNeon();
       const hh=3+NR()*Math.min(16,roof-6),y=gy+4+NR()*Math.max(1,roof-hh-6);
       D.position.set(px,y,pz);D.rotation.set(0,-head,0);D.scale.set(1,hh,1);D.updateMatrix();
       bars.setMatrixAt(signs,D.matrix);bars.setColorAt(signs,c);
       D.scale.set(1,hh*0.82,1.1+NR()*1.8);D.updateMatrix();
       pans.setMatrixAt(signs,D.matrix);pans.setColorAt(signs,cc.copy(c).multiplyScalar(0.55));
       signs++;}}}
   bars.count=pans.count=signs;if(signs){scene.add(bars,pans);lit.push(barM,panM);}}

  // ---- billboards: the big ones, high on the core towers, cycling through their own light ----
  const boards=[];
  {const want=N.billboards||0,fm=[];
   for(let k=0;k<want;k++){
     let px=0,pz=0,roof=0,tries=0;
     do{px=(NR()-0.5)*(B.w*0.6)+B.cx;pz=(NR()-0.5)*(B.d*0.6)+B.cz;roof=roofAt(px,pz);tries++;}while(roof<40&&tries<60);
     if(roof<40)continue;
     const w=18+NR()*34,h=10+NR()*22,y=groundH(px,pz)+18+NR()*Math.max(4,roof-30),a=NR()*Math.PI*2;
     const m=new THREE.MeshBasicMaterial({color:pickNeon().clone(),transparent:true,opacity:0.95});
     const face=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);
     face.position.set(px+Math.cos(a)*2,y,pz+Math.sin(a)*2);face.rotation.y=-a+Math.PI/2;
     const frame=new THREE.Mesh(new THREE.BoxGeometry(w+2,h+2,1),new THREE.MeshLambertMaterial({color:0x14161a}));
     frame.position.copy(face.position).addScaledVector(new THREE.Vector3(Math.cos(a),0,Math.sin(a)),-0.7);
     frame.rotation.y=face.rotation.y;
     scene.add(face,frame);boards.push({m,base:m.color.clone(),ph:NR()*6.28,sp:0.4+NR()*1.6});fm.push(m);}
   if(boards.length)animHooks.push(now=>{const t=now/1000;
     for(const b of boards){const k=0.55+0.45*Math.sin(t*b.sp+b.ph);b.m.color.copy(b.base).multiplyScalar(0.35+0.85*k);}});
   lit.push(...fm);}

  // ---- holograms: slow turning shapes hung over the junctions, translucent and far too large ----
  {const want=N.holograms||0,hm=[];
   for(let k=0;k<want;k++){
     let px=0,pz=0,tries=0;
     do{px=(NR()-0.5)*(B.w*0.5)+B.cx;pz=(NR()-0.5)*(B.d*0.5)+B.cz;tries++;}while((inWater(px,pz)||roofAt(px,pz)>4)&&tries<60);
     if(inWater(px,pz))continue;
     const m=new THREE.MeshBasicMaterial({color:pickNeon().clone(),transparent:true,opacity:0.15,depthWrite:false,side:THREE.DoubleSide});
     const r=11+NR()*19,g=new THREE.Group();
     for(let q=0;q<4;q++){const ring=new THREE.Mesh(new THREE.TorusGeometry(r*(0.5+q*0.18),0.8,4,22),m);
       ring.rotation.x=Math.PI/2;ring.position.y=q*r*0.36;g.add(ring);}
     const col=new THREE.Mesh(new THREE.CylinderGeometry(r*0.22,r*0.3,r*1.5,8,1,true),m);col.position.y=r*0.6;g.add(col);
     g.position.set(px,groundH(px,pz)+30+NR()*40,pz);scene.add(g);
     hm.push(m);animHooks.push(now=>{g.rotation.y=now*0.00018*(1+NR()*0);});}
   lit.push(...hm);}

  // ---- spinners: traffic in the air, in lanes, going somewhere at a steady clip ----
  const spinners=[];
  {const want=N.spinners||0;
   const bodyG=new THREE.BoxGeometry(5.4,1.5,2.4),finG=new THREE.BoxGeometry(1.6,0.5,4.4);
   const bodyM=new THREE.MeshLambertMaterial({color:0x1b1e24}),
         headM=new THREE.MeshBasicMaterial({color:0xfff0c8}),tailM=new THREE.MeshBasicMaterial({color:0xff2a2a});
   const bodies=new THREE.InstancedMesh(bodyG,bodyM,Math.max(1,want)),fins=new THREE.InstancedMesh(finG,bodyM,Math.max(1,want)),
         heads=new THREE.InstancedMesh(new THREE.SphereGeometry(0.55,6,5),headM,Math.max(1,want)),
         tails=new THREE.InstancedMesh(new THREE.SphereGeometry(0.45,6,5),tailM,Math.max(1,want));
   for(const m of [bodies,fins,heads,tails])m.frustumCulled=false;
   const LANES=N.lanes||[70,120,180,250];
   for(let k=0;k<want;k++){const lane=LANES[k%LANES.length],a=NR()*Math.PI*2,r=300+NR()*1700;
     spinners.push({y:lane+NR()*18,a,r,cx:B.cx+(NR()-0.5)*500,cz:B.cz+(NR()-0.5)*500,
       v:(NR()<0.5?-1:1)*(0.00006+NR()*0.00007),bob:NR()*6.28});}
   bodies.count=fins.count=heads.count=tails.count=spinners.length;
   if(spinners.length)scene.add(bodies,fins,heads,tails);
   animHooks.push(now=>{
     spinners.forEach((s,i)=>{const a=s.a+now*s.v,x=s.cx+Math.cos(a)*s.r,z=s.cz+Math.sin(a)*s.r,
       y=s.y+Math.sin(now*0.0004+s.bob)*3,head=a+(s.v>0?Math.PI/2:-Math.PI/2);
       D.position.set(x,y,z);D.rotation.set(0,-head,0.06*Math.sin(now*0.0007+s.bob));D.scale.set(1,1,1);D.updateMatrix();
       bodies.setMatrixAt(i,D.matrix);fins.setMatrixAt(i,D.matrix);
       D.position.set(x+Math.cos(head)*3.1,y,z+Math.sin(head)*3.1);D.updateMatrix();heads.setMatrixAt(i,D.matrix);
       D.position.set(x-Math.cos(head)*3.1,y,z-Math.sin(head)*3.1);D.updateMatrix();tails.setMatrixAt(i,D.matrix);});
     for(const m of [bodies,fins,heads,tails])m.instanceMatrix.needsUpdate=true;});}

  // ---- flare stacks: the flats burn off whatever they are making out there ----
  let flares=0;
  {const m=new THREE.MeshLambertMaterial({color:0x3f3b36}),fires=[];
   const flameM=[0,1,2].map(()=>new THREE.MeshBasicMaterial({color:0xff8420,transparent:true,opacity:0.9}));
   const smokeM=new THREE.MeshLambertMaterial({color:0x2a2724,transparent:true,opacity:0.3,depthWrite:false});
   for(const a of AREAS){if(a.kind!=='industrial')continue;
     for(let k=0;k<(N.flares||0)/2&&flares<(N.flares||0);k++){
       const px=a.bb.x0+NR()*(a.bb.x1-a.bb.x0),pz=a.bb.z0+NR()*(a.bb.z1-a.bb.z0);
       if(!inMap(px,pz,40)||inWater(px,pz))continue;
       const gy=groundH(px,pz),H=60+NR()*70;
       const st=new THREE.Mesh(new THREE.CylinderGeometry(2.4,4.2,H,10).translate(0,H/2,0),m);st.position.set(px,gy,pz);scene.add(st);
       for(let q=0;q<3;q++){const leg=new THREE.Mesh(new THREE.BoxGeometry(0.7,H*0.7,0.7).translate(0,H*0.35,0),m);
         const aa=q/3*Math.PI*2;leg.position.set(px+Math.cos(aa)*6,gy,pz+Math.sin(aa)*6);leg.rotation.set(Math.sin(aa)*0.1,0,-Math.cos(aa)*0.1);scene.add(leg);}
       const fm=flameM[flares%3];
       const fl=new THREE.Mesh(new THREE.ConeGeometry(3.4,16,8).translate(0,8,0),fm);fl.position.set(px,gy+H,pz);scene.add(fl);
       const sm=[];for(let q=0;q<4;q++){const p=new THREE.Mesh(new THREE.SphereGeometry(7,7,5),smokeM);p.position.set(px,gy+H,pz);scene.add(p);sm.push(p);}
       const lamp=new THREE.PointLight(0xff7a20,0,260);lamp.position.set(px,gy+H+8,pz);scene.add(lamp);
       fires.push({fl,sm,px,pz,gy,H,lamp,ph:NR()*6.28});flares++;}}
   if(fires.length)animHooks.push(now=>{const n=nightF(hourCur);
     for(const f of fires){const k=0.65+0.35*Math.sin(now*0.009+f.ph)+0.18*Math.sin(now*0.023+f.ph*2);
       f.fl.scale.set(0.75+0.35*k,k,0.75+0.35*k);f.lamp.intensity=(0.5+0.6*n)*k;
       f.sm.forEach((p,i)=>{const t=((now/6000)+i/4+f.ph)%1;p.position.set(f.px+t*40,f.gy+f.H+8+t*90,f.pz+t*16);p.scale.setScalar(1+t*3.6);});}
     for(let i=0;i<3;i++)flameM[i].opacity=0.75+0.25*Math.sin(now*0.011+i*2);
     smokeM.opacity=0.26;});}

  // ---- steam off the gratings ----
  {const want=N.steam||0,cols=[];
   const sm=new THREE.MeshBasicMaterial({color:0xb9c3cc,transparent:true,opacity:0.12,depthWrite:false});
   for(let k=0;k<want;k++){const r=ROADS[Math.floor(NR()*ROADS.length)];if(!r||r.pts.length<2)continue;
     const i=Math.floor(NR()*(r.pts.length-1)),[ax,az]=r.pts[i];
     const px=ax+(NR()-0.5)*r.w,pz=az+(NR()-0.5)*r.w;
     if(!inMap(px,pz,10)||inWater(px,pz))continue;
     const g=new THREE.Mesh(new THREE.CylinderGeometry(1.4,3.4,14,7,1,true).translate(0,7,0),sm);
     g.position.set(px,groundH(px,pz),pz);scene.add(g);cols.push({g,ph:NR()*6.28});}
   if(cols.length)animHooks.push(now=>{for(const c of cols){const k=0.7+0.3*Math.sin(now*0.0011+c.ph);
     c.g.scale.set(k,1+0.25*Math.sin(now*0.0008+c.ph),k);}});}

  // ---- rain: a column of streaks that rides along with the camera ----
  if(N.rain){const nDrops=N.rain,pos=new Float32Array(nDrops*6),vel=new Float32Array(nDrops),len=new Float32Array(nDrops);
   const SPREAD=150,TOP=90;
   for(let i=0;i<nDrops;i++){const x=(NR()-0.5)*SPREAD,y=NR()*TOP,z=(NR()-0.5)*SPREAD;
     vel[i]=58+NR()*46;len[i]=1.4+NR()*1.8;
     pos[i*6]=x;pos[i*6+1]=y;pos[i*6+2]=z;pos[i*6+3]=x+0.25;pos[i*6+4]=y-len[i];pos[i*6+5]=z;}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
   const rm=new THREE.LineBasicMaterial({color:0x8fa4b8,transparent:true,opacity:0.3,depthWrite:false});
   const streaks=new THREE.LineSegments(g,rm);streaks.frustumCulled=false;scene.add(streaks);
   let last=performance.now();
   animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;
     for(let i=0;i<nDrops;i++){let y=pos[i*6+1]-vel[i]*dt;
       if(y<-4){y=TOP;const x=(NR()-0.5)*SPREAD,z=(NR()-0.5)*SPREAD;pos[i*6]=x;pos[i*6+2]=z;pos[i*6+3]=x+0.25;pos[i*6+5]=z;}
       pos[i*6+1]=y;pos[i*6+4]=y-len[i];}
     g.attributes.position.needsUpdate=true;
     streaks.position.set(camera.position.x,camera.position.y-TOP*0.5,camera.position.z);
     rm.opacity=0.12+0.2*nightF(hourCur);});}

  // everything neon fades back in the daylight it never really gets, scaled from whatever it was built at
  // rather than set outright - a hologram is meant to stay a ghost after dark, not turn into a solid slab
  {const base=lit.map(m=>(m.opacity===undefined?1:m.opacity));
   animHooks.push(()=>{const n=0.35+0.65*nightF(hourCur);
     lit.forEach((m,i)=>{if(m.transparent)m.opacity=base[i]*n;});});}
  ctx.details=Object.assign(ctx.details||{},{neonSigns:signs,billboards:boards.length,spinners:spinners.length,flares});
});
