// ================================================================= HOST — the station's works: the invert, the platforms, the bridges, the doors, the branch, the shaft's cage
// PLAN.md section 5, station 3. The cavern's invert; the three platforms (concrete to the car floor's height, a cream edge, the Ancients' cyan edge
// strip, lit only as built); the road's jog and ramps to the west apron, the walkway's jog and steps to the east platform; the stairs, the
// footbridges and the mezzanine balconies with their rails; the doors (bronze frames: as built shut, kept some patched with plate, abandoned hanging);
// the branch's mouth and its floor toward Loj Twenny; the great shaft's cage under its mouth in the vault; the name boards; then what the state
// leaves: the Tungangs' things (kept: a plate hut, crates, an awning, rope on the rails), or the dust and fallen pieces (abandoned).
const STATION_WORKS=(function(){const B=LB.B(100),rg=LB.rgb,PY=SEC.platformY,CAV=LINE.CAV,ST=STATION.state,D=LINE.DECK;
 const C={invert:rg(0x6e6a64),plat:rg(0x8e8a82),platTop:rg(0x7a7670),cream:rg(ST==='abandoned'?0x9a9480:0xd8cfb0),cyan:ST==='built'?rg(0x5ee0f0):rg(0x24474a),
  road:rg(0x4a4846),line:rg(0xcfc7a8),walk:rg(0x6a6c68),rail:rg(0x5c5e5a),post:rg(0x3a3e3c),bronze:rg(0x8a6a3c),door:rg(ST==='built'?0x5a5c5e:0x4a4c4c),
  dark:rg(0x16181a),plate:rg(0x5e5446),plateG:rg(0x3f5a43),oxide:rg(0x8a3e2a),rope:rg(0xa08a60),crate:rg(0x7a6448),sack:rg(0x9a8e70),cloth:rg(0x7a4a3a),
  dust:rg(0x8a8274),rubble:rg(0x6e6458),board:rg(0x2c3a40),boardT:rg(0xe6dcc0),glowW:rg(0xe8f2ff)};
 const u=(i,s,k)=>KRAND.unit(KRAND.hash(SITE.world,i,s,k));
 /* a deck along a polyline [[x,y,z]] (a road's ramp, the walkway's jog, a stair's run): top and two edges */
 const deck=(f,pts,w,col,th)=>{for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2,t=th==null?.2:th;
  B.quad(f,[a[0]-nx,a[1],a[2]-nz],[b[0]-nx,b[1],b[2]-nz],[b[0]+nx,b[1],b[2]+nz],[a[0]+nx,a[1],a[2]+nz],col);
  B.quad(f,[a[0]-nx,a[1]-t,a[2]-nz],[b[0]-nx,b[1]-t,b[2]-nz],[b[0]-nx,b[1],b[2]-nz],[a[0]-nx,a[1],a[2]-nz],col);
  B.quad(f,[a[0]+nx,a[1],a[2]+nz],[b[0]+nx,b[1],b[2]+nz],[b[0]+nx,b[1]-t,b[2]+nz],[a[0]+nx,a[1]-t,a[2]+nz],col);}};
 /* a rail along x or z at height y: posts every 2 m, a top rail and a mid rail */
 const railZ=(x,z0,z1,y,col)=>{for(let z=z0;z<=z1+1e-6;z+=2)B.box('metal',x-.04,x+.04,y,y+1.1,z-.04,z+.04,C.post);B.box('metal',x-.04,x+.04,y+1.05,y+1.12,z0,z1,col);B.box('metal',x-.02,x+.02,y+.55,y+.6,z0,z1,col);};
 const railX=(z,x0,x1,y,col)=>{for(let x=x0;x<=x1+1e-6;x+=2)B.box('metal',x-.04,x+.04,y,y+1.1,z-.04,z+.04,C.post);B.box('metal',x0,x1,y+1.05,y+1.12,z-.04,z+.04,col);B.box('metal',x0,x1,y+.55,y+.6,z-.02,z+.02,col);};
 /* THE INVERT of the cavern, between the guideways (they stand on it) */
 B.quad('conc',[CAV.x0,0,LINE.CZ0],[CAV.x0,0,LINE.CZ1],[CAV.x1,0,LINE.CZ1],[CAV.x1,0,LINE.CZ0],C.invert);
 /* THE PLATFORMS: concrete to the car floor, a cream edge on each face, the Ancients' cyan strip a hand inside it */
 LINE.platforms.forEach(P=>{B.box('conc',P.x0,P.x1,0,PY,P.z0,P.z1,C.plat,true);B.quad('conc',[P.x0,PY,P.z0],[P.x0,PY,P.z1],[P.x1,PY,P.z1],[P.x1,PY,P.z0],P.id==='line.st.west'?C.road:C.platTop);
  P.faces.forEach(([id,side])=>{const e=side<0?P.x0:P.x1,s=-side;B.box('paint',Math.min(e,e+s*.35),Math.max(e,e+s*.35),PY,PY+.01,P.z0,P.z1,C.cream);
   B.box(ST==='built'?'glow':'paint',Math.min(e+s*.5,e+s*.6),Math.max(e+s*.5,e+s*.6),PY,PY+.012,P.z0,P.z1,C.cyan);});
  /* the apron's marking: a line between the road and the platform's walk on the west */
  if(P.id==='line.st.west'){B.box('paint',-22.7,-22.5,PY,PY+.01,P.z0+4,P.z1-4,C.line);}});
 /* THE ROAD: the jogs and ramps to the apron (on LINE.walk's strips) */
 const RD=SEC.road.y,R0=LINE.CZ0,R1=LINE.CZ1;
 deck('road',[[-16.5,RD,R0],[-26.1,RD,R0+22]],6.6,C.road,.3);deck('road',[[-26.1,RD,R0+20],[-26.1,PY,264]],6.6,C.road,PY);
 deck('road',[[-26.1,PY,636],[-26.1,RD,R1-20]],6.6,C.road,PY);deck('road',[[-26.1,RD,R1-22],[-16.5,RD,R1]],6.6,C.road,.3);
 /* THE WALKWAY: its jogs to the east wall, its run along it over the throats, its steps to the platform, a rail on the track side */
 const WY=SEC.walk.y;
 deck('conc',[[14.8,WY,R0],[21.3,WY,R0+20]],2.4,C.walk,WY);deck('conc',[[21.3,WY,R1-20],[14.8,WY,R1]],2.4,C.walk,WY);
 B.box('conc',20.1,CAV.x1,0,WY,R0+18,LINE.P0-4,C.walk);B.box('conc',20.1,CAV.x1,0,WY,LINE.P1+4,R1-18,C.walk);
 railZ(20.1,R0+20,LINE.P0-5,WY,C.rail);railZ(20.1,LINE.P1+5,R1-20,WY,C.rail);
 for(const [za,zb,ya,yb] of [[LINE.P0-5,LINE.P0,WY,PY],[LINE.P1,LINE.P1+5,PY,WY]])for(let k=0;k<5;k++){const t=(k+.5)/5,y=ya+(yb-ya)*t,z=za+(zb-za)*t;B.box('conc',20.1,CAV.x1,0,y,z-.5,z+.5,C.walk);}
 /* THE STAIRS to the footbridges: treads, two stringers, a rail each side */
 LINE.stairs.forEach(S=>{const a=S.a,b=S.b,n=Math.round((b[1]-a[1])/.18),hw=S.w/2;
  for(let k=0;k<n;k++){const t=k/n,t1=(k+1)/n,z0=a[2]+(b[2]-a[2])*t,z1=a[2]+(b[2]-a[2])*t1,y=a[1]+(b[1]-a[1])*t1;B.box('conc',a[0]-hw,a[0]+hw,y-.18,y,Math.min(z0,z1),Math.max(z0,z1),C.walk);}
  for(const s of [-1,1]){const x=a[0]+s*hw;B.quad('metal',[x,a[1],a[2]],[x,b[1],b[2]],[x,b[1]-.35,b[2]],[x,a[1]-.35,a[2]],C.rail);
   B.quad('metal',[x,a[1]+1.0,a[2]],[x,b[1]+1.0,b[2]],[x,b[1]+1.08,b[2]],[x,a[1]+1.08,a[2]],C.rail);
   for(let k=0;k<=4;k++){const t=k/4,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;B.box('metal',x-.04,x+.04,y,y+1.05,z-.04,z+.04,C.post);}}});
 /* THE FOOTBRIDGES: a deck on two girders, rails both sides, the bronze fascia (as built, lit underneath) */
 LINE.bridges.forEach(Br=>{B.box('conc',Br.x0,Br.x1,D-.3,D,Br.z0,Br.z1,C.walk);B.box('bronze',Br.x0,Br.x1,D-.5,D-.3,Br.z0-.05,Br.z0+.15,C.bronze);B.box('bronze',Br.x0,Br.x1,D-.5,D-.3,Br.z1-.15,Br.z1+.05,C.bronze);
  railX(Br.z0+.1,Br.x0,Br.x1,D,C.rail);railX(Br.z1-.1,Br.x0,Br.x1,D,C.rail);
  if(ST==='built')B.box('glow',Br.x0,Br.x1,D-.52,D-.5,Br.z0+.5,Br.z1-.5,C.glowW);});
 /* THE MEZZANINE balconies: a deck on brackets from the wall, a rail on the cavern's side (open at the bridges and the landings) */
 LINE.balconies.forEach(Bl=>{const e=Bl.id==='line.st.mezz.e',xr=e?Bl.x0+.05:Bl.x1-.05;B.box('conc',Bl.x0,Bl.x1,D-.3,D,Bl.z0,Bl.z1,C.walk);
  for(let z=Bl.z0+2;z<Bl.z1;z+=6)B.quad('metal',[e?Bl.x1:Bl.x0,D-1.6,z],[e?Bl.x1:Bl.x0,D-.3,z],[xr,D-.3,z],[xr,D-.3,z],C.post);
  const breaks=[[LINE.BRZ[0]-.2,LINE.BRZ[1]+.2],[469.8,477.2]];let z0=Bl.z0;for(const [a,b] of breaks){if(a>z0)railZ(xr,z0,a,D,C.rail);z0=b;}railZ(xr,z0,Bl.z1,D,C.rail);
  railX(Bl.z0+.05,Bl.x0,Bl.x1,D,C.rail);railX(Bl.z1-.05,Bl.x0,Bl.x1,D,C.rail);});
 LINE.landings.forEach(Lg=>B.box('conc',Lg.x0,Lg.x1,D-.3,D,Lg.z0,Lg.z1,C.walk));
 /* THE DOORS: a bronze frame proud of the lining; the leaf by state (built: shut, the platform's doors open; kept: open where a lamp hangs,
    the rest patched with plate; abandoned: hanging, fallen). A page that opens a door into its own rooms marks the opening `open`
    (settlements/loj-twenny: the hold's streets out through the mezzanines' doors); this station's page marks none */
 LINE.openings.filter(O=>O.kind==='door').forEach((O,i)=>{const e=O.wall==='e',x=e?CAV.x1:CAV.x0,s=e?-1:1,lit=O.y0<2||!!O.open,h=u(i,31,1);
  B.box('bronze',Math.min(x,x+s*.12),Math.max(x,x+s*.12),O.y0,O.y1+.25,O.z0-.25,O.z0,C.bronze);B.box('bronze',Math.min(x,x+s*.12),Math.max(x,x+s*.12),O.y0,O.y1+.25,O.z1,O.z1+.25,C.bronze);
  B.box('bronze',Math.min(x,x+s*.12),Math.max(x,x+s*.12),O.y1,O.y1+.25,O.z0,O.z1,C.bronze);
  const xl=x-s*(CAV.lining*.5),leaf=(z0,z1,col)=>B.box('metal',xl-.04,xl+.04,O.y0,O.y1-.02,z0,z1,col);
  if(ST==='built'){if(!lit)leaf(O.z0,O.z1,C.door);}
  else if(ST==='kept'){if(!lit)leaf(O.z0,O.z1,h<.5?C.plateG:C.plate);}
  else{if(h<.4)leaf(O.z0,(O.z0+O.z1)/2,C.door);else if(h<.7){const yb=O.y0+.05;B.box('metal',x+s*.3,x+s*1.2,yb,yb+.08,O.z0,O.z1,C.door);}}});
 /* THE BRANCH's mouth: a bronze portal and the name band; its floor and kerbs into the rock toward Loj Twenny */
 {const Bn=LINE.branch,x=CAV.x1-.12;B.box('bronze',x,CAV.x1,Bn.y0,Bn.y1+.4,Bn.z0-.4,Bn.z0,C.bronze);B.box('bronze',x,CAV.x1,Bn.y0,Bn.y1+.4,Bn.z1,Bn.z1+.4,C.bronze);
  B.box('bronze',x,CAV.x1,Bn.y1,Bn.y1+.4,Bn.z0,Bn.z1,C.bronze);B.box('paint',x-.02,x,Bn.y1+.6,Bn.y1+1.6,Bn.z0+1,Bn.z1-1,C.board);B.box('paint',x-.03,x-.02,Bn.y1+.9,Bn.y1+1.3,Bn.z0+2,Bn.z1-2,C.boardT);
  deck('conc',Bn.pts.map(p=>[p[0],p[1]+.02,p[2]]),Bn.w-1,C.walk,.3);
  for(const s of [-1,1])deck('conc',Bn.pts.map(p=>[p[0],p[1]+.22,p[2]+s*(Bn.w/2-.8)]),.4,C.plat,.2);}
 /* THE GREAT SHAFT's cage: four posts from the west platform to the vault's mouth, the cage at the platform, its gate, the headframe ring and the rope */
 {const Sh=LINE.shaft,[cx,cz]=Sh.c,r=2.2,top=Sh.y0+1;for(const [dx,dz] of [[-r,-r],[r,-r],[-r,r],[r,r]])B.box('metal',cx+dx-.15,cx+dx+.15,PY,top,cz+dz-.15,cz+dz+.15,C.post);
  for(const y of [PY+2.6,top-.4])for(const s of [-1,1]){B.box('metal',cx-r,cx+r,y,y+.25,cz+s*r-.1,cz+s*r+.1,C.post);B.box('metal',cx+s*r-.1,cx+s*r+.1,y,y+.25,cz-r,cz+r,C.post);}
  const cg=1.3,ch=PY+2.4;B.box('metal',cx-cg,cx+cg,PY,PY+.15,cz-cg,cz+cg,C.post);B.box('metal',cx-cg,cx+cg,ch,ch+.12,cz-cg,cz+cg,C.post);
  for(const [dx,dz] of [[-cg,-cg],[cg,-cg],[-cg,cg],[cg,cg]])B.box('metal',cx+dx-.05,cx+dx+.05,PY,ch,cz+dz-.05,cz+dz+.05,C.rail);
  B.box('metal',cx-.03,cx+.03,ch,Sh.y0+30,cz-.03,cz+.03,C.dark);
  if(ST!=='abandoned')B.box('metal',cx+cg-.02,cx+cg+.02,PY+.2,ch-.1,cz-cg+.1,cz+cg-.1,ST==='kept'?C.plateG:C.door);}
 /* THE NAME BOARDS on the walls (the Ancients' enamel: a dark board, a cream band), every 60 m along both side platforms */
 for(let z=330;z<=570;z+=60)for(const e of [true,false]){if(LINE.openings.some(O=>O.wall===(e?'e':'w')&&O.y0<2&&z+3>O.z0&&z-3<O.z1))continue;const x=e?CAV.x1:CAV.x0,s=e?-1:1;
  B.box('paint',Math.min(x,x+s*.06),Math.max(x,x+s*.06),4.6,5.6,z-3,z+3,C.board);B.box('paint',Math.min(x+s*.06,x+s*.07),Math.max(x+s*.06,x+s*.07),4.95,5.25,z-2.4,z+2.4,C.boardT);}
 /* WHAT THE STATE LEAVES */
 if(ST==='kept'){/* the Tungangs' hut on the island's north end, crates and sacks, an awning over the trolley's stop, rope lashed on the bridges' rails */
  const I=LINE.platforms[0];B.box('paint',I.x0+1.2,I.x0+4.4,PY,PY+2.5,312,322,C.plateG);B.box('paint',I.x0+1.1,I.x0+4.5,PY+2.5,PY+2.62,311.5,322.5,C.plate);
  B.box('paint',I.x0+4.4,I.x0+4.45,PY,PY+2.0,315,317,C.oxide);
  for(let i=0;i<18;i++){const x=-3.5+7*u(i,41,1),z=326+40*u(i,41,2),s=.3+.3*u(i,41,3);if(Math.abs(x)>2.6&&z>415)continue;B.box('paint',x-s,x+s,PY,PY+s*1.4,z-s,z+s,u(i,41,4)<.6?C.crate:C.sack);}
  for(let z=172;z<=190;z+=6)for(const s of [-1,1])B.box('metal',SEC.walk.x0-.2+s*0,SEC.walk.x0-.1,SEC.walk.y,SEC.walk.y+2.6,z-.05,z+.05,C.post);
  B.box('paint',SEC.walk.x0-.3,SEC.walk.x1,SEC.walk.y+2.6,SEC.walk.y+2.66,170,192,C.cloth);
  LINE.bridges.forEach(Br=>{for(let x=Br.x0+1;x<Br.x1;x+=3)B.box('paint',x-.05,x+.05,D+.7,D+1.1,Br.z0+.05,Br.z0+.15,C.rope);});}
 if(ST==='abandoned'){/* dust drifts against the walls and the platform faces, fallen lining slabs, a broken rail section hanging from the east bridge */
  for(let i=0;i<70;i++){const x=CAV.x0+1+(CAV.x1-CAV.x0-2)*u(i,51,1),z=LINE.CZ0+10+(LINE.CZ1-LINE.CZ0-20)*u(i,51,2),s=.3+1.2*u(i,51,3)*u(i,51,3);
   let y=0;for(const P of LINE.platforms)if(x>=P.x0&&x<=P.x1&&z>=P.z0&&z<=P.z1)y=PY;
   if(SEC.tracks.some(T=>Math.abs(x-LINE.trackX(T.id,z))<SEC.car.half+.6))continue;
   if(u(i,51,4)<.6)B.box('rubble',x-s,x+s*.8,y,y+s*.5,z-s*.7,z+s,C.dust);
   else{const a=u(i,51,5)*6.28,w=.8+1.2*u(i,51,6),l=1+u(i,51,7),t=.2+.5*u(i,51,8),ca=Math.cos(a),sa=Math.sin(a),P=(dx,dz,dy)=>[x+dx*ca-dz*sa,y+.1+dy,z+dx*sa+dz*ca];
    B.quad('lining',P(-w/2,-l/2,0),P(-w/2,l/2,t),P(w/2,l/2,t),P(w/2,-l/2,0),rg(0x8e8a80));}}
  {const Br=LINE.bridges[0],x0=12,x1=16;B.quad('metal',[x0,D+1.08,Br.z1-.1],[x1,D+1.08,Br.z1-.1],[x1,D-1.4,Br.z1+.3],[x0,D+.2,Br.z1+.3],C.rail);}}
 const g=B.finish('the station\'s works',{label:{conc:'The station\'s concrete: the invert, the platforms, the walkway, the stairs, the footbridges, the mezzanine',road:'The access road\'s jog and ramps to the west apron',
  paint:'Paint and enamel: the platforms\' edges, the name boards'+(ST==='kept'?', the Tungangs\' hut, crates, sacks and awning':''),metal:'Steel: the rails, the doors, the shaft\'s cage',bronze:'Bronze: the door frames, the branch\'s portal, the bridges\' fascia',
  glow:'The Ancients\' light: the platform strips and the bridges\' undersides',rubble:'Dust and fallen pieces',lining:'A slab fallen from the lining'}});
 scene.add(g);
 /* the probe's points: each platform, each bridge, the branch's mouth, the shaft's cage */
 if(g.children[0])g.children[0].userData.probePoints=LINE.platforms.flatMap(P=>[(P.x0+P.x1)/2,PY+.5,(P.z0+P.z1)/2])
  .concat(LINE.bridges.concat(LINE.balconies).flatMap(Br=>[(Br.x0+Br.x1)/2,D,(Br.z0+Br.z1)/2]),[CAV.x1-1,PY+1,411,LINE.shaft.c[0],PY+1,LINE.shaft.c[1]]);
 return {group:g,tris:B.tris};})();
