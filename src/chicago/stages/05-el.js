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
  ctx.details.trains=EL.trains;
});
