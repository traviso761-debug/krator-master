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
/* a town's ground: o {half (m), cell (m)}. Returns {frame, half, cell, n, H (Float32Array, n x n, row z), h(x, z), sea(x, z)
   (true where the ground is under the sea), slope(x, z), toWorld(x, z)} */
ISLE.townGround = function (frame, o) {
  var half = o.half, cell = o.cell, n = Math.round(2 * half / cell) + 1, H = new Float32Array(n * n), F = frame;
  for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) H[j * n + i] = WORLD.H(F.x - half + i * cell, F.z - half + j * cell) - F.sea;
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
