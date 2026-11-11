/* ============================== core/city host: A BUILDING GOING UP (2026-11-04) ============================== */
/* [web] (KCITY.constructMesh) over a [G data] heart (KCITY.constructOrder, plain arrays, no three.js). The owner (2026-11-04):
   "is there a way to stepwise construct a kit model procedurally without having to mess with the kit code itself? some kind
   of algorithm that could be applied over it by a construction function of core/city?" Any kit's piece, built once and
   flattened into a geometry per material (an index of triangles over positions, as the hosts' instancers make them:
   settlements/isle-demo 58 isleFlatten), is revealed a triangle at a time in a BUILD ORDER read off its own shape, so a
   piece goes up as a building does, whatever kit drew it and without a line of the kit changed:
     1. the footing first: everything wholly in the bottom `foot` of the piece's height (a plinth, a step, a pile's foot);
     2. then upward in BANDS of `band` metres by each triangle's lowest point, and within a band the FRAME before the
        INFILL: a slender triangle (its longest edge over the square root of its area at least `slender`: a post, a beam, a
        rafter, a rail) before a broad one (a wall panel, a floor board);
     3. the ROOF last: a triangle facing up or down (|normal y| at least `roofN`) whose lowest point is above `roofAt` of the
        height, after every wall, itself bottom-up (eaves before the ridge); not a small flat one (under `cap` m2: the top
        of a post or a beam goes up with its member).
   Ties keep the piece's own order (a stable sort), so the same piece goes up the same way every time.
     KCITY.constructOrder({pos, index?, y0?, H?, opt?}) -> {tris: Uint32Array (triangle numbers in build order),
                     keys: Float64Array (each one's key, ascending), y0, H}   pos: a flat xyz array; index: a triangle list
                     (none: every three vertices a triangle). The key's integer part is the phase (0 footing, 1 walls and
                     frame, 2 roof), its fraction the place in the phase
     KCITY.constructKeys(parts, opt?) -> the parts' keys, once a piece (cached on the parts array)
     KCITY.constructMesh(parts, opt?) -> {group, set(f), f, tris}   parts: [{geo, mat}] (a piece's flattened parts); each part
                     a mesh of its own geometry sharing the piece's attributes and a sorted copy of its index (built once a
                     piece and shared by every copy), so a town of houses going up shares its buffers; set(f) shows the
                     first f (0..1) of the piece's triangles in build order, across all its parts at once
   The defaults suit a house of piles, walls and a thatched roof; a host may pass its own `opt`. */
(function () {
  'use strict';
  var K = (typeof KCITY !== 'undefined') ? KCITY : (typeof window !== 'undefined' ? (window.KCITY = window.KCITY || {}) : {});
  var DEF = { foot: 0.12, band: 0.5, slender: 4, roofN: 0.3, roofAt: 0.5, cap: 0.25 };
  K.CONSTRUCT = DEF;
  K.constructOrder = function (o) {
    var P = o.pos, I = o.index, nt = I ? Math.floor(I.length / 3) : Math.floor(P.length / 9), O = Object.assign({}, DEF, o.opt || {});
    var vi = function (t, k) { return I ? I[t * 3 + k] : t * 3 + k; };
    var y0 = o.y0, y1 = -Infinity; if (y0 == null) { y0 = Infinity; for (var a = 1; a < P.length; a += 3) { if (P[a] < y0) y0 = P[a]; if (P[a] > y1) y1 = P[a]; } }
    var H = o.H; if (H == null) { if (!(y1 > -Infinity)) { y1 = -Infinity; for (var b = 1; b < P.length; b += 3) if (P[b] > y1) y1 = P[b]; } H = Math.max(1e-6, y1 - y0); }
    var keys = new Float64Array(nt), bands = Math.max(1, Math.ceil(H / O.band));
    for (var t = 0; t < nt; t++) {
      var i0 = vi(t, 0) * 3, i1 = vi(t, 1) * 3, i2 = vi(t, 2) * 3;
      var ax = P[i0], ay = P[i0 + 1], az = P[i0 + 2], bx = P[i1], by = P[i1 + 1], bz = P[i1 + 2], cx = P[i2], cy = P[i2 + 1], cz = P[i2 + 2];
      var ymin = Math.min(ay, by, cy) - y0, ymax = Math.max(ay, by, cy) - y0, ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, n2 = Math.hypot(nx, ny, nz), area = n2 / 2;
      var e = Math.max(Math.hypot(ux, uy, uz), Math.hypot(vx, vy, vz), Math.hypot(cx - bx, cy - by, cz - bz));
      var slim = area > 0 ? e / Math.sqrt(area) >= O.slender : true, h = Math.max(0, Math.min(1, ymin / H)), k;
      if (ymax / H < O.foot) k = 0 + h / O.foot * 0.9;   /* the footing (a triangle wholly in the bottom band), bottom-up */
      else if (n2 > 0 && Math.abs(ny / n2) >= O.roofN && h >= O.roofAt && !(Math.abs(ny / n2) > 0.95 && area < O.cap)) k = 2 + (h - O.roofAt) / Math.max(1e-6, 1 - O.roofAt) * 0.9;   /* the roof, eaves to ridge */
      else { var bnd = Math.min(bands - 1, Math.floor(h * H / O.band)); k = 1 + (bnd + (slim ? 0.25 : 0.75)) / bands * 0.9; }   /* a band: its frame, then its infill */
      keys[t] = k;
    }
    var tris = new Uint32Array(nt); for (var q = 0; q < nt; q++) tris[q] = q;
    var arr = Array.prototype.slice.call(tris); arr.sort(function (p, r) { return keys[p] - keys[r] || p - r; });   /* stable: ties in the piece's own order */
    var sk = new Float64Array(nt); for (var s = 0; s < nt; s++) { tris[s] = arr[s]; sk[s] = keys[arr[s]]; }
    return { tris: tris, keys: sk, y0: y0, H: H };
  };
  /* every part's order on the whole piece's height (the piece's lowest point and height over all its parts) */
  K.constructKeys = function (parts, opt) {
    if (parts._construct) return parts._construct;
    var y0 = Infinity, y1 = -Infinity;
    parts.forEach(function (pt) { var A = pt.geo.attributes.position.array; for (var i = 1; i < A.length; i += 3) { if (A[i] < y0) y0 = A[i]; if (A[i] > y1) y1 = A[i]; } });
    var out = parts.map(function (pt) { var g = pt.geo, I = g.index ? g.index.array : null, O = K.constructOrder({ pos: g.attributes.position.array, index: I, y0: y0, H: Math.max(1e-6, y1 - y0), opt: opt });
      var idx = I ? new I.constructor(O.tris.length * 3) : new Uint32Array(O.tris.length * 3);
      for (var t = 0; t < O.tris.length; t++) { var tr = O.tris[t]; for (var k = 0; k < 3; k++) idx[t * 3 + k] = I ? I[tr * 3 + k] : tr * 3 + k; }
      return { index: idx, keys: O.keys }; });
    var all = []; out.forEach(function (o) { for (var i = 0; i < o.keys.length; i++) all.push(o.keys[i]); }); all.sort(function (a, b) { return a - b; });
    parts._construct = { parts: out, all: all };
    return parts._construct;
  };
  var upper = function (A, x) { var lo = 0, hi = A.length; while (lo < hi) { var m = (lo + hi) >> 1; if (A[m] <= x) lo = m + 1; else hi = m; } return lo; };
  K.constructMesh = function (parts, opt) {
    var C = K.constructKeys(parts, opt), G = new THREE.Group(), meshes = [];
    parts.forEach(function (pt, i) {
      var g = new THREE.BufferGeometry(), src = pt.geo; for (var nm in src.attributes) g.setAttribute(nm, src.attributes[nm]);
      if (!C.parts[i].ix) C.parts[i].ix = new THREE.BufferAttribute(C.parts[i].index, 1);
      g.setIndex(C.parts[i].ix); g.boundingSphere = src.boundingSphere || (src.computeBoundingSphere(), src.boundingSphere); g.setDrawRange(0, 0);
      var m = new THREE.Mesh(g, pt.mat); m.frustumCulled = true; G.add(m); meshes.push({ m: m, keys: C.parts[i].keys });
    });
    var R = { group: G, f: 0, tris: C.all.length };
    R.set = function (f) { f = Math.max(0, Math.min(1, f)); R.f = f; var n = Math.floor(f * C.all.length), thr = n > 0 ? C.all[n - 1] : -Infinity;
      meshes.forEach(function (M) { var c = f >= 1 ? M.keys.length : n > 0 ? upper(M.keys, thr) : 0; M.m.geometry.setDrawRange(0, c * 3); M.m.visible = c > 0; }); return R; };
    R.set(0);
    return R;
  };
})();
