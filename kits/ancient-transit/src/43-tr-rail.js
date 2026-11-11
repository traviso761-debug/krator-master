// ================================================================= ANCIENT TRANSIT — the train lines and the trains  [G data]
// Two lines on the highway's path and record shapes: a grade-level cargo line (a ballast bed on fills, sleepers, rails in sections, level
// crossings where it meets the host's streets, signals, catenary masts if asked) and an elevated passenger line (a guideway on lighter
// piers, stations: platforms, a canopy, stair towers, each in a ruin state). A train is cars along the line: standing, derailed
// (overturned and burnt) or fallen from the guideway.
//
//   KTRANSIT.rail(pts, o) -> R
//     o.id, o.seed, o.ground (required), o.elevated (false), o.gauge (1.6), o.radius (160), o.maxGrade (0.03 at grade, 0.04 elevated),
//     o.clearance (8, elevated), o.span (20), o.ruin (span shares, elevated), o.railRuin (KTRANSIT.RUIN.rail), o.streets [{id, pts, width}]
//     (the crossings), o.signalStep (300), o.catenary (false), o.stations [s...] (elevated), o.stationRuin, o.overgrowth (elevated; 0..2 or a function of s:
//     KTRANSIT.overgrow: soil and plants on the guideway), o.shift and o.quake (as the highway's). At grade the alignment cuts and fills
//     (KTRANSIT.profile 'cutfill'); R.form 0.45: the host carves the cuttings with KTRANSIT.lineH(R, x, z)
//     R = {id, kind: 'rail', elevated, seed, path, gauge, width, railAt(s), deckAt(s), beds | spans, piers, rails, ties, crossings, signals,
//          catenary, stations, rubble, L}
//       bed      {id, i, s0, s1, x0, z0, y0, x1, z1, y1, yaw, len, fillH, state: intact | cut}       (the ballast on its fill, 12 m; fillH < 0 a cutting)
//       rail     {id, i, s0, s1, state: intact | bent | gone, bend}                                   (a 24 m section, both rails)
//       tie      [s, state]  state 0 in place, 1 gone, 2 burnt                                        (every o.tieStep, 0.65 m)
//       crossing {id, s, x, z, y, yaw, streetYaw, width, state: intact | broken, gates: [{x, z, yaw, side, arm: up | down | broken}]}
//       signal   {id, s, x, z, y, yaw, side, state: intact | bent | fallen}         mast {id, s, x, z, y, yaw, side, state} (catenary)
//       station  {id, s, s0, s1, x, z, y, yaw, len, state, platforms: [{side, w}], canopy: {h, state}, stairs: [{id, x, z, yaw, side, end, state}]}
//   KTRANSIT.train(R, o) -> Tn   o.id, o.s (the head's position along the line), o.kind 'freight' | 'passenger', o.cars (a count or a list of
//     'loco' | 'box' | 'tank' | 'flat' | 'coach'), o.state 'standing' | 'derailed' | 'fallen', o.from (the car the derailment starts at),
//     o.burnt (share, 0.6), o.seed
//     Tn = {id, kind, state, line, cars: [{id, k, kind, s, x, z, y, yaw, roll, pitch, len, w, h, state, burnt, off}]}
(function () {
  var T = KTRANSIT, DECK = 1.0;
  function num(v, d) { return v == null ? d : v; }
  T.CARS = { loco: { len: 18, w: 3.0, h: 4.2 }, box: { len: 14, w: 2.9, h: 3.9 }, tank: { len: 13, w: 2.9, h: 3.8 }, flat: { len: 15, w: 2.9, h: 1.4 }, coach: { len: 20, w: 2.95, h: 3.7 } };
  T.rail = function (pts, o) {
    o = o || {};
    if (typeof o.ground !== 'function') throw new Error('KTRANSIT.rail: o.ground(x, z) is required');
    var id = o.id == null ? 'rl' : String(o.id), seed = o.seed == null ? T.idHash(id) : (o.seed >>> 0), el = !!o.elevated, gauge = num(o.gauge, 1.6), ground = o.ground;
    var width = num(o.width, el ? 7 : 5.2), span = num(o.span, 20), P = T.path(pts, { ground: ground, radius: num(o.radius, 160), step: 4, shift: o.shift });
    var Y = el ? T.profile(P, { mode: 'deck', clearance: num(o.clearance, 8), maxGrade: num(o.maxGrade, 0.04), window: span / 2 + 3 }) : T.profile(P, { mode: 'cutfill', above: 0.45, maxGrade: num(o.maxGrade, 0.03), window: 30 });
    var deckAt = Y.at, railAt = function (s) { return deckAt(s) + (el ? 0.24 : 0.2); }, rubble = [];
    var R = { id: id, kind: 'rail', elevated: el, seed: seed, path: P, gauge: gauge, width: width, deckAt: deckAt, railAt: railAt, L: P.L, deck: DECK, rubble: rubble, form: 0.45, beds: [], spans: [], piers: [], rails: [], ties: [], crossings: [], signals: [], catenary: [], stations: [] };
    var i, s0, s1, a, b, down = function (st) { return st === 'collapsed' || st === 'gone' || st === 'cut'; };
    if (el) {
      var ruin = T.shares(o.ruin || T.RUIN.span, T.SPAN_STATES), n = Math.max(1, Math.round(P.L / span));
      for (i = 0; i < n; i++) {
        s0 = i * P.L / n; s1 = (i + 1) * P.L / n; a = P.at(s0); b = P.at(s1);
        var y0 = deckAt(s0), y1 = deckAt(s1), len = Math.hypot(b.x - a.x, b.z - a.z), yaw = Math.atan2(b.x - a.x, b.z - a.z), st = ruin(T.u(seed, i, 1, 1));
        var S = { id: id + '.s' + i, i: i, s0: s0, s1: s1, x0: a.x, z0: a.z, y0: y0, x1: b.x, z1: b.z, y1: y1, yaw: yaw, len: len, pitch: Math.atan2(y1 - y0, len), width: width, lanes: 0, state: st, barriers: [st === 'intact', st === 'intact' || st === 'cracked'], crack: null, fall: null, lamps: [] };
        if (st === 'collapsed') {
          var mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, lat = (T.u(seed, i, 1, 4) - 0.5) * 5, fx = mx + Math.cos(yaw) * lat, fz = mz - Math.sin(yaw) * lat;
          S.fall = { x: fx, z: fz, y: ground(fx, fz), yaw: yaw + (T.u(seed, i, 1, 5) - 0.5) * 0.5, pitch: (T.u(seed, i, 1, 6) - 0.5) * 0.3, roll: (T.u(seed, i, 1, 7) < 0.5 ? -1 : 1) * (0.1 + 0.3 * T.u(seed, i, 1, 8)) };
          for (var k = 0; k < 4 + Math.floor(T.u(seed, i, 1, 9) * 4); k++) { var ang = T.u(seed, i, 1, 20 + k) * Math.PI * 2, rr = 2 + T.u(seed, i, 1, 40 + k) * 5, cx = fx + Math.cos(ang) * rr, cz = fz + Math.sin(ang) * rr;
            rubble.push({ id: S.id + '.k' + k, x: cx, z: cz, y: ground(cx, cz), yaw: T.u(seed, i, 1, 60 + k) * Math.PI, w: 0.6 + 1.6 * T.u(seed, i, 1, 80 + k), h: 0.4 + 0.9 * T.u(seed, i, 1, 100 + k), d: 0.6 + 1.4 * T.u(seed, i, 1, 120 + k), tilt: (T.u(seed, i, 1, 140 + k) - 0.5) * 0.8 }); }
        }
        R.spans.push(S);
      }
      for (var j = 0; j <= n; j++) {
        var sj = j < n ? R.spans[j].s0 : R.spans[n - 1].s1, pj = P.at(sj), yTop = deckAt(sj) - DECK, yG = ground(pj.x, pj.z), h = yTop - yG, L0 = j > 0 ? R.spans[j - 1].state : null, R0 = j < n ? R.spans[j].state : null, ps = 'standing';
        if (h < 1.2) ps = 'fill'; else if ((L0 == null || down(L0)) && (R0 == null || down(R0)) && (down(L0) || down(R0))) ps = T.u(seed, j, 1, 300) < 0.6 ? 'bare' : 'stub'; else if (down(L0) || down(R0)) ps = 'bare';
        R.piers.push({ id: id + '.p' + j, i: j, s: sj, x: pj.x, z: pj.z, yG: yG, yTop: yTop, h: Math.max(0, h), state: ps, cap: ps !== 'stub', stub: ps === 'stub' ? Math.max(1, h * (0.3 + 0.4 * T.u(seed, j, 1, 301))) : 0, yaw: pj.yaw });
      }
      if (o.overgrowth) T.overgrow(R, o.overgrowth, seed, 9);
      if (o.quake) { R.spans.forEach(function (S) { S.roll = T.quakeRoll(o.quake, (S.x0 + S.x1) / 2, (S.z0 + S.z1) / 2); }); R.piers.forEach(function (p) { p.roll = T.quakeRoll(o.quake, p.x, p.z); }); }
    } else {
      var nb = Math.max(1, Math.round(P.L / 12));
      for (i = 0; i < nb; i++) {
        s0 = i * P.L / nb; s1 = (i + 1) * P.L / nb; a = P.at(s0); b = P.at(s1);
        var m = P.at((s0 + s1) / 2), fill = deckAt(m.s) - m.yG, cut = T.u(seed, i, 2, 1) < 0.05;   /* fill < 0: a cutting the host carves (KTRANSIT.lineH) */
        R.beds.push({ id: id + '.b' + i, i: i, s0: s0, s1: s1, x0: a.x, z0: a.z, y0: deckAt(s0), x1: b.x, z1: b.z, y1: deckAt(s1), yaw: Math.atan2(b.x - a.x, b.z - a.z), len: Math.hypot(b.x - a.x, b.z - a.z), fillH: fill, state: cut ? 'cut' : 'intact' });
      }
    }
    /* the deck or the bed under a point along the line: where it is down, the rails are gone */
    var carried = function (s) { if (el) { var S = R.spans[Math.min(R.spans.length - 1, Math.floor(s / P.L * R.spans.length))]; return !down(S.state); } var B = R.beds[Math.min(R.beds.length - 1, Math.floor(s / P.L * R.beds.length))]; return B.state !== 'cut'; };
    R.carried = carried;
    /* the rails in 24 m sections, both rails one record; bent: a lateral sinus of up to 0.6 m */
    var railRuin = T.shares(o.railRuin || T.RUIN.rail, T.RAIL_STATES), nr = Math.max(1, Math.round(P.L / 24));
    for (i = 0; i < nr; i++) { s0 = i * P.L / nr; s1 = (i + 1) * P.L / nr; var rs = carried(s0 + 0.5) && carried((s0 + s1) / 2) && carried(s1 - 0.5) ? railRuin(T.u(seed, i, 3, 1)) : 'gone'; R.rails.push({ id: id + '.rail' + i, i: i, s0: s0, s1: s1, state: rs, bend: rs === 'bent' ? 0.25 + 0.35 * T.u(seed, i, 3, 2) : 0 }); }
    /* the sleepers */
    var tieStep = num(o.tieStep, 0.65), nt = Math.floor(P.L / tieStep);
    for (i = 0; i <= nt; i++) { var ts = i * tieStep, tu = T.u(seed, i, 4, 1); R.ties.push([ts, !carried(ts) ? 1 : tu < 0.08 ? 1 : tu < 0.2 ? 2 : 0]); }
    /* level crossings: where a street crosses the line (at grade only; an elevated line passes over) */
    if (!el) (o.streets || []).forEach(function (st, si) {
      T.intersections(P, st.pts).forEach(function (c, ci) {
        var cid = id + '.x' + si + '_' + ci, cu = T.u(seed, si, 5, ci), p = P.at(c.sP), w = num(st.width, 11), gates = [];
        [[-1, -1], [1, 1]].forEach(function (g, gi) { var off = g[0] * (w / 2 + 2.2), along = g[1] * (width / 2 + 3.5), gx = c.x + Math.sin(c.yawQ) * along + Math.cos(c.yawQ) * off, gz = c.z + Math.cos(c.yawQ) * along - Math.sin(c.yawQ) * off, au = T.u(seed, si, 6, ci * 2 + gi);
          gates.push({ x: gx, z: gz, yaw: c.yawQ + (g[1] > 0 ? Math.PI : 0), side: g[0], arm: au < 0.35 ? 'up' : au < 0.65 ? 'down' : 'broken' }); });
        R.crossings.push({ id: cid, s: c.sP, x: c.x, z: c.z, y: deckAt(c.sP), yaw: p.yaw, streetYaw: c.yawQ, width: w, state: cu < 0.5 ? 'intact' : 'broken', gates: gates, street: st.id == null ? si : st.id });
      });
    });
    /* signals: every signalStep along the line and 40 m before each crossing, on alternating sides */
    var sigStep = num(o.signalStep, 300), sigAt = [];
    for (var ss = sigStep; ss < P.L - 20; ss += sigStep) sigAt.push(ss);
    R.crossings.forEach(function (c) { if (c.s - 40 > 10) sigAt.push(c.s - 40); if (c.s + 40 < P.L - 10) sigAt.push(c.s + 40); });
    sigAt.sort(function (p, q) { return p - q; });
    sigAt.forEach(function (ss2, k) { var p = P.at(ss2), side = k % 2 ? 1 : -1, off = side * (width / 2 + 0.9), su = T.u(seed, k, 7, 1);
      R.signals.push({ id: id + '.sig' + k, s: ss2, x: p.x + Math.cos(p.yaw) * off, z: p.z - Math.sin(p.yaw) * off, y: deckAt(ss2), yaw: p.yaw, side: side, state: !carried(ss2) || su > 0.8 ? 'fallen' : su > 0.5 ? 'bent' : 'intact' }); });
    /* catenary masts every 50 m, alternating sides; the wire runs between standing neighbours (the draw reads the states) */
    if (o.catenary) for (var cs = 25, ck = 0; cs < P.L; cs += 50, ck++) { var cp = P.at(cs), cside = ck % 2 ? 1 : -1, coff = cside * (width / 2 + 0.6), cu2 = T.u(seed, ck, 8, 1);
      R.catenary.push({ id: id + '.cat' + ck, s: cs, x: cp.x + Math.cos(cp.yaw) * coff, z: cp.z - Math.sin(cp.yaw) * coff, y: deckAt(cs), yaw: cp.yaw, side: cside, state: !carried(cs) || cu2 > 0.78 ? 'fallen' : cu2 > 0.5 ? 'bent' : 'intact' }); }
    /* stations on the elevated line: 90 m of platform both sides of the guideway, a canopy, a stair tower at each end */
    if (el) { var stRuin = T.shares(o.stationRuin || T.RUIN.station, T.STATION_STATES);
      (o.stations || []).forEach(function (s, k) {
        if (typeof s !== 'number' || s < 60 || s > P.L - 60) throw new Error('KTRANSIT.rail: station ' + k + ' at s=' + s + ' is off the line');
        var p = P.at(s), st2 = stRuin(T.u(seed, k, 9, 1)), len = 90, stairs = [];
        [[-1, 0], [1, 1]].forEach(function (e, ei) { var es = s + e[0] * (len / 2 - 4), ep = P.at(es), eside = ei ? -1 : 1, eoff = eside * (width / 2 + 3.5 + 2.6), su = T.u(seed, k, 10, ei);
          stairs.push({ id: id + '.st' + k + '.stair' + ei, s: es, x: ep.x + Math.cos(ep.yaw) * eoff, z: ep.z - Math.sin(ep.yaw) * eoff, yaw: ep.yaw, side: eside, end: ei, y: deckAt(es), yG: ground(ep.x + Math.cos(ep.yaw) * eoff, ep.z - Math.sin(ep.yaw) * eoff), state: st2 === 'collapsed' && su < 0.6 ? 'collapsed' : st2 === 'intact' ? 'intact' : 'ruined' }); });
        R.stations.push({ id: id + '.st' + k, s: s, s0: s - len / 2, s1: s + len / 2, x: p.x, z: p.z, y: deckAt(s), yaw: p.yaw, len: len, state: st2, platforms: [{ side: -1, w: 3.5 }, { side: 1, w: 3.5 }], canopy: { h: 4.2, w: width + 2 * 3.5 + 1.2, state: st2 }, stairs: stairs });
      }); }
    return R;
  };
  /* a train on a line */
  T.train = function (R, o) {
    o = o || {};
    if (!R || !R.path) throw new Error('KTRANSIT.train: a line from KTRANSIT.rail, please');
    var id = o.id == null ? R.id + '.train' : String(o.id), seed = o.seed == null ? T.idHash(id) : (o.seed >>> 0), kind = o.kind === 'passenger' ? 'passenger' : 'freight';
    var list = Array.isArray(o.cars) ? o.cars.slice() : kind === 'passenger' ? ['coach', 'coach', 'coach', 'coach', 'coach'] : ['loco', 'box', 'tank', 'flat', 'box', 'box', 'tank', 'flat'];
    if (typeof o.cars === 'number') { list = kind === 'passenger' ? [] : ['loco']; while (list.length < o.cars) list.push(kind === 'passenger' ? 'coach' : ['box', 'tank', 'flat'][list.length % 3]); }
    list.forEach(function (c) { if (!T.CARS[c]) throw new Error('KTRANSIT.train: no car kind ' + c); });
    var state = o.state === 'derailed' ? 'derailed' : o.state === 'fallen' ? 'fallen' : 'standing', head = num(o.s, R.L / 2), gap = 0.9, burntShare = num(o.burnt, 0.6);   /* the owner, 2026-11-08: more wrecked */
    var total = list.reduce(function (acc, c) { return acc + T.CARS[c].len + gap; }, -gap);
    if (head - total < 0 || head > R.L) throw new Error('KTRANSIT.train: the train (' + Math.round(total) + ' m behind s=' + head + ') does not fit on the line');
    var from = state === 'standing' ? list.length : o.from == null ? Math.floor(T.u(seed, 1, 0, 0) * Math.max(1, list.length - 1)) : o.from, side = T.u(seed, 2, 0, 0) < 0.5 ? -1 : 1, s = head, cars = [];
    list.forEach(function (c, k) {
      var C = T.CARS[c], sc = s - C.len / 2, p = R.path.at(sc), carS = 'ok', off = 0, dyaw = 0, roll = 0, pitch = 0, y = R.railAt(sc), burnt = false, u = function (j) { return T.u(seed, k, 3, j); };
      if (k >= from) {
        var q = k - from + 1;
        if (state === 'derailed') { off = side * Math.min(4.5, 0.6 * q + 1.6 * u(1)); dyaw = side * (0.08 * q + 0.25 * u(2)) * (u(3) < 0.5 ? 1 : -1) * (k === from ? 0.4 : 1); carS = u(4) < 0.6 ? 'overturned' : 'derailed'; roll = carS === 'overturned' ? side * (1.35 + 0.25 * u(5)) : side * 0.12 * u(5); pitch = (u(6) - 0.5) * 0.1; y = (R.floorAt ? R.floorAt(sc) : R.elevated ? R.deckAt(sc) : p.yG) + 0.25; }
        else { off = side * (R.width / 2 + 1.5 + 4 * u(1)); dyaw = (u(2) - 0.5) * 1.4; carS = 'fallen'; roll = (u(3) < 0.5 ? -1 : 1) * (1.2 + 0.4 * u(4)); pitch = (u(5) - 0.5) * 0.3; y = R.path.ground(p.x + Math.cos(p.yaw) * off, p.z - Math.sin(p.yaw) * off); }
        y += Math.abs(Math.sin(roll)) * C.w / 2;
        burnt = u(7) < burntShare;
      } else burnt = state !== 'standing' && u(7) < burntShare * 0.5;
      cars.push({ id: id + '.c' + k, k: k, kind: c, s: sc, x: p.x + Math.cos(p.yaw) * off, z: p.z - Math.sin(p.yaw) * off, y: y, yaw: p.yaw + dyaw, roll: roll, pitch: pitch, len: C.len, w: C.w, h: C.h, state: carS, burnt: burnt, off: off, seed: KRAND.hash(seed, k, 4) >>> 0, load: c === 'flat' ? (u(8) < 0.5 ? 'containers' : 'slabs') : null });
      s -= C.len + gap;
    });
    return { id: id, kind: kind, state: state, line: R.id, s: head, cars: cars, L: total };
  };
})();
