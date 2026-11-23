// ================================================================= XANADU — the Xanadui fort, as data (settlements/strongwall/PLAN.md section 5, F1)  [G data]
// A fort is planned before it is drawn: XFORT.plan(o) turns a size (and optionally an outline) into records in the def's
// frame (x east, +z the front, toward the approach; metres; y up), and the rules a fort must keep are plain functions on
// those records, so Godot and the sim read the same plan the page draws (80g-xa-fort.js draws it). No THREE, no DOM:
// node-tested (kits/xanadu/tests/test-fort.js). The damage of the damaged and ruined states is hashed from core/rand
// (KRAND) by (seed, piece, salt), never by how many draws came before it.
//
//   XFORT.SIZES               watch (the Marches' forts), march (Strongwall: two wards, the gorge wall, the assay, the
//                             Tears' court), gate (a gate works: a town's gate between two towers)
//   XFORT.plan(o)             o {size:'watch'|'march'|'gate', outline:[[x,z],...] (watch only: a convex ward of any shape),
//                             gateEdge (the outline edge the gate is on, 0 the first)} ->
//                             {size, w, d, wards, curtains, towers, gates, buildings, stairs, guns, beacon, garrison, stores}
//       a curtain {id, a, b, h, t, walk, out}: its centre line a to b, out the unit normal away from the ward;
//       a tower {id, kind, at, ctr, form, w | r, h}: at its point on the wall (the rules'), ctr its drawn centre, pushed
//       out so a flanking tower stands proud of the wall and its inner face is flush with the wall's;
//       a gate {id, curtain, t, kind, w, at, ry} (ry turns the gate's front, its local +z, out of the ward)
//   XFORT.check(P)            the rules: [] when the plan keeps them, else one line per fault
//   XFORT.damage(P, state, seed)   'kept' | 'damaged' | 'ruined' -> {state, breaches, towers, gates, roofs, stubs, keep, heaps}
//   XFORT.post()              a watch post (the watch line's: a square tower, its fire basket, a fuel store, a hut)
const XFORT=(function(){
 'use strict';
 const SIZES={
  watch:{w:56,d:42,curtH:6,curtT:2.4,walk:1.6,tower:{form:'square',w:6,h:9},gateTower:{form:'square',w:6,h:11},gap:40,gateW:4.5,keep:{w:12,d:12,h:18},garrison:150,grain_t:12},
  march:{curtH:9,curtT:3.5,walk:2.4,tower:{form:'drum',r:5.5,h:11},gateTower:{form:'square',w:7,h:14},rockTower:{form:'square',w:8,h:14},gap:30,gateW:5.5,keep:{w:24,d:18,h:30},garrison:250,grain_t:60},
  gate:{curtH:7,curtT:3,walk:2,tower:{form:'square',w:7,h:12},gateTower:{form:'square',w:7,h:12},gateW:5,garrison:0,grain_t:0}};
 const r2=v=>Math.round(v*100)/100;
 /* a rectangle as an outline: front-left, front-right, back-right, back-left (the winding every outline is put in) */
 const rect=(x0,z0,x1,z1)=>[[x0,z1],[x1,z1],[x1,z0],[x0,z0]];
 const area=poly=>{let s=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];s+=a[0]*b[1]-b[0]*a[1];}return s/2;};
 const outOf=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;return[r2(-dz/L*1e4)/1e4,r2(dx/L*1e4)/1e4];};   // the normal away from the ward, for this winding
 const half=t=>t.r!=null?t.r:t.w/2;
 const curtain=(id,ward,a,b,S,more)=>Object.assign({id,ward,a:a.slice(),b:b.slice(),h:S.curtH,t:S.curtT,walk:S.walk,out:outOf(a,b)},more||{});
 /* a tower at a point of the wall, its centre pushed out along n (a unit vector) so its inner face is flush with the wall's */
 function tower(P,id,kind,at,n,spec,t){const push=Math.max(0,half(spec)-t/2);
  P.towers.push(Object.assign({id,kind,at:[r2(at[0]),r2(at[1])],ctr:[r2(at[0]+n[0]*push),r2(at[1]+n[1]*push)]},spec));}
 /* towers along a curtain at most `gap` apart (the corners are the ward's) */
 function intervals(P,c,S){const L=Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]),k=Math.ceil(L/S.gap-1e-6)-1;
  for(let j=1;j<=k;j++){const u=j/(k+1);tower(P,c.id+'.i'+j,'interval',[c.a[0]+(c.b[0]-c.a[0])*u,c.a[1]+(c.b[1]-c.a[1])*u],c.out,S.tower,c.t);}}
 /* a ward: a curtain per outline edge (but `skip`), a tower at each corner (pushed out along the corner's two normals),
    interval towers along each edge */
 function ward(P,id,poly,S,o){o=o||{};const n=poly.length,cs=[];
  for(let i=0;i<n;i++){if(o.skip&&o.skip.indexOf(i)>=0)continue;cs.push(curtain(id+'.c'+i,id,poly[i],poly[(i+1)%n],S,{edge:i}));}
  P.curtains.push(...cs);
  for(let i=0;i<n;i++){const p=poly[i];if(P.towers.some(t=>Math.hypot(t.at[0]-p[0],t.at[1]-p[1])<.5))continue;
   const n1=outOf(poly[(i+n-1)%n],p),n2=outOf(p,poly[(i+1)%n]),bx=n1[0]+n2[0],bz=n1[1]+n2[1],L=Math.hypot(bx,bz)||1;
   tower(P,id+'.t'+i,'corner',p,[bx/L,bz/L],S.tower,S.curtT);}
  cs.forEach(c=>intervals(P,c,S));P.wards.push({id,poly:poly.map(p=>p.slice())});return cs;}
 /* a gate at a fraction t along a curtain: the interval towers within reach of it go, a gate tower flanks it each side
    (none for a water gate, whose arches are the curtain's own) */
 function gateOn(P,id,c,t,kind,w,S){const dx=c.b[0]-c.a[0],dz=c.b[1]-c.a[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;
  const at=[r2(c.a[0]+dx*t),r2(c.a[1]+dz*t)],g={id,curtain:c.id,t,kind,w,at,ry:r2(Math.atan2(c.out[0],c.out[1]))};P.gates.push(g);
  if(kind==='water')return g;
  const gt=S.gateTower,off=w/2+half(gt)+.5,reach=off+half(gt)+4;
  for(let i=P.towers.length-1;i>=0;i--){const tw=P.towers[i];if(tw.kind==='interval'&&Math.hypot(tw.at[0]-at[0],tw.at[1]-at[1])<reach+half(tw))P.towers.splice(i,1);}
  for(const s of[-1,1])tower(P,id+'.t'+(s<0?'l':'r'),'gate',[at[0]+ux*off*s,at[1]+uz*off*s],c.out,gt,c.t);
  return g;}
 /* after the gates: along every curtain, a tower wherever the towers on it (a gate's, a corner's, a water gate's arches)
    stand further apart than `gap`, spaced evenly over the run */
 function fill(P,S){if(!S.gap)return;P.curtains.forEach(c=>{const L=Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]),f=p=>((p[0]-c.a[0])*(c.b[0]-c.a[0])+(p[1]-c.a[1])*(c.b[1]-c.a[1]))/L;
  const on=P.towers.filter(t=>segDist(t.at,c.a,c.b)<1).map(t=>f(t.at)).concat(P.gates.filter(g=>g.curtain===c.id&&g.kind==='water').map(g=>f(g.at)));
  const stops=[0].concat(on.sort((a,b)=>a-b),[L]);
  for(let i=1;i<stops.length;i++){const gap=stops[i]-stops[i-1];if(gap<=S.gap+.5)continue;const k=Math.ceil(gap/S.gap-1e-6)-1;
   for(let j=1;j<=k;j++){const s=stops[i-1]+gap*j/(k+1);tower(P,c.id+'.f'+i+'.'+j,'interval',[c.a[0]+(c.b[0]-c.a[0])*s/L,c.a[1]+(c.b[1]-c.a[1])*s/L],c.out,S.tower,c.t);}}});}
 const B=(P,id,kind,x,z,w,d,h,more)=>{const b=Object.assign({id,kind,at:[r2(x),r2(z)],w,d,h},more||{});P.buildings.push(b);return b;};
 function plan(o){o=o||{};const size=o.size||'watch',S=SIZES[size];if(!S)throw new Error('XFORT.plan: no size '+size);
  const P={size,wards:[],curtains:[],towers:[],gates:[],buildings:[],stairs:[],guns:[],beacon:null,garrison:S.garrison,stores:{grain_t:S.grain_t},S};
  if(size==='watch'){let poly=o.outline?o.outline.map(p=>p.slice()):rect(-S.w/2,-S.d/2,S.w/2,S.d/2);if(area(poly)>0)poly.reverse();
   const cs=ward(P,'ward',poly,S);const ge=o.gateEdge==null?0:o.gateEdge;gateOn(P,'gate',cs.find(c=>c.edge===ge)||cs[0],.5,'iwan',S.gateW,S);
   /* the buildings in the ward's inscribed box: the keep at the back, the barracks along the right, the stables along the
      left, the magazine and granary in the back corners, the cistern before the keep */
   const bx=inscribed(poly,S.curtT),cx=(bx[0]+bx[2])/2,K=S.keep,id=bx[3]-bx[1];
   B(P,'keep','keep',cx,bx[1]+6+K.d/2,K.w,K.d,K.h,{beacon:true});
   B(P,'barracks','barracks',bx[2]-4,(bx[1]+bx[3])/2+2,8,Math.min(26,id-10),7);
   B(P,'stables','stables',bx[0]+3.5,(bx[1]+bx[3])/2+4,7,Math.min(18,id-16),4);
   B(P,'magazine','magazine',bx[0]+3.5,bx[1]+3,6,5,3.2);
   B(P,'granary','granary',bx[0]+12,bx[1]+3,6,5,4.5);
   B(P,'cistern','cistern',cx,bx[1]+6+K.d+3,2,2,.9);   /* 3 m before the keep's door */
   P.stairs.push({curtain:cs[0].id,u:.25},{curtain:cs[0].id,u:.75});
   P.guns.push({id:'gun.gate',gate:'gate',ry:0});
   P.beacon={on:'keep'};}
  else if(size==='march'){
   /* Strongwall: the inner ward against the gorge (its back curtain the middle of the gorge wall, the Gold Gate in it), the
      outer ward in front of it (the Qiblai Gate in its front curtain, a barbican before it), the gorge wall's two wings
      to the scarp's rock, a square rock tower at each end and the water gate in the east wing for Kruk Gill */
   const IW=110,ID=80,OW=140,OD=70,GW=190;
   const ci=ward(P,'inner',rect(-IW/2,-ID,IW/2,0),S),co=ward(P,'outer',rect(-OW/2,0,OW/2,OD),S,{skip:[2]});   // the outer ward's back is the inner ward's front, and two short wings
   const back=[curtain('outer.back.w','outer',[-IW/2,0],[-OW/2,0],S),curtain('outer.back.e','outer',[OW/2,0],[IW/2,0],S)];
   const wings=[curtain('gorge.w','gorge',[-IW/2,-ID],[-GW/2,-ID],S,{h:S.curtH+1}),curtain('gorge.e','gorge',[GW/2,-ID],[IW/2,-ID],S,{h:S.curtH+1})];
   P.curtains.push(...back,...wings);
   tower(P,'rock.w','rock',[-GW/2,-ID],[0,-1],S.rockTower,S.curtT);tower(P,'rock.e','rock',[GW/2,-ID],[0,-1],S.rockTower,S.curtT);
   wings.forEach(c=>intervals(P,c,S));
   gateOn(P,'gate.qiblai',co.find(c=>c.edge===0),.5,'bent',S.gateW,S);
   gateOn(P,'gate.inner',ci.find(c=>c.edge===0),.5,'iwan',S.gateW,S);
   gateOn(P,'gate.gold',ci.find(c=>c.edge===2),.5,'iwan',S.gateW,S);
   gateOn(P,'gate.water',wings[1],.5,'water',12,S);
   P.barbican={at:[0,OD+8],w:22,d:14,open:'west'};
   /* the inner ward (x -53.25..53.25, z -78.25..-1.75 inside its curtain) */
   const K=S.keep;B(P,'keep','keep',-22,-58,K.w,K.d,K.h,{beacon:true,master:true});
   B(P,'strongroom','strongroom',-6,-58,8,8,5,{attached:'keep'});
   B(P,'assay.furnace','assay-furnace',18,-70,20,10,7,{chimney:true});
   B(P,'assay.weigh','assay-weigh',38,-70,14,10,6);
   B(P,'barracks.w','barracks',-48,-27,8,34,7);
   B(P,'barracks.e','barracks',48,-38,8,30,7);
   B(P,'magazine','magazine',-44,-73,8,6,3.6);
   B(P,'wheel','wheel-house',14,-12,6,6,6);
   B(P,'cistern','cistern',0,-34,3,3,1);
   /* the outer ward (x -68.25..68.25, z 1.75..68.25) */
   B(P,'stables','stables',-63,28,8,36,4.5);
   B(P,'ore-shed','ore-shed',-24,16,20,8,4.5);
   B(P,'granary','granary',-34,59,12,9,5.5);
   B(P,'smithy','smithy',-17,59,12,9,5);
   B(P,'quarters','married-quarters',63,24,8,26,6.5);
   B(P,'muskets','barracks',28,16,22,8,6.5,{hired:true});
   B(P,'muster','muster',0,36,28,18,0);
   /* the Golden Tears' court (the owner, 2026-11-16: "move them into the fort"): its own low wall, gate and tower */
   P.court={id:'court.tears',poly:rect(34,38,68.25,68.25),wallH:4,wallT:1.2,gateAt:[34,52],tower:{at:[38,42],w:7,h:13}};
   B(P,'court.house','merchant-house',53,60,22,10,8,{court:'court.tears'});
   B(P,'court.store','ore-store',54,47,14,7,4.5,{court:'court.tears'});
   P.stairs.push({curtain:'inner.c0',u:.3},{curtain:'inner.c2',u:.3},{curtain:'outer.c0',u:.25},{curtain:'outer.c0',u:.75},{curtain:'gorge.w',u:.3},{curtain:'gorge.e',u:.8});
   P.guns.push({id:'gun.gorge.w',curtain:'inner.c2',u:.36},{id:'gun.gorge.e',curtain:'inner.c2',u:.64},{id:'gun.qiblai',gate:'gate.qiblai'});
   P.beacon={on:'keep'};}
  else if(size==='gate'){
   /* the gate works: no ward, a curtain stub each side to the town's own wall or rock */
   const cs=[curtain('stub.w','works',[-22,0],[-2.5,0],S),curtain('stub.e','works',[2.5,0],[22,0],S)];P.curtains.push(...cs);
   const whole=curtain('works','works',[-22,0],[22,0],S);gateOn(P,'gate',whole,.5,'iwan',S.gateW,S);P.gates[0].curtain=null;P.gates[0].guardroom=true;
   P.stairs.push({curtain:'stub.w',u:.4},{curtain:'stub.e',u:.6});}
  fill(P,S);
  /* the plan's footprint, then everything moved so the footprint is centred on the def's origin */
  const pts=[];P.curtains.forEach(c=>pts.push(c.a,c.b));P.towers.forEach(t=>{const r=half(t);pts.push([t.ctr[0]-r,t.ctr[1]-r],[t.ctr[0]+r,t.ctr[1]+r]);});
  if(P.barbican){const b=P.barbican;pts.push([b.at[0]-b.w/2,b.at[1]-b.d/2],[b.at[0]+b.w/2,b.at[1]+b.d/2]);}
  P.buildings.forEach(b=>{pts.push([b.at[0]-b.w/2,b.at[1]-b.d/2],[b.at[0]+b.w/2,b.at[1]+b.d/2]);});
  let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;pts.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);});
  shift(P,-r2((x0+x1)/2),-r2((z0+z1)/2));P.w=Math.ceil(x1-x0+4);P.d=Math.ceil(z1-z0+4);
  return P;}
 /* the largest axis box (inset by the curtain) inside a convex ward, shrunk about the centroid until its corners are in */
 function inside(poly,p){let s=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],c=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(c>1e-9)s|=1;else if(c<-1e-9)s|=2;}return s!==3;}
 function inscribed(poly,inset){let cx=0,cz=0;poly.forEach(p=>{cx+=p[0];cz+=p[1];});cx/=poly.length;cz/=poly.length;
  let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;poly.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);});
  for(let k=1;k>.05;k-=.02){const hx=(x1-x0)/2*k,hz=(z1-z0)/2*k,b=[cx-hx+inset,cz-hz+inset,cx+hx-inset,cz+hz-inset];
   const far=[[b[0]-inset,b[1]-inset],[b[2]+inset,b[1]-inset],[b[2]+inset,b[3]+inset],[b[0]-inset,b[3]+inset]];if(far.every(p=>inside(poly,p)))return b.map(r2);}
  return[cx-1,cz-1,cx+1,cz+1];}
 function shift(P,dx,dz){const mv=p=>{p[0]=r2(p[0]+dx);p[1]=r2(p[1]+dz);};
  P.curtains.forEach(c=>{mv(c.a);mv(c.b);});P.towers.forEach(t=>{mv(t.at);mv(t.ctr);});P.gates.forEach(g=>mv(g.at));P.buildings.forEach(b=>mv(b.at));
  P.wards.forEach(w=>w.poly.forEach(mv));if(P.barbican)mv(P.barbican.at);if(P.court){P.court.poly.forEach(mv);mv(P.court.gateAt);mv(P.court.tower.at);}}
 /* ---------------------------------------------------------------- the rules */
 const near=(a,b,e)=>Math.hypot(a[0]-b[0],a[1]-b[1])<(e==null?.5:e);
 const segDist=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=L2?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L2)):0;return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t);};
 const box=b=>[b.at[0]-b.w/2,b.at[1]-b.d/2,b.at[0]+b.w/2,b.at[1]+b.d/2];
 const tbox=t=>{const r=half(t);return[t.ctr[0]-r,t.ctr[1]-r,t.ctr[0]+r,t.ctr[1]+r];};
 const overlap=(p,q,e)=>Math.min(p[2],q[2])-Math.max(p[0],q[0])>(e==null?.1:e)&&Math.min(p[3],q[3])-Math.max(p[1],q[1])>(e==null?.1:e);
 /* a building's box against a curtain's band (its centre line widened by half its thickness) */
 const intoCurtain=(bx,c)=>{const hw=c.t/2-.05;for(let i=0;i<=8;i++)for(let j=0;j<=8;j++){const p=[bx[0]+(bx[2]-bx[0])*i/8,bx[1]+(bx[3]-bx[1])*j/8];if(segDist(p,c.a,c.b)<hw)return true;}return false;};
 const RULES={
  'a tower at every corner':P=>P.wards.flatMap(w=>w.poly.filter(p=>!P.towers.some(t=>near(t.at,p,1))).map(p=>w.id+' corner '+p.join(','))),
  'towers no further apart than the size allows':P=>{const gap=P.S.gap;if(!gap)return[];const out=[];
   P.curtains.forEach(c=>{const L=Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]),on=P.towers.filter(t=>segDist(t.at,c.a,c.b)<1).map(t=>Math.hypot(t.at[0]-c.a[0],t.at[1]-c.a[1]));
    P.gates.filter(g=>g.curtain===c.id&&g.kind==='water').forEach(g=>on.push(Math.hypot(g.at[0]-c.a[0],g.at[1]-c.a[1])));   // a water gate's arches are a tower's worth of masonry
    const stops=[0].concat(on.sort((a,b)=>a-b),[L]);for(let i=1;i<stops.length;i++)if(stops[i]-stops[i-1]>gap+.5)out.push(c.id+' '+Math.round(stops[i]-stops[i-1])+' m between towers');});return out;},
  'the gate on an edge, never in a corner':P=>P.gates.filter(g=>g.curtain&&(g.t<.15||g.t>.85||P.wards.some(w=>w.poly.some(p=>near(p,g.at,g.w))))).map(g=>g.id+' at a corner'),
  'every wall walk reaches a stair':P=>{/* curtains that meet end to end (or at a tower) are one walk; each walk needs a stair */
   const id=P.curtains.map((c,i)=>i),find=i=>{while(id[i]!==i)i=id[i]=id[id[i]];return i;};
   P.curtains.forEach((c,i)=>P.curtains.forEach((e,j)=>{if(j<=i)return;if([c.a,c.b].some(p=>[e.a,e.b].some(q=>near(p,q,1.5))))id[find(i)]=find(j);}));
   const has={};P.stairs.forEach(s=>{const i=P.curtains.findIndex(c=>c.id===s.curtain);if(i>=0)has[find(i)]=true;});
   return P.curtains.filter((c,i)=>!has[find(i)]).map(c=>c.id+' has no stair to its walk');},
  'no building overlaps another, a tower or a curtain':P=>{const out=[];P.buildings.forEach((b,i)=>{const p=box(b);
   P.buildings.forEach((e,j)=>{if(j<=i||b.attached===e.id||e.attached===b.id)return;if(overlap(p,box(e)))out.push(b.id+' overlaps '+e.id);});
   P.towers.forEach(t=>{if(overlap(p,tbox(t)))out.push(b.id+' overlaps the tower '+t.id);});
   P.curtains.forEach(c=>{if(intoCurtain(p,c))out.push(b.id+' stands in '+c.id);});});return out;},
  'the keep clear of the curtain by 6 m':P=>{const k=P.buildings.find(b=>b.kind==='keep');if(!k)return[];const p=box(k),out=[];
   P.curtains.forEach(c=>{const corners=[[p[0],p[1]],[p[2],p[1]],[p[2],p[3]],[p[0],p[3]]],d=Math.min(...corners.map(q=>segDist(q,c.a,c.b)))-c.t/2;if(d<6-.01)out.push('the keep '+d.toFixed(1)+' m from '+c.id);});return out;}};
 function check(P){const out=[];for(const k in RULES)RULES[k](P).forEach(f=>out.push(k+': '+f));return out;}
 /* ---------------------------------------------------------------- the states (core/ruins): kept, damaged, ruined */
 function damage(P,state,seed){seed=(seed==null?0:seed)>>>0;const KR=typeof KRAND!=='undefined'?KRAND:null;if(!KR)throw new Error('XFORT.damage needs core/rand (KRAND)');
  const u=(i,salt)=>KR.unit(KR.hash(seed,i,salt)),D={state:state||'kept',breaches:[],towers:{},gates:{},roofs:{},stubs:{},keep:null,heaps:[]};
  if(!state||state==='kept')return D;
  const len=c=>Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]),pt=(c,t)=>[r2(c.a[0]+(c.b[0]-c.a[0])*t),r2(c.a[1]+(c.b[1]-c.a[1])*t)];
  const ry=c=>Math.atan2(c.b[1]-c.a[1],c.b[0]-c.a[0]);
  if(state==='damaged'){
   /* one breach (two at a march fort) in curtains with no gate, each 6-10 m, a talus on both faces, clear of the towers;
      a tower or two lose their top storey; the main gate burnt; a barracks roof burnt through */
   const gated=new Set(P.gates.map(g=>g.curtain)),cand=P.curtains.filter(c=>!gated.has(c.id)&&len(c)>24),nb=P.size==='march'?2:1;
   for(let k=0;k<nb*4&&D.breaches.length<Math.min(nb,cand.length);k++){const c=cand[Math.floor(u(k,1)*cand.length)%cand.length];if(D.breaches.some(b=>b.curtain===c.id))continue;
    const L=len(c),w=6+4*u(k,2);let mid=.3+.4*u(k,3);
    const tw=P.towers.filter(t=>segDist(t.at,c.a,c.b)<1).map(t=>Math.hypot(t.at[0]-c.a[0],t.at[1]-c.a[1])/L);   // keep the breach off the towers on this curtain
    for(let tries=0;tries<12&&tw.some(f=>Math.abs(f-mid)*L<w/2+6);tries++)mid=.2+.6*u(k*31+tries,13);
    if(tw.some(f=>Math.abs(f-mid)*L<w/2+6))continue;
    const m=pt(c,mid);D.breaches.push({curtain:c.id,u0:r2(mid-w/2/L),u1:r2(mid+w/2/L)});
    D.heaps.push({id:'breach.'+c.id,x:m[0],z:m[1],rx:w*.75,rz:c.t+4,ry:ry(c),h:c.h*.32,seed:KR.hash(seed,k,4)});}
   const tws=P.towers.filter(t=>t.kind!=='gate'),nt=P.size==='march'?2:1;
   for(let k=0;k<nt*4&&Object.keys(D.towers).length<Math.min(nt,tws.length);k++){const t=tws[Math.floor(u(k,5)*tws.length)%tws.length];D.towers[t.id]={keep:.62,fallen:true};}
   const g=P.gates.find(q=>q.kind!=='water');if(g)D.gates[g.id]='burnt';
   const br=P.buildings.filter(b=>b.kind==='barracks');if(br.length)D.roofs[br[Math.floor(u(0,6)*br.length)%br.length].id]='burnt';}
  else if(state==='ruined'){
   /* a generation abandoned: every curtain in stretches of 5-10 m, each 10-60 % of its height or fallen to a heap; the
      towers shells at 30-60 %; the keep to one or two storeys; the buildings low walls, no roofs; the gates gone */
   P.curtains.forEach((c,ci)=>{const L=len(c),parts=[];let a=0,k=0;
    while(a<L-.01){const s=Math.min(L-a,5+5*u(ci*97+k,7)),f=u(ci*97+k,8),h=f<.18?0:c.h*(.1+.5*u(ci*97+k,9));parts.push({u0:r2(a/L),u1:r2((a+s)/L),h:r2(h)});
     if(h<c.h*.25){const m=pt(c,(a+s/2)/L);D.heaps.push({id:'stub.'+c.id+'.'+k,x:m[0],z:m[1],rx:s*.6,rz:c.t+2.5,ry:ry(c),h:Math.max(1,c.h*.22),seed:KR.hash(seed,ci,k,10)});}
     a+=s;k++;}D.stubs[c.id]=parts;});
   P.towers.forEach((t,i)=>{D.towers[t.id]={keep:r2(.3+.3*u(i,11)),fallen:true,shell:true};});
   P.gates.forEach(g=>{D.gates[g.id]='gone';});P.buildings.forEach(b=>{D.roofs[b.id]='gone';});
   if(P.buildings.some(b=>b.kind==='keep'))D.keep={storeys:1+Math.floor(u(0,12)*2)};}
  return D;}
 /* ---------------------------------------------------------------- the walks (F4b, 2026-11-23): where a wall walk runs
    Along every standing curtain the towers and gatehouses it meets are BLOCKS (a gatehouse and the gate towers beside it one block):
    the walk runs between them, never through them. A kept tower at a block's end is climbed: a flight up the walk to its top (a
    drum's floor is its ring, 0.8 m over its body; a square tower's its roof slab), and its top is a floor across it (or to its
    centre, where the curtain ends in it: a corner's two curtains meet there). A gatehouse block is not crossed (its roof carries the
    main gate's pavilion): the walk ends at its gate towers' tops on either side. A fallen tower ends the walk at its face. Every
    stair from the ward lands on a stretch of plain walk, clear of the blocks and their flights (turned to climb the other way, or
    moved along the curtain, where it would not). -> {walks:[{curtain, s0, s1, a, b, y}], flights:[{curtain, tower, foot, head,
    y0, y1}], tops:[{tower, a, b, y}], stairs:[{curtain, s, dir, foot, head, y}], gaps:{towerId: [[x, z]]} (where a flight
    reaches a tower's parapet: its merlons stand aside), blocks:{curtainId: [[s0, s1]]}}. s along the curtain from c.a, metres. */
 const batK=(w,h,d)=>{const want=1-2*h*.088/Math.min(w,d);return want>.94?.96:want>.89?.92:want>.83?.86:.8;};   /* the kit's batter: 72-xa-helpers.js xnBatterK */
 const runOf=rise=>Math.max(2,Math.round(rise/.17))*.34;   /* a flight's length (72 xnFlight: 0.17 m risers, 0.34 m treads) */
 const STEEP={riser:.2,tread:.25},steepOf=rise=>Math.max(2,Math.round(rise/STEEP.riser))*STEEP.tread;   /* a steep stair (slope 0.8, within core/walk's step), where a flight has no room */
 const fit=(rise,room)=>{const r=runOf(rise);if(r<=room)return{run:r,steep:false};const q=steepOf(rise);return q<=room?{run:q,steep:true}:null;};
 const span=t=>t.form==='drum'?2*t.r:t.w;   /* a tower's width across */
 const towerTop=t=>t.form==='drum'?t.h+.8:t.h+.03;
 const gateHouse=(g,c)=>({w:g.w+3.2,d:(c?c.t:3)+3,h:(c?c.h:7)+3});   /* the gatehouse block 80g's xfGate draws */
 function cross(c,t,y){const L=Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]),d=[(c.b[0]-c.a[0])/L,(c.b[1]-c.a[1])/L],C=t.ctr||t.at;   /* the stretch of c's centre line inside t at height y */
  if(t.form==='drum'){const sc=(C[0]-c.a[0])*d[0]+(C[1]-c.a[1])*d[1],e=Math.abs((C[0]-c.a[0])*d[1]-(C[1]-c.a[1])*d[0]);if(e>=t.r)return null;const hc=Math.sqrt(t.r*t.r-e*e);return[sc-hc,sc+hc];}
  const k=batK(t.w,t.h,t.w),hw=t.w/2*(1-(1-k)*Math.min(1,y/t.h));let lo=-1e9,hi=1e9;
  for(let i=0;i<2;i++){if(Math.abs(d[i])<1e-9){if(Math.abs(c.a[i]-C[i])>hw)return null;continue;}const p=(C[i]-hw-c.a[i])/d[i],q=(C[i]+hw-c.a[i])/d[i];lo=Math.max(lo,Math.min(p,q));hi=Math.min(hi,Math.max(p,q));}
  return hi>lo?[lo,hi]:null;}
 function walks(P,D){D=D||{breaches:[],towers:{},gates:{},stubs:{}};const out={walks:[],flights:[],tops:[],stairs:[],gaps:{},blocks:{}},ctx={};
  const kept=t=>{const T=D.towers[t.id];return!T||(T.keep==null?1:T.keep)>=1;},gap=(t,p)=>{(out.gaps[t.id]=out.gaps[t.id]||[]).push(p);};
  P.curtains.forEach(c=>{if(D.stubs&&D.stubs[c.id])return;
   const L=Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]),d=[(c.b[0]-c.a[0])/L,(c.b[1]-c.a[1])/L],at=s=>[r2(c.a[0]+d[0]*s),r2(c.a[1]+d[1]*s)],y=c.h;
   /* the blocks: each tower's and gatehouse's stretch of the centre line, merged where under 1.5 m apart */
   const items=[];P.towers.forEach(t=>{const iv=cross(c,t,y);if(!iv)return;const s0=Math.max(0,iv[0]),s1=Math.min(L,iv[1]);if(s1-s0>.3)items.push({s0,s1,t});});
   P.gates.forEach(g=>{if(g.curtain!==c.id||g.kind==='water')return;const sg=(g.at[0]-c.a[0])*d[0]+(g.at[1]-c.a[1])*d[1],w=gateHouse(g,c).w;items.push({s0:Math.max(0,sg-w/2),s1:Math.min(L,sg+w/2),g});});
   items.sort((p,q)=>p.s0-q.s0);const B=[];
   for(const it of items){const b=B[B.length-1];if(b&&it.s0<b.s1+1.5){b.items.push(it);if(it.s1>b.s1){b.s1=it.s1;b.last=it;}}else B.push({s0:it.s0,s1:it.s1,items:[it],first:it,last:it});}
   out.blocks[c.id]=B.map(b=>[r2(b.s0),r2(b.s1)]);
   /* the pieces of walk the breaches leave */
   const cuts=[0];D.breaches.filter(b=>b.curtain===c.id).sort((p,q)=>p.u0-q.u0).forEach(b=>cuts.push(b.u0*L,b.u1*L));cuts.push(L);
   const plain=[];   /* the stretches of flat walk, for the stairs' landings */
   for(let i=0;i<cuts.length;i+=2){const p0=cuts[i],p1=cuts[i+1],bs=B.filter(b=>b.s1>p0+.01&&b.s0<p1-.01);let cur=p0;
    /* a stretch of walk; under 1.5 m at a curtain's free end (nothing meets it there: a stub's last metre past its gate tower)
       it is the wall's cap, not a walk */
    const free=e=>!P.curtains.some(o=>o!==c&&[o.a,o.b].some(q=>Math.hypot(q[0]-e[0],q[1]-e[1])<1));
    const seg=(s0,s1)=>{if(s1-s0<=.3)return;if(s1-s0<1.5&&((s0<.05&&free(c.a))||(s1>L-.05&&free(c.b))))return;out.walks.push({curtain:c.id,s0:r2(s0),s1:r2(s1),a:at(s0),b:at(s1),y});plain.push([s0,s1]);};
    bs.forEach((b,bi)=>{const nxt=bs[bi+1],lim=nxt?nxt.s0:p1;
     /* into the block: a flight onto its first tower, if it is kept and the walk before it has the room */
     const f=b.first.t,FI=f&&kept(f)&&b.s0>p0+.05?fit(towerTop(f)-y,b.s0-cur-.2):null,canIn=!!FI,inF=FI?FI.run:0;
     if(canIn){seg(cur,b.s0-inF);out.flights.push({curtain:c.id,tower:f.id,foot:at(b.s0-inF),head:at(b.s0),sFoot:r2(b.s0-inF),sHead:r2(b.s0),y0:y,y1:r2(towerTop(f)),steep:FI.steep});gap(f,at(b.s0));}
     else seg(cur,b.s0);
     /* out of the block: a flight down from its last tower, if the walk after has the room (and leaves the next block its own,
        steep if need be; where only one fits and the next is a gate tower, the wall's own tower is climbed first) */
     const l=b.last.t,nf=nxt&&nxt.first.t,nIn=nf&&kept(nf)?steepOf(towerTop(nf)-y):0;   /* the next block's own, at its steepest */
     const want=l&&kept(l)&&b.s1<p1-.05,FO=want?(fit(towerTop(l)-y,lim-.2-(nIn?nIn+.2:0)-b.s1)||(nf&&nf.kind==='gate'?fit(towerTop(l)-y,lim-.2-b.s1):null)):null,canOut=!!FO,outF=FO?FO.run:0;
     if(canOut){out.flights.push({curtain:c.id,tower:l.id,foot:at(b.s1+outF),head:at(b.s1),sFoot:r2(b.s1+outF),sHead:r2(b.s1),y0:y,y1:r2(towerTop(l)),steep:FO.steep});gap(l,at(b.s1));}
     /* the tops: a lone tower climbed from both sides is crossed; one climbed from one side (a corner, a curtain's end) is a floor
        to its centre, where the next curtain's floor meets it; a gate block's towers are climbed each from its own side */
     const one=b.items.length===1&&f;
     if(one&&canIn&&canOut)out.tops.push({tower:f.id,a:at(b.s0),b:at(b.s1),y:r2(towerTop(f))});
     else{if(canIn)out.tops.push({tower:f.id,a:at(b.s0),b:one?r2p(f.ctr):at(Math.min(b.first.s1,b.s0+span(f)*.6)),y:r2(towerTop(f))});
      if(canOut)out.tops.push({tower:l.id,a:one?r2p(l.ctr):at(Math.max(b.last.s0,b.s1-span(l)*.6)),b:at(b.s1),y:r2(towerTop(l))});}
     cur=canOut?b.s1+outF:b.s1;});
    seg(cur,p1);}
   /* the stairs from the ward, up the curtain's inner face: each lands on plain walk; it keeps clear of a gatehouse (whose block
      stands 1.5 m into the ward: the towers' inner faces are flush with the wall's) and of a curtain meeting this one's end */
   const rs=runOf(c.h-.1),onPlain=s=>plain.some(p=>s>=p[0]+.4&&s<=p[1]-.4),near=q=>P.curtains.some(o=>o!==c&&[o.a,o.b].some(e=>Math.hypot(e[0]-q[0],e[1]-q[1])<1));
   const e0=near(c.a)?c.t/2+.8:.5,e1=near(c.b)?L-c.t/2-.8:L-.5,gh=items.filter(it=>it.g);
   const clear=(s0,s1)=>s0>=e0&&s1<=e1&&!gh.some(it=>s1>it.s0-.5&&s0<it.s1+.5)&&!out.stairs.some(o=>o.curtain===c.id&&s1>Math.min(o.s,o.sHead)-1&&s0<Math.max(o.s,o.sHead)+1);
   ctx[c.id]={c,at,rs,clear,onPlain};
   P.stairs.filter(s=>s.curtain===c.id&&!D.breaches.some(b=>b.curtain===c.id&&s.u>b.u0-.15&&s.u<b.u1+.15)).forEach(st=>{let best=null;
    for(let k=0;k<=80&&!best;k++)for(const sh of k?[k*.5,-k*.5]:[0])for(const dir of[1,-1]){const s=st.u*L+sh,h=s+dir*rs;
     if(!best&&clear(Math.min(s,h),Math.max(s,h))&&onPlain(h))best={curtain:c.id,s:r2(s),sHead:r2(h),dir,foot:at(s),head:at(h),y};}
    if(best)out.stairs.push(best);});});
  /* what the stairs reach (a walk between two blocks with no room for a flight, and no stair, is no walk: nothing climbs to it):
     walks meet their flights at the feet, flights their tops at the heads, a tower's tops meet on it, a stair lands on its walk,
     and a walk's end meets another curtain's walk it touches */
  const N=[].concat(out.walks.map(w=>({k:'w',o:w})),out.flights.map(f=>({k:'f',o:f})),out.tops.map(t=>({k:'t',o:t})));
  const same=(p,q,e)=>Math.hypot(p[0]-q[0],p[1]-q[1])<(e==null?.05:e),onSeg=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=Math.max(1e-9,dx*dx+dz*dz),t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L2));return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t);};
  const link=(A,Bn)=>{const a=A.o,b=Bn.o;
   if(A.k==='w'&&Bn.k==='f')return a.curtain===b.curtain&&(same(a.a,b.foot,.1)||same(a.b,b.foot,.1));
   if(A.k==='f'&&Bn.k==='t')return a.tower===b.tower&&(same(a.head,b.a,.1)||same(a.head,b.b,.1));
   if(A.k==='t'&&Bn.k==='t')return a.tower===b.tower;
   if(A.k==='w'&&Bn.k==='w')return a.curtain!==b.curtain&&Math.abs(a.y-b.y)<.3&&[a.a,a.b].some(p=>onSeg(p,b.a,b.b)<1.5);
   return false;};
  const reach=()=>{const seen=new Set(),q=[];out.stairs.forEach(s=>{N.forEach((n,i)=>{if(n.k==='w'&&n.o.curtain===s.curtain&&!seen.has(i)&&onSeg(s.head,n.o.a,n.o.b)<.1){seen.add(i);q.push(i);}});});
   while(q.length){const i=q.pop();N.forEach((n,j)=>{if(!seen.has(j)&&(link(N[i],n)||link(n,N[i]))){seen.add(j);q.push(j);}});}
   N.forEach((n,i)=>{n.o.reached=seen.has(i);});};
  reach();
  /* the flights cut the walk into more pieces than the plan's stairs serve: a piece nothing reaches gets a stair of its own, the
     longest first, where one fits beside the curtain (extra: true); a piece too short for one stays unreached (it is drawn, but
     no walk floor: the back walls' 5 m between their towers, a stub's last metre past its gate tower) */
  for(let pass=0;pass<40;pass++){const W=out.walks.filter(w=>!w.reached).sort((p,q)=>(q.s1-q.s0)-(p.s1-p.s0));let put=null;
   for(const w of W){const X=ctx[w.curtain];if(!X)continue;
    for(let k=0;k<=Math.ceil((w.s1-w.s0)/.5)&&!put;k++){const h=(w.s0+w.s1)/2+(k%2?1:-1)*Math.ceil(k/2)*.5;if(h<w.s0+.4||h>w.s1-.4)continue;
     for(const dir of[1,-1]){const s=h-dir*X.rs;if(!put&&X.clear(Math.min(s,h),Math.max(s,h)))put={curtain:w.curtain,s:r2(s),sHead:r2(h),dir,foot:X.at(s),head:X.at(h),y:w.y,extra:true};}}
    if(put)break;}
   if(!put)break;out.stairs.push(put);reach();}
  return out;}
 const r2p=p=>[r2(p[0]),r2(p[1])];
 /* ---------------------------------------------------------------- the watch post */
 const post=()=>({w:12,d:11,tower:{at:[0,-1.5],w:5,h:8},basket:{h:1.4},store:{at:[3.8,2.6],w:3,d:3,h:2.4},hut:{at:[-3.4,2.8],w:4,d:3,h:2.6},rota:4});
 return{SIZES,plan,check,damage,walks,post,RULES,rect,area,inside,inscribed,half,towerTop,gateHouse,runOf,steepOf,STEEP,batK};
})();
if(typeof module!=='undefined')module.exports=XFORT;
