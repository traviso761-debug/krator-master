// ---------- ground: the painted map (streets, parks, beaches), the lake shore, the river's real course, bridges, the pier ----------
await stage('ground');
const GS=4096,PX=GS/WORLD,px=v=>(v+HALF)*PX;
const gcv=document.createElement('canvas');gcv.width=gcv.height=GS;const g2=gcv.getContext('2d');
const polyPath=(pts,close)=>{g2.beginPath();pts.forEach(([x,z],i)=>i?g2.lineTo(px(x),px(z)):g2.moveTo(px(x),px(z)));if(close)g2.closePath();};
const strokePath=(pts,w,col)=>{g2.strokeStyle=col;g2.lineWidth=w*PX;g2.lineCap='round';g2.lineJoin='round';polyPath(pts,false);g2.stroke();};
const WATER='#2f6690';
function paintWater(){g2.fillStyle=WATER;polyPath(LAKE_POLY,true);g2.fill();for(const r of RIVERS)strokePath(r.pts,r.width,WATER);}
section('ground',()=>{
  g2.fillStyle='#7a776f';g2.fillRect(0,0,GS,GS);   // paving and roofs of the low city
  const street=(s,col)=>{strokePath([s.a,s.b],s.w,col);};
  for(const s of STREETS)if(!s.major)street(s,'#4d4e52');
  for(const p of PARKS){g2.fillStyle='#5f8a48';g2.fillRect(px(p.x0),px(p.z0),(p.x1-p.x0)*PX,(p.z1-p.z0)*PX);
    const R=mkRng(Math.round(p.x0*7+p.z0));g2.fillStyle='rgba(30,70,30,0.35)';for(let k=0;k<(p.x1-p.x0)*(p.z1-p.z0)/900;k++){g2.beginPath();g2.arc(px(p.x0+R()*(p.x1-p.x0)),px(p.z0+R()*(p.z1-p.z0)),1.5+R()*3,0,7);g2.fill();}}
  for(const b of BEACHES)strokePath(b.pts,b.w*2,'#dccda4');
  for(const s of STREETS)if(s.major)street(s,'#35373b');
  // centre lines on the majors
  g2.setLineDash([10,10]);for(const s of STREETS)if(s.major)strokePath([s.a,s.b],1.2/PX*1.2,'rgba(230,200,90,0.55)');g2.setLineDash([]);
  g2.fillStyle='#a19b90';g2.fillRect(px(PIER.x0-40),px(PIER.z-PIER.width/2),(PIER.length+40)*PX,PIER.width*PX);
  for(const r of RIVERS)strokePath(r.pts,r.width+12,'#c9c2b4');   // the river walls: a pale edge along both banks
  paintWater();   // the lake and the river win over anything painted across them
  g2.fillStyle='#a19b90';g2.fillRect(px(PIER.x0),px(PIER.z-PIER.width/2),PIER.length*PX,PIER.width*PX);
});
const groundTex=new THREE.CanvasTexture(gcv);groundTex.anisotropy=8;
const ground=new THREE.Mesh(new THREE.PlaneGeometry(WORLD,WORLD),new THREE.MeshLambertMaterial({map:groundTex}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.userData.noShadow=true;scene.add(ground);
// water surfaces: the lake as its real outline, each river as a ribbon that follows its bends
const waterM=new THREE.MeshPhongMaterial({color:0x2c6390,specular:0x9fc4e0,shininess:90,transparent:true,opacity:0.92});
{const shape=new THREE.Shape();LAKE_POLY.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));   // shape is in x,y; rotated flat, y becomes -z
 const lake=new THREE.Mesh(new THREE.ShapeGeometry(shape),waterM);lake.rotation.x=-Math.PI/2;lake.position.y=0.15;lake.receiveShadow=true;scene.add(lake);
 for(const r of RIVERS){const pos=[],idx=[],L=r.pts;for(let i=0;i<L.length;i++){const a=L[Math.max(0,i-1)],b=L[Math.min(L.length-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const n=Math.hypot(dx,dz)||1;dx/=n;dz/=n;const h=r.width/2+2;
     pos.push(L[i][0]-dz*h,0.2,L[i][1]+dx*h,L[i][0]+dz*h,0.2,L[i][1]-dx*h);if(i)idx.push((i-1)*2,(i-1)*2+1,i*2,(i-1)*2+1,i*2+1,i*2);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
   const m=new THREE.Mesh(g,waterM.clone());m.material.side=THREE.DoubleSide;scene.add(m);}}
animHooks.push(now=>{waterM.shininess=70+25*Math.sin(now*0.0011);});
const stoneM=new THREE.MeshLambertMaterial({color:0xbdb5a6}),steelM=new THREE.MeshLambertMaterial({color:0x6b6f75});
// the pier: a slab with its sheds and the Festival Hall at the end
{const slab=new THREE.Mesh(new THREE.BoxGeometry(PIER.length,4,PIER.width),stoneM);slab.position.set(PIER.x0+PIER.length/2,2,PIER.z);slab.castShadow=slab.receiveShadow=true;scene.add(slab);
 const shedM=new THREE.MeshLambertMaterial({color:0xd8d2c4});for(let k=0;k<5;k++){const shed=new THREE.Mesh(new THREE.BoxGeometry(140,12,34),shedM);shed.position.set(PIER.x0+140+k*160,10,PIER.z+(k%2?20:-20));shed.castShadow=true;scene.add(shed);}
 const hall=new THREE.Mesh(new THREE.BoxGeometry(80,26,86),new THREE.MeshLambertMaterial({color:0xc9b8a0}));hall.position.set(PIER.x1-45,17,PIER.z);hall.castShadow=true;scene.add(hall);}
// bridges: wherever a street crosses a river, a deck along the street, as long as the crossing is wide
const bridges=[];
function bridge(x,z,ang,w,len){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=-ang;
  const deck=new THREE.Mesh(new THREE.BoxGeometry(len,2.4,w),steelM);deck.position.y=4.2;deck.castShadow=deck.receiveShadow=true;g.add(deck);
  for(const s of [-1,1]){const rail=new THREE.Mesh(new THREE.BoxGeometry(len,3.2,1.2),steelM);rail.position.set(0,7,s*(w/2-0.6));g.add(rail);
    const tower=new THREE.Mesh(new THREE.BoxGeometry(7,13,7),stoneM);tower.position.set(s*(len/2-3),6.5,w/2+3);g.add(tower);}
  scene.add(g);bridges.push({x,z,ang,w,len});}
section('bridges',()=>{
  for(const s of STREETS)for(const r of RIVERS)for(let i=0;i+1<r.pts.length;i++){const h=segHit(s.a,s.b,r.pts[i],r.pts[i+1]);if(!h)continue;
    const rl=Math.hypot(...h.r),sl=Math.hypot(...h.s),sin=Math.abs(h.r[0]*h.s[1]-h.r[1]*h.s[0])/(rl*sl);if(sin<0.45)continue;   // a street running along the bank is not a crossing
    if(bridges.some(b=>Math.hypot(b.x-h.x,b.z-h.z)<25))continue;
    bridge(h.x,h.z,Math.atan2(h.r[1],h.r[0]),s.w+2,r.width/sin+18);}
  ctx.details=Object.assign(ctx.details||{},{bridges:bridges.length});});
function onBridge(x,z){for(const b of bridges){const dx=x-b.x,dz=z-b.z,c=Math.cos(b.ang),s=Math.sin(b.ang),u=dx*c+dz*s,v=-dx*s+dz*c;if(Math.abs(u)<=b.len/2&&Math.abs(v)<=b.w/2)return true;}return false;}
// trees: in the parks and along Michigan Avenue and the river
const PARK_FEATURES=C.landmarks.map(l=>{const [x,z]=P(l.at);return [x,z,Math.max(l.w||20,l.d||0)*0.6+(l.gap||0)*0.6+(l.kind==='pavilion'?110:25)];});   // plazas, lawns and fountains stay open
{const trunkM=new THREE.MeshLambertMaterial({color:0x5a4030}),leafM=new THREE.MeshLambertMaterial({color:0x3f7a3a});
 const spots=[];for(const p of PARKS){const R=mkRng(Math.round(p.x1*3+p.z1));const n=Math.floor((p.x1-p.x0)*(p.z1-p.z0)/1500);
   for(let k=0;k<n;k++){const x=p.x0+8+R()*(p.x1-p.x0-16),z=p.z0+8+R()*(p.z1-p.z0-16);if(!streetAt(x,z)&&!inWater(x,z)&&!PARK_FEATURES.some(f=>Math.hypot(f[0]-x,f[1]-z)<f[2]))spots.push([x,z,7+R()*6]);}}
 const mich=lonX(-87.6245);for(let z=latZ(41.9008);z<=latZ(41.8674);z+=24)for(const s of [-1,1]){const x=mich+s*22;if(!inWater(x,z)&&!parkAt(x,z))spots.push([x,z,7]);}
 const tr=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.4,0.6,1,5),trunkM,spots.length),lf=new THREE.InstancedMesh(new THREE.SphereGeometry(1,7,5),leafM,spots.length);
 const d=new THREE.Object3D();spots.forEach(([x,z,h],i)=>{d.position.set(x,h*0.25,z);d.scale.set(1,h*0.5,1);d.updateMatrix();tr.setMatrixAt(i,d.matrix);d.position.set(x,h*0.7,z);d.scale.set(h*0.42,h*0.34,h*0.42);d.updateMatrix();lf.setMatrixAt(i,d.matrix);});
 tr.castShadow=lf.castShadow=true;scene.add(tr,lf);ctx.trees=spots.length;}
