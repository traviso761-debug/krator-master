/* ============================== 5h. THE CANTONS' INTERIORS ============================== */
/* [G data] The owner (2026-10-09): "Give cantons a real walkable interior that is suited to their purpose - for arsenal,
   barracks, smithing, weapon manufacture; market and guild - shops and workshops; granary baking and food storage,
   arena training, gladiator barracks, animal stables; ancestry has catacombs and tombs; harbor warehouses; fortress
   ordinator training rooms and jail; foreign canton diplomatic offices and residences. Add some residences among them
   as well. hold off on palace and temple for now", and: "make sure all cantons have an entrance on the top level and on
   the bottom to enable someone to walk from a ferry to the top surface".

   A tiered canton is hollowed, tier by tier (its levels: 20-site-cantons.js CANT.read). Inside each tier's wall
   (TUNE.interiors.wall thick, at the tier's narrowest, its top) the tier is cut into storeys of at least storeyMin.
   - THE CORE: a stair hall, square, set off the canton's middle toward its main bottom door, rising through every
     storey of every tier to a stair house on the top deck (the top entrance). Its stair is a double flight a storey:
     up one side of the well to a landing, back up the other side to the next floor.
   - THE HALLS: from the core, along both axes, a hall on every storey (longer on the lowest storey of a tier); rooms
     line both sides of each hall, a door from each room onto it.
   - THE WAY IN: from each bottom door (CANT.doors: behind each ferry pier's and mole's flight, on the apron) a tunnel
     through the tier's wall to the end of its hall on the ground storey.
   - THE ROOMS take the canton's purposes (TUNE.interiors.purposes: kind -> share), a few of them residences; each room
     is a kits/interiors ROOM (kind, outline, doors) that the placer furnishes when the canton is first opened
     (VC.intFurnish, from the catalog: Voth's common, court, trade and training sets, then Iziz and generic).
   - THE ANCESTRY is a spiral, not tiers: its catacombs are cut into the core at the apron's level, reached from its
     dock's door: galleries of ossuary niches round a grid, tomb chambers off them.
   Everything is a record: rooms, halls, flights, the walls with their door gaps, the floor slabs (with the wells cut
   out), each an axis-aligned box. KWALK takes the floors, the flights and the walls (VC.intWalk); the host draws them
   on demand (55-vc-host.js VC.drawInterior) and shows them in the cutaway (58-vc-tools.js) or when the walker is in. */
VC.INT = { cantons: {}, keep: {} };
VC.intU = function (n, a, b, salt) { return KRAND.unit(KRAND.hash(7301, n.charCodeAt(0) * 31 + n.length, a | 0, b | 0, salt | 0)); };
/* a weighted pick from {kind: share} by a unit number */
VC.intPick = function (shares, u) { var tot = 0, k; for (k in shares) tot += shares[k]; var acc = 0; for (k in shares) { acc += shares[k] / tot; if (u < acc) return k; } return k; };

VC.intPlanAll = function () {
  var T = TUNE.interiors; VC.INT = { cantons: {}, keep: {} };
  CANT.list.forEach(function (M) {
    if (T.skip.indexOf(M.n) >= 0 || !T.purposes[M.n]) return;
    var P = M.spiral ? VC.intPlanCatacombs(M) : VC.intPlanTiered(M);
    if (P) VC.INT.cantons[M.n] = P;
  });
  /* the canton plan's walker takes these cantons as hollow, and the stair wells out of their top decks */
  CANT.hollow = {}; CANT.holes = {};
  Object.keys(VC.INT.cantons).forEach(function (cn) {
    var P = VC.INT.cantons[cn]; if (P.catacombs) return;
    CANT.hollow[cn] = true;
    var c = P.core, w = VC.intWell(P);
    CANT.holes[cn] = [[c.x - w[0], c.x + w[0], c.z - w[1], c.z + w[1], P.M.top.y]];
  });
  VC.intEntrances();
  /* what the hollowing lays open (owner, 2026-10-09: "what are these stones clipping inside the arena"): a captured
     piece wholly inside a tier's interior (its footprint within the tier's R, its middle within the tier's heights)
     was buried in the canton's stone (Voth's inner stairs, the arena's sunk footings); the stone is rooms now, so it goes */
  var opened = 0;
  Object.keys(VC.INT.cantons).forEach(function (cn) {
    var P = VC.INT.cantons[cn]; if (P.catacombs || !P.tiers) return;
    var M = P.M, seen = new Set();
    CANT.grid.forEach(function (a) { a.forEach(function (q) {
      if (seen.has(q) || q.M !== M) return; seen.add(q);
      var ym = (q.y0 + q.y1) / 2, ext = Math.max(Math.abs(q.x0 - M.x), Math.abs(q.x1 - M.x), Math.abs(q.z0 - M.z), Math.abs(q.z1 - M.z));
      if (P.tiers.concat(P.dungeon ? [P.dungeon] : []).some(function (tr) { return ym > tr.y0 + 0.3 && ym < tr.y1 - 0.3 && q.y1 < tr.y1 + 0.3 && ext <= tr.R + T.wall * 0.5; })) { CANT.cut(q, 'inside the hollowed canton'); opened++; }
    }); });
  });
  var n = 0, r = 0; for (var k in VC.INT.cantons) { n++; r += VC.INT.cantons[k].rooms.length; }
  return n + ' canton interiors, ' + r + ' rooms; ' + opened + ' buried pieces taken out';
};

/* ---------------------------------------------------------------- a tiered canton */
VC.intPlanTiered = function (M) {
  var T = TUNE.interiors, L = M.levels, topK = L.indexOf(M.top);
  if (topK < 1) return null;
  var doors = CANT.doors.filter(function (d) { return d.canton === M.n && d.kind === 'bottom'; });
  var axis = doors.length ? doors[0].n : [1, 0], perp = [-axis[1], axis[0]];
  /* the tiers and their storeys */
  var tiers = [];
  for (var k = 0; k < topK; k++) {
    var lo = L[k], hi = L[k + 1]; if (!lo.ri) continue;
    var R = lo.ri * 0.86 - T.wall, H = hi.y - lo.y, ns = Math.max(1, Math.floor(H / T.storeyMin)), hs = H / ns, st = [];
    for (var j = 0; j < ns; j++) st.push({ j: j, y: lo.y + j * hs, h: hs - T.slab });
    tiers.push({ k: k, y0: lo.y, y1: hi.y, R: R, storeys: st });
  }
  if (!tiers.length) return null;
  var Rmin = tiers.reduce(function (m, t) { return Math.min(m, t.R); }, Infinity);
  /* the core: off the middle toward the main door, inside the narrowest tier and the top deck */
  var off = Math.max(T.coreOff[0], Math.min(T.coreOff[1] * Rmin, Rmin - T.core - 4, M.top.ro - T.core - 6));
  /* a top level that is a ring round a keep (the Fortress): the core rises inside the keep, which opens onto the ring */
  if (M.top.ri) off = Math.min(off, M.top.ri - T.core - 3);
  var cc = [M.x + axis[0] * off, M.z + axis[1] * off];
  var P = { n: M.n, M: M, axis: axis, perp: perp, core: { x: cc[0], z: cc[1], half: T.core }, tiers: tiers, rooms: [], halls: [], tunnels: [], flights: [], boxes: [], floors: [], doorsOut: doors, storeys: [] };
  var allSt = [];
  tiers.forEach(function (t) { t.storeys.forEach(function (s) { allSt.push({ t: t, s: s }); }); });
  /* a dungeon (owner, 2026-10-09: "add clear dungeon level to the interior" of the Fortress): a storey of its own under
     the ground storey, below the apron, in the first tier's walls, reached by the core's stair only; its rooms are
     TUNE.interiors.dungeon's (cells, guard rooms), drawn in darker stone. The doors and tunnels stay on the ground storey */
  var DG = T.dungeon && T.dungeon[M.n];
  if (DG) allSt.unshift({ t: tiers[0], s: { j: -1, y: tiers[0].y0 - DG.h, h: DG.h - T.slab, dungeon: true } });
  allSt.forEach(function (o, si) {
    var t = o.t, s = o.s, ground = s.j === 0, first = si === 0, S = { i: si, tier: t.k, y: s.y, h: s.h, R: t.R, dungeon: !!s.dungeon };
    P.storeys.push(S);
    /* the arms: both axes; the axis arms reach the wall on the lowest storey of each tier, the others stop short */
    [[axis, 1], [[-axis[0], -axis[1]], 1], [perp, 0], [[-perp[0], -perp[1]], 0]].forEach(function (a, ai) {
      var d = a[0], reach = ground || a[1] ? t.R - 1 : Math.min(t.R - 1, T.arm);
      /* the arm's length from the core's middle: the axis arm runs from the core, the opposite one from the far side */
      var c0 = (cc[0] - M.x) * d[0] + (cc[1] - M.z) * d[1], start = T.core - 1.5, end = reach - c0;   /* it starts inside the core: no wall between */
      if (end - start < T.room.w[0] + 2) return;
      var hall = VC.intRect(cc, d, start, end, T.hall / 2, s.y, s.h, 'hall');
      hall.storey = si; hall.arm = ai; P.halls.push(hall);
      /* rooms along both sides */
      [-1, 1].forEach(function (side) {
        var a0 = T.start, idx = 0;
        while (a0 + T.room.w[0] <= end) {
          var w = T.room.w[0] + (T.room.w[1] - T.room.w[0]) * VC.intU(M.n, si * 8 + ai * 2 + (side > 0), idx, 1);
          if (a0 + w > end) w = end - a0;
          if (w < T.room.w[0] - 0.01) break;
          var dep = T.room.d, lat0 = T.hall / 2, room = VC.intSideRect(cc, d, side, a0, a0 + w, lat0, lat0 + dep, s.y, s.h);
          /* a room must stay inside the tier's wall */
          if (Math.max(Math.abs(room.x0 - M.x), Math.abs(room.x1 - M.x), Math.abs(room.z0 - M.z), Math.abs(room.z1 - M.z)) > t.R) { a0 += w; idx++; continue; }
          room.storey = si; room.tier = t.k; room.arm = ai; room.side = side;
          /* its door: the middle of its wall on the hall */
          var dm = a0 + w / 2, dp = [cc[0] + d[0] * dm + -d[1] * side * lat0, cc[1] + d[1] * dm + d[0] * side * lat0];
          room.door = { x: dp[0], z: dp[1], w: T.doorW, n: [-(-d[1] * side), -(d[0] * side)] };
          room.kind = s.dungeon ? VC.intPick(DG.purposes, VC.intU(M.n, si * 8 + ai * 2 + (side > 0), idx, 5)) : VC.intRoomKind(M, si, ai, side, idx);
          room.id = M.n + '.s' + si + '.a' + ai + (side > 0 ? 'r' : 'l') + idx;
          P.rooms.push(room);
          a0 += w + T.room.gap; idx++;
        }
      });
    });
    /* the core's stair hall, this storey */
    P.flights = P.flights.concat(VC.intCoreStair(P, S, allSt[si + 1] ? allSt[si + 1].s.y : M.top.y));
  });
  /* the way in: each bottom door's tunnel, on the ground storey of tier 0, through the wall to its arm's hall */
  var g0i = allSt.findIndex(function (o) { return !o.s.dungeon; }), g0 = allSt[g0i];
  P.ground = g0i; if (DG) P.dungeon = { y0: allSt[0].s.y, y1: g0.s.y, R: tiers[0].R };
  doors.forEach(function (D, i) {
    var d = D.n, rFace = CANT.sq(M, D.x, D.z), cIn = (cc[0] - M.x) * d[0] + (cc[1] - M.z) * d[1];
    var along = (D.x - M.x) * -d[1] + (D.z - M.z) * d[0], ccA = (cc[0] - M.x) * -d[1] + (cc[1] - M.z) * d[0];
    var tun = { x0: 0, x1: 0, z0: 0, z1: 0, y: g0.s.y, h: Math.min(g0.s.h, T.tunnelH), kind: 'tunnel', door: D.id };
    /* the tunnel runs straight in from the door; if the door is off the hall's line it meets the wall's inner face
       and an inner passage runs along that face to the hall */
    /* it runs on into the passage (or the hall's end) it meets, so the two overlap and no wall stands between them */
    var a = [M.x + d[0] * (g0.t.R - 1 - T.tunnelW) + -d[1] * along, M.z + d[1] * (g0.t.R - 1 - T.tunnelW) + d[0] * along], b = [D.x + d[0] * 0.6, D.z + d[1] * 0.6];
    Object.assign(tun, VC.intSeg(a, b, T.tunnelW / 2));
    P.tunnels.push(tun);
    if (Math.abs(along - ccA) > T.hall / 2) {
      var e = [M.x + d[0] * (g0.t.R - 0.5 - T.tunnelW / 2) + -d[1] * along, M.z + d[1] * (g0.t.R - 0.5 - T.tunnelW / 2) + d[0] * along];
      var f = [M.x + d[0] * (g0.t.R - 0.5 - T.tunnelW / 2) + -d[1] * ccA, M.z + d[1] * (g0.t.R - 0.5 - T.tunnelW / 2) + d[0] * ccA];
      var pas = Object.assign({ y: g0.s.y, h: tun.h, kind: 'passage', door: D.id }, VC.intSeg(e, f, T.tunnelW / 2));
      P.tunnels.push(pas);
      /* the rooms the passage would cut through give way */
      P.rooms = P.rooms.filter(function (r) { return r.storey !== g0i || !VC.intOverlap(r, pas, 0.2); });
    }
  });
  /* the top: the core's last flights rise through the top deck into a stair house */
  P.house = VC.intStairHouse(P);
  if (P.house.keep) {
    var wk = VC.intWell(P), hole = [P.core.x - wk[0], P.core.x + wk[0], P.core.z - wk[1], P.core.z + wk[1]];
    CANT.rectMinus([P.house.x - P.house.hw, P.house.x + P.house.hw, P.house.z - P.house.hd, P.house.z + P.house.hd], [hole]).forEach(function (q) { P.floors.push({ x0: q[0], x1: q[1], z0: q[2], z1: q[3], y: P.house.y, kind: 'keep', storey: P.storeys.length - 1, top: true }); });
  }
  else VC.INT.keep[M.n] = [obb([P.house.x, P.house.z], [1, 0], P.house.hw + 3, P.house.hd + 3)];
  VC.intWalls(P);
  return P;
};
/* a rectangle along direction d (an axis) from a0 to a1 out of the point c, half-width h: an axis-aligned box */
VC.intRect = function (c, d, a0, a1, h, y, hh, kind) {
  var p = [c[0] + d[0] * a0, c[1] + d[1] * a0], q = [c[0] + d[0] * a1, c[1] + d[1] * a1];
  return { x0: Math.min(p[0], q[0]) - Math.abs(d[1]) * h, x1: Math.max(p[0], q[0]) + Math.abs(d[1]) * h, z0: Math.min(p[1], q[1]) - Math.abs(d[0]) * h, z1: Math.max(p[1], q[1]) + Math.abs(d[0]) * h, y: y, h: hh, kind: kind };
};
/* a rectangle beside an arm: along d from a0 to a1, out to `side` from lat0 to lat1 */
VC.intSideRect = function (c, d, side, a0, a1, lat0, lat1, y, hh) {
  var n = [-d[1] * side, d[0] * side], P = [];
  [[a0, lat0], [a1, lat0], [a0, lat1], [a1, lat1]].forEach(function (q) { P.push([c[0] + d[0] * q[0] + n[0] * q[1], c[1] + d[1] * q[0] + n[1] * q[1]]); });
  var xs = P.map(function (p) { return p[0]; }), zs = P.map(function (p) { return p[1]; });
  return { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs), z0: Math.min.apply(null, zs), z1: Math.max.apply(null, zs), y: y, h: hh, kind: 'room' };
};
/* an axis-aligned segment a-b, half-width h, as a box */
VC.intSeg = function (a, b, h) { return { x0: Math.min(a[0], b[0]) - (Math.abs(a[0] - b[0]) < 1e-6 ? h : 0), x1: Math.max(a[0], b[0]) + (Math.abs(a[0] - b[0]) < 1e-6 ? h : 0), z0: Math.min(a[1], b[1]) - (Math.abs(a[1] - b[1]) < 1e-6 ? h : 0), z1: Math.max(a[1], b[1]) + (Math.abs(a[1] - b[1]) < 1e-6 ? h : 0) }; };
VC.intOverlap = function (a, b, pad) { return a.x0 < b.x1 + pad && a.x1 > b.x0 - pad && a.z0 < b.z1 + pad && a.z1 > b.z0 - pad; };
/* a room's kind: the canton's purposes (one in TUNE.interiors.residence a residence), by a hash of where it is */
VC.intRoomKind = function (M, si, ai, side, idx) {
  var T = TUNE.interiors, u = VC.intU(M.n, si * 8 + ai * 2 + (side > 0), idx, 2);
  if (u < T.residence) return VC.intU(M.n, si, idx, 3) < 0.5 ? 'cottage' : 'living';
  return VC.intPick(T.purposes[M.n], VC.intU(M.n, si * 8 + ai * 2 + (side > 0), idx, 4));
};
/* the core's stair, one storey: up the -perp side of the well along the axis to a landing, back up the +perp side
   to the next floor. Returns the flights (records like CANT's) and puts the landing and the floor round the well in
   P.floors. */
VC.intCoreStair = function (P, S, yNext) {
  var T = TUNE.interiors, c = P.core, a = P.axis, p = P.perp, wl = T.well, rise = yNext - S.y, half = rise / 2, out = [];
  var at = function (u, v) { return [c.x + a[0] * u + p[0] * v, c.z + a[1] * u + p[1] * v]; };
  out.push({ canton: P.n, kind: 'core', a: at(-wl[1], -wl[0] / 2), b: at(wl[1], -wl[0] / 2), y0: S.y, y1: S.y + half, w: wl[0] - 0.6, base: S.y, storey: S.i });
  out.push({ canton: P.n, kind: 'core', a: at(wl[1], wl[0] / 2), b: at(-wl[1], wl[0] / 2), y0: S.y + half, y1: yNext, w: wl[0] - 0.6, base: S.y + half - 0.4, storey: S.i });
  /* the landing at the far end of the well, at half height */
  var l0 = at(wl[1], -wl[0]), l1 = at(wl[1] + 2.4, wl[0]);
  P.floors.push({ x0: Math.min(l0[0], l1[0]), x1: Math.max(l0[0], l1[0]), z0: Math.min(l0[1], l1[1]), z1: Math.max(l0[1], l1[1]), y: S.y + half, kind: 'landing', storey: S.i });
  return out;
};
/* the well cut through each floor over the core's stair: [half-width in x, in z]; 0.8 m short of the flights' ends
   along the stair, so each flight starts and lands on floor */
VC.intWell = function (P) { var wl = TUNE.interiors.well, a = wl[1] - 0.8; return Math.abs(P.axis[0]) > 0.5 ? [a, wl[0]] : [wl[0], a]; };
/* the stair house over the core on the top deck: walls on three sides, its door where the last flight arrives */
VC.intStairHouse = function (P) {
  var T = TUNE.interiors, c = P.core, w = T.well, M = P.M;
  if (M.top.ri) {
    /* the keep's floor at the ring's height, its walls round it, a door onto the ring where the stair arrives */
    var r = M.top.ri + 0.3, d = [M.x - P.axis[0] * (r - 0.9), M.z - P.axis[1] * (r - 0.9)];   /* its floor meets the ring */
    return { keep: true, x: M.x, z: M.z, y: M.top.y, hw: r, hd: r, h: Math.min(6, T.houseH), door: d, n: [-P.axis[0], -P.axis[1]] };   /* the door on the side the stair arrives */
  }
  var hw = Math.abs(P.axis[0]) > 0.5 ? w[1] + 3.6 : w[0] + 3.6, hd = Math.abs(P.axis[0]) > 0.5 ? w[0] + 3.6 : w[1] + 3.6;
  var door = [c.x - P.axis[0] * (w[1] + 3.6), c.z - P.axis[1] * (w[1] + 3.6)];
  return { x: c.x, z: c.z, y: P.M.top.y, hw: hw, hd: hd, h: T.houseH, door: door, n: [-P.axis[0], -P.axis[1]] };
};
/* the walls: every room's, hall's, tunnel's and the core's outline as wall boxes, with a gap at each door; the floor
   and ceiling slabs (a storey's floor has the core's well cut out where the stair rises through it) */
VC.intWalls = function (P) {
  var T = TUNE.interiors, t = T.wallT, B = P.boxes, F = P.floors, c = P.core, h = c.half, wl = T.well;
  /* the open spaces of a storey: what a wall line may not cross (a hall, a tunnel, a passage, the core) */
  var open = function (si) {
    var o = P.halls.filter(function (q) { return q.storey === si; }).concat(si === 0 ? P.tunnels : []);
    o.push({ x0: c.x - h, x1: c.x + h, z0: c.z - h, z1: c.z + h });
    return o;
  };
  /* one wall line from a to b (axis-aligned) on storey si, minus the doorways on it and minus where an open space
     other than `own` crosses it */
  var line = function (x0, z0, x1, z1, si, y, hh, own, doors, tag) {
    var alongX = Math.abs(z1 - z0) < 1e-6, a0 = alongX ? Math.min(x0, x1) : Math.min(z0, z1), a1 = alongX ? Math.max(x0, x1) : Math.max(z0, z1), L = alongX ? z0 : x0, iv = [[a0, a1]];
    var minus = function (lo, hi) { iv = [].concat.apply([], iv.map(function (s) { return lo >= s[1] || hi <= s[0] ? [s] : [[s[0], lo], [hi, s[1]]].filter(function (q) { return q[1] - q[0] > 0.05; }); })); };
    (doors || []).forEach(function (d) { if ((alongX ? Math.abs(d.z - L) : Math.abs(d.x - L)) > t) return; var m = alongX ? d.x : d.z; minus(m - d.w / 2, m + d.w / 2); });
    open(si).forEach(function (o) { if (o === own) return; var cross = alongX ? (o.z0 < L - 0.05 && o.z1 > L + 0.05) : (o.x0 < L - 0.05 && o.x1 > L + 0.05); if (cross) minus(alongX ? o.x0 : o.z0, alongX ? o.x1 : o.z1); });
    iv.forEach(function (s) { B.push(alongX ? { x0: s[0], x1: s[1], z0: L - t / 2, z1: L + t / 2, y0: y, y1: y + hh, kind: 'wall', storey: si, of: tag } : { x0: L - t / 2, x1: L + t / 2, z0: s[0], z1: s[1], y0: y, y1: y + hh, kind: 'wall', storey: si, of: tag }); });
  };
  var roomDoors = P.rooms.map(function (r) { return Object.assign({ storey: r.storey }, r.door); });
  /* a room: three walls (its hall side is the hall's) */
  P.rooms.forEach(function (r) {
    var e = [[r.x0, r.z0, r.x1, r.z0], [r.x0, r.z1, r.x1, r.z1], [r.x0, r.z0, r.x0, r.z1], [r.x1, r.z0, r.x1, r.z1]];
    e.forEach(function (q) { var alongX = q[1] === q[3], L = alongX ? q[1] : q[0]; if ((alongX ? Math.abs(r.door.z - L) : Math.abs(r.door.x - L)) < 0.05) return; line(q[0], q[1], q[2], q[3], r.storey, r.y, r.h, r, [], 'room'); });
    F.push({ x0: r.x0, x1: r.x1, z0: r.z0, z1: r.z1, y: r.y, kind: 'room', storey: r.storey, room: r.id });
  });
  /* a hall, a tunnel, a passage: all four sides, opened where the doors are and where another open space meets it */
  P.halls.concat(P.tunnels).forEach(function (o) {
    var si = o.storey == null ? 0 : o.storey, ds = roomDoors.filter(function (d) { return d.storey === si; });
    [[o.x0, o.z0, o.x1, o.z0], [o.x0, o.z1, o.x1, o.z1], [o.x0, o.z0, o.x0, o.z1], [o.x1, o.z0, o.x1, o.z1]].forEach(function (q) {
      /* a tunnel's mouth (its end at its door) stays open */
      if (o.kind === 'tunnel' && (P.doorsOut || CANT.doors).some(function (D) { return D.id === o.door && (q[1] === q[3] ? Math.abs(q[1] - D.z) < 1.5 : Math.abs(q[0] - D.x) < 1.5); })) return;
      line(q[0], q[1], q[2], q[3], si, o.y, o.h, o, ds, o.kind); });
    F.push({ x0: o.x0, x1: o.x1, z0: o.z0, z1: o.z1, y: o.y, kind: o.kind, storey: si });
  });
  /* the core: its floor round the well (whole on the ground storey), its four walls opened onto the halls */
  P.storeys.forEach(function (S) {
    var wx = VC.intWell(P)[0], wz = VC.intWell(P)[1];
    if (S.i === 0) F.push({ x0: c.x - h, x1: c.x + h, z0: c.z - h, z1: c.z + h, y: S.y, kind: 'core', storey: S.i });
    else [[c.x - h, c.x + h, c.z - h, c.z - wz], [c.x - h, c.x + h, c.z + wz, c.z + h], [c.x - h, c.x - wx, c.z - wz, c.z + wz], [c.x + wx, c.x + h, c.z - wz, c.z + wz]].forEach(function (q) { F.push({ x0: q[0], x1: q[1], z0: q[2], z1: q[3], y: S.y, kind: 'core', storey: S.i }); });
    var self = open(S.i).filter(function (o) { return o.x0 === c.x - h && o.z0 === c.z - h; })[0];
    [[c.x - h, c.z - h, c.x + h, c.z - h], [c.x - h, c.z + h, c.x + h, c.z + h], [c.x - h, c.z - h, c.x - h, c.z + h], [c.x + h, c.z - h, c.x + h, c.z + h]].forEach(function (q) { line(q[0], q[1], q[2], q[3], S.i, S.y, S.h, self, [], 'core'); });
  });
  /* the ceilings: every floor but the landings, at its storey's height (the core's with the well cut out, as its floor) */
  P.ceilings = F.filter(function (f) { return f.kind !== 'landing' && f.kind !== 'keep'; }).map(function (f) { var S = P.storeys[f.storey] || P.storeys[0]; return { x0: f.x0, x1: f.x1, z0: f.z0, z1: f.z1, y: S.y + S.h, storey: f.storey }; });
  /* the shell: each tier's outer wall, inside its stone, round the storeys (the walker's, VC.intWalk), opened at the tunnels */
  P.shell = [];
  P.tiers.forEach(function (tr) {
    var M = P.M, R = tr.R, o = T.wall;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (n) {
      var alongX = n[0] === 0, L0 = (alongX ? M.z : M.x) + (alongX ? n[1] : n[0]) * (R + o / 2), iv = [[-R - o, R + o]];
      if (tr.k === P.tiers[0].k) P.tunnels.forEach(function (tu) { var cross = alongX ? (tu.z0 < L0 && tu.z1 > L0) : (tu.x0 < L0 && tu.x1 > L0); if (!cross) return;
        var lo = (alongX ? tu.x0 - M.x : tu.z0 - M.z), hi = (alongX ? tu.x1 - M.x : tu.z1 - M.z); iv = [].concat.apply([], iv.map(function (s) { return lo >= s[1] || hi <= s[0] ? [s] : [[s[0], lo], [hi, s[1]]].filter(function (q) { return q[1] - q[0] > 0.05; }); })); });
      iv.forEach(function (s) { P.shell.push(alongX ? [M.x + s[0], M.x + s[1], L0 - o / 2, L0 + o / 2, tr.y0 + 0.3, tr.y1 - 0.3] : [L0 - o / 2, L0 + o / 2, M.z + s[0], M.z + s[1], tr.y0 + 0.3, tr.y1 - 0.3]); });
    });
  });
};

/* ---------------------------------------------------------------- the Ancestry's catacombs
   Cut into the solid core at the apron's level, from its dock's door: a cross of galleries (the axis one from the
   door) and a grid of side galleries every TUNE.interiors.cata.every m, ossuary niches along every gallery wall, tomb
   chambers off the side galleries. One storey. */
VC.intPlanCatacombs = function (M) {
  var T = TUNE.interiors, C = T.cata, door = CANT.doors.filter(function (d) { return d.canton === M.n; })[0];
  /* the core's narrowest slice within the catacombs' height bounds them */
  var y = M.apron.y, sl = M.stack.filter(function (s) { return s.sh === 'box' && s.y1 > y + 0.5 && s.y0 < y + C.h && s.hb < M.apron.ro - 1; });
  if (!sl.length) return null;
  var R = sl.reduce(function (m, s) { return Math.min(m, s.hb); }, Infinity) - T.wall, axis = door ? door.n : [1, 0], perp = [-axis[1], axis[0]], c = [M.x, M.z];
  var P = { n: M.n, M: M, axis: axis, perp: perp, rooms: [], halls: [], tunnels: [], flights: [], boxes: [], floors: [], storeys: [{ i: 0, y: y, h: C.h, R: R }], catacombs: true };
  var g = C.galleryW / 2, every = C.every;
  /* the galleries: the main one along the axis on the door's line (door to far wall), the cross one through the middle,
     side galleries parallel to the main one */
  var along = door ? CANT.cl((door.x - M.x) * perp[0] + (door.z - M.z) * perp[1], -R + 10, R - 10) : 0, m0 = [c[0] + perp[0] * along, c[1] + perp[1] * along];
  P.halls.push(Object.assign(VC.intRect(m0, axis, -R + 2, R - 1, g, y, C.h, 'gallery'), { storey: 0 }));
  P.halls.push(Object.assign(VC.intRect(c, perp, -R + 2, R - 1, g, y, C.h, 'gallery'), { storey: 0 }));
  for (var s = every; s < 2 * R; s += every) [-1, 1].forEach(function (sg) {
    var off = along + s * sg; if (Math.abs(off) > R - every / 2) return;
    var o = [c[0] + perp[0] * off, c[1] + perp[1] * off];
    P.halls.push(Object.assign(VC.intRect(o, axis, -R + 4, R - 3, g, y, C.h, 'gallery'), { storey: 0 }));
    /* tomb chambers off it, between it and the next */
    for (var a = -R + 8, i = 0; a < R - 14; a += C.tomb[0] + 3, i++) {
      if (VC.intU(M.n, s, i, 7) > C.tombShare) continue;
      var side = sg, room = VC.intSideRect(o, axis, side, a, a + C.tomb[0], g, g + C.tomb[1], y, C.h);
      if (Math.abs((room.x0 + room.x1) / 2 - c[0]) * Math.abs(perp[0]) + Math.abs((room.z0 + room.z1) / 2 - c[1]) * Math.abs(perp[1]) > R - 2) continue;
      var dm = a + C.tomb[0] / 2, dp = [o[0] + axis[0] * dm + -axis[1] * side * g, o[1] + axis[1] * dm + axis[0] * side * g];
      room.door = { x: dp[0], z: dp[1], w: 1.6, n: [axis[1] * side, -axis[0] * side] };
      room.kind = 'tomb'; room.id = M.n + '.t' + s + '.' + sg + '.' + i; room.storey = 0; room.tier = 0;
      P.rooms.push(room);
    }
  });
  /* the galleries themselves are catacomb rooms for the placer: niches along their walls */
  P.halls.forEach(function (h, i) { P.rooms.push(Object.assign({}, h, { kind: 'catacomb', id: M.n + '.g' + i, storey: 0, gallery: true, door: null })); });
  /* the way in: from the door, on into the main gallery (overlapping it) */
  if (door) P.tunnels.push(Object.assign({ y: y, h: C.h, kind: 'tunnel', door: door.id }, VC.intSeg([door.x - axis[0] * (CANT.sq(M, door.x, door.z) - R + 6), door.z - axis[1] * (CANT.sq(M, door.x, door.z) - R + 6)], [door.x + axis[0] * 0.6, door.z + axis[1] * 0.6], C.galleryW / 2)));
  P.core = { x: c[0], z: c[1], half: 0 };
  VC.intWallsCatacombs(P);
  return P;
};
VC.intWallsCatacombs = function (P) {
  var F = P.floors;
  P.halls.concat(P.tunnels).forEach(function (h) { F.push({ x0: h.x0, x1: h.x1, z0: h.z0, z1: h.z1, y: h.y, kind: 'gallery', storey: 0 }); });
  P.rooms.forEach(function (r) { if (!r.gallery) F.push({ x0: r.x0, x1: r.x1, z0: r.z0, z1: r.z1, y: r.y, kind: 'room', storey: 0, room: r.id }); });
  P.ceilings = F.map(function (f) { return { x0: f.x0, x1: f.x1, z0: f.z0, z1: f.z1, y: f.y + TUNE.interiors.cata.h, storey: 0 }; });
  /* the walls: the union of floors' outlines, minus where they meet (a 2D grid of 1 m cells, its boundary as walls) */
  var c = 1, x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  F.forEach(function (f) { x0 = Math.min(x0, f.x0); x1 = Math.max(x1, f.x1); z0 = Math.min(z0, f.z0); z1 = Math.max(z1, f.z1); });
  var nx = Math.ceil((x1 - x0) / c) + 2, nz = Math.ceil((z1 - z0) / c) + 2, G = new Uint8Array(nx * nz);
  F.forEach(function (f) { for (var i = Math.floor((f.x0 - x0) / c) + 1; i < Math.ceil((f.x1 - x0) / c) + 1; i++) for (var j = Math.floor((f.z0 - z0) / c) + 1; j < Math.ceil((f.z1 - z0) / c) + 1; j++) G[j * nx + i] = 1; });
  var y = P.storeys[0].y, h = TUNE.interiors.cata.h, t = TUNE.interiors.wallT;
  for (var j = 0; j < nz; j++) { var run = -1; for (var i = 0; i <= nx; i++) { var e = i < nx && j > 0 && G[j * nx + i] !== G[(j - 1) * nx + i]; if (e && run < 0) run = i; if (!e && run >= 0) { var zz = z0 + (j - 1) * c; P.boxes.push({ x0: x0 + (run - 1) * c, x1: x0 + (i - 1) * c, z0: zz - t / 2, z1: zz + t / 2, y0: y, y1: y + h, kind: 'wall', storey: 0 }); run = -1; } } }
  /* (the walls along x are done; along z below, then the door's mouth is opened) */
  for (var i2 = 0; i2 < nx; i2++) { var run2 = -1; for (var j2 = 0; j2 <= nz; j2++) { var e2 = j2 < nz && i2 > 0 && G[j2 * nx + i2] !== G[j2 * nx + i2 - 1]; if (e2 && run2 < 0) run2 = j2; if (!e2 && run2 >= 0) { var xx = x0 + (i2 - 1) * c; P.boxes.push({ x0: xx - t / 2, x1: xx + t / 2, z0: z0 + (run2 - 1) * c, z1: z0 + (j2 - 1) * c, y0: y, y1: y + h, kind: 'wall', storey: 0 }); run2 = -1; } } }
  /* the tunnel's mouth at its door stays open */
  CANT.doors.filter(function (D) { return D.canton === P.n; }).forEach(function (D) {
    var g = TUNE.interiors.cata.galleryW / 2 + 0.6, m = [D.x - D.n[1] * g, D.x + D.n[1] * g, D.z - D.n[0] * g, D.z + D.n[0] * g], mx0 = Math.min(m[0], m[1]) - Math.abs(D.n[0]) * 2.5, mx1 = Math.max(m[0], m[1]) + Math.abs(D.n[0]) * 2.5, mz0 = Math.min(m[2], m[3]) - Math.abs(D.n[1]) * 2.5, mz1 = Math.max(m[2], m[3]) + Math.abs(D.n[1]) * 2.5;
    P.boxes = P.boxes.filter(function (b) { return !(b.x0 < mx1 && b.x1 > mx0 && b.z0 < mz1 && b.z1 > mz0); });
  });
};

/* ---------------------------------------------------------------- what a deck layout keeps clear of: the stair house */
VC.intKeep = function (n) { return (VC.INT.keep && VC.INT.keep[n]) || []; };

/* ---------------------------------------------------------------- the walk registry: floors, flights, walls */
VC.intWalk = function (W) {
  W = W || KWALK; var n = 0;
  Object.keys(VC.INT.cantons).forEach(function (cn) {
    var P = VC.INT.cantons[cn], tag = 'interior:' + cn;
    P.floors.forEach(function (f) { W.floor({ rect: [f.x0, f.x1, f.z0, f.z1], y: f.y, name: cn + ' ' + f.kind, tag: tag }); n++; });
    P.flights.forEach(function (f) { W.strip({ a: [f.a[0], f.a[1], f.y0], b: [f.b[0], f.b[1], f.y1], w: f.w, name: cn + ' core stair', tag: tag }); });
    P.boxes.forEach(function (b) { if (b.kind === 'wall') W.block([b.x0, b.x1, b.z0, b.z1, b.y0 + 0.05, b.y1], tag); });
    (P.shell || []).forEach(function (s) { W.block(s, tag + ':shell'); });
    if (P.house) {
      /* the stair house's walls on the deck: three sides, the door side open */
      var H = P.house, t = TUNE.interiors.wallT, x0 = H.x - H.hw, x1 = H.x + H.hw, z0 = H.z - H.hd, z1 = H.z + H.hd;
      [[x0, x1, z0 - t / 2, z0 + t / 2, [0, -1]], [x0, x1, z1 - t / 2, z1 + t / 2, [0, 1]], [x0 - t / 2, x0 + t / 2, z0, z1, [-1, 0]], [x1 - t / 2, x1 + t / 2, z0, z1, [1, 0]]].forEach(function (w) {
        if (w[4][0] === H.n[0] && w[4][1] === H.n[1]) return;
        W.block([w[0], w[1], w[2], w[3], H.y + 0.05, H.y + H.h], tag);
      });
    }
  });
  return n;
};

/* ---------------------------------------------------------------- the entrances, outside: a portal at each bottom
   door (Voth's plinth-door idiom: a porch block stood out from the battered tier face, a dark opening in it, pilasters,
   a lintel) and the stair house on the top deck over the core (walls on three sides, its door where the last flight
   arrives, a flat roof with a parapet and a lantern) */
VC.intEntrances = function () {
  var T = TUNE.interiors, B = VOTH;
  return VC.capture('entrances', 2, function () {
    Object.keys(VC.INT.cantons).forEach(function (cn) {
      var P = VC.INT.cantons[cn], M = P.M, tone = M.tone;
      (P.catacombs ? CANT.doors.filter(function (d) { return d.canton === cn; }) : P.doorsOut).forEach(function (D) {
        var n = D.n, ry = Math.atan2(n[0], n[1]), w = T.tunnelW, at = function (o, s) { return [D.x + n[0] * o + -n[1] * s, D.z + n[1] * o + n[0] * s]; };
        var pc = at(0.4, 0); B.BOX(pc[0], D.y - 0.2, pc[1], w + 3.4, T.tunnelH + 2.2, 2.4, ry, B.shade(tone, 0.04));          /* the porch */
        var oc = at(1.62, 0); B.BOX(oc[0], D.y, oc[1], w - 0.2, T.tunnelH - 0.2, 0.12, ry, B.shade(tone, -0.62));            /* the opening */
        [-1, 1].forEach(function (s) { var pp = at(1.75, s * (w / 2 + 0.6)); B.BOX(pp[0], D.y - 0.2, pp[1], 0.9, T.tunnelH + 1.4, 0.5, ry, B.shade(tone, 0.12)); });
        var lc = at(1.8, 0); B.BOX(lc[0], D.y + T.tunnelH + 0.9, lc[1], w + 2.8, 0.9, 0.7, ry, B.shade(tone, 0.16));          /* the lintel */
        var sc = at(2.6, 0); B.BOX(sc[0], D.y - 0.15, sc[1], w + 1.6, 0.3, 1.6, ry, B.shade(tone, -0.08));                  /* the sill */
      });
      var H = P.house; if (!H || H.keep) return;
      var t = 0.9, x0 = H.x - H.hw, x1 = H.x + H.hw, z0 = H.z - H.hd, z1 = H.z + H.hd, col = B.shade(tone, 0.06), y = H.y;
      [[x0, x1, z0, [0, -1]], [x0, x1, z1, [0, 1]], [z0, z1, x0, [-1, 0]], [z0, z1, x1, [1, 0]]].forEach(function (s) {
        var n = s[3], alongX = n[0] === 0, mid = (s[0] + s[1]) / 2, len = s[1] - s[0], door = n[0] === H.n[0] && n[1] === H.n[1];
        var put = function (a0, a1, h, yy, c) { var m = (a0 + a1) / 2; if (alongX) B.BOX(m, yy, s[2], a1 - a0, h, t, 0, c); else B.BOX(s[2], yy, m, t, h, a1 - a0, 0, c); };
        if (!door) put(s[0], s[1], H.h, y, col);
        else { put(s[0], mid - 2.4, H.h, y, col); put(mid + 2.4, s[1], H.h, y, col); put(mid - 2.4, mid + 2.4, H.h - 3.8, y + 3.8, B.shade(col, 0.1)); }
      });
      B.BOX(H.x, y + H.h, H.z, H.hw * 2 + 1.6, 0.6, H.hd * 2 + 1.6, 0, B.shade(tone, -0.1));                                /* the roof slab */
      [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (n) { if (n[0]) B.BOX(H.x + n[0] * (H.hw + 0.6), y + H.h + 0.6, H.z, 0.5, 0.9, H.hd * 2 + 1.6, 0, B.shade(tone, 0.1)); else B.BOX(H.x, y + H.h + 0.6, H.z + n[1] * (H.hd + 0.6), H.hw * 2 + 1.6, 0.9, 0.5, 0, B.shade(tone, 0.1)); });
      B.FR3(H.x, y + H.h + 0.6, H.z, 2.4, 3.2, 2.4, 0, B.shade(tone, 0.14));                                               /* the lantern */
      B.BOX(H.x, y - 0.02, H.z, (Math.abs(P.axis[0]) > 0.5 ? T.well[1] : T.well[0]) * 2, 0.06, (Math.abs(P.axis[0]) > 0.5 ? T.well[0] : T.well[1]) * 2, 0, 0x1c1814);   /* the well's mouth */
    });
  });
};
