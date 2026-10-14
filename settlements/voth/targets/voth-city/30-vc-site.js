/* ============================== 3. THE SITE: GROUND, LANDMARKS, DISTRICTS, AVENUES, HIGHWAYS, WALL ============================== */
/* [G data] The owner's layout (site/voth-site.json, drawn in the site editor) read into the plan. Markers name
   the landmarks: A-E shrines, F G H the harbour, spirit and river gates, LH the small lighthouse, I the garrison
   castle and mustering ground, HOH the house of healing, FUNERARY TEMPLE the funerary temple. District names give
   roles: build zone, wall, harbor, industry, warehouse, river port, monastery. */
var VC = { prims: {}, gates: [], wall: null };

/* the role table (core/city 25-city-site.js KCITY.site.roles): a district's type, else its name */
VC.ROLES = { types: ['park', 'market', 'plaza', 'funerary'], other: 'misc', names: [
  [/build ?zone/, 'zone'], [/^wall$/, 'wall'], [/harbou?r/, 'harbor'], [/industr/, 'industry'], [/warehouse/, 'warehouse'], [/river ?port/, 'riverport'],
  [/monaster|abbey/, 'monastery'], [/clan/, 'clan'], [/chinampa.*(exclu|no)/, 'nochin'], [/^mines?\b/, 'mines'], [/quarr/, 'quarry'], [/mush/, 'mushfarm'], [/farm/, 'farms']] };
VC.role = KCITY.site.roles(VC.ROLES);
VC.marker = function (re) { return SITE.data.markers.filter(function (m) { return re.test(m.id); })[0] || null; };
VC.districts = function (role) { return PLAN.site.filter(function (d) { return d.role === role; }); };
/* the smallest district holding p, of the roles that are ground a lot belongs to; outside every one 'res' (or 'suburb'
   beyond the wall) */
VC.ROLE_AT = { skip: ['zone', 'wall', 'misc', 'nochin', 'mines', 'quarry', 'farms', 'mushfarm'], fallback: function (p) { return VC.outside(p) ? 'suburb' : 'res'; } };
VC.roleAt = function (p) { return KCITY.site.roleAt(p, PLAN.site, VC.ROLE_AT); };
/* the user's avenues (and the rings), nearest point */
VC.nearestWayPt = KCITY.site.nearestWay;
/* Voth's faceToward: the heading Voth's own builders take to face a point */
VC.face = function (x, z, tx, tz) { return Math.atan2(-(tz - z), tx - x); };

/* ---------------------------------------------------------------- step 0: the ground, the raster, the build zone */
SL.pass0 = function () {
  SITE.load(SITE_INIT);
  TERR.sync(SITE.data.terrain);
  VOTH.setGroundEdit(TERR.delta);
  /* the cantons' walkable levels, bridges and causeway ends (targets/voth-site/20-site-cantons.js) */
  CANT.biomeFlora = true;           /* the Ancestry's trees and bed cover go to the swbay biome (VC.drawFlora) */
  CANT.planA({ causeways: SITE.causeways() }); CANT.planned = true;
  var emb = VC.embank();
  var c = TUNE.groundCell, half = TUNE.rasterHalf, n = Math.ceil(2 * half / c) + 1, H = new Float32Array(n * n);
  for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) H[j * n + i] = TERR.h(-half + i * c, -half + j * c);
  SL.ground = { c: c, half: half, n: n, h: H };
  PLAN.site = SITE.data.districts.map(function (d) { return { id: d.id, name: d.name, type: d.type, role: VC.role(d), poly: d.poly, note: d.note }; });
  var zone = VC.districts('zone')[0];
  PLAN.zone = zone ? zone.poly : [[-half, -half], [half, -half], [half, half], [-half, half]];
  var wallD = VC.districts('wall')[0];
  VC.wallPoly = wallD ? wallD.poly : null;
  VC.wallChain = VC.wallPoly ? VC.westChain(VC.wallPoly) : null;
  SL.R = new Raster(half, TUNE.cell);
  var R = SL.R, land = 0;
  R.occ.fill(OCC.OUT);
  /* dry ground in the zone, unless too steep to build on (over TUNE.maxSlope: hillsides stay open) */
  land = KCITY.site.zoneRaster(R, PLAN.zone, { dry: 0.6, maxSlope: TUNE.maxSlope, probe: 5 });
  SL.minSpacing = KCITY.site.minSpacing();
  PLAN.zoneLand = land * R.c * R.c;
  SL.note(0, 'site: ' + PLAN.site.length + ' districts, ' + SITE.data.markers.length + ' markers, ' + SITE.data.avenues.length + ' avenues, ' +
    SITE.data.terrain.length + ' ground strokes' + (emb ? ', ' + emb + ' m of avenue edge banked up out of the water' : '') + '; build zone ' + (Math.abs(polyArea(PLAN.zone)) / 1e6).toFixed(2) + ' km2, ' + (PLAN.zoneLand / 1e6).toFixed(2) + ' km2 of it dry land');
};

/* an avenue drawn a little into the water (the owner's avenue along the river) gets a bank under it: the ground is
   raised just enough that the avenue runs on the water's edge, with a short slope down to the water. Deep water
   (a bridge or a causeway's line) is left alone. Edits TERR's delta grid, so the ground, the street passes and
   Voth's own builders all see the same bank. */
VC.embank = function () {
  var G = VC.terrGrid(), run = 0;
  SITE.data.avenues.forEach(function (a) { run += KCITY.ground.bank(G, a.pts, TUNE.embank); });
  return run;
};
/* TERR's delta grid as core/city's ground-delta interface (25-city-site.js) */
VC.terrGrid = function () {
  return { N: TERR.N, cell: TERR.cell, ext: TERR.ext, h: function (x, z) { return TERR.h(x, z); },
    at: function (i, j, k) { return TERR.baseAt(i, j) + TERR.D[k]; }, add: function (k, dv) { TERR.D[k] += dv; } };
};

/* a gate on a slope gets a level pad: the ground under its footprint (the model's own half-sizes, local x along the
   passage, local z across it, plus a margin) is cut and filled to the road's height at its centre, and beyond the
   pad it meets the natural ground at no more than TUNE.wall.padSlope (a cutting uphill, a bank downhill). Without it
   a gate built at its lowest corner is buried on the uphill side (the River Gate, 8 m deep). Edits TERR's delta and
   SL.ground over the touched box, so the ground mesh and every later pass see the pad. Returns the pad's height, or
   null when the footprint is level enough already. */
VC.GATE_SIZE = { RiverGate: [3.9, 16.8], HarborGate: [4.2, 18.1], SpiritGate: [3.6, 15.8] };
VC.levelGate = function (n) {
  var T = TUNE.wall, sz = VC.GATE_SIZE[n.name] || [T.gateTower * 0.56, (n.towerOff || 15) + T.gateTower * 0.56];
  var pad = KCITY.ground.levelPad(VC.terrGrid(), { x: n.gx, z: n.gz, ry: n.ry, hw: sz[0] + T.padMargin, hd: sz[1] + T.padMargin,
    y: Math.max(0.6, TERR.h(n.gx, n.gz)), spread: T.padSpread, slope: T.padSlope });
  if (!pad) return null;
  /* the street passes' sampled ground (SL.ground) over the box the pad touched */
  var R = pad.R, G = SL.ground, gi0 = Math.max(0, Math.floor((n.gx - R + G.half) / G.c)), gi1 = Math.min(G.n - 1, Math.ceil((n.gx + R + G.half) / G.c));
  var gj0 = Math.max(0, Math.floor((n.gz - R + G.half) / G.c)), gj1 = Math.min(G.n - 1, Math.ceil((n.gz + R + G.half) / G.c));
  for (var gj = gj0; gj <= gj1; gj++) for (var gi = gi0; gi <= gi1; gi++) G.h[gj * G.n + gi] = TERR.h(-G.half + gi * G.c, -G.half + gj * G.c);
  n.pad = { y: pad.y, cut: pad.cut, fill: pad.fill };
  return pad.y;
};

/* the wall line: the western edge of the 'wall' polygon, from its northernmost corner to its southernmost */
VC.westChain = function (P) {
  var n = P.length, iN = 0, iS = 0;
  for (var i = 1; i < n; i++) { if (P[i][1] < P[iN][1]) iN = i; if (P[i][1] > P[iS][1]) iS = i; }
  var a = [], b = [];
  for (var k = iN; ; k = (k + 1) % n) { a.push(P[k]); if (k === iS) break; }
  for (var k2 = iN; ; k2 = (k2 - 1 + n) % n) { b.push(P[k2]); if (k2 === iS) break; }
  var mx = function (L) { return L.reduce(function (s, p) { return s + p[0]; }, 0) / L.length; };
  return (mx(a) < mx(b) ? a : b).map(function (p) { return [p[0], p[1]]; });
};
/* outside the wall: east of the wall line (the line runs north to south; its outward normal points east) */
VC.outside = function (p) {
  var C = VC.wallLine || VC.wallChain; if (!C) return false;
  if (p[1] < C[0][1] - 60 || p[1] > C[C.length - 1][1] + 60) return VC.wallPoly ? inPoly(p, VC.wallPoly) : false;
  var bd = Infinity, side = 0;
  for (var i = 1; i < C.length; i++) {
    var a = C[i - 1], b = C[i], d = segDist(p, a, b);
    if (d < bd) { bd = d; side = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]); }
  }
  return side < 0;
};

/* ---------------------------------------------------------------- step 1: landmarks from the markers */
VC.fixed = function (role, spec, c, f, step) {
  var D = SL.dims(spec.key, spec.v); if (!D) return null;
  var o = obb(c, [f[1], -f[0]], D.w / 2, D.d / 2);
  var L = { id: PLAN.lots.length, cls: 'landmark', role: role, key: spec.key, v: spec.v, slot: 0, wealth: 1, x: c[0], z: c[1], y: addPad(o) - 0.1,
            ry: ryFacing(f), w: D.w, d: D.d, h: D.h, lot: o, bo: o, way: -1, side: 0, s: 0, born: step, died: null, civic: true };
  PLAN.lots.push(L); SL.hashLot(L);
  SL.R.stampPoly(obbCorners(obb(c, o.u, o.hw + 3, o.hd + 3)), OCC.HARD, L.id);
  return L;
};
VC.hardSquare = function (x, z, half, ry) { SL.R.stampPoly(obbCorners(obb([x, z], [Math.cos(ry || 0), -Math.sin(ry || 0)], half, half)), OCC.HARD, -1); };
VC.towardAvenue = function (p) {
  var best = null, bd = Infinity;
  SITE.data.avenues.forEach(function (a) { for (var i = 1; i < a.pts.length; i++) { var q = a.pts[i - 1], r = a.pts[i], d = segDist(p, q, r); if (d < bd) { bd = d; var e = V.sub(r, q), t = clamp(V.dot(V.sub(p, q), e) / (V.dot(e, e) || 1), 0, 1); best = V.add(q, V.mul(e, t)); } } });
  return best || [0, 0];
};
SL.pass1 = function () {
  PLAN.landmarks = [];
  var I = VC.marker(/^I$/i);
  if (I) {
    var a = VC.towardAvenue([I.x, I.z]), f = V.norm(V.sub(a, [I.x, I.z]));
    var gar = VC.fixed('garrison', { key: 'voth_garrison', v: 0 }, [I.x, I.z], f, 1);
    var MD = SL.dims('voth_mustering_grounds', 0);
    var mc = V.add([I.x, I.z], V.mul(f, gar.d / 2 + 6 + MD.d / 2));
    var mus = VC.fixed('muster', { key: 'voth_mustering_grounds', v: 0 }, mc, V.mul(f, -1), 1);
    PLAN.landmarks.push(gar, mus);
  }
  /* the Voth-built landmarks: positions here, built by 31-vc-voth.js */
  var isle = function (m, kind) { return VOTH.ISLES.filter(function (q) { return q[4] === kind && Math.hypot(q[0] - m.x, q[1] - m.z) < q[3] * 1.3; })[0]; };
  PLAN.voth = [];
  ['A', 'B', 'C', 'D', 'E'].forEach(function (id) {
    var m = VC.marker(new RegExp('^' + id + '$', 'i')); if (!m) return;
    if (isle(m, 'shrine')) { PLAN.voth.push({ role: 'shrine', id: id, x: m.x, z: m.z, islet: true }); return; }
    var a = VC.towardAvenue([m.x, m.z]);
    PLAN.voth.push({ role: 'shrine', id: id, x: m.x, z: m.z, ry: VC.face(m.x, m.z, a[0], a[1]), rad: 37.8 });
    VC.hardSquare(m.x, m.z, 22);
  });
  var LH = VC.marker(/^LH$/i);
  if (LH) PLAN.voth.push({ role: 'lighthouse', id: 'LH', x: LH.x, z: LH.z, islet: !!isle(LH, 'light') });
  var H = VC.marker(/^HOH$/i);
  VC.hohMarker = H || null;   /* the house of healing is placed once the avenues are down (step 3, VC.placeHealing): at the marker it stood on one */
  var FT = VC.marker(/FUNER/i);
  if (FT) { var T = VOTH.CIDX.Temple; PLAN.voth.push({ role: 'funeraryTemple', id: FT.id, x: FT.x, z: FT.z, ry: VC.face(FT.x, FT.z, T.x, T.z) }); VC.hardSquare(FT.x, FT.z, 40); }
  SL.note(1, (I ? 'garrison castle and mustering ground at I; ' : '') + PLAN.voth.map(function (q) { return q.id + ' ' + q.role + (q.islet ? ' (islet)' : ''); }).join(', '));
};

/* a market pitch (owner, 2026-10-09: "actual market stalls"): the catalog's canopied stall (voth_market_stall, variant 0
   produce or 1 exotic), its stock beside it (crates, baskets, sacks, jars from the generic goods), or now and then a
   seller's goods laid on the ground as before (the captured voth_city_stall_* slabs). Every choice is a KRAND hash of
   the pitch's place (never the draws before it). `ground` is the captured slab the caller drew; ry faces the front. */
VC.marketPitch = function (D, x, y, z, ry, ground) {
  var u = function (s) { return KRAND.unit(KRAND.hash(6601, Math.round(x * 4), Math.round(z * 4), s)); };
  if (typeof FURN_BY_KEY === 'undefined' || !FURN_BY_KEY.voth_market_stall || u(1) < TUNE.market.ground) { D.art.push({ key: ground, x: x, z: z, y: y, ry: ry }); return 'ground'; }
  D.art.push({ key: 'voth_market_stall', v: u(2) < 0.55 ? 0 : 1, x: x, y: y, z: z, ry: ry, furn: true });
  var X = [Math.cos(ry), -Math.sin(ry)], F = [Math.sin(ry), Math.cos(ry)], G = TUNE.market.goods;
  [-1, 1].forEach(function (s, k) {
    if (u(3 + k) > TUNE.market.stock) return;
    var key = G[Math.floor(u(5 + k) * G.length) % G.length]; if (!FURN_BY_KEY[key]) return;
    var off = TUNE.market.side, back = TUNE.market.back * (u(7 + k) - 0.5) * 2;
    D.art.push({ key: key, v: 0, x: x + X[0] * s * off + F[0] * back, y: y, z: z + X[1] * s * off + F[1] * back, ry: ry + (u(9 + k) - 0.5), furn: true });
  });
  return 'stall';
};

/* ---------------------------------------------------------------- step 2: districts */
SL.pass2 = function () {
  var R = SL.R, rs = SL.stream(2);
  PLAN.districts = []; VC.MOOR = []; VC.FH = null;   /* the country's fields come at step 13 */
  PLAN.site.forEach(function (d) {
    var D = { kind: d.role, name: d.name, poly: d.poly, born: 2, art: [] };
    if (d.role === 'park' || d.role === 'plaza') R.stampPoly(d.poly, OCC.GREEN, -1);
    else if (d.role === 'market' || d.role === 'monastery' || d.role === 'funerary') R.stampPoly(d.poly, OCC.HARD, -1);
    if (d.role === 'market') {
      /* stalls on a jittered grid, clear of the edge, facing the middle */
      var c = polyCentroid(d.poly), STALLS = ['voth_city_stall_fruit', 'voth_city_stall_cheese', 'voth_city_stall_exotic', 'voth_city_stall_bread'];
      var xs = d.poly.map(function (p) { return p[0]; }), zs = d.poly.map(function (p) { return p[1]; });
      for (var x = Math.min.apply(null, xs); x < Math.max.apply(null, xs); x += 9) for (var z = Math.min.apply(null, zs); z < Math.max.apply(null, zs); z += 9) {
        var p = [x + rs.rr(-1.5, 1.5), z + rs.rr(-1.5, 1.5)];
        if (!inPoly(p, d.poly) || polyEdgeDist(p, d.poly) < 6 || !rs.chance(0.6)) continue;
        VC.marketPitch(D, p[0], baseH(p[0], p[1]), p[1], Math.atan2(c[0] - p[0], c[1] - p[1]), rs.pick(STALLS));
      }
    }
    if (d.role === 'plaza') { var pc = polyCentroid(d.poly); D.art.push({ key: 'sl_fountain', x: pc[0], z: pc[1], y: baseH(pc[0], pc[1]), ry: 0 }); }
    if (d.role === 'funerary') {
      /* rows of family tombs, stepped tombs and graves, clear of the temple */
      var FT = PLAN.voth.filter(function (q) { return q.role === 'funeraryTemple'; })[0];
      var xs2 = d.poly.map(function (p) { return p[0]; }), zs2 = d.poly.map(function (p) { return p[1]; });
      for (var x2 = Math.min.apply(null, xs2); x2 < Math.max.apply(null, xs2); x2 += 13) for (var z2 = Math.min.apply(null, zs2); z2 < Math.max.apply(null, zs2); z2 += 11) {
        var q = [x2 + rs.rr(-1, 1), z2 + rs.rr(-1, 1)];
        if (!inPoly(q, d.poly) || polyEdgeDist(q, d.poly) < 8 || (FT && Math.hypot(q[0] - FT.x, q[1] - FT.z) < 62) || baseH(q[0], q[1]) < 1) continue;
        var r = rs.rnd();
        D.art.push({ key: r < 0.18 ? 'voth_city_family_tomb' : r < 0.32 ? 'voth_city_stepped_tomb' : 'voth_city_grave', x: q[0], z: q[1], y: baseH(q[0], q[1]), ry: 0 });
      }
    }
    PLAN.districts.push(D);
  });
  VC.buildDistricts();             /* 31-vc-voth.js: monastery, chinampas, harbour quays and piers, river docks, islets, landmarks */
  SL.note(2, PLAN.site.filter(function (d) { return d.role !== 'zone' && d.role !== 'wall'; }).map(function (d) { return d.name; }).join(', ') + '; ' + VC.log2);
};

/* a way laid over something placed before it (a highway, a causeway) takes it down: every standing building whose
   footprint its carriageway (plus `pad`) overlaps is knocked out at `step` */
VC.clearUnder = function (pts, width, step, pad) { return KCITY.site.clearUnder(pts, width, step, pad, VC.keepDeck); };
VC.keepDeck = function (L) { return L.deck; };   /* a canton deck's buildings stand over the water: no way clears them */

/* ---------------------------------------------------------------- step 3: avenues */
/* a ring round a district, kept only where it is dry and not already on an avenue */
VC.addRing = function (ring, step, tag) { return KCITY.site.ring(ring, step, tag, { dry: 0.8 }); };
SL.pass3 = function () {
  var W = TUNE.width.avenue, rings = 0;
  /* the drawn avenues, each loose end joined to another avenue close by, else to a causeway's landing close by */
  var lands = SITE.causeways().map(function (c) {
    var a = c.pts[0], b = c.pts[c.pts.length - 1];
    return baseH(a[0], a[1]) > baseH(b[0], b[1]) ? a : b;
  });
  var av = KCITY.site.avenues(SITE.data.avenues, 3, { snap: TUNE.avenueSnap, landings: lands, landingSnap: TUNE.causewaySnap }), made = av.made, joins = av.joins;
  /* the causeways (the site's, drawn or Voth's): their whole length is theirs, no building on a causeway's deck or its
     landing (owner, 2026-10-09: "a building clipping a causeway") */
  var cw = 0;
  SITE.causeways().forEach(function (c) {
    KCITY.site.blockCorridor(c.pts, (c.width || 46) / 2 + 4);
    cw += VC.clearUnder(c.pts, c.width || 46, 3, 3);
  });
  /* Voth's river bridges: the abutment is no ground for a building, and each end runs on to the nearest avenue
     (owner: "make sure they connect to avenues with an additional short avenue connector") */
  var bridges = 0;
  VOTH.RBRIDGES.forEach(function (b) {
    var d = V.norm([b.bx - b.ax, b.bz - b.az]);
    [[[b.ax, b.az], V.mul(d, -1)], [[b.bx, b.bz], d]].forEach(function (e) {
      var end = e[0], out = e[1], ry = Math.atan2(d[0], d[1]);
      SL.R.stampPoly(obbCorners(obb(end, [Math.cos(ry), -Math.sin(ry)], b.w * 1.1 + 3, b.w * 1.1 + 3)), OCC.HARD, -1);   /* + 3: a lot may touch reserved ground by its inset, and the raster samples cell middles */
      var ap = V.add(end, V.mul(out, b.w * 1.1 + TUNE.bridgeApproach)), q = VC.nearestWayPt(ap, ['avenue']);
      var pts = [V.add(end, V.mul(out, b.w * 0.6)), ap];
      if (q && q.d > W * 0.6 && q.d < TUNE.bridgeSnap) pts.push(q.p);
      SL.addWay('avenue', pts, 3, { tag: 'bridge approach' }); bridges++;
    });
  });
  /* rings round every park and market district (not joined to anything, per the owner) */
  PLAN.site.forEach(function (d) {
    if (d.role !== 'park' && d.role !== 'market') return;
    rings += VC.addRing(offsetConvex(d.poly, TUNE.ringGap + W / 2, 6), 3, 'ring ' + d.name);
  });
  /* the house of healing, now the avenues are down and before any street (owner, 2026-10-09: "move it out of the avenue") */
  var hoh = VC.placeHealing();
  /* the clan compounds, now the avenues are down (33-vc-country.js) */
  var clans = VC.clanCompounds(3);
  SL.note(3, made + ' avenues as drawn, ' + joins + ' joins to avenues and causeways, ' + bridges + ' bridge approaches, ' + rings + ' ring runs round the parks and markets; ' + hoh + '; ' + clans);
};

/* the house of healing (Voth's houseOfHealing, 65j: a 112 m square cloister with a gate on every side and its plinth's
   steps), at step 3: the free spot nearest the owner's HOH marker where its whole footprint, a margin round it, is on
   open dry ground (no avenue, ring, causeway or landmark), not too steep for its plinth, and fronting an avenue within
   TUNE.healing.front of its wall; a gate turned to that avenue, and a paved forecourt from the gate to the avenue's edge */
VC.placeHealing = function () {
  var H = VC.hohMarker; if (!H) return 'no HOH marker';
  var K = TUNE.healing, R = SL.R, best = null;
  var footOk = function (c, ry) {
    var u = [Math.cos(ry), -Math.sin(ry)], v = [Math.sin(ry), Math.cos(ry)], lo = Infinity, hi = -Infinity, h = K.half + K.pad;
    for (var a = -h; a <= h; a += 6) for (var b = -h; b <= h; b += 6) {
      var p = V.add(c, V.add(V.mul(u, a), V.mul(v, b))), g = baseH(p[0], p[1]); if (g < 1) return false;
      lo = Math.min(lo, g); hi = Math.max(hi, g);
      if (R.idx(p[0], p[1]) >= 0) { var o = R.at(p[0], p[1]); if (o !== OCC.FREE && o !== OCC.RESERVE) return false; }
      if (VC.inCanton(p, 4)) return false;
    }
    return hi - lo <= K.relief;
  };
  /* out from the marker in rings (core/city KCITY.prim.huntNear): the first spot that fronts an avenue and takes the footprint */
  best = KCITY.prim.huntNear([H.x, H.z], { step: 8, reach: K.reach, minN: 8, arc: 10 }, function (c) {
    var q = VC.nearestWayPt(c, ['avenue']);
    if (!q || q.d > K.half + K.front + q.way.w / 2) return null;
    var f = V.norm(V.sub(q.p, c)), ry = Math.atan2(f[0], f[1]) - Math.PI / 2;   /* the builder's local +x (a gate) toward the avenue */
    return footOk(c, ry) ? { c: c, ry: ry, q: q, f: f } : null;
  });
  if (!best) return 'the house of healing: no free ground within ' + K.reach + ' m of its marker';
  var c = best.c;
  PLAN.voth.push({ role: 'healing', id: 'HOH', x: c[0], z: c[1], ry: best.ry, moved: +V.dist(c, [H.x, H.z]).toFixed(0) });
  VC.hardSquare(c[0], c[1], K.half + K.pad, best.ry);
  /* the forecourt: from the gate's steps to the avenue's edge, as wide as the gate's flight */
  var gate = V.add(c, V.mul(best.f, K.half)), edge = V.sub(best.q.p, V.mul(best.f, best.q.way.w / 2)), L = V.dist(gate, edge), mid = V.lerp(gate, edge, 0.5);
  if (L > 1) SL.R.stampPoly(obbCorners(obb(mid, V.perp(best.f), K.forecourt / 2 + 2, L / 2)), OCC.HARD, -1);
  VC.capture('healing', 3, function () { VC.healingModel(c, best.ry, best.f, L > 1 ? { mid: mid, L: L } : null); });
  return 'the house of healing ' + Math.round(V.dist(c, [H.x, H.z])) + ' m from its marker, off ' + (best.q.way.tag || 'an avenue');
};

/* ---------------------------------------------------------------- step 4: highways */
/* A* over a 20 m grid of the edited ground (Voth's own beyond the edits): slope dear, water impassable; the river
   highway keeps near the river, the bay highway near the shore. Each starts at the avenue point furthest out in its
   direction and ends at the reach. */
SL.pass4 = function () {
  var c = 20, half = TUNE.highwayReach + 400, made = 0, avPts = [];
  var G = KCITY.site.highwayGrid({ c: c, half: half, h: function (x, z) { return Math.abs(x) < TUNE.rasterHalf && Math.abs(z) < TUNE.rasterHalf ? baseH(x, z) : VOTH.terrainHe(x, z); } });
  var zc = polyCentroid(PLAN.zone);
  SITE.data.avenues.forEach(function (a) { avPts = avPts.concat(a.pts); });
  TUNE.highways.forEach(function (hw) {
    var t = hw.deg * Math.PI / 180, dir = [Math.cos(t), -Math.sin(t)];
    var st = KCITY.site.farthest(avPts, zc, dir);
    /* the river highway keeps near the river, the bay highway near the shore */
    var pull = hw.river ? KCITY.site.pullField(G, KCITY.site.lineDist(VOTH.RIVER), 0.006, 150) : hw.shore ? KCITY.site.pullField(G, function (x, z) { return VOTH.landDist(x, z); }, 0.005, 160) : null;
    /* a highway that must come by an elephant bug station (owner: "make sure the highway comes by S11 and S10") runs to
       the ring of ground just beside it first, so the station stands at the roadside, not on the road */
    var via = hw.via ? SITE.station(hw.via) : null;
    var r = KCITY.site.highway(G, { from: st, centre: zc, dir: dir, reach: TUNE.highwayReach, pull: pull, via: via, viaNear: TUNE.viaNear });
    if (r.viaFailed) SL.note(4, 'the ' + hw.name + ' highway cannot reach ' + hw.via);
    if (!r.pts) { SL.note(4, 'no route for the ' + hw.name + ' highway'); return; }
    /* a verge either side: no building along a highway (owner, 2026-10-09); streets may still cross it */
    var hwy = KCITY.site.layHighway(r.pts, 4, hw.name, { pad: 2, skip: VC.keepDeck, verge: TUNE.verge }); made++;
    if (via) { var nv = hwy.F.nearest([via.x, via.z]); hwy.via = { id: hw.via, d: Math.round(nv.d) }; }
  });
  /* a station off every highway gets its own road to the city here (S12), so it stands off it like the rest */
  VC.roadHash(); var sr = [];
  TUNE.country.roadsFor.forEach(function (id) { var r = VC.roadToCity(id, 4); if (r) sr.push(r); });
  SL.note(4, made + ' highways: ' + TUNE.highways.map(function (h) { return h.name + (h.via ? ' (by ' + h.via + ')' : ''); }).join(', ') + (sr.length ? '; ' + sr.join('; ') : '') + '; ' + VC.placeStations(4));
};

/* ---------------------------------------------------------------- step 5: the wall
   Voth's rule (30d-wall-stations.js, 60-land.js 18. CURTAIN WALL): towers stand at the wall's vertices; gates
   where a major way crosses it, the three named gates (harbour, spirit, river) at the crossing nearest their quad
   (here: the owner's markers F, G, H), other crossings get generic gates unless near another; health is drawn
   (towers and generic gates intact, ruined or destroyed; named gates always intact); each node takes a site near
   its ideal spot (facadeFindGateSite); segments between neighbours take the lower of their ends' health. Here the
   line is the western edge of the 'wall' polygon, pushed clear of any avenue running beside it. */
SL.pass5 = function () {
  if (!VC.wallChain) { SL.note(5, 'no wall polygon'); return; }
  var T = TUNE.wall, ways = PLAN.ways.filter(function (w) { return w.cls === 'avenue' || w.cls === 'highway'; });
  /* the records (core/city KCITY.site.wall): the line every towerGap, pushed clear of the avenues beside it (outward:
     east); gates where avenues and highways cross it, the named three (harbour, spirit, river) at the crossing nearest
     the owner's markers F, G, H; towers at the vertices; every node whole (owner, 2026-10-09: "make the wall un-ruined") */
  var named = [];
  [['F', 'HarborGate'], ['G', 'SpiritGate'], ['H', 'RiverGate']].forEach(function (g) {
    var m = VC.marker(new RegExp('^' + g[0] + '$', 'i')); if (m) named.push({ x: m.x, z: m.z, marker: g[0], name: g[1] });
  });
  var W = KCITY.site.wall(VC.wallChain, ways, { towerGap: T.towerGap, clear: T.clear, gateFind: T.gateFind, named: named, side: 1, health: 2 });
  var C = VC.wallLine = W.line, gates = W.gates, nodes = W.nodes;
  VC.wall = PLAN.wallRec = W;   /* PLAN.wallRec: the records core/city exports (KCITY.exportWall) */
  VC.buildWall();                 /* 31-vc-voth.js: sites, towers, gates and segments, as Voth builds them */
  /* the raster: the wall is no ground for lots or streets, except through its gates; anything placed before it on its
     line (a quay warehouse) comes down */
  KCITY.site.stampWall(VC.wall, { thick: T.thick, step: 5, gateTower: T.gateTower, skip: VC.keepDeck });
  var live = nodes.filter(function (n) { return !n.skip && !n.deleted; });
  SL.note(5, 'wall ' + Math.round(plLen(C)) + ' m on the west edge of the wall polygon; gates: ' + gates.map(function (g) { return g.name === 'Gate' ? 'gate' : g.name + (g.crossed ? '' : ' (no way crosses there)'); }).join(', ') +
    '; ' + live.filter(function (n) { return n.kind === 'tower'; }).length + ' towers, ' + VC.wall.segs.length + ' standing segments' +
    VC.wall.nodes.filter(function (n) { return n.pad; }).map(function (n, i) { return (i ? ', ' : '; level pads: ') + (n.name === 'Gate' ? 'gate' : n.name) + ' at ' + n.pad.y.toFixed(1) + ' m (cut ' + n.pad.cut.toFixed(1) + ', fill ' + n.pad.fill.toFixed(1) + ')'; }).join(''));
};
