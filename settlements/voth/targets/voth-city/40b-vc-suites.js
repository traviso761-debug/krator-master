/* ============================== 5h2. THE PALACE AND THE TEMPLE: THE STATE FLOORS ============================== */
/* [G data] The owner (2026-10-15), from the reference pictures: the Palace "uses a richly ornamented green-and-gold
   theme ... tapestries everywhere ... Internal Atria are common ... exits to the garden levels ... On entering through
   the main entrance, there is an exceptional foyer with a 3 story atrium and balconies; against the pillars of this
   atrium are statues of Tzintzun's ancestors. Doors off this chamber lead to guest chambers, servant quarters/kitchens,
   clerks' and bureaucrats' offices, and a 2-storey Hall of Judgment arranged as a courtroom ... Opposite the main
   entrance, across the foyer, is the entrance to a 2-storey ornate banquet hall with pillars, chandeliers and
   tapestries hung at a 45 degree angle ... Opposite the entrance to this long hall, in line still with the main
   entrance, is the entrance to a 3-storey octagonal throne room, forming a sort of interior dome ... with a giant
   octagonal jeweled chandelier resembling the sun-giant-Krator system hanging over a central octagonal dais where
   Tzintzun's throne lies. Behind the throne room ... Tzintzun's chambers, which span 2 floors and connect to the
   kitchen and servants + guard quarters; the kitchen also should connect to the banquet hall. The rest of the building
   contains various guard quarters, store rooms (esp on the lower levels near the canton dock), a personal
   dungeon/oubliette". The Temple: "ornamented but also austere, with recurring motifs of religious symbols and honored
   ancestors. Tapestries are everywhere. Atria and vaulted spaces are common with many recessed nooks for candles and
   shrines. the temple must have quarters for the priests and multiple high priests, prisoner quarter for
   slaves/sacrifices, guards and guard quarters, servants quarters, kitchen, and a wing of administrative offices ...
   The high priest's chambers are multi-roomed and make extensive use of ornamental screens."

   HOW. The canton's bridge tier (tier 1: its terrace is where every bridge lands, Voth's DECK) is the state floor. Its
   storeys are the suite's own (three tall ones), and in place of the generic arms it takes, in a frame along the suite's
   axis (u in, from the entrance face; v across):
   - BIG ROOMS along the axis, each a tall open space (one, two or three storeys), galleried on the storeys above
     (a railed ring the halls open onto), with doors between them where they touch (links);
   - two SERVICE HALLS parallel to the axis, lined with rooms from the suite's purposes on every storey (the generic
     hall-and-rooms idea), opened onto the big rooms by cross passages, and out onto the terrace gardens at their ends;
   - the CORE stair stands on one service hall (the hall runs through it, as the generic halls do), so every storey
     and every other tier is reached as before; the foyer adds grand flights up to its galleries;
   - EXITS: a tunnel through the tier wall from the entrance passage and from each hall's far end onto the terrace;
   - DECOR records (pillars, statues, daises, the octagon's diagonal walls, the corbelled dome, the chandeliers, the
     tapestries hung at 45 degrees) that the host draws (56-vc-interiors-host.js VC.intDecor).
   Everything else (the other tiers, the dungeon, the tunnels from the dock, the stair house) is the generic planner's
   (40-vc-interiors.js), with the suite's footprints kept clear on the tier above (the dome). Every choice is fixed by
   the geometry or a KRAND hash: no stream is drawn. */
VC.SUITES = {
  Palace: {
    tier: 1, storeys: 3, axis: [1, 0],                  /* in from the -x face: the Ancestry's bridge lands mid-face there */
    core: [-20, 43],                                    /* on the north service hall */
    entrance: { v: 0, w: 7 },
    halls: [
      { id: 'north', v: [40, 46], u: [-124, 124], storeys: [0, 1, 2], exit: true,
        purposes: [{ kitchen: 2, dormitory: 2, store: 2, office: 2, scriptorium: 1, guardroom: 1 }, { chamber: 3, office: 2, guest: 1, store: 1 }, { chamber: 3, guest: 2, store: 1 }] },
      { id: 'south', v: [-46, -40], u: [-124, 124], storeys: [0, 1, 2], exit: true,
        purposes: [{ guest: 3, office: 2, guardroom: 2, store: 1, dormitory: 1 }, { guest: 3, chamber: 2, office: 1 }, { chamber: 3, guest: 2, store: 1 }] }
    ],
    rooms: [
      { id: 'foyer', kind: 'foyer', u: [-132, -82], v: [-28, 28], storeys: 3, gallery: 3, pillars: [[-120, -16], [-108, -16], [-96, -16], [-120, 16], [-108, 16], [-96, 16]], statues: true, grandStairs: true, chandelier: 3.6, tapestries: true, carpet: true,
        frescos: [['u1', 'fresco_brothers'], ['u0', 'fresco_ascent']] },   /* the three brothers over the banquet door, met as one comes in; their ascent over the entrance */
      { id: 'banquet', kind: 'banquet', u: [-82, -2], v: [-18, 18], storeys: 2, gallery: 3, pillars: [[-70, -11], [-56, -11], [-42, -11], [-28, -11], [-14, -11], [-70, 11], [-56, 11], [-42, 11], [-28, 11], [-14, 11]], chandelier: 2.6, tilted: true, carpet: true },
      { id: 'throne', kind: 'throne', u: [-2, 62], v: [-32, 32], storeys: 3, gallery: 3, octagon: 14, dome: 12, dais: 'centre', sunChandelier: true },
      { id: 'apartment', kind: 'apartment', u: [62, 130], v: [-26, 26], storeys: 1, upper: 'chamber', innerStair: true, tapestries: true, chandelier: 2.0, carpet: true },
      { id: 'judgment', kind: 'judgment', u: [-126, -84], v: [46, 106], storeys: 2, gallery: 'long', court: true, tapestries: true, chandelier: 2.2, carpet: true }
    ],
    links: [['foyer', 'banquet', 6], ['banquet', 'throne', 6], ['throne', 'apartment', 4], ['north', 'judgment', 3], ['foyer', 'north', 4], ['foyer', 'south', 4], ['banquet', 'north', 3], ['banquet', 'south', 3], ['apartment', 'north', 3], ['apartment', 'south', 3]],
    keepAbove: ['throne']                               /* the dome rises through the tier above */
  },
  Temple: {
    tier: 1, storeys: 3, axis: [0, -1],                 /* in from the +z face: the front, where the terrace flights climb from the dock */
    core: [-20, 43],
    entrance: { v: 0, w: 6 },
    halls: [
      { id: 'north', v: [40, 46], u: [-114, 114], storeys: [0, 1, 2], exit: true,
        purposes: [{ chamber: 4, dormitory: 1, kitchen: 1, store: 1, library: 1 }, { highpriest: 2, chamber: 3, office: 1 }, { chamber: 4, dormitory: 1, store: 1 }] },
      { id: 'south', v: [-46, -40], u: [-114, 114], storeys: [0, 1, 2], exit: true,
        purposes: [{ cell: 4, guardroom: 2, office: 3, store: 1 }, { office: 4, scriptorium: 2, guardroom: 1 }, { chamber: 3, office: 2, store: 1 }] }
    ],
    rooms: [
      { id: 'atrium', kind: 'atrium', u: [-121, -71], v: [-30, 30], storeys: 3, gallery: 3, pillars: [[-110, -18], [-96, -18], [-82, -18], [-110, 18], [-96, 18], [-82, 18]], nooks: true, basin: true, chandelier: 3.0, tapestries: true,
        frescos: [['u1', 'fresco_brothers']] },   /* the three brothers over the sanctuary's door */
      { id: 'sanctuary', kind: 'sanctuary', u: [-71, 9], v: [-26, 26], storeys: 3, gallery: 2, dais: 'end', nooks: true, braziers: true, tapestries: true, chandelier: 2.4,
        frescos: [['u0', 'fresco_ascent']] },     /* their ascent over the way in, facing the altar */
      { id: 'audience', kind: 'highpriest', u: [9, 39], v: [-26, 26], storeys: 1, upper: 'study', screens: true, tapestries: true },
      { id: 'private', kind: 'chamber', u: [39, 63], v: [-26, 26], storeys: 1, upper: 'chamber', screens: true },
      { id: 'vestry', kind: 'vestry', u: [63, 121], v: [-24, 24], storeys: 1, upper: 'store', tapestries: true }
    ],
    links: [['atrium', 'sanctuary', 6], ['sanctuary', 'audience', 3], ['audience', 'private', 2.4], ['private', 'vestry', 2.4], ['atrium', 'north', 4], ['atrium', 'south', 4], ['sanctuary', 'north', 3], ['sanctuary', 'south', 3], ['vestry', 'north', 3], ['vestry', 'south', 3], ['audience', 'north', 2.4]],
    keepAbove: []
  }
};
VC.suiteOf = function (M) { return VC.SUITES[M.n] || null; };

/* the suite's storey: the big rooms, the halls and their rooms, the passages, the exits (all in P's records). Called by
   VC.intPlanTiered for each storey of the suite's tier in place of the generic arms. */
VC.suiteStorey = function (P, M, sp, S, s, si, allSt) {
  var T = TUNE.interiors, j = s.j, ax = sp.axis, pv = [-ax[1], ax[0]], cn = M.n, R = S.R;
  var pt = function (u, v) { return [M.x + ax[0] * u + pv[0] * v, M.z + ax[1] * u + pv[1] * v]; };
  var rect = function (u0, u1, v0, v1, y, h, kind) { var a = pt(u0, v0), b = pt(u1, v1); return { x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]), z0: Math.min(a[1], b[1]), z1: Math.max(a[1], b[1]), y: y, h: h, kind: kind }; };
  var tierObj = allSt[si].t, storeyAt = function (k) { var o = allSt.filter(function (q) { return q.t === tierObj && q.s.j === k; })[0]; return o ? o.s : null; };
  var tallH = function (n) { var top = storeyAt(j + n - 1); return top ? top.y + top.h - s.y : s.h; };
  P.suite = P.suite || { rooms: {}, doors: [], exits: [], decor: [], keep: [] };
  var SU = P.suite, keep = [];                           /* this storey's keep-outs for the halls' rooms: the big rooms and the core */
  keep.push({ x0: P.core.x - T.core, x1: P.core.x + T.core, z0: P.core.z - T.core, z1: P.core.z + T.core });
  /* the big rooms */
  sp.rooms.forEach(function (r) {
    var from = r.from || 0, n = r.storeys || 1, upper = r.upper && j === from + n ? r.upper : null;
    if (j === from) {
      var h = tallH(n), o = rect(r.u[0], r.u[1], r.v[0], r.v[1], s.y, h, 'suite');
      o.storey = si; o.tall = n > 1; o.great = true; o.suite = r.id; o.d = ax; o.h = h; P.halls.push(o);
      var room = Object.assign({}, o, { kind: r.kind, id: cn + '.' + r.id, open: true, great: true, tier: S.tier, side: 0, storey: si, door: null });
      P.rooms.push(room); SU.rooms[r.id] = { rect: o, room: room, spec: r, storey: si, y: s.y, h: h, storeys: n, stairGaps: {} };
      keep.push(o);
      if ((sp.keepAbove || []).indexOf(r.id) >= 0) SU.keep.push({ x0: o.x0, x1: o.x1, z0: o.z0, z1: o.z1, tier: sp.tier + 1 });
      if (r.grandStairs && n >= 2) VC.suiteGrandStairs(P, M, sp, r, SU.rooms[r.id], storeyAt, pt);
    } else if (j > from && j < from + n) {
      /* the gallery storeys: a railed ring the halls open onto (a 'long' gallery: along the two long walls only) */
      var B = SU.rooms[r.id]; if (!B) return;
      var o2 = Object.assign({}, B.rect, { y: s.y, h: s.h, storey: si, nowalls: true, nofloor: true, great: true, kind: 'gallery', suite: r.id });
      P.halls.push(o2); keep.push(o2);
      var g = T.atrium.gallery, hs = r.gallery === 'long', ring = [], inner;
      var u0 = r.u[0], u1 = r.u[1], v0 = r.v[0], v1 = r.v[1];
      if (r.octagon) { var c = r.octagon; ring.push([u0 + c, u1 - c, v0, v0 + g], [u0 + c, u1 - c, v1 - g, v1], [u0, u0 + g, v0 + c, v1 - c], [u1 - g, u1, v0 + c, v1 - c]); inner = [u0 + g, u1 - g, v0 + g, v1 - g]; }
      else { ring.push([u0, u1, v0, v0 + g], [u0, u1, v1 - g, v1]); if (!hs) ring.push([u0, u0 + g, v0 + g, v1 - g], [u1 - g, u1, v0 + g, v1 - g]); inner = [hs ? u0 : u0 + g, hs ? u1 : u1 - g, v0 + g, v1 - g]; }
      /* the strips, less the grand stairs' runs under this storey's gallery (the flights arrive on what is left) */
      var gaps = B.stairGaps[j - from] || [];
      ring.forEach(function (q) { var f = rect(q[0], q[1], q[2], q[3], s.y, 0, 'gallery'); CANT.rectMinus([f.x0, f.x1, f.z0, f.z1], gaps).forEach(function (p) { if (p[1] - p[0] > 0.2 && p[3] - p[2] > 0.2) P.floors.push({ x0: p[0], x1: p[1], z0: p[2], z1: p[3], y: s.y, kind: 'gallery', storey: si, noceil: true, suite: r.id }); }); });
      /* the railing round the void, with the same gaps */
      var ir = rect(inner[0], inner[1], inner[2], inner[3], 0, 0, 'x');
      VC.intRailsRect(P, ir, s.y, si, gaps);
      if (j === from + n - 1) { var c2 = rect(r.u[0], r.u[1], r.v[0], r.v[1], 0, 0, 'x'); (P.extraCeilings = P.extraCeilings || []).push({ x0: c2.x0, x1: c2.x1, z0: c2.z0, z1: c2.z1, y: s.y + s.h, storey: si, suite: r.id, dome: r.dome ? { u: r.u, v: r.v, c: r.octagon || 0 } : null }); }
    } else if (upper) {
      /* the upper floor of a two-floor suite (the ruler's chambers): a room of its own over the lower one, reached by the
         inner stair, whose well is cut out of this floor */
      var B2 = SU.rooms[r.id]; if (!B2) return;
      var o3 = rect(r.u[0], r.u[1], r.v[0], r.v[1], s.y, s.h, 'suite'); o3.storey = si; o3.great = true; o3.suite = r.id + '.up'; o3.d = ax; o3.upper = true; P.halls.push(o3);
      var room2 = Object.assign({}, o3, { kind: upper, id: cn + '.' + r.id + '.up', open: true, great: true, tier: S.tier, side: 0, storey: si, door: null });
      P.rooms.push(room2); keep.push(o3);
      if (r.innerStair) {
        var st = VC.suiteInnerStair(P, M, sp, r, B2, s, si, rect, pt); o3.nofloor = true; st.forEach(function (f) { P.floors.push(f); });
        /* the lower floor's ceiling has the well too */
        B2.rect.noceil = true; (P.extraCeilings = P.extraCeilings || []); st.forEach(function (f) { P.extraCeilings.push({ x0: f.x0, x1: f.x1, z0: f.z0, z1: f.z1, y: B2.y + B2.h, storey: B2.storey }); });
      }
    }
  });
  /* the service halls and their rooms, the cross passages to the big rooms, the exits */
  sp.halls.forEach(function (H, hi) {
    if (H.storeys.indexOf(j) < 0) return;
    var hv = [Math.min(H.v[0], H.v[1]), Math.max(H.v[0], H.v[1])], o = rect(H.u[0], H.u[1], hv[0], hv[1], s.y, s.h, 'hall');
    o.storey = si; o.arm = 10 + hi; o.d = ax; o.a0 = H.u[0]; o.a1 = H.u[1]; o.suite = H.id; P.halls.push(o);
    SU.rooms[H.id] = SU.rooms[H.id] || { rect: o, spec: H, hall: true };
    var side = hv[0] > 0 ? 1 : -1, purposes = H.purposes[Math.min(j, H.purposes.length - 1)];
    /* rooms along both sides, clear of the big rooms, the core and the passages (made first, so the rooms keep off them) */
    var passes = [];
    sp.links.forEach(function (L) {
      if (L[1] !== H.id) return;
      var A = sp.rooms.filter(function (r) { return r.id === L[0]; })[0]; if (!A) return;
      var Ar = SU.rooms[A.id]; if (!Ar || !(j >= (A.from || 0) && j < (A.from || 0) + (A.storeys || 1) + (A.upper ? 1 : 0))) return;
      /* a passage from the big room's side wall (v = its edge on the hall's side) to the hall, mid-way along their overlap */
      var ua = Math.max(A.u[0], H.u[0]), ub = Math.min(A.u[1], H.u[1]); if (ub - ua < 8) return;
      var um = (ua + ub) / 2, vEdge = side > 0 ? A.v[1] : A.v[0], vHall = side > 0 ? hv[0] : hv[1], w = L[2] || 3;
      var pr = rect(um - w / 2, um + w / 2, Math.min(vEdge - 0.3 * side, vHall + 0.3 * side), Math.max(vEdge - 0.3 * side, vHall + 0.3 * side), s.y, Math.min(s.h, T.tunnelH + 1), 'passage');
      pr.storey = si; pr.tier = S.tier; pr.suite = A.id + '-' + H.id; P.tunnels.push(pr); passes.push(pr); keep.push(pr);
      /* the door in the big room's wall where the passage meets it */
      var dp = pt(um, vEdge); SU.doors.push({ x: dp[0], z: dp[1], w: w, storey: si });
    });
    [-1, 1].forEach(function (sd) {
      var lat0 = 0, a0 = H.u[0] + 2, idx = 0, end = H.u[1] - 2, vIn = sd > 0 ? hv[1] : hv[0];
      while (a0 + T.room.w[0] <= end) {
        var w = T.room.w[0] + (T.room.w[1] - T.room.w[0]) * VC.intU(cn, 300 + si * 8 + hi * 2 + (sd > 0), idx, 1);
        if (a0 + w > end) w = end - a0;
        if (w < T.room.w[0] - 0.01) break;
        var dep = T.room.d, room = rect(a0, a0 + w, sd > 0 ? vIn : vIn - dep, sd > 0 ? vIn + dep : vIn, s.y, s.h, 'room');
        var inside = Math.max(Math.abs(room.x0 - M.x), Math.abs(room.x1 - M.x), Math.abs(room.z0 - M.z), Math.abs(room.z1 - M.z)) <= R;
        var free = inside && !keep.some(function (k) { return VC.intOverlap(room, k, 0.2); }) && !passes.some(function (k) { return VC.intOverlap(room, k, 0.2); });
        if (free) {
          room.storey = si; room.tier = S.tier; room.arm = 10 + hi; room.side = sd;
          var dm = a0 + w / 2, dp2 = pt(dm, vIn); room.door = { x: dp2[0], z: dp2[1], w: T.doorW, n: [-pv[0] * sd, -pv[1] * sd] };
          room.kind = VC.intPick(purposes, VC.intU(cn, 300 + si * 8 + hi * 2 + (sd > 0), idx, 4));
          room.id = cn + '.' + H.id + '.s' + si + (sd > 0 ? 'r' : 'l') + idx;
          P.rooms.push(room);
        }
        a0 += w + T.room.gap; idx++;
      }
    });
    /* the hall's far end: an exit through the tier wall onto the terrace (the ground storey of the tier) */
    if (H.exit && j === 0) VC.suiteExit(P, M, sp, S, s, si, pt, rect, H.u[1], (hv[0] + hv[1]) / 2, T.tunnelW, ax);
  });
  /* the entrance: a tunnel from the entrance face to the first big room, on the ground storey */
  if (j === 0 && sp.entrance) {
    var first = sp.rooms[0], E = sp.entrance;
    VC.suiteExit(P, M, sp, S, s, si, pt, rect, first.u[0], E.v, E.w, [-ax[0], -ax[1]], true);
  }
  /* the doors between the big rooms where they touch (the links among rooms) */
  if (j === 0) sp.links.forEach(function (L) {
    var A = sp.rooms.filter(function (r) { return r.id === L[0]; })[0], B = sp.rooms.filter(function (r) { return r.id === L[1]; })[0]; if (!A || !B) return;
    var w = L[2] || 3, dp;
    if (Math.abs(A.u[1] - B.u[0]) < 0.05) dp = pt(A.u[1], (Math.max(A.v[0], B.v[0]) + Math.min(A.v[1], B.v[1])) / 2);
    else if (Math.abs(B.u[1] - A.u[0]) < 0.05) dp = pt(A.u[0], (Math.max(A.v[0], B.v[0]) + Math.min(A.v[1], B.v[1])) / 2);
    else return;
    SU.doors.push({ x: dp[0], z: dp[1], w: w, storey: si });
    /* the same door on the upper floors that both rooms have (the ruler's chambers' upper floor onto the throne gallery: no) */
  });
  P.suiteDoors = SU.doors;
};
/* an exit: a tunnel from a point on the suite's plan through the tier's wall onto the terrace, and a portal outside */
VC.suiteExit = function (P, M, sp, S, s, si, pt, rect, uEdge, v, w, outDir, isEntrance) {
  var T = TUNE.interiors, ax = sp.axis, tier = P.tiers.filter(function (t) { return t.k === S.tier; })[0], Rw = tier.R + T.wall + 0.6;
  /* along the axis out to the wall's outer face (the terrace) */
  var out = outDir, uOut = out[0] * ax[0] + out[1] * ax[1] > 0 ? Rw : -Rw;
  var a = pt(uEdge - (uOut > 0 ? 0.3 : -0.3), v), b = pt(uOut, v);
  var tun = Object.assign({ y: s.y, h: Math.min(s.h, T.tunnelH + 1.5), kind: 'tunnel', storey: si, tier: S.tier, door: 'exit_' + P.n + '_' + P.suite.exits.length, exit: true }, VC.intSeg(a, b, w / 2));
  P.tunnels.push(tun);
  var D = { id: tun.door, canton: P.n, kind: 'terrace', x: b[0], z: b[1], y: s.y, n: out.slice(), w: w, h: tun.h, storey: si, entrance: !!isEntrance };
  P.suite.exits.push(D);
  return D;
};
/* a railing round an inner rectangle (world axis-aligned), less the gaps (where a grand stair runs) */
VC.intRailsRect = function (P, r, y, si, gaps) {
  var A = TUNE.interiors.atrium, t = A.railT, h = A.rail, push = function (x0, x1, z0, z1) { P.boxes.push({ x0: x0, x1: x1, z0: z0, z1: z1, y0: y, y1: y + h, kind: 'rail', storey: si }); };
  gaps = gaps || [];
  [[r.x0, r.x1, r.z0 - t / 2, r.z0 + t / 2], [r.x0, r.x1, r.z1 - t / 2, r.z1 + t / 2], [r.x0 - t / 2, r.x0 + t / 2, r.z0, r.z1], [r.x1 - t / 2, r.x1 + t / 2, r.z0, r.z1]].forEach(function (b) {
    var pieces = CANT.rectMinus([b[0], b[1], b[2], b[3]], gaps.map(function (g) { return [g[0], g[1], g[2], g[3]]; }));
    pieces.forEach(function (q) { if (q[1] - q[0] > 0.1 && q[3] - q[2] > 0.1) push(q[0], q[1], q[2], q[3]); });
  });
};
/* the grand stairs of the foyer, laid with its first storey: along each side wall from the entrance end up to the
   first gallery, then across the far wall from one side to the other up to the second (two flights to a landing
   mid-wall). B.stairGaps[k] are the runs under the k-th gallery, cut out of its strips and railing (all but the last
   0.8 m of a flight, which lands on the strip) */
VC.suiteGrandStairs = function (P, M, sp, r, B, storeyAt, pt) {
  var T = TUNE.interiors, g = T.atrium.gallery, w = 3.2, y = B.y, s1 = storeyAt(1), s2 = storeyAt(2), L0 = Math.min(28, (r.u[1] - r.u[0]) * 0.6), cn = M.n;
  if (!s1) return;
  var y1 = s1.y, gaps1 = [], gaps2 = [];
  [-1, 1].forEach(function (sd) {
    var v = sd > 0 ? r.v[1] - w / 2 - 0.3 : r.v[0] + w / 2 + 0.3, a = pt(r.u[0] + 2, v), b = pt(r.u[0] + 2 + L0, v);
    P.flights.push({ canton: cn, kind: 'grand', a: a, b: b, y0: y, y1: y1, w: w, base: y, storey: B.storey });
    var bb = [b[0] - (b[0] - a[0]) / L0 * 0.8, b[1] - (b[1] - a[1]) / L0 * 0.8];   /* the gap stops 0.8 m short of the top */
    gaps1.push([Math.min(a[0], bb[0]) - 0.6, Math.max(a[0], bb[0]) + 0.6, Math.min(a[1], bb[1]) - 0.6, Math.max(a[1], bb[1]) + 0.6]);
  });
  if (s2) {
    var y2 = s2.y, uf = r.u[1] - g / 2 - 0.3, mid = (r.v[0] + r.v[1]) / 2, half = (y2 - y1) / 2;
    var a1 = pt(uf, r.v[0] + g + 1), m1 = pt(uf, mid), b1 = pt(uf, r.v[1] - g - 1);
    P.flights.push({ canton: cn, kind: 'grand', a: a1, b: m1, y0: y1, y1: y1 + half, w: w, base: y1, storey: B.storey + 1 });
    P.flights.push({ canton: cn, kind: 'grand', a: m1, b: b1, y0: y1 + half, y1: y2, w: w, base: y1 + half, storey: B.storey + 1 });
    var Lf = Math.hypot(b1[0] - a1[0], b1[1] - a1[1]), bb1 = [b1[0] - (b1[0] - a1[0]) / Lf * 0.8, b1[1] - (b1[1] - a1[1]) / Lf * 0.8];
    gaps2.push([Math.min(a1[0], bb1[0]) - 0.6, Math.max(a1[0], bb1[0]) + 0.6, Math.min(a1[1], bb1[1]) - 0.6, Math.max(a1[1], bb1[1]) + 0.6]);
  }
  B.stairGaps = { 1: gaps1, 2: gaps2 };
};
/* the ruler's inner stair: one straight flight along the apartment's wall from its floor to the floor above, the
   well cut out of the upper floor; returns the upper floor's pieces */
VC.suiteInnerStair = function (P, M, sp, r, B, s, si, rect, pt) {
  var ax = sp.axis, lo = B.y, rise = s.y - lo, run = Math.min(14, (r.u[1] - r.u[0]) * 0.4), w = 2.4;
  var u0 = r.u[0] + 3, u1 = u0 + run, v = r.v[1] - 1.5 - w / 2;
  var a = pt(u0, v), b = pt(u1, v);
  P.flights.push({ canton: P.n, kind: 'inner', a: a, b: b, y0: lo, y1: s.y, w: w, base: lo, storey: B.storey });
  var well = rect(u0 + 1.2, u1 + 0.8, v - w / 2 - 0.3, v + w / 2 + 0.3, 0, 0, 'x'), whole = rect(r.u[0], r.u[1], r.v[0], r.v[1], 0, 0, 'x');
  return CANT.rectMinus([whole.x0, whole.x1, whole.z0, whole.z1], [[well.x0, well.x1, well.z0, well.z1]]).map(function (q) { return { x0: q[0], x1: q[1], z0: q[2], z1: q[3], y: s.y, kind: 'suite', storey: si, suite: r.id + '.up' }; });
};
/* the grand stairs of the foyer (two flights up each side wall to the first gallery, and on to the second on the far
   wall) and the decor records of every big room: laid after the storeys exist, so the galleries' heights are known */
VC.suiteFinish = function (P, M, sp) {
  var SU = P.suite; if (!SU) return;
  var T = TUNE.interiors, ax = sp.axis, pv = [-ax[1], ax[0]], cn = M.n;
  var pt = function (u, v) { return [M.x + ax[0] * u + pv[0] * v, M.z + ax[1] * u + pv[1] * v]; };
  sp.rooms.forEach(function (r) {
    var B = SU.rooms[r.id]; if (!B) return;
    var y = B.y, S = P.storeys[B.storey], storeyY = function (k) { var q = P.storeys[B.storey + k]; return q ? q.y : null; };
    var dec = function (o) { o.storey = o.storey == null ? B.storey : o.storey; o.room = r.id; SU.decor.push(o); };
    /* pillars: full height of the room, square, on a plinth; the ancestors' statues at their feet, facing the axis */
    (r.pillars || []).forEach(function (p, i) {
      var c = pt(p[0], p[1]);
      P.boxes.push({ x0: c[0] - 1.1, x1: c[0] + 1.1, z0: c[1] - 1.1, z1: c[1] + 1.1, y0: y, y1: y + B.h, kind: 'pillar', storey: B.storey });
      dec({ kind: 'pillar', x: c[0], z: c[1], y: y, h: B.h, w: 2.2 });
      if (r.statues) { var f = pt(p[0], p[1] - Math.sign(p[1]) * 2.1); dec({ kind: 'statue', x: f[0], z: f[1], y: y, ry: Math.atan2(-pv[0] * Math.sign(p[1]), -pv[1] * Math.sign(p[1])), i: i }); }
    });
    /* the octagon: the four corner walls at 45 degrees (the walker's blocks are stepped), the corbelled dome over it */
    if (r.octagon) {
      var c = r.octagon, cs = [[r.u[0], r.v[0], 1, 1], [r.u[1], r.v[0], -1, 1], [r.u[1], r.v[1], -1, -1], [r.u[0], r.v[1], 1, -1]];
      cs.forEach(function (k) {
        var a = pt(k[0] + k[2] * c, k[1]), b = pt(k[0], k[1] + k[3] * c), mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        dec({ kind: 'diag', x: mx, z: mz, y: y, h: B.h, len: len, d: [(b[0] - a[0]) / len, (b[1] - a[1]) / len], t: T.wallT });
        /* the walker's stepped blocks along it */
        for (var i = 0; i < 6; i++) { var t0 = (i + 0.5) / 6, px = a[0] + (b[0] - a[0]) * t0, pz = a[1] + (b[1] - a[1]) * t0, hw = len / 12 + 0.3; P.boxes.push({ x0: px - hw, x1: px + hw, z0: pz - hw, z1: pz + hw, y0: y, y1: y + B.h, kind: 'diagblock', storey: B.storey }); }
      });
      var cc = pt((r.u[0] + r.u[1]) / 2, (r.v[0] + r.v[1]) / 2);
      if (r.dome) dec({ kind: 'dome', x: cc[0], z: cc[1], y: y + B.h, r: Math.min(r.u[1] - r.u[0], r.v[1] - r.v[0]) / 2, h: r.dome });
      if (r.sunChandelier) dec({ kind: 'sun', x: cc[0], z: cc[1], y: y + B.h - 1, r: 5.5 });
      if (r.dais === 'centre') dec({ kind: 'dais', x: cc[0], z: cc[1], y: y, r: 7, octagon: true, throne: true, ry: Math.atan2(-ax[0], -ax[1]) });
    }
    if (r.dais === 'end') { var e = pt(r.u[1] - 7, (r.v[0] + r.v[1]) / 2); dec({ kind: 'dais', x: e[0], z: e[1], y: y, r: 6, altar: true, ry: Math.atan2(-ax[0], -ax[1]) }); }
    if (r.court) {
      /* the court: the ruler's dais against the far (+v) wall, two plaintiffs' daises against the near wall, the
         spectators' galleries are the long walls' (gallery: 'long') */
      var vm = (r.v[0] + r.v[1]) / 2, um = (r.u[0] + r.u[1]) / 2, far = pt(um, r.v[1] - 5), near1 = pt(r.u[0] + 9, r.v[0] + 4), near2 = pt(r.u[1] - 9, r.v[0] + 4);
      dec({ kind: 'dais', x: far[0], z: far[1], y: y, w: 14, d: 7, throne: true, ry: Math.atan2(-pv[0], -pv[1]) });
      dec({ kind: 'dais', x: near1[0], z: near1[1], y: y, w: 8, d: 5, ry: Math.atan2(pv[0], pv[1]) });
      dec({ kind: 'dais', x: near2[0], z: near2[1], y: y, w: 8, d: 5, ry: Math.atan2(pv[0], pv[1]) });
    }
    if (r.basin) { var bc = pt((r.u[0] + r.u[1]) / 2, (r.v[0] + r.v[1]) / 2); dec({ kind: 'basin', x: bc[0], z: bc[1], y: y, r: 4 }); }
    if (r.braziers) [[r.u[1] - 14, r.v[0] + 5], [r.u[1] - 14, r.v[1] - 5], [r.u[0] + 10, r.v[0] + 5], [r.u[0] + 10, r.v[1] - 5]].forEach(function (p) { var q = pt(p[0], p[1]); dec({ kind: 'brazier', x: q[0], z: q[1], y: y }); });
    if (r.chandelier) {
      var cy = y + B.h - 0.2, cc2 = pt((r.u[0] + r.u[1]) / 2, (r.v[0] + r.v[1]) / 2), n = Math.max(1, Math.round((r.u[1] - r.u[0]) / 24));
      for (var i = 0; i < n; i++) { var q2 = pt(r.u[0] + (r.u[1] - r.u[0]) * (i + 0.5) / n, (r.v[0] + r.v[1]) / 2); dec({ kind: 'chandelier', x: q2[0], z: q2[1], y: cy, r: r.chandelier }); }
    }
    if (r.tilted) dec({ kind: 'tilted', u: r.u, v: r.v, y: y, h: B.h, every: 12 });
    /* carpets down the middle along the axis, each of the sheet's own shape (3 x 2) */
    if (r.carpet) { var cw = Math.min(8, (r.v[1] - r.v[0]) * 0.32), cl = cw * 1.5, nC = Math.max(1, Math.floor((r.u[1] - r.u[0] - 6) / (cl + 1.5))), vm = (r.v[0] + r.v[1]) / 2;
      for (var ci = 0; ci < nC; ci++) { var cu = r.u[0] + 3 + (ci + 0.5) * (r.u[1] - r.u[0] - 6) / nC, cp = pt(cu, vm); if (r.octagon && Math.abs(cu - (r.u[0] + r.u[1]) / 2) < 9) continue; dec({ kind: 'carpet', x: cp[0], z: cp[1], y: y, d: ax.slice(), len: cl, w: cw }); } }
    /* frescoes on the end walls, over the doors, above the tapestries: [wall ('u0' or 'u1'), sheet] */
    (r.frescos || []).forEach(function (f) {
      var s = Math.min(10, (r.v[1] - r.v[0]) * 0.45, B.h - 11); if (s < 4) return;
      var u = f[0] === 'u1' ? r.u[1] - 0.12 : r.u[0] + 0.12, nIn = f[0] === 'u1' ? [-ax[0], -ax[1]] : ax.slice(), c = pt(u, (r.v[0] + r.v[1]) / 2);
      dec({ kind: 'fresco', x: c[0], z: c[1], y: y + 9.5 + s / 2, s: s, d: pv.slice(), n: nIn, sheet: f[1] });
    });
    if (r.tapestries) dec({ kind: 'tapestries', u: r.u, v: r.v, y: y, h: Math.min(B.h, S.h), every: TUNE.interiors.decor.tapEvery });
    if (r.screens) dec({ kind: 'screens', u: r.u, v: r.v, y: y, h: Math.min(B.h, S.h) });
    if (r.nooks) dec({ kind: 'nooks', u: r.u, v: r.v, y: y, every: TUNE.interiors.decor.nookEvery });
  });
};
