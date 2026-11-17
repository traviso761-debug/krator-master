/* ==================== kits/lizardmen/settle 82: a Lizardmen village's site from its spec (LZV_SITE, [G data]) ==================== */
/* The Lizardmen's villages after Gila (core/simulation/PLAN-LIZARDMEN.md step 7; the owner, 2026-11-17: "implement the lizardmen
   settlements"). Gila's own site (settlements/gila/src/89g-gl-site.js, 2026-11-16) made general: a town page lists this file
   (its settlement.json "core") after its spec (src/81-<p>-spec.js: var LZV_SPEC) and its baked ground (gen/69g-lzv-ground.js:
   var LZV_GROUND), and gets:
     1. the ground: LZV_GROUND decoded, graded where the spec says (`grade`: the nest court, a works' bench, a terrace),
        registered in KDRAWN (near and far), and terrainH reading the drawn triangles, so placement, the walk and the eye agree;
     2. ONE rhombic squared-spiral street (75 and 105 degree corners; each winding `ratio` times the depth of the one inside it;
        its axes along the ground's contour at the pin, or `spiral.axis` degrees), and the ley line: a straight way from the
        nest court aimed at the cluster's reliquary (`ley.to`, its 5.1 pixel), "the one straight thing in the town";
     3. the blocks between the spiral's arms fronted on their INNER street only (KCITY.courts.edgeRun and KCITY.courts.place
        on a KCITY.create instance: core/city's own primitives), so every door faces the nest hall; the spec's special halls
        first, then the castes' dwellings by winding (`pools`), Mohenjo-daro brick wells (gl-well) in the blocks' outer halves;
     4. the court (the nest hall, the bells, the paired and the turned stelae), the mouth (the mustering ground, the war camp's
        tents, a lookout), the country (fields from kits/crops on flat ground in the spec's direction, farms, windmills, herds,
        the spec's works and lookouts), and an outwork on core/hamlet's Lizardmen row (`hamlet`) when the spec has one;
     5. the census by caste (the dwellings' holds: settlements/gila/PLAN.md section 3) and the checks the verify reads: the
        spiral's corner angles and winding depths, every door inward, no two buildings overlapping, each seated on a plinth.
   Plain data and plain functions: no three.js, no DOM. The world fragment (90w-lzv-world.js) draws it. */
var LZV_SITE = (function () {
  var S = LZV_SPEC, GR = LZV_GROUND, SEED = S.seed, RATIO = S.spiral.ratio == null ? 1.25 : S.spiral.ratio;
  var lzD = function (x, d) { return x == null ? d : x; };
  var sm = function (a, b, v) { var t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  var LAKE_Y = S.lake ? S.lake.level : -1e9;

  /* ---------------------------------------------------------------- 1. the ground */
  function decGrid(o) {
    var s = atob(o.b64), n = s.length >> 1, a = new Float32Array(n), i, v;
    for (i = 0; i < n; i++) { v = s.charCodeAt(2 * i) | (s.charCodeAt(2 * i + 1) << 8); if (v > 32767) v -= 65536; a[i] = o.base + v * o.unit; }
    return a;
  }
  var N = GR.near, F = GR.far, modelNear = decGrid(N), farRaw = decGrid(F), nearH = new Float32Array(modelNear), farH = new Float32Array(farRaw);
  function bil(G, arr, x, z) {
    var u = Math.min(G.nx - 1.0001, Math.max(0, (x - G.x0) / G.step)), v = Math.min(G.nz - 1.0001, Math.max(0, (z - G.z0) / G.step));
    var i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j, k = j * G.nx + i;
    return (arr[k] * (1 - fu) + arr[k + 1] * fu) * (1 - fv) + (arr[k + G.nx] * (1 - fu) + arr[k + G.nx + 1] * fu) * fv;
  }
  function modelH(x, z) { return (x >= N.x0 && x <= N.x1 && z >= N.z0 && z <= N.z1) ? bil(N, modelNear, x, z) : bil(F, farRaw, x, z); }
  var pinModelY = modelH(0, 0);
  /* the grades: each {x, z, r0, r1 (the blend's start and end, m), to ('pin': the pin's height; 'self': its own centre's; a number),
     clamp (most it moves, m; default none)}; the nest court's is the first unless the spec says otherwise */
  var grades = (S.grade || [{ x: 0, z: 0, r0: 26, r1: 56, to: 'pin', clamp: 2.1, w: 0.88 }]).map(function (g) {
    var to = g.to === 'pin' ? pinModelY : g.to === 'self' ? modelH(g.x, g.z) : g.to; return Object.assign({}, g, { y: to }); });
  (function gradeNear() {
    var ix, iz, x, z, y, k, g, d, w, dy;
    for (iz = 0; iz < N.nz; iz++) for (ix = 0; ix < N.nx; ix++) {
      x = N.x0 + ix * N.step; z = N.z0 + iz * N.step; y = nearH[iz * N.nx + ix];
      for (k = 0; k < grades.length; k++) { g = grades[k]; d = Math.hypot(x - g.x, z - g.z); if (d >= g.r1) continue;
        w = (1 - sm(g.r0, g.r1, d)) * lzD(g.w, 1); dy = g.y - y; if (g.clamp != null) dy = Math.max(-g.clamp, Math.min(g.clamp, dy)); y += w * dy; }
      nearH[iz * N.nx + ix] = y;
    }
    /* the coarse far grid sunk strictly inside the near one, so it never pokes through */
    for (iz = 0; iz < F.nz; iz++) for (ix = 0; ix < F.nx; ix++) {
      x = F.x0 + ix * F.step; z = F.z0 + iz * F.step;
      if (x > N.x0 + F.step && x < N.x1 - F.step && z > N.z0 + F.step && z < N.z1 - F.step) farH[iz * F.nx + ix] -= 14;
    }
  })();
  KDRAWN.clear();
  var drawnNear = KDRAWN.add(KDRAWN.grid({ x0: N.x0, z0: N.z0, dx: N.step, dz: N.step, nx: N.nx - 1, nz: N.nz - 1, h: nearH }));
  var drawnFar = KDRAWN.add(KDRAWN.grid({ x0: F.x0, z0: F.z0, dx: F.step, dz: F.step, nx: F.nx - 1, nz: F.nz - 1, h: farH }));
  function groundH(x, z) { var d = drawnNear.h(x, z); if (d !== null) return d; var df = drawnFar.h(x, z); return df !== null ? df : bil(F, farRaw, x, z); }
  terrainH = groundH;
  function slopeAt(x, z, r) { r = r || 20; return Math.hypot(groundH(x + r, z) - groundH(x - r, z), groundH(x, z + r) - groundH(x, z - r)) / (2 * r); }

  /* ---------------------------------------------------------------- 2. the rhombic squared spiral */
  var th1;
  if (S.spiral.axis != null) th1 = S.spiral.axis * Math.PI / 180;
  else { var gx0 = (modelH(120, 0) - modelH(-120, 0)) / 240, gz0 = (modelH(0, 120) - modelH(0, -120)) / 240;
    th1 = (Math.abs(gx0) + Math.abs(gz0) < 1e-4) ? 0 : Math.atan2(-gx0, gz0); }   /* the level contour at the pin */
  var e1 = [Math.cos(th1), Math.sin(th1)], th2 = th1 - 105 * Math.PI / 180, e2 = [Math.cos(th2), Math.sin(th2)], SIN75 = Math.sin(75 * Math.PI / 180);
  function skewPt(a, b) { return [a * e1[0] + b * e2[0], a * e1[1] + b * e2[1]]; }
  var detSkew = e1[0] * e2[1] - e1[1] * e2[0];
  function toSkew(x, z) { return [(x * e2[1] - z * e2[0]) / detSkew, (e1[0] * z - e1[1] * x) / detSkew]; }
  var WIND = lzD(S.spiral.windings, 5), R_COURT = lzD(S.spiral.court, 46), Q_STEP = Math.pow(RATIO, 0.25), P0_SKEW = lzD(S.spiral.depth0, 36) / SIN75;
  var C_SPIRAL = P0_SKEW / (Math.pow(Q_STEP, 4) - 1), NSEG = 4 * WIND + 6, LASTR = 4 * WIND + 3;
  function rAt(m) { return m < 0 ? R_COURT : R_COURT + C_SPIRAL * (Math.pow(Q_STEP, m + 1) - 1); }
  var spiralSkew = [[-R_COURT, -R_COURT]];
  (function () { var cur = [-R_COURT, -R_COURT], m, side, rm;
    for (m = 0; m < NSEG; m++) { side = m % 4; rm = m <= LASTR ? rAt(m) : rAt(LASTR) + lzD(S.spiral.mouthExtra, 18);
      if (side === 0) cur = [rm, cur[1]]; else if (side === 1) cur = [cur[0], rm]; else if (side === 2) cur = [-rm, cur[1]]; else cur = [cur[0], -rm];
      spiralSkew.push([cur[0], cur[1]]); } })();
  var spiralPts = spiralSkew.map(function (ab) { return skewPt(ab[0], ab[1]); }), mouthPt = spiralPts[spiralPts.length - 1];
  var cornerAnglesDeg = [];
  (function () { var i, a, b, c, ux, uz, vx, vz;
    for (i = 1; i + 1 < spiralPts.length; i++) { a = spiralPts[i - 1]; b = spiralPts[i]; c = spiralPts[i + 1]; ux = a[0] - b[0]; uz = a[1] - b[1]; vx = c[0] - b[0]; vz = c[1] - b[1];
      cornerAnglesDeg.push(+(Math.acos(Math.max(-1, Math.min(1, (ux * vx + uz * vz) / ((Math.hypot(ux, uz) || 1) * (Math.hypot(vx, vz) || 1))))) * 180 / Math.PI).toFixed(2)); } })();
  var STREET_W = lzD(S.spiral.street, 7), KERB_SKEW = (STREET_W / 2 + 1.2) / SIN75, spiralBlocks = [], windingDepths = [];
  (function () { var w, s, m, rIn, rOut, tLo, tHi, depthM, iA, iB, oA, oB, pA, pB, dx, dz, L, nIn, cx, cz;
    for (w = 0; w < WIND; w++) for (s = 0; s < 4; s++) {
      m = 4 * w + s; rIn = rAt(m - 1) + KERB_SKEW; rOut = rAt(m + 3) - KERB_SKEW; tLo = -(m >= 2 ? rAt(m - 2) : R_COURT) + KERB_SKEW; tHi = rAt(m) - KERB_SKEW;
      depthM = (rAt(m + 3) - rAt(m - 1)) * SIN75; if (s === 0) windingDepths.push(+depthM.toFixed(2));
      if (s === 0) { iA = [tLo, -rIn]; iB = [tHi, -rIn]; oA = [tLo, -rOut]; oB = [tHi, -rOut]; }
      else if (s === 1) { iA = [rIn, tLo]; iB = [rIn, tHi]; oA = [rOut, tLo]; oB = [rOut, tHi]; }
      else if (s === 2) { iA = [-tLo, rIn]; iB = [-tHi, rIn]; oA = [-tLo, rOut]; oB = [-tHi, rOut]; }
      else { iA = [-rIn, -tLo]; iB = [-rIn, -tHi]; oA = [-rOut, -tLo]; oB = [-rOut, -tHi]; }
      pA = skewPt(iA[0], iA[1]); pB = skewPt(iB[0], iB[1]); dx = pB[0] - pA[0]; dz = pB[1] - pA[1]; L = Math.hypot(dx, dz) || 1;
      cx = (pA[0] + pB[0]) / 2; cz = (pA[1] + pB[1]) / 2; nIn = [-dz / L, dx / L]; if (nIn[0] * (-cx) + nIn[1] * (-cz) < 0) nIn = [-nIn[0], -nIn[1]];
      spiralBlocks.push({ id: 'w' + w + '.' + s, i: w, j: s, winding: w, arm: s, kind: 'w' + w, wealth: w <= 1 ? 0.8 : w === 2 ? 0.55 : 0.45,
        depthM: depthM, innerA: pA, innerB: pB, outerA: skewPt(oA[0], oA[1]), outerB: skewPt(oB[0], oB[1]), nIn: nIn,
        poly: [iA, iB, oB, oA].map(function (q) { return skewPt(q[0], q[1]); }) });
    } })();
  var outerR = rAt(LASTR) + 30;

  /* ---------------------------------------------------------------- 3. the ley line, aimed at the cluster's reliquary */
  var ley = null;
  if (S.ley) {
    var lx = (S.ley.to[0] - GR.pin[0]) * 2000, lz = (S.ley.to[1] - GR.pin[1]) * 2000, ld = Math.hypot(lx, lz) || 1, lu = [lx / ld, lz / ld];
    var inBox = function (t) { var x = lu[0] * t, z = lu[1] * t; return x > N.x0 + 60 && x < N.x1 - 60 && z > N.z0 + 60 && z < N.z1 - 60; };
    var tEnd = Math.min(ld - 30, 3200); while (tEnd > 200 && !inBox(tEnd)) tEnd -= 20;
    ley = { to: S.ley.to, distM: Math.round(ld), unit: lu, bearing: Math.atan2(lx, lz), stoneAt: [lu[0] * lzD(S.ley.stone, 58), lu[1] * lzD(S.ley.stone, 58)],
      cityWay: [[lu[0] * 34, lu[1] * 34], [lu[0] * (outerR + 40), lu[1] * (outerR + 40)]], track: [[lu[0] * 36, lu[1] * 36], [lu[0] * tEnd, lu[1] * tEnd]],
      reachesReliquary: ld - 30 <= tEnd + 1 };
  }

  /* ---------------------------------------------------------------- 4. the village on core/city */
  function kitDims(key, v) { var D = DEFS[key]; return D ? { key: key, v: lzD(v, 0), w: D.w, d: D.d, h: lzD(D.h, 8) } : null; }
  var TUNE = { cell: 2.5, rasterHalf: Math.ceil(outerR * 1.6 / 10) * 10 + 40, maxSlope: lzD(S.maxSlope, 0.38), exact: true,
    width: { avenue: 13, main: STREET_W, side: 6, alley: 3.5, highway: 9, lane: 5 }, lot: { side: 1.4, setback: 1.5, rear: 2.5, inset: 0.8, step: 3 },
    classes: { middle: [['lz-makers', 0]], poor: [['lz-makers', 0]] }, fallback: { middle: 'poor', poor: null } };
  var cityPlan = null, cityErr = null;
  var zoneHull = [skewPt(-outerR, -outerR), skewPt(outerR, -outerR), skewPt(outerR, outerR), skewPt(-outerR, outerR)];
  try {
    var L = KCITY.lib, ctx = { step: 6, seed: SEED, pools: S.pools, gaps: S.gaps, garden: S.garden || {}, setback: 1.8, margin: 0.9 };
    var placeSpecial = function (key, blk, u, set) { var D = kitDims(key, 0); if (!D) return null;
      var ax = blk.innerA[0] + (blk.innerB[0] - blk.innerA[0]) * u, az = blk.innerA[1] + (blk.innerB[1] - blk.innerA[1]) * u;
      return KCITY.courts.place(key, [ax - blk.nIn[0] * (D.d / 2 + set), az - blk.nIn[1] * (D.d / 2 + set)], blk.nIn, blk, ctx, 'civic'); };
    var steps = [
      { name: 'the ground and the spiral blocks', run: function () {
        var SL = L.SL, P = L.plan(), R = SL.R = new L.Raster(TUNE.rasterHalf, TUNE.cell), land = 0;
        R.occ.fill(L.OCC.OUT);
        spiralBlocks.forEach(function (b) { land += KCITY.site.zoneRaster(R, b.poly, { dry: LAKE_Y + 1, maxSlope: TUNE.maxSlope, h: groundH }); });
        P.zone = zoneHull; P.site = [{ id: 0, name: S.name, type: 'town', role: 'town', poly: zoneHull }]; SL.minSpacing = STREET_W;
        SL.note(0, S.name + ': ' + spiralBlocks.length + ' spiral blocks, ' + land + ' cells'); } },
      { name: 'the squared-spiral street and the ley line', run: function () {
        var SL = L.SL, w = SL.addWay('main', spiralPts, 1, { tag: 'spiral' }); w.kind = 'spiral';
        if (ley) { var wl = SL.addWay('avenue', ley.cityWay, 2, { tag: 'ley' }); wl.kind = 'ley'; } } },
      { name: 'the inward-facing caste windings and the brick wells', run: function () {
        (S.specials || []).forEach(function (sp) { var b = spiralBlocks[sp[1] * 4 + sp[2]]; if (b) placeSpecial(sp[0], b, sp[3], sp[4]); });
        spiralBlocks.forEach(function (b) {
          var st = KCITY.courts.stream(ctx, 'front', b);
          KCITY.courts.edgeRun(b.innerA, b.innerB, b.nIn, b, st, S.pools[b.kind], ctx, 'spiral-inner', (S.maxPerArm || [])[b.winding] || 99, 1.8);
          (S.tiers || []).forEach(function (T2) { if (T2.w !== b.winding) return;
            KCITY.courts.edgeRun(b.innerA, b.innerB, b.nIn, b, KCITY.courts.stream(ctx, 'tier' + T2.set, b), T2.pool, ctx, 'spiral-tier', T2.n, T2.set); });
          var stW = KCITY.courts.stream(ctx, 'wells', b), nW = (S.wells || [1, 2, 2, 2, 2])[b.winding] || 0, wi, uw;
          for (wi = 0; wi < nW; wi++) { uw = (wi + 0.5) / nW + (stW.next() - 0.5) * 0.12;
            KCITY.courts.place('gl-well', [b.innerA[0] + (b.innerB[0] - b.innerA[0]) * uw - b.nIn[0] * (b.depthM * 0.72), b.innerA[1] + (b.innerB[1] - b.innerA[1]) * uw - b.nIn[1] * (b.depthM * 0.72)], b.nIn, b, ctx, 'outer-well'); }
        }); } }];
    cityPlan = KCITY.create({ name: S.key, tune: TUNE, seed: SEED, rand: 'krand', index: { order: 'insertion' }, ground: { h: groundH }, kit: { dims: kitDims }, steps: steps }).run();
  } catch (e) { cityErr = e; reportErr(S.key + ': core/city spiral failed: ' + (e && e.stack ? e.stack : e)); }

  /* ---------------------------------------------------------------- 5. the outwork on core/hamlet's Lizardmen row */
  var hamlet = null;
  if (S.hamlet && typeof KHAMLET !== 'undefined' && KHAMLET.village) {
    var H0 = S.hamlet;
    hamlet = KHAMLET.village({ id: H0.id, world: SEED + 5, culture: 'lizardmen', focus: H0.focus, site: { x: H0.site[0], z: H0.site[1] }, link: { x: H0.link[0], z: H0.link[1] },
      resource: { x: H0.resource[0], z: H0.resource[1], workers: H0.workers }, popMax: lzD(H0.popMax, 210), dims: function (k) { return kitDims(k, 0); },
      ground: { ok: function (x, z) { if (x < N.x0 + 80 || x > N.x1 - 80 || z < N.z0 + 80 || z > N.z1 - 80) return false; if (groundH(x, z) < LAKE_Y + 2) return false; return slopeAt(x, z, 10) <= 0.24; } } });
  }

  /* ---------------------------------------------------------------- 6. every site: no overlap, seated on its plinth */
  var space = KSPACE.create({ cell: 32 }), sites = [], plinths = [], overlapSkips = 0;
  function obbOf(x, z, ry, w, d, pad) { var p = lzD(pad, 0), c = Math.cos(ry), s = Math.sin(ry); return { x: x, z: z, ux: c, uz: -s, hw: w / 2 + p, hd: d / 2 + p }; }
  function footStats(x, z, ry, w, d) { var c = Math.cos(ry), s = Math.sin(ry), lo = groundH(x, z), hi = lo;
    [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (q) { var a = q[0] * w / 2, b = q[1] * d / 2, y = groundH(x + a * c + b * s, z - a * s + b * c); if (y < lo) lo = y; if (y > hi) hi = y; });
    return { lo: lo, hi: hi }; }
  function addSite(key, x, z, ry, kind, o) {
    var D = DEFS[key]; if (!D) return null; o = o || {};
    if (S.lake && groundH(x, z) < LAKE_Y + 0.5 && !o.wet) { overlapSkips++; return null; }
    var R = obbOf(x, z, ry, D.w, D.d, 0);
    if (!o.allowOverlap && space.some(x, z, Math.hypot(D.w, D.d) / 2 + 36, function (it) { return KHAMLET.overlap(R, it.R, lzD(o.pad, 0.4)); })) { overlapSkips++; return null; }
    space.insert({ R: R, key: key, kind: kind }, x, z, Math.hypot(D.w, D.d) / 2);
    var fs = footStats(x, z, ry, D.w, D.d), y = D.cls === 'life' ? groundH(x, z) : fs.hi + 0.03;
    var v = lzD(o.v, KRAND.hash(SEED, KTAGS.str32(key), Math.round(x), Math.round(z)) % 3);
    var rec = { key: key, x: +x.toFixed(2), z: +z.toFixed(2), y: +y.toFixed(3), ry: +ry.toFixed(5), w: D.w, d: D.d, h: D.h, kind: kind, footLo: +fs.lo.toFixed(3), footHi: +fs.hi.toFixed(3),
      inward: !!o.inward, o: Object.assign({ y: +y.toFixed(3), v: v }, o.name ? { name: o.name } : {}) };
    sites.push(rec);
    if (D.cls !== 'life') plinths.push({ key: key, x: rec.x, z: rec.z, ry: rec.ry, w: D.w, d: D.d, y0: +(fs.lo - 0.38).toFixed(3), y1: +(y + 0.005).toFixed(3),
      stone: key === 'lz-seer' || D.caste === 'all' || key === 'lz-lodge' || key === 'gl-tank' || key === 'gl-well' || key.indexOf('lk-') === 0 });
    return rec;
  }
  /* 6a. the court */
  var nestRy = Math.atan2(-e2[0], -e2[1]);
  addSite(S.court && S.court.nest || 'lz-nest', 0, 0, nestRy, 'nest', { name: 'The nest hall of ' + S.name });
  addSite('lz-bells', Math.sin(nestRy) * 31 - Math.cos(nestRy) * 7, Math.cos(nestRy) * 31 + Math.sin(nestRy) * 7, nestRy, 'monument');
  addSite('lz-stela-pair', Math.sin(nestRy) * 31 + Math.cos(nestRy) * 8, Math.cos(nestRy) * 31 - Math.sin(nestRy) * 8, nestRy, 'monument');
  addSite('lz-stela-turned', -Math.sin(nestRy) * 30, -Math.cos(nestRy) * 30, nestRy + Math.PI, 'monument');
  if (ley) addSite('lz-ley', ley.stoneAt[0], ley.stoneAt[1], ley.bearing + Math.PI, 'ley', { name: 'The ley line shrine (aimed at ' + S.ley.name + ')' });
  /* 6b. the spiral's lots */
  if (cityPlan && cityPlan.lots) cityPlan.lots.forEach(function (Lt) {
    addSite(Lt.key, Lt.x, Lt.z, Lt.ry, Lt.key === 'gl-well' ? 'well' : Lt.key === 'gl-tank' ? 'tank' : Lt.why === 'civic' ? 'civic' : 'spiral', { inward: true, pad: 0.15 }); });
  /* 6c. the mouth */
  var musterX = mouthPt[0] + e2[0] * 38, musterZ = mouthPt[1] + e2[1] * 38, musterRy = Math.atan2(-e2[0], -e2[1]);
  if (!S.mouth || S.mouth.muster !== false) {
    addSite('lz-muster', musterX, musterZ, musterRy, 'military', { name: 'The mustering ground at the spiral mouth' });
    (S.mouth && S.mouth.tents || ['lc-seer', 'lc-sail']).forEach(function (k, i) { var sg = i % 2 ? -1 : 1, off = 24 + 18 * Math.floor(i / 2);
      addSite(k, musterX + sg * e1[0] * off, musterZ + sg * e1[1] * off, musterRy + sg * 0.3, 'camp'); });
    addSite('lz-lookout', musterX + e2[0] * 42 + e1[0] * 28, musterZ + e2[1] * 42 + e1[1] * 28, Math.atan2(e2[0], e2[1]), 'lookout', { name: 'The mouth lookout' });
  }
  /* 6d. the outwork */
  var hamletPlaced = 0;
  if (hamlet && !hamlet.error && hamlet.records) {
    hamlet.records.forEach(function (hr) { if (!hr.pending && addSite(hr.key, hr.x, hr.z, hr.ry, 'hamlet', { pad: 0.2 })) hamletPlaced++; });
    addSite('gl-well', hamlet.site.x + 12, hamlet.site.z - 8, 0, 'well', { pad: 0.2 });
  }
  /* 6e. the spec's own sites (works, lookouts, the town's special pieces), in the town's frame */
  (S.sites || []).forEach(function (q) { addSite(q.key, q.x, q.z, lzD(q.ry, 0), q.kind || 'works', { name: q.name, pad: lzD(q.pad, 0.4), wet: q.wet }); });
  /* 6f. the country: fields on flat ground in the spec's direction, farms, windmills, herds */
  var fields = [], FD = S.fields || null;
  if (FD) {
    var fu = FD.dir, fv = [-fu[1], fu[0]], pw = lzD(FD.w, 130), pd = lzD(FD.d, 84), crops = FD.crops || ['ashmillet'], i, j, cx, cz, h;
    for (i = 0; i * pd < FD.r1 - FD.r0; i++) for (j = -lzD(FD.half, 8); j <= lzD(FD.half, 8); j++) {
      cx = fu[0] * (FD.r0 + i * pd) + fv[0] * j * pw; cz = fu[1] * (FD.r0 + i * pd) + fv[1] * j * pw;
      if (Math.hypot(cx, cz) < outerR + 120 || cx < N.x0 + 150 || cx > N.x1 - 150 || cz < N.z0 + 150 || cz > N.z1 - 150) continue;
      if (S.lake && groundH(cx, cz) < LAKE_Y + 6) continue;
      if (slopeAt(cx, cz, 20) > lzD(FD.maxSlope, 0.14)) continue;
      h = KRAND.hash(SEED, 91, i + 100, j + 100) % 100; if (h < lzD(FD.gaps, 22)) continue;
      fields.push({ id: S.key + '.field.' + i + '.' + j, at: [cx, cz], box: [cx - pw * 0.44, cz - pd * 0.44, cx + pw * 0.44, cz + pd * 0.44], kind: h < 55 ? 'tilled' : h < 84 ? 'crop' : 'fallow', crop: crops[h % crops.length] });
    }
    var spots = fields.filter(function (f, k) { return k % Math.max(1, Math.floor(fields.length / Math.max(1, lzD(FD.farms, 6)))) === 0; }).slice(0, lzD(FD.farms, 6));
    spots.forEach(function (f, k) { var ry = Math.atan2(fu[0], fu[1]) + (k % 3 - 1) * 0.4;
      addSite('lz-farm', f.at[0] + fv[0] * 30, f.at[1] + fv[1] * 30, ry, 'farm'); addSite('gl-well', f.at[0] + fv[0] * 52, f.at[1] + fv[1] * 52, ry + Math.PI, 'well'); });
    for (i = 0; i < lzD(FD.windmills, 2); i++) { var t = FD.r0 + (i + 0.5) * (FD.r1 - FD.r0) / Math.max(1, lzD(FD.windmills, 2));
      addSite('lz-windmill', fu[0] * t - fv[0] * (pw * (lzD(FD.half, 8) + 1)), fu[1] * t - fv[1] * (pw * (lzD(FD.half, 8) + 1)), 0.35, 'mill'); }
    (FD.herds || ['frilled', 'frilled', 'frilled', 'burden', 'burden']).forEach(function (k, q) { var f = fields[(q * 7) % Math.max(1, fields.length)]; if (!f) return;
      addSite(k, f.box[0] - 6 + (q % 3) * 3, f.box[1] - 6, q * 1.3, 'herd'); });
    if (FD.circle !== false) addSite('lz-circle', fu[0] * (FD.r1 + 150), fu[1] * (FD.r1 + 150), 0.2, 'monument', { name: 'The stone circle' });
  }
  /* the country ways for the ground's paint: the ley path, a track to the fields, the spec's own */
  var countryWays = [];
  if (ley) countryWays.push({ id: 'ley-path', w: 5.5, pts: ley.track });
  if (FD) countryWays.push({ id: 'field-track', w: 5.5, pts: [mouthPt, [FD.dir[0] * FD.r0, FD.dir[1] * FD.r0], [FD.dir[0] * FD.r1, FD.dir[1] * FD.r1]] });
  (S.ways || []).forEach(function (w) { countryWays.push(w); });
  if (hamlet && hamlet.lanes) hamlet.lanes.forEach(function (l, k) { countryWays.push({ id: 'hamlet-lane-' + k, w: 5, pts: l.pts }); });

  /* ---------------------------------------------------------------- 7. the census and the checks */
  var HOLDS = S.holds || { 'lz-warren': { total: 28, c: { 1: 28 } }, 'lz-makers': { total: 10, c: { 2: 10 } }, 'lz-hall-bronze': { total: 12, c: { 2: 12 } },
    'lz-hall-reed': { total: 12, c: { 2: 12 } }, 'lz-hall-bone': { total: 12, c: { 2: 12 } }, 'lz-longhouse': { total: 33, c: { 3: 33 } },
    'lz-lodge': { total: 30, c: { 4: 18, 6: 12 } }, 'lz-tower': { total: 7, c: { 5: 7 } } };
  var people = { spiral: 0, hamlet: 0, total: 0, byCaste: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, byKey: {} }, byKind = {}, inwardBad = 0;
  sites.forEach(function (r) { byKind[r.kind] = lzD(byKind[r.kind], 0) + 1; people.byKey[r.key] = lzD(people.byKey[r.key], 0) + 1;
    var hd = HOLDS[r.key]; if (hd) { if (r.kind === 'hamlet') people.hamlet += hd.total; else people.spiral += hd.total; people.total += hd.total; for (var ck in hd.c) people.byCaste[ck] += hd.c[ck]; }
    if (r.inward && Math.sin(r.ry) * (-r.x) + Math.cos(r.ry) * (-r.z) <= 0) inwardBad++; });
  var overlapPairs = 0;
  (function () { var B = sites.filter(function (q) { return DEFS[q.key] && DEFS[q.key].cls !== 'life'; }), i, j, a, b;
    for (i = 0; i < B.length; i++) { a = B[i]; for (j = i + 1; j < B.length; j++) { b = B[j];
      if (Math.hypot(a.x - b.x, a.z - b.z) > Math.hypot(a.w, a.d) / 2 + Math.hypot(b.w, b.d) / 2 + 1) continue;
      if (KHAMLET.overlap(obbOf(a.x, a.z, a.ry, a.w, a.d, 0), obbOf(b.x, b.z, b.ry, b.w, b.d, 0), -0.05)) overlapPairs++; } } })();
  function segDist(x, z, a, b) { var dx = b[0] - a[0], dz = b[1] - a[1], l2 = Math.max(1e-9, dx * dx + dz * dz), t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)); return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz); }
  function lineDist(x, z, P) { var b = 1e9, i; for (i = 0; i + 1 < P.length; i++) b = Math.min(b, segDist(x, z, P[i], P[i + 1])); return b; }
  /* the ground's paint at (x, z): [shore (salt crust, mud), field, yard, wet], each 0..1 */
  function zoneAt(x, z) {
    var y = groundH(x, z), above = y - LAKE_Y, wShore = S.lake ? 1 - sm(1.5, lzD(S.lake.band, 16), above) : 0, wTill = 0, i, bx;
    (S.shoreBoxes || []).forEach(function (b) { var cx = (b[0] + b[2]) / 2, cz = (b[1] + b[3]) / 2, r = Math.max(b[2] - b[0], b[3] - b[1]) / 2, d = Math.hypot(x - cx, z - cz);
      if (d < r) wShore = Math.max(wShore, 0.88 * (1 - sm(r * 0.35, r, d))); });
    for (i = 0; i < fields.length; i++) { bx = fields[i].box; if (x >= bx[0] - 12 && x <= bx[2] + 12 && z >= bx[1] - 12 && z <= bx[3] + 12) {
      var fx = Math.max(bx[0] - x, 0, x - bx[2]), fz = Math.max(bx[1] - z, 0, z - bx[3]), fe = 1 - sm(0, 12, Math.hypot(fx, fz));
      wTill = Math.max(wTill, (fields[i].kind === 'fallow' ? 0.45 : 0.92) * fe); } }
    var wYard = 0, ab = toSkew(x, z), mx = Math.max(Math.abs(ab[0]), Math.abs(ab[1]));
    if (mx < outerR + 20) { wYard = 0.42 * (1 - sm(outerR - 60, outerR + 20, mx)); var ds = lineDist(x, z, spiralPts); if (ds < STREET_W + 22) wYard = Math.max(wYard, 0.88 * (1 - sm(STREET_W * 0.6, STREET_W + 22, ds))); }
    for (i = 0; i < countryWays.length; i++) { var dw = lineDist(x, z, countryWays[i].pts); if (dw < countryWays[i].w + 20) wYard = Math.max(wYard, 0.82 * (1 - sm(countryWays[i].w * 0.5, countryWays[i].w + 20, dw))); }
    if (hamlet && hamlet.site && Math.hypot(x - hamlet.site.x, z - hamlet.site.z) < 95) wYard = Math.max(wYard, 0.65);
    var wet = S.lake ? 1 - sm(0.2, 5.5, Math.abs(above)) : 0;
    return [Math.max(0, Math.min(1, wShore)), Math.max(0, Math.min(1, wTill)), Math.max(0, Math.min(1, wYard * (1 - wShore * 0.7))), Math.max(0, Math.min(1, wet))];
  }
  return { spec: S, seed: SEED, lakeY: LAKE_Y, near: N, far: F, nearH: nearH, farH: farH, farRaw: farRaw, modelH: modelH, groundH: groundH, slopeAt: slopeAt,
    drawnNear: drawnNear, drawnFar: drawnFar, e1: e1, e2: e2, toSkew: toSkew, skewPt: skewPt, outerR: outerR,
    spiralPts: spiralPts, mouthPt: mouthPt, spiralBlocks: spiralBlocks, cornerAnglesDeg: cornerAnglesDeg, windingDepths: windingDepths, ley: ley,
    cityErr: cityErr ? String(cityErr) : null,
    hamlet: hamlet ? { id: hamlet.id, error: hamlet.error || null, census: hamlet.census, site: hamlet.site, records: hamlet.records ? hamlet.records.length : 0, placed: hamletPlaced } : null,
    fields: fields, countryWays: countryWays, sites: sites, plinths: plinths, people: people, byKind: byKind,
    inwardBad: inwardBad, overlapPairs: overlapPairs, overlapSkips: overlapSkips,
    pin: { model: +GR.model.toFixed(2), bicubic: +pinModelY.toFixed(2), drawn: +groundH(0, 0).toFixed(2) }, zoneAt: zoneAt };
})();
