// ================================================================= DRUM — 8bl: Socketed SWBay Biome Vegetation & Arcology Overgrowth ([draw])
// Replaces blobby placeholder primitives with genuine biomes/swbay vegetation:
//   1. SWBAY.dress(dressShells): tree ferns, red/purple epiphytes, hanging curtains, aerial roots, moss mats & wine brackets
//      socketed onto Drum Arcology upper terrace decks, tier soffits, and ENE Collapse Quarry megablocks.
//   2. SWBAY.build(): semi-arid Southwest Bay savanna (gate baobabs, umbrella thorns, monkey puzzles, dragon trees,
//      parasol mushrooms & dry grass) across the valley floor + lush riparian reeds, splay shrubs & cap-trees along Drim Rivrh.
//   3. SWBAY.treeAt / SWBAY.plantAt: socketed directly into masonry Tree Planters on the L15 Sky-Terrace (y=66m),
//      Bourse Forecourts, Praetorium Muster Bailey, and Scrap-Market Assay Rotunda Plaza.

const DRUM_FLORA = (function buildDrumSwbayFlora() {
  const floraGroup = new THREE.Group();
  floraGroup.name = 'drum_swbay_flora_root';
  scene.add(floraGroup);

  if (typeof BIO === 'undefined' || typeof SWBAY === 'undefined') {
    return { group: floraGroup, trees: 0, planters: 0, dressedShells: 0, blobbyAncients: 0 };
  }

  const deg = Math.PI / 180;
  const rvx = Math.cos(320 * deg), rvz = Math.sin(320 * deg);
  const rtx = -rvz, rtz = rvx;

  // Scale SWBAY megaflora crowns/boles proportionally to SWBAY.TEMPLE_H (52m) so river/frontier trees have balanced proportions
  if (!SWBAY._drumScaled) {
    const k = Math.pow(SWBAY.TEMPLE_H / 110.0, 0.72);
    SWBAY.SPECIES.forEach(function (S) {
      if (['prismgum', 'baobab', 'captree', 'fancrown', 'ironbark'].indexOf(S.key) >= 0) {
        S.crownR = S.crownR.map(function (v) { return v * k; });
        S.rb = S.rb.map(function (v) { return v * k; });
      }
    });
    SWBAY._drumScaled = k;
  }

  // Merge runtime LOD chunks so draw calls stay compact
  BIO.LOD.merge = true;
  BIO.LOD.minTris = 3500;
  BIO.LOD.chunk = 440;

  function riverBankDist(x, z) {
    const dn = x * rvx + z * rvz;
    const dt = x * rtx + z * rtz;
    const rc = 615.0 + 18.0 * Math.sin(dt / 280.0);
    return Math.abs(dn - rc);
  }

  function nearRadialSpoke(x, z, pad) {
    const r = Math.hypot(x, z);
    if (r < 200 || r > 860) return false;
    const th = ((Math.atan2(z, x) / deg) + 360) % 360;
    for (let i = 0; i < DRUM_PLAN.roads.length; i++) {
      const rd = DRUM_PLAN.roads[i];
      if (rd.kind !== 'radial') continue;
      if (r < rd.r0 - 8 || r > rd.r1 + 95) continue;
      const d = Math.abs(th - rd.deg);
      const ad = d > 180 ? 360 - d : d;
      const perp = r * Math.sin(Math.min(0.5 * Math.PI, ad * deg));
      if (perp < 0.5 * rd.width + pad) return true;
    }
    return false;
  }

  // Keep-clear obstacles around landmarks, W2 Palisade Gates, and River Wharf
  const obstacles = [];
  for (let i = 0; i < DRUM_PLAN.landmarks.length; i++) {
    const lm = DRUM_PLAN.landmarks[i];
    if (lm.r > 0) {
      obstacles.push({ x: lm.x, z: lm.z, r: Math.max(lm.w, lm.d) * 0.62 + 12.0 });
    }
  }
  for (let g = 0; g < DRUM_PLAN.gates.length; g++) {
    const gt = DRUM_PLAN.gates[g];
    obstacles.push({ x: gt.x, z: gt.z, r: 24.0 });
  }

  // LOD origin spine covering the Arcology, W2 Palisade ring, Drim Rivrh corridor & frontier approaches
  const spine = [[0, 0]];
  for (let a = 0; a < 360; a += 45) {
    spine.push([680 * Math.cos(a * deg), 680 * Math.sin(a * deg)]);
    spine.push([1050 * Math.cos((a + 22.5) * deg), 1050 * Math.sin((a + 22.5) * deg)]);
  }

  BIO.init({
    THREE: THREE,
    scene: floraGroup,
    terrainH: drumGroundAt,
    seed: DRUM_SEED + 701,
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
      const h = drumGroundAt(x, z);
      if (h < -0.25) return 0; // Deep river channel
      const r = Math.hypot(x, z);
      const rbd = riverBankDist(x, z);
      // Lush riparian margin along Drim Rivrh banks (rbd = 21..46m), clear of wharf & bridges
      if (rbd >= 20.5 && rbd <= 46.0 && !nearRadialSpoke(x, z, 10.0)) {
        return r > 565.0 ? 1.0 : 0.0;
      }
      // Inside Outer Palisade W2 (r < 650m): zero wild ground scatter (urban greenery is socketed into masonry planters & arcology terraces!)
      if (r < 650.0) return 0;
      if (nearRadialSpoke(x, z, 9.0)) return 0;
      return Math.min(1.0, (r - 650.0) / 28.0);
    },
    fields: {
      wet: function (x, z) {
        const rbd = riverBankDist(x, z);
        if (rbd < 78.0) return 0.86 - 0.58 * (rbd / 78.0);
        return 0.24 + 0.08 * KRAND.fbm(x / 420.0, 0.7, z / 420.0, 2, 8821);
      },
      upland: function (x, z) {
        const rbd = riverBankDist(x, z);
        if (rbd < 62.0) return 0.08;
        return 0.68;
      },
      flow: function (x, z) {
        const rbd = riverBankDist(x, z);
        return rbd < 48.0 ? 0.82 : 0.0;
      },
      salt: function () { return 0; }
    }
  });

  // 1. Build Southwest Bay frontier savanna & Drim Rivrh riparian corridor
  const buildOut = SWBAY.build({ R: 1320, quality: 0.34, fauna: false });

  // 2. Socket SWBAY overgrowth (tree ferns, bromeliads, curtains, roots, moss & brackets) onto BOTH Lower/Mid Arcology + Quarry AND Upper Crown!
  const shellsLow = (DRUM_ARCOLOGY_GROUP && DRUM_ARCOLOGY_GROUP.userData && DRUM_ARCOLOGY_GROUP.userData.dressShellsLow)
    ? DRUM_ARCOLOGY_GROUP.userData.dressShellsLow : [];
  const shellsHigh = (DRUM_ARCOLOGY_GROUP && DRUM_ARCOLOGY_GROUP.userData && DRUM_ARCOLOGY_GROUP.userData.dressShellsHigh)
    ? DRUM_ARCOLOGY_GROUP.userData.dressShellsHigh : [];
  const dressShells = shellsLow.concat(shellsHigh);
  if (shellsLow.length > 0 && typeof SWBAY.dress === 'function') {
    SWBAY.dress(shellsLow, {
      seed: 77,
      ledges: { moss: 220, plants: 195, edges: 110, treeH: 10.0, size: 2.8, hang: 15 },
      soffits: { n: 155, mossR: 4.6, hang: 13 },
      walls: { n: 95, hang: 11 }
    });
  }
  if (shellsHigh.length > 0 && typeof SWBAY.dress === 'function') {
    SWBAY.dress(shellsHigh, {
      seed: 181,
      ledges: { moss: 140, plants: 110, edges: 65, treeH: 11.0, size: 3.0, hang: 16 },
      soffits: { n: 95, mossR: 5.0, hang: 14 },
      walls: { n: 55, hang: 12 }
    });
  }

  // 3. Socket curated SWBAY hero trees & understorey plants into every masonry Planter Socket (L15 Sky-Terrace, Forecourts, Praetorium & Bourse!)
  const allPlanters = [];
  if (DRUM_ARCOLOGY_GROUP && DRUM_ARCOLOGY_GROUP.userData && DRUM_ARCOLOGY_GROUP.userData.planterSockets) {
    for (let i = 0; i < DRUM_ARCOLOGY_GROUP.userData.planterSockets.length; i++) {
      allPlanters.push(DRUM_ARCOLOGY_GROUP.userData.planterSockets[i]);
    }
  }
  if (DRUM_LANDMARKS_GROUP && DRUM_LANDMARKS_GROUP.userData && DRUM_LANDMARKS_GROUP.userData.landmarkPlanters) {
    for (let i = 0; i < DRUM_LANDMARKS_GROUP.userData.landmarkPlanters.length; i++) {
      allPlanters.push(DRUM_LANDMARKS_GROUP.userData.landmarkPlanters[i]);
    }
  }

  let socketedCount = 0;
  for (let p = 0; p < allPlanters.length; p++) {
    const pl = allPlanters[p];
    const py = pl.y;
    const flatGround = function () { return py; };
    const t = SWBAY.treeAt(pl.species || 'dragon', pl.x, py, pl.z, {
      seed: KRAND.hash(DRUM_SEED, p, 901),
      scale: pl.scale == null ? 0.68 : pl.scale,
      wet: 0.55,
      ground: flatGround
    });
    if (t) socketedCount++;
    // Companion understorey ferns, rosettes & blooms around the base of each curbed planter bed!
    for (let u = 0; u < 3; u++) {
      const ua = (p * 1.7 + (u * 2 * Math.PI) / 3);
      const ur = 1.35 + (u % 2) * 0.45;
      const pKind = u === 0 ? 'fern' : (u === 1 ? 'rosette' : 'blooms');
      SWBAY.plantAt(pKind, pl.x + ur * Math.cos(ua), py, pl.z + ur * Math.sin(ua), {
        seed: KRAND.hash(DRUM_SEED, p, u, 907),
        lv: 2,
        ground: flatGround
      });
    }
  }

  // 4. Socket lush riparian reeds, splaylets & ferns along Drim Rivrh wharf banks
  for (let rb = -7; rb <= 7; rb++) {
    if (Math.abs(rb) <= 1) continue; // Keep wharf landing stage clear
    const dt = rb * 38.0;
    for (let side = -1; side <= 1; side += 2) {
      const dn = 615.0 + 18.0 * Math.sin(dt / 280.0) + side * 22.5;
      const rx = dn * rvx + dt * rtx;
      const rz = dn * rvz + dt * rtz;
      const ry = drumGroundAt(rx, rz);
      SWBAY.plantAt(rb % 2 === 0 ? 'reed' : 'splaylet', rx, Math.max(-0.55, ry), rz, {
        seed: KRAND.hash(DRUM_SEED, rb + 50, side + 2, 919),
        lv: 2
      });
    }
  }

  // 5. Bake all SWBAY instanced & tube/lathe meshes into floraGroup, bake octahedral far-tree impostors, then point BIO.host.scene to main scene for attachAudit!
  BIO.bake();
  if (typeof BIO.bakeImpostors === 'function' && typeof renderer !== 'undefined' && renderer) {
    BIO.bakeImpostors(renderer);
  }
  BIO.host.scene = scene;
  BIO.lodTick(camera);
  ANC_TICKS.push(function () {
    BIO.lodTick(camera);
  });

  // Verify zero blobby kits/ancients placeholder flora meshes exist in DRUM_ARCOLOGY_GROUP
  let blobbyAncients = 0;
  if (DRUM_ARCOLOGY_GROUP) {
    DRUM_ARCOLOGY_GROUP.traverse(function (o) {
      if (o.isInstancedMesh && typeof MAT !== 'undefined' && (o.material === MAT.leaf || o.material === MAT.moss || o.material === MAT.vine)) {
        if (o.count > 0) blobbyAncients += o.count;
      }
    });
  }

  return {
    group: floraGroup,
    trees: SWBAY.TREES ? SWBAY.TREES.length : (buildOut.trees || 0),
    planters: socketedCount,
    dressedShells: dressShells.length,
    blobbyAncients: blobbyAncients
  };
})();
