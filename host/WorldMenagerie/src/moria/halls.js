// ---------- Khazad-dum: the halls under the mountain ----------
// Fan work from Tolkien; every shape is this project's own.
//
// Laid out as the Fellowship went (plan.js). From the West-gate: a stair of two hundred steps, broad and shallow;
// the long road east, with a fissure across its floor to be leapt, a guard-room with a well in it, and a fork of
// three arches where the right-hand way goes up. At the east end, at the level of the Gates, the great hall of
// pillars, its walls black and polished like glass, galleried level above level with doors going off into the
// dark; the Second Hall, its double line of pillars carved like the boles of trees with boughs holding up the
// roof, smooth and black, with a red glow mirrored in them from the fissure of fire across its floor; past it the
// chasm, fifty feet across, and "a slender bridge of stone, without kerb or rail"; then the First Hall and the
// gate. Six levels up, the Twenty-first Hall of the North-end, lit by shafts high in its east wall, and beside it
// the Chamber of Mazarbul: recesses in the walls with iron-bound chests broken open, bones and broken weapons,
// and Balin's tomb, an oblong block under a slab of white stone, in the light from a window high in the east
// wall. From Mazarbul a stair goes down south to the Second Hall.
//
// Every hall is a closed room, walls and floor and roof, with holes cut where one opens into the next, so that
// from inside the mountain and the sky are not there. The surfaces are lit per pixel (Phong), because the light
// down here is a lantern near you and fire far off; the halls' walls are polished, so the lights run in them.
// The mountain's own ground is above all of it (tools/make-moria.py checks the halls are covered).
import { mkRng } from '../core/rng.js';
import { createDust } from '../core/dust.js';
import { makeCarver } from './carve.js';
import { HALLS,PASSAGES,BRIDGE,FISSURE,TOMB,FLOOR,SEVENTH,TIERS } from './plan.js';

export function halls(api){
  const {THREE,ctx,scene,mergeParts,animHooks,nightF,hour}=api;
  const R=mkRng(1966),D=new THREE.Object3D();
  // everything added to the scene from here to deep.js is under the mountain (deep.js gathers it up)
  ctx.moria=Object.assign(ctx.moria||{},{mark:scene.children.length});
  // the rough rock of the passages, and the dressed and polished black of the halls
  const stoneM=new THREE.MeshPhongMaterial({color:0x5e5a54,specular:0x1a1a1a,shininess:8,side:THREE.DoubleSide,flatShading:true});
  const floorM=new THREE.MeshPhongMaterial({color:0x4a4640,specular:0x2a2a2a,shininess:20,side:THREE.DoubleSide});
  const blackM=new THREE.MeshPhongMaterial({color:0x242226,specular:0x3c3c42,shininess:70,side:THREE.DoubleSide});
  const blackFloorM=new THREE.MeshPhongMaterial({color:0x302d2c,specular:0x5a5856,shininess:60,side:THREE.DoubleSide});
  const darkM=new THREE.MeshPhongMaterial({color:0x2a2724,shininess:4,side:THREE.DoubleSide,flatShading:true});
  const pillarM=new THREE.MeshPhongMaterial({color:0x36343a,specular:0x74727a,shininess:70,flatShading:true});
  const treeM=new THREE.MeshPhongMaterial({color:0x1e1b1d,specular:0xb8a8a4,shininess:110});
  const voidM=new THREE.MeshBasicMaterial({color:0x040405,side:THREE.DoubleSide});
  const byMat=new Map();const put=m=>{let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);return m;};
  const plane=(w,h,mat)=>new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);

  // rooms and passages, and their floors for the walking camera (carve.js)
  const CV=makeCarver(api,{put,mats:{stone:stoneM,floor:floorM,void:voidM}}),{room,op}=CV;
  const POL=name=>({wall:blackM,floor:blackFloorM,name});

  const H=HALLS;
  room(H.dwarrowdelf,[op('w',0,10,9),op('e',0,24,22),op('n',4560,10,10),op('n',4150,12,14),op('s',4200,16,16)],POL('The Dwarrowdelf'));
  room(H.passage,[op('w',0,24,22),op('e',0,24,22)],POL('The Dwarrowdelf'));
  room(H.second,[op('w',0,24,22),op('e',0,28,25),op('n',4953,4,5)],POL('The Second Hall'));
  // the chasm: its walls go four hundred metres down; the halls open onto it either side at the level of the bridge
  room(H.chasm,[{side:'w',u0:-14,u1:14,y0:400,y1:425},{side:'e',u0:-14,u1:14,y0:400,y1:425}],{wall:darkM,floor:darkM,walk:false});
  room(H.first,[op('w',0,28,25),op('e',0,14,20)],POL('The First Hall'));
  room(H.landing,[op('s',4560,10,10),op('e',-360,8,9)],{name:'The Seventh Level'});
  // the Twenty-first Hall: the stair comes in on the west, Mazarbul's door on the east, and two shafts high in the
  // east wall, over the Dimrill Dale
  const WIN=[[-390,6,24,31],[-330,6,24,31]];
  room(H.twentyfirst,[op('w',-360,8,9),op('e',-360,5,6),...WIN.map(([c,w,y0,y1])=>op('e',c,w,y1,y0))],POL('The Twenty-first Hall'));
  room(H.mazarbul,[op('w',-360,5,6),op('s',4953,4,5),op('e',-360,3,11,8)],{name:'The Chamber of Mazarbul'});
  room(H.westhall,[op('w',900,6,9),op('e',900,10,10)],{name:'Inside the West-gate'});
  room(H.guard,[op('w',700,10,9),op('e',700,10,9)],{name:'The guard-room'});
  room(H.fork,[op('w',400,10,9),op('e',386,8,8),op('e',400,8,8),op('e',414,8,8)],{name:'The fork of three arches'});

  // ---- the passages: lengths of tunnel along each leg, stepped where they are stairs ----
  const stepM=new THREE.MeshPhongMaterial({color:0x56524c,specular:0x222222,shininess:14,flatShading:true});
  const PNAME={stair:'The stair of two hundred steps',road1:'The road east',road2:'The road east',left:'A way not taken',mid:'A way not taken',road3:'The road east',
    up:'The stair to the Seventh Level',north:'The Seventh Level',down:'The stair down from Mazarbul'};
  for(const key in PASSAGES)CV.passage(Object.assign({rnd:R},PASSAGES[key]),PNAME[key]||'A passage');
  const stepMs=CV.stepMs;
  // the arches of the fork: dressed heads over the three ways east
  {const [x0,x1,z0,z1,fl]=H.fork;for(const c of [386,400,414]){const a=new THREE.Mesh(new THREE.TorusGeometry(4.6,0.7,5,10,Math.PI),pillarM);a.rotation.y=Math.PI/2;a.position.set(x1-0.3,fl+4,c);put(a);}}
  // the well in the guard-room: a low round kerb, and black inside it
  {const [x0,x1,z0,z1,fl]=H.guard,wx=(x0+x1)/2,wz=z1-3.4;
   const k=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.6,0.8,14,1,true),stoneM);k.position.set(wx,fl+0.4,wz);put(k);
   const rim=new THREE.Mesh(new THREE.TorusGeometry(1.55,0.14,4,14),stoneM);rim.rotation.x=Math.PI/2;rim.position.set(wx,fl+0.8,wz);put(rim);
   const d=new THREE.Mesh(new THREE.CircleGeometry(1.45,14),voidM);d.rotation.x=-Math.PI/2;d.position.set(wx,fl+0.05,wz);put(d);
   ctx.well={x:wx,y:fl,z:wz};}

  // ---- the great hall: pillars, and a gallery on every level ----
  // Square, eight metres through, going up into the dark and flaring out at the top to carry the roof; six rows
  // down the length of it. In the dark they are what you see: the hall is its pillars.
  const pillars=[];
  const pillarRows=(key,xs,zs,w,h0,into)=>{const [x0,x1,z0,z1,fl,h]=H[key];
    for(const x of xs)for(const z of zs){pillars.push([x,z,fl]);into.push([x,z,fl]);CV.block(x-w*0.7,x+w*0.7,z-w*0.7,z+w*0.7,fl,fl+h);}
    const g=new THREE.BoxGeometry(w,h,w).translate(0,h/2,0),cap=new THREE.CylinderGeometry(w*1.12,w*0.52,12*w/8,4,1).rotateY(Math.PI/4).translate(0,h-6*w/8,0),base=new THREE.BoxGeometry(w*1.4,3,w*1.4).translate(0,1.5,0);
    for(const geo of [g,cap,base]){const im=new THREE.InstancedMesh(geo,pillarM,into.length);
      into.forEach(([x,z,fl],i)=>{D.position.set(x,fl,z);D.rotation.set(0,0,0);D.scale.set(1,1,1);D.updateMatrix();im.setMatrixAt(i,D.matrix);});
      im.frustumCulled=false;im.receiveShadow=true;scene.add(im);}};
  {const xs=[];for(let x=H.dwarrowdelf[0]+40;x<H.dwarrowdelf[1]-20;x+=48)xs.push(x);pillarRows('dwarrowdelf',xs,[-150,-90,-30,30,90,150],8,0,[]);}
  {const xs=[];for(let x=H.twentyfirst[0]+20;x<H.twentyfirst[1]-10;x+=30)xs.push(x);pillarRows('twentyfirst',xs,[-382,-338],4.5,0,[]);}
  const galleries=[];
  {const [x0,x1,z0,z1,fl,h]=H.dwarrowdelf,L=x1-x0-4;
   const ledgeG=new THREE.BoxGeometry(L,0.9,3.2),parG=new THREE.BoxGeometry(L,1.1,0.4);
   // the doorways: arched, and dark, going off into the rest of the city
   const arch=new THREE.Shape();arch.moveTo(-2,0);arch.lineTo(-2,4.6);arch.absarc(0,4.6,2,Math.PI,0,true);arch.lineTo(2,0);arch.lineTo(-2,0);
   const archG=new THREE.ShapeGeometry(arch,6),doors=[];
   for(const [zw,sd] of [[z0,1],[z1,-1]])for(const ty of TIERS){
     if(ty>0){for(const [g,dz,dy] of [[ledgeG,1.6,-0.45],[parG,3.0,0.55]]){const m=new THREE.Mesh(g,pillarM);m.position.set((x0+x1)/2,fl+ty+dy,zw+sd*dz);put(m);}galleries.push([zw+sd*1.6,fl+ty,x0,x1,sd]);
       const zz=[zw,zw+sd*3.0].sort((p,q)=>p-q);CV.floor({name:'A gallery of the Dwarrowdelf',rect:[x0+2,x1-2,zz[0],zz[1]],y:fl+ty});}
     for(let x=x0+14+(ty/16)*6;x<x1-8;x+=24){if(ty===0&&((sd===1&&(Math.abs(x-4560)<14||Math.abs(x-4150)<16))||(sd===-1&&Math.abs(x-4200)<18)))continue;doors.push([x,fl+ty,zw+sd*0.06,sd]);}}
   // and the stairs between the galleries: a flight along the wall at alternate ends, level to level
   for(const [zw,sd] of [[z0,1],[z1,-1]])for(let k=0;k+1<TIERS.length;k++){const a=TIERS[k],b=TIERS[k+1],right=k%2===0,xs=right?x1-40:x0+40,dir=right?-1:1,n=Math.round((b-a)/0.3);
     for(let i=0;i<n;i++){const top=fl+a+(i+1)*(b-a)/n;stepMs.push([xs+dir*(i+0.5)*0.42,top,zw+sd*1.6,0,0.44,top-fl-a+0.05,2.8]);}
     CV.floor({name:'A stair between the galleries',a:[xs,zw+sd*1.6,fl+a],b:[xs+dir*n*0.42,zw+sd*1.6,fl+b],w:2.6});}
   const im=new THREE.InstancedMesh(archG,voidM,doors.length);doors.forEach(([x,y,z,sd],i)=>{D.position.set(x,y,z);D.rotation.set(0,sd>0?0:Math.PI,0);D.scale.set(1,1,1);D.updateMatrix();im.setMatrixAt(i,D.matrix);});
   im.frustumCulled=false;scene.add(im);}
  scene.add(CV.steps(stepM));

  // ---- the tree-pillars of the Second Hall ----
  {const [x0,x1,z0,z1,fl,h]=H.second;const trunk=new THREE.CylinderGeometry(2.0,2.8,h,9).translate(0,h/2,0),parts=[trunk];
   // roots at the foot, and the boughs: five limbs out and up from high on the bole to the roof, and twigs of tracery
   for(let k=0;k<6;k++){const a=k/6*Math.PI*2+0.3,r=new THREE.CylinderGeometry(0.3,1.1,4.5,5).translate(0,2.25,0);
     r.applyMatrix4(new THREE.Matrix4().makeRotationZ(1.1).premultiply(new THREE.Matrix4().makeRotationY(a)).setPosition(0,1.4,0));parts.push(r);}
   for(let k=0;k<5;k++){const a=k/5*Math.PI*2,len=14;const b=new THREE.CylinderGeometry(0.5,1.2,len,5).translate(0,len/2,0);
     const m=new THREE.Matrix4().makeRotationZ(-0.9).premultiply(new THREE.Matrix4().makeRotationY(a)).setPosition(0,h-16,0);b.applyMatrix4(m);parts.push(b);
     const t=new THREE.CylinderGeometry(0.25,0.5,8,4).translate(0,4,0);t.applyMatrix4(new THREE.Matrix4().makeRotationZ(-0.5).premultiply(new THREE.Matrix4().makeRotationY(a+0.6)).setPosition(Math.cos(a)*6,h-10,-Math.sin(a)*6));parts.push(t);}
   const geo=mergeGeos(THREE,parts);const spots=[];for(let x=x0+22;x<x1-10;x+=28)for(const z of [-22,22])spots.push([x,z]);
   for(const [x,z] of spots)CV.block(x-3,x+3,z-3,z+3,fl,fl+h);
   const im=new THREE.InstancedMesh(geo,treeM,spots.length);spots.forEach(([x,z],i)=>{const huge=Math.abs(x-FISSURE.x)<16?1.25:1;D.position.set(x,fl,z);D.rotation.set(0,R()*6,0);D.scale.set(huge,1,huge);D.updateMatrix();im.setMatrixAt(i,D.matrix);});
   im.frustumCulled=false;scene.add(im);}

  // ---- the fissure across the Second Hall ----
  const fireM=new THREE.MeshBasicMaterial({color:0xff5a18,transparent:true,opacity:0.85,depthWrite:false,blending:THREE.AdditiveBlending});
  const flames=[];
  {const [x0,x1,z0,z1,fl]=H.second,fx=FISSURE.x,fw=FISSURE.w;
   // a jagged rent: the red of it, and the scorched lip either side
   const rent=[],lip=[];for(let i=0;i<=40;i++){const z=z0+(z1-z0)*i/40,j=Math.sin(i*1.7)*0.6+Math.sin(i*0.53)*0.9;rent.push([fx+j,z]);}
   const strip=(pts,w,y,mat)=>{const P=[],I=[];pts.forEach(([x,z],i)=>{P.push(x-w/2,y,z,x+w/2,y,z);if(i)I.push(2*i-2,2*i-1,2*i+1,2*i-2,2*i+1,2*i);});
     const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();return new THREE.Mesh(g,mat);};
   scene.add(strip(rent,fw+2.6,fl+0.03,new THREE.MeshBasicMaterial({color:0x0c0706,side:THREE.DoubleSide})));
   scene.add(strip(rent,fw,fl+0.06,new THREE.MeshBasicMaterial({color:0xc2380c,side:THREE.DoubleSide})));
   scene.add(strip(rent,fw*0.4,fl+0.08,new THREE.MeshBasicMaterial({color:0xffb040,side:THREE.DoubleSide})));
   for(let k=0;k<34;k++){const [x,z]=rent[Math.floor(R()*rent.length)],f=new THREE.Mesh(new THREE.ConeGeometry(0.5+R()*0.8,1.5+R()*3.5,6).translate(0,1,0),fireM);f.position.set(x,fl,z);scene.add(f);flames.push({f,ph:R()*6.28});}
   ctx.fissure={x:fx,rent};}
  const smoke=createDust(api,{max:900,size:9,color:0x191412,drag:0.5,gravity:-1.4,wind:[0.3,0,0]});

  // ---- the Bridge of Khazad-dum ----
  // "One curving spring of fifty feet": a single arch of stone across the chasm, no kerb, no rail, only wide
  // enough to go over in single file. It can be broken (events.js): it is two halves, each its own mesh.
  const bridgeM=new THREE.MeshPhongMaterial({color:0x6a655d,specular:0x222222,shininess:10,flatShading:true});
  const bridge=[];
  {const {x0,x1,z,w,rise}=BRIDGE,N=24,mid=(x0+x1)/2;
   for(const half of [0,1]){const P=[],IDX=[];const a0=half?mid:x0,a1=half?x1:mid;
     for(let i=0;i<=N/2;i++){const x=a0+(a1-a0)*i/(N/2),t=(x-x0)/(x1-x0),y=FLOOR+rise*Math.sin(t*Math.PI),th=0.8+2.2*(1-Math.sin(t*Math.PI));
       for(const [dy,dz] of [[0,-w/2],[0,w/2],[-th,w/2],[-th,-w/2]])P.push(x,y+dy,z+dz);}
     for(let i=0;i<N/2;i++){const a=i*4,b=a+4;for(let k=0;k<4;k++){const k2=(k+1)%4;IDX.push(a+k,b+k,b+k2,a+k,b+k2,a+k2);}}
     const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(IDX);g.computeVertexNormals();
     const m=new THREE.Mesh(g,bridgeM);scene.add(m);bridge.push(m);}
   // its floor, for the walker: an arch, and only while the Bridge is there
   CV.floor({name:'The Bridge of Khazad-dûm',a:[x0-0.5,z,FLOOR],b:[x1+0.5,z,FLOOR],w:w,arc:rise,when:()=>bridge[0].visible&&bridge[1].visible});}

  // ---- the chasm's fire, far down ----
  {const [x0,x1,z0,z1,fl]=H.chasm;
   const glow=plane(x1-x0,z1-z0,new THREE.MeshBasicMaterial({color:0xb02a08}));glow.rotation.x=-Math.PI/2;glow.position.set((x0+x1)/2,fl+1,(z0+z1)/2);scene.add(glow);
   for(let k=0;k<50;k++){const f=new THREE.Mesh(new THREE.ConeGeometry(2+R()*2.5,10+R()*20,6).translate(0,6,0),fireM);f.position.set(x0+R()*(x1-x0),fl,z0+R()*(z1-z0));scene.add(f);flames.push({f,ph:R()*6.28});}}
  // the red light is the fissure's: it is what is mirrored in the pillars, and it reaches the lip of the chasm
  const deepLight=new THREE.PointLight(0xff5020,2.2,260,1.2);deepLight.position.set(FISSURE.x,FLOOR+4,0);scene.add(deepLight);
  // mithril in the walls of the chasm: veins that catch the light
  {const n=320,v=new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.5,0),new THREE.MeshBasicMaterial({color:0xcfe0ff}),n);const [x0,x1,z0,z1,fl,h]=H.chasm;
   for(let i=0;i<n;i++){const onX=R()<0.8,x=onX?(R()<0.5?x0+0.4:x1-0.4):x0+R()*(x1-x0),z=onX?z0+R()*(z1-z0):(R()<0.5?z0+0.4:z1-0.4),y=fl+20+R()*(h-80);
     D.position.set(x,y,z);D.rotation.set(R()*3,R()*3,R()*3);D.scale.setScalar(0.5+R()*1.4);D.updateMatrix();v.setMatrixAt(i,D.matrix);}
   v.frustumCulled=false;scene.add(v);}

  // ---- daylight, where the halls have windows to the east ----
  const beamM=new THREE.MeshBasicMaterial({color:0xfff2cc,transparent:true,opacity:0.22,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  const skyM=new THREE.MeshBasicMaterial({color:0xe8eef4,side:THREE.DoubleSide});
  const poolM=new THREE.MeshBasicMaterial({color:0xffe8b0,transparent:true,opacity:0.35,depthWrite:false,blending:THREE.AdditiveBlending});
  // a shaft from a window at (wx, wy, z) slanting down west to the floor at fx
  const shaft=(wx,wy,z,fx,fy,r0,r1)=>{const L=Math.hypot(wx-fx,wy-fy),b=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,L,12,1,true),beamM);
    b.position.set((wx+fx)/2,(wy+fy)/2,z);b.rotation.z=-Math.atan2(wx-fx,wy-fy);scene.add(b);
    const p=plane(r1*1.8,r1*1.3,poolM);p.rotation.x=-Math.PI/2;p.position.set(fx,fy+0.04,z);scene.add(p);
    const s=plane(r0*2.4,r0*2.6,skyM);s.rotation.y=-Math.PI/2;s.position.set(wx+2.5,wy,z);scene.add(s);};
  {const [x0,x1,z0,z1,fl]=H.twentyfirst;for(const [c,w,y0,y1] of WIN)shaft(x1,fl+(y0+y1)/2,c,x1-44,fl,2.6,4.4);}

  // ---- the Chamber of Mazarbul ----
  {const [tx,tz]=TOMB,[x0,x1,z0,z1,fl,h]=H.mazarbul;
   {const tomb=new THREE.Mesh(new THREE.BoxGeometry(3.4,1.0,1.9).translate(0,0.5,0),darkM);tomb.position.set(tx,fl,tz);put(tomb);}
   // the slab, and the runes cut in it: this project's own letters, not any real inscription
   const runes=(()=>{const cv=document.createElement('canvas');cv.width=256;cv.height=144;const g=cv.getContext('2d');g.fillStyle='#e8e4d8';g.fillRect(0,0,256,144);
     g.strokeStyle='#6a665c';g.lineWidth=3;const RR=mkRng(1937);
     for(let line=0;line<3;line++){let x=30;const y=34+line*38,n=line===1?9:7;for(let k=0;k<n;k++){g.beginPath();g.moveTo(x,y-12);g.lineTo(x,y+12);
       const f=Math.floor(RR()*4);if(f&1){g.moveTo(x,y-12);g.lineTo(x+8,y-4);}if(f&2){g.moveTo(x,y+2);g.lineTo(x-7,y+10);}if(f===0){g.moveTo(x,y);g.lineTo(x+7,y-7);g.lineTo(x+7,y+7);}g.stroke();x+=(256-60)/n;}}
     return new THREE.CanvasTexture(cv);})();
   const slabMs=[new THREE.MeshPhongMaterial({color:0xe8e4d8,shininess:40})];
   const slab=new THREE.Mesh(new THREE.BoxGeometry(3.6,0.3,2.1),[slabMs[0],slabMs[0],new THREE.MeshPhongMaterial({map:runes,shininess:40}),slabMs[0],slabMs[0],slabMs[0]]);slab.position.set(tx,fl+1.15,tz);scene.add(slab);
   // the shaft of light from the window high in the east wall, falling across the tomb
   shaft(x1,fl+9.5,tz,tx,fl+1.3,1.3,2.4);
   // recesses cut in the walls, with the iron-bound chests in them, broken open
   const woodM=new THREE.MeshLambertMaterial({color:0x4a3322,flatShading:true}),ironM=new THREE.MeshLambertMaterial({color:0x2a2a2c,flatShading:true});
   for(const [zw,sd] of [[z0,1],[z1,-1]])for(let x=x0+3.5;x<x1-2;x+=5){if(sd<0&&Math.abs(x-4953)<4)continue;
     const r=plane(3,2.6,voidM);r.position.set(x,fl+1.4,zw+sd*0.05);if(sd<0)r.rotation.y=Math.PI;put(r);
     const c=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.8,0.9).translate(0,0.4,0),woodM);c.position.set(x+(R()-0.5)*0.4,fl,zw+sd*0.9);c.rotation.y=(R()-0.5)*0.4;put(c);
     for(const bx of [-0.45,0.45]){const b=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.84,0.94).translate(0,0.4,0),ironM);b.position.set(c.position.x+bx,fl,c.position.z);b.rotation.y=c.rotation.y;put(b);}
     const lid=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.1,0.9),woodM);const open=R()<0.7;lid.position.set(c.position.x,fl+(open?0.95:0.85),c.position.z-sd*(open?0.5:0));lid.rotation.x=open?sd*1.2:0;put(lid);}
   // what is left of Balin's folk: bones, broken swords and axe-heads, cloven shields, helms; and the Book
   const bladeM=new THREE.MeshPhongMaterial({color:0x9a9ca0,specular:0x888888,shininess:60,flatShading:true});
   for(let k=0;k<70;k++){const x=x0+1.5+R()*(x1-x0-3),z=z0+1.5+R()*(z1-z0-3);if(Math.abs(x-tx)<2.4&&Math.abs(z-tz)<1.6)continue;const kind=R();let m;
     if(kind<0.35)m=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.03,0.5+R()*0.5),bladeM);
     else if(kind<0.5)m=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.05,0.22),bladeM);
     else if(kind<0.65){m=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.05,10),woodM);}
     else if(kind<0.75){m=new THREE.Mesh(new THREE.SphereGeometry(0.17,8,5,0,Math.PI*2,0,Math.PI/2),ironM);}
     else m=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.5),new THREE.MeshLambertMaterial({color:0xcfc6b0,flatShading:true}));
     m.position.set(x,fl+0.04,z);m.rotation.set((R()-0.5)*0.3,R()*6,(R()-0.5)*0.3);put(m);}
   const book=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.12,0.36),new THREE.MeshLambertMaterial({color:0x5a2a1c}));book.position.set(tx+2.4,fl+0.06,tz+1.1);book.rotation.y=0.4;put(book);
   ctx.mazarbul={x:(x0+x1)/2,z:(z0+z1)/2,fl,door:[x0,-360],tomb:[tx,tz]};}

  for(const [mat,list] of byMat){const m=mergeParts(list,mat);m.receiveShadow=true;scene.add(m);}
  let t0=performance.now();
  animHooks.push(now=>{const t=(now-t0)/1000,day=1-nightF(hour());
    for(const q of flames)q.f.scale.set(1,0.7+0.5*Math.sin(t*3+q.ph)+0.2*Math.sin(t*7.3+q.ph),1);
    deepLight.intensity=2+0.5*Math.sin(t*2.1)+0.3*Math.sin(t*5.7);
    beamM.opacity=0.03+0.2*day;poolM.opacity=0.05+0.3*day;skyM.color.setRGB(0.1+0.8*day,0.12+0.82*day,0.16+0.8*day);
    if(R()<0.5){const r=ctx.fissure.rent[Math.floor(R()*ctx.fissure.rent.length)];smoke.emit(r[0],FLOOR+1,r[1],(R()-0.5)*0.5,1+R(),(R()-0.5)*0.5,6+R()*4,6);}});
  ctx.moria=Object.assign(ctx.moria||{},{pillars,bridge,deepLight,galleries});
  ctx.details=Object.assign(ctx.details||{},{halls:Object.keys(HALLS).length,passages:Object.keys(PASSAGES).length,pillars:pillars.length,steps:stepMs.length});
}

// merge a list of geometries (non-indexed) into one
function mergeGeos(THREE,list){const P=[],N=[];for(const g0 of list){const g=g0.index?g0.toNonIndexed():g0;g.computeVertexNormals();
  P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));return g;}
