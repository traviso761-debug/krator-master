// Coplanar-face resolver, run once just before kbake (90-scene). Builders often stack a paving slab,
// a deck, a cap or an inlay so that its face lies exactly in the plane of the podium or wall it sits on;
// two overlapping faces in one plane z-fight (flicker). This scans every instanced BOX and flat-capped
// CYLINDER (yaw-only rotations), finds pairs with coplanar same-facing faces that overlap, and pushes
// the face of the SMALLER piece (the detail meant to show) outward by JJ_ZFIX_PUSH. Sizes change by
// about a centimetre; nothing moves. Plain meshes (lathes, extrusions) are not scanned.
const JJ_ZFIX_PUSH=.012,JJ_ZFIX_EPS=.004,JJ_ZFIX_CELL=6;

// One pass: every coplanar overlap becomes an edge between two FACES (entry, local axis, sign). Edges are
// grouped into connected sets; inside a set, faces are taken largest first and each is lifted to the
// lowest level (x JJ_ZFIX_PUSH) not held by a neighbour it overlaps. A podium stays put, the slabs on it
// rise one level together, a slab on a slab rises two.
function jjZFix(){const jjR=jjZFixPass(),jjRounds=[jjR.conflicts];for(let jjP=0;jjP<6;jjP++){const jjN=jjZFixPass();jjRounds.push(jjN.conflicts);if(!jjN.conflicts)break;}jjR.rounds=jjRounds;jjR.remaining=jjZFixPass(true).conflicts;window._zfix=jjR;return jjR;}
function jjZFixPass(jjDry){
 const jjT0=performance.now(),jjAll=[];
 for(const jjName of KIT.order){const jjDef=KIT.defs[jjName],jjIt=KIT.items[jjName];if(!jjIt||!jjIt.length)continue;const jjG=jjDef.geo;
  let jjKind=null;if(jjG.type==='BoxGeometry')jjKind='box';else if(jjG.type==='CylinderGeometry'&&jjG.parameters&&Math.abs(jjG.parameters.radiusTop-jjG.parameters.radiusBottom)<1e-6)jjKind='cyl';
  if(!jjKind)continue;if(!jjG.boundingBox)jjG.computeBoundingBox();const jjBB=jjG.boundingBox;
  const jjLc=[(jjBB.min.x+jjBB.max.x)/2,(jjBB.min.y+jjBB.max.y)/2,(jjBB.min.z+jjBB.max.z)/2],jjLh=[(jjBB.max.x-jjBB.min.x)/2,(jjBB.max.y-jjBB.min.y)/2,(jjBB.max.z-jjBB.min.z)/2];
  for(const jjO of jjIt){const jjQ=jjO.q;let jjYaw=0;
   if(jjQ){if(Math.abs(jjQ.x)>1e-4||Math.abs(jjQ.z)>1e-4)continue;jjYaw=2*Math.atan2(jjQ.y,jjQ.w);}
   const jjS=typeof jjO.s==='number'?[jjO.s,jjO.s,jjO.s]:jjO.s;if(jjS[0]<=0||jjS[1]<=0||jjS[2]<=0)continue;
   const jjC=Math.cos(jjYaw),jjSn=Math.sin(jjYaw),jjOx=jjLc[0]*jjS[0],jjOz=jjLc[2]*jjS[2];
   const jjE={o:jjO,kind:jjKind,yaw:jjYaw,c:Math.cos(jjYaw),s:Math.sin(jjYaw),
    cx:jjO.p[0]+jjOx*jjC+jjOz*jjSn,cy:jjO.p[1]+jjLc[1]*jjS[1],cz:jjO.p[2]-jjOx*jjSn+jjOz*jjC,
    hx:jjLh[0]*jjS[0],hy:jjLh[1]*jjS[1],hz:jjLh[2]*jjS[2],lh:jjLh};
   if(jjKind==='cyl'){const jjR=Math.max(jjE.hx,jjE.hz);jjE.hx=jjE.hz=jjR;}
   jjAll.push(jjE);}}
 // spatial hash on the footprint's bounding circle
 const jjGrid=new Map(),jjKey=(jjI,jjJ)=>jjI*73856093^jjJ*19349663;
 jjAll.forEach((jjE,jjN)=>{const jjR=Math.hypot(jjE.hx,jjE.hz);jjE.r=jjR;const jjI0=Math.floor((jjE.cx-jjR)/JJ_ZFIX_CELL),jjI1=Math.floor((jjE.cx+jjR)/JJ_ZFIX_CELL),jjJ0=Math.floor((jjE.cz-jjR)/JJ_ZFIX_CELL),jjJ1=Math.floor((jjE.cz+jjR)/JJ_ZFIX_CELL);
  for(let jjI=jjI0;jjI<=jjI1;jjI++)for(let jjJ=jjJ0;jjJ<=jjJ1;jjJ++){const jjK=jjKey(jjI,jjJ);let jjL=jjGrid.get(jjK);if(!jjL){jjL=[];jjGrid.set(jjK,jjL);}jjL.push(jjN);}});
 // 2D overlap of two footprints (OBBs; a cylinder is treated as its circle via a box test, conservative)
 const jjAxes=jjE=>[[jjE.c,-jjE.s],[jjE.s,jjE.c]]; // local x and z directions in world (x,z)
 function jjFootOverlap(jjA,jjB){const jjD=[jjB.cx-jjA.cx,jjB.cz-jjA.cz];if(Math.hypot(jjD[0],jjD[1])>jjA.r+jjB.r)return false;
  if(jjA.kind==='cyl'&&jjB.kind==='cyl')return Math.hypot(jjD[0],jjD[1])<jjA.hx+jjB.hx-.01;
  const jjAa=jjAxes(jjA),jjBa=jjAxes(jjB),jjAh=[jjA.hx,jjA.hz],jjBh=[jjB.hx,jjB.hz];
  for(const jjAx of jjAa.concat(jjBa)){const jjPa=Math.abs(jjAh[0]*(jjAa[0][0]*jjAx[0]+jjAa[0][1]*jjAx[1]))+Math.abs(jjAh[1]*(jjAa[1][0]*jjAx[0]+jjAa[1][1]*jjAx[1]));
   const jjPb=Math.abs(jjBh[0]*(jjBa[0][0]*jjAx[0]+jjBa[0][1]*jjAx[1]))+Math.abs(jjBh[1]*(jjBa[1][0]*jjAx[0]+jjBa[1][1]*jjAx[1]));
   if(Math.abs(jjD[0]*jjAx[0]+jjD[1]*jjAx[1])>jjPa+jjPb-.01)return false;}return true;}
 // push one face of an entry outward: axis 0=x,1=y,2=z (local), sign +-1
 function jjPush(jjE,jjAxis,jjSign,jjDist){const jjO=jjE.o;if(typeof jjO.s==='number')jjO.s=[jjO.s,jjO.s,jjO.s];else jjO.s=jjO.s.slice();
  const jjF=jjDist/(2*jjE.lh[jjAxis]);jjO.s[jjAxis]+=jjF;const jjH=jjDist/2*jjSign;
  if(jjAxis===1){jjO.p=[jjO.p[0],jjO.p[1]+jjH,jjO.p[2]];jjE.cy+=jjH;jjE.hy+=jjDist/2;}
  else{const jjDir=jjAxis===0?[jjE.c,-jjE.s]:[jjE.s,jjE.c];jjO.p=[jjO.p[0]+jjDir[0]*jjH,jjO.p[1],jjO.p[2]+jjDir[1]*jjH];jjE.cx+=jjDir[0]*jjH;jjE.cz+=jjDir[1]*jjH;if(jjAxis===0)jjE.hx+=jjDist/2;else jjE.hz+=jjDist/2;}}

 const jjFace=new Map(),jjAdj=new Map();let jjConf=0;
 const jjNode=(jjN,jjAxis,jjSg,jjArea)=>{const jjK=jjN*6+jjAxis*2+(jjSg>0?0:1);if(!jjFace.has(jjK))jjFace.set(jjK,{n:jjN,axis:jjAxis,sg:jjSg,area:jjArea});return jjK;};
 const jjLink=(jjK1,jjK2)=>{jjConf++;(jjAdj.get(jjK1)||jjAdj.set(jjK1,new Set()).get(jjK1)).add(jjK2);(jjAdj.get(jjK2)||jjAdj.set(jjK2,new Set()).get(jjK2)).add(jjK1);};
 const jjSeen=new Set();
 for(const jjL of jjGrid.values()){for(let jjU=0;jjU<jjL.length;jjU++)for(let jjV=jjU+1;jjV<jjL.length;jjV++){const jjI=Math.min(jjL[jjU],jjL[jjV]),jjJ=Math.max(jjL[jjU],jjL[jjV]);if(jjI===jjJ)continue;const jjPk=jjI*1e6+jjJ;if(jjSeen.has(jjPk))continue;jjSeen.add(jjPk);
  const jjA=jjAll[jjI],jjB=jjAll[jjJ];
  for(const jjSg of [1,-1]){const jjYa=jjA.cy+jjSg*jjA.hy,jjYb=jjB.cy+jjSg*jjB.hy;if(Math.abs(jjYa-jjYb)<JJ_ZFIX_EPS&&jjFootOverlap(jjA,jjB))jjLink(jjNode(jjI,1,jjSg,jjA.hx*jjA.hz),jjNode(jjJ,1,jjSg,jjB.hx*jjB.hz));}
  if(jjA.kind!=='box'||jjB.kind!=='box')continue;let jjDy=((jjA.yaw-jjB.yaw)%(Math.PI/2)+Math.PI/2)%(Math.PI/2);if(Math.min(jjDy,Math.PI/2-jjDy)>.01)continue;
  if(Math.min(jjA.cy+jjA.hy,jjB.cy+jjB.hy)-Math.max(jjA.cy-jjA.hy,jjB.cy-jjB.hy)<.01)continue;
  const jjAa=jjAxes(jjA),jjBa=jjAxes(jjB),jjAh=[jjA.hx,jjA.hz];
  for(let jjK=0;jjK<2;jjK++){const jjN=jjAa[jjK],jjT=jjAa[1-jjK];
   const jjBhn=Math.abs(jjB.hx*(jjBa[0][0]*jjN[0]+jjBa[0][1]*jjN[1]))+Math.abs(jjB.hz*(jjBa[1][0]*jjN[0]+jjBa[1][1]*jjN[1])),jjBht=Math.abs(jjB.hx*(jjBa[0][0]*jjT[0]+jjBa[0][1]*jjT[1]))+Math.abs(jjB.hz*(jjBa[1][0]*jjT[0]+jjBa[1][1]*jjT[1]));
   const jjDn=(jjB.cx-jjA.cx)*jjN[0]+(jjB.cz-jjA.cz)*jjN[1],jjDt=(jjB.cx-jjA.cx)*jjT[0]+(jjB.cz-jjA.cz)*jjT[1];
   if(Math.abs(jjDt)>jjAh[1-jjK]+jjBht-.01)continue;
   for(const jjSg of [1,-1]){if(Math.abs((jjDn+jjSg*jjBhn)-jjSg*jjAh[jjK])<JJ_ZFIX_EPS){
     const jjBk=Math.abs(jjBa[0][0]*jjN[0]+jjBa[0][1]*jjN[1])>.7?0:1,jjBsg=Math.sign(jjBa[jjBk][0]*jjN[0]+jjBa[jjBk][1]*jjN[1])*jjSg;
     jjLink(jjNode(jjI,jjK===0?0:2,jjSg,jjAh[1-jjK]*jjA.hy),jjNode(jjJ,jjBk===0?0:2,jjBsg,jjBht*jjB.hy));}}}}}
 if(jjDry)return{conflicts:jjConf};
 // greedy levels, largest face first, over each connected set
 const jjLevel=new Map();let jjFixY=0,jjFixSide=0,jjMaxLvl=0;
 const jjOrder=[...jjAdj.keys()].sort((jjA,jjB)=>jjFace.get(jjB).area-jjFace.get(jjA).area||jjA-jjB);
 for(const jjK of jjOrder){const jjUsed=new Set();for(const jjNb of jjAdj.get(jjK))if(jjLevel.has(jjNb))jjUsed.add(jjLevel.get(jjNb));let jjLv=0;while(jjUsed.has(jjLv))jjLv++;jjLevel.set(jjK,jjLv);
  if(jjLv){const jjF=jjFace.get(jjK);jjPush(jjAll[jjF.n],jjF.axis,jjF.sg,jjLv*JJ_ZFIX_PUSH);if(jjF.axis===1)jjFixY++;else jjFixSide++;jjMaxLvl=Math.max(jjMaxLvl,jjLv);}}
 return{scanned:jjAll.length,conflicts:jjConf,fixedHorizontal:jjFixY,fixedVertical:jjFixSide,maxLevel:jjMaxLvl,ms:Math.round(performance.now()-jjT0)};}
