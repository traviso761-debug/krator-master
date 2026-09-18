// ---------- landmarks: the buildings themselves come from OpenStreetMap; here are what the map does not carry:
// antennas and spires on their roofs, Cloud Gate, the Pritzker Pavilion's ribbons and trellis, fountains, the Centennial Wheel,
// stadium bowls (Wrigley Field with its marquee and scoreboard, Soldier Field), and the cards ----------
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
  bean(L,x,z){   // Cloud Gate: a mirrored bean on AT&T Plaza, raised on its two ends over the arch, aligned with its mapped outline
    const p=poi('Cloud Gate'),ang=p?p.ang:0;if(p){x=p.x;z=p.z;}
    const g=new THREE.SphereGeometry(1,64,36),v=g.attributes.position;
    for(let k=0;k<v.count;k++){let px=v.getX(k),py=v.getY(k),pz=v.getZ(k);if(py<0)py*=0.55;px*=1+0.12*Math.max(0,py);const arch=Math.max(0,1-Math.abs(px)/0.55);if(py<0)py+=arch*arch*0.62*(-py+0.2)*1.2;v.setXYZ(k,px,py,pz);}
    g.computeVertexNormals();
    const rt=new THREE.WebGLCubeRenderTarget(256,{format:THREE.RGBFormat,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});const cube=new THREE.CubeCamera(1,3000,rt);cube.position.set(x,6,z);scene.add(cube);
    const beanM=new THREE.MeshPhongMaterial({color:0xdfe4ea,specular:0xffffff,shininess:220,envMap:rt.texture,combine:THREE.MixOperation,reflectivity:0.92});
    const b=new THREE.Mesh(g,beanM);b.position.set(x,gh(x,z)+L.h*0.5,z);b.scale.set(L.w/2,L.h*0.5,L.d/2);b.rotation.y=-ang;
    const grp=group(L,[b]);let lastR=-1e9;animHooks.push(now=>{if(now-lastR<2500||camera.position.distanceTo(b.position)>700)return;lastR=now;b.visible=false;cube.update(renderer,scene);b.visible=true;});return grp;},
  pavilion(L,x,z){   // Pritzker: steel ribbons over the stage house (the stage itself is the OSM building), the trellis over the Great Lawn east of it
    const parts=[],g0=gh(x,z),top=Math.max(roofAt(x,z),g0+18);
    for(let k=0;k<9;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(10+k*1.6,0.35,3,18,Math.PI*(0.7+0.05*k)),chromeM);r.position.set(x-4-k*0.8,top+k*1.6,z+(k-4)*3.2);r.rotation.set(0.3*(k%3-1),Math.PI/2+0.25*(k-4),0.6+0.1*k);r.scale.set(1,1.4,3);parts.push(r);}
    const lawn=areaNamed(/Great Lawn/i,x,z)||areaNamed(/Pritzker/i,x,z);let lx0=x+20,lx1=x+130,lz0=z-55,lz1=z+55;if(lawn){lx0=lawn.bb.x0;lx1=lawn.bb.x1;lz0=lawn.bb.z0;lz1=lawn.bb.z1;}
    for(let k=0;k<=6;k++){const ax=lx0+(lx1-lx0)*k/6,arc=new THREE.Mesh(new THREE.TorusGeometry((lz1-lz0)/2,0.4,3,24,Math.PI),steelM);arc.position.set(ax,gh(ax,(lz0+lz1)/2),(lz0+lz1)/2);arc.rotation.y=Math.PI/2;arc.scale.set(1,0.42,1);parts.push(arc);}
    for(let k=-3;k<=3;k++)parts.push(box((lx0+lx1)/2,gh((lx0+lx1)/2,(lz0+lz1)/2)+(lz1-lz0)/2*0.42*Math.cos(k/3.4*Math.PI/2)-0.3,(lz0+lz1)/2+k*(lz1-lz0)/7.2,lx1-lx0,0.5,0.5,steelM));
    return group(L,parts);},
  fountain(L,x,z){const p=poi(L.name)||poi('Buckingham');if(p&&L.w>40){x=p.x;z=p.z;}const parts=[],w=L.w||40,g0=gh(x,z);
    const waterTop=new THREE.MeshPhongMaterial({color:0x3a7aa8,specular:0xffffff,shininess:100});
    for(let k=0;k<3;k++){const r=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,32).translate(0,0.5,0),stoneM);r.position.set(x,g0+k*w*0.03,z);r.scale.set(w/2*(1-k*0.3),w*0.03,w/2*(1-k*0.3));parts.push(r);
      const pool=new THREE.Mesh(new THREE.CylinderGeometry(1,1,0.1,32),waterTop);pool.position.set(x,g0+k*w*0.03+w*0.03+0.05,z);pool.scale.set(w/2*(1-k*0.3)-1,1,w/2*(1-k*0.3)-1);parts.push(pool);}
    const jetM=new THREE.MeshLambertMaterial({color:0xe8f4ff,transparent:true,opacity:0.55});const jet=new THREE.Mesh(new THREE.CylinderGeometry(0.4,w*0.03,1,10).translate(0,0.5,0),jetM);jet.position.set(x,g0+w*0.09,z);parts.push(jet);
    const g=group(L,parts);animHooks.push(now=>{const on=(now/1000)%60<30;jet.scale.y=(on?w*0.5:w*0.12)*(0.9+0.1*Math.sin(now*0.004));});return g;},
  wheel(L,x,z){const p=poi('Centennial Wheel');if(p){x=p.x;z=p.z;}const R=L.r||30,g0=gh(x,z),parts=[],wheel=new THREE.Group();
    wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R,0.8,6,64),steelM));for(let k=0;k<21;k++){const a=k/21*Math.PI*2,sp=new THREE.Mesh(new THREE.BoxGeometry(0.4,R*2,0.4),steelM);sp.rotation.z=a;wheel.add(sp);
      const car=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.4,2.4),new THREE.MeshLambertMaterial({color:0xe8f0ff}));car.position.set(Math.cos(a)*R,Math.sin(a)*R,0);wheel.add(car);}
    wheel.position.set(x,g0+R+4,z);parts.push(wheel);for(const s of [-1,1]){const leg=box(x+s*6,g0+2,z,1.6,R+4,1.6,steelM);leg.rotation.z=-s*0.18;parts.push(leg);}
    const g=group(L,parts);animHooks.push(now=>{wheel.rotation.z=now*0.00009;});return g;},
  // bridges drawn by OSM as road decks: find where the named road crosses the water, then add the structure there
  liftbridge(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const H=L.towerH||50,parts=[],m=new THREE.MeshLambertMaterial({color:0x5a6068});
    for(const sd of [-1,1]){const tx=c.x+c.ux*sd*c.half*0.35,tz=c.z+c.uz*sd*c.half*0.35;for(const ss of [-1,1]){parts.push(box(tx-c.uz*ss*(c.w/2+1),0,tz+c.ux*ss*(c.w/2+1),2.2,c.y+H,2.2,m));}
      parts.push(box(tx,c.y+H-2,tz,2.2,2.2,c.w+4,m).rotateY(-Math.atan2(c.uz,c.ux)));}
    const span=box(c.x,c.y+H*0.25,c.z,c.half*0.7,3,c.w+2,m);span.rotation.y=-Math.atan2(c.uz,c.ux);parts.push(span);return group(L,parts);},
  bascule(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const parts=[],m=new THREE.MeshLambertMaterial({color:0xc8bca8}),r=new THREE.MeshLambertMaterial({color:0x5a6a62});
    for(const sd of [-1,1])for(const ss of [-1,1]){const px=c.x+c.ux*sd*c.half*0.3-c.uz*ss*(c.w/2+4),pz=c.z+c.uz*sd*c.half*0.3+c.ux*ss*(c.w/2+4);parts.push(box(px,0,pz,8,c.y+10,8,m));const cap=new THREE.Mesh(new THREE.ConeGeometry(6,4,4).translate(0,2,0),r);cap.rotation.y=Math.PI/4;cap.position.set(px,c.y+10,pz);parts.push(cap);}
    return group(L,parts);},
  arch(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const H=L.archH||100,span=L.span||c.half*2,m=new THREE.MeshLambertMaterial({color:0x4f6a8a}),parts=[];
    for(const ss of [-1,1]){const a=new THREE.Mesh(new THREE.TorusGeometry(1,0.012,6,48,Math.PI),m);a.scale.set(span/2,Math.max(10,H-c.y),span/2);a.position.set(c.x-c.uz*ss*(c.w/2),c.y,c.z+c.ux*ss*(c.w/2));a.rotation.y=-Math.atan2(c.uz,c.ux);parts.push(a);
      for(let k=-6;k<=6;k++){const t=k/7,hx=c.x+c.ux*t*span/2-c.uz*ss*(c.w/2),hz=c.z+c.uz*t*span/2+c.ux*ss*(c.w/2),hy=c.y+Math.max(10,H-c.y)*Math.sqrt(Math.max(0,1-t*t));parts.push(box(hx,c.y,hz,0.4,hy-c.y,0.4,m));}}
    return group(L,parts);},
  cablestay(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const H=L.towerH||55,m=new THREE.MeshLambertMaterial({color:0xe8e8e4}),cab=new THREE.LineBasicMaterial({color:0xd0d0d0}),parts=[];
    for(const sd of [-1,1]){const tx=c.x+c.ux*sd*c.half*0.4,tz=c.z+c.uz*sd*c.half*0.4;parts.push(box(tx,0,tz,3,c.y+H,3,m));
      const pts=[];for(let k=1;k<=10;k++)for(const dir of [-1,1])for(const ss of [-1,1]){const d=k*c.half*0.055;pts.push(new THREE.Vector3(tx,c.y+H-k*1.5,tz),new THREE.Vector3(tx+c.ux*dir*d-c.uz*ss*(c.w/2),c.y,tz+c.uz*dir*d+c.ux*ss*(c.w/2)));}
      parts.push(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),cab));}
    return group(L,parts);},
  sign(L,x,z){const top=roofAt(x,z)||gh(x,z)+15,neonR=new THREE.MeshBasicMaterial({color:0xff3a2a}),neonW=new THREE.MeshBasicMaterial({color:0xfff4d0}),frame=new THREE.MeshLambertMaterial({color:0x3a3a3a}),parts=[];
    const W=26,H=12;parts.push(box(x,top,z,0.6,H+4,0.6,frame),box(x-W*0.4,top,z,0.4,H,0.4,frame),box(x+W*0.4,top,z,0.4,H,0.4,frame));
    const face=box(x,top+2,z,W,H*0.55,0.5,frame);parts.push(face);const words=box(x,top+2+H*0.3,z+0.3,W*0.9,1.4,0.2,neonR),words2=box(x,top+2+H*0.1,z+0.3,W*0.6,1.2,0.2,neonW),stag=box(x-W*0.1,top+2+H*0.52,z+0.3,5,3,0.2,neonW);
    parts.push(words,words2,stag);const g=group(L,parts);g.rotation.y=0.35;animHooks.push(()=>{const on=nightF(hourCur)>0.35;neonR.color.setHex(on?0xff3a2a:0x6a2a24);neonW.color.setHex(on?0xfff4d0:0x8a8478);});return g;},
  gate(L,x,z){const g0=gh(x,z),red=new THREE.MeshLambertMaterial({color:0xb02a24}),roof=new THREE.MeshLambertMaterial({color:0x2a6a4a}),gold=new THREE.MeshLambertMaterial({color:0xd8b040}),parts=[];
    for(const s of [-1,1])parts.push(box(x+s*7,g0,z,1.2,9,1.2,red));parts.push(box(x,g0+7,z,17,1.2,1.4,gold));
    for(const [w,y] of [[20,9],[9,12],[6,14.5]]){const r=new THREE.Mesh(new THREE.BoxGeometry(w,0.8,3.2),roof);r.position.set(x,g0+y,z);parts.push(r);}return group(L,parts);},
  submarine(L,x,z){let best=null;for(let a=0;a<6.28;a+=0.2)for(let d=40;d<220;d+=10){const px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(inWater(px,pz)&&inWater(px+40,pz)&&inWater(px-40,pz)){best=[px,pz];break;}}if(!best)return null;
    const hull=new THREE.Mesh(new THREE.CylinderGeometry(4,4,60,14),new THREE.MeshLambertMaterial({color:0x2a2e34}));hull.rotation.z=Math.PI/2;hull.position.set(best[0],0.8,best[1]);hull.scale.y=1;
    const sail=box(best[0]+8,2,best[1],7,6,2.4,new THREE.MeshLambertMaterial({color:0x2a2e34}));return group({name:'USS Blueback',info:'The USS Blueback (SS-581), the last diesel-electric submarine built for the US Navy, moored at OMSI.'},[hull,sail]);},
  tram(L,x,z){const [ux0,uz0]=P(L.upper),[lx0,lz0]=P(L.lower),gU=gh(ux0,uz0),gL=gh(lx0,lz0),uh=gU+Math.max(16,roofAt(ux0,uz0)-gU),parts=[],steel=new THREE.MeshLambertMaterial({color:0x8a9098});
    // the hill is modelled now, so the upper station stands on Marquam Hill itself
    parts.push(box(ux0,gU,uz0,8,uh-gU,8,steel),box(lx0,gL,lz0,10,14,10,steel));const tower=[(ux0*0.4+lx0*0.6),(uz0*0.4+lz0*0.6)],gT=gh(tower[0],tower[1]),tH=Math.max(24,(uh-gT)*0.6);parts.push(box(tower[0],gT,tower[1],3,tH,3,steel));
    const pts=[new THREE.Vector3(lx0,gL+13,lz0),new THREE.Vector3(tower[0],gT+tH,tower[1]),new THREE.Vector3(ux0,uh,uz0)];parts.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x303030})));
    const cabM=new THREE.MeshLambertMaterial({color:0xc8ccd0}),cabs=[0,1].map(()=>{const c=new THREE.Mesh(new THREE.BoxGeometry(6,3.5,4),cabM);parts.push(c);return c;});
    const at=u=>{const a=u<0.65?pts[0].clone().lerp(pts[1],u/0.65):pts[1].clone().lerp(pts[2],(u-0.65)/0.35);a.y-=3;return a;};
    const g=group(L,parts);animHooks.push(now=>{const t=(now/240000)%1,u=t<0.5?t*2:2-t*2;cabs[0].position.copy(at(u));cabs[1].position.copy(at(1-u));});return g;},
  mountain(L){   // far on the horizon, scaled so it looks the right size from the city: placed 22 km out along its true bearing
    const [mx,mz]=P(L.at),d=Math.hypot(mx,mz),k=22000/d,x=mx*k,z=mz*k,h=L.h*k,r=h*2.6,g=new THREE.ConeGeometry(r,h,48,6,true),v=g.attributes.position;
    for(let i=0;i<v.count;i++){const y=v.getY(i)/h+0.5,n=1+0.08*Math.sin(v.getX(i)*0.01+v.getZ(i)*0.013);v.setX(i,v.getX(i)*n);v.setZ(i,v.getZ(i)*n);if(L.crater&&y>0.88)v.setY(i,h*0.38);}
    g.computeVertexNormals();const rock=new THREE.MeshLambertMaterial({color:0x6a7288,fog:false}),snow=new THREE.MeshLambertMaterial({color:0xf4f6fa,fog:false});
    const base=new THREE.Mesh(g,rock);base.position.set(x,h/2-h*0.05,z);const capG=new THREE.ConeGeometry(r*0.38,h*0.38,36,2,true);const cap=new THREE.Mesh(capG,snow);cap.position.set(x,h-h*0.05-h*0.19+(L.crater?-h*0.08:0),z);cap.scale.set(1.02,1,1.02);
    const grp=group(L,[base,cap]);base.castShadow=cap.castShadow=false;return grp;},
  // ---- City 17 (data/cities/city17.json): fan geometry, modelled here from the silhouettes; no game assets ----
  citadel(L,x,z){   // two miles of it: a narrow foot driven into the crust, widening the whole way up into a crown that overhangs the city
    const H=L.height||3200,g0=gh(x,z),parts=[],A=L.turn||0.22,CR=mkRng(4417);
    // the alloy absorbs light rather than returning it: almost no specular, and flat faces so the plates read as plates
    const hull=new THREE.MeshPhongMaterial({color:0x2b313a,specular:0x0a0d12,shininess:2,flatShading:true});
    const dark=new THREE.MeshPhongMaterial({color:0x222832,specular:0x080a0e,shininess:2,flatShading:true});
    const plateM=new THREE.MeshPhongMaterial({color:0x262c35,specular:0x0a0d12,shininess:2,flatShading:true});
    const inner=new THREE.MeshPhongMaterial({color:0x14181e,specular:0x060809,shininess:2,flatShading:true});
    // width up the tower: a wide base complex, a neck, then it widens the whole way to the crown
    const wid=t=>t<0.03?620-11000*t:t<0.11?290-90*(t-0.03)/0.08:t<0.45?200+86*(t-0.11)/0.34:
      t<0.70?286+78*(t-0.45)/0.25:t<0.86?364+70*(t-0.70)/0.16:t<0.94?434+92*(t-0.86)/0.08:
      Math.max(70,526-5200*(t-0.94));
    const dep=t=>wid(t)*0.82;
    const SEG=40;
    for(let k=0;k<SEG;k++){const t0=k/SEG,t1=(k+1)/SEG,w=(wid(t0)+wid(t1))/2,d=(dep(t0)+dep(t1))/2,hh=H/SEG*1.02;
      const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d).translate(0,hh/2,0),k%3?hull:dark);
      b.position.set(x,g0+H*t0,z);b.rotation.y=A+Math.sin(k*1.9)*0.022;parts.push(b);}
    // the base complex: angular masses swallowing the ground it came up through
    for(let k=0;k<14;k++){const a=k/14*Math.PI*2+0.3,r=250+CR()*170,w=120+CR()*150;
      const b=new THREE.Mesh(new THREE.BoxGeometry(w,40+CR()*95,90+CR()*80).translate(0,0,0),k%2?dark:hull);
      b.position.set(x+Math.cos(a)*r,g0-10+CR()*30,z+Math.sin(a)*r);b.rotation.set(0,-a+CR()*0.4,0);parts.push(b);}
    // the hull is a jigsaw of massive interlocking plates: smooth, no rivets, no two the same
    const faceAt=(t,f)=>{const a=A+f*Math.PI/2,w=wid(t),d=dep(t);return {a,half:(f%2?d:w)/2,lat:(f%2?w:d)};};
    for(let f=0;f<4;f++){let t=0.05;
      while(t<0.92){const th=0.035+CR()*0.05,tc=t+th/2,{a,half,lat}=faceAt(tc,f);
        let off=-0.46;while(off<0.46){const pw=(0.16+CR()*0.24);const o=off+pw/2;
          const pl=new THREE.Mesh(new THREE.BoxGeometry(lat*pw*0.96,H*th*0.95,13+CR()*9).translate(0,H*th*0.475,0),CR()<0.35?plateM:(CR()<0.5?hull:dark));
          pl.position.set(x+Math.cos(a)*(half+4)-Math.sin(a)*lat*o,g0+H*t,z+Math.sin(a)*(half+4)+Math.cos(a)*lat*o);
          pl.rotation.y=-a;parts.push(pl);off+=pw;}
        t+=th;}}
    // eight plates that slide: they telescope out over minutes and show the works behind them
    const sliders=[];
    for(let k=0;k<8;k++){const f=k%4,t=0.2+CR()*0.6,{a,half,lat}=faceAt(t,f),o=(CR()-0.5)*0.5;
      const px=x+Math.cos(a)*half-Math.sin(a)*lat*o,pz=z+Math.sin(a)*half+Math.cos(a)*lat*o,py=g0+H*t;
      const shaftH=H*0.055;
      // what is behind the plate: a lit track with a pod running up and down it
      const bay=new THREE.Mesh(new THREE.BoxGeometry(lat*0.2,shaftH,10).translate(0,shaftH/2,0),inner);
      bay.position.set(px,py,pz);bay.rotation.y=-a;parts.push(bay);
      const condM=new THREE.MeshBasicMaterial({color:0x6fd0ff,transparent:true,opacity:0.8});
      const strip=new THREE.Mesh(new THREE.BoxGeometry(lat*0.12,shaftH*0.94,3),condM);
      strip.position.set(px+Math.cos(a)*3,py+shaftH*0.5,pz+Math.sin(a)*3);strip.rotation.y=-a;parts.push(strip);
      const pod=new THREE.Mesh(new THREE.BoxGeometry(9,13,9),dark);pod.position.set(px+Math.cos(a)*5,py,pz+Math.sin(a)*5);
      scene.add(pod);
      const pl=new THREE.Mesh(new THREE.BoxGeometry(lat*0.22,shaftH,15).translate(0,shaftH/2,0),hull);
      pl.rotation.y=-a;scene.add(pl);
      sliders.push({pl,pod,px,py,pz,a,shaftH,ph:CR()*6.28,sp:0.00006+CR()*0.00005,condM});}
    // the conduits up the spine, and the pulses that run up them
    const plasmaM=new THREE.MeshBasicMaterial({color:0x7fd4ff,transparent:true,opacity:0.5});
    const pulseM=new THREE.MeshBasicMaterial({color:0xe8f8ff,transparent:true,opacity:0.9});
    const pulses=[];
    for(let c=0;c<8;c++){const a=A+c/8*Math.PI*2+0.19,t0=0.1,t1=0.9;
      for(let k=0;k<9;k++){const ta=t0+(t1-t0)*k/9,tb=t0+(t1-t0)*(k+1)/9,w=wid((ta+tb)/2),d=dep((ta+tb)/2);
        const r=(Math.abs(Math.cos(a-A))>0.7?w:d)/2;
        const seg=new THREE.Mesh(new THREE.BoxGeometry(9,H*(tb-ta)*1.02,7).translate(0,H*(tb-ta)/2,0),plasmaM);
        seg.position.set(x+Math.cos(a)*(r+7),g0+H*ta,z+Math.sin(a)*(r+7));seg.rotation.y=-a;parts.push(seg);}
      const p=new THREE.Mesh(new THREE.BoxGeometry(13,44,11),pulseM);scene.add(p);
      pulses.push({p,a,ph:CR(),sp:0.06+CR()*0.05});}
    // the crown: slabs and arms thrown out at angles, overhanging the city
    for(let k=0;k<14;k++){const a=A+k/14*Math.PI*2+0.35,t=0.86+((k*53)%5)*0.017,r=wid(t)*(0.30+((k*31)%4)*0.08);
      const w=90+((k*29)%4)*48,hh=150+((k*71)%6)*120,d=76+((k*17)%3)*34;
      const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d).translate(0,hh/2,0),k%2?hull:dark);
      b.position.set(x+Math.cos(a)*r,g0+H*t,z+Math.sin(a)*r);b.rotation.set(0.04*Math.sin(a),-a+0.25,0.05*Math.cos(a));parts.push(b);}
    for(let k=0;k<7;k++){const a=A+k/7*Math.PI*2+0.9,t=0.83+((k*37)%4)*0.026,len=190+((k*53)%4)*96;
      const arm=new THREE.Mesh(new THREE.BoxGeometry(len,64+((k*29)%3)*30,84).translate(len/2,0,0),k%2?dark:hull);
      arm.position.set(x+Math.cos(a)*wid(t)*0.44,g0+H*t,z+Math.sin(a)*wid(t)*0.44);
      arm.rotation.set(0,-a,0.05*(((k*19)%3)-1));parts.push(arm);}
    parts.push(box(x,g0+H*0.97,z,52,H*0.06,52,dark));
    // the reactor link at the apex: an aperture that never settles
    const flareM=new THREE.MeshBasicMaterial({color:0xdcf2ff,transparent:true,opacity:0.9});
    const core=new THREE.Mesh(new THREE.SphereGeometry(78,20,14),flareM);core.position.set(x,g0+H*1.005,z);parts.push(core);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(210,9,6,44),flareM);halo.position.set(x,g0+H*1.005,z);halo.rotation.x=Math.PI/2;parts.push(halo);
    const arcs=[];for(let k=0;k<5;k++){const arc=new THREE.Mesh(new THREE.BoxGeometry(150+CR()*130,9,9),flareM);
      arc.position.set(x,g0+H*1.005,z);scene.add(arc);arcs.push({arc,ph:CR()*6.28,sp:0.0009+CR()*0.0016});}
    // spotlights off the upper tiers, sweeping the sky and the streets
    const beamM=new THREE.MeshBasicMaterial({color:0xf0f6ff,transparent:true,opacity:0.07,side:THREE.DoubleSide,depthWrite:false});
    const beams=[];for(let k=0;k<4;k++){const sw=new THREE.Group();sw.position.set(x,g0+H*(0.78+k*0.04),z);
      const bm=new THREE.Mesh(new THREE.ConeGeometry(70,2100,10,1,true).rotateZ(Math.PI/2).translate(1050,0,0),beamM);
      bm.rotation.z=-0.55-k*0.12;sw.add(bm);scene.add(sw);beams.push({sw,sp:0.00013+k*0.00004,ph:k*1.7});}
    // haze banking against the upper tiers
    const hazeM=new THREE.MeshBasicMaterial({color:0xaebccc,transparent:true,opacity:0.14,depthWrite:false});
    const hazes=[];for(let k=0;k<4;k++){const hz=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),hazeM);
      hz.scale.set(560+k*120,52,430+k*110);hz.position.set(x+(CR()-0.5)*160,g0+H*(0.72+k*0.07),z+(CR()-0.5)*160);
      scene.add(hz);hazes.push({hz,ph:CR()*6.28});}
    // merge everything static: ~700 boxes collapse to one mesh per material
    const liveM=new Set([plasmaM,pulseM,flareM,beamM,hazeM]),byMat=new Map(),keep=[];
    for(const m of parts){if(!m.material||liveM.has(m.material)){keep.push(m);continue;}
      let arr=byMat.get(m.material);if(!arr){arr=[];byMat.set(m.material,arr);}arr.push(m);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    const g=group(L,merged.concat(keep));
    const beacons=[];for(const t of [0.4,0.62,0.82,0.96]){const b=new THREE.Mesh(new THREE.SphereGeometry(9,8,6),new THREE.MeshBasicMaterial({color:0xff3020}));
      b.position.set(x,g0+H*t,z+dep(t)*0.5+12);beacons.push(b);scene.add(b);}
    animHooks.push(now=>{const n=nightF(hourCur),p=0.6+0.4*Math.sin(now*0.0007);
      // the reactor: never the same twice
      const fl=0.55+0.45*Math.abs(Math.sin(now*0.0031)+0.4*Math.sin(now*0.011));
      flareM.opacity=Math.min(1,(0.55+0.35*n)*fl);core.scale.setScalar(0.88+0.22*fl);halo.rotation.z=now*0.00009;
      for(const a of arcs){a.arc.rotation.set(Math.sin(now*a.sp+a.ph)*2.2,now*a.sp*3+a.ph,Math.cos(now*a.sp*1.7+a.ph)*2.2);
        a.arc.scale.setScalar(0.6+0.7*fl);}
      // plasma in the conduits, and a pulse climbing each one
      plasmaM.opacity=(0.30+0.32*n)*p;pulseM.opacity=(0.5+0.5*n)*(0.7+0.3*Math.sin(now*0.004));
      for(const q of pulses){const t=((now*0.00004*q.sp*220)+q.ph)%1,tt=0.1+t*0.8,w=wid(tt),d=dep(tt);
        const r=(Math.abs(Math.cos(q.a-A))>0.7?w:d)/2;
        q.p.position.set(x+Math.cos(q.a)*(r+7),g0+H*tt,z+Math.sin(q.a)*(r+7));q.p.rotation.y=-q.a;}
      // hull plates telescoping out, with a pod running the exposed track
      for(const s of sliders){const u=Math.sin(now*s.sp+s.ph),open=Math.max(0,u)*26;
        s.pl.position.set(s.px+Math.cos(s.a)*(6+open),s.py,s.pz+Math.sin(s.a)*(6+open));
        const pt=(Math.sin(now*s.sp*3.1+s.ph)*0.5+0.5);
        s.pod.position.set(s.px+Math.cos(s.a)*5,s.py+pt*s.shaftH,s.pz+Math.sin(s.a)*5);
        s.condM.opacity=(0.35+0.45*n)*(0.5+0.5*Math.sin(now*0.003+s.ph));}
      // spotlights, only once it is dark enough for them to show
      const on=n>0.15;for(const b of beams){b.sw.visible=on;b.sw.rotation.y=now*b.sp+b.ph;}
      beamM.opacity=0.05+0.06*n;
      for(const h of hazes){h.hz.rotation.y=now*0.00002+h.ph;}
      for(const b of beacons)b.visible=(now%2200)<1100;});
    return g;},
  nexus(L,x,z){   // the block the Combine armoured over: fins up the sides, a crest and masts on the roof
    const g0=gh(x,z),top=Math.max(roofAt(x,z),g0+70),parts=[],m=new THREE.MeshPhongMaterial({color:0x3a4048,specular:0x6a7a8a,shininess:14,flatShading:true});
    for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4,fin=new THREE.Mesh(new THREE.BoxGeometry(12,top-g0,46).translate(0,(top-g0)/2,0),m);
      fin.position.set(x+Math.cos(a)*54,g0,z+Math.sin(a)*54);fin.rotation.y=-a;parts.push(fin);}
    const crest=new THREE.Mesh(new THREE.CylinderGeometry(16,46,34,6).translate(0,17,0),m);crest.position.set(x,top,z);parts.push(crest);
    for(const [dx,dz] of [[-34,-26],[34,-26],[-34,26],[34,26]])parts.push(box(x+dx,top,z+dz,3,26+((dx+dz)%13),3,m));
    const emM=new THREE.MeshBasicMaterial({color:0x8fd0ff});   // the mark they put on everything, in the plainest geometry that carries it
    const ey=top-38,ez=z+47;   // a spine with two arms swept up and out, on a foot: angular, and not a cross
    parts.push(box(x,ey,ez,5,26,1.6,emM),box(x,ey-5,ez,15,4,1.6,emM));
    for(const sd of [-1,1]){const arm=box(x+sd*3,ey+9,ez,3.6,18,1.6,emM);arm.rotation.z=-sd*0.62;parts.push(arm);}
    const g=group(L,parts);animHooks.push(()=>{const n=nightF(hourCur);emM.color.setRGB(0.25+0.35*n,0.55+0.3*n,0.75+0.25*n);});return g;},
  forcegate(L,x,z){   // a checkpoint: armoured blockhouses either side, a field across the gap, a lamp above it
    const a=L.ang||0,ux=-Math.sin(a),uz=Math.cos(a),g0=gh(x,z),parts=[],m=new THREE.MeshPhongMaterial({color:0x414750,specular:0x6a7a8a,shininess:14,flatShading:true});
    for(const s of [-1,1]){const bx=x+ux*s*15,bz=z+uz*s*15;const gb=gh(bx,bz);parts.push(box(bx,gb,bz,12,19,12,m));
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(4,9,7,6).translate(0,3.5,0),m);cap.position.set(bx,gb+19,bz);parts.push(cap);}
    parts.push(box(x,g0+18,z,34,4,7,m));
    const fieldM=new THREE.MeshBasicMaterial({color:0x8fd8ff,transparent:true,opacity:0.22,side:THREE.DoubleSide,depthWrite:false});
    const field=new THREE.Mesh(new THREE.PlaneGeometry(22,17),fieldM);field.position.set(x,g0+8.5,z);field.rotation.y=-a;parts.push(field);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xff5020}));lamp.position.set(x,g0+21,z);parts.push(lamp);
    const g=group(L,parts);
    animHooks.push(now=>{fieldM.opacity=0.16+0.12*Math.abs(Math.sin(now*0.0016));lamp.visible=(now%1800)<900;});
    return g;},
  pylon(L,x,z){   // a generator: an angular mass carried on a column, lit from underneath
    const g0=gh(x,z),H=L.height||46,parts=[],m=new THREE.MeshPhongMaterial({color:0x3e444c,specular:0x70808f,shininess:14,flatShading:true});
    parts.push(box(x,g0,z,13,H,13,m));
    const headH=22,head=new THREE.Mesh(new THREE.CylinderGeometry(27,15,headH,6).translate(0,headH/2,0),m);head.position.set(x,g0+H,z);parts.push(head);
    for(let k=0;k<3;k++){const a=k/3*Math.PI*2+0.5,arm=new THREE.Mesh(new THREE.BoxGeometry(22,4,7),m);
      arm.position.set(x+Math.cos(a)*22,g0+H+headH*0.6,z+Math.sin(a)*22);arm.rotation.y=-a;parts.push(arm);}
    const glowM=new THREE.MeshBasicMaterial({color:0x9fd8ff,transparent:true,opacity:0.6});
    const under=new THREE.Mesh(new THREE.SphereGeometry(9,12,8),glowM);under.position.set(x,g0+H-3,z);parts.push(under);
    const g=group(L,parts);animHooks.push(now=>{const n=nightF(hourCur);glowM.opacity=(0.35+0.4*n)*(0.7+0.3*Math.sin(now*0.0027));});return g;},
  strider(L,x,z){   // a three-legged walker over the blocks, feet stepping in turn
    const g0=gh(x,z),parts=[],m=new THREE.MeshPhongMaterial({color:0x3c424a,specular:0x70808f,shininess:16,flatShading:true});
    const BODY=19,REACH=15,root=new THREE.Group();root.position.set(x,g0,z);
    const pod=new THREE.Mesh(new THREE.SphereGeometry(4.4,12,9),m);pod.scale.set(1.9,0.85,1);pod.position.y=BODY;root.add(pod);
    const snout=new THREE.Mesh(new THREE.CylinderGeometry(0.7,2.4,9,6).rotateZ(Math.PI/2),m);snout.position.set(7,BODY,0);root.add(snout);
    const eye=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xff6030}));eye.position.set(11,BODY,0);root.add(eye);
    const legs=[];for(let k=0;k<3;k++){const a=k/3*Math.PI*2+Math.PI/6;
      const thigh=new THREE.Mesh(new THREE.CylinderGeometry(0.75,0.6,1,5).translate(0,0.5,0),m),shin=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.32,1,5).translate(0,0.5,0),m);
      root.add(thigh,shin);legs.push({a,thigh,shin,ph:k/3});}
    parts.push(root);
    const g=group(L,parts);
    const aim=new THREE.Vector3(),tmp=new THREE.Vector3();
    animHooks.push(now=>{const t=now/2600,walk=(t%1);root.position.y=g0+Math.sin(t*Math.PI*6)*0.35;
      for(const lg of legs){const ph=(walk+lg.ph)%1,lift=Math.max(0,Math.sin(ph*Math.PI))*5.5;
        const reach=REACH+Math.cos(ph*Math.PI*2)*3.5,fx=Math.cos(lg.a)*reach,fz=Math.sin(lg.a)*reach,fy=lift;
        const hipY=BODY-1.5,kx=fx*0.55,kz=fz*0.55,ky=hipY*0.55+fy*0.45+4.5;   // the knee rides high and outboard, as they do
        const put=(mesh,ax,ay,az,bx,by,bz)=>{aim.set(bx-ax,by-ay,bz-az);const len=aim.length()||1;
          mesh.position.set(ax,ay,az);mesh.scale.set(1,len,1);tmp.copy(aim).normalize();
          mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tmp);};
        put(lg.thigh,0,hipY,0,kx,ky,kz);put(lg.shin,kx,ky,kz,fx,fy,fz);}});
    return g;},
  gunships(L,x,z){   // flyers circling the tower, banked into the turn
    const parts=[],m=new THREE.MeshPhongMaterial({color:0x2e343c,specular:0x70808f,shininess:20,flatShading:true}),ships=[];
    for(let k=0;k<(L.count||3);k++){const g=new THREE.Group();
      const body=new THREE.Mesh(new THREE.SphereGeometry(3.4,12,9),m);body.scale.set(2.7,0.9,1);g.add(body);
      const tail=new THREE.Mesh(new THREE.CylinderGeometry(1.5,0.4,11,6).rotateZ(Math.PI/2),m);tail.position.set(-11,0,0);g.add(tail);
      for(const sd of [-1,1]){const wing=new THREE.Mesh(new THREE.BoxGeometry(7,0.8,12),m);wing.position.set(-1,0.6,sd*6);wing.rotation.x=sd*0.25;g.add(wing);}
      const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,6),new THREE.MeshBasicMaterial({color:0xff5030}));lamp.position.set(9,0,0);g.add(lamp);
      scene.add(g);ships.push({g,r:(L.radius||430)+k*95,y:(L.alt||190)+k*62,ph:k/(L.count||3)*Math.PI*2,v:0.000058+k*0.000012,lamp});}
    const g=group(L,parts);
    animHooks.push(now=>{for(const s of ships){const a=s.ph+now*s.v;s.g.position.set(x+Math.cos(a)*s.r,gh(x,z)+s.y,z+Math.sin(a)*s.r);
      s.g.rotation.set(0,-a-Math.PI/2,0.34);s.lamp.visible=(now%1500)<750;}});
    return g;},
  screenmast(L,x,z){   // a public screen on a mast: blank grey by day, lit after dark
    const g0=gh(x,z),parts=[],m=new THREE.MeshPhongMaterial({color:0x424851,specular:0x6a7a8a,shininess:12,flatShading:true});
    const faceM=new THREE.MeshBasicMaterial({color:0x1e242b});
    parts.push(box(x-6,g0,z,1.6,19,1.6,m),box(x+6,g0,z,1.6,19,1.6,m),box(x,g0+18,z,15,1.6,1.6,m));
    parts.push(box(x,g0+18.6,z-0.5,17,10.5,0.9,m));
    const face=box(x,g0+19,z+0.1,14.5,8.6,0.5,faceM);parts.push(face);
    const g=group(L,parts);
    animHooks.push(now=>{const n=nightF(hourCur),f=0.05+0.55*n*(0.88+0.12*Math.sin(now*0.005));faceM.color.setRGB(f*0.5,f*0.7,f*0.92);});
    return g;},
  // ---- Vashrin (data/cities/vashrin.json): the fictional city's own structures ----
  spiretower(L,x,z){   // the tower over the plaza: a battered shaft that splits into three prongs around a lit aperture
    const H=L.height||520,g0=gh(x,z),parts=[],R0=68,R1=26;
    const shellM=new THREE.MeshPhongMaterial({color:0x3c4048,specular:0x9099a8,shininess:26,flatShading:true});
    const prof=[];for(let k=0;k<=16;k++){const t=k/16,r=R0*(1-Math.pow(t,1.5))+R1*Math.pow(t,1.5)-Math.sin(t*Math.PI)*5;prof.push(new THREE.Vector2(Math.max(6,r),g0+H*0.78*t));}
    const shaft=new THREE.Mesh(new THREE.LatheGeometry(prof,9),shellM);shaft.position.set(x,0,z);parts.push(shaft);
    for(let k=0;k<3;k++){   // the prongs, leaning in towards the aperture
      const a=k/3*Math.PI*2+0.5,pr=new THREE.Mesh(new THREE.CylinderGeometry(5,17,H*0.28,5).translate(0,H*0.14,0),shellM);
      pr.position.set(x+Math.cos(a)*17,g0+H*0.74,z+Math.sin(a)*17);pr.rotation.set(Math.sin(a)*0.2,0,-Math.cos(a)*0.2);parts.push(pr);}
    for(let k=0;k<6;k++){   // buttress fins down the lower third
      const a=k/6*Math.PI*2,hF=H*(0.3+0.06*(k%2)),fin=new THREE.Mesh(new THREE.BoxGeometry(20,hF,7).translate(0,hF/2,0),shellM);
      fin.position.set(x+Math.cos(a)*(R0-7),g0,z+Math.sin(a)*(R0-7));fin.rotation.y=-a;parts.push(fin);}
    {const plinth=new THREE.Mesh(new THREE.CylinderGeometry(R0*1.5,R0*1.62,7,9).translate(0,3.5,0),stoneM);plinth.position.set(x,g0-1,z);parts.push(plinth);}   // the plaza steps up to it
    const glowM=new THREE.MeshBasicMaterial({color:0x9fd8ff,transparent:true,opacity:0.8});
    const eye=new THREE.Mesh(new THREE.SphereGeometry(16,20,12),glowM);eye.position.set(x,g0+H*0.8,z);parts.push(eye);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(44,2.2,6,40),glowM);halo.position.set(x,g0+H*0.68,z);halo.rotation.x=Math.PI/2;parts.push(halo);
    for(let k=0;k<4;k++){   // service bands, each one a little narrower than the shaft it wraps
      const t=0.16+k*0.16,r=(R0*(1-t)+R1*t-Math.sin(t*Math.PI)*7)*1.16;
      const b=new THREE.Mesh(new THREE.CylinderGeometry(r,r*1.04,3.2,9).translate(0,1.6,0),shellM);b.position.set(x,g0+H*0.78*t,z);b.rotation.y=k*0.35;parts.push(b);}
    const stripM=new THREE.MeshBasicMaterial({color:0x6fa8d0,transparent:true,opacity:0.2});   // the seams down the shaft, which only show at night
    const strips=[];for(let k=0;k<6;k++){const a=k/6*Math.PI*2+0.3,hS=H*0.5,st=new THREE.Mesh(new THREE.BoxGeometry(1.2,hS,1.2).translate(0,hS/2,0),stripM);
      st.position.set(x+Math.cos(a)*(R1+11),g0+H*0.26,z+Math.sin(a)*(R1+11));strips.push(st);parts.push(st);}
    const g=group(L,parts);
    animHooks.push(now=>{const n=nightF(hourCur),p=0.55+0.45*Math.sin(now*0.0011);glowM.opacity=(0.35+0.5*n)*p;halo.rotation.z=now*0.00012;eye.scale.setScalar(0.94+0.1*p);
      for(const st of strips)st.visible=n>0.2;stripM.opacity=0.42*n*p;});
    return g;},
  checkpoint(L,x,z){   // a gate through the ring wall: blockhouses, a beam over the road, a barrier that lifts
    const a=L.ang||0,ux=-Math.sin(a),uz=Math.cos(a),g0=gh(x,z),parts=[],m=new THREE.MeshLambertMaterial({color:0x60605c}),y=new THREE.MeshLambertMaterial({color:0xc8b038});
    for(const s of [-1,1]){const bx=x+ux*s*13,bz=z+uz*s*13;parts.push(box(bx,gh(bx,bz),bz,10,16,10,m));
      const cab=box(bx,gh(bx,bz)+16,bz,11,2,11,steelM);parts.push(cab);}
    parts.push(box(x,g0+15,z,30,2.6,5,m));
    const pivot=new THREE.Group();pivot.position.set(x-ux*9,g0+3,z-uz*9);   // the barrier arm, hinged at the kerb
    const bar=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,16).translate(0,0,8),y);bar.rotation.y=-a;pivot.add(bar);parts.push(pivot);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.7,8,6),new THREE.MeshBasicMaterial({color:0xff4020}));lamp.position.set(x,g0+18,z);parts.push(lamp);
    const g=group(L,parts);g.rotation.y=0;
    animHooks.push(now=>{const t=(now/9000)%1,lift=smooth(0.45,0.55,t)-smooth(0.9,0.98,t);pivot.rotation.x=-1.25*lift;lamp.visible=(now%1400)<700;});
    return g;},
  watchtower(L,x,z){   // a mast on the wall with a sweeping light
    const g0=gh(x,z),H=L.height||34,parts=[],m=new THREE.MeshLambertMaterial({color:0x585852});
    parts.push(box(x,g0,z,3.4,H,3.4,m),box(x,g0+H,z,8,3,8,m));
    for(const s of [-1,1])parts.push(box(x+s*2.4,g0+H*0.4,z,0.8,H*0.6,0.8,m));
    const beamM=new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:0.14,side:THREE.DoubleSide,depthWrite:false});
    const swivel=new THREE.Group();swivel.position.set(x,g0+H+1.5,z);
    const beam=new THREE.Mesh(new THREE.ConeGeometry(11,150,12,1,true).rotateZ(Math.PI/2).translate(75,0,0),beamM);
    beam.rotation.z=-0.3;swivel.add(beam);parts.push(swivel);
    const head=new THREE.Mesh(new THREE.SphereGeometry(1.3,10,8),new THREE.MeshBasicMaterial({color:0xfff4d4}));head.position.set(x,g0+H+1.5,z);parts.push(head);
    const g=group(L,parts);
    animHooks.push(now=>{const n=nightF(hourCur);swivel.visible=head.visible=n>0.25;beamM.opacity=0.16*n;swivel.rotation.y=now*0.00035;});
    return g;},
  screen(L,x,z){   // a blank public screen on a mast
    const g0=gh(x,z),parts=[],m=new THREE.MeshLambertMaterial({color:0x4a4a48});
    const faceM=new THREE.MeshBasicMaterial({color:0x22262b});
    parts.push(box(x-4,g0,z,1,14,1,m),box(x+4,g0,z,1,14,1,m));
    const face=box(x,g0+13,z,11,6.5,0.6,faceM);parts.push(face,box(x,g0+12.6,z-0.4,12,7.3,0.5,m));
    const g=group(L,parts);
    animHooks.push(now=>{const n=nightF(hourCur),f=0.06+0.5*n*(0.85+0.15*Math.sin(now*0.006));faceM.color.setRGB(f*0.55,f*0.72,f*0.9);});
    return g;},
  stacks(L,x,z){   // chimneys and a water tower over an industrial yard, with smoke
    const n=L.stacks||3,parts=[],m=new THREE.MeshLambertMaterial({color:0x8a7f70}),band=new THREE.MeshLambertMaterial({color:0xb04a3a});
    const puffs=[],smokeM=new THREE.MeshLambertMaterial({color:0xb8b4ae,transparent:true,opacity:0.32,depthWrite:false});
    for(let k=0;k<n;k++){const sx=x+(k-(n-1)/2)*26,sz=z+(k%2)*14,g0=gh(sx,sz),H=44+k*9;
      const st=new THREE.Mesh(new THREE.CylinderGeometry(2.6,4.4,H,12).translate(0,H/2,0),m);st.position.set(sx,g0,sz);parts.push(st);
      parts.push(box(sx,g0+H-6,sz,6.2,1.6,6.2,band));
      for(let q=0;q<3;q++){const p=new THREE.Mesh(new THREE.SphereGeometry(5,8,6),smokeM.clone());p.position.set(sx,g0+H,sz);p.userData.b=[sx,g0+H,sz,q/3+k*0.17];puffs.push(p);parts.push(p);}}
    const wx=x+40,wz=z-26,wg=gh(wx,wz);parts.push(box(wx,wg,wz,2,26,2,steelM));
    const tank=new THREE.Mesh(new THREE.CylinderGeometry(7,7,9,14).translate(0,4.5,0),m);tank.position.set(wx,wg+26,wz);parts.push(tank);
    const g=group(L,parts);
    animHooks.push(now=>{for(const p of puffs){const [bx,by,bz,ph]=p.userData.b,t=((now/9000)+ph)%1;p.position.set(bx+t*46,by+t*34,bz+t*10);p.scale.setScalar(1+t*3.4);p.material.opacity=0.3*(1-t);}});
    return g;},
  suspension(L,x,z){   // a suspension bridge: two towers, the main cable slung between them, and the hangers down to the deck
    const c=riverCrossing(L.name,x,z);if(!c)return null;const H=L.towerH||90,parts=[],m=new THREE.MeshLambertMaterial({color:0x8a8478});
    const cabM=new THREE.LineBasicMaterial({color:0xb0b4b8});
    const towers=[];
    for(const sd of [-1,1]){const tx=c.x+c.ux*sd*c.half*0.82,tz=c.z+c.uz*sd*c.half*0.82;towers.push([tx,tz]);
      for(const ss of [-1,1]){const px=tx-c.uz*ss*(c.w/2+2),pz=tz+c.ux*ss*(c.w/2+2);parts.push(box(px,0,pz,6,c.y+H,6,m));}
      for(const y of [c.y+H*0.55,c.y+H*0.85])parts.push(box(tx,y,tz,4,3,c.w+6,m).rotateY(-Math.atan2(c.uz,c.ux)));}
    // the cable: a parabola between the towers, with hangers dropping to the deck
    const pts=[];for(const ss of [-1,1]){const line=[];
      for(let k=-20;k<=20;k++){const t=k/20,cx2=c.x+c.ux*t*c.half*0.82,cz2=c.z+c.uz*t*c.half*0.82;
        const y=c.y+H*(0.18+0.82*t*t);line.push(new THREE.Vector3(cx2-c.uz*ss*(c.w/2+2),y,cz2+c.ux*ss*(c.w/2+2)));}
      parts.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(line),cabM));
      for(let k=-18;k<=18;k+=2){const t=k/20,cx2=c.x+c.ux*t*c.half*0.82,cz2=c.z+c.uz*t*c.half*0.82,y=c.y+H*(0.18+0.82*t*t);
        pts.push(new THREE.Vector3(cx2-c.uz*ss*(c.w/2+2),y,cz2+c.ux*ss*(c.w/2+2)),new THREE.Vector3(cx2-c.uz*ss*(c.w/2+2),c.y,cz2+c.ux*ss*(c.w/2+2)));}}
    parts.push(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),cabM));
    return group(L,parts);},
  liberty(L,x,z){   // she stands out in the harbour, on her pedestal, facing the sea
    const g0=0,parts=[],cop=new THREE.MeshLambertMaterial({color:0x6fae96}),stone=new THREE.MeshLambertMaterial({color:0x9a8e7c});
    parts.push(box(x,g0,z,28,14,28,stone),box(x,g0+14,z,20,27,20,stone));
    const body=new THREE.Mesh(new THREE.CylinderGeometry(3.4,7,33,10).translate(0,16.5,0),cop);body.position.set(x,g0+41,z);parts.push(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(2.6,10,8),cop);head.position.set(x,g0+77,z);parts.push(head);
    for(let k=0;k<7;k++){const a=k/7*Math.PI-Math.PI/2,sp=new THREE.Mesh(new THREE.ConeGeometry(0.5,6,4),cop);
      sp.position.set(x+Math.sin(a)*3.4,g0+81,z+Math.cos(a)*3.4);sp.rotation.set(Math.cos(a)*0.4,0,-Math.sin(a)*0.4);parts.push(sp);}
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(1,1.4,20,7),cop);arm.position.set(x+5,g0+70,z);arm.rotation.z=-0.32;parts.push(arm);
    const torch=new THREE.Mesh(new THREE.ConeGeometry(2.1,5,8),new THREE.MeshBasicMaterial({color:0xffd870}));torch.position.set(x+9,g0+82,z);parts.push(torch);
    const tab=new THREE.Mesh(new THREE.BoxGeometry(7,10,1.6),cop);tab.position.set(x-4.5,g0+62,z);tab.rotation.z=0.3;parts.push(tab);
    return group(L,parts);},
  wrigley(L,x,z){   // the red marquee at Clark and Addison, the hand-turned scoreboard over the centre-field bleachers, light towers; ivy on the outfield wall
    const parts=[],field=AREAS.find(a=>a.kind==='pitch'&&Math.hypot((a.bb.x0+a.bb.x1)/2-x,(a.bb.z0+a.bb.z1)/2-z)<150);
    const [mx,mz]=P(L.marquee||[41.94736,-87.65641]),gm=gh(mx,mz);parts.push(box(mx,gm+6,mz,0.6,4,11,redM),box(mx,gm,mz-4,0.5,6,0.5,steelM),box(mx,gm,mz+4,0.5,6,0.5,steelM));
    const [sx,sz]=P(L.scoreboard||[41.94886,-87.65461]),gs=gh(sx,sz);parts.push(box(sx,gs+12,sz,24,11,3,greenM),box(sx,gs+23,sz,3,5,2,greenM));
    const [cxx,czz]=field?[(field.bb.x0+field.bb.x1)/2,(field.bb.z0+field.bb.z1)/2]:[x,z];
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2+0.3,lx=cxx+Math.cos(a)*120,lz=czz+Math.sin(a)*105,gl=gh(lx,lz);parts.push(box(lx,gl,lz,1.2,40,1.2,steelM),box(lx,gl+40,lz,6,3,1,whiteM));}
    const g=group(L,parts);animHooks.push(()=>{const w=nightF(hourCur);redM.emissive.setRGB(0.3+0.5*w,0.02,0.02);});return g;},
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
