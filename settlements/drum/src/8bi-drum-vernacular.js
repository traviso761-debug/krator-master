// ================================================================= DRUM — 8bi: Concentric Vernacular Rings & Regional Scrap-Market ([draw])
// Places all 2,562 concentric ring buildings:
//   - 1/3 SW Arcology (swa-*) + 1/3 Post-Apoc via single merged KratorPostApoc.build(sites, { culture: 'vinvolk' })
//   - 1/3 Scrap Voth (voth_scrap_*) via merged KratorVothScrap prototype batching
//   - Regional Scrap-Market weigh-gantries, salvage cranes, and ENE quarry shearlegs.

const DRUM_PLACED = {
  total: 0,
  swa: 0,
  postApoc: 0,
  vothScrap: 0,
  missing: [],
  ms: 0
};

const DRUM_VERNACULAR_GROUP = (function buildDrumVernacular3D() {
  const t0 = performance.now();
  const root = new THREE.Group();
  root.name = 'drum_vernacular_root';
  scene.add(root);

  const paSites = [];
  const vsPlacements = [];
  const vsProtos = new Map();
  const plinthGeos = [];
  const m4p = new THREE.Matrix4();

  for (let i = 0; i < DRUM_PLAN.buildings.length; i++) {
    const b = DRUM_PLAN.buildings[i];
    const hSeed = KRAND.hash(DRUM_SEED, i, 17);
    const vIdx = hSeed % 3;
    // Stratified dressed concrete/stone lot plinth: embedded at y=-0.22m, top at +0.052..+0.076m (strictly above -0.065m cityEarth & +0.018m streets!)
    // Kit building base sits +0.016m above its own plinth top so kit yard aprons NEVER Z-fight with the plinth or adjacent lots!
    const baseGround = b.y == null ? 0 : b.y;
    const plinthTop = baseGround + 0.052 + (i % 7) * 0.004;
    const plinthH = plinthTop - (baseGround - 0.22);
    const kitY = plinthTop + 0.016 + ((i >> 3) % 5) * 0.002;
    const pw = (b.w == null ? 10 : b.w) + 0.48;
    const pd = (b.d == null ? 10 : b.d) + 0.48;
    m4p.makeRotationY(b.ry == null ? 0 : b.ry).setPosition(b.x, (baseGround - 0.22) + 0.5 * plinthH, b.z);
    plinthGeos.push(DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(pw, plinthH, pd), m4p));

    if (b.kit === 'sw-arcology' || b.kit === 'post-apoc') {
      const siteCulture = (b.district === 'vothic_sector') ? 'voth-vassal' : 'vinvolk';
      paSites.push({
        key: b.key,
        x: b.x,
        z: b.z,
        ry: b.ry,
        o: { v: vIdx, y: kitY, culture: siteCulture }
      });
      if (b.kit === 'sw-arcology') DRUM_PLACED.swa++;
      else DRUM_PLACED.postApoc++;
      DRUM_PLACED.total++;
    } else if (b.kit === 'voth-scrap') {
      if (typeof KratorVothScrap !== 'undefined' && KratorVothScrap.get(b.key)) {
        const asset = KratorVothScrap.get(b.key);
        const nVar = asset.variants == null ? 1 : asset.variants;
        const vv = vIdx % nVar;
        const pKey = b.key + '|' + vv;
        if (!vsProtos.has(pKey)) {
          const grp = KratorVothScrap.buildProto(b.key, vv, 7100 + vsProtos.size * 41);
          if (grp) vsProtos.set(pKey, DRUM_DRAW.extractProtoParts(grp));
        }
        if (vsProtos.has(pKey)) {
          vsPlacements.push({ protoKey: pKey, x: b.x, y: kitY, z: b.z, ry: b.ry, scale: 1.0 });
          DRUM_PLACED.vothScrap++;
          DRUM_PLACED.total++;
        } else {
          DRUM_PLACED.missing.push(b.id + ':' + b.key);
        }
      } else {
        DRUM_PLACED.missing.push(b.id + ':' + b.key);
      }
    }
  }

  if (plinthGeos.length > 0) {
    const plinthMesh = new THREE.Mesh(DRUM_DRAW.mergeGeoList(plinthGeos), DRUM_DRAW.MATS.lotPlinth);
    plinthMesh.name = 'drum_lot_plinths';
    plinthMesh.userData.probeSkip = true;
    root.add(plinthMesh);
  }

  // 1. Build all SW Arcology + Post-Apoc buildings in one merged KratorPostApoc pass
  if (paSites.length > 0 && typeof KratorPostApoc !== 'undefined') {
    const keepTags = KTAGS.page;
    if (typeof ancReportErr === 'function') KratorPostApoc.setError(ancReportErr);
    const wantInt = (typeof location !== 'undefined' && /[?&]interiors=1\b/.test(location.search));
    KratorPostApoc.setInteriors(!!wantInt);
    try {
      const paGroup = KratorPostApoc.build(paSites, { culture: 'vinvolk' });
      paGroup.name = 'drum_pa_and_swa_merged';
      root.add(paGroup);
    } catch (e) {
      if (typeof ancReportErr === 'function') ancReportErr('KratorPostApoc: ' + (e.stack == null ? e : e.stack));
    }
    KTAGS.page = keepTags;
  }

  // 2. Build all Scrap Voth buildings via merged prototype batching
  if (vsPlacements.length > 0) {
    DRUM_DRAW.mergePlacedPrototypes(vsPlacements, vsProtos, root, 'drum_voth_scrap');
  }

  // Ensure every vernacular/kit material (including multi-material KratorPostApoc arrays!) has tactile PBR surface relief!
  const fm = DRUM_DRAW.getFurnDetailMaps();
  root.traverse(function (o) {
    if (!o.isMesh || !o.material || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    let needUv = false;
    for (let mi = 0; mi < mats.length; mi++) {
      if (mats[mi] && !mats[mi].map && !(mats[mi].transparent && mats[mi].opacity < 0.9)) needUv = true;
    }
    if (!needUv) return;
    if (!o.geometry.attributes.uv) {
      const p = o.geometry.attributes.position, n = o.geometry.attributes.normal;
      const uv = new Float32Array(p.count * 2);
      for (let vi = 0; vi < p.count; vi++) {
        const ax = n ? Math.abs(n.getX(vi)) : 0, ay = n ? Math.abs(n.getY(vi)) : 1, az = n ? Math.abs(n.getZ(vi)) : 0;
        if (ay >= ax && ay >= az) { uv[vi * 2] = p.getX(vi) / 3.5; uv[vi * 2 + 1] = p.getZ(vi) / 3.5; }
        else if (ax >= az) { uv[vi * 2] = p.getZ(vi) / 3.5; uv[vi * 2 + 1] = p.getY(vi) / 3.5; }
        else { uv[vi * 2] = p.getX(vi) / 3.5; uv[vi * 2 + 1] = p.getY(vi) / 3.5; }
      }
      o.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    }
    const newMats = mats.map(function (m) {
      if (!m || m.map || m.isMeshBasicMaterial || (m.transparent && m.opacity < 0.9)) return m;
      const cm = m.clone();
      cm.map = fm.map;
      cm.roughnessMap = fm.roughnessMap;
      cm.bumpMap = fm.roughnessMap;
      cm.bumpScale = 0.018;
      if (typeof MAT !== 'undefined' && MAT && MAT.concrete && MAT.concrete.normalMap) {
        cm.normalMap = MAT.concrete.normalMap;
        cm.normalScale = new THREE.Vector2(0.42, 0.42);
      }
      cm.needsUpdate = true;
      return cm;
    });
    o.material = Array.isArray(o.material) ? newMats : newMats[0];
  });

  // 3. Regional Scrap-Market weigh-gantries, salvage cranes & ENE Quarry shearlegs
  const deg = Math.PI / 180;
  const rng = KRAND.stream(KRAND.child(DRUM_SEED, 'drum_market_props'));
  const steelGeos = [], rustGeos = [], timberGeos = [], roofGeos = [];
  const m4 = new THREE.Matrix4();

  // Scrap-Market overhead A-frame gantries along radial market avenues (deg 60..84)
  const marketRadii = [252, 306, 360, 434, 472];
  for (let rIdx = 0; rIdx < marketRadii.length; rIdx++) {
    const rr = marketRadii[rIdx];
    for (let md = 58; md <= 86; md += 14) {
      const ma = md * deg;
      const gx = rr * Math.cos(ma), gz = rr * Math.sin(ma);
      if (DRUM_PLAN.landmarks.some(function (lm) { return lm.r > 0 && Math.hypot(lm.x - gx, lm.z - gz) < 28; })) continue;
      const yaw = -ma + 0.5 * Math.PI;
      for (let s = -1; s <= 1; s += 2) {
        const px = gx + s * 4.5 * (-Math.sin(ma)), pz = gz + s * 4.5 * Math.cos(ma);
        m4.makeRotationY(yaw).setPosition(px, 4.0, pz);
        steelGeos.push(DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(0.75, 8.8, 0.75), m4));
        m4.makeRotationY(yaw).setPosition(px, 0.1, pz);
        rustGeos.push(DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(1.45, 0.65, 1.45), m4));
      }
      m4.makeRotationY(yaw).setPosition(gx, 8.2, gz);
      rustGeos.push(DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(10.4, 0.85, 0.95), m4));
      m4.makeRotationY(yaw).setPosition(gx, 8.78, gz);
      roofGeos.push(DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(11.2, 0.28, 2.2), m4));
    }
  }

  // ENE Quarry (deg 5..35, r = 240..490) fallen Ancient slab piles & salvage shearleg cranes
  for (let q = 0; q < 26; q++) {
    const qr = rng.range(236, 495);
    const qd = rng.range(-6, 45);
    const qa = qd * deg;
    const qx = qr * Math.cos(qa), qz = qr * Math.sin(qa);
    const bh = rng.range(1.6, 3.8);
    m4.makeRotationY(rng.range(0, Math.PI * 2)).setPosition(qx, 0.5 * bh - 0.25, qz);
    rustGeos.push(DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(rng.range(4, 11), bh, rng.range(3, 8)), m4));
    if (q % 5 === 0) {
      m4.makeRotationY(-qa).setPosition(qx, 6.2, qz);
      timberGeos.push(DRUM_DRAW.bakeGeo(new THREE.CylinderGeometry(0.45, 0.68, 13.4, 8), m4));
    }
  }

  if (steelGeos.length) root.add(new THREE.Mesh(DRUM_DRAW.mergeGeoList(steelGeos), DRUM_DRAW.MATS.tankSteel));
  if (rustGeos.length) root.add(new THREE.Mesh(DRUM_DRAW.mergeGeoList(rustGeos), DRUM_DRAW.MATS.rustPlate));
  if (timberGeos.length) root.add(new THREE.Mesh(DRUM_DRAW.mergeGeoList(timberGeos), DRUM_DRAW.MATS.timber));
  if (roofGeos.length) root.add(new THREE.Mesh(DRUM_DRAW.mergeGeoList(roofGeos), DRUM_DRAW.MATS.roofDeck));

  DRUM_PLACED.ms = Math.round(performance.now() - t0);
  return root;
})();
