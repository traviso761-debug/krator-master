// Silo 18: the outside. A dead plain in a shallow bowl, a hill between the silo and a ruined city on the horizon,
// a sky like dirty glass, dust. The field of fifty silos under it, shown when the ground is made see-through.
// All of it this project's own: the setting's premise, drawn from scratch.
import {mkRng,makeNoise,smooth} from '../core/rng.js';
import {LH,RO,NL,yL} from './levels.js';

export const HILL={x:-430,z:-640};                 // the crest the screen looks at
export const EXIT={a:Math.PI,r:110};             // where the airlock's ramp comes up
export const SENSOR={x:0,z:-9};                  // the camera housing on the silo's cap
export const RC=85;                              // the cut in the ground round the silo
const TAU=Math.PI*2;

export function buildOutside(api,M){
  const {THREE,scene}=api,R=mkRng(1818),N=makeNoise(mkRng(18));
  const out={layer1:[],surface:[]},L1=o=>{o.layers.enable(1);out.layer1.push(o);return o;};
  const ground=(x,z)=>{const r=Math.hypot(x,z),hill=60*Math.exp(-((x-HILL.x)**2/300**2+(z-HILL.z-60)**2/230**2));
    return 16*smooth(260,1700,r)+hill+(noise(x,z)*4.5+noise(x*4.3+77,z*4.3-31)*1.2)*smooth(100,380,r);};
  // value noise round 0, about -1..1
  function noise(x,z){return (N.fbm(x/180,z/180)/0.875-0.5)*2;}
  out.ground=ground;

  // ---- the sky: a dome, brown-grey at the horizon, a little darker up high ----
  {const g=new THREE.SphereGeometry(30000,32,16),col=new Float32Array(g.attributes.position.count*3),lo=new THREE.Color('#8b8070'),hi=new THREE.Color('#4c4844'),c=new THREE.Color();
    for(let i=0;i<g.attributes.position.count;i++){const y=g.attributes.position.getY(i)/30000;c.copy(lo).lerp(hi,smooth(0,0.6,y));col.set([c.r,c.g,c.b],i*3);}
    g.setAttribute('color',new THREE.BufferAttribute(col,3));
    const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false});
    const sky=new THREE.Mesh(g,m);sky.renderOrder=-10;sky.frustumCulled=false;sky.userData.noWire=true;scene.add(L1(sky));out.sky=sky;}

  // ---- the ground: a grid that is fine near the silo and coarse at the horizon; the silo is under it, roof and all ----
  {const S=200,sp=u=>Math.sign(u)*14000*(0.1*Math.abs(u)+0.9*Math.abs(u)**3),pos=[],col=[],idx=[],c=new THREE.Color(),a=new THREE.Color('#6a5f52'),b=new THREE.Color('#857a68'),d=new THREE.Color('#4e4840');
    for(let j=0;j<=S;j++)for(let i=0;i<=S;i++){const x=sp(i/S*2-1),z=sp(j/S*2-1),y=ground(x,z),n=noise(x*3,z*3);
      pos.push(x,y,z);c.copy(a).lerp(b,0.5+0.5*n).lerp(d,smooth(0.2,0.9,Math.abs(noise(x*0.4+300,z*0.4)))*0.5);col.push(c.r,c.g,c.b);}
    for(let j=0;j<S;j++)for(let i=0;i<S;i++){const p=j*(S+1)+i,x=(pos[p*3]+pos[(p+S+2)*3])/2,z=(pos[p*3+2]+pos[(p+S+2)*3+2])/2;
      idx.push(p,p+S+1,p+1,p+1,p+S+1,p+S+2);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,clippingPlanes:M.clip});const t=new THREE.Mesh(g,m);t.userData.info={name:'The outside',info:'Grey-brown dirt in every direction, nothing growing, the air thick with dust. Silo 18 sits in a shallow bowl; nobody inside has stood out here and come back.'};
    scene.add(L1(t));out.terrain=t;out.surface.push(t);}
  // the rock round the silo, seen from inside, so the near half of it is the cut
  {const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#5b5246';x.fillRect(0,0,256,256);
    for(let i=0;i<2400;i++){const l=55+R()*60;x.fillStyle=`rgba(${l+18|0},${l+8|0},${l|0},${0.1+R()*0.25})`;x.fillRect(R()*256,R()*256,2+R()*16,1+R()*5);}
    // stones and pockets, then a few faint wavy beds (wrapping, so the tiles meet)
    for(let i=0;i<700;i++){const l=40+R()*90,r=1+R()**2*7,px=R()*256,py=R()*256;x.fillStyle=`rgba(${l+20|0},${l+12|0},${l|0},${0.25+R()*0.5})`;
      for(const dx of [-256,0,256])for(const dy of [-256,0,256]){x.beginPath();x.ellipse(px+dx,py+dy,r*(1+R()),r,R()*3,0,Math.PI*2);x.fill();}}
    for(let b=0;b<5;b++){const y0=R()*256,amp=2+R()*5,ph=R()*6,th=2+R()*6;x.fillStyle=`rgba(${R()<0.5?'30,24,18':'150,130,105'},${0.08+R()*0.1})`;
      for(let u=0;u<256;u+=2)x.fillRect(u,(y0+Math.sin(u/256*Math.PI*2*(1+(b%3))+ph)*amp+256)%256,2,th);}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(10,24);out.rockTex=t;
    const m=new THREE.MeshLambertMaterial({map:t,color:'#a09080',side:THREE.DoubleSide,clippingPlanes:M.clip});
    const SH=616;const sh=new THREE.Mesh(new THREE.CylinderGeometry(RC,RC,SH,64,1,true),m);sh.position.y=-SH/2;scene.add(sh);out.shell=sh;
    const fl=new THREE.Mesh(new THREE.CircleGeometry(RC,64).rotateX(-Math.PI/2),m);fl.position.y=-SH;scene.add(fl);out.shellFloor=fl;}

  // ---- the strata the section is cut through: the canvas's top is the surface, its bottom 1500 m down. Beds of
  //      dirt, clay, sandstone, shale and conglomerate with wavy bounds, darker with depth, flecked with stones ----
  {const W=256,Hh=1024,c=document.createElement('canvas');c.width=W;c.height=Hh;const x=c.getContext('2d');
    const beds=[];let y=0;const cols=[[74,58,44],[92,74,54],[60,50,42],[104,84,60],[52,46,42],[80,66,50],[66,54,46],[96,80,62],[46,42,40],[72,60,52]];
    beds.push({y0:0,col:[40,32,26]});y=6;
    while(y<Hh){const th=8+R()**1.5*70,cc=cols[(R()*cols.length)|0],dk=0.62-0.22*(y/Hh);beds.push({y0:y,col:cc.map(v=>v*dk),amp:1+R()*6,f:1+((R()*3)|0),ph:R()*6});y+=th;}
    for(let i=0;i<beds.length;i++){const b=beds[i],nb=beds[i+1];
      for(let u=0;u<W;u+=2){const top=b.y0+(b.amp?Math.sin(u/W*Math.PI*2*b.f+b.ph)*b.amp:0),bot=nb?nb.y0+Math.sin(u/W*Math.PI*2*nb.f+nb.ph)*nb.amp:Hh;
        x.fillStyle=`rgb(${b.col[0]|0},${b.col[1]|0},${b.col[2]|0})`;x.fillRect(u,top,2,bot-top+1);}}
    for(let i=0;i<9000;i++){const px=R()*W,py=R()*Hh,l=(R()-0.5)*50;x.fillStyle=`rgba(${90+l|0},${78+l|0},${66+l|0},${0.06+R()*0.12})`;x.fillRect(px,py,1+R()*3,1+R()*2);}
    for(let i=0;i<500;i++){const px=R()*W,py=R()*Hh,r=0.8+R()*2.4;x.fillStyle=`rgba(${30+R()*40|0},${26+R()*30|0},${22+R()*20|0},${0.3+R()*0.4})`;x.beginPath();x.ellipse(px,py,r*1.6,r,0,0,Math.PI*2);x.fill();}
    const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;out.strataTex=t;}

  // ---- on the cap: the sensor housing (its lenses toward the hill) and the airlock's exit ----
  {const k=M.K.kit(),{G}=M.K,K2=M.K;
    // the cap: a concrete disc flush with the dirt, dusted over, with a lip
    k.add('out',G.disc,'#77706a',0,0.35,0,{sx:RO+2,sy:0.5,sz:RO+2});k.add('out',K2.ring(RO+1.2,RO+2.6,0.5,64),'#5e5852',0,0.4,0);
    k.add('out',G.sph,'#7e786c',SENSOR.x,0,SENSOR.z,{sx:6,sy:3.4,sz:6});
    // the sensor mast: a lattice pole with a crossarm, a box of instruments and a wind vane
    {const mx=SENSOR.x+9,mz=SENSOR.z+4;for(const [dx,dz] of [[-0.4,-0.4],[0.4,-0.4],[0.4,0.4],[-0.4,0.4]])k.add('out',G.box,'#5a5048',mx+dx,7,mz+dz,{sx:0.12,sy:14,sz:0.12});
      for(let h=1;h<14;h+=1.6)k.add('out',G.box,'#5a5048',mx,h,mz,{sx:0.9,sy:0.08,sz:0.9,ry:h});
      k.add('out',G.box,'#5a5048',mx,13.6,mz,{sx:5,sy:0.15,sz:0.15});k.add('out',G.box,'#6a6660',mx-2.2,13.0,mz,{sx:0.7,sy:0.9,sz:0.6});k.add('out',G.box,'#6a6660',mx+2.2,13.0,mz,{sx:0.6,sy:0.6,sz:0.6});
      k.add('out',G.cone,'#4a4440',mx,14.6,mz,{sx:0.25,sy:1.2,sz:0.25});k.add('out',G.box,'#4a4440',mx+0.6,14.4,mz,{sx:1.4,sy:0.05,sz:0.3});}
    for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*0.35,x=SENSOR.x+Math.cos(a)*5.2,z=SENSOR.z+Math.sin(a)*5.2;k.add('out',G.cyl,'#1d1f22',x,1.6,z,{rx:Math.PI/2,ry:-a-Math.PI/2,sx:0.45,sy:0.6,sz:0.45});}
    const a=EXIT.a,c=Math.cos(a),s=Math.sin(a),r=EXIT.r;
    k.add('out',G.box,'#77716a',c*r,1.8,s*r,{ry:-a,sx:8,sy:3.6,sz:7});k.add('out',G.box,'#2e2c2a',c*(r+4.05),1.5,s*(r+4.05),{ry:-a,sx:0.1,sy:2.8,sz:3.2});
    for(let i=0;i<9;i++){const b=i/9*TAU;k.add('out',G.box,'#5a5650',Math.cos(b)*(RC-2),0.3,Math.sin(b)*(RC-2),{ry:-b,sx:2,sy:0.6,sz:1});}
    const geo=k.build().out,m=new THREE.MeshLambertMaterial({vertexColors:true,clippingPlanes:M.clip});const mesh=new THREE.Mesh(geo,m);scene.add(L1(mesh));
    mesh.userData.info={name:'The sensors and the exit',info:'A squat housing on the cap holds the cameras that feed the cafeteria\'s screen. Their lenses face the hill. The low block beside it is where the airlock\'s ramp comes up: the one door out.'};out.housing=mesh;
    // each part sits on the dirt, not under it
    const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);if(Math.hypot(x,z)>RC-6)p.setY(i,p.getY(i)+ground(x,z));}geo.computeBoundingSphere();}

  // ---- rubble and dead trees ----
  {const n=520,g=new THREE.DodecahedronGeometry(1,0),m=new THREE.MeshLambertMaterial({color:'#6a6156',clippingPlanes:M.clip}),im=new THREE.InstancedMesh(g,m,n),o=new THREE.Object3D();
    for(let i=0;i<n;i++){let x,z;do{const r=RC+20+R()**0.6*2600,a=R()*TAU;x=Math.cos(a)*r;z=Math.sin(a)*r;}while(false);const s=0.4+R()**3*3;
      o.position.set(x,ground(x,z)+s*0.3,z);o.rotation.set(R()*3,R()*3,R()*3);o.scale.set(s*(0.7+R()*0.6),s*(0.4+R()*0.4),s);o.updateMatrix();im.setMatrixAt(i,o.matrix);}
    scene.add(L1(im));out.surface.push(im);
    const k=M.K.kit();for(let i=0;i<26;i++){const r=300+R()*1800,a=R()*TAU,x=Math.cos(a)*r,z=Math.sin(a)*r,y=ground(x,z),h=4+R()*6;
      k.pipe('t','#3a3330',x,y,z,x+(R()-0.5)*1.4,y+h,z+(R()-0.5)*1.4,0.18+R()*0.12);
      for(let b=0;b<3;b++){const t=0.4+R()*0.5,bx=x,by=y+h*t,bz=z,ba=R()*TAU,bl=1+R()*2.6;k.pipe('t','#3a3330',bx,by,bz,bx+Math.cos(ba)*bl,by+bl*0.5,bz+Math.sin(ba)*bl,0.07);}}
    const tm=new THREE.Mesh(k.build().t,new THREE.MeshLambertMaterial({vertexColors:true,clippingPlanes:M.clip}));scene.add(L1(tm));out.surface.push(tm);}

  // ---- the lone dead tree on the hill's crest, and rusted wreckage: a car's shell on its roof, a tank, beams, drums ----
  {const k=M.K.kit(),{G}=M.K,tx=HILL.x+20,tz=HILL.z+30,ty=ground(tx,tz);
    k.pipe('w','#2e2826',tx,ty-0.5,tz,tx+0.8,ty+13,tz-0.4,0.6);
    const br=(x0,y0,z0,a,l,up,r,dep)=>{const x1=x0+Math.cos(a)*l,z1=z0+Math.sin(a)*l,y1=y0+l*up;k.pipe('w','#2e2826',x0,y0,z0,x1,y1,z1,r);
      if(dep>0)for(let q=0;q<2;q++)br(x1,y1,z1,a+(q?0.6:-0.7)+R()*0.3,l*0.62,up+0.15,r*0.6,dep-1);};
    for(let b=0;b<5;b++)br(tx+0.5,ty+5.5+b*1.6,tz-0.2,b*1.3+R(),3.8-b*0.35,0.35,0.24,2);
    const rust=['#6a3a22','#7a4428','#5a3020','#8a5030'];
    for(let i=0;i<34;i++){const a=R()*TAU,r=160+R()**0.7*1700,x=Math.cos(a)*r,z=Math.sin(a)*r,y=ground(x,z),c=rust[i%4],ry=R()*3;
      if(i%5===0){k.add('w',G.box,c,x,y+0.6,z,{ry,sx:4.2,sy:1.0,sz:1.8,rz:Math.PI});k.add('w',G.box,c,x,y+1.2,z,{ry,sx:2.4,sy:0.6,sz:1.6,rz:Math.PI});}
      else if(i%5===1){k.add('w',G.cyl,c,x,y+1.0,z,{rz:Math.PI/2,ry,sx:1.1,sy:4.5,sz:1.1});}
      else if(i%5===2){for(let q=0;q<3;q++)k.add('w',G.box,c,x+q*0.4,y+0.2+q*0.15,z,{ry:ry+q*0.4,rz:0.12*q,sx:6+q,sy:0.3,sz:0.3});}
      else k.add('w',G.cyl,c,x,y+0.45,z,{sx:0.45,sy:0.9,sz:0.45,rx:i%2?Math.PI/2:0,ry});}
    const wm=new THREE.Mesh(k.build().w,new THREE.MeshLambertMaterial({vertexColors:true,clippingPlanes:M.clip}));scene.add(L1(wm));out.surface.push(wm);}

  // ---- wind-blown dust: big soft veils drifting low over the plain, always; thicker in a storm ----
  {const c=document.createElement('canvas');c.width=128;c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(64,32,4,64,32,62);
    g.addColorStop(0,'rgba(170,150,120,0.55)');g.addColorStop(0.5,'rgba(160,140,112,0.22)');g.addColorStop(1,'rgba(150,130,100,0)');x.fillStyle=g;x.fillRect(0,0,128,64);
    const tex=new THREE.CanvasTexture(c),veils=[];
    for(let i=0;i<40;i++){const m=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:0.35,fog:true});const sp=new THREE.Sprite(m);
      const a=R()*TAU,r=60+R()**0.6*1600;sp.position.set(Math.cos(a)*r,0,Math.sin(a)*r);const w=120+R()*260;sp.scale.set(w,w*0.22,1);sp.userData.h=6+R()*18;sp.userData.v=6+R()*8;
      sp.userData.noWire=true;scene.add(L1(sp));veils.push(sp);out.surface.push(sp);}
    out.veils={list:veils,tick(dt,st){for(const sp of veils){const p=sp.position;p.x+=dt*sp.userData.v*(1+3*st);if(p.x>1700)p.x-=3400;p.y=ground(p.x,p.z)+sp.userData.h;sp.material.opacity=0.28+0.5*st;}}};}

  // ---- the city on the horizon: towers broken off, the same colour as the haze ----
  {const k=M.K.kit(),{G}=M.K;
    for(let i=0;i<150;i++){const x=(R()-0.5)*11000,z=-9800-R()**0.8*3200,w=35+R()*70,d=35+R()*70,h=(50+R()**2*380)*(1-Math.abs(x)/9000),y=ground(x,z)-2;
      if(h<30)continue;const col=['#5f5a55','#56524e','#66605a','#4e4b48'][i%4];
      k.add('c',G.box,col,x,y+h/2,z,{ry:R()*0.6,sx:w,sy:h,sz:d});
      if(R()<0.6){const ch=h*(0.08+R()*0.15);k.add('c',G.box,col,x+(R()-0.5)*w*0.4,y+h+ch*0.4,z,{ry:R(),rz:(R()-0.5)*0.7,sx:w*(0.3+R()*0.4),sy:ch,sz:d*0.6});}
      if(R()<0.15){k.add('c',G.cyl6,'#4a4642',x,y+h+20,z,{sx:2,sy:40,sz:2});}}
    const m=new THREE.MeshLambertMaterial({vertexColors:true});const city=new THREE.Mesh(k.build().c,m);
    city.userData.info={name:'The city',info:'Towers on the horizon, their tops broken, past the hill. They are the only sign that anyone ever lived up here. From the cafeteria they are a grey smudge on the screen.'};
    scene.add(L1(city));out.city=city;out.surface.push(city);}
  // the hill, for its card
  {const p=new THREE.Mesh(new THREE.SphereGeometry(300,12,8),new THREE.MeshBasicMaterial({visible:false}));p.position.set(HILL.x,ground(HILL.x,HILL.z)-240,HILL.z);
    p.userData.info={name:'The hill',info:'The rise between the silo and the city, and the place the screen is aimed at. Those sent out to clean the lenses walk toward it when they are done.'};scene.add(p);out.hill=p;}

  // ---- the field: fifty silos under the plain in a regular grid, ten by five, numbered row by row. Shown as a
  //      block of ground cut out of the plain: its far walls and floor in section, the surface a thin see-through
  //      slab, every silo's cap flush with the dirt ----
  {const NC=10,NR=5,SP=420,list=[];
    for(let r=0;r<NR;r++)for(let c=0;c<NC;c++)list.push({n:r*NC+c+1,x:c*SP,z:r*SP});
    const me=list.find(s=>s.n===18),mx=me.x,mz=me.z;for(const s of list){s.x-=mx;s.z-=mz;}
    out.silos=list;
    const cx=(list[0].x+list[NC-1].x)/2,cz=(list[0].z+list[list.length-1].z)/2,W=(NC-1)*SP+700,Dd=(NR-1)*SP+700,DEP=700;
    out.fieldCentre={x:cx,z:cz};
    const field=new THREE.Group(),o=new THREE.Object3D();
    // the block: its floor, and four walls of which only those beyond the field from the camera are drawn (the page
    // turns them each frame), so it reads as a block cut out of the ground with the near sides taken away
    {const t=out.strataTex.clone();t.needsUpdate=true;t.wrapS=THREE.RepeatWrapping;t.repeat.set(4,DEP/1500);t.offset.set(0,1-DEP/1500);
      const wm=new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}),walls=[];
      const wall=(w,x,z,ry,nx,nz)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,DEP),wm);m.position.set(x,-DEP/2,z);m.rotation.y=ry;m.userData.side={x,z,nx,nz};field.add(m);walls.push(m);};
      wall(W,cx,cz-Dd/2,0,0,1);wall(W,cx,cz+Dd/2,Math.PI,0,-1);wall(Dd,cx-W/2,cz,Math.PI/2,1,0);wall(Dd,cx+W/2,cz,-Math.PI/2,-1,0);
      const fl=new THREE.Mesh(new THREE.PlaneGeometry(W,Dd).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:'#2e2620'}));fl.position.set(cx,-DEP,cz);field.add(fl);
      out.fieldWalls=cam=>{for(const m of walls){const q=m.userData.side;m.visible=(cam.x-q.x)*q.nx+(cam.z-q.z)*q.nz>0;}};
      const slab=new THREE.Mesh(new THREE.BoxGeometry(W,8,Dd),new THREE.MeshLambertMaterial({color:'#8a7a62',transparent:true,opacity:0.45,depthWrite:false}));slab.position.set(cx,-4,cz);slab.renderOrder=5;field.add(slab);
      const rim=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W,8,Dd)),new THREE.LineBasicMaterial({color:'#2a2018'}));rim.position.copy(slab.position);field.add(rim);
      const rim2=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W,DEP,Dd)),new THREE.LineBasicMaterial({color:'#4a3a2c',transparent:true,opacity:0.5}));rim2.position.set(cx,-DEP/2,cz);field.add(rim2);}
    const others=list.filter(s=>s.n!==18),m=new THREE.MeshLambertMaterial({color:'#9a958c',side:THREE.DoubleSide}),fm=new THREE.MeshLambertMaterial({color:'#7d786f'});
    const wall=new THREE.InstancedMesh(new THREE.CylinderGeometry(RO+1.6,RO+1.6,616,32,1,true),m,others.length);
    others.forEach((s,i)=>{o.position.set(s.x,-314,s.z);o.updateMatrix();wall.setMatrixAt(i,o.matrix);});
    const FL=18,floors=new THREE.InstancedMesh(new THREE.RingGeometry(11,RO,32,1).rotateX(-Math.PI/2),fm,others.length*FL),col=new THREE.InstancedMesh(new THREE.CylinderGeometry(9,9,610,10,1,true),new THREE.MeshLambertMaterial({color:'#4a4c50'}),others.length);
    let k=0;others.forEach((s,i)=>{for(let f=0;f<FL;f++){o.position.set(s.x,yL(1+f*8),s.z);o.updateMatrix();floors.setMatrixAt(k++,o.matrix);}o.position.set(s.x,-314,s.z);o.updateMatrix();col.setMatrixAt(i,o.matrix);});
    const caps=new THREE.InstancedMesh(new THREE.CircleGeometry(RO+3,40).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:'#4e4840'}),list.length);
    list.forEach((s,i)=>{o.position.set(s.x,0.6,s.z);o.updateMatrix();caps.setMatrixAt(i,o.matrix);});
    field.add(wall,floors,col,caps);for(const x of [wall,floors,col,caps])x.frustumCulled=false;
    // the marks: Silo 18 (this one) and Silo 1, the founding silo, each with a ring on its cap and its name
    const label=(text,colr)=>{const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.font='bold 64px Georgia,serif';x.textAlign='center';x.textBaseline='middle';
      x.lineWidth=10;x.strokeStyle='rgba(0,0,0,0.7)';x.strokeText(text,256,64);x.fillStyle=colr;x.fillText(text,256,64);
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,fog:false,transparent:true}));sp.scale.set(800,200,1);sp.renderOrder=20;return sp;};
    const mark=(s,colr,text)=>{const r=new THREE.Mesh(new THREE.TorusGeometry(RO+18,7,6,64).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:colr,fog:false}));r.position.set(s.x,2,s.z);
      const sp=label(text,colr);sp.position.set(s.x,230,s.z);field.add(r,sp);
      const g=new THREE.Mesh(new THREE.CylinderGeometry(RO+2.5,RO+2.5,616,32,1,true),new THREE.MeshBasicMaterial({color:colr,transparent:true,opacity:0.18,depthWrite:false,side:THREE.DoubleSide,fog:false}));g.position.set(s.x,-314,s.z);field.add(g);};
    mark(me,'#ffc060','SILO 18');mark(list[0],'#a8d8ff','SILO 1');
    field.visible=false;scene.add(field);out.field=field;
    // the pick for the field: the block
    const fp=new THREE.Mesh(new THREE.BoxGeometry(W,DEP,Dd),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));fp.position.set(cx,-DEP/2,cz);
    fp.userData.info={name:'The field of silos',info:'Fifty silos in a grid of ten by five under the plain, about four hundred metres apart, Silo 18 one among them. Each is the same buried cylinder of levels round its own stair. Silo 1, the founding silo, is marked in blue; people in the others need never learn the rest exist.'};
    out.fieldPick=fp;}

  // ---- the dust: a storm is fog that closes in, and grit blowing past the camera ----
  {const n=2400,g=new THREE.BufferGeometry(),p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=(R()-0.5)*400;p[i*3+1]=R()*60;p[i*3+2]=(R()-0.5)*400;}
    g.setAttribute('position',new THREE.BufferAttribute(p,3));
    const m=new THREE.PointsMaterial({color:'#9a8a70',size:0.9,transparent:true,opacity:0,depthWrite:false});const pts=new THREE.Points(g,m);pts.frustumCulled=false;pts.userData.noWire=true;
    scene.add(L1(pts));out.dust=pts;}
  return out;
}
