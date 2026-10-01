// ---------- park amphitheatre: stage, three arcs of seating, a space-jazz band that plays 18:00-22:00 ----------
{const cx=AMPH.x,cz=AMPH.z,by=terrainH(cx,cz)-0.4;const g=new THREE.Group();g.position.set(cx,by,cz);
  g.add(mesh(cyl(16.5,17,0.5,32),sandLightM,0,0.2,0,1,1,1,0));
  g.add(mesh(boxG,sandM,0,0,-7,16,1.6,8,0));g.add(mesh(boxG,wallDarkM,0,1.6,-10.5,17,4,1,0));   // stage and backdrop wall
  for(let k=0;k<3;k++){const r=6+k*3.2;for(let i=0;i<=16;i++){const t=Math.PI*(0.1+0.8*i/16);g.add(mesh(boxG,k%2?sandM:sandLightM,r*Math.cos(t),0.4+k*0.9,r*Math.sin(t),2.2,0.9+k*0.9,2.6,-t+Math.PI/2));}}
  // stage lights: two coloured floods on posts, plus glow
  const lights=[[-7,0xff40c0],[7,0x40e0ff]].map(p=>{g.add(mesh(boxG,wallDarkM,p[0],0,-3,0.4,7,0.4,0));const gl=mesh(sph(0.6,8,6),glowM,p[0],7.2,-3,1,1,1,0);const c=new THREE.Color(p[1]);gl.userData.glowColor=[c.r,c.g,c.b];gl.userData.glowSize=9;gl.userData.sched=4;g.add(gl);
    const L=new THREE.PointLight(p[1],0,40,1.5);L.position.set(cx+p[0],by+7,cz-3);scene.add(L);return L;});
  // the band: five players with mismatched heads and instruments
  const band=[];const SK=[0x7fc95a,0x5a8ad9,0xd9b58a,0xc86a9a,0x9ad0c8];const brass=new THREE.MeshLambertMaterial({color:0xe8c14a}),dark=new THREE.MeshLambertMaterial({color:0x2a2420}),cloth=new THREE.MeshLambertMaterial({color:0x2f2f4a});
  [[-5,-6,'horn'],[-2,-8,'drums'],[0.5,-6,'keys'],[3,-8,'bass'],[5.5,-6,'sax']].forEach((p,i)=>{const m=new THREE.Group();m.userData.life=true;m.userData.dynamic=true;m.position.set(p[0],1.6,p[1]);g.add(m);
    m.add(mesh(cyl(0.42,0.55,1,8),cloth,0,0.8,0,1,1.6,1,0));const skin=new THREE.MeshLambertMaterial({color:SK[i]});
    if(i===0)m.add(mesh(sph(0.42,8,6),skin,0,1.95,0,1,1.5,1,0));else if(i===1){m.add(mesh(sph(0.34,8,6),skin,0,1.9,0,1,1,1,0));[-0.2,0.2].forEach(ex=>m.add(mesh(sph(0.12,6,5),dark,ex,2.05,0.28,1,1,1,0)));}
    else if(i===2)m.add(mesh(cyl(0.28,0.4,1,6),skin,0,2.0,0,1,0.9,1,0));else if(i===3)m.add(mesh(octa(0.42,0),skin,0,1.95,0,1,1.2,1,0));else{m.add(mesh(sph(0.34,8,6),skin,0,1.9,0,1,1,1,0));m.add(mesh(cyl(0.05,0.05,1.2,4),skin,0,2.5,0,1,1,1,0));m.add(mesh(sph(0.12,6,5),glowM,0,3.1,0,1,1,1,0));}
    if(p[2]==='horn'){const hn=mesh(cone(0.5,1.6,10),brass,0,1.5,0.9,1,1,1,0);hn.rotation.x=-Math.PI/2;m.add(hn);}
    else if(p[2]==='drums'){[[-0.7,0.3],[0.7,0.3],[0,0.9]].forEach(d=>g.add(mesh(cyl(0.55,0.55,0.5,10),brass,p[0]+d[0],1.6+0.5+d[1]*0.5,p[1]+0.9,1,1,1,0)));}
    else if(p[2]==='keys'){g.add(mesh(boxG,dark,p[0],1.6,p[1]+0.9,2.2,0.9,0.7,0));g.add(mesh(boxG,new THREE.MeshLambertMaterial({color:0xf0ede0}),p[0],2.5,p[1]+0.9,2,0.1,0.5,0));}
    else if(p[2]==='bass'){const bs=mesh(boxG,new THREE.MeshLambertMaterial({color:0x8a4a2a}),0.5,1.1,0.5,0.7,2.4,0.35,0);bs.rotation.z=-0.3;m.add(bs);}
    else{const sx2=mesh(cyl(0.12,0.3,1.4,8),brass,0.3,1.3,0.6,1,1,1,0);sx2.rotation.x=-0.5;m.add(sx2);}
    band.push({m,ph:rr(0,6.28),kind:p[2]});});
  scene.add(g);
  // audience on the arcs, present only during the concert
  const NA=48,seats=[];for(let i=0;i<NA;i++){const k=Math.floor(rnd()*3),t=Math.PI*(0.12+0.76*rnd());const r=6+k*3.2;seats.push({x:cx+r*Math.cos(t),z:cz+r*Math.sin(t),y:by+0.4+k*0.9+0.9+k*0.9,h:Math.atan2(cx-(cx+r*Math.cos(t)),(cz-7)-(cz+r*Math.sin(t))),ph:rr(0,6.28)});}
  const aBody=new THREE.InstancedMesh(bodyG,new THREE.MeshLambertMaterial({color:0xffffff}),NA),aHead=new THREE.InstancedMesh(headG,new THREE.MeshLambertMaterial({color:0xd9b58a}),NA);
  aBody.userData.noShadow=aHead.userData.noShadow=true;aBody.userData.life=aHead.userData.life=true;for(let i=0;i<NA;i++)aBody.setColorAt(i,col.set(pick(ROBES)));scene.add(aBody,aHead);
  animHooks.push(now=>{const h=H(),cf=concertF(h);const nvis=Math.floor(NA*cf);
    for(const L of lights)L.intensity=1.3*cf;
    band.forEach((b,i)=>{b.m.visible=cf>0.05;if(!b.m.visible)return;const t=now*0.001;b.m.position.y=1.6+(b.kind==='drums'?0:Math.abs(Math.sin(t*3.2+b.ph))*0.15);b.m.rotation.y=Math.sin(t*1.1+b.ph)*0.25;b.m.rotation.z=Math.sin(t*2.4+b.ph)*0.08;});
    for(let i=0;i<NA;i++){const st=seats[i];const on=i<nvis;const sc=on?1:0.0001;const sway=on?Math.sin(now*0.003+st.ph)*0.06:0;
      dm.position.set(st.x,st.y,st.z);dm.scale.set(sc,sc*1.05,sc);dm.rotation.set(0,st.h,sway);dm.updateMatrix();aBody.setMatrixAt(i,dm.matrix);
      dm.position.set(st.x,st.y+1.3,st.z);dm.scale.set(sc,sc,sc);dm.updateMatrix();aHead.setMatrixAt(i,dm.matrix);}
    aBody.instanceMatrix.needsUpdate=true;aHead.instanceMatrix.needsUpdate=true;});
  ctx.concert={band:band.length,seats:NA};}
});
await stage('square');
section('square',()=>{
