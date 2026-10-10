// ---------- the Containment Sector ----------
// Fan work after Remedy Entertainment's Control (2019); nothing of theirs is used.
//
// North of the Executive, down a level. The transit corridor comes in at the south edge, through the security
// checkpoint, and a spine runs north to the Turntable - a round hub with a great platform turning in its floor -
// and from it the ways out: north to the Panopticon, west to the hall of containment cubes, east to the Archives.
// Off the spine, west the Medical Wing, east Logistics.
//
//   the Panopticon      a cylinder sixty-odd metres across and a hundred and twenty high, in teal haze: walls of
//                       cells in rings all the way up, each a dark recess, some lit; catwalk rings; the central
//                       observation tower with its cabin and searchlights sweeping; bridges out to the walls
//   the Turntable       a round room, the platform turning in its floor, the gear teeth round its rim, the
//                       hydraulic arms that drive it
//   the cubes           a hall of glass containment cubes on warning-striped plinths, each holding something
//                       ordinary and wrong: a refrigerator, a rubber duck, a floppy disk, a slide projector, a
//                       mailbox, a traffic light, a television, a rocking chair, a red telephone...
//   the Archives        shelves of files twenty metres high, catwalks and ladders between them
//   Logistics           pallet racks and crates, a forklift, a conveyor
//   the Medical Wing    white tile, beds in curtained bays, the nurses' station, an operating table
//   the checkpoints     scanner arches, a counter, barriers, cameras
//
// Everything is built in the sector's own frame (B.at the origin), so coordinates here are relative to it; the
// views, places, lights and fog zones are given in world coordinates (W()).

export function buildContainment(K){
  const {THREE,B,F,lights,dyn,hooks,places,views,cards,zones,events,anchors,rnd}=K;
  const [ox,oy,oz]=K.O;
  const vcount=()=>{let n=0;for(const k in B.g)n+=B.g[k].p.length/3;return n;},v0=vcount();
  const W=(x,y,z)=>[ox+x,oy+y,oz+z];
  const LT=(x,y,z,c,i,r,dir)=>lights.add(W(x,y,z),c,i,r,dir);
  const corr=(x0,z0,x1,z1,h,alongZ,m={floor:'terrazzo',wall:'panel',ceil:'ceiling:ceil'})=>{const w=alongZ?x1-x0:z1-z0;
    B.room(m,x0,0,z0,x1,h,z1,alongZ?{n:[[0,w,h]],s:[[0,w,h]]}:{w:[[0,w,h]],e:[[0,w,h]]});
    if(alongZ)F.panels(0.5*(x0+x1),z0+2,0.5*(x0+x1),z1-2,h,5,0.7,12);else F.panels(x0+2,0.5*(z0+z1),x1-2,0.5*(z0+z1),h,5,0.7,12);};
  B.at(ox,oy,oz,0);

  // ================================================================ the way in: the checkpoint
  // the transit corridor arrives at z=+180; the hall runs from it to the spine
  B.room({floor:'terrazzo',wall:'concrete',ceil:'ceiling:ceil'},-14,0,140,14,7,180,{s:[[9,19,5]],n:[[9,19,6]]});
  F.panels(-8,145,-8,176,7,5,0.8,12);F.panels(8,145,8,176,7,5,0.8,12);
  for(const x of [-3.2,0,3.2])F.doorframe(x,0,158,0,1.4,2.6,'steelDark');            /* the scanner arches */
  B.box('woodDark',-13,0,160,-7,1.1,166);B.box('wood',-13.2,1.1,159.8,-6.8,1.18,166.2);      /* the guard's counter */
  F.terminal(-10,0,164,Math.PI/2);F.chair(-11,0,162,Math.PI/2);
  for(const x of [-6,6])B.box('yellow',x-0.15,0,150,x+0.15,1.0,156);                      /* barriers */
  for(const x of [-12,12]){B.box('steelDark',x-0.2,5.4,142,x+0.2,5.8,142.6);B.box('black',x-0.25,5.2,142.6,x+0.25,5.6,143.2);} /* cameras */
  B.box('red',-6,4.6,179.5,6,5.4,179.8);                                                    /* the sector sign */

  // ================================================================ the spine and its side corridors
  B.room({floor:'terrazzo',wall:'panel',ceil:'ceiling:ceil'},-5,0,60,5,6,140,{n:[[0,10,6]],s:[[0,10,6]],w:[[50,60,5]],e:[[50,60,5]]});
  F.panels(0,64,0,136,6,6,0.75,12);
  corr(-45,110,-5,120,5,false);corr(5,110,45,120,5,false);

  // ================================================================ the Turntable
  // a round room, doors at the four points; the platform turning in its floor (dyn), the teeth round its rim
  {const cx=0,cz=30,R=30,H=16,dh=6,ga=5/R,doors=[0,Math.PI/2,Math.PI,Math.PI*1.5];
   for(let k=0;k<4;k++){const a0=doors[k]+ga,a1=doors[(k+1)%4]+(k===3?Math.PI*2:0)-ga;B.cyl('concrete',cx,0,cz,R,R,H,14,{inward:true,a0,a1});
     B.cyl('concrete',cx,dh,cz,R,R,H-dh,2,{inward:true,a0:doors[k]-ga,a1:doors[k]+ga});}
   B.ring('terrazzo',cx,0,cz,23.5,R,40);B.ring('steelDark',cx,0.02,cz,0,23.5,32);
   B.ring('concreteDark:ceil',cx,H,cz,0,R,40,true);
   for(let k=0;k<64;k++){const a=k/64*Math.PI*2;B.at(cx+Math.cos(a)*24.2,0,cz+Math.sin(a)*24.2,-a);B.box('steel',-0.5,0,-0.45,0.5,0.9,0.45);B.pop();}
   for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;B.beam('steelDark',[cx+Math.cos(a)*29.5,7,cz+Math.sin(a)*29.5],[cx+Math.cos(a)*24,1.2,cz+Math.sin(a)*24],1.2,1.2);
     B.beam('yellow',[cx+Math.cos(a)*29.5,7,cz+Math.sin(a)*29.5],[cx+Math.cos(a)*26.5,4.3,cz+Math.sin(a)*26.5],1.5,1.5);}
   B.cyl('steelDark',cx,H-1.2,cz,20,20,0.6,32,{inward:true});B.cyl('steelDark',cx,H-1.2,cz,20,20,0.6,32);           /* the crane rail */
   for(let k=0;k<12;k++){const a=k/12*Math.PI*2;F.panel(cx+Math.cos(a)*14,H,cz+Math.sin(a)*14,1.6,0.8,0.8,18);}
   // the platform itself: a disc, yellow radial stripes, a hub; it turns (hooks)
   const tt=new THREE.Group();tt.position.set(ox+cx,oy,oz+cz);
   const grey=new THREE.MeshLambertMaterial({color:0x8a8a84}),yel=new THREE.MeshLambertMaterial({color:0xe0b030}),stl=new THREE.MeshLambertMaterial({color:0x4a4c50});
   const disc=new THREE.Mesh(new THREE.CylinderGeometry(23,23,1.2,64).translate(0,0.6,0),grey);tt.add(disc);
   const sg=[];for(let k=0;k<8;k++){const g=new THREE.BoxGeometry(20,0.06,0.8).translate(11.5,1.23,0);g.rotateY(k/8*Math.PI*2);sg.push(g.toNonIndexed());}
   tt.add(new THREE.Mesh(mergeGeo(THREE,sg),yel));
   const hub=new THREE.Mesh(new THREE.CylinderGeometry(3,3.4,4,24).translate(0,3.2,0),stl);tt.add(hub);
   tt.traverse(o=>{o.userData.noFingerprint=true;});dyn.add(tt);anchors.turntable=tt;
   LT(cx,10,cz,0xfff4e0,0.5,40);
   anchors.ttSpeed=0.05;
   hooks.push((t,dt)=>{tt.rotation.y+=dt*anchors.ttSpeed;});}

  // ================================================================ to the Panopticon
  corr(-5,-38,5,0,6,true);
  F.doorframe(0,0,-20,0,4,4,'steelDark');B.box('glass',-5,0,-24,-3.4,3,-16);B.box('steelDark',-5,3,-24,-3.4,3.2,-16);   /* the guard's booth */

  // ================================================================ the Panopticon
  {const pz=-100,R=62,y0=-30,y1=90,gap=0.085;
   // the wall: whole except a doorway at the south, on the entrance level
   const S=Math.PI/2;
   B.cyl('concreteDark',0,y0,pz,R,R,y1-y0,92,{inward:true,a0:S+gap,a1:S+Math.PI*2-gap});
   B.cyl('concreteDark',0,y0,pz,R,R,30,2,{inward:true,a0:S-gap,a1:S+gap});B.cyl('concreteDark',0,6,pz,R,R,y1-6,2,{inward:true,a0:S-gap,a1:S+gap});
   B.ring('concreteDark',0,y0,pz,0,R,48);B.ring('concreteDark:ceil',0,y1,pz,0,R,48,true);
   B.ring('lightTeal',0,y1-0.1,pz,0,8,24,true);
   // the cells: rings of dark recesses all the way up, one quad each and a strip of light in a third of them
   const NC=88,lv=[];for(let y=y0+3;y<y1-4;y+=4)lv.push(y);
   for(const y of lv)for(let i=0;i<NC;i++){const a=(i+0.5)/NC*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(a-S),Math.cos(a-S)))<0.11&&y<10)continue;
     const a0=a-0.022,a1=a+0.022,r=R-0.05,P=(an,yy)=>[Math.cos(an)*r,yy,pz+Math.sin(an)*r];
     B.quad('black',P(a0,y),P(a1,y),P(a1,y+3),P(a0,y+3),[-Math.cos(a),0,-Math.sin(a)]);
     const lit=rnd()<0.33;const r2=R-0.08,Q=(an,yy)=>[Math.cos(an)*r2,yy,pz+Math.sin(an)*r2];
     B.quad(lit?'lightTeal':'teal',Q(a0+0.004,y+2.6),Q(a1-0.004,y+2.6),Q(a1-0.004,y+2.85),Q(a0+0.004,y+2.85),[-Math.cos(a),0,-Math.sin(a)]);}
   // the catwalk rings, every second level, with a rail on the inside edge
   for(let y=y0+2;y<y1-6;y+=8){B.ring('grate',0,y,pz,R-6,R,56);B.ring('steelDark',0,y-0.3,pz,R-6,R,56,true);
     B.cyl('steelDark',0,y,pz,R-6,R-6,1.1,56,{inward:false});B.cyl('steelDark',0,y,pz,R-6,R-6,1.1,56,{inward:true});}
   // the entrance catwalk, out from the doorway to the first ring
   B.box('grate',-3,-0.3,pz+R-8,3,0,pz+R+0.5);
   // the observation tower: a shaft, bands of teal windows, the cabin at the top, its roof and mast
   B.cyl('concrete',0,y0,pz,9,8,100,24);for(let y=y0+10;y<68;y+=8)B.cyl('lightTeal',0,y,pz,8.6,8.6,0.8,24);
   B.cyl('concrete',0,68,pz,8,16,4,24);B.cyl('concreteDark',0,72,pz,16,16,1.2,24);B.cyl('glass',0,73.2,pz,16,16,5,24);B.cyl('lightTeal',0,73.4,pz,15.4,15.4,4.6,24);
   B.cyl('concreteDark',0,78.2,pz,16.5,16.5,1.2,24);B.cyl('concreteDark',0,79.4,pz,16.5,3,5,24);B.cyl('steelDark',0,84.4,pz,0.4,0.2,5,6);
   // bridges from the tower to the rings, at three heights, turned a little each
   for(const [y,off] of [[2,0],[26,0.4],[50,0.8]])for(let k=0;k<4;k++){const a=k*Math.PI/2+off;B.at(0,y,pz,-a);B.box('grate',8.5,-0.3,-1.4,R-6,0,1.4);B.box('steelDark',8.5,-0.9,-1.4,R-6,-0.3,1.4,['py']);
     B.box('steelDark',8.5,0,-1.45,R-6,1.1,-1.35);B.box('steelDark',8.5,0,1.35,R-6,1.1,1.45);B.pop();}
   // the light: the ambient teal of the place, the tower's glow, the ring of lamps at each bridge level
   lights.zone(W(-R,y0-2,pz-R),W(R,y1+2,pz+R),0x3a7a7a,0.5);
   LT(0,74,pz,0x9affee,1.0,90);LT(0,y1-2,pz,0xbaffee,0.8,70);
   for(const y of [4,28,52])for(let k=0;k<6;k++){const a=k/6*Math.PI*2;LT(Math.cos(a)*30,y+6,pz+Math.sin(a)*30,0x8af0e0,0.5,34);}
   LT(0,y0+4,pz,0x4ab8b0,0.6,60);
   // the searchlights on the cabin roof, sweeping (dyn)
   const beamM=new THREE.MeshBasicMaterial({color:0xbaffee,transparent:true,opacity:0.1,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
   const piv=new THREE.Group();piv.position.set(ox,oy+80,oz+pz);dyn.add(piv);const beams=[];
   for(let k=0;k<6;k++){const arm=new THREE.Group();arm.rotation.y=k/6*Math.PI*2;const tilt=new THREE.Group();tilt.position.x=12;tilt.rotation.z=-0.55-0.15*(k%3);arm.add(tilt);
     const cone=new THREE.Mesh(new THREE.ConeGeometry(9,70,20,1,true).translate(0,-35,0).rotateZ(Math.PI/2),beamM);     const g=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.4,1.6,12).rotateZ(Math.PI/2),new THREE.MeshLambertMaterial({color:0x3a3c40}));tilt.add(g);
     // the cone points out along +x from the lamp, down by the tilt
     tilt.add(cone);piv.add(arm);beams.push({arm,tilt,ph:k});}
   piv.traverse(o=>{o.userData.noFingerprint=true;});
   hooks.push((t)=>{for(const b of beams){b.arm.rotation.y=b.ph/6*Math.PI*2+t*0.12+Math.sin(t*0.3+b.ph)*0.4;b.tilt.rotation.z=-0.55-0.25*Math.sin(t*0.21+b.ph*1.3);}});
   anchors.panopticon={beamM,piv};}

  // ================================================================ the hall of containment cubes
  B.room({floor:'terrazzo',wall:'panelDark',ceil:'ceiling:ceil'},-175,0,0,-45,10,60,{e:[[25,35,5]]});
  corr(-45,25,-30,35,5,false);
  const OBJ=['fridge','duck','floppy','projector','mailbox','traffic','tv','rocker','phone','lamp','mug','cassette'];
  let first=null;
  for(const zc of [15,45])for(let i=0;i<10;i++){const xc=-165+i*11.6,o=OBJ[(i+(zc>30?6:0))%OBJ.length];if(!first)first=[xc,zc];
    B.box('concreteDark',xc-3.5,0,zc-3.5,xc+3.5,0.4,zc+3.5);
    // the warning stripes round the plinth
    for(let k=0;k<14;k++){const u=-3.5+k*0.5;const m=k%2?'yellow':'black';B.box(m,xc+u,0,zc-4.1,xc+u+0.5,0.03,zc-3.6);B.box(m,xc+u,0,zc+3.6,xc+u+0.5,0.03,zc+4.1);}
    B.box('glass',xc-2.6,0.4,zc-2.6,xc+2.6,5,zc+2.6,['ny']);
    for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1]])B.box('steelDark',xc+sx*2.6-0.06,0.4,zc+sz*2.6-0.06,xc+sx*2.6+0.06,5,zc+sz*2.6+0.06);
    B.box('steelDark',xc-2.66,5,zc-2.66,xc+2.66,5.15,zc+2.66);
    obj(o,xc,0.4,zc);F.terminal(xc+3.2,0,zc+(zc>30?-3.2:3.2),zc>30?0:Math.PI);
    F.panel(xc,10,zc,1.6,0.8,0.9,12);}
  LT(-110,9,30,0xe8f0ff,0.4,60);
  anchors.fridge=first;

  // ================================================================ the Archives
  B.room({floor:'carpetGrey',wall:'concreteDark',ceil:'concreteDark:ceil'},45,0,0,175,26,70,{w:[[25,35,6]]});
  corr(30,25,45,35,5,false);
  for(let r=0;r<7;r++){const zc=6+r*9.5;if(Math.abs(zc-30)<4)continue;
    B.box('woodDark',55,0,zc-0.8,168,20,zc+0.8,['pz','nz']);
    for(const s of [-1,1]){const zf=zc+s*0.8;B.quad('paper',[55,0.3,zf],[168,0.3,zf],[168,19.7,zf],[55,19.7,zf],[0,0,s]);
      for(let y=2.4;y<20;y+=2.4){const zz=zf+s*0.02;B.quad('woodDark',[55,y,zz],[168,y,zz],[168,y+0.12,zz],[55,y+0.12,zz],[0,0,s]);}}
    // a catwalk on each side at seven and fourteen metres, ladders up
    for(const y of [7,14]){B.box('grate',55,y-0.2,zc+0.8,168,y,zc+2.2);B.box('steelDark',55,y,zc+2.1,168,y+1.0,zc+2.2);}
    for(const x of [60,110,160]){B.box('steelDark',x,0,zc+1.6,x+0.08,14,zc+1.7);B.box('steelDark',x+0.7,0,zc+1.6,x+0.78,14,zc+1.7);}}
  F.desk(100,0,30,0);F.chair(100,0,31,Math.PI);F.lamp(100.6,0.95,29.8,0xffc880,0.7,8);
  for(let x=60;x<170;x+=12)for(const z of [10,30,50])F.panel(x,26,z,1.6,0.8,0.7,22,0xffe8c0);
  F.panels(48,4,48,66,6,6,0.6,10,0xffe0b0);

  // ================================================================ Logistics
  B.room({floor:'concrete',wall:'concreteDark',ceil:'concreteDark:ceil'},45,0,85,175,16,175,{w:[[25,35,5]]});
  for(let r=0;r<4;r++){const zc=95+r*20;if(zc>160)continue;
    for(let x=60;x<=160;x+=10){B.box('steelDark',x-0.1,0,zc-1.2,x+0.1,9,zc-1.0);B.box('steelDark',x-0.1,0,zc+1.0,x+0.1,9,zc+1.2);}
    for(const y of [0.2,3.2,6.2]){B.box('orange',60,y,zc-1.2,160,y+0.15,zc-1.05);B.box('orange',60,y,zc+1.05,160,y+0.15,zc+1.2);
      for(let x=61;x<159;x+=2.4)if(rnd()<0.8){const h=0.8+rnd()*1.6;B.box(rnd()<0.5?'wood':rnd()<0.5?'woodDark':'panel',x,y+0.15,zc-0.9,x+2,y+0.15+Math.min(h,2.7),zc+0.9);}}}
  for(let k=0;k<26;k++){const x=55+rnd()*110,z=158+rnd()*12;B.blk(rnd()<0.5?'wood':'woodDark',x,0,z,1.4+rnd(),1+rnd()*1.2,1.4+rnd());}
  // the forklift, the conveyor
  B.box('yellow',90,0.4,170,93,2.2,172);B.box('steelDark',90,0,169.6,93,0.5,172.4);B.box('steelDark',89.6,0,170.2,89.8,4,171.8);B.box('black',91,2.2,170.2,92.8,3.6,171.8);
  B.box('steelDark',100,0,166,170,0.9,167.6);for(let x=101;x<170;x+=1.2)B.box('steel',x,0.9,166,x+0.5,0.95,167.6);
  for(let x=60;x<170;x+=14)for(const z of [100,140])F.panel(x,16,z,1.6,0.8,0.8,22,0xfff0d8);
  F.panels(48,90,48,170,5,6,0.6,10);

  // ================================================================ the Medical Wing
  B.room({floor:'tile',wall:'tile',ceil:'ceiling:ceil'},-175,0,85,-45,5,175,{e:[[25,35,4]]});
  for(let i=0;i<8;i++){const xc=-165+i*14;for(const zs of [92,168]){const s=zs<120?1:-1;
      B.box('steel',xc-1,0,zs,xc+1,0.55,zs+s*2.2);B.box('white',xc-0.95,0.55,zs+s*0.1,xc+0.95,0.75,zs+s*2.1);B.box('white',xc-0.7,0.75,zs+s*0.2,xc+0.7,0.9,zs+s*0.7);
      B.box('panel',xc+3,0,zs,xc+3.05,2.6,zs+s*3);F.cabinet(xc-2.2,0,zs+s*0.4,s>0?0:Math.PI);
      /* a curtain on its rail across the foot of the bed, drawn back to the partition in pleats; a drip stand; a
         monitor on the cabinet */
      const zc=zs+s*2.9;B.beam('steel',[xc-3,2.5,zc],[xc+3,2.5,zc],0.04,0.04);
      for(let k=0;k<7;k++)B.box('curtain',xc+1.1+k*0.27,0.35,zc-0.03+(k%2)*0.08*s,xc+1.38+k*0.27,2.45,zc+0.01+(k%2)*0.08*s);
      B.beam('steel',[xc+1.3,0,zs+s*0.5],[xc+1.3,2.0,zs+s*0.5],0.04,0.04);B.box('glass',xc+1.2,1.6,zs+s*0.45-0.05,xc+1.4,1.95,zs+s*0.45+0.05);
      const mz0=zs+s*0.25,mz1=zs+s*0.55;B.box('steelDark',xc-2.4,1.32,Math.min(mz0,mz1),xc-2.0,1.62,Math.max(mz0,mz1));B.box('screen',xc-2.36,1.36,zs+s*0.56-0.005,xc-2.04,1.58,zs+s*0.56+0.005);}}
  // the ward walls either side of the middle corridor, a doorway into each bay
  for(const zw of [112,138])for(let x=-175;x<-45;x+=14){B.box('tile',x,0,zw-0.15,x+10,3.2,zw+0.15);B.box('tile',x+10,2.4,zw-0.15,x+14,3.2,zw+0.15);
    B.box('tileGreen',x,1.0,zw-0.17,x+10,1.25,zw+0.17,['ny','py']);}
  B.box('teal',-175,0,118.8,-45,0.015,119.2,['ny']);   /* the guide line down the middle corridor */
  // the nurses' station and the operating table
  B.box('panel',-125,0,124,-95,1.1,126);B.box('white',-125.2,1.1,123.8,-94.8,1.16,126.2);F.terminal(-118,0,128,Math.PI);F.terminal(-104,0,128,Math.PI);
  B.box('steel',-70,0,128,-67.5,0.9,132);B.box('white',-70.2,0.9,127.8,-67.3,1.05,132.2);B.cyl('steelDark',-68.7,3.8,130,1.2,1.4,0.5,16);B.box('lightWhite',-69.4,3.75,129.3,-68,3.8,130.7);
  LT(-68.7,3.4,130,0xffffff,1.2,10);
  for(let x=-170;x<-45;x+=8)for(const z of [100,130,160])F.panel(x,5,z,1.2,0.6,0.85,10,0xf0f8ff);
  lights.zone(W(-176,-1,84),W(-44,6,176),0xd8e2e4,0.35);

  B.pop();
  anchors.containmentVerts=vcount()-v0;

  // ================================================================ the sector's light, air, places, views, cards
  lights.zone(W(-180,-40,-180),W(180,100,180),0x2c2e32,0.25);
  const pc=W(0,10,-100),tc=W(0,0,30),hc=W(-110,0,30),ac=W(110,8,35),lc=W(110,0,130),mc=W(-110,0,130),ck=W(0,0,160);
  const fr=anchors.fridge;
  zones.push({c:pc,r:70,color:'#0c3436',density:0.010},{c:mc,r:70,color:'#cfd8da',density:0.0035},{c:W(0,10,40),r:170,color:'#17181b',density:0.006});
  places.push(['the Panopticon',pc,64],['the Turntable',tc,31],['the containment cubes',hc,70],['the Archives',ac,70],['Logistics',lc,70],['the Medical Wing',mc,70],['the Containment checkpoint',ck,22],['the Containment Sector',W(0,0,0),190]);
  const G='Containment';
  views.push(
    {name:'The Panopticon',group:G,t:W(0,5,-100),d:52,yaw:0.3,pitch:0.12,card:'contain_panopticon'},
    {name:'The Panopticon, from the pit',group:G,t:W(0,40,-100),d:62,yaw:0.8,pitch:-1.15,card:'contain_panopticon'},
    {name:'The observation cabin',group:G,t:W(0,76,-100),d:42,yaw:1.2,pitch:0.22,card:'contain_tower'},
    {name:'The walls of cells',group:G,t:W(Math.cos(-Math.PI/4)*56,20,-100+Math.sin(-Math.PI/4)*56),d:22,yaw:-Math.PI/4,pitch:0.15,card:'contain_cells'},
    {name:'The Turntable',group:G,t:W(0,3,30),d:26,yaw:0.5,pitch:0.32,card:'contain_turntable'},
    {name:'The containment cubes',group:G,t:W(-110,3,30),d:40,yaw:1.4,pitch:0.12,card:'contain_cubes'},
    {name:'Under watch: a refrigerator',group:G,t:W(fr[0],2.5,fr[1]),d:9,yaw:0.4,pitch:0.15,card:'contain_fridge'},
    {name:'The Archives',group:G,t:W(110,10,35),d:45,yaw:1.3,pitch:0.15,card:'contain_archives'},
    {name:'Logistics',group:G,t:W(110,4,130),d:40,yaw:0.9,pitch:0.2,card:'contain_logistics'},
    {name:'The Medical Wing',group:G,t:W(-110,2,130),d:30,yaw:-1.2,pitch:0.05,card:'contain_medical'},
    {name:'A ward bay',group:G,t:W(-123,1.0,95),d:8,yaw:0.3,pitch:0.18,card:'contain_medical'},
    {name:'The Containment checkpoint',group:G,t:W(0,2,160),d:14,yaw:0.2,pitch:0.1,card:'contain_checkpoint'},
    {name:'Containment from above',group:G,t:W(0,0,0),d:420,yaw:0.4,pitch:1.1,card:'contain_sector',cut:true});
  Object.assign(cards,{
    contain_sector:{h:'The Containment Sector',p:'Where the Bureau keeps what it cannot explain. Through the checkpoint, a spine runs north to the Turntable, the hub; from it the Panopticon, the hall of containment cubes and the Archives; off the spine the Medical Wing and Logistics.',sub:'North of the Executive, a level down.'},
    contain_panopticon:{h:'The Panopticon',p:'A cylinder sixty metres across and a hundred and twenty high, every inch of its wall a cell. From the tower in the middle, every cell can be watched and no cell can see who is watching. The haze in here is teal.',sub:'Catwalk rings every two levels; bridges out from the tower at three.'},
    contain_tower:{h:'The observation tower',p:'A shaft of concrete banded with teal windows, the cabin at its top ringed in glass, searchlights on its roof sweeping the walls.',sub:'Events: Lockdown turns them red.'},
    contain_cells:{h:'The cells',p:'Rings of them, all the way up: dark recesses, a strip of light in some. What is in them is on file; the files are in the Archives.',sub:''},
    contain_turntable:{h:'The Turntable',p:'The sector\'s hub: a round room with a great platform turning in its floor, driven by the hydraulic arms round its rim, so that what comes in by one door can be turned to face another.',sub:'Events: the Turntable turns.'},
    contain_cubes:{h:'The containment cubes',p:'A hall of glass cubes on warning-striped plinths, each holding something perfectly ordinary - a refrigerator, a rubber duck, a floppy disk, a slide projector, a mailbox, a traffic light - that is not ordinary at all. Altered Items and Objects of Power do not look like anything.',sub:'Each has its terminal, and someone watching the terminal.'},
    contain_fridge:{h:'A refrigerator',p:'Kept under observation. The procedure for it is simple and must not be broken: someone is always looking at it.',sub:'Do not look away.'},
    contain_archives:{h:'The Archives',p:'Shelves of files twenty metres high, catwalks between them at seven and fourteen, ladders up. Every incident, every item, every redaction.',sub:''},
    contain_logistics:{h:'Logistics',p:'Pallet racks and crates, a forklift, a conveyor: how things get into Containment, and very occasionally out.',sub:''},
    contain_medical:{h:'The Medical Wing',p:'White tile, beds in curtained bays, the nurses\' station, an operating table under its lamp. The air is clean in here, and very bright.',sub:''},
    contain_checkpoint:{h:'The Containment checkpoint',p:'Where the transit corridor from the Executive comes in: scanner arches, the guard\'s counter, barriers, cameras.',sub:''},
    contain_lockdown:{h:'Lockdown',p:'The Panopticon\'s alarms: red lights flashing on every ring, the searchlights turned red, the haze gone the colour of a warning.',sub:'Half a minute.'},
  });

  // ================================================================ the events
  const pv=views[views.length-12];
  events.push({key:'lockdown',label:'Containment: Lockdown',card:'contain_lockdown',view:pv,start:()=>{
    const P=anchors.panopticon,zone=zones[zones.length-3],c0=zone.color,d0=zone.density,col0=P.beamM.color.getHex();
    // strobes on the rings: one instanced mesh of red lamps round every catwalk
    const N=6*14,im=new THREE.InstancedMesh(new THREE.SphereGeometry(0.9,8,6),new THREE.MeshBasicMaterial({color:0xff2a1a}),N),m=new THREE.Object3D();let i=0;
    for(let y=-28;y<84;y+=8)for(let k=0;k<6;k++){const a=k/6*Math.PI*2+y*0.01;m.position.set(ox+Math.cos(a)*55.5,oy+y+2.5,oz-100+Math.sin(a)*55.5);m.updateMatrix();if(i<N)im.setMatrixAt(i++,m.matrix);}
    im.count=i;im.userData.noFingerprint=true;dyn.add(im);let t0=null;
    return {update(t){if(t0==null)t0=t;const u=t-t0,on=Math.sin(u*9)>0;
      im.visible=on;P.beamM.color.setHex(0xff3a2a);P.beamM.opacity=on?0.16:0.08;zone.color=on?'#3a0608':'#200406';zone.density=0.012;
      if(u>30){dyn.remove(im);P.beamM.color.setHex(col0);P.beamM.opacity=0.1;zone.color=c0;zone.density=d0;return false;}}};}});
  events.push({key:'turntable',label:'Containment: the Turntable turns',card:'contain_turntable',view:views[views.length-8],start:()=>{let t0=null;
    return {update(t){if(t0==null)t0=t;const u=t-t0;anchors.ttSpeed=0.05+0.6*Math.sin(Math.min(1,u/16)*Math.PI);if(u>16){anchors.ttSpeed=0.05;return false;}}};}});

  // ---- the things in the cubes ----
  function obj(o,x,y,z){B.at(x,y,z,0);
    switch(o){
    case 'fridge':B.box('white',-0.45,0,-0.4,0.45,1.8,0.4);B.box('steel',-0.44,1.2,0.4,0.44,1.21,0.42);B.box('steel',0.3,0.5,0.4,0.36,1.1,0.47);B.box('steel',0.3,1.3,0.4,0.36,1.7,0.47);break;
    case 'duck':B.box('yellow',-0.5,0,-0.35,0.4,0.55,0.35);B.box('yellow',0.15,0.5,-0.22,0.55,0.9,0.22);B.box('orange',0.55,0.6,-0.1,0.75,0.7,0.1);B.box('black',0.45,0.76,-0.23,0.5,0.82,-0.17);B.box('black',0.45,0.76,0.17,0.5,0.82,0.23);break;
    case 'floppy':B.box('steelDark',-0.15,0,-0.15,0.15,1.0,0.15);B.box('black',-0.3,1.0,-0.3,0.3,1.02,0.3);B.box('steel',-0.15,1.02,-0.3,0.15,1.03,-0.05);B.box('white',-0.2,1.02,0.05,0.2,1.03,0.28);break;
    case 'projector':B.box('steelDark',-0.4,0.6,-0.3,0.4,0.9,0.3);B.box('steelDark',-0.3,0,-0.3,0.3,0.6,0.3);B.box('black',0.4,0.68,-0.08,0.6,0.84,0.08);B.cyl('steel',-0.05,0.9,0,0.35,0.35,0.1,16);B.box('lightWhite',0.6,0.7,-0.06,0.62,0.82,0.06);break;
    case 'mailbox':B.box('steelDark',-0.08,0,-0.08,0.08,1.0,0.08);B.box('motel',-0.35,1.0,-0.25,0.35,1.5,0.25);B.cyl('motel',0,1.5,0,0.25,0.25,0.01,12);B.box('red',0.36,1.3,-0.02,0.38,1.6,0.02);break;
    case 'traffic':B.box('steelDark',-0.08,0,-0.08,0.08,1.3,0.08);B.box('black',-0.3,1.3,-0.25,0.3,3.0,0.25);B.box('lightRed',-0.15,2.6,0.25,0.15,2.85,0.27);B.box('yellow',-0.15,2.1,0.25,0.15,2.35,0.27);B.box('screen',-0.15,1.6,0.25,0.15,1.85,0.27);break;
    case 'tv':B.box('woodDark',-0.5,0,-0.4,0.5,0.6,0.4);B.box('woodDark',-0.55,0.6,-0.45,0.55,1.4,0.45);B.box('screen',-0.42,0.7,0.45,0.32,1.3,0.47);break;
    case 'rocker':B.box('wood',-0.35,0.45,-0.35,0.35,0.52,0.35);B.box('wood',-0.35,0.52,0.28,0.35,1.25,0.35);for(const s of [-1,1])B.beam('wood',[s*0.33,0.02,-0.6],[s*0.33,0.02,0.6],0.06,0.08);for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]])B.box('wood',a*0.3-0.03,0.02,b*0.3-0.03,a*0.3+0.03,0.45,b*0.3+0.03);break;
    case 'phone':B.box('steelDark',-0.2,0,-0.2,0.2,0.9,0.2);B.box('red',-0.25,0.9,-0.2,0.25,1.05,0.2);B.box('red',-0.28,1.06,-0.08,0.28,1.14,0.08);break;
    case 'lamp':B.cyl('steelDark',0,0,0,0.3,0.3,0.05,12);B.box('steel',-0.03,0.05,-0.03,0.03,1.4,0.03);B.cyl('lightWarm',0,1.3,0,0.35,0.2,0.35,12);break;
    case 'mug':B.box('steelDark',-0.2,0,-0.2,0.2,1.0,0.2);B.cyl('white',0,1.0,0,0.09,0.09,0.18,12);B.box('white',0.09,1.05,-0.02,0.14,1.13,0.02);break;
    case 'cassette':B.box('steelDark',-0.2,0,-0.2,0.2,1.0,0.2);B.box('steel',-0.35,1.0,-0.15,0.35,1.25,0.15);B.box('black',-0.2,1.08,0.15,0.2,1.2,0.16);break;}
    B.pop();}
}

function mergeGeo(THREE,gs){let n=0;for(const g of gs)n+=g.attributes.position.count;const p=new Float32Array(n*3),nn=new Float32Array(n*3);let o=0;
  for(const g of gs){p.set(g.attributes.position.array,o*3);nn.set(g.attributes.normal.array,o*3);o+=g.attributes.position.count;}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(p,3));G.setAttribute('normal',new THREE.BufferAttribute(nn,3));return G;}
