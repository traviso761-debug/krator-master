// Jimjam sacred: the solstice temple (jj_temple_sun). Prefix jjTemple…/buildJjTemple…, seeds 9400–9449.
// Local frame: origin at the plot centre on the ground, +z front. From +z to -z: a long marble flight up
// to the temple platform, the monumental gate arch at its head, a reflecting channel, a second flight
// up to the sanctuary podium, the sanctuary (gold-domed hall in front, stepped shikhara over the shrine),
// four thick staged spires at the platform corners.
//
// THE AXIS. An observer on the sanctuary podium, at the door (eye 1.7 m above the podium), looks along
// local +z through the arch. On the southern summer solstice (Krator day 350, declination -23 deg, latitude
// -40 deg, from 81-sky.js) the sun sets beyond the arch, framed in the opening. JJ_SOLSTICE holds the
// evening hour at which the sun stands JJ_SOLSTICE.targetAltDeg above the horizon (bisection on
// KratorSky.sunDir(h,350).y) and its azimuth; the def's yaw ry = PI - azimuth turns local +z onto it.
// 81-sky.js loads AFTER this fragment (KratorSky is a const), so the numbers are solved on first use:
// the def's `ry` and `views` are getters, read by targets/kit/89z-rows.js and 91z-views.js, and the
// builder calls jjTempleSolve() too. JJ_TEMPLE_OBS (world eye, arch plane and opening) is stored by the
// builder for jjSolsticeCheck() in 91-probe.js.
const JJ_SOLSTICE={day:350,event:'sunset',targetAltDeg:3,hour:NaN,azimuthDeg:NaN,altitudeDeg:NaN,ry:NaN};
function jjTempleSolve(){if(JJ_SOLSTICE.hour===JJ_SOLSTICE.hour)return JJ_SOLSTICE;
 const jjY0=Math.sin(JJ_SOLSTICE.targetAltDeg*Math.PI/180);let jjA=12,jjB=24; // noon: sun high; midnight: below
 for(let jjI=0;jjI<60;jjI++){const jjM=(jjA+jjB)/2;if(KratorSky.sunDir(jjM,JJ_SOLSTICE.day).y>jjY0)jjA=jjM;else jjB=jjM;}
 const jjH=(jjA+jjB)/2,jjAA=KratorSky.altAz(KratorSky.sunDir(jjH,JJ_SOLSTICE.day));
 JJ_SOLSTICE.hour=jjH;JJ_SOLSTICE.azimuthDeg=jjAA.az;JJ_SOLSTICE.altitudeDeg=jjAA.alt;JJ_SOLSTICE.ry=Math.PI-jjAA.az*Math.PI/180;return JJ_SOLSTICE;}
// Dimensions (local metres). PH platform top; SH sanctuary podium height above the platform.
const JJ_TEMPLE_K={PH:6,platW:48,platZ0:-42,platZ1:21,SH:6,podW:30,podZ0:-38,podZ1:-6,doorZ:-10,obsZ:-8.5,eye:1.7,
 archZ:16,archDepth:4.5,archHalfW:4.5,archSpring:12,archR:4.5,archOuterHalfW:10,archH:21.5,stairW:16,stairRun:19};
let JJ_TEMPLE_OBS=null;
function jjTempleEyeLocal(){const K=JJ_TEMPLE_K;return[0,K.PH+K.SH+K.eye,K.obsZ];}

// --- local helpers ---------------------------------------------------------------------------
// a box laid along a slope in the y-z plane, from a to b, w wide (x) and t thick
function jjTempleSlab(jjA,jjB,jjW,jjT,jjMat){const jjDy=jjB[1]-jjA[1],jjDz=jjB[2]-jjA[2],jjL=Math.hypot(jjDy,jjDz);const jjKey=typeof jjMat==='string'?jjMat:'custom';
 jjPut('jj_box_'+jjKey,JJGEO.box,JMAT[jjMat],(jjA[0]+jjB[0])/2,(jjA[1]+jjB[1])/2,(jjA[2]+jjB[2])/2,jjW,jjT,jjL,undefined,qEuler(-Math.atan2(jjDy,jjDz),0,0));}
// an instanced gold-framed porthole facing +z (frame-aware, so it works inside jjWithYaw)
function jjTemplePorthole(jjX,jjY,jjZ,jjR){if(!KIT.defs.jj_temple_port_ring){kdef('jj_temple_port_ring',new THREE.TorusGeometry(.83,.13,8,32),JMAT.gold);kdef('jj_temple_port_glass',new THREE.CircleGeometry(.7,24),JMAT.glass);kdef('jj_temple_port_rim',new THREE.CylinderGeometry(1,1,1,24),JMAT.brickDeep);}
 jjPut('jj_temple_port_rim',null,null,jjX,jjY,jjZ,jjR,.2,jjR,undefined,qEuler(Math.PI/2,0,0));jjPut('jj_temple_port_ring',null,null,jjX,jjY,jjZ+.12,jjR,jjR,jjR);jjPut('jj_temple_port_glass',null,null,jjX,jjY,jjZ+.11,jjR,jjR,jjR);}
// a podium: deep-brick core, plinth course, yellow band, marble string and cap, brick pilasters
function jjTemplePodium(jjCx,jjY,jjCz,jjW,jjD,jjH,jjSkipFront){jjBox(jjCx,jjY+jjH/2,jjCz,jjW,jjH,jjD,'brickDeep');jjBox(jjCx,jjY+.45,jjCz,jjW+.5,.9,jjD+.5,'brick');
 jjBox(jjCx,jjY+jjH*.48,jjCz,jjW+.16,.5,jjD+.16,'brickYellow');jjBox(jjCx,jjY+jjH-.9,jjCz,jjW+.2,.3,jjD+.2,'marble');jjBox(jjCx,jjY+jjH-.2,jjCz,jjW+.6,.4,jjD+.6,'marble');
 const jjPil=(jjX,jjZ,jjAlongX)=>jjBox(jjX,jjY+.9+(jjH-2)/2,jjZ,jjAlongX?1.1:.5,jjH-2,jjAlongX?.5:1.1,'brick');
 const jjNx=Math.max(2,Math.round(jjW/6)),jjNz=Math.max(2,Math.round(jjD/6));
 for(let jjI=0;jjI<=jjNx;jjI++){const jjX=jjCx-jjW/2+jjW*jjI/jjNx;if(!(jjSkipFront&&Math.abs(jjX-jjCx)<jjSkipFront))jjPil(jjX,jjCz+jjD/2+.2,true);jjPil(jjX,jjCz-jjD/2-.2,true);}
 for(let jjI=1;jjI<jjNz;jjI++){const jjZ=jjCz-jjD/2+jjD*jjI/jjNz;jjPil(jjCx-jjW/2-.2,jjZ,false);jjPil(jjCx+jjW/2+.2,jjZ,false);}}
// a flight: solid fill under the steps, the marble steps, brick cheek walls with a sloping marble coping
// (jjStairs alone draws each step as a thin floating slab). jjCheek: false, or the sides [-1,1] that get a cheek
function jjTempleFlight(jjX,jjY,jjZTop,jjW,jjRun,jjRise,jjSteps,jjCheek){const jjSh=jjRise/jjSteps,jjSd=jjRun/jjSteps,jjZB=jjZTop+jjRun;
 const jjS=new THREE.Shape();jjS.moveTo(jjZB-jjSd,0);jjS.lineTo(jjZTop,0);jjS.lineTo(jjZTop,jjRise-jjSh);jjS.closePath();
 const jjFill=new THREE.ExtrudeGeometry(jjS,{depth:jjW,bevelEnabled:false});jjMesh(jjFill,JMAT.brickDeep,jjX+jjW/2,jjY,0,-Math.PI/2);
 jjStairs(jjX,jjY,jjZTop+jjRun/2,jjW,jjRun,jjRise,jjSteps,0,{mat:'marble'});
 if(jjCheek===false)return;const jjCw=1.2,jjCh=1.15;const jjC=new THREE.Shape();jjC.moveTo(jjZB+.5,0);jjC.lineTo(jjZB+.5,jjCh);jjC.lineTo(jjZTop,jjRise+jjCh);jjC.lineTo(jjZTop,0);jjC.closePath();
 const jjCg=new THREE.ExtrudeGeometry(jjC,{depth:jjCw,bevelEnabled:false});
 for(const jjSd2 of (Array.isArray(jjCheek)?jjCheek:[-1,1])){const jjXc=jjX+jjSd2*(jjW/2+jjCw/2);jjMesh(jjCg,JMAT.brick,jjXc+jjCw/2,jjY,0,-Math.PI/2);
  jjTempleSlab([jjXc,jjY+jjCh+.12,jjZB+.5],[jjXc,jjY+jjRise+jjCh+.12,jjZTop],jjCw+.3,.25,'marble');}}
// a marble balustrade from (x0,z0) to (x1,z1) on a deck at y: plinth, balusters, rail, piers every ~6 m
function jjTempleBalustrade(jjX0,jjZ0,jjX1,jjZ1,jjY){const jjL=Math.hypot(jjX1-jjX0,jjZ1-jjZ0);if(jjL<.5)return;const jjRy=Math.atan2(jjX1-jjX0,jjZ1-jjZ0),jjMx=(jjX0+jjX1)/2,jjMz=(jjZ0+jjZ1)/2;
 jjWithYaw(jjMx,jjY,jjMz,jjRy,()=>{jjBox(jjMx,jjY+.12,jjMz,.5,.24,jjL,'marble');jjBox(jjMx,jjY+1.02,jjMz,.42,.16,jjL,'marble');
  const jjN=Math.floor(jjL/.42);for(let jjI=0;jjI<jjN;jjI++)jjBox(jjMx,jjY+.6,jjMz-jjL/2+(jjI+.5)*jjL/jjN,.16,.72,.16,'marble');
  const jjP=Math.max(1,Math.round(jjL/6));for(let jjI=0;jjI<=jjP;jjI++){const jjZ=jjMz-jjL/2+jjI*jjL/jjP;jjBox(jjMx,jjY+.62,jjZ,.62,1.24,.62,'brick');jjBox(jjMx,jjY+1.3,jjZ,.74,.14,.74,'marble');}});}
// the monumental gate arch: one brick mass with a round-headed opening, marble archivolt and jambs,
// engaged ornamental shafts, banded piers, cornice, crenellated attic, gold sun discs, corner turrets
function jjTempleGateArch(jjCz,jjY){const K=JJ_TEMPLE_K,jjHW=K.archOuterHalfW,jjOW=K.archHalfW,jjSp=K.archSpring,jjR=K.archR,jjH=K.archH,jjDp=K.archDepth;
 const jjS=new THREE.Shape();jjS.moveTo(-jjHW,0);jjS.lineTo(-jjHW,jjH);jjS.lineTo(jjHW,jjH);jjS.lineTo(jjHW,0);jjS.lineTo(jjOW,0);jjS.lineTo(jjOW,jjSp);
 for(let jjI=1;jjI<32;jjI++){const jjA=Math.PI*jjI/32;jjS.lineTo(jjR*Math.cos(jjA),jjSp+jjR*Math.sin(jjA));}jjS.lineTo(-jjOW,jjSp);jjS.lineTo(-jjOW,0);jjS.closePath();
 const jjG=new THREE.ExtrudeGeometry(jjS,{depth:jjDp,bevelEnabled:false});jjG.translate(0,0,-jjDp/2);jjMesh(jjG,JMAT.brick,0,jjY,jjCz,0);
 if(!KIT.defs.jj_temple_archivolt)kdef('jj_temple_archivolt',new THREE.TorusGeometry(1,.075,8,32,Math.PI),JMAT.marble);
 const jjPw=jjHW-jjOW,jjPx=(jjHW+jjOW)/2;
 for(const jjF of [-1,1]){const jjFz=jjCz+jjF*jjDp/2;
  jjPut('jj_temple_archivolt',null,null,0,jjY+jjSp,jjFz,jjR+.42,jjR+.42,jjR+.42,undefined,jjF<0?qEuler(0,Math.PI,0):null);
  for(const jjSx of [-1,1]){jjBox(jjSx*(jjOW+.32),jjY+jjSp/2,jjFz,.64,jjSp,.5,'marble');
   jjBox(jjSx*jjPx,jjY+jjSp+.2,jjFz,jjPw,.4,.5,'marble'); // impost band
   jjBrickShaft(jjSx*jjPx,jjY,jjFz+jjF*.75,.72,10,{pattern:jjF>0?'diamond':'chevron',section:'round',relief:true,cap:'corbel'});
   if(jjF<0)jjWithYaw(jjSx*jjPx,jjY,jjFz,Math.PI,()=>jjTemplePorthole(jjSx*jjPx,jjY+15.4,jjFz+.05,1.25));}
  // gold sun disc on the attic, with rays
  jjPut('jj_cyl_gold_32',JJGEO.cyl32,JMAT.gold,0,jjY+19.15,jjFz+jjF*.12,1.35,.25,1.35,undefined,qEuler(Math.PI/2,0,0));
  for(let jjI=0;jjI<12;jjI++){const jjA=jjI*Math.PI/6;jjBeam([Math.cos(jjA)*1.45,jjY+19.15+Math.sin(jjA)*1.45,jjFz+jjF*.1],[Math.cos(jjA)*2.05,jjY+19.15+Math.sin(jjA)*2.05,jjFz+jjF*.1],.09,'gold');}}
 for(const jjSx of [-1,1]){jjBox(jjSx*jjPx,jjY+.5,jjCz,jjPw+.5,1,jjDp+.6,'brickDeep');
  for(const jjYY of [3.4,7.2])jjBox(jjSx*jjPx,jjY+jjYY,jjCz,jjPw+.2,.42,jjDp+.2,'brickYellow');}
 jjBox(0,jjY+17.85,jjCz,jjHW*2+.2,.42,jjDp+.2,'brickYellow');
 jjCornice(0,jjY+jjH,jjCz,jjHW*2,jjDp,0);const jjTop=jjY+jjH+1.21;
 for(const jjF of [-1,1])jjCrenel(0,jjTop,jjCz+jjF*(jjDp/2+.1),jjHW*2+.4,.5,1.5);
 for(const jjSx of [-1,1])jjWithYaw(jjSx*(jjHW+.1),jjTop,jjCz,Math.PI/2,()=>jjCrenel(jjSx*(jjHW+.1),jjTop,jjCz,jjDp,.5,1.5));
 for(const jjSx of [-1,1])jjTurret(jjSx*(jjHW-1.3),jjTop,jjCz,1.05,3.4,{kind:'gold',pattern:'ogee'});
 jjBox(0,jjTop+.5,jjCz,3.2,1,2.4,'brickYellow');jjCylinder(0,jjTop+1.3,jjCz,1.0,.6,'marble',undefined,32);jjDome(0,jjTop+1.6,jjCz,1.1,{kind:'gold',shape:'onion'});
 // banners on the outward (+z) pier faces, above the engaged shafts
 for(const jjSx of [-1,1])jjBanner(jjSx*jjPx,jjY+16.3,jjCz+jjDp/2+.3,0,{w:2.2,h:4.6});}
// the stepped pyramidal tower (shikhara) over the shrine: tiers with projecting central bays, marble
// lips, gold corner finials, an amalaka and a gold kalasha on top
function jjTempleShikhara(jjX,jjY,jjZ,jjW,jjD,jjTiers){let jjYY=jjY;for(let jjI=0;jjI<jjTiers;jjI++){const jjF=1-jjI/(jjTiers+1.6),jjTw=jjW*jjF,jjTd=jjD*jjF,jjTh=3.15-jjI*.14,jjMat=jjI%2?'brickYellow':'brick';
  jjBox(jjX,jjYY+jjTh/2,jjZ,jjTw,jjTh,jjTd,jjMat);
  jjBox(jjX,jjYY+jjTh/2,jjZ,jjTw*.42,jjTh*.94,jjTd+1.1,jjI%2?'brick':'brickYellow');jjBox(jjX,jjYY+jjTh/2,jjZ,jjTw+1.1,jjTh*.94,jjTd*.42,jjI%2?'brick':'brickYellow');
  jjBox(jjX,jjYY+jjTh-.12,jjZ,jjTw+.55,.24,jjTd+.55,'marble');jjBox(jjX,jjYY+jjTh-.12,jjZ,jjTw*.42+.4,.26,jjTd+1.5,'marble');jjBox(jjX,jjYY+jjTh-.12,jjZ,jjTw+1.5,.26,jjTd*.42+.4,'marble');
  // small niche porthole on the front bay of the lower tiers
  if(jjI<4)jjTemplePorthole(jjX,jjYY+jjTh*.5,jjZ+jjTd/2+.56,.55*jjF+.25);
  if(jjI%2===0)for(const jjSx of [-1,1])for(const jjSz of [-1,1]){jjCylinder(jjX+jjSx*(jjTw/2-.3),jjYY+jjTh+.25,jjZ+jjSz*(jjTd/2-.3),.32,.5,'brickYellow');jjPut('jj_temple_finial',new THREE.SphereGeometry(1,12,8),JMAT.gold,jjX+jjSx*(jjTw/2-.3),jjYY+jjTh+.75,jjZ+jjSz*(jjTd/2-.3),.3,.42,.3);}
  jjYY+=jjTh;}
 const jjTopW=jjW*(1-(jjTiers-1)/(jjTiers+1.6));
 jjCylinder(jjX,jjYY+.4,jjZ,jjTopW*.42,.8,'brick',undefined,32);
 jjPut('jj_temple_amalaka',new THREE.CylinderGeometry(1,1,1,24),JMAT.gold,jjX,jjYY+1.25,jjZ,jjTopW*.5,.9,jjTopW*.5);
 for(let jjI=0;jjI<16;jjI++){const jjA=jjI*TAU/16;jjBeam([jjX+Math.cos(jjA)*jjTopW*.5,jjYY+.85,jjZ+Math.sin(jjA)*jjTopW*.5],[jjX+Math.cos(jjA)*jjTopW*.5,jjYY+1.65,jjZ+Math.sin(jjA)*jjTopW*.5],.12,'gold');}
 jjPut('jj_temple_finial',null,null,jjX,jjYY+2.35,jjZ,1.0,.8,1.0);jjBeam([jjX,jjYY+2.9,jjZ],[jjX,jjYY+5.2,jjZ],.12,'gold');jjPut('jj_temple_finial',null,null,jjX,jjYY+3.6,jjZ,.42,.42,.42);
 return jjYY+5.2;}
// jjWall's {band} puts a course at mid-height, through the windows: these walls take a plinth course, a top
// course and the marble coping instead
function jjTempleBands(jjCx,jjY,jjCz,jjW,jjD,jjH){for(const jjYY of [jjY+.7,jjY+jjH-.42])jjBox(jjCx,jjYY,jjCz,jjW+.12,.22,jjD+.12,'brickYellow');
 // the coping is a marble ring, the roof inside it terracotta-paved (a full marble slab reads as a white roof from above)
 const jjT=jjY+jjH+.12;for(const jjS of [-1,1]){jjBox(jjCx,jjT,jjCz+jjS*(jjD/2-.12),jjW+.65,.32,1.1,'marble');jjBox(jjCx+jjS*(jjW/2-.12),jjT,jjCz,1.1,.32,jjD+.65,'marble');}jjBox(jjCx,jjY+jjH+.03,jjCz,jjW-.9,.06,jjD-.9,'tile');}
// a little lamp: a glow lantern on a short gold stem (lit buildings)
function jjTempleLamp(jjX,jjY,jjZ){jjBeam([jjX,jjY,jjZ],[jjX,jjY+.35,jjZ],.07,'gold');jjBox(jjX,jjY+.62,jjZ,.34,.5,.34,'glow');jjBox(jjX,jjY+.93,jjZ,.46,.1,.46,'gold');}

// planting spots (local): the platform corners behind the spires and along the lower approach
const JJ_TEMPLE_PLANT_SPOTS=[[-14,0,40],[14,0,40],[-27.5,0,30],[27.5,0,30],[-22,6,-2],[22,6,-2],[-22,6,8],[22,6,8]];

function buildJjTempleSun(jjG,jjO){reseed(9400+(jjO.v|0));jjTempleSolve();const K=JJ_TEMPLE_K,PH=K.PH,SY=PH+K.SH;
 // --- the temple platform and its long front flight
 const jjPz=(K.platZ0+K.platZ1)/2,jjPd=K.platZ1-K.platZ0;
 jjTemplePodium(0,0,jjPz,K.platW,jjPd,PH,K.stairW/2+1.4);
 jjTempleFlight(0,0,K.platZ1,K.stairW,K.stairRun,PH,38);
 for(const jjSx of [-1,1]){const jjX=jjSx*(K.stairW/2+.6),jjZ=K.platZ1+K.stairRun+1.65;jjBrickShaft(jjX,0,jjZ,.8,6.2,{pattern:jjSx<0?'spiral':'fleur',section:'octagon',relief:true,cap:'star'});jjTempleLamp(jjX,6.6,jjZ);}
 // balustrade round the platform, open at the head of the stairs
 const jjBx=K.platW/2-.4,jjBz0=K.platZ0+.4,jjBz1=K.platZ1-.4,jjOpen=K.stairW/2+1.3;
 jjTempleBalustrade(-jjBx,jjBz0,jjBx,jjBz0,PH);jjTempleBalustrade(-jjBx,jjBz0,-jjBx,jjBz1,PH);jjTempleBalustrade(jjBx,jjBz0,jjBx,jjBz1,PH);
 jjTempleBalustrade(-jjBx,jjBz1,-jjOpen,jjBz1,PH);jjTempleBalustrade(jjOpen,jjBz1,jjBx,jjBz1,PH);
 // --- the monumental arch at the head of the stairs
 jjTempleGateArch(K.archZ,PH);
 // --- reflecting channel on the axis, between the sanctuary flight and the arch, with lamp columns
 jjBox(0,PH+.18,8.6,7.2,.36,7.6,'marble');jjBox(0,PH+.3,8.6,6.2,.2,6.6,'water');
 for(const jjSx of [-1,1])for(const jjZ of [6,11.2]){jjBrickShaft(jjSx*5.6,PH,jjZ,.5,5.4,{pattern:jjZ<8?'ogee':'diamond',section:'round',relief:true,cap:'star'});jjTempleLamp(jjSx*5.6,PH+5.75,jjZ);}
 // --- sanctuary podium and its flight (the observer stands on top, at the door)
 const jjSz=(K.podZ0+K.podZ1)/2,jjSd=K.podZ1-K.podZ0;
 jjTemplePodium(0,PH,jjSz,K.podW,jjSd,K.SH,6.4);jjTempleFlight(0,PH,K.podZ1,10,10,K.SH,30);
 jjTempleBalustrade(-K.podW/2+.4,K.podZ1,-6.3,K.podZ1,SY);jjTempleBalustrade(6.3,K.podZ1,K.podW/2-.4,K.podZ1,SY);
 for(const jjSx of [-1,1])jjTempleBalustrade(jjSx*(K.podW/2-.4),K.podZ1,jjSx*(K.podW/2-.4),K.podZ0+.4,SY);jjTempleBalustrade(-K.podW/2+.4,K.podZ0+.4,K.podW/2-.4,K.podZ0+.4,SY);
 // --- mandapa (front hall) with a portico, a gold ribbed dome on a drum
 const jjMz0=K.doorZ,jjMz1=-23,jjMd=jjMz0-jjMz1,jjMc=(jjMz0+jjMz1)/2,jjWallH=9,jjTopY=SY+jjWallH+.28;
 jjWall(0,SY,jjMc,22,jjWallH,jjMd,0,{});jjTempleBands(0,SY,jjMc,22,jjMd,jjWallH);
 jjDoor(0,SY,jjMz0,3.4,6.2,0,{mat:'dark'});jjBox(0,SY+6.9,jjMz0+.1,4.6,.5,.4,'gold');
 for(const jjSx of [-1,1]){jjTempleLamp(jjSx*2.75,SY+3.0,jjMz0+.35);jjWindow(jjSx*6.6,SY+3.7,jjMz0,1.6,3.4,0,{lit:true});}
 for(const jjSx of [-1,1])for(const jjX of [3.7,8.4])jjColumn(jjSx*jjX,SY,-7.3,.5,7.4,{pattern:jjX<5?'diamond':'chevron'});
 jjBox(0,SY+7.85,-8.4,19.4,.9,3.6,'brickYellow');jjBox(0,SY+8.45,-8.4,20.2,.3,4.2,'marble');jjCrenel(0,SY+8.6,-6.75,20.2,.45,1.0);
 for(const jjSx of [-1,1])jjWithYaw(jjSx*11,SY,jjMc,jjSx*Math.PI/2,()=>{jjTemplePorthole(jjSx*11-2.5,SY+6.4,jjMc+.06,1.0);jjTemplePorthole(jjSx*11+2.5,SY+6.4,jjMc+.06,1.0);jjWindow(jjSx*11,SY+3.6,jjMc,1.5,3,0,{lit:true});});
 jjCrenel(0,jjTopY,jjMz0-.2,22.4,.5,1.1);
 for(const jjSx of [-1,1])jjTurret(jjSx*10.2,jjTopY,jjMz0-1.6,.85,2.6,{kind:'gold',pattern:'spiral'});
 jjCylinder(0,jjTopY+.3,jjMc,6.1,.6,'marble',undefined,32);jjCylinder(0,jjTopY+2.1,jjMc,5.5,3.0,'brick',undefined,32);jjCylinder(0,jjTopY+2.1,jjMc,5.62,.4,'brickYellow',undefined,32);jjCylinder(0,jjTopY+3.75,jjMc,5.8,.3,'marble',undefined,32);
 for(let jjI=0;jjI<8;jjI++){const jjA=jjI*TAU/8+TAU/16;jjWithYaw(0,0,jjMc,jjA,()=>jjTemplePorthole(0,jjTopY+2.0,jjMc+5.52,.62));}
 jjDome(0,jjTopY+3.9,jjMc,5.5,{kind:'gold',shape:'hemi',ribs:true});
 // --- shrine with the stepped shikhara
 const jjGz0=jjMz1,jjGz1=K.podZ0+2.2,jjGc=(jjGz0+jjGz1)/2,jjGd=jjGz0-jjGz1;
 jjWall(0,SY,jjGc,18,jjWallH,jjGd,0,{});jjTempleBands(0,SY,jjGc,18,jjGd,jjWallH);
 for(const jjSx of [-1,1])jjWithYaw(jjSx*9,SY,jjGc,jjSx*Math.PI/2,()=>{jjWindow(jjSx*9,SY+4.4,jjGc,1.4,3.4,0,{lit:true});jjTemplePorthole(jjSx*9,SY+7.6,jjGc+.06,.8);});
 jjWithYaw(0,SY,jjGz1,Math.PI,()=>{jjWindow(0,SY+4.4,jjGz1,1.4,3.4,0,{lit:true});});
 const jjShTop=jjTempleShikhara(0,jjTopY,jjGc,14,10.4,8);
 for(const jjSx of [-1,1])for(const jjSz of [-1,1])jjTurret(jjSx*8.2,jjTopY,jjGc+jjSz*(jjGd/2-.8),.75,2.2,{kind:'gold',pattern:'ogee'});
 // --- four thick staged spires at the platform corners
 for(const jjSx of [-1,1])for(const jjZ of [16.5,-37.5]){jjCylinder(jjSx*19.5,PH+1.2,jjZ,3.5,2.4,'brickDeep',undefined,32);jjCylinder(jjSx*19.5,PH+2.5,jjZ,3.65,.3,'marble',undefined,32);
  jjSpire(jjSx*19.5,PH+2.6,jjZ,2.7,4,{stageH:4.8,kind:'gold',pattern:jjZ>0?'tracery':'chevron'});}
 // --- inspector volumes
 jjReg('Temple platform and stairs',0,0,40,PH,{part:'platform'});jjReg('Solstice arch',0,K.archZ,10.5,PH+K.archH+6,{part:'arch'});
 jjReg('Sanctuary and shikhara',0,-23,15,jjShTop,{part:'sanctuary'});for(const jjSx of [-1,1])for(const jjZ of [16.5,-37.5])jjReg('Corner spire',jjSx*19.5,jjZ,3.6,PH+24,{part:'spire'});
 // --- the observer and the arch, in world space (read by jjSolsticeCheck)
 const jjM=jjG.matrixWorld,jjS=(JJ.cur&&JJ.cur.scale)||1,jjW=(jjX,jjY,jjZ)=>new THREE.Vector3(jjX,jjY,jjZ).applyMatrix4(jjM).toArray(),jjDirW=(jjX,jjY,jjZ)=>new THREE.Vector3(jjX,jjY,jjZ).transformDirection(jjM).toArray();
 JJ_TEMPLE_OBS={key:'jj_temple_sun',eye:jjW(...jjTempleEyeLocal()),eyeLocal:jjTempleEyeLocal(),archOrigin:jjW(0,PH,K.archZ),archNormal:jjDirW(0,0,1),archRight:jjDirW(1,0,0),
  halfW:K.archHalfW*jjS,spring:K.archSpring*jjS,radius:K.archR*jjS,depth:K.archDepth*jjS,site:[jjG.position.x,jjG.position.z],ry:jjG.rotation.y};}

JJ.def({key:'jj_temple_sun',name:'Solstice temple',family:'sacred',row:'Temple',w:50,d:86,h:48,r:43,cls:'building',
 tags:{type:['religious','civic'],wealth:'civic',lit:true,role:'landmark'},
 // local +z (through the arch) points at the solstice sunset azimuth A: ry = PI - A
 get ry(){return jjTempleSolve().ry;},
 get views(){const jjS=jjTempleSolve(),jjE=jjTempleEyeLocal(),jjAl=jjS.altitudeDeg*Math.PI/180,jjL=60;
  // the sun in the local frame: world sun direction turned back by -ry (x is ~0 by construction)
  const jjV=KratorSky.sunDir(jjS.hour,jjS.day),jjC=Math.cos(jjS.ry),jjSn=Math.sin(jjS.ry),jjLx=jjV.x*jjC-jjV.z*jjSn,jjLz=jjV.x*jjSn+jjV.z*jjC;
  return{'Solstice — through the arch':{cam:jjE,tgt:[jjE[0]+jjLx*jjL,jjE[1]+jjV.y*jjL,jjE[2]+jjLz*jjL],sky:{hour:jjS.hour,day:jjS.day}},
   'Solstice temple — arch from the stairs':{cam:[-5,1.7,46],tgt:[0,12,10]}};},
 build:buildJjTempleSun});
