// ================================================================= CORE — the tunnels' hazards: rockburst, inrush, seal  [G data]
// The Line (biomes/line/PLAN.md section 6, the owner's answer 13, 2026-11-11; openworld/ANCIENT-TUNNELS.md section 4): three
// kinds 20-core-hazard.js does not have. Opt-in: the kinds' rows live here, not in core/tags' vocabulary, and are added to
// KTAGS.VOCAB.hazardKinds when this file is first used, so a page that does not list it is byte-identical and answers as before.
// Needs 20-core-hazard.js (KHAZ) loaded first; core/tags, core/rand and core/biome/37-core-traps.js (KTRAPS.cycle) at first use,
// as KHAZ does. No THREE, no DOM. Axes: y up, metres, x east, z south.
//
// Each kind runs on its own state function, so its record is written with a builder (it sets stateFn and the defaults);
// KHAZ.tunnelAudit(T) lists a record of these kinds without its function (a verify check).
//
//   rockburst   a crush on a cycle: rock talk (warn: pops and ticks, k 0), the burst (rising .4 s, on 1.6 s: slabs thrown off
//               the wall), falling slabs and dust after (k .25, 40 s), then quiet (the rest of the period, 30 min by default).
//               Each period bursts in ONE cell along the shape's long axis (KRAND by the period's number), and harms within
//               burst.throw m of it along the axis: a walker 200 m down the deep stretch hears it and is not hit.
//     KHAZ.TUNNEL.rockburst({shape, cycle, burst: {cell (40 m), throw (6 m), spall: [a, b] m (a slab's thickness)}, ...})
//     KHAZ.burstAt(rec, t)       {n (the period), cell, cells, x, z (the cell's middle, world), t0 (the burst's start), state}
//     KHAZ.spalls(rec, t, n)     the last n bursts started by t, newest first: [{n, t, cell, x, z, along, side (-1 | 1: the
//                                wall), up (0..1: up the wall), spall (m)}]: where a host draws fresh spalls on the lining
//   inrush      a drown that starts on a cycle: karst water breaks in (warn: the rock sweats and hisses), rises over the ramp
//               to inrush.depth m over the shape's floor (rising), stays (on), drains (falling), leaves a pool (after, k .15),
//               dry the rest. Or once: inrush.at (s) it breaks in and stays flooded. Danger at a point is the water over it:
//               k = (floor + level - y) / inrush.deep (1.4 m: it sweeps a person off), 0..1; with no y, the level over the floor
//     KHAZ.TUNNEL.inrush({shape, cycle | inrush: {at}, inrush: {depth (3 m), deep (1.4 m)}, ...})
//     KHAZ.flood(rec, t)         {state, level (m over the floor), y (the water's height, world), k, left}
//   seal        a door whose failure turns the section behind it airless: the section's pressure relaxes toward the surface
//               it reaches (seal.outside atm: the crest's .05) while the door is open, e-folding in seal.bleed s, and back to
//               seal.inside over seal.refill s once shut. k is the thin-air row's ramp of that pressure (VOCAB.ambientKinds
//               'thin-air': .6 atm k 0 to .06 k 1). The door's openness 0..1 comes from, in order: a bound function
//               (KHAZ.bindDoor(rec, fn(t)): core/door's live door), the page's events (KHAZ.breach(rec, t, open), KHAZ.reseal(rec,
//               t)) and the record's seal.events [[t, open]...], or seal.fail (a cycle whose k is how far the door stands failed)
//     KHAZ.TUNNEL.seal({shape, seal: {door (an id), inside (1), outside (.05 | fn(t)), bleed (40), refill (900), fail, events}})
//     KHAZ.pressure(rec, t)      the section's pressure now (atm). A bound door is integrated live: KHAZ.sealStep(t, dt, T)
//                                each frame (a page with no bound door needs none); the rest is a closed form of t
//     KHAZ.breach(rec, t, open)  the page's event: the door fails (open 1, or a share) at t; KHAZ.reseal(rec, t) shuts it
//   KHAZ.tunnelAudit(T)          [{id, kind, why}]: a record of these kinds without its state function, or with bad fields
// Godot (core/hazard/GODOT.md, "The tunnels' kinds"): the same three functions in KHazard; the export carries the rows and each
// record's raw fields (burst, inrush, seal) under its filled hazard's `raw`.
(function(root){
  'use strict';
  var H=root.KHAZ;
  if(!H)throw new Error('core/hazard 22-core-hazard-tunnel.js: load 20-core-hazard.js first (KHAZ)');
  if(H.TUNNEL)return;
  function d(v,x){return v==null?x:v;}
  function fin(v,w){if(typeof v!=='number'||!isFinite(v))throw new Error('KHAZ: '+w+' must be a finite number');return v;}
  function cl(x){return x<0?0:x>1?1:x;}
  function copy(o){if(o==null||typeof o!=='object')return o;if(Array.isArray(o))return o.map(copy);var c={};for(var k in o)c[k]=copy(o[k]);return c;}
  function TR(){var t=root.KTRAPS;if(!t||!t.cycle)throw new Error('core/hazard 22: load core/biome/37-core-traps.js (KTRAPS.cycle)');return t;}
  function KR(){var k=root.KRAND;if(!k)throw new Error('core/hazard 22: load core/rand/08-core-rand.js');return k;}

  /* ---- the kinds' rows, added to the vocabulary at first use (core/tags may load after this file) */
  var ROWS={
    rockburst:{effect:'damage',danger:1,dose:20,falloff:'none',nav:{travel:2,enter:0,avoid:false},tell:{colour:'#a88a68',fx:'spall',sound:'crack'}},
    inrush:   {effect:'drown',danger:.9,dose:.5,falloff:'none',nav:{travel:6,enter:10,avoid:false},tell:{colour:'#2f6ad8',fx:'seep',sound:'roar'}},
    seal:     {effect:'suffocate',danger:1,dose:1,falloff:'none',nav:{travel:1,enter:0,avoid:false},tell:{colour:'#c8d0ff',fx:'frost',sound:'hiss'}}};
  var FN={rockburst:'KHAZ.rockburst',inrush:'KHAZ.inrush',seal:'KHAZ.seal'};
  var READY=false;
  function ensure(){if(READY)return;var KT=root.KTAGS;if(!KT||!KT.VOCAB||!KT.VOCAB.hazardKinds)return;
    var K=KT.VOCAB.hazardKinds;for(var k in ROWS)if(!K[k])K[k]=copy(ROWS[k]);READY=true;}
  /* every public function first makes sure the rows are in (a record is only ever filled through one of them) */
  Object.keys(H).forEach(function(k){var f=H[k];if(typeof f!=='function')return;H[k]=function(){if(!READY)ensure();return f.apply(this,arguments);};});
  ensure();

  function raw(rec){return rec&&rec.tags&&rec.tags.hazard||{};}
  /* the cycle's segments, as KHAZ's cycleState builds them (the idle part compressed by speed) */
  function segsOf(c,speed){var idle=c.period-c.warn-2*c.ramp-c.on-c.after;
    return [['warn',c.warn,0,0],['rising',c.ramp,0,1],['on',c.on,1,1],['falling',c.ramp,1,0],['after',c.after,c.afterK,c.afterK],['idle',idle/(speed||1),0,0]];}
  function cycOf(c,w){if(!c)return null;var o={period:fin(c.period,w+' cycle period'),warn:d(c.warn,0),ramp:d(c.ramp,0),on:fin(c.on,w+' cycle on'),after:d(c.after,0),
      afterK:d(c.afterK,.3),offset:c.offset==null?null:fin(c.offset,w+' cycle offset')};
    if(o.warn<0||o.ramp<0||o.on<0||o.after<0)throw new Error('KHAZ: '+w+': a cycle\'s parts are 0 or more');
    if(o.warn+2*o.ramp+o.on+o.after>o.period)throw new Error('KHAZ: '+w+': the cycle\'s parts are longer than its period');return o;}
  function offOf(rec,h,c,L){return c.offset!=null?c.offset:TR().phase(h.seed!=null?h.seed:rec.id)*L;}
  function clock(rec,h,c,t,speed){var S=segsOf(c,speed),L=0;for(var i=0;i<S.length;i++)L+=S[i][1];var off=offOf(rec,h,c,L),q=TR().cycle(S,t,off);
    return {q:q,L:L,off:off,S:S,n:Math.floor((t+off)/L)};}

  /* ---- rockburst */
  var RB={period:1800,warn:12,ramp:.4,on:1.6,after:40,afterK:.25};
  function burstOf(rec){var b=raw(rec).burst||{},cell=fin(d(b.cell,40),'burst.cell'),thr=fin(d(b.throw,6),'burst.throw'),sp=b.spall||[.05,.4];
    if(!(cell>0))throw new Error('KHAZ: '+rec.id+': burst.cell must be above 0');if(thr<0)throw new Error('KHAZ: '+rec.id+': burst.throw is 0 or more');
    if(!(Array.isArray(sp)&&sp.length===2&&sp[0]>=0&&sp[1]>=sp[0]))throw new Error('KHAZ: '+rec.id+': burst.spall is [a, b] m, 0 <= a <= b');
    return {cell:cell,throw:thr,spall:sp};}
  /* the shape's long axis in the record's frame: {ax (0: local x, 1: local z), len, mid (the axis' middle along it)} */
  function axisOf(rec){var s=H.shape(rec);
    if(s.type==='box')return s.w>=s.d?{ax:0,len:s.w,mid:0,across:s.d}:{ax:1,len:s.d,mid:0,across:s.w};
    if(s.type==='poly'){var x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;s.pts.forEach(function(p){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);});
      return x1-x0>=z1-z0?{ax:0,len:x1-x0,mid:(x0+x1)/2,across:z1-z0}:{ax:1,len:z1-z0,mid:(z0+z1)/2,across:x1-x0};}
    return {ax:0,len:2*s.r,mid:0,across:2*s.r};}
  function toLocal(rec,x,z){var ry=rec.ry||0,c=Math.cos(ry),s=Math.sin(ry),dx=x-rec.at[0],dz=z-rec.at[2];return [dx*c-dz*s,dx*s+dz*c];}
  function toWorld(rec,lx,lz){var ry=rec.ry||0,c=Math.cos(ry),s=Math.sin(ry);return [rec.at[0]+lx*c+lz*s,rec.at[2]-lx*s+lz*c];}
  function cellsOf(rec,B){var A=axisOf(rec);return {A:A,n:Math.max(1,Math.ceil(A.len/B.cell-1e-9))};}
  function cellPick(rec,h,n,cells){var K=KR();return K.hash(K.child(0x524f43,String(h.seed!=null?h.seed:rec.id)),n|0)%cells;}
  function cellMid(rec,A,cells,i){var L=A.len/cells,u=A.mid-A.len/2+(i+.5)*L;return A.ax===0?toWorld(rec,u,0):toWorld(rec,0,u);}
  function rockburstState(rec,h,t,speed,x,z){var c=cycOf(h.cycle||RB,rec.id),B=burstOf(rec),C=clock(rec,h,c,t,speed),q=C.q;
    var k=q?q.k:1,o={state:q?q.state:'steady',k:k,on:k>0,left:q?q.left:null};if(q&&q.state==='warn')o.warn=true;
    var CC=cellsOf(rec,B);o.cell=cellPick(rec,h,C.n,CC.n);
    if(x!=null&&z!=null&&k>0){var l=toLocal(rec,x,z),u=CC.A.ax===0?l[0]:l[1],L=CC.A.len/CC.n,a=CC.A.mid-CC.A.len/2+o.cell*L-B.throw,b=a+L+2*B.throw;
      if(u<a||u>b){o.k=0;o.on=false;o.state='far';}}
    return o;}
  function burstAt(rec,t){var h=H.of(rec);if(!h||h.kind!=='rockburst')throw new Error('KHAZ.burstAt: a rockburst record');
    var c=cycOf(h.cycle||RB,rec.id),B=burstOf(rec),C=clock(rec,h,c,t,H.speed),CC=cellsOf(rec,B),i=cellPick(rec,h,C.n,CC.n),m=cellMid(rec,CC.A,CC.n,i);
    return {n:C.n,cell:i,cells:CC.n,x:m[0],z:m[1],t0:C.n*C.L-C.off+c.warn,state:C.q?C.q.state:'steady'};}
  function spalls(rec,t,n){var h=H.of(rec);if(!h||h.kind!=='rockburst')throw new Error('KHAZ.spalls: a rockburst record');n=d(n,8);
    var c=cycOf(h.cycle||RB,rec.id),B=burstOf(rec),C=clock(rec,h,c,t,H.speed),CC=cellsOf(rec,B),K=KR(),sd=K.child(0x53504c,String(h.seed!=null?h.seed:rec.id)),out=[];
    for(var m=C.n;out.length<n&&m>C.n-n-1;m--){var t0=m*C.L-C.off+c.warn;if(t0>t)continue;var i=cellPick(rec,h,m,CC.n),L=CC.A.len/CC.n;
      var u=CC.A.mid-CC.A.len/2+(i+K.unit(K.hash(sd,m,1)))*L,side=K.hash(sd,m,2)&1?1:-1,w=CC.A.across/2*side,p=CC.A.ax===0?toWorld(rec,u,w):toWorld(rec,w,u);
      out.push({n:m,t:t0,cell:i,x:p[0],z:p[1],along:u,side:side,up:K.unit(K.hash(sd,m,3)),spall:B.spall[0]+(B.spall[1]-B.spall[0])*K.unit(K.hash(sd,m,4))});}
    return out;}

  /* ---- inrush */
  var IR={period:7200,warn:90,ramp:240,on:900,after:600,afterK:.15};
  function inrushOf(rec){var r=raw(rec).inrush||{},dp=fin(d(r.depth,3),'inrush.depth'),dd=fin(d(r.deep,1.4),'inrush.deep');
    if(!(dp>0)||!(dd>0))throw new Error('KHAZ: '+rec.id+': inrush.depth and inrush.deep must be above 0');
    return {depth:dp,deep:dd,at:r.at==null?null:fin(r.at,'inrush.at')};}
  function floorOf(rec){var s=H.shape(rec);return rec.at[1]+d(s.y0,0);}
  function inrushState(rec,h,t,speed){var I=inrushOf(rec),o;
    if(I.at!=null){var c0=h.cycle||IR,w=d(c0.warn,IR.warn),rp=d(c0.ramp,IR.ramp),u=t-I.at;
      if(u<-w)o={state:'dry',k:0,on:false,left:-w-u,level:0};
      else if(u<0)o={state:'warn',k:0,on:false,warn:true,left:-u,level:0};
      else if(u<rp)o={state:'rising',k:u/rp,on:true,left:rp-u,level:I.depth*u/rp};
      else o={state:'flooded',k:1,on:true,level:I.depth};}
    else{var c=cycOf(h.cycle||IR,rec.id),q=clock(rec,h,c,t,speed).q,f=q?q.k:1;o={state:q?q.state:'steady',k:f,on:f>0,left:q?q.left:null,level:I.depth*f};if(q&&q.state==='warn')o.warn=true;}
    o.k=cl(o.level/I.deep);o.on=o.k>0;return o;}
  function flood(rec,t){var h=H.of(rec);if(!h||h.kind!=='inrush')throw new Error('KHAZ.flood: an inrush record');var s=inrushState(rec,h,t,H.speed);
    return {state:s.state,level:s.level,y:floorOf(rec)+s.level,k:s.k,left:s.left};}
  /* the water over a point: the share of the state's k a walker standing at y takes (k_y / k, capped so k_y <= 1) */
  function floodShare(rec,h,t,y){if(h.kind!=='inrush'||y==null)return 1;var s=inrushState(rec,h,t,H.speed);if(!(s.k>0))return 1;
    var I=inrushOf(rec),ky=cl((floorOf(rec)+s.level-y)/I.deep);return ky/s.k;}

  /* ---- seal */
  var BOUND={},EVENTS={},LIVE={};
  function sealOf(rec){var s=raw(rec).seal||{},ins=fin(d(s.inside,1),'seal.inside'),out=s.outside==null?.05:s.outside,bl=fin(d(s.bleed,40),'seal.bleed'),rf=fin(d(s.refill,900),'seal.refill');
    if(typeof out!=='function'){fin(out,'seal.outside');if(!(out>=0&&out<ins))throw new Error('KHAZ: '+rec.id+': seal.outside is 0 or more and under seal.inside');}
    if(!(ins>0)||!(bl>0)||!(rf>0))throw new Error('KHAZ: '+rec.id+': seal.inside, seal.bleed and seal.refill must be above 0');
    if(s.events!=null&&!(Array.isArray(s.events)&&s.events.every(function(e){return Array.isArray(e)&&e.length===2&&isFinite(e[0])&&e[1]>=0&&e[1]<=1;})))
      throw new Error('KHAZ: '+rec.id+': seal.events is [[t, open 0..1]...]');
    return {door:d(s.door,null),inside:ins,outside:out,bleed:bl,refill:rf,fail:s.fail?cycOf(s.fail,rec.id+' seal.fail'):null,events:s.events||[]};}
  function outAt(S,t){return typeof S.outside==='function'?S.outside(t):S.outside;}
  /* one stretch of constant openness o for dt s: p relaxes to the mix of the two targets; exact (a linear ODE) */
  function relax(S,p,o,dt,t){if(!(dt>0))return p;var a=o/S.bleed+(1-o)/S.refill,tg=(o*outAt(S,t)/S.bleed+(1-o)*S.inside/S.refill)/a;return tg+(p-tg)*Math.exp(-a*dt);}
  function eventsOf(rec,S){return S.events.concat(EVENTS[rec.id]||[]).slice().sort(function(a,b){return a[0]-b[0];});}
  function pressureOf(rec,h,t,speed){var S=sealOf(rec);
    if(BOUND[rec.id])return LIVE[rec.id]==null?S.inside:LIVE[rec.id];
    var E=eventsOf(rec,S);
    if(E.length){var p=S.inside,o=0,tc=-Infinity;for(var i=0;i<E.length&&E[i][0]<=t;i++){if(tc>-Infinity)p=relax(S,p,o,E[i][0]-tc,E[i][0]);tc=E[i][0];o=E[i][1];}
      if(tc>-Infinity)p=relax(S,p,o,t-tc,t);return p;}
    if(S.fail){var c=S.fail,C=clock(rec,h,c,t,speed),seg=C.S,q=C.q;if(!q)return relax(S,S.inside,1,1e9,t);
      /* a ramp folded as four steps at their middles; the period's affine map p -> A p + B, its fixed point the steady state */
      function steps(){var L=[];seg.forEach(function(g){if(!(g[1]>0))return;if(g[2]===g[3])L.push([g[1],g[2]]);else for(var j=0;j<4;j++)L.push([g[1]/4,g[2]+(g[3]-g[2])*(j+.5)/4]);});return L;}
      var P=steps(),A=1,B=0;P.forEach(function(s){var a=s[1]/S.bleed+(1-s[1])/S.refill,tg=(s[1]*outAt(S,t)/S.bleed+(1-s[1])*S.inside/S.refill)/a,e=Math.exp(-a*s[0]);A*=e;B=B*e+tg*(1-e);});
      var p0=A<1?B/(1-A):S.inside,u=0,want=t+C.off-Math.floor((t+C.off)/C.L)*C.L;
      for(var k=0;k<P.length;k++){var st=P[k];if(u+st[0]>=want){p0=relax(S,p0,st[1],want-u,t);return p0;}p0=relax(S,p0,st[1],st[0],t);u+=st[0];}
      return p0;}
    return S.inside;}
  var THIN=null;function thinRow(){if(THIN)return THIN;var KT=root.KTAGS,r=KT&&KT.VOCAB&&KT.VOCAB.ambientKinds&&KT.VOCAB.ambientKinds['thin-air'];return THIN=r||{start:.6,worst:.06};}
  function thinK(p){var r=thinRow(),sp=r.start-r.worst;return sp?cl((r.start-p)/sp):0;}
  function openNow(rec,S,t){if(BOUND[rec.id])return cl(+BOUND[rec.id](t)||0);var E=eventsOf(rec,S),o=0;for(var i=0;i<E.length&&E[i][0]<=t;i++)o=E[i][1];return o;}
  function sealState(rec,h,t,speed){var S=sealOf(rec),p=pressureOf(rec,h,t,speed),k=thinK(p),o;
    if(S.fail&&!BOUND[rec.id]&&!eventsOf(rec,S).length){var q=clock(rec,h,S.fail,t,speed).q;o={state:q?(q.k>0?'failed':q.state==='warn'?'warn':'sealed'):'failed',open:q?q.k:1,left:q?q.left:null};if(q&&q.state==='warn')o.warn=true;}
    else{var op=openNow(rec,S,t);o={state:op>0?'breached':p<S.inside-1e-3?'refilling':'sealed',open:op};}
    o.k=k;o.on=k>0;o.pressure=p;return o;}
  function pressure(rec,t){var h=H.of(rec);if(!h||h.kind!=='seal')throw new Error('KHAZ.pressure: a seal record');return pressureOf(rec,h,t,H.speed);}
  function sealRec(rec,w){var h=H.of(rec);if(!h||h.kind!=='seal')throw new Error(w+': a seal record');return h;}
  function breach(rec,t,open){sealRec(rec,'KHAZ.breach');(EVENTS[rec.id]=EVENTS[rec.id]||[]).push([fin(t,'t'),cl(d(open,1))]);}
  function reseal(rec,t){sealRec(rec,'KHAZ.reseal');(EVENTS[rec.id]=EVENTS[rec.id]||[]).push([fin(t,'t'),0]);}
  function bindDoor(rec,fn){sealRec(rec,'KHAZ.bindDoor');if(fn==null){delete BOUND[rec.id];delete LIVE[rec.id];return null;}
    if(typeof fn!=='function')throw new Error('KHAZ.bindDoor: fn(t) -> open 0..1');BOUND[rec.id]=fn;LIVE[rec.id]=sealOf(rec).inside;return fn;}
  function sealStep(t,dt,T){var L=H.list(T);for(var i=0;i<L.length;i++){var r=L[i];if(!BOUND[r.id])continue;var S=sealOf(r);
    LIVE[r.id]=relax(S,LIVE[r.id]==null?S.inside:LIVE[r.id],cl(+BOUND[r.id](t)||0),fin(dt,'dt'),t);}}

  /* ---- the builders: a tags.hazard each, its state function named; o overrides any field */
  function over(h,o){if(o)for(var k in o)h[k]=o[k];return h;}
  var TUNNEL={
    rockburst:function(o){var h=over({kind:'rockburst',stateFn:FN.rockburst,cycle:copy(RB),burst:{cell:40,throw:6,spall:[.05,.4]}},o);if(!h.cycle)h.cycle=copy(RB);return h;},
    inrush:function(o){var h=over({kind:'inrush',stateFn:FN.inrush,cycle:copy(IR),inrush:{depth:3,deep:1.4}},o);if(!h.cycle)h.cycle=copy(IR);return h;},
    seal:function(o){return over({kind:'seal',stateFn:FN.seal,seal:{door:null,inside:1,outside:.05,bleed:40,refill:900}},o);}};
  function tunnelAudit(T){var out=[];H.list(T).forEach(function(r){var h=H.of(r);if(!FN[h.kind])return;
    if(h.stateFn!==FN[h.kind]){out.push({id:r.id,kind:h.kind,why:'no state function (write it with KHAZ.TUNNEL.'+h.kind+')'});return;}
    try{if(h.kind==='rockburst'){cycOf(h.cycle||RB,r.id);burstOf(r);}else if(h.kind==='inrush'){inrushOf(r);if(h.cycle)cycOf(h.cycle,r.id);}else sealOf(r);}
    catch(e){out.push({id:r.id,kind:h.kind,why:e.message});}});return out;}

  /* the water over a point on the queries that take y: only an inrush hit moves (as 21's pool share) */
  var at0=H.at,dose0=H.dose,doses0=H.doses,here0=H.here,exposure0=H.exposure,exp0=H.export;
  function floodHits(R,t,y){if(y==null)return R;var moved=false,out=[];
    R.forEach(function(e){if(e.kind!=='inrush'||e.radiant){out.push(e);return;}var s=floodShare(e.rec,H.of(e.rec),t,y);if(s===1){out.push(e);return;}moved=true;if(!(s>0))return;
      var c={};for(var k in e)c[k]=e[k];c.dose=e.dose*s;c.state={};for(var q in e.state)c.state[q]=e.state[q];c.state.k=e.state.k*s;c.flood=s;out.push(c);});
    if(!moved)return R;out.sort(function(a,b){return b.danger*b.state.k-a.danger*a.state.k||(a.id<b.id?-1:a.id>b.id?1:0);});return out;}
  H.at=function(x,z,t,y,T,tIns){return floodHits(at0(x,z,t,y,T,tIns),t,y);};
  H.dose=function(rec,x,z,t,y,tIn){var h=H.of(rec);return dose0(rec,x,z,t,y,tIn)*(h?floodShare(rec,h,t,y):1);};
  H.doses=function(rec,x,z,t,y,tIn){var o=doses0(rec,x,z,t,y,tIn),h=H.of(rec),s=h?floodShare(rec,h,t,y):1;if(s!==1)for(var k in o)o[k]*=s;return o;};
  H.here=function(x,y,z,t,T,o){var r=here0(x,y,z,t,T,o),R=floodHits(r.records,t,y);if(R===r.records)return r;var D={};
    R.forEach(function(e){var ds=e.radiant?{burn:e.dose}:H.doses(e.rec,x,z,t,y,o&&o.tIns&&o.tIns[e.id]);for(var k in ds)D[k]=(D[k]||0)+ds[k];});
    r.ambient.forEach(function(a){D[a.effect]=(D[a.effect]||0)+a.dose;});r.records=R;r.doses=D;return r;};
  H.exposure=function(T){var E=exposure0(T),step=E.step;E.step=function(x,z,t,dt,y){return floodHits(step(x,z,t,dt,y),t,y);};return E;};
  /* the export: a tunnel record's raw fields (burst, inrush, seal: make() keeps only the fields it knows) ride as hazard.raw */
  H.export=function(T,inBox){var X=exp0(T,inBox),L=H.list(T),by={};L.forEach(function(r){by[r.id]=r;});
    X.records.forEach(function(o){if(!FN[o.hazard.kind])return;var r=raw(by[o.id]),w={};['burst','inrush','seal'].forEach(function(k){if(r[k]!=null)w[k]=typeof r[k]==='object'?JSON.parse(JSON.stringify(r[k])):r[k];});o.hazard.raw=w;});return X;};

  H.STATES[FN.rockburst]=rockburstState;H.STATES[FN.inrush]=inrushState;H.STATES[FN.seal]=sealState;
  H.TUNNEL=TUNNEL;H.burstAt=burstAt;H.spalls=spalls;H.flood=flood;H.pressure=pressure;H.breach=breach;H.reseal=reseal;H.bindDoor=bindDoor;H.sealStep=sealStep;
  H.tunnelAudit=tunnelAudit;H.TUNNEL_ROWS=ROWS;
})(typeof globalThis!=='undefined'?globalThis:this);
