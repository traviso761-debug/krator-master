// ================================================================= VERGE — the life layer's world, as data ([G data])
// No meshes here: who lives in Verge, what they do, where they can go and when. The embodiment (78) only evaluates
// these records at the clock's time and draws them. Everything follows core/simulation/PLAN.md section 4.3:
//   FACTIONS and ORGS        the Empire of Iziz (Upper Verge's governor, guard and toll), Yuni (Lower Verge's
//                            elected mayor and council, guard and toll), the Order of Historians, the porters' guild,
//                            the caravan companies, the Eastern Nomads' bands
//   PLACES                   derived from the placed buildings (their types and their kit keys), the plazas, the
//                            toll gates, the rest stops and the map's ports; activities, capacity and SLOTS (the
//                            premarked spaces a caravan's animals and people go to: one body to one slot, reserved
//                            in time, so no two caravans ever stand on each other)
//   ROLES                    a schedule of activities by world hour; never a coordinate
//   NAV                      one graph: the streets, the plazas, the bridges, the highways, the switchback, the two
//                            canyon ramps and every door; A* over it (layer and width per edge). Off the roads, a coarse
//                            grid per level for the nomads' cross-country legs
//   GROUPS (timetabled)      caravans, porters, nomad squads, guard patrols: each a route and a KSCHED.timeline of
//                            how far its leader has come (motion is a FUNCTION OF TIME, so Godot replays it), its
//                            members following at their own distance behind (each turns where the leader turned,
//                            later), stops where they queue (tolls) or disperse to slots (rest stops, caravanserais)
//   CITIZENS                 a rambling pedestrian per household member on duty: each walk is a DECISION (taken when
//                            the last one ends, from the citizen's own seeded stream and the hour) and a path walked
//                            as a function of time; every decision is logged
// One cycle of the timetable is SIM.T seconds of motion time (the clock's t); it repeats.
const SIM=(function(){
const {clamp,mix,smooth}=VG;
const RS=name=>KRAND.stream(KRAND.child(VG.SEED,'sim:'+name));
const T=10800;                                   // one cycle of the timetable: three real hours
const V={camel:1.55,walk:1.3,ride:2.6,porter:1.45,patrol:1.2};
// ---------------------------------------------------------------- factions and organisations
const FACTIONS={
 iziz:{name:'The Empire of Iziz',culture:'iziz',orgs:{
  verge_governorate:{name:'The Governorate of Upper Verge',resident:true,note:'a governor sent from Iziz'},
  upper_guard:{name:'The Upper Verge guard',resident:true},
  upper_toll:{name:'The upper toll',resident:true},
  upper_town:{name:'The townsfolk of Upper Verge',resident:true}}},
 yuni:{name:'Yuni',culture:'yuni',orgs:{
  lower_council:{name:'The Council of Lower Verge',resident:true,note:'a mayor elected by its residents'},
  lower_guard:{name:'The Lower Verge guard',resident:true},
  lower_toll:{name:'The lower toll',resident:true},
  lower_town:{name:'The townsfolk of Lower Verge',resident:true,culture:'eastabyss'}}},
 order:{name:'The Order of Historians',culture:'order',orgs:{historians:{name:'The chapterhouse of Lower Verge',resident:true}}},
 verge:{name:'The twin cities',orgs:{porters:{name:'The porters of the trail',resident:true}}},
 merchants:{name:'The caravan companies',orgs:{west_caravans:{name:'Caravans of the western routes',resident:false},abyss_caravans:{name:'Caravans of the salt lakes',resident:false}}},
 eastern_nomads:{name:'Eastern Nomads',culture:'nomad',orgs:{plateau_bands:{name:'The plateau bands (camel riders)',resident:false},abyss_bands:{name:'The abyss bands (lizard riders)',resident:false}}}};
const ACTIVITIES=['SLEEP','EAT','REST','TRADE','CRAFT','HAUL','STORE','SOCIALIZE','PLAY','WORSHIP','STUDY','GOVERN','PATROL','PAY_TOLL','COLLECT_TOLL','TRAVEL','STABLE','WATER_CAMELS'];
function sched(spans){const out=new Array(24);let a=spans[spans.length-1][1];for(let h=0;h<24;h++){for(const s of spans)if(s[0]===h)a=s[1];out[h]=a;}return out;}
const ROLES={
 shopkeeper:{prefers:['TRADE'],sched:sched([[0,'SLEEP'],[6,'TRADE'],[12,'EAT'],[13,'TRADE'],[19,'SOCIALIZE'],[22,'SLEEP']])},
 artisan:{prefers:['CRAFT'],sched:sched([[0,'SLEEP'],[6,'CRAFT'],[12,'EAT'],[13,'CRAFT'],[18,'SOCIALIZE'],[21,'SLEEP']])},
 labourer:{prefers:['HAUL','STORE'],sched:sched([[0,'SLEEP'],[5,'HAUL'],[11,'EAT'],[12,'HAUL'],[17,'SOCIALIZE'],[21,'SLEEP']])},
 innkeeper:{prefers:['EAT','SOCIALIZE'],sched:sched([[0,'SLEEP'],[5,'EAT'],[10,'TRADE'],[16,'EAT'],[18,'SOCIALIZE'],[23,'SLEEP']])},
 clerk:{prefers:['GOVERN'],sched:sched([[0,'SLEEP'],[7,'GOVERN'],[12,'EAT'],[13,'GOVERN'],[17,'SOCIALIZE'],[21,'SLEEP']])},
 historian:{prefers:['STUDY','WORSHIP'],sched:sched([[0,'SLEEP'],[5,'WORSHIP'],[7,'STUDY'],[12,'EAT'],[13,'STUDY'],[18,'WORSHIP'],[20,'SLEEP']])},
 child:{prefers:['PLAY'],sched:sched([[0,'SLEEP'],[7,'EAT'],[8,'PLAY'],[12,'EAT'],[13,'PLAY'],[19,'EAT'],[20,'SLEEP']])},
 elder:{prefers:['SOCIALIZE','WORSHIP'],sched:sched([[0,'SLEEP'],[6,'WORSHIP'],[8,'SOCIALIZE'],[12,'REST'],[16,'SOCIALIZE'],[19,'EAT'],[21,'SLEEP']])},
 guard:{prefers:['PATROL'],sched:sched([[0,'PATROL'],[6,'EAT'],[7,'PATROL'],[18,'EAT'],[19,'PATROL']])},
 toll_keeper:{prefers:['COLLECT_TOLL'],sched:sched([[0,'SLEEP'],[5,'COLLECT_TOLL'],[20,'SLEEP']])},
 porter:{prefers:['HAUL'],sched:sched([[0,'SLEEP'],[5,'HAUL'],[20,'SLEEP']])},
 caravaneer:{prefers:['TRAVEL','TRADE'],sched:sched([[0,'TRAVEL']])},
 nomad:{prefers:['TRAVEL','TRADE','WATER_CAMELS'],sched:sched([[0,'TRAVEL']])}};
// ---------------------------------------------------------------- places, from what was placed
const PLACES=[],PBY={};
function addPlace(p){p.slots=p.slots||[];p.activities=p.activities||[];PLACES.push(p);PBY[p.id]=p;return p;}
function activitiesOf(R){const t=R.types.join(' '),k=R.key,a=[];
 if(/dwelling/.test(t))a.push('SLEEP','EAT','REST');
 if(/market|shop/.test(t))a.push('TRADE');if(/tavern|inn/.test(t))a.push('EAT','SOCIALIZE','SLEEP');
 if(/industry/.test(t)||/workshop|smithy/.test(k))a.push('CRAFT');if(/warehouse|granary|silo/.test(k))a.push('HAUL','STORE');
 if(/religious|temple|chapter/.test(t+' '+k))a.push('WORSHIP');if(/chapter|library|school|archive/.test(k))a.push('STUDY');
 if(/palace|mayor|governor/.test(k))a.push('GOVERN');if(/military|guard|barracks|watch/.test(t+' '+k))a.push('PATROL');
 if(/toll/.test(k))a.push('COLLECT_TOLL');if(/caravanserai/.test(k))a.push('REST','SLEEP','TRADE','STABLE','WATER_CAMELS');
 if(/market_canopy|vern_market|market_stall|market_tent|market_hall/.test(k))a.push('TRADE');
 if(!a.length)a.push('REST');return Array.from(new Set(a));}
for(const R of PLACE.buildings){if(/palisade/.test(R.key))continue;
 const cap=Math.max(2,Math.round(R.w*R.d/(/dwelling/.test(R.types.join(' '))?40:22)));
 addPlace({id:'pl_'+R.id,name:R.name+(R.landmark?' ('+R.landmark+')':''),building:R.id,key:R.key,city:R.city,door:R.door,x:R.x,z:R.z,y:R.y,activities:activitiesOf(R),capacity:cap,
  faction:R.city==='upper'?'iziz':R.city==='lower'?'yuni':'verge',tags:{culture:R.culture,types:R.types,district:R.district,landmark:R.landmark}});}
for(const Q of PLACE.plazas)addPlace({id:'pl_'+Q.id,name:Q.id.replace('_',' '),city:Q.city,x:Q.x,z:Q.z,y:terrainH(Q.x,Q.z),door:[Q.x,Q.z],
 activities:Q.kind==='market'?['TRADE','SOCIALIZE','PLAY']:['TRAVEL','SOCIALIZE'],capacity:Q.kind==='market'?240:60,tags:{kind:Q.kind}});
for(const k in VG.PORTS){const P=VG.PORTS[k];addPlace({id:'port_'+k,name:P.name,city:P.level,x:P.x,z:P.z,y:terrainH(P.x,P.z),door:[P.x,P.z],activities:['TRAVEL'],capacity:999,tags:{port:true}});}
// ---------------------------------------------------------------- slots: one body each, reserved in time
// A caravanserai's: its court's person slots (round the walls of the court, read from its key) and a CAMEL YARD
// beside it (rows of animal slots facing a rail); a rest stop's: the animals in two rows on its pad, the people
// under its shelter. Each slot keeps the intervals (cycle time, mod T) it is taken.
const COURT={vern_caravanserai:[-13,13,-10,10],abyss_caravanserai:[-18,18,-18,20],trade_caravanserai:[-36,36,-24,24]};
const L2W=(R,lx,lz)=>[R.x+lx*Math.cos(R.ry)+lz*Math.sin(R.ry),R.z-lx*Math.sin(R.ry)+lz*Math.cos(R.ry)];
function slotGrid(cx,cz,ry,nx,nz,dx,dz,kind,y,place){const out=[];for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const lx=(i-(nx-1)/2)*dx,lz=(j-(nz-1)/2)*dz;
 const p=[cx+lx*Math.cos(ry)+lz*Math.sin(ry),cz-lx*Math.sin(ry)+lz*Math.cos(ry)];out.push({id:place.id+'.'+kind+'.'+out.length,kind,x:p[0],z:p[1],y:y!=null?y:terrainH(p[0],p[1]),ry:ry+(j%2?Math.PI:0),busy:[]});}return out;}
const CARAVANSERAIS=[];
for(const R of PLACE.buildings){if(!/caravanserai/.test(R.key))continue;const P=PBY['pl_'+R.id],C=COURT[R.key]||[-10,10,-10,10];
 // the court's person slots: along its four sides, 2.2 m apart, facing in
 const ring=[];const step=2.4;
 for(let x=C[0]+2;x<=C[1]-2;x+=step){ring.push([x,C[2]+1.2,0]);ring.push([x,C[3]-1.2,Math.PI]);}
 for(let z=C[2]+3;z<=C[3]-3;z+=step){ring.push([C[0]+1.2,z,Math.PI/2]);ring.push([C[1]-1.2,z,-Math.PI/2]);}
 P.slots=ring.map((q,i)=>{const w=L2W(R,q[0],q[1]);return{id:P.id+'.person.'+i,kind:'person',x:w[0],z:w[1],y:R.y+.15,ry:R.ry+q[2],busy:[]};});
 // the gate: the court's front edge on its axis
 const g=L2W(R,0,R.d/2+2);P.gate=[g[0],g[1]];P.inner=L2W(R,0,C[3]-4);
 CARAVANSERAIS.push(P);}
// the camel yards: placed beside each caravanserai by the placement pass's rules (a free rectangle, hunted)
for(const P of CARAVANSERAIS){const R=PLACE.buildings.find(b=>b.id===P.building),city=PLACE.cities[R.city];
 if(R.yard){const Y=R.yard,nx=Y.w>20?8:6,nz=Y.w>20?4:3;P.yard=Y;P.slots=P.slots.concat(slotGrid(Y.x,Y.z,Y.ry,nx,nz,2.8,5,'animal',null,P));continue;}
 let best=null;const tries=[];for(const side of [1,-1])for(const off of [0,6,12,20,30])for(const lz of [0,-8,8,-16])tries.push([side*(R.w/2+11+off),lz]);for(const off of [0,8,16])tries.push([0,-(R.d/2+10+off)]);
 for(const [lx,lz] of tries){for(const sz of [[24,22,8,4],[18,16,6,3]]){const c=L2W(R,lx,lz),f=PLACE_FITS(city,c[0],c[1],sz[0],sz[1],R.ry);if(f!=null){best={x:c[0],z:c[1],y:f,sz};break;}}if(best)break;}
 if(best){P.yard={x:best.x,z:best.z,y:best.y,ry:R.ry,w:best.sz[0],d:best.sz[1]};P.slots=P.slots.concat(slotGrid(best.x,best.z,R.ry,best.sz[2],best.sz[3],2.8,5,'animal',null,P));}
 else P.yardMissing=true;}
// the flora's reserve again, now with the yards in it
for(const g of VERGE_RESERVE.grids){const c=[PLACE.cities.upper,PLACE.cities.lower].find(q=>q.x0===g.x0&&q.z0===g.z0);if(!c)continue;for(let k=0;k<g.occ.length;k++){const v=c.D[k*4];g.occ[k]=(v>0&&v<PLACE.CODE.blocked)?1:0;}}
// a yard is free ground in the city's placement raster (and it is then reserved there)
function PLACE_FITS(city,x,z,w,d,ry){if(!city||!city.code)return null;const c=PLACE.CODE;let lo=1e9;
 for(let lz=-d/2;lz<=d/2;lz+=1.5)for(let lx=-w/2;lx<=w/2;lx+=1.5){const p=PLACE.loc(x,z,lx,lz,ry),v=city.code(p[0],p[1]);if(v!==c.free&&v!==c.yard)return null;lo=Math.min(lo,city.h(p[0],p[1]));}
 city.poly(PLACE.obb(x,z,w/2,d/2,ry),c.yard);return lo;}
// the rest stops: a place on the trail, its slots on the pad
const RESTS=[];
for(const R of PLACE.buildings){if(R.key!=='vern_rest_stop')continue;const rs=VG.TRAIL.rest.find(r=>r.id===R.rest);
 const P=addPlace({id:'pl_'+R.rest,name:'The rest stop at the '+rs.mark+' m mark',city:'trail',x:R.x,z:R.z,y:R.y,door:[R.x,R.z],activities:['REST','WATER_CAMELS'],capacity:24,tags:{mark_m:rs.mark,variant:rs.variant}});
 P.trailS=rs.s;P.gate=rs.gate.slice();                    // where the stop meets the trail
 P.slots=slotGrid(R.x,R.z,R.ry,6,2,2.6,3.2,'animal',R.y+.1,P).concat(slotGrid(R.x+Math.sin(R.ry)*-4.2,R.z+Math.cos(R.ry)*-4.2,R.ry,6,2,1.5,1.3,'person',R.y+.1,P));
 RESTS.push(P);}
// ---------------------------------------------------------------- NAV: one graph
const NAV={nodes:[],edges:[],adj:[]};
function node(x,z,y,tag){const id=NAV.nodes.length;NAV.nodes.push({id,x:+x.toFixed(2),z:+z.toFixed(2),y:+(y!=null?y:terrainH(x,z)).toFixed(2),tag:tag||''});NAV.adj.push([]);return id;}
function edge(a,b,layer,w,kind){if(a===b)return;const A=NAV.nodes[a],B=NAV.nodes[b],len=Math.hypot(A.x-B.x,A.z-B.z,A.y-B.y);const id=NAV.edges.length;
 NAV.edges.push({id,a,b,len:+len.toFixed(2),layer,w,kind:kind||layer});NAV.adj[a].push(id);NAV.adj[b].push(id);return id;}
// a spatial hash of segments, so an end point can find the street it meets
const SEGB=new Map(),SC=12;const skey=(i,j)=>i*100003+j;
function segAdd(eid){if(eid==null)return;const e=NAV.edges[eid],A=NAV.nodes[e.a],B=NAV.nodes[e.b];for(let i=Math.floor(Math.min(A.x,B.x)/SC)-1;i<=Math.floor(Math.max(A.x,B.x)/SC)+1;i++)for(let j=Math.floor(Math.min(A.z,B.z)/SC)-1;j<=Math.floor(Math.max(A.z,B.z)/SC)+1;j++){const k=skey(i,j);if(!SEGB.has(k))SEGB.set(k,[]);SEGB.get(k).push(eid);}}
function nearestSeg(x,z,maxD,skip){let best=null;const i0=Math.floor(x/SC),j0=Math.floor(z/SC),seen=new Set(),R=Math.ceil(maxD/SC);
 for(let i=i0-R;i<=i0+R;i++)for(let j=j0-R;j<=j0+R;j++){const L=SEGB.get(skey(i,j));if(!L)continue;for(const eid of L){if(seen.has(eid))continue;seen.add(eid);const e=NAV.edges[eid];if(e.dead||(skip&&skip(e)))continue;
  const A=NAV.nodes[e.a],B=NAV.nodes[e.b],ex=B.x-A.x,ez=B.z-A.z,l2=ex*ex+ez*ez,t=l2>0?clamp(((x-A.x)*ex+(z-A.z)*ez)/l2,0,1):0,px=A.x+ex*t,pz=A.z+ez*t,d=Math.hypot(x-px,z-pz);
  if(d<maxD&&(!best||d<best.d))best={d,eid,t,x:px,z:pz};}}return best;}
// split an edge at t and return the new node
function splitAt(hit){const e=NAV.edges[hit.eid];if(hit.t<.02)return e.a;if(hit.t>.98)return e.b;const A=NAV.nodes[e.a],B=NAV.nodes[e.b];
 const n=node(hit.x,hit.z,mix(A.y,B.y,hit.t),'junction');e.dead=true;const e1=edge(e.a,n,e.layer,e.w,e.kind),e2=edge(n,e.b,e.layer,e.w,e.kind);segAdd(e1);segAdd(e2);return n;}
function polyline(pts,layer,w,kind,tag){const ids=pts.map(p=>node(p[0],p[1],p.length>2?p[2]:null,tag));const es=[];for(let i=1;i<ids.length;i++){const e=edge(ids[i-1],ids[i],layer,w,kind);es.push(e);}return{ids,es};}
// the streets (the highways in full: they run on past the city boxes to the ports)
const streetLines=[];
for(const S0 of PLACE.streets){if(S0.cls==='highway')continue;const L=polyline(S0.pts,S0.cls==='alley'?'pedestrian':'road',S0.w,S0.bridge?'bridge':S0.cls,S0.id);streetLines.push(L);L.es.forEach(segAdd);}
const HU=polyline(VG.HWY_U.map(p=>[p[0],p[1]]),'road',10,'highway','hwy_u');HU.es.forEach(segAdd);
const HL=polyline(VG.HWY_L.map(p=>[p[0],p[1]]),'road',12,'highway','hwy_l');HL.es.forEach(segAdd);
// every street's ends join the street they start from or meet (within 14 m)
for(const L of streetLines){for(const end of [L.ids[0],L.ids[L.ids.length-1]]){const N=NAV.nodes[end];const own=new Set(L.es);
 const hit=nearestSeg(N.x,N.z,14,e=>own.has(e.id));if(hit){const j=splitAt(hit);segAdd(edge(end,j,'road',4,'join'));}}}
// the plazas: a hub joined to every street node near its rim
const HUB={};
for(const Q of PLACE.plazas){const h=node(Q.x,Q.z,null,'plaza:'+Q.id);HUB[Q.id]=h;
 for(const N of NAV.nodes){if(N.id===h)continue;const d=Math.hypot(N.x-Q.x,N.z-Q.z);if(d<Q.r+9&&d>Q.r*.4&&N.tag!=='door')segAdd(edge(h,N.id,'pedestrian',8,'plaza'));}
 const hit=nearestSeg(Q.x,Q.z,Q.r+40,null);if(hit){const j=splitAt(hit);segAdd(edge(h,j,'road',8,'plaza'));}}
// the switchback, from the upper trailhead's plaza to the lower's
const TR=polyline(VG.TRAIL.pts.map(p=>[p[0],p[1],p[2]]),'trail',VG.TRAIL.half*2,'trail','trail');TR.es.forEach(segAdd);
segAdd(edge(HUB.upper_trailhead,TR.ids[0],'trail',6,'trail'));segAdd(edge(TR.ids[TR.ids.length-1],HUB.lower_trailhead,'trail',6,'trail'));
// the highways meet their trailhead plazas
segAdd(edge(HU.ids[HU.ids.length-1],HUB.upper_trailhead,'road',10,'highway'));segAdd(edge(HUB.lower_trailhead,HL.ids[0],'road',12,'highway'));
// the canyon ramps: a cut path down each wall, from the plateau to the highway
const RAMPS=VG.RAMPS.map(Rp=>{const L=polyline(Rp.pts.map(p=>[p[0],p[1],p[2]]),'animal',Rp.half*2,'ramp','ramp:'+Rp.id);L.es.forEach(segAdd);
 const end=L.ids[L.ids.length-1],N=NAV.nodes[end],hit=nearestSeg(N.x,N.z,400,e=>e.kind!=='highway');if(hit){const j=splitAt(hit);segAdd(edge(end,j,'animal',6,'ramp'));}
 return{id:Rp.id,top:L.ids[0],bottom:end};});
// the doors: each place's door joined to the nearest street
for(const P of PLACES){if(P.tags&&P.tags.port)continue;if(P.city==='trail'){const n=VG.trailNear(P.door[0],P.door[1]);const hit=nearestSeg(P.door[0],P.door[1],40,e=>e.layer!=='trail');
  P.node=node(P.door[0],P.door[1],P.y,'door');if(hit){segAdd(edge(P.node,splitAt(hit),'trail',4,'door'));}continue;}
 if(P.id.startsWith('pl_upper_')||P.id.startsWith('pl_lower_')){P.node=HUB[P.id.slice(3)];continue;}
 P.node=node(P.door[0],P.door[1],null,'door');const big=/caravanserai|warehouse|guard_tower|mayor|palace|chapter|temple/.test(P.key||'');
 const hit=nearestSeg(P.door[0],P.door[1],big?90:34,e=>e.kind==='door');
 if(hit)segAdd(edge(P.node,splitAt(hit),'pedestrian',2,'door'));else P.unlinked=true;}
// one network: every piece the joins above missed (a lane whose ends met nothing) is joined to the rest by its
// nearest node, so any door can reach any other (the probe checks it)
(function(){const N=NAV.nodes,comp=new Int32Array(N.length).fill(-1);let nc=0;const size=[];
 for(let i=0;i<N.length;i++){if(comp[i]>=0)continue;const st=[i];comp[i]=nc;let n=0;while(st.length){const u=st.pop();n++;for(const eid of NAV.adj[u]){const e=NAV.edges[eid];if(e.dead)continue;const v=e.a===u?e.b:e.a;if(comp[v]<0){comp[v]=nc;st.push(v);}}}size.push(n);nc++;}
 let main=0;for(let c=1;c<nc;c++)if(size[c]>size[main])main=c;
 const B=new Map(),C=40,key=(x,z)=>Math.floor(x/C)*100003+Math.floor(z/C);
 for(let i=0;i<N.length;i++)if(comp[i]===main){const k=key(N[i].x,N[i].z);if(!B.has(k))B.set(k,[]);B.get(k).push(i);}
 let joined=0;const members={};for(let i=0;i<N.length;i++)if(comp[i]!==main)(members[comp[i]]||(members[comp[i]]=[])).push(i);
 for(const c in members){let best=null;for(const i of members[c]){const q=N[i],ci=Math.floor(q.x/C),cj=Math.floor(q.z/C);
   for(let a=ci-2;a<=ci+2;a++)for(let b=cj-2;b<=cj+2;b++){const L=B.get(a*100003+b);if(!L)continue;for(const j of L){const d=Math.hypot(q.x-N[j].x,q.z-N[j].z);if(d<80&&(!best||d<best.d))best={d,i,j};}}}
  if(best){segAdd(edge(best.i,best.j,'pedestrian',3,'join'));joined++;}}
 NAV.components={count:nc,joined};})();
// the ports: the highways' ends, and for the plateau and floor ports the cross-country grids (below)
PBY.port_west.node=HU.ids[0];PBY.port_east.node=HL.ids[HL.ids.length-1];
// ---------------------------------------------------------------- A* over the graph
function route(from,to,o){o=o||{};const N=NAV.nodes,n=N.length,g=new Float64Array(n).fill(Infinity),prev=new Int32Array(n).fill(-1),done=new Uint8Array(n);
 const heap=[];const push=(id,f)=>{heap.push([f,id]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return top;};
 const H=id=>Math.hypot(N[id].x-N[to].x,N[id].z-N[to].z);g[from]=0;push(from,H(from));let steps=0;
 while(heap.length){const [,u]=pop();if(done[u])continue;done[u]=1;if(u===to)break;if(++steps>(o.budget||400000))break;
  for(const eid of NAV.adj[u]){const e=NAV.edges[eid];if(e.dead)continue;if(o.minW&&e.w<o.minW&&e.kind!=='door'&&e.kind!=='join'&&e.kind!=='plaza')continue;if(o.noLayer&&o.noLayer.indexOf(e.layer)>=0)continue;
   const v=e.a===u?e.b:e.a;const c=g[u]+e.len*(e.layer==='pedestrian'&&o.preferRoad?1.6:1);if(c<g[v]){g[v]=c;prev[v]=u;push(v,c+H(v));}}}
 if(!done[to])return null;const ids=[];for(let v=to;v!==-1;v=prev[v])ids.push(v);ids.reverse();return ids;}
// a node path as a densified polyline [[x,z,y]...] with arc lengths
function pathOf(ids){const P=[];for(const id of ids){const q=NAV.nodes[id];P.push([q.x,q.z,q.y]);}return densify(P,6);}
function densify(P,step){const out=[P[0].slice()];for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/step));
  for(let k=1;k<=n;k++){const t=k/n,x=mix(a[0],b[0],t),z=mix(a[1],b[1],t);let y=mix(a[2],b[2],t);
   // on open ground the path follows the ground; on a bridge or the trail it keeps its own height
   if(!(a[3]||b[3]))y=Math.max(y,terrainH(x,z));out.push([x,z,y]);}}return PATH(out);}
function PATH(pts){const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));return{pts,cum,len:cum[cum.length-1]};}
function joinPaths(list){const pts=[];for(const p of list){for(let i=0;i<p.pts.length;i++){if(pts.length&&i===0){const l=pts[pts.length-1],q=p.pts[0];if(Math.hypot(l[0]-q[0],l[1]-q[1])<.05)continue;}pts.push(p.pts[i]);}}return PATH(pts);}
function reversePath(p){return PATH(p.pts.slice().reverse());}
// position on a path at arc length s: [x, z, y, heading]
function pathAt(P,s,out){out=out||[0,0,0,0];const c=P.cum,n=c.length;if(n<2){const q=P.pts[0];out[0]=q[0];out[1]=q[1];out[2]=q[2];out[3]=0;return out;}
 s=clamp(s,0,P.len);let lo=0,hi=n-1;while(hi-lo>1){const m=(lo+hi)>>1;if(c[m]<=s)lo=m;else hi=m;}const a=P.pts[lo],b=P.pts[hi],t=(s-c[lo])/Math.max(1e-6,c[hi]-c[lo]);
 out[0]=a[0]+(b[0]-a[0])*t;out[1]=a[1]+(b[1]-a[1])*t;out[2]=a[2]+(b[2]-a[2])*t;
 // the heading looks a little ahead, so a corner is turned rather than snapped
 // (past any point within 5 cm of where it looks from, so a doubled point never gives a heading of noise)
 let j=Math.min(n-1,hi+1),i0=lo;while(j<n-1&&Math.hypot(P.pts[j][0]-P.pts[i0][0],P.pts[j][1]-P.pts[i0][1])<.05)j++;
 while(i0>0&&Math.hypot(P.pts[j][0]-P.pts[i0][0],P.pts[j][1]-P.pts[i0][1])<.05)i0--;
 const q=P.pts[j],p0=P.pts[i0];out[3]=Math.atan2(q[0]-p0[0],q[1]-p0[1]);return out;}
// ---------------------------------------------------------------- cross-country: a coarse grid per level
// For the nomads, who come from any edge of the map: A* over 40 m cells, the cost the climb (no cliff, no canyon
// wall: those cells are closed) and, on the abyss floor, a ford's cost for the river.
function grid(box,cell,open){const nx=Math.round((box[1]-box[0])/cell)+1,nz=Math.round((box[3]-box[2])/cell)+1,H=new Float32Array(nx*nz),ok=new Uint8Array(nx*nz),W=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=box[0]+i*cell,z=box[2]+j*cell,k=j*nx+i;H[k]=terrainH(x,z);const o=open(x,z,H[k]);ok[k]=o?1:0;W[k]=o||0;}
 return{box,cell,nx,nz,H,ok,W};}
function gridRoute(G,ax,az,bx,bz){const {nx,nz,box,cell}=G,ix=x=>clamp(Math.round((x-box[0])/cell),0,nx-1),iz=z=>clamp(Math.round((z-box[2])/cell),0,nz-1);
 const s=iz(az)*nx+ix(ax),t=iz(bz)*nx+ix(bx),g=new Float64Array(nx*nz).fill(Infinity),prev=new Int32Array(nx*nz).fill(-1),done=new Uint8Array(nx*nz),heap=[];
 const push=(id,f)=>{heap.push([f,id]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return top;};
 const hx=k=>Math.hypot((k%nx-t%nx),(Math.floor(k/nx)-Math.floor(t/nx)))*cell;g[s]=0;push(s,hx(s));
 while(heap.length){const [,u]=pop();if(done[u])continue;done[u]=1;if(u===t)break;const ui=u%nx,uj=Math.floor(u/nx);
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const vi=ui+di,vj=uj+dj;if(vi<0||vj<0||vi>=nx||vj>=nz)continue;const v=vj*nx+vi;if(!G.ok[v]&&v!==t)continue;
   const d=Math.hypot(di,dj)*cell,climb=Math.abs(G.H[v]-G.H[u])/d;if(climb>.3&&v!==t)continue;const c=g[u]+d*(1+climb*6)/Math.max(.2,G.W[v]||1);if(c<g[v]){g[v]=c;prev[v]=u;push(v,c+hx(v));}}}
 if(!done[t])return null;const out=[];for(let v=t;v!==-1;v=prev[v])out.unshift([box[0]+(v%nx)*cell,box[2]+Math.floor(v/nx)*cell]);
 // smooth the stair-steps a little: keep every other cell, then the exact ends
 const sm=[[ax,az]];for(let i=2;i<out.length-1;i+=2)sm.push(out[i]);sm.push([bx,bz]);return densify(sm.map(p=>[p[0],p[1],terrainH(p[0],p[1])]),8);}
const GRID_UP=grid([-6200,-1500,-2700,2700],40,(x,z,h)=>x<VG.lipX(z)-30&&h>VG.E.PLAT-30?1:0);
const GRID_LO=grid([-200,6400,-3300,3200],40,(x,z,h)=>{if(x<VG.lipX(z)+VG.escW(z,x)+30)return 0;if(h<VG.SALT_Y+1)return 0;const n=VG.rivLNear(x,z);return n&&n.d<VG.RIVL.hw+4?.25:1;});
// ---------------------------------------------------------------- the timetable's groups
const GROUPS=[],LOG=[];
// a group: its route, its leader's distance along it as a timeline over the run, its stops, its members
function makeGroup(o){const G=Object.assign({id:'g'+GROUPS.length,stops:[],members:[],phase:0},o);GROUPS.push(G);return G;}
// build the leader's timeline: travel at v, a dwell at each stop (in arc-length order)
function timetable(G,v){const segs=[];let s=0,t=0;G.stops.sort((a,b)=>a.s-b.s);
 for(const st of G.stops){const d=st.s-s;if(d>.5){segs.push({dur:d/v,from:s,to:st.s,ease:'linear',name:'travel'});t+=d/v;}s=st.s;st.t0=t;segs.push({dur:st.dwell,from:s,to:s,ease:'linear',name:st.kind+':'+(st.place||'')});t+=st.dwell;st.t1=t;}
 const d=G.path.len-s;if(d>.5){segs.push({dur:d/v,from:s,to:G.path.len,ease:'linear',name:'travel'});t+=d/v;}
 G.duration=t;G.v=v;G.copies=Math.ceil(t/T)+1;G.tl=KSCHED.timeline({period:Math.max(T,t+1),segments:segs});G.segments=segs;return G;}
// reserve a slot of a kind at a place for the cycle-time window [a, b]; returns it or null
function cyc(a){return((a%T)+T)%T;}
function clash(busy,a,b){for(const w of busy){for(const k of [-T,0,T]){if(a<w[1]+k&&w[0]+k<b)return true;}}return false;}
function reserve(P,kind,a,b,near){const A=cyc(a),B=A+(b-a);const cands=P.slots.filter(s=>s.kind===kind&&!clash(s.busy,A,B));if(!cands.length)return null;
 if(near)cands.sort((p,q)=>Math.hypot(p.x-near[0],p.z-near[1])-Math.hypot(q.x-near[0],q.z-near[1]));const s=cands[0];s.busy.push([A,B]);return s;}
// a stop where the group disperses to slots: every member gets one (or waits in the queue)
const SHORT={animal:0,person:0};
function disperse(G,st,P){st.slots={};for(const M of G.members){const kind=M.kind==='person'?'person':'animal';
  const a=G.phase+st.t0,b=G.phase+st.t1+M.lag/G.v+60;const s=reserve(P,kind,a,b,P.gate);if(s)st.slots[M.i]=s;else SHORT[kind]++;}}
const MEMBER_SPACING=4.2;
// the members of a caravan: a guard ahead, then each camel with its driver at its shoulder, a guard behind
function caravanMembers(G,n,loadKind,R){let lag=0;const M=[];const add=(o)=>{o.i=M.length;M.push(o);};
 add({kind:'person',role:'guard',lag:0,side:0,look:{robe:R.pick([0x6a4a3a,0x5a5a4a,0x4a3a30]),trim:0xc8a050,head:'turban',spear:1,cloak:1}});lag+=MEMBER_SPACING+1;
 for(let k=0;k<n;k++){add({kind:'camel',lag,side:0,look:{coat:R.pick([0xc4a070,0xb08a5c,0xd2b080,0x9a7450]),load:loadKind,tassels:R.pick([0xb83a2e,0x2a6ab0,0xd8a030])}});
  add({kind:'person',role:loadKind===2?'porter':'driver',lag:lag-.8,side:1.25,pose:'lead',look:{robe:R.pick([0xd8c8a8,0xa88a60,0x7a5a40,0xe0d4c0]),trim:R.pick([0x2f8f8a,0xb83a2e,0xd8a030]),head:R.pick(['turban','hood','cap']),pack:0}});lag+=MEMBER_SPACING;}
 add({kind:'person',role:'guard',lag:lag+1,side:0,look:{robe:R.pick([0x6a4a3a,0x5a5a4a]),trim:0xc8a050,head:'helmet',spear:1,cloak:1}});
 G.members=M;return G;}
// ---- the routes the timetable needs
const RT={};
function r(a,b,o){const k=a+'>'+b+(o&&o.minW?':w':'');if(RT[k]!==undefined)return RT[k];const ids=route(a,b,o);RT[k]=ids?pathOf(ids):null;return RT[k];}
const TH_U=HUB.upper_trailhead,TH_L=HUB.lower_trailhead;
const cityPlaces=(city,re)=>PLACES.filter(P=>P.city===city&&re.test(P.key||'')&&P.node!=null&&!P.unlinked);
const WARE={upper:cityPlaces('upper',/warehouse|silos/),lower:cityPlaces('lower',/warehouse|granary/)};
const CARA={upper:CARAVANSERAIS.filter(P=>P.city==='upper'&&P.node!=null),lower:CARAVANSERAIS.filter(P=>P.city==='lower'&&P.node!=null)};
const TOLL={upper:PLACE.cities.upper.landmarks&&PLACE.cities.upper.landmarks.gate.gate,lower:PLACE.cities.lower.landmarks&&PLACE.cities.lower.landmarks.gate.gate};
// the arc length on a path nearest to a point (for a stop: the toll gate, where a rest stop meets the trail, a caravanserai's door)
function sNear(P,x,z){let best=0,bd=1e9;for(let i=0;i<P.pts.length;i++){const d=Math.hypot(P.pts[i][0]-x,P.pts[i][1]-z);if(d<bd){bd=d;best=P.cum[i];}}return{s:best,d:bd};}
const R0=RS('timetable');
// THROUGH caravans: in at one end, the trail, out at the other; a toll at each gate; a rest at one or two stops
function through(dir,k){const west=r(PBY.port_west.node,TH_U,{minW:4}),down=r(TH_U,TH_L),east=r(TH_L,PBY.port_east.node,{minW:4});
 if(!west||!down||!east)return null;let P=joinPaths([west,down,east]);if(dir<0)P=reversePath(P);
 const G=makeGroup({kind:'caravan',subkind:'through',name:(dir>0?'A caravan bound east, down the trail':'A caravan bound west, up the trail'),faction:'merchants',org:dir>0?'west_caravans':'abyss_caravans',path:P,dir});
 caravanMembers(G,R0.int(3,5),1,R0);
 for(const c of ['upper','lower'])if(TOLL[c]){const q=sNear(P,TOLL[c].x,TOLL[c].z);G.stops.push({s:q.s,kind:'toll',place:c+'_toll',dwell:R0.range(50,110)});}
 // one or two rest stops, the caravan's choice
 const picks=RESTS.slice().sort(()=>R0.next()-.5).slice(0,R0.int(1,2));
 for(const RP of picks){const q=sNear(P,RP.gate[0],RP.gate[1]);G.stops.push({s:q.s,kind:'rest',place:RP.id,dwell:R0.range(420,900),disperse:true});}
 timetable(G,V.camel);G.phase=R0.next()*T;return G;}
// TURNAROUND caravans: in at their level's end, unload at a caravanserai, back the way they came
function turnaround(level,k){const port=level==='upper'?PBY.port_west:PBY.port_east,C=CARA[level];if(!C.length)return null;const CP=C[k%C.length];
 const go=r(port.node,CP.node);if(!go)return null;const P=joinPaths([go,reversePath(go)]);
 const G=makeGroup({kind:'caravan',subkind:'turnaround',name:'A caravan unloading at '+CP.name,faction:'merchants',org:level==='upper'?'west_caravans':'abyss_caravans',path:P,level});
 caravanMembers(G,R0.int(3,5),1,R0);G.stops.push({s:go.len,kind:'caravanserai',place:CP.id,dwell:R0.range(1500,2700),disperse:true,unload:true});
 timetable(G,V.camel);G.phase=R0.next()*T;return G;}
// PORTERS: one porter, one or two camels, from a warehouse on one level to one on the other, and back
function porter(k){const up=WARE.upper,lo=WARE.lower;if(!up.length||!lo.length)return null;const A=up[R0.int(0,up.length-1)],B=lo[R0.int(0,lo.length-1)];
 const a=r(A.node,TH_U),d=r(TH_U,TH_L),b=r(TH_L,B.node);if(!a||!d||!b)return null;const go=joinPaths([a,d,b]),P=joinPaths([go,reversePath(go)]);
 const G=makeGroup({kind:'porter',name:'Porters: '+A.name+' to '+B.name,faction:'verge',org:'porters',path:P,from:A.id,to:B.id});
 const M=[];let lag=0;M.push({i:0,kind:'person',role:'porter',lag:0,side:0,pose:'lead',look:{robe:R0.pick([0xa88a60,0x7a5a40,0xc8b490]),trim:0x6a4a3a,head:'cap',pack:1}});lag+=3.2;
 for(let c=0;c<R0.int(1,2);c++){M.push({i:M.length,kind:'camel',lag,side:0,look:{coat:R0.pick([0xc4a070,0xb08a5c]),load:2,tassels:0x6a4a3a}});lag+=MEMBER_SPACING;}
 G.members=M;
 for(const c of ['upper','lower'])if(TOLL[c]){for(const q of [sNear(P,TOLL[c].x,TOLL[c].z)])G.stops.push({s:q.s,kind:'toll',place:c+'_toll',dwell:R0.range(20,45)});
  // the return passes the same gate: find the second pass
  const s2=P.len-sNear(reversePath(P),TOLL[c].x,TOLL[c].z).s;G.stops.push({s:s2,kind:'toll',place:c+'_toll',dwell:R0.range(20,45)});}
 G.stops.push({s:go.len,kind:'unload',place:B.id,dwell:R0.range(300,600)});
 G.stops.push({s:0.1,kind:'load',place:A.id,dwell:R0.range(200,400)});
 timetable(G,V.porter);G.phase=R0.next()*T;return G;}
// NOMAD squads: from a random point on an edge of their level's map, to a caravanserai, out by another edge
const EDGE={upper:[()=>[R0.range(-5800,-1800),-2600],()=>[R0.range(-5800,-1800),2600],()=>[-6100,R0.range(-2400,2400)]],
 lower:[()=>[R0.range(400,5200),-3200],()=>[R0.range(400,5200),3100],()=>[5800,R0.range(-2600,1800)]]};
function crossTo(level,ex,ez,toNode){// cross-country from an edge point to the road network
 if(level==='upper'){let best=null;for(const Rp of RAMPS){const T0=NAV.nodes[Rp.top];const p=gridRoute(GRID_UP,ex,ez,T0.x,T0.z);if(p&&(!best||p.len<best.p.len))best={p,Rp};}
  if(!best)return null;const rest=r(best.Rp.top,toNode);return rest?joinPaths([best.p,rest]):null;}
 // the floor: to the nearest highway node outside the city
 let bn=null,bd=1e9;for(const id of HL.ids){const N=NAV.nodes[id];if(N.x<1300)continue;const d=Math.hypot(N.x-ex,N.z-ez);if(d<bd){bd=d;bn=id;}}
 const N=NAV.nodes[bn];const p=gridRoute(GRID_LO,ex,ez,N.x,N.z);if(!p)return null;const rest=r(bn,toNode);return rest?joinPaths([p,rest]):null;}
function nomads(level,k){const C=CARA[level];if(!C.length)return null;const CP=C[(k+1)%C.length];
 let e0,e1,inP=null,outP=null;for(let tr=0;tr<4&&(!inP||!outP);tr++){const ei=R0.int(0,2),xi=(ei+R0.int(1,2))%3;e0=EDGE[level][ei]();e1=EDGE[level][xi]();inP=crossTo(level,e0[0],e0[1],CP.node);outP=crossTo(level,e1[0],e1[1],CP.node);}
 if(!inP||!outP)return null;
 const P=joinPaths([inP,reversePath(outP)]);
 const G=makeGroup({kind:'nomads',name:(level==='upper'?'Nomad camel riders':'Nomad lizard riders')+' calling at '+CP.name,faction:'eastern_nomads',org:level==='upper'?'plateau_bands':'abyss_bands',path:P,level,edges:[e0,e1]});
 const n=R0.int(4,7),mount=level==='upper'?'camel':'lizard';let lag=0;const M=[];
 for(let i=0;i<n;i++){const side=(i%2?1:-1)*1.6;const mi=M.length;
  M.push({i:mi,kind:mount,lag,side,look:mount==='camel'?{coat:R0.pick([0xb08a5c,0x8a6a48,0xd2b080]),load:3,tassels:R0.pick([0x2a4a8a,0xb83a2e])}:{skin:R0.pick([0x5a6a3a,0x6a5a3a,0x4a5a4a]),belly:0xb8a878,frill:R0.pick([0xb83a2e,0xd8a030,0x2f8f8a]),saddle:1}});
  M.push({i:M.length,kind:'person',role:'nomad',lag,side,rides:mi,pose:'ride',look:{robe:R0.pick([0x2a2a3a,0x3a2a4a,0x4a3a2a,0x1a3a5a]),trim:R0.pick([0x2a6ab0,0xd8a030]),head:'turban',spear:i===0?1:0,cloak:1}});
  if(i%2)lag+=5.5;}
 G.members=M;G.stops.push({s:inP.len,kind:'caravanserai',place:CP.id,dwell:R0.range(1800,3200),disperse:true});
 timetable(G,V.ride);G.phase=R0.next()*T;return G;}
// GUARD patrols: from the guard tower, a loop through the streets of their level, and home
function patrol(level,k){const tower=PLACES.find(P=>P.city===level&&/guard_tower/.test(P.key||''));if(!tower||tower.node==null)return null;
 const pool=PLACES.filter(P=>P.city===level&&P.node!=null&&!P.unlinked&&/market|shop|tavern|caravanserai|watch|barracks/.test((P.key||'')+(P.tags&&P.tags.kind||'')));if(pool.length<4)return null;
 const RR=RS('patrol:'+level+k);let cur=tower.node;const legs=[];for(let i=0;i<4;i++){const P=pool[RR.int(0,pool.length-1)];const p=r(cur,P.node);if(p){legs.push(p);cur=P.node;}}
 const back=r(cur,tower.node);if(back)legs.push(back);if(!legs.length)return null;const P=joinPaths(legs);
 const G=makeGroup({kind:'patrol',name:'A patrol of the '+(level==='upper'?'Upper':'Lower')+' Verge guard',faction:level==='upper'?'iziz':'yuni',org:level+'_guard',path:P,level});
 const M=[];const n=RR.int(3,4);for(let i=0;i<n;i++)M.push({i,kind:'person',role:'guard',lag:Math.floor(i/2)*2.4,side:(i%2?1:-1)*.7,look:level==='upper'?{robe:0x7a2a1e,trim:0xe07a2a,head:'helmet',spear:1,cloak:0}:{robe:0x2f6f7a,trim:0xd4a537,head:'helmet',spear:1,cloak:0}});
 G.members=M;G.stops.push({s:P.len-.5,kind:'tower',place:tower.id,dwell:RR.range(300,900)});timetable(G,V.patrol);G.phase=k*T/3+RR.next()*600;return G;}
// ---- the timetable: built in a fixed order (the slots go to whoever asks first)
const want={through:8,turnaround:8,porters:10,nomads:4,patrols:6};
const FAIL=[];const mk=(name,fn)=>{try{if(!fn())FAIL.push(name);}catch(e){FAIL.push(name+': '+e.message);}};
for(let k=0;k<want.through;k++)mk('through '+k,()=>through(k%2?-1:1,k));
for(let k=0;k<want.turnaround;k++)mk('turnaround '+k,()=>turnaround(k%2?'lower':'upper',k>>1));
for(let k=0;k<want.porters;k++)mk('porter '+k,()=>porter(k));
for(let k=0;k<want.nomads;k++)mk('nomads '+k,()=>nomads(k%2?'lower':'upper',k>>1));
for(let k=0;k<want.patrols;k++)mk('patrol '+k,()=>patrol(k%2?'lower':'upper',k>>1));
// reserve the slots, in the order of each stop's start in the cycle
const STOPS=[];for(const G of GROUPS)for(const st of G.stops)if(st.disperse)STOPS.push([G,st]);
STOPS.sort((p,q)=>cyc(p[0].phase+p[1].t0)-cyc(q[0].phase+q[1].t0));
for(const [G,st] of STOPS){const P=PBY['pl_'+st.place]||PBY[st.place];if(P)disperse(G,st,P);}
// ---------------------------------------------------------------- the citizens (rambling pedestrians)
// One per household member who is out: their home is a dwelling, their work the place their role asks for; each walk
// is decided when the last ends (at the hour it is then) and walked as a function of time.
const CITIZENS=[];
(function(){const RC=RS('citizens');
 for(const city of ['upper','lower']){const homes=PLACES.filter(P=>P.city===city&&P.activities.indexOf('SLEEP')>=0&&P.node!=null&&!P.unlinked&&!/caravanserai/.test(P.key||''));
  const n=Math.min(city==='upper'?380:340,homes.length*2);
  const roles=city==='upper'?[['shopkeeper',3],['artisan',3],['labourer',3],['child',2],['elder',1.5],['innkeeper',.6],['clerk',.6],['toll_keeper',.2]]:[['shopkeeper',3],['artisan',2.5],['labourer',3],['child',2.2],['elder',1.5],['innkeeper',.6],['clerk',.5],['historian',.5],['toll_keeper',.2]];
  const sum=roles.reduce((a,b)=>a+b[1],0);
  for(let i=0;i<n;i++){let u=RC.next()*sum,role=roles[0][0];for(const q of roles){u-=q[1];if(u<=0){role=q[0];break;}}
   const home=homes[RC.int(0,homes.length-1)];
   CITIZENS.push({id:'c'+CITIZENS.length,city,role,faction:city==='upper'?'iziz':'yuni',org:city==='upper'?'upper_town':(role==='historian'?'historians':'lower_town'),home:home.id,
    seed:RC.u32(),look:{robe:city==='upper'?RC.pick([0xe07a2a,0xc4641e,0xd8c8a8,0x9a6a42,0x2f8f8a,0xe9cb8c,0x8a4a2a]):RC.pick([0xe9c3b4,0xc3dcc6,0xbdd2e2,0xd3c2dc,0xf2c230,0x2fa59a,0xe26d8e,0xf3ecdf]),
     trim:RC.pick([0x6a3a20,0x2a4a6a,0xd8a030,0xb83a2e]),skin:RC.pick([0x8a5a3a,0xa06a48,0x6a4a30,0xb07a58]),head:role==='historian'?'hood':RC.pick(['bare','turban','cap','hood']),pack:role==='labourer'?1:0},
    trip:null,state:null});}}})();
// a citizen's next walk: the activity its role asks for at this hour, a place that offers it (near, weighted), a path
const PLACES_BY_ACT={};for(const P of PLACES){if(P.node==null||P.unlinked)continue;for(const a of P.activities){const k=P.city+':'+a;(PLACES_BY_ACT[k]||(PLACES_BY_ACT[k]=[])).push(P);}}
function decide(C,t,hour){const R=KRAND.stream(KRAND.hash(C.seed,C.n=(C.n||0)+1));const role=ROLES[C.role];let act=role.sched[Math.floor(hour)%24];
 if(act==='SLEEP'&&R.next()<.15)act='SOCIALIZE';           // a few are out late
 const from=C.at||PBY[C.home];let to=null;
 if(act==='SLEEP'||act==='REST')to=PBY[C.home];
 else{const pool=PLACES_BY_ACT[C.city+':'+act]||PLACES_BY_ACT[C.city+':SOCIALIZE']||[];if(pool.length){let best=null,bs=-1;for(let k=0;k<5;k++){const P=pool[R.int(0,pool.length-1)];const sc=R.next()/(1+Math.hypot(P.x-from.x,P.z-from.z)/400);if(sc>bs){bs=sc;best=P;}}to=best;}}
 if(!to||to===from){C.trip={t0:t,t1:t+R.range(60,240),dwell:true,at:from,act};return C.trip;}
 const ids=route(from.node,to.node,{budget:120000});
 if(!ids){C.trip={t0:t,t1:t+R.range(60,240),dwell:true,at:from,act};return C.trip;}
 const path=pathOf(ids),v=V.walk*R.range(.85,1.15),side=R.range(-1.1,1.1);
 C.trip={t0:t,t1:t+path.len/v,path,v,side,act,from:from.id,to:to.id,dwellAfter:R.range(40,320)};C.at=to;
 LOG.push([+t.toFixed(1),C.id,'walk',from.id,to.id,act]);if(LOG.length>4000)LOG.splice(0,1000);
 return C.trip;}
// ---------------------------------------------------------------- a group member's pose: a FUNCTION OF TIME
// From the exported data alone (the path, the timeline, the stops and their slots, the member's lag and side), so a
// port reproduces it: godot/krator/verge_sim.gd is the same function, tested against SIM.golden() (tests/verge).
const STRIDE={person:1.45,camel:2.8,lizard:1.9},_p=[0,0,0,0],_q=[0,0,0,0];
for(const G of GROUPS)for(const st of G.stops)if(st.disperse){const P=PBY['pl_'+st.place]||PBY[st.place],E=P.gate||P.door;st.gate=[E[0],E[1]];st.gateY=terrainH(E[0],E[1]);}
function slopeAt(P,s){pathAt(P,s-1.2,_q);const y0=_q[2];pathAt(P,s+1.2,_q);return Math.atan2(_q[2]-y0,2.4);}
// a member's pose at run time tau: [x, y, z, yaw, speed, phase, pitch, visible, pose]
function walkLeg(pts,t,out){let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);let d=t,i=1;
 for(;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(d<=l||i===pts.length-1){const a=pts[i-1],b=pts[i],u=clamp(d/Math.max(1e-6,l),0,1);
   out.x=mix(a[0],b[0],u);out.z=mix(a[1],b[1],u);out.y=mix(a[2],b[2],u);out.yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);return L;}d-=l;}return L;}
function memberPose(G,M,tau,o){o.vis=false;o.dispersed=false;o.pose=M.pose||'walk';o.pitch=0;o.load=null;
 if(tau<0||tau>G.duration)return o;
 // a dispersing stop it is in the middle of?
 for(const st of G.stops){if(!st.disperse||!st.slots)continue;const S=st.slots[M.i];if(!S)continue;
  const a0=st.t0+M.i*2.2,b1=st.t1;if(tau<a0||tau>b1)continue;
  const P=PBY['pl_'+st.place]||PBY[st.place],E=P.gate||P.door;pathAt(G.path,st.s-M.lag,_p);
  const q=[_p[0],_p[1],_p[2]],e=[E[0],E[1],st.gateY],sl=[S.x,S.z,S.y],vw=M.kind==='person'?1.25:1.1;
  const pts=[q,e,sl];let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const dur=L/vw;
  if(2*dur>b1-a0)break;                                    // no time to go and come back: it waits in the queue
  o.vis=true;o.dispersed=true;o.pose=M.kind==='person'?'stand':M.kind==='camel'?'couch':'rest';
  if(tau<a0+dur){walkLeg(pts,(tau-a0)*vw,o);o.speed=vw;o.phase=((tau-a0)*vw/STRIDE[M.kind])%1;o.pose='walk';}
  else if(tau>b1-dur){walkLeg(pts.slice().reverse(),(tau-(b1-dur))*vw,o);o.speed=vw;o.phase=((tau-(b1-dur))*vw/STRIDE[M.kind])%1;o.pose='walk';}
  else{o.x=S.x;o.y=S.y;o.z=S.z;o.yaw=S.ry;o.speed=0;o.phase=0;}
  if(st.unload&&M.kind==='camel'&&tau>a0+dur)o.load=0;
  return o;}
 // following the leader
 const sL=G.tl.at(tau).value,s=sL-M.lag;if(s<0||s>G.path.len)return o;
 pathAt(G.path,s,_p);const h=_p[3];o.x=_p[0]+Math.cos(h)*M.side;o.z=_p[1]-Math.sin(h)*M.side;o.y=_p[2];
 o.yaw=h;o.vis=true;
 const seg=G.tl.at(tau);o.speed=seg.name==='travel'?G.v:0;o.phase=(s/STRIDE[M.kind==='person'&&M.rides!=null?'person':M.kind])%1;o.pitch=M.kind==='person'?0:slopeAt(G.path,s);
 for(const st of G.stops)if(st.unload&&M.kind==='camel'&&tau>st.t0)o.load=0;
 return o;}
// the trace a port is tested against: every member of every group at the given motion times
function golden(times){const out=[],o={};for(const t of times)for(const G of GROUPS){const base=((t-G.phase)%T+T)%T;
  for(let c=0;c<G.copies;c++){const tau=base+c*T;for(const M of G.members){memberPose(G,M,tau,o);
   out.push([t,G.id,c,M.i,o.vis?1:0,o.vis?+o.x.toFixed(3):0,o.vis?+o.y.toFixed(3):0,o.vis?+o.z.toFixed(3):0,o.vis?+o.yaw.toFixed(4):0]);}}}return out;}
// ---------------------------------------------------------------- the checks the probe runs (data only)
function census(){const k={};for(const G of GROUPS)k[G.kind+(G.subkind?':'+G.subkind:'')]=(k[G.kind+(G.subkind?':'+G.subkind:'')]||0)+1;return k;}
window._sim={fail:FAIL,warehouses:{upper:WARE.upper.length,lower:WARE.lower.length},caravanserai:{upper:CARA.upper.length,lower:CARA.lower.length},toll:{upper:!!TOLL.upper,lower:!!TOLL.lower},groups:census(),members:GROUPS.reduce((a,G)=>a+G.members.length,0),citizens:CITIZENS.length,places:PLACES.length,nav:{nodes:NAV.nodes.length,edges:NAV.edges.filter(e=>!e.dead).length,components:NAV.components},
 slotShort:SHORT,unlinkedDoors:PLACES.filter(P=>P.unlinked).length,caravanserais:CARAVANSERAIS.map(P=>({id:P.id,slots:P.slots.length,yard:!!P.yard})),rests:RESTS.length};
// ---------------------------------------------------------------- the export (krator-sim: core/simulation/PLAN.md)
function exportSim(){return{format:'krator-sim',version:1,build:'verge',convention:{axes:'x east, z south, y up, metres',time:'motion seconds; the timetable repeats every T',colour:'sRGB hex'},
 T,speeds:V,factions:FACTIONS,activities:ACTIVITIES,roles:ROLES,
 places:PLACES.map(P=>({id:P.id,name:P.name,city:P.city,building:P.building||null,key:P.key||null,x:+P.x.toFixed(2),z:+P.z.toFixed(2),y:+(P.y||0).toFixed(2),door:P.door,node:P.node,activities:P.activities,capacity:P.capacity,faction:P.faction||null,tags:P.tags,
  slots:P.slots.map(s=>({id:s.id,kind:s.kind,x:+s.x.toFixed(2),z:+s.z.toFixed(2),y:+s.y.toFixed(2),ry:+s.ry.toFixed(4),busy:s.busy.map(w=>[+w[0].toFixed(1),+w[1].toFixed(1)])}))})),
 nav:{nodes:NAV.nodes,edges:NAV.edges.filter(e=>!e.dead)},
 groups:GROUPS.map(G=>({id:G.id,kind:G.kind,subkind:G.subkind||null,name:G.name,faction:G.faction,org:G.org,phase:+G.phase.toFixed(2),duration:+G.duration.toFixed(2),speed:G.v,
  path:G.path.pts.map(p=>[+p[0].toFixed(2),+p[1].toFixed(2),+p[2].toFixed(2)]),timeline:G.tl.export(),
  stops:G.stops.map(s=>({s:+s.s.toFixed(2),kind:s.kind,place:s.place,t0:+s.t0.toFixed(2),t1:+s.t1.toFixed(2),disperse:!!s.disperse,unload:!!s.unload,gate:s.gate||null,gateY:s.gateY!=null?+s.gateY.toFixed(3):null,slots:s.slots?Object.keys(s.slots).reduce((a,k)=>(a[k]=s.slots[k].id,a),{}):null})),
  members:G.members.map(M=>({i:M.i,kind:M.kind,role:M.role||null,lag:M.lag,side:M.side,rides:M.rides!=null?M.rides:null,pose:M.pose||null,look:M.look}))})),
 citizens:CITIZENS.map(C=>({id:C.id,city:C.city,role:C.role,faction:C.faction,org:C.org,home:C.home,seed:C.seed,look:C.look})),log:LOG.slice()};}
return{memberPose,golden,STRIDE,T,V,FACTIONS,ROLES,ACTIVITIES,PLACES,PBY,NAV,route,pathOf,pathAt,PATH,densify,GROUPS,CITIZENS,decide,RESTS,CARAVANSERAIS,RAMPS,LOG,export:exportSim,MEMBER_SPACING};
})();
