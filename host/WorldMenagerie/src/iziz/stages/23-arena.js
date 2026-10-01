// ---------- arena: three tiers of arcaded facade on an ellipse, attic with banner masts, stepped seating around a sand floor ----------
const mastM=new THREE.MeshLambertMaterial({color:0x4a3a2a});mastM.userData.tex='timber';
const A0=48,B0=40,g=new THREE.Group();g.position.set(ARENA.x,terrainH(ARENA.x,ARENA.z)-1,ARENA.z);
const GATE=[0,Math.PI/2,Math.PI,3*Math.PI/2];
function ering(a,b,y,h,depth,n,mat,skipGates){for(let i=0;i<n;i++){const t0=i/n*2*Math.PI,t1=(i+1)/n*2*Math.PI,tm=(t0+t1)/2;
  if(skipGates&&GATE.some(gt=>angDiff(tm,gt)<0.16))continue;
  const p0=[a*Math.cos(t0),b*Math.sin(t0)],p1=[a*Math.cos(t1),b*Math.sin(t1)];const len=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]),ang=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]);
  g.add(mesh(boxG,mat,(p0[0]+p1[0])/2,y,(p0[1]+p1[1])/2,len+0.4,h,depth,-ang));}}
const N=40;let y=0;
for(let k=0;k<3;k++){const a=A0-k*2.6,b=B0-k*2.2,h=k<2?8.5:7.5;
  ering(a,b,y,h,3,N,sandM,k===0);                                                       // ring wall
  for(let i=0;i<N;i++){const t=i/N*2*Math.PI;if(k===0&&GATE.some(gt=>angDiff(t,gt)<0.16))continue;
    const nx=Math.cos(t)/a,nz=Math.sin(t)/b,nl=Math.hypot(nx,nz);const ox=nx/nl*1.2,oz=nz/nl*1.2;    // outward normal
    const tang=Math.atan2(-Math.cos(t)*b, Math.sin(t)*a);
    g.add(mesh(boxG,sandLightM,a*Math.cos(t)+ox,y,b*Math.sin(t)+oz,2.4,h,3.6,-tang));       // pilaster
    const tmid=(i+0.5)/N*2*Math.PI;if(k===0&&GATE.some(gt=>angDiff(tmid,gt)<0.16))continue;
    const mx=Math.cos(tmid)/a,mz=Math.sin(tmid)/b,ml=Math.hypot(mx,mz);const tang2=Math.atan2(-Math.cos(tmid)*b,Math.sin(tmid)*a);
    g.add(mesh(boxG,darkM,a*Math.cos(tmid)+mx/ml*1.6,y+0.6,b*Math.sin(tmid)+mz/ml*1.6,3.2,h*0.68,0.5,-tang2));   // arched recess
    g.add(mesh(boxG,gateTopM,a*Math.cos(tmid)+mx/ml*1.7,y+0.6+h*0.68,b*Math.sin(tmid)+mz/ml*1.7,3.6,0.6,0.6,-tang2));}   // arch head
  ering(a+1.4,b+1.4,y+h,1.5,4.6,N,wallDarkM,false);                                       // entablature
  y+=h+1.5;
}
ering(A0-8.2,B0-7,y,4.5,3,N,sandM,false);ering(A0-6.8,B0-5.6,y+4.5,0.8,4.8,N,gateTopM,false);   // attic
for(let i=0;i<N;i+=4){const t=i/N*2*Math.PI,x=(A0-8.2)*Math.cos(t),z=(B0-7)*Math.sin(t);       // banner masts
  g.add(mesh(boxG,mastM,x,y+4.5,z,0.5,10,0.5,0));g.add(mesh(boxG,flagM([0xe07a2a,0x9c2d2d,0x2f8f8a][(i/4)%3]),x,y+7.5,z,0.25,5.5,2,-t));const ml=mesh(boxG,glowM,x,y+14.5,z,0.8,0.8,0.8,0);ml.userData.sched=2;g.add(ml);}
// gates: tall dark portals with lintels on the four axes
for(const gt of GATE){const x=(A0-1)*Math.cos(gt),z=(B0-1)*Math.sin(gt),tang=Math.atan2(-Math.cos(gt)*B0,Math.sin(gt)*A0);
  g.add(mesh(boxG,sandLightM,x,0,z,14,10.5,5,-tang));g.add(mesh(boxG,darkM,x,0,z,7,8,5.6,-tang));g.add(mesh(boxG,gateTopM,x,10.5,z,15,1.4,5.6,-tang));}
// seating: stepped elliptical tiers down to the floor, a podium wall, then the sand
for(let k=0;k<6;k++)ering(A0-9-k*3.1,B0-8-k*2.7,11-k*2,2.1,3.3,56,k%2?sandLightM:sandM,false);
ering(A0-27.6,B0-24.2,1,2.6,1.2,56,wallDarkM,false);
{const fl=mesh(cyl(1,1,1,48),new THREE.MeshLambertMaterial({color:0xd9b27a}),0,0.5,0,A0-27.6,1,B0-24.2,0);fl.material.userData.tex='sand';g.add(fl);
 const ov=mesh(torus(1,0.06,6,48),wallDarkM,0,1.05,0,A0-32,B0-28,1,0);ov.rotation.x=Math.PI/2;g.add(ov);}
// vomitoria: dark openings in the seating on the diagonals
for(const t of [Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4]){const a=A0-16,b=B0-14;g.add(mesh(boxG,darkM,a*Math.cos(t),6.4,b*Math.sin(t),4,3,4,-t));}
scene.add(g);
});
await stage('statues');
section('statues',()=>{
