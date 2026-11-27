/* ==================== core/hamlet 34: a trade post shared by two cultures (plain data, [G data]) ==================== */
/* The Great Chasm's post on the south sill (biomes/greatchasm/PLAN.md section 5, amendment 1): a serai where caravans
   stop, stores, cisterns and a market court, held by two peoples, each with its own half and a line of boundary stones
   between them. Opt-in: nothing here changes KHAMLET.village; it needs 32-hamlet-platform.js (KHAMLET.pendingRow,
   platformRow, inPoly) and reads core/space (KSPACE) and core/city's KCITY.prim.huntNear in place.
   The `trade` focus is this function's own: KHAMLET.FOCI is the village's list (village() and its test walk every entry
   with one row), so it is not added there; KHAMLET.TRADE_FOCUS names it.

   KHAMLET.tradePost(spec) -> {id, focus 'trade', cultures [kitA, kitB], census {A, B, pop, caravans, stalls}, site, frame
                               {along, across}, line {pts, stones}, serai, market, stalls, roads, records, pendingKeys,
                               error?}
   spec: {id, world, cultures [a, b] (each a KHAMLET.CULTURES name or a row; an unknown name gets KHAMLET.pendingRow),
          site {x, z} (default the links' midpoint), links [{x, z}, {x, z}] (the two roads, A's then B's), line? [[x, z],
          [x, z]] (the dividing line: default through the site, square to the way from link A to link B), caravans
          (the beasts the serai stalls; default 24), popMax (both halves; default 300), holder (0 | 1: who keeps the serai
          and builds the shared courts in its keys; default 0), cisterns ('A' | 'B' | 'both': whose side; default the
          holder's), dims(key), ground {ok(x, z)}}
   The layout:
     the serai     a walled court straddling the line (row.trade.serai, grown to stall the caravans): a stall for each beast
                   along its inner walls (row.trade.stall), a gate on each road (A's wall faces A's side, B's B's)
     the market    a court straddling the line beside the serai (row.trade.market): the boundary stones run across it
     each half     its own culture's census (KHAMLET.census: jobs from the market, its stores and, for the holder, the
                   serai) and program (KHAMLET.program: civic, religious, general, food, warehouses, houses), plus its
                   trade stores (row.trade.store) and the cisterns on their side (row.trade.cistern), fronting its road
                   out from its gate; every footprint wholly on its own side, T.lineGap from the line
   Records: {id, key, role, side ('A' | 'B' | null for the shared), culture, x, z, ry, w, d, h, pending, village, focus}.
   Ids: <id>:serai, <id>:market, <id>:stall:<k>, <id>:A:<k>, <id>:B:<k> in program order. */
(function () {
  'use strict';
  var H = KHAMLET;
  H.TRADE_FOCUS = 'trade';
  H.TRADE_TUNE = {
    lineGap: 2,            /* a half's footprint from the line */
    roadW: 6, setback: 3,  /* the road out of each gate; a building's front from its edge */
    gap: [3, 7],           /* between buildings along a road */
    start: 8,              /* the first plot from the serai's wall */
    laneMax: 220,          /* a road's frontage run */
    gateW: 6,              /* a serai gate's width */
    pad: 1.5,              /* clearance between footprints */
    traders: 6,            /* market jobs a side */
    storeJobs: 4,          /* jobs a trade store */
    beastsPerStore: 12,    /* a half's trade stores: one per this many of its share of the beasts */
    waterPer: 150          /* a cistern for every this many of people plus twice the beasts */
  };
  var unit = function (x, z) { var L = Math.hypot(x, z) || 1; return [x / L, z / L]; };

  H.tradePost = function (spec) {
    var T = H.TRADE_TUNE, K = KRAND, fail = [];
    var bad = function (msg) { return {id: spec.id, focus: H.TRADE_FOCUS, error: msg, records: [], stalls: [], roads: []}; };
    if (!spec.cultures || spec.cultures.length !== 2) return bad('a trade post needs two cultures');
    if (!spec.links || spec.links.length !== 2) return bad('a trade post needs two links, one road a side');
    var rows = spec.cultures.map(function (c) {
      var r = H.row(c), name = typeof c === 'string' ? c : (r && r.kit) || 'trade';
      return H.platformRow(r, name);
    });
    var LA = spec.links[0], LB = spec.links[1], holder = spec.holder == null ? 0 : spec.holder, HR = rows[holder], TR = HR.trade;
    var site = spec.site ? {x: spec.site.x, z: spec.site.z} : {x: (LA.x + LB.x) / 2, z: (LA.z + LB.z) / 2};
    /* the frame: `along` the line, `across` it from A's side to B's */
    var p0, along, across;
    if (spec.line) {
      p0 = [spec.line[0][0], spec.line[0][1]]; along = unit(spec.line[1][0] - p0[0], spec.line[1][1] - p0[1]); across = [-along[1], along[0]];
      if ((LA.x - p0[0]) * across[0] + (LA.z - p0[1]) * across[1] > 0) across = [-across[0], -across[1]];
    } else {
      across = unit(LB.x - LA.x, LB.z - LA.z); along = [-across[1], across[0]]; p0 = [site.x, site.z];
    }
    var sd = function (x, z) { return (x - p0[0]) * across[0] + (z - p0[1]) * across[1]; };
    if (!(sd(LA.x, LA.z) < 0 && sd(LB.x, LB.z) > 0)) return bad('the two links are not on either side of the line');
    var seed = K.hash(K.child(spec.world >>> 0, 'hamlet-trade'), H.idHash(spec.id));
    var boxOf = function (row, key) { return H.box(spec, row, key); };
    var pend = function (row, key) { return !!(row.pending && row.pending[key] && !(spec.dims && spec.dims(key))); };
    var space = KSPACE.create({cell: 32}), recs = [], stalls = [], roads = [];
    var hold = function (R, what) { space.insert({R: R, what: what}, R.x, R.z, H.rectR(R)); };
    var hits = function (R, pad) { return space.some(R.x, R.z, H.rectR(R) + 80, function (it) { return H.overlap(R, it.R, pad + 1e-4); }); };
    var groundRect = function (R) { var cs = H.corners(R); for (var k = 0; k < 4; k++) if (!H.groundOk(spec, cs[k][0], cs[k][1])) return false; return H.groundOk(spec, R.x, R.z); };
    var rec = function (id, row, key, role, side, R, extra) {
      var fx = -R.uz, fz = R.ux, b = boxOf(row, key);
      var r = {id: id, key: key, role: role, side: side, culture: row.kit, x: R.x, z: R.z, ry: Math.atan2(fx, fz), w: 2 * R.hw, d: 2 * R.hd, h: b.h,
               pending: pend(row, key), village: spec.id, focus: H.TRADE_FOCUS};
      if (extra) Object.keys(extra).forEach(function (k) { r[k] = extra[k]; });
      return r;
    };

    /* ---- the census: each half its own, from the market, its stores and (the holder) the serai */
    var beasts = spec.caravans == null ? 24 : spec.caravans, popMax = spec.popMax == null ? 300 : spec.popMax;
    var nStores = Math.max(1, Math.ceil(beasts / 2 / T.beastsPerStore));
    var cens = rows.map(function (row, s) {
      var jobs = T.traders + nStores * T.storeJobs + (s === holder ? 2 + Math.ceil(beasts / 8) : 0);
      return H.census({popMax: Math.floor(popMax / 2), focus: H.TRADE_FOCUS, resource: {workers: jobs}}, row);
    });
    var pop = cens[0].pop + cens[1].pop;

    /* ---- the serai: a square court grown until its inner walls stall every beast */
    var SB = boxOf(HR, TR.serai), ST = boxOf(HR, TR.stall), side = Math.max(SB.w, SB.d), capOf = function (S) {
      var run = S - 2 * ST.d, gateRun = Math.floor((run - T.gateW) / 2 / ST.w) * 2;
      return 2 * Math.floor(run / ST.w) + 2 * Math.max(0, gateRun);
    };
    while (capOf(side) < beasts) side += 2;
    var MB = boxOf(HR, TR.market);
    /* the serai's and the market's place on the line: the site's foot on it first, then along it either way */
    var foot = [p0[0] + along[0] * ((site.x - p0[0]) * along[0] + (site.z - p0[1]) * along[1]), p0[1] + along[1] * ((site.x - p0[0]) * along[0] + (site.z - p0[1]) * along[1])];
    var seraiR = null, marketR = null;
    for (var t = 0; t <= 400 && !seraiR; t += 10) for (var sg = 0; sg < (t ? 2 : 1) && !seraiR; sg++) {
      var o = sg ? -t : t, c = [foot[0] + along[0] * o, foot[1] + along[1] * o];
      var R = H.rect(c[0], c[1], along[0], along[1], side, side);
      if (!groundRect(R)) continue;
      /* the market beside it along the line, on the side toward the site's foot first */
      for (var ms = 0; ms < 2 && !marketR; ms++) {
        var dirM = ms === 0 ? (o > 0 ? -1 : 1) : (o > 0 ? 1 : -1), off = side / 2 + T.pad * 2 + MB.w / 2;
        var M = H.rect(c[0] + along[0] * off * dirM, c[1] + along[1] * off * dirM, along[0], along[1], MB.w, MB.d);
        if (groundRect(M)) { seraiR = R; marketR = M; }
      }
    }
    if (!seraiR) return bad('no dry ground on the line for the serai and the market within 400 m of the site');
    hold(seraiR, 'serai'); hold(marketR, 'market');
    var gate = function (s) { var sg2 = s ? 1 : -1; return {side: s ? 'B' : 'A', x: seraiR.x + across[0] * sg2 * side / 2, z: seraiR.z + across[1] * sg2 * side / 2, n: [across[0] * sg2, across[1] * sg2]}; };
    var gates = [gate(0), gate(1)];
    var serai = rec(spec.id + ':serai', HR, TR.serai, 'serai', null, seraiR, {gates: gates, stalls: 0, holder: holder ? 'B' : 'A'});
    var market = rec(spec.id + ':market', HR, TR.market, 'market', null, marketR);
    recs.push(serai, market);

    /* ---- the stalls along the serai's inner walls, doors in; the A and B walls keep their gates open */
    var cx = seraiR.x, cz = seraiR.z, hs = side / 2;
    var wallRun = function (nx, nz, gateWall) {
      var tx = -nz, tz = nx, run = side - 2 * ST.d, list = [];
      var put = function (u) { list.push([cx + nx * (hs - ST.d / 2) + tx * u, cz + nz * (hs - ST.d / 2) + tz * u]); };
      if (!gateWall) { var n = Math.floor(run / ST.w); for (var k = 0; k < n; k++) put(-run / 2 + ST.w * (k + 0.5)); }
      else {
        var half = Math.floor((run - T.gateW) / 2 / ST.w);
        for (var k2 = 0; k2 < half; k2++) { put(-run / 2 + ST.w * (k2 + 0.5)); put(run / 2 - ST.w * (k2 + 0.5)); }
      }
      return list;
    };
    var walls = [[along, false], [[-along[0], -along[1]], false], [across, true], [[-across[0], -across[1]], true]];
    walls.forEach(function (W) {
      wallRun(W[0][0], W[0][1], W[1]).forEach(function (c0) {
        /* a stall's door faces the court's middle: its front is -wall normal */
        var fx = -W[0][0], fz = -W[0][1], R = H.rect(c0[0], c0[1], fz, -fx, ST.w, ST.d);
        if (stalls.length < beasts) stalls.push(rec(spec.id + ':stall:' + stalls.length, HR, TR.stall, 'stall', null, R, {serai: serai.id}));
      });
    });
    serai.stalls = stalls.length;

    /* ---- the roads: out of each gate toward its link, held open */
    gates.forEach(function (g, s) {
      var L = s ? LB : LA, e = [g.x + g.n[0] * 12, g.z + g.n[1] * 12];
      roads.push({id: spec.id + ':road:' + g.side, kind: 'road', side: g.side, w: T.roadW, pts: [[g.x, g.z], e, [L.x, L.z]]});
      var segs = [[[g.x, g.z], e], [e, [L.x, L.z]]];
      segs.forEach(function (sgm) {
        var a = sgm[0], b = sgm[1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), u = unit(b[0] - a[0], b[1] - a[1]);
        for (var q = 0; q < len; q += 40) { var l2 = Math.min(40, len - q); hold(H.rect(a[0] + u[0] * (q + l2 / 2), a[1] + u[1] * (q + l2 / 2), -u[1], u[0], T.roadW, l2), 'road'); }
      });
    });

    /* ---- each half: its program in its own keys, fronting its road out of its gate */
    var sideOk = function (R, s) {
      var cs = H.corners(R), sg3 = s ? 1 : -1;
      for (var k = 0; k < 4; k++) if (sd(cs[k][0], cs[k][1]) * sg3 < T.lineGap) return false;
      return true;
    };
    var nCist = 1 + Math.floor((pop + 2 * beasts) / T.waterPer), cSide = spec.cisterns == null ? (holder ? 'B' : 'A') : spec.cisterns;
    [0, 1].forEach(function (s) {
      var row = rows[s], C = cens[s], st = K.stream(K.hash(seed, 2, s)), P = H.program(C, row, K.stream(K.hash(seed, 1, s))), SN = s ? 'B' : 'A';
      var list = [];
      for (var k = 0; k < nStores; k++) list.push({role: 'store', key: row.trade.store});
      for (var c2 = 0; c2 < nCist; c2++) if (cSide === SN || (cSide === 'both' && c2 % 2 === s)) list.push({role: 'cistern', key: HR.trade.cistern, row: HR});
      P.forEach(function (p) { list.push(p); });
      var g = gates[s], L = s ? LB : LA, gd = unit(L.x - g.x, L.z - g.z), cur = [T.start + T.roadW, T.start + T.roadW];
      list.forEach(function (p, k) {
        var prow = p.row || row, b = boxOf(prow, p.key), done = null;
        var tryAt = function (x, z, fx, fz) {
          var R = H.rect(x, z, fz, -fx, b.w, b.d);
          if (!sideOk(R, s) || hits(R, T.pad) || !groundRect(R)) return null;
          return R;
        };
        /* the road's frontage, the two sides in turn */
        for (var tries = 0; tries < 2 && !done; tries++) {
          var rs = (k + tries) % 2 ? -1 : 1, ci = rs > 0 ? 0 : 1, nx = -gd[1] * rs, nz = gd[0] * rs;
          while (!done && cur[ci] < T.laneMax) {
            var tt = cur[ci] + b.w / 2, offs = T.roadW / 2 + T.setback + b.d / 2;
            var R2 = tryAt(g.x + gd[0] * tt + nx * offs, g.z + gd[1] * tt + nz * offs, -nx, -nz);
            if (R2) { done = R2; cur[ci] += b.w + T.gap[0] + st.next() * (T.gap[1] - T.gap[0]); } else cur[ci] += 4;
          }
        }
        /* else the nearest clear spot round the gate's road, facing it */
        if (!done) {
          var anc = [g.x + gd[0] * 40, g.z + gd[1] * 40];
          done = KCITY.prim.huntNear(anc, {r0: 10, step: 8, reach: 320, arc: 10}, function (q) {
            var f = unit(anc[0] - q[0], anc[1] - q[1]);
            return tryAt(q[0], q[1], f[0], f[1]);
          });
        }
        if (!done) { fail.push(SN + ' ' + p.key); return; }
        hold(done, p.role);
        var r = rec(spec.id + ':' + SN + ':' + k, prow, p.key, p.role, SN, done);
        if (p.households) r.households = p.households;
        if (p.head) r.head = true;
        recs.push(r);
      });
    });

    /* ---- the line: across the post, its boundary stones across the market court */
    var ext = 0;
    recs.forEach(function (r) { ext = Math.max(ext, Math.abs((r.x - p0[0]) * along[0] + (r.z - p0[1]) * along[1]) + Math.hypot(r.w, r.d) / 2); });
    var mAl = (marketR.x - p0[0]) * along[0] + (marketR.z - p0[1]) * along[1], stones = [];
    for (var q = -MB.w / 2 + 2; q <= MB.w / 2 - 2 + 1e-9; q += 4) stones.push({x: p0[0] + along[0] * (mAl + q), z: p0[1] + along[1] * (mAl + q)});
    var pk = {}; recs.concat(stalls).forEach(function (r) { if (r.pending) pk[r.key] = true; });
    var out = {id: spec.id, focus: H.TRADE_FOCUS, cultures: [rows[0].kit, rows[1].kit],
               census: {A: cens[0], B: cens[1], pop: pop, caravans: beasts, stalls: stalls.length},
               site: {x: seraiR.x, z: seraiR.z}, frame: {along: along, across: across},
               line: {pts: [[p0[0] - along[0] * ext, p0[1] - along[1] * ext], [p0[0] + along[0] * ext, p0[1] + along[1] * ext]], stones: stones},
               serai: serai, market: market, stalls: stalls, roads: roads, records: recs, pendingKeys: Object.keys(pk).sort()};
    if (stalls.length < beasts) fail.push((beasts - stalls.length) + ' stalls');
    if (fail.length) out.error = 'could not place: ' + fail.join(', ');
    return out;
  };
})();
