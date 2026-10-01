// Jimjam hospitality: the inn, the tavern and the caravanserai. Local frame: origin at the plot
// centre on the ground, +z is the front, y up. Seeds 9300-9349.
// The jjHosp* drawing helpers below are also used by 73-jj-civic.js, which loads after this file.
// Arched openings are real holes: a wall panel with a round-headed opening, extruded, cached per size
// and instanced (one draw call per size and material), so courts and galleries can be seen into.
const JJHOSP_GEO={};
function jjHospKey(jjA){return jjA.map(jjV=>typeof jjV==='number'?jjV.toFixed(2):jjV).join('_');}
// wall panel w x h (base at y=0, centred on x and z) with one round-headed opening of width ow springing at sp
function jjHospPanelGeo(jjW,jjH,jjOW,jjSp,jjD){const jjK='p'+jjHospKey([jjW,jjH,jjOW,jjSp,jjD]);if(JJHOSP_GEO[jjK])return JJHOSP_GEO[jjK];
 const jjR=jjOW/2,jjS=new THREE.Shape();jjS.moveTo(-jjW/2,0);jjS.lineTo(-jjR,0);jjS.lineTo(-jjR,jjSp);
 for(let jjI=1;jjI<12;jjI++){const jjA=Math.PI-jjI*Math.PI/12;jjS.lineTo(Math.cos(jjA)*jjR,jjSp+Math.sin(jjA)*jjR);}
 jjS.lineTo(jjR,jjSp);jjS.lineTo(jjR,0);jjS.lineTo(jjW/2,0);jjS.lineTo(jjW/2,jjH);jjS.lineTo(-jjW/2,jjH);
 const jjG=new THREE.ExtrudeGeometry(jjS,{depth:jjD,bevelEnabled:false,curveSegments:1});jjG.translate(0,0,-jjD/2);return JJHOSP_GEO[jjK]=jjG;}
// semicircular ring (archivolt), centre at the springing line
function jjHospRingGeo(jjR,jjT,jjD){const jjK='r'+jjHospKey([jjR,jjT,jjD]);if(JJHOSP_GEO[jjK])return JJHOSP_GEO[jjK];
 const jjS=new THREE.Shape(),jjO=jjR+jjT;jjS.moveTo(jjO,0);for(let jjI=1;jjI<=12;jjI++){const jjA=jjI*Math.PI/12;jjS.lineTo(Math.cos(jjA)*jjO,Math.sin(jjA)*jjO);}
 jjS.lineTo(-jjR,0);for(let jjI=11;jjI>=1;jjI--){const jjA=jjI*Math.PI/12;jjS.lineTo(Math.cos(jjA)*jjR,Math.sin(jjA)*jjR);}jjS.lineTo(jjR,0);
 const jjG=new THREE.ExtrudeGeometry(jjS,{depth:jjD,bevelEnabled:false,curveSegments:1});jjG.translate(0,0,-jjD/2);return JJHOSP_GEO[jjK]=jjG;}
// half disc (lunette, gable infill), centre at its base line
function jjHospLunetteGeo(jjR,jjD){const jjK='l'+jjHospKey([jjR,jjD]);if(JJHOSP_GEO[jjK])return JJHOSP_GEO[jjK];
 const jjS=new THREE.Shape();jjS.moveTo(jjR,0);for(let jjI=1;jjI<16;jjI++){const jjA=jjI*Math.PI/16;jjS.lineTo(Math.cos(jjA)*jjR,Math.sin(jjA)*jjR);}jjS.lineTo(-jjR,0);
 const jjG=new THREE.ExtrudeGeometry(jjS,{depth:jjD,bevelEnabled:false,curveSegments:1});jjG.translate(0,0,-jjD/2);return JJHOSP_GEO[jjK]=jjG;}
// barrel vault shell along z, springing at y=0, UVs in metres (u round the arc, v along the length)
function jjHospVaultGeo(jjR,jjLen){const jjK='v'+jjHospKey([jjR,jjLen]);if(JJHOSP_GEO[jjK])return JJHOSP_GEO[jjK];
 const jjG=new THREE.CylinderGeometry(jjR,jjR,jjLen,24,1,true,Math.PI/2,Math.PI);jjG.rotateX(Math.PI/2);const jjUv=jjG.attributes.uv;
 for(let jjI=0;jjI<jjUv.count;jjI++)jjUv.setXY(jjI,jjUv.getX(jjI)*Math.PI*jjR,jjUv.getY(jjI)*jjLen);return JJHOSP_GEO[jjK]=jjG;}
function jjHospPut(jjName,jjGeo,jjMat,jjX,jjY,jjZ){jjPut('jjhosp_'+jjName+'_'+jjMat,jjGeo,JMAT[jjMat],jjX,jjY,jjZ,1,1,1);}
// One arched bay: wall panel (base y, centred on z, faces +z before ry) with marble archivolt and imposts.
// o: depth, mat, trim (archivolt material or false), back (material of a void plane behind the opening),
// backOff, rail (balustrade height), lit (glass instead of the back plane)
function jjHospBay(jjX,jjY,jjZ,jjW,jjH,jjOW,jjSpring,jjRy,jjO){jjO=jjO||{};const jjD=jjO.depth||.6,jjMat=jjO.mat||'brick',jjR=jjOW/2,jjSp=Math.max(.3,Math.min(jjSpring,jjH-.14-jjR));
 jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{
  jjHospPut('p'+jjHospKey([jjW,jjH,jjOW,jjSp,jjD]),jjHospPanelGeo(jjW,jjH,jjOW,jjSp,jjD),jjMat,jjX,jjY,jjZ);
  if(jjO.trim!==false){const jjT=Math.min(.3,jjR*.2),jjTm=jjO.trim||'marble';jjHospPut('r'+jjHospKey([jjR,jjT,jjD+.12]),jjHospRingGeo(jjR,jjT,jjD+.12),jjTm,jjX,jjY+jjSp,jjZ);
   for(const jjS of [-1,1])jjBox(jjX+jjS*(jjR+jjT*.3),jjY+jjSp-.1,jjZ,jjT+.2,.2,jjD+.16,'marble');
   jjBox(jjX,jjY+jjSp+jjR+jjT*.55,jjZ+jjD/2+.05,jjT*1.3,jjT*1.5,.12,jjTm);}
  if(jjO.back)jjBox(jjX,jjY+(jjSp+jjR)/2,jjZ-jjD/2-(jjO.backOff||.04),jjOW+.3,jjSp+jjR+.1,.06,jjO.back);
  if(jjO.rail){const jjRh=jjO.rail;jjBox(jjX,jjY+jjRh-.07,jjZ,jjOW+.04,.14,jjD*.9,'marble');jjBox(jjX,jjY+.06,jjZ,jjOW+.04,.12,jjD*.9,'marble');
   const jjN=Math.max(3,Math.round(jjOW/.32));for(let jjI=0;jjI<jjN;jjI++)jjBox(jjX-jjOW/2+(jjI+.5)*jjOW/jjN,jjY+jjRh/2,jjZ,.11,jjRh-.2,.11,'cream');}
 });}
// n equal bays along local x, centred at (cx,cz), turned by ry. o.skip: bay indices to leave out; o.each(i,x): extra drawing
function jjHospRow(jjCx,jjY,jjCz,jjLen,jjN,jjH,jjOW,jjSpring,jjRy,jjO){jjO=jjO||{};const jjBw=jjLen/jjN;
 jjWithYaw(jjCx,jjY,jjCz,jjRy,()=>{for(let jjI=0;jjI<jjN;jjI++){const jjX=jjCx-jjLen/2+(jjI+.5)*jjBw;if(jjO.skip&&jjO.skip.indexOf(jjI)>=0)continue;jjHospBay(jjX,jjY,jjCz,jjBw,jjH,jjOW,jjSpring,0,jjO);if(jjO.each)jjO.each(jjI,jjX);}});}
// a tall arched window on a solid wall face (sill at y, face at z, faces +z before ry), proud of the face
function jjHospArchWin(jjX,jjY,jjZ,jjW,jjH,jjRy,jjO){jjO=jjO||{};const jjR=jjW/2,jjRect=Math.max(.2,jjH-jjR),jjFill=jjO.fill||(jjO.lit?'glass':'dark'),jjT=Math.min(.24,jjW*.14),jjTm=jjO.trim||'marble';
 jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{
  jjBox(jjX,jjY+jjRect/2,jjZ+.05,jjW,jjRect,.1,jjFill);jjHospPut('l'+jjHospKey([jjR,.1]),jjHospLunetteGeo(jjR,.1),jjFill,jjX,jjY+jjRect,jjZ+.05);
  jjHospPut('r'+jjHospKey([jjR,jjT,.24]),jjHospRingGeo(jjR,jjT,.24),jjTm,jjX,jjY+jjRect,jjZ+.12);
  for(const jjS of [-1,1])jjBox(jjX+jjS*(jjR+jjT/2),jjY+jjRect/2,jjZ+.12,jjT,jjRect,.24,jjTm);
  jjBox(jjX,jjY-.08,jjZ+.16,jjW+jjT*2+.22,.16,.36,'marble');
  if(jjO.mullion)jjBox(jjX,jjY+jjRect/2+.1,jjZ+.12,.08,jjRect+jjR*.6,.06,'marble');
  if(jjO.shutter)for(const jjS of [-1,1])jjBox(jjX+jjS*(jjR+jjT+jjW*.22),jjY+jjRect*.5,jjZ+.13,jjW*.42,jjRect*.95,.08,'terracotta');
 });}
// wall lamp: iron bracket and a glowing lantern, on a face at z (faces +z before ry)
function jjHospLamp(jjX,jjY,jjZ,jjRy){jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{jjBeam([jjX,jjY+.35,jjZ],[jjX,jjY+.35,jjZ+.55],.035,'iron');jjBox(jjX,jjY,jjZ+.55,.26,.42,.26,'glow');jjBox(jjX,jjY+.25,jjZ+.55,.34,.08,.34,'gold');jjBox(jjX,jjY-.25,jjZ+.55,.2,.08,.2,'gold');});}
// a projecting balcony on corbels with a marble balustrade, floor at y, wall face at z
function jjHospBalcony(jjX,jjY,jjZ,jjW,jjDep,jjRy){jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{
 jjBox(jjX,jjY-.1,jjZ+jjDep/2,jjW,.2,jjDep,'marble');jjBox(jjX,jjY-.32,jjZ+jjDep/2-.05,jjW-.2,.24,jjDep-.1,'brickYellow');
 for(let jjI=0;jjI<4;jjI++)jjBox(jjX-jjW/2+.35+jjI*(jjW-.7)/3,jjY-.75,jjZ+jjDep*.3,.24,.7,jjDep*.55,'brickYellow');
 jjBox(jjX,jjY+.95,jjZ+jjDep-.08,jjW,.12,.16,'marble');for(const jjS of [-1,1])jjBox(jjX+jjS*(jjW/2-.08),jjY+.95,jjZ+jjDep/2,.16,.12,jjDep,'marble');
 const jjN=Math.round(jjW/.3);for(let jjI=0;jjI<=jjN;jjI++)jjBox(jjX-jjW/2+.08+jjI*(jjW-.16)/jjN,jjY+.45,jjZ+jjDep-.08,.1,.9,.1,'cream');
 for(const jjS of [-1,1])for(let jjI=1;jjI<4;jjI++)jjBox(jjX+jjS*(jjW/2-.08),jjY+.45,jjZ+jjI*jjDep/4,.1,.9,.1,'cream');});}
// Place a registered furniture piece at a LOCAL point of the building being built. JJFURN.place with the
// building group as parent goes wrong (useGroupXF reads the child's local matrix, so the piece lands near
// the world origin); place it in the scene at the world point instead.
function jjHospFurn(jjKey,jjX,jjY,jjZ,jjRy,jjO){const jjC=JJ.cur;if(!jjC)return null;const jjP=new THREE.Vector3(jjX,jjY,jjZ).applyMatrix4(jjC.G.matrixWorld);
 return JJFURN.place(JJ.scene,jjKey,jjP.x,jjP.z,(jjRy||0)+jjC.ry,Object.assign({},jjO||{},{y:jjP.y}));}
// four strips round the outside of a w x d rectangle (string courses, cornices, base courses)
function jjHospRing4(jjCx,jjCz,jjW,jjD,jjY,jjH,jjT,jjMat){jjBox(jjCx,jjY,jjCz+jjD/2+jjT/2-.02,jjW+jjT*2,jjH,jjT,jjMat);jjBox(jjCx,jjY,jjCz-jjD/2-jjT/2+.02,jjW+jjT*2,jjH,jjT,jjMat);
 for(const jjS of [-1,1])jjBox(jjCx+jjS*(jjW/2+jjT/2-.02),jjY,jjCz,jjT,jjH,jjD,jjMat);}
// crenellated parapet standing on the edge of a w x d rectangle (base y)
function jjHospParapet(jjCx,jjY,jjCz,jjW,jjD,jjT,jjH){jjCrenel(jjCx,jjY,jjCz+jjD/2-jjT/2,jjW,jjT,jjH);jjCrenel(jjCx,jjY,jjCz-jjD/2+jjT/2,jjW,jjT,jjH);
 for(const jjS of [-1,1]){const jjX=jjCx+jjS*(jjW/2-jjT/2);jjWithYaw(jjX,jjY,jjCz,Math.PI/2,()=>jjCrenel(jjX,jjY,jjCz,jjD-jjT*2,jjT,jjH));}}
// a ring of merlons on a round tower top (base y)
function jjHospRoundCrenel(jjX,jjY,jjZ,jjR,jjN){jjCylinder(jjX,jjY+.3,jjZ,jjR,.6,'brick',undefined,32);jjCylinder(jjX,jjY+.66,jjZ,jjR+.12,.14,'marble',undefined,32);
 for(let jjI=0;jjI<jjN;jjI++){const jjA=jjI*TAU/jjN;jjBox(jjX+Math.cos(jjA)*(jjR-.22),jjY+1.05,jjZ+Math.sin(jjA)*(jjR-.22),.44,.7,TAU*jjR/jjN*.55,'brickYellow',undefined,-jjA);}}
// barrel vault roof along z on walls whose tops are at y; outer shell, transverse marble ribs, ridge
function jjHospVault(jjX,jjY,jjZ,jjR,jjLen,jjRibs,jjMat){jjHospPut('v'+jjHospKey([jjR,jjLen]),jjHospVaultGeo(jjR,jjLen),jjMat||'tile',jjX,jjY,jjZ);
 for(let jjI=0;jjI<jjRibs;jjI++){const jjZ0=jjZ-jjLen/2+(jjI+.5)*jjLen/jjRibs;jjHospPut('r'+jjHospKey([jjR,.22,.34]),jjHospRingGeo(jjR,.22,.34),'marble',jjX,jjY,jjZ0);}
 for(const jjS of [-1,1])jjBox(jjX,jjY,jjZ+jjS*(jjLen/2-.15),jjR*2+.3,.3,.4,'marble');}

// ---------------------------------------------------------------------------------------------
// INN: three storeys round a court. Galleries on arches on every floor face the court; the carriage
// gate runs through a yellow gate tower with a slate ribbed lantern; stables and a yard at the back.
const JJHOSP_INN={H:3.6,TOP:10.8};
function buildJjHospInn(jjG,jjO){reseed(9300+(jjO.v|0));
 const jjH=JJHOSP_INN.H,jjTop=JJHOSP_INN.TOP,jjCz=3.5,jjPi=Math.PI;
 // court and gallery paving, with a raised round fountain plaza in the middle
 jjBox(0,.05,jjCz,20.4,.1,15.4,'marble');jjRoundPlaza(0,0,jjCz,2.6,{raised:false,inlay:true});jjBox(0,.05,14.2,3.6,.1,6,'marble');
 // room blocks (the gallery bands between them and the court arcades stay open)
 jjBox(-8.4,jjTop/2,13.6,13.2,jjTop,4.8,'brick');jjBox(8.4,jjTop/2,13.6,13.2,jjTop,4.8,'brick');
 jjBox(0,(3.45+jjTop)/2,13.6,3.6,jjTop-3.45,4.8,'brick');jjBox(0,3.38,13.6,3.6,.14,4.8,'brickYellow');
 jjBox(0,jjTop/2,-6.6,30,jjTop,4.8,'brick');for(const jjS of [-1,1])jjBox(jjS*12.6,jjTop/2,jjCz,4.8,jjTop,15.4,'brick');
 // roof slabs over each range (they also roof the top gallery) and the outer cornice and parapet
 jjBox(0,jjTop+.17,12.375,30,.34,7.25,'brickDeep');jjBox(0,jjTop+.17,-5.375,30,.34,7.25,'brickDeep');for(const jjS of [-1,1])jjBox(jjS*11.375,jjTop+.17,jjCz,7.25,.34,10.5,'brickDeep');
 for(const jjS of [-1,1]){jjBox(jjS*8.4,.45,16.09,13.6,.9,.22,'brickDeep');jjBox(jjS*8.4,.45,-9.09,13.6,.9,.22,'brickDeep');jjBox(jjS*15.09,.45,jjCz,.22,.9,25.4,'brickDeep');}for(const jjY of [jjH,jjH*2])jjHospRing4(0,jjCz,30,25,jjY,.24,.16,'brickYellow');
 jjHospRing4(0,jjCz,30,25,jjTop+.12,.42,.36,'marble');jjHospParapet(0,jjTop+.34,jjCz,30.4,25.4,.45,1.25);
 // court cornice over the top arcade
 jjBox(0,jjTop+.42,8.95,16.9,.3,1,'marble');jjBox(0,jjTop+.42,-1.95,16.9,.3,1,'marble');for(const jjS of [-1,1])jjBox(jjS*7.95,jjTop+.42,jjCz,1,.3,11.9,'marble');
 // GALLERIES: three floors of arcades round the court; the ground floor on patterned columns, the upper floors railed
 const jjPats=['diamond','spiral','chevron','fleur'];
 for(let jjF=0;jjF<3;jjF++){const jjY=jjF*jjH,jjOpt=jjF?{depth:.5,rail:1.0}:{depth:.5},jjOW=jjF?2.3:2.5,jjSp=jjF?1.55:1.85;
  jjHospRow(0,jjY,9,16,5,jjH,jjOW,jjSp,jjPi,jjOpt);jjHospRow(0,jjY,-2,16,5,jjH,jjOW,jjSp,0,jjOpt);
  jjHospRow(-8,jjY,jjCz,11,3,jjH,jjOW,jjSp,jjPi/2,jjOpt);jjHospRow(8,jjY,jjCz,11,3,jjH,jjOW,jjSp,-jjPi/2,jjOpt);
  // room doors and small windows on the back wall of each gallery
  for(const jjX of [-6.4,-3.2,0,3.2,6.4]){if(!(jjF===0&&jjX===0)){jjDoor(jjX,jjY,11.2,1.05,2.3,jjPi,{mat:'dark'});}jjDoor(jjX,jjY,-4.2,1.05,2.3,0,{mat:'dark'});}
  for(const jjZ of [-.17,3.5,7.17])for(const jjS of [-1,1])jjDoor(jjS*10.2,jjY,jjZ,1.05,2.3,-jjS*jjPi/2,{mat:'dark'});
  if(jjF>0){jjBox(0,jjY-.12,9.975,20.4,.3,2.45,'brickDeep');jjBox(0,jjY-.12,-3.075,20.4,.3,2.45,'brickDeep');for(const jjS of [-1,1])jjBox(jjS*9.1,jjY-.12,jjCz,2.2,.3,10.5,'brickDeep');}}
 for(const jjX of [-8,8])for(const jjZ of [-2,9])jjBox(jjX,jjTop/2,jjZ,.9,jjTop,.9,'brickYellow');
 let jjK=0;for(const jjX of [-4.8,-1.6,1.6,4.8]){jjColumn(jjX,0,8.5,.2,3.4,{pattern:jjPats[jjK++%4]});jjColumn(jjX,0,-1.5,.2,3.4,{pattern:jjPats[jjK++%4]});}
 for(const jjZ of [1.67,5.33])for(const jjS of [-1,1])jjColumn(jjS*7.5,0,jjZ,.2,3.4,{pattern:jjPats[jjK++%4]});
 // FRONT: the yellow gate tower with the carriage arch, a balcony, a gold porthole and a slate lantern dome
 jjHospBay(0,0,16.6,8,13.6,3,1.85,0,{depth:1.2,mat:'brickYellow'});jjBox(0,(11.14+13.6)/2,14.05,8,13.6-11.14,4.1,'brickYellow');
 for(const jjY of [jjH,jjH*2])jjBox(0,jjY,17.25,8.2,.24,.14,'marble');jjHospRing4(0,14.6,8,5.2,13.5,.4,.3,'marble');jjHospParapet(0,13.7,14.6,8.4,5.6,.4,1.2);
 jjHospBalcony(0,7.25,17.2,4.2,1.3,0);jjHospArchWin(0,7.3,17.2,1.4,2.6,0,{fill:'dark'});jjPorthole(0,10.75,17.24,0,1.05);
 jjCylinder(0,14.8,14.6,2.05,2.4,'brickYellow',undefined,32);jjCylinder(0,16.05,14.6,2.2,.14,'marble',undefined,32);
 for(let jjI=0;jjI<8;jjI++){const jjA=jjI*TAU/8+TAU/16;jjBox(Math.cos(jjA)*2.06,15.2,14.6+Math.sin(jjA)*2.06,.5,.9,.1,'dark',undefined,-jjA+jjPi/2);}
 jjDome(0,16.1,14.6,2.1,{kind:'slate',shape:'ribbed'});
 for(const jjS of [-1,1])jjHospLamp(jjS*2.55,2.55,17.2,0);
 // front windows: arched with shutters below, arched over balconies on the first floor, portholes at the top
 for(const jjX of [-12,-7.5,7.5,12]){jjHospArchWin(jjX,.95,16,1.3,2.25,0,{shutter:true});jjHospArchWin(jjX,4.35,16,1.25,2.3,0,{});
  if(Math.abs(jjX)<10)jjHospBalcony(jjX,4.3,16,2.2,.9,0);jjPorthole(jjX,9.05,16.02,0,.72);}
 for(const jjS of [-1,1])jjBanner(jjS*5.25,9.6,16.1,0,{w:1.1,h:4.2});
 // front corner turrets
 for(const jjS of [-1,1])jjTurret(jjS*15,0,16,1.25,11.6,{kind:'terracotta',shape:'onion',pattern:jjS<0?'chevron':'spiral'});
 // SIDES and BACK: windows on every floor
 for(const jjS of [-1,1])for(const jjZ of [-5.5,-.5,4.5,9.5]){const jjRy=jjS*jjPi/2;jjHospArchWin(jjS*15,.95,jjZ,1.2,2.2,jjRy,{shutter:true});jjHospArchWin(jjS*15,4.35,jjZ,1.2,2.2,jjRy,{});jjPorthole(jjS*15.02,9.05,jjZ,jjRy,.62);}
 for(const jjX of [-11,-6,6,11]){jjHospArchWin(jjX,.95,-9,1.2,2.2,jjPi,{shutter:true});jjHospArchWin(jjX,4.35,-9,1.2,2.2,jjPi,{});jjPorthole(jjX,9.05,-9.02,jjPi,.62);}
 jjDoor(0,0,-9,1.6,2.6,jjPi,{mat:'dark'});jjHospLamp(1.5,2.4,-9,jjPi);
 // chimney stacks on the side ranges and the back range
 jjChimneyStack(-12.6,jjTop+.34,jjCz+2,{n:4,h:3.1,seed:1});jjChimneyStack(12.6,jjTop+.34,jjCz-1,{n:3,h:3.4,seed:3});jjChimneyStack(-6,jjTop+.34,-6.6,{n:2,h:2.6,seed:4});
 // STABLES across the back of a small yard: arched stalls under a tiled barrel vault
 const jjSz=-16.575;jjBox(0,2.1,-17.425,22,4.2,3.15,'brick');jjHospRow(0,0,-14.45,22,6,4.2,2.3,1.65,0,{depth:.6,back:'dark',backOff:.6,mat:'brick'});
 for(const jjS of [-1,1])jjBox(jjS*10.7,2.1,jjSz,.6,4.2,4.85,'brick');
 for(let jjI=0;jjI<6;jjI++){const jjX=-11+(jjI+.5)*22/6;jjBox(jjX,.7,-14.82,2.25,1.4,.1,'wood');jjBox(jjX,1.42,-14.82,2.3,.08,.16,'iron');}
 jjBox(0,4.35,jjSz,22.4,.3,5.1,'marble');jjWithYaw(0,4.5,jjSz,jjPi/2,()=>jjHospVault(0,4.5,jjSz,2.45,22.2,5,'tile'));
 for(const jjS of [-1,1]){jjWithYaw(jjS*11.1,4.5,jjSz,jjPi/2,()=>jjHospPut('l'+jjHospKey([2.45,.5]),jjHospLunetteGeo(2.45,.5),'brick',jjS*11.1,4.5,jjSz));jjPorthole(jjS*11.37,5.45,jjSz,jjS*jjPi/2,.55);}
 // yard walls with an arched horse gate on the left, a trough and a hitching rail
 jjWall(14.7,0,-14,.6,3.2,10,0,{band:true});jjWall(-14.7,0,-11,.6,3.2,4,0,{band:true});jjWall(-14.7,0,-18,.6,3.2,2,0,{band:true});
 jjHospBay(-14.7,0,-15,4,3.64,2.5,1.9,-jjPi/2,{depth:.6,mat:'brickYellow'});
 for(const jjS of [-1,1])jjWall(jjS*12.85,0,-18.7,3.1,3.2,.6,0,{band:true});
 jjBox(9,.45,-11.2,3.2,.9,.9,'brickDeep');jjBox(9,.86,-11.2,2.9,.06,.6,'water');jjBeam([-6,1.1,-10.4],[-1.5,1.1,-10.4],.07,'wood');for(const jjX of [-6,-3.75,-1.5])jjBeam([jjX,0,-10.4],[jjX,1.15,-10.4],.08,'wood');
 jjReg('Inn court and galleries',0,jjCz,8,jjTop,{});jjReg('Inn gate tower',0,14.6,4.2,17.4,{});jjReg('Inn stables',0,jjSz,11,7.5,{type:['farm']});}

// ---------------------------------------------------------------------------------------------
// TAVERN: one long hall under a tiled barrel vault with marble ribs, a lantern on the ridge,
// an open arcade loggia across the front with benches, and a big clustered chimney at the back.
function buildJjHospTavern(jjG,jjO){reseed(9310+(jjO.v|0));
 const jjPi=Math.PI,jjB=.6,jjWallH=6,jjR=6.6,jjZ0=-11,jjZ1=7,jjLen=jjZ1-jjZ0,jjMid=(jjZ0+jjZ1)/2,jjSpr=jjB+jjWallH;
 // plinth with a marble cap and front steps
 jjBox(0,jjB/2,-1.2,15.6,jjB,25.6,'brickDeep');jjBox(0,jjB-.06,-1.2,15.9,.12,25.9,'marble');jjStairs(0,0,12.4,9,1.5,jjB,3,0,{});
 // hall side walls with yellow buttress piers and tall arched windows
 for(const jjS of [-1,1]){jjBox(jjS*6.2,jjSpr-jjWallH/2,jjMid,.8,jjWallH,jjLen,'brick');
  for(let jjI=0;jjI<=5;jjI++){const jjZ=jjZ0+jjI*jjLen/5;jjBox(jjS*6.75,jjB+(jjWallH-.3)/2,jjZ,.7,jjWallH-.3,1.05,'brickYellow');jjBox(jjS*6.85,jjB+jjWallH-.15,jjZ,.9,.35,1.25,'marble');}
  for(let jjI=0;jjI<5;jjI++){const jjZ=jjZ0+(jjI+.5)*jjLen/5;jjHospArchWin(jjS*6.6,jjB+1.3,jjZ,1.5,3.6,jjS*jjPi/2,{lit:true,mullion:true});}}
 jjBox(-6.95,jjSpr-.05,jjMid,.6,.4,jjLen+.4,'marble');jjBox(6.95,jjSpr-.05,jjMid,.6,.4,jjLen+.4,'marble');
 // the vault, its gable ends with rose portholes, and a slate lantern on the ridge
 jjHospVault(0,jjSpr,jjMid,jjR,jjLen,5,'tile');
 for(const jjZ of [jjZ1,jjZ0])jjHospPut('l'+jjHospKey([jjR,.8]),jjHospLunetteGeo(jjR,.8),'brick',0,jjSpr,jjZ);
 jjBox(0,jjSpr/2+jjB/2,jjZ1,12.4,jjWallH,.8,'brick');jjBox(0,jjSpr/2+jjB/2,jjZ0,12.4,jjWallH,.8,'brick');
 jjPorthole(0,jjSpr+3,jjZ1+.42,0,1.35);for(const jjS of [-1,1])jjPorthole(jjS*3.6,jjSpr+1.9,jjZ0-.42,jjPi,.75);
 jjBox(0,jjSpr+jjR-.15,jjMid,2.6,1.1,2.6,'brickYellow');jjCylinder(0,jjSpr+jjR+.95,jjMid,1.05,1.1,'brickYellow',undefined,32);
 for(let jjI=0;jjI<6;jjI++){const jjA=jjI*TAU/6;jjBox(Math.cos(jjA)*1.06,jjSpr+jjR+.95,jjMid+Math.sin(jjA)*1.06,.32,.6,.06,'glass',undefined,-jjA+jjPi/2);}
 jjCylinder(0,jjSpr+jjR+1.56,jjMid,1.2,.14,'marble',undefined,32);jjDome(0,jjSpr+jjR+1.62,jjMid,1.1,{kind:'slate',shape:'ribbed'});
 // front wall of the hall: a wide door with lamps, two windows
 jjDoor(0,jjB,jjZ1+.4,1.8,2.9,0,{mat:'dark'});for(const jjS of [-1,1]){jjHospLamp(jjS*1.75,jjB+2.6,jjZ1+.4,0);jjHospArchWin(jjS*3.9,jjB+1.2,jjZ1+.4,1.3,2.5,0,{lit:true,shutter:true});}
 // FRONT LOGGIA: an open arcade of three bays across the front and one at each side, roofed, crenellated
 const jjLz=11,jjLh=5;
 jjHospRow(0,jjB,jjLz,15.2,3,jjLh,3.5,2.8,0,{depth:.7,mat:'brick'});
 for(const jjS of [-1,1])jjHospRow(jjS*7.25,jjB,(jjZ1+jjLz)/2+.2,3.9,1,jjLh,2.4,2.5,jjS*jjPi/2,{depth:.7});
 for(const jjX of [-2.53,2.53])jjColumn(jjX,jjB,jjLz+.65,.24,jjLh,{pattern:jjX<0?'spiral':'diamond'});
 jjBox(0,jjB+jjLh+.15,(jjZ1+jjLz)/2+.2,15.4,.3,4.6,'brickDeep');jjBox(0,jjB+jjLh+.42,jjLz+.1,15.9,.3,.95,'marble');jjCrenel(0,jjB+jjLh+.57,jjLz+.2,15.4,.5,1.1);
 for(const jjS of [-1,1])jjWithYaw(jjS*7.4,jjB+jjLh+.57,(jjZ1+jjLz)/2+.2,jjPi/2,()=>jjCrenel(jjS*7.4,jjB+jjLh+.57,(jjZ1+jjLz)/2+.2,4.4,.5,1.1));
 jjBox(0,jjB+.04,(jjZ1+jjLz)/2+.2,14,.08,4,'marble');for(const jjX of [-4.5,0,4.5])jjBox(jjX,jjB+.085,(jjZ1+jjLz)/2+.2,2.2,.02,2.2,'turquoise');
 for(const jjS of [-1,1])jjBanner(jjS*4.3,11,jjZ1+.45,0,{w:.9,h:2.6});
 for(const jjX of [-5.2,-2.4,2.4,5.2])jjHospFurn('jj_furn_bench',jjX,jjB+.08,8.0,0);
 // the big chimney: a stepped breast against the back gable carrying a five-shaft ornamental stack
 jjBox(0,(jjB+12.6)/2,jjZ0-1.6,4.4,12.6-jjB,2.6,'brickDark');jjBox(0,jjB+1.2,jjZ0-1.85,5.4,2.4,2.9,'brick');jjBox(0,jjB+2.5,jjZ0-1.85,5.6,.24,3.1,'marble');
 for(const jjY of [5,8.5,11.5])jjBox(0,jjY,jjZ0-1.6,4.6,.22,2.8,'brickYellow');
 jjChimneyStack(0,12.6,jjZ0-1.6,{n:5,h:3.6,r:.38,seed:2});
 // barrels by the back door
 for(let jjI=0;jjI<4;jjI++)jjCylinder(5.2-(jjI%2)*.9,jjB+.5,jjZ0-1+((jjI/2)|0)*-.9,.4,1,'wood',undefined,16);
 jjReg('Tavern hall',0,jjMid,7,jjSpr+jjR,{});jjReg('Tavern loggia',0,9.2,7.6,jjLh+1.5,{});jjReg('Tavern chimney',0,jjZ0-1.25,2.5,17.5,{});}

// ---------------------------------------------------------------------------------------------
// CARAVANSERAI: a 50 m square walled court. Ground floor: deep arched cells (iwans) round the court;
// upper floor: an arcaded gallery in front of the upper cells. A pishtaq gatehouse with a thick
// staged spire either side, round corner towers, a domed well kiosk in the court and a beast yard behind.
const JJHOSP_CS={Z:6.5,half:25,court:17,cell:19.7,g:5,top:9.5};
function buildJjHospCaravanserai(jjG,jjO){reseed(9320+(jjO.v|0));
 const jjC=JJHOSP_CS,jjZ=jjC.Z,jjA=jjC.half,jjK=jjC.court,jjL=jjC.cell,jjGh=jjC.g,jjTop=jjC.top,jjPi=Math.PI;
 // court floor: earth with marble paths in a cross and a raised round well platform
 jjBox(0,.04,jjZ,6,.08,34,'marble');jjBox(0,.04,jjZ,34,.08,6,'marble');jjBox(0,.02,jjZ,34,.04,34,'ochre');
 // range blocks (ground: behind the cells; upper: behind the gallery), split by the gate and yard passages
 const jjBand='bandBrick',jjRw=jjA-jjL;
 for(const jjS of [-1,1]){jjBox(jjS*(1.9+(jjA-1.9)/2),jjTop/2,jjZ+(jjL+jjRw/2),jjA-1.9,jjTop,jjRw,jjBand);
  jjBox(jjS*(1.9+(jjA-1.9)/2),jjTop/2,jjZ-(jjL+jjRw/2),jjA-1.9,jjTop,jjRw,jjBand);
  jjBox(jjS*(jjL+jjRw/2),jjTop/2,jjZ,jjRw,jjTop,jjL*2,jjBand);}
 for(const jjS of [-1,1])jjBox(0,(jjGh+jjTop)/2,jjZ+jjS*(jjL+jjRw/2),3.8,jjTop-jjGh,jjRw,jjBand);
 // ground-floor cells: a thick arched front at the court line, piers, a ceiling band and a dark back
 const jjN=9,jjBw=34/jjN,jjFrontZ=jjK+.6;
 const jjSides=[[0,jjZ+jjFrontZ,jjPi],[0,jjZ-jjFrontZ,0],[-jjFrontZ,jjZ,jjPi/2],[jjFrontZ,jjZ,-jjPi/2]];
 jjSides.forEach(([jjX,jjZZ,jjRy],jjSi)=>{
  jjHospRow(jjX,0,jjZZ,34,jjN,jjGh,2.7,2.55,jjRy,{depth:1.2,mat:'brick',skip:jjSi<2?[4]:[]});
  if(jjSi<2)jjHospRow(jjX,0,jjZZ,34,jjN,jjGh,3.3,2.2,jjRy,{depth:1.2,mat:'brickYellow',skip:[0,1,2,3,5,6,7,8]});
  jjWithYaw(jjX,0,jjZZ,jjRy,()=>{for(let jjI=0;jjI<=jjN;jjI++){const jjPx=jjX-17+jjI*jjBw;jjBox(jjPx,jjGh/2,jjZZ-1.35,.9,jjGh,1.5,'brick');}
   jjBox(jjX,(3.95+jjGh)/2,jjZZ-1.35,34,jjGh-3.95,1.5,'brick');
   for(let jjI=0;jjI<jjN;jjI++){if(jjSi<2&&jjI===4)continue;const jjPx=jjX-17+(jjI+.5)*jjBw;jjBox(jjPx,1.98,jjZZ-2.06,jjBw-.9,3.95,.06,'dark');jjDoor(jjPx,0,jjZZ-2.0,1.1,2.3,0,{mat:'wood'});}});});
 // upper floor: the gallery floor, the railed arcade at the court line, cell doors on the back wall
 jjBox(0,jjGh-.15,jjZ+jjK+1.35,34+5.4,.3,2.7,'brickDeep');jjBox(0,jjGh-.15,jjZ-jjK-1.35,34+5.4,.3,2.7,'brickDeep');for(const jjS of [-1,1])jjBox(jjS*(jjK+1.35),jjGh-.15,jjZ,2.7,.3,34,'brickDeep');
 jjSides.forEach(([jjX,jjZZ,jjRy])=>{const jjUz=jjZZ;jjWithYaw(jjX,0,jjZZ,jjRy,()=>{
  jjHospRow(jjX,jjGh,jjUz+.35,34,jjN,jjTop-jjGh,2.5,1.85,0,{depth:.5,mat:'brickYellow',rail:1});
  for(let jjI=0;jjI<jjN;jjI++){const jjPx=jjX-17+(jjI+.5)*jjBw;jjHospArchWin(jjPx,jjGh+.1,jjZZ-2.1,1.15,2.5,0,{fill:'dark',trim:'brickYellow'});}
  jjBox(jjX,jjGh+.12,jjZZ+.35,34,.24,.62,'marble');});});
 for(const jjX of [-jjK,jjK])for(const jjZZ of [jjZ-jjK,jjZ+jjK])jjBox(jjX,jjTop/2,jjZZ,1.4,jjTop,1.4,'brick');
 // roof, court cornice, outer string course, cornice and crenellated parapet
 jjBox(0,jjTop+.17,jjZ+(jjK+jjA)/2,jjA*2,.34,jjA-jjK+.4,'brickDeep');jjBox(0,jjTop+.17,jjZ-(jjK+jjA)/2,jjA*2,.34,jjA-jjK+.4,'brickDeep');for(const jjS of [-1,1])jjBox(jjS*(jjK+jjA)/2,jjTop+.17,jjZ,jjA-jjK+.4,.34,jjK*2-.4,'brickDeep');
 jjHospRing4(0,jjZ,jjK*2-.8,jjK*2-.8,jjTop+.25,.4,.5,'marble');
 jjHospRing4(0,jjZ,jjA*2,jjA*2,.45,.9,.24,'brickDeep');jjHospRing4(0,jjZ,jjA*2,jjA*2,jjGh,.26,.16,'marble');jjHospRing4(0,jjZ,jjA*2,jjA*2,jjTop+.12,.42,.36,'marble');
 jjHospParapet(0,jjTop+.34,jjZ,jjA*2+.4,jjA*2+.4,.5,1.3);
 // outer walls: small arched windows on the upper floor, half-round buttress towers mid-side
 for(let jjI=0;jjI<10;jjI++){const jjT=-22.5+jjI*5;if(Math.abs(jjT)<4)continue;
  if(Math.abs(Math.abs(jjT)-10)>3.5)jjHospArchWin(jjT,6.6,jjZ-jjA,.7,1.5,jjPi,{fill:'dark'});for(const jjS of [-1,1])jjHospArchWin(jjS*jjA,6.6,jjZ+jjT,.7,1.5,jjS*jjPi/2,{fill:'dark'});
  if(Math.abs(jjT)>10)jjHospArchWin(jjT,6.6,jjZ+jjA,.7,1.5,0,{fill:'dark'});}
 for(const [jjX,jjZZ] of [[-jjA,jjZ],[jjA,jjZ],[-10,jjZ-jjA],[10,jjZ-jjA]]){jjCylinder(jjX,5.4,jjZZ,2.1,10.8,'brick');jjCylinder(jjX,.45,jjZZ,2.25,.9,'brickDeep');jjCylinder(jjX,jjGh,jjZZ,2.18,.26,'marble');jjHospRoundCrenel(jjX,10.8,jjZZ,2.2,8);}
 // corner towers: round, crenellated, with a small terracotta dome on a drum
 for(const jjX of [-jjA,jjA])for(const jjZZ of [jjZ-jjA,jjZ+jjA]){jjCylinder(jjX,6.25,jjZZ,3.4,12.5,'brick',undefined,32);jjCylinder(jjX,.5,jjZZ,3.6,1,'brickDeep',undefined,32);
  for(const jjY of [jjGh,9.2])jjCylinder(jjX,jjY,jjZZ,3.48,.3,'brickYellow',undefined,32);jjHospRoundCrenel(jjX,12.5,jjZZ,3.5,12);
  jjCylinder(jjX,13.4,jjZZ,1.7,1.8,'brickYellow',undefined,32);jjDome(jjX,14.3,jjZZ,1.8,{kind:'terracotta',shape:'hemi'});
  for(let jjI=0;jjI<4;jjI++){const jjAa=jjI*TAU/4+TAU/8;jjPorthole(jjX+Math.cos(jjAa)*3.4,7.4,jjZZ+Math.sin(jjAa)*3.4,Math.PI/2-jjAa,.42);}}
 // GATEHOUSE: a tall yellow pishtaq with a deep arch, the inner gate in its back wall, a balcony and a crenel crown
 const jjGz=jjZ+jjA,jjPd=3.4,jjPw=17,jjPh=17.5;
 jjHospBay(0,0,jjGz+jjPd/2,jjPw,jjPh,7.4,6.2,0,{depth:jjPd,mat:'brickYellow'});
 jjHospBay(0,0,jjGz+.3,7.6,10,3.8,3.0,0,{depth:.6,mat:'brick'});jjBox(0,(10+jjPh)/2,jjGz+.3,7.6,jjPh-10,.6,'brick');
 jjBox(0,jjPh-.35,jjGz+jjPd/2,jjPw+.6,.7,jjPd+.6,'brickDeep');jjBox(0,jjPh+.12,jjGz+jjPd/2,jjPw+1,.3,jjPd+1,'marble');jjHospParapet(0,jjPh+.27,jjGz+jjPd/2,jjPw+.6,jjPd+.6,.45,1.4);
 for(const jjS of [-1,1]){jjBox(jjS*(jjPw/2-.35),jjPh/2,jjGz+jjPd+.12,.5,jjPh-1,.3,'marble');jjBox(jjS*4.45,7.5,jjGz+jjPd+.1,.36,15,.2,'marble');}
 jjBox(0,jjPh-1.6,jjGz+jjPd+.1,jjPw-1,.36,.2,'marble');jjPorthole(0,13.6,jjGz+jjPd+.06,0,1.25);
 for(const jjS of [-1,1]){jjPorthole(jjS*6.4,13.6,jjGz+jjPd+.06,0,.8);jjHospLamp(jjS*2.5,3.2,jjGz+.6,0);jjBrickShaft(jjS*5.5,0,jjGz+jjPd+1.1,.55,6.5,{pattern:jjS<0?'spiral':'diamond',cap:'star',relief:true});}
 jjBanner(-6.4,10.6,jjGz+jjPd+.25,0,{w:1,h:3.4});jjBanner(6.4,10.6,jjGz+jjPd+.25,0,{w:1,h:3.4});
 jjBox(0,.04,jjGz+jjPd/2-.2,7.4,.08,jjPd+.4,'marble');jjBox(0,.04,jjZ+jjA-jjRw/2,3.8,.08,jjRw+.2,'marble');
 // the two thick staged spires either side of the pishtaq
 for(const jjS of [-1,1]){const jjX=jjS*(jjPw/2+2.9);jjCylinder(jjX,.6,jjGz+1.6,3.4,1.2,'brickDeep',undefined,32);jjCylinder(jjX,1.24,jjGz+1.6,3.55,.12,'marble',undefined,32);
  jjSpire(jjX,1.3,jjGz+1.6,3.0,4,{stageH:5.2,pattern:jjS<0?'tracery':'chevron',kind:'gold'});}
 // the well: a raised sunray platform, a round curb with water, and a kiosk of four patterned columns under a small gold dome
 jjRoundPlaza(0,0,jjZ,5.2,{raised:true,inlay:true});for(const jjS of [-1,1])jjStairs(0,0,jjZ+jjS*(5.2+.75),3,1.5,.9,3,jjS<0?jjPi:0,{});
 jjCylinder(0,1.45,jjZ,1.25,1.0,'brick',undefined,32);jjCylinder(0,2.0,jjZ,1.4,.1,'marble',undefined,32);jjCylinder(0,2.06,jjZ,1.02,.02,'water',undefined,32);
 for(const jjX of [-2.2,2.2])for(const jjZZ of [jjZ-2.2,jjZ+2.2])jjColumn(jjX,.91,jjZZ,.24,4.04,{pattern:jjX*(jjZZ-jjZ)>0?'spiral':'chevron'});
 jjBox(0,5.15,jjZ,5.4,.4,5.4,'brickYellow');jjBox(0,5.42,jjZ,5.7,.16,5.7,'marble');jjCylinder(0,5.9,jjZ,1.9,.8,'brick',undefined,32);jjDome(0,6.3,jjZ,2.0,{kind:'gold',shape:'onion'});
 jjBeam([-1.6,4.7,jjZ],[1.6,4.7,jjZ],.08,'wood');jjCylinder(0,4.45,jjZ,.2,.3,'iron',undefined,16);jjBeam([0,4.3,jjZ],[0,2.2,jjZ],.02,'iron');
 // BEAST YARD behind the back range: walls, an arched side gate, a lean-to shelter with troughs, hay
 const jjYz0=jjZ-jjA,jjYz1=jjYz0-16,jjYm=(jjYz0+jjYz1)/2;
 jjWall(0,0,jjYz1,jjA*2,3.6,.7,0,{band:true});for(const jjS of [-1,1]){jjWall(jjS*(jjA-.35),0,jjYm-3.5,.7,3.6,9,0,{band:true});jjWall(jjS*(jjA-.35),0,jjYz0-1.5,.7,3.6,3,0,{band:true});}
 jjHospBay(jjA-.35,0,jjYz0-5,4,4.4,3.0,2.4,jjPi/2,{depth:.8,mat:'brickYellow'});jjHospBay(-(jjA-.35),0,jjYz0-5,4,4.4,3.0,2.4,-jjPi/2,{depth:.8,mat:'brickYellow'});
 jjHospBay(0,0,jjYz0+.3,3.8,jjGh,2.8,2.6,jjPi,{depth:.6,mat:'brickYellow'});
 for(let jjI=0;jjI<=8;jjI++){const jjX=-21+jjI*5.25;jjBeam([jjX,0,jjYz1+4.2],[jjX,3.2,jjYz1+4.2],.14,'wood');}
 jjBox(0,3.35,jjYz1+2.3,43,.25,4.4,'tile');jjBox(0,3.2,jjYz1+4.25,43,.16,.25,'wood');
 for(let jjI=0;jjI<4;jjI++){const jjX=-15.75+jjI*10.5;jjBox(jjX,.4,jjYz1+3.4,4.2,.8,.9,'brickDeep');jjBox(jjX,.76,jjYz1+3.4,3.9,.05,.6,'water');}
 for(const [jjX,jjZZ] of [[-19,jjYz1+1.5],[-17.2,jjYz1+1.4],[18.5,jjYz1+1.6]])jjCylinder(jjX,.8,jjZZ,.9,1.6,'canvas',jjColor(0xd9b25a),16);
 for(let jjI=0;jjI<5;jjI++){const jjX=-12+jjI*6;jjBeam([jjX,0,jjYm+2],[jjX,1.2,jjYm+2],.1,'wood');}jjBeam([-12,1.1,jjYm+2],[12,1.1,jjYm+2],.06,'wood');
 jjReg('Caravanserai court',0,jjZ,17,jjTop,{});jjReg('Caravanserai gatehouse',0,jjGz+2,12,23,{});jjReg('Caravanserai well kiosk',0,jjZ,5.2,8.5,{type:['infrastructure']});
 jjReg('Caravanserai beast yard',0,jjYm,13,4,{type:['farm']});}

JJ.def({key:'jj_inn',name:'Inn',family:'hospitality',row:'Hospitality',w:33.4,d:37.5,h:18.8,r:18.8,cls:'building',tags:{type:['tavern/inn','multi-family dwelling'],wealth:'middle',lit:false},
 plantSpots:[[-6,-1],[6,-1],[-6,8],[6,8]],views:{'Inn — into the court':{cam:[-1.2,2.0,24],tgt:[0,3.2,0]},'Inn — court galleries':{cam:[-5.5,1.7,7.6],tgt:[4,6.5,-2]}},build:buildJjHospInn});
JJ.def({key:'jj_tavern',name:'Tavern',family:'hospitality',row:'Hospitality',w:16,d:27.4,h:18.4,r:13.7,cls:'building',tags:{type:['tavern/inn'],wealth:'middle',lit:false},
 plantSpots:[[-7.8,12.4],[7.8,12.4]],views:{'Tavern — loggia':{cam:[-5.5,1.75,16],tgt:[1,2.6,8.5]}},build:buildJjHospTavern});
JJ.def({key:'jj_caravanserai',name:'Caravanserai',family:'hospitality',row:'Hospitality',w:57.2,d:71.6,h:25,r:36,cls:'building',tags:{type:['tavern/inn','market/shop'],wealth:'civic',lit:true},
 plantSpots:[[-10,-3],[10,-3],[-10,16],[10,16]],views:{'Caravanserai — court':{cam:[-12,2.2,21],tgt:[6,4.5,-4]},'Caravanserai — gate':{cam:[-8,2.0,50],tgt:[0,8,30]},'Caravanserai — aerial':{cam:[-55,48,70],tgt:[0,4,2]}},build:buildJjHospCaravanserai});
