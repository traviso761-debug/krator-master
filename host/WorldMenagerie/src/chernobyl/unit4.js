// ---------- Chernobyl: unit 4 as it was, and the RBMK inside it ----------
// Today unit 4 is under the arch. This keeps it as it stood in 1986, in four states (C.unit4; the Unit 4 button
// cycles them, #unit4=<state> in the address opens on one, api.ctx.unit4.set(state) from an event):
//   today      the arch, nothing of this shown
//   before     the night before: the arch gone, unit 4 whole beside unit 3, laid out as the main building's units
//              are (landmarks.js plant): its turbine hall and deaerator bay, the reactor block (44 m) and its reactor
//              hall (71 m); block V between units 3 and 4, and on it the ventilation stack VT-2, 150 m, its lattice
//              banded red and white round the tube (taken down in 2013)
//   explosion  the morning after: the reactor hall's roof gone and its walls broken, worst on the north side where
//              the block fell outward in a slope of rubble; the upper shield standing almost on edge in the shaft;
//              graphite blocks across the turbine hall's roof and the ground; the core's glow and fires on the roofs
//   shelter    1986 to 2016: the Shelter (Ukryttya) the liquidators built round the ruin by November 1986: the
//              stepped cascade wall on the north, the buttressed west wall, the two great beams over the reactor hall
//              and the roof of 27 steel pipes on them, the panels sloping down the south side; the stack beside it
//              still (until 2013). Built in parts (api.ctx.unit4.shelterParts) so an event can raise them in turn
//   cutaway    the building as a ghost and the RBMK-1000 inside it, cut in half on the north-south line: the
//              graphite stack and its 1,661 channels, the control rods with the graphite displacers under them,
//              the lower and upper shields ("Elena"), the steam-water pipes, the four drum separators, the eight
//              main circulation pumps, the floor over the reactor, and the refuelling machine on its crane; labelled
// The reactor's moving parts (the rods with their displacers, the water and steam in the channels, the upper shield)
// are their own meshes, set by api.ctx.unit4.reactor({rods, power, boil, lid, tilt}) for the RBMK event.
// Nothing here is in the layout fingerprint: it is drawn after the map, on the camera's layer only when shown.
import {landkit} from '../core/landkit.js';

export function unit4(api){
  const {THREE,C,P,groundH,scene,animHooks,camera}=api;const K=C.unit4;if(!K)return;
  const {Model}=landkit(api,{panel:0xd2d0c8,panelDark:0xaeaca4,rib:0xbab8b0,glazing:0x46505a,roofGrey:0x8a8884,stackRed:0xb83a2e,stackWhite:0xe8e4dc,
    stackTube:0xa8a8a2,graphite:0x34343a,sheet:0xa6a49c,rust:0x7a5034,shelterGrey:0x8e8a82,fuel:0x9a9a88,steel:0x8a9096,steelLight:0xb4bac0,pipe:0x9aa4aa,pump:0x4a6a8a,drum:0x6e7e6e,rodRed:0xb03030,
    displacer:0x18181c,debris:0x55504a,scorch:0x2a2622,shaft:0x8e8a82,floor:0xa89a7a,crane:0xd8b030,dark:0x2a2620,concrete:0xa8a49c,concreteDark:0x8a867e});
  const [AX,AZ]=P(K.at),G=groundH(AX,AZ),V=THREE.Vector2;
  // a rectangle [south, west, north, east] in lat/lon to local [x0, z0, x1, z1] about the unit's origin
  const R=([s,w,n,e])=>{const [x0,z1]=P([s,w]),[x1,z0]=P([n,e]);return [x0-AX,z0-AZ,x1-AX,z1-AZ];};
  // a round bar from one point to another
  const strut=(M,k,ax,ay,az,bx,by,bz,r)=>{const A=new THREE.Vector3(ax,ay,az),B=new THREE.Vector3(bx,by,bz),g=new THREE.CylinderGeometry(r,r,A.distanceTo(B),5);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize())));g.translate((ax+bx)/2,(ay+by)/2,(az+bz)/2);M.put(k,g,0,0,0);};
  const hash=(a,b)=>{const s=Math.sin(a*12.9898+b*78.233)*43758.5453;return s-Math.floor(s);};
  function kit(M){
    const block=(k,r,y0,y1)=>M.box(k,(r[0]+r[2])/2,y0,(r[1]+r[3])/2,r[2]-r[0],y1-y0,r[3]-r[1]);
    const face=(r,f)=>{const ew=f==='N'||f==='S';return {ew,a0:ew?r[0]:r[1],a1:ew?r[2]:r[3],o:f==='N'?r[1]:f==='S'?r[3]:f==='E'?r[2]:r[0],sg:f==='N'||f==='W'?-1:1};};
    const rib=(k,r,f,step,y0,y1,w=0.8,d=0.5)=>{const F=face(r,f);for(let u=F.a0+2;u<=F.a1-2;u+=step)M.box(k,F.ew?u:F.o+F.sg*d/2,y0,F.ew?F.o+F.sg*d/2:u,F.ew?w:d,y1-y0,F.ew?d:w);};
    const band=(k,r,f,y0,h,end=3)=>{const F=face(r,f),len=F.a1-F.a0-end*2,m=(F.a0+F.a1)/2;M.box(k,F.ew?m:F.o+F.sg*0.15,y0,F.ew?F.o+F.sg*0.15:m,F.ew?len:0.3,h,F.ew?0.3:len);};
    // a wall broken off along its top: segments of `step` m, each to its own height from h(u)
    const broken=(k,r,f,y0,h,step=3.5,t=0.8)=>{const F=face(r,f);for(let u=F.a0;u<F.a1-0.1;u+=step){const w=Math.min(step,F.a1-u),hh=h(u);if(hh<=y0+0.5)continue;
      M.box(k,F.ew?u+w/2:F.o-F.sg*t/2,y0,F.ew?F.o-F.sg*t/2:u+w/2,F.ew?w:t,hh-y0,F.ew?t:w);}};
    return {block,rib,band,broken};}
  const L0=K.layout||{};
  const TH=R(L0.hall||[51.38868,30.0972,51.38914,30.1001]),DB=R(L0.deaerator||[51.38914,30.0972,51.38926,30.1001]),
    BA=R(L0.base||[51.38926,30.0983,51.39000,30.0997]),HL=R(L0.reactorHall||[51.38932,30.09887,51.38982,30.09931]),BV=R(L0.blockV||[51.38926,30.0997,51.38995,30.10035]);
  const [SX,SZ]=(([x,z])=>[x-AX,z-AZ])(P(L0.stack||[51.38945,30.1001]));
  const HT=31,HD=47,BH=44,TOP=71,VH=L0.blockVH||50,cx=(HL[0]+HL[2])/2,cz=(HL[1]+HL[3])/2;
  // ---- the shared parts: the turbine hall, the deaerator bay, block V ----
  function common(M,k,ruined){
    k.block('panel',TH,0,HT);for(const f of ['S','N']){k.rib('panelDark',TH,f,12,0,HT,1.4,0.9);k.band('glazing',TH,f,7,6);k.band('glazing',TH,f,17,9);}
    k.rib('panelDark',TH,'W',12,0,HT,1.4,0.9);k.band('glazing',TH,'W',17,9,6);
    M.box('roofGrey',(TH[0]+TH[2])/2,HT,(TH[1]+TH[3])/2,TH[2]-TH[0]-8,ruined?0.6:2.8,7);
    k.block('panel',DB,0,HD);for(const f of ['S','N']){k.rib('panelDark',DB,f,6,HT,HD,0.8,0.5);for(let y=HT+3;y<HD-3;y+=5)k.band('glazing',DB,f,y,1.6);}
    k.block('panel',BV,0,VH);for(const f of ['N','W','E'])k.rib('rib',BV,f,6,0,VH,0.7,0.4);for(let y=6;y<VH-3;y+=8)k.band('panelDark',BV,'N',y,0.6);
    // the ventilation stack: the tube, and round it the four-legged lattice, banded red and white by sections
    const SH=L0.stackH||150,y0=VH;M.cyl('stackTube',SX,y0,SZ,3.2,3.0,SH-y0,16);
    const leg=(y)=>6.5-(y-y0)/(SH-y0)*3.2;
    for(let y=y0;y<SH-3;y+=10){const k2=Math.floor((y-y0)/10)%2?'stackWhite':'stackRed',a=leg(y),b=leg(Math.min(SH-3,y+10)),h=Math.min(10,SH-3-y);
      const C4=[[1,1],[1,-1],[-1,-1],[-1,1]];
      for(const [sx,sz] of C4)strut(M,k2,SX+sx*a,y,SZ+sz*a,SX+sx*b,y+h,SZ+sz*b,0.35);
      // the ring at the section's foot and the X-bracing of each face
      for(let i=0;i<4;i++){const [ax,az]=C4[i],[bx,bz]=C4[(i+1)%4];strut(M,k2,SX+ax*a,y,SZ+az*a,SX+bx*a,y,SZ+bz*a,0.22);
        strut(M,k2,SX+ax*a,y,SZ+az*a,SX+bx*b,y+h,SZ+bz*b,0.14);strut(M,k2,SX+bx*a,y,SZ+bz*a,SX+ax*b,y+h,SZ+az*b,0.14);}
      if(((y-y0)/10)%3===2)M.box('stackWhite',SX,y+h-0.3,SZ,2*b+2,0.3,2*b+2);}   // a platform every 30 m
    M.box('stackRed',SX,SH-3,SZ,7.4,1.2,7.4);
  }
  // ---- unit 4 as it stood ----
  function before(M,k){
    k.block('panel',BA,0,BH);for(const f of ['N','S','E','W'])k.rib('rib',BA,f,6,0,BH,0.7,0.4);for(const f of ['N','W'])for(let y=6;y<BH-4;y+=9)k.band('panelDark',BA,f,y,0.6);
    k.block('panel',HL,BH,TOP);for(const f of ['N','S','E','W']){k.rib('rib',HL,f,3,BH,TOP-2,0.5,0.35);k.band('panelDark',HL,f,TOP-3,1.6,0);}
    M.box('roofGrey',cx,TOP,cz,HL[2]-HL[0]-6,1.6,HL[3]-HL[1]-10);
    for(const sx of [BA[0]+5,BA[2]-5])M.box('panelDark',sx,0,BA[1]+5,8,BH+7,8);}
  // ---- the morning after ----
  function ruin(M,k,clean){
    // the block: whole along the south, falling away to the north
    const mid=(BA[1]+BA[3])/2;k.block('panel',[BA[0],mid,BA[2],BA[3]],0,BH);for(const f of ['S','W'])k.rib('rib',BA,f,6,0,BH,0.7,0.4);
    k.broken('panel',[BA[0],BA[1],BA[2],mid],'W',0,u=>BH-Math.max(0,(mid-u))/(mid-BA[1])*26-hash(u,1)*6);
    k.broken('panel',[BA[0],BA[1],BA[2],mid],'E',0,u=>BH-Math.max(0,(mid-u))/(mid-BA[1])*22-hash(u,2)*6);
    k.broken('panel',BA,'N',0,u=>8+hash(u,3)*10+(Math.abs(u-cx)<20?0:6));
    for(let y=8;y<BH;y+=7.5)M.box('concreteDark',(BA[0]+BA[2])/2,y,(BA[1]+mid)/2+3,BA[2]-BA[0]-4,0.5,mid-BA[1]-8);   // the floors, open to the north
    // the reactor hall: no roof, its walls broken off, the north one almost gone
    k.broken('panel',HL,'S',BH,u=>BH+8+hash(u,4)*14);k.broken('panel',HL,'E',BH,u=>BH+4+hash(u,5)*16*((u-HL[1])/(HL[3]-HL[1])));
    k.broken('panel',HL,'W',BH,u=>BH+2+hash(u,6)*12*((u-HL[1])/(HL[3]-HL[1])));k.broken('panel',HL,'N',BH,u=>BH+hash(u,7)*4);
    if(!clean)k.block('scorch',[HL[0]+3,HL[1]+3,HL[2]-3,HL[3]-3],BH-0.5,BH);
    // the rubble the block fell into on its north side, and the debris thrown over the roofs and the ground
    M.put('debris',new THREE.CylinderGeometry(0,1,1,4,1).rotateY(Math.PI/4),(BA[0]+BA[2])/2,0,BA[1]-12,0,0,0,[(BA[2]-BA[0])*0.7,18,26]);
    if(!clean)for(let i=0;i<420;i++){const a=hash(i,8)*Math.PI*2,d=8+Math.pow(hash(i,9),0.6)*170,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d*0.8;
      const onTH=x>TH[0]&&x<TH[2]&&z>TH[1]&&z<TH[3],y=onTH?HT+0.3:x>DB[0]&&x<DB[2]&&z>DB[1]&&z<DB[3]?HD:x>BV[0]&&x<BV[2]&&z>BV[1]&&z<BV[3]?VH:(x>BA[0]&&x<BA[2]&&z>BA[1]&&z<BA[3])?-1:0;
      if(y<0)continue;const g=i%3?'graphite':'debris';M.box(g,x,y,z,0.25+hash(i,10)*0.6,0.25+hash(i,11)*0.5,0.6+hash(i,12)*1.4,hash(i,13)*3);}
    // the upper shield thrown up and dropped back almost on edge in the shaft
    M.put('steel',new THREE.CylinderGeometry(8.5,8.5,3,32),cx,30,cz,0.3,0,1.3);}
  // ---- the Shelter, in the parts it went up in ----
  const SHP={
    // the cascade wall: four steps of concrete poured behind steel forms, down the north side over the rubble
    cascade(M,k){for(let i=0;i<4;i++){const z1=BA[1]-i*7,z0=z1-7,h=50-i*11.5;k.block('shelterGrey',[BA[0]-4,z0,BA[2]+4,z1],0,h);
        k.rib('rust',[BA[0]-4,z0,BA[2]+4,z1],'N',6,0,h,0.5,0.3);M.box('sheet',(BA[0]+BA[2])/2,h,(z0+z1)/2,BA[2]-BA[0]+8,0.6,7);}},
    // the west wall: concrete below, steel above, held by buttresses stepping out at its foot
    buttress(M,k){const r=[BA[0]-6,BA[1]-28,BA[0],BA[3]];k.block('shelterGrey',r,0,26);k.block('sheet',r,26,58);k.rib('rust',r,'W',4,26,58,0.4,0.3);
      for(let z=r[1]+4;z<r[3]-2;z+=8)for(const [d,h] of [[14,14],[10,30],[6,46]])M.box('shelterGrey',BA[0]-6-d/2,0,z,d,h,1.6);},
    // the two great beams over the reactor hall, from the west wall to block V
    beams(M,k){for(const z of [HL[1]-2,HL[3]+2])M.box('rust',(BA[0]+BV[0])/2,56,z,BV[0]-BA[0]+6,6,3);
      for(let x=BA[0]+8;x<BV[0];x+=12)M.box('rust',x,56,(HL[1]+HL[3])/2,1.4,4,HL[3]-HL[1]+4);},
    // the roof: 27 pipes 1.2 m across laid north to south on the beams, and the panels sloping south
    roof(M,k){const x0=cx-17.5;for(let i=0;i<27;i++)M.put('rust',new THREE.CylinderGeometry(0.6,0.6,HL[3]-HL[1]+10,8).rotateX(Math.PI/2),x0+i*1.35,62.6,cz);
      k.block('sheet',[BA[0],BA[1]-1,x0-1,HL[3]+3],61,62);k.block('sheet',[x0+36,BA[1]-1,BV[0],HL[3]+3],61,62);
      const zs=HL[3]+3,ze=BA[3]+2,len=Math.hypot(ze-zs,62-46),ang=Math.atan2(62-46,ze-zs);
      M.put('sheet',new THREE.BoxGeometry(BV[0]-BA[0],0.8,len).translate(0,0,len/2),(BA[0]+BV[0])/2,62,zs,0,ang);
      for(let x=BA[0]+4;x<BV[0];x+=8)M.put('rust',new THREE.BoxGeometry(0.8,1.6,len).translate(0,0,len/2),x,62.6,zs,0,ang);}};
  // ---- the RBMK-1000, cut in half: the south half taken away ----
  const LABELS=[];
  function rbmk(M){
    const half=(k,pts,seg=40)=>M.put(k,new THREE.LatheGeometry(pts,seg,Math.PI/2,Math.PI),cx,0,cz);
    const disc=(k,r,y0,h)=>{half(k,[new V(0,y0),new V(r,y0),new V(r,y0+h),new V(0,y0+h)]);M.box(k,cx,y0,cz+0.01,2*r,h,0.02);};
    const Y0=17;   // the lower shield's underside
    // the concrete shaft and its annular water tank, cut
    half('shaft',[new V(11,Y0-2),new V(14,Y0-2),new V(14,BH-6),new V(11,BH-6),new V(11,Y0-2)]);
    disc('steel',7.4,Y0,2);                                         // the lower shield, "OR"
    disc('graphite',5.9,Y0+2,7);                                    // the graphite stack
    // control rods in the cut plane, withdrawn as they were that night: the boron-carbide absorber over the core,
    // the graphite displacer in it, a column of water under that
    // (the channels' water and steam, the rods and the upper shield move: their own meshes, below)
    for(let i=0;i<120;i++){const a=Math.PI/2+hash(i,20)*Math.PI,r=Math.sqrt(hash(i,21))*7.5;M.cyl('pipe',cx+Math.sin(a)*r,Y0+12,cz+Math.cos(a)*r,0.09,0.09,3.2,5);}   // the steam-water lines leaving the channels
    disc('floor',8.5,Y0+15.5,0.6);                                  // the floor over the reactor, its blocks
    // the drum separators, two each side, along the reactor; downcomers to the pumps, and the pumps below
    for(const s of [-1,1]){for(const dz of [11,14.5]){const z=cz+s*dz;M.put('drum',new THREE.CylinderGeometry(1.3,1.3,30,16).rotateZ(Math.PI/2),cx,Y0+16,z);
        for(const u of [-10,-3.3,3.3,10])M.cyl('pipe',cx+u,Y0-3,z,0.3,0.3,19,6);}
      for(let i=0;i<4;i++){const x=cx-10.5+i*7,z=cz+s*18;M.cyl('pump',x,Y0-10,z,1.4,1.4,5,12);M.cyl('steel',x,Y0-5,z,1.1,1.1,3.2,12);M.box('pipe',x,Y0-8,cz+s*12.5,0.6,0.6,11);}
      M.box('pipe',cx,Y0-8.6,cz+s*7,22,0.8,0.8);}   // the group headers feeding water up into the channels from below
    for(let u=-5;u<=5;u+=1.25)M.box('pipe',cx+u,Y0-8.2,cz-6.8,0.12,10.2,0.12);
    // the reactor hall's bridge crane and the refuelling machine hanging from its own gantry
    M.box('crane',cx,62,cz,4,2,HL[3]-HL[1]-2);M.box('crane',cx-12,58,cz,3,1.4,HL[3]-HL[1]-2);
    M.box('steelLight',cx-12,Y0+20,cz-3,5,20,5);M.box('steel',cx-12,Y0+40,cz-3,8,4,8);
    const lab=[['Graphite stack: 11.8 m across, 7 m high, 1,661 fuel channels',cx-16,Y0+5.5,cz+6],['Control rods: absorber above, graphite displacer below',cx+16,Y0+9,cz+6],
      ['Upper biological shield "Elena"',cx+15,Y0+12,cz+4],['Lower shield "OR"',cx-14,Y0+0.5,cz+4],['Drum separators (four, 30 m long)',cx+20,Y0+18,cz-14],
      ['Main circulation pumps (eight)',cx+22,Y0-8,cz-18],['Refuelling machine',cx-24,Y0+30,cz-3],['Reactor hall floor',cx-18,Y0+16.5,cz+3]];
    for(const [t,x,y,z] of lab)LABELS.push([t,x,y,z]);}
  // the label sprites: always on top, about 14 m wide
  function label(t,x,y,z){const c=document.createElement('canvas');c.width=512;c.height=64;const g=c.getContext('2d');g.fillStyle='rgba(18,18,14,0.82)';g.fillRect(0,0,512,64);
    g.fillStyle='#d8b030';g.fillRect(0,0,6,64);g.fillStyle='#eeeadc';g.font='26px Georgia, serif';g.textBaseline='middle';g.fillText(t,16,33,488);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));s.scale.set(26,3.25,1);s.position.set(x,y,z);s.renderOrder=10;s.userData.noFingerprint=true;return s;}
  // ---- build the four groups ----
  const mk=(name,info,fn)=>{const M=Model(),k=kit(M);fn(M,k);const g=M.finish({name,info,model:'unit4'},AX,G,AZ,0);g.traverse(o=>{o.userData.noFingerprint=true;});return g;};
  const I=K.info||{};
  const gBefore=mk('Unit 4, April 1986',I.before||'',(M,k)=>{common(M,k,false);before(M,k);}),
    gRuin=mk('Unit 4 after the explosion',I.explosion||'',(M,k)=>{common(M,k,true);ruin(M,k);}),
    gShell=mk('Unit 4, cut away',I.cutaway||'',(M,k)=>{common(M,k,false);before(M,k);}),
    gCore=mk('The RBMK-1000',I.cutaway||'',(M)=>rbmk(M)),
    gShBase=mk('The Shelter, 1986 to 2016',I.shelter||'',(M,k)=>{common(M,k,false);ruin(M,k,true);}),
    gSh=Object.fromEntries(Object.keys(SHP).map(p=>[p,mk('The Shelter, 1986 to 2016',I.shelter||'',(M,k)=>SHP[p](M,k))]));
  for(const [t,x,y,z] of LABELS)gCore.add(label(t,x,y,z));
  // ---- the reactor's moving parts, in the cut plane ----
  const RY0=17,COLS=45,ROWS=7,cell=new THREE.Color(),WATER=new THREE.Color(0x2e5a9a),STEAM=new THREE.Color(0xe8eef4),HOT=new THREE.Color(0xff7a20),WHITE=new THREE.Color(0xfff4d8);
  const chan=new THREE.InstancedMesh(new THREE.BoxGeometry(0.11,0.96,0.02),new THREE.MeshBasicMaterial({color:0xffffff}),COLS*ROWS);chan.userData.noFingerprint=true;
  {const d=new THREE.Object3D();for(let i=0;i<COLS;i++)for(let j=0;j<ROWS;j++){d.position.set(cx-5.5+i*0.25,RY0+2.5+j,cz+0.05);d.updateMatrix();chan.setMatrixAt(i*ROWS+j,d.matrix);chan.setColorAt(i*ROWS+j,WATER);}}
  gCore.add(chan);
  const rodM=new THREE.MeshLambertMaterial({color:0xb03030}),dispM=new THREE.MeshLambertMaterial({color:0x18181c}),tubeM=new THREE.MeshLambertMaterial({color:0x9aa4aa});
  const atY=(m,y)=>{m.position.y=y;return m;};
  const rods=[-4.5,-2.25,0,2.25,4.5].map(u=>{const r=new THREE.Group();
    // the absorber (5 m of boron carbide) withdrawn over the core, a 1.25 m link, the graphite displacer (4.5 m) in the core,
    // and under it a column of water at the core's foot
    r.add(atY(new THREE.Mesh(new THREE.BoxGeometry(0.18,5,0.06).translate(0,2.5,0),rodM),RY0+9.0));
    r.add(atY(new THREE.Mesh(new THREE.BoxGeometry(0.05,1.25,0.06).translate(0,0.625,0),tubeM),RY0+7.75));
    r.add(atY(new THREE.Mesh(new THREE.BoxGeometry(0.18,4.5,0.06).translate(0,2.25,0),dispM),RY0+3.25));
    r.position.set(cx+u,0,cz+0.09);r.traverse(o=>{o.userData.noFingerprint=true;});gCore.add(r);return r;});
  const elena=new THREE.Group(),elM=new THREE.MeshLambertMaterial({color:0x8a9096});
  elena.add(new THREE.Mesh(new THREE.LatheGeometry([new V(0,-1.5),new V(8.5,-1.5),new V(8.5,1.5),new V(0,1.5)],40,Math.PI/2,Math.PI),elM),new THREE.Mesh(new THREE.BoxGeometry(17,3,0.02),elM));
  elena.position.set(cx,RY0+10.5,cz);elena.traverse(o=>{o.userData.noFingerprint=true;});gCore.add(elena);
  // rods: metres moved down from the withdrawn position; power: 1 at full (3,200 MW); boil: 0 water to the top, 1 steam
  // all through; lid: metres the upper shield is lifted, tilt its turn in radians
  function reactor({rods:d=0,power=0.06,boil=0.15,lid=0,tilt=0}={}){for(const r of rods)r.position.y=-d;
    const hot=Math.min(1,Math.max(0,Math.log10(Math.max(power,1e-3))/2)),flick=power>3?0.8+0.2*Math.random():1;
    for(let i=0;i<COLS;i++)for(let j=0;j<ROWS;j++){const v=Math.max(0,Math.min(1,(j+1)/ROWS-(1-boil)+0.12*Math.sin(i*1.7)));
      cell.copy(WATER).lerp(STEAM,v);if(hot>0)cell.lerp(i%4?HOT:WHITE,hot*flick*(0.6+0.4*v));chan.setColorAt(i*ROWS+j,cell);}
    chan.instanceColor.needsUpdate=true;elena.position.y=RY0+10.5+lid;elena.rotation.x=tilt;}
  reactor();
  // the cutaway's building as a ghost: its own transparent copies of the materials
  const ghost=new Map();gShell.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(!ghost.has(m)){const q=m.clone();q.transparent=true;q.opacity=0.14;q.depthWrite=false;ghost.set(m,q);}o.material=ghost.get(m);o.castShadow=false;});
  // the core's glow and the fires on the roofs, for the explosion
  const soft=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.4,'rgba(255,255,255,0.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  let fireK=1,coreK=1;
  const fx=[];const flame=(col,s,x,y,z)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:soft,color:col,transparent:true,opacity:0.8,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
    sp.scale.setScalar(s);sp.position.set(x,y,z);sp.userData.noFingerprint=true;gRuin.add(sp);fx.push({sp,s,ph:hash(x,z)*6});};
  flame(0xb8d0ff,40,cx,BH+6,cz);flame(0xff8a3a,26,cx,BH+2,cz);
  const roofFx0=fx.length;
  for(let i=0;i<9;i++)flame(0xff7a2a,6+hash(i,30)*6,TH[0]+15+hash(i,31)*(TH[2]-TH[0]-30),HT+2,TH[1]+6+hash(i,32)*(TH[3]-TH[1]-12));
  flame(0xff7a2a,8,(BV[0]+BV[2])/2,VH+2,(BV[1]+BV[3])/2);
  // ---- the states ----
  const arch=()=>(api.LANDMARKS||[]).find(g=>g.userData.info&&g.userData.info.model==='arch');
  const show=(g,on)=>g.traverse(o=>{if(on)o.layers.set(0);else o.layers.set(7);});
  const STATES=['today','before','explosion','shelter','cutaway'],NAMES={today:'Unit 4: today',before:'Unit 4: April 1986',explosion:'Unit 4: the explosion',shelter:'Unit 4: the Shelter',cutaway:'Unit 4: the reactor'};
  let state='today',btn=null;
  function set(s){if(!STATES.includes(s)&&s!=='building')s='today';state=s;fireK=1;coreK=1;const A=arch();if(A)show(A,s==='today');
    show(gBefore,s==='before');show(gRuin,s==='explosion');show(gShell,s==='cutaway');show(gCore,s==='cutaway');
    show(gShBase,s==='shelter'||s==='building');for(const p in gSh){show(gSh[p],s==='shelter');gSh[p].scale.y=1;gSh[p].position.y=G;}
    if(s!=='cutaway')reactor();
    if(btn){btn.textContent=NAMES[s]||NAMES.shelter;btn.setAttribute('aria-pressed',String(s!=='today'));}
    api.ctx.details=Object.assign(api.ctx.details||{},{unit4:s});}
  set(K.start||'today');
  // the roof fires burn at fireK (1 burning, 0 out: the firefighters put them out), the core's glow at coreK
  animHooks.push(now=>{if(state!=='explosion')return;fx.forEach((f,i)=>{const k=i<roofFx0?coreK:Math.max(0,Math.min(1,fireK*1.6-(i-roofFx0)*0.06));
    f.sp.material.opacity=(0.55+0.3*Math.sin(now*0.009+f.ph))*k;f.sp.scale.setScalar(f.s*(0.9+0.15*Math.sin(now*0.013+f.ph*2))*(0.4+0.6*k));});});
  const W=(x,y,z)=>[AX+x,G+y,AZ+z];
  // the roofs, for what falls on them: [x0, z0, x1, z1, height] in the world
  const roofs=[[...TH,HT],[...DB,HD],[...BV,VH],[...HL,BH],[...BA,30]].map(([x0,z0,x1,z1,h])=>[AX+x0,AZ+z0,AX+x1,AZ+z1,G+h]);
  // where to look from for each state, if the camera should go there
  const VIEW={before:[-260,95,240,0,45,0],shelter:[-230,90,-230,0,40,0],explosion:[-150,110,-260,0,40,0],cutaway:[-34,36,54,0,24,-1]};
  const view=s=>{const v=VIEW[s]||VIEW.before;return [AX+cx+v[0],G+v[1],AZ+cz+v[2],AX+cx+v[3],G+v[4],AZ+cz+v[5]];},look=s=>{if(VIEW[s]&&api.setView)api.setView(...view(s));};
  api.onUI&&api.onUI(({ui,mkBtn})=>{btn=mkBtn(NAMES.today,ui,()=>{const s=STATES[(STATES.indexOf(state)+1)%STATES.length];set(s);look(s);});btn.title='Unit 4 today, as it stood in April 1986, after the explosion, under the Shelter (1986 to 2016), and cut away to show the reactor';
    const m=/(^|[#&])unit4=([a-z]+)/.exec(location.hash);if(m){const fly=!/(^|[#&])(v|view)=/.test(location.hash);setTimeout(()=>{set(m[2]);if(fly)look(m[2]);},60);}else set(state);});
  api.ctx.unit4={set,look,view,reactor,roofs,
    fires:(k,c)=>{fireK=k;if(c!=null)coreK=c;},firePts:()=>fx.slice(roofFx0).map(f=>W(f.sp.position.x,f.sp.position.y-2,f.sp.position.z)),
    // where the fire engines stand: along the turbine hall's south wall and at its west end; its roof's south edge;
    // block V's roof and the foot of its outside stairs
    spots:{hallSouth:[0.15,0.35,0.55,0.75].map(u=>W(TH[0]+(TH[2]-TH[0])*u,0,TH[3]+9)),hallWest:W(TH[0]-12,0,(TH[1]+TH[3])/2),hallEdge:u=>W(TH[0]+(TH[2]-TH[0])*u,HT,TH[3]-1),
      hallRoof:W((TH[0]+TH[2])/2,HT,(TH[1]+TH[3])/2),vFoot:W(BV[2]+10,0,(BV[1]+BV[3])/2),vRoof:W((BV[0]+BV[2])/2,VH,(BV[1]+BV[3])/2),vEdge:W(BV[2]-1,VH,(BV[1]+BV[3])/2),
      ruinW:W(BA[0]+8,BH-6,(BA[1]+BA[3])/2)},
    shelterAt:{crane:W(BA[0]-90,0,(BA[1]+BA[3])/2),tip:W(cx,112,cz)},shelterParts:gSh,show,centre:()=>[AX+cx,G+30,AZ+cz],state:()=>state};
}
