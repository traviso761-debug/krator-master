// ================================================================= ARCODIGA — Terrain, Arcodiga (-95 m + KRUINS), KCITY.hostMultikit, KROOMLIGHT & CROOK Flora [web]
const ADG_WORLD = (function(){
 const t0 = performance.now();
 const useProc = PQ.get('mat') === 'proc';
 if (useProc) KMAT.mode = 'proc';

 /* 1. Stage 5 KMAT_M1 Settlement Library Materials + M2 km1RoughAA Specular Anti-Aliasing (< 13 samplers) */
 function makeSlotMat(slot, fallbackHex, rough, metal){
  const m = new THREE.MeshStandardMaterial({
   color: fallbackHex,
   roughness: rough == null ? 0.84 : rough,
   metalness: metal == null ? 0.0 : metal,
   vertexColors: false
  });
  if (!useProc && typeof KMAT !== 'undefined' && KMAT.mode === 'lib' && KMAT.packed && KMAT.textures) {
   const L = KMAT.packed('arcodiga', slot);
   if (L) {
    const tx = KMAT.textures(L, { aniso: 8 });
    if (tx && tx.map) {
     tx.map.wrapS = tx.map.wrapT = THREE.RepeatWrapping;
     m.map = tx.map;
     m.color.setHex(0xffffff);
     if (tx.normalMap) {
      tx.normalMap.wrapS = tx.normalMap.wrapT = THREE.RepeatWrapping;
      m.normalMap = tx.normalMap;
     }
     if (tx.roughnessMap) {
      tx.roughnessMap.wrapS = tx.roughnessMap.wrapT = THREE.RepeatWrapping;
      m.roughnessMap = tx.roughnessMap;
     }
    }
   }
  }
  const mv = ADG_MIPVAR.forFamily(slot);
  if (mv && typeof KMAT_M1 !== 'undefined' && KMAT_M1.patch) {
   KMAT_M1.patch(m, { mipVariance: mv, roughStrength: 1.0 });
  }
  return m;
 }

 const MATS = {
  plinthColumnar:    makeSlotMat('plinth_columnar',    0x32363d, 0.78, 0.04),
  plinthBasalt:      makeSlotMat('plinth_basalt',      0x2c3036, 0.80, 0.04),
  nephriteSawn:      makeSlotMat('nephrite_sawn',      0x3d7c60, 0.26, 0.08),
  bronzeLintel:      makeSlotMat('bronze_lintel',      0x886b42, 0.36, 0.72),
  ironGirder:        makeSlotMat('iron_girder',        0x484e56, 0.42, 0.82),
  cypressTimber:     makeSlotMat('cypress_timber',     0x6e503b, 0.82, 0.0),
  cobblePlaza:       makeSlotMat('cobble_plaza',       0x646662, 0.86, 0.0),
  whaleboneBleached: makeSlotMat('whalebone_bleached', 0xd8d2c4, 0.68, 0.0)
 };

 /* Patch HKK & ETK materials with Stage 5 KMAT_M1 M2 km1RoughAA */
 if (typeof KMAT_M1 !== 'undefined' && KMAT_M1.patch) {
  if (typeof ETK !== 'undefined' && ETK.MAT) {
   ['celadon', 'stone', 'bronze'].forEach(function(k){
    if (ETK.MAT[k]) KMAT_M1.patch(ETK.MAT[k], { mipVariance: ADG_MIPVAR.forFamily(k), roughStrength: 1.0 });
   });
  }
  if (typeof HKK !== 'undefined' && HKK.MAT) {
   if (HKK.MAT.jade) KMAT_M1.patch(HKK.MAT.jade, { mipVariance: ADG_MIPVAR.forFamily('nephrite_sawn'), roughStrength: 1.0 });
   if (HKK.MAT.basalt) KMAT_M1.patch(HKK.MAT.basalt, { mipVariance: ADG_MIPVAR.forFamily('plinth_basalt'), roughStrength: 1.0 });
  }
 }

 if (typeof BIO !== 'undefined' && BIO.tagReg) BIO.tagReg();
 if (!KTAGS.page) KTAGS.page = KTAGS.create({ build: 'arcodiga' });

 /* 2. Build 1:1 Kopa-North Caldera & Gorge-Throat Ground Mesh + KDRAWN + KHORIZON + 16.5 km KFAR */
 const G_SEGS = 240;
 const G_SIZE = ADG_SR * 2;
 const groundGeo = new THREE.PlaneGeometry(G_SIZE, G_SIZE, G_SEGS, G_SEGS);
 groundGeo.rotateX(-Math.PI * 0.5);

 const gPos = groundGeo.attributes.position;
 const gUv = groundGeo.attributes.uv;
 const gCount = gPos.count;
 const gCol = new Float32Array(gCount * 3);
 const C_DEEP   = new THREE.Color(0x22343a).convertSRGBToLinear();
 const C_SPRAY  = new THREE.Color(0x40464e).convertSRGBToLinear();
 const C_FOREST = new THREE.Color(0x465e40).convertSRGBToLinear();
 const C_BRECC  = new THREE.Color(0x6e685e).convertSRGBToLinear();
 const C_COBBLE = new THREE.Color(0x6c6e6a).convertSRGBToLinear();
 const _vc = new THREE.Color();

 for (let i = 0; i < gCount; i++) {
  const x = gPos.getX(i), z = gPos.getZ(i);
  const y = terrainH(x, z);
  gPos.setY(i, y);
  gUv.setXY(i, x / 22.0, z / 22.0);

  const inTown = 1.0 - ADG_SITE.townBandMask(x, z);
  if (y < 1.5) {
   _vc.copy(C_DEEP).lerp(C_SPRAY, Math.max(0, Math.min(1, (y + 35.0) / 36.5)));
  } else if (y < 65.0) {
   /* < +65 m Megatsunami Columnar Basalt Spray-Bench */
   _vc.copy(C_SPRAY).lerp(C_BRECC, Math.max(0, Math.min(1, (y - 32.0) / 33.0)) * 0.45);
  } else {
   /* >= +65 m Crookshore Benihi & Sitka Cloudforest Collar */
   _vc.copy(C_FOREST).lerp(C_BRECC, Math.max(0, Math.min(1, (y - 185.0) / 65.0)) * 0.32);
  }
  if (inTown > 0.2 && y > 4.0) _vc.lerp(C_COBBLE, Math.min(1, inTown * 0.68));

  gCol[i * 3] = _vc.r;
  gCol[i * 3 + 1] = _vc.g;
  gCol[i * 3 + 2] = _vc.b;
 }
 groundGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3));
 groundGeo.computeVertexNormals();

 const GROUND_MAT = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  vertexColors: true,
  roughness: 0.88,
  metalness: 0.0
 });
 if (!useProc && typeof KMAT !== 'undefined' && KMAT.mode === 'lib' && KMAT.packed && KMAT.textures) {
  const Lg = KMAT.packed('crook', 'ground.forest') || KMAT.packed('arcodiga', 'plinth_basalt');
  if (Lg) {
   const gtx = KMAT.textures(Lg, { aniso: 8 });
   if (gtx && gtx.map) {
    gtx.map.wrapS = gtx.map.wrapT = THREE.RepeatWrapping;
    GROUND_MAT.map = gtx.map;
    if (gtx.normalMap) {
     gtx.normalMap.wrapS = gtx.normalMap.wrapT = THREE.RepeatWrapping;
     GROUND_MAT.normalMap = gtx.normalMap;
    }
    if (gtx.roughnessMap) {
     gtx.roughnessMap.wrapS = gtx.roughnessMap.wrapT = THREE.RepeatWrapping;
     GROUND_MAT.roughnessMap = gtx.roughnessMap;
    }
   }
  }
 }
 if (typeof KMAT_M1 !== 'undefined' && KMAT_M1.patch) {
  KMAT_M1.patch(GROUND_MAT, { mipVariance: ADG_MIPVAR.forFamily('plinth_basalt'), roughStrength: 1.0 });
 }

 const GROUND = new THREE.Mesh(groundGeo, GROUND_MAT);
 GROUND.name = 'adg_kopa_north_ground';
 GROUND.receiveShadow = true;
 scene.add(GROUND);
 GROUND.updateMatrixWorld(true);
 if (typeof KDRAWN !== 'undefined' && KDRAWN.add) KDRAWN.add(KDRAWN.fromObject(GROUND));

 /* Far-country elevation continuation for KHORIZON & 16.5 km KFAR Crookshore mountains */
 const farH = function(x, z){
  if (Math.abs(x) < ADG_SR * 0.94 && Math.abs(z) < ADG_SR * 0.94) return terrainH(x, z);
  const r = Math.hypot(x, z);
  if (x < -1900) return -52.0;
  const eastMountains = x > 1800 ? 480.0 * Math.min(1, (x - 1800) / 8500) + 180.0 * Math.sin(z * 0.00045) : 0.0;
  const rimCollar = 165.0 * Math.max(0, 1 - Math.abs(r - 3600) / 2200) * (x > -1400 ? 1 : 0);
  const southSound = z > 1600 && x < 1600 ? -42.0 : 0.0;
  return Math.max(-52.0, eastMountains + rimCollar + southSound + (x > 1400 ? 155.0 : -24.0));
 };

 let GROUND_HZ = null;
 window._horizon = { baked: false, mats: 0 };
 if (typeof KHORIZON !== 'undefined' && KHORIZON.bake) {
  try {
   const S0 = ADG_SR * 1.02;
   GROUND_HZ = KHORIZON.bake({
    box: [-S0, -S0, S0, S0],
    n: 96,
    h: terrainH,
    far: { h: farH, box: [-16500, -16500, 16500, 16500], n: 80 }
   });
   if (GROUND_HZ && KHORIZON.shade) {
    KHORIZON.shade(GROUND_MAT, GROUND_HZ);
    window._horizon.baked = true;
   }
  } catch (_e) {}
 }

 let FAR_MESH = null;
 if (typeof KFAR !== 'undefined' && KFAR.grid && KFAR.lines && KFAR.geometry) {
  try {
   const S0 = ADG_SR * 0.98, cs = 72;
   const cTmp = new THREE.Color(), cWood = new THREE.Color(0x3a563c), cPeak = new THREE.Color(0x5c6468), cSea = new THREE.Color(0x18343c);
   const G = KFAR.grid({
    lines: KFAR.lines({ cell: cs, inner: S0 + cs, out: 16500, grow: 1.045 }),
    dense: true,
    h: function(x, z){
     if (Math.abs(x) < S0 && Math.abs(z) < S0) return terrainH(x, z) - 4.0;
     return farH(x, z);
    },
    skip: function(x0, z0, x1, z1){ return x0 > -S0 + 120 && x1 < S0 - 120 && z0 > -S0 + 120 && z1 < S0 - 120; },
    color: function(x, z, y){
     cTmp.copy(cWood).lerp(cPeak, Math.max(0, Math.min(1, (y - 240) / 560)));
     if (y < 0) cTmp.lerp(cSea, Math.max(0, Math.min(1, -y / 16)));
     cTmp.convertSRGBToLinear();
     return [cTmp.r, cTmp.g, cTmp.b];
    }
   });
   const fGeo = KFAR.geometry(G);
   const fp = fGeo.attributes.position, fuv = new Float32Array(fp.count * 2);
   for (let i = 0; i < fp.count; i++) {
    fuv[i * 2] = fp.getX(i) * 0.006;
    fuv[i * 2 + 1] = fp.getZ(i) * 0.006;
   }
   fGeo.setAttribute('uv', new THREE.BufferAttribute(fuv, 2));
   const fMat = new THREE.MeshLambertMaterial({ vertexColors: true, map: GROUND_MAT.map || null });
   fMat.userData.farField = true;
   FAR_MESH = new THREE.Mesh(fGeo, fMat);
   FAR_MESH.name = 'adg_farfield';
   FAR_MESH.userData.farField = true;
   FAR_MESH.userData.probeSkip = true;
   FAR_MESH.frustumCulled = false;
   scene.add(FAR_MESH);
  } catch (_e) {}
 }

 /* 3. Build Arcodiga Megastructure at yOffset = -95.0 m + Asymmetric Eternian East Wing Socket + KRUINS.watch */
 const DELTA = ADG_CROOK_DELTA.buildDelta(ARCODIGA, ADG_INTERIORS);
 const statuaryAuditLog = [];

 const ancBuilt = ANC.buildAt(scene, {
  yOffset: ADG_SITE.ARCODIGA_Y_OFFSET,
  gx: 0,
  gz: 0,
  ground: terrainH,
  tags: KTAGS.page,
  isReclaimedUnit: ADG_CROOK_DELTA.isReclaimedUnit
 });
 adgTick(function(_nowMs, dt){
  if (ancBuilt && ancBuilt.tick) ancBuilt.tick(dt == null ? 0.016 : dt);
 });

 /* Seal East Stiffening Wing off from ruined Western Spine at x = +38 m with Bronze Closed-Eyed Ancestor-Lintel Bulkhead */
 let bulkheadMesh = null;
 if (typeof ETK !== 'undefined' && ETK.civicBulkhead) {
  const bk = DELTA.bulkhead;
  KTAGS.page.add({
   'class': 'building',
   kind: 'et_ancestor_lintel_bulkhead',
   key: bk.id,
   name: bk.name,
   at: [bk.x, bk.worldY, bk.z],
   ry: -Math.PI * 0.5,
   size: [bk.w, 2.4, bk.h],
   tags: { culture: 'eternian', state: 'reclaimed', types: ['military', 'civic'] }
  });
  bulkheadMesh = ETK.civicBulkhead(bk.w, bk.h, 4.2, 4.6);
  bulkheadMesh.position.set(bk.x, bk.worldY - 6.8, bk.z);
  bulkheadMesh.rotation.y = -Math.PI * 0.5;
  scene.add(bulkheadMesh);
  if (bulkheadMesh.userData && bulkheadMesh.userData.heads) {
   for (let i = 0; i < bulkheadMesh.userData.heads.length; i++) statuaryAuditLog.push(bulkheadMesh.userData.heads[i]);
  }
 }

 /* East Wing Charter Concourse Portal Gatehouse & Forecourt at x = +1020.5 m (0 arcology clipping!) */
 ADG_STREETS_PORTAL.buildEastWingPortal(scene, MATS, KTAGS.page, statuaryAuditLog);

 /* Register Arcodiga Ruin in core/ruins (KRUINS.watch -> asserted automatically by tools/harness.py!) */
 if (typeof KRUINS !== 'undefined' && KRUINS.watch && ancBuilt && ancBuilt.root) {
  const ancGeoName = ancBuilt.geoName;
  const eastGrp = ancBuilt.eastSite ? ancBuilt.eastSite.group : null;
  const hasAnc = function(obj, target){
   let p = obj;
   while (p) { if (p === target) return true; p = p.parent; }
   return false;
  };
  KRUINS.watch(ancBuilt.root, {
   name: 'Arcodiga dam-arcology ruin',
   inside: function(x, z){ return Math.abs(x) < ARCODIGA.DIM.SPAN * 0.5 + 40 && z > -680 && z < 720; },
   ground: terrainH,
   skip: function(m, def){
    const nm = def || (ancGeoName ? ancGeoName.get(m.geometry) : null);
    if (nm && KRUINS.DECOR.test(nm)) return true;
    if (nm === 'aiPartR' || nm === 'aiPartW' || nm === 'plank' || nm === 'cell' || nm === 'strip' || nm === 'patchPlate') return true;
    if (m.userData && (m.userData.lodSkip || m.userData.interiorFloors || m.userData.probeSkip)) return true;
    if (eastGrp && hasAnc(m, eastGrp)) return true;
    return false;
   }
  });
 }

 /* Register < +65 m Megatsunami Scour Belt & Notch Rockfall Zone in core/hazard (KHAZ) */
 if (typeof KHAZ !== 'undefined' && KHAZ.create) {
  try {
   window._hazards = KHAZ.create({ seed: ADG_SITE.SEED });
   if (window._hazards && window._hazards.add) {
    window._hazards.add({ id: 'crook_tsunami_surge_belt', kind: 'flood', level: 65.0, box: [-2600, -2600, 2600, 2600] });
    window._hazards.add({ id: 'arcodiga_notch_rockfall', kind: 'rockfall', at: [-265, 117, 120], r: 165.0 });
   }
  } catch (_e) {}
 }

 /* 4. Register HKK & ETK in KRATOR_KITS and Draw 3-Instance Dual-Polity Town via KCITY.hostMultikit (DataTexture2DArray) */
 ADG_TUNE.installManifest(KRATOR_KITS);
 let clockSpecCaptured = null;

 const _imagedSeen = new Set();
 function noteAtlasImaged(G, kitObj, packName){
  if (!G || typeof KMAT === 'undefined' || !KMAT || !KMAT.packed) return;
  if (!Array.isArray(KMAT.imaged)) KMAT.imaged = [];
  const pushUrl = function(s){
   if (typeof s === 'string' && s.length && !_imagedSeen.has(s)) {
    _imagedSeen.add(s);
    KMAT.imaged.push(s);
   }
  };
  G.traverse(function(o){
   const m = o && o.material;
   if (!m) return;
   const ms = Array.isArray(m) ? m : [m];
   for (let i = 0; i < ms.length; i++) {
    const mt = ms[i];
    if (!mt) continue;
    let fam = mt.userData && mt.userData.fam;
    if (!fam && kitObj && kitObj.MAT) {
     for (const mk in kitObj.MAT) {
      if (kitObj.MAT[mk] === mt) { fam = mk; break; }
     }
    }
    if (fam && packName) {
     const pk = KMAT.packed(packName, fam);
     if (pk) {
      pushUrl(pk.map);
      pushUrl(pk.normalMap);
      pushUrl(pk.roughnessMap);
      pushUrl(pk.cwMap);
     }
    }
   }
  });
 }
 if (bulkheadMesh && typeof ETK !== 'undefined') noteAtlasImaged(bulkheadMesh, ETK, 'eternian');

 if (typeof ETK !== 'undefined') {
  const _origEtProto = ETK.proto;
  ETK.proto = function(key, v){
   const G = _origEtProto(key, v);
   noteAtlasImaged(G, ETK, 'eternian');
   if (G && G.userData) {
    if (G.userData.heads) {
     for (let i = 0; i < G.userData.heads.length; i++) statuaryAuditLog.push(G.userData.heads[i]);
    }
    if (key === 'et_clock' && G.userData.clock && !clockSpecCaptured) {
     clockSpecCaptured = G.userData.clock;
    }
   }
   return G;
  };
  KRATOR_KITS.register('eternian', ETK);
 }
 if (typeof HKK !== 'undefined') {
  const _origHkProto = HKK.proto;
  HKK.proto = function(key, v){
   const G = _origHkProto(key, v);
   noteAtlasImaged(G, HKK, 'hueru-kuran');
   return G;
  };
  KRATOR_KITS.register('hueru-kuran', HKK);
 }

 const PLANS = ADG_CITY.buildPlans({ tags: KTAGS.page });
 {
  const seenSpecs = new Set();
  for (let i = 0; i < PLANS.lots.length; i++) {
   const L = PLANS.lots[i];
   const sk = L.kit + ':' + L.rawKey + '#' + (L.variant | 0);
   if (seenSpecs.has(sk)) continue;
   seenSpecs.add(sk);
   KRATOR_KITS.proto(L.kit + ':' + L.rawKey, L.variant | 0);
  }
 }

 /* Draw merged basalt cobble streets, 6-fold hexagonal court plazas & hexagonal/rectangular plinths */
 ADG_STREETS_PORTAL.buildStreetsAndPlinths(scene, PLANS, MATS);

 /* Create KCITY.hostMultikit 3-Ring HLOD + Shared DataTexture2DArray Atlas (< 13 samplers, <= 350 MB VRAM) */
 const cityGroup = new THREE.Group();
 cityGroup.name = 'adg_multikit_city';
 scene.add(cityGroup);

 const multikitHost = KCITY.hostMultikit.create({
  kits: KRATOR_KITS,
  defaultKit: 'hueru-kuran',
  renderer: renderer,
  group: cityGroup,
  fullR: 195,
  mid1R: 480,
  midR: 1550,
  bakeBudgetMs: 180,
  maxVramMB: 310
 });
 multikitHost.setPlan({ lots: PLANS.lots });
 {
  const warmEyes = [[1120, 210], [1165, 535], [1020, -485], [680, 1180], [520, 420]];
  for (let w = 0; w < warmEyes.length; w++) {
   for (let p = 0; p < 8; p++) multikitHost.update(warmEyes[w], true);
  }
 }

 /* Surround under-construction Charter Market lots with kits/construction (KCONS.site) scaffolds & material piles */
 if (typeof KCONS !== 'undefined' && KCONS.site) {
  const consGroup = new THREE.Group();
  consGroup.name = 'adg_kcons_sites';
  for (let i = 0; i < PLANS.constructionLots.length; i++) {
   const L = PLANS.constructionLots[i];
   try {
    const cs = KCONS.site({ w: L.w, d: L.d, h: L.h, bill: { planks: 6, blocks: 8, rope: 3 } });
    cs.set(L.consProgress == null ? 0.5 : L.consProgress);
    cs.group.position.set(L.x, L.y, L.z);
    cs.group.rotation.y = L.ry;
    consGroup.add(cs.group);
   } catch (_e) {}
  }
  if (ADG_FLEET && ADG_FLEET.mergeStaticGroupByMat) ADG_FLEET.mergeStaticGroupByMat(consGroup);
  cityGroup.add(consGroup);
 }

 /* Attach animated bronze Tsunami-Tide Clock rig on the placed Z6 et_clock landmark */
 let clockRig = null;
 const clockLot = PLANS.lots.find(function(l){ return l.rawKey === 'et_clock'; });
 if (clockLot && typeof ETK !== 'undefined' && ETK.buildClockRig) {
  if (!clockSpecCaptured) KRATOR_KITS.proto('eternian:et_clock', 0);
  if (clockSpecCaptured) {
   clockRig = ETK.buildClockRig(clockSpecCaptured);
   if (clockRig && clockRig.group) {
    clockRig.group.position.set(clockLot.x, clockLot.y, clockLot.z);
    clockRig.group.rotation.y = clockLot.ry;
    scene.add(clockRig.group);
   }
  }
 }

 /* Register operable KDOOR portals at key Charter Market, Nuraghe, Santa Cristina & Superintendency entrances */
 if (typeof KDOOR !== 'undefined' && KDOOR.add) {
  for (let i = 0; i < PLANS.lots.length; i++) {
   const L = PLANS.lots[i];
   if (!L.civic || L.underConstruction) continue;
   const fx = L.x + Math.sin(L.ry) * (L.d * 0.48);
   const fz = L.z + Math.cos(L.ry) * (L.d * 0.48);
   try { KDOOR.add({ at: [fx, L.y, fz], yaw: L.ry, w: 1.8, h: L.kit === 'eternian' ? 2.2 : 2.1 }); } catch (_e) {}
  }
 }

 /* 5. Stage 7 KROOMLIGHT Deep Vaults & Telemetry Loft Shells (I1-I4 + Gate 5 vault=true Zero Daylight) */
 const ROOM_LIGHT_TABLE = ADG_ROOMS.buildLightTable();
 const interiorGroup = new THREE.Group();
 interiorGroup.name = 'adg_roomlight_interiors';
 scene.add(interiorGroup);
 {
  const vaultBuf = { pos: [], nor: [], col: [] };
  const winBuf = { pos: [], nor: [], col: [] };
  const hkFurnList = [], etFurnList = [];

  for (let i = 0; i < ADG_ROOMS.ROOMS.length; i++) {
   const R = ADG_ROOMS.ROOMS[i];
   const bx = R.box;
   const rw = bx[3] - bx[0], rh = bx[4] - bx[1], rd = bx[5] - bx[2];
   const cx = (bx[0] + bx[3]) * 0.5, cy = (bx[1] + bx[4]) * 0.5, cz = (bx[2] + bx[5]) * 0.5;
   const row = ROOM_LIGHT_TABLE && ROOM_LIGHT_TABLE.byId[R.id];

   const shellGeo = new THREE.BoxGeometry(rw, rh, rd, 4, 3, 4).toNonIndexed();
   const sp = shellGeo.attributes.position, sn = shellGeo.attributes.normal;
   const dayE = row ? row.daylight : 0;
   const lampE = row ? row.lampAmbience : 0.14;
   const baseR = dayE * 0.85 + lampE * 1.15 + 0.07;
   const baseG = dayE * 0.90 + lampE * 0.92 + 0.07;
   const baseB = dayE * 0.98 + lampE * 0.65 + 0.06;
   const dst = R.vault ? vaultBuf : winBuf;

   for (let v = 0; v < sp.count; v++) {
    const wx = cx + sp.getX(v), wy = cy + sp.getY(v), wz = cz + sp.getZ(v);
    const nx = -sn.getX(v), ny = -sn.getY(v), nz = -sn.getZ(v);
    const ao = (typeof KROOMLIGHT !== 'undefined' && KROOMLIGHT.vertexCornerAO)
     ? KROOMLIGHT.vertexCornerAO(wx, wy, wz, nx, ny, nz, bx, 0.95)
     : 1.0;
    dst.pos.push(wx, wy, wz);
    dst.nor.push(sn.getX(v), sn.getY(v), sn.getZ(v));
    dst.col.push(Math.min(1, baseR * ao), Math.min(1, baseG * ao), Math.min(1, baseB * ao));
   }

   for (let f = 0; f < R.furniture.length; f++) {
    const F = R.furniture[f];
    KTAGS.page.add({
     'class': 'furniture', kind: F.key, key: F.key, name: F.key + ' (' + R.name + ')',
     at: [F.x, F.y, F.z], ry: F.ry, size: [1.8, 1.0, 1.0],
     tags: { culture: R.culture, room: R.id }
    });
    (R.culture === 'hueru-kuran' ? hkFurnList : etFurnList).push(F);
   }
  }

  [[vaultBuf, 0x9aa49e, 0.0], [winBuf, 0xe4dfd4, 0.35]].forEach(function(spec){
   const B = spec[0];
   if (!B.pos.length) return;
   const g = new THREE.BufferGeometry();
   g.setAttribute('position', new THREE.Float32BufferAttribute(B.pos, 3));
   g.setAttribute('normal', new THREE.Float32BufferAttribute(B.nor, 3));
   g.setAttribute('color', new THREE.Float32BufferAttribute(B.col, 3));
   const m = new THREE.MeshStandardMaterial({ color: spec[1], vertexColors: true, roughness: 0.86, envMapIntensity: spec[2], side: THREE.BackSide });
   const sm = new THREE.Mesh(g, m);
   sm.userData.probeSkip = true;
   interiorGroup.add(sm);
  });

  const fBox = new THREE.BoxGeometry(1.6, 0.85, 0.95);
  const _fm = new THREE.Matrix4(), _fq = new THREE.Quaternion(), _fy = new THREE.Vector3(0, 1, 0), _fp = new THREE.Vector3(), _fs = new THREE.Vector3(1, 1, 1);
  [[hkFurnList, MATS.nephriteSawn], [etFurnList, MATS.bronzeLintel]].forEach(function(pair){
   const list = pair[0], mat = pair[1];
   if (!list.length) return;
   const im = new THREE.InstancedMesh(fBox, mat, list.length);
   for (let i = 0; i < list.length; i++) {
    const F = list[i];
    _fp.set(F.x, F.y + 0.43, F.z);
    _fq.setFromAxisAngle(_fy, F.ry);
    _fm.compose(_fp, _fq, _fs);
    im.setMatrixAt(i, _fm);
   }
   im.instanceMatrix.needsUpdate = true;
   im.userData.probeSkip = true;
   KCITY.boundedInstanced(im);
   interiorGroup.add(im);
  });
 }

 const ROOM_POOL_LIGHTS = [];
 for (let i = 0; i < 6; i++) {
  const pl = new THREE.PointLight(0xffcb8a, 0, 15, 2);
  pl.castShadow = false;
  pl.visible = false;
  scene.add(pl);
  ROOM_POOL_LIGHTS.push(pl);
 }
 adgTick(function(){
  if (!ROOM_LIGHT_TABLE) return;
  const picks = ADG_ROOMS.poolForEye([camera.position.x, camera.position.y, camera.position.z], 0.86, ROOM_LIGHT_TABLE);
  for (let i = 0; i < ROOM_POOL_LIGHTS.length; i++) {
   const L = ROOM_POOL_LIGHTS[i];
   if (i < picks.length) {
    const P = picks[i];
    L.position.set(P.at[0], P.at[1], P.at[2]);
    L.color.setRGB(P.color[0], P.color[1], P.color[2]);
    L.intensity = P.amp * 0.75;
    L.distance = P.range;
    L.visible = true;
   } else {
    L.intensity = 0;
    L.visible = false;
   }
  }
 });

 /* 6. Build 3x 90s Cliff-Hoists, Santa Cristina Chime-Well, VTOL Storm-Beacon, Ore Nodes & Ring Sea Fleet */
 ADG_FLEET.buildHoistsAndLandmarks(scene, MATS, KTAGS.page);
 ADG_FLEET.buildFleet(scene, MATS, KTAGS.page);
 adgTick(function(nowMs){
  ADG_FLEET.update(nowMs * 0.001, ADG_STATE);
  multikitHost.update([camera.position.x, camera.position.z], false);
  if (clockRig && clockRig.group) {
   clockRig.group.visible = camera.position.distanceToSquared(clockRig.group.position) < 420 * 420;
  }
  interiorGroup.visible = Math.hypot(camera.position.x - 750, camera.position.z - 210) < 450;
 });

 /* 7. Crookshore +65.0 m Trimline Ecology (biomes/crook + settlement-collar hero stands on KRAND & KSPACE) */
 const bioSpace = KSPACE.create({ cell: 18 });
 for (let i = 0; i < PLANS.lots.length; i++) {
  const L = PLANS.lots[i];
  const rLot = Math.max(L.w, L.d) * 0.65 + 14.0;
  if (bioSpace.insert) bioSpace.insert({ x: L.x, z: L.z, r: rLot, kind: 'building' }, L.x, L.z, rLot);
 }
 const townClears = [
  [1205,  205, 225],
  [1045, -495, 245],
  [1160, -165, 210],
  [1205,  545, 285],
  [ 635, -565, 135],
  [ 475,  425, 145]
 ];
 for (let i = 0; i < townClears.length; i++) {
  const tc = townClears[i];
  if (bioSpace.insert) bioSpace.insert({ x: tc[0], z: tc[1], r: tc[2], kind: 'plaza' }, tc[0], tc[1], tc[2]);
 }
 for (let i = 0; i < ADG_SITE.HOISTS.length; i++) {
  const H = ADG_SITE.HOISTS[i];
  if (bioSpace.insert) {
   bioSpace.insert({ x: H.foot[0], z: H.foot[1], r: 24, kind: 'hoist' }, H.foot[0], H.foot[1], 24);
   bioSpace.insert({ x: H.head[0], z: H.head[1], r: 24, kind: 'hoist' }, H.head[0], H.head[1], 24);
  }
 }

 const floraStats = { spongesBelow65: 0, treesAbove65: 0, treesBelow65: 0, canopySponges: 0 };
 if (typeof CROOK !== 'undefined' && CROOK.build) {
  try {
   CROOK.build({
    station: 'shore',
    R: 1850,
    quality: PQ.has('q') ? +PQ.get('q') : 0.42,
    space: bioSpace,
    seed: ADG_SITE.SEED
   });

   const H01 = function(cx, cz, k, salt){
    return KRAND.unit(KRAND.hash(ADG_SITE.SEED >>> 0, (cx | 0) * 73856093 ^ (cz | 0) * 19349663, k | 0, salt | 0));
   };
   const claimBio = function(kind, x, z, r){
    const hits = bioSpace.query(x, z, r);
    if (hits && hits.length > 0) return false;
    bioSpace.insert({ kind: kind, x: x, z: z }, x, z, r);
    return true;
   };

   /* 7A. < +65.0 m Basalt Spray-Bench Lithistid Sponges (0 woody trees!) */
   const sprayBoxes = [
    [520, 795, -780, -360],
    [-1180, -760, -1350, -960],
    [310, 660, 300, 540],
    [-820, -560, -420, 420],
    [560, 810, -240, 310]
   ];
   const spongeSpace = KSPACE.create({ cell: 8 });
   for (let i = 0; i < PLANS.lots.length; i++) {
    const L = PLANS.lots[i];
    if (L.tier === 'cove') spongeSpace.insert({ x: L.x, z: L.z }, L.x, L.z, Math.max(L.w, L.d) * 0.6 + 3.0);
   }
   const _prevKit = BIO.kit('crook');
   try {
    for (let bi = 0; bi < sprayBoxes.length; bi++) {
     const B = sprayBoxes[bi];
     for (let gz = B[2]; gz <= B[3]; gz += 22) {
      for (let gx = B[0]; gx <= B[1]; gx += 22) {
       const cx = (gx / 22) | 0, cz = (gz / 22) | 0;
       const x = gx + (H01(cx, cz, 1, 0x610) - 0.5) * 16.0;
       const z = gz + (H01(cx, cz, 2, 0x610) - 0.5) * 16.0;
       const y = terrainH(x, z);
       if (y < 0.8 || y >= 64.5) continue;
       const shelter = ADG_SITE.calderaShelterAt(x, z);
       const sp = CROOK_PHYS.sprayTrimAt({ elevM: y, coastDistKm: 0.18, wnwExposure01: 1.0 - 0.65 * shelter, calderaShelter01: shelter, silicaByte: 150 });
       if (!sp.basaltSpongeOk) continue;
       if (spongeSpace.query(x, z, 1.5).length > 0) continue;
       spongeSpace.insert({ x: x, z: z }, x, z, 1.5);

       const yaw = H01(cx, cz, 3, 0x610) * Math.PI * 2;
       if (H01(cx, cz, 4, 0x610) < 0.52) {
        const hS = 0.52 + 0.90 * H01(cx, cz, 5, 0x610), rS = 0.42 + 0.45 * H01(cx, cz, 6, 0x610);
        const col = CROOK.PAL.spongeChimney[Math.abs(cx * 7 + cz * 13) % CROOK.PAL.spongeChimney.length];
        BIO.put('ck_chimney_tube', [x, y - 0.05, z], BIO.fn.qEuler(0, yaw, 0), [rS, hS, rS], col);
        BIO.put('ck_chimney_rim', [x, y - 0.06, z], BIO.fn.qEuler(0, yaw + 1.1, 0), [rS * 0.72, hS * 0.58, rS * 0.72], col);
        CROOK.PLACED.push(['basaltchimney', +x.toFixed(2), +y.toFixed(2), +z.toFixed(2), +y.toFixed(2), 'spraybench', null]);
       } else {
        const rC = 0.34 + 0.48 * H01(cx, cz, 5, 0x610), hC = 0.25 + 0.34 * H01(cx, cz, 6, 0x610);
        const col = CROOK.PAL.spongeCushion[Math.abs(cx * 11 + cz * 5) % CROOK.PAL.spongeCushion.length];
        BIO.put('ck_spraycushion', [x, y - 0.03, z], BIO.fn.qEuler(0, yaw, 0), [rC, hC, rC], col);
        CROOK.PLACED.push(['spraycushion', +x.toFixed(2), +y.toFixed(2), +z.toFixed(2), +y.toFixed(2), 'spraybench', null]);
       }
       floraStats.spongesBelow65++;
       if (floraStats.spongesBelow65 % 12 === 0) {
        BIO.put('ck_rock_basalt', [x + 1.8, y - 0.22, z + 1.1], BIO.fn.qEuler(0, yaw * 0.7, 0), [1.15, 1.45, 1.15], CROOK.PAL.basalt[0]);
       }
      }
     }
    }
   } finally {
    BIO.kit(_prevKit);
   }

   /* 7B. >= +65.0 m Hero Benihi Red-Cypress, Sitka Spruce & Redcedar around Rim Collars */
   const forestBoxes = [
    [820, 1820, -1120, 1060],
    [-1420, -820, -780, 620]
   ];
   let heroCount = 0;
   for (let bi = 0; bi < forestBoxes.length; bi++) {
    const B = forestBoxes[bi];
    for (let gz = B[2]; gz <= B[3]; gz += 56) {
     for (let gx = B[0]; gx <= B[1]; gx += 56) {
      if (heroCount >= 92) break;
      const cx = (gx / 56) | 0, cz = (gz / 56) | 0;
      if (H01(cx, cz, 1, 0x620) > 0.65) continue;
      const x = gx + (H01(cx, cz, 2, 0x620) - 0.5) * 40.0;
      const z = gz + (H01(cx, cz, 3, 0x620) - 0.5) * 40.0;
      const y = terrainH(x, z);
      if (y < 66.0) continue;
      if (ADG_SITE.townBandMask(x, z) < 0.30) continue;
      const e = 2.0;
      const slp = Math.hypot((terrainH(x + e, z) - terrainH(x - e, z)) / (2 * e), (terrainH(x, z + e) - terrainH(x, z - e)) / (2 * e));
      if (slp > 0.66) continue;
      const shelter = ADG_SITE.calderaShelterAt(x, z);
      const sp = CROOK_PHYS.sprayTrimAt({ elevM: y, coastDistKm: 0.65, wnwExposure01: 1.0 - 0.7 * shelter, calderaShelter01: shelter, silicaByte: 150 });
      if (!sp.woodyOk) continue;
      if (!claimBio('tree', x, z, 5.5)) continue;

      const uSp = H01(cx, cz, 4, 0x620);
      const kind = uSp < 0.42 ? 'redcypress' : (uSp < 0.68 ? 'westernredcedar' : (uSp < 0.88 ? 'coastspruce' : 'bigleafmaple'));
      const tSeed = KRAND.hash(ADG_SITE.SEED, cx * 131 + cz, 5, 0x621);
      const sc = 0.42 + 0.12 * H01(cx, cz, 6, 0x620);
      const res = CROOK.growTree(kind, x, y, z, tSeed, sc, { canopySponge: sp.canopySpongeOk ? sp.fogBelt01 : 0, windLeanX: 0.015 });
      CROOK.PLACED.push([kind, +x.toFixed(2), +y.toFixed(2), +z.toFixed(2), +y.toFixed(2), 'cloudforest', { H: res.H }]);
      floraStats.treesAbove65++;
      floraStats.canopySponges += (res.cups + res.beards);
      heroCount++;

      if (heroCount % 2 === 0) {
       const fx = x + 7.8, fz = z + 5.6, fy = terrainH(fx, fz);
       if (fy >= 66.0 && claimBio('shrub', fx, fz, 1.5)) {
        CROOK.growRhodo(fx, fy, fz, KRAND.hash(ADG_SITE.SEED, cx, cz, 0x623), 0.88);
       }
      }
     }
    }
   }

   /* Count total placed woody vs sponge trimline compliance across all CROOK.PLACED */
   for (let i = 0; i < CROOK.PLACED.length; i++) {
    const rec = CROOK.PLACED[i];
    const k = rec[0], py = rec[4];
    if ((k === 'coastspruce' || k === 'westernredcedar' || k === 'redcypress' || k === 'bigleafmaple') && py < 65.0) {
     floraStats.treesBelow65++;
    }
   }

   const b = BIO.bake();
   window._instances = b.inst;
   window._bakeCalls = b.calls;
   BIO.setA2C(renderer);
   if (BIO.impostorLook) BIO.impostorLook({ gain: 1.55, wrap: 0.9 });
   if (BIO.bakeImpostors) BIO.bakeImpostors(renderer, { wait: 160 });
  } catch (e) {
   reportErr('crook flora: ' + (e.stack || e));
  }
 }

 if (GROUND_HZ && typeof KHORIZON !== 'undefined' && KHORIZON.shadeScene) {
  try {
   window._horizon.mats = KHORIZON.shadeScene(scene, GROUND_HZ, {
    filter: function(m){ return !m.userData.farField && m !== GROUND_MAT && !m.userData.atlas; }
   });
  } catch (_e) {}
 }

 /* 8. KSHADOW strictly OFF at load (owner rule 2026-11-03); attaches only on UI toggle or ?shadow=1 */
 window._shadow = 'off';
 const attachShadow = function(ui){
  if (typeof KSHADOW === 'undefined' || !KSHADOW.attach || /[?&]shadow=0(&|$)/.test(location.search)) {
   window._shadow = 'off';
   return null;
  }
  try {
   const H = KSHADOW.attach({ renderer: renderer, scene: scene, camera: camera, sun: SUN_LIGHT, ground: terrainH, ui: ui });
   H.cast(scene);
   GROUND.castShadow = false;
   GROUND.receiveShadow = true;
   if (FAR_MESH) { FAR_MESH.castShadow = false; FAR_MESH.receiveShadow = false; }
   window._shadow = H;
   return H;
  } catch (_e) {
   return null;
  }
 };
 if (/[?&]shadow=1(&|$)/.test(location.search)) attachShadow(null);

 const farBedAt = function(x, z){
  const S0 = ADG_SR * 0.96;
  const mx = Math.max(Math.abs(x), Math.abs(z));
  if (mx <= S0) return terrainH(x, z);
  const f = Math.min(1, (mx - S0) / 480.0);
  const s = f * f * (3 - 2 * f);
  return terrainH(x, z) * (1 - s) + farH(x, z) * s;
 };

 window._buildMs = Math.round(performance.now() - t0);

 return {
  MATS: MATS,
  DELTA: DELTA,
  PLANS: PLANS,
  GROUND: GROUND,
  GROUND_MAT: GROUND_MAT,
  FAR_MESH: FAR_MESH,
  farBedAt: farBedAt,
  ancBuilt: ancBuilt,
  bulkheadMesh: bulkheadMesh,
  multikitHost: multikitHost,
  clockRig: clockRig,
  statuaryAuditLog: statuaryAuditLog,
  floraStats: floraStats,
  ROOM_LIGHT_TABLE: ROOM_LIGHT_TABLE,
  attachShadow: attachShadow
 };
})();
