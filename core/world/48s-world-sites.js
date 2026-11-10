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
//   KSITES.plan(spec, kit)          -> the region's plan (below). spec: the region's SITE_SPEC
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
  /* the roads: each camp's gate to the site, by the world's own router (the grade held, cliffs avoided) */
  if(SP.road&&typeof ROADS!=='undefined'){const to={name:S.id,x:S.x,z:S.z,r:SP.road.r==null?600:SP.road.r};
   site.camps.forEach((C,i)=>{const R=ROADS.route({name:C.id,x:C.gate.x,z:C.gate.z,r:0},to);
    if(!R||!R.pts||R.pts.length<2){out.errors.push(C.id+': no road to the site');return;}
    /* the router starts on its own grid: the track begins at the gate itself */
    const rest=R.pts.filter(p=>Math.hypot(p[0]-C.gate.x,p[1]-C.gate.z)>1),p1=rest[0],d1=Math.hypot(p1[0]-C.gate.x,p1[1]-C.gate.z),e1=p1[2]==null?HL(p1[0],p1[1]):p1[2];
    /* the gate's height held to the road's grade from the router's first point (the ground is shaped to the road) */
    const g=.075*d1,eg=e1+Math.max(-g,Math.min(g,HL(C.gate.x,C.gate.z)-e1));
    const pts=[[C.gate.x,C.gate.z,eg]].concat(rest);
    site.roads.push({id:S.id+'/road/'+i,from:C.id,to:S.id,hw:SP.road.hw==null?R.hw:SP.road.hw,pts:pts.map(p=>[r2(p[0]),r2(p[1]),r2(p[2]==null?0:p[2])]),
     length_m:Math.round(R.length_m),maxGrade:Math.round((R.maxGrade||0)*1e4)/1e4});});}
  out.sites.push(site);}
 out.hash=hash(out);return out;}
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
  for(const R of S.roads){counts.roads++;const a=R.pts[0],C=S.camps.find(c=>c.id===R.from);
   if(!C||Math.hypot(a[0]-C.gate.x,a[1]-C.gate.z)>5)problems.push(R.id+': does not start at its camp\'s gate');}}
 return{ok:!problems.length,problems,counts};}
return{SLOPE,groundOk,discOk,siteFor,plan,hash,check,slopeAt};})();
