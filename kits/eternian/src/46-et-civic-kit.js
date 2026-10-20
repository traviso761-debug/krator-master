// prefix: et
// ================================================================= THE CIVIC TOOLKIT (PLAN.md sections 2 and 6, P4): the pieces the
// State's buildings share. The civic door held up by two ancestors with arms spread (arch-18); the hexagon (some halls
// of the State take the six-fold plan of the Sanctum's podium: the owner, 2026-10-20); the pneumatic tube's head and its
// pipe on brackets; the talking head's face, a cell of the owner's terminal sheet.

/* the outline of a regular hexagon of circumradius R, corners at multiples of 60 degrees (a flat face toward +z),
   increasing angle (prism()'s order); its apothem is R*cos(30) */
function etHex(R){const p=[];for(let i=0;i<6;i++){const a=i*PI/3;p.push([R*Math.cos(a),R*Math.sin(a)]);}return p;}
const ET_HEX_AP=Math.cos(PI/6);
/* run fn once per hexagon face, in a frame on the face's centre at apothem ap, its +z outward (face 1 is the front) */
function etHexFaces(ap,fn){for(let k=0;k<6;k++){const ph=PI/6+k*PI/3;pushM(TF(ap*Math.cos(ph),0,ap*Math.sin(ph),PI/2-ph));fn(k,ph);popM();}}

/* the civic door: bronze leaves w x h in a wall whose face is at z, a stone lintel over it held up by two ancestors with
   arms spread, standing on plinths either side (o.metal: their rank, gold by default) */
function etCivicDoor(x,z,w,h,o){o=o||{};const m=o.metal||'gold',pl=.5,fh=(h-pl)/1.18,sd=P('stoneD');
 box('bronze',x,0,z+.04,w,h,.1,P('bronze'));box('bronze',x,0,z+.1,.06,h,.04,new THREE.Color(P('bronze')).multiplyScalar(.7));
 for(let i=1;i<4;i++)box('bronze',x,i*h/4,z+.1,w-.2,.05,.03,new THREE.Color(P('bronze')).multiplyScalar(.8));
 door(x,0,z+.1,0,w);
 for(const s of [-1,1]){const fx=x+s*(w/2+fh*.32);box('stone',fx,0,z+.45,fh*.55,pl,.9,sd);
  etFigure(fx,pl,z+.45,fh,{pose:'lintel',metal:m});}
 box('stone',x,h,z+.45,w+fh*1.1,.42,1.0,sd);etStepHead(x,h+.42,z+.5,w+fh*.6,{mk:'stone',col:sd});}

/* the head of a pneumatic tube, in a dark niche in a wall whose face is at z: the bronze pipe rising out of the floor to
   the wall head, a collar and a hatch where the capsules go in, a cyan strip where a Machine Talker woke the circuit */
function etTubeHead(x,z,h,o){o=o||{};const br=P('bronze'),top=o.top==null?h+1.2:o.top;
 box('stone',x,0,z-.02,1.3,h,.06,new THREE.Color(P('stoneD')).multiplyScalar(.5));
 cyl('bronze',x,0,z+.25,.18,top,br,10);for(const y of [.9,1.5,h-.2])cyl('bronze',x,y,z+.25,.24,.1,br,10);
 box('bronze',x,1.05,z+.44,.3,.4,.06,new THREE.Color(br).multiplyScalar(.8));ring('bronze',x,1.25,z+.48,.07,.015,br,0,PI/2);
 box('glow',x,h-.5,z+.03,.9,.05,.03,new THREE.Color(0x39d6e8));}
/* a pipe from a to b (local points) on bracket posts every ~3 m, its foot on the ground; o.r the bore */
function etPipeRun(a,b,o){o=o||{};const r=o.r||.15,br=P('bronze'),L=Math.hypot(b[0]-a[0],b[2]-a[2]),n=Math.max(1,Math.round(L/3));
 pole('bronze',a,b,r,br,10);
 for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;
  if(o.posts!==false){box('iron',x,0,z,.12,y-.1,.12,P('iron'));box('iron',x,y-.22,z,.4,.08,.12,P('iron'));}
  cyl('bronze',x-.06,y-r*1.4,z,r*1.35,.12,br,10);}}

/* the face of a talking head: one cell (0-8) of the owner's 3 x 3 terminal sheet on a plane w x h centred at (x, y, z)
   facing +z (the eighth cell answers deranged: the kit leaves it to the page) */
const ET_FACE_CALM=[0,1,2,3,4,5,6,8];
function etFaceScreen(x,y,z,w,h,c){const pos=[],nor=[],uv=[],idx=[0,1,2,0,2,3],u0=(c%3)/3,v0=(2-Math.floor(c/3))/3;
 for(const [px,py,u,v] of [[-.5,-.5,0,0],[.5,-.5,1,0],[.5,.5,1,1],[-.5,.5,0,1]]){pos.push(px,py,0);nor.push(0,0,1);uv.push(u0+u/3,v0+v/3);}
 const m=TF(x,y,z);m.scale(new THREE.Vector3(w,h,1));emit('faces',mkGeo(pos,nor,uv,idx),m,etKeyCol('faces'),{su:1,sv:1});}
