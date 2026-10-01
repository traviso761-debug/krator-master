// Jimjam palace and plaza: jj_palace (Raja's palace) and jj_palace_plaza. Prefix jjPal…/buildJjPal…,
// seeds 9450–9499. Local frame: origin at the plot centre on the ground, +z front.
//
// PALACE <-> PLAZA ALIGNMENT: place the plaza at
//     plaza centre = palace centre + (0, 0, JJ_PAL_PLAZA_OFFSET) in the palace's local frame, same yaw,
// with JJ_PAL_PLAZA_OFFSET = 85 m. Then the palace's front landing (x ±15, z +38..+45, top 4.5 m) meets the
// plaza's back edge (plaza local z -40) where the plaza balustrade opens (x ±15), both decks at 4.5 m, and the
// ceremonial gateway looks straight down the plaza's processional axis. For a city at (X,Z) with yaw ry:
//     plaza at (X + 85 sin ry, Z + 85 cos ry), same ry.
// Standalone, the palace is reached by the two lateral flights off the landing; the plaza by its three flights.
//
// Uses the temple fragment's local helpers (74-jj-sacred.js, same family): jjTemplePodium, jjTempleFlight,
// jjTempleBalustrade, jjTemplePorthole, jjTempleLamp.
const JJ_PAL_PLAZA_OFFSET=85;
const JJ_PAL_K={PL:4.5,storey:6,blockX:48,blockZ0:-40,blockZ1:14,recessZ:10,wingX0:34,wingZ1:36};

// frame-aware dome (jjDome's finial goes through kput directly, so it lands in the wrong place inside jjWithYaw)
function jjPalDome(jjX,jjY,jjZ,jjR,jjO){jjO=jjO||{};const jjKind=jjO.kind||'gold',jjShape=jjO.shape||'hemi',jjMat=jjKind==='gold'?'domeGold':jjKind==='slate'?'slate':'terracotta',jjOn=jjShape==='onion';
 jjPut('jj_dome_'+jjShape+'_'+jjMat,jjDomeGeo(jjShape),JMAT[jjMat],jjX,jjY,jjZ,jjR,jjR*(jjOn?1.12:1),jjR);
 if(jjO.ribs){for(let jjI=0;jjI<12;jjI++){const jjA=jjI*TAU/12;let jjP0=null;for(let jjK=0;jjK<=10;jjK++){const jjPhi=jjK/10*Math.PI/2,jjP=[jjX+Math.cos(jjA)*jjR*Math.sin(jjPhi)*1.01,jjY+jjR*Math.cos(jjPhi)*1.01,jjZ+Math.sin(jjA)*jjR*Math.sin(jjPhi)*1.01];if(jjP0)jjBeam(jjP0,jjP,.06*Math.max(1,jjR/4),jjMat==='domeGold'?'gold':'gold');jjP0=jjP;}}}
 jjPut('jj_pal_finial',new THREE.SphereGeometry(1,12,8),JMAT.gold,jjX,jjY+jjR*(jjOn?1.24:1)+.12,jjZ,Math.max(.18,jjR*.07),Math.max(.27,jjR*.1),Math.max(.18,jjR*.07));
 if(jjO.spike)jjBeam([jjX,jjY+jjR*(jjOn?1.24:1),jjZ],[jjX,jjY+jjR*(jjOn?1.24:1)+jjO.spike,jjZ],Math.max(.06,jjR*.02),'gold');}
// a diamond-lattice (jali) screen in the x-y plane at z: dark backing, marble frame, diagonal marble bars
function jjPalJali(jjCx,jjCy,jjZ,jjW,jjH,jjS){jjBox(jjCx,jjCy,jjZ-.05,jjW,jjH,.05,'dark');
 for(const jjSy of [-1,1]){jjBox(jjCx,jjCy+jjSy*(jjH/2),jjZ,jjW+.12,.1,.1,'marble');jjBox(jjCx+jjSy*(jjW/2),jjCy,jjZ,.1,jjH,.1,'marble');}
 const jjHw=jjW/2,jjHh=jjH/2;for(const jjF of [1,-1])for(let jjC=-(jjHw+jjHh)+jjS/2;jjC<jjHw+jjHh;jjC+=jjS){
  // family +1: x+y=c (direction (1,-1)); family -1: x-y=c (direction (1,1))
  const jjX1=Math.max(-jjHw,jjC-jjHh),jjX2=Math.min(jjHw,jjC+jjHh);if(jjX2-jjX1<.05)continue;const jjMx=(jjX1+jjX2)/2,jjMy=jjF>0?jjC-jjMx:jjMx-jjC;
  jjPut('jj_box_marble',JJGEO.box,JMAT.marble,jjCx+jjMx,jjCy+jjMy,jjZ,(jjX2-jjX1)*Math.SQRT2,.05,.06,undefined,qEuler(0,0,jjF>0?-Math.PI/4:Math.PI/4));}}
// a jharokha: a projecting oriel balcony on stepped corbels, jali screens on three sides, a chhajja and a
// small gold onion. Faces +z; (x, y, z) = centre of its floor at the wall face z.
function jjPalJharokha(jjX,jjY,jjZ,jjW){const jjD=1.25,jjH=1.6;
 jjBox(jjX,jjY-.25,jjZ+.55,jjW,.5,1.1,'brickYellow');jjBox(jjX,jjY-.68,jjZ+.36,jjW*.78,.36,.72,'brick');jjBox(jjX,jjY-1.0,jjZ+.2,jjW*.5,.28,.4,'brickYellow');
 jjBox(jjX,jjY+.06,jjZ+jjD/2,jjW+.2,.16,jjD+.1,'marble');
 jjBox(jjX,jjY+.4,jjZ+jjD-.06,jjW,.52,.12,'brickYellow');for(const jjSx of [-1,1])jjBox(jjX+jjSx*(jjW/2-.06),jjY+.4,jjZ+jjD/2,.12,.52,jjD,'brickYellow');
 jjPalJali(jjX,jjY+.66+jjH/2,jjZ+jjD-.04,jjW-.2,jjH,.3);
 for(const jjSx of [-1,1])jjWithYaw(jjX+jjSx*(jjW/2-.04),jjY,jjZ+jjD/2,jjSx*Math.PI/2,()=>jjPalJali(jjX+jjSx*(jjW/2-.04),jjY+.66+jjH/2,jjZ+jjD/2,jjD-.2,jjH,.3));
 for(const jjSx of [-1,1])jjCylinder(jjX+jjSx*(jjW/2-.02),jjY+.66+jjH/2,jjZ+jjD-.02,.09,jjH+.1,'gold');
 jjBox(jjX,jjY+.66+jjH+.1,jjZ+jjD/2,jjW+.1,.2,jjD+.05,'marble');jjBox(jjX,jjY+.66+jjH+.27,jjZ+jjD/2+.12,jjW+.7,.14,jjD+.5,'marble');
 jjPalDome(jjX,jjY+.66+jjH+.34,jjZ+jjD/2,Math.min(jjW,jjD)*.46,{kind:'gold',shape:'onion'});}
// a chhatri: a domed open pavilion on four marble columns, s = scale (1 = 3 m square)
function jjPalChhatri(jjX,jjY,jjZ,jjS,jjKind){jjBox(jjX,jjY+.2*jjS,jjZ,3*jjS,.4*jjS,3*jjS,'brickYellow');jjBox(jjX,jjY+.45*jjS,jjZ,2.8*jjS,.1*jjS,2.8*jjS,'marble');
 for(const jjSx of [-1,1])for(const jjSz of [-1,1])jjCylinder(jjX+jjSx*1.15*jjS,jjY+.5*jjS+1.1*jjS,jjZ+jjSz*1.15*jjS,.14*jjS,2.2*jjS,'marble');
 jjBox(jjX,jjY+2.85*jjS,jjZ,2.75*jjS,.3*jjS,2.75*jjS,'brickYellow');jjBox(jjX,jjY+3.05*jjS,jjZ,3.5*jjS,.12*jjS,3.5*jjS,'marble');
 jjCylinder(jjX,jjY+3.3*jjS,jjZ,1.1*jjS,.4*jjS,'brick');jjPalDome(jjX,jjY+3.5*jjS,jjZ,1.22*jjS,{kind:jjKind||'gold',shape:'hemi'});}
// a lantern cupola on top of a dome (image 1): gold ring, six marble colonnettes, a cap and a small gold onion
function jjPalLantern(jjX,jjY,jjZ,jjR){jjCylinder(jjX,jjY+.1,jjZ,jjR*1.1,.2,'gold');for(let jjI=0;jjI<6;jjI++){const jjA=jjI*TAU/6;jjCylinder(jjX+Math.cos(jjA)*jjR*.85,jjY+.2+jjR*.7,jjZ+Math.sin(jjA)*jjR*.85,.08,jjR*1.4,'marble');}
 jjCylinder(jjX,jjY+.2+jjR*.7,jjZ,jjR*.55,jjR*1.4,'glow');jjCylinder(jjX,jjY+.28+jjR*1.4,jjZ,jjR*1.18,.16,'marble');jjPalDome(jjX,jjY+.36+jjR*1.4,jjZ,jjR*.95,{kind:'gold',shape:'onion',spike:1.2});}
// a brick mass pierced by a round-headed opening (centred on x=0 at cz), with marble archivolts and jambs
function jjPalArchMass(jjCx,jjY,jjCz,jjHW,jjH,jjDp,jjOH,jjSp){const jjS=new THREE.Shape();jjS.moveTo(-jjHW,0);jjS.lineTo(-jjHW,jjH);jjS.lineTo(jjHW,jjH);jjS.lineTo(jjHW,0);jjS.lineTo(jjOH,0);jjS.lineTo(jjOH,jjSp);
 for(let jjI=1;jjI<24;jjI++){const jjA=Math.PI*jjI/24;jjS.lineTo(jjOH*Math.cos(jjA),jjSp+jjOH*Math.sin(jjA));}jjS.lineTo(-jjOH,jjSp);jjS.lineTo(-jjOH,0);jjS.closePath();
 const jjG=new THREE.ExtrudeGeometry(jjS,{depth:jjDp,bevelEnabled:false});jjG.translate(0,0,-jjDp/2);jjMesh(jjG,JMAT.brick,jjCx,jjY,jjCz,0);
 if(!KIT.defs.jj_pal_archivolt)kdef('jj_pal_archivolt',new THREE.TorusGeometry(1,.075,8,24,Math.PI),JMAT.marble);
 for(const jjF of [-1,1]){const jjFz=jjCz+jjF*jjDp/2;jjPut('jj_pal_archivolt',null,null,jjCx,jjY+jjSp,jjFz,jjOH+.4,jjOH+.4,jjOH+.4,undefined,jjF<0?qEuler(0,Math.PI,0):null);
  for(const jjSx of [-1,1])jjBox(jjCx+jjSx*(jjOH+.3),jjY+jjSp/2,jjFz,.6,jjSp,.45,'marble');}}
// a row of arched windows along x on a face at z (one per storey list entry)
function jjPalWindows(jjXs,jjYs,jjZ,jjW,jjH){for(const jjX of jjXs)for(const jjY of jjYs)jjWindow(jjX,jjY,jjZ,jjW,jjH,0,{lit:true,shutter:false});}

const JJ_PAL_PLANT_SPOTS=[[-28,4.5,30],[28,4.5,30],[-28,4.5,18],[28,4.5,18],[-52,4.5,-20],[52,4.5,-20],[-30,0,44.5],[30,0,44.5]];

function buildJjPalace(jjG,jjO){reseed(9450+(jjO.v|0));const K=JJ_PAL_K,PL=K.PL,ST=K.storey,RY=PL+3*ST+.28,jjBX=K.blockX;
 // --- the high plinth, the front landing and its two lateral flights
 jjTemplePodium(0,0,-2.5,112,81,PL,46);
 jjBox(0,PL/2,41.5,30,PL,7,'brickDeep');jjBox(0,PL-.2,41.5,30.4,.4,7.2,'marble');jjBox(0,PL*.48,41.5,30.1,.5,7.1,'brickYellow');
 for(const jjSx of [-1,1]){jjBox(jjSx*14.6,PL+.62,44.6,.8,1.24,.8,'brick');jjTempleLamp(jjSx*14.6,PL+1.24,44.6);}
 jjWithYaw(15,0,41,Math.PI/2,()=>jjTempleFlight(15,0,41,5.6,30,PL,30,[-1]));jjWithYaw(-15,0,41,-Math.PI/2,()=>jjTempleFlight(-15,0,41,5.6,30,PL,30,[1]));
 // deck balustrades (the front run stops at the landing)
 const jjBx=55.6,jjBz0=-42.6,jjBz1=37.7;
 jjTempleBalustrade(-jjBx,jjBz0,jjBx,jjBz0,PL);for(const jjSx of [-1,1]){jjTempleBalustrade(jjSx*jjBx,jjBz0,jjSx*jjBx,jjBz1,PL);jjTempleBalustrade(jjSx*15.4,jjBz1,jjSx*jjBx,jjBz1,PL);}
 // --- main block: rear mass, two front side sections, a recessed centre with two storeys of loggias
 const jjZ0=K.blockZ0,jjZ1=K.blockZ1,jjZr=K.recessZ;
 jjWall(0,PL,(jjZ0+jjZr)/2,jjBX*2,3*ST,jjZr-jjZ0,0,{});jjTempleBands(0,PL,(jjZ0+jjZr)/2,jjBX*2,jjZr-jjZ0,3*ST);
 for(const jjSx of [-1,1]){jjWall(jjSx*36,PL,(jjZr+jjZ1)/2,24,3*ST,jjZ1-jjZr,0,{});jjTempleBands(jjSx*36,PL,(jjZr+jjZ1)/2,24,jjZ1-jjZr,3*ST);jjBanner(jjSx*25.6,RY-.7,jjZ1+.08,0,{w:1.5,h:5});}
 for(const jjYY of [PL+ST,PL+2*ST]){jjBox(0,jjYY,(jjZ0+jjZr)/2,jjBX*2+.24,.3,jjZr-jjZ0+.24,'marble');for(const jjSx of [-1,1])jjBox(jjSx*36,jjYY,(jjZr+jjZ1)/2,24.24,.3,jjZ1-jjZr+.24,'marble');}
 jjArcade(0,PL,12.6,5,9.6,5.4,0,{depth:1.2,r:.5});jjBox(0,PL+5.95,12,48,.3,4,'brickYellow');
 jjArcade(0,PL+6.1,12.6,5,9.6,5.4,0,{depth:1.2,r:.46});jjTempleBalustrade(-23.6,13.85,23.6,13.85,PL+6.1);
 jjWall(0,PL+12.2,12,48,3*ST-12.2,4,0,{});jjTempleBands(0,PL+12.2,12,48,4,3*ST-12.2);
 jjDoor(0,PL,jjZr,3.4,4.9,0,{mat:'dark'});for(const jjSx of [-1,1])jjTempleLamp(jjSx*2.6,PL+2.6,jjZr+.3);
 jjPalWindows([-19.2,-9.6,9.6,19.2],[PL+2.7],jjZr,1.5,2.8);jjPalWindows([-19.2,-9.6,0,9.6,19.2],[PL+6.1+2.7],jjZr,1.4,2.7);
 for(let jjI=-3;jjI<=3;jjI++)jjTemplePorthole(jjI*6,PL+15.2,jjZ1+.05,.95);
 // front side sections: windows on three storeys, a jharokha on the piano nobile, a porthole above
 for(const jjSx of [-1,1]){jjPalWindows([jjSx*28.5,jjSx*41],[PL+2.8,PL+ST+2.8,PL+2*ST+2.8],jjZ1,1.7,3);jjWindow(jjSx*35,PL+2.8,jjZ1,1.7,3,0,{lit:true});
  jjPalJharokha(jjSx*35,PL+ST+.5,jjZ1,3.2);jjTemplePorthole(jjSx*35,PL+2*ST+2.9,jjZ1+.05,1.05);}
 // side façades (x = ±48) and the back (z = -40)
 for(const jjSx of [-1,1])jjWithYaw(jjSx*jjBX,PL,-12,jjSx*Math.PI/2,()=>{const jjF=jjSx*jjBX;
  // local x along the façade maps to world z = -12 - jjSx*(x - jjF)
  for(const jjDx of [-17,-11,-5,5,11,17]){jjWindow(jjF+jjDx,PL+2.8,-12,1.6,3,0,{lit:true});jjWindow(jjF+jjDx,PL+2*ST+2.8,-12,1.6,3,0,{lit:true});if(Math.abs(jjDx)!==11)jjWindow(jjF+jjDx,PL+ST+2.8,-12,1.6,3,0,{lit:true});}
  for(const jjDx of [-11,11])jjPalJharokha(jjF+jjDx,PL+ST+.5,-12,3);jjTemplePorthole(jjF,PL+ST+3.2,-11.95,1.1);});
 jjWithYaw(0,PL,jjZ0,Math.PI,()=>{for(let jjX=-36;jjX<=36;jjX+=8){for(let jjL=0;jjL<3;jjL++)if(!(jjL===0&&jjX===0)&&!(jjL===1&&Math.abs(jjX)===20))jjWindow(jjX,PL+jjL*ST+2.8,jjZ0,1.6,3,0,{lit:true});}for(const jjX of [-20,20])jjPalJharokha(jjX,PL+ST+.5,jjZ0,3.2);jjTemplePorthole(0,PL+ST+3.2,jjZ0+.05,1.1);jjDoor(0,PL,jjZ0,2.6,4,0,{mat:'dark'});});
 // --- roofline: crenellated parapets, central pavilion, drum and gold onion dome
 jjCrenel(0,RY,jjZ1-.25,jjBX*2,.5,1.3);jjCrenel(0,RY,jjZ0+.25,jjBX*2,.5,1.3);
 for(const jjSx of [-1,1])jjWithYaw(jjSx*(jjBX-.25),RY,(jjZ0+jjZ1)/2,Math.PI/2,()=>jjCrenel(jjSx*(jjBX-.25),RY,(jjZ0+jjZ1)/2,jjZ1-jjZ0,.5,1.3));
 const jjCz=-14,jjPavH=6;jjWall(0,RY,jjCz,32,jjPavH,24,0,{});jjTempleBands(0,RY,jjCz,32,24,jjPavH);const jjPT=RY+jjPavH+.28;
 jjPalWindows([-9,0,9],[RY+3],jjCz+12,1.5,2.8);jjWithYaw(0,RY,jjCz-12,Math.PI,()=>jjPalWindows([-9,0,9],[RY+3],jjCz-12,1.5,2.8));
 jjCrenel(0,jjPT,jjCz+11.8,32,.45,1.1);jjCrenel(0,jjPT,jjCz-11.8,32,.45,1.1);
 for(const jjSx of [-1,1])for(const jjZ of [jjCz-9.5,jjCz+9.5])jjPalChhatri(jjSx*13.5,jjPT,jjZ,.85);
 const jjDr=9,jjDh=7;jjCylinder(0,jjPT+.3,jjCz,jjDr+.6,.6,'marble',undefined,32);jjCylinder(0,jjPT+.6+jjDh/2,jjCz,jjDr,jjDh,'brick',undefined,32);
 for(const jjYY of [jjPT+1.4,jjPT+.6+jjDh-.4])jjCylinder(0,jjYY,jjCz,jjDr+.08,.4,'brickYellow',undefined,32);jjCylinder(0,jjPT+.6+jjDh+.2,jjCz,jjDr+.45,.4,'marble',undefined,32);
 for(let jjI=0;jjI<10;jjI++){const jjA=jjI*TAU/10;jjWithYaw(0,0,jjCz,jjA,()=>jjTemplePorthole(0,jjPT+4.4,jjCz+jjDr+.02,.85));
  const jjA2=jjA+TAU/20;jjBrickShaft(Math.sin(jjA2)*(jjDr+.2),jjPT+.6,jjCz+Math.cos(jjA2)*(jjDr+.2),.38,jjDh-.2,{pattern:['spiral','chevron','diamond','ogee','fleur'][jjI%5],section:'round',relief:false,cap:'none',base:false});}
 const jjDomeY=jjPT+.6+jjDh+.4;jjPalDome(0,jjDomeY,jjCz,9.6,{kind:'gold',shape:'onion',spike:3.2});
 // secondary domes: gold ribbed on drums, slate ribbed with lanterns
 for(const jjSx of [-1,1]){const jjX=jjSx*32;
  jjCylinder(jjX,RY+.25,-14,5.6,.5,'marble',undefined,32);jjCylinder(jjX,RY+2.4,-14,5,3.8,'brick',undefined,32);jjCylinder(jjX,RY+4.4,-14,5.25,.3,'marble',undefined,32);
  for(let jjI=0;jjI<6;jjI++)jjWithYaw(jjX,0,-14,jjI*TAU/6+TAU/12,()=>jjTemplePorthole(jjX,RY+2.4,-14+5.02,.6));
  jjPalDome(jjX,RY+4.55,-14,5.2,{kind:'gold',shape:'hemi',ribs:true});
  jjCylinder(jjX,RY+.25,-32,5,.5,'marble',undefined,32);jjCylinder(jjX,RY+1.9,-32,4.4,2.8,'brickYellow',undefined,32);jjCylinder(jjX,RY+3.4,-32,4.65,.3,'marble',undefined,32);
  jjPalDome(jjX,RY+3.55,-32,4.6,{kind:'slate',shape:'hemi',ribs:true});jjPalLantern(jjX,RY+3.55+4.6,-32,1.15);}
 // roof chhatris and clustered ornamental chimney stacks
 for(const jjSx of [-1,1]){jjPalChhatri(jjSx*42,RY,8.6,1.05);jjPalChhatri(jjSx*21,RY,8.6,.95);}
 jjChimneyStack(-20,RY,-35,{n:4,h:3.4,seed:1,relief:true});jjChimneyStack(20,RY,-35,{n:5,h:3.6,seed:3,relief:true});
 jjChimneyStack(-41,RY,-23,{n:3,h:3.0,seed:2,relief:true,ry:Math.PI/2});jjChimneyStack(41,RY,-23,{n:6,h:3.2,seed:4,relief:true,ry:Math.PI/2});
 // --- six thick staged spires of three heights: back corners, front corners, gateway
 for(const jjSx of [-1,1]){const jjXb=jjSx*47,jjXf=jjSx*48;
  jjCylinder(jjXb,PL+(RY+3-PL)/2,-37.8,4.2,RY+3-PL,'brick',undefined,32);for(const jjYY of [PL+.8,PL+ST,PL+2*ST,RY+2.6])jjCylinder(jjXb,jjYY,-37.8,4.3,.42,jjYY>RY?'marble':'brickYellow',undefined,32);
  jjSpire(jjXb,RY+3,-37.8,3.3,4,{stageH:4.8,kind:'gold',pattern:'tracery'});
  jjCylinder(jjXf,PL+(RY+1.5-PL)/2,jjZ1,4,RY+1.5-PL,'brick',undefined,32);for(const jjYY of [PL+.8,PL+ST,PL+2*ST,RY+1.1])jjCylinder(jjXf,jjYY,jjZ1,4.1,.42,jjYY>RY?'marble':'brickYellow',undefined,32);
  jjWithYaw(jjXf,PL,jjZ1,jjSx*Math.PI/4,()=>{jjTemplePorthole(jjXf,PL+ST+3,jjZ1+4.02,.9);jjTemplePorthole(jjXf,PL+2*ST+3,jjZ1+4.02,.9);});
  jjSpire(jjXf,RY+1.5,jjZ1,3,3,{stageH:4.6,kind:'gold',pattern:'chevron'});}
 // --- forecourt wings (two storeys) with jharokhas on both faces
 const jjWz0=jjZ1,jjWz1=K.wingZ1,jjWc=(jjWz0+jjWz1)/2,jjWT=PL+2*ST+.28;
 for(const jjSx of [-1,1]){const jjXc=jjSx*41;jjWall(jjXc,PL,jjWc,14,2*ST,jjWz1-jjWz0,0,{});jjTempleBands(jjXc,PL,jjWc,14,jjWz1-jjWz0,2*ST);jjBox(jjXc,PL+ST,jjWc,14.24,.3,jjWz1-jjWz0+.24,'marble');
  jjPalWindows([jjXc-3.2,jjXc+3.2],[PL+2.8,PL+ST+2.8],jjWz1,1.7,3);jjTemplePorthole(jjXc,PL+ST+3.4,jjWz1+.05,.95);jjDoor(jjXc,PL,jjWz1,2.4,3.6,0,{mat:'dark'});
  for(const jjFace of [-1,1]){const jjFx=jjSx*(jjFace<0?K.wingX0:jjBX),jjRy=(jjFace<0?-jjSx:jjSx)*Math.PI/2;
   jjWithYaw(jjFx,PL,jjWc,jjRy,()=>{for(const jjDx of [-5.5,5.5])jjPalJharokha(jjFx+jjDx,PL+ST+.5,jjWc,3);for(const jjDx of [-5.5,0,5.5])jjWindow(jjFx+jjDx,PL+2.8,jjWc,1.6,3,0,{lit:true});jjWindow(jjFx,PL+ST+2.8,jjWc,1.6,3,0,{lit:true});});}
  jjCrenel(jjXc,jjWT,jjWz1-.25,14,.5,1.2);jjCrenel(jjXc,jjWT,jjWz0+.25,14,.5,1.2);
  for(const jjFx of [jjSx*(K.wingX0+.25),jjSx*(jjBX-.25)])jjWithYaw(jjFx,jjWT,jjWc,Math.PI/2,()=>jjCrenel(jjFx,jjWT,jjWc,jjWz1-jjWz0,.5,1.2));
  jjPalChhatri(jjXc,jjWT,jjWz1-3.6,1.15);
  jjBanner(jjXc+jjSx*5.6,PL+2*ST-.6,jjWz1+.08,0,{w:1.5,h:4.6});}
 // --- the ceremonial gateway on +z: gate tower with a round-headed passage, screen walls, flanking spires
 const jjGz=35,jjGH=17;jjPalArchMass(0,PL,jjGz,10,jjGH,5,3.6,7.6);
 for(const jjSx of [-1,1]){for(const jjYY of [PL+.5,PL+4])jjBox(jjSx*7.15,jjYY,jjGz,5.9,.45,5.2,'brickYellow');jjBox(jjSx*7.15,PL+7.8,jjGz,5.9,.35,5.2,'marble');}jjBox(0,PL+15.3,jjGz,20.2,.45,5.2,'brickYellow');
 jjCornice(0,PL+jjGH,jjGz,20,5,0);const jjGT=PL+jjGH+1.21;
 for(const jjF of [-1,1])jjCrenel(0,jjGT,jjGz+jjF*2.6,20.4,.5,1.4);for(const jjSx of [-1,1])jjWithYaw(jjSx*10.1,jjGT,jjGz,Math.PI/2,()=>jjCrenel(jjSx*10.1,jjGT,jjGz,5,.5,1.4));
 jjPalChhatri(0,jjGT,jjGz,1.25);
 for(const jjF of [-1,1]){const jjFz=jjGz+jjF*2.5;jjPut('jj_cyl_gold_32',JJGEO.cyl32,JMAT.gold,0,PL+13.2,jjFz+jjF*.12,1.4,.25,1.4,undefined,qEuler(Math.PI/2,0,0));
  for(let jjI=0;jjI<12;jjI++){const jjA=jjI*Math.PI/6;jjBeam([Math.cos(jjA)*1.5,PL+13.2+Math.sin(jjA)*1.5,jjFz+jjF*.1],[Math.cos(jjA)*2.1,PL+13.2+Math.sin(jjA)*2.1,jjFz+jjF*.1],.09,'gold');}
  for(const jjSx of [-1,1])jjBrickShaft(jjSx*6.8,PL,jjFz+jjF*.7,.62,9,{pattern:jjF>0?'spiral':'diamond',section:'round',relief:jjF>0,cap:'corbel'});}
 for(const jjSx of [-1,1]){jjBanner(jjSx*6.8,PL+16.2,jjGz+2.5+.15,0,{w:1.8,h:5.2});jjTempleLamp(jjSx*4.6,PL+3.6,jjGz+2.6);}
 for(const jjSx of [-1,1]){const jjX=jjSx*13;jjCylinder(jjX,PL+6.5,jjGz,3,13,'brick',undefined,32);for(const jjYY of [PL+.6,PL+6.5,PL+12.8])jjCylinder(jjX,jjYY,jjGz,3.1,.4,jjYY>PL+12?'marble':'brickYellow',undefined,32);
  jjWithYaw(jjX,PL,jjGz,0,()=>jjTemplePorthole(jjX,PL+9.5,jjGz+3.02,.8));
  jjSpire(jjX,PL+13,jjGz,2.3,3,{stageH:4.2,kind:'gold',pattern:'ogee'});
  const jjWx=jjSx*25;jjWall(jjWx,PL,jjGz,18,8,2,0,{});jjTempleBands(jjWx,PL,jjGz,18,2,8);jjCrenel(jjWx,PL+8.28,jjGz,18.6,2.1,1.2);
  for(const jjDx of [-5,0,5])jjTemplePorthole(jjWx+jjDx,PL+5,jjGz+1.05,.8);}
 // --- inspector volumes
 jjReg('Palace block',0,-13,40,RY,{part:'block'});jjReg('Central onion dome',0,jjCz,10,jjDomeY+14,{part:'dome'});jjReg('Ceremonial gateway',0,jjGz,12,PL+jjGH+6,{part:'gateway'});
 for(const jjSx of [-1,1]){jjReg('Forecourt wing',jjSx*41,jjWc,10,jjWT,{part:'wing'});jjReg('Corner spire',jjSx*47,-37.8,4.4,RY+24,{part:'spire'});jjReg('Corner spire',jjSx*48,jjZ1,4.2,RY+18,{part:'spire'});jjReg('Gate spire',jjSx*13,jjGz,3.2,PL+27,{part:'spire'});}}

// ---------------------------------------------------------------------------------------------
// The great plaza: a raised marble deck (82 x 71 m, top 4.5 m) with a red-and-yellow sunray inlay, rays
// running out to the balustrade, a stepped dais with a sun column, a processional line and a ring of
// ornamental brick columns with banner sockets, stairs down on three sides (+z, ±x). Its -z side meets the
// palace (see JJ_PAL_PLAZA_OFFSET above).
const JJ_PAL_PLAZA_K={H:4.5,hx:41,z0:-40,z1:31,discR:26};
function jjPalRayStrip(jjCx,jjCz,jjA,jjR0,jjR1,jjY,jjTint){const jjL=jjR1-jjR0;if(jjL<1)return;const jjSx=Math.sin(jjA),jjSz=Math.cos(jjA);
 // three segments, narrowing outwards, so each ray tapers
 const jjWs=[1.9,1.25,.6];for(let jjI=0;jjI<3;jjI++){const jjM=jjR0+jjL*(jjI+.5)/3;jjBox(jjCx+jjSx*jjM,jjY,jjCz+jjSz*jjM,jjWs[jjI],.04,jjL/3+.02,'marble',jjTint,jjA);}}
function buildJjPalPlaza(jjG,jjO){reseed(9475+(jjO.v|0));const K=JJ_PAL_PLAZA_K,H=K.H,jjCz=(K.z0+K.z1)/2,jjHz=(K.z1-K.z0)/2;
 jjTemplePodium(0,0,jjCz,K.hx*2,K.z1-K.z0,H,13.4);
 // three flights
 jjTempleFlight(0,0,K.z1,24,9,H,30);
 for(const jjSx of [-1,1])jjWithYaw(jjSx*K.hx,0,jjCz,jjSx*Math.PI/2,()=>jjTempleFlight(jjSx*K.hx,0,jjCz,20,9,H,30));
 for(const jjP of [[-12.6,K.z1+10.2],[12.6,K.z1+10.2],[-(K.hx+10.2),jjCz-10.6],[-(K.hx+10.2),jjCz+10.6],[K.hx+10.2,jjCz-10.6],[K.hx+10.2,jjCz+10.6]]){jjBox(jjP[0],.75,jjP[1],1.3,1.5,1.3,'brick');jjBox(jjP[0],1.56,jjP[1],1.5,.14,1.5,'marble');jjTempleLamp(jjP[0],1.62,jjP[1]);}
 // the sunray disc with its gold rim, and rays running out to the balustrade
 const jjY=H+.02;jjPut('jj_pal_sunray_disc',new THREE.CylinderGeometry(1,1,1,96),JMAT.sunray,0,jjY+.03,jjCz,K.discR,.06,K.discR);
 if(!KIT.defs.jj_pal_ring)kdef('jj_pal_ring',new THREE.TorusGeometry(1,.0028,4,128),JMAT.gold);jjPut('jj_pal_ring',null,null,0,jjY+.06,jjCz,K.discR,K.discR,K.discR,undefined,qEuler(Math.PI/2,0,0));
 const jjRed=jjColor(0xc0503c),jjYel=jjColor(0xe6b450);
 for(let jjI=0;jjI<32;jjI++){const jjA=(jjI+.5)*TAU/32,jjSx=Math.abs(Math.sin(jjA)),jjSz=Math.abs(Math.cos(jjA));const jjR1=Math.min((K.hx-1.6)/Math.max(jjSx,1e-3),(jjHz-1.6)/Math.max(jjSz,1e-3));
  jjPalRayStrip(0,jjCz,jjA,K.discR+.5,jjR1,jjY+.02,jjI%2?jjRed:jjYel);}
 // the stepped dais and the sun column at the centre
 const jjTiers=[[7,.5],[5.6,.5],[4.2,.5]];let jjDy=H;for(const jjT of jjTiers){jjCylinder(0,jjDy+jjT[1]/2,jjCz,jjT[0],jjT[1],'marble',undefined,32);jjCylinder(0,jjDy+jjT[1]-.04,jjCz,jjT[0]+.05,.08,'gold',undefined,32);jjDy+=jjT[1];}
 for(const jjA of [0,Math.PI/2,Math.PI,-Math.PI/2])jjWithYaw(0,H,jjCz,jjA,()=>jjBox(0,H+.25,jjCz+7.6,3,.5,1.2,'marble'));
 jjBrickShaft(0,jjDy,jjCz,1.15,12.5,{pattern:'spiral',section:'round',relief:true,cap:'star'});const jjST=jjDy+12.5+.6;
 jjCylinder(0,jjST,jjCz,.5,1.2,'gold');jjPut('jj_cyl_gold_32',JJGEO.cyl32,JMAT.gold,0,jjST+2.2,jjCz,1.5,.3,1.5,undefined,qEuler(Math.PI/2,0,0));
 for(let jjI=0;jjI<16;jjI++){const jjA=jjI*TAU/16;jjBeam([Math.cos(jjA)*1.6,jjST+2.2+Math.sin(jjA)*1.6,jjCz],[Math.cos(jjA)*(jjI%2?2.3:2.9),jjST+2.2+Math.sin(jjA)*(jjI%2?2.3:2.9),jjCz],.1,'gold');}
 // processional columns: two lines on the axis (approach and palace side) and a ring round the disc, each with a banner socket
 const jjPats=['spiral','chevron','diamond','ogee','fleur','tracery'];let jjK=0;
 const jjCol=(jjX,jjZ,jjFaceRy)=>{const jjPat=jjPats[jjK%jjPats.length];jjK++;jjBrickShaft(jjX,H,jjZ,.7,9,{pattern:jjPat,section:jjK%3===0?'octagon':'round',relief:true,cap:jjK%2?'crenel':'star'});
  jjWithYaw(jjX,H,jjZ,jjFaceRy,()=>{jjBox(jjX,H+7.6,jjZ+.85,.16,.16,.5,'gold');});jjBanner(jjX+Math.sin(jjFaceRy)*1.0,H+7.6,jjZ+Math.cos(jjFaceRy)*1.0,jjFaceRy,{w:1.1,h:3.4});};
 for(const jjSx of [-1,1]){for(const jjZ of [K.z1-3.5,K.z1-8.5])jjCol(jjSx*10,jjZ,-jjSx*Math.PI/2);for(const jjZ of [K.z0+4.5,K.z0+10])jjCol(jjSx*10,jjZ,-jjSx*Math.PI/2);}
 for(let jjI=0;jjI<8;jjI++){const jjA=(jjI+.5)*TAU/8,jjX=Math.sin(jjA)*(K.discR-4),jjZ=jjCz+Math.cos(jjA)*(K.discR-4);jjCol(jjX,jjZ,jjA+Math.PI);}
 // balustrade: open at the three flights and at the palace side (x ±15)
 const jjBx=K.hx-.4,jjB0=K.z0+.4,jjB1=K.z1-.4;
 for(const jjSx of [-1,1]){jjTempleBalustrade(jjSx*15.3,jjB0,jjSx*jjBx,jjB0,H);jjTempleBalustrade(jjSx*13.6,jjB1,jjSx*jjBx,jjB1,H);
  jjTempleBalustrade(jjSx*jjBx,jjB0,jjSx*jjBx,jjCz-11.4,H);jjTempleBalustrade(jjSx*jjBx,jjCz+11.4,jjSx*jjBx,jjB1,H);}
 for(const jjSx of [-1,1]){jjBox(jjSx*15.3,H+.8,jjB0,1,1.6,1,'brick');jjBox(jjSx*15.3,H+1.66,jjB0,1.2,.14,1.2,'marble');jjTempleLamp(jjSx*15.3,H+1.72,jjB0);}
 // corner chhatris
 for(const jjSx of [-1,1])for(const jjZ of [K.z0+3.4,K.z1-3.4])jjPalChhatri(jjSx*(K.hx-3.4),H,jjZ,1.25);
 jjReg('Sunray disc',0,jjCz,K.discR,H+1,{part:'plaza'});jjReg('Sun column',0,jjCz,7,jjST+5,{part:'column'});}

JJ.def({key:'jj_palace',name:"Raja's palace",family:'palace',row:'Palace and plaza',w:113,d:90,h:52,r:57,cls:'building',
 tags:{type:['civic','single-family dwelling'],wealth:'civic',lit:true,role:'landmark'},plaza:{key:'jj_palace_plaza',offset:[0,0,JJ_PAL_PLAZA_OFFSET]},build:buildJjPalace});
JJ.def({key:'jj_palace_plaza',name:'Great sunray plaza',family:'palace',row:'Palace and plaza',w:104,d:82,h:24,r:52,cls:'building',
 tags:{type:['civic'],wealth:'civic',lit:true,role:'landmark'},build:buildJjPalPlaza});
