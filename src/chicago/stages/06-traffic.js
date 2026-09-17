// ---------- traffic: cars on the major streets and Lake Shore Drive, tour boats following the river, sails on the lake ----------
await stage('traffic');
section('traffic',()=>{
  // routes: every major street (and each diagonal) as a polyline; cars run both ways, one lane each side
  const routes=[];
  for(const s of STREETS)if(s.major&&s.axis!=='d')routes.push({pts:[s.a,s.b],w:s.w});
  for(const d of DIAGONALS)routes.push({pts:d.pts,w:d.w});
  for(const r of routes){let L=0;r.cum=[0];for(let i=0;i+1<r.pts.length;i++){L+=Math.hypot(r.pts[i+1][0]-r.pts[i][0],r.pts[i+1][1]-r.pts[i][1]);r.cum.push(L);}r.len=L;}
  const at=(r,s)=>{s=((s%r.len)+r.len)%r.len;let i=0;while(i<r.cum.length-2&&r.cum[i+1]<s)i++;const a=r.pts[i],b=r.pts[i+1],u=(s-r.cum[i])/((r.cum[i+1]-r.cum[i])||1);
    return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,Math.atan2(b[1]-a[1],b[0]-a[0])];};
  // what the road is at every 5 m, worked out once: 0 = none (lake, river with no bridge, off the map), 1 = street, 2 = bridge deck
  for(const r of routes){r.st=new Uint8Array(Math.ceil(r.len/5)+1);for(let k=0;k<r.st.length;k++){const [x,z]=at(r,k*5);r.st[k]=inLake(x,z)||Math.abs(x)>HALF-20||Math.abs(z)>HALF-20?0:inRiver(x,z)?(onBridge(x,z)?2:0):1;}}
  const cars=[];for(const r of routes){const n=Math.floor(r.len/70);for(const dir of [-1,1])for(let k=0;k<n;k++)cars.push({r,dir,s:xr()*r.len,v:9+xr()*7,off:dir*r.w/4});}
  const cm=new THREE.InstancedMesh(new THREE.BoxGeometry(4.4,1.5,2),new THREE.MeshLambertMaterial({color:0xffffff}),cars.length),d=new THREE.Object3D(),col=new THREE.Color();
  cars.forEach((c,i)=>cm.setColorAt(i,col.setHSL(xr(),0.45,0.3+xr()*0.4)));cm.userData.life=true;cm.frustumCulled=false;scene.add(cm);
  let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;
    for(let i=0;i<cars.length;i++){const c=cars[i];c.s+=c.dir*c.v*dt;const [x0,z0,a]=at(c.r,c.s),x=x0-Math.sin(a)*c.off,z=z0+Math.cos(a)*c.off;
      const st=c.r.st[Math.round((((c.s%c.r.len)+c.r.len)%c.r.len)/5)],y=st===2?6.2:0.8,sc=st?1:0;   // hidden where there is no road
      d.position.set(x,y,z);d.rotation.set(0,-a,0);d.scale.setScalar(sc);d.updateMatrix();cm.setMatrixAt(i,d.matrix);}
    cm.instanceMatrix.needsUpdate=true;});
  // tour boats: up and down the three branches, along the river's own bends
  const boatM=new THREE.MeshLambertMaterial({color:0xf0ede6}),roofM=new THREE.MeshLambertMaterial({color:0x3a5f8a}),sailM=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});
  const boats=[];RIVERS.forEach((rv,ri)=>{const r={pts:rv.pts};let L=0;r.cum=[0];for(let i=0;i+1<r.pts.length;i++){L+=Math.hypot(r.pts[i+1][0]-r.pts[i][0],r.pts[i+1][1]-r.pts[i][1]);r.cum.push(L);}r.len=L;
    for(let k=0;k<(ri===0?4:2);k++){const b=new THREE.Mesh(new THREE.BoxGeometry(24,3,6),boatM);const top=new THREE.Mesh(new THREE.BoxGeometry(16,2,4),roofM);top.position.set(-2,2.5,0);b.add(top);b.castShadow=true;scene.add(b);
      boats.push({m:b,r,s:(k+0.5)/4*L,dir:k%2?1:-1,v:3.5+xr()*2,off:rv.width*0.2});}});
  const sails=[];for(let k=0;k<18;k++){const g=new THREE.Group();const hull=new THREE.Mesh(new THREE.BoxGeometry(8,1.6,2.6),boatM);hull.position.y=0.6;const sail=new THREE.Mesh(new THREE.ConeGeometry(2.5,11,3),sailM);sail.position.set(0.5,7,0);g.add(hull,sail);scene.add(g);
    let x=0,z=0;for(let t=0;t<40;t++){x=xrr(PIER.x0,HALF-150);z=xrr(-HALF+200,HALF-200);if(inLake(x,z)&&!inLake(x-120,z)===false)break;}sails.push({g,x,z,a:xr()*6.28,v:1.5+xr()*2});}
  let lastB=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-lastB)/1000);lastB=now;
    for(const b of boats){b.s+=b.dir*b.v*dt;if(b.s>b.r.len-40){b.s=b.r.len-40;b.dir=-1;}if(b.s<40){b.s=40;b.dir=1;}const [x,z,a]=at(b.r,b.s);b.m.position.set(x-Math.sin(a)*b.off*b.dir,1.2,z+Math.cos(a)*b.off*b.dir);b.m.rotation.y=-a+(b.dir>0?0:Math.PI);}
    for(const s of sails){s.a+=(xr()-0.5)*0.4*dt;const nx=s.x+Math.cos(s.a)*s.v*dt,nz=s.z+Math.sin(s.a)*s.v*dt;if(inLake(nx,nz)&&inLake(nx-60,nz)&&Math.abs(nz)<HALF-100&&nx<HALF-80){s.x=nx;s.z=nz;}else s.a+=Math.PI*0.6;
      s.g.position.set(s.x,0.3+Math.sin(now*0.002+s.x)*0.15,s.z);s.g.rotation.y=-s.a;s.g.rotation.z=0.12*Math.sin(now*0.0015+s.z);}});
  ctx.details.cars=cars.length;ctx.details.boats=boats.length+sails.length;
});
