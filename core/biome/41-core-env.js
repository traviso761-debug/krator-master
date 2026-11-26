// ================================================================= BIOME CORE — the environmental fields' contract  [G data]
// One set of host fields, with units (core/biome/README.md, "The environmental fields"). Kits name these ad hoc today (wet, salt, upland, flow, mist...); each
// turn maps its own to these. This file is the contract as data and thin adapters from what already holds the numbers: it owns no field, and no kit is on
// it yet. Plain functions of (x, z): no THREE, no DOM. Opt-in: a build lists it in CORE_BIOME, after 10-core-head.js.
//   BIO.ENV           {name: {unit, range, from}}: the contract
//   BIO.env(o)        -> a table {name: (x, z) -> number}, a field left out where nothing gives it. o: ground (x, z) -> y; water (WATER.fieldFns(F), or
//                     WATER.fieldAt's F with o.waterAt = WATER.fieldFns); therm (a KTHERM H, or KTHERM.fieldFns(F)); temp (x, z) -> degrees C (the country's soil, when no therm);
//                     rock, salt, wet (x, z) -> 0..1 (a kit's own: a strata's exposed beds, a scour's channels, a pan: each takes the kit's reading);
//                     bands {wet: 40 m, flow: 60 m, slope: [.6, 1.2], cold: [-8, 4] degrees, upland: [y0, y1] m}; step (4 m: the slope's central difference)
//   BIO.envCheck(T, pts) -> [{name, x, z, value}]: every value of the table T out of its range at pts (a probe's check, and the test's)
//   BIO.envInto(fields, T, alias)  T's unitless fields into a host's field table for BIO.field; alias {contract name: the kit's}. Metres and degrees go under
//                     their own names, so BIO.field('flow'), 0..1 as ever, is never handed metres. Returns fields
(function(root){
  'use strict';
  var BIO=root.BIO;if(!BIO)return;
  function sm(a,b,v){var t=(v-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);}
  BIO.ENV={
    elevation:{unit:'m',range:[-Infinity,Infinity],from:'the page\'s ground (terrainH, a KFIELD)'},
    slope:{unit:'m/m',range:[0,Infinity],from:'the ground\'s central difference'},
    shore:{unit:'m',range:[-Infinity,Infinity],from:'WATER.fields: to the water\'s edge, over 0 on land'},
    depth:{unit:'m',range:[0,Infinity],from:'WATER.fields: of water over the ground'},
    flowDist:{unit:'m',range:[0,Infinity],from:'WATER.fields: to the nearest running water'},
    flow:{unit:'0..1',range:[0,1],from:'flowDist over bands.flow: the near-water share BIO.field(\'flow\') always was'},
    wet:{unit:'0..1',range:[0,1],from:'the kit\'s, else shore over bands.wet'},
    salt:{unit:'0..1',range:[0,1],from:'the kit\'s (a pan, a surf line, a brine seep)'},
    cold:{unit:'0..1',range:[0,1],from:'temp over bands.cold: 1 is frozen ground'},
    upland:{unit:'0..1',range:[0,1],from:'elevation over bands.upland'},
    rock:{unit:'0..1',range:[0,1],from:'the kit\'s (KSTRATA ledges, KRELIEF.scarpRock, a scour\'s scabland), else slope over bands.slope'},
    temp:{unit:'degrees C',range:[-100,1200],from:'KTHERM.heatAt, else the country\'s soil'}};
  var ALWAYS={wet:1,salt:1,rock:1};
  BIO.env=function(o){o=o||{};var B=o.bands||{},T={},g=o.ground,st=o.step==null?4:o.step,W=o.water&&o.waterAt?o.waterAt(o.water):o.water||null;
    if(g){T.elevation=g;T.slope=function(x,z){var dx=(g(x+st,z)-g(x-st,z))/(2*st),dz=(g(x,z+st)-g(x,z-st))/(2*st);return Math.sqrt(dx*dx+dz*dz);};}
    if(W){if(W.shore)T.shore=W.shore;if(W.depth)T.depth=W.depth;if(W.flow){T.flowDist=W.flow;var fb=B.flow==null?60:B.flow;T.flow=function(x,z){return 1-sm(0,fb,W.flow(x,z));};}}
    var H=o.therm||null,tf=H?(H.heatAt||H.temp):o.temp;if(tf){T.temp=H&&H.heatAt?function(x,z){return H.heatAt(x,z);}:tf;var cb=B.cold||[-8,4];T.cold=function(x,z){return 1-sm(cb[0],cb[1],T.temp(x,z));};}
    if(o.wet)T.wet=o.wet;else if(T.shore){var wb=B.wet==null?40:B.wet;T.wet=function(x,z){return 1-sm(0,wb,T.shore(x,z));};}
    if(o.salt)T.salt=o.salt;
    if(o.rock)T.rock=o.rock;else if(T.slope){var sb=B.slope||[.6,1.2];T.rock=function(x,z){return sm(sb[0],sb[1],T.slope(x,z));};}
    if(g&&B.upland){var ub=B.upland;T.upland=function(x,z){return sm(ub[0],ub[1],g(x,z));};}
    return T;};
  BIO.envCheck=function(T,pts){var out=[];Object.keys(T).forEach(function(n){var C=BIO.ENV[n];if(!C){out.push({name:n,x:0,z:0,value:'not in the contract'});return;}
    pts.forEach(function(p){var v=T[n](p[0],p[1]);if(!(v>=C.range[0]&&v<=C.range[1]))out.push({name:n,x:p[0],z:p[1],value:v});});});return out;};
  BIO.envInto=function(fields,T,alias){Object.keys(T).forEach(function(n){var C=BIO.ENV[n];if(!C||C.unit!=='0..1')return;fields[alias&&alias[n]||n]=T[n];});return fields;};
})(typeof window!=='undefined'?window:globalThis);
