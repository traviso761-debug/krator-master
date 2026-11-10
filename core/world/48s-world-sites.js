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
  /* the hamlets (core/hamlet): each village searched from its spot (an offset from the site, or a bearing and a
     distance), laid out by KHAMLET.village on the world's land with the site's town as its link */
  if(SP.hamlets)site.hamlets=[];
  for(const Hs of SP.hamlets||[]){const id=S.id+'/hamlet/'+Hs.id,look=Hs.look==null?3000:Hs.look;
   const near=Hs.near?[S.x+Hs.near[0],S.z+Hs.near[1]]:[S.x+Math.sin(Hs.bearing*Math.PI/180)*Hs.km*1000,S.z-Math.cos(Hs.bearing*Math.PI/180)*Hs.km*1000];
   const at=siteFor(near,look,HAMLET_R);if(!at){out.errors.push(id+': no ground for a village within '+look+' m of its spot');continue;}
   if(typeof KHAMLET==='undefined'){out.errors.push(id+': core/hamlet is not on the page');continue;}
   const v=KHAMLET.village({id,world:spec.world,culture:Hs.culture||SP.culture,focus:Hs.focus,site:at,link:{x:S.x,z:S.z},dims:kit.dims,
    ground:{ok:groundOk},popMax:Hs.pop});
   if(v.error)out.errors.push(id+': '+v.error);
   const main=(v.lanes||[]).find(l=>l.main)||(v.lanes||[])[0],end=main?main.pts[main.pts.length-1]:[v.site.x,v.site.z];
   site.hamlets.push({id,name:Hs.name||(Hs.focus+' village'),focus:Hs.focus,culture:Hs.culture||SP.culture,site:{x:r2(v.site.x),z:r2(v.site.z)},
    end:{x:r2(end[0]),z:r2(end[1])},census:{pop:v.census.pop,households:v.census.households},
    green:v.green?{x:r2(v.green.x),z:r2(v.green.z),w:v.green.w,d:v.green.d,ry:Math.round((v.green.ry||0)*1e4)/1e4}:null,
    records:v.records.map(r=>({id:r.id,key:r.key,role:r.role,pending:!!r.pending,x:r2(r.x),z:r2(r.z),ry:Math.round(r.ry*1e4)/1e4,w:r.w,d:r.d,h:r.h})),
    lanes:(v.lanes||[]).map(l=>({id:l.id,w:l.w,main:!!l.main,pts:l.pts.map(p=>[r2(p[0]),r2(p[1])])})),error:v.error||null});}
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
   (site.hamlets||[]).forEach(V=>lay(V.id,V.end));}
  out.sites.push(site);}
 /* the roads between the towns (spec.links: [a, b, {hw, r}]): from one site's reach to the other's */
 if(spec.links&&typeof ROADS!=='undefined'){out.links=[];
  for(const L of spec.links){const A=out.sites.find(s=>s.id===L[0]),B=out.sites.find(s=>s.id===L[1]),o=L[2]||{};
   if(!A||!B){out.errors.push('link '+L[0]+'-'+L[1]+': a site is missing');continue;}
   const R=ROADS.route({name:A.id,x:A.x,z:A.z,r:o.r==null?2000:o.r},{name:B.id,x:B.x,z:B.z,r:o.r==null?2000:o.r});
   if(!R||!R.pts||R.pts.length<2){out.errors.push('link '+A.id+'-'+B.id+': no route');continue;}
   out.links.push({id:A.id+'/link/'+B.id,from:A.id,to:B.id,hw:o.hw==null?R.hw:o.hw,pts:R.pts.map(p=>[r2(p[0]),r2(p[1]),r2(p[2]==null?HL(p[0],p[1]):p[2])]),
    length_m:Math.round(R.length_m),maxGrade:Math.round((R.maxGrade||0)*1e4)/1e4});}}
 out.hash=hash(out);return out;}
/* one road from a point (a camp's gate, a village's lane end) to a site, as a record: the router starts on its own grid,
   so the road begins at the point itself, its height there held to the road's grade from the router's first point (the
   ground is shaped to the road) */
function road(n,siteId,fromId,at,to,hw){const R=ROADS.route({name:fromId,x:at.x,z:at.z,r:0},to);
 if(!R||!R.pts||R.pts.length<2)return null;
 const rest=R.pts.filter(p=>Math.hypot(p[0]-at.x,p[1]-at.z)>1),p1=rest[0],d1=Math.hypot(p1[0]-at.x,p1[1]-at.z),e1=p1[2]==null?HL(p1[0],p1[1]):p1[2];
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
  if(!A||!B||Math.hypot(a[0]-A.x,a[1]-A.z)>4000||Math.hypot(b[0]-B.x,b[1]-B.z)>4000)problems.push(L.id+': its ends are not at its towns');}
 return{ok:!problems.length,problems,counts};}
return{SLOPE,groundOk,discOk,siteFor,plan,hash,check,slopeAt};})();
