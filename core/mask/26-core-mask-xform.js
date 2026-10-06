// ================================================================= CORE MASK — the transform layer ([G data])
// KMASK.xform(cv): a context over a KMASK canvas that also takes the canvas transform calls a world painter makes on its
// mask (Locus's, Mungo's and Yuni's `both(fn)` paint the colour ground and the mask with one function under
// scale/translate/rotate). Every point goes through the current matrix BEFORE it reaches the KMASK context, so the
// recorded ops are plain pixel numbers and kmask.gd replays them unchanged; the rasteriser's rule is untouched.
//
//   const mv = KMASK.xform(KMASK.canvas(w, h))     mv.getContext() -> the transforming context
//   adds   save restore (matrix + styles) translate scale rotate setTransform resetTransform
//          ellipse (full only: a 64-gon through the matrix) setLineDash (a dashed stroke throws: not portable)
//   arc and lineWidth need a similarity (rotation and one scale): a circle stays a circle, a width scales by it;
//   anything else throws. fillRect under a rotation is a 4-gon fill: it resets the current path (a canvas's would not).
//   clearRect throws: on a mask, paint the background colour instead.
(function(){
 'use strict';
 var root = typeof globalThis !== 'undefined' ? globalThis : this;
 var K = root.KMASK || (typeof require === 'function' ? require('./25-core-mask.js') : null);
 if (!K) throw new Error('core/mask: load 25-core-mask.js before 26-core-mask-xform.js');
 var TAU = 2 * Math.PI, EPS = 1e-9;

 K.xform = function(cv){
   var inner = cv.getContext('2d'), M = [1, 0, 0, 1, 0, 0], stack = [], dash = false;
   function P(x, y){ return [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]]; }
   function mul(a, b, c, d, e, f){
     M = [M[0] * a + M[2] * b, M[1] * a + M[3] * b, M[0] * c + M[2] * d, M[1] * c + M[3] * d,
          M[0] * e + M[2] * f + M[4], M[1] * e + M[3] * f + M[5]]; }
   function scaleOf(what){   // the one scale of a similarity; throws for a shear or two scales
     var tol = EPS * (1 + Math.abs(M[0]) + Math.abs(M[1]));
     if (Math.abs(M[0] - M[3]) > tol || Math.abs(M[1] + M[2]) > tol)
       throw new Error('core/mask: ' + what + ' under a non-uniform transform is not portable');
     return Math.sqrt(M[0] * M[0] + M[1] * M[1]); }
   function poly(pts){ var p = P(pts[0], pts[1]); inner.moveTo(p[0], p[1]);
     for (var k = 2; k < pts.length; k += 2) { p = P(pts[k], pts[k + 1]); inner.lineTo(p[0], p[1]); } inner.closePath(); }
   var ctx = { canvas: cv, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, lineCap: 'butt', lineJoin: 'miter',
     save: function(){ stack.push({ M: M.slice(), dash: dash, fillStyle: this.fillStyle, strokeStyle: this.strokeStyle,
       lineWidth: this.lineWidth, lineCap: this.lineCap, lineJoin: this.lineJoin }); },
     restore: function(){ var s = stack.pop(); if (!s) return; M = s.M; dash = s.dash; this.fillStyle = s.fillStyle;
       this.strokeStyle = s.strokeStyle; this.lineWidth = s.lineWidth; this.lineCap = s.lineCap; this.lineJoin = s.lineJoin; },
     translate: function(x, y){ mul(1, 0, 0, 1, x, y); },
     scale: function(x, y){ mul(x, 0, 0, y, 0, 0); },
     rotate: function(a){ var c = Math.cos(a), s = Math.sin(a); mul(c, s, -s, c, 0, 0); },
     setTransform: function(a, b, c, d, e, f){ M = [a, b, c, d, e, f]; },
     resetTransform: function(){ M = [1, 0, 0, 1, 0, 0]; },
     setLineDash: function(a){ dash = !!(a && a.length); },
     beginPath: function(){ inner.beginPath(); },
     closePath: function(){ inner.closePath(); },
     moveTo: function(x, y){ var p = P(x, y); inner.moveTo(p[0], p[1]); },
     lineTo: function(x, y){ var p = P(x, y); inner.lineTo(p[0], p[1]); },
     rect: function(x, y, w, h){ poly([x, y, x + w, y, x + w, y + h, x, y + h]); },
     arc: function(x, y, r, a0, a1){ var s = scaleOf('arc'), p = P(x, y); inner.arc(p[0], p[1], r * s, a0, a1); },
     ellipse: function(x, y, rx, ry, rot, a0, a1){
       if (Math.abs(a1 - a0) < TAU - 1e-9) throw new Error('core/mask: only full ellipses are portable');
       var c = Math.cos(rot || 0), s = Math.sin(rot || 0), pts = [];
       for (var k = 0; k < 64; k++) { var t = k / 64 * TAU, ex = Math.cos(t) * rx, ey = Math.sin(t) * ry;
         pts.push(x + ex * c - ey * s, y + ex * s + ey * c); }
       poly(pts); },
     fill: function(){ inner.fillStyle = this.fillStyle; inner.fill(); },
     stroke: function(){ if (dash) throw new Error('core/mask: a dashed stroke is not portable');
       inner.strokeStyle = this.strokeStyle; inner.lineWidth = this.lineWidth * scaleOf('a stroke'); inner.stroke(); },
     fillRect: function(x, y, w, h){ inner.fillStyle = this.fillStyle;
       if (Math.abs(M[1]) <= EPS && Math.abs(M[2]) <= EPS) { var a = P(x, y), b = P(x + w, y + h);
         inner.fillRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])); return; }
       inner.beginPath(); poly([x, y, x + w, y, x + w, y + h, x, y + h]); inner.fill(); inner.beginPath(); },
     clearRect: function(){ throw new Error('core/mask: clearRect is not portable on a mask; fill the background colour'); },
     getImageData: function(x, y, w, h){ return inner.getImageData(x, y, w, h); },
     createImageData: function(w, h){ return inner.createImageData(w, h); },
     putImageData: function(img, x, y){ inner.putImageData(img, x, y); }
   };
   var out = { width: cv.width, height: cv.height, _kmask: true, data: cv.data, ops: cv.ops, inner: cv };
   out.getContext = function(){ return ctx; };
   return out;
 };

 if (typeof module !== 'undefined' && module.exports) module.exports = K;
})();
