// ---------- landmarks: parametric massing for the buildings everyone knows ----------
await stage('landmarks');
const LANDMARKS=[];   // meshes with userData.info, for the click card
const glassM=new THREE.MeshLambertMaterial({color:0x4a6a8a,map:facadeTex,emissiveMap:glowTex,emissive:0x000000});setEnv(glassM,{K:0.25,id:'lmglass'});
const darkM=new THREE.MeshLambertMaterial({color:0x2c3038,map:facadeTex,emissiveMap:glowTex,emissive:0x000000});setEnv(darkM,{K:0.25,id:'lmdark'});
const lmMats=[glassM,darkM];
function lmMat(hex){if(!hex)return glassM;const m=new THREE.MeshLambertMaterial({color:parseInt(hex.slice(1),16),map:facadeTex,emissiveMap:glowTex,emissive:0x000000});setEnv(m,{K:0.25,id:'lm'+hex});lmMats.push(m);return m;}
const chromeM=new THREE.MeshPhongMaterial({color:0xdde4ea,specular:0xffffff,shininess:120});
function reg(mesh,L){mesh.userData.info=L;mesh.castShadow=mesh.receiveShadow=true;LANDMARKS.push(mesh);scene.add(mesh);return mesh;}
function box(x,y,z,w,h,d,m){const b=new THREE.Mesh(boxG,m);b.position.set(x,y,z);b.scale.set(w,h,d);return b;}
function group(L,parts){const g=new THREE.Group();for(const p of parts){p.castShadow=p.receiveShadow=true;p.userData.info=L;g.add(p);}g.userData.info=L;LANDMARKS.push(g);scene.add(g);return g;}
const KINDS={
  bundle(L){const m=darkM,t=L.w/3,H=L.h,levels=[[0,0,1],[1,0,.92],[2,0,.62],[0,1,.62],[1,1,1],[2,1,.83],[0,2,.46],[1,2,.62],[2,2,.46]];   // nine tubes, the taller ones at the core
    return group(L,levels.map(([i,j,f])=>box(L.x-L.w/2+t*(i+.5),0,L.z-L.w/2+t*(j+.5),t-0.6,H*f,t-0.6,m)).concat([box(L.x-8,H,L.z-8,2,80,2,steelM),box(L.x+8,H,L.z+8,2,70,2,steelM)]));},
  taper(L){const g=new THREE.Mesh(new THREE.CylinderGeometry(1,1.6,1,4,1),darkM);g.geometry.translate(0,0.5,0);g.rotation.y=Math.PI/4;g.position.set(L.x,0,L.z);g.scale.set(L.w*0.72,L.h,L.d*0.72);
    const g2=group(L,[g,box(L.x-9,L.h,L.z,1.6,110,1.6,steelM),box(L.x+9,L.h,L.z,1.6,110,1.6,steelM)]);   // X-braces: four thin diagonals a side
    for(const s of [-1,1])for(let k=0;k<5;k++){const br=box(L.x+s*(L.w*0.36-k*L.w*0.03),k*L.h/5,L.z,1.2,L.h/5*1.06,L.d*0.7,steelM);br.rotation.z=s*0.22;br.userData.info=L;g2.add(br);}return g2;},
  setbacks(L){const H=L.h,steps=[[1,1,0.3],[0.8,0.85,0.35],[0.62,0.7,0.35]];let y=0;const parts=[];for(const [fw,fd,fh] of steps){parts.push(box(L.x+(1-fw)*L.w/2*0.5,y,L.z,L.w*fw,H*fh,L.d*fd,glassM));y+=H*fh;}
    if(L.spire)parts.push(box(L.x,H,L.z,2,L.spire,2,chromeM));return group(L,parts);},
  box(L){return reg(box(L.x,0,L.z,L.w,L.h,L.d,lmMat(L.color)),L);},
  stacked(L){const parts=[];const stems=[[0,-L.d/3,0.62],[0,0,1],[0,L.d/3,0.8]];for(const [dx,dz,f] of stems){let y=0;for(let k=0;k<7;k++){const hh=L.h*f/7;const fr=new THREE.Mesh(new THREE.CylinderGeometry(0.5*(k%2?0.8:1.1),0.5*(k%2?1.1:0.8),1,4,1),glassM);fr.geometry.translate(0,0.5,0);fr.rotation.y=Math.PI/4;fr.position.set(L.x+dx,y,L.z+dz);fr.scale.set(L.w*0.85,hh,L.d/3*1.05);parts.push(fr);y+=hh;}}return group(L,parts);},
  crown(L){const parts=[box(L.x,0,L.z,L.w,L.h*0.7,L.d,glassM),box(L.x,L.h*0.7,L.z,L.w*0.8,L.h*0.16,L.d*0.8,glassM),box(L.x,L.h*0.86,L.z,L.w*0.55,L.h*0.14,L.d*0.55,glassM),box(L.x,L.h,L.z,1.5,L.h*0.2,1.5,chromeM)];return group(L,parts);},
  twin(L){const parts=[];for(const s of [-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,24,1),lmMat('#c9c2b4'));c.geometry.translate(0,0.5,0);c.position.set(L.x+s*L.gap/2,0,L.z);c.scale.set(L.w/2,L.h,L.w/2);parts.push(c);
      for(let k=0;k<12;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(1,0.04,4,24),darkM);r.rotation.x=Math.PI/2;r.position.set(L.x+s*L.gap/2,L.h*(0.3+k*0.058),L.z);r.scale.setScalar(L.w/2*1.04);parts.push(r);}}return group(L,parts);},
  slab(L){return group(L,[box(L.x,0,L.z,L.w,L.h,L.d,lmMat(L.color)),box(L.x,L.h,L.z,L.w*0.25,L.tower||20,L.d*0.4,lmMat(L.color))]);},
  deco(L){const m=lmMat(L.color),parts=[];const steps=[[1,1,0.5],[0.7,0.8,0.25],[0.45,0.55,0.18]];let y=0;for(const [fw,fd,fh] of steps){parts.push(box(L.x,y,L.z,L.w*fw,L.h*fh,L.d*fd,m));y+=L.h*fh;}parts.push(box(L.x,y,L.z,4,L.h*0.09,4,chromeM));return group(L,parts);},
  crowncyl(L){const c=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,20,1),new THREE.MeshLambertMaterial({color:0xe8f0ff,emissive:0x8fb4e0,emissiveIntensity:0.5,transparent:true,opacity:0.8}));c.geometry.translate(0,0.5,0);c.position.set(L.x,L.h*0.89,L.z);c.scale.set(L.w*0.36,L.h*0.11,L.w*0.36);
    return group(L,[box(L.x,0,L.z,L.w,L.h*0.89,L.d,lmMat(L.color)),c]);},
  gothic(L){const m=lmMat(L.color),parts=[box(L.x,0,L.z,L.w,L.h*0.72,L.d,m),box(L.x,L.h*0.72,L.z,L.w*0.7,L.h*0.28,L.d*0.7,m)];for(let k=0;k<8;k++){const a=k/8*Math.PI*2;parts.push(box(L.x+Math.cos(a)*L.w*0.34,L.h*0.72,L.z+Math.sin(a)*L.d*0.34,2.4,L.h*0.36,2.4,m));}return group(L,parts);},
  clocktower(L){const m=lmMat(L.color);return group(L,[box(L.x,0,L.z,L.w,L.h*0.6,L.d,m),box(L.x,L.h*0.6,L.z+L.d*0.2,L.w*0.5,L.h*0.3,L.w*0.5,m),box(L.x,L.h*0.9,L.z+L.d*0.2,L.w*0.3,L.h*0.1,L.w*0.3,m)]);},
  diamond(L){const top=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),glassM);top.geometry.translate(0,0.5,0);top.position.set(L.x,L.h*0.78,L.z);top.rotation.z=0;top.scale.set(L.w,L.h*0.22,L.d*0.5);
    const wedge=new THREE.Mesh(new THREE.CylinderGeometry(0,1,1,4,1),glassM);wedge.geometry.translate(0,0.5,0);wedge.rotation.y=Math.PI/4;wedge.position.set(L.x,L.h*0.78,L.z);wedge.scale.set(L.w*0.75,L.h*0.22,L.d*0.75);
    return group(L,[box(L.x,0,L.z,L.w,L.h*0.78,L.d,glassM),wedge]);},
  ypoint(L){const parts=[];for(let k=0;k<3;k++){const a=k/3*Math.PI*2+0.5;const wing=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,16,1,false,0,Math.PI*0.55),darkM);wing.geometry.translate(0,0.5,0);wing.rotation.y=a;wing.position.set(L.x,0,L.z);wing.scale.set(L.w*0.55,L.h,L.w*0.55);parts.push(wing);}
    const core=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,12,1),darkM);core.geometry.translate(0,0.5,0);core.position.set(L.x,0,L.z);core.scale.set(L.w*0.22,L.h,L.w*0.22);parts.push(core);return group(L,parts);},
  watertower(L){const m=lmMat(L.color);const parts=[box(L.x,0,L.z,L.w*2.2,L.h*0.3,L.w*2.2,m),box(L.x,L.h*0.3,L.z,L.w,L.h*0.6,L.w,m)];const cap=new THREE.Mesh(new THREE.ConeGeometry(0.7,1,4),m);cap.geometry.translate(0,0.5,0);cap.position.set(L.x,L.h*0.9,L.z);cap.scale.set(L.w,L.h*0.1,L.w);parts.push(cap);return group(L,parts);},
  bean(L){const b=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),chromeM);b.position.set(L.x,L.h*0.55,L.z);b.scale.set(L.w/2,L.h*0.45,L.d/2);const base=box(L.x,0,L.z,L.w*1.6,0.4,L.d*1.8,stoneM);return group(L,[b,base]);},
  fountain(L){const parts=[];for(let k=0;k<3;k++){const r=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,28,1),stoneM);r.geometry.translate(0,0.5,0);r.position.set(L.x,k*2.2,L.z);r.scale.set(L.w/2*(1-k*0.3),2.2,L.w/2*(1-k*0.3));parts.push(r);}
    const jet=new THREE.Mesh(new THREE.CylinderGeometry(0.6,2.5,1,10,1),waterM);jet.geometry.translate(0,0.5,0);jet.position.set(L.x,6,L.z);jet.scale.set(1,30,1);parts.push(jet);const g=group(L,parts);animHooks.push(now=>{jet.scale.y=18+14*Math.max(0,Math.sin(now*0.0007));});return g;},
  lowrise(L){return reg(box(L.x,0,L.z,L.w,L.h,L.d,lmMat(L.color)),L);},
  stadium(L){const parts=[];const ring=new THREE.Mesh(new THREE.CylinderGeometry(1,1.1,1,32,1,true),stoneM);ring.geometry.translate(0,0.5,0);ring.position.set(L.x,0,L.z);ring.scale.set(L.w/2,L.h,L.d/2);ring.material=stoneM.clone();ring.material.side=THREE.DoubleSide;parts.push(ring);
    for(const s of [-1,1])for(let k=0;k<12;k++){parts.push(box(L.x+s*(L.w/2+8),0,L.z-L.d*0.4+k*L.d*0.8/11,3,L.h*0.55,3,stoneM));}return group(L,parts);},
  pier(L){const parts=[];const wheel=new THREE.Group();const rim=new THREE.Mesh(new THREE.TorusGeometry(PIER.wheelR,1.2,6,48),steelM);wheel.add(rim);
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2;const sp=box(0,0,0,1,PIER.wheelR*2,1,steelM);sp.position.set(0,0,0);sp.rotation.z=a;sp.geometry=new THREE.BoxGeometry(1,1,1);sp.scale.set(0.8,PIER.wheelR*2,0.8);wheel.add(sp);
      const car=new THREE.Mesh(new THREE.SphereGeometry(2.4,8,6),new THREE.MeshLambertMaterial({color:0xe8f0ff}));car.position.set(Math.cos(a)*PIER.wheelR,Math.sin(a)*PIER.wheelR,0);wheel.add(car);}
    wheel.position.set(PIER.wheelX,PIER.wheelR+6,PIER.z);wheel.rotation.y=Math.PI/2;wheel.userData.info=L;parts.push(wheel);
    for(const s of [-1,1]){const leg=box(PIER.wheelX,4,PIER.z+s*10,3,PIER.wheelR+2,3,steelM);leg.rotation.x=s*0.16;parts.push(leg);}
    const g=group(L,parts);animHooks.push(now=>{wheel.rotation.x=now*0.00012;});return g;},
};
section('landmarks',()=>{for(const L of C.landmarks){const f=KINDS[L.kind];if(!f){report('landmark '+L.name,new Error('unknown kind '+L.kind));continue;}try{f(L);}catch(e){report('landmark '+L.name,e);}}
  // warning beacons on the tallest roofs
  const beacons=[];for(const L of C.landmarks)if(L.h>250){const b=new THREE.Mesh(new THREE.SphereGeometry(2,8,6),new THREE.MeshBasicMaterial({color:0xff2020}));b.position.set(L.x,L.h+(L.kind==='bundle'?80:L.kind==='taper'?110:L.spire||8),L.z);scene.add(b);beacons.push(b);}
  animHooks.push(now=>{const on=(now%1600)<800;for(const b of beacons)b.visible=on||hourCur<6||hourCur>18;});
  ctx.details.landmarks=LANDMARKS.length;});
animHooks.push(()=>{const w=windowF(hourCur);for(const m of lmMats)m.emissive.setRGB(w,w*0.92,w*0.8);});
