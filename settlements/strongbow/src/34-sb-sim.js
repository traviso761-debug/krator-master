// ================================================================= STRONGBOW TODAY — life: the world as data for core/simulation (SB4a)
// [G data] PLAN.md section 9, step 6 (SB4). core/simulation (SIM) is the vocabulary; this is Strongbow's declaration into it, in
// SCHEMA.md's order. This fragment holds the NAVIGATION LAYER, built from the records the interiors and the walk up already are:
//   SB_SIM.nav({R, S, P, L, path, town, placed}) -> {nodes:[{id,x,y,z,tag}], edges:[{id,a,b,kind,len,w}], room:{roomId: nodeId},
//                                                    door:{doorId: nodeId}, front:{lotId: nodeId}}
//   R: SB_ROOMS.plan; S: SB_WALK.plan; path: SB_WALK.run(...).path (the walk up walked, [x, z, y] a step, with its events);
//   town: SB_TOWN.make; placed: SB_ROOMS.town(...).placed (each building's stoops, the foot of its way in)
// What becomes a node:
//   - every room (its polygon's centre); a drum's core hall also as a ring of six about it, open to the corridor ring;
//   - a corridor ring as 24 nodes round its middle; a bar's corridor as nodes 6 m apart along its length;
//   - a plate room's door (kits/ancients-interiors: {at, to}) between the room and the nearest node of the room it opens on;
//   - every other door (a layout way's, a terrace's outer doors, a neck's, the tower's bar doors, the shaft's): joined to the nearest
//     node on each side of its wall (the nearest, then the nearest behind the door from it);
//   - every stair's two ends, the stair an edge between them; each end joined to the nearest node at its height, and to a stair end
//     it meets (a flight's landing, the ramp's segments, the great stair's treads);
//   - a box's or the tower's stair hall as three nodes across it, a box's bars' end rooms joined to it (open to it);
//   - a terrace's promenade as a ring of 36 nodes, its neck plate as a ring inside the neck's wall and one outside it (open to
//     the ring building's corridor); the lobby's galleries and floor as rings; the Nock's deck and the crown's on a 12 m grid;
//   - the walk up, every 4 m of it, a lift's ride an edge of kind 'lift' (its cost the ride and a wait);
//   - the town's streets every 8 m (ends within 3 m merged: the junctions), each building's way in (its stoop's foot, or its front
//     door's step) joined to the nearest street node.
// Nearness is in plan with storeys apart: a node is joined only to one within 1 m of its height. No rule lives here but the joins.
var SB_SIM=(function(){
 const TAU=Math.PI*2,hyp=Math.hypot;
 function nav(o){const R=o.R,S=o.S,P=o.P,L=o.L;
  const nodes=[],edges=[],byId=new Map(),G=new Map(),CELL=8;
  const key=(x,z)=>Math.floor(x/CELL)+','+Math.floor(z/CELL);
  const node=(id,x,y,z,tag)=>{if(byId.has(id))return byId.get(id);const n={id,x,y,z,tag:tag||''};nodes.push(n);byId.set(id,n);
   const k=key(x,z);(G.get(k)||G.set(k,[]).get(k)).push(n);return n;};
  const seen=new Set(),nodeP=(part,id,x,y,z,tag)=>{const n=node(id,x,y,z,tag);n.part=part;return n;};
  const edge=(a,b,kind,w)=>{if(!a||!b||a===b)return;const k=a.id<b.id?a.id+'|'+b.id:b.id+'|'+a.id;if(seen.has(k))return;seen.add(k);
   edges.push({id:'e'+edges.length,a:a.id,b:b.id,kind:kind||'walk',len:hyp(a.x-b.x,a.y-b.y,a.z-b.z),w:w==null?1.2:w});};
  /* the nodes within r of (x, z) at a height within dy, nearest first; f filters */
  const near=(x,y,z,r,dy,f)=>{const out=[],i0=Math.floor((x-r)/CELL),i1=Math.floor((x+r)/CELL),j0=Math.floor((z-r)/CELL),j1=Math.floor((z+r)/CELL);
   for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const a=G.get(i+','+j);if(!a)continue;for(const n of a){if(Math.abs(n.y-y)>dy)continue;const d=hyp(n.x-x,n.z-z);if(d<=r&&(!f||f(n)))out.push([d,n]);}}
   out.sort((p,q)=>p[0]-q[0]||(p[1].id<q[1].id?-1:1));return out.map(p=>p[1]);};
  const ctr=P2=>{let x=0,z=0;for(const q of P2){x+=q[0];z+=q[1];}return [x/P2.length,z/P2.length];};
  const O={room:{},door:{},front:{},nodes,edges};
  const isCorr=rm=>rm.kind==='corridor';
  // ---- rooms, corridors, cores, halls --------------------------------------------------------------------------------------
  const roomsById=new Map();for(const rm of R.rooms)roomsById.set(rm.id,rm);
  const corrNodes=new Map();   /* corridor room id -> its nodes */
  for(const rm of R.rooms){
   if(rm.ring&&isCorr(rm)){const r0=typeof rm.ring.r0==='function'?rm.ring.r0(0):rm.ring.r0,r1=typeof rm.ring.r1==='function'?rm.ring.r1(0):rm.ring.r1,rr=(r0+r1)/2,ns=[];
    for(let k=0;k<24;k++){const a=k/24*TAU;ns.push(nodeP(rm.part,'c:'+rm.id+':'+k,rm.ring.cx+rr*Math.cos(a),rm.y,rm.ring.cz+rr*Math.sin(a),'corridor'));}
    for(let k=0;k<24;k++)edge(ns[k],ns[(k+1)%24],'walk',2.4);corrNodes.set(rm.id,ns);continue;}
   if(!rm.poly)continue;
   if(isCorr(rm)){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const q of rm.poly){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);}
    const alongX=x1-x0>=z1-z0,len=alongX?x1-x0:z1-z0,n=Math.max(2,Math.ceil(len/6)+1),ns=[];
    for(let k=0;k<n;k++){const f=k/(n-1);ns.push(nodeP(rm.part,'c:'+rm.id+':'+k,alongX?x0+.5+(len-1)*f:(x0+x1)/2,rm.y,alongX?(z0+z1)/2:z0+.5+(len-1)*f,'corridor'));}
    for(let k=1;k<n;k++)edge(ns[k-1],ns[k],'walk',2.2);corrNodes.set(rm.id,ns);continue;}
   const c=ctr(rm.poly),nd=node('r:'+rm.id,c[0],rm.y,c[1],rm.kind||'room');nd.part=rm.part;O.room[rm.id]=nd.id;}
  /* a drum's core hall: open to its corridor ring (no wall between); a ring of six nodes at half its radius */
  for(const rm of R.rooms){if(!/\.core$/.test(rm.id)||!rm.poly)continue;const c=ctr(rm.poly);let r=0;for(const q of rm.poly)r=Math.max(r,hyp(q[0]-c[0],q[1]-c[1]));
   const mid=byId.get('r:'+rm.id),ring=[];for(let k=0;k<6;k++){const a=k/6*TAU;ring.push(node('k:'+rm.id+':'+k,c[0]+r*.55*Math.cos(a),rm.y,c[1]+r*.55*Math.sin(a),'hall'));}
   for(let k=0;k<6;k++){edge(mid,ring[k],'walk',4);edge(ring[k],ring[(k+1)%6],'walk',4);}
   const corr=R.rooms.find(q=>q.ring&&isCorr(q)&&q.part===rm.part&&q.level===rm.level);
   if(corr){const cn=corrNodes.get(corr.id);for(const k of ring){const best=cn.slice().sort((p,q)=>hyp(p.x-k.x,p.z-k.z)-hyp(q.x-k.x,q.z-k.z)).slice(0,2);for(const b of best)edge(k,b,'walk',3);}}}
  /* a plate room's doors: the room, its door, the room or corridor it opens on */
  for(const rm of R.rooms){if(!rm.doors||!rm.poly||isCorr(rm))continue;const rn=byId.get('r:'+rm.id);if(!rn)continue;
   rm.doors.forEach((d,i)=>{if(!d.at)return;const dn=node('d:'+rm.id+':'+i,d.at[0],rm.y,d.at[1],'door');edge(rn,dn,'walk',d.w||1);
    const to=d.to&&(corrNodes.get(d.to)||(byId.get('r:'+d.to)?[byId.get('r:'+d.to)]:null));
    if(to){const b=to.slice().sort((p,q)=>hyp(p.x-dn.x,p.z-dn.z)-hyp(q.x-dn.x,q.z-dn.z))[0];edge(dn,b,'walk',d.w||1);}});}
  /* the stair halls (a box's, the tower's): three nodes across; a box's bars' end rooms are open to it */
  for(const rm of R.rooms){if(!/\.hall$/.test(rm.id)||/\.core$/.test(rm.id))continue;const f=R.floors.find(q=>q.id===rm.id);if(!f)continue;
   const P2=f.poly?f.poly.map(q=>[q[0],q[1]]):f.rect?[[f.rect[0],f.rect[2]],[f.rect[1],f.rect[2]],[f.rect[1],f.rect[3]],[f.rect[0],f.rect[3]]]:null;if(!P2)continue;
   let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const q of P2){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);}
   const alongX=x1-x0>=z1-z0,mid=byId.get('r:'+rm.id)||nodeP(rm.part,'r:'+rm.id,(x0+x1)/2,rm.y,(z0+z1)/2,'hall'),ns=[mid];O.room[rm.id]=mid.id;
   for(const f2 of [.15,.85])ns.push(nodeP(rm.part,'h:'+rm.id+':'+f2,alongX?lerp(x0,x1,f2):(x0+x1)/2,rm.y,alongX?(z0+z1)/2:lerp(z0,z1,f2),'hall'));
   edge(ns[1],mid,'walk',4);edge(mid,ns[2],'walk',4);
   if(rm.part==='sb.tower.order')continue;   /* the tower's hall is walled from its bars: its doors join them */
   const sid=rm.id.replace(/\.hall$/,'');
   for(const q of R.rooms){if(!/\.end\d$/.test(q.id)||q.id.indexOf(sid+'.')!==0)continue;const en=byId.get('r:'+q.id);if(!en)continue;
    const b=ns.slice().sort((p,r2)=>hyp(p.x-en.x,p.z-en.z)-hyp(r2.x-en.x,r2.z-en.z))[0];if(hyp(b.x-en.x,b.z-en.z)<40)edge(en,b,'walk',3);}}
  function lerp(a,b,f){return a+(b-a)*f;}
  // ---- the open floors: the terraces' decks and neck plates, the lobby, the Nock's deck, the crown -----------------------------
  const SP=P.dim.SPINE,PT={};for(const p of L.parts)PT[p.id]=p;
  const ring=(id,cx,cz,r,y,n,tag)=>{const ns=[];for(let k=0;k<n;k++){const a=k/n*TAU;ns.push(node(id+':'+k,cx+r*Math.cos(a),y,cz+r*Math.sin(a),tag));}for(let k=0;k<n;k++)edge(ns[k],ns[(k+1)%n],'walk',3);return ns;};
  for(const n of [1,2,3,4,5,6]){const p=PT['sb.T'+n];if(!p||p.state==='gone')continue;const c=[p.shape[1],p.shape[2]],r=p.shape[3],y=p.y+1.6;
   ring('t:'+n+':deck',c[0],c[1],r-6,y,36,'deck');
   if(n!==1&&R.parts['sb.T'+n+'.neckdoor']){const nk=R.parts['sb.T'+n+'.neckdoor'],inside=ring('t:'+n+':neck',nk.nc[0],nk.nc[1],SP.neck*.55,y,8,'plate'),outside=ring('t:'+n+':plate',c[0],c[1],SP.r-3,y,16,'plate');
    /* the plate outside the neck's wall is open to the ring building's corridor */
    const corr=R.rooms.find(q=>q.ring&&isCorr(q)&&q.part==='sb.T'+n);if(corr){const cn=corrNodes.get(corr.id);for(const k of outside){const b=cn.slice().sort((p2,q)=>hyp(p2.x-k.x,p2.z-k.z)-hyp(q.x-k.x,q.z-k.z))[0];edge(k,b,'walk',3);}}
    void inside;}}
  {const LB=P.foot.lobby,c=[LB.at[0],LB.at[2]];for(const g of LB.galleries)ring('l:'+g.id,c[0],c[1],(g.r0+g.r1)/2,g.y,24,'gallery');
   ring('l:floor.in',c[0],c[1],(LB.stair.r0+LB.stair.r1)/2+4,LB.y0+.25,24,'lobby');ring('l:floor.out',c[0],c[1],(LB.galleries[0].r0+LB.galleries[0].r1)/2,LB.y0+.25,32,'lobby');}
  const grid=(id,inside,x0,x1,z0,z1,y,step,tag)=>{const ns=new Map();for(let x=x0+step/2;x<x1;x+=step)for(let z=z0+step/2;z<z1;z+=step){if(!inside(x,z))continue;const k=Math.round((x-x0)/step)+','+Math.round((z-z0)/step);ns.set(k,node(id+':'+k,x,y,z,tag));}
   for(const [k,n] of ns){const [i,j]=k.split(',').map(Number);for(const [di,dj] of [[1,0],[0,1]]){const m=ns.get((i+di)+','+(j+dj));if(m)edge(n,m,'walk',step);}}return [...ns.values()];};
  /* the caravan yard at the lip (the walk's; the gatehouse's apron and the post's door open on it) */
  if(S.yard){const r=S.yard.rect;grid('yard',()=>true,r[0]+1,r[1]-1,r[2]+1,r[3]-1,S.yard.y,8,'yard');}
  /* (a deck a stairwell cut is in pieces, id and id~k: its grid covers them all) */
  for(const rid of ['sb.room.nock.deck','sb.room.crown']){const fs=R.floors.filter(q=>q.id===rid||q.id.indexOf(rid+'~')===0);if(!fs.length)continue;const f=fs[0];
   const PS=fs.map(f2=>f2.poly?f2.poly.map(q=>[q[0],q[1]]):[[f2.rect[0],f2.rect[2]],[f2.rect[1],f2.rect[2]],[f2.rect[1],f2.rect[3]],[f2.rect[0],f2.rect[3]]]);
   const inOne=(P2,x,z)=>{let c=false;for(let i=0,j=P2.length-1;i<P2.length;j=i++){const a=P2[i],b=P2[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
   /* none under a building standing on the deck (the Nock's shed): its door joins its rooms to the deck */
   const onIt=L.parts.filter(p=>p.in&&rid==='sb.room.nock.deck'&&p.in==='sb.nock.c'&&p.shape[0]==='box'&&(p.h||0)>0).map(p=>p.shape),inP=(x,z)=>PS.some(P2=>inOne(P2,x,z))&&!onIt.some(q=>x>q[1]-1&&x<q[2]+1&&z>q[3]-1&&z<q[4]+1);
   let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const P2 of PS)for(const q of P2){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);}
   const gs=grid('g:'+rid,inP,x0,x1,z0,z1,f.y,12,'deck');const rn=byId.get('r:'+rid);if(rn&&gs.length){const b=gs.slice().sort((p2,q)=>hyp(p2.x-rn.x,p2.z-rn.z)-hyp(q.x-rn.x,q.z-rn.z))[0];edge(rn,b,'walk',4);}}
  // ---- the walk up: its path every 4 m, the lifts' rides as 'lift' edges -----------------------------------------------------
  const PATH=o.path||[],EV=o.events||[],rides=EV.filter(e=>e.lift!=null),inRide=i=>rides.some(e=>i>e.i0&&i<e.i1);
  {let last=null,acc=0;const keep=new Map();
   for(let i=0;i<PATH.length;i++){if(inRide(i))continue;const p=PATH[i];if(last){acc+=hyp(p[0]-last[0],p[1]-last[1],p[2]-last[2]);}
    const must=rides.some(e=>e.i0===i||e.i1===i||e.i0-1===i||e.i1+1===i)||EV.some(e=>e.door&&e.i===i)||i===0||i===PATH.length-1;
    if(must||acc>=4){keep.set(i,node('w:'+i,p[0],p[2],p[1],'walk'));acc=0;}last=p;}
   let prev=null;for(const [i,n] of [...keep.entries()].sort((a,b)=>a[0]-b[0])){if(prev&&!rides.some(e=>prev[0]<=e.i0&&i>=e.i1))edge(prev[1],n,'walk',1.4);prev=[i,n];}
   /* a ride: from the node where the car leaves to the one where it arrives (the nearest kept on each side) */
   for(const e of rides){const ks=[...keep.keys()],a=ks.filter(i=>i<=e.i0).pop(),b=ks.find(i=>i>=e.i1);if(a==null||b==null)continue;
    edges.push({id:'e'+edges.length,a:keep.get(a).id,b:keep.get(b).id,kind:'lift',len:hyp(keep.get(a).x-keep.get(b).x,keep.get(a).y-keep.get(b).y,keep.get(a).z-keep.get(b).z),w:2.5,lift:e.lift});}
   O.walk=[...keep.values()];}
  /* every lift's stops (the walk rides L2 through T2's), each a node a step out of its gate, a 'lift' edge stop to stop; a stop
     joined to what is round it (its gangway's far end: a deck, a ledge) */
  O.stops=[];
  for(const l of S.lifts){let prev=null;l.stops.forEach((st,k)=>{const g=st.gate.at,n=node('L:'+l.id+':'+k,g[0]+st.side[0]*1.2,st.y,g[1]+st.side[1]*1.2,'stop');O.stops.push(n);
    if(prev)edges.push({id:'e'+edges.length,a:prev.id,b:n.id,kind:'lift',len:Math.abs(n.y-prev.y),w:2.5,lift:l.id});prev=n;});}
  /* the foot's ground between its buildings: nodes 8 m apart out to the town's first ring, none in a building, the plaza's
     platform or the lobby; a join only where its middle is clear too */
  {const LB=P.foot.lobby,c=[LB.at[0],LB.at[2]],Z=P.foot.plaza,bx=L.parts.filter(p=>p.shape[0]==='box'&&p.y<3&&(p.h||0)>0).map(p=>p.shape);
   const clear=(x,z)=>!(hyp(x-c[0],z-c[1])<LB.r+2)&&!(x>Z.x0-1&&x<Z.x1+1&&z>Z.z0-1&&z<Z.z1+6)&&!bx.some(s=>x>s[1]-1&&x<s[2]+1&&z>s[3]-1&&z<s[4]+1);
   const R0=208,ns=new Map(),step=8;
   for(let x=c[0]-R0;x<=c[0]+R0;x+=step)for(let z=Math.max(-5,c[1]-R0);z<=c[1]+R0;z+=step){if(hyp(x-c[0],z-c[1])>R0||!clear(x,z))continue;
    const k=Math.round(x)+','+Math.round(z);ns.set(k,node('ground:'+k,x,o.ground?o.ground(x,z):0,z,'ground'));}
   for(const [k,n] of ns){const [x,z]=k.split(',').map(Number);for(const [dx,dz] of [[step,0],[0,step]]){const m=ns.get((x+dx)+','+(z+dz));if(m&&clear(x+dx/2,z+dz/2))edge(n,m,'walk',4);}}
   O.ground=[...ns.values()];}
  // ---- the stairs: an edge each, its ends joined to what they land on ------------------------------------------------------
  const stairEnds=[];
  for(const s of R.stairs){const a=node('s:'+s.id+':a',s.a[0],s.a[2],s.a[1],'stair'),b=node('s:'+s.id+':b',s.b[0],s.b[2],s.b[1],'stair');a.st=b.st=s;
   edges.push({id:'e'+edges.length,a:a.id,b:b.id,kind:s.apron||/ramp/.test(s.id)?'walk':'stair',len:hyp(a.x-b.x,a.y-b.y,a.z-b.z),w:s.w,locked:!!s.locked});seen.add(a.id<b.id?a.id+'|'+b.id:b.id+'|'+a.id);stairEnds.push(a,b);}
  // ---- the doors that are not a plate room's: the nearest node on each side of the wall --------------------------------------
  const partIds=Object.keys(R.parts).sort((a,b)=>b.length-a.length);
  const partsOf=d=>{if(d.way){const w=L.ways.find(q=>q.id===d.way);if(w)return new Set([w.a,w.b]);}const p=partIds.find(id=>d.id.indexOf(id+'.')===0||d.id.indexOf(id.slice(3)+'.')>=0);return p?new Set([p]):null;};
  const twoSides=(dn,r,ps)=>{const c=near(dn.x,dn.y,dn.z,r,1,n=>n!==dn&&n.tag!=='door'&&n.tag!=='stair'&&(!ps||!n.part||ps.has(n.part)));if(!c.length)return;const a=c[0];edge(dn,a,'walk',1);
   const ax=a.x-dn.x,az=a.z-dn.z;const b=near(dn.x,dn.y,dn.z,r+8,1,n=>n!==dn&&n.tag!=='door'&&n.tag!=='stair'&&(!ps||!n.part||ps.has(n.part))).find(n=>(n.x-dn.x)*ax+(n.z-dn.z)*az<0);if(b)edge(dn,b,'walk',1);};   /* the far side's nearest, a little further off (a door against the lobby's glass) */
  for(const d of R.doors){if(!d.at)continue;const dn=node('D:'+d.id,d.at[0],d.y,d.at[1],'door');O.door[d.id]=dn.id;if(d.locked)dn.locked=true;}
  // ---- the town: its streets, each building's way in --------------------------------------------------------------------------
  if(o.town){const T=o.town,snap=(x,y,z)=>{const c=near(x,y,z,3,2,n=>n.tag==='street');return c[0]||null;};
   T.ways.forEach((w,wi)=>{let prev=null;const pts=w.pts;let acc=0,last=null;
    for(let i=0;i<pts.length;i++){const p=pts[i];if(last)acc+=hyp(p[0]-last[0],p[1]-last[1]);last=p;if(i>0&&i<pts.length-1&&acc<8)continue;acc=0;
     const y=o.ground?o.ground(p[0],p[1]):0,n=snap(p[0],y,p[1])||node('t:'+wi+':'+i,p[0],y,p[1],'street');if(prev)edge(prev,n,'street',w.w||6);prev=n;}});
   /* a street that ends on another's side (a T-junction between two of its samples): its end joined to that street's nearest node */
   {const deg=new Map();for(const e of edges)if(e.kind==='street'){deg.set(e.a,(deg.get(e.a)||0)+1);deg.set(e.b,(deg.get(e.b)||0)+1);}
    for(const n of nodes){if(n.tag!=='street'||deg.get(n.id)!==1)continue;const own=new Set(edges.filter(e=>e.a===n.id||e.b===n.id).map(e=>e.a===n.id?e.b:e.a));
     const c=near(n.x,n.y,n.z,12,3,m=>m.tag==='street'&&m!==n&&!own.has(m.id));if(c[0])edge(n,c[0],'street',4);}}
   for(const q of (o.placed||[])){const st=q.steps&&q.steps[0];if(!st)continue;const f=node('f:'+q.id,st[0],st[1],st[2],'front');O.front[q.id]=f.id;
    const c=near(f.x,f.y,f.z,60,15,n=>n.tag==='street');if(c[0])edge(f,c[0],'street',3);}
   /* the town's streets and the foot's ground meet at the first ring */
   for(const g of (O.ground||[]))for(const m of near(g.x,g.y,g.z,9,4,n=>n.tag==='street').slice(0,1))edge(g,m,'walk',4);}
  // ---- the joins: stair ends, doors, the walk up to what they meet ------------------------------------------------------------
  /* a stair's end meets what it lands on (inside its stairwell: no wall between); an apron (out of a door) meets only the door it
     leaves by and the open floors, never a room through the wall it runs along */
  for(const s of stairEnds){const st=s.st,ok=n=>n!==s&&n.tag!=='stair'&&(st.apron?(n.tag==='door'?hyp(n.x-s.x,n.z-s.z)<2.5:!n.part):n.tag!=='door');
   let c=near(s.x,s.y,s.z,6,1,ok);if(!c.length)c=near(s.x,s.y,s.z,20,1,ok).slice(0,1);   /* an open plate or a yard: its nearest node, further off */
   for(const n of c.slice(0,2))edge(s,n,'walk',1.2);
   for(const t of near(s.x,s.y,s.z,2.2,1,n=>n!==s&&n.tag==='stair'))edge(s,t,'walk',1.2);}
  for(const d of R.doors){const dn=byId.get('D:'+d.id);if(dn)twoSides(dn,d.w>3?18:14,partsOf(d));}
  for(const n of (O.walk||[]))for(const m of near(n.x,n.y,n.z,4,1,q=>q.tag!=='walk'&&q.tag!=='stair').slice(0,2))edge(n,m,'walk',1.4);
  /* the open floors' rings and grids meet the walk up where it crosses them */
  for(const n of nodes)if(/^(lobby|deck|plate|gallery|yard|ground)$/.test(n.tag))for(const m of near(n.x,n.y,n.z,6,1,q=>q.tag==='walk').slice(0,1))edge(n,m,'walk',2);
  for(const n of (O.stops||[])){let c=near(n.x,n.y,n.z,6,1,q=>q.tag!=='stop'&&q.tag!=='door');if(!c.length)c=near(n.x,n.y,n.z,22,1,q=>q.tag!=='stop'&&q.tag!=='door');for(const m of c.slice(0,2))edge(n,m,'walk',2);}
  if(O.walk&&O.walk.length&&o.town){const w0=O.walk[0],c=near(w0.x,w0.y,w0.z,80,6,n=>n.tag==='street');if(c[0])edge(w0,c[0],'street',6);}
  return O;}
 return {nav};})();
