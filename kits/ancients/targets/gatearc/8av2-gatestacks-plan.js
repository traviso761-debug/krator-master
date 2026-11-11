// ================================================================= THE HALL'S STACKS — the plan (records)  [G data]
// Five rock stacks on the pond's north bank, the chaos knobs at the Labyrinth's mouth, carved by the Ancients into
// gardens, works and mines and bridged to the Hall of Heroes (biomes/labyrinth/PLAN-GATE.md section 5). A set piece of
// its own: GATESTACKS.plan takes the arcology's plan only to find the bridgeheads on its slabs, and any host can place
// the stacks without it (o.hall null: the bridges to the slabs are left out).
//
//   S1 the Garden Stack   mesa, 320 m: terraced gardens on its ledges, galleries, a cistern whose overflow falls 300 m
//   S2 the Works Stack    butte, 260 m: smelter galleries in the face, flues and chimneys through the top
//   S3 the Mine Stack     spire of plates, 380 m: adits and spoil fans at the foot, two saucer decks (180, 240 m)
//   S4 the Lookout        leaning spire, 220 m: a saucer deck on its head, the lodge's view over the paddock
//   S5 the Quarry         mesa worked down in benches, 140 m, and its quarry lake
//
// The rock is core/terrain's KSTACKS (records and meshes); every fitting hangs on the stack's own outline at its height
// (KSTACKS.ring), and every bridge's stack end runs EMBED metres into the rock past that outline, so the deck meets the
// drawn wall (drawn up to 12 m inside the outline: the skill's "Fit to the DRAWN mesh") with no gap.
// Frame: the Hall's (metres, y up, x east, z south; y 0 the pond's water). No three.js, no DOM; KRAND only.
const GATESTACKS={};
GATESTACKS.EMBED=14;
GATESTACKS.DEFS=[
 {id:'S1',name:'the Garden Stack',kind:'mesa',x:-250,z:-420,seed:7441,role:'garden',
  tiers:[{h:120,r:75,e:1.25,ry:.4},{h:110,r:58,e:1.15,ry:.5,dx:-6,dz:-8},{h:90,r:40,e:1.1,ry:.6,dx:-10,dz:-14}],bed:[12,26],weather:.9},
 {id:'S2',name:'the Works Stack',kind:'butte',x:230,z:-440,seed:7442,role:'works',
  tiers:[{h:170,r:60,e:1.3,ry:-.3},{h:90,r:44,e:1.2,ry:-.2,dx:4,dz:-6}],bed:[12,24],weather:.9},
 {id:'S3',name:'the Mine Stack',kind:'spire',x:-560,z:-120,seed:7443,role:'mine',H:380,r:55,taper:.3,crown:.85},
 {id:'S4',name:'the Lookout',kind:'spire',x:-640,z:-480,seed:7444,role:'lookout',H:220,r:30,lean:.06,taper:.4,crown:.8},
 {id:'S5',name:'the Quarry',kind:'mesa',x:600,z:-170,seed:7445,role:'quarry',
  tiers:[{h:28,r:100,e:1.3,ry:.2},{h:28,r:88,e:1.3,ry:.2},{h:28,r:76,e:1.28,ry:.22},{h:28,r:64,e:1.25,ry:.24},{h:28,r:54,e:1.2,ry:.25}],bed:[6,12],weather:.5}];
// the bridges: a slab end names the slab and its deck height; a stack end names the stack
GATESTACKS.SPANS=[
 {id:'B1',a:{slab:'lo'},b:{stack:'S1'},y:120},
 {id:'B2',a:{slab:'hi'},b:{stack:'S1'},y:260},
 {id:'B3',a:{slab:'lo'},b:{stack:'S2'},y:100},
 {id:'B4',a:{slab:'hi'},b:{stack:'S3'},y:240},
 {id:'B5',a:{stack:'S1'},b:{stack:'S3'},y:180},
 {id:'B6',a:{stack:'S3'},b:{stack:'S4'},y:200}];
GATESTACKS.DECK={w:12,depth:6,rail:1.4,pierEvery:150,pierW:9};

GATESTACKS.u=function(seed,a,b,c){return KRAND.unit(KRAND.hash(seed,a|0,b==null?0:b|0,c==null?0:c|0));};
// the stack's outline at height y: n points, and the one facing a direction
GATESTACKS.ring=function(S,y,n){return KSTACKS.ring(S,y,n==null?72:n);};
GATESTACKS.facing=function(S,y,dx,dz){const r=GATESTACKS.ring(S,y,96);if(!r)return null;
 const L=Math.hypot(dx,dz);if(!L)return null;let best=null,bd=-2;
 for(const p of r){const vx=p[0]-S.x,vz=p[1]-S.z,vl=Math.max(1e-9,Math.hypot(vx,vz)),dt=(vx*dx+vz*dz)/(vl*L);if(dt>bd){bd=dt;best={x:p[0],z:p[1],nx:vx/vl,nz:vz/vl,r:vl};}}
 return best;};
// a fitting on the wall at an angle (radians, from the stack's centre)
GATESTACKS.onWall=function(S,y,a){return GATESTACKS.facing(S,y,Math.cos(a),Math.sin(a));};

GATESTACKS.plan=function(o){o=o||{};const G0=o.ground||(()=>1.6),H=o.hall||null,U=GATESTACKS.u;
 const P={id:'stacks',stacks:[],fittings:[],bridges:[],falls:[],pools:[],causeways:[],stats:{}};
 const byId={};
 for(const d of GATESTACKS.DEFS){const y0=G0(d.x,d.z);
  const spec=Object.assign({id:'stacks.'+d.id,kind:d.kind,x:d.x,z:d.z,y0:y0,seed:d.seed},
   d.tiers?{tiers:d.tiers,bed:d.bed,weather:d.weather}:{H:d.H,r:d.r,plates:d.plates,taper:d.taper,crown:d.crown,lean:d.lean==null?0:d.lean});
  const S=KSTACKS.make(spec);S.name=d.name;S.role=d.role;S.key=d.id;
  P.stacks.push(S);byId[d.id]=S;}
 const F=(o)=>{P.fittings.push(o);return o;};
 const hub=(S)=>[S.x,S.z];
 const toHall=(S)=>Math.atan2(-S.z,-S.x);       // the angle from a stack toward the Hall's centre
 // ---- S1 the Garden Stack: a planted terrace on every tier's ledge, galleries in rows, the cistern's fall
 {const S=byId.S1,d=GATESTACKS.DEFS[0];let y=S.y0;
  d.tiers.forEach((t,i)=>{y+=t.h;
   const out=GATESTACKS.ring(S,y-1.5,64),inn=i<d.tiers.length-1?GATESTACKS.ring(S,y+1.5,64):null;
   if(out)F({id:'stacks.S1.terrace.'+i,stack:'S1',kind:'terrace',y:y,outer:out,inner:inn,tags:{types:['farm'],role:'garden'}});});
  for(const [ri,yy] of [[0,60],[1,160],[2,200],[3,270]].map(v=>v)){const n=7;
   for(let i=0;i<n;i++){const a=toHall(S)+(i-(n-1)/2)*.42+(U(7441,1,ri,i)-.5)*.1,w=GATESTACKS.onWall(S,yy,a);if(!w)continue;
    F({id:'stacks.S1.gallery.'+ri+'.'+i,stack:'S1',kind:'gallery',x:w.x,y:yy,z:w.z,nx:w.nx,nz:w.nz,w:14+8*U(7441,2,ri,i),h:7+3*U(7441,3,ri,i),
     planted:true,tags:{types:['farm'],role:'hanging-garden'}});}}
  const a=toHall(S)+.35,w=GATESTACKS.onWall(S,S.top-4,a);
  if(w){const fx=w.x+w.nx*3,fz=w.z+w.nz*3,g=G0(fx+w.nx*20,fz+w.nz*20);
   P.falls.push({id:'stacks.S1.fall',stack:'S1',x:fx,z:fz,nx:w.nx,nz:w.nz,y0:S.top-6,y1:g,w:10,source:'cistern'});
   P.pools.push({id:'stacks.S1.pool',x:fx+w.nx*26,z:fz+w.nz*26,r:30,level:g-.4,to:'hall.pond'});}}
 // ---- S2 the Works Stack: smelter galleries facing the Hall in three rows, flues up through its top, a haul incline
 {const S=byId.S2;
  for(const [ri,yy] of [[0,40],[1,90],[2,140]]){const n=5;
   for(let i=0;i<n;i++){const a=toHall(S)+(i-(n-1)/2)*.36,w=GATESTACKS.onWall(S,yy,a);if(!w)continue;
    F({id:'stacks.S2.works.'+ri+'.'+i,stack:'S2',kind:'gallery',x:w.x,y:yy,z:w.z,nx:w.nx,nz:w.nz,w:22,h:12,planted:false,
     glow:ri===1,tags:{types:['industry'],role:'smelter'}});}}
  const top=GATESTACKS.ring(S,S.top-2,24);
  if(top){for(let i=0;i<4;i++){const p=top[(i*6+2)%top.length],t=.55+.15*U(7442,5,i);
   F({id:'stacks.S2.flue.'+i,stack:'S2',kind:'chimney',x:S.x+(p[0]-S.x)*t,y:S.top,z:S.z+(p[1]-S.z)*t,r:4.5+2*U(7442,6,i),h:38+24*U(7442,7,i),
    tags:{types:['industry'],role:'flue'}});}}
  const w=GATESTACKS.onWall(S,6,toHall(S)-.6);
  if(w)F({id:'stacks.S2.incline',stack:'S2',kind:'incline',a:[w.x,S.y0+90,w.z],b:[w.x+w.nx*170,S.y0,w.z+w.nz*170],w:8,tags:{types:['infrastructure'],role:'haul'}});}
 // ---- S3 the Mine Stack: adits round its foot, each with its spoil fan; two saucer decks facing the Hall
 {const S=byId.S3;
  for(let i=0;i<4;i++){const a=toHall(S)+Math.PI*(.35+.43*i),w=GATESTACKS.onWall(S,S.y0+5,a);if(!w)continue;
   F({id:'stacks.S3.adit.'+i,stack:'S3',kind:'adit',x:w.x,y:S.y0,z:w.z,nx:w.nx,nz:w.nz,w:7,h:8,tags:{types:['industry'],role:'mine'}});
   F({id:'stacks.S3.spoil.'+i,stack:'S3',kind:'spoil',x:w.x+w.nx*34,y:S.y0,z:w.z+w.nz*34,r:22+10*U(7443,1,i),h:9+6*U(7443,2,i),tags:{types:['industry'],role:'spoil'}});}
  for(const [si,yy,da] of [[0,180,-.5],[1,240,0]]){const w=GATESTACKS.onWall(S,yy,toHall(S)+da);if(!w)continue;const r=24;
   F({id:'stacks.S3.saucer.'+si,stack:'S3',kind:'saucer',x:w.x+w.nx*r*.55,y:yy,z:w.z+w.nz*r*.55,r:r,rim:6,nx:w.nx,nz:w.nz,tags:{types:['civic'],role:'deck'}});}
  for(let i=0;i<10;i++){const yy=60+28*i,w=GATESTACKS.onWall(S,yy,toHall(S)+Math.PI+(U(7443,4,i)-.5)*2.2);if(!w)continue;
   F({id:'stacks.S3.stope.'+i,stack:'S3',kind:'gallery',x:w.x,y:yy,z:w.z,nx:w.nx,nz:w.nz,w:9,h:6,planted:false,tags:{types:['industry'],role:'stope'}});}}
 // ---- S4 the Lookout: the saucer on its head
 {const S=byId.S4,c=KSTACKS.at([S],S.x,S.z),tx=c?S.x:S.x,tz=c?S.z:S.z;
  // a leaning spire's head is off its foot: the top ring's centre
  const r=GATESTACKS.ring(S,S.top-8,24);let cx=tx,cz=tz;if(r){cx=r.reduce((s,p)=>s+p[0],0)/r.length;cz=r.reduce((s,p)=>s+p[1],0)/r.length;}
  F({id:'stacks.S4.saucer',stack:'S4',kind:'saucer',x:cx,y:S.top-8,z:cz,r:22,rim:5,nx:0,nz:0,crown:true,tags:{types:['civic'],role:'lookout'}});
  for(let i=0;i<5;i++){const yy=30+36*i,w=GATESTACKS.onWall(S,yy,i*1.3);if(!w)continue;
   F({id:'stacks.S4.stair.'+i,stack:'S4',kind:'gallery',x:w.x,y:yy,z:w.z,nx:w.nx,nz:w.nz,w:5,h:4,planted:false,tags:{types:['infrastructure'],role:'stair'}});}}
 // ---- S5 the Quarry: its lake at the foot, toward the Hall, and the causeway from the pond's bank
 {const S=byId.S5,w=GATESTACKS.onWall(S,4,toHall(S)+.9);
  if(w)P.pools.push({id:'stacks.S5.lake',x:w.x+w.nx*60,z:w.z+w.nz*60,r:46,level:G0(w.x,w.z)-1.2,quarry:true});
  const a=Math.atan2(S.z,S.x),r0=(H?GATEARC.pondR(a):300)+10,f=GATESTACKS.onWall(S,4,a+Math.PI);
  if(f)P.causeways.push({id:'stacks.S5.cause',from:[Math.cos(a)*r0,2.4,Math.sin(a)*r0],to:[f.x-f.nx*6,2.4,f.z-f.nz*6],w:12});}
 // ---- the bridges
 const D=GATESTACKS.DECK;
 const endOf=(e,y,toward)=>{
  if(e.stack){const S=byId[e.stack],f=GATESTACKS.facing(S,y,toward[0]-S.x,toward[1]-S.z);if(!f)return null;
   return {stack:e.stack,x:f.x-f.nx*GATESTACKS.EMBED,z:f.z-f.nz*GATESTACKS.EMBED,face:[f.x,f.z],n:[f.nx,f.nz]};}
  if(!H)return null;const sl=H.slabs.find(s=>s.key===e.slab),a=Math.atan2(toward[1],toward[0]),r=GATEARC.hexR(a,sl.ro);
  const k=Math.floor((((a*180/Math.PI)%360)+360)%360/60),ca=GATEARC.corner(k,sl.ro),cb=GATEARC.corner(k+1,sl.ro);
  // t along face k where the ray crosses it
  const t=((Math.cos(a)*r-ca[0])*(cb[0]-ca[0])+(Math.sin(a)*r-ca[1])*(cb[1]-ca[1]))/(sl.ro*sl.ro);
  return {slab:e.slab,x:Math.cos(a)*(r-2),z:Math.sin(a)*(r-2),face:[Math.cos(a)*r,Math.sin(a)*r],n:[Math.cos(a),Math.sin(a)],k:k,t:t};};
 for(const sp of GATESTACKS.SPANS){
  const cA=sp.a.stack?hub(byId[sp.a.stack]):[0,0],cB=sp.b.stack?hub(byId[sp.b.stack]):[0,0];
  const A=endOf(sp.a,sp.y,cB),B=endOf(sp.b,sp.y,cA);if(!A||!B)continue;
  // the open span: face to face; the piers stand under it every pierEvery metres
  const span=Math.hypot(B.face[0]-A.face[0],B.face[1]-A.face[1]),np=Math.max(0,Math.ceil(span/D.pierEvery)-1),piers=[];
  for(let i=1;i<=np;i++){const t=i/(np+1),x=A.face[0]+(B.face[0]-A.face[0])*t,z=A.face[1]+(B.face[1]-A.face[1])*t;
   piers.push({id:'stacks.'+sp.id+'.pier.'+i,x:x,z:z,y0:GATEARC&&H&&GATEARC.inPond(x,z)?H.pond.bed:G0(x,z),y1:sp.y-D.depth,w:D.pierW});}
  P.bridges.push({id:'stacks.'+sp.id,key:sp.id,a:A,b:B,y:sp.y,w:D.w,depth:D.depth,span:span,piers:piers,kind:'girder',
   tags:{types:['infrastructure'],role:'bridge'}});}
 P.stats={stacks:P.stacks.length,fittings:P.fittings.length,bridges:P.bridges.length,
  longest:Math.round(Math.max.apply(null,P.bridges.map(b=>b.span)))};
 return P;};

// ---- the ruin (deltas by id) ---------------------------------------------------------------------------------------
// B2 (the upper slab to the Garden Stack) broken in mid-span; B4's Hall end fallen with the upper slab's edge (it keeps
// 0.6 of its length from the Mine Stack); B6 gone and a Kimr rope bridge slung in its place; one of the Works Stack's
// flues down; the galleries' glass gone, their gardens wild.
GATESTACKS.ruin=function(P){
 const R={broken:[{id:'stacks.B2',gap:[.5,.62]}],cut:[{id:'stacks.B4',keep:.6,from:'b'}],rope:[{id:'stacks.B6'}],gone:['stacks.S2.flue.2'],
  stats:{}};
 R.stats={broken:R.broken.length,cut:R.cut.length,rope:R.rope.length};
 return R;};
