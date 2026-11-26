// ================================================================= CORE MASK — distance transform ([G data])
// PLAN-LANDS.md (biomes/hyperjungle) H1: a species' reach is a weight from the distance to its home polygon, so the
// distance must be the same in a page, in a node test and in Godot. This is the exact Euclidean distance transform
// (Meijster, Roerdink and Hesselink 2000) on a region raster, in integers only: every result is a squared distance in
// pixels between pixel centres, and the one division is a floor division of integers. kmask.gd's KMask.distance is
// its twin (golden-distance.json, kmask_distance_test.gd).
//
//   const F = KMASK.distance(mask, opt)
//     mask  a KMASK canvas, an { width, height, data } image (RGBA, 4 bytes a pixel) or a { width, height, data } grid of
//           one byte a pixel (data.length === width * height)
//     opt   { channel: 0, threshold: 128 } a pixel is inside when its byte in that channel is >= threshold (a one-byte
//           grid has one channel); { inside: (i, j) => bool } in their place
//   F.width, F.height, F.empty (no inside pixel: every distance is Infinity)
//   F.d2      Int32Array, row by row: the squared distance in pixels to the nearest inside pixel's centre (0 inside)
//   F.at(i, j)       the distance in pixels (sqrt of d2; Infinity off the grid or when empty)
//   F.sample(x, y)   bilinear between pixel centres (pixel i's centre is x = i + .5), clamped to the grid's edge
//   KMASK.distanceHash(F)   FNV-1a of d2's bytes (little-endian int32), 8 hex digits
//
// sqrt is IEEE 754's correctly rounded square root in V8 and in Godot, so at() and sample() agree there too.
(function(){
 'use strict';
 var root = typeof globalThis !== 'undefined' ? globalThis : this;
 var K = root.KMASK || (typeof require === 'function' ? require('./25-core-mask.js') : null);

 // floor(a / b) for integers, b > 0: the remainder rule GDScript's int division and % share (truncate toward zero)
 function fdiv(a, b){ var r = a % b, q = (a - r) / b; return r !== 0 && a < 0 ? q - 1 : q; }

 K.distance = function(mask, opt){
   opt = opt || {};
   var w = mask.width, h = mask.height, data = mask.data, n = w * h;
   if (!(w > 0 && h > 0)) throw new Error('core/mask: distance needs a width and height');
   var inside = opt.inside, stride = 1, ch = 0, th = opt.threshold == null ? 128 : opt.threshold;
   if (!inside) {
     if (!data) throw new Error('core/mask: distance needs data or opt.inside');
     if (data.length === n * 4) { stride = 4; ch = opt.channel == null ? 0 : opt.channel; }
     else if (data.length !== n) throw new Error('core/mask: distance reads 1 or 4 bytes a pixel, not ' + data.length / n);
   }
   var INF = w + h, g = new Int32Array(n), d2 = new Int32Array(n), any = false, i, j, o;
   // phase 1, per column: the distance along the column to the nearest inside pixel (INF when none)
   for (i = 0; i < w; i++) {
     for (j = 0; j < h; j++) {
       o = j * w + i;
       var b = inside ? !!inside(i, j) : data[o * stride + ch] >= th;
       if (b) { g[o] = 0; any = true; } else g[o] = j > 0 ? g[o - w] + 1 : INF;
       if (g[o] > INF) g[o] = INF;
     }
     for (j = h - 2; j >= 0; j--) { o = j * w + i; if (g[o + w] < g[o]) g[o] = g[o + w] + 1; }
   }
   var F = { width: w, height: h, d2: d2, empty: !any };
   if (!any) { d2.fill(-1); }
   else {
     // phase 2, per row: the lower envelope of the parabolas f(x, u) = (x - u)^2 + g(u)^2
     var s = new Int32Array(w), t = new Int32Array(w);
     for (j = 0; j < h; j++) {
       var row = j * w, q = 0, u;
       s[0] = 0; t[0] = 0;
       for (u = 1; u < w; u++) {
         var gu = g[row + u], gu2 = gu * gu;
         while (q >= 0) {
           var sq = s[q], gs = g[row + sq], a = t[q] - sq, c = t[q] - u;
           if (a * a + gs * gs > c * c + gu2) q--; else break;
         }
         if (q < 0) { q = 0; s[0] = u; }
         else {
           var si = s[q], gi = g[row + si], sep = 1 + fdiv(u * u - si * si + gu2 - gi * gi, 2 * (u - si));
           if (sep < w) { q++; s[q] = u; t[q] = sep; }
         }
       }
       for (u = w - 1; u >= 0; u--) {
         var su = s[q], gq = g[row + su], dx = u - su;
         d2[row + u] = dx * dx + gq * gq;
         if (u === t[q]) q--;
       }
     }
   }
   F.at = function(ii, jj){
     if (F.empty || ii < 0 || jj < 0 || ii >= w || jj >= h) return Infinity;
     return Math.sqrt(d2[jj * w + ii]);
   };
   F.sample = function(x, y){
     if (F.empty) return Infinity;
     var fx = x - 0.5, fy = y - 0.5;
     if (fx < 0) fx = 0; else if (fx > w - 1) fx = w - 1;
     if (fy < 0) fy = 0; else if (fy > h - 1) fy = h - 1;
     var ia = Math.floor(fx), ja = Math.floor(fy), ib = ia + 1 < w ? ia + 1 : ia, jb = ja + 1 < h ? ja + 1 : ja;
     var tx = fx - ia, ty = fy - ja;
     var v00 = Math.sqrt(d2[ja * w + ia]), v10 = Math.sqrt(d2[ja * w + ib]);
     var v01 = Math.sqrt(d2[jb * w + ia]), v11 = Math.sqrt(d2[jb * w + ib]);
     var top = v00 + (v10 - v00) * tx, bot = v01 + (v11 - v01) * tx;
     return top + (bot - top) * ty;
   };
   return F;
 };

 K.distanceHash = function(F){
   var hsh = 2166136261 >>> 0, d = F.d2;
   for (var k = 0; k < d.length; k++) { var v = d[k];
     for (var b = 0; b < 4; b++) { hsh ^= (v >>> (8 * b)) & 255; hsh = Math.imul(hsh, 16777619) >>> 0; } }
   return ('0000000' + hsh.toString(16)).slice(-8);
 };

 if (typeof module !== 'undefined' && module.exports) module.exports = K;
 root.KMASK = K;
})();
