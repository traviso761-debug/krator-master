// ================================================================= OPEN WORLD — pitched camps: the generic tent camp (KWCAMPS)
// [G data] Stage 8 T26 (the owner, 2026-11-24: "there could be many options here. add as much flexibility as possible"). A camp
// pitched for a season and struck at its end, of any people, laid on the world's own ground (KSITES.groundOk and siteFor, 48s)
// by a FORMATION: a layout rule registered by name, a plain function on records. core/camp does the maths (KCAMP.pitch: the
// ring and the horseshoe; KCAMP.halt: a caravan's laager or line; KCAMP.box, overlaps, onGround, hull and rayHit for the rest;
// KCAMP.tentProgram, tentFor, tentDims: the tents by role and culture); core/space files the boxes. A camp sits in the baked
// site plan (48s KSITES.plan: a site's `camps` entry with a `kind`, beside the Beast Riders' bands, or the region's own `camps`
// list) or is planned at load (KWCAMPS.plan); 88s draws it. No THREE, no DOM, no Math.random: the same spec, world and seeds
// give the same camp in node (core/world/bake_sites.py), the page and Godot. core/world/README.md, "Pitched camps (KWCAMPS)".
//
//   CAMP SPEC {id, kind (a formation's name), name?, culture?, and where: site (a site id) + near [dx, dz] | at [x, z] (the
//             region's frame) | px [x, y] (the 5.1 canvas); look? (m searched round the point, 1500), R? (the disc of ground it
//             wants: the formation's), way? [x, z] (toward the way in; default toward its site), people?, program? (core/camp's
//             tentProgram counts: sleeping, sleepers (8 a sleeping tent), chief, council, trades, supply, trade, guard, mess,
//             stable, latrine, size), hedge? {key, v, gate}, gap?, common?, wind?, when? (`season` is its old name), works?
//             [{rule, ...}], marks? [{as, role, near?}], after? [hook names], struck? {hedge, works: [kinds]}, escort? (a CAMP
//             SPEC laid beside it, `off` m across the way; its kind 'ring' by default), road? (a site's camp: a road from its
//             gate), and what its formation reads (halt: wagons, formation 'laager' | 'line'; line: lane; cluster: group, spread)}
//   people    a number | a census record {pop} (core/camp's KCAMP.census, or any) | {census: {culture (a core/camp row),
//             program}} (KCAMP.census counts it) | {provider: name, ...} (KWCAMPS.people) | a function (spec, ctx) -> any of those
//   when      absent: always pitched | [[from, to], ...] or {days: [[from, to], ...]} (year days; a range across the year's end
//             wraps) | {window: name} (a KWCAMPS.calendar names its days) | {rule: name, ...args} (KWCAMPS.when: a test of the
//             year day) | a function (yearDay, spec) -> bool (registered as the rule 'camp:<id>', so the record stays JSON)
//   CAMP      {id, kind, name, culture, site {x, z}, R, way, gate, records: [SLOT], hedge, works: [WORK], people?, census?,
//             short, struck {hedge, works}, season {days | null, name, rule?, args?}, boxes (where its boxes came from:
//             'given' | 'tents-kit' | 'tents-table' | 'region' | 'pending', joined by '+'), marks?, escort?, road?, and the
//             formation's own fields (halt: formation, wagons; cluster: fires)}
//   SLOT      {id, key (the program key 'tn-bell-m@family'), v, kind, x, z, ry (+z, the door, turned to its hearth, lane or
//             fire), w, d, h (its yard counted), def (the Tents kit's def), role, trade, dress, fallback (the people asked for
//             when the dress fell back to generic), pending? (no kit had its box: a stand-in box), and a mark's flag}
//   WORK      {id, key, kind, x, z, ry, w, d, h, pending, flow?}
//
//   KWCAMPS.formation(name, fn, {R, check}?)   fn(spec, ctx) -> {records, R?, gate?, hedge?, short?, site?, census?, ...own};
//             check(camp) -> {ok, detail} (the page's verify). ctx: {id, kind, world (the camp's seed), site {x, z}, way
//             (unit), culture, people, R0, dims(pkey, v), ground {ok}, unit(i, salt) (KRAND.unit of the seed), program()
//             (tentProgram), tents() (the program's tents and pens with their boxes and kinds), place(gap) (a placer filed in
//             core/space: fits(r), put(r), first([r...])), enclose(records, hedge) (a hedge round them, its gate on the way),
//             pens(placer, pens, R) (the pens downwind of R)}. Shipped: ring, horseshoe (KCAMP.pitch), halt (KCAMP.halt), line
//             (a street of two rows facing a lane), cluster (households round their fires). A region or a kit registers more
//   KWCAMPS.people(name, fn)    fn(args, spec, ctx) -> people        KWCAMPS.when(name, fn)   fn(yearDay, args, camp) -> bool
//   KWCAMPS.calendar(name, fn)  fn(window) -> [from, to] | [[from, to], ...] | null
//   KWCAMPS.works(name, fn)     fn(rule, camp, ctx) -> [WORK] (shipped: bed (n pieces down the strongest flow's bed), scatter
//                               (n round the camp, on good ground), beside (one beside each work of a kind))
//   KWCAMPS.hook(name, fn)      fn(camp, spec, ctx) after the camp is laid      KWCAMPS.kitDims(name, fn)   fn(def) -> {w, d, h}
//             Every registry: fn null removes the name; each returns KWCAMPS (chained)
//   KWCAMPS.plan(spec, o)       {world, camps: [CAMP SPEC]} -> {camps, uncut: [{id, site, why}], errors}; o {dims?(pkey, v),
//                               ground?, sites?, inside?, siteFor?}. A camp whose point the cut does not hold yet is `uncut`
//   KWCAMPS.lay(spec, world, o) one camp -> {camp, errors} | {uncut} | {error}; o also takes anchor {x, z} (the site it is on)
//   KWCAMPS.of(plan)            a site plan's camps -> {camps, uncut}: a site's (with a kind) and the region's; a version 1
//                               plan (before the camps) has none
//   KWCAMPS.inSeason(camp, yearDay), KWCAMPS.yearDay(clockDay) (core/clock: day 0 is year day 259), KWCAMPS.days(when)
//   KWCAMPS.bed(x, z, look, n, step)   the strongest flow within look (a 100 m grid), then down the land's fall
//   KWCAMPS.boxOf(def) -> {D, src} | null   a tent def's box from the first source that has it: the Tents kit's bundle (TNK.box,
//                               else TNK.dims()), the kit's table read in place (tnDims: what the bake reads), a region's kitDims
var KWCAMPS=(function(){'use strict';
const r2=v=>Math.round(v*100)/100,r4=v=>Math.round(v*1e4)/1e4;
const YEAR=365,START=259;   /* core/clock KCLOCK.YEAR: day 0 is year day 259 */
const yearDay=d=>(((START+Math.floor(d))%YEAR)+YEAR)%YEAR;
const inRange=(a,b,d)=>a<=b?(d>=a&&d<=b):(d>=a||d<=b);
const api={};
/* ---------------------------------------------------------------- the registries (open: a region or a kit adds its own) */
const REG={formation:{},people:{},when:{},calendar:{},works:{},hook:{},kit:{}};
const reg=kind=>function(name,fn,o){if(fn==null){delete REG[kind][name];return api;}
 if(typeof fn!=='function')throw new Error('KWCAMPS.'+kind+'('+name+'): not a function');
 REG[kind][name]=kind==='formation'?{fn,R:(o&&o.R!=null)?o.R:60,check:(o&&o.check)?o.check:null}:fn;return api;};
const names=kind=>Object.keys(REG[kind]).sort();
/* ---------------------------------------------------------------- the tents' boxes: the kit's, a region's, or pending */
let TNKD=null;
function boxOf(key){
 if(typeof TNK!=='undefined'&&TNK){
  if(typeof TNK.box==='function'){const D=TNK.box(key);if(D)return{D,src:'tents-kit'};}
  else if(typeof TNK.dims==='function'){if(!TNKD)TNKD=TNK.dims();if(TNKD[key])return{D:TNKD[key],src:'tents-kit'};}}
 if(typeof tnDims==='function'){const D=tnDims(key);if(D)return{D,src:'tents-table'};}
 for(const n of names('kit')){const D=REG.kit[n](key);if(D)return{D,src:'region'};}
 return null;}
/* a pending box (core/hamlet's pattern: a stand-in by design, drawn as massing, never a failed bake): by the def's size */
const PEND={s:{w:5,d:5,h:3},m:{w:7,d:7,h:4},l:{w:11,d:11,h:5},wagon:{w:3,d:7,h:3},screen:{w:2.5,d:2.5,h:2}};
function pendingBox(key){const m=/^tn-([a-z]+)-([sml])$/.exec(key||''),B=m&&PEND[m[1]]?PEND[m[1]]:PEND[m?m[2]:'m'];return{w:B.w,d:B.d,h:B.h};}
/* dims(pkey, v) for core/camp (KCAMP.tentDims: the def's box grown by its role's yard), and what it used */
function dimsFor(o){const pend={},src={};
 const kit=KCAMP.tentDims(k=>{const b=boxOf(k);if(!b)return null;src[b.src]=1;return b.D;});
 const stand=KCAMP.tentDims(k=>{pend[k]=1;src.pending=1;return pendingBox(k);});
 const fn=(pkey,v)=>{let D=null;if(o.dims){D=o.dims(pkey,v);if(D)src.given=1;}else D=kit(pkey,v);return D||stand(pkey,v);};
 return{fn,pend,src};}
/* ---------------------------------------------------------------- people and season */
function peopleOf(S,X){let P=S.people;if(P==null)return null;
 if(typeof P==='function')P=P(S,X);
 for(let k=0;k<6&&P!=null&&typeof P==='object';k++){
  if(P.provider!=null){const f=REG.people[P.provider];if(!f)throw new Error('no people provider '+P.provider+' (KWCAMPS.people)');P=f(P,S,X);continue;}
  if(P.census){const c=KCAMP.census(Object.assign({id:S.id,world:X.world},P.census));if(c.error)throw new Error('people: '+c.error);P=c.pop;continue;}
  if(P.pop!=null){P=P.pop;continue;}
  throw new Error('people: not a count, a census, a provider or a function');}
 if(typeof P!=='number'||!isFinite(P))throw new Error('people: '+P+' is not a number');
 return P;}
function windowDays(name){for(const n of names('calendar')){const W=REG.calendar[n](name);if(!W)continue;
  return typeof W[0]==='number'?[W.slice()]:W.map(a=>a.slice());}
 throw new Error('no window '+name+' in a calendar (KWCAMPS.calendar: '+(names('calendar').join(', ')||'none registered')+')');}
function days(W){if(W==null)return[[0,YEAR]];if(Array.isArray(W))return W.map(a=>a.slice());if(W.days)return W.days.map(a=>a.slice());
 if(W.window!=null)return windowDays(W.window);return null;}
function seasonOf(S){const W=S.when!==undefined?S.when:S.season;
 if(W==null)return{days:[[0,YEAR]],name:null};
 if(typeof W==='function'){const n='camp:'+S.id;REG.when[n]=d=>!!W(d,S);return{days:null,name:null,rule:n};}
 if(!Array.isArray(W)&&W.rule!=null){const args=Object.assign({},W);delete args.rule;return{days:null,name:W.name==null?W.rule:W.name,rule:W.rule,args};}
 const D=days(W);if(!D)throw new Error('when: not days, a window, a rule or a function');
 return{days:D,name:Array.isArray(W)?null:(W.window!=null?W.window:(W.name==null?null:W.name))};}
function inSeason(C,d){const s=C.season;if(!s)return true;
 if(s.rule!=null){const f=REG.when[s.rule];return f?!!f(d,s.args||{},C):true;}
 return(s.days||[[0,YEAR]]).some(r=>inRange(r[0],r[1],d));}
/* ---------------------------------------------------------------- the world's fields: the wadi's bed near a point */
/* the strongest flow on a 100 m grid within `look` (a tie the nearer), then down the land's fall in steps (WORLD.at().flow,
   WORLD.Hland), so a work stands in the bed whatever the map names there */
function bed(x0,z0,look,n,step){const H=(x,z)=>WORLD.Hland?WORLD.Hland(x,z):WORLD.H(x,z);let best=null;
 for(let j=-look;j<=look;j+=100)for(let i=-look;i<=look;i+=100){const x=x0+i,z=z0+j,r=Math.hypot(i,j);if(r>look||!WORLD.inside(x,z))continue;
  const at=WORLD.at(x,z),f=at&&at.flow?at.flow:0;if(!best||f>best.f+1e-6||(Math.abs(f-best.f)<=1e-6&&r<best.r))best={x,z,f,r};}
 if(!best)return[];const out=[[best.x,best.z]];let x=best.x,z=best.z;
 for(let k=1;k<n;k++){let bx=0,bz=0,bh=Infinity;for(let a=0;a<16;a++){const t=a/16*Math.PI*2,px=x+Math.cos(t)*step,pz=z+Math.sin(t)*step;
   if(!WORLD.inside(px,pz))continue;const h=H(px,pz);if(h<bh){bh=h;bx=px;bz=pz;}}
  if(bh===Infinity)break;x=bx;z=bz;out.push([x,z]);}
 return out.map((p,i)=>{const q=out[Math.min(out.length-1,i+1)],o=out[Math.max(0,i-1)];return{x:p[0],z:p[1],ry:Math.atan2(q[0]-o[0],q[1]-o[1]),flow:i?null:best.f};});}
/* ---------------------------------------------------------------- the context a formation is handed */
const RANK={chief:0,council:1,shrine:2,dwelling:3,sleep:4,trade:5};
const rankOf=t=>RANK[t.kind]==null?6:RANK[t.kind];
function programOf(S,people){const P=S.program||{},sleepers=P.sleepers==null?8:P.sleepers,
  sleeping=P.sleeping==null?(people==null?1:Math.ceil(people/sleepers)):P.sleeping;
 return KCAMP.tentProgram({id:S.id,culture:S.culture,households:P.households==null?0:P.households,sleeping,chief:P.chief==null?true:P.chief,council:!!P.council,
  trades:P.trades||[],supply:P.supply==null?1:P.supply,trade:P.trade==null?0:P.trade,guard:P.guard==null?1:P.guard,mess:P.mess==null?1:P.mess,
  stable:P.stable==null?1:P.stable,latrine:P.latrine==null?1:P.latrine,size:P.size,wind:S.wind,formation:P.formation});}
function placer(X,gap){const sp=KSPACE.create({cell:16}),placed=[],G=gap==null?2:gap,ok=X.ground.ok;let big=0;
 const fits=r=>{if(!KCAMP.onGround(r,ok))return false;const R0=Math.hypot(r.w,r.d)/2+G;return !sp.some(r.x,r.z,R0+big,q=>KCAMP.overlaps(r,q,G));};
 const put=r=>{const R=Math.hypot(r.w,r.d)/2;big=Math.max(big,R);placed.push(r);sp.insert(r,r.x,r.z,R);return r;};
 return{placed,gap:G,space:sp,fits,put,first(L){for(const r of L)if(fits(r))return put(r);return null;}};}
const slot=(t,x,z,ry)=>({id:t.id,key:t.key,v:t.v,kind:t.kind,x,z,ry,w:t.w,d:t.d,h:t.h});
function pointAt(L,d){let acc=0;for(let i=0;i<L.length;i++){const a=L[i],b=L[(i+1)%L.length],s=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(d<=acc+s){const t=s?(d-acc)/s:0;return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t};}acc+=s;}return L.length?{x:L[0][0],z:L[0][1]}:null;}
function enclose(recs,site,way,H){const C=[];recs.forEach(r=>KCAMP.box(r,6).forEach(q=>C.push(q)));if(!C.length||!H)return null;
 const L=KCAMP.hull(C),g=KCAMP.rayHit(L,[site.x,site.z],way);
 return{key:H.key,v:H.v==null?0:H.v,gateV:H.gate&&H.gate.v!=null?H.gate.v:1,pts:L,gates:[g],at:pointAt(L,g)};}
/* the pens (a stable, a latrine) downwind of the tents, largest first, each the first fit on arcs out from R */
function pensOut(X,P,pens,R){const wd=X.wind,aw=Math.atan2(wd[1],wd[0]),short=[];
 pens.slice().sort((a,b)=>(b.w*b.d-a.w*a.d)||(a.id<b.id?-1:1)).forEach(t=>{let got=null;
  for(let ring=0;ring<8&&!got;ring++){const r0=R+6+ring*7+Math.max(t.w,t.d)/2,n=Math.max(3,Math.floor(r0*2.2/6));
   for(let j=0;j<=n&&!got;j++){const s=j===0?0:(j%2?1:-1)*Math.ceil(j/2),a=aw+s*6/r0;if(Math.abs(s*6/r0)>1.4)continue;
    const x=X.site.x+Math.cos(a)*r0,z=X.site.z+Math.sin(a)*r0;got=P.first([slot(t,x,z,Math.atan2(X.site.x-x,X.site.z-z))]);}}
  if(!got)short.push(t.id);});
 return short;}
function ctx(S,seed,site,way,D,ground,R0){const X={id:S.id,kind:S.kind,spec:S,world:seed,site:{x:site.x,z:site.z},way,culture:S.culture,people:null,R0,
  dims:D.fn,ground,unit:(i,salt)=>KRAND.unit(KRAND.hash(seed,i,salt==null?0:salt)),enclose,pens:(P,pens,R)=>pensOut(X,P,pens,R),place:gap=>placer(X,gap)};
 X.program=()=>X._prog||(X._prog=programOf(S,X.people));
 X.tents=()=>{const T=X.program(),row=KCAMP.CULTURES[T.culture];
  return KCAMP.tentIds(S.id,T.program).map(t=>{const B=X.dims(t.key,t.v);return{id:t.id,key:t.key,v:t.v,pen:t.pen,kind:(row&&row.kind(t.key))||(t.pen?'pen':'dwelling'),w:B.w,d:B.d,h:B.h};});};
 const row0=()=>KCAMP.CULTURES[X.program().culture]||{};
 Object.defineProperty(X,'wind',{get:()=>{const w=S.wind||row0().wind||[0.7071,0.7071],L=Math.hypot(w[0],w[1])||1;return[w[0]/L,w[1]/L];}});
 return X;}
/* ---------------------------------------------------------------- the shipped formations */
/* ring and horseshoe: core/camp's pitch (the doors round a common, the chief's pavilion opposite the way in; a horseshoe open
   over a quarter of the ring toward the way in), its hedge round all of it with the gate on the way, and its census */
function ringLike(S,X){const T=X.program(),prog=Object.assign({},T.program,{hedge:S.hedge?{key:S.hedge.key,v:S.hedge.v==null?0:S.hedge.v,gate:S.hedge.gate||{v:1}}:null});
 const c=KCAMP.pitch({id:S.id,world:X.world,culture:T.culture,program:prog,site:X.site,dims:X.dims,ground:X.ground,way:X.way,
  formation:X.kind==='horseshoe'?'horseshoe':'ring',gap:S.gap==null?2.5:S.gap,common:S.common==null?16:S.common});
 if(c.error)throw new Error(c.error);
 const cs=KCAMP.census({id:S.id,world:X.world,culture:T.culture,program:T.program});
 return{records:c.records,R:c.R,gate:c.gate,hedge:c.hedge,short:c.short,census:{pop:cs.pop,adults:cs.adults,households:cs.households}};}
/* halt: core/camp's caravan halt (the wagons in a laager round the house's pavilion, the gate on the road; or a line along it) */
function halt(S,X){const h=KCAMP.halt({id:S.id,world:X.world,culture:S.culture,wagons:S.wagons,site:X.site,way:X.way,formation:S.formation||'laager',
  dims:X.dims,ground:X.ground,gap:S.gap,wind:S.wind});
 return{records:h.records,site:h.site,gate:h.gate,short:h.short,formation:h.formation,wagons:S.wagons};}
/* line: a street (an army's, a fair's): two rows of tents facing a lane that runs from the way in, centred on the site, the
   chief's at its head facing down it, the pens downwind */
function line(S,X){const T=X.tents(),P=X.place(S.gap==null?2:S.gap),u=X.way,v=[-u[1],u[0]],s0=X.site,half=(S.lane==null?8:S.lane)/2,short=[];
 const tents=T.filter(t=>!t.pen).sort((a,b)=>(rankOf(a)-rankOf(b))||(a.id<b.id?-1:1)),pens=T.filter(t=>t.pen);
 const head=tents[0]&&tents[0].kind==='chief'?tents[0]:null,rows=tents.filter(t=>t!==head);
 const at=(a,b)=>[s0.x+u[0]*a+v[0]*b,s0.z+u[1]*a+v[1]*b],yaw=d=>Math.atan2(d[0],d[1]);
 const a0=rows.reduce((s,t)=>s+t.w+P.gap,0)/4+(head?head.d/2:0);   /* the mouth: half a row's length toward the way in */
 const run=[0,0];
 for(const t of rows){const side=run[0]<=run[1]?0:1,sg=side?-1:1;let got=null;
  for(let k=0;k<24&&!got;k++){const a=a0-(run[side]+t.w/2+k*1.5),p=at(a,sg*(half+t.d/2));
   got=P.first([slot(t,p[0],p[1],yaw([-sg*v[0],-sg*v[1]]))]);if(got)run[side]=a0-a+t.w/2+P.gap;}
  if(!got)short.push(t.id);}
 const end=Math.max(run[0],run[1]);
 if(head){let got=null;for(let k=0;k<24&&!got;k++){const p=at(a0-(end+3+head.d/2+k*1.5),0);got=P.first([slot(head,p[0],p[1],yaw(u))]);}if(!got)short.push(head.id);}
 const R=P.placed.reduce((m,r)=>Math.max(m,Math.hypot(r.x-s0.x,r.z-s0.z)+Math.hypot(r.w,r.d)/2),0);
 short.push(...X.pens(P,pens,R));
 const g=at(a0+4,0);
 return{records:P.placed,R,gate:{x:g[0],z:g[1]},short,lane:half*2};}
/* cluster: households round their fires (a band at ease, a refugees' camp): groups of `group` tents, the first (the chief's)
   at the site, the rest on a sunflower spiral `spread` m apart, each tent first fit on its group's ring facing the fire */
function cluster(S,X){const T=X.tents(),gap=S.gap==null?2:S.gap,P=X.place(gap),g=Math.max(1,S.group==null?4:S.group),short=[],fires=[];
 const tents=T.filter(t=>!t.pen).sort((a,b)=>(rankOf(a)-rankOf(b))||(a.id<b.id?-1:1)),pens=T.filter(t=>t.pen);
 const big=tents.reduce((m,t)=>Math.max(m,Math.hypot(t.w,t.d)/2),2),ring=n=>Math.max(6,n*(2*big+gap)/(2*Math.PI));
 const spread=S.spread==null?2*(ring(g)+2*big)+gap+4:S.spread;
 for(let k=0;k*g<tents.length;k++){const G=tents.slice(k*g,k*g+g),a=k*2.39996323+X.unit(k,21)*0.6,rr=k?spread*Math.sqrt(k):0;
  const cx=X.site.x+Math.cos(a)*rr,cz=X.site.z+Math.sin(a)*rr,rg=ring(G.length),b0=X.unit(k,22)*Math.PI*2;
  G.forEach((t,j)=>{let got=null;
   for(let m=0;m<12&&!got;m++){const b=b0+j/G.length*Math.PI*2+(m%2?1:-1)*Math.ceil(m/2)*0.12,r0=rg+t.d/2+(m>>1)*1.2,x=cx+Math.cos(b)*r0,z=cz+Math.sin(b)*r0;
    got=P.first([slot(t,x,z,Math.atan2(cx-x,cz-z))]);}
   if(!got)short.push(t.id);});
  fires.push({x:r2(cx),z:r2(cz)});}
 const R=P.placed.reduce((m,r)=>Math.max(m,Math.hypot(r.x-X.site.x,r.z-X.site.z)+Math.hypot(r.w,r.d)/2),0);
 short.push(...X.pens(P,pens,R));
 return{records:P.placed,R,short,fires};}
/* the form a verify reads (each formation's own; the marks, works and people are checked for every camp, below) */
const chief=C=>C.records.some(r=>r.role==='chief');
const ringCheck=C=>{const gates=C.hedge?C.hedge.gates.length:0;return{ok:chief(C)&&(!C.hedge||gates===1),detail:'gates '+gates+', the chief\'s '+(chief(C)?'pitched':'missing')};};
const haltCheck=C=>{const wag=C.records.filter(r=>/wagon/.test(r.def||r.key)).length;
 return{ok:(C.wagons==null||wag===C.wagons)&&chief(C)&&(!C.escortAsked||!!(C.escort&&C.escort.records.length>=4)),
  detail:C.formation+': '+wag+(C.wagons==null?'':' of '+C.wagons)+' wagons, '+C.records.length+' pieces, escort '+(C.escort?C.escort.records.length+' tents':'none')};};
const anyCheck=C=>({ok:C.records.length>0,detail:C.records.length+' tents'});
reg('formation')('ring',ringLike,{R:60,check:ringCheck});
reg('formation')('horseshoe',ringLike,{R:60,check:ringCheck});
reg('formation')('halt',halt,{R:70,check:haltCheck});
reg('formation')('line',line,{R:60,check:anyCheck});
reg('formation')('cluster',cluster,{R:80,check:anyCheck});
/* ---------------------------------------------------------------- the shipped works rules */
const pendOf=W=>W.pending==null?true:!!W.pending;
reg('works')('bed',(W,C,X)=>bed(X.site.x,X.site.z,W.look==null?3000:W.look,W.n==null?1:W.n,W.step==null?60:W.step).map((b,i)=>({id:C.id+':'+(W.kind||'bed')+':'+i,key:W.key,
 kind:W.kind||'bed',x:r2(b.x),z:r2(b.z),ry:r4(b.ry),w:W.w,d:W.d,h:W.h,pending:pendOf(W),flow:b.flow})));
reg('works')('scatter',(W,C,X)=>{const out=[],s=W.salt==null?11:W.salt,r0=W.r0==null?40:W.r0,span=W.span==null?160:W.span;
 for(let k=0;k<(W.n==null?0:W.n);k++){const a=X.unit(k,s)*Math.PI*2,r=C.R+r0+X.unit(k,s+1)*span,x=X.site.x+Math.cos(a)*r,z=X.site.z+Math.sin(a)*r;
  if(X.ground.ok(x,z))out.push({id:C.id+':'+(W.kind||'scatter')+':'+k,key:W.key,kind:W.kind||'scatter',x:r2(x),z:r2(z),ry:r4(a),w:W.w,d:W.d,h:W.h,pending:pendOf(W)});}
 return out;});
reg('works')('beside',(W,C,X)=>{const off=W.off==null?12:W.off,n=W.n==null?Infinity:W.n;
 return C.works.filter(w=>w.kind===W.of).filter((w,i)=>i<n).map((w,i)=>({id:C.id+':'+(W.kind||'beside')+':'+i,key:W.key,kind:W.kind||'beside',
  x:r2(w.x+Math.cos(w.ry)*off),z:r2(w.z-Math.sin(w.ry)*off),ry:w.ry,w:W.w,d:W.d,h:W.h,pending:pendOf(W)}));});
/* ---------------------------------------------------------------- laying one camp */
const seedOf=(world,id)=>KRAND.hash((world==null?0:world)>>>0,KRAND.child(7,String(id)));
const loop=L=>L?{key:L.key,v:L.v,gateV:L.gateV,pts:L.pts.map(p=>[r2(p[0]),r2(p[1])]),gates:(L.gates||[]).map(r2)}:null;
/* every slot: rounded, its def, role and trade, its dress (core/camp's (role, culture) map) and whether its box is pending */
function finish(recs,culture,pend){const fam=KCAMP.tentFor('family',{culture}),fb=fam&&fam.fallback?fam.fallback:null;
 return recs.map(r=>{const q=KCAMP.tentParse(r.key),role=r.role!=null?r.role:q.role,t=KCAMP.tentFor(role||'family',{culture})||fam;
  const o=Object.assign({},r,{def:r.def||q.key,role,trade:r.trade!==undefined?r.trade:q.trade,dress:t.dress,fallback:fb},{x:r2(r.x),z:r2(r.z),ry:r4(r.ry)});
  if(pend[o.def])o.pending=true;return o;});}
function assemble(S,X,res,D){const site=res.site||X.site,R=res.R==null?X.R0:res.R,hedge=res.hedge||null;
 const gate=res.gate||(hedge&&hedge.at)||{x:site.x+X.way[0]*(R+8),z:site.z+X.way[1]*(R+8)};
 const C={id:S.id,kind:S.kind,name:S.name==null?null:S.name,culture:S.culture==null?null:S.culture,site:{x:r2(site.x),z:r2(site.z)},R:r2(R),way:X.way.map(r2),
  gate:{x:r2(gate.x),z:r2(gate.z)},records:finish(res.records||[],S.culture,D.pend),hedge:loop(hedge),works:[],short:(res.short||[]).slice()};
 if(X.people!=null)C.people=X.people;
 if(res.census)C.census=res.census;
 for(const k of Object.keys(res))if(!(k in C)&&['records','R','gate','hedge','short','site','census'].indexOf(k)<0)C[k]=res[k];
 return C;}
function lay(S,world,o){o=o||{};const id=S&&S.id;if(!id)return{error:'a camp with no id'};
 const F=REG.formation[S.kind];if(!F)return{error:id+': no formation '+S.kind+' (KWCAMPS.formation: '+names('formation').join(', ')+')'};
 /* where: a site of the cut and an offset, a point in the region's frame, or a place on the 5.1 canvas */
 const sites=o.sites||(typeof WORLD_DATA!=='undefined'&&WORLD_DATA&&WORLD_DATA.meta&&WORLD_DATA.meta.sites)||[];
 const inside=o.inside||(typeof WORLD!=='undefined'&&WORLD&&WORLD.inside?((x,z)=>WORLD.inside(x,z)):null);
 let st=o.anchor||null,p;
 if(st||S.site!=null){if(!st)st=sites.find(s=>s.id===S.site);
  if(!st)return{uncut:{id,site:S.site,why:'the cut has no site '+S.site+' yet (the region\'s next recut)'}};
  const n=S.near||[0,0];p=[st.x+n[0],st.z+n[1]];}
 else if(S.at)p=[S.at[0],S.at[1]];
 else if(S.px)p=WORLD.fromPx(S.px[0],S.px[1]);
 else return{error:id+': no site, at or px'};
 if(inside&&!inside(p[0],p[1]))return{uncut:{id,site:S.site==null?null:S.site,why:'its point is outside the cut'}};
 const look=S.look==null?1500:S.look,R0=S.R==null?F.R:S.R,at=(o.siteFor||KSITES.siteFor)(p,look,R0);
 if(!at)return{error:id+': no ground within '+look+' m of its point'};
 const w0=S.way||(st?[st.x-at.x,st.z-at.z]:[0,1]),L=Math.hypot(w0[0],w0[1])||1,u=[w0[0]/L,w0[1]/L];
 const seed=seedOf(world,id),D=dimsFor(o),ground=o.ground||{ok:KSITES.groundOk},errors=[];
 let C;
 try{const X=ctx(S,seed,at,u,D,ground,R0);X.people=peopleOf(S,X);
  C=assemble(S,X,F.fn(S,X),D);
  for(const W of S.works||[]){const f=REG.works[W.rule];if(!f)throw new Error('no works rule '+W.rule+' (KWCAMPS.works: '+names('works').join(', ')+')');
   for(const w of f(W,C,X)||[])C.works.push(w);}
  if(S.works)C.worksAsked=S.works.map(W=>({rule:W.rule,kind:W.kind||W.rule,n:W.n==null?1:W.n}));
  /* the marks: a role's record nearest another role's (or its first) flagged (the Tears' gold room: the supply tent nearest
     the captain's pavilion) */
  for(const M of S.marks||[]){const to=M.near?C.records.find(r=>r.role===M.near):null;if(M.near&&!to)continue;
   const c=C.records.filter(r=>r.role===M.role&&(!M.kind||r.kind===M.kind)).sort((a,b)=>(to?Math.hypot(a.x-to.x,a.z-to.z)-Math.hypot(b.x-to.x,b.z-to.z):0)||(a.id<b.id?-1:1))[0];
   if(c)c[M.as]=true;}
  if(S.marks)C.marks=S.marks.map(M=>M.as);
  C.struck={hedge:!!(S.struck&&S.struck.hedge),works:(S.struck&&S.struck.works)||[]};
  /* the escort: a camp of its own beside it, across the way from its middle */
  if(S.escort){const E=S.escort,off=E.off==null?150:E.off,ex=at.x-u[1]*off,ez=at.z+u[0]*off,eat=(o.siteFor||KSITES.siteFor)([ex,ez],600,50);C.escortAsked=true;
   if(!eat)errors.push(id+': no ground for the escort\'s camp');
   else{const ES=Object.assign({id:id+'/escort',kind:'ring'},E),EF=REG.formation[ES.kind];if(!EF)throw new Error('escort: no formation '+ES.kind);
    const EX=ctx(ES,KRAND.hash(seed,3),eat,u,D,ground,50);EX.people=peopleOf(ES,EX);const EC=assemble(ES,EX,EF.fn(ES,EX),D);
    C.escort={id:EC.id,kind:EC.kind,name:EC.name,culture:EC.culture,site:EC.site,R:EC.R,records:EC.records,people:EC.people,short:EC.short,hedge:EC.hedge};}}
  C.season=seasonOf(S);
  const src=Object.keys(D.src).sort();C.boxes=src.length?src.join('+'):'none';
  if(S.road)C.road=true;
  for(const h of S.after||[]){const f=REG.hook[h];if(!f)throw new Error('no hook '+h+' (KWCAMPS.hook)');f(C,S,X);}
 }catch(e){return{error:id+': '+(e&&e.message||e)};}
 return{camp:C,errors};}
function plan(spec,o){o=o||{};const out={camps:[],uncut:[],errors:[]};
 for(const S of spec.camps||[]){const r=lay(S,spec.world,o);if(r.uncut)out.uncut.push(r.uncut);if(r.error)out.errors.push(r.error);
  if(r.camp)out.camps.push(r.camp);(r.errors||[]).forEach(e=>out.errors.push(e));}
 return out;}
/* a site plan's camps: version 2 carries them (a site's camp with a kind; the region's `camps`; `uncut`); version 1 none */
function of(P){const out={camps:[],uncut:[]};if(!P||!(P.version>=2))return out;
 for(const S of P.sites||[])for(const c of S.camps||[])if(c.kind)out.camps.push(c);
 for(const c of P.camps||[])out.camps.push(c);for(const u of P.uncut||[])out.uncut.push(u);
 return out;}
Object.assign(api,{formation:reg('formation'),people:reg('people'),when:reg('when'),calendar:reg('calendar'),works:reg('works'),hook:reg('hook'),kitDims:reg('kit'),
 plan,lay,of,inSeason,yearDay,days,bed,boxOf,pendingBox,seedOf,YEAR,registered:kind=>names(kind==='kitDims'?'kit':kind),
 check:C=>{const F=REG.formation[C.kind];return F&&F.check?F.check(C):anyCheck(C);}});
return api;})();
