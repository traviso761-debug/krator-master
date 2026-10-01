// Jimjam agriculture and storage: field, two farmhouses, granary, windmill, two warehouses.
// Seeds 9600-9699. Top-level prefixes: jjAgri…, buildJjAgri…. Farm buildings are plain brick and
// plaster (no gold, no patterned shafts); the granary and windmill are civic works with a little marble.
// Uses jjMilTower / jjMilArchRingGeo from 76-jj-military.js (same author, earlier in the build order).
// Plants are never drawn: the field and farmhouses publish PLANTING SPOTS (local [x,y,z] points) on
// their def (JJ.defs[key].plantingSpots) and in JJ_AGRI_PLANTING[key].

JMAT.jjAgriSoil=new THREE.MeshStandardMaterial({color:jjColor(0x5f4431),roughness:1});
JMAT.jjAgriEarth=new THREE.MeshStandardMaterial({color:jjColor(0xb69a78),roughness:1});
JMAT.jjAgriCrateWood=new THREE.MeshStandardMaterial({color:jjColor(0xa07c56),roughness:.85});
JMAT.jjAgriStone=new THREE.MeshStandardMaterial({color:jjColor(0xbdb2a2),roughness:.95});
const JJ_AGRI_MUD=jjColor(0xb8a090),JJ_AGRI_PLANTING={},JJ_AGRI_GEO={};

// ---- props and small pieces -----------------------------------------------------------------------
function jjAgriCrate(jjX,jjY,jjZ,jjS,jjRy){jjBox(jjX,jjY+jjS/2,jjZ,jjS,jjS,jjS,'jjAgriCrateWood',undefined,jjRy);jjBox(jjX,jjY+jjS/2,jjZ,jjS+.04,jjS*.16,jjS+.04,'wood',undefined,jjRy);}
function jjAgriSack(jjX,jjY,jjZ,jjS){jjPut('jjAgri_sack',JJGEO.sphere,JMAT.canvas,jjX,jjY+jjS*.32,jjZ,jjS*.42,jjS*.34,jjS*.36,jjColor(0xd8c49a));}
function jjAgriBarrel(jjX,jjY,jjZ){jjCylinder(jjX,jjY+.45,jjZ,.38,.9,'wood');for(const jjF of [.18,.72])jjCylinder(jjX,jjY+jjF,jjZ,.395,.06,'iron');}
// a heap of goods: crates, sacks and barrels scattered deterministically round (jjX,jjZ)
function jjAgriGoods(jjX,jjZ,jjN,jjSpread){for(let jjI=0;jjI<jjN;jjI++){const jjA=rr(0,TAU),jjD=rr(0,jjSpread),jjXx=jjX+Math.cos(jjA)*jjD,jjZz=jjZ+Math.sin(jjA)*jjD,jjK=rng();
 if(jjK<.4){const jjS=rr(.7,1.1);jjAgriCrate(jjXx,0,jjZz,jjS,rr(-.3,.3));if(rng()<.4)jjAgriCrate(jjXx,jjS,jjZz,jjS*.8,rr(-.3,.3));}else if(jjK<.75)jjAgriSack(jjXx,0,jjZz,rr(.75,1));else jjAgriBarrel(jjXx,0,jjZz);}}
// a mud-brick wall along x (base y 0), with a rounded plaster cap
function jjAgriMudWall(jjX,jjZ,jjL,jjH,jjT,jjRy){jjWithYaw(jjX,0,jjZ,jjRy,()=>{jjBox(jjX,jjH/2,jjZ,jjL,jjH,jjT,'brickYellow',JJ_AGRI_MUD);jjBox(jjX,jjH+.06,jjZ,jjL+.08,.14,jjT+.1,'ochre',jjColor(0xe0cdb5));});}
// a timber fence along x: posts and two rails
function jjAgriFence(jjX,jjZ,jjL,jjRy){jjWithYaw(jjX,0,jjZ,jjRy,()=>{const jjN=Math.max(1,Math.round(jjL/1.6));for(let jjI=0;jjI<=jjN;jjI++)jjBox(jjX-jjL/2+jjI*jjL/jjN,.65,jjZ,.14,1.3,.14,'wood');for(const jjY of [.55,1.1])jjBox(jjX,jjY,jjZ,jjL,.09,.07,'wood');});}
function jjAgriSqWindow(jjX,jjY,jjZ,jjW,jjH,jjRy,jjShut){jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{jjBox(jjX,jjY,jjZ,jjW+.2,jjH+.2,.12,'brickDeep');jjBox(jjX,jjY,jjZ+.08,jjW,jjH,.06,'dark');jjBox(jjX,jjY-jjH/2-.08,jjZ+.1,jjW+.3,.1,.2,'brickDeep');if(jjShut)for(const jjS of [-1,1])jjBox(jjX+jjS*(jjW*.75),jjY,jjZ+.12,jjW*.45,jjH,.06,'wood');});}
function jjAgriDoor(jjX,jjZ,jjW,jjH,jjRy){jjWithYaw(jjX,0,jjZ,jjRy,()=>{jjBox(jjX,jjH/2,jjZ,jjW+.3,jjH+.15,.12,'brickDeep');jjBox(jjX,jjH/2,jjZ+.08,jjW,jjH,.08,'wood');jjBox(jjX,jjH+.14,jjZ+.12,jjW+.6,.16,.3,'wood');});}
function jjAgriParapet(jjX,jjY,jjZ,jjW,jjD,jjH,jjMat,jjTint){jjBox(jjX,jjY+jjH/2,jjZ+jjD/2-.14,jjW,jjH,.28,jjMat,jjTint);jjBox(jjX,jjY+jjH/2,jjZ-jjD/2+.14,jjW,jjH,.28,jjMat,jjTint);jjBox(jjX-jjW/2+.14,jjY+jjH/2,jjZ,.28,jjH,jjD-.56,jjMat,jjTint);jjBox(jjX+jjW/2-.14,jjY+jjH/2,jjZ,.28,jjH,jjD-.56,jjMat,jjTint);}
// a pent (lean-to) roof sloping down towards +z: high edge at jjY1 (z0), low edge jjY0 (z1)
function jjAgriPent(jjX,jjW,jjZ0,jjZ1,jjY1,jjY0){const jjDz=jjZ1-jjZ0,jjDy=jjY1-jjY0,jjL=Math.hypot(jjDz,jjDy);jjPut('jj_box_tile',JJGEO.box,JMAT.tile,jjX,(jjY0+jjY1)/2,(jjZ0+jjZ1)/2,jjW,.2,jjL,undefined,qEuler(Math.atan2(jjDy,jjDz),0,0));}
function jjAgriSpots(jjKey,jjPts){JJ_AGRI_PLANTING[jjKey]=jjPts;return jjPts;}

// ---- farm field -----------------------------------------------------------------------------------
// 30 x 24 plot: a mud-brick boundary wall with a gate gap, a cistern feeding a brick-lined main channel
// down the middle and four lateral channels, ridged beds between them. Planting spots sit on the ridges.
const JJ_AGRI_FIELD={w:28,d:22,laterals:[-8,-3,2,7],ridge:1.0};
const JJ_AGRI_FIELD_SPOTS=jjAgriSpots('jj_farm_field',(()=>{const jjF=JJ_AGRI_FIELD,jjOut=[],jjBeds=[[-8,-3],[-3,2],[2,7],[7,10.7]];
 for(const jjB of jjBeds)for(let jjZ=jjB[0]+.9;jjZ<jjB[1]-.45;jjZ+=jjF.ridge)for(let jjX=1.6;jjX<jjF.w/2-.6;jjX+=1.5)for(const jjS of [-1,1])jjOut.push([+(jjS*jjX).toFixed(2),.47,+jjZ.toFixed(2)]);return jjOut;})());
function buildJjAgriField(jjG,jjO){reseed(9600+(jjO.v|0));const jjF=JJ_AGRI_FIELD,jjHw=jjF.w/2,jjHd=jjF.d/2;
 jjBox(0,.15,0,jjF.w+.6,.3,jjF.d+.6,'jjAgriSoil');
 // boundary wall with a gate gap and two posts at the front
 jjAgriMudWall(0,-jjHd-.3,jjF.w+1.2,1.0,.55,0);for(const jjS of [-1,1]){jjAgriMudWall(jjS*(jjHw+.3),0,jjF.d+.6,1.0,.55,Math.PI/2);jjAgriMudWall(jjS*(1.9+(jjHw+.65-1.9)/2),jjHd+.3,jjHw+.65-1.9,1.0,.55,0);jjBox(jjS*1.55,.75,jjHd+.3,.7,1.5,.7,'brickYellow',JJ_AGRI_MUD);}
 // cistern at the back, main channel, laterals with board sluices
 jjCylinder(0,.75,-jjHd+1.9,1.7,1.5,'brickDeep',undefined,32);jjCylinder(0,1.42,-jjHd+1.9,1.45,.08,'water',undefined,32);jjCylinder(0,1.55,-jjHd+1.9,1.78,.12,'ochre',jjColor(0xe0cdb5),32);
 const jjZ0=-jjHd+3.6;jjBox(0,.42,(jjZ0+jjHd)/2,.8,.08,jjHd-jjZ0,'water');for(const jjS of [-1,1])jjBox(jjS*.55,.45,(jjZ0+jjHd)/2,.3,.32,jjHd-jjZ0,'brickDeep');
 for(const jjZl of jjF.laterals){for(const jjS of [-1,1]){const jjXc=jjS*(jjHw+.7)/2;jjBox(jjXc,.38,jjZl,jjHw-.7,.06,.42,'water');for(const jjE of [-1,1])jjBox(jjXc,.4,jjZl+jjE*.29,jjHw-.7,.22,.16,'brickDeep');jjBox(jjS*.86,.55,jjZl,.06,.4,.6,'wood');}}
 // ridged beds between the laterals
 const jjBeds=[[-8,-3],[-3,2],[2,7],[7,10.7]];for(const jjB of jjBeds)for(let jjZ=jjB[0]+.9;jjZ<jjB[1]-.45;jjZ+=jjF.ridge)for(const jjS of [-1,1])jjBox(jjS*(jjHw+.7)/2,.38,jjZ,jjHw-.9,.18,.42,'jjAgriSoil',jjColor(0xffffff,1.18));
 // a field shelter in the back corner: four posts and a reed-mat pent roof
 const jjSx=jjHw-2.2,jjSz=-jjHd+1.6;for(const jjDx of [-1.3,1.3])for(const jjDz of [-.8,.8])jjBox(jjSx+jjDx,1.2-(jjDz>0?.15:0),jjSz+jjDz,.16,2.4-(jjDz>0?.3:0),.16,'wood');jjAgriPent(jjSx,3.2,jjSz-1.05,jjSz+1.05,2.45,2.08);
 jjAgriSack(jjSx-.6,.3,jjSz,.8);jjAgriSack(jjSx+.4,.3,jjSz+.2,.8);
 jjReg('Field plot',0,0,jjHw,1.6,{part:'field'});jjReg('Cistern',0,-jjHd+1.9,1.8,1.7,{part:'cistern'});}

// ---- farmhouse A: walled courtyard, animal pens, threshing floor -----------------------------------
function buildJjAgriFarmhouseA(jjG,jjO){reseed(9610+(jjO.v|0));const jjW=21,jjD=19,jjHw=jjW/2,jjHd=jjD/2;
 jjBox(0,.05,0,jjW+.4,.1,jjD+.4,'jjAgriEarth');
 // house range across the back: one storey in plaster, a two-storey brick end with a flat roof
 const jjBz=-jjHd+3.2;jjBox(-3,.2,jjBz,14.6,.4,6.6,'brickDeep');jjBox(-3,1.9,jjBz,14,3.4,6.2,'ochre');jjBox(-3,3.66,jjBz,14.3,.14,6.5,'brickDeep');jjAgriParapet(-3,3.73,jjBz,14.3,6.5,.55,'ochre');
 jjBox(6.6,3.3,jjBz,5.4,6.6,6.6,'brick',jjColor(0xe0b8a8));jjBox(6.6,6.66,jjBz,5.7,.14,6.9,'brickDeep');jjAgriParapet(6.6,6.73,jjBz,5.7,6.9,.6,'brick');
 jjAgriDoor(-5,jjBz+3.12,1.1,2.15,0);jjAgriDoor(6.6,jjBz+3.32,1.1,2.2,0);for(const jjX of [-8.6,-1.6,2.2])jjAgriSqWindow(jjX,2.2,jjBz+3.12,.7,.8,0,true);jjAgriSqWindow(6.6,4.9,jjBz+3.32,.8,.9,0,true);
 jjAgriSqWindow(-10.12,2.2,jjBz,.6,.7,-Math.PI/2,false);
 jjBox(8.4,7.8,jjBz-1.8,.9,2.2,.9,'brickDeep');jjBox(8.4,8.98,jjBz-1.8,1.1,.16,1.1,'brickDeep');jjBox(-7,4.45,jjBz-2,.8,1.3,.8,'brickDeep');
 // external stair to the high roof, against the court face of the low range
 jjStairs(1.3,0,jjBz+3.75,1,4.6,3.66,11,Math.PI/2,{mat:'brickDeep'});
 // courtyard wall with a timber-lintelled gate, a byre down the left side
 jjAgriMudWall(-jjHw/2-1.1,jjHd-.3,jjHw-2.2,2.4,.5,0);jjAgriMudWall(jjHw/2+1.1,jjHd-.3,jjHw-2.2,2.4,.5,0);for(const jjS of [-1,1])jjBox(jjS*1.9,1.45,jjHd-.3,.8,2.9,.8,'brickDeep');jjBox(0,3.0,jjHd-.3,4.6,.3,.7,'wood');
 for(const jjS of [-1,1])jjAgriMudWall(jjS*(jjHw-.25),(jjBz+3.3+jjHd)/2,jjHd-jjBz-3.3,2.4,.5,Math.PI/2);
 const jjBx=-jjHw+2.2;jjBox(jjBx-1.6,1.4,1.7,.4,2.8,10,'brick',jjColor(0xe0b8a8));for(const jjZ of [-2.6,0,2.6,5.2])jjBox(jjBx+1.4,1.25,jjZ+.9,.2,2.5,.2,'wood');jjWithYaw(jjBx,0,1.7,Math.PI/2,()=>jjAgriPent(jjBx,10.4,1.7-2.1,1.7+2.1,2.95,2.45));
 for(const jjZ of [-1.3,1.3,3.9])jjBox(jjBx-.5,.9,jjZ+.9,1.8,.1,.1,'wood');jjBox(jjBx-.9,.4,1.7,.5,.5,8,'wood');
 // animal pens (front right) with a trough
 jjAgriFence(5.8,1.4,8.4,0);jjAgriFence(1.6,4.2,5.6,Math.PI/2);jjAgriFence(5.8,7,8.4,0);jjBox(6,.35,6.2,2.6,.5,.6,'wood');jjBox(6,.58,6.2,2.4,.06,.4,'water');
 jjBox(5.6,.06,4.3,8,.04,8.6,'jjAgriSoil');
 // threshing floor: a round stone disc with a centre post and a stone roller
 jjCylinder(-2.8,.12,3.4,3.1,.24,'jjAgriStone',undefined,32);jjCylinder(-2.8,.07,3.4,3.3,.14,'brickDeep',undefined,32);jjCylinder(-2.8,1.2,3.4,.12,2.2,'wood');
 jjPut('jjAgri_roller',JJGEO.cyl,JMAT.jjAgriStone,-1.1,.69,3.4,.45,1.1,.45,undefined,qEuler(0,0,Math.PI/2));
 // a beehive bread oven in the court corner, sacks by the door
 jjBox(-8.4,.5,-1.8,2,1,2,'brick',jjColor(0xe0b8a8));jjDome(-8.4,1,-1.8,.9,{kind:'terracotta',shape:'hemi'});jjBox(-8.4,1.25,-.92,.5,.45,.1,'dark');
 jjAgriSack(-4,0,jjBz+4,.9);jjAgriSack(-3.2,0,jjBz+4.2,.85);jjAgriBarrel(-2.3,0,jjBz+3.9);
 jjReg('Farmhouse',-1,jjBz,7.5,7.5,{part:'house'});jjReg('Animal pens',5.6,2.9,4,1.4,{part:'pens'});jjReg('Threshing floor',-2.8,3.4,3.2,1.2,{part:'threshing floor'});jjReg('Byre',jjBx,1.7,3,3,{part:'byre'});}

// ---- farmhouse B: compact two-storey house, small dome, roof terrace, lean-to --------------------
function buildJjAgriFarmhouseB(jjG,jjO){reseed(9620+(jjO.v|0));const jjHz=-1;
 jjBox(0,.05,0,15.6,.1,13.6,'jjAgriEarth');
 // main block: brick ground floor, ochre plaster upper floor, a roof terrace with a low parapet
 jjBox(-1.5,.2,jjHz,9.4,.4,8.4,'brickDeep');jjBox(-1.5,1.8,jjHz,9,3.2,8,'brick',jjColor(0xe4c0b0));jjBox(-1.5,3.45,jjHz,9.2,.14,8.2,'brickDeep');jjBox(-1.5,5,jjHz,9,3,8,'ochre',jjColor(0xf2dcc4));jjBox(-1.5,6.55,jjHz,9.3,.14,8.3,'brickDeep');
 jjAgriParapet(-1.5,6.62,jjHz,9.3,8.3,.8,'ochre',jjColor(0xf2dcc4));
 for(const jjX of [-4.8,1.8])for(const jjY of [2.3,5.1])jjAgriSqWindow(jjX,jjY,jjHz+4.02,.7,.85,0,true);jjAgriDoor(-1.5,jjHz+4.02,1.1,2.2,0);jjAgriSqWindow(-1.5,5.1,jjHz+4.02,.6,.7,0,false);
 for(const jjZ of [-2.6,.6])jjAgriSqWindow(-6.02,5.1,jjHz+jjZ,.6,.7,-Math.PI/2,true);
 // terrace: a timber shade frame, a water jar, a plain chimney
 for(const jjX of [-5.2,-1.6])for(const jjZ of [jjHz-3,jjHz-.6])jjBox(jjX,7.75,jjZ,.12,2.2,.12,'wood');for(const jjZ of [jjHz-3,jjHz-.6])jjBox(-3.4,8.85,jjZ,3.9,.1,.12,'wood');for(let jjI=0;jjI<6;jjI++)jjBox(-5.2+jjI*.72,8.92,jjHz-1.8,.07,.07,2.9,'wood');
 jjPut('jjAgri_jar',JJGEO.sphere,JMAT.terracotta,1.4,7.1,jjHz+2.4,.35,.42,.35);jjBox(2.2,7.7,jjHz-2.9,.8,2.2,.8,'brickDeep');jjBox(2.2,8.86,jjHz-2.9,1,.14,1,'brickDeep');
 // external stair up the right flank to the terrace
 jjStairs(3.6,0,jjHz-.2,1.1,7.2,6.62,18,Math.PI,{mat:'brickDeep'});jjBeam([4.2,1,jjHz-3.8],[4.2,7.1,jjHz+2.85],.05,'wood');
 // domed room on the left: a square cell, a squinch drum, a terracotta dome
 const jjDx=-7.6,jjDz=jjHz-1.5;jjBox(jjDx,1.75,jjDz,3.6,3.5,4.4,'ochre',jjColor(0xf2dcc4));jjBox(jjDx,3.57,jjDz,3.8,.14,4.6,'brickDeep');jjCylinder(jjDx,3.95,jjDz,1.6,.7,'brickDeep',undefined,32);jjDome(jjDx,4.3,jjDz,1.6,{kind:'terracotta',shape:'hemi'});
 jjAgriSqWindow(jjDx,2.2,jjDz+2.22,.5,.6,0,false);
 // lean-to at the back: timber posts, a tile pent roof, firewood and a cart
 for(const jjX of [-5.4,-1.5,2.4])jjBox(jjX,1.2,jjHz-6.4,.18,2.4,.18,'wood');jjAgriPent(-1.5,8.6,jjHz-4,jjHz-6.7,3.1,2.4);
 for(let jjI=0;jjI<4;jjI++)jjBeam([-4.6,.25+jjI*.24,jjHz-5.2],[-2.4,.25+jjI*.24,jjHz-5.2],.12,'wood');for(let jjI=0;jjI<3;jjI++)jjBeam([-4.5,.37+jjI*.24,jjHz-4.9],[-2.5,.37+jjI*.24,jjHz-4.9],.12,'wood');
 jjBox(.9,.85,jjHz-5.4,1.6,.12,2.4,'wood');for(const jjS of [-1,1])jjPut('jjAgri_wheel',JJGEO.cyl,JMAT.wood,.9+jjS*.88,.55,jjHz-5.4,.55,.1,.55,undefined,qEuler(0,0,Math.PI/2));jjBeam([.9,.8,jjHz-4.2],[.9,.35,jjHz-2.8],.06,'wood');
 // front yard: low mud wall with a gap, a well
 jjAgriMudWall(-4.9,5.9,5.6,1.1,.45,0);jjAgriMudWall(4.4,5.9,6.6,1.1,.45,0);for(const jjS of [-1,1])jjAgriMudWall(jjS*7.55,2.95,5.9,1.1,.45,Math.PI/2);
 jjCylinder(4.6,.45,3.6,.75,.9,'brickDeep',undefined,32);jjCylinder(4.6,.91,3.6,.6,.04,'water',undefined,32);for(const jjS of [-1,1])jjBox(4.6+jjS*.75,1.3,3.6,.12,1.7,.12,'wood');jjBox(4.6,2.12,3.6,1.7,.12,.12,'wood');
 jjReg('Farmhouse',-1.5,jjHz,5,9.5,{part:'house'});jjReg('Domed room',jjDx,jjDz,2.2,6,{part:'dome'});jjReg('Lean-to',-1.5,jjHz-5.4,4.5,3.2,{part:'lean-to'});}

// ---- granary: beehive silos on a raised platform ----------------------------------------------------
// a beehive (lathe) instanced through the kit; u x 2PI and v x 1 so the world-UV brick tiles in metres
function jjAgriBeehiveGeo(){if(JJ_AGRI_GEO.hive)return JJ_AGRI_GEO.hive;const jjPts=[[0,0],[1,0],[1,.32],[.98,.46],[.93,.58],[.84,.7],[.71,.8],[.54,.89],[.34,.95],[.14,.99],[0,1]].map(jjP=>new THREE.Vector2(jjP[0],jjP[1]));const jjG=new THREE.LatheGeometry(jjPts,32),jjUv=jjG.attributes.uv;for(let jjI=0;jjI<jjUv.count;jjI++)jjUv.setX(jjI,jjUv.getX(jjI)*TAU);return JJ_AGRI_GEO.hive=jjG;}
function buildJjAgriGranary(jjG,jjO){reseed(9630+(jjO.v|0));const jjPh=2.4,jjPw=22,jjPd=10.5,jjPz=-1.5,jjFront=jjPz+jjPd/2;
 jjBox(0,jjPh*.45,jjPz,jjPw,jjPh*.9,jjPd,'brickDeep');jjBox(0,jjPh*.93,jjPz,jjPw+.3,jjPh*.14,jjPd+.3,'marble');
 for(let jjI=0;jjI<6;jjI++){const jjX=-jjPw/2+1.9+jjI*(jjPw-3.8)/5;jjBox(jjX,.9,jjFront+.1,.8,1.3,.2,'dark');jjBox(jjX,1.6,jjFront+.16,1.1,.14,.3,'brickYellow');}
 // loading stairs (front centre) with cheek walls
 jjStairs(0,0,jjFront+2,4.4,4,jjPh,9,0,{mat:'marble'});for(const jjS of [-1,1]){jjBox(jjS*2.5,jjPh*.55,jjFront+1.9,.5,jjPh*1.1,3.8,'brickDeep');jjBox(jjS*2.5,jjPh*1.12,jjFront+1.9,.62,.12,3.9,'marble');}
 // four beehive silos in yellow brick with red courses, hatches and gold finials
 const jjR=2.35,jjH=7.6,jjXs=[-7.8,-2.6,2.6,7.8];
 for(const jjX of jjXs){const jjZ=jjPz-.4;jjPut('jjAgri_hive_brickYellow',jjAgriBeehiveGeo(),JMAT.brickYellow,jjX,jjPh,jjZ,jjR,jjH,jjR);
  for(const jjF of [.12,.3])jjCylinder(jjX,jjPh+jjH*jjF,jjZ,jjR*1.01,.22,'brick',undefined,32);
  jjCylinder(jjX,jjPh+.2,jjZ,jjR*1.06,.4,'brickDeep',undefined,32);
  jjCylinder(jjX,jjPh+jjH+.12,jjZ,.42,.5,'brick',undefined,16);jjCylinder(jjX,jjPh+jjH+.42,jjZ,.5,.1,'wood',undefined,16);jjPut('jjAgri_finial',JJGEO.sphere,JMAT.gold,jjX,jjPh+jjH+.62,jjZ,.13,.2,.13);
  jjBox(jjX,jjPh+1.15,jjZ+jjR-.02,1.1,1.9,.2,'brickDeep');jjBox(jjX,jjPh+1.05,jjZ+jjR+.05,.8,1.6,.1,'wood');jjBox(jjX,jjPh+2.15,jjZ+jjR+.04,1.3,.16,.3,'marble');}
 // sacks on the platform and at the foot of the stairs
 jjAgriSack(-1.4,jjPh,jjFront-.8,.9);jjAgriSack(1.5,jjPh,jjFront-.7,.9);jjAgriSack(1,jjPh,jjFront-1.6,.85);jjAgriSack(-3.6,0,jjFront+3.4,.9);jjAgriSack(-4.3,0,jjFront+2.8,.9);jjAgriCrate(4,0,jjFront+3.2,1,0.2);
 jjReg('Granary platform',0,jjPz,11,jjPh,{part:'platform'});for(const jjX of jjXs)jjReg('Silo',jjX,jjPz-.4,jjR,jjPh+jjH+1,{part:'silo'});}

// ---- windmill: a staged round brick tower, a terracotta cap, sails that turn -----------------------
// The sails are ONE named THREE.Group ('jj_windmill_sails') under the building's group, built as two
// merged meshes (timber, canvas) at build time. A FRAME_HOOKS entry turns it about its own axis
// (local z, the wind shaft) once per frame: no geometry is made after the build.
const JJ_AGRI_SAIL={len:8.2,inner:1.5,w:1.9,rps:.11};
function jjAgriSailsGeo(){const jjS=JJ_AGRI_SAIL,jjWood=[],jjCloth=[],jjBoxG=(jjW,jjH,jjD,jjX,jjY,jjZ,jjA)=>{const jjG=new THREE.BoxGeometry(jjW,jjH,jjD);jjG.translate(jjX,jjY,jjZ);jjG.rotateZ(jjA);return jjG;};
 for(let jjK=0;jjK<4;jjK++){const jjA=jjK*Math.PI/2;jjWood.push(jjBoxG(.26,jjS.len+.6,.26,0,jjS.len/2-.1,0,jjA));
  const jjN=9;for(let jjI=0;jjI<=jjN;jjI++){const jjY=jjS.inner+(jjS.len-jjS.inner)*jjI/jjN;jjWood.push(jjBoxG(jjS.w+.15,.09,.1,jjS.w/2,jjY,.12,jjA));}
  jjWood.push(jjBoxG(.1,jjS.len-jjS.inner,.1,jjS.w+.05,(jjS.len+jjS.inner)/2,.12,jjA));
  jjCloth.push(jjBoxG(jjS.w-.1,jjS.len-jjS.inner-.25,.04,jjS.w/2+.03,(jjS.len+jjS.inner)/2,.06,jjA));}
 const jjHub=new THREE.CylinderGeometry(.55,.55,.7,16);jjHub.rotateX(Math.PI/2);jjWood.push(jjHub);return{wood:jjWood,cloth:jjCloth};}
function jjAgriSails(jjX,jjY,jjZ){const jjGrp=new THREE.Group();jjGrp.name='jj_windmill_sails';jjGrp.position.set(jjX,jjY,jjZ);JJ.cur.G.add(jjGrp);const jjGeo=jjAgriSailsGeo();meshMerged(jjGeo.wood,JMAT.wood,jjGrp);meshMerged(jjGeo.cloth,JMAT.canvas,jjGrp);
 jjGrp.rotation.z=.35;if(typeof FRAME_HOOKS!=='undefined')FRAME_HOOKS.push(jjDt=>{jjGrp.rotation.z-=jjDt*TAU*JJ_AGRI_SAIL.rps;});return jjGrp;}
function buildJjAgriWindmill(jjG,jjO){reseed(9640+(jjO.v|0));const jjR=4.2,jjB=.45;
 jjCylinder(0,jjB/2,0,6.6,jjB,'brickDeep',undefined,32);jjCylinder(0,jjB+.04,0,6.3,.08,'jjAgriEarth',undefined,32);
 const jjT=jjMilTower(0,jjB,0,jjR,{stages:[8.2,5.4],taper:.92,step:.86,crenel:false,cap:'none',wins:[[0,Math.PI/2,.72],[0,Math.PI*1.1,.5],[0,-Math.PI/2,.62],[1,Math.PI/2],[1,0],[1,Math.PI]]});
 // the cap: a short drum and a terracotta dome with a gold finial, a hood for the wind shaft
 const jjRc=jjT.r*1.04,jjCy=jjT.y;jjCylinder(0,jjCy+.45,0,jjRc,.9,'brickYellow',undefined,32);jjCylinder(0,jjCy+.95,0,jjRc+.12,.18,'marble',undefined,32);jjDome(0,jjCy+1.04,0,jjRc,{kind:'terracotta',shape:'hemi'});jjPut('jjAgri_finial',JJGEO.sphere,JMAT.gold,0,jjCy+1.1+jjRc,0,.2,.32,.2);
 const jjHy=jjCy+1.04+jjRc*.42,jjHz=jjRc+2.05;jjBox(0,jjHy,jjRc*.9,1.4,1.5,1.6,'brick');jjBox(0,jjHy+.8,jjRc*.9,1.7,.16,1.9,'marble');jjBeam([0,jjHy,jjRc*.4],[0,jjHy,jjHz],.24,'wood');
 const jjSails=jjAgriSails(0,jjHy,jjHz);
 // door, millstones and sacks at the foot
 jjBox(0,jjB+1.5,jjR+.1,2.4,3,1.2,'brick');jjBox(0,jjB+3.1,jjR+.15,2.7,.2,1.4,'marble');jjAgriDoor(0,jjR+.72,1.3,2.4,0);
 jjPut('jjAgri_millstone',JJGEO.cyl,JMAT.jjAgriStone,-3.3,jjB+.7,4.4,.7,.25,.7,undefined,qEuler(Math.PI/2,0,.3));jjCylinder(3.1,jjB+.12,4.6,.75,.24,'jjAgriStone');
 jjAgriSack(2.2,jjB,4.9,.9);jjAgriSack(2.9,jjB,5.4,.85);jjAgriSack(1.6,jjB,5.6,.8);
 jjReg('Windmill tower',0,0,jjR,jjCy+jjRc+1.5,{part:'tower'});jjReg('Windmill sails',0,jjHz,JJ_AGRI_SAIL.len,jjHy+JJ_AGRI_SAIL.len,{part:'sails',animated:true});
 return jjSails;}

// ---- warehouses --------------------------------------------------------------------------------------
// a half cylinder (axis x) for barrel vaults: u x PI so the brick tiles by arc length on the curved face
function jjAgriVaultGeo(jjOpen){const jjK='vault'+(jjOpen?1:0);if(JJ_AGRI_GEO[jjK])return JJ_AGRI_GEO[jjK];const jjG=new THREE.CylinderGeometry(1,1,1,24,1,jjOpen,0,Math.PI),jjUv=jjG.attributes.uv,jjNo=jjG.attributes.normal;for(let jjI=0;jjI<jjUv.count;jjI++)if(Math.abs(jjNo.getY(jjI))<.5)jjUv.setX(jjI,jjUv.getX(jjI)*Math.PI);return JJ_AGRI_GEO[jjK]=jjG;}
function jjAgriVault(jjX,jjY,jjZ,jjR,jjL,jjMat,jjOpen){jjPut('jjAgri_vault'+(jjOpen?'o':'c')+'_'+jjMat,jjAgriVaultGeo(jjOpen),JMAT[jjMat],jjX,jjY,jjZ,jjR,jjL,jjR,undefined,qEuler(0,0,Math.PI/2));}
// long brick hall walls, jjL along x, jjD deep, jjH tall, front +z; buttresses on the 6 m rhythm
function jjAgriHall(jjX,jjZ,jjL,jjD,jjH,jjBays){jjBox(jjX,.25,jjZ,jjL+.6,.5,jjD+.6,'brickDeep');jjBox(jjX,jjH/2,jjZ,jjL,jjH,jjD,'brick');for(const jjY of [2.2,jjH-.9])jjBox(jjX,jjY,jjZ,jjL+.08,.26,jjD+.08,'brickYellow');jjBox(jjX,jjH-.12,jjZ,jjL+.4,.24,jjD+.4,'marble');
 for(let jjI=0;jjI<=jjBays;jjI++){const jjXx=jjX-jjL/2+jjI*jjL/jjBays;for(const jjS of [-1,1]){jjBox(jjXx,(jjH-.6)/2,jjZ+jjS*(jjD/2+.35),.9,jjH-.6,.7,'brick');jjBox(jjXx,jjH-.55,jjZ+jjS*(jjD/2+.4),1.1,.2,.85,'brickYellow');}}}
// a big loading door: a dark recess, two timber leaves standing open, an arch ring (round or pointed)
function jjAgriLoadingDoor(jjX,jjY,jjZ,jjW,jjH,jjPointed){if(jjPointed){const jjS=jjH-.742*jjW;jjMesh(jjMilArchRingGeo(jjW,jjS,.5,.45),JMAT.marble,jjX,jjY,jjZ+.12,0);jjBox(jjX,jjY+jjS/2,jjZ+.02,jjW,jjS,.1,'dark');jjBox(jjX,jjY+jjS+(jjH-jjS)*.4,jjZ+.02,jjW*.62,(jjH-jjS)*.8,.1,'dark');}
 else{jjArch(jjX,jjY,jjZ+.12,jjW+1.1,jjH+.55,0,{depth:.45});jjBox(jjX,jjY+jjH*.4,jjZ+.02,jjW,jjH*.8,.1,'dark');jjBox(jjX,jjY+jjH*.86,jjZ+.02,jjW*.6,jjH*.25,.1,'dark');}
 for(const jjS of [-1,1]){jjBox(jjX+jjS*(jjW/2+.05),jjY+jjH*.36,jjZ+jjW*.24,.12,jjH*.72,jjW*.46,'wood');jjBox(jjX+jjS*(jjW/2+.12),jjY+jjH*.2,jjZ+jjW*.24,.04,.12,jjW*.46,'iron');}}
function buildJjAgriWarehouseA(jjG,jjO){reseed(9650+(jjO.v|0));const jjL=30,jjD=12,jjH=6.5,jjZ=-4,jjF=jjZ+jjD/2;
 jjBox(0,.04,0,jjL+4,.08,jjD+10,'jjAgriEarth');
 jjAgriHall(0,jjZ,jjL,jjD,jjH,5);
 // barrel vault: a closed brick core (its half-disc ends are the gables) under an open tile shell
 jjAgriVault(0,jjH,jjZ,jjD/2,jjL,'brick',false);jjAgriVault(0,jjH,jjZ,jjD/2+.22,jjL+.7,'tile',true);
 for(const jjS of [-1,1]){jjPut('jjAgri_disc_dark',new THREE.CylinderGeometry(1,1,1,24),JMAT.dark,jjS*(jjL/2+.02),jjH+2.4,jjZ,.85,.1,.85,undefined,qEuler(0,0,Math.PI/2));jjPut('jjAgri_disc_marble',new THREE.CylinderGeometry(1,1,1,24),JMAT.marble,jjS*(jjL/2),jjH+2.4,jjZ,1.05,.08,1.05,undefined,qEuler(0,0,Math.PI/2));
  jjWithYaw(jjS*jjL/2,0,jjZ,jjS*Math.PI/2,()=>jjAgriLoadingDoor(jjS*jjL/2,0,jjZ,2.6,3.6,false));}
 // three big round-arched loading doors on the front, a raised dock with ramps
 for(const jjX of [-6,0,6])jjAgriLoadingDoor(jjX,1.05,jjF,3.2,4.2,false);
 jjBox(0,.5,jjF+1.6,22,1,3.2,'brickDeep');jjBox(0,1.04,jjF+1.6,22.2,.1,3.3,'marble');for(const jjS of [-1,1])jjPut('jj_box_brickDeep',JJGEO.box,JMAT.brickDeep,jjS*12.8,.45,jjF+1.6,3.8,.25,3.2,undefined,qEuler(0,0,-jjS*Math.atan2(1,3.6)));
 // yard: low wall with gate piers, goods
 jjBox(-9.5,.7,jjF+7.8,13,1.4,.5,'brick');jjBox(9.5,.7,jjF+7.8,13,1.4,.5,'brick');for(const jjS of [-1,1]){jjBox(jjS*3.2,1.1,jjF+7.8,.9,2.2,.9,'brickYellow');jjBox(jjS*3.2,2.27,jjF+7.8,1.1,.14,1.1,'marble');jjBox(jjS*16,.7,jjF+3.9,.5,1.4,7.8,'brick');}
 jjAgriGoods(-9,jjF+4.6,9,2.2);jjAgriGoods(8,jjF+4.8,8,2);for(let jjI=0;jjI<3;jjI++)jjAgriCrate(8.2+jjI*1.0,1.09,jjF+2.3,.85,0);jjAgriSack(-8.6,1.09,jjF+2.2,.9);jjAgriSack(-9.6,1.09,jjF+2.4,.9);
 jjReg('Vaulted storehouse',0,jjZ,jjL/2,jjH+jjD/2+.3,{part:'hall'});jjReg('Loading yard',0,jjF+4.6,8,2,{part:'yard'});}
function buildJjAgriWarehouseB(jjG,jjO){reseed(9660+(jjO.v|0));const jjL=32,jjD=12,jjH=6.2,jjZ=-4,jjF=jjZ+jjD/2,jjN=4,jjBay=jjL/jjN;
 jjBox(0,.04,0,jjL+4,.08,jjD+10,'jjAgriEarth');
 jjAgriHall(0,jjZ,jjL,jjD,jjH,jjN);
 // a crenellated parapet and a row of small terracotta domes, one per bay, on square-to-round drums
 jjBox(0,jjH+.45,jjF-.15,jjL,.7,.3,'brick');jjBox(0,jjH+.45,jjZ-jjD/2+.15,jjL,.7,.3,'brick');jjMilMerlons(0,jjH+.8,jjF-.15,jjL,.32,.7,'brick');
 for(let jjI=0;jjI<jjN;jjI++){const jjX=-jjL/2+(jjI+.5)*jjBay;jjBox(jjX,jjH+.45,jjZ,6.6,.9,6.6,'brickYellow');jjCylinder(jjX,jjH+1.3,jjZ,3.05,.8,'brick',undefined,32);jjCylinder(jjX,jjH+1.75,jjZ,3.2,.14,'marble',undefined,32);jjDome(jjX,jjH+1.82,jjZ,3,{kind:'terracotta',shape:'hemi'});
  jjCylinder(jjX,jjH+4.95,jjZ,.45,.5,'brick',undefined,16);
  jjAgriLoadingDoor(jjX,.9,jjF,3,4.2,true);}
 // a timber hoist beam over the second door, an end door, a loading dock
 jjBeam([-jjL/2+1.5*jjBay,jjH+.2,jjF-.4],[-jjL/2+1.5*jjBay,jjH+.2,jjF+2.6],.16,'wood');jjBeam([-jjL/2+1.5*jjBay,jjH+.2,jjF+2.4],[-jjL/2+1.5*jjBay,jjH-1.9,jjF+2.4],.03,'iron');jjAgriCrate(-jjL/2+1.5*jjBay-.45,jjH-2.9,jjF+2.4,.9,0);
 jjWithYaw(jjL/2,0,jjZ,Math.PI/2,()=>jjAgriDoor(jjL/2+.02,jjZ,1.4,2.6,0));
 jjBox(0,.45,jjF+1.5,jjL,.9,3,'brickDeep');jjBox(0,.94,jjF+1.5,jjL+.2,.1,3.1,'marble');jjStairs(-jjL/2-1.2,0,jjF+1.5,3,2.4,.9,4,-Math.PI/2,{mat:'marble'});
 // yard: crates, sacks, barrels and a hand cart
 jjAgriGoods(-8,jjF+5.2,8,2.4);jjAgriGoods(9,jjF+5,9,2.4);
 jjBox(1,.75,jjF+5.5,1.8,.12,1.1,'wood');for(const jjS of [-1,1])jjPut('jjAgri_wheel',JJGEO.cyl,JMAT.wood,1+jjS*.7,.48,jjF+5.5,.48,.08,.48,undefined,qEuler(0,0,Math.PI/2));jjBeam([1,.75,jjF+6],[1,.4,jjF+7.3],.05,'wood');jjAgriSack(1,.81,jjF+5.5,.7);
 jjReg('Domed storehouse',0,jjZ,jjL/2,jjH+5,{part:'hall'});jjReg('Loading yard',0,jjF+5,8,2,{part:'yard'});}

// ---- registry ---------------------------------------------------------------------------------------
JJ.def({key:'jj_farm_field',name:'Farm field',family:'agriculture',row:'Agriculture and storage',w:30,d:24,h:2.6,r:16,cls:'building',plantingSpots:JJ_AGRI_FIELD_SPOTS,tags:{type:['farm'],wealth:'poor',lit:false},build:buildJjAgriField});
JJ.def({key:'jj_farmhouse_a',name:'Farmhouse A — courtyard and pens',family:'agriculture',row:'Agriculture and storage',w:22,d:20,h:9.2,r:12,cls:'building',plantingSpots:jjAgriSpots('jj_farmhouse_a',[[-9.4,0,7.6],[-7.6,0,7.6],[9.2,0,-3.2]]),tags:{type:['farm','single-family dwelling'],wealth:'poor',lit:false},build:buildJjAgriFarmhouseA});
JJ.def({key:'jj_farmhouse_b',name:'Farmhouse B — dome and roof terrace',family:'agriculture',row:'Agriculture and storage',w:20,d:16,h:9,r:10,cls:'building',plantingSpots:jjAgriSpots('jj_farmhouse_b',[[-6.4,0,4.6],[-5,0,5.2],[6.4,0,5.2],[-4.4,6.62,-3.2]]),tags:{type:['farm','single-family dwelling'],wealth:'poor',lit:false},build:buildJjAgriFarmhouseB});
JJ.def({key:'jj_granary',name:'Granary — beehive silos',family:'agriculture',row:'Agriculture and storage',w:24,d:16,h:10.8,r:12,cls:'building',tags:{type:['farm','infrastructure'],wealth:'civic',lit:false},build:buildJjAgriGranary});
JJ.def({key:'jj_windmill',name:'Windmill',family:'agriculture',row:'Agriculture and storage',w:18,d:18,h:26,r:9,cls:'building',tags:{type:['farm','industry'],wealth:'civic',lit:false},build:buildJjAgriWindmill});
JJ.def({key:'jj_warehouse_a',name:'Warehouse A — barrel vault',family:'storage',row:'Agriculture and storage',w:36,d:24,h:12.8,r:18,cls:'building',tags:{type:['industry','market/shop'],wealth:'middle',lit:false},build:buildJjAgriWarehouseA});
JJ.def({key:'jj_warehouse_b',name:'Warehouse B — row of domes',family:'storage',row:'Agriculture and storage',w:38,d:24,h:11.4,r:19,cls:'building',tags:{type:['industry','market/shop'],wealth:'middle',lit:false},build:buildJjAgriWarehouseB});
