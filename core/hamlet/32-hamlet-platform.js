/* ==================== core/hamlet 32: a defended platform village (plain data, [G data]) ==================== */
/* The Labyrinth's Kimr pueblos (biomes/labyrinth/PLAN.md section 5, amendment 4) and the Painted Men's cliff dwellings
   (biomes/paintedhighlands/PLAN.md section 5): a village raised on a plinth, a mesa bench or a ledge under an overhang,
   with no door at the ground and its pen below. Opt-in: nothing here changes KHAMLET.village or a row it reads.
   No three.js, no DOM; draws from core/rand (one stream per village, from the world, the id and a salt); the footprints
   below are filed in core/space.

   KHAMLET.platform(spec) -> {id, culture, focus, kind ('platform' | 'alcove'), census, site {x, z, top, foot}, frame
                              {u, v}, plaza {x, z, y, w, d, ry}, cells, records, ladders, paths, pen, court, outline,
                              pendingKeys, error?}
   spec: village's (id, world, culture (a name or a row; an unknown name gets KHAMLET.pendingRow), focus (default farming),
         popMax, dims(key), ground {ok(x, z), h?(x, z)}, resource, link {x, z}: the way in: the ladder and the court
         below face it) and one of
     plinth {pts [[x, z]...] (the top's outline), top (y), foot (y, or (x, z) -> y: the ground at the foot; default
             spec.ground.h, else 0), axis? [x, z] (the roomblocks' grid: default along the outline's longest edge)}
     alcove {line [[x, z]...] (the back wall under the overhang), depth (m out to the drip line), floor (y), height (m of
             clearance, or (x, z) -> m: caps the storeys; default 8), foot (y or (x, z) -> y: the ground below the lip),
             side (+1: open to the left of the line's direction, -1 to the right; default the link's side, else +1)}
   The layout:
     the roomblocks  a grid of cells, one room's box each (row.platform.room), packed against each other round a plaza (in
                     the middle of a plinth; along the drip line of an alcove). A cell's storeys are its ring out from the
                     plaza (1 by the plaza, 2 behind it, up to platform.storeys or the overhang's clearance): the terraces
                     step down to the plaza and the outer face is the tallest and blank. Ground rooms are entered by
                     hatches only (entry 'hatch'); an upper room opens a door ({x, z, y}) only onto the terrace in front of
                     it, a roof at its own floor. The stores (general, food, warehouse) take the ground rooms under the
                     tallest stacks; each household takes platform.roomsPer rooms (the headman's one more).
     the kivas       the religious (platform.kiva) and the civic (platform.greatKiva; an alcove's is a second kiva),
                     round and sunk: in the court below (platform.kivas 'court': the Kimr) or in the plaza ('plaza'; an
                     alcove always)
     ladders         {id, kind 'ladder', key, foot {x, y, z}, top {x, y, z}, rise, stages, from, to}: one from the foot onto
                     the rim or the nearest roof on the side toward the link, and one onto each terrace no ground at its
                     own level reaches. from and to are node ids ('foot', 'rim', 'c:i:j' a cell): cells holds every
                     cell {i, j, x, z, level (its roof's storeys; 0 the plaza or open ground), ring, plaza}, and cells at
                     one level that share a side are one walk, so a host or a test can walk the village
     below           the court (when the kivas are there), the pen and the focus's works at the foot outside the outline,
                     their gates toward the ladder; paths {id, kind 'path', from 'foot', to <record id>, pts}
   Records: {id, key, role, x, z, y, ry, w, d, h, pending, village, focus} plus storey, cell, ring, entry, door and
   household on rooms, sunk on kivas, gate on the court, the pen and the works, holds on the court. Ids follow the
   program (stores, rooms, kivas, court, pen, works), so a record keeps its id wherever the village stands.

   KHAMLET.pendingRow(name) is the row an unknown culture gets: every key pending, with a box. A Kimr or Painted Men row
   names the same fields: platform {room, store, kiva, greatKiva, court, pen, ladder, roomsPer, storeys, kivas}, trade
   {serai, stall, market, cistern, store} (34-hamlet-trade.js), and the village fields census reads (household,
   workShare, services, works, focusJobs, reach, houses, religious, civic, general, food, warehouse). A village row with
   no `platform` takes the pending platform keys under its kit's name (KHAMLET.platformRow). */
(function () {
  'use strict';
  var H = KHAMLET;
  H.PLATFORM_TUNE = {
    rim: 1.2,                 /* the parapet strip kept clear inside the outline */
    plazaPer: 20, plazaMin: 100,   /* the plaza's m2 a household, and its least */
    rimGap: 1.5,              /* a ladder lands straight on a roof that stands within this of the edge */
    ladderMax: 9,             /* the longest flight (m of rise): a taller climb is staged */
    lean: 0.25,               /* a ladder's run a metre of rise */
    footGap: 3,               /* the court's wall from the ladder's foot */
    pad: 1.5,                 /* clearance between footprints at the foot */
    sample: 4,                /* the outline's edge sampled every 4 m for the ladder and the court */
    reach: 400                /* the works' farthest from the court when the row gives no reach */
  };

  /* ---------------------------------------------------------------- the pending row */
  H.pendingRow = function (name) {
    var n = String(name), P = {};
    var box = function (key, w, d, h, what) { P[n + '-' + key] = {w: w, d: d, h: h, what: what}; return n + '-' + key; };
    var row = {kit: n, pendingRow: true, household: 5, workShare: 0.45, slopeMax: 0.3,
      religious: box('shrine', 8, 8, 5, 'a shrine'), civic: box('hall', 12, 9, 6, 'the headman\'s hall'),
      general: box('trader', 8, 6, 4.5, 'a trader\'s shop'), food: box('store-food', 7, 6, 4, 'a food store'),
      warehouse: box('warehouse', 12, 8, 5, 'a warehouse'),
      services: {religious: 2, civic: 2, general: 1, food: 2, warehouse: 2},
      houses: {poor: [[box('house-poor', 6, 5, 3.5, 'a poor house'), 1, 1]], middling: [[box('house-mid', 9, 7, 4.5, 'a middling house'), 2, 1]],
               head: [[box('house-head', 12, 9, 5, 'the headman\'s house'), 1, 1]], middlingShare: 0.35},
      works: {}, focusJobs: {}, reach: {}, pending: P,
      platform: {room: box('room', 5, 4, 2.6, 'a roomblock cell: one room a storey'), store: box('room-store', 5, 4, 2.6, 'a store room'),
                 kiva: box('kiva', 9, 9, 2.5, 'a kiva: round, sunk'), greatKiva: box('kiva-great', 13, 13, 3, 'the great kiva'),
                 court: box('court', 26, 18, 2.2, 'the walled court below'), pen: box('pen', 22, 16, 1.6, 'the walled pen below'),
                 ladder: box('ladder', 0.7, 0.4, 9, 'a pole ladder, pulled up at night'), roomsPer: 2, storeys: 3, kivas: 'court'},
      trade: {serai: box('serai', 40, 40, 6, 'a caravanserai: a walled court of stalls'), stall: box('stall', 3, 4, 3, 'a beast\'s stall'),
              market: box('market', 30, 22, 0.4, 'the market court'), cistern: box('cistern', 9, 9, 3, 'a cistern'),
              store: box('store', 10, 8, 5, 'a trade store')}};
    var W = {farming: [['field', 40, 30, 0.4, 'a walled field', 8, 0.8], ['granary', 8, 6, 4, 'a granary', 4, 0.2]],
             ranch: [['byre', 14, 9, 4, 'a byre', 6, 0.6], ['corral', 20, 20, 1.4, 'a corral', 4, 0.4]],
             fishing: [['fishdock', 12, 6, 3, 'a fish landing', 10, 1]], lumber: [['sawpit', 12, 8, 4, 'a sawpit', 12, 1]],
             salt: [['saltworks', 14, 10, 3, 'a saltworks', 12, 1]], mine: [['mine', 14, 12, 6, 'a mine head', 20, 1]],
             quarry: [['quarry', 16, 12, 4, 'a quarry face', 12, 1]]};
    Object.keys(W).forEach(function (f) {
      row.works[f] = W[f].map(function (w) { return {key: box(w[0], w[1], w[2], w[3], w[4]), jobs: w[5], share: w[6]}; });
      row.focusJobs[f] = f === 'farming' ? 40 : 30; row.reach[f] = 400;
    });
    return row;
  };
  /* a row with its platform and trade fields filled from the pending row under its kit's name (its own fields win) */
  H.platformRow = function (row, name) {
    if (!row) return H.pendingRow(name);
    if (row.pendingRow) return row;
    var base = H.pendingRow(row.kit || name), out = {};
    Object.keys(row).forEach(function (k) { out[k] = row[k]; });
    out.platform = Object.assign({}, base.platform, row.platform || {});
    out.trade = Object.assign({}, base.trade, row.trade || {});
    out.pending = Object.assign({}, base.pending, row.pending || {});
    return out;
  };

  /* ---------------------------------------------------------------- outline helpers */
  var inPoly = function (pts, x, z) {
    var c = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      if ((pts[i][1] > z) !== (pts[j][1] > z) && x < (pts[j][0] - pts[i][0]) * (z - pts[i][1]) / (pts[j][1] - pts[i][1]) + pts[i][0]) c = !c;
    }
    return c;
  };
  var area2 = function (pts) { var a = 0; for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) a += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]; return a; };
  var centroid = function (pts) {
    var a = 0, cx = 0, cz = 0;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var f = pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]; a += f; cx += (pts[j][0] + pts[i][0]) * f; cz += (pts[j][1] + pts[i][1]) * f;
    }
    return Math.abs(a) < 1e-9 ? [pts[0][0], pts[0][1]] : [cx / (3 * a), cz / (3 * a)];
  };
  var unit = function (x, z) { var L = Math.hypot(x, z) || 1; return [x / L, z / L]; };
  /* a sort key to the mm: a village moved across the world sorts its candidates the same */
  var mm = function (v) { return Math.round(v * 1000); };
  /* a pseudo-angle in [0, 4): monotonic in the angle, no library call (the fill order is the same in Godot) */
  var dia = function (x, z) { var s = Math.abs(x) + Math.abs(z); if (s === 0) return 0; var p = x / s; return z >= 0 ? 1 - p : 3 + p; };
  H.inPoly = inPoly;
  /* an oriented rectangle (KHAMLET.rect), grown by `grow`, wholly outside the outline */
  H.polyOutside = function (pts, R, grow) {
    var g = grow == null ? 0 : grow, S = H.rect(R.x, R.z, R.ux, R.uz, 2 * R.hw + 2 * g, 2 * R.hd + 2 * g), cs = H.corners(S);
    var smp = cs.concat([[S.x, S.z]]);
    for (var i = 0; i < 4; i++) smp.push([(cs[i][0] + cs[(i + 1) % 4][0]) / 2, (cs[i][1] + cs[(i + 1) % 4][1]) / 2]);
    for (var k = 0; k < smp.length; k++) if (inPoly(pts, smp[k][0], smp[k][1])) return false;
    var vx = -S.uz, vz = S.ux;
    for (var m = 0; m < pts.length; m++) {
      var dx = pts[m][0] - S.x, dz = pts[m][1] - S.z;
      if (Math.abs(dx * S.ux + dz * S.uz) < S.hw && Math.abs(dx * vx + dz * vz) < S.hd) return false;
    }
    return true;
  };
  var yAt = function (f, spec, x, z) {
    if (typeof f === 'number') return f;
    if (typeof f === 'function') return +f(x, z);
    if (spec.ground && typeof spec.ground.h === 'function') return +spec.ground.h(x, z);
    return 0;
  };
  /* an edge [a, b] with its outward normal (the side whose point just off the middle is outside the outline) */
  var edgeOf = function (pts, a, b) {
    var d = unit(b[0] - a[0], b[1] - a[1]), n = [d[1], -d[0]], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (inPoly(pts, m[0] + n[0] * 0.05, m[1] + n[1] * 0.05)) n = [-n[0], -n[1]];
    return {a: a, b: b, n: n};
  };

  /* the outline, its frame and the edges a ladder may climb */
  var plinthShape = function (pl) {
    if (!pl.pts || pl.pts.length < 3) return {error: 'a plinth needs an outline of three points or more'};
    if (!isFinite(pl.top)) return {error: 'a plinth needs its top (y)'};
    var pts = pl.pts.map(function (p) { return [+p[0], +p[1]]; });
    if (Math.abs(area2(pts)) < 1e-6) return {error: 'the plinth\'s outline has no area'};
    var ax = pl.axis, best = -1, edges = [];
    for (var i = 0; i < pts.length; i++) {
      var b = pts[(i + 1) % pts.length], L = Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]);
      if (!pl.axis && L > best + 1e-9) { best = L; ax = [b[0] - pts[i][0], b[1] - pts[i][1]]; }
      if (L > 1e-9) edges.push(edgeOf(pts, pts[i], b));
    }
    return {kind: 'platform', pts: pts, top: +pl.top, foot: pl.foot, u: unit(ax[0], ax[1]), edges: edges, height: null};
  };
  var alcoveShape = function (al, spec) {
    if (!al.line || al.line.length < 2) return {error: 'an alcove needs its back wall: a line of two points or more'};
    if (!(al.depth > 0)) return {error: 'an alcove needs a depth'};
    if (!isFinite(al.floor)) return {error: 'an alcove needs its floor (y)'};
    var line = al.line.map(function (p) { return [+p[0], +p[1]]; }), n = line.length;
    var chord = unit(line[n - 1][0] - line[0][0], line[n - 1][1] - line[0][1]), side = al.side;
    if (side == null) {
      side = 1;
      if (spec.link) { var m = line[Math.floor(n / 2)]; side = (-chord[1]) * (spec.link.x - m[0]) + chord[0] * (spec.link.z - m[1]) >= 0 ? 1 : -1; }
    }
    var nrm = line.map(function (p, i) {
      var a = line[Math.max(0, i - 1)], b = line[Math.min(n - 1, i + 1)], d = unit(b[0] - a[0], b[1] - a[1]);
      return [-d[1] * side, d[0] * side];
    });
    var front = line.map(function (p, i) { return [p[0] + nrm[i][0] * al.depth, p[1] + nrm[i][1] * al.depth]; });
    var pts = line.concat(front.slice().reverse()), edges = [];
    /* only the drip line is climbable: the back wall and the ends are rock */
    for (var e = 0; e + 1 < n; e++) edges.push(edgeOf(pts, front[e], front[e + 1]));
    var fu = unit(nrm.reduce(function (s, q) { return s + q[0]; }, 0), nrm.reduce(function (s, q) { return s + q[1]; }, 0));
    return {kind: 'alcove', pts: pts, top: +al.floor, foot: al.foot, u: fu, edges: edges, line: line, depth: +al.depth,
            height: al.height == null ? 8 : al.height};
  };
  var segDist = function (line, x, z) {
    var best = 1e18;
    for (var i = 0; i + 1 < line.length; i++) {
      var a = line[i], b = line[i + 1], ex = b[0] - a[0], ez = b[1] - a[1], L2 = ex * ex + ez * ez || 1;
      var t = Math.max(0, Math.min(1, ((x - a[0]) * ex + (z - a[1]) * ez) / L2));
      best = Math.min(best, Math.hypot(x - a[0] - ex * t, z - a[1] - ez * t));
    }
    return best;
  };

  /* ---------------------------------------------------------------- the village */
  H.platform = function (spec) {
    var row0 = H.row(spec.culture), name = typeof spec.culture === 'string' ? spec.culture : (row0 && row0.kit) || 'platform';
    var row = H.platformRow(row0, name), PF = row.platform, T = H.PLATFORM_TUNE, K = KRAND;
    var focus = spec.focus == null ? 'farming' : spec.focus, fail = [];
    var bad = function (msg, extra) { return Object.assign({id: spec.id, culture: row.kit, focus: focus, error: msg, records: [], ladders: [], paths: []}, extra || {}); };
    if (H.FOCI.indexOf(focus) < 0) return bad('no focus ' + focus);
    if (!row.works || !row.works[focus] || (row.focusJobs[focus] == null && !(spec.resource && spec.resource.workers != null))) return bad('the row ' + row.kit + ' has no works for ' + focus);
    var S = spec.alcove ? alcoveShape(spec.alcove, spec) : spec.plinth ? plinthShape(spec.plinth) : {error: 'a platform needs a plinth or an alcove'};
    if (S.error) return bad(S.error);
    var C = H.census(Object.assign({}, spec, {focus: focus}), row);
    var seed = K.hash(K.child(spec.world >>> 0, 'hamlet-platform'), H.idHash(spec.id)), st = K.stream(K.hash(seed, 1, 0));
    var pend = function (key) { return !!(row.pending && row.pending[key] && !(spec.dims && spec.dims(key))); };
    var boxOf = function (key) { return H.box(spec, row, key); };
    var footY = function (x, z) { return yAt(S.foot, spec, x, z); };

    /* ---- the program, in a fixed order: the ids follow it */
    var prog = [];
    prog.push({role: 'general', key: PF.store}); prog.push({role: 'food', key: PF.store});
    for (var wi = 0; wi < C.warehouses; wi++) prog.push({role: 'warehouse', key: PF.store});
    var nStores = prog.length;
    for (var hh = 0; hh < C.households; hh++) for (var rr = 0; rr < PF.roomsPer + (hh === 0 ? 1 : 0); rr++) prog.push({role: 'house', key: PF.room, household: spec.id + ':h' + hh, head: hh === 0});
    var nRooms = prog.length, kivaBelow = S.kind === 'platform' && PF.kivas !== 'plaza';
    prog.push({role: 'religious', key: PF.kiva}); prog.push({role: 'civic', key: S.kind === 'alcove' ? PF.kiva : PF.greatKiva});
    var kivaIdx = [nRooms, nRooms + 1], courtIdx = kivaBelow ? nRooms + 2 : -1, penIdx = kivaBelow ? nRooms + 3 : nRooms + 2;
    if (kivaBelow) prog.push({role: 'court', key: PF.court});
    prog.push({role: 'pen', key: PF.pen});
    C.works.forEach(function (w) { for (var j = 0; j < w.n; j++) prog.push({role: 'works', key: w.key}); });

    /* ---- the grid: cells of one room's box, on the outline's frame */
    var RB = boxOf(PF.room), cw = RB.w, cd = RB.d, HS = RB.h, KV = boxOf(PF.kiva);
    var gu = S.u, gv = [-gu[1], gu[0]], O = centroid(S.pts);
    var at = function (i, j) { return [O[0] + gv[0] * i * cw + gu[0] * j * cd, O[1] + gv[1] * i * cw + gu[1] * j * cd]; };
    var lo = [1e18, 1e18], hi = [-1e18, -1e18];
    S.pts.forEach(function (p) { var s = (p[0] - O[0]) * gv[0] + (p[1] - O[1]) * gv[1], t = (p[0] - O[0]) * gu[0] + (p[1] - O[1]) * gu[1];
      lo = [Math.min(lo[0], s), Math.min(lo[1], t)]; hi = [Math.max(hi[0], s), Math.max(hi[1], t)]; });
    var cellRect = function (i, j, g) { var c = at(i, j); return H.rect(c[0], c[1], gv[0], gv[1], cw + 2 * (g || 0), cd + 2 * (g || 0)); };
    var cellOk = function (i, j) {
      var R = cellRect(i, j, T.rim), cs = H.corners(R), smp = cs.concat([[R.x, R.z]]);
      for (var q = 0; q < 4; q++) smp.push([(cs[q][0] + cs[(q + 1) % 4][0]) / 2, (cs[q][1] + cs[(q + 1) % 4][1]) / 2]);
      for (var k = 0; k < smp.length; k++) if (!inPoly(S.pts, smp[k][0], smp[k][1])) return false;
      var vx = -R.uz, vz = R.ux;
      for (var m = 0; m < S.pts.length; m++) {
        var dx = S.pts[m][0] - R.x, dz = S.pts[m][1] - R.z;
        if (Math.abs(dx * R.ux + dz * R.uz) < R.hw && Math.abs(dx * vx + dz * vz) < R.hd) return false;
      }
      return true;
    };
    var cells = {}, key = function (i, j) { return i + ':' + j; }, list = [];
    var i0 = Math.floor(lo[0] / cw) - 1, i1 = Math.ceil(hi[0] / cw) + 1, j0 = Math.floor(lo[1] / cd) - 1, j1 = Math.ceil(hi[1] / cd) + 1;
    for (var ii = i0; ii <= i1; ii++) for (var jj = j0; jj <= j1; jj++) if (cellOk(ii, jj)) {
      var c = at(ii, jj), cap = PF.storeys;
      if (S.height != null) { var hgt = typeof S.height === 'function' ? +S.height(c[0], c[1]) : +S.height; cap = Math.min(cap, Math.floor(hgt / HS + 1e-9)); }
      var cell = {i: ii, j: jj, x: c[0], z: c[1], cap: cap, ring: -1, level: 0, plaza: false};
      cells[key(ii, jj)] = cell; list.push(cell);
    }
    if (!list.length) return bad('plinth too small: no room cell fits inside it', {census: C});

    /* ---- the plaza: a block of cells round the middle of a plinth; the cells along an alcove's drip line */
    var hhA = Math.max(T.plazaMin, C.households * T.plazaPer), plazaCells = [];
    if (S.kind === 'platform') {
      var pw = Math.max(1, Math.round(Math.sqrt(hhA) / cw)), pd = Math.max(1, Math.round(Math.sqrt(hhA) / cd));
      var byMid = list.slice().sort(function (a, b) { return (mm(Math.hypot(a.x - O[0], a.z - O[1])) - mm(Math.hypot(b.x - O[0], b.z - O[1]))) || a.i - b.i || a.j - b.j; });
      for (var sw = pw, sd = pd; !plazaCells.length && (sw >= 1 && sd >= 1); sw = Math.max(1, sw - 1), sd = Math.max(1, sd - 1)) {
        for (var ci = 0; ci < byMid.length && !plazaCells.length; ci++) {
          var a0 = byMid[ci].i - Math.floor((sw - 1) / 2), b0 = byMid[ci].j - Math.floor((sd - 1) / 2), blk = [];
          for (var pi = 0; pi < sw && blk; pi++) for (var pj = 0; pj < sd && blk; pj++) { var pc = cells[key(a0 + pi, b0 + pj)]; if (pc) blk.push(pc); else blk = null; }
          if (blk && blk.length) plazaCells = blk;
        }
        if (sw === 1 && sd === 1) break;
      }
    } else {
      var chordL = 0; for (var li = 0; li + 1 < S.line.length; li++) chordL += Math.hypot(S.line[li + 1][0] - S.line[li][0], S.line[li + 1][1] - S.line[li][1]);
      var pdep = Math.max(KV.d + cd, Math.min(S.depth * 0.45, hhA / Math.max(1, chordL)));
      plazaCells = list.filter(function (q) { return S.depth - segDist(S.line, q.x, q.z) < pdep; });
    }
    if (!plazaCells.length) return bad('plinth too small: no plaza fits on it', {census: C});
    plazaCells.forEach(function (q) { q.plaza = true; q.ring = 0; });

    /* ---- the rings: out from the plaza, cell by cell (eight ways), over the cells the plaza reaches (four ways) */
    var N4 = [[0, 1], [0, -1], [1, 0], [-1, 0]], N8 = N4.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    var reach4 = {}, qq = plazaCells.slice();
    qq.forEach(function (q) { reach4[key(q.i, q.j)] = true; });
    for (var h4 = 0; h4 < qq.length; h4++) N4.forEach(function (d) { var k2 = key(qq[h4].i + d[0], qq[h4].j + d[1]); if (cells[k2] && !reach4[k2]) { reach4[k2] = true; qq.push(cells[k2]); } });
    var fr = plazaCells.slice();
    for (var h8 = 0; h8 < fr.length; h8++) N8.forEach(function (d) { var n2 = cells[key(fr[h8].i + d[0], fr[h8].j + d[1])]; if (n2 && n2.ring < 0 && reach4[key(n2.i, n2.j)]) { n2.ring = fr[h8].ring + 1; fr.push(n2); } });
    var live = list.filter(function (q) { return q.ring >= 0; });

    /* ---- the fill: ring by ring, round the plaza from a seeded start; storeys = the ring (capped) */
    var pm = plazaCells.reduce(function (m, q) { return [m[0] + q.i / plazaCells.length, m[1] + q.j / plazaCells.length]; }, [0, 0]), a0s = st.next() * 4;
    var cand = live.filter(function (q) { return !q.plaza && q.cap >= 1; }).map(function (q) { return {q: q, a: (dia(q.i - pm[0], q.j - pm[1]) - a0s + 4) % 4}; });
    cand.sort(function (a, b) { return (a.q.ring - b.q.ring) || (a.a - b.a) || a.q.i - b.q.i || a.q.j - b.q.j; });
    var need = nRooms, have = 0, taken = [];
    for (var ki = 0; ki < cand.length && have < need; ki++) {
      var q2 = cand[ki].q, s2 = Math.min(q2.ring, q2.cap, need - have);
      q2.level = s2; have += s2; taken.push(q2);
    }
    if (have < need) return bad('plinth too small: it holds ' + have + ' rooms of the ' + need + ' the census needs', {census: C});

    /* ---- the rooms: slots stack by stack; the stores take the ground rooms under the tallest stacks */
    var top = S.top, recs = [], space = KSPACE.create({cell: 24});
    var hold = function (R) { space.insert({R: R}, R.x, R.z, H.rectR(R)); };
    var hits = function (R, pad) { return space.some(R.x, R.z, H.rectR(R) + 60, function (it) { return H.overlap(R, it.R, pad + 1e-4); }); };   /* a touch is a hit, wherever the village stands */
    var slots = [];
    taken.forEach(function (q, ti) { for (var s3 = 0; s3 < q.level; s3++) slots.push({q: q, s: s3, ti: ti}); });
    var storeSlots = slots.filter(function (sl) { return sl.s === 0; }).sort(function (a, b) { return (b.q.level - a.q.level) || a.ti - b.ti; }).slice(0, nStores);
    var homeSlots = slots.filter(function (sl) { return storeSlots.indexOf(sl) < 0; });
    var faceOf = function (q) {
      var best = null;
      N4.forEach(function (d) { var n3 = cells[key(q.i + d[0], q.j + d[1])], r3 = n3 && n3.ring >= 0 ? n3.ring : 1e9; if (!best || r3 < best.r) best = {r: r3, d: d, n: n3}; });
      return best;
    };
    var roomRec = function (p, idx, sl) {
      var q = sl.q, F = faceOf(q), fx = gv[0] * F.d[0] + gu[0] * F.d[1], fz = gv[1] * F.d[0] + gu[1] * F.d[1];
      var alongU = F.d[1] !== 0, w = alongU ? cw : cd, d = alongU ? cd : cw;
      var rec = {id: spec.id + ':' + idx, key: p.key, role: p.role, x: q.x, z: q.z, y: top + sl.s * HS, ry: Math.atan2(fx, fz), w: w, d: d, h: HS,
                 storey: sl.s, cell: [q.i, q.j], ring: q.ring, entry: 'hatch', pending: pend(p.key), village: spec.id, focus: focus};
      if (sl.s >= 1 && F.n && F.n.level === sl.s) { rec.entry = 'door'; rec.door = {x: q.x + fx * d / 2, z: q.z + fz * d / 2, y: rec.y}; }
      if (p.household) rec.household = p.household;
      if (p.head) rec.head = true;
      return rec;
    };
    for (var pi2 = 0; pi2 < nStores; pi2++) recs[pi2] = roomRec(prog[pi2], pi2, storeSlots[pi2]);
    for (var pi3 = nStores; pi3 < nRooms; pi3++) recs[pi3] = roomRec(prog[pi3], pi3, homeSlots[pi3 - nStores]);
    taken.forEach(function (q) { hold(cellRect(q.i, q.j, 0)); });

    /* ---- the plaza's frame, and the kivas in it when they are not below */
    var pmn = [1e18, 1e18], pmx = [-1e18, -1e18];
    plazaCells.forEach(function (q) { pmn = [Math.min(pmn[0], q.i), Math.min(pmn[1], q.j)]; pmx = [Math.max(pmx[0], q.i), Math.max(pmx[1], q.j)]; });
    var pc0 = at((pmn[0] + pmx[0]) / 2, (pmn[1] + pmx[1]) / 2);
    var plaza = {x: pc0[0], z: pc0[1], y: top, w: (pmx[0] - pmn[0] + 1) * cw, d: (pmx[1] - pmn[1] + 1) * cd, ry: Math.atan2(gu[0], gu[1]), cells: plazaCells.length};
    var onPlaza = function (x, z) {
      var s4 = (x - O[0]) * gv[0] + (z - O[1]) * gv[1], t4 = (x - O[0]) * gu[0] + (z - O[1]) * gu[1], c4 = cells[key(Math.round(s4 / cw), Math.round(t4 / cd))];
      return !!(c4 && c4.plaza);
    };
    if (!kivaBelow) {
      kivaIdx.forEach(function (idx) {
        var p = prog[idx], b = boxOf(p.key), done = false;
        var cs2 = plazaCells.slice().sort(function (a, c2) { return (mm(Math.hypot(a.x - pc0[0], a.z - pc0[1])) - mm(Math.hypot(c2.x - pc0[0], c2.z - pc0[1]))) || a.i - c2.i || a.j - c2.j; });
        for (var k = 0; k < cs2.length && !done; k++) for (var o2 = 0; o2 < 9 && !done; o2++) {
          var x = cs2[k].x + gv[0] * ((o2 % 3) - 1) * cw / 2 + gu[0] * (Math.floor(o2 / 3) - 1) * cd / 2;
          var z = cs2[k].z + gv[1] * ((o2 % 3) - 1) * cw / 2 + gu[1] * (Math.floor(o2 / 3) - 1) * cd / 2, R = H.rect(x, z, gv[0], gv[1], b.w, b.d);
          if (!H.corners(R).every(function (q) { return onPlaza(q[0], q[1]); }) || hits(R, 0.3)) continue;
          hold(R); done = true;
          recs[idx] = {id: spec.id + ':' + idx, key: p.key, role: p.role, x: x, z: z, y: top - b.h + 0.6, ry: plaza.ry, w: b.w, d: b.d, h: b.h, sunk: true,
                       round: true, pending: pend(p.key), village: spec.id, focus: focus};
        }
        if (!done) fail.push(p.key + ' (in the plaza)');
      });
    }

    /* ---- the edge: sample points on the climbable edges, each with its outward normal, those facing the way in first */
    var dir = spec.link ? unit(spec.link.x - O[0], spec.link.z - O[1]) : gu, smp = [];
    S.edges.forEach(function (E, e) {
      var L = Math.hypot(E.b[0] - E.a[0], E.b[1] - E.a[1]), m = Math.max(1, Math.floor(L / T.sample + 1e-6));
      for (var k = 0; k < m; k++) {
        var t = (k + 0.5) / m, x = E.a[0] + (E.b[0] - E.a[0]) * t, z = E.a[1] + (E.b[1] - E.a[1]) * t;
        /* facing the way in first (to 0.01 of a turn), then nearest the line from the middle toward it */
        smp.push({x: x, z: z, n: E.n, e: e, k: k, s: Math.round(-(E.n[0] * dir[0] + E.n[1] * dir[1]) * 100), side: mm(Math.abs((x - O[0]) * dir[1] - (z - O[1]) * dir[0]))});
      }
    });
    smp.sort(function (a, b) { return (a.s - b.s) || (a.side - b.side) || a.e - b.e || a.k - b.k; });
    var cellAt = function (x, z) {
      var s5 = (x - O[0]) * gv[0] + (z - O[1]) * gv[1], t5 = (x - O[0]) * gu[0] + (z - O[1]) * gu[1], q = cells[key(Math.round(s5 / cw), Math.round(t5 / cd))];
      return q && q.ring >= 0 ? q : null;
    };
    /* where a ladder up from this sample lands: the first cell in from the edge, and how far in it starts */
    var landing = function (e) {
      for (var stp = 0.25; stp <= T.rim + 2 * Math.max(cw, cd); stp += 0.25) { var q = cellAt(e.x - e.n[0] * stp, e.z - e.n[1] * stp); if (q) return {q: q, gap: stp}; }
      return null;
    };

    /* ---- below: the court (with the kivas), the pen and the works, outside the outline, gates toward the ladder */
    var freeBelow = function (R) {
      if (!H.polyOutside(S.pts, R, T.pad) || hits(R, T.pad)) return false;
      var cs = H.corners(R);
      for (var k = 0; k < 4; k++) if (!H.groundOk(spec, cs[k][0], cs[k][1])) return false;
      return H.groundOk(spec, R.x, R.z);
    };
    var commit = function (p, idx, R, extra) {
      hold(R);
      var fx = -R.uz, fz = R.ux, b = boxOf(p.key);   /* the rect's +v is its front (KHAMLET.rect(x, z, fz, -fx, ...)) */
      var rec = {id: spec.id + ':' + idx, key: p.key, role: p.role, x: R.x, z: R.z, y: footY(R.x, R.z), ry: Math.atan2(fx, fz), w: 2 * R.hw, d: 2 * R.hd,
                 h: b.h, pending: pend(p.key), village: spec.id, focus: focus, gate: {x: R.x + fx * R.hd, z: R.z + fz * R.hd}};
      if (extra) Object.keys(extra).forEach(function (k) { rec[k] = extra[k]; });
      recs[idx] = rec; return rec;
    };
    var GK = boxOf(prog[kivaIdx[1]].key), CB = kivaBelow ? boxOf(PF.court) : null, PB = boxOf(PF.pen);
    var cW = CB ? Math.max(CB.w, KV.w + GK.w + 8) : 0, cD = CB ? Math.max(CB.d, Math.max(KV.d, GK.d) + 6) : 0;
    var runAt = function (e) { return Math.max(0, top - footY(e.x + e.n[0] * 2, e.z + e.n[1] * 2)) * T.lean; };
    var court = null, pen = null, edge = null;
    for (var si2 = 0; si2 < smp.length && !pen; si2++) {
      var e2 = smp[si2], fx2 = -e2.n[0], fz2 = -e2.n[1], tx = -e2.n[1], tz = e2.n[0], off0 = runAt(e2) + T.footGap;
      if (!landing(e2)) continue;
      var rectAt = function (off, side, w, d) {
        var x = e2.x + e2.n[0] * (off + d / 2) + tx * side, z = e2.z + e2.n[1] * (off + d / 2) + tz * side;
        return H.rect(x, z, fz2, -fx2, w, d);
      };
      if (kivaBelow) {
        var R1 = rectAt(off0, 0, cW, cD);
        if (!freeBelow(R1)) continue;
        var sd2 = cW / 2 + PB.w / 2 + T.pad * 2, spots = [[off0, sd2], [off0, -sd2], [off0 + cD + T.pad * 2, 0]], R2 = null;
        for (var sp = 0; sp < spots.length && !R2; sp++) { var R3 = rectAt(spots[sp][0], spots[sp][1], PB.w, PB.d); if (freeBelow(R3) && !H.overlap(R1, R3, T.pad)) R2 = R3; }
        if (!R2) continue;
        court = commit(prog[courtIdx], courtIdx, R1, {holds: [spec.id + ':' + kivaIdx[0], spec.id + ':' + kivaIdx[1]]});
        pen = commit(prog[penIdx], penIdx, R2);
      } else {
        var R4 = rectAt(off0, 0, PB.w, PB.d);
        if (!freeBelow(R4)) continue;
        pen = commit(prog[penIdx], penIdx, R4);
      }
      edge = e2;
    }
    if (!pen) return bad('no ground below the ' + (S.kind === 'alcove' ? 'drip line' : 'plinth') + ' for its ' + (kivaBelow ? 'court and ' : '') + 'pen', {census: C});
    if (court) {
      /* the kivas inside the court, side by side along its back wall's length */
      [[kivaIdx[0], KV, -1], [kivaIdx[1], GK, 1]].forEach(function (k3) {
        var p = prog[k3[0]], o3 = k3[2] * (Math.max(KV.w, GK.w) / 2 + 1.5), x = court.x - edge.n[1] * o3, z = court.z + edge.n[0] * o3;
        recs[k3[0]] = {id: spec.id + ':' + k3[0], key: p.key, role: p.role, x: x, z: z, y: footY(x, z) - k3[1].h + 0.6, ry: court.ry, w: k3[1].w, d: k3[1].d, h: k3[1].h,
                       sunk: true, round: true, court: court.id, pending: pend(p.key), village: spec.id, focus: focus};
      });
    }

    /* ---- the ladder from the foot: onto the rim, or straight onto the nearest roof when it stands at the edge */
    var ladders = [], lkey = PF.ladder;
    var ladder = function (from, to, f, t) {
      var rise = t.y - f.y;
      ladders.push({id: spec.id + ':ladder:' + ladders.length, kind: 'ladder', key: lkey, from: from, to: to, foot: f, top: t, rise: rise,
                    stages: Math.max(1, Math.ceil(rise / T.ladderMax - 1e-9)), pending: pend(lkey)});
    };
    var run0 = runAt(edge), fxz = [edge.x + edge.n[0] * run0, edge.z + edge.n[1] * run0], LD = landing(edge);
    var F0 = {x: fxz[0], y: footY(fxz[0], fxz[1]), z: fxz[1]}, Cin = LD.q, gap = LD.gap;
    if (Cin.level === 0) ladder('foot', 'c:' + Cin.i + ':' + Cin.j, F0, {x: edge.x, y: top, z: edge.z});
    else if (gap <= T.rimGap) ladder('foot', 'c:' + Cin.i + ':' + Cin.j, F0, {x: edge.x - edge.n[0] * gap, y: top + Cin.level * HS, z: edge.z - edge.n[1] * gap});
    else {
      var back = Math.max(0.3, gap - Cin.level * HS * T.lean);
      ladder('foot', 'rim', F0, {x: edge.x, y: top, z: edge.z});
      ladder('rim', 'c:' + Cin.i + ':' + Cin.j, {x: edge.x - edge.n[0] * back, y: top, z: edge.z - edge.n[1] * back},
             {x: edge.x - edge.n[0] * gap, y: top + Cin.level * HS, z: edge.z - edge.n[1] * gap});
    }

    /* ---- the terraces' ladders: walk from the plaza over cells at one level; where a terrace is not reached, a ladder
       from a reached neighbour (the lowest ring first) onto it, at their shared side */
    var reached = {}, flood = function (q0) {
      var Q = [q0]; reached[key(q0.i, q0.j)] = true;
      for (var h = 0; h < Q.length; h++) N4.forEach(function (d) { var n4 = cells[key(Q[h].i + d[0], Q[h].j + d[1])]; if (n4 && n4.ring >= 0 && !reached[key(n4.i, n4.j)] && n4.level === Q[h].level) { reached[key(n4.i, n4.j)] = true; Q.push(n4); } });
    };
    plazaCells.forEach(function (q) { if (!reached[key(q.i, q.j)]) flood(q); });
    var order = live.slice().sort(function (a, b) { return (a.ring - b.ring) || a.i - b.i || a.j - b.j; });
    for (var guard = 0; guard < live.length; guard++) {
      var pick = null;
      for (var oi = 0; oi < order.length && !pick; oi++) {
        var B = order[oi]; if (reached[key(B.i, B.j)]) continue;
        for (var di = 0; di < 4 && !pick; di++) { var A = cells[key(B.i + N4[di][0], B.j + N4[di][1])]; if (A && A.ring >= 0 && reached[key(A.i, A.j)]) pick = {A: A, B: B}; }
      }
      if (!pick) break;
      var lw = pick.A.level <= pick.B.level ? pick.A : pick.B, hg = lw === pick.A ? pick.B : pick.A;
      var mx = (pick.A.x + pick.B.x) / 2, mz = (pick.A.z + pick.B.z) / 2, tox = unit(hg.x - lw.x, hg.z - lw.z), rise2 = (hg.level - lw.level) * HS;
      ladder('c:' + lw.i + ':' + lw.j, 'c:' + hg.i + ':' + hg.j, {x: mx - tox[0] * rise2 * T.lean, y: top + lw.level * HS, z: mz - tox[1] * rise2 * T.lean}, {x: mx, y: top + hg.level * HS, z: mz});
      flood(pick.B);
    }
    if (live.some(function (q) { return !reached[key(q.i, q.j)]; })) fail.push('a roof no ladder reaches');

    /* ---- the works, out from the court, within reach of it */
    var reachW = row.reach && row.reach[focus] != null ? row.reach[focus] : T.reach, hub = court || pen;
    var bySmp = smp.slice().sort(function (a, b) { return (mm(Math.hypot(a.x - hub.x, a.z - hub.z)) - mm(Math.hypot(b.x - hub.x, b.z - hub.z))) || a.e - b.e || a.k - b.k; });
    for (var w2 = penIdx + 1; w2 < prog.length; w2++) {
      var p2 = prog[w2], b2 = boxOf(p2.key), ok2 = null;
      for (var ring2 = 0; ring2 < 10 && !ok2; ring2++) for (var s6 = 0; s6 < bySmp.length && !ok2; s6++) {
        var e3 = bySmp[s6], off3 = runAt(e3) + T.footGap + ring2 * 14 + b2.d / 2, x3 = e3.x + e3.n[0] * off3, z3 = e3.z + e3.n[1] * off3;
        if (Math.hypot(x3 - hub.x, z3 - hub.z) > reachW) continue;
        var R5 = H.rect(x3, z3, -e3.n[1], e3.n[0], b2.w, b2.d);
        if (freeBelow(R5)) ok2 = commit(p2, w2, R5);
      }
      if (!ok2) fail.push(p2.key);
    }

    /* ---- the paths from the ladder's foot to each gate below */
    var paths = [];
    recs.forEach(function (r) { if (r && r.gate) paths.push({id: spec.id + ':path:' + paths.length, kind: 'path', from: 'foot', to: r.id, pts: [[F0.x, F0.z], [r.gate.x, r.gate.z]]}); });

    var pk = {}; recs.concat(ladders).forEach(function (r) { if (r && r.pending) pk[r.key] = true; });
    var out = {id: spec.id, culture: row.kit, focus: focus, kind: S.kind, census: C,
               site: {x: O[0], z: O[1], top: top, foot: F0.y}, frame: {u: gu, v: gv}, plaza: plaza,
               cells: live.map(function (q) { return {i: q.i, j: q.j, x: q.x, z: q.z, level: q.level, ring: q.ring, plaza: q.plaza}; }),
               records: recs.filter(Boolean), ladders: ladders, paths: paths, pen: pen, court: court, edge: {x: edge.x, z: edge.z, n: edge.n},
               outline: S.pts, pendingKeys: Object.keys(pk).sort()};
    if (out.records.length !== prog.length) fail.push((prog.length - out.records.length) + ' records unplaced');
    if (fail.length) out.error = 'could not place: ' + fail.join(', ');
    return out;
  };
})();
