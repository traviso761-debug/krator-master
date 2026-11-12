/* ==================== core/pueblo 30: the court: kivas, the enclosure, the census; KPUEBLO.house, register, check ([G data]) ==================== */
/* KPUEBLO.house(spec) -> P, the whole plan as plain records:
     P.cells    {id, block, row, seg, pts, cx, cz, n (the front's outward normal), storeys, hero, nb {front, right, back, left}}
     P.rooms    {id, cell, storey, y0, h, use ('store' | 'home' | 'hero'), face ('door' | 'window' | null), entry {by, from}}
     P.hatches  {id, cell, room, x, z, y, ladder}        P.ladders {id, kind, x, z, ry, y0, y1, from, to, night}
     P.plazas   {id, pts, open, cx, cz, area}            P.kivas   {id, plaza, x, z, r, depth, great, hatch: {x, z}}
     P.enclosure {margin, pts (a ring), gate {x, z, w, ry}} | null      P.hull (the footprint's convex hull)
     P.census   {cells, rooms, homes, stores, hero, ladders, kivas, maxStoreys, pop, households, popMax, over}
     P.bounds   {x0, x1, z0, z1, w, d, h}, P.storey, P.errors
   Kivas: a GREAT kiva (the round room) in each plaza the spec names, at the plaza's most open point; SMALL kivas drawn
   from KRAND where they clear the blocks and each other (core/space for the overlap). KPUEBLO.register(P, T, o) puts every
   record in a core/tags registry before a host draws it. KPUEBLO.check: the invariants test-pueblo.js and a page's
   --assert run. No three.js, no DOM. */
(function (root) {
  'use strict';
  var K = root.KPUEBLO;
  if (!K || !K.rooms) throw new Error('core/pueblo: load 10-pueblo-plan.js and 20-pueblo-access.js first');
  var d = K.d;

  function polyArea(pts) { var a = 0; for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
  K.polyArea = polyArea;
  function polyBox(pts) { var b = [1e9, 1e9, -1e9, -1e9]; pts.forEach(function (p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); }); return b; }

  /* ---------------------------------------------------------------- the kivas */
  K.kivas = function (P, Q) {
    var kv = Q.kivas || {}, great = kv.great == null ? [0] : kv.great, small = d(kv.small, Q.small), out = [], S = K.space().create({ cell: 16 });
    var gr = d(kv.greatR, Q.greatR), sr = d(kv.smallR, Q.smallR), dep = Q.kivaDepth;
    var keep = P.keepOut || [];
    /* clear of every keep-out strip (a passage's trail or river across the plaza) by r + 1 */
    function kept(x, z, r) { return keep.some(function (k) { return K.inPoly(k.pts, x, z) || K.clearance(k.pts, x, z) < r + 1; }); }
    function free(x, z, r) { return !S.some(x, z, r + 3 + gr, function (k) { return Math.hypot(k.x - x, k.z - z) < k.r + r + 3; }); }
    function put(pl, x, z, r, isGreat) {
      var k = { id: Q.id + ':kiva:' + out.length, plaza: pl.id, x: x, z: z, r: r, depth: isGreat ? dep + 0.6 : dep, roof: 0.45, great: isGreat,
        hatch: { x: x + r * 0.3, z: z - r * 0.25 } };
      out.push(k); S.insert(k, x, z, r);
    }
    /* the great kiva: the plaza's most open point (a 1 m scan for the largest clearance from its edges) */
    great.forEach(function (pi) {
      var pl = P.plazas[pi]; if (!pl) return;
      var b = polyBox(pl.pts), best = null;
      for (var x = Math.ceil(b[0]); x <= b[2]; x += 1) for (var z = Math.ceil(b[1]); z <= b[3]; z += 1) {
        if (!K.inPoly(pl.pts, x, z)) continue;
        var c = K.clearance(pl.pts, x, z);
        for (var ki = 0; ki < keep.length; ki++) c = Math.min(c, K.inPoly(keep[ki].pts, x, z) ? 0 : K.clearance(keep[ki].pts, x, z) + 3);
        if (!best || c > best.c + 1e-9) best = { x: x, z: z, c: c };
      }
      if (best && best.c > 6) put(pl, best.x, best.z, Math.min(gr, best.c - 4), true);
    });
    /* the small kivas: KRAND draws in each plaza in turn, kept where they clear the blocks by 2.5 m and the others by 3 */
    for (var i = 0, tries = 0; i < small && tries < 400; tries++) {
      var pl = P.plazas[tries % P.plazas.length], b2 = polyBox(pl.pts), u = K.u(Q.world, 900, tries, 0, 41), v = K.u(Q.world, 900, tries, 1, 41);
      var x2 = b2[0] + (b2[2] - b2[0]) * u, z2 = b2[1] + (b2[3] - b2[1]) * v, r2 = sr * (0.85 + 0.3 * K.u(Q.world, 900, tries, 2, 41));
      if (!K.inPoly(pl.pts, x2, z2) || K.clearance(pl.pts, x2, z2) < r2 + 2.5 || !free(x2, z2, r2) || kept(x2, z2, r2)) continue;
      put(pl, x2, z2, r2, false); i++;
    }
    P.kivas = out;
  };

  /* ---------------------------------------------------------------- the passages: a gate or a culvert under a block's rooms
     {id, kind, clear (storeys), h (metres), cells, x0, x1, z0, z1 (the plan box of its columns), x, z (its middle), plaza (the
     plaza its inner mouth opens on), ry (the yaw from the outer mouth to the plaza)} */
  K.passages = function (P) {
    var by = {}, out = [];
    P.cells.forEach(function (c) { if (c.passage) (by[c.passage] || (by[c.passage] = [])).push(c); });
    Object.keys(by).sort().forEach(function (id) {
      var cs = by[id], b = K.boundsOf(cs), front = cs.filter(function (c) { return c.row === 0; })[0] || cs[0], kind = id.split(':')[1].replace(/\d+$/, '');
      out.push({ id: P.id + ':' + id, kind: kind, clear: cs[0].base, h: cs[0].base * P.storey, cells: cs.map(function (c) { return c.id; }), x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1,
        x: (b.x0 + b.x1) / 2, z: (b.z0 + b.z1) / 2, plaza: K.groundAt(P, front.cx + front.n[0] * (front.r + 1), front.cz + front.n[1] * (front.r + 1)),
        ry: Math.atan2(front.n[0], front.n[1]) });
    });
    P.passages = out;
  };
  /* ---------------------------------------------------------------- the hull and the enclosure */
  K.hull = function (pts) {
    var p = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }), lo = [], hi = [], i;
    function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    for (i = 0; i < p.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p[i]) <= 0) lo.pop(); lo.push(p[i]); }
    for (i = p.length - 1; i >= 0; i--) { while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p[i]) <= 0) hi.pop(); hi.push(p[i]); }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  };
  /* the hull grown by m (each vertex pushed out along its corner's bisector), then resampled every ~step metres */
  K.grow = function (hull, m, step) {
    var n = hull.length, out = [], i;
    for (i = 0; i < n; i++) {
      var a = hull[(i + n - 1) % n], b = hull[i], c = hull[(i + 1) % n];
      var e1 = [b[0] - a[0], b[1] - a[1]], e2 = [c[0] - b[0], c[1] - b[1]];
      var l1 = Math.hypot(e1[0], e1[1]) || 1, l2 = Math.hypot(e2[0], e2[1]) || 1;
      var na = [e1[1] / l1, -e1[0] / l1], nb = [e2[1] / l2, -e2[0] / l2], bx = na[0] + nb[0], bz = na[1] + nb[1], bl = Math.hypot(bx, bz) || 1;
      var k = m / Math.max(0.35, (na[0] * bx + na[1] * bz) / bl);
      out.push([b[0] + bx / bl * k, b[1] + bz / bl * k]);
    }
    if (!step) return out;
    var res = [];
    for (i = 0; i < out.length; i++) {
      var p = out[i], q = out[(i + 1) % out.length], L = Math.hypot(q[0] - p[0], q[1] - p[1]), s = Math.max(1, Math.round(L / step));
      for (var j = 0; j < s; j++) res.push([p[0] + (q[0] - p[0]) * j / s, p[1] + (q[1] - p[1]) * j / s]);
    }
    return res;
  };
  K.enclosure = function (P, Q) {
    var m = Q.enclosure;
    if (m == null || !(m > 0)) { P.enclosure = null; return; }
    var ring = K.grow(P.hull, m, 2), gx = d(Q.gateX, 0), best = null;
    /* the gate: where the ring crosses x = gateX on its front (the largest z) */
    for (var i = 0; i < ring.length; i++) {
      var p = ring[i], q = ring[(i + 1) % ring.length];
      if ((p[0] - gx) * (q[0] - gx) > 0 || p[0] === q[0]) continue;
      var t = (gx - p[0]) / (q[0] - p[0]), z = p[1] + (q[1] - p[1]) * t;
      /* the ring runs counter-clockwise (x, z as x, y): its outward normal is (dz, -dx); the gate faces along it */
      if (!best || z > best.z) best = { x: gx, z: z, i: i, ry: Math.atan2(q[1] - p[1], -(q[0] - p[0])) };
    }
    P.enclosure = { margin: m, pts: ring, gate: best ? { x: best.x, z: best.z, w: Q.gateW, ry: best.ry, edge: best.i } : null };
  };

  /* ---------------------------------------------------------------- the census */
  K.census = function (P, Q) {
    var n = { store: 0, home: 0, hero: 0 };
    P.rooms.forEach(function (r) { n[r.use]++; });
    var homes = n.home + n.hero, pop = Math.round(homes * Q.people);
    P.census = { cells: P.cells.length, rooms: P.rooms.length, homes: homes, stores: n.store, hero: n.hero, ladders: P.ladders.length, kivas: P.kivas.length,
      maxStoreys: Math.max.apply(null, P.cells.map(function (c) { return c.storeys; })), pop: pop, households: Math.round(pop / 5), popMax: Q.popMax, over: pop > Q.popMax };
  };

  /* ---------------------------------------------------------------- the house */
  K.house = function (spec) {
    spec = spec || {};
    var Q = K.resolve(spec), shape = K.SHAPES[d(spec.shape, 'D')];
    var P = { id: Q.id, shape: d(spec.shape, 'D'), world: Q.world, storey: Q.storey, errors: [] };
    if (!shape) { P.errors.push('unknown shape ' + spec.shape); return P; }
    var S = shape(spec, Q);
    P.blocks = S.blocks; P.plazas = S.plazas; P.keepOut = S.keepOut || [];
    P.cells = K.cells(P.blocks, Q);
    /* the origin to the footprint's centre */
    var b = K.boundsOf(P.cells), ox = -(b.x0 + b.x1) / 2, oz = -(b.z0 + b.z1) / 2;
    K.shift(P.cells, P.plazas, ox, oz, P.keepOut);
    P.offset = [ox, oz];
    P.byId = K.link(P.cells);
    K.storeys(P.cells, P.blocks, Q, P.byId);
    P.plazas.forEach(function (p) { var c = K.centroid(p.pts), bx = polyBox(p.pts); p.cx = c[0]; p.cz = c[1]; p.area = Math.abs(polyArea(p.pts)); p.w = bx[2] - bx[0]; p.d = bx[3] - bx[1]; p.open = !!p.open; });
    K.passages(P);
    K.rooms(P, Q);
    K.ladders(P, Q);
    K.kivas(P, Q);
    var left = K.mend(P, Q);
    if (left) P.errors.push(left + ' roofs out of reach');
    var all = []; P.cells.forEach(function (c) { all.push.apply(all, c.pts); });
    P.hull = K.hull(all);
    K.enclosure(P, Q);
    K.census(P, Q);
    var bb = K.boundsOf(P.cells);
    P.bounds = { x0: bb.x0, x1: bb.x1, z0: bb.z0, z1: bb.z1, w: bb.x1 - bb.x0, d: bb.z1 - bb.z0, h: P.census.maxStoreys * Q.storey };
    P.blocks = P.blocks.map(function (B) { return { id: B.id, kind: B.kind, rows: B.rows, hero: !!B.hero, entry: !!B.entry }; });
    if (P.census.over) P.errors.push('pop ' + P.census.pop + ' over ' + Q.popMax);
    Object.defineProperty(P, 'byId', { value: P.byId, enumerable: false });
    return P;
  };

  /* a digest of the plan (FNV-1a over its records' text): equal digests, equal plans */
  K.digest = function (P) {
    var s = JSON.stringify([P.cells.map(function (c) { return [c.id, c.storeys, c.hero ? 1 : 0, c.pts.map(function (p) { return [+p[0].toFixed(3), +p[1].toFixed(3)]; })]; }),
      P.ladders.map(function (L) { return [L.id, +L.x.toFixed(3), +L.z.toFixed(3), L.y0, L.y1]; }), P.kivas.map(function (k) { return [k.id, +k.x.toFixed(3), +k.z.toFixed(3), +k.r.toFixed(3)]; }),
      P.rooms.map(function (r) { return r.id + r.use + (r.face || ''); }).join(',')]), h = 0x811C9DC5;
    for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
    return ('0000000' + (h >>> 0).toString(16)).slice(-8);
  };

  /* ---------------------------------------------------------------- core/tags: every record registered before a host draws it
     T a KTAGS registry; o {parent (an id: each record its child), at(x, y, z) -> [x, y, z] world (default as is), ry (the
     plan's yaw in the world), culture, name (the house's name, for the records' names), frag}. Returns {ids: plan id -> tag id,
     count}. Rooms, kivas and plazas are 'part's, ladders 'fixture's. */
  K.register = function (P, T, o) {
    o = o || {};
    var at = o.at || function (x, y, z) { return [x, y, z]; }, ry = d(o.ry, 0), cul = o.culture, nm = d(o.name, 'A pueblo'), ids = {}, n = 0, byId = P.byId;
    function add(id, rec) { rec.tags = rec.tags || {}; if (cul) rec.tags.culture = cul; rec.note = id; if (o.frag) rec.src = o.frag; var r = o.parent ? T.child(o.parent, rec) : T.add(rec); ids[id] = r.id; n++; }
    P.plazas.forEach(function (p) { add(p.id, { 'class': 'part', kind: 'plaza', key: 'pueblo-plaza', name: nm + ': the ' + p.id + ' plaza', at: at(p.cx, 0, p.cz), ry: ry, size: [p.w, p.d, 0.1], tags: { part: 'plaza' } }); });
    P.rooms.forEach(function (r) {
      var c = byId[r.cell], fl = Math.hypot(c.pts[1][0] - c.pts[0][0], c.pts[1][1] - c.pts[0][1]), dp = Math.hypot(c.pts[3][0] - c.pts[0][0], c.pts[3][1] - c.pts[0][1]);
      add(r.id, { 'class': 'part', kind: 'room', key: 'pueblo-room', name: nm + ': a room (' + r.use + ', storey ' + (r.storey + 1) + ')', at: at(c.cx, r.y0, c.cz),
        ry: ry + Math.atan2(c.n[0], c.n[1]), size: [+fl.toFixed(3), +dp.toFixed(3), r.h], tags: { part: 'room', role: r.use, level: String(r.storey) } });
    });
    P.kivas.forEach(function (k) { add(k.id, { 'class': 'part', kind: 'kiva', key: 'pueblo-kiva', name: nm + (k.great ? ': the great kiva (the round room)' : ': a kiva'), at: at(k.x, -k.depth, k.z), ry: ry,
      r: k.r, h: k.depth + k.roof, tags: { part: 'kiva', role: k.great ? 'meeting' : 'kiva' } }); });
    P.ladders.forEach(function (L) { add(L.id, { 'class': 'fixture', kind: 'ladder', key: 'pueblo-ladder', name: nm + ': a ladder (' + L.why + ')', at: at(L.x, L.y0, L.z), ry: ry + L.ry,
      size: [0.6, 0.3, L.y1 - L.y0 + 1], tags: { part: 'ladder' } }); });
    return { ids: ids, count: n };
  };

  /* ---------------------------------------------------------------- the checks: each {ok, bad, ...} */
  function inQuad(pts, x, z) { var s = 0; for (var i = 0; i < 4; i++) { var p = pts[i], q = pts[(i + 1) % 4], c = (q[0] - p[0]) * (z - p[1]) - (q[1] - p[1]) * (x - p[0]); if (Math.abs(c) < 1e-9) continue; if (s && (c > 0) !== (s > 0)) return false; s = c; } return true; }
  K.check = {
    /* a terrace never higher than the cell behind it in its block */
    terraces: function (P) {
      var bad = [], byId = P.byId || K.link(P.cells);
      P.cells.forEach(function (c) { var b = c.nb.back && byId[c.nb.back]; if (b && b.block === c.block && b.row === c.row + 1 && c.storeys > b.storeys) bad.push(c.id + ' ' + c.storeys + ' > ' + b.id + ' ' + b.storeys); });
      return { ok: !bad.length && P.cells.length > 0, bad: bad };
    },
    /* every room, roof, kiva and plaza reachable from outside */
    reach: function (P) {
      var seen = K.reach(P), bad = [];
      P.cells.forEach(function (c) { if (!seen[c.id]) bad.push(c.id); });
      P.rooms.forEach(function (r) { if (!seen[r.id]) bad.push(r.id); });
      P.kivas.forEach(function (k) { if (!seen[k.id]) bad.push(k.id); });
      P.plazas.forEach(function (p) { if (!seen[p.id]) bad.push(p.id); });
      return { ok: !bad.length && P.rooms.length > 0, bad: bad };
    },
    /* no door at the ground */
    groundDoors: function (P) { var bad = P.rooms.filter(function (r) { return r.storey === 0 && r.face === 'door'; }).map(function (r) { return r.id; }); return { ok: !bad.length, bad: bad }; },
    /* no two cells overlap: no cell's centre inside another */
    overlap: function (P) {
      var S = K.space().create({ cell: 12 }), bad = [];
      P.cells.forEach(function (c) { S.insert(c, c.cx, c.cz, c.r); });
      P.cells.forEach(function (c) { S.some(c.cx, c.cz, 0, function (o) { if (o !== c && inQuad(o.pts, c.cx, c.cz)) { bad.push(c.id + ' in ' + o.id); return true; } return false; }); });
      return { ok: !bad.length, bad: bad };
    },
    /* every kiva inside its plaza, clear of the blocks, clear of the other kivas */
    kivas: function (P) {
      var bad = [], pl = {};
      P.plazas.forEach(function (p) { pl[p.id] = p; });
      P.kivas.forEach(function (k, i) {
        var p = pl[k.plaza];
        if (!p || !K.inPoly(p.pts, k.x, k.z) || K.clearance(p.pts, k.x, k.z) < k.r + 1) bad.push(k.id + ' not clear of its plaza\'s edge');
        (P.keepOut || []).forEach(function (q) { if (K.inPoly(q.pts, k.x, k.z) || K.clearance(q.pts, k.x, k.z) < k.r) bad.push(k.id + ' on ' + q.id); });
        P.cells.forEach(function (c) { if (Math.hypot(c.cx - k.x, c.cz - k.z) < k.r + 1 && inQuad(c.pts, k.x, k.z)) bad.push(k.id + ' on ' + c.id); });
        for (var j = 0; j < i; j++) { var o = P.kivas[j]; if (Math.hypot(o.x - k.x, o.z - k.z) < o.r + k.r + 1) bad.push(k.id + ' on ' + o.id); }
      });
      return { ok: !bad.length, bad: bad };
    },
    /* ids unique */
    ids: function (P) {
      var seen = {}, bad = [];
      [P.cells, P.rooms, P.hatches, P.ladders, P.kivas, P.plazas].forEach(function (L) { L.forEach(function (r) { if (seen[r.id]) bad.push(r.id); seen[r.id] = 1; }); });
      return { ok: !bad.length, bad: bad };
    }
  };
  K.checkAll = function (P) { var out = {}; for (var k in K.check) out[k] = K.check[k](P); return out; };
})(typeof globalThis !== 'undefined' ? globalThis : this);
