/* ==================== core/pueblo 20: the rooms and the way up: doors, hatches, ladders, the reach graph ([G data]) ==================== */
/* Every column of a cell holds `storeys` rooms (storey 0 the stores below, the rest dwellings; the hero's room on a hero
   column's top). A room is entered:
     by a DOOR onto the terrace before it, when that terrace (the roof of the cell in front) is at the room's floor;
     else by a HATCH: from the room above, or from the roof when it is the column's top.
   No door opens at the ground unless the spec asks (groundDoors): the scrap pueblo's, the Kimr's rule (ladders pulled up at
   night). LADDERS join the levels: from the ground in front of a row-0 face (the plaza, or outside) up onto its roof, from
   one terrace up to the next roof behind it (every `ladderEvery` cells, zigzagging row by row), up an `entry` block's outer
   face from outside (the way in when the plaza is closed); then any terrace still out of reach gets one from a reachable
   neighbour (K.reach, K.mend). Nodes of the reach graph: 'out' (outside), each plaza id, each cell id (its roof), each room
   id, each kiva id. No three.js, no DOM. */
(function (root) {
  'use strict';
  var K = root.KPUEBLO;
  if (!K) throw new Error('core/pueblo: load 10-pueblo-plan.js first');
  var d = K.d;

  /* ---------------------------------------------------------------- the plazas: inside, clearance */
  K.inPoly = function (pts, x, z) {
    var inside = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var a = pts[i], b = pts[j];
      if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    return inside;
  };
  /* the distance from (x, z) to the polygon's nearest edge */
  K.clearance = function (pts, x, z) {
    var m = 1e9;
    for (var i = 0; i < pts.length; i++) m = Math.min(m, K.segDist(x, z, pts[i], pts[(i + 1) % pts.length]));
    return m;
  };
  /* the ground before a point: the plaza holding it, else outside */
  K.groundAt = function (P, x, z) {
    for (var i = 0; i < P.plazas.length; i++) if (K.inPoly(P.plazas[i].pts, x, z)) return P.plazas[i].id;
    return 'out';
  };
  function edgeOf(c, side) { for (var i = 0; i < 4; i++) if (K.EDGES[i][0] === side) return [c.pts[K.EDGES[i][1]], c.pts[K.EDGES[i][2]]]; return null; }
  K.edgeOf = edgeOf;

  /* ---------------------------------------------------------------- the rooms and the roof hatches */
  K.rooms = function (P, Q) {
    var rooms = [], hatches = [], h = Q.storey, byId = P.byId;
    P.cells.forEach(function (c) {
      var f = c.nb.front && byId[c.nb.front], ft = f ? f.storeys : 0, base = c.base || 0, Lf = Math.hypot(c.pts[1][0] - c.pts[0][0], c.pts[1][1] - c.pts[0][1]);
      for (var j = base; j < c.storeys; j++) {
        var top = j === c.storeys - 1, use = j === 0 ? 'store' : (c.hero && top ? 'hero' : 'home');
        /* u: the door's or window's place along the front wall from its middle; every room joins the rooms above and below by a hatch */
        var r = { id: c.id + ':' + j, cell: c.id, storey: j, y0: j * h, h: h, use: use, face: null, entry: null,
          u: +((K.u(Q.world, c.bi, c.row * 16 + j, c.seg, 92) - 0.5) * Math.max(0, Lf - 2.4)).toFixed(3), hatchUp: true, hatchDown: j > base };
        if (j === ft && (j > 0 || Q.groundDoors)) { r.face = 'door'; r.entry = { by: 'door', from: f ? f.id : K.groundAt(P, c.cx + c.n[0] * (c.r + 1), c.cz + c.n[1] * (c.r + 1)) }; }
        else {
          if (j > ft && j > 0 && K.u(Q.world, c.bi, c.row * 16 + j, c.seg, 23) < 0.45) r.face = 'window';
          r.entry = { by: 'hatch', from: top ? c.id : c.id + ':' + (j + 1) };
        }
        rooms.push(r);
      }
      /* the roof hatch, toward the back-left corner (the back wall stays free for a bed); a ladder stands out of some (the climb from the room below) */
      var bl = c.pts[3];
      hatches.push({ id: c.id + ':hatch', cell: c.id, room: c.id + ':' + (c.storeys - 1), x: c.cx + (bl[0] - c.cx) * 0.55, z: c.cz + (bl[1] - c.cz) * 0.55, y: c.storeys * h,
        ladder: K.u(Q.world, c.bi, c.row, c.seg, 29) < 0.3 });
    });
    P.rooms = rooms; P.hatches = hatches;
  };

  /* ---------------------------------------------------------------- the ladders */
  /* a ladder against cell hi's edge `side`, standing on lo (a cell id) or on the ground (a ground node), its foot .55 m out */
  function ladder(P, Q, kind, hi, side, lo, y0, why) {
    var e = edgeOf(hi, side), mx = (e[0][0] + e[1][0]) / 2, mz = (e[0][1] + e[1][1]) / 2, n = K.outN(e[0], e[1], [hi.cx, hi.cz]);
    var id = hi.id + ':ladder:' + side;
    for (var i = 0; i < P.ladders.length; i++) if (P.ladders[i].id === id) return null;
    var L = { id: id, kind: kind, x: mx + n[0] * 0.55, z: mz + n[1] * 0.55, ry: Math.atan2(n[0], n[1]), y0: y0, y1: hi.storeys * Q.storey, from: lo, to: hi.id,
      night: lo === 'out' || P.plazas.some(function (p) { return p.id === lo; }), why: why };
    P.ladders.push(L);
    return L;
  }
  K.ladders = function (P, Q) {
    var byId = P.byId, every = Math.max(1, Q.ladderEvery | 0), h = Q.storey;
    P.ladders = [];
    P.cells.forEach(function (c) {
      var B = P.blocks[c.bi], f = c.nb.front && byId[c.nb.front], beat = (c.seg + 2 * c.row + (K.u(Q.world, c.bi, 0, 0, 31) * every | 0)) % every === 0;
      if (!f) {
        /* the ground before a front face: up onto its roof */
        if (beat) ladder(P, Q, 'ground', c, 'front', K.groundAt(P, c.cx + c.n[0] * (c.r + 1), c.cz + c.n[1] * (c.r + 1)), 0, 'the ground before it');
      } else if (beat && f.storeys < c.storeys) {
        /* a terrace up to the roof behind it */
        ladder(P, Q, 'terrace', c, 'front', f.id, f.storeys * h, 'the terrace before it');
      }
      /* the way in: an entry block's outer face, from outside */
      if (B.entry && c.row === B.rows - 1 && !c.nb.back && (c.seg + 1) % (2 * every) === 0) ladder(P, Q, 'entry', c, 'back', 'out', 0, 'the way in');
    });
  };

  /* ---------------------------------------------------------------- the reach graph */
  K.graph = function (P) {
    var G = {}, byId = P.byId, h = P.storey;
    function link(a, b) { (G[a] || (G[a] = [])).push(b); (G[b] || (G[b] = [])).push(a); }
    G.out = G.out || [];
    P.plazas.forEach(function (p) { G[p.id] = G[p.id] || []; if (p.open) link('out', p.id); });
    P.cells.forEach(function (c) {
      G[c.id] = G[c.id] || [];
      for (var s in c.nb) { var o = c.nb[s] && byId[c.nb[s]]; if (o && o.storeys === c.storeys && c.id < o.id) link(c.id, o.id); }
    });
    P.ladders.forEach(function (L) { link(L.from, L.to); });
    (P.rooms || []).forEach(function (r) { link(r.id, r.entry.from); });
    (P.kivas || []).forEach(function (k) { link(k.id, k.plaza); });
    /* a column's rooms are joined by their hatches; a gate joins the outside to the plaza behind it */
    (P.rooms || []).forEach(function (r) { if (r.hatchDown) link(r.id, r.cell + ':' + (r.storey - 1)); });
    (P.passages || []).forEach(function (p) { if (p.kind === 'gate' && p.plaza) link('out', p.plaza); });
    return G;
  };
  K.reach = function (P) {
    var G = K.graph(P), seen = { out: true }, q = ['out'];
    while (q.length) { var a = q.shift(), nb = G[a] || []; for (var i = 0; i < nb.length; i++) if (!seen[nb[i]]) { seen[nb[i]] = true; q.push(nb[i]); } }
    return seen;
  };
  /* every roof reachable: a roof still out of reach gets a ladder from a reachable neighbour (or the ground before it) */
  K.mend = function (P, Q) {
    var byId = P.byId, h = Q.storey;
    for (var pass = 0; pass < 60; pass++) {
      var seen = K.reach(P), left = P.cells.filter(function (c) { return !seen[c.id]; });
      if (!left.length) return 0;
      var added = 0;
      left.forEach(function (c) {
        if (added && K.reach(P)[c.id]) return;
        for (var e = 0; e < 4; e++) {
          var side = K.EDGES[e][0], o = c.nb[side] && byId[c.nb[side]];
          if (o && seen[o.id] && o.storeys !== c.storeys) {
            var hi = o.storeys > c.storeys ? o : c, lo = hi === o ? c : o, hs = side;
            if (hi === o) { for (var k = 0; k < 4; k++) if (o.nb[K.EDGES[k][0]] === c.id) hs = K.EDGES[k][0]; if (hs === side && o.nb[side] !== c.id) continue; }
            if (ladder(P, Q, 'mend', hi, hs, lo.id, lo.storeys * h, 'a terrace out of reach')) { added++; return; }
          }
        }
        if (!c.nb.front) { var g = K.groundAt(P, c.cx + c.n[0] * (c.r + 1), c.cz + c.n[1] * (c.r + 1)); if (seen[g] && ladder(P, Q, 'mend', c, 'front', g, 0, 'a terrace out of reach')) added++; }
      });
      if (!added) return left.length;
    }
    return -1;
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
