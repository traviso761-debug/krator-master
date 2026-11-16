/* ================================================================= THEODIGA TODAY: the walk graph (records; draws nothing)
   [G data] T-sim-2 (the owner, 2026-11-16: "Yes, make them walk"). core/simulation's 'pedestrian' layer for Theodiga (SCHEMA.md
   "Navigation layers": {nodes:[{id,x,y,z,tag}], edges:[{id,a,b,kind,len,w}]}), built from what the page draws, in the dam frame
   (the host adds the group's offset):
     the town     core/city's streets resampled every 6 m on the town's ground, joined where they meet (a street's end within
                  6 m of another's node is joined to it); Gate Square a grid of 6 m
     the ways     the Stair of Descent, the Salvage Road and the Silt Road, node by node down their legs (TH_DESCENT's segs),
                  their heads joined to the town, their feet to the crest's kora, the yards and the fields
     the works    the yard track and the spur into the bore (on the floor, then the bore's deck); the silt fields joined to one
                  another and to the Silt Road's foot by their nearest neighbours (a tree over them); the upland fields to the
                  nearest street
     the crest    the middle kora, a node every 6 m from the Pilgrims' Gate to x -100 on the promenade's middle at 400 m
     the Dome     the two Pilgrims' Stairs flight by flight (TH_DOME_TODAY), and the deck a grid of 8 m inside the drum, clear
                  of its pavilions, the stair wells, the hall and the torn sector (o.deckOpen)
     the arcology a node at every storey of every unit (its middle), a stair from each to the next, its storey nearest the
                  crest's 400 m joined to the kora (the crest's blocks open on it; the gallery's shafts and the fin heads'
                  bridges reach it)
   Every node is KRAND-free: the graph is a function of the geometry alone.
   TH_WALK.graph(o) -> {nodes, edges, near(x, y, z, tag?) -> node, join(id, x, y, z, tag?) -> door node id}
     o.ways, o.ground(x, z), o.square {x0,x1,z0,z1}; o.descent {stair, salvage, silt: {segs}}; o.works {track, bore}, o.floor;
     o.fields [{id, corners, y, upland}]; o.kora {x0, x1, zc, y, z}; o.stairs (TH_DOME_TODAY.stairs); o.deck {cx, cz, r, y, hall,
     open(x, z)}; o.arc (TH_ARC_PROGRAM, with TH_ARC.outline) */
var TH_WALK=(function(){
 const R2=v=>Math.round(v*100)/100;
 function graph(o){const nodes=[],edges=[],byId={},grid=new Map(),C=6;
  const key=(x,z)=>Math.floor(x/C)+','+Math.floor(z/C);
  const node=(id,x,y,z,tag)=>{if(byId[id])return byId[id];const n={id,x:R2(x),y:R2(y),z:R2(z),tag};nodes.push(n);byId[id]=n;const k=key(x,z);(grid.get(k)||grid.set(k,[]).get(k)).push(n);return n;};
  const edge=(a,b,kind,w)=>{if(a===b)return;const A=byId[a],B=byId[b];edges.push({id:'e'+edges.length,a,b,kind:kind||'floor',len:R2(Math.hypot(A.x-B.x,A.y-B.y,A.z-B.z)),w:w==null?1:w});};
  /* the nearest node (by ground distance and 4x the height), of a tag when one is asked, within r */
  const near=(x,y,z,tag,r)=>{let best=null,bd=1e9;const R=Math.ceil((r||60)/C),i0=Math.floor(x/C),j0=Math.floor(z/C);
   for(let di=-R;di<=R;di++)for(let dj=-R;dj<=R;dj++){const L=grid.get((i0+di)+','+(j0+dj));if(!L)continue;
    for(const n of L){if(tag&&(Array.isArray(tag)?tag.indexOf(n.tag)<0:n.tag!==tag))continue;const d=Math.hypot(n.x-x,n.z-z)+(y==null?0:Math.abs(n.y-y)*4);if(d<bd){bd=d;best=n;}}}
   return best;};
  /* a chain of points as nodes every s metres, joined in order; returns the nodes */
  const chain=(pfx,pts,s,tag,yOf,kind)=>{const out=[];let n=0;
   for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[2]-a[2]),k=Math.max(1,Math.round(L/s));
    for(let j=i?1:0;j<=k;j++){const t=j/k,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,y=yOf?yOf(x,z):a[1]+(b[1]-a[1])*t;
     const N=node(pfx+'.'+(n++),x,y,z,tag);if(out.length)edge(out[out.length-1].id,N.id,kind);out.push(N);}}
   return out;};
  // ---- the town's streets and Gate Square --------------------------------------------------------------------------------------
  const ends=[];
  for(const w of o.ways||[]){if(!w.pts||w.pts.length<2)continue;const P=w.pts.map(p=>[p[0],0,p[1]]);
   /* a node where two streets share a point is one node: snap each point to a node already within 1.5 m */
   const ch=chain('w.'+w.id,P,C,'street',o.ground);
   ends.push(ch[0],ch[ch.length-1]);}
  /* streets that meet: a street's end joined to the nearest node of another street within 6 m */
  for(const e of ends){let best=null,bd=6;for(const n of nodes){if(n.tag!=='street'||n.id.split('.').slice(0,-1).join('.')===e.id.split('.').slice(0,-1).join('.'))continue;const d=Math.hypot(n.x-e.x,n.z-e.z);if(d<bd){bd=d;best=n;}}
   if(best)edge(e.id,best.id,'floor');}
  if(o.square){const Q=o.square,I=Math.floor((Q.x1-Q.x0-2)/C),J=Math.floor((Q.z1-Q.z0-2)/C),id=(i,j)=>'sq.'+i+'.'+j;
   for(let i=0;i<=I;i++)for(let j=0;j<=J;j++){const x=Q.x0+1+i*C,z=Q.z0+1+j*C;node(id(i,j),x,o.ground(x,z),z,'square');}
   for(let i=0;i<=I;i++)for(let j=0;j<=J;j++){if(i<I)edge(id(i,j),id(i+1,j));if(j<J)edge(id(i,j),id(i,j+1));}
   /* the square's edge joined to the streets that reach it */
   for(const n of nodes.filter(q=>q.tag==='square')){const s=near(n.x,null,n.z,'street',8);if(s&&Math.hypot(s.x-n.x,s.z-n.z)<7)edge(n.id,s.id);}}
  // ---- the ways down the wall --------------------------------------------------------------------------------------------------
  const wayNodes={};
  for(const k of ['stair','salvage','silt']){const D=o.descent&&o.descent[k];if(!D||!D.segs||!D.segs.length)continue;
   const P=[];D.segs.forEach((s,i)=>{if(!i)P.push(s.a);P.push(s.b);});
   wayNodes[k]=chain('way.'+k,P,4,'way',null,k==='stair'?'stair':'floor');}
  /* the heads to the town: the nearest street or square node */
  for(const k in wayNodes){const h=wayNodes[k][0],s=near(h.x,h.y,h.z,['street','square'],400);if(s)edge(h.id,s.id,'landing');}
  // ---- the crest's kora -------------------------------------------------------------------------------------------------------
  let kora=[];
  if(o.kora){const K=o.kora,P=[];for(let x=K.x1;x>=K.x0-1e-6;x-=C)P.push([x,K.y,K.zc(x)+K.z]);kora=chain('kora',P,C,'kora',()=>K.y);}
  if(wayNodes.stair&&kora.length){const b=wayNodes.stair[wayNodes.stair.length-1],k=near(b.x,b.y,b.z,'kora',60);if(k)edge(b.id,k.id,'landing');}
  // ---- the works: the yard track and the spur, the fields -----------------------------------------------------------------------
  if(o.works&&o.works.track){const T=o.works.track,tr=chain('yard',[[T.a[0],0,T.a[1]],[T.b[0],0,T.b[1]]],8,'works',o.floor);
   if(wayNodes.salvage){const f=wayNodes.salvage[wayNodes.salvage.length-1];edge(f.id,tr[0].id);}
   const B=o.works.bore;if(B){const S=B.spur.pts,sp=chain('spur',S.map(p=>[p[0],0,p[1]]),8,'works',(x,z)=>x>=B.x-1.2?.15:o.floor(x,z));edge(tr[0].id,sp[0].id);}}
  const fields=(o.fields||[]).map(F=>{const c=F.corners,x=(c[0][0]+c[2][0])/2,z=(c[0][1]+c[2][1])/2;return node('field.'+F.id,x,F.y,z,F.upland?'upland':'field');});
  /* the silt fields: a tree by nearest neighbours from the Silt Road's foot (Prim's); the upland fields to the nearest street */
  {const S=fields.filter(n=>n.tag==='field'),foot=wayNodes.silt?wayNodes.silt[wayNodes.silt.length-1]:null;
   if(S.length&&foot){const inT=new Set([foot.id]),T=[foot],left=S.slice();
    while(left.length){let bi=-1,bj=null,bd=1e9;left.forEach((n,i)=>{for(const t of T){const d=Math.hypot(n.x-t.x,n.z-t.z);if(d<bd){bd=d;bi=i;bj=t;}}});
     const n=left.splice(bi,1)[0];edge(n.id,bj.id,'field');T.push(n);inT.add(n.id);}}}
  for(const n of fields.filter(q=>q.tag==='upland')){const s=near(n.x,null,n.z,['street','square'],200);if(s)edge(n.id,s.id,'field');}
  // ---- the Dome: the Pilgrims' Stairs and the deck ----------------------------------------------------------------------------
  let deck=[];
  if(o.deck){const D=o.deck,G=8,id=(i,j)=>'deck.'+i+'.'+j,R=Math.ceil(D.r/G);
   for(let i=-R;i<=R;i++)for(let j=-R;j<=R;j++){const x=D.cx+i*G,z=D.cz+j*G,r=Math.hypot(x-D.cx,z-D.cz);if(r>D.r-4||r<D.hall+2||(D.open&&D.open(x,z)))continue;deck.push(node(id(i,j),x,D.y,z,'deck'));}
   for(let i=-R;i<=R;i++)for(let j=-R;j<=R;j++){if(!byId[id(i,j)])continue;if(byId[id(i+1,j)])edge(id(i,j),id(i+1,j));if(byId[id(i,j+1)])edge(id(i,j),id(i,j+1));}}
  for(const s of o.stairs||[]){const P=[];s.flights.forEach((f,i)=>{P.push(f.a);P.push(f.b);});
   const ch=chain('pstair.'+s.id,P,2,'stair',null,'stair'),b=ch[0],t=ch[ch.length-1];
   const k=near(b.x,b.y,b.z,'kora',40);if(k)edge(b.id,k.id,'landing');const d=near(t.x,t.y,t.z,'deck',30);if(d)edge(t.id,d.id,'landing');}
  // ---- the arcology: a node a storey of every unit, stairs between, the 400 m storey to the kora -------------------------------
  for(const u of o.arc||[]){if(u.area==='dome')continue;const O=o.outline?o.outline(u):null;let cx,cz;
   if(O){cx=O.reduce((s,p)=>s+p[0],0)/O.length;cz=O.reduce((s,p)=>s+p[1],0)/O.length;}else continue;
   let prev=null,best=null,bd=1e9;
   for(let i=0;i<u.n;i++){const y=u.y0+i*u.h,N=node('arc.'+u.id+'.'+i,cx,y,cz,'arc');if(prev)edge(prev.id,N.id,'stair',1.3);prev=N;const d=Math.abs(y-(o.kora?o.kora.y:400));if(d<bd){bd=d;best=N;}}
   if(best&&kora.length){const k=near(best.x,null,best.z,'kora',400);if(k)edge(best.id,k.id,u.area==='crest'?'door':'bridge');}}
  /* THE STITCH: any part left apart (a square no street quite reaches, a patch of deck between pavilions, a field far from the
     streets) is joined to the largest part at their nearest pair (height counted four times, so a deck patch never joins the
     kora below it), largest strays first; a part whose nearest pair is over 120 m away stays apart (the checks report it) */
  for(let pass=0;pass<40;pass++){const P=parts({nodes,edges});if(P.length<2)break;const main=new Set(P[0]),M=nodes.filter(n=>main.has(n.id));let joined=false;
   for(const part of P.slice(1)){let best=null,bd=120;
    for(const id of part){const a=byId[id];
     /* the nearest node of the main part: search its grid (near() may return one of this part) */
     let bb=null,bdd=1e9;const R=Math.ceil(120/C),i0=Math.floor(a.x/C),j0=Math.floor(a.z/C);
     for(let di=-R;di<=R;di++)for(let dj=-R;dj<=R;dj++){const L=grid.get((i0+di)+','+(j0+dj));if(!L)continue;for(const n of L){if(!main.has(n.id))continue;const d=Math.hypot(n.x-a.x,n.z-a.z)+Math.abs(n.y-a.y)*4;if(d<bdd){bdd=d;bb=n;}}}
     if(bb&&bdd<bd){bd=bdd;best=[a,bb];}}
    if(best){edge(best[0].id,best[1].id,'landing');joined=true;break;}}
   if(!joined)break;}
  /* a door: a node at the place's door, joined to the nearest node of the tags it may use (within r; else the nearest at all) */
  const join=(id,x,y,z,tag,r)=>{const n=near(x,y,z,tag,r||60)||near(x,y,z,null,400);const d=node('door.'+id,x,n?n.y:y,z,'door');if(n)edge(d.id,n.id,'door');return d.id;};
  return {nodes,edges,byId,near,join};}
 /* the parts of a graph (union-find), for the checks: [[node ids], ...] largest first */
 function parts(G){const p={};G.nodes.forEach(n=>{p[n.id]=n.id;});const f=x=>p[x]===x?x:(p[x]=f(p[x]));for(const e of G.edges){const a=f(e.a),b=f(e.b);if(a!==b)p[a]=b;}
  const by={};for(const n of G.nodes){const r=f(n.id);(by[r]||(by[r]=[])).push(n.id);}return Object.values(by).sort((a,b)=>b.length-a.length);}
 return {graph,parts};
})();
