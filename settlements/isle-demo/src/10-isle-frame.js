/* ============================== 0. A TOWN'S FRAME, AND THE GROUND VOTH'S EDITOR READS ============================== */
/* [G data] The planner works on one town at a time, in that town's own frame: metres, x east, z south, the origin at
   the town's settlement point in the open world (WORLD_DATA.meta.settlements), and heights above the sea there (the
   Ring Sea at 0). frame {town, x, z, sea}: x, z the origin in the open world's metres, sea the water's level there; a
   point (lx, lz, ly) of the site is (x + lx, z + lz) in the world, at ly + sea. The site file keeps each town's frame
   with its drawing, so the city plan (P6) and the bake (P8) put it back where it was drawn.

   VOTH is what Voth's site fragments (settlements/voth/targets/voth-site 10, 50, 55, read in place by build.py) ask
   of Voth: the ground (terrainH, groundTone, landDist, SEA, HW) made from the open world's fields (WORLD.H, WORLD.at,
   WORLD.ground: the same ground the world draws, the isle's coast included), the causeway heights, primitive
   collectors for the causeways the owner draws, and Voth's own things (cantons, piers, districts) as empty lists.
   CANT stands in for Voth's canton plan (20-site-cantons.js, not on this page): no cantons, so no canton ends. */
var ISLE = { TOWNS: ['Kautoa', 'Valapo'], F: null };
ISLE.settlement = function (name) { return WORLD_DATA.meta.settlements.filter(function (s) { return s.name === name; })[0] || null; };
/* the water's level nearest (x, z): rings out from the point until one meets water (the Ring Sea is one level) */
ISLE.seaNear = function (x, z) {
  for (var r = 0; r <= 12000; r += 250) {
    var n = r === 0 ? 1 : Math.max(8, Math.round(r / 250) * 4);
    for (var k = 0; k < n; k++) { var a = k / n * Math.PI * 2, w = WORLD.lakeWater(x + Math.cos(a) * r, z + Math.sin(a) * r); if (w > -1e8) return w; }
  }
  return WORLD.H(x, z) - 2;
};
/* a frame's origin moved off the settlement point (metres): Valapo's point (one 2 km pixel of the scale model) lies
   5.2 km inland, so its square held no sea; the owner (2026-10-15) had it moved toward its coast, north-north-west,
   until the shore is 1.6 km from the origin (as Kautoa's is 1.8 km). The point itself stays inside the square */
ISLE.SHIFT = { Valapo: [-1400, -3400] };
/* a town's frame: the saved one when the site file has it (so a drawing never moves), else made from the world */
ISLE.frame = function (name, saved) {
  var s = ISLE.settlement(name);
  if (!s) throw new Error('no settlement named ' + name + ' in the region');
  var ok = saved && isFinite(saved.x) && isFinite(saved.z) && isFinite(saved.sea), d = ISLE.SHIFT[name] || [0, 0], x = s.x + d[0], z = s.z + d[1];
  ISLE.F = ok ? { town: name, x: +saved.x, z: +saved.z, sea: +saved.sea } : { town: name, x: x, z: z, sea: +ISLE.seaNear(x, z).toFixed(2) };
  ISLE.LD = null;
  return ISLE.F;
};
/* the site file: {site: 'isle-demo', version, towns: {name: {frame, ...the town's site}}} */
ISLE.townSite = function (file, name) { return file && file.towns && file.towns[name] ? file.towns[name] : null; };
ISLE.toWorld = function (lx, lz) { return [ISLE.F.x + lx, ISLE.F.z + lz]; };

var VOTH = (function () {
  var SEA = 0, HW = 5400;                    /* Voth's terrain extent (its WORLD/2): the warped ground reaches ~6.8 km */
  var RLAND = 2.6, CWAY = 6, DECK = 8;       /* a drawn mole's fill, a drawn causeway's deck over water */
  var TONES = [0x9c8f74], PRIMS = [], seed = 1;
  function terrainH(x, z) { var F = ISLE.F; return WORLD.H(F.x + x, F.z + z) - F.sea; }
  /* the world's own ground colour (linear) as Voth's 0-255 sRGB */
  var GT = [0, 0, 0, 0], enc = function (c) { return 255 * Math.pow(Math.max(0, Math.min(1, c)), 1 / 2.2); };
  function groundTone(x, z) { var F = ISLE.F, X = F.x + x, Z = F.z + z; WORLD.ground(X, Z, WORLD.at(X, Z), GT); return [enc(GT[0]), enc(GT[1]), enc(GT[2])]; }
  /* the distance to the shore, + inland, - out to sea: a 40 m chamfer grid over the planning square, made on first use */
  var LC = 40, LE = 4000, LN = 2 * LE / LC + 1;
  function landGrid() {
    var land = new Uint8Array(LN * LN), dIn = new Float32Array(LN * LN), dOut = new Float32Array(LN * LN), i, j, k;
    for (j = 0; j < LN; j++) for (i = 0; i < LN; i++) land[j * LN + i] = terrainH(-LE + i * LC, -LE + j * LC) > SEA ? 1 : 0;
    var pass = function (D, inside) {
      for (k = 0; k < D.length; k++) D[k] = land[k] === inside ? 1e9 : 0;
      var S2 = Math.SQRT2, rel = function (a, b, c) { if (D[b] + c < D[a]) D[a] = D[b] + c; };
      for (j = 0; j < LN; j++) for (i = 0; i < LN; i++) { k = j * LN + i; if (i) rel(k, k - 1, 1); if (j) { rel(k, k - LN, 1); if (i) rel(k, k - LN - 1, S2); if (i < LN - 1) rel(k, k - LN + 1, S2); } }
      for (j = LN - 1; j >= 0; j--) for (i = LN - 1; i >= 0; i--) { k = j * LN + i; if (i < LN - 1) rel(k, k + 1, 1); if (j < LN - 1) { rel(k, k + LN, 1); if (i < LN - 1) rel(k, k + LN + 1, S2); if (i) rel(k, k + LN - 1, S2); } }
    };
    pass(dIn, 1); pass(dOut, 0);
    return { land: land, dIn: dIn, dOut: dOut };
  }
  function landDist(x, z) {
    if (!ISLE.LD) ISLE.LD = landGrid();
    var i = Math.max(0, Math.min(LN - 1, Math.round((x + LE) / LC))), j = Math.max(0, Math.min(LN - 1, Math.round((z + LE) / LC))), k = j * LN + i;
    var d = ISLE.LD.land[k] ? ISLE.LD.dIn[k] : -ISLE.LD.dOut[k];
    return Math.max(-2 * LE, Math.min(2 * LE, d * LC));          /* no shore in the square: 8 km, "beyond reach" */
  }
  /* primitives, as Voth's builders push them (base at y; drawn by VIEW.primMeshes) */
  function BOX(x, y, z, w, h, d, ry, c, f) { PRIMS.push(['box', x, y, z, w, h, d, ry == null ? 0 : ry, c, f]); }
  function FR8(x, y, z, w, h, d, ry, c, f) { PRIMS.push(['fr8', x, y, z, w, h, d, ry == null ? 0 : ry, c, f]); }
  function FR3(x, y, z, w, h, d, ry, c, f) { PRIMS.push(['fr3', x, y, z, w, h, d, ry == null ? 0 : ry, c, f]); }
  function CYL(x, y, z, r, h, ry, c, f) { PRIMS.push(['cyl', x, y, z, r, h, r, ry == null ? 0 : ry, c, f]); }
  function shade(hex, f) { var g = function (s) { return Math.max(0, Math.min(255, Math.round((hex >> s & 255) * (1 + f)))); }; return g(16) << 16 | g(8) << 8 | g(0); }
  function reseed(s) { seed = (s >>> 0) || 1; }
  function rr(a, b) { seed = (seed * 1664525 + 1013904223) >>> 0; return a + (b - a) * seed / 4294967296; }
  /* a drawn causeway's segment, in place of Voth's span() and reclaimedCauseway(): a plain deck from end to end (a
     bridge, on a low skirt) or a fill from the sea bed to RLAND (a mole). Stand-ins: the islanders' own jetties and
     causeways come from the Islanders kit in the city plan (P6) */
  function seg(ax, az, bx, bz) { var dx = bx - ax, dz = bz - az; return { x: (ax + bx) / 2, z: (az + bz) / 2, L: Math.hypot(dx, dz), ry: Math.atan2(dx, dz) }; }
  function span(ax, az, ay, bx, bz, by, w, col) { var s = seg(ax, az, bx, bz), lo = Math.min(ay, by); BOX(s.x, lo - 1.2, s.z, w, Math.abs(ay - by) + 1.2, s.L, s.ry, col); }
  function reclaimedCauseway(ax, az, bx, bz, w, tone) { var s = seg(ax, az, bx, bz); BOX(s.x, -4, s.z, w, RLAND + 4, s.L + w * 0.5, s.ry, tone); }
  return {
    terrainH: terrainH, groundTone: groundTone, landDist: landDist, SEA: SEA, HW: HW, RLAND: RLAND, CWAY: CWAY, DECK: DECK, TONES: TONES,
    PRIMS: PRIMS, BOX: BOX, FR8: FR8, FR3: FR3, CYL: CYL, span: span, reclaimedCauseway: reclaimedCauseway, shade: shade, reseed: reseed, rr: rr,
    rectFrus: null,                          /* a THREE geometry: set by 56-isle-tools.js */
    CANTONS: [], CIDX: {}, CPIERS: [], RBRIDGES: [], SPANS: [], CAUSEWAYS: [], DISTRICTS: []
  };
})();

var CANT = {
  planned: true, spans: [], prims: [], flights: [], falls: [], ends: [], walkOn: false,
  relayCauseways: function (L) { return L.map(function (l) { return { id: l.id, name: l.name, kind: l.kind, width: l.width, pts: l.pts, ends: [null, null] }; }); },
  drawFlights: function () { }, walkCauseway: function () { }, drawSpan: function () { }, drawSpiral: function () { }
};
