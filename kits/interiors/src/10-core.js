/* ======================== Interiors core: namespace, rng, geometry ========================
   ENGINE-NEUTRAL. Fragments 10-49 use no THREE, no DOM and no host global: they run in a
   page, in a worker or in node (build.py also writes them alone as dist/interiors-core.js).
   Everything hangs off one namespace, KratorInteriors; the only other globals are the two
   names kits/interiors/SPEC.md asks for, ROOM() and furnishRoom() (bound in 49-exports.js).

   Coordinates are the polygon tool's: world x and z in metres, y up. A piece's frame is the
   catalog's (kits/catalog/README.md "Frame"): origin = footprint centre on the floor, +z the
   front, and rotation ry maps local (lx, lz) to world (x + lx cos ry + lz sin ry,
   z - lx sin ry + lz cos ry), so the front faces (sin ry, cos ry).
   ====================================================================== */
var KratorInteriors = (typeof KratorInteriors !== 'undefined' && KratorInteriors) || {};
(function (IX) {
  'use strict';
  IX.version = 1;

  /* ---------- seeded randomness (same LCG as the catalog's frame and Yuni's intRng) */
  IX.hash = function (s) {                      /* FNV-1a over a string -> uint32 */
    s = String(s);
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  };
  IX.rng = function (seed) {
    let st = ((seed >>> 0) * 2654435761 + 97) >>> 0;
    const r = function () { st = (Math.imul(st, 1664525) + 1013904223) >>> 0; return st / 4294967296; };
    r.int = function (n) { return Math.floor(r() * n) % n; };
    r.pick = function (a) { return a[r.int(a.length)]; };
    r.shuffle = function (a) { for (let i = a.length - 1; i > 0; i--) { const j = r.int(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    return r;
  };
  IX.round = function (v, n) { const k = Math.pow(10, n == null ? 3 : n); return Math.round(v * k) / k; };

  /* ---------- polygons: [[x,z], ...], either winding */
  const G = IX.geom = {};
  G.area = function (poly) {                    /* signed: > 0 when counter-clockwise in (x, z) */
    let a = 0;
    for (let i = 0, n = poly.length; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a += p[0] * q[1] - q[0] * p[1]; }
    return a / 2;
  };
  G.centroid = function (poly) {
    let cx = 0, cz = 0, a = 0;
    for (let i = 0, n = poly.length; i < n; i++) {
      const p = poly[i], q = poly[(i + 1) % n], c = p[0] * q[1] - q[0] * p[1];
      a += c; cx += (p[0] + q[0]) * c; cz += (p[1] + q[1]) * c;
    }
    if (Math.abs(a) < 1e-9) return [poly[0][0], poly[0][1]];
    return [cx / (3 * a), cz / (3 * a)];
  };
  G.bbox = function (pts) {
    let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
    for (const p of pts) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < z0) z0 = p[1]; if (p[1] > z1) z1 = p[1]; }
    return [x0, z0, x1, z1];
  };
  G.inside = function (poly, x, z) {            /* even-odd ray cast */
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  };
  G.segDist = function (x, z, a, b) {           /* distance from (x,z) to segment a-b */
    const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz;
    let t = L2 ? ((x - a[0]) * dx + (z - a[1]) * dz) / L2 : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t);
  };
  G.edgeDist = function (poly, x, z) {
    let d = Infinity;
    for (let i = 0, n = poly.length; i < n; i++) d = Math.min(d, G.segDist(x, z, poly[i], poly[(i + 1) % n]));
    return d;
  };
  function cross(ax, az, bx, bz) { return ax * bz - az * bx; }
  G.segsCross = function (p, q, r, s) {         /* proper crossing of p-q and r-s (touching does not count) */
    const d1 = cross(q[0] - p[0], q[1] - p[1], r[0] - p[0], r[1] - p[1]);
    const d2 = cross(q[0] - p[0], q[1] - p[1], s[0] - p[0], s[1] - p[1]);
    const d3 = cross(s[0] - r[0], s[1] - r[1], p[0] - r[0], p[1] - r[1]);
    const d4 = cross(s[0] - r[0], s[1] - r[1], q[0] - r[0], q[1] - r[1]);
    const e = 1e-9;
    return ((d1 > e && d2 < -e) || (d1 < -e && d2 > e)) && ((d3 > e && d4 < -e) || (d3 < -e && d4 > e));
  };

  /* polygon offset with mitred corners: d > 0 moves every edge OUTWARD by d */
  G.offset = function (poly, d) {
    const n = poly.length, s = G.area(poly) > 0 ? 1 : -1, out = [];
    for (let i = 0; i < n; i++) {
      const p0 = poly[(i + n - 1) % n], p1 = poly[i], p2 = poly[(i + 1) % n];
      const e1 = norm(p1[0] - p0[0], p1[1] - p0[1]), e2 = norm(p2[0] - p1[0], p2[1] - p1[1]);
      const o1 = [e1[1] * s, -e1[0] * s], o2 = [e2[1] * s, -e2[0] * s];    /* outward normals */
      const bx = o1[0] + o2[0], bz = o1[1] + o2[1], bl = Math.hypot(bx, bz) || 1;
      const k = d / Math.max(0.2, (bx * o1[0] + bz * o1[1]) / bl);
      out.push([p1[0] + bx / bl * k, p1[1] + bz / bl * k]);
    }
    return out;
  };
  function norm(x, z) { const l = Math.hypot(x, z) || 1; return [x / l, z / l]; }
  /* is vertex i convex (interior angle < 180)? */
  G.convexAt = function (poly, i) {
    const n = poly.length, s = G.area(poly) > 0 ? 1 : -1, a = poly[(i + n - 1) % n], b = poly[i], c = poly[(i + 1) % n];
    return s * cross(b[0] - a[0], b[1] - a[1], c[0] - b[0], c[1] - b[1]) > 0;
  };

  /* ---------- oriented rectangles: { x, z, ry, hw, hd } (centre, heading, half extents along local x / z) */
  G.rect = function (x, z, ry, w, d) { return { x: x, z: z, ry: ry, hw: w / 2, hd: d / 2 }; };
  G.axes = function (r) { const c = Math.cos(r.ry), s = Math.sin(r.ry); return [[c, -s], [s, c]]; };  /* local x, local z in world */
  G.corners = function (r) {
    const A = G.axes(r), out = [];
    for (const sg of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      out.push([r.x + A[0][0] * r.hw * sg[0] + A[1][0] * r.hd * sg[1], r.z + A[0][1] * r.hw * sg[0] + A[1][1] * r.hd * sg[1]]);
    }
    return out;
  };
  G.grow = function (r, m) { return { x: r.x, z: r.z, ry: r.ry, hw: Math.max(0, r.hw + m), hd: Math.max(0, r.hd + m) }; };
  /* a rectangle given in a piece's LOCAL frame (lx0..lx1, lz0..lz1), returned in world terms */
  G.localRect = function (px, pz, ry, lx0, lx1, lz0, lz1) {
    const cx = (lx0 + lx1) / 2, cz = (lz0 + lz1) / 2, c = Math.cos(ry), s = Math.sin(ry);
    return { x: px + cx * c + cz * s, z: pz - cx * s + cz * c, ry: ry, hw: (lx1 - lx0) / 2, hd: (lz1 - lz0) / 2 };
  };
  G.containsPt = function (r, x, z, m) {        /* point inside the rectangle grown by m */
    const A = G.axes(r), dx = x - r.x, dz = z - r.z;
    return Math.abs(dx * A[0][0] + dz * A[0][1]) <= r.hw + (m || 0) && Math.abs(dx * A[1][0] + dz * A[1][1]) <= r.hd + (m || 0);
  };
  /* separating-axis overlap depth: > tol means the two rectangles truly overlap */
  G.overlap = function (a, b, tol) {
    const axes = G.axes(a).concat(G.axes(b));
    let minPen = Infinity;
    for (const ax of axes) {
      const pa = proj(a, ax), pb = proj(b, ax);
      const pen = Math.min(pa[1], pb[1]) - Math.max(pa[0], pb[0]);
      if (pen <= (tol || 0)) return false;
      if (pen < minPen) minPen = pen;
    }
    return minPen;
  };
  function proj(r, ax) {
    const A = G.axes(r), c = r.x * ax[0] + r.z * ax[1];
    const e = r.hw * Math.abs(A[0][0] * ax[0] + A[0][1] * ax[1]) + r.hd * Math.abs(A[1][0] * ax[0] + A[1][1] * ax[1]);
    return [c - e, c + e];
  }
  /* a rectangle lies inside a polygon: its corners are inside (by margin m from every edge)
     and no polygon edge crosses it (an L-shaped room's reflex corner cannot poke into it) */
  G.rectInPoly = function (poly, r, m) {
    const cs = G.corners(r);
    for (const c of cs) {
      if (!G.inside(poly, c[0], c[1])) return false;
      if (m && G.edgeDist(poly, c[0], c[1]) < m - 1e-9) return false;
    }
    for (let i = 0, n = poly.length; i < n; i++) {
      const p = poly[i], q = poly[(i + 1) % n];
      if (G.containsPt(r, p[0], p[1], -1e-6)) return false;    /* a reflex vertex strictly inside */
      for (let k = 0; k < 4; k++) if (G.segsCross(p, q, cs[k], cs[(k + 1) % 4])) return false;
    }
    return true;
  };
})(KratorInteriors);
