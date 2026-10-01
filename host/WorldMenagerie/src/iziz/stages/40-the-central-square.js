// ---------- the central square: ring pool around the statue, benches, a ring of lamp columns, four light masts ----------
const y=terrainH(0,0)-0.2;const g=new THREE.Group();g.position.set(0,y,0);
const waterM=new THREE.MeshBasicMaterial({color:0x5cc4ff,transparent:true,opacity:0.85});
const pool=new THREE.Mesh(new THREE.RingGeometry(9.6,13.2,40),waterM);pool.rotation.x=-Math.PI/2;pool.position.y=0.9;g.add(pool);
[13.5,9.4].forEach(r=>{const rim=mesh(torus(r,0.45,8,48),sandLightM,0,1.0,0,1,1,1,0);rim.rotation.x=Math.PI/2;g.add(rim);});
for(let k=0;k<8;k++){const t=k*Math.PI/4+Math.PI/8;g.add(mesh(cyl(0.12,0.12,2.2,6),sandLightM,11.4*Math.cos(t),1.4,11.4*Math.sin(t),1,1,1,0));const j=mesh(sph(0.35,8,6),waterM,11.4*Math.cos(t),2.6,11.4*Math.sin(t),1,1,1,0);g.add(j);}   // jets
for(let k=0;k<8;k++){const t=k*Math.PI/4;g.add(mesh(boxG,sandM,17.5*Math.cos(t),0,17.5*Math.sin(t),3.6,0.8,1.2,-t+Math.PI/2));g.add(mesh(boxG,lamC(0x8a6a3a),17.5*Math.cos(t),0.8,17.5*Math.sin(t),3.4,0.25,1.1,-t+Math.PI/2));}   // benches
const colM=new THREE.MeshLambertMaterial({color:0xe2b676});colM.userData.tex='sand';
for(let k=0;k<12;k++){const t=k*Math.PI/6+Math.PI/12;const x=26.5*Math.cos(t),z=26.5*Math.sin(t);
  g.add(mesh(cyl(0.55,0.75,7,8),colM,x,3.5,z,1,1,1,0));g.add(mesh(boxG,gateTopM,x,7,z,1.8,0.5,1.8,0));
  const gl=mesh(sph(0.5,8,6),glowM,x,7.8,z,1,1,1,0);gl.userData.glowSize=8;gl.userData.sched=1;gl.userData.lightT=[17.6+k*0.025,29.6+k*0.02,-1];g.add(gl);}   // lamp columns, lit one after another around the ring
const masts=[];for(let k=0;k<4;k++){const t=k*Math.PI/2+Math.PI/4;const x=23*Math.cos(t),z=23*Math.sin(t);
  g.add(mesh(cyl(0.4,0.6,16,8),wallDarkM,x,8,z,1,1,1,0));g.add(mesh(boxG,wallDarkM,x,16,z,3,0.6,0.6,-t+Math.PI/2));
  const lt=[17.95+k*0.07,29.5+k*0.05,-1];const gl=mesh(sph(0.9,8,6),glowM,x,16.4,z,1,1,1,0);gl.userData.glowSize=13;gl.userData.sched=1;gl.userData.lightT=lt;g.add(gl);
  const L=new THREE.PointLight(0xffe0b8,0,110,1.4);L.position.set(x,y+16,z);L.userData.t=lt;scene.add(L);masts.push(L);}
scene.add(g);
animHooks.push(()=>{const nf=nightF(ctx.hour||0);for(const L of masts)L.intensity=1.3*litAt(ctx.hour||0,L.userData.t[0],L.userData.t[1]);});
});
