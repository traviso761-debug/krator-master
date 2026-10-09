/* ============================== 1b. THE CANTONS: WALKABLE LEVELS, BRIDGES, CAUSEWAYS, STAIRS ============================== */
/* [G data] The cantons as places a person stands on, read off the captured models themselves (the city's own capture of
   Voth's builders, voth-city-captured.data.js), and the records that join them up:
   - each canton's walkable LEVELS: the paved top of every cornice (the apron round the plinth, each terrace, the top
     deck), with the half-width of its outer edge (ro) and of the tier wall rising from it (ri, 0 on the top deck);
     the Ancestry spiral's ramp, face by face, off its own walkway slabs;
   - the BRIDGES (owner, 2026-10-09: "bridges would stretch from one canton span to the next, with the endpoints for the
     bridge walk surface being at the level of the upper canton deck"): each of Voth's SPANS lands on a walkable level at
     both ends, at the level's own edge, never higher or lower; the pair of levels, the lateral offset and the arch are
     chosen so the deck stays walkable (TUNE grade), clears what stands on the cantons and the Ancestry waterfalls, and
     its piers stand in the water or on a terrace, never in a tier;
   - the CAUSEWAYS' canton ends: a mole stops at the apron's edge with a flight up onto it; a bridge causeway lands on
     the level nearest its deck;
   - the STAIRS (owner: "make sure all cantons have an entrance on the top level and on the bottom to enable someone to
     walk from a ferry to the top surface"): a flight from each ferry pier and each mole up onto the apron, and on every
     tiered canton a chain of flights from the apron up the terraces to the top deck, on the face its ferry comes to.
     They replace Voth's broad sea stairs, which the capture holds where they ran before the city moved the bridges:
     buried in the tiers, only their top steps showed (the owner's "entrances buried in the geometry");
   - the AUDIT: every bridge's grade, clearances and what it had to cut, every flight's clashes.
   Builders draw these records (VIEW.bridges, VIEW.causeways, CANT.draw); KWALK holds them for the walker; KTAGS names
   them. Nothing here draws or touches the page. x east, z south, metres; y up. */
var CANT = { list: [], by: {}, spans: [], ends: [], flights: [], doors: [], keep: [], cuts: {}, audit: { spans: [], causeways: [], flights: [], removed: {} } };
/* the numbers (no TUNE on the site page: they live here) */
CANT.T = {
  gmax: 0.11,
  reachIn: 30,           /* how far past the level's square a causeway's end may run to meet its masonry */            /* the steepest a bridge deck may run (1 in 9) */
  arch: 8,               /* the most a bridge rises above its chord at mid-span */
  land: 7,               /* how far a bridge's deck runs onto the level it lands on */
  ring: 9,               /* a terrace narrower than this (edge to wall) takes no bridge */
  minY: 12,              /* nor does a level this low (the apron at the waterline) */
  deckT: 3.0,            /* deck thickness under the walking surface */
  clear: 2.0,            /* clearance under the deck over a canton */
  head: 3.4,             /* headroom over the deck */
  w: [12, 15],           /* bridge widths */
  pierEvery: 105,        /* one pier per this much open water */
  rise: 0.32, tread: 0.62, /* a step */
  flightW: 7,            /* a terrace flight's width (less where its band is narrower) */
  dockW: 5,              /* a pier's or a mole's flight */
  apronSide: 0.7         /* how far a mole's or a pier's flight may run in under the apron's cornice before it must climb */
};
CANT.mix = function (a, b, t) { return a + (b - a) * t; };
CANT.cl = function (v, a, b) { return v < a ? a : v > b ? b : v; };
/* KRAND-seeded numbers for a record: a hash of (world, which, index, salt) */
CANT.u = function (a, b, salt) { return KRAND.unit(KRAND.hash(1702, a | 0, b | 0, salt | 0)); };

/* ---------------------------------------------------------------- reading the captured cantons */
CANT.read = function () {
  var D = window.VOTH_CITY_CAPTURE;
  CANT.list = []; CANT.by = {};
  if (!D) return;
  VOTH.CANTONS.forEach(function (c, i) {
    var key = 'voth_city_canton_' + c.n.toLowerCase(), v = D.entries[key] && D.entries[key][0];
    if (!v) return;
    var pl = null; v.r.forEach(function (q) { if (q[0] !== 9 && (!pl || q[5] * q[7] > pl[5] * pl[7])) pl = q; });
    var bed = Math.min(-6, VOTH.terrainH(c.x, c.z));
    var M = { n: c.n, i: i, c: c, x: c.x, z: c.z, r: c.r, tone: c.tone, bed: bed, ox: c.x - pl[2], oz: c.z - pl[4], v: v, spiral: !!c.turns };
    /* the centred square stack: the tiers (fr8) and the cornices and slabs (box) square on the canton */
    var stack = [];
    v.r.forEach(function (q, k) {
      if (q[0] === 9 || Math.abs(q[2] - pl[2]) > 3 || Math.abs(q[4] - pl[4]) > 3 || Math.abs(q[5] - q[7]) > 0.5 || Math.abs(q[8] || 0) > 0.01 || q[5] < 40) return;
      var sh = D.shapes[q[0]]; if (sh !== 'fr8' && sh !== 'box') return;
      stack.push({ k: k, sh: sh, y0: q[3] + bed, y1: q[3] + q[6] + bed, hb: q[5] / 2, ht: q[5] / 2 * (sh === 'fr8' ? 0.86 : 1) });
    });
    stack.sort(function (a, b) { return a.y0 - b.y0 || b.hb - a.hb; });
    M.stack = stack; M.stackK = {}; stack.forEach(function (s) { M.stackK[s.k] = 1; });
    var tiers = stack.filter(function (s) { return s.sh === 'fr8'; }), boxes = stack.filter(function (s) { return s.sh === 'box'; });
    var lv = [];
    boxes.forEach(function (b) {
      var under = tiers.some(function (t) { return t.y1 >= b.y0 - 0.6 && t.y1 <= b.y1 + 0.6 && t.hb < b.hb + 0.5; });
      if (!under) return;
      var rise = tiers.filter(function (t) { return t.y0 >= b.y1 - 3.5 && t.y0 <= b.y1 + 0.6 && t.hb < b.hb - 0.5; }).sort(function (p, q) { return q.hb - p.hb; })[0];
      var ri = rise ? rise.hb * (1 - 0.14 * CANT.cl((b.y1 - rise.y0) / Math.max(0.1, rise.y1 - rise.y0), 0, 1)) : 0;
      lv.push({ y: b.y1, ro: b.hb, ri: ri, rise: rise || null });
    });
    lv.sort(function (a, b) { return a.y - b.y; });
    var L = [];
    lv.forEach(function (l) { var p = L[L.length - 1]; if (p && l.y - p.y < 4.5 && Math.abs(l.ri - p.ri) < 3) L[L.length - 1] = l; else L.push(l); });
    L.forEach(function (l, k) { l.k = k; l.top = !l.ri; });
    M.levels = L;
    /* the raised bands on a level (the Palace's and the Temple's face gardens and pavings: long flat slabs along a
       face, standing up to 3 m proud of the cornice): part of the surface a person walks on */
    M.bands = [];
    v.r.forEach(function (q, k) {
      if (q[0] !== 0 || M.stackK[k] || q[6] > 3.2 || Math.max(q[5], q[7]) < 60 || Math.min(q[5], q[7]) < 6) return;
      var y1 = q[3] + q[6] + bed, lev = L.filter(function (l) { return y1 >= l.y - 0.5 && y1 <= l.y + 3.2; })[0]; if (!lev) return;
      var ry = q[8] || 0, c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), hx = c * q[5] / 2 + s * q[7] / 2, hz = s * q[5] / 2 + c * q[7] / 2, x = q[2] + M.ox, z = q[4] + M.oz;
      M.bands.push({ k: k, x0: x - hx, x1: x + hx, z0: z - hz, z1: z + hz, y: y1, lev: lev.k });
    });
    M.bandK = {}; M.bands.forEach(function (b) { M.bandK[b.k] = 1; });
    M.apron = L[0] || null;
    M.top = L.filter(function (l) { return l.top; }).pop() || L[L.length - 1] || null;
    if (M.spiral) CANT.readSpiral(M, D, pl);
    CANT.list.push(M); CANT.by[c.n] = M;
  });
};
/* the Ancestry spiral: its walkway slabs (12 m wide, 1.6 thick, five to a face) give each face's chord and heights.
   A face runs from p0 (y0) to p1 (y1); its walkway is 12 m wide about the chord; n is the outward normal. */
CANT.readSpiral = function (M, D, pl) {
  var W = [];
  M.v.r.forEach(function (q, k) {
    if (q[0] !== 0 || Math.abs(q[5] - 12) > 0.01 || Math.abs(q[6] - 1.6) > 0.01) return;
    W.push({ k: k, x: q[2] + M.ox, z: q[4] + M.oz, top: q[3] + q[6] + M.bed, d: q[7], ry: q[8] || 0 });
  });
  W.sort(function (a, b) { return a.top - b.top; });
  var F = [];
  for (var i = 0; i + 4 < W.length; i += 5) {
    var a = W[i], b = W[i + 4], u = [Math.sin(a.ry), Math.cos(a.ry)], step = (W[i + 1].top - a.top);
    var p0 = [a.x - u[0] * a.d / 2, a.z - u[1] * a.d / 2], p1 = [b.x + u[0] * b.d / 2, b.z + u[1] * b.d / 2];
    var mid = [(p0[0] + p1[0]) / 2 - M.x, (p0[1] + p1[1]) / 2 - M.z], n = [u[1], -u[0]];
    if (n[0] * mid[0] + n[1] * mid[1] < 0) n = [-n[0], -n[1]];
    F.push({ f: F.length, p0: p0, p1: p1, y0: a.top - step / 2 - 0.6, y1: b.top + step / 2 - 0.6, u: u, n: n, len: Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), slabs: [a.k, W[i + 1].k, W[i + 2].k, W[i + 3].k, b.k] });
  }
  M.faces = F;
  M.walkW = 12;
};
/* a face's walking surface at t (0..1 along it): the smooth ramp the new steps follow */
CANT.faceY = function (F, t) { return CANT.mix(F.y0, F.y1, t) + 0.6; };
/* where (x, z) is on a face: t along, s outward from the chord */
CANT.onFace = function (F, x, z) { var dx = x - F.p0[0], dz = z - F.p0[1]; return { t: (dx * F.u[0] + dz * F.u[1]) / F.len, s: dx * F.n[0] + dz * F.n[1] }; };
/* the square distance from a canton's middle (its tiers are squares on the axes) */
CANT.sq = function (M, x, z) { return Math.max(Math.abs(x - M.x), Math.abs(z - M.z)); };
/* the top of the canton's solid stack at (x, z): the highest cornice, slab or tier top whose square holds it */
CANT.stackTop = function (M, x, z) {
  var r = CANT.sq(M, x, z), y = null;
  for (var i = 0; i < M.stack.length; i++) { var s = M.stack[i]; if (r <= (s.sh === 'fr8' ? s.ht : s.hb) && (y === null || s.y1 > y)) y = s.y1; }
  return y;
};
/* where a person stands at (x, z) on a canton (the stack, or the spiral's walkway), or null off it */
CANT.surface = function (M, x, z) {
  var y = CANT.stackTop(M, x, z);
  if (M.bands) M.bands.forEach(function (b) { if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1 && (y === null || b.y > y)) y = b.y; });
  if (M.faces) M.faces.forEach(function (F) { var o = CANT.onFace(F, x, z); if (o.t >= -0.02 && o.t <= 1.02 && Math.abs(o.s) <= M.walkW / 2 + 1.8) { var fy = CANT.faceY(F, CANT.cl(o.t, 0, 1)) + (o.s > M.walkW / 2 ? 1.2 : 0); if (y === null || fy > y) y = fy; } });
  return y;
};
/* the canton under (x, z), if any (its apron's square) */
CANT.at = function (x, z, pad) {
  for (var i = 0; i < CANT.list.length; i++) { var M = CANT.list[i]; if (M.apron && CANT.sq(M, x, z) <= M.apron.ro + (pad || 0)) return M; }
  return null;
};

/* ---------------------------------------------------------------- the captured pieces, in world space, by 8 m cell
   (for the clearance tests): every record but the stack, with its box and whether it is small enough to cut */
CANT.index = function () {
  var D = window.VOTH_CITY_CAPTURE, G = CANT.grid = new Map(), cs = 8;
  CANT.list.forEach(function (M) {
    /* the spiral's own masonry, slice by slice (its slices are as long as its walkway slabs): the fill, the bed and the
       slab are its surface; the parapet and its coping are rails */
    var slab = {}; (M.faces || []).forEach(function (F) { F.slabs.forEach(function (k) { slab[M.v.r[k][7].toFixed(2)] = 1; }); });
    M.v.r.forEach(function (q, k) {
      if (q[0] === 9 || M.stackK[k] || (M.bandK && M.bandK[k])) return;
      if (M.faces && q[0] === 0 && slab[q[7].toFixed(2)] && q[5] > 3.5) return;
      var sh = D.shapes[q[0]], round = sh === 'cyl' || sh === 'dome' || sh === 'blob' || sh === 'stk' || sh === 'cone';
      var ry = q[8] || 0, c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry));
      var hx = round ? q[5] : c * q[5] / 2 + s * q[7] / 2, hz = round ? q[7] : s * q[5] / 2 + c * q[7] / 2;
      var x = q[2] + M.ox, z = q[4] + M.oz, y0 = q[3] + M.bed, y1 = y0 + q[6];
      /* small: cut whole; rail: a long, low, thin wall (a parapet, a kerb), cut where crossed and the rest redrawn; big */
      var rail = !round && Math.min(q[5], q[7]) < 3.6 && Math.max(q[5], q[7]) >= 8 && q[6] < 3.6;
      var P = { M: M, k: k, q: q, x0: x - hx, x1: x + hx, z0: z - hz, z1: z + hz, y0: y0, y1: y1, small: Math.max(hx, hz) < 4 && q[6] < 9, rail: rail, fam: D.fams[q[1]], sh: sh };
      for (var i = Math.floor(P.x0 / cs); i <= Math.floor(P.x1 / cs); i++) for (var j = Math.floor(P.z0 / cs); j <= Math.floor(P.z1 / cs); j++) { var kk = i + ',' + j, a = G.get(kk); if (!a) G.set(kk, a = []); a.push(P); }
    });
  });
};
/* the captured pieces a box [x0, x1, z0, z1, y0, y1] touches */
CANT.hits = function (bx) {
  var G = CANT.grid, cs = 8, out = [], seen = new Set();
  for (var i = Math.floor(bx[0] / cs); i <= Math.floor(bx[1] / cs); i++) for (var j = Math.floor(bx[2] / cs); j <= Math.floor(bx[3] / cs); j++) {
    var a = G.get(i + ',' + j); if (!a) continue;
    for (var n = 0; n < a.length; n++) { var P = a[n]; if (seen.has(P)) continue; seen.add(P); if (P.x1 > bx[0] && P.x0 < bx[1] && P.z1 > bx[2] && P.z0 < bx[3] && P.y1 > bx[4] && P.y0 < bx[5]) out.push(P); }
  }
  return out;
};
/* a captured record to leave out of its canton when it is drawn */
CANT.cut = function (P, why) { var c = CANT.cuts[P.M.n] = CANT.cuts[P.M.n] || {}; if (!c[P.k]) { c[P.k] = why; CANT.audit.removed[why] = (CANT.audit.removed[why] || 0) + 1; } };
/* an oriented strip (a deck, a flight) as boxes every `step` m along it, for the clearance tests */
CANT.stripBoxes = function (a, b, w, yA, yB, below, above, step) {
  var L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / (step || 3))), out = [];
  for (var i = 0; i <= n; i++) {
    var t = i / n, x = CANT.mix(a[0], b[0], t), z = CANT.mix(a[1], b[1], t), y = CANT.mix(yA, yB, t), h = w / 2;
    out.push({ t: t, x: x, z: z, y: y, box: [x - h, x + h, z - h, z + h, y - below, y + above] });
  }
  return out;
};

/* ---------------------------------------------------------------- the keep-outs: what a bridge must never pass through
   (the Ancestry waterfalls, added by whoever plans them: {x, z, r, y0, y1, why}) */
CANT.keepHit = function (x, z, y0, y1, pad) {
  for (var i = 0; i < CANT.keep.length; i++) { var K = CANT.keep[i]; if (Math.hypot(x - K.x, z - K.z) < K.r + (pad || 0) && y1 > K.y0 && y0 < K.y1) return K; }
  return null;
};

/* ---------------------------------------------------------------- the bridges
   Each end is a point on the edge of a walkable level of its canton, on a face that looks toward the other canton
   (or on the outer edge of an Ancestry walkway face). Every pair of end points is a candidate straight bridge: it must
   meet both faces squarely enough (T.meet), keep its whole width off the corners, keep its landing on its terrace and
   stay under the grade. The cheap ones (grade, how far below the top deck a rim canton's end is, how far from Voth's
   DECK a monumental canton's end is, length) go on to the full test: the deck's underside over every canton it
   crosses, what stands in its corridor, the waterfalls. The best is kept; the rails and small pieces in its corridor
   are cut. */
CANT.T.meet = 0.62;        /* the least cos of the angle between a bridge and a face it lands on (about 52 degrees: a skew bridge) */
CANT.T.edgeStep = 6;       /* the spacing of the end points tried along an edge */
CANT.T.keepBest = 70;      /* how many cheap candidates go on to the full test */
CANT.edgePts = function (M, toward) {
  var T = CANT.T, out = [];
  if (M.faces) {
    M.faces.forEach(function (F) {
      if (F.n[0] * toward[0] + F.n[1] * toward[1] < 0.2) return;
      for (var ft = 0.12; ft <= 0.881; ft += 0.04) {
        var c = [CANT.mix(F.p0[0], F.p1[0], ft), CANT.mix(F.p0[1], F.p1[1], ft)];
        out.push({ M: M, face: F, ft: ft, p: [c[0] + F.n[0] * M.walkW / 2, c[1] + F.n[1] * M.walkW / 2], n: F.n, y: CANT.faceY(F, ft), lab: 'face ' + F.f });
      }
    });
    return out;
  }
  M.levels.forEach(function (l) {
    if (l.y < T.minY || !(l.top || l.ro - l.ri >= T.ring)) return;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (n) {
      if (n[0] * toward[0] + n[1] * toward[1] < 0.2) return;
      var tg = [-n[1], n[0]];
      for (var a = -l.ro + 8; a <= l.ro - 8; a += T.edgeStep) out.push({ M: M, lev: l, a: a, p: [M.x + n[0] * l.ro + tg[0] * a, M.z + n[1] * l.ro + tg[1] * a], n: n, y: l.y, lab: 'L' + l.k + (l.top ? ' top' : '') });
    });
  });
  return out;
};
/* an end, given the bridge's outward direction there: its landing's inner point, or null when the deck cannot land */
CANT.landAt = function (e, dir, w) {
  var T = CANT.T, M = e.M, dot = dir[0] * e.n[0] + dir[1] * e.n[1];
  if (dot < T.meet) return null;
  if (e.face) { var d = M.walkW / 2 / dot; return [e.p[0] - dir[0] * d, e.p[1] - dir[1] * d]; }
  if (Math.abs(e.a) + w / 2 / dot + 3 > e.lev.ro) return null;                     /* the deck's width must miss the corner */
  var pin = [e.p[0] - dir[0] * T.land, e.p[1] - dir[1] * T.land];
  if (e.lev.ri && CANT.sq(M, pin[0], pin[1]) < e.lev.ri + 1.5) return null;         /* the landing stays on its terrace */
  var sy = CANT.surface(M, pin[0], pin[1]); if (sy === null || sy < e.lev.y - 0.3 || sy > e.lev.y + 3.2) return null;
  e.yLand = sy;                                                                      /* a raised band makes the landing higher */
  return pin;
};
/* the cheap part of a candidate's cost: what its ends are, how steep, how long */
CANT.endCost = function (e) {
  var M = e.M;
  if (M.c.kind === 'mono') return Math.abs(e.y - VOTH.DECK) * 0.8;                   /* Voth's bridges ride at DECK; the Palace's arrivals are built for it */
  if (M.spiral) return 0;
  return (M.top.y - e.y) * 2.5;                                                       /* the owner: land on the top deck */
};
/* the deck's walking height at t (0 at A's end) */
CANT.deckY = function (S, t) { return CANT.mix(S.ya, S.yb, t) + S.arch * Math.sin(Math.PI * t); };
/* the full test of one candidate: everything the deck would pass through */
CANT.testSpan = function (S) {
  var T = CANT.T, w = S.w, big = [], small = [], under = 0, keep = null, all = [];
  var seg = [[S.la, [S.ax, S.az], S.ya, S.A], [[S.ax, S.az], [S.bx, S.bz], null, null], [[S.bx, S.bz], S.lb, S.yb, S.B]];
  seg.forEach(function (sg, si) {
    CANT.stripBoxes(sg[0], sg[1], w + 1, 0, 0, T.deckT, T.head, 3).forEach(function (b) {
      var y = si === 1 ? CANT.deckY(S, b.t) : sg[2];
      /* a landing rests on its level: only what stands above that level is in its way */
      b.box[4] = si === 1 ? y - T.deckT : y - 0.3; b.box[5] = y + T.head; all.push(b);
      if (si === 1) {
        /* over any canton: the deck's underside clears its surface (but where it leaves its own two edges) */
        var M = CANT.at(b.x, b.z, 0), sy = M && CANT.surface(M, b.x, b.z), nearEnd = (M === S.A && b.t < 0.02) || (M === S.B && b.t > 0.98);
        if (sy !== null && sy !== undefined && !nearEnd && sy > y - T.deckT - T.clear) under += sy - (y - T.deckT - T.clear);
      } else { var sy2 = CANT.surface(sg[3], b.x, b.z); if (sy2 !== null && sy2 > y + 0.6) under += sy2 - y; }
      CANT.hits(b.box).forEach(function (P) { if (P.small || P.rail) { if (small.indexOf(P) < 0) small.push(P); } else if (big.indexOf(P) < 0) big.push(P); });
      var K = CANT.keepHit(b.x, b.z, b.box[4], b.box[5], w / 2); if (K) keep = K;
    });
  });
  S.big = big; S.small = small; S.boxes = all; S.under = under; S.keep = keep;
  S.cost = S.cheap + under * 30 + big.length * 400 + small.length * 0.3 + (keep ? 5000 : 0);
  return S;
};
CANT.planSpans = function () {
  var T = CANT.T; CANT.spans = []; CANT.audit.spans = [];
  VOTH.SPANS.forEach(function (sp, si) {
    var A = CANT.by[VOTH.CANTONS[sp.a].n], B = CANT.by[VOTH.CANTONS[sp.b].n]; if (!A || !B) return;
    var dx = B.x - A.x, dz = B.z - A.z, L0 = Math.hypot(dx, dz), u = [dx / L0, dz / L0];
    var w = Math.round(CANT.mix(T.w[0], T.w[1], CANT.u(si, sp.a * 16 + sp.b, 1)) * 2) / 2;
    var EA = CANT.edgePts(A, u), EB = CANT.edgePts(B, [-u[0], -u[1]]), cand = [];
    EA.forEach(function (ea) { EB.forEach(function (eb) {
      var ddx = eb.p[0] - ea.p[0], ddz = eb.p[1] - ea.p[1], L = Math.hypot(ddx, ddz); if (L < 20) return;
      var dir = [ddx / L, ddz / L], g = Math.abs(eb.y - ea.y) / L; if (g > T.gmax) return;
      var la = CANT.landAt(ea, dir, w); if (!la) return;
      var lb = CANT.landAt(eb, [-dir[0], -dir[1]], w); if (!lb) return;
      var meet = (dir[0] * ea.n[0] + dir[1] * ea.n[1]) + (-dir[0] * eb.n[0] - dir[1] * eb.n[1]);
      var ya = ea.face ? ea.y : ea.yLand, yb = eb.face ? eb.y : eb.yLand; if (Math.abs(yb - ya) / L > T.gmax) return;
      cand.push({ A: A, B: B, ea: ea, eb: eb, ax: ea.p[0], az: ea.p[1], bx: eb.p[0], bz: eb.p[1], ya: ya, yb: yb, la: la, lb: lb, L: L, w: w, grade: g, ry: Math.atan2(dir[0], dir[1]),
        arch: CANT.cl((T.gmax * 0.75 * L - Math.abs(yb - ya)) / Math.PI * 0.5, 0, T.arch),
        cheap: g * 40 + CANT.endCost(ea) + CANT.endCost(eb) + (2 - meet) * 25 + L * 0.02 });
    }); });
    cand.sort(function (p, q) { return p.cheap - q.cheap; });
    /* the cheapest first; past T.keepBest, only until one is found that clears everything */
    var best = null, clean = false;
    for (var ci = 0; ci < cand.length && ci < 600; ci++) {
      if (ci >= T.keepBest && clean) break;
      var S = CANT.testSpan(cand[ci]); if (!best || S.cost < best.cost) best = S;
      if (!S.big.length && !S.keep && S.under < 0.5) clean = true;
    }
    var rec = { id: 'span_' + si, i: si, a: A.n, b: B.n, ok: !!best, tried: cand.length };
    if (best) {
      Object.assign(rec, { ax: best.ax, az: best.az, bx: best.bx, bz: best.bz, ya: best.ya, yb: best.yb, arch: best.arch, w: w, la: best.la, lb: best.lb, L: best.L, grade: best.grade, ry: best.ry,
        faceA: best.ea.face ? best.ea.face.f : null, faceB: best.eb.face ? best.eb.face.f : null, levA: best.ea.lev ? best.ea.lev.k : null, levB: best.eb.lev ? best.eb.lev.k : null });
      CANT.clearCorridor(best.small, best.boxes, 'bridge corridor');
      rec.piers = CANT.spanPiers(rec, A, B);
      CANT.spans.push(rec);
    }
    CANT.audit.spans.push({ id: rec.id, a: A.n, b: B.n, ok: !!best, tried: cand.length, ya: best && +best.ya.toFixed(1), yb: best && +best.yb.toFixed(1), grade: best && +best.grade.toFixed(3),
      arch: best && +best.arch.toFixed(1), len: best && Math.round(best.L), cut: best ? best.small.length : 0, under: best ? +best.under.toFixed(2) : 0, keep: best && best.keep ? best.keep.why : null,
      big: best ? best.big.map(function (P) { return P.fam + ' ' + P.sh + ' ' + P.q[5].toFixed(1) + 'x' + P.q[7].toFixed(1) + 'x' + P.q[6].toFixed(1) + ' ry ' + (P.q[8] || 0).toFixed(2) + ' y ' + P.y0.toFixed(1) + ' at ' + ((P.x0 + P.x1) / 2 - P.M.x).toFixed(0) + ',' + ((P.z0 + P.z1) / 2 - P.M.z).toFixed(0); }) : [],
      levels: best && [best.ea.lab, best.eb.lab], piers: rec.piers ? rec.piers.length : 0 });
  });
};
/* the piers under a bridge: in the open water between the two aprons, one per T.pierEvery, and one on each canton's
   lowest terrace the deck crosses when the deck overhangs it far (never on a tier's slope) */
CANT.spanPiers = function (S, A, B) {
  var T = CANT.T, out = [], L = S.L, dir = [(S.bx - S.ax) / L, (S.bz - S.az) / L];
  var at = function (t) { return [S.ax + dir[0] * L * t, S.az + dir[1] * L * t]; };
  var wet = [];
  for (var k = 0; k <= 200; k++) { var t = k / 200, p = at(t); if (!CANT.at(p[0], p[1], 6)) wet.push(t); }
  if (wet.length) {
    var t0 = wet[0], t1 = wet[wet.length - 1], len = (t1 - t0) * L, np = len < 50 ? (len > 26 ? 1 : 0) : Math.max(1, Math.round(len / T.pierEvery));
    for (var m = 1; m <= np; m++) { var tt = t0 + (t1 - t0) * m / (np + 1), p = at(tt); out.push({ x: p[0], z: p[1], t: tt, y0: Math.min(VOTH.terrainH(p[0], p[1]), -1), y1: CANT.deckY(S, tt) - T.deckT, wet: true }); }
    /* each side's overhang: from the end to the open water; long ones get a pier on the apron */
    [[A, 0, t0], [B, 1, t1]].forEach(function (e) {
      var M = e[0], run = Math.abs(e[2] - e[1]) * L; if (run < 26 || !M.apron || M.spiral) return;
      for (var q = 0; q < 40; q++) {
        var tq = e[1] === 0 ? e[2] - q / 200 : e[2] + q / 200, p = at(tq), r = CANT.sq(M, p[0], p[1]);
        if (r <= M.apron.ro - 2 && r >= M.apron.ri + 2) { out.push({ x: p[0], z: p[1], t: tq, y0: M.apron.y, y1: CANT.deckY(S, tq) - T.deckT, on: M.n }); break; }
      }
    });
  }
  return out;
};

/* ---------------------------------------------------------------- clearing a corridor through what stands on a canton
   small pieces go whole; a rail (a parapet, a kerb, a coping) is cut where the corridor crosses it and the rest is
   redrawn (CANT.prims) in its own colour */
CANT.prims = [];
/* a piece of a captured box record: the stretch [s0, s1] of its long axis (in its own frame, about its middle) */
CANT.railPiece = function (P, s0, s1) {
  var D = window.VOTH_CITY_CAPTURE, q = P.q, ry = q[8] || 0, alongX = q[5] >= q[7], cx = q[2] + P.M.ox, cz = q[4] + P.M.oz, m = (s0 + s1) / 2;
  var ax = alongX ? [Math.cos(ry), -Math.sin(ry)] : [Math.sin(ry), Math.cos(ry)];
  return ['box', cx + ax[0] * m, P.y0, cz + ax[1] * m, alongX ? s1 - s0 : q[5], q[6], alongX ? q[7] : s1 - s0, ry, D.cols[q[9]], P.fam];
};
CANT.clearCorridor = function (list, boxes, why) {
  list.forEach(function (P) {
    if (!P.rail) { CANT.cut(P, why); return; }
    var q = P.q, ry = q[8] || 0, alongX = q[5] >= q[7], half = (alongX ? q[5] : q[7]) / 2, cx = q[2] + P.M.ox, cz = q[4] + P.M.oz;
    var ax = alongX ? [Math.cos(ry), -Math.sin(ry)] : [Math.sin(ry), Math.cos(ry)], lo = Infinity, hi = -Infinity;
    boxes.forEach(function (b) {
      var B = b.box; if (!(B[1] > P.x0 && B[0] < P.x1 && B[3] > P.z0 && B[2] < P.z1 && B[5] > P.y0 && B[4] < P.y1)) return;
      [[B[0], B[2]], [B[1], B[2]], [B[0], B[3]], [B[1], B[3]]].forEach(function (c) { var s = (c[0] - cx) * ax[0] + (c[1] - cz) * ax[1]; lo = Math.min(lo, s); hi = Math.max(hi, s); });
    });
    if (lo === Infinity) return;
    CANT.cut(P, why);
    [[-half, Math.max(-half, lo - 0.2)], [Math.min(half, hi + 0.2), half]].forEach(function (iv) { if (iv[1] - iv[0] >= 0.6) CANT.prims.push(CANT.railPiece(P, iv[0], iv[1])); });
  });
};

/* ---------------------------------------------------------------- the Ancestry waterfalls: where the water falls
   The summit fountain's four channels run to the summit's edge on the four sides. On each side the water drops off the
   summit's lip into the bed of the inner revolution below, crosses that revolution's walkway in a covered trough (the
   capture's own troughs, at each face's middle), drops off its parapet into the bed of the revolution below that, and
   so on to the apron and the bay: four falls a side, sixteen in all. Each is a keep-out the bridges must miss. */
CANT.planFalls = function () {
  var M = CANT.by.Ancestry; CANT.falls = []; if (!M || !M.faces) return;
  var F = M.faces, top = M.stack.reduce(function (y, s) { return Math.max(y, s.y1); }, 0), sumR = M.stack.filter(function (s) { return s.y1 >= top - 0.01; })[0];
  for (var side = 0; side < 4; side++) {
    var fs = F.filter(function (f) { return f.f % 4 === side; }).sort(function (a, b) { return b.y0 - a.y0; });   /* inner (highest) first */
    if (!fs.length) continue;
    var n = fs[0].n, mid = function (f) { return [CANT.mix(f.p0[0], f.p1[0], 0.5), CANT.mix(f.p0[1], f.p1[1], 0.5)]; };
    /* from the summit's lip down to the inner face's bed */
    var lips = [];
    var m0 = mid(fs[0]), rLip = sumR ? sumR.hb : 30, lip0 = [M.x + n[0] * rLip + (m0[0] - M.x) * Math.abs(n[1]), M.z + n[1] * rLip + (m0[1] - M.z) * Math.abs(n[0])];
    lips.push({ p: lip0, y: top, to: fs[0] });
    fs.forEach(function (f, i) { var m = mid(f), y = CANT.faceY(f, 0.5); lips.push({ p: [m[0] + f.n[0] * (M.walkW / 2 + 1.8), m[1] + f.n[1] * (M.walkW / 2 + 1.8)], y: y + 0.4, to: fs[i + 1] || null }); });
    lips.forEach(function (L, i) {
      var toY, foot;
      if (L.to) { toY = CANT.faceY(L.to, 0.5) + 0.9; foot = [L.p[0] + n[0] * 1.5, L.p[1] + n[1] * 1.5]; }
      else { toY = VOTH.SEA + 0.2; foot = [L.p[0] + n[0] * 3, L.p[1] + n[1] * 3]; }
      /* the last fall drops onto the apron when the apron is under it, then off the apron's edge to the bay */
      if (!L.to && M.apron && CANT.sq(M, foot[0], foot[1]) < M.apron.ro) {
        CANT.falls.push({ side: side, i: i, lip: L.p, y0: L.y, foot: foot, y1: M.apron.y + 0.05, n: n, w: 4.2, pool: true });
        var e = [M.x + n[0] * (M.apron.ro + 0.3) + (foot[0] - M.x) * Math.abs(n[1]), M.z + n[1] * (M.apron.ro + 0.3) + (foot[1] - M.z) * Math.abs(n[0])];
        CANT.falls.push({ side: side, i: i + 1, lip: e, y0: M.apron.y, foot: [e[0] + n[0] * 2, e[1] + n[1] * 2], y1: VOTH.SEA + 0.2, n: n, w: 4.6, channel: [foot, e] });
        return;
      }
      CANT.falls.push({ side: side, i: i, lip: L.p, y0: L.y, foot: foot, y1: toY, n: n, w: i === 0 ? 3.6 : 4.2 });
    });
  }
  CANT.falls.forEach(function (f) { CANT.keep.push({ x: (f.lip[0] + f.foot[0]) / 2, z: (f.lip[1] + f.foot[1]) / 2, r: f.w / 2 + 3, y0: f.y1 - 1, y1: f.y0 + 4, why: 'Ancestry waterfall' }); });
};

/* ---------------------------------------------------------------- the causeways' canton ends
   A mole stops at the apron's edge, and a flight up its end puts a person on the apron; a bridge causeway lands on the
   level nearest its deck (VOTH.CWAY), at that level's edge. Returns the causeways with their ends moved. */
CANT.planCauseways = function (list) {
  CANT.ends = []; CANT.audit.causeways = [];
  var T = CANT.T;
  return list.map(function (l) {
    var P = l.pts.map(function (p) { return p.slice(); }), out = { id: l.id, name: l.name, kind: l.kind, width: l.width, origin: l.origin, pts: P, ends: [null, null] };
    [0, P.length - 1].forEach(function (ei, side) {
      var p = P[ei], q = P[ei === 0 ? 1 : P.length - 2], M = CANT.at(p[0], p[1], 4); if (!M || !M.apron) return;
      var L = Math.hypot(q[0] - p[0], q[1] - p[1]), dir = [(q[0] - p[0]) / L, (q[1] - p[1]) / L];
      var lev = l.kind === 'mole' ? M.apron : M.levels.filter(function (v) { return v.y <= VOTH.CWAY + 8; }).sort(function (a, b) { return Math.abs(a.y - VOTH.CWAY) - Math.abs(b.y - VOTH.CWAY); })[0] || M.apron;
      var k = 0; while (k < L - 10 && CANT.sq(M, p[0] + dir[0] * k, p[1] + dir[1] * k) < lev.ro) k += 0.25;
      /* the square says where the level begins, but its corners are rounded and its skirt battered (owner, 2026-10-09:
         "causeway not quite reaching canton"): back in from there until real masonry of the level stands under the end
         (CANT.surface), then a metre more, so the deck runs into it rather than stopping in the water */
      var k0 = k; while (k > 0 && k > k0 - T.reachIn) { var sy = CANT.surface(M, p[0] + dir[0] * k, p[1] + dir[1] * k); if (sy != null && sy >= lev.y - 1.5) break; k -= 0.25; }
      k = Math.max(0, k - 1);
      var e = [p[0] + dir[0] * k, p[1] + dir[1] * k];
      P[ei] = e;
      var end = { id: l.id + (side ? ':b' : ':a'), causeway: l.id, canton: M.n, x: e[0], z: e[1], y: lev.y, dir: dir, kind: l.kind, lev: lev.k, w: l.width };
      if (l.kind === 'mole') {
        /* the flight: on the mole's end, rising to the apron's edge */
        var top = VOTH.RLAND + 0.7, n = Math.max(2, Math.ceil((lev.y - top) / T.rise)), run = n * T.tread, fw = Math.min(l.width * 0.5, 14);
        end.flight = CANT.addFlight({ canton: M.n, kind: 'mole', a: [e[0] + dir[0] * run, e[1] + dir[1] * run], b: [e[0] - dir[0] * 0.6, e[1] - dir[1] * 0.6], y0: top, y1: lev.y, w: fw, base: top });
      }
      out.ends[side] = end; CANT.ends.push(end);
      CANT.audit.causeways.push({ id: l.id, canton: M.n, kind: l.kind, y: +lev.y.toFixed(1), moved: +k.toFixed(1), flight: !!end.flight });
    });
    return out;
  });
};

/* ---------------------------------------------------------------- flights of steps
   {canton, kind: dock|mole|terrace|summit, a: bottom [x, z], b: top [x, z], y0, y1, w, base}: the steps rise from a to
   b, each T.rise high and T.tread deep, on solid masonry from `base` (a terrace's floor, a deck) */
CANT.addFlight = function (o) {
  var T = CANT.T, L = Math.hypot(o.b[0] - o.a[0], o.b[1] - o.a[1]);
  o.id = 'flight_' + CANT.flights.length; o.steps = Math.max(2, Math.round((o.y1 - o.y0) / T.rise)); o.len = L; o.ry = Math.atan2(o.b[0] - o.a[0], o.b[1] - o.a[1]);
  if (o.base == null) o.base = o.y0;
  CANT.flights.push(o);
  return o;
};
/* the boxes a flight fills, for the clearance tests (the stair's mass and the headroom over it) */
CANT.flightBoxes = function (o, head) {
  return CANT.stripBoxes(o.a, o.b, o.w, o.y0, o.y1, 0.2, head == null ? 2.4 : head, 2.5).map(function (b) { b.box[4] = Math.max(o.base, b.box[4] - 0.4); return b; });
};

/* ---------------------------------------------------------------- the docks: from each ferry pier up onto the apron
   piers: [{canton, root: [x, z], dir: [dx, dz] (outward), w, deckY}] (the city's ferry piers, VC.FP; Voth's CPIERS) */
CANT.planDocks = function (piers) {
  var T = CANT.T; CANT.docks = [];
  (piers || []).forEach(function (pr, i) {
    var M = CANT.by[pr.canton]; if (!M || !M.apron) return;
    var dir = pr.dir, k = 0, p = pr.root;
    while (k < 200 && CANT.sq(M, p[0] + dir[0] * k, p[1] + dir[1] * k) < M.apron.ro + 0.2) k += 0.25;
    var e = [p[0] + dir[0] * k, p[1] + dir[1] * k], y0 = pr.deckY, n = Math.max(2, Math.ceil((M.apron.y - y0) / T.rise)), run = n * T.tread;
    /* its top step runs half a metre onto the apron, so there is no gap at the edge */
    var fl = CANT.addFlight({ canton: M.n, kind: 'dock', a: [e[0] + dir[0] * run, e[1] + dir[1] * run], b: [e[0] - dir[0] * 0.7, e[1] - dir[1] * 0.7], y0: y0, y1: M.apron.y, w: Math.min(T.dockW, (pr.w || 5.5) - 0.6), base: y0, pier: pr.id || i });
    CANT.docks.push({ canton: M.n, flight: fl, at: e, dir: dir, pier: pr.id || i });
  });
};
/* the bottom doors: on the tier-0 wall behind each dock and mole flight, for the interiors (one per canton side used) */
CANT.planDoors = function () {
  CANT.doors = [];
  var seen = {};
  CANT.flights.forEach(function (f) {
    if (f.kind !== 'dock' && f.kind !== 'mole') return;
    var M = CANT.by[f.canton]; if (!M || !M.apron || (!M.apron.ri && !M.spiral)) return;
    var dir = [f.a[0] - f.b[0], f.a[1] - f.b[1]], dl = Math.hypot(dir[0], dir[1]); dir = [dir[0] / dl, dir[1] / dl];
    var n = Math.abs(dir[0]) > Math.abs(dir[1]) ? [Math.sign(dir[0]), 0] : [0, Math.sign(dir[1])], key = M.n + n.join(',');
    if (seen[key]) return; seen[key] = 1;
    var along = (f.b[0] - M.x) * -n[1] + (f.b[1] - M.z) * n[0], rw = M.apron.ri;
    /* the spiral has no tier wall: its door is where the ramp's masonry rises off the apron, on the flight's line */
    if (M.spiral) { along = CANT.cl(along, -40, 40); rw = M.apron.ro - 0.5; while (rw > 20) { var px = M.x + n[0] * rw + -n[1] * along, pz = M.z + n[1] * rw + n[0] * along, sy = CANT.surface(M, px, pz); if (sy !== null && sy > M.apron.y + 1.5) break; rw -= 0.25; } rw += 0.25; }
    along = CANT.cl(along, -rw + 12, rw - 12);
    CANT.doors.push({ id: 'door_' + CANT.doors.length, canton: M.n, kind: 'bottom', x: M.x + n[0] * rw + -n[1] * along, z: M.z + n[1] * rw + n[0] * along, y: M.apron.y, n: n, w: 3.4, h: 4.6, from: f.id });
  });
};

/* ---------------------------------------------------------------- the terrace flights: the apron to the top deck
   On a tiered canton, one flight per level, on the band of that level lying outside the cornice of the level above
   (open sky over it), running along the face and arriving at the upper level's very edge. Each flight is placed on
   its own: on any face, anywhere along it, either way up, where it clears what stands on the terraces, the bridges'
   corridors and piers, and lies near where the flight below arrived (a walk round the terrace joins them). The first
   starts near the canton's dock (or mole). */
CANT.planChains = function () {
  var T = CANT.T; CANT.chains = []; CANT.audit.flights = [];
  CANT.list.forEach(function (M) {
    if (M.spiral || !M.levels || M.levels.length < 2) return;
    var top = M.levels.indexOf(M.top); if (top < 1) return;
    var dock = CANT.flights.filter(function (f) { return f.canton === M.n && (f.kind === 'dock' || f.kind === 'mole'); })[0];
    var from = dock ? dock.b : null, fl = [], cut = 0, big = 0, ok = true;
    for (var k = 0; k < top; k++) {
      var best = null;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (n) {
        var tg = [-n[1], n[0]];
        for (var dir = -1; dir <= 1; dir += 2) for (var s0 = -170; s0 <= 170; s0 += 5) {
          var f = CANT.flightAt(M, k, n, tg, s0, dir); if (!f) continue;
          /* the walk from where the last flight arrived (or the dock) to this one's foot, round the terrace */
          var walk = from ? CANT.ringWalk(M, from, f.a) : 0;
          var cost = f.cost + walk * 0.08;
          if (!best || cost < best.cost) { best = f; best.cost = cost; }
        }
      });
      if (!best) { ok = false; break; }
      var o = CANT.addFlight(best); CANT.clearCorridor(best.hits.filter(function (P) { return P.small || P.rail; }), CANT.flightBoxes(o), 'terrace stair');
      fl.push(o); cut += best.cut; big += best.big; from = o.b;
      best.hits.forEach(function (P) { if (!P.small && !P.rail) (CANT.audit.bigFlight = CANT.audit.bigFlight || []).push(M.n + ' L' + k + ': ' + P.fam + ' ' + P.sh + ' ' + P.q[5].toFixed(1) + 'x' + P.q[7].toFixed(1) + 'x' + P.q[6].toFixed(1) + ' y ' + P.y0.toFixed(1)); });
    }
    CANT.chains.push({ canton: M.n, flights: fl, ok: ok });
    CANT.audit.flights.push({ canton: M.n, ok: ok, flights: fl.length, faces: fl.map(function (f) { return f.n.join(','); }).join(' '), cut: cut, big: big, rise: +(M.top.y - M.apron.y).toFixed(1) });
  });
};
/* the walk round a canton's square between two points on its terraces: along its perimeter (corners included) */
CANT.ringWalk = function (M, p, q) {
  var per = function (x, z) { var lx = x - M.x, lz = z - M.z, r = Math.max(Math.abs(lx), Math.abs(lz)) || 1, s;
    if (lx >= r - 1e-6) s = (lz + r) / (8 * r); else if (lz >= r - 1e-6) s = 0.25 + (r - lx) / (8 * r); else if (lx <= -r + 1e-6) s = 0.5 + (r - lz) / (8 * r); else s = 0.75 + (lx + r) / (8 * r);
    return { s: s, r: r }; };
  var a = per(p[0], p[1]), b = per(q[0], q[1]), d = Math.abs(a.s - b.s); d = Math.min(d, 1 - d);
  return d * 8 * (a.r + b.r) / 2 + Math.abs(a.r - b.r);
};
/* one flight from level k to k+1 on face n, starting at s0 along it and running `dir`: the record and its cost, or null */
CANT.flightAt = function (M, k, n, tg, s0, dir) {
  var T = CANT.T, lo = M.levels[k], hi = M.levels[k + 1], rIn = hi.ro + 0.1, rOut = lo.ro - 0.5, w = Math.min(T.flightW, rOut - rIn);
  if (w < 2.6) return null;
  var rc = rIn + w / 2, len = Math.ceil((hi.y - lo.y) / T.rise) * T.tread, e = s0 + dir * len;
  if (Math.max(Math.abs(s0), Math.abs(e)) > rIn - w - 3) return null;                  /* clear of the corners */
  var f = { canton: M.n, kind: 'terrace', a: [M.x + n[0] * rc + tg[0] * s0, M.z + n[1] * rc + tg[1] * s0], b: [M.x + n[0] * rc + tg[0] * e, M.z + n[1] * rc + tg[1] * e],
            y0: lo.y, y1: hi.y, w: w, base: lo.y, lev: k, n: n, hits: [], cost: 0, cut: 0, big: 0 };
  /* the arrival: the upper level's edge must be open where the flight steps onto it */
  var arr = [f.b[0] - n[0] * (w / 2 + 3), f.b[1] - n[1] * (w / 2 + 3)], ay = CANT.surface(M, arr[0], arr[1]);
  if (ay === null || ay < hi.y - 0.3 || ay > hi.y + 3.2) return null;
  f.y1 = ay;                                                                           /* onto a raised band, its top */
  var boxes = CANT.flightBoxes(f).concat(CANT.stripBoxes(f.b, arr, w, ay, ay, -0.3, 2.4, 2.5));
  for (var i = 0; i < boxes.length; i++) {
    var bx = boxes[i];
    CANT.hits(bx.box).forEach(function (P) { if (f.hits.indexOf(P) >= 0) return; f.hits.push(P); if (P.small || P.rail) { f.cost += 0.4; f.cut++; } else { f.cost += 120; f.big++; } });
    for (var j = 0; j < CANT.spans.length; j++) if (CANT.nearSpan(CANT.spans[j], bx.x, bx.z, CANT.spans[j].w / 2 + 2, bx.box[5] + 0.5)) { f.cost += 400; break; }
    if (CANT.keepHit(bx.x, bx.z, bx.box[4], bx.box[5], w / 2)) f.cost += 400;
    if (f.cost > 5000) return null;
  }
  return f;
};
/* is (x, z) under or on a bridge (its deck lower than yTop), or by one of its piers */
CANT.nearSpan = function (S, x, z, r, yTop) {
  var dx = S.bx - S.ax, dz = S.bz - S.az, L2 = dx * dx + dz * dz, t = ((x - S.ax) * dx + (z - S.az) * dz) / L2;
  var ends = [[S.la[0], S.la[1], S.ax, S.az], [S.lb[0], S.lb[1], S.bx, S.bz]];
  if (t >= -0.06 && t <= 1.06) { var px = S.ax + dx * t - x, pz = S.az + dz * t - z; if (px * px + pz * pz < r * r && CANT.deckY(S, CANT.cl(t, 0, 1)) - CANT.T.deckT < yTop) return true; }
  for (var i = 0; i < S.piers.length; i++) if (Math.hypot(S.piers[i].x - x, S.piers[i].z - z) < S.w + 3) return true;
  return false;
};

/* ---------------------------------------------------------------- the captures: Voth's broad sea stairs, and the old falls
   A sea stair (Voth's seaStair: stone boxes in 0xa79b82 rising from the water) whose steps lie mostly inside the tiers
   is the "buried entrance": it goes whole. So do the Ancestry's old cascades (thin slabs hung between the turns),
   their foam, and its walkway slabs (2.4 m steps: the new steps follow the same ramp at T.rise). */
CANT.editCaptures = function () {
  var D = window.VOTH_CITY_CAPTURE; if (!D) return;
  CANT.list.forEach(function (M) {
    var groups = {};
    M.v.r.forEach(function (q, k) {
      if (q[0] !== 0 || D.cols[q[9]] !== 0xa79b82) return;
      var ry = q[8] || 0, alongX = Math.abs(Math.sin(ry)) > 0.7, line = Math.round(alongX ? q[4] : q[2]), key = Math.round(ry * 10) + '|' + Math.round(q[5]) + '|' + line;
      (groups[key] = groups[key] || []).push(k);
    });
    Object.keys(groups).forEach(function (g) {
      var ks = groups[g]; if (ks.length < 4) return;
      var buried = ks.filter(function (k) { var q = M.v.r[k], x = q[2] + M.ox, z = q[4] + M.oz, st = CANT.stackTop(M, x, z); return st !== null && st > q[3] + q[6] + M.bed + 0.8; }).length;
      if (buried > ks.length * 0.3) ks.forEach(function (k) { CANT.cut({ M: M, k: k }, 'buried sea stair'); });
    });
    if (M.spiral) {
      M.v.r.forEach(function (q, k) {
        if (q[0] === 9) return;
        var col = D.cols[q[9]], sh = D.shapes[q[0]];
        if (col === 0x8fb8c4 && sh === 'box' && q[6] > 4) CANT.cut({ M: M, k: k }, 'old waterfall');
        else if (col === 0xd8e8ea && sh === 'blob') CANT.cut({ M: M, k: k }, 'old waterfall foam');
      });
      M.faces.forEach(function (F) { F.slabs.forEach(function (k) { CANT.cut({ M: M, k: k }, 'walkway slab (re-stepped)'); }); });
      CANT.flipTombs(M);
      if (CANT.biomeFlora) CANT.floraToBiome(M);
    }
  });
};
/* ---------------------------------------------------------------- the Ancestry: tombs, summit stair, flora
   The tombs (Voth's familyTomb, steppedTomb, wallNicheTomb and grave, 50e-necropolis.js) stand on each face's outer
   side with their doors facing out over the parapet, to the bay. The owner: "make sure tombs are oriented so door faces
   inward". Each is found in the capture as a cluster of pieces along its face (not the ramp's own masonry, the flora
   or the troughs) and turned half round about its own middle (Voth's tomb line, 6.91 m out from the walkway's
   centre), so its door opens onto the walkway. */
CANT.TOMB_LINE = 6.91;
CANT.flipTombs = function (M) {
  var D = window.VOTH_CITY_CAPTURE, slab = {}, cut = CANT.cuts[M.n] || {}, byFace = M.faces.map(function () { return []; });
  M.faces.forEach(function (F) { F.slabs.forEach(function (k) { slab[M.v.r[k][7].toFixed(2)] = 1; }); });
  M.v.r.forEach(function (q, k) {
    if (q[0] === 9 || M.stackK[k] || cut[k]) return;
    var fam = D.fams[q[1]]; if (fam === 'leaf' || fam === 'trunk' || D.cols[q[9]] === 0x8fb8c4 || (q[0] === 0 && slab[q[7].toFixed(2)])) return;
    var x = q[2] + M.ox, z = q[4] + M.oz, y = q[3] + M.bed;
    for (var i = 0; i < M.faces.length; i++) {
      var F = M.faces[i], o = CANT.onFace(F, x, z); if (o.t < -0.01 || o.t > 1.01 || o.s < 2.5 || o.s > 11.5) continue;
      var fy = CANT.faceY(F, CANT.cl(o.t, 0, 1)); if (y < fy - 2.5 || y > fy + 9) continue;
      byFace[i].push({ k: k, a: o.t * F.len, s: o.s, he: Math.max(q[5], q[7]) / 2 }); break;
    }
  });
  CANT.tombs = CANT.tombs || [];
  var n = 0;
  byFace.forEach(function (L, i) {
    var F = M.faces[i], C = [];
    L.sort(function (p, q) { return p.a - q.a; });
    L.forEach(function (r) { var c = C[C.length - 1]; if (c && r.a - r.he <= c.end + 0.6) { c.list.push(r); c.lo = Math.min(c.lo, r.a - r.he); c.end = Math.max(c.end, r.a + r.he); } else C.push({ list: [r], lo: r.a - r.he, end: r.a + r.he }); });
    C.forEach(function (c) {
      if (c.list.length < 2) return;                                    /* a lone piece is not a tomb */
      var ac = (c.lo + c.end) / 2, s0 = CANT.TOMB_LINE, x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      c.list.forEach(function (r) {
        var q = M.v.r[r.k], a = 2 * ac - r.a, s = 2 * s0 - r.s, wx = F.p0[0] + F.u[0] * a + F.n[0] * s, wz = F.p0[1] + F.u[1] * a + F.n[1] * s;
        q[2] = wx - M.ox; q[4] = wz - M.oz; q[8] = (q[8] || 0) + Math.PI;
        var co = Math.abs(Math.cos(q[8])), si = Math.abs(Math.sin(q[8])), round = /cyl|dome|blob|stk|cone/.test(D.shapes[q[0]]);
        var hx = round ? q[5] : co * q[5] / 2 + si * q[7] / 2, hz = round ? q[7] : si * q[5] / 2 + co * q[7] / 2;
        x0 = Math.min(x0, wx - hx); x1 = Math.max(x1, wx + hx); z0 = Math.min(z0, wz - hz); z1 = Math.max(z1, wz + hz); y0 = Math.min(y0, q[3] + M.bed); y1 = Math.max(y1, q[3] + q[6] + M.bed);
      });
      CANT.tombs.push({ canton: M.n, face: i, at: ac / F.len, box: [x0, x1, z0, z1, y0, y1], pieces: c.list.length }); n++;
    });
  });
  CANT.audit.tombs = n;
};
/* the summit stair: the ramp's last face ends a step short of the summit's paving; a short flight up onto it */
CANT.planSummit = function (M) {
  var F = M.faces[M.faces.length - 1], cap = M.stack.reduce(function (b, s) { return !b || s.y1 > b.y1 ? s : b; }, null); if (!F || !cap) return;
  var y0 = CANT.faceY(F, 1), rise = cap.y1 - y0; if (rise < 0.3) return;
  var n = Math.ceil(rise / CANT.T.rise), run = n * CANT.T.tread, a = [F.p1[0] - F.u[0] * 2, F.p1[1] - F.u[1] * 2];
  CANT.addFlight({ canton: M.n, kind: 'summit', a: a, b: [a[0] - F.n[0] * run, a[1] - F.n[1] * run], y0: y0, y1: cap.y1, w: M.walkW * 0.75, base: y0 - 0.2 });
};
/* the Ancestry's flora goes to the biome (the city: 38-vc-flora.js, VC.drawFlora): Voth's blob trees and bed cover are
   cut from the capture and kept as records of where they stood; a cherry stays a cherry (the swbay biome's ash cherry),
   the others become the biome's dragon trees and baobabs, the bed cover its shrubs, ferns and moss */
CANT.floraToBiome = function (M) {
  var D = window.VOTH_CITY_CAPTURE, cut = CANT.cuts[M.n] || {}, trunks = [], blobs = [];
  M.v.r.forEach(function (q, k) {
    if (q[0] === 9 || cut[k]) return;
    var fam = D.fams[q[1]], x = q[2] + M.ox, z = q[4] + M.oz, y = q[3] + M.bed;
    if (fam === 'trunk') trunks.push({ k: k, x: x, z: z, y: y, h: q[6], r: q[5], sh: D.shapes[q[0]] });
    else if (fam === 'leaf' && D.shapes[q[0]] === 'blob') blobs.push({ k: k, x: x, z: z, y: y, r: q[5], col: D.cols[q[9]] });
  });
  var pink = function (c) { var r = c >> 16 & 255, g = c >> 8 & 255, b = c & 255; return r > 170 && r > g + 20 && b > g; };
  var trees = [], ground = [];
  trunks.forEach(function (T) {
    if (trees.some(function (o) { return Math.hypot(o.x - T.x, o.z - T.z) < 2.5; })) return;      /* a trunk's pieces: one tree */
    var near = blobs.filter(function (b) { return Math.hypot(b.x - T.x, b.z - T.z) < 6 && b.y > T.y + 1; });
    var kind = near.some(function (b) { return pink(b.col); }) ? 'cherry' : T.r > 1.1 || T.sh === 'fr6' ? 'baobab' : 'dragon';
    var gy = CANT.surface(M, T.x, T.z); trees.push({ x: T.x, z: T.z, y: gy == null ? T.y : Math.min(gy, T.y + 0.5), kind: kind });
  });
  blobs.forEach(function (b) {
    if (trees.some(function (o) { return Math.hypot(o.x - b.x, o.z - b.z) < 4; })) return;          /* a crown, not bed cover */
    var gy = CANT.surface(M, b.x, b.z); ground.push({ x: b.x, z: b.z, y: gy == null ? b.y : gy, r: b.r });
  });
  trunks.concat(blobs).forEach(function (o) { CANT.cut({ M: M, k: o.k }, 'flora (to the biome)'); });
  CANT.ancFlora = { trees: trees, ground: ground };
  CANT.audit.ancFlora = { trees: trees.length, cherries: trees.filter(function (t) { return t.kind === 'cherry'; }).length, ground: ground.length };
};

/* leave the cut records out of the captured models (run once, before the cantons are drawn) */
CANT.applyCuts = function () {
  if (CANT.cutDone) return; CANT.cutDone = true;
  CANT.list.forEach(function (M) { var c = CANT.cuts[M.n]; if (!c) return; M.v.r = M.v.r.filter(function (q, k) { return !c[k]; }); });
};

/* ---------------------------------------------------------------- the plan, in order (records only)
   planA (the city's step 0; the site page's load): the cantons read, the falls, the bridges, the causeways' ends.
   planB (once the ferry piers are set out): the dock flights, the terrace chains, the bottom doors, what the captures
   lose. Then CANT.walk() puts every surface in KWALK and CANT.tag() every record in a core/tags registry. */
CANT.planA = function (opt) {
  opt = opt || {};
  CANT.read(); CANT.index();
  CANT.keep = []; CANT.flights = []; CANT.prims = []; CANT.cuts = {}; CANT.cutDone = false; CANT.audit.removed = {};
  CANT.planFalls();
  CANT.planSpans();
  CANT.causewayList = CANT.planCauseways(opt.causeways || []);
  return CANT.causewayList;
};
CANT.planB = function (piers) {
  CANT.tombs = []; CANT.ancFlora = null;
  CANT.planDocks(piers || []);
  if (CANT.by.Ancestry && CANT.by.Ancestry.faces) CANT.planSummit(CANT.by.Ancestry);
  CANT.planChains();
  CANT.planDoors();
  CANT.editCaptures();
};
/* the site page re-lays the causeways as the owner edits them: their mole flights are laid again with them */
CANT.relayCauseways = function (list) { CANT.flights = CANT.flights.filter(function (f) { return f.kind !== 'mole'; }); return (CANT.causewayList = CANT.planCauseways(list)); };

/* ---------------------------------------------------------------- what a deck layout must keep clear of
   (33-vc-country.js VC.deckOf): each bridge's landing on the top deck and the top flight's arrival, as core/city OBBs */
CANT.deckKeep = function (n) {
  var M = CANT.by[n], out = []; if (!M || !M.top || typeof obb === 'undefined') return out;
  CANT.spans.forEach(function (S) {
    [[S.a, S.ax, S.az, S.la, S.ya], [S.b, S.bx, S.bz, S.lb, S.yb]].forEach(function (e) {
      if (e[0] !== n || Math.abs(e[4] - M.top.y) > 0.5) return;
      var dx = e[1] - e[3][0], dz = e[2] - e[3][1], L = Math.hypot(dx, dz), u = [dx / L, dz / L], c = [(e[1] + e[3][0]) / 2, (e[2] + e[3][1]) / 2];
      out.push(obb([c[0] - u[0] * 4, c[1] - u[1] * 4], [-u[1], u[0]], S.w / 2 + 4, L / 2 + 8));
    });
  });
  CANT.flights.forEach(function (f) {
    if (f.canton !== n || f.kind !== 'terrace' || Math.abs(f.y1 - M.top.y) > 0.5) return;
    out.push(obb([f.b[0] - f.n[0] * 6, f.b[1] - f.n[1] * 6], [1, 0], 9, 9));
  });
  return out;
};

/* ---------------------------------------------------------------- the walk registry (core/walk KWALK)
   floors: every level's ring (four rects about its rising tier; the top deck one), the spiral's faces and summit;
   strips: the bridges (their landings and the deck in short runs that follow the arch), every flight, the causeways;
   blocks: each tier rising from a level, so a walker on a terrace stops at its wall */
/* a rect [x0, x1, z0, z1] less the holes cut in it (up to four rects round each hole) */
CANT.rectMinus = function (r, holes) {
  var out = [r];
  (holes || []).forEach(function (h) {
    out = [].concat.apply([], out.map(function (q) {
      if (h[0] >= q[1] || h[1] <= q[0] || h[2] >= q[3] || h[3] <= q[2]) return [q];
      var o = [];
      if (h[0] > q[0]) o.push([q[0], h[0], q[2], q[3]]);
      if (h[1] < q[1]) o.push([h[1], q[1], q[2], q[3]]);
      var a = Math.max(q[0], h[0]), b = Math.min(q[1], h[1]);
      if (h[2] > q[2]) o.push([a, b, q[2], h[2]]);
      if (h[3] < q[3]) o.push([a, b, h[3], q[3]]);
      return o;
    }));
  });
  return out;
};
/* CANT.hollow[name]: a canton with an interior (the city's 40-vc-interiors.js): its tiers are not solid to the walker,
   which registers their shell walls itself; CANT.holes[name]: [x0, x1, z0, z1, y] cut from the floors at y (a stair well) */
CANT.hollow = {}; CANT.holes = {};
CANT.walk = function (W) {
  W = W || (typeof KWALK !== 'undefined' ? KWALK : null); if (!W) return 0;
  var n0 = W.export().floors.length;
  CANT.list.forEach(function (M) {
    var x = M.x, z = M.z, tag = 'canton:' + M.n, holes = CANT.holes[M.n] || [];
    var fl = function (r, y, name) { CANT.rectMinus(r, holes.filter(function (h) { return Math.abs(h[4] - y) < 0.5; })).forEach(function (q) { W.floor({ rect: q, y: y, name: name, tag: tag }); }); };
    M.levels.forEach(function (l) {
      if (M.spiral && l !== M.apron) return;
      var ro = l.ro, ri = M.spiral ? 0 : l.ri;
      if (!ri) fl([x - ro, x + ro, z - ro, z + ro], l.y, M.n + (l.top ? ' top deck' : ' level ' + l.k));
      else {
        fl([x + ri, x + ro, z - ro, z + ro], l.y, M.n + ' level ' + l.k);
        fl([x - ro, x - ri, z - ro, z + ro], l.y, M.n + ' level ' + l.k);
        fl([x - ri, x + ri, z - ro, z - ri], l.y, M.n + ' level ' + l.k);
        fl([x - ri, x + ri, z + ri, z + ro], l.y, M.n + ' level ' + l.k);
        var up = M.levels[l.k + 1];
        if (up && l.rise && !CANT.hollow[M.n]) W.block([x - ri + 0.2, x + ri - 0.2, z - ri + 0.2, z + ri - 0.2, l.y + 0.3, up.y - 0.4], tag + ':tier');
      }
    });
    if (M.faces) {
      M.faces.forEach(function (F) { W.strip({ a: [F.p0[0], F.p0[1], CANT.faceY(F, 0)], b: [F.p1[0], F.p1[1], CANT.faceY(F, 1)], w: M.walkW, name: M.n + ' spiral face ' + F.f, tag: tag }); });
      var cap = M.stack.reduce(function (b, s) { return !b || s.y1 > b.y1 ? s : b; }, null);
      if (cap) W.floor({ rect: [x - cap.hb, x + cap.hb, z - cap.hb, z + cap.hb], y: cap.y1, name: M.n + ' summit', tag: tag });
    }
  });
  CANT.spans.forEach(function (S) {
    var tag = 'bridge:' + S.id;
    W.strip({ a: [S.la[0], S.la[1], S.ya], b: [S.ax, S.az, S.ya], w: S.w - 1.2, name: S.a + ' bridge landing', tag: tag });
    W.strip({ a: [S.bx, S.bz, S.yb], b: [S.lb[0], S.lb[1], S.yb], w: S.w - 1.2, name: S.b + ' bridge landing', tag: tag });
    var n = Math.max(6, Math.ceil(S.L / 12));
    for (var i = 0; i < n; i++) {
      var t0 = i / n, t1 = (i + 1) / n;
      W.strip({ a: [CANT.mix(S.ax, S.bx, t0), CANT.mix(S.az, S.bz, t0), CANT.deckY(S, t0)], b: [CANT.mix(S.ax, S.bx, t1), CANT.mix(S.az, S.bz, t1), CANT.deckY(S, t1)], w: S.w - 1.2, name: S.a + '–' + S.b + ' bridge', tag: tag });
    }
  });
  CANT.flights.forEach(function (f) {
    W.strip({ a: [f.a[0], f.a[1], f.y0], b: [f.b[0], f.b[1], f.y1], w: f.w - 0.4, name: f.canton + ' ' + f.kind + ' stair', tag: 'stair:' + f.id });
    /* a terrace flight's top: a step across onto the level it reaches, inward from the flight's last tread */
    if (f.kind === 'terrace' && f.n) { var u = [(f.b[0] - f.a[0]) / f.len, (f.b[1] - f.a[1]) / f.len], q = [f.b[0] - u[0] * 1.25, f.b[1] - u[1] * 1.25];
      W.strip({ a: [q[0] + f.n[0] * f.w / 2, q[1] + f.n[1] * f.w / 2, f.y1], b: [q[0] - f.n[0] * (f.w / 2 + 2.5), q[1] - f.n[1] * (f.w / 2 + 2.5), f.y1], w: 2.6, name: f.canton + ' stair head', tag: 'stair:' + f.id }); }
  });
  (CANT.tombs || []).forEach(function (T) { W.block(T.box, 'tomb'); });
  return W.export().floors.length - n0;
};
/* a causeway's walkable surface (VIEW.causeways calls this as it builds one) */
CANT.walkCauseway = function (W, a, b, ya, yb, w, name) { if (W) W.strip({ a: [a[0], a[1], ya], b: [b[0], b[1], yb], w: w, name: name, tag: 'causeway' }); };

/* ---------------------------------------------------------------- the tag registry (core/tags KTAGS)
   every bridge, flight, causeway end and door as an infrastructure record, under its canton */
CANT.tag = function () {
  if (typeof KTAGS === 'undefined' || !KTAGS.create) return null;
  var T = CANT.tags = KTAGS.create({ build: 'voth-city' });
  CANT.spans.forEach(function (S) { S.tagId = T.add({ class: 'infrastructure', kind: 'bridge', key: 'voth_canton_bridge', name: S.a + '–' + S.b + ' bridge', at: [(S.ax + S.bx) / 2, Math.min(S.ya, S.yb), (S.az + S.bz) / 2], ry: S.ry, size: [S.w, S.L, 6], tags: { culture: 'voth', types: ['infrastructure'] } }).id; });
  CANT.flights.forEach(function (f) { f.tagId = T.add({ class: 'infrastructure', kind: 'stair', key: 'voth_canton_stair', name: f.canton + ' ' + f.kind + ' stair', at: [(f.a[0] + f.b[0]) / 2, f.y0, (f.a[1] + f.b[1]) / 2], ry: f.ry, size: [f.w, f.len, f.y1 - f.y0], tags: { culture: 'voth', types: ['infrastructure'] } }).id; });
  CANT.doors.forEach(function (d) { d.tagId = T.add({ class: 'part', kind: 'door', key: 'voth_canton_door', name: d.canton + ' canton door', at: [d.x, d.y, d.z], ry: Math.atan2(d.n[0], d.n[1]), size: [d.w, 1, d.h], tags: { culture: 'voth', types: ['infrastructure'] } }).id; });
  return T;
};

/* ---------------------------------------------------------------- drawing the records, in Voth's primitives (B: VOTH)
   (the city's VC.capture and the site page's VIEW.bridges collect what these push into B.PRIMS) */
CANT.drawSpan = function (B, S) {
  var T = CANT.T, col = B.TONES[0], dk = B.shade(col, -0.18), L = S.L, ry = S.ry, u = [(S.bx - S.ax) / L, (S.bz - S.az) / L], pv = [u[1], -u[0]];
  var n = Math.max(10, Math.ceil(L / 3.2)), seg = L / n * 1.04;
  for (var i = 0; i < n; i++) {
    var t = (i + 0.5) / n, x = S.ax + u[0] * L * t, z = S.az + u[1] * L * t, y = CANT.deckY(S, t);
    B.BOX(x, y - T.deckT, z, S.w, T.deckT, seg, ry, col);
    [-1, 1].forEach(function (sd) { B.BOX(x + pv[0] * sd * (S.w / 2 - 0.6), y, z + pv[1] * sd * (S.w / 2 - 0.6), 1.2, 1.25, seg, ry, dk); });
  }
  /* the landings: paving on the level, flush with it; a bridgehead post either side at the level's edge */
  [[S.ax, S.az, S.la, S.ya], [S.bx, S.bz, S.lb, S.yb]].forEach(function (e) {
    var cx = (e[0] + e[2][0]) / 2, cz = (e[1] + e[2][1]) / 2, ll = Math.hypot(e[0] - e[2][0], e[1] - e[2][1]);
    B.BOX(cx, e[3] - 0.25, cz, S.w, 0.32, ll + 0.6, ry, B.shade(col, 0.04));
    [-1, 1].forEach(function (sd) { var px = e[0] + pv[0] * sd * (S.w / 2 + 0.9), pz = e[1] + pv[1] * sd * (S.w / 2 + 0.9); B.FR3(px, e[3], pz, 2.2, 5.8, 2.2, ry, B.shade(col, -0.10)); B.BOX(px, e[3] + 5.8, pz, 1.2, 0.9, 1.2, ry, B.shade(col, 0.08)); });
  });
  /* the piers: in the water down to the bed, on a terrace down to its floor; a cap under the deck */
  S.piers.forEach(function (p) {
    B.FR8(p.x, p.y0, p.z, S.w * 1.2, p.y1 - p.y0, S.w * 1.3, ry, B.shade(col, -0.22));
    B.BOX(p.x, p.y1 - 1.6, p.z, S.w * 1.42, 1.6, S.w * 1.5, ry, B.shade(col, -0.30));
  });
  /* banners over the water, between piers, off both parapets */
  var ts = [0].concat(S.piers.map(function (p) { return p.t; }).sort(function (a, b) { return a - b; }), [1]), BAN = [0x7a2e2a, 0x34506e, 0x6e5a24, 0x4e3a5e];
  for (var k = 0; k + 1 < ts.length; k++) {
    var tm = (ts[k] + ts[k + 1]) / 2, xm = S.ax + u[0] * L * tm, zm = S.az + u[1] * L * tm, ym = CANT.deckY(S, tm);
    if (CANT.at(xm, zm, 0)) continue;
    [-1, 1].forEach(function (sd) { var drop = 8 + 5 * CANT.u(S.i, k * 2 + (sd > 0), 3); B.BOX(xm + pv[0] * sd * (S.w / 2 + 0.2), ym + 0.6 - drop, zm + pv[1] * sd * (S.w / 2 + 0.2), 0.16, drop, 5, ry, BAN[(S.i + k) % BAN.length], 'cloth'); });
  }
};
CANT.drawFlights = function (B, kinds) {
  CANT.flights.forEach(function (f) {
    if (kinds && kinds.indexOf(f.kind) < 0) return;
    var M = CANT.by[f.canton], col = M ? B.shade(M.tone, 0.05) : 0xa79b82, rail = B.shade(col, -0.16), L = f.len, u = [(f.b[0] - f.a[0]) / L, (f.b[1] - f.a[1]) / L], pv = [u[1], -u[0]];
    var outer = f.n ? (pv[0] * f.n[0] + pv[1] * f.n[1] > 0 ? 1 : -1) : 0;
    var n = f.steps, d = L / n;
    for (var s = 0; s < n; s++) {
      var t = (s + 0.5) / n, x = f.a[0] + u[0] * L * t, z = f.a[1] + u[1] * L * t, top = f.y0 + (f.y1 - f.y0) * (s + 1) / n;
      B.BOX(x, f.base, z, f.w, Math.max(0.2, top - f.base), d * 1.02, f.ry, col);
      /* a low wall on the open side of a terrace flight, and both sides of a dock or mole flight */
      [-1, 1].forEach(function (sd) { if (outer && sd !== outer) return; B.BOX(x + pv[0] * sd * (f.w / 2 + 0.25), top, z + pv[1] * sd * (f.w / 2 + 0.25), 0.5, 1.0, d * 1.02, f.ry, rail); });
    }
  });
};
/* the Ancestry walkway, re-stepped: each face's slabs replaced by steps of T.rise along the same ramp, as deep as the
   face is long (a stepped ramp), on the same 1.6 m slab under each */
CANT.drawSpiral = function (B) {
  var M = CANT.by.Ancestry; if (!M || !M.faces) return;
  var col = 0x777164;
  M.faces.forEach(function (F) {
    var n = Math.max(4, Math.round((F.y1 - F.y0) / CANT.T.rise)), d = F.len / n, ry = Math.atan2(F.u[0], F.u[1]);
    for (var s = 0; s < n; s++) {
      var t = (s + 0.5) / n, x = CANT.mix(F.p0[0], F.p1[0], t), z = CANT.mix(F.p0[1], F.p1[1], t), top = CANT.faceY(F, (s + 1) / n);
      B.BOX(x, top - 1.6, z, M.walkW, 1.6, d * 1.03, ry, B.shade(col, (s % 2) * 0.03));
    }
  });
};
