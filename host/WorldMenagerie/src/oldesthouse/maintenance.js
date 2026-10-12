// ---------- the Maintenance Sector ----------
// Fan work after Remedy Entertainment's Control (2019); nothing of theirs is used. Built from the kit (kit.js).
//
// East of the Executive, a little lower: where the House is kept running. The transit corridor from the Executive
// comes in at the west edge, past the janitor's office, to a hub; from it -
//   north   a corridor to the NSC Power Plant: a round chamber seventy metres across and sixty high, the reactor
//           column glowing in the middle, three walkways in to it from the ring catwalk, cables slung from the
//           wall, the control room's windows high up, machinery on the floor far below
//   south   down into the Black Rock Quarry: a cavern of black rock, black cubes stacked across its floor, a
//           conveyor, scaffolding and ladders, floodlights glaring on poles through the mist
//   east    the pipeworks: a long grated corridor lined with orange pipes, off it the coolant pumps and the
//           ventilation room with its great slow fan, and at the end the Furnace Chamber - a golden hall, a grand
//           stair climbing to the blazing mouth of the furnace
// Events: 'Power the plant' (the plant goes dark, the ring lights come on one by one, the core surges) and
// 'The Furnace' (the mouth flares and embers pour up out of it).
// Coordinates: relative to the sector's origin K.O; x east, z south, y up.

export function buildMaintenance(K){
  const {THREE,B,F,lights,dyn,T}=K;const [ox,oy,oz]=K.O,rnd=K.rnd;
  const A=(x,y,z)=>[ox+x,oy+y,oz+z];
  const clamp=(v,a,b)=>v<a?a:v>b?b:v;

  // ---- a wall with holes: a,b are [x,z] (relative), holes [[u0,u1,ya,yb]] u along a->b, y relative ----
  function wall(m,a,b,y0,y1,inward,holes){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
    const cuts=new Set([0,L]);for(const h of holes||[]){cuts.add(clamp(h[0],0,L));cuts.add(clamp(h[1],0,L));}
    const cs=[...cuts].sort((p,q)=>p-q);
    for(let i=0;i+1<cs.length;i++){const ua=cs[i],ub=cs[i+1];if(ub-ua<0.01)continue;const mid=(ua+ub)/2;let ys=[[y0,y1]];
      for(const h of holes||[])if(mid>h[0]&&mid<h[1]){const n=[];for(const [p,q] of ys){if(h[2]>p)n.push([p,Math.min(q,h[2])]);if(h[3]<q)n.push([Math.max(p,h[3]),q]);}ys=n;}
      for(const [p,q] of ys)if(q-p>0.01)B.quad(m,A(a[0]+ux*ua,p,a[1]+uz*ua),A(a[0]+ux*ub,p,a[1]+uz*ub),A(a[0]+ux*ub,q,a[1]+uz*ub),A(a[0]+ux*ua,q,a[1]+uz*ua),inward);}}
  // a room facing in; holes per side in the side's own along-coordinate (n,s: x; e,w: z) and relative y
  function room(x0,y0,z0,x1,y1,z1,mt,holes={}){
    if(mt.floor)B.quad(mt.floor,A(x0,y0,z0),A(x1,y0,z0),A(x1,y0,z1),A(x0,y0,z1),[0,1,0]);
    if(mt.ceil)B.quad(mt.ceil,A(x0,y1,z0),A(x0,y1,z1),A(x1,y1,z1),A(x1,y1,z0),[0,-1,0]);
    const cv=(hs,base)=>(hs||[]).map(h=>[h[0]-base,h[1]-base,h[2],h[3]]);
    wall(mt.wall,[x0,z0],[x1,z0],y0,y1,[0,0,1],cv(holes.n,x0));wall(mt.wall,[x0,z1],[x1,z1],y0,y1,[0,0,-1],cv(holes.s,x0));
    wall(mt.wall,[x0,z0],[x0,z1],y0,y1,[1,0,0],cv(holes.w,z0));wall(mt.wall,[x1,z0],[x1,z1],y0,y1,[-1,0,0],cv(holes.e,z0));}
  const box=(m,x0,y0,z0,x1,y1,z1,skip)=>B.box(m,ox+x0,oy+y0,oz+z0,ox+x1,oy+y1,oz+z1,skip);
  const blk=(m,x,y,z,w,h,d)=>B.blk(m,ox+x,oy+y,oz+z,w,h,d);
  const beam=(m,p,q,w,h)=>B.beam(m,A(...p),A(...q),w,h);
  const lamp=(x,y,z,c,i,r,dir)=>lights.add(A(x,y,z),c,i,r,dir);
  const panels=(x0,z0,x1,z1,y,step,i,r,c)=>F.panels(ox+x0,oz+z0,ox+x1,oz+z1,oy+y,step,i,r,c);
  const rail=(p,q,h)=>F.rail(A(...p),A(...q),h);
  const zone=(x0,y0,z0,x1,y1,z1,c,k)=>lights.zone(A(x0,y0,z0),A(x1,y1,z1),c,k);
  const card=(k,h,p,sub)=>{K.cards[k]={h,p,sub:sub||'The Maintenance Sector'};};
  const view=(name,t,d,yaw,pitch,c)=>{const v={name,group:'Maintenance',t:A(...t),d,yaw,pitch,card:c,cut:false};K.views.push(v);return v;};
  const place=(n,p,r)=>K.places.push([n,A(...p),r]);
  const fog=(p,r,color,density)=>K.zones.push({c:A(...p),r,color,density});
  const CORR={floor:'concrete',wall:'concreteDark',ceil:'concrete:ceil'},PIPE={floor:'grate',wall:'concreteDark',ceil:'concreteDark:ceil'};

  // ================================================================ the way in, the janitor's office, the hub
  room(-180,0,-4,-75,6,4,CORR,{w:[[-4,4,0,6]],e:[[-4,4,0,6]],n:[[-118,-115,0,2.6]]});
  panels(-176,0,-80,0,6,8,0.9,13,0xfff0d8);
  for(const s of [-1,1]){F.pipe(A(-180,4.6,s*3.4),A(-75,4.6,s*3.4),0.35,'pipe');F.pipe(A(-180,5.4,s*3.2),A(-75,5.4,s*3.2),0.2,'steel');}
  zone(-180,-1,-5,-75,7,5,0x6a6450,0.35);
  // the janitor's office: a desk and his radio, shelves of supplies, the mop and its bucket, a lamp
  room(-124,0,-14,-110,3.2,-4,{floor:'tile',wall:'panel',ceil:'ceiling:ceil'},{s:[[-118,-115,0,2.6]]});
  F.desk(ox-120,oy,oz-11,0);F.chair(ox-120,oy,oz-10,Math.PI);blk('woodDark',-121,0.76,-11.2,0.5,0.3,0.3);blk('steelDark',-120.8,1.06,-11.2,0.04,0.4,0.04);
  F.shelves(ox-117,oy,oz-13.6,0,4,2.4);F.cabinet(ox-123.4,oy,oz-6,-Math.PI/2);
  beam('wood',[-112,0,-12],[-111.6,1.6,-12.4],0.05,0.05);blk('paper',-112,0,-12,0.4,0.15,0.2);B.cyl('yellow',ox-111.2,oy,oz-11,0.3,0.35,0.4,10,{caps:true});
  F.lamp(ox-118.6,oy+1.1,oz-11.3,0xffc880,0.9,6);F.panel(ox-117,oy+3.2,oz-9,1.2,0.6,0.8,8);
  // three lockers by the shelves, a deep sink on the west wall, cartons stacked in the corner, a calendar
  for(let k=0;k<3;k++){const x=-114.4+k*1.05;box('steel',x,0,-14,x+0.98,2.0,-13.45);for(let j=0;j<4;j++)box('steelDark',x+0.3,1.6+j*0.07,-13.45,x+0.68,1.63+j*0.07,-13.42);box('steelDark',x+0.8,1.0,-13.45,x+0.86,1.2,-13.4);}
  box('white',-124,0.75,-9.8,-123.3,1.0,-8.6);box('steelDark',-123.95,0.9,-9.7,-123.35,0.98,-8.7);beam('steel',[-123.95,1.0,-9.2],[-123.95,1.35,-9.2],0.04,0.04);beam('steel',[-123.95,1.35,-9.2],[-123.7,1.35,-9.2],0.04,0.04);
  for(const [x,y,z] of [[-123.2,0,-12.9],[-122.4,0,-13.1],[-123,0.5,-12.95]])blk('woodDark',x,y,z,0.7,0.5,0.55);
  box('paper',-110.04,1.5,-8.4,-110,2.1,-7.9);box('red',-110.05,2.0,-8.4,-110.01,2.1,-7.9);
  place('the janitor\'s office',[-117,1.5,-9],7);
  view('The janitor\'s office',[-117,1.2,-9.5],5.2,0.6,0.25,'mt_janitor');
  card('mt_janitor','The janitor\'s office','A cramped room off the corridor: a desk with a radio playing something old, shelves of cleaning supplies, a mop leaning in its bucket. The Bureau\'s janitor keeps the House clean, and seems to know a good deal more about it than he lets on.');
  // the hub
  room(-75,0,-15,-45,10,15,{floor:'concrete',wall:'concreteDark',ceil:'concrete:ceil'},{w:[[-4,4,0,6]],n:[[-64,-56,0,6]],s:[[-64,-56,0,6]],e:[[-5,5,0,8]]});
  panels(-72,-6,-48,-6,10,6,0.9,14);panels(-72,6,-48,6,10,6,0.9,14);
  for(const [x,z] of [[-72,-12],[-48,-12],[-72,12],[-48,12]])blk('pipe',x,0,z,1.2,10,1.2);
  F.terminal(ox-50,oy,oz-12,Math.PI/2);F.cabinet(ox-73,oy,oz+10,Math.PI/2);
  place('the Maintenance hub',[-60,4,0],18);
  view('From the transit corridor',[-150,2.6,0],22,-Math.PI/2,0.08,'mt_way');
  card('mt_way','The Maintenance Sector','The transit corridor from the Executive comes in here, a little lower than it left. Concrete, pipes along the walls, the smell of machine oil and dust: the part of the House that keeps the rest of it running. North to the Power Plant, south down into the Quarry, east through the pipeworks to the Furnace.');

  // ================================================================ the NSC Power Plant
  const cx=50,cz=-80,R=70,PF=-40,PT=20;
  room(-64,0,-74,-56,6,-15,CORR,{s:[[-64,-56,0,6]],e:[[-74,-66,0,6]]});
  room(-56,0,-74,-16,6,-66,CORR,{w:[[-74,-66,0,6]],e:[[-74,-66,0,6]]});
  panels(-60,-70,-60,-20,6,8,0.8,12);panels(-52,-70,-20,-70,6,8,0.8,12);
  // the drum: three bands, the middle one with the doorway where the corridor comes in
  const da=Math.atan2(-70-cz,-19.3-cx),dw=0.065;
  B.cyl('concreteDark',ox+cx,oy+PF,oz+cz,R,R,40,48,{inward:true});
  B.cyl('concreteDark',ox+cx,oy+0,oz+cz,R,R,6,46,{inward:true,a0:da+dw,a1:da+Math.PI*2-dw});
  B.cyl('concreteDark',ox+cx,oy+6,oz+cz,R,R,PT-6,48,{inward:true});
  B.ring('concreteDark',ox+cx,oy+PF,oz+cz,0.5,R,32);
  B.ring('concrete:ceil',ox+cx,oy+PT,oz+cz,0.5,R,32,true);
  // banding on the wall: horizontal ribs every ten metres
  for(let y=PF+10;y<PT;y+=10)if(Math.abs(y)>4)B.cyl('steelDark',ox+cx,oy+y,oz+cz,R-0.4,R-0.4,0.8,48,{inward:true});
  // the ring catwalk at the corridor's level, its rail; the three walkways in to the core
  B.ring('grate',ox+cx,oy+0,oz+cz,61,R,48);B.ring('steelDark',ox+cx,oy-0.4,oz+cz,61,R,48,true);
  const walk=[Math.PI/2,Math.PI/2+2.0944,Math.PI/2+4.1888];
  for(let i=0;i<48;i++){const a=i/48*Math.PI*2,b=(i+1)/48*Math.PI*2;if(walk.some(w=>Math.abs(Math.atan2(Math.sin((a+b)/2-w),Math.cos((a+b)/2-w)))<0.06))continue;
    rail([cx+Math.cos(a)*61,0,cz+Math.sin(a)*61],[cx+Math.cos(b)*61,0,cz+Math.sin(b)*61],1.05);}
  for(const w of walk){B.at(ox+cx,oy,oz+cz,-w);B.box('grate',12,-0.3,-2,61.2,0,2,['ny']);B.box('steelDark',12,-0.9,-2.1,61.2,-0.3,2.1,['py']);
    F.rail([12,0,-2],[61,0,-2],1.05);F.rail([12,0,2],[61,0,2],1.05);
    for(let u=18;u<60;u+=12)B.box('steelDark',u-0.3,PF,-0.3,u+0.3,-0.9,0.3);B.pop();}
  // the core: a column of steel ribs and rings round the glow, a plinth, a crown up into the ceiling
  B.cyl('concreteDark',ox+cx,oy+PF,oz+cz,15,13,6,24,{caps:true});
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;B.beam('steelDark',A(cx+Math.cos(a)*10,PF+6,cz+Math.sin(a)*10),A(cx+Math.cos(a)*10,PT,cz+Math.sin(a)*10),1.3,1.3);}
  for(const y of [PF+6,-20,-1,10,PT-2])B.cyl('steelDark',ox+cx,oy+y,oz+cz,11.4,11.4,1.4,24);
  B.cyl('steelDark',ox+cx,oy+0,oz+cz,12,12,0.4,24,{caps:true});
  lamp(cx,-5,cz,0xd8f0ff,1.6,95);lamp(cx,PF+8,cz,0xbfe4ff,1.2,60);
  // cables slung from the wall to the core, sagging
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2+0.13,p=[cx+Math.cos(a)*(R-1),14,cz+Math.sin(a)*(R-1)],q=[cx+Math.cos(a)*12,8,cz+Math.sin(a)*12],m=[(p[0]+q[0])/2,4,(p[2]+q[2])/2];
    beam('black',p,m,0.35,0.35);beam('black',m,q,0.35,0.35);}
  // the control room's windows, high on the north wall, lit warm
  {const a0=-Math.PI/2-0.14,a1=-Math.PI/2+0.14;B.cyl('lightWarm',ox+cx,oy+8,oz+cz,R-0.15,R-0.15,4,10,{inward:true,a0,a1});
    for(let i=0;i<=10;i++){const a=a0+(a1-a0)*i/10;beam('steelDark',[cx+Math.cos(a)*(R-0.3),8,cz+Math.sin(a)*(R-0.3)],[cx+Math.cos(a)*(R-0.3),12,cz+Math.sin(a)*(R-0.3)],0.3,0.3);}
    B.cyl('steelDark',ox+cx,oy+7.6,oz+cz,R-0.2,R-0.2,0.4,10,{inward:true,a0,a1});lamp(cx,10,cz-R+4,0xffc880,1.0,30);}
  // machinery round the floor: transformers, cabinets, pipes up the wall
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2+rnd()*0.1,r=28+rnd()*30,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,w=3+rnd()*4,h=2+rnd()*4,d=2+rnd()*3;
    B.at(ox+x,oy+PF,oz+z,-a);B.box(i%3?'steel':'panelDark',-w/2,0,-d/2,w/2,h,d/2,['ny']);B.box('steelDark',-w/2-0.1,h,-d/2-0.1,w/2+0.1,h+0.3,d/2+0.1);B.pop();
    if(i%4===0)F.pipe(A(x,PF+h,z),A(cx+Math.cos(a)*(R-1.5),PF+h,cz+Math.sin(a)*(R-1.5)),0.4,'pipe');}
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;F.pipe(A(cx+Math.cos(a)*(R-1.2),PF,cz+Math.sin(a)*(R-1.2)),A(cx+Math.cos(a)*(R-1.2),PT,cz+Math.sin(a)*(R-1.2)),0.45,i%2?'pipe':'steel');}
  zone(cx-R,PF-1,cz-R,cx+R,PT+1,cz+R,0x1c2430,0.65);
  // what moves: the glow inside the core, a halo, the ring of lamps on the wall
  const coreM=new THREE.MeshBasicMaterial({color:0xbfe8ff});
  const core=new THREE.Mesh(new THREE.CylinderGeometry(8.4,8.4,PT-PF-6,24,1,true),coreM);core.position.set(ox+cx,oy+(PF+6+PT)/2,oz+cz);dyn.add(core);
  const haloM=new THREE.SpriteMaterial({map:T.dot,color:0x9ad8ff,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending});
  const halo=new THREE.Sprite(haloM);halo.scale.set(70,90,1);halo.position.set(ox+cx,oy-10,oz+cz);dyn.add(halo);
  const NL=24,ringL=new THREE.InstancedMesh(new THREE.BoxGeometry(1.6,0.7,0.5),new THREE.MeshBasicMaterial({color:0xffffff}),NL);
  {const o=new THREE.Object3D();for(let i=0;i<NL;i++){const a=i/NL*Math.PI*2;o.position.set(ox+cx+Math.cos(a)*(R-0.4),oy+3.2,oz+cz+Math.sin(a)*(R-0.4));o.rotation.y=-a+Math.PI/2;o.updateMatrix();ringL.setMatrixAt(i,o.matrix);ringL.setColorAt(i,new THREE.Color(0xfff2d8));}}
  ringL.instanceColor.needsUpdate=true;dyn.add(ringL);
  for(let i=0;i<NL;i+=2){const a=i/NL*Math.PI*2;lamp(cx+Math.cos(a)*(R-2),3.2,cz+Math.sin(a)*(R-2),0xfff0d8,0.6,16);}
  const PS={level:0.75,lamps:new Array(NL).fill(1)};
  const DIM=new THREE.Color(0x0c161c),BRIGHT=new THREE.Color(0xe8f8ff),LON=new THREE.Color(0xfff2d8),LOFF=new THREE.Color(0x222222),tc=new THREE.Color();
  function plantShow(t){const f=PS.level*(0.96+0.04*Math.sin(t*7)+0.02*Math.sin(t*23));coreM.color.copy(DIM).lerp(BRIGHT,clamp(f,0,1));haloM.opacity=0.55*f;halo.scale.set(50+30*f,70+30*f,1);
    for(let i=0;i<NL;i++)ringL.setColorAt(i,tc.copy(LOFF).lerp(LON,PS.lamps[i]));ringL.instanceColor.needsUpdate=true;}
  place('the NSC Power Plant',[cx,-10,cz],R);
  const vPlant=view('The Power Plant',[cx,-12,cz],58,0.55,0.3,'mt_plant');
  view('The reactor core',[cx,0,cz],34,2.4,0.08,'mt_core');
  view('The plant floor',[cx,PF+20,cz+30],48,0.3,-0.25,'mt_core');
  view('The walkway in',[cx+Math.cos(walk[0])*40,2,cz+Math.sin(walk[0])*40],14,walk[0]+Math.PI/2+0.3,0.18,'mt_plant');
  card('mt_plant','The NSC Power Plant','A round chamber seventy metres across and sixty high, sunk below the corridors that reach it. A catwalk rings it at the door\'s level; three walkways run in from it to the reactor column in the middle, glowing white through its ribs. Cables sag from the wall to the core, machinery crowds the floor far below, and the control room looks down through its windows high on the north wall.');
  card('mt_core','The reactor core','The column the whole sector exists to serve: steel ribs and rings round a glow that never quite steadies. What it burns, the Bureau does not say in the documents it lets you read.');
  fog([cx,-10,cz],R*0.9,'#1a2430',0.0075);

  // ================================================================ down into the Black Rock Quarry
  room(-64,0,15,-56,6,50,CORR,{n:[[-64,-56,0,6]],s:[[-64,-56,0,6]]});panels(-60,20,-60,46,6,8,0.8,12);
  const QF=-30,QT=30;
  room(-140,QF,50,-40,QT,150,{floor:'rockBlack',wall:'rock',ceil:'rock:ceil'},{n:[[-64,-56,0,6]]});
  // rough walls: great slabs and boulders heaped against the rock
  for(let i=0;i<70;i++){const side=i%4,t=rnd(),w=4+rnd()*9,h=6+rnd()*26,d=3+rnd()*6;let x,z,yaw;
    if(side===0){x=-140+t*100;z=50+d/2;yaw=0;}else if(side===1){x=-140+t*100;z=150-d/2;yaw=0;}else if(side===2){x=-140+d/2;z=50+t*100;yaw=Math.PI/2;}else{x=-40-d/2;z=50+t*100;yaw=Math.PI/2;}
    if(side===0&&x>-70&&x<-50)continue;
    B.at(ox+x,oy+QF,oz+z,yaw+(rnd()-0.5)*0.3);B.box(rnd()<0.6?'rockBlack':'rock',-w/2,0,-d/2,w/2,h,d/2,['ny']);B.pop();}
  // the gallery along the north wall at the corridor's level, and the long stair down the west side
  box('concreteDark',-140,-1,50,-40,0,58);rail([-138,0,58],[-40,0,58],1.05);
  for(let x=-136;x<-40;x+=10)blk('steelDark',x,QF,57.5,0.5,-1-QF,0.5);
  B.stairs('concreteDark',ox-132,oy+QF,oz+100,Math.PI/2,3,0.25,0.35,120,'steelDark');
  // the black cubes: stacked across the floor, some the size of rooms
  const cubes=[];for(let i=0;i<90&&cubes.length<64;i++){const s=2+rnd()*7,x=-126+rnd()*76,z=68+rnd()*76;if(x<-124)continue;
    if(cubes.some(c=>Math.abs(c[0]-x)<(c[2]+s)/2+0.3&&Math.abs(c[1]-z)<(c[2]+s)/2+0.3))continue;cubes.push([x,z,s]);
    B.at(ox+x,oy+QF,oz+z,rnd()*0.4);B.box('rockBlack',-s/2,0,-s/2,s/2,s,s/2,['ny']);if(rnd()<0.45){const s2=s*(0.4+rnd()*0.4);B.box('rockBlack',-s2/2,s,-s2/2,s2/2,s+s2,s2/2,['ny']);}B.pop();}
  // the conveyor: up from the floor to the gallery, on its legs
  {const p=[-80,QF+1.5,138],q=[-80,-0.5,62];beam('steelDark',p,q,2.6,0.7);beam('black',[p[0],p[1]+0.45,p[2]],[q[0],q[1]+0.45,q[2]],2.2,0.2);
    for(let k=1;k<8;k++){const t=k/8,x=p[0],y=p[1]+(q[1]-p[1])*t,z=p[2]+(q[2]-p[2])*t;for(const s of [-1.1,1.1])beam('steel',[x+s,QF,z],[x+s,y,z],0.3,0.3);}
    for(let k=0;k<9;k++){const t=k/9+0.04,y=p[1]+(q[1]-p[1])*t+0.8,z=p[2]+(q[2]-p[2])*t;blk('rockBlack',-80,y,z,1.4,1,1.4);}}
  // scaffolding by the east wall: posts, decks of planks at each level, ladders
  for(let i=0;i<=3;i++)for(let j=0;j<=4;j++)beam('steel',[-56+i*3.5,QF,80+j*8],[-56+i*3.5,0,80+j*8],0.2,0.2);
  for(const y of [QF+10,QF+20,QF+29.6])for(let j=0;j<4;j++){box('woodDark',-56.2,y,80+j*8,-45.3,y+0.2,88+j*8);for(let i=0;i<=3;i++)beam('steel',[-56+i*3.5,y+1,80],[-56+i*3.5,y+1,112],0.1,0.1);}
  for(let k=0;k<3;k++){const z=82+k*10,y0=QF+k*10;for(const s of [-0.3,0.3])beam('steel',[-45,y0,z+s],[-45,y0+10,z+s],0.08,0.08);for(let r=1;r<20;r++)beam('steel',[-45,y0+r*0.5,z-0.3],[-45,y0+r*0.5,z+0.3],0.05,0.05);}
  // the floodlights: poles with glaring heads, aimed into the cubes
  for(const [x,z,ax,az] of [[-120,140,0.4,-0.6],[-60,140,-0.4,-0.6],[-120,75,0.5,0.5],[-60,72,-0.5,0.5],[-95,110,0.3,0.2],[-50,128,-0.6,-0.1]]){
    blk('steelDark',x,QF,z,0.5,16,0.5);B.at(ox+x,oy+QF+16,oz+z,Math.atan2(-az,ax));B.box('steelDark',-0.4,-0.6,-1.4,0.6,0.6,1.4);B.box('lightWhite',0.6,-0.5,-1.2,0.65,0.5,1.2,['nx']);B.pop();
    const n=Math.hypot(ax,-0.6,az);lamp(x+ax*2,QF+16,z+az*2,0xeef4ff,2.2,75,[ax/n,-0.6/n,az/n]);}
  zone(-141,QF-1,49,-39,QT+1,151,0x283234,0.7);
  // the mist, drifting low between the cubes
  const mist=[];for(let i=0;i<6;i++){const m=new THREE.SpriteMaterial({map:T.dot,color:0x8aa4a8,transparent:true,opacity:0.1,depthWrite:false});const s=new THREE.Sprite(m);
    s.scale.set(70,18,1);const p0=[-120+rnd()*70,QF+4+rnd()*8,70+rnd()*70];s.position.set(...A(...p0));dyn.add(s);mist.push([s,p0,rnd()*6]);}
  place('the Black Rock Quarry',[-90,-15,100],70);
  view('The Black Rock Quarry',[-90,QF+6,108],44,-2.6,0.32,'mt_quarry');
  view('Among the black cubes',[-104,QF+3,96],18,-0.7,0.12,'mt_quarry');
  view('Down from the gallery',[-90,QF+4,104],46,Math.PI,0.6,'mt_quarry');
  card('mt_quarry','The Black Rock Quarry','A cavern under the sector, opened on a seam of black rock that should not be here: a dense, faintly warm stone that soaks up whatever it is near. Cut cubes of it are stacked across the floor, some the size of rooms; a conveyor climbs to the gallery, scaffolding stands against the wall, and floodlights on poles glare into the mist. The Bureau still mines it, and does not explain why.');
  fog([-90,-12,100],75,'#0e1e20',0.009);

  // ================================================================ the pipeworks, the pumps, the ventilation
  room(-45,0,-5,109,8,5,PIPE,{w:[[-5,5,0,8]],s:[[-10,-4,0,3],[30,36,0,3],[101,109,0,6]]});
  panels(-40,0,105,0,8,8,0.85,13,0xffd890);
  for(const s of [-1,1]){const z=s*4.4;
    for(const [y,r,m] of [[1.2,0.45,'pipe'],[2.6,0.3,s<0?'pipeRed':'pipe'],[4.4,0.55,'pipe'],[6.2,0.35,'steel']]){
      const gaps=s>0&&y<3.2?[[-10.5,-3.5],[29.5,36.5],[100.5,109]]:[];let x=-45;for(const [g0,g1] of gaps){F.pipe(A(x,y,z),A(g0,y,z),r,m);x=g1;}F.pipe(A(x,y,z),A(109,y,z),r,m);}
    for(let x=-43;x<109;x+=5){if(s>0&&((x>-11&&x<-3)||(x>29&&x<37)||x>100))continue;blk('steelDark',x,0.8,z+s*0.35,0.3,6,0.25);}}
  F.pipe(A(-45,7.2,-1.6),A(109,7.2,-1.6),0.6,'pipe');F.pipe(A(-45,7.2,1.6),A(109,7.2,1.6),0.45,'steel');
  zone(-46,-1,-6,110,9,6,0x5a5236,0.45);
  place('the pipeworks',[30,4,0],45);
  view('The pipeworks',[52,3.2,0],34,Math.PI/2,0.06,'mt_pipeworks');
  card('mt_pipeworks','The pipeworks','A long corridor floored with grating and lined from floor to ceiling with pipes - orange, red, bare steel - on their brackets. The light is yellow and the air is dusty. Doors off it lead to the coolant pumps and the ventilation room; at its end, a turn south to the Furnace.');
  fog([30,4,0],70,'#3a3420',0.009);
  // the coolant pumps: tanks in rows, pipes between them, gauges
  room(-20,0,5,10,10,40,{floor:'concrete',wall:'concreteDark',ceil:'concrete:ceil'},{n:[[-10,-4,0,3]]});
  panels(-14,22,4,22,10,6,0.9,14);
  for(let i=0;i<3;i++)for(let j=0;j<2;j++){const x=-13+i*10,z=17+j*14;B.cyl('steel',ox+x,oy,oz+z,2.6,2.6,7,18,{caps:true});B.cyl('steelDark',ox+x,oy+7,oz+z,1.2,0.6,1.2,12,{caps:true});
    B.cyl('steelDark',ox+x,oy+2.2,oz+z,2.7,2.7,0.3,18);B.cyl('steelDark',ox+x,oy+5,oz+z,2.7,2.7,0.3,18);if(i<2)F.pipe(A(x+2.6,5,z),A(x+7.4,5,z),0.35,'pipe');}
  for(let i=0;i<3;i++)F.pipe(A(-13+i*10,7.8,17),A(-13+i*10,7.8,31),0.3,'pipeRed');
  F.terminal(ox+7,oy,oz+8,Math.PI);
  place('the coolant pumps',[-5,4,22],18);
  view('The coolant pumps',[-5,3,24],13,Math.PI/2,0.15,'mt_pumps');
  card('mt_pumps','The coolant pumps','Six tanks in two rows, strapped and piped together, humming. They cool the plant\'s core; when they stop, the sector learns about it quickly.');
  // the ventilation room: the great fan turning in its housing in the south wall, light coming through it
  room(20,0,5,50,12,40,{floor:'grate',wall:'concreteDark',ceil:'concrete:ceil'},{n:[[30,36,0,3]],s:[[30.5,39.5,1.5,10.5]]});
  box('concreteDark',30.5,1.5,40,39.5,10.5,44,['nz']);B.quad('lightWhite',A(30.5,1.5,43.9),A(39.5,1.5,43.9),A(39.5,10.5,43.9),A(30.5,10.5,43.9),[0,0,-1]);
  for(const [x0,y0,x1,y1] of [[29.8,0.8,40.2,1.5],[29.8,10.5,40.2,11.2],[29.8,1.5,30.5,10.5],[39.5,1.5,40.2,10.5]])box('steelDark',x0,y0,39.5,x1,y1,40);
  lamp(35,6,38,0xf4f8ff,1.3,26,[0,0,-1]);panels(26,12,44,12,12,6,0.6,12);
  // filter banks two high down both side walls: steel frames, grating faces
  for(const [x0,x1,f] of [[20,20.5,20.52],[49.5,50,49.48]])for(let z=9;z<35;z+=3)for(const y of [0.3,3.1]){box('steelDark',x0,y,z,x1,y+2.6,z+2.8);
    box('grate',Math.min(f,x0+(x0<30?0.5:0)),y+0.15,z+0.15,Math.max(f,x0<30?x1:x0),y+2.45,z+2.65);}
  // two great ducts along the ceiling from the north wall to the fan wall, flanged every three metres
  for(const x of [24,46]){box('steel',x-0.9,9.6,5,x+0.9,11.4,40);for(let z=7;z<40;z+=3)box('steelDark',x-1.0,9.5,z,x+1.0,11.5,z+0.15);}
  // the fan's mouth: warning stripes on the floor before it, a rail across, a control panel to one side
  for(let k=0;k<10;k++)box(k%2?'black':'yellow',30+k,0.01,37,31+k,0.03,38.2,['ny']);
  rail([29.5,0,36.5],[40.5,0,36.5],1.1);F.terminal(ox+43,oy,oz+37,Math.PI);
  const fanShape=new THREE.Shape();{const N=5,Rb=4.3,Rh=0.9;for(let i=0;i<N;i++){const a=i/N*Math.PI*2;for(let k=0;k<=6;k++){const b=a-0.32+k/6*0.64,r=k===0||k===6?Rh:Rb*(0.85+0.15*Math.sin(k/6*Math.PI));const px=Math.cos(b)*r,py=Math.sin(b)*r;if(i===0&&k===0)fanShape.moveTo(px,py);else fanShape.lineTo(px,py);}
    const g=a+Math.PI/N;fanShape.lineTo(Math.cos(g)*Rh,Math.sin(g)*Rh);}}
  const fan=new THREE.Mesh(new THREE.ExtrudeGeometry(fanShape,{depth:0.25,bevelEnabled:false}),new THREE.MeshLambertMaterial({color:0x3a3c40}));
  fan.position.set(...A(35,6,40.6));dyn.add(fan);
  place('the ventilation room',[35,5,22],20);
  view('Ventilation',[35,5.5,34],18,Math.PI,0.12,'mt_vent');
  card('mt_vent','Ventilation','The House breathes through here. A fan as tall as two men turns slowly in its housing in the south wall, light cutting through its blades from the shaft behind.');

  // ================================================================ the Furnace Chamber
  room(101,0,5,109,6,40,CORR,{n:[[101,109,0,6]],s:[[101,109,0,6]]});panels(105,8,105,38,6,8,0.9,12,0xffe0a0);
  const FX0=60,FX1=150,FZ0=40,FZ1=160,FH=30;
  room(FX0,0,FZ0,FX1,FH,FZ1,{floor:'concreteDark',wall:'concreteWarm',ceil:'concreteDark:ceil'},{n:[[101,109,0,6]],s:[[90,120,12,24]]});
  // pilasters down both long walls
  for(let z=48;z<FZ1;z+=12){F.pier(ox+FX0+0.9,oy,oz+z,3,1.8,FH,Math.PI/2,'concreteWarm');F.pier(ox+FX1-0.9,oy,oz+z,3,1.8,FH,Math.PI/2,'concreteWarm');}
  // the ceiling: deep beams across the hall, one over each pair of pilasters; a bronze lamp on every pilaster
  for(let z=48;z<FZ1;z+=12){box('concreteDark:ceil',FX0,FH-2.2,z-0.9,FX1,FH,z+0.9,['py']);
    for(const [x,o] of [[FX0+2.1,1],[FX1-2.1,-1]]){box('brass',x-(o>0?0.3:0),7,z-0.25,x+(o>0?0:0.3),7.6,z+0.25);blk('lightFurnace',x+o*0.2,7.6,z,0.3,0.4,0.3);lamp(x+o*1.2,7.8,z,0xffb850,0.5,11);}}
  // a dark stone runner up the middle of the floor to the foot of the stair, edged in brass
  box('rockBlack',96,0,FZ0,114,0.03,70,['ny']);for(const x of [96,114])beam('brass',[x,0.035,FZ0],[x,0.035,70],0.12,0.02);
  // the landing at the top, full width, and the three flights up to it - the grand one in the middle
  box('concreteWarm',64,0,100,146,12,FZ1,['ny']);
  B.stairs('concreteWarm',ox+105,oy,oz+70,-Math.PI/2,20,0.3,0.75,40);
  for(const x of [72,138])B.stairs('concreteWarm',ox+x,oy,oz+70,-Math.PI/2,7,0.3,0.75,40);
  for(const x of [95,115]){rail([x,0,70],[x,12,100],1.1);}
  for(const [a,b] of [[64,88],[122,146]])rail([a,12,100],[b,12,100],1.1);
  // the mouth: a deep recess in the south wall, framed heavy, blazing at the back
  box('concreteDark',90,12,FZ1,91,24,166,['px']);box('concreteDark',119,12,FZ1,120,24,166,['nx']);box('concreteDark',90,23.9,FZ1,120,24.6,166);
  B.quad('lightFurnace',A(90,12,165.8),A(120,12,165.8),A(120,24,165.8),A(90,24,165.8),[0,0,-1]);
  for(const [x0,x1,y0,y1] of [[86,90,10,28],[120,124,10,28],[86,124,24.6,28]])box('concreteDark',x0,y0,FZ1-1.5,x1,y1,FZ1);
  // a second frame stepped out round the first, and a grate of heavy bars across the mouth
  for(const [x0,x1,y0,y1] of [[82,86,8,31],[124,128,8,31],[82,128,28,31]])box('rockBlack',x0,y0,FZ1-2.6,x1,y1,FZ1);
  for(let x=93;x<=117;x+=3)beam('steelDark',[x,12,FZ1+0.8],[x,23.9,FZ1+0.8],0.35,0.35);beam('steelDark',[90,18,FZ1+0.6],[120,18,FZ1+0.6],0.4,0.4);
  lamp(105,18,157,0xffb030,2.4,135,[0,-0.2,-1]);lamp(105,14,140,0xffc040,1.2,60);
  for(const z of [60,90]){lamp(80,24,z,0xffd070,0.6,30);lamp(130,24,z,0xffd070,0.6,30);}
  zone(FX0-1,-1,FZ0-1,FX1+1,FH+1,FZ1+7,0x3e2a12,0.65);   /* dim: the furnace and the lamps do the lighting */
  // what moves: the glow at the mouth, and the embers
  const glowM=new THREE.MeshBasicMaterial({color:0xffb030,transparent:true,opacity:0.35,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(34,16),glowM);glow.position.set(...A(105,18,FZ1-0.8));glow.rotation.y=Math.PI;dyn.add(glow);
  const NE=500,ePos=new Float32Array(NE*3),eVel=new Float32Array(NE*3),eLife=new Float32Array(NE);
  for(let i=0;i<NE;i++)ePos[i*3+1]=-1e5;
  const eG=new THREE.BufferGeometry();eG.setAttribute('position',new THREE.BufferAttribute(ePos,3));
  const embers=new THREE.Points(eG,new THREE.PointsMaterial({map:T.dot,color:0xffa030,size:0.7,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));embers.frustumCulled=false;dyn.add(embers);
  const FS={surge:0,rate:6};let eNext=0;
  function emit(n){for(let k=0;k<n;k++){const i=eNext;eNext=(eNext+1)%NE;ePos[i*3]=ox+90+rnd()*30;ePos[i*3+1]=oy+13+rnd()*10;ePos[i*3+2]=oz+FZ1-1;
    eVel[i*3]=(rnd()-0.5)*3;eVel[i*3+1]=2+rnd()*5;eVel[i*3+2]=-(2+rnd()*8);eLife[i]=3+rnd()*4;}}
  place('the Furnace Chamber',[105,12,110],60);
  const vFurn=view('The Furnace',[105,16,150],78,Math.PI,0.1,'mt_furnace');
  view('Up the grand stair',[105,8,96],30,Math.PI,0.2,'mt_furnace');
  view('The furnace mouth',[105,18,160],18,Math.PI+0.25,0.05,'mt_furnace');
  card('mt_furnace','The Furnace Chamber','A golden hall, and at the top of a grand stair the furnace: a mouth in the south wall the width of a house, blazing so bright the whole chamber glows the colour of it. What goes in does not come out. The Bureau burns things here that cannot be destroyed any other way.');
  fog([105,12,110],70,'#3a2408',0.007);

  // ================================================================ every frame
  let lastT=0;
  K.hooks.push((t,dt)=>{plantShow(t);fan.rotation.z=t*0.9;
    for(const [s,p0,ph] of mist)s.position.set(ox+p0[0]+Math.sin(t*0.05+ph)*12,oy+p0[1]+Math.sin(t*0.11+ph)*1.5,oz+p0[2]+Math.cos(t*0.04+ph)*10);
    const g=0.35+0.08*Math.sin(t*3.1)+0.05*Math.sin(t*7.7)+FS.surge*0.6;glowM.opacity=Math.min(1,g);glow.scale.set(1+FS.surge*0.25,1+FS.surge*0.4,1);
    const n=Math.floor(dt*(FS.rate+FS.surge*240)+rnd());emit(n);
    for(let i=0;i<NE;i++){if(eLife[i]<=0)continue;eLife[i]-=dt;if(eLife[i]<=0){ePos[i*3+1]=-1e5;continue;}
      eVel[i*3+1]+=dt*1.2;ePos[i*3]+=eVel[i*3]*dt+Math.sin(t*2+i)*0.02;ePos[i*3+1]+=eVel[i*3+1]*dt;ePos[i*3+2]+=eVel[i*3+2]*dt;}
    eG.attributes.position.needsUpdate=true;lastT=t;});

  // ================================================================ events
  K.events.push({key:'plant',label:'Power the plant',card:'mt_plant',view:vPlant,start(){let t0=null;
    return {update(t){if(t0===null)t0=t;const u=t-t0;
      if(u<1.5){PS.level=Math.max(0,0.75*(1-u/1.2));PS.lamps.fill(u<0.6?1:0);}
      else{for(let i=0;i<NL;i++)PS.lamps[i]=u>1.8+i*0.22?Math.min(1,(u-1.8-i*0.22)*3):0;
        PS.level=u<7?0.03:u<10.5?0.03+(u-7)/3.5*1.1:u<14?1.13-(u-10.5)/3.5*0.38:0.75;}
      if(u>14){PS.level=0.75;PS.lamps.fill(1);return false;}}};}});
  K.events.push({key:'furnace',label:'The Furnace',card:'mt_furnace',view:vFurn,start(){let t0=null;
    return {update(t){if(t0===null)t0=t;const u=t-t0;FS.surge=u<2?u/2:u<10?1+0.25*Math.sin(u*5):u<14?1-(u-10)/4:0;if(u>14){FS.surge=0;return false;}}};}});
  K.anchors.maintenance={plant:A(cx,0,cz),quarry:A(-90,QF,100),furnace:A(105,12,150)};
}
