// ================================================================= DRUM — 8bf: Ruined Drum Arcology & Subdivided 15-Level Interior ([draw])
// Binds packed KMAT PBR textures onto DRUM_DRAW.MATS, registers KTAGS, builds kits/ancients buildDrum(holder, 0, 0, 1),
// surgically prunes floating court/podium scraps, seats all 12 concrete buttress fins onto grounded foundation shoes,
// and builds all 15 subdivided interior levels (y = 0..66 m): slabs, 4 Fin stairs, 1,500+ apartment/workshop rooms, and Central Hoist Pit.

if (DRUM_DRAW && typeof DRUM_DRAW.bindPbrMats === 'function') {
  DRUM_DRAW.bindPbrMats();
}

const DRUM_TAGS = KTAGS.create({ build: 'drum' });
KTAGS.page = DRUM_TAGS;
DRUM.registerTags(DRUM_PLAN, DRUM_TAGS);

const DRUM_ARCOLOGY_GROUP = (function buildDrumArcology3D() {
  const root = new THREE.Group();
  root.name = 'drum_arcology_root';
  scene.add(root);

  // 1. Run kits/ancients 8af-drum.js in ruined state (d=1) and bake instanced kit pieces into holder
  const holder = new THREE.Group();
  holder.name = 'ancients_drum_megastructure';
  KIT.order.forEach(function (n) { if (KIT.items[n]) KIT.items[n].length = 0; });
  KOFF = [0, 0, 0];
  KXF = null;
  TSTAT.cur = 'arcology/drum';
  try {
    buildDrum(holder, 0, 0, 1);
    // Strip kits/ancients figures AND blobby placeholder vegetation (replaced by socketed biomes/swbay flora in 8bl!)
    ['figB', 'figH', 'trunk', 'leafCard', 'moss', 'vine'].forEach(function (n) {
      if (KIT.items[n]) KIT.items[n].length = 0;
    });
    KOFF = [0, 0, 0];
    KXF = null;
    kbake(holder);
  } catch (e) {
    if (typeof ancReportErr === 'function') ancReportErr('buildDrum: ' + (e.stack == null ? e : e.stack));
  }
  TSTAT.cur = null;
  KIT.order.forEach(function (n) { if (KIT.items[n]) KIT.items[n].length = 0; });

  // Surgically prune floating podium bands, court skirts & sliced shards while preserving the 12 structural fins, core, upper tiers & Quarry blocks
  DRUM_DRAW.pruneArcologySkirt(holder, 218.0, 85.0);
  root.add(holder);

  // Extract world-space shell BufferGeometries (split into Low/Mid + Quarry vs High Crown so SWBAY.dress populates lower visible tiers richly!)
  holder.updateMatrixWorld(true);
  const dressShellsLow = [], dressShellsHigh = [];
  holder.traverse(function (o) {
    if (!o.isMesh || o.isInstancedMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
    const isDeck = (typeof MAT !== 'undefined' && (o.material === MAT.drDeckR || o.material === MAT.drDeck));
    const isSoffit = (typeof MAT !== 'undefined' && (o.material === MAT.drShadeR || o.material === MAT.drShade));
    const isConc = (typeof MAT !== 'undefined' && (o.material === MAT.drConcR || o.material === MAT.drConc));
    if (!isDeck && !isSoffit && !isConc) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    const p = g.attributes.position;
    const lowP = [], highP = [];
    for (let t = 0; t < p.count; t += 3) {
      const cy = (p.getY(t) + p.getY(t + 1) + p.getY(t + 2)) / 3;
      const cx = (p.getX(t) + p.getX(t + 1) + p.getX(t + 2)) / 3;
      const cz = (p.getZ(t) + p.getZ(t + 1) + p.getZ(t + 2)) / 3;
      const rad = Math.hypot(cx, cz);
      const onQuarry = (rad >= 242.0 && rad <= 495.0 && cy >= 0.4);
      const onOuterFin = (rad >= 109.5 && cy >= 14.0 && cy <= 66.2);
      if (onQuarry || onOuterFin || (cy >= 66.2 && cy <= 155.0)) {
        for (let k = 0; k < 3; k++) lowP.push(p.getX(t + k), p.getY(t + k), p.getZ(t + k));
      } else if (cy > 155.0) {
        for (let k = 0; k < 3; k++) highP.push(p.getX(t + k), p.getY(t + k), p.getZ(t + k));
      }
    }
    if (lowP.length >= 9) {
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.Float32BufferAttribute(lowP, 3));
      sg.computeVertexNormals();
      dressShellsLow.push(sg);
    }
    if (highP.length >= 9) {
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.Float32BufferAttribute(highP, 3));
      sg.computeVertexNormals();
      dressShellsHigh.push(sg);
    }
  });
  root.userData.dressShells = dressShellsLow.concat(dressShellsHigh);
  root.userData.dressShellsLow = dressShellsLow;
  root.userData.dressShellsHigh = dressShellsHigh;

  // 2. Build Grounded Base Foundations + All 15 Subdivided Interior Levels from DRUM_STAGE4.arcology
  const arc = DRUM_PLAN.arcology;
  const arc4 = DRUM_STAGE4.arcology;
  const deg = Math.PI / 180;
  const buckets = {
    ancientStone: [], ancientDark: [], basalt: [], ashStone: [], porphyry: [],
    gold: [], bronze: [], rustPlate: [], tankSteel: [], verdigris: [],
    timber: [], canvas: [], boursePave: [], floorTile: [], ceilingSoffit: [],
    roofDeck: [], cityEarth: [], warmGlow: [], drBlkR: [], drConcR: []
  };
  function pushBucket(matName, geo) {
    if (!geo) return;
    if (matName === 'drBlkR && false') return;
    if (matName === 'drBlkR' && geo.attributes && geo.attributes.uv) {
      const u = geo.attributes.uv.array;
      for (let i = 0; i < u.length; i++) u[i] /= 3.0;
      geo.attributes.uv.needsUpdate = true;
    }
    const b = buckets[matName] || buckets.ashStone;
    b.push(geo);
  }

  for (let i = 0; i < arc4.slabs.length; i++) {
    const sl = arc4.slabs[i];
    const soffitOut = sl.level >= 2 ? buckets.ceilingSoffit : null;
    pushBucket(sl.mat, DRUM_DRAW.slabPolyGeo(sl.pts, sl.thick, soffitOut));
  }

  for (let j = 0; j < arc4.stairs.length; j++) {
    const st = arc4.stairs[j];
    pushBucket(st.mat, DRUM_DRAW.stripRampGeo(st.a, st.b, st.w));
  }

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eu = new THREE.Euler(0, 0, 0, 'YXZ');
  const v3 = new THREE.Vector3();
  const s1 = new THREE.Vector3(1, 1, 1);
  function addBox(matName, x, y, z, w, h, d, ry) {
    eu.set(0, ry == null ? 0 : ry, 0);
    q.setFromEuler(eu);
    v3.set(x, y + 0.5 * h, z);
    m4.compose(v3, q, s1);
    pushBucket(matName, DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(w, h, d), m4));
  }
  function addCyl(matName, x, y, z, rt, rb, h, segs) {
    m4.identity().setPosition(x, y + 0.5 * h, z);
    pushBucket(matName, DRUM_DRAW.bakeGeo(new THREE.CylinderGeometry(rt, rb, h, segs == null ? 12 : segs), m4));
  }

  // 2c. Grounded Ancient Fin-Toe Foundation Shoes + Socketed Fin-Spine Terrace Planters (r = 84..201 m)
  const planterSockets = [];
  for (let f = 0; f < 12; f++) {
    const fDeg = 20.0 + f * 30.0;
    const fa = fDeg * deg;
    const ca = Math.cos(fa), sa = Math.sin(fa);
    const fYaw = -fa;
    if (f === 0) {
      addBox('drConcR', 142.0 * ca, -1.1, 142.0 * sa, 96.0, 1.35, 9.6, fYaw);
      continue;
    }
    addBox('drConcR', 142.5 * ca, -1.1, 142.5 * sa, 118.0, 1.55, 9.4, fYaw);
    addBox('ancientDark', 191.0 * ca, -1.1, 191.0 * sa, 21.0, 2.55, 11.2, fYaw);
    addBox('ancientStone', 198.5 * ca, -1.1, 198.5 * sa, 8.5, 1.65, 12.6, fYaw);
    // Masonry Fin-Toe Terrace Planter Socket right atop the stepped outer fin bolster (r = 186m, y = 1.45m)!
    const fx = 186.5 * ca, fz = 186.5 * sa;
    addBox('porphyry', fx, 1.40, fz, 5.6, 0.95, 6.8, fYaw);
    addBox('cityEarth', fx, 2.15, fz, 4.9, 0.22, 6.1, fYaw);
    const spList = ['treefern', 'splay', 'dragon', 'thorn'];
    planterSockets.push({ x: fx, y: 2.36, z: fz, kind: 'fin_bolster', species: spList[f % 4], scale: 0.74 });
  }

  // Grounded Portal Gatehouse Architraves, Corrugated Canopy Roofs & Forecourt Tree Planter Sockets
  for (let p = 0; p < arc.portals.length; p++) {
    const prt = arc.portals[p];
    const a = prt.deg * deg;
    const ca = Math.cos(a), sa = Math.sin(a);
    const yaw = -a + 0.5 * Math.PI;
    const gx = 108.4 * ca, gz = 108.4 * sa;
    for (let s = -1; s <= 1; s += 2) {
      const px = gx + s * 5.2 * (-sa), pz = gz + s * 5.2 * ca;
      addBox('ancientDark', px, -0.8, pz, 2.8, 9.6, 3.2, yaw);
      addBox('rustPlate', px + 1.4 * ca, -0.6, pz + 1.4 * sa, 1.8, 5.4, 1.2, yaw);
    }
    addBox('drConcR', gx + 0.8 * ca, 4.4, gz + 0.8 * sa, 13.6, 1.8, 3.4, yaw);
    addBox('roofDeck', gx + 1.1 * ca, 6.2, gz + 1.1 * sa, 14.4, 0.36, 4.2, yaw);
    addBox('porphyry', gx + 1.5 * ca, 6.56, gz + 1.5 * sa, 8.8, 1.5, 1.6, yaw);
    addBox('warmGlow', gx + 1.8 * ca, 4.22, gz + 1.8 * sa, 6.2, 0.24, 0.45, yaw);

    // Structural steel floor-spandrel bands across the r=108m Buttress-Bay facade every 3 storeys
    for (let slv = 3; slv <= 15; slv += 3) {
      const sy = slv * 4.4 - 0.36;
      addBox('tankSteel', 108.1 * ca, sy, 108.1 * sa, 51.0, 0.42, 0.9, yaw);
    }

    // Grounded masonry Tree Planter Sockets flanking outer Bourse Forecourt avenues (r = 212 m)
    if (p % 2 === 0) {
      for (let s = -1; s <= 1; s += 2) {
        const sx = 212.0 * ca + s * 17.5 * (-sa);
        const sz = 212.0 * sa + s * 17.5 * ca;
        addCyl('porphyry', sx, -0.4, sz, 3.4, 3.6, 1.05, 12);
        addCyl('cityEarth', sx, 0.45, sz, 2.95, 2.95, 0.24, 12);
        planterSockets.push({ x: sx, y: 0.68, z: sz, kind: 'forecourt', species: s < 0 ? 'dragon' : 'thorn', scale: 0.62 });
      }
    }
  }

  // 2d. All interior Ring Gallery walls, subdivided apartment/workshop partition walls, lintels & hoist-pit parapets
  for (let k = 0; k < arc4.walls.length; k++) {
    const w = arc4.walls[k];
    addBox(w.mat, w.x, w.y, w.z, w.w, w.h, w.d, w.ry);
  }

  // 2e. All built-in multi-apartment bunks, mattresses, tables, benches, stoves + ceiling flues, shop stalls, racks & room lights
  if (arc4.fixtures) {
    for (let f = 0; f < arc4.fixtures.length; f++) {
      const fx = arc4.fixtures[f];
      addBox(fx.mat, fx.x, fx.y, fx.z, fx.w, fx.h, fx.d, fx.ry);
    }
  }

  // 2f. Central Hoist Pit & Light Well (r = 18 m): 8 guide lattice columns grounded at y=-0.9m, crown gantry, counterweight & cargo cage
  for (let g = 0; g < 8; g++) {
    const ga = (g * 45 + 22.5) * deg;
    addBox('tankSteel', 17.5 * Math.cos(ga), -0.9, 17.5 * Math.sin(ga), 1.1, 69.4, 1.1, -ga);
  }
  addBox('tankSteel', 0, 67.6, 0, 38.0, 1.4, 2.2, 0.35);
  addBox('tankSteel', 0, 67.6, 0, 2.2, 1.4, 38.0, 0.35);
  // Cylindrical L1 Salvage Weighbridge Pit Floor (r = 17.92m < 18.0m core_wedge, yTop = -0.02m — ZERO coplanar overlap!)
  addCyl('floorTile', 0, -0.86, 0, 17.92, 17.92, 0.84, 24);
  addBox('rustPlate', 0, 0.04, 0, 12.0, 0.32, 12.0, 0);
  addBox('rustPlate', 0, 9.2, 0, 9.6, 0.5, 9.6, 0);
  addBox('roofDeck', 0, 12.6, 0, 9.8, 0.38, 9.8, 0);
  for (let cx = -1; cx <= 1; cx += 2) {
    for (let cz = -1; cz <= 1; cz += 2) {
      addBox('tankSteel', cx * 4.4, 9.5, cz * 4.4, 0.35, 3.2, 0.35, 0);
      addCyl('tankSteel', cx * 4.0, 12.8, cz * 4.0, 0.09, 0.09, 55.0, 6);
    }
  }
  addBox('basalt', -13.5, 22.0, 0, 2.6, 5.5, 3.8, 0);
  addCyl('tankSteel', -13.5, 27.5, -1.1, 0.08, 0.08, 40.2, 6);
  addCyl('tankSteel', -13.5, 27.5, 1.1, 0.08, 0.08, 40.2, 6);

  // 2g. Per-level Ring Gallery colonnade piers, corridor lamps, L4 Cisterns & L6 Memorial
  for (let lv = 1; lv <= arc.levelCount; lv++) {
    const y0 = (lv - 1) * arc.storeyH;
    for (let b = 0; b < arc.bays.length; b++) {
      const bay = arc.bays[b];
      if (bay.ruined) continue;
      const ba = bay.deg * deg;
      const yaw = -ba + 0.5 * Math.PI;
      addBox('ancientDark', 23.5 * Math.cos(ba), y0, 23.5 * Math.sin(ba), 0.95, 4.04, 0.95, yaw);
      addBox('warmGlow', 30.0 * Math.cos(ba), y0 + 3.90, 30.0 * Math.sin(ba), 3.4, 0.14, 0.42, yaw);
      addBox('warmGlow', 62.0 * Math.cos(ba), y0 + 3.90, 62.0 * Math.sin(ba), 3.2, 0.14, 0.38, yaw);
      addBox('warmGlow', 86.2 * Math.cos(ba), y0 + 3.90, 86.2 * Math.sin(ba), 4.2, 0.14, 0.42, yaw);
    }
    if (lv === 4) {
      for (let cb = 9; cb <= 10; cb++) {
        const ca = arc.bays[cb].deg * deg;
        addCyl('verdigris', 61.5 * Math.cos(ca - 0.12), y0, 61.5 * Math.sin(ca - 0.12), 3.4, 3.4, 3.95, 14);
        addCyl('tankSteel', 61.5 * Math.cos(ca + 0.12), y0, 61.5 * Math.sin(ca + 0.12), 3.4, 3.4, 3.95, 14);
      }
    }
    if (lv === 6) {
      const ma = arc.bays[6].deg * deg;
      addBox('ancientStone', 38.8 * Math.cos(ma + 0.14), y0, 38.8 * Math.sin(ma + 0.14), 5.6, 3.8, 0.55, -ma + 0.5 * Math.PI);
      addBox('porphyry', 38.4 * Math.cos(ma + 0.14), y0 + 1.1, 38.4 * Math.sin(ma + 0.14), 2.8, 2.0, 0.22, -ma + 0.5 * Math.PI);
    }
  }

  // 2h. L15 Sky-Terrace (y=66m) stair headhouses (with corrugated roofDeck roofs!), catch-basins, crane jibs & socketed Sky-Planters
  for (let k = 0; k < arc.stairs.length; k++) {
    const sa = arc.stairs[k].deg * deg;
    const hyaw = -sa + 0.5 * Math.PI;
    const hx = 31.0 * Math.cos(sa), hz = 31.0 * Math.sin(sa);
    addBox('rustPlate', hx, 66.02, hz, 9.2, 3.7, 10.5, hyaw);
    addBox('roofDeck', hx, 69.72, hz, 10.2, 0.44, 11.5, hyaw);
    addCyl('verdigris', 95.0 * Math.cos(sa + 0.18), 66.02, 95.0 * Math.sin(sa + 0.18), 7.5, 7.5, 2.4, 16);
    addBox('tankSteel', 136.0 * Math.cos(sa), 66.02, 136.0 * Math.sin(sa), 3.0, 8.5, 14.0, hyaw);
    addBox('roofDeck', 136.0 * Math.cos(sa), 74.52, 136.0 * Math.sin(sa), 3.6, 0.36, 14.8, hyaw);

    // Socketed stone Sky-Planters on L15 Sky-Terrace (y = 66.02 m) for SWBAY trees & shrubs!
    const pa1 = sa - 0.34, pa2 = sa + 0.42;
    const sx1 = 62.0 * Math.cos(pa1), sz1 = 62.0 * Math.sin(pa1);
    const sx2 = 118.0 * Math.cos(pa2), sz2 = 118.0 * Math.sin(pa2);
    addCyl('ancientDark', sx1, 66.02, sz1, 3.8, 4.1, 0.92, 12);
    addCyl('cityEarth', sx1, 66.74, sz1, 3.35, 3.35, 0.24, 12);
    planterSockets.push({ x: sx1, y: 66.96, z: sz1, kind: 'sky', species: k % 2 === 0 ? 'dragon' : 'cherry', scale: 0.72 });

    addCyl('ancientDark', sx2, 66.02, sz2, 4.2, 4.5, 0.96, 12);
    addCyl('cityEarth', sx2, 66.78, sz2, 3.75, 3.75, 0.24, 12);
    planterSockets.push({ x: sx2, y: 67.00, z: sz2, kind: 'sky', species: k % 2 === 0 ? 'treefern' : 'thorn', scale: 0.78 });
  }
  root.userData.planterSockets = planterSockets;

  Object.keys(buckets).forEach(function (matKey) {
    const list = buckets[matKey];
    if (!list.length) return;
    let mat = DRUM_DRAW.MATS[matKey];
    if (!mat && typeof MAT !== 'undefined' && MAT) {
      if (matKey === 'drBlkR') mat = MAT.drBlkR || MAT.drConcR;
      else if (matKey === 'drConcR') mat = MAT.drConcR || DRUM_DRAW.MATS.ancientDark;
    }
    if (!mat) mat = DRUM_DRAW.MATS.ashStone;
    const mesh = new THREE.Mesh(DRUM_DRAW.mergeGeoList(list), mat);
    mesh.name = 'drum_arc_' + matKey;
    root.add(mesh);
  });

  return root;
})();
