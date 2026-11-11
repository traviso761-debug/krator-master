// ================================================================= CORE — biome: spans, silk and cables hung between two anchors  [G data]
// A catenary helper the spiderlake (bridge-curtains, brood-pavilion guys, reeling frames: biomes/spiderlake/PLAN.md) and
// loom-chasms (the living cables across the rifts, 100-300 m: biomes/loom-chasms/PLAN.md section 4) plans both need, written once.
// Plain numbers: no THREE, no DOM, no Math.random; jitter from KRAND.hash(seed, i, salt). Opt-in, needs nothing else on the page but
// core/rand for strands' jitter. Axes: y up, metres. node core/biome/test-span.js.
//
//   KSPAN.solve(a:[x,y,z], b:[x,y,z], {length | slack (.04: the length over the chord, a share) | sag (m: the curve under the chord's
//     midpoint), up (false: a buoyant cable that arches up instead, as a lighter-than-air one would)})
//     -> {kind:'span', a, b, D (the horizontal run), dy, c (the catenary's parameter), x0 (its vertex, m from a along the run), k,
//         length, sag, up}
//     A catenary's shape does not depend on its weight, only on its anchors and length: weight sets only its tension.
//   KSPAN.at(S, t) -> [x, y, z] at t 0..1 of the horizontal run;  KSPAN.points(S, n) -> n+1 points;  KSPAN.tangent(S, t) -> unit
//   KSPAN.low(S) -> {t, p}: the lowest point (the highest for up), clamped to the span
//   KSPAN.tension(S, w) -> {H (horizontal, N), a, b (at each end, N)} for a weight w N/m (net of buoyancy)
//   KSPAN.strands({a0, a1, b0, b1 (the two anchor lines' ends), n, slack:[lo, hi], seed}) -> [span]: n spans from points along
//     a0-a1 to the matching points along b0-b1, each its own slack by hash (a silk curtain, a tier of cables)
(function(root){
  'use strict';
  if(root.KSPAN)return;
  function d(v,x){return v==null?x:v;}
  function cosh(x){return (Math.exp(x)+Math.exp(-x))/2;}
  function sinh(x){return (Math.exp(x)-Math.exp(-x))/2;}
  function asinh(x){return Math.log(x+Math.sqrt(x*x+1));}
  // the parameter c for a run D and a length L over the chord's vertical dy: sqrt(L^2 - dy^2) = 2 c sinh(D / 2c), by bisection in log c
  function cOfLength(D,dy,L){var q=Math.sqrt(L*L-dy*dy),lo=Math.log(D*1e-4),hi=Math.log(D*1e6);
    for(var i=0;i<200;i++){var m=(lo+hi)/2,c=Math.exp(m),v=2*c*sinh(D/(2*c));if(v>q)lo=m;else hi=m;}return Math.exp((lo+hi)/2);}
  function frame(S){var dx=S.b[0]-S.a[0],dz=S.b[2]-S.a[2];return [dx/S.D,dz/S.D];}
  function yAt(S,x){var y=S.c*cosh((x-S.x0)/S.c)+S.k;return y;}
  function shape(D,dy,c){var x0=D/2-c*asinh(dy/(2*c*sinh(D/(2*c))));return {x0:x0,k:-c*cosh(x0/c)};}
  function make(a,b,c,up){var D=Math.hypot(b[0]-a[0],b[2]-a[2]),dy=(b[1]-a[1])*(up?-1:1),sh=shape(D,dy,c),L=Math.sqrt(dy*dy+Math.pow(2*c*sinh(D/(2*c)),2));
    var S={kind:'span',a:[a[0],a[1],a[2]],b:[b[0],b[1],b[2]],D:D,dy:b[1]-a[1],c:c,x0:sh.x0,k:sh.k,length:L,up:!!up};
    S.sag=Math.abs((a[1]+b[1])/2-KSPAN.at(S,.5)[1]);return S;}
  var KSPAN={
    solve:function(a,b,o){o=o||{};if(!a||!b)throw new Error('KSPAN.solve: two anchors are needed');
      var D=Math.hypot(b[0]-a[0],b[2]-a[2]),dy=b[1]-a[1],chord=Math.hypot(D,dy),up=!!o.up;
      if(!(D>1e-6))throw new Error('KSPAN.solve: the anchors stand one over the other (no run)');
      if(o.sag!=null){if(!(o.sag>0))throw new Error('KSPAN.solve: sag must be over 0');
        var lo=Math.log(D*1e-4),hi=Math.log(D*1e6);
        for(var i=0;i<200;i++){var m=(lo+hi)/2,S=make(a,b,Math.exp(m),up);if(S.sag>o.sag)lo=m;else hi=m;}
        return make(a,b,Math.exp((lo+hi)/2),up);}
      var L=o.length!=null?o.length:chord*(1+d(o.slack,.04));
      if(!(L>chord*(1+1e-9)))throw new Error('KSPAN.solve: the length must be over the chord ('+chord.toFixed(3)+' m)');
      return make(a,b,cOfLength(D,up?-dy:dy,L),up);},
    at:function(S,t){var u=frame(S),x=S.D*t,y=yAt(S,x);return [S.a[0]+u[0]*x,S.a[1]+(S.up?-y:y),S.a[2]+u[1]*x];},
    points:function(S,n){n=d(n,16);var o=[];for(var i=0;i<=n;i++)o.push(KSPAN.at(S,i/n));return o;},
    tangent:function(S,t){var u=frame(S),s=sinh((S.D*t-S.x0)/S.c)*(S.up?-1:1),l=Math.sqrt(1+s*s);return [u[0]/l,s/l,u[1]/l];},
    low:function(S){var t=Math.min(1,Math.max(0,S.x0/S.D));return {t:t,p:KSPAN.at(S,t)};},
    tension:function(S,w){var H=w*S.c,end=function(x){return H*cosh((x-S.x0)/S.c);};return {H:H,a:end(0),b:end(S.D)};},
    strands:function(o){var K=root.KRAND;if(!K)throw new Error('KSPAN.strands: core/rand is needed');if(!o||!o.a0||!o.a1||!o.b0||!o.b1)throw new Error('KSPAN.strands: a0, a1, b0 and b1 are needed');
      var n=d(o.n,8),sl=o.slack||[.02,.08],seed=(o.seed==null?1:o.seed)>>>0,out=[];
      function lerp3(p,q,t){return [p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];}
      for(var i=0;i<n;i++){var t=n>1?i/(n-1):.5,u=K.unit(K.hash(seed,i,0x5A9));
        var S=KSPAN.solve(lerp3(o.a0,o.a1,t),lerp3(o.b0,o.b1,t),{slack:sl[0]+(sl[1]-sl[0])*u,up:o.up});S.i=i;out.push(S);}
      return out;}
  };
  root.KSPAN=KSPAN;
})(typeof window!=='undefined'?window:globalThis);
