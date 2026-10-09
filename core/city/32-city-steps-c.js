/* ============================== 6. STEPS 10-12: SIDE STREETS, SIDE LOTS, ALLEYS; THE RUNNER ============================== */
/* [G data] */

/* step 10: side streets join main streets (and the avenues). They start, first, from the frontage step 9
   knocked out, then every sideSpacing along each main street; each runs across the block to the next street
   it meets, ending in that street's knocked-out frontage when there is one near. Lots are dear to cross. */
SL.pass10 = function () {
  var rs = SL.stream(10), R = SL.R, seeds = [], made = 0, opt = { lotK: 13, spK: 12, wobK: 0.5, cross: 6, hw: 1.15, margin: 40, rdp: 2 };
  PLAN.knocks.forEach(function (K) { var w = PLAN.ways[K.way]; if (w.cls === 'main' || w.cls === 'avenue') seeds.push({ way: w, side: K.side, s: (K.s0 + K.s1) / 2, knock: K, pri: rs.rnd() }); });
  PLAN.ways.forEach(function (w) {
    if (w.cls !== 'main') return;
    [-1, 1].forEach(function (side) { for (var s = TUNE.sideSpacing * rs.rr(0.4, 0.8); s < w.F.len - 15; s += TUNE.sideSpacing * rs.rr(0.85, 1.15)) seeds.push({ way: w, side: side, s: s, pri: 1 + rs.rnd() }); });
  });
  seeds.sort(function (a, b) { return a.pri - b.pri; });
  var ends = {};  /* way id -> arc lengths where side streets already meet it */
  var near = function (w, s, d) { return (ends[w] || []).some(function (x) { return Math.abs(x - s) < d; }); };
  seeds.forEach(function (sd) {
    var w = sd.way, s = sd.s;
    if (near(w.id, s, TUNE.sideSpacing * 0.55)) return;
    var p = w.F.at(s), n = V.mul(V.perp(w.F.tan(s, 4)), sd.side), hit = null;
    for (var d = w.w / 2 + 1; d < TUNE.sideMax; d += 1.5) {
      var q = V.add(p, V.mul(n, d)), k = R.idx(q[0], q[1]), c = k < 0 ? OCC.OUT : R.occ[k];
      if (c === OCC.OUT || c === OCC.HARD || c === OCC.GREEN) break;
      if (c === OCC.STREET && R.own[k] !== w.id) { hit = { way: PLAN.ways[R.own[k]], q: q, d: d }; break; }
    }
    if (!hit || hit.d < SL.minSpacing) return;
    var T = hit.way, sT = T.F.nearest(hit.q).s;
    if (near(T.id, sT, TUNE.sideSpacing * 0.5)) return;
    var KT = null;
    PLAN.knocks.forEach(function (K) { var m = (K.s0 + K.s1) / 2; if (K.way === T.id && !K.used && Math.abs(m - sT) < 25 && (!KT || Math.abs(m - sT) < Math.abs((KT.s0 + KT.s1) / 2 - sT))) KT = K; });
    if (KT) sT = (KT.s0 + KT.s1) / 2;
    var a = p, b = T.F.at(sT), L = V.dist(a, b);
    var pts = SL.route(a, b, w.id, T.id, Object.assign({ maxCost: L * 2.6 + 900 }, opt));
    if (!pts) return;
    SL.addWay('side', pts, 10, { tag: 'side ' + w.id + '-' + T.id });
    (ends[w.id] = ends[w.id] || []).push(s); (ends[T.id] = ends[T.id] || []).push(sT);
    if (sd.knock) sd.knock.used = true;
    if (KT) KT.used = true;
    made++;
  });
  SL.note(10, made + ' side streets from ' + seeds.length + ' seeds (' + seeds.filter(function (x) { return x.knock; }).length + ' in knocked-out frontage)');
};

/* step 11: lots along the side streets, one in ten (alleyFrac) held open as an alley entrance; then the
   knocked-out frontage is offered to lots again, and what still takes none becomes park and plaza */
SL.pass11 = function () {
  var n0 = PLAN.lots.length, g0 = PLAN.greens.length, refill = 0;
  PLAN.ways.forEach(function (w) {
    if (w.cls !== 'side') return;
    [-1, 1].forEach(function (side) { SL.lineLots(w, side, SL.choosers.side, 11, { entrance: function (rs) { return rs.chance(TUNE.alleyFrac); } }); });
  });
  var R = SL.R;
  PLAN.knocks.forEach(function (K) {
    var w = PLAN.ways[K.way];
    var got = SL.lineLots(w, K.side, SL.choosers.alley, 11, { s0: Math.max(0, K.s0 - 2), s1: Math.min(w.F.len, K.s1 + 8) });
    refill += got.length;
    if (got.length) return;
    /* nothing fits: a park and a plaza where the frontage is open (the biggest rectangle that is clear) */
    var mid = (K.s0 + K.s1) / 2, t = w.F.tan(mid, 4), nrm = V.mul(V.perp(t), K.side), p = w.F.at(mid);
    for (var wid = Math.max(8, K.s1 - K.s0 + 6); wid >= 6; wid -= 3) {
      for (var dep = 14; dep >= 6; dep -= 4) {
        var o = obb(V.add(p, V.mul(nrm, w.w / 2 + dep / 2)), t, wid / 2, dep / 2);
        if (R.blockedRect(o, 0.5)) continue;
        var cut = -o.hw + wid * 0.6;
        var A = obb(V.add(o.c, V.mul(t, (-o.hw + cut) / 2)), t, (cut + o.hw) / 2, o.hd), B = obb(V.add(o.c, V.mul(t, (cut + o.hw) / 2)), t, (o.hw - cut) / 2, o.hd);
        var W = SL.wealth(p);
        SL.addGreen('park', obbCorners(A), 11, W, 'middle', A);
        SL.addGreen('plaza', obbCorners(B), 11, W, 'middle', B);
        return;
      }
    }
  });
  SL.note(11, (PLAN.lots.length - n0 - refill) + ' side-street lots, ' + PLAN.entrances.length + ' alley entrances, ' + refill + ' lots back in knocked-out frontage, ' + (PLAN.greens.length - g0) + ' greens');
};

/* step 12: alleys. The blocks are what the streets enclose. In each block the alley entrances are joined by a
   spanning tree of alleys routed round the lots; an entrance alone in its block (or one no route reaches) gets a
   blind alley into the block's open middle. Then lots along the alleys. */
SL.pass12 = function () {
  var R = SL.R, n = R.n, N = n * n, lab = new Int32Array(N).fill(-1), nb = 0, q = new Int32Array(N);
  for (var k0 = 0; k0 < N; k0++) {
    if (lab[k0] >= 0 || R.occ[k0] === OCC.STREET || R.occ[k0] === OCC.OUT) continue;
    var h = 0, t = 0; q[t++] = k0; lab[k0] = nb;
    while (h < t) {
      var k = q[h++], i = k % n, j = (k / n) | 0;
      var nbrs = [i > 0 ? k - 1 : -1, i < n - 1 ? k + 1 : -1, j > 0 ? k - n : -1, j < n - 1 ? k + n : -1];
      for (var e = 0; e < 4; e++) { var m = nbrs[e]; if (m >= 0 && lab[m] < 0 && R.occ[m] !== OCC.STREET && R.occ[m] !== OCC.OUT) { lab[m] = nb; q[t++] = m; } }
    }
    nb++;
  }
  PLAN.blocks = nb;
  var byBlock = {};
  PLAN.entrances.forEach(function (E) { var k = R.idx(E.inner[0], E.inner[1]); E.block = k >= 0 ? lab[k] : -1; if (E.block >= 0) (byBlock[E.block] = byBlock[E.block] || []).push(E); });
  var F = SL.fields(), joined = 0, blind = 0;
  var cost = function (blk) {
    return function (k) {
      if (lab[k] !== blk) return Infinity;
      var c = R.occ[k];
      if (c === OCC.FREE) return 1 + 0.4 * F.wob[k];
      if (c === OCC.RESERVE) return 1;
      if (c === OCC.ALLEY) return 0.6;
      if (c === OCC.GREEN) return 4;
      return Infinity;
    };
  };
  var cellPt = function (k) { return [R.cx(k % n), R.cx((k / n) | 0)]; };
  var alley = function (pts, E1, E2, tag) {
    var P = [E1.street].concat(chaikin(rdp(pts, 1.5), 1));
    if (E2) P.push(E2.street);
    var w = SL.addWay('alley', P, 12, { tag: tag });
    E1.used = true; if (E2) E2.used = true;
    return w;
  };
  Object.keys(byBlock).forEach(function (b) {
    var Es = byBlock[b], blk = +b;
    /* Prim's tree over the block's entrances */
    if (Es.length > 1) {
      var inT = [Es[0]], out = Es.slice(1);
      while (out.length) {
        var bd = Infinity, bi = -1, bj = -1;
        inT.forEach(function (A, ai) { out.forEach(function (B, oi) { var d = V.dist(A.inner, B.inner); if (d < bd) { bd = d; bi = ai; bj = oi; } }); });
        var A = inT[bi], B = out.splice(bj, 1)[0];
        inT.push(B);
        if (bd > 220) continue;
        var ka = R.idx(A.inner[0], A.inner[1]), kb = R.idx(B.inner[0], B.inner[1]);
        var m = 30 / R.c, ai = ka % n, aj = (ka / n) | 0, bi2 = kb % n, bj2 = (kb / n) | 0;
        var win = [Math.max(0, Math.min(ai, bi2) - m) | 0, Math.max(0, Math.min(aj, bj2) - m) | 0, Math.min(n - 1, Math.max(ai, bi2) + m) | 0, Math.min(n - 1, Math.max(aj, bj2) + m) | 0];
        var path = ASTAR(R, ka, [kb], cost(blk), win, 1.1);
        if (!path) continue;
        alley(path.map(cellPt), A, B, 'alley b' + blk);
        joined++;
      }
    }
    /* blind alleys: entrances still unjoined walk into the block's open ground, as deep as blindMax */
    Es.forEach(function (E) {
      if (E.used) return;
      var ks = R.idx(E.inner[0], E.inner[1]); if (ks < 0) return;
      var dist = new Map(), par = new Map(), qq = [ks], far = ks, fd = 0, lim = TUNE.blindMax / R.c;
      dist.set(ks, 0); par.set(ks, -1);
      for (var hh = 0; hh < qq.length; hh++) {
        var kk = qq[hh], dd = dist.get(kk); if (dd >= lim) continue;
        var ii = kk % n, jj = (kk / n) | 0;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (D) {
          var i2 = ii + D[0], j2 = jj + D[1]; if (i2 < 0 || j2 < 0 || i2 >= n || j2 >= n) return;
          var m2 = j2 * n + i2, c = R.occ[m2];
          if (dist.has(m2) || lab[m2] !== blk || !(c === OCC.FREE || c === OCC.RESERVE)) return;
          /* keep a clear metre each side: an alley needs its width */
          var x = R.cx(i2), z = R.cx(j2);
          if (R.at(x + 2, z) === OCC.LOT || R.at(x - 2, z) === OCC.LOT || R.at(x, z + 2) === OCC.LOT || R.at(x, z - 2) === OCC.LOT) return;
          dist.set(m2, dd + 1); par.set(m2, kk); qq.push(m2);
          if (dd + 1 > fd) { fd = dd + 1; far = m2; }
        });
      }
      if (fd * R.c < 10) return;
      var chain = []; for (var c2 = far; c2 >= 0; c2 = par.get(c2)) chain.push(c2);
      chain.reverse();
      alley(chain.map(cellPt), E, null, 'blind b' + blk);
      E.blind = true; blind++;
    });
  });
  var n0 = PLAN.lots.length;
  PLAN.ways.forEach(function (w) { if (w.cls === 'alley') [-1, 1].forEach(function (side) { SL.lineLots(w, side, SL.choosers.alley, 12); }); });
  var n1 = PLAN.lots.length, deep = SL.interiorAlleys(lab);
  SL.note(12, nb + ' blocks; ' + joined + ' alleys joining entrances, ' + blind + ' blind alleys; ' + (n1 - n0) + ' alley lots; then ' + deep.alleys +
    ' blind alleys into the deepest open ground left, with ' + (PLAN.lots.length - n1) + ' lots');
};

/* interior infill: open ground still deeper than interiorDepth from anything built is reached by a blind alley
   from the nearest street or alley (a breadth-first walk over open ground, a clear cell each side), and the
   new alley takes lots. Rounds of well-separated picks, the depth field recomputed between rounds. */
SL.interiorAlleys = function (lab) {
  var R = SL.R, n = R.n, N = n * n, D = new Float32Array(N), skip = new Uint8Array(N), made = 0;
  var open = function (c) { return c === OCC.FREE || c === OCC.RESERVE; };
  for (var round = 0; round < TUNE.interiorRounds; round++) {
    /* depth of open ground: chamfer distance to the nearest cell that is not open */
    for (var k = 0; k < N; k++) D[k] = open(R.occ[k]) ? 1e9 : 0;
    var a = R.c, b = R.c * Math.SQRT2, rl = function (k, m, w) { if (D[m] + w < D[k]) D[k] = D[m] + w; };
    for (var j = 1; j < n - 1; j++) for (var i = 1; i < n - 1; i++) { var q = j * n + i; rl(q, q - 1, a); rl(q, q - n, a); rl(q, q - n - 1, b); rl(q, q - n + 1, b); }
    for (var j2 = n - 2; j2 > 0; j2--) for (var i2 = n - 2; i2 > 0; i2--) { var q2 = j2 * n + i2; rl(q2, q2 + 1, a); rl(q2, q2 + n, a); rl(q2, q2 + n + 1, b); rl(q2, q2 + n - 1, b); }
    var cand = [];
    for (var k2 = 0; k2 < N; k2++) if (D[k2] >= TUNE.interiorDepth && !skip[k2] && (!SL.interiorOk || SL.interiorOk(k2))) cand.push(k2);
    if (!cand.length) break;
    cand.sort(function (x, y) { return D[y] - D[x]; });
    var picks = [];
    for (var c = 0; c < cand.length && picks.length < 60; c++) {
      var kc = cand[c], x = R.cx(kc % n), z = R.cx((kc / n) | 0);
      if (picks.every(function (p) { return Math.hypot(p[0] - x, p[1] - z) > 45; })) picks.push([x, z, kc]);
    }
    var got = 0;
    picks.forEach(function (P) {
      var ks = R.idx(P[0], P[1]); if (!open(R.occ[ks])) return;
      /* walk out over open ground to the first street or alley */
      var par = new Map(), qq = [ks], end = -1, endStreet = -1, lim = TUNE.blindMax / R.c;
      par.set(ks, -1); var dist = new Map(); dist.set(ks, 0);
      for (var h = 0; h < qq.length && end < 0; h++) {
        var kk = qq[h], dd = dist.get(kk); if (dd > lim) continue;
        var ii = kk % n, jj = (kk / n) | 0, nb4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (var e = 0; e < 4 && end < 0; e++) {
          var i3 = ii + nb4[e][0], j3 = jj + nb4[e][1]; if (i3 < 1 || j3 < 1 || i3 >= n - 1 || j3 >= n - 1) continue;
          var m = j3 * n + i3, cm = R.occ[m];
          if (cm === OCC.STREET || cm === OCC.ALLEY) { end = kk; endStreet = m; break; }
          if (par.has(m) || !open(cm) || lab[m] !== lab[ks]) continue;
          if (!open(R.occ[m + 1]) && !open(R.occ[m - 1])) continue;          /* keep the alley's width clear */
          if (!open(R.occ[m + n]) && !open(R.occ[m - n])) continue;
          par.set(m, kk); dist.set(m, dd + 1); qq.push(m);
        }
      }
      if (end < 0) { R.eachNearSeg([P[0], P[1]], [P[0], P[1]], 20, function (k3) { skip[k3] = 1; }); return; }
      var chain = [endStreet]; for (var c2 = end; c2 >= 0; c2 = par.get(c2)) chain.push(c2);
      var pts = chain.map(function (k4) { return [R.cx(k4 % n), R.cx((k4 / n) | 0)]; });
      /* carry the alley on past the deepest point, so lots can line its far end too */
      var tip = pts[pts.length - 1], dir = pts.length > 2 ? V.norm(V.sub(tip, pts[pts.length - 3])) : [1, 0];
      for (var t = 2; t <= 12; t += 2) { var pp = V.add(tip, V.mul(dir, t)); if (!open(R.at(pp[0], pp[1]))) break; pts.push(pp); }
      if (plLen(pts) < 12) { skip[ks] = 1; return; }
      var w = SL.addWay('alley', chaikin(rdp(pts, 1.5), 1), 12, { tag: 'interior alley' });
      [-1, 1].forEach(function (side) { SL.lineLots(w, side, SL.choosers.alley, 12); });
      R.eachNearSeg([P[0], P[1]], [P[0], P[1]], 6, function (k5) { skip[k5] = 1; });
      made++; got++;
    });
    if (!got) break;
  }
  return { alleys: made };
};

/* ---------------------------------------------------------------- the runner */
/* steps 0-5 are the world's own (its site: ground, landmarks, wall, districts, avenues, highways); a world with other
   steps sets SL.STEPS and SL.layout itself (settlements/streetlab/targets/voth-city/35-vc-steps.js) */
SL.STEPS = ['the ground and the raster', 'landmarks', 'the wall', 'districts', 'avenues and gates', 'highways', 'civic buildings',
  'avenue lots', 'main streets', 'main-street lots', 'side streets', 'side-street lots, alley entrances', 'alleys and alley lots'];
SL.layout = function () {
  SL.newPlan(); SL.F = null; SL._items = {}; SL.pads.length = 0; SL.HASH = new Map();
  var mid = SL.items('middle').map(function (it) { return it.d + TUNE.lot.setback + TUNE.lot.rear; });
  SL.minSpacing = Math.min.apply(null, mid) + TUNE.width.main / 2 + TUNE.width.side / 2;
  PLAN.stats.ms = [];
  for (var k = 0; k <= 12; k++) { var t = Date.now(); SL['pass' + k](); PLAN.stats.ms[k] = Date.now() - t; }
  SL.count();
  return PLAN;
};
/* what stood after step `st`: counts by class, street lengths by class */
SL.count = function () {
  var S = PLAN.stats; S.byStep = [];
  for (var st = 0; st <= 12; st++) {
    var o = { lots: {}, ways: {}, greens: {} };
    PLAN.lots.forEach(function (L) { if (L.born <= st && (L.died == null || L.died > st)) o.lots[L.cls] = (o.lots[L.cls] || 0) + 1; });
    PLAN.ways.forEach(function (w) { if (w.born <= st) { var e = o.ways[w.cls] || (o.ways[w.cls] = { n: 0, m: 0 }); e.n++; e.m += w.F.len; } });
    PLAN.greens.forEach(function (g) { if (g.born <= st) o.greens[g.kind] = (o.greens[g.kind] || 0) + 1; });
    S.byStep.push(o);
  }
  S.knocked = PLAN.lots.filter(function (L) { return L.died != null; }).length;
  S.replaced = PLAN.lots.filter(function (L) { return L.replaces != null; }).length;
  S.minSpacing = SL.minSpacing;
};
/* the plan as JSON: every record without its frames (the export a Godot importer or another world reads) */
SL.exportPlan = function () {
  return JSON.stringify({
    tune: TUNE, wall: { poly: PLAN.wall.poly }, gates: PLAN.gates, tri: PLAN.tri, districts: PLAN.districts,
    ways: PLAN.ways.map(function (w) { return { id: w.id, cls: w.cls, w: w.w, born: w.born, tag: w.tag, pts: w.pts.map(function (p) { return [+p[0].toFixed(2), +p[1].toFixed(2)]; }) }; }),
    lots: PLAN.lots.map(function (L) { return { id: L.id, cls: L.cls, key: L.key, v: L.v, slot: L.slot, x: +L.x.toFixed(2), z: +L.z.toFixed(2), y: +L.y.toFixed(2), ry: +L.ry.toFixed(4), way: L.way, side: L.side, born: L.born, died: L.died, wealth: +L.wealth.toFixed(2), lot: { c: L.lot.c, u: L.lot.u, hw: L.lot.hw, hd: L.lot.hd } }; }),
    greens: PLAN.greens, entrances: PLAN.entrances, knocks: PLAN.knocks, stats: PLAN.stats, log: PLAN.log
  });
};
