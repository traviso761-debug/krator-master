// ================================================================= STRONGBOW TODAY — the interiors, drawn near the eye
// The rooms' records (src/33-sb-rooms.js, SB_ROOMS.plan on the walk's plan) drawn: the floors (each room's polygon, the corridor
// rings and core halls in sectors, the halls, the decks, the doorsteps left out), the walls as the blocks the walker meets, the
// stairs as treads (a ramp or an apron as one sloped slab), a locked door as the block that bars it. Thirteen thousand rooms
// would be a million triangles, so they are bucketed by 48 m cells and 30 m bands and a bucket is built the first time the eye
// comes within NEAR of it, shown while it stays within NEAR + 30 m (the glass and the drums' skins hide them from further off;
// the cutaway shows them through the skin). window._sbRooms has the counts.
var SB_ROOMS_R=null;
function sbRoomsPlan(){if(SB_ROOMS_R)return SB_ROOMS_R;if(typeof SB_ROOMS==='undefined'||typeof SB_AI==='undefined')return null;const S=sbWalkPlan();if(!S)return null;
 SB_ROOMS_R=SB_ROOMS.plan(sbLayout(),STRONGBOW.plan({seed:1647}),S);return SB_ROOMS_R;}
function sbRoomsDraw(gx,gz){const R=sbRoomsPlan();if(!R)return null;const O={buckets:0,built:0,shown:0,tris:0,rooms:R.rooms.length,walls:R.walls.length,stairs:R.stairs.length,warn:R.warn.slice()};
 const std=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:new THREE.Color(c).convertSRGBToLinear(),roughness:.85,metalness:.05},o||{}));
 const M={floor:std(0xb9b2a3),wall:std(0xddd9cf),stair:std(0x9a8f7c),shut:std(0x5a4636,{roughness:.7,metalness:.2})};
 const CELL=48,BAND=30,NEAR=90,HYST=30,buckets=new Map();
 const bk=(x,y,z)=>{const k=Math.floor(x/CELL)+','+Math.floor(y/BAND)+','+Math.floor(z/CELL);let B=buckets.get(k);
  if(!B){B={k,x:(Math.floor(x/CELL)+.5)*CELL+gx,y:(Math.floor(y/BAND)+.5)*BAND,z:(Math.floor(z/CELL)+.5)*CELL+gz,floors:[],walls:[],stairs:[],shut:[],grp:null,on:false};buckets.set(k,B);}return B;};
 for(const f of R.floors){if(/^door:/.test(f.id))continue;const p=f.rect?[(f.rect[0]+f.rect[1])/2,(f.rect[2]+f.rect[3])/2]:f.disc?[f.disc[0],f.disc[1]]:[f.poly[0][0],f.poly[0][1]];bk(p[0],f.y,p[1]).floors.push(f);}
 for(const w of R.walls){const b=w.box;bk((b[0]+b[1])/2,b[4],(b[2]+b[3])/2).walls.push(b);}
 for(const s of R.stairs){const n=Math.max(1,Math.ceil(Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1])/40));
  for(let i=0;i<n;i++){const f0=i/n,f1=(i+1)/n,L=(f,k)=>s.a[k]+(s.b[k]-s.a[k])*f,a=[L(f0,0),L(f0,1),L(f0,2)],b=[L(f1,0),L(f1,1),L(f1,2)];bk((a[0]+b[0])/2,(a[2]+b[2])/2,(a[1]+b[1])/2).stairs.push({a,b,w:s.w,slab:!!(s.apron||/ramp/.test(s.id))});}}
 for(const d of R.doors)if(d.locked){const B=[d.at[0]-d.w/2,d.at[0]+d.w/2,d.at[1]-d.w/2,d.at[1]+d.w/2,d.y,d.y+2.6];bk(d.at[0],d.y,d.at[1]).shut.push(B);}
 O.buckets=buckets.size;
 /* geometry: boxes (an axis box, or a box turned by ry and pitched) and level polygons, merged per material into one mesh each */
 const put=(A,c,sx,sy,sz,ry,pitch)=>{const cy=Math.cos(ry||0),sy_=Math.sin(ry||0),cp=Math.cos(pitch||0),sp=Math.sin(pitch||0);
  const tf=(x,y,z)=>{const y2=y*cp+x*sp,x2=x*cp-y*sp;return [c[0]+x2*cy+z*sy_,c[1]+y2,c[2]-x2*sy_+z*cy];};
  const F=[[[1,0,0],[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]]],[[-1,0,0],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]]],[[0,1,0],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]]],
   [[0,-1,0],[[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]]],[[0,0,1],[[1,-1,1],[1,1,1],[-1,1,1],[-1,-1,1]]],[[0,0,-1],[[-1,-1,-1],[-1,1,-1],[1,1,-1],[1,-1,-1]]]];
  for(const [n,q] of F){const b=A.p.length/3,nn=tf(n[0],n[1],n[2]),o=tf(0,0,0),N=[nn[0]-o[0],nn[1]-o[1],nn[2]-o[2]];
   for(const v of q){const P=tf(v[0]*sx/2,v[1]*sy/2,v[2]*sz/2);A.p.push(P[0],P[1],P[2]);A.n.push(N[0],N[1],N[2]);}A.i.push(b,b+1,b+2,b,b+2,b+3);}};
 const poly=(A,pts,y)=>{const v=pts.map(q=>new THREE.Vector2(q[0],q[1]));if(THREE.ShapeUtils.area(v)<0)v.reverse();const tr=THREE.ShapeUtils.triangulateShape(v,[]),b=A.p.length/3;
  for(const q of v){A.p.push(q.x+gx,y,q.y+gz);A.n.push(0,1,0);}for(const t of tr)A.i.push(b+t[0],b+t[2],b+t[1]);};
 const mesh=(A,mat,name)=>{if(!A.i.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(A.n,3));
  g.setIndex(A.i.length>65535?new THREE.Uint32BufferAttribute(A.i,1):new THREE.Uint16BufferAttribute(A.i,1));g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.name=name;m.castShadow=false;m.receiveShadow=true;m.matrixAutoUpdate=false;
  m.userData.lodSkip=true;O.tris+=A.i.length/3;return m;};
 const build=B=>{const G=new THREE.Group();G.name='strongbow:rooms '+B.k;G.userData.lodSkip=true;G.userData.probeSkip=true;
  const Af={p:[],n:[],i:[]},Aw={p:[],n:[],i:[]},As={p:[],n:[],i:[]},Ad={p:[],n:[],i:[]};
  /* a floor's top a hand's breadth over the walker's plane (the arcology's own slabs lie at the storeys' heights) */
  for(const f of B.floors){const y=f.y+.03;if(f.rect){const r=f.rect;poly(Af,[[r[0],r[2]],[r[1],r[2]],[r[1],r[3]],[r[0],r[3]]],y);}
   else if(f.disc){const o=[];for(let i=0;i<40;i++){const a=i/40*Math.PI*2;o.push([f.disc[0]+f.disc[2]*Math.cos(a),f.disc[1]+f.disc[2]*Math.sin(a)]);}poly(Af,o,y);}
   else if(f.poly){if(f.poly.every(q=>Math.abs(q[2]-f.poly[0][2])<1e-6))poly(Af,f.poly.map(q=>[q[0],q[1]]),y);}}
  for(const b of B.walls)put(Aw,[(b[0]+b[1])/2+gx,(b[4]+b[5])/2,(b[2]+b[3])/2+gz],b[1]-b[0],b[5]-b[4],b[3]-b[2]);
  for(const b of B.shut)put(Ad,[(b[0]+b[1])/2+gx,(b[4]+b[5])/2,(b[2]+b[3])/2+gz],b[1]-b[0],b[5]-b[4],b[3]-b[2]);
  /* a stair: treads of at most 0.18 m rise; a ramp or an apron: one slab along its slope */
  for(const s of B.stairs){const dx=s.b[0]-s.a[0],dz=s.b[1]-s.a[1],run=Math.hypot(dx,dz),rise=s.b[2]-s.a[2],ry=Math.atan2(-dz,dx);
   if(s.slab||Math.abs(rise)<.05){put(As,[(s.a[0]+s.b[0])/2+gx,(s.a[2]+s.b[2])/2-.15,(s.a[1]+s.b[1])/2+gz],Math.hypot(run,rise),.3,s.w,ry,Math.atan2(rise,run));continue;}
   const n=Math.max(1,Math.ceil(Math.abs(rise)/.18));for(let k=0;k<n;k++){const f=(k+.5)/n,y=s.a[2]+rise*(k+1)/n;
    put(As,[s.a[0]+dx*f+gx,y-.09,s.a[1]+dz*f+gz],run/n+.02,.18,s.w,ry,0);}}
  for(const [A,m,nm] of [[Af,M.floor,'floors'],[Aw,M.wall,'walls'],[As,M.stair,'stairs'],[Ad,M.shut,'barred']]){const q=mesh(A,m,'strongbow:rooms '+nm+' '+B.k);if(q)G.add(q);}
  scene.add(G);B.grp=G;O.built++;};
 const eye=new THREE.Vector3();let lastT=0;
 const level=force=>{const t=performance.now();if(!force&&t-lastT<200)return;lastT=t;camera.getWorldPosition(eye);let n=0;
  for(const B of buckets.values()){const d=Math.hypot(eye.x-B.x,(eye.y-B.y)*.8,eye.z-B.z)-CELL*.7,on=B.on?d<NEAR+HYST:d<NEAR;
   if(on&&!B.grp)build(B);if(B.grp)B.grp.visible=on;B.on=on;if(on)n++;}O.shown=n;};
 level(true);tick(()=>level(false));O.level=level;
 /* every bucket at once (the verify's count of what the interiors draw) */
 O.buildAll=()=>{for(const B of buckets.values())if(!B.grp){build(B);B.grp.visible=B.on;}return O.tris;};
 window._sbRooms=O;return O;}
