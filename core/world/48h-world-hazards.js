// ================================================================= OPEN WORLD — hazards: a region's placed hazards, fields, fronts and way closures (WHAZ)
// [G data] openworld/catch-bowl/PLAN-HAZARDS.md section 5 & PLAN-TWINS-CROSSING.md W5 (2026-11-25). Plans a region's
// SITE_SPEC.hazards into the baked site plan (version 3, beside WFIX; a region with none stays version 1 or 2, its hash
// untouched). Plain functions on plain records: no THREE, no DOM, no Math.random, no draw counts, so node
// (core/world/bake_sites.py), the browser (88h-world-hazards.js) and Godot (core/world/whaz.gd) read and evaluate the exact
// same records.
//
// Four placement modes in SITE_SPEC.hazards:
//   1. Point / shape (`at: [x, z]`, `px: [px, py]`, or `site: '<id>'` + `near?: [dx, dz]`):
//      {id, kind, at|px|site, near?, ry?, r?, h?, size?, yOffset?, hazard (a KHAZ body: shape, effect, danger, dose,
//       falloff, cycle, trigger, move, nav, tell, stateFn, crust, under, night, seal, burst, inrush, hunter, ...),
//       below? (for a crust: automatically emits `<id>/below` with stateFn 'KHAZ.under' and under: {crust: id}), when?, name?}
//      Outside WORLD.inside or on a site the cut lacks -> `uncut`, never an error.
//   2. Field (`field: '<name>'`):
//      {id, field: name, cell? (m, default 2000), box? ([x0, z0, x1, z1]), salt?, maxPerCell? (1), when?, ...args}
//      WHAZ.field(name, fn) registers `fn(sample, ctx) -> null | KHAZ_BODY | [KHAZ_BODY, ...]`, evaluated deterministically per
//      grid cell with KRAND.hash(seed, cx, cz, idx, salt). Built-in fields:
//        - 'stalker': Stalker hunter triads (harpooner + 2 blades) in dune/reg terrain a stage out from oases/ways, with
//                     empty tell ({colour: '#000000', fx: null, sound: null, sign: null}) so no overlay or sound betrays them.
//        - 'thin-air-avoid': high-crest avoid zones (> elev, default 8000 m) for navigation pathing.
//   3. Front (`front: {px?: [[px, py], ...], path?: [[x, z] | [x, y, z], ...], w, speed, period?, start?, rise?, hold?,
//      fall?, depth?, base?, len?, edge?}`):
//      Builds a travelling storm, flood or charge record (`stateFn: 'KHAZ.front'`), interpolating bed elevation from WORLD.Hland
//      along the path inside the cut.
//   4. Way closure (`way: '<wayOrLinkId>'`):
//      {id, way, kind? ('storm'|'cold'|'whiteout'|'flood'), when (days / calendar window / rule), danger?, why?, name?}
//      Stored in `plan.hazardWays` and queried via `WHAZ.wayOpen(plan, wayId, yearDay)` so KTRAVEL and the sim close legs in
//      step with the world clock.
//
//   WHAZ.field(name, fn)         register (or remove with null) a field generator; chained
//   WHAZ.registered()            sorted list of registered field names
//   WHAZ.lay(entry, seed, o)     plan one hazard entry -> {records, ways, uncut, errors}
//   WHAZ.plan(spec, o)           plan SITE_SPEC.hazards -> {hazards: [REC], ways: [WAY_HAZ], uncut, errors}
//   WHAZ.of(plan)                extract {hazards, ways, uncut} from a site plan (empty on version 1 or 2)
//   WHAZ.inSeason(rec, yearDay)  true when the hazard or way closure is active on `yearDay` (0..364; reuses KWCAMPS seasons)
//   WHAZ.wayOpen(plan, wayId, yearDay) -> {open: bool, closedBy: [WAY_HAZ]}
//   WHAZ.insideShape(rec, x, z, y) -> -1 outside, else falloff fraction 0..1 (core..edge), matching KHAZ.inside in pure data
//   WHAZ.at(plan, x, z, o)       active planned records holding (x, z[, y]) on o.yearDay, worst danger first
//   WHAZ.check(plan, opt)        validate planned hazards & way closures -> {ok, problems, counts}
var WHAZ=(function(){'use strict';
const r2=v=>Math.round(v*100)/100,r4=v=>Math.round(v*1e4)/1e4;
const YEAR=365,START=259;
const yearDay=d=>(((START+Math.floor(d))%YEAR)+YEAR)%YEAR;
const inRange=(a,b,d)=>a<=b?(d>=a&&d<=b):(d>=a||d<=b);
const copy=o=>o==null||typeof o!=='object'?o:Array.isArray(o)?o.map(copy):Object.assign({},...Object.keys(o).map(k=>({[k]:copy(o[k])})));
const KINDS={heat:1,cold:1,gas:1,acid:1,poison:1,fall:1,pit:1,thorn:1,grab:1,drown:1,sink:1,slip:1,crush:1,hunter:1,trap:1,mine:1,time:1,rockburst:1,inrush:1,seal:1};
const api={},FIELDS={};

function field(name,fn){if(fn==null){delete FIELDS[name];return api;}
 if(typeof fn!=='function')throw new Error('WHAZ.field('+name+'): not a function');
 FIELDS[name]=fn;return api;}
function registered(){return Object.keys(FIELDS).sort();}

/* season resolution: delegates to KWCAMPS when loaded so camps and hazards share one regional calendar */
function seasonOf(S){const W=S.when!==undefined?S.when:S.season;
 if(W==null)return null;
 if(typeof W==='function'){const n='haz:'+S.id;if(typeof KWCAMPS!=='undefined'&&KWCAMPS.when)KWCAMPS.when(n,d=>!!W(d,S));return{days:null,name:null,rule:n};}
 if(!Array.isArray(W)&&W.rule!=null){const args=Object.assign({},W);delete args.rule;return{days:null,name:W.name==null?W.rule:W.name,rule:W.rule,args};}
 if(typeof KWCAMPS!=='undefined'&&KWCAMPS.days){const D=KWCAMPS.days(W);if(D)return{days:D,name:Array.isArray(W)?null:(W.window!=null?W.window:(W.name==null?null:W.name))};}
 if(Array.isArray(W))return{days:W.map(a=>a.slice()),name:null};
 if(W.days)return{days:W.days.map(a=>a.slice()),name:W.name==null?null:W.name};
 throw new Error('WHAZ '+S.id+': when is not days, a calendar window, a rule or a function');}

function inSeason(rec,yd){const s=rec&&rec.season;if(!s)return true;
 if(typeof KWCAMPS!=='undefined'&&KWCAMPS.inSeason)return KWCAMPS.inSeason(rec,yd);
 if(s.days)return s.days.some(r=>inRange(r[0],r[1],yd));
 return true;}

function groundH(x,z,o){if(o&&o.ground)return o.ground(x,z);
 if(typeof WORLD!=='undefined'&&WORLD){if(WORLD.Hland)return WORLD.Hland(x,z);if(WORLD.H)return WORLD.H(x,z);}
 return 0;}
function insideWorld(x,z,o){if(o&&o.inside)return o.inside(x,z);
 if(typeof WORLD!=='undefined'&&WORLD&&WORLD.inside)return WORLD.inside(x,z);
 return true;}
function fromPx(px,py,o){if(o&&o.fromPx)return o.fromPx(px,py);
 if(typeof WORLD!=='undefined'&&WORLD&&WORLD.fromPx)return WORLD.fromPx(px,py);
 if(typeof WORLD_DATA!=='undefined'&&WORLD_DATA&&WORLD_DATA.meta&&WORLD_DATA.meta.frame){const F=WORLD_DATA.meta.frame.origin_px;return[(px-F[0])*2000,(py-F[1])*2000];}
 throw new Error('WHAZ: no WORLD.fromPx to convert px coordinates');}
function worldBox(o){if(o&&o.box)return o.box;
 if(typeof WORLD!=='undefined'&&WORLD&&WORLD.box)return WORLD.box();
 return[-10000,-10000,10000,10000];}
function sampleAt(x,z,o){const h=groundH(x,z,o),A=(typeof WORLD!=='undefined'&&WORLD&&WORLD.at)?WORLD.at(x,z):{};
 return Object.assign({x,z,h,inside:insideWorld(x,z,o)},A);}

function checkBody(id,h){if(!h||typeof h!=='object')return id+': missing hazard body';
 if(!h.kind||!KINDS[h.kind])return id+': unknown hazard kind '+h.kind;
 if(typeof KHAZ!=='undefined'&&KHAZ&&KHAZ.make&&!h.under){try{KHAZ.make(h);}catch(e){return id+': '+(e&&e.message?e.message:String(e));}}
 return null;}

function makeRec(id,S,x,z,y,ry,haz,season){
 const h=copy(haz);
 /* Stalkers (hunter with silent/empty tell or stalker tag) never expose a visual colour, fx, sound or sign before triggered */
 if(h.kind==='hunter'&&S.silent!==false&&(!h.tell||S.stalker)){
  h.tell={colour:'#000000',fx:null,sound:null,sign:null};}
 const rec={id,name:S.name||id,kind:h.kind,at:[r2(x),r2(y),r2(z)],ry:r4(ry==null?0:ry),hazard:h};
 if(S.r!=null)rec.r=r2(S.r);if(S.h!=null)rec.h=r2(S.h);if(S.size)rec.size=S.size.map(r2);
 if(S.culture)rec.culture=S.culture;if(S.taboo)rec.taboo=copy(S.taboo);
 if(season)rec.season=season;
 return rec;}

/* pure-data shape test matching KHAZ.inside (sphere, cyl, box, poly) so WHAZ.at and Godot whaz.gd need no DOM/KTAGS */
function polyDist(pts,x,z){let inside=false,best=1e18;
 for(let i=0,j=pts.length-1;i<pts.length;j=i++){const xi=pts[i][0],zi=pts[i][1],xj=pts[j][0],zj=pts[j][1];
  if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/((zj-zi)||1e-12)+xi))inside=!inside;
  const ex=xj-xi,ez=zj-zi,L2=ex*ex+ez*ez>0?ex*ex+ez*ez:1,t=Math.max(0,Math.min(1,((x-xi)*ex+(z-zi)*ez)/L2));
  const d=Math.hypot(x-xi-ex*t,z-zi-ez*t);if(d<best)best=d;}
 return inside?best:-best;}

function insideShape(rec,x,z,y){const h=rec&&rec.hazard;if(!h)return -1;
 /* front hazard: check lateral distance q <= w along front.path */
 if(h.front&&Array.isArray(h.front.path)&&h.front.path.length>=2){const P=h.front.path,w=h.front.w==null?50:h.front.w;let best=1e18;
  for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],ex=b[0]-a[0],ez=b[2]-a[2],L2=ex*ex+ez*ez>0?ex*ex+ez*ez:1;
   const t=Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[2])*ez)/L2)),d=Math.hypot(x-a[0]-ex*t,z-a[2]-ez*t);if(d<best)best=d;}
  return best<=w?best/(w>0?w:1):-1;}
 const sh=h.shape||{type:rec.size?'box':'cyl'},ry=rec.ry==null?0:rec.ry,c=Math.cos(ry),s=Math.sin(ry);
 const dx=x-rec.at[0],dz=z-rec.at[2],lx=dx*c-dz*s,lz=dx*s+dz*c;
 const hh=sh.h!=null?sh.h:(rec.h!=null?rec.h:(rec.size?rec.size[2]:4)),y0=sh.y0==null?0:sh.y0,y1=sh.y1==null?hh:sh.y1;
 if(y!=null){const ly=y-rec.at[1];if(ly<y0||ly>y1)return -1;}
 if(sh.type==='sphere'){const R=sh.r!=null?sh.r:(rec.r==null?4:rec.r),dy=y==null?0:(y-rec.at[1]),d=Math.hypot(dx,dy,dz);return d<=R?d/(R>0?R:1):-1;}
 if(sh.type==='box'){const W2=(sh.w!=null?sh.w:(rec.size?rec.size[0]:4))/2,D2=(sh.d!=null?sh.d:(rec.size?rec.size[1]:4))/2;
  if(Math.abs(lx)>W2||Math.abs(lz)>D2)return -1;
  return Math.max(Math.abs(lx)/(W2>0?W2:1),Math.abs(lz)/(D2>0?D2:1));}
 if(sh.type==='poly'&&Array.isArray(sh.pts)&&sh.pts.length>=3){const sd=polyDist(sh.pts,lx,lz);if(sd<0)return -1;
  const edge=sh.edge==null?2:sh.edge;return edge>0?Math.max(0,1-sd/edge):0;}
 const R=sh.r!=null?sh.r:(rec.r==null?4:rec.r),d=Math.hypot(dx,dz);
 return d<=R?d/(R>0?R:1):-1;}

/* built-in field: 'stalker' — quiet triad hunter ambushes seeded per cell on sand/reg a stage out from oases/ways */
field('stalker',(sam,ctx)=>{
 const S=ctx.spec,p=S.density==null?0.18:S.density;
 if(!sam.inside)return null;
 const water=(typeof WORLD!=='undefined'&&WORLD&&WORLD.water)?WORLD.water(sam.x,sam.z):-1e9;
 if(water>sam.h-0.5)return null;
 const slope=sam.slope==null?0:sam.slope,maxSlope=S.maxSlope==null?0.32:S.maxSlope;
 if(slope>maxSlope)return null;
 if(S.minElev!=null&&sam.h<S.minElev)return null;
 if(S.maxElev!=null&&sam.h>S.maxElev)return null;
 /* keep a stage clear of settled towns/oases so ambushes happen out on the legs, never inside a town's walls */
 const stageMin=S.stageMin==null?1800:S.stageMin,stageMax=S.stageMax==null?45000:S.stageMax;
 if(ctx.sites&&ctx.sites.length){let near=1e18;for(const st of ctx.sites)near=Math.min(near,Math.hypot(sam.x-st.x,sam.z-st.z));
  if(near<stageMin||near>stageMax)return null;}
 /* pressure scaling (0..1, e.g. from Hub 01's hidden attrition state without naming Hub 01 in the record) */
 const mult=S.activity==null?1:Math.max(0,Math.min(1,S.activity));
 if(mult<=0||ctx.unit(1)>p*mult)return null;
 const r=S.r==null?38:S.r,yaw=ctx.unit(2)*Math.PI*2,ca=Math.cos(yaw),sa=Math.sin(yaw);
 /* triad footprint along the approach line: harpooner at the back, two blades flanking the kill pocket */
 const pts=[[-r*0.7,-r*0.5],[r*0.7,-r*0.5],[r*0.9,r*0.6],[0,r],[-r*0.9,r*0.6]].map(q=>[r2(q[0]*ca-q[1]*sa),r2(q[0]*sa+q[1]*ca)]);
 const triad=ctx.unit(3)<0.65?['st_harpooner','st_blade','st_blade']:['st_harpooner','st_blade'];
 return{kind:'hunter',effect:'bleed',danger:S.danger==null?0.92:S.danger,dose:S.dose==null?14:S.dose,
  shape:{type:'poly',pts,y0:-1,y1:6,edge:4},falloff:'none',
  trigger:{by:'near',reset:S.reset==null?600:S.reset},
  cycle:{period:S.period==null?240:S.period,warn:S.warn==null?90:S.warn,ramp:0.5,on:S.on==null?18:S.on,after:12,afterK:0.2},
  nav:{travel:1,enter:0,avoid:false},
  tell:{colour:'#000000',fx:null,sound:null,sign:null},
  hunter:{fauna:triad,count:triad.length,note:'quiet sand ambush'}};});

/* built-in field: 'thin-air-avoid' — marks extreme altitude cells (>8000 m) with nav.avoid so pathfinders refuse them */
field('thin-air-avoid',(sam,ctx)=>{
 const S=ctx.spec,elev=S.elev==null?8000:S.elev;
 if(!sam.inside||sam.h<elev)return null;
 const half=(ctx.cell==null?2000:ctx.cell)/2;
 return{kind:'gas',effect:'suffocate',danger:Math.min(1,0.75+(sam.h-elev)/8000),dose:r2(0.4+(sam.h-elev)/6000),
  shape:{type:'box',w:half*2,d:half*2,h:400,y0:-20,y1:380},falloff:'none',
  nav:{travel:20,enter:50,avoid:true},
  tell:{colour:'#9bb8e8',fx:null,sound:null,sign:'death zone: thin air above '+elev+' m'}};});

function allWaysOf(P){if(!P)return[];
 return(P.sites||[]).flatMap(s=>s.roads||[]).concat(P.links||[]).concat(P.ways||[]);}

function lay(S,seed,o){o=o||{};const records=[],ways=[],uncut=[],errors=[];
 if(!S||!S.id){errors.push('hazard entry without id');return{records,ways,uncut,errors};}
 let season=null;try{season=seasonOf(S);}catch(e){errors.push(e.message||String(e));return{records,ways,uncut,errors};}
 const hseed=KRAND.child(seed==null?1:seed,'haz/'+S.id);

 /* Mode 4: way-bound closure */
 if(S.way!=null){
  const Wlist=allWaysOf(o.plan),found=Wlist.find(w=>w.id===S.way||w.name===S.way||(w.id&&w.id.endsWith('/way/'+S.way)));
  if(!found){
   const uList=(o.plan&&o.plan.uncut)||[];
   if(uList.some(u=>u.id===S.way||(u.id&&u.id.endsWith('/way/'+S.way)))){uncut.push({id:S.id,way:S.way,why:'its way '+S.way+' is outside the cut'});return{records,ways,uncut,errors};}
   errors.push(S.id+': no way or link '+S.way);return{records,ways,uncut,errors};}
  if(!season){errors.push(S.id+': a way hazard needs a `when` window or rule');return{records,ways,uncut,errors};}
  ways.push({id:S.id,way:found.id,kind:S.kind||'storm',danger:S.danger==null?0.85:S.danger,why:S.why||S.name||S.kind||'closed',season});
  return{records,ways,uncut,errors};}

 /* Mode 3: travelling front */
 if(S.front!=null){const F=S.front,rawPts=F.px?F.px.map(p=>fromPx(p[0],p[1],o)):(F.path||[]);
  if(rawPts.length<2){errors.push(S.id+': front needs at least 2 points in px or path');return{records,ways,uncut,errors};}
  const insidePts=rawPts.filter(p=>insideWorld(p[0],p.length===3?p[2]:p[1],o));
  if(insidePts.length<2){uncut.push({id:S.id,site:null,why:'front path lies outside the cut'});return{records,ways,uncut,errors};}
  const path3=insidePts.map(p=>{if(p.length===3)return[r2(p[0]),r2(p[1]),r2(p[2])];const x=p[0],z=p[1];return[r2(x),r2(groundH(x,z,o)),r2(z)];});
  const fspec={path:path3,w:F.w==null?250:F.w,speed:F.speed==null?12:F.speed,start:F.start==null?0:F.start,edge:F.edge==null?10:F.edge};
  if(F.period!=null)fspec.period=F.period;
  if(F.len!=null)fspec.len=F.len;
  else{fspec.rise=F.rise==null?60:F.rise;fspec.hold=F.hold==null?180:F.hold;fspec.fall=F.fall==null?120:F.fall;fspec.depth=F.depth==null?4:F.depth;fspec.base=F.base==null?0:F.base;}
  const x0=path3[0][0],y0=path3[0][1],z0=path3[0][2];
  let minX=1e18,maxX=-1e18,minZ=1e18,maxZ=-1e18;
  for(const p of path3){minX=Math.min(minX,p[0]-fspec.w);maxX=Math.max(maxX,p[0]+fspec.w);minZ=Math.min(minZ,p[2]-fspec.w);maxZ=Math.max(maxZ,p[2]+fspec.w);}
  const cx=(minX+maxX)/2,cz=(minZ+maxZ)/2,cy=groundH(cx,cz,o);
  const body=Object.assign({kind:S.kind||(F.len!=null?'crush':'acid'),danger:S.danger==null?0.85:S.danger,
   shape:{type:'box',w:r2(maxX-minX+4),d:r2(maxZ-minZ+4),h:r2(F.h==null?400:F.h),y0:-20,y1:r2((F.h==null?400:F.h)-20)},
   falloff:S.falloff||'smooth',stateFn:'KHAZ.front',front:fspec},S.hazard||{});
  if(S.charge)body.charge=copy(S.charge);
  const err=checkBody(S.id,body);if(err){errors.push(err);return{records,ways,uncut,errors};}
  records.push(makeRec(S.id,S,cx,cz,cy===0?y0:cy,0,body,season));
  return{records,ways,uncut,errors};}

 /* Mode 2: cell-seeded field */
 if(S.field!=null){const fn=FIELDS[S.field];
  if(!fn){errors.push(S.id+': no hazard field '+S.field+' (WHAZ.field: '+(registered().join(', ')||'none')+')');return{records,ways,uncut,errors};}
  const cell=S.cell==null?2000:S.cell;if(!(cell>0)){errors.push(S.id+': cell must be > 0');return{records,ways,uncut,errors};}
  const B=S.box?S.box:(S.box_px?(()=>{const a=fromPx(S.box_px[0],S.box_px[1],o),b=fromPx(S.box_px[2],S.box_px[3],o);
   return[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];})():worldBox(o));
  const c0x=Math.floor(B[0]/cell),c1x=Math.floor(B[2]/cell),c0z=Math.floor(B[1]/cell),c1z=Math.floor(B[3]/cell);
  const salt=S.salt==null?0:S.salt,maxN=S.maxPerCell==null?1:S.maxPerCell;
  let anyIn=false;
  for(let cz=c0z;cz<=c1z;cz++)for(let cx=c0x;cx<=c1x;cx++){
   for(let idx=0;idx<maxN;idx++){
    const ch=KRAND.hash(hseed,cx,cz,idx,salt),jx=(KRAND.unit(KRAND.hash(ch,11))-0.5)*cell*0.8,jz=(KRAND.unit(KRAND.hash(ch,12))-0.5)*cell*0.8;
    const x=(cx+0.5)*cell+jx,z=(cz+0.5)*cell+jz;
    if(!insideWorld(x,z,o))continue;
    anyIn=true;
    const sam=sampleAt(x,z,o),ctx={id:S.id,spec:S,cell,cx,cz,idx,seed:ch,sites:o.sites||(o.plan&&o.plan.sites)||[],plan:o.plan||null,
     unit:s=>KRAND.unit(KRAND.hash(ch,s==null?0:s))};
    const res=fn(sam,ctx);if(!res)continue;
    const list=Array.isArray(res)?res:[res];
    list.forEach((b,bi)=>{const rid=S.id+'/'+cx+'_'+cz+(maxN>1?'_'+idx:'')+(list.length>1?'_'+bi:'');
     const bx=b.x==null?x:b.x,bz=b.z==null?z:b.z,by=b.y==null?sam.h:b.y,bry=b.ry==null?ctx.unit(20+bi)*Math.PI*2:b.ry;
     const body=copy(b);delete body.x;delete body.y;delete body.z;delete body.ry;
     const err=checkBody(rid,body);if(err){errors.push(err);return;}
     records.push(makeRec(rid,Object.assign({},S,{stalker:S.field==='stalker'}),bx,bz,by,bry,body,season));});}}
  if(!anyIn)uncut.push({id:S.id,site:null,why:'field box lies outside the cut'});
  return{records,ways,uncut,errors};}

 /* Mode 1: point / site / shape */
 let x=0,z=0;
 if(S.site!=null){const sites=o.sites||(o.plan&&o.plan.sites)||[],st=sites.find(s=>s.id===S.site);
  if(!st){uncut.push({id:S.id,site:S.site,why:'the cut has no site '+S.site+' yet'});return{records,ways,uncut,errors};}
  const nr=S.near||[0,0];x=st.x+nr[0];z=st.z+nr[1];}
 else if(S.px!=null){const q=fromPx(S.px[0],S.px[1],o);x=q[0];z=q[1];}
 else if(S.at!=null){x=S.at[0];z=S.at[1];}
 else{errors.push(S.id+': hazard needs at, px, site, field, front or way');return{records,ways,uncut,errors};}
 if(!insideWorld(x,z,o)){uncut.push({id:S.id,site:S.site||null,why:'outside the region\'s cut'});return{records,ways,uncut,errors};}
 const y=S.y!=null?S.y:(groundH(x,z,o)+(S.yOffset==null?0:S.yOffset));
 const rawBody=S.hazard?copy(S.hazard):(()=>{const b=copy(S);['id','name','at','px','site','near','y','yOffset','ry','r','h','size','culture','taboo','when','season','below','silent','stalker'].forEach(k=>delete b[k]);return b;})();
 if(rawBody.crust&&!rawBody.stateFn)rawBody.stateFn='KHAZ.crust';
 if(rawBody.night&&!rawBody.stateFn)rawBody.stateFn='KHAZ.night';
 const err=checkBody(S.id,rawBody);if(err){errors.push(err);return{records,ways,uncut,errors};}
 records.push(makeRec(S.id,S,x,z,y,S.ry,rawBody,season));
 /* paired under-hazard for a breakable crust */
 if(S.below){const bid=S.below.id||(S.id+'/below'),bbody=copy(S.below);delete bbody.id;delete bbody.depth;
  if(!bbody.kind)bbody.kind='heat';
  if(!bbody.shape&&rawBody.shape)bbody.shape=copy(rawBody.shape);
  bbody.stateFn='KHAZ.under';bbody.under={crust:S.id};
  const berr=checkBody(bid,bbody);if(berr){errors.push(berr);return{records,ways,uncut,errors};}
  const depth=S.below.depth==null?1.5:S.below.depth;
  records.push(makeRec(bid,{name:(S.name||S.id)+' (below)',r:S.r,h:S.h,size:S.size,culture:S.culture},x,z,y-depth,S.ry,bbody,season));}
 return{records,ways,uncut,errors};}

function plan(spec,o){o=o||{};const list=(spec&&spec.hazards)||[],seed=spec&&spec.world!=null?spec.world:1;
 const hazards=[],ways=[],uncut=[],errors=[],seen={};
 for(const S of list){if(S&&S.id){if(seen[S.id]){errors.push('duplicate hazard id '+S.id);continue;}seen[S.id]=1;}
  const R=lay(S,seed,o);
  hazards.push(...R.records);ways.push(...R.ways);uncut.push(...R.uncut);errors.push(...R.errors);}
 return{hazards,ways,uncut,errors};}

function of(P){if(!P||(P.version!=null&&P.version<3&&!P.hazards&&!P.hazardWays))return{hazards:[],ways:[],uncut:[]};
 return{hazards:P.hazards||[],ways:P.hazardWays||[],uncut:(P.uncut||[]).filter(u=>u&&u.way!=null||((P.hazards||[]).length>0))};}

function wayOpen(P,wayId,yd){const d=yd==null?0:yd,W=(P&&(P.hazardWays||P.ways))||[];
 const closed=W.filter(w=>w.way===wayId&&w.season&&inSeason(w,d));
 return{open:!closed.length,closedBy:closed};}

function falloffK(kind,f){if(kind==='none')return 1;if(kind==='linear')return Math.max(0,1-f);
 const k=Math.max(0,Math.min(1,f));return 1-k*k*(3-2*k);}

function at(P,x,z,o){o=o||{};const H=(P&&P.hazards)||[],yd=o.yearDay,y=o.y,hits=[];
 const byId={};for(const r of H)byId[r.id]=r;
 for(const r of H){if(yd!=null&&!inSeason(r,yd))continue;
  if(o.excludeHunter&&r.kind==='hunter')continue;
  const f=insideShape(r,x,z,y);if(f<0)continue;
  const h=r.hazard;
  /* intact crust has k = 0 (warn only), and under-crust is held (k = 0) unless o.brokenCrusts names its crust */
  let stateK=1,state='on';
  if(h.stateFn==='KHAZ.crust'){const br=o.brokenCrusts&&o.brokenCrusts[r.id];stateK=br?1:0;state=br?'broken':'intact';}
  else if(h.stateFn==='KHAZ.under'&&h.under){const br=o.brokenCrusts&&o.brokenCrusts[h.under.crust];stateK=br?1:0;state=br?'on':'held';}
  const fk=falloffK(h.falloff||'none',f),danger=(h.danger==null?0.5:h.danger),dose=(h.dose==null?1:h.dose)*fk*stateK;
  hits.push({id:r.id,kind:r.kind,danger,effDanger:r4(danger*fk*stateK),dose:r4(dose),f:r4(f),state,rec:r});}
 hits.sort((a,b)=>(b.effDanger-a.effDanger)||(a.id<b.id?-1:a.id>b.id?1:0));
 return hits;}

function check(P,opt){opt=opt||{};const problems=[],H=(P&&P.hazards)||[],W=(P&&(P.hazardWays||[]))||[];
 const counts={hazards:H.length,ways:W.length},byId={};
 for(const r of H){if(byId[r.id])problems.push(r.id+': duplicate hazard record');byId[r.id]=r;}
 const allW=allWaysOf(P);
 for(const r of H){
  if(!insideWorld(r.at[0],r.at[2],opt))problems.push(r.id+': outside the region\'s cut');
  const g=groundH(r.at[0],r.at[2],opt),maxOff=opt.maxElevOff==null?80:opt.maxElevOff;
  if(Math.abs(r.at[1]-g)>maxOff)problems.push(r.id+': height '+r.at[1]+' is '+Math.round(Math.abs(r.at[1]-g))+' m off ground '+r2(g));
  const err=checkBody(r.id,r.hazard);if(err)problems.push(err);
  if(r.hazard&&r.hazard.under&&!byId[r.hazard.under.crust])problems.push(r.id+': under.crust '+r.hazard.under.crust+' is missing');
  if(r.kind==='hunter'&&r.hazard&&r.hazard.tell&&(r.hazard.tell.fx||r.hazard.tell.sound||r.hazard.tell.sign))
   problems.push(r.id+': hunter hazard has a non-silent tell');}
 for(const w of W){if(!allW.some(x=>x.id===w.way))problems.push(w.id+': way '+w.way+' is not in the plan');
  if(!w.season)problems.push(w.id+': way closure has no season');}
 return{ok:!problems.length,problems,counts};}

return Object.assign(api,{VERSION:1,YEAR,START,yearDay,field,registered,seasonOf,inSeason,lay,plan,of,wayOpen,insideShape,at,check});})();
