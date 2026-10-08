// prefix: dhn
// ================================================================= DHELV: THE NAV GRAPH (kits/zeijani/PLAN.md 8.1, 8.3; P6). [G data]
// One graph the ramblers walk (core/simulation's 'pedestrian' layer), written from what was built, never read off a mesh:
//   the LAYOUT's ways (DH.NODES and DH.EDGES: tubes, the braid, stairs, ramps, the ledge, the streets, with their width
//   and zone: outer, where a foreigner may go; inner; secret, the scouts' own);
//   a GRID on each open floor (the hall's floor and its bays, each well's pit floor, the apron's floor), its nodes where
//   the walk map (core/walk) has that floor and no block, its edges between neighbours a walker can walk;
//   a DOOR node a metre out from each building's front, linked to the nearest nodes it can walk to.
// Every lookup takes y: a point finds the floor under it, then a node on that floor (DHN.nearest), never the nearest in
// plan, which in the braid or under the ledge is a way on another level. Built on first use (DHN.get) after the world.
const DHN={R:.3,H:1.7,STEP:.6,HEAD:2,built:null,NOPLACE:{zj_palisade:1}};   /* NOPLACE: a wall, no door */
/* a walker can go straight from a to b: every 0.5 m a floor within a step of its feet and no block in its way; the feet end
   within a step of b. head: also 2 m clear under the rock (the carved ways; the cavern's ceilingAt is slow, every 2 m) */
DHN.segOk=function(a,b,o){o=o||{};const W=o.walk||KWALK,dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(L/.5)),R=o.r||DHN.R,H=o.h||DHN.H;let feet=a.y,lastC=-9;
 for(let i=1;i<=n;i++){const x=a.x+dx*i/n,z=a.z+dz*i/n,f=W.floorBelow(x,z,feet,DHN.STEP);if(!f||feet-f[0]>DHN.STEP)return {ok:false,why:'no floor',at:[x,feet,z]};
  feet=f[0];if(W.blocked(x,feet,z,R,H))return {ok:false,why:'blocked',at:[x,feet,z]};
  if(o.head&&typeof CVC!=='undefined'&&CVC&&(i*L/n-lastC>=2||i===n)){lastC=i*L/n;const c=CVC.ceilingAt(x,z,feet+.1);if(c!==null&&c-feet<(o.headroom||DHN.HEAD))return {ok:false,why:'headroom '+(c-feet).toFixed(2)+' m',at:[x,feet,z]};}}
 return Math.abs(feet-b.y)<=DHN.STEP?{ok:true}:{ok:false,why:'ends off its node',at:[b.x,feet,b.z]};};
/* the open floors: a grid of cell metres where the walk map has the named floor */
DHN.areas=function(){const H=DH.HALL,K=DH.APRON,A=[{id:'hall',zone:'inner',cell:3,y:H.y,x0:H.c[0]-H.rx-6,x1:H.c[0]+H.rx+6,z0:H.c[1]-H.rz-6,z1:H.c[1]+H.rz+6,floor:/^dh\.hall\.foot|^dh\.bay/}];
 for(const P of DH.PITS)A.push({id:'pit:'+P.id,zone:'inner',cell:3,y:P.floor,x0:P.c[0]-P.r,x1:P.c[0]+P.r,z0:P.c[1]-P.r,z1:P.c[1]+P.r,floor:new RegExp('^dh\\.'+P.id+'\\.pit')});
 A.push({id:'apron',zone:'outer',cell:5,y:null,x0:K.c[0]-K.r,x1:Math.min(K.c[0]+K.r,DH.PLAT.cliffX),z0:K.c[1]-K.r/1.3,z1:K.c[1]+K.r/1.3,floor:/apron's floor/});
 return A;};
DHN.build=function(){const t0=Date.now(),N=[],E=[],byId={},add=n=>{byId[n.id]=n;N.push(n);return n;},link=(a,b,kind,zone,w)=>{E.push({id:E.length,a:a.id,b:b.id,kind,zone,w:w||2,len:Math.hypot(b.x-a.x,b.z-a.z)});};
 /* the layout's ways (each node set on the floor built under it: a building's plinth stands a hand over the layout's height) */
 for(const n of DH.NODES){const f=KWALK.floorBelow(n.x,n.z,n.y+.6,1.2);add({id:n.id,x:n.x,y:f&&Math.abs(f[0]-n.y)<.6?f[0]:n.y,z:n.z,tag:'way',area:null});}
 /* a way the scene built to its own shape (DH_REAL: the cliff's switchbacks) is its points, each a node */
 const REAL=typeof DH_REAL!=='undefined'?DH_REAL:{},realIds=[];
 for(const k in REAL)REAL[k].pts.forEach((p,i)=>{const id=k+':'+i;realIds.push(id);add({id,x:p[0],y:p[1],z:p[2],tag:'way',area:null});});
 /* the grids */
 const G={};
 for(const A of DHN.areas()){const ids={},c=A.cell,ni=Math.floor((A.x1-A.x0)/c),nj=Math.floor((A.z1-A.z0)/c);A.n=0;
  for(let j=0;j<=nj;j++)for(let i=0;i<=ni;i++){const x=A.x0+i*c,z=A.z0+j*c,y0=A.y==null?DH.groundY(x,z):A.y,f=KWALK.floorBelow(x,z,y0+.5,1.2);
   if(!f||!A.floor.test(f[1].name||'')||KWALK.blocked(x,f[0],z,.4,DHN.H))continue;ids[i+','+j]=add({id:A.id+':'+i+','+j,x,y:f[0],z,tag:'floor',area:A.id});A.n++;}
  for(const k in ids){const [i,j]=k.split(',').map(Number),a=ids[k];
   for(const [di,dj] of [[1,0],[0,1],[1,1],[1,-1]]){const b=ids[(i+di)+','+(j+dj)];if(b&&DHN.segOk(a,b).ok&&DHN.segOk(b,a).ok)link(a,b,'floor',A.zone,c);}}
  G[A.id]={A,ids};}
 /* the layout's nodes onto the grid under them: the three nearest a walker reaches, both ways */
 const near=(p,R,dy,f)=>N.filter(q=>q!==p&&(!f||f(q))&&Math.abs(q.y-p.y)<dy&&Math.hypot(q.x-p.x,q.z-p.z)<R).sort((u,v)=>Math.hypot(u.x-p.x,u.z-p.z)-Math.hypot(v.x-p.x,v.z-p.z));
 const onGrid=new Set();
 for(const id of DH.NODES.map(n=>n.id).concat(realIds)){const p=byId[id];let k=0;for(const q of near(p,9,.9,q=>q.tag==='floor')){if(DHN.segOk(p,q).ok&&DHN.segOk(q,p).ok){link(p,q,'floor',G[q.area].A.zone,2);onGrid.add(id);if(++k>=3)break;}}}
 /* the layout's edges. A street or a square's lane between two nodes on one open floor is a line on a plan, not a way built
    (nothing is carved or registered for it): the floor's grid carries it, round what stands in the way (a gate's posts) */
 let realized=0;
 /* an end on the grid, or a node in a building on an open floor (a street ends at its place's middle; its door joins the grid) */
 const onFloor=id=>onGrid.has(id)||N.some(q=>q.tag==='floor'&&Math.abs(q.y-byId[id].y)<1.2&&Math.hypot(q.x-byId[id].x,q.z-byId[id].z)<12);
 const way=(a,b,kind,zone,w,len)=>{if((kind==='street'||kind==='square')&&onFloor(a)&&onFloor(b)){realized++;return;}
  E.push({id:E.length,a,b,kind,zone,w,len:len!=null?len:Math.hypot(byId[b].x-byId[a].x,byId[b].z-byId[a].z),layout:true});};
 for(const e of DH.EDGES){const k=e.a+'-'+e.b,R=REAL[k],zone=e.zone||'inner',w=e.w||2;
  if(R){const ids=[e.a].concat(R.pts.map((p,i)=>k+':'+i)).concat(R.end===false?[]:[e.b]);for(let i=1;i<ids.length;i++)way(ids[i-1],ids[i],R.kinds[i-1]||e.kind,zone,w);continue;}
  way(e.a,e.b,e.kind,zone,w,DH.len?DH.len(e):null);}
 /* the doors: a node a metre out from each front (or 1.5, 2: out of the door's own frame), linked to the two nearest
    nodes a walker reaches both ways (the grid's, the layout's, within 40 m along a carved way) */
 const doors=[];
 /* a node's zone: the most open of its edges' (a door off an outer way is outer) */
 const zoneOf=id=>{let z='secret';for(const e of E){if(e.a!==id&&e.b!==id)continue;if(e.zone==='outer')return 'outer';if(e.zone==='inner')z='inner';}return z;};
 for(const r of REG){if(r.parent||!r.front||!r.front.world)continue;const F=r.front.world,ox=Math.sin(F.yaw),oz=Math.cos(F.yaw);let D=null;
  /* out before the front, else behind or beside it (a kiva's hatch is reached from the side its ladder stands on) */
  for(const [out,turn] of [[1,0],[1.5,0],[2,0],[3,0],[3,PI],[3,PI/2],[3,-PI/2],[4.5,PI],[4.5,PI/2],[4.5,-PI/2]]){const c=Math.cos(turn),s=Math.sin(turn),x=F.x+(ox*c+oz*s)*out,z=F.z+(oz*c-ox*s)*out,f=KWALK.floorBelow(x,z,F.y+.6,1.2);if(f&&f[0]>F.y-1.2&&!KWALK.blocked(x,f[0],z,DHN.R,DHN.H)){D={x,y:f[0],z};break;}}   /* not a floor under it (a kiva's own, under its hatch) */
  if(DHN.NOPLACE[r.key])continue;const d={rec:r,key:r.key,tid:r.tid,node:null};doors.push(d);
  /* no floor before it (a tower on the cone's top, at the head of its cliff stair): the layout's node there is its door */
  if(!D){const deg={};E.forEach(e=>{deg[e.a]=1;deg[e.b]=1;});const L=N.filter(q=>q.tag==='way'&&deg[q.id]&&Math.hypot(q.x-F.x,q.z-F.z)<6&&Math.abs(q.y-F.y)<1.5).sort((u,v)=>Math.hypot(u.x-F.x,u.z-F.z)-Math.hypot(v.x-F.x,v.z-F.z))[0];if(L)d.node=L.id;continue;}
  const n=add({id:'door:'+r.tid,x:D.x,y:D.y,z:D.z,tag:'door',area:null,site:r.key});d.node=n.id;let k=0;
  for(const q of near(n,40,1.2,q=>q.tag!=='door')){if(DHN.segOk(n,q).ok&&DHN.segOk(q,n).ok){link(n,q,'door',q.area?G[q.area].A.zone:zoneOf(q.id),2);if(++k>=2)break;}}}
 DHN.built={nodes:N,edges:E,byId,doors,grids:G,realized,ms:Math.round(Date.now()-t0)};return DHN.built;};
DHN.get=function(){return DHN.built||DHN.build();};
/* the node for a point, with its height: the floor under it, then the nearest node on that floor's level a walker can
   reach from it in a straight line (else the nearest on the level) */
DHN.nearest=function(x,y,z,o){const B=DHN.get(),f=KWALK.floorBelow(x,z,y+.5,1.2),fy=f?f[0]:y,P={x,y:fy,z};
 /* on a carved way (a long tube has nodes only at its ends): the way passing under the point at its floor's height */
 let best=null,bd=1e9;for(const e of B.edges){if(!e.layout)continue;const a=B.byId[e.a],b=B.byId[e.b],dx=b.x-a.x,dz=b.z-a.z,L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/L2));
  const d=Math.hypot(a.x+dx*t-x,a.z+dz*t-z),ey=a.y+(b.y-a.y)*t;if(d<Math.max(1.5,e.w/2+.5)&&Math.abs(ey-fy)<1&&d<bd){bd=d;best=t<.5?a:b;}}
 if(best)return best;
 const C=B.nodes.filter(n=>Math.abs(n.y-fy)<1.5&&Math.abs(n.x-x)<60&&Math.abs(n.z-z)<60).sort((u,v)=>Math.hypot(u.x-x,u.z-z)-Math.hypot(v.x-x,v.z-z));
 for(let i=0;i<Math.min(6,C.length);i++)if(DHN.segOk(P,C[i]).ok)return C[i];return C[0]||null;};
/* ---------------------------------------------------------------- the checks (PLAN.md 8.3, 1 to 4), data only: the probe runs them */
/* 1: every node stands on a walk floor (within 0.1 m) */
DHN.chkNodes=function(B,W){W=W||KWALK;const bad=[];for(const n of B.nodes){const f=W.floorBelow(n.x,n.z,n.y+.1,.2);if(!f||Math.abs(f[0]-n.y)>.1)bad.push(n.id+(f?' '+(f[0]-n.y).toFixed(2)+' m':' no floor'));}return bad;};
/* 2: every edge walkable both ways, with headroom on the carved ways and the door links */
DHN.chkEdges=function(B,o){o=o||{};const bad=[];for(const e of B.edges){const a=B.byId[e.a],b=B.byId[e.b],head=e.layout||e.kind==='door',r1=DHN.segOk(a,b,Object.assign({head},o)),r2=r1.ok?DHN.segOk(b,a,Object.assign({head},o)):r1;
  if(!r1.ok||!r2.ok){const r=r1.ok?r2:r1;bad.push({e,why:r.why,at:r.at});}}return bad;};
/* 3: every door reachable from the outpost's gate, the secret ways apart (the scouts' own) */
DHN.reach=function(B,from,ok){const adj={};for(const e of B.edges){if(ok&&!ok(e))continue;(adj[e.a]||(adj[e.a]=[])).push(e.b);(adj[e.b]||(adj[e.b]=[])).push(e.a);}
 const seen=new Set([from]),q=[from];while(q.length){const u=q.pop();for(const v of adj[u]||[])if(!seen.has(v)){seen.add(v);q.push(v);}}return seen;};
DHN.chkReach=function(B,ok){const S=DHN.reach(B,'o.gate',ok||(e=>e.zone!=='secret'));return B.doors.filter(d=>!d.node||!S.has(d.node)).map(d=>d.key+(d.node?'':' (no door node)'));};
/* 4: stacked lookups: where two ways cross in plan more than 2.5 m apart in height, a point on each finds its own */
DHN.crossings=function(B){const L=B.edges.filter(e=>e.layout),out=[];
 for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=B.byId[L[i].a],b=B.byId[L[i].b],c=B.byId[L[j].a],d=B.byId[L[j].b];
  const r=(b.x-a.x)*(d.z-c.z)-(b.z-a.z)*(d.x-c.x);if(Math.abs(r)<1e-9)continue;const t=((c.x-a.x)*(d.z-c.z)-(c.z-a.z)*(d.x-c.x))/r,u=((c.x-a.x)*(b.z-a.z)-(c.z-a.z)*(b.x-a.x))/r;
  if(t<.15||t>.85||u<.15||u>.85)continue;const y1=a.y+(b.y-a.y)*t,y2=c.y+(d.y-c.y)*u;if(Math.abs(y1-y2)<2.5)continue;
  out.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,ways:[[L[i],y1],[L[j],y2]]});}return out;};
DHN.chkStacked=function(B,swap){const X=DHN.crossings(B),bad=[];
 for(const c of X)c.ways.forEach(([e,y],k)=>{const qy=swap?c.ways[1-k][1]:y,n=DHN.nearest(c.x,qy,c.z);if(!n||(n.id!==e.a&&n.id!==e.b&&Math.abs(n.y-y)>1.5))bad.push(e.a+'-'+e.b+' at y '+y.toFixed(1)+' found '+(n?n.id+' (y '+n.y.toFixed(1)+')':'nothing'));});
 return {n:X.length,bad};};
