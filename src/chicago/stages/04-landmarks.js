// ---------- landmarks: the buildings themselves come from OpenStreetMap; here are what the map does not carry:
// antennas and spires on their roofs, Cloud Gate, the Pritzker Pavilion's ribbons and trellis, fountains, the Centennial Wheel,
// stadium bowls (Wrigley Field with its marquee and scoreboard, Soldier Field), and the cards ----------
await stage('landmarks');
const LANDMARKS=[];   // clickable objects, userData.info = {name, info}
const CARDS=[];       // every landmark position, for cards on clicked OSM buildings
const chromeM=new THREE.MeshPhongMaterial({color:0xdde4ea,specular:0xffffff,shininess:120});
const whiteM=new THREE.MeshLambertMaterial({color:0xf0ede6}),redM=new THREE.MeshLambertMaterial({color:0xb01e24,emissive:0x000000}),greenM=new THREE.MeshLambertMaterial({color:0x2f5a3a});
function box(x,y,z,w,h,d,m){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d).translate(0,h/2,0),m);b.position.set(x,y,z);return b;}
function group(L,parts){const g=new THREE.Group();for(const p of parts){p.castShadow=p.receiveShadow=true;p.userData.info=L;g.add(p);}g.userData.info=L;LANDMARKS.push(g);scene.add(g);return g;}
const poi=name=>POIS.find(p=>p.name.toLowerCase()===name.toLowerCase())||POIS.find(p=>p.name.toLowerCase().includes(name.toLowerCase()));
const areaNamed=(re,x,z)=>AREAS.filter(a=>re.test(a.name)).sort((p,q)=>Math.hypot((p.bb.x0+p.bb.x1)/2-x,(p.bb.z0+p.bb.z1)/2-z)-Math.hypot((q.bb.x0+q.bb.x1)/2-x,(q.bb.z0+q.bb.z1)/2-z))[0];   // the nearest area with that name
const DECOR={
  mast(L,x,z,[dx,dz,len]){const top=roofAt(x+dx,z+dz);return [box(x+dx,top,z+dz,1.6,len,1.6,steelM),box(x+dx,top+len*0.6,z+dz,0.9,len*0.4,0.9,whiteM)];},
  spire(L,x,z,[dx,dz,len]){const top=roofAt(x+dx,z+dz);const s=new THREE.Mesh(new THREE.CylinderGeometry(0.3,1.8,len,8).translate(0,len/2,0),chromeM);s.position.set(x+dx,top,z+dz);return [s];},
  statue(L,x,z,[dx,dz,len]){const top=roofAt(x+dx,z+dz);const s=new THREE.Mesh(new THREE.CylinderGeometry(0.8,1.2,len,8).translate(0,len/2,0),new THREE.MeshLambertMaterial({color:0x6a7a70}));s.position.set(x+dx,top,z+dz);return [s];},
  crown(L,x,z,[dx,dz,len]){const top=roofAt(x+dx,z+dz),m=new THREE.MeshLambertMaterial({color:0xe8f0ff,emissive:0x8fb4e0,emissiveIntensity:0.2,transparent:true,opacity:0.85});
    const c=new THREE.Mesh(new THREE.CylinderGeometry(12,14,len,24).translate(0,len/2,0),m);c.position.set(x+dx,Math.max(0,top-len),z+dz);animHooks.push(()=>{m.emissiveIntensity=0.2+1.2*nightF(hourCur);});return [c];},
  floodlit(L,x,z){return [];},
  towers(L,x,z,[dx,dz,len]){const m=new THREE.MeshLambertMaterial({color:0xb89a78}),roof=new THREE.MeshLambertMaterial({color:0x5a6a62}),out=[];
    for(const s of [-1,1]){const tx=x+dx+s*9,tz=z+dz;out.push(box(tx,0,tz,7,len*0.8,7,m));const cap=new THREE.Mesh(new THREE.ConeGeometry(3.2,len*0.2,8).translate(0,len*0.1,0),roof);cap.position.set(tx,len*0.8,tz);out.push(cap);}return out;},
  dome(L,x,z,[dx,dz,len]){const d=new THREE.Mesh(new THREE.SphereGeometry(10,24,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0x5f9a84}));d.scale.y=1.3;d.position.set(x+dx,Math.max(roofAt(x+dx,z+dz),len-13),z+dz);return [d];},
};
const MODELS={
  bean(L,x,z){   // Cloud Gate: a mirrored bean on AT&T Plaza, raised on its two ends over the arch, aligned with its mapped outline
    const p=poi('Cloud Gate'),ang=p?p.ang:0;if(p){x=p.x;z=p.z;}
    const g=new THREE.SphereGeometry(1,64,36),v=g.attributes.position;
    for(let k=0;k<v.count;k++){let px=v.getX(k),py=v.getY(k),pz=v.getZ(k);if(py<0)py*=0.55;px*=1+0.12*Math.max(0,py);const arch=Math.max(0,1-Math.abs(px)/0.55);if(py<0)py+=arch*arch*0.62*(-py+0.2)*1.2;v.setXYZ(k,px,py,pz);}
    g.computeVertexNormals();
    const rt=new THREE.WebGLCubeRenderTarget(256,{format:THREE.RGBFormat,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});const cube=new THREE.CubeCamera(1,3000,rt);cube.position.set(x,6,z);scene.add(cube);
    const beanM=new THREE.MeshPhongMaterial({color:0xdfe4ea,specular:0xffffff,shininess:220,envMap:rt.texture,combine:THREE.MixOperation,reflectivity:0.92});
    const b=new THREE.Mesh(g,beanM);b.position.set(x,L.h*0.5,z);b.scale.set(L.w/2,L.h*0.5,L.d/2);b.rotation.y=-ang;
    const grp=group(L,[b]);let lastR=-1e9;animHooks.push(now=>{if(now-lastR<2500||camera.position.distanceTo(b.position)>700)return;lastR=now;b.visible=false;cube.update(renderer,scene);b.visible=true;});return grp;},
  pavilion(L,x,z){   // Pritzker: steel ribbons over the stage house (the stage itself is the OSM building), the trellis over the Great Lawn east of it
    const parts=[],top=Math.max(roofAt(x,z),18);
    for(let k=0;k<9;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(10+k*1.6,0.35,3,18,Math.PI*(0.7+0.05*k)),chromeM);r.position.set(x-4-k*0.8,top+k*1.6,z+(k-4)*3.2);r.rotation.set(0.3*(k%3-1),Math.PI/2+0.25*(k-4),0.6+0.1*k);r.scale.set(1,1.4,3);parts.push(r);}
    const lawn=areaNamed(/Great Lawn/i,x,z)||areaNamed(/Pritzker/i,x,z);let lx0=x+20,lx1=x+130,lz0=z-55,lz1=z+55;if(lawn){lx0=lawn.bb.x0;lx1=lawn.bb.x1;lz0=lawn.bb.z0;lz1=lawn.bb.z1;}
    for(let k=0;k<=6;k++){const ax=lx0+(lx1-lx0)*k/6,arc=new THREE.Mesh(new THREE.TorusGeometry((lz1-lz0)/2,0.4,3,24,Math.PI),steelM);arc.position.set(ax,0,(lz0+lz1)/2);arc.rotation.y=Math.PI/2;arc.scale.set(1,0.42,1);parts.push(arc);}
    for(let k=-3;k<=3;k++)parts.push(box((lx0+lx1)/2,(lz1-lz0)/2*0.42*Math.cos(k/3.4*Math.PI/2)-0.3,(lz0+lz1)/2+k*(lz1-lz0)/7.2,lx1-lx0,0.5,0.5,steelM));
    return group(L,parts);},
  fountain(L,x,z){const p=poi(L.name)||poi('Buckingham');if(p&&L.w>40){x=p.x;z=p.z;}const parts=[],w=L.w||40;
    const waterTop=new THREE.MeshPhongMaterial({color:0x3a7aa8,specular:0xffffff,shininess:100});
    for(let k=0;k<3;k++){const r=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,32).translate(0,0.5,0),stoneM);r.position.set(x,k*w*0.03,z);r.scale.set(w/2*(1-k*0.3),w*0.03,w/2*(1-k*0.3));parts.push(r);
      const pool=new THREE.Mesh(new THREE.CylinderGeometry(1,1,0.1,32),waterTop);pool.position.set(x,k*w*0.03+w*0.03+0.05,z);pool.scale.set(w/2*(1-k*0.3)-1,1,w/2*(1-k*0.3)-1);parts.push(pool);}
    const jetM=new THREE.MeshLambertMaterial({color:0xe8f4ff,transparent:true,opacity:0.55});const jet=new THREE.Mesh(new THREE.CylinderGeometry(0.4,w*0.03,1,10).translate(0,0.5,0),jetM);jet.position.set(x,w*0.09,z);parts.push(jet);
    const g=group(L,parts);animHooks.push(now=>{const on=(now/1000)%60<30;jet.scale.y=(on?w*0.5:w*0.12)*(0.9+0.1*Math.sin(now*0.004));});return g;},
  wheel(L,x,z){const p=poi('Centennial Wheel');if(p){x=p.x;z=p.z;}const R=L.r||30,parts=[],wheel=new THREE.Group();
    wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R,0.8,6,64),steelM));for(let k=0;k<21;k++){const a=k/21*Math.PI*2,sp=new THREE.Mesh(new THREE.BoxGeometry(0.4,R*2,0.4),steelM);sp.rotation.z=a;wheel.add(sp);
      const car=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.4,2.4),new THREE.MeshLambertMaterial({color:0xe8f0ff}));car.position.set(Math.cos(a)*R,Math.sin(a)*R,0);wheel.add(car);}
    wheel.position.set(x,R+4,z);parts.push(wheel);for(const s of [-1,1]){const leg=box(x+s*6,2,z,1.6,R+4,1.6,steelM);leg.rotation.z=-s*0.18;parts.push(leg);}
    const g=group(L,parts);animHooks.push(now=>{wheel.rotation.z=now*0.00009;});return g;},
  wrigley(L,x,z){   // the red marquee at Clark and Addison, the hand-turned scoreboard over the centre-field bleachers, light towers; ivy on the outfield wall
    const parts=[],field=AREAS.find(a=>a.kind==='pitch'&&Math.hypot((a.bb.x0+a.bb.x1)/2-x,(a.bb.z0+a.bb.z1)/2-z)<150);
    const [mx,mz]=P(L.marquee||[41.94736,-87.65641]);parts.push(box(mx,6,mz,0.6,4,11,redM),box(mx,0,mz-4,0.5,6,0.5,steelM),box(mx,0,mz+4,0.5,6,0.5,steelM));
    const [sx,sz]=P(L.scoreboard||[41.94886,-87.65461]);parts.push(box(sx,12,sz,24,11,3,greenM),box(sx,23,sz,3,5,2,greenM));
    const [cxx,czz]=field?[(field.bb.x0+field.bb.x1)/2,(field.bb.z0+field.bb.z1)/2]:[x,z];
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2+0.3,lx=cxx+Math.cos(a)*120,lz=czz+Math.sin(a)*105;parts.push(box(lx,0,lz,1.2,40,1.2,steelM),box(lx,40,lz,6,3,1,whiteM));}
    const g=group(L,parts);animHooks.push(()=>{const w=nightF(hourCur);redM.emissive.setRGB(0.3+0.5*w,0.02,0.02);});return g;},
};
// stadium bowls: the outer wall, then stands sloping down towards the field (the outline shrunk towards its centre)
function stadiumBowl(L,x,z){const a=AREAS.filter(q=>q.kind==='stadium').sort((p,q)=>Math.hypot((p.bb.x0+p.bb.x1)/2-x,(p.bb.z0+p.bb.z1)/2-z)-Math.hypot((q.bb.x0+q.bb.x1)/2-x,(q.bb.z0+q.bb.z1)/2-z))[0];
  if(!a||Math.hypot((a.bb.x0+a.bb.x1)/2-x,(a.bb.z0+a.bb.z1)/2-z)>250)return null;
  const ring=a.o,cx=ring.reduce((s,p)=>s+p[0],0)/ring.length,cz=ring.reduce((s,p)=>s+p[1],0)/ring.length,H=/Soldier/i.test(L.name)?32:22,inner=ring.map(([px,pz])=>[cx+(px-cx)*0.7,cz+(pz-cz)*0.7]);
  const pos=[],idx=[],push=(p,y)=>{pos.push(p[0],y,p[1]);return pos.length/3-1;};
  for(let i=0;i<ring.length;i++){const j=(i+1)%ring.length,a0=push(ring[i],0),a1=push(ring[j],0),b0=push(ring[i],H),b1=push(ring[j],H),c0=push(inner[i],3),c1=push(inner[j],3);
    idx.push(a0,b0,b1,a0,b1,a1, b0,c0,c1,b0,c1,b1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:/Wrigley/i.test(L.name)?0x7a8a90:0xb8b4ac,side:THREE.DoubleSide}));return group(L,[m]);}
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
