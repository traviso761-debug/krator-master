// ================================================================= ANCIENT TRANSIT — the subway  [G data]
// The Ancients' underground line (the owner, 2026-11-08): a bored twin-track tunnel under the ground, following a path as the other lines do,
// in sections with ruin states; cut-and-cover stations (a hall with two side platforms, columns, a roof) with a stair entrance at each end up
// to the street and vent heads along the line; and where a roof has fallen in, a SINKHOLE at the surface the host carves into its ground
// (KTRANSIT.sinkholeH), so the pit opens onto the tunnel. Plain records on KRAND; 56b-tr-draw-subway.js draws them.
//
//   KTRANSIT.subway(pts, o) -> SW
//     o.id ('sw'), o.seed, o.ground (required: the host's ground WITHOUT the sinkholes), o.depth (the floor below the ground, 11),
//     o.radius (the bore, 4.2), o.section (20), o.maxGrade (0.04), o.radiusTurn (the path's fillet, 150), o.gauge (1.6), o.tracks (the two
//     tracks' lateral offsets, [-2, 2]), o.ruin ({intact, cracked, collapsed, silted}), o.stations [s...], o.stationRuin, o.stationStates
//     ([state...] by station index, over the shares), o.ventStep (150)
//     SW = {id, kind: 'subway', seed, path, L, radius, floorAt(s) (the floor slab's top), railAt(s), deckAt (= floorAt), axisAt(s), width,
//           sections: [{id, i, s0, s1, x0, z0, y0, x1, z1, y1, yaw, len, pitch, state: intact | cracked | collapsed | silted, inStation, silt}],
//           rails: [{id, i, s0, s1, track, off, state: intact | bent | gone, bend}], stations: [{id, s, s0, s1, x, z, y, yaw, len, hallW, hallH,
//           state: intact | ruined | collapsed, platforms: [{side, from, to}], columns: [{along, side}], furniture: [{kind, state, variant, seed,
//           lat, along, x, z, y, yaw}], entrances: [{id, x, z, y, yaw, side, end, state: intact | ruined | choked, flight}]}],
//           vents: [{id, s, x, z, y, yaw, side, state}], sinkholes: [{id, x, z, r, depth, section}] (over the collapsed tunnel sections),
//           voids: [{id, x, z, yaw, len, w, drop, ramp, station, r, k}] (a fallen-in station: the ground gone down to its floor over the hall),
//           pits: [{id, x, z, yaw, w, run, rise, along, r}] (the stair entrances)}
//   KTRANSIT.sinkholeH(SW, x, z) -> the depression at (x, z): 0 away from them; a smooth bowl in a sinkhole, the floor of a fallen-in station's void
//                                   (a 4 m ramp round it), a stair pit's steps. Everything carved is listed for a ground's refinement: KTRANSIT.carved(SW)
//   KTRANSIT.train(SW, o) works on it (the cars sit at railAt; a derailed one on the floor)
(function () {
  var T = KTRANSIT;
  function num(v, d) { return v == null ? d : v; }
  T.SUBWAY_STATES = ['intact', 'cracked', 'collapsed', 'silted'];
  T.RUIN.subway = { intact: 0.5, cracked: 0.2, collapsed: 0.15, silted: 0.15 };
  T.subway = function (pts, o) {
    o = o || {};
    if (typeof o.ground !== 'function') throw new Error('KTRANSIT.subway: o.ground(x, z) is required');
    var id = o.id == null ? 'sw' : String(o.id), seed = o.seed == null ? T.idHash(id) : (o.seed >>> 0), ground = o.ground, depth = num(o.depth, 11), R = num(o.radius, 4.2);
    var sec = num(o.section, 20), gauge = num(o.gauge, 1.6), tracks = o.tracks || [-2, 2], P = T.path(pts, { ground: ground, radius: num(o.radiusTurn, 150), step: 4 });
    var Y = T.profile(P, { mode: 'grade', above: -depth, maxGrade: num(o.maxGrade, 0.04) }), floorAt = Y.at, railAt = function (s) { return floorAt(s) + 0.2; }, axisAt = function (s) { return floorAt(s) + R * 0.62; };
    var SW = { id: id, kind: 'subway', seed: seed, path: P, L: P.L, radius: R, width: 2 * Math.sqrt(R * R - (R * 0.62) * (R * 0.62)), gauge: gauge, tracks: tracks, floorAt: floorAt, deckAt: floorAt, railAt: railAt, axisAt: axisAt,
      elevated: false, deck: 0, sections: [], rails: [], stations: [], vents: [], sinkholes: [], voids: [], pits: [], rubble: [] };
    /* the stations first: a section under a hall is the hall's */
    var stRuin = T.shares(o.stationRuin || T.RUIN.station, T.STATION_STATES), hallW = 16, hallH = 6, stLen = 80;
    (o.stations || []).forEach(function (s, k) {
      if (typeof s !== 'number' || s < stLen / 2 + 40 || s > P.L - stLen / 2 - 40) throw new Error('KTRANSIT.subway: station ' + k + ' at s=' + s + ' is off the line');
      var p = P.at(s), st = o.stationStates && o.stationStates[k] ? o.stationStates[k] : stRuin(T.u(seed, k, 30, 1)), S = { id: id + '.st' + k, s: s, s0: s - stLen / 2, s1: s + stLen / 2, x: p.x, z: p.z, y: floorAt(s), yaw: p.yaw, len: stLen, hallW: hallW, hallH: hallH, state: st,
        platforms: [{ side: -1, from: -hallW / 2 + 0.2, to: -4.2 }, { side: 1, from: 4.2, to: hallW / 2 - 0.2 }], columns: [], furniture: [], entrances: [] };
      for (var a = 6; a < stLen - 4; a += 8) [-1, 1].forEach(function (sd) { S.columns.push({ along: a, side: sd, lat: sd * 4.6, state: st === 'collapsed' && T.u(seed, k, 31, Math.round(a) * 2 + (sd > 0 ? 1 : 0)) < 0.5 ? 'fallen' : 'standing' }); });
      /* a bench, a bin and a sign or two on each platform, in the kit's states */
      [-1, 1].forEach(function (sd, pi) { for (var q = 0; q < 4; q++) { var kind = ['tr_bench', 'tr_bin', 'tr_bench', 'tr_sign'][q], pk = T.pick(KRAND.hash(seed, k, 32, pi * 4 + q), kind), along = 12 + q * 17 + 5 * T.u(seed, k, 33, pi * 4 + q), lat = sd * (hallW / 2 - 1.6), w = P.at(S.s0 + along);
        S.furniture.push({ kind: kind, state: pk.state, variant: pk.variant, seed: pk.seed, lat: lat, along: along, x: w.x + Math.cos(w.yaw) * lat, z: w.z - Math.sin(w.yaw) * lat, y: floorAt(S.s0 + along) + 1.0, yaw: w.yaw + (sd > 0 ? -Math.PI / 2 : Math.PI / 2) }); } });
      /* an entrance at each end on opposite sides: a stair pit at the street, a flight down to the hall's level, a passage into the hall */
      [[0, -1], [1, 1]].forEach(function (e) { var es = S.s0 + 12 + e[0] * (stLen - 24), ep = P.at(es), lat = e[1] * (hallW / 2 + 7), ex = ep.x + Math.cos(ep.yaw) * lat, ez = ep.z - Math.sin(ep.yaw) * lat, eu = T.u(seed, k, 34, e[0]);
        var yS = ground(ex, ez), rise = yS - floorAt(es), est = st === 'collapsed' && eu < 0.6 ? 'choked' : st === 'intact' ? (eu < 0.7 ? 'intact' : 'ruined') : (eu < 0.4 ? 'intact' : 'ruined');
        S.entrances.push({ id: S.id + '.e' + e[0], s: es, x: ex, z: ez, y: yS, yaw: ep.yaw, side: e[1], end: e[0], state: est, rise: rise, flight: { run: Math.max(12, rise * 1.35), w: 4.2 }, passage: { from: lat, to: e[1] * hallW / 2, h: 3.2, w: 4.2 } }); });
      SW.stations.push(S);
      if (st === 'collapsed') SW.voids.push({ id: S.id + '.void', x: p.x, z: p.z, yaw: p.yaw, len: stLen + 2, w: hallW + 2.4, drop: p.yG - floorAt(s) + 0.3, ramp: 4, station: S.id, r: stLen / 2 + 5, k: 16 });
    });
    var inStation = function (s) { return SW.stations.some(function (S) { return s >= S.s0 - 1e-6 && s <= S.s1 + 1e-6; }); };
    /* the sections: states by hash, intact under a hall; a run of collapsed ones makes a sinkhole every 16 m along it */
    var ruin = T.shares(o.ruin || T.RUIN.subway, T.SUBWAY_STATES), n = Math.max(1, Math.round(P.L / sec)), runStart = -1;
    for (var i = 0; i < n; i++) {
      var s0 = i * P.L / n, s1 = (i + 1) * P.L / n, a = P.at(s0), b = P.at(s1), mid = (s0 + s1) / 2, st2 = inStation(mid) ? 'intact' : ruin(T.u(seed, i, 20, 1)), len = Math.hypot(b.x - a.x, b.z - a.z);
      SW.sections.push({ id: id + '.t' + i, i: i, s0: s0, s1: s1, x0: a.x, z0: a.z, y0: floorAt(s0), x1: b.x, z1: b.z, y1: floorAt(s1), yaw: Math.atan2(b.x - a.x, b.z - a.z), len: len, pitch: Math.atan2(floorAt(s1) - floorAt(s0), len), state: st2, inStation: inStation(mid), silt: st2 === 'silted' ? 0.6 + 0.9 * T.u(seed, i, 20, 2) : st2 === 'cracked' ? 0.3 + 0.4 * T.u(seed, i, 20, 2) : 0, width: SW.width, lanes: 0, barriers: [false, false], crack: null, fall: null, lamps: [] });
      if (st2 === 'collapsed') { if (runStart < 0) runStart = s0; }
      if (st2 !== 'collapsed' || i === n - 1) { if (runStart >= 0) { var runEnd = st2 === 'collapsed' ? s1 : s0; for (var hs2 = runStart + Math.min(8, (runEnd - runStart) / 2); hs2 < runEnd; hs2 += 16) { var hp2 = P.at(hs2); SW.sinkholes.push({ id: id + '.hole' + SW.sinkholes.length, x: hp2.x, z: hp2.z, r: 6.5 + 2.5 * T.u(seed, Math.round(hs2), 21, 1), depth: hp2.yG - floorAt(hs2) + 0.4, section: id + '.t' + Math.floor(hs2 / P.L * n) }); } runStart = -1; } }
    }
    /* the rails, each track in 24 m sections; gone where the roof fell, bent in a cracked section half the time */
    var railRuin = T.shares(T.RUIN.rail, T.RAIL_STATES), nr = Math.max(1, Math.round(P.L / 24));
    tracks.forEach(function (off, ti) { for (var j = 0; j < nr; j++) { var r0 = j * P.L / nr, r1 = (j + 1) * P.L / nr, S2 = SW.sections[Math.min(n - 1, Math.floor((r0 + r1) / 2 / P.L * n))], rs = S2.state === 'collapsed' ? 'gone' : S2.state === 'cracked' && T.u(seed, j, 22, ti) < 0.5 ? 'bent' : (S2.inStation ? 'intact' : railRuin(T.u(seed, j, 23, ti)));
      SW.rails.push({ id: id + '.rail' + ti + '_' + j, i: j, track: ti, off: off, s0: r0, s1: r1, state: rs, bend: rs === 'bent' ? 0.2 + 0.3 * T.u(seed, j, 24, ti) : 0 }); } });
    /* vent heads at the surface along the line, off to one side */
    var vs = num(o.ventStep, 150);
    for (var v = vs / 2, vk = 0; v < P.L; v += vs, vk++) { if (inStation(v)) continue; var vp = P.at(v), vside = vk % 2 ? 1 : -1, voff = vside * (SW.width / 2 + 3), vx = vp.x + Math.cos(vp.yaw) * voff, vz = vp.z - Math.sin(vp.yaw) * voff, vu = T.u(seed, vk, 25, 1);
      SW.vents.push({ id: id + '.vent' + vk, s: v, x: vx, z: vz, y: ground(vx, vz), yaw: vp.yaw, side: vside, state: vu < 0.5 ? 'intact' : vu < 0.8 ? 'ruined' : 'fallen' }); }
    SW.pits = []; SW.stations.forEach(function (S) { S.entrances.forEach(function (E) { SW.pits.push({ id: E.id, x: E.x, z: E.z, yaw: E.yaw, w: E.flight.w + 1.2, run: E.flight.run, rise: E.rise, along: E.end ? -1 : 1, r: E.flight.run / 2 + 2 }); }); });
    return SW;
  };
  /* the depression a host adds to its ground: each sinkhole a smooth bowl, depth (1 - (d / r)^2)^2 deep at its middle (the deepest wins); each
     stair entrance a pit, its floor the stair's foot, inside the flight's rectangle. The pits are listed in SW.pits for a ground's refinement */
  T.carved = function (SW) { return [].concat(SW.sinkholes.map(function (h) { return { x: h.x, z: h.z, r: h.r }; }), SW.voids.map(function (v) { return { x: v.x, z: v.z, r: v.r, k: v.k }; }), SW.pits.map(function (p) { return { x: p.x, z: p.z, r: p.r, k: 16 }; })); };
  T.sinkholeH = function (SW, x, z) {
    var h = 0, H = SW.sinkholes, i;
    for (i = 0; i < H.length; i++) { var k = H[i], d = Math.hypot(x - k.x, z - k.z); if (d >= k.r) continue; var t = 1 - (d / k.r) * (d / k.r), v = -k.depth * t * t; if (v < h) h = v; }
    for (i = 0; i < SW.voids.length; i++) { var V = SW.voids[i], vx = x - V.x, vz = z - V.z, vc = Math.cos(V.yaw), vs = Math.sin(V.yaw), vlat = Math.abs(vx * vc - vz * vs), valo = Math.abs(vx * vs + vz * vc);
      var o1 = Math.max(0, vlat - V.w / 2, valo - V.len / 2); if (o1 < V.ramp) { var f = 1 - o1 / V.ramp, dv = -V.drop * f * f * (3 - 2 * f); if (dv < h) h = dv; } }
    for (i = 0; i < SW.pits.length; i++) { var p = SW.pits[i], dx = x - p.x, dz = z - p.z, c = Math.cos(p.yaw), s = Math.sin(p.yaw), lat = dx * c - dz * s, alo = dx * s + dz * c;
      if (Math.abs(lat) <= p.w / 2 && alo * p.along >= -0.2 && alo * p.along <= p.run + 0.4) { var dd = -p.rise + 0.05 + Math.max(0, (p.run - alo * p.along) / p.run) * (p.rise - 0.4); if (dd < h) h = dd; } }
    return h;
  };
})();
