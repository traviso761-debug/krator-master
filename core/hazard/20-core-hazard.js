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
    return {kind:h.kind,effect:effect==null?null:effect,danger:danger,dose:num(d(h.dose,K.dose),'dose'),shape:shape,falloff:falloff,
      cycle:cycle,trigger:trigger,move:h.move==null?null:copy(h.move),nav:nav,tell:tell,stateFn:stateFn,seed:d(h.seed,null)};
  }
  // filled hazards are cached by the tags object (a set's instances share theirs)
  var CACHE=typeof WeakMap!=='undefined'?new WeakMap():null;
  function of(rec){var t=rec&&rec.tags,h=t&&t.hazard;if(!h)return null;
    if(CACHE){var c=CACHE.get(h);if(c)return c;c=make(h);CACHE.set(h,c);return c;}return make(h);}

  function shape(rec){var h=of(rec);if(!h)return null;var s=h.shape;
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
  function inside(rec,x,z,y){var s=shape(rec);if(!s)return -1;var at=rec.at,dx=x-at[0],dz=z-at[2];
    if(s.type==='sphere'){var dy=y==null?0:y-(at[1]+d(s.y0,0)),q=Math.sqrt(dx*dx+dy*dy+dz*dz);return q<=s.r?q/s.r:-1;}
    if(y!=null){var y0=at[1]+d(s.y0,0),y1=at[1]+d(s.y1,s.h);if(y<y0||y>y1)return -1;}
    if(s.type==='cyl'){var r=Math.sqrt(dx*dx+dz*dz);return r<=s.r?r/s.r:-1;}
    var ry=rec.ry||0,c=Math.cos(ry),sn=Math.sin(ry),lx=dx*c-dz*sn,lz=dx*sn+dz*c;
    if(s.type==='box'){var fx=Math.abs(lx)/(s.w/2),fz=Math.abs(lz)/(s.d/2);return fx<=1&&fz<=1?Math.max(fx,fz):-1;}
    if(!inPoly(s.pts,lx,lz))return -1;var e=d(s.edge,2);return Math.max(0,1-edgeD(s.pts,lx,lz)/e);}
  function fall(kind,f){if(kind==='none')return 1;if(kind==='linear')return 1-f;var k=Math.max(0,Math.min(1,f));return 1-k*k*(3-2*k);}

  // ---- the state now: one clock (KTRAPS.cycle) for every cyclic hazard
  var STATES={
    // a carnivore: dangerous while open and while it shuts; spent while it digests; coming back as it reopens
    'KTRAPS.state':function(rec,h,t,speed){var tr=rec.tags&&rec.tags.trap;if(!tr)return {state:'steady',k:1,on:true};
      var full=tr.moves==null?TR.make(tr):tr,s=TR.state(full,t,h.seed!=null?h.seed:rec.id,speed);
      var k=s.state==='shut'?0:s.state==='opening'?1-s.k:1;return {state:s.state,k:k,on:k>0};}
  };
  function cycleState(h,id,t,speed){var c=h.cycle,idle=c.period-c.warn-2*c.ramp-c.on-c.after;
    var segs=[['warn',c.warn,0,0],['rising',c.ramp,0,1],['on',c.on,1,1],['falling',c.ramp,1,0],['after',c.after,c.afterK,c.afterK],['idle',idle/(speed||1),0,0]];
    var L=0;for(var i=0;i<segs.length;i++)L+=segs[i][1];
    var q=TR.cycle(segs,t,c.offset!=null?c.offset:TR.phase(h.seed!=null?h.seed:id)*L);
    if(!q)return {state:'steady',k:1,on:true};
    var o={state:q.state,k:q.k,on:q.k>0,left:q.left};if(q.state==='warn')o.warn=true;return o;}
  function state(rec,t,speed){need();var h=of(rec);if(!h)return null;speed=speed==null?KHAZ.speed:speed;
    if(h.stateFn){var f=STATES[h.stateFn];if(!f)throw new Error('KHAZ.state: no state function '+h.stateFn+' (a kit adds it to KHAZ.STATES)');return f(rec,h,t,speed);}
    if(h.cycle)return cycleState(h,rec.id,t,speed);
    return {state:'steady',k:1,on:true};}
  function dose(rec,x,z,t,y){var h=of(rec);if(!h)return 0;var f=inside(rec,x,z,y);if(f<0)return 0;
    var s=state(rec,t);return h.dose*fall(h.falloff,f)*s.k;}

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
  function reach(rec){var s=shape(rec);if(s.type==='poly'){var m=0;s.pts.forEach(function(p){m=Math.max(m,Math.hypot(p[0],p[1]));});return m;}
    return s.type==='box'?Math.hypot(s.w,s.d)/2:s.r;}
  function at(x,z,t,y,T){var L=list(T),out=[];
    for(var i=0;i<L.length;i++){var r=L[i],R=reach(r);if(Math.abs(x-r.at[0])>R||Math.abs(z-r.at[2])>R)continue;
      var f=inside(r,x,z,y);if(f<0)continue;var h=of(r),s=state(r,t);
      out.push({rec:r,id:r.id,kind:h.kind,danger:h.danger,dose:h.dose*fall(h.falloff,f)*s.k,state:s});}
    out.sort(function(a,b){return b.danger*b.state.k-a.danger*a.state.k||(a.id<b.id?-1:a.id>b.id?1:0);});return out;}
  function worldShape(r){var s=shape(r),o={type:s.type,at:r.at.slice(),ry:r.ry||0};
    ['r','h','w','d','y0','y1','edge'].forEach(function(k){if(s[k]!=null)o[k]=s[k];});if(s.pts)o.pts=s.pts.map(function(p){return p.slice();});return o;}
  function zones(T){return list(T).map(function(r){var h=of(r);
    return {id:r.id,kind:h.kind,shape:worldShape(r),travel:h.nav.travel,enter:h.nav.enter,avoid:h.nav.avoid,layer:h.nav.layer};});}
  function exp(T,inBox){T=reg(T);var recs=[];
    list(T).forEach(function(r){if(inBox&&!inBox(r.at[0],r.at[2]))return;
      recs.push({id:r.id,uid:r.uid,at:r.at.slice(),ry:r.ry||0,hazard:copy(of(r)),shape:worldShape(r)});});
    return {format:'krator-hazard',version:1,convention:{units:'m, s, kg',up:'+y',x:'east',z:'south',clock:'KTRAPS.cycle; phase KTRAPS.phase(seed or id)'},
      kinds:V.hazardKinds,layers:V.navLayers,records:recs};}

  var KHAZ={make:make,of:of,shape:shape,inside:inside,state:state,dose:dose,list:list,at:at,zones:zones,export:exp,STATES:STATES,speed:1,fall:fall};
  root.KHAZ=KHAZ;
})(typeof globalThis!=='undefined'?globalThis:this);
