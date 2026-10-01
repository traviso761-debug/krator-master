// ---------- the working station ----------
// Original work. What a station on the ice does all day, besides stand there:
//
//   the steam line    the bore's hot water comes back to the habitat in an insulated pipe on trestles, clear of
//                     the ice for the same reason everything else is
//   the dishes        three of them, on alt-az mounts, following Earth - which from Jupiter is never more than
//                     twelve degrees from the sun, so they follow the sun, and stow pointing up at night
//   the travelling    the derrick's block rides up and down its cable as the string goes in and out of the hole
//     block
//   the seismometers  out on the ice in a ring, listening to the tides crack it; each has a light that blinks
//                     when it reports
//   survey stakes     orange, round the edge of the chaos, where the ice is watched for movement
//   pad beacons       red, chasing round each pad
//   the crew          people in suits, crossing between the buildings. The gravity is an eighth of Earth's,
//                     so nobody walks: they lope, in long low bounds, and a suit lamp bobs with each one
import { mkRng } from '../core/rng.js';

export function details(api){
  const {THREE,C,ctx,scene,animHooks,groundH,mergeParts,ENV}=api;
  const I=ctx.europaIce;if(!I)return;
  const R=mkRng(4507);
  const M=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{}));
  const steel=M(0x6e767d),hull=M(0xa4adb4),foil=new THREE.MeshPhongMaterial({color:0xd6ae52,specular:0xfff0c0,shininess:70,flatShading:true});
  const byMat=new Map(),add=m=>{if(!byMat.has(m.material))byMat.set(m.material,[]);byMat.get(m.material).push(m);return m;};
  const piece=(geo,mat,x,y,z,ry,rx,rz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0,'YXZ');return add(m);};

  // ---- the steam line: bore to hub, beside the road, on trestles ----
  {const [bx,bz]=I.sites.bore,pts=[[bx-20,bz+14],[260,-126],[40,-10]];
   for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[cx,cz]=pts[i+1],L=Math.hypot(cx-ax,cz-az),a=Math.atan2(cz-az,cx-ax),n=Math.ceil(L/18);
     for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,x=ax+(cx-ax)*(t0+t1)/2,z=az+(cz-az)*(t0+t1)/2,y=groundH(x,z)+2.8;
       piece(new THREE.CylinderGeometry(0.9,0.9,L/n+0.2,10).rotateZ(Math.PI/2),foil,x,y,z,-a);
       const tx=ax+(cx-ax)*t0,tz=az+(cz-az)*t0,ty=groundH(tx,tz);
       for(const sd of [-1,1])piece(new THREE.BoxGeometry(0.25,2.6,0.25).translate(0,1.3,0),steel,tx-Math.sin(a)*sd*0.9,ty,tz+Math.cos(a)*sd*0.9,-a,0,sd*0.25);
       piece(new THREE.BoxGeometry(0.3,0.3,2.6),steel,tx,ty+2,tz,-a);}}}

  // ---- the seismometers, and the survey stakes round the chaos ----
  const blinkers=[];
  for(let k=0;k<9;k++){const a=k/9*Math.PI*2+0.3,d=900+R()*1500,x=Math.cos(a)*d,z=Math.sin(a)*d,g=groundH(x,z);
    for(let j=0;j<3;j++){const aa=j/3*Math.PI*2;piece(new THREE.BoxGeometry(0.12,1.6,0.12).translate(0,0.8,0),steel,x+Math.cos(aa)*0.7,g,z+Math.sin(aa)*0.7,0,Math.sin(aa)*0.35,-Math.cos(aa)*0.35);}
    piece(new THREE.CylinderGeometry(0.5,0.5,0.6,10),foil,x,g+1.5,z);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.35,8,6),new THREE.MeshBasicMaterial({color:0x7dff9a}));lamp.position.set(x,g+2,z);lamp.userData.noWire=true;scene.add(lamp);
    blinkers.push({m:lamp,ph:R()*10,per:4+R()*3});}
  {const [cx,cz,cr]=I.sites.chaos,n=180,m=new THREE.InstancedMesh(new THREE.BoxGeometry(0.15,2.2,0.15).translate(0,1.1,0),M(0xe0662a),n),o=new THREE.Object3D();
   for(let i=0;i<n;i++){const a=R()*Math.PI*2,d=cr*(0.62+R()*0.2),x=cx+Math.cos(a)*d*1.25,z=cz+Math.sin(a)*d;o.position.set(x,groundH(x,z),z);o.rotation.set((R()-0.5)*0.1,0,(R()-0.5)*0.1);o.updateMatrix();m.setMatrixAt(i,o.matrix);}
   scene.add(m);}

  // ---- the pad beacons ----
  const beacons=[];
  {const [px0,pz0]=I.sites.pads,A=0.4;const bm=new THREE.MeshBasicMaterial({color:0xff3a2a});
   for(let k=0;k<4;k++){const a=A+k/4*Math.PI*2+0.4,px=px0+Math.cos(a)*210,pz=pz0+Math.sin(a)*210;
     for(let j=0;j<8;j++){const aa=j/8*Math.PI*2,x=px+Math.cos(aa)*56,z=pz+Math.sin(aa)*56;
       const b=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,6),bm);b.position.set(x,groundH(x,z)+4.3,z);b.userData.noWire=true;scene.add(b);beacons.push({m:b,j});}}}

  // ---- the station's modules, tanks and garage ----
  // Pressurised cylinders on legs, domed at the ends, banded, with an airlock on the side and a strip of
  // windows; the labs carry a radiator on the roof. The tanks stand on legs too. The garage is a long arched
  // shed, the one thing here that is not pressurised, open-ended for the rovers.
  {const glass=new THREE.MeshBasicMaterial({color:0xffcf88}),dark=M(0x3e454b),white=M(0xd8dde1);
   for(const [x,z,L,W,a,kind] of (I.station||[])){const g=groundH(x,z),ta=a+Math.PI/2,c=Math.cos(ta),s2=Math.sin(ta);
     const P=(u,v)=>[x+c*u-s2*v,z+s2*u+c*v];
     if(kind==='tank'){const r=L/2,h=W;for(let k=0;k<4;k++){const [lx,lz]=[x+Math.cos(k*1.57+0.4)*r*0.8,z+Math.sin(k*1.57+0.4)*r*0.8];piece(new THREE.BoxGeometry(0.5,2.2,0.5).translate(0,1.1,0),steel,lx,g,lz);}
       piece(new THREE.CylinderGeometry(r,r,h,16).translate(0,h/2+2.2,0),white,x,g,z);piece(new THREE.SphereGeometry(r,16,8,0,Math.PI*2,0,Math.PI/2),white,x,g+2.2+h,z);
       for(const f of [0.3,0.7])piece(new THREE.CylinderGeometry(r+0.15,r+0.15,0.5,16),steel,x,g+2.2+h*f,z);continue;}
     if(kind==='garage'){const r=W/2;
       piece(new THREE.CylinderGeometry(r,r,L,20,1,true,0,Math.PI).rotateZ(Math.PI/2).rotateX(Math.PI/2).translate(0,1.5,0),M(0xa9b1b7,{side:THREE.DoubleSide}),x,g,z,-ta);
       piece(new THREE.BoxGeometry(L,1.5,W).translate(0,0.75,0),dark,x,g,z,-ta);
       for(let k=0;k<8;k++){const [rx,rz]=P(-L/2+k*L/7,0);piece(new THREE.TorusGeometry(r+0.2,0.35,4,16,Math.PI).rotateY(Math.PI/2).translate(0,1.5,0),steel,rx,g,rz,-ta);}
       const [ex,ez]=P(L/2+0.2,0);piece(new THREE.CircleGeometry(r*0.9,16,0,Math.PI).rotateY(Math.PI/2).translate(0,1.5,0),dark,ex,g,ez,-ta);
       continue;}
     const r=Math.min(W,10)/2,len=Math.max(8,L-2*r),y=g+2.2+r;
     for(const u of [-len*0.4,0,len*0.4])for(const v of [-r*0.7,r*0.7]){const [lx,lz]=P(u,v);piece(new THREE.BoxGeometry(0.45,2.2+r*0.4,0.45).translate(0,(2.2+r*0.4)/2,0),steel,lx,g,lz);}
     piece(new THREE.CylinderGeometry(r,r,len,14).rotateZ(Math.PI/2),hull,x,y,z,-ta);
     for(const sd of [-1,1]){const [ex,ez]=P(sd*len/2,0);piece(new THREE.SphereGeometry(r,14,8,0,Math.PI*2,0,Math.PI/2).rotateZ(-sd*Math.PI/2),hull,ex,y,ez,-ta);}
     for(let k=1;k<4;k++){const [bx,bz]=P(-len/2+k*len/4,0);piece(new THREE.CylinderGeometry(r+0.12,r+0.12,0.5,14).rotateZ(Math.PI/2),steel,bx,y,bz,-ta);}
     {const [wx,wz]=P(0,r*0.97);piece(new THREE.BoxGeometry(len*0.6,0.7,0.2),glass,wx,y+r*0.25,wz,-ta);}         // the window strip
     {const [ax2,az2]=P(len*0.2,-r-1.6);piece(new THREE.BoxGeometry(3.4,3.6,3.2),hull,ax2,y-0.4,az2,-ta);          // the airlock, and its door
      const [dx,dz]=P(len*0.2,-r-3.25);piece(new THREE.BoxGeometry(1.4,2.2,0.15),dark,dx,y-0.8,dz,-ta);}
     {const [mx,mz]=P(-len*0.35,0);piece(new THREE.CylinderGeometry(0.1,0.1,5,5).translate(0,2.5,0),steel,mx,y+r,mz);}   // a whip antenna
     if(kind==='lab'){const [rx,rz]=P(0,0);piece(new THREE.BoxGeometry(len*0.7,0.2,r*3.2),white,rx,y+r+1.4,rz,-ta);
       for(const sd of [-1,1]){const [px2,pz2]=P(sd*len*0.3,0);piece(new THREE.BoxGeometry(0.3,1.4,0.3).translate(0,0.7,0),steel,px2,y+r-0.1,pz2);}}
   }}

  for(const [mat,list] of byMat){const g=mergeParts(list,mat);if(g){g.castShadow=true;g.receiveShadow=true;g.userData.wireCat='structure';scene.add(g);}}

  // ---- the dishes, following Earth ----
  const dishes=[];
  {const [ax,az]=I.sites.array;
   for(let k=0;k<3;k++){const x=ax-180+k*70,z=az-160,g=groundH(x,z);
     const base=new THREE.Mesh(new THREE.BoxGeometry(4,16,4).translate(0,8,0),steel);base.position.set(x,g,z);scene.add(base);
     const head=new THREE.Group();head.position.set(x,g+18,z);scene.add(head);
     const dish=new THREE.Mesh(new THREE.SphereGeometry(16,18,10,0,Math.PI*2,0,Math.PI*0.42).rotateX(-Math.PI/2),hull);dish.material=hull;
     dish.position.z=-5;head.add(dish);                       // the bowl opens along +z: lookAt points it
     const feed=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,11,6).rotateX(Math.PI/2).translate(0,0,1),steel);head.add(feed);
     const horn=new THREE.Mesh(new THREE.ConeGeometry(1.4,3,8).rotateX(-Math.PI/2).translate(0,0,6.5),foil);head.add(horn);
     for(const o of [base,dish,feed,horn]){o.castShadow=true;}
     dishes.push({head,lag:0.2+k*0.15});}}

  // ---- the travelling block ----
  let block=null,cable=null;
  {const [bx,bz]=I.sites.bore,g=groundH(bx,bz),H=70;
   block=new THREE.Mesh(new THREE.BoxGeometry(4,5,4),M(0x4e565d));block.position.set(bx,g+40,bz);block.castShadow=true;scene.add(block);
   cable=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,1,6).translate(0,-0.5,0),steel);cable.position.set(bx,g+4+H,bz);scene.add(cable);
   block.userData.top=g+4+H;block.userData.g=g;}

  // ---- the crew ----
  // Instanced: a suit, a backpack, a helmet, a gold visor, a lamp. Each walks between two places round the
  // hub - a door and a store, a store and the garage - waits a while, and walks back.
  const NC=(C.life&&C.life.crew)||14,crew=[];
  const suitG=THREE.CapsuleGeometry?new THREE.CapsuleGeometry(0.42,0.9,4,8).translate(0,1.0,0):new THREE.CylinderGeometry(0.42,0.46,1.7,8).translate(0,0.95,0);
  const parts=[[suitG,M(0xeceff1)],[new THREE.BoxGeometry(0.7,0.8,0.35).translate(0,1.25,-0.38),M(0xc8ced2)],
    [new THREE.SphereGeometry(0.34,12,8).translate(0,2.0,0),M(0xf2f4f5)],[new THREE.SphereGeometry(0.28,10,6,0,Math.PI*2,0,Math.PI*0.5).rotateX(Math.PI/2).translate(0,2.0,0.1),foil],
    [new THREE.SphereGeometry(0.1,6,4).translate(0.22,2.18,0.25),new THREE.MeshBasicMaterial({color:0xfff2c8})]];
  const insts=parts.map(([g,m])=>{const im=new THREE.InstancedMesh(g,m,NC);im.castShadow=true;im.frustumCulled=false;im.userData.noFingerprint=true;scene.add(im);return im;});
  const spot=()=>{const a=R()*Math.PI*2,d=90+R()*220;return [Math.cos(a)*d,Math.sin(a)*d];};
  for(let i=0;i<NC;i++){const A=spot(),B=spot();crew.push({A,B,t:R(),dir:1,wait:R()*8,ph:R()*6.28,v:1.3+R()*0.5,home:false});}
  // the radiation alert (events.js) calls everybody in: each walks from where they are to the hub's door and
  // goes inside, and when it is over comes back out and carries on
  const recall={on:false},DOOR=[0,40];
  const where=c=>[c.A[0]+(c.B[0]-c.A[0])*c.t,c.A[1]+(c.B[1]-c.A[1])*c.t];
  ctx.europaCrew={count:NC,recall:on=>{if(on===recall.on)return;recall.on=on;
    for(const c of crew){if(on){c.back=c.dir>0?c.B:c.A;c.A=where(c);c.B=DOOR;}else{c.A=DOOR;c.B=c.back||spot();}c.t=0;c.dir=1;c.wait=on?0:R()*6;}}};

  const o=new THREE.Object3D();let last=performance.now();
  animHooks.push(now=>{const t=now/1000,dt=Math.min(0.05,(now-last)/1000);last=now;
    // the dishes: toward the sun (Earth is within twelve degrees of it), or stowed straight up when it is down
    const sd=ENV.izSunDir.value,up=sd.y>0.02;
    for(const d of dishes){const tgt=up?sd:new THREE.Vector3(0,1,0.001);const want=d.head.position.clone().addScaledVector(tgt,100);
      const cur=d.cur||(d.cur=want.clone());cur.lerp(want,Math.min(1,dt*d.lag));d.head.lookAt(cur);}
    // the block: down and up the derrick over a minute and a half
    {const u=0.5-0.5*Math.cos(t*2*Math.PI/90),y=block.userData.g+14+u*(block.userData.top-block.userData.g-22);block.position.y=y;
     cable.scale.y=Math.max(0.1,block.userData.top-y-2.5);}
    for(const b of blinkers)b.m.visible=((t+b.ph)%b.per)<0.25;
    for(const b of beacons)b.m.visible=Math.floor(t*4)%8===b.j;
    crew.forEach((c,i)=>{
      let x,z,a;const [ax,az]=c.A,[bx,bz]=c.B,L=Math.hypot(bx-ax,bz-az)||1;
      if(c.wait>0){c.wait-=dt;}
      else if(recall.on){c.t=Math.min(1,c.t+c.v*1.6*dt/L);}
      else{c.t+=c.dir*c.v*dt/L;if(c.t>1||c.t<0){c.t=Math.max(0,Math.min(1,c.t));c.dir=-c.dir;c.wait=4+R()*10;}}
      x=ax+(bx-ax)*c.t;z=az+(bz-az)*c.t;a=Math.atan2((bx-ax)*c.dir,(bz-az)*c.dir);
      const moving=c.wait<=0&&!(recall.on&&c.t>=1),hop=moving?Math.abs(Math.sin(t*2.6+c.ph))*0.55:0;   // a low-gravity lope
      const hidden=recall.on&&c.t>=1;
      o.position.set(x,groundH(x,z)+hop,z);o.rotation.set(moving?0.18:0,a,0);o.scale.setScalar(hidden?0.0001:1);o.updateMatrix();
      for(const im of insts)im.setMatrixAt(i,o.matrix);});
    for(const im of insts)im.instanceMatrix.needsUpdate=true;
  });
  ctx.details=Object.assign(ctx.details||{},{crew:NC,dishes:dishes.length,seismometers:blinkers.length});
}
