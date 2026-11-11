// ================================================================= CORE — drawn: the ground as drawn (KDRAWN)
// CORE-IMPROVEMENTS.md item 28 (the 2026-11-11 survey, five sessions): the most visible bugs came from audits that read the
// ground as DEFINED (terrainH) while the eye sees it as DRAWN: a camera above terrainH but under the mesh (Copper Glacier), a
// river ribbon z-fighting where 16 m cells bridge an 11 m channel (nwlowlands), trees on a basalt step terrainH calls gentle
// (scablands NW). KDRAWN.h(x, z) is the height of the drawn triangles there: the strip cells a ground was drawn from when
// the build registers them (KDRAWN.grid), else the mesh's own triangles (KDRAWN.mesh), bucketed so a query reads a handful.
//
// Plain data and pure functions ([G data]): no three.js, no DOM. A mesh is given as arrays (positions, index, a 16-number
// column-major matrix), so the same records run in node, in the page and, transliterated, in Godot.
//
//   KDRAWN.grid({x0, z0, dx, dz, nx, nz, h})  a heightfield drawn as a PlaneGeometry: (nx+1) x (nz+1) vertex heights h,
//                                             row by row along +z; each cell split as three.js splits it (a-b-d, b-c-d)
//   KDRAWN.mesh(pos, index, m, o)             triangles in world space: pos [x,y,z,...] local, index or null, m a
//                                             matrixWorld.elements (or null); o.cell the bucket size (default from the area)
//   KDRAWN.fromObject(obj)                    the same from a three.js mesh, duck-typed (geometry arrays, matrixWorld)
//   src.h(x, z)                               the drawn height of one source there, or null off it (the top surface where
//                                             triangles overlap)
//   KDRAWN.add(src) / KDRAWN.clear()          the page's ground sources; KDRAWN.h(x, z) is the highest of them, or null
//   KDRAWN.compare(defined, pts, src)         {n, max, worst: {x, z, drawn, defined}}: how far the definition (a function of
//                                             x, z) is from what was drawn at those points: what an audit should measure
// Godot: the PlaneGeometry split is a-b-d / b-c-d (u + v <= 1 is the first triangle), the same as a Godot PlaneMesh's
// SurfaceTool order only if the exporter keeps three's index order (core/export does).
var KDRAWN = (function () {
  var K = { sources: [] };

  K.grid = function (g) {
    var nx = g.nx, nz = g.nz, row = nx + 1, H = g.h;
    return {
      kind: 'grid', box: [g.x0, g.z0, g.x0 + nx * g.dx, g.z0 + nz * g.dz],
      h: function (x, z) {
        var fx = (x - g.x0) / g.dx, fz = (z - g.z0) / g.dz;
        if (!(fx >= 0 && fz >= 0 && fx <= nx && fz <= nz)) return null;
        var ix = Math.min(nx - 1, Math.floor(fx)), iz = Math.min(nz - 1, Math.floor(fz)), u = fx - ix, v = fz - iz;
        var a = H[iz * row + ix], d = H[iz * row + ix + 1], b = H[(iz + 1) * row + ix], c = H[(iz + 1) * row + ix + 1];
        if (u + v <= 1) return a + (d - a) * u + (b - a) * v;
        return c + (b - c) * (1 - u) + (d - c) * (1 - v);
      }
    };
  };

  K.mesh = function (pos, index, m, o) {
    o = o || {};
    var nv = pos.length / 3, W = new Float64Array(nv * 3), i;
    for (i = 0; i < nv; i++) {
      var x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
      if (m) {
        W[i * 3] = m[0] * x + m[4] * y + m[8] * z + m[12];
        W[i * 3 + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
        W[i * 3 + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
      } else { W[i * 3] = x; W[i * 3 + 1] = y; W[i * 3 + 2] = z; }
    }
    var nt = index ? (index.length / 3) | 0 : (nv / 3) | 0, T = new Uint32Array(nt * 3);
    for (i = 0; i < nt * 3; i++) T[i] = index ? index[i] : i;
    var x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
    for (i = 0; i < nv; i++) {
      var px = W[i * 3], pz = W[i * 3 + 2];
      if (px < x0) x0 = px; if (px > x1) x1 = px; if (pz < z0) z0 = pz; if (pz > z1) z1 = pz;
    }
    var cell = o.cell == null ? Math.max(1e-6, Math.sqrt(Math.max(1e-9, (x1 - x0) * (z1 - z0)) / Math.max(1, nt)) * 2) : o.cell;
    var cx = Math.max(1, Math.ceil((x1 - x0) / cell) || 1), cz = Math.max(1, Math.ceil((z1 - z0) / cell) || 1), B = {};
    for (var t = 0; t < nt; t++) {
      var a = T[t * 3], b = T[t * 3 + 1], c = T[t * 3 + 2];
      var tx0 = Math.min(W[a * 3], W[b * 3], W[c * 3]), tx1 = Math.max(W[a * 3], W[b * 3], W[c * 3]);
      var tz0 = Math.min(W[a * 3 + 2], W[b * 3 + 2], W[c * 3 + 2]), tz1 = Math.max(W[a * 3 + 2], W[b * 3 + 2], W[c * 3 + 2]);
      var i0 = Math.max(0, Math.floor((tx0 - x0) / cell)), i1 = Math.min(cx - 1, Math.floor((tx1 - x0) / cell));
      var j0 = Math.max(0, Math.floor((tz0 - z0) / cell)), j1 = Math.min(cz - 1, Math.floor((tz1 - z0) / cell));
      for (var bj = j0; bj <= j1; bj++) for (var bi = i0; bi <= i1; bi++) (B[bj * cx + bi] || (B[bj * cx + bi] = [])).push(t);
    }
    return {
      kind: 'mesh', box: [x0, z0, x1, z1], tris: nt,
      h: function (x, z) {
        if (!(x >= x0 && x <= x1 && z >= z0 && z <= z1)) return null;
        var bi = Math.min(cx - 1, Math.floor((x - x0) / cell)), bj = Math.min(cz - 1, Math.floor((z - z0) / cell));
        var L = B[bj * cx + bi], best = null;
        if (!L) return null;
        for (var k = 0; k < L.length; k++) {
          var t = L[k], a = T[t * 3] * 3, b = T[t * 3 + 1] * 3, c = T[t * 3 + 2] * 3;
          var ax = W[a], az = W[a + 2], bx = W[b], bz = W[b + 2], qx = W[c], qz = W[c + 2];
          var det = (bz - qz) * (ax - qx) + (qx - bx) * (az - qz);
          if (Math.abs(det) < 1e-12) continue;   /* a vertical face has no height of its own */
          var l1 = ((bz - qz) * (x - qx) + (qx - bx) * (z - qz)) / det, l2 = ((qz - az) * (x - qx) + (ax - qx) * (z - qz)) / det, l3 = 1 - l1 - l2;
          if (l1 < -1e-9 || l2 < -1e-9 || l3 < -1e-9) continue;
          var y = l1 * W[a + 1] + l2 * W[b + 1] + l3 * W[c + 1];
          if (best === null || y > best) best = y;
        }
        return best;
      }
    };
  };

  K.fromObject = function (obj, o) {
    var g = obj && obj.geometry, P = g && g.attributes && g.attributes.position;
    if (!P) return null;
    if (obj.updateMatrixWorld) obj.updateMatrixWorld(true);
    return K.mesh(P.array, g.index ? g.index.array : null, obj.matrixWorld ? obj.matrixWorld.elements : null, o);
  };

  K.add = function (src) { if (src) K.sources.push(src); return src; };
  K.clear = function () { K.sources.length = 0; };
  K.h = function (x, z) {
    var best = null;
    for (var i = 0; i < K.sources.length; i++) { var y = K.sources[i].h(x, z); if (y !== null && (best === null || y > best)) best = y; }
    return best;
  };

  K.compare = function (defined, pts, src) {
    var at = src ? src.h : K.h, n = 0, max = 0, worst = null;
    for (var i = 0; i < pts.length; i++) {
      var x = pts[i][0], z = pts[i][1], d = at(x, z);
      if (d === null) continue;
      var f = defined(x, z), e = Math.abs(d - f);
      n++;
      if (e > max) { max = e; worst = { x: x, z: z, drawn: d, defined: f }; }
    }
    return { n: n, max: max, worst: worst };
  };

  return K;
})();
if (typeof module !== 'undefined' && module.exports) module.exports = KDRAWN;
