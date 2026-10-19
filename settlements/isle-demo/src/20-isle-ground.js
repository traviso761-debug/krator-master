/* ============================== 1. THE CITY PAGE'S GROUND: THE REGION'S RASTERS, A TOWN'S HEIGHT GRID ============================== */
/* [G data] The city page (dist/isle-city.html, P6) stands on the open world's ground, as the planner does, but reads no
   canvas: build.py decodes the region's PNGs (openworld/isle-demo/data) itself and writes their samples into the page as
   integers (WORLD_RAW), and ISLE.rasters turns them into the arrays WORLD.init takes, with the same arithmetic the
   planner's start (98-isle-start.js) and the open world's apply to the canvas's bytes. So node, the browser and a Godot
   port read the same numbers.

   A town's ground (ISLE.townGround) is WORLD.H in the town's frame, sampled once on a grid (cell m over the square
   +-half) and read back bilinearly: the city plan (core/city's zone, its slopes, every lot's footing) and the drawing (the
   ground mesh, the sea's edge) both read this one grid, never WORLD.H again. Heights are over the town's sea (0). */
var ISLE = ISLE || {};
ISLE.TOWNS = ['Kautoa', 'Valapo'];
/* WORLD_RAW: {meta, hw, hh (the height grid), mw, mh (the map grid), elev, wlev (r << 8 | g), wflag, whas (b > 127),
   clim, rain, temp, biome, mask (the first channel), scarpl, scarpu (r << 8 | g), scarpw (the first channel)} */
ISLE.rasters = function (W) {
  var M = W.meta, lo = M.heights.lo, hi = M.heights.hi, nh = W.hw * W.hh, nm = W.mw * W.mh, i;
  var R = { elev: new Float32Array(nh), wlev: new Float32Array(nh), whas: new Uint8Array(nh), wflag: new Uint8Array(nh) };
  for (i = 0; i < nh; i++) {
    R.elev[i] = lo + W.elev[i] / 65535 * (hi - lo); R.wflag[i] = W.wflag[i]; R.whas[i] = W.whas[i];
    R.wlev[i] = R.whas[i] ? lo + W.wlev[i] / 65535 * (hi - lo) : lo;
  }
  ['clim', 'rain', 'temp', 'biome', 'mask'].forEach(function (k) { R[k] = Uint8Array.from(W[k]); });
  var d16 = function (a) { var o = new Float32Array(nh); for (var j = 0; j < nh; j++) o[j] = lo + a[j] / 65535 * (hi - lo); return o; };
  R.scarpL = d16(W.scarpl); R.scarpU = d16(W.scarpu); R.scarpW = new Float32Array(W.scarpw);
  if (R.clim.length !== nm) throw new Error('WORLD_RAW: the map grid is not ' + W.mw + ' x ' + W.mh);
  return R;
};
ISLE.initWorld = function () { if (!ISLE.worldReady) { WORLD.init(ISLE.rasters(WORLD_RAW)); ISLE.worldReady = true; } };
/* the site file's town: its frame {town, x, z, sea} and its drawing */
ISLE.townSite = function (file, name) { return file && file.towns && file.towns[name] ? file.towns[name] : null; };
/* the owner's ground edits from the site planner (the site's `terrain`: brush strokes {m: raise | lower | smooth, r, s, pts}),
   replayed in order onto a height-delta grid exactly as the planner keeps them (settlements/voth/targets/voth-site/
   10-site-model.js TERR: a 6 m grid over +-3,900 m, a cosine falloff to the brush's radius; raise and lower move by s at the
   centre, smooth pulls toward the mean round each cell). base(x, z) is the town's ground before the edits. Returns
   delta(x, z), bilinear, 0 outside the square, or null when there are none */
ISLE.terrainDelta = function (strokes, base) {
  if (!strokes || !strokes.length) return null;
  var c = 6, E = 3900, N = Math.ceil(2 * E / c) + 1, D = new Float32Array(N * N), B = new Float32Array(N * N).fill(NaN);
  var baseAt = function (i, j) { var k = j * N + i, v = B[k]; if (v !== v) v = B[k] = base(-E + i * c, -E + j * c); return v; };
  var dab = function (m, x, z, r, s) {
    var i0 = Math.max(1, Math.floor((x - r + E) / c)), i1 = Math.min(N - 2, Math.ceil((x + r + E) / c));
    var j0 = Math.max(1, Math.floor((z - r + E) / c)), j1 = Math.min(N - 2, Math.ceil((z + r + E) / c)), i, j;
    if (i0 > i1 || j0 > j1) return;
    var w = function (a, b) { var d = Math.hypot(-E + a * c - x, -E + b * c - z) / r; return d >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * d); };
    if (m === 'smooth') {
      var H = function (a, b) { return baseAt(a, b) + D[b * N + a]; }, upd = [];
      var k2 = Math.max(1, Math.round(r / c / 3)), a0 = i0 - k2, b0 = j0 - k2, W2 = i1 - i0 + 2 * k2 + 1, H2 = j1 - j0 + 2 * k2 + 1;
      var S = new Float64Array((W2 + 1) * (H2 + 1));
      for (var jj = 0; jj < H2; jj++) {
        var row = 0, gj = Math.min(N - 1, Math.max(0, b0 + jj));
        for (var ii = 0; ii < W2; ii++) { row += H(Math.min(N - 1, Math.max(0, a0 + ii)), gj); S[(jj + 1) * (W2 + 1) + ii + 1] = S[jj * (W2 + 1) + ii + 1] + row; }
      }
      var cnt = (2 * k2 + 1) * (2 * k2 + 1);
      for (j = j0; j <= j1; j++) for (i = i0; i <= i1; i++) {
        var wt = w(i, j); if (!wt) continue;
        var x0 = i - k2 - a0, y0 = j - k2 - b0, x1 = x0 + 2 * k2 + 1, y1 = y0 + 2 * k2 + 1;
        var sum = S[y1 * (W2 + 1) + x1] - S[y0 * (W2 + 1) + x1] - S[y1 * (W2 + 1) + x0] + S[y0 * (W2 + 1) + x0];
        upd.push(j * N + i, (sum / cnt - H(i, j)) * Math.min(1, s) * wt);
      }
      for (var q = 0; q < upd.length; q += 2) D[upd[q]] += upd[q + 1];
    } else {
      var sg = m === 'lower' ? -1 : 1;
      for (j = j0; j <= j1; j++) for (i = i0; i <= i1; i++) { var wt3 = w(i, j); if (wt3) D[j * N + i] += sg * s * wt3; }
    }
  };
  strokes.forEach(function (st) { if (st && st.pts && /^(raise|lower|smooth)$/.test(st.m)) st.pts.forEach(function (p) { dab(st.m, p[0], p[1], st.r, st.s); }); });
  return function (x, z) {
    var fx = (x + E) / c, fz = (z + E) / c, i = Math.floor(fx), j = Math.floor(fz);
    if (i < 0 || j < 0 || i >= N - 1 || j >= N - 1) return 0;
    var u = fx - i, v = fz - j, k = j * N + i;
    return (D[k] * (1 - u) + D[k + 1] * u) * (1 - v) + (D[k + N] * (1 - u) + D[k + N + 1] * u) * v;
  };
};
/* a town's ground: o {half (m), cell (m), terrain (the site's ground edits)}. Returns {frame, half, cell, n, H (Float32Array, n x n, row z), h(x, z), sea(x, z)
   (true where the ground is under the sea), slope(x, z), toWorld(x, z)} */
ISLE.townGround = function (frame, o) {
  var half = o.half, cell = o.cell, n = Math.round(2 * half / cell) + 1, H = new Float32Array(n * n), F = frame;
  var base = function (x, z) { return WORLD.H(F.x + x, F.z + z) - F.sea; }, dl = ISLE.terrainDelta(o.terrain, base);
  for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) { var x = -half + i * cell, z = -half + j * cell; H[j * n + i] = base(x, z) + (dl ? dl(x, z) : 0); }
  var h = function (x, z) {
    var u = (x + half) / cell, v = (z + half) / cell;
    if (u < 0) u = 0; else if (u > n - 1.000001) u = n - 1.000001;
    if (v < 0) v = 0; else if (v > n - 1.000001) v = n - 1.000001;
    var i0 = Math.floor(u), j0 = Math.floor(v), fu = u - i0, fv = v - j0, k = j0 * n + i0;
    return (H[k] * (1 - fu) + H[k + 1] * fu) * (1 - fv) + (H[k + n] * (1 - fu) + H[k + n + 1] * fu) * fv;
  };
  /* the grid as core/city's ground-delta interface (core/city/25-city-site.js KCITY.ground.levelPad, bank): an edit (a
     landmark's terrace) changes H itself, so the plan and the drawing read the edited ground alike */
  var grid = { N: n, cell: cell, ext: half, h: h, at: function (i, j, k) { return H[k]; }, add: function (k, dv) { H[k] += dv; } };
  return {
    frame: F, half: half, cell: cell, n: n, H: H, h: h, grid: grid,
    sea: function (x, z) { return h(x, z) <= 0; },
    slope: function (x, z) { var e = cell; return Math.hypot(h(x + e, z) - h(x - e, z), h(x, z + e) - h(x, z - e)) / (2 * e); },
    toWorld: function (x, z) { return [F.x + x, F.z + z]; }
  };
};
/* a town's site to its ground: the frame, the programme's square and grid, the owner's ground edits */
ISLE.siteGround = function (S, P) { return ISLE.townGround(S.frame, { half: P.half, cell: P.gridCell, terrain: S.terrain }); };
