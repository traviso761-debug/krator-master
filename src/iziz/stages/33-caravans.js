// ---------- caravans: a driver, three pack beasts and a cart, in from the jungle to a market and back; they wait at the gates while the doors are shut ----------
const {bodyG,headG,ROBES}=ctx.people;const NAV=ctx.patrol.NAV,groundAt=ctx.groundAt;
const hideM=new THREE.MeshLambertMaterial({color:0x7a6450});hideM.userData.tex='canopy';const hornM=lamC(0xd9c9a0),packC=[0xc9442a,0x2f8f8a,0xe0a030,0x7a3d8a,0xd9d1b0];
const cartM=new THREE.MeshLambertMaterial({color:0x8a6a45});cartM.userData.tex='timber';const R=mkRng(808);
// pack beasts are drawn as instanced parts (six draw calls for all of them)
const NB=20,BI={body:new THREE.InstancedMesh(sph(1,10,8),hideM,NB),neck:new THREE.InstancedMesh(sph(1,8,6),hideM,NB*2),horn:new THREE.InstancedMesh(cone(0.08,0.7,5),hornM,NB*2),
  pack:new THREE.InstancedMesh(boxG,new THREE.MeshLambertMaterial({color:0xffffff}),NB*3),leg:new THREE.InstancedMesh(cyl(0.16,0.12,1,6),hideM,NB*4)};
for(const k in BI){BI[k].userData.life=true;BI[k].frustumCulled=false;scene.add(BI[k]);}
BI.neck.userData.noShadow=BI.horn.userData.noShadow=BI.leg.userData.noShadow=true;
let nBeast=0;
function beast(){const id=nBeast++;for(let j=0;j<3;j++)BI.pack.setColorAt(id*3+j,col.set(packC[Math.floor(R()*packC.length)]));return {beast:id,legs:[],len:4.2};}
const bp=new THREE.Object3D(),bk=new THREE.Object3D();bp.add(bk);
const bput=(im,i,px,py,pz,sx,sy,sz,rx,rz)=>{bk.position.set(px,py,pz);bk.scale.set(sx,sy,sz);bk.rotation.set(rx||0,0,rz||0);bp.updateMatrixWorld(true);im.setMatrixAt(i,bk.matrixWorld);};
function drawBeast(id,x,y,z,h,ph,moving,hide){bp.position.set(x,hide?-500:y,z);bp.rotation.set(0,h,0);const s0=hide?0.001:1;
  bput(BI.body,id,0,2.3,0,0.9*s0,0.85*s0,1.7*s0);bput(BI.neck,id*2,0,2.9,1.9,0.42*s0,0.45*s0,0.6*s0);bput(BI.neck,id*2+1,0,3.2,2.5,0.36*s0,0.34*s0,0.52*s0);
  bput(BI.horn,id*2,-0.22,3.55,2.4,s0,s0,s0,0,0.5);bput(BI.horn,id*2+1,0.22,3.55,2.4,s0,s0,s0,0,-0.5);
  bput(BI.pack,id*3,-0.95,2.0,0,0.5*s0,0.9*s0,1.3*s0);bput(BI.pack,id*3+1,0.95,2.0,0,0.5*s0,0.9*s0,1.3*s0);bput(BI.pack,id*3+2,0,3.05,-0.1,1.1*s0,0.5*s0,1.0*s0);
  [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([sx,sz],j)=>{const a=moving?Math.sin(ph+(j%3===0?0:Math.PI))*0.45:0;bput(BI.leg,id*4+j,sx*0.5,1.9-0.95*Math.cos(a),sz*1.05-0.95*Math.sin(a),s0,1.9*s0,s0,a);});}
function driver(){const g=new THREE.Group();g.userData.dynamic=true;g.userData.life=true;g.add(mesh(bodyG,lamC(ROBES[Math.floor(R()*ROBES.length)]),0,0,0,1,1.55,1,0));g.add(mesh(headG,lamC(0xd9b58a),0,1.78,0,1,1,1,0));
  g.add(mesh(boxG,lamC(0x4a3a2a),0.45,0,0.2,0.06,2.4,0.06,0));scene.add(g);ctx.bakeGroup(g);return {g,legs:[],len:1.5};}
function cart(){const g=new THREE.Group();g.userData.dynamic=true;g.userData.life=true;g.add(mesh(boxG,cartM,0,1.0,0,2.2,0.4,3.4,0));
  for(let k=0;k<3;k++)g.add(mesh(boxG,lamC(packC[Math.floor(R()*packC.length)]),(k-1)*0.65,1.4,(R()-0.5)*1.2,0.6,0.6+R()*0.5,0.8,0));
  const wheels=[];for(const sx of [-1,1]){const w=new THREE.Group();w.position.set(sx*1.25,0.8,0);const wm=mesh(cyl(0.8,0.8,0.18,12),cartM,0,0,0,1,1,1,0);wm.rotation.z=Math.PI/2;w.add(wm);g.add(w);wheels.push(w);}
  g.add(mesh(boxG,cartM,0,0.9,2.4,0.12,0.12,1.8,0));scene.add(g);ctx.bakeGroup(g);return {g,wheels,legs:[],len:3.6};}
const lane=4.8;
const MK=[[-125,60],[60,150],[-70,-140]];
const CAR=[];
GATES.forEach((g,gi)=>{const R0=wallR(g),inside=[(R0-30)*Math.cos(g),(R0-30)*Math.sin(g)];
  let mk=MK[0];for(const m of MK)if(Math.hypot(m[0]-inside[0],m[1]-inside[1])<Math.hypot(mk[0]-inside[0],mk[1]-inside[1]))mk=m;
  const mkCell=NAV.nearest(mk[0]+14,mk[1],14,NAV.compAt(...inside)),inCell=NAV.nearest(inside[0],inside[1],10);
  const rt=mkRoute([[560*Math.cos(g),560*Math.sin(g)],[(R0-30)*Math.cos(g),(R0-30)*Math.sin(g)]]);
  for(let k=0;k<2;k++){const units=[driver(),beast(),beast(),beast(),cart()];
    CAR.push({g,gi,R0,rt,s:0,units,trail:[],phase:'away',wait:3+k*70+gi*25+R()*20,x:0,z:0,h:0,path:null,pi:0,v:1.9,
      market:mkCell>=0?NAV.XZ(mkCell):null,inside:inCell>=0?NAV.XZ(inCell):inside,mkName:['the western market','the southern market','the northern market'][MK.indexOf(mk)]});}});
// dock carts: from the quay along the dock road, up the south causeway, to the southern market and back
{const g=Math.PI/2,R0=wallR(g),inside=[0,R0-30],P=DOCKROAD.pts.slice();const jr=Math.hypot(...P[P.length-1]);for(let r=jr-20;r>R0-30;r-=20)P.push([0,r]);P.push(inside);
 const rt=mkRoute(P),mk=[60,150],mkCell=NAV.nearest(mk[0]+14,mk[1],14,NAV.compAt(...inside)),inCell=NAV.nearest(inside[0],inside[1],10);
 for(let k=0;k<2;k++){const units=[driver(),beast(),cart()];const c={g,gi:0,R0,rt,s:16,s0:16,units,trail:[],phase:'load',wait:5+k*60,x:0,z:0,h:0,path:null,pi:0,v:1.9,dock:true,
   market:mkCell>=0?NAV.XZ(mkCell):null,inside:inCell>=0?NAV.XZ(inCell):inside,mkName:'the southern market'};const p=atS(rt,16,1);c.x=p[0];c.z=p[1];CAR.push(c);}}
function mkRoute(P){const L=[0];for(let i=1;i<P.length;i++)L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return {P,L,tot:L[L.length-1]};}
function atS(rt,sv,dir){sv=clamp(sv,0,rt.tot);let i=1;while(i<rt.L.length-1&&rt.L[i]<sv)i++;const a=rt.P[i-1],b=rt.P[i],seg=rt.L[i]-rt.L[i-1]||1,f=(sv-rt.L[i-1])/seg,fx=(b[0]-a[0])/seg*dir,fz=(b[1]-a[1])/seg*dir;
  return [a[0]+(b[0]-a[0])*f-fz*lane,a[1]+(b[1]-a[1])*f+fx*lane];}
function setPath(c,pts){c.path=pts;c.pi=0;}
// the gate is 105 units before the end of every route; queue behind anyone already waiting or ahead of us outside
function queueStop(c){const same=CAR.filter(o=>o!==c&&o.gi===c.gi&&(o.phase==='queue'||(o.phase==='in'&&o.s>c.s&&o.s<o.rt.tot-100)));return c.rt.tot-105-same.length*24;}
function step(c,dt,closed){
  if(c.phase==='away'||c.phase==='load'){c.wait-=dt;if(c.wait<=0){c.phase='in';c.s=c.s0||0;if(!c.dock)c.trail=[];const p=atS(c.rt,c.s,1);c.x=p[0];c.z=p[1];}return false;}
  if(c.phase==='in'){const stop=closed&&c.s<c.rt.tot-104?queueStop(c):c.rt.tot;c.s=Math.min(stop,c.s+c.v*dt);const p=atS(c.rt,c.s,1);move(c,p[0],p[1]);
    if(c.s>=c.rt.tot-0.01){c.phase='city';const r=c.market?NAV.route(c.x,c.z,c.market[0],c.market[1]):null;if(r)setPath(c,r);else{c.phase='trade';c.wait=30;}}
    else if(closed&&c.s>=stop-0.01)c.phase='queue';return c.s<stop-0.01;}
  if(c.phase==='queue'){if(!closed)c.phase='in';return false;}
  if(c.phase==='city'||c.phase==='cityOut'){if(follow(c,dt)){if(c.phase==='city'){c.phase='trade';c.wait=35+R()*30;}else{c.phase='out';c.s=c.rt.tot;}}return true;}
  if(c.phase==='trade'){c.wait-=dt;if(c.wait<=0&&!closed){const r=NAV.route(c.x,c.z,c.inside[0],c.inside[1]);if(r){c.phase='cityOut';setPath(c,r);}else{c.phase='out';c.s=c.rt.tot;}}return false;}
  if(c.phase==='out'){if(closed&&c.s>c.rt.tot-20)return false;c.s-=c.v*dt;const p=atS(c.rt,c.s,-1);move(c,p[0],p[1]);
    if(c.s<=(c.s0||0)){if(c.dock){c.phase='load';c.wait=25+R()*30;}else{c.phase='away';c.wait=30+R()*90;}}return true;}
  return false;}
function move(c,x,z){const dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz);if(d>1e-4){let e=Math.atan2(dx,dz)-c.h;e=Math.atan2(Math.sin(e),Math.cos(e));c.h+=e*0.2;}c.x=x;c.z=z;
  const L=c.trail[c.trail.length-1];if(!L||Math.hypot(x-L[0],z-L[1])>0.5){c.trail.push([x,z]);if(c.trail.length>70)c.trail.shift();}}
function follow(c,dt){const t=c.path[c.pi],dx=t[0]-c.x,dz=t[1]-c.z,d=Math.hypot(dx,dz),st=Math.min(d,c.v*dt);if(d>1e-4)move(c,c.x+dx/d*st,c.z+dz/d*st);if(d-st<0.3){c.pi++;if(c.pi>=c.path.length){c.path=null;return true;}}return false;}
function along(c,back){const tr=c.trail;let px=c.x,pz=c.z,acc=0;for(let k=tr.length-1;k>=0;k--){const q=tr[k],L=Math.hypot(px-q[0],pz-q[1]);if(L>1e-6&&acc+L>=back){const f=(back-acc)/L;return [px+(q[0]-px)*f,pz+(q[1]-pz)*f,Math.atan2(px-q[0],pz-q[1])];}acc+=L;px=q[0];pz=q[1];}return [px-Math.sin(c.h)*(back-acc),pz-Math.cos(c.h)*(back-acc),c.h];}
let last=performance.now();
animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;const closed=!!ctx.gatesClosed,T=now/1000;
  for(const c of CAR){const moving=step(c,dt,closed),vis=c.phase!=='away';let back=0;
    if(c.phase==='load'&&!c.trail.length){for(let k=40;k>0;k--){const q=atS(c.rt,c.s-k*0.4,1);c.trail.push(q);}const q2=atS(c.rt,c.s+1,1);c.h=Math.atan2(q2[0]-c.x,q2[1]-c.z);}
    c.units.forEach((u,k)=>{if(u.beast!==undefined&&!vis){drawBeast(u.beast,0,0,0,0,0,false,true);return;}if(u.g)u.g.visible=vis;if(!vis)return;const q=k?along(c,back):[c.x,c.z,c.h];back+=u.len*0.5+(c.units[k+1]?c.units[k+1].len*0.5+0.8:0);
      if(u.beast!==undefined){drawBeast(u.beast,q[0],groundAt(q[0],q[1])-0.15,q[1],q[2],T*3.4+k,moving,false);return;}
      u.g.position.set(q[0],groundAt(q[0],q[1])-0.15,q[1]);u.g.rotation.y=q[2];
      const ph=T*3.4+k;u.legs.forEach((L,j)=>{L.rotation.x=moving?Math.sin(ph+(j%3===0?0:Math.PI))*0.45:0;});
      if(u.wheels)u.wheels.forEach(w=>{if(moving)w.rotation.x-=dt*c.v/0.8;});
      if(!u.legs.length&&!u.wheels)u.g.position.y+=moving?Math.abs(Math.sin(ph*1.5))*0.08:0;});
    c.pos=[c.x,groundAt(c.x,c.z)+2,c.z];}
  for(const k in BI)BI[k].instanceMatrix.needsUpdate=true;});
ctx.caravans=CAR;
ctx.caravanInfo=c=>c.dock?({title:'A dock cart',follow:true,pos:()=>c.pos,live:()=>[{t:{load:'Loading fish and crates at the docks',in:'On the dock road to the south gate',queue:'Waiting at the south gate for the doors to open',city:'Taking the catch to the southern market',trade:'Unloading at the southern market',cityOut:'Heading back to the gate',out:'Returning to the docks'}[c.phase]},{t:'A driver, a pack beast and a cart',sub:true}]}):({title:'A caravan',follow:true,pos:()=>c.phase==='away'?null:c.pos,live:()=>[{t:{in:'On the road in towards the '+['south','west','north-east'][c.gi]+' gate',queue:'Waiting at the gate for the doors to open',city:'Making for '+c.mkName,trade:'Trading at '+c.mkName,cityOut:'Heading back to the gate',out:'Leaving for the jungle',away:'Away'}[c.phase]},{t:'A driver, three pack beasts and a cart',sub:true}]});
});
await stage('stairs');
section('stairs',()=>{
// stone steps wherever a street or plaza is steeper than about 17 degrees: each tread is the ground rounded up to the next riser
const G=STAIRS.G,O=STAIRS.O,N=STAIRS.N,RS=0.32,top=new Float32Array(N*N).fill(NaN),W=ctx.walkable,inLot=ctx.inLot;
const stairM=new THREE.MeshLambertMaterial({color:0xffffff});stairM.userData.tex='sand';
const steps=new THREE.InstancedMesh(boxG,stairM,24000);let n=0;
for(let j=0;j<N&&n<24000;j++)for(let i=0;i<N;i++){const x=O+(i+0.5)*G,z=O+(j+0.5)*G,pp=polar(x,z);if(pp.r>wallR(pp.t)-7||!W(x,z))continue;
  const gx=meshH(x+0.35,z)-meshH(x-0.35,z),gz=meshH(x,z+0.35)-meshH(x,z-0.35);if(Math.hypot(gx,gz)/0.7<0.3)continue;
  if(inLot(x,z,0.1,false))continue;
  let hmax=-1e9,hmin=1e9;for(const [ox,oz] of [[-1,-1],[1,-1],[-1,1],[1,1],[0,0]]){const h=meshH(x+ox*G/2,z+oz*G/2);hmax=Math.max(hmax,h);hmin=Math.min(hmin,h);}
  const t=Math.ceil((hmax+0.02)/RS)*RS,b=hmin-0.6;top[j*N+i]=t;
  const v=hash3(Math.round(t/RS),i>>3,j>>3);put(steps,n++,x,b,z,G,t-b,G,0,(Math.round(219+25*v)<<16)|(Math.round(204+20*v)<<8)|Math.round(173+15*v));
  if(n>=24000)break;}
steps.count=n;steps.userData.noShadow=true;steps.userData.sector=true;steps.instanceMatrix.needsUpdate=true;if(steps.instanceColor)steps.instanceColor.needsUpdate=true;if(n)scene.add(steps);
STAIRS.top=top;
// grass tufts on the painted verges, clear of buildings
const bladeG=new THREE.ConeGeometry(0.06,1,3);bladeG.translate(0,0.5,0);
const grassM=new THREE.MeshLambertMaterial({color:0xffffff});grassM.userData.reed=0.12;grassM.userData.lod=[200,250];
const tufts=new THREE.InstancedMesh(bladeG,grassM,9000);let nt=0;const GR=[0x4f8a3a,0x5c9a44,0x3f7a34,0x6aa84a,0x7a9a4a];
const R=mkRng(3131);
for(let k=0;k<60000&&nt<9000;k++){const x=R()*560-280,z=R()*560-280;if(!vergeAt(x,z)||inLot(x,z,0.2,false)||W(x,z))continue;
  const y=meshH(x,z)-0.05,m=3+Math.floor(R()*5),cc=GR[Math.floor(R()*GR.length)];
  for(let q=0;q<m&&nt<9000;q++){const a=R()*6.283,r=R()*0.35;putE(tufts,nt++,x+Math.cos(a)*r,y,z+Math.sin(a)*r,1,0.3+R()*0.5,1,(R()-0.5)*0.5,R()*6.283,(R()-0.5)*0.5,cc);}}
tufts.count=nt;tufts.instanceMatrix.needsUpdate=true;if(tufts.instanceColor)tufts.instanceColor.needsUpdate=true;tufts.userData.noShadow=true;tufts.userData.sector=true;tufts.userData.cat='veg';if(nt)scene.add(tufts);
let vp=0;for(let k=0;k<VERGE.length;k++)vp+=VERGE[k];
ctx.stairs={steps:n,tufts:nt,vergePixels:vp};
});
await stage('details');
section('details',()=>{
const {bodyG,headG,ROBES}=ctx.people;const inLot=ctx.inLot;const R=mkRng(1001);const groundAt=ctx.groundAt;
const timber=new THREE.MeshLambertMaterial({color:0x8a6a45});timber.userData.tex='timber';
// ---- posters and painted signs on side walls: sixteen designs, faded and torn ones in the outer ring, festival announcements the day before ----
{const cv=document.createElement('canvas');cv.width=512;cv.height=512;const g=cv.getContext('2d');
 const BG=['#c9442a','#2f8f8a','#e0a030','#3b4a8a','#7a3d8a','#d9d1b0','#1e2a3a','#b8552a','#e8c27a','#1f5f7a','#f0e0c8','#5a2a3a'],FG=['#f4e6c0','#1e1a2a','#ffd060','#f4e6c0','#ffd060','#8a2a2a','#5fd0ff','#f4e6c0','#8a3a1a','#f4e6c0','#2a4a6a','#ffb070'];
 const letters=(x0,y0,k,rows)=>{for(let j=0;j<rows;j++){let x=x0+22;while(x<x0+104){const w=4+((k*7+j*13+x)%9);g.fillRect(x,y0+92+j*9,w,5);x+=w+4;}}};
 for(let k=0;k<16;k++){const x0=(k%4)*128,y0=Math.floor(k/4)*128;
   if(k>=12){   // festival announcements: bursts on a night sky
     g.fillStyle=['#10123a','#1a0e2e','#0e2230','#221030'][k-12];g.fillRect(x0+4,y0+4,120,120);const cols=['#ff5a5a','#ffc040','#60e0ff','#a070ff','#70ff90','#ff80d0'];
     for(let b2=0;b2<3;b2++){const cx=x0+28+b2*34+((k*13)%10),cy=y0+34+((k+b2)%2)*16,rr=12+b2*3;g.strokeStyle=cols[(k+b2)%6];g.lineWidth=2;for(let r2=0;r2<14;r2++){const a2=r2/14*Math.PI*2;g.beginPath();g.moveTo(cx+Math.cos(a2)*3,cy+Math.sin(a2)*3);g.lineTo(cx+Math.cos(a2)*rr,cy+Math.sin(a2)*rr);g.stroke();}}
     g.fillStyle='#ffd060';g.fillRect(x0+14,y0+72,100,12);IZ.draw(g,'Yolshae',x0+64,y0+102,22,{color:'#f4e6c0',maxW:92,weight:0.11});g.strokeStyle='#ffd060';g.lineWidth=2;g.strokeRect(x0+8,y0+8,112,112);continue;}
   const bi=k%BG.length;g.fillStyle=BG[bi];g.fillRect(x0+4,y0+4,120,120);g.strokeStyle=FG[bi];g.lineWidth=3;g.strokeRect(x0+10,y0+10,108,108);g.fillStyle=FG[bi];g.strokeStyle=FG[bi];
   if(k===8){for(let r2=0;r2<12;r2++){const a2=r2/12*Math.PI*2;g.beginPath();g.moveTo(x0+64,y0+50);g.lineTo(x0+64+Math.cos(a2)*34,y0+50+Math.sin(a2)*34);g.lineWidth=4;g.stroke();}g.beginPath();g.arc(x0+64,y0+50,14,0,7);g.fill();}
   else if(k===9){g.lineWidth=4;for(let j=0;j<4;j++){g.beginPath();for(let x=0;x<=100;x+=4){const yy=y0+30+j*14+Math.sin(x*0.15+j)*5;x?g.lineTo(x0+14+x,yy):g.moveTo(x0+14,yy);}g.stroke();}}
   else if(k===10){g.beginPath();g.moveTo(x0+26,y0+70);g.lineTo(x0+102,y0+70);g.lineTo(x0+90,y0+80);g.lineTo(x0+38,y0+80);g.closePath();g.fill();g.fillRect(x0+62,y0+22,3,48);g.beginPath();g.moveTo(x0+66,y0+24);g.lineTo(x0+96,y0+64);g.lineTo(x0+66,y0+64);g.closePath();g.fill();}
   else if(k===11){g.beginPath();g.ellipse(x0+64,y0+52,28,34,0,0,7);g.fill();g.fillStyle=BG[bi];g.beginPath();g.ellipse(x0+52,y0+46,6,4,0,0,7);g.ellipse(x0+76,y0+46,6,4,0,0,7);g.fill();g.fillRect(x0+54,y0+66,20,4);g.fillStyle=FG[bi];}
   else if(k%3===0){g.beginPath();g.arc(x0+64,y0+52,26,0,7);g.fill();g.fillStyle=BG[bi];g.beginPath();g.arc(x0+64,y0+52,14,0,7);g.fill();g.fillStyle=FG[bi];}
   else if(k%3===1){for(let j=0;j<5;j++)g.fillRect(x0+24+j*16,y0+26+j*4,10,52-j*8);}
   else{g.beginPath();g.moveTo(x0+64,y0+22);g.lineTo(x0+96,y0+80);g.lineTo(x0+32,y0+80);g.closePath();g.fill();}
   IZ.draw(g,['Muneth','Vemeth','vesh','Huleth','Iziz iz','Weneth','Koreth','mae','Shaevae','Vaeren','Naeleth','Luleth'][k],x0+64,y0+104,20,{color:FG[bi],maxW:88,weight:0.11});}
 const tex=new THREE.CanvasTexture(cv);const pg=new THREE.PlaneGeometry(1,1);pg.translate(0,0.5,0);
 const pm=new THREE.MeshLambertMaterial({color:0xffffff,map:tex});
 setEnv(pm,{id:'poster16',lod:[240,300],vpars:'attribute float izVar;attribute float izFade;varying float izFadeV;varying vec2 izPU;varying float izVarV;\n',fpars:'varying float izFadeV;varying vec2 izPU;varying float izVarV;\n',
   vbody:'izFadeV=izFade;izPU=uv;izVarV=izVar;\n',
   fbody:'if(izFadeV>0.5){float izTear=0.84+0.06*sin(izPU.x*23.0+izVarV*3.0)+0.04*sin(izPU.x*57.0+izVarV);if(izPU.y>izTear||izPU.x<0.05+0.04*sin(izPU.y*31.0+izVarV))discard;diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.8,0.76,0.68),0.5);}\n'});
 const f0=pm.onBeforeCompile;pm.onBeforeCompile=sh=>{f0(sh);sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_UV\nvUv=vec2((vUv.x+mod(izVar,4.0))/4.0,(vUv.y+3.0-floor(izVar/4.0))/4.0);\n#endif');};
 const makeSet=N=>{const gg=pg.clone();gg.setAttribute('izVar',new THREE.InstancedBufferAttribute(new Float32Array(N),1));gg.setAttribute('izFade',new THREE.InstancedBufferAttribute(new Float32Array(N),1));const im=new THREE.InstancedMesh(gg,pm,N);im.userData.noShadow=true;return im;};
 const posters=makeSet(320),fest=makeSet(60);let n=0,nf=0;
 const nearBlvd=(x,z)=>GATES.some(g=>{const along=x*Math.cos(g)+z*Math.sin(g),perp=Math.abs(-x*Math.sin(g)+z*Math.cos(g));return along>0&&perp<22;});
 const place=(im,idx,l,v,fade)=>{const b=bodyOf(l),y=terrainH(l.x,l.z)-0.6,wide=v===6||v===7,pw=Math.min(wide?2.2:1.1,b.d-0.6),ph=(wide?1.1:1.5)*pw/(wide?2.2:1.1);if(pw<0.6)return false;
   for(let tries=0;tries<6;tries++){const sd=R()<0.5?-1:1,lz=(R()-0.5)*Math.max(0,b.d-pw-0.6),yy=1.3+R()*0.6;
     if(!claimFace(l,sd>0?'+x':'-x',lz,pw/2,yy-0.1,yy+ph+0.1))continue;   // a free patch of wall, or try elsewhere
     const q=loc(l.x,l.z,sd*(b.w/2+0.14),lz,l.ry);putE(im,idx,q[0],y+yy,q[1],pw,ph,1,0,l.ry+sd*Math.PI/2,0);im.geometry.attributes.izVar.array[idx]=v;im.geometry.attributes.izFade.array[idx]=fade;(im.userData.lots=im.userData.lots||[])[idx]=l;return true;}
   return false;};
 for(const l of lots){if(l.fixed||!['box','tier','midrise','pueblo','hall','domed'].includes(l.kind))continue;const pp=polar(l.x,l.z),r01=pp.r/wallR(pp.t);if(r01<0.2)continue;
   if(nf<60&&nearBlvd(l.x,l.z)&&hash3(l.x,l.z,151)<0.7){if(place(fest,nf,l,12+Math.floor(R()*4),0)){nf++;l.festPoster=true;}continue;}
   if(n>=320||hash3(l.x,l.z,121)>0.36)continue;const cnt=1+(R()<0.45?1:0);
   for(let k=0;k<cnt&&n<320;k++){if(place(posters,n,l,Math.floor(R()*12),r01>0.62&&R()<0.5?1:0)){n++;l.poster=true;l.posterN=(l.posterN||0)+1;}}}
 posters.count=n;fest.count=0;if(n)scene.add(posters);if(nf)scene.add(fest);
 const festDay=d=>d%3===2||d===FEST.forceDay;
 animHooks.push(()=>{const tot=ctx.totalHours||15,d0=Math.floor(tot/24),h=tot-d0*24,d=h<3?d0-1:d0;fest.count=(festDay(d)||festDay(d+1))?nf:0;});
 ctx.details={posters:n,festPosters:nf};
 // a few posters swap for framed prints of the Iziz painting (painting.jpg, served next to this page); if it fails to load they stay posters
 {const ART=DATA.city.art;
  const cands=[];for(let i=0;i<n;i++){const v=posters.geometry.attributes.izVar.array[i],l=posters.userData.lots[i];
    if(posters.geometry.attributes.izFade.array[i]||v===6||v===7||!l)continue;const pp=polar(l.x,l.z);cands.push([pp.r/wallR(pp.t),i,l]);}
  cands.sort((a,b)=>a[0]-b[0]);
  const pick=[],used=new Set(),step=Math.max(1,Math.floor(cands.length*0.6/ART.count));
  for(let j=0;j<cands.length&&pick.length<ART.count;j+=step)if(!used.has(cands[j][2])){used.add(cands[j][2]);pick.push(cands[j]);}
  // where the prints hang, known now so the camera views can include one before the image arrives
  {const M=new THREE.Matrix4(),P=new THREE.Vector3(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),N=new THREE.Vector3();
   ctx.artPrints=pick.map(([,i,l])=>{posters.getMatrixAt(i,M);M.decompose(P,Q,S);N.set(0,0,1).applyQuaternion(Q);return {x:P.x,y:P.y+S.y/2,z:P.z,nx:N.x,nz:N.z,lot:l};});}
  const img=new Image();
  img.onload=()=>{try{
    const bw=Math.round(img.width*ART.border),cv2=document.createElement('canvas');cv2.width=img.width+2*bw;cv2.height=img.height+2*bw;
    const g2=cv2.getContext('2d');g2.fillStyle=ART.frame;g2.fillRect(0,0,cv2.width,cv2.height);g2.drawImage(img,bw,bw);
    const at=new THREE.CanvasTexture(cv2);at.anisotropy=4;const aspect=cv2.width/cv2.height;
    const am=new THREE.MeshLambertMaterial({color:0xffffff,map:at});setEnv(am,{id:'posterArt',lod:[240,300]});
    const art=new THREE.InstancedMesh(pg.clone(),am,pick.length);art.userData.noShadow=true;
    const M=new THREE.Matrix4(),P=new THREE.Vector3(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),N=new THREE.Vector3(),va=posters.geometry.attributes.izVar,fa=posters.geometry.attributes.izFade;
    pick.sort((a,b)=>b[1]-a[1]).forEach(([,i,l],k)=>{posters.getMatrixAt(i,M);M.decompose(P,Q,S);
      const h=S.x/aspect;P.y+=(S.y-h)/2;S.y=h;art.setMatrixAt(k,M.compose(P,Q,S));
      l.artPrint=true;if(!--l.posterN)l.poster=false;
      const last=n-1;if(i!==last){posters.getMatrixAt(last,M);posters.setMatrixAt(i,M);va.array[i]=va.array[last];fa.array[i]=fa.array[last];posters.userData.lots[i]=posters.userData.lots[last];}n--;});
    posters.count=n;posters.instanceMatrix.needsUpdate=true;va.needsUpdate=true;fa.needsUpdate=true;art.instanceMatrix.needsUpdate=true;
    if(!n)scene.remove(posters);scene.add(art);ctx.details.posters=n;ctx.details.artPrints=pick.length;
  }catch(e){console.warn('art prints skipped:',e);}};
  img.onerror=()=>console.warn('art prints skipped: could not load',ART.src);
  if(pick.length)img.src=ART.src;}}
// ---- hanging baskets beside doors, roses climbing through the wall ivy, window boxes that change colour each day ----
{const iron=lamC(0x2f2b28),basketM=new THREE.MeshLambertMaterial({color:0x8a5a3a,side:THREE.DoubleSide});basketM.userData.tex='timber';
 basketM.userData.lod=[230,290];const NB=260,br=new THREE.InstancedMesh(boxG,Object.assign(lamC(0x2f2b28).clone(),{userData:{lod:[230,290]}}),NB*2),bk=new THREE.InstancedMesh(hemiG,basketM,NB),fol=new THREE.InstancedMesh(sph(1,6,4),smallLeafM,NB*4),bl=new THREE.InstancedMesh(sph(0.1,5,4),Object.assign(new THREE.MeshLambertMaterial({color:0xffffff}),{userData:{lod:[250,310]}}),NB*6+2400);
 let nbr=0,nbk=0,nfo=0,nbl=0;const GR=[0x3f9a4c,0x4cb35a,0x62c488,0x6fb04a];const BLOOM=[0xff5fa2,0xffd34a,0xe8443a,0xf4f0e6,0xb06adf,0xff8a3a];
 for(const l of lots){if(nbk>=NB-1)break;if(l.fixed||!['box','tier','midrise','hall'].includes(l.kind)||hash3(l.x,l.z,161)>0.22)continue;const pp=polar(l.x,l.z);if(pp.r<0.2*wallR(pp.t))continue;
   const b=bodyOf(l);if(b.w<5)continue;const y=terrainH(l.x,l.z)-0.6;l.baskets=true;
   for(const sd of [-1,1]){const lx=sd*b.w*0.38,wall=loc(l.x,l.z,lx,b.d/2+0.35,l.ry),tip=loc(l.x,l.z,lx,b.d/2+0.68,l.ry);
     put(br,nbr++,wall[0],y+4.4,wall[1],0.08,0.08,0.7,l.ry);put(br,nbr++,tip[0],y+3.95,tip[1],0.03,0.45,0.03,l.ry);
     putE(bk,nbk++,tip[0],y+3.95,tip[1],0.42,0.36,0.42,Math.PI,0,0);
     for(let k=0;k<3;k++){const a=k/3*Math.PI*2+R();put(fol,nfo++,tip[0]+Math.cos(a)*0.28,y+3.9,tip[1]+Math.sin(a)*0.28,0.3,0.32,0.3,0,GR[Math.floor(R()*4)]);}
     put(fol,nfo++,tip[0]+(R()-0.5)*0.3,y+3.45,tip[1]+(R()-0.5)*0.3,0.12,0.5,0.12,0,GR[Math.floor(R()*4)]);
     const c=BLOOM[Math.floor(R()*BLOOM.length)];for(let k=0;k<6;k++){const a=R()*6.28;put(bl,nbl++,tip[0]+Math.cos(a)*0.32,y+4.0+R()*0.15,tip[1]+Math.sin(a)*0.32,1,1,1,0,R()<0.7?c:0xf4f0e6);}}}
 // roses: small blooms scattered over some of the climbing ivy
 let roses=0;
 for(const pnl of IVYP){if(nbl>=bl.count-20)break;if(R()>0.45)continue;const [x,y,z,w,h,hd,tilt]=pnl,nx=Math.sin(hd),nz=Math.cos(hd),rx=Math.cos(hd),rz=-Math.sin(hd),cu=Math.cos(tilt),su=Math.sin(tilt);
   const c=[0xe8443a,0xff5fa2,0xf4f0e6,0xffb0c8][Math.floor(R()*4)],m=Math.min(18,Math.floor(w*h*0.6));
   for(let k=0;k<m;k++){const lx=(R()-0.5)*w*0.8,ly=h*(0.2+R()*0.7);put(bl,nbl++,x+rx*lx+nx*(su*ly+0.14),y+cu*ly,z+rz*lx+nz*(su*ly+0.14),1.3,1.3,1.3,0,c);roses++;}}
 for(const [im,n] of [[br,nbr],[bk,nbk],[fol,nfo],[bl,nbl]]){im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.userData.noShadow=true;if(n)scene.add(im);}
 // window boxes: each day the colours move round the palette
 let lastDay=null;animHooks.push(()=>{const d=Math.floor((ctx.totalHours||15)/24);if(d===lastDay||!flowers.instanceColor)return;lastDay=d;
   for(let i=0;i<nFw;i++){col.set(FLOWER[((FLOWIDX[i]||0)+d)%FLOWER.length]);flowers.setColorAt(i,col);}flowers.instanceColor.needsUpdate=true;});
 Object.assign(ctx.details,{baskets:nbk,roses});}
// ---- pigeons pecking in the squares; they scatter when anyone comes close ----
{const SQ=[[-125,60,16],[60,150,14],[-70,-140,16],[TEMPLE.x,TEMPLE.z+44,14],[0,0,26,21]];const NP=70;
 const pb=new THREE.InstancedMesh(octa(1,0),new THREE.MeshLambertMaterial({color:0x8a8c98}),NP),pw=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,0.5),new THREE.MeshLambertMaterial({color:0x7a7c88,side:THREE.DoubleSide}),NP*2);
 for(const im of [pb,pw]){im.userData.life=true;im.userData.noShadow=true;im.frustumCulled=false;scene.add(im);}
 const spot=q=>{for(let t=0;t<20;t++){const a=R()*6.28,r=(q[3]||0)+R()*(q[2]-(q[3]||0)),x=q[0]+Math.cos(a)*r,z=q[1]+Math.sin(a)*r;if(ctx.walkBlocked&&!ctx.walkBlocked(x,z))return [x,z];}return [q[0]+q[2]*0.8,q[1]];};
 const PG=[];for(let i=0;i<NP;i++){const q=SQ[i%SQ.length],p=spot(q);PG.push({q,x:p[0],z:p[1],y:0,h:R()*6.28,st:'peck',t:R()*3,tx:0,tz:0,ph:R()*6.28});}
 const par=new THREE.Object3D(),kid=new THREE.Object3D(),PM=new THREE.Matrix4();let last=performance.now(),check=0;
 animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;const T=now/1000,dark=nightF(ctx.hour||0)>0.7;
   if(now>check){check=now+250;const movers=[];for(const a of (ctx.agents||[]))if(a.st!==2)movers.push(a.x,a.z);for(const sq of ((ctx.patrol||{}).squads||[]))movers.push(sq.x,sq.z);
     for(const g of PG){if(g.st!=='peck'||T<(g.calm||0))continue;for(let k=0;k<movers.length;k+=2){if(Math.abs(movers[k]-g.x)<2.2&&Math.abs(movers[k+1]-g.z)<2.2){g.st='fly';g.t=2+R()*2;const p=spot(g.q);g.tx=p[0];g.tz=p[1];g.sx=g.x;g.sz=g.z;g.dur=g.t;break;}}}}
   PG.forEach((g,i)=>{const gy=groundAt(g.x,g.z);let flap=0,bob=0;
     if(g.st==='fly'){g.t-=dt;const u=1-Math.max(0,g.t)/g.dur;g.x=g.sx+(g.tx-g.sx)*u;g.z=g.sz+(g.tz-g.sz)*u;g.y=Math.sin(Math.PI*u)*7;g.h=Math.atan2(g.tx-g.sx,g.tz-g.sz);flap=Math.sin(T*22+g.ph)*0.9;if(g.t<=0){g.st='peck';g.y=0;g.calm=T+4+R()*5;}}
     else{g.t-=dt;if(g.t<0){g.t=1+R()*3;g.h+=(R()-0.5)*2;const s2=dark?0:0.4;g.x+=Math.sin(g.h)*s2;g.z+=Math.cos(g.h)*s2;if(ctx.walkBlocked&&ctx.walkBlocked(g.x,g.z)){g.x-=Math.sin(g.h)*s2;g.z-=Math.cos(g.h)*s2;}}bob=dark?0:Math.max(0,Math.sin(T*6+g.ph))*0.12;}
     par.position.set(g.x,gy+g.y+0.18,g.z);par.rotation.set(bob,g.h,0,'YXZ');
     par.updateMatrix();kid.position.set(0,0,0);kid.rotation.set(0,0,0);kid.scale.set(0.16,0.14,0.28);kid.updateMatrix();PM.multiplyMatrices(par.matrix,kid.matrix);pb.setMatrixAt(i,PM);
     for(const sd of [-1,1]){kid.position.set(sd*0.2,0.04,0);kid.rotation.set(Math.PI/2,0,sd*(0.2+flap),'YXZ');kid.scale.set(g.st==='fly'?0.5:0.22,0.5,1);kid.updateMatrix();PM.multiplyMatrices(par.matrix,kid.matrix);pw.setMatrixAt(i*2+(sd>0?1:0),PM);}});
   pb.instanceMatrix.needsUpdate=pw.instanceMatrix.needsUpdate=true;});
 ctx.pigeons=PG;}
// ---- cats on rooftops: they wash, watch and now and then stroll along the edge ----
{const NC=18,cats=[];const CC=[0x1e1c20,0xd98a3a,0x8a8c90,0xe8d8b8,0x5a4030];
 const cb=new THREE.InstancedMesh(sph(1,8,6),new THREE.MeshLambertMaterial({color:0xffffff}),NC*2),ce=new THREE.InstancedMesh(cone(0.08,0.14,4),new THREE.MeshLambertMaterial({color:0xffffff}),NC*2),ct=new THREE.InstancedMesh(boxG,new THREE.MeshLambertMaterial({color:0xffffff}),NC);
 for(const im of [cb,ce,ct]){im.userData.life=true;im.userData.noShadow=true;im.frustumCulled=false;}
 for(const l of lots){if(cats.length>=NC)break;if(l.fixed||l.kind!=='box'||l.cistern||l.garden||l.construction||hash3(l.x,l.z,171)>0.22)continue;const pp=polar(l.x,l.z);if(pp.r<0.25*wallR(pp.t))continue;
   const b=bodyOf(l),y=terrainH(l.x,l.z)-0.6+b.h+0.06;cats.push({l,b,y,u:(R()-0.5)*b.w*0.6,t:R()*10,walk:0,ph:R()*6.28,c:CC[cats.length%CC.length]});}
 cats.forEach((c,i)=>{cb.setColorAt(i*2,col.set(c.c));cb.setColorAt(i*2+1,col.set(c.c));ce.setColorAt(i*2,col.set(c.c));ce.setColorAt(i*2+1,col.set(c.c));ct.setColorAt(i,col.set(c.c));});
 for(const im of [cb,ce,ct])if(cats.length)scene.add(im);
 const par=new THREE.Object3D(),kid=new THREE.Object3D();par.add(kid);let last=performance.now();
 const set=(im,i,px,py,pz,sx,sy,sz,rx,rz)=>{kid.position.set(px,py,pz);kid.scale.set(sx,sy,sz);kid.rotation.set(rx||0,0,rz||0,'YXZ');par.updateMatrixWorld(true);im.setMatrixAt(i,kid.matrixWorld);};
 animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;const T=now/1000;
   cats.forEach((c,i)=>{c.t-=dt;if(c.t<0){if(c.walk){c.walk=0;c.t=6+R()*20;}else{c.walk=R()<0.5?-1:1;c.t=2+R()*3;}}
     if(c.walk){c.u+=c.walk*dt*0.6;const lim=c.b.w*0.42;if(Math.abs(c.u)>lim){c.u=Math.sign(c.u)*lim;c.walk=-c.walk;}}
     const q=loc(c.l.x,c.l.z,c.u,c.b.d/2-0.25,c.l.ry),hd=c.walk?c.l.ry+c.walk*Math.PI/2:c.l.ry+Math.sin(T*0.3+c.ph)*0.6;
     par.position.set(q[0],c.y,q[1]);par.rotation.set(0,hd,0);
     const sit=!c.walk;set(cb,i*2,0,sit?0.2:0.22,sit?0:0.02,0.16,sit?0.22:0.14,sit?0.2:0.32);set(cb,i*2+1,0,sit?0.46:0.34,sit?0.08:0.3,0.11,0.1,0.11);
     for(const sd of [-1,1])set(ce,i*2+(sd>0?1:0),sd*0.06,sit?0.56:0.44,sit?0.08:0.3,1,1,1);
     set(ct,i,0,sit?0.05:0.3,sit?-0.18:-0.3,0.03,0.03,0.34,sit?-0.2:0.5+0.3*Math.sin(T*3+c.ph),Math.sin(T*1.7+c.ph)*0.6);});
   for(const im of [cb,ce,ct])im.instanceMatrix.needsUpdate=true;});
 ctx.cats=cats.length;}
// ---- wells in the market squares and parks ----
{const stoneW=new THREE.MeshLambertMaterial({color:0xb8a888});stoneW.userData.tex='ashlar';const wood=lamC(0x5e3f28),roof=new THREE.MeshLambertMaterial({color:0x7a3d2a});roof.userData.tex='shingle';let wells=0;
 for(const [x0,z0] of [[-125+2,60-14],[60+10,150-10],[-70-12,-140+8],[120-12,-150+12],[TEMPLE.x+30,TEMPLE.z+56]]){
   let x=x0,z=z0,ok=false;for(let r=0;r<=10&&!ok;r+=1)for(let a=0;a<12&&!ok;a++){const qx=x0+Math.cos(a/12*6.283)*r,qz=z0+Math.sin(a/12*6.283)*r;if(!ctx.walkBlocked||[[0,0],[1.8,0],[-1.8,0],[0,1.8],[0,-1.8]].every(o=>!ctx.walkBlocked(qx+o[0],qz+o[1]))){x=qx;z=qz;ok=true;}}
   if(!ok)continue;const y=groundAt(x,z);
   scene.add(mesh(cyl(1.2,1.3,1.0,14),stoneW,x,y+0.5,z,1,1,1,0));scene.add(mesh(cyl(0.95,0.95,0.2,14),darkM,x,y+1.0,z,1,1,1,0));
   for(const s2 of [-1,1])scene.add(mesh(boxG,wood,x+s2*1.1,y+0.8,z,0.15,2.4,0.15,0));scene.add(mesh(boxG,wood,x,y+2.6,z,2.4,0.12,0.12,0));
   scene.add(mesh(frusG(0.2),roof,x,y+3.1,z,3.0,1.0,2.2,0));scene.add(mesh(cyl(0.2,0.16,0.3,8),lamC(0x6a5a44),x,y+1.8,z,1,1,1,0));
   if(ctx.patrol&&ctx.patrol.NAV.blockDisc)ctx.patrol.NAV.blockDisc(x,z,1.6);wells++;(ctx.wellPos=ctx.wellPos||[]).push([x,z]);}
 ctx.details.wells=wells;}
// ---- strings of lights across a few middle-ring alleys ----
{const bulbs=[];const cand=lots.filter(l=>{if(l.fixed||!bodyOf(l))return false;const pp=polar(l.x,l.z),f=pp.r/wallR(pp.t);return f>0.22&&f<0.62;});const used=new Set();let strings=0;
 for(let i=0;i<cand.length&&strings<45;i++){const a=cand[i];if(used.has(a)||a.laundry)continue;
   for(let j=i+1;j<cand.length;j++){const b=cand[j];if(used.has(b)||b.laundry)continue;const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d<6||d>14||hash3(a.x,b.z,131)>0.35)continue;
     const ux=dx/d,uz=dz/d,ea=Math.abs(ux*Math.cos(a.ry)-uz*Math.sin(a.ry))*a._hx+Math.abs(ux*Math.sin(a.ry)+uz*Math.cos(a.ry))*a._hz,eb=Math.abs(ux*Math.cos(b.ry)-uz*Math.sin(b.ry))*b._hx+Math.abs(ux*Math.sin(b.ry)+uz*Math.cos(b.ry))*b._hz;
     const span=d-ea-eb;if(span<2.5||span>9)continue;const p0=[a.x+ux*ea,a.z+uz*ea],p1=[b.x-ux*eb,b.z-uz*eb];
     if([0.25,0.5,0.75].some(t=>inLot(p0[0]+(p1[0]-p0[0])*t,p0[1]+(p1[1]-p0[1])*t,0,false)))continue;
     const ya=terrainH(a.x,a.z)-0.6,yb=terrainH(b.x,b.z)-0.6,ha=bodyOf(a).h,hb=bodyOf(b).h;const yl=Math.min(ya+ha,yb+hb)-1.2;if(yl<Math.max(ya,yb)+3.8)continue;
     used.add(a);used.add(b);strings++;const nb=Math.floor(span/0.7);
     for(let k=1;k<nb;k++){const t=k/nb;bulbs.push([p0[0]+(p1[0]-p0[0])*t,yl-0.1*span*4*t*(1-t),p0[1]+(p1[1]-p0[1])*t,[0xffd890,0xffb070,0xfff0c0,0xff9a9a,0xa0e0ff][k%5]]);}
     break;}}
 const bm=new THREE.MeshBasicMaterial({color:0xffffff});const im=new THREE.InstancedMesh(sph(0.1,5,4),bm,Math.max(1,bulbs.length));bulbs.forEach((q,i)=>put(im,i,q[0],q[1],q[2],1,1,1,0,q[3]));im.count=bulbs.length;im.userData.noShadow=true;im.userData.cat='light';if(bulbs.length)scene.add(im);
 const hp=new Float32Array(bulbs.length*3);bulbs.forEach((q,i)=>hp.set(q.slice(0,3),i*3));const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.BufferAttribute(hp,3));
 const hm=new THREE.ShaderMaterial({uniforms:{izLit:{value:0},izPx:ENV.izPx},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
   vertexShader:`uniform float izLit;uniform float izPx;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);float d=max(-mv.z,1.0);gl_PointSize=clamp(1.1*izPx/d,1.0,32.0);vA=izLit*exp(-d*0.004);gl_Position=projectionMatrix*mv;}`,
   fragmentShader:`varying float vA;void main(){float r=length(gl_PointCoord-0.5);float a=1.0-smoothstep(0.0,0.5,r);a*=a;if(a*vA<0.003)discard;gl_FragColor=vec4(vec3(1.0,0.85,0.6)*a*vA,a*vA);}`});
 const halo=new THREE.Points(hg,hm);halo.frustumCulled=false;if(bulbs.length)scene.add(halo);
 animHooks.push(()=>{const l=litAt(ctx.hour||0,17.9,24.8);{const v=0.25+0.75*l;bm.color.setRGB(v,v,v);}hm.uniforms.izLit.value=l;});
 ctx.details.lightStrings=strings;}
// ---- a smithy: furnace, anvil, a smith at work, sparks and smoke ----
{const l=lots.find(q=>!q.fixed&&(q.kind==='hall'||q.kind==='compound'||q.kind==='box')&&(()=>{const pp=polar(q.x,q.z);return pp.r>0.6*wallR(pp.t);})()&&!inLot(...loc(q.x,q.z,bodyOf(q).w/2+2.4,0,q.ry),0.3,false));
 if(l){l.forge=true;const b=bodyOf(l),y=terrainH(l.x,l.z)-0.6,hd=l.ry+Math.PI/2,at=(ox,oz)=>loc(l.x,l.z,b.w/2+ox,oz,l.ry);
   const stone=lamC(0x4a4038);let q=at(0.7,-1.2);scene.add(mesh(boxG,stone,q[0],y,q[1],1.4,1.8,2.0,hd));
   const mouth=mesh(boxG,new THREE.MeshBasicMaterial({color:0xff7a2a}),...(()=>{const m=at(1.42,-1.2);return [m[0],y+0.5,m[1]];})(),0.06,0.7,0.9,hd);mouth.userData.glowColor=[1,0.45,0.15];mouth.userData.glowSize=7;mouth.userData.sched=0;mouth.userData.dynamic=true;scene.add(mouth);
   q=at(2.0,0.8);scene.add(mesh(cyl(0.35,0.45,0.9,8),timber,q[0],y+0.45,q[1],1,1,1,0));scene.add(mesh(boxG,lamC(0x2a2826),q[0],y+0.9,q[1],0.9,0.35,0.35,hd));
   const anvil=[q[0],y+1.3,q[1]];
   const smith=new THREE.Group();smith.userData.dynamic=true;const sp=at(2.0,1.9);smith.position.set(sp[0],y,sp[1]);smith.rotation.y=Math.atan2(anvil[0]-sp[0],anvil[2]-sp[1]);
   smith.add(mesh(bodyG,lamC(0x5a3a2a),0,0,0,1.15,1.55,1.15,0));smith.add(mesh(headG,lamC(0xc9955e),0,1.8,0,1.1,1.1,1.1,0));
   const arm=new THREE.Group();arm.position.set(0.35,1.45,0);arm.add(mesh(boxG,lamC(0xc9955e),0,-0.8,0,0.18,0.8,0.18,0));arm.add(mesh(boxG,lamC(0x2a2826),0,-0.9,0.25,0.25,0.18,0.45,0));smith.add(arm);scene.add(smith);
   const chim=at(-b.w*0.3,-b.d*0.3);SMOKE.push([chim[0],y+b.h+2.4,chim[1],0]);scene.add(mesh(boxG,stone,chim[0],y+b.h-0.2,chim[1],0.8,2.6,0.8,l.ry));
   const NP=160,pos=new Float32Array(NP*3),vel=new Float32Array(NP*3),life=new Float32Array(NP),al=new Float32Array(NP);
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('izA',new THREE.BufferAttribute(al,1));
   const m=new THREE.ShaderMaterial({uniforms:{izPx:ENV.izPx},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
     vertexShader:`attribute float izA;uniform float izPx;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);float d=max(-mv.z,1.0);gl_PointSize=clamp(0.35*izPx/d,1.0,12.0);vA=izA;gl_Position=projectionMatrix*mv;}`,
     fragmentShader:`varying float vA;void main(){if(vA<0.02)discard;gl_FragColor=vec4(vec3(1.0,0.7,0.3)*vA,vA);}`});
   const sparks=new THREE.Points(g,m);sparks.frustumCulled=false;scene.add(sparks);let cur=0,lastHit=0,last=performance.now();
   animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;const h=ctx.hour||0,working=h>7&&h<19.5,ph=(now/1100)%1;
     arm.rotation.x=working?(ph<0.75?-1.9*(ph/0.75):-1.9+1.9*((ph-0.75)/0.25)*1.0):-0.2;
     if(working&&ph>0.97&&now-lastHit>600){lastHit=now;if(ctx.onClink)ctx.onClink(anvil[0],anvil[1],anvil[2]);
       for(let k=0;k<22;k++){const i=cur;cur=(cur+1)%NP;pos.set(anvil,i*3);const a=R()*6.28,sv=2+R()*4;vel.set([Math.cos(a)*sv,3+R()*5,Math.sin(a)*sv],i*3);life[i]=0.4+R()*0.5;}}
     mouth.material.color.setRGB(1,0.35+0.15*Math.sin(now*0.013)+0.1*Math.sin(now*0.031),0.1);
     let any=false;for(let i=0;i<NP;i++){if(life[i]<=0){al[i]=0;continue;}any=true;life[i]-=dt;const e=i*3;vel[e+1]-=9.8*dt;pos[e]+=vel[e]*dt;pos[e+1]+=vel[e+1]*dt;pos[e+2]+=vel[e+2]*dt;al[i]=Math.max(0,life[i]*2);}
     sparks.visible=any;if(any){g.attributes.position.needsUpdate=true;g.attributes.izA.needsUpdate=true;}});
   ctx.details.forge=[Math.round(l.x),Math.round(l.z)];}}
// ---- a bathhouse: a domed building with steaming vents ----
{const l=lots.find(q=>!q.fixed&&q.kind==='domed'&&(()=>{const pp=polar(q.x,q.z),f=pp.r/wallR(pp.t);return f>0.25&&f<0.6;})());
 if(l){l.bath=true;const y=terrainH(l.x,l.z)-0.6,b=bodyOf(l);
   for(const [ox,oz] of [[-0.3,-0.3],[0.3,-0.3],[0.3,0.3]]){const q=loc(l.x,l.z,ox*b.w,oz*b.d,l.ry);scene.add(mesh(cyl(0.25,0.3,1.6,8),lamC(0x8a8c90),q[0],y+b.h+0.8,q[1],1,1,1,0));SMOKE.push([q[0],y+b.h+1.7,q[1],1]);}
   const d=loc(l.x,l.z,0,b.d/2+0.5,l.ry);SMOKE.push([d[0],y+2.8,d[1],1]);
   const sg=loc(l.x,l.z,0,b.d/2+0.35,l.ry);const sq2=loc(l.x,l.z,0,b.d/2+0.42,l.ry);l.bathSign={x:sq2[0],z:sq2[1],y:y+4.075,ry:l.ry};const sign=mesh(boxG,glowM,sg[0],y+3.9,sg[1],2.2,0.35,0.12,l.ry);sign.userData.glowColor=[0.4,0.9,1];sign.userData.glowSize=6;sign.userData.sched=1;sign.userData.lightT=[17.3,24.9,-1];scene.add(sign);
   ctx.details.bathhouse=[Math.round(l.x),Math.round(l.z)];}}
// ---- rooftop gardens ----
{const pl=new THREE.InstancedMesh(boxG,timber,900),fo=new THREE.InstancedMesh(sph(1,6,4),ivyClumpM,1400),po=new THREE.InstancedMesh(boxG,timber,600);let np=0,nf=0,npo=0,gardens=0;
 const GR=[0x3f9a4c,0x4cb35a,0x62c488,0x6fb04a,0x80bf5a];
 for(const l of lots){if(l.fixed||!(l.kind==='box'||l.kind==='tier')||l.cistern||hash3(l.x,l.z,141)>0.12)continue;const pp=polar(l.x,l.z),f=pp.r/wallR(pp.t);if(f<0.2||f>0.8)continue;
   const tier=l.kind==='tier',w=l.w*(tier?0.65:1),d=l.dpt*(tier?0.65:1),y=terrainH(l.x,l.z)-0.6+l.h*(tier?1.02:1);if(w<4||d<4)continue;gardens++;l.garden=true;
   for(const [lx,lz,sx,sz] of [[0,-d/2+0.45,w-0.6,0.6],[0,d/2-0.45,w-0.6,0.6],[-w/2+0.45,0,0.6,d-1.8],[w/2-0.45,0,0.6,d-1.8]]){if(np>=900)break;const q=loc(l.x,l.z,lx,lz,l.ry);put(pl,np++,q[0],y,q[1],sx,0.5,sz,l.ry);
     const m=Math.max(1,Math.round(Math.max(sx,sz)/1.1));for(let k=0;k<m&&nf<1400;k++){const u=(k+0.5)/m-0.5,q2=loc(l.x,l.z,lx+(sx>sz?u*sx:0),lz+(sz>sx?u*sz:0),l.ry),r=0.35+R()*0.3;put(fo,nf++,q2[0],y+0.55,q2[1],r,r*0.8,r,0,GR[Math.floor(R()*GR.length)]);}}
   if(npo<596){for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const q=loc(l.x,l.z,sx*w*0.18,sz*d*0.18,l.ry);put(po,npo++,q[0],y,q[1],0.12,2.1,0.12,l.ry);}}
   {const q=loc(l.x,l.z,0,0,l.ry);if(npo<600)put(po,npo++,q[0],y+2.1,q[1],w*0.4,0.1,d*0.4,l.ry);}}
 for(const [im,n] of [[pl,np],[fo,nf],[po,npo]]){im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;if(n)scene.add(im);}fo.userData.noShadow=true;
 ctx.details.gardens=gardens;}
// ---- a building site: scaffolding round a midrise, a tower crane swinging loads ----
{const busy=lots.filter(q=>q.bath||q.forge);
 const site=lots.filter(q=>!q.fixed&&(q.kind==='box'||q.kind==='midrise')&&q.h>10&&!q.garden&&!q.cistern&&busy.every(o=>Math.hypot(o.x-q.x,o.z-q.z)>45)&&(()=>{const pp=polar(q.x,q.z),f=pp.r/wallR(pp.t);return f>0.3&&f<0.7;})())
   .find(q=>{const b=bodyOf(q);for(const a of [0,1,2,3]){const c=loc(q.x,q.z,Math.cos(a*Math.PI/2)*(b.w/2+5),Math.sin(a*Math.PI/2)*(b.d/2+5),q.ry);if(!inLot(c[0],c[1],2.5,false)&&ctx.walkable(c[0],c[1])){q._crane=c;return true;}}return false;});
 if(site){site.construction=true;const b=bodyOf(site),y=terrainH(site.x,site.z)-0.6,H=b.h+1;
   const pole=lamC(0x9a8a70);
   for(const [fx,fz,len,along] of [[0,-1,b.w,'x'],[0,1,b.w,'x'],[-1,0,b.d,'z'],[1,0,b.d,'z']]){const n=Math.max(2,Math.round(len/2.4));
     for(let k=0;k<=n;k++){const u=-len/2-0.4+(len+0.8)*k/n;const lx=along==='x'?u:fx*(b.w/2+1.2),lz=along==='x'?fz*(b.d/2+1.2):u;const q=loc(site.x,site.z,lx,lz,site.ry);scene.add(mesh(boxG,pole,q[0],y,q[1],0.12,H,0.12,site.ry));}
     for(let lv=2.2;lv<H;lv+=2.2){const lx=along==='x'?0:fx*(b.w/2+0.8),lz=along==='x'?fz*(b.d/2+0.8):0;const q=loc(site.x,site.z,lx,lz,site.ry);scene.add(mesh(boxG,timber,q[0],y+lv,q[1],along==='x'?len+0.8:0.9,0.1,along==='x'?0.9:len+0.8,site.ry));
       const qr=loc(site.x,site.z,along==='x'?0:fx*(b.w/2+1.2),along==='x'?fz*(b.d/2+1.2):0,site.ry);scene.add(mesh(boxG,pole,qr[0],y+lv+1.0,qr[1],along==='x'?len+0.8:0.08,0.08,along==='x'?0.08:len+0.8,site.ry));}}
   for(let k=0;k<2;k++){const q=loc(site.x,site.z,(k-0.5)*b.w*0.5,b.d/2+0.8,site.ry);const lv=2.2*(1+k);scene.add(mesh(bodyG,lamC(0xe0a030),q[0],y+lv+0.1,q[1],0.9,1.4,0.9,0));scene.add(mesh(headG,lamC(0xd9b58a),q[0],y+lv+1.7,q[1],1,1,1,0));}
   // the crane
   const c=site._crane,cy=meshH(c[0],c[1]),CH=H+14,steel=lamC(0xe0a030);
   for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])scene.add(mesh(boxG,steel,c[0]+sx*0.8,cy,c[1]+sz*0.8,0.18,CH,0.18,0));
   for(let lv=0;lv<CH;lv+=2.6){scene.add(mesh(boxG,steel,c[0],cy+lv,c[1]-0.8,1.6,0.12,0.12,0));scene.add(mesh(boxG,steel,c[0],cy+lv,c[1]+0.8,1.6,0.12,0.12,0));scene.add(mesh(boxG,steel,c[0]-0.8,cy+lv,c[1],0.12,0.12,1.6,0));scene.add(mesh(boxG,steel,c[0]+0.8,cy+lv,c[1],0.12,0.12,1.6,0));}
   scene.add(mesh(boxG,lamC(0x8a8c90),c[0],cy-0.2,c[1],3.2,0.8,3.2,0));
   const slew=new THREE.Group();slew.userData.dynamic=true;slew.userData.noGlow=true;slew.position.set(c[0],cy+CH,c[1]);scene.add(slew);
   slew.add(mesh(boxG,steel,0,0,6,1.2,1.0,24,0));slew.add(mesh(boxG,steel,0,0,-4.5,1.2,1.0,7,0));slew.add(mesh(boxG,lamC(0x5c5a54),0,-1.2,-7,1.8,2.2,2.0,0));
   slew.add(mesh(boxG,lamC(0xd9d1b0),0,-1.6,0.6,1.3,1.4,1.3,0));slew.add(mesh(boxG,darkM,0,-1.2,1.28,1.0,0.6,0.05,0));slew.add(mesh(cone(0.8,2.6,4),steel,0,1.0,0,1,1,1,0));
   const tip=mesh(sph(0.2,6,5),new THREE.MeshBasicMaterial({color:0xff3030}),0,0.7,17.8,1,1,1,0);slew.add(tip);
   const trolley=new THREE.Group();slew.add(trolley);trolley.add(mesh(boxG,lamC(0x5c5a54),0,-0.9,0,0.8,0.4,1.0,0));
   const cable=mesh(boxG,lamC(0x2a2826),0,0,0,0.05,1,0.05,0);trolley.add(cable);const load=new THREE.Group();trolley.add(load);
   load.add(mesh(boxG,lamC(0x5c5a54),0,0,0,0.5,0.25,0.5,0));load.add(mesh(boxG,timber,0,-1.25,0,1.6,0.9,1.2,0));
   const toSite=Math.atan2(site.x-c[0],site.z-c[1]),dSite=Math.min(16,Math.hypot(site.x-c[0],site.z-c[1])),away=toSite+2.2;
   animHooks.push(now=>{const T=(now/1000)%48,e=u=>u*u*(3-2*u);let ang,tr,drop;   // pick up on the ground, swing, lower onto the roof, swing back
     if(T<8){ang=away;tr=10;drop=CH-1.5-e(T/8)*0;}else if(T<14){ang=away;tr=10;drop=CH-1.5-(CH-3)*(1-e((T-8)/6));}else if(T<24){ang=away+(toSite-away)*e((T-14)/10);tr=10+(dSite-10)*e((T-14)/10);drop=4;}
     else if(T<30){ang=toSite;tr=dSite;drop=4+(CH-H-2-4)*e((T-24)/6);}else if(T<34){ang=toSite;tr=dSite;drop=CH-H-2;}else if(T<44){ang=toSite+(away-toSite)*e((T-34)/10);tr=dSite+(10-dSite)*e((T-34)/10);drop=Math.max(4,(CH-H-2)*(1-e((T-34)/4)));}
     else{ang=away;tr=10;drop=4+(CH-5.5)*e((T-44)/4);}
     slew.rotation.y=ang;trolley.position.set(0,0,tr);load.position.y=-drop;cable.position.y=-drop;cable.scale.y=drop;
     {const k=nightF(ctx.hour||0)>0.3&&(now%1400)<700?1:0.25;tip.material.color.setRGB(k,0.2*k,0.2*k);}});
   ctx.details.site=[Math.round(site.x),Math.round(site.z)];}}
// ---- spaceport traffic: craft land on the free pads, wait, and leave; each pad shows a status light ----
{const padT=i=>i/6*Math.PI*2+Math.PI/4,padP=i=>[SP.x+46*Math.cos(padT(i)),SPH+0.5,SP.z+46*Math.sin(padT(i))];
 const lights=new THREE.InstancedMesh(boxG,new THREE.MeshBasicMaterial({color:0xffffff}),6);
 for(let i=0;i<6;i++){const t=padT(i);put(lights,i,SP.x+60*Math.cos(t),SPH,SP.z+60*Math.sin(t),0.8,2.4,0.8,0,0x40ff60);scene.add(mesh(boxG,lamC(0x3a3632),SP.x+60*Math.cos(t),SPH-0.2,SP.z+60*Math.sin(t),1.2,0.4,1.2,0));}
 lights.userData.noShadow=true;lights.userData.cat='light';scene.add(lights);
 const TR=[0,3,5].map((pi,k)=>{const sh=makeShip();ctx.bakeGroup(sh,c=>c.material===glowM);sh.userData.dynamic=true;sh.userData.life=true;sh.visible=false;scene.add(sh);return {pi,sh,phase:'away',t:8+k*14+R()*10,curve:null,dur:1,yaw:0};});
 const V=(x,y,z)=>new THREE.Vector3(x,y,z);
 const route=(p,a,inbound)=>{const dx=Math.cos(a),dz=Math.sin(a);const pts=[V(p[0]+dx*700,300,p[2]+dz*700),V(p[0]+dx*170,110,p[2]+dz*170),V(p[0]+dx*40,32,p[2]+dz*40),V(p[0],p[1]+10,p[2]),V(p[0],p[1],p[2])];if(!inbound)pts.reverse();return new THREE.CatmullRomCurve3(pts,false,'centripetal',0.4);};
 const pv=new THREE.Vector3(),tv=new THREE.Vector3();let last=performance.now();
 const COL={free:[0.25,1,0.4],busy:[1,0.25,0.2],move:[1,0.7,0.2],shuttle:[0.4,0.7,1]};
 animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;const blink=(now%900)<450;
   for(const c of TR){c.t-=dt;
     if(c.phase==='away'&&c.t<=0){c.phase='in';c.curve=route(padP(c.pi),R()*Math.PI*2,true);c.dur=16;c.t=c.dur;c.sh.visible=true;}
     else if(c.phase==='in'&&c.t<=0){c.phase='down';c.t=25+R()*25;}
     else if(c.phase==='down'&&c.t<=0){c.phase='out';c.curve=route(padP(c.pi),R()*Math.PI*2,false);c.dur=13;c.t=c.dur;}
     else if(c.phase==='out'&&c.t<=0){c.phase='away';c.t=15+R()*40;c.sh.visible=false;}
     if(c.phase==='in'||c.phase==='out'){const u0=1-c.t/c.dur,u=c.phase==='in'?1-Math.pow(1-u0,2):u0*u0;c.curve.getPointAt(Math.min(0.999,u),pv);c.curve.getTangentAt(Math.min(0.998,Math.max(0.002,u)),tv);
       c.sh.position.copy(pv);const hz=Math.hypot(tv.x,tv.z);if(hz>0.1){let e=Math.atan2(tv.x,tv.z)-c.yaw;e=Math.atan2(Math.sin(e),Math.cos(e));c.yaw+=e*Math.min(1,dt*3);}
       c.sh.rotation.set(-Math.max(-0.3,Math.min(0.3,Math.atan2(tv.y,Math.max(hz,0.3))*0.5)),c.yaw,0,'YXZ');}
     else if(c.phase==='down'){const p=padP(c.pi);c.sh.position.set(p[0],p[1],p[2]);c.sh.rotation.set(0,c.yaw,0);}}
   for(let i=0;i<6;i++){let st='free';if(i===1||i===4)st='busy';else if(i===2)st='shuttle';const c=TR.find(q=>q.pi===i);
     if(c){if(c.phase==='down')st='busy';else if(c.phase==='in'||c.phase==='out')st=blink?'move':'free';}
     const q=COL[st];lights.setColorAt(i,col.setRGB(q[0],q[1],q[2]));}
   lights.instanceColor.needsUpdate=true;});
 ctx.traffic=TR;ctx.trafficInfo=c=>({title:'A visiting craft',follow:true,pos:()=>c.phase==='away'?null:[c.sh.position.x,c.sh.position.y+2,c.sh.position.z],live:()=>[{t:{in:'Coming in to land on pad '+(c.pi+1),down:'Standing on pad '+(c.pi+1),out:'Taking off from pad '+(c.pi+1),away:'Away'}[c.phase]},{t:'Pad lights: green free, amber landing or leaving, red occupied',sub:true}]});}
});
await stage('greattrees');
section('greattrees',()=>{
