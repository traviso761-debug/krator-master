// ---------- Khazad-dum: the city ----------
// Fan work from Tolkien; every shape here is this project's own, and the places are this project's inventions,
// made to sit with what the book gives: "the great realm and dwarf-city of the Dwarrowdelf", its many-pillared
// halls and mansions, the forges, the mithril that was its wealth and its ruin, and the deep waters under the
// mountain. Each is joined to the great hall by a stair (plan.js), and each has a floor to walk (carve.js).
//
//   the Hall of the Mansions   the Third Deep, down the Grand Stair from the great hall: a vault a hundred and
//                              fifty metres high over a street-city - an avenue with a canal down it, a plaza
//                              with a fountain, streets of stone houses - and the walls either side terraced
//                              six storeys high with house-fronts, stairs climbing between the terraces; at the
//                              west end, Durin the Deathless, sixty metres of him, looking down the avenue
//   the Great Forges           through the Mansions' east wall: two rows of hearths under their hoods and
//                              chimneys, anvils, and at the end the great furnace with its channel of metal
//   the Delvings               the Tenth Deep, down the miners' stair: the pit of the lode, a headframe over it
//                              lowering its cage, scaffolds down its sides, carts going round the rim on rails,
//                              and the mithril shining in the walls
//   the Hall of Durin's Throne the Third Level, up the Kings' Stair: pillars, the throne on its dais, the crown
//                              and seven stars on the wall behind it, and the Seven Fathers of the Dwarves in stone
//   the Great Cistern          through the throne-hall's west wall: pillars standing in black water, causeways
//                              across it, and water falling into it from the rock
//
// In Khazad-dum as it was (ctx.war false) the windows are lit, the hearths burn, and the lamps and the Dwarves
// are realm.js's; in Moria the windows are dark, the forges cold, and the mithril still shines.
import { mkRng } from '../core/rng.js';
import { createDust } from '../core/dust.js';
import { makeCarver } from './carve.js';
import { HALLS,FLOOR,PIT,WATER } from './plan.js';

export function city(api){
  const {THREE,ctx,scene,mergeParts,animHooks}=api;
  const R=mkRng(1980),D=new THREE.Object3D(),H=HALLS;
  const stoneM=new THREE.MeshPhongMaterial({color:0x5e5a54,specular:0x1a1a1a,shininess:8,side:THREE.DoubleSide,flatShading:true});
  const floorM=new THREE.MeshPhongMaterial({color:0x4a4640,specular:0x2a2a2a,shininess:20,side:THREE.DoubleSide});
  const paveM=new THREE.MeshPhongMaterial({color:0x4e4a44,specular:0x161616,shininess:12,side:THREE.DoubleSide});
  const blackM=new THREE.MeshPhongMaterial({color:0x242226,specular:0x3c3c42,shininess:70,side:THREE.DoubleSide});
  const dressedM=new THREE.MeshPhongMaterial({color:0x7a746a,specular:0x2a2a2a,shininess:14,flatShading:true});
  const darkM=new THREE.MeshPhongMaterial({color:0x2e2b28,shininess:6,flatShading:true});
  const woodM=new THREE.MeshLambertMaterial({color:0x5a3e28,flatShading:true});
  const ironM=new THREE.MeshPhongMaterial({color:0x3a3a3e,specular:0x6a6a70,shininess:40,flatShading:true});
  const goldM=new THREE.MeshPhongMaterial({color:0xc8a040,specular:0xffe0a0,shininess:80,flatShading:true});
  const voidM=new THREE.MeshBasicMaterial({color:0x040405,side:THREE.DoubleSide});
  const waterM=new THREE.MeshPhongMaterial({color:0x0c1a20,specular:0x8aa8b8,shininess:140,side:THREE.DoubleSide});
  const byMat=new Map();const put=m=>{let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);return m;};
  const CV=makeCarver(api,{put,mats:{stone:stoneM,floor:floorM,void:voidM}}),{room,op,block}=CV;
  const box=(w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);return put(m);};
  const PEACE=ctx.peaceParts=ctx.peaceParts||[];
  // what the switch changes here: things that glow in Khazad-dum and go cold or dark in Moria
  const GLOW=[];const glows=(mat,lit,cold)=>{GLOW.push({mat,lit:new THREE.Color(lit),cold:new THREE.Color(cold)});return mat;};
  const INST=(geo,mat,list,fn)=>{const im=new THREE.InstancedMesh(geo,mat,Math.max(1,list.length));list.forEach((q,i)=>{fn(q,D);D.updateMatrix();im.setMatrixAt(i,D.matrix);});im.count=list.length;im.frustumCulled=false;im.receiveShadow=true;scene.add(im);return im;};
  const reset=()=>{D.position.set(0,0,0);D.rotation.set(0,0,0);D.scale.set(1,1,1);};

  // ---- house-fronts: a painted canvas, stone with arched windows and a door, the windows lit by night ----
  const facade=(storeys,cols)=>{const W=64*cols,Hh=64*storeys,c=document.createElement('canvas'),e=document.createElement('canvas');c.width=e.width=W;c.height=e.height=Hh;
    const g=c.getContext('2d'),ge=e.getContext('2d'),RR=mkRng(storeys*31+cols);g.fillStyle='#645d54';g.fillRect(0,0,W,Hh);ge.fillStyle='#000';ge.fillRect(0,0,W,Hh);
    g.strokeStyle='rgba(30,26,22,0.3)';for(let y=0;y<Hh;y+=8){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
    const arch=(ctx2,x,y,w,h)=>{ctx2.beginPath();ctx2.moveTo(x,y+h);ctx2.lineTo(x,y+w/2);ctx2.arc(x+w/2,y+w/2,w/2,Math.PI,0);ctx2.lineTo(x+w,y+h);ctx2.closePath();ctx2.fill();};
    for(let s=0;s<storeys;s++){const y0=Hh-64*(s+1);
      g.fillStyle='#8c857a';g.fillRect(0,y0+60,W,4);            // the carved band under each storey
      for(let k=0;k<cols;k++){const x0=k*64;
        if(s===0&&k%2===0){g.fillStyle='#16130f';arch(g,x0+22,y0+22,20,42);ge.fillStyle=RR()<0.5?'#6a4418':'#000';arch(ge,x0+22,y0+22,20,42);}
        else for(const wx of [12,38]){g.fillStyle='#1a1714';arch(g,x0+wx,y0+16,14,30);if(RR()<0.62){ge.fillStyle=RR()<0.8?'#ffc978':'#ffe2a8';arch(ge,x0+wx+1,y0+17,12,28);}}
        g.fillStyle='#5e584f';g.fillRect(x0,y0,3,64);}}          // the pilasters between the houses
    const T=new THREE.CanvasTexture(c),TE=new THREE.CanvasTexture(e);for(const t of [T,TE])t.wrapS=t.wrapT=THREE.RepeatWrapping;return [T,TE];};
  // (textured planes go straight into the scene: merging keeps no texture coordinates)
  const faceMat=(storeys,cols,rep)=>{const [T,TE]=facade(storeys,cols);if(rep){T.repeat.set(rep,1);TE.repeat.set(rep,1);}
    const m=new THREE.MeshPhongMaterial({map:T,emissiveMap:TE,emissive:0xffffff,emissiveIntensity:1,specular:0x1a1a1a,shininess:10});FACES.push(m);return m;};
  const FACES=[];

  // a Dwarf in stone: robe, belt, the beard to the belt, the hood, and an axe held upright before him; h tall,
  // facing +z
  const statue=(h,mat)=>{const g=new THREE.Group(),k=h/10;
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(1.5*k,2.4*k,6.4*k,10).translate(0,3.2*k,0),mat));
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(1.62*k,1.62*k,0.5*k,10).translate(0,4.6*k,0),mat));
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(1.7*k,1.5*k,1.6*k,10).translate(0,7.1*k,0),mat));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(1.1*k,10,8).translate(0,8.4*k,0),mat));
    const beard=new THREE.Mesh(new THREE.ConeGeometry(1.0*k,3.4*k,6).rotateX(Math.PI).translate(0,6.4*k,0.95*k),mat);g.add(beard);
    g.add(new THREE.Mesh(new THREE.ConeGeometry(1.25*k,1.6*k,10).translate(0,9.5*k,0),mat));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.28*k,7.4*k,0.28*k).translate(0,3.9*k,2.1*k),mat));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.8*k,1.1*k,0.2*k).translate(0,7.0*k,2.1*k),mat));
    for(const sd of [-1,1])g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42*k,0.5*k,3*k,6).rotateX(-0.9).translate(sd*1.1*k,5.4*k,1.2*k),mat));
    return g;};
  const place=(g,x,y,z,ry)=>{g.position.set(x,y,z);g.rotation.y=ry||0;g.updateMatrixWorld(true);for(const m of [...g.children]){m.applyMatrix4(g.matrixWorld);put(m);}};

  // ================= the Hall of the Mansions =================
  const MA=H.mansions,[mx0,mx1,mz0,mz1,mfl,mh]=MA,AV=(mz0+mz1)/2,PLAZA=4200,TER=[24,44,64,84,104,124];
  room(MA,[op('n',PLAZA,16,16),op('e',410,16,14)],{wall:stoneM,floor:paveM,name:'The Hall of the Mansions'});
  const houses=[[],[],[]];
  {// the avenue, its canal, and the kerbs and bridges of it
   box(mx1-mx0-4,0.1,40,paveM,(mx0+mx1)/2,mfl+0.05,AV);
   box(mx1-mx0-60,0.12,6,waterM,(mx0+mx1)/2+20,mfl+0.08,AV);
   for(const sd of [-1,1])box(mx1-mx0-60,0.6,0.6,dressedM,(mx0+mx1)/2+20,mfl+0.3,AV+sd*3.3);
   for(let x=mx0+100;x<mx1-40;x+=100){box(8,0.8,8,dressedM,x,mfl+0.4,AV);}
   // the streets of houses either side: pairs of rows back to back with lanes between, in blocks of six
   const rows=[];for(const sd of [-1,1])for(const off of [29,43,67,81,105,119,143,157])rows.push({z:AV+sd*off,face:sd});
   for(const r of rows)for(let bx=mx0+70;bx<mx1-40;bx+=74)for(let i=0;i<6;i++){const x=bx+i*11;
     // (not in the plaza, nor in the lane along the east wall to the forges)
     if(Math.abs(x-PLAZA)<34||x>mx1-26)continue;if(r.face<0&&Math.abs(x-PLAZA)<40&&r.z<mz0+60)continue;
     const near=Math.abs(r.z-AV)<50,v=near?(R()<0.6?2:1):(R()<0.5?1:R()<0.6?0:2);houses[v].push({x,z:r.z,face:r.face});
     const hh=[9,13,17][v];block(x-5.2,x+5.2,r.z-7.2,r.z+7.2,mfl,mfl+hh);}
   const roofM=new THREE.MeshPhongMaterial({color:0x4e4943,flatShading:true});
   [9,13,17].forEach((hh,v)=>{const f=faceMat(v+2,1),geo=new THREE.BoxGeometry(10,hh,14).translate(0,hh/2,0);
     INST(geo,[f,f,roofM,roofM,f,f],houses[v],(q,d)=>{reset();d.position.set(q.x,mfl,q.z);d.rotation.y=q.face>0?Math.PI:0;});
     // a parapet round each roof
     INST(new THREE.BoxGeometry(10.4,1,14.4).translate(0,hh+0.5,0),dressedM,houses[v],(q,d)=>{reset();d.position.set(q.x,mfl,q.z);});});
   // the plaza: the fountain, and the street lamps along the avenue
   {const b=new THREE.Mesh(new THREE.CylinderGeometry(11,12,1.4,24,1,true),dressedM);b.position.set(PLAZA,mfl+0.7,AV);put(b);
    const w=new THREE.Mesh(new THREE.CircleGeometry(11,24),waterM);w.rotation.x=-Math.PI/2;w.position.set(PLAZA,mfl+1.1,AV);put(w);
    const c=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.8,7,10),dressedM);c.position.set(PLAZA,mfl+3.5,AV);put(c);
    const t=new THREE.Mesh(new THREE.CylinderGeometry(4,1.2,1.2,12),dressedM);t.position.set(PLAZA,mfl+7.4,AV);put(t);
    block(PLAZA-12,PLAZA+12,AV-12,AV+12,mfl,mfl+8);}
   const posts=[];for(let x=mx0+60;x<mx1-20;x+=25)for(const sd of [-1,1])posts.push([x,AV+sd*19]);
   INST(new THREE.CylinderGeometry(0.2,0.3,6,6).translate(0,3,0),ironM,posts,([x,z],d)=>{reset();d.position.set(x,mfl,z);});
   const lampM=glows(new THREE.MeshBasicMaterial({color:0xffe2a8}),0xffe2a8,0x1a1814);
   INST(new THREE.OctahedronGeometry(0.6,0).translate(0,6.4,0),lampM,posts,([x,z],d)=>{reset();d.position.set(x,mfl,z);d.scale.set(1,1.5,1);});
   // the great lamps hung in the vault over the avenue, crystal on long chains
   const chand=[];for(let x=mx0+120;x<mx1-60;x+=110)chand.push([x,AV]);
   const bigLamp=glows(new THREE.MeshBasicMaterial({color:0xdcecff}),0xdcecff,0x141618);
   INST(new THREE.OctahedronGeometry(4,0),bigLamp,chand,([x,z],d)=>{reset();d.position.set(x,mfl+96,z);d.scale.set(1,1.8,1);});
   INST(new THREE.CylinderGeometry(0.25,0.25,mh-104,4).translate(0,(mh-104)/2+104,0),ironM,chand,([x,z],d)=>{reset();d.position.set(x,mfl,z);});}
  // the terraces: a ledge for every storey of mansions on both long walls, the house-fronts behind each, and
  // flights of steps climbing from one to the next - gaps are left in each ledge over the flight that comes up
  // to it
  {const [x0,x1]=[mx0,mx1],flights=[];
   const fAt=k=>[3880+(k%3)*230,4400-(k%2)*130];
   for(const [zw,sd] of [[mz0,1],[mz1,-1]]){
     // the front of the lowest storey, behind the lane along the wall
     const f0=faceMat(5,10,Math.round((x1-x0)/40));const p0=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0-2,22),f0);p0.position.set((x0+x1)/2,mfl+11,zw+sd*0.6);if(sd<0)p0.rotation.y=Math.PI;
     if(sd>0){// the Grand Stair comes in through the north wall: the row of fronts leaves room for it
       const L=(PLAZA-12)-x0-1,Rr=x1-1-(PLAZA+12);
       for(const [cx,len] of [[x0+1+L/2,L],[PLAZA+12+Rr/2,Rr]]){const q=new THREE.Mesh(new THREE.PlaneGeometry(len,22),faceMat(5,10,Math.max(1,Math.round(len/40))));q.position.set(cx,mfl+11,zw+sd*0.6);scene.add(q);}}
     else scene.add(p0);
     TER.forEach((ty,k)=>{const holes=fAt(k).map(x=>[x-1,x+31]);
       // the ledge, in lengths between the holes
       const cuts=[x0+2,...holes.flat(),x1-2];for(let i=0;i<cuts.length;i+=2){const a=cuts[i],b=cuts[i+1];if(b-a<2)continue;
         box(b-a,1.2,8,dressedM,(a+b)/2,mfl+ty-0.6,zw+sd*4);box(b-a,1.1,0.5,dressedM,(a+b)/2,mfl+ty+0.55,zw+sd*7.8);
         CV.floor({name:'A terrace of the Mansions',rect:[a,b,Math.min(zw,zw+sd*7.5),Math.max(zw,zw+sd*7.5)],y:mfl+ty});}
       const fm=faceMat(4,10,Math.round((x1-x0)/40));const p=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0-2,19),fm);p.position.set((x0+x1)/2,mfl+ty+9.5,zw+sd*0.6);if(sd<0)p.rotation.y=Math.PI;scene.add(p);
       ctx.moria.galleries.push([zw+sd*4,mfl+ty,x0,x1,sd]);
       // the flights up to this ledge, from the one below (or from the floor)
       const below=k?TER[k-1]:0;for(const fx of fAt(k)){const n=Math.round((ty-below)/0.3);
         for(let i=0;i<n;i++){const top=mfl+below+(i+1)*(ty-below)/n;CV.stepMs.push([fx+(i+0.5)*30/n,top,zw+sd*4,0,30/n+0.02,top-mfl-below+0.05,6]);}
         CV.floor({name:'A stair of the Mansions',a:[fx-1,zw+sd*4,mfl+below],b:[fx+31,zw+sd*4,mfl+ty],w:5.6});}});}}
  // Durin the Deathless, at the west end, looking down the avenue
  {const g=statue(60,dressedM);place(g,mx0+34,mfl+14,AV,Math.PI/2);box(40,14,40,dressedM,mx0+34,mfl+7,AV);block(mx0+14,mx0+54,AV-20,AV+20,mfl,mfl+74);
   // and the arch he stands in, carved into the end wall
   box(2,110,70,dressedM,mx0+1,mfl+55,AV);}

  // ================= the Great Forges =================
  const FO=H.forges,[fx0,fx1,fz0,fz1,ffl,fh]=FO,FZ=410;
  room(FO,[op('w',FZ,16,14),op('s',4800,8,9)],{wall:stoneM,floor:floorM,name:'The Great Forges'});
  const coalM=glows(new THREE.MeshBasicMaterial({color:0xff7a2a}),0xff7a2a,0x2a1a14),metalM=glows(new THREE.MeshBasicMaterial({color:0xffa040}),0xffa040,0x1e1612);
  const anvils=[];
  {const hearths=[];for(const z of [350,470])for(let x=fx0+40;x<fx1-60;x+=30)hearths.push([x,z]);
   for(const [x,z] of hearths){box(8,2.5,6,darkM,x,ffl+1.25,z);const c=new THREE.Mesh(new THREE.PlaneGeometry(6.4,4.4),coalM);c.rotation.x=-Math.PI/2;c.position.set(x,ffl+2.52,z);put(c);
     const hood=new THREE.Mesh(new THREE.ConeGeometry(6,6,4).rotateY(Math.PI/4),darkM);hood.position.set(x,ffl+10,z);put(hood);
     const ch=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.3,fh-13,6),darkM);ch.position.set(x,ffl+13+(fh-13)/2,z);put(ch);
     const az=z+(z<FZ?7:-7);box(1.8,0.9,0.8,ironM,x,ffl+1.35,az);box(1,0.9,0.8,darkM,x,ffl+0.45,az);anvils.push([x,ffl+1.8,az]);
     block(x-4.5,x+4.5,z-3.5,z+3.5,ffl,ffl+3);box(3,1.2,1.6,woodM,x+5.5,ffl+0.6,z);}
   // the great furnace, and its channel of metal running west to the moulds
   const fu=new THREE.Mesh(new THREE.CylinderGeometry(15,18,36,16),darkM);fu.position.set(fx1-24,ffl+18,FZ);put(fu);
   const mouth=new THREE.Mesh(new THREE.PlaneGeometry(8,7),metalM);mouth.rotation.y=-Math.PI/2;mouth.position.set(fx1-42.3,ffl+4.5,FZ);put(mouth);
   const fch=new THREE.Mesh(new THREE.CylinderGeometry(4,5,fh-36,8),darkM);fch.position.set(fx1-24,ffl+36+(fh-36)/2,FZ);put(fch);
   block(fx1-42,fx1-4,FZ-18,FZ+18,ffl,ffl+36);
   const run=new THREE.Mesh(new THREE.PlaneGeometry(fx1-42-(fx0+50),2.2),metalM);run.rotation.x=-Math.PI/2;run.position.set((fx1-42+fx0+50)/2,ffl+0.12,FZ);put(run);
   for(const sd of [-1,1])box(fx1-42-(fx0+50),0.5,0.5,darkM,(fx1-42+fx0+50)/2,ffl+0.25,FZ+sd*1.4);
   block(fx0+50,fx1-42,FZ-1.6,FZ+1.6,ffl,ffl+1);
   for(let x=fx0+60;x<fx1-60;x+=24)for(const sd of [-1,1]){box(3,0.6,2,darkM,x,ffl+0.3,FZ+sd*4);}
   // two footbridges over the channel
   for(const x of [fx0+120,fx0+230])box(3,0.5,5,ironM,x,ffl+1.1,FZ);}
  const sparks=createDust(api,{max:1500,size:0.6,color:0xffb050,drag:0.3,gravity:9,wind:[0,0,0]});

  // ================= the Delvings =================
  const DV=H.delvings,[dx0,dx1,dz0,dz1,dfl,dh]=DV,PX0=PIT.x-PIT.r,PX1=PIT.x+PIT.r,PZ0=PIT.z-PIT.r,PZ1=PIT.z+PIT.r,DEEP=FLOOR-400;
  room(DV,[op('n',4800,8,9)],{wall:stoneM,floor:false,name:'The Delvings'});
  {// the floor round the pit, in four pieces
   for(const [a,b,c,d] of [[dx0,dx1,dz0,PZ0],[dx0,dx1,PZ1,dz1],[dx0,PX0,PZ0,PZ1],[PX1,dx1,PZ0,PZ1]]){const f=new THREE.Mesh(new THREE.PlaneGeometry(b-a,d-c),floorM);f.rotation.x=-Math.PI/2;f.position.set((a+b)/2,dfl,(c+d)/2);put(f);
     CV.floor({name:'The Delvings',rect:[a,b,c,d],y:dfl});}
   // the pit's four walls, down to the lode, and the light of the mithril at the bottom
   const ph=dfl-DEEP;for(const [x,z,ry,w] of [[PIT.x,PZ0,0,2*PIT.r],[PIT.x,PZ1,0,2*PIT.r],[PX0,PIT.z,Math.PI/2,2*PIT.r],[PX1,PIT.z,Math.PI/2,2*PIT.r]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,ph),stoneM);m.position.set(x,DEEP+ph/2,z);m.rotation.y=ry;put(m);}
   const lode=new THREE.Mesh(new THREE.PlaneGeometry(2*PIT.r,2*PIT.r),new THREE.MeshBasicMaterial({color:0x9ac8ff}));lode.rotation.x=-Math.PI/2;lode.position.set(PIT.x,DEEP+0.5,PIT.z);put(lode);
   // a rail round the rim, and the scaffold stages down the sides, every thirty metres
   for(const [x,z,w,d] of [[PIT.x,PZ0-0.3,2*PIT.r,0.3],[PIT.x,PZ1+0.3,2*PIT.r,0.3],[PX0-0.3,PIT.z,0.3,2*PIT.r],[PX1+0.3,PIT.z,0.3,2*PIT.r]]){box(w,1.1,d,woodM,x,dfl+1,z);
     for(let y=dfl-30;y>DEEP+10;y-=30)box(w>1?w:4,0.6,d>1?d:4,woodM,x+(w>1?0:(x<PIT.x?2:-2)),y,z+(d>1?0:(z<PIT.z?2:-2)));}
   for(let k=0;k<4;k++){const x=k%2?PX1-1.5:PX0+1.5,z=k<2?PZ0+1.5:PZ1-1.5;box(0.8,ph,0.8,woodM,x,DEEP+ph/2,z);}}
  // the headframe over the pit: four legs leaning in, the wheel at the top, and the cage going up and down
  const HF=dfl+44;let cage,rope;
  {for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const a=new THREE.Vector3(PIT.x+sx*(PIT.r+6),dfl,PIT.z+sz*(PIT.r+6)),b=new THREE.Vector3(PIT.x+sx*6,HF,PIT.z+sz*6);
     const L=a.distanceTo(b),m=new THREE.Mesh(new THREE.BoxGeometry(2,L,2),woodM);m.position.copy(a).add(b).multiplyScalar(0.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());put(m);
     block(a.x-1.5,a.x+1.5,a.z-1.5,a.z+1.5,dfl,dfl+10);}
   box(16,2,16,woodM,PIT.x,HF,PIT.z);
   const wheel=new THREE.Mesh(new THREE.TorusGeometry(6,0.6,6,20),ironM);wheel.position.set(PIT.x,HF+7,PIT.z);put(wheel);
   rope=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,1,5).translate(0,-0.5,0),ironM);rope.position.set(PIT.x,HF,PIT.z);scene.add(rope);
   cage=new THREE.Mesh(new THREE.BoxGeometry(4,5,4),ironM);scene.add(cage);}
  // the carts on their loop round the pit
  const LOOP=PIT.r+24,carts=[];
  {for(const sd of [-1,1]){box(2*LOOP,0.2,0.3,ironM,PIT.x,dfl+0.1,PIT.z+sd*LOOP-0.7);box(2*LOOP,0.2,0.3,ironM,PIT.x,dfl+0.1,PIT.z+sd*LOOP+0.7);
     box(0.3,0.2,2*LOOP,ironM,PIT.x+sd*LOOP-0.7,dfl+0.1,PIT.z);box(0.3,0.2,2*LOOP,ironM,PIT.x+sd*LOOP+0.7,dfl+0.1,PIT.z);}
   for(let k=0;k<5;k++){const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.BoxGeometry(2.4,1.3,1.6).translate(0,1.0,0),ironM));
     g.add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.8,0).translate(0,1.8,0),darkM));scene.add(g);carts.push({g,ph:k/5});}}
  // mine galleries going off from the walls, and the mithril in the rock, in veins that catch any light
  {const arch=new THREE.Shape();arch.moveTo(-2.5,0);arch.lineTo(-2.5,4);arch.absarc(0,4,2.5,Math.PI,0,true);arch.lineTo(2.5,0);arch.lineTo(-2.5,0);
   const mouths=[];for(let x=dx0+30;x<dx1-20;x+=40)for(const [z,ry] of [[dz0+0.1,0],[dz1-0.1,Math.PI]])if(!(Math.abs(x-4800)<12&&z<dz0+1))mouths.push([x,z,ry]);
   for(let z=dz0+40;z<dz1-20;z+=40)for(const [x,ry] of [[dx0+0.1,Math.PI/2],[dx1-0.1,-Math.PI/2]])mouths.push([x,z,ry]);
   INST(new THREE.ShapeGeometry(arch,6),voidM,mouths,([x,z,ry],d)=>{reset();d.position.set(x,dfl,z);d.rotation.y=ry;});
   const veins=[];const vR=mkRng(47);
   for(let i=0;i<900;i++){const onPit=i<500,side=Math.floor(vR()*4);let x,z,y;
     if(onPit){y=DEEP+10+vR()*(dfl-DEEP-12);const u=(vR()-0.5)*2*PIT.r;[x,z]=[[PIT.x+u,PZ0+0.3],[PIT.x+u,PZ1-0.3],[PX0+0.3,PIT.z+u],[PX1-0.3,PIT.z+u]][side];}
     else{y=dfl+2+vR()*(dh-6);[x,z]=[[dx0+vR()*(dx1-dx0),dz0+0.3],[dx0+vR()*(dx1-dx0),dz1-0.3],[dx0+0.3,dz0+vR()*(dz1-dz0)],[dx1-0.3,dz0+vR()*(dz1-dz0)]][side];}
     veins.push([x,y,z,vR()]);}
   INST(new THREE.BoxGeometry(0.4,0.25,3.2),new THREE.MeshBasicMaterial({color:0xd8ecff}),veins,([x,y,z,r],d)=>{reset();d.position.set(x,y,z);d.rotation.set(r*3,r*6,r*2);d.scale.setScalar(0.5+r*1.6);});}

  // ================= the Hall of Durin's Throne =================
  const TH=H.throne,[tx0,tx1,tz0,tz1,tfl,th]=TH,TX=(tx0+tx1)/2;
  const thWallM=new THREE.MeshPhongMaterial({color:0x242226,specular:0x1c1c20,shininess:30,side:THREE.DoubleSide});
  room(TH,[op('s',TX,12,14),op('w',-610,8,9)],{wall:thWallM,floor:paveM,name:'The Hall of Durin\'s Throne'});
  {const pil=[];for(const x of [TX-100,TX+100])for(let z=tz1-40;z>tz0+80;z-=45)pil.push([x,z]);
   INST(new THREE.BoxGeometry(6,th,6).translate(0,th/2,0),darkM,pil,([x,z],d)=>{reset();d.position.set(x,tfl,z);});
   INST(new THREE.CylinderGeometry(6.8,3.4,8,4,1).rotateY(Math.PI/4).translate(0,th-4,0),darkM,pil,([x,z],d)=>{reset();d.position.set(x,tfl,z);});
   for(const [x,z] of pil)block(x-3.5,x+3.5,z-3.5,z+3.5,tfl,tfl+th);
   // the dais, three steps, and the throne on it
   [[120,60,1],[96,48,2],[72,36,3]].forEach(([w,d,k])=>{box(w,1,d,dressedM,TX,tfl+k-0.5,tz0+d/2);CV.floor({name:'The dais of the throne',rect:[TX-w/2,TX+w/2,tz0,tz0+d],y:tfl+k});});
   box(6,3,5,goldM,TX,tfl+4.5,tz0+14);box(6,11,1.4,goldM,TX,tfl+8.5,tz0+11.8);for(const sd of [-1,1])box(1,2,5,goldM,TX+sd*3.2,tfl+6.5,tz0+14);
   block(TX-4,TX+4,tz0+10,tz0+17,tfl+3,tfl+15);
   // the carpet down the hall to it, in Durin's day
   const carpet=new THREE.Mesh(new THREE.PlaneGeometry(10,tz1-tz0-60),new THREE.MeshLambertMaterial({color:0x6a1c1a}));carpet.rotation.x=-Math.PI/2;carpet.position.set(TX,tfl+0.06,(tz0+60+tz1)/2);scene.add(carpet);PEACE.push(carpet);
   // the crown and seven stars on the wall behind the throne, inlaid, shining when the hall is lit
   const cv=document.createElement('canvas');cv.width=512;cv.height=384;const g=cv.getContext('2d');g.strokeStyle='#e8eeff';g.fillStyle='#e8eeff';g.lineWidth=7;
   g.beginPath();g.moveTo(170,250);g.lineTo(186,170);g.lineTo(220,220);g.lineTo(256,150);g.lineTo(292,220);g.lineTo(326,170);g.lineTo(342,250);g.closePath();g.stroke();
   for(let k=0;k<7;k++){const a=Math.PI*(1.1+0.8*k/6),x=256+Math.cos(a)*170,y=230+Math.sin(a)*130;g.beginPath();for(let q=0;q<10;q++){const r=q%2?6:16,b=q/10*Math.PI*2-Math.PI/2;g.lineTo(x+Math.cos(b)*r,y+Math.sin(b)*r);}g.closePath();g.fill();}
   g.fillRect(206,280,100,18);g.beginPath();g.moveTo(256,270);g.lineTo(300,236);g.stroke();
   const emM=glows(new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,color:0xffffff}),0xffffff,0x2a2a30);
   const em=new THREE.Mesh(new THREE.PlaneGeometry(56,42),emM);em.position.set(TX,tfl+36,tz0+0.3);scene.add(em);
   // the Seven Fathers of the Dwarves, down the two sides of the hall
   // (the west side leaves the way to the cistern clear)
   const fathers=[];for(let k=0;k<7;k++){const west=k<4,z=west?[-690,-650,-560,-515][k]:tz0+100+(k-4)*90;fathers.push([west?tx0+20:tx1-20,z,west?Math.PI/2:-Math.PI/2]);}
   for(const [x,z,ry] of fathers){place(statue(20,dressedM),x,tfl+4,z,ry);box(12,4,12,dressedM,x,tfl+2,z);block(x-6.5,x+6.5,z-6.5,z+6.5,tfl,tfl+24);}}

  // ================= the Great Cistern =================
  const CI=H.cistern,[cx0,cx1,cz0,cz1,cfl,chh]=CI,CY=FLOOR+32,CZ=-610,CX=(cx0+cx1)/2;
  room(CI,[op('e',CZ,8,CY-cfl+9,CY-cfl)],{wall:stoneM,floor:darkM,walk:false});
  {const w=new THREE.Mesh(new THREE.PlaneGeometry(cx1-cx0,cz1-cz0),waterM);w.rotation.x=-Math.PI/2;w.position.set(CX,WATER,(cz0+cz1)/2);put(w);
   // the causeways, solid from the bottom, and their kerbs
   box(cx1-cx0-30,CY-cfl,8,dressedM,(cx0+30+cx1)/2,(cfl+CY)/2,CZ);box(6,CY-cfl,cz1-cz0-10,dressedM,CX,(cfl+CY)/2,(cz0+cz1)/2);
   CV.floor({name:'The Great Cistern',rect:[cx0+30,cx1,CZ-4,CZ+4],y:CY});CV.floor({name:'The Great Cistern',rect:[CX-3,CX+3,cz0+5,cz1-5],y:CY});
   // the pillars, standing out of the water in rows, ringed at the water-line
   const pil=[];for(let x=cx0+25;x<cx1-10;x+=40)for(let z=cz0+25;z<cz1-10;z+=40){if(Math.abs(z-CZ)<10||Math.abs(x-CX)<10)continue;pil.push([x,z]);}
   INST(new THREE.CylinderGeometry(2.4,2.8,chh,10).translate(0,chh/2,0),blackM,pil,([x,z],d)=>{reset();d.position.set(x,cfl,z);});
   INST(new THREE.TorusGeometry(2.9,0.35,5,12).rotateX(Math.PI/2),dressedM,pil,([x,z],d)=>{reset();d.position.set(x,WATER+0.4,z);});
   // at the west end the causeway ends on a landing, and water falls into the cistern out of the rock above it
   box(24,CY-cfl,20,dressedM,cx0+18,(cfl+CY)/2,CZ);CV.floor({name:'The Great Cistern',rect:[cx0+6,cx0+30,CZ-10,CZ+10],y:CY});}
  const fallM=new THREE.MeshBasicMaterial({color:0xcfe0e8,transparent:true,opacity:0.5,depthWrite:false});
  const fall=new THREE.Mesh(new THREE.PlaneGeometry(10,cfl+chh-8-WATER),fallM);fall.position.set(cx0+0.6,(WATER+cfl+chh-8)/2,CZ+24);fall.rotation.y=Math.PI/2;scene.add(fall);
  const spray=createDust(api,{max:600,size:1.6,color:0xc8d8e0,drag:1,gravity:3,wind:[0,0,0]});

  // ---- lay it all down ----
  for(const [mat,list] of byMat){const m=mergeParts(list,mat);m.receiveShadow=true;scene.add(m);}
  scene.add(CV.steps(new THREE.MeshPhongMaterial({color:0x56524c,specular:0x222222,shininess:14,flatShading:true})));

  // ---- the switch: lit or dark ----
  let glory=false;
  const setGlory=on=>{glory=on;for(const q of GLOW)q.mat.color.copy(on?q.lit:q.cold);for(const f of FACES){f.emissiveIntensity=on?1:0.04;f.color.setScalar(on?1:0.62);}};
  (ctx.onWar=ctx.onWar||[]).push(war=>setGlory(!war));setGlory(ctx.war===false);

  let t0=performance.now();
  animHooks.push(now=>{const t=(now-t0)/1000;
    // the cage in the pit, down and up, a minute each way
    const u=0.5-0.5*Math.cos(t*Math.PI/60),cy=HF-8-u*(HF-8-DEEP-6);cage.position.set(PIT.x,cy,PIT.z);rope.scale.y=HF-cy-2.5;
    // the carts round the loop
    for(const c of carts){const s=((t/90+c.ph)%1)*4,side=Math.floor(s),f=s-side,L=LOOP;
      const [x,z,ry]=side===0?[PIT.x-L+2*L*f,PIT.z-L,0]:side===1?[PIT.x+L,PIT.z-L+2*L*f,Math.PI/2]:side===2?[PIT.x+L-2*L*f,PIT.z+L,Math.PI]:[PIT.x-L,PIT.z+L-2*L*f,-Math.PI/2];
      c.g.position.set(x,dfl+0.2,z);c.g.rotation.y=-ry;}
    fallM.opacity=0.4+0.1*Math.sin(t*9);
    if(Math.random()<0.6)spray.emit(cx0+2+Math.random()*4,WATER+0.5,CZ+20+Math.random()*8,(Math.random()-0.2)*3,2+Math.random()*3,(Math.random()-0.5)*3,1.5,2);
    // the hammers: sparks off the anvils, in Durin's day
    if(glory)for(let k=0;k<2;k++){const a=anvils[Math.floor(Math.random()*anvils.length)];if(Math.random()<0.5)for(let q=0;q<6;q++)sparks.emit(a[0],a[1],a[2],(Math.random()-0.5)*6,3+Math.random()*5,(Math.random()-0.5)*6,0.8,0.6);}});

  ctx.moria.city={mansions:MA,forges:FO,delvings:DV,throne:TH,cistern:CI,glory:()=>glory};
  ctx.details=Object.assign(ctx.details||{},{houses:houses[0].length+houses[1].length+houses[2].length,floors:ctx.moria.floors.length,blocks:ctx.moria.blocks.length});
}
