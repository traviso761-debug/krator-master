// ================================================================= TORUS — 8bf: Forest Ring Arcology, Rim Trellises, Winches & Stage 4 Decks ([draw])
// Binds PBR material maps, registers KTAGS, invokes buildForestRing(holder, 0, 0, 1) while stripping all blobby kits/ancients flora and
// plain Wheel-Town placeholder boxes (replaced by real SWBAY/CROPS flora in 8bl and Rinkvolk kit skyBuildings in 8bh), prunes rogue plinth
// blocks outside r=292.5m below y=82m, extracts shell surfaces for SWBAY.dress, builds 44 Rim Trellis Outriggers & Loam Troughs,
// 44 detailed Tether-Winch Crane Houses, 22 dynamic Harvester Gondolas, and Z-clean Stage 4 interior decks/ceilings/stairs/walls.

TORUS_DRAW.bindPbrMats();

// Ensure every opaque kits/ancients material slot also carries tactile detail maps so zero untextured surfaces exist on the Forest Ring
(function bindAncientsExtraMats() {
  if (typeof MAT === 'undefined' || !MAT) return;
  const fm = TORUS_DRAW.getFurnDetailMaps();
  const keys = ['dark', 'darkSurf', 'ancDoor', 'strip', 'dot'];
  for (let i = 0; i < keys.length; i++) {
    const m = MAT[keys[i]];
    if (m && !m.map) {
      m.map = fm.map;
      if (m.roughness !== undefined && !m.roughnessMap) m.roughnessMap = fm.roughnessMap;
      m.needsUpdate = true;
    }
  }
})();

const TORUS_TAGS = KTAGS.create({ build: 'torus' });
KTAGS.page = TORUS_TAGS;
TORUS.registerTags(TORUS_PLAN, TORUS_TAGS);

const TORUS_ARCOLOGY_GROUP = (function buildTorusArcology3D() {
  const root = new THREE.Group();
  root.name = 'forest_ring_arcology';
  scene.add(root);

  const deg = Math.PI / 180;

  function angDiffDeg(a, b) {
    const na = ((a % 360) + 360) % 360;
    const nb = ((b % 360) + 360) % 360;
    const d = Math.abs(na - nb);
    return d > 180 ? 360 - d : d;
  }

  // Helper: identify crude 71c-ring.js placeholder buildings so Rinkvolk & Scrap Voth kit buildings replace them cleanly:
  //   1. Wheel Town (y=300..346, r=564..641.5): all townBld boxes + 4 crude bridge watchtower boxes, keeping 96m Pylons,
  //      paved bridge square slabs (sy<=0.5), bridge square lamp-posts (sx<=1.0, sy<=7.5), rim parapets (r=558/721) & wood kerb (r=644).
  //   2. Stepped Crown Living Bands (6 concrete treads at y=616,632,648,664,680,696): all plain concrete dwelling blocks,
  //      balconies & flat caps strictly inside [rB+1.5, rA-1.5], keeping treads/risers, terrace edge parapets (rA*1.004),
  //      forest kerbs, 8 radial stairs, 3 head arcades (RHEAD=240,152,56), rim gallery (y=600) & central lantern (r<=72).
  const CROWN_LIVING_BANDS = [
    { rB: 270.0, rA: 292.0, yB: 616.0 },
    { rB: 248.0, rA: 270.0, yB: 632.0 },
    { rB: 182.0, rA: 204.0, yB: 648.0 },
    { rB: 160.0, rA: 182.0, yB: 664.0 },
    { rB: 94.0,  rA: 116.0, yB: 680.0 },
    { rB: 72.0,  rA: 94.0,  yB: 696.0 }
  ];

  function isPlainArcologyBuilding(item, bucketName) {
    const px = item.p[0], py = item.p[1], pz = item.p[2];
    const r = Math.hypot(px, pz);
    const sx = typeof item.s === 'number' ? item.s : item.s[0];
    const sy = typeof item.s === 'number' ? item.s : item.s[1];

    // 1. Wheel Town & 4 crude Bridge Gate Watchtowers (WY = 300 m)
    if (py >= 299.6 && py <= 346.0 && r >= 564.0 && r <= 641.5) {
      if (sy >= 36.0) return false; // Preserve 96m structural Wheel Pylons & stay beams
      if ((bucketName === 'slab' || bucketName === 'slabR' || bucketName === 'slabC' || bucketName === 'slabCR') && sy <= 0.5 && py < 301.0) return false; // Preserve bridge gate square paving
      if ((bucketName === 'frPost' || bucketName === 'frPostR') && sx <= 1.0 && sy <= 7.5 && py < 301.0) return false; // Preserve square lamp-posts
      return true;
    }

    // 2. Stepped Crown Living-Band dwellings (BAND[0..2], NTER=2)
    if (py >= 616.0 && py <= 714.0 && r >= 73.5 && r <= 290.5) {
      if (sx <= 0.45 && sy <= 1.25) return false; // Preserve radial stair balusters
      for (let bi = 0; bi < CROWN_LIVING_BANDS.length; bi++) {
        const b = CROWN_LIVING_BANDS[bi];
        if (r >= b.rB + 1.5 && r <= b.rA - 1.5 && py >= b.yB + 0.3 && py <= b.yB + 17.5) {
          return true;
        }
      }
    }
    return false;
  }

  // 1. Run kits/ancients 71c-ring.js (Forest Ring) in semi-ruined state (d=1), strip blobby flora & crude Wheel/Crown boxes, then bake
  const holder = new THREE.Group();
  holder.name = 'ancients_forest_ring_megastructure';
  KIT.order.forEach(function (n) { if (KIT.items[n]) KIT.items[n].length = 0; });
  KOFF = [0, 0, 0];
  KXF = null;
  TSTAT.cur = 'arcology/forest_ring';
  try {
    buildForestRing(holder, 0, 0, 1);
    // Strip 100% of blobby kits/ancients flora & stick figures (replaced by real SWBAY + CROPS plants in 8bl and citizens in 88d!)
    const stripBuckets = ['figB', 'figH', 'frBole', 'frCrown', 'frCrown2', 'frScrub', 'frScrub2', 'trunk', 'leafCard', 'moss', 'vine'];
    for (let sb = 0; sb < stripBuckets.length; sb++) {
      const bn = stripBuckets[sb];
      if (KIT.items[bn]) KIT.items[bn].length = 0;
    }
    // Strip crude Wheel Town houses, 4 crude Bridge Watchtowers & all 6 Crown Living-Band dwelling rows so 8bh replaces them with kit buildings
    const townBuckets = ['box', 'boxR', 'boxC', 'boxCR', 'slab', 'slabR', 'slabC', 'slabCR', 'frPost', 'frPostR', 'pane', 'paneD', 'frDoor', 'finial', 'strip'];
    for (let tb = 0; tb < townBuckets.length; tb++) {
      const tn = townBuckets[tb];
      if (KIT.items[tn] && KIT.items[tn].length) {
        KIT.items[tn] = KIT.items[tn].filter(function (it) { return !isPlainArcologyBuilding(it, tn); });
      }
    }
    KOFF = [0, 0, 0];
    KXF = null;
    kbake(holder);
  } catch (e) {
    if (typeof ancReportErr === 'function') ancReportErr('buildForestRing: ' + (e.stack == null ? e : e.stack));
  }
  TSTAT.cur = null;
  KIT.order.forEach(function (n) { if (KIT.items[n]) KIT.items[n].length = 0; });

  // Strip the flat concrete plinth AND all rogue 71c-ring.js plinth service blocks/rubble outside r=292.5m below y=82m
  // (HOOPY[0] is at y=111m, so maxPruneY=82m preserves 100% of the Barrel & Wheel while leaving Terrace T1..T10 completely clean!)
  TORUS_DRAW.pruneArcologySkirt(holder, 292.5, 82.0);
  root.add(holder);

  // Extract world-space surface shells from holder so 8bl-torus-flora.js can socket SWBAY.dress overgrowth onto Barrel, Wheel & Crown!
  const dressShellsBarrel = [];
  const dressShellsWheel = [];
  const dressShellsCrown = [];
  holder.updateMatrixWorld(true);
  holder.traverse(function (o) {
    if (!o.isMesh || o.isInstancedMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
    if (typeof MAT !== 'undefined' && MAT && (o.material === MAT.guts || o.material === MAT.winIntact || o.material === MAT.winDead)) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    const pos = g.attributes.position;
    const barrelV = [], wheelV = [], crownV = [];
    for (let t = 0; t + 2 < pos.count; t += 3) {
      const x0 = pos.getX(t), y0 = pos.getY(t), z0 = pos.getZ(t);
      const x1 = pos.getX(t + 1), y1 = pos.getY(t + 1), z1 = pos.getZ(t + 1);
      const x2 = pos.getX(t + 2), y2 = pos.getY(t + 2), z2 = pos.getZ(t + 2);
      const cy = (y0 + y1 + y2) / 3.0;
      const cr = Math.hypot((x0 + x1 + x2) / 3.0, (z0 + z1 + z2) / 3.0);
      if (cy >= 218.0 && cy <= 332.0 && cr >= 530.0) {
        wheelV.push(x0, y0, z0, x1, y1, z1, x2, y2, z2);
      } else if (cy >= 588.0 && cy <= 765.0) {
        crownV.push(x0, y0, z0, x1, y1, z1, x2, y2, z2);
      } else if (cy >= 48.0 && cy < 588.0 && cr >= 265.0 && cr <= 435.0) {
        barrelV.push(x0, y0, z0, x1, y1, z1, x2, y2, z2);
      }
    }
    function pushShell(arr, target) {
      if (arr.length < 9) return;
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
      sg.computeVertexNormals();
      target.push(sg);
    }
    pushShell(barrelV, dressShellsBarrel);
    pushShell(wheelV, dressShellsWheel);
    pushShell(crownV, dressShellsCrown);
  });

  // 2. 44 Articulated Rim Trellis Outriggers & Irrigated Loam Root-Troughs (botanical sky-fruitvine clumps socketed onto vineAnchors in 8bl!)
  const arc = TORUS_PLAN.arcology;
  const steelGeos = [], rustGeos = [], timberGeos = [], loamGeos = [], bronzeGeos = [], verdGeos = [], stoneGeos = [], glowGeos = [];
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eul = new THREE.Euler(0, 0, 0, 'YXZ');
  const one = new THREE.Vector3(1, 1, 1);

  const vineAnchors = [];
  for (let v = 0; v < arc.fruitvines.length; v++) {
    const fv = arc.fruitvines[v];
    const isInner = fv.rim === 'inner';
    const outDir = isInner ? -1 : 1;
    const baseR = fv.r;
    const aMid = fv.deg * deg;
    const yawMid = -aMid + 0.5 * Math.PI;

    // Curved Rim Irrigated Root-Trough & Steel Cantilever Trellis Outriggers across the 11-deg curtain span
    const nSub = 5;
    for (let s = 0; s < nSub; s++) {
      const subDeg = fv.deg - 5.2 + (10.4 * s) / (nSub - 1);
      const a = subDeg * deg;
      const yaw = -a + 0.5 * Math.PI;
      const troughR = baseR - outDir * 2.2;
      const tx = troughR * Math.cos(a), tz = troughR * Math.sin(a);
      // Stone/steel root planter box on Wheel rim + furrowed loam soil bed inside
      m4.makeRotationY(yaw).setPosition(tx, 300.75, tz);
      rustGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(11.6, 1.35, 2.8), m4, false, 4.0));
      m4.makeRotationY(yaw).setPosition(tx, 301.46, tz);
      loamGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(11.0, 0.16, 2.2), m4, false, 3.0));

      // Cantilevered steel trellis spur projecting over the 300m abyss + diagonal knee brace under the rim
      const spurR = baseR + outDir * 1.9;
      m4.makeRotationY(yaw).setPosition(spurR * Math.cos(a), 299.65, spurR * Math.sin(a));
      steelGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(0.45, 0.55, 6.6), m4, false, 3.0));
      eul.set(outDir * 0.58, yaw, 0);
      q.setFromEuler(eul);
      const brR = baseR + outDir * 1.2;
      m4.compose(new THREE.Vector3(brR * Math.cos(a), 297.6, brR * Math.sin(a)), q, one);
      steelGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(0.36, 0.36, 5.2), m4, false, 3.0));
    }
    // Horizontal trellis crossbar & bronze irrigation drip-header pipe tying the 5 spurs together
    for (let tier = 0; tier < 3; tier++) {
      const barR = baseR + outDir * (2.6 + tier * 0.45);
      const barY = 299.4 - tier * 3.6;
      const spanW = (11.2 * deg) * barR;
      m4.makeRotationY(yawMid).setPosition(barR * Math.cos(aMid), barY, barR * Math.sin(aMid));
      steelGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(spanW, 0.28, 0.28), m4, false, 4.0));
    }
    const pipeR = baseR - outDir * 1.1;
    eul.set(0, yawMid, 0.5 * Math.PI);
    q.setFromEuler(eul);
    m4.compose(new THREE.Vector3(pipeR * Math.cos(aMid), 301.65, pipeR * Math.sin(aMid)), q, one);
    verdGeos.push(TORUS_DRAW.bakeGeo(new THREE.CylinderGeometry(0.16, 0.16, (10.8 * deg) * pipeR, 8), m4, false, 3.0));

    vineAnchors.push({
      id: fv.id,
      cropId: fv.cropId || 'sky-fruitvine',
      cultivar: fv.cultivar,
      rim: fv.rim,
      outDir: outDir,
      deg: fv.deg,
      r: baseR,
      yTop: 301.35,
      dropM: fv.dropM
    });
  }

  // 3. 44 Detailed Tether-Winch Crane Houses + 22 Dynamic Suspended Harvester Gondolas
  const gondolaSpecs = [];
  for (let ts = 0; ts < arc.tetherStations.length; ts++) {
    const st = arc.tetherStations[ts];
    const a = st.deg * deg;
    const isInner = st.rim === 'inner';
    const outDir = isInner ? -1 : 1;
    const yaw = -a + 0.5 * Math.PI;
    const wx = st.at[0], wy = st.at[1], wz = st.at[2];
    const radX = Math.cos(a), radZ = Math.sin(a);
    const tanX = -radZ, tanZ = radX;

    // Grounded timber & riveted-steel winch platform (lifted +0.16m cleanly above Wheel deck)
    m4.makeRotationY(yaw).setPosition(wx, wy + 0.24, wz);
    timberGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(8.2, 0.32, 6.4), m4, false, 3.0));

    // Corrugated steel/timber Winch Operator Cabin with pitched verdigris gable roof & lit observation window
    const cabX = wx - radX * outDir * 1.2, cabZ = wz - radZ * outDir * 1.2;
    m4.makeRotationY(yaw).setPosition(cabX, wy + 2.05, cabZ);
    rustGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(5.8, 3.3, 4.0), m4, false, 3.5));
    for (let rf = -1; rf <= 1; rf += 2) {
      eul.set(rf * 0.34, yaw, 0);
      q.setFromEuler(eul);
      m4.compose(
        new THREE.Vector3(cabX + radX * rf * 1.12, wy + 4.02, cabZ + radZ * rf * 1.12),
        q,
        one
      );
      verdGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(6.3, 0.22, 2.55), m4, false, 3.0));
    }
    m4.makeRotationY(yaw).setPosition(cabX + radX * outDir * 2.04, wy + 2.35, cabZ + radZ * outDir * 2.04);
    glowGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(2.6, 0.85, 0.14), m4, false, 2.0));

    // Spoked Bronze & Steel Cable Winch Drum + Counterweight Box
    const drX = wx + radX * outDir * 1.7, drZ = wz + radZ * outDir * 1.7;
    eul.set(0, yaw, 0.5 * Math.PI);
    q.setFromEuler(eul);
    m4.compose(new THREE.Vector3(drX, wy + 1.45, drZ), q, one);
    bronzeGeos.push(TORUS_DRAW.bakeGeo(new THREE.CylinderGeometry(0.95, 0.95, 2.8, 12), m4, false, 2.5));
    for (let flg = -1; flg <= 1; flg += 2) {
      m4.compose(new THREE.Vector3(drX + tanX * flg * 1.45, wy + 1.45, drZ + tanZ * flg * 1.45), q, one);
      steelGeos.push(TORUS_DRAW.bakeGeo(new THREE.CylinderGeometry(1.32, 1.32, 0.18, 12), m4, false, 2.5));
    }

    // Twin inclined A-frame Crane Jib Booms + Head Pulley Sheave projecting out over the fruitvine curtain
    const boomR = st.r + outDir * 4.8;
    for (let leg = -1; leg <= 1; leg += 2) {
      eul.set(-outDir * 0.28, yaw, leg * 0.08);
      q.setFromEuler(eul);
      m4.compose(
        new THREE.Vector3(boomR * radX + tanX * leg * 1.15, wy + 4.35, boomR * radZ + tanZ * leg * 1.15),
        q,
        one
      );
      steelGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(0.36, 0.48, 11.4), m4, false, 3.5));
    }
    const tipR = st.r + outDir * 9.2;
    m4.makeRotationY(yaw).setPosition(tipR * radX, wy + 5.75, tipR * radZ);
    steelGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(2.6, 0.44, 1.2), m4, false, 2.5));
    eul.set(0, yaw, 0.5 * Math.PI);
    q.setFromEuler(eul);
    m4.compose(new THREE.Vector3(tipR * radX, wy + 5.45, tipR * radZ), q, one);
    bronzeGeos.push(TORUS_DRAW.bakeGeo(new THREE.CylinderGeometry(0.68, 0.68, 0.42, 12), m4, false, 2.0));

    if (ts % 2 === 0) {
      const gx = tipR * radX;
      const gz = tipR * radZ;
      gondolaSpecs.push({
        gx: gx, gz: gz, wy: wy + 5.35, yaw: yaw,
        baseDrop: 24.0 + (ts % 5) * 13.5,
        amp: 15.0 + (ts % 3) * 6.0,
        phase: ts * 0.73
      });
    }
  }

  // Detailed multi-part Gondola Basket geometry (timber deck, open steel corner stanchions, safety rails & overhead spreader bar)
  const basketParts = [];
  m4.identity().setPosition(0, -1.05, 0);
  basketParts.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(3.8, 0.34, 2.7), m4, false, 2.2));
  for (let side = -1; side <= 1; side += 2) {
    m4.identity().setPosition(0, -0.45, side * 1.28);
    basketParts.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(3.8, 0.92, 0.14), m4, false, 2.2));
    m4.identity().setPosition(side * 1.83, -0.45, 0);
    basketParts.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(0.14, 0.92, 2.6), m4, false, 2.2));
  }
  for (let sx = -1; sx <= 1; sx += 2) {
    for (let sz = -1; sz <= 1; sz += 2) {
      m4.identity().setPosition(sx * 1.78, 0.25, sz * 1.22);
      basketParts.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(0.14, 2.45, 0.14), m4, false, 2.0));
    }
  }
  m4.identity().setPosition(0, 1.48, 0);
  basketParts.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(3.9, 0.22, 2.8), m4, false, 2.2));
  const basketGeo = TORUS_DRAW.mergeGeoList(basketParts);

  const nGondolas = gondolaSpecs.length;
  const cableInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.11, 1.0, 6), TORUS_DRAW.MATS.tankSteel, nGondolas);
  const cabinInst = new THREE.InstancedMesh(basketGeo, TORUS_DRAW.MATS.timber, nGondolas);
  const lanternInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.40, 0.65, 8), TORUS_DRAW.MATS.warmGlow, nGondolas);
  cableInst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  cabinInst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  lanternInst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  cableInst.frustumCulled = false;
  cabinInst.frustumCulled = false;
  lanternInst.frustumCulled = false;
  root.add(cableInst, cabinInst, lanternInst);

  const gPos = new THREE.Vector3(), gScale = new THREE.Vector3(1, 1, 1), gQuat = new THREE.Quaternion(), gEul = new THREE.Euler(0, 0, 0, 'YXZ');
  function updateGondolas(timeSec, harvestActive) {
    const t = timeSec == null ? 0 : timeSec;
    for (let i = 0; i < nGondolas; i++) {
      const gs = gondolaSpecs[i];
      const drop = harvestActive
        ? (gs.baseDrop + gs.amp * (0.5 + 0.5 * Math.sin(t * 0.28 + gs.phase)))
        : 12.0 + (i % 3) * 3.5;
      gQuat.identity();
      gPos.set(gs.gx, gs.wy - 0.5 * drop, gs.gz);
      gScale.set(1, drop, 1);
      m4.compose(gPos, gQuat, gScale);
      cableInst.setMatrixAt(i, m4);

      gEul.set(0, gs.yaw, 0);
      gQuat.setFromEuler(gEul);
      gScale.set(1, 1, 1);
      gPos.set(gs.gx, gs.wy - drop, gs.gz);
      m4.compose(gPos, gQuat, gScale);
      cabinInst.setMatrixAt(i, m4);

      gPos.set(gs.gx, gs.wy + 1.85 - drop, gs.gz);
      m4.compose(gPos, gQuat, gScale);
      lanternInst.setMatrixAt(i, m4);
    }
    cableInst.instanceMatrix.needsUpdate = true;
    cabinInst.instanceMatrix.needsUpdate = true;
    lanternInst.instanceMatrix.needsUpdate = true;
  }
  updateGondolas(0, true);

  // 4. Architectural T1 Foot Portals (r=295m, y=44m) & Barrel Waystation Lantern Balconies
  for (let p = 0; p < arc.portals.length; p++) {
    const prt = arc.portals[p];
    if (prt.ruined) continue;
    const pa = prt.deg * deg, yaw = -pa + 0.5 * Math.PI;
    const radX = Math.cos(pa), radZ = Math.sin(pa);
    const tanX = -radZ, tanZ = radX;
    for (let side = -1; side <= 1; side += 2) {
      const px = 294.8 * radX + tanX * side * 6.2;
      const pz = 294.8 * radZ + tanZ * side * 6.2;
      m4.makeRotationY(yaw).setPosition(px, 48.2, pz);
      stoneGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(3.6, 8.4, 5.2), m4, false, 4.0));
    }
    m4.makeRotationY(yaw).setPosition(295.0 * radX, 53.2, 295.0 * radZ);
    stoneGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(16.8, 2.0, 5.8), m4, false, 4.0));
    m4.makeRotationY(yaw).setPosition(295.2 * radX, 54.6, 295.2 * radZ);
    verdGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(17.4, 0.85, 6.2), m4, false, 3.5));
    m4.makeRotationY(yaw).setPosition(297.8 * radX, 50.8, 297.8 * radZ);
    glowGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(7.8, 0.65, 0.35), m4, false, 2.0));
  }
  for (let wy = 110; wy <= 540; wy += 86) {
    for (let sp = 0; sp < 4; sp++) {
      const ba = (sp * 90 + 25) * deg;
      const br = TORUS.rBarrelAt(wy) + 1.5;
      m4.makeRotationY(-ba + 0.5 * Math.PI).setPosition(br * Math.cos(ba), wy, br * Math.sin(ba));
      glowGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(3.2, 0.95, 0.85), m4, false, 2.0));
    }
  }

  // 4b. Timber-and-Steel Rinkvolk Walkway Spans along the 4 Wheel Spoke Bridges (lifted at y=300.22m so zero Z-fighting with 71c-ring.js!)
  const rBarBridge = TORUS.rBarrelAt(300.0) - 4.0;
  for (let bi = 0; bi < arc.wheelBridges.length; bi++) {
    const br = arc.wheelBridges[bi];
    const ba = br.deg * deg, yaw = -ba + 0.5 * Math.PI;
    const rMid = 0.5 * (rBarBridge + 564.0);
    const spanLen = 564.0 - rBarBridge;
    m4.makeRotationY(yaw).setPosition(rMid * Math.cos(ba), 300.14, rMid * Math.sin(ba));
    timberGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(5.6, 0.16, spanLen), m4, false, 3.5));
    for (let side = -1; side <= 1; side += 2) {
      const tx = -Math.sin(ba) * side * 3.0, tz = Math.cos(ba) * side * 3.0;
      m4.makeRotationY(yaw).setPosition(rMid * Math.cos(ba) + tx, 300.75, rMid * Math.sin(ba) + tz);
      steelGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(0.24, 1.15, spanLen), m4, false, 4.0));
    }
  }

  // 5. Stage 4 Interior Floor Decks + Ceiling Soffits, Hoist/Crown Stairs & Bulkhead Partitions (skipping coplanar 71c-ring.js decks!)
  const SKIP_COPLANAR_SLABS = {
    wheel_main_deck: true,
    wheel_cider_apron_in: true,
    wheel_cider_apron_out: true,
    wheel_radial_bridge: true,
    crown_ring_0: true,
    crown_ring_1: true,
    crown_ring_2: true
  };
  const A4 = TORUS_STAGE4.arcology;
  for (let lv = 0; lv <= 5; lv++) {
    const lvGrp = new THREE.Group();
    lvGrp.name = 'arc_level_L' + lv;
    const byMat = {};
    function pushGeo(matName, geo) {
      if (!geo) return;
      const k = matName || 'ancientStone';
      if (!byMat[k]) byMat[k] = [];
      byMat[k].push(geo);
    }
    for (let i = 0; i < A4.slabs.length; i++) {
      const sl = A4.slabs[i];
      if (sl.level !== lv || SKIP_COPLANAR_SLABS[sl.kind]) continue;
      let yTop = sl.y;
      let thick = sl.thick;
      // Offset overlapping junction landings slightly above adjacent concourses so zero Z-fighting occurs
      if (sl.kind === 'foot_portal_avenue') { yTop = 44.16; thick = 0.14; }
      else if (sl.kind === 'hoist_landing') { yTop = sl.y + 0.18; thick = 0.16; }
      else if (sl.kind === 'hoist_tie_gallery' || sl.kind === 'barrel_catwalk') { yTop = sl.y + 0.10; thick = 0.18; }
      const sp = TORUS_DRAW.quadSlabGeoSplit(sl.pts, thick, yTop);
      pushGeo(sl.mat, sp.top);
      pushGeo('ceilingSoffit', sp.bottom);
    }
    for (let j = 0; j < A4.stairs.length; j++) {
      const st = A4.stairs[j];
      if (st.level === lv && st.render !== false) pushGeo(st.mat, TORUS_DRAW.stairFlightGeo(st.a, st.b, st.w));
    }
    for (let k = 0; k < A4.walls.length; k++) {
      const w = A4.walls[k];
      if (w.level !== lv) continue;
      m4.makeRotationY(w.ry).setPosition(w.x, w.y + 0.5 * w.h, w.z);
      pushGeo(w.mat, TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(w.w, w.h, w.d), m4, false, 4.5));
    }
    Object.keys(byMat).forEach(function (mk) {
      const mg = TORUS_DRAW.mergeGeoList(byMat[mk]);
      if (!mg) return;
      const mat = TORUS_DRAW.MATS[mk] || TORUS_DRAW.MATS.ancientStone;
      lvGrp.add(new THREE.Mesh(mg, mat));
    });
    if (lvGrp.children.length > 0) root.add(lvGrp);
  }

  function addArcMesh(list, mat, name) {
    if (!list.length) return;
    const m = new THREE.Mesh(TORUS_DRAW.mergeGeoList(list), mat);
    m.name = name;
    root.add(m);
  }
  addArcMesh(steelGeos, TORUS_DRAW.MATS.tankSteel, 'torus_wheel_trellis_and_cranes');
  addArcMesh(rustGeos, TORUS_DRAW.MATS.rustPlate, 'torus_wheel_winch_cabins');
  addArcMesh(timberGeos, TORUS_DRAW.MATS.timber, 'torus_wheel_timber_decks');
  addArcMesh(loamGeos, TORUS_DRAW.MATS.terraceLoam, 'torus_wheel_rim_root_troughs');
  addArcMesh(bronzeGeos, TORUS_DRAW.MATS.bronze, 'torus_wheel_winch_drums');
  addArcMesh(verdGeos, TORUS_DRAW.MATS.verdigris, 'torus_wheel_roofs_and_pipes');
  addArcMesh(stoneGeos, TORUS_DRAW.MATS.ancientStone, 'torus_foot_portal_pylons');
  addArcMesh(glowGeos, TORUS_DRAW.MATS.warmGlow, 'torus_arcology_lanterns');

  root.userData.vineCurtains = vineAnchors.length;
  root.userData.vineAnchors = vineAnchors;
  root.userData.harvesterGondolas = nGondolas;
  root.userData.gondolaSpecs = gondolaSpecs;
  root.userData.updateGondolas = updateGondolas;
  root.userData.dressShellsBarrel = dressShellsBarrel;
  root.userData.dressShellsWheel = dressShellsWheel;
  root.userData.dressShellsCrown = dressShellsCrown;
  return root;
})();
