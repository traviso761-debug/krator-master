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
  P.bpStairs = P.bpStairs || []; P.bpLog = P.bpLog || { sheets: {}, rooms: 0, halls: 0, stairs: 0, clipped: 0, kept: 0, tall: 0, zones: 0, filled: 0, landings: 0, skips: {}, dropped: {} };
  P.bpLog.sheets[si] = id;
  /* the voids on the storeys above, in this tier, sheet by sheet (a room under them stands through) */
  var voidsAt = function (k) { var o = allSt[k]; if (!o || o.t !== allSt[si].t || o.s.dungeon) return null; var q = VC.PALACE_PLAN.sheets[VC.bpSheet(C, o.t, o.s)]; return q ? q.rooms.filter(function (r) { return BT.voids.indexOf(r[2]) >= 0 || BT.galleries.indexOf(r[2]) >= 0; }).map(function (r) { return rect(r[3], r[4], r[5], r[6]); }) : null; };
  /* what stands up into this storey from below, in this tier (a tall room, a court, a suite's big room), and the dome's
     shaft (what the suite keeps clear over the throne room on the tier it names: tier 2; the dome on the deck is the
     captured crown's, so above tier 2 the sheet's dome void is a light court like the others) */
  var underA = function (q) { return P.rooms.reduce(function (a, r) { return r.tier === S.tier && r.storey < si && r.y + r.h > s.y + 0.5 ? a + VC.bpArea(VC.bpInter(q, r)) : a; }, 0); };
  var shaft = function (q) { return (P.suite && P.suite.keep || []).some(function (k) { return k.tier === S.tier && VC.bpArea(VC.bpInter(q, k)) > 0.5 * VC.bpArea(q); }); };
  var n = 0;
  sh.rooms.forEach(function (row) {
    var kind = row[2], decor = row[7], name = row[1];
    /* a sheet repeated on a tier it was not drawn for (F7 on tiers 3 and 4): a void with nothing standing up into it from
       below is floor: a gallery's void an open floor, a void a light court (standing up through the voids over it); the
       dome's shaft stays open */
    if (BT.voids.indexOf(kind) >= 0 || BT.galleries.indexOf(kind) >= 0) {
      var vq = clip(rect(row[3], row[4], row[5], row[6]));
      if (vq.x1 - vq.x0 >= 2 && vq.z1 - vq.z0 >= 2 && !shaft(vq) && underA(vq) < 0.3 * VC.bpArea(vq)) {
        name = name.replace(' (void)', '') + (BT.voids.indexOf(kind) >= 0 && !/Court/.test(name) ? ': light court' : ''); kind = BT.galleries.indexOf(kind) >= 0 ? 'gallery' : 'court'; P.bpLog.filled++;
      }
    }
    /* a gallery round a void (the storey over a tall room): a railed ring of floor the rooms round it open onto */
    if (BT.galleries.indexOf(kind) >= 0) {
      var gq = clip(rect(row[3], row[4], row[5], row[6])), g = T.atrium.gallery;
      if (gq.x1 - gq.x0 < 2 * g + 2 || gq.z1 - gq.z0 < 2 * g + 2 || keep.some(function (k) { return VC.bpArea(VC.bpInter(gq, k)) > 0.3 * VC.bpArea(gq); })) return;
      P.halls.push(Object.assign({}, gq, { y: s.y, h: s.h, storey: si, tier: S.tier, bp: true, kind: 'gallery', nowalls: true, nofloor: true, name: name, bpKind: kind }));
      [[gq.x0, gq.x1, gq.z0, gq.z0 + g], [gq.x0, gq.x1, gq.z1 - g, gq.z1], [gq.x0, gq.x0 + g, gq.z0 + g, gq.z1 - g], [gq.x1 - g, gq.x1, gq.z0 + g, gq.z1 - g]].forEach(function (f) {
        P.floors.push({ x0: f[0], x1: f[1], z0: f[2], z1: f[3], y: s.y, kind: 'gallery', storey: si, noceil: true }); });
      VC.intRailsRect(P, { x0: gq.x0 + g, x1: gq.x1 - g, z0: gq.z0 + g, z1: gq.z1 - g }, s.y, si, []);
      P.bpLog.halls++; n++; return;
    }
    if (BT.voids.indexOf(kind) >= 0 || BT.skip.indexOf(kind) >= 0) return;
    var o0 = rect(row[3], row[4], row[5], row[6]), o = clip(o0), skip = function (why) { (P.bpLog.skips[si] = P.bpLog.skips[si] || []).push(row[0] + ' ' + why); };
    if (o.x1 - o.x0 < 2 || o.z1 - o.z0 < 2) { P.bpLog.clipped++; skip('outside'); return; }
    if (kind === 'stair' && VC.bpArea(VC.bpInter(o, core)) > 1) return;           /* the core stair: the planner's own */
    if (kind === 'stair' && VC.bpArea(o) < VC.bpArea(o0) - 0.5) { kind = 'passage'; name += ': landing'; P.bpLog.landings++; }   /* a shaft the wall cuts: its flights could not line up with the storeys over and under it; an open floor (the galleries round it join there) */
    var hitA = keep.reduce(function (a, k) { return a + VC.bpArea(VC.bpInter(o, k)); }, 0);
    if (hitA > 0.3 * VC.bpArea(o)) { P.bpLog.kept++; skip('kept'); return; }
    var q = VC.bpTrim(o, keep); if (!q || q.x1 - q.x0 < 2 || q.z1 - q.z0 < 2) { P.bpLog.kept++; skip('trimmed'); return; }
    var base = { x0: q.x0, x1: q.x1, z0: q.z0, z1: q.z1, y: s.y, h: s.h, storey: si, tier: S.tier, bp: true, bpKind: kind, name: name, decor: decor };
    if (kind === 'stair') {
      P.halls.push(Object.assign(base, { kind: 'stairs', nofloor: true, noceil: true, stair: name }));
      P.bpStairs.push({ si: si, o: q, name: name, rect: base }); P.bpLog.stairs++; n++; return;
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
      P.halls.push(Object.assign({}, base, sub(0, Lg, mc, mc + Z.corridor), { kind: 'hall', name: name + ': corridor', zone: rid }));
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
  /* the doors onto the terraces (40e-vc-palace-doors.js), before the search below sees the tunnels */
  var doorsTxt = VC.bpDoors ? VC.bpDoors(P, M, allSt) : '';
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
  P.bpLog.summary = nRooms + ' rooms (' + L.zones + ' zones cut into corridors and rooms, ' + dropped + ' unreached dropped, ' + L.clipped + ' outside the walls, ' + L.kept + ' under the suite), ' + L.halls + ' halls, ' + doorsN + ' doors, ' + L.stairs + ' stair shafts, ' + flights + ' flights, ' + L.tall + ' rooms through storeys, ' + L.filled + ' voids with nothing under them laid as floor, ' + L.landings + ' stair shafts the wall cuts laid as landings' + (doorsTxt ? '; ' + doorsTxt : '');
};
/* ============================== 5h6. THE SUMMIT FROM SHEET F8 ============================== */
/* The top deck from the sheet TUNE.interiors.blueprint[canton].summit names (F8: "the Dawn Pavilion and the High Garden"):
   its rows in the suite's frame on the deck, as open structures of stone and gilt (prims: VC.capture 'summit'), round the
   captured crown that stands there already: the sheet drew the summit as a 70 m deck with a lantern at its middle, the
   real one is 176 m across, and on it a drum 100 m wide, a podium on that turned 45 degrees (its corners 78 m out on
   the axes), the gilt dome, four obelisks and a ring of gilt balls. A row stands where
   the sheet drew it if that is clear (of the crown, the stair house and the rows laid before it, by `clear` m), else at
   the nearest clear spot on a `grid` m lattice over the deck, as drawn or turned a quarter, at full size or shrunk
   (`shrink`), inside the railing (the deck's edge less `edge` m); a row with no spot is not laid. Each footprint is kept by the deck's walker
   (P.summit.blocks, 40 VC.intWalk) and by what a deck layout lays after (VC.INT.keep). TUNE.interiors.summit holds the
   sizes and colours.
   - a pavilion (the Dawn Pavilion, the Kiosk of the Evening): a plinth, columns round it, an entablature and a flat roof,
     a gilt dome on it (decor 4) or a hipped roof; inside, a gilt seat on a dais facing the sunrise (+u, decor 4) or divans;
   - the altar: three steps, the altar stone in porphyry, a gilt sun on it, a brazier at each corner;
   - the instruments (the astronomers'): a gnomon on its plinth, a gilt meridian line across the court, a quadrant wall,
     a row of sighting stones;
   - a court (the Pool of the Sky): a kerb round a long pool;
   - the beacon: a square tower with an iron fire basin on it;
   - a store, a guard kiosk: small closed houses, a door toward the deck's middle;
   - a garden: one the size of the deck (the High Garden) is planting beds inside a gilt railing round the deck's edge,
     open on the four axes; a smaller one (the Grove of the Ancestors) trees in porphyry tubs on a grid. The planting is
     the swbay kit's own (owner, 2026-10-16: "use actual swbay plants or if making new ones, wire them into the swbay
     kit"): the grove's trees (`groveTree`, the kit has no cypress) and the beds' plants (TUNE.flora.placed.garden, the
     parks' mix) are records, VC.summitFlora, that 55 VC.floraPlace plants with SWBAY.treeAt and plantAt, flat on the tub
     or the bed.
   Not laid: the lantern (the captured dome is the throne room's) and the stairs' heads (the core's stair house is the
   summit's stair; the Stair of the Sun and the Astronomers' Stair end under the deck). No stream is drawn. */
VC.bpSummit = function () {
  var Z = TUNE.interiors.summit, B = VOTH, GM = TUNE.flora.placed.garden, gmT = 0;
  for (var gk in GM) gmT += GM[gk];
  VC.summitFlora = [];
  return VC.capture('summit', 2, function () {
    var n = 0;
    Object.keys(VC.INT.cantons).forEach(function (cn) {
      var P = VC.INT.cantons[cn], M = P.M, C = VC.bpConf(M), sh = C && C.summit && VC.PALACE_PLAN.sheets[C.summit]; if (!sh || !P.tiers) return;
      var rect = VC.bpFrame(P), y = M.top.y, K = Z.colours, stone = B.shade(M.tone, 0.14), pale = B.shade(M.tone, 0.24), cx = M.x, cz = M.z;
      var S = P.summit = { blocks: [], rows: [], skipped: [] }, keep = VC.INT.keep[cn] = VC.INT.keep[cn] || [];
      var box = function (o, y0, h, col, fam) { B.BOX((o.x0 + o.x1) / 2, y0, (o.z0 + o.z1) / 2, o.x1 - o.x0, h, o.z1 - o.z0, 0, col, fam); };
      var inset = function (o, d) { return { x0: o.x0 + d, x1: o.x1 - d, z0: o.z0 + d, z1: o.z1 - d }; };
      var block = function (o, y1) { S.blocks.push([o.x0, o.x1, o.z0, o.z1, y + 0.05, y1]); keep.push(obb([(o.x0 + o.x1) / 2, (o.z0 + o.z1) / 2], [1, 0], (o.x1 - o.x0) / 2 + 1, (o.z1 - o.z0) / 2 + 1)); };
      var at = function (x, z, r) { return { x0: x - r, x1: x + r, z0: z - r, z1: z + r }; };
      var brazier = function (x, z, y0) { B.CYL(x, y0, z, 0.3, 1.1, 0, K.iron, 'metal'); B.CYL(x, y0 + 1.1, z, 0.65, 0.35, 0, K.iron, 'metal'); B.CONE(x, y0 + 1.45, z, 0.45, 0.7, 0, K.fire, 'cloth'); };
      /* what stands on the deck already: the captured crown (less what the canton's plan cut) by its own footprint, a round
         piece as a disc and a box as it is turned (the dome's podium is a square turned 45 degrees: its box would be the
         whole deck), and the stair house */
      var cut = CANT.cuts[cn] || {}, ROUND = { cyl: 1, dome: 1, blob: 1, stk: 1, cone: 1 };
      var rectObb = function (o, pad) { return obb([(o.x0 + o.x1) / 2, (o.z0 + o.z1) / 2], [1, 0], (o.x1 - o.x0) / 2 + pad, (o.z1 - o.z0) / 2 + pad); };
      var laid = CANT.hits([M.x - M.top.ro, M.x + M.top.ro, M.z - M.top.ro, M.z + M.top.ro, y + 0.3, y + 60]).filter(function (q) { return q.M === M && !cut[q.k]; }).map(function (q) {
        var r = q.q, c = [r[2] + M.ox, r[4] + M.oz];
        return ROUND[q.sh] ? { c: c, r: r[5] } : obb(c, [Math.cos(r[8] || 0), -Math.sin(r[8] || 0)], r[5] / 2, r[7] / 2);
      });
      if (P.house && !P.house.gate) laid.push(rectObb({ x0: P.house.x - P.house.hw, x1: P.house.x + P.house.hw, z0: P.house.z - P.house.hd, z1: P.house.z + P.house.hd }, 3));
      var hit = function (o, pad) { return laid.some(function (s) {
        if (s.r == null) return SL.pen(s, rectObb(o, pad)) > 0;
        return Math.hypot(Math.max(o.x0 - s.c[0], 0, s.c[0] - o.x1), Math.max(o.z0 - s.c[1], 0, s.c[1] - o.z1)) < s.r + pad;
      }); };
      var lim = M.top.ro - Z.edge, ok = function (o) { return o.x0 > cx - lim + 1.5 && o.x1 < cx + lim - 1.5 && o.z0 > cz - lim + 1.5 && o.z1 < cz + lim - 1.5 && !hit(o, Z.clear); };
      var lattice = []; for (var lx = -lim; lx <= lim; lx += Z.grid) for (var lz = -lim; lz <= lim; lz += Z.grid) lattice.push([cx + lx, cz + lz]);
      var place = function (o) {
        if (ok(o)) return o;
        var mx = (o.x0 + o.x1) / 2, mz = (o.z0 + o.z1) / 2, w = o.x1 - o.x0, d = o.z1 - o.z0;
        var near = lattice.map(function (q) { return [(q[0] - mx) * (q[0] - mx) + (q[1] - mz) * (q[1] - mz), q]; }).sort(function (a, b) { return a[0] - b[0]; });
        for (var f = 0; f < Z.shrink.length; f++) for (var i = 0; i < near.length; i++) for (var t = 0; t < 2; t++) {
          var hw = (t ? d : w) * Z.shrink[f] / 2, hd = (t ? w : d) * Z.shrink[f] / 2, q = near[i][1], c = { x0: q[0] - hw, x1: q[0] + hw, z0: q[1] - hd, z1: q[1] + hd };
          if (ok(c)) return c;
        }
        return null;
      };
      var garden = null;
      sh.rooms.forEach(function (row) {
        var kind = row[2], decor = row[7];
        if (kind === 'lantern' || kind === 'stair') return;
        if (kind === 'garden' && (row[4] - row[3]) * (row[6] - row[5]) > Z.deckGarden * Math.pow(2 * sh.R, 2)) { garden = row; return; }   /* the High Garden: last, round what the others laid */
        var o = place(rect(row[3], row[4], row[5], row[6])); if (!o) { S.skipped.push(row[1]); return; }
        var mx = (o.x0 + o.x1) / 2, mz = (o.z0 + o.z1) / 2, w = o.x1 - o.x0, d = o.z1 - o.z0, ax = P.axis;
        S.rows.push(row[1]); laid.push(rectObb(o, 0)); n++;
        if (kind === 'pavilion') {
          var p = inset(o, 1), gilt = decor >= 4, colC = gilt ? K.gilt : pale, colF = gilt ? 'gilt' : 'stone', top = y + Z.plinth + Z.colH;
          box(p, y, Z.plinth, stone);
          var c = inset(p, 0.9);
          [[c.x0, c.z0, c.x1, c.z0], [c.x1, c.z0, c.x1, c.z1], [c.x1, c.z1, c.x0, c.z1], [c.x0, c.z1, c.x0, c.z0]].forEach(function (sd) {
            var len = Math.hypot(sd[2] - sd[0], sd[3] - sd[1]), k = Math.max(1, Math.round(len / Z.colEvery));
            for (var i = 0; i < k; i++) { var t = i / k, x = sd[0] + (sd[2] - sd[0]) * t, z = sd[1] + (sd[3] - sd[1]) * t; B.CYL(x, y + Z.plinth, z, Z.colR, Z.colH, 0, colC, colF); S.blocks.push([x - Z.colR, x + Z.colR, z - Z.colR, z + Z.colR, y + 0.05, top]); }
          });
          [[p.x0, p.x1, p.z0, p.z0 + 1], [p.x0, p.x1, p.z1 - 1, p.z1], [p.x0, p.x0 + 1, p.z0, p.z1], [p.x1 - 1, p.x1, p.z0, p.z1]].forEach(function (e) { box({ x0: e[0], x1: e[1], z0: e[2], z1: e[3] }, top, Z.entab, gilt ? K.gilt : stone, gilt ? 'gilt' : undefined); });
          box(inset(p, -0.4), top + Z.entab, 0.5, stone);
          if (gilt) { var dr = Math.min(p.x1 - p.x0, p.z1 - p.z0) * 0.36; B.CYL(mx, top + Z.entab + 0.5, mz, dr, 1.6, 0, pale); B.DOME(mx, top + Z.entab + 2.1, mz, dr, dr * 0.8, 0, K.gilt, 'gilt'); }
          else B.FR3(mx, top + Z.entab + 0.5, mz, p.x1 - p.x0 + 0.8, Math.min(p.x1 - p.x0, p.z1 - p.z0) * 0.32, p.z1 - p.z0 + 0.8, 0, K.roof, 'roof');
          var fy = y + Z.plinth, ab = function (u0, u1, v0, v1) { var a = [mx + ax[0] * u0 - ax[1] * v0, mz + ax[1] * u0 + ax[0] * v0], b = [mx + ax[0] * u1 - ax[1] * v1, mz + ax[1] * u1 + ax[0] * v1]; return { x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]) }; };
          if (gilt) {
            /* the seat on its dais, its back to the -u side: it faces the sunrise down the axis */
            var da = ab(-5, -1, -3, 3), sb = ab(-3.9, -2.3, -0.8, 0.8), bk = ab(-3.9, -3.6, -0.8, 0.8);
            box(da, fy, 0.5, K.porphyry); box(sb, fy + 0.5, 0.55, K.gilt, 'gilt'); box(bk, fy + 1.05, 1.5, K.gilt, 'gilt'); block(da, fy + 2.6);
          } else {
            /* divans down the two long sides, a low table between */
            var lx2 = w >= d, half = (lx2 ? d : w) / 2 - 4;
            [-1, 1].forEach(function (sg) { var dvn = lx2 ? { x0: mx - 4, x1: mx + 4, z0: mz + sg * half - 0.8, z1: mz + sg * half + 0.8 } : { x0: mx + sg * half - 0.8, x1: mx + sg * half + 0.8, z0: mz - 4, z1: mz + 4 }; box(dvn, fy, 0.6, K.cloth, 'cloth'); block(dvn, fy + 0.6); });
            box(at(mx, mz, 1.1), fy, 0.5, K.timber, 'wood');
          }
        } else if (kind === 'altar') {
          var a = inset(o, 1.5);
          [0, 1, 2].forEach(function (k) { box(inset(a, k * 1.5), y + k * 0.4, 0.4, k ? pale : stone); });
          var st = at(mx, mz, 1.3); box(st, y + 1.2, 1.1, K.porphyry); B.DOME(mx, y + 2.3, mz, 0.9, 0.9, 0, K.gilt, 'gilt'); block(st, y + 3.2);
          var b2 = inset(a, 2.1); [[b2.x0, b2.z0], [b2.x1, b2.z0], [b2.x0, b2.z1], [b2.x1, b2.z1]].forEach(function (q) { brazier(q[0], q[1], y + 0.8); S.blocks.push([q[0] - 0.7, q[0] + 0.7, q[1] - 0.7, q[1] + 0.7, y + 0.05, y + 2.2]); });
        } else if (kind === 'astronomers') {
          var gp = at(mx, mz, 1.6); box(gp, y, 0.6, stone); B.FR3(mx, y + 0.6, mz, 1.4, Z.gnomon, 1.4, 0, pale); block(gp, y + Z.gnomon);
          box({ x0: mx - 0.15, x1: mx + 0.15, z0: o.z0 + 1, z1: o.z1 - 1 }, y, 0.06, K.gilt, 'gilt');                                   /* the meridian line */
          var qw = { x0: o.x0 + 2, x1: o.x0 + 2.8, z0: mz - 5, z1: mz + 5 }; box(qw, y, Z.quadrant, pale); block(qw, y + Z.quadrant);   /* the quadrant wall */
          for (var i = 0; i < 5; i++) { var ss = at(o.x0 + 6 + (w - 8) * i / 4, o.z1 - 2, 0.45); box(ss, y, 1.2, stone); block(ss, y + 1.2); }   /* the sighting stones */
        } else if (kind === 'court') {
          var k1 = inset(o, 1);
          box(k1, y, 0.5, pale); box(inset(k1, 0.6), y + 0.1, 0.42, K.water, 'metal'); block(k1, y + 0.6);
        } else if (kind === 'beacon') {
          var tw = at(mx, mz, Math.min(w, d) / 2 - 3);
          box(tw, y, Z.beacon, stone); box(inset(tw, -0.3), y + Z.beacon, 0.9, pale);
          B.CYL(mx, y + Z.beacon + 0.9, mz, 2, 1, 0, K.iron, 'metal'); B.CONE(mx, y + Z.beacon + 1.9, mz, 1.5, 2.2, 0, K.fire, 'cloth'); block(tw, y + Z.beacon + 4);
        } else if (kind === 'store' || kind === 'guard') {
          var hs = inset(o, 1.5), hx = (hs.x0 + hs.x1) / 2, hz = (hs.z0 + hs.z1) / 2;
          box(hs, y, Z.kiosk, pale);
          if (kind === 'guard') B.FR3(hx, y + Z.kiosk, hz, hs.x1 - hs.x0 + 1.2, 2.4, hs.z1 - hs.z0 + 1.2, 0, K.roof, 'roof'); else box(inset(hs, -0.6), y + Z.kiosk, 0.4, stone);
          /* its door, on the side toward the deck's middle */
          var dx = cx - hx, dz = cz - hz;
          if (Math.abs(dx) * (hs.z1 - hs.z0) > Math.abs(dz) * (hs.x1 - hs.x0)) B.BOX(dx > 0 ? hs.x1 + 0.03 : hs.x0 - 0.03, y, hz, 0.1, 2.4, 1.4, 0, K.door);
          else B.BOX(hx, y, dz > 0 ? hs.z1 + 0.03 : hs.z0 - 0.03, 1.4, 2.4, 0.1, 0, K.door);
          block(hs, y + Z.kiosk);
        } else if (kind === 'garden') {
          var g = inset(o, 3), nx = Math.max(1, Math.floor((g.x1 - g.x0) / Z.grove)), nz = Math.max(1, Math.floor((g.z1 - g.z0) / Z.grove));
          for (var ix = 0; ix <= nx; ix++) for (var iz = 0; iz <= nz; iz++) {
            var tx = g.x0 + (g.x1 - g.x0) * ix / nx, tz = g.z0 + (g.z1 - g.z0) * iz / nz, tb = at(tx, tz, Z.tub / 2);
            box(tb, y, 1, K.porphyry); block(tb, y + 1 + Z.groveH[1]);
            VC.summitFlora.push({ tree: Z.groveTree, x: tx, y: y + 1, z: tz, u: KRAND.unit(KRAND.hash(7611, Math.round(tx * 10), Math.round(tz * 10))), H: Z.groveH, flat: true });
          }
        }
      });
      /* the High Garden: beds inside the railing, round the edge, clear of everything there; the railing open on the axes */
      if (garden) {
        var E = { x0: cx - lim, x1: cx + lim, z0: cz - lim, z1: cz + lim }, gap = Z.railGap / 2;
        S.rows.push(garden[1]); n++;
        [[E.x0, E.z0, E.x1, E.z0, [0, 1]], [E.x1, E.z0, E.x1, E.z1, [-1, 0]], [E.x1, E.z1, E.x0, E.z1, [0, -1]], [E.x0, E.z1, E.x0, E.z0, [1, 0]]].forEach(function (sd) {
          var nn = sd[4], len = Math.hypot(sd[2] - sd[0], sd[3] - sd[1]), ux = (sd[2] - sd[0]) / len, uz = (sd[3] - sd[1]) / len, mid = len / 2;
          var along = function (t, off) { return [sd[0] + ux * t + nn[0] * off, sd[1] + uz * t + nn[1] * off]; };
          /* the railing: a rail on posts every `postEvery` m, but for the gap on the axis and where something stands */
          [[0.5, mid - gap], [mid + gap, len - 0.5]].forEach(function (sg) {
            var t0 = null, flush = function (t1) { if (t0 == null || t1 - t0 < 1) { t0 = null; return; } var a = along(t0, 0.3), b = along(t1, 0.3), ro = { x0: Math.min(a[0], b[0]) - 0.08, x1: Math.max(a[0], b[0]) + 0.08, z0: Math.min(a[1], b[1]) - 0.08, z1: Math.max(a[1], b[1]) + 0.08 };
              box(ro, y + Z.railH - 0.12, 0.12, K.gilt, 'gilt'); S.blocks.push([ro.x0, ro.x1, ro.z0, ro.z1, y + 0.05, y + Z.railH]); t0 = null; };
            for (var t = sg[0]; t <= sg[1] + 0.01; t += Z.postEvery) {
              var q = along(t, 0.3), po = at(q[0], q[1], 0.09);
              if (hit(po, 0.6)) { flush(t - Z.postEvery); continue; }
              box(po, y, Z.railH, K.gilt, 'gilt'); if (t0 == null) t0 = t;
            }
            flush(Math.min(sg[1], t - Z.postEvery));
          });
          /* the beds: `bed` m deep inside the railing, `bedLen` m long, a shrub at each end, where nothing stands */
          for (var t2 = 2; t2 + Z.bedLen <= len - 2; t2 += Z.bedLen + 1.5) {
            if (t2 + Z.bedLen > mid - gap - 1 && t2 < mid + gap + 1) continue;
            var p0 = along(t2, 1), p1 = along(t2 + Z.bedLen, 1 + Z.bed), bo = { x0: Math.min(p0[0], p1[0]), x1: Math.max(p0[0], p1[0]), z0: Math.min(p0[1], p1[1]), z1: Math.max(p0[1], p1[1]) };
            if (hit(bo, 1.5)) continue;
            box(bo, y, 0.45, K.soil, 'soil'); S.blocks.push([bo.x0, bo.x1, bo.z0, bo.z1, y + 0.05, y + 0.45]);
            /* its plants: the parks' garden mix, a KRAND hash of the spot choosing each */
            for (var pa = Z.bedEvery / 2; pa < Z.bedLen; pa += Z.bedEvery) [0.3, 0.7].forEach(function (f) {
              var q2 = along(t2 + pa, 1 + Z.bed * f), v = KRAND.unit(KRAND.hash(7612, Math.round(q2[0] * 10), Math.round(q2[1] * 10))), acc = 0, kind = null;
              for (var pk in GM) { acc += GM[pk] / gmT; if (kind == null && v < acc) kind = pk; }
              VC.summitFlora.push({ plant: kind || Object.keys(GM)[0], x: q2[0], y: y + 0.45, z: q2[1], flat: true });
            });
          }
        });
      }
    });
    return n;
  });
};
