/* ============================== 5g. THE FLORA: THE SOUTH-WEST BAY BIOME ON THE CITY ============================== */
/* [G data] The swbay kit (biomes/swbay on core/biome, bundled by build.py) grows here (owner, 2026-10-09):
   - in the city's parks, its jungle: small hypertrees (build.py keeps the canopy ceiling low, SWBAY_TEMPLE_H), cap-trees,
     fan-crowns, tree ferns, splay shrubs and the floor under them;
   - in the environs, its savannah: baobab stands, umbrella monkey puzzles and thorns, dragon trees, parasol mushrooms,
     dry grass.
   The kit zones itself from the host's climate fields (BIOME-API.md), so the city hands it a park field (jungle: wet,
   low upland) and elsewhere a dry upland (the savannah). Where anything may root is the MASK, rasterised once on its
   own grid (no canvas pixels): 0 on water and anything built or worked (streets, lanes, highways, lots, fields, the
   wall, plazas and markets, the works and farm districts, the orchards, the islets' landmarks); inside the wall only the
   parks; outside it the natural ground. This fragment only builds the data (VC.flora); the host binds it to BIO and
   builds (55-vc-host.js VC.drawFlora). */

VC.FLORA_DENY = ['monastery', 'funerary', 'mines', 'quarry', 'farms', 'mushfarm', 'harbor', 'industry', 'warehouse', 'riverport', 'clan', 'market', 'plaza'];
VC.floraMask = function () {
  var F = TUNE.flora, G = Object.create(Raster.prototype);
  G.half = F.half; G.c = F.cell; G.n = Math.ceil(2 * F.half / F.cell);
  var N = G.n * G.n, M = new Uint8Array(N), P = new Uint8Array(N), R = SL.R;
  /* the ground: water roots nothing; inside the city's raster, only ground the plan left open, and inside the wall none */
  for (var j = 0; j < G.n; j++) for (var i = 0; i < G.n; i++) {
    var x = G.cx(i), z = G.cx(j), k = j * G.n + i;
    if (baseH(x, z) < 0.6) continue;
    var rk = R.idx(x, z);
    if (rk >= 0) {
      var c = R.occ[rk];
      if (c !== OCC.FREE && c !== OCC.OUT) continue;
      if (inPoly([x, z], PLAN.zone) && !VC.outside([x, z])) continue;
    }
    M[k] = 255;
  }
  /* the parks: open again inside the wall, and marked so the fields can make them jungle */
  var parks = PLAN.greens.filter(function (g) { return g.kind === 'park'; }).map(function (g) { return g.poly; })
    .concat(VC.districts('park').map(function (d) { return d.poly; }));
  parks.forEach(function (poly) { G.eachInPoly(poly, function (k, i, jj) { if (baseH(G.cx(i), G.cx(jj)) >= 0.6) { M[k] = 255; P[k] = 1; } }); });
  /* everything built or worked */
  var zero = function (k) { M[k] = 0; };
  PLAN.site.forEach(function (d) { if (VC.FLORA_DENY.indexOf(d.role) >= 0) G.eachInPoly(d.poly, zero); });
  PLAN.greens.forEach(function (g) { if (g.kind !== 'park') G.eachInPoly(g.poly, zero); });
  (PLAN.fields || []).forEach(function (f) { G.eachInPoly(f.poly || obbCorners(f.bo), zero); });
  PLAN.lots.forEach(function (L) { if (L.died == null && L.bo) G.eachInPoly(obbCorners(VC.grow(L.bo, F.lotPad)), zero); });
  PLAN.ways.forEach(function (w) { for (var s = 1; s < w.pts.length; s++) G.eachNearSeg(w.pts[s - 1], w.pts[s], w.w / 2 + F.roadPad, zero); });
  if (VC.wall) VC.wall.segs.forEach(function (sg) { G.eachNearSeg([sg.ax, sg.az], [sg.bx, sg.bz], TUNE.wall.thick / 2 + F.roadPad, zero); });
  if (TUNE.country.orchard) G.eachInPoly(TUNE.country.orchard.poly, zero);
  (PLAN.voth || []).forEach(function (q) { if (q.x != null) G.eachNearSeg([q.x, q.z], [q.x, q.z], F.landmarkClear, zero); });
  (PLAN.lamps || []).forEach(function (l) { var k = G.idx(l.x, l.z); if (k >= 0) M[k] = 0; });
  (VC.furnPlaced || []).forEach(function (o) { G.eachInPoly(obbCorners(VC.grow(o, 1)), zero); });
  var open = 0, park = 0; for (var q = 0; q < N; q++) { if (M[q]) open++; if (M[q] && P[q]) park++; }
  return { G: G, M: M, P: P, open: open * G.c * G.c, park: park * G.c * G.c };
};
VC.flora = function () {
  var F = TUNE.flora, D = VC.floraMask(), G = D.G, M = D.M, P = D.P;
  /* small hypertrees: the kit scales its canopy species' heights with the ceiling, not their crowns and boles; scale
     those too, once, by F.crownK of the same ratio (the kit's own data, adjusted by the world that hosts it) */
  if (typeof SWBAY !== 'undefined' && !SWBAY._vcScaled) {
    var k = Math.pow(SWBAY.TEMPLE_H / 110, F.crownK);
    SWBAY.SPECIES.forEach(function (S) { if (['prismgum', 'baobab', 'captree', 'fancrown', 'ironbark'].indexOf(S.key) >= 0) { S.crownR = S.crownR.map(function (v) { return v * k; }); S.rb = S.rb.map(function (v) { return v * k; }); } });
    SWBAY._vcScaled = k;
  }
  var at = function (A, x, z) { var k = G.idx(x, z); return k < 0 ? 0 : A[k]; };
  /* the LOD spine: the city's parks and a lattice over the build zone, where the viewer mostly is */
  var spine = [];
  VC.districts('park').forEach(function (d) { spine.push(polyCentroid(d.poly)); });
  var zb = PLAN.zone.reduce(function (b, p) { return [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])]; }, [1e9, 1e9, -1e9, -1e9]);
  for (var x = zb[0]; x <= zb[2]; x += F.spine) for (var z = zb[1]; z <= zb[3]; z += F.spine) if (inPoly([x, z], PLAN.zone)) spine.push([x, z]);
  /* and the environs: a coarser lattice over the open country, where enough of a cell may root */
  var E = F.spineCountry, h = F.half - E / 2;
  for (var ex = -h; ex <= h; ex += E) for (var ez = -h; ez <= h; ez += E) {
    if (inPoly([ex, ez], PLAN.zone)) continue;
    var n = 0; for (var a = -2; a <= 2; a++) for (var b = -2; b <= 2; b++) if (at(M, ex + a * E / 5, ez + b * E / 5)) n++;
    if (n >= 8) spine.push([ex, ez]);
  }
  VC.FLORA = {
    mask: function (x, z) { return at(M, x, z) / 255; },
    park: function (x, z) { return at(P, x, z) === 1; },
    fields: {
      wet: function (x, z) { return at(P, x, z) ? F.park.wet : F.sav.wet; },
      upland: function (x, z) { return at(P, x, z) ? F.park.upland : F.sav.upland; },
      salt: function () { return 0; },
      flow: function () { return 0; }
    },
    obstacles: (PLAN.voth || []).filter(function (q) { return q.x != null; }).map(function (q) { return { x: q.x, z: q.z, r: F.landmarkClear, y0: -10, y1: 200 }; }),
    spine: spine, center: [(zb[0] + zb[2]) / 2, (zb[1] + zb[3]) / 2], R: F.R, quality: F.quality
  };
  SL.note(SL.LAST, 'flora (swbay): ' + (D.open / 1e6).toFixed(2) + ' km2 where plants may root, ' + (D.park / 1e4).toFixed(1) + ' ha of it park jungle, the rest savannah; ' +
    spine.length + ' LOD spine points');
  return VC.FLORA;
};
