// ---------- the freighter: lifts off at 09:00, returns at 21:00 and stays the night ----------
const H=()=>ctx.hour||0;
function makeFreighter(){const g=new THREE.Group();const hullM=new THREE.MeshLambertMaterial({color:0xb9bcc2});hullM.userData.tex='metal';const dk=new THREE.MeshLambertMaterial({color:0x5c5a54}),or=new THREE.MeshLambertMaterial({color:0xe07a2a});
  g.add(mesh(rectFrus(0.7,0.5),hullM,0,3,0,20,7,44,0));g.add(mesh(rectFrus(0.6,0.3),hullM,0,10,-6,12,4,24,0));g.add(mesh(boxG,dk,0,12,8,5,2.2,6,0));
  [-1,1].forEach(sx=>{g.add(mesh(wedgeG,hullM,sx*16,4.5,-4,14,2.2,22,0));g.add(mesh(boxG,or,sx*16,4.6,-4,10,0.5,1.5,0));
    [-11,-3].forEach(zz=>{const th=mesh(cyl(1.6,2.1,5,10),dk,sx*13,2.4,zz-14,1,1,1,0);th.rotation.x=Math.PI/2;g.add(th);const gl=mesh(boxG,glowM,sx*13,2.4,zz-17,2.4,2.4,0.4,0);gl.userData.sched=0;gl.userData.glowColor=[0.6,0.85,1];gl.userData.glowSize=8;g.add(gl);});});
  for(let k=0;k<4;k++)g.add(mesh(boxG,or,0,3,-16+k*10,21,0.6,1,0));
  // navigation lights: red port, green starboard, white tail and belly strobes, and a warm cabin row; all always-on
  const nav=(x,y,z,c,sz)=>{const m=mesh(sph(0.5,6,5),glowM,x,y,z,1,1,1,0);m.userData.glowColor=c;m.userData.glowSize=sz;m.userData.sched=0;g.add(m);};
  nav(-23,4.8,-4,[1,0.15,0.15],8);nav(23,4.8,-4,[0.15,1,0.25],8);nav(0,14.5,-6,[1,1,1],7);nav(0,-0.6,10,[1,1,1],6);nav(0,-0.6,-12,[1,1,1],6);
  for(let k=-2;k<=2;k++)nav(k*3,7.5,17,[1,0.85,0.55],4);
  const cab=new THREE.PointLight(0xffe0b0,0.9,120,1.5);ctx.frCab=cab;cab.position.set(0,6,0);g.add(cab);
  [[-6,0.2,-14],[6,0.2,-14],[0,0.2,14]].forEach(p=>g.add(mesh(cyl(0.8,1.2,3,8),dk,p[0],-1.2,p[2],1,1,1,0)));return g;}
const fr=makeFreighter();fr.userData.dynamic=true;fr.userData.life=true;scene.add(fr);const py=SPH+1.4;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);const yawFace=BPAD_T;
const dep=new THREE.CatmullRomCurve3([V(BPAD.x,py,BPAD.z),V(BPAD.x,py+60,BPAD.z),V(BPAD.x-80,py+120,BPAD.z+120),V(60,190,120),V(-120,175,-40),V(40,210,-180),V(260,320,-120),V(620,620,-520)],false,'centripetal',0.4);   // climbs, banks over the city centre and the palace, then out
const arr=new THREE.CatmullRomCurve3([V(-640,600,520),V(-260,300,240),V(-40,200,60),V(140,170,-60),V(300,140,-200),V(BPAD.x+30,py+80,BPAD.z-20),V(BPAD.x,py+30,BPAD.z),V(BPAD.x,py,BPAD.z)],false,'centripetal',0.4);   // comes in low across the city before turning onto the pad
const tv=new THREE.Vector3(),pv=new THREE.Vector3();const ease=u=>u*u*(3-2*u);let fyaw=0;
animHooks.push(now=>{const h=H();let curve=null,u=0,parked=false;
  if(h>=9&&h<10.5){curve=dep;u=ease((h-9)/1.5);}else if(h>=10.5&&h<20){fr.visible=false;return;}else if(h>=20&&h<21){curve=arr;u=ease((h-20)/1);}else parked=true;
  fr.visible=true;
  if(parked){fr.position.set(BPAD.x,py,BPAD.z);fr.rotation.set(0,Math.PI/2-yawFace,0);fyaw=Math.PI/2-yawFace;return;}
  curve.getPointAt(Math.min(u,0.999),pv);curve.getTangentAt(Math.min(Math.max(u,0.002),0.998),tv);fr.position.copy(pv);
  const horiz=Math.hypot(tv.x,tv.z);const yaw=horiz>0.08?Math.atan2(tv.x,tv.z):fyaw;let dy=yaw-fyaw;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;fyaw+=dy*0.08;
  const pitch=-Math.max(-0.25,Math.min(0.25,Math.atan2(tv.y,Math.max(horiz,0.25))*0.4));fr.rotation.set(pitch,fyaw,0,'YXZ');});
