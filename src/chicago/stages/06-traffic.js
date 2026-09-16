// ---------- traffic: cars on the wide streets, tour boats on the river, sails on the lake ----------
await stage('traffic');
section('traffic',()=>{
  const lanes=[];for(const m of MAJOR){const len=m.axis==='x'?WORLD:SHORE+WORLD/2;const n=Math.floor(len/38);for(const dir of [-1,1])lanes.push({m,dir,n,len,off:dir*(m.w/4)});}
  const cars=[];for(const ln of lanes)for(let k=0;k<ln.n;k++)cars.push({ln,s:xr()*ln.len,v:9+xr()*7,col:new THREE.Color().setHSL(xr(),0.5,0.35+xr()*0.35)});
  const cm=new THREE.InstancedMesh(new THREE.BoxGeometry(4.4,1.5,2),new THREE.MeshLambertMaterial({color:0xffffff}),cars.length),d=new THREE.Object3D();
  cars.forEach((c,i)=>cm.setColorAt(i,c.col));cm.userData.life=true;cm.userData.noShadow=true;scene.add(cm);
  const carPos=c=>{const m=c.ln.m,s=((c.s%c.ln.len)+c.ln.len)%c.ln.len;if(m.axis==='x')return [m.at+c.ln.off,s-WORLD/2,Math.PI/2];return [s-WORLD/2,m.at+c.ln.off,0];};
  let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;
    for(let i=0;i<cars.length;i++){const c=cars[i];c.s+=c.ln.dir*c.v*dt;const [x,z,a]=carPos(c);const y=inRiver(x,z)?5.5:0.8;d.position.set(x,y,z);d.rotation.set(0,a,0);d.updateMatrix();cm.setMatrixAt(i,d.matrix);}
    cm.instanceMatrix.needsUpdate=true;});
  // boats: tour boats along the main stem, sailboats out on the lake
  const boatM=new THREE.MeshLambertMaterial({color:0xf0ede6}),sailM=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});
  const boats=[];for(let k=0;k<5;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(24,3,6),boatM);b.position.y=1.2;const top=new THREE.Mesh(new THREE.BoxGeometry(16,2,4),new THREE.MeshLambertMaterial({color:0x3a5f8a}));top.position.set(-2,2.5,0);b.add(top);b.castShadow=true;scene.add(b);boats.push({m:b,s:k*300+xr()*200,dir:k%2?1:-1,v:4+xr()*2});}
  const sails=[];for(let k=0;k<14;k++){const g=new THREE.Group();const hull=new THREE.Mesh(new THREE.BoxGeometry(8,1.6,2.6),boatM);hull.position.y=0.6;const sail=new THREE.Mesh(new THREE.ConeGeometry(2.5,11,3),sailM);sail.position.set(0.5,7,0);g.add(hull,sail);scene.add(g);
    sails.push({g,x:SHORE+120+xr()*800,z:-1700+xr()*3000,a:xr()*6.28,v:1.5+xr()*2});}
  let lastB=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-lastB)/1000);lastB=now;
    for(const b of boats){b.s+=b.dir*b.v*dt;const span=RM.xEast-RM.xWest-120;if(b.s>span){b.s=span;b.dir=-1;}if(b.s<0){b.s=0;b.dir=1;}b.m.position.set(RM.xWest+60+b.s,1.2,RM.z+(b.dir>0?-12:12));b.m.rotation.y=b.dir>0?0:Math.PI;}
    for(const s of sails){s.a+=(xr()-0.5)*0.4*dt;s.x+=Math.cos(s.a)*s.v*dt;s.z+=Math.sin(s.a)*s.v*dt;if(s.x<SHORE+80)s.a=0;if(s.x>WORLD/2-80)s.a=Math.PI;if(s.z<-WORLD/2+80)s.a=Math.PI/2;if(s.z>WORLD/2-80)s.a=-Math.PI/2;
      if(s.x<PIER.x+PIER.length+30&&Math.abs(s.z-PIER.z)<PIER.width/2+30)s.z+=(s.z<PIER.z?-1:1)*20*dt;s.g.position.set(s.x,0.3+Math.sin(now*0.002+s.x)*0.15,s.z);s.g.rotation.y=-s.a;s.g.rotation.z=0.12*Math.sin(now*0.0015+s.z);}});
  ctx.details.cars=cars.length;ctx.details.boats=boats.length+sails.length;
});
