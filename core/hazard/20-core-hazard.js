// ================================================================= CORE — hazards (what can hurt a walker)  [G data]
// One question every walker, quest, NPC and port can ask: what is dangerous here, and how much, now
// (biomes/HAZARD-RESEARCH.md, features 1, 3 and 4; core/tags/PROPOSAL.md, "A hazard key"). A hazard is a core/tags record
// that carries `tags.hazard` (registered before it is drawn, like everything placed); its kind's row in
// KTAGS.VOCAB.hazardKinds fills what the record leaves out. These are plain functions on those records: no THREE, no DOM.
// Needs core/rand, core/tags (50, 52) and core/biome/37-core-traps.js (KTRAPS.cycle: the one clock), looked up at first use.
//
// The record (tags.hazard), every field optional but kind:
//   kind     one of VOCAB.hazardKinds: heat cold gas acid poison fall pit thorn grab drown sink slip crush hunter
//   effect   burn freeze suffocate poison corrode bleed hold drown, or null
//   danger   0..1 (.3 hurts, .7 holds a person, 1 kills)       dose   effect units a second at the core
//   shape    {type: 'sphere'|'cyl'|'box'|'poly', r, h, w, d, pts: [[dx, dz]...], y0, y1, edge} in metres from the record's
//            `at` (box and poly in its frame, turned by ry); y0..y1 a band (default 0..h). Left out: the record's own
//            footprint (r and h a cylinder, size a box)
//   falloff  'none' | 'linear' | 'smooth': the dose from the core (1) to the edge (0); a poly's core is `edge` m inside it (2)
//   cycle    {period, warn, ramp, on, after, afterK, offset} | null (s): warn (a tell, k 0), rising (ramp), on, falling
//            (ramp), after (k afterK, .3), idle (the rest of the period). The phase is KTRAPS.phase(seed) of the period;
//            offset (s) is an authored phase instead (a geyser's real clock)
//   trigger  {by: 'step'|'weight'|'near', mass (kg), reset (s)} | null      move {speed 0..1, sink m/s, slip 0..1} | null
//   nav      {travel, enter, avoid, layer}: Godot's NavigationRegion3D travel_cost and enter_cost, avoid = never path
//            through (navigation layer VOCAB.navLayers.avoid), layer: the bits (walk, 1, unless avoid)
//   tell     {colour, fx, sound, sign}: the readable warning (the overlay's tint is its colour)
//   stateFn  null (the cycle, or steady) or a name in KHAZ.STATES: 'KTRAPS.state' (a carnivore: its tags.trap's cycle),
//            'KORONA.pitState' (Korona registers it), or a kit's own
//   seed     the id the clock's phase is hashed from: the kit's own (the one its shader hashes), else the record's id
//   (2026-10-26, each only where the record or its kind's row has it; null turns the kind's off)
//   radiant  {reach, dose, danger}: heat by distance beyond the shape, dose x (1 - d/reach)^2 x k (lava 8 m, fire 10 m)
//   soak     {full, from, out}: strength by time inside, from (at entering) to 1 after full s, forgotten over out s (luck)
//   fire     {lit, burn, smoulder, smoulderK, x, z, wind}: a live fire on stateFn 'KFIRE.run' (KHAZ.bindFire binds its run)
//   cycle.base  0..1: the k the cycle never drops below (a lava lake that overturns, a vent that fumes between puffs)
//
//   tags.taboo = {of: null (every people) | [culture...], why, shape}: an area a people will not build in (Outlands C6)
//
//   KHAZ.make(h)                 a checked, filled hazard (throws on an unknown kind, effect, shape, falloff or trigger)
//   KHAZ.of(rec)                 rec.tags.hazard filled (null when it has none)
//   KHAZ.shape(rec)              the hazard's shape with the record's footprint filled in
//   KHAZ.inside(rec, x, z, y)    -1 outside the shape, else the falloff fraction f (0 at the core .. 1 at the edge)
//   KHAZ.state(rec, t, speed)    {state, k (0..1: how much of its harm it does now), on, warn?, hidden?, left?} at t (s);
//                                speed (KHAZ.speed, 1) compresses a cycle's idle part and a trap's slow phases for a page
//   KHAZ.dose(rec, x, z, t, y)   the dose a second at a point now: dose x falloff x k (0 outside)
//   KHAZ.list(T)                 every live hazard record of a registry (T, else KTAGS.page): a set's instances each
//   KHAZ.at(x, z, t, y, T)       [{rec, id, kind, danger, dose, state}] the hazards whose shape holds the point, the worst
//                                (danger x k) first, then by id
//   KHAZ.zones(T)                navigation zones for core/walk's export: [{id, kind, shape (world: type, at, ry, r, h, w, d,
//                                pts), travel, enter, avoid, layer}] in registry order
//   KHAZ.export(T, inBox)        {format: 'krator-hazard', version, convention, kinds, layers, records: [{id, uid, at, ry,
//                                hazard (filled), shape (world)}]}: inBox(x, z) crops to a tile
//   KHAZ.STATES                  {name: (rec, hazard, t, speed) -> state}: a kit adds its own state function by name
//   KHAZ.speed                   the page's compression of slow phases (1; Korona's page sets KORONA.SPEED)
//   KHAZ.beyond(rec, x, z, y)    metres outside the shape (0 inside): what radiant heat falls with
//   KHAZ.exposure(T)             {step(x, z, t, dt, y) -> KHAZ.at with each soak's time inside, tIn(id), reset()}: a walker's
//   KHAZ.bindFire(rec, run)      binds a KFIRE.run to a fire record (null unbinds); KHAZ.fireHazard(run, o) -> {at, hazard}
//   KHAZ.GROUND                  the Godthrone's: lavaFlow(pts, o), lavaLake(r, o), gasVent(r, o), hotGround(pts, r, o)
//   KHAZ.taboo(rec)              rec.tags.taboo checked ({of, why, shape}); KHAZ.taboos(T) every live taboo record
//   KHAZ.forbids(x, z, who, T)   the taboos barring who (a culture, or a record) at a point; KHAZ.tabooOk(who, T) -> fn(o)
//                                false where one does (a point, a disc, core/city's footprint); KHAZ.tabooAudit(T) the
//                                records of a people that stand inside a taboo barring them
(function(root){
  'use strict';
  // what it reads is looked up at first use, so the file may load anywhere on a page (a build lists it by path)
  var KT=null,TR=null,V=null;
  function need(){if(V)return;KT=root.KTAGS;TR=root.KTRAPS;
    if(!root.KRAND) throw new Error('core/hazard: load core/rand/08-core-rand.js');
    if(!KT||!KT.VOCAB||!KT.VOCAB.hazardKinds) throw new Error('core/hazard: load core/tags (50, 52: the hazard kinds)');
    if(!TR||!TR.cycle) throw new Error('core/hazard: load core/biome/37-core-traps.js (KTRAPS.cycle, the one clock)');
    V=KT.VOCAB;}
  function has(L,v){return L.indexOf(v)>=0;}
  function d(v,x){return v==null?x:v;}
  function copy(o){if(o==null||typeof o!=='object')return o;if(Array.isArray(o))return o.map(copy);var c={};for(var k in o)c[k]=copy(o[k]);return c;}
  function num(v,what){if(typeof v!=='number'||!isFinite(v))throw new Error('KHAZ.make: '+what+' must be a finite number');return v;}

  function make(h){need();
    if(!h||typeof h!=='object')throw new Error('KHAZ.make: a hazard is an object');
    var K=V.hazardKinds[h.kind];if(!K)throw new Error('KHAZ.make: unknown kind '+h.kind);
    var effect=h.effect===undefined?K.effect:h.effect;
    if(effect!=null&&!has(V.hazardEffects,effect))throw new Error('KHAZ.make: unknown effect '+effect);
    var danger=num(d(h.danger,K.danger),'danger');if(danger<0||danger>1)throw new Error('KHAZ.make: danger is 0..1');
    var falloff=d(h.falloff,K.falloff);if(!has(V.hazardFalloffs,falloff))throw new Error('KHAZ.make: unknown falloff '+falloff);
    var shape=null;
    if(h.shape!=null){if(!has(V.hazardShapes,h.shape.type))throw new Error('KHAZ.make: unknown shape '+h.shape.type);
      shape=copy(h.shape);if(shape.type==='poly'&&!(shape.pts&&shape.pts.length>=3))throw new Error('KHAZ.make: a poly shape needs 3 or more pts');}
    var trigger=null;
    if(h.trigger!=null){if(!has(V.hazardTriggers,h.trigger.by))throw new Error('KHAZ.make: unknown trigger '+h.trigger.by);trigger=copy(h.trigger);}
    var cycle=null;
    if(h.cycle!=null){var c=h.cycle;cycle={period:num(c.period,'cycle period'),warn:d(c.warn,0),ramp:d(c.ramp,0),on:num(c.on,'cycle on'),
      after:d(c.after,0),afterK:d(c.afterK,.3),offset:c.offset==null?null:num(c.offset,'cycle offset')};
      if(cycle.warn+2*cycle.ramp+cycle.on+cycle.after>cycle.period)throw new Error('KHAZ.make: the cycle\'s parts are longer than its period');}
    var n=h.nav||{},kn=K.nav,avoid=!!d(n.avoid,kn.avoid);
    var nav={travel:d(n.travel,kn.travel),enter:d(n.enter,kn.enter),avoid:avoid,layer:d(n.layer,avoid?V.navLayers.avoid:V.navLayers.walk)};
    var tl=h.tell||{},kt=K.tell;
    var tell={colour:d(tl.colour,kt.colour),fx:tl.fx===undefined?kt.fx:tl.fx,sound:tl.sound===undefined?kt.sound:tl.sound,sign:d(tl.sign,null)};
    var stateFn=d(h.stateFn,null);
    if(stateFn!=null&&typeof stateFn!=='string')throw new Error('KHAZ.make: stateFn is a name');
    if(h.cycle!=null&&h.cycle.base!=null){var b=num(h.cycle.base,'cycle base');if(b<0||b>1)throw new Error('KHAZ.make: cycle base is 0..1');cycle.base=b;}
    var out={kind:h.kind,effect:effect==null?null:effect,danger:danger,dose:num(d(h.dose,K.dose),'dose'),shape:shape,falloff:falloff,
      cycle:cycle,trigger:trigger,move:h.move==null?null:copy(h.move),nav:nav,tell:tell,stateFn:stateFn,seed:d(h.seed,null)};
    // the fields of 2026-10-26, only where the record or its kind has them (an older record fills exactly as before);
    // a record's null turns its kind's off
    var rad=h.radiant===undefined?K.radiant:h.radiant;
    if(rad!=null){var kr=K.radiant||{};out.radiant={reach:num(d(rad.reach,kr.reach),'radiant reach'),dose:num(d(rad.dose,kr.dose),'radiant dose'),
      danger:num(d(rad.danger,d(kr.danger,danger)),'radiant danger')};
      if(out.radiant.reach<=0)throw new Error('KHAZ.make: radiant reach must be above 0');
      if(out.radiant.danger<0||out.radiant.danger>1)throw new Error('KHAZ.make: radiant danger is 0..1');}
    var sk=h.soak===undefined?K.soak:h.soak;
    if(sk!=null){var ks=K.soak||{};out.soak={full:num(d(sk.full,ks.full),'soak full'),from:num(d(sk.from,d(ks.from,0)),'soak from'),
      out:num(d(sk.out,d(ks.out,d(sk.full,ks.full))),'soak out')};
      if(!(out.soak.full>0)||!(out.soak.out>0))throw new Error('KHAZ.make: soak full and out must be above 0');
      if(out.soak.from<0||out.soak.from>1)throw new Error('KHAZ.make: soak from is 0..1');}
    if(h.fire!=null){var f=h.fire;out.fire={lit:num(d(f.lit,0),'fire lit'),burn:num(d(f.burn,30),'fire burn'),smoulder:num(d(f.smoulder,400),'fire smoulder'),
      smoulderK:d(f.smoulderK,.3)};if(f.x!=null){out.fire.x=num(f.x,'fire x');out.fire.z=num(f.z,'fire z');}if(f.wind)out.fire.wind=f.wind.slice();}
    return out;
  }
  // filled hazards are cached by the tags object (a set's instances share theirs)
  var CACHE=typeof WeakMap!=='undefined'?new WeakMap():null;
  function of(rec){var t=rec&&rec.tags,h=t&&t.hazard;if(!h)return null;
    if(CACHE){var c=CACHE.get(h);if(c)return c;c=make(h);CACHE.set(h,c);return c;}return make(h);}

  function shape(rec){var h=of(rec);if(!h)return null;return fill(h.shape,rec);}
  // a shape with the record's footprint filled in (a hazard's, a taboo's)
  function fill(s,rec){
    if(s){var o=copy(s);if(o.type==='cyl'||o.type==='sphere'){if(o.r==null)o.r=rec.r!=null?rec.r:rec.size?Math.max(rec.size[0],rec.size[1])/2:1;}
      if(o.type==='cyl'&&o.h==null)o.h=rec.h!=null?rec.h:rec.size?rec.size[2]:2;
      if(o.type==='box'){if(o.w==null)o.w=rec.size?rec.size[0]:2*(rec.r||1);if(o.d==null)o.d=rec.size?rec.size[1]:2*(rec.r||1);if(o.h==null)o.h=rec.size?rec.size[2]:(rec.h||2);}
      if(o.type==='poly'&&o.h==null)o.h=rec.h!=null?rec.h:rec.size?rec.size[2]:2;
      return o;}
    if(rec.size)return {type:'box',w:rec.size[0],d:rec.size[1],h:rec.size[2]==null?2:rec.size[2]};
    return {type:'cyl',r:rec.r==null?1:rec.r,h:rec.h==null?2:rec.h};}
  function inPoly(P,x,z){var c=false;for(var i=0,j=P.length-1;i<P.length;j=i++){var a=P[i],b=P[j];
    if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
  function edgeD(P,x,z){var m=Infinity;for(var i=0,j=P.length-1;i<P.length;j=i++){var a=P[j],b=P[i],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz;
    var t=L2>0?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2)):0,px=a[0]+dx*t-x,pz=a[1]+dz*t-z;m=Math.min(m,Math.sqrt(px*px+pz*pz));}return m;}
  // the shape test: -1 outside, else the fraction from the core (0) to the edge (1)
  function inside(rec,x,z,y){return insideS(shape(rec),rec,x,z,y);}
  function insideS(s,rec,x,z,y){if(!s)return -1;var at=rec.at,dx=x-at[0],dz=z-at[2];
    if(s.type==='sphere'){var dy=y==null?0:y-(at[1]+d(s.y0,0)),q=Math.sqrt(dx*dx+dy*dy+dz*dz);return q<=s.r?q/s.r:-1;}
    if(y!=null){var y0=at[1]+d(s.y0,0),y1=at[1]+d(s.y1,s.h);if(y<y0||y>y1)return -1;}
    if(s.type==='cyl'){var r=Math.sqrt(dx*dx+dz*dz);return r<=s.r?r/s.r:-1;}
    var ry=rec.ry||0,c=Math.cos(ry),sn=Math.sin(ry),lx=dx*c-dz*sn,lz=dx*sn+dz*c;
    if(s.type==='box'){var fx=Math.abs(lx)/(s.w/2),fz=Math.abs(lz)/(s.d/2);return fx<=1&&fz<=1?Math.max(fx,fz):-1;}
    if(!inPoly(s.pts,lx,lz))return -1;var e=d(s.edge,2);return Math.max(0,1-edgeD(s.pts,lx,lz)/e);}
  // how far a point is outside the shape (m; 0 inside it): radiant heat falls with it. Above or below a band counts too
  function beyond(rec,x,z,y){var s=shape(rec);if(!s)return Infinity;var at=rec.at,dx=x-at[0],dz=z-at[2],e;
    if(s.type==='sphere'){var dy=y==null?0:y-(at[1]+d(s.y0,0));return Math.max(0,Math.sqrt(dx*dx+dy*dy+dz*dz)-s.r);}
    var v=0;if(y!=null){var y0=at[1]+d(s.y0,0),y1=at[1]+d(s.y1,s.h);v=y<y0?y0-y:y>y1?y-y1:0;}
    if(s.type==='cyl')e=Math.max(0,Math.sqrt(dx*dx+dz*dz)-s.r);
    else{var ry=rec.ry||0,c=Math.cos(ry),sn=Math.sin(ry),lx=dx*c-dz*sn,lz=dx*sn+dz*c;
      if(s.type==='box'){var ox=Math.max(0,Math.abs(lx)-s.w/2),oz=Math.max(0,Math.abs(lz)-s.d/2);e=Math.sqrt(ox*ox+oz*oz);}
      else e=inPoly(s.pts,lx,lz)?0:edgeD(s.pts,lx,lz);}
    return v?Math.sqrt(e*e+v*v):e;}
  // strength by time inside (a soak): from at entering, 1 after `full` s
  function soakK(h,tIn){if(!h.soak)return 1;var s=h.soak;return s.from+(1-s.from)*Math.min(1,Math.max(0,tIn==null?0:tIn)/s.full);}
  function fall(kind,f){if(kind==='none')return 1;if(kind==='linear')return 1-f;var k=Math.max(0,Math.min(1,f));return 1-k*k*(3-2*k);}

  // ---- the state now: one clock (KTRAPS.cycle) for every cyclic hazard
  var STATES={
    // a carnivore: dangerous while open and while it shuts; spent while it digests; coming back as it reopens
    'KTRAPS.state':function(rec,h,t,speed){var tr=rec.tags&&rec.tags.trap;if(!tr)return {state:'steady',k:1,on:true};
      var full=tr.moves==null?TR.make(tr):tr,s=TR.state(full,t,h.seed!=null?h.seed:rec.id,speed);
      var k=s.state==='shut'?0:s.state==='opening'?1-s.k:1;return {state:s.state,k:k,on:k>0};},
    // a live fire (core/biome KFIRE.run, bound by KHAZ.bindFire): at a point, burning from the front's arrival for `burn` s,
    // then smouldering (k smoulderK) for `smoulder` s, then burnt; with no point, the worst anywhere on it now
    'KFIRE.run':function(rec,h,t,speed,x,z){var F=h.fire||{},run=RUNS[rec.id],u=t-d(F.lit,0),burn=d(F.burn,30),sm=d(F.smoulder,400),sk=d(F.smoulderK,.3);
      if(!run||!run.ok)return {state:'unlit',k:0,on:false};
      if(x!=null&&z!=null){var A=run.at(x,z);
        if(!(A<Infinity)||u<A)return {state:'unburnt',k:0,on:false,left:A<Infinity?A-u:Infinity};
        if(u<A+burn)return {state:'burning',k:1,on:true,left:A+burn-u};
        if(u<A+burn+sm)return {state:'smouldering',k:sk,on:sk>0,left:A+burn+sm-u};
        return {state:'burnt',k:0,on:false};}
      if(u<0)return {state:'unlit',k:0,on:false,left:-u};
      var r=run.range(u-burn,u);if(r[1]>r[0])return {state:'burning',k:1,on:true};
      r=run.range(u-burn-sm,u-burn);if(r[1]>r[0])return {state:'smouldering',k:sk,on:sk>0};
      return {state:'burnt',k:0,on:false};}
  };
  // the live fires, by record id: a run is page state (a closure over its grid), so it is bound, not stored in the record
  var RUNS={};
  function bindFire(rec,run){if(!rec||rec.id==null)throw new Error('KHAZ.bindFire: a record with an id');
    if(run==null){delete RUNS[rec.id];return null;}
    if(typeof run.at!=='function'||typeof run.range!=='function')throw new Error('KHAZ.bindFire: a KFIRE.run (at, range)');
    RUNS[rec.id]=run;return run;}
  // a fire hazard for a run: {at (the record's: the middle of the cells it took, at height o.y), hazard (its tags.hazard,
  // the shape the box round those cells)}
  function fireHazard(run,o){o=o||{};var x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;
    if(!run.ok)throw new Error('KHAZ.fireHazard: the fire did not take ('+(run.why||'no run')+')');
    for(var m=0;m<run.order.length;m++){var c=run.order[m],i=c%run.N,j=(c-i)/run.N,x=run.x0+i*run.cs,z=run.z0+j*run.cs;
      if(x<x0)x0=x;if(x>x1)x1=x;if(z<z0)z0=z;if(z>z1)z1=z;}
    var hc=run.cs/2;
    return {at:[(x0+x1)/2,d(o.y,0),(z0+z1)/2],hazard:{kind:'fire',stateFn:'KFIRE.run',
      fire:{lit:d(o.lit,0),burn:o.burn,smoulder:o.smoulder,smoulderK:o.smoulderK,x:run.x,z:run.z,wind:run.wind},
      shape:{type:'box',w:x1-x0+2*hc,d:z1-z0+2*hc,h:d(o.h,12),y0:d(o.y0,-2)}}};}
  function cycleState(h,id,t,speed){var c=h.cycle,idle=c.period-c.warn-2*c.ramp-c.on-c.after;
    var segs=[['warn',c.warn,0,0],['rising',c.ramp,0,1],['on',c.on,1,1],['falling',c.ramp,1,0],['after',c.after,c.afterK,c.afterK],['idle',idle/(speed||1),0,0]];
    var L=0;for(var i=0;i<segs.length;i++)L+=segs[i][1];
    var q=TR.cycle(segs,t,c.offset!=null?c.offset:TR.phase(h.seed!=null?h.seed:id)*L);
    if(!q)return {state:'steady',k:1,on:true};
    var k=c.base?c.base+(1-c.base)*q.k:q.k;
    var o={state:q.state,k:k,on:k>0,left:q.left};if(q.state==='warn')o.warn=true;return o;}
  // x, z: the point, for a hazard whose state differs across it (a live fire); the others ignore it
  function state(rec,t,speed,x,z){need();var h=of(rec);if(!h)return null;speed=speed==null?KHAZ.speed:speed;
    if(h.stateFn){var f=STATES[h.stateFn];if(!f)throw new Error('KHAZ.state: no state function '+h.stateFn+' (a kit adds it to KHAZ.STATES)');return f(rec,h,t,speed,x,z);}
    if(h.cycle)return cycleState(h,rec.id,t,speed);
    return {state:'steady',k:1,on:true};}
  // radiant heat at a point, 0..1 of the radiant dose: (1 - distance/reach)^2 x k. A live fire's from its nearest burning
  // (or smouldering) cell, inside its box or out; any other's from its shape's edge, at its state now
  function radiantK(rec,h,x,z,t,y){var R=h.radiant;if(!R)return 0;
    if(h.fire){var run=RUNS[rec.id];if(!run||!run.ok)return 0;var F=h.fire,u=t-F.lit,best=0,n=Math.ceil(R.reach/run.cs),
        ci=Math.round((x-run.x0)/run.cs),cj=Math.round((z-run.z0)/run.cs);
      for(var j=cj-n;j<=cj+n;j++)for(var i=ci-n;i<=ci+n;i++){if(i<0||j<0||i>=run.N||j>=run.N)continue;var A=run.arrive[j*run.N+i];
        if(!(A<=u))continue;var k=u<A+F.burn?1:u<A+F.burn+F.smoulder?F.smoulderK:0;if(!k)continue;
        var e=Math.hypot(run.x0+i*run.cs-x,run.z0+j*run.cs-z);if(e>=R.reach)continue;var q=1-e/R.reach;best=Math.max(best,k*q*q);}
      return best;}
    var e2=beyond(rec,x,z,y);if(e2>=R.reach)return 0;var q2=1-e2/R.reach;return q2*q2*state(rec,t,null,x,z).k;}
  // what a hazard does at a point now: null when it does not reach it; else {dose, danger, state, radiant} (radiant: the
  // heat beyond the harm, when it is the greater). tIn: the seconds the walker has been inside (a soak's strength)
  function hit(rec,h,x,z,t,y,tIn){var f=inside(rec,x,z,y),rk=radiantK(rec,h,x,z,t,y),rd=h.radiant?h.radiant.dose*rk:0;
    if(f<0){if(!(rd>0))return null;return {dose:rd,danger:h.radiant.danger,state:{state:'radiant',k:rk,on:true},radiant:true};}
    var s=state(rec,t,null,x,z),dd=h.dose*fall(h.falloff,f)*s.k*soakK(h,tIn);
    if(rd>dd)return {dose:rd,danger:h.radiant.danger,state:{state:'radiant',k:rk,on:true},radiant:true};
    return {dose:dd,danger:h.danger,state:s};}
  function dose(rec,x,z,t,y,tIn){var h=of(rec);if(!h)return 0;var o=hit(rec,h,x,z,t,y,tIn);return o?o.dose:0;}

  // ---- the records: live, carrying a hazard; an item set's instances each (built on demand by the registry)
  function reg(T){need();T=T||KT.page;if(!T)throw new Error('KHAZ: no registry (pass one, or a page\'s KTAGS.page)');return T;}
  var LIST=typeof WeakMap!=='undefined'?new WeakMap():null;
  // cached per registry until a record is added or removed or a hazard set's count changes
  function list(T){T=reg(T);var R=T.records||T.query({removed:true}),n=R.length,c=LIST&&LIST.get(T),i,r,key=n+':';
    var sets=[];for(i=0;i<n;i++){r=R[i];if(r.set&&!r.removed&&r.tags&&r.tags.hazard){var m=T.count(r);sets.push(m);}else if(r.removed)key+='r'+i;}
    key+=sets.join(',');if(c&&c.key===key)return c.out;
    var out=[];
    for(i=0;i<n;i++){r=R[i];if(r.removed||!r.tags||!r.tags.hazard)continue;
      if(r.set){var k=T.count(r);for(var j=0;j<k;j++)out.push(T.instance(r,j));}else out.push(r);}
    if(LIST)LIST.set(T,{key:key,out:out});return out;}
  function reachS(s){if(s.type==='poly'){var m=0;s.pts.forEach(function(p){m=Math.max(m,Math.hypot(p[0],p[1]));});return m;}
    return s.type==='box'?Math.hypot(s.w,s.d)/2:s.r;}
  function reach(rec){var h=of(rec);return reachS(shape(rec))+(h.radiant?h.radiant.reach:0);}
  // a hit by radiant heat carries radiant: true, its danger the radiant's. tIns: {id: seconds inside} (KHAZ.exposure's)
  function at(x,z,t,y,T,tIns){var L=list(T),out=[];
    for(var i=0;i<L.length;i++){var r=L[i],R=reach(r);if(Math.abs(x-r.at[0])>R||Math.abs(z-r.at[2])>R)continue;
      var h=of(r),o=hit(r,h,x,z,t,y,tIns&&tIns[r.id]);if(!o)continue;
      var e={rec:r,id:r.id,kind:h.kind,danger:o.danger,dose:o.dose,state:o.state};if(o.radiant)e.radiant=true;out.push(e);}
    out.sort(function(a,b){return b.danger*b.state.k-a.danger*a.state.k||(a.id<b.id?-1:a.id>b.id?1:0);});return out;}
  function worldShape(r){var s=shape(r),o={type:s.type,at:r.at.slice(),ry:r.ry||0};
    ['r','h','w','d','y0','y1','edge'].forEach(function(k){if(s[k]!=null)o[k]=s[k];});if(s.pts)o.pts=s.pts.map(function(p){return p.slice();});return o;}
  function zones(T){return list(T).map(function(r){var h=of(r);
    return {id:r.id,kind:h.kind,shape:worldShape(r),travel:h.nav.travel,enter:h.nav.enter,avoid:h.nav.avoid,layer:h.nav.layer};});}
  function exp(T,inBox){T=reg(T);var recs=[];
    list(T).forEach(function(r){if(inBox&&!inBox(r.at[0],r.at[2]))return;
      var o={id:r.id,uid:r.uid,at:r.at.slice(),ry:r.ry||0,hazard:copy(of(r)),shape:worldShape(r)},run=o.hazard.fire&&RUNS[r.id];
      // a bound live fire carries its front: the grid and each cell it took with its arrival (s after it was lit)
      if(run&&run.ok){var cells=[],arr=[];run.order.forEach(function(c){cells.push(c);arr.push(Math.round(run.arrive[c]*100)/100);});
        o.front={N:run.N,cs:run.cs,x0:run.x0,z0:run.z0,cells:cells,arrive:arr};}
      recs.push(o);});
    var out={format:'krator-hazard',version:1,convention:{units:'m, s, kg',up:'+y',x:'east',z:'south',clock:'KTRAPS.cycle; phase KTRAPS.phase(seed or id)'},
      kinds:V.hazardKinds,layers:V.navLayers,records:recs};
    // the taboo areas, only on a page that has any (an older page's export is unchanged)
    var A=taboos(T).filter(function(r){return !inBox||inBox(r.at[0],r.at[2]);});
    if(A.length)out.areas=A.map(function(r){var tb=tabooOf(r),s=fill(tb.shape,r),w={type:s.type,at:r.at.slice(),ry:r.ry||0};
      ['r','h','w','d','y0','y1'].forEach(function(k){if(s[k]!=null)w[k]=s[k];});if(s.pts)w.pts=s.pts.map(function(p){return p.slice();});
      return {id:r.id,uid:r.uid,at:r.at.slice(),ry:r.ry||0,taboo:{of:tb.of,why:tb.why},shape:w};});
    return out;}

  // ---- exposure: how long a walker has stood in each soak hazard (the luck that grows the longer one stays)
  //   const E=KHAZ.exposure(T); E.step(x, z, t, dt, y) -> KHAZ.at's hits with each soak's time counted; E.tIn(id); E.reset()
  //   Inside a soak hazard its time grows by dt; outside it falls by dt x full/out (forgotten over `out` s), never below 0
  function exposure(T){var tin={};
    return {tIn:function(id){return tin[id]||0;},reset:function(){tin={};},
      step:function(x,z,t,dt,y){var L=list(T),seen={};
        for(var i=0;i<L.length;i++){var r=L[i],h=of(r);if(!h.soak)continue;
          if(inside(r,x,z,y)>=0){tin[r.id]=(tin[r.id]||0)+dt;seen[r.id]=1;}}
        for(var id in tin){if(seen[id])continue;var rr=null;for(var j=0;j<L.length;j++)if(L[j].id===id){rr=L[j];break;}
          var s=rr&&of(rr).soak;tin[id]=s?Math.max(0,tin[id]-dt*s.full/s.out):0;if(!tin[id])delete tin[id];}
        return at(x,z,t,y,T,tin);}};}

  // ---- the Godthrone's ground (biomes/godthrone/PLAN.md): tags.hazard records a kit writes, in metres from the record's at.
  //   pts: [[dx, dz]...] a polygon; r: a circle. o: the record's other fields (danger, dose, cycle, tell...) override these
  function over(h,o){if(o)for(var k in o)h[k]=o[k];return h;}
  function area(pts,r,h){if(pts)return {type:'poly',pts:pts,h:h,edge:2};return {type:'cyl',r:r,h:h};}
  var GROUND={
    // a lava flow: the moving lava kills, heat for 8 m beyond its edge; travel off it
    lavaFlow:function(pts,o){return over({kind:'lava',shape:area(pts,null,3)},o);},
    // a lava lake: kills on the surface; it overturns (a cycle: k never below base, so it always kills) with a wider heat
    lavaLake:function(r,o){return over({kind:'lava',shape:{type:'cyl',r:r,h:4,y0:-1},radiant:{reach:Math.max(8,r*.5),dose:3},
      cycle:{period:300,warn:10,ramp:5,on:20,after:30,afterK:.85,base:.7}},o);},
    // a gas vent: fumes always (base .3), puffs on a cycle; its gas fills a dome
    gasVent:function(r,o){return over({kind:'gas',danger:.9,falloff:'smooth',shape:{type:'sphere',r:r},
      cycle:{period:120,warn:3,ramp:4,on:15,after:10,afterK:.5,base:.3}},o);},
    // hot ground: a steaming crust over heat, burns slowly, walkable at a cost
    hotGround:function(pts,r,o){return over({kind:'heat',danger:.35,dose:.4,falloff:'linear',shape:area(pts,r,2),nav:{travel:3,enter:5,avoid:false}},o);}};

  // ---- taboo areas (biomes/outlands/PLAN.md C6): tags.taboo = {of: null | [culture...], why, shape}. A record of a people
  //   the area names (tags.culture, or tags.faction) is not placed inside it; a record of no people is (a plant, a rock)
  function tabooOf(rec){need();var tb=rec&&rec.tags&&rec.tags.taboo;if(!tb)return null;
    if(typeof tb!=='object')throw new Error('KHAZ.taboo: tags.taboo is an object');
    if(tb.of!=null&&!(Array.isArray(tb.of)&&tb.of.every(function(c){return typeof c==='string';})))throw new Error('KHAZ.taboo: of is null or a list of cultures');
    if(tb.shape!=null){if(!has(V.hazardShapes,tb.shape.type))throw new Error('KHAZ.taboo: unknown shape '+tb.shape.type);
      if(tb.shape.type==='poly'&&!(tb.shape.pts&&tb.shape.pts.length>=3))throw new Error('KHAZ.taboo: a poly shape needs 3 or more pts');}
    return {of:tb.of==null?null:tb.of.slice(),why:d(tb.why,null),shape:tb.shape==null?null:copy(tb.shape)};}
  function taboos(T){T=reg(T);var R=T.records||T.query({removed:true}),out=[];
    for(var i=0;i<R.length;i++){var r=R[i];if(!r.removed&&r.tags&&r.tags.taboo&&!r.set)out.push(r);}return out;}
  function whoOf(who){if(who==null)return null;if(typeof who==='string')return who;var t=who.tags||who;return d(t.faction,d(t.culture,null));}
  // the taboo records that bar `who` (a culture, or a record: its tags.faction, else tags.culture) at a point; [] for no people
  function forbids(x,z,who,T){var c=whoOf(who);if(c==null)return [];var A=taboos(T),out=[];
    for(var i=0;i<A.length;i++){var r=A[i],tb=tabooOf(r);if(tb.of&&tb.of.indexOf(c)<0)continue;
      if(insideS(fill(tb.shape,r),r,x,z)>=0)out.push(r);}return out;}
  // a placement predicate: fn(o) -> false where a taboo bars `who`. o: a point [x, z], {x, z, r} (a disc: its middle and
  // eight points on its rim) or core/city's footprint {c, u, v, hw, hd} (its middle, corners and edges' middles); a taboo
  // whose middle falls inside the footprint bars it too. For rules.groundOk, a scatter's accept, or a core/space pass
  function tabooOk(who,T){return function(o){var P=[],i;
    if(Array.isArray(o))P.push(o);
    else if(o.c&&o.u){var a=[o.u[0]*o.hw,o.u[1]*o.hw],b=[o.v[0]*o.hd,o.v[1]*o.hd],C=[[1,1],[-1,1],[-1,-1],[1,-1]];P.push(o.c);
      for(i=0;i<4;i++){var p=[o.c[0]+C[i][0]*a[0]+C[i][1]*b[0],o.c[1]+C[i][0]*a[1]+C[i][1]*b[1]];P.push(p);}
      for(i=0;i<4;i++)P.push([(P[1+i][0]+P[1+(i+1)%4][0])/2,(P[1+i][1]+P[1+(i+1)%4][1])/2]);}
    else{var r=o.r||0;P.push([o.x,o.z]);if(r>0)for(i=0;i<8;i++)P.push([o.x+r*Math.cos(i*Math.PI/4),o.z+r*Math.sin(i*Math.PI/4)]);}
    for(i=0;i<P.length;i++)if(forbids(P[i][0],P[i][1],who,T).length)return false;
    if(o.c&&o.u){var c=whoOf(who);if(c!=null&&taboos(T).some(function(r){var tb=tabooOf(r);if(tb.of&&tb.of.indexOf(c)<0)return false;
      var dx=r.at[0]-o.c[0],dz=r.at[2]-o.c[1];return Math.abs(dx*o.u[0]+dz*o.u[1])<=o.hw&&Math.abs(dx*o.v[0]+dz*o.v[1])<=o.hd;}))return false;}
    return true;};}
  // the check after placement: every live record of a people standing inside a taboo that bars it
  function tabooAudit(T){T=reg(T);var R=T.records||T.query({removed:true}),out=[];
    for(var i=0;i<R.length;i++){var r=R[i];if(r.removed||r.set||!r.at||(r.tags&&r.tags.taboo))continue;
      var F=forbids(r.at[0],r.at[2],r,T);if(F.length)out.push({id:r.id,taboo:F[0].id,who:whoOf(r)});}return out;}

  var KHAZ={make:make,of:of,shape:shape,inside:inside,beyond:beyond,state:state,dose:dose,list:list,at:at,zones:zones,export:exp,
    STATES:STATES,speed:1,fall:fall,soakK:soakK,exposure:exposure,bindFire:bindFire,fireHazard:fireHazard,GROUND:GROUND,
    taboo:tabooOf,taboos:taboos,forbids:forbids,tabooOk:tabooOk,tabooAudit:tabooAudit};
  root.KHAZ=KHAZ;
})(typeof globalThis!=='undefined'?globalThis:this);
