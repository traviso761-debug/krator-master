// ---------- the L: the Loop's elevated tracks on their columns, and the trains that circle them ----------
await stage('el');
section('el',()=>{
  const H=EL.height,W=EL.east-EL.west,D=EL.south-EL.north,cx=(EL.east+EL.west)/2,cz=(EL.north+EL.south)/2;
  const rail=(x,z,w,d)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,1.2,d),steelM);b.position.set(x,H,z);b.castShadow=true;scene.add(b);};
  rail(cx,EL.north,W+12,12);rail(cx,EL.south,W+12,12);rail(EL.west,cz,12,D);rail(EL.east,cz,12,D);
  // columns every 15 m, in the street
  const cols=[];for(let x=EL.west;x<=EL.east;x+=15){cols.push([x,EL.north]);cols.push([x,EL.south]);}for(let z=EL.north+15;z<EL.south;z+=15){cols.push([EL.west,z]);cols.push([EL.east,z]);}
  const cm=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5,0.6,1,6),steelM,cols.length*2),d=new THREE.Object3D();
  cols.forEach(([x,z],i)=>{for(const s of [-1,1]){const on=Math.abs(z-EL.north)<1||Math.abs(z-EL.south)<1;d.position.set(x+(on?0:s*5),H/2,z+(on?s*5:0));d.scale.set(1,H,1);d.updateMatrix();cm.setMatrixAt(i*2+(s>0?1:0),d.matrix);}});
  cm.castShadow=true;scene.add(cm);
  // trains: EL.trains of EL.cars cars, half each way, on the perimeter
  const P=2*(W+D),carL=15,carG=1.2,N=EL.trains*EL.cars;
  const carM=new THREE.MeshLambertMaterial({color:0xd8dde3,emissive:0x000000}),tm=new THREE.InstancedMesh(new THREE.BoxGeometry(carL,3.4,3.2),carM,N);tm.castShadow=true;tm.userData.life=true;scene.add(tm);
  const trains=[];for(let t=0;t<EL.trains;t++)trains.push({s:t*P/EL.trains,dir:t%2?1:-1,v:11+t*0.7,stop:0});
  const at=(s,side)=>{s=((s%P)+P)%P;const o=side*4;   // a point on the rectangle, offset to the inner or outer track
    if(s<W)return [EL.west+s,EL.north+o,0];s-=W;if(s<D)return [EL.east-o,EL.north+s,Math.PI/2];s-=D;if(s<W)return [EL.east-s,EL.south-o,0];s-=W;return [EL.west+o,EL.south-s,Math.PI/2];};
  let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;let i=0;
    for(const tr of trains){if(tr.stop>0)tr.stop-=dt;else{tr.s+=tr.dir*tr.v*dt;if(Math.floor(tr.s/ (P/8))!==Math.floor((tr.s-tr.dir*tr.v*dt)/(P/8)))tr.stop=3+Math.random()*2;}   // a short stop every eighth of the loop
      for(let c=0;c<EL.cars;c++){const [x,z,a]=at(tr.s-tr.dir*c*(carL+carG),tr.dir);d.position.set(x,H+2.4,z);d.rotation.set(0,a,0);d.scale.set(1,1,1);d.updateMatrix();tm.setMatrixAt(i++,d.matrix);}}
    tm.instanceMatrix.needsUpdate=true;const w=windowF(hourCur);carM.emissive.setRGB(w*0.9,w*0.85,w*0.6);});
  ctx.details=Object.assign(ctx.details||{},{trains:EL.trains});
});
// the Blue Line: up out of the Milwaukee Avenue subway and onto its steel viaduct past Damen, with the station platforms and canopies
section('blue-line',()=>{const BL=EL.blue;if(!BL)return;
  const r=polyLen0({pts:BL.pts}),H=BL.height,blueM=new THREE.MeshLambertMaterial({color:0x2a5aa8});
  const d=new THREE.Object3D(),cols=[];
  for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az),ang=Math.atan2(bz-az,bx-ax);
    const deck=new THREE.Mesh(new THREE.BoxGeometry(L,1.4,10),steelM);deck.position.set((ax+bx)/2,H,(az+bz)/2);deck.rotation.y=-ang;deck.castShadow=true;scene.add(deck);
    for(let s=0;s<L;s+=16)for(const sd of [-1,1]){const x=ax+(bx-ax)*s/L,z=az+(bz-az)*s/L;cols.push([x-Math.sin(ang)*sd*4,z+Math.cos(ang)*sd*4]);}}
  {const cm=new THREE.InstancedMesh(new THREE.BoxGeometry(0.7,1,0.7).translate(0,0.5,0),steelM,cols.length);cols.forEach(([x,z],i)=>{d.position.set(x,0,z);d.rotation.set(0,0,0);d.scale.set(1,H-0.7,1);d.updateMatrix();cm.setMatrixAt(i,d.matrix);});cm.castShadow=true;scene.add(cm);}
  // the portal where the tracks come up from the subway
  {const [x,z]=r.pts[0],[x2,z2]=r.pts[1],ang=Math.atan2(z2-z,x2-x),ramp=new THREE.Mesh(new THREE.BoxGeometry(60,H,11),new THREE.MeshLambertMaterial({color:0x8a847a}));ramp.position.set(x+Math.cos(ang)*30,H/2-0.7,z+Math.sin(ang)*30);ramp.rotation.set(0,-ang,Math.atan2(H,60));scene.add(ramp);}
  // stations: side platforms with canopies, a stair tower down to the street
  for(const [sx,sz,name] of BL.stations){const s=nearestS(r,sx,sz),[x,z,ang]=polyAt0(r,s);const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=-ang;
    if(name==='Division'){const head=new THREE.Mesh(new THREE.BoxGeometry(8,3.2,6),blueM);head.position.set(0,1.6,12);g.add(head);}   // the subway entrance
    else{for(const sd of [-1,1]){const plat=new THREE.Mesh(new THREE.BoxGeometry(130,0.9,4),stoneM);plat.position.set(0,H+0.2,sd*7);const can=new THREE.Mesh(new THREE.BoxGeometry(90,0.3,4.6),blueM);can.position.set(0,H+3.8,sd*7.2);
        const post1=new THREE.Mesh(new THREE.BoxGeometry(0.3,3.4,0.3),steelM);post1.position.set(-40,H+2.1,sd*8.8);const post2=post1.clone();post2.position.x=40;g.add(plat,can,post1,post2);}
      const stair=new THREE.Mesh(new THREE.BoxGeometry(10,H+4,7),blueM);stair.position.set(-58,(H+4)/2,13);const sign=new THREE.Mesh(new THREE.BoxGeometry(3,1,0.2),new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x333333}));sign.position.set(-58,H+5,16.6);g.add(stair,sign);}
    g.userData.info={name:name+' (Blue Line)',info:name==='Damen'?'1558 N Milwaukee Ave · 1895 · an elevated station on the Blue Line to O’Hare, rebuilt in 2019, right at the six corners.':'1200 N Milwaukee Ave · the subway station at Division, Milwaukee and Ashland.'};
    g.traverse(o=>{o.userData.info=g.userData.info;});LANDMARKS.push(g);scene.add(g);}
  // trains: silver cars with a blue stripe, one each way, slowing through the station
  const carL=15,N=BL.trains*BL.cars,carM=new THREE.MeshLambertMaterial({color:0xd0d6dc,emissive:0x000000}),tm=new THREE.InstancedMesh(new THREE.BoxGeometry(carL,3.4,3.2),carM,N);tm.castShadow=true;tm.userData.life=true;tm.frustumCulled=false;scene.add(tm);
  const trains=[];for(let t=0;t<BL.trains;t++)trains.push({s:t*r.len/BL.trains,dir:t%2?1:-1,v:13});
  const stS=BL.stations.map(([sx,sz])=>nearestS(r,sx,sz));let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;let i=0;
    for(const tr of trains){const near=stS.some(s=>Math.abs(s-tr.s)<120);tr.s+=tr.dir*(near?5:tr.v)*dt;if(tr.s>r.len-10){tr.dir=-1;}if(tr.s<10+carL*BL.cars){tr.dir=1;}
      for(let c=0;c<BL.cars;c++){const [x,z,a]=polyAt0(r,tr.s-tr.dir*c*(carL+1.2)),sd=tr.dir;d.position.set(x-Math.sin(a)*sd*2.3,H+2.5,z+Math.cos(a)*sd*2.3);d.rotation.set(0,-a,0);d.scale.set(1,1,1);d.updateMatrix();tm.setMatrixAt(i++,d.matrix);}}
    tm.instanceMatrix.needsUpdate=true;const w=windowF(hourCur);carM.emissive.setRGB(w*0.9,w*0.85,w*0.6);});
  LANDMARKS.push(...TRAIL_INFO);
  ctx.details=Object.assign(ctx.details||{},{blueLineStations:BL.stations.length});
});
function polyLen0(r){let L=0;r.cum=[0];for(let i=0;i+1<r.pts.length;i++){L+=Math.hypot(r.pts[i+1][0]-r.pts[i][0],r.pts[i+1][1]-r.pts[i][1]);r.cum.push(L);}r.len=L;return r;}
function polyAt0(r,s){s=Math.max(0,Math.min(r.len,s));let i=0;while(i<r.cum.length-2&&r.cum[i+1]<s)i++;const a=r.pts[i],b=r.pts[i+1],u=(s-r.cum[i])/((r.cum[i+1]-r.cum[i])||1);return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,Math.atan2(b[1]-a[1],b[0]-a[0])];}
function nearestS(r,x,z){let best=0,bd=1e9;for(let s=0;s<=r.len;s+=4){const [px,pz]=polyAt0(r,s),dd=Math.hypot(px-x,pz-z);if(dd<bd){bd=dd;best=s;}}return best;}
