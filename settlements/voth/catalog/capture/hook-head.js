/* ==== CAPTURE HOOK (head) — injected by catalog/capture/capture.py ====
   Runs as the first thing inside BUILD(). Never part of the real city build.

   Every push() into the city's instancing buckets is also appended to LOG,
   tagged with the current fragment. Structure builders listed in capture.py
   are wrapped (hook-wraps, generated) so each call remembers the LOG range it
   produced and the frame it was built in. Pushes made outside any wrapped
   builder are counted per fragment and, one in twelve, stack-sampled so the
   inventory can name the functions it did not wrap. */
var __CAP = { log: [], frag: '', depth: 0, calls: [], stackHits: {}, loose: {}, looseN: 0, mills: [] };
window.__CAP = __CAP;
function __capFrag(name){ __CAP.frag = name; }
function __capWrap(name, fn, frameOf, keyOf){
  return function(){
    var args = arguments;
    var rec = { fn: name, key: null, s: __CAP.log.length, e: -1, frame: null, argv: null };
    try { rec.key = keyOf ? keyOf(args) : name; } catch(err){ rec.key = name; }
    try { rec.frame = frameOf ? frameOf(args) : null; } catch(err){ rec.frame = null; }
    __CAP.depth++;
    try { return fn.apply(this, args); }
    finally {
      __CAP.depth--;
      rec.e = __CAP.log.length;
      if(rec.e > rec.s) __CAP.calls.push(rec);
    }
  };
}
function __capPush(shape, fam, r){
  __CAP.log.push([shape, fam, r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]]);
  if(!__CAP.depth){
    __CAP.loose[__CAP.frag] = (__CAP.loose[__CAP.frag] || 0) + 1;
    if((__CAP.looseN++ % 12) === 0){
      var st = String(new Error().stack).split('\n').slice(2, 7).map(function(l){
        var m = l.match(/at (?:Object\.)?([A-Za-z0-9_$.]+) /), ln = l.match(/:(\d+):\d+\)?$/);
        var nm = m && m[1] !== 'Array.forEach' ? m[1] : '';
        return nm && nm !== 'eval' ? nm : ('@' + (ln ? ln[1] : '?')); });
      var k = __CAP.frag + ' :: ' + st.filter(function(n){ return n.indexOf('__cap') < 0 && n !== 'push' && ['BOX','FR8','FR6','FR3','DOME','BLOB','STK','CYL','CONE'].indexOf(n) < 0; }).slice(0, 2).join(' < ');
      __CAP.stackHits[k] = (__CAP.stackHits[k] || 0) + 12;
    }
  }
}
/* frames: [x, z, ry] — the origin the records are re-expressed around */
function __fXYZRY(xi, zi, ri){ return function(a){ return [a[xi], a[zi], ri < 0 ? 0 : (a[ri] || 0)]; }; }
function __fCanton(ci){ return function(a){ return [a[ci].x, a[ci].z, 0]; }; }
function __fSeg(ax, az, bx, bz){ return function(a){ return [(a[ax] + a[bx]) / 2, (a[az] + a[bz]) / 2, Math.atan2(-(a[bz] - a[az]), a[bx] - a[ax])]; }; }
function __fObj(i){ return function(a){ return [a[i].x, a[i].z, a[i].ry || 0]; }; }
