/* ============================== 5f. POWER AND LIGHT ============================== */
/* [G data] Who has electric light and what lights the streets (owner, 2026-10-09):
   - Voth's power houses (voth_generator: the steam turbine hall and the fumarole vent house) stand in the industry
     district, placed on purpose at step 9 before the main-street lots fill it;
   - electric light: the industry district, the guilds (guild halls, the Guild canton), the clan compounds and wealthy
     houses within TUNE.power.reach of a power house, and the Palace and Temple interiors. Little else;
   - everywhere else torch and lantern light: a fancy lantern post in the wealthy streets and on the cantons, a plain
     lantern post elsewhere, torches in the alleys and poor quarters.
   Street lights are socketed as each street is laid (SL.addWay below records way.lamps, sides alternating), not
   scattered afterwards. A socket's kind is settled once the city stands (VC.lighting), since wealth and the district
   round it are known only then; a socket a later street crossed (a junction), a building took, or the water or a
   highway reached is dropped. Each lamp is a record (PLAN.lamps: x, y, z, ry, kind, step, heads) drawn from Voth's
   primitives; the host lights its heads. */

/* ---------------------------------------------------------------- sockets, laid with each street */
VC._addWay = SL.addWay;
SL.addWay = function (cls, pts, step, opt) {
  var w = VC._addWay(cls, pts, step, opt);
  VC.socketWay(w);
  return w;
};
VC.socketWay = function (w) {
  var T = TUNE.light, E = T.every[w.cls];
  w.lamps = [];
  if (!E || w.F.len < E) return;
  var n = Math.floor(w.F.len / E), s0 = (w.F.len - (n - 1) * E) / 2;
  for (var i = 0; i < n; i++) w.lamps.push(VC.socketAt(w, s0 + i * E, i % 2 ? 1 : -1));
};
/* a socket on the curb at arc length s; the arm (the model's local x) reaches back over the street */
VC.socketAt = function (w, s, side) {
  var p = w.F.at(s), nr = V.mul(V.perp(w.F.tan(s, 3)), side), q = V.add(p, V.mul(nr, w.w / 2 + TUNE.light.curb));
  return { s: s, side: side, x: q[0], z: q[1], ry: Math.atan2(nr[1], -nr[0]) };
};

/* ---------------------------------------------------------------- step 9: the power houses */
VC._pass9 = SL.pass9;
SL.pass9 = function () { var msg = VC.powerHouses(9); VC._pass9(); SL.note(9, msg); };
VC.powerHouses = function (step) {
  var P = TUNE.power, D = VC.districts('industry'), made = [], rs = SL.stream(9009), cands = [];
  VC.powerLots = made;
  if (!D.length) return 'power houses: no industry district';
  var dist = function (q) { return D.reduce(function (m, d) { return Math.min(m, inPoly(q, d.poly) ? 0 : polyEdgeDist(q, d.poly)); }, 1e9); };
  PLAN.ways.forEach(function (w) {
    if ((w.cls !== 'avenue' && w.cls !== 'main') || w.layby) return;
    for (var s = 12; s < w.F.len - 12; s += 6) [-1, 1].forEach(function (side) {
      var q = V.add(w.F.at(s), V.mul(V.perp(w.F.tan(s, 4)), side * (w.w / 2 + 16))), dd = dist(q);
      if (dd <= P.look) cands.push({ w: w, s: s, side: side, q: q, sc: dd + rs.rr(0, 20) });
    });
  });
  cands.sort(function (a, b) { return a.sc - b.sc; });
  P.houses.forEach(function (kv) {
    var it = SL.dims(kv[0], kv[1]); if (!it) return;
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      if (made.some(function (L) { return Math.hypot(L.x - c.q[0], L.z - c.q[1]) < P.gap; })) continue;
      var L = SL.tryLot(c.w, c.side, c.s, it, step, 'industrial', { wealth: 0.3, padded: true });
      if (!L.fail) { L.role = 'power'; L.power = true; SL.R.stampPoly(obbCorners(L.lot), OCC.HARD, L.id); made.push(L); break; }   /* hard, as a civic lot: no later street knocks it out */
    }
  });
  return made.length + ' of ' + P.houses.length + ' power houses in the industry district' + (made.length ? ' (' + made.map(function (L) { return L.key + ' v' + L.v; }).join(', ') + ')' : '');
};

/* ---------------------------------------------------------------- the lamp posts, from Voth's primitives */
/* each returns its lamp heads [[x, y, z], ...], where the host puts the light */
VC.LAMP_COL = { basalt: 0x3b3833, bronze: 0x8a6a3a, iron: 0x2f3034, wood: 0x5a4430, foot: 0x6f685c, glass: 0xf3d28a, cool: 0xe4ebf2, grey: 0x7a7670 };
VC.lampPost = function (l) {
  var B = VOTH, C = VC.LAMP_COL, x = l.x, y = l.y, z = l.z, ry = l.ry, at = function (lx, lz) { return B.loc(x, z, lx, lz, ry); }, p, q;
  if (l.kind === 'torch') {
    B.CYL(x, y, z, 0.09, 2.8, 0, C.wood, 'wood');
    B.CYL(x, y + 2.8, z, 0.2, 0.32, 0, C.iron, 'metal');
    return [[x, y + 3.25, z]];
  }
  if (l.kind === 'lantern') {
    B.BOX(x, y, z, 0.5, 0.3, 0.5, ry, C.foot);
    B.BOX(x, y + 0.3, z, 0.18, 3.4, 0.18, ry, C.wood, 'wood');
    p = at(0.45, 0); B.BOX(p[0], y + 3.4, p[1], 0.95, 0.1, 0.1, ry, C.iron, 'metal');
    p = at(0.85, 0); B.BOX(p[0], y + 2.95, p[1], 0.32, 0.42, 0.32, ry, C.glass, 'cloth');
    B.BOX(p[0], y + 3.37, p[1], 0.4, 0.07, 0.4, ry, C.iron, 'metal');
    return [[p[0], y + 3.16, p[1]]];
  }
  if (l.kind === 'fancy') {
    /* a basalt plinth, a bronze-banded column, a carved capital, a crossbar with a lantern hung at each end, a finial */
    B.FR8(x, y, z, 0.95, 0.75, 0.95, ry, C.basalt);
    B.BOX(x, y + 0.75, z, 0.62, 0.12, 0.62, ry, C.bronze, 'metal');
    B.CYL(x, y + 0.87, z, 0.14, 3.9, 0, C.basalt);
    [1.6, 3.1].forEach(function (h) { B.CYL(x, y + h, z, 0.19, 0.12, 0, C.bronze, 'metal'); });
    B.BOX(x, y + 4.77, z, 0.4, 0.22, 0.4, ry, C.basalt);
    B.BOX(x, y + 4.9, z, 2.05, 0.1, 0.12, ry, C.bronze, 'metal');
    B.CONE(x, y + 4.99, z, 0.13, 0.55, 0, C.bronze, 'metal');
    var heads = [];
    [-1, 1].forEach(function (s) {
      q = at(0.92 * s, 0);
      B.BOX(q[0], y + 4.62, q[1], 0.04, 0.28, 0.04, ry, C.iron, 'metal');
      B.CYL(q[0], y + 4.12, q[1], 0.17, 0.46, 0, C.glass, 'cloth');
      B.CONE(q[0], y + 4.56, q[1], 0.23, 0.2, 0, C.bronze, 'metal');
      B.CYL(q[0], y + 4.02, q[1], 0.2, 0.1, 0, C.bronze, 'metal');
      heads.push([q[0], y + 4.35, q[1]]);
    });
    return heads;
  }
  /* electric: a grey cast foot, an iron mast, an arm out over the street, a shaded bulb */
  B.BOX(x, y, z, 0.6, 0.4, 0.6, ry, C.grey);
  B.BOX(x, y + 0.4, z, 0.16, 5.9, 0.16, ry, C.iron, 'metal');
  p = at(0.7, 0); B.BOX(p[0], y + 6.15, p[1], 1.45, 0.1, 0.1, ry, C.iron, 'metal');
  p = at(1.35, 0); B.BOX(p[0], y + 5.72, p[1], 0.2, 0.2, 0.2, ry, C.cool, 'cloth');
  B.CONE(p[0], y + 5.9, p[1], 0.36, 0.26, 0, C.iron, 'metal');
  return [[p[0], y + 5.82, p[1]]];
};

/* ---------------------------------------------------------------- after the steps: who is lit, and by what */
VC.lighting = function () {
  var T = TUNE.light, P = TUNE.power, R = SL.R, lamps = [], moved = 0, drop = { junction: 0, building: 0, water: 0, highway: 0 };
  var houses = PLAN.lots.filter(function (L) { return L.power && L.died == null; });
  var powered = function (x, z) { return houses.some(function (h) { return Math.hypot(h.x - x, h.z - z) < P.reach; }); };
  /* buildings */
  var tally = { electric: 0, lantern: 0, torch: 0 };
  PLAN.lots.forEach(function (L) {
    if (L.died != null) return;
    var role = L.deck ? 'canton' : VC.roleAt([L.x, L.z]), k;
    if (L.power || role === 'industry' || /guild/.test(L.key || '') || L.deck === 'Guild' ||
        ((L.cls === 'clan' || L.cls === 'rich' || L.cls === 'manor') && powered(L.x, L.z))) k = 'electric';
    else if (L.deck || L.cls === 'rich' || L.cls === 'manor' || L.cls === 'civic' || L.cls === 'landmark' || L.cls === 'clan' || L.wealth >= T.fancy) k = 'lantern';
    else k = (L.cls === 'farm' || L.cls === 'poor' || role === 'suburb') ? 'torch' : 'lantern';
    L.light = k; tally[k]++;
  });
  /* the cantons Voth builds whole: their light is the canton's, not a lot's */
  PLAN.cantonLight = { Palace: 'electric (interior)', Temple: 'electric (interior)', Guild: 'electric' };
  /* the street sockets */
  var highways = PLAN.ways.filter(function (w) { return w.cls === 'highway'; });
  var other = function (x, z, id) {
    var J = T.junction, pts = [[0, 0], [J, 0], [-J, 0], [0, J], [0, -J]];
    for (var i = 0; i < pts.length; i++) { var k = R.idx(x + pts[i][0], z + pts[i][1]); if (k >= 0 && (R.occ[k] === OCC.STREET || R.occ[k] === OCC.ALLEY) && R.own[k] !== id) return true; }
    return false;
  };
  PLAN.ways.forEach(function (w) {
    if (!w.lamps || w.layby) return;
    w.lamps.forEach(function (q0) {
      /* a socket a later street crossed or a building took slides along its street to the nearest clear spot */
      var q = null, why = null;
      for (var t = 0; t < T.slide.length && !q; t++) {
        var s = q0.s + T.slide[t]; if (s < 2 || s > w.F.len - 2) continue;
        var c = t ? VC.socketAt(w, s, q0.side) : q0;
        if (baseH(c.x, c.z) < 0.6) why = why || 'water';
        else if (other(c.x, c.z, w.id)) why = why || 'junction';
        else if (SL.clash(obb([c.x, c.z], [1, 0], 0.6, 0.6))) why = why || 'building';
        else if (highways.some(function (h) { return h.F.nearest([c.x, c.z]).d < h.w / 2 + 2; })) why = why || 'highway';
        else q = c;
      }
      if (!q) { drop[why]++; return; }
      if (q !== q0) moved++;
      var y = baseH(q.x, q.z);
      var role = VC.roleAt([q.x, q.z]), W = SL.wealth([q.x, q.z]), kind;
      if (role === 'industry') kind = 'electric';
      else if (w.cls === 'alley') kind = 'torch';
      else if (W >= T.fancy) kind = 'fancy';
      else if (W < T.torch || role === 'suburb') kind = 'torch';
      else kind = 'lantern';
      lamps.push({ x: q.x, y: y, z: q.z, ry: q.ry, kind: kind, step: w.born, way: w.id });
    });
  });
  /* the canton decks: fancy posts round the usable square, clear of what stands on it */
  var decks = 0;
  Object.keys(VC.decks || {}).forEach(function (n) {
    var dk = VC.decks[n], h = dk.use - T.deckInset; if (h <= 4) return;
    var m = Math.max(1, Math.round(2 * h / T.deckEvery));
    for (var e = 0; e < 4; e++) for (var i = 0; i < m; i++) {
      var t = -h + 2 * h * i / m, lx = [t, h, -t, -h][e], lz = [-h, t, h, -t][e], x = dk.c[0] + lx, z = dk.c[1] + lz, o = obb([x, z], [1, 0], 0.7, 0.7);
      if (VC.anyHit(o, dk.placed, 0.8) || SL.clash(o)) continue;
      lamps.push({ x: x, y: dk.y, z: z, ry: e % 2 ? Math.PI / 2 : 0, kind: 'fancy', step: 2, deck: n }); decks++;
    }
  });
  /* each lamp's evening: its on and off hours, drawn in its kind's windows */
  var rh = SL.stream(9201);
  lamps.forEach(function (l) { var H = T.hours[l.kind]; l.on = rh.rr(H[0][0], H[0][1]); l.off = rh.rr(H[1][0], H[1][1]); });
  /* draw them, one capture per step, so the slider shows each street's lamps with the street */
  var steps = {};
  lamps.forEach(function (l) { (steps[l.step] = steps[l.step] || []).push(l); });
  Object.keys(steps).forEach(function (st) { VC.capture('lamps' + st, +st, function () { steps[st].forEach(function (l) { l.heads = VC.lampPost(l); }); }); });
  PLAN.lamps = lamps;
  var by = {}; lamps.forEach(function (l) { by[l.kind] = (by[l.kind] || 0) + 1; });
  PLAN.light = { buildings: tally, lamps: by, dropped: drop, powerHouses: houses.length };
  SL.note(SL.LAST, 'light: ' + houses.length + ' power houses; buildings ' + tally.electric + ' electric, ' + tally.lantern + ' lantern, ' + tally.torch + ' torch; ' +
    lamps.length + ' street lamps (' + Object.keys(by).map(function (k) { return by[k] + ' ' + k; }).join(', ') + '; ' + decks + ' on the canton decks); ' + moved + ' sockets slid clear of a junction or building, dropped: ' +
    drop.junction + ' at junctions, ' + drop.building + ' in buildings, ' + drop.water + ' in water, ' + drop.highway + ' on highways; Palace and Temple interiors and the Guild canton electric');
};
