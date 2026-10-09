/* ============================== 1. CORE: RNG, NOISE, GEOMETRY ============================== */
/* [G data] Pure functions and plain arrays only: no THREE, no DOM. Every layout pass below reads these.
   Coordinates are metres: x east, z SOUTH (north is -z), y up. A point is [x, z]. */

/* one seeded stream per pass: SL.stream(n) restarts from the pass's own seed, so a change in one pass
   cannot shift the draws of the next (the same rule as Voth's reseed(N)) */
var SL = { seed: 7 };
SL.stream = function (n) {
  var st = ((SL.seed * 2654435761) ^ (n * 40503)) >>> 0;
  var R = {};
  R.rnd = function () { st = (st + 0x6D2B79F5) >>> 0; var t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  R.rr = function (a, b) { return a + (b - a) * R.rnd(); };
  R.ri = function (a, b) { return Math.floor(R.rr(a, b + 1)); };
  R.pick = function (arr) { return arr[Math.floor(R.rnd() * arr.length) % arr.length]; };
  R.chance = function (p) { return R.rnd() < p; };
  return R;
};

/* value noise, fbm: hashed lattice, smooth-stepped */
function slHash(i, j) { var h = Math.imul(i, 374761393) + Math.imul(j, 668265263) + SL.seed * 982451653; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function slNoise(x, z) {
  var i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j;
  var u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  var a = slHash(i, j), b = slHash(i + 1, j), c = slHash(i, j + 1), d = slHash(i + 1, j + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
function slFbm(x, z, oct) { var s = 0, a = 0.5, f = 1, n = 0; for (var k = 0; k < (oct || 4); k++) { s += a * slNoise(x * f + k * 17.3, z * f - k * 9.1); n += a; a *= 0.5; f *= 2.03; } return s / n; }

var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* ---------------------------------------------------------------- vectors and polylines */
var V = {
  add: function (a, b) { return [a[0] + b[0], a[1] + b[1]]; },
  sub: function (a, b) { return [a[0] - b[0], a[1] - b[1]]; },
  mul: function (a, k) { return [a[0] * k, a[1] * k]; },
  len: function (a) { return Math.hypot(a[0], a[1]); },
  dist: function (a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); },
  norm: function (a) { var l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; },
  dot: function (a, b) { return a[0] * b[0] + a[1] * b[1]; },
  perp: function (a) { return [-a[1], a[0]]; },          /* left of the direction of travel, seen from above with z south */
  lerp: function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; },
  rot: function (a, t) { var c = Math.cos(t), s = Math.sin(t); return [a[0] * c - a[1] * s, a[0] * s + a[1] * c]; }
};
/* heading that turns an asset's local +z (its front) to face direction d: makeFrame's toWorld convention */
function ryFacing(d) { return Math.atan2(d[0], d[1]); }

function segDist(p, a, b) {
  var dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz;
  var t = l2 ? clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l2, 0, 1) : 0;
  return Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dz * t);
}
function polyArea(P) { var s = 0; for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
function polyCentroid(P) {
  var cx = 0, cz = 0, A = 0;
  for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length], c = a[0] * b[1] - b[0] * a[1]; A += c; cx += (a[0] + b[0]) * c; cz += (a[1] + b[1]) * c; }
  return A ? [cx / (3 * A), cz / (3 * A)] : P[0];
}
function inPoly(p, P) {
  var c = false;
  for (var i = 0, j = P.length - 1; i < P.length; j = i++) {
    var a = P[i], b = P[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
function polyEdgeDist(p, P) { var d = Infinity; for (var i = 0; i < P.length; i++) d = Math.min(d, segDist(p, P[i], P[(i + 1) % P.length])); return d; }
function scalePolyTo(P, area) { var c = polyCentroid(P), k = Math.sqrt(area / Math.abs(polyArea(P))); return P.map(function (p) { return [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k]; }); }
function hull(pts) {
  var P = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
  var cr = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); };
  var lo = [], up = [];
  P.forEach(function (p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
  P.slice().reverse().forEach(function (p) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); });
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
/* a convex polygon pushed out by r with rounded corners: the centreline of a ring road round a footprint */
function offsetConvex(P, r, arcSteps) {
  var H = hull(P), out = [], n = H.length, ccw = polyArea(H) > 0 ? 1 : -1;
  for (var i = 0; i < n; i++) {
    var a = H[(i + n - 1) % n], b = H[i], c = H[(i + 1) % n];
    var n1 = V.norm(V.perp(V.sub(b, a))), n2 = V.norm(V.perp(V.sub(c, b)));
    n1 = V.mul(n1, -ccw); n2 = V.mul(n2, -ccw);           /* outward */
    var t1 = Math.atan2(n1[1], n1[0]), t2 = Math.atan2(n2[1], n2[0]);
    var dt = t2 - t1; while (dt > Math.PI) dt -= 2 * Math.PI; while (dt < -Math.PI) dt += 2 * Math.PI;
    var k = Math.max(1, Math.ceil(Math.abs(dt) / (Math.PI / (arcSteps || 8))));
    for (var j = 0; j <= k; j++) { var t = t1 + dt * j / k; out.push([b[0] + Math.cos(t) * r, b[1] + Math.sin(t) * r]); }
  }
  return out;
}
function plLen(L) { var s = 0; for (var i = 1; i < L.length; i++) s += V.dist(L[i - 1], L[i]); return s; }
/* resample a polyline every `step` metres (ends kept exactly) */
function resample(L, step, closed) {
  var P = closed ? L.concat([L[0]]) : L, out = [P[0]], carry = 0;
  for (var i = 1; i < P.length; i++) {
    var a = P[i - 1], b = P[i], d = V.dist(a, b), t = step - carry;
    while (t <= d) { out.push(V.lerp(a, b, t / d)); t += step; }
    carry = d - (t - step);
  }
  if (!closed && V.dist(out[out.length - 1], P[P.length - 1]) > step * 0.3) out.push(P[P.length - 1]);
  else if (!closed) out[out.length - 1] = P[P.length - 1];
  if (closed && out.length > 1 && V.dist(out[out.length - 1], out[0]) < step * 0.3) out.pop();
  return out;
}
function chaikin(L, it) {
  for (var k = 0; k < it; k++) {
    var o = [L[0]];
    for (var i = 0; i < L.length - 1; i++) { o.push(V.lerp(L[i], L[i + 1], 0.25)); o.push(V.lerp(L[i], L[i + 1], 0.75)); }
    o.push(L[L.length - 1]); L = o;
  }
  return L;
}
function rdp(L, eps) {
  if (L.length < 3) return L.slice();
  var dmax = 0, idx = 0;
  for (var i = 1; i < L.length - 1; i++) { var d = segDist(L[i], L[0], L[L.length - 1]); if (d > dmax) { dmax = d; idx = i; } }
  if (dmax <= eps) return [L[0], L[L.length - 1]];
  var A = rdp(L.slice(0, idx + 1), eps), B = rdp(L.slice(idx), eps);
  return A.slice(0, -1).concat(B);
}
/* arc-length frame of a polyline: cumulative lengths, point and tangent at s */
function plFrame(L) {
  var cum = [0]; for (var i = 1; i < L.length; i++) cum.push(cum[i - 1] + V.dist(L[i - 1], L[i]));
  var F = { pts: L, cum: cum, len: cum[cum.length - 1] };
  F.seg = function (s) { s = clamp(s, 0, F.len); var lo = 0, hi = cum.length - 1; while (hi - lo > 1) { var m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; } return lo; };
  F.at = function (s) { var i = F.seg(s), d = cum[i + 1] - cum[i]; return V.lerp(L[i], L[i + 1], d ? (clamp(s, 0, F.len) - cum[i]) / d : 0); };
  F.tan = function (s, span) { span = span || 2; return V.norm(V.sub(F.at(s + span), F.at(s - span))); };
  F.nearest = function (p) { var best = Infinity, bs = 0; for (var i = 0; i < L.length - 1; i++) { var a = L[i], b = L[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz; var t = l2 ? clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l2, 0, 1) : 0; var d = Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dz * t); if (d < best) { best = d; bs = cum[i] + Math.sqrt(l2) * t; } } return { d: best, s: bs }; };
  return F;
}

/* an oriented rectangle: centre c, unit axis u (frontage, along the street), v = perp(u) (depth), half sizes */
function obb(c, u, hw, hd) { return { c: c, u: u, v: V.perp(u), hw: hw, hd: hd }; }
function obbCorners(o) {
  var a = V.mul(o.u, o.hw), b = V.mul(o.v, o.hd);
  return [V.add(V.add(o.c, a), b), V.add(V.sub(o.c, a), b), V.sub(V.sub(o.c, a), b), V.sub(V.add(o.c, a), b)];
}

/* ============================== THE OCCUPANCY RASTER ==============================
   One 2 m grid over the walled city: what every cell holds (a code) and who owns it (a lot or a way id).
   Lots, streets, parks and footprints are stamped into it; placement checks and the A* street router read it. */
var OCC = { FREE: 0, STREET: 1, LOT: 2, HARD: 3, OUT: 4, RESERVE: 5, ALLEY: 6, GREEN: 7 };
function Raster(half, cell) {
  var R = this; R.half = half; R.c = cell; R.n = Math.ceil(2 * half / cell);
  var N = R.n * R.n;
  R.occ = new Uint8Array(N); R.own = new Int32Array(N).fill(-1);
  R.sd = new Float32Array(N).fill(1e9);        /* distance to the nearest street centreline (for the spacing rule) */
  R.sdw = new Int32Array(N).fill(-1);          /* ...and which way that is */
}
Raster.prototype.ix = function (x) { return Math.floor((x + this.half) / this.c); };
Raster.prototype.cx = function (i) { return -this.half + (i + 0.5) * this.c; };
Raster.prototype.idx = function (x, z) { var i = this.ix(x), j = this.ix(z); return (i < 0 || j < 0 || i >= this.n || j >= this.n) ? -1 : j * this.n + i; };
Raster.prototype.at = function (x, z) { var k = this.idx(x, z); return k < 0 ? OCC.OUT : this.occ[k]; };
/* visit every cell whose centre lies inside polygon P */
Raster.prototype.eachInPoly = function (P, fn) {
  var R = this, z0 = Infinity, z1 = -Infinity;
  P.forEach(function (p) { z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); });
  var j0 = Math.max(0, R.ix(z0)), j1 = Math.min(R.n - 1, R.ix(z1));
  for (var j = j0; j <= j1; j++) {
    var z = R.cx(j), xs = [];
    for (var a = 0, b = P.length - 1; a < P.length; b = a++) {
      var p = P[a], q = P[b];
      if ((p[1] > z) !== (q[1] > z)) xs.push(p[0] + (z - p[1]) * (q[0] - p[0]) / (q[1] - p[1]));
    }
    xs.sort(function (m, n) { return m - n; });
    for (var k = 0; k + 1 < xs.length; k += 2) {
      var i0 = Math.max(0, Math.ceil((xs[k] + R.half) / R.c - 0.5)), i1 = Math.min(R.n - 1, Math.floor((xs[k + 1] + R.half) / R.c - 0.5));
      for (var i = i0; i <= i1; i++) fn(j * R.n + i, i, j);
    }
  }
};
/* visit every cell within r of segment ab; fn(k, distance) */
Raster.prototype.eachNearSeg = function (a, b, r, fn) {
  var R = this, x0 = Math.min(a[0], b[0]) - r, x1 = Math.max(a[0], b[0]) + r, z0 = Math.min(a[1], b[1]) - r, z1 = Math.max(a[1], b[1]) + r;
  var i0 = Math.max(0, R.ix(x0)), i1 = Math.min(R.n - 1, R.ix(x1)), j0 = Math.max(0, R.ix(z0)), j1 = Math.min(R.n - 1, R.ix(z1));
  for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
    var d = segDist([R.cx(i), R.cx(j)], a, b);
    if (d <= r) fn(j * R.n + i, d);
  }
};
/* what an oriented rectangle would sit on, shrunk by `inset` so neighbours that only touch pass.
   Returns null when the ground is clear, else {code, own} of the first blocking cell. */
Raster.prototype.blockedRect = function (o, inset, allow) {
  var R = this, q = obb(o.c, o.u, Math.max(0.2, o.hw - inset), Math.max(0.2, o.hd - inset)), hit = null;
  R.eachInPoly(obbCorners(q), function (k) { if (hit) return; var c = R.occ[k]; if (c !== OCC.FREE && !(allow && allow[c])) hit = { code: c, own: R.own[k] }; });
  return hit;
};
Raster.prototype.stampPoly = function (P, code, own) { var R = this; R.eachInPoly(P, function (k) { R.occ[k] = code; R.own[k] = own; }); };
Raster.prototype.clearOwner = function (P, own, code) { var R = this; R.eachInPoly(P, function (k) { if (R.own[k] === own && R.occ[k] === code) { R.occ[k] = OCC.FREE; R.own[k] = -1; } }); };

/* ============================== A* ON THE RASTER ==============================
   8-connected, binary heap, generation stamps so a search never clears the whole grid.
   cost(k, i, j) returns the price of entering cell k per metre (Infinity: impassable).
   win = [i0, j0, i1, j1] limits the search to a window; hfn(i, j) an optional heuristic in cells. Returns cell indices start..goal, or null. */
var ASTAR = (function () {
  var gen = 0, stamp, g, from, closed, heap, hk;
  function ensure(N) { if (!stamp || stamp.length < N) { stamp = new Uint32Array(N); g = new Float32Array(N); from = new Int32Array(N); closed = new Uint32Array(N); heap = new Int32Array(N); hk = new Float32Array(N); } }
  return function (R, start, goals, cost, win, hw, hfn) {
    var n = R.n; ensure(n * n); gen++;
    var isGoal = goals instanceof Set ? goals : new Set(goals);
    var gx = 0, gz = 0; isGoal.forEach(function (k) { gx += k % n; gz += (k / n) | 0; }); gx /= isGoal.size; gz /= isGoal.size;
    var hwt = hw || 1.15, size = 0;
    function push(k, f) { var i = size++; while (i > 0) { var p = (i - 1) >> 1; if (hk[p] <= f) break; heap[i] = heap[p]; hk[i] = hk[p]; i = p; } heap[i] = k; hk[i] = f; }
    function pop() { var top = heap[0], k = heap[--size], f = hk[size], i = 0; while (true) { var l = 2 * i + 1; if (l >= size) break; var r = l + 1, m = (r < size && hk[r] < hk[l]) ? r : l; if (hk[m] >= f) break; heap[i] = heap[m]; hk[i] = hk[m]; i = m; } heap[i] = k; hk[i] = f; return top; }
    var i0 = win ? win[0] : 0, j0 = win ? win[1] : 0, i1 = win ? win[2] : n - 1, j1 = win ? win[3] : n - 1;
    stamp[start] = gen; g[start] = 0; from[start] = -1; push(start, 0);
    var DI = [1, -1, 0, 0, 1, 1, -1, -1], DJ = [0, 0, 1, -1, 1, -1, 1, -1], DL = [1, 1, 1, 1, Math.SQRT2, Math.SQRT2, Math.SQRT2, Math.SQRT2];
    var c = R.c, found = -1, iters = 0;
    while (size) {
      var k = pop();
      if (closed[k] === gen) continue;
      closed[k] = gen;
      if (isGoal.has(k)) { found = k; break; }
      if (++iters > 900000) break;
      var ki = k % n, kj = (k / n) | 0;
      for (var d = 0; d < 8; d++) {
        var ni = ki + DI[d], nj = kj + DJ[d];
        if (ni < i0 || nj < j0 || ni > i1 || nj > j1) continue;
        var nk = nj * n + ni;
        if (closed[nk] === gen) continue;
        var cc = cost(nk, ni, nj);
        if (!(cc < Infinity)) continue;
        var ng = g[k] + cc * DL[d] * c;
        if (stamp[nk] !== gen || ng < g[nk]) {
          stamp[nk] = gen; g[nk] = ng; from[nk] = k;
          push(nk, ng + hwt * c * (hfn ? hfn(ni, nj) : Math.hypot(ni - gx, nj - gz)));
        }
      }
    }
    if (found < 0) return null;
    var path = []; for (var q = found; q >= 0; q = from[q]) path.push(q);
    path.reverse();
    path.cost = g[found];
    return path;
  };
})();
