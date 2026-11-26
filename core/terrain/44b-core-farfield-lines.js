// ================================================================= CORE — far lines: dark streaks on a far wall (KFAR.streaks)  [G data]
// The Cliff Lungs' section 14 item 7 (2026-11-03): from across the cloud sea the lungs read as dark lines down the Inner Wall,
// their cap clouds as sprites (KFAR.sprites). The far lattice is kilometres a cell, too coarse to carry a line metres wide,
// so a line is its own item: a segment with a width, drawn as a camera-facing ribbon (host/44b-core-farfield-lines-draw.js),
// and like the sprites scaled by ONE value of the kit's (a lung wet and dark at the breath, pale when dry). Waterfalls, scars
// and a far road read the same way. Opt-in; needs core/rand and 44-core-farfield.js. No THREE, no DOM; test-farfield-lines.js.
//   KFAR.streaks({world, lines, shape, range, kind ('line')})
//     lines [{a:[x, y, z], b:[x, y, z], w (m: 40), alpha (.7), lag (0: the value it starts at), tint ([.12, .1, .09]), wobble (0: m the
//           ribbon's width varies along it, by KRAND)}]; shape(x, z, y) -> y (the far grid's exaggeration and curve, as for sprites)
//     -> {kind, world, count, a (x y z), b (x y z), w, alpha, lag, tint (r g b), seed, range}
//   KFAR.streakAt(S, i, k, r)  {w, alpha} of line i at the kit's value k and distance r: the shader's numbers
//   KFAR.streaksOf(set)  a set from KFAR.itemsLoad with its arrays typed again (itemsLoad types only the sprites')
// Godot: a MultiMesh of quads with the same per-instance data (KFAR.itemsExport carries it as a set of kind 'line').
(function(root){
  'use strict';
  var K=root.KFAR;
  if(!K||!K.sprites||!K.spriteAt)throw new Error('core/terrain 44b-core-farfield-lines.js: load 44-core-farfield.js first (KFAR)');
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function sm(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
  function streaks(o){var R=root.KRAND;if(!R)throw new Error('KFAR.streaks: load core/rand/08-core-rand.js first');
    if(!o||!o.lines||!o.lines.length)throw new Error('KFAR.streaks: lines are needed');
    var wd=(o.world==null?0:o.world)>>>0,A=[],B=[],W=[],Al=[],Lg=[],Tn=[],Sd=[];
    o.lines.forEach(function(l,i){if(!Array.isArray(l.a)||l.a.length!==3||!Array.isArray(l.b)||l.b.length!==3)throw new Error('KFAR.streaks: a line needs a and b, [x, y, z]');
      var w=l.w==null?40:l.w;if(!(w>0))throw new Error('KFAR.streaks: a line\'s w must be above 0');
      var u=function(c){return R.unit(R.hash(wd,i,0,0xFA3+c));},wb=l.wobble==null?0:l.wobble,t=l.tint||[.12,.1,.09],lg=l.lag==null?0:l.lag;
      var ya=o.shape?o.shape(l.a[0],l.a[2],l.a[1]):l.a[1],yb=o.shape?o.shape(l.b[0],l.b[2],l.b[1]):l.b[1];
      A.push(l.a[0],ya,l.a[2]);B.push(l.b[0],yb,l.b[2]);W.push(w+wb*(2*u(0)-1));Al.push(l.alpha==null?.7:l.alpha);Lg.push(lg);Tn.push(t[0],t[1],t[2]);Sd.push(u(1));});
    return {kind:o.kind==null?'line':o.kind,world:wd,count:W.length,a:new Float32Array(A),b:new Float32Array(B),w:new Float32Array(W),alpha:new Float32Array(Al),
      lag:new Float32Array(Lg),tint:new Float32Array(Tn),seed:new Float32Array(Sd),range:o.range||null};}
  function streakAt(S,i,k,r){var g=clamp((k-S.lag[i])/Math.max(1-S.lag[i],.001),0,1),R=S.range,f=1;
    if(R){var w=(R[1]-R[0])*.1,d=r==null?(R[0]+R[1])/2:r;f=sm(R[0],R[0]+w,d)*(1-sm(R[1]-w,R[1],d));}
    /* a line keeps half its width and a third of its darkness at the value's zero: the lungs' furrows are there when dry */
    return {w:S.w[i]*(.5+.5*g),alpha:S.alpha[i]*(.33+.67*g)*f};}
  /* a set back from KFAR.itemsLoad (which types only the sprites' arrays): its arrays typed again, for streakMesh */
  function streaksOf(S){var o={};Object.keys(S).forEach(function(k){o[k]=['a','b','w','alpha','lag','tint','seed'].indexOf(k)>=0?new Float32Array(S[k]):S[k];});return o;}
  K.streaks=streaks;K.streakAt=streakAt;K.streaksOf=streaksOf;
})(typeof window!=='undefined'?window:globalThis);
