// ================================================================= ISLE DEMO — the regional highway network: every hamlet joined to its town
// [G data] The owner (2026-11-09): "the hamlets should all connect to the regional highway network as well to facilitate
// cart travel". The network is routed once by bake.py (`python3 bake.py roads`) in a headless page, after the towns are
// planned and the hamlets made (48t), with the world's own road routing (core/world/42-world-roads.js ROADS.route: least
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
//   ISLE_ROADS.join(village, town) -> one more road to the network as it stands (a founded hamlet's, 48f), or {error}
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
 if(typeof ISLE_COLONY!=='undefined'&&ISLE_COLONY.made&&!ISLE_COLONY.made.error)out[ISLE_COLONY.made.town]=ISLE_COLONY.heads().map(h=>Object.assign({r:JOIN_R},h));   /* Nephtos's spokes (48p) */
 return out;}
/* a village's ways out: the far end of each of its lanes (not the farm tracks) and the lane's outward direction */
function exits(v){const out=[];for(const l of v.lanes||[]){if(l.track||l.landing)continue;const a=l.pts[0],b=l.pts[1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<20)continue;
  const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,ax=b[0]+ux*APPROACH,az=b[1]+uz*APPROACH;if(WORLD.water(ax,az)>WORLD.Hland(ax,az)-1)continue;   /* a lane that ends at the sea is no way out for a road */
  out.push({x:b[0],z:b[1],ux,uz,lane:l.id});}
 if(!out.length)out.push({x:v.site.x,z:v.site.z,ux:1,uz:0,lane:null});return out;}
/* a stored point's height held to the grade from its neighbour */
const held=(h,e,d)=>Math.max(e-ROADS.G*d,Math.min(e+ROADS.G*d,h));
/* the villages' own ground: each as a disc round its green reaching its farthest building (the farmsteads on their holdings
   left out: a road may pass between fields), plus 40 m; a coastal village's quay its own disc; and every farmhouse on its
   holding a small disc of its own, never open (a road may pass between the fields, not through a farmhouse) */
function grounds(V){const GROUND=[],FARMS=[];
 for(const v of V){const s=v.site;let r=60;for(const b of v.records){if(b.farm!=null||b.landing)continue;r=Math.max(r,Math.hypot(b.x-s.x,b.z-s.z)+Math.hypot(b.w,b.d)/2);}GROUND.push({x:s.x,z:s.z,r:r+40});
  for(const b of v.records){if(b.landing)GROUND.push({x:b.x,z:b.z,r:Math.hypot(b.w,b.d)/2+60});if(b.farm!=null)FARMS.push({x:b.x,z:b.z,r:Math.hypot(b.w,b.d)/2+130});}}   /* a farmhouse's disc wide enough to hold a cell centre of the 200 m routing grid */
 return{GROUND,FARMS};}
/* one village joined to its town's network N (the heads and the stations so far): the lane end and the network point
   nearest each other, the approach, the routed line; the record, or {error} */
const LOOP=15,LOOP_GRADE=.08,RETRY=8;
function joinOne(v, town, N, G, skip){const nearFarm=(x,z,pad)=>G.FARMS.some(f=>Math.hypot(f.x-x,f.z-z)<f.r+(pad||0)),id=v.id;
 if(!N||!N.length)return{error:id+': no road head for '+town};
 let best=null;const XS=exits(v);for(const q of N){if(skip&&skip.indexOf(q.name)>=0)continue;if(q.name.indexOf('junction:')===0&&nearFarm(q.x,q.z,JUNCTION_OFF))continue;XS.forEach((x,xi)=>{if(skip&&skip.indexOf('exit:'+xi)>=0)return;const d=Math.hypot(q.x-x.x,q.z-x.z);if(!best||d<best.d)best={d,q,x,xi};});}
 if(!best)return{error:id+': no network point clear of the farmhouses'};
 const X=best.x,a0={x:X.x,z:X.z},a1={x:X.x+X.ux*APPROACH,z:X.z+X.uz*APPROACH},tgt={x:best.q.x,z:best.q.z};
 const avoid=(x,z)=>nearFarm(x,z)||(Math.hypot(a1.x-x,a1.z-z)>=260&&Math.hypot(tgt.x-x,tgt.z-z)>=160&&G.GROUND.some(g=>Math.hypot(g.x-x,g.z-z)<g.r));   /* open round the road's own ends */
 const r=ROADS.route({name:id,x:a1.x,z:a1.z,r:END_R},{name:best.q.name,x:tgt.x,z:tgt.z,r:best.q.r},{avoid});
 if(r.error)return{error:id+' - '+best.q.name+': '+r.error,to:best.q.name,xi:best.xi};
 /* the exact ends: the lane end, the approach's far point, the routed line, the network point; the far end's height is the
    network's there (a trunk road's own finished height at the junction, a head's ground) */
 const P=r.pts,h0=WORLD.Hland(a0.x,a0.z),h1=WORLD.Hland(a1.x,a1.z),hT=best.q.e==null?WORLD.Hland(tgt.x,tgt.z):best.q.e;
 const e1=held(h1,P[0][2],Math.hypot(a1.x-P[0][0],a1.z-P[0][1])),e0=held(h0,e1,APPROACH),eT=held(hT,P[P.length-1][2],Math.hypot(tgt.x-P[P.length-1][0],tgt.z-P[P.length-1][1]));
 r.pts=[[Math.round(a0.x*10)/10,Math.round(a0.z*10)/10,Math.round(e0*100)/100],[Math.round(a1.x*10)/10,Math.round(a1.z*10)/10,Math.round(e1*100)/100]].concat(P,[[Math.round(tgt.x*10)/10,Math.round(tgt.z*10)/10,Math.round(eT*100)/100]]);
 /* a road that crosses itself (2026-11-09: Nephtos's fishing village, whose route turned back over its own approach) is cut at
    the crossing: the loop between two points LOOP m apart dropped, the road going on from the first to the point after the
    second, where that keeps the grade (LOOP_GRADE); the ground cannot lie under two heights at once */
 for(let i=0;i<r.pts.length-3;i++)for(let j=r.pts.length-2;j>i+1;j--){const A=r.pts[i],B=r.pts[j],C=r.pts[j+1];if(Math.hypot(A[0]-B[0],A[1]-B[1])>=LOOP)continue;
  const dC=Math.hypot(A[0]-C[0],A[1]-C[1]);if(dC>0&&Math.abs(C[2]-A[2])/dC<=LOOP_GRADE){r.pts.splice(i+1,j-i);r.loops=(r.loops||0)+1;break;}}
 let len=0;for(let i=1;i<r.pts.length;i++)len+=Math.hypot(r.pts[i][0]-r.pts[i-1][0],r.pts[i][1]-r.pts[i-1][1]);r.length_m=Math.round(len);r.lane=X.lane;
 r.town=town;Object.defineProperty(r,'_exit',{value:best.xi,enumerable:false});r.townKm=Math.round((r.length_m/1000+best.q.townKm)*100)/100;Object.defineProperty(r,'_tk',{value:r.length_m/1000+best.q.townKm,enumerable:false});return r;}   /* the unrounded km, for its stations (not written) */
/* a road's stations join the network, each with its km to the town along it and its height; not the village's own lane end
   and approach (another road meeting there would run in through the village) */
function stations(r, N){const Q=r.pts,tk=r._tk==null?r.townKm:r._tk;let acc=0;for(let i=Q.length-1;i>=0;i--){if(i<Q.length-1)acc+=Math.hypot(Q[i][0]-Q[i+1][0],Q[i][1]-Q[i+1][1]);if(i<3)continue;
  N.push({name:'junction:'+r.from+':'+i,x:Q[i][0],z:Q[i][1],r:JOIN_R,townKm:tk-(r.length_m-acc)/1000,e:Q[i][2]});}}
const headNet=HD=>{const net={};for(const t in HD)net[t]=HD[t].map(h=>Object.assign({townKm:0,e:WORLD.Hland(h.x,h.z)},h));return net;};   /* a head's height: the town's ground there */
function bake(){const HD=heads(),made=ISLE_HAMLETS.made,roads=[],errors=[],net=headNet(HD);
 if(!made)return{format:'krator-openworld-roads',version:1,grade:ROADS.G,roads,errors:['the hamlets are not made (48t)'],heads:HD};
 const V=made.villages.filter(E=>E.village&&E.village.site&&!E.village.error&&!E.spec.overseas).map(E=>({E,town:E.spec.parent,d:Math.hypot(E.village.site.x-E.parent[0],E.village.site.z-E.parent[1])}))
  .sort((a,b)=>a.d-b.d||(a.E.spec.id<b.E.spec.id?-1:1));
 const G=grounds(V.map(v=>v.E.village));
 /* a road steeper anywhere than the grade allows (2026-11-09: Nephtos's plantation's, joined to a junction 62 m below its
    route) is routed again to the next nearest network point, up to RETRY times */
 const steepAt=r=>r.error?-1:r.pts.findIndex((p,i)=>i>0&&Math.abs(p[2]-r.pts[i-1][2])>ROADS.G*Math.hypot(p[0]-r.pts[i-1][0],p[1]-r.pts[i-1][1])*1.05+.05);
 for(const v of V){let r=joinOne(v.E.village,v.town,net[v.town],G);const tried=[];let k;
  /* steep within its first few points: the lane end it left from is the trouble (Nephtos's plantation: a 57 m drop beside it), else its far end */
  /* or no route to it at all (Nephtos's copper mine: "no fine route" to a junction): the next nearest point */
  /* or its first stretch (the lane end's approach) crosses one of its own village's buildings (a retried lane end past a granary) */
  const overOwn=r=>!r.error&&(v.E.village.records||[]).some(b=>!b.vacant&&r.pts.slice(0,4).some((p,i,P)=>{if(!i)return false;const a=P[i-1],dx=p[0]-a[0],dz=p[1]-a[1],l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((b.x-a[0])*dx+(b.z-a[1])*dz)/l2));return Math.hypot(a[0]+dx*t-b.x,a[1]+dz*t-b.z)<=Math.hypot(b.w,b.d)/2*.6+(r.hw>0?r.hw:3);}));
  /* every attempt kept; the first that is neither steep nor over its village wins, else the least steep that is not over it */
  const maxG=r=>r.error?Infinity:r.pts.reduce((m,p,i)=>i?Math.max(m,Math.abs(p[2]-r.pts[i-1][2])/Math.max(1e-6,Math.hypot(p[0]-r.pts[i-1][0],p[1]-r.pts[i-1][1]))):m,0);
  const bad=r=>r.error?3:overOwn(r)?2:steepAt(r)>=0?1:0,att=[r];
  while(bad(r)&&r.to!=null&&tried.length<RETRY){k=r.error?99:steepAt(r);tried.push(r.error||overOwn(r)?(r.error?r.to:'exit:'+r._exit):k>4?r.to:'exit:'+r._exit);const r2=joinOne(v.E.village,v.town,net[v.town],G,tried);if(r2.error&&r2.to==null)break;r=r2;att.push(r);}
  if(bad(r))r=att.slice().sort((p,q)=>bad(p)-bad(q)||maxG(p)-maxG(q))[0];
  if(r.error){errors.push(r.error);continue;}roads.push(r);stations(r,net[v.town]);}
 return{format:'krator-openworld-roads',version:1,grade:ROADS.G,roads,errors,heads:HD};}
/* A ROAD AFTER THE BAKE (48f: a founded hamlet's highway, routed live when its camp converts): the village joined to the
   network as it stands (the heads, every baked and built road's stations; the villages' and farmhouses' ground as now),
   the record as bake's, not yet in the world (the hamlet's hands build it first: WORLD.addRoad when done) */
function join(village, town){const made=ISLE_HAMLETS.made;if(!made)return{error:'the hamlets are not made (48t)'};
 const net=headNet(heads()),N=net[town]||[];
 for(const r of (WORLD_DATA.roads&&WORLD_DATA.roads.roads)||[])if(r.town===town&&r.townKm!=null)stations(r,N);
 const G=grounds(made.villages.filter(E=>E.village&&E.village.site&&!E.village.error&&E.village!==village).map(E=>E.village));
 return joinOne(village,town,N,G);}
return{heads,bake,join,joinOne,grounds,JOIN_R,END_R,APPROACH};})();
