/* ==================== core/hamlet 36: a terraced village down a slope (plain data, [G data]) ==================== */
/* Masuleh's rule (kits/coyote/PLAN.md section 8, amendment 2; the owner, 2026-11-16: "both", here now and on core/city
   at Coyote Canyon's size later): houses in rows along a slope's contours, each row one storey above the row below, so
   the roofs of a row are the lane of the row above; cut stairs between the rows. For the Tierhounds' terrace villages and
   stepped streets, and any culture whose row names `terrace`. Opt-in: nothing here changes KHAMLET.village,
   KHAMLET.platform or a row they read. No three.js, no DOM, no random draw of its own beyond KHAMLET.program's (one
   core/rand stream per village, from the world, the id and a salt); the footprints are filed in core/space.

   KHAMLET.terrace(spec) -> {id, culture, focus, kind 'terrace', census, site {x, z, foot, top, rows, step, depth, width},
                             frame {u (along the contour), v (uphill)}, rows [{k, y, t0, t1}], lanes, records, stairs,
                             paths, pendingKeys, error?}
   spec: the village's id, world, culture (a name or a row; an unknown name gets the pending row), focus (default farming),
         popMax, dims(key), link {x, z} (the way in: the foot street's path runs to it) and
     slope {origin [x, z] (the foot of the slope at the village's middle), up [x, z] (uphill, horizontal), width (m along
            the contour), foot (y of the foot street; default spec.ground.h at the origin, else 0), length? (m uphill the
            rows may take: more rows than fit is an error)}
   The rule, on the frame (s along the contour, t uphill from the origin):
     rows      row k is the band t in [k D, (k + 1) D] (D = terrace.depth), its floor y_k = foot + k step (terrace.step);
               every record in it has its back against the hill (t = (k + 1) D) and its roof at y_k + step = y_(k+1), the
               floor of row k + 1: the lane of row k + 1 is row k's roofs. A row is filled across the whole width: a gap
               no building takes is a terrace garden (terrace.wall: a riser of earth and stone whose top is the lane).
     stairs    columns of cut stairs every terrace.every m along the contour, terrace.stairW wide, through every band: a
               flight from the lane in front of row k (y_k) to a landing at y_(k+1) against the hill, terrace.landing m
               long, flush with row k's roofs on both sides; the next band's flight starts there.
     lanes     {id, kind 'lane', level k, y, t0, t1, s0, s1, cuts [[s0, s1]...] (the stair columns), pts}: level 0 the foot
               street (t in [-terrace.street, 0]), level k >= 1 row k - 1's roofs. A house in row k opens its door
               ({x, z, y}) onto lane k. Every stair joins lane k to lane k + 1 (from, to: lane ids), so a host or a test
               walks the village.
     the fill  the program (KHAMLET.program) less the works: the headman's house in the top row at its middle, then the
               middling houses, the poor, the services, filled from the top row down and each row from the middle out;
               a building whose roof is not one storey up (dims h other than step: it would hole the lane above or
               stand in it) or deeper than a band stands at the foot instead, as the works do: below the foot street,
               facing it, within the focus's reach.
   Records: {id, key, role, x, z, y, ry, w, d, h, pending, village, focus} plus row, door and household on houses, tier
   ('head' | 'middling' | 'poor'), from and to on stairs, below on the foot's records. Ids follow the program
   (spec.id + ':' + index); the stairs are spec.id + ':stair:' + k + ':' + c and the gardens spec.id + ':garden:' + k
   + ':' + n, so a record keeps its id wherever the village stands.

   A row names terrace {step, depth, stairW, landing, every, street, stair (key), wall (key)}; KHAMLET.terraceRow(row)
   fills what it leaves out, with pending boxes for the keys. */
(function () {
  'use strict';
  var H = KHAMLET;
  H.TERRACE_TUNE = {
    step: 3.2,          /* a storey: the floor of one row to the floor of the next */
    depth: 6,           /* a row's band uphill */
    stairW: 2.4,        /* a stair column's width */
    landing: 1.6,       /* the landing at a flight's head, flush with the row's roofs */
    every: 24,          /* the stair columns' spacing along the contour */
    street: 4,          /* the foot street's width */
    pad: 1.5,           /* clearance between the foot's footprints */
    reach: 400          /* the foot's works' farthest from the foot street's middle when the row gives no reach */
  };

  H.terraceRow = function (row0, name) {
    var row = H.platformRow(row0, name), T = H.TERRACE_TUNE, n = row.kit || name, tr = Object.assign({}, row.terrace || {}), P = {};
    ['step', 'depth', 'stairW', 'landing', 'every', 'street'].forEach(function (k) { if (tr[k] == null) tr[k] = T[k]; });
    if (!tr.stair) { tr.stair = n + '-stair-lane'; P[tr.stair] = {w: tr.stairW, d: tr.depth, h: tr.step, what: 'a cut stair between two rows'}; }
    if (!tr.wall) { tr.wall = n + '-terrace-wall'; P[tr.wall] = {w: 4, d: tr.depth, h: tr.step, what: 'a terrace garden: its riser, its top the lane'}; }
    var out = {}; Object.keys(row).forEach(function (k) { out[k] = row[k]; });
    out.terrace = tr; out.pending = Object.assign({}, row.pending || {}, P);
    return out;
  };

  var mm = function (v) { return Math.round(v * 1000); };

  H.terrace = function (spec) {
    var row0 = H.row(spec.culture), name = typeof spec.culture === 'string' ? spec.culture : (row0 && row0.kit) || 'terrace';
    var row = H.terraceRow(row0, name), TR = row.terrace, T = H.TERRACE_TUNE, K = KRAND;
    var focus = spec.focus == null ? 'farming' : spec.focus, fail = [];
    var bad = function (msg, extra) { return Object.assign({id: spec.id, culture: row.kit, focus: focus, kind: 'terrace', error: msg, records: [], stairs: [], lanes: [], paths: []}, extra || {}); };
    if (H.FOCI.indexOf(focus) < 0) return bad('no focus ' + focus);
    if (!row.works || !row.works[focus] || (row.focusJobs[focus] == null && !(spec.resource && spec.resource.workers != null))) return bad('the row ' + row.kit + ' has no works for ' + focus);
    var SL = spec.slope;
    if (!SL || !SL.origin || !SL.up || !(SL.width > 0)) return bad('a terrace needs a slope {origin, up, width}');
    var L = Math.hypot(SL.up[0], SL.up[1]);
    if (!(L > 0)) return bad('the slope has no uphill direction');
    var v = [SL.up[0] / L, SL.up[1] / L], u = [v[1], -v[0]], O = SL.origin, W = +SL.width;
    var step = +TR.step, D = +TR.depth, SW = +TR.stairW, LAND = +TR.landing;
    if (!(LAND < D)) return bad('the landing is as deep as the band');
    var foot = SL.foot != null ? +SL.foot : spec.ground && spec.ground.h ? +spec.ground.h(O[0], O[1]) : 0;
    var C = H.census(Object.assign({}, spec, {focus: focus}), row);
    var seed = K.hash(K.child(spec.world >>> 0, 'hamlet-terrace'), H.idHash(spec.id)), st = K.stream(K.hash(seed, 1, 0));
    var prog = H.program(C, row, st);
    var pend = function (key) { return !!(row.pending && row.pending[key] && !(spec.dims && spec.dims(key))); };
    var at = function (s, t) { return [O[0] + u[0] * s + v[0] * t, O[1] + u[1] * s + v[1] * t]; };
    var ryDown = Math.atan2(-v[0], -v[1]), ryUp = Math.atan2(v[0], v[1]);
    /* a pending key's box is cut to the band: a stand-in draws as a storey */
    var boxOf = function (key) { var b = H.box(spec, row, key); return pend(key) ? {w: b.w, d: Math.min(b.d, D), h: step} : b; };
    var tierOf = function (p) {
      if (p.role !== 'house') return null;
      if (p.head) return 'head';
      var hs = row.houses || {}, inL = function (l) { return (l || []).some(function (h) { return h[0] === p.key; }); };
      return inL(hs.middling) && !inL(hs.poor) ? 'middling' : 'poor';
    };

    /* ---- what goes in the rows (a roof one storey up, a band deep at most) and what stands at the foot */
    var inRow = [], atFoot = [];
    prog.forEach(function (p, idx) {
      var b = boxOf(p.key), q = {p: p, idx: idx, b: b, tier: tierOf(p)};
      if (p.role === 'works' || Math.abs(b.h - step) > 0.05 || b.d > D + 0.05) atFoot.push(q); else inRow.push(q);
    });
    var rank = {head: 0, middling: 1, poor: 2};
    inRow.sort(function (a, b) {
      var ra = a.tier ? rank[a.tier] : 3, rb = b.tier ? rank[b.tier] : 3;
      return (ra - rb) || a.idx - b.idx;
    });

    /* ---- the stair columns and the segments between them, ordered from the middle out */
    var nc = Math.max(1, Math.floor(W / TR.every)), cols = [];
    for (var c = 0; c < nc; c++) cols.push(-W / 2 + (c + 0.5) * W / nc);
    var segs = [], prev = -W / 2;
    cols.forEach(function (sc) { segs.push([prev, sc - SW / 2]); prev = sc + SW / 2; });
    segs.push([prev, W / 2]);
    segs = segs.filter(function (g) { return g[1] - g[0] > 1e-6; });
    var order = segs.map(function (g, i) { return {g: g, i: i, m: (g[0] + g[1]) / 2}; })
      .sort(function (a, b) { return (mm(Math.abs(a.m)) - mm(Math.abs(b.m))) || mm(a.m) - mm(b.m); });
    var widest = Math.max.apply(null, segs.map(function (g) { return g[1] - g[0]; }));
    for (var r0 = inRow.length - 1; r0 >= 0; r0--) if (inRow[r0].b.w > widest + 1e-6) atFoot.push(inRow.splice(r0, 1)[0]);

    /* ---- the fill: a row's segments from the middle out, each segment from its inner end out; a leftover is a garden */
    var fillRow = function (queue) {
      var placed = [];
      order.forEach(function (o) {
        var g = o.g, inward = o.m <= 0 ? -1 : 1;   /* fill from the end nearer the middle */
        var cur = inward < 0 ? g[1] : g[0], room = g[1] - g[0];
        while (queue.length && queue[0].b.w <= room + 1e-6) {
          var q = queue.shift(), s0 = inward < 0 ? cur - q.b.w : cur, s1 = s0 + q.b.w;
          placed.push({q: q, s0: s0, s1: s1}); room -= q.b.w; cur = inward < 0 ? s0 : s1;
        }
        var lo = inward < 0 ? g[0] : cur, hi = inward < 0 ? cur : g[1];
        if (hi - lo > 1e-6) placed.push({garden: true, s0: lo, s1: hi});
      });
      return placed;
    };
    var plan = function (n) {
      var queue = inRow.slice(), rows = [];
      for (var k = n - 1; k >= 0; k--) rows[k] = fillRow(queue);
      return queue.length ? null : rows;
    };
    var usable = segs.reduce(function (a, g) { return a + g[1] - g[0]; }, 0);
    var need = inRow.reduce(function (a, q) { return a + q.b.w; }, 0);
    var nRows = Math.max(1, Math.ceil(need / usable)), rowsPlan = null;
    while (!(rowsPlan = plan(nRows)) && nRows < 64) nRows++;
    if (!rowsPlan) return bad('the rows cannot hold the village', {census: C});
    if (SL.length != null && nRows * D > SL.length + 1e-6) fail.push('the slope is too short: ' + nRows + ' rows need ' + (nRows * D) + ' m');

    /* ---- records in the rows; a gap no building takes is a garden, however narrow (a thin one is a thick party wall) */
    var recs = [], gardens = [], space = KSPACE.create({cell: 24});
    var hold = function (R) { space.insert({R: R}, R.x, R.z, H.rectR(R)); };
    var hits = function (R, pad) { return space.some(R.x, R.z, H.rectR(R) + 60, function (it) { return H.overlap(R, it.R, pad); }); };
    rowsPlan.forEach(function (placed, k) {
      var y = foot + k * step;
      placed.forEach(function (pl, n) {
        if (pl.garden) {
          var gw = pl.s1 - pl.s0, gc = at((pl.s0 + pl.s1) / 2, k * D + D / 2), R0 = H.rect(gc[0], gc[1], u[0], u[1], gw, D);
          var gr = {id: spec.id + ':garden:' + k + ':' + gardens.length, key: TR.wall, role: 'garden', x: gc[0], z: gc[1], y: y, ry: ryDown,
                    w: gw, d: D, h: step, row: k, pending: pend(TR.wall), village: spec.id, focus: focus};
          gardens.push(gr); hold(R0); return;
        }
        var q = pl.q, b = q.b, tc = k * D + D - b.d / 2, c2 = at((pl.s0 + pl.s1) / 2, tc);
        var rec = {id: spec.id + ':' + q.idx, key: q.p.key, role: q.p.role, x: c2[0], z: c2[1], y: y, ry: ryDown, w: b.w, d: b.d, h: b.h,
                   row: k, pending: pend(q.p.key), village: spec.id, focus: focus};
        if (q.tier) rec.tier = q.tier;
        if (q.p.role === 'house') {
          rec.household = spec.id + ':h' + q.idx; rec.households = q.p.households == null ? 1 : q.p.households;
          var dp = at((pl.s0 + pl.s1) / 2, k * D + D - b.d); rec.door = {x: dp[0], z: dp[1], y: y};
        }
        recs[q.idx] = rec; hold(H.rect(c2[0], c2[1], u[0], u[1], b.w, b.d));
      });
    });

    /* ---- the stairs: one a band in every column, from lane k to lane k + 1 */
    var stairs = [];
    for (var k2 = 0; k2 < nRows; k2++) cols.forEach(function (sc, ci) {
      var c3 = at(sc, k2 * D + D / 2);
      stairs.push({id: spec.id + ':stair:' + k2 + ':' + ci, key: TR.stair, role: 'stair', x: c3[0], z: c3[1], y: foot + k2 * step, ry: ryDown,
                   w: SW, d: D, h: step, landing: LAND, row: k2, from: spec.id + ':lane:' + k2, to: spec.id + ':lane:' + (k2 + 1),
                   pending: pend(TR.stair), village: spec.id, focus: focus});
      hold(H.rect(c3[0], c3[1], u[0], u[1], SW, D));
    });

    /* ---- the lanes: the foot street, then each row's roofs */
    var cuts = cols.map(function (sc) { return [sc - SW / 2, sc + SW / 2]; });
    var lanes = [], rows = [];
    for (var lv = 0; lv <= nRows; lv++) {
      var t0 = lv === 0 ? -TR.street : (lv - 1) * D, t1 = lv === 0 ? 0 : lv * D;
      lanes.push({id: spec.id + ':lane:' + lv, kind: 'lane', level: lv, y: foot + lv * step, t0: t0, t1: t1, s0: -W / 2, s1: W / 2,
                  cuts: lv === 0 ? [] : cuts, pts: [at(-W / 2, t0), at(W / 2, t0), at(W / 2, t1), at(-W / 2, t1)]});
      if (lv < nRows) rows.push({k: lv, y: foot + lv * step, t0: lv * D, t1: (lv + 1) * D});
    }

    /* ---- the foot: the tall buildings and the works below the foot street, facing it, from the middle out */
    var reachW = row.reach && row.reach[focus] != null ? row.reach[focus] : T.reach, hub = at(0, -TR.street / 2);
    atFoot.sort(function (a, b) { return (a.p.role === 'works') - (b.p.role === 'works') || a.idx - b.idx; });
    var slots = [];
    for (var ring = 0; ring < 12; ring++) for (var si = 0; si <= 40; si++) slots.push({ring: ring, s: (si % 2 ? 1 : -1) * Math.ceil(si / 2) * 6});
    /* nearest the foot street's middle first: the foot fills round the way up, not along the whole contour */
    slots.sort(function (a, b) { return (mm(Math.hypot(a.s, a.ring * 16)) - mm(Math.hypot(b.s, b.ring * 16))) || a.ring - b.ring || a.s - b.s; });
    atFoot.forEach(function (q) {
      var b = q.b, ok = null;
      for (var j = 0; j < slots.length && !ok; j++) {
        var sl = slots[j], t = -TR.street - T.pad - b.d / 2 - sl.ring * 16, c4 = at(sl.s, t);
        if (Math.hypot(c4[0] - hub[0], c4[1] - hub[1]) > reachW) continue;
        var R = H.rect(c4[0], c4[1], u[0], u[1], b.w, b.d);
        if (hits(R, T.pad)) continue;
        hold(R); ok = true;
        recs[q.idx] = {id: spec.id + ':' + q.idx, key: q.p.key, role: q.p.role, x: c4[0], z: c4[1], y: foot, ry: ryUp, w: b.w, d: b.d, h: b.h,
                       below: true, pending: pend(q.p.key), village: spec.id, focus: focus};
        if (q.tier) recs[q.idx].tier = q.tier;
        if (q.p.role === 'house') { recs[q.idx].household = spec.id + ':h' + q.idx; recs[q.idx].households = q.p.households == null ? 1 : q.p.households; }
      }
      if (!ok) fail.push(q.p.key);
    });

    var paths = [];
    if (spec.link) paths.push({id: spec.id + ':path:0', kind: 'path', from: spec.id + ':lane:0', to: 'link', pts: [hub, [spec.link.x, spec.link.z]]});
    var all = recs.filter(Boolean).concat(gardens, stairs);
    var pk = {}; all.forEach(function (r) { if (r.pending) pk[r.key] = true; });
    var out = {id: spec.id, culture: row.kit, focus: focus, kind: 'terrace', census: C,
               site: {x: O[0], z: O[1], foot: foot, top: foot + nRows * step, rows: nRows, step: step, depth: D, width: W},
               frame: {u: u, v: v}, rows: rows, lanes: lanes, records: recs.filter(Boolean).concat(gardens), stairs: stairs, paths: paths,
               pendingKeys: Object.keys(pk).sort()};
    if (recs.filter(Boolean).length !== prog.length) fail.push((prog.length - recs.filter(Boolean).length) + ' records unplaced');
    if (fail.length) out.error = 'could not place: ' + fail.join(', ');
    return out;
  };
})();
