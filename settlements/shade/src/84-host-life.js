// ================================================================= HOST — the life layer (data + navigation)
// No one walks yet. What is here is the part every later pass stands on:
// factions, jobs, hour-by-hour schedules of ACTIVITIES (never coordinates),
// the places that offer those activities (44-host-layout, PLACES), the world
// events, and a walkable grid read from the terrain with A* over it. Every
// route below is FOUND on the ground, not typed: if the switchback stops being
// walkable the convoy's exit fails and the probe says so.
//
// Rules of the data (README: never encode a world rule only in the visuals):
//   a job asks for an activity at an hour; a place offers activities and a capacity;
//   the resolver picks the nearest reachable place offering it; an event is a list
//   of activities between two ports (edges of the settlement), not a path.
const LIFE=(function(){
const ACTIVITIES=['SLEEP','EAT','REST','FARM','HERD','TRADE','CRAFT','SOCIALIZE','PLAY','WORSHIP','PATROL','FETCH_WATER','WATER_CAMELS'];
const FACTIONS={
 eastern_nomads:{name:'Eastern Nomads',subs:{
  shade_clans:{name:'The Shade clans',resident:true},
  aquifer_wardens:{name:'Wardens of the Deep Aquifer',resident:true},
  canyon_guard:{name:'The canyon guard',resident:true},
  caravaneers:{name:'Visiting caravaneers',resident:false},
  dune_raiders:{name:'Dune raiders',resident:false,hostile:'when provoked'}}}};
// a schedule is a list of [hour, activity] spans; sched() expands it to 24 hours
function sched(spans){const out=new Array(24);let a=spans[spans.length-1][1];
 for(let h=0;h<24;h++){for(const s of spans)if(s[0]===h)a=s[1];out[h]=a;}return out;}
const JOBS={
 farmer:      {sub:'shade_clans',count:300,homes:['petra','pueblo','tents','cliff-nw','cliff-se'],sched:sched([[0,'SLEEP'],[5,'FARM'],[11,'REST'],[15,'FARM'],[19,'EAT'],[20,'SOCIALIZE'],[22,'SLEEP']])},
 herder:      {sub:'shade_clans',count:90, homes:['tents'],sched:sched([[0,'SLEEP'],[5,'HERD'],[12,'REST'],[14,'HERD'],[19,'EAT'],[21,'SLEEP']])},
 shopkeeper:  {sub:'shade_clans',count:90, homes:['pueblo','petra'],sched:sched([[0,'SLEEP'],[6,'TRADE'],[12,'EAT'],[13,'REST'],[16,'TRADE'],[20,'SOCIALIZE'],[22,'SLEEP']])},
 artisan:     {sub:'shade_clans',count:140,homes:['petra','pueblo','cliff-sw','cliff-se'],sched:sched([[0,'SLEEP'],[6,'CRAFT'],[12,'EAT'],[13,'CRAFT'],[18,'SOCIALIZE'],[21,'SLEEP']])},
 water_carrier:{sub:'shade_clans',count:40,homes:['pueblo','tents'],sched:sched([[0,'SLEEP'],[5,'FETCH_WATER'],[10,'REST'],[16,'FETCH_WATER'],[19,'EAT'],[21,'SLEEP']])},
 child:       {sub:'shade_clans',count:170,homes:['petra','pueblo','tents','cliff-nw','cliff-se'],sched:sched([[0,'SLEEP'],[7,'EAT'],[8,'PLAY'],[12,'EAT'],[13,'PLAY'],[19,'EAT'],[20,'SLEEP']])},
 elder:       {sub:'shade_clans',count:80, homes:['petra','pueblo','cliff-se','cliff-en'],sched:sched([[0,'SLEEP'],[6,'WORSHIP'],[8,'SOCIALIZE'],[12,'REST'],[16,'SOCIALIZE'],[19,'EAT'],[21,'SLEEP']])},
 priest:      {sub:'aquifer_wardens',count:6,homes:['shrine'],sched:sched([[0,'SLEEP'],[4,'WORSHIP'],[12,'TRADE'],[14,'REST'],[18,'WORSHIP'],[21,'SLEEP']])},
 acolyte:     {sub:'aquifer_wardens',count:24,homes:['shrine'],sched:sched([[0,'SLEEP'],[4,'WORSHIP'],[8,'FETCH_WATER'],[10,'CRAFT'],[18,'WORSHIP'],[21,'SLEEP']])},
 guard_day:   {sub:'canyon_guard',count:30,homes:['pueblo'],sched:sched([[0,'SLEEP'],[6,'PATROL'],[18,'EAT'],[19,'SOCIALIZE'],[22,'SLEEP']])},
 guard_night: {sub:'canyon_guard',count:30,homes:['tents'],sched:sched([[0,'PATROL'],[6,'EAT'],[7,'SLEEP'],[15,'REST'],[17,'EAT'],[18,'PATROL']])},
 caravaneer:  {sub:'caravaneers',count:60,homes:['khan'],transient:true,sched:sched([[0,'SLEEP'],[6,'WATER_CAMELS'],[7,'TRADE'],[12,'EAT'],[13,'REST'],[16,'TRADE'],[20,'EAT'],[21,'SOCIALIZE'],[23,'SLEEP']])},
};
// the residents: one record each, deterministic, homes dealt round-robin
const PEOPLE=[];(function(){let n=0;for(const j in JOBS){const J=JOBS[j];for(let i=0;i<J.count;i++)PEOPLE.push({id:'p'+(n++),job:j,faction:'eastern_nomads',sub:J.sub,home:J.homes[i%J.homes.length],transient:!!J.transient});}})();
const EVENTS=[
 {id:'raider_convoy',name:'Dune raider convoy',faction:'eastern_nomads',sub:'dune_raiders',riders:12,mount:'camel',
  every_days:[3,6],from:'canyon_east',to:'plateau_north',
  stops:[{activity:'WATER_CAMELS',mins:30},{activity:'TRADE',mins:90},{activity:'REST',mins:120}]}];
const byId={};PLACES.forEach(p=>byId[p.id]=p);

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
const target=p=>{const c=polyCentre(p.poly);return{x:c[0],z:c[1]};};
// the nearest place offering an activity (straight-line; the route then proves it reachable)
function offering(act,x,z){let b=null,bd=1e9;for(const p of PLACES){if(p.activities.indexOf(act)<0)continue;const t=target(p),d=Math.hypot(t.x-x,t.z-z);if(d<bd){bd=d;b=p;}}return b;}

// ---------------------------------------------------------------- the checks the probe reads
const OUT={places:PLACES.length,people:PEOPLE.length,jobs:Object.keys(JOBS).length,activities:ACTIVITIES.length,
 unknownActivities:[],unreachable:[],capacity:[],routes:{},events:{},onlyWayUp:null};
// every activity a job or event asks for is offered somewhere, and every place's activities are known
for(const j in JOBS)for(const a of JOBS[j].sched)if(ACTIVITIES.indexOf(a)<0||!PLACES.some(p=>p.activities.indexOf(a)>=0))OUT.unknownActivities.push(j+':'+a);
for(const p of PLACES)for(const a of p.activities)if(ACTIVITIES.indexOf(a)<0)OUT.unknownActivities.push(p.id+':'+a);
// capacity: each hour, fill the places offering each activity (scarcest activity first) and report shortfalls
for(let h=0;h<24;h++){const want={};for(const j in JOBS){const a=JOBS[j].sched[h];want[a]=(want[a]||0)+JOBS[j].count;}
 const room={};PLACES.forEach(p=>room[p.id]=p.capacity);
 const acts=Object.keys(want).sort((a,b)=>PLACES.filter(p=>p.activities.indexOf(a)>=0).length-PLACES.filter(p=>p.activities.indexOf(b)>=0).length);
 for(const a of acts){let need=want[a];for(const p of PLACES){if(need<=0)break;if(p.activities.indexOf(a)<0)continue;const t=Math.min(need,room[p.id]);room[p.id]-=t;need-=t;}
  if(need>0)OUT.capacity.push({hour:h,activity:a,short:need});}}
// reachability of every place from the Khan, over the ground
const KH=target(byId.khan),R0=reach(KH.x,KH.z);
for(const p of PLACES){const t=target(p),k=nearestOpen(t.x,t.z);if(k<0||!R0[k])OUT.unreachable.push(p.id);}
for(const n in PORTS){const k=nearestOpen(PORTS[n].x,PORTS[n].z);if(k<0||!R0[k])OUT.unreachable.push('port:'+n);}
// the switchback is the only way up: block its corridor and the gatehouse must fall out of reach
{const blk=new Uint8Array(N);let cells=0;for(let k=0;k<N;k++){const [x,z]=xzOf(k);if(x<SWB.x0-12||x>SWB.x1+12||z>SWB.zEdge+14||z<SWB.zEdge-SWB.W-16)continue;const n=swNear(x,z);if(n&&n.d<SWB.bank+1.5){blk[k]=1;cells++;}}
 const G=target(byId.switchback_gate),kg=nearestOpen(G.x,G.z),R1=reach(KH.x,KH.z,blk);
 OUT.onlyWayUp={withSwitchback:!!(kg>=0&&R0[kg]),withoutSwitchback:!!(kg>=0&&R1[kg]),blockedCells:cells};}
// the convoy: its legs resolved to places and routed on the ground
const ROUTES=[];
for(const E of EVENTS){let x=PORTS[E.from].x,z=PORTS[E.from].z;const legs=[],missing=[];
 const go=(to,label)=>{const r=route(x,z,to.x,to.z);if(!r){missing.push(label);return;}legs.push({to:label,len:Math.round(r.len)});ROUTES.push({key:E.id,label:E.name+': '+label,pts:r.pts,color:0xff5a3c});x=to.x;z=to.z;};
 for(const s of E.stops){const p=offering(s.activity,x,z);if(!p){missing.push(s.activity+' (nowhere)');continue;}go(target(p),s.activity+' at '+p.id);}
 go(PORTS[E.to],'exit '+E.to);
 // does the exit leg climb the switchback? (the share of its length within 3 m of the trail)
 const last=ROUTES[ROUTES.length-1];let on=0,tot=0;if(last&&last.key===E.id)for(let i=1;i<last.pts.length;i++){const a=last.pts[i-1],b=last.pts[i],l=Math.hypot(b[0]-a[0],b[2]-a[2]);tot+=l;const n=swNear((a[0]+b[0])/2,(a[2]+b[2])/2);if(n&&n.d<3)on+=l;}
 OUT.events[E.id]={legs,missing,exitOnSwitchback_m:Math.round(on)};}
// a daily commute per job: home to each place its schedule sends it, and back
for(const j in JOBS){const J=JOBS[j],home=byId[J.homes[0]],h=target(home),seen={};let bad=0,len=0;
 for(const a of J.sched){if(seen[a])continue;seen[a]=1;if(home.activities.indexOf(a)>=0)continue;const p=offering(a,h.x,h.z);if(!p){bad++;continue;}const t=target(p),r=route(h.x,h.z,t.x,t.z);if(!r)bad++;else{len+=r.len;if(j==='herder'||j==='guard_day'||j==='farmer')ROUTES.push({key:'commute',label:j+': '+home.id+' to '+p.id,pts:r.pts,color:0x3cc8ff});}}
 OUT.routes[j]={unrouted:bad,metres:Math.round(len)};}
NAV.blocked=BLK;
return{ACTIVITIES,FACTIONS,JOBS,PEOPLE,EVENTS,NAV,route,reach,offering,ROUTES,OUT,sched};})();
window._life=LIFE.OUT;
