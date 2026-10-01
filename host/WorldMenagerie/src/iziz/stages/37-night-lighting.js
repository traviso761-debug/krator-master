// ---------- night lighting: arena floods, temple braziers, klieg beams on the wall towers, gate spotlights ----------
const H=()=>ctx.hour||0;
// arena floodlights (three point lights on the attic masts) — evening session
const floods=[0,2.1,4.2].map(t=>{const L=new THREE.PointLight(0xffd9a0,0,140,1.6);L.position.set(ARENA.x+38*Math.cos(t),terrainH(ARENA.x,ARENA.z)+40,ARENA.z+31*Math.sin(t));scene.add(L);return L;});
// temple braziers at the summit corners, plus one warm point light
const TS=ctx.templeStair;const braz=[];const brM=new THREE.MeshLambertMaterial({color:0x5c4a3a});brM.userData.tex='metal';
[[-8,4],[8,4],[-8,-8],[8,-8]].forEach((p,k)=>{const g=new THREE.Group();g.position.set(TEMPLE.x+p[0],TS.y0+TS.top[1]-1,TEMPLE.z+p[1]);
  g.add(mesh(cyl(0.35,0.5,2.2,8),brM,0,1.1,0,1,1,1,0));g.add(mesh(cyl(1.1,0.6,0.9,10),brM,0,2.5,0,1,1,1,0));
  const fire=mesh(cone(0.7,1.6,6),glowM,0,3.6,0,1,1,1,0);fire.userData.glowColor=[1,0.6,0.2];fire.userData.glowSize=7;fire.userData.sched=1;fire.userData.lightT=[17.45+k*0.08,29.9-k*0.06,-1];fire.userData.dynamic=true;g.add(fire);braz.push(fire);scene.add(g);});
const brazL=new THREE.PointLight(0xffa050,0,60,1.8);brazL.position.set(TEMPLE.x,TS.y0+TS.top[1]+6,TEMPLE.z);scene.add(brazL);
// klieg beams: additive cones, apex at the lamp. Wall-tower units sweep the jungle; palace corner units sweep the sky.
function fadeCone(g,len){const pos=g.attributes.position;const c=new Float32Array(pos.count*3);for(let i=0;i<pos.count;i++){const f=1-Math.min(1,Math.abs(pos.getY(i))/len);const v=f*f;c[i*3]=v;c[i*3+1]=v;c[i*3+2]=v;}g.setAttribute('color',new THREE.BufferAttribute(c,3));return g;}
const beamG=fadeCone(new THREE.ConeGeometry(9,220,12,1,true).translate(0,-110,0),220);   // apex at the origin, opens toward -y
const beamM=new THREE.MeshBasicMaterial({color:0xfff2d0,vertexColors:true,transparent:true,opacity:0.0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
const beams=[];const forestSpots=[];
for(let i=0;i<84;i+=12){const t=i/84*2*Math.PI;if(GATES.some(g=>angDiff(t,g)<0.2))continue;const R=wallR(t),x=R*Math.cos(t),z=R*Math.sin(t),y=terrainH(x,z)-3+22+22.5;
  const piv=new THREE.Group();piv.userData.dynamic=true;piv.position.set(x,y,z);piv.userData.base=Math.PI/2-t;piv.userData.sky=false;   // local +z = outward
  piv.add(mesh(cyl(1.2,1.6,1.4,8),wallDarkM,0,0,0,1,1,1,0));
  const tilt=new THREE.Group();tilt.rotation.x=-(Math.PI/2-0.12);piv.add(tilt);const bm=beamM.clone();piv.userData.mat=bm;piv.userData.lightT=[17.9+beams.length*0.07,29.7-beams.length*0.05,-1];tilt.add(new THREE.Mesh(beamG,bm));   // beam points outward, slightly down at the forest
  const gl=mesh(sph(0.8,8,6),glowM,0,1,0,1,1,1,0);gl.userData.glowSize=9;gl.userData.sched=1;gl.userData.lightT=piv.userData.lightT;piv.add(gl);
  const L=new THREE.SpotLight(0xfff0d0,0,260,0.22,0.6,1.1);L.position.set(0,0,0);L.target.position.set(0,-30,200);piv.add(L);piv.add(L.target);forestSpots.push(L);piv.userData.light=L;
  piv.userData.ph=rr(0,6.28);piv.userData.rate=rr(0.2,0.35);scene.add(piv);beams.push(piv);}
{const py0=terrainH(PALACE.x,PALACE.z)-3+14;[[-42,-36],[42,-36],[-42,36],[42,36]].forEach((c,k)=>{const piv=new THREE.Group();piv.userData.dynamic=true;piv.position.set(PALACE.x+c[0],py0,PALACE.z+c[1]);piv.userData.sky=true;
  piv.add(mesh(cyl(1.4,1.8,1.6,8),wallDarkM,0,0.8,0,1,1,1,0));const bm=beamM.clone();piv.userData.mat=bm;piv.userData.lightT=[18.3+k*0.06,29.4+k*0.05,-1];const cone=new THREE.Mesh(beamG,bm);cone.rotation.x=Math.PI;cone.position.y=1.6;piv.add(cone);
  const gl=mesh(sph(0.9,8,6),glowM,0,2,0,1,1,1,0);gl.userData.glowSize=10;gl.userData.sched=1;gl.userData.lightT=piv.userData.lightT;piv.add(gl);
  piv.userData.ph=k*1.6;piv.userData.rate=rr(0.25,0.4);scene.add(piv);beams.push(piv);});}
// gate spotlights: from each outer gatehouse top, angled down onto the bridge and the approach
const spotG=fadeCone(new THREE.ConeGeometry(14,120,12,1,true).translate(0,-60,0),120);const spotM=beamM.clone();spotM.opacity=0;
const spots=[],spotsC=[];const DOWN=new THREE.Vector3(0,-1,0);
for(const g of GATES){const R=wallR(g);[-1,1].forEach(sd=>{const x=(R+2)*Math.cos(g)-sd*20*Math.sin(g),z=(R+2)*Math.sin(g)+sd*20*Math.cos(g),y=PLATEAU+40;
  const dir=new THREE.Vector3(Math.cos(g),0,Math.sin(g)).multiplyScalar(60).add(new THREE.Vector3(sd*8*-Math.sin(g),-35,sd*8*Math.cos(g))).normalize();
  const gi=GATES.indexOf(g),lt=[17.75+gi*0.06+(sd>0?0.025:0),29.8-gi*0.04,-1],sm=spotM.clone();const cone=new THREE.Mesh(spotG,sm);cone.position.set(x,y,z);cone.quaternion.setFromUnitVectors(DOWN,dir);scene.add(cone);
  const L=new THREE.SpotLight(0xfff0d0,0,160,0.35,0.5,1.2);L.position.set(x,y,z);L.target.position.set(x+dir.x*80,y+dir.y*80,z+dir.z*80);scene.add(L);scene.add(L.target);spots.push(L);spotsC.push({mat:sm,L,t:lt,cone});
  const gl=mesh(sph(0.9,8,6),glowM,x,y,z,1,1,1,0);gl.userData.glowSize=10;gl.userData.sched=1;gl.userData.lightT=lt;scene.add(gl);});}
animHooks.push(now=>{const h=H(),nf=nightF(h);
  floods.forEach((L,k)=>{const on=17.05+k*0.12,off=22.25+k*0.1,hh=h<12?h+24:h,w=clamp((hh-on)/0.45,0,1);L.intensity=1.1*litAt(h,on,off)*(0.3+0.7*w);L.color.setRGB(1,0.54+0.31*w,0.23+0.4*w);});   // floods warm up from dim orange
  let bs=0;for(const f of braz){const t=f.userData.lightT,l=litAt(h,t[0],t[1]);bs+=l;f.scale.setScalar(Math.max(0.001,(0.8+0.25*Math.sin(now*0.02+f.position.x))*l));}brazL.intensity=1.2*bs/braz.length;
  for(const p of beams){const t=p.userData.lightT,l=litAt(h,t[0],t[1]);p.userData.mat.opacity=0.2*l;if(p.userData.light)p.userData.light.intensity=1.6*l;}
  for(const sc of spotsC){const l=litAt(h,sc.t[0],sc.t[1]);sc.mat.opacity=0.13*l;sc.L.intensity=1.5*l;}
  for(const p of beams){const u=p.userData;if(u.sky){p.rotation.z=0.5*Math.sin(now*0.001*u.rate+u.ph);p.rotation.y=now*0.00025+u.ph;}else{p.rotation.y=u.base+0.7*Math.sin(now*0.001*u.rate+u.ph);}}});
// spaceport: four apron floods on the perimeter lamp posts, a rotating red beacon on the tower
const portLights=[0,1,2,3].map(k=>{const lt=[17.35+k*0.07,29.75+k*0.04,-1];const t=k*Math.PI/2+Math.PI/4;const L=new THREE.PointLight(0xffe2c0,0,150,1.4);L.position.set(SP.x+70*Math.cos(t),SPH+26,SP.z+70*Math.sin(t));scene.add(L);
  scene.add(mesh(boxG,wallDarkM,SP.x+70*Math.cos(t),SPH,SP.z+70*Math.sin(t),0.9,26,0.9,0));const gl=mesh(sph(1.2,8,6),glowM,SP.x+70*Math.cos(t),SPH+26.5,SP.z+70*Math.sin(t),1,1,1,0);gl.userData.glowSize=12;gl.userData.sched=1;gl.userData.lightT=lt;L.userData.t=lt;scene.add(gl);return L;});
const beacon=new THREE.Group();beacon.userData.dynamic=true;beacon.position.set(SP.x+9,SPH+45.5,SP.z-3);scene.add(beacon);
const beaconG=fadeCone(new THREE.ConeGeometry(4,90,10,1,true).translate(0,-45,0),90),beaconM=beamM.clone();beaconM.color.set(0xff6040);beaconM.opacity=0;
[0,Math.PI].forEach(a=>{const c=new THREE.Mesh(beaconG,beaconM);c.rotation.x=-(Math.PI/2-0.05);const w=new THREE.Group();w.rotation.y=a;w.add(c);beacon.add(w);});
const bgl=mesh(sph(0.9,8,6),glowM,0,0,0,1,1,1,0);bgl.userData.glowColor=[1,0.3,0.2];bgl.userData.glowSize=10;bgl.userData.sched=0;beacon.add(bgl);
const closedF=h=>h<12?(1-ss(5.9,6.4,h)):ss(21.9,22.4,h);   // gates shut 22:00-06:00
ctx.closedF=closedF;animHooks.push(()=>{ctx.gatesClosed=closedF(ctx.hour||0)>0.05;});
animHooks.push(()=>{const c=closedF(ctx.hour||0);for(const gd of (scene.userData.gateDoors||[])){const H=gd.small?10:21.5;gd.door.position.y=H-H*c;for(const r of gd.ribs)r.position.y=H-H*c;}});
animHooks.push(now=>{const nf=nightF(ctx.hour||0);for(const L of portLights)L.intensity=1.2*litAt(ctx.hour||0,L.userData.t[0],L.userData.t[1]);beaconM.opacity=0.35*nf+0.05;beacon.rotation.y=now*0.0015;});
{const src=[];for(const L of LANTERNS)src.push({t:L.t,lt:L.lt,w:5,k:0.9});
 for(const p of beams)if(!p.userData.sky)src.push({t:Math.atan2(p.position.z,p.position.x),lt:p.userData.lightT,w:7,k:1.2});
 for(const sc of spotsC)src.push({t:Math.atan2(sc.cone.position.z,sc.cone.position.x),lt:sc.t,w:6,k:1.0});
 const P=src.slice(0,20).map(q=>{const r=wallR(q.t)+10.5;return {x:r*Math.cos(q.t),z:r*Math.sin(q.t),lt:q.lt,w:q.w,k:q.k};});
 animHooks.push(()=>{const h=ctx.hour||0;P.forEach((q,i)=>MOAT_POOLS[i].set(q.x,q.z,q.k*litAt(h,q.lt[0],q.lt[1]),q.w));});ctx.moatPools=P.length;}
ctx.evening={floods:floods.length,beams:beams.length,spots:spots.length,portLights:portLights.length};ctx.fx=Object.assign(ctx.fx||{},{beamCones:beams.map(p=>p.userData.mat),spotCones:spotsC.map(s=>s.cone),beacon});
});
await stage('events');
section('events',()=>{
const {bodyG,headG,ROBES}=ctx.people;
