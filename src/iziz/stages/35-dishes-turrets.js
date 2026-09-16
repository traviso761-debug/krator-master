// ---------- rotating satellite dishes on the four tallest towers, slow-traversing gun turrets ----------
const chosen=lots.filter(l=>l.dish);
const dishM=new THREE.MeshLambertMaterial({color:0xd8d4cc});dishM.userData.tex='metal';
const dishes=[];
for(const l of chosen){const y=terrainH(l.x,l.z)-0.6+l.h*1.44,g=new THREE.Group();g.position.set(l.x,y,l.z);
  g.add(mesh(boxG,wallDarkM,0,0,0,2.2,1,2.2,0));g.add(mesh(cyl(0.35,0.5,3.2,8),dishM,0,2.6,0,1,1,1,0));
  const yaw=new THREE.Group();yaw.userData.dynamic=true;yaw.position.y=4.2;g.add(yaw);const tilt=new THREE.Group();tilt.rotation.x=-0.9;yaw.add(tilt);
  tilt.add(mesh(cyl(3.4,1.0,1.1,18),dishM,0,0.55,0,1,1,1,0));tilt.add(mesh(cyl(0.1,0.12,3.2,6),shipDarkM,0,2.2,0,1,1,1,0));tilt.add(mesh(boxG,glowM,0,3.7,0,0.4,0.4,0.4,0));
  yaw.userData.rate=rr(0.15,0.35)*(rnd()<0.5?1:-1);dishes.push(yaw);scene.add(g);}
ctx.dishes=chosen.map(l=>[l.x|0,l.z|0]);
animHooks.push(now=>{for(const d of dishes)d.rotation.y=now*0.001*d.userData.rate;
  const T=scene.userData.turrets||[];T.forEach((t,i)=>{t.rotation.y=(t.userData.base===undefined?(t.userData.base=t.rotation.y):t.userData.base)+Math.sin(now*0.0004+i*1.3)*0.5;});});
});
await stage('coords');
section('coords',()=>{
