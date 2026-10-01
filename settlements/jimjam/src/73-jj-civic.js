// Jimjam civic buildings: the library, the school and the amphitheater. Local frame: origin at the
// plot centre on the ground, +z is the front, y up. Seeds 9350-9399.
// Uses the arched-bay helpers of 72-jj-hospitality.js (jjHospBay, jjHospRow, jjHospArchWin, ...).

// A podium without gaps (the shared jjPlinth leaves open slits between its three courses).
function jjCivPlinth(jjX,jjY,jjZ,jjW,jjH,jjD,jjO){jjO=jjO||{};jjBox(jjX,jjY+.22,jjZ,jjW+.24,.44,jjD+.24,'brickDark');jjBox(jjX,jjY+(jjH-.3)/2,jjZ,jjW-.2,jjH-.3,jjD-.2,jjO.mat||'brickDeep');
 jjBox(jjX,jjY+jjH*.55,jjZ,jjW-.08,.22,jjD-.08,'brickYellow');jjBox(jjX,jjY+jjH-.17,jjZ,jjW+.1,.34,jjD+.1,'marble');}
// marble stairs with stepped brick cheek blocks either side (base y; the top step meets a face at z-run/2)
function jjCivStairs(jjX,jjY,jjZ,jjW,jjRun,jjRise,jjSteps,jjRy){jjStairs(jjX,jjY,jjZ,jjW,jjRun,jjRise,jjSteps,jjRy,{mat:'marble'});
 jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{for(const jjS of [-1,1])for(let jjI=0;jjI<3;jjI++){const jjL=jjRun*(1-jjI/3),jjHh=jjRise*(jjI+1)/3+.45;jjBox(jjX+jjS*(jjW/2+.45),jjY+jjHh/2,jjZ-jjRun/2+jjL/2,.9,jjHh,jjL,jjI===2?'marble':'brick');}});}
// a small open pavilion (chhatri): four patterned columns, a slab and a gold onion dome (base y)
function jjCivChhatri(jjX,jjY,jjZ,jjR){const jjC=jjR*.8;jjBox(jjX,jjY+.15,jjZ,jjR*2.3,.3,jjR*2.3,'marble');
 for(const jjA of [-1,1])for(const jjB of [-1,1])jjColumn(jjX+jjA*jjC,jjY+.3,jjZ+jjB*jjC,jjR*.13,jjR*1.6,{pattern:'diamond',base:false});
 jjBox(jjX,jjY+.3+jjR*1.6+.12,jjZ,jjR*2.3,.24,jjR*2.3,'brickYellow');jjBox(jjX,jjY+.3+jjR*1.6+.32,jjZ,jjR*2.5,.16,jjR*2.5,'marble');jjDome(jjX,jjY+.3+jjR*1.6+.4,jjZ,jjR*1.05,{kind:'gold',shape:'onion'});}

// ---------------------------------------------------------------------------------------------
// LIBRARY: a podium with a wide marble stair; a square reading hall under a tall windowed drum and a
// great gold dome with a lantern; a yellow pishtaq entrance; two-storey arcaded wings either side.
const JJCIV_LIB={P:2.4,hallH:13};
function buildJjCivLibrary(jjG,jjO){reseed(9350+(jjO.v|0));
 const jjP=JJCIV_LIB.P,jjHh=JJCIV_LIB.hallH,jjPi=Math.PI,jjHz=-1,jjWh=9.2,jjSt=4.6;
 jjCivPlinth(0,0,1.25,45,jjP,25.5);jjCivStairs(0,0,14+2.6,16,5.2,jjP,8,0);
 // the reading hall
 jjBox(0,jjP+jjHh/2,jjHz,18,jjHh,18,'brick');jjHospRing4(0,jjHz,18,18,jjP+jjHh-.1,.5,.36,'marble');jjHospRing4(0,jjHz,18,18,jjP+jjWh+.1,.26,.16,'brickYellow');
 jjHospParapet(0,jjP+jjHh+.15,jjHz,18.6,18.6,.45,1.2);
 for(const jjX of [-5,0,5])jjHospArchWin(jjX,jjP+2.6,jjHz-9,2,7.4,jjPi,{lit:true,mullion:true});
 for(const jjS of [-1,1]){jjHospArchWin(jjS*9,jjP+2.6,-7,1.8,6.6,jjS*jjPi/2,{lit:true,mullion:true});for(const jjZ of [-2.5,3.5])jjPorthole(jjS*9.02,jjP+11.2,jjZ,jjS*jjPi/2,.75);
  for(const jjZ of [-10,8])jjTurret(jjS*8.2,jjP+jjHh+.15,jjZ+(jjZ<0?.8:-.8),.75,2.4,{kind:'gold',shape:'onion',pattern:'ogee'});}
 // drum with tall arched windows between pilasters, the gold dome and its lantern
 const jjD0=jjP+jjHh+.15,jjDr=7,jjDh=6.2;jjCylinder(0,jjD0+.4,jjHz,jjDr+.6,.8,'brickYellow',undefined,32);jjCylinder(0,jjD0+.8+jjDh/2,jjHz,jjDr,jjDh,'brick',undefined,32);
 jjCylinder(0,jjD0+.8+jjDh+.15,jjHz,jjDr+.35,.3,'marble',undefined,32);jjCylinder(0,jjD0+6.35,jjHz,jjDr+.06,.2,'brickYellow',undefined,32);
 for(let jjI=0;jjI<12;jjI++){const jjA=(jjI+.5)*TAU/12,jjAp=jjI*TAU/12;jjHospArchWin(Math.cos(jjA)*jjDr,jjD0+1.6,jjHz+Math.sin(jjA)*jjDr,1.25,3.7,jjPi/2-jjA,{lit:true});
  jjBox(Math.cos(jjAp)*(jjDr+.1),jjD0+.8+jjDh/2,jjHz+Math.sin(jjAp)*(jjDr+.1),.6,jjDh,.3,'brickYellow',undefined,jjPi/2-jjAp);}
 const jjDt=jjD0+.8+jjDh+.3;jjDome(0,jjDt,jjHz,7.3,{kind:'gold',shape:'hemi',ribs:true});
 jjCylinder(0,jjDt+7.3+.55,jjHz,1.35,1.5,'brickYellow',undefined,32);for(let jjI=0;jjI<6;jjI++){const jjA=jjI*TAU/6;jjBox(Math.cos(jjA)*1.36,jjDt+7.9,jjHz+Math.sin(jjA)*1.36,.4,.75,.06,'glass',undefined,jjPi/2-jjA);}
 jjCylinder(0,jjDt+8.66,jjHz,1.55,.16,'marble',undefined,32);jjDome(0,jjDt+8.73,jjHz,1.25,{kind:'gold',shape:'onion'});
 // the pishtaq entrance: a yellow frame with a deep arch, the door and a lit lunette inside, a crenel crown
 const jjPz=8,jjPd=3.2,jjPw=13,jjPh=15.6;jjHospBay(0,jjP,jjPz+jjPd/2,jjPw,jjPh,6.2,5.8,0,{depth:jjPd,mat:'brickYellow'});
 jjBox(0,jjP+jjPh-.3,jjPz+jjPd/2,jjPw+.4,.6,jjPd+.4,'brickDeep');jjBox(0,jjP+jjPh+.08,jjPz+jjPd/2,jjPw+.8,.26,jjPd+.8,'marble');jjHospParapet(0,jjP+jjPh+.2,jjPz+jjPd/2,jjPw+.4,jjPd+.4,.42,1.3);
 for(const jjS of [-1,1]){jjBox(jjS*(jjPw/2-.3),jjP+jjPh/2,jjPz+jjPd+.1,.45,jjPh-.8,.24,'marble');jjBox(jjS*4.0,jjP+(jjPh-1.6)/2,jjPz+jjPd+.08,.3,jjPh-1.6,.2,'marble');}
 jjBox(0,jjP+jjPh-1.4,jjPz+jjPd+.08,jjPw-.9,.3,.2,'marble');jjPorthole(0,jjP+12.2,jjPz+jjPd+.05,0,1.15);
 jjDoor(0,jjP,jjPz,2.6,4.4,0,{mat:'dark'});jjHospArchWin(0,jjP+5.3,jjPz,3.2,3.1,0,{lit:true,mullion:true});for(const jjS of [-1,1])jjHospLamp(jjS*2.1,jjP+3.3,jjPz,0);
 for(const jjS of [-1,1]){jjBanner(jjS*4.9,jjP+jjPh-2,jjPz+jjPd+.25,0,{w:1,h:3.6});jjColumn(jjS*7.75,jjP,jjPz+1.1,.36,9.4,{pattern:jjS<0?'spiral':'chevron',lattice:true});jjBox(jjS*7.75,jjP+9.55,jjPz+1.1,1.1,.3,1.1,'marble');
  jjHospArchWin(jjS*7.75,jjP+10.6,jjPz,1.2,2.2,0,{lit:true});}
 // the wings: two storeys, an arcaded loggia on the front (patterned columns below, a railed gallery above)
 for(const jjS of [-1,1]){const jjX=jjS*15;
  jjBox(jjX,jjP+jjWh/2,.5,12,jjWh,9,'brick');jjHospRing4(jjX,2,12,12,jjP+jjSt,.24,.14,'brickYellow');
  jjHospRow(jjX,jjP,7.6,12,3,jjSt,2.7,2.4,0,{depth:.8,mat:'brick'});jjHospRow(jjX,jjP+jjSt,7.6,12,3,jjWh-jjSt,2.5,2.2,0,{depth:.8,mat:'brick',rail:1});
  jjHospRow(jjX+jjS*6-jjS*.4,jjP,6.6,2.4,1,jjSt,1.5,2.4,jjS*jjPi/2,{depth:.8});jjHospRow(jjX+jjS*6-jjS*.4,jjP+jjSt,6.6,2.4,1,jjWh-jjSt,1.4,2.2,jjS*jjPi/2,{depth:.8,rail:1});
  jjBox(jjX,jjP+jjSt-.12,6.5,12,.3,3.2,'brickDeep');jjBox(jjX,jjP+jjWh+.15,2,12.6,.3,12.6,'brickDeep');jjBox(jjX,jjP+jjWh+.35,8.1,12.8,.3,1,'marble');
  jjHospParapet(jjX,jjP+jjWh+.3,2,12.6,12.6,.4,1.1);
  for(const jjCx of [jjX-2,jjX+2])jjColumn(jjCx,jjP,8.25,.24,jjSt-.2,{pattern:jjCx*jjS<15?'diamond':'fleur'});
  for(const jjCx of [jjX-4,jjX,jjX+4]){jjHospArchWin(jjCx,jjP+.9,5,1.4,2.8,0,{lit:true});jjDoor(jjCx,jjP+jjSt,5,1.2,2.5,0,{mat:'dark'});}
  for(const jjZ of [-1.5,2.5]){jjHospArchWin(jjS*21,jjP+.9,jjZ,1.4,3,jjS*jjPi/2,{lit:true,shutter:false});jjHospArchWin(jjS*21,jjP+jjSt+.8,jjZ,1.4,3,jjS*jjPi/2,{lit:true});}
  for(const jjCx of [jjX-3.5,jjX+3.5]){jjHospArchWin(jjCx,jjP+.9,-4,1.4,2.8,jjPi,{lit:true});jjHospArchWin(jjCx,jjP+jjSt+.8,-4,1.4,2.8,jjPi,{lit:true});}
  jjCivChhatri(jjS*19.4,jjP+jjWh+.3,-2.6,1.3);}
 jjHospFurn('jj_furn_brazier',-9.6,jjP,13.1,0,{lit:true});jjHospFurn('jj_furn_brazier',9.6,jjP,13.1,0,{lit:true});
 jjReg('Library reading hall and dome',0,jjHz,9.5,32.5,{});jjReg('Library west wing',-15,2,7,12,{});jjReg('Library east wing',15,2,7,12,{});jjReg('Library stair',0,16.6,8,2.4,{type:['infrastructure']});}

// ---------------------------------------------------------------------------------------------
// SCHOOL: a yellow-brick courtyard building. Classrooms round a red-arched cloister, a row of small
// terracotta domes over the classrooms, a two-storey front range with the gate and an open bell turret.
function buildJjCivSchool(jjG,jjO){reseed(9360+(jjO.v|0));
 const jjB=.5,jjPi=Math.PI,jjRh=4.6,jjFh=8.4,jjY='brickYellow';
 jjCivPlinth(0,0,0,30.8,jjB,26.8);jjStairs(0,0,14.15,5,1.1,jjB,3,0,{mat:'marble'});
 jjBox(0,jjB+.03,0,21.4,.06,17.4,'marble');jjRoundPlaza(0,jjB-.76,0,3,{raised:false,inlay:true});
 // classroom ranges and the two-storey front range (split by the gate passage)
 for(const jjS of [-1,1])jjBox(jjS*12.85,jjB+jjRh/2,0,4.3,jjRh,17.4,jjY);
 jjBox(0,jjB+jjRh/2,-10.85,30,jjRh,4.3,jjY);
 for(const jjS of [-1,1])jjBox(jjS*8.3,jjB+jjFh/2,10.85,13.4,jjFh,4.3,jjY);jjBox(0,jjB+(3.7+jjFh)/2,10.85,3.2,jjFh-3.7,4.3,jjY);
 // roofs: one slab per range over rooms and cloister walk, a red brick parapet with yellow merlons
 for(const jjS of [-1,1])jjBox(jjS*11.75,jjB+jjRh+.15,0,6.5,.3,13,'brickDeep');jjBox(0,jjB+jjRh+.15,-9.75,30,.3,6.5,'brickDeep');jjBox(0,jjB+jjFh+.15,10.85,30,.3,4.3,'brickDeep');
 jjBox(0,jjB+jjRh+.15,7.6,21.4,.3,2.2,'brickDeep');
 jjHospRing4(0,0,30,26,jjB+jjRh-.05,.36,.3,'marble');jjHospRing4(0,0,30,26,jjB+.35,.5,.16,'brick');jjHospRing4(0,0,30,26,jjB+2.3,.2,.1,'brick');
 jjCrenel(0,jjB+jjRh+.3,-12.8,30,.4,1);for(const jjS of [-1,1])jjWithYaw(jjS*14.8,jjB+jjRh+.3,-1.6,jjPi/2,()=>jjCrenel(jjS*14.8,jjB+jjRh+.3,-1.6,20.4,.4,1));
 jjHospRing4(0,10.85,30,4.3,jjB+jjFh-.05,.36,.3,'marble');jjHospParapet(0,jjB+jjFh+.3,10.85,30.4,4.7,.4,1.1);jjHospRing4(0,10.85,30,4.3,jjB+jjRh,.22,.12,'brick');
 jjBox(0,jjB+jjRh+.42,6.65,17.6,.3,.9,'marble');jjBox(0,jjB+jjRh+.42,-6.65,17.6,.3,.9,'marble');for(const jjS of [-1,1])jjBox(jjS*8.65,jjB+jjRh+.42,0,.9,.3,13.6,'marble');
 // the cloister: red arches on patterned columns, classroom doors and windows behind
 const jjO2={depth:.45,mat:'brick'},jjPats=['diamond','chevron','spiral','fleur'];let jjK=0;
 jjHospRow(0,jjB,6.5,17,5,jjRh,2.3,2.2,jjPi,jjO2);jjHospRow(0,jjB,-6.5,17,5,jjRh,2.3,2.2,0,jjO2);
 for(const jjS of [-1,1])jjHospRow(jjS*8.5,jjB,0,13,4,jjRh,2.3,2.2,-jjS*jjPi/2,jjO2);
 for(const jjX of [-8.5,8.5])for(const jjZ of [-6.5,6.5])jjBox(jjX,jjB+jjRh/2,jjZ,.8,jjRh,.8,'brick');
 for(let jjI=1;jjI<5;jjI++){const jjX=-8.5+jjI*3.4;jjColumn(jjX,jjB,6.05,.18,jjRh-.3,{pattern:jjPats[jjK++%4]});jjColumn(jjX,jjB,-6.05,.18,jjRh-.3,{pattern:jjPats[jjK++%4]});}
 for(let jjI=1;jjI<4;jjI++){const jjZ=-6.5+jjI*3.25;for(const jjS of [-1,1])jjColumn(jjS*8.05,jjB,jjZ,.18,jjRh-.3,{pattern:jjPats[jjK++%4]});}
 for(let jjI=0;jjI<5;jjI++){const jjX=-8.5+(jjI+.5)*3.4;if(jjI!==2)jjHospArchWin(jjX,jjB+1,8.7,1.2,2.2,jjPi,{lit:true});jjI%2?jjHospArchWin(jjX,jjB+1,-8.7,1.2,2.2,0,{lit:true}):jjDoor(jjX,jjB,-8.7,1.1,2.4,0,{mat:'wood'});}
 for(const jjS of [-1,1])for(let jjI=0;jjI<4;jjI++){const jjZ=-6.5+(jjI+.5)*3.25;jjI%2?jjDoor(jjS*10.7,jjB,jjZ,1.1,2.4,-jjS*jjPi/2,{mat:'wood'}):jjHospArchWin(jjS*10.7,jjB+1,jjZ,1.2,2.2,-jjS*jjPi/2,{lit:true});}
 // small terracotta domes over the classrooms
 const jjDy=jjB+jjRh+.3;for(const jjS of [-1,1])for(const jjZ of [-4.4,0,4.4]){jjCylinder(jjS*12.85,jjDy+.35,jjZ,1.75,.7,jjY,undefined,32);jjCylinder(jjS*12.85,jjDy+.74,jjZ,1.85,.1,'marble',undefined,32);jjDome(jjS*12.85,jjDy+.78,jjZ,1.7,{kind:'terracotta',shape:'hemi'});}
 for(const jjX of [-9,-3,3,9]){jjCylinder(jjX,jjDy+.35,-10.85,1.75,.7,jjY,undefined,32);jjCylinder(jjX,jjDy+.74,-10.85,1.85,.1,'marble',undefined,32);jjDome(jjX,jjDy+.78,-10.85,1.7,{kind:'terracotta',shape:'hemi'});}
 jjChimneyStack(12.9,jjDy,-10.85,{n:2,h:2.2,r:.3,seed:5});
 // the front: a red gate frontispiece, two floors of windows, portholes, lamps
 jjHospBay(0,jjB,13.5,7.2,jjFh+1.6,2.8,2.2,0,{depth:1,mat:'brick'});jjBox(0,jjB+jjFh+1.75,13.5,7.6,.3,1.4,'marble');jjCrenel(0,jjB+jjFh+1.9,13.5,7.2,.6,1.1);
 jjHospArchWin(0,jjB+4.8,14,1.6,2.6,0,{lit:true,mullion:true});jjPorthole(-2.3,jjB+6.1,14.02,0,.55);jjPorthole(2.3,jjB+6.1,14.02,0,.55);for(const jjS of [-1,1])jjHospLamp(jjS*2.2,jjB+2.6,14,0);
 for(const jjX of [-12.5,-8.5,-4.8,4.8,8.5,12.5]){jjHospArchWin(jjX,jjB+1,13,1.3,2.4,0,{lit:true,shutter:Math.abs(jjX)>6});jjHospArchWin(jjX,jjB+jjRh+.6,13,1.2,2.2,0,{lit:true});}
 for(const jjS of [-1,1])for(const jjZ of [-9,-3,3])jjHospArchWin(jjS*15,jjB+1,jjZ,1.2,2.2,jjS*jjPi/2,{lit:true});
 for(const jjS of [-1,1]){jjHospArchWin(jjS*15,jjB+1,10.85,1.2,2.2,jjS*jjPi/2,{lit:true});jjPorthole(jjS*15.02,jjB+6.3,10.85,jjS*jjPi/2,.6);}
 for(const jjX of [-10,-5,0,5,10])jjHospArchWin(jjX,jjB+1,-13,1.2,2.2,jjPi,{lit:true});
 // the bell turret: an open arched belfry on a yellow base over the gate, a gold onion dome, the bell
 const jjBy=jjB+jjFh+.3,jjBz=11.2,jjBw=3.2;jjBox(0,jjBy+.6,jjBz,jjBw,1.2,jjBw,jjY);jjBox(0,jjBy+1.27,jjBz,jjBw+.3,.14,jjBw+.3,'marble');
 for(let jjI=0;jjI<4;jjI++){const jjA=jjI*jjPi/2;jjHospBay(Math.sin(jjA)*(jjBw/2-.17),jjBy+1.34,jjBz+Math.cos(jjA)*(jjBw/2-.17),jjBw,2.8,1.8,1.4,jjA,{depth:.34,mat:'brick'});}
 jjBox(0,jjBy+4.3,jjBz,jjBw+.4,.3,jjBw+.4,'marble');jjCylinder(0,jjBy+4.65,jjBz,1.2,.4,jjY,undefined,32);jjDome(0,jjBy+4.85,jjBz,1.4,{kind:'gold',shape:'onion'});
 jjPut('jjciv_bell',new THREE.CylinderGeometry(.22,.5,.75,16),JMAT.gold,0,jjBy+2.75,jjBz,1,1,1);jjBeam([-1.4,jjBy+3.25,jjBz],[1.4,jjBy+3.25,jjBz],.08,'wood');
 for(const jjS of [-1,1])jjBanner(jjS*6.65,jjB+jjFh-.4,13.1,0,{w:.9,h:3});
 for(const jjS of [-1,1])jjHospFurn('jj_furn_bench',jjS*10.1,jjB,0,-jjS*jjPi/2);
 jjReg('School court and cloister',0,0,8.5,jjRh,{});jjReg('School bell turret',0,jjBz,2,jjBy+6.5,{});}

// ---------------------------------------------------------------------------------------------
// AMPHITHEATER: a semicircular cavea (open side to +z) of brick seat rows with marble edges, swept as
// a few meshes; a praecinctio with vomitorium doors; a two-storey outer arcade; the stage, its
// two-storey scaenae frons and two thick spires behind it; tribunals over the side entrances.
const JJCIV_AMP={zc:10,T:.85,R:.42,n1:15,n2:12,r0:11.5,pod:1.2,walk:2,balt:2.6,top:2,Rf:39.0,NF:31};
// the cavea profile as line segments [r0,y0,r1,y1,material], from the orchestra outward
function jjCivAmpProfile(){const jjC=JJCIV_AMP,jjSeg=[];let jjR=jjC.r0,jjY=0;
 const jjRow=()=>{jjSeg.push([jjR,jjY,jjR+.34,jjY,'marble'],[jjR+.34,jjY,jjR+jjC.T,jjY,'brickDeep']);jjR+=jjC.T;jjSeg.push([jjR,jjY,jjR,jjY+jjC.R-.1,'brick'],[jjR,jjY+jjC.R-.1,jjR,jjY+jjC.R,'marble']);jjY+=jjC.R;};
 jjSeg.push([jjR,0,jjR,jjC.pod-.14,'marble'],[jjR,jjC.pod-.14,jjR,jjC.pod,'marble']);jjY=jjC.pod;
 for(let jjI=0;jjI<jjC.n1;jjI++)jjRow();const jjLow={r:jjR,y:jjY};
 jjSeg.push([jjR,jjY,jjR+jjC.walk,jjY,'marble']);jjR+=jjC.walk;const jjBalt={r:jjR,y:jjY};jjSeg.push([jjR,jjY,jjR,jjY+jjC.balt-.16,'brick'],[jjR,jjY+jjC.balt-.16,jjR,jjY+jjC.balt,'marble']);jjY+=jjC.balt;
 for(let jjI=0;jjI<jjC.n2;jjI++)jjRow();jjSeg.push([jjR,jjY,jjC.Rf+.2,jjY,'brickDeep']);
 return {seg:jjSeg,low:jjLow,balt:jjBalt,topY:jjY,topR:jjR};}
// sweep the profile round the y axis from angle a0 to a1 (x = r cos a, z = -r sin a); one geometry per material
function jjCivSweepGeos(jjSegs,jjA0,jjA1,jjN){const jjBy={};
 for(const jjS of jjSegs){const jjM=jjS[4];const jjB=jjBy[jjM]||(jjBy[jjM]={p:[],n:[],u:[]});const [jjR0,jjY0,jjR1,jjY1]=jjS,jjDr=jjR1-jjR0,jjDy=jjY1-jjY0,jjL=Math.hypot(jjDr,jjDy),jjNr=-jjDy/jjL,jjNy=jjDr/jjL,jjRm=(jjR0+jjR1)/2;
  const jjPt=(jjR,jjY,jjA)=>[jjR*Math.cos(jjA),jjY,-jjR*Math.sin(jjA)],jjNo=jjA=>[jjNr*Math.cos(jjA),jjNy,-jjNr*Math.sin(jjA)];
  // winding: (B-A)x(D-A) must agree with the outward normal
  const jjAm=(jjA0+jjA1)/2,jjPa=jjPt(jjR0,jjY0,jjA0),jjPb=jjPt(jjR0,jjY0,jjA1),jjPd=jjPt(jjR1,jjY1,jjA0),jjE1=[jjPb[0]-jjPa[0],jjPb[1]-jjPa[1],jjPb[2]-jjPa[2]],jjE2=[jjPd[0]-jjPa[0],jjPd[1]-jjPa[1],jjPd[2]-jjPa[2]];
  const jjCr=[jjE1[1]*jjE2[2]-jjE1[2]*jjE2[1],jjE1[2]*jjE2[0]-jjE1[0]*jjE2[2],jjE1[0]*jjE2[1]-jjE1[1]*jjE2[0]],jjNm=jjNo(jjAm),jjFlip=(jjCr[0]*jjNm[0]+jjCr[1]*jjNm[1]+jjCr[2]*jjNm[2])<0;
  for(let jjI=0;jjI<jjN;jjI++){const jjAa=jjA0+(jjA1-jjA0)*jjI/jjN,jjAb=jjA0+(jjA1-jjA0)*(jjI+1)/jjN;
   const jjV=[[jjPt(jjR0,jjY0,jjAa),jjNo(jjAa),[jjAa*jjRm,0]],[jjPt(jjR0,jjY0,jjAb),jjNo(jjAb),[jjAb*jjRm,0]],[jjPt(jjR1,jjY1,jjAb),jjNo(jjAb),[jjAb*jjRm,jjL]],[jjPt(jjR1,jjY1,jjAa),jjNo(jjAa),[jjAa*jjRm,jjL]]];
   const jjTri=jjFlip?[0,2,1,0,3,2]:[0,1,2,0,2,3];for(const jjK of jjTri){jjB.p.push(...jjV[jjK][0]);jjB.n.push(...jjV[jjK][1]);jjB.u.push(...jjV[jjK][2]);}}}
 const jjOut={};for(const jjM in jjBy){const jjG=new THREE.BufferGeometry();jjG.setAttribute('position',new THREE.Float32BufferAttribute(jjBy[jjM].p,3));jjG.setAttribute('normal',new THREE.Float32BufferAttribute(jjBy[jjM].n,3));jjG.setAttribute('uv',new THREE.Float32BufferAttribute(jjBy[jjM].u,2));jjOut[jjM]=jjG;}return jjOut;}
// the closing wall at a cut end of the cavea: the profile polygon down to the ground, extruded thin (in the x-y plane)
function jjCivAmpCapGeo(jjSegs,jjOuter,jjD){const jjS=new THREE.Shape();jjS.moveTo(jjSegs[0][0],0);for(const jjG of jjSegs)jjS.lineTo(jjG[2],jjG[3]);const jjL=jjSegs[jjSegs.length-1];jjS.lineTo(jjOuter,jjL[3]);jjS.lineTo(jjOuter,0);
 const jjG=new THREE.ExtrudeGeometry(jjS,{depth:jjD,bevelEnabled:false,curveSegments:1});jjG.translate(0,0,-jjD/2);return jjG;}
function buildJjCivAmphitheater(jjG,jjO){reseed(9370+(jjO.v|0));
 const jjC=JJCIV_AMP,jjZc=jjC.zc,jjPi=Math.PI,jjPr=jjCivAmpProfile(),jjTopY=jjPr.topY,jjNF=jjC.NF,jjRf=jjC.Rf;
 // CAVEA: the seat rows (three swept meshes: brick risers, brick treads, marble edges), closed at both cut ends
 const jjGeos=jjCivSweepGeos(jjPr.seg,0,jjPi,64);for(const jjM in jjGeos)jjMesh(jjGeos[jjM],JMAT[jjM],0,0,jjZc,0);
 const jjCap=jjCivAmpCapGeo(jjPr.seg,jjRf+.6,.6);jjMesh(jjCap,JMAT.brick,0,0,jjZc+.3,0);jjMesh(jjCap,JMAT.brick,0,0,jjZc+.3,jjPi);
 // aisle stairs (half steps) in the lower and upper cavea
 const jjStep=(jjA,jjR,jjY)=>jjBox(Math.cos(jjA)*(jjR+jjC.T*.75),jjY+jjC.R/4,jjZc-Math.sin(jjA)*(jjR+jjC.T*.75),1.1,jjC.R/2,jjC.T/2,'marble',undefined,jjPi/2+jjA);
 for(let jjK=0;jjK<6;jjK++){const jjA=(jjK+.5)*jjPi/6;for(let jjI=0;jjI<jjC.n1;jjI++)jjStep(jjA,jjC.r0+jjI*jjC.T,jjC.pod+jjI*jjC.R);}
 const jjVom=[5,10,15,20,25].map(jjK=>(jjK+.5)*jjPi/jjNF);
 for(const jjA of jjVom)for(let jjI=0;jjI<jjC.n2;jjI++)jjStep(jjA,jjPr.balt.r+jjI*jjC.T,jjPr.balt.y+jjC.balt+jjI*jjC.R);
 // vomitorium doors in the praecinctio wall
 for(const jjA of jjVom){const jjRr=jjPr.balt.r-.33;jjHospBay(Math.cos(jjA)*jjRr,jjPr.balt.y,jjZc-Math.sin(jjA)*jjRr,3.2,jjC.balt,1.9,1.25,jjA-jjPi/2,{depth:.6,back:'dark',backOff:-.02,mat:'brickYellow'});}
 // orchestra: a sunray half disc and paving up to the stage
 const jjOrc=new THREE.CircleGeometry(jjC.r0,48,0,jjPi);jjOrc.rotateX(-jjPi/2);jjMesh(jjOrc,JMAT.sunray,0,.07,jjZc,0);jjBox(0,.035,jjZc+1.5,jjC.r0*2,.07,3,'marble');
 // OUTER ARCADE: two storeys of arches on a 31-sided half polygon, dark corridors behind, crenellated attic, velarium masts
 const jjHalf=jjPi/(2*jjNF),jjChord=2*jjRf*Math.sin(jjHalf),jjRm=jjRf*Math.cos(jjHalf),jjGy=7.5;
 for(let jjK=0;jjK<jjNF;jjK++){const jjA=(jjK+.5)*jjPi/jjNF,jjX=Math.cos(jjA)*jjRm,jjZ=jjZc-Math.sin(jjA)*jjRm,jjRy=jjPi/2+jjA,jjE=jjK%5===0&&jjK>0&&jjK<30;
  jjHospBay(jjX,0,jjZ,jjChord+.14,jjGy,jjE?3.1:2.6,jjE?3.8:3.6,jjRy,{depth:1.2,back:'dark',backOff:.9,mat:jjE?'brickYellow':'brick'});
  jjHospBay(jjX,jjGy,jjZ,jjChord+.14,jjTopY-jjGy,2.4,3.6,jjRy,{depth:1.0,back:'dark',backOff:.9,mat:'brick'});
  jjBox(Math.cos(jjA)*(jjRm-1.6),jjTopY/2,jjZc-Math.sin(jjA)*(jjRm-1.6),jjChord+.25,jjTopY,.1,'dark',undefined,jjRy);
  jjBox(jjX,jjGy,jjZ,jjChord+.3,.3,1.5,'marble',undefined,jjRy);jjBox(jjX,.45,jjZ,jjChord+.3,.9,1.5,'brickDeep',undefined,jjRy);jjBox(jjX,jjTopY+.15,jjZ,jjChord+.3,.3,1.6,'marble',undefined,jjRy);
  jjWithYaw(jjX,jjTopY+.3,jjZ,jjRy,()=>jjCrenel(jjX,jjTopY+.3,jjZ+.2,jjChord+.2,.6,1.5));
  if(jjE)jjBanner(Math.cos(jjA)*(jjRm+.75),jjTopY-.5,jjZc-Math.sin(jjA)*(jjRm+.75),jjRy,{w:1,h:2.2});}
 for(let jjK=0;jjK<=jjNF;jjK++){const jjA=jjK*jjPi/jjNF,jjRp=jjRf+.72,jjX=Math.cos(jjA)*jjRp,jjZ=jjZc-Math.sin(jjA)*jjRp;
  jjColumn(jjX,0,jjZ,.3,jjGy-.15,{pattern:['diamond','chevron','spiral'][jjK%3]});jjBox(jjX,(jjGy+jjTopY)/2,jjZ,.7,jjTopY-jjGy-.3,.36,'brickYellow',undefined,jjPi/2+jjA);
  if(jjK%2===0&&jjK>0&&jjK<jjNF){const jjRq=jjRf-.2,jjXm=Math.cos(jjA)*jjRq,jjZm=jjZc-Math.sin(jjA)*jjRq;jjBeam([jjXm,jjTopY,jjZm],[jjXm,jjTopY+6.5,jjZm],.14,'wood');jjBox(jjXm,jjTopY+6.6,jjZm,.3,.3,.3,'gold');}}
 // cap faces: portals into the ambulatory, string courses
 for(const jjS of [-1,1]){for(const jjR of [29.5,35])jjHospBay(jjS*jjR,0,jjZc+.85,3.6,6.2,2.4,3,0,{depth:.5,back:'dark',backOff:-.03,mat:'brickYellow'});
  jjBox(jjS*(24.6+jjRf+.6)/2,jjGy,jjZc+.66,jjRf+.6-24.6,.3,.12,'marble');}
 // STAGE: the pulpitum with a marble front, steps to the orchestra
 const jjSf=jjZc+3,jjSb=jjZc+10,jjSh=1.4,jjBk=jjZc+16;
 jjBox(0,jjSh/2,(jjSf+jjSb)/2,48,jjSh,jjSb-jjSf,'brick');jjBox(0,jjSh-.08,(jjSf+jjSb)/2,48.3,.16,jjSb-jjSf+.1,'marble');jjBox(0,jjSh/2,jjSf-.06,48,jjSh-.3,.14,'marble');
 for(let jjI=0;jjI<12;jjI++){const jjX=-22+jjI*4;if(Math.abs(jjX)<3)continue;jjBox(jjX,jjSh/2-.05,jjSf-.1,1.4,.8,.1,'dark');}
 jjStairs(0,0,jjSf-.65,5,1.3,jjSh,4,jjPi,{mat:'marble'});
 // SCAENAE FRONS: two storeys of arched niches with patterned columns before the piers, three doors, lamps
 jjBox(0,7.5,(jjSb+jjBk)/2,48,15,jjBk-jjSb,'brick');
 jjHospRow(0,jjSh,jjSb-.5,48,9,6,3.2,3.2,jjPi,{depth:1,back:'dark',backOff:-.05,mat:'brick'});
 jjHospRow(0,jjSh+6,jjSb-.4,48,9,6.2,2.8,3.0,jjPi,{depth:.8,back:'dark',backOff:-.05,mat:'brickYellow',rail:1});
 jjBox(0,jjSh+6,jjSb-1.25,48.4,.3,1.1,'marble');jjBox(0,jjSh+12.3,jjSb-1.05,48.6,.4,1,'marble');
 for(let jjI=0;jjI<=9;jjI++){const jjX=-24+jjI*48/9;jjColumn(jjX,jjSh,jjSb-1.45,.34,5.85,{pattern:['spiral','diamond','chevron'][jjI%3]});jjColumn(jjX,jjSh+6.15,jjSb-1.3,.28,5.9,{pattern:['ogee','fleur','tracery'][jjI%3]});}
 for(const jjX of [-48/9*2,0,48/9*2]){jjDoor(jjX,jjSh,jjSb-.12,1.8,3,jjPi,{mat:'wood'});for(const jjS of [-1,1])jjHospLamp(jjX+jjS*2.0,jjSh+3.3,jjSb-1,jjPi);}
 jjHospParapet(0,15,(jjSb+jjBk)/2,48.4,jjBk-jjSb+.4,.45,1.3);jjHospRing4(0,(jjSb+jjBk)/2,48,jjBk-jjSb,14.85,.36,.3,'marble');
 // the street front of the stage building: an entrance arcade, windows, portholes, banners
 jjHospRow(0,0,jjBk+.5,48,9,7,2.8,3.4,0,{depth:1,back:'dark',backOff:-.05,mat:'brick'});jjBox(0,7.1,jjBk+.6,48.4,.3,1.4,'marble');
 for(let jjI=0;jjI<9;jjI++){const jjX=-24+(jjI+.5)*48/9;if(Math.abs(Math.abs(jjX)-12)<3)continue;jjHospArchWin(jjX,8.6,jjBk,1.4,3.4,0,{lit:true});jjPorthole(jjX,13.3,jjBk+.02,0,.6);}
 // two thick spires behind the stage
 for(const jjS of [-1,1]){const jjX=jjS*12,jjZ=jjBk+1.2;jjCylinder(jjX,.7,jjZ,3.7,1.4,'brickDeep',undefined,32);jjCylinder(jjX,1.43,jjZ,3.85,.14,'marble',undefined,32);
  jjSpire(jjX,1.5,jjZ,3.2,5,{stageH:4.9,pattern:jjS<0?'chevron':'tracery',kind:'gold'});jjBanner(jjX,12,jjZ+2.95,0,{w:1.2,h:4});}
 // parascaenia (side wings of the stage) with gold-domed pavilions; tribunals bridging the side entrances
 for(const jjS of [-1,1]){const jjX=jjS*28;jjBox(jjX,6,(jjSf+jjBk)/2,8,12,jjBk-jjSf,'bandBrick');jjHospRing4(jjX,(jjSf+jjBk)/2,8,jjBk-jjSf,11.85,.36,.3,'marble');
  jjHospParapet(jjX,12.05,(jjSf+jjBk)/2,8.4,jjBk-jjSf+.4,.4,1.2);
  jjHospBay(jjX,0,jjSf-.35,5,7,2.6,3.2,jjPi,{depth:.7,back:'dark',backOff:-.03,mat:'brickYellow'});
  jjHospRow(jjS*32.35,0,(jjSf+jjBk)/2,jjBk-jjSf,3,7,2.6,3.2,jjS*jjPi/2,{depth:.7,back:'dark',backOff:-.03,mat:'brick'});
  for(const jjZ of [jjSf+2.2,(jjSf+jjBk)/2,jjBk-2.2])jjHospArchWin(jjS*32,8,jjZ,1.2,2.6,jjS*jjPi/2,{lit:true});
  jjCylinder(jjX,13.5,(jjSf+jjBk)/2,2.4,2.4,'brickYellow',undefined,32);jjCylinder(jjX,14.78,(jjSf+jjBk)/2,2.6,.16,'marble',undefined,32);jjDome(jjX,14.85,(jjSf+jjBk)/2,2.5,{kind:'gold',shape:'onion'});
  // tribunal over the parodos and the arched side gate at its outer end
  jjBox(jjS*(24+jjRf+.6)/2,8.25,jjZc+1.65,jjRf+.6-24,1.5,2.7,'brick');jjBox(jjS*(24+jjRf+.6)/2,9.1,jjZc+1.65,jjRf+.8-24,.2,2.9,'marble');
  jjCrenel(jjS*(24+jjRf+.6)/2,9.2,jjZc+2.85,jjRf+.6-24,.4,1.1);
  jjHospBay(jjS*(jjRf+.1),0,jjZc+1.65,3.2,9,2.5,4.2,jjS*jjPi/2,{depth:1,mat:'brickYellow'});}
 jjReg('Amphitheater cavea',0,jjZc-18,22,jjTopY+2,{});jjReg('Amphitheater orchestra',0,jjZc,jjC.r0,1,{});jjReg('Amphitheater stage and scaenae frons',0,jjZc+9,24,16,{});
 for(const jjS of [-1,1])jjReg('Amphitheater spire',jjS*12,jjBk+1.2,3.9,28,{});}

JJ.def({key:'jj_library',name:'Library',family:'civic',row:'Civic',w:45.5,d:30.6,h:33,r:23,cls:'building',tags:{type:['civic'],wealth:'civic',lit:true},
 plantSpots:[[-18,11],[18,11],[-21.5,-10],[21.5,-10]],views:{'Library — stair':{cam:[-4,1.7,26],tgt:[0,9,4]}},build:buildJjCivLibrary});
JJ.def({key:'jj_school',name:'School',family:'civic',row:'Civic',w:31,d:29,h:16,r:15.5,cls:'building',tags:{type:['civic'],wealth:'civic',lit:true},
 plantSpots:[[-5,-4],[5,-4],[-5,4],[5,4]],views:{'School — cloister':{cam:[-6.5,2.2,5],tgt:[4,3,-4]}},build:buildJjCivSchool});
JJ.def({key:'jj_amphitheater',name:'Amphitheater',family:'civic',row:'Civic',w:80.4,d:61.2,h:28,r:41,cls:'building',tags:{type:['civic'],wealth:'civic',lit:true},
 plantSpots:[[-36,24],[36,24]],views:{'Amphitheater — from the seats':{cam:[-8,13.6,-18.9],tgt:[0,6,20]},'Amphitheater — over the stage':{cam:[0,58,92],tgt:[0,2,-10]},'Amphitheater — outer arcade':{cam:[-46,1.7,-30],tgt:[-30,7,-14]}},build:buildJjCivAmphitheater});
