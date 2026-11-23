// ================================================================= OPEN WORLD — sites: settlements planned on the world's ground
// [G data] openworld/PLAN-SITES.md section 3. A region's sites (WORLD_DATA.meta.sites, written by
// tools/scale-model/cut_site.py from openworld/SITES.json) are planned here on the world's own land (WORLD.H, WORLD.water,
// WORLD.inside): no ground of their own. The modules plan; this file only finds the ground, calls them, and writes one
// record the page draws and Godot reads. No THREE, no DOM, no Math.random: the same spec, world fields and seeds give the
// same plan in node (core/world/bake_sites.py), in the page and in Godot.
//
//   (every height read is WORLD.Hland: the land without the roads, as the road bake reads it)
//   KSITES.groundOk(x, z)           good ground for a camp or a village: inside the region, dry (1.2 m over any water), not
//                                   steeper than SLOPE, not a town's or a cleared place's (WORLD.townW)
//   KSITES.discOk(x, z, R)          a whole disc of good ground (rings from the middle out: the middle fails first)
//   KSITES.siteFor(near, look, R)   the nearest point to `near` (a 50 m grid out to `look` m) with a disc of R m
//   KSITES.plan(spec, kit)          -> the region's plan (below). spec: the region's SITE_SPEC (a hamlet's `link`
//                                   [dx, dz] aims its main lane, `road: false` lays it no road: a page-less site's own house)
//                                   {region, world, sites: {<site id>: {camps: [{tribe, near: [dx, dz] from the site, look?}],
//                                   road?: {r}}}}; kit: {dims(key, v) -> {w, d, h}, programs(tribe) -> a band's program}
//   KSITES.hash(plan)               FNV-1a of the plan's canonical text (no log, no hash): the bake and a re-plan agree
//   KSITES.check(plan)              the plan against the world as it stands: {ok, problems, counts}
//
// THE PLAN (format 'krator-site-plan', version 1; metres in the region's frame, rounded to the centimetre):
//   {format, version, region, map, world, sites: [{id, name, type, x, z, camps: [CAMP], roads: [ROAD]}], errors, hash}
//   CAMP {id: '<site>/camp/<tribe>', tribe, name, site: {x, z}, way, R, hearth, gate, census: {pop, adults, children, elders,
//         riders, mounts, households}, records: [{id, key, v, kind, x, z, ry, w, d, h}], hedge, fence, pasture, short}
//   ROAD {id: '<site>/road/<n>', from (a camp's id), to (the site's id), hw, pts: [[x, z, e]], length_m, maxGrade}
//   LINK {id: '<site>/link/<site>', from, to, hw, pts, length_m, maxGrade, stops?: [STOP], gaps?: [{id, kind, at_m, why}]}
//        (plan's `links`; STOP: stops(); a gap is a stop the road had no ground for)
//   WAY  {id: '<site>/way/<id>', from, start?, name, to: {x, z, px?}, end: {x, z}, short?, hw, pts, length_m, maxGrade}
//        (plan's `ways`, opt-in: a road from a site, or one of its villages, to a point; ways() below)
// Every id begins with the site's id in the scale model, so an edit (core/edits) keeps its target when the plan is redone.
var KSITES=(function(){'use strict';
const SLOPE=.3,RINGS=[0,.3,.6,1],SPOKES=12,GRID=50;
const r2=v=>Math.round(v*100)/100;
/* the land the planners read: without the roads (WORLD.Hland), so a road laid after the plan does not move it */
const HL=(x,z)=>WORLD.Hland?WORLD.Hland(x,z):WORLD.H(x,z);
function slopeAt(x,z){const e=6,h=HL(x,z);return Math.max(Math.abs(HL(x+e,z)-h),Math.abs(HL(x,z+e)-h))/e;}
function groundOk(x,z){if(!WORLD.inside(x,z))return false;const h=HL(x,z);
 if(WORLD.water(x,z)>h-1.2)return false;if(slopeAt(x,z)>SLOPE)return false;return !WORLD.townW(x,z);}
function discOk(x,z,R){for(const k of RINGS){const r=k*R,n=r?SPOKES:1;
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2;if(!groundOk(x+Math.cos(a)*r,z+Math.sin(a)*r))return false;}}return true;}
function siteFor(near,look,R){const n=Math.floor(look/GRID),C=[];
 for(let j=-n;j<=n;j++)for(let i=-n;i<=n;i++){if(i*i+j*j<=n*n)C.push([i,j,i*i+j*j]);}
 C.sort((a,b)=>a[2]-b[2]||a[1]-b[1]||a[0]-b[0]);   /* nearest first, a fixed order for ties */
 for(const c of C){const x=near[0]+c[0]*GRID,z=near[1]+c[1]*GRID;if(discOk(x,z,R))return{x,z};}
 return null;}
const rec=r=>({id:r.id,key:r.key,v:r.v|0,kind:r.kind,x:r2(r.x),z:r2(r.z),ry:Math.round(r.ry*1e4)/1e4,w:r.w,d:r.d,h:r.h});
const loop=L=>L?{key:L.key,v:L.v,gateV:L.gateV,pts:L.pts.map(p=>[r2(p[0]),r2(p[1])]),gates:(L.gates||[]).map(r2)}:null;
/* a camp's ground: the disc a band's ring, pens and pasture take (its program's pasture hectares as a square, the ring
   about 60 m), searched round the spec's point */
const campR=prog=>{const ha=prog&&prog.pasture&&prog.pasture.ha||0;return Math.max(90,60+Math.sqrt(ha*1e4)*.8);};
function plan(spec,kit){const out={format:'krator-site-plan',version:1,region:spec.region,map:(WORLD_DATA.meta.cut||{}).map||null,
  world:spec.world,sites:[],errors:[]};
 const sites=WORLD_DATA.meta.sites||[];
 for(const S of sites){const SP=(spec.sites||{})[S.id];if(!SP)continue;
  const site={id:S.id,name:S.name,type:S.type,x:S.x,z:S.z,camps:[],roads:[]};
  for(const C of SP.camps||[]){const id=S.id+'/camp/'+C.tribe,prog=kit.programs(C.tribe);
   if(!prog){out.errors.push(id+': no program for '+C.tribe);continue;}
   const R=campR(prog),at=siteFor([S.x+C.near[0],S.z+C.near[1]],C.look==null?1500:C.look,R);
   if(!at){out.errors.push(id+': no ground for a camp within '+(C.look==null?1500:C.look)+' m of its point');continue;}
   const way=[S.x-at.x,S.z-at.z];
   const c=KCAMP.pitch({id,world:spec.world,culture:'beast-rider',program:prog,site:at,dims:kit.dims,ground:{ok:groundOk},way});
   const cs=KCAMP.census({id,world:spec.world,culture:'beast-rider',program:prog});
   if(c.error)out.errors.push(id+': '+c.error);if(c.short&&c.short.length)out.errors.push(id+': not pitched: '+c.short.join(', '));
   site.camps.push({id,tribe:C.tribe,name:C.name||('the '+C.tribe+' band'),site:{x:r2(at.x),z:r2(at.z)},way:way.map(r2),R:r2(c.R),
    hearth:{x:r2(c.hearth.x),z:r2(c.hearth.z)},gate:{x:r2(c.gate.x),z:r2(c.gate.z)},
    census:{pop:cs.pop,adults:cs.adults,children:cs.children,elders:cs.elders,riders:cs.riders,mounts:cs.mounts,households:cs.households.length},
    records:c.records.map(rec),hedge:loop(c.hedge),fence:loop(c.fence),pasture:c.pasture?{pts:c.pasture.pts.map(p=>[r2(p[0]),r2(p[1])]),ha:r2(c.pasture.ha)}:null,
    short:(c.short||[]).slice()});}
  /* the hamlets (core/hamlet): each village searched from its spot (an offset from the site, or a bearing and a
     distance), laid out by KHAMLET.village on the world's land with the site's town as its link */
  if(SP.hamlets)site.hamlets=[];
  for(const Hs of SP.hamlets||[]){const id=S.id+'/hamlet/'+Hs.id,look=Hs.look==null?3000:Hs.look;
   const near=Hs.near?[S.x+Hs.near[0],S.z+Hs.near[1]]:[S.x+Math.sin(Hs.bearing*Math.PI/180)*Hs.km*1000,S.z-Math.cos(Hs.bearing*Math.PI/180)*Hs.km*1000];
   const at=siteFor(near,look,HAMLET_R);if(!at){out.errors.push(id+': no ground for a village within '+look+' m of its spot');continue;}
   if(typeof KHAMLET==='undefined'){out.errors.push(id+': core/hamlet is not on the page');continue;}
   /* link: where the village's main lane points (the site, or an offset from it: a house that is itself the site's
      heart points its lane down its road, not at its own green) */
   const lk=Hs.link?{x:S.x+Hs.link[0],z:S.z+Hs.link[1]}:{x:S.x,z:S.z};
   const v=KHAMLET.village({id,world:spec.world,culture:Hs.culture||SP.culture,focus:Hs.focus,site:at,link:lk,dims:kit.dims,
    ground:{ok:groundOk},popMax:Hs.pop});
   if(v.error)out.errors.push(id+': '+v.error);
   const main=(v.lanes||[]).find(l=>l.main)||(v.lanes||[])[0],end=main?main.pts[main.pts.length-1]:[v.site.x,v.site.z];
   site.hamlets.push({id,name:Hs.name||(Hs.focus+' village'),focus:Hs.focus,culture:Hs.culture||SP.culture,site:{x:r2(v.site.x),z:r2(v.site.z)},
    end:{x:r2(end[0]),z:r2(end[1])},census:{pop:v.census.pop,households:v.census.households},
    green:v.green?{x:r2(v.green.x),z:r2(v.green.z),w:v.green.w,d:v.green.d,ry:Math.round((v.green.ry||0)*1e4)/1e4}:null,
    records:v.records.map(r=>({id:r.id,key:r.key,role:r.role,pending:!!r.pending,x:r2(r.x),z:r2(r.z),ry:Math.round(r.ry*1e4)/1e4,w:r.w,d:r.d,h:r.h})),
    lanes:(v.lanes||[]).map(l=>({id:l.id,w:l.w,main:!!l.main,pts:l.pts.map(p=>[r2(p[0]),r2(p[1])])})),error:v.error||null});
   if(Hs.road===false)site.hamlets[site.hamlets.length-1].noRoad=true;}
  /* the roads: each camp's gate and each village's lane end to the site, by the world's own router (the grade held,
     cliffs avoided) */
  if(SP.road&&typeof ROADS!=='undefined'){const to={name:S.id,x:S.x,z:S.z,r:SP.road.r==null?600:SP.road.r},hw=SP.road.hw;
   /* road.join: each road runs to the nearest point of the site's roads already laid when that is nearer than the
      town's reach, and takes that road's height there, so the roads share a trunk instead of meeting the town side by
      side at different grades (busy-keller's road bake joins its network the same way) */
   const toFor=at=>{if(!SP.road.join||!site.roads.length)return to;let best=null,bd=Math.hypot(at.x-S.x,at.z-S.z)-to.r;
    for(const R of site.roads)for(const p of R.pts){const d=Math.hypot(p[0]-at.x,p[1]-at.z);if(d<bd){bd=d;best=p;}}
    return best?{name:S.id+'/junction',x:best[0],z:best[1],r:0,e:best[2]}:to;};
   const lay=(fromId,at)=>{const T=toFor(at),R=road(site.roads.length,S.id,fromId,at,T,hw);if(!R){out.errors.push(fromId+': no road to the site');return;}
    if(T.e!=null){const L=R.pts[R.pts.length-1];L[0]=r2(T.x);L[1]=r2(T.z);L[2]=r2(T.e);R.joins=true;}site.roads.push(R);};
   site.camps.forEach(C=>lay(C.id,C.gate));
   (site.hamlets||[]).forEach(V=>{if(!V.noRoad)lay(V.id,V.end);});}
  if(spec.bridges)site.roads=site.roads.map(R=>bridged(R,spec,out));
  out.sites.push(site);}
 /* the roads between the towns (spec.links: [a, b, {hw, r}]): from one site's reach to the other's */
 if(spec.links&&typeof ROADS!=='undefined'){out.links=[];
  for(const L of spec.links){const A=out.sites.find(s=>s.id===L[0]),B=out.sites.find(s=>s.id===L[1]),o=L[2]||{};
   if(!A||!B){out.errors.push('link '+L[0]+'-'+L[1]+': a site is missing');continue;}
   const R=o.keep?keptRoute(A,B,spec.bridges?Object.assign({},o,{bridged:true}):o):ROADS.route({name:A.id,x:A.x,z:A.z,r:o.r==null?2000:o.r},{name:B.id,x:B.x,z:B.z,r:o.r==null?2000:o.r});
   if(!R||!R.pts||R.pts.length<2){out.errors.push('link '+A.id+'-'+B.id+': no route');continue;}
   const Lk={id:A.id+'/link/'+B.id,from:A.id,to:B.id,hw:o.hw==null?R.hw:o.hw,pts:R.pts.map(p=>[r2(p[0]),r2(p[1]),r2(p[2]==null?HL(p[0],p[1]):p[2])]),
    length_m:Math.round(R.length_m),maxGrade:Math.round((R.maxGrade||0)*1e4)/1e4};
   if(o.stops){const St=stops(Lk,o.stops,kit,A.name,B.name);Lk.stops=St.stops;if(St.gaps.length)Lk.gaps=St.gaps;St.errors.forEach(e=>out.errors.push(e));}
   out.links.push(spec.bridges?bridged(Lk,spec,out,o.culture):Lk);}}
 if(spec.ways&&typeof ROADS!=='undefined')ways(spec,out);
 out.hash=hash(out);return out;}
/* THE ROADS TO A POINT (spec.ways, opt-in, 2026-11-16: Thalaba's expedition road up Godshearth's gorge to the Spillway, the
   owner: "Grow the cut up the gorge"): [{id, from (a site), start? (one of its hamlets: the road goes on from that village's
   lane end, so it shares the village's road as its trunk), to: {px: [x, y]} (the 5.1 canvas) | {x, z} (the region's frame),
   name?, hw?, r? (the site's reach when it starts at the site, 900), via?, guide? ([[px, py]]: a line up a valley)}].
   Routed as a kept link (keptRoute: in hops, never leaving the cut, bridged when the region asks) to the point itself; a point
   outside the cut ends the road at the cut's edge, at the last point inside on the line toward it (the guide's, else the
   straight one), 300 m back from where it leaves, until the cut grows. WAY {id: '<site>/way/<id>', from, start?, name, to:
   {x, z, px?}, end: {x, z}, short: true when it ends at the cut's edge, short of its point, hw, pts, length_m, maxGrade}.
   A region without `ways` plans exactly as before */
function ways(spec,out){out.ways=[];const F=WORLD_DATA.meta.frame,PX=q=>[(q[0]-F.origin_px[0])*2000,(q[1]-F.origin_px[1])*2000];
 for(const W of spec.ways){const id=W.from+'/way/'+W.id,S=out.sites.find(s=>s.id===W.from);
  if(!S){out.errors.push(id+': no site '+W.from);continue;}
  const H=W.start?(S.hamlets||[]).find(h=>h.id===W.from+'/hamlet/'+W.start):null;
  if(W.start&&!H){out.errors.push(id+': no village '+W.start+' at '+W.from);continue;}
  const A=H?{id:H.id,x:H.end.x,z:H.end.z}:{id:S.id,x:S.x,z:S.z},T=W.to.px?PX(W.to.px):[W.to.x,W.to.z];
  /* the end: the point, or the last point inside the cut on the line toward it (100 m steps), 300 m back from the edge */
  const line=(W.guide?W.guide.map(PX):[]).concat([T]);let E={x:T[0],z:T[1]},short=false;
  if(!WORLD.inside(T[0],T[1])){let px=A.x,pz=A.z,trail=[[A.x,A.z]],left=false;
   for(const q of line){const L=Math.hypot(q[0]-px,q[1]-pz),n=Math.max(1,Math.ceil(L/100));
    for(let k=1;k<=n&&!left;k++){const x=px+(q[0]-px)*k/n,z=pz+(q[1]-pz)*k/n;if(!WORLD.inside(x,z)){left=true;break;}trail.push([x,z]);}
    if(left)break;px=q[0];pz=q[1];}
   const back=trail[Math.max(0,trail.length-1-3)];E={x:r2(back[0]),z:r2(back[1])};short=true;}
  const B={id:id+'/end',x:E.x,z:E.z},o={r:H?0:(W.r==null?900:W.r),rB:0,via:W.via,guide:W.guide,keep:true,bridged:!!spec.bridges};
  if(Math.hypot(B.x-A.x,B.z-A.z)<(o.r+200)){out.errors.push(id+": its end is within its start's reach");continue;}
  const R=keptRoute(A,B,o);if(!R||!R.pts||R.pts.length<2){out.errors.push(id+': no route');continue;}
  /* its ends pinned where they belong (the router's first and last points are its grid's): the village's lane end (from a
     village) and the end point, each joined to the route at the ruling grade (7.5 %, as road() joins a gate), the router's
     points within 1 m of them dropped */
  const P0=R.pts.map(p=>[p[0],p[1],p[2]==null?HL(p[0],p[1]):p[2]]).filter(p=>Math.hypot(p[0]-A.x,p[1]-A.z)>1&&Math.hypot(p[0]-B.x,p[1]-B.z)>1);
  const join=(at,q)=>{const d=Math.hypot(q[0]-at.x,q[1]-at.z),g=.075*d;return[at.x,at.z,q[2]+Math.max(-g,Math.min(g,HL(at.x,at.z)-q[2]))];};
  const pts=(H?[join(A,P0[0])]:[]).concat(P0,[join(B,P0[P0.length-1])]);
  const Wy={id,from:W.from,name:W.name||W.id,to:Object.assign({x:r2(T[0]),z:r2(T[1])},W.to.px?{px:W.to.px.slice()}:{}),end:{x:E.x,z:E.z},short,
   hw:W.hw==null?R.hw:W.hw,pts:pts.map(p=>[r2(p[0]),r2(p[1]),r2(p[2])]),length_m:0,maxGrade:0};if(H)Wy.start=H.id;
  const Q=spec.bridges?bridged(Wy,spec,out,W.culture):Wy;
  /* its length and grade read off its own points as laid (bridged: the decks over the rivers), not the router's figures
     (the hops' worst, before the joins, down into a river's channel where the bridge now carries it) */
  let mg=0,len=0;for(let i=1;i<Q.pts.length;i++){const a=Q.pts[i-1],b=Q.pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);len+=d;if(d>1)mg=Math.max(mg,Math.abs(b[2]-a[2])/d);}
  Q.length_m=Math.round(len);Q.maxGrade=Math.round(mg*1e4)/1e4;out.ways.push(Q);}}
/* BRIDGES (42b-world-bridges.js, the owner 2026-11-11): a region that asks (SITE_SPEC.bridges: true or the planner's
   options) has every road and link it lays bridged where it crosses a named river: the road's heights over the water lifted
   to a deck (its `spans`), the bridges in the plan's `bridges` (BRIDGE records). Opt-in: the other regions' plans are
   unchanged */
function bridged(R,spec,out,culture){if(typeof BRIDGES==='undefined'){out.errors.push(R.id+': bridges asked for, but core/world 42b is not loaded');return R;}
 const o=Object.assign({},spec.bridges===true?{}:spec.bridges,{culture:culture||(spec.bridges&&spec.bridges.culture)||null}),B=BRIDGES.plan(R,o);
 B.errors.forEach(e=>out.errors.push(e));(out.bridges||(out.bridges=[])).push(...B.bridges);
 const Q=Object.assign({},R,{pts:B.road.pts});if(B.spans.length)Q.spans=B.spans.map(x=>x.slice());return Q;}
/* a link that follows a line (a link's `guide`: [[px, py]] on the 5.1 canvas, the spec's own) or a route of the map's network (a link's `net`: the id of a route in WORLD_NET, the Ancient network's
   routes, openworld/network-proposal/net51.json, in 5.1 px): its via points are that route's line in the region's frame,
   one every `via` m, instead of the straight line between the towns */
function netPath(id){const N=typeof WORLD_NET!=='undefined'&&WORLD_NET&&WORLD_NET.routes&&WORLD_NET.routes[id];if(!N)return null;
 const F=WORLD_DATA.meta.frame,ox=F.origin_px[0],oy=F.origin_px[1];return N.px.map(p=>[(p[0]-ox)*2000,(p[1]-oy)*2000]);}
/* the stops along a link (a link's {stops: {every, inn, rest, culture, setback, look, drop}}): an inn (`inn`, a kit key)
   every `every` m of road and a rest stop (`rest`) halfway between, none in the last quarter of `every` before a town
   (the towns are the ends' stops). Each stands beside the road on good ground (KSITES.groundOk at its corners and
   middle, the ground under it falling no more than `drop` m), its front to the road, `setback` m off the shoulder, with
   a lane to the carriageway; it is searched along the road (100 m steps out to `look` m either way) and on either side,
   the sides taken in turn. STOP {id: '<link>/stop/<n>', kind: 'inn'|'rest', name, culture, at_m (along the road from
   its first town), side, x, z, staff, records: [{id, key, role, x, z, ry, w, d, h}], lane: {w, pts}} */
/* a link kept inside the region (a link's {keep: true, via (m, 8000)}): the router's coarse pass searches the whole box
   and may leave a narrow cut (the Iziz cluster's corridors: 24 km off the line), so the link is routed in hops between
   points on the straight line every `via` m, and its fine pass may not leave the polygon (ROADS.route opts.avoid). The
   hops' lines are joined end to end; a hop's grade is held within it */
function keptRoute(A,B,o){let n;const via=o.via==null?8000:o.via,r=o.r==null?2000:o.r,L=Math.hypot(B.x-A.x,B.z-A.z),rB=o.rB==null?r:o.rB,
  span=o.rB==null?L-2*r:L-r-o.rB;n=Math.max(1,Math.round(span/via));   /* o.rB: the far end's reach (a way's point, 0); absent, both ends r, as before */
 const W=[];for(let k=0;k<=n;k++){const t=(r+span*k/n)/L;W.push({x:A.x+(B.x-A.x)*t,z:A.z+(B.z-A.z)*t});}
 const F0=WORLD_DATA.meta.frame,NP=o.guide?o.guide.map(q=>[(q[0]-F0.origin_px[0])*2000,(q[1]-F0.origin_px[1])*2000]):o.net?netPath(o.net):null;   /* `guide`: a line in 5.1 px given by the spec (up a valley the straight line would leave), `net`: a network route */
 if(NP){/* the network's line (`net`): its points inside the cut, oriented A to B, resampled every `via` m, the ends at the towns */
  const pts=NP.filter(q=>WORLD.inside(q[0],q[1]));if(pts.length>1){if(Math.hypot(pts[0][0]-A.x,pts[0][1]-A.z)>Math.hypot(pts[pts.length-1][0]-A.x,pts[pts.length-1][1]-A.z))pts.reverse();
   const c=[0];for(let i=1;i<pts.length;i++)c.push(c[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const T=c[c.length-1];
   W.length=0;W.push({x:A.x,z:A.z});for(let d=via;d<T-via/2;d+=via){let i=1;while(i<c.length-1&&c[i]<d)i++;const t=(d-c[i-1])/((c[i]-c[i-1])||1);
    const x=pts[i-1][0]+(pts[i][0]-pts[i-1][0])*t,z=pts[i-1][1]+(pts[i][1]-pts[i-1][1])*t;if(Math.hypot(x-A.x,z-A.z)>r&&Math.hypot(x-B.x,z-B.z)>rB)W.push({x,z});}
   W.push({x:B.x,z:B.z});n=W.length-1;}}   /* no point of the route inside the cut: the straight line, as before */
 /* nor run down a river's bed (a cell with a named river's channel at its middle or 80 m to any side: the road crosses a
    river in one step between two cells, on a causeway, but never lies along it, burying it) */
 const RW=WORLD.riverWater,wetAt=(x,z)=>RW?[[0,0],[80,0],[-80,0],[0,80],[0,-80]].some(o=>RW(x+o[0],z+o[1])>-1e8):false;
 /* a bridged region (SITE_SPEC.bridges) lets the road cross the rivers' bands: the router's own price on water (40 times
    its length) makes it cross square rather than run along a bed, and 42b bridges the crossing */
 const out={pts:[],length_m:0,maxGrade:0,hw:null},avoid=o.bridged?(x,z)=>!WORLD.inside(x,z):(x,z)=>!WORLD.inside(x,z)||wetAt(x,z);
 if(o.bridged){
  /* a via point in a cul-de-sac (a terrace the next hop must leave the way the last one came: the map's line is coarser
     than the ground) makes the road run in and back out over itself, two levels on one spot that no ground can hold.
     Such a via point is dropped and its two hops routed as one, until no hop doubles back on the one before */
  const V=[{name:A.id,x:A.x,z:A.z,r}].concat(W.slice(1,n).map((w,k)=>({name:A.id+'/via/'+(k+1),x:w.x,z:w.z,r:0}))).concat([{name:B.id,x:B.x,z:B.z,r:rB}]);
  const hop=(a,b)=>{const R=ROADS.route(a,b,{avoid});return R&&R.pts&&R.pts.length>1?R:null;};
  const Hs=[];for(let k=0;k<V.length-1;k++){const R=hop(V[k],V[k+1]);if(!R)return null;Hs.push(R);}
  const doubles=(R1,R2,at)=>{const far=p=>Math.hypot(p[0]-at.x,p[1]-at.z)>300,P1=R1.pts.filter(far),P2=R2.pts.filter(far);
   for(let i=0;i<P2.length;i+=2)for(let j=0;j<P1.length;j+=2)if(Math.abs(P2[i][0]-P1[j][0])<40&&Math.abs(P2[i][1]-P1[j][1])<40)return true;return false;};
  for(let guard=0;guard<40;guard++){let k=1;for(;k<Hs.length;k++)if(doubles(Hs[k-1],Hs[k],V[k]))break;if(k>=Hs.length)break;
   const R=hop(V[k-1],V[k+1]);if(!R)return null;V.splice(k,1);Hs.splice(k-1,2,R);}
  for(const R of Hs){const P=out.pts.length?R.pts.filter((p,i)=>i>0||Math.hypot(p[0]-out.pts[out.pts.length-1][0],p[1]-out.pts[out.pts.length-1][1])>1):R.pts;
   out.pts.push(...P);out.length_m+=R.length_m;out.maxGrade=Math.max(out.maxGrade,R.maxGrade||0);if(out.hw==null)out.hw=R.hw;}
  return out;}
 for(let k=0;k<n;k++){const a=k?{name:A.id+'/via/'+k,x:W[k].x,z:W[k].z,r:0}:{name:A.id,x:A.x,z:A.z,r},
   b=k<n-1?{name:A.id+'/via/'+(k+1),x:W[k+1].x,z:W[k+1].z,r:0}:{name:B.id,x:B.x,z:B.z,r:rB};
  const R=ROADS.route(a,b,{avoid});if(!R||!R.pts||R.pts.length<2)return null;
  const P=out.pts.length?R.pts.filter((p,i)=>i>0||Math.hypot(p[0]-out.pts[out.pts.length-1][0],p[1]-out.pts[out.pts.length-1][1])>1):R.pts;
  out.pts.push(...P);out.length_m+=R.length_m;out.maxGrade=Math.max(out.maxGrade,R.maxGrade||0);if(out.hw==null)out.hw=R.hw;}
 return out;}
const STOP_STAFF={inn:12,rest:4};
function segDist(P,x,z,i0,i1){let best=1e18;for(let i=Math.max(1,i0);i<=Math.min(P.length-1,i1);i++){const a=P[i-1],b=P[i],ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez||1,
  t=Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[1])*ez)/L2)),d=Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t);if(d<best)best=d;}return best;}
function boxPts(x,z,ry,w,d){const c=Math.cos(ry),s=Math.sin(ry),u=[c*w/2,-s*w/2],v=[s*d/2,c*d/2];
 return[[x,z],[x-u[0]-v[0],z-u[1]-v[1]],[x+u[0]-v[0],z+u[1]-v[1]],[x+u[0]+v[0],z+u[1]+v[1]],[x-u[0]+v[0],z-u[1]+v[1]]];}
function stops(Lk,S,kit,fromName,toName){const out=[],errors=[],gaps=[],P=Lk.pts,hw=Lk.hw,every=S.every==null?25000:S.every,set=S.setback==null?8:S.setback,
  look=S.look==null?3000:S.look,drop=S.drop==null?4:S.drop;
 const cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const L=cum[cum.length-1];
 const along=d=>{let lo=1,hi=P.length-1;while(lo<hi){const m=(lo+hi)>>1;if(cum[m]<d)lo=m+1;else hi=m;}
  const a=P[lo-1],b=P[lo],sl=cum[lo]-cum[lo-1]||1,t=Math.max(0,Math.min(1,(d-cum[lo-1])/sl));return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,tx:(b[0]-a[0])/sl,tz:(b[1]-a[1])/sl,i:lo};};
 for(let k=1;k*every/2<L-every/4;k++){const kind=k%2?'rest':'inn',key=S[kind],D=key&&kit.dims(key,0),id=Lk.id+'/stop/'+k;
  if(!D){errors.push(id+': no box for '+key);continue;}
  const first=k%4<2?1:-1;let got=null;
  /* the ground under it may fall `drop` m; failing that anywhere in reach, twice that (the footing is deeper) */
  for(const dropK of [drop,drop*2])for(let dd=0;dd<=look&&!got;dd+=100)for(const sg of dd?[1,-1]:[1])for(const side of [first,-first]){if(got)break;
   const d0=k*every/2+sg*dd;if(d0<every/4||d0>L-every/4)continue;
   const p=along(d0),nx=-p.tz,nz=p.tx,off=hw+set+D.d/2,x=p.x+side*nx*off,z=p.z+side*nz*off,ry=Math.atan2(-side*nx,-side*nz);
   const B=boxPts(x,z,ry,D.w,D.d);if(!B.every(q=>groundOk(q[0],q[1])))continue;
   const hs=B.map(q=>HL(q[0],q[1]));if(Math.max.apply(null,hs)-Math.min.apply(null,hs)>dropK)continue;
   if(!B.every(q=>segDist(P,q[0],q[1],p.i-80,p.i+80)>hw+2))continue;
   got={d:d0,p,x,z,ry,side,nx,nz};}
  if(!got){gaps.push({id,kind,at_m:Math.round(k*every/2),why:'no good ground within '+look+' m along the road (water, a slope, the edge of the region)'});continue;}
  const g=got,km=Math.round(g.d/1000),fx=g.x-g.side*g.nx*D.d/2,fz=g.z-g.side*g.nz*D.d/2,ex=g.p.x+g.side*g.nx*hw,ez=g.p.z+g.side*g.nz*hw;
  out.push({id,kind,name:(kind==='inn'?'the caravanserai':'the rest stop')+' at km '+km+' from '+fromName+' to '+toName,culture:S.culture||null,
   at_m:Math.round(g.d),side:g.side,x:r2(g.x),z:r2(g.z),staff:STOP_STAFF[kind],
   records:[{id:id+'/b',key,role:kind,x:r2(g.x),z:r2(g.z),ry:Math.round(g.ry*1e4)/1e4,w:D.w,d:D.d,h:D.h}],
   lane:{w:kind==='inn'?6:4,pts:[[r2(fx),r2(fz)],[r2(ex),r2(ez)]]}});}
 return{stops:out,errors,gaps};}
/* one road from a point (a camp's gate, a village's lane end) to a site, as a record: the router starts on its own grid,
   so the road begins at the point itself, its height there held to the road's grade from the router's first point (the
   ground is shaped to the road) */
function road(n,siteId,fromId,at,to,hw){const R=ROADS.route({name:fromId,x:at.x,z:at.z,r:0},to);
 if(!R||!R.pts||R.pts.length<2)return null;
 const rest=R.pts.filter(p=>Math.hypot(p[0]-at.x,p[1]-at.z)>1);
 /* the router's first grid point can lie behind the start (the next point nearer the start than it): a spur that doubles
    back, whose two carriageways the ground cannot both lie on (Qiblai's first village, 2026-11-11): drop it */
 while(rest.length>2&&Math.hypot(rest[1][0]-at.x,rest[1][1]-at.z)<Math.hypot(rest[0][0]-at.x,rest[0][1]-at.z))rest.shift();
 const p1=rest[0],d1=Math.hypot(p1[0]-at.x,p1[1]-at.z),e1=p1[2]==null?HL(p1[0],p1[1]):p1[2];
 const g=.075*d1,eg=e1+Math.max(-g,Math.min(g,HL(at.x,at.z)-e1));
 const pts=[[at.x,at.z,eg]].concat(rest);
 return{id:siteId+'/road/'+n,from:fromId,to:siteId,hw:hw==null?R.hw:hw,pts:pts.map(p=>[r2(p[0]),r2(p[1]),r2(p[2]==null?0:p[2])]),
  length_m:Math.round(R.length_m),maxGrade:Math.round((R.maxGrade||0)*1e4)/1e4};}
const HAMLET_R=120;   /* a village's ground: core/hamlet wants a 45 m disc of good ground at its green; its houses, lanes and works reach farther */
function hash(P){const s=JSON.stringify(P,(k,v)=>k==='hash'||k==='log'||k==='ms'?undefined:v);let h=0x811c9dc5;
 for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return('00000000'+h.toString(16)).slice(-8);}
/* the plan against the world as it stands (a stale bake, ground that moved): every camp whole, its records on good
   ground and apart (KCAMP.check), each road's ends at its camp's gate and within the site's reach */
function check(P,opt){opt=opt||{};const problems=[],counts={sites:0,camps:0,records:0,roads:0};
 for(const S of P.sites){counts.sites++;
  for(const C of S.camps){counts.camps++;counts.records+=C.records.length;
   if(C.short.length)problems.push(C.id+': not pitched '+C.short.join(','));
   const k=KCAMP.check({records:C.records,hedge:C.hedge},{ok:opt.groundOk||groundOk});
   if(k.overlaps)problems.push(C.id+': '+k.overlaps+' overlapping boxes');if(k.offGround)problems.push(C.id+': '+k.offGround+' boxes off good ground');
   if(k.outside)problems.push(C.id+': '+k.outside+' boxes outside its hedge');
   if(!(C.census.pop>=10&&C.census.households>0))problems.push(C.id+': '+C.census.pop+' people in '+C.census.households+' households');}
  for(const V of S.hamlets||[]){counts.hamlets=(counts.hamlets||0)+1;counts.records+=V.records.length;
   if(V.error)problems.push(V.id+': '+V.error);
   /* the generator's own rules (core/hamlet's test): no two boxes overlap (touching allowed), each box's corners and
      centre on good ground */
   const ok=opt.groundOk||groundOk,RS=V.records.map(r=>KHAMLET.rect(r.x,r.z,Math.cos(r.ry),-Math.sin(r.ry),r.w,r.d));let ov=0,off=0;
   for(let i=0;i<RS.length;i++){for(let j=i+1;j<RS.length;j++)if(KHAMLET.overlap(RS[i],RS[j],0))ov++;
    if(!KHAMLET.corners(RS[i]).concat([[RS[i].x,RS[i].z]]).every(q=>ok(q[0],q[1])))off++;}
   if(ov)problems.push(V.id+': '+ov+' overlapping boxes');if(off)problems.push(V.id+': '+off+' boxes off good ground');
   if(!(V.census.pop>0&&V.records.length>0))problems.push(V.id+': '+V.census.pop+' people, '+V.records.length+' buildings');}
  for(const R of S.roads){counts.roads++;const a=R.pts[0],C=S.camps.find(c=>c.id===R.from),V=(S.hamlets||[]).find(h=>h.id===R.from),p=C?C.gate:V?V.end:null;
   if(!p||Math.hypot(a[0]-p.x,a[1]-p.z)>5)problems.push(R.id+': does not start at its '+(V?'village\'s lane end':'camp\'s gate'));}}
 for(const L of P.links||[]){counts.links=(counts.links||0)+1;const A=P.sites.find(s=>s.id===L.from),B=P.sites.find(s=>s.id===L.to),a=L.pts[0],b=L.pts[L.pts.length-1];
  if(!A||!B||Math.hypot(a[0]-A.x,a[1]-A.z)>4000||Math.hypot(b[0]-B.x,b[1]-B.z)>4000)problems.push(L.id+': its ends are not at its towns');
  /* its stops: each building on good ground at its corners and middle and clear of the carriageway */
  for(const St of L.stops||[]){counts.stops=(counts.stops||0)+1;
   for(const r of St.records){counts.records++;const B=boxPts(r.x,r.z,r.ry,r.w,r.d);
    if(!B.every(q=>(opt.groundOk||groundOk)(q[0],q[1])))problems.push(St.id+': off good ground');
    if(!B.every(q=>segDist(L.pts,q[0],q[1],1,L.pts.length-1)>L.hw+1))problems.push(St.id+': on the road');}}}
 /* the ways (spec.ways): each starts at its village's lane end or within its site's reach, and ends at its end (the point, or the cut's edge) */
 for(const Wy of P.ways||[]){counts.ways=(counts.ways==null?0:counts.ways)+1;const S=P.sites.find(s=>s.id===Wy.from),H=Wy.start&&S?(S.hamlets||[]).find(h=>h.id===Wy.start):null,a=Wy.pts[0],b=Wy.pts[Wy.pts.length-1];
  if(!S||(H?Math.hypot(a[0]-H.end.x,a[1]-H.end.z)>50:Math.hypot(a[0]-S.x,a[1]-S.z)>4000))problems.push(Wy.id+': does not start at '+(H?'its village':'its town'));
  if(Math.hypot(b[0]-Wy.end.x,b[1]-Wy.end.z)>50)problems.push(Wy.id+': does not reach its end');}
 /* the bridges (42b): every span has its bridge, every deck clears its water, the grade held, the piers on the ground */
 if(P.bridges&&typeof BRIDGES!=='undefined'){const all=P.sites.flatMap(S=>S.roads).concat(P.links||[]).concat(P.ways||[]),K=BRIDGES.check(all,P.bridges);
  counts.bridges=K.counts.bridges;counts.spans=K.counts.spans;counts.piers=K.counts.piers;K.problems.forEach(q=>problems.push(q));}
 return{ok:!problems.length,problems,counts};}
return{SLOPE,groundOk,discOk,siteFor,plan,hash,check,slopeAt};})();
