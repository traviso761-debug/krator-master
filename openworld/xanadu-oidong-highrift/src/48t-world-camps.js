// ================================================================= XANADU'S REGIONS — the pitched camps: the Golden Tears' fortified ring, the Great Caravan's halts
// [G data] settlements/xanadu/WORKS-PLAN.md sections 3 and 4 (step W2). A camp pitched for a season and struck at its end, not a
// village, so core/camp pitches it (KCAMP.pitch: the ring and its hedge; KCAMP.halt: a caravan's laager; KCAMP.tentProgram and
// tentFor: the tents by role and culture), on the world's own ground (KSITES.groundOk and siteFor, core/world 48s), with the Tents
// kit's boxes (kits/tents/src/33-tn-table.js tnDims, read in place) and the Sultanate's tune (core/region/data/xan-tune.js, read
// in place: the Tears' camp's people and season, the Great Caravan's leg). REGION-LOCAL on purpose: core/world's site planner
// (48s, 26 pages) plans the Beast Riders' camps only, so these camps are planned here at load from the region's WORLD_CAMPS
// (its 48-world-site.js), not baked into plan/sites.json; folding a generic tent camp into KSITES.plan is a core/world change
// for the next all-builds rebuild (TODO.md). This file is read in place by openworld/xanadu-lake-shore too. No THREE, no DOM:
// the same spec, world and seeds give the same camp in node, the page and Godot.
//   WORLD_CAMPS     {world, camps: [CAMP SPEC]} (the region's): CAMP SPEC {id, kind: 'ring' | 'halt', name, site (a site id of
//                   the cut), near [dx, dz] from the site (m), look (m, the search round it), way [x, z] (toward the way in: a
//                   road, a gate), season: {window: name in XAN_TUNE.calendar.windows} | {days: [[from, to], ...]} (year days,
//                   a range across the year's end wraps), and per kind:
//                     ring  culture, people (or tears: true, the tune's Tears' camp), the program's counts {sleeping, chief,
//                           trades, supply, guard, mess, stable, latrine}, hedge {key, v, gate}, works {sluices, pits, heaps}
//                           (placer sluices down the wadi's bed: the bed found by the world's flow field), struck: what stays
//                           when it is struck (the hedge's ring, the pits)
//                     halt  culture, wagons, formation ('laager' | 'line'), escort: a ring spec pitched beside the halt
//   KWCAMPS.plan(spec, o)   -> {camps: [CAMP], uncut: [{id, site, why}], errors}; o {dims (a tent key's box: the Tents kit's
//                   tnDims), ground {ok}, sites, inside (x, z) -> in the cut}. A camp whose site the cut does not hold yet (a
//                   SITES.json row the region's next recut takes) is `uncut`, not an error: it lays when its square is cut
//   CAMP  {id, kind, name, site {x, z}, R, way, gate, records: [{id, key, def, v, kind, role, trade, x, z, ry, w, d, h, dress,
//         goldRoom?}], hedge, works: [{id, key, kind: 'sluice' | 'pit' | 'heap', x, z, ry, w, d, h, pending}], escort?, census?,
//         people, season {days: [[a, b]...]}, short, struck: {hedge, works}}
//   KWCAMPS.inSeason(C, yearDay)   true while the camp stands pitched (the struck remains otherwise)
//   KWCAMPS.yearDay(clockDay)      the clock's day as the year's day (core/clock's season: day 0 is year day 259)
var KWCAMPS=(function(){'use strict';
const r2=v=>Math.round(v*100)/100;
const YEAR=365,START=259;   /* core/clock KCLOCK.YEAR: day 0 is year day 259 (XAN_TUNE.yearDay0 the same) */
const yearDay=d=>(((START+Math.floor(d))%YEAR)+YEAR)%YEAR;
const daysOf=S=>{if(!S)return[[0,YEAR]];if(S.days)return S.days.map(a=>a.slice());
 const W=typeof XAN_TUNE!=='undefined'&&XAN_TUNE.calendar.windows[S.window];if(!W)throw new Error('no window '+S.window+' in XAN_TUNE.calendar');return[W.slice()];};
const inRange=(a,b,d)=>a<=b?(d>=a&&d<=b):(d>=a||d<=b);
const inSeason=(C,d)=>C.season.days.some(r=>inRange(r[0],r[1],d));
const rec=r=>Object.assign({},r,{x:r2(r.x),z:r2(r.z),ry:Math.round(r.ry*1e4)/1e4});
/* the wadi's bed near a point: the strongest flow on a 100 m grid within `look` (a tie the nearer), then down the land's fall
   in steps (the world's own fields: WORLD.at().flow, WORLD.Hland), so the sluices stand in the bed whatever the cut names */
function bed(x0,z0,look,n,step){const H=(x,z)=>WORLD.Hland?WORLD.Hland(x,z):WORLD.H(x,z);let best=null;
 for(let j=-look;j<=look;j+=100)for(let i=-look;i<=look;i+=100){const x=x0+i,z=z0+j,r=Math.hypot(i,j);if(r>look||!WORLD.inside(x,z))continue;
  const f=WORLD.at(x,z).flow||0;if(!best||f>best.f+1e-6||(Math.abs(f-best.f)<=1e-6&&r<best.r))best={x,z,f,r};}
 if(!best)return[];const out=[[best.x,best.z]];let x=best.x,z=best.z;
 for(let k=1;k<n;k++){let bx=0,bz=0,bh=Infinity;for(let a=0;a<16;a++){const t=a/16*Math.PI*2,px=x+Math.cos(t)*step,pz=z+Math.sin(t)*step;
   if(!WORLD.inside(px,pz))continue;const h=H(px,pz);if(h<bh){bh=h;bx=px;bz=pz;}}
  if(bh===Infinity)break;x=bx;z=bz;out.push([x,z]);}
 return out.map((p,i)=>{const q=out[Math.min(out.length-1,i+1)],o=out[Math.max(0,i-1)];return{x:p[0],z:p[1],ry:Math.atan2(q[0]-o[0],q[1]-o[1]),flow:i?null:best.f};});}
function ringProgram(S,people){const P=S.program||{},sleepers=8,sleeping=P.sleeping==null?Math.ceil(people/sleepers):P.sleeping;
 return KCAMP.tentProgram({id:S.id,culture:S.culture,households:0,sleeping,chief:P.chief==null?true:P.chief,council:!!P.council,trades:P.trades||[],
  supply:P.supply==null?1:P.supply,guard:P.guard==null?1:P.guard,mess:P.mess==null?1:P.mess,stable:P.stable==null?1:P.stable,latrine:P.latrine==null?1:P.latrine});}
function pitchRing(S,o,world,at,way){const people=S.tears?XAN_TUNE.tears.camp.people:S.people;
 const T=ringProgram(S,people),prog=Object.assign({},T.program,{hedge:S.hedge?{key:S.hedge.key,v:S.hedge.v==null?0:S.hedge.v,gate:S.hedge.gate||{v:1}}:null});
 const c=KCAMP.pitch({id:S.id,world,culture:T.culture,program:prog,site:at,dims:o.dims,ground:o.ground,way,formation:'ring',gap:S.gap==null?2.5:S.gap,common:S.common==null?16:S.common});
 const records=c.records.map(r=>{const q=KCAMP.tentParse(r.key);return rec(Object.assign({},r,{def:q.key,role:q.role,trade:q.trade,dress:KCAMP.tentFor(q.role||'family',{culture:S.culture}).dress}));});
 /* the gold room: the supply tent nearest the captain's (the chief's) pavilion, under guard (WORKS-PLAN.md 3) */
 const chief=records.find(r=>r.role==='chief');if(chief){const sup=records.filter(r=>r.role==='supply').sort((a,b)=>Math.hypot(a.x-chief.x,a.z-chief.z)-Math.hypot(b.x-chief.x,b.z-chief.z)||(a.id<b.id?-1:1))[0];
  if(sup)sup.goldRoom=true;}
 const census=KCAMP.census({id:S.id,world,culture:T.culture,program:T.program});
 return{camp:c,records,people,census};}
function plan(spec,o){const out={camps:[],uncut:[],errors:[]},sites=o.sites||[];
 for(const S of spec.camps||[]){const st=sites.find(s=>s.id===S.site);
  if(!st||(o.inside&&!o.inside(st.x+S.near[0],st.z+S.near[1]))){out.uncut.push({id:S.id,site:S.site,why:st?'its point is outside the cut':'the cut has no site '+S.site+' yet (the region\'s next recut)'});continue;}
  const look=S.look==null?1500:S.look,R0=S.kind==='halt'?70:60,near=[st.x+S.near[0],st.z+S.near[1]];
  const at=KSITES.siteFor(near,look,R0);if(!at){out.errors.push(S.id+': no ground within '+look+' m of its point');continue;}
  const way=S.way||[st.x-at.x,st.z-at.z],L=Math.hypot(way[0],way[1])||1,u=[way[0]/L,way[1]/L],world=KRAND.hash(spec.world>>>0,KRAND.child(7,String(S.id)));
  let C;
  try{
   if(S.kind==='ring'){const P=pitchRing(S,o,world,at,u),c=P.camp;
    C={id:S.id,kind:'ring',name:S.name,site:{x:r2(at.x),z:r2(at.z)},R:r2(c.R),way:u.map(r2),gate:{x:r2(c.gate.x),z:r2(c.gate.z)},records:P.records,
     hedge:c.hedge?{key:c.hedge.key,v:c.hedge.v,gateV:c.hedge.gateV,pts:c.hedge.pts.map(p=>[r2(p[0]),r2(p[1])]),gates:c.hedge.gates.map(r2)}:null,
     people:P.people,census:{pop:P.census.pop,adults:P.census.adults,households:P.census.households},short:c.short.slice(),works:[]};
    /* the works: the placer sluices down the wadi's bed, the prospect pits and the tailings round the camp's ground */
    const W=S.works||{};
    if(W.sluices){const B=bed(at.x,at.z,W.look==null?3000:W.look,W.sluices,W.step==null?60:W.step);
     B.forEach((b,i)=>C.works.push({id:S.id+':sluice:'+i,key:'xa_placer_sluice',kind:'sluice',x:r2(b.x),z:r2(b.z),ry:Math.round(b.ry*1e4)/1e4,w:12,d:32,h:3,pending:true,flow:b.flow}));}
    for(let k=0;k<(W.pits||0);k++){const a=KRAND.unit(KRAND.hash(world,k,11))*Math.PI*2,r=C.R+40+KRAND.unit(KRAND.hash(world,k,12))*160,x=at.x+Math.cos(a)*r,z=at.z+Math.sin(a)*r;
     if(o.ground.ok(x,z))C.works.push({id:S.id+':pit:'+k,key:'pit',kind:'pit',x:r2(x),z:r2(z),ry:Math.round(a*1e4)/1e4,w:4,d:3,h:1.2,pending:true});}
    C.works.filter(w=>w.kind==='sluice').forEach((w,i)=>{if(i<(W.heaps||0))C.works.push({id:S.id+':heap:'+i,key:'tailings',kind:'heap',x:r2(w.x+Math.cos(w.ry)*12),z:r2(w.z-Math.sin(w.ry)*12),ry:w.ry,w:9,d:7,h:1.6,pending:true});});
    C.struck={hedge:!!(S.struck&&S.struck.hedge),works:(S.struck&&S.struck.works)||[]};}
   else if(S.kind==='halt'){const wagons=S.wagons;
    const h=KCAMP.halt({id:S.id,world,culture:S.culture,wagons,site:at,way:u,formation:S.formation||'laager',dims:o.dims,ground:o.ground,gap:S.gap});
    C={id:S.id,kind:'halt',name:S.name,site:{x:r2(h.site.x),z:r2(h.site.z)},R:R0,way:u.map(r2),gate:{x:r2(h.gate.x),z:r2(h.gate.z)},formation:h.formation,
     records:h.records.map(r=>rec(Object.assign({},r,{dress:KCAMP.tentFor(r.role==='supply'?'supply':r.role||'family',{culture:S.culture}).dress,
      fallback:KCAMP.tentFor('family',{culture:S.culture}).fallback||null}))),hedge:null,works:[],short:h.short.slice(),wagons,struck:{hedge:false,works:[]}};
    /* the escort's ring beside it, across the road from the laager's middle by its reach and the ring's */
    if(S.escort){const E=S.escort,ex=at.x-u[1]*(E.off==null?150:E.off),ez=at.z+u[0]*(E.off==null?150:E.off),eat=KSITES.siteFor([ex,ez],600,50);
     if(!eat)out.errors.push(S.id+': no ground for the escort\'s ring');
     else{const P=pitchRing(Object.assign({id:S.id+'/escort'},E),o,KRAND.hash(world,3),eat,u);
      C.escort={id:S.id+'/escort',name:E.name,site:{x:r2(eat.x),z:r2(eat.z)},R:r2(P.camp.R),records:P.records,people:P.people,short:P.camp.short.slice(),
       hedge:P.camp.hedge?{key:P.camp.hedge.key,pts:P.camp.hedge.pts.map(p=>[r2(p[0]),r2(p[1])]),gates:P.camp.hedge.gates.map(r2)}:null};}}}
   else{out.errors.push(S.id+': no kind '+S.kind);continue;}
  }catch(e){out.errors.push(S.id+': '+(e&&e.message||e));continue;}
  C.season={days:daysOf(S.season),name:S.season&&S.season.window||null};
  out.camps.push(C);}
 return out;}
return{plan,inSeason,yearDay,bed,daysOf};})();
