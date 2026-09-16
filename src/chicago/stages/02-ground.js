// ---------- ground: the painted map (streets, parks, beach), the lake and river, bridges, the pier ----------
await stage('ground');
const GS=2048,PX=GS/WORLD,px=v=>(v+WORLD/2)*PX;
const gcv=document.createElement('canvas');gcv.width=gcv.height=GS;const g2=gcv.getContext('2d');
section('ground',()=>{
  g2.fillStyle='#8d8a82';g2.fillRect(0,0,GS,GS);   // paving and roofs of the low city
  // neighbourhood texture: a faint block grid everywhere
  g2.strokeStyle='rgba(0,0,0,0.10)';g2.lineWidth=2;for(let x=-WORLD/2;x<=WORLD/2;x+=GRID.pitchX){g2.beginPath();g2.moveTo(px(x),0);g2.lineTo(px(x),GS);g2.stroke();}
  for(let z=-WORLD/2;z<=WORLD/2;z+=GRID.pitchZ){g2.beginPath();g2.moveTo(0,px(z));g2.lineTo(GS,px(z));g2.stroke();}
  // parks
  for(const p of C.parks){g2.fillStyle='#5f8a48';g2.fillRect(px(p.x0),px(p.z0),(p.x1-p.x0)*PX,(p.z1-p.z0)*PX);
    const R=mkRng(p.x0*7+p.z0);g2.fillStyle='rgba(30,70,30,0.35)';for(let k=0;k<(p.x1-p.x0)*(p.z1-p.z0)/2500;k++){g2.beginPath();g2.arc(px(p.x0+R()*(p.x1-p.x0)),px(p.z0+R()*(p.z1-p.z0)),2+R()*3,0,7);g2.fill();}
    g2.strokeStyle='#c9bfa8';g2.lineWidth=1.5;for(let k=0;k<3;k++){g2.beginPath();g2.moveTo(px(p.x0),px(p.z0+(k+0.5)*(p.z1-p.z0)/3));g2.lineTo(px(p.x1),px(p.z0+(k+0.5)*(p.z1-p.z0)/3));g2.stroke();}}
  // beach, then the water
  g2.fillStyle='#d9caa2';g2.fillRect(px(C.beach.x0),px(C.beach.z0),(SHORE+40-C.beach.x0)*PX,(C.beach.z1-C.beach.z0)*PX);
  g2.fillStyle='#2b5d88';g2.fillRect(px(SHORE),0,GS-px(SHORE),GS);
  g2.fillStyle='#31678f';g2.fillRect(px(RM.xWest-RN.width/2),px(RM.z-RM.width/2),(RM.xEast-RM.xWest+RN.width/2)*PX,RM.width*PX);
  g2.fillRect(px(RN.x-RN.width/2),px(RN.zEnd),RN.width*PX,(RM.z-RN.zEnd)*PX);g2.fillRect(px(RS.x-RS.width/2),px(RM.z),RS.width*PX,(RS.zEnd-RM.z)*PX);
  // streets: the grid, then the wide ones with a centre line
  const street=(axis,at,w,major)=>{g2.fillStyle=major?'#34363a':'#4a4b4f';if(axis==='x'){if(at>SHORE)return;g2.fillRect(px(at-w/2),0,w*PX,GS);}else g2.fillRect(0,px(at-w/2),Math.min(GS,px(SHORE)),w*PX);
    if(major){g2.strokeStyle='rgba(230,200,90,0.5)';g2.lineWidth=1;g2.setLineDash([6,6]);g2.beginPath();if(axis==='x'){g2.moveTo(px(at),0);g2.lineTo(px(at),GS);}else{g2.moveTo(0,px(at));g2.lineTo(px(SHORE),px(at));}g2.stroke();g2.setLineDash([]);}};
  for(let x=-WORLD/2;x<=SHORE;x+=GRID.pitchX)street('x',x,GRID.street,false);
  for(let z=-WORLD/2;z<=WORLD/2;z+=GRID.pitchZ)street('z',z,GRID.street,false);
  for(const m of MAJOR)street(m.axis,m.at,m.w,true);
  // Lake Shore Drive runs the whole shore; the pier is paved
  g2.fillStyle='#a19b90';g2.fillRect(px(PIER.x),px(PIER.z-PIER.width/2),PIER.length*PX,PIER.width*PX);
  // water takes precedence over streets that were painted across it
  g2.fillStyle='#31678f';g2.fillRect(px(RM.xWest-RN.width/2),px(RM.z-RM.width/2),(RM.xEast-RM.xWest+RN.width/2)*PX,RM.width*PX);
  g2.fillRect(px(RN.x-RN.width/2),px(RN.zEnd),RN.width*PX,(RM.z-RN.zEnd)*PX);g2.fillRect(px(RS.x-RS.width/2),px(RM.z),RS.width*PX,(RS.zEnd-RM.z)*PX);
});
const groundTex=new THREE.CanvasTexture(gcv);groundTex.anisotropy=8;
const ground=new THREE.Mesh(new THREE.PlaneGeometry(WORLD,WORLD),new THREE.MeshLambertMaterial({map:groundTex}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.userData.noShadow=true;scene.add(ground);
// water: one lake plane and three river ribbons, just above the paint
const waterM=new THREE.MeshPhongMaterial({color:0x2c6390,specular:0x9fc4e0,shininess:90,transparent:true,opacity:0.92});
{const lake=new THREE.Mesh(new THREE.PlaneGeometry(WORLD/2-SHORE,WORLD),waterM);lake.rotation.x=-Math.PI/2;lake.position.set((SHORE+WORLD/2)/2,0.12,0);lake.receiveShadow=true;scene.add(lake);
 const rib=(x,z,w,d)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),waterM);m.rotation.x=-Math.PI/2;m.position.set(x,0.12,z);scene.add(m);};
 rib((RM.xWest+RM.xEast)/2,RM.z,RM.xEast-RM.xWest+RN.width,RM.width);rib(RN.x,(RM.z+RN.zEnd)/2,RN.width,RM.z-RN.zEnd);rib(RS.x,(RM.z+RS.zEnd)/2,RS.width,RS.zEnd-RM.z);}
animHooks.push(now=>{waterM.shininess=70+25*Math.sin(now*0.0011);});
// a low sea wall along the shore, the pier as a slab with its sheds, and the bridges
const stoneM=new THREE.MeshLambertMaterial({color:0xbdb5a6}),steelM=new THREE.MeshLambertMaterial({color:0x6b6f75});
{const wall=new THREE.Mesh(new THREE.BoxGeometry(6,3,WORLD),stoneM);wall.position.set(SHORE-3,1.2,0);wall.castShadow=true;scene.add(wall);
 const slab=new THREE.Mesh(new THREE.BoxGeometry(PIER.length,4,PIER.width),stoneM);slab.position.set(PIER.x+PIER.length/2,2,PIER.z);slab.castShadow=slab.receiveShadow=true;scene.add(slab);
 for(let k=0;k<4;k++){const shed=new THREE.Mesh(new THREE.BoxGeometry(150,12,50),new THREE.MeshLambertMaterial({color:0xd8d2c4}));shed.position.set(PIER.x+180+k*200,10,PIER.z+(k%2?18:-18));shed.castShadow=true;scene.add(shed);}
 const hall=new THREE.Mesh(new THREE.BoxGeometry(80,26,90),new THREE.MeshLambertMaterial({color:0xc9b8a0}));hall.position.set(PIER.x+PIER.length-60,17,PIER.z);hall.castShadow=true;scene.add(hall);}
const bridges=[];
function bridge(x,z,w,len,along){const b=new THREE.Mesh(new THREE.BoxGeometry(along==='x'?len:w,2.4,along==='x'?w:len),steelM);b.position.set(x,4.2,z);b.castShadow=b.receiveShadow=true;scene.add(b);bridges.push(b);
  for(const s of [-1,1]){const r=new THREE.Mesh(new THREE.BoxGeometry(along==='x'?len:1.2,3.5,along==='x'?1.2:len),steelM);r.position.set(x+(along==='x'?0:s*(w/2-0.6)),7,z+(along==='x'?s*(w/2-0.6):0));scene.add(r);}
  for(const s of [-1,1]){const t=new THREE.Mesh(new THREE.BoxGeometry(6,14,6),stoneM);t.position.set(x+(along==='x'?s*len/2:0),7,z+(along==='x'?0:s*len/2));scene.add(t);}}
for(let x=-WORLD/2;x<=SHORE;x+=GRID.pitchX)if(x>RM.xWest+40&&x<RM.xEast-30){const m=majorAt(x,RM.z-200);bridge(x,RM.z,(m&&m.axis==='x'?m.w:GRID.street)+2,RM.width+16,'z');}
for(let z=-WORLD/2;z<=WORLD/2;z+=GRID.pitchZ)if(Math.abs(z-RM.z)>90){const m=majorAt(RN.x+200,z);bridge(RN.x,z,(m&&m.axis==='z'?m.w:GRID.street)+2,RN.width+16,'x');}
// trees in the parks and along Michigan Avenue
{const trunkM=new THREE.MeshLambertMaterial({color:0x5a4030}),leafM=new THREE.MeshLambertMaterial({color:0x3f7a3a});
 const spots=[];for(const p of C.parks){const R=mkRng(p.x1*3+p.z1);const n=Math.floor((p.x1-p.x0)*(p.z1-p.z0)/2200);for(let k=0;k<n;k++){const x=p.x0+8+R()*(p.x1-p.x0-16),z=p.z0+8+R()*(p.z1-p.z0-16);if(!majorAt(x,z))spots.push([x,z,7+R()*6]);}}
 for(let z=-1500;z<=900;z+=26)for(const s of [-1,1])spots.push([260+s*22,z,7]);
 const tr=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.4,0.6,1,5),trunkM,spots.length),lf=new THREE.InstancedMesh(new THREE.SphereGeometry(1,7,5),leafM,spots.length);
 const d=new THREE.Object3D();spots.forEach(([x,z,h],i)=>{d.position.set(x,h*0.25,z);d.scale.set(1,h*0.5,1);d.updateMatrix();tr.setMatrixAt(i,d.matrix);d.position.set(x,h*0.7,z);d.scale.set(h*0.42,h*0.34,h*0.42);d.updateMatrix();lf.setMatrixAt(i,d.matrix);});
 tr.castShadow=lf.castShadow=true;scene.add(tr,lf);ctx.trees=spots.length;}
