// ================================================================= CORE — crusts that break, air that pools at night, fronts that travel  [G data]
// The biome plans of 2026-11-09 (twins, opalvalley, firebliss, godshearth, neouterwall, midbasin, greatchasm, outlandgate,
// paintedhighlands, wouterwall, labyrinth) want three behaviours 20-core-hazard.js cannot write as a plain record:
//   a crust that is harmless until it breaks underfoot and then STAYS broken (a trigger leaves a hazard harmful until
//   tripped, then resets); gas and cold air that pool at night and in still air (a cycle runs on a hashed or authored
//   phase, not the world clock); and a front that travels a path (a gorge's flood rising, a stampeding herd).
// Opt-in: needs 20-core-hazard.js (KHAZ) loaded first; 21-core-hazard-flow.js is optional (list 22 after it when both).
// A record without these fields answers exactly as before. Each behaviour is a state function in KHAZ.STATES, named by
// the record's stateFn, and a field on tags.hazard; each field is checked at first read (a clear error naming the
// record) and rides in KHAZ.of, KHAZ.make and KHAZ.export's filled hazard. No THREE, no DOM. Axes: y up, metres, x east,
// z south; seconds, kilograms.
//
// 1. A crust (stateFn 'KHAZ.crust'): thin sinter over boiling water, a pahoehoe blister over a lava pond, opaline crust
//    over mud pots.
//   crust   {mass (kg that breaks it; default trigger.mass when the trigger is by weight, else 60), heal (s until it
//           crusts over again; null = it stays broken)}. 'intact' k 0 (warn: its tell still shows, a hollow sound),
//           then 'broken' k 1 (left: s until it heals). A weight trigger's mass must agree with crust.mass
//   under   {crust: <the crust record's id>} on the harm below (stateFn 'KHAZ.under': heat, lava, drown...): 'held' k 0
//           while the crust holds; once it breaks, the record's own state (steady, or its cycle) with crust: 'broken'
//   KHAZ.load(rec, mass, t)       a load on the crust at t: true when this load broke it (mass >= crust.mass)
//   KHAZ.trip(rec, t, mass)       on a crust: the same as load (a weight trigger needs the mass; a step or near one breaks
//                                 it); on any other record exactly 20's trip
//   KHAZ.mend(rec | id)           the crust whole again (KHAZ.rearm mends too)
//   KHAZ.saveCrusts() / KHAZ.loadCrusts(s)  the broken crusts as plain data {format: 'krator-hazard-crusts', version: 1,
//                                 broken: {id: {t, heal}}} (page state by record id, as 20's trips are: not in the record)
//
// 2. Night air (stateFn 'KHAZ.night'): gas that pools at night and in still air, and the cold-air pool.
//   night   {from (hour, 19), to (hour, 6), ramp (hours, 2), still (m/s, 1), calm (m/s, 4), base (k by day, 0)}
//           n = smoothstep(0, ramp, hours since from) until `to`, then that times 1 - smoothstep(0, ramp, hours since to)
//           (it builds over `ramp` hours after `from` and drains over `ramp` hours after `to`); ramp is at most the day
//           between to and from. w = 1 at wind <= still, 0 at wind >= calm, a smoothstep between.
//           k = base + (1 - base) n w, times the record's cycle's k when it has a cycle.
//   KHAZ.bindClock(C)             the world hour: a KCLOCK clock (core/clock: reads C.hour) or fn(t) -> hour; null unbinds.
//                                 A night record with no hour bound throws, naming this call
//   KHAZ.bindWind(W)              the wind: fn(x, z, t) -> [vx, vz] or a speed (m/s), or a fixed speed; null (the
//                                 default) is still air. core/atmos's slope wind can be handed in as a function
//   A cold-air pool is a `cold` record with stateFn 'KHAZ.night' and 21's shape.pool (the cold lies on the floor).
//
// 3. A front that travels a path (stateFn 'KHAZ.front'): the gorge flood and the charge. THE LAW (core/water's
// 62-core-water-flood.js draws the same water from it, and the two are cross-checked: do not change one alone):
//   front: {path: [[x, y, z], ...] (world metres: the channel floor or the run's line; y the bed), w (m: half-width),
//           speed (m/s), start (s, 0), period (s; null = once), rise, hold, fall (s), depth (m: a flood's peak rise),
//           base (m: standing depth, 0), len (m: a charge's band length; a flood has none), edge (m: a band's soft edge, 2)}
//   s  = arc length along path of the point's nearest point on the path (segments projected; clamped to [0, L]); q = the
//        lateral distance. All in plan (x, z): the nearest point, s, q and L; on a tie the first segment wins
//   u  = period != null ? ((t - start) mod period, into [0, period)) : t - start
//   sm(a, b, x) = smoothstep (t = clamp((x - a) / (b - a), 0, 1), t*t*(3 - 2t)); when b <= a it is x < a ? 0 : 1
//   flood:  v = u - s / speed;  fk = v < 0 ? 0 : v < rise ? sm(0, rise, v) : v < rise + hold ? 1 : v < rise + hold + fall ?
//           1 - sm(rise + hold, rise + hold + fall, v) : 0
//           level(s, t) = bed(s) + base + depth * fk, bed(s) the path's y interpolated linearly by arc length
//   charge: head = speed * u;  ck = sm(head - len - edge, head - len, s) * (1 - sm(head, head + edge, s))
//   Inside when q <= w (then the record's shape and falloff as usual); k 0 outside.
//   A flood's k at a point is fk; given a height y (KHAZ.at, dose, doses, here, exposure().step, time, timeScale, state's
//   sixth argument, and 21's moveAt and drift) it is sm(0, .3, level - y): 1 under the water (so 1 under the base level),
//   nothing at or above its surface, smooth over the top .3 m. Without y it is fk (a plan view). States: dry or
//   standing (base > 0), rising, high, falling; a charge's: coming (left: s until the band), charging, passed.
//   charge  {fauna: id or [ids]}: the fauna whose run (or drop) it is, as PREDATOR's hunter.fauna
//   KHAZ.frontAt(rec, x, z, t)    {s, q, inside, k, level? (a flood's, with bed and v), head? (a charge's), herd?}
//   KHAZ.floodLevel(rec, x, z, t) the water's surface y at the point now; null off the path (q > w)
//   KHAZ.bindHerd(rec, fn(t) -> [{x, z, r}...])  a charge's live herd the host animates (page state by id, as bindFire's
//                                 runs): bound, "inside any of those discs" (k 1) replaces the path law; null unbinds
//
//   KHAZ.ENV  builders, each returning plain tags.hazard bodies (o overrides any field):
//     crust(ptsOrR, {id, mass, heal, below (kind, 'heat'), depth (m, 2), crust: {...}, under: {...}}) -> {crust, below}:
//       register the crust, then below.under.crust = its id (or pass o.id when it is known), then the below
//     nightGas(ptsOrR, {h, pool, from, to, ramp, still, calm, base, ...}), coldPool(ptsOrR, {...}) -> a body
//     flood(path, {w, speed, start, period, rise, hold, fall, depth, base, ...}) -> {at, hazard} (register at `at`, ry 0)
//     stampede(path, {fauna, w, speed, start, period, len, edge, ...}) -> {at, hazard}
//     rockDrop(r, {fauna, h, reset, ...}) -> a body: a crush on a near trigger (the host trips it and applies its doses)
// Godot (core/hazard/GODOT.md, "Crusts, night and fronts"): KHazard.state takes the height directly.
(function(root){
  'use strict';
  var H=root.KHAZ;
  if(!H)throw new Error('core/hazard 22-core-hazard-env.js: load 20-core-hazard.js first (KHAZ)');
  if(H.ENV)return;
  var FNS={crust:'KHAZ.crust',under:'KHAZ.under',night:'KHAZ.night',front:'KHAZ.front'},KEYS=['crust','under','night','front','charge'];
  var FRONT_KEYS=['path','w','speed','start','period','rise','hold','fall','depth','base','len','edge'],SURF=.3;
  function d(v,x){return v==null?x:v;}
  function copy(o){if(o==null||typeof o!=='object')return o;if(Array.isArray(o))return o.map(copy);var c={};for(var k in o)c[k]=copy(o[k]);return c;}
  function sm(a,b,x){if(!(b>a))return x<a?0:1;var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
  function bad(id,m){throw new Error('KHAZ: '+id+': '+m);}
  function fin(v,w,id){if(typeof v!=='number'||!isFinite(v))bad(id,w+' must be a finite number');return v;}
  function only(o,keys,what,id){if(!o||typeof o!=='object'||Array.isArray(o))bad(id,what+' is an object');
    for(var k in o)if(keys.indexOf(k)<0)bad(id,'unknown field '+what+'.'+k+' (one of '+keys.join(', ')+')');}
  function rawOf(rec){var t=rec&&rec.tags;return t&&t.hazard||null;}
  function hasEnv(h){if(!h||typeof h!=='object')return false;for(var i=0;i<KEYS.length;i++)if(h[KEYS[i]]!=null)return true;
    for(var k in FNS)if(h.stateFn===FNS[k])return true;return false;}

  /* ---- the fields, checked: each throws naming the record and the field */
  function crustV(c,h,id){only(c,['mass','heal'],'crust',id);var tg=h.trigger,tm=tg&&tg.by==='weight'&&tg.mass!=null?fin(tg.mass,'trigger.mass',id):null;
    var m=fin(d(c.mass,d(tm,60)),'crust.mass',id);if(!(m>0))bad(id,'crust.mass must be above 0 (kg)');
    if(tm!=null&&tm!==m)bad(id,'crust.mass ('+m+') and trigger.mass ('+tm+') disagree');
    var hl=c.heal==null?null:fin(c.heal,'crust.heal',id);if(hl!=null&&!(hl>0))bad(id,'crust.heal must be above 0 (s), or null (it stays broken)');
    return {mass:m,heal:hl};}
  function underV(u,id){only(u,['crust'],'under',id);if(typeof u.crust!=='string'||!u.crust)bad(id,'under.crust is the crust record\'s id (register the crust first)');return {crust:u.crust};}
  function nightV(n,id){only(n,['from','to','ramp','still','calm','base'],'night',id);
    var o={from:fin(d(n.from,19),'night.from',id),to:fin(d(n.to,6),'night.to',id),ramp:fin(d(n.ramp,2),'night.ramp',id),
      still:fin(d(n.still,1),'night.still',id),calm:fin(d(n.calm,4),'night.calm',id),base:fin(d(n.base,0),'night.base',id)};
    if(o.from<0||o.from>=24||o.to<0||o.to>=24)bad(id,'night.from and night.to are hours, 0 to under 24');
    var span=((o.to-o.from)%24+24)%24;if(!(span>0))bad(id,'night.from and night.to are the same hour');
    if(o.ramp<0||o.ramp>24-span)bad(id,'night.ramp is 0 to the day between to and from ('+(24-span)+' h)');
    if(o.still<0||o.calm<o.still)bad(id,'night.still is 0 or more, night.calm no less than it (m/s)');
    if(o.base<0||o.base>1)bad(id,'night.base is 0..1');return o;}
  function frontV(f,id){only(f,FRONT_KEYS,'front',id);var P=f.path;
    if(!Array.isArray(P)||P.length<2)bad(id,'front.path is 2 or more [x, y, z]');
    var path=P.map(function(p){if(!Array.isArray(p)||p.length!==3)bad(id,'front.path is [[x, y, z], ...]');
      return [fin(p[0],'front.path x',id),fin(p[1],'front.path y',id),fin(p[2],'front.path z',id)];});
    var S=[0];for(var i=1;i<path.length;i++)S.push(S[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][2]-path[i-1][2]));
    if(!(S[S.length-1]>0))bad(id,'front.path has no length in plan');
    if(f.w==null||f.speed==null)bad(id,'a front needs w (m) and speed (m/s)');
    var o={path:path,w:fin(f.w,'front.w',id),speed:fin(f.speed,'front.speed',id),start:fin(d(f.start,0),'front.start',id),
      period:f.period==null?null:fin(f.period,'front.period',id),edge:fin(d(f.edge,2),'front.edge',id)};
    if(!(o.w>0)||!(o.speed>0))bad(id,'front.w and front.speed must be above 0');
    if(o.period!=null&&!(o.period>0))bad(id,'front.period must be above 0, or null (once)');if(o.edge<0)bad(id,'front.edge is 0 or more');
    if(f.len!=null){if(f.rise!=null||f.hold!=null||f.fall!=null||f.depth!=null||f.base!=null)bad(id,'a charge (front.len) has no rise, hold, fall, depth or base');
      o.len=fin(f.len,'front.len',id);if(!(o.len>0))bad(id,'front.len must be above 0');}
    else{if(f.depth==null)bad(id,'a flood needs front.depth (m); a charge needs front.len');
      o.rise=fin(d(f.rise,0),'front.rise',id);o.hold=fin(d(f.hold,0),'front.hold',id);o.fall=fin(d(f.fall,0),'front.fall',id);
      o.depth=fin(f.depth,'front.depth',id);o.base=fin(d(f.base,0),'front.base',id);
      if(o.rise<0||o.hold<0||o.fall<0||o.depth<0||o.base<0)bad(id,'front.rise, hold, fall, depth and base are 0 or more');
      if(!(o.rise+o.hold+o.fall>0))bad(id,'a flood needs rise, hold or fall above 0 (s)');}
    return {spec:o,S:S,L:S[S.length-1],flood:f.len==null};}
  function chargeV(c,id){only(c,['fauna'],'charge',id);var f=c.fauna==null?[]:typeof c.fauna==='string'?[c.fauna]:c.fauna;
    if(!Array.isArray(f)||!f.every(function(k){return typeof k==='string'&&k.length>0;}))bad(id,'charge.fauna is a fauna id or a list of them');
    return {fauna:f.slice()};}
  function validate(h,id){var o={};
    for(var k in FNS){if(h[k]!=null&&h.stateFn!==FNS[k])bad(id,k+' needs stateFn \''+FNS[k]+'\'');
      if(h.stateFn===FNS[k]&&h[k]==null)bad(id,'stateFn \''+FNS[k]+'\' needs its '+k+' field');}
    if(h.crust!=null)o.crust=crustV(h.crust,h,id);if(h.under!=null)o.under=underV(h.under,id);if(h.night!=null)o.night=nightV(h.night,id);
    if(h.front!=null)o.front=frontV(h.front,id);if(h.charge!=null)o.charge=chargeV(h.charge,id);
    if(o.charge&&o.front&&o.front.flood)bad(id,'charge goes with a charge\'s front (front.len), not a flood');
    return o;}
  /* checked once per tags.hazard object (a set's instances share theirs), as 20 caches its filled hazards */
  var VC=typeof WeakMap!=='undefined'?new WeakMap():null;
  function fieldsOf(rec){var h=rawOf(rec);if(!h)return null;if(!hasEnv(h))return {};
    if(VC){var c=VC.get(h);if(c)return c;c=validate(h,rec.id);VC.set(h,c);return c;}return validate(h,rec.id);}
  /* the export's form of the checked fields */
  function outOf(F){var o={};if(F.crust)o.crust=copy(F.crust);if(F.under)o.under=copy(F.under);if(F.night)o.night=copy(F.night);
    if(F.front)o.front=copy(F.front.spec);if(F.charge)o.charge=copy(F.charge);return o;}
  function attach(h,F){var o=outOf(F);for(var k in o)if(h[k]===undefined)h[k]=o[k];return h;}

  var state0=H.state,of0=H.of,make0=H.make,trip0=H.trip,rearm0=H.rearm,exp0=H.export;
  /* the record's own state without its stateFn (steady, or its cycle on 20's one clock): what a broken crust's harm does,
     and what a night record's cycle multiplies */
  var DT=VC?new WeakMap():null;
  function baseState(rec,raw,t,speed){var tg=DT&&DT.get(raw);
    if(!tg){var c={};for(var k in raw)c[k]=raw[k];c.stateFn=null;tg={hazard:c};if(DT)DT.set(raw,tg);}
    return state0({id:rec.id,at:rec.at,ry:rec.ry,tags:tg},t,speed);}

  /* ---- 1. crusts: page state by record id, {t (it broke at), heal} */
  var BROKE={};
  function brokenAt(id,t){var b=BROKE[id];if(!b||t<b.t)return null;if(b.heal!=null&&t>=b.t+b.heal)return null;return b;}
  function crustOf(rec,w){var F=rec&&rec.tags?fieldsOf(rec):null;if(!F||!F.crust)throw new Error(w+': a record with a crust (tags.hazard.crust)');return F.crust;}
  function breakIt(rec,c,t){if(brokenAt(rec.id,t))return false;BROKE[rec.id]={t:t,heal:c.heal};return true;}
  function load(rec,mass,t){var c=crustOf(rec,'KHAZ.load');fin(mass,'the load\'s mass',rec.id);fin(t,'t',rec.id);
    if(mass<0)bad(rec.id,'a load\'s mass is 0 or more');if(mass<c.mass)return false;return breakIt(rec,c,t);}
  function mend(rec){var id=typeof rec==='string'?rec:rec&&rec.id;if(id==null)throw new Error('KHAZ.mend: a crust record or its id');delete BROKE[id];}
  function saveCrusts(){var o={};Object.keys(BROKE).sort().forEach(function(k){o[k]={t:BROKE[k].t,heal:BROKE[k].heal};});
    return {format:'krator-hazard-crusts',version:1,broken:o};}
  function loadCrusts(s){if(!s||s.format!=='krator-hazard-crusts'||s.version!==1||!s.broken||typeof s.broken!=='object')
      throw new Error('KHAZ.loadCrusts: {format: \'krator-hazard-crusts\', version: 1, broken}');
    var B={};for(var id in s.broken){var b=s.broken[id];fin(b&&b.t,'a saved crust\'s t',id);
      if(b.heal!=null&&!(typeof b.heal==='number'&&b.heal>0))bad(id,'a saved crust\'s heal is above 0, or null');B[id]={t:b.t,heal:b.heal==null?null:b.heal};}
    BROKE=B;}
  H.STATES['KHAZ.crust']=function(rec,h,t){crustOf(rec,'KHAZ.crust');var b=brokenAt(rec.id,t);
    if(!b)return {state:'intact',k:0,on:false,warn:true};var o={state:'broken',k:1,on:true};if(b.heal!=null)o.left=b.t+b.heal-t;return o;};
  H.STATES['KHAZ.under']=function(rec,h,t,speed){var U=fieldsOf(rec).under,b=brokenAt(U.crust,t);
    if(!b)return {state:'held',k:0,on:false};var s=baseState(rec,rawOf(rec),t,speed),o={};for(var k in s)o[k]=s[k];o.crust='broken';return o;};

  /* ---- 2. night: the world hour and the wind, bound by the page */
  var CLOCK=null,WIND=null;
  function bindClock(C){if(C==null){CLOCK=null;return null;}
    if(typeof C!=='function'&&!(typeof C==='object'&&'hour' in C))throw new Error('KHAZ.bindClock: a KCLOCK clock (C.hour) or fn(t) -> hour');CLOCK=C;return C;}
  function bindWind(W){if(W==null){WIND=null;return null;}
    if(typeof W!=='function'&&!(typeof W==='number'&&isFinite(W)&&W>=0))throw new Error('KHAZ.bindWind: fn(x, z, t) -> [vx, vz] or m/s, or a speed (m/s)');WIND=W;return W;}
  function hourAt(t){if(CLOCK==null)throw new Error('KHAZ.night: no world hour: call KHAZ.bindClock(clock) (a KCLOCK clock) or KHAZ.bindClock(fn(t) -> hour) first');
    var h=typeof CLOCK==='function'?CLOCK(t):CLOCK.hour;if(typeof h!=='number'||!isFinite(h))throw new Error('KHAZ.night: the bound clock gave no hour ('+h+')');
    h=h%24;return h<0?h+24:h;}
  function windAt(x,z,t){if(WIND==null)return 0;if(typeof WIND==='number')return WIND;var v=WIND(x,z,t);
    if(Array.isArray(v)&&v.length>=2&&isFinite(v[0])&&isFinite(v[1]))return Math.hypot(v[0],v[1]);
    if(typeof v==='number'&&isFinite(v))return Math.abs(v);throw new Error('KHAZ.night: the bound wind gave neither [vx, vz] nor a speed');}
  function nightN(N,hr){var a=((hr-N.from)%24+24)%24,span=((N.to-N.from)%24+24)%24,r=N.ramp;
    if(a<span)return r>0?sm(0,r,a):1;return r>0?sm(0,r,span)*(1-sm(0,r,a-span)):0;}
  function nightW(N,v){return N.calm>N.still?1-sm(N.still,N.calm,v):v<=N.still?1:0;}
  H.STATES['KHAZ.night']=function(rec,h,t,speed,x,z){var N=fieldsOf(rec).night,hr=hourAt(t),wv=windAt(x==null?rec.at[0]:x,z==null?rec.at[2]:z,t);
    var nw=nightN(N,hr)*nightW(N,wv),k=N.base+(1-N.base)*nw,raw=rawOf(rec);if(raw.cycle!=null)k*=baseState(rec,raw,t,speed).k;
    return {state:nw>=1?'pooled':nw>0?'pooling':'clear',k:k,on:k>0,hour:hr,wind:wv};};

  /* ---- 3. fronts: the law above, and the height a query was asked at (set by the wrapped queries below) */
  var CUR_Y=null,HERDS={};
  function frontOf(rec,w){var F=rec&&rec.tags?fieldsOf(rec):null;if(!F||!F.front)throw new Error((w||'KHAZ.frontAt')+': '+(rec&&rec.id)+' has no front');return F.front;}
  function near(F,x,z){var P=F.spec.path,best=Infinity,s=0,y=P[0][1];
    for(var i=0;i<P.length-1;i++){var a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[2]-a[2],L2=dx*dx+dz*dz,u=L2>0?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/L2)):0,
        px=a[0]+dx*u-x,pz=a[2]+dz*u-z,q2=px*px+pz*pz;
      if(q2<best){best=q2;s=F.S[i]+u*(F.S[i+1]-F.S[i]);y=a[1]+(b[1]-a[1])*u;}}
    return {s:s,q:Math.sqrt(best),bed:y};}
  function uOf(sp,t){var u=t-sp.start;if(sp.period!=null){u=u%sp.period;if(u<0)u+=sp.period;}return u;}
  function fkOf(sp,v){var a=sp.rise,b=a+sp.hold,c=b+sp.fall;return v<0?0:v<a?sm(0,a,v):v<b?1:v<c?1-sm(b,c,v):0;}
  function phaseOf(sp,v){var a=sp.rise,b=a+sp.hold,c=b+sp.fall,lo=sp.base>0?'standing':'dry';return v<0?lo:v<a?'rising':v<b?'high':v<c?'falling':lo;}
  function ckOf(sp,head,s){return sm(head-sp.len-sp.edge,head-sp.len,s)*(1-sm(head,head+sp.edge,s));}
  function discs(rec,fn,t){var D=fn(t);if(!Array.isArray(D))throw new Error('KHAZ.bindHerd: '+rec.id+': the herd gave no list of {x, z, r}');
    D.forEach(function(c){if(!c||!isFinite(c.x)||!isFinite(c.z)||!(c.r>=0))throw new Error('KHAZ.bindHerd: '+rec.id+': a herd disc is {x, z, r}');});return D;}
  function frontAt(rec,x,z,t){var F=frontOf(rec),sp=F.spec,n=near(F,x,z),u=uOf(sp,t),o={s:n.s,q:n.q,inside:n.q<=sp.w,k:0},hf=HERDS[rec.id];
    if(hf){var D=discs(rec,hf,t),inn=false;for(var i=0;i<D.length;i++)if(Math.hypot(x-D[i].x,z-D[i].z)<=D[i].r){inn=true;break;}
      o.inside=inn;o.k=inn?1:0;o.herd=true;return o;}
    if(F.flood){var v=u-n.s/sp.speed,fk=fkOf(sp,v);o.level=n.bed+sp.base+sp.depth*fk;o.bed=n.bed;o.v=v;if(o.inside)o.k=fk;return o;}
    var head=sp.speed*u;o.head=head;if(o.inside)o.k=ckOf(sp,head,n.s);return o;}
  function floodLevel(rec,x,z,t){var F=frontOf(rec,'KHAZ.floodLevel');if(!F.flood)throw new Error('KHAZ.floodLevel: '+rec.id+' is a charge (front.len): it has no level');
    var A=frontAt(rec,x,z,t);return A.inside?A.level:null;}
  /* with no point: the worst anywhere on the path now (fk and ck are each one hump over s, so its peak or the nearer end) */
  function frontWhole(rec,F,t){var sp=F.spec,u=uOf(sp,t),hf=HERDS[rec.id];
    if(hf)return discs(rec,hf,t).length?{state:'charging',k:1,on:true}:{state:'quiet',k:0,on:false};
    if(F.flood){var vmax=u,vmin=u-F.L/sp.speed,a=sp.rise,b=a+sp.hold,v=vmax<a?vmax:vmin>b?vmin:Math.max(vmin,a),k=fkOf(sp,v);
      return {state:k>0?'flooding':sp.base>0?'standing':'dry',k:k,on:k>0};}
    var head=sp.speed*u,s=head<0?0:head-sp.len>F.L?F.L:Math.max(0,head-sp.len),c=ckOf(sp,head,s);
    return {state:c>0?'charging':head<0?'coming':'passed',k:c,on:c>0};}
  H.STATES['KHAZ.front']=function(rec,h,t,speed,x,z){var F=frontOf(rec,'KHAZ.front'),sp=F.spec;
    if(x==null||z==null)return frontWhole(rec,F,t);
    var A=frontAt(rec,x,z,t);
    if(A.herd)return A.inside?{state:'charging',k:1,on:true}:{state:'clear',k:0,on:false};
    if(!A.inside)return {state:'clear',k:0,on:false};
    if(F.flood){var k=CUR_Y==null?A.k:sm(0,SURF,A.level-CUR_Y),o={state:phaseOf(sp,A.v),k:k,on:k>0,level:A.level};
      if(CUR_Y!=null&&CUR_Y>=A.level)o.above=true;return o;}
    if(A.k>0)return {state:'charging',k:A.k,on:true};
    return A.head<A.s?{state:'coming',k:0,on:false,left:(A.s-A.head)/sp.speed}:{state:'passed',k:0,on:false};};
  function bindHerd(rec,fn){var F=frontOf(rec,'KHAZ.bindHerd');if(F.flood)throw new Error('KHAZ.bindHerd: '+rec.id+' is a flood: a herd binds to a charge (front.len)');
    if(fn==null){delete HERDS[rec.id];return null;}if(typeof fn!=='function')throw new Error('KHAZ.bindHerd: fn(t) -> [{x, z, r}...]');HERDS[rec.id]=fn;return fn;}

  /* ---- the wrapped queries: each runs the one before it with the height it was asked at (null: a plan view), which only
     KHAZ.front reads; every other record answers exactly as before */
  function wy(y,f,a){var o=CUR_Y;CUR_Y=y==null?null:y;try{return f.apply(null,a);}finally{CUR_Y=o;}}
  var at0=H.at,dose0=H.dose,doses0=H.doses,here0=H.here,exposure0=H.exposure,time0=H.time,timeScale0=H.timeScale,moveAt0=H.moveAt,drift0=H.drift;
  H.at=function(x,z,t,y){return wy(y,at0,arguments);};
  H.dose=function(rec,x,z,t,y){return wy(y,dose0,arguments);};
  H.doses=function(rec,x,z,t,y){return wy(y,doses0,arguments);};
  H.here=function(x,y){return wy(y,here0,arguments);};
  H.time=function(rec,x,z,t,y){return wy(y,time0,arguments);};
  H.timeScale=function(x,z,t,y){return wy(y,timeScale0,arguments);};
  H.exposure=function(T){var E=exposure0(T),st=E.step;E.step=function(x,z,t,dt,y){return wy(y,st,arguments);};return E;};
  if(moveAt0)H.moveAt=function(rec,x,z,t,y){return wy(y,moveAt0,arguments);};
  if(drift0)H.drift=function(x,z,t,y){return wy(y,drift0,arguments);};
  /* state's sixth argument: the height; without it an outer query's height stands (21's moveAt asks state with none) */
  H.state=function(rec,t,speed,x,z,y){if(y==null)return state0(rec,t,speed,x,z);return wy(y,state0,[rec,t,speed,x,z]);};
  H.trip=function(rec,t,mass){var raw=rawOf(rec);if(!raw||raw.crust==null)return trip0(rec,t);
    var c=crustOf(rec,'KHAZ.trip'),tg=of0(rec).trigger;if(!tg)return trip0(rec,t);
    if(mass==null){if(tg.by==='weight')throw new Error('KHAZ.trip: '+rec.id+': a crust on a weight trigger needs the load\'s mass (kg)');return breakIt(rec,c,t);}
    return load(rec,mass,t);};
  H.rearm=function(rec){rearm0(rec);if(rec&&rec.id!=null)delete BROKE[rec.id];};
  /* the fields ride in the filled hazard: of, make and the export */
  H.of=function(rec){var h=of0(rec);if(!h||!hasEnv(rawOf(rec)))return h;return attach(h,fieldsOf(rec));};
  H.make=function(h){var out=make0(h);if(hasEnv(h))attach(out,validate(h,'KHAZ.make'));return out;};
  H.export=function(T,inBox){var X=exp0(T,inBox),by={},any=false;
    H.list(T).forEach(function(r){if(hasEnv(rawOf(r))){by[r.id]=r;any=true;}});
    if(any)X.records.forEach(function(o){var r=by[o.id];if(r)attach(o.hazard,fieldsOf(r));});return X;};

  /* ---- the builders */
  function over(h,o,skip){if(o)for(var k in o)if(skip.indexOf(k)<0)h[k]=o[k];return h;}
  function area(p,h){if(Array.isArray(p)){if(p.length<3)throw new Error('KHAZ.ENV: a polygon is 3 or more [dx, dz]');return {type:'poly',pts:p,h:h,edge:2};}
    if(!(typeof p==='number'&&p>0))throw new Error('KHAZ.ENV: pts [[dx, dz]...] or a radius above 0');return {type:'cyl',r:p,h:h};}
  function bbox(path){if(!Array.isArray(path)||path.length<2)throw new Error('KHAZ.ENV: a path is 2 or more [x, y, z]');
    var B=[Infinity,Infinity,-Infinity,-Infinity,Infinity,-Infinity];
    path.forEach(function(p){B[0]=Math.min(B[0],p[0]);B[1]=Math.min(B[1],p[2]);B[2]=Math.max(B[2],p[0]);B[3]=Math.max(B[3],p[2]);B[4]=Math.min(B[4],p[1]);B[5]=Math.max(B[5],p[1]);});return B;}
  /* a front's record: at the path's box middle on its lowest bed, its shape the box grown by w (register it with ry 0) */
  function corridor(path,w,top){var B=bbox(path),at=[(B[0]+B[2])/2,B[4],(B[1]+B[3])/2],x0=B[0]-w-at[0],x1=B[2]+w-at[0],z0=B[1]-w-at[2],z1=B[3]+w-at[2],h=B[5]-B[4]+top;
    return {at:at,shape:{type:'poly',pts:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],h:h,y0:-1,y1:h,edge:2}};}
  function nightOpts(o,D){var n={};['from','to','ramp','still','calm','base'].forEach(function(k){n[k]=d(o[k],D[k]);});return n;}
  function faunaOf(f){return f==null?[]:typeof f==='string'?[f]:f.slice();}
  var NIGHT_SKIP=['h','pool','from','to','ramp','still','calm','base'],FRONT_SKIP=FRONT_KEYS.concat(['fauna']);
  var ENV={
    // a crust and the harm below it, two bodies at one `at`: the crust a fall that holds until a load of `mass` breaks it
    crust:function(p,o){o=o||{};var m=d(o.mass,60),dp=d(o.depth,2),top=area(p,2),sh=area(p,dp+1);top.y0=-.5;top.y1=1.5;sh.y0=-dp;sh.y1=1;
      var c=over({kind:'fall',stateFn:'KHAZ.crust',crust:{mass:m,heal:d(o.heal,null)},trigger:{by:'weight',mass:m},shape:top,
        tell:{fx:null,sound:'hollow',sign:'the ground rings hollow underfoot'}},o.crust,[]);
      var b=over({kind:d(o.below,'heat'),stateFn:'KHAZ.under',under:{crust:d(o.id,null)},shape:sh},o.under,[]);
      return {crust:c,below:b};},
    // gas that pools in a hollow at night and in still air (21's shape.pool: deadly on the floor; o.pool null for none)
    nightGas:function(p,o){o=o||{};var sh=area(p,d(o.h,3));if(o.pool!==null)sh.pool=d(o.pool,1.5);
      return over({kind:'gas',falloff:'smooth',stateFn:'KHAZ.night',night:nightOpts(o,{from:19,to:7,ramp:2,still:1,calm:4,base:0}),shape:sh},o,NIGHT_SKIP);},
    // the cold-air pool: cold drains into a hollow or a valley floor after dusk and lies there until the sun is up
    coldPool:function(p,o){o=o||{};var sh=area(p,d(o.h,8));if(o.pool!==null)sh.pool=d(o.pool,6);
      return over({kind:'cold',stateFn:'KHAZ.night',night:nightOpts(o,{from:18,to:8,ramp:3,still:1,calm:3,base:0}),shape:sh},o,NIGHT_SKIP);},
    // a gorge's flood: the water rises down the path at `speed`; walkable when dry (paths cross the gorge at a cost)
    flood:function(path,o){o=o||{};var w=d(o.w,4),dp=d(o.depth,2),bs=d(o.base,0),C=corridor(path,w,bs+dp+1);
      var front={path:path.map(function(q){return q.slice();}),w:w,speed:d(o.speed,3),start:d(o.start,0),period:d(o.period,null),
        rise:d(o.rise,20),hold:d(o.hold,60),fall:d(o.fall,180),depth:dp,base:bs};
      return {at:C.at,hazard:over({kind:'drown',falloff:'none',stateFn:'KHAZ.front',front:front,shape:C.shape,nav:{travel:2,enter:5,avoid:false}},o,FRONT_SKIP)};},
    // a stampede down a run: a band `len` m long at `speed`, bound to the herd's fauna
    stampede:function(path,o){o=o||{};var w=d(o.w,6),C=corridor(path,w,4);
      var front={path:path.map(function(q){return q.slice();}),w:w,speed:d(o.speed,8),start:d(o.start,0),period:d(o.period,null),len:d(o.len,30),edge:d(o.edge,2)};
      return {at:C.at,hazard:over({kind:'crush',dose:10,stateFn:'KHAZ.front',front:front,charge:{fauna:faunaOf(o.fauna)},shape:C.shape,
        nav:{travel:1.5,enter:0,avoid:false},tell:{fx:'dust',sound:'rumble',sign:'trampled ground and dung'}},o,FRONT_SKIP)};},
    // a rock dropped from a ledge by a Two-Snout: a crush on a near trigger, bound to the dropper's fauna
    rockDrop:function(r,o){o=o||{};if(!(typeof r==='number'&&r>0))throw new Error('KHAZ.ENV.rockDrop: a radius above 0');
      return over({kind:'crush',danger:.8,dose:25,shape:{type:'cyl',r:r,h:d(o.h,4)},trigger:{by:'near',reset:d(o.reset,30)},charge:{fauna:faunaOf(o.fauna)},
        tell:{fx:'dust',sound:'creak',sign:'fresh-broken rock under a ledge'}},o,['fauna','h','reset']);}};

  H.load=load;H.mend=mend;H.saveCrusts=saveCrusts;H.loadCrusts=loadCrusts;H.bindClock=bindClock;H.bindWind=bindWind;
  H.frontAt=frontAt;H.floodLevel=floodLevel;H.bindHerd=bindHerd;H.ENV=ENV;
})(typeof window!=='undefined'?window:globalThis);
