// ================================================================= METROPOLIS — the floor plans  [G data]
// MP.storey(F, k): one storey of a family as an ancients-interiors STOREY {id, level, y, h, outline, rooms, walls}. A pure function of
// (family, level): nothing exists until a storey is asked for, so a tower nobody is near costs nothing (PLAN.md section 6).
// It uses AI's plates where they fit (ring, bar, hall) and adds the flats: a ring sector cut into hall, kitchen, living, bedrooms, bath.
// The core is one record, cut out of every plate at the same place; MP.audit (44) proves it. Needs KratorAncientsInteriors.
(function () {
  var TAU = Math.PI * 2, CW = 1.8;     // the corridor
  function r3(v) { return Math.round(v * 1000) / 1000; }
  function at(r, th) { return [r3(r * Math.cos(th)), r3(r * Math.sin(th))]; }
  // a plate turned about the axis by a: every point it holds (rooms, doors, walls, the outline)
  function turn(st, a) {
    var c = Math.cos(a), n = Math.sin(a), T = function (p) { return [r3(p[0] * c - p[1] * n), r3(p[0] * n + p[1] * c)]; };
    st.outline = st.outline.map(T);
    st.rooms.forEach(function (Q) { if (Q.poly) Q.poly = Q.poly.map(T); Q.doors.forEach(function (d) { d.at = T(d.at); }); if (Q.th != null) Q.th += a; });
    st.walls.forEach(function (W) { W.pts = W.pts.map(T); if (W.door) W.door.at = T(W.door.at); });
    return st;
  }
  function arc(r, t0, t1, n) { var o = []; for (var i = 0; i <= n; i++) o.push(at(r, t0 + (t1 - t0) * i / n)); return o; }

  // the room kinds: `store` etc. are kits/interiors programmes; a kind with no programme is furnished false
  var UNFURNISHED = { core: 1, corridor: 1, plant: 1, tank: 1, concourse: 1, hallway: 1, wardrobe: 1 };
  MP.ROOMKIND = { office: 'study', meeting: 'study', classroom: 'school', clinic: 'sickbay', stack: 'library', stall: 'shop', cafe: 'tavern', reception: 'antechamber', wardrobe: 'store' };
  function kindOf(k) { return MP.ROOMKIND[k] || k; }

  // ---- the round storey: what zone asks what of a ring. R the skin's inner face at this storey, core its record
  function coreR(F, k) { return k > F.core.stepAt ? F.core.rUp : F.core.r; }
  function skinR(F, L) { return (L.use === 'lamp' || L.use === 'roofpark' ? F.crown.r : MP.spindleR(L.y + L.h * 0.5)) - 0.45; }
  function sectors(F, L, n, kinds, o) {
    o = o || {}; var R = skinR(F, L), rc = coreR(F, L.k), band = o.band == null ? R - rc - CW : o.band;
    var st = KratorAncientsInteriors.ringPlate({
      id: F.id + '.' + L.k, level: L.k, y: L.y, h: L.h, rOut: function () { return R; }, depth: band, cw: o.cw == null ? CW : o.cw, n: n,
      kinds: function (i, nn) { return kinds(i, nn); }, seg: o.seg == null ? 4 : o.seg, core: { r: rc, kind: null }, door: o.door
    });
    st.R = R; st.rc = rc; st.n = n; st.band = band;
    st.rooms.forEach(function (Q) { var src = Q.kind; Q.mpKind = src; Q.kind = kindOf(src); if (UNFURNISHED[src]) Q.furnish = false; });
    return st;
  }

  // ---- a flat: one sector of a ring, cut. Outer band (the glass): living, then one or two bedrooms. Inner band (the corridor side):
  // kitchen, hall, bath. The hall's span overlaps every outer room, so it has a door to each. Only the outer rooms have glass.
  function flatSector(st, Q, i, beds) {
    var n = st.n, t0 = TAU * i / n, t1 = TAU * (i + 1) / n, ra = st.R - st.band, rb = st.R - 0.05, rm = ra + Math.min(beds > 1 ? 8 : 4.6, st.band * 0.45), T = function (f) { return t0 + (t1 - t0) * f; };
    var splits = beds > 1 ? [0, 0.48, 0.74, 1] : [0, 0.58, 1], fk = beds > 1 ? 0.3 : 0.38, fb = beds > 1 ? 0.88 : 0.82, id = Q.id, DW = 0.9;
    function room(name, kind, f0, f1, r0, r1) {
      return { id: id + '.' + name, kind: kindOf(kind), mpKind: kind, flat: id, poly: arc(r0, T(f0), T(f1), 2).concat(arc(r1, T(f0), T(f1), 2).reverse()), y: Q.y, h: Q.h, level: Q.level,
        doors: [], windows: [], furnish: !UNFURNISHED[kind], th0: T(f0), th1: T(f1) };
    }
    var kitchen = room('kitchen', 'kitchen', 0, fk, ra, rm), hall = room('hall', 'hallway', fk, fb, ra, rm), wide = (1 - fb) * (t1 - t0) * ra >= 1.1, rw = wide ? ra + (rm - ra) * 0.4 : ra, ward = wide ? room('ward', 'wardrobe', fb, 1, ra, rw) : null, bath = room('bath', 'bath', fb, 1, rw, rm), out = [room('living', 'living', splits[0], splits[1], rm, rb)];
    for (var b = 1; b < splits.length - 1; b++) out.push(room('bed' + (b - 1), 'bedroom', splits[b], splits[b + 1], rm, rb));
    function wall(name, pts, a, c, d) { st.walls.push({ id: id + '.' + name, pts: pts, y: Q.y, h: Q.h, rooms: [a.id, c ? c.id : null], door: d || null, broken: false }); }
    function door(A, B, p) { A.doors.push({ at: p, w: DW, to: B.id }); B.doors.push({ at: p, w: DW, to: A.id }); return { at: p, w: DW }; }
    hall.doors.push({ at: at(ra, T((fk + fb) / 2)), w: 1, to: st.id + '.corr' });
    wall('w.k', [at(ra, T(fk)), at(rm, T(fk))], kitchen, hall, door(hall, kitchen, at((ra + rm) / 2, T(fk))));
    /* the service end past the hall: a closet at the narrow corridor end, the bath at the wide end, each with its door on the hall */
    /* where the service end is under 1.1 m wide at the corridor (the small flats' narrow sectors), no closet: the bath takes the strip */
    if (ward) wall('w.b', [at(ra, T(fb)), at(rw, T(fb))], ward, hall, door(hall, ward, at((ra + rw) / 2, T(fb))));
    wall('w.b2', [at(rw, T(fb)), at(rm, T(fb))], bath, hall, door(hall, bath, at((rw + rm) / 2, T(fb))));
    for (var w = 1; w < splits.length - 1; w++) wall('w.o' + w, [at(rm, T(splits[w])), at(rb, T(splits[w]))], out[w - 1], out[w]);
    // the ring between the two bands, cut at every partition that meets it; each piece holds at most one door, the hall's to the room over it
    var gaps = out.map(function (O, oi) { var lo = Math.max(splits[oi], fk), hi = Math.min(splits[oi + 1], fb), f = (lo + hi) / 2; (st.doorFit = st.doorFit || []).push({ room: O.id, arc: (hi - lo) * (t1 - t0) * rm, w: DW }); return { f: f, d: door(hall, O, at(rm, T(f))) }; });
    var cutsDone = [], cuts = [0, fk, fb, 1].concat(splits.slice(1, -1)).sort(function (p, q) { return p - q; });
    for (var c = 0; c + 1 < cuts.length; c++) {
      var gap = gaps.filter(function (g) { return g.f > cuts[c] && g.f < cuts[c + 1]; })[0];
      wall('w.m' + c, arc(rm, T(cuts[c]), T(cuts[c + 1]), 2), out[0], null, gap ? gap.d : null); cutsDone.push(st.walls[st.walls.length - 1]);
    }
        if (ward) wall('w.wd', arc(rw, T(fb), T(1), 2), ward, bath);
    return [kitchen, hall, bath].concat(ward ? [ward] : [], out);
  }
  function flats(F, L, n, beds) {
    var st = sectors(F, L, n, function () { return 'flat'; }), keep = [];
    st.rooms.forEach(function (Q) {
      var m = /\.r(\d+)$/.exec(Q.id);
      if (!m) { keep.push(Q); return; }
      keep = keep.concat(flatSector(st, Q, +m[1], beds));
    });
    // the sector's own door on the ring becomes the hall's: the corridor-side wall keeps its gap at the hall
    st.rooms = keep;
    st.walls.forEach(function (W) { if (/\.cw$/.test(W.id)) { var r = W.rooms[0], i = +/\.r(\d+)\.cw$/.exec(W.id)[1], t = TAU * (i + 0.5 * (beds > 1 ? 0.3 + 0.88 : 0.38 + 0.82)) / n, p = at(st.R - st.band, t); W.door = { at: p, w: 1 }; W.rooms[0] = r + '.hall'; } });
    return st;
  }

  var PLAN = {
    /* the lobby is turned so a concourse faces each portal (the ring starts at 0, where a portal is, so a partition stood in its doorway), and a concourse is open to the
       ring corridor: from the doors straight to the lifts */
    lobby: function (F, L) {
      var st = turn(sectors(F, L, 9, function (i) { return ['concourse', 'stall', 'cafe'][i % 3]; }, { cw: 5, door: 2.4 }), F.portals[0] - TAU / 18);
      var open = {}; st.rooms.forEach(function (Q) { if (Q.mpKind === 'concourse') open[Q.id + '.cw'] = 1; });
      st.walls = st.walls.filter(function (W) { return !open[W.id]; });
      return st;
    },
    mezzanine: function (F, L) { return sectors(F, L, 12, function (i) { return i % 3 ? 'office' : 'store'; }); },
    market: function (F, L) { return sectors(F, L, 24, function () { return 'stall'; }, { cw: 3.4, door: 2 }); },
    clinic: function (F, L) { return sectors(F, L, 18, function (i) { return i % 6 === 2 ? 'store' : 'clinic'; }); },
    plant: function (F, L) { return sectors(F, L, 6, function () { return 'plant'; }); },
    tanks: function (F, L) { return sectors(F, L, 4, function () { return 'tank'; }); },
    flatsA: function (F, L) { return flats(F, L, 12, 2); },
    flatsB: function (F, L) { return flats(F, L, 12, 1); },
    flatsC: function (F, L) { return flats(F, L, 6, 1); },
    school: function (F, L) { return sectors(F, L, 10, function (i) { return i === 7 ? 'store' : 'classroom'; }); },
    offices: function (F, L) { return sectors(F, L, 8, function (i) { return i % 4 === 3 ? 'meeting' : 'office'; }); },
    skylobby: function (F, L) { return sectors(F, L, 8, function (i) { return i % 2 ? 'stall' : 'concourse'; }, { cw: 4 }); },
    hydroponics: function (F, L) { return sectors(F, L, 6, function () { return 'greenhouse'; }); },
    records: function (F, L) { return sectors(F, L, 8, function () { return 'stack'; }); },
    lamp: function (F, L) { return sectors(F, L, 6, function () { return 'concourse'; }, { band: 6 }); },
    roofpark: function (F, L) { return sectors(F, L, 4, function () { return 'concourse'; }, { band: 6 }); }
  };

  // ---- the slab: a bar plate along x, the shafts cut out of it
  function bar(F, L, roomW, kinds, o) {
    o = o || {}; var w = F.footprint.w, d = F.footprint.d - 0.9 - 2 * (o.inset || 0);
    var st = KratorAncientsInteriors.barPlate({ id: F.id + '.' + L.k, level: L.k, y: L.y, h: L.h, path: function (u) { return [-w / 2 + w * u, 0]; }, depth: d, side: 'both', cw: o.cw == null ? 2.4 : o.cw, roomW: roomW, kinds: kinds, door: o.door });
    /* AI.barPlate draws a cross wall from the room's inner start to its OUTER END (outer[m]), a diagonal across the room; it should run straight across at the start
       (the room's polygon ends there). Straightened here; the kit's fix waits for an all-builds rebuild (KNOWN_ISSUES.md) */
    var byId = {}; st.rooms.forEach(function (Q) { byId[Q.id] = Q; });
    st.walls.forEach(function (W) { var Q = /\.x$/.test(W.id) && byId[W.rooms[0]]; if (Q) W.pts = [W.pts[0], Q.poly[Q.poly.length - 1]]; });
    st.rooms.forEach(function (Q) { var src = Q.kind; Q.mpKind = src; Q.kind = kindOf(src); if (UNFURNISHED[src]) Q.furnish = false; });
    return cutShafts(F, st);
  }
  // a shaft takes its own rectangle: a room over it is cut across into what is left on either side and a core bay, so the
  // core stands where the record says on every storey and the rooms keep their party walls
  function cutShafts(F, st) {
    var S = F.core.shafts.filter(function (s) { return st.level >= s.from && st.level <= s.to; }), out = [], corr = st.id + '.corr';
    function bbox(Q) { var b = [1e9, -1e9, 1e9, -1e9]; Q.poly.forEach(function (p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.max(b[1], p[0]); b[2] = Math.min(b[2], p[1]); b[3] = Math.max(b[3], p[1]); }); return b; }
    st.rooms.forEach(function (Q) {
      var B = bbox(Q);
      if (Q.kind === 'corridor') { out.push(Q); return; }
      var hit = S.filter(function (s) { return B[1] > s.x - s.w / 2 && B[0] < s.x + s.w / 2 && B[3] > s.z - s.d / 2 && B[2] < s.z + s.d / 2; });
      if (!hit.length) { Q.x0 = B[0]; Q.x1 = B[1]; out.push(Q); return; }
      var inner = Math.abs(B[2]) < Math.abs(B[3]) ? B[2] : B[3], sl = [], x = B[0];
      hit.sort(function (p, q) { return p.x - q.x; }).forEach(function (s) {
        var a = Math.max(B[0], s.x - s.w / 2), b = Math.min(B[1], s.x + s.w / 2);
        if (a - x >= 2) sl.push({ a: x, b: a, kind: Q.mpKind }); else a = x;
        sl.push({ a: a, b: b, kind: 'core', shaft: s.id }); x = b;
      });
      if (B[1] - x >= 2) sl.push({ a: x, b: B[1], kind: Q.mpKind }); else sl[sl.length - 1].b = B[1];
      st.walls = st.walls.filter(function (W) { return W.id !== Q.id + '.cw'; });
      sl.forEach(function (c, i) {
        var id = Q.id + '.' + i, da = [r3((c.a + c.b) / 2), inner], w = Math.min(Q.doors[0].w, c.b - c.a - 0.4);
        out.push({ id: id, kind: kindOf(c.kind), mpKind: c.kind, poly: [[c.a, B[2]], [c.b, B[2]], [c.b, B[3]], [c.a, B[3]]], y: Q.y, h: Q.h, level: Q.level, x0: c.a, x1: c.b, side: Q.side,
          doors: [{ at: da, w: w, to: corr }], windows: [], furnish: Q.furnish && !UNFURNISHED[c.kind], shaft: c.shaft });
        st.walls.push({ id: id + '.cw', pts: [[c.a, inner], [c.b, inner]], y: Q.y, h: Q.h, rooms: [id, corr], door: { at: da, w: w }, broken: false });
        if (i) st.walls.push({ id: id + '.x', pts: [[c.a, B[2]], [c.a, B[3]]], y: Q.y, h: Q.h, rooms: [id, Q.id + '.' + (i - 1)], door: null, broken: false });
      });
    });
    st.rooms = out;
    return st;
  }
  var PLAN_BAR = {
    arcade: function (F, L) { return bar(F, L, 18, function (i, n) { return i === (n >> 1) ? 'reception' : i % 3 === 1 ? 'stall' : 'concourse'; }, { cw: 6, door: 3, inset: F.arcade.depth }); },   // the arcade's glass stands 3 m in: its rooms stop there, not in the walkway
    mezzanine: function (F, L) { return bar(F, L, 6, function (i) { return i % 4 ? 'office' : 'store'; }); },
    market: function (F, L) { return bar(F, L, 6, function () { return 'stall'; }, { cw: 3.4, door: 2 }); },
    clinic: function (F, L) { return bar(F, L, 6, function (i) { return i % 8 === 3 ? 'store' : 'clinic'; }); },
    plant: function (F, L) { return bar(F, L, 18, function () { return 'plant'; }); },
    offices: function (F, L) { return bar(F, L, 18, function (i) { return i % 4 === 3 ? 'meeting' : 'office'; }, { door: 1.6 }); },
    records: function (F, L) { return bar(F, L, 18, function () { return 'stack'; }); },
    ministries: function (F, L) { return bar(F, L, 6, function (i) { return i % 5 === 2 ? 'meeting' : 'office'; }); },
    council: function (F, L) { return bar(F, L, 9, function (i, n) { return i > n / 2 - 2 && i < n / 2 + 1 ? 'hall' : 'meeting'; }, { door: 1.6 }); }
  };

  MP.storey = function (F, k) {
    var L = F.levels[k]; if (!L) throw new Error('MP.storey: ' + F.id + ' has no level ' + k);
    var T = F.core.kind === 'round' ? PLAN : PLAN_BAR, fn = T[L.use];
    if (!fn) throw new Error('MP.storey: no plan for the use ' + L.use);
    var st = fn(F, L); st.use = L.use; st.family = F.id;
    st.rooms.forEach(function (Q) { Q.blank = !!MP.WINDOWLESS[Q.mpKind] && !(Q.mpKind === 'stack' && Q.side === 'right'); if (Q.mpKind === 'greenhouse') { Q.recipe = 'greenhouse'; Q.kind = 'store'; } if (Q.mpKind === 'reception') { Q.recipe = 'reception'; Q.furnish = true; } });
    MP.fenestrate(F, st);
    return st;
  };
  MP.WINDOWLESS = { core: 1, corridor: 1, tank: 1, stack: 1, greenhouse: 1, hallway: 1, bath: 1, kitchen: 1, wardrobe: 1 };
  MP.skinR = skinR; MP.coreR = coreR; MP.CORRIDOR = CW;
})();
