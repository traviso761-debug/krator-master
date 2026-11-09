// ================================================================= ISLE DEMO — the regional highway network: every hamlet joined to its town
// [G data] The owner (2026-11-09): "the hamlets should all connect to the regional highway network as well to facilitate
// cart travel". The network is routed once by bake.py (`python3 bake.py roads`) in a headless page, after the towns are
// planned and the hamlets made (48t), with the world's own road routing (src/world/42-world-roads.js ROADS.route: least
// cost over the land, the grade held to 8 %, cuts and fills), and written to data/roads.json; the page then reads it as
// WORLD_DATA.roads (41-world-fields.js shapes the ground to it, the terrain draws the carriageway, the flora and the floor
// keep off it, the probe checks its grade). Nothing here runs when the page starts.
// THE NETWORK: for each town its HEADS (Kautoa: the ends of the highway stubs through its gates, the plan's 'highway' world
// record, PLAN 8a; Valapo, unwalled: the outer ends of its avenues that lie on dry land), then its villages nearest the
// town first, each joined by one routed road to the NEAREST POINT OF THE NETWORK SO FAR (a head, a station of a road
// already routed, or a joined village's end), so the roads branch and share a trunk rather than each running back to the
// town on its own. The road leaves the village by whichever of its lanes ends nearest that point: a straight APPROACH of
// APPROACH m along the lane's own axis beyond its end (past the last house), then the routed line; both ends of the stored
// line are the exact lane end and network point (the routing's grid is 200 m), their heights held to the grade. Each road
// records its length to the town along the network (`townKm`), which 48 hands the sim as the village's road time
// (settlements/isle-demo 47h). Every village's own ground (its buildings' reach from its green, plus a margin) is kept
// out of the routing (ROADS.route's `avoid`), save round a road's own two ends, so a through road never cuts across a
// village's houses; every farmhouse on its holding is kept out too, and no road joins another within JUNCTION_OFF of one.
// The survey (48) reads the land without roads (WORLD.Hland), so the villages stand where they stood when the roads were
// baked; verify.py checks every village has a lane end that is a road's end.
//   ISLE_ROADS.heads()   -> {town: [{name, x, z, r}]}
//   ISLE_ROADS.bake()    -> the roads.json record: {format, version, grade, roads: [ROADS.route's + town, townKm, lane], errors, heads}
var ISLE_ROADS=(function(){'use strict';
const JOIN_R=20,END_R=15,APPROACH=150,JUNCTION_OFF=20;
const dry=(x,z)=>WORLD.water(x,z)<WORLD.Hland(x,z)-1;
function heads(){const out={};
 for(const P of ISLE_TOWNS_W.plans){const F=P.G.frame,L=[];
  for(const W of P.R.world||[]){if(W.kind!=='highway'||!Array.isArray(W.from))continue;
   for(const g of W.from){if(!g.at)continue;const x=F.x+g.at[0],z=F.z+g.at[1];if(dry(x,z))L.push({name:P.town+':'+g.gate,x,z,r:JOIN_R});}}
  if(!L.length){/* no gates: the avenues' outer ends on dry land */
   const ways=P.R.plan.ways.filter(w=>w.cls==='avenue'&&w.pts.length>1);let cx=0,cz=0,n=0;for(const w of ways)for(const p of w.pts){cx+=p[0];cz+=p[1];n++;}cx/=n===0?1:n;cz/=n===0?1:n;
   ways.forEach((w,i)=>{const a=w.pts[0],b=w.pts[w.pts.length-1],e=Math.hypot(a[0]-cx,a[1]-cz)>=Math.hypot(b[0]-cx,b[1]-cz)?a:b,x=F.x+e[0],z=F.z+e[1];
    if(dry(x,z))L.push({name:P.town+':avenue '+(w.id==null?i:w.id),x,z,r:JOIN_R});});}
  out[P.town]=L;}
 return out;}
/* a village's ways out: the far end of each of its lanes (not the farm tracks) and the lane's outward direction */
function exits(v){const out=[];for(const l of v.lanes||[]){if(l.track)continue;const a=l.pts[0],b=l.pts[1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<20)continue;out.push({x:b[0],z:b[1],ux:(b[0]-a[0])/L,uz:(b[1]-a[1])/L,lane:l.id});}
 if(!out.length)out.push({x:v.site.x,z:v.site.z,ux:1,uz:0,lane:null});return out;}
/* a stored point's height held to the grade from its neighbour */
const held=(h,e,d)=>Math.max(e-ROADS.G*d,Math.min(e+ROADS.G*d,h));
function bake(){const HD=heads(),made=ISLE_HAMLETS.made,roads=[],errors=[],net={};
 if(!made)return{format:'krator-openworld-roads',version:1,grade:ROADS.G,roads,errors:['the hamlets are not made (48t)'],heads:HD};
 for(const t in HD)net[t]=HD[t].map(h=>Object.assign({townKm:0,e:WORLD.Hland(h.x,h.z)},h));   /* a head's height: the town's ground there */
 const V=made.villages.filter(E=>E.village&&E.village.site&&!E.village.error).map(E=>({E,exits:exits(E.village),town:E.spec.parent,d:Math.hypot(E.village.site.x-E.parent[0],E.village.site.z-E.parent[1])}))
  .sort((a,b)=>a.d-b.d||(a.E.spec.id<b.E.spec.id?-1:1));
 /* the villages' own ground: each as a disc round its green reaching its farthest building (the farmsteads on their holdings
    left out: a road may pass between fields), plus 40 m */
 const GROUND=V.map(v=>{const s=v.E.village.site;let r=60;for(const b of v.E.village.records){if(b.farm!=null)continue;r=Math.max(r,Math.hypot(b.x-s.x,b.z-s.z)+Math.hypot(b.w,b.d)/2);}return{x:s.x,z:s.z,r:r+40};});
 /* and every farmhouse on its holding, a small disc of its own, never open (a road may pass between the fields, not
    through a farmhouse); nor does a road join another within JUNCTION_OFF of one */
 const FARMS=[];for(const v of V)for(const b of v.E.village.records)if(b.farm!=null)FARMS.push({x:b.x,z:b.z,r:Math.hypot(b.w,b.d)/2+130});   /* wide enough to hold a cell centre of the 200 m routing grid */
 const nearFarm=(x,z,pad)=>FARMS.some(f=>Math.hypot(f.x-x,f.z-z)<f.r+(pad||0));
 for(const v of V){const N=net[v.town];if(!N||!N.length){errors.push(v.E.spec.id+': no road head for '+v.town);continue;}
  /* the lane end and the network point nearest each other */
  let best=null;for(const q of N){if(q.name.indexOf('junction:')===0&&nearFarm(q.x,q.z,JUNCTION_OFF))continue;for(const x of v.exits){const d=Math.hypot(q.x-x.x,q.z-x.z);if(!best||d<best.d)best={d,q,x};}}
  if(!best){errors.push(v.E.spec.id+': no network point clear of the farmhouses');continue;}
  const X=best.x,a0={x:X.x,z:X.z},a1={x:X.x+X.ux*APPROACH,z:X.z+X.uz*APPROACH},tgt={x:best.q.x,z:best.q.z};
  const open=[a1,tgt],avoid=(x,z)=>nearFarm(x,z)||(!open.some(p=>Math.hypot(p.x-x,p.z-z)<160)&&GROUND.some(g=>Math.hypot(g.x-x,g.z-z)<g.r));
  const r=ROADS.route({name:v.E.spec.id,x:a1.x,z:a1.z,r:END_R},{name:best.q.name,x:tgt.x,z:tgt.z,r:best.q.r},{avoid});
  if(r.error){errors.push(v.E.spec.id+' - '+best.q.name+': '+r.error);continue;}
  /* the exact ends: the lane end, the approach's far point, the routed line, the network point; the far end's height is the
     network's there (a trunk road's own finished height at the junction, a head's ground) */
  const P=r.pts,h0=WORLD.Hland(a0.x,a0.z),h1=WORLD.Hland(a1.x,a1.z),hT=best.q.e==null?WORLD.Hland(tgt.x,tgt.z):best.q.e;
  const e1=held(h1,P[0][2],Math.hypot(a1.x-P[0][0],a1.z-P[0][1])),e0=held(h0,e1,APPROACH),eT=held(hT,P[P.length-1][2],Math.hypot(tgt.x-P[P.length-1][0],tgt.z-P[P.length-1][1]));
  r.pts=[[Math.round(a0.x*10)/10,Math.round(a0.z*10)/10,Math.round(e0*100)/100],[Math.round(a1.x*10)/10,Math.round(a1.z*10)/10,Math.round(e1*100)/100]].concat(P,[[Math.round(tgt.x*10)/10,Math.round(tgt.z*10)/10,Math.round(eT*100)/100]]);
  let len=0;for(let i=1;i<r.pts.length;i++)len+=Math.hypot(r.pts[i][0]-r.pts[i-1][0],r.pts[i][1]-r.pts[i-1][1]);r.length_m=Math.round(len);r.lane=X.lane;
  r.town=v.town;r.townKm=Math.round((r.length_m/1000+best.q.townKm)*100)/100;roads.push(r);
  /* the new road's stations join the network, each with its km to the town along it and its height; not the village's own
     lane end and approach (another road meeting there would run in through the village) */
  const Q=r.pts;let acc=0;for(let i=Q.length-1;i>=0;i--){if(i<Q.length-1)acc+=Math.hypot(Q[i][0]-Q[i+1][0],Q[i][1]-Q[i+1][1]);if(i<3)continue;N.push({name:'junction:'+v.E.spec.id+':'+i,x:Q[i][0],z:Q[i][1],r:JOIN_R,townKm:best.q.townKm+acc/1000,e:Q[i][2]});}}
 return{format:'krator-openworld-roads',version:1,grade:ROADS.G,roads,errors,heads:HD};}
return{heads,bake,JOIN_R,END_R,APPROACH};})();
