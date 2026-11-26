/* ============================== 5c. NESTED SQUARES: A MANDALA SITE ON A STRICT GRID ============================== */
/* [G data] A site generator (steps 0-5) for a city of concentric walled squares round a central landmark, on a strict
   true-north grid: Qiblai's (kits/qiblai/PLAN.md sections 2b, 3 and 7, phase Q7; asked of core/city by the owner,
   2026-11-11). Plain records keyed by stable ids, no THREE, no DOM, no draws (nothing random: the grid is the plan).
   The records half (plan, levelAt, ground, baseFor, courtBlocks) stands alone, as 36-city-covered.js does; the laying
   half (steps, fill, infill) reads the bound instance (PLAN, SL, TUNE) and core/city's site layer when it is called.

     KCITY.squares.plan(o) -> S     the site as records (format 'krator-squares'):
       o  {id ('sq': every record's id starts with it), centre ([0, 0]), block (96: twelve 8 m modules), street (12),
           avenue (24), rings ([{kind, to, steps, pool, wealth, wall}]: ring k holds the blocks whose Chebyshev index from
           the centre block is in (rings[k-1].to, rings[k].to]; ring 0 is the landmark's, with no blocks of its own;
           KCITY.squares.RINGS by default: the temple 3 x 3, the clergy, the kora, three lay rings, 15 x 15 in all),
           walls ({inner, outer}: thick, h, tower (a tower's side), clear (no block nearer a wall), corners (corner
           towers), towerGap (curtain towers along the sides; 0 none); KCITY.squares.WALLS; a ring's own `wall` wins),
           terrace ({rise: 2}: a step's height; a ring stands `steps` steps above the ring outside it, the outermost
           above the country), base (the country's level; with o.h and no base, the highest ground under the outer
           square, so the terraces are only ever built up, never cut), kora (2: the ring whose inner ring street is the
           kora; null none), markets ({ring: 2}: the gate markets in that ring's axial blocks; null none),
           monasteries ({ring: 1}: one great monastery a spoke, on the eight blocks of that ring's inner row that lie
           on the spokes; null none), perimeter (true: a road outside the outer wall), landmark ({key, role, h})}
       S  {format, version, id, centre, block, street, avenue, pitch, n (blocks a side), base, zone (the outer wall's
           outer face), reach (the plan's half extent), rings, blocks, ways, crossings, walls, terraces, landmark,
           monasteries, markets}
          ring      {id, ring, kind, pool, wealth, from, to, half, inner, level, poly, hole, cells}
          block     {id, i, j, a, b (its index from the centre block: a east, b south), half ('w' | 'e' | 'n' | 's':
                    the half of an axial block an avenue splits, or null), ring, kind, pool, wealth, level, quarter
                    ('n' .. 'nw'), spoke (0-7 clockwise from north), use ('quarter' | 'monastery' | 'market'), walls
                    (its sides that back onto its ring's wall), cell ([i, j]: its own KRAND cell), box [x0, z0, x1, z1],
                    poly (the built area: the kerb, less the wall and its towers)}
          way       {id, kind ('avenue': from the perimeter through every gate to the landmark's edge | 'ring' | 'kora' |
                    'perimeter' | 'cross'), cls (core/city's: 'avenue' | 'main'),
                    w, pts, closed, ring, level (null on an avenue: it climbs through the gates), dir}
          crossing  {id, way, ring, kind ('corner' | 'avenue' | 'cross'), x, z, chorten (on the kora)}
          wall      {id, ring, kind ('inner' | 'outer'), half (its outer face), centre (its centreline's half), thick, h,
                    tower, line (closed, the centreline), gates [{id, dir, x, z, ry, out, w, way, yIn, yOut, rise}],
                    towers [{id, kind: 'gate' | 'corner' | 'curtain', x, z, size, gate}], runs [{id, pts}], segs
                    [{ax, az, bx, bz, health}] (core/city's), yIn, yOut}
          terrace   {id, ring, y, steps, rise, below (the level outside it), half, poly}
          landmark  {id, kind: 'landmark', role, key, x, z, hw, hd, w, d, h, ry, level, poly}
          monastery {id, spoke, dir, colour (0-7: the eight colours, one each), blocks}
          market    {id, dir, ring, blocks}
       A record's ry faces out: its front looks along [sin ry, cos ry] (a lot's convention). North is -z.
     KCITY.squares.levelAt(S, x, z)  the terrace level at (x, z) (the innermost square holding it), or null outside
     KCITY.squares.ground(S, h)      h(x, z) built up to the terraces (never cut below the ground)
     KCITY.squares.baseFor(h, c, half, step)  the highest ground under a square (the base that fills and never cuts)
     KCITY.squares.courtBlocks(S, o) the blocks as frontage-courts takes them ({id, i, j, poly, kind, wealth, lanes,
                                     sides}); o.uses (['quarter']), o.lanes
     KCITY.squares.steps(S, o)       the world's steps 0-5 on the bound instance: the raster and the zone (0), the
                                     landmark lot (1), the rings as districts (2), the avenues, ring and cross streets
                                     (3), none (4: the world's highways), the walls stamped and the outer one as
                                     PLAN.wallRec (5). o: dry, maxSlope, landmarkH. It sets TUNE.width.avenue and .main
                                     to the plan's, and TUNE.rasterHalf to hold the plan
     KCITY.squares.infill(S, ctx, o) frontage-courts on courtBlocks, each block fronting only the sides that face a
                                     street (a block backing onto its wall takes a focus far off it)
     KCITY.squares.fill(G, S)        the terraces onto a ground-delta grid (25-city-site.js's interface), fill only */
(function (root) {
  'use strict';
  var K = root.KCITY || (root.KCITY = { version: 1 });
  var DIRS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
  var CARD = [{ d: 'n', v: [0, -1] }, { d: 'e', v: [1, 0] }, { d: 's', v: [0, 1] }, { d: 'w', v: [-1, 0] }];
  var dflt = function (x, d) { return x == null ? d : x; };
  var merge = function () { var r = {}; for (var i = 0; i < arguments.length; i++) { var o = arguments[i]; if (o) for (var k in o) if (o[k] != null) r[k] = o[k]; } return r; };
  var rect = function (x0, z0, x1, z1) { return [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]; };
  var square = function (c, h) { return rect(c[0] - h, c[1] - h, c[0] + h, c[1] + h); };
  var r3 = function (v) { return Math.round(v * 1000) / 1000; };

  K.squares = {};
  /* Qiblai's rings (kits/qiblai/PLAN.md section 3): the Temple Mountain on the central 3 x 3, the clergy (16 blocks),
     the kora (24), and the lay quarters out to 15 x 15 (the outermost two blocks deep). steps: its rise in steps over
     the ring outside it (one to three) */
  K.squares.RINGS = [
    { kind: 'temple', to: 1, steps: 3 },
    { kind: 'clergy', to: 2, steps: 2, pool: 'clergy', wealth: 0.8 },
    { kind: 'kora', to: 3, steps: 1, pool: 'kora', wealth: 0.6 },
    { kind: 'lay', to: 4, steps: 1, pool: 'rich', wealth: 0.75 },
    { kind: 'lay', to: 5, steps: 1, pool: 'middle', wealth: 0.5 },
    { kind: 'lay', to: 7, steps: 1, pool: 'poor', wealth: 0.25 }];
  /* low inner walls with gate towers; a full outer wall with corner and curtain towers */
  K.squares.WALLS = {
    inner: { thick: 2.5, h: 4, tower: 7, clear: 2, corners: false, towerGap: 0 },
    outer: { thick: 5, h: 10, tower: 10, clear: 3, corners: true, towerGap: 216 } };

  K.squares.baseFor = function (h, c, half, step) {
    var st = step == null ? 12 : step, hi = -Infinity;
    for (var x = -half; x <= half + 1e-9; x += st) for (var z = -half; z <= half + 1e-9; z += st) hi = Math.max(hi, h(c[0] + x, c[1] + z));
    return hi;
  };

  K.squares.plan = function (o) {
    o = o || {};
    var B = dflt(o.block, 96), Sw = dflt(o.street, 12), A = dflt(o.avenue, 24), P = B + Sw, c = o.centre || [0, 0], id = dflt(o.id, 'sq');
    var rings = (o.rings || K.squares.RINGS).map(function (r) { return merge(r); });
    var last = rings.length - 1;
    if (last < 1) throw new Error('KCITY.squares: at least two rings (the landmark and one of blocks)');
    rings.forEach(function (r, k) { if (!(r.to >= (k ? rings[k - 1].to + 1 : 0))) throw new Error('KCITY.squares: ring ' + k + "'s `to` must pass the ring inside it"); });
    var T = merge({ rise: 2 }, o.terrace), n = 2 * rings[last].to + 1, h0 = rings[last].to;
    var H = rings.map(function (r) { return r.to * P + B / 2; });
    var Rin = rings.map(function (r, k) { return k ? H[k - 1] + Sw / 2 : 0; });
    var WS = rings.map(function (r, k) { var kind = k === last ? 'outer' : 'inner'; return merge(K.squares.WALLS[kind], o.walls && o.walls[kind], r.wall, { kind: kind }); });
    if (A / 2 + 1 > B / 2) throw new Error('KCITY.squares: the avenue is wider than a block');
    var reach = H[last] + (o.perimeter === false ? 0 : Sw);
    var base = o.base != null ? o.base : (o.h ? K.squares.baseFor(o.h, c, reach) : 0);
    /* the levels: the outermost ring its steps above the country, each ring its steps above the ring outside it */
    var lv = []; lv[last] = base + dflt(rings[last].steps, 1) * T.rise;
    for (var k = last - 1; k >= 0; k--) lv[k] = lv[k + 1] + dflt(rings[k].steps, 1) * T.rise;
    var ringOf = function (r) { for (var q = 0; q <= last; q++) if (r <= rings[q].to) return q; return -1; };
    var S = { format: 'krator-squares', version: 1, id: id, centre: [c[0], c[1]], block: B, street: Sw, avenue: A, pitch: P, n: n, base: base,
      zone: square(c, H[last]), reach: reach, rings: [], blocks: [], ways: [], crossings: [], walls: [], terraces: [], landmark: null, monasteries: [], markets: [] };

    /* ---- the rings and their terraces */
    rings.forEach(function (r, q) {
      var from = q ? rings[q - 1].to + 1 : 0, cells = (2 * r.to + 1) * (2 * r.to + 1) - (q ? (2 * from - 1) * (2 * from - 1) : 0);
      S.rings.push({ id: id + ':ring:' + q, ring: q, kind: r.kind, pool: dflt(r.pool, r.kind), wealth: dflt(r.wealth, 0.5), from: from, to: r.to,
        half: H[q], inner: q ? H[q - 1] : 0, level: lv[q], poly: square(c, H[q]), hole: q ? square(c, H[q - 1]) : null, cells: cells });
      S.terraces.push({ id: id + ':ter:' + q, ring: q, y: lv[q], steps: dflt(r.steps, 1), rise: lv[q] - (q === last ? base : lv[q + 1]),
        below: q === last ? base : lv[q + 1], half: H[q], poly: square(c, H[q]) });
    });

    /* ---- the blocks: each the kerb's square, the axial ones split by their avenue, the wall's side cut back */
    var inset = function (W, towered) { return (towered ? Math.max(W.tower, W.thick) : W.thick) + W.clear; };
    for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
      var a = i - h0, b = j - h0, cr = Math.max(Math.abs(a), Math.abs(b)), q = ringOf(cr);
      if (q <= 0) continue;
      var W = WS[q], to = rings[q].to, cx = c[0] + a * P, cz = c[1] + b * P, corner = Math.abs(a) === to && Math.abs(b) === to;
      var ang = Math.atan2(a, -b), spoke = ((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8;
      var pieces = a === 0 ? [['w', cx - B / 2, cx - A / 2], ['e', cx + A / 2, cx + B / 2]] : b === 0 ? [['n', cz - B / 2, cz - A / 2], ['s', cz + A / 2, cz + B / 2]] : [[null]];
      pieces.forEach(function (pc) {
        var x0 = cx - B / 2, x1 = cx + B / 2, z0 = cz - B / 2, z1 = cz + B / 2, half = pc[0], walls = [];
        if (half === 'w' || half === 'e') { x0 = pc[1]; x1 = pc[2]; }
        if (half === 'n' || half === 's') { z0 = pc[1]; z1 = pc[2]; }
        /* a side on the wall: the wall's thickness and its clearance; a tower's where a tower may stand (curtain towers
           along it, a corner tower, the gate towers beside an avenue) */
        var tw = function (axial) { return W.towerGap > 0 || (corner && W.corners) || axial; };
        if (b === -to) { z0 += inset(W, tw(a === 0)); walls.push('n'); }
        if (b === to) { z1 -= inset(W, tw(a === 0)); walls.push('s'); }
        if (a === to) { x1 -= inset(W, tw(b === 0)); walls.push('e'); }
        if (a === -to) { x0 += inset(W, tw(b === 0)); walls.push('w'); }
        var R = S.rings[q];
        S.blocks.push({ id: id + ':blk:' + i + ':' + j + (half ? ':' + half : ''), i: i, j: j, a: a, b: b, half: half, ring: q, kind: R.kind, pool: R.pool, wealth: R.wealth,
          level: lv[q], quarter: DIRS[spoke], spoke: spoke, use: 'quarter', walls: walls,
          cell: [2 * i + (half === 'e' ? 1 : 0), 2 * j + (half === 's' ? 1 : 0)], box: [x0, z0, x1, z1], poly: rect(x0, z0, x1, z1) });
      });
    }
    var byAB = function (q, a, b) { return S.blocks.filter(function (bl) { return bl.ring === q && bl.a === a && bl.b === b; }); };
    /* the great monasteries: one a spoke, on the spoke blocks of the ring's inner row (an axial one takes both halves) */
    var mo = o.monasteries === null ? null : merge({ ring: 1 }, o.monasteries);
    if (mo && rings[mo.ring]) {
      var mr = rings[mo.ring - 1].to + 1;
      [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]].forEach(function (d, s) {
        var bl = byAB(mo.ring, d[0] * mr, d[1] * mr); if (!bl.length) return;
        bl.forEach(function (x) { x.use = 'monastery'; x.monastery = id + ':mon:' + s; });
        S.monasteries.push({ id: id + ':mon:' + s, spoke: s, dir: DIRS[s], colour: s, blocks: bl.map(function (x) { return x.id; }) });
      });
    }
    /* the gate markets: the axial blocks of the ring's inner row, either side of the avenue */
    var mk = o.markets === null ? null : merge({ ring: 2 }, o.markets);
    if (mk && rings[mk.ring]) {
      var kr = rings[mk.ring - 1].to + 1;
      CARD.forEach(function (C) {
        var bl = byAB(mk.ring, C.v[0] * kr, C.v[1] * kr); if (!bl.length) return;
        bl.forEach(function (x) { x.use = 'market'; x.market = id + ':mkt:' + C.d; });
        S.markets.push({ id: id + ':mkt:' + C.d, dir: C.d, ring: mk.ring, blocks: bl.map(function (x) { return x.id; }) });
      });
    }

    /* ---- the ways: four avenues from the perimeter to the landmark's wall, a ring street inside each ring (the kora
       the one named), the perimeter road, and each ring's cross streets from its inner ring street to its wall */
    var outerEnd = o.perimeter === false ? H[last] + Sw : H[last] + Sw / 2, innerEnd = H[0] - inset(WS[0], true);
    CARD.forEach(function (C) {
      S.ways.push({ id: id + ':av:' + C.d, kind: 'avenue', cls: 'avenue', w: A, pts: [[c[0] + C.v[0] * outerEnd, c[1] + C.v[1] * outerEnd], [c[0] + C.v[0] * innerEnd, c[1] + C.v[1] * innerEnd]],
        closed: false, ring: null, level: null, dir: C.d });
    });
    var koraRing = o.kora === null ? -1 : dflt(o.kora, 2);
    var ringWay = function (q, half, kind, level) {
      var w = { id: id + ':st:' + kind + ':' + q, kind: kind, cls: 'main', w: Sw, pts: square(c, half).map(function (p) { return [p[0], p[1]]; }), closed: true, ring: q, level: level, dir: null };
      S.ways.push(w);
      /* its crossings: the corners, the avenues and the cross streets that start on it */
      var add = function (x, z, kd) { S.crossings.push({ id: id + ':xg:' + q + ':' + r3(x - c[0]) + ':' + r3(z - c[1]), way: w.id, ring: q, kind: kd, x: x, z: z, chorten: kind === 'kora' }); };
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { add(c[0] + s[0] * half, c[1] + s[1] * half, 'corner'); });
      CARD.forEach(function (C) { add(c[0] + C.v[0] * half, c[1] + C.v[1] * half, 'avenue'); });
      if (q <= last) for (var m = -rings[q].to; m < rings[q].to; m++) {
        var cc = (m + 0.5) * P; if (Math.abs(cc) >= half - 1e-6) continue;
        [-1, 1].forEach(function (s) { add(c[0] + cc, c[1] + s * half, 'cross'); add(c[0] + s * half, c[1] + cc, 'cross'); });
      }
    };
    for (var q2 = 1; q2 <= last; q2++) ringWay(q2, Rin[q2], q2 === koraRing ? 'kora' : 'ring', lv[q2]);
    if (o.perimeter !== false) ringWay(last + 1, H[last] + Sw / 2, 'perimeter', base);
    for (var q3 = 1; q3 <= last; q3++) {
      var end = H[q3] - WS[q3].thick, rin = Rin[q3];
      for (var m = -rings[q3].to; m < rings[q3].to; m++) {
        var cc = (m + 0.5) * P;
        var segs = Math.abs(cc) <= rin + 1e-6 ? [['n', -rin, -end], ['s', rin, end]] : [['', -end, end]];
        segs.forEach(function (sg) {
          S.ways.push({ id: id + ':cross:' + q3 + ':x' + m + sg[0], kind: 'cross', cls: 'main', w: Sw, pts: [[c[0] + cc, c[1] + sg[1]], [c[0] + cc, c[1] + sg[2]]], closed: false, ring: q3, level: lv[q3], dir: 'ns' });
          S.ways.push({ id: id + ':cross:' + q3 + ':z' + m + (sg[0] === 'n' ? 'w' : sg[0] === 's' ? 'e' : ''), kind: 'cross', cls: 'main', w: Sw, pts: [[c[0] + sg[1], c[1] + cc], [c[0] + sg[2], c[1] + cc]], closed: false, ring: q3, level: lv[q3], dir: 'ew' });
        });
      }
    }

    /* ---- the walls: one round every ring on its outer face, a gate where each avenue crosses it */
    rings.forEach(function (r, q) {
      var W = WS[q], hc = H[q] - W.thick / 2, ft = H[q] - W.tower / 2, wid = id + ':wall:' + q, yOut = q === last ? base : lv[q + 1];
      /* s: along the centreline, clockwise from the north gate */
      var sOf = function (x, z) { x -= c[0]; z -= c[1];
        if (Math.abs(z + hc) < 1e-6 && x >= 0) return x; if (Math.abs(x - hc) < 1e-6) return hc + (z + hc);
        if (Math.abs(z - hc) < 1e-6) return 3 * hc + (hc - x); if (Math.abs(x + hc) < 1e-6) return 5 * hc + (hc - z); return 7 * hc + (x + hc); };
      var wall = { id: wid, ring: q, kind: W.kind, half: H[q], centre: hc, thick: W.thick, h: W.h, tower: W.tower, line: square(c, hc),
        gates: [], towers: [], runs: [], segs: [], nodes: [], yIn: lv[q], yOut: yOut };
      CARD.forEach(function (C) {
        var g = { id: wid + ':gate:' + C.d, dir: C.d, x: c[0] + C.v[0] * hc, z: c[1] + C.v[1] * hc, ry: Math.atan2(C.v[0], C.v[1]), out: C.v, w: A, way: id + ':av:' + C.d,
          yIn: lv[q], yOut: yOut, rise: lv[q] - yOut };
        wall.gates.push(g);
        var t = [-C.v[1], C.v[0]];
        [-1, 1].forEach(function (s) { var off = A / 2 + W.tower / 2;
          wall.towers.push({ id: g.id + ':' + (s < 0 ? 'l' : 'r'), kind: 'gate', x: c[0] + C.v[0] * ft + t[0] * off * s, z: c[1] + C.v[1] * ft + t[1] * off * s, size: W.tower, gate: g.id }); });
      });
      if (W.corners) [[1, -1, 'ne'], [1, 1, 'se'], [-1, 1, 'sw'], [-1, -1, 'nw']].forEach(function (s) {
        wall.towers.push({ id: wid + ':corner:' + s[2], kind: 'corner', x: c[0] + s[0] * ft, z: c[1] + s[1] * ft, size: W.tower, gate: null }); });
      if (W.towerGap > 0) CARD.forEach(function (C) {
        var t = [-C.v[1], C.v[0]];
        for (var m = 1; m * W.towerGap + W.tower * 1.5 < H[q] - W.tower; m++) [-1, 1].forEach(function (s) {
          var u = m * W.towerGap * s; if (Math.abs(u) - W.tower / 2 < A / 2 + W.tower * 1.5) return;
          wall.towers.push({ id: wid + ':curtain:' + C.d + ':' + (s < 0 ? '-' : '') + m, kind: 'curtain', x: c[0] + C.v[0] * ft + t[0] * u, z: c[1] + C.v[1] * ft + t[1] * u, size: W.tower, gate: null });
        });
      });
      /* the runs: from one gate's edge round the corner to the next gate's */
      [['ne', [A / 2, -hc], [hc, -hc], [hc, -A / 2]], ['se', [hc, A / 2], [hc, hc], [A / 2, hc]], ['sw', [-A / 2, hc], [-hc, hc], [-hc, A / 2]], ['nw', [-hc, -A / 2], [-hc, -hc], [-A / 2, -hc]]].forEach(function (rn) {
        var pts = rn.slice(1).map(function (p) { return [c[0] + p[0], c[1] + p[1]]; });
        wall.runs.push({ id: wid + ':run:' + rn[0], pts: pts });
        for (var e = 1; e < pts.length; e++) wall.segs.push({ ax: pts[e - 1][0], az: pts[e - 1][1], bx: pts[e][0], bz: pts[e][1], health: 2 });
      });
      /* core/city's wall nodes (25-city-site.js KCITY.site.wall's shape): the gates and the towers by s */
      wall.gates.forEach(function (g) { wall.nodes.push({ kind: 'gate', id: g.id, name: { n: 'North', e: 'East', s: 'South', w: 'West' }[g.dir] + ' Gate', named: true, crossed: true, square: true,
        x: g.x, z: g.z, gx: g.x, gz: g.z, s: sOf(g.x, g.z), ry: g.ry, health: 2, way: g.way }); });
      wall.towers.forEach(function (t) { if (t.kind === 'gate') return;
        /* its place on the centreline: onto the side it stands on */
        var px = t.x - c[0], pz = t.z - c[1], ew = Math.abs(px) >= Math.abs(pz);
        var on = ew ? [hc * Math.sign(px), Math.max(-hc, Math.min(hc, pz))] : [Math.max(-hc, Math.min(hc, px)), hc * Math.sign(pz)];
        wall.nodes.push({ kind: 'tower', id: t.id, x: t.x, z: t.z, gx: t.x, gz: t.z, s: sOf(c[0] + on[0], c[1] + on[1]), ry: 0, health: 2 }); });
      wall.nodes.sort(function (p, q4) { return p.s - q4.s; });
      S.walls.push(wall);
    });

    /* ---- the landmark: ring 0 inside its wall and the wall's towers */
    var lw = WS[0], lh = H[0] - inset(lw, true), L = merge({ key: 'temple_mountain', role: 'temple-mountain', h: 40 }, o.landmark);
    S.landmark = { id: id + ':landmark', kind: 'landmark', role: L.role, key: L.key, x: c[0], z: c[1], hw: lh, hd: lh, w: 2 * lh, d: 2 * lh, h: L.h, ry: 0, level: lv[0], poly: square(c, lh) };
    return S;
  };

  /* ---------------------------------------------------------------- the ground */
  K.squares.levelAt = function (S, x, z) {
    var d = Math.max(Math.abs(x - S.centre[0]), Math.abs(z - S.centre[1]));
    for (var k = 0; k < S.terraces.length; k++) if (d <= S.terraces[k].half) return S.terraces[k].y;
    return null;
  };
  K.squares.ground = function (S, h) {
    return function (x, z) { var y = K.squares.levelAt(S, x, z), g = h(x, z); return y == null ? g : Math.max(y, g); };
  };
  /* G: {N, cell, ext, h(x, z), at(i, j, k), add(k, dv)} (KCITY.ground.bank's). Fill only: no cell is lowered */
  K.squares.fill = function (G, S) {
    var N = G.N, cs = G.cell, E = G.ext, out = { cells: 0, max: 0, volume: 0 };
    for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
      var x = -E + i * cs, z = -E + j * cs, y = K.squares.levelAt(S, x, z); if (y == null) continue;
      var k = j * N + i, now = G.at(i, j, k); if (y <= now) continue;
      G.add(k, y - now); out.cells++; out.max = Math.max(out.max, y - now); out.volume += (y - now) * cs * cs;
    }
    return out;
  };

  /* ---------------------------------------------------------------- the blocks for frontage-courts */
  K.squares.courtBlocks = function (S, o) {
    o = o || {};
    var uses = o.uses || ['quarter'];
    return S.blocks.filter(function (b) { return uses.indexOf(b.use) >= 0; }).map(function (b) {
      return { id: b.id, i: b.cell[0], j: b.cell[1], poly: b.poly.map(function (p) { return [p[0], p[1]]; }), kind: b.pool, wealth: b.wealth, ring: b.ring, use: b.use,
        lanes: !!o.lanes, sides: 4 - b.walls.length, walls: b.walls.slice() };
    });
  };

  /* ---------------------------------------------------------------- laying it on the bound instance (steps 0-5) */
  K.squares.steps = function (S, o) {
    o = o || {};
    var tagged = function (t) { for (var i = 0; i < PLAN.ways.length; i++) if (PLAN.ways[i].tag === t) return PLAN.ways[i]; return null; };
    return [
      { name: 'the site and its ground', run: function () {
        TUNE.width = TUNE.width || {}; TUNE.width.avenue = S.avenue; TUNE.width.main = S.street;
        var need = Math.max(Math.abs(S.centre[0]), Math.abs(S.centre[1])) + S.reach + 4 * TUNE.cell;
        if (!(TUNE.rasterHalf >= need)) TUNE.rasterHalf = Math.ceil(need / TUNE.cell) * TUNE.cell;
        /* ground for lots only inside the blocks: the walls' clearances, the streets and the landmark's ring are not */
        var R = SL.R = new Raster(TUNE.rasterHalf, TUNE.cell), land = 0, zo = { dry: o.dry == null ? -1e9 : o.dry, maxSlope: o.maxSlope == null ? dflt(TUNE.maxSlope, 0.35) : o.maxSlope };
        R.occ.fill(OCC.OUT);
        S.blocks.forEach(function (b) { land += KCITY.site.zoneRaster(R, b.poly, zo); });
        PLAN.zone = S.zone; PLAN.squares = S;
        PLAN.site = S.rings.map(function (r) { return { id: r.ring, name: r.id, type: r.kind, role: r.kind, poly: r.poly }; });
        try { SL.minSpacing = KCITY.site.minSpacing(); } catch (e) { SL.minSpacing = S.street; }
        if (!(SL.minSpacing > 0)) SL.minSpacing = S.street;
        SL.note(0, 'nested squares: ' + S.n + ' x ' + S.n + ' blocks, ' + land + ' cells of ground'); } },
      { name: 'the landmark', run: function () {
        var M = S.landmark, bo = obb([M.x, M.z], [1, 0], M.hw, M.hd);
        var L = { id: PLAN.lots.length, cls: 'landmark', role: M.role, key: M.key, v: 0, slot: 0, wealth: 1, x: M.x, z: M.z, y: M.level, ry: M.ry, w: M.w, d: M.d, h: M.h,
          lot: bo, bo: bo, way: -1, side: 0, s: 0, born: 1, died: null, civic: true, sq: M.id };
        PLAN.lots.push(L); SL.hashLot(L); SL.register(L); PLAN.landmarks.push(L); SL.R.stampPoly(M.poly, OCC.HARD, L.id); } },
      { name: 'the rings', run: function () {
        S.rings.forEach(function (r) { PLAN.districts.push({ kind: r.kind, name: r.id, ring: r.ring, poly: r.poly, hole: r.hole, level: r.level, born: 2, art: [] }); });
        SL.note(2, S.rings.length + ' rings, ' + S.blocks.length + ' blocks, ' + S.monasteries.length + ' monasteries, ' + S.markets.length + ' gate markets'); } },
      { name: 'avenues and streets', run: function () {
        ['avenue', 'ring', 'kora', 'perimeter', 'cross'].forEach(function (kind) {
          S.ways.forEach(function (w) { if (w.kind === kind) { var way = SL.addWay(w.cls, w.pts, 3, { closed: w.closed, tag: w.id }); way.kind = w.kind; way.ring = w.ring; } });
        });
        SL.note(3, S.ways.length + ' ways (4 avenues, ' + S.ways.filter(function (w) { return w.closed; }).length + ' ring streets)'); } },
      { name: 'highways', run: function () { } },
      { name: 'the walls and their gates', run: function () {
        var R = SL.R, out = function (k) { if (R.occ[k] === OCC.FREE || R.occ[k] === OCC.LOT) { R.occ[k] = OCC.OUT; R.own[k] = -1; } };
        S.walls.forEach(function (W) {
          W.segs.forEach(function (sg) { R.eachNearSeg([sg.ax, sg.az], [sg.bx, sg.bz], W.thick / 2, out); });
          W.towers.forEach(function (t) { R.eachInPoly(square([t.x, t.z], t.size / 2), out); });
        });
        var O = S.walls[S.walls.length - 1];
        PLAN.walls = S.walls;
        PLAN.wallRec = { line: O.line, gates: O.nodes.filter(function (n) { return n.kind === 'gate'; }), segs: O.segs,
          nodes: O.nodes.map(function (n) { var m = merge(n); m.way = n.way ? tagged(n.way) : null; return m; }) };
        PLAN.wallRec.gates = PLAN.wallRec.nodes.filter(function (n) { return n.kind === 'gate'; });
        PLAN.gates = O.gates.map(function (g) { return { p: [g.x, g.z], dir: g.dir, id: g.id }; });
        SL.note(5, S.walls.length + ' walls, ' + S.walls.reduce(function (t, W) { return t + W.towers.length; }, 0) + ' towers'); } }];
  };

  /* frontage-courts on the blocks. frontage-courts fronts a block's first `sides` sides nearest its focus: the blocks
     clear of the walls take the centre and all four; one backing onto its wall takes a focus far off its wall's side,
     so the wall's side (or the corner's two) come last and are not fronted (the nearest-the-centre order is not enough:
     a block the wall has shortened can have a street side farther from the centre than its wall side). Each block
     draws from its own KRAND cell stream, so the order of the runs moves nothing */
  K.squares.infill = function (S, ctx, o) {
    var blocks = K.squares.courtBlocks(S, o), made = { ways: [], lots: [] }, N = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
    var take = function (r) { made.ways = made.ways.concat(r.ways); made.lots = made.lots.concat(r.lots); };
    var open = blocks.filter(function (b) { return !b.walls.length; });
    if (open.length) take(K.strategies['frontage-courts'].run(open, merge(ctx, { focus: S.centre, sides: 4 })));
    blocks.forEach(function (b) {
      if (!b.walls.length) return;
      var x = 0, z = 0; b.poly.forEach(function (p) { x += p[0] / b.poly.length; z += p[1] / b.poly.length; });
      b.walls.forEach(function (sd) { x -= N[sd][0] * 1e4; z -= N[sd][1] * 1e4; });
      take(K.strategies['frontage-courts'].run([b], merge(ctx, { focus: [x, z], sides: 4 - b.walls.length })));
    });
    made.blocks = blocks;
    return made;
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
