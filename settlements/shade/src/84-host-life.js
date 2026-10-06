// ================================================================= HOST — the life layer (data + navigation)
// No one walks yet. What is here is the part every later pass stands on, declared into core/simulation (SIM,
// PLAN.md Phase 1, Shade its data prototype): the factions and orgs, the roles with hour-by-hour schedules of
// ACTIVITIES (never coordinates) and the world events are world/*.json (SHADE_WORLD_JSON, 83, made by build.py);
// the places that offer those activities are 44-host-layout's PLACES; the walkable grid below is read from the
// terrain, searched with A*, and registered as SIM's 'pedestrian' layer. Every route is FOUND on the ground, not
// typed: if the switchback stops being walkable the convoy's exit fails and the probe says so.
//
// Rules of the data (README: never encode a world rule only in the visuals):
//   a role asks for an activity at an hour; a place offers activities to `cap` people at once (its capacity, shared
//   by them all); the nearest place offering an activity is resolved by SIM; an event is a list of activities
//   between two ports (edges of the settlement), not a path.
const LIFE=(function(){
// world time from core/clock, held at noon: Shade has no running clock, and SIM is never stepped while no one walks
const CLOCK=KCLOCK.make({hour:12});
SIM.init({seed:20261005,hour:()=>CLOCK.hour,day:()=>CLOCK.day,t:()=>CLOCK.t,err:m=>reportErr('sim: '+m)});

// ---------------------------------------------------------------- the walkable grid
// 1.5 m cells over the settlement and its approaches. A cell is blocked under
// deep water (the pool); the streams can be forded at a cost. A step is allowed
// if its grade is at most 0.36 (20 degrees): every wall of the basin and the
// canyon is too steep, so the switchback is the only way up by construction,
// and the probe checks that it stays so.
const NAV={x0:-170,z0:-285,x1:450,z1:170,c:1.5,maxGrade:.36};
NAV.nx=Math.round((NAV.x1-NAV.x0)/NAV.c)+1;NAV.nz=Math.round((NAV.z1-NAV.z0)/NAV.c)+1;
const N=NAV.nx*NAV.nz,H=new Float32Array(N),BLK=new Uint8Array(N),WET=new Uint8Array(N);
for(let j=0;j<NAV.nz;j++)for(let i=0;i<NAV.nx;i++){const x=NAV.x0+i*NAV.c,z=NAV.z0+j*NAV.c,k=j*NAV.nx+i,h=terrainH(x,z),dw=waterH(x,z)-h;
 H[k]=h;if(dw>.9)BLK[k]=1;else if(dw>0)WET[k]=1;
 if(BIO.carve.rockAt(x,h+1,z))BLK[k]=1;}   // the floor a carve patch's recess runs on behind the void's walls is inside its rock
// Building footprints are declared in 44 before this grid is made. A plan may
// contain several navigation shadows (the Khan's arcades) while its measured
// building footprint remains one polygon for containment and overlap checks.
for(const B of NAV_BLOCK)for(const P of (B.navPolys||[B.poly])){const xs=P.map(p=>p[0]),zs=P.map(p=>p[1]);
 const i0=Math.max(0,Math.floor((Math.min(...xs)-NAV.x0)/NAV.c)),i1=Math.min(NAV.nx-1,Math.ceil((Math.max(...xs)-NAV.x0)/NAV.c));
 const j0=Math.max(0,Math.floor((Math.min(...zs)-NAV.z0)/NAV.c)),j1=Math.min(NAV.nz-1,Math.ceil((Math.max(...zs)-NAV.z0)/NAV.c));
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=NAV.x0+i*NAV.c,z=NAV.z0+j*NAV.c;if(polyHas(P,x,z))BLK[j*NAV.nx+i]=1;}}
// Restore each doorway's short approach so the blocked building footprints do
// not seal their own entrances. The route still stops at the room threshold.
for(const B of NAV_BLOCK)for(const P of (B.navOpenPolys||[])){const xs=P.map(p=>p[0]),zs=P.map(p=>p[1]);
 const i0=Math.max(0,Math.floor((Math.min(...xs)-NAV.x0)/NAV.c)),i1=Math.min(NAV.nx-1,Math.ceil((Math.max(...xs)-NAV.x0)/NAV.c));
 const j0=Math.max(0,Math.floor((Math.min(...zs)-NAV.z0)/NAV.c)),j1=Math.min(NAV.nz-1,Math.ceil((Math.max(...zs)-NAV.z0)/NAV.c));
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=NAV.x0+i*NAV.c,z=NAV.z0+j*NAV.c;if(polyHas(P,x,z))BLK[j*NAV.nx+i]=0;}}
const cellOf=(x,z)=>{const i=Math.round((x-NAV.x0)/NAV.c),j=Math.round((z-NAV.z0)/NAV.c);return i<0||j<0||i>=NAV.nx||j>=NAV.nz?-1:j*NAV.nx+i;};
const xzOf=k=>[NAV.x0+(k%NAV.nx)*NAV.c,NAV.z0+Math.floor(k/NAV.nx)*NAV.c];
const DIRS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function step(k,d,block){const i=k%NAV.nx+DIRS[d][0],j=Math.floor(k/NAV.nx)+DIRS[d][1];if(i<0||j<0||i>=NAV.nx||j>=NAV.nz)return -1;
 const q=j*NAV.nx+i;if(BLK[q]||(block&&block[q]))return -1;const len=d<4?NAV.c:NAV.c*Math.SQRT2;if(Math.abs(H[q]-H[k])/len>NAV.maxGrade)return -1;return q;}
function nearestOpen(x,z,r){const k0=cellOf(x,z);if(k0<0)return -1;if(!BLK[k0])return k0;const R=Math.ceil((r||6)/NAV.c);let best=-1,bd=1e9;
 for(let dj=-R;dj<=R;dj++)for(let di=-R;di<=R;di++){const q=k0+dj*NAV.nx+di;if(q<0||q>=N||BLK[q])continue;const d=di*di+dj*dj;if(d<bd){bd=d;best=q;}}return best;}
// A* (binary heap); returns {pts:[[x,y,z]...], len} or null
function route(ax,az,bx,bz,block){const s=nearestOpen(ax,az),t=nearestOpen(bx,bz);if(s<0||t<0)return null;
 const g=new Float32Array(N).fill(Infinity),from=new Int32Array(N).fill(-1),closed=new Uint8Array(N);const [tx,tz]=xzOf(t);
 const heap=[],hf=[];const push=(k,f)=>{heap.push(k);hf.push(f);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(hf[p]<=hf[i])break;[heap[p],heap[i]]=[heap[i],heap[p]];[hf[p],hf[i]]=[hf[i],hf[p]];i=p;}};
 const pop=()=>{const top=heap[0];const lk=heap.pop(),lf=hf.pop();if(heap.length){heap[0]=lk;hf[0]=lf;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<heap.length&&hf[l]<hf[m])m=l;if(r<heap.length&&hf[r]<hf[m])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];[hf[m],hf[i]]=[hf[i],hf[m]];i=m;}}return top;};
 g[s]=0;push(s,0);let found=false;
 while(heap.length){const k=pop();if(closed[k])continue;closed[k]=1;if(k===t){found=true;break;}
  for(let d=0;d<8;d++){const q=step(k,d,block);if(q<0||closed[q])continue;const len=d<4?NAV.c:NAV.c*Math.SQRT2,c=g[k]+len*(WET[q]?3:1)+Math.abs(H[q]-H[k])*2;
   if(c<g[q]){g[q]=c;from[q]=k;const [qx,qz]=xzOf(q);push(q,c+Math.hypot(qx-tx,qz-tz));}}}
 if(!found)return null;const pts=[];let len=0;for(let k=t;k>=0;k=from[k]){const [x,z]=xzOf(k);pts.push([x,H[k],z]);if(k===s)break;}pts.reverse();
 for(let i=1;i<pts.length;i++)len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][2]-pts[i-1][2]);return{pts,len};}
// everything reachable from a point (a flood over the same steps)
function reach(x,z,block){const s=nearestOpen(x,z),seen=new Uint8Array(N);if(s<0)return seen;const q=[s];seen[s]=1;
 while(q.length){const k=q.pop();for(let d=0;d<8;d++){const r=step(k,d,block);if(r>=0&&!seen[r]){seen[r]=1;q.push(r);}}}return seen;}
// ---------------------------------------------------------------- the world in SIM
// The grid answers SIM's route() as its 'pedestrian' layer (a grid layer: core/simulation/SCHEMA.md, Navigation).
// A search is kept per pair of cells (A* is deterministic, so a kept route is the one a new search would find): a
// thousand people deciding at once ask for a few hundred pairs, their homes and the places' doors.
const ROUTE_CACHE=new Map();
SIM.nav.layer('pedestrian',{route:(ax,az,bx,bz,o)=>{if(o&&o.block)return route(ax,az,bx,bz,o.block);
 const key=nearestOpen(ax,az)+'|'+nearestOpen(bx,bz);if(!ROUTE_CACHE.has(key))ROUTE_CACHE.set(key,route(ax,az,bx,bz));return ROUTE_CACHE.get(key);}});
// The places, from 44: each walked to at its polygon's centre; its capacity is the people it holds at once over all
// its activities (SIM's cap), and any one activity may fill it.
for(const p of PLACES){const c=polyCentre(p.poly),y=terrainH(c[0],c[1]),acts={};for(const a of p.activities)acts[a]=p.capacity;
 SIM.place({id:p.id,name:p.name,kind:p.kind,x:c[0],z:c[1],y,door:{x:c[0],y,z:c[1]},activities:acts,cap:p.capacity,tags:p.tags});}
for(const n in PORTS)SIM.port({id:n,name:PORTS[n].name,x:PORTS[n].x,z:PORTS[n].z});
const loaded=SIM.load(SHADE_WORLD_JSON);
// the residents: each role's count dealt round-robin over its homes (place ids), as Shade has always dealt them
const population=SIM.populate({prefix:'p'});
const place=id=>SIM.get('place',id),KH=place('khan').door;
SIM.REF={layer:'pedestrian',x:KH.x,z:KH.z,ports:true};   // every place and port must be reachable from the Khan
const problems=SIM.check();
// the nearest place offering an activity (straight-line; the route then proves it reachable)
const offering=(act,x,z)=>SIM.placesFor(act,null,null,{near:[x,z],ignoreSlots:true})[0]||null;
const walk=(a,b)=>SIM.nav.route('pedestrian',{x:a.x,z:a.z},{x:b.x,z:b.z});

// ---------------------------------------------------------------- Shade's own audits, added to SIM.audit()
// SIM.audit counts the people, places and roles and finds unknown activities, the hourly capacity shortfalls and
// what the Khan cannot reach. Shade adds: the switchback is the only way up, the convoy routed on the ground, and a
// daily commute per role. The routes found are drawn by 86 (ROUTES).
const ROUTES=[];
SIM.audits.push(function(OUT){ROUTES.length=0;
 // the switchback is the only way up: block its corridor and the gatehouse must fall out of reach
 {const blk=new Uint8Array(N);let cells=0;for(let k=0;k<N;k++){const [x,z]=xzOf(k);if(x<SWB.x0-12||x>SWB.x1+12||z>SWB.zEdge+14||z<SWB.zEdge-SWB.W-16)continue;const n=swNear(x,z);if(n&&n.d<SWB.bank+1.5){blk[k]=1;cells++;}}
  const G=place('switchback_gate').door,kg=nearestOpen(G.x,G.z),R0=reach(KH.x,KH.z),R1=reach(KH.x,KH.z,blk);
  OUT.onlyWayUp={withSwitchback:!!(kg>=0&&R0[kg]),withoutSwitchback:!!(kg>=0&&R1[kg]),blockedCells:cells};}
 // the events: their legs resolved to places and routed on the ground
 OUT.events={};
 for(const E of SIM.all('event')){const P0=SIM.get('port',E.from[0]);let x=P0.x,z=P0.z;const legs=[],missing=[];
  const go=(to,label)=>{const r=walk({x,z},to);if(!r){missing.push(label);return;}legs.push({to:label,len:Math.round(r.len)});ROUTES.push({key:E.id,label:E.name+': '+label,pts:r.pts,color:0xff5a3c});x=to.x;z=to.z;};
  for(const s of E.legs||[]){const p=offering(s.activity,x,z);if(!p){missing.push(s.activity+' (nowhere)');continue;}go(p.door,s.activity+' at '+p.id);}
  go(SIM.get('port',E.to[0]),'exit '+E.to[0]);
  // does the exit leg climb the switchback? (the share of its length within 3 m of the trail)
  const last=ROUTES[ROUTES.length-1];let on=0,tot=0;if(last&&last.key===E.id)for(let i=1;i<last.pts.length;i++){const a=last.pts[i-1],b=last.pts[i],l=Math.hypot(b[0]-a[0],b[2]-a[2]);tot+=l;const n=swNear((a[0]+b[0])/2,(a[2]+b[2])/2);if(n&&n.d<3)on+=l;}
  OUT.events[E.id]={legs,missing,exitOnSwitchback_m:Math.round(on)};}
 // a daily commute per role: home to each place its schedule sends it, and back
 OUT.routes={};
 for(const R of SIM.all('role')){if(R.transient||!R.homes)continue;const home=place(R.homes[0]),h=home.door,seen={};let bad=0,len=0;
  for(const a of R.sched){if(seen[a])continue;seen[a]=1;if(SIM.offers(home,a))continue;const p=offering(a,h.x,h.z);if(!p){bad++;continue;}const r=walk(h,p.door);if(!r)bad++;else{len+=r.len;if(R.id==='herder'||R.id==='guard_day'||R.id==='farmer')ROUTES.push({key:'commute',label:R.id+': '+home.id+' to '+p.id,pts:r.pts,color:0x3cc8ff});}}
  OUT.routes[R.id]={unrouted:bad,metres:Math.round(len)};}});

// ---------------------------------------------------------------- the checks the probe reads (window._life)
// SIM's report (window._sim.audit() gives it afresh) in the shape the probe has always read
const A=SIM.audit();
const OUT={places:A.places,people:A.people,jobs:SIM.all('role').filter(R=>!R.transient).length,activities:SIM.all('activity').length,unknownActivities:A.unknownActivities,
 unreachable:A.unroutable,capacity:A.capacity,routes:A.routes,events:A.events,onlyWayUp:A.onlyWayUp};
NAV.blocked=BLK;
// SIM stepped a world minute at a time (3 s of motion each: the 72-minute day). The probe runs it; nothing steps it
// per frame until people are drawn (KNOWN_ISSUES.md). The hour is set mid-minute so SIM.minute() floors exactly.
function run(minutes){let M=SIM.minute();for(let m=0;m<minutes;m++){M++;CLOCK.day=Math.floor(M/1440);CLOCK.hour=(M%1440+.5)/60;CLOCK.t+=CLOCK.dayLength/1440;SIM.step();}}
return{NAV,route,reach,offering,ROUTES,OUT,loaded,population,problems,CLOCK,run,ROUTE_CACHE};})();
window._life=LIFE.OUT;
