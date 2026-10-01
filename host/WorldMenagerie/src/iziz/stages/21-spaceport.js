// ---------- spaceport: bunker hub, six landing pads, fuel farm, control tower, perimeter ----------
const concM=new THREE.MeshLambertMaterial({color:0xd08a45}),concDarkM=new THREE.MeshLambertMaterial({color:0xa8622c}),metalM=new THREE.MeshLambertMaterial({color:0xb9bcc2}),tankM=new THREE.MeshLambertMaterial({color:0xe2b676}),padM=new THREE.MeshLambertMaterial({color:0x6e6a62}),orangeM=new THREE.MeshLambertMaterial({color:0xe07a2a});concM.userData.tex='concrete';concDarkM.userData.tex='concrete';padM.userData.tex='concrete';metalM.userData.tex='metal';tankM.userData.tex='metal';
const g=new THREE.Group();g.position.set(SP.x,SPH-0.2,SP.z);
// central hub: low, heavy, octagonal, stepped like a bunker, with a lit collar and a dish
g.add(mesh(polyTower(8,0.86),concDarkM,0,0,0,44,7,44,0));
g.add(mesh(polyTower(8,0.88),concM,0,7,0,32,5,32,0));
g.add(mesh(polyTower(8,0.9),concDarkM,0,12,0,18,4,18,0));
g.add(mesh(hemiG,concM,0,16,0,7,4,7,0));
g.add(mesh(polyTower(8,1),orangeM,0,6.6,0,33,0.9,33,0));g.add(mesh(polyTower(8,1),orangeM,0,11.6,0,19,0.8,19,0));
for(let i=0;i<8;i++){const t=i/8*Math.PI*2+Math.PI/8;g.add(mesh(boxG,darkM,18.5*Math.cos(t),2,18.5*Math.sin(t),4,3,1.2,-t));g.add(mesh(boxG,glowM,13.6*Math.cos(t),12.2,13.6*Math.sin(t),3,0.35,0.4,-t));}
{const ex=-22*Math.cos(SPA),ez=-22*Math.sin(SPA);g.add(mesh(boxG,darkM,ex,0,ez,10,5.5,3,Math.PI/2-SPA));}   // main entrance faces the city
// control tower, rising from the hub's second tier
g.add(mesh(polyTower(8,0.8),concM,9,12,-3,6.5,26,6.5,0));
g.add(mesh(cyl(7,4.5,3.5,8),concDarkM,9,39.7,-3,1,1,1,0));
g.add(mesh(cyl(6.2,6.2,2.4,8),darkM,9,42.5,-3,1,1,1,0));
g.add(mesh(cyl(6.6,6.6,1,8),orangeM,9,44.2,-3,1,1,1,0));g.add(mesh(cyl(7.2,5.2,1,8),orangeM,9,39.2,-3,1,1,1,0));
g.add(mesh(boxG,glowM,9,44.7,-3,0.6,4,0.6,0));
// six landing pads on the taxiway ring, each with a lit edge ring and number light; two hold parked craft
for(let i=0;i<6;i++){const t=i/6*Math.PI*2+Math.PI/4,x=46*Math.cos(t),z=46*Math.sin(t);
  g.add(mesh(cyl(12,12.6,0.7,24),padM,x,0,z,1,1,1,0));
  const ring=mesh(torus(11.4,0.22,6,32),glowM,x,0.75,z,1,1,1,0);ring.rotation.x=Math.PI/2;g.add(ring);
  const oring=mesh(torus(9.6,0.5,6,32),orangeM,x,0.72,z,1,1,1,0);oring.rotation.x=Math.PI/2;g.add(oring);
  g.add(mesh(boxG,orangeM,x,0.7,z,0.8,0.12,10,0));g.add(mesh(boxG,orangeM,x,0.7,z,10,0.12,0.8,0));
  for(let k=0;k<4;k++){const a=k/4*Math.PI*2+t;g.add(mesh(boxG,glowM,x+14.5*Math.cos(a),0,z+14.5*Math.sin(a),0.7,1.6,0.7,0));}
  if(i===1||i===4){const ship=makeShip();ship.position.set(x,0.7,z);ship.rotation.y=-t+rr(-0.4,0.4);g.add(ship);}
}
// fuel farm: tanks on a bund between two pads, a pipe run back toward the hub
const fa=195*Math.PI/180,fuel=new THREE.Group();fuel.position.set(62*Math.cos(fa),0,62*Math.sin(fa));fuel.rotation.y=Math.PI/2-fa;g.add(fuel);
fuel.add(mesh(boxG,concDarkM,0,0,0,34,1.4,22,0));
for(let i=0;i<6;i++){const x=-12+(i%3)*12,z=-5+Math.floor(i/3)*11;
  fuel.add(mesh(cyl(4.6,4.6,10,14),tankM,x,6.4,z,1,1,1,0));fuel.add(mesh(hemiG,tankM,x,11.4,z,4.6,2.4,4.6,0));
  const band=mesh(torus(4.7,0.3,6,20),orangeM,x,8.6,z,1,1,1,0);band.rotation.x=Math.PI/2;fuel.add(band);
  fuel.add(mesh(boxG,darkM,x,1.4,z+4.8,1.2,1.6,0.6,0));}
fuel.add(mesh(boxG,metalM,0,1.4,-11.5,34,0.8,0.8,0));
{const px2=Math.cos(fa),pz2=Math.sin(fa);for(let r=24;r<50;r+=1.2)g.add(mesh(boxG,metalM,r*px2,1.4,r*pz2,1.3,0.8,0.8,Math.PI/2-fa));}
// freighter pad: large, with an orange inner ring and corner floods
{const bx=BPAD.x-SP.x,bz=BPAD.z-SP.z;g.add(mesh(cyl(18,18.6,0.8,32),padM,bx,0,bz,1,1,1,0));
 const r1=mesh(torus(17.2,0.25,6,40),glowM,bx,0.85,bz,1,1,1,0);r1.rotation.x=Math.PI/2;r1.userData.sched=0;g.add(r1);
 const r2=mesh(torus(13,0.6,6,40),orangeM,bx,0.8,bz,1,1,1,0);r2.rotation.x=Math.PI/2;g.add(r2);
 g.add(mesh(boxG,orangeM,bx,0.8,bz,1,0.12,16,0));g.add(mesh(boxG,orangeM,bx,0.8,bz,16,0.12,1,0));
 for(let k=0;k<4;k++){const t=k*Math.PI/2+Math.PI/4;const fl=mesh(boxG,glowM,bx+21*Math.cos(t),0,bz+21*Math.sin(t),0.8,2.4,0.8,0);fl.userData.sched=0;g.add(fl);}}
// perimeter: low wall with lamp posts and a gate where the boulevard enters
for(let i=0;i<40;i++){const t0=i/40*Math.PI*2,t1=(i+1)/40*Math.PI*2;
  if(angDiff((t0+t1)/2,SPA)<0.13||angDiff((t0+t1)/2,SPA+Math.PI)<0.13)continue;   // openings where the through-road enters and leaves
  const a=[88*Math.cos(t0),88*Math.sin(t0)],b=[88*Math.cos(t1),88*Math.sin(t1)];
  const len=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
  g.add(mesh(boxG,concDarkM,(a[0]+b[0])/2,0,(a[1]+b[1])/2,len+0.5,2.6,1.2,-ang));
  if(i%4===0){g.add(mesh(boxG,concM,a[0],0,a[1],0.6,9,0.6,0));g.add(mesh(boxG,glowM,a[0],9,a[1],1.4,0.5,1.4,0));}}
scene.add(g);
});
await stage('street-furniture');
section('street-furniture',()=>{
