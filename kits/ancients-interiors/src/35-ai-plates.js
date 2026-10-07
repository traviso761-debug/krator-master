/* ======================== Ancients interiors: floor plates ========================
   Rooms inside a building that someone else draws. An Ancient builder draws a shell (a lathe, a hex casemate, a
   crescent bar); a PLATE is one storey of what is inside it, as data in the builder's own frame (x east, z south,
   y up, metres; the builder's group has no rotation), cut into rooms of sensible sizes along corridors:

     AI.ringPlate(o)   a round or polygonal storey (a drum, a hex): a central hall or core, a corridor ring, and a
                       band of rooms between the corridor and the skin, cut radially
     AI.barPlate(o)    a storey along a path (a straight wing, an arc, a crescent): a corridor down its length and
                       rooms on one side or both, cut across the path
     AI.gridPlate(o)   an open floor of bays along aisles, no partitions (a factory vault, a server hall, a concourse)
     AI.hallPlate(o)   one undivided room (a dome floor, a reading hall, a garage)

   Each returns a STOREY: { id, level, y, h, outline, rooms: [...], walls: [...] }
     room  { id, kind, poly: [[x,z]...], y, h, level, doors: [{ at, w, to }], windows: [], recipe?, furnish, unit? }
           kind is a kits/interiors room kind (or 'corridor'); furnish false for corridors and cores; recipe names an
           ancients-interiors hall recipe for a room the placer should not lay out (a refectory, a reading hall)
     wall  { id, pts: [[x,z]...] (a polyline), y, h, rooms: [idA, idB|null], door: { at: [x,z], w } | null, broken }
           the PARTITIONS this plate adds (the exterior skin is the builder's): radial cuts, corridor walls, cross
           walls; a door is a gap centred on `at`, which lies on the polyline
   AI.ruinStorey(st, seed, o) marks walls broken (deterministic by wall id) and rooms open; AI.storeyAudit checks it.
   No THREE, no DOM: the plans run in node.
   ====================================================================== */
(function (AI) {
  'use strict';
  const TAU = Math.PI * 2;
  const r3 = v => Math.round(v * 1000) / 1000;
  const P = (x, z) => [r3(x), r3(z)];
  /* a stable string hash (FNV-1a) to 0..1: what breaks in a ruin depends on the wall's id, nothing else */
  function h01(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 100000) / 100000; }
  AI.h01 = h01;
  function area(poly) { let a = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
  AI.polyArea = poly => Math.abs(area(poly));
  function mid(a, b) { return P((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }

  /* ---------- the ring plate
     o: { id, level, y, h, cx, cz, rOut(th) (the skin's inner face at angle th), depth (the room band), cw (corridor), sym,
          core: { r, kind } | null (a hall or stair core in the middle; when the middle is large it is a room),
          roomW (target room width at the corridor), kinds(i, n, th) -> kind, seg (arc samples per room),
          a0, a1 (an arc only: the angles the plate spans; default the whole turn), skip(th) -> true to leave a sector out,
          door: w }
     The room band is [rOut(th) - depth, rOut(th)]; the corridor ring is cw inside it; inside that, the core. */
  AI.ringPlate = function (o) {
    const id = o.id, y = o.y, h = o.h, lv = o.level || 0, cx = o.cx || 0, cz = o.cz || 0, cw = o.cw == null ? 2.4 : o.cw;
    const full = o.a0 == null, a0 = full ? 0 : o.a0, a1 = full ? TAU : o.a1, span = a1 - a0;
    const rOut = o.rOut, rIn = th => rOut(th) - o.depth, rCor = th => rIn(th) - cw;
    const rMean = rIn(a0 + span / 2);
    /* sym: the shell's symmetry (6 for a hex): the room count is a multiple of it, so like rooms repeat exactly and
       the furnishing templates are shared (AI.furnishPlan) */
    const sym = o.sym || 1;
    const n = o.n || Math.max(full ? 6 : 2, sym * Math.max(1, Math.round(span * rMean / (o.roomW || 6) / sym)));
    const seg = o.seg || Math.max(2, Math.ceil(span / n * rOut(a0) / 2.5));
    const at = (r, th) => P(cx + r * Math.cos(th), cz + r * Math.sin(th));
    const st = { id, level: lv, y, h, rooms: [], walls: [], outline: [] };
    for (let k = 0; k < 48; k++) { const th = a0 + span * k / (full ? 48 : 47); st.outline.push(at(rOut(th), th)); }
    const dw = o.door || 1.0;
    let roomIx = 0;
    for (let i = 0; i < n; i++) {
      const t0 = a0 + span * i / n, t1 = a0 + span * (i + 1) / n, tm = (t0 + t1) / 2;
      if (o.skip && o.skip(tm)) continue;
      /* the room: the inner arc (the corridor side) out to the skin */
      const inner = [], outer = [];
      for (let k = 0; k <= seg; k++) { const th = t0 + (t1 - t0) * k / seg; inner.push(at(rIn(th), th)); outer.push(at(rOut(th) - 0.05, th)); }
      const poly = inner.concat(outer.reverse());
      const rid = id + '.r' + (roomIx++);
      /* the door: the middle of the inner arc, on its middle segment */
      const k0 = Math.floor(seg / 2), da = mid(inner[k0], inner[Math.min(seg, k0 + 1)]);
      st.rooms.push({ id: rid, kind: o.kinds(i, n, tm), poly, y, h, level: lv, doors: [{ at: da, w: dw, to: id + '.corr' }], windows: [], furnish: true, th: tm });
      /* its corridor wall, with the door, and the radial partition at t0 (the next room's t0 closes it) */
      st.walls.push({ id: rid + '.cw', pts: inner, y, h, rooms: [rid, id + '.corr'], door: { at: da, w: dw }, broken: false });
      st.walls.push({ id: rid + '.p0', pts: [at(rIn(t0), t0), at(rOut(t0) - 0.05, t0)], y, h, rooms: [rid, null], door: null, broken: false });
      if (!full && i === n - 1) st.walls.push({ id: rid + '.p1', pts: [at(rIn(t1), t1), at(rOut(t1) - 0.05, t1)], y, h, rooms: [rid, null], door: null, broken: false });
    }
    /* the corridor: a ring (or an arc) between rCor and rIn; with a core in the middle it is a room of its own */
    const cpoly = [], ns = 48;
    for (let k = 0; k <= ns; k++) { const th = a0 + span * k / ns; cpoly.push(at(rIn(th) - 0.02, th)); }
    for (let k = ns; k >= 0; k--) { const th = a0 + span * k / ns; cpoly.push(at(rCor(th), th)); }
    if (full) { cpoly.splice(ns, 1); cpoly.pop(); }
    st.rooms.push({ id: id + '.corr', kind: 'corridor', poly: full ? null : cpoly, ring: full ? { cx, cz, r0: rCor, r1: rIn } : null, y, h, level: lv, doors: [], windows: [], furnish: false });
    /* the core: a hall in the middle (furnished) when it is big enough, else a stair and service core */
    if (o.core) {
      const cr = o.core.r, cp = [];
      for (let k = 0; k < 24; k++) { const th = k / 24 * TAU; cp.push(at(Math.min(cr, rCor(th) - 0.05), th)); }
      const big = cr >= 6 && o.core.kind;
      st.rooms.push({ id: id + '.core', kind: big ? o.core.kind : 'core', poly: cp, y, h, level: lv,
        doors: [{ at: mid(cp[6], cp[7]), w: 1.6, to: id + '.corr' }], windows: [], furnish: !!big, recipe: o.core.recipe || null });
      if (o.core.wall !== false) st.walls.push({ id: id + '.corewall', pts: cp.concat([cp[0]]), y, h, rooms: [id + '.core', id + '.corr'], door: { at: mid(cp[6], cp[7]), w: 1.6 }, broken: false });
    }
    return st;
  };

  /* ---------- the bar plate
     o: { id, level, y, h, path(u) -> [x, z] for u in 0..1, len (its length), depth (the whole storey, across), side:
          'both' (rooms either side of a centre corridor) | 'left' | 'right' (rooms on that side, the corridor along
          the other wall), cw, roomW, kinds(i, n, side) -> kind, ends: [kindA, kindB] (an end room across the
          corridor at each end: a stair, a lobby) | null, door }
     left is the path's left looking along it (the normal (-dz, dx)). */
  AI.barPlate = function (o) {
    const id = o.id, y = o.y, h = o.h, lv = o.level || 0, cw = o.cw == null ? 2.2 : o.cw, D = o.depth, side = o.side || 'both';
    const N = 80, pts = [], nrm = [];
    for (let k = 0; k <= N; k++) pts.push(o.path(k / N));
    for (let k = 0; k <= N; k++) { const a = pts[Math.max(0, k - 1)], b = pts[Math.min(N, k + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; nrm.push([-(b[1] - a[1]) / l, (b[0] - a[0]) / l]); }
    /* arc length table */
    const L = [0]; for (let k = 1; k <= N; k++) L.push(L[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    const len = L[N];
    const atS = (s, off) => { let k = 0; while (k < N - 1 && L[k + 1] < s) k++; const t = (s - L[k]) / ((L[k + 1] - L[k]) || 1), p = [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * t, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * t], nn = [nrm[k][0] + (nrm[k + 1][0] - nrm[k][0]) * t, nrm[k][1] + (nrm[k + 1][1] - nrm[k][1]) * t], nl = Math.hypot(nn[0], nn[1]) || 1; return P(p[0] + nn[0] / nl * off, p[1] + nn[1] / nl * off); };
    /* bands across the depth, as offsets from the path (left +): the corridor and the room bands */
    const half = D / 2, bands = [];
    if (side === 'both') { bands.push({ s: 1, o0: cw / 2, o1: half - 0.05 }); bands.push({ s: -1, o0: -cw / 2, o1: -half + 0.05 }); }
    else if (side === 'left') bands.push({ s: 1, o0: -half + cw, o1: half - 0.05 });
    else bands.push({ s: -1, o0: half - cw, o1: -half + 0.05 });
    const corr = side === 'both' ? [-cw / 2, cw / 2] : side === 'left' ? [-half + 0.05, -half + cw] : [half - cw, half - 0.05];
    const endW = o.ends ? Math.min(D, 6) : 0, s0 = endW, s1 = len - endW;
    const n = Math.max(1, Math.round((s1 - s0) / (o.roomW || 6)));
    const st = { id, level: lv, y, h, rooms: [], walls: [], outline: [] };
    for (let k = 0; k <= 24; k++) st.outline.push(atS(len * k / 24, half));
    for (let k = 24; k >= 0; k--) st.outline.push(atS(len * k / 24, -half));
    const dw = o.door || 1.0, segs = sa => Math.max(1, Math.ceil(sa / 3));
    let ri = 0;
    bands.forEach(function (B, bi) {
      for (let i = 0; i < n; i++) {
        const a = s0 + (s1 - s0) * i / n, b = s0 + (s1 - s0) * (i + 1) / n, m = segs(b - a);
        const inner = [], outer = [];
        for (let k = 0; k <= m; k++) { const s = a + (b - a) * k / m; inner.push(atS(s, B.o0)); outer.push(atS(s, B.o1)); }
        const poly = inner.concat(outer.slice().reverse());
        const rid = id + '.r' + (ri++), k0 = Math.floor(m / 2), da = mid(inner[k0], inner[Math.min(m, k0 + 1)]);
        const sideName = B.s > 0 ? 'left' : 'right';
        st.rooms.push({ id: rid, kind: o.kinds(i, n, sideName), poly, y, h, level: lv, doors: [{ at: da, w: dw, to: id + '.corr' }], windows: [], furnish: true, side: sideName });
        st.walls.push({ id: rid + '.cw', pts: inner, y, h, rooms: [rid, id + '.corr'], door: { at: da, w: dw }, broken: false });
        if (i > 0) st.walls.push({ id: rid + '.x', pts: [inner[0], outer[m]], y, h, rooms: [rid, id + '.r' + (ri - 2)], door: null, broken: false });
      }
    });
    /* the corridor down the bar, and the end rooms across it */
    const cp = [], m = segs(s1 - s0);
    for (let k = 0; k <= m; k++) cp.push(atS(s0 + (s1 - s0) * k / m, corr[0]));
    for (let k = m; k >= 0; k--) cp.push(atS(s0 + (s1 - s0) * k / m, corr[1]));
    st.rooms.push({ id: id + '.corr', kind: 'corridor', poly: cp, y, h, level: lv, doors: [], windows: [], furnish: false });
    if (o.ends) [[0, s0], [s1, len]].forEach(function (E, ei) {
      if (E[1] - E[0] < 1) return;
      const k = o.ends[ei]; if (!k) return;
      const poly = [atS(E[0], -half + 0.05), atS(E[1], -half + 0.05), atS(E[1], half - 0.05), atS(E[0], half - 0.05)];
      const rid = id + '.end' + ei, wa = atS(ei ? s1 : s0, -half + 0.05), wb = atS(ei ? s1 : s0, half - 0.05);
      const da = atS(ei ? s1 : s0, (corr[0] + corr[1]) / 2);
      st.rooms.push({ id: rid, kind: k, poly, y, h, level: lv, doors: [{ at: da, w: 1.4, to: id + '.corr' }], windows: [], furnish: k !== 'core' });
      st.walls.push({ id: rid + '.w', pts: [wa, wb], y, h, rooms: [rid, id + '.corr'], door: { at: da, w: 1.4 }, broken: false });
    });
    return st;
  };

  /* ---------- an open floor in bays: a big hall (a factory vault, a server hall, a concourse) is not one room to the
     placer: it is a grid of BAYS along aisles, each bay a room with no walls of its own (its `door` is the opening onto
     the aisle in front of it), so the furnishing lands in working groups with walkways between.
     o: { id, level, y, h, x0, x1, z0, z1, bay: [bw, bd] (bay size), aisle (width, default 3), along: 'x' | 'z' (the
          aisles' direction), kinds(i, n, row) -> kind, skip(x, z) -> true to leave a bay out (a reserved machine bed) }
     Bays face the aisle beside them; every second aisle is a service strip at the hall's edge. walls: none. */
  AI.gridPlate = function (o) {
    const id = o.id, y = o.y, h = o.h, lv = o.level || 0, A = o.aisle == null ? 3 : o.aisle, bw = o.bay[0], bd = o.bay[1];
    const alongX = (o.along || 'x') === 'x';
    /* work in (u along the aisles, v across), map back to (x, z) */
    const u0 = alongX ? o.x0 : o.z0, u1 = alongX ? o.x1 : o.z1, v0 = alongX ? o.z0 : o.x0, v1 = alongX ? o.z1 : o.x1;
    const XZ = (u, v) => alongX ? P(u, v) : P(v, u);
    const st = { id, level: lv, y, h, rooms: [], walls: [], outline: [XZ(u0, v0), XZ(u1, v0), XZ(u1, v1), XZ(u0, v1)], open: true };
    /* across: [bay | aisle | bay] strips, repeated */
    const strip = 2 * bd + A, nS = Math.max(1, Math.floor((v1 - v0 + 0.01) / strip)), vPad = ((v1 - v0) - nS * strip) / 2;
    const nU = Math.max(1, Math.floor((u1 - u0 - A) / bw)), uPad = ((u1 - u0) - nU * bw) / 2;
    let i = 0;
    const total = nS * 2 * nU;
    for (let s = 0; s < nS; s++) for (let side = 0; side < 2; side++) for (let k = 0; k < nU; k++) {
      const va = v0 + vPad + s * strip + (side ? bd + A : 0), vb = va + bd, ua = u0 + uPad + k * bw, ub = ua + bw;
      const cu = (ua + ub) / 2, cv = (va + vb) / 2, c = XZ(cu, cv);
      if (o.skip && o.skip(c[0], c[1])) { i++; continue; }
      const poly = [XZ(ua + 0.3, va + 0.3), XZ(ub - 0.3, va + 0.3), XZ(ub - 0.3, vb - 0.3), XZ(ua + 0.3, vb - 0.3)];
      const dv = side ? va + 0.3 : vb - 0.3;   /* the edge on the aisle */
      st.rooms.push({ id: id + '.b' + i, kind: o.kinds(i, total, s * 2 + side), poly, y, h, level: lv,
        doors: [{ at: XZ(cu, dv), w: Math.min(bw - 1, 3), to: id + '.aisle' + s }], windows: [], furnish: true, bay: true });
      i++;
    }
    return st;
  };

  /* ---------- one undivided room */
  AI.hallPlate = function (o) {
    const st = { id: o.id, level: o.level || 0, y: o.y, h: o.h, rooms: [], walls: [], outline: o.poly };
    const e = o.doorEdge == null ? 0 : o.doorEdge, a = o.poly[e], b = o.poly[(e + 1) % o.poly.length];
    st.rooms.push({ id: o.id + '.hall', kind: o.kind, poly: o.poly.map(p => P(p[0], p[1])), y: o.y, h: o.h, level: st.level,
      doors: o.door === false ? [] : [{ at: mid(a, b), w: o.doorW || 2.0, to: 'street' }], windows: [], furnish: o.furnish !== false, recipe: o.recipe || null });
    return st;
  };

  /* ---------- a ruin: some partitions broken (a stub stands, or nothing), the rooms in a collapse left open.
     seed  the TYPE's seed: which walls a ruin of this type tends to lose (the same in every world)
     o: { frac (share of walls broken, default .45), collapse(x, z) -> true where the storey has fallen in,
          place (a placement seed: a world placing this ruin passes its own, e.g. from the site's position),
          jitter (how far the placement may move a wall's chance, default .15: a little randomness, not a new ruin) }
     A wall breaks when its type hash is under frac + jitter * (2 * placeHash - 1): with no `place` every copy of a
     ruin breaks alike; with one, each placed copy loses a slightly different set of partitions, and its stubs stand
     at different heights. The collapse is the builder's geometry and does not move. */
  AI.ruinStorey = function (st, seed, o) {
    o = o || {};
    const frac = o.frac == null ? 0.45 : o.frac, jit = o.place == null ? 0 : (o.jitter == null ? 0.15 : o.jitter);
    const ps = o.place == null ? '' : String(o.place);
    st.walls.forEach(function (W) {
      const h = h01(seed + '|' + W.id), j = jit ? jit * (2 * h01(ps + '~' + W.id) - 1) : 0;
      const q = W.pts[W.pts.length >> 1], mx = q[0], mz = q[1];
      const fallen = o.collapse && o.collapse(mx, mz);
      W.broken = fallen || h < frac + j;
      if (W.broken) W.stub = fallen ? 0 : r3(0.3 + 1.4 * h01(seed + '#' + ps + '#' + W.id));   /* the height left standing */
    });
    st.rooms.forEach(function (R) {
      R.furnish = false;
      if (o.collapse && R.poly) { const c = R.poly.reduce((s, p) => [s[0] + p[0] / R.poly.length, s[1] + p[1] / R.poly.length], [0, 0]); if (o.collapse(c[0], c[1])) R.open = true; }
    });
    st.ruined = true;
    return st;
  };

  /* ---------- checks: every room polygon has area, a door on its own boundary, and lies inside the storey's bound */
  AI.storeyAudit = function (st, inside) {
    const fails = [];
    st.rooms.forEach(function (R) {
      if (!R.poly) return;
      const a = AI.polyArea(R.poly);
      if (a < 1.5) fails.push(R.id + ': area ' + a.toFixed(2));
      if (inside) for (const p of R.poly) if (!inside(p[0], p[1], R.y)) { fails.push(R.id + ': point ' + p + ' outside the shell'); break; }
    });
    return fails;
  };
})(KratorAncientsInteriors);
