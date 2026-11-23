// node settlements/xanadu-lake/tests/test-xl-site.js [key ...] — the lake towns' ground (targets/town/89zp-xl-site.js) against
// their region's (89zm-xl-fit.js: tools/fit_lake_town.py), without the page. Every fitted town unless keys are named. The
// checks (settlements/xanadu-lake/PLAN.md section 6, the shore, the terraces and the world), each with its negative pair:
//   - dry above the level: no ground under the lake's level (-520 m) that is not the lake (a hollow), and the town's core
//     dry from the waterline in;
//   - the shore within 50 m of the region's (the fit's raw crossings of the level inside the footprint);
//   - each bench level within 0.5 m;
//   - no step at the band: the page's ground at the footprint's edge and the band's outer edge within 1.5 % of the band of
//     the region's (the world eases a difference at R across the band: 9 m over 600 m adds a grade of 1.5 %, no step);
//   - the world's frame: the pin stands on the page's centre, the lake toward the town's bearing.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
global.XAN_TUNE = require(path.join(ROOT, 'core', 'region', 'data', 'xan-tune.js'));
['settlements/xanadu-lake/targets/town/89zl-xl-specs.js', 'settlements/xanadu-lake/targets/town/89zm-xl-fit.js',
 'settlements/xanadu-lake/targets/town/89zp-xl-site.js'].forEach(load);

const KEYS = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(XL.FIT).sort();
T.ok('at least one town is fitted', KEYS.length > 0 && KEYS.every(k => XL.FIT[k] && XL.SPECS[k]), KEYS.join(', '));

// ---------------------------------------------------------------- the checks, each a function of the ground h(x, z)
// a hollow: a cell under the level on a 10 m grid inside the footprint that is not joined (4-connected, over the footprint and
// the band) to the lake at the frame's edge
function hollows(h, F, S) {
  const half = S.world.R + S.world.band, st = 10, n = Math.round(2 * half / st) + 1, cx = F.centre[0], cz = F.centre[1];
  const wet = new Uint8Array(n * n), seen = new Uint8Array(n * n), q = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (h(cx - half + i * st, cz - half + j * st) < 0) wet[j * n + i] = 1;
  for (let k = 0; k < n; k++) for (const c of [k, (n - 1) * n + k, k * n, k * n + n - 1]) if (wet[c] && !seen[c]) { seen[c] = 1; q.push(c); }
  while (q.length) { const c = q.pop(), i = c % n, j = (c - i) / n;
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + a, jj = j + b; if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue; const e = jj * n + ii; if (wet[e] && !seen[e]) { seen[e] = 1; q.push(e); } } }
  let bad = 0, first = null;
  for (let c = 0; c < n * n; c++) { if (!wet[c] || seen[c]) continue; const x = cx - half + (c % n) * st, z = cz - half + Math.floor(c / n) * st;
    if (Math.hypot(x - cx, z - cz) > S.world.R) continue;   /* in the band the world eases back to its own ground (and its own hollows) */
    bad++; if (!first) first = [Math.round(x), Math.round(z)]; }
  return { bad, first };
}
// the core's land: every point of the core 3 m or more inland of the waterline over the level
function coreWet(h, key, G) {
  let bad = 0, first = null;
  for (let x = -G.core.x; x <= G.core.x; x += 20) for (let d = 3; d < G.core.d; d += 15) { const z = xlShoreZ(key, x) - d; if (h(x, z) <= 0) { bad++; first = first || [x, Math.round(z)]; } }
  return { bad, first };
}
// the shore: at each of the region's crossings (x, z), the page's crossing of the level marching lakeward from 300 m inland
function shoreErr(h, F) {
  let worst = 0, at = null, miss = 0;
  for (const [x, zr] of F.check.shore) {
    let z = zr - 300, a = h(x, z), zc = null;
    for (let k = 1; k <= 1200; k++) { const z2 = zr - 300 + k * .5, b = h(x, z2); if (a >= 0 && b < 0) { zc = z2 - .5 + .5 * a / (a - b); break; } a = b; }
    if (zc == null) { miss++; continue; }
    const e = Math.abs(zc - zr); if (e > worst) { worst = e; at = [x, zr, +zc.toFixed(1)]; }
  }
  return { worst, at, miss };
}
// a bench's spread: max - min over its inside (20 m in from its ends, 4 m from its edges)
function benchSpread(h, key, B) {
  let lo = Infinity, hi = -Infinity;
  for (let x = B.x0 + 20; x <= B.x1 - 20; x += 10) for (let d = B.d0 + 4; d <= B.d1 - 4; d += 6) { const v = h(x, xlShoreZ(key, x) - d); lo = Math.min(lo, v); hi = Math.max(hi, v); }
  return hi - lo;
}
// the band: the page against the region round the footprint's edge and the band's outer edge
function bandErr(h, F) {
  let worst = 0, at = null;
  for (const [x, z, y] of F.check.ring) { const e = Math.abs(h(x, z) - y); if (e > worst) { worst = e; at = [x, z, y, +h(x, z).toFixed(1)]; } }
  return { worst, at };
}

for (const key of KEYS) {
  const F = XL.FIT[key], S = XL.SPECS[key], G = xlGeo(key), h = (x, z) => xlH(key, x, z), N = XL.tune(key) ? XL.tune(key).name : key;
  // 1. dry above the level
  const H = hollows(h, F, S), Cw = coreWet(h, key, G);
  T.ok(N + ': dry above the level: no hollow under -520 m apart from the lake, the core dry from the waterline in', H.bad === 0 && Cw.bad === 0,
    H.bad + ' hollow cells' + (H.first ? ' (first ' + H.first + ')' : '') + ', ' + Cw.bad + ' wet in the core' + (Cw.first ? ' (first ' + Cw.first + ')' : ''));
  T.neg(N + ': ...its negative: a pit dug inland is caught', g => hollows(g, F, S).bad === 0,
    (x, z) => h(x, z) - (Math.hypot(x - 100, z - (xlShoreZ(key, 100) - 200)) < 40 ? 60 : 0), h);
  // 2. the shore
  const E = shoreErr(h, F);
  T.ok(N + ': the shore within 50 m of the region\'s (' + F.check.shore.length + ' crossings inside the footprint)', E.worst <= 50 && E.miss === 0 && F.check.shore.length > 20,
    'worst ' + E.worst.toFixed(1) + ' m at ' + JSON.stringify(E.at) + ', ' + E.miss + ' not found');
  T.neg(N + ': ...its negative: the waterline pushed 80 m inland is caught', g => shoreErr(g, F).worst <= 50, (x, z) => h(x, z + 80), h);
  // 3. the benches
  const sp = G.benches.map(B => benchSpread(h, key, B));
  T.ok(N + ': ' + G.benches.length + ' benches (the spec\'s ' + S.wall.benches + '), each level within 0.5 m', G.benches.length === S.wall.benches && sp.every(s => s <= .5),
    sp.map(s => s.toFixed(3)).join(', ') + ' m; levels ' + G.benches.map(B => B.y).join(', ') + ' m');
  T.neg(N + ': ...its negative: a bench left on the slope is caught', g => benchSpread(g, key, G.benches[0]) <= .5,
    (x, z) => { const d = xlShoreZ(key, x) - z, B = G.benches[0]; return d > B.d0 && d < B.d1 && x > B.x0 && x < B.x1 ? xlProf(F, d) : h(x, z); }, h);
  // 4. the band
  const BE = bandErr(h, F), tol = .015 * S.world.band;
  T.ok(N + ': no step at the band: the ground at the footprint\'s edge (R ' + S.world.R + ' m) and the band\'s (+' + S.world.band + ' m) within ' + tol.toFixed(1) + ' m of the region\'s', BE.worst <= tol && F.check.ring.length > 100,
    'worst ' + BE.worst.toFixed(2) + ' m at ' + JSON.stringify(BE.at) + ' over ' + F.check.ring.length + ' points');
  T.neg(N + ': ...its negative: the profile alone (no region rest) is caught', g => bandErr(g, F).worst <= tol, (x, z) => xlProf(F, xlShoreZ(key, x) - z), h);
  // 5. the frame
  const W = xlWorldFrame(key), w0 = xlToWorld(key, W.centre[0], W.centre[1]), b = F.bearing * Math.PI / 180;
  const lake = xlToWorld(key, 0, 500), dir = Math.atan2(lake[0] - xlToWorld(key, 0, 0)[0], -(lake[1] - xlToWorld(key, 0, 0)[1])) * 180 / Math.PI;
  const dB = Math.abs(((F.bearing - S.bearing) % 360 + 540) % 360 - 180), dD = Math.abs(((dir - F.bearing) % 360 + 540) % 360 - 180);
  T.ok(N + ': the world\'s frame: the pin on the page\'s centre, the page\'s +z on the fitted bearing (' + F.bearing + '), within 45 degrees of the plan\'s (' + S.bearing + ')',
    Math.hypot(w0[0], w0[1]) < .01 && dD < .1 && dB <= 45, 'pin at ' + w0.slice(0, 2).map(v => v.toFixed(3)) + ', +z toward ' + dir.toFixed(2) + ', ' + dB.toFixed(1) + ' off the plan');
}
T.done();
