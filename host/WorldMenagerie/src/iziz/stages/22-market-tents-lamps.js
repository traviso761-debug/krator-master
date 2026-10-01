// ---------- market tents in the plazas, lamp posts along the boulevards ----------
const TENTS=[0xf1e3c2,0xd9c39a,0xe8b07a,0xcfa3a0,0xa7c4b8,0xe6d27a];
const tentM=new THREE.MeshLambertMaterial({color:0xffffff});tentM.userData.tex='stripes';
const tents=new THREE.InstancedMesh(frusPyr,tentM,400);let ntt=0;tents.userData.navBlock=true;
[[-125,60,22],[60,150,18],[-70,-140,22],[TEMPLE.x,TEMPLE.z+52,14]].forEach(pz=>{
  for(let i=0;i<Math.round(pz[2]*1.6)&&ntt<400;i++){const r=rr(6,pz[2]-3),t=rr(0,6.28),x=pz[0]+r*Math.cos(t),z=pz[1]+r*Math.sin(t);
    if(Math.hypot(x-pz[0],z-pz[1])<7)continue;const s=rr(2.6,4.2);put(tents,ntt++,x,terrainH(x,z)-0.3,z,s,rr(2.2,3.4),s,rr(0,6.28),pick(TENTS));}
});
tents.count=ntt;tents.instanceMatrix.needsUpdate=true;if(tents.instanceColor)tents.instanceColor.needsUpdate=true;if(ntt>0)scene.add(tents);
{const base=tents.instanceMatrix.array.slice(0,ntt*16);let lastF=-1;tents.userData.dynamicMatrices=true;
 animHooks.push(()=>{const f=Math.round(marketF(ctx.hour||0)*50)/50;if(f===lastF)return;lastF=f;const a=tents.instanceMatrix.array,sy=Math.max(0.03,f),sx=0.35+0.65*f;
   for(let i=0;i<ntt;i++){const e=i*16;for(let k=0;k<16;k++)a[e+k]=base[e+k];for(const c of [0,1,2]){a[e+c]*=sx;a[e+8+c]*=sx;a[e+4+c]*=sy;}}
   tents.instanceMatrix.needsUpdate=true;});}
const poleM=new THREE.MeshLambertMaterial({color:0x4a3a2a});poleM.userData.tex='timber';
const RESERVED=[[PALACE.x,PALACE.z,72],[ARENA.x,ARENA.z,62],[TEMPLE.x,TEMPLE.z,50],[SP.x,SP.z,SPR+6],[AMPH.x,AMPH.z,24]];const reserved=(x,z)=>RESERVED.some(r=>Math.hypot(x-r[0],z-r[1])<r[2]);
const poles=new THREE.InstancedMesh(boxG,poleM,600);poles.userData.navBlock=true;const lamps=new THREE.InstancedMesh(withLightT(boxG,600),lampHook(glowM.clone(),'S'),600);let nlp=0;
for(const gA of GATES){const R=wallR(gA);
  for(let r=40;r<R-20;r+=16){[-1,1].forEach(sd=>{if(nlp>=600)return;const x=r*Math.cos(gA)-sd*8.6*Math.sin(gA),z=r*Math.sin(gA)+sd*8.6*Math.cos(gA);if(reserved(x,z))return;const y=terrainH(x,z)-0.3;
    const rn=clamp((r-40)/(R-60),0,1),lt=[17.55+0.5*rn+(sd>0?0.02:0),29.55+0.5*(1-rn),-1];put(poles,nlp,x,y,z,0.45,5.5,0.45,0);setLT(lamps,nlp,lt[0],lt[1],-1);put(lamps,nlp++,x,y+5.5,z,0.6,0.5,0.6,0);glowPush(x,y+5.8,z,1,0.85,0.4,6,lt);});}}
poles.count=nlp;lamps.count=nlp;poles.instanceMatrix.needsUpdate=true;lamps.instanceMatrix.needsUpdate=true;if(nlp>0){scene.add(poles,lamps);}
// fountains: stone basin, lit water, central spout column
const waterM=new THREE.MeshBasicMaterial({color:0x5cc4ff,transparent:true,opacity:0.85});
function fountain(x,z,r){const y=terrainH(x,z)-0.2;const g=new THREE.Group();g.position.set(x,y,z);
  g.add(mesh(cyl(r,r+0.4,1.4,16),sandM,0,0.7,0,1,1,1,0));
  g.add(mesh(cyl(r-0.6,r-0.6,0.3,16),waterM,0,1.3,0,1,1,1,0));
  g.add(mesh(polyTower(8,0.7),sandLightM,0,1.2,0,r*0.35,3.2,r*0.35,0));g.add(mesh(cyl(r*0.3,r*0.3,0.3,10),waterM,0,4.3,0,1,1,1,0));
  g.add(mesh(boxG,glowM,0,4.4,0,0.5,1.6,0.5,0));g.userData.navR=r+1.2;scene.add(g);}
fountain(-125+11,60+9,4);fountain(60-9,150+8,3.5);fountain(-70+11,-140-9,4);fountain(PALACE.x,PALACE.z+50,4);
// banners flanking each boulevard just inside the gate, orange and deep red with a teal band
const BAN=[0xe07a2a,0x9c2d2d,0x2f8f8a];
for(const gA of GATES){const R=wallR(gA);for(let k=0;k<3;k++){const r=R-28-k*14;[-1,1].forEach(sd=>{
  const x=r*Math.cos(gA)-sd*10*Math.sin(gA),z=r*Math.sin(gA)+sd*10*Math.cos(gA),y=terrainH(x,z)-0.3;if(reserved(x,z))return;
  const bp=mesh(boxG,poleM,x,y,z,0.5,11,0.5,0);bp.userData.navR=1.6;scene.add(bp);scene.add(mesh(boxG,flagM(BAN[k]),x,y+3.5,z,0.25,6.5,2.2,-gA));
  scene.add(mesh(boxG,gateTopM,x,y+10.6,z,0.5,0.5,3,-gA));});}}
// planters beside every other lamp post
{const pl=new THREE.InstancedMesh(boxG,new THREE.MeshLambertMaterial({color:0x8a6a3a}),400);let npl=0;pl.userData.navBlock=true;
 for(const gA of GATES){const R=wallR(gA);for(let r=48;r<R-20;r+=32){[-1,1].forEach(sd=>{if(npl>=400)return;const x=r*Math.cos(gA)-sd*8.6*Math.sin(gA)+sd*Math.cos(gA)*0,z=r*Math.sin(gA)+sd*8.6*Math.cos(gA);
   if(reserved(x,z))return;const y=terrainH(x,z)-0.3;put(pl,npl++,x+Math.cos(gA)*4,y,z+Math.sin(gA)*4,2.2,1.2,1.4,-gA);cityGreen.push([x+Math.cos(gA)*4,z+Math.sin(gA)*4]);});}}
 pl.count=npl;pl.instanceMatrix.needsUpdate=true;if(npl>0)scene.add(pl);}
});
await stage('arena');
section('arena',()=>{
