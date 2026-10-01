// Jimjam military: the fortress, the barracks and the modular wall system.
// Seeds 9500-9599. Top-level prefixes: jjMil…, jjWallKit…, buildJjMil…, buildJjWall….
//
// ---- WALL SYSTEM: constants and the join rule --------------------------------------------------
// Every wall piece is drawn by a jjWallKit…(ox,oz,ry) function about an ORIGIN on the wall's centre
// line at grade. Its length runs along local +x and its OUTER face (the crenellated parapet) is +z.
//  * jj_wall_seg    spans x in [-JJ_WALL_SEG_LEN/2, +JJ_WALL_SEG_LEN/2] EXACTLY: nothing in it sticks
//                   out past its two end planes, and its merlons, corbels and pilasters repeat with a
//                   period that divides the length. So two segments whose origins are JJ_WALL_SEG_LEN
//                   apart along x meet face to face (no gap, no overlap) and the rhythm runs on
//                   unbroken. The walkway top is at y = JJ_WALL_H; the core is JJ_WALL_T thick.
//  * jj_wall_gate   is exactly JJ_WALL_GATE_SEGS segment lengths long (24 m): it takes N slots of a run.
//                   Its end walls carry a door at walkway height, so the walkway continues through it.
//  * jj_wall_tower  stands ON a joint (its origin is the joint point) and adds no length. Its drum
//                   (diameter 2*JJ_WALL_TOWER_R) swallows both segment ends; doors at walkway height
//                   open onto the walkway on -x and +x.
//  * jj_wall_corner stands on the joint of a leg arriving along +x and a leg leaving towards -z (that
//                   second leg is a segment with ry = +PI/2 whose origin is JJ_WALL_SEG_LEN/2 along -z).
//                   The outer faces stay outside (+z, then +x). Doors face -x and -z.
// A straight run is: origin_i = start + (i + 1/2) * JJ_WALL_SEG_LEN along the wall line; a gate takes
// JJ_WALL_GATE_SEGS slots (its origin at the middle of them); towers and corners sit on the joints.
const JJ_WALL_SEG_LEN=12,JJ_WALL_H=10,JJ_WALL_T=5,JJ_WALL_GATE_SEGS=2,JJ_WALL_TOWER_R=4.6,JJ_WALL_CORNER_R=5.6;

// ---- local materials (prefixed keys on JMAT: jjBox with a material OBJECT would share one kit item
// 'jj_box_custom' with every other custom material, so a string key is the safe way in)
JMAT.jjMilRock=new THREE.MeshStandardMaterial({color:jjColor(0x8c7a68),roughness:1,flatShading:true});
JMAT.jjMilSand=new THREE.MeshStandardMaterial({color:jjColor(0xc8aa80),roughness:1});

// ---- geometry -------------------------------------------------------------------------------------
const JJ_MIL_GEO={};
// a frustum (top radius = taper * bottom), u premultiplied by 2PI like the kit's cylinders, so the
// world-UV brick tiles by arc length
function jjMilFrustumGeo(jjT){const jjK='fr'+jjT;if(JJ_MIL_GEO[jjK])return JJ_MIL_GEO[jjK];const jjG=new THREE.CylinderGeometry(jjT,1,1,32),jjUv=jjG.attributes.uv,jjNo=jjG.attributes.normal;for(let jjI=0;jjI<jjUv.count;jjI++)if(Math.abs(jjNo.getY(jjI))<.5)jjUv.setX(jjI,jjUv.getX(jjI)*TAU);return JJ_MIL_GEO[jjK]=jjG;}
function jjMilFrustum(jjX,jjY,jjZ,jjR,jjH,jjTaper,jjMat,jjTint){jjPut('jjMil_fr'+jjTaper+'_'+jjMat,jjMilFrustumGeo(jjTaper),JMAT[jjMat],jjX,jjY+jjH/2,jjZ,jjR,jjH,jjR,jjTint);}
function jjMilRing(jjX,jjY,jjZ,jjR,jjH,jjMat){jjCylinder(jjX,jjY+jjH/2,jjZ,jjR,jjH,jjMat,undefined,32);}
// two-centred pointed arch: radius k*w, centres on the springing line. Points run left spring -> apex
// -> right spring; grow>0 gives the concentric outer line of an archivolt.
function jjMilArchPts(jjW,jjS,jjN,jjGrow){const jjR=.8*jjW,jjC=jjR-jjW/2,jjRg=jjR+(jjGrow||0),jjTa=Math.acos(-jjC/jjRg),jjOut=[];
 for(let jjI=0;jjI<=jjN;jjI++){const jjT=Math.PI+(jjTa-Math.PI)*jjI/jjN;jjOut.push([jjC+jjRg*Math.cos(jjT),jjS+jjRg*Math.sin(jjT)]);}
 for(let jjI=jjN-1;jjI>=0;jjI--)jjOut.push([-jjOut[jjI][0],jjOut[jjI][1]]);return jjOut;}
function jjMilArchY(jjW,jjS,jjX){const jjR=.8*jjW,jjC=jjR-jjW/2,jjA=Math.abs(jjX)+jjC;return jjA>=jjR?jjS:jjS+Math.sqrt(jjR*jjR-jjA*jjA);}
function jjMilArchHalfW(jjW,jjS,jjY){if(jjY<=jjS)return jjW/2;const jjR=.8*jjW,jjC=jjR-jjW/2,jjD=jjY-jjS;return jjD>=jjR?0:Math.max(0,Math.sqrt(jjR*jjR-jjD*jjD)-jjC);}
// a wall slab jjWs wide and jjH tall with a pointed opening jjW wide springing at jjS, jjDepth thick (centred in z)
function jjMilSlabGeo(jjWs,jjH,jjW,jjS,jjDepth){const jjK=['slab',jjWs,jjH,jjW,jjS,jjDepth].join('_');if(JJ_MIL_GEO[jjK])return JJ_MIL_GEO[jjK];
 const jjSh=new THREE.Shape();jjSh.moveTo(-jjWs/2,0);jjSh.lineTo(-jjW/2,0);for(const jjP of jjMilArchPts(jjW,jjS,14))jjSh.lineTo(jjP[0],jjP[1]);jjSh.lineTo(jjW/2,0);jjSh.lineTo(jjWs/2,0);jjSh.lineTo(jjWs/2,jjH);jjSh.lineTo(-jjWs/2,jjH);jjSh.closePath();
 const jjG=new THREE.ExtrudeGeometry(jjSh,{depth:jjDepth,bevelEnabled:false});jjG.translate(0,0,-jjDepth/2);return JJ_MIL_GEO[jjK]=jjG;}
// a marble archivolt with its jambs: the band between the opening and a line jjF outside it
function jjMilArchRingGeo(jjW,jjS,jjF,jjDepth){const jjK=['ring',jjW,jjS,jjF,jjDepth].join('_');if(JJ_MIL_GEO[jjK])return JJ_MIL_GEO[jjK];
 const jjSh=new THREE.Shape();jjSh.moveTo(-jjW/2-jjF,0);for(const jjP of jjMilArchPts(jjW,jjS,14,jjF))jjSh.lineTo(jjP[0],jjP[1]);jjSh.lineTo(jjW/2+jjF,0);jjSh.lineTo(jjW/2,0);for(const jjP of jjMilArchPts(jjW,jjS,14).reverse())jjSh.lineTo(jjP[0],jjP[1]);jjSh.lineTo(-jjW/2,0);jjSh.closePath();
 const jjG=new THREE.ExtrudeGeometry(jjSh,{depth:jjDepth,bevelEnabled:false});jjG.translate(0,0,-jjDepth/2);return JJ_MIL_GEO[jjK]=jjG;}

// sock() ignores JJ.frame (it reads only CM), so a banner inside jjWithYaw lands unrotated: carry the
// frame through by hand
function jjMilSock(jjType,jjX,jjY,jjZ,jjRy,jjO){if(JJ.frame){const jjV=new THREE.Vector3(jjX,jjY,jjZ).applyMatrix4(JJ.frame),jjA=new THREE.Vector3(1,0,0).transformDirection(JJ.frame);return sock(jjType,jjV.x,jjV.y,jjV.z,(jjRy||0)+Math.atan2(-jjA.z,jjA.x),jjO||{});}return sock(jjType,jjX,jjY,jjZ,jjRy||0,jjO||{});}

// ---- vocabulary ---------------------------------------------------------------------------------------
// merlons along x (period about 2 m, dividing jjL exactly), base at jjY
function jjMilMerlons(jjX,jjY,jjZ,jjL,jjD,jjH,jjMat){const jjN=Math.max(1,Math.round(jjL/2)),jjP=jjL/jjN;for(let jjK=0;jjK<jjN;jjK++){const jjXX=jjX-jjL/2+jjP*(jjK+.5);jjBox(jjXX,jjY+jjH/2,jjZ,jjP*.55,jjH,jjD,jjMat||'brick');jjBox(jjXX,jjY+jjH+.07,jjZ,jjP*.55+.12,.14,jjD+.12,'marble');}}
// a ring of merlons on a round parapet (base jjY, radius to the merlon centres)
function jjMilMerlonRing(jjX,jjY,jjZ,jjR,jjH){const jjN=Math.max(8,Math.round(TAU*jjR/2.1));jjMilRing(jjX,jjY,jjZ,jjR+.3,.9,'brick');jjMilRing(jjX,jjY+.9,jjZ,jjR+.36,.12,'marble');for(let jjI=0;jjI<jjN;jjI++){const jjA=jjI*TAU/jjN;jjBox(jjX+Math.cos(jjA)*jjR,jjY+1.02+jjH/2,jjZ+Math.sin(jjA)*jjR,TAU*jjR/jjN*.5,jjH,.62,'brick',undefined,-jjA-Math.PI/2);}}
// a thick staged round tower (image 2 massing): tapering brick stages, each headed by a corbel, a
// yellow course and a flared marble ring; a merlon crown; a cap. Windows: o.wins=[[stage,angle,yFrac],…]
// (angle 0 = +x, PI/2 = +z). Returns {y,r} of the top platform.
function jjMilTower(jjX,jjY,jjZ,jjR,jjO){jjO=jjO||{};const jjSt=jjO.stages||[12,6],jjTap=jjO.taper||.93,jjStep=jjO.step||.8,jjMat=jjO.mat||'brick';let jjRR=jjR,jjYY=jjY;
 jjMilRing(jjX,jjY,jjZ,jjR*1.07,1.4,'brickDeep');jjMilRing(jjX,jjY+1.4,jjZ,jjR*1.04,.24,'brickYellow');
 for(let jjI=0;jjI<jjSt.length;jjI++){const jjH=jjSt[jjI],jjRT=jjRR*jjTap,jjY0=jjYY;jjMilFrustum(jjX,jjY0,jjZ,jjRR,jjH,jjTap,jjMat);
  for(const jjF of jjH>9?[.36,.7]:[.5]){const jjRm=jjRR+(jjRT-jjRR)*jjF;jjMilRing(jjX,jjY0+jjH*jjF-.14,jjZ,jjRm*1.012+.02,.28,'brickYellow');}
  for(const jjW of (jjO.wins||[]))if(jjW[0]===jjI){const jjA=jjW[1],jjYw=jjY0+jjH*(jjW[2]||.5),jjRw=jjRR+(jjRT-jjRR)*(jjYw-jjY0)/jjH,jjC=Math.cos(jjA),jjS=Math.sin(jjA),jjRy=Math.PI/2-jjA;
   jjBox(jjX+jjC*jjRw,jjYw,jjZ+jjS*jjRw,.95,1.75,.3,'brickYellow',undefined,jjRy);jjBox(jjX+jjC*(jjRw+.12),jjYw-.05,jjZ+jjS*(jjRw+.12),.5,1.35,.12,jjO.lit?'glass':'dark',undefined,jjRy);jjBox(jjX+jjC*(jjRw+.12),jjYw-.85,jjZ+jjS*(jjRw+.12),1.05,.14,.36,'marble',undefined,jjRy);}
  jjMilFrustum(jjX,jjY0+jjH-.55,jjZ,jjRT,.55,1.1,'brickYellow');jjMilRing(jjX,jjY0+jjH,jjZ,jjRT*1.07+.16,.34,'marble');
  jjYY=jjY0+jjH+.34;jjRR=jjI<jjSt.length-1?jjRT*jjStep:jjRT;}
 const jjTop=jjYY;if(jjO.crenel!==false)jjMilMerlonRing(jjX,jjTop,jjZ,jjRR*1.04,1.1);
 const jjCap=jjO.cap||'gold';
 if(jjCap==='cone'){jjMilRing(jjX,jjTop,jjZ,jjRR*.72,1.6,'brickYellow');jjMilFrustum(jjX,jjTop+1.6,jjZ,jjRR*.86,jjRR*1.7,0,'slate');jjCylinder(jjX,jjTop+1.6+jjRR*1.7+.5,jjZ,.06,1,'gold');}
 else if(jjCap!=='none'){const jjDr=jjRR*(jjO.domeR||.7);jjMilRing(jjX,jjTop,jjZ,jjDr*1.02,1.7,'brickYellow');jjMilRing(jjX,jjTop+1.7,jjZ,jjDr*1.1,.22,'marble');jjDome(jjX,jjTop+1.92,jjZ,jjDr,{kind:jjCap,shape:jjO.shape||'onion'});}
 return{y:jjTop,r:jjRR};}
// a corbelled bartizan (the small bulbous turrets clustered on image 2's flanks); base of the drum at jjY
function jjMilBartizan(jjX,jjY,jjZ,jjR,jjKind){jjMilFrustum(jjX,jjY-1.7,jjZ,jjR*.3,1.7,1/.3,'brickYellow');jjMilFrustum(jjX,jjY,jjZ,jjR,2.4,.95,'brick');jjMilRing(jjX,jjY+2.4,jjZ,jjR*1.08,.2,'marble');jjDome(jjX,jjY+2.6,jjZ,jjR*.98,{kind:jjKind||'gold',shape:'onion'});}
// a battered curtain wall along x, centred on (jjX,jjZ), outer face +z, walkway top at jjY+jjH.
// Everything stays inside x in [jjX-jjL/2, jjX+jjL/2]; every repeat divides jjL (the wall join rule).
function jjMilCurtain(jjX,jjY,jjZ,jjL,jjH,jjT){const jjF=jjZ+jjT/2,jjB=jjZ-jjT/2,jjN=Math.max(1,Math.round(jjL/2)),jjP=jjL/jjN,jjM=Math.max(1,Math.round(jjL/6)),jjQ=jjL/jjM;
 jjBox(jjX,jjY+.9,jjZ,jjL,1.8,jjT+1.4,'brickDeep');jjBox(jjX,jjY+2.3,jjZ,jjL,1,jjT+.7,'brickDeep');jjBox(jjX,jjY+2.86,jjZ,jjL,.12,jjT+.76,'brickYellow');
 jjBox(jjX,jjY+(jjH-.14)/2,jjZ,jjL,jjH-.14,jjT,'brick');
 for(const jjYY of [4.2,7.2])if(jjYY<jjH-1.5)jjBox(jjX,jjY+jjYY,jjZ,jjL,.28,jjT+.1,'brickYellow');
 jjBox(jjX,jjY+jjH-.07,jjZ,jjL,.14,jjT,'brickYellow',jjColor(0xf0e2cc));
 // machicolation: a marble course on corbels below the parapet, outer face only
 jjBox(jjX,jjY+jjH-.25,jjF+.3,jjL,.5,.6,'marble');
 for(let jjK=0;jjK<jjN;jjK++)jjBox(jjX-jjL/2+jjP*(jjK+.5),jjY+jjH-.95,jjF+.22,.5,.9,.44,'brickYellow');
 // outer parapet with merlons (arrow slit in each)
 jjBox(jjX,jjY+jjH+.55,jjF-.15,jjL,1.1,.9,'brick');jjBox(jjX,jjY+jjH+1.16,jjF-.15,jjL,.12,1.0,'marble');
 jjMilMerlons(jjX,jjY+jjH+1.22,jjF-.15,jjL,.9,1.2,'brick');
 for(let jjK=0;jjK<jjN;jjK++)jjBox(jjX-jjL/2+jjP*(jjK+.5),jjY+jjH+1.85,jjF+.31,.13,.7,.04,'dark');
 // inner kerb with a marble rail
 jjBox(jjX,jjY+jjH+.3,jjB+.2,jjL,.6,.4,'brick');jjBox(jjX,jjY+jjH+.65,jjB+.2,jjL,.1,.5,'marble');
 // inner pilasters and outer arrow slits on the 6 m rhythm
 for(let jjK=0;jjK<jjM;jjK++){const jjXX=jjX-jjL/2+jjQ*(jjK+.5);jjBox(jjXX,jjY+(jjH-.6)/2,jjB-.3,1.3,jjH-.6,.6,'brick');jjBox(jjXX,jjY+jjH-.48,jjB-.35,1.5,.24,.75,'marble');
  jjBox(jjXX,jjY+jjH*.56,jjF+.03,.2,1.6,.06,'dark');jjBox(jjXX,jjY+jjH*.56-.88,jjF+.06,.6,.14,.14,'marble');jjBox(jjXX,jjY+jjH*.56+.88,jjF+.06,.6,.14,.14,'marble');}}
// a gate block jjL long (x), jjT thick (z), jjH tall, with a pointed passage jjOw wide springing at jjS:
// the pierced slab, the side blocks, footing, courses, marble archivolts on both faces, a paved passage,
// a half-raised portcullis near the outer face and the two leaves standing open inside.
function jjMilGateBlock(jjX,jjY,jjZ,jjL,jjT,jjH,jjOw,jjS,jjO){jjO=jjO||{};const jjWs=jjOw+3.6,jjSw=(jjL-jjWs)/2,jjF=jjZ+jjT/2,jjB=jjZ-jjT/2,jjApex=jjMilArchY(jjOw,jjS,0);
 jjMesh(jjMilSlabGeo(jjWs,jjH,jjOw,jjS,jjT),JMAT.brick,jjX,jjY,jjZ,0);
 for(const jjSg of [-1,1]){jjBox(jjX+jjSg*(jjWs/2+jjSw/2),jjY+jjH/2,jjZ,jjSw,jjH,jjT,'brick');const jjFw=jjL/2-jjOw/2;jjBox(jjX+jjSg*(jjOw/2+jjFw/2),jjY+.9,jjZ,jjFw,1.8,jjT+1.4,'brickDeep');jjBox(jjX+jjSg*(jjOw/2+jjFw/2),jjY+2.3,jjZ,jjFw,1,jjT+.7,'brickDeep');}
 // yellow courses, cut round the archivolt where they would cross the opening
 for(const jjYY of (jjO.courses||[4.2,7.2,10])){if(jjYY>jjH-.5)continue;const jjHw=jjYY<jjApex+.8?jjMilArchHalfW(jjOw,jjS,jjYY)+.75:0;if(jjHw<=0){jjBox(jjX,jjY+jjYY,jjZ,jjL,.28,jjT+.1,'brickYellow');continue;}const jjLw=jjL/2-jjHw;for(const jjSg of [-1,1])jjBox(jjX+jjSg*(jjHw+jjLw/2),jjY+jjYY,jjZ,jjLw,.28,jjT+.1,'brickYellow');}
 jjMesh(jjMilArchRingGeo(jjOw,jjS,.7,.5),JMAT.marble,jjX,jjY,jjF+.2,0);jjMesh(jjMilArchRingGeo(jjOw,jjS,.7,.5),JMAT.marble,jjX,jjY,jjB-.2,0);
 jjBox(jjX,jjY+.06,jjZ,jjOw,.12,jjT+1.6,'brickYellow',jjColor(0xe6d6c0));
 // portcullis, raised to jjPy: iron bars clipped to the arch line, spiked feet
 const jjZp=jjF-1.1,jjPy=jjY+(jjO.portY||jjS*.55);for(let jjXb=-jjOw/2+.3;jjXb<=jjOw/2-.25;jjXb+=.5){const jjTop=jjY+jjMilArchY(jjOw,jjS,jjXb)-.06;jjBeam([jjX+jjXb,jjPy-.35,jjZp],[jjX+jjXb,jjTop,jjZp],.055,'iron');}
 for(let jjYb=jjPy+.15;jjYb<jjY+jjApex-.4;jjYb+=.62){const jjHw=jjMilArchHalfW(jjOw,jjS,jjYb-jjY)-.05;jjBeam([jjX-jjHw,jjYb,jjZp],[jjX+jjHw,jjYb,jjZp],.05,'iron');}
 jjBox(jjX-jjOw/2-.02,jjY+jjS/2,jjZp,.2,jjS,.3,'dark');jjBox(jjX+jjOw/2+.02,jjY+jjS/2,jjZp,.2,jjS,.3,'dark');
 for(const jjSg of [-1,1]){jjBox(jjX+jjSg*(jjOw/2-.1),jjY+jjS*.48,jjB+.6+jjOw/4,.14,jjS*.96,jjOw/2,'wood');for(const jjYs of [.25,.7])jjBox(jjX+jjSg*(jjOw/2-.19),jjY+jjS*jjYs,jjB+.6+jjOw/4,.05,.14,jjOw/2,'iron');}
 return jjApex;}

// ---- wall pieces (each takes an origin and a yaw; see the join rule at the top) -----------------------
function jjWallKitSeg(jjOx,jjOz,jjRy){jjWithYaw(jjOx,0,jjOz,jjRy,()=>{jjMilCurtain(jjOx,0,jjOz,JJ_WALL_SEG_LEN,JJ_WALL_H,JJ_WALL_T);jjReg('Wall segment',jjOx,jjOz,JJ_WALL_SEG_LEN/2,JJ_WALL_H+2.5,{part:'wall segment'});});}
function jjWallKitTower(jjOx,jjOz,jjRy){jjWithYaw(jjOx,0,jjOz,jjRy,()=>{const jjR=JJ_WALL_TOWER_R,jjS0=JJ_WALL_H+4.6,jjTap=.93;
 const jjT=jjMilTower(jjOx,0,jjOz,jjR,{stages:[jjS0,5.2],taper:jjTap,cap:'slate',shape:'onion',wins:[[0,Math.PI/2,.36],[0,Math.PI/2,.86],[0,-Math.PI/2,.86],[1,Math.PI/2],[1,Math.PI/6],[1,Math.PI*5/6],[1,-Math.PI/2]]});
 // doors onto the walkway, both sides, sill at the walkway top
 const jjRh=jjR*(1-(1-jjTap)*JJ_WALL_H/jjS0);for(const jjSg of [-1,1]){jjDoor(jjOx+jjSg*(jjRh-.06),JJ_WALL_H,jjOz,1.25,2.35,jjSg*Math.PI/2,{mat:'dark'});jjBox(jjOx+jjSg*(jjRh+.05),JJ_WALL_H+2.75,jjOz,.3,.2,1.9,'marble');}
 jjMilSock('banner',jjOx,jjT.y-1.2,jjOz+jjT.r*1.16+.1,0,{w:1.1,h:3.4});
 jjReg('Wall tower',jjOx,jjOz,jjR,jjT.y+5,{part:'wall tower'});});}
function jjWallKitGate(jjOx,jjOz,jjRy){jjWithYaw(jjOx,0,jjOz,jjRy,()=>{const jjL=JJ_WALL_SEG_LEN*JJ_WALL_GATE_SEGS,jjT=8,jjH=14,jjOw=5.2,jjS=4.4,jjF=jjOz+jjT/2,jjB=jjOz-jjT/2,jjX=jjOx;
 const jjApex=jjMilGateBlock(jjX,0,jjOz,jjL,jjT,jjH,jjOw,jjS,{courses:[4.2,7.2,10]});
 // crown: parapets and merlons on all four edges
 for(const jjZz of [jjF-.45,jjB+.45]){jjBox(jjX,jjH+.55,jjZz,jjL,1.1,.9,'brick');jjMilMerlons(jjX,jjH+1.1,jjZz,jjL,.9,1.2,'brick');}
 for(const jjSg of [-1,1]){jjBox(jjX+jjSg*(jjL/2-.45),jjH+.55,jjOz,.9,1.1,jjT-1.8,'brick');jjWithYaw(jjX+jjSg*(jjL/2-.45),0,jjOz,Math.PI/2,()=>jjMilMerlons(jjX+jjSg*(jjL/2-.45),jjH+1.1,jjOz,jjT-2,.9,1.2,'brick'));}
 jjBox(jjX,jjH-.4,jjF+.3,jjL,.5,.6,'marble');jjBox(jjX,jjH-.4,jjB-.3,jjL,.5,.6,'marble');
 // doors from the walkway into the gatehouse, in both end walls (the walkway top is JJ_WALL_H)
 for(const jjSg of [-1,1])jjDoor(jjX+jjSg*(jjL/2),JJ_WALL_H,jjOz,1.25,2.35,jjSg*Math.PI/2,{mat:'dark'});
 // a box machicolation over the gateway, between the spires
 jjBox(jjX,10.9+.8,jjF+.6,5.6,1.6,1.2,'brick');jjBox(jjX,12.62,jjF+.65,5.9,.24,1.4,'marble');for(const jjXc of [-2.2,0,2.2]){jjBox(jjX+jjXc,10.45,jjF+.5,.5,.9,1,'brickYellow');jjBox(jjX+jjXc,11.75,jjF+1.22,.14,.7,.04,'dark');}
 // gold sun boss over the apex
 jjPut('jjMil_disc',new THREE.CylinderGeometry(1,1,1,24),JMAT.gold,jjX,jjApex+1.22,jjF+.5,.42,.12,.42,undefined,qEuler(Math.PI/2,0,0));
 // the two thick flanking spires, standing proud of the outer face
 for(const jjSg of [-1,1]){const jjSx=jjX+jjSg*6.4,jjSz=jjF-.4;const jjTp=jjMilTower(jjSx,0,jjSz,3.5,{stages:[16.4,6,4.4],taper:.93,step:.8,cap:'gold',shape:'onion',wins:[[0,Math.PI/2,.62],[0,Math.PI/2-jjSg*.7,.93],[1,Math.PI/2],[1,Math.PI/2+jjSg*1.4],[2,Math.PI/2]]});
  jjMilSock('banner',jjSx,13.9,jjSz+3.5*(1-.07*13.9/16.4)+.06,0,{w:1.4,h:4.6});if(jjSg>0)jjMilBartizan(jjSx+3.0,16.9,jjSz-1.6,1.05,'gold');else jjMilBartizan(jjSx-3.0,16.9,jjSz-1.6,1.05,'gold');}
 jjReg('Wall gate',jjX,jjOz,jjL/2,jjH+2.5,{part:'wall gate'});jjReg('Gate spire',jjX-6.4,jjF-.4,3.5,31,{part:'gate spire'});jjReg('Gate spire',jjX+6.4,jjF-.4,3.5,31,{part:'gate spire'});});}
function jjWallKitCorner(jjOx,jjOz,jjRy){jjWithYaw(jjOx,0,jjOz,jjRy,()=>{const jjR=JJ_WALL_CORNER_R,jjS0=JJ_WALL_H+5.4,jjTap=.93,jjQ=Math.PI/4;
 const jjT=jjMilTower(jjOx,0,jjOz,jjR,{stages:[jjS0,6,4.2],taper:jjTap,cap:'gold',shape:'onion',wins:[[0,jjQ,.4],[0,jjQ,.88],[1,0],[1,Math.PI/2],[1,jjQ],[2,jjQ],[2,-3*jjQ]]});
 const jjRh=jjR*(1-(1-jjTap)*JJ_WALL_H/jjS0);
 jjDoor(jjOx-jjRh+.06,JJ_WALL_H,jjOz,1.25,2.35,-Math.PI/2,{mat:'dark'});jjDoor(jjOx,JJ_WALL_H,jjOz-jjRh+.06,1.25,2.35,Math.PI,{mat:'dark'});
 // a pair of bartizans on the outer flanks
 for(const jjA of [jjQ*.45,jjQ*1.55]){const jjRr=jjR*(1-(1-jjTap)*13/jjS0)+.55;jjMilBartizan(jjOx+Math.cos(jjA)*jjRr,13,jjOz+Math.sin(jjA)*jjRr,1.15,'gold');}
 jjMilSock('banner',jjOx+Math.cos(jjQ)*(jjR*.94+.2),jjS0-1.2,jjOz+Math.sin(jjQ)*(jjR*.94+.2),jjQ,{w:1.3,h:4.2});
 jjReg('Wall corner tower',jjOx,jjOz,jjR,jjT.y+6,{part:'corner tower'});});}

function buildJjWallSeg(jjG,jjO){reseed(9530+(jjO.v|0));jjWallKitSeg(0,0,0);}
function buildJjWallTower(jjG,jjO){reseed(9540+(jjO.v|0));jjWallKitTower(0,0,0);}
function buildJjWallGate(jjG,jjO){reseed(9550+(jjO.v|0));jjWallKitGate(0,0,0);}
function buildJjWallCorner(jjG,jjO){reseed(9560+(jjO.v|0));jjWallKitCorner(0,0,0);}
// demo run: segment · tower · segment · gate · segment · corner · segment, built ONLY by calling the
// piece functions at offsets on the join grid (no copied geometry)
const JJ_WALL_RUN_X0=-33,JJ_WALL_RUN_Z=5.5;
function buildJjWallRun(jjG,jjO){reseed(9570+(jjO.v|0));const jjL=JJ_WALL_SEG_LEN,jjZ=JJ_WALL_RUN_Z;let jjX=JJ_WALL_RUN_X0;
 jjWallKitSeg(jjX+jjL/2,jjZ,0);jjX+=jjL;
 jjWallKitTower(jjX,jjZ,0);
 jjWallKitSeg(jjX+jjL/2,jjZ,0);jjX+=jjL;
 jjWallKitGate(jjX+jjL*JJ_WALL_GATE_SEGS/2,jjZ,0);jjX+=jjL*JJ_WALL_GATE_SEGS;
 jjWallKitSeg(jjX+jjL/2,jjZ,0);jjX+=jjL;
 jjWallKitCorner(jjX,jjZ,0);
 jjWallKitSeg(jjX,jjZ-jjL/2,Math.PI/2);}

// ---- fortress -----------------------------------------------------------------------------------------
function buildJjMilFortress(jjG,jjO){reseed(9500+(jjO.v|0));const jjP=4.1,jjWx=38,jjWz=30,jjH=14,jjT=6;
 // rocky brick plinth, battered in three steps, a pale paved top
 jjBox(0,1.2,0,100,2.4,84,'brickDeep');jjBox(0,3,0,98,1.2,82,'brickDeep');jjBox(0,3.75,0,97.2,.3,81.2,'marble');jjBox(0,3.98,0,96,.24,80,'brickYellow',jjColor(0xf2e4cc));
 for(let jjI=0;jjI<70;jjI++){const jjU=rng(),jjS=rr(1.4,3.6);let jjX,jjZ;if(jjU<.5){jjX=rr(-50,50);jjZ=(jjI%2?1:-1)*(42+jjS*.35);if(jjZ>0&&Math.abs(jjX)<9)jjX+=jjX<0?-10:10;}else{jjZ=rr(-42,42);jjX=(jjI%2?1:-1)*(50+jjS*.35);}
  jjPut('jjMil_rock',new THREE.IcosahedronGeometry(1,0),JMAT.jjMilRock,jjX,jjS*.32,jjZ,jjS,jjS*rr(.55,.9),jjS*rr(.7,1.1),undefined,qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)));}
 // marble stairs from grade to the plinth, centred on the gate, with brick cheek walls
 jjStairs(0,0,46,13,8,jjP,12,0,{mat:'marble'});for(const jjSg of [-1,1]){jjBox(jjSg*7.2,1.6,46.8,1.3,3.2,6.4,'brickDeep');jjBox(jjSg*7.2,jjP-.25,43.2,1.3,1.3,2.4,'brickDeep');jjBox(jjSg*7.2,jjP+.45,43.2,1.5,.14,2.6,'marble');}
 // curtain walls (outer faces out), the front pair split by the gatehouse
 jjMilCurtain(-23.5,jjP,jjWz,29,jjH,jjT);jjMilCurtain(23.5,jjP,jjWz,29,jjH,jjT);
 jjWithYaw(0,jjP,-jjWz,Math.PI,()=>jjMilCurtain(0,jjP,-jjWz,76,jjH,jjT));
 jjWithYaw(-jjWx,jjP,0,-Math.PI/2,()=>jjMilCurtain(-jjWx,jjP,0,60,jjH,jjT));jjWithYaw(jjWx,jjP,0,Math.PI/2,()=>jjMilCurtain(jjWx,jjP,0,60,jjH,jjT));
 // gatehouse with a pointed arch and portcullis, crenellated, flanked by two round towers
 const jjGz=jjWz,jjGT=10,jjGH=17,jjApex=jjMilGateBlock(0,jjP,jjGz,18,jjGT,jjGH,6,5,{courses:[4.2,7.2,11.5,14]});
 for(const jjZz of [jjGz+jjGT/2-.45,jjGz-jjGT/2+.45]){jjBox(0,jjP+jjGH+.55,jjZz,18,1.1,.9,'brick');jjMilMerlons(0,jjP+jjGH+1.1,jjZz,18,.9,1.3,'brick');}
 jjBox(0,jjP+jjGH-.4,jjGz+jjGT/2+.3,18,.5,.6,'marble');
 jjPut('jjMil_disc',new THREE.CylinderGeometry(1,1,1,24),JMAT.gold,0,jjP+jjApex+1.75,jjGz+jjGT/2+.5,.95,.14,.95,undefined,qEuler(Math.PI/2,0,0));
 jjMilSock('banner',0,jjP+jjGH-1,jjGz+jjGT/2+.62,0,{w:2.2,h:4.2});
 for(const jjSg of [-1,1])for(const jjYl of [3.4])jjBox(jjSg*4.3,jjP+jjYl,jjGz+jjGT/2+.25,.4,.55,.35,'glow');
 for(const jjSg of [-1,1]){const jjTx=jjSg*11.6,jjTz=jjGz+2.6;jjMilTower(jjTx,jjP,jjTz,5.4,{stages:[21,7],taper:.93,cap:'gold',shape:'onion',lit:true,wins:[[0,Math.PI/2,.45],[0,Math.PI/2,.8],[0,Math.PI/2+jjSg*.9,.62],[1,Math.PI/2],[1,Math.PI/2+jjSg*1.2]]});jjMilSock('banner',jjTx,jjP+16,jjTz+5.4*(1-.07*16/21)+.06,0,{w:1.6,h:5});}
 // four massive corner towers: staged, marble rings, gold caps at the front, slate at the back
 const jjCorners=[[-jjWx,jjWz,'gold',Math.PI*.75],[jjWx,jjWz,'gold',Math.PI*.25],[-jjWx,-jjWz,'slate',-Math.PI*.75],[jjWx,-jjWz,'slate',-Math.PI*.25]];
 for(const jjC of jjCorners){const jjA=jjC[3];const jjTp=jjMilTower(jjC[0],jjP,jjC[1],7.6,{stages:[22,7.5,5],taper:.92,step:.8,cap:jjC[2],shape:jjC[2]==='gold'?'onion':'ribbed',domeR:.74,lit:true,wins:[[0,jjA,.3],[0,jjA,.62],[0,jjA,.9],[0,jjA+.6,.78],[0,jjA-.6,.78],[1,jjA],[1,jjA+1.2],[1,jjA-1.2],[2,jjA],[2,jjA+Math.PI]]});
  const jjRr=7.6*(1-.08*15/22)+.6;for(const jjD of [-.75,.75])jjMilBartizan(jjC[0]+Math.cos(jjA+jjD)*jjRr,jjP+15,jjC[1]+Math.sin(jjA+jjD)*jjRr,1.25,jjC[2]==='gold'?'gold':'slate');
  jjReg('Fortress tower',jjC[0],jjC[1],7.6,jjTp.y-jjP+8,{part:'tower'});}
 // inner ranges against the side curtains, facing the court
 for(const jjSg of [-1,1])jjWithYaw(jjSg*29.5,jjP,0,-jjSg*Math.PI/2,()=>{const jjX=jjSg*29.5,jjZ=0;jjBox(jjX,jjP+4.5,jjZ,40,9,7,'brick');jjBox(jjX,jjP+4.6,jjZ+3.55,40.2,.3,.2,'brickYellow');jjBox(jjX,jjP+9.15,jjZ,40.6,.3,7.6,'marble');jjMilMerlons(jjX,jjP+9.3,jjZ+3.45,40,.5,.9,'brick');
  for(let jjI=0;jjI<8;jjI++){const jjXx=jjX-17.5+jjI*5;if(jjI%3===1)jjDoor(jjXx,jjP,jjZ+3.5,1.6,2.6,0,{mat:'dark'});else jjWindow(jjXx,jjP+2.2,jjZ+3.5,.9,1.4,0,{lit:true});jjWindow(jjXx,jjP+6.6,jjZ+3.5,.9,1.5,0,{lit:true});}});
 // the keep: a banded brick block on its own platform, cornice and crenels, corner turrets, a gold dome
 const jjK0=jjP+2.4,jjKz=-11;jjPlinth(0,jjP,-10,36,2.4,28,0,{mat:'brickDeep',band:true});jjStairs(0,jjP,5.8,10,3.6,2.4,6,0,{mat:'marble'});
 jjBox(0,jjK0+10,jjKz,26,20,20,'bandBrick');for(const jjYy of [6.4,12.8])jjBox(0,jjK0+jjYy,jjKz,26.3,.3,20.3,'marble');
 jjCornice(0,jjK0+20,jjKz,26,20,0);const jjKt=jjK0+21.37;
 jjMilMerlons(0,jjKt,jjKz+9.7,26,.6,1.2);jjMilMerlons(0,jjKt,jjKz-9.7,26,.6,1.2);for(const jjSg of [-1,1])jjWithYaw(jjSg*12.7,jjKt,jjKz,Math.PI/2,()=>jjMilMerlons(jjSg*12.7,jjKt,jjKz,19,.6,1.2));
 for(const jjSx of [-1,1])for(const jjSz of [-1,1])jjTurret(jjSx*11.6,jjKt,jjKz+jjSz*8.6,1.3,3.4,{kind:'gold',pattern:'ogee'});
 jjMesh(jjMilArchRingGeo(3,3.4,.55,.4),JMAT.marble,0,jjK0,jjKz+10.15,0);jjBox(0,jjK0+2.6,jjKz+10.02,3,5.2,.1,'dark');jjBox(0,jjK0+1.9,jjKz+10.1,2.5,3.8,.12,'wood');
 for(let jjF=0;jjF<3;jjF++)for(const jjXx of [-9.5,-4.8,4.8,9.5])jjWindow(jjXx,jjK0+3.6+jjF*6.4,jjKz+10.02,1.2,2.4,0,{lit:true,shutter:jjF===0});
 for(let jjF=1;jjF<3;jjF++)jjWindow(0,jjK0+3.6+jjF*6.4,jjKz+10.02,1.4,2.6,0,{lit:true});
 for(const jjSg of [-1,1])jjWithYaw(jjSg*13,jjK0,jjKz,jjSg*Math.PI/2,()=>{for(let jjF=0;jjF<3;jjF++)for(const jjZz of [-5.5,0,5.5])jjWindow(jjSg*13+jjZz,jjK0+3.6+jjF*6.4,jjKz+.02,1.1,2.2,0,{lit:true});});
 jjMilRing(0,jjKt,jjKz,7.3,4.2,'brickYellow');for(let jjI=0;jjI<12;jjI++){const jjA=jjI*TAU/12;jjBox(Math.cos(jjA)*7.33,jjKt+2.2,jjKz+Math.sin(jjA)*7.33,.5,1.5,.12,'dark',undefined,Math.PI/2-jjA);}
 jjMilRing(0,jjKt+4.2,jjKz,7.8,.3,'marble');jjDome(0,jjKt+4.5,jjKz,7.4,{kind:'gold',shape:'hemi'});jjMilRing(0,jjKt+11.6,jjKz,1.2,1.8,'marble');jjDome(0,jjKt+13.4,jjKz,1.3,{kind:'gold',shape:'onion'});
 jjMilSock('banner',-6.5,jjK0+19.2,jjKz+10.15,0,{w:1.6,h:5});jjMilSock('banner',6.5,jjK0+19.2,jjKz+10.15,0,{w:1.6,h:5});
 jjReg('Keep',0,jjKz,14,jjKt+15,{part:'keep'});jjReg('Gatehouse',0,jjGz,9,jjGH+jjP+2,{part:'gate'});jjReg('Curtain wall (front)',0,jjWz,38,jjH+jjP+2,{part:'curtain'});}

// ---- barracks -----------------------------------------------------------------------------------------
// a long two-storey barrack block about (jjX,jjZ), façade +z: ground-floor gallery on brick piers under
// a balcony, a door per bay, lit windows above, a crenellated parapet and plain square chimneys
function jjMilBarrackBlock(jjX,jjZ,jjLen,jjRy){jjWithYaw(jjX,0,jjZ,jjRy,()=>{const jjD=9,jjF=jjZ+jjD/2,jjN=Math.round(jjLen/4),jjBay=jjLen/jjN;
 jjBox(jjX,.25,jjZ+1.4,jjLen+.6,.5,jjD+3.4,'brickDeep');jjBox(jjX,4.3,jjZ,jjLen,7.6,jjD,'brick');jjBox(jjX,4.25,jjZ,jjLen+.1,.3,jjD+.1,'brickYellow');jjBox(jjX,8.25,jjZ,jjLen+.5,.35,jjD+.5,'marble');
 jjMilMerlons(jjX,8.42,jjF-.1,jjLen,.5,.9);jjMilMerlons(jjX,8.42,jjZ-jjD/2+.1,jjLen,.5,.9);jjBox(jjX,8.65,jjF-.1,jjLen,.45,.5,'brick');jjBox(jjX,8.65,jjZ-jjD/2+.1,jjLen,.45,.5,'brick');
 // gallery: piers, a slab with a marble edge, a balcony parapet
 for(let jjI=0;jjI<=jjN;jjI++){const jjXx=jjX-jjLen/2+jjI*jjBay;jjBox(jjXx,2.25,jjF+2.3,.75,3.5,.75,'brick');jjBox(jjXx,.62,jjF+2.3,.95,.24,.95,'brickYellow');jjBox(jjXx,3.95,jjF+2.3,.95,.2,.95,'brickYellow');}
 jjBox(jjX,4.25,jjF+1.4,jjLen+.8,.4,2.9,'brick');jjBox(jjX,4.5,jjF+2.85,jjLen+.9,.14,.3,'marble');jjBox(jjX,5.0,jjF+2.72,jjLen+.8,.9,.24,'brick');jjBox(jjX,5.5,jjF+2.72,jjLen+.9,.1,.36,'marble');
 for(let jjI=0;jjI<jjN;jjI++){const jjXx=jjX-jjLen/2+(jjI+.5)*jjBay;jjDoor(jjXx,.5,jjF,1.2,2.4,0,{mat:'dark'});jjWindow(jjXx,6.4,jjF,1.0,1.5,0,{lit:true,shutter:true});jjWindow(jjXx,6.4,jjZ-jjD/2-.02,.7,1,Math.PI,{});}
 for(const jjXx of [-jjLen*.3,0,jjLen*.3]){jjBox(jjX+jjXx,9.6,jjZ-1.5,1,2.2,1,'brick');jjBox(jjX+jjXx,10.75,jjZ-1.5,1.25,.2,1.25,'brickYellow');}
 jjReg('Barrack block',jjX,jjZ,jjLen/2,9,{part:'barrack block'});});}
function buildJjMilBarracks(jjG,jjO){reseed(9510+(jjO.v|0));const jjWx=31,jjFz=23,jjBz=-26;
 jjBox(0,.08,-1.5,62,.16,49,'jjMilSand');
 // two long blocks facing each other across the drill yard
 jjMilBarrackBlock(-25.5,-1,32,Math.PI/2);jjMilBarrackBlock(25.5,-1,32,-Math.PI/2);
 // perimeter wall: crenellated, plain brick, a pointed gateway in the front
 const jjWh=4.5;jjBox(-17.5,jjWh/2,jjFz,27,jjWh,1.2,'brick');jjBox(17.5,jjWh/2,jjFz,27,jjWh,1.2,'brick');jjMilMerlons(-17.5,jjWh,jjFz+.25,27,.7,1);jjMilMerlons(17.5,jjWh,jjFz+.25,27,.7,1);
 jjBox(0,jjWh/2,jjBz,62,jjWh,1.2,'brick');jjMilMerlons(0,jjWh,jjBz-.25,62,.7,1);
 for(const jjSg of [-1,1]){jjBox(jjSg*jjWx,jjWh/2,(jjFz+jjBz)/2,1.2,jjWh,jjFz-jjBz,'brick');jjWithYaw(jjSg*(jjWx+.25),jjWh,(jjFz+jjBz)/2,jjSg*Math.PI/2,()=>jjMilMerlons(jjSg*(jjWx+.25),jjWh,(jjFz+jjBz)/2,jjFz-jjBz,.7,1));}
 jjMesh(jjMilSlabGeo(8,7,4.4,3.2,1.8),JMAT.brick,0,0,jjFz,0);jjMesh(jjMilArchRingGeo(4.4,3.2,.55,.4),JMAT.marble,0,0,jjFz+1.05,0);jjMilMerlons(0,7,jjFz+.3,8,.9,1.1);jjBox(0,6.95,jjFz,8.4,.2,2,'marble');
 for(const jjSg of [-1,1])jjBox(jjSg*2.7,3,jjFz+1.1,.35,.5,.3,'glow');
 // armoury: a heavy square block with a slate dome, barred windows and weapon racks
 const jjAx=-8,jjAz=-19;jjBox(jjAx,.25,jjAz,15,.5,11,'brickDeep');jjBox(jjAx,4,jjAz,14,7,10,'brick');jjBox(jjAx,7.6,jjAz,14.6,.3,10.6,'marble');jjMilMerlons(jjAx,7.75,jjAz+4.8,14,.5,.9);jjMilMerlons(jjAx,7.75,jjAz-4.8,14,.5,.9);
 for(const jjSg of [-1,1])jjWithYaw(jjAx+jjSg*6.8,7.75,jjAz,Math.PI/2,()=>jjMilMerlons(jjAx+jjSg*6.8,7.75,jjAz,9.4,.5,.9));
 jjMilRing(jjAx,7.75,jjAz,3.4,1.6,'brickYellow');jjMilRing(jjAx,9.35,jjAz,3.7,.2,'marble');jjDome(jjAx,9.55,jjAz,3.4,{kind:'slate',shape:'ribbed'});
 jjMesh(jjMilArchRingGeo(2.4,2.4,.45,.35),JMAT.marble,jjAx,.5,jjAz+5.1,0);jjBox(jjAx,1.95,jjAz+5.02,2.4,2.9,.1,'wood');for(const jjYy of [1,2,3])jjBox(jjAx,.5+jjYy,jjAz+5.1,2.4,.12,.06,'iron');
 for(const jjXx of [-4.6,4.6]){jjBox(jjAx+jjXx,4.4,jjAz+5.02,1.1,1.3,.1,'dark');for(const jjDx of [-.3,0,.3])jjBox(jjAx+jjXx+jjDx,4.4,jjAz+5.08,.06,1.3,.06,'iron');}
 for(const jjRx of [-3.6,-2.2,2.2,3.6]){const jjXr=jjAx+jjRx;jjBox(jjXr,1.2,jjAz+5.9,1.1,.12,.5,'wood');jjBox(jjXr,.6,jjAz+5.9,1.1,1.2,.08,'wood');for(let jjI=0;jjI<4;jjI++)jjBeam([jjXr-.4+jjI*.27,.1,jjAz+5.75],[jjXr-.4+jjI*.27,2.4,jjAz+5.65],.03,jjI%2?'iron':'wood');}
 // stable: an open timber-fronted shed with stalls, troughs and a tiled pent roof
 const jjSx=12,jjSz=-21.5,jjSw=20,jjSd=7;jjBox(jjSx,.2,jjSz,jjSw,.4,jjSd,'brickDeep');jjBox(jjSx,2.3,jjSz-jjSd/2+.3,jjSw,4.6,.6,'brick');for(const jjSg of [-1,1])jjBox(jjSx+jjSg*(jjSw/2-.3),1.9,jjSz,.6,3.8,jjSd,'brick');
 for(let jjI=0;jjI<=5;jjI++){const jjXx=jjSx-jjSw/2+.5+jjI*(jjSw-1)/5;jjBox(jjXx,1.8,jjSz+jjSd/2-.3,.3,3.6,.3,'wood');if(jjI>0&&jjI<5)jjBox(jjXx,.9,jjSz,.12,1.4,jjSd-1.2,'wood');}
 for(let jjI=0;jjI<5;jjI++){const jjXx=jjSx-jjSw/2+.5+(jjI+.5)*(jjSw-1)/5;jjBox(jjXx,.7,jjSz-jjSd/2+1,2.4,.5,.6,'wood');jjBox(jjXx,.95,jjSz-jjSd/2+1,2.2,.06,.4,'water');}
 jjBox(jjSx,4.2,jjSz,jjSw+.8,.25,jjSd+1.4,'tile',undefined,0);jjBox(jjSx,4.05,jjSz+jjSd/2+.55,jjSw+.8,.2,.3,'wood');
 // drill yard: pells, a weapon rack
 for(const jjP of [[-6,6],[-2,6],[2,6],[6,6]]){jjCylinder(jjP[0],1.1,jjP[1],.16,2.2,'wood');jjBeam([jjP[0]-.5,1.5,jjP[1]],[jjP[0]+.5,1.5,jjP[1]],.06,'wood');}
 // watch spire at the front right corner: plain brick stages, a lookout ring, a slate cone
 const jjWt=jjMilTower(jjWx-1.8,0,jjFz-1.6,2.6,{stages:[9,5.5,4],taper:.93,step:.84,cap:'cone',lit:true,wins:[[0,Math.PI/2,.6],[1,Math.PI/2],[1,Math.PI],[2,Math.PI/2],[2,0],[2,Math.PI]]});
 jjMilSock('banner',jjWx-1.8,14.5,jjFz-1.6+2.6*.93*.84+.15,0,{w:1,h:2.6});
 jjReg('Armoury',jjAx,jjAz,7.5,13,{part:'armoury'});jjReg('Stable',jjSx,jjSz,10,5,{part:'stable'});jjReg('Watch spire',jjWx-1.8,jjFz-1.6,3,jjWt.y+5,{part:'watch spire'});jjReg('Drill yard',0,0,14,1,{part:'yard'});}

// ---- registry ---------------------------------------------------------------------------------------
JJ.def({key:'jj_barracks',name:'Barracks',family:'military',row:'Military',w:64,d:52,h:22,r:34,cls:'building',tags:{type:['military'],wealth:'civic',lit:true},build:buildJjMilBarracks});
JJ.def({key:'jj_fortress',name:'Fortress — citadel',family:'military',row:'Military',w:104,d:100,h:44,r:56,cls:'building',tags:{type:['military'],wealth:'civic',lit:true},
 views:{'Fortress — gate approach':{cam:[-16,1.7,64],tgt:[0,9,32]}},build:buildJjMilFortress});
JJ.def({key:'jj_wall_seg',name:'Wall segment (12 m)',family:'military',row:'Walls',w:JJ_WALL_SEG_LEN,d:6.5,h:JJ_WALL_H+2.6,r:7,cls:'building',tags:{type:['military','infrastructure'],wealth:'civic',lit:false,role:'wall-piece'},build:buildJjWallSeg});
JJ.def({key:'jj_wall_tower',name:'Wall tower',family:'military',row:'Walls',w:10.4,d:10.4,h:25,r:5.6,cls:'building',tags:{type:['military','infrastructure'],wealth:'civic',lit:false,role:'wall-piece'},build:buildJjWallTower});
JJ.def({key:'jj_wall_run',name:'Wall run (demo)',family:'military',row:'Walls',w:67,d:26,h:33,r:36,cls:'building',tags:{type:['military','infrastructure'],wealth:'civic',lit:false,role:'demo'},
 views:{'Wall run — tower joint':{cam:[-12,16,26],tgt:[-21,10,5.5]},'Wall run — gate joint':{cam:[-2,15,28],tgt:[-9,10,5.5]},'Wall run — corner':{cam:[14,22,30],tgt:[27,10,2]}},build:buildJjWallRun});
JJ.def({key:'jj_wall_gate',name:'Wall gate (2 segments)',family:'military',row:'Walls',w:JJ_WALL_SEG_LEN*JJ_WALL_GATE_SEGS,d:15,h:31,r:13,cls:'building',tags:{type:['military','infrastructure'],wealth:'civic',lit:false,role:'wall-piece'},build:buildJjWallGate});
JJ.def({key:'jj_wall_corner',name:'Wall corner tower',family:'military',row:'Walls',w:13,d:13,h:33,r:7,cls:'building',tags:{type:['military','infrastructure'],wealth:'civic',lit:false,role:'wall-piece'},build:buildJjWallCorner});
