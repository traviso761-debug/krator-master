// ================================================================= ANCIENT TRANSIT — the elevated highway  [G data]
// A path-following structure across a page in one call: spans keyed by stable id, piers with footings, on and off ramps that leave the
// deck and come down to grade on their own piers, a road surface where they land, an interchange where two highways cross (o.over), and
// a ruin state per span. Plain records on KRAND; 55-tr-draw-highway.js draws them.
//
//   KTRANSIT.highway(pts, o) -> H
//     o.id (default 'hw'), o.seed, o.ground(x, z) (required), o.clearance (deck top over the highest ground under a span, 9),
//     o.span (24), o.width (18: two lanes each way, a median, shoulders), o.lanes (4), o.maxGrade (0.05), o.radius (corner fillet, 80),
//     o.ruin ({intact, cracked, collapsed, gone} summing to 1, or a function of s giving one; KTRANSIT.RUIN.span), o.lampStep (36),
//     o.ramps [{s, side: 1 | -1, dir: 'off' | 'on', grade, tail}], o.over [H...] (the highways this one must clear where it crosses them),
//     o.blockades [s...] (improvised barricades of wrecked vehicles across the deck: KTRANSIT.blockade; H.blockades),
//     o.overgrowth (0..2 or a function of s: KTRANSIT.overgrow), o.shift (x, z) -> [dx, dz] (an earthquake's slip: KTRANSIT.quakeShift), o.quake (Q:
//     the spans and piers near the fault roll by KTRANSIT.quakeRoll; span.roll, pier.roll)
//     H = {id, kind: 'highway', seed, path, width, lanes, span, clearance, deckAt(s), spans, piers, rubble, ramps, roads, L}
//       span  {id, i, s0, s1, x0, z0, y0, x1, z1, y1, yaw, len, pitch, width, lanes, state, barriers: [side -1, side +1], crack: {side, depth} | null,
//              fall: {x, z, y, yaw, pitch, roll} | null (collapsed: where the deck lies), lamps: [{id, s, x, z, y, yaw, side, state}]}
//       pier  {id, i, s, x, z, yG, yTop, h, state: standing | bare | stub | fill | none, cap, stub (the height a stub keeps)}
//       ramp  {id, dir, side, s, path, spans, piers, rubble, road, L}      road {id, pts: [{x, z, y}], width, yaw}
//       rubble [{id, x, z, y, yaw, w, h, d, tilt}] (the chunks under a collapsed span; the valley may replace them with KRUBBLE heaps)
//   KTRANSIT.overgrow(L, level, seed, salt)     soil and plants on a line's spans (the owner, 2026-11-08: a version partly covered in soil and
//                                                plants, one fully overgrown). level 0..2, or a function of s: 1 is patchy (mounds of soil along
//                                                the edges, bushes and grass on them), 2 a bed across the deck with creepers down its sides.
//                                                span.growth = {level, cover, depth, plants: [{kind: bush | grass, lat, up, along, x, y, z, r, h}],
//                                                creepers: [{side, along, len, w}]}; the draw puts stand-in domes at the plants: a host plants
//                                                its biome kit's species at x, y, z instead (o.plants false on the draw)
//   KTRANSIT.spanToWorld(S, lat, up, along)     a point in a span's frame (standing, or its fall when collapsed) in the world
//   KTRANSIT.cull(H, blocked(x, z, r) -> bool) -> n: every pier whose footing a host's pad blocks goes (state 'none') and the spans it
//                                                  carried are 'gone'; the ramps too. Returns how many piers went
(function () {
  var T = KTRANSIT, DECK = 1.4, CAP = 0.9;
  function num(v, d) { return v == null ? d : v; }
  /* the spans of one deck along a path: states by hash, lamps on the standing ones, the fall of a collapsed one */
  function spansOf(P, deckAt, o, id, seed, salt, width, lanes, span, lampStep, ground, rubble) {
    var n = Math.max(1, Math.round(P.L / span)), out = [], ruinFn = typeof o.ruin === 'function' ? null : T.shares(o.ruin || T.RUIN.span, T.SPAN_STATES);
    for (var i = 0; i < n; i++) {
      var s0 = i * P.L / n, s1 = (i + 1) * P.L / n, a = P.at(s0), b = P.at(s1), y0 = deckAt(s0), y1 = deckAt(s1), len = Math.hypot(b.x - a.x, b.z - a.z);
      var yaw = Math.atan2(b.x - a.x, b.z - a.z), pitch = Math.atan2(y1 - y0, len), u = T.u(seed, i, salt, 1);
      var state = (ruinFn || T.shares(o.ruin((s0 + s1) / 2), T.SPAN_STATES))(u);
      var S = { id: id + '.s' + i, i: i, s0: s0, s1: s1, x0: a.x, z0: a.z, y0: y0, x1: b.x, z1: b.z, y1: y1, yaw: yaw, len: len, pitch: pitch, width: width, lanes: lanes,
        state: state, barriers: [true, true], crack: null, fall: null, lamps: [] };
      if (state === 'cracked') { var side = T.u(seed, i, salt, 2) < 0.5 ? -1 : 1; S.crack = { side: side, depth: 2.5 + 2.5 * T.u(seed, i, salt, 3) }; S.barriers[side > 0 ? 1 : 0] = false; }
      if (state === 'gone') S.barriers = [false, false];
      if (state === 'collapsed') {
        var mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, c = Math.cos(yaw), sn = Math.sin(yaw), lat = (T.u(seed, i, salt, 4) - 0.5) * 6, fx = mx + c * lat, fz = mz - sn * lat;
        S.fall = { x: fx, z: fz, y: ground(fx, fz), yaw: yaw + (T.u(seed, i, salt, 5) - 0.5) * 0.6, pitch: (T.u(seed, i, salt, 6) - 0.5) * 0.36, roll: (T.u(seed, i, salt, 7) < 0.5 ? -1 : 1) * (0.12 + 0.3 * T.u(seed, i, salt, 8)) };
        S.barriers = [T.u(seed, i, salt, 9) < 0.4, T.u(seed, i, salt, 10) < 0.4];
        var nk = 5 + Math.floor(T.u(seed, i, salt, 11) * 6);
        for (var k = 0; k < nk; k++) { var ang = T.u(seed, i, salt, 20 + k) * Math.PI * 2, rr = 3 + T.u(seed, i, salt, 40 + k) * (width * 0.7), cx = fx + Math.cos(ang) * rr, cz = fz + Math.sin(ang) * rr;
          rubble.push({ id: S.id + '.k' + k, x: cx, z: cz, y: ground(cx, cz), yaw: T.u(seed, i, salt, 60 + k) * Math.PI, w: 0.8 + 2.4 * T.u(seed, i, salt, 80 + k), h: 0.5 + 1.2 * T.u(seed, i, salt, 100 + k), d: 0.8 + 2.0 * T.u(seed, i, salt, 120 + k), tilt: (T.u(seed, i, salt, 140 + k) - 0.5) * 0.8 }); }
      }
      if (lampStep > 0 && (state === 'intact' || state === 'cracked')) {
        for (var q = Math.ceil(s0 / lampStep); q * lampStep < s1; q++) {
          var sl = q * lampStep, side2 = q % 2 ? 1 : -1; if (S.crack && S.crack.side === side2) continue;
          var p = P.at(sl), off = side2 * (width / 2 - 0.45), lx = p.x + Math.cos(p.yaw) * off, lz = p.z - Math.sin(p.yaw) * off;
          var lu = T.u(seed, q, salt, 200), ls = state === 'intact' ? (lu < 0.3 ? 'intact' : lu < 0.62 ? 'bent' : lu < 0.88 ? 'fallen' : 'burnt') : (lu < 0.12 ? 'intact' : lu < 0.45 ? 'bent' : lu < 0.85 ? 'fallen' : 'burnt');
          S.lamps.push({ id: S.id + '.l' + q, s: sl, x: lx, z: lz, y: deckAt(sl), yaw: p.yaw + (side2 > 0 ? -Math.PI / 2 : Math.PI / 2), side: side2, state: ls, seed: KRAND.hash(seed, q, salt, 201) >>> 0 });
        }
      }
      out.push(S);
    }
    return out;
  }
  /* the piers at the span joints: standing under a deck, bare where the deck is gone from one side, a stub or bare where both are, fill
     where the deck is within 1.5 m of the ground (an embankment), none where a host culled it */
  function piersOf(P, deckAt, spans, id, seed, salt, ground) {
    var out = [], n = spans.length;
    for (var j = 0; j <= n; j++) {
      var s = j < n ? spans[j].s0 : spans[n - 1].s1, p = P.at(s), yTop = deckAt(s) - DECK, yG = ground(p.x, p.z), h = yTop - yG;
      var L = j > 0 ? spans[j - 1].state : null, R = j < n ? spans[j].state : null, down = function (st) { return st === 'collapsed' || st === 'gone'; };
      var state = 'standing';
      if (h < 1.5) state = 'fill';
      else if ((L == null || down(L)) && (R == null || down(R)) && (L != null || R != null) && (down(L) || down(R))) state = T.u(seed, j, salt, 300) < 0.55 ? 'bare' : 'stub';
      else if (down(L) || down(R)) state = 'bare';
      out.push({ id: id + '.p' + j, i: j, s: s, x: p.x, z: p.z, yG: yG, yTop: yTop, h: Math.max(0, h), state: state, cap: state !== 'stub', stub: state === 'stub' ? Math.max(1.2, h * (0.25 + 0.5 * T.u(seed, j, salt, 301))) : 0, yaw: p.yaw });
    }
    return out;
  }
  function ramp(H, r, k, o) {
    if (!r || typeof r.s !== 'number') throw new Error('KTRANSIT.highway: ramp ' + k + ' needs s');
    if (r.s < 60 || r.s > H.L - 60) throw new Error('KTRANSIT.highway: ramp ' + k + ' at s=' + r.s + ' is off the deck (60 m from either end at least)');
    var dir = r.dir === 'on' ? 'on' : 'off', side = r.side == null ? 1 : (r.side < 0 ? -1 : 1), grade = num(r.grade, 0.06), tail = num(r.tail, 80), w = num(r.width, 7.5), id = H.id + '.r' + k;
    var sign = dir === 'off' ? 1 : -1, pts = [], ys = [], yDeck0 = H.deckAt(r.s), t = 0, landed = -1, lim = Math.min(1600, dir === 'off' ? H.L - r.s - 4 : r.s - 4);
    var spread = function (q) { var f = Math.min(1, q / 90); f = f * f * (3 - 2 * f); return H.width / 2 + 0.6 + w / 2 + 9 * f; };
    while (t <= lim) {
      var st = r.s + sign * t, p = H.path.at(st), off = side * spread(t), x = p.x + Math.cos(p.yaw) * off, z = p.z - Math.sin(p.yaw) * off;
      var yd = yDeck0 - grade * Math.max(0, t - 36), yg = H.path.ground(x, z);
      pts.push([x, z]); ys.push(yd);
      if (yd - yg <= 0.35) { landed = t; break; }
      t += 4;
    }
    if (landed < 0) throw new Error('KTRANSIT.highway: ramp ' + k + ' never reaches the ground before the deck ends (lengthen the deck or steepen the ramp)');
    var P = T.path(pts, { ground: H.path.ground, step: 4 }), deckAt = function (s) { var f = s / P.L * (ys.length - 1), a = Math.floor(f), tt = f - a; return a >= ys.length - 1 ? ys[ys.length - 1] : ys[a] + (ys[a + 1] - ys[a]) * tt; };
    var rubble = [], ro = Object.assign({}, o, { ruin: o.rampRuin || o.ruin || { intact: 0.55, cracked: 0.25, collapsed: 0.12, gone: 0.08 } });
    var spans = spansOf(P, deckAt, ro, id, H.seed, 500 + k, w, 1, num(o.span, 24), 0, H.path.ground, rubble), piers = piersOf(P, deckAt, spans, id, H.seed, 500 + k, H.path.ground);
    /* the road at grade where the ramp lands: on from the landing along the ramp's last heading */
    var e = P.at(P.L), yawE = e.yaw, road = { id: id + '.road', pts: [], width: w, yaw: yawE };
    for (var q = 0; q <= tail; q += 8) { var rx = e.x + Math.sin(yawE) * q, rz = e.z + Math.cos(yawE) * q; road.pts.push({ x: rx, z: rz, y: H.path.ground(rx, rz) }); }
    return { id: id, dir: dir, side: side, s: r.s, path: P, deckAt: deckAt, width: w, spans: spans, piers: piers, rubble: rubble, road: road, L: P.L };
  }
  T.highway = function (pts, o) {
    o = o || {};
    if (typeof o.ground !== 'function') throw new Error('KTRANSIT.highway: o.ground(x, z) is required');
    var id = o.id == null ? 'hw' : String(o.id), seed = o.seed == null ? T.idHash(id) : (o.seed >>> 0), span = num(o.span, 24), width = num(o.width, 18), lanes = num(o.lanes, 4);
    var clearance = num(o.clearance, 9), g = num(o.maxGrade, 0.05), lampStep = num(o.lampStep, 36);
    var P = T.path(pts, { ground: o.ground, radius: num(o.radius, 80), step: 4, shift: o.shift }), lift = null;
    if (o.over && o.over.length) {
      var X = [];
      o.over.forEach(function (G) { T.intersections(P, G.path).forEach(function (c) { X.push({ s: c.sP, y: G.deckAt(c.sQ) + DECK + 6.5, half: G.width / 2 + 10 }); }); });
      lift = function (s) { var m = null; X.forEach(function (c) { if (Math.abs(s - c.s) <= c.half) m = m == null ? c.y : Math.max(m, c.y); }); return m; };
    }
    var Y = T.profile(P, { mode: 'deck', clearance: clearance, maxGrade: g, window: span / 2 + 4, lift: lift }), deckAt = Y.at, rubble = [];
    var H = { id: id, kind: 'highway', seed: seed, path: P, width: width, lanes: lanes, span: span, clearance: clearance, deckY: Y.Y, deckAt: deckAt, L: P.L, deck: DECK, cap: CAP, rubble: rubble, ramps: [], roads: [] };
    H.spans = spansOf(P, deckAt, o, id, seed, 1, width, lanes, span, lampStep, o.ground, rubble);
    H.piers = piersOf(P, deckAt, H.spans, id, seed, 1, o.ground);
    if (o.quake) { H.spans.forEach(function (S) { S.roll = T.quakeRoll(o.quake, (S.x0 + S.x1) / 2, (S.z0 + S.z1) / 2); }); H.piers.forEach(function (p) { p.roll = T.quakeRoll(o.quake, p.x, p.z); }); }
    H.crossings = lift ? P.seg.length && T.intersections(P, o.over[0].path).map(function (c) { return { s: c.sP, x: c.x, z: c.z }; }) : [];
    if (o.overgrowth) T.overgrow(H, o.overgrowth, seed, 9);
    (o.ramps || []).forEach(function (r, k) { var R = ramp(H, r, k, o); H.ramps.push(R); H.roads.push(R.road); });
    H.blockades = (o.blockades || []).map(function (s, k) { if (s < 10 || s > H.L - 10) throw new Error('KTRANSIT.highway: blockade ' + k + ' is off the deck'); var S = H.spans[Math.min(H.spans.length - 1, Math.floor(s / H.L * H.spans.length))]; return T.blockade(H.path, s, width - 1.8, deckAt(s), KRAND.hash(seed, k, 600) >>> 0, H.id + '.bk' + k, S.state === 'gone' || S.state === 'collapsed'); });
    return H;
  };
  T.spanToWorld = function (S, lat, up, along) {
    var F = S.state === 'collapsed' && S.fall ? S.fall : null, yaw = F ? F.yaw : S.yaw, pitch = F ? F.pitch : S.pitch, roll = F ? F.roll : 0, a = F ? along - S.len / 2 : along, deck = S.deckDepth == null ? 1.4 : S.deckDepth;
    var cr = Math.cos(roll), sr = Math.sin(roll), x1 = lat * cr - up * sr, y1 = lat * sr + up * cr, z1 = a;
    var cp = Math.cos(-pitch), sp = Math.sin(-pitch), y2 = y1 * cp - z1 * sp, z2 = y1 * sp + z1 * cp;
    var cy = Math.cos(yaw), sy = Math.sin(yaw), x3 = x1 * cy + z2 * sy, z3 = -x1 * sy + z2 * cy;
    return [(F ? F.x : S.x0) + x3, (F ? F.y + 0.4 + deck * 0.5 * Math.abs(Math.sin(roll)) : S.y0) + y2, (F ? F.z : S.z0) + z3];
  };
  T.overgrow = function (L, level, seed, salt) {
    salt = salt == null ? 9 : salt;
    L.spans.forEach(function (S, i) {
      S.deckDepth = L.deck == null ? 1.4 : L.deck;
      var lv = typeof level === 'function' ? level((S.s0 + S.s1) / 2) : level; lv = lv == null ? 0 : +lv;
      if (!(lv > 0) || S.state === 'gone') { S.growth = null; return; }
      var u = function (k) { return T.u(seed, i, salt, 400 + k); }, cover = lv >= 2 ? 0.85 + 0.15 * u(0) : lv >= 1 ? 0.2 + 0.5 * u(0) : lv * (0.3 + 0.4 * u(0));
      var w = S.width, depth = 0.25 + 0.4 * cover, plants = [], creepers = [], n = Math.round(cover * S.len / 2.2), k, c;
      for (k = 0; k < n; k++) {
        var side = u(11 + k * 6) < 0.5 ? -1 : 1, big = u(13 + k * 6) < 0.3, lat = cover >= 0.85 ? (u(12 + k * 6) - 0.5) * (w - 2.4) : side * (w / 2 - 1.0 - u(12 + k * 6) * cover * w * 0.42);
        plants.push({ kind: big ? 'bush' : 'grass', lat: lat, up: depth * 0.75, along: 0.5 + u(10 + k * 6) * (S.len - 1), r: big ? 0.7 + 0.8 * u(14 + k * 6) : 0.35 + 0.4 * u(14 + k * 6), h: big ? 0.6 + 0.9 * u(15 + k * 6) : 0.25 + 0.3 * u(15 + k * 6) });
      }
      if (cover > 0.6) for (c = 2 + u(1) * 4, k = 0; c < S.len - 1; c += 3 + 5 * u(200 + k), k++) [-1, 1].forEach(function (sd) { if (u(220 + k * 2 + (sd > 0 ? 1 : 0)) < cover) creepers.push({ side: sd, along: c, len: 1.5 + 5 * u(260 + k * 2 + (sd > 0 ? 1 : 0)), w: 1 + 1.5 * u(300 + k * 2 + (sd > 0 ? 1 : 0)) }); });
      S.growth = { level: lv, cover: cover, depth: depth, plants: plants, creepers: creepers };
      plants.forEach(function (p) { var W = T.spanToWorld(S, p.lat, p.up, p.along); p.x = W[0]; p.y = W[1]; p.z = W[2]; });
    });
    return L;
  };
  T.cull = function (H, blocked) {
    var n = 0, lines = [H].concat(H.ramps || []);
    lines.forEach(function (L) {
      L.piers.forEach(function (p, j) {
        if (p.state === 'none' || !blocked(p.x, p.z, 2.6)) return;
        p.state = 'none'; n++;
        [L.spans[j - 1], L.spans[j]].forEach(function (S) { if (S && S.state !== 'collapsed') { S.state = 'gone'; S.barriers = [false, false]; S.lamps = []; S.crack = null; } });
      });
    });
    return n;
  };
})();
