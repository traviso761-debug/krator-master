// ================================================================= IZIZ VERNACULAR — the frontier (Verge's upper city)
// The buildings an Iziz governor puts up in a desert caravan town at the head of a cliff trail: his palace, the
// guard tower and barracks the city watch patrols from, a watch post, the toll house at the trailhead, the
// palisade (one modular segment) and its road gate, the mustering ground, and a rest stop on the switchback
// trail down the cliff (variant 0 cut into the rock, variant 1 built out on the cliff edge).
// Same contract as 70-74: LOCAL frame, origin the plot centre on the ground, +z the front, y = 0 ground.
// Seeds 8001-8079. Local helpers are prefixed vf. Uses only 69b/69c/72/74 globals (Verge bundles these).

// ---------------------------------------------------------------- local helpers (LOCAL frame, y = base of the piece)
// solid steps (stone or timber blocks from the ground up, not floating treads): `n` steps rising `rise` toward -z
// (local, turned by ry), the lowest step's front edge at local z = +run/2
function vfSteps(x,y,z,ry,w,rise,n,item,c){const run=n*.34;for(let k=0;k<n;k++){const p=loc(x,z,0,run/2-.34*(k+.5),ry);vB(item||'vStone',p[0],y,p[1],w,rise*(k+1)/n,.34,ry,c);}}
// a straight wall of length L along local x of the piece, thick T, high h, with a projecting cap and, when `merl`,
// small stepped (Mayan) merlons every `merl` metres along the cap
function vfWall(x,z,L,ry,h,T,c,capC,merl){vB('vStone',x,0,z,L,h,T,ry,c);vB('vStone',x,h,z,L+.2,.26,T+.36,ry,capC);
 if(merl){const n=Math.max(1,Math.floor(L/merl));for(let i=0;i<n;i++){const p=loc(x,z,-L/2+L*(i+.5)/n,0,ry);vB('vStone',p[0],h+.26,p[1],.7,.5,T*.9,ry,capC);vB('vStone',p[0],h+.76,p[1],.4,.22,T*.6,ry,capC);}}}
// a gate pier: a stone block with a copper pyramid cap
function vfPier(x,z,s,h,c,cu){vB('vStone',x,0,z,s,h,s,0,c);vB('vStone',x,h,z,s+.2,.22,s+.2,0,c.clone().multiplyScalar(1.06));kput('vPyrCu',[x,h+.22,z],null,[s+.1,s*.8,s+.1],cu);}
// an iron gate leaf of bars, hinged at (hx,hz), `L` wide, `h` high, turned to ry (ry 0 = the leaf runs along +x)
function vfGateLeaf(hx,hz,ry,L,h,iron,dir){const n=Math.max(3,Math.round(L/.3));for(let i=0;i<=n;i++){const p=loc(hx,hz,dir*(.1+(L-.2)*i/n),0,ry);vB('vIron',p[0],.08,p[1],.05,h,.05,ry,iron);kput('vConeI',[p[0],.08+h,p[1]],null,[.05,.16,.05],iron);}
 for(const yy of[.3,h*.5,h-.1]){const p=loc(hx,hz,dir*L/2,0,ry);vB('vIron',p[0],yy,p[1],L,.08,.07,ry,iron);}}
// a signal beacon: a stone pedestal, an iron cage on legs, a bed of embers (fire, not electric: allowed anywhere)
function vfBeacon(x,y,z,c){const iron=vC(0x2e2a26);vB('vStone',x,y,z,1.4,.7,1.4,0,c);
 for(let k=0;k<4;k++){const a=k/4*TAU+Math.PI/4;vPst('vPipe',x+Math.cos(a)*.45,y+.7,z+Math.sin(a)*.45,.04,1.1,iron,qEuler(Math.sin(a)*.18,0,-Math.cos(a)*.18));}
 for(const yy of[1.2,1.75])vBq('vHoop',x,y+yy,z,.62,.62,1,qEuler(Math.PI/2,0,0),iron);vB('vIron',x,y+1.1,z,.9,.06,.9,0,iron);
 for(let k=0;k<7;k++)vBall('vEmber',x+rr(-.3,.3),y+1.25+rr(0,.25),z+rr(-.3,.3),rr(.12,.2));}
// a hitching rail: posts along local x with a top rail and tether rings
function vfHitch(x,z,L,ry,c){const n=Math.max(2,Math.round(L/2.2));for(let i=0;i<=n;i++){const p=loc(x,z,-L/2+L*i/n,0,ry);vPst('vPostB',p[0],0,p[1],.1,1.15,c);}
 vB('vWood',x,1.05,z,L+.2,.12,.14,ry,c);
 for(let i=0;i<n;i++){const p=loc(x,z,-L/2+L*(i+.5)/n,.1,ry);vBq('vHoop',p[0],.85,p[1],.12,.12,1,qEuler(0,ry,0),vC(0x2e2a26));}}
// a stone water trough of length L along local x, water as dark glass inset
function vfStoneTrough(x,z,L,ry,c){vB('vStone',x,0,z,L,.7,.85,ry,c);vB('vWinGlass',x,.56,z,L-.3,.1,.55,ry);}
// a drill formation: rows x cols of figures in Iziz orange, each with a spear
function vfFormation(x,z,rows,cols,ry){const org=vC(0xe07a2a),skin=vC(0xc9a17e),sp=vC(0x5a4632);for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const p=loc(x,z,(c-(cols-1)/2)*1.2,(r-(rows-1)/2)*1.3,ry);
 kput('figB',[p[0],0,p[1]],qEuler(0,ry,0),1,org);kput('figH',[p[0],0,p[1]],null,1,skin);const s=loc(p[0],p[1],.32,0,ry);vPst('vPost',s[0],0,s[1],.025,2.3,sp);kput('vConeI',[s[0],2.3,s[1]],null,[.04,.22,.04],null);}}
// a flagpole with the Iziz banner flying from it (a cloth plane on the +x side of the pole)
function vfFlagpole(x,z,h,c){const iron=vC(0x2e2a26);vB('vStone',x,0,z,1.2,.5,1.2,0,vC(vPick(VPAL.stoneDark)));vPst('vPipe',x,.5,z,.1,h,iron);vBall('vFinial',x,.5+h+.1,z,.2);
 const fy=.5+h-1.1;vPl('vCloth',x+1.5,fy,z,2.8,1.7,0,c||vC(0xe07a2a));vPl('vCloth',x+1.5,fy,z+.02,2.8,.3,0,vC(0x2f8f8a));vPl('vCloth',x+1.5,fy,z-.02,2.8,.3,0,vC(0x2f8f8a));
 for(const yy of[fy+.8,fy-.85])vB('vIron',x+.06,yy,z,.14,.05,.05,0,iron);}

// ---------------------------------------------------------------- the Governor's Palace: walled forecourt, iron gate, a stone block on a battered podium, domed front pavilion, a flag tower
function buildVernGovernorPalace(G,o){reseed(8001+(o.v|0));const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodRich)),trim=vC(vPick(VPAL.trim)),cu=vC(0xffffff),iron=vC(0x2e2a26),org=vC(0xe07a2a),leaf=vC(0x4a2e1c);
 vnReg("Governor's Palace",0,-4,17,23,{type:['civic','single-family dwelling'],role:'palace'});vnReg("Governor's Palace — forecourt wall",0,0,21,3.6,{part:'wall'});
 const CW=40,ZB=-17,ZF=16.5,WH=3.4,T=.8,GO=4.4;
 // ---- the compound wall: stone with a cap and stepped merlons; the gate in the front wall between copper-capped piers
 vfWall(0,ZB+T/2,CW+T,0,WH,T,stD,st,1.7);
 for(const s of[-1,1])vfWall(s*CW/2,(ZB+ZF)/2+.4,ZF-ZB-.8,Math.PI/2,WH,T,stD,st,1.7);
 {const L=CW/2-GO/2-.8;for(const s of[-1,1])vfWall(s*(GO/2+.8+L/2),ZF,L,0,WH,T,stD,st,1.7);}
 for(const s of[-1,1]){vfPier(s*(GO/2+.6),ZF,1.3,WH+1.4,st,cu);vnLamp(s*(GO/2+.6),WH+.6,ZF+.65,0);}
 vfGateLeaf(-GO/2,ZF,1.05,GO/2-.05,3.1,iron,1);vfGateLeaf(GO/2,ZF,-1.05,GO/2-.05,3.1,iron,-1);           // the iron gate, both leaves swung in
 vB('vStone',0,0,ZF,GO,.12,T+.4,0,stD);                                                                    // threshold
 // ---- the main block: battered podium, two stone storeys with stepped cornices, a copper hip roof
 const W=30,D=14,ZC=-7,P=1.4,Y0=P,H1=4.8,H2=4.2,YD=P+.23;   // YD: the floor, flush with the podium's cap band
 vnPlinth('vBatterS',0,0,ZC,(W+.8)/.86,P,(D+.8)/.86,0,stD);
 vB('vStone',0,Y0,ZC,W,H1,D,0,st);const c1=vnCornice('vStone',0,Y0+H1,ZC,W,D,0,st,2);
 vB('vStone',0,c1,ZC,W-.4,H2,D-.4,0,st.clone().multiplyScalar(1.03));const c2=vnCornice('vStone',0,c1+H2,ZC,W-.4,D-.4,0,st,3);
 vnHipRoof('vHipCu',0,c2,ZC,W-.4,D-.4,3.4,0,cu,1.2);
 const FZ=ZC+D/2;   // front face of the main block (z = 0)
 for(const s of[-1,1]){for(const x of[7.4,10.4,13.3]){vnWin(s*x,Y0+1.2,FZ,0,1.3,2.3,'lit','vStone',st);vnWin(s*x,c1+.9,FZ-.2,0,1.2,2.0,'lit','vStone',st);}
  for(const x of[8.9,11.85])vnStrip(s*x,Y0+.7,FZ+.02,0,.6,3.4,'vStone',stD);
  for(const z of[-12.4,-7,-3.2])vnWin(s*W/2,Y0+1.2,ZC+z+7,s*Math.PI/2,1.2,2.2,'lit','vStone',st);
  for(const z of[-12.4,-10,-7,-3.2])vnWin(s*(W/2-.2),c1+.9,ZC+z+7,s*Math.PI/2,1.1,1.9,'lit','vStone',st);
  for(const x of[2,6,10,13.3])vnWin(s*x,Y0+1.3,ZC-D/2,Math.PI,1.2,2.0,'glass','vStone',st);for(const x of[2,6,10,13.3])vnWin(s*x,c1+.9,ZC-D/2+.2,Math.PI,1.1,1.8,'glass','vStone',st);}
 // the east side door onto the service yard, steps down the podium
 vnDoor(W/2,YD,-10,Math.PI/2,1.4,2.8,'vStone',st,leaf,false);vfSteps(W/2+.5+1.19,0,-10,Math.PI/2,2.0,YD,7,'vStone',stD);
 // ---- the front pavilion: three storeys (each a touch taller than the block's, so the cornices never share a plane), a drum and a copper dome
 const PW=11,PD=8,PZ=.4,PF=PZ+PD/2;
 vnPlinth('vBatterS',0,0,1.79,(PW+.8)/.86,P,7,0,stD);
 vB('vStone',0,Y0,PZ,PW,H1+.08,PD,0,st);const p1=vnCornice('vStone',0,Y0+H1+.08,PZ,PW,PD,0,st,2);
 vB('vStone',0,p1,PZ,PW-.3,H2,PD-.3,0,st.clone().multiplyScalar(1.03));const p2=vnCornice('vStone',0,p1+H2,PZ,PW-.3,PD-.3,0,st,2);
 vB('vStone',0,p2,PZ,PW-.6,3.8,PD-.6,0,st.clone().multiplyScalar(1.06));const p3=vnCornice('vStone',0,p2+3.8,PZ,PW-.6,PD-.6,0,st,3);
 for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*((PW-.6)/2-.7),z=PZ+sz*((PD-.6)/2-.7);vB('vStone',x,p3,z,1.4,1.0,1.4,0,st);kput('vPyrCu',[x,p3+1.0,z],null,[1.7,1.2,1.7],cu);}
 vPst('vPostS',0,p3,PZ,3.0,1.7,st);vB('vStone',0,p3+1.7,PZ,6.6,.3,6.6,0,stD);for(let k=0;k<12;k++){const a=k/12*TAU;vB('vDarkB',Math.cos(a)*3.0,p3+.5,PZ+Math.sin(a)*3.0,.5,.8,.2,-a+Math.PI/2);}
 kput('vDomeC',[0,p3+2.0,PZ],null,[3.2,2.9,3.2],cu);vBall('vFinial',0,p3+5.05,PZ,.34);vPst('vPipeC',0,p3+5.2,PZ,.05,1.2,cu);
 // pavilion front: the great door up the steps, lit windows, a balcony over the door, orange banners, fluted strips on the top storey
 vfSteps(0,0,4.9+.85,0,5.0,YD,5,'vStone',st);vnDoor(0,YD,PF,0,2.2,3.6,'vStone',st,leaf,false);
 for(const s of[-1,1]){vB('vStone',s*1.75,Y0,PF+.2,.7,4.3,.5,0,stD);vnWin(s*3.6,Y0+1.2,PF,0,1.3,2.4,'lit','vStone',st);
  vnWin(s*2.9,p1+.9,PF-.15,0,1.2,2.2,'lit','vStone',st);vnWin(s*2.6,p2+1.0,PF-.3,0,1.1,1.8,'lit','vStone',st);vnStrip(s*1.3,p2+.6,PF-.28,0,.55,2.6,'vStone',stD);vnStrip(s*3.9,p2+.6,PF-.28,0,.55,2.6,'vStone',stD);
  vgBanner(s*4.55,p1+H2-.25,PF-.15+.16,0,1.2,3.6,org);
  vnWin(s*PW/2,Y0+1.2,PZ+2.4,s*Math.PI/2,1.2,2.2,'lit','vStone',st);vnWin(s*(PW/2-.15),p1+.9,PZ+2.4,s*Math.PI/2,1.1,2.0,'lit','vStone',st);
  for(const z of[-1.6,2.2])vnWin(s*(PW/2-.3),p2+1.0,PZ+z,s*Math.PI/2,1.0,1.7,'lit','vStone',st);}
 vnWin(0,p1+.6,PF-.15,0,1.5,2.6,'lit','vStone',st);vnWin(0,p2+1.0,PF-.3,0,1.1,1.8,'lit','vStone',st);
 {const bz=PF+.6;vB('vStone',0,p1-.32,bz,5.4,.3,1.6,0,stD);for(const x of[-2.2,0,2.2]){vB('vStone',x,p1-.85,PF+.25,.4,.53,.5,0,stD);vB('vStone',x,p1-.6,PF+.55,.4,.28,.6,0,stD);}
  for(let i=0;i<=8;i++)vPst('vPostS',-2.5+5*i/8,p1-.02,bz+.62,.07,.85,st);vB('vStone',0,p1+.83,bz+.62,5.3,.12,.22,0,st);for(const s of[-1,1])vB('vStone',s*2.6,p1-.02,bz,.12,.97,1.4,0,st);}
 // ---- the flag tower over the back-east corner: stone shaft through the roof, lit windows, stepped cornice, copper pyramid, the banner
 {const TX=12,TZ=-11,TS=4.6,TH=c2+7.0;vB('vStone',TX,c2-.6,TZ,TS,TH-(c2-.6),TS,0,st);const tc=vnCornice('vStone',TX,TH,TZ,TS,TS,0,st,2);
  for(let k=0;k<4;k++){const a=k*Math.PI/2;const p=loc(TX,TZ,0,TS/2,a);vnWin(p[0],TH-2.5,p[1],a,.9,1.6,'lit','vStone',st);const q=loc(TX,TZ,0,TS/2+.02,a);vnStrip(q[0],TH-5.0,q[1],a,.5,2.0,'vStone',stD);}
  kput('vPyrCu',[TX,tc,TZ],null,[TS+.9,3.0,TS+.9],cu);vBall('vFinial',TX,tc+3.05,TZ,.3);vnBannerPole(TX+1.2,tc,TZ+1.2,0,3.4,org);}
 // ---- the forecourt: paving, the fountain on the axis, planters, lamps, banner poles; the gate lodge inside the gate
 vnPaving(0,.07,(7+ZF)/2,5.2,ZF-7.6,0,stD,18);vnPaving(0,.02,(7+ZF)/2,24,ZF-7.6,0,st,40);
 {const fz=11.2;vB('vStone',0,0,fz,4.6,.7,4.6,0,stD);vB('vStone',0,.7,fz,4.9,.14,4.9,0,st);vB('vWinGlass',0,.6,fz,4.0,.1,4.0,0);
  vPst('vPostS',0,.6,fz,.35,1.6,st);vB('vStone',0,2.2,fz,1.1,.2,1.1,0,stD);vBall('vFinial',0,2.6,fz,.3);}
 for(const s of[-1,1]){vnPlanter(s*6.2,0,8.6,3.0,1.0,0,wood);vnPlanter(s*6.2,0,13.6,3.0,1.0,0,wood);vnLampPost(s*3.6,0,8.0,3.4);vnLampPost(s*3.6,0,14.6,3.4);vnBannerPole(s*9.5,0,14.8,0,8.5,org);
  vnPlanter(s*18.9,0,-3,1.0,3.4,0,wood);}
 {const lx=-15.5,lz=12.6;vB('vStone',lx,0,lz,4.0,3.0,3.6,0,st);vnCornice('vStone',lx,3.0,lz,4.0,3.6,0,st,1);kput('vPyrCu',[lx,3.5,lz],null,[4.6,1.6,4.2],cu);
  vnDoor(lx+2.0,0,lz,Math.PI/2,1.0,2.2,'vStone',st,trim,false);vnWin(lx,1.2,lz+1.8,0,.9,1.0,'lit','vStone',st);vnWin(lx,1.2,lz-1.8,Math.PI,.9,1.0,'glass','vStone',st);}
 vnFolk(0,10,5,3.2);vnFolk(0,ZF+.8,2,.4);}

// ---------------------------------------------------------------- the guard tower and barracks: a square stone tower of three storeys with a crenellated roof platform and a beacon, a two-storey barrack block beside it
function buildVernGuardTower(G,o){reseed(8011+(o.v|0));const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodMid)),trim=vC(vPick(VPAL.trim)),pl=vC(vPick(VPAL.sand)),cu=vC(0xffffff),iron=vC(0x2e2a26),org=vC(0xe07a2a),leaf=vC(0x5a3a24);
 const TX=-6.5,TZ=-1,TW=9,Y0=.6,SH=3.8,TOP=Y0+3*SH;
 vnReg('Guard tower',TX,TZ,6.4,TOP+7,{type:['military','civic'],role:'guard tower'});vnReg('Guard barracks',4.4,-1.5,7.4,9.5,{type:['military','civic']});
 // ---- the tower: a battered skirt, three storeys between string courses, corbels, a stepped cornice, a crenellated parapet
 kput('vBatterS',[TX,0,TZ],null,[TW+1.4,1.6,TW+1.4],stD);vB('vStone',TX,0,TZ,TW,TOP,TW,0,st);
 for(const k of[1,2])vB('vStone',TX,Y0+k*SH-.14,TZ,TW+.3,.28,TW+.3,0,stD);
 for(let f=0;f<4;f++){const a=f*Math.PI/2;for(let i=0;i<7;i++){const p=loc(TX,TZ,-TW/2+.65+i*(TW-1.3)/6,TW/2+.15,a);vB('vStone',p[0],TOP-.55,p[1],.36,.4,.3,a,stD);}}
 const deck=vnCornice('vStone',TX,TOP,TZ,TW,TW,0,st,3,false);
 {const PS=TW+1.0,ph=1.1;for(let f=0;f<4;f++){const a=f*Math.PI/2;const p=loc(TX,TZ,0,PS/2-.25,a);vB('vStone',p[0],deck,p[1],PS,ph,.5,a,st);
   for(let i=f%2;i<6-f%2;i++){const q=loc(TX,TZ,-PS/2+.55+i*(PS-1.1)/5,PS/2-.25,a);   // the odd faces leave the corners to the even ones
   vB('vStone',q[0],deck+ph,q[1],.75,.6,.55,a,st);vB('vStone',q[0],deck+ph+.6,q[1],.45,.2,.4,a,stD);}}}
 // storey 1: the door up two steps, arrow slits; storeys 2 and 3: lit windows either side of a fluted strip on every face
 vnDoor(TX,Y0,TZ+TW/2,0,1.6,2.6,'vStone',st,leaf,false);vfSteps(TX,0,TZ+TW/2+.34,0,2.6,Y0,2,'vStone',stD);
 for(let f=0;f<4;f++){const a=f*Math.PI/2;
  for(const lx of f===0?[-3,3]:[-2.4,0,2.4]){const p=loc(TX,TZ,lx,TW/2+.03,a);vB('vDarkB',p[0],Y0+1.0,p[1],.22,1.5,.1,a);}
  for(const k of[1,2]){const y=Y0+k*SH+.9;for(const lx of[-2.6,2.6]){const p=loc(TX,TZ,lx,TW/2,a);vnWin(p[0],y,p[1],a,.9,1.5,'lit','vStone',st,true);}}
  const q=loc(TX,TZ,0,TW/2+.02,a);vnStrip(q[0],Y0+SH+.5,q[1],a,.6,2*SH-1.0,'vStone',stD);}
 for(const lx of[-3.4,3.4]){const p=loc(TX,TZ,lx,TW/2,0);vnLamp(p[0],Y0+SH+.4,p[1],0);}
 // the roof platform: the stair kiosk, the beacon, the banner, a lamp
 {const kx=TX-2.3,kz=TZ-2.3;vB('vStone',kx,deck,kz,2.4,2.3,2.4,0,st);vnCornice('vStone',kx,deck+2.3,kz,2.4,2.4,0,st,1);kput('vPyrCu',[kx,deck+2.85,kz],null,[3.0,1.4,3.0],cu);
  vnDoor(kx,deck,kz+1.2,0,.9,1.9,'vStone',st,leaf,false);}
 vfBeacon(TX+1.6,deck,TZ+1.4,stD);vnBannerPole(TX+2.6,deck,TZ-2.8,0,6,org);vnLampPost(TX-2.8,deck,TZ+2.8,2.2);
 // ---- the barrack block: a stone ground storey, a timber-framed plaster storey, a copper hip roof; a veranda along the front
 const BX=4.4,BZ=-1.5,BW=13.2,BD=7,Y0b=.5,H1=3.4,H2=3.0;
 vB('vStone',BX,-.1,BZ+1.3,BW+.5,Y0b+.1,BD+3.1,0,stD);
 vB('vStone',BX,Y0b,BZ,BW,H1,BD,0,st);const c1=vnCornice('vStone',BX,Y0b+H1,BZ,BW,BD,0,st,1,false);
 vnFrame(BX,c1,BZ,BW,H2,BD,0,wood,.15);vB('vPlaster',BX,c1,BZ,BW-.14,H2,BD-.14,0,pl);
 const top=vnCornice('vWood',BX,c1+H2,BZ,BW,BD,0,trim,2);vnHipRoof('vHipCu',BX,top,BZ,BW,BD,2.3,0,cu,.9);vnChimney(BX+3.5,top+1.0,BZ-1.6,2.0,.16,true);
 const FB=BZ+BD/2;vnVeranda(BX+.4,Y0b,FB+1.3,BW-1.2,2.6,0,.04,3.0,wood);vnShedRoof(BX+.4,Y0b+3.0,FB+1.3,BW-1.2,2.6,.5,0,'vCopperB',cu,.4,.12);
 vfSteps(BX+.4,0,BZ+1.3+(BD+3.1)/2+.34,0,4.0,Y0b,2,'vStone',stD);
 for(const x of[1.2,7.8])vnDoor(x,Y0b,FB,0,1.2,2.4,'vWood',wood,trim,false);
 for(const x of[4.5,10.4])vnWin(x,Y0b+1.1,FB,0,1.2,1.4,'lit','vStone',st,true);
 for(const x of[-.2,3.2,6.6,10])vnWin(x,c1+.9,FB,0,1.1,1.3,'lit','vWood',wood,true);
 for(const x of[0,3.5,7,10.5]){vnWin(x,Y0b+1.3,BZ-BD/2,Math.PI,1.0,1.1,'shut','vWood',wood);vnWin(x,c1+.9,BZ-BD/2,Math.PI,1.0,1.1,'shut','vWood',wood);}
 for(const z of[-1.6,1.6]){vnWin(BX+BW/2,Y0b+1.3,BZ+z,Math.PI/2,1.0,1.2,'lit','vStone',st);vnWin(BX+BW/2,c1+.9,BZ+z,Math.PI/2,1.0,1.2,'lit','vWood',wood,true);}
 // ---- the yard: paving, spear racks, a water butt, a drill pell, crates, lamp posts, the watch going out on patrol
 vnPaving(-1,.02,6.4,22,6.0,0,stD,40);
 vgSpearRack(-11.6,6.2,Math.PI/2,6,wood);vgSpearRack(11.8,5.4,Math.PI/2,5,wood);vnWaterButt(11.6,0,8.6,.48,1.1);vnCrate(-11.4,0,9.0,.9,.2,wood);vnBarrel(-10.3,0,9.2,.42,1.0,wood);
 for(const x of[-2.6,8.8])vnLampPost(x,0,8.6,3.6);
 vfFormation(3.2,7.2,2,3,0);vnFolk(-6.5,7.6,2,1.4);}

// ---------------------------------------------------------------- the watch house: a two-storey city-watch post, stone below and timber-framed plaster above, a copper pyramid roof, a lantern, a notice board, an alarm bell
function buildVernWatchHouse(G,o){reseed(8021+(o.v|0));const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodMid)),trim=vC(vPick(VPAL.trim)),pl=vC(vPick(VPAL.sand)),cu=vC(0xffffff),iron=vC(0x2e2a26);
 const W=6.4,D=5.6,ZC=-.8,Y0=.4,H1=3.2,H2=2.8,FZ=ZC+D/2;
 vnReg('Watch house',0,ZC,4.6,11,{type:['civic','military']});
 vB('vStone',0,-.1,ZC,W+.5,Y0+.1,D+.5,0,stD);
 vB('vStone',0,Y0,ZC,W,H1,D,0,st);const c1=vnCornice('vStone',0,Y0+H1,ZC,W,D,0,st,1,false);
 vnFrame(0,c1,ZC,W,H2,D,0,wood,.14);vB('vPlaster',0,c1,ZC,W-.12,H2,D-.12,0,pl);
 const top=vnCornice('vWood',0,c1+H2,ZC,W,D,0,trim,2);vnPyrRoof('vPyrCu',0,top,ZC,W,D,2.6,0,cu,.7);vBall('vFinial',0,top+2.35,ZC,.22);
 vnDoor(-1.4,Y0,FZ,0,1.1,2.3,'vStone',st,trim,false);vfSteps(-1.4,0,FZ+.42,0,1.7,Y0,1,'vStone',stD);
 // the notice board: a timber board under a little hood, papers pinned to it
 {const bx=1.5,bz=FZ+.06;vB('vWood',bx,Y0+.9,bz,1.7,1.2,.08,0,wood);for(const s of[-1,1])vB('vWood',bx+s*.88,Y0+.8,bz+.02,.1,1.45,.1,0,wood);
  kput('vWood',[bx,Y0+2.25,bz+.22],vQ(0,-.5,0),[2.0,.05,.6],trim);
  for(let k=0;k<6;k++)vPl('vCloth',bx-.6+(k%3)*.6+rr(-.08,.08),Y0+1.25+Math.floor(k/3)*.5+rr(-.05,.05),bz+.07,rr(.3,.42),rr(.34,.46),rr(-.12,.12),vC(vPick([0xf0e6cc,0xe8dcc0,0xf4ecd8])));}
 vnWin(-W/2,Y0+1.3,ZC,-Math.PI/2,.9,1.1,'lit','vStone',st);vnWin(W/2,Y0+1.3,ZC+.4,Math.PI/2,.9,1.1,'lit','vStone',st);vnWin(0,Y0+1.3,ZC-D/2,Math.PI,.9,1.1,'glass','vStone',st);
 for(const x of[-1.5,1.5])vnWin(x,c1+.8,FZ,0,1.0,1.3,'lit','vWood',wood,true);for(const s of[-1,1])vnWin(s*W/2,c1+.8,ZC,s*Math.PI/2,1.0,1.3,'lit','vWood',wood,true);vnWin(0,c1+.8,ZC-D/2,Math.PI,1.0,1.2,'shut','vWood',wood);
 // the lantern on its post at the corner, the alarm bell on a bracket, a bench along the east wall
 vnLampPost(-4.2,0,3.4,3.6);
 {const bx=W/2+.05,by=c1+H2-.4,bz=FZ-.6;vBeam([bx,by,bz],[bx+.7,by,bz],.06,iron,'vIron');vBq('vBall',bx+.62,by-.32,bz,.24,.3,.24,null,vC(0x7a6a2a));vPst('vRope',bx+.62,Y0+1.6,bz,.015,by-.6-(Y0+1.6),vC(0xa89878));}
 vB('vWood',W/2+.38,0,ZC-.6,.45,.45,2.0,0,wood);vnFolk(.6,FZ+1.3,2,.7);}

// ---------------------------------------------------------------- the toll house: at the trailhead, a toll window and counter facing the road on its +x side under a canopy, a covered bench, a stone strongroom, the toll bar
function buildVernTollHouse(G,o){reseed(8031+(o.v|0));const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodMid)),trim=vC(vPick(VPAL.trim)),pl=vC(vPick(VPAL.adobe)),cu=vC(0xffffff),iron=vC(0x2e2a26),cream=vC(0xf0e6cc);
 const BXc=-.3,W=7.5,D=6.5,Y0=.4,H1=3.2,H2=2.8,EX=BXc+W/2,FZ=D/2;
 vnReg('Toll house',BXc,0,5.2,10,{type:['civic','infrastructure']});
 vB('vStone',BXc,-.1,0,W+.5,Y0+.1,D+.5,0,stD);
 vB('vStone',BXc,Y0,0,W,H1,D,0,st);const c1=vnCornice('vStone',BXc,Y0+H1,0,W,D,0,st,1,false);
 vnFrame(BXc,c1,0,W,H2,D,0,wood,.14);vB('vPlaster',BXc,c1,0,W-.12,H2,D-.12,0,pl);
 const top=vnCornice('vWood',BXc,c1+H2,0,W,D,0,trim,2);vnHipRoof('vHipCu',BXc,top,0,W,D,2.2,0,cu,.8);vnChimney(BXc-1.8,top+.9,-1.6,1.6,.14,true);
 // the toll window on the road side (+x): a lit, barred window over a timber counter, a canopy on two posts, the tariff sign
 {const wz=-.8;vnWin(EX,Y0+1.0,wz,Math.PI/2,1.7,1.2,'lit','vStone',st);for(let k=-2;k<=2;k++)vB('vIron',EX+.2,Y0+1.0,wz+k*.32,.04,1.2,.04,0,iron);
  vB('vWood',EX+.38,Y0+.9,wz,.7,.1,2.1,0,wood);for(const s of[-1,1])vBeam([EX+.05,Y0+.35,wz+s*.85],[EX+.6,Y0+.88,wz+s*.85],.07,wood);
  vB('vIron',EX+.5,Y0+1.0,wz-.5,.3,.06,.4,0,vC(0x8a7a3a));                                                         // the coin tray
  vnShedRoof(EX+1.2,Y0+2.75,wz,4.4,2.4,.5,Math.PI/2,'vCopperB',cu,.3,.12);for(const s of[-1,1])vPst('vPost',EX+2.2,0,wz+s*2.0,.09,Y0+2.75,wood);
  vB('vWood',EX+.07,Y0+1.25,wz+1.75,.06,1.1,1.0,0,trim);for(let k=0;k<4;k++)vB('vWood',EX+.11,Y0+1.4+k*.24,wz+1.75,.03,.05,.8,0,cream);}   // the tariff board
 vnSign(EX,Y0+3.0,1.8,Math.PI/2,vC(0xe07a2a));
 // the front: the door, a covered bench for travellers waiting on the toll
 vnDoor(-2.6,Y0,FZ,0,1.1,2.3,'vWood',wood,trim,false);vfSteps(-2.6,0,FZ+.42,0,1.7,Y0,1,'vStone',stD);
 {vB('vStone',1.55,0,FZ+.55,3.0,.45,.55,0,stD);vB('vWood',1.55,.45,FZ+.55,3.0,.08,.6,0,wood);vnShedRoof(1.55,Y0+2.55,FZ+.7,3.6,1.4,.35,0,'vCopperB',cu,.25,.1);
  for(const x of[.05,3.05])vPst('vPost',x,0,FZ+1.3,.08,Y0+2.55,wood);}
 vnWin(1.55,Y0+1.4,FZ,0,1.2,1.1,'lit','vStone',st,true);
 for(const x of[-2.0,1.9])vnWin(BXc+x,c1+.8,FZ,0,1.0,1.3,'lit','vWood',wood,true);for(const z of[-1.4,1.4])vnWin(EX,c1+.8,z,Math.PI/2,1.0,1.3,'lit','vWood',wood,true);
 for(const x of[-2,1.4])vnWin(BXc+x,Y0+1.3,-FZ,Math.PI,.9,1.0,'shut','vWood',wood);vnWin(BXc,c1+.8,-FZ,Math.PI,1.0,1.2,'glass','vWood',wood);
 // the strongroom: a squat stone annex on the -x end, entered from inside, one barred slit, an iron-bound roof slab
 {const sx=BXc-W/2-1.3,sz=-.6,SW=2.6,SD=4.4;vB('vStone',sx,0,sz,SW+.1,2.9,SD,0,stD);vnCornice('vStone',sx,2.9,sz,SW+.1,SD,0,st,1);
  vB('vDarkB',sx-SW/2-.07,1.9,sz,.1,.35,.8,0);for(let k=-1;k<=1;k++)vB('vIron',sx-SW/2-.12,1.9,sz+k*.24,.04,.35,.04,0,iron);
  for(const z of[-1.4,1.4])vB('vIron',sx,3.15,sz+z,SW+.2,.06,.1,0,iron);}
 // the toll bar at the road's edge, raised: a striped pole on a stone pier, a counterweight
 {const px=6.45,pz=4.2,py=1.15,a=.26,L=5.2;vPst('vPostS',px,0,pz,.28,py,stD);vB('vIron',px,py-.05,pz,.2,.25,.5,0,iron);
  for(let k=0;k<5;k++){const t=(k+.5)/5*L;kput('vWood',[px-t*Math.sin(a),py+t*Math.cos(a),pz],qEuler(0,0,a),[.16,L/5+.01,.16],k%2?cream:vC(0xe07a2a));}
  kput('vWood',[px+.35*Math.sin(a),py-.35*Math.cos(a),pz],qEuler(0,0,a),[.14,.7,.14],wood);vB('vStone',px+.12,py-.95,pz,.36,.4,.4,0,stD);}
 vnLampPost(6.3,0,-3.6,3.4);vnBarrel(-4.6,0,3.9,.4,1.0,wood);vnCrate(-5.6,0,3.6,.8,.2,wood);
 vnFolk(EX+1.4,-.4,1,.3);vnFolk(-1,4.3,2,.5);}

// ---------------------------------------------------------------- the palisade: ONE modular segment, o.len metres (default 6) along local x, every part inside x = ±len/2
// Sharpened stakes on a low stone footing, two rails and raking braces behind (-z); +z is the outer face. The stake pitch
// is len/n, the first stake half a pitch in from the end, so segments laid end to end keep an even rhythm.
function buildVernPalisade(G,o){reseed(8041+(o.v|0));const L=Math.max(1,o.len||6),c=vC(0x7a5a3e),stD=vC(0x8a6a50);
 vnReg('Palisade',0,0,L/2,3.4,{part:'wall'});
 vB('vStone',0,0,0,L,.45,1.0,0,stD);for(let i=0;i<Math.max(1,Math.round(L/1.6));i++){const n=Math.max(1,Math.round(L/1.6)),w=L/n;vB('vStone',-L/2+w*(i+.5),.45,rr(-.05,.05),w-.06,.1,.9,0,stD.clone().multiplyScalar(rr(.9,1.06)));}
 const n=Math.max(2,Math.round(L/.38)),pt=L/n,r=Math.min(.17,pt*.46);
 for(let i=0;i<n;i++){const x=-L/2+pt*(i+.5),h=2.75+rr(-.2,.2),cc=c.clone().multiplyScalar(rr(.82,1.1));vPst('vPostB',x,.2,.05,r,h,cc);kput('vConeI',[x,.2+h-.02,.05],null,[r*.95,.5,r*.95],cc);}
 for(const yy of[1.1,2.3])vB('vWood',0,yy,-.19,L,.16,.14,0,c.clone().multiplyScalar(.85));
 const m=Math.max(1,Math.round(L/3));for(let i=0;i<m;i++){const x=-L/2+L*(i+.5)/m;vBeam([x,2.2,-.28],[x,.05,-1.05],.12,c.clone().multiplyScalar(.8));vB('vStone',x,0,-1.05,.36,.12,.36,0,stD);}}

// ---------------------------------------------------------------- the palisade gate: two log towers either side of a 9 m road opening, a lintel walkway, a counterweighted lifting bar (raised)
function buildVernPalisadeGate(G,o){reseed(8051+(o.v|0));const c=vC(0x7a5a3e),wood=vC(vPick(VPAL.woodMid)),trim=vC(vPick(VPAL.trim)),stD=vC(vPick(VPAL.stoneDark)),cu=vC(0xffffff),iron=vC(0x2e2a26),org=vC(0xe07a2a),cream=vC(0xf0e6cc);
 const OW=9,TW=2.2,LY=5.4;
 vnReg('Palisade gate',0,0,7,6.5,{part:'gate'});
 for(const s of[-1,1]){const tx=s*(OW/2+TW/2+.05);
  vB('vStone',tx,0,0,TW+.3,.6,TW+.3,0,stD);for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPostB',tx+sx*(TW/2-.18),.3,sz*(TW/2-.18),.22,7.0,c);
  vB('vWood',tx,.6,0,TW-.2,LY-.6,TW-.2,0,c.clone().multiplyScalar(.92));
  for(let k=0;k<5;k++){const lz=-TW/2+.25+k*(TW-.5)/4;for(const f of[-1,1]){vPst('vPostB',tx+f*(TW/2-.06),.6,lz,.12,LY-.4+rr(-.15,.15),c.clone().multiplyScalar(rr(.85,1.08)));}}   // vertical stakes cladding the inner and outer faces
  vB('vWood',tx,LY,0,TW+.3,.22,TW+.3,0,wood);for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',tx+sx*(TW/2-.05),LY+.22,sz*(TW/2-.05),.06,1.0,wood);
  for(const sz of[-1,1])vB('vWood',tx,LY+1.05,sz*(TW/2-.05),TW+.2,.1,.1,0,wood);vB('vWood',tx+s*(TW/2-.05),LY+1.05,0,.1,.1,TW+.2,0,wood);
  vnPyrRoof('vPyrCu',tx,7.3,0,TW,TW,1.4,0,cu,.12);vBall('vFinial',tx,8.55,0,.2);
  vnDoor(tx,0,-(TW-.2)/2,Math.PI,.9,2.0,'vWood',wood,trim,false);
  vgBanner(tx,4.9,TW/2+.18,0,1.3,2.6,org);vnLamp(s*OW/2,3.4,0,-s*Math.PI/2);}
 // the lintel: a heavy beam and a plank walkway between the towers, knee braces, the name board
 vB('vWood',0,LY-.6,0,OW+.6,.6,.55,0,c.clone().multiplyScalar(.8));vB('vWood',0,LY,0,OW+.4,.12,1.4,0,wood);for(const sz of[-1,1])vB('vWood',0,LY+.95,sz*.65,OW+.4,.1,.1,0,wood);
 for(let i=0;i<=6;i++)for(const sz of[-1,1])vPst('vPost',-OW/2+OW*i/6,LY+.12,sz*.65,.05,.9,wood);
 for(const s of[-1,1])vBeam([s*OW/2,LY-1.8,0],[s*(OW/2-1.4),LY-.6,0],.18,c.clone().multiplyScalar(.8));
 vB('vWood',0,LY-1.5,.34,3.6,.9,.08,0,trim);vnStrip(0,LY-1.42,.38,0,2.6,.74,'vWood',wood);
 // the lifting bar: a pivot frame by the west tower, a striped pole raised high, a stone counterweight; the rest fork by the east tower
 {const px=-OW/2+.4,pz=1.2,py=1.9,a=1.36,BL=9.4;for(const sz of[-1,1])vPst('vPostB',px,0,pz+sz*.28,.14,py+.35,c);vBq('vIron',px,py,pz,.12,.12,.7,null,iron);
  for(let k=0;k<6;k++){const t=(k+.5)/6*BL;kput('vWood',[px+t*Math.cos(a),py+t*Math.sin(a),pz],qEuler(0,0,a-Math.PI/2),[.2,BL/6+.01,.2],k%2?cream:org);}
  kput('vWood',[px-.6*Math.cos(a),py-.6*Math.sin(a),pz],qEuler(0,0,a-Math.PI/2),[.2,1.2,.2],c);vB('vStone',px-1.2*Math.cos(a),py-1.2*Math.sin(a)-.3,pz,.6,.6,.6,0,stD);
  vPst('vPostB',OW/2-.5,0,pz,.13,1.5,c);for(const s of[-1,1])vB('vWood',OW/2-.5+s*.12,1.5,pz,.06,.3,.1,0,c);}
 vnPaving(0,.02,0,OW-.4,3.6,0,stD,12);}

// ---------------------------------------------------------------- the mustering ground: an open drill yard inside a low wall, a gap to the front, a flagpole, weapon racks, pells, butts, a reviewing stand
function buildVernMusteringGround(G,o){reseed(8061+(o.v|0));const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodMid)),trim=vC(vPick(VPAL.trim)),cu=vC(0xffffff),org=vC(0xe07a2a);
 const XW=42,ZD=30,WH=1.1,T=.5,GAP=8;
 vnReg('Mustering ground',0,0,22,4,{type:['military','civic']});
 vB('vClayB',0,-.1,0,XW,.12,ZD,0,vC(0xc8a272));
 vfWall(0,-ZD/2,XW+T,0,WH,T,stD,st,0);for(const s of[-1,1])vfWall(s*XW/2,0,ZD,Math.PI/2,WH,T,stD,st,0);
 {const L=XW/2-GAP/2;for(const s of[-1,1])vfWall(s*(GAP/2+L/2),ZD/2,L,0,WH,T,stD,st,0);for(const s of[-1,1])vfPier(s*(GAP/2+.4),ZD/2,1.0,2.1,st,cu);}
 for(const sx of[-1,1]){for(const sz of[-1,1])vnLampPost(sx*(XW/2-1.6),0,sz*(ZD/2-1.6),3.6);vnLampPost(sx*(GAP/2+1.2),0,ZD/2-1.4,3.4);}
 vnPaving(0,.04,ZD/2-6,3.4,12,0,stD,14);
 // the reviewing stand at the back: a timber deck on posts, steps, a rail, orange drapes, a copper shed roof on tall posts, chairs
 {const SZ=-ZD/2+2.6,SW=12,SDp=4.4,DH=1.5,FZs=SZ+SDp/2;
  for(let i=0;i<=4;i++)for(const sz of[-1,1])vPst('vPostB',-SW/2+.3+(SW-.6)*i/4,0,SZ+sz*(SDp/2-.25),.16,DH,wood);
  vB('vWood',0,DH-.25,SZ,SW,.25,SDp,0,wood);vB('vWood',0,0,SZ-SDp/2+.1,SW,DH,.1,0,wood.clone().multiplyScalar(.8));
  vfSteps(0,0,FZs+.85,0,2.4,DH,5,'vWood',wood);
  for(const s of[-1,1]){const L=SW/2-1.4;vB('vWood',s*(1.4+L/2),DH+.95,FZs-.1,L,.1,.1,0,wood);for(let k=0;k<=4;k++)vPst('vPost',s*(1.4+L*k/4),DH,FZs-.1,.05,.95,wood);
   vPl('vCloth',s*(1.4+L/2),DH-.7,FZs+.03,L,1.2,0,org);}
  for(const x of[-SW/2+.3,0,SW/2-.3])vPst('vPost',x,DH,SZ-SDp/2+.3,.11,3.0,trim);for(const x of[-SW/2+.3,SW/2-.3])vPst('vPost',x,DH,FZs-.3,.11,3.0,trim);
  vnShedRoof(0,DH+3.0,SZ,SW,SDp,.6,0,'vCopperB',cu,.4,.12);
  for(let k=0;k<5;k++){const x=-3+k*1.5;vB('vWood',x,DH,SZ-.6,.55,.45,.55,0,trim);vB('vWood',x,DH+.45,SZ-.85,.55,.6,.08,0,trim);}
  vnBannerPole(-SW/2-.8,0,FZs,0,6,org);vnBannerPole(SW/2+.8,0,FZs,0,6,org);}
 vfFlagpole(-10.5,-ZD/2+3.2,12,org);
 // weapon racks along the side walls, pells on the left, archery butts on the right, water and stores by the gap
 for(const s of[-1,1])for(const z of[-7,-1,5])vgSpearRack(s*(XW/2-1.0),z,Math.PI/2,6,wood);
 for(let k=0;k<5;k++){const x=-15+k*2.4;vPst('vPostB',x,0,4,.16,2.0,vC(0x6a5a48));vB('vWood',x,1.5,4,.9,.12,.12,0,vC(0x6a5a48));}
 for(let k=0;k<3;k++){const x=11+k*3;vPst('vStave',x,0,-7,.7,1.4,vC(0xc8a870));vBq('vHoop',x,.9,-7+.72,.4,.4,1,null,vC(0xc9442a));}
 for(const s of[-1,1]){vnWaterButt(s*(GAP/2+2.4),0,ZD/2-2.6,.5,1.1);vnCrate(s*(GAP/2+3.6),0,ZD/2-2.4,.9,.3,wood);}
 vfFormation(0,2,4,6,0);
 for(const x of[-1.5,1.2]){kput('figB',[x,1.5,-12.6],null,1,vC(0x7a3d8a));kput('figH',[x,1.5,-12.6],null,1,vC(0xc9a17e));}}

// ---------------------------------------------------------------- the rest stop on the cliff trail. v0: cut into the rock (the back of the plot, -z, is the cliff); v1: built out on the cliff edge (+z is the drop)
function buildVernRestStop(G,o){reseed(8071+(o.v|0));const wood=vC(vPick(VPAL.woodMid)),trim=vC(vPick(VPAL.trim)),org=vC(vPick(VPAL.awning)),rock=vC(0xa8583a),rockD=vC(0x8a4630),rockL=vC(0xc07a50),fl=vC(0x9a6a4a);
 if((o.v|0)===1){vfRestStopCliff(o,wood,trim,org,rock,rockD,rockL,fl);return;}
 vnReg('Rest stop (rock-cut)',0,-2,9,9,{type:['infrastructure'],part:'rock-cut'});
 const FZ=-.6,RH=8.6,CZ0=-5.2,CZ1=-1.6,CH=3.6,OW=2.4;   // cliff face, rock height, chamber back/front, chamber height, arch half-width
 // the rock: blocks round a chamber, so the cliff reads solid and the room is carved into it
 // (the mass is plaster-textured, tinted rock red: it reads as weathered rock, where the coursed ashlar read as a brick wall;
 // what the masons dressed, the arch, its frame, the benches, is ashlar)
 for(const s of[-1,1])vB('vPlaster',s*7,0,(-6+FZ)/2,4,RH,-FZ+6,0,rock);
 vB('vPlaster',0,0,(-6+CZ0)/2,10,RH,CZ0+6,0,rock);vB('vPlaster',0,CH,(CZ0+FZ)/2,10,RH-CH,FZ-CZ0,0,rock);
 for(const s of[-1,1])vB('vPlaster',s*(OW+(5-OW)/2),0,(CZ1+FZ)/2,5-OW,CH,FZ-CZ1,0,rock);
 for(const s of[-1,1]){vB('vStone',s*(OW-.225),2.9,(CZ1+FZ)/2,.45,.35,FZ-CZ1,0,rockL);vB('vStone',s*(OW-.45),3.25,(CZ1+FZ)/2,.9,.35,FZ-CZ1,0,rockL);}   // the corbelled arch
 // a ragged skyline and lumps standing proud of the face, so the cliff does not read as a box
 for(let i=0;i<6;i++){const x=-7.5+i*3+rr(-.4,.4);vB('vPlaster',x,RH-.1,rr(-4.8,-3.2),rr(2.2,3.2),rr(.4,1.5),rr(2.2,3.4),rr(-.2,.2),rock.clone().multiplyScalar(rr(.85,1.08)));}
 for(let i=0;i<10;i++){const x=rng()<.5?rr(-8.4,-5.6):rr(5.6,8.4),y=rr(2.4,RH-1.2);if(x>5.4&&y<3.4)continue;
  kput('vPlaster',[x,y,FZ+.08],qEuler(rr(-.2,.2),rr(-.3,.3),rr(-.3,.3)),[rr(.8,1.8),rr(.5,1.3),rr(.3,.6)],rock.clone().multiplyScalar(rr(.8,1.05)));}
 for(let i=0;i<4;i++)kput('vPlaster',[rr(-3.6,3.6),rr(5.6,RH-.6),FZ+.08],qEuler(rr(-.2,.2),rr(-.3,.3),rr(-.3,.3)),[rr(.8,1.6),rr(.5,1.0),rr(.3,.5)],rock.clone().multiplyScalar(rr(.8,1.05)));
 vB('vStone',0,0,(CZ0+CZ1)/2,10,.2,CZ1-CZ0,0,fl);vB('vStone',0,0,(CZ1+FZ)/2,2*OW,.2,FZ-CZ1,0,fl);
 // strata ledges, boulders on the top and at the foot
 for(const y of[5.1,7.3])for(let i=0;i<6;i++){const x=-7.5+i*3;vB('vPlaster',x,y+rr(-.15,.15),FZ+.12,2.95,rr(.25,.45),.3,0,rockD);}
 for(let i=0;i<9;i++)kput('vRock',[rr(-7.6,7.6),RH+rr(-.1,.2),rr(-4.8,-1.8)],qEuler(rng(),rng(),0),[rr(.5,1.2),rr(.35,.8),rr(.5,1.1)],rock.clone().multiplyScalar(rr(.85,1.1)));
 for(let i=0;i<6;i++){const x=rr(-8.3,-5.4);kput('vRock',[x,.15,FZ+rr(.2,.6)],qEuler(rng(),rng(),0),[rr(.3,.6),rr(.25,.45),rr(.3,.55)],rockD);}
 // the carved frame round the arch: stepped pilasters and lintel in lighter stone, fluted strips, the Iziz orange in paint
 for(const s of[-1,1]){vB('vStone',s*(OW+.3),0,FZ+.12,.5,3.3,.25,0,rockL);vnStrip(s*4.1,.7,FZ,0,.6,2.6,'vStone',rockL);}
 vB('vStone',0,3.6,FZ+.12,6.0,.4,.25,0,rockL);vB('vStone',0,4.0,FZ+.1,4.8,.35,.2,0,rockL);vB('vStone',0,4.35,FZ+.08,3.4,.3,.16,0,vC(0xe07a2a));
 // the timber screen filling the arch, with its door and two small windows
 {const sz=(CZ1+FZ)/2;for(const s of[-1,1])vB('vWood',s*(OW+.62)/2,.2,sz,OW-.62,2.7,.12,0,wood);vB('vWood',0,2.55,sz,1.24,.35,.12,0,wood);
  vB('vWood',0,2.9,sz,2*OW-.9,.35,.12,0,wood);vB('vWood',0,3.25,sz,2*OW-1.8,.35,.12,0,wood);
  vnDoor(0,.2,sz+.07,0,1.1,2.25,'vWood',wood,trim,false);for(const s of[-1,1])vnWin(s*1.6,1.3,sz+.07,0,.6,.7,'open','vWood',wood);}
 // the shrine niche cut into the face west of the arch: a dark recess on a sill, a little stone figure, pots and a flame
 {const nx=-7.2,ny=1.25;vB('vDarkB',nx,ny,FZ+.03,1.0,1.3,.1,0);vB('vStone',nx,ny-.18,FZ+.18,1.4,.18,.4,0,rockL);vB('vStone',nx,ny+1.3,FZ+.15,1.4,.22,.34,0,rockL);vB('vStone',nx,ny+1.52,FZ+.12,.9,.18,.28,0,vC(0xe07a2a));
  vPst('vPostS',nx,ny,FZ+.2,.16,.5,rockL);vBall('vRock',nx,ny+.62,FZ+.2,.16,rockL);for(const s of[-1,1])vPst('vClayPot',nx+s*.42,ny,FZ+.24,.1,.24,vC(0x9a5a38));vBall('vEmber',nx+.25,ny+.08,FZ+.3,.05);}
 // stone benches along the face under the awning
 for(const s of[-1,1])vB('vStone',s*(OW+1.6),0,FZ+.45,2.0,.45,.6,0,rockL);vB('vStone',-7.2,0,FZ+.45,2.4,.45,.6,0,rockL);
 // the cistern against the face east of the arch, fed by a carved spout; the stone trough for the camels in front
 {const cx=7.3;vB('vStone',cx,0,FZ+1.1,2.8,1.1,2.2,0,rockD);vB('vWinGlass',cx,1.0,FZ+1.1,2.3,.08,1.7,0);vB('vStone',cx,2.3,FZ+.25,.5,.3,.6,0,rockL);
  vPst('vPost',cx+1.15,0,FZ+2.35,.07,3.0,wood);vBeam([cx+1.15,2.95,FZ+2.35],[cx,2.95,FZ+1.1],.06,wood);vPst('vRope',cx,1.6,FZ+1.1,.015,1.35,vC(0xa89878));vnBarrel(cx,1.25,FZ+1.1,.18,.35,wood);
  vfStoneTrough(5.8,3.4,5.0,0,rockD);}
 // the canvas shade awning from the face out over the benches, on two poles with guy ropes; the hitching rail; travellers' goods
 {const y0=4.7,y1=2.6,z1=4.0,len=Math.hypot(z1-FZ,y0-y1),a=Math.atan2(y0-y1,z1-FZ);kput('vClothB',[0,(y0+y1)/2,(FZ+z1)/2],vQ(0,a,0),[10,.05,len],org);
  for(const s of[-1,1]){vPst('vPost',s*4.8,0,z1,.07,y1+.05,wood);vBeam([s*4.8,y1,z1],[s*5.6,0,5.6],.025,vC(0xa89878),'vRope');vB('vWood',s*5.6,0,5.6,.12,.25,.12,0,wood);}
  for(let k=0;k<5;k++)vB('vIron',-4.8+k*2.4,y0-.05,FZ+.08,.1,.1,.16,0,vC(0x2e2a26));}
 vfHitch(-5.8,4.4,5.0,0,wood);vnSacks(-2.6,0,2.4,4);kput('vThatchB',[-7.6,.35,2.2],qEuler(0,.3,0),[1.4,.7,1.0],vC(vPick(VPAL.thatch)));for(let k=0;k<3;k++)vPst('vClayPot',2.4+k*.5,0,1.1,.2,.6,vC(vPick([0x9a5a38,0xb87a4a])));
 vnPaving(0,.02,1.6,10,3.4,0,fl,14);vnFolk(-1,2.8,3,1.6);}
// variant 1: the platform built out on the cliff edge (+z is the drop)
function vfRestStopCliff(o,wood,trim,org,rock,rockD,rockL,fl){const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),sh=vC(vPick([0x8a6a4a,0x7a5a3e,0x9a7a56]));
 vnReg('Rest stop (cliff platform)',0,0,9.5,6,{type:['infrastructure'],part:'cliff platform'});
 // the platform and its battered retaining wall: four courses, each set back, from 4.2 m below the plot down to a rock ledge
 vB('vStone',0,-.3,-.5,18,.3,11,0,fl);vnPaving(0,.02,-.5,17.4,10.6,0,stD,40);
 for(let k=0;k<4;k++){const zo=6.0-.15*k;vB('vStone',0,-4.2+1.05*k,zo-1.1,18,1.05,2.2,0,stD.clone().multiplyScalar(1-.04*k));}
 vB('vPlaster',0,-5.4,3.4,18,1.2,5.2,0,rock);
 // the corbel table under a projecting string course, the parapet on top
 vB('vStone',0,-.35,5.75,18,.35,.4,0,st);for(let i=0;i<12;i++){const x=-8.25+i*1.5;vB('vStone',x,-1.0,5.62,.45,.35,.14,0,st);vB('vStone',x,-.65,5.68,.45,.3,.26,0,st);}
 vB('vStone',0,0,5.25,18,.95,.5,0,st);vB('vStone',0,.95,5.25,18,.14,.66,0,stD);
 // the shelter house: rubble stone walls, a timber cornice, a shingle hip roof, a stone chimney on the back wall; the door on the east end
 const HX=-5.8,HZ=-2.3,HW=5.6,HD=5.2,HH=2.8,Y0=.15;
 vB('vStone',HX,0,HZ,HW+.3,Y0,HD+.3,0,stD);vB('vStone',HX,Y0,HZ,HW,HH,HD,0,rockL);const t=vnCornice('vWood',HX,Y0+HH,HZ,HW,HD,0,wood,1,false);
 vnHipRoof('vHipS',HX,t,HZ,HW,HD,1.8,0,sh,.3);
 vB('vStone',HX-1.0,0,HZ-HD/2-.45,.9,t+2.2,.9,0,st);vB('vStone',HX-1.0,t+2.2,HZ-HD/2-.45,1.1,.14,1.1,0,stD);
 vnDoor(HX+HW/2,Y0,HZ,Math.PI/2,1.0,2.1,'vWood',wood,trim,false);vnAwning(HX+HW/2,2.3,HZ,Math.PI/2,2.6,1.4,org);
 vnWin(HX+1.2,Y0+1.1,HZ+HD/2,0,.9,.9,'open','vWood',wood,true);vnWin(HX-HW/2,Y0+1.2,HZ+.6,-Math.PI/2,.7,.7,'shut','vWood',wood);
 // the cistern and trough on the trail side (-z), the hitching rail, a shade with a bench along the parapet
 {vB('vStone',6.8,0,-4.6,3.6,1.2,2.2,0,stD);vB('vWinGlass',6.8,1.1,-4.6,3.1,.08,1.7,0);vfStoneTrough(1.8,-5.0,5.4,0,stD);
  vPst('vPipe',4.9,.7,-4.6,.05,.6,vC(0x2e2a26));kput('vPipe',[4.7,1.25,-4.6],qEuler(0,0,Math.PI/2),[.05,.5,.05],vC(0x2e2a26));}
 vfHitch(2.4,-2.4,7.0,0,wood);
 {for(const x of[.4,5.8])for(const z of[1.8,4.6])vPst('vPost',x,0,z,.08,2.8,wood);for(const z of[1.8,4.6])vB('vWood',3.1,2.7,z,5.6,.14,.14,0,wood);
  kput('vClothB',[3.1,2.95,3.2],vQ(0,-.08,0),[6.0,.05,3.4],org);vB('vStone',3.1,0,4.75,5.4,.45,.5,0,rockL);vB('vWood',3.1,0,3.2,1.6,.75,.9,0,wood);}
 vnBarrel(-1.6,0,1.2,.4,.95,wood);vnSacks(-1.0,0,-.4,3);vnFolk(2.6,.6,3,1.6);}

VERN.def({key:'vern_governor_palace',name:"Governor's Palace",family:'civic',tags:{type:['civic','single-family dwelling'],wealth:'civic',lit:true},w:42,d:36,h:24,build:buildVernGovernorPalace});
VERN.def({key:'vern_guard_tower',name:'Guard tower and barracks',family:'civic',tags:{type:['military','civic'],wealth:'civic',lit:true},w:26,d:20,h:19,build:buildVernGuardTower});
VERN.def({key:'vern_watch_house',name:'Watch house',family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:true},w:10,d:9,h:11,build:buildVernWatchHouse});
VERN.def({key:'vern_toll_house',name:'Toll house',family:'civic',tags:{type:['civic','infrastructure'],wealth:'civic',lit:true},w:14,d:10,h:11,build:buildVernTollHouse});
VERN.def({key:'vern_palisade',name:'Palisade (segment)',family:'infrastructure',tags:{type:['infrastructure','military'],wealth:'civic',lit:false},w:6,d:2.6,h:3.6,build:buildVernPalisade});
VERN.def({key:'vern_palisade_gate',name:'Palisade gate',family:'infrastructure',tags:{type:['infrastructure','military'],wealth:'civic',lit:true},w:14,d:4,h:12,build:buildVernPalisadeGate});
VERN.def({key:'vern_mustering_ground',name:'Mustering ground',family:'civic',tags:{type:['military','civic'],wealth:'civic',lit:true},w:44,d:32,h:13,build:buildVernMusteringGround});
VERN.def({key:'vern_rest_stop',name:'Rest stop',family:'infrastructure',tags:{type:['infrastructure'],wealth:'middle',lit:false},w:18,d:12,h:9,build:buildVernRestStop});
