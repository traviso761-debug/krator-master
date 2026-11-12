/* ==================== core/pueblo 10: the plan: blocks of room cells, storeys stepped back from the plaza ([G data]) ==================== */
/* core/pueblo/README.md. A pueblo is room cells laid in BLOCKS round one or more PLAZAS: each block a run of cells ROWS deep,
   row 0 on the plaza side; the storeys rise row by row away from the plaza (the terraces), taper at a block's ends, and a
   scrap pueblo's columns may lose their top storey (ragged). Shapes (K.SHAPES): 'D' (a great house: an arc of rooms, a
   straight front, a spine splitting the plaza, as Pueblo Bonito), 'L', 'U', 'rect' (a court), 'line' (one block).
   No three.js, no DOM: this runs in Godot. Every draw is KRAND.hash(world, block, row, seg, salt): a cell's storeys never
   depend on how many draws came before it. Cells are convex quads in the plan (x, z), keyed by stable ids
   '<house>:<block>:<row>:<seg>'; their points run front-left, front-right, back-right, back-left (the front edge faces
   the plaza). The plan's origin is the centre of its footprint's box; +z is its front. */
(function (root) {
  'use strict';
  var K = root.KPUEBLO = root.KPUEBLO || { version: 1 };
  function rand() { var r = typeof KRAND !== 'undefined' ? KRAND : root.KRAND; if (!r) throw new Error('core/pueblo needs core/rand (08-core-rand.js) loaded first'); return r; }
  function space() { var s = typeof KSPACE !== 'undefined' ? KSPACE : root.KSPACE; if (!s) throw new Error('core/pueblo needs core/space (20-core-space.js) loaded first'); return s; }
  function d(x, v) { return x == null ? v : x; }
  K.d = d;
  K.space = space;
  /* a unit draw for one cell and salt: (world, block, row, seg, salt) */
  K.u = function (world, b, r, s, salt) { return rand().unit(rand().hash(world, b, r, s, salt)); };

  /* the defaults (metres): a room cell `along` x `deep`, a storey's height, the people a dwelling room holds */
  K.DEFAULTS = {
    along: 4.2, deep: 4.6, storey: 2.6, maxStoreys: 4, base: 1, rise: 1, ragged: 0.1, taperLen: 8.4, taperFloor: 1,
    ladderEvery: 3, people: 2.2, popMax: 2000, greatR: 8.5, smallR: 3.2, small: 2, kivaDepth: 2.4, gateW: 6, groundDoors: false
  };
  K.resolve = function (spec) {
    var Q = {}, k;
    for (k in K.DEFAULTS) Q[k] = K.DEFAULTS[k];
    for (k in spec) if (spec[k] != null) Q[k] = spec[k];
    Q.world = d(spec.world, 1) >>> 0;
    Q.id = d(spec.id, 'pueblo');
    return Q;
  };

  /* ---------------------------------------------------------------- the shapes: blocks and plazas
     A line block: from a to b, n the unit normal toward its plaza (rows grow away from it). An arc block: about c, row 0's
     front at radius r0, from angle a0 to a1 (x = cos a, z = sin a), the plaza inside. Per block: rows, base (row 0's
     storeys), rise (storeys per row), max, taper {a, b} (its ends step down), hero (the hero's rooms on its top terrace),
     entry (ladders up its outer face from outside: the way in when the plaza is closed). A plaza: {id, pts, open}. */
  function rectPts(x0, z0, x1, z1) { return [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]; }
  K.SHAPES = {
    D: function (sp, Q) {
      var R = d(sp.R, 72), rows = d(sp.rows, 5), D = Q.deep, r0 = R - rows * D, PI = Math.PI;
      var fr = d(sp.frontRows, 2), sw = D, spine = sp.spine !== false && r0 > 4 * D;
      var blocks = [
        { id: 'arc', kind: 'arc', c: [0, 0], r0: r0, a0: PI, a1: 2 * PI, rows: rows, max: Q.maxStoreys, taper: { a: true, b: true }, taperFloor: 2, hero: true },
        { id: 'front', kind: 'line', a: [-R, 0], b: [R, 0], n: [0, -1], rows: fr, base: 1, rise: d(sp.frontRise, 0), max: d(sp.frontMax, 1), entry: true }];
      var plazas = [];
      function arcPts(a0, a1, n) { var out = []; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; out.push([Math.cos(a) * r0, Math.sin(a) * r0]); } return out; }
      if (spine) {
        var zEnd = -Math.sqrt(r0 * r0 - sw * sw) + 0.1, as = PI + Math.acos(sw / r0);
        /* the spine: two one-row blocks back to back, a room on each side, its middle spineMax storeys, its ends one */
        var sm = d(sp.spineMax, 2);
        blocks.push({ id: 'spinew', kind: 'line', a: [-sw, 0], b: [-sw, zEnd], n: [-1, 0], rows: 1, base: sm, rise: 0, max: sm, taper: { a: true, b: true }, taperFloor: 1 },
          { id: 'spinee', kind: 'line', a: [sw, zEnd], b: [sw, 0], n: [1, 0], rows: 1, base: sm, rise: 0, max: sm, taper: { a: true, b: true }, taperFloor: 1 });
        /* west: from the spine's foot along the front to the arc's west end, round the arc to the spine (east: the mirror) */
        plazas.push({ id: 'west', pts: [[-sw, 0], [-r0, 0]].concat(arcPts(PI, as, 24).slice(1)) },
          { id: 'east', pts: arcPts(3 * PI - as, 2 * PI, 24).concat([[sw, 0]]) });
      } else {
        plazas.push({ id: 'plaza', pts: [[r0, 0], [-r0, 0]].concat(arcPts(PI, 2 * PI, 36).slice(1, -1)) });
      }
      return { blocks: blocks, plazas: plazas };
    },
    /* a wall across a pass (Barricade): one long block L metres across, its plaza side on z = 0 facing -z, its rows growing
       +z to a sheer outer face (the way up the pass); bastions at its ends (endRise storeys more within endLen of each
       end, where it meets the pass's walls); two wings running back up the pass along its walls; the plaza between them
       open upstream. passages: [{x, w, clear, kind ('gate' | 'culvert')}] cut through the wall at plan x, w wide, the rooms
       bridging it from storey `clear` up; keep-out strips run from each passage across the plaza (the trail, the river) */
    bar: function (sp, Q) {
      var L = d(sp.L, 180), rows = d(sp.rows, 4), D = Q.deep, wl = d(sp.wingLen, 48), wr = d(sp.wingRows, 2), xw = L / 2 - wr * D;
      var pass = (sp.passages || []).map(function (p, i) { return { id: 'wall:' + d(p.kind, 'gate') + i, t: L / 2 - p.x, w: d(p.w, 2 * Q.along), clear: d(p.clear, 2), kind: d(p.kind, 'gate') }; });
      var blocks = [{ id: 'wall', kind: 'line', a: [L / 2, 0], b: [-L / 2, 0], n: [0, -1], rows: rows, base: d(sp.wallBase, 2), rise: 1, max: Q.maxStoreys, hero: true,
        endRise: d(sp.endRise, 1), endLen: d(sp.endLen, 2 * Q.along), passages: pass }];
      if (wl > 0 && wr > 0) blocks.push(
        { id: 'wingw', kind: 'line', a: [-xw, -wl], b: [-xw, 0], n: [1, 0], rows: wr, base: 1, rise: 1, max: d(sp.wingMax, 3), taper: { a: true } },
        { id: 'winge', kind: 'line', a: [xw, 0], b: [xw, -wl], n: [-1, 0], rows: wr, base: 1, rise: 1, max: d(sp.wingMax, 3), taper: { b: true } });
      var x0 = wl > 0 && wr > 0 ? -xw : -L / 2, x1 = -x0, z0 = -Math.max(wl, d(sp.plazaD, 40));
      var keep = pass.map(function (p) { var x = L / 2 - p.t, h = p.w / 2 + 2; return { id: p.id, pts: rectPts(x - h, z0 - 1, x + h, 0) }; });
      return { blocks: blocks, plazas: [{ id: 'plaza', pts: rectPts(x0, z0, x1, 0), open: true }], keepOut: keep };
    },
    /* a court: the plaza pw x pd, blocks on all four sides (the back the tallest, the front one storey with the way in) */
    rect: function (sp, Q) { return court(sp, Q, true, true, true); },
    U: function (sp, Q) { return court(sp, Q, true, true, false); },
    L: function (sp, Q) { return court(sp, Q, true, false, false); },
    /* one block, its plaza a yard in front of it */
    line: function (sp, Q) {
      var L = d(sp.segs, 5) * Q.along, rows = d(sp.rows, 3), yard = d(sp.yard, 6);
      return { blocks: [{ id: 'block', kind: 'line', a: [-L / 2, 0], b: [L / 2, 0], n: [0, 1], rows: rows, max: Q.maxStoreys, hero: !!sp.hero, taper: sp.taper }],
        plazas: [{ id: 'yard', pts: rectPts(-L / 2, 0, L / 2, yard), open: true }] };
    }
  };
  function court(sp, Q, left, right, front) {
    var pw = d(sp.pw, 18), pd = d(sp.pd, 16), D = Q.deep, rb = d(sp.rows, 3), rs = d(sp.sideRows, 2), rf = d(sp.frontRows, 1);
    var x0 = -pw / 2, x1 = pw / 2, z0 = -pd / 2, z1 = pd / 2, el = left ? rs * D : 0, er = right ? rs * D : 0;
    var blocks = [{ id: 'back', kind: 'line', a: [x0 - el, z0], b: [x1 + er, z0], n: [0, 1], rows: rb, max: Q.maxStoreys, hero: true,
      taper: { a: !left, b: !right } }];
    if (left) blocks.push({ id: 'left', kind: 'line', a: [x0, z1], b: [x0, z0], n: [1, 0], rows: rs, max: Math.max(1, Q.maxStoreys - 1), taper: { a: !front } });
    if (right) blocks.push({ id: 'right', kind: 'line', a: [x1, z0], b: [x1, z1], n: [-1, 0], rows: rs, max: Math.max(1, Q.maxStoreys - 1), taper: { b: !front } });
    if (front) blocks.push({ id: 'front', kind: 'line', a: [x1 + er, z1], b: [x0 - el, z1], n: [0, -1], rows: rf, base: 1, rise: 0, max: 1, entry: true });
    return { blocks: blocks, plazas: [{ id: 'plaza', pts: rectPts(x0, z0, x1, z1), open: !front }] };
  }

  /* ---------------------------------------------------------------- the cells */
  function pol(c, r, a) { return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]; }
  function centroid(pts) { var x = 0, z = 0; for (var i = 0; i < pts.length; i++) { x += pts[i][0]; z += pts[i][1]; } return [x / pts.length, z / pts.length]; }
  K.centroid = centroid;
  /* the outward unit normal of edge p -> q, away from the point c */
  function outN(p, q, c) { var dx = q[0] - p[0], dz = q[1] - p[1], L = Math.hypot(dx, dz) || 1, nx = dz / L, nz = -dx / L, mx = (p[0] + q[0]) / 2 - c[0], mz = (p[1] + q[1]) / 2 - c[1];
    return nx * mx + nz * mz < 0 ? [-nx, -nz] : [nx, nz]; }
  K.outN = outN;
  function mkCell(Q, B, k, s, segs, pts, t, len) {
    var c = centroid(pts), r = 0;
    for (var i = 0; i < 4; i++) r = Math.max(r, Math.hypot(pts[i][0] - c[0], pts[i][1] - c[1]));
    return { id: Q.id + ':' + B.id + ':' + k + ':' + s, block: B.id, bi: B.bi, row: k, seg: s, segs: segs, pts: pts, cx: c[0], cz: c[1], r: r, t: t, len: len,
      n: outN(pts[0], pts[1], c), storeys: 0, base: 0, passage: null, hero: false, nb: { front: null, right: null, back: null, left: null } };
  }
  K.cells = function (blocks, Q) {
    var cells = [], D = Q.deep;
    blocks.forEach(function (B, bi) {
      B.bi = bi;
      for (var k = 0; k < B.rows; k++) {
        var s, segs, len, t0, t1;
        if (B.kind === 'arc') {
          var rf = B.r0 + k * D, rb = rf + D, span = B.a1 - B.a0;
          len = Math.abs(span) * (rf + rb) / 2; segs = Math.max(1, Math.round(len / Q.along));
          for (s = 0; s < segs; s++) {
            t0 = B.a0 + span * s / segs; t1 = B.a0 + span * (s + 1) / segs;
            cells.push(mkCell(Q, B, k, s, segs, [pol(B.c, rf, t0), pol(B.c, rf, t1), pol(B.c, rb, t1), pol(B.c, rb, t0)], (s + 0.5) * len / segs, len));
          }
        } else {
          var dx = B.b[0] - B.a[0], dz = B.b[1] - B.a[1], ux, uz, o0 = k * D, o1 = (k + 1) * D, nx = B.n[0], nz = B.n[1];
          len = Math.hypot(dx, dz); ux = dx / len; uz = dz / len; segs = Math.max(1, Math.round(len / Q.along));
          var P = function (t, o) { return [B.a[0] + ux * t - nx * o, B.a[1] + uz * t - nz * o]; };
          for (s = 0; s < segs; s++) {
            t0 = len * s / segs; t1 = len * (s + 1) / segs;
            var cl = mkCell(Q, B, k, s, segs, [P(t0, o0), P(t1, o0), P(t1, o1), P(t0, o1)], (t0 + t1) / 2, len);
            /* a passage under the block: this column's rooms start at its clear storey (they bridge the gate or the culvert) */
            (B.passages || []).forEach(function (p) { if (Math.abs(cl.t - p.t) < p.w / 2) { cl.base = p.clear; cl.passage = p.id; } });
            cells.push(cl);
          }
        }
      }
    });
    return cells;
  };
  /* move every plan point by (ox, oz): the plan's origin to its footprint's centre */
  K.shift = function (cells, plazas, ox, oz, keep) {
    cells.forEach(function (c) { c.pts = c.pts.map(function (p) { return [p[0] + ox, p[1] + oz]; }); c.cx += ox; c.cz += oz; });
    plazas.concat(keep || []).forEach(function (p) { p.pts = p.pts.map(function (q) { return [q[0] + ox, q[1] + oz]; }); });
  };
  K.boundsOf = function (cells) {
    var b = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 };
    cells.forEach(function (c) { c.pts.forEach(function (p) { b.x0 = Math.min(b.x0, p[0]); b.x1 = Math.max(b.x1, p[0]); b.z0 = Math.min(b.z0, p[1]); b.z1 = Math.max(b.z1, p[1]); }); });
    return b;
  };

  /* ---------------------------------------------------------------- the neighbours: which cell touches each edge
     An edge touches another cell's edge when one's midpoint lies within TOL of the other and they run parallel. The
     spatial index is core/space's (no grid of our own). nb.front is the cell (or none: the ground) before the front face. */
  K.EDGES = [['front', 0, 1], ['right', 1, 2], ['back', 2, 3], ['left', 3, 0]];
  var TOL = 0.35;
  function segDist(x, z, p, q) { var dx = q[0] - p[0], dz = q[1] - p[1], L2 = dx * dx + dz * dz, t = L2 > 0 ? ((x - p[0]) * dx + (z - p[1]) * dz) / L2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(x - p[0] - dx * t, z - p[1] - dz * t); }
  K.segDist = segDist;
  function par(a, b, p, q) { var ax = b[0] - a[0], az = b[1] - a[1], px = q[0] - p[0], pz = q[1] - p[1], la = Math.hypot(ax, az) || 1, lp = Math.hypot(px, pz) || 1;
    return Math.abs((ax * px + az * pz) / (la * lp)) > 0.85; }
  K.link = function (cells) {
    var S = space().create({ cell: 12 }), byId = {};
    cells.forEach(function (c) { S.insert(c, c.cx, c.cz, c.r); byId[c.id] = c; });
    function touch(c, a, b) {
      var mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, hit = null;
      S.some(mx, mz, 0.6, function (o) {
        if (o === c) return false;
        for (var j = 0; j < 4; j++) {
          var p = o.pts[j], q = o.pts[(j + 1) % 4];
          if (!par(a, b, p, q)) continue;
          if (segDist(mx, mz, p, q) < TOL || segDist((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, a, b) < TOL) { hit = o; return true; }
        }
        return false;
      });
      return hit;
    }
    cells.forEach(function (c) {
      K.EDGES.forEach(function (E) { var h = touch(c, c.pts[E[1]], c.pts[E[2]]); c.nb[E[0]] = h ? h.id : null; });
    });
    return byId;
  };

  /* ---------------------------------------------------------------- the storeys: the terraces */
  K.storeys = function (cells, blocks, Q, byId) {
    cells.forEach(function (c) {
      var B = blocks[c.bi], max = d(B.max, Q.maxStoreys), s = Math.min(max, d(B.base, Q.base) + d(B.rise, Q.rise) * c.row);
      if (B.taper) {
        var tl = d(B.taperLen, Q.taperLen), fl = d(B.taperFloor, Q.taperFloor), half = c.len / c.segs / 2;
        if (B.taper.a) s = Math.min(s, fl + Math.floor((c.t - half) / tl));
        if (B.taper.b) s = Math.min(s, fl + Math.floor((c.len - c.t - half) / tl));
      }
      /* bastions: a block's ends stand endRise storeys higher where it meets the pass's walls */
      if (B.endRise && (c.t < d(B.endLen, 8.4) || c.len - c.t < d(B.endLen, 8.4))) s += B.endRise;
      c.hero = !!B.hero && c.row === B.rows - 1 && Math.abs(c.t / c.len - 0.5) < d(B.heroSpan, 0.07) && s === max && !c.passage;
      /* a scrap pueblo's raw edges: a column that never got its top storey (the hero's never) */
      if (!c.hero && K.u(Q.world, c.bi, c.row, c.seg, 11) < d(B.ragged, Q.ragged)) s -= 1;
      c.storeys = Math.max(1, s);
      /* a column over a passage keeps at least one room above it */
      if (c.base) c.storeys = Math.max(c.storeys, c.base + 1);
    });
    /* a terrace is never higher than the cell behind it: from the back row forward, within each block */
    cells.slice().sort(function (a, b) { return b.row - a.row || (a.id < b.id ? -1 : 1); }).forEach(function (c) {
      var b = c.nb.back && byId[c.nb.back];
      if (b && b.bi === c.bi && b.row === c.row + 1) c.storeys = Math.min(c.storeys, b.storeys);
    });
    /* at least one hero column in a hero block: the outer row's tallest, nearest the middle */
    blocks.forEach(function (B) {
      if (!B.hero) return;
      var mine = cells.filter(function (c) { return c.bi === B.bi && c.row === B.rows - 1; });
      if (!mine.length || mine.some(function (c) { return c.hero; })) return;
      mine.sort(function (a, b) { return b.storeys - a.storeys || Math.abs(a.t / a.len - 0.5) - Math.abs(b.t / b.len - 0.5); })[0].hero = true;
    });
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
