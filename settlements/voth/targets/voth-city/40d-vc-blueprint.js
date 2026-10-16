/* ============================== 5h4. THE PALACE FROM ITS BLUEPRINT ============================== */
/* [G data] The owner's floor-by-floor blueprint (2026-10-15: settlements/voth/palace/BLUEPRINT.md, the sheets F-1 to F8,
   the data VC.PALACE_PLAN in 40c-vc-palace-plan.js). TUNE.interiors.blueprint[canton] names the sheet each storey takes
   (a tier with more storeys than the sheets repeats one; the owner, 2026-10-15: "some of these floors are taller than
   others": the storeys keep the stack's own heights, the sheets give only the plan). In two passes:
   1. VC.bpStorey, in the planner's storey loop (40-vc-interiors.js VC.intPlanTiered), in place of the generic arms (on the
      state floor, beside the suite's big rooms, which keep their footprints): each sheet's rooms, clipped to the tier's
      wall and kept off what is there (the core, the suite's rooms, halls and passages). A hall, a passage, a gallery is an
      open floor (P.halls); a stair a shaft (VC.bpFinish lays its flights); a room a room (its kind the city's by
      `kinds`, its own kept as `bpKind`, its name and decor level kept); a room with voids over it on the storeys above
      (a light court, a two-storey library) stands that tall. Voids and the sheets' `skip` kinds (the roof gardens) are
      not laid.
   2. VC.bpFinish, once the storeys and the tunnels stand: a spine hall from the core to each canton door's passage on the
      ground storey (so the dock still walks to the core), then the doors: from the core's halls outward, each room or
      suite room reached first by a door from the open floor or room it touches (the second-rank rooms behind the first,
      as the blueprint's thresholds are); a room nothing reaches is dropped. Then every shaft that the next storey's
      sheet also has gets two flights and a landing from this storey's floor to the next one's.
   Every choice is fixed by the data and the geometry: no stream is drawn. */
VC.bpConf = function (M) { var B = TUNE.interiors.blueprint; return B && B[M.n] && typeof VC.PALACE_PLAN !== 'undefined' ? B[M.n] : null; };
/* the sheet a storey takes: the dungeon's, else its tier's list by its index in the tier (the last repeated) */
VC.bpSheet = function (C, t, s) {
  if (s.dungeon) return C.dungeon || null;
  var L = C.tiers[t.k]; if (!L || !L.length) return null;
  return L[Math.min(s.j, L.length - 1)];
};
VC.bpFrame = function (P) {
  var M = P.M, ax = P.axis, pv = [-ax[1], ax[0]];
  var pt = function (u, v) { return [M.x + ax[0] * u + pv[0] * v, M.z + ax[1] * u + pv[1] * v]; };
  return function (u0, u1, v0, v1) { var a = pt(u0, v0), b = pt(u1, v1); return { x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]) }; };
};
VC.bpArea = function (r) { return Math.max(0, r.x1 - r.x0) * Math.max(0, r.z1 - r.z0); };
VC.bpInter = function (a, b) { return { x0: Math.max(a.x0, b.x0), x1: Math.min(a.x1, b.x1), z0: Math.max(a.z0, b.z0), z1: Math.min(a.z1, b.z1) }; };
/* a rect less a list of rects: its largest remaining piece, or null */
VC.bpTrim = function (r, minus) {
  var hit = minus.filter(function (k) { return VC.bpArea(VC.bpInter(r, k)) > 0.01; });
  if (!hit.length) return r;
  var best = null;
  CANT.rectMinus([r.x0, r.x1, r.z0, r.z1], hit.map(function (k) { return [k.x0, k.x1, k.z0, k.z1]; })).forEach(function (q) {
    var o = { x0: q[0], x1: q[1], z0: q[2], z1: q[3] }; if (!best || VC.bpArea(o) > VC.bpArea(best)) best = o; });
  return best;
};
VC.bpStorey = function (P, M, S, s, si, allSt, C) {
  var T = TUNE.interiors, BT = T.blueprintKinds, id = VC.bpSheet(C, allSt[si].t, s), sh = id && VC.PALACE_PLAN.sheets[id]; if (!sh) return 0;
  var rect = VC.bpFrame(P), R = S.R, clip = function (o) { return { x0: Math.max(o.x0, M.x - R), x1: Math.min(o.x1, M.x + R), z0: Math.max(o.z0, M.z - R), z1: Math.min(o.z1, M.z + R) }; };
  var c = P.core, h = c.half, core = { x0: c.x - h, x1: c.x + h, z0: c.z - h, z1: c.z + h };
  /* what is there: the core, and on the state floor the suite's rooms, halls, galleries and passages */
  var keep = [core].concat(P.halls.filter(function (o) { return o.storey === si && !o.bp; }), P.tunnels.filter(function (o) { return (o.storey || 0) === si; }));
  P.bpStairs = P.bpStairs || []; P.bpLog = P.bpLog || { sheets: {}, rooms: 0, halls: 0, stairs: 0, clipped: 0, kept: 0, tall: 0, zones: 0, skips: {}, dropped: {} };
  P.bpLog.sheets[si] = id;
  /* the voids on the storeys above, in this tier, sheet by sheet (a room under them stands through) */
  var voidsAt = function (k) { var o = allSt[k]; if (!o || o.t !== allSt[si].t || o.s.dungeon) return null; var q = VC.PALACE_PLAN.sheets[VC.bpSheet(C, o.t, o.s)]; return q ? q.rooms.filter(function (r) { return BT.voids.indexOf(r[2]) >= 0 || BT.galleries.indexOf(r[2]) >= 0; }).map(function (r) { return rect(r[3], r[4], r[5], r[6]); }) : null; };
  var n = 0;
  sh.rooms.forEach(function (row) {
    var kind = row[2], decor = row[7];
    /* a gallery round a void (the storey over a tall room): a railed ring of floor the rooms round it open onto */
    if (BT.galleries.indexOf(kind) >= 0) {
      var gq = clip(rect(row[3], row[4], row[5], row[6])), g = T.atrium.gallery;
      if (gq.x1 - gq.x0 < 2 * g + 2 || gq.z1 - gq.z0 < 2 * g + 2 || keep.some(function (k) { return VC.bpArea(VC.bpInter(gq, k)) > 0.3 * VC.bpArea(gq); })) return;
      P.halls.push(Object.assign({}, gq, { y: s.y, h: s.h, storey: si, tier: S.tier, bp: true, kind: 'gallery', nowalls: true, nofloor: true, name: row[1], bpKind: kind }));
      [[gq.x0, gq.x1, gq.z0, gq.z0 + g], [gq.x0, gq.x1, gq.z1 - g, gq.z1], [gq.x0, gq.x0 + g, gq.z0 + g, gq.z1 - g], [gq.x1 - g, gq.x1, gq.z0 + g, gq.z1 - g]].forEach(function (f) {
        P.floors.push({ x0: f[0], x1: f[1], z0: f[2], z1: f[3], y: s.y, kind: 'gallery', storey: si, noceil: true }); });
      VC.intRailsRect(P, { x0: gq.x0 + g, x1: gq.x1 - g, z0: gq.z0 + g, z1: gq.z1 - g }, s.y, si, []);
      P.bpLog.halls++; n++; return;
    }
    if (BT.voids.indexOf(kind) >= 0 || BT.skip.indexOf(kind) >= 0) return;
    var o0 = rect(row[3], row[4], row[5], row[6]), o = clip(o0), skip = function (why) { (P.bpLog.skips[si] = P.bpLog.skips[si] || []).push(row[0] + ' ' + why); };
    if (o.x1 - o.x0 < 2 || o.z1 - o.z0 < 2) { P.bpLog.clipped++; skip('outside'); return; }
    if (kind === 'stair' && VC.bpArea(VC.bpInter(o, core)) > 1) return;           /* the core stair: the planner's own */
    var hitA = keep.reduce(function (a, k) { return a + VC.bpArea(VC.bpInter(o, k)); }, 0);
    if (hitA > 0.3 * VC.bpArea(o)) { P.bpLog.kept++; skip('kept'); return; }
    var q = VC.bpTrim(o, keep); if (!q || q.x1 - q.x0 < 2 || q.z1 - q.z0 < 2) { P.bpLog.kept++; skip('trimmed'); return; }
    var base = { x0: q.x0, x1: q.x1, z0: q.z0, z1: q.z1, y: s.y, h: s.h, storey: si, tier: S.tier, bp: true, bpKind: kind, name: row[1], decor: decor };
    if (kind === 'stair') {
      P.halls.push(Object.assign(base, { kind: 'stairs', nofloor: true, noceil: true, stair: row[1] }));
      P.bpStairs.push({ si: si, o: q, name: row[1], rect: base }); P.bpLog.stairs++; n++; return;
    }
    if (BT.open.indexOf(kind) >= 0) { P.halls.push(Object.assign(base, { kind: kind === 'passage' ? 'passage' : 'hall' })); P.bpLog.halls++; n++; return; }
    /* how tall: up through the storeys whose sheets void it */
    var top = si;
    for (var k = si + 1; k < allSt.length; k++) { var V = voidsAt(k); if (!V || !V.some(function (v) { return VC.bpArea(VC.bpInter(v, q)) > 0.7 * VC.bpArea(q); })) break; top = k; }
    if (top > si) { var St = allSt[top].s; base.h = St.y + St.h - s.y; base.tallTo = top; P.bpLog.tall++; }
    var city = BT.kinds[kind] || kind, rid = M.n + '.bp' + si + '.' + row[0];
    /* a zone (the tier 0 sheets draw the household's bulk as one rect: "the planner will cut corridors and courts out of
       it", BLUEPRINT.md): a corridor down its length and rooms off it, `zones.room` m long, on both sides when it is deep
       enough (`zones.deep`), on one side otherwise */
    var Z = C.zones, za = VC.bpArea(q);
    if (Z && Z.sheets.indexOf(id) >= 0 && za > Z.area && Z.keep.indexOf(kind) < 0 && top === si) {
      var ax = q.x1 - q.x0 >= q.z1 - q.z0, Lg = ax ? q.x1 - q.x0 : q.z1 - q.z0, Wd = ax ? q.z1 - q.z0 : q.x1 - q.x0, two = Wd >= Z.deep;
      var sub = function (l0, l1, m0, m1) { return ax ? { x0: q.x0 + l0, x1: q.x0 + l1, z0: q.z0 + m0, z1: q.z0 + m1 } : { x0: q.x0 + m0, x1: q.x0 + m1, z0: q.z0 + l0, z1: q.z0 + l1 }; };
      /* the corridor: down the middle, or along the side nearer the canton's centre */
      var mc = two ? (Wd - Z.corridor) / 2 : ((ax ? (q.z0 + q.z1) / 2 - M.z : (q.x0 + q.x1) / 2 - M.x) > 0 ? 0 : Wd - Z.corridor);
      P.halls.push(Object.assign({}, base, sub(0, Lg, mc, mc + Z.corridor), { kind: 'hall', name: row[1] + ': corridor', zone: rid }));
      var rows = two ? [[0, mc], [mc + Z.corridor, Wd]] : (mc === 0 ? [[Z.corridor, Wd]] : [[0, mc]]), nC = Math.max(1, Math.round(Lg / Z.room));
      rows.forEach(function (rw, ri) { for (var ci = 0; ci < nC; ci++) {
        P.rooms.push(Object.assign({}, base, sub(Lg * ci / nC, Lg * (ci + 1) / nC, rw[0], rw[1]), { kind: city, id: rid + '.' + ri + '.' + ci, door: null, side: 0 })); P.bpLog.rooms++; n++;
      } });
      P.bpLog.zones++; return;
    }
    P.rooms.push(Object.assign(base, { kind: city, id: rid, door: null, side: 0 }));
    P.bpLog.rooms++; n++;
  });
  return n;
};
/* two rects that share a stretch of edge: the stretch's middle and length, or null */
VC.bpShared = function (A, B, gap, minLen) {
  var oz = Math.min(A.z1, B.z1) - Math.max(A.z0, B.z0), ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0);
  if (oz >= minLen && (Math.abs(A.x1 - B.x0) < gap || Math.abs(B.x1 - A.x0) < gap)) return { x: Math.abs(A.x1 - B.x0) < gap ? (A.x1 + B.x0) / 2 : (B.x1 + A.x0) / 2, z: (Math.max(A.z0, B.z0) + Math.min(A.z1, B.z1)) / 2, len: oz, alongZ: true };
  if (ox >= minLen && (Math.abs(A.z1 - B.z0) < gap || Math.abs(B.z1 - A.z0) < gap)) return { x: (Math.max(A.x0, B.x0) + Math.min(A.x1, B.x1)) / 2, z: Math.abs(A.z1 - B.z0) < gap ? (A.z1 + B.z0) / 2 : (B.z1 + A.z0) / 2, len: ox, alongZ: false };
  return null;
};
VC.bpFinish = function (P, M, allSt) {
  var T = TUNE.interiors, BT = T.blueprintKinds, L = P.bpLog; if (!L) return;
  P.bp = true; P.bpDoors = [];
  var c = P.core, h = c.half, core = { x0: c.x - h, x1: c.x + h, z0: c.z - h, z1: c.z + h };
  /* 1. the spine on the ground storey: from the core to each canton door's tunnel or passage */
  var g0 = P.ground, G = allSt[g0], spines = [];
  (P.doorsOut || []).forEach(function (D) {
    var d = D.n, cIn = (c.x - M.x) * d[0] + (c.z - M.z) * d[1], end = G.t.R - 1 - cIn;
    if (end < T.core + 2) return;
    var sp = VC.intRect([c.x, c.z], d, T.core - 1.5, end, T.hall / 2, G.s.y, G.s.h, 'hall'); sp.storey = g0; sp.bp = true; sp.spine = true; sp.name = 'Spine to ' + D.id;
    P.halls.push(sp); spines.push(sp);
  });
  /* the rooms on the ground storey give way to the tunnels, the passages and the spines */
  var way = P.tunnels.filter(function (o) { return (o.storey || 0) === g0; }).concat(spines);
  P.rooms = P.rooms.filter(function (r) {
    if (!r.bp || r.storey !== g0) return true;
    var q = VC.bpTrim(r, way); if (!q || q.x1 - q.x0 < 2 || q.z1 - q.z0 < 2) return false;
    r.x0 = q.x0; r.x1 = q.x1; r.z0 = q.z0; r.z1 = q.z1; return true;
  });
  P.halls = P.halls.filter(function (o) {
    if (!o.bp || o.spine || o.storey !== g0 || o.kind === 'stairs') return true;
    return !way.some(function (k) { return VC.bpArea(VC.bpInter(o, k)) > 0.5 * VC.bpArea(o); });
  });
  /* 2. the doors, storey by storey: a search outward from the open floors the core stands in */
  var dropped = 0, doorsN = 0;
  P.storeys.forEach(function (S) {
    var si = S.i, nodes = [];
    P.halls.forEach(function (o) {
      if (o.storey !== si || o.nofloor && o.kind !== 'stairs' && o.kind !== 'gallery') return;   /* a suite room's gallery storey: its strips take doors */
      nodes.push({ o: o, kind: o.kind === 'suite' ? 'suite' : 'open' });
    });
    P.tunnels.forEach(function (o) { if ((o.storey || 0) === si) nodes.push({ o: o, kind: 'open', tunnel: true }); });
    nodes.push({ o: core, kind: 'open', core: true });
    P.rooms.forEach(function (r) { if (r.bp && r.storey === si) nodes.push({ o: r, kind: 'room', room: r }); });
    if (!nodes.some(function (q) { return q.kind === 'room'; })) return;
    var joined = function (A, B) {
      if (A.kind === 'open' && B.kind === 'open') return VC.bpArea(VC.bpInter(A.o, B.o)) > 0.01 || !!VC.bpShared(A.o, B.o, 0.4, 1.0);
      if (A.kind === 'suite' && B.kind === 'suite') return !!VC.bpShared(A.o, B.o, 0.4, 2);       /* the suite's own links */
      if ((A.tunnel && B.kind === 'suite') || (B.tunnel && A.kind === 'suite')) return VC.bpArea(VC.bpInter(A.o, B.o)) > 0.01 || !!VC.bpShared(A.o, B.o, 0.6, 1.0);
      return false;
    };
    var seen = nodes.map(function () { return false; }), queue = [];
    /* the seeds: the core and every open floor joined to it */
    nodes.forEach(function (q, i) { if (q.core) { seen[i] = true; queue.push(i); } });
    for (var qi = 0; qi < queue.length; qi++) {
      var A = nodes[queue[qi]];
      /* open floors first: a room takes its door from the hall before it takes one from a neighbouring room */
      var order = nodes.map(function (q, i) { return i; }).filter(function (i) { return !seen[i]; });
      order.forEach(function (i) {
        if (seen[i]) return; var B = nodes[i];
        if (joined(A, B)) { seen[i] = true; queue.push(i); return; }
        if (B.kind === 'open' && A.kind === 'open') return;
        if (A.kind !== 'room' && B.kind !== 'room' && !(A.kind === 'suite' || B.kind === 'suite')) return;
        var sh = VC.bpShared(A.o, B.o, 0.6, 1.8); if (!sh) return;
        var big = (A.room && A.room.decor >= 3) && (B.room ? B.room.decor >= 3 : true), w = Math.min(sh.len - 0.6, big ? T.blueprintDoor[1] : T.blueprintDoor[0]);
        var D = { x: sh.x, z: sh.z, w: w, storey: si }; P.bpDoors.push(D); doorsN++;
        [A, B].forEach(function (q) { if (q.room && !q.room.door) q.room.door = { x: D.x, z: D.z, w: D.w, n: sh.alongZ ? [D.x > (q.o.x0 + q.o.x1) / 2 ? 1 : -1, 0] : [0, D.z > (q.o.z0 + q.o.z1) / 2 ? 1 : -1] }; });
        if (A.kind === 'suite' || B.kind === 'suite') P.suite.doors.push({ x: D.x, z: D.z, w: D.w, storey: si });
        seen[i] = true; queue.push(i);
      });
      /* keep the queue in order: open floors reached are searched before rooms */
      var rest = queue.slice(qi + 1); rest.sort(function (a, b) { return (nodes[a].kind === 'room') - (nodes[b].kind === 'room') || a - b; }); queue = queue.slice(0, qi + 1).concat(rest);
    }
    var gone = {}; nodes.forEach(function (q, i) { if (q.room && !seen[i]) { gone[q.room.id] = 1; (L.dropped[si] = L.dropped[si] || []).push(q.room.id.split('.bp')[1]); } });
    if (Object.keys(gone).length) { dropped += Object.keys(gone).length; P.rooms = P.rooms.filter(function (r) { return !gone[r.id]; }); }
  });
  /* 3. the shafts: two flights and a landing up to the next storey where its sheet has the same shaft */
  var flights = 0;
  P.bpStairs.forEach(function (st) {
    var S0 = allSt[st.si].s, nxt = allSt[st.si + 1], o = st.o;
    var up = nxt && P.bpStairs.some(function (q) { return q.si === st.si + 1 && Math.abs(q.o.x0 - o.x0) < 0.6 && Math.abs(q.o.x1 - o.x1) < 0.6 && Math.abs(q.o.z0 - o.z0) < 0.6 && Math.abs(q.o.z1 - o.z1) < 0.6; });
    var alongX = o.x1 - o.x0 >= o.z1 - o.z0, Lg = alongX ? o.x1 - o.x0 : o.z1 - o.z0, Wd = alongX ? o.z1 - o.z0 : o.x1 - o.x0, e = Math.min(2.4, Lg * 0.18);
    var at = function (l, m) { return alongX ? [o.x0 + l, o.z0 + m] : [o.x0 + m, o.z0 + l]; };
    var strip = function (l0, l1, y, kind) { var a = at(l0, 0), b = at(l1, Wd); P.floors.push({ x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]), y: y, kind: kind, storey: st.si, noceil: true }); };
    /* the foot's strip, where the storey steps onto the stair (and the flight from below arrives) */
    strip(0, e, S0.y, 'hall');
    /* the shaft's ceiling where the stair ends: at the top of its last storey */
    if (!up) { var a2 = at(0, 0), b2 = at(Lg, Wd); (P.extraCeilings = P.extraCeilings || []).push({ x0: Math.min(a2[0], b2[0]), x1: Math.max(a2[0], b2[0]), z0: Math.min(a2[1], b2[1]), z1: Math.max(a2[1], b2[1]), y: S0.y + S0.h, storey: st.si }); return; }
    var y1 = nxt.s.y, half = (y1 - S0.y) / 2, fw = Wd / 2 - 0.3;
    P.flights.push({ canton: P.n, kind: 'bp', a: at(e, Wd / 4), b: at(Lg - e, Wd / 4), y0: S0.y, y1: S0.y + half, w: fw, base: S0.y, storey: st.si, stair: st.name });
    strip(Lg - e, Lg, S0.y + half, 'landing');
    P.flights.push({ canton: P.n, kind: 'bp', a: at(Lg - e, 3 * Wd / 4), b: at(e, 3 * Wd / 4), y0: S0.y + half, y1: y1, w: fw, base: S0.y + half - 0.4, storey: st.si, stair: st.name });
    flights += 2;
  });
  var nRooms = P.rooms.filter(function (r) { return r.bp; }).length;
  P.bpLog.summary = nRooms + ' rooms (' + L.zones + ' zones cut into corridors and rooms, ' + dropped + ' unreached dropped, ' + L.clipped + ' outside the walls, ' + L.kept + ' under the suite), ' + L.halls + ' halls, ' + doorsN + ' doors, ' + L.stairs + ' stair shafts, ' + flights + ' flights, ' + L.tall + ' rooms through storeys';
};
