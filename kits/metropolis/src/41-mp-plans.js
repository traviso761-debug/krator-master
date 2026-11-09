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
  /* the window a room kind takes, as the facade's bay sizes (MP.BAYSIZE): for plates that set their own */
  var WINBAY = { office: 'ribbon', meeting: 'ribbon', classroom: 'tall', clinic: 'window', bedroom: 'window', living: 'wide', stall: 'wide', cafe: 'wide', concourse: 'tall', hall: 'tall', reception: 'tall' };

  // ---- the round storey: what zone asks what of a ring. R the skin's inner face at this storey, core its record
  function coreR(F, k) { return k > F.core.stepAt ? F.core.rUp : F.core.r; }
  /* a design's skin comes from its record (envR, 46c); the Spindle's from its lathe */
  function skinR(F, L) { if (F.envR) return F.envR(L.y + L.h * 0.5, L) - 0.45; return (L.use === 'lamp' || L.use === 'roofpark' ? F.crown.r : MP.spindleR(L.y + L.h * 0.5)) - 0.45; }
  function sectors(F, L, n, kinds, o) {
    /* a wide ring takes more sectors (a design's secScale: the Cupola's 104 m drum three times the Spindle's count) */
    o = o || {}; n = Math.max(1, Math.round(n * (F.secScale == null ? 1 : F.secScale))); var R = skinR(F, L), rc = coreR(F, L.k), band = o.band == null ? R - rc - CW : o.band;
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
    /* a narrow sector (the bath past the hall under 1.5 m at the corridor: 0.5 to 1 m on the Spindle's 30-degree flats) is cut the other way
       (the owner, 2026-11-03: baths wide enough for a bath, a basin and a toilet): the hall is an L, an entry 1.16 m wide at the corridor and a
       passage along the outer rooms, so it still opens on every room; the bath takes the corridor corner behind the passage */
    var wide0 = (1 - fb) * (t1 - t0) * ra >= 1.1, rw0 = wide0 ? ra + (rm - ra) * 0.4 : ra;
    if ((1 - fb) * (t1 - t0) * rw0 < 1.5) return deepBath(st, Q, i, beds, { t0: t0, t1: t1, ra: ra, rb: rb, rm: rm, T: T, splits: splits, room: room, DW: DW });
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
  // the narrow sector's plan: kitchen [0, fk] the inner band's full depth (a galley widening outward; a one-bedroom flat's keeps its 0.38, where
  // a hearth fits); the hall an L, its entry [fk, fh] on the corridor (1.06 m: a 0.9 m door and its jambs) and its passage [fh, 1] between rH and rm (1.2 m deep, 1.4 with two bedrooms); the bath
  // [fh, 1] between ra and rH, its door on the passage
  function deepBath(st, Q, i, beds, S) {
    var t0 = S.t0, t1 = S.t1, ra = S.ra, rb = S.rb, rm = S.rm, T = S.T, splits = S.splits, room = S.room, DW = S.DW, id = Q.id, arcA = (t1 - t0) * ra;
    var fk = beds > 1 ? 0.3 : 0.38, fh = fk + (DW + 0.16) / arcA, rH = rm - (beds > 1 ? 1.4 : 1.2);
    var kitchen = room('kitchen', 'kitchen', 0, fk, ra, rm), bath = room('bath', 'bath', fh, 1, ra, rH), out = [room('living', 'living', splits[0], splits[1], rm, rb)];
    var hall = room('hall', 'hallway', fk, 1, ra, rm);
    hall.poly = arc(ra, T(fk), T(fh), 2).concat(arc(rH, T(fh), T(1), 2), arc(rm, T(1), T(fk), 2));
    for (var b = 1; b < splits.length - 1; b++) out.push(room('bed' + (b - 1), 'bedroom', splits[b], splits[b + 1], rm, rb));
    function wall(name, pts, a, c, d) { st.walls.push({ id: id + '.' + name, pts: pts, y: Q.y, h: Q.h, rooms: [a.id, c ? c.id : null], door: d || null, broken: false }); }
    function door(A, B, p) { A.doors.push({ at: p, w: DW, to: B.id }); B.doors.push({ at: p, w: DW, to: A.id }); return { at: p, w: DW }; }
    hall.doors.push({ at: at(ra, T((fk + fh) / 2)), w: DW, to: st.id + '.corr' });
    wall('w.k', [at(ra, T(fk)), at(rm, T(fk))], kitchen, hall, door(hall, kitchen, at((ra + rm) / 2, T(fk))));
    wall('w.bs', [at(ra, T(fh)), at(rH, T(fh))], bath, hall);
    wall('w.b2', arc(rH, T(fh), T(1), 2), bath, hall, door(hall, bath, at(rH, T((fh + 1) / 2))));
    for (var w = 1; w < splits.length - 1; w++) wall('w.o' + w, [at(rm, T(splits[w])), at(rb, T(splits[w]))], out[w - 1], out[w]);
    var gaps = out.map(function (O, oi) { var lo = Math.max(splits[oi], fk), hi = splits[oi + 1], f = (lo + hi) / 2; (st.doorFit = st.doorFit || []).push({ room: O.id, arc: (hi - lo) * (t1 - t0) * rm, w: DW }); return { f: f, d: door(hall, O, at(rm, T(f))) }; });
    var cuts = [0, fk, 1].concat(splits.slice(1, -1)).sort(function (p, q) { return p - q; });
    for (var c = 0; c + 1 < cuts.length; c++) {
      var gap = gaps.filter(function (g) { return g.f > cuts[c] && g.f < cuts[c + 1]; })[0];
      wall('w.m' + c, arc(rm, T(cuts[c]), T(cuts[c + 1]), 2), out[0], null, gap ? gap.d : null);
    }
    return [kitchen, hall, bath].concat(out);
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
    /* a transit hall (the Cupola's): a concourse at each portal, open to the ring, stalls between; the ring turned so a concourse faces portal 0 */
    hall: function (F, L) {
      var n = Math.max(1, Math.round(16 * (F.secScale == null ? 1 : F.secScale))), q = n / F.portals.length;
      var st = turn(sectors(F, L, 16, function (i) { return i % q === 0 ? 'concourse' : 'stall'; }, { cw: 5, door: 2.4 }), F.portals[0] - TAU / n / 2);
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
    /* a hotel's ring (the Stalk's saucer): rooms round the core, a linen store on each side */
    hotel: function (F, L) { return sectors(F, L, 16, function (i) { return i % 8 === 4 ? 'store' : 'bedroom'; }); },
    records: function (F, L) { return sectors(F, L, 8, function () { return 'stack'; }); },
    lamp: function (F, L) { return sectors(F, L, 6, function () { return 'concourse'; }, { band: 6 }); },
    roofpark: function (F, L) { return sectors(F, L, 4, function () { return 'concourse'; }, { band: 6 }); }
  };

  // ---- the slab: a bar plate along x, the shafts cut out of it
  function bar(F, L, roomW, kinds, o) {
    o = o || {}; var w = F.footprint.w, d = F.footprint.d - 0.9 - 2 * (o.inset || 0);
    var st = KratorAncientsInteriors.barPlate({ id: F.id + '.' + L.k, level: L.k, y: L.y, h: L.h, path: function (u) { return [-w / 2 + w * u, 0]; }, depth: d, side: 'both', cw: o.cw == null ? 2.4 : o.cw, roomW: roomW, kinds: kinds, door: o.door });
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

  // ---- rings in bands, outside in (the Terrace's tiers round their court): rooms bands and corridor bands between the skin (rOut) and the court's
  // face (rIn). A rooms band's rooms open on the corridor next to them (door: 'in' toward the axis, 'out' away from it); a band with no corridor on
  // one side has a wall there. Sectors at the shafts' angles in the band the shafts stand in are their core bays (Q.shaft); passages (kind
  // 'passage') cross a band between two corridors. The outermost band's rooms carry th0, th1 (the facade's windows); the slab has the court as
  // a hole (st.hole). o: { rOut, rIn, bands: [{ d, n, kinds(i, n), door, corr, passage(i) }], shafts: [{ id, th, band }] }
  // Batch 4 adds, each off by default: o.id (a plate's own ids, several to a storey), o.cx, o.cz (its centre), o.a0, o.a1 (an arc of a ring: a
  // curved bar from rIn to rOut, its ends the skin), o.windows (rooms set their own on the skin: the outer band's, and with o.skinIn the inner
  // band's on rIn), a band's grid (its sectors' angle, laid from a0 the same on every storey, the last cut at a1), rot (a whole ring's sectors
  // turned: a gate centred on its door), whole (one sector, no partition) and gate(i, n, t0, t1) (a sector that is a way through: a passage to its corridor, `street` when the street's door opens on it)
  function rings(F, L, o) {
    var id = o.id || F.id + '.' + L.k, cx = o.cx || 0, cz = o.cz || 0, part = o.a0 != null, a0 = part ? o.a0 : 0, span = part ? o.a1 - o.a0 : TAU;
    var st = { id: id, level: L.k, y: L.y, h: L.h, rooms: [], walls: [], outline: [], hole: part ? 0 : o.rIn, R: o.rOut, rc: o.rIn, n: 0, band: 0 };
    if (!part) for (var q = 0; q < 64; q++) st.outline.push(at(o.rOut, TAU * q / 64));
    else st.outline = arc(o.rOut, a0, a0 + span, Math.max(4, Math.ceil(span * o.rOut / 3))).concat(arc(o.rIn, a0, a0 + span, Math.max(4, Math.ceil(span * o.rIn / 3))).reverse());
    var r = o.rOut, B = o.bands.map(function (b) { var r1 = r, r0 = r - b.d; r = r0; return Object.assign({}, b, { r0: r0, r1: r1 }); });
    B.forEach(function (b, bi) { if (b.corr) b.cid = id + '.corr' + bi; });
    B.forEach(function (b, bi) {
      if (b.corr) { var nc = Math.max(4, Math.ceil(span * b.r1 / 2.5)); st.rooms.push({ id: b.cid, kind: 'corridor', mpKind: 'corridor', poly: part ? arc(b.r0 + 0.02, a0, a0 + span, nc).concat(arc(b.r1 - 0.05, a0, a0 + span, nc).reverse()) : null, ring: part ? undefined : { cx: 0, cz: 0, r0: b.r0, r1: b.r1 }, y: L.y, h: L.h, level: L.k, doors: [], windows: [], furnish: false }); return; }
      var T0 = [], g = b.grid;
      if (g) { for (var u = a0; u < a0 + span - 1e-9; u += g) T0.push(u); if (T0.length > 1 && a0 + span - T0[T0.length - 1] < g * 0.4) T0.pop(); }
      var n = g ? T0.length : Math.max(1, Math.round(b.n * (F.secScale == null ? 1 : F.secScale))), inC = B[bi + 1] && B[bi + 1].corr ? B[bi + 1] : null, outC = B[bi - 1] && B[bi - 1].corr ? B[bi - 1] : null, seg = Math.max(2, Math.ceil(span / n * b.r1 / 2.5));
      for (var i = 0; i < n; i++) {
        var t0 = g ? T0[i] : a0 + (b.rot || 0) + span * i / n, t1 = g ? (i + 1 < n ? T0[i + 1] : a0 + span) : a0 + (b.rot || 0) + span * (i + 1) / n, tm = (t0 + t1) / 2, rid = id + '.b' + bi + '.r' + i;
        var sh = (o.shafts || []).filter(function (s) { if (s.band !== bi) return false; var d = Math.abs(((s.th - tm) % TAU + TAU * 1.5) % TAU - Math.PI); return d < (t1 - t0) / 2; })[0];
        var gate = !sh && b.gate ? b.gate(i, n, t0, t1) : null, pass = !gate && b.passage && b.passage(i, n) && inC && outC, src = sh ? 'core' : gate || pass ? 'passage' : b.kinds(i, n);
        var inner = arc(b.r0 + 0.02, t0, t1, seg), outer = arc(b.r1 - 0.05, t0, t1, seg), poly = inner.concat(outer.slice().reverse());
        var Q = { id: rid, kind: src === 'passage' ? 'corridor' : kindOf(src), mpKind: src, poly: poly, y: L.y, h: L.h, level: L.k, doors: [], windows: [], furnish: !UNFURNISHED[src] && src !== 'passage' && src !== 'core', shaft: sh ? sh.id : undefined };
        if (gate) { Q.gate = true; Q.street = !!gate.street; Q.th = tm; }
        if (bi === 0) { Q.th0 = t0; Q.th1 = t1; }
        var sides = pass ? [inC, outC] : [b.door === 'out' ? (outC || inC) : (inC || outC)];
        sides.forEach(function (C) { if (!C) return; var rr = C === inC ? b.r0 : b.r1, da = at(rr, tm); Q.doors.push({ at: da, w: src === 'core' ? 1.2 : gate ? 1.6 : 1, to: C.cid }); });
        /* its own windows: on the skin, the room's share of it */
        var wr = bi === 0 ? b.r1 - 0.05 : o.skinIn && bi === B.length - 1 ? b.r0 + 0.02 : null;
        if (o.windows && wr != null && src !== 'core' && src !== 'passage' && !MP.WINDOWLESS[src]) { var S2 = MP.BAYSIZE[WINBAY[src] || 'window']; Q.windows.push({ at: at(wr, tm), w: r3((t1 - t0) * wr * 0.7), sill: S2[1], h: S2[2] - S2[1] }); }
        st.rooms.push(Q);
        /* the walls: the side on each corridor (with its door), the far side where no corridor is (but the skin's and the court's), the partition at t0 */
        [[inC, b.r0, inner], [outC, b.r1, outer]].forEach(function (E, ei) {
          var C = E[0], d = Q.doors.filter(function (x) { return C && x.to === C.cid; })[0];
          if (C) st.walls.push({ id: rid + (ei ? '.wo' : '.wi'), pts: E[2], y: L.y, h: L.h, rooms: [rid, C.cid], door: d ? { at: d.at, w: d.w } : null, broken: false });
          else if (ei === 0 && bi < B.length - 1) st.walls.push({ id: rid + '.wi', pts: E[2], y: L.y, h: L.h, rooms: [rid, null], door: null, broken: false });
        });
        if (!(part && i === 0) && !b.whole) st.walls.push({ id: rid + '.p0', pts: [at(b.r0, t0), at(b.r1 - 0.05, t0)], y: L.y, h: L.h, rooms: [rid, null], door: null, broken: false });
      }
    });
    st.n = Math.max(1, Math.round((B[0].n == null ? 1 : B[0].n) * (F.secScale == null ? 1 : F.secScale))); st.band = B[0].d;
    if (o.windows) st.windowsOwn = true;
    /* moved to its centre; its own inside test (a ring's or an arc's) and its slab's part (st.part: parts() gathers them) */
    if (cx || cz) {
      var T = function (p) { return [r3(p[0] + cx), r3(p[1] + cz)]; };
      st.outline = st.outline.map(T);
      st.rooms.forEach(function (Q) { if (Q.poly) Q.poly = Q.poly.map(T); if (Q.ring) { Q.ring.cx = cx; Q.ring.cz = cz; } Q.doors.forEach(function (d) { d.at = T(d.at); }); Q.windows.forEach(function (w) { w.at = T(w.at); }); });
      st.walls.forEach(function (W) { W.pts = W.pts.map(T); if (W.door) W.door.at = T(W.door.at); });
    }
    if (o.id || cx || cz || part) st.inside = function (x, z) {
      var dx = x - cx, dz = z - cz, rr = Math.hypot(dx, dz); if (rr > o.rOut + 0.02) return false;
      if (!part) return !(o.rIn && rr < o.rIn - 0.02);
      var d = ((Math.atan2(dz, dx) - a0) % TAU + TAU) % TAU, tol = 0.02 / o.rIn;
      return rr >= o.rIn - 0.02 && (d <= span + tol || d >= TAU - tol);
    };
    st.part = { cx: cx, cz: cz, rOut: o.rOut, rIn: o.rIn || 0, a0: part ? a0 : null, a1: part ? a0 + span : null, outline: st.outline };
    return st;
  }
  // ---- a strip: a straight run of floor (the Pods' bridge in their tube), one corridor from a to b, w wide, a glass rail each side (st.rails)
  function strip(F, L, o) {
    var a = o.a, b = o.b, dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), w = o.w / 2, nx = -dz / l * w, nz = dx / l * w;
    var poly = [[r3(a[0] + nx), r3(a[1] + nz)], [r3(b[0] + nx), r3(b[1] + nz)], [r3(b[0] - nx), r3(b[1] - nz)], [r3(a[0] - nx), r3(a[1] - nz)]];
    var st = { id: o.id, rooms: [{ id: o.id, kind: 'corridor', mpKind: 'corridor', poly: poly, y: L.y, h: L.h, level: L.k, doors: [], windows: [], furnish: false }], walls: [], outline: poly, rails: [[poly[0], poly[1]], [poly[2], poly[3]]] };
    st.inside = function (x, z) { var u = ((x - a[0]) * dx + (z - a[1]) * dz) / l, v = (-(x - a[0]) * dz + (z - a[1]) * dx) / l; return u >= -0.06 && u <= l + 0.06 && Math.abs(v) <= w + 0.02; };
    st.part = { strip: true, outline: poly };
    return st;
  }
  // ---- parts: one storey of several plates (the Organ's pipes; the Pods' pods, their bridge and the dome; the Long Curve's arc): their rooms
  // and walls together, each plate's slab its own (st.parts), the storey's inside any plate's, its outline the largest plate's (the walk's
  // floor takes every part's: 56)
  function parts(F, L, P) {
    var st = { id: F.id + '.' + L.k, level: L.k, y: L.y, h: L.h, rooms: [], walls: [], outline: [], windowsOwn: true, parts: [], rails: [] }, big = -1;
    P.forEach(function (s) {
      st.rooms = st.rooms.concat(s.rooms); st.walls = st.walls.concat(s.walls); st.parts.push(s.part); if (s.rails) st.rails = st.rails.concat(s.rails);
      var a = Math.abs(KratorAncientsInteriors.polyArea(s.outline)); if (a > big) { big = a; st.outline = s.outline; }
    });
    st.inside = function (x, z) { return P.some(function (s) { return s.inside(x, z); }); };
    return st;
  }
  // ---- a lobe (the Swell's): a ring plate about the lobe's own centre over the arc outside the middle, its corridor opening on the middle's
  // concourse; its rooms set their own windows on the lobe's skin (st.windowsOwn)
  function lobe(F, L, o) {
    var st = KratorAncientsInteriors.ringPlate({ id: o.id, level: L.k, y: L.y, h: L.h, cx: o.cx, cz: o.cz, rOut: function () { return o.r; }, depth: o.depth, cw: CW, a0: o.a0, a1: o.a1, n: o.n, kinds: function (i, n) { return o.kinds(i, n); }, seg: 4, core: null });
    st.rooms.forEach(function (Q) {
      var src = Q.kind; Q.mpKind = src; Q.kind = kindOf(src); if (UNFURNISHED[src]) Q.furnish = false;
      if (Q.kind !== 'corridor' && !MP.WINDOWLESS[src]) { var S = MP.BAYSIZE[({ office: 'ribbon', meeting: 'ribbon', classroom: 'tall', clinic: 'window', bedroom: 'window', living: 'wide' })[src] || 'window'], tm = Q.th, w = (o.a1 - o.a0) / o.n * o.r * 0.7; Q.windows.push({ at: [o.cx + o.r * Math.cos(tm), o.cz + o.r * Math.sin(tm)], w: Math.round(w * 100) / 100, sill: S[1], h: S[2] - S[1] }); }
    });
    return st;
  }
  // ---- rect rings: rooms round all four sides of a rectangle (the Wedge's, the Reed's, the Arcades'), in bands outside in like rings(). A rooms
  // band's north and south rooms run the band's full width (their end rooms take the corners), its east and west rooms fit between them; every room's
  // door is on its corridor's side. Inside the bands: a core zone (a core room holding the shafts, each with a core bay of its own) or, with o.hole,
  // the court. A band with d null fills to the hole (its depth differs side to side). Shafts standing in a band take the room they fall in as their
  // core bay. The plate is built centred and square, then turned by o.yaw and moved to (o.cx, o.cz): a storey can lean and twist. Rooms carry their
  // own windows on the skin and on the court (st.windowsOwn); the storey its own inside test (st.inside).
  // o: { hw, hd, cx, cz, yaw, bands: [{ d, roomW, kinds(i, n, side), door, corr }], hole: { hw, hd } | null, shafts: [{ id, x, z, w, d }] (the record's) }
  function rectRings(F, L, o) {
    var id = F.id + '.' + L.k, cx = o.cx || 0, cz = o.cz || 0, yaw = o.yaw || 0, c = Math.cos(yaw), s = Math.sin(yaw);
    var toL = function (x, z) { var dx = x - cx, dz = z - cz; return [dx * c - dz * s, dx * s + dz * c]; };
    var st = { id: id, level: L.k, y: L.y, h: L.h, rooms: [], walls: [], outline: [[-o.hw, -o.hd], [o.hw, -o.hd], [o.hw, o.hd], [-o.hw, o.hd]], windowsOwn: true, holeRect: o.hole || null };
    var sh = (o.shafts || []).filter(function (q) { return L.k >= q.from && L.k <= q.to; }).map(function (q) { var p = toL(q.x, q.z); return { id: q.id, x: p[0], z: p[1], w: q.w, d: q.d }; });
    var R = [{ hw: o.hw, hd: o.hd }]; o.bands.forEach(function (b) { var p = R[R.length - 1]; R.push(b.d == null ? { hw: o.hole.hw, hd: o.hole.hd } : { hw: p.hw - b.d, hd: p.hd - b.d }); });
    var B = o.bands.map(function (b, i) { return Object.assign({}, b, { o: R[i], i: R[i + 1], cid: b.corr ? id + '.corr' + i : null }); });
    var used = {};
    function wall(wid, pts, a, b, d) { st.walls.push({ id: wid, pts: pts, y: L.y, h: L.h, rooms: [a, b || null], door: d || null, broken: false }); }
    B.forEach(function (b, bi) {
      if (b.corr) { st.rooms.push({ id: b.cid, kind: 'corridor', mpKind: 'corridor', poly: null, y: L.y, h: L.h, level: L.k, doors: [], windows: [], furnish: false }); return; }
      var inC = B[bi + 1] && B[bi + 1].corr ? B[bi + 1] : null, outC = B[bi - 1] && B[bi - 1].corr ? B[bi - 1] : null, C = b.door === 'out' ? (outC || inC) : (inC || outC), toIn = C === inC;
      var Ro = b.o, Ri = b.i, rw = b.roomW == null ? 6 : b.roomW, k = 0;
      /* each side: [axis along, its outer and inner offsets, the run along it]: N/S run x over the band's full width, E/W run z between them */
      [['S', 1], ['E', 1], ['N', -1], ['W', -1]].forEach(function (sd) {
        var S = sd[0], sg = sd[1], ns = S === 'S' || S === 'N', a0 = ns ? -Ri.hw : -Ri.hd, a1 = ns ? Ri.hw : Ri.hd, n = Math.max(1, Math.round((a1 - a0) / rw));
        var P = function (along, off) { return ns ? [along, sg * off] : [sg * off, along]; }, oo = ns ? Ro.hd : Ro.hw, oi = ns ? Ri.hd : Ri.hw;
        for (var i = 0; i < n; i++) {
          var u0 = a0 + (a1 - a0) * i / n, u1 = a0 + (a1 - a0) * (i + 1) / n, e0 = ns && i === 0 ? -Ro.hw : u0, e1 = ns && i === n - 1 ? Ro.hw : u1, um = (u0 + u1) / 2;
          var poly = [P(e0, oi), P(e1, oi), P(e1, oo - 0.05), P(e0, oo - 0.05)], rid = id + '.b' + bi + S + i;
          var shaft = sh.filter(function (q) { var p = ns ? q.x : q.z, off = sg * (ns ? q.z : q.x); return p >= e0 && p <= e1 && off >= oi && off <= oo; })[0];
          var src = shaft ? 'core' : b.kinds(k++, n * 4, S), Q = { id: rid, kind: kindOf(src), mpKind: src, poly: poly, y: L.y, h: L.h, level: L.k, doors: [], windows: [], furnish: !UNFURNISHED[src] && src !== 'core', shaft: shaft ? shaft.id : undefined, side: S };
          if (shaft) used[shaft.id] = 1;
          if (C) { var dp = P(um, toIn ? oi : oo); Q.doors.push({ at: dp, w: src === 'core' ? 1.2 : 1, to: C.cid }); wall(rid + '.c', [P(u0, toIn ? oi : oo), P(u1, toIn ? oi : oo)], rid, C.cid, { at: dp, w: Q.doors[0].w }); }
          /* the far side where no corridor is: a middle band's (the skin's and the court's are the building's) */
          var far = toIn ? oo : oi, farIsSkin = toIn ? bi === 0 : (bi === B.length - 1 && o.hole);
          if (!farIsSkin && !(toIn ? outC : inC)) wall(rid + '.f', [P(u0, far), P(u1, far)], rid, null);
          if (!(ns && i === 0)) wall(rid + '.p', [P(u0, oi), P(u0, oo - 0.05)], rid, null);
          if (!ns && i === n - 1) wall(rid + '.q', [P(u1, oi), P(u1, oo - 0.05)], rid, null);
          /* windows: on the skin (the outer band) and on the court (the inner band round a hole) */
          var winOn = bi === 0 ? oo : (o.hole && bi === B.length - 1 ? oi : null);
          if (winOn != null && !MP.WINDOWLESS[src] && src !== 'core') { var S2 = MP.BAYSIZE[({ office: 'ribbon', meeting: 'ribbon', classroom: 'tall', clinic: 'window', bedroom: 'window', living: 'wide', stall: 'wide', cafe: 'wide', concourse: 'tall', hall: 'tall', reception: 'tall' })[src] || 'window']; Q.windows.push({ at: P(um, winOn), w: Math.round((u1 - u0) * 0.7 * 100) / 100, sill: S2[1], h: S2[2] - S2[1] }); }
          st.rooms.push(Q);
        }
      });
    });
    /* the core zone: the rectangle inside the last corridor, a core room on it, and a core bay for each shaft standing in it */
    if (!o.hole) {
      var Z = R[R.length - 1], last = B[B.length - 1], zid = id + '.core', zp = [[-Z.hw, -Z.hd], [Z.hw, -Z.hd], [Z.hw, Z.hd], [-Z.hw, Z.hd]], zd = [0, Z.hd];
      st.rooms.push({ id: zid, kind: 'core', mpKind: 'core', poly: zp, y: L.y, h: L.h, level: L.k, doors: last.corr ? [{ at: zd, w: 1.6, to: last.cid }] : [], windows: [], furnish: false });
      if (last.corr) { wall(zid + '.s', [zp[3], zp[2]], zid, last.cid, { at: zd, w: 1.6 }); wall(zid + '.n', [zp[0], zp[1]], zid, last.cid); wall(zid + '.e', [zp[1], zp[2]], zid, last.cid); wall(zid + '.w', [zp[3], zp[0]], zid, last.cid); }
      sh.forEach(function (q) { if (used[q.id]) return; st.rooms.push({ id: id + '.' + q.id, kind: 'core', mpKind: 'core', poly: [[q.x - q.w / 2, q.z - q.d / 2], [q.x + q.w / 2, q.z - q.d / 2], [q.x + q.w / 2, q.z + q.d / 2], [q.x - q.w / 2, q.z + q.d / 2]], y: L.y, h: L.h, level: L.k, doors: [{ at: [q.x, q.z], w: 1, to: zid }], windows: [], furnish: false, shaft: q.id }); });
    }
    /* turned and moved into the building's frame: rooms, doors, walls, the outline; the inside test reads back into the plate's own */
    var T = function (p) { return [r3(cx + p[0] * c + p[1] * s), r3(cz - p[0] * s + p[1] * c)]; };
    st.outline = st.outline.map(T);
    st.rooms.forEach(function (Q) { if (Q.poly) Q.poly = Q.poly.map(T); Q.doors.forEach(function (d) { d.at = T(d.at); }); Q.windows.forEach(function (w) { w.at = T(w.at); }); });
    st.walls.forEach(function (W) { W.pts = W.pts.map(T); if (W.door) W.door.at = T(W.door.at); });
    st.inside = function (x, z) { var p = toL(x, z); return Math.abs(p[0]) <= o.hw + 0.02 && Math.abs(p[1]) <= o.hd + 0.02 && !(o.hole && Math.abs(p[0]) < o.hole.hw - 0.02 && Math.abs(p[1]) < o.hole.hd - 0.02); };
    st.rect = { hw: o.hw, hd: o.hd, cx: cx, cz: cz, yaw: yaw };
    return st;
  }
  MP.planLib = { sectors: sectors, rings: rings, rectRings: rectRings, lobe: lobe, strip: strip, parts: parts, turn: turn, arc: arc, at: at, kindOf: kindOf, UNFURNISHED: UNFURNISHED, CW: CW, PLAN: PLAN };

  MP.storey = function (F, k) {
    var L = F.levels[k]; if (!L) throw new Error('MP.storey: ' + F.id + ' has no level ' + k);
    /* a design may carry its own plan (46c: the Terrace's bands, the Swell's lobes), from the library above */
    if (F.plan) { var st0 = F.plan(F, L, MP.planLib); st0.use = L.use; st0.family = F.id; st0.rooms.forEach(function (Q) { Q.blank = !!MP.WINDOWLESS[Q.mpKind]; if (Q.mpKind === 'reception') { Q.recipe = 'reception'; Q.furnish = true; } }); MP.fenestrate(F, st0); return st0; }
    var T = F.core.kind === 'round' ? PLAN : PLAN_BAR, fn = T[L.use];
    if (!fn) throw new Error('MP.storey: no plan for the use ' + L.use);
    var st = fn(F, L); st.use = L.use; st.family = F.id;
    /* an atrium's edge is open (a balustrade, 56): the ring's wall on the core side goes */
    if (F.core.atrium) { var rc = coreR(F, L.k); st.walls = st.walls.filter(function (W) { return !(W.pts && W.pts.every(function (p) { return Math.abs(Math.hypot(p[0], p[1]) - rc) < 0.3; })); }); }
    st.rooms.forEach(function (Q) { Q.blank = !!MP.WINDOWLESS[Q.mpKind] && !(Q.mpKind === 'stack' && Q.side === 'right'); if (Q.mpKind === 'greenhouse') { Q.recipe = 'greenhouse'; Q.kind = 'store'; } if (Q.mpKind === 'reception') { Q.recipe = 'reception'; Q.furnish = true; } });
    MP.fenestrate(F, st);
    return st;
  };
  MP.WINDOWLESS = { core: 1, corridor: 1, tank: 1, stack: 1, greenhouse: 1, hallway: 1, bath: 1, kitchen: 1, wardrobe: 1 };
  MP.skinR = skinR; MP.coreR = coreR; MP.CORRIDOR = CW;
})();
