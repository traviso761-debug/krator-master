// ---------- the Executive Sector, its transit corridors, and the tower on its street ----------
// Fan work after Remedy Entertainment's Control (2019); nothing of theirs is used.
//
// The middle of the House, laid out round the Central Executive the way the sector map draws it:
//   Central Executive   a ninety-metre atrium thirty high: red carpet, a sunken square of white stone steps with
//                       the Bureau's seal inlaid, great fluted concrete piers, three galleries faced in walnut,
//                       a broad stair, office doors all round; the black inverted pyramid hanging over the middle
//   north               the Director's office (red carpet, walls of shelving, the long white window, the desk, the
//                       flag) and through its ornate door the round Hotline chamber with the red phone
//   east                the Board Room (long table, the pyramid on the wall), Communications, the cafeteria
//   west                Dead Letters (a sixty-metre concrete hall of stacked balconies, conveyors of letters,
//                       pneumatic tubes, white light from above), the mail room, Executive Affairs' cubicles
//   south               the lobby: terrazzo, the seal, the reception desk, the elevators
//   out                 transit corridors to Research (west), Maintenance (east), Containment (north) and
//                       Investigations (south); the lift shaft down to the Foundation
//   the street          the tower itself in Manhattan, at the street sector's origin: windowless, ribbed, ignored
// Events: 'The Hiss' (the possessed rise over the Central Executive, chanting, the air going red) and 'The Board
// calls' (the pyramid appears over the Board Room table, in white light).

export function buildExecutive(K){
  const {THREE,B,F,lights:LT,C}=K,[ox,oy,oz]=K.O,R=K.rnd;
  const X=x=>ox+x,Y=y=>oy+y,Z=z=>oz+z;
  const room=(m,x0,y0,z0,x1,y1,z1,g,o)=>B.room(m,X(x0),Y(y0),Z(z0),X(x1),Y(y1),Z(z1),g,o);
  const CARPET={floor:'carpet',wall:'concrete',ceil:'ceiling:ceil'},PANEL={floor:'terrazzo',wall:'panel',ceil:'panel:ceil'};
  // a straight corridor between two rooms: floor, ceiling, two walls, both ends open, lights down the middle
  function corr(axis,a0,a1,c,w,h,y0,y1,m,lit=true,slope){
    m=m||PANEL;const segs=slope?[[a0,slope[0],y0,y0],[slope[0],slope[1],y0,y1],[slope[1],a1,y1,y1]]:[[a0,a1,y0,y1]];
    for(const [s0,s1,ya,yb] of segs){if(s1-s0<0.01)continue;
      const P=(a,y,cc)=>axis==='x'?[X(a),Y(y),Z(cc)]:[X(cc),Y(y),Z(a)],c0=c-w/2,c1=c+w/2;
      const up=[0,1,0],dn=[0,-1,0],in0=axis==='x'?[0,0,1]:[1,0,0],in1=axis==='x'?[0,0,-1]:[-1,0,0];
      B.quad(m.floor,P(s0,ya,c0),P(s1,yb,c0),P(s1,yb,c1),P(s0,ya,c1),up);
      B.quad(m.ceil,P(s0,ya+h,c0),P(s1,yb+h,c0),P(s1,yb+h,c1),P(s0,ya+h,c1),dn);
      B.quad(m.wall,P(s0,ya,c0),P(s1,yb,c0),P(s1,yb+h,c0),P(s0,ya+h,c0),in0);
      B.quad(m.wall,P(s0,ya,c1),P(s1,yb,c1),P(s1,yb+h,c1),P(s0,ya+h,c1),in1);
      // the plain ones get a dark skirting, and every twelve metres a concrete rib: two pilasters and a beam over
      if(m===PANEL){B.quad('concreteDark',P(s0,ya,c0+0.02),P(s1,yb,c0+0.02),P(s1,yb+0.22,c0+0.02),P(s0,ya+0.22,c0+0.02),in0);
        B.quad('concreteDark',P(s0,ya,c1-0.02),P(s1,yb,c1-0.02),P(s1,yb+0.22,c1-0.02),P(s0,ya+0.22,c1-0.02),in1);
        const bx=(mm,a0,a1,y0,y1,d0,d1,skip)=>axis==='x'?B.box(mm,X(a0),Y(y0),Z(d0),X(a1),Y(y1),Z(d1),skip):B.box(mm,X(d0),Y(y0),Z(a0),X(d1),Y(y1),Z(a1),skip);
        for(let a=s0+6;a<s1-3;a+=12){const y=ya+(yb-ya)*(a-s0)/(s1-s0);
          bx('concreteDark',a-0.3,a+0.3,y-0.2,y+h,c0,c0+0.25,['ny']);bx('concreteDark',a-0.3,a+0.3,y-0.2,y+h,c1-0.25,c1,['ny']);
          bx('concreteDark:ceil',a-0.3,a+0.3,y+h-0.35,y+h,c0,c1,['py']);}}
      if(lit){const n=Math.max(1,Math.round((s1-s0)/8));for(let k=0;k<n;k++){const t=(k+0.5)/n,a=s0+(s1-s0)*t,y=ya+(yb-ya)*t+h;
        const p=axis==='x'?[X(a),Y(y),Z(c)]:[X(c),Y(y),Z(a)];F.panel(p[0],p[1],p[2],axis==='x'?1.8:0.6,axis==='x'?0.6:1.8,0.85,11);}}}}
  const zone=(x0,y0,z0,x1,y1,z1,col,k)=>LT.zone([X(x0),Y(y0),Z(z0)],[X(x1),Y(y1),Z(z1)],col,k);
  const card=(k,h,p,sub)=>{K.cards[k]={h,p,sub:sub||'Executive Sector'};};
  const view=(name,t,d,yaw,pitch,c,group)=>K.views.push({name,group:group||'Executive',t:[X(t[0]),Y(t[1]),Z(t[2])],d,yaw,pitch,card:c});
  const place=(name,p,r)=>K.places.push([name,[X(p[0]),Y(p[1]),Z(p[2])],r]);
  const fog=(p,r,color,density)=>K.zones.push({c:[X(p[0]),Y(p[1]),Z(p[2])],r,color,density});

  // ================================================================ the Central Executive
  const A=45,AH=30;
  room({wall:'concrete',ceil:'concrete:ceil'},-A,0,-A,A,AH,A,{
    n:[[41,49,4],[76,84,5]],s:[[41,49,5],[81,89,5]],e:[[1,5,3.5],[29,37,4],[75,81,4]],w:[[35,43,5],[85,89,3.5]]},{noFloor:true});
  // the floor: red carpet round a sunken square of white stone steps
  for(const [x0,z0,x1,z1] of [[-A,-A,A,-15],[-A,15,A,A],[-A,-15,-15,15],[15,-15,A,15]])B.quad('carpet',[X(x0),Y(0),Z(z0)],[X(x1),Y(0),Z(z0)],[X(x1),Y(0),Z(z1)],[X(x0),Y(0),Z(z1)],[0,1,0]);
  for(let k=0;k<3;k++){const so=15-1.2*k,si=15-1.2*(k+1),top=-0.5*k;
    for(const [x0,z0,x1,z1] of [[-so,-so,so,-si],[-so,si,so,so],[-so,-si,-si,si],[si,-si,so,si]])B.box('terrazzo',X(x0),Y(-1.5),Z(z0),X(x1),Y(top),Z(z1),['ny']);}
  B.quad('terrazzo',[X(-11.4),Y(-1.5),Z(-11.4)],[X(11.4),Y(-1.5),Z(-11.4)],[X(11.4),Y(-1.5),Z(11.4)],[X(-11.4),Y(-1.5),Z(11.4)],[0,1,0]);
  // the seal: a dark disc ringed in brass, a ring within it, the Bureau's mark across it
  B.ring('carpetDark',X(0),Y(-1.48),Z(0),0.01,7.4,32);B.ring('brass',X(0),Y(-1.47),Z(0),7.0,7.4,40);B.ring('brass',X(0),Y(-1.47),Z(0),4.2,4.45,32);B.ring('terrazzo',X(0),Y(-1.46),Z(0),0.01,1.4,16);
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2;B.beam('brass',[X(Math.cos(a)*1.6),Y(-1.46),Z(Math.sin(a)*1.6)],[X(Math.cos(a)*4.1),Y(-1.46),Z(Math.sin(a)*4.1)],0.18,0.02);}
  // research equipment set up on the seal: tripod lamps and a dish, as the Bureau left it
  for(const [x,z,a] of [[-6,3,0.3],[5,-5,2.2],[6,6,4.1]]){for(let k=0;k<3;k++){const b=a+k*2.1;B.beam('steelDark',[X(x+Math.cos(b)*0.8),Y(-1.5),Z(z+Math.sin(b)*0.8)],[X(x),Y(0.3),Z(z)],0.05,0.05);}
    B.beam('steelDark',[X(x),Y(0.3),Z(z)],[X(x),Y(1.6),Z(z)],0.05,0.05);F.lamp(X(x),Y(1.75),Z(z),0xfff0d8,0.9,10);}
  B.at(X(-3),Y(-1.5),Z(-6),0.6);B.cyl('steel',0,0.8,0,1.4,1.6,0.3,12);B.beam('steelDark',[0,0,0],[0,0.8,0],0.08,0.08);B.pop();
  // the piers: four great fluted slabs at the corners of the square, turned to the diagonal, four lesser on its sides
  for(const [x,z] of [[-19,-19],[19,-19],[19,19],[-19,19]])F.pier(X(x),Y(0),Z(z),7,3.5,9,Math.atan2(z,x)+Math.PI/2);
  for(const [x,z,a] of [[0,-21,0],[0,21,0],[-21,0,Math.PI/2],[21,0,Math.PI/2]])F.pier(X(x),Y(0),Z(z),5,2.6,6.5,a);
  // tall piers rising past the galleries, along their inner edges
  for(const s of [-1,1])for(const u of [-28,-9,9,28]){F.pier(X(s*39),Y(0),Z(u),2.4,2.4,AH,0);F.pier(X(u),Y(0),Z(s*39),2.4,2.4,AH,0);}
  // three galleries round the walls: slab, carpet, a walnut parapet, lights under each, office doors along the wall
  const GD=7;
  for(const gy of [8,16,24]){
    const slabs=[[-A,-A,A,-A+GD],[-A,A-GD,A,A],[-A,-A+GD,-A+GD,A-GD],[A-GD,-A+GD,A,A-GD]];
    for(const [x0,z0,x1,z1] of slabs){B.box('concrete',X(x0),Y(gy-0.8),Z(z0),X(x1),Y(gy),Z(z1),['py']);B.quad('carpet',[X(x0),Y(gy),Z(z0)],[X(x1),Y(gy),Z(z0)],[X(x1),Y(gy),Z(z1)],[X(x0),Y(gy),Z(z1)],[0,1,0]);}
    const e=A-GD;
    for(const [x0,z0,x1,z1] of [[-e,-e,e,-e+0.2],[-e,e-0.2,e,e],[-e,-e,-e+0.2,e],[e-0.2,-e,e,e]]){
      if(gy===8&&z0>e-1)continue;   /* the south parapet on the first gallery is where the stair comes up */
      B.box('wood',X(x0),Y(gy-1.4),Z(z0),X(x1),Y(gy+1.05),Z(z1));}
    if(gy===8){B.box('wood',X(-e),Y(gy-1.4),Z(e-0.2),X(-14),Y(gy+1.05),Z(e));B.box('wood',X(-1),Y(gy-1.4),Z(e-0.2),X(e),Y(gy+1.05),Z(e));}
    for(const [x0,z0,x1,z1] of slabs){const cx=(x0+x1)/2,cz=(z0+z1)/2;if(x1-x0>z1-z0)F.panels(X(x0+6),Z(cz),X(x1-6),Z(cz),Y(gy-0.85),12,0.7,10);else F.panels(X(cx),Z(z0+6),X(cx),Z(z1-6),Y(gy-0.85),12,0.7,10);}
    // doors along the walls on this level
    for(let u=-36;u<=36;u+=12){for(const [x,z,yaw] of [[u,-A+0.12,0],[u,A-0.12,0],[-A+0.12,u,Math.PI/2],[A-0.12,u,Math.PI/2]]){
      if(Math.abs(u)<6&&Math.abs(z)>40)continue;B.at(X(x),Y(gy),Z(z),yaw);B.box('woodDark',-0.7,0,-0.08,0.7,2.4,0.08);B.box('brass',0.45,1.05,-0.12,0.55,1.15,0.12);B.pop();
      F.doorframe(X(x),Y(gy),Z(z),yaw,1.4,2.4,'concreteDark');}}
    // between the doors, each office's window onto the gallery: a dark pane in a concrete frame, its blinds part down
    for(let u=-30;u<=30;u+=12){for(const [x,z,yaw] of [[u,-A+0.12,0],[u,A-0.12,Math.PI],[-A+0.12,u,Math.PI/2],[A-0.12,u,-Math.PI/2]]){
      B.at(X(x),Y(gy),Z(z),yaw);B.quad('panelDark',[-2.2,0.9,0.02],[2.2,0.9,0.02],[2.2,2.5,0.02],[-2.2,2.5,0.02],[0,0,1]);
      B.box('concreteDark',-2.4,0.75,0,2.4,0.9,0.22);B.box('concreteDark',-2.4,2.5,0,2.4,2.65,0.12);B.box('concreteDark',-2.4,0.9,0,-2.2,2.5,0.12);B.box('concreteDark',2.2,0.9,0,2.4,2.5,0.12);
      B.box('concreteDark',-0.05,0.9,0,0.05,2.5,0.1);const was=B.coarse;B.coarse=true;for(let k=0;k<5;k++)B.box('white',-2.2,2.42-k*0.1,0.04,2.2,2.46-k*0.1,0.07,['ny','nz']);B.coarse=was;B.pop();}}}
  // doors on the floor level too, between the openings
  for(const [x,z,yaw] of [[-30,-A+0.12,0],[-20,-A+0.12,0],[20,-A+0.12,0],[-30,A-0.12,0],[20,A-0.12,0],[-A+0.12,-30,Math.PI/2],[-A+0.12,20,Math.PI/2],[A-0.12,-10,Math.PI/2],[A-0.12,15,Math.PI/2]]){
    B.at(X(x),Y(0),Z(z),yaw);B.box('woodDark',-0.8,0,-0.08,0.8,2.6,0.08);B.pop();F.doorframe(X(x),Y(0),Z(z),yaw,1.6,2.6,'concreteDark');}
  // the broad stair up to the first gallery on the south side, a landing onto it
  B.stairs('concrete',X(-27),Y(0),Z(33),0,8,0.4,0.5,20,'steelDark');
  B.box('concrete',X(-17),Y(7.2),Z(29),X(-13),Y(8),Z(A-GD));B.quad('carpet',[X(-17),Y(8.01),Z(29)],[X(-13),Y(8.01),Z(29)],[X(-13),Y(8.01),Z(A-GD)],[X(-17),Y(8.01),Z(A-GD)],[0,1,0]);
  B.box('concrete',X(-27.2),Y(0),Z(28.8),X(-13),Y(0.2),Z(29),['ny']);
  // the ceiling's light: a grid of panels high up, and the glow it fills the atrium with
  for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++)B.box('lightPanel',X(i*11-2),Y(AH-0.06),Z(j*11-1),X(i*11+2),Y(AH),Z(j*11+1),['py']);
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)LT.add([X(i*26),Y(20),Z(j*26)],0xfff0dc,0.42,48);
  zone(-A,-2,-A,A,AH,A,0x86786e,0.45);
  // planters and benches round the floor
  for(const [x,z] of [[-32,-28],[30,-30],[-30,24],[32,22],[-8,-32],[8,30]])F.plant(X(x),Y(0),Z(z),1.6);
  for(const [x,z,a] of [[-26,-6,Math.PI/2],[26,6,Math.PI/2],[6,-26,0],[-6,26,0]]){B.at(X(x),Y(0),Z(z),a);B.box('woodDark',-2,0.4,-0.4,2,0.5,0.4);B.box('concreteDark',-1.8,0,-0.3,-1.4,0.4,0.3);B.box('concreteDark',1.4,0,-0.3,1.8,0.4,0.3);B.pop();}
  card('central','The Central Executive','The heart of the Executive Sector: red carpet, slabs of fluted concrete, galleries faced in walnut climbing to a ceiling of light, and in the middle a sunken square of white steps with the Bureau\'s seal set in its floor. Over it all hangs a black pyramid, upside down, turning very slowly. Nobody talks about it.');
  card('pyramid','The black pyramid','A great inverted pyramid of matte black, hanging point-down over the seal. It is not on any blueprint. The Board, when it speaks, speaks in its shape.','Executive Sector · Central Executive');
  card('seal','The seal','The Federal Bureau of Control\'s seal in brass and dark stone at the foot of the steps. The researchers have left their lamps and a dish set up round it.','Executive Sector · Central Executive');
  card('galleries','The galleries','Three floors of offices round the atrium, each behind a walnut parapet, each door the same. The walls go on up past the last one to the light.','Executive Sector · Central Executive');
  view('The Central Executive',[0,5,0],38,0.62,0.38,'central');
  view('The black pyramid',[0,20,0],22,2.3,-0.12,'pyramid');
  view('The seal',[0,-1.5,0],17,0.35,0.95,'seal');
  view('The galleries',[-32,17,-32],26,0.75,0.12,'galleries');
  place('the Central Executive',[0,12,0],56);fog([0,15,0],60,'#2c2624',0.0042);

  // the pyramid itself: matte black, a faint edge, turning and swaying a little over the seal
  {const g=new THREE.ConeGeometry(10,14,4,1).rotateX(Math.PI).rotateY(Math.PI/4);
   const py=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x050506}));
   const edges=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:0x44424a}));py.add(edges);
   py.position.set(X(0),Y(22),Z(0));K.dyn.add(py);K.anchors.pyramid=py;
   K.hooks.push((t)=>{py.rotation.y=t*0.03;py.position.y=Y(22)+Math.sin(t*0.35)*0.4;py.rotation.z=Math.sin(t*0.21)*0.012;});}

  // ================================================================ the Director's office, and the Hotline
  room(CARPET,-25,0,-110,25,10,-55,{s:[[21,29,4]],n:[[3,7,4]]});
  corr('z',-55,-45,0,8,4,0,0,{floor:'carpet',wall:'wood',ceil:'ceiling:ceil'});
  // the long window across the north wall, white, and the light it throws into the room
  B.box('lightSky',X(-15),Y(2.6),Z(-110),X(15),Y(7.2),Z(-109.92));B.box('concreteDark',X(-15.4),Y(2.3),Z(-109.95),X(15.4),Y(2.6),Z(-109.4));
  /* its frame: a deep head, mullions every three and three-quarter metres, a transom high up */
  B.box('concreteDark',X(-15.4),Y(7.2),Z(-109.95),X(15.4),Y(7.6),Z(-109.5));B.box('concreteDark',X(-15),Y(6.1),Z(-109.95),X(15),Y(6.22),Z(-109.75));
  for(let k=0;k<=8;k++){const x=-15+k*3.75;B.box('concreteDark',X(x-0.12),Y(2.6),Z(-109.95),X(x+0.12),Y(7.2),Z(-109.6));}
  for(const x of [-12,-4,4,12])LT.add([X(x),Y(5),Z(-107)],0xffffff,0.85,42,[0,-0.15,1]);
  zone(-25,0,-110,25,10,-55,0x8e8682,0.45);
  // walnut and shelving down both side walls, files packed in them
  for(const s of [-1,1]){B.box('wood',X(s*25-s*0.12),Y(0),Z(-108),X(s*25),Y(10),Z(-57));
    for(let z=-104;z<=-62;z+=3.2){F.shelves(X(s*24.6),Y(0),Z(z),s<0?Math.PI/2:-Math.PI/2,3,4.4);F.shelves(X(s*24.6),Y(4.5),Z(z),s<0?Math.PI/2:-Math.PI/2,3,4.4);}}
  // the dais under the window: walnut, a step down at its front, and on it the desk, its chair, two chairs before
  // it, a low credenza under the window, the flag, a lamp
  const DY=0.3;B.box('wood',X(-10),Y(0),Z(-109.9),X(10),Y(DY),Z(-91),['ny']);B.box('woodDark',X(-10.4),Y(0),Z(-91),X(10.4),Y(0.15),Z(-90.4),['ny']);
  B.box('brass',X(-10),Y(DY-0.02),Z(-91.06),X(10),Y(DY+0.01),Z(-90.96));
  F.desk(X(0),Y(DY),Z(-97),Math.PI,4,1.6);F.chair(X(0),Y(DY),Z(-99),Math.PI);F.chair(X(-1.2),Y(DY),Z(-94.5),0);F.chair(X(1.2),Y(DY),Z(-94.5),0);
  F.lamp(X(-1.5),Y(DY+1.05),Z(-97.3),0xffd9a0,0.6,6);
  B.box('woodDark',X(-6),Y(DY),Z(-109.4),X(6),Y(DY+0.85),Z(-108.6));for(let k=0;k<4;k++)B.box('brass',X(-4.6+k*3),Y(DY+0.5),Z(-108.62),X(-4.4+k*3),Y(DY+0.56),Z(-108.56));
  B.beam('brass',[X(7),Y(DY),Z(-104)],[X(7),Y(DY+3.6),Z(-104)],0.06,0.06);B.cyl('brass',X(7),Y(DY),Z(-104),0.35,0.28,0.12,10,{caps:true});
  for(let k=0;k<7;k++)B.box(k%2?'white':'red',X(7.05),Y(DY+3.4-k*0.22),Z(-104),X(8.8),Y(DY+3.62-k*0.22),Z(-103.96));
  B.box('motel',X(7.05),Y(DY+2.75),Z(-104.01),X(7.8),Y(DY+3.62),Z(-103.95));
  // where visitors wait: a dark rug ringed in brass, two sofas facing over a low table, floor lamps at the ends
  B.quad('carpetDark',[X(-8),Y(0.01),Z(-77)],[X(8),Y(0.01),Z(-77)],[X(8),Y(0.01),Z(-63)],[X(-8),Y(0.01),Z(-63)],[0,1,0]);
  for(const [a,b] of [[[-8,-77],[8,-77]],[[8,-77],[8,-63]],[[8,-63],[-8,-63]],[[-8,-63],[-8,-77]]])B.beam('brass',[X(a[0]),Y(0.02),Z(a[1])],[X(b[0]),Y(0.02),Z(b[1])],0.12,0.02);
  for(const sd of [-1,1]){B.at(X(sd*4.2),Y(0),Z(-70),sd<0?-Math.PI/2:Math.PI/2);B.box('carpetGrey',-2.4,0.2,-0.5,2.4,0.65,0.5);B.box('carpetGrey',-2.4,0.65,0.25,2.4,1.25,0.55);
    for(const e of [-1,1])B.box('carpetGrey',e*2.4-(e>0?0.3:0),0.2,-0.5,e*2.4+(e>0?0:0.3),0.95,0.55);B.box('woodDark',-2.3,0,-0.4,2.3,0.2,0.45);B.pop();
    F.lamp(X(sd*4.2),Y(1.9),Z(-74),0xffd8a0,0.5,7);B.beam('brass',[X(sd*4.2),Y(0),Z(-74)],[X(sd*4.2),Y(1.75),Z(-74)],0.05,0.05);}
  B.box('woodDark',X(-1.4),Y(0.38),Z(-71.4),X(1.4),Y(0.45),Z(-68.6));B.box('woodDark',X(-1.2),Y(0),Z(-71.2),X(1.2),Y(0.38),Z(-68.8),['ny']);
  // walnut up the south wall too, either side of the way in, panelled
  for(const [a,b] of [[-24.9,-4],[4,24.9]]){B.box('wood',X(a),Y(0),Z(-55.12),X(b),Y(3.2),Z(-55));for(let x=a+1.5;x<b-1;x+=3)B.box('woodDark',X(x),Y(0.4),Z(-55.16),X(x+2.2),Y(2.8),Z(-55.12));}
  // the ceiling: walnut beams in a grid under the tiles, a coffer every five metres
  for(let x=-20;x<=20;x+=5)B.box('woodDark:ceil',X(x-0.2),Y(9.4),Z(-110),X(x+0.2),Y(10),Z(-55),['py']);
  for(let z=-105;z<=-60;z+=5)B.box('woodDark:ceil',X(-25),Y(9.45),Z(z-0.2),X(25),Y(10),Z(z+0.2),['py']);
  for(const z of [-80,-68])F.panels(X(-15),Z(z),X(15),Z(z),Y(10),7.5,0.8,13);
  for(const x of [-18,18])F.plant(X(x),Y(0),Z(-60),1.3);
  // the ornate door to the Hotline: frames inside frames, brass and dark wood
  for(let k=0;k<4;k++){const w=2+k*0.5,h=4+k*0.4,m=k%2?'brass':'woodDark';B.box(m,X(-20-w),Y(0),Z(-109.9+k*0.04),X(-20-w+0.25),Y(h),Z(-109.6));B.box(m,X(-20+w-0.25),Y(0),Z(-109.9+k*0.04),X(-20+w),Y(h),Z(-109.6));B.box(m,X(-20-w),Y(h-0.25),Z(-109.9+k*0.04),X(-20+w),Y(h),Z(-109.6));}
  corr('z',-123,-110,-20,4,4,0,0,{floor:'carpetDark',wall:'woodDark',ceil:'ceiling:ceil'},false);
  F.lamp(X(-20),Y(3.6),Z(-116),0xffb080,0.5,6);
  // the Hotline chamber: round, dim, the red phone on its marble pedestal
  {const hx=X(-20),hz=Z(-135),hr=12;
   B.ring('carpetDark',hx,Y(0),hz,0.01,hr,28);B.ring('concrete:ceil',hx,Y(6),hz,0.01,hr,28,true);
   B.cyl('panelDark',hx,Y(0),hz,hr,hr,6,28,{inward:true,a0:Math.PI/2+0.18,a1:Math.PI/2+Math.PI*2-0.18});
   B.cyl('panelDark',hx,Y(4),hz,hr,hr,2,4,{inward:true,a0:Math.PI/2-0.18,a1:Math.PI/2+0.18});
   B.cyl('terrazzo',hx,Y(0),hz,0.6,0.45,1.0,12,{caps:true});B.cyl('terrazzo',hx,Y(1.0),hz,0.9,0.9,0.08,14,{caps:true});
   B.box('red',hx-0.3,Y(1.08),hz-0.22,hx+0.3,Y(1.25),hz+0.22);B.box('red',hx-0.36,Y(1.25),hz-0.08,hx+0.36,Y(1.36),hz+0.08);
   B.blk('red',hx-0.33,Y(1.18),hz,0.12,0.2,0.18);B.blk('red',hx+0.33,Y(1.18),hz,0.12,0.2,0.18);
   // round the wall, walnut pilasters, each with a sconce of red glass
   for(let k=0;k<8;k++){const a=k/8*Math.PI*2+0.4,c=Math.cos(a),sn=Math.sin(a);B.at(hx+c*(hr-0.4),Y(0),hz+sn*(hr-0.4),-a);
     B.box('woodDark',-0.4,0,-0.6,0.4,6,0.6);B.box('wood',-0.5,0,-0.7,0.5,0.5,0.7);B.box('brass',-0.45,4.6,-0.65,0.45,4.7,0.65);B.blk('lightRed',-0.55,2.6,0,0.2,0.5,0.28);B.pop();
     LT.add([hx+c*(hr-1.2),Y(2.9),hz+sn*(hr-1.2)],0xff5040,0.45,6);}
   // the floor: a raised round of white stone ringed in brass, a velvet rope on brass posts round the telephone
   B.cyl('terrazzo',hx,Y(0),hz,3,3,0.15,24,{caps:true});B.ring('brass',hx,Y(0.16),hz,2.85,3.0,28);B.ring('brass',hx,Y(0.01),hz,6.5,6.65,32);
   for(let k=0;k<6;k++){const a=k/6*Math.PI*2+0.26,b=(k+1)/6*Math.PI*2+0.26,P=(an,y)=>[hx+Math.cos(an)*2.3,Y(y),hz+Math.sin(an)*2.3];
     if(k===1)continue;   /* the way in, open */
     B.beam('brass',P(a,0.15),P(a,1.05),0.07,0.07);B.blk('brass',P(a,0)[0],Y(1.05),P(a,0)[2],0.12,0.1,0.12);B.beam('red',P(a,0.9),P((a+b)/2,0.72),0.06,0.06);B.beam('red',P((a+b)/2,0.72),P(b,0.9),0.06,0.06);}
   B.beam('brass',[hx+Math.cos(Math.PI/3+0.26)*2.3,Y(0.15),hz+Math.sin(Math.PI/3+0.26)*2.3],[hx+Math.cos(Math.PI/3+0.26)*2.3,Y(1.05),hz+Math.sin(Math.PI/3+0.26)*2.3],0.07,0.07);
   // a red cove of light round the ceiling's rim
   B.ring('lightRed',hx,Y(5.92),hz,hr-1.0,hr-0.7,28,true);
   LT.add([hx,Y(5.5),hz],0xff8a7a,1.0,15,[0,-1,0]);LT.add([hx,Y(2),hz],0xff3a2a,0.4,6);
   zone(-34,0,-149,-6,6,-121,0x5a2220,0.75);
   place('the Hotline',[-20,2,-135],13);fog([-20,3,-135],18,'#1c0808',0.012);}
  card('director','The Director\'s office','Red carpet, walnut, files to the ceiling on both walls, and one long window of white light where Manhattan ought to be. The desk is the Director\'s, and whoever holds the Service Weapon sits at it. The door in the corner goes to the Hotline.');
  card('hotline','The Hotline','A round dark room off the Director\'s office, and in the middle of it, on a marble pedestal, a red telephone. It is how the Board calls. It rings when nobody has dialled it.','Executive Sector · the Director\'s office');
  view('The Director\'s office',[0,2.5,-97],17,0.32,0.12,'director');
  view('The Hotline',[-20,1.2,-135],7,0.5,0.32,'hotline');
  place('the Director\'s office',[0,5,-82],32);fog([0,5,-90],34,'#a8a4a0',0.006);

  // ================================================================ the Board Room
  room({floor:'carpetGrey',wall:'panelDark',ceil:'concrete:ceil'},55,0,-30,95,8,10,{w:[[14,22,4]],e:[[14,22,4]]});
  corr('x',45,55,-12,8,4,0,0,{floor:'carpetGrey',wall:'panelDark',ceil:'concrete:ceil'});
  B.box('woodDark',X(63),Y(0.72),Z(-12.5),X(87),Y(0.82),Z(-7.5));for(const x of [65,75,85])B.box('woodDark',X(x-0.5),Y(0),Z(-10.5),X(x+0.5),Y(0.72),Z(-9.5));
  for(let x=64;x<=86;x+=2.2){F.chair(X(x),Y(0),Z(-13.6),0);F.chair(X(x),Y(0),Z(-6.4),Math.PI);}
  // the pyramid on the north wall, point down, a white line round it
  B.quad('black',[X(68),Y(7),Z(-29.9)],[X(82),Y(7),Z(-29.9)],[X(75),Y(1.5),Z(-29.9)],[X(75),Y(1.5),Z(-29.9)],[0,0,1]);
  for(const [a,b] of [[[67.6,7.2],[82.4,7.2]],[[82.4,7.2],[75,1.2]],[[75,1.2],[67.6,7.2]]])B.beam('lightWhite',[X(a[0]),Y(a[1]),Z(-29.85)],[X(b[0]),Y(b[1]),Z(-29.85)],0.08,0.08);
  F.panels(X(62),Z(-10),X(88),Z(-10),Y(8),6.5,0.85,11);LT.add([X(75),Y(4),Z(-27)],0xe8e8ff,0.4,18);
  // walnut fins down the south wall and either side of the pyramid, a dark runner under the table, a lamp and a
  // folder at every place
  for(let x=56.5;x<94;x+=2){B.box('woodDark',X(x),Y(0),Z(9.55),X(x+0.4),Y(8),Z(10));if(x<66||x>84)B.box('woodDark',X(x),Y(0),Z(-30),X(x+0.4),Y(8),Z(-29.55));}
  B.quad('carpetDark',[X(60),Y(0.01),Z(-15.5)],[X(90),Y(0.01),Z(-15.5)],[X(90),Y(0.01),Z(-4.5)],[X(60),Y(0.01),Z(-4.5)],[0,1,0]);
  for(const x of [66,72,78,84]){B.cyl('brass',X(x),Y(0.82),Z(-10),0.12,0.08,0.3,8);F.lamp(X(x),Y(1.12),Z(-10),0xffd8a0,0.45,6);}
  for(let x=64;x<=86;x+=2.2)for(const z of [-12,-8])B.blk('paper',X(x),Y(0.82),Z(z),0.32,0.02,0.42);
  zone(55,0,-30,95,8,10,0x3e3e46,0.7);
  card('board','The Board Room','A long table under a low ceiling, and on the wall the shape every Director learns to answer to: the inverted pyramid. The Board is not in the room. It is somewhere else, and it speaks from there.');
  view('The Board Room',[75,2,-10],19,-1.25,0.28,'board');place('the Board Room',[75,3,-10],22);fog([75,3,-10],26,'#101014',0.007);

  // ================================================================ Dead Letters
  {const x0=-120,x1=-55,z0=-50,z1=30,H=60;
   room({floor:'tile',wall:'concrete',ceil:'concrete:ceil'},x0,0,z0,x1,H,z1,{e:[[40,48,5]],w:[[40,48,5]],n:[[30,36,4]]});
   corr('x',-55,-45,-6,8,5,0,0);
   // stacked balconies jutting from the long walls, one over another, with their rails and the doors behind them
   for(let lv=1;lv<=5;lv++){const y=lv*10;for(const s of [-1,1]){const zw=s<0?z0:z1,zi=zw-s*(4+(lv%2)*2);
       for(let k=0;k<3;k++){const xa=x0+4+k*21,xb=xa+17,za=Math.min(zw,zi),zb=Math.max(zw,zi);if((lv+k)%3===2)continue;
         B.box('concrete',X(xa),Y(y-1.2),Z(za),X(xb),Y(y),Z(zb));F.rail([X(xa),Y(y),Z(zi)],[X(xb),Y(y),Z(zi)],1.1,'steelDark');
         F.panels(X(xa+2),Z((za+zb)/2),X(xb-2),Z((za+zb)/2),Y(y-1.25),6,0.55,8);}}}
   // the conveyors crossing the hall, carrying letters, on their hangers
   for(const [y,z] of [[14,-20],[24,4],[34,-32],[44,14]]){B.box('steelDark',X(x0+2),Y(y),Z(z-0.8),X(x1-2),Y(y+0.35),Z(z+0.8));
     for(let x=x0+4;x<x1-3;x+=1.6+R()*1.4)B.box('paper',X(x),Y(y+0.35),Z(z-0.5+R()*0.4),X(x+0.5),Y(y+0.38),Z(z+0.1+R()*0.3));
     for(let x=x0+8;x<x1;x+=12)B.beam('steel',[X(x),Y(y+0.35),Z(z)],[X(x),Y(H),Z(z)],0.08,0.08);}
   // pneumatic tubes up the walls, and the sorting desks on the floor
   for(let k=0;k<14;k++){const x=x0+3+k*4.4;B.beam('brass',[X(x),Y(0),Z(z0+0.5)],[X(x),Y(H),Z(z0+0.5)],0.35,0.35);if(k%2)B.beam('brass',[X(x),Y(0),Z(z1-0.5)],[X(x),Y(H),Z(z1-0.5)],0.35,0.35);}
   for(let i=0;i<4;i++)for(let j=0;j<3;j++){F.desk(X(x0+12+i*13),Y(0),Z(z0+18+j*18),0,3,1.2);F.chair(X(x0+12+i*13),Y(0),Z(z0+19.2+j*18),Math.PI);
     for(let k=0;k<5;k++)B.box('paper',X(x0+11+i*13+k*0.4),Y(0.78),Z(z0+17.7+j*18),X(x0+11.3+i*13+k*0.4),Y(0.95),Z(z0+18.1+j*18));}
   // the west wall: pigeonholes up to twelve metres either side of the doorway and over it, letters in most of
   // them, a rolling ladder
   {const was=B.coarse;B.coarse=true;
    const holes=(za,zb,ya,yb)=>{for(let z=za;z<=zb+0.01;z+=0.8)B.box('woodDark',X(x0),Y(ya),Z(z),X(x0+0.6),Y(yb),Z(z+0.05));
      for(let y=ya;y<=yb+0.01;y+=0.5)B.box('woodDark',X(x0),Y(y),Z(za),X(x0+0.6),Y(y+0.04),Z(zb+0.05));
      for(let z=za;z<zb-0.7;z+=0.8)for(let y=ya+0.04;y<yb-0.4;y+=0.5)if(R()<0.7)B.box('paper',X(x0+0.25),Y(y),Z(z+0.12),X(x0+0.55),Y(y+0.2+R()*0.2),Z(z+0.7),['ny','nx']);};
    holes(z0+4,-11.2,0,12);holes(-0.8,z1-4.4,0,12);holes(-11.2,-0.8,5.5,12);
    B.coarse=was;}
   B.beam('steel',[X(x0+1.6),Y(0),Z(-12)],[X(x0+0.7),Y(12),Z(-12)],0.08,0.08);B.beam('steel',[X(x0+1.6),Y(0),Z(-11.2)],[X(x0+0.7),Y(12),Z(-11.2)],0.08,0.08);
   for(let k=1;k<24;k++){const t=k/24;B.beam('steel',[X(x0+1.6-0.9*t),Y(12*t),Z(-12)],[X(x0+1.6-0.9*t),Y(12*t),Z(-11.2)],0.05,0.05);}
   // mail carts standing between the desks, canvas bins heaped with letters
   for(const [x,z,a] of [[-104,-26,0.2],[-78,-8,1.4],[-92,10,2.6],[-66,-30,0.7]]){B.at(X(x),Y(0),Z(z),a);B.box('steel',-0.8,0.25,-0.5,0.8,0.3,0.5);B.box('carpetGrey',-0.75,0.3,-0.45,0.75,1.0,0.45,['ny']);
     for(let k=0;k<6;k++)B.box('paper',-0.6+k*0.2,1.0,-0.3+((k*37)%5)*0.1,-0.4+k*0.2,1.06,-0.1+((k*37)%5)*0.1);for(const s of [-1,1])B.box('steelDark',s*0.7-0.05,0,-0.05,s*0.7+0.05,0.25,0.05);B.pop();}
   for(let i=0;i<4;i++)for(let j=0;j<3;j++)F.lamp(X(x0+13.2+i*13),Y(0.77),Z(z0+17.8+j*18),0xffe0b0,0.45,5);
   // white light from high above, coming down the hall in a column
   B.box('lightWhite',X(-100),Y(H-0.06),Z(-20),X(-75),Y(H),Z(0),['py']);
   LT.add([X(-88),Y(H-2),Z(-10)],0xf4f6ff,1.0,80,[0,-1,0]);LT.add([X(-88),Y(20),Z(-10)],0xe8ecf4,0.35,40);
   zone(x0,0,z0,x1,H,z1,0x6a6e78,0.5);
   card('deadletters','Dead Letters','A concrete hall sixty metres high where the mail that never arrived comes to be sorted: balconies stacked up both walls, conveyors crossing the air with letters riding them, pneumatic tubes running up every wall, and white light falling down the middle. Some of the letters are addressed to the Bureau from people who are not born yet.');
   view('Dead Letters',[-92,16,-10],36,1.45,0.22,'deadletters');place('Dead Letters',[-88,20,-10],48);fog([-88,25,-10],44,'#3a3c44',0.004);}

  // ================================================================ the mail room, Executive Affairs, Communications, the cafeteria
  room({floor:'carpetGrey',wall:'panel',ceil:'ceiling:ceil'},-120,0,40,-55,6,90,{e:[[0,4,3.5]]});
  corr('x',-55,-45,42,4,3.5,0,0);
  for(let x=-116;x<=-60;x+=3.2)F.shelves(X(x),Y(0),Z(89.6),Math.PI,3,2.6);
  for(let i=0;i<4;i++)for(let j=0;j<3;j++){B.box('wood',X(-110+i*13),Y(0.85),Z(52+j*11),X(-102+i*13),Y(0.92),Z(55+j*11));B.box('steelDark',X(-109.6+i*13),Y(0),Z(52.4+j*11),X(-102.4+i*13),Y(0.85),Z(54.6+j*11));
    for(let k=0;k<6;k++)B.box('paper',X(-109+i*13+k*1.1),Y(0.92),Z(53+j*11),X(-108.5+i*13+k*1.1),Y(1.1),Z(54+j*11));}
  for(const [x,z] of [[-70,50],[-95,78],[-75,82]]){B.box('steel',X(x-0.8),Y(0.3),Z(z-0.5),X(x+0.8),Y(1.1),Z(z+0.5));for(const s of [-1,1])B.box('black',X(x+s*0.6-0.1),Y(0),Z(z-0.3),X(x+s*0.6+0.1),Y(0.3),Z(z+0.3));}
  for(const z of [52,65,78])F.panels(X(-114),Z(z),X(-61),Z(z),Y(6),7,0.85,11);
  card('mailroom','The mail room','Pigeonholes to the ceiling along one wall, sorting tables in rows, carts. What it cannot deliver goes on to Dead Letters.');
  view('The mail room',[-88,1.5,65],20,0.9,0.15,'mailroom');zone(-120,0,40,-55,6,90,0x7a7672,0.4);place('the mail room',[-88,3,65],30);

  room({floor:'carpetGrey',wall:'panel',ceil:'ceiling:ceil'},-120,0,-120,-55,6,-60,{s:[[30,36,4]]});
  corr('z',-60,-50,-87,6,4,0,0);
  for(let i=0;i<5;i++)for(let j=0;j<4;j++)F.cubicle(X(-112+i*12.4),Y(0),Z(-112+j*12.4),(i+j)%2?0:Math.PI);
  for(const z of [-110,-98,-86,-74])F.panels(X(-114),Z(z),X(-61),Z(z),Y(6),7,0.85,11);
  for(let x=-116;x<=-60;x+=6)F.cabinet(X(x),Y(0),Z(-119.5),0);
  card('affairs','Executive Affairs','Cubicles, terminals, filing cabinets: the paperwork of a federal bureau that studies things that should not exist. Every desk has a form on it for something.');
  view('Executive Affairs',[-88,1.5,-90],20,0.7,0.15,'affairs');zone(-120,0,-120,-55,6,-60,0x7a7672,0.4);place('Executive Affairs',[-88,3,-90],32);

  room({floor:'carpetGrey',wall:'panel',ceil:'ceiling:ceil'},55,0,20,120,6,80,{w:[[10,16,4]],e:[[40,50,4]]});
  corr('x',45,55,33,6,4,0,0);
  for(let r=0;r<5;r++)for(let k=0;k<7;k++){const x=62+k*8,z=28+r*10;F.terminal(X(x),Y(0),Z(z),Math.PI);F.chair(X(x),Y(0),Z(z+1.1),Math.PI);
    // a switchboard behind each operator: a panel of jacks and lamps
    B.box('woodDark',X(x-1.6),Y(0),Z(z-1.2),X(x+1.6),Y(1.9),Z(z-0.9));B.box('screen',X(x-1.3),Y(1.2),Z(z-0.89),X(x+1.3),Y(1.6),Z(z-0.88));}
  for(const z of [26,38,50,62,74])F.panels(X(60),Z(z),X(116),Z(z),Y(6),7,0.85,11);
  card('comms','Communications','Rows of operators\' desks, each with its switchboard and its terminal: the Bureau listens to everything that might be Altered, and answers the phones that should not ring.');
  view('Communications',[88,1.5,50],22,-0.6,0.14,'comms');zone(55,0,20,120,6,80,0x6e6e72,0.4);place('Communications',[88,3,50],34);

  room({floor:'tile',wall:'panel',ceil:'ceiling:ceil'},55,0,-90,120,6,-40,{w:[[46,50,3.5]]});
  corr('x',45,55,-42,4,3.5,0,0);
  for(let i=0;i<5;i++)for(let j=0;j<4;j++){const x=64+i*11,z=-82+j*9;B.box('white',X(x-1.6),Y(0.74),Z(z-0.8),X(x+1.6),Y(0.8),Z(z+0.8));B.box('steel',X(x-0.1),Y(0),Z(z-0.1),X(x+0.1),Y(0.74),Z(z+0.1));
    for(const s of [-1,1])for(const u of [-1,0,1])F.chair(X(x+u*1),Y(0),Z(z+s*1.3),s<0?0:Math.PI);}
  B.box('tile',X(58),Y(0),Z(-89),X(117),Y(1.1),Z(-87));B.box('steel',X(58),Y(1.1),Z(-89),X(117),Y(1.15),Z(-86.6));B.box('screen',X(70),Y(3),Z(-89.95),X(100),Y(4.2),Z(-89.9));
  for(const z of [-84,-72,-60,-48])F.panels(X(60),Z(z),X(116),Z(z),Y(6),7,0.9,11);
  // the serving line: warmers let into the counter, a glass guard on posts over it, a stack of trays at the end
  for(let x=60;x<112;x+=2.6)B.box('steelDark',X(x),Y(1.15),Z(-88.6),X(x+1.9),Y(1.19),Z(-87.3));
  B.box('glass',X(58),Y(1.55),Z(-86.95),X(117),Y(1.6),Z(-86.3));for(let x=58;x<=117;x+=3.9)B.beam('steel',[X(x),Y(1.15),Z(-86.9)],[X(x),Y(1.6),Z(-86.9)],0.04,0.04);
  for(let k=0;k<10;k++)B.box('red',X(113.6),Y(1.15+k*0.03),Z(-88.5),X(115.4),Y(1.17+k*0.03),Z(-87.4));
  // two vending machines on the east wall, and planters along the south
  for(const z of [-62,-56]){B.blk('red',X(119.4),Y(0),Z(z),1.1,2.2,1.6);B.blk('lightWhite',X(118.83),Y(0.9),Z(z),0.04,1.1,1.2);LT.add([X(118),Y(1.5),Z(z)],0xd8e8ff,0.5,6);}
  for(const x of [62,80,98,114])F.plant(X(x),Y(0),Z(-41.5),1.1);
  card('cafeteria','The cafeteria','Formica tables in rows, a long steel counter, a menu board. Agents eat here between containment breaches.');
  view('The cafeteria',[88,1.5,-65],20,0.6,0.15,'cafeteria');zone(55,0,-90,120,6,-40,0x8a8682,0.4);place('the cafeteria',[88,3,-65],30);

  // ================================================================ the lobby
  room({floor:'terrazzo',wall:'concrete',ceil:'panel:ceil'},-30,0,55,30,12,100,{n:[[26,34,5]]});
  corr('z',45,55,0,8,5,0,0,{floor:'terrazzo',wall:'concrete',ceil:'panel:ceil'});
  B.ring('brass',X(0),Y(0.01),Z(77),5.6,6,32);B.ring('carpetDark',X(0),Y(0.012),Z(77),0.01,5.6,32);B.ring('brass',X(0),Y(0.014),Z(77),3,3.2,24);
  // the reception desk, curved round the front, and its lamp; the elevators along the south wall
  B.cyl('wood',X(0),Y(0),Z(88),5,5,1.1,14,{a0:Math.PI*0.15,a1:Math.PI*0.85,caps:false});B.ring('woodDark',X(0),Y(1.1),Z(88),4.4,5.1,14,false,Math.PI*0.15,Math.PI*0.85);
  F.lamp(X(-2),Y(1.3),Z(91),0xffd9a0,0.6,7);F.terminal(X(2),Y(0),Z(91),0);
  for(const x of [-18,-6,6,18]){B.box('brass',X(x-1.8),Y(0),Z(99.8),X(x+1.8),Y(3.4),Z(100));B.box('concreteDark',X(x-2.2),Y(3.4),Z(99.7),X(x+2.2),Y(4),Z(100));F.lamp(X(x),Y(4.3),Z(99.6),0xffe0b0,0.5,5);}
  for(const [x,z] of [[-25,60],[25,60],[-25,95],[25,95]])F.pier(X(x),Y(0),Z(z),3,3,12,0);
  F.panels(X(-20),Z(68),X(20),Z(68),Y(12),8,0.9,16);F.panels(X(-20),Z(85),X(20),Z(85),Y(12),8,0.9,16);
  for(const x of [-12,12])F.plant(X(x),Y(0),Z(60),1.4);
  // benches along the side walls, the Bureau's directory board on the west wall, queue posts before the desk
  for(const s of [-1,1])for(const z of [68,80]){B.at(X(s*27.5),Y(0),Z(z),Math.PI/2);B.box('woodDark',-2.4,0.42,-0.45,2.4,0.52,0.45);B.box('concreteDark',-2.2,0,-0.35,-1.7,0.42,0.35);B.box('concreteDark',1.7,0,-0.35,2.2,0.42,0.35);B.pop();}
  B.box('black',X(-29.95),Y(1.8),Z(84),X(-29.8),Y(5.2),Z(92));B.box('brass',X(-29.95),Y(5.2),Z(83.8),X(-29.75),Y(5.35),Z(92.2));
  {const was=B.coarse;B.coarse=true;for(let k=0;k<14;k++){const w=2+((k*7)%5)*0.7;B.box('white',X(-29.82),Y(4.9-k*0.22),Z(84.4),X(-29.78),Y(4.98-k*0.22),Z(84.4+w));}B.coarse=was;}
  for(let k=0;k<5;k++){const x=-4+k*2;B.beam('brass',[X(x),Y(0),Z(85)],[X(x),Y(1.0),Z(85)],0.07,0.07);B.cyl('brass',X(x),Y(0),Z(85),0.2,0.16,0.06,8,{caps:true});if(k<4)B.beam('red',[X(x),Y(0.9),Z(85)],[X(x+2),Y(0.9),Z(85)],0.06,0.06);}
  zone(-30,0,55,30,12,100,0x8a8680,0.45);
  card('lobby','The lobby','Terrazzo, the seal in brass, a curved reception desk and a row of elevators: the way in, if the House decides you have business here. Visitors do not remember how they found the door.');
  view('The lobby',[0,3,77],22,2.6,0.16,'lobby');place('the lobby',[0,4,77],30);

  // ================================================================ the transit corridors, and the lift to the Foundation
  corr('x',-380,-120,-6,8,5,0,0);                                          /* west, to Research */
  corr('x',95,380,-12,8,5,0,-20,null,true,[200,300]);                      /* east, down to Maintenance */
  corr('z',-380,-45,35,8,5,-20,0,null,true,[-300,-200]);                   /* north, down to Containment */
  corr('z',45,400,40,8,5,0,0);                                             /* south, to Investigations */
  // a stair down the sloping lengths would be truer, but the Bureau's floors are ramps here: kerbs mark them
  for(const [axis,a0,a1,c] of [['x',200,300,-12],['z',-300,-200,35]])for(let k=0;k<=10;k++){const a=a0+(a1-a0)*k/10,y=axis==='x'?-20*k/10:-20+20*k/10;
    if(axis==='x')B.box('concreteDark',X(a-0.15),Y(y),Z(c-4),X(a+0.15),Y(y+0.12),Z(c+4));else B.box('concreteDark',X(c-4),Y(y),Z(a-0.15),X(c+4),Y(y+0.12),Z(a+0.15));}
  card('transit','The transit corridors','Long concrete corridors between the sectors, lit every few metres, sloping where one sector sits lower than the next. They are longer than the building is wide.');
  view('A transit corridor',[-250,2.5,-6],22,-1.57,0.05,'transit');
  for(const [n,p] of [['the corridor to Research',[-250,2,-6]],['the corridor to Maintenance',[240,-8,-12]],['the corridor to Containment',[35,-8,-210]],['the corridor to Investigations',[40,2,220]]])place(n,p,130);
  // the lift shaft: down from beside Communications to the Foundation, three hundred metres, a car in it
  {const sx0=120,sx1=132,sz0=60,sz1=70,top=8,bot=-320;
   const wall=(a,b,c,d,o)=>B.quad('concrete',a,b,c,d,o);
   wall([X(sx0),Y(bot),Z(sz0)],[X(sx1),Y(bot),Z(sz0)],[X(sx1),Y(top),Z(sz0)],[X(sx0),Y(top),Z(sz0)],[0,0,1]);
   wall([X(sx0),Y(bot),Z(sz1)],[X(sx1),Y(bot),Z(sz1)],[X(sx1),Y(top),Z(sz1)],[X(sx0),Y(top),Z(sz1)],[0,0,-1]);
   wall([X(sx1),Y(bot),Z(sz0)],[X(sx1),Y(bot),Z(sz1)],[X(sx1),Y(top),Z(sz1)],[X(sx1),Y(top),Z(sz0)],[-1,0,0]);
   wall([X(sx0),Y(bot),Z(sz0)],[X(sx0),Y(bot),Z(sz1)],[X(sx0),Y(0),Z(sz1)],[X(sx0),Y(0),Z(sz0)],[1,0,0]);
   wall([X(sx0),Y(4),Z(sz0)],[X(sx0),Y(4),Z(sz1)],[X(sx0),Y(top),Z(sz1)],[X(sx0),Y(top),Z(sz0)],[1,0,0]);
   B.quad('concrete:ceil',[X(sx0),Y(top),Z(sz0)],[X(sx0),Y(top),Z(sz1)],[X(sx1),Y(top),Z(sz1)],[X(sx1),Y(top),Z(sz0)],[0,-1,0]);
   for(let y=bot+10;y<top;y+=20){B.box('steelDark',X(sx1-0.5),Y(y),Z(sz0+1),X(sx1-0.2),Y(y+0.3),Z(sz1-1));LT.add([X(sx0+6),Y(y),Z(sz0+5)],0xffe0b0,0.6,16);
     B.box('lightWarm',X(sx1-0.25),Y(y+0.3),Z(sz0+4.5),X(sx1-0.05),Y(y+0.7),Z(sz0+5.5));}
   for(const z of [sz0+1,sz1-1])B.beam('steel',[X(sx1-0.6),Y(bot),Z(z)],[X(sx1-0.6),Y(top),Z(z)],0.2,0.2);
   const car=new THREE.Group(),cm=new THREE.MeshLambertMaterial({color:0x8a8478}),fm=new THREE.MeshBasicMaterial({color:0xffe8c0});
   const cb=new THREE.Mesh(new THREE.BoxGeometry(9,3.6,8),cm);cb.position.y=1.8;car.add(cb);const lamp=new THREE.Mesh(new THREE.BoxGeometry(3,0.1,1.2),fm);lamp.position.y=3.65;car.add(lamp);
   car.position.set(X((sx0+sx1)/2+0.5),Y(0),Z((sz0+sz1)/2));K.dyn.add(car);
   // up and down the shaft: a pause at each end, a slow run between
   K.hooks.push(t=>{const T=140,u=(t%T)/T,e=u<0.15?0:u<0.5?(u-0.15)/0.35:u<0.65?1:1-(u-0.65)/0.35,s=e*e*(3-2*e);car.position.y=Y(0)+(bot+1-0)*s;});
   card('lift','The lift to the Foundation','A concrete shaft three hundred metres deep from beside Communications down to the Foundation, the bedrock under the House. The car takes its time.');
   view('The lift to the Foundation',[126,-150,65],30,0,1.45,'lift');place('the lift shaft',[126,-150,65],160);}

  // ================================================================ the tower on its street
  {const S=C.sectors.street.at,sx=v=>S[0]+v,sy=v=>S[1]+v,sz=v=>S[2]+v,TW=30,TH=200;
   // the ground: road, kerbs, sidewalks, a plaza before the tower
   B.quad('concreteDark',[sx(-200),sy(0),sz(-200)],[sx(200),sy(0),sz(-200)],[sx(200),sy(0),sz(200)],[sx(-200),sy(0),sz(200)],[0,1,0]);
   for(const [x0,z0,x1,z1] of [[-200,-200,-60,-50],[60,-200,200,-50],[-200,60,-60,200],[60,60,200,200],[-60,-200,60,-50],[-60,60,60,200]])
     B.box('panel',sx(x0),sy(0),sz(z0),sx(x1),sy(0.18),sz(z1),['ny']);
   B.box('panel',sx(-60),sy(0),sz(-50),sx(60),sy(0.18),sz(-42),['ny']);B.box('terrazzo',sx(-45),sy(0),sz(-45),sx(45),sy(0.25),sz(45),['ny']);
   for(let k=-180;k<=180;k+=12){B.box('white',sx(k),sy(0.01),sz(54.6),sx(k+5),sy(0.02),sz(55.4));B.box('white',sx(-55.4),sy(0.01),sz(k),sx(-54.6),sy(0.02),sz(k+5));}
   // the tower: taller than anything round it, windowless, its faces deep-finned in concrete from the podium to the
   // crown; a plain podium with the entrance recessed in its south face; a set-back crown block, no sign anywhere
   const TT=260,FIN=1.8;
   B.box('concreteDark',sx(-TW),sy(0),sz(-TW),sx(TW),sy(TT),sz(TW));
   for(let k=-TW+2;k<=TW-2;k+=4){for(const [s1,s2] of [[1,0],[-1,0],[0,1],[0,-1]]){
       if(s1)B.box('concrete',sx(s1*TW+(s1>0?0:-FIN)),sy(16),sz(k-0.5),sx(s1*TW+(s1>0?FIN:0)),sy(TT-12),sz(k+0.5),['ny','py']);
       else B.box('concrete',sx(k-0.5),sy(16),sz(s2*TW+(s2>0?0:-FIN)),sx(k+0.5),sy(TT-12),sz(s2*TW+(s2>0?FIN:0)),['ny','py']);}}
   B.box('concreteDark',sx(-TW-2.2),sy(TT-12),sz(-TW-2.2),sx(TW+2.2),sy(TT-6),sz(TW+2.2));B.box('concrete',sx(-TW+6),sy(TT-6),sz(-TW+6),sx(TW-6),sy(TT+8),sz(TW-6));
   B.box('concreteDark',sx(-TW-3),sy(0),sz(-TW-3),sx(TW+3),sy(16),sz(TW+3));
   B.box('black',sx(-9),sy(0.25),sz(TW+2.8),sx(9),sy(9),sz(TW+3.05));B.box('lightWarm',sx(-7),sy(0.3),sz(TW+3.06),sx(7),sy(2.8),sz(TW+3.1));
   B.box('concreteDark',sx(-12),sy(9),sz(TW+3),sx(12),sy(10.2),sz(TW+9));
   for(const x of [-7,7])B.box('concreteDark',sx(x-0.7),sy(0.25),sz(TW+7),sx(x+0.7),sy(9),sz(TW+8.4));
   for(let k=0;k<4;k++)B.box('panel',sx(-14),sy(0.25),sz(TW+9+k*1.2),sx(14),sy(0.25-k*0.06+0.01),sz(TW+10.2+k*1.2));
   LT.add([sx(0),sy(4),sz(TW+8)],0xffd8a0,1.0,18);
   // the neighbours: Manhattan round it - brick and stone blocks of every height, rows of windows, set close
   const nb=[[-130,-130,50,50,120],[-130,0,50,50,74],[130,-120,50,60,150],[130,20,50,50,82],[-130,130,50,50,140],[130,130,50,50,96],[0,-130,70,40,68],[0,130,70,40,118],
     [-190,-60,20,60,60],[190,-60,20,60,110],[-190,70,20,60,88],[190,70,20,60,64],[-60,-190,60,20,100],[60,-190,60,20,72],[-60,190,60,20,84],[60,190,60,20,130]];
   const BRK=['brick','brickDark','concreteWarm','brick','panelDark'];
   nb.forEach(([cx,cz,w,d,h],i)=>{const m=BRK[i%BRK.length];B.box(m,sx(cx-w/2),sy(0),sz(cz-d/2),sx(cx+w/2),sy(h),sz(cz+d/2),['ny']);B.box('concreteDark',sx(cx-w/2-0.6),sy(h),sz(cz-d/2-0.6),sx(cx+w/2+0.6),sy(h+1.2),sz(cz+d/2+0.6));
     B.coarse=true;for(let y=6;y<h-3;y+=4){B.quad('steelDark',[sx(cx-w/2+2),sy(y),sz(cz+d/2+0.06)],[sx(cx+w/2-2),sy(y),sz(cz+d/2+0.06)],[sx(cx+w/2-2),sy(y+2.2),sz(cz+d/2+0.06)],[sx(cx-w/2+2),sy(y+2.2),sz(cz+d/2+0.06)],[0,0,1]);
       B.quad('steelDark',[sx(cx-w/2+2),sy(y),sz(cz-d/2-0.06)],[sx(cx+w/2-2),sy(y),sz(cz-d/2-0.06)],[sx(cx+w/2-2),sy(y+2.2),sz(cz-d/2-0.06)],[sx(cx-w/2+2),sy(y+2.2),sz(cz-d/2-0.06)],[0,0,-1]);
       B.quad('steelDark',[sx(cx+w/2+0.06),sy(y),sz(cz-d/2+2)],[sx(cx+w/2+0.06),sy(y),sz(cz+d/2-2)],[sx(cx+w/2+0.06),sy(y+2.2),sz(cz+d/2-2)],[sx(cx+w/2+0.06),sy(y+2.2),sz(cz-d/2+2)],[1,0,0]);
       B.quad('steelDark',[sx(cx-w/2-0.06),sy(y),sz(cz-d/2+2)],[sx(cx-w/2-0.06),sy(y),sz(cz+d/2-2)],[sx(cx-w/2-0.06),sy(y+2.2),sz(cz+d/2-2)],[sx(cx-w/2-0.06),sy(y+2.2),sz(cz-d/2+2)],[-1,0,0]);}B.coarse=false;});
   // the city going on out to the sky: the ground to the dome's foot, and block after block of plain towers in
   // the haze (one light cell a face: at this distance they need not vary)
   B.coarse=true;
   /* a ring from just inside the street's square (which covers it, a little above) out to the dome */
   for(let k=0;k<24;k++){const a=k/24*Math.PI*2,b=(k+1)/24*Math.PI*2,r0=199,r1=620;
     B.quad('concreteDark',[sx(Math.cos(a)*r0),sy(-0.3),sz(Math.sin(a)*r0)],[sx(Math.cos(b)*r0),sy(-0.3),sz(Math.sin(b)*r0)],[sx(Math.cos(b)*r1),sy(-0.3),sz(Math.sin(b)*r1)],[sx(Math.cos(a)*r1),sy(-0.3),sz(Math.sin(a)*r1)],[0,1,0]);}
   for(let i=0;i<150;i++){const a=R()*Math.PI*2,d=235+R()*330,cx=Math.cos(a)*d,cz=Math.sin(a)*d,w=18+R()*34,dd=18+R()*34,h=25+R()*R()*170+(d<330?20:0);
     if(Math.abs(cx)<215&&Math.abs(cz)<215)continue;
     /* keep the line from the street view's camera to the tower clear (it stands out at about 205, 375) */
     {const t=Math.max(0,Math.min(1.3,(cx*205+cz*375)/(205*205+375*375)));if(Math.hypot(cx-205*t,cz-375*t)<w/2+dd/2+60)continue;}
     B.box(BRK[i%BRK.length],sx(cx-w/2),sy(0),sz(cz-dd/2),sx(cx+w/2),sy(h),sz(cz+dd/2),['ny']);if(R()<0.5)B.box('concreteDark',sx(cx-w/4),sy(h),sz(cz-dd/4),sx(cx+w/4),sy(h+4+R()*12),sz(cz+dd/4),['ny']);}
   B.coarse=false;
   // street lamps along the kerbs, and a few cars standing
   for(let k=-170;k<=170;k+=34)for(const [x,z] of [[k,-48],[k,58],[-58,k],[58,k]]){if(Math.abs(x)<50&&Math.abs(z)<50)continue;B.beam('steelDark',[sx(x),sy(0.18),sz(z)],[sx(x),sy(7),sz(z)],0.18,0.18);B.box('lightWarm',sx(x-0.4),sy(7),sz(z-0.4),sx(x+0.4),sy(7.3),sz(z+0.4));}
   for(const [x,z,a,m] of [[-120,52,0,'red'],[-40,50,0,'yellow'],[90,52,0,'steel'],[-52,-120,Math.PI/2,'motel'],[52,100,Math.PI/2,'yellow']]){B.at(sx(x),sy(0),sz(z),a);B.box(m,-2.4,0.3,-0.9,2.4,1.2,0.9);B.box(m,-1.2,1.2,-0.8,1.3,1.8,0.8);B.box('black',-1.15,1.25,-0.82,1.25,1.7,0.82);B.pop();}
   // daylight: everything lit, the sun from the south-west
   LT.zone([sx(-210),sy(-1),sz(-210)],[sx(210),sy(240),sz(210)],0xd6dade,1);
   LT.add([sx(-400),sy(700),sz(500)],0xfff2e0,1.2,1600);
   /* the sky over the street: a dome closing the city in, so that from out here nothing of the House's inside
      shows - from the street it is only a tower */
   {const c=document.createElement('canvas');c.width=4;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);
    gr.addColorStop(0,'#7fa2c8');gr.addColorStop(0.5,'#c4d4e4');gr.addColorStop(1,'#dfe6ec');g.fillStyle=gr;g.fillRect(0,0,4,256);
    const sky=new THREE.Mesh(new THREE.SphereGeometry(640,32,16),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.BackSide,fog:false}));
    sky.position.set(sx(0),sy(-60),sz(0));sky.userData.noFingerprint=true;K.dyn.add(sky);}
   K.places.push(['the street outside',[sx(0),sy(20),sz(0)],260]);
   K.zones.push({c:[sx(0),sy(60),sz(0)],r:900,color:'#cdd6e0',density:0.0007});   /* wide: the whole street and the views of it are daylight */
   K.cards.tower={h:'The tower',p:'The Oldest House from outside: a windowless brutalist tower in Manhattan, ribbed in concrete, with no sign on it. People walk past it every day without seeing it. Inside, there is a great deal more of it than this.',sub:'The street'};
   K.views.push({name:'The tower on its street',group:'Outside',t:[sx(0),sy(110),sz(0)],d:430,yaw:0.5,pitch:0.1,card:'tower'});
   K.views.push({name:'The door',group:'Outside',t:[sx(0),sy(6),sz(TW+4)],d:40,yaw:0.25,pitch:0.08,card:'tower'});}

  // ================================================================ the events
  const dotTex=K.T.dot;
  // The Hiss: possessed agents rise into the air over the Central Executive, turning slowly, chanting, red light
  K.events.push({key:'hiss',label:'The Hiss',card:'hiss',view:K.views.find(v=>v.name==='The Central Executive'),start(){
    const g=new THREE.Group(),dark=new THREE.MeshLambertMaterial({color:0x1c1618}),red=new THREE.MeshBasicMaterial({color:0xff2a1a}),N=14,bodies=[];
    for(let i=0;i<N;i++){const a=i/N*Math.PI*2+R()*0.3,r=10+R()*18,b=new THREE.Group();
      const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.24,1.0,6),dark);torso.position.y=1.15;b.add(torso);
      const legs=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.16,0.9,6),dark);legs.position.y=0.45;b.add(legs);
      const head=new THREE.Mesh(new THREE.SphereGeometry(0.17,8,6),dark);head.position.y=1.85;b.add(head);
      for(const s of [-1,1]){const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.06,0.8,5),dark);arm.position.set(s*0.42,1.3,0);arm.rotation.z=s*1.0;b.add(arm);}
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex,color:0xff3020,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));sp.scale.set(3.4,3.4,1);sp.position.y=1.3;b.add(sp);
      b.position.set(X(Math.cos(a)*r),Y(0),Z(Math.sin(a)*r));b.userData={sp,h:5+R()*9,ph:R()*6.3,spin:(R()-0.5)*0.6};g.add(b);bodies.push(b);}
    K.dyn.add(g);const Zr={c:[X(0),Y(12),Z(0)],r:90,color:'#4a0a0c',density:0.0075};K.zones.push(Zr);let t0=null;
    return {update(t,dt){if(t0==null)t0=t;const u=t-t0;
      for(const b of bodies){const d=b.userData,rise=Math.min(1,u/7),fall=u>34?Math.min(1,(u-34)/5):0;
        b.position.y=Y(0)+d.h*rise*(1-fall)+Math.sin(u*0.9+d.ph)*0.35*rise;b.rotation.y+=d.spin*dt;b.rotation.z=Math.sin(u*0.5+d.ph)*0.25*rise;
        d.sp.material.opacity=0.55*rise*(1-fall)*(0.75+0.25*Math.sin(u*3+d.ph));}
      if(u>40){K.dyn.remove(g);const i=K.zones.indexOf(Zr);if(i>=0)K.zones.splice(i,1);return false;}}};}});
  card('hiss','The Hiss','It came in through the Hotline. Agents taken by it rise off the floor and hang in the air, turning slowly, chanting the same words over and over, in a red light that has no source.','Executive Sector · an event');
  // The Board calls: in the Board Room, the pyramid appears over the table, and the room goes white
  K.events.push({key:'board',label:'The Board calls',card:'boardcalls',view:K.views.find(v=>v.name==='The Board Room'),start(){
    const g=new THREE.Group(),geo=new THREE.ConeGeometry(4,5.5,4).rotateX(Math.PI).rotateY(Math.PI/4);
    const py=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0}));py.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0})));
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex,color:0xffffff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));halo.scale.set(22,22,1);
    g.add(py,halo);g.position.set(X(75),Y(4.6),Z(-10));K.dyn.add(g);const Zr={c:[X(75),Y(4),Z(-10)],r:30,color:'#e8e8f0',density:0.02};K.zones.push(Zr);let t0=null;
    return {update(t){if(t0==null)t0=t;const u=t-t0,k=Math.min(1,u/3)*(u>17?Math.max(0,1-(u-17)/3):1);
      py.material.opacity=k;py.children[0].material.opacity=k;halo.material.opacity=0.6*k*(0.7+0.3*Math.sin(u*6));g.rotation.y=u*0.4;Zr.density=0.02*k+0.001;
      if(u>20){K.dyn.remove(g);const i=K.zones.indexOf(Zr);if(i>=0)K.zones.splice(i,1);return false;}}};}});
  card('boardcalls','The Board calls','The Board speaks from the Astral Plane, and when it does the pyramid hangs over the table and the room fills with white. What it says comes as words in the air: Bureau speech, odd, formal, with its meaning in brackets.','Executive Sector · an event');
}
