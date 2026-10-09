// ================================================================= DHELV: THE EXPORT (for godot/: the dhelv case; PLAN.md 9, P7)
// verify.py --export ../../godot/data/dhelv writes one JSON per part (window._api.exportParts / export(k), as Verge's):
//   terrain  the ground's height (DH.groundY) on a 4 m grid over the city and its apron, as Verge's heightfield
//   place    every site (key, district, where, its frame, its footprint and height) and the cavern's openings
//   cavern   KCAVERN's own export (the plan: prims, openings, fixtures); a port meshes it, or reads the chunk meshes (a gap)
//   tags     the page's core/tags records
//   walk     KWALK's floors and blocks (the navmesh's source)
//   nav      DHN's graph: nodes, edges (kind, zone, layout), and the doors' nodes
//   sim      core/simulation's export (the world's records), and `motion`: every actor's baked task (the legs' routes, speeds,
//            durations, the spot, the wander) as SIM.pose reads it
//   golden   SIM.pose of every actor at six motion times, from the same snapshot as `motion` (core/simulation/ksim.gd replays it)
//   lights   the lamps the buildings recorded (HALOS): position and colour
const DHEX={snap:null};
function dhxHeightfield(box,step){const nx=Math.floor((box[2]-box[0])/step)+1,nz=Math.floor((box[3]-box[1])/step)+1,a=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)a[j*nx+i]=DH.groundY(box[0]+i*step,box[1]+j*step);
 const u=new Uint8Array(a.buffer);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));
 return{format:'krator-heightfield',version:0,note:'Dhelv: DH.groundY (the land and the lava laid, the hills); row-major, z rows of x',x0:box[0],z0:box[1],step,nx,nz,heights:{type:'Float32Array',n:a.length,b64:btoa(s)}};}
function dhxBox(){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const s of SITES){x0=Math.min(x0,s.x);x1=Math.max(x1,s.x);z0=Math.min(z0,s.z);z1=Math.max(z1,s.z);}
 const m=120,q=v=>Math.round(v/4)*4;return[q(x0-m),q(z0-m),q(x1+m),q(z1+m)];}
/* the snapshot: the actors' tasks and the trace at the same instant (a SIM.step between two calls would re-plan some) */
function dhxSnap(){if(DHEX.snap)return DHEX.snap;const A=SIM.all('actor'),routes=[],rIdx=new Map(),t=SIM.time(),T=[0,7.5,45,300,1200,5000].map(d=>t+d);
 const rt=R=>{if(!rIdx.has(R)){rIdx.set(R,routes.length);routes.push({pts:R.pts.map(p=>[p[0],p[1],p[2]]),cum:R.cum.slice(),len:R.len});}return rIdx.get(R);};
 const actors=A.map((a,i)=>{const H=SIM.R.place[a.home],o={i,id:a.id,role:a.role,k:a.k||0,present:!!a.present,h0:a.h0||0,inVehicle:a.inVehicle||null,
   pos:a.pos?{x:a.pos.x,y:a.pos.y||0,z:a.pos.z}:null,homeDoor:H&&H.door?{x:H.door.x,y:H.door.y||0,z:H.door.z}:null,at:a.at||null,task:null};
  const K=a.task;if(K)o.task={t0:K.t0,spot:K.spot?{x:K.spot.x,y:K.spot.y||0,z:K.spot.z}:null,wander:K.wander||0,indoor:!!K.indoor,
   legs:K.legs.map(L=>({route:rt(L.route),speed:L.speed,dur:L.dur,back:L.back||0,side:L.side||0,mode:L.mode||'walk'}))};
  return o;});
 const rows=[];for(const tt of T)A.forEach((a,i)=>{const p=SIM.pose(a,tt);rows.push([tt,i,p.hidden?1:0,p.moving?1:0,p.x,p.y,p.z,p.h]);});
 DHEX.snap={t,times:T,actors,routes,rows};return DHEX.snap;}
const DHEX_PARTS={
 terrain:()=>dhxHeightfield(dhxBox(),4),
 place:()=>({format:'krator-dhelv-place',version:1,convention:{units:'m',up:'+y',x:'east',z:'south',ry:'radians about +y'},box:dhxBox(),
  sites:SITES.map(s=>{const F=DH.FOOT[s.key]||null;return{id:s.id||null,key:s.key,district:s.district,at:s.at||null,x:s.x,y:s.o?s.o.y:null,z:s.z,ry:s.ry||0,
   w:F?F[0]:null,d:F?F[1]:null,origin:F?F[2]:null,h:DEFS[s.key]?DEFS[s.key].h:null};}),
  openings:CVC.openings.map(O=>({id:O.id,kind:O.kind,c:O.c,r:O.r,rim:O.rim||0,y:O.y==null?null:O.y}))}),
 cavern:()=>CVC.export(),
 tags:()=>typeof KTAGS!=='undefined'&&KTAGS.page?KTAGS.page.export():null,
 walk:()=>KWALK.export(),
 nav:()=>{const B=DHN.get();return{format:'krator-dhelv-nav',version:1,note:'DHN (72-dhelv-nav.js): the walk graph the ramblers route on; y-aware; zone secret is the scouts\' only',
  nodes:B.nodes.map(n=>({id:n.id,x:n.x,y:n.y,z:n.z})),edges:B.edges.map(e=>({a:e.a,b:e.b,kind:e.kind,zone:e.zone,layout:!!e.layout,w:e.w==null?null:e.w})),
  doors:B.doors.map(d=>({key:d.key,node:d.node||null}))};},
 sim:()=>{const S=dhxSnap(),o=SIM.export({nav:false,log:0});o.motion={note:'SIM.pose reads these (core/simulation/77-sim-5-motion.js); a leg names its route by index',
  t:S.t,wander:SIM.WANDER,actors:S.actors,routes:S.routes};return o;},
 golden:()=>{const S=dhxSnap();return{format:'krator-dhelv-golden',version:1,note:'SIM.pose at these motion times: [t, actor index (sim.motion.actors), hidden, moving, x, y, z, h]',times:S.times,rows:S.rows};},
 lights:()=>({format:'krator-lights',version:1,note:'the lamps the buildings recorded (HALOS): flames, lanterns, hearths, burners, glow fungus; big = a fire',
  lights:HALOS.map(h=>({x:h.x,y:h.y,z:h.z,color:[h.r,h.g,h.b],big:!!h.big}))})};
window._api.exportParts=()=>Object.keys(DHEX_PARTS);
window._api.export=k=>DHEX_PARTS[k]();
