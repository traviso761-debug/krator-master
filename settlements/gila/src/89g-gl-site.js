/* ==================== Gila 89g: the site, the drawn ground, the rhombic spiral, the salt hamlet and the country ([G data]) ==================== */
/* settlements/gila/PLAN.md sections 1-7 (steps G3, G5; owner's answers 2026-11-16).
   Pure data and plain functions: no three.js, no DOM.
   1. Decodes GL_GROUND (gen/69g-gl-ground.js, scale model 5.1 round px 653,1485), grades the central nest court and the
      east-shore salt shelf gently, registers both near (20 m) and far (500 m) grids in KDRAWN, and sets terrainH to read
      the drawn triangles (KDRAWN) so placement, walk and the eye agree to the bit.
   2. Lays one rhombic squared-spiral street (75 deg / 105 deg corners, each winding 1.25 x the one inside it, 5 windings
      from 36 m to 88 m deep, axes along the spit's contour) and the straight ley line on a KCITY.create instance.
   3. Fronts every spiral block on its inner street only (KCITY.courts.edgeRun + KCITY.courts.place), so every door looks
      toward the nest hall; places Mohenjo-daro brick wells (gl-well) in the outer halves of the blocks; opens the NW mouth
      onto the mustering ground.
   4. Lays the east-shore salt-works camp on KHAMLET.village (row 'lizardmen', focus 'salt') with additional evaporating
      pan spirals on the shore bench; lays the NW crest fields (crops from kits/crops), farms, panemone windmills, herds,
      stone circle, lookouts, and the isolated west reliquary on the spit's south-west shore behind the shoulder. */
var GL_SITE = (function () {
  var SEED = 78010;
  var LAKE_Y = GL_GROUND.lake;
  var RATIO = 1.25;
  var glD = function (x, d) { return x == null ? d : x; };
  var sm = function (a, b, v) { var t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

  function decGrid(o) {
    var s = atob(o.b64), n = s.length >> 1, a = new Float32Array(n), i, v;
    for (i = 0; i < n; i++) {
      v = s.charCodeAt(2 * i) | (s.charCodeAt(2 * i + 1) << 8);
      if (v > 32767) v -= 65536;
      a[i] = o.base + v * o.unit;
    }
    return a;
  }

  var N = GL_GROUND.near, F = GL_GROUND.far;
  var modelNear = decGrid(N), farRaw = decGrid(F);
  var nearH = new Float32Array(modelNear);
  var farH = new Float32Array(farRaw);

  function bil(G, arr, x, z) {
    var u = Math.min(G.nx - 1.0001, Math.max(0, (x - G.x0) / G.step));
    var v = Math.min(G.nz - 1.0001, Math.max(0, (z - G.z0) / G.step));
    var i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j, k = j * G.nx + i;
    return (arr[k] * (1 - fu) + arr[k + 1] * fu) * (1 - fv) + (arr[k + G.nx] * (1 - fu) + arr[k + G.nx + 1] * fu) * fv;
  }
  function modelH(x, z) {
    if (x >= N.x0 && x <= N.x1 && z >= N.z0 && z <= N.z1) return bil(N, modelNear, x, z);
    return bil(F, farRaw, x, z);
  }

  /* Gentle site grading on nearH:
     - the central court (r <= 40 m) eased toward the pin's own height (delta 0 at the pin, <= 1.8 m at r=36 m) so lz-nest stands level;
     - the east-shore salt-pan bench round x=1690, z=100..540 eased to LAKE_Y + 0.75 m so the pans' sluices take the lake's brine;
     - the reliquary's cyclopean terrace at (-1920, 3320) eased over r <= 28 m so its 46 x 40 m platform sits level. */
  var pinModelY = modelH(0, 0);
  var RELIQ = { x: -2160, z: 3380 };
  var reliqBaseY = modelH(RELIQ.x, RELIQ.z);
  (function gradeNear() {
    var ix, iz, x, z, y, d, w, dy, sx, sz;
    for (iz = 0; iz < N.nz; iz++) {
      z = N.z0 + iz * N.step;
      for (ix = 0; ix < N.nx; ix++) {
        x = N.x0 + ix * N.step;
        y = nearH[iz * N.nx + ix];
        d = Math.hypot(x, z);
        if (d < 56) {
          w = (1 - sm(26, 56, d)) * 0.88;
          dy = Math.max(-2.1, Math.min(2.1, pinModelY - y));
          y += w * dy;
        }
        /* east-shore evaporating pan bench */
        sx = 1 - sm(65, 130, Math.abs(x - 1690));
        sz = sm(40, 110, z) * (1 - sm(510, 590, z));
        if (sx * sz > 0) {
          y = y + sx * sz * ((LAKE_Y + 0.75) - y);
        }
        /* reliquary platform terrace */
        d = Math.hypot(x - RELIQ.x, z - RELIQ.z);
        if (d < 46) {
          w = 1 - sm(24, 46, d);
          y = y + w * (reliqBaseY - y);
        }
        nearH[iz * N.nx + ix] = y;
      }
    }
    /* sink the coarse 500 m far grid strictly inside NEAR so it never pokes through the 20 m near mesh */
    for (iz = 0; iz < F.nz; iz++) {
      z = F.z0 + iz * F.step;
      for (ix = 0; ix < F.nx; ix++) {
        x = F.x0 + ix * F.step;
        if (x > N.x0 + F.step && x < N.x1 - F.step && z > N.z0 + F.step && z < N.z1 - F.step) {
          farH[iz * F.nx + ix] -= 14;
        }
      }
    }
  })();

  KDRAWN.clear();
  var drawnNear = KDRAWN.add(KDRAWN.grid({ x0: N.x0, z0: N.z0, dx: N.step, dz: N.step, nx: N.nx - 1, nz: N.nz - 1, h: nearH }));
  var drawnFar = KDRAWN.add(KDRAWN.grid({ x0: F.x0, z0: F.z0, dx: F.step, dz: F.step, nx: F.nx - 1, nz: F.nz - 1, h: farH }));

  function groundH(x, z) {
    var d = drawnNear.h(x, z);
    if (d !== null) return d;
    var df = drawnFar.h(x, z);
    return df !== null ? df : bil(F, farRaw, x, z);
  }
  terrainH = groundH;

  /* ---------------------------------------------------------------- 2. Rhombic squared-spiral geometry (75 deg / 105 deg, 1.25x) */
  /* e1 runs along the spit's level contour at the pin (SW -> NE); e2 turns 105 deg to climb NW up the spit's crest.
     Dot product e1 . e2 = cos(-105 deg) = -sin(15 deg), so adjacent arms meet at 75 deg and 105 deg everywhere. */
  var gx0 = (modelH(120, 0) - modelH(-120, 0)) / 240;
  var gz0 = (modelH(0, 120) - modelH(0, -120)) / 240;
  var th1 = Math.atan2(-gx0, gz0); /* level contour bearing (~ -50.2 deg in x,z: NE) */
  var e1 = [Math.cos(th1), Math.sin(th1)];
  var th2 = th1 - 105 * Math.PI / 180; /* NW up the spit */
  var e2 = [Math.cos(th2), Math.sin(th2)];
  var SIN75 = Math.sin(75 * Math.PI / 180);

  function skewPt(a, b) {
    return [a * e1[0] + b * e2[0], a * e1[1] + b * e2[1]];
  }
  /* Inverse skew transform: p = a*e1 + b*e2 */
  var detSkew = e1[0] * e2[1] - e1[1] * e2[0];
  function toSkew(x, z) {
    return [(x * e2[1] - z * e2[0]) / detSkew, (e1[0] * z - e1[1] * x) / detSkew];
  }

  /* Quarter-turn radii r(m): central court r(-1) = 46; 5 windings of blocks (m = 0..19, bounded outside by m = 20..23).
     Perpendicular block depth at winding w, arm s:
       depth(0, 0) = 36.0 m, and depth(w, s) / depth(w - 1, s) = 1.25 exact (q = 1.25^0.25), reaching 87.89 m on winding 4. */
  var R_COURT = 46;
  var Q_STEP = Math.pow(RATIO, 0.25);
  var P0_SKEW = 36.0 / SIN75;
  var C_SPIRAL = P0_SKEW / (Math.pow(Q_STEP, 4) - 1);
  function rAt(m) {
    if (m < 0) return R_COURT;
    return R_COURT + C_SPIRAL * (Math.pow(Q_STEP, m + 1) - 1);
  }
  /* Corners Q[0..26] of one continuous outward rhombic squared spiral:
     seg 0 (+a at b = -r(-1)), seg 1 (+b at a = +r(0)), seg 2 (-a at b = +r(1)), seg 3 (-b at a = -r(2)), ...
     seg 25 ends along +b (NW up the spit toward the mustering ground), so every corner strictly alternates +-e1 and +-e2. */
  var spiralSkew = [[-R_COURT, -R_COURT]];
  (function buildSpiralCorners() {
    var cur = [-R_COURT, -R_COURT], m, side, rm;
    for (m = 0; m < 26; m++) {
      side = m % 4;
      rm = m <= 23 ? rAt(m) : rAt(23) + 18;
      if (side === 0) cur = [rm, cur[1]];
      else if (side === 1) cur = [cur[0], rm];
      else if (side === 2) cur = [-rm, cur[1]];
      else cur = [cur[0], -rm];
      spiralSkew.push([cur[0], cur[1]]);
    }
  })();
  var spiralPts = spiralSkew.map(function (ab) { return skewPt(ab[0], ab[1]); });
  var mouthPt = spiralPts[spiralPts.length - 1];

  /* Verify spiral angles and 1.25x winding ratios as data */
  var cornerAnglesDeg = [];
  (function measureSpiralAngles() {
    var i, a, b, c, ux, uz, vx, vz, l1, l2, ang;
    for (i = 1; i + 1 < spiralPts.length; i++) {
      a = spiralPts[i - 1]; b = spiralPts[i]; c = spiralPts[i + 1];
      ux = a[0] - b[0]; uz = a[1] - b[1]; l1 = Math.hypot(ux, uz) || 1;
      vx = c[0] - b[0]; vz = c[1] - b[1]; l2 = Math.hypot(vx, vz) || 1;
      ang = Math.acos(Math.max(-1, Math.min(1, (ux * vx + uz * vz) / (l1 * l2)))) * 180 / Math.PI;
      cornerAnglesDeg.push(+ang.toFixed(2));
    }
  })();

  /* Build the 20 rhombic spiral blocks (5 windings w=0..4 x 4 arms s=0..3).
     Between inner segment m = 4*w + s and outer segment m + 4:
       side 0 (b < 0): inner b = -r(m-1), outer b = -r(m+3), a in [-r(m-2), +r(m)]
       side 1 (a > 0): inner a = +r(m-1), outer a = +r(m+3), b in [-r(m-2), +r(m)]
       side 2 (b > 0): inner b = +r(m-1), outer b = +r(m+3), a in [-r(m), +r(m-2)]
       side 3 (a < 0): inner a = -r(m-1), outer a = -r(m+3), b in [-r(m), +r(m-2)] */
  var STREET_W = 7.0;
  var KERB = STREET_W / 2 + 1.2;
  var KERB_SKEW = KERB / SIN75;
  var spiralBlocks = [];
  var windingDepths = [];
  (function buildSpiralBlocks() {
    var w, s, m, rIn, rOut, tLo, tHi, depthM, polySkew, innerA, innerB, outerA, outerB, pA, pB, dx, dz, L, nIn, cx, cz;
    for (w = 0; w < 5; w++) {
      for (s = 0; s < 4; s++) {
        m = 4 * w + s;
        rIn = rAt(m - 1) + KERB_SKEW;
        rOut = rAt(m + 3) - KERB_SKEW;
        tLo = -(m >= 2 ? rAt(m - 2) : R_COURT) + KERB_SKEW;
        tHi = rAt(m) - KERB_SKEW;
        depthM = (rAt(m + 3) - rAt(m - 1)) * SIN75;
        if (s === 0) windingDepths.push(+depthM.toFixed(2));
        if (s === 0) {
          innerA = [tLo, -rIn]; innerB = [tHi, -rIn];
          outerA = [tLo, -rOut]; outerB = [tHi, -rOut];
        } else if (s === 1) {
          innerA = [rIn, tLo]; innerB = [rIn, tHi];
          outerA = [rOut, tLo]; outerB = [rOut, tHi];
        } else if (s === 2) {
          innerA = [-tLo, rIn]; innerB = [-tHi, rIn];
          outerA = [-tLo, rOut]; outerB = [-tHi, rOut];
        } else {
          innerA = [-rIn, -tLo]; innerB = [-rIn, -tHi];
          outerA = [-rOut, -tLo]; outerB = [-rOut, -tHi];
        }
        polySkew = [innerA, innerB, outerB, outerA];
        pA = skewPt(innerA[0], innerA[1]);
        pB = skewPt(innerB[0], innerB[1]);
        dx = pB[0] - pA[0]; dz = pB[1] - pA[1]; L = Math.hypot(dx, dz) || 1;
        /* Two unit normals to inner edge pA -> pB; pick the one pointing INWARD toward the nest hall (0, 0) */
        cx = (pA[0] + pB[0]) / 2; cz = (pA[1] + pB[1]) / 2;
        nIn = [-dz / L, dx / L];
        if (nIn[0] * (-cx) + nIn[1] * (-cz) < 0) nIn = [-nIn[0], -nIn[1]];
        spiralBlocks.push({
          id: 'w' + w + '.' + s, i: w, j: s, winding: w, arm: s,
          kind: 'w' + w, wealth: w <= 1 ? 0.8 : w === 2 ? 0.55 : 0.45,
          depthM: depthM, innerA: pA, innerB: pB,
          outerA: skewPt(outerA[0], outerA[1]), outerB: skewPt(outerB[0], outerB[1]),
          nIn: nIn, poly: polySkew.map(function (q) { return skewPt(q[0], q[1]); })
        });
      }
    }
  })();

  /* ---------------------------------------------------------------- 3. The Ley Line & West Reliquary sightline */
  var leyDx = RELIQ.x, leyDz = RELIQ.z, leyDist = Math.hypot(leyDx, leyDz);
  var leyU = [leyDx / leyDist, leyDz / leyDist];
  var leyBearing = Math.atan2(leyDx, leyDz); /* bearing from (0,0) to RELIQ; lz-ley aims its -z spine along this bearing when ry = leyBearing + PI */
  var leyStoneAt = [leyU[0] * 58, leyU[1] * 58];
  var leyCityWay = [[leyU[0] * 34, leyU[1] * 34], [leyU[0] * 560, leyU[1] * 560]];
  var leyCountryTrack = [[leyU[0] * 36, leyU[1] * 36], [RELIQ.x - leyU[0] * 28, RELIQ.z - leyU[1] * 28]];

  /* Check that the spit's shoulder hides the 28 m reliquary from eye height at the village pin */
  var losHidden = (function () {
    var y0 = groundH(0, 0) + 2.0, y1 = groundH(RELIQ.x, RELIQ.z) + 28.0, k, t, ym, yLine, maxClear = -1e9;
    for (k = 1; k < 60; k++) {
      t = k / 60;
      ym = groundH(RELIQ.x * t, RELIQ.z * t);
      yLine = y0 + (y1 - y0) * t;
      if (ym - yLine > maxClear) maxClear = ym - yLine;
    }
    return { hidden: maxClear > 0.5, crestAboveLineM: +maxClear.toFixed(2) };
  })();

  /* ---------------------------------------------------------------- 4. Lay the spiral village on core/city (KCITY.create) */
  function kitDims(key, v) {
    var D = DEFS[key];
    return D ? { key: key, v: glD(v, 0), w: D.w, d: D.d, h: glD(D.h, 8) } : null;
  }

  var TUNE_GILA = {
    cell: 2.5, rasterHalf: 680, maxSlope: 0.38, exact: true,
    width: { avenue: 13, main: STREET_W, side: 6, alley: 3.5, highway: 9, lane: 5 },
    lot: { side: 1.4, setback: 1.5, rear: 2.5, inset: 0.8, step: 3 },
    classes: { middle: [['lz-makers', 0]], poor: [['lz-makers', 0]] },
    fallback: { middle: 'poor', poor: null }
  };

  /* Winding pools by caste (PLAN.md sections 3 & 4):
       winding 0: Tenders' warrens (lz-warren) + civic core (lz-seer, lz-medicine, gl-tank, lz-obelisk)
       winding 1: Interpreters' towers (lz-tower) among Tenders' warrens (lz-warren)
       winding 2: Makers' quarters (lz-makers) + the 3 craft halls + warehouse
       winding 3: Drovers' longhouses (lz-longhouse) + granaries
       winding 4: Line warriors' & Bulwarks' lodges (lz-lodge) + barracks */
  var POOLS = {
    w0: [['lz-warren', 1]],
    w1: [['lz-warren', 5], ['lz-tower', 3]],
    w2: [['lz-makers', 1]],
    w3: [['lz-longhouse', 1]],
    w4: [['lz-lodge', 1]]
  };
  var GAPS = {
    w0: [2.2, 4.2],
    w1: [3.2, 6.2],
    w2: [4.2, 8.2],
    w3: [14.0, 24.0],
    w4: [22.0, 36.0]
  };
  var MAX_PER_ARM = [5, 6, 13, 6, 6];

  var cityPlan = null, cityErr = null, spiralLots = [], wellLots = [], civicLots = [];
  var zoneHull = [skewPt(-480, -480), skewPt(480, -480), skewPt(480, 480), skewPt(-480, 480)];

  try {
    var L = KCITY.lib;
    var ctxSpiral = {
      step: 6, seed: SEED, pools: POOLS, gaps: GAPS,
      garden: { w0: 0, w1: 0.03, w2: 0.02, w3: 0.04, w4: 0.05 },
      setback: 1.8, margin: 0.9
    };

    var placeSpecial = function (key, blk, uAlong, setbackM) {
      var D = kitDims(key, 0);
      if (!D) return null;
      var ax = blk.innerA[0] + (blk.innerB[0] - blk.innerA[0]) * uAlong;
      var az = blk.innerA[1] + (blk.innerB[1] - blk.innerA[1]) * uAlong;
      var c = [ax - blk.nIn[0] * (D.d / 2 + setbackM), az - blk.nIn[1] * (D.d / 2 + setbackM)];
      return KCITY.courts.place(key, c, blk.nIn, blk, ctxSpiral, 'civic');
    };

    var steps = [
      {
        name: 'the spit ground and the spiral blocks',
        run: function () {
          var SL = L.SL, P = L.plan(), R = SL.R = new L.Raster(TUNE_GILA.rasterHalf, TUNE_GILA.cell), land = 0, bi;
          R.occ.fill(L.OCC.OUT);
          for (bi = 0; bi < spiralBlocks.length; bi++) {
            land += KCITY.site.zoneRaster(R, spiralBlocks[bi].poly, { dry: LAKE_Y + 1, maxSlope: TUNE_GILA.maxSlope, h: groundH });
          }
          P.zone = zoneHull;
          P.site = [{ id: 0, name: 'Gila', type: 'town', role: 'town', poly: zoneHull }];
          SL.minSpacing = STREET_W;
          SL.note(0, 'Gila: ' + spiralBlocks.length + ' spiral blocks, ' + land + ' cells');
        }
      },
      {
        name: 'the rhombic squared-spiral street and the ley line',
        run: function () {
          var SL = L.SL;
          var wSp = SL.addWay('main', spiralPts, 1, { tag: 'spiral' });
          wSp.kind = 'spiral';
          var wLey = SL.addWay('avenue', leyCityWay, 2, { tag: 'ley' });
          wLey.kind = 'ley';
          SL.note(2, '1 spiral street (' + spiralPts.length + ' vertices) + 1 straight ley line');
        }
      },
      {
        name: 'the inward-facing caste windings and the brick wells',
        run: function () {
          var bi, b, st, st2, stW, pool, r1, r2, sp, uw, ox, oz, wc;
          /* Special civic, craft, store and military halls placed first on their caste windings, all facing inward */
          var specials = [
            ['gl-tank', 0, 0, 0.52, 2.2],
            ['lz-seer', 0, 1, 0.45, 2.0],
            ['lz-medicine', 0, 2, 0.38, 1.8],
            ['lz-obelisk', 0, 3, 0.55, 2.0],
            ['lz-tower', 1, 0, 0.25, 2.0],
            ['lz-tower', 1, 1, 0.72, 2.0],
            ['lz-tower', 1, 2, 0.28, 2.0],
            ['lz-tower', 1, 3, 0.74, 2.0],
            ['lz-hall-bronze', 2, 0, 0.35, 2.0],
            ['lz-hall-reed', 2, 1, 0.62, 2.0],
            ['lz-hall-bone', 2, 2, 0.38, 2.0],
            ['lz-warehouse', 2, 3, 0.60, 2.0],
            ['lz-granary', 3, 0, 0.30, 2.2],
            ['lz-granary', 3, 1, 0.68, 2.2],
            ['lz-granary', 3, 2, 0.34, 2.2],
            ['lz-granary', 3, 3, 0.66, 2.2],
            ['lz-barracks', 4, 1, 0.35, 2.4],
            ['lz-barracks', 4, 3, 0.65, 2.4]
          ];
          for (bi = 0; bi < specials.length; bi++) {
            sp = specials[bi];
            b = spiralBlocks[sp[1] * 4 + sp[2]];
            r1 = placeSpecial(sp[0], b, sp[3], sp[4]);
            if (r1) civicLots.push(r1);
          }

          /* Front every block on its inner street ONLY (nIn points toward the nest hall).
             In Winding 2 a small second inward-facing court line adds Makers' huts behind the front row so ~55 Makers'
             quarters fit cleanly; the outer half of every block holds the Mohenjo-daro brick wells. */
          for (bi = 0; bi < spiralBlocks.length; bi++) {
            b = spiralBlocks[bi];
            pool = POOLS[b.kind];
            st = KCITY.courts.stream(ctxSpiral, 'front', b);
            r1 = KCITY.courts.edgeRun(b.innerA, b.innerB, b.nIn, b, st, pool, ctxSpiral, 'spiral-inner', MAX_PER_ARM[b.winding], 1.8);
            spiralLots = spiralLots.concat(r1);
            if (b.winding === 2) {
              st2 = KCITY.courts.stream(ctxSpiral, 'second', b);
              r2 = KCITY.courts.edgeRun(b.innerA, b.innerB, b.nIn, b, st2, [['lz-makers', 1]], ctxSpiral, 'spiral-tier2', 3, 16.5);
              spiralLots = spiralLots.concat(r2);
            }
            /* Brick wells (gl-well) in the block's outer half (PLAN.md section 4: yards and wells in the outer half) */
            stW = KCITY.courts.stream(ctxSpiral, 'wells', b);
            var nWells = b.winding === 0 ? 1 : 2, wi;
            for (wi = 0; wi < nWells; wi++) {
              uw = 0.24 + wi * 0.48 + (stW.next() - 0.5) * 0.12;
              ox = b.innerA[0] + (b.innerB[0] - b.innerA[0]) * uw - b.nIn[0] * (b.depthM * 0.72);
              oz = b.innerA[1] + (b.innerB[1] - b.innerA[1]) * uw - b.nIn[1] * (b.depthM * 0.72);
              wc = KCITY.courts.place('gl-well', [ox, oz], b.nIn, b, ctxSpiral, 'outer-well');
              if (wc) wellLots.push(wc);
            }
          }
        }
      }
    ];

    var cityInst = KCITY.create({
      name: 'gila', tune: TUNE_GILA, seed: SEED, rand: 'krand',
      index: { order: 'insertion' }, ground: { h: groundH }, kit: { dims: kitDims }, steps: steps
    });
    cityPlan = cityInst.run();
  } catch (e) {
    cityErr = e;
    reportErr('gila: core/city spiral failed: ' + (e && e.stack ? e.stack : e));
  }

  /* ---------------------------------------------------------------- 5. Salt-works hamlet on KHAMLET.village (step G5) */
  var hamletGroundOk = function (x, z) {
    if (x < N.x0 + 80 || x > N.x1 - 80 || z < N.z0 + 80 || z > N.z1 - 80) return false;
    var y = groundH(x, z);
    if (y < LAKE_Y + 2.0) return false;
    var sx = Math.abs(groundH(x + 10, z) - groundH(x - 10, z)) / 20;
    var sz = Math.abs(groundH(x, z + 10) - groundH(x, z - 10)) / 20;
    return Math.hypot(sx, sz) <= 0.24;
  };
  var saltHamlet = KHAMLET.village({
    id: 'gila-salt', world: SEED + 5, culture: 'lizardmen', focus: 'salt',
    site: { x: 1460, z: 300 }, link: { x: 260, z: 110 },
    resource: { x: 1690, z: 320, workers: 48 }, popMax: 210,
    dims: function (k) { return kitDims(k, 0); },
    ground: { ok: hamletGroundOk }
  });

  /* ---------------------------------------------------------------- 6. Assemble every site with non-overlap & ground seating */
  var space = KSPACE.create({ cell: 32 });
  var sites = [], plinths = [], overlapSkips = 0;

  function obbOf(x, z, ry, w, d, pad) {
    var p = glD(pad, 0), c = Math.cos(ry), s = Math.sin(ry);
    return { x: x, z: z, ux: c, uz: -s, hw: w / 2 + p, hd: d / 2 + p };
  }

  function footStats(x, z, ry, w, d) {
    var c = Math.cos(ry), s = Math.sin(ry), lo = groundH(x, z), hi = lo, k, a, b, px, pz, y;
    var pts = [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]];
    for (k = 0; k < pts.length; k++) {
      a = pts[k][0] * w / 2; b = pts[k][1] * d / 2;
      px = x + a * c + b * s; pz = z - a * s + b * c;
      y = groundH(px, pz);
      if (y < lo) lo = y;
      if (y > hi) hi = y;
    }
    return { lo: lo, hi: hi };
  }

  function addSite(key, x, z, ry, kind, opts) {
    var D = DEFS[key];
    if (!D) return null;
    opts = opts || {};
    var R = obbOf(x, z, ry, D.w, D.d, 0);
    if (!opts.allowOverlap) {
      var hit = space.some(x, z, Math.hypot(D.w, D.d) / 2 + 36, function (it) {
        return KHAMLET.overlap(R, it.R, glD(opts.pad, 0.4));
      });
      if (hit) { overlapSkips++; return null; }
    }
    space.insert({ R: R, key: key, kind: kind }, x, z, Math.hypot(D.w, D.d) / 2);
    var fs = footStats(x, z, ry, D.w, D.d);
    /* Seat on the highest ground under the footprint (+ 0.03 m) so no terrain triangle ever pokes through an interior floor,
       and record a fitted basalt/earth plinth down to fs.lo - 0.35 m so no corner ever floats in the air. Beasts stand at groundH. */
    var y = D.cls === 'life' ? groundH(x, z) : fs.hi + 0.03;
    var v = glD(opts.v, KRAND.hash(SEED, KTAGS.str32(key), Math.round(x), Math.round(z)) % 3);
    var rec = {
      key: key, x: +x.toFixed(2), z: +z.toFixed(2), y: +y.toFixed(3), ry: +ry.toFixed(5),
      w: D.w, d: D.d, h: D.h, kind: kind, footLo: +fs.lo.toFixed(3), footHi: +fs.hi.toFixed(3),
      inward: !!opts.inward,
      o: Object.assign({ y: +y.toFixed(3), v: v }, opts.name ? { name: opts.name } : {})
    };
    sites.push(rec);
    if (D.cls !== 'life') {
      plinths.push({
        key: key, x: rec.x, z: rec.z, ry: rec.ry, w: D.w, d: D.d,
        y0: +(fs.lo - 0.38).toFixed(3), y1: +(y + 0.005).toFixed(3),
        stone: D.caste === 5 || D.caste === 'all' || key === 'lz-lodge' || key === 'gl-tank' || key === 'gl-well'
      });
    }
    return rec;
  }

  /* 6a. Central court: the nest hall at the origin, the clapperless bells and paired stelae before it, turned stelae opposite,
         and the ley line stone at the court's SW edge aimed straight at the west reliquary */
  var nestRy = Math.atan2(-e2[0], -e2[1]); /* front toward the inner court's SE side */
  addSite('lz-nest', 0, 0, nestRy, 'nest', { name: 'The nest hall of Gila' });
  addSite('lz-bells', Math.sin(nestRy) * 31 - Math.cos(nestRy) * 7, Math.cos(nestRy) * 31 + Math.sin(nestRy) * 7, nestRy, 'monument');
  addSite('lz-stela-pair', Math.sin(nestRy) * 31 + Math.cos(nestRy) * 8, Math.cos(nestRy) * 31 - Math.sin(nestRy) * 8, nestRy, 'monument');
  addSite('lz-stela-turned', -Math.sin(nestRy) * 30, -Math.cos(nestRy) * 30, nestRy + Math.PI, 'monument');
  addSite('lz-ley', leyStoneAt[0], leyStoneAt[1], leyBearing + Math.PI, 'ley', { name: 'The ley line shrine (aimed at the west reliquary)' });

  /* 6b. Every lot placed on core/city's spiral (civic halls, dwellings by caste, outer-half brick wells) */
  if (cityPlan && cityPlan.lots) {
    for (var li = 0; li < cityPlan.lots.length; li++) {
      var Lt = cityPlan.lots[li];
      var lKind = Lt.key === 'gl-well' ? 'well' : Lt.key === 'gl-tank' ? 'tank' : Lt.why === 'civic' ? 'civic' : 'spiral';
      addSite(Lt.key, Lt.x, Lt.z, Lt.ry, lKind, { inward: true, pad: 0.15 });
    }
  }

  /* 6c. Outer NW mouth of the spiral: the mustering ground, war-camp tents and mouth lookout */
  var nwDir = e2;
  var musterX = mouthPt[0] + nwDir[0] * 38, musterZ = mouthPt[1] + nwDir[1] * 38;
  var musterRy = Math.atan2(-nwDir[0], -nwDir[1]);
  addSite('lz-muster', musterX, musterZ, musterRy, 'military', { name: 'The mustering ground at the spiral mouth' });
  addSite('lc-seer', musterX + e1[0] * 24, musterZ + e1[1] * 24, musterRy - 0.3, 'camp');
  addSite('lc-sail', musterX - e1[0] * 24, musterZ - e1[1] * 24, musterRy + 0.3, 'camp');
  addSite('lz-lookout', musterX + nwDir[0] * 42 + e1[0] * 28, musterZ + nwDir[1] * 42 + e1[1] * 28, Math.atan2(nwDir[0], nwDir[1]), 'lookout', { name: 'The spit-crest lookout' });
  /* Second lookout on the south-east shoulder watching Gila's salt lake */
  addSite('lz-lookout', 520, 620, Math.atan2(1, 0.8), 'lookout', { name: 'The lake-shoulder lookout' });

  /* 6d. East-shore salt works: KHAMLET.village records + evaporating salt-pan fields along the shore bench */
  var hamletPlaced = 0;
  if (saltHamlet && !saltHamlet.error && saltHamlet.records) {
    for (var hi = 0; hi < saltHamlet.records.length; hi++) {
      var hr = saltHamlet.records[hi];
      if (!hr.pending && addSite(hr.key, hr.x, hr.z, hr.ry, 'hamlet', { pad: 0.2 })) hamletPlaced++;
    }
    /* One brick well on the salt hamlet's green */
    addSite('gl-well', saltHamlet.site.x + 12, saltHamlet.site.z - 8, 0, 'well', { pad: 0.2 });
  }
  /* Shore-edge evaporating pan spirals letting in the lake's brine, sluices (+z) turned toward the lake (+x) */
  var shorePans = [[1690, 140], [1690, 220], [1690, 300], [1690, 380], [1690, 460]];
  for (var pi = 0; pi < shorePans.length; pi++) {
    addSite('gl-pans', shorePans[pi][0], shorePans[pi][1], Math.PI / 2, 'saltworks', { pad: 0.5 });
  }
  addSite('gl-saltstore', 1640, 260, Math.PI / 2, 'saltworks', { name: 'The shore salt store' });

  /* 6e. Country up the spit's crest NW: crop fields (kits/crops), farms, panemone windmills, herds, stone circle */
  var fields = [];
  var CROP_CYCLE = ['ashmillet', 'frillpod', 'ballmelon', 'bambara', 'sandpan-fonio'];
  (function buildFields() {
    var pw = 130, pd = 84, i, j, cx, cz, h, slx, slz;
    for (i = -18; i <= -6; i++) {
      for (j = -26; j <= -8; j++) {
        cx = i * pw; cz = j * pd;
        if (Math.hypot(cx, cz) < 690) continue;
        if (groundH(cx, cz) < LAKE_Y + 35) continue;
        slx = Math.abs(groundH(cx + 20, cz) - groundH(cx - 20, cz)) / 40;
        slz = Math.abs(groundH(cx, cz + 20) - groundH(cx, cz - 20)) / 40;
        if (Math.hypot(slx, slz) > 0.14) continue;
        h = KRAND.hash(SEED, 91, i + 100, j + 100) % 100;
        if (h < 22) continue;
        fields.push({
          id: 'gl.field.' + i + '.' + j,
          box: [cx - pw * 0.44, cz - pd * 0.44, cx + pw * 0.44, cz + pd * 0.44],
          kind: h < 55 ? 'tilled' : h < 84 ? 'crop' : 'fallow',
          crop: CROP_CYCLE[h % CROP_CYCLE.length]
        });
      }
    }
  })();

  var farmSpots = [[-860, -840, 0.4], [-1120, -1040, -0.3], [-1360, -1280, 0.8], [-980, -1480, 1.1], [-1580, -1560, -0.5], [-1260, -1800, 0.2]];
  for (var fi = 0; fi < farmSpots.length; fi++) {
    addSite('lz-farm', farmSpots[fi][0], farmSpots[fi][1], farmSpots[fi][2], 'farm');
    addSite('gl-well', farmSpots[fi][0] + 22, farmSpots[fi][1] + 6, farmSpots[fi][2] + Math.PI, 'well');
  }
  /* Two panemone windmills on the windy NW crest */
  addSite('lz-windmill', -940, -720, 0.35, 'mill', { name: 'East-crest panemone windmill' });
  addSite('lz-windmill', -1460, -1420, 0.35, 'mill', { name: 'Upper-crest panemone windmill' });
  /* Grazing frilled lizards and burden beasts along the field margins */
  var herdSpots = [
    ['frilled', -720, -830, 0.5], ['frilled', -728, -822, 2.1], ['frilled', -714, -836, 4.0],
    ['frilled', -1120, -1120, 1.2], ['frilled', -1128, -1114, 3.4],
    ['burden', -830, -700, 0.9], ['burden', -1360, -1310, -0.7], ['burden', 960, 210, 1.3]
  ];
  for (var bi2 = 0; bi2 < herdSpots.length; bi2++) {
    addSite(herdSpots[bi2][0], herdSpots[bi2][1], herdSpots[bi2][2], herdSpots[bi2][3], 'herd');
  }
  /* Phyllotaxis stone circle high on the NW crest beyond the fields */
  addSite('lz-circle', -1820, -1980, 0.2, 'monument', { name: 'The crest stone circle' });

  /* 6f. The isolated West Reliquary on the south-west shore, ~3.8 km SW behind the shoulder */
  var reliqSite = addSite('lz-reliquary', RELIQ.x, RELIQ.z, leyBearing + Math.PI, 'reliquary', {
    name: 'The west reliquary on Gila\'s salt lake'
  });

  /* Country ways for ground zone painting (the salt haul track to the east shore, the NW farm track, the straight ley path) */
  var countryWays = [
    { id: 'ley-path', w: 5.5, pts: leyCountryTrack },
    { id: 'salt-road', w: 6.5, pts: [[mouthPt[0], mouthPt[1]], [260, 110], [880, 210], [1460, 300], [1680, 300]] },
    { id: 'crest-track', w: 5.5, pts: [[mouthPt[0], mouthPt[1]], [-780, -740], [-1160, -1160], [-1520, -1540], [-1820, -1965]] }
  ];
  if (saltHamlet && saltHamlet.lanes) {
    for (var sli = 0; sli < saltHamlet.lanes.length; sli++) {
      countryWays.push({ id: 'salt-lane-' + sli, w: 5.0, pts: saltHamlet.lanes[sli].pts });
    }
  }

  /* ---------------------------------------------------------------- 7. Census & geometry checks */
  /* Holds per dwelling key (PLAN.md section 3):
       lz-warren: 28 (caste 1), lz-makers: 10 (caste 2), craft halls: 12 (caste 2),
       lz-longhouse: 33 (caste 3), lz-lodge: 30 (18 caste 4 + 12 caste 6), lz-tower: 7 (caste 5) */
  var HOLDS = {
    'lz-warren': { total: 28, c: { 1: 28 } },
    'lz-makers': { total: 10, c: { 2: 10 } },
    'lz-hall-bronze': { total: 12, c: { 2: 12 } },
    'lz-hall-reed': { total: 12, c: { 2: 12 } },
    'lz-hall-bone': { total: 12, c: { 2: 12 } },
    'lz-longhouse': { total: 33, c: { 3: 33 } },
    'lz-lodge': { total: 30, c: { 4: 18, 6: 12 } },
    'lz-tower': { total: 7, c: { 5: 7 } }
  };
  var people = { spiral: 0, hamlet: 0, total: 0, byCaste: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, byKey: {} };
  var byKind = {};
  var inwardBad = 0;
  for (var si = 0; si < sites.length; si++) {
    var sRec = sites[si];
    byKind[sRec.kind] = glD(byKind[sRec.kind], 0) + 1;
    people.byKey[sRec.key] = glD(people.byKey[sRec.key], 0) + 1;
    var hd = HOLDS[sRec.key];
    if (hd) {
      if (sRec.kind === 'hamlet') people.hamlet += hd.total;
      else people.spiral += hd.total;
      people.total += hd.total;
      for (var ck in hd.c) people.byCaste[ck] += hd.c[ck];
    }
    if (sRec.inward) {
      /* Front vector (sin ry, cos ry) must point inward (positive dot with (-x, -z) toward the nest hall) */
      var fx = Math.sin(sRec.ry), fz = Math.cos(sRec.ry);
      if (fx * (-sRec.x) + fz * (-sRec.z) <= 0) inwardBad++;
    }
  }

  /* Verify pairwise non-overlap across ALL top-level non-life sites */
  var overlapPairs = 0;
  (function checkOverlaps() {
    var blds = sites.filter(function (q) { return DEFS[q.key] && DEFS[q.key].cls !== 'life'; });
    var i, j, a, b, ra, rb;
    for (i = 0; i < blds.length; i++) {
      a = blds[i]; ra = obbOf(a.x, a.z, a.ry, a.w, a.d, 0);
      for (j = i + 1; j < blds.length; j++) {
        b = blds[j];
        if (Math.hypot(a.x - b.x, a.z - b.z) > Math.hypot(a.w, a.d) / 2 + Math.hypot(b.w, b.d) / 2 + 1) continue;
        rb = obbOf(b.x, b.z, b.ry, b.w, b.d, 0);
        if (KHAMLET.overlap(ra, rb, -0.05)) overlapPairs++;
      }
    }
  })();

  /* Helper for ground vertex zone weights (used by 90g-gl-world.js, pure math on records) */
  function segDist(x, z, a, b) {
    var dx = b[0] - a[0], dz = b[1] - a[1], l2 = Math.max(1e-9, dx * dx + dz * dz);
    var t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2));
    return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz);
  }
  function lineDist(x, z, pts) {
    var best = 1e9, i;
    for (i = 0; i + 1 < pts.length; i++) {
      var d = segDist(x, z, pts[i], pts[i + 1]);
      if (d < best) best = d;
    }
    return best;
  }
  /* Returns [wSalt, wTill, wYard, wet] in 0..1 at world (x, z) */
  function zoneAt(x, z) {
    var y = groundH(x, z), aboveLake = y - LAKE_Y;
    var wSalt = 1 - sm(1.5, 16.0, aboveLake);
    if (x > 1540 && z > 20 && z < 580) wSalt = Math.max(wSalt, 1 - sm(18, 45, Math.abs(x - 1680)));
    var wTill = 0, i, bx;
    if (x < -450 && z < -450) {
      for (i = 0; i < fields.length; i++) {
        bx = fields[i].box;
        if (x >= bx[0] - 12 && x <= bx[2] + 12 && z >= bx[1] - 12 && z <= bx[3] + 12) {
          wTill = fields[i].kind === 'fallow' ? 0.45 : 0.95;
          break;
        }
      }
    }
    var wYard = 0;
    var spAb = toSkew(x, z);
    var maxAb = Math.max(Math.abs(spAb[0]), Math.abs(spAb[1]));
    if (maxAb < 430) {
      wYard = 0.42 * (1 - sm(355, 430, maxAb));
      var ds = lineDist(x, z, spiralPts);
      if (ds < STREET_W + 22) wYard = Math.max(wYard, 0.88 * (1 - sm(STREET_W * 0.6, STREET_W + 22, ds)));
    }
    var dl = lineDist(x, z, leyCountryTrack);
    if (dl < 24) wYard = Math.max(wYard, 0.85 * (1 - sm(5, 24, dl)));
    for (i = 0; i < countryWays.length; i++) {
      var dw = lineDist(x, z, countryWays[i].pts);
      if (dw < countryWays[i].w + 20) wYard = Math.max(wYard, 0.82 * (1 - sm(countryWays[i].w * 0.5, countryWays[i].w + 20, dw)));
    }
    if (saltHamlet && saltHamlet.site && Math.hypot(x - saltHamlet.site.x, z - saltHamlet.site.z) < 95) {
      wYard = Math.max(wYard, 0.65);
    }
    if (Math.hypot(x - RELIQ.x, z - RELIQ.z) < 42) wYard = Math.max(wYard, 0.8);
    var wet = 1 - sm(0.2, 5.5, Math.abs(aboveLake));
    return [
      Math.max(0, Math.min(1, wSalt)),
      Math.max(0, Math.min(1, wTill)),
      Math.max(0, Math.min(1, wYard * (1 - wSalt * 0.7))),
      Math.max(0, Math.min(1, wet))
    ];
  }

  return {
    seed: SEED, lakeY: LAKE_Y, near: N, far: F, nearH: nearH, farH: farH, farRaw: farRaw,
    modelH: modelH, groundH: groundH, drawnNear: drawnNear, drawnFar: drawnFar,
    e1: e1, e2: e2, toSkew: toSkew, skewPt: skewPt,
    spiralPts: spiralPts, mouthPt: mouthPt, spiralBlocks: spiralBlocks,
    cornerAnglesDeg: cornerAnglesDeg, windingDepths: windingDepths,
    ley: { stoneAt: leyStoneAt, bearing: leyBearing, unit: leyU, cityWay: leyCityWay, track: leyCountryTrack },
    reliquary: { x: RELIQ.x, z: RELIQ.z, distM: +leyDist.toFixed(1), ry: +(leyBearing + Math.PI).toFixed(5), los: losHidden, site: reliqSite },
    cityErr: cityErr ? String(cityErr) : null,
    saltHamlet: {
      id: saltHamlet.id, error: saltHamlet.error || null,
      census: saltHamlet.census, site: saltHamlet.site,
      records: saltHamlet.records ? saltHamlet.records.length : 0, placed: hamletPlaced
    },
    fields: fields, countryWays: countryWays,
    sites: sites, plinths: plinths,
    people: people, byKind: byKind,
    inwardBad: inwardBad, overlapPairs: overlapPairs, overlapSkips: overlapSkips,
    pin: { model: +GL_GROUND.model.toFixed(2), bicubic: +pinModelY.toFixed(2), drawn: +groundH(0, 0).toFixed(2) },
    zoneAt: zoneAt
  };
})();
