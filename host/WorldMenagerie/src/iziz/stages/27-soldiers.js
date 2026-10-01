// ---------- soldiers: five patrol squads marching in 3x4 blocks, sentries on the outer and palace walls ----------
const helmG=new THREE.SphereGeometry(0.36,8,6,0,Math.PI*2,0,Math.PI*0.56);
const whiteM=new THREE.MeshLambertMaterial({color:0xf2efe6}),orangeSM=new THREE.MeshLambertMaterial({color:0xe07a2a}),orangeCM=new THREE.MeshLambertMaterial({color:0xe07a2a}),skinM=new THREE.MeshLambertMaterial({color:0xd9b58a}),spearM=new THREE.MeshLambertMaterial({color:0x4a3a2a});
const NSQ=5,SQN=12;const squads=[];
for(let q=0;q<NSQ;q++){let x=0,z=0,t=0;do{x=rr(-200,200);z=rr(-200,200);}while(!(walkable(x,z)&&Math.hypot(x,z)<wallR(Math.atan2(z,x))-24)&&t++<8000);squads.push({x,z,h:rr(0,6.28),v:2.2});}
const sentries=[];
for(let i=0;i<84&&sentries.length<26;i+=3){const t=(i+1.5)/84*2*Math.PI;if(GATES.some(g=>angDiff(t,g)<0.13))continue;const R=wallR(t)-1.5,x=R*Math.cos(t),z=R*Math.sin(t);sentries.push({x,z,y:terrainH(x,z)-3+22.2,h:Math.PI/2-t,sway:rr(0,6.28)});}
for(let i=0;i<8;i++){const t=i/8*2*Math.PI+0.2;if(PGATES.some(pg=>angDiff(t,pg)<0.3))continue;const R=62+3*Math.sin(5*t)-1,x=PALACE.x+R*Math.cos(t),z=PALACE.z+R*Math.sin(t);sentries.push({x,z,y:terrainH(x,z)-3+11.2,h:Math.PI/2-t,sway:rr(0,6.28)});}
// a small shelter beside every sentry on the wall walks
for(const se of sentries){const pal=Math.hypot(se.x-PALACE.x,se.z-PALACE.z)<90,k=pal?0.8:1,q=loc(se.x,se.z,2.5*k,0,se.h),y=se.y-0.1;
  scene.add(mesh(boxG,pal?sandM:wallM,q[0],y,q[1],2.2*k,2.8*k,1.8*k,se.h));
  scene.add(mesh(frusG(0.55),gateTopM,q[0],y+2.8*k,q[1],2.8*k,0.9*k,2.4*k,se.h));
  const d=loc(q[0],q[1],0,-0.92*k,se.h);scene.add(mesh(boxG,darkM,d[0],y,d[1],0.8*k,1.9*k,0.08,se.h));
  const w=loc(q[0],q[1],0,0.92*k,se.h);scene.add(mesh(boxG,darkM,w[0],y+1.8*k,w[1],0.9*k,0.25*k,0.08,se.h));}
// two guards inside every gate mouth: side by side in front of the shut doors at night, stepped aside while the gates are open
const gateGuards=[];
GATES.forEach(g=>{const R=wallR(g),ux=Math.cos(g),uz=Math.sin(g),vx=-Math.sin(g),vz=Math.cos(g),bx=(R-17)*ux,bz=(R-17)*uz;
  [-1,1].forEach(sd=>gateGuards.push({bx,bz,vx,vz,sd,closedLat:1.3,openLat:8.5,face:Math.atan2(ux,uz),lat:8.5,ph:xr()*6.28}));});
PGATES.forEach(pg=>{const R=62+3*Math.sin(5*pg),ux=Math.cos(pg),uz=Math.sin(pg),vx=-Math.sin(pg),vz=Math.cos(pg),bx=PALACE.x+(R+9)*ux,bz=PALACE.z+(R+9)*uz;
  [-1,1].forEach(sd=>gateGuards.push({bx,bz,vx,vz,sd,closedLat:1.0,openLat:5.4,face:Math.atan2(-ux,-uz),lat:5.4,ph:xr()*6.28}));});
// the relief column for the changing of the guard (06:00 and 18:00): hidden until then
squads.push({x:PALACE.x,z:PALACE.z,h:0,v:2.0,guard:true,active:false,leg:0,barracks:0});
const NS=squads.length*SQN+sentries.length+gateGuards.length;
const sBody=new THREE.InstancedMesh(bodyG,whiteM,NS),sHead=new THREE.InstancedMesh(headG,skinM,NS),sHelm=new THREE.InstancedMesh(helmG,orangeSM,NS),sCape=new THREE.InstancedMesh(boxG,orangeCM,NS),sSpear=new THREE.InstancedMesh(boxG,spearM,NS);
for(const im of [sBody,sHead,sHelm,sCape,sSpear]){im.userData.noShadow=true;im.userData.life=true;}scene.add(sBody,sHead,sHelm,sCape,sSpear);
function drawSoldier(i,x,y,z,h,bob,hide){const fx=Math.sin(h),fz=Math.cos(h);if(hide){dm.position.set(x,-500,z);dm.scale.set(0.001,0.001,0.001);dm.rotation.set(0,0,0);dm.updateMatrix();for(const im of [sBody,sHead,sHelm,sCape,sSpear])im.setMatrixAt(i,dm.matrix);return;}
  dm.position.set(x,y+bob,z);dm.scale.set(1,1.6,1);dm.rotation.set(0,h,0);dm.updateMatrix();sBody.setMatrixAt(i,dm.matrix);
  dm.position.set(x,y+bob+1.85,z);dm.scale.set(1,1,1);dm.updateMatrix();sHead.setMatrixAt(i,dm.matrix);
  dm.position.set(x,y+bob+1.9,z);dm.scale.set(1,1.1,1);dm.updateMatrix();sHelm.setMatrixAt(i,dm.matrix);
  dm.position.set(x-fx*0.45,y+bob+0.5,z-fz*0.45);dm.scale.set(0.9,1.5,0.12);dm.rotation.set(0.12,h,0);dm.updateMatrix();sCape.setMatrixAt(i,dm.matrix);
  dm.position.set(x+fz*0.5,y+bob,z-fx*0.5);dm.scale.set(0.14,3.6,0.14);dm.rotation.set(0,h,0);dm.updateMatrix();sSpear.setMatrixAt(i,dm.matrix);}
