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
  // bridges drawn by OSM as road decks: find where the named road crosses the water, then add the structure there
  liftbridge(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const H=L.towerH||50,parts=[],m=new THREE.MeshLambertMaterial({color:0x5a6068});
    for(const sd of [-1,1]){const tx=c.x+c.ux*sd*c.half*0.35,tz=c.z+c.uz*sd*c.half*0.35;for(const ss of [-1,1]){parts.push(box(tx-c.uz*ss*(c.w/2+1),0,tz+c.ux*ss*(c.w/2+1),2.2,H,2.2,m));}
      parts.push(box(tx,H-2,tz,2.2,2.2,c.w+4,m).rotateY(-Math.atan2(c.uz,c.ux)));}
    const span=box(c.x,H*0.18,c.z,c.half*0.7,3,c.w+2,m);span.rotation.y=-Math.atan2(c.uz,c.ux);parts.push(span);return group(L,parts);},
  bascule(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const parts=[],m=new THREE.MeshLambertMaterial({color:0xc8bca8}),r=new THREE.MeshLambertMaterial({color:0x5a6a62});
    for(const sd of [-1,1])for(const ss of [-1,1]){const px=c.x+c.ux*sd*c.half*0.3-c.uz*ss*(c.w/2+4),pz=c.z+c.uz*sd*c.half*0.3+c.ux*ss*(c.w/2+4);parts.push(box(px,0,pz,8,16,8,m));const cap=new THREE.Mesh(new THREE.ConeGeometry(6,4,4).translate(0,2,0),r);cap.rotation.y=Math.PI/4;cap.position.set(px,16,pz);parts.push(cap);}
    return group(L,parts);},
  arch(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const H=L.archH||100,span=L.span||c.half*2,m=new THREE.MeshLambertMaterial({color:0x4f6a8a}),parts=[];
    for(const ss of [-1,1]){const a=new THREE.Mesh(new THREE.TorusGeometry(1,0.012,6,48,Math.PI),m);a.scale.set(span/2,H*0.55,span/2);a.position.set(c.x-c.uz*ss*(c.w/2),H*0.45,c.z+c.ux*ss*(c.w/2));a.rotation.y=-Math.atan2(c.uz,c.ux);parts.push(a);
      for(let k=-6;k<=6;k++){const t=k/7,hx=c.x+c.ux*t*span/2-c.uz*ss*(c.w/2),hz=c.z+c.uz*t*span/2+c.ux*ss*(c.w/2),hy=H*0.45+H*0.55*Math.sqrt(Math.max(0,1-t*t));parts.push(box(hx,H*0.45,hz,0.4,hy-H*0.45,0.4,m));}}
    const deck=box(c.x,H*0.42,c.z,span,2.5,c.w+2,m);deck.rotation.y=-Math.atan2(c.uz,c.ux);parts.push(deck);return group(L,parts);},
  cablestay(L,x,z){const c=riverCrossing(L.name,x,z);if(!c)return null;const H=L.towerH||55,m=new THREE.MeshLambertMaterial({color:0xe8e8e4}),cab=new THREE.LineBasicMaterial({color:0xd0d0d0}),parts=[];
    for(const sd of [-1,1]){const tx=c.x+c.ux*sd*c.half*0.4,tz=c.z+c.uz*sd*c.half*0.4;parts.push(box(tx,0,tz,3,H,3,m));
      const pts=[];for(let k=1;k<=10;k++)for(const dir of [-1,1])for(const ss of [-1,1]){const d=k*c.half*0.055;pts.push(new THREE.Vector3(tx,H-k*1.5,tz),new THREE.Vector3(tx+c.ux*dir*d-c.uz*ss*(c.w/2),8,tz+c.uz*dir*d+c.ux*ss*(c.w/2)));}
      parts.push(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),cab));}
    return group(L,parts);},
  sign(L,x,z){const top=roofAt(x,z)||15,neonR=new THREE.MeshBasicMaterial({color:0xff3a2a}),neonW=new THREE.MeshBasicMaterial({color:0xfff4d0}),frame=new THREE.MeshLambertMaterial({color:0x3a3a3a}),parts=[];
    const W=26,H=12;parts.push(box(x,top,z,0.6,H+4,0.6,frame),box(x-W*0.4,top,z,0.4,H,0.4,frame),box(x+W*0.4,top,z,0.4,H,0.4,frame));
    const face=box(x,top+2,z,W,H*0.55,0.5,frame);parts.push(face);const words=box(x,top+2+H*0.3,z+0.3,W*0.9,1.4,0.2,neonR),words2=box(x,top+2+H*0.1,z+0.3,W*0.6,1.2,0.2,neonW),stag=box(x-W*0.1,top+2+H*0.52,z+0.3,5,3,0.2,neonW);
    parts.push(words,words2,stag);const g=group(L,parts);g.rotation.y=0.35;animHooks.push(()=>{const on=nightF(hourCur)>0.35;neonR.color.setHex(on?0xff3a2a:0x6a2a24);neonW.color.setHex(on?0xfff4d0:0x8a8478);});return g;},
  gate(L,x,z){const red=new THREE.MeshLambertMaterial({color:0xb02a24}),roof=new THREE.MeshLambertMaterial({color:0x2a6a4a}),gold=new THREE.MeshLambertMaterial({color:0xd8b040}),parts=[];
    for(const s of [-1,1])parts.push(box(x+s*7,0,z,1.2,9,1.2,red));parts.push(box(x,7,z,17,1.2,1.4,gold));
    for(const [w,y] of [[20,9],[9,12],[6,14.5]]){const r=new THREE.Mesh(new THREE.BoxGeometry(w,0.8,3.2),roof);r.position.set(x,y,z);parts.push(r);}return group(L,parts);},
  submarine(L,x,z){let best=null;for(let a=0;a<6.28;a+=0.2)for(let d=40;d<220;d+=10){const px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(inWater(px,pz)&&inWater(px+40,pz)&&inWater(px-40,pz)){best=[px,pz];break;}}if(!best)return null;
    const hull=new THREE.Mesh(new THREE.CylinderGeometry(4,4,60,14),new THREE.MeshLambertMaterial({color:0x2a2e34}));hull.rotation.z=Math.PI/2;hull.position.set(best[0],0.8,best[1]);hull.scale.y=1;
    const sail=box(best[0]+8,2,best[1],7,6,2.4,new THREE.MeshLambertMaterial({color:0x2a2e34}));return group({name:'USS Blueback',info:'The USS Blueback (SS-581), the last diesel-electric submarine built for the US Navy, moored at OMSI.'},[hull,sail]);},
  tram(L,x,z){const [ux0,uz0]=P(L.upper),[lx0,lz0]=P(L.lower),uh=Math.max(roofAt(ux0,uz0),0)+(L.upperH||150)*0.45,parts=[],steel=new THREE.MeshLambertMaterial({color:0x8a9098});
    parts.push(box(ux0,0,uz0,8,uh,8,steel),box(lx0,0,lz0,10,14,10,steel));const tower=[(ux0*0.35+lx0*0.65),(uz0*0.35+lz0*0.65)];parts.push(box(tower[0],0,tower[1],3,uh*0.7,3,steel));
    const pts=[new THREE.Vector3(lx0,13,lz0),new THREE.Vector3(tower[0],uh*0.7,tower[1]),new THREE.Vector3(ux0,uh,uz0)];parts.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x303030})));
    const cabM=new THREE.MeshLambertMaterial({color:0xc8ccd0}),cabs=[0,1].map(()=>{const c=new THREE.Mesh(new THREE.BoxGeometry(6,3.5,4),cabM);parts.push(c);return c;});
    const at=u=>{const a=u<0.65?pts[0].clone().lerp(pts[1],u/0.65):pts[1].clone().lerp(pts[2],(u-0.65)/0.35);a.y-=3;return a;};
    const g=group(L,parts);animHooks.push(now=>{const t=(now/240000)%1,u=t<0.5?t*2:2-t*2;cabs[0].position.copy(at(u));cabs[1].position.copy(at(1-u));});return g;},
  mountain(L){   // far on the horizon, scaled so it looks the right size from the city: placed 22 km out along its true bearing
    const [mx,mz]=P(L.at),d=Math.hypot(mx,mz),k=22000/d,x=mx*k,z=mz*k,h=L.h*k,r=h*2.6,g=new THREE.ConeGeometry(r,h,48,6,true),v=g.attributes.position;
    for(let i=0;i<v.count;i++){const y=v.getY(i)/h+0.5,n=1+0.08*Math.sin(v.getX(i)*0.01+v.getZ(i)*0.013);v.setX(i,v.getX(i)*n);v.setZ(i,v.getZ(i)*n);if(L.crater&&y>0.88)v.setY(i,h*0.38);}
    g.computeVertexNormals();const rock=new THREE.MeshLambertMaterial({color:0x6a7288,fog:false}),snow=new THREE.MeshLambertMaterial({color:0xf4f6fa,fog:false});
    const base=new THREE.Mesh(g,rock);base.position.set(x,h/2-h*0.05,z);const capG=new THREE.ConeGeometry(r*0.38,h*0.38,36,2,true);const cap=new THREE.Mesh(capG,snow);cap.position.set(x,h-h*0.05-h*0.19+(L.crater?-h*0.08:0),z);cap.scale.set(1.02,1,1.02);
    const grp=group(L,[base,cap]);base.castShadow=cap.castShadow=false;return grp;},
  wrigley(L,x,z){   // the red marquee at Clark and Addison, the hand-turned scoreboard over the centre-field bleachers, light towers; ivy on the outfield wall
    const parts=[],field=AREAS.find(a=>a.kind==='pitch'&&Math.hypot((a.bb.x0+a.bb.x1)/2-x,(a.bb.z0+a.bb.z1)/2-z)<150);
    const [mx,mz]=P(L.marquee||[41.94736,-87.65641]);parts.push(box(mx,6,mz,0.6,4,11,redM),box(mx,0,mz-4,0.5,6,0.5,steelM),box(mx,0,mz+4,0.5,6,0.5,steelM));
    const [sx,sz]=P(L.scoreboard||[41.94886,-87.65461]);parts.push(box(sx,12,sz,24,11,3,greenM),box(sx,23,sz,3,5,2,greenM));
    const [cxx,czz]=field?[(field.bb.x0+field.bb.x1)/2,(field.bb.z0+field.bb.z1)/2]:[x,z];
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2+0.3,lx=cxx+Math.cos(a)*120,lz=czz+Math.sin(a)*105;parts.push(box(lx,0,lz,1.2,40,1.2,steelM),box(lx,40,lz,6,3,1,whiteM));}
    const g=group(L,parts);animHooks.push(()=>{const w=nightF(hourCur);redM.emissive.setRGB(0.3+0.5*w,0.02,0.02);});return g;},
};
// where a named bridge road crosses water: centre, direction along the bridge, half length over the water, road width
function riverCrossing(name,x,z){const rs=ROADS.filter(r=>r.name.toLowerCase().startsWith(name.toLowerCase())&&r.c!=='trail');const wet=[];let w=14,dir=null;
  for(const r of rs)for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L2=Math.hypot(bx-ax,bz-az);for(let u=0;u<=L2;u+=6){const px=ax+(bx-ax)*u/L2,pz=az+(bz-az)*u/L2;if(inWater(px,pz)){wet.push([px,pz]);w=Math.max(w,r.w);if(!dir)dir=[(bx-ax)/L2,(bz-az)/L2];}}}
  if(wet.length<3||!dir)return null;const cx=wet.reduce((s,p)=>s+p[0],0)/wet.length,cz=wet.reduce((s,p)=>s+p[1],0)/wet.length;let half=0;for(const [px,pz] of wet)half=Math.max(half,Math.abs((px-cx)*dir[0]+(pz-cz)*dir[1]));
  return {x:cx,z:cz,ux:dir[0],uz:dir[1],half,w:Math.min(w,30)};}
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
