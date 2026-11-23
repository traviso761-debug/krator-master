/* ==================== core/pueblo 40: inside the rooms: each room's frame, its openings, its furniture, as records ([G data]) ==================== */
/* A room is the inside of its column's storey: walls `wall` thick inside the cell's edges (so two rooms side by side share a
   wall twice as thick, as a pueblo's do), its floor at y0, its ceiling at y0 + h - the slab. In the room's own frame x runs
   along the front wall (from its front-left corner toward its front-right) and z out through the front, so the back wall
   is z = -hd, the door (when it has one) on z = +hd at x = u. Hatches: one per column, over its own point (the roof hatch's),
   up through the ceiling and down through the floor, each with its ladder; the space under and before them is kept clear.
     KPUEBLO.frame(P, room)            {cx, cz, ux, uz, nx, nz, hw, hd, y0, y1, hx, hz (the hatch, local), door, keep: [rects]}
     KPUEBLO.toPlan(F, lx, lz)         a local point to the plan; KPUEBLO.yawOf(F, fx, fz) a local facing to a plan yaw
     KPUEBLO.furnish(P, table, o)      P.furniture: the catalog pieces each room holds, by its use. table[use] = [{key, w, d,
                                       h, at ('wall' | 'back' | 'corner' | 'centre'), n: [min, max], p (chance), v (variants)}];
                                       each piece placed against a wall (its back to it), slid along it to the first place
                                       clear of the room's keep-outs and the pieces already placed (KRAND decides the order,
                                       the variant and the start). A piece that fits nowhere is skipped and counted
     KPUEBLO.check.furniture(P)        every piece inside its room, clear of its door and hatches, none overlapping
   No three.js, no DOM. */
(function (root) {
  'use strict';
  var K = root.KPUEBLO;
  if (!K || !K.house) throw new Error('core/pueblo: load 10, 20 and 30 first');
  var d = K.d;
  K.DEFAULTS.wall = 0.5;
  K.DEFAULTS.slab = 0.18;

  /* ---------------------------------------------------------------- a room's frame */
  K.frame = function (P, r, o) {
    o = o || {};
    var c = P.byId[r.cell], t = d(o.wall, d(P.wall, K.DEFAULTS.wall)), p = c.pts;
    var fx = p[1][0] - p[0][0], fz = p[1][1] - p[0][1], Lf = Math.hypot(fx, fz) || 1, Lb = Math.hypot(p[2][0] - p[3][0], p[2][1] - p[3][1]);
    var ux = fx / Lf, uz = fz / Lf, nx = c.n[0], nz = c.n[1];
    /* the depth: the front edge's middle to the back edge's, along n */
    var mfx = (p[0][0] + p[1][0]) / 2, mfz = (p[0][1] + p[1][1]) / 2, mbx = (p[2][0] + p[3][0]) / 2, mbz = (p[2][1] + p[3][1]) / 2;
    var depth = Math.abs((mfx - mbx) * nx + (mfz - mbz) * nz), cx = (mfx + mbx) / 2, cz = (mfz + mbz) / 2;
    var F = { cx: cx, cz: cz, ux: ux, uz: uz, nx: nx, nz: nz, hw: Math.min(Lf, Lb) / 2 - t, hd: depth / 2 - t, y0: r.y0, y1: r.y0 + r.h - d(P.slab, K.DEFAULTS.slab), keep: [] };
    /* the hatch: the column's point (the roof hatch's), in the room's frame */
    var H = P.hatchByCell && P.hatchByCell[c.id];
    if (H) { var lx = (H.x - cx) * ux + (H.z - cz) * uz, lz = (H.x - cx) * nx + (H.z - cz) * nz; F.hx = lx; F.hz = lz;
      /* the hatch and its ladder: the ladder stands against the hatch's front edge, a climber before it */
      F.keep.push([lx - 0.6, lz - 0.55, lx + 0.6, lz + 1.2]); }
    if (r.face === 'door') { F.door = r.u; F.keep.push([r.u - 0.75, F.hd - 1.3, r.u + 0.75, F.hd + 0.1]); }
    return F;
  };
  K.toPlan = function (F, lx, lz) { return [F.cx + lx * F.ux + lz * F.nx, F.cz + lx * F.uz + lz * F.nz]; };
  K.yawOf = function (F, fx, fz) { var px = fx * F.ux + fz * F.nx, pz = fx * F.uz + fz * F.nz; return Math.atan2(px, pz); };

  /* ---------------------------------------------------------------- the furnishing */
  function hit(a, b) { return a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]; }
  /* the candidate places for a piece w x dp along wall `wall`, starting at s0 (0..1 along the wall): [rect, lx, lz, fx, fz] */
  function places(F, w, dp, wall, s0) {
    var out = [], g = 0.04, i, n, s, x, z;
    function run(lo, hi, f) { var L = hi - lo; if (L < 0) return; n = Math.max(1, Math.floor(L / 0.1)); for (i = 0; i <= n; i++) { s = lo + L * ((s0 + i / n) % 1.0001); f(s); } }
    if (wall === 'back' || wall === 'wall') run(-F.hw + w / 2 + g, F.hw - w / 2 - g, function (x) { z = -F.hd + dp / 2 + g; out.push([[x - w / 2, z - dp / 2, x + w / 2, z + dp / 2], x, z, 0, 1]); });
    if (wall === 'wall' || wall === 'side') {
      run(-F.hd + w / 2 + g, F.hd - w / 2 - g, function (z) { x = -F.hw + dp / 2 + g; out.push([[x - dp / 2, z - w / 2, x + dp / 2, z + w / 2], x, z, 1, 0]); });
      run(-F.hd + w / 2 + g, F.hd - w / 2 - g, function (z) { x = F.hw - dp / 2 - g; out.push([[x - dp / 2, z - w / 2, x + dp / 2, z + w / 2], x, z, -1, 0]); });
    }
    if (wall === 'wall') run(-F.hw + w / 2 + g, F.hw - w / 2 - g, function (x) { z = F.hd - dp / 2 - g; out.push([[x - w / 2, z - dp / 2, x + w / 2, z + dp / 2], x, z, 0, -1]); });
    if (wall === 'corner') [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { x = q[0] * (F.hw - w / 2 - g); z = q[1] * (F.hd - dp / 2 - g);
      out.push([[x - w / 2, z - dp / 2, x + w / 2, z + dp / 2], x, z, 0, -q[1]]); });
    if (wall === 'centre') for (i = 0; i < 9; i++) { x = ((i % 3) - 1) * F.hw * 0.4; z = (Math.floor(i / 3) - 1) * F.hd * 0.4; out.push([[x - w / 2, z - dp / 2, x + w / 2, z + dp / 2], x, z, 0, 1]); }
    return out;
  }
  K.furnish = function (P, table, o) {
    o = o || {};
    var out = [], skipped = 0, byUse = {};
    P.hatchByCell = {}; P.hatches.forEach(function (H) { P.hatchByCell[H.cell] = H; });
    P.rooms.forEach(function (r, ri) {
      var items = table[r.use] || [], F = K.frame(P, r, o), c = P.byId[r.cell], placed = F.keep.slice(), k = 0;
      if (F.hw < 0.6 || F.hd < 0.6) return;
      items.forEach(function (it, ii) {
        var u0 = K.u(P.world, c.bi * 4096 + c.row * 64 + r.storey, c.seg, ii, 61), n = 1;
        if (it.n) n = it.n[0] + Math.floor(u0 * (it.n[1] - it.n[0] + 1));
        if (it.p != null && K.u(P.world, c.bi * 4096 + c.row * 64 + r.storey, c.seg, ii, 62) >= it.p) n = 0;
        for (var m = 0; m < n; m++) {
          var s0 = K.u(P.world, c.bi * 4096 + c.row * 64 + r.storey, c.seg, ii * 16 + m, 63), cand = places(F, it.w, it.d, d(it.at, 'wall'), s0), ok = null;
          for (var q = 0; q < cand.length && !ok; q++) {
            var R = cand[q][0];
            if (R[0] < -F.hw - 1e-6 || R[2] > F.hw + 1e-6 || R[1] < -F.hd - 1e-6 || R[3] > F.hd + 1e-6) continue;
            if (placed.some(function (Q) { return hit(R, Q); })) continue;
            ok = cand[q];
          }
          if (!ok) { skipped++; continue; }
          placed.push(ok[0]);
          var pp = K.toPlan(F, ok[1], ok[2]);
          out.push({ id: r.id + ':f' + (k++), room: r.id, key: it.key, v: it.v ? Math.floor(K.u(P.world, c.seg, r.storey, ii * 16 + m, 64) * it.v) : 0,
            x: +pp[0].toFixed(4), y: r.y0, z: +pp[1].toFixed(4), ry: +K.yawOf(F, ok[3], ok[4]).toFixed(5), w: it.w, d: it.d, h: d(it.h, 1), lx: ok[1], lz: ok[2], fx: ok[3], fz: ok[4] });
          byUse[r.use] = (byUse[r.use] || 0) + 1;
        }
      });
    });
    P.furniture = out;
    P.furnished = { pieces: out.length, skipped: skipped, byUse: byUse };
    return P.furnished;
  };

  /* ---------------------------------------------------------------- the kivas' furniture
     table: {great: [items], small: [items]} (items as furnish's, `n` fixed or [min, max]); the pieces stand on the kiva's floor
     in a ring before the bench (radius r - bench - d/2), facing the hearth, spaced evenly from a KRAND start, clear of the
     ladder's side. Appended to P.furniture with room: the kiva's id. */
  K.furnishKivas = function (P, table, o) {
    o = o || {}; var bench = d(o.bench, 1.15), out = P.furniture || (P.furniture = []), n0 = out.length;
    (P.kivas || []).forEach(function (k, ki) {
      var items = table[k.great ? 'great' : 'small'] || [], list = [];
      items.forEach(function (it, ii) { var n = it.n ? it.n[0] + Math.floor(K.u(P.world, 700 + ki, ii, 0, 65) * (it.n[1] - it.n[0] + 1)) : 1;
        if (it.p != null && K.u(P.world, 700 + ki, ii, 1, 65) >= it.p) n = 0; for (var m = 0; m < n; m++) list.push(it); });
      if (!list.length) return;
      var ha = Math.atan2(k.hatch.z - k.z, k.hatch.x - k.x), a0 = ha + 0.7, span = Math.PI * 2 - 1.4;
      list.forEach(function (it, m) {
        var a = a0 + span * (m + 0.5) / list.length, rr = k.r - 0.5 - bench - it.d / 2 - 0.05, x = k.x + Math.cos(a) * rr, z = k.z + Math.sin(a) * rr;
        out.push({ id: k.id + ':f' + m, room: k.id, key: it.key, v: it.v ? Math.floor(K.u(P.world, 700 + ki, m, 2, 65) * it.v) : 0, x: +x.toFixed(4), y: -k.depth, z: +z.toFixed(4),
          ry: +Math.atan2(-Math.cos(a), -Math.sin(a)).toFixed(5), w: it.w, d: it.d, h: d(it.h, 1), kiva: true });
      });
    });
    return out.length - n0;
  };

  /* ---------------------------------------------------------------- the check */
  K.check.furniture = function (P) {
    var bad = [], byRoom = {};
    (P.furniture || []).forEach(function (f) { if (!f.kiva) (byRoom[f.room] || (byRoom[f.room] = [])).push(f); });
    P.rooms.forEach(function (r) {
      var L = byRoom[r.id]; if (!L) return;
      var F = K.frame(P, r), R = L.map(function (f) { var sw = f.fx !== 0; var w = sw ? f.d : f.w, dp = sw ? f.w : f.d; return [f.lx - w / 2, f.lz - dp / 2, f.lx + w / 2, f.lz + dp / 2, f.id]; });
      R.forEach(function (a, i) {
        if (a[0] < -F.hw - 1e-3 || a[2] > F.hw + 1e-3 || a[1] < -F.hd - 1e-3 || a[3] > F.hd + 1e-3) bad.push(a[4] + ' outside its room');
        F.keep.forEach(function (k) { if (hit(a, k)) bad.push(a[4] + ' on a door or hatch'); });
        for (var j = 0; j < i; j++) if (hit(a, R[j])) bad.push(a[4] + ' on ' + R[j][4]);
      });
    });
    return { ok: !bad.length, bad: bad, pieces: (P.furniture || []).length };
  };
  /* every passage clear under its rooms: no room below its clear storey, a room above it, a gate opening on a plaza */
  K.check.passages = function (P) {
    var bad = [], byId = P.byId;
    (P.passages || []).forEach(function (p) {
      p.cells.forEach(function (id) { var c = byId[id]; if (!(c.storeys > c.base)) bad.push(id + ' has no room over the ' + p.kind); });
      if (p.kind === 'gate' && (!p.plaza || p.plaza === 'out')) bad.push(p.id + ' opens on no plaza');
    });
    P.rooms.forEach(function (r) { var c = byId[r.cell]; if (c.passage && r.storey < c.base) bad.push(r.id + ' in the ' + c.passage); });
    return { ok: !bad.length, bad: bad };
  };

  /* ---------------------------------------------------------------- core/tags: the pieces, each its room's child */
  K.registerFurniture = function (P, T, ids, o) {
    o = o || {};
    var at = o.at || function (x, y, z) { return [x, y, z]; }, ry = d(o.ry, 0), n = 0;
    (P.furniture || []).forEach(function (f) {
      var parent = ids[f.room]; if (!parent) return;
      var tags = { setting: 'indoor' }; if (o.culture) tags.culture = o.culture;
      T.child(parent, { 'class': 'furniture', kind: f.key, key: f.key, name: f.key, at: at(f.x, f.y, f.z), ry: ry + f.ry, size: [f.w, f.d, f.h], tags: tags, note: f.id, src: o.frag });
      n++;
    });
    return n;
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
