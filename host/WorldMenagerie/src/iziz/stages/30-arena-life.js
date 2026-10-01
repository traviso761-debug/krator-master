// ---------- the arena: two duelling pairs on the sand, a crowd in the stands that swells and thins over time ----------
{const ay=terrainH(ARENA.x,ARENA.z)-1+1;const A0=48,B0=40;
  const bronze=new THREE.MeshLambertMaterial({color:0xb08a3c}),skin=new THREE.MeshLambertMaterial({color:0xc9955e}),iron=new THREE.MeshLambertMaterial({color:0x9a9a9a});
  const KILT=[0xc9442a,0x2f8f8a,0x7a3d8a,0xe0a030];const fighters=[];
  for(let p=0;p<2;p++)for(let k=0;k<2;k++){const g=new THREE.Group();scene.add(g);
    g.add(mesh(cyl(0.55,0.65,1,8),skin,0,1.55,0,1,1.1,1,0));g.add(mesh(cyl(0.62,0.5,1,8),new THREE.MeshLambertMaterial({color:KILT[p*2+k]}),0,0.75,0,1,0.7,1,0));
    [-0.3,0.3].forEach(lx=>g.add(mesh(cyl(0.2,0.24,1,6),skin,lx,0.3,0,1,0.6,1,0)));g.add(mesh(helmG,bronze,0,2.45,0,1,1.1,1,0));g.add(mesh(sph(0.32,8,6),skin,0,2.4,0,1,1,1,0));
    const shield=mesh(cyl(0.75,0.75,0.12,10),bronze,-0.75,1.6,0.35,1,1,1,0);shield.rotation.x=Math.PI/2;g.add(shield);
    const arm=new THREE.Group();arm.position.set(0.75,2.1,0);g.add(arm);arm.add(mesh(cyl(0.14,0.16,1,6),skin,0,-0.45,0,1,0.9,1,0));
    const sword=mesh(boxG,iron,0,-0.9,0,0.14,0.14,1.7,0);sword.position.z=0.6;arm.add(sword);
    g.userData.dynamic=true;g.userData.life=true;fighters.push({g,arm,pair:p,k,ph:rr(0,6.28)});}
  animHooks.push(now=>{const t=now*0.001;const on=showF(ctx.hour||0)>0.5;for(const f of fighters){f.g.visible=on;if(!on)continue;const cx=ARENA.x+(f.pair?14:-14),cz=ARENA.z+(f.pair?-4:4);const w=0.6+f.pair*0.15;const ang=t*w+f.k*Math.PI+f.pair*1.1;
    const lunge=Math.pow(Math.max(0,Math.sin(t*2.3+f.ph)),8);const r=3.6-lunge*2.4;const x=cx+Math.cos(ang)*r,z=cz+Math.sin(ang)*r;
    f.g.position.set(x,ay,z);f.g.rotation.y=Math.atan2(cx-x,cz-z);f.arm.rotation.x=-0.6-lunge*1.7+Math.sin(t*4+f.ph)*0.1;}});
  // crowd
  const NC=160,seats=[];for(let i=0;i<NC;i++){const k=Math.floor(rnd()*6),ta=rr(0,6.28);const a=A0-9-k*3.1-1.3,b=B0-8-k*2.7-1.2;seats.push({x:ARENA.x+a*Math.cos(ta),z:ARENA.z+b*Math.sin(ta),y:ay-1+(11-k*2)+2.1,h:Math.atan2(ARENA.x-(ARENA.x+a*Math.cos(ta)),ARENA.z-(ARENA.z+b*Math.sin(ta))),ph:rr(0,6.28)});}
  const cBody=new THREE.InstancedMesh(bodyG,new THREE.MeshLambertMaterial({color:0xffffff}),NC),cHead=new THREE.InstancedMesh(headG,new THREE.MeshLambertMaterial({color:0xd9b58a}),NC);
  cBody.userData.noShadow=cHead.userData.noShadow=true;cBody.userData.life=cHead.userData.life=true;for(let i=0;i<NC;i++)cBody.setColorAt(i,col.set(pick(ROBES)));scene.add(cBody,cHead);
  animHooks.push(now=>{const h=ctx.hour||0;const nvis=Math.floor((95+45*Math.sin(now*0.00021)+12*Math.sin(now*0.0011))*showF(h));   // show hours only; swells and thins over the day
    for(let i=0;i<NC;i++){const st=seats[i];const on=i<nvis;const sc=on?1:0.0001;const cheer=on&&Math.sin(now*0.004+st.ph)>0.97?0.35:0;
      dm.position.set(st.x,st.y+cheer,st.z);dm.scale.set(sc,sc*1.1,sc);dm.rotation.set(0,st.h,0);dm.updateMatrix();cBody.setMatrixAt(i,dm.matrix);
      dm.position.set(st.x,st.y+cheer+1.35,st.z);dm.scale.set(sc,sc,sc);dm.updateMatrix();cHead.setMatrixAt(i,dm.matrix);}
    cBody.instanceMatrix.needsUpdate=true;cHead.instanceMatrix.needsUpdate=true;});
  ctx.arena={fighters:fighters.length,seats:NC};}
// shuttles: spaceport -> palace hangar -> temple pad -> arena pad -> spaceport, decelerating into each stop and dwelling there
const padT=Math.PI/4+2*Math.PI/3,padX=SP.x+46*Math.cos(padT),padZ=SP.z+46*Math.sin(padT);
const hy=terrainH(PALACE.x,PALACE.z)-3+28.2,hx=PALACE.x-2,hz=PALACE.z+17.5;
const TP={x:TPAD.x,z:TPAD.z},AP={x:APAD.x,z:APAD.z};TP.y=terrainH(TP.x,TP.z);AP.y=terrainH(AP.x,AP.z);
function landingPad(x,y,z){const g=new THREE.Group();g.position.set(x,y-0.3,z);
  g.add(mesh(cyl(7,7.5,0.6,20),sandLightM,0,0,0,1,1,1,0));const ring=mesh(torus(6.4,0.2,6,28),glowM,0,0.65,0,1,1,1,0);ring.rotation.x=Math.PI/2;g.add(ring);
  g.add(mesh(boxG,gateTopM,0,0.6,0,0.7,0.12,7,0));g.add(mesh(boxG,gateTopM,0,0.6,0,7,0.12,0.7,0));
  for(let k=0;k<4;k++){const t=k*Math.PI/2+Math.PI/4;g.add(mesh(boxG,glowM,8.2*Math.cos(t),0,8.2*Math.sin(t),0.6,1.4,0.6,0));}scene.add(g);}
landingPad(TP.x,TP.y,TP.z);landingPad(AP.x,AP.y,AP.z);
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const legs=[
 {dur:22,dwell:8,pts:[V(padX,SPH+1.5,padZ),V(padX,SPH+45,padZ),V(padX+40,SPH+110,padZ+60),V((padX+hx)/2-40,175,(padZ+hz)/2+40),V(hx-110,hy+80,hz+150),V(hx-62,hy+42,hz+86),V(hx-30,hy+15,hz+32),V(hx-6,hy+4,hz+12),V(hx,hy+1.2,hz-1)]},
 {dur:16,dwell:8,pts:[V(hx,hy+1.2,hz-1),V(hx+5,hy+6,hz+12),V(hx+30,hy+30,hz+34),V(hx+66,hy+58,hz+86),V(hx+105,hy+85,hz+130),V(TEMPLE.x+40,TP.y+110,TEMPLE.z+40),V(TP.x+6,TP.y+60,TP.z+10),V(TP.x,TP.y+22,TP.z),V(TP.x,TP.y+1.2,TP.z)]},
 {dur:20,dwell:8,pts:[V(TP.x,TP.y+1.2,TP.z),V(TP.x,TP.y+30,TP.z),V(TP.x-6,TP.y+70,TP.z-30),V(TEMPLE.x+40,TP.y+120,TEMPLE.z-120),V(0,200,-200),V(AP.x-10,AP.y+110,AP.z-160),V(AP.x-4,AP.y+60,AP.z-30),V(AP.x,AP.y+22,AP.z),V(AP.x,AP.y+1.2,AP.z)]},
 {dur:18,dwell:8,pts:[V(AP.x,AP.y+1.2,AP.z),V(AP.x,AP.y+30,AP.z),V(AP.x-16,AP.y+60,AP.z-30),V(AP.x-90,AP.y+100,AP.z-120),V((AP.x+padX)/2-40,160,(AP.z+padZ)/2),V(padX-30,SPH+90,padZ-20),V(padX,SPH+35,padZ),V(padX,SPH+1.5,padZ)]}
].map(l=>{l.curve=new THREE.CatmullRomCurve3(l.pts,false,'centripetal',0.35);return l;});
const TOTAL=legs.reduce((a,l)=>a+l.dur+l.dwell,0);
const ships=[0,0.5].map(ph=>{const sh=makeShip();sh.userData.dynamic=true;sh.userData.life=true;sh.userData.ph=ph;sh.userData.yaw=0;sh.userData.bank=0;scene.add(sh);return sh;});
const tv=new THREE.Vector3(),pv=new THREE.Vector3();let lastS=performance.now();
const ease=u=>u*u*(3-2*u);
animHooks.push(now=>{const dt=Math.min(0.05,(now-lastS)/1000);lastS=now;
  for(const sh of ships){const u=sh.userData;let t=((now/1000)+u.ph*TOTAL)%TOTAL;let leg=null,lu=0,dwelling=false;
    for(const l of legs){if(t<l.dur){leg=l;lu=ease(t/l.dur);break;}t-=l.dur;if(t<l.dwell){leg=l;lu=1;dwelling=true;break;}t-=l.dwell;}
    if(!leg){leg=legs[0];lu=0;}
    leg.curve.getPointAt(Math.min(lu,0.9999),pv);leg.curve.getTangentAt(Math.min(Math.max(lu,0.001),0.999),tv);sh.position.copy(pv);
    if(dwelling){sh.position.y+=Math.sin(now*0.002)*0.15;}
    const horiz=Math.hypot(tv.x,tv.z);let yaw=(horiz>0.05&&!dwelling)?Math.atan2(tv.x,tv.z):u.yaw;
    let dy=yaw-u.yaw;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;u.yaw+=dy*Math.min(1,dt*4);
    const pitch=dwelling?0:-Math.max(-0.3,Math.min(0.3,Math.atan2(tv.y,Math.max(horiz,0.2))*0.5));
    const bankT=dwelling?0:Math.max(-0.55,Math.min(0.55,-(dy/Math.max(dt,0.001))*0.25));u.bank+=(bankT-u.bank)*Math.min(1,dt*3);
    sh.rotation.set(pitch,u.yaw,u.bank,'YXZ');}});
ctx.legs=legs;
});
