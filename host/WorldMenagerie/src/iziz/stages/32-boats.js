// ---------- boats: sailboats, fishing boats and a pleasure barge on the lake, canoes on the river, rowing boats and a ferry on the moat ----------
// hull: lofted sections, pointed bow at +z, a transom at -z; unit size (width, depth, length)
const hullG=(()=>{const S=14,prof=[[-1,1],[-0.86,0.55],[-0.5,0.14],[0,0],[0.5,0.14],[0.86,0.55],[1,1]],P=prof.length,pos=[],idx=[];
  for(let s=0;s<=S;s++){const t=s/S,z=t-0.5,w=0.5*Math.pow(Math.sin(Math.PI*(0.12+0.88*t)),0.6),sheer=1+0.18*Math.pow(2*t-1,2);
    for(const [px,py] of prof)pos.push(px*w,py*sheer*(py>0.9?1:0.95+0.05*t),z);}
  for(let s=0;s<S;s++)for(let k=0;k<P-1;k++){const a=s*P+k,b=a+1,c2=a+P,d=c2+1;idx.push(a,c2,b,b,c2,d);}
  for(let k=1;k<P-2;k++)idx.push(0,k+1,k);   // transom
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;})();
const hullM=c=>{const m=new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide});m.userData.tex='timber';return m;};
const sailM=new THREE.MeshLambertMaterial({color:0xf0e6cc,side:THREE.DoubleSide}),sailM2=new THREE.MeshLambertMaterial({color:0xc9442a,side:THREE.DoubleSide});
const woodM=lamC(0x5e3f28),canM=new THREE.MeshLambertMaterial({color:0xe0a030});canM.userData.tex='stripes';
const lampM=new THREE.MeshBasicMaterial({color:0xffc070});
const {bodyG,headG,ROBES}=ctx.people;const skin=lamC(0xd9b58a);
const wakeTex=(()=>{const cv=document.createElement('canvas');cv.width=64;cv.height=128;const c2=cv.getContext('2d');const R=mkRng(303);
  for(let i=0;i<260;i++){const v=R(),y=v*128,spread=4+v*26,side=R()<0.5?-1:1,x=32+side*spread*(0.8+R()*0.3);c2.fillStyle=`rgba(255,255,255,${0.55*(1-v)*R()})`;c2.beginPath();c2.arc(x,y,1+R()*2,0,7);c2.fill();}
  return new THREE.CanvasTexture(cv);})();
const wakeM=new THREE.MeshBasicMaterial({color:0xffffff,map:wakeTex,transparent:true,depthWrite:false,opacity:0.6});
const wakeG=new THREE.PlaneGeometry(1,1);wakeG.rotateX(-Math.PI/2);
const R=mkRng(304);
function person(g,x,y,z,sc,col){g.add(mesh(bodyG,lamC(col),x,y,z,sc,sc*1.2,sc,0));g.add(mesh(headG,skin,x,y+sc*1.45,z,sc,sc,sc,0));}
function makeBoat(kind){const g=new THREE.Group();g.userData.dynamic=true;g.userData.life=true;let W,D,Lh,oars=null,lamp=null;
  const hc=[0x8a5a3a,0x6e4a2e,0x9c6a45,0x5a6a7a,0x7a3d2a][Math.floor(R()*5)];
  if(kind==='sail'||kind==='racer'){W=2.6;D=1.0;Lh=7.5;g.add(mesh(hullG,hullM(hc),0,0,0,W,D,Lh,0));g.add(mesh(boxG,woodM,0,0.55,0,W*0.8,0.08,Lh*0.7,0));
    g.add(mesh(cyl(0.08,0.11,1,6),woodM,0,0.5,1,1,8.6,1,0));g.add(mesh(boxG,woodM,0,1.5,-0.9,0.1,0.1,3.8,0));
    const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute([0,1.35,1.0, 0,8.6,0.95, 0,1.55,-2.8],3));sg.computeVertexNormals();
    g.add(new THREE.Mesh(sg,kind==='racer'?new THREE.MeshLambertMaterial({color:[0xffd040,0x40c0ff,0xff60a0,0x70e070][nRacer++%4],side:THREE.DoubleSide}):R()<0.5?sailM:sailM2));person(g,0,0.55,-2.6,0.8,ROBES[Math.floor(R()*ROBES.length)]);
    lamp=mesh(boxG,lampM,0,9,1,0.3,0.4,0.3,0);}
  else if(kind==='fish'){W=2.0;D=0.8;Lh=5.2;g.add(mesh(hullG,hullM(hc),0,0,0,W,D,Lh,0));const cm=lamC(0xd9c49a);g.add(mesh(boxG,cm,0,0.5,-1.2,1.4,1.1,1.6,0));g.add(mesh(frusG(0.3),woodM,0,1.6,-1.2,1.7,0.5,1.9,0));
    person(g,0,0.45,1.3,0.8,ROBES[Math.floor(R()*ROBES.length)]);const rod=mesh(boxG,woodM,0.4,1.3,1.6,0.04,0.04,3.2,0);rod.rotation.x=-0.5;rod.rotation.y=0.6;g.add(rod);
    g.add(mesh(boxG,woodM,-0.5,0.5,-2.1,0.08,2.2,0.08,0));lamp=mesh(boxG,lampM,-0.5,2.7,-2.1,0.28,0.36,0.28,0);}
  else if(kind==='barge'){W=3.4;D=0.8;Lh=8.4;g.add(mesh(hullG,hullM(0x7a5a3a),0,0,0,W,D,Lh,0));g.add(mesh(boxG,woodM,0,0.55,0,W*0.85,0.1,Lh*0.75,0));
    for(const sx of [-1,1])for(const sz of [-1,1])g.add(mesh(boxG,woodM,sx*1.2,0.6,sz*2.2,0.12,2.2,0.12,0));g.add(mesh(boxG,canM,0,2.8,0,2.9,0.12,5.2,0));
    for(let k=0;k<3;k++)person(g,(k-1)*0.8,0.65,(k-1)*1.3,0.8,ROBES[Math.floor(R()*ROBES.length)]);lamp=mesh(boxG,lampM,0,2.6,2.7,0.35,0.3,0.35,0);}
  else if(kind==='row'||kind==='ferry'){const big=kind==='ferry';W=big?2.4:1.4;D=big?0.8:0.55;Lh=big?6:3.6;g.add(mesh(hullG,hullM(hc),0,0,0,W,D,Lh,0));g.add(mesh(boxG,woodM,0,D*0.55,0,W*0.8,0.06,0.4,0));
    person(g,0,D*0.6,0,0.75,ROBES[Math.floor(R()*ROBES.length)]);if(big){person(g,0.4,D*0.6,1.6,0.72,ROBES[Math.floor(R()*ROBES.length)]);person(g,-0.4,D*0.6,-1.4,0.72,ROBES[Math.floor(R()*ROBES.length)]);}
    oars=[];for(const sd of [-1,1]){const o=new THREE.Group();o.position.set(sd*W*0.45,D*0.95,0);const blade=mesh(boxG,woodM,sd*1.1,0,0,2.4,0.05,0.1,0);blade.position.x=sd*1.1;o.add(blade);g.add(o);oars.push(o);}
    lamp=mesh(boxG,lampM,0,D+0.9,Lh*0.42,0.25,0.32,0.25,0);g.add(mesh(boxG,woodM,0,D*0.6,Lh*0.42,0.06,0.9,0.06,0));}
  else{W=0.9;D=0.38;Lh=4.4;g.add(mesh(hullG,hullM(hc),0,0,0,W,D,Lh,0));person(g,0,0.12,-0.5,0.62,ROBES[Math.floor(R()*ROBES.length)]);
    const pd=new THREE.Group();pd.position.set(0,0.9,-0.3);pd.add(mesh(boxG,woodM,0,-0.9,0,0.05,1.8,0.12,0));g.add(pd);oars=[pd];lamp=mesh(boxG,lampM,0,0.5,1.8,0.2,0.25,0.2,0);}
  if(lamp)g.add(lamp);
  const wake=new THREE.Mesh(wakeG,wakeM);wake.position.set(0,0.35,-Lh*0.5-Lh*0.9);wake.scale.set(W*3,1,Lh*1.8);wake.renderOrder=3;wake.userData.noWire=true;g.add(wake);
  scene.add(g);if(ctx.bakeGroup)ctx.bakeGroup(g,c=>c===lamp||c===wake);return {g,kind,W,D,Lh,oars,lamp,wake,ph:R()*6.28,yaw:0,speed:0};}
let nRacer=0;const BOATS=[];
// lake
[['sail',0.48,1],['sail',0.42,-1],['sail',0.5,1],['barge',0.3,1]].forEach(([k,f,dir],i)=>{const b=makeBoat(k);Object.assign(b,{water:'lake',f,t:i*1.7,dir,v:k==='barge'?1.6:3.2+R()*1.2});BOATS.push(b);});
for(let i=0;i<3;i++){const b=makeBoat('fish');let t=R()*6.28,f=0.35+R()*0.35;while(Math.abs(Math.atan2(Math.sin(t-LAKE.harborT),Math.cos(t-LAKE.harborT)))<0.6&&f>0.45)t=R()*6.28;Object.assign(b,{water:'lake',anchor:LAKE.at(f,t),yaw:R()*6.28,v:2.2});BOATS.push(b);}
for(let i=0;i<4;i++){const b=makeBoat('racer');Object.assign(b,{water:'lake',racer:i,v:5+i*0.35,dir:1});b.g.visible=false;BOATS.push(b);}
// ---- lake traffic: loops, berths, the regatta ----
const HB=LAKE.harbor;
const sideOf=(x,z)=>Math.sign((x-HB.S[0])*HB.v[0]+(z-HB.S[1])*HB.v[1])||1;
const nearestT=(f,x,z)=>{let bt=0,bd=1e9;for(let k=0;k<96;k++){const t=k/96*Math.PI*2,q=LAKE.at(f,t),d=Math.hypot(q[0]-x,q[1]-z);if(d<bd){bd=d;bt=t;}}return bt;};
const BUOYS=[LAKE.at(0.5,LAKE.harborT+Math.PI*0.55),LAKE.at(0.55,LAKE.harborT+Math.PI),LAKE.at(0.5,LAKE.harborT+Math.PI*1.45),HB.far];
const buoyG=new THREE.Group();buoyG.userData.dynamic=true;buoyG.visible=false;for(const q of BUOYS.slice(0,3)){buoyG.add(mesh(cyl(0.6,0.8,1.2,10),lamC(0xff7a2a),q[0],LAKE.L-0.3,q[1],1,1,1,0));buoyG.add(mesh(boxG,lamC(0xf4f0e6),q[0],LAKE.L+0.3,q[1],0.06,2.4,0.06,0));buoyG.add(mesh(boxG,flagM(0xc9442a),q[0],LAKE.L+1.8,q[1],0.05,0.9,1.2,0));}scene.add(buoyG);
const regattaOn=()=>{const tot=ctx.totalHours||15,d=Math.floor(tot/24),h=tot-d*24;return (d%3===2||d===FEST.forceDay)&&h>=10&&h<18;};
const lineUp=s=>HB.W(s.uu,s.side*30);   // square on to the berth before going in
const toSlot=(b,slot)=>{const p=[];if(sideOf(b.x,b.z)!==slot.side)p.push(HB.far);p.push(slot.outer,lineUp(slot),slot.appr,[slot.x,slot.z]);return p;};
const fromSlot=(slot,end)=>{const p=[slot.appr,lineUp(slot),slot.outer];if(sideOf(end[0],end[1])!==slot.side)p.push(HB.far);p.push(end);return p;};
function freeSlot(b){const f=HB.slots.filter(s=>!s.by&&s.fish===(b.kind==='fish'));if(!f.length)return null;const s=f[Math.floor(R()*f.length)];s.by=b;return s;}
function goPath(b,dt,speed){const t=b.path[b.pi],dx=t[0]-b.x,dz=t[1]-b.z,d=Math.hypot(dx,dz),last=b.pi===b.path.length-1,v=last?Math.max(0.5,Math.min(speed,d*0.45)):speed,st=Math.min(d,v*dt);
  if(d>1e-3){b.x+=dx/d*st;b.z+=dz/d*st;if(d>0.3)b.want=Math.atan2(dx,dz);}if(d-st<(last?0.05:2)){b.pi++;if(b.pi>=b.path.length){b.path=null;return true;}}return false;}
function lakeStep(b,dt,T,h){
  if(b.st===undefined){b.st=b.racer!==undefined?'hidden':b.anchor?'anchor':'loop';b.until=T+(b.kind==='barge'?20:40+R()*120);if(b.anchor){b.x=b.anchor[0];b.z=b.anchor[1];}else if(b.f){const q=LAKE.at(b.f,b.t);b.x=q[0];b.z=q[1];}b.want=b.yaw;}
  const night=h>=23||h<7,festNow=ctx.totalHours&&festF(ctx.totalHours)>0.3;
  switch(b.st){
    case 'loop':{const q0=LAKE.at(b.f,b.t),q1=LAKE.at(b.f,b.t+0.01*b.dir),seg=Math.hypot(q1[0]-q0[0],q1[1]-q0[1])||1;b.t+=b.dir*0.01*(b.v*dt/seg);b.x=q0[0];b.z=q0[1];b.want=Math.atan2(q1[0]-q0[0],q1[1]-q0[1]);
      const wantPort=b.kind==='barge'?(night&&!festNow):T>b.until;
      if(wantPort){const sl=freeSlot(b);if(sl){b.slot=sl;b.path=toSlot(b,sl);b.pi=0;b.st='in';}else b.until=T+20;}return true;}
    case 'anchor':{if(h>=18||h<5.5){const sl=freeSlot(b);if(sl){b.slot=sl;b.path=toSlot(b,sl);b.pi=0;b.st='in';return true;}}
      b.x=b.anchor[0]+Math.sin(T*0.07+b.ph)*0.6;b.z=b.anchor[1]+Math.cos(T*0.05+b.ph)*0.6;b.want=b.ph+Math.sin(T*0.03+b.ph)*0.8;return false;}
    case 'in':{if(goPath(b,dt,b.v)){b.st='docked';b.until=T+(b.kind==='sail'?40+R()*40:0);}return true;}
    case 'docked':{b.want=b.slot.hd;b.x+=(b.slot.x-b.x)*Math.min(1,dt);b.z+=(b.slot.z-b.z)*Math.min(1,dt);
      const leave=b.kind==='fish'?(h>=5.5&&h<18):b.kind==='barge'?!(night&&!festNow):T>b.until;
      if(leave){const end=b.anchor?b.anchor:(()=>{b.t=nearestT(b.f,HB.far[0],HB.far[1]);return LAKE.at(b.f,b.t);})();b.path=fromSlot(b.slot,end);b.pi=0;b.st='out';}return false;}
    case 'out':{const backing=b.pi===0,done=goPath(b,dt,backing?b.v*0.4:b.v);if(backing&&!done)b.want=b.slot.hd;   // reverse out of the berth, then turn
      if(done){b.slot.by=null;b.slot=null;if(b.anchor)b.st='anchor';else{b.st='loop';b.until=T+90+R()*140;}}return true;}
    case 'hidden':{if(regattaOn()){b.st='race';const o=HB.slots[b.racer%HB.slots.length].outer;b.x=o[0]+(R()-0.5)*6;b.z=o[1]+(R()-0.5)*6;b.leg=0;}return false;}
    case 'race':{if(!regattaOn()){b.st='home';b.path=[HB.far,HB.slots[b.racer%2].outer];b.pi=0;return true;}
      const tg=BUOYS[b.leg],off=(b.racer-1.5)*3,dx=tg[0]-b.x,dz=tg[1]-b.z,d=Math.hypot(dx,dz);
      if(d<9){b.leg=(b.leg+1)%BUOYS.length;}
      const tx=tg[0]-dz/d*off,tz=tg[1]+dx/d*off,ex=tx-b.x,ez=tz-b.z,el=Math.hypot(ex,ez)||1,sp=b.v*(0.9+0.15*Math.sin(T*0.4+b.racer));
      b.x+=ex/el*sp*dt;b.z+=ez/el*sp*dt;b.want=Math.atan2(ex,ez);return true;}
    case 'home':{if(goPath(b,dt,b.v))b.st='hidden';return true;}}
  return false;}
// ---- lanterns set afloat at the lake mouth drift down to the falls after dark ----
const NL=120,lanFloat=new THREE.InstancedMesh(boxG,lamC(0x8a6a45),NL),lanLamp=new THREE.InstancedMesh(sph(0.2,8,6),new THREE.MeshBasicMaterial({color:0xffd080}),NL);
for(const im of [lanFloat,lanLamp]){im.userData.life=true;im.userData.noShadow=true;im.frustumCulled=false;scene.add(im);}
const LAN=[];for(let i=0;i<NL;i++)LAN.push({on:false,r:0,lat:0,ph:R()*6.28,w:0});
const lanHalo=new Float32Array(NL*3),lanG=new THREE.BufferGeometry();lanG.setAttribute('position',new THREE.BufferAttribute(lanHalo,3));
const lanPts=new THREE.Points(lanG,new THREE.ShaderMaterial({uniforms:{izPx:ENV.izPx},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`uniform float izPx;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);float d=max(-mv.z,1.0);gl_PointSize=clamp(2.2*izPx/d,1.0,48.0);vA=position.y>-100.0?exp(-d*0.003):0.0;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float vA;void main(){float r=length(gl_PointCoord-0.5);float a=1.0-smoothstep(0.0,0.5,r);a*=a;if(a*vA<0.003)discard;gl_FragColor=vec4(vec3(1.0,0.75,0.4)*a*vA,a*vA);}`}));
lanPts.frustumCulled=false;lanPts.userData.life=true;scene.add(lanPts);
let lanNext=0,lanCur=0,lanWasOn=true;
// river: canoes working up and down between the falls and the lake
const rLo=wallR(RIVER.t0)+80,rHi=RIVER.rIn-8;
for(let i=0;i<3;i++){const b=makeBoat('canoe');Object.assign(b,{water:'river',r:rLo+(rHi-rLo)*(i+0.3)/3,dir:i%2?1:-1,lane:0,v:2.2+R()*0.6});BOATS.push(b);}
// moat: rowing boats and a ferry pass through the gap between the second and third bridge piers; the north-east gate stands on a causeway, so they turn back either side of it
const MA=326*Math.PI/180,MB=(305+360)*Math.PI/180;
[['row',1],['row',-1],['ferry',1],['fish',-1]].forEach(([k,dir],i)=>{const b=makeBoat(k);Object.assign(b,{water:'moat',t:MA+(i+0.5)/4*(MB-MA),dir,v:k==='ferry'?2.4:3,lane:27.5});BOATS.push(b);});
// halos over the lanterns
const hp=new Float32Array(BOATS.length*3),hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.BufferAttribute(hp,3));
const hm=new THREE.ShaderMaterial({uniforms:{izNight:ENV.izNight,izPx:ENV.izPx},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`uniform float izNight;uniform float izPx;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);float d=max(-mv.z,1.0);gl_PointSize=clamp(4.0*izPx/d,1.0,96.0);vA=izNight*exp(-d*0.0025);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float vA;void main(){float r=length(gl_PointCoord-0.5);float a=1.0-smoothstep(0.0,0.5,r);a*=a;if(a*vA<0.003)discard;gl_FragColor=vec4(vec3(1.0,0.78,0.45)*a*vA,a*vA);}`});
const halos=new THREE.Points(hg,hm);halos.frustumCulled=false;halos.userData.life=true;scene.add(halos);
const v3=new THREE.Vector3();let last=performance.now();
function riverPoint(r,lane){const t=RIVER.tc(r),t2=RIVER.tc(r+1),x=r*Math.cos(t),z=r*Math.sin(t);let tx=(r+1)*Math.cos(t2)-x,tz=(r+1)*Math.sin(t2)-z;const l=Math.hypot(tx,tz);tx/=l;tz/=l;return {x:x-tz*lane,z:z+tx*lane,tx,tz,ro:r-wallR(t)};}
animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;const T=now/1000,h=ctx.hour||0,lit=nightF(h),rain=ENV.izRain.value;
  lampM.color.setRGB(0.3+0.7*lit,0.22+0.56*lit,0.12+0.32*lit);
  BOATS.forEach((b,i)=>{let x,z,y,want=b.yaw,moving=true;
    if(b.water==='lake'){moving=lakeStep(b,dt,T,h);x=b.x;z=b.z;want=b.want;y=LAKE.L;b.hidden=b.st==='hidden';b.g.visible=!b.hidden;}
    else if(b.water==='river'){b.r+=b.dir*b.v*dt*(b.dir<0?1.15:0.85);if(b.r>rHi){b.r=rHi;b.dir=-1;}if(b.r<rLo){b.r=rLo;b.dir=1;}
      const q=riverPoint(b.r,0),w=RIVER.hw(q.ro);b.lane+=((b.dir>0?-1:1)*w*0.3-b.lane)*Math.min(1,dt*0.6);const p=riverPoint(b.r,b.lane);
      x=p.x;z=p.z;y=RIVER.S(p.ro);want=Math.atan2(p.tx*b.dir,p.tz*b.dir);}
    else{const R0=wallR(b.t)+b.lane;b.t+=b.dir*b.v*dt/R0;if(b.t>MB){b.t=MB;b.dir=-1;}if(b.t<MA){b.t=MA;b.dir=1;}const R1=wallR(b.t)+b.lane;x=R1*Math.cos(b.t);z=R1*Math.sin(b.t);y=-9.5;want=Math.atan2(-Math.sin(b.t)*b.dir,Math.cos(b.t)*b.dir);}
    let dy=want-b.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));b.yaw+=dy*Math.min(1,dt*(b.st==='in'||b.st==='out'?3:moving?1.5:0.6));
    const bob=(0.05+0.08*rain)*Math.sin(T*1.1+b.ph);
    b.g.position.set(x,y-b.D*0.35+bob,z);
    b.g.rotation.set(0.02*Math.sin(T*0.9+b.ph)*(1+rain),b.yaw,(b.kind==='sail'||b.kind==='racer'?(moving?0.09:0.02)*(b.dir||1):0)+0.035*Math.sin(T*1.3+b.ph)*(1+rain),'YXZ');
    if(b.oars){const a=Math.sin(T*(b.kind==='canoe'?2.2:1.8)+b.ph);b.oars.forEach((o,k)=>{if(b.kind==='canoe'){o.rotation.set(a*0.7,0,(k%2?1:-1)*0.3*Math.sign(Math.sin(T*0.25+b.ph))+0.35,'XYZ');}else{o.rotation.set(0,a*0.6*(k?1:-1),0.25+0.15*Math.cos(T*1.8+b.ph)*(k?1:-1));}});}
    b.wake.visible=moving;b.wake.material.opacity=0.6;
    b.lamp.getWorldPosition(v3);hp.set([v3.x,v3.y,v3.z],i*3);
    if(i<21)BOAT_POOLS[i].set(x,z,b.hidden?0:0.7*lit,3.2);
    b.pos=b.hidden?null:[x,y+1,z];});
  hg.attributes.position.needsUpdate=true;buoyG.visible=regattaOn();
  // river lanterns
  const fest=ctx.totalHours?festF(ctx.totalHours):0;
  if(lit>0.5&&T>lanNext){lanNext=T+(fest>0.5?0.6:6)*(0.6+R()*0.8);const L=LAN[lanCur];lanCur=(lanCur+1)%NL;L.on=true;L.r=RIVER.rIn-4;L.lat=(R()-0.5);L.w=0;}
  let anyLan=LAN.some(L=>L.on);if(anyLan||lanWasOn){lanWasOn=anyLan;
  for(let i=0;i<NL;i++){const L=LAN[i];if(!L.on){dm.position.set(0,-500,0);dm.scale.set(0.001,0.001,0.001);dm.rotation.set(0,0,0);dm.updateMatrix();lanFloat.setMatrixAt(i,dm.matrix);lanLamp.setMatrixAt(i,dm.matrix);lanHalo.set([0,-500,0],i*3);continue;}
    L.r-=dt*1.3;L.lat+=Math.sin(T*0.3+L.ph)*dt*0.05;L.w=Math.min(1,L.w+dt);const p=riverPoint(L.r,0),w=RIVER.hw(p.ro),q=riverPoint(L.r,clamp(L.lat,-0.6,0.6)*w);
    if(p.ro<48){L.on=false;continue;}const y=RIVER.S(p.ro)+0.05+Math.sin(T*1.7+L.ph)*0.03;
    dm.position.set(q.x,y,q.z);dm.scale.set(0.5*L.w,0.12,0.5*L.w);dm.rotation.set(0,L.ph+T*0.1,0);dm.updateMatrix();lanFloat.setMatrixAt(i,dm.matrix);
    dm.position.y=y+0.35;dm.scale.set(L.w,1.2*L.w,L.w);dm.updateMatrix();lanLamp.setMatrixAt(i,dm.matrix);lanHalo.set([q.x,y+0.35,q.z],i*3);}
  lanFloat.instanceMatrix.needsUpdate=lanLamp.instanceMatrix.needsUpdate=true;lanG.attributes.position.needsUpdate=true;}});
ctx.boats=BOATS;
ctx.boatInfo=(b)=>{const where={lake:'on the lake',river:'on the river',moat:'on the moat'}[b.water];const name={racer:'A regatta boat',sail:'A sailing boat',fish:'A fishing boat',barge:'A pleasure barge',row:'A rowing boat',ferry:'The moat ferry',canoe:'A canoe'}[b.kind];
  return {title:name+' '+where,follow:true,pos:()=>b.pos,live:()=>[{t:b.st==='race'?'Racing round the buoys':b.st==='home'?'Sailing home after the race':b.st==='in'?'Making for the docks':b.st==='docked'?'Tied up at the docks':b.st==='out'?(b.anchor?'Heading out to the fishing grounds':'Leaving the docks'):b.anchor?'Anchored, lines out':b.water==='river'?(b.dir<0?'Paddling down towards the falls':'Paddling back up to the lake'):b.water==='moat'?'Rowing along below the city walls':b.kind==='barge'?'Drifting slowly round the lake':'Sailing round the lake'},{t:nightF(ctx.hour||0)>0.5?'Lantern lit':'Lantern out till dusk',sub:true}]};};
});
await stage('festival');
section('festival',()=>{
// lantern strings across the boulevards, from lamp post to lamp post
const bulbs=[];const RES=[[PALACE.x,PALACE.z,72],[ARENA.x,ARENA.z,62],[TEMPLE.x,TEMPLE.z,50],[AMPH.x,AMPH.z,24]];
const COLS=[0xff5a5a,0xffc040,0x60e0ff,0xa070ff,0x70ff90,0xff80d0];
for(const g of GATES){const R=wallR(g);for(let r=40;r<R-20;r+=16){const pts=[-1,1].map(sd=>[r*Math.cos(g)-sd*8.6*Math.sin(g),r*Math.sin(g)+sd*8.6*Math.cos(g)]);
  if(pts.some(q=>RES.some(v=>Math.hypot(q[0]-v[0],q[1]-v[1])<v[2])))continue;
  const y0=terrainH(...pts[0])+5.4,y1=terrainH(...pts[1])+5.4;
  for(let k=1;k<20;k++){const f=k/20,x=pts[0][0]+(pts[1][0]-pts[0][0])*f,z=pts[0][1]+(pts[1][1]-pts[0][1])*f,y=y0+(y1-y0)*f-1.3*4*f*(1-f);bulbs.push([x,y,z,COLS[(k+r)%COLS.length]]);}}}
// and in rings around the central square
for(let k=0;k<96;k++){const t=k/96*Math.PI*2,r=21+Math.sin(k*0.5)*0.3,x=r*Math.cos(t),z=r*Math.sin(t);bulbs.push([x,terrainH(0,0)+6.5-Math.abs(Math.sin(t*6))*1.2,z,COLS[k%COLS.length]]);}
const bm=new THREE.MeshBasicMaterial({color:0xffffff});
const bim=new THREE.InstancedMesh(sph(0.16,6,4),bm,bulbs.length);bulbs.forEach((q,i)=>put(bim,i,q[0],q[1],q[2],1,1,1,0,q[3]));
bim.instanceMatrix.needsUpdate=true;bim.userData.noShadow=true;bim.userData.cat='light';bim.userData.dynamic=true;bim.count=0;scene.add(bim);
const hp=new Float32Array(bulbs.length*3),hc=new Float32Array(bulbs.length*3);bulbs.forEach((q,i)=>{hp.set(q.slice(0,3),i*3);col.set(q[3]);hc.set([col.r,col.g,col.b],i*3);});
const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.BufferAttribute(hp,3));hg.setAttribute('izC',new THREE.BufferAttribute(hc,3));
const hmU={izFest:{value:0},izPx:ENV.izPx,izTime:ENV.izTime};
const hm=new THREE.ShaderMaterial({uniforms:hmU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`attribute vec3 izC;uniform float izFest;uniform float izPx;uniform float izTime;varying float vA;varying vec3 vC;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);float d=max(-mv.z,1.0);gl_PointSize=clamp(1.6*izPx/d,1.0,48.0);vA=izFest*exp(-d*0.003)*(0.8+0.2*sin(izTime*3.0+position.x));vC=izC;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float vA;varying vec3 vC;void main(){float r=length(gl_PointCoord-0.5);float a=1.0-smoothstep(0.0,0.5,r);a*=a;if(a*vA<0.003)discard;gl_FragColor=vec4(vC*a*vA,a*vA);}`});
const halos=new THREE.Points(hg,hm);halos.frustumCulled=false;scene.add(halos);
// fireworks: rockets from beside the temple, bursts that fall and fade
const NP=5000,fp=new Float32Array(NP*3),fc=new Float32Array(NP*3),fa=new Float32Array(NP),vel=new Float32Array(NP*3),life=new Float32Array(NP),max=new Float32Array(NP),kind=new Uint8Array(NP),rtype=new Uint8Array(NP),popped=new Uint8Array(NP);
const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(fp,3));fg.setAttribute('izC',new THREE.BufferAttribute(fc,3));fg.setAttribute('izA',new THREE.BufferAttribute(fa,1));
const fm=new THREE.ShaderMaterial({uniforms:{izPx:ENV.izPx},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`attribute vec3 izC;attribute float izA;uniform float izPx;varying float vA;varying vec3 vC;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);float d=max(-mv.z,1.0);gl_PointSize=clamp(1.3*izPx/d*(0.5+izA),1.0,64.0);vA=izA;vC=izC;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float vA;varying vec3 vC;void main(){float r=length(gl_PointCoord-0.5);float a=1.0-smoothstep(0.0,0.5,r);if(a*vA<0.01)discard;gl_FragColor=vec4(vC*a*vA*1.6,a*vA);}`});
const fw=new THREE.Points(fg,fm);fw.frustumCulled=false;fw.renderOrder=5;scene.add(fw);
const flash=new THREE.PointLight(0xffffff,0,400,1.5);scene.add(flash);flash.layers.mask=0xffffffff|0;
const TS=ctx.templeStair,base=[TEMPLE.x,(TS?TS.y0+TS.top[1]:terrainH(TEMPLE.x,TEMPLE.z)+50)+4,TEMPLE.z];
const PAL=[[1,0.35,0.3],[1,0.8,0.3],[0.4,0.85,1],[0.75,0.45,1],[0.5,1,0.55],[1,0.55,0.85],[1,1,0.9]];
let next=0,cursor=0,flashV=0,finaleUntil=0,prevFH=null,fwAlive=0;const R=mkRng(707);
const spawn=(x,y,z,vx,vy,vz,c,l,k)=>{const i=cursor;cursor=(cursor+1)%NP;fp.set([x,y,z],i*3);vel.set([vx,vy,vz],i*3);fc.set(c,i*3);life[i]=l;max[i]=l;kind[i]=k;popped[i]=0;return i;};
// burst shapes: 0 peony, 1 ring, 2 willow, 3 crackle, 4 palm
function burst(x,y,z,type,c){const sp=12+R()*10;
  if(type===1){const nx=R()-0.5,ny=R()*0.6+0.4,nz=R()-0.5,nl=Math.hypot(nx,ny,nz);const n=[nx/nl,ny/nl,nz/nl];let e1=[n[1],-n[0],0];const l1=Math.hypot(...e1)||1;e1=e1.map(v=>v/l1);const e2=[n[1]*e1[2]-n[2]*e1[1],n[2]*e1[0]-n[0]*e1[2],n[0]*e1[1]-n[1]*e1[0]];
    for(let k=0;k<90;k++){const a=k/90*Math.PI*2,s2=sp*1.05;spawn(x,y,z,(Math.cos(a)*e1[0]+Math.sin(a)*e2[0])*s2,(Math.cos(a)*e1[1]+Math.sin(a)*e2[1])*s2,(Math.cos(a)*e1[2]+Math.sin(a)*e2[2])*s2,c,1.8+R()*0.5,3);}}
  else if(type===2){for(let k=0;k<170;k++){const u=R()*2-1,a=R()*6.283,r=Math.sqrt(1-u*u),s2=sp*0.65*(0.8+R()*0.3);spawn(x,y,z,r*Math.cos(a)*s2,u*s2,r*Math.sin(a)*s2,[1,0.78,0.35],3.2+R()*1.0,5);}}
  else if(type===4){for(let k=0;k<9;k++){const a=k/9*Math.PI*2+R()*0.3,up=0.3+R()*0.5,dx=Math.cos(a)*(1-up*0.5),dz=Math.sin(a)*(1-up*0.5);for(let j=0;j<14;j++){const s2=sp*(0.35+0.7*j/14);spawn(x,y,z,dx*s2,up*s2,dz*s2,c,1.6+R()*0.6,3);}}}
  else{const n=90+Math.floor(R()*60);for(let k=0;k<n;k++){const u=R()*2-1,a=R()*6.283,r=Math.sqrt(1-u*u),s2=sp*(0.8+R()*0.3);spawn(x,y,z,r*Math.cos(a)*s2,u*s2,r*Math.sin(a)*s2,R()<0.15?[1,1,0.9]:c,1.8+R()*1.0,type===3?6:3);}}}
let last=performance.now();
animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;const tot=ctx.totalHours||15,f=festF(tot),h=ctx.hour||0;
  bim.count=f>0.02?bulbs.length:0;const lv=0.25+0.75*f;bm.color.setRGB(lv,lv,lv);hmU.izFest.value=f*nightF(h);
  const show=f>0.6&&(h>=20||h<1)&&ENV.izRain.value<0.3&&DISPLAY_LIFE();
  if(show&&prevFH!==null&&prevFH<23.9&&h>=23.9)finaleUntil=now+12000;prevFH=h;   // the finale runs twelve real seconds whatever the day length
  const finale=show&&now<finaleUntil;
  if(show&&now>next){next=now+(finale?180+R()*220:1100+R()*1500);for(let m=0;m<(finale?2:1);m++){
    const x=base[0]+(R()-0.5)*(finale?60:30),z=base[2]+(R()-0.5)*(finale?60:30);const i=spawn(x,base[1],z,(R()-0.5)*3,32+R()*12,(R()-0.5)*3,[1,0.8,0.5],1.3+R()*0.5,1);rtype[i]=Math.floor(R()*5);}}
  let alive=0;if(!show&&!fwAlive){fw.visible=false;flashV=Math.max(0,flashV-dt*3);flash.intensity=1.6*flashV;ENV.izFw.value.z=0.55*flashV;return;}
  for(let i=0;i<NP;i++){if(life[i]<=0){fa[i]=0;continue;}alive++;life[i]-=dt;const e=i*3;
    if(kind[i]===1){vel[e+1]-=9*dt;fp[e]+=vel[e]*dt;fp[e+1]+=vel[e+1]*dt;fp[e+2]+=vel[e+2]*dt;fa[i]=1;
      if(R()<0.6)spawn(fp[e],fp[e+1],fp[e+2],(R()-0.5),-(R()),(R()-0.5),[1,0.7,0.4],0.5,2);
      if(life[i]<=0){const c=rtype[i]===2?[1,0.78,0.35]:PAL[Math.floor(R()*PAL.length)];flashV=1;flash.position.set(fp[e],fp[e+1],fp[e+2]);flash.color.setRGB(c[0],c[1],c[2]);ENV.izFwC.value.setRGB(c[0],c[1],c[2]);ENV.izFw.value.x=fp[e];ENV.izFw.value.y=fp[e+2];
        if(ctx.onFirework)ctx.onFirework(fp[e],fp[e+1],fp[e+2]);
        burst(fp[e],fp[e+1],fp[e+2],rtype[i],c);}}
    else{const k=kind[i],drag=k===3||k===6?Math.pow(0.35,dt):k===5?Math.pow(0.6,dt):k===7?Math.pow(0.2,dt):1;vel[e]*=drag;vel[e+1]=vel[e+1]*drag-(k===3||k===6?6:k===5?4:k===7?2:3)*dt;vel[e+2]*=drag;fp[e]+=vel[e]*dt;fp[e+1]+=vel[e+1]*dt;fp[e+2]+=vel[e+2]*dt;
      const u=life[i]/max[i];
      if(k===5&&R()<0.08)spawn(fp[e],fp[e+1],fp[e+2],0,-0.5,0,[0.9,0.6,0.25],0.6,2);
      if(k===6&&u<0.45&&!popped[i]){popped[i]=1;life[i]=0;for(let j=0;j<3;j++)spawn(fp[e],fp[e+1],fp[e+2],(R()-0.5)*9,(R()-0.5)*9,(R()-0.5)*9,[1,1,0.95],0.22+R()*0.1,7);}
      fa[i]=Math.max(0,u)*(k===3&&u<0.35?(R()<0.5?1:0.2):1)*(k===5?0.8:1);}}
  fwAlive=alive;fw.visible=alive>0;if(alive){fg.attributes.position.needsUpdate=true;fg.attributes.izC.needsUpdate=true;fg.attributes.izA.needsUpdate=true;}
  flashV=Math.max(0,flashV-dt*3);flash.intensity=1.6*flashV;ENV.izFw.value.z=0.55*flashV;});
function DISPLAY_LIFE(){return !document.hidden;}
ctx.festival={bulbs:bulbs.length};
});
await stage('caravans');
section('caravans',()=>{
