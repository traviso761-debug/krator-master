// ================================================================= LONGSONG — the people's world as data for core/simulation (PLAN.md P5b)
// [G data] core/simulation (SIM) is the vocabulary; this is Longsong's declaration into it (core/simulation/SCHEMA.md's
// order; settlements/dhelv/src/74-dhelv-sim.js is the worked example):
//   1. the host binding: the page's world clock (core/clock) gives SIM its hour, day and motion time
//   2. the NAVIGATION LAYER 'pedestrian' (LSS.graph): the ward a grid of 4 m cells on its three terraces, the buildings'
//      footprints, the court's carved walls and its pools taken out, the terraces crossed only on the avenue; the Great
//      Stair's three flights and their landings; the Debate Court's open floor on the rock; the deep stair down to the open
//      vault and the Procrastinator; and the INTERIOR (O.interior): every room of the palaces and the ward a node
//      ('R:'+id) at its floor, joined by the doors 40c records (a shared door a node of its own), a stair room to the one
//      over it, a door out to the node past its threshold (a room, the street, or the stair landings 'L:' a building's
//      doors to one stair share, storey over storey); a part the records leave cut off is joined to its building's
//      nearest room (O.patched). Walked out of sight (LSS.hidden) unless the room's floor is drawn (68, LSIXD.drawnAt)
//   3. the PLACES, from the plan's (LS.PLACES): each activity's place, its door the nearest node, its spots the free nodes
//      within its reach (no one is stood in a wall); an indoor place is its rooms (ROOMS_OF), its door the first room's
//      node and its spots on their floors (roomSpots)
//   4. the records (activities, factions, orgs, roles from LS.ROLES and LS.SCHEDULES), through SIM.load
//   5. the PEOPLE: one actor per LS.PEOPLE record, by its id, at home where its role sleeps.
// No rule lives in the drawing: 68-ls-life.js reads SIM.pose and draws. Declared once, on the first frame (LSS.init):
// core/simulation loads after this fragment.
const LSS=(function(){const P=LS,O={inited:false,problems:[],places:0,CELL:4};
 const B=P.BUILDINGS,ROCKY=P.ROCK.top;
 // a building's footprint (x0, x1, z0, z1, the heights it fills): drums by their radius, the rest by their sides
 // (the Debate Court's galleries ring the court: its open floor is not inside them)
 const FOOT=B.filter(o=>o.kind!=='gallery').map(o=>{const hw=o.r!=null?o.r:o.w/2,hd=o.r!=null?o.r:o.d/2;return {id:o.id,x0:o.x-hw,x1:o.x+hw,z0:o.z-hd,z1:o.z+hd,y0:P.baseY(o)-1,y1:P.topY(o)-.5,court:o.court||null};});
 // the camp's tents (pitched on festival days) and its well: out of the walk graph, and no one stands in one
 const inTent=(x,z)=>P.CAMP.tents.some(t=>Math.abs(x-t.x)<t.w/2+1.4&&Math.abs(z-t.z)<t.d/2+1.4)||P.WELLS.some(W=>!W.court&&Math.hypot(x-W.x,z-W.z)<2.4);
 const inFoot=(f,x,z,m)=>x>f.x0-m&&x<f.x1+m&&z>f.z0-m&&z<f.z1+m&&!(f.court&&x>f.court.x0&&x<f.court.x1&&z>f.court.z0&&z<f.court.z1);
 // ---------------------------------------------------------------- 2. the nav graph
 O.graph=function(){if(O._g)return O._g;const nodes=[],edges=[],byId={},C=O.CELL;
  const node=(id,x,y,z,tag)=>{const n={id,x,y,z,tag};nodes.push(n);byId[id]=n;return n;};
  const edge=(a,b,kind,w)=>{const A=byId[a],Bn=byId[b];edges.push({id:'e'+edges.length,a,b,kind,len:Math.hypot(A.x-Bn.x,A.y-Bn.y,A.z-Bn.z),w:w==null?2:w});};
  // the ward: cells on the terraces, out of the footprints (1 m round them), the court's pools and its two carved arcs
  const Ct=P.COURT,W=P.WARD,wardB=FOOT.filter((f,i)=>B[i].base==='ward');
  const arcWall=(x,z)=>{const dx=x-Ct.x,dz=z-Ct.z,r=Math.hypot(dx,dz);if(Math.abs(r-Ct.r)>1.6)return false;const a=Math.atan2(dz,dx);
   return Ct.arcs.some(([a0,a1])=>{let u=a;while(u<a0)u+=Math.PI*2;while(u>a0+Math.PI*2)u-=Math.PI*2;return u<=a1;});};
  const free=(x,z)=>!wardB.some(f=>inFoot(f,x,z,1))&&!inTent(x,z)&&!Ct.pools.some(q=>Math.hypot(x-q.x,z-q.z)<q.r+.8)&&!arcWall(x,z);
  const I=Math.floor((W.x1-W.x0-8)/C),J=Math.floor((-12-(W.z0+6))/C),wid=(i,j)=>'w'+i+'_'+j,X=i=>W.x0+4+i*C,Z=j=>W.z0+6+j*C;
  for(let i=0;i<=I;i++)for(let j=0;j<=J;j++){const x=X(i),z=Z(j);if(free(x,z))node(wid(i,j),x,P.wardY(z),z,'ward');}
  const avenue=x=>x>P.AVENUE.x0&&x<P.AVENUE.x1;
  for(let i=0;i<=I;i++)for(let j=0;j<=J;j++){const a=wid(i,j);if(!byId[a])continue;
   for(const [di,dj] of [[1,0],[0,1],[1,1],[1,-1]]){const b=wid(i+di,j+dj),Bn=byId[b];if(!Bn)continue;
    if(di&&dj&&!(byId[wid(i+di,j)]&&byId[wid(i,j+dj)]))continue;          // no corner cut past a building
    const A=byId[a];if(Math.abs(A.y-Bn.y)>.1&&!(avenue(A.x)&&avenue(Bn.x)&&!di))continue;   // a terrace step: the avenue's flight only
    edge(a,b,Math.abs(A.y-Bn.y)>.1?'stair':'floor',di&&dj?2:4);}}
  // the Great Stair: three flights up the base's face (LS.STAIR), a landing at each turn, the top landing to the Lower Gate
  const ST=P.STAIR;let prev=null;
  ST.forEach((F,k)=>{const zc=(F.z0+F.z1)/2,n=Math.max(2,Math.round(Math.abs(F.x1-F.x0)/8));
   for(let s=0;s<=n;s++){const u=s/n,id='s'+k+'_'+s;node(id,F.x0+(F.x1-F.x0)*u,F.y0+(F.y1-F.y0)*u,zc,'stair');if(prev)edge(prev,id,s?'stair':'landing',3);prev=id;}});
  // its foot: the forecourt at the avenue's head (the nearest ward cells)
  const near=(x,z,y,tag)=>{let bn=null,bd=1e9;for(const q of nodes){if(tag&&q.tag!==tag)continue;const d=Math.hypot(q.x-x,q.z-z)+(y==null?0:Math.abs(q.y-y)*4);if(d<bd){bd=d;bn=q;}}return bn;};
  {const F=ST[0],zc=(F.z0+F.z1)/2;const w=nodes.filter(q=>q.tag==='ward'&&Math.hypot(q.x-F.x0,q.z-zc)<9);w.forEach(q=>edge(q.id,'s0_0','floor',3));}
  const top=ST[ST.length-1],last='s'+(ST.length-1)+'_'+Math.max(2,Math.round(Math.abs(top.x1-top.x0)/8));
  node('top',top.x1,ROCKY,11,'rock');   // on the base's top (z 8 to 21), in front of the Lower Gate
  edge(last,'top','landing',3);
  const LG=P.building('lower-gate');node('gate-front',LG.x,ROCKY,LG.z-LG.d/2-4,'rock');edge('top','gate-front','floor',4);
  node('gate-in',LG.x,ROCKY,LG.z,'door');edge('gate-front','gate-in','door',2);
  // the Debate Court's floor (the White Palace's court: open to the sky)
  const WP=P.building('white-palace'),K=WP.court,cid=(i,j)=>'c'+i+'_'+j,ci=Math.floor((K.x1-K.x0-4)/C),cj=Math.floor((K.z1-K.z0-4)/C);
  const rockB=FOOT.filter((f,i)=>B[i].base==='rock'&&B[i].id!=='white-palace');   // the halls that stand into the court (the Assembly's drum)
  for(let i=0;i<=ci;i++)for(let j=0;j<=cj;j++){const x=K.x0+2+i*C,z=K.z0+2+j*C;if(!rockB.some(f=>inFoot(f,x,z,1)))node(cid(i,j),x,ROCKY,z,'court');}
  for(let i=0;i<=ci;i++)for(let j=0;j<=cj;j++)for(const [di,dj] of [[1,0],[0,1],[1,1],[1,-1]])if(byId[cid(i,j)]&&byId[cid(i+di,j+dj)])edge(cid(i,j),cid(i+di,j+dj),'floor',4);
  edge('gate-in',near(LG.x,LG.z+LG.d/2+2,ROCKY,'court').id,'door',2);
  // the rooms: door edges from the court's edge into the ranges and the halls, and the deep stair down (walked unseen)
  const room=(id,x,y,z,from)=>{node(id,x,y,z,'door');edge(typeof from==='string'?from:near(from[0],from[1],ROCKY,'court').id,id,'door',2);};
  // (2026-10-20) the palaces and the ward's buildings are walked room by room: O.interior below. The depths keep their
  // abstract stair (the deep stair's foot, the open vault, the wheel), reached from the Deep Stair's head in the Red Palace
  const VD=P.PLACES.find(q=>q.id==='vault'),WH=P.PLACES.find(q=>q.id==='wheel');
  node('deep-stair',0,ROCKY-20,K.z1+8,'door');room('in-vault',VD.x,VD.y,VD.z,'deep-stair');room('in-wheel',WH.x,WH.y,WH.z-WH.r-4,'in-vault');
  node('in-roof',-58,P.topY(WP),60,'door');
  O.interior(nodes,edges,byId,node,edge);
  O._g={nodes,edges,byId,near};return O._g;};
 // ---------------------------------------------------------------- the interiors in the walk graph (2026-10-20, the owner:
 // "make walk graph record interior"). Every room of 40c (LS.ROOMS: the palaces', the ward's; not the depths', the roofs'
 // or the open courts') a node at its middle on its floor (tag 'room'); every door between two rooms a node on its
 // threshold (tag 'idoor') joined to both; a stair room joined to the next stair room up in its building whose box meets
 // its own (the service stairs, the houses' stairs, the wings'). A door out of a building joins the nearest outside node
 // on its level (the ward's cells, the court's floor, the base's top). A door out to a named stair, gallery or roof (the
 // front range's west stair, the back stair, the Red Palace's stair...) joins that stair's landing on its storey (tag
 // 'landing', at the middle of the doors that open on it); one stair's landings are joined storey to storey and its lowest
 // to the nearest outside node. The Deep Stair's head joins the depths' stair; the west range's roof the roof terraces.
 // What is still cut off after that (a gallery the plan names on one storey only) is joined to the nearest reached room
 // or landing of its building, and counted: O.patched.
 O.interior=function(nodes,edges,byId,node,edge){if(!P.ROOMS){O.patched=[];return;}
  const R=P.ROOMS,outside=nodes.filter(q=>q.tag!=='door'),bld={};
  const rooms=R.list.filter(r=>r.furnish!=='vault'&&!r.roof&&r.building!=='vault'&&r.id!=='wp.court');   // (the court: its own floor's nodes)
  const rid=r=>'R:'+r.id,cx=r=>r.circle?r.circle.x:(r.x0+r.x1)/2,cz=r=>r.circle?r.circle.z:(r.z0+r.z1)/2;
  const mk=(id,x,y,z,tag,b)=>{if(!byId[id])node(id,x,y,z,tag);bld[id]=b;return id;};
  rooms.forEach(r=>mk(rid(r),cx(r),r.y,cz(r),'room',r.building));
  // the doors between rooms (a shared door is one node, on both rooms' lists)
  rooms.forEach(r=>r.doors.forEach(d=>{if(d.out)return;const q=R.byId[d.to];if(!q||!byId[rid(q)])return;
   edge(rid(r),mk('D:'+d.id,d.x,r.y,d.z,'idoor',r.building),'door',2);}));
  // the stairs: each stair room to the stair room over it in its building (their boxes meet), or, on a storey with none
  // there, to the room the flight comes up into (the wings' third storey, the conservators' and the map room's), and
  // the same down
  const stairs=rooms.filter(r=>r.stair&&!r.circle),meets=(a,b)=>!b.circle&&Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)>.5&&Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0)>.5;
  stairs.forEach(a=>{for(const dk of [1,-1]){const k=a.storey+dk,on=rooms.filter(b=>b.building===a.building&&b.storey===k&&meets(a,b));
    const b=on.find(q=>q.stair)||(dk<0&&stairs.some(q=>q.building===a.building&&q.storey===k)?null:on[0]);if(b)edge(rid(a),rid(b),'stair',2);}});
  // the room a door opens into from outside its own: the room a metre past its threshold, on the side the door is on
  const roomAt=(x,y,z,not)=>{for(const q of rooms){if(q===not||Math.abs(q.y-y)>1.2)continue;
   if(q.circle?Math.hypot(x-q.circle.x,z-q.circle.z)<q.circle.r:x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1)return q;}return null;};
  const beyond=(r,d)=>{let nx,nz;if(r.circle){nx=d.x-r.circle.x;nz=d.z-r.circle.z;const L=Math.hypot(nx,nz)||1;nx/=L;nz/=L;}
   else{const s=[[Math.abs(d.x-r.x0),-1,0],[Math.abs(d.x-r.x1),1,0],[Math.abs(d.z-r.z0),0,-1],[Math.abs(d.z-r.z1),0,1]].sort((a,b)=>a[0]-b[0])[0];nx=s[1];nz=s[2];}
   for(const k of [1.2,2.4,3.6])for(const q of [roomAt(d.x+nx*k,r.y,d.z+nz*k,r)])if(q)return q;return null;};
  const nearOut=(x,y,z,max,dyMax)=>{let bn=null,bd=max;for(const q of outside){if(Math.abs(q.y-y)>dyMax)continue;const d=Math.hypot(q.x-x,q.z-z);if(d<bd){bd=d;bn=q;}}return bn;};
  // the doors out: to the ground outside, the depths, the roof, or a named stair's landing
  const CORE=new Map(),norm=s=>s.replace(/\s*\([^)]*\)/g,'').replace(/^the /i,'').trim();
  rooms.forEach(r=>r.doors.forEach((d,j)=>{if(!d.out)return;const id=mk('O:'+r.id+'#'+j,d.x,r.y,d.z,'idoor',r.building);edge(rid(r),id,'door',2);
   if(/Deep Stair/.test(d.to)){edge(id,'deep-stair','stair',2);return;}
   if(/roof/.test(d.to)&&r.building==='white-palace'){edge(id,'in-roof','stair',2);return;}
   // a door naming a room of its building (the stair hall of the upper palace): to that room
   const named=rooms.find(q=>q!==r&&q.building===r.building&&norm(q.name).toLowerCase()===norm(d.to).toLowerCase());
   if(named){edge(id,rid(named),Math.abs(named.y-r.y)>1?'stair':'door',2);return;}
   const k=r.building+'|'+norm(d.to),stairs=/stair|landing/i.test(d.to);
   // a named stair carries the storeys whatever the door also opens on: its landing, as well
   if(stairs)(CORE.get(k)||CORE.set(k,[]).get(k)).push({id,r,d});
   const q=beyond(r,d);if(q){edge(id,rid(q),'door',2);return;}
   const o=nearOut(d.x,r.y,d.z,9,2.5);if(o){edge(id,o.id,'door',2);return;}
   if(!stairs)(CORE.get(k)||CORE.set(k,[]).get(k)).push({id,r,d});}));
  CORE.forEach((L,k)=>{const by=new Map();L.forEach(e=>{(by.get(e.r.storey)||by.set(e.r.storey,[]).get(e.r.storey)).push(e);});
   const ks=[...by.keys()].sort((a,b)=>a-b);let prev=null;
   ks.forEach(st=>{const E=by.get(st),lid=mk('L:'+k+'#'+st,E.reduce((t,e)=>t+e.d.x,0)/E.length,E[0].r.y,E.reduce((t,e)=>t+e.d.z,0)/E.length,'landing',E[0].r.building);
    E.forEach(e=>edge(e.id,lid,'floor',2));if(prev)edge(prev,lid,'stair',2);prev=lid;
    // a landing opens on the rooms of its storey beside it (a corner stair between two ranges): those within 2.5 m
    const Lq=byId[lid],own=new Set(E.map(e=>e.r));for(const q of rooms){if(own.has(q)||q.building!==E[0].r.building||Math.abs(q.y-Lq.y)>1.2||q.circle)continue;
     const dx=Math.max(q.x0-Lq.x,0,Lq.x-q.x1),dz=Math.max(q.z0-Lq.z,0,Lq.z-q.z1);if(Math.hypot(dx,dz)<2.5)edge(lid,rid(q),'floor',2);}});
   const lo=byId['L:'+k+'#'+ks[0]],o=nearOut(lo.x,lo.y,lo.z,16,3);if(o)edge(lo.id,o.id,'door',2);});
  // what is still cut off: joined to the nearest reached room or landing of its building (counted)
  const adj=new Map();edges.forEach(e=>{(adj.get(e.a)||adj.set(e.a,[]).get(e.a)).push(e.b);(adj.get(e.b)||adj.set(e.b,[]).get(e.b)).push(e.a);});
  const seen=new Set(['gate-in']),reach=s0=>{const q=[s0];while(q.length){const n=q.pop();for(const m of adj.get(n)||[])if(!seen.has(m)){seen.add(m);q.push(m);}}};
  reach('gate-in');O.patched=[];
  for(const r of rooms){if(seen.has(rid(r)))continue;
   // its component, and the nearest reached node of its building to any node of it
   const comp=[],q=[rid(r)],cs=new Set(q);while(q.length){const n=q.pop();comp.push(n);for(const m of adj.get(n)||[])if(!cs.has(m)){cs.add(m);q.push(m);}}
   // its building's first; else any building's (a building whose every door the plan names to something it does not hold)
   let best=null;for(const same of [true,false]){let bd=1e9;for(const a of comp){if(!/^[RL]:/.test(a))continue;const A=byId[a];for(const id of seen){if((same&&bld[id]!==r.building)||!/^[RL]:/.test(id))continue;const Bn=byId[id];
     const d=Math.hypot(A.x-Bn.x,A.z-Bn.z)+Math.abs(A.y-Bn.y)*2;if(d<bd){bd=d;best=[a,id];}}}if(best)break;}
   if(!best){O.patched.push(r.id+': nothing reached to join it to');continue;}
   edge(best[0],best[1],Math.abs(byId[best[0]].y-byId[best[1]].y)>1?'stair':'floor',2);O.patched.push(best[0]+' - '+best[1]);
   (adj.get(best[0])||adj.set(best[0],[]).get(best[0])).push(best[1]);(adj.get(best[1])||adj.set(best[1],[]).get(best[1])).push(best[0]);
   comp.forEach(n=>seen.add(n));}
  O.rooms={n:rooms.length,reached:rooms.filter(r=>seen.has(rid(r))).length};};
 // a walker out of sight: inside a building's footprint (between its floor and its roof), or under the rock
 O.hidden=function(x,y,z){for(const f of FOOT)if(y>f.y0&&y<f.y1&&inFoot(f,x,z,-.3))return true;const ry=P.rockY(x,z);return ry>-1e8&&y<ry-1.5;};
 // ---------------------------------------------------------------- 3. the places
 const yOf=pl=>pl.y==='rock'?ROCKY:pl.y==='ward'?P.wardY(pl.z==null?-100:pl.z):typeof pl.y==='number'?pl.y:P.wardY(pl.z);
 // which plan places sit inside (their walkers reach them by the rooms' doors, not the courts')
 const DOOR={roof:'in-roof',vault:'in-vault',wheel:'in-wheel'};
 // the indoor places that are rooms (2026-10-20): their people go to spots in those rooms, walking the rooms' graph
 // (O.interior) to them: a cell each in the ranges, places at the tables and desks on a grid, the Assembly Hall's
 // floor in rings. A room's spots keep a metre from its walls; a stair, a corridor or a gate passage is no one's place
 const IX_OF=(...k)=>r=>k.indexOf(r.ix)>=0,USE_OF=(...u)=>r=>u.indexOf(r.use)>=0,IN_B=(...b)=>r=>b.indexOf(r.building)>=0&&!r.stair&&r.use!=='corridor'&&r.use!=='gate passage';
 const ROOMS_OF={assembly:r=>r.id==='wp.assembly',cells:USE_OF('monk\'s cell','trainee\'s cell','keeper\'s cell'),
  library:r=>(r.building==='white-palace'||r.building==='red-palace'||r.building==='red-wings')&&IX_OF('ls-library','ls-study','ls-scriptorium','ls-stacks','ls-catalogue','ls-clerks')(r),
  refectory:r=>r.id==='wp.k1.refectory',workshops:r=>B.find(b=>b.id===r.building&&b.base==='ward')&&IX_OF('ls-workshop','smithy','ls-bindery','ls-laundry')(r),
  hostel:IN_B('hostel'),'lay-houses':IN_B('servants'),tea:IN_B('market'),caravanserai:IN_B('caravanserai'),barracks:IN_B('barracks')};
 function roomSpots(id){const f=ROOMS_OF[id];if(!f||!P.ROOMS)return null;const out=[];
  for(const r of P.ROOMS.list){if(!f(r)||r.outdoor)continue;
   if(r.circle){const C=r.circle;for(let rr=3;rr<C.r-1.2;rr+=1.8){const n=Math.floor(2*Math.PI*rr/1.6);for(let k=0;k<n;k++){const a=k/n*Math.PI*2;out.push([C.x+Math.cos(a)*rr,C.z+Math.sin(a)*rr,r.y,r.id]);}}continue;}
   if(r.cell||(r.x1-r.x0)*(r.z1-r.z0)<16){out.push([(r.x0+r.x1)/2,(r.z0+r.z1)/2,r.y,r.id]);continue;}
   const st=id==='refectory'?2:2.6;for(let x=r.x0+1;x<=r.x1-1;x+=st)for(let z=r.z0+1;z<=r.z1-1;z+=st)out.push([x,z,r.y,r.id]);}
  // in an order of their own (a hash of the spot), so the first comers spread over the rooms
  out.sort((a,b)=>KRAND.hash(7,Math.round(a[0]*10),Math.round(a[1]*10))-KRAND.hash(7,Math.round(b[0]*10),Math.round(b[1]*10)));
  return out.length?out:null;}
 O.roomSpots=roomSpots;
 // the activities whose people stand still at their spot (the life layer animates them: 68)
 const STILL={DRILL:1,DEBATE:1,GUARD:1,TURN_WHEEL:1,KEEP:1,CHAM:1,WATCH:1,FESTIVAL:1};
 O.placeRecs=function(){const G=O.graph(),out=[];
  for(const pl of P.PLACES){const y=yOf(pl);let x=pl.x,z=pl.z,door,spots=[];
   if(pl.ring){const R=pl.ring;x=R.cx;z=R.cz-R.b;}                 // the kora: joined at its north point (the avenue)
   else if(pl.line){x=(pl.line[0][0]+pl.line[1][0])/2;z=(pl.line[0][1]+pl.line[1][1])/2;}
   const RS=pl.indoor?roomSpots(pl.id):null;
   if(DOOR[pl.id])door=G.byId[DOOR[pl.id]];else if(RS)door=G.byId['R:'+RS[0][3]];else door=G.near(x,z,y);
   if(!DOOR[pl.id]&&!pl.ring&&!pl.indoor){const inR=pl.line?(q=>Math.abs(q.x-x)<pl.r&&q.z>pl.line[0][1]&&q.z<pl.line[1][1]):(q=>Math.hypot(q.x-x,q.z-z)<pl.r);
    spots=[];for(const q of G.nodes)if(q.tag!=='door'&&q.tag!=='stair'&&Math.abs(q.y-y)<2&&inR(q)&&!(pl.hole&&Math.hypot(q.x-x,q.z-z)<pl.hole))for(const [ox,oz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const sx=q.x+ox,sz=q.z+oz;
     if(!FOOT.some(f=>q.y+.5>f.y0&&q.y+.5<f.y1&&inFoot(f,sx,sz,1.6))&&!(pl.id==='camp'&&inTent(sx,sz)))spots.push([sx,sz,q.y]);}   // clear of the walls (and the tents) by more than the wander
    // the spots in an order of their own (a hash of the place and the node), so the first comers spread over the place
    spots.sort((a,b)=>KRAND.hash(pl.id.length,Math.round(a[0]*7),Math.round(a[1]*7))-KRAND.hash(pl.id.length,Math.round(b[0]*7),Math.round(b[1]*7)));}
   const indoor=!!pl.indoor;if(RS)spots=RS.map(q=>[q[0],q[1],q[2]]);
   out.push({id:pl.id,name:pl.name,kind:pl.id,x:door?door.x:x,y:door?door.y:y,z:door?door.z:z,door:{x:door.x,y:door.y,z:door.z,node:door.id},
    activities:{[pl.activity]:pl.cap},indoor:indoor?true:{},spots:spots.length?spots:undefined,cap:pl.cap,r:DOOR[pl.id]&&!indoor?Math.min(pl.r,6):undefined,
    wander:indoor||STILL[pl.activity]?0:1.2,tags:{plan:pl.id}});}
  return out;};
 // ---------------------------------------------------------------- 4. the records
 O.HOME={monk:'cells',novice:'cells',elder:'cells',operative:'cells',master:'cells',keeper:'cells',warden:'barracks',
  servant:'lay-houses',scholar:'lay-houses',artisan:'lay-houses',trader:'lay-houses',caravan:'caravanserai',pilgrim:'hostel',festgoer:'away'};
 O.world=function(){const acts=new Set();for(const Pn of P.PEOPLE)Pn.schedule.concat(Pn.fest).forEach(a=>acts.add(a));
  const ORG={'The Order of Historians':'order','Oidong':'town','Xanadu Sultanate':'pilgrims'};
  return {activities:[...acts].sort().map(id=>({id,indoor:/^(SLEEP|EAT|STUDY_IN|WORK|REST|REST_W|REST_C|LODGE|TEA|PRAY|AWAY)$/.test(id)})),
   factions:[{id:'historians',name:'The Order of Historians'},{id:'oidong',name:'The people of the Oidong Valley'},{id:'xanadu',name:'The Xanadu Sultanate'}],
   orgs:[{id:'order',faction:'historians',name:'The Order at Longsong'},{id:'town',faction:'oidong',name:'The town in the ward'},
    {id:'pilgrims',faction:'xanadu',name:'Pilgrims',resident:false},{id:'caravans',faction:'xanadu',name:'A caravan from Xanadu',resident:false}],
   // a role per schedule variant (O.roleOf), each on SIM's week: its day's schedule, and the festival's on the festival's weekday
   roles:[...new Set(P.PEOPLE.map(O.roleOf))].map(id=>{const Pn=P.PEOPLE.find(q=>O.roleOf(q)===id),R=P.ROLES.find(q=>q.role===Pn.role),F=P.FESTIVAL;
    return {id,org:R.role==='caravan'?'caravans':ORG[R.faction],name:R.sub,scheds:{day:Pn.schedule,fest:Pn.fest||Pn.schedule},
     week:Array.from({length:F.week},(u,d)=>d===F.day?'fest':'day'),speed:R.role==='pilgrim'||R.role==='festgoer'?.95:R.role==='operative'?1.3:1.1,
     prefers:{SLEEP:{pin:'home'},REST:{pin:'home'},REST_W:{pin:'home'},REST_C:{pin:'home'},LODGE:{pin:'home'},AWAY:{pin:'home'}}};})};};
 O.roleOf=Pn=>Pn.role+'.'+(Pn.variant||0)+(Pn.cham?'.cham':'');   // the cham's dancers: their own festival schedule
 // ---------------------------------------------------------------- the declaration (once; the host's clock)
 O.init=function(clock,o){if(O.inited)return O;O.inited=true;o=o||{};const t0=Date.now(),G=O.graph();
  if(SIM.WEEK!==P.FESTIVAL.week)throw new Error('LSS: the festival is every '+P.FESTIVAL.week+' days; SIM.WEEK is '+SIM.WEEK);
  SIM.init({seed:7401,hour:()=>clock.hour,day:()=>clock.day||0,t:()=>clock.t,err:m=>O.problems.push(m)});
  SIM.nav.layer('pedestrian',{nodes:G.nodes,edges:o.edges?o.edges(G.edges):G.edges,cost:{stair:1.3,landing:1,floor:1,door:1},yWeight:4});
  O.loaded=SIM.load(O.world());
  for(const r of O.placeRecs()){SIM.place(r);O.places++;}
  for(const Pn of P.PEOPLE)SIM.actor({id:Pn.id,role:O.roleOf(Pn),home:O.HOME[Pn.role]});   // its variant's role: the day's and the festival's schedules
  SIM.REF={layer:'pedestrian',x:0,z:-100};
  O.problems=O.problems.concat(SIM.check());O.ms=Date.now()-t0;return O;};
 return O;})();
