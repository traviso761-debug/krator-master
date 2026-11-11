// ================================================================= ANCIENT TRANSIT — the line: the Ancients' deep line (the Rift line's kind)  [G data]
// biomes/line/PLAN.md section 4. The Ancients' long bored line: a four-track gallery (37 m wide, 14 m to its vault) with its walkway, access road
// and central strip, in forms (the gallery, twin bores, a junction cavern, the shallow cut-and-cover, open and elevated runs), its tracks' states in
// runs (built as the Ancients left it, kept by a loj, worn, blocked, cut, flooded), its lining in 20 m sections, crossovers, stations, refuge
// niches, shafts, branches, doors; the gaps and segments derived from the tracks (a gap where every track is cut); the trains as consists on a
// track's route and the riding hook's car pose. One record for the whole line; a page takes a window of it (KTRANSIT.lineWindow). Plain records on
// KRAND; 56c-tr-draw-line.js draws them. The path is 2D (KTRANSIT.path); the heights ride a 'given' profile by arc length (KTRANSIT.profile).
//
//   KTRANSIT.LINE_SEC                 the gallery's section: x0, x1 (lateral, side +1 east), spring, crown, lining, tracks [{id, off}], guide, strip,
//                                     walk, road, car, platformY, platformGap
//   KTRANSIT.lineCeil(S, lat)         the section's inner face over lat; KTRANSIT.lineProfile(S, n) -> [[lat, up, len]] west foot to east foot
//   KTRANSIT.line(o) -> LN
//     o.id ('line'), o.seed, o.pts [[x, y, z], ...] (the invert's centreline: 2 or more), o.ground (the host's surface; 0 if none), o.radius (the
//     path's fillet, 0), o.base (the chainage of s = 0, for ids and hashes: a window's), o.section (LINE_SEC), o.tracks [{id, off}], o.offAt(id, s)
//     (a track's lateral offset where it splays; null keeps off), o.state (the tracks' default, 'built'), o.cond [{s0, s1, track | '*', state,
//     depth}], o.forms [{s0, s1, kind}], o.lining [{s0, s1, state}], o.ruin (the sections' shares), o.crossovers [{s, a, b, len, dir, state}],
//     o.stations [{id, num, s, len, kind, state, name, platforms: [{track, side, s0, s1, w, y}]}], o.nicheStep (50), o.nicheSide (+1), o.shafts
//     [{s, side, off, r, depth, kind, state, hidden}], o.branches [{s, side, to, w}], o.doors [{s, kind}], o.veins(c0, c1) (the host's veins
//     between two chainages), o.furniture (true: the kit's benches, bins and signs on the platforms)
//     LN = {id, kind: 'line', seed, base, path, L, width, pavement: 0, sec, floorAt(s), deckAt (= floorAt), railAt(s), guideAt(s, track) ->
//           {s, x, y, z, yaw, lat}, axisAt(s), offAt(track, s), formAt(s), condAt(track, s), tracks: [{id, key, i, off}], cond: {track: [{id, s0,
//           s1, state, depth}]}, forms, sections: [{id, i, s0, s1, x0, z0, y0, x1, z1, y1, yaw, len, pitch, form, state}], crossovers, stations,
//           niches, shafts, branches, doors, veins, gaps: [{id, s0, s1, kind}], segments: [{id, s0, s1}], sinkholes, voids, pits (KTRANSIT.carved
//           reads them), origin {x, y, z, yaw}, toWorld(lat, up, along) -> [x, y, z], toLocal(x, y, z) -> [lat, up, along]}
//   KTRANSIT.lineWindow(LN, s0, s1)   the same record cut to [s0, s1] (its s from 0), ids and states the whole line's (the sections' copied by id),
//                                     what overlaps it kept (a station's platforms and furniture clipped to it), origin at s0
//   KTRANSIT.lineCarveH(LN, x, z)     the depression a host adds to its ground: the open form's cutting, a fallen shallow section's bowl, a shaft's
//                                     collar; KTRANSIT.lineCarved(LN) lists them {x, z, r} for a ground's refinement (the cutting a point every 16 m)
//   KTRANSIT.LINE_CONSIST8, KTRANSIT.lineConsist(spec, seed, variant), KTRANSIT.lineTrainLen(cars)   the trains (vehicles kit keys)
//   KTRANSIT.lineRoute(LN, track, s0, s1, step) -> {pts, cum, len, z0}; KTRANSIT.lineRouteAt(R, s) -> [x, y, z]   a track's guideway top
//   KTRANSIT.lineTrain(LN, o) -> Tn {id, track, route, cars, len, s, timeline, dir}; KTRANSIT.carPose(Tn, k, t) -> {x, y, z, yaw, pitch, roll, s,
//                                     front, rear}: car k's middle at s(t) - off_k, its bogies at +- b_k (the riding hook)
(function () {
  var T = KTRANSIT;
  function num(v, d) { return v == null ? d : v; }
  function fin(v) { return typeof v === 'number' && isFinite(v); }
  /* THE GALLERY'S SECTION (biomes/line PLAN.md section 3): lat across (side +1 east), up from the invert */
  T.LINE_SEC = { x0: -21, x1: 16, spring: 6, crown: 14, lining: 0.6,
    tracks: [{ id: 't1', off: 10.5 }, { id: 't2', off: 4.5 }, { id: 't3', off: -4.5 }, { id: 't4', off: -10.5 }],
    guide: { w: 2.8, h: 0.6, slot: 0.3 }, strip: { x0: -2.5, x1: 2.5, y: 0.3 }, walk: { x0: 13.6, x1: 16, y: 1.2 },
    road: { x0: -19.8, x1: -13.2, y: 0.2, lane: -16.5, barrier: [-13.2, -12.75], barrierH: 0.9, foot: [-21, -19.8], footY: 0.45 },
    car: { half: 1.8, h: 4.4, floor: 1.2, margin: 0.4 }, platformY: 1.8, platformGap: 0.1, wsplit: [0, 0.45, 2, 4], esplit: [3.4, 1.2, 0], key: 'gallery' };
  T.lineCeil = function (S, x) { var cx = (S.x0 + S.x1) / 2, h = (S.x1 - S.x0) / 2; if (x <= S.x0 || x >= S.x1) return S.spring; var u = (x - cx) / h; return S.spring + (S.crown - S.spring) * Math.sqrt(Math.max(0, 1 - u * u)); };
  T.lineProfile = function (S, n) {
    var P = [], cx = (S.x0 + S.x1) / 2, h = (S.x1 - S.x0) / 2, i, L = 0; n = n == null ? 36 : n;
    (S.wsplit || [0]).concat([S.spring]).forEach(function (y) { P.push([S.x0, y]); });
    for (i = 1; i < n; i++) { var a = Math.PI - i / n * Math.PI; P.push([cx + h * Math.cos(a), S.spring + (S.crown - S.spring) * Math.sin(a)]); }
    [S.spring].concat(S.esplit || [0]).forEach(function (y) { P.push([S.x1, y]); });
    return P.map(function (p, k) { if (k) L += Math.hypot(p[0] - P[k - 1][0], p[1] - P[k - 1][1]); return [p[0], p[1], L]; });
  };
  /* paint a run [s0, s1) with a state over a track's runs (later entries win) */
  function paint(runs, s0, s1, state, depth) {
    var out = [];
    runs.forEach(function (r) {
      if (r.s1 <= s0 || r.s0 >= s1) { out.push(r); return; }
      if (r.s0 < s0) out.push({ s0: r.s0, s1: s0, state: r.state, depth: r.depth });
      if (r.s1 > s1) out.push({ s0: s1, s1: r.s1, state: r.state, depth: r.depth });
    });
    out.push({ s0: Math.max(s0, runs[0].s0), s1: Math.min(s1, runs[runs.length - 1].s1), state: state, depth: depth == null ? 0 : depth });
    out.sort(function (a, b) { return a.s0 - b.s0; });
    var m = []; out.forEach(function (r) { if (r.s1 - r.s0 < 1e-9) return; var l = m[m.length - 1]; if (l && l.state === r.state && l.depth === r.depth && Math.abs(l.s1 - r.s0) < 1e-9) l.s1 = r.s1; else m.push(r); });
    return m;
  }
  var isCut = function (r) { return r.state === 'cut' || (r.state === 'flooded' && r.depth > 0.6); };
  T.line = function (o) {
    o = o || {};
    var pts = o.pts;
    if (!Array.isArray(pts) || pts.length < 2) throw new Error('KTRANSIT.line: o.pts needs two or more [x, y, z]');
    pts.forEach(function (p, i) { if (!Array.isArray(p) || !fin(p[0]) || !fin(p[1]) || !fin(p[2])) throw new Error('KTRANSIT.line: point ' + i + ' is not [x, y, z]'); });
    if (o.ground != null && typeof o.ground !== 'function') throw new Error('KTRANSIT.line: o.ground must be a function (x, z) -> y');
    var id = o.id == null ? 'line' : String(o.id), seed = o.seed == null ? T.idHash(id + '.line') : (o.seed >>> 0), base = num(o.base, 0), ground = o.ground == null ? function () { return 0; } : o.ground;
    var S = o.section == null ? T.LINE_SEC : o.section, P = T.path(pts.map(function (p) { return [p[0], p[2]]; }), { ground: ground, radius: num(o.radius, 0), step: num(o.step, 4) }), L = P.L;
    /* each point's chainage: the cumulative chord length of o.pts scaled to the path's length (exact with no fillet; never the nearest point,
       which on a line passing near itself, a spiral or a hairpin, would be the wrong pass) */
    var chord = [0]; for (var q = 1; q < pts.length; q++) chord.push(chord[q - 1] + Math.hypot(pts[q][0] - pts[q - 1][0], pts[q][2] - pts[q - 1][2]));
    var CL = chord[chord.length - 1], ys = pts.map(function (p, k) { return [CL > 0 ? chord[k] / CL * L : 0, p[1]]; });
    var Y = T.profile(P, { mode: 'given', ys: ys }), floorAt = Y.at;
    var tracks = (o.tracks == null ? S.tracks : o.tracks).map(function (t, i) { if (!t || t.id == null || !fin(t.off)) throw new Error('KTRANSIT.line: track ' + i + ' needs {id, off}'); return { id: String(t.id), key: id + '.' + t.id, i: i, off: t.off }; });
    var trackOf = function (t) { var tr = typeof t === 'number' ? tracks[t] : tracks.filter(function (q) { return q.id === t || q.key === t; })[0]; if (!tr) throw new Error('KTRANSIT.line ' + id + ': no track ' + t); return tr; };
    var offAt = function (t, s) { var tr = trackOf(t), v = o.offAt ? o.offAt(tr.id, s) : null; return v == null ? tr.off : v; };
    var LN = { id: id, kind: 'line', seed: seed, base: base, path: P, L: L, width: 2 * Math.max(-S.x0, S.x1), pavement: 0, knots: ys.map(function (y) { return y[0]; }), form: 0.1, sec: S, tracks: tracks, Y: Y, opts: o,
      floorAt: floorAt, deckAt: floorAt, railAt: function (s) { return floorAt(s) + S.guide.h; }, offAt: offAt,
      cond: {}, forms: [], sections: [], crossovers: [], stations: [], niches: [], shafts: [], branches: [], doors: [], veins: [], gaps: [], segments: [], sinkholes: [], voids: [], pits: [] };
    LN.guideAt = function (s, t) { var lat = offAt(t == null ? 0 : t, s), p = P.at(s); return { s: p.s, x: p.x + Math.cos(p.yaw) * lat, y: floorAt(s) + S.guide.h, z: p.z - Math.sin(p.yaw) * lat, yaw: p.yaw, lat: lat }; };
    LN.axisAt = function (s) { var p = P.at(s); return { s: p.s, x: p.x, y: floorAt(s) + S.spring, z: p.z, yaw: p.yaw }; };
    /* THE ORIGIN and the local frame: lat across (side +1), up, along the heading at s = 0 */
    var p0 = P.at(0), c0 = Math.cos(p0.yaw), s0n = Math.sin(p0.yaw);
    LN.origin = { x: p0.x, y: floorAt(0), z: p0.z, yaw: p0.yaw };
    LN.toWorld = function (lat, up, along) { return [p0.x + along * s0n + lat * c0, LN.origin.y + up, p0.z + along * c0 - lat * s0n]; };
    LN.toLocal = function (x, y, z) { var dx = x - p0.x, dz = z - p0.z; return [dx * c0 - dz * s0n, y - LN.origin.y, dx * s0n + dz * c0]; };
    /* THE FORMS */
    (o.forms == null ? [{ s0: 0, s1: L, kind: 'gallery' }] : o.forms).forEach(function (F, k) {
      if (T.LINE_FORMS.indexOf(F.kind) < 0) throw new Error('KTRANSIT.line ' + id + ': no form ' + F.kind);
      LN.forms.push({ id: num(F.id, id + '.f' + Math.round(base + F.s0)), s0: Math.max(0, F.s0), s1: Math.min(L, F.s1), kind: F.kind, w: num(F.w, LN.width), h: num(F.h, S.crown) }); });
    LN.formAt = function (s) { for (var i = LN.forms.length - 1; i >= 0; i--) if (s >= LN.forms[i].s0 && s <= LN.forms[i].s1) return LN.forms[i].kind; return 'gallery'; };
    /* THE TRACKS' STATES in runs: the default over the whole, then each entry painted in order */
    var def = num(o.state, 'built'); if (T.LINE_COND_STATES.indexOf(def) < 0) throw new Error('KTRANSIT.line ' + id + ': no state ' + def);
    tracks.forEach(function (tr) { LN.cond[tr.id] = [{ s0: 0, s1: L, state: def, depth: 0 }]; });
    (o.cond || []).forEach(function (c, k) {
      if (T.LINE_COND_STATES.indexOf(c.state) < 0) throw new Error('KTRANSIT.line ' + id + ': cond ' + k + ' has no state ' + c.state);
      var ids = c.track == null || c.track === '*' ? tracks.map(function (t) { return t.id; }) : [].concat(c.track).map(function (t) { return trackOf(t).id; });
      ids.forEach(function (tid) { LN.cond[tid] = paint(LN.cond[tid], Math.max(0, c.s0), Math.min(L, c.s1), c.state, c.depth); }); });
    tracks.forEach(function (tr) { LN.cond[tr.id].forEach(function (r) { r.id = tr.key + '.c' + Math.round(base + r.s0); }); });
    LN.condAt = function (t, s) { var R = LN.cond[trackOf(t).id]; for (var i = 0; i < R.length; i++) if (s >= R[i].s0 && s < R[i].s1) return R[i]; return R[R.length - 1]; };
    /* THE GAPS AND SEGMENTS (derived): every run boundary, each interval a gap where every track is cut (or flooded over 0.6 m) */
    var cuts = [0, L]; tracks.forEach(function (tr) { LN.cond[tr.id].forEach(function (r) { cuts.push(r.s0, r.s1); }); });
    cuts = cuts.sort(function (a, b) { return a - b; }).filter(function (v, i, A) { return !i || v - A[i - 1] > 1e-9; });
    var cur = null;
    for (var ci = 0; ci + 1 < cuts.length; ci++) {
      var a = cuts[ci], b = cuts[ci + 1], m = (a + b) / 2, all = tracks.every(function (tr) { return isCut(LN.condAt(tr.id, m)); }), kind = all ? 'gap' : 'seg';
      if (cur && cur.kind === kind) cur.s1 = b; else { if (cur) (cur.kind === 'gap' ? LN.gaps : LN.segments).push(cur); cur = { kind: kind, s0: a, s1: b }; } }
    if (cur) (cur.kind === 'gap' ? LN.gaps : LN.segments).push(cur);
    LN.gaps = LN.gaps.map(function (g) { var fl = tracks.every(function (tr) { return LN.condAt(tr.id, (g.s0 + g.s1) / 2).state === 'flooded'; }); return { id: id + '.g' + Math.round(base + g.s0), s0: g.s0, s1: g.s1, kind: fl ? 'flood' : 'fall' }; });
    LN.segments = LN.segments.map(function (g) { return { id: id + '.seg' + Math.round(base + g.s0), s0: g.s0, s1: g.s1 }; });
    var inGap = function (s) { return LN.gaps.some(function (g) { return s >= g.s0 && s < g.s1; }); };
    /* THE STATIONS (before the sections: a section in a station is intact) */
    var furnOn = o.furniture == null ? true : !!o.furniture;
    (o.stations || []).forEach(function (st, k) {
      if (!fin(st.s)) throw new Error('KTRANSIT.line ' + id + ': station ' + k + ' needs s');
      var state = num(st.state, 'built'); if (T.LINE_STATION_STATES.indexOf(state) < 0) throw new Error('KTRANSIT.line ' + id + ': station ' + k + ' has no state ' + state);
      var len = num(st.len, 460), sid = st.id == null ? id + '.st' + num(st.num, k) : st.id, S2 = { id: sid, num: num(st.num, k), name: num(st.name, ''), s: st.s, s0: st.s - len / 2, s1: st.s + len / 2, len: len, kind: num(st.kind, 'station'), state: state, platforms: [], furniture: [] };
      (st.platforms || []).forEach(function (pl, j) { var side = pl.side < 0 ? -1 : 1, tr = trackOf(pl.track);
        S2.platforms.push({ id: num(pl.id, sid + '.p' + j), track: tr.id, side: side, s0: num(pl.s0, S2.s0), s1: num(pl.s1, S2.s1), w: num(pl.w, 7), y: num(pl.y, S.platformY), edge: S.car.half + S.platformGap }); });
      if (st.furniture) S2.furniture = st.furniture.map(function (f) { var c = {}; for (var q in f) c[q] = f[q]; return c; });
      else if (furnOn) S2.platforms.forEach(function (pl, pi) { for (var q = 0, s = pl.s0 + 12; s < pl.s1 - 8; s += 30, q++) {
        var kind = ['tr_bench', 'tr_bin', 'tr_bench', 'tr_sign'][q % 4], pk = T.pick(KRAND.hash(seed, Math.round(base + S2.s), 52, pi * 64 + q), kind, state === 'built' ? 'intact' : null);
        var lat = offAt(pl.track, s) + pl.side * (pl.edge + pl.w - 1.4), w = P.at(s);
        S2.furniture.push({ kind: kind, state: pk.state, variant: pk.variant, seed: pk.seed, platform: pl.id, s: s, lat: lat, x: w.x + Math.cos(w.yaw) * lat, z: w.z - Math.sin(w.yaw) * lat, y: floorAt(s) + pl.y, yaw: w.yaw + (pl.side > 0 ? -Math.PI / 2 : Math.PI / 2) }); } });
      LN.stations.push(S2); });
    var inStation = function (s) { return LN.stations.some(function (st) { return s >= st.s0 && s <= st.s1; }); };
    /* THE SECTIONS on the whole line's 20 m grid (so a window's are the whole's): the lining given, else fallen where every track is cut,
       intact in a station, else by the shares */
    var sec = num(o.sectionLen, 20), ruin = T.shares(o.ruin == null ? T.RUIN.line : o.ruin, T.LINE_SECTION_STATES), lin = o.lining || [];
    for (var i = Math.floor(base / sec); i * sec < base + L - 1e-6; i++) {
      var sa = Math.max(0, i * sec - base), sb = Math.min(L, (i + 1) * sec - base); if (sb - sa < 1e-6) continue;
      var mid = (sa + sb) / 2, given = null; lin.forEach(function (l) { if (mid >= l.s0 && mid < l.s1) given = l.state; });
      if (o.sectionStates && o.sectionStates[id + '.t' + i] != null) given = o.sectionStates[id + '.t' + i];
      if (given != null && T.LINE_SECTION_STATES.indexOf(given) < 0) throw new Error('KTRANSIT.line ' + id + ': no lining state ' + given);
      var stt = given != null ? given : inGap(mid) ? 'fallen' : inStation(mid) ? 'intact' : ruin(T.u(seed, i, 40, 1)), pa = P.at(sa), pb = P.at(sb), ln = Math.hypot(pb.x - pa.x, pb.z - pa.z);
      LN.sections.push({ id: id + '.t' + i, i: i, s0: sa, s1: sb, x0: pa.x, z0: pa.z, y0: floorAt(sa), x1: pb.x, z1: pb.z, y1: floorAt(sb), yaw: Math.atan2(pb.x - pa.x, pb.z - pa.z), len: ln, pitch: Math.atan2(floorAt(sb) - floorAt(sa), ln), form: LN.formAt(mid), state: stt }); }
    /* THE CROSSOVERS */
    (o.crossovers || []).forEach(function (X, k) { var st = num(X.state, 'built'); if (T.CROSSOVER_STATES.indexOf(st) < 0) throw new Error('KTRANSIT.line ' + id + ': crossover ' + k + ' has no state ' + st);
      var len = num(X.len, 120); LN.crossovers.push({ id: num(X.id, id + '.x' + Math.round(base + X.s)), s: X.s, s0: X.s - len / 2, s1: X.s + len / 2, a: trackOf(X.a).id, b: trackOf(X.b).id, len: len, dir: num(X.dir, 1), state: st }); });
    /* THE REFUGE NICHES every nicheStep of chainage on one wall, in the gallery forms, out of stations and gaps */
    var nst = num(o.nicheStep, 50), nside = num(o.nicheSide, 1);
    if (nst > 0) for (var c = Math.ceil((base + 25) / nst) * nst - 25; c < base + L; c += nst) { var ns = c - base; if (ns < 0 || inStation(ns) || inGap(ns) || LN.formAt(ns) !== 'gallery') continue;
      LN.niches.push({ id: id + '.n' + Math.round(c), s: ns, side: nside, w: 1.2, h: 2.2, d: 1.2, y: S.walk.y }); }
    /* THE SHAFTS: their head on the host's ground, their foot in the vault */
    (o.shafts || []).forEach(function (H, k) { var side = H.side < 0 ? -1 : 1, off = num(H.off, side * (S.x1 - S.x0) / 2), p = P.at(H.s), x = p.x + Math.cos(p.yaw) * off, z = p.z - Math.sin(p.yaw) * off;
      LN.shafts.push({ id: num(H.id, id + '.sh' + Math.round(base + H.s)), s: H.s, side: side, off: off, x: x, z: z, top: ground(x, z), foot: floorAt(H.s) + S.crown, r: num(H.r, 3.5), kind: num(H.kind, 'air'), state: num(H.state, 'open'), hidden: !!H.hidden, road: H.road == null ? null : H.road }); });
    (o.branches || []).forEach(function (Bn, k) { LN.branches.push({ id: num(Bn.id, id + '.b' + Math.round(base + Bn.s)), s: Bn.s, side: Bn.side < 0 ? -1 : 1, to: num(Bn.to, ''), w: num(Bn.w, 8), h: num(Bn.h, 6) }); });
    (o.doors || []).forEach(function (D, k) { LN.doors.push({ id: num(D.id, id + '.d' + Math.round(base + D.s)), s: D.s, kind: num(D.kind, 'hot'), state: num(D.state, 'shut') }); });
    if (o.veins) LN.veins = (o.veins(base, base + L) || []).map(function (V, k) { var v = {}; for (var q in V) v[q] = V[q]; if (v.id == null) v.id = id + '.v' + k; if (v.c != null && v.s == null) v.s = v.c - base; return v; });
    /* the sinkholes over a fallen section of the shallow form (KTRANSIT.carved reads them, as the subway's) */
    LN.sections.forEach(function (Sc) { if (Sc.form !== 'shallow' || Sc.state !== 'fallen') return; var m2 = (Sc.s0 + Sc.s1) / 2, hp = P.at(m2);
      LN.sinkholes.push({ id: Sc.id + '.hole', x: hp.x, z: hp.z, r: (S.x1 - S.x0) / 2 + 4, depth: Math.max(0, hp.yG - floorAt(m2)) + 0.4, section: Sc.id }); });
    return LN;
  };
  /* THE WINDOW: the record cut to [s0, s1], its s from 0; the chainage carried in base, so ids and hashed states are the whole line's */
  T.lineWindow = function (LN, s0, s1) {
    if (!(s0 >= 0) || !(s1 <= LN.L + 1e-6) || !(s1 > s0)) throw new Error('KTRANSIT.lineWindow: [' + s0 + ', ' + s1 + '] is not inside [0, ' + LN.L + ']');
    var o = LN.opts, P = LN.path, pts = [], cuts = [s0, s1], WL = s1 - s0;
    /* the window's points: the path's corners, the profile's knots and every 50 m, so its path and its heights are the whole line's between them */
    P.seg.forEach(function (g) { if (g.s0 > s0 && g.s0 < s1) cuts.push(g.s0); });
    LN.knots.forEach(function (k) { if (k > s0 && k < s1) cuts.push(k); });
    for (var s = Math.ceil(s0 / 50) * 50; s < s1; s += 50) cuts.push(s);
    cuts.sort(function (a, b) { return a - b; }).forEach(function (s, i, A) { if (i && s - A[i - 1] < 1e-6) return; var p = P.at(s); pts.push([p.x, LN.floorAt(s), p.z]); });
    /* what the window keeps: a point inside it; a span overlapping it (a station, a crossover) with its true s and length */
    var inW = function (v) { return v >= s0 && v <= s1; }, over = function (a, b) { return b > s0 && a < s1; };
    var shift = function (e, keys) { var c = {}; for (var k in e) c[k] = e[k]; keys.forEach(function (k) { if (c[k] != null) c[k] -= s0; }); return c; };
    var clipRun = function (r) { var c = shift(r, ['s0', 's1']); c.s0 = Math.max(0, c.s0); c.s1 = Math.min(WL, c.s1); return c; };
    var cond = []; LN.tracks.forEach(function (tr) { LN.cond[tr.id].forEach(function (r) { if (over(r.s0, r.s1)) cond.push({ s0: Math.max(s0, r.s0) - s0, s1: Math.min(s1, r.s1) - s0, track: tr.id, state: r.state, depth: r.depth }); }); });
    /* the sections' states are the whole line's by id: the window is the whole by construction, not by deriving it again */
    var states = {}; LN.sections.forEach(function (Sc) { if (over(Sc.s0, Sc.s1)) states[Sc.id] = Sc.state; });
    var W = T.line({ id: LN.id, seed: LN.seed, base: LN.base + s0, pts: pts, ground: P.ground, radius: 0, section: LN.sec, tracks: LN.tracks.map(function (t) { return { id: t.id, off: t.off }; }),
      offAt: o.offAt ? function (tid, s) { return o.offAt(tid, s + s0); } : null, state: o.state, cond: cond, forms: LN.forms.filter(function (F) { return over(F.s0, F.s1); }).map(clipRun),
      sectionStates: states, ruin: o.ruin, sectionLen: o.sectionLen,
      crossovers: LN.crossovers.filter(function (X) { return over(X.s0, X.s1); }).map(function (X) { return { id: X.id, s: X.s - s0, a: X.a, b: X.b, len: X.len, dir: X.dir, state: X.state }; }),
      stations: LN.stations.filter(function (st) { return over(st.s0, st.s1); }).map(function (st) {
        return { id: st.id, num: st.num, name: st.name, s: st.s - s0, len: st.len, kind: st.kind, state: st.state,
          platforms: st.platforms.filter(function (pl) { return over(pl.s0, pl.s1); }).map(clipRun),
          furniture: st.furniture.filter(function (f) { return inW(f.s); }).map(function (f) { return shift(f, ['s']); }) }; }),
      nicheStep: o.nicheStep, nicheSide: o.nicheSide, furniture: o.furniture,
      shafts: LN.shafts.filter(function (H) { return inW(H.s); }).map(function (H) { return { id: H.id, s: H.s - s0, side: H.side, off: H.off, r: H.r, kind: H.kind, state: H.state, hidden: H.hidden, road: H.road }; }),
      branches: LN.branches.filter(function (Bn) { return inW(Bn.s); }).map(function (Bn) { return shift(Bn, ['s']); }),
      doors: LN.doors.filter(function (D) { return inW(D.s); }).map(function (D) { return shift(D, ['s']); }), veins: o.veins });
    /* a run, a gap or a segment the window cut short keeps the whole line's id (the one its middle lies in) */
    var idIn = function (list, m) { for (var i = 0; i < list.length; i++) if (m >= list[i].s0 && m <= list[i].s1) return list[i].id; return null; };
    W.tracks.forEach(function (tr) { W.cond[tr.id].forEach(function (r) { var v = idIn(LN.cond[tr.id], (r.s0 + r.s1) / 2 + s0); if (v) r.id = v; }); });
    W.gaps.forEach(function (g) { var v = idIn(LN.gaps, (g.s0 + g.s1) / 2 + s0); if (v) g.id = v; });
    W.segments.forEach(function (g) { var v = idIn(LN.segments, (g.s0 + g.s1) / 2 + s0); if (v) g.id = v; });
    W.window = { of: LN.id, s0: s0, s1: s1 };
    return W;
  };
  /* THE CARVING: the open form's cutting (KTRANSIT.lineH over its spans), a fallen shallow section's bowl (KTRANSIT.sinkholeH), a shaft's collar
     (a pit 3 m deep, its wall a metre wide) */
  T.lineCarveH = function (LN, x, z) {
    var h = T.sinkholeH(LN, x, z);
    if (LN.forms.some(function (F) { return F.kind === 'open'; }) && LN.path.near(x, z, LN.width + 40)) { var pr = LN.path.project(x, z); if (LN.formAt(pr.s) === 'open') { var v = T.lineH(LN, x, z, { form: 0.2, half: Math.max(-LN.sec.x0, LN.sec.x1) + 1 }); if (v < h) h = v; } }
    for (var i = 0; i < LN.shafts.length; i++) { var Hs = LN.shafts[i], d = Math.hypot(x - Hs.x, z - Hs.z); if (d < Hs.r + 1) { var dv = d < Hs.r ? -3 : -3 * (Hs.r + 1 - d); if (dv < h) h = dv; } }
    return h;
  };
  T.lineCarved = function (LN) {
    var out = T.carved(LN).concat(LN.shafts.map(function (H) { return { x: H.x, z: H.z, r: H.r + 2 }; })), half = Math.max(-LN.sec.x0, LN.sec.x1) + 1;
    /* the open form's cutting: a point every 16 m, r the half width, twice the cut's depth (its slopes at 1 : 2) and 5 m more */
    LN.forms.forEach(function (F) { if (F.kind !== 'open') return; for (var s = F.s0; s <= F.s1 + 1e-6; s += 16) { var p = LN.path.at(s), dep = Math.max(0, p.yG - LN.floorAt(s)); out.push({ x: p.x, z: p.z, r: half + 2 * dep + 5 }); } });
    return out;
  };
  /* THE TRAINS (biomes/line PLAN.md section 7): two power cars and six between, the rear power car turned; [key, length, bogie half-spacing, flip] */
  T.LINE_CONSIST8 = [['anc_line_power', 22, 7.5, false], ['anc_line_saloon', 24, 8.5, false], ['anc_line_saloon', 24, 8.5, false], ['anc_line_crew', 24, 8.5, false],
    ['anc_line_van', 24, 8.5, false], ['anc_line_van', 24, 8.5, false], ['anc_line_tank', 22, 7.5, false], ['anc_line_power', 22, 7.5, true]];
  T.LINE_GAP = 1.0;
  T.lineConsist = function (spec, seed, variant) { var off = 0; return (spec == null ? T.LINE_CONSIST8 : spec).map(function (c, k) { var r = { k: k, key: c[0], variant: variant == null ? 1 : variant, seed: KRAND.child(seed >>> 0, 'car.' + k) >>> 0, len: c[1], b: c[2], flip: !!c[3], off: off + c[1] / 2 }; off += c[1] + T.LINE_GAP; return r; }); };
  T.lineTrainLen = function (cars) { var c = cars[cars.length - 1]; return c.off + c.len / 2; };
  /* a track's guideway top from s0 to s1 every step: pts in the world, cum the plan arc length, z0 the s it starts at */
  T.lineRoute = function (LN, t, s0, s1, step) {
    step = step == null ? 4 : step; s0 = s0 == null ? 0 : s0; s1 = s1 == null ? LN.L : s1;
    var pts = [], cum = [], L = 0, prev = null, n = Math.max(1, Math.ceil((s1 - s0) / step));
    for (var i = 0; i <= n; i++) { var g = LN.guideAt(s0 + (s1 - s0) * i / n, t), p = [g.x, g.y, g.z]; if (prev) L += Math.hypot(p[0] - prev[0], p[2] - prev[2]); pts.push(p); cum.push(L); prev = p; }
    return { pts: pts, cum: cum, len: L, z0: s0, track: t };
  };
  T.lineRouteAt = function (R, s) {
    var t = Math.max(0, Math.min(R.len, s - R.z0)), lo = 0, hi = R.cum.length - 1;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (R.cum[m] <= t) lo = m; else hi = m; }
    var a = R.pts[lo], b = R.pts[hi], dc = R.cum[hi] - R.cum[lo], d = dc > 0 ? dc : 1, u = (t - R.cum[lo]) / d;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
  };
  /* a train on a track: o.track, o.id, o.seed, o.variant (1: kept), o.spec (a consist), o.s (its front, standing) or o.timeline (anything with
     at(t).value: the front by time, a KSCHED timeline), o.dir, o.route (else the track's whole route) */
  T.lineTrain = function (LN, o) {
    o = o || {}; var track = o.track == null ? LN.tracks[0].id : o.track, seed = o.seed == null ? T.idHash(LN.id + '.train.' + track) : (o.seed >>> 0), cars = T.lineConsist(o.spec, seed, o.variant);
    return { id: o.id == null ? LN.id + '.train.' + track : String(o.id), track: track, route: o.route == null ? T.lineRoute(LN, track) : o.route, cars: cars, len: T.lineTrainLen(cars), s: o.s == null ? null : o.s, timeline: o.timeline == null ? null : o.timeline, dir: o.dir == null ? 1 : o.dir };
  };
  T.carPose = function (Tn, k, t) {
    if (!Tn.timeline && Tn.s == null) throw new Error('KTRANSIT.carPose: train ' + Tn.id + ' has neither s nor a timeline');
    var c = Tn.cars[k], s = (Tn.timeline ? Tn.timeline.at(t).value : Tn.s) - c.off, f = T.lineRouteAt(Tn.route, s + c.b), r = T.lineRouteAt(Tn.route, s - c.b);
    var dx = f[0] - r[0], dy = f[1] - r[1], dz = f[2] - r[2], hp = Math.hypot(dx, dz), h = hp > 0 ? hp : 1;
    return { x: (f[0] + r[0]) / 2, y: (f[1] + r[1]) / 2, z: (f[2] + r[2]) / 2, yaw: Math.atan2(dx, dz) + (c.flip ? Math.PI : 0), pitch: Math.atan2(dy, h), roll: 0, s: s, front: f, rear: r };
  };
})();
