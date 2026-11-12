// ================================================================= CORE — ruins: nothing floats, every wreck lies on the ground  [G data]
// The owner, 2026-11-10 (the Ancient Engines' quality pass): "focus on disconnected geometry and make sure detached pieces lie on the ground
// properly", then "make this check part of the default creation process for ruined structures". A ruined structure (a ruined building, an
// engine, a fallen viaduct, a wrecked machine) is a body still standing plus the pieces that came off it. Two faults recur in every kit:
// a piece that touches nothing (a stub left in the air when what held it was cut away, a light off its rim, a bracket off its wall), and a
// wreck that hovers over the ground or is buried in it (a plate stood at a fixed height whatever its tilt). This module finds both from boxes.
//
// No THREE, no DOM: plain numbers (node-tested: test-ruins.js), so Godot can port it. 21-core-ruins-host.js reads a three.js tree into pieces.
//
//   KRUINS.analyse(P, o) -> {pieces, clusters, mainLow, floaters, wrecks, badWrecks, standing}
//     P   [{b: [x0, y0, z0, x1, y1, z1], g, src}]  each piece's box (world metres, y up) and g, the ground's height under it (the lowest of
//         the ground at its corners and centre: a piece across a slope reads the low side)
//     o   {touch: 0.5 (two boxes this close touch), held: 0.6 (a piece this near the ground is held by it), lift: 0.3 and sink: 1 (a wreck's
//         lowest point between 0.3 m above and 1 m below the ground under it), wreckH: 25 (a cluster under this tall is wreckage; a taller
//         one is a standing body sunk by design: a half-buried ring, a pier in its footing)}
//     Pieces that touch make CLUSTERS; the MAIN body is the largest cluster that reaches the ground. FLOATERS: pieces of a cluster that is neither the
//     main body nor held by the ground. WRECKS: the other clusters under wreckH, each held only by the ground; a BAD wreck's lowest point
//     is more than `lift` above or `sink` below the ground under it. STANDING: the other clusters, which must reach the ground (a tall
//     cluster held by nothing is a floater). mainLow: how far the main body's lowest point is over the ground (it must stand on it).
//   KRUINS.verdict(m) -> {ok, detail}   ok: no floater, no bad wreck, the main body on the ground
var KRUINS = (function () {
  var K = {};
  K.analyse = function (P, o) {
    o = o || {};
    var e = o.touch == null ? 0.5 : o.touch, held0 = o.held == null ? 0.6 : o.held, lift = o.lift == null ? 0.3 : o.lift, sink = o.sink == null ? 1 : o.sink, wreckH = o.wreckH == null ? 25 : o.wreckH;
    var n = P.length, i, j;
    var touch = function (a, b) { return a[0] - e <= b[3] && b[0] - e <= a[3] && a[1] - e <= b[4] && b[1] - e <= a[4] && a[2] - e <= b[5] && b[2] - e <= a[5]; };
    /* the neighbours on a 20 m grid (a machine is thousands of pieces) */
    var C = 20, cell = {}, nb = [];
    for (i = 0; i < n; i++) {
      nb.push([]); var b = P[i].b;
      for (var cx = Math.floor((b[0] - e) / C); cx <= Math.floor((b[3] + e) / C); cx++) for (var cz = Math.floor((b[2] - e) / C); cz <= Math.floor((b[5] + e) / C); cz++) { var k = cx + ',' + cz; (cell[k] || (cell[k] = [])).push(i); }
    }
    var seen = {};
    for (var key in cell) {
      var L = cell[key];
      for (i = 0; i < L.length; i++) for (j = i + 1; j < L.length; j++) {
        var a = L[i], c = L[j], pk = a < c ? a + ':' + c : c + ':' + a; if (seen[pk]) continue; seen[pk] = 1;
        if (touch(P[a].b, P[c].b)) { nb[a].push(c); nb[c].push(a); }
      }
    }
    var cl = new Array(n), nc = 0; for (i = 0; i < n; i++) cl[i] = -1;
    for (i = 0; i < n; i++) {
      if (cl[i] >= 0) continue; var st = [i]; cl[i] = nc;
      while (st.length) { var q = st.pop(); for (var t = 0; t < nb[q].length; t++) { var r = nb[q][t]; if (cl[r] < 0) { cl[r] = nc; st.push(r); } } }
      nc++;
    }
    /* the main body: the largest cluster (by its pieces' volume) that reaches the ground; with none on the ground, the largest (a body hung
       in the air is not excused by being big) */
    var vol = function (b) { return Math.max(1e-6, (b[3] - b[0]) * (b[4] - b[1]) * (b[5] - b[2])); };
    var low = function (p) { return p.b[1] - p.g; };
    var cv = new Array(nc).fill(0), cg = new Array(nc).fill(false);
    for (i = 0; i < n; i++) { cv[cl[i]] += vol(P[i].b); if (low(P[i]) < held0) cg[cl[i]] = true; }
    var main = -1; for (i = 0; i < nc; i++) if (main < 0 || (cg[i] && !cg[main]) || (cg[i] === cg[main] && cv[i] > cv[main])) main = i;
    var C2 = []; for (i = 0; i < nc; i++) C2.push({ low: Infinity, top: -Infinity, bot: Infinity, n: 0, held: i === main, at: null, src: null });
    for (i = 0; i < n; i++) {
      var w = C2[cl[i]], lw = low(P[i]); w.n++;
      if (lw < w.low) { w.low = lw; w.at = [P[i].b[0], P[i].b[1], P[i].b[2]]; w.src = P[i].src; }
      if (P[i].b[4] > w.top) w.top = P[i].b[4]; if (P[i].b[1] < w.bot) w.bot = P[i].b[1];
      if (lw < held0) w.held = true;
    }
    var floaters = [], wrecks = [], bad = [], standing = 0;
    for (i = 0; i < n; i++) if (!C2[cl[i]].held) floaters.push({ src: P[i].src, at: [P[i].b[0], P[i].b[1], P[i].b[2]], low: low(P[i]) });
    for (i = 0; i < nc; i++) {
      if (i === main || !C2[i].held) continue; var w2 = C2[i];
      if (w2.top - w2.bot >= wreckH) { standing++; continue; }
      wrecks.push(w2); if (w2.low > lift || w2.low < -sink) bad.push({ src: w2.src, n: w2.n, low: w2.low, at: w2.at });
    }
    return { pieces: n, clusters: nc, mainLow: main >= 0 ? C2[main].low : Infinity, floaters: floaters, wrecks: wrecks.length, badWrecks: bad, standing: standing };
  };
  var r1 = function (x) { return Math.round(x * 10) / 10; };
  K.verdict = function (m) {
    if (!m) return { ok: false, detail: 'not measured' };
    var ok = m.pieces > 0 && !m.floaters.length && !m.badWrecks.length && m.mainLow < 0.6;
    return { ok: ok, detail: m.pieces + ' pieces in ' + m.clusters + ' clusters (' + m.standing + ' more standing bodies); ' + m.floaters.length + ' floating' +
      (m.floaters.length ? ' (' + m.floaters.slice(0, 3).map(function (f) { return f.src + ' at ' + f.at.map(r1).join(',') + ', ' + r1(f.low) + ' m up'; }).join('; ') + ')' : '') +
      '; ' + m.wrecks + ' wrecks on the ground, ' + m.badWrecks.length + ' lying wrong' +
      (m.badWrecks.length ? ' (' + m.badWrecks.slice(0, 3).map(function (w) { return w.src + ' x' + w.n + ', lowest ' + r1(w.low) + ' m'; }).join('; ') + ')' : '') +
      '; the body ' + (m.mainLow < 0.6 ? 'on' : r1(m.mainLow) + ' m off') + ' the ground' };
  };
  return K;
})();
if (typeof module !== 'undefined' && module.exports) module.exports = KRUINS;
