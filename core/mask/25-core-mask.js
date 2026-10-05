// ================================================================= CORE MASK — a city's placement raster ([G data])
// GODOT-PLAN.md Phase 2 item 5. The four mask-placed cities (Iziz, Dalab, Erewhon, Roketstad) paint their buildable
// mask and street classes onto 2D canvases and read the pixels back to place buildings. A canvas anti-aliases, and a
// GPU-backed canvas and a CPU-backed one do not give the same pixels, so placement differed by machine (Dalab's
// willReadFrequently stopgap; Erewhon's plot failures inside a road's soft edge). This is that canvas, as data:
//
//   const mv = KMASK.canvas(2048, 2048)   in place of a document canvas element; mv.getContext() -> ctx (any argument)
//   ctx  the subset of CanvasRenderingContext2D the painters use on their masks:
//        fillStyle strokeStyle lineWidth lineCap lineJoin (any value: every stroke has round caps and joins)
//        beginPath moveTo lineTo arc (full circles only: 0 to >= 2 PI) rect closePath fill stroke fillRect
//        getImageData(0, 0, w, h) (a copy) createImageData putImageData(img, 0, 0)
//   KMASK.hash(c)          FNV-1a of the RGBA bytes, 8 hex digits: the proof two loads painted the same
//   KMASK.ops(c)           every paint as data ([op, ...numbers]): what Godot replays (kmask.gd)
//   KMASK.export(c, opt)   { format: 'krator-mask', version: 1, width, height, hash, ops } (opt.data adds the bytes, base64)
//
// The rule: a pixel (i, j) is painted when its centre (i + .5, j + .5) is inside the shape, hard-edged, no
// anti-aliasing. Inside, for a fill: nonzero winding (polygons) or distance <= r (a full-circle arc); for a stroke: distance
// to the polyline <= lineWidth / 2 (round caps and joins), or | distance - r | <= lineWidth / 2 for a circle. A colour
// is '#rgb', '#rrggbb', 'rgb(r,g,b)' or 'rgba(r,g,b,a)': opaque replaces; a < 1 blends, round(src * a + dst * (1 - a)).
// Only +, -, *, / and comparisons, in a fixed order (no sqrt, no trig), so GDScript gives the same bytes.
(function(){
 'use strict';
 var root = typeof globalThis !== 'undefined' ? globalThis : this;
 var K = { version: 1 };

 function parseColour(s){
   s = String(s).trim();
   var m;
   if (s.charAt(0) === '#') {
     if (s.length === 4) return [parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16), parseInt(s[3] + s[3], 16), 1];
     return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), 1];
   }
   if ((m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(s)))
     return [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3]), m[4] === undefined ? 1 : +m[4]];
   throw new Error('core/mask: a colour it cannot read: ' + s);
 }
 K.parseColour = parseColour;

 // ---- the rasteriser, on a raw RGBA byte array (w x h): each call paints one shape ----
 function put(d, o, c){
   if (c[3] >= 1) { d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; return; }
   var a = c[3];
   d[o] = Math.round(c[0] * a + d[o] * (1 - a)); d[o + 1] = Math.round(c[1] * a + d[o + 1] * (1 - a));
   d[o + 2] = Math.round(c[2] * a + d[o + 2] * (1 - a)); d[o + 3] = Math.round(255 * a + d[o + 3] * (1 - a));
 }
 function clampI(v, lo, hi){ return v < lo ? lo : v > hi ? hi : v; }
 // the pixels whose centres x + .5 lie in [a, b]: i from ceil(a - .5) to floor(b - .5)
 function i0(a, n){ return clampI(Math.ceil(a - 0.5), 0, n); }
 function i1(b, n){ return clampI(Math.floor(b - 0.5), -1, n - 1); }

 K.disc = function(d, w, h, cx, cy, r, c){
   var r2 = r * r, ja = i0(cy - r, h), jb = i1(cy + r, h), ia = i0(cx - r, w), ib = i1(cx + r, w);
   for (var j = ja; j <= jb; j++) { var dy = j + 0.5 - cy, dy2 = dy * dy;
     for (var i = ia; i <= ib; i++) { var dx = i + 0.5 - cx; if (dx * dx + dy2 <= r2) put(d, (j * w + i) * 4, c); } }
 };
 K.ring = function(d, w, h, cx, cy, r, hw, c){   // a stroked circle: r - hw <= distance <= r + hw
   var ro = r + hw, ri = r - hw, ro2 = ro * ro, ri2 = ri > 0 ? ri * ri : -1;
   var ja = i0(cy - ro, h), jb = i1(cy + ro, h), ia = i0(cx - ro, w), ib = i1(cx + ro, w);
   for (var j = ja; j <= jb; j++) { var dy = j + 0.5 - cy, dy2 = dy * dy;
     for (var i = ia; i <= ib; i++) { var dx = i + 0.5 - cx, q = dx * dx + dy2; if (q <= ro2 && q >= ri2) put(d, (j * w + i) * 4, c); } }
 };
 // a polyline with round caps and joins: each pixel is painted once (a mark per pixel per stroke, so a blend is not doubled)
 K.polyline = function(d, w, h, pts, hw, c){
   if (pts.length < 2) return;
   var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, k;
   for (k = 0; k < pts.length; k += 2) { if (pts[k] < x0) x0 = pts[k]; if (pts[k] > x1) x1 = pts[k]; if (pts[k + 1] < y0) y0 = pts[k + 1]; if (pts[k + 1] > y1) y1 = pts[k + 1]; }
   var ia = i0(x0 - hw, w), ib = i1(x1 + hw, w), ja = i0(y0 - hw, h), jb = i1(y1 + hw, h);
   if (ib < ia || jb < ja) return;
   var bw = ib - ia + 1, mark = new Uint8Array(bw * (jb - ja + 1)), hw2 = hw * hw;
   for (k = 0; k + 3 < pts.length; k += 2) {
     var ax = pts[k], ay = pts[k + 1], ex = pts[k + 2] - ax, ey = pts[k + 3] - ay, L2 = ex * ex + ey * ey;
     var sa = i0((ax < ax + ex ? ax : ax + ex) - hw, w), sb = i1((ax > ax + ex ? ax : ax + ex) + hw, w);
     var ta = i0((ay < ay + ey ? ay : ay + ey) - hw, h), tb = i1((ay > ay + ey ? ay : ay + ey) + hw, h);
     for (var j = ta; j <= tb; j++) { var py = j + 0.5 - ay;
       for (var i = sa; i <= sb; i++) {
         var m = (j - ja) * bw + (i - ia); if (mark[m]) continue;
         var px = i + 0.5 - ax, t = L2 > 0 ? (px * ex + py * ey) / L2 : 0;
         if (t < 0) t = 0; else if (t > 1) t = 1;
         var qx = px - t * ex, qy = py - t * ey;
         if (qx * qx + qy * qy <= hw2) { mark[m] = 1; put(d, (j * w + i) * 4, c); }
       } }
   }
 };
 // polygons (each a flat [x, y, x, y ...] ring, closed implicitly), filled together by the nonzero winding rule
 K.polygons = function(d, w, h, rings, c){
   var y0 = Infinity, y1 = -Infinity, r, k;
   for (r = 0; r < rings.length; r++) for (k = 1; k < rings[r].length; k += 2) { if (rings[r][k] < y0) y0 = rings[r][k]; if (rings[r][k] > y1) y1 = rings[r][k]; }
   var ja = i0(y0, h), jb = i1(y1, h), xs = [], ws = [];
   for (var j = ja; j <= jb; j++) {
     var yc = j + 0.5; xs.length = 0; ws.length = 0;
     for (r = 0; r < rings.length; r++) { var P = rings[r], n = P.length;
       for (k = 0; k < n; k += 2) { var ax = P[k], ay = P[k + 1], bx = P[(k + 2) % n], by = P[(k + 3) % n];
         if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) { xs.push(ax + (yc - ay) * (bx - ax) / (by - ay)); ws.push(by > ay ? 1 : -1); } } }
     if (!xs.length) continue;
     var ord = xs.map(function(_, q){ return q; }).sort(function(a, b){ return xs[a] - xs[b] || a - b; }), wind = 0;
     for (var q = 0; q < ord.length - 1; q++) { wind += ws[ord[q]];
       if (wind !== 0) { var ia = i0(xs[ord[q]], w), ib = i1(xs[ord[q + 1]], w); for (var i = ia; i <= ib; i++) put(d, (j * w + i) * 4, c); } }
   }
 };
 K.rect = function(d, w, h, x, y, rw, rh, c){   // pixel centres in [x, x + rw) x [y, y + rh)
   var ia = clampI(Math.ceil(x - 0.5), 0, w), ib = clampI(Math.ceil(x + rw - 0.5) - 1, -1, w - 1);
   var ja = clampI(Math.ceil(y - 0.5), 0, h), jb = clampI(Math.ceil(y + rh - 0.5) - 1, -1, h - 1);
   for (var j = ja; j <= jb; j++) for (var i = ia; i <= ib; i++) put(d, (j * w + i) * 4, c);
 };

 // ---- the canvas: a context that records its path and paints on fill / stroke ----
 var TAU = 2 * Math.PI;
 K.canvas = function(w, h){
   var data = new Uint8ClampedArray(w * h * 4), ops = [];
   for (var o = 3; o < data.length; o += 4) data[o] = 0;   // transparent black, as a fresh canvas
   var cv = { width: w, height: h, _kmask: true, data: data, ops: ops };
   var path = [], cur = null;   // path: subpaths, each { pts: [x, y ...], closed, circle: [cx, cy, r] }
   function sub(){ if (!cur) { cur = { pts: [], closed: false, circle: null }; path.push(cur); } return cur; }
   function cc(s){ return parseColour(s); }
   var ctx = { canvas: cv, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, lineCap: 'butt', lineJoin: 'miter',
     beginPath: function(){ path = []; cur = null; },
     moveTo: function(x, y){ cur = { pts: [x, y], closed: false, circle: null }; path.push(cur); },
     lineTo: function(x, y){ var s = sub(); if (s.circle) throw new Error('core/mask: a line after a circle in one subpath'); s.pts.push(x, y); },
     closePath: function(){ if (cur) { cur.closed = true; var p = cur.pts; cur = { pts: p.length ? [p[0], p[1]] : [], closed: false, circle: null }; path.push(cur); } },
     arc: function(x, y, r, a0, a1){
       if (Math.abs(a1 - a0) < TAU - 1e-9) throw new Error('core/mask: only full-circle arcs (0 to >= 2 PI) are portable');
       cur = { pts: [], closed: true, circle: [x, y, r] }; path.push(cur); cur = null; },
     rect: function(x, y, rw, rh){ cur = { pts: [x, y, x + rw, y, x + rw, y + rh, x, y + rh], closed: true, circle: null }; path.push(cur); cur = null; },
     fill: function(){
       var c = cc(this.fillStyle), rings = [], k;
       for (k = 0; k < path.length; k++) { var s = path[k];
         if (s.circle) { ops.push(['disc', s.circle[0], s.circle[1], s.circle[2]].concat(c)); K.disc(data, w, h, s.circle[0], s.circle[1], s.circle[2], c); }
         else if (s.pts.length >= 6) rings.push(s.pts.slice()); }
       if (rings.length) { ops.push(['polygons', rings].concat(c)); K.polygons(data, w, h, rings, c); }
     },
     stroke: function(){
       var c = cc(this.strokeStyle), hw = this.lineWidth / 2, k;
       for (k = 0; k < path.length; k++) { var s = path[k];
         if (s.circle) { ops.push(['ring', s.circle[0], s.circle[1], s.circle[2], hw].concat(c)); K.ring(data, w, h, s.circle[0], s.circle[1], s.circle[2], hw, c); continue; }
         var p = s.closed && s.pts.length >= 4 ? s.pts.concat([s.pts[0], s.pts[1]]) : s.pts;
         if (p.length >= 4) { ops.push(['polyline', p.slice(), hw].concat(c)); K.polyline(data, w, h, p, hw, c); } }
     },
     fillRect: function(x, y, rw, rh){ var c = cc(this.fillStyle); ops.push(['rect', x, y, rw, rh].concat(c)); K.rect(data, w, h, x, y, rw, rh, c); },
     getImageData: function(x, y, gw, gh){
       if (x !== 0 || y !== 0 || gw !== w || gh !== h) throw new Error('core/mask: getImageData reads the whole mask');
       return { width: w, height: h, data: data.slice() }; },
     createImageData: function(cw, ch){ return { width: cw, height: ch, data: new Uint8ClampedArray(cw * ch * 4) }; },
     putImageData: function(img, x, y){
       if (x !== 0 || y !== 0 || img.width !== w || img.height !== h) throw new Error('core/mask: putImageData replaces the whole mask');
       data.set(img.data); ops.push(['put', K.hashBytes(img.data)]); },
     save: function(){}, restore: function(){}
   };
   cv.getContext = function(){ return ctx; };
   return cv;
 };

 K.hashBytes = function(b){ var hsh = 2166136261 >>> 0; for (var i = 0; i < b.length; i++) { hsh ^= b[i]; hsh = Math.imul(hsh, 16777619) >>> 0; } return ('0000000' + hsh.toString(16)).slice(-8); };
 K.hash = function(cv){ return K.hashBytes(cv.data); };
 K.ops = function(cv){ return cv.ops; };
 K.export = function(cv, opt){
   var out = { format: 'krator-mask', version: 1, width: cv.width, height: cv.height, hash: K.hash(cv),
     rule: 'pixel centres, hard-edged, nonzero fill, round strokes (core/mask/README.md)', ops: cv.ops };
   if (opt && opt.data && typeof btoa === 'function') { var s = '', d = cv.data; for (var i = 0; i < d.length; i += 8192) s += String.fromCharCode.apply(null, d.subarray(i, i + 8192)); out.data = btoa(s); }
   return out;
 };

 if (typeof module !== 'undefined' && module.exports) module.exports = K;
 root.KMASK = K;
})();
