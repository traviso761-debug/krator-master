// ================================================================= TORUS — 8bl: Botanical Sky-Fruitvines, Terrace Crops, SWBay Woods & Soleri Flora ([draw])
// Replaces 100% of placeholder vegetation with genuine biomes/swbay & kits/crops plants:
//   1. 44 Botanical `sky-fruitvine` (CROPS.BY_ID['sky-fruitvine']) curtains on both Wheel Rims (r=560m Ruby-Tart & r=720m Golden-Sun):
//      gnarled branching BIO.tube woody lianas cascading 80-140 m from irrigated loam troughs, layered alpha-cutout card_vine curtains,
//      sunlit card_broadleaf sprays, and hundreds of 3D pendulous Ruby-Tart & Golden-Sun fruit racemes + ground vineyard trellises.
//   2. Forest Ring Stepped Crown Woods (+600, +632, +664 m), Outer Wheel Wood (WY=300m, r=648..712m), and SWBAY.dress overgrowth.
//   3. 182 Terrace `agPlots` & 4 Working Soleri Pod Farm/Orchard Arrays planted with real CROPS + AV.CARD_RECTS crop rows & orchard trees.
//   4. 8 Specimen Ag-Domes (including luminous Amber-Sap Mother Tree!) & 4 Quarantined Feral Ag-Domes bursting with SWBAY hyperflora.
//   5. 8 Ruined Soleri Pod Arrays (2/3) draped in faceted card_broadleaf vine mats & KRUBBLE rubble flora + SWBAY savanna & Tors Rivrh reeds.

const TORUS_FLORA = (function buildTorusFlora() {
  const floraGroup = new THREE.Group();
  floraGroup.name = 'torus_flora_root';
  scene.add(floraGroup);

  if (typeof BIO === 'undefined' || typeof SWBAY === 'undefined') {
    return {
      group: floraGroup,
      skyVineRecord: null,
      vineCurtains: 0,
      vineFruitBunches: 0,
      cropPlants: 0,
      orchardTrees: 0,
      swbayTrees: 0,
      specimenPlants: 0,
      feralPlants: 0,
      ruinedPodMats: 0,
      blobbyAncients: 0
    };
  }

  const TAU = Math.PI * 2;
  const deg = Math.PI / 180;
  const rvx = Math.cos(318 * deg), rvz = Math.sin(318 * deg);
  const rtx = -rvz, rtz = rvx;

  const skyVineRecord = (typeof CROPS !== 'undefined' && CROPS && CROPS.BY_ID)
    ? CROPS.BY_ID['sky-fruitvine'] : null;

  // Scale SWBAY megaflora crowns proportionally so Wheel/Crown & valley trees have balanced silhouettes
  if (!SWBAY._torusScaled) {
    const k = Math.pow(SWBAY.TEMPLE_H / 110.0, 0.72);
    SWBAY.SPECIES.forEach(function (S) {
      if (['prismgum', 'baobab', 'captree', 'fancrown', 'ironbark'].indexOf(S.key) >= 0) {
        S.crownR = S.crownR.map(function (v) { return v * k; });
        S.rb = S.rb.map(function (v) { return v * k; });
      }
    });
    SWBAY._torusScaled = k;
  }

  BIO.LOD.merge = true;
  BIO.LOD.minTris = 4500;
  BIO.LOD.chunk = 580;

  function normDeg(d) {
    const x = d % 360;
    return x < 0 ? x + 360 : x;
  }
  function angDiff(a, b) {
    const d = Math.abs(normDeg(a) - normDeg(b));
    return d > 180 ? 360 - d : d;
  }
  function inArc(d, d0, d1) {
    const x = normDeg(d), a = normDeg(d0), b = normDeg(d1);
    return a <= b ? (x >= a && x <= b) : (x >= a || x <= b);
  }

  function riverBankDist(x, z) {
    const dn = x * rvx + z * rvz;
    const dt = x * rtx + z * rtz;
    const rc = 1045.0 + 36.0 * Math.sin(dt / 520.0);
    return Math.abs(dn - rc);
  }

  const builtSectors = TORUS_PLAN.builtSectors || [];
  function inBuiltSector(r, d, padDeg) {
    const p = padDeg == null ? 0.8 : padDeg;
    for (let i = 0; i < builtSectors.length; i++) {
      const bs = builtSectors[i];
      if (r >= bs.rIn - 3.5 && r <= bs.rOut + 3.5 && inArc(d, bs.deg0 - p, bs.deg1 + p)) return true;
    }
    return false;
  }

  function nearRoad(x, z, pad) {
    const r = Math.hypot(x, z);
    const d = normDeg(Math.atan2(z, x) / deg);
    const roads = TORUS_PLAN.roads;
    for (let i = 0; i < roads.length; i++) {
      const rd = roads[i];
      const hw = 0.5 * rd.width + pad;
      if (rd.kind === 'radial') {
        if (r < rd.r0 - 6 || r > rd.r1 + 6) continue;
        const perp = r * Math.sin(Math.min(0.5 * Math.PI, angDiff(d, rd.deg) * deg));
        if (perp < hw) return true;
      } else if (rd.kind === 'ring') {
        if (Math.abs(r - rd.r) < hw) return true;
      }
    }
    const hl = TORUS_PLAN.hinterland;
    if (hl && hl.farmLanes && r > 1100) {
      for (let f = 0; f < hl.farmLanes.length; f++) {
        const fr = hl.farmLanes[f];
        const dx = fr.to[0] - fr.from[0], dz = fr.to[1] - fr.from[1];
        const len2 = dx * dx + dz * dz;
        if (len2 < 1) continue;
        const t = Math.max(0, Math.min(1, ((x - fr.from[0]) * dx + (z - fr.from[1]) * dz) / len2));
        const px = fr.from[0] + dx * t, pz = fr.from[1] + dz * t;
        if (Math.hypot(x - px, z - pz) < 0.5 * fr.width + pad) return true;
      }
    }
    return false;
  }

  // Obstacles for wild hinterland scatter (keep clear of landmarks, domes, gates, and Soleri structures)
  const obstacles = [];
  for (let i = 0; i < TORUS_PLAN.landmarks.length; i++) {
    const lm = TORUS_PLAN.landmarks[i];
    if (lm.r > 0) obstacles.push({ x: lm.x, z: lm.z, r: Math.max(lm.w, lm.d) * 0.65 + 14.0 });
  }
  for (let g = 0; g < TORUS_PLAN.gates.length; g++) {
    const gt = TORUS_PLAN.gates[g];
    obstacles.push({ x: gt.x, z: gt.z, r: 28.0 });
  }
  const solStructs = (TORUS_PLAN.hinterland && TORUS_PLAN.hinterland.soleriStructures)
    ? TORUS_PLAN.hinterland.soleriStructures : [];
  for (let s = 0; s < solStructs.length; s++) {
    const sf = solStructs[s];
    obstacles.push({ x: sf.x, z: sf.z, r: 0.52 * Math.max(sf.w, sf.d) + 8.0 });
  }
  const farmOb = (TORUS_PLAN.hinterland && TORUS_PLAN.hinterland.farmOutbuildings)
    ? TORUS_PLAN.hinterland.farmOutbuildings : [];
  for (let fo = 0; fo < farmOb.length; fo++) {
    const fb = farmOb[fo];
    obstacles.push({ x: fb.x, z: fb.z, r: 0.6 * Math.hypot(fb.w, fb.d) + 5.0 });
  }

  function nearObstacle(x, z, pad) {
    for (let i = 0; i < obstacles.length; i++) {
      const ob = obstacles[i];
      const dx = x - ob.x, dz = z - ob.z;
      const rr = ob.r + pad;
      if (dx * dx + dz * dz < rr * rr) return true;
    }
    return false;
  }

  const workFields = (TORUS_PLAN.hinterland && TORUS_PLAN.hinterland.hinterlandFields)
    ? TORUS_PLAN.hinterland.hinterlandFields.filter(function (f) { return !f.ruined; }) : [];
  function inWorkingHinterland(x, z) {
    const r = Math.hypot(x, z);
    if (r < 1150) return false;
    const d = normDeg(Math.atan2(z, x) / deg);
    for (let i = 0; i < workFields.length; i++) {
      const wf = workFields[i];
      if (r >= wf.rIn - 8 && r <= wf.rOut + 8 && inArc(d, wf.deg0 - 1, wf.deg1 + 1)) return true;
    }
    return false;
  }

  // LOD origin spine covering Forest Ring, Wheel, Terraces, and 6 km Soleri Hinterlands
  const spine = [[0, 0]];
  for (let a = 0; a < 360; a += 45) {
    spine.push([640 * Math.cos(a * deg), 640 * Math.sin(a * deg)]);
    spine.push([1020 * Math.cos((a + 22.5) * deg), 1020 * Math.sin((a + 22.5) * deg)]);
    spine.push([1850 * Math.cos(a * deg), 1850 * Math.sin(a * deg)]);
  }

  BIO.init({
    THREE: THREE,
    scene: floraGroup,
    terrainH: torusGroundAt,
    seed: TORUS_SEED + 809,
    origin: spine,
    center: [0, 0],
    obstacles: obstacles,
    eye: function () { return [camera.position.x, camera.position.y, camera.position.z]; },
    ticks: function (fn) {
      ANC_TICKS.push(function (dt) {
        fn(dt == null ? 0.016 : dt, 0.5);
      });
    },
    mask: function (x, z) {
      const h = torusGroundAt(x, z);
      if (h < -0.25) return 0; // Deep Tors Rivrh channel
      const r = Math.hypot(x, z);
      const rbd = riverBankDist(x, z);
      // Lush riparian margin along Tors Rivrh outside the inner terraces
      if (rbd >= 26.0 && rbd <= 58.0 && r > 980.0 && !nearRoad(x, z, 10.0)) return 1.0;
      // Inside Customs Wall (r < 1165m) or inside cultivated working hinterland farms: planted explicitly with CROPS!
      if (r < 1165.0) return 0;
      if (inWorkingHinterland(x, z) || nearRoad(x, z, 9.0)) return 0;
      return Math.min(1.0, (r - 1165.0) / 45.0);
    },
    fields: {
      wet: function (x, z) {
        const rbd = riverBankDist(x, z);
        if (rbd < 95.0) return 0.88 - 0.56 * (rbd / 95.0);
        return 0.30 + 0.10 * KRAND.fbm(x / 460.0, 0.7, z / 460.0, 2, 8831);
      },
      upland: function (x, z) {
        return riverBankDist(x, z) < 75.0 ? 0.10 : 0.65;
      },
      flow: function (x, z) {
        return riverBankDist(x, z) < 55.0 ? 0.80 : 0.0;
      },
      salt: function () { return 0; }
    }
  });

  // ----------------------------------------------------------------- 1. Wild Hinterland Savanna & Tors Rivrh Riparian Corridor (SWBAY)
  const buildOut = SWBAY.build({ R: 2250, quality: 0.14, fauna: false });

  for (let rb = -18; rb <= 18; rb++) {
    if (Math.abs(rb) <= 2) continue;
    const dt = rb * 105.0;
    for (let side = -1; side <= 1; side += 2) {
      const dn = 1045.0 + 36.0 * Math.sin(dt / 520.0) + side * 28.5;
      const rx = dn * rvx + dt * rtx;
      const rz = dn * rvz + dt * rtz;
      if (nearObstacle(rx, rz, 6.0) || nearRoad(rx, rz, 8.0)) continue;
      const ry = torusGroundAt(rx, rz);
      SWBAY.plantAt(rb % 2 === 0 ? 'reed' : 'splaylet', rx, Math.max(-0.5, ry), rz, {
        seed: KRAND.hash(TORUS_SEED, rb + 60, side + 3, 929),
        lv: 2
      });
    }
  }

  // ----------------------------------------------------------------- 2. Forest Ring Crown Woods, Outer Wheel Wood & SWBAY.dress Overgrowth
  function ringSoilOffset(x, z, ringIdx) {
    const fVal = (typeof fbm === 'function')
      ? fbm(x * 0.014, z * 0.014, 9485 + ringIdx, 2)
      : KRAND.fbm(x * 0.014, 0.2, z * 0.014, 2, 9485 + ringIdx);
    return 1.1 + 2.0 * fVal;
  }

  let swbayPlacedTrees = SWBAY.TREES ? SWBAY.TREES.length : (buildOut.trees == null ? 0 : buildOut.trees);
  const WOOD_SPECIES = ['ashcherry', 'fancrown', 'crownfern', 'dragon', 'monkey', 'acacia', 'splay'];

  // 2a. Outer Wheel Wood (WY = 300 m, r = 650..709 m)
  const rngWheelWood = KRAND.stream(KRAND.child(TORUS_SEED, 'torus_wheel_wood_swbay'));
  for (let i = 0; i < 105; i++) {
    const d = rngWheelWood.range(0, 360);
    if (TORUS.inWheelRuinZone(680, d)) continue;
    if (angDiff(d, 202.5) < 7.0) continue; // Keep Great Cider-Press outer vat yard clear
    const r = Math.sqrt(rngWheelWood.range(651 * 651, 708 * 708));
    const a = d * deg;
    const wx = r * Math.cos(a), wz = r * Math.sin(a);
    const wy = 300.0 + ringSoilOffset(wx, wz, 3);
    const flatG = function () { return wy; };
    const spKey = WOOD_SPECIES[i % WOOD_SPECIES.length];
    const t = SWBAY.treeAt(spKey, wx, wy, wz, {
      seed: KRAND.hash(TORUS_SEED, i, 1103),
      scale: rngWheelWood.range(0.62, 0.94),
      wet: 0.68,
      ground: flatG
    });
    if (t) swbayPlacedTrees++;
    if (i % 2 === 0) {
      SWBAY.plantAt(i % 4 === 0 ? 'fern' : 'blooms', wx + rngWheelWood.range(-2.4, 2.4), wy, wz + rngWheelWood.range(-2.4, 2.4), {
        seed: KRAND.hash(TORUS_SEED, i, 1109),
        lv: 2,
        ground: flatG
      });
    }
  }

  // 2b. Stepped Botanical Crown 3 Forest Toruses (+600m r=297..331, +632m r=209..231, +664m r=121..143)
  const CROWN_TORUSES = [
    { idx: 0, y: 600.0, r0: 297.0, r1: 331.0, count: 52 },
    { idx: 1, y: 632.0, r0: 209.0, r1: 231.0, count: 34 },
    { idx: 2, y: 664.0, r0: 121.0, r1: 143.0, count: 22 }
  ];
  const crownBlds = (TORUS_PLAN.skyBuildings || []).filter(function (b) { return b.tier === 'stepped_crown'; });
  for (let ct = 0; ct < CROWN_TORUSES.length; ct++) {
    const ring = CROWN_TORUSES[ct];
    for (let j = 0; j < ring.count; j++) {
      const d = normDeg((360.0 * j) / ring.count + rngWheelWood.range(-2.2, 2.2));
      // Skip NW-SE Crown Fracture Wedge around 131.78 deg and the 8 radial stairs at multiples of 45 deg
      if (angDiff(d, TORUS_PLAN.arcology.crownFractureDeg) < 25.0) continue;
      let nearStair = false;
      for (let st = 0; st < 8; st++) {
        if (angDiff(d, st * 45.0) < 6.2) nearStair = true;
      }
      if (nearStair) continue;
      const r = rngWheelWood.range(ring.r0, ring.r1);
      const cx = r * Math.cos(d * deg), cz = r * Math.sin(d * deg);
      let nearCrownBld = false;
      for (let cb = 0; cb < crownBlds.length; cb++) {
        if (Math.abs(crownBlds[cb].y - ring.y) < 10 && Math.hypot(cx - crownBlds[cb].x, cz - crownBlds[cb].z) < 13.0) {
          nearCrownBld = true;
          break;
        }
      }
      if (nearCrownBld) continue;
      const cy = ring.y + ringSoilOffset(cx, cz, ring.idx);
      const flatC = function () { return cy; };
      const spKey = WOOD_SPECIES[(j + ct * 2) % WOOD_SPECIES.length];
      const t = SWBAY.treeAt(spKey, cx, cy, cz, {
        seed: KRAND.hash(TORUS_SEED, ct + 10, j, 1201),
        scale: rngWheelWood.range(0.52, 0.84),
        wet: 0.72,
        ground: flatC
      });
      if (t) swbayPlacedTrees++;
      SWBAY.plantAt(j % 3 === 0 ? 'rosette' : 'fern', cx + 1.8 * Math.cos(j), cy, cz + 1.8 * Math.sin(j), {
        seed: KRAND.hash(TORUS_SEED, ct + 10, j, 1213),
        lv: 2,
        ground: flatC
      });
    }
  }

  // 2c. Landmark Forecourt Planters (Board Hall)
  const lmPlanters = (TORUS_LANDMARKS_GROUP && TORUS_LANDMARKS_GROUP.userData && TORUS_LANDMARKS_GROUP.userData.landmarkPlanters)
    ? TORUS_LANDMARKS_GROUP.userData.landmarkPlanters : [];
  for (let lp = 0; lp < lmPlanters.length; lp++) {
    const pl = lmPlanters[lp];
    const py = pl.y;
    const flatP = function () { return py; };
    if (SWBAY.treeAt(pl.species || 'ashcherry', pl.x, py, pl.z, { seed: KRAND.hash(TORUS_SEED, lp, 1259), scale: pl.scale, wet: 0.65, ground: flatP })) {
      swbayPlacedTrees++;
    }
  }

  // 2d. Socket SWBAY.dress overgrowth onto Wheel rims/soffits, Stepped Crown & Barrel hoop ledges
  if (TORUS_ARCOLOGY_GROUP && TORUS_ARCOLOGY_GROUP.userData && typeof SWBAY.dress === 'function') {
    const ud = TORUS_ARCOLOGY_GROUP.userData;
    if (ud.dressShellsWheel && ud.dressShellsWheel.length > 0) {
      SWBAY.dress(ud.dressShellsWheel, {
        seed: 311,
        ledges: { moss: 180, plants: 150, edges: 90, treeH: 9.5, size: 2.8, hang: 16 },
        soffits: { n: 140, mossR: 5.0, hang: 15 },
        walls: { n: 75, hang: 12 }
      });
    }
    if (ud.dressShellsCrown && ud.dressShellsCrown.length > 0) {
      SWBAY.dress(ud.dressShellsCrown, {
        seed: 419,
        ledges: { moss: 150, plants: 130, edges: 75, treeH: 10.5, size: 3.0, hang: 16 },
        soffits: { n: 90, mossR: 4.8, hang: 13 },
        walls: { n: 60, hang: 11 }
      });
    }
    if (ud.dressShellsBarrel && ud.dressShellsBarrel.length > 0) {
      SWBAY.dress(ud.dressShellsBarrel, {
        seed: 523,
        ledges: { moss: 110, plants: 85, edges: 50, treeH: 9.0, size: 2.6, hang: 14 },
        soffits: { n: 65, mossR: 4.4, hang: 12 },
        walls: { n: 55, hang: 10 }
      });
    }
  }

  // ----------------------------------------------------------------- 3. Dedicated `toruscrops` BIO Kit (Sky-Fruitvines, Terrace Crops & Orchards)
  const libCrop = function (fam) {
    return (typeof KMAT !== 'undefined' && KMAT.mode === 'lib' && KMAT.packed)
      ? KMAT.packed('crops', fam) : null;
  };
  const cropCardMat = function (fam, tint) {
    const Pk = libCrop(fam);
    const T = Pk ? KMAT.textures(Pk, { aniso: 4, flipY: false }) : {};
    const m = BIO.leafMat(T.map || null, 'tc.' + fam, { alphaTest: 0.45 });
    m.color.setRGB(tint[0], tint[1], tint[2]).convertSRGBToLinear();
    m.name = 'toruscrops.' + fam;
    return m;
  };
  const RX = function (fam) {
    return (typeof AV !== 'undefined' && AV && AV.CARD_RECTS && AV.CARD_RECTS[fam]) ? AV.CARD_RECTS[fam] : undefined;
  };

  // Crossed 3-quad standing crop geometry (1m wide x 1m tall, v=0 at top y=1, v=1 at foot y=0 for flipY:false)
  const standGeo = (function () {
    const pos = [], nor = [], uv = [];
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI) / 3, c = Math.cos(a), s = Math.sin(a), n = [-s, 0, c];
      const Q = [[-0.5, 0, 1], [0.5, 0, 1], [0.5, 1, 0], [-0.5, 1, 0]].map(function (q) {
        return [c * q[0], q[1], s * q[0], q[0] + 0.5, q[2]];
      });
      [0, 1, 2, 0, 2, 3].forEach(function (i) {
        pos.push(Q[i][0], Q[i][1], Q[i][2]);
        nor.push(n[0], n[1], n[2]);
        uv.push(Q[i][3], Q[i][4]);
      });
    }
    return BIO.geo._make(pos, nor, uv);
  })();

  // Top-anchored crossed hanging vine-curtain geometry (y=0 at stem attachment -> y=-1 at trailing tip; v=0 at top, v=1 at bottom)
  const vineCurtainGeo = (function () {
    const pos = [], nor = [], uv = [];
    const angles = [-0.46, 0.46];
    for (let k = 0; k < angles.length; k++) {
      const a = angles[k], c = Math.cos(a), s = Math.sin(a);
      const droopZ = (k === 0 ? 0.08 : -0.08);
      const Q = [
        [-0.5 * c, 0.0, -0.5 * s, 0, 0],
        [0.5 * c, 0.0, 0.5 * s, 1, 0],
        [0.48 * c, -1.0, 0.48 * s + droopZ, 1, 1],
        [-0.48 * c, -1.0, -0.48 * s + droopZ, 0, 1]
      ];
      [0, 1, 2, 0, 2, 3].forEach(function (i) {
        pos.push(Q[i][0], Q[i][1], Q[i][2]);
        nor.push(-s * 0.6, 0.25, c * 0.6);
        uv.push(Q[i][3], Q[i][4]);
      });
    }
    return BIO.geo._make(pos, nor, uv);
  })();

  // Volumetric crossed broadleaf spray geometry centred on stem node
  const leafSprayGeo = (function () {
    const pos = [], nor = [], uv = [];
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI) / 3, c = Math.cos(a), s = Math.sin(a);
      const Q = [
        [-0.5 * c, -0.42, -0.5 * s, 0, 1],
        [0.5 * c, -0.42, 0.5 * s, 1, 1],
        [0.5 * c, 0.58, 0.5 * s, 1, 0],
        [-0.5 * c, 0.58, -0.5 * s, 0, 0]
      ];
      [0, 1, 2, 0, 2, 3].forEach(function (i) {
        pos.push(Q[i][0], Q[i][1], Q[i][2]);
        nor.push(Q[i][0] * 0.5, 0.85, Q[i][2] * 0.5);
        uv.push(Q[i][3], Q[i][4]);
      });
    }
    return BIO.geo._make(pos, nor, uv);
  })();

  // 3D Botanical Pendulous Fruit-Raceme Geometry: woody peduncle stem + 9 plump clustered ovoid berries (zero giant low-poly blobs!)
  const fruitRacemeGeo = (function () {
    const parts = [];
    const m4 = new THREE.Matrix4();
    // Main hanging peduncle stalk from y=0 down to y=-0.85
    m4.identity().setPosition(0, -0.42, 0);
    parts.push(TORUS_DRAW.bakeGeo(new THREE.CylinderGeometry(0.035, 0.022, 0.84, 5), m4, false, 1.0));
    // 9 clustered ovoid sky-fruits arranged in a dense tapering grape/pomelo panicle
    const berries = [
      [0.16, -0.26, 0.08, 0.17],
      [-0.15, -0.30, 0.11, 0.165],
      [0.03, -0.34, -0.17, 0.17],
      [0.19, -0.48, -0.06, 0.16],
      [-0.17, -0.52, -0.09, 0.155],
      [0.06, -0.56, 0.16, 0.155],
      [-0.09, -0.70, 0.08, 0.14],
      [0.11, -0.73, -0.07, 0.135],
      [0.0, -0.88, 0.0, 0.13]
    ];
    for (let b = 0; b < berries.length; b++) {
      const br = berries[b];
      const sg = new THREE.SphereGeometry(br[3], 6, 5);
      sg.scale(0.92, 1.24, 0.92);
      m4.identity().setPosition(br[0], br[1], br[2]);
      parts.push(TORUS_DRAW.bakeGeo(sg, m4, false, 0.8));
    }
    const mg = TORUS_DRAW.mergeGeoList(parts);
    return BIO.weldGeo ? BIO.weldGeo(mg) : mg;
  })();

  const fmDetail = TORUS_DRAW.getFurnDetailMaps();
  const rubyFruitMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xc82233).convertSRGBToLinear(),
    emissive: new THREE.Color(0x300509).convertSRGBToLinear(),
    map: fmDetail.map,
    roughnessMap: fmDetail.roughnessMap,
    roughness: 0.34,
    metalness: 0.04,
    side: THREE.DoubleSide
  });
  rubyFruitMat.name = 'toruscrops.ruby_tart_fruit';

  const goldFruitMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xeaa428).convertSRGBToLinear(),
    emissive: new THREE.Color(0x382004).convertSRGBToLinear(),
    map: fmDetail.map,
    roughnessMap: fmDetail.roughnessMap,
    roughness: 0.32,
    metalness: 0.05,
    side: THREE.DoubleSide
  });
  goldFruitMat.name = 'toruscrops.golden_sun_fruit';

  const amberResinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xffb838).convertSRGBToLinear(),
    emissive: new THREE.Color(0xd87c14).convertSRGBToLinear(),
    emissiveIntensity: 0.85,
    map: fmDetail.map,
    roughnessMap: fmDetail.roughnessMap,
    roughness: 0.24,
    metalness: 0.08,
    side: THREE.DoubleSide
  });
  amberResinMat.name = 'toruscrops.amber_sap_resin';

  const prevKit = BIO.kit('toruscrops');
  const tcApi = { SPECIES: [], TREES: [] };

  // Textured woody bark bucket for sky-fruitvine lianas, orchard trunks & Amber-Sap Mother Tree
  const woodyBarkMat = BIO.barkMat(fmDetail.map, 0xffffff);
  woodyBarkMat.name = 'toruscrops.woody_bark';
  BIO.bucket('sfv.liana', woodyBarkMat, { label: 'Woody sky-fruitvine liana & orchard trunk', uvScale: [1.6, 2.2] });

  // Define Sky-Fruitvine (`CROPS.BY_ID['sky-fruitvine']`) foliage curtains, broadleaf sprays & Ruby-Tart / Golden-Sun fruit bunches
  const vineCurtainMat = cropCardMat('card_vine', [0.76, 0.88, 0.64]);
  const vineSprayMat = cropCardMat('card_broadleaf', [0.70, 0.86, 0.56]);
  BIO.def('sfv.curtain', vineCurtainGeo, vineCurtainMat, {
    cls: 'flora', kind: 'plant', label: 'Sky-fruitvine trailing curtain',
    tags: { origin: 'farm', crop: 'sky-fruitvine' }, cap: 350000, capWhy: '44 giant 120m hanging Wheel fruitvine curtains'
  });
  BIO.def('sfv.spray', leafSprayGeo, vineSprayMat, {
    cls: 'flora', kind: 'plant', label: 'Sky-fruitvine broadleaf crown spray',
    tags: { origin: 'farm', crop: 'sky-fruitvine' }, cap: 350000, capWhy: '44 giant 120m hanging Wheel fruitvine curtains'
  });
  BIO.def('sfv.ruby.bunch', fruitRacemeGeo, rubyFruitMat, {
    cls: 'flora', kind: 'plant', label: 'Ruby-Tart sky-fruitvine cluster',
    tags: { origin: 'farm', crop: 'sky-fruitvine' }
  });
  BIO.def('sfv.gold.bunch', fruitRacemeGeo, goldFruitMat, {
    cls: 'flora', kind: 'plant', label: 'Golden-Sun sky-fruitvine cluster',
    tags: { origin: 'farm', crop: 'sky-fruitvine' }
  });
  BIO.def('sfv.amber.nodule', fruitRacemeGeo, amberResinMat, {
    cls: 'flora', kind: 'plant', label: 'Luminous Amber-Sap resin nodule',
    tags: { origin: 'specimen', crop: 'amber-sap' }
  });

  // Define 9-cell UV-cut `CROPS` field & orchard species from biomes/BOTANY-FOOD-CROPS.md & BOTANY-MEDICINAL-REAGENT-FUEL.md
  // (using AV.CARD_RECTS so every quad shows one whole plant cleanly!)
  const CROP_DEFS = [
    { key: 'emmer', fam: 'card_crop_grainhead', form: 'field', tint: [0.86, 0.80, 0.46], cropId: 'emmer', label: 'Plain emmer (swlowlands)' },
    { key: 'millet', fam: 'card_crop_plume', form: 'field', tint: [0.82, 0.78, 0.44], cropId: 'dustmillet', label: 'Terrace dust-millet' },
    { key: 'bambara', fam: 'card_crop_bean', form: 'field', tint: [0.62, 0.78, 0.42], cropId: 'bambara', label: 'Bambara groundnut, lentil & rattle-coffee' },
    { key: 'murnong', fam: 'card_crop_yam', form: 'field', tint: [0.60, 0.76, 0.40], cropId: 'murnong', label: 'Murnong yam-daisy & maar-yam' },
    { key: 'clover', fam: 'card_crop_clover', form: 'field', tint: [0.58, 0.78, 0.44], cropId: 'greens', label: 'Irrigated pasture clover & greens' },
    { key: 'herb', fam: 'card_crop_rosette', form: 'field', tint: [0.58, 0.76, 0.48], cropId: 'snow-lotus', label: 'Snow-lotus, goldroot & valley-ginseng' },
    { key: 'fumewort', fam: 'card_crop_flax', form: 'field', tint: [0.66, 0.74, 0.62], cropId: 'ivanchai', label: 'Ivan-chai fireweed & siphon-pit fumewort' },
    { key: 'woad_poppy', fam: 'card_crop_woad', form: 'field', tint: [0.56, 0.72, 0.78], cropId: 'sky-poppy', label: 'Oidong sky-poppy & valley woad' },
    { key: 'palmate', fam: 'card_crop_palmate', form: 'field', tint: [0.56, 0.76, 0.44], cropId: 'lotus-root', label: 'Giant lotus, kava & cured tobacco' },
    { key: 'saffron', fam: 'card_crop_saffron', form: 'field', tint: [0.76, 0.70, 0.62], cropId: 'saffron', label: 'Xanadu vale saffron' },
    { key: 'tea', fam: 'card_crop_tea', form: 'field', tint: [0.52, 0.74, 0.40], cropId: 'tea', label: 'Cloud-mist tea bush' },
    { key: 'cotton', fam: 'card_crop_cotton', form: 'field', tint: [0.80, 0.84, 0.72], cropId: 'cotton', label: 'Sunboll cotton' },
    { key: 'indigo', fam: 'card_crop_indigo', form: 'field', tint: [0.48, 0.70, 0.54], cropId: 'indigo', label: 'Hyperjungle indigo shrub' },
    { key: 'annatto', fam: 'card_crop_annatto', form: 'field', tint: [0.76, 0.72, 0.44], cropId: 'annatto', label: 'Sunseed annatto & umbel-seed' },
    { key: 'orchard_broad', fam: 'card_orchard_broad', form: 'tree', tint: [0.60, 0.74, 0.38], cropId: 'persimmon', label: 'Frost persimmon, fig & bay marula' },
    { key: 'orchard_small', fam: 'card_orchard_small', form: 'tree', tint: [0.64, 0.72, 0.44], cropId: 'madrone', label: 'Madrone cider-berry, whorl-olive & pomegranate' },
    { key: 'orchard_glossy', fam: 'card_croptree_glossy', form: 'tree', tint: [0.54, 0.72, 0.36], cropId: 'cacao', label: 'Cacao, camphor laurel & Ranj tree' },
    { key: 'ambersap_crown', fam: 'card_croptree_glossy', form: 'tree', tint: [0.88, 0.76, 0.34], cropId: 'amber-sap', label: 'Sacred Amber-Sap foliage' }
  ];

  const cropItems = {};
  for (let cd = 0; cd < CROP_DEFS.length; cd++) {
    const d = CROP_DEFS[cd];
    const m = cropCardMat(d.fam, d.tint);
    if (d.form === 'tree') {
      const n = 'tc.crown.' + d.key;
      BIO.def(n, BIO.geo.cells(BIO.geo.clump(), { n: 3, pick: [0, 4, 8], rects: RX(d.fam) }), m, {
        cls: 'flora', kind: 'tree', label: d.label, tags: { origin: 'farm', crop: d.cropId }
      });
      cropItems[d.key] = [n];
    } else {
      const na = 'tc.' + d.key + '.a', nb = 'tc.' + d.key + '.b';
      BIO.def(na, BIO.geo.cells(standGeo.clone(), { n: 3, pick: [0, 4, 8], scale: 1, rects: RX(d.fam) }), m, {
        cls: 'flora', kind: 'plant', label: d.label, tags: { origin: 'farm', crop: d.cropId }
      });
      BIO.def(nb, BIO.geo.cells(standGeo.clone(), { n: 3, pick: [2, 6, 7], scale: 1, rects: RX(d.fam) }), m, {
        cls: 'flora', kind: 'plant', label: d.label, tags: { origin: 'farm', crop: d.cropId }
      });
      cropItems[d.key] = [na, nb];
    }
  }

  // Single-plant Rimdew sundew, Korona Rainbow-Fan reagent rosette & ruined-pod broadleaf/fern clump definitions
  BIO.def('tc.sundew', standGeo.clone(), cropCardMat('card_carnivore_sundew', [0.82, 0.68, 0.56]), {
    cls: 'flora', kind: 'plant', label: 'Rimdew sundew', tags: { origin: 'specimen', crop: 'rimdew' }
  });
  BIO.def('tc.rainbowfan', BIO.geo.cells(leafSprayGeo.clone(), { n: 3, pick: [1, 4, 7], scale: 1, rects: RX('card_crop_rosette') }),
    cropCardMat('card_crop_rosette', [0.88, 0.82, 0.78]), {
      cls: 'flora', kind: 'plant', label: 'Korona Rainbow-Fan reagent rosette', tags: { origin: 'specimen', crop: 'amber-sap' }
    });
  BIO.def('pt.broadleaf', leafSprayGeo.clone(), cropCardMat('card_broadleaf', [0.76, 0.84, 0.68]), {
    cls: 'flora', kind: 'plant', label: 'Broadleaf over a ruined Soleri pod', tags: { origin: 'podtop' }
  });
  BIO.def('pt.fern', standGeo.clone(), cropCardMat('card_fern_green', [0.78, 0.86, 0.68]), {
    cls: 'flora', kind: 'plant', label: 'Fern over a ruined Soleri pod', tags: { origin: 'podtop' }
  });

  // Helper: draw a tapered 5-sided woody orchard trunk into `sfv.liana`
  function drawOrchardTrunk(x, y, z, h, r0, r1, colHex) {
    const n = 5;
    for (let i = 0; i < n; i++) {
      const t0 = (i / n) * TAU, t1 = ((i + 1) / n) * TAU;
      const a = [x + Math.cos(t0) * r0, y, z + Math.sin(t0) * r0];
      const b = [x + Math.cos(t1) * r0, y, z + Math.sin(t1) * r0];
      const c = [x + Math.cos(t1) * r1, y + h, z + Math.sin(t1) * r1];
      const d = [x + Math.cos(t0) * r1, y + h, z + Math.sin(t0) * r1];
      const ux = b[0] - a[0], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const nx = -uz * vy, nz = ux * vy;
      const out = nx * Math.cos(0.5 * (t0 + t1)) + nz * Math.sin(0.5 * (t0 + t1));
      if (out >= 0) BIO.quad('sfv.liana', a, b, c, d, colHex);
      else BIO.quad('sfv.liana', a, d, c, b, colHex);
    }
  }

  // ----------------------------------------------------------------- 4. 44 Wheel-Rim `sky-fruitvine` Curtains + Ground Trellis Vineyards
  let vineCurtainCount = 0;
  let vineFruitBunches = 0;
  const vineAnchors = (TORUS_ARCOLOGY_GROUP && TORUS_ARCOLOGY_GROUP.userData && TORUS_ARCOLOGY_GROUP.userData.vineAnchors)
    ? TORUS_ARCOLOGY_GROUP.userData.vineAnchors : [];
  const rngVines = KRAND.stream(KRAND.child(TORUS_SEED, 'torus_botanical_sky_fruitvines'));

  BIO.range = 3200;
  BIO.minRange = 0;
  BIO.chunk = 480;

  for (let v = 0; v < vineAnchors.length; v++) {
    const va = vineAnchors[v];
    const isRuby = (va.rim === 'inner');
    const fruitDef = isRuby ? 'sfv.ruby.bunch' : 'sfv.gold.bunch';
    const outDir = va.outDir;
    const midA = va.deg * deg;
    const ownerX = va.r * Math.cos(midA), ownerZ = va.r * Math.sin(midA);
    BIO.owner = [ownerX, ownerZ];

    // 7 main woody lianas per 11-deg sector curtain, rooting in the loam trough, arcing over the trellis outriggers, and cascading 80..138m
    const nLianas = 7;
    for (let s = 0; s < nLianas; s++) {
      const subDeg = va.deg - 5.1 + (10.2 * s) / (nLianas - 1) + rngVines.range(-0.35, 0.35);
      const a = subDeg * deg;
      const radX = Math.cos(a), radZ = Math.sin(a);
      const tanX = -radZ, tanZ = radX;
      const yawOut = Math.atan2(radX * outDir, radZ * outDir);

      // Envelope drop: fuller in center of clump, ragged organic taper at edges
      const centerWeight = 1.0 - 0.36 * Math.abs((s / (nLianas - 1)) - 0.5) * 2.0;
      const drop = va.dropM * centerWeight * rngVines.range(0.76, 1.08);
      const rootR = va.r - outDir * 2.15;
      const hangR = va.r + outDir * (2.6 + rngVines.range(0.2, 1.4));

      const pts = [];
      // Node 0: rooted inside the irrigated Wheel-rim loam trough
      pts.push({ x: rootR * radX, y: 301.35, z: rootR * radZ, r: rngVines.range(0.26, 0.36) });
      // Node 1: arching up and out across the cantilevered steel rim trellis
      pts.push({ x: (va.r + outDir * 0.8) * radX, y: 301.85, z: (va.r + outDir * 0.8) * radZ, r: 0.25 });
      pts.push({ x: hangR * radX, y: 299.4, z: hangR * radZ, r: 0.22 });

      const nSegs = 9;
      const phase = rngVines.range(0, TAU);
      for (let k = 1; k <= nSegs; k++) {
        const t = k / nSegs;
        const swayOut = hangR + outDir * (2.8 * t + 3.2 * t * t + 0.9 * Math.sin(t * 7.5 + phase));
        const swayTan = 1.65 * Math.sin(t * 5.8 + phase * 1.3);
        const px = swayOut * radX + swayTan * tanX;
        const pz = swayOut * radZ + swayTan * tanZ;
        const py = 299.4 - t * drop;
        const pr = Math.max(0.045, 0.21 * (1.0 - 0.78 * t));
        pts.push({ x: px, y: py, z: pz, r: pr });
      }
      BIO.tube('sfv.liana', pts, 0x5d4530, { seg: 6 });

      // Crown broadleaf sprays along the rim trough & trellis arch
      for (let cs = 0; cs < 3; cs++) {
        const cp = pts[cs];
        const cSz = rngVines.range(3.2, 4.8);
        const cTint = rngVines.range(0.86, 1.08);
        BIO.put('sfv.spray', [cp.x, cp.y, cp.z], BIO.fn.qEuler(rngVines.range(-0.2, 0.2), rngVines.range(0, TAU), 0),
          [cSz, cSz * 0.82, cSz], new THREE.Color(cTint, cTint, cTint * 0.94));
      }

      // Forked lateral woody side-shoots + cascading card_vine foliage curtains + pendulous Ruby-Tart / Golden-Sun fruit bunches!
      for (let k = 2; k < pts.length; k++) {
        const pNode = pts[k];
        const t = (k - 2) / nSegs;
        const wScale = (4.6 - 1.9 * t) * rngVines.range(0.85, 1.18);
        const hScale = (drop / nSegs) * rngVines.range(1.42, 1.85);
        const lTint = rngVines.range(0.82, 1.08);
        BIO.put('sfv.curtain', [pNode.x, pNode.y, pNode.z],
          BIO.fn.qEuler(rngVines.range(-0.08, 0.08), yawOut + rngVines.range(-0.45, 0.45), rngVines.range(-0.08, 0.08)),
          [wScale, hScale, wScale], new THREE.Color(lTint, lTint * 1.02, lTint * 0.92));

        // Leaf clump at every second node to give lush 3D volume to the liana rope
        if (k % 2 === 0 && t < 0.82) {
          const spSz = (3.8 - 1.5 * t) * rngVines.range(0.85, 1.15);
          BIO.put('sfv.spray', [pNode.x, pNode.y, pNode.z],
            BIO.fn.qEuler(rngVines.range(-0.25, 0.25), rngVines.range(0, TAU), rngVines.range(-0.25, 0.25)),
            [spSz, spSz * 0.9, spSz], new THREE.Color(lTint, lTint, lTint * 0.95));
        }

        // Forked lateral woody branch + fruit racemes hanging directly off stem nodes
        if (t >= 0.08 && t <= 0.88) {
          const sideSign = ((s + k) % 2 === 0) ? 1 : -1;
          const bLen = rngVines.range(1.6, 3.2) * (1.0 - 0.35 * t);
          const bx = pNode.x + tanX * sideSign * bLen + radX * outDir * 0.85;
          const by = pNode.y - bLen * 1.15;
          const bz = pNode.z + tanZ * sideSign * bLen + radZ * outDir * 0.85;
          BIO.tube('sfv.liana', [
            { x: pNode.x, y: pNode.y, z: pNode.z, r: Math.max(0.05, pNode.r * 0.72) },
            { x: bx, y: by, z: bz, r: 0.035 }
          ], 0x684e36, { seg: 5 });

          // Hang a trailing mini-curtain + plump 3D fruit racemes at BOTH pNode and branch tip [bx, by, bz]
          BIO.put('sfv.curtain', [bx, by, bz],
            BIO.fn.qEuler(0, yawOut + sideSign * 0.55, 0),
            [wScale * 0.68, hScale * 0.72, wScale * 0.68], new THREE.Color(lTint, lTint, lTint * 0.92));

          const fScale1 = rngVines.range(1.15, 1.75);
          const fTint1 = rngVines.range(0.88, 1.12);
          BIO.put(fruitDef, [pNode.x, pNode.y, pNode.z],
            BIO.fn.qEuler(rngVines.range(-0.10, 0.10), rngVines.range(0, TAU), rngVines.range(-0.10, 0.10)),
            [fScale1, fScale1 * 1.12, fScale1], new THREE.Color(fTint1, fTint1, fTint1));
          vineFruitBunches++;

          const fScale2 = rngVines.range(1.05, 1.55);
          BIO.put(fruitDef, [bx, by, bz],
            BIO.fn.qEuler(rngVines.range(-0.12, 0.12), rngVines.range(0, TAU), rngVines.range(-0.12, 0.12)),
            [fScale2, fScale2 * 1.10, fScale2], new THREE.Color(fTint1, fTint1, fTint1));
          vineFruitBunches++;
        }
      }
    }
    vineCurtainCount++;
  }
  BIO.owner = null;

  // Helper: build a grounded timber/steel `sky-fruitvine` Trellis Arbor with woody vines, curtains & fruit bunches on terraces/vineyards
  const arborTimberGeos = [];
  const arborM4 = new THREE.Matrix4();
  function placeSkyFruitvineArbor(cx, cy, cz, yaw, spanW, isRuby) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const halfW = 0.5 * spanW;
    // Timber end-posts & cross-beam
    for (let side = -1; side <= 1; side += 2) {
      const px = cx + side * halfW * c, pz = cz - side * halfW * s;
      arborM4.makeRotationY(yaw).setPosition(px, cy + 1.45, pz);
      arborTimberGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(0.24, 3.1, 0.24), arborM4, false, 2.5));
    }
    arborM4.makeRotationY(yaw).setPosition(cx, cy + 2.95, cz);
    arborTimberGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(spanW + 0.6, 0.20, 1.4), arborM4, false, 2.5));

    // Woody vine trunk climbing post & running across top beam + hanging card_vine curtains & fruit clusters!
    BIO.owner = [cx, cz];
    const pLeft = [cx - (halfW - 0.3) * c, cy, cz + (halfW - 0.3) * s];
    const pTopL = [cx - (halfW - 0.3) * c, cy + 3.02, cz + (halfW - 0.3) * s];
    const pTopR = [cx + (halfW - 0.3) * c, cy + 3.02, cz - (halfW - 0.3) * s];
    BIO.tube('sfv.liana', [
      { x: pLeft[0], y: pLeft[1], z: pLeft[2], r: 0.13 },
      { x: pTopL[0], y: pTopL[1], z: pTopL[2], r: 0.10 },
      { x: pTopR[0], y: pTopR[1], z: pTopR[2], r: 0.07 }
    ], 0x5f4631, { seg: 5 });
    const nDrops = Math.max(3, Math.floor(spanW / 2.2));
    const fDef = isRuby ? 'sfv.ruby.bunch' : 'sfv.gold.bunch';
    for (let k = 0; k < nDrops; k++) {
      const f = (k + 0.5) / nDrops - 0.5;
      const vx = cx + f * (spanW - 0.8) * c;
      const vz = cz - f * (spanW - 0.8) * s;
      BIO.put('sfv.spray', [vx, cy + 3.05, vz], BIO.fn.qEuler(0, yaw + k, 0), [2.1, 1.5, 2.1], new THREE.Color(0.95, 0.98, 0.90));
      BIO.put('sfv.curtain', [vx, cy + 2.95, vz], BIO.fn.qEuler(0, yaw, 0), [2.2, 2.2, 2.2], new THREE.Color(0.94, 0.98, 0.90));
      BIO.put(fDef, [vx, cy + 2.85, vz], BIO.fn.qEuler(0, yaw + k * 1.7, 0), [0.85, 0.92, 0.85], new THREE.Color(1, 1, 1));
      vineFruitBunches++;
    }
    BIO.owner = null;
  }

  // ----------------------------------------------------------------- 5. 182 Terrace `agPlots` & 4 Working Soleri Pod Farm/Orchard Arrays
  let cropPlantCount = 0;
  let orchardTreeCount = 0;
  const rngCrops = KRAND.stream(KRAND.child(TORUS_SEED, 'torus_crops_and_orchards'));
  const agPlots = TORUS_PLAN.agPlots || [];

  BIO.range = 1750;
  BIO.minRange = 0;
  BIO.chunk = 520;

  for (let pi = 0; pi < agPlots.length; pi++) {
    const plot = agPlots[pi];
    if (plot.ruined || plot.kind === 'feral_ruin_flora') continue;
    const isHinterland = (plot.rIn >= 1150);
    const kind = plot.kind || '';
    const isOrchard = (kind.indexOf('orchard') >= 0 || kind === 'cider_drip_orchard');
    const isVineyard = (kind === 'working_pod_vineyard' || plot.cropId === 'sky-fruitvine');

    // Map every terrace & hinterland plot to surveyed swlowlands / swbay species from BOTANY-FOOD-CROPS.md
    let fieldKey = 'emmer';
    let altFieldKey = 'bambara';
    let treeKey = 'orchard_broad';
    if (kind === 'rare_culinary_herbs' || kind === 'medicinal_herb_strip') {
      fieldKey = (pi % 3 === 0) ? 'herb' : (pi % 3 === 1 ? 'fumewort' : 'palmate');
      altFieldKey = 'herb';
    } else if (kind === 'saffron_and_spice_beds') {
      fieldKey = (pi % 2 === 0) ? 'saffron' : 'annatto';
      altFieldKey = 'bambara'; // Rattle-coffee (`rattlepod`) rows
    } else if (kind === 'alchemical_reagent_moss') {
      fieldKey = 'woad_poppy';
      altFieldKey = 'fumewort';
    } else if (kind === 'wheel_drip_berry_orchard' || kind === 'cider_drip_orchard') {
      treeKey = (pi % 2 === 0) ? 'orchard_small' : 'orchard_broad'; // Madrone/manzanita cider-berries & frost persimmon/fig/marula
      fieldKey = 'clover';
      altFieldKey = 'bambara';
    } else if (kind === 'working_pod_orchard' || kind === 'reclaimed_heirloom_orchard') {
      treeKey = (plot.cropId === 'sky-fruitvine') ? 'orchard_broad' : ((pi % 2 === 0) ? 'orchard_broad' : 'orchard_small');
      fieldKey = 'bambara'; // Rattle-coffee & gatepod intercrop
      altFieldKey = 'clover';
    } else if (kind === 'working_pod_farm' && plot.cropId === 'bambara') {
      fieldKey = 'bambara';
      altFieldKey = (pi % 2 === 0) ? 'murnong' : 'cotton';
    } else if (kind === 'working_pod_farm') {
      fieldKey = 'emmer';
      altFieldKey = (pi % 2 === 0) ? 'millet' : 'murnong';
    } else if (kind === 'irrigated_barley_terrace') {
      fieldKey = (pi % 2 === 0) ? 'emmer' : 'millet';
      altFieldKey = 'bambara';
    } else if (kind === 'terraced_paddy_strip') {
      fieldKey = 'murnong';
      altFieldKey = (pi % 2 === 0) ? 'cotton' : 'bambara';
    } else if (kind === 'river_chinampa') {
      fieldKey = 'murnong';
      altFieldKey = 'palmate'; // Giant lotus & marsh taro
    } else if (kind === 'voth_clan_courtyard_garden') {
      fieldKey = 'herb';
      altFieldKey = 'saffron';
      treeKey = 'orchard_small'; // Whorl-olive & pomegranate courtyard trees
    } else {
      const rot = pi % 5;
      fieldKey = rot === 0 ? 'emmer' : (rot === 1 ? 'millet' : (rot === 2 ? 'bambara' : (rot === 3 ? 'murnong' : 'cotton')));
      altFieldKey = 'bambara';
    }

    const rStep = isOrchard ? 18.0 : (isHinterland ? 10.5 : 8.0);
    const arcStepM = isOrchard ? 18.0 : (isHinterland ? 9.8 : 7.0);
    const dSpan = ((plot.deg1 - plot.deg0 + 360) % 360) || 30.0;

    for (let r = plot.rIn + 4.5; r <= plot.rOut - 4.5; r += rStep) {
      const arcLen = r * (dSpan * deg);
      const nArc = Math.max(1, Math.floor((arcLen - 8.0) / arcStepM));
      for (let k = 0; k < nArc; k++) {
        const subD = normDeg(plot.deg0 + 2.0 + ((dSpan - 4.0) * (k + 0.5)) / nArc + rngCrops.range(-0.35, 0.35));
        if (!isHinterland && (inBuiltSector(r, subD, 1.0) || (kind !== 'voth_clan_courtyard_garden' && TORUS.inVothExtension(r, subD)) || TORUS.inWheelRuinZone(r, subD))) continue;
        const a = subD * deg;
        const px = r * Math.cos(a) + rngCrops.range(-0.9, 0.9);
        const pz = r * Math.sin(a) + rngCrops.range(-0.9, 0.9);
        if (TORUS.inRiverCorridor(px, pz, 12.0)) continue;
        if (nearRoad(px, pz, isOrchard ? 5.5 : 3.5) || nearObstacle(px, pz, isOrchard ? 5.5 : 3.0)) continue;

        const py = isHinterland ? torusGroundAt(px, pz) : plot.elev;
        const yawTang = -a + 0.5 * Math.PI;

        if (isVineyard && k % 3 === 1 && (Math.round(r) % 2 === 0)) {
          placeSkyFruitvineArbor(px, py, pz, yawTang, 7.6, (k % 2 === 0));
          continue;
        }
        if ((kind === 'wheel_drip_berry_orchard' || kind === 'cider_drip_orchard') && k === Math.floor(nArc * 0.5) && r < plot.rIn + 4.5 + rStep) {
          placeSkyFruitvineArbor(px, py, pz, yawTang, 8.2, (pi % 2 === 0));
          continue;
        }

        if (isOrchard || (kind === 'voth_clan_courtyard_garden' && k % 4 === 1)) {
          const H = rngCrops.range(5.4, 8.2);
          const th = H * 0.40;
          BIO.owner = [px, pz];
          drawOrchardTrunk(px, py - 0.15, pz, th + 0.7, 0.19, 0.11, 0x6a533e);
          const useTreeKey = (isOrchard && k % 3 === 2 && treeKey === 'orchard_broad') ? 'orchard_small' : treeKey;
          const crDef = cropItems[useTreeKey][0];
          const tCol = rngCrops.range(0.86, 1.08);
          for (let cIdx = 0; cIdx < 5; cIdx++) {
            const ca = rngCrops.range(0, TAU);
            const cr = cIdx === 0 ? 0 : H * 0.25;
            const cs = H * (cIdx === 0 ? 0.95 : 0.76);
            const cyOff = th + H * (cIdx === 0 ? 0.36 : 0.20);
            BIO.put(crDef, [px + Math.cos(ca) * cr, py + cyOff, pz + Math.sin(ca) * cr],
              BIO.fn.qEuler(0, rngCrops.range(0, TAU), 0), cs,
              new THREE.Color(tCol, tCol * rngCrops.range(0.95, 1.04), tCol * 0.94));
          }
          // Hang ripe fruit/berry clusters beneath the orchard tree boughs!
          for (let fb = 0; fb < 2; fb++) {
            const fa = fb * Math.PI + rngCrops.range(-0.6, 0.6);
            BIO.put((useTreeKey === 'orchard_small' || fb === 1) ? 'sfv.ruby.bunch' : 'sfv.gold.bunch',
              [px + Math.cos(fa) * 0.35, py + th + 0.55, pz + Math.sin(fa) * 0.35],
              BIO.fn.qEuler(0, fa, 0), [0.65, 0.70, 0.65], new THREE.Color(1, 1, 1));
          }
          BIO.owner = null;
          orchardTreeCount++;
        } else {
          const activeKey = (k % 3 === 2) ? altFieldKey : fieldKey;
          const pair = cropItems[activeKey];
          const sz = rngCrops.range(1.25, 2.15);
          const ct = rngCrops.range(0.85, 1.10);
          BIO.put(pair[rngCrops.next() < 0.5 ? 0 : 1], [px, py - 0.04, pz],
            BIO.fn.qEuler(0, rngCrops.range(0, TAU), 0),
            [sz, sz * rngCrops.range(0.88, 1.22), sz],
            new THREE.Color(ct, ct, ct * 0.95));
          cropPlantCount++;
        }
      }
    }
  }

  // Also plant thriving surveyed `CROPS` beds & dwarf orchard trees inside the 1/3 Working Soleri Pods (visible through their clear glass domes!)
  const workingPods = (TORUS_HINTERLAND_GROUP && TORUS_HINTERLAND_GROUP.userData && TORUS_HINTERLAND_GROUP.userData.workingPods)
    ? TORUS_HINTERLAND_GROUP.userData.workingPods : [];
  for (let wp = 0; wp < workingPods.length; wp++) {
    const pod = workingPods[wp];
    const theme = pod.cropTheme;
    const bedY = pod.y + 4.24; // Exact MP.FARM_DESIGN.pod plinth growing floor height (ph = 4.2 + 0.02)!
    const innerKey = theme === 'orchard' ? 'tea' : (theme === 'vineyard' ? 'saffron' : (theme === 'irrigated' ? 'bambara' : 'emmer'));
    const outerKey = theme === 'orchard' ? 'bambara' : (theme === 'vineyard' ? 'fumewort' : (theme === 'irrigated' ? 'murnong' : 'millet'));
    if (theme === 'orchard' || theme === 'vineyard') {
      // Central dwarf frost-persimmon / madrone / fig specimen tree inside the Soleri glass pod
      BIO.owner = [pod.x, pod.z];
      drawOrchardTrunk(pod.x, bedY - 0.1, pod.z, 2.4, 0.18, 0.10, 0x664f3a);
      const podTreeDef = (theme === 'orchard' && wp % 2 === 0) ? cropItems.orchard_small[0] : cropItems.orchard_broad[0];
      BIO.put(podTreeDef, [pod.x, bedY + 3.2, pod.z], BIO.fn.qEuler(0, wp, 0), 3.8, new THREE.Color(0.96, 1.0, 0.92));
      BIO.owner = null;
      orchardTreeCount++;
    }
    for (let ring = 0; ring < 2; ring++) {
      const rr = ring === 0 ? 9.5 : 16.5;
      const nP = ring === 0 ? 10 : 16;
      const pair = cropItems[ring === 0 ? innerKey : outerKey];
      for (let k = 0; k < nP; k++) {
        const a = (k / nP) * TAU + ring * 0.3;
        const px = pod.x + rr * Math.cos(a), pz = pod.z + rr * Math.sin(a);
        const sz = rngCrops.range(1.4, 2.1);
        BIO.put(pair[k % 2], [px, bedY, pz], BIO.fn.qEuler(0, a, 0), [sz, sz, sz], new THREE.Color(0.95, 1.0, 0.92));
        cropPlantCount++;
      }
    }
  }

  if (arborTimberGeos.length > 0) {
    const arborMesh = new THREE.Mesh(TORUS_DRAW.mergeGeoList(arborTimberGeos), TORUS_DRAW.MATS.timber);
    arborMesh.name = 'torus_sky_fruitvine_arbors';
    floraGroup.add(arborMesh);
  }

  // ----------------------------------------------------------------- 6. 8 Surviving Specimen Ag-Domes (Surveyed Pharmacopoeia & Out-of-Zone Flora!)
  let specimenPlantCount = 0;
  let feralPlantCount = 0;
  const domeSockets = (TORUS_LANDMARKS_GROUP && TORUS_LANDMARKS_GROUP.userData && TORUS_LANDMARKS_GROUP.userData.domeSockets)
    ? TORUS_LANDMARKS_GROUP.userData.domeSockets : [];
  const RAINBOW_FAN_TINTS = [
    new THREE.Color(1.15, 0.28, 0.36), // Crimson (worth a season's climb!)
    new THREE.Color(0.26, 0.92, 0.88), // Teal
    new THREE.Color(1.12, 0.90, 0.28), // Gold
    new THREE.Color(0.42, 0.96, 0.58)  // Mint
  ];

  for (let di = 0; di < domeSockets.length; di++) {
    const ds = domeSockets[di];
    const code = ds.code || '';
    const c = Math.cos(ds.ry), s = Math.sin(ds.ry);
    const toW = function (lx, ly, lz) {
      return [ds.x + lx * c + lz * s, ds.y + ly, ds.z - lx * s + lz * c];
    };

    if (ds.isAmberSap || code === 'unique_ancient_cultivar') {
      // Sanctuary Dome III: Sacred Amber-Sap Mother Tree + symbiotic Throne Ranj sapling + Korona Rainbow-Fan reagent rosettes!
      const mBase = toW(0, 0.12, -1.8);
      BIO.owner = [mBase[0], mBase[2]];
      BIO.tube('sfv.liana', [
        { x: mBase[0], y: mBase[1] - 0.2, z: mBase[2], r: 0.52 },
        { x: mBase[0] + 0.15, y: mBase[1] + 1.4, z: mBase[2] - 0.1, r: 0.40 },
        { x: mBase[0] - 0.10, y: mBase[1] + 2.9, z: mBase[2] + 0.1, r: 0.28 },
        { x: mBase[0], y: mBase[1] + 4.2, z: mBase[2], r: 0.14 }
      ], 0x9c7234, { seg: 8 });
      for (let nb = 0; nb < 4; nb++) {
        const ba = (nb * TAU) / 4 + 0.4;
        const bx = mBase[0] + 1.65 * Math.cos(ba), bz = mBase[2] + 1.65 * Math.sin(ba);
        const by = mBase[1] + 3.85;
        BIO.tube('sfv.liana', [
          { x: mBase[0], y: mBase[1] + 2.7, z: mBase[2], r: 0.20 },
          { x: bx, y: by, z: bz, r: 0.08 }
        ], 0x9c7234, { seg: 6 });
        BIO.put(cropItems.ambersap_crown[0], [bx, by + 0.4, bz], BIO.fn.qEuler(0, ba, 0), 3.4, new THREE.Color(1.05, 0.96, 0.78));
        BIO.put('sfv.amber.nodule', [mBase[0] + 0.34 * Math.cos(ba), mBase[1] + 1.5 + nb * 0.35, mBase[2] + 0.34 * Math.sin(ba)],
          BIO.fn.qEuler(0, ba, 0), [0.55, 0.65, 0.55], new THREE.Color(1, 1, 1));
        // Pleated Korona Rainbow-Fan reagent rosettes (crimson, teal, gold, mint) in the silt pockets round the Mother Tree!
        const rfPos = toW(2.2 * Math.cos(ba), 0.06, -1.8 + 2.2 * Math.sin(ba));
        BIO.put('tc.rainbowfan', rfPos, BIO.fn.qEuler(0, ba + 0.5, 0), [1.25, 1.05, 1.25], RAINBOW_FAN_TINTS[nb % RAINBOW_FAN_TINTS.length]);
        specimenPlantCount += 2;
      }
      BIO.put(cropItems.ambersap_crown[0], [mBase[0], mBase[1] + 4.5, mBase[2]], BIO.fn.qEuler(0, 0.7, 0), 3.8, new THREE.Color(1.08, 0.98, 0.80));
      // Symbiotic Throne Ranj wound-resin sapling at (lx = -2.4, lz = -4.2)
      const ranjPos = toW(-2.4, 0.05, -4.2);
      drawOrchardTrunk(ranjPos[0], ranjPos[1] - 0.1, ranjPos[2], 1.55, 0.13, 0.07, 0x5c3e2c);
      BIO.put(cropItems.orchard_glossy[0], [ranjPos[0], ranjPos[1] + 2.15, ranjPos[2]], BIO.fn.qEuler(0, 1.2, 0), 2.5, new THREE.Color(0.92, 0.98, 0.86));
      BIO.owner = null;
      specimenPlantCount++;
    }

    // Left & right raised conservatory soil beds (lx = -4.6 & +4.6, lz = -5.4 .. +2.8) — matched 1:1 to each dome's surveyed species!
    let leftKey = 'herb';
    let rightKey = 'fumewort';
    let dwarfTreeKey = null;
    if (code === 'earthlike_med_febrifuge') {
      leftKey = 'woad_poppy';  // Oidong Sky-poppy stillness reagent
      rightKey = 'fumewort';   // Siphon-pit Fumewort & Tobacco
      dwarfTreeKey = 'orchard_small'; // Oidong Bell-pod willow
    } else if (code === 'earthlike_med_tonics') {
      leftKey = 'herb';        // 7-year Oidong Valley-ginseng & Polar Goldroot
      rightKey = 'fumewort';   // Monk's sage (silver wormwood) & Bench-garlic
      dwarfTreeKey = 'orchard_glossy'; // Camphor laurel
    } else if (code === 'cloud_mist_tea') {
      leftKey = 'tea';         // Xanadu/Oidong Mist tea
      rightKey = 'palmate';    // Oidong Giant lotus & Ivan-chai
    } else if (code === 'equatorial_cacao') {
      leftKey = 'palmate';     // Ring-Isles Kava & Violet plantain
      rightKey = 'tea';        // Shade Coffee
      dwarfTreeKey = 'orchard_glossy'; // Trunk-pod Cacao
    } else if (code === 'highland_volcanic_spice') {
      leftKey = 'saffron';     // Xanadu Vale saffron
      rightKey = 'annatto';    // Sunseed annatto & Umbel-seed
      dwarfTreeKey = 'orchard_small'; // Clove & Antiscorbutic Ember-plum
    } else if (code === 'dryland_oil_nut') {
      leftKey = 'herb';        // Pitaya & dryland herbs
      rightKey = 'saffron';    // Dryland aromatics
      dwarfTreeKey = 'orchard_small'; // Xanadu Whorl-olive, Citron & Crest pomegranate
    } else if (code === 'fibre_dye_latex') {
      leftKey = 'indigo';      // Hyperjungle Indigo & Valley Woad
      rightKey = 'cotton';     // Long-staple Sunboll Cotton & Annatto
      dwarfTreeKey = 'orchard_broad'; // Abyssal Umbrella-gum sapling
    }

    for (let side = -1; side <= 1; side += 2) {
      const lx = side * 4.6;
      for (let row = 0; row < 5; row++) {
        const lz = -5.4 + row * 2.05;
        const wp = toW(lx, 0.02, lz);
        if ((code === 'earthlike_med_tonics' && side > 0 && row % 2 === 0) || (ds.isAmberSap && side < 0 && row % 2 === 0)) {
          BIO.put('tc.sundew', wp, BIO.fn.qEuler(0, row * 1.3, 0), [1.18, 1.08, 1.18], new THREE.Color(1, 1, 1));
        } else if (ds.isAmberSap && side > 0 && row % 2 === 1) {
          BIO.put('tc.rainbowfan', wp, BIO.fn.qEuler(0, row * 1.7, 0), [1.20, 1.05, 1.20], RAINBOW_FAN_TINTS[(row + 1) % RAINBOW_FAN_TINTS.length]);
        } else if (dwarfTreeKey && row === 2) {
          // Pruned dwarf conservatory specimen tree (h = 3.8m, cleanly inside the 8.8m glass vault!)
          BIO.owner = [wp[0], wp[2]];
          drawOrchardTrunk(wp[0], wp[1] - 0.1, wp[2], 1.65, 0.14, 0.08, 0x664f3a);
          const tDef = (code === 'dryland_oil_nut' && side > 0) ? cropItems.orchard_broad[0] : cropItems[dwarfTreeKey][0];
          BIO.put(tDef, [wp[0], wp[1] + 2.35, wp[2]], BIO.fn.qEuler(0, side, 0), 2.85, new THREE.Color(0.96, 1.0, 0.92));
          if (code === 'equatorial_cacao' || code === 'earthlike_med_febrifuge' || code === 'dryland_oil_nut' || code === 'highland_volcanic_spice') {
            BIO.put(code === 'equatorial_cacao' ? 'sfv.gold.bunch' : 'sfv.ruby.bunch',
              [wp[0] + 0.22 * side, wp[1] + 1.55, wp[2]], BIO.fn.qEuler(0, side, 0), [0.52, 0.58, 0.52], new THREE.Color(1, 1, 1));
          }
          BIO.owner = null;
        } else {
          let useKey = side < 0 ? leftKey : rightKey;
          if (code === 'fibre_dye_latex' && side < 0 && row % 2 === 1) useKey = 'woad_poppy';
          if (code === 'earthlike_med_febrifuge' && side > 0 && row === 4) useKey = 'palmate';
          if (code === 'cloud_mist_tea' && side > 0 && row % 2 === 1) useKey = 'fumewort';
          const pair = cropItems[useKey];
          BIO.put(pair[row % 2], wp, BIO.fn.qEuler(0, row + side, 0), [1.35, 1.30, 1.35], new THREE.Color(0.96, 1.0, 0.94));
        }
        specimenPlantCount++;
      }
    }
  }

  // ----------------------------------------------------------------- 7. Ruined Soleri Pod Overgrowth Mats & Rubble Flora (2/3 of Pod Arrays!)
  let ruinedPodMats = 0;
  const ruinedPods = (TORUS_HINTERLAND_GROUP && TORUS_HINTERLAND_GROUP.userData && TORUS_HINTERLAND_GROUP.userData.ruinedPods)
    ? TORUS_HINTERLAND_GROUP.userData.ruinedPods : [];

  if (ruinedPods.length > 0 && typeof MP !== 'undefined' && MP && MP.FAMILY && MP.FAMILY.pod && MP.FARM_DESIGN && MP.FARM_DESIGN.pod) {
    const FP = MP.FAMILY.pod, FD = MP.FARM_DESIGN.pod;
    const R0 = FD.dome.r, HD = FD.dome.h, PH = FD.plinth, LR = FD.lantern, NR = 9, LIFT = 0.36, SEG = 4;
    const ROWS = [];
    for (let i = 0; i <= NR; i++) {
      const r = R0 * Math.cos((i / NR) * Math.PI * 0.5);
      const y = PH + HD * Math.sin((i / NR) * Math.PI * 0.5);
      if (r < LR) {
        ROWS.push([LR, PH + HD * Math.sqrt(Math.max(0, 1 - (LR / R0) * (LR / R0)))]);
        break;
      }
      ROWS.push([r, y]);
    }
    const domePt = function (b, t, k, s) {
      const r = ROWS[b][0] + (ROWS[b + 1][0] - ROWS[b][0]) * t;
      const y = ROWS[b][1] + (ROWS[b + 1][1] - ROWS[b][1]) * t;
      const a0 = (k * Math.PI) / 3, a1 = ((k + 1) * Math.PI) / 3;
      const x = Math.cos(a0) * r + (Math.cos(a1) - Math.cos(a0)) * r * s;
      const z = Math.sin(a0) * r + (Math.sin(a1) - Math.sin(a0)) * r * s;
      const h = Math.hypot(x, z) == null || Math.hypot(x, z) === 0 ? 1 : Math.hypot(x, z);
      const q = (h + LIFT) / h;
      return [x * q, y + LIFT * 0.6, z * q];
    };

    const PkLeaf = libCrop('card_broadleaf');
    const matMap = PkLeaf ? KMAT.textures(PkLeaf, { aniso: 4, flipY: false }).map : fmDetail.map;
    const podVineMat = new THREE.MeshLambertMaterial({
      map: matMap,
      color: new THREE.Color(0.76, 0.85, 0.68).convertSRGBToLinear(),
      alphaTest: PkLeaf ? 0.45 : 0,
      side: THREE.DoubleSide
    });
    podVineMat.name = 'torus.podtop.vine_mat';

    const TORN = { crown: 1, broken: 1, stump: 1, skeleton: 1 };
    const podQuads = [];
    const vTmp = new THREE.Vector3();
    const qPod = new THREE.Quaternion();
    const ePod = new THREE.Euler(0, 0, 0, 'YXZ');

    BIO.range = 1600;
    BIO.minRange = 0;
    BIO.chunk = 360;
    BIO.owner = null;

    for (let ti = 0; ti < ruinedPods.length; ti++) {
      const pod = ruinedPods[ti];
      if (pod.state === 'fallen') continue;
      let RU = null;
      if (TORN[pod.state]) {
        try { RU = MP.ruin(FP, pod.state); } catch (e) { continue; }
      }
      ePod.set(0, pod.ry, 0);
      qPod.setFromEuler(ePod);
      const toPodWorld = function (p) {
        vTmp.set(p[0], p[1], p[2]).applyQuaternion(qPod);
        return [pod.x + vTmp.x, pod.y + vTmp.y, pod.z + vTmp.z];
      };
      const keepFacet = function (p) {
        return !RU || p[1] < MP.tearAtXZ(FP, RU, p[0], p[2]) - 0.4;
      };
      const feet = [];
      for (let b = 0; b + 1 < ROWS.length; b++) {
        for (let k = 0; k < 6; k++) {
          for (let g = 0; g < SEG; g++) {
            const h = KRAND.hash(TORUS_SEED + 73, ti, b * 6 + k, g);
            const u1 = KRAND.unit(KRAND.hash(h, 1, 0, 0));
            if (u1 < 0.22) continue;
            const L = [
              domePt(b, 0, k, g / SEG),
              domePt(b, 0, k, (g + 1) / SEG),
              domePt(b, 1, k, (g + 1) / SEG),
              domePt(b, 1, k, g / SEG)
            ];
            if (!L.every(keepFacet)) continue;
            podQuads.push(L.map(toPodWorld));
            if ((b + g) % 2 === 0) {
              const u2 = KRAND.unit(KRAND.hash(h, 2, 0, 0));
              const u3 = KRAND.unit(KRAND.hash(h, 3, 0, 0));
              feet.push(domePt(b, 0.2 + 0.6 * u2, k, (g + 0.2 + 0.6 * u3) / SEG));
            }
          }
        }
      }
      if (RU && typeof MP.heaps === 'function' && typeof KRUBBLE !== 'undefined' && KRUBBLE.at) {
        const HP = MP.heaps(FP, pod.state);
        if (HP && HP.length) {
          for (let j = -8; j <= 8; j += 2) {
            for (let i = -8; i <= 8; i += 2) {
              const lx = i * 2.6, lz = j * 2.4;
              const hy = KRUBBLE.at(HP, lx, lz);
              if (hy > PH + 0.35) feet.push([lx, hy - 0.12, lz]);
            }
          }
        }
      }
      if (feet.length > 0) ruinedPodMats++;
      for (let fi = 0; fi < feet.length; fi++) {
        const fw = toPodWorld(feet[fi]);
        const h = KRAND.hash(TORUS_SEED + 75, ti, fi, 0);
        const sz = 1.6 + 1.4 * KRAND.unit(KRAND.hash(h, 3, 0, 0));
        const ct = 0.84 + 0.16 * KRAND.unit(KRAND.hash(h, 4, 0, 0));
        const defName = KRAND.unit(KRAND.hash(h, 5, 0, 0)) < 0.68 ? 'pt.broadleaf' : 'pt.fern';
        BIO.put(defName, fw, BIO.fn.qEuler(0, KRAND.unit(KRAND.hash(h, 6, 0, 0)) * TAU, 0),
          [sz, sz * 0.9, sz], new THREE.Color(ct, ct, ct * 0.94));
      }
    }

    if (podQuads.length > 0) {
      const pos = [], uv = [];
      const U = [[0, 1], [1, 1], [1, 0], [0, 0]];
      for (let qi = 0; qi < podQuads.length; qi++) {
        const q = podQuads[qi];
        [0, 1, 2, 0, 2, 3].forEach(function (i) {
          pos.push(q[i][0], q[i][1], q[i][2]);
          uv.push(U[i][0], U[i][1]);
        });
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.computeVertexNormals();
      g.computeBoundingSphere();
      const matMesh = new THREE.Mesh(g, podVineMat);
      matMesh.name = 'torus_ruined_soleri_pod_vine_mats';
      floraGroup.add(matMesh);
    }
  }

  BIO.range = null;
  BIO.chunk = null;
  BIO.kitEnd(tcApi);
  BIO.kit(prevKit || '');

  // 4 Quarantined Feral Ag-Domes (in default SWBAY kit): giant fungoid cap-trees, coral towers, dragon trees & splay fronds erupting through shattered ribs!
  const feralSockets = (TORUS_LANDMARKS_GROUP && TORUS_LANDMARKS_GROUP.userData && TORUS_LANDMARKS_GROUP.userData.feralDomeSockets)
    ? TORUS_LANDMARKS_GROUP.userData.feralDomeSockets : [];
  const FERAL_TREES = ['captree', 'coral', 'dragon', 'crownfern'];
  for (let fi = 0; fi < feralSockets.length; fi++) {
    const fs = feralSockets[fi];
    const flatF = function () { return fs.y; };
    if (SWBAY.treeAt(FERAL_TREES[fi % FERAL_TREES.length], fs.x - 0.8, fs.y, fs.z - 0.6, {
      seed: KRAND.hash(TORUS_SEED, fi, 1511),
      scale: 0.78,
      wet: 0.92,
      ground: flatF
    })) {
      feralPlantCount++;
    }
    if (SWBAY.treeAt(FERAL_TREES[(fi + 1) % FERAL_TREES.length], fs.x + 2.6, fs.y, fs.z + 1.4, {
      seed: KRAND.hash(TORUS_SEED, fi, 1523),
      scale: 0.58,
      wet: 0.90,
      ground: flatF
    })) {
      feralPlantCount++;
    }
    for (let u = 0; u < 8; u++) {
      const ua = (u * TAU) / 8 + fi * 0.4;
      const ur = 3.8 + (u % 2) * 2.4;
      const pKind = u % 3 === 0 ? 'parasol' : (u % 3 === 1 ? 'splaylet' : 'pitcher');
      SWBAY.plantAt(pKind, fs.x + ur * Math.cos(ua), fs.y, fs.z + ur * Math.sin(ua), {
        seed: KRAND.hash(TORUS_SEED, fi, u, 1531),
        lv: 2,
        ground: flatF
      });
      feralPlantCount++;
    }
  }

  // ----------------------------------------------------------------- 8. Bake All BIO Kits & Octahedral Impostors + Wire LOD Tick
  BIO.bake();
  if (typeof BIO.bakeImpostors === 'function' && typeof renderer !== 'undefined' && renderer) {
    BIO.bakeImpostors(renderer);
  }
  BIO.host.scene = scene;
  BIO.lodTick(camera);
  ANC_TICKS.push(function () {
    BIO.lodTick(camera);
  });

  // Ensure 100% of opaque non-actor meshes (including SWBAY `biome:lobe` fungoid caps, KDOORLEAF hardware & KIT clones) carry UVs and detail maps
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    for (let p = o; p; p = p.parent) {
      if ((typeof TORUS_LIFE !== 'undefined' && TORUS_LIFE && p === TORUS_LIFE.group) || p.name === 'torus_life_root') return;
    }
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    let boundAny = false;
    for (let mi = 0; mi < mats.length; mi++) {
      const m = mats[mi];
      if (!m || m.transparent || m.isMeshBasicMaterial || m.isShaderMaterial) continue;
      const hasTex = !!(m.map || (m.uniforms && (m.uniforms.map || m.uniforms.uTex)));
      if (!hasTex) {
        m.map = fmDetail.map;
        if (m.isMeshStandardMaterial && !m.roughnessMap) m.roughnessMap = fmDetail.roughnessMap;
        m.needsUpdate = true;
        boundAny = true;
      }
    }
    if (boundAny && !o.geometry.attributes.uv) {
      TORUS_DRAW.addTriplanarUvs(o.geometry, 1.8);
    }
  });

  // Verify zero blobby kits/ancients placeholder flora meshes exist in TORUS_ARCOLOGY_GROUP
  let blobbyAncients = 0;
  if (TORUS_ARCOLOGY_GROUP) {
    TORUS_ARCOLOGY_GROUP.traverse(function (o) {
      if (o.isInstancedMesh && typeof MAT !== 'undefined' && (o.material === MAT.leaf || o.material === MAT.moss || o.material === MAT.vine || o.material === MAT.leafCard)) {
        if (o.count > 0) blobbyAncients += o.count;
      }
    });
  }

  return {
    group: floraGroup,
    skyVineRecord: skyVineRecord,
    vineCurtains: vineCurtainCount,
    vineFruitBunches: vineFruitBunches,
    cropPlants: cropPlantCount,
    orchardTrees: orchardTreeCount,
    swbayTrees: swbayPlacedTrees,
    specimenPlants: specimenPlantCount,
    feralPlants: feralPlantCount,
    ruinedPodMats: ruinedPodMats,
    blobbyAncients: blobbyAncients
  };
})();
