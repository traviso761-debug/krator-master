// ---------- landmarks: the buildings themselves come from OpenStreetMap; here are what the map does not carry:
// the antennas, spires, cupolas and crowns that stand on their roofs, the fountains and cable-stayed bridges that
// more than one city has, the stadium bowls, and the cards. What only one city has is not here: Cloud Gate, the
// Citadel, Barad-dur, One World Trade and the rest live with their own page (src/<city>/landmarks.js) and arrive
// as ctx.models, because no other city should have to carry them ----------
await stage('landmarks');
const LANDMARKS=[];   // clickable objects, userData.info = {name, info}
const CARDS=[];       // every landmark position, for cards on clicked OSM buildings
const chromeM=new THREE.MeshPhongMaterial({color:0xdde4ea,specular:0xffffff,shininess:120});
const whiteM=new THREE.MeshLambertMaterial({color:0xf0ede6}),redM=new THREE.MeshLambertMaterial({color:0xb01e24,emissive:0x000000}),greenM=new THREE.MeshLambertMaterial({color:0x2f5a3a});
function gh(x,z){return groundH(x,z);}
function box(x,y,z,w,h,d,m){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d).translate(0,h/2,0),m);b.position.set(x,y,z);return b;}
function group(L,parts){const g=new THREE.Group();for(const p of parts){p.castShadow=p.receiveShadow=true;p.userData.info=L;g.add(p);}g.userData.info=L;LANDMARKS.push(g);scene.add(g);return g;}
const poi=name=>POIS.find(p=>p.name.toLowerCase()===name.toLowerCase())||POIS.find(p=>p.name.toLowerCase().includes(name.toLowerCase()));
const areaNamed=(re,x,z)=>AREAS.filter(a=>re.test(a.name)).sort((p,q)=>Math.hypot((p.bb.x0+p.bb.x1)/2-x,(p.bb.z0+p.bb.z1)/2-z)-Math.hypot((q.bb.x0+q.bb.x1)/2-x,(q.bb.z0+q.bb.z1)/2-z))[0];   // the nearest area with that name
// merge a pile of static meshes into one buffer per material: the Citadel is ~250 boxes and three materials
function mergeParts(meshes,mat){const pos=[],nor=[],nm=new THREE.Matrix3(),v=new THREE.Vector3(),vn=new THREE.Vector3();
  for(const m of meshes){m.updateMatrix();const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry;
    const p=g.attributes.position,n=g.attributes.normal;nm.getNormalMatrix(m.matrix);
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrix);pos.push(v.x,v.y,v.z);
      vn.fromBufferAttribute(n,i).applyNormalMatrix(nm).normalize();nor.push(vn.x,vn.y,vn.z);}
    if(g!==m.geometry)g.dispose();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.computeBoundingSphere();return new THREE.Mesh(g,mat);}
const DECOR={
  mast(L,x,z,[dx,dz,len]){const top=roofAt(x+dx,z+dz);return [box(x+dx,top,z+dz,1.6,len,1.6,steelM),box(x+dx,top+len*0.6,z+dz,0.9,len*0.4,0.9,whiteM)];},
  spire(L,x,z,[dx,dz,len]){const top=roofAt(x+dx,z+dz);const s=new THREE.Mesh(new THREE.CylinderGeometry(0.3,1.8,len,8).translate(0,len/2,0),chromeM);s.position.set(x+dx,top,z+dz);return [s];},
  statue(L,x,z,[dx,dz,len]){const top=roofAt(x+dx,z+dz);const s=new THREE.Mesh(new THREE.CylinderGeometry(0.8,1.2,len,8).translate(0,len/2,0),new THREE.MeshLambertMaterial({color:0x6a7a70}));s.position.set(x+dx,top,z+dz);return [s];},
  crown(L,x,z,[dx,dz,len]){const top=roofAt(x+dx,z+dz),m=new THREE.MeshLambertMaterial({color:0xe8f0ff,emissive:0x8fb4e0,emissiveIntensity:0.2,transparent:true,opacity:0.85});
    const c=new THREE.Mesh(new THREE.CylinderGeometry(12,14,len,24).translate(0,len/2,0),m);c.position.set(x+dx,Math.max(0,top-len),z+dz);animHooks.push(()=>{m.emissiveIntensity=0.2+1.2*nightF(hourCur);});return [c];},
  floodlit(L,x,z){return [];},
  cupola(L,x,z,[dx,dz,len]){const top=roofAt(x+dx,z+dz),m=new THREE.MeshLambertMaterial({color:0xe8e2d4}),out=[];const drum=new THREE.Mesh(new THREE.CylinderGeometry(3,3.2,len*0.6,8).translate(0,len*0.3,0),m);drum.position.set(x+dx,top,z+dz);
    const cap=new THREE.Mesh(new THREE.ConeGeometry(3.4,len*0.4,8).translate(0,len*0.2,0),new THREE.MeshLambertMaterial({color:0x5a6a62}));cap.position.set(x+dx,top+len*0.6,z+dz);out.push(drum,cap);return out;},
  clocktower(L,x,z,[dx,dz,len]){const m=new THREE.MeshLambertMaterial({color:0xb89070}),out=[box(x+dx,0,z+dz,7,len,7,m)];const face=new THREE.MeshLambertMaterial({color:0xf0ead8,emissive:0x000000});
    for(const [ox,oz] of [[0,3.6],[0,-3.6],[3.6,0],[-3.6,0]]){const f=box(x+dx+ox,len-8,z+dz+oz,ox?0.2:3.4,3.4,oz?0.2:3.4,face);out.push(f);}
    const cap=new THREE.Mesh(new THREE.ConeGeometry(5.4,6,4).translate(0,3,0),new THREE.MeshLambertMaterial({color:0x5a3a2a}));cap.rotation.y=Math.PI/4;cap.position.set(x+dx,len,z+dz);out.push(cap);
    const neon=box(x+dx,len-14,z+dz+3.7,6,1.2,0.2,new THREE.MeshBasicMaterial({color:0xff4020}));out.push(neon);animHooks.push(()=>{const w=nightF(hourCur);face.emissive.setRGB(w*0.9,w*0.85,w*0.6);neon.visible=w>0.3;});return out;},
  towers(L,x,z,[dx,dz,len]){const m=new THREE.MeshLambertMaterial({color:0xb89a78}),roof=new THREE.MeshLambertMaterial({color:0x5a6a62}),out=[];
    for(const s of [-1,1]){const tx=x+dx+s*9,tz=z+dz;out.push(box(tx,0,tz,7,len*0.8,7,m));const cap=new THREE.Mesh(new THREE.ConeGeometry(3.2,len*0.2,8).translate(0,len*0.1,0),roof);cap.position.set(tx,len*0.8,tz);out.push(cap);}return out;},
  dome(L,x,z,[dx,dz,len]){const d=new THREE.Mesh(new THREE.SphereGeometry(10,24,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0x5f9a84}));d.scale.y=1.3;d.position.set(x+dx,Math.max(roofAt(x+dx,z+dz),len-13),z+dz);return [d];},
};
const MODELS={
  fountain(L,x,z){const p=poi(L.name)||poi('Buckingham');if(p&&L.w>40){x=p.x;z=p.z;}const parts=[],w=L.w||40,g0=gh(x,z);
    const waterTop=new THREE.MeshPhongMaterial({color:0x3a7aa8,specular:0xffffff,shininess:100});
    for(let k=0;k<3;k++){const r=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,32).translate(0,0.5,0),stoneM);r.position.set(x,g0+k*w*0.03,z);r.scale.set(w/2*(1-k*0.3),w*0.03,w/2*(1-k*0.3));parts.push(r);
      const pool=new THREE.Mesh(new THREE.CylinderGeometry(1,1,0.1,32),waterTop);pool.position.set(x,g0+k*w*0.03+w*0.03+0.05,z);pool.scale.set(w/2*(1-k*0.3)-1,1,w/2*(1-k*0.3)-1);parts.push(pool);}
    const jetM=new THREE.MeshLambertMaterial({color:0xe8f4ff,transparent:true,opacity:0.55});const jet=new THREE.Mesh(new THREE.CylinderGeometry(0.4,w*0.03,1,10).translate(0,0.5,0),jetM);jet.position.set(x,g0+w*0.09,z);parts.push(jet);
    const g=group(L,parts);animHooks.push(now=>{const on=(now/1000)%60<30;jet.scale.y=(on?w*0.5:w*0.12)*(0.9+0.1*Math.sin(now*0.004));});return g;},
  cablestay(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const H=L.towerH||55,m=new THREE.MeshLambertMaterial({color:0xe8e8e4}),cab=new THREE.LineBasicMaterial({color:0xd0d0d0}),parts=[];
    for(const sd of [-1,1]){const tx=c.x+c.ux*sd*c.half*0.4,tz=c.z+c.uz*sd*c.half*0.4;parts.push(box(tx,0,tz,3,c.y+H,3,m));
      const pts=[];for(let k=1;k<=10;k++)for(const dir of [-1,1])for(const ss of [-1,1]){const d=k*c.half*0.055;pts.push(new THREE.Vector3(tx,c.y+H-k*1.5,tz),new THREE.Vector3(tx+c.ux*dir*d-c.uz*ss*(c.w/2),c.y,tz+c.uz*dir*d+c.ux*ss*(c.w/2)));}
      parts.push(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),cab));}
    return group(L,parts);},
};
// where a named bridge road crosses water: centre, direction along the bridge, half length over the water, road width
function riverCrossing(name,x,z){const rs=ROADS.filter(r=>r.name.toLowerCase().startsWith(name.toLowerCase())&&r.c!=='trail');const wet=[];let w=14,dir=null;
  for(const r of rs)for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L2=Math.hypot(bx-ax,bz-az);for(let u=0;u<=L2;u+=6){const px=ax+(bx-ax)*u/L2,pz=az+(bz-az)*u/L2;if(inWater(px,pz)){wet.push([px,pz]);w=Math.max(w,r.w);if(!dir)dir=[(bx-ax)/L2,(bz-az)/L2];}}}
  if(wet.length<3||!dir)return null;const cx=wet.reduce((s,p)=>s+p[0],0)/wet.length,cz=wet.reduce((s,p)=>s+p[1],0)/wet.length;let half=0;for(const [px,pz] of wet)half=Math.max(half,Math.abs((px-cx)*dir[0]+(pz-cz)*dir[1]));
  return {x:cx,z:cz,ux:dir[0],uz:dir[1],half,w:Math.min(w,30),y:Math.max(0,...rs.map(r=>r.deck||0))};}
// stadium bowls: the outer wall, then stands sloping down towards the field (the outline shrunk towards its centre)
function stadiumBowl(L,x,z){const a=AREAS.filter(q=>q.kind==='stadium').sort((p,q)=>Math.hypot((p.bb.x0+p.bb.x1)/2-x,(p.bb.z0+p.bb.z1)/2-z)-Math.hypot((q.bb.x0+q.bb.x1)/2-x,(q.bb.z0+q.bb.z1)/2-z))[0];
  if(!a||Math.hypot((a.bb.x0+a.bb.x1)/2-x,(a.bb.z0+a.bb.z1)/2-z)>250)return null;
  const ring=a.o,cx=ring.reduce((s,p)=>s+p[0],0)/ring.length,cz=ring.reduce((s,p)=>s+p[1],0)/ring.length,g0=groundMin(ring),H=g0+(/Soldier/i.test(L.name)?32:22),inner=ring.map(([px,pz])=>[cx+(px-cx)*0.7,cz+(pz-cz)*0.7]);
  const pos=[],idx=[],push=(p,y)=>{pos.push(p[0],y,p[1]);return pos.length/3-1;};
  for(let i=0;i<ring.length;i++){const j=(i+1)%ring.length,a0=push(ring[i],g0),a1=push(ring[j],g0),b0=push(ring[i],H),b1=push(ring[j],H),c0=push(inner[i],g0+3),c1=push(inner[j],g0+3);
    idx.push(a0,b0,b1,a0,b1,a1, b0,c0,c1,b0,c1,b1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:/Wrigley/i.test(L.name)?0x7a8a90:0xb8b4ac,side:THREE.DoubleSide}));return group(L,[m]);}
// The table above is what more than one city uses. A page brings the rest: every entry in ctx.models is a
// function, handed the engine's API, that returns models of exactly the same shape - and from here they are
// indistinguishable from the built-in ones.
Object.assign(API,{box,group,gh,poi,areaNamed,mergeParts,riverCrossing,stadiumBowl,LANDMARKS,CARDS,chromeM,whiteM,redM,greenM});
for(const mk of (ctx.models||[]))section('models',()=>Object.assign(MODELS,mk(API)));
section('landmarks',()=>{
  for(const L of C.landmarks){let [x,z]=P(L.at);CARDS.push({L,x,z});
    try{if(L.stadium)stadiumBowl(L,x,z);
      if(L.model&&MODELS[L.model])MODELS[L.model](L,x,z);
      if(L.decor)group(L,L.decor.flatMap(d=>DECOR[d[0]]?DECOR[d[0]](L,x,z,d.slice(1)):[]));}
    catch(e){report('landmark '+L.name,e);}}
  // aircraft warning beacons on the tallest roofs
  const beacons=[];for(const {L,x,z} of CARDS){const h=roofAt(x,z);if(h>250){const b=new THREE.Mesh(new THREE.SphereGeometry(2,8,6),new THREE.MeshBasicMaterial({color:0xff2020}));b.position.set(x,h+((L.decor||[]).reduce((m,d)=>Math.max(m,d[3]||0),0))+2,z);scene.add(b);beacons.push(b);}}
  animHooks.push(now=>{const on=(now%1600)<800;for(const b of beacons)b.visible=on;});
  ctx.details=Object.assign(ctx.details||{},{landmarks:C.landmarks.length,beacons:beacons.length});
});
