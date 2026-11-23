// ================================================================= KCLIFF — the Ancients' cliff city as records ([G data])
// The Ancients' cantilevered cliff city (the kit's target `targets/shelf`, built 2026-09 as `targets/ledge`: pale slab layers stepping out of a cliff as an
// INVERTED ZIGGURAT, each layer reaching further than the one below, the top flush with the cliff top) as plain records, for any
// build that hangs one off its own cliff: Ledge (settlements/ledge, a 1,265 m face over the great lake) and Shelf (settlements/shelf,
// an 850 m face on the Outer Wall). Lifted from Ledge's rules (2026-11-22) when Shelf took the same form; no THREE, no DOM, no
// randomness: node-tested by each build's test. Its drawing half is 20-cliff-stack-draw.js.
//
// THE FRAME: x along the face, z out of it (the rock at z < 0), y up (metres above sea level). A build lays it on its world.
// A STACK S: {n, y0, pitch, slab, storey, storeys, plenum, w0, w1, r0, r1, rExp, root, gallery, cover, prow: {wing, k0, add},
//   wings: [{id, f0, f1, r}]}: n layers, floors at y0 + pitch k; a layer's width along the face from w0 to w1 and its reach out of the
//   rock from r0 to r0 + r1 (as t^rExp), each wing a share [f0, f1] of the width and r of the reach; the prow wing gains `add` from k0
// A DECK: one wing of one layer {id 'd.<k>.<wing>', k, wing, zone, state, by, use, people}
//
//   KCLIFF.layerY(S, k) / widthAt(S, k) / reachOf(S, k, w) / wing(S, id)
//   KCLIFF.deckBox(S, d)             {x0, x1, z0, z1, y0, y1, floor, reach, width}: the plan's footprint and band, whatever its state
//   KCLIFF.deckFloor(S, d)           its floor at the Ancients' peak: width x reach x cover x storeys
//   KCLIFF.decks(S, ruin, zoneOf)    the decks, a wing a layer, each taking the last row of the ruin table that covers it:
//                                    ruin rows [wings ('w1 c'), k0, k1, state, by, use]
//   KCLIFF.share(items, n, weight)   n shared out over items by weight, largest remainders (ties by id): the sums are exact
//   KCLIFF.area(S, decks, zones)     {floor, broken, brokenShare, lived, livedShare, rows by zone, peak}
//   KCLIFF.STATES, BROKEN, LIVED
var KCLIFF = (function () {
  var K = {};
  K.STATES = ['reclaimed', 'kept', 'squatted', 'dead', 'sealed', 'damaged', 'sheared', 'pancaked', 'gone'];
  K.BROKEN = ['damaged', 'sheared', 'pancaked', 'gone'];
  K.LIVED = ['reclaimed', 'kept', 'squatted'];
  K.layerY = function (S, k) { return S.y0 + S.pitch * k; };
  K.wing = function (S, id) { return S.wings.filter(function (w) { return w.id === id; })[0]; };
  K.widthAt = function (S, k) { var t = k / (S.n - 1); return S.w0 + (S.w1 - S.w0) * t; };
  K.reachOf = function (S, k, w) {
    var t = k / (S.n - 1), r = (S.r0 + S.r1 * Math.pow(t, S.rExp)) * w.r;
    if (S.prow && w.id === S.prow.wing && k >= S.prow.k0) r += S.prow.add * (k - S.prow.k0 + 1) / (S.n - S.prow.k0);
    return r;
  };
  K.deckBox = function (S, d) {
    var w = K.wing(S, d.wing), W = K.widthAt(S, d.k), r = K.reachOf(S, d.k, w), y = K.layerY(S, d.k);
    return { x0: W * w.f0, x1: W * w.f1, z0: 0, z1: r, y0: y - S.slab, y1: y + S.pitch - S.slab, floor: y, reach: r, width: W * (w.f1 - w.f0) };
  };
  K.deckFloor = function (S, d) { var b = K.deckBox(S, d); return b.width * b.reach * S.cover * S.storeys; };
  K.decks = function (S, ruin, zoneOf) {
    var out = [];
    for (var k = 0; k < S.n; k++) S.wings.forEach(function (w) {
      var d = { id: 'd.' + k + '.' + w.id, k: k, wing: w.id, zone: zoneOf(k), state: null, by: 'none', use: '', people: 0 };
      ruin.forEach(function (r) { if (k >= r[1] && k <= r[2] && r[0].split(' ').indexOf(w.id) >= 0) { d.state = r[3]; d.by = r[4]; d.use = r[5]; } });
      out.push(d);
    });
    return out;
  };
  K.share = function (items, n, weight) {
    var tot = items.reduce(function (a, x) { return a + weight(x); }, 0), given = 0;
    var sh = items.map(function (x) { var q = tot > 0 ? n * weight(x) / tot : 0; return { x: x, q: q, f: Math.floor(q) }; });
    sh.forEach(function (s) { s.x.people = s.f; given += s.f; });
    sh.slice().sort(function (a, b) { return (b.q - b.f) - (a.q - a.f) || (a.x.id < b.x.id ? -1 : 1); }).slice(0, n - given).forEach(function (s) { s.x.people++; });
    return items;
  };
  K.area = function (S, decks, zones) {
    var rows = {}, floor = 0, brk = 0, lived = 0;
    zones.forEach(function (z) { if (z.k) rows[z.id] = { zone: z.id, name: z.name, decks: 0, floor: 0, broken: 0, lived: 0, people: 0 }; });
    decks.forEach(function (d) {
      var f = K.deckFloor(S, d), r = rows[d.zone]; r.decks++; r.floor += f; floor += f; r.people += d.people;
      if (K.BROKEN.indexOf(d.state) >= 0) { r.broken += f; brk += f; }
      if (K.LIVED.indexOf(d.state) >= 0) { r.lived += f; lived += f; }
    });
    /* Span's rule: homes on half the floor at 35 m2 a head (settlements/span/PLAN.md section 3) */
    return { floor: floor, broken: brk, brokenShare: brk / floor, lived: lived, livedShare: lived / floor, rows: rows, peak: Math.round(floor * .5 / 35) };
  };
  // ---- the layout's shapes and walk (a build's parts and links, as Ledge and Shelf write them)
  //   K.bbox(shape) [x0, x1, z0, z1]; shapes ['box', x0, x1, z0, z1] | ['circ', x, z, r] | ['oval', x, z, a, b]
  //   K.inShape(shape, x, z, pad); K.overlap(a, b): two footprints overlap (touching is not overlap)
  //   K.graph(L, {strike}) {adj}: L.links [a, b, {strike}] (a strike drops the links it shuts) and every part's `in` to its parent
  //   K.reach(L, from, opt): the ids a walker reaches
  var EPS = .01;
  K.bbox = function (s) { if (!s) return null; if (s[0] === 'box') return [s[1], s[2], s[3], s[4]]; if (s[0] === 'oval') return [s[1] - s[3], s[1] + s[3], s[2] - s[4], s[2] + s[4]]; return [s[1] - s[3], s[1] + s[3], s[2] - s[3], s[2] + s[3]]; };
  K.inShape = function (s, x, z, pad) {
    pad = pad || 0;
    if (s[0] === 'box') return x >= s[1] - pad && x <= s[2] + pad && z >= s[3] - pad && z <= s[4] + pad;
    var a = s[3] + pad, b = (s[0] === 'oval' ? s[4] : s[3]) + pad, dx = (x - s[1]) / a, dz = (z - s[2]) / b; return dx * dx + dz * dz <= 1;
  };
  K.overlap = function (a, b) {
    var A = K.bbox(a), Bb = K.bbox(b);
    if (A[0] >= Bb[1] - EPS || Bb[0] >= A[1] - EPS || A[2] >= Bb[3] - EPS || Bb[2] >= A[3] - EPS) return false;
    if (a[0] === 'box' && b[0] === 'box') return true;
    var pts = function (s) {
      var o = [], i;
      if (s[0] === 'box') { for (i = 0; i <= 8; i++) { var t = i / 8; o.push([s[1] + (s[2] - s[1]) * t, s[3]], [s[1] + (s[2] - s[1]) * t, s[4]], [s[1], s[3] + (s[4] - s[3]) * t], [s[2], s[3] + (s[4] - s[3]) * t]); } }
      else for (i = 0; i < 64; i++) { var q = i / 64 * 2 * Math.PI, ra = s[3], rb = s[0] === 'oval' ? s[4] : s[3]; o.push([s[1] + ra * Math.cos(q), s[2] + rb * Math.sin(q)]); }
      var c = K.bbox(s); o.push([(c[0] + c[1]) / 2, (c[2] + c[3]) / 2]); return o;
    };
    return pts(a).some(function (p) { return K.inShape(b, p[0], p[1], -EPS); }) || pts(b).some(function (p) { return K.inShape(a, p[0], p[1], -EPS); });
  };
  K.graph = function (L, o) {
    o = o || {}; var adj = {}, add = function (a, b) { (adj[a] || (adj[a] = [])).push(b); (adj[b] || (adj[b] = [])).push(a); };
    L.links.forEach(function (k) { if (o.strike && k[2] && k[2].strike) return; add(k[0], k[1]); });
    L.parts.forEach(function (p) { if (p.in) add(p.id, p.in); });
    return { adj: adj };
  };
  K.reach = function (L, from, o) {
    var G = K.graph(L, o), seen = {}, st = [].concat(from); st.forEach(function (s) { seen[s] = 1; });
    while (st.length) { var q = st.pop(); (G.adj[q] || []).forEach(function (r) { if (!seen[r]) { seen[r] = 1; st.push(r); } }); }
    return seen;
  };

  /* ---- THE ROAD (2026-11-22): its path and its graded cut, as data. A road is the layout's ways of kind 'road' ([x, z, y] points).
     K.roadPath(runs, H, o) -> {runs, legs, ramps}: each leg steeper than o.grade * o.slack is switched back (zigzag legs across the slope's
       fall line, measured at the leg's middle, each at that grade); a leg steeper than o.cliff is a ramp: the run breaks there (not drawn).
     K.roadProfile(run, H, o) -> [{x, z, s, y, h}] every o.step m along a run: the ground (h) averaged over o.smooth m, then held to o.grade
       by a forward and a backward pass (the backward pass alone guarantees it: each sample is clamped against the next, already final).
     K.roadCut(L, H) -> {path, profiles, apply(x, z, h), deepest}: the ground within w/2 of the road brought to its profile, eased back to
       the ground's own height over o.shoulder; where two legs' shoulders meet, the nearer weighs more (f^4), so the ground stays continuous.
     o is L.road: {w 6, shoulder 14 (at least: 1.5 x the cut's depth), grade .09, slack .85, cliff .6, step 4, smooth 60}. No L.road, no cut.
     K.roadCutOf(L, H) caches the cut per layout object (the rules' groundAt calls it for every point). */
  var sm = function (e0, e1, x) { var t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  K.roadDefaults = function (o) {
    o = o || {}; var d = { w: 6, shoulder: 14, grade: .09, slack: .85, cliff: .6, step: 4, smooth: 60 }, r = {};
    for (var k in d) r[k] = o[k] == null ? d[k] : o[k];
    return r;
  };
  K.roadPath = function (runs, H, o) {
    o = K.roadDefaults(o); var out = [], cur = [], legs = 0, ramps = 0, g = o.grade * o.slack;
    var push = function (p) { var l = cur[cur.length - 1]; if (!l || Math.hypot(l[0] - p[0], l[1] - p[1]) > .01) cur.push(p); };
    var cut = function () { if (cur.length > 1) out.push(cur); cur = []; };
    runs.forEach(function (pts0) {
      /* a long leg is cut into pieces of at most o.piece (400) m first: the slope's plane is read per piece, so a leg that runs over a flat
         and up an escarpment puts its switchbacks on the escarpment */
      var pts = [pts0[0]], pc = o.piece || 400;
      for (var i0 = 1; i0 < pts0.length; i0++) { var A = pts0[i0 - 1], Bp = pts0[i0], nn = Math.max(1, Math.ceil(Math.hypot(Bp[0] - A[0], Bp[1] - A[1]) / pc));
        for (var i1 = 1; i1 <= nn; i1++) pts.push([A[0] + (Bp[0] - A[0]) * i1 / nn, A[1] + (Bp[1] - A[1]) * i1 / nn]); }
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], D = Math.hypot(dx, dz), dy = Math.abs(H(b[0], b[1]) - H(a[0], a[1]));
        if (D < 1) continue;
        if (dy / D > o.cliff) { ramps++; cut(); continue; }
        if (dy / D <= g) { push(a); push(b); legs++; continue; }
        /* the slope over the leg's own scale (a plane through a, b and the two points D/2 either side of its middle: the ground's 90 m bumps
           would turn a gradient read at one spot anywhere), slope m, f its uphill unit, c the contour. The leg spans Cc along c and Ff along f.
           On that plane the two directions at the grade are d1, d2 = +-cos(t) c + sign(Ff) sin(t) f, sin(t) = g / m; the leg is a1 of d1 and
           b1 of d2 (a1 + b1 = |Ff| / sin t, a1 - b1 = Cc / cos t: both >= 0 whenever the leg is steeper than g), split into k of each,
           alternating: the switchbacks. Exact on the plane; the ground's bumps off it are the cut's to take (K.roadProfile) */
        var ux = dx / D, uz = dz / D, vx = -uz, vz = ux, mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
        var gu = (H(b[0], b[1]) - H(a[0], a[1])) / D, gv = (H(mx + vx * D / 2, mz + vz * D / 2) - H(mx - vx * D / 2, mz - vz * D / 2)) / D, gm = Math.hypot(gu, gv);
        var fx = (gu * ux + gv * vx) / gm, fz = (gu * uz + gv * vz) / gm, cx = -fz, cz = fx, Cc = dx * cx + dz * cz, Ff = dx * fx + dz * fz;
        var st = Math.min(1, g / gm), ct = Math.sqrt(1 - st * st), sF = Ff < 0 ? -1 : 1, sum = Math.abs(Ff) / st, dif = ct > 1e-6 ? Cc / ct : 0;
        var a1 = Math.max(0, (sum + dif) / 2), b1 = Math.max(0, (sum - dif) / 2), k = Math.max(1, Math.ceil(Math.max(a1, b1) / 300));
        var d1 = [ct * cx + sF * st * fx, ct * cz + sF * st * fz], d2 = [-ct * cx + sF * st * fx, -ct * cz + sF * st * fz], p = [a[0], a[1]];
        push(a);
        for (var j = 0; j < k; j++) {
          p = [p[0] + d1[0] * a1 / k, p[1] + d1[1] * a1 / k]; push(p);
          p = [p[0] + d2[0] * b1 / k, p[1] + d2[1] * b1 / k]; if (j < k - 1) push(p);
        }
        push(b); legs += 2 * k;
      }
      cut();
    });
    return { runs: out, legs: legs, ramps: ramps };
  };
  K.roadProfile = function (run, H, o) {
    o = K.roadDefaults(o); var P = [], s = 0;
    for (var m = 0; m < run.length - 1; m++) {
      var p0 = run[m], p1 = run[m + 1], len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), ns = Math.max(1, Math.ceil(len / o.step));
      for (var t = 0; t < ns; t++) { var f = t / ns, x = p0[0] + (p1[0] - p0[0]) * f, z = p0[1] + (p1[1] - p0[1]) * f; if (P.length) s += Math.hypot(x - P[P.length - 1].x, z - P[P.length - 1].z); P.push({ x: x, z: z, s: s, h: H(x, z) }); }
    }
    var e = run[run.length - 1]; s += Math.hypot(e[0] - P[P.length - 1].x, e[1] - P[P.length - 1].z); P.push({ x: e[0], z: e[1], s: s, h: H(e[0], e[1]) });
    var half = o.smooth / 2, lo = 0, hi = 0, sum = 0;
    for (var i = 0; i < P.length; i++) {
      while (hi < P.length && P[hi].s <= P[i].s + half) { sum += P[hi].h; hi++; }
      while (P[lo].s < P[i].s - half) { sum -= P[lo].h; lo++; }
      P[i].y = sum / (hi - lo);
    }
    for (i = 1; i < P.length; i++) { var d = o.grade * (P[i].s - P[i - 1].s); P[i].y = Math.max(P[i - 1].y - d, Math.min(P[i - 1].y + d, P[i].y)); }
    for (i = P.length - 2; i >= 0; i--) { d = o.grade * (P[i + 1].s - P[i].s); P[i].y = Math.max(P[i + 1].y - d, Math.min(P[i + 1].y + d, P[i].y)); }
    return P;
  };
  K.roadCut = function (L, H) {
    if (!L.road) return null;
    var o = K.roadDefaults(L.road), runs = L.ways.filter(function (w) { return w.kind === 'road'; }).map(function (w) { return w.pts.map(function (p) { return [p[0], p[1]]; }); });
    var path = K.roadPath(runs, H, o), profiles = path.runs.map(function (r) { return K.roadProfile(r, H, o); });
    /* the shoulder widens where the cut or the fill is deep: never steeper than 1 in 1.5 (o.batter) beside the road */
    var C = 32, cells = {}, segs = [], deepest = 0, bat = o.batter == null ? 1.5 : o.batter;
    profiles.forEach(function (P) {
      for (var i = 0; i < P.length - 1; i++) {
        var a = P[i], b = P[i + 1], dp = Math.max(Math.abs(a.y - a.h), Math.abs(b.y - b.h)), R = o.w / 2 + Math.max(o.shoulder, dp * bat);
        var sg = [a.x, a.z, a.y, b.x, b.z, b.y, R]; segs.push(sg); deepest = Math.max(deepest, dp);
        for (var cx = Math.floor((Math.min(a.x, b.x) - R) / C); cx <= Math.floor((Math.max(a.x, b.x) + R) / C); cx++)
          for (var cz = Math.floor((Math.min(a.z, b.z) - R) / C); cz <= Math.floor((Math.max(a.z, b.z) + R) / C); cz++) (cells[cx + ',' + cz] || (cells[cx + ',' + cz] = [])).push(sg);
      }
    });
    var apply = function (x, z, h) {
      var list = cells[Math.floor(x / C) + ',' + Math.floor(z / C)]; if (!list) return h;
      var F = 0, ws = 0, ys = 0;
      for (var i = 0; i < list.length; i++) {
        var q = list[i], ex = q[3] - q[0], ez = q[4] - q[1], l2 = ex * ex + ez * ez, t = l2 > 0 ? Math.max(0, Math.min(1, ((x - q[0]) * ex + (z - q[1]) * ez) / l2)) : 0;
        var d = Math.hypot(x - q[0] - ex * t, z - q[1] - ez * t); if (d >= q[6]) continue;
        var f = d <= o.w / 2 ? 1 : sm(q[6], o.w / 2, d), wgt = f * f * f * f + 1e-9; F = Math.max(F, f); ws += wgt; ys += wgt * (q[2] + (q[5] - q[2]) * t);
      }
      return F > 0 ? h + (ys / ws - h) * F : h;
    };
    return { o: o, path: path, profiles: profiles, apply: apply, deepest: deepest, segs: segs.length };
  };
  /* K.roadBad(cut, H, rule) -> [where the road on its cut is steeper than rule + .025 over 40 m (the hairpins' insides run a little over)];
     H the ground as drawn (with the cut). A rules check: the rule is the road's ruling grade, not the record's own (a record that asks for
     less is caught) */
  K.roadBad = function (cut, H, rule) {
    if (!cut) return ['no road record (L.road)'];
    var bad = [];
    cut.profiles.forEach(function (P) {
      for (var i = 0, j = 0; i < P.length; i++) {
        while (j < P.length && P[j].s - P[i].s < 40) j++;
        if (j >= P.length) break;
        var g = Math.abs(H(P[j].x, P[j].z) - H(P[i].x, P[i].z)) / (P[j].s - P[i].s);
        if (g > rule + .025) bad.push(Math.round(g * 1000) / 10 + ' % at ' + Math.round(P[i].x) + ', ' + Math.round(P[i].z));
      }
    });
    return bad;
  };
  var cutCache = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  K.roadCutOf = function (L, H) {
    if (!cutCache) return K.roadCut(L, H);
    if (!cutCache.has(L)) cutCache.set(L, null), cutCache.set(L, K.roadCut(L, H));
    return cutCache.get(L);
  };
  return K;
})();
if (typeof module !== 'undefined' && module.exports) module.exports = KCLIFF;
