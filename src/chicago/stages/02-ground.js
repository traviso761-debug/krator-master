// ---------- ground: the painted map (sidewalks, streets, crosswalks, parks, beaches), the lake shore, the river's real course, bridges, the pier, The 606, trees ----------
await stage('ground');
const PX=4096/Math.max(B.w,B.d),GW=Math.round(B.w*PX),GD=Math.round(B.d*PX),pxX=v=>(v-B.x0)*PX,pxZ=v=>(v-B.z0)*PX;
const gcv=document.createElement('canvas');gcv.width=GW;gcv.height=GD;const g2=gcv.getContext('2d');
const polyPath=(pts,close)=>{g2.beginPath();pts.forEach(([x,z],i)=>i?g2.lineTo(pxX(x),pxZ(z)):g2.moveTo(pxX(x),pxZ(z)));if(close)g2.closePath();};
const strokePath=(pts,w,col,cap)=>{g2.strokeStyle=col;g2.lineWidth=Math.max(1,w*PX);g2.lineCap=cap||'round';g2.lineJoin='round';polyPath(pts,false);g2.stroke();};
const fillRectM=(x0,z0,w,d,col)=>{g2.fillStyle=col;g2.fillRect(pxX(x0),pxZ(z0),w*PX,d*PX);};
const WATER='#2f6690';
function paintWater(){g2.fillStyle=WATER;polyPath(LAKE_POLY,true);g2.fill();for(const r of RIVERS)strokePath(r.pts,r.width,WATER);}
section('ground',()=>{
  g2.fillStyle='#4f5a44';g2.fillRect(0,0,GW,GD);   // yards and lawns of the low city (downtown is paved over by its buildings)
  // sidewalks first (a pale band either side), then the asphalt over them
  for(const s of STREETS)strokePath([s.a,s.b],s.w+(s.major?10:7),'#a7a399','butt');
  for(const s of STREETS)if(!s.major)strokePath([s.a,s.b],s.w,'#4b4c50','butt');
  for(const p of PARKS){g2.fillStyle='#5f8a48';if(p.pts){polyPath(p.pts,true);g2.fill();}else g2.fillRect(pxX(p.x0),pxZ(p.z0),(p.x1-p.x0)*PX,(p.z1-p.z0)*PX);
    const R=mkRng(Math.round(p.x0*7+p.z0));g2.fillStyle='rgba(30,70,30,0.35)';for(let k=0;k<(p.x1-p.x0)*(p.z1-p.z0)/900;k++){const x=p.x0+R()*(p.x1-p.x0),z=p.z0+R()*(p.z1-p.z0);if(p.pts&&!inPoly(x,z,p.pts))continue;g2.beginPath();g2.arc(pxX(x),pxZ(z),1.5+R()*3,0,7);g2.fill();}
    // a path round the edge and one across
    g2.strokeStyle='rgba(214,204,178,0.8)';g2.lineWidth=Math.max(1,3*PX);if(p.pts){polyPath(p.pts,true);g2.stroke();}else{g2.strokeRect(pxX(p.x0+6),pxZ(p.z0+6),(p.x1-p.x0-12)*PX,(p.z1-p.z0-12)*PX);g2.beginPath();g2.moveTo(pxX(p.x0),pxZ(p.z0));g2.lineTo(pxX(p.x1),pxZ(p.z1));g2.stroke();}}
  for(const b of BEACHES)strokePath(b.pts,b.w*2,'#dccda4');
  for(const s of STREETS)if(s.major)strokePath([s.a,s.b],s.w,'#35373b','butt');
  g2.setLineDash([12*PX*4,12*PX*4]);for(const s of STREETS)if(s.major)strokePath([s.a,s.b],0.4,'rgba(210,180,80,0.22)','butt');g2.setLineDash([]);
  // crosswalks: zebra bars across each approach where two major streets meet
  const majors=STREETS.filter(s=>s.major&&s.axis!=='d');let nx=0;
  for(const a of majors)if(a.axis==='x')for(const b of majors)if(b.axis==='z'){const x=a.at,z=b.at;if(z<Math.min(a.a[1],a.b[1])||z>Math.max(a.a[1],a.b[1])||x<Math.min(b.a[0],b.b[0])||x>Math.max(b.a[0],b.b[0])||!inMap(x,z,40)||inWater(x,z))continue;nx++;
    g2.fillStyle='rgba(235,232,220,0.85)';for(const sd of [-1,1]){const zc=z+sd*(b.w/2+3),xc=x+sd*(a.w/2+3);
      for(let k=-a.w/2+1;k<a.w/2;k+=2.6)g2.fillRect(pxX(x+k),pxZ(zc-2),Math.max(1,1.3*PX),4*PX);
      for(let k=-b.w/2+1;k<b.w/2;k+=2.6)g2.fillRect(pxX(xc-2),pxZ(z+k),4*PX,Math.max(1,1.3*PX));}}
  ctx.crossings=nx;
  fillRectM(PIER.x0-40,PIER.z-PIER.width/2,PIER.length+40,PIER.width,'#a19b90');
  for(const r of RIVERS)strokePath(r.pts,r.width+12,'#c9c2b4');   // the river walls: a pale edge along both banks
  paintWater();   // the lake and the river win over anything painted across them
  fillRectM(PIER.x0,PIER.z-PIER.width/2,PIER.length,PIER.width,'#a19b90');
});
const groundTex=new THREE.CanvasTexture(gcv);groundTex.anisotropy=8;
const ground=new THREE.Mesh(new THREE.PlaneGeometry(B.w,B.d),new THREE.MeshLambertMaterial({map:groundTex}));ground.rotation.x=-Math.PI/2;ground.position.set(B.cx,0,B.cz);ground.receiveShadow=true;ground.userData.noShadow=true;scene.add(ground);
// water surfaces: the lake as its real outline, each river as a ribbon that follows its bends
const waterM=new THREE.MeshPhongMaterial({color:0x2c6390,specular:0x9fc4e0,shininess:90,transparent:true,opacity:0.92});
{const shape=new THREE.Shape();LAKE_POLY.forEach(([x,z],i)=>{const cx=Math.max(B.x0,Math.min(B.x1+1500,x)),cz=Math.max(B.z0-1500,Math.min(B.z1+1500,z));i?shape.lineTo(cx,-cz):shape.moveTo(cx,-cz);});   // shape is in x,y; rotated flat, y becomes -z
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
  for(const s of STREETS)for(const r of RIVERS)for(let i=0;i+1<r.pts.length;i++){const h=segHit(s.a,s.b,r.pts[i],r.pts[i+1]);if(!h||!inMap(h.x,h.z,30))continue;
    const rl=Math.hypot(...h.r),sl=Math.hypot(...h.s),sin=Math.abs(h.r[0]*h.s[1]-h.r[1]*h.s[0])/(rl*sl);if(sin<0.45)continue;   // a street running along the bank is not a crossing
    if(bridges.some(b=>Math.hypot(b.x-h.x,b.z-h.z)<25))continue;
    bridge(h.x,h.z,Math.atan2(h.r[1],h.r[0]),s.w+2,r.width/sin+18);}
  ctx.details=Object.assign(ctx.details||{},{bridges:bridges.length});});
function onBridge(x,z){for(const b of bridges){const dx=x-b.x,dz=z-b.z,c=Math.cos(b.ang),s=Math.sin(b.ang),u=dx*c+dz*s,v=-dx*s+dz*c;if(Math.abs(u)<=b.len/2&&Math.abs(v)<=b.w/2)return true;}return false;}
// The 606: the old Bloomingdale rail embankment, a raised trail with railings and its own trees
const TRAIL_INFO=[];
section('trails',()=>{const pathM=new THREE.MeshLambertMaterial({color:0x5a5a5e}),wallM=new THREE.MeshLambertMaterial({color:0x9a8e7e});
  for(const t of TRAILS)for(let i=0;i+1<t.pts.length;i++){const [ax,az]=t.pts[i],[bx,bz]=t.pts[i+1],len=Math.hypot(bx-ax,bz-az),ang=Math.atan2(bz-az,bx-ax),g=new THREE.Group();g.position.set((ax+bx)/2,0,(az+bz)/2);g.rotation.y=-ang;
    const body=new THREE.Mesh(new THREE.BoxGeometry(len,t.height,t.width),wallM);body.position.y=t.height/2;body.castShadow=body.receiveShadow=true;g.add(body);
    const path=new THREE.Mesh(new THREE.BoxGeometry(len,0.2,t.width*0.35),pathM);path.position.y=t.height+0.1;g.add(path);
    for(const s of [-1,1]){const rail=new THREE.Mesh(new THREE.BoxGeometry(len,1.1,0.2),steelM);rail.position.set(0,t.height+0.55,s*(t.width/2-0.1));g.add(rail);}
    g.userData.info={name:t.name,info:t.info};TRAIL_INFO.push(g);scene.add(g);}
  ctx.details=Object.assign(ctx.details||{},{trails:TRAILS.length});});
// trees: parks, Michigan Avenue, The 606, and the parkway trees that line Chicago's residential streets
const PARK_FEATURES=C.landmarks.map(l=>{const [x,z]=P(l.at);return [x,z,Math.max(l.w||20,l.d||0)*0.6+(l.gap||0)*0.6+(l.kind==='pavilion'?110:l.kind==='fieldhouse'||l.kind==='pool'?18:25)];});   // plazas, lawns and fountains stay open
section('trees',()=>{const trunkM=new THREE.MeshLambertMaterial({color:0x5a4030}),leafM=new THREE.MeshLambertMaterial({color:0x3f7a3a}),leaf2M=new THREE.MeshLambertMaterial({color:0x4f8a3a});
  const spots=[],street=[];
  for(const p of PARKS){const R=mkRng(Math.round(p.x1*3+p.z1));const n=Math.floor((p.x1-p.x0)*(p.z1-p.z0)/1300);
    for(let k=0;k<n;k++){const x=p.x0+6+R()*(p.x1-p.x0-12),z=p.z0+6+R()*(p.z1-p.z0-12);if(p.pts&&!inPoly(x,z,p.pts))continue;if(!streetAt(x,z)&&!inWater(x,z)&&!PARK_FEATURES.some(f=>Math.hypot(f[0]-x,f[1]-z)<f[2]))spots.push([x,z,7+R()*7]);}}
  const mich=lonX(-87.6245);for(let z=latZ(41.9008);z<=latZ(41.8674);z+=24)for(const s of [-1,1]){const x=mich+s*22;if(!inWater(x,z)&&!parkAt(x,z))spots.push([x,z,7]);}
  for(const t of TRAILS)for(let i=0;i+1<t.pts.length;i++){const [ax,az]=t.pts[i],[bx,bz]=t.pts[i+1],L=Math.hypot(bx-ax,bz-az);for(let s=10;s<L;s+=18)for(const sd of [-1,1]){const u=s/L,nx=-(bz-az)/L,nz=(bx-ax)/L;spots.push([ax+(bx-ax)*u+nx*sd*4,az+(bz-az)*u+nz*sd*4,5+((s*7)%3),t.height]);}}
  // parkway trees: every 14 m along both sides of the low-rise streets, skipping corners, water and the tall districts
  const R=mkRng(606);for(const s of STREETS){if(s.major||s.axis==='d')continue;const L=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]),dx=(s.b[0]-s.a[0])/L,dz=(s.b[1]-s.a[1])/L;
    for(let u=7;u<L;u+=14)for(const sd of [-1,1]){const x=s.a[0]+dx*u-dz*sd*(s.w/2+2.5),z=s.a[1]+dz*u+dx*sd*(s.w/2+2.5);if(R()<0.22)continue;const d=districtAt(x,z);if(d.tall>30||!inMap(x,z,30)||inWater(x,z)||parkAt(x,z))continue;
      if(STREETS.some(o=>o!==s&&o.axis!==s.axis&&segDist(x,z,o.a[0],o.a[1],o.b[0],o.b[1])<o.w/2+9))continue;street.push([x,z,6+R()*6]);}}
  const put=(list,kind)=>{const n=list.length;const tr=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.35,0.55,1,5),trunkM,n),lf=new THREE.InstancedMesh(kind?new THREE.IcosahedronGeometry(1,0):new THREE.SphereGeometry(1,7,5),kind?leaf2M:leafM,n),d=new THREE.Object3D();
    list.forEach(([x,z,h,y0],i)=>{y0=y0||0;d.position.set(x,y0+h*0.25,z);d.scale.set(1,h*0.5,1);d.updateMatrix();tr.setMatrixAt(i,d.matrix);d.position.set(x,y0+h*0.72,z);d.scale.set(h*0.4,h*0.36,h*0.4);d.updateMatrix();lf.setMatrixAt(i,d.matrix);});
    tr.castShadow=lf.castShadow=true;tr.frustumCulled=lf.frustumCulled=false;scene.add(tr,lf);return [tr,lf];};
  put(spots,0);put(street,1);ctx.trees=spots.length+street.length;});
