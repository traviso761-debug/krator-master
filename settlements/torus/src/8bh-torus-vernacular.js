// ================================================================= TORUS — 8bh: Terrace, Wheel-Town, Crown & Working-Pod Kit Buildings ([draw])
// Places 100% PBR-textured kit buildings across all four inhabited Rinkvolk/Vothic zones with grounded fieldstone lotPlinth pads:
//   1. 10 Stepped Terraces (+44m -> +1m) & SE Scrap Voth Extension ("Canton-on-the-Rise")
//   2. Forest Ring Wheel Town (WY = 300 m circular street) & Stepped Botanical Crown (+600, +632, +664 m) (`TORUS_PLAN.skyBuildings`)
//   3. Working Soleri Pod Farms & Orchards in the 6 km Hinterland (`TORUS_PLAN.hinterland.farmOutbuildings`).

const TORUS_PLACED = {
  total: 0,
  terraceTotal: 0,
  skyTotal: 0,
  farmOutTotal: 0,
  swa: 0,
  postApoc: 0,
  vothScrap: 0,
  vothExtScrap: 0,
  missing: [],
  ms: 0
};

const TORUS_VERNACULAR_GROUP = (function buildTorusVernacular3D() {
  const t0 = performance.now();
  const root = new THREE.Group();
  root.name = 'torus_vernacular_root';
  scene.add(root);

  const paSites = [];
  const vsPlacements = [];
  const vsProtos = new Map();
  const plinthGeos = [];
  const m4 = new THREE.Matrix4();

  function crownSoilTop(b) {
    if (b.tier !== 'stepped_crown') return b.y;
    if (b.crownDeck === 'terrace' || b.crownDeck === 'rim' || b.y < 610) return b.y; // Flat concrete terrace treads & rim gallery
    const ringIdx = b.y < 648 ? 1 : 2;
    const fVal = (typeof fbm === 'function')
      ? fbm(b.x * 0.014, b.z * 0.014, 9485 + ringIdx, 2)
      : KRAND.fbm(b.x * 0.014, 0.2, b.z * 0.014, 2, 9485 + ringIdx);
    return b.y + 1.1 + 2.0 * fVal;
  }

  function lotSurfaceAndBottom(b, groupKind) {
    if (groupKind === 'sky') {
      const topSoil = crownSoilTop(b);
      const padTop = topSoil + 0.16;
      const isSoilRing = b.tier === 'stepped_crown' && b.crownDeck === 'soil';
      const padBot = isSoilRing ? (b.y - 0.2) : (topSoil - 0.18);
      return { padTop: padTop, padBot: padBot };
    }
    if (groupKind === 'farm') {
      const c = Math.cos(b.ry), s = Math.sin(b.ry);
      const hw = 0.5 * b.w, hd = 0.5 * b.d;
      let yMin = b.y, yMax = b.y;
      for (let sx = -1; sx <= 1; sx += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          const cx = b.x + sx * hw * c + sz * hd * s;
          const cz = b.z - sx * hw * s + sz * hd * c;
          const gy = TORUS.groundAt(cx, cz);
          if (gy < yMin) yMin = gy;
          if (gy > yMax) yMax = gy;
        }
      }
      return { padTop: yMax + 0.16, padBot: yMin - 0.65 };
    }
    // Terrace & Voth Extension buildings sit on flat contour terrace benches
    return { padTop: b.y + 0.16, padBot: b.y - 0.45 };
  }

  function enqueueBuilding(b, seedIdx, groupKind) {
    const hSeed = KRAND.hash(TORUS_SEED, seedIdx, 23);
    const vIdx = hSeed % 3;
    const surf = lotSurfaceAndBottom(b, groupKind);
    const padH = Math.max(0.24, surf.padTop - surf.padBot);
    m4.makeRotationY(b.ry).setPosition(b.x, surf.padBot + 0.5 * padH, b.z);
    plinthGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(b.w + 0.7, padH, b.d + 0.7), m4, false, 3.5));

    const placeY = +(surf.padTop + 0.01).toFixed(3);
    let placedOk = false;

    if (b.kit === 'sw-arcology' || b.kit === 'post-apoc') {
      paSites.push({
        key: b.key,
        x: b.x,
        z: b.z,
        ry: b.ry,
        o: { v: vIdx, y: placeY, culture: 'rinkvolk' }
      });
      if (b.kit === 'sw-arcology') TORUS_PLACED.swa++;
      else TORUS_PLACED.postApoc++;
      placedOk = true;
    } else if (b.kit === 'voth-scrap') {
      if (typeof KratorVothScrap !== 'undefined' && KratorVothScrap.get(b.key)) {
        const asset = KratorVothScrap.get(b.key);
        const nVar = asset.variants == null ? 1 : asset.variants;
        const vv = vIdx % nVar;
        const pKey = b.key + '|' + vv;
        if (!vsProtos.has(pKey)) {
          const grp = KratorVothScrap.buildProto(b.key, vv, 8200 + vsProtos.size * 43);
          if (grp) vsProtos.set(pKey, TORUS_DRAW.extractProtoParts(grp));
        }
        if (vsProtos.has(pKey)) {
          vsPlacements.push({ protoKey: pKey, x: b.x, y: placeY, z: b.z, ry: b.ry, scale: 1.0 });
          TORUS_PLACED.vothScrap++;
          if (b.district === 'scrap_voth_extension') TORUS_PLACED.vothExtScrap++;
          placedOk = true;
        } else {
          TORUS_PLACED.missing.push(b.id + ':' + b.key);
        }
      } else {
        TORUS_PLACED.missing.push(b.id + ':' + b.key);
      }
    }

    if (placedOk) {
      TORUS_PLACED.total++;
      if (groupKind === 'terrace') TORUS_PLACED.terraceTotal++;
      else if (groupKind === 'sky') TORUS_PLACED.skyTotal++;
      else if (groupKind === 'farm') TORUS_PLACED.farmOutTotal++;
    }
  }

  for (let i = 0; i < TORUS_PLAN.buildings.length; i++) {
    enqueueBuilding(TORUS_PLAN.buildings[i], i, 'terrace');
  }
  const skyList = TORUS_PLAN.skyBuildings || [];
  for (let s = 0; s < skyList.length; s++) {
    enqueueBuilding(skyList[s], 10000 + s, 'sky');
  }
  const farmList = (TORUS_PLAN.hinterland && TORUS_PLAN.hinterland.farmOutbuildings) ? TORUS_PLAN.hinterland.farmOutbuildings : [];
  for (let f = 0; f < farmList.length; f++) {
    enqueueBuilding(farmList[f], 20000 + f, 'farm');
  }

  // Grounded Cyclopean fieldstone lot plinths
  if (plinthGeos.length > 0) {
    const pm = new THREE.Mesh(TORUS_DRAW.mergeGeoList(plinthGeos), TORUS_DRAW.MATS.lotPlinth);
    pm.name = 'torus_building_lot_plinths';
    root.add(pm);
  }

  // 1. Merged SW Arcology + Post-Apoc build in Rinkvolk golden-harvest culture
  if (paSites.length > 0 && typeof KratorPostApoc !== 'undefined') {
    const keepTags = KTAGS.page;
    if (typeof ancReportErr === 'function') KratorPostApoc.setError(ancReportErr);
    const wantInt = (typeof location !== 'undefined' && /[?&]interiors=1\b/.test(location.search));
    KratorPostApoc.setInteriors(!!wantInt);
    try {
      const paGroup = KratorPostApoc.build(paSites, { culture: 'rinkvolk' });
      paGroup.name = 'torus_rinkvolk_swa_and_pa';
      root.add(paGroup);
    } catch (e) {
      if (typeof ancReportErr === 'function') ancReportErr('KratorPostApoc Torus: ' + (e.stack == null ? e : e.stack));
    }
    KTAGS.page = keepTags;
  }

  // 2. Merged Scrap Voth buildings (SE Vothic Extension, Crown shrine & diplomatic/customs buildings)
  if (vsPlacements.length > 0) {
    TORUS_DRAW.mergePlacedPrototypes(vsPlacements, vsProtos, root, 'torus_voth_scrap');
  }

  // 3. Guarantee 100% textured materials & UVs across every kit mesh (including multi-material arrays)
  const fm = TORUS_DRAW.getFurnDetailMaps();
  root.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    if (!o.geometry.attributes.uv && o.geometry.attributes.position) {
      if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
      TORUS_DRAW.addTriplanarUvs(o.geometry, 3.0);
    }
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (let m = 0; m < mats.length; m++) {
      const mat = mats[m];
      if (!mat) continue;
      mat.side = THREE.DoubleSide;
      if (!mat.map && !mat.transparent) {
        mat.map = fm.map;
        if (mat.roughness !== undefined && !mat.roughnessMap) mat.roughnessMap = fm.roughnessMap;
        mat.needsUpdate = true;
      }
    }
  });

  TORUS_PLACED.ms = Math.round(performance.now() - t0);
  return root;
})();
