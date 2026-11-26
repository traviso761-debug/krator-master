// ================================================================= CORE — cavern: the floor under the eye, and the open air (KCAVERN.floorFn, openAt)  [G data]
// Lifted 2026-11-09 from the Hearths' cave page (biomes/hearths, stations/crystals 49), for every cave page: a cave page has no
// heightfield to stand on, so its camera, its BIO host and its views read the floor of the voids from the cavern's own sdf. Opt-in; needs
// 39-core-cavern.js. No THREE, no DOM: plain maths, node-tested (test-cavern-floor.js). Axes: y up, metres.
//
//   const floorH = KCAVERN.floorFn(C, {from, to, step (.5), fallback, cell (1), pad (.05)})
//     the lowest open point of the column at (x, z) between `from` and `to` (from < to), on a `cell` m lattice (each node read once and cached:
//     `step` up from `from` until C.sdf passes `pad`, then halved four times), bilinear between nodes; a column of rock reads `fallback`.
//     floorH.at(x, z) the node's own value, floorH.cache the Map (its size is how much was read)
//   KCAVERN.openAt(C, x, y, z, pad (0))  true where (x, y, z) is in the open (a void or the sky) by more than pad
(function(root){
  'use strict';
  var K=root.KCAVERN;if(!K)throw new Error('39d-core-cavern-floor: load core/terrain/39-core-cavern.js first');
  function d(v,x){return v==null?x:v;}
  K.openAt=function(C,x,y,z,pad){return C.sdf(x,y,z)>d(pad,0);};
  K.floorFn=function(C,o){o=o||{};if(!C||typeof C.sdf!=='function')throw new Error('KCAVERN.floorFn: a built KCAVERN');
    var from=o.from,to=o.to;if(typeof from!=='number'||typeof to!=='number'||!(from<to))throw new Error('KCAVERN.floorFn: from < to (numbers)');
    var step=d(o.step,.5),cell=d(o.cell,1),pad=d(o.pad,.05),fb=d(o.fallback,from),M=new Map();
    if(!(step>0)||!(cell>0))throw new Error('KCAVERN.floorFn: step and cell are positive');
    function node(i,j){var k=i*1048576+j,h=M.get(k);if(h!==undefined)return h;var x=i*cell,z=j*cell;h=fb;
      for(var y=from;y<to;y+=step)if(C.sdf(x,y,z)>pad){var lo=y-step;for(var s=0;s<4;s++){var m=(lo+y)/2;if(C.sdf(x,m,z)>pad)y=m;else lo=m;}h=y;break;}
      M.set(k,h);return h;}
    function f(x,z){var u=x/cell,v=z/cell,i=Math.floor(u),j=Math.floor(v),a=u-i,b=v-j;
      return (node(i,j)*(1-a)+node(i+1,j)*a)*(1-b)+(node(i,j+1)*(1-a)+node(i+1,j+1)*a)*b;}
    f.at=function(x,z){return node(Math.round(x/cell),Math.round(z/cell));};f.cache=M;
    return f;};
})(typeof window!=='undefined'?window:globalThis);
