// ================================================================= FLOATING CITY — World Ground, Multi-Kit Atlas (2,698 Lots), Pontoons, Gardens & Flora [web]
const FC_WORLD = (function () {
  'use strict';
  const t0 = performance.now();
  const useProc = PQ.get('mat') === 'proc';
  if (useProc) KMAT.mode = 'proc';

  /* Optional horizontal/vertical Submarine Dynamo cutaway plane (`C` / UI toggle) */
  const SUB_CUT_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e6);

  /* 1. All 8 Bespoke Library Material Slots from settlements/floating-city/materials.json + M2 Specular AA */
  function makeSlotMat(slot, fallbackHex, rough, metal) {
    const m = new THREE.MeshStandardMaterial({
      color: fallbackHex,
      roughness: rough == null ? 0.80 : rough,
      metalness: metal == null ? 0.0 : metal,
      vertexColors: false
    });
    if (!useProc && typeof KMAT !== 'undefined' && KMAT.mode === 'lib' && KMAT.packed && KMAT.textures) {
      const L = KMAT.packed('floating_city', slot);
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
    const mv = FC_MIPVAR.forFamily(slot);
    if (mv && typeof KMAT_M1 !== 'undefined' && KMAT_M1.patch) {
      KMAT_M1.patch(m, { mipVariance: mv, roughStrength: 1.0 });
    }
    return m;
  }

  const MATS = {
    ancientCeramic:  makeSlotMat('ancient_ceramic',  0xe8e4da, 0.36, 0.04),
    ancientConcrete: makeSlotMat('ancient_concrete', 0x7c8084, 0.82, 0.02),
    celadonRoof:     makeSlotMat('celadon_roof',     0x6ea090, 0.32, 0.06),
    giltChofa:       makeSlotMat('gilt_chofa',       0xdba83c, 0.28, 0.78),
    cobaltGlaze:     makeSlotMat('cobalt_glaze',     0x26548c, 0.28, 0.05),
    travertineStone: makeSlotMat('travertine_stone', 0xd6ccb8, 0.76, 0.00),
    paktongMetal:    makeSlotMat('paktong_metal',    0x8ca69c, 0.36, 0.72),
    cypressHull:     makeSlotMat('cypress_hull',     0x6c4834, 0.78, 0.00)
  };
  MATS.ancientConcrete.clippingPlanes = [SUB_CUT_PLANE];

  /* Patch RIK & KLK kit materials with Stage 5 KMAT_M1 M2 Roughness AA */
  [typeof RIK !== 'undefined' ? RIK : null, typeof KLK !== 'undefined' ? KLK : null].forEach(function (kit) {
    if (!kit || !kit.MAT || typeof KMAT_M1 === 'undefined' || !KMAT_M1.patch) return;
    Object.keys(kit.MAT).forEach(function (k) {
      const mv = FC_MIPVAR.forFamily(k);
      if (mv && kit.MAT[k]) {
        try { KMAT_M1.patch(kit.MAT[k], { mipVariance: mv, roughStrength: 1.0 }); } catch (e) {}
      }
    });
  });

  if (typeof BIO !== 'undefined' && BIO.tagReg) BIO.tagReg();
  if (!KTAGS.page) KTAGS.page = KTAGS.create({ build: 'floating-city' });

  /* Bind KHAZ.TIDE zones onto KTAGS.page */
  const HAZARD_RECS = FC_TIDE.bindHazards(KTAGS.page);

  /* 2. Build 1:1 Site Ground Mesh (5,200 m x 5,200 m), KSTRATA Carbonate Cliff Banding, KDRAWN & KFAR */
  const G_SEGS = 240;
  const G_SIZE = FC_SR * 2;
  const groundGeo = new THREE.PlaneGeometry(G_SIZE, G_SIZE, G_SEGS, G_SEGS);
  groundGeo.rotateX(-Math.PI * 0.5);

  const gPos = groundGeo.attributes.position;
  const gUv = groundGeo.attributes.uv;
  const gCount = gPos.count;
  const gCol = new Float32Array(gCount * 3);

  const C_PLATEAU = new THREE.Color(0x6c8254).convertSRGBToLinear();
  const C_CLIFF   = new THREE.Color(0xc8beaa).convertSRGBToLinear();
  const C_GHAT    = new THREE.Color(0x8e8678).convertSRGBToLinear();
  const C_LAGOON  = new THREE.Color(0x284e4c).convertSRGBToLinear();
  const C_KOLK    = new THREE.Color(0x102430).convertSRGBToLinear();
  const C_SILT    = new THREE.Color(0x5c523c).convertSRGBToLinear();
  const _vc = new THREE.Color();

  for (let i = 0; i < gCount; i++) {
    const x = gPos.getX(i), z = gPos.getZ(i);
    const y = terrainH(x, z);
    gPos.setY(i, y);
    gUv.setXY(i, x / 22.0, z / 22.0);

    const e = Math.hypot((terrainH(x + 3, z) - terrainH(x - 3, z)) / 6, (terrainH(x, z + 3) - terrainH(x, z - 3)) / 6);
    if (y >= 82.0) {
      _vc.copy(C_PLATEAU).lerp(C_CLIFF, Math.min(1, e * 0.65));
    } else if (y >= 16.0) {
      const band = 0.88 + 0.12 * Math.sin(y * 0.42);
      _vc.copy(C_CLIFF).multiplyScalar(band);
    } else if (y >= -1.5) {
      _vc.copy(C_GHAT);
    } else if (y > -32.0) {
      _vc.copy(C_LAGOON).lerp(C_SILT, x > 550 ? 0.38 : 0.10);
    } else {
      _vc.copy(C_KOLK);
    }
    gCol[i * 3] = _vc.r;
    gCol[i * 3 + 1] = _vc.g;
    gCol[i * 3 + 2] = _vc.b;
  }
  groundGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3));
  groundGeo.computeVertexNormals();

  const GROUND_MAT = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.86,
    metalness: 0.0,
    map: MATS.travertineStone.map || null,
    normalMap: MATS.travertineStone.normalMap || null,
    roughnessMap: MATS.travertineStone.roughnessMap || null
  });
  if (typeof KMAT_M1 !== 'undefined' && KMAT_M1.patch) {
    KMAT_M1.patch(GROUND_MAT, { mipVariance: FC_MIPVAR.forFamily('travertine_stone'), roughStrength: 1.0 });
  }

  const GROUND = new THREE.Mesh(groundGeo, GROUND_MAT);
  GROUND.name = 'fc_ria_sound_ground';
  GROUND.receiveShadow = true;
  scene.add(GROUND);
  GROUND.updateMatrixWorld(true);
  if (typeof KDRAWN !== 'undefined') KDRAWN.add(KDRAWN.fromObject(GROUND));

  /* Far-field reshaped 3-river Ria Sound & East Bluff (Suudme-Kuluuna) silhouette */
  const farH = function (x, z) {
    const r = Math.hypot(x, z);
    if (r < FC_SR * 0.96) return terrainH(x, z);
    const nBluff = z < -1450 ? 155 * Math.min(1, (-z - 1450) / 1800) : 0;
    const eBluff = (x > 4600 && z > -2600 && z < 3400) ? 118 * Math.min(1, (x - 4600) / 2200) : 0;
    return Math.max(-46.0, nBluff + eBluff - 30.0 * Math.min(1, (r - FC_SR) / 1800));
  };

  let GROUND_HZ = null;
  window._horizon = { baked: false, mats: 0 };
  if (typeof KHORIZON !== 'undefined' && KHORIZON.bake) {
    try {
      const S0 = FC_SR * 1.02;
      GROUND_HZ = KHORIZON.bake({
        box: [-S0, -S0, S0, S0],
        n: 96,
        h: terrainH,
        far: { h: farH, box: [-18000, -18000, 18000, 18000], n: 80 }
      });
      if (GROUND_HZ && KHORIZON.shade) {
        KHORIZON.shade(GROUND_MAT, GROUND_HZ);
        window._horizon.baked = true;
      }
    } catch (e) {}
  }

  let FAR_MESH = null;
  if (typeof KFAR !== 'undefined' && KFAR.grid && KFAR.lines && KFAR.geometry) {
    try {
      const S0 = FC_SR * 0.98, cs = 72;
      const cTmp = new THREE.Color(), cBluff = new THREE.Color(0x4c6b48), cCliff = new THREE.Color(0xa89f8c), cSea = new THREE.Color(0x1f444c);
      const G = KFAR.grid({
        lines: KFAR.lines({ cell: cs, inner: S0 + cs, out: 18000, grow: 1.045 }),
        dense: true,
        h: function (x, z) {
          if (Math.abs(x) < S0 && Math.abs(z) < S0) return terrainH(x, z) - 3.5;
          return farH(x, z);
        },
        skip: function (x0, z0, x1, z1) { return x0 > -S0 + 120 && x1 < S0 - 120 && z0 > -S0 + 120 && z1 < S0 - 120; },
        color: function (x, z, y) {
          cTmp.copy(cCliff).lerp(cBluff, Math.max(0, Math.min(1, (y - 38) / 80)));
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
      FAR_MESH.name = 'fc_farfield';
      FAR_MESH.userData.farField = true;
      FAR_MESH.userData.probeSkip = true;
      FAR_MESH.frustumCulled = false;
      scene.add(FAR_MESH);
    } catch (e) {}
  }

  /* 3. Build Grand Megastructure + 30 Neighborhood Platforms + 20 Chinampas + Fleet + Harbour Moles & 9-Avenue Bluff */
  const PLANS = FC_CITY.buildPlans();
  const MEGA_SCENE = FC_SUMERU_DRAW.buildAll(scene, MATS, KTAGS.page, [SUB_CUT_PLANE]);
  const PONTOON_SCENE = FC_PONTOONS_HOISTS.buildAll(scene, MATS, PLANS, KTAGS.page);
  const STREETS_MOLE_SCENE = FC_STREETS_MOLE.buildAll(scene, MATS, PLANS, KTAGS.page);

  /* 4. Multi-Kit Non-Ancient City Instancing (2,698 Lots across 68 Prototypes at v=0 -> ~215 draw calls via DataTexture2DArray!) */
  const cityGroup = new THREE.Group();
  cityGroup.name = 'fc_multikit_city';
  scene.add(cityGroup);

  const ATLAS = (typeof KCITY !== 'undefined' && KCITY.createSharedAtlas)
    ? KCITY.createSharedAtlas({ renderer: renderer, size: 512, maxVramMB: 380, initialCap: 24 })
    : null;

  const protoCache = {};
  const fixtureDoors = [];
  const fixtureWindows = [];

  /* Strip RIK/KLK below-grade skirt boxes (-1.20..+0.02 m) and y=0 bottom caps so building bases never z-fight with decks or plinths */
  function stripBelowGradeFaces(parts) {
    const keptParts = [];
    for (let pi = 0; pi < parts.length; pi++) {
      const g = parts[pi].geo;
      const pos = g && g.attributes && g.attributes.position;
      if (!pos) continue;
      const srcIdx = g.index ? g.index.array : null;
      const nTri = srcIdx ? (srcIdx.length / 3) : (pos.count / 3);
      const outIdx = [];
      for (let t = 0; t < nTri; t++) {
        const i0 = srcIdx ? srcIdx[t * 3]     : (t * 3);
        const i1 = srcIdx ? srcIdx[t * 3 + 1] : (t * 3 + 1);
        const i2 = srcIdx ? srcIdx[t * 3 + 2] : (t * 3 + 2);
        const yMax = Math.max(pos.getY(i0), pos.getY(i1), pos.getY(i2));
        if (yMax <= 0.045) continue;
        outIdx.push(i0, i1, i2);
      }
      if (!outIdx.length) continue;
      g.setIndex(outIdx);
      keptParts.push(parts[pi]);
    }
    return keptParts;
  }

  function applyPlotAO(parts) {
    for (let pi = 0; pi < parts.length; pi++) {
      const g = parts[pi].geo;
      const pos = g.attributes.position, col = g.attributes.color;
      if (!pos || !col) continue;
      for (let i = 0; i < pos.count; i++) {
        const ao = FC_MIPVAR.plotBaseAO(pos.getY(i));
        col.setXYZ(i, col.getX(i) * ao, col.getY(i) * ao, col.getZ(i) * ao);
      }
      col.needsUpdate = true;
    }
  }

  function getMultiKitProto(key, v) {
    const pk = key + '#' + (v | 0);
    if (protoCache[pk] !== undefined) return protoCache[pk];
    const isKl = key.indexOf('kl_') === 0;
    const kitObj = isKl ? (typeof KLK !== 'undefined' ? KLK : null) : (typeof RIK !== 'undefined' ? RIK : null);
    const packName = isKl ? 'kulanewa' : 'ria';
    if (!kitObj || !kitObj.proto) return (protoCache[pk] = null);
    const G = kitObj.proto(key, v | 0);
    if (!G) return (protoCache[pk] = null);
    const flat = KCITY.flattenProto(G, { pack: packName });
    if (!flat) return (protoCache[pk] = null);
    flat.parts = stripBelowGradeFaces(flat.parts);
    applyPlotAO(flat.parts);
    protoCache[pk] = {
      key: key,
      v: v | 0,
      pack: packName,
      parts: flat.parts,
      fixtures: flat.fixtures || null,
      atlasMerged: false
    };
    return protoCache[pk];
  }

  const byProto = {};
  const plinthList = [];
  let constructCount = 0;

  for (let i = 0; i < PLANS.lots.length; i++) {
    const L = PLANS.lots[i];
    KTAGS.page.add({
      id: L.id,
      'class': 'building',
      kind: L.role || 'dwelling',
      key: L.key,
      name: L.key + ' (' + L.district + ')',
      at: [L.x, L.y, L.z],
      ry: L.ry,
      size: [L.w, L.d, L.h],
      tags: {
        culture: L.kit === 'kulanewa' ? 'kulanewa' : 'ria',
        style: L.style,
        wealth: L.wealth,
        district: L.district,
        zone: L.instance,
        types: [L.res ? 'dwelling-multi' : 'civic']
      }
    });

    if (L.instance === 'bluff') {
      const cs4 = FC_CITY.obbCorners(L, 0.25);
      let minG = L.y, maxG = L.y;
      for (let ci = 0; ci < 4; ci++) {
        const gy = terrainH(cs4[ci][0], cs4[ci][1]);
        if (gy < minG) minG = gy;
        if (gy > maxG) maxG = gy;
      }
      const yTop = maxG + 0.30;
      const yBot = minG - 3.2;
      L.y = +yTop.toFixed(2);
      plinthList.push({ x: L.x, y: 0.5 * (yTop + yBot), z: L.z, ry: L.ry, w: L.w + 0.32, h: yTop - yBot, d: L.d + 0.32 });
    }

    const P = getMultiKitProto(L.key, 0);
    if (!P) continue;

    /* Active dockyard / bluff refit sites using KCITY.constructMesh + KCONS.site */
    if (L.instance !== 'pontoons' && constructCount < 2 && (L.role === 'wharf' || L.role === 'granary') &&
        typeof KCITY !== 'undefined' && KCITY.constructMesh) {
      constructCount++;
      const prog = constructCount === 1 ? 0.48 : 0.74;
      const cm = KCITY.constructMesh(P.parts);
      cm.set(prog);
      cm.group.position.set(L.x, L.y, L.z);
      cm.group.rotation.y = L.ry;
      cityGroup.add(cm.group);
      if (typeof KCONS !== 'undefined' && KCONS.site) {
        try {
          const cs = KCONS.site({ w: L.w, d: L.d, h: L.h, bill: { planks: 8, blocks: 8, rope: 4 } });
          cs.set(prog);
          cs.group.position.set(L.x, L.y, L.z);
          cs.group.rotation.y = L.ry;
          cityGroup.add(cs.group);
        } catch (e) {}
      }
      continue;
    }

    const pk = L.key + '#0';
    (byProto[pk] || (byProto[pk] = { P: P, items: [] })).items.push(L);

    if (P.fixtures && fixtureDoors.length < 48) {
      const cs = Math.cos(L.ry), sn = Math.sin(L.ry);
      const doors = P.fixtures.doors || [];
      for (let dIdx = 0; dIdx < doors.length; dIdx++) {
        const q = doors[dIdx];
        fixtureDoors.push({
          x: +(L.x + q.x * cs + q.z * sn).toFixed(2),
          y: +(L.y + q.y).toFixed(2),
          z: +(L.z - q.x * sn + q.z * cs).toFixed(2),
          yaw: +(L.ry + q.yaw).toFixed(3),
          w: q.w, h: q.h == null ? 2.2 : q.h, lotId: L.id
        });
      }
    }
  }

  const instancedSlots = [];
  const _m4 = new THREE.Matrix4(), _q4 = new THREE.Quaternion(), _yAxis = new THREE.Vector3(0, 1, 0), _p3 = new THREE.Vector3(), _s3 = new THREE.Vector3(1, 1, 1);

  let cityMeshesGroup = new THREE.Group();
  cityGroup.add(cityMeshesGroup);

  function markAtlasImaged(parts) {
    if (typeof KMAT === 'undefined' || !KMAT) return;
    if (!KMAT.imaged) KMAT.imaged = [];
    for (let pi = 0; pi < parts.length; pi++) {
      const m = parts[pi].mat;
      if (!m) continue;
      const maps = [m.map, m.normalMap, m.roughnessMap];
      for (let ti = 0; ti < maps.length; ti++) {
        const t = maps[ti];
        const src = t && t.image && (t.image.currentSrc || t.image.src);
        if (src && KMAT.imaged.indexOf(src) === -1) KMAT.imaged.push(src);
      }
    }
  }

  function buildCityInstancedMeshes(tryAtlas) {
    while (cityMeshesGroup.children.length) {
      cityMeshesGroup.remove(cityMeshesGroup.children[0]);
    }
    instancedSlots.length = 0;
    let anyRetry = false;

    Object.keys(byProto).forEach(function (pk) {
      const entry = byProto[pk], P = entry.P, items = entry.items;
      let drawList = P.parts;
      if (tryAtlas && ATLAS && ATLAS.ok) {
        if (!P.cachedAtlasParts) {
          const mRes = ATLAS.merge(P.parts);
          if (mRes.retry) {
            anyRetry = true;
          } else {
            markAtlasImaged(P.parts);
            P.cachedAtlasParts = mRes.meshes.concat(mRes.rest);
            P.atlasMerged = true;
          }
        }
        if (P.cachedAtlasParts) drawList = P.cachedAtlasParts;
      }

      let hasFloating = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].instance === 'pontoons') { hasFloating = true; break; }
      }

      for (let pi = 0; pi < drawList.length; pi++) {
        const part = drawList[pi];
        const im = new THREE.InstancedMesh(part.geo, part.mat, items.length);
        im.frustumCulled = false;
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          _p3.set(it.x, it.y, it.z);
          _q4.setFromAxisAngle(_yAxis, it.ry);
          _m4.compose(_p3, _q4, _s3);
          im.setMatrixAt(i, _m4);
          if (it.instance === 'pontoons') {
            instancedSlots.push({
              mesh: im,
              index: i,
              wardId: it.wardId,
              x: it.x,
              z: it.z,
              ry: it.ry,
              localY: it.localY == null ? 0 : it.localY
            });
          }
        }
        im.instanceMatrix.needsUpdate = true;
        if (!hasFloating && typeof KCITY !== 'undefined' && KCITY.boundedInstanced) {
          KCITY.boundedInstanced(im);
        }
        cityMeshesGroup.add(im);
      }
    });

    if (tryAtlas && ATLAS && ATLAS.ok) ATLAS.flush();
    return !anyRetry;
  }

  let atlasDone = false;
  let hostHold = false;
  if ((window._texPending == null ? 0 : window._texPending) === 0) {
    atlasDone = buildCityInstancedMeshes(true);
  } else {
    window._hostPending = (window._hostPending == null ? 0 : window._hostPending) + 1;
    hostHold = true;
  }

  /* Travertine Bluff Terrace Plinths */
  let bluffPlinthIm = null;
  if (plinthList.length) {
    const pGeo = new THREE.BoxGeometry(1, 1, 1);
    const pIm = new THREE.InstancedMesh(pGeo, MATS.travertineStone, plinthList.length);
    for (let i = 0; i < plinthList.length; i++) {
      const r = plinthList[i];
      _p3.set(r.x, r.y, r.z);
      _q4.setFromAxisAngle(_yAxis, r.ry);
      _s3.set(r.w, r.h, r.d);
      _m4.compose(_p3, _q4, _s3);
      pIm.setMatrixAt(i, _m4);
    }
    pIm.instanceMatrix.needsUpdate = true;
    _s3.set(1, 1, 1);
    if (typeof KCITY !== 'undefined' && KCITY.boundedInstanced) KCITY.boundedInstanced(pIm);
    else pIm.frustumCulled = false;
    pIm.name = 'fc_bluff_plinths';
    cityGroup.add(pIm);
    bluffPlinthIm = pIm;
  }

  /* Bind KCITY.hostFloat so all 30 Neighborhood Pontoons, 20 Chinampa Gardens & 737 Floating Buildings ride the tide! */
  const FLOAT_HOST = KCITY.hostFloat({
    wards: PONTOON_SCENE.allFloatWards,
    links: PLANS.bascules,
    fixedY: PONTOON_SCENE.fixedY,
    wardGroups: PONTOON_SCENE.wardGroups,
    basculeMeshes: PONTOON_SCENE.basculeMeshes,
    instancedSlots: instancedSlots
  });
  FLOAT_HOST.update(FC_TIDE.tideY('lagoon', 0));

  function ensureAtlasBuilt() {
    if (atlasDone) return true;
    if ((window._texPending == null ? 0 : window._texPending) > 0) return false;
    atlasDone = buildCityInstancedMeshes(true);
    if (!cityMeshesGroup.children.length) {
      buildCityInstancedMeshes(false);
      atlasDone = true;
    }
    FLOAT_HOST.update(FC_TIDE.tideY('lagoon', 0));
    if (hostHold) {
      hostHold = false;
      window._hostPending = Math.max(0, (window._hostPending == null ? 1 : window._hostPending) - 1);
    }
    return atlasDone;
  }

  fcTick(function () {
    if (!atlasDone) ensureAtlasBuilt();
  });

  /* 5. Stage 7 KROOMLIGHT Hero Halls (-62 m Submarine Dynamo Control Hall + 4 Surface/Vault Halls + Indexed Furniture) */
  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'fc_hero_interiors';
  scene.add(interiorGroup);

  const furnBatch = (typeof KratorFurniture !== 'undefined' && KratorFurniture.batch)
    ? KratorFurniture.batch({ indexed: true })
    : null;

  for (let i = 0; i < FC_INTERIORS.HALLS.length; i++) {
    const H = FC_INTERIORS.HALLS[i];
    const bx = [H.x - H.w * 0.5, H.y, H.z - H.d * 0.5, H.x + H.w * 0.5, H.y + H.h, H.z + H.d * 0.5];
    const shellGeo = new THREE.BoxGeometry(H.w, H.h, H.d, 4, 3, 4);
    const sp = shellGeo.attributes.position, sn = shellGeo.attributes.normal;
    const scol = new Float32Array(sp.count * 3);
    const dl0 = H.vault ? 0.0 : 0.35;
    const lamp0 = H.vault ? 0.32 : 0.18;

    for (let v = 0; v < sp.count; v++) {
      const wx = H.x + sp.getX(v), wy = H.y + H.h * 0.5 + sp.getY(v), wz = H.z + sp.getZ(v);
      const ao = (typeof KROOMLIGHT !== 'undefined' && KROOMLIGHT.vertexCornerAO)
        ? KROOMLIGHT.vertexCornerAO(wx, wy, wz, -sn.getX(v), -sn.getY(v), -sn.getZ(v), bx, 0.92)
        : 1.0;
      const e = (dl0 + lamp0) * ao;
      scol[v * 3] = Math.min(1, e * (H.id === 'fc.int.dynamo_hall' ? 0.65 : 1.05));
      scol[v * 3 + 1] = Math.min(1, e * 0.95);
      scol[v * 3 + 2] = Math.min(1, e * (H.id === 'fc.int.dynamo_hall' ? 1.15 : 0.78));
    }
    shellGeo.setAttribute('color', new THREE.BufferAttribute(scol, 3));
    const shellMat = new THREE.MeshStandardMaterial({
      color: H.vault ? 0xbfc8cc : 0xe8e0d0,
      vertexColors: true,
      roughness: 0.82,
      envMapIntensity: H.vault ? 0.0 : H.envMapIntensity,
      side: THREE.BackSide
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.position.set(H.x, H.y + H.h * 0.5, H.z);
    shellMesh.name = 'hall_' + H.id;
    interiorGroup.add(shellMesh);

    for (let f = 0; f < H.furniture.length; f++) {
      const F = H.furniture[f];
      const fx = H.x + F.dx, fy = H.y + 0.05, fz = H.z + F.dz;
      let placed = false;
      if (furnBatch && typeof KratorFurniture !== 'undefined' && KratorFurniture.has && KratorFurniture.has(F.key)) {
        try {
          furnBatch.add(F.key, fx, fy, fz, F.ry, 1.0);
          placed = true;
        } catch (e) {}
      }
      if (!placed) {
        const prop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.1), H.vault ? MATS.paktongMetal : MATS.cypressHull);
        prop.position.set(fx, fy + 0.55, fz);
        prop.rotation.y = F.ry;
        interiorGroup.add(prop);
      }
      KTAGS.page.add({
        'class': 'furniture', kind: F.key, key: F.key, name: F.key + ' (' + H.name + ')',
        at: [fx, fy, fz], ry: F.ry, size: [1.6, 1.1, 1.1],
        tags: { culture: 'kulanewa', room: H.id, setting: 'indoor' }
      });
    }
  }
  if (furnBatch && furnBatch.flush) {
    try {
      const fb = furnBatch.flush();
      if (fb) interiorGroup.add(fb);
    } catch (e) {}
  }

  /* 6. Double Delta & Ria Sound Flora (biomes/doubledelta read in place: < +38 m intertidal byssus/sponges + >= +38 m bluff trees!) */
  let biomeOut = null;
  if (typeof DOUBLEDELTA !== 'undefined' && DOUBLEDELTA.build) {
    try {
      biomeOut = DOUBLEDELTA.build({
        R: 2350,
        quality: PQ.has('q') ? +PQ.get('q') : 0.55,
        minWoodyY: FC_SITE.WOODY_TRIM_Y,
        psu: PSU_AT,
        silica: SILICA_AT,
        ecotone: ECOTONE_AT,
        lag: L.LAG,
        peat: L.PEAT,
        wrack: L.WRACK,
        amber: L.AMBER,
        bitumen: L.BITUMEN,
        blueClay: L.BLUECLAY,
        mire: L.MIRE,
        reserve: SITE.settlementReserve
      });
      /* Western Headland Sacred Timber-Bamboo Sanctuary (280 apex-crowned culms at y >= +120 m, clear of Bluff Metropolis) */
      {
        const prevKit = BIO.kit('doubledelta');
        try {
          const qZero = BIO.fn.qEuler(0, 0, 0);
          const cCulm = new THREE.Color(0x588844);
          const cLeaf = new THREE.Color(0x4e7e3e);
          for (let gx = 0; gx < 20; gx++) {
            for (let gz = 0; gz < 14; gz++) {
              const px = -1045 + gx * 5.8;
              const pz = -1680 + gz * 5.4;
              const py0 = terrainH(px, pz) - 0.15;
              const hCulm = 7.2 + ((gx * 7 + gz * 3) % 5) * 0.35;
              BIO.put('ddbluffculm', [px, py0, pz], qZero, [1.0, hCulm, 1.0], cCulm);
              BIO.put('ddbluffleaf', [px + 0.11, py0 + hCulm - 0.02, pz], qZero, [2.2, 2.4, 2.2], cLeaf);
            }
          }
        } finally {
          BIO.kit(prevKit);
        }
      }
      const b = BIO.bake();
      window._instances = b.inst;
      window._bakeCalls = b.calls;
      if (BIO.impostorLook) BIO.impostorLook({ gain: 1.38, wrap: 0.85 });
      if (BIO.bakeImpostors) BIO.bakeImpostors(renderer, { wait: 160 });
    } catch (e) {
      reportErr('doubledelta flora: ' + (e.stack || e));
    }
  }

  /* 7. Citizen Crowds (3,200+) & Economy (44,000 pop + Chinampa Harvest) */
  FC_CHARS.init(scene, PLANS, PONTOON_SCENE.wardGroups);
  const SIM_OUT = FC_SIM.installOnSim(PLANS);

  if (GROUND_HZ && typeof KHORIZON !== 'undefined' && KHORIZON.shadeScene) {
    try {
      window._horizon.mats = KHORIZON.shadeScene(scene, GROUND_HZ, {
        filter: function (m) { return !m.userData.farField && m !== GROUND_MAT && !m.userData.atlas; }
      });
    } catch (e) {}
  }

  /* KSHADOW strictly off at load (owner rule 2026-11-03) */
  window._shadow = 'off';
  const attachShadow = function (ui) {
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
    } catch (e) {
      return null;
    }
  };
  if (/[?&]shadow=1(&|$)/.test(location.search)) attachShadow(null);

  function setSubmarineCut(on) {
    FC_STATE.cutSubmarine = !!on;
    SUB_CUT_PLANE.constant = FC_STATE.cutSubmarine ? (FC_SITE.WEIR_CZ + 2.0) : 1e6;
  }

  /* Automated world-space upward-facing (ny > 0.75) triangle z-fight audit across all static & instanced infrastructure,
     street, plaza, pontoon, chinampa, bascule, dyke, sea-ring, arcology, mole & bluff plinth meshes */
  function auditSceneZFights(opts) {
    opts = opts || {};
    scene.updateMatrixWorld(true);
    const tris = [];
    const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();
    const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), vn = new THREE.Vector3();
    const mInst = new THREE.Matrix4(), mWorld = new THREE.Matrix4();

    function polyOffsetBias(mat) {
      if (!mat || !mat.polygonOffset) return 0;
      const f = mat.polygonOffsetFactor == null ? 0 : mat.polygonOffsetFactor;
      const u = mat.polygonOffsetUnits == null ? 0 : mat.polygonOffsetUnits;
      return f + u;
    }

    function pushWorldTri(ax, ay, az, bx, by, bz, cx, cy, cz, bias, tag) {
      const yMax = Math.max(ay, by, cy);
      if (yMax < -4.0) return;
      e1.set(bx - ax, by - ay, bz - az);
      e2.set(cx - ax, cy - ay, cz - az);
      vn.crossVectors(e1, e2);
      const len = vn.length();
      if (len < 1e-5) return;
      const ny = vn.y / len;
      if (ny <= 0.75) return;
      const areaXZ = 0.5 * Math.abs((bx - ax) * (cz - az) - (bz - az) * (cx - ax));
      if (areaXZ < 0.25) return;
      const nx = vn.x / len, nz = vn.z / len;
      /* Ensure CCW orientation in (x, z) where signedArea2D > 0 */
      const s2 = (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
      const p2d = s2 > 0
        ? [[ax, az], [bx, bz], [cx, cz]]
        : [[ax, az], [cx, cz], [bx, bz]];
      tris.push({
        pts: p2d,
        x0: Math.min(ax, bx, cx), x1: Math.max(ax, bx, cx),
        z0: Math.min(az, bz, cz), z1: Math.max(az, bz, cz),
        yMin: Math.min(ay, by, cy), yMax: yMax,
        ox: ax, oy: ay, oz: az,
        nx: nx, ny: ny, nz: nz,
        bias: bias,
        tag: tag
      });
    }

    function collectFromMesh(o, groupTag) {
      if (!o || !o.visible || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
      if (o.userData && o.userData.isVessel) return;
      const g = o.geometry;
      const pA = g.attributes.position;
      const idx = g.index ? g.index.array : null;
      const nTri = idx ? (idx.length / 3) : (pA.count / 3);
      const bias = polyOffsetBias(o.material);
      const label = groupTag + ':' + (o.name || o.type);

      if (o.isInstancedMesh) {
        const cnt = o.count;
        for (let inst = 0; inst < cnt; inst++) {
          o.getMatrixAt(inst, mInst);
          mWorld.multiplyMatrices(o.matrixWorld, mInst);
          for (let t = 0; t < nTri; t++) {
            const i0 = idx ? idx[t * 3] : (t * 3);
            const i1 = idx ? idx[t * 3 + 1] : (t * 3 + 1);
            const i2 = idx ? idx[t * 3 + 2] : (t * 3 + 2);
            va.fromBufferAttribute(pA, i0).applyMatrix4(mWorld);
            vb.fromBufferAttribute(pA, i1).applyMatrix4(mWorld);
            vc.fromBufferAttribute(pA, i2).applyMatrix4(mWorld);
            pushWorldTri(va.x, va.y, va.z, vb.x, vb.y, vb.z, vc.x, vc.y, vc.z, bias, label + '#' + inst);
          }
        }
      } else if (o.isMesh) {
        mWorld.copy(o.matrixWorld);
        for (let t = 0; t < nTri; t++) {
          const i0 = idx ? idx[t * 3] : (t * 3);
          const i1 = idx ? idx[t * 3 + 1] : (t * 3 + 1);
          const i2 = idx ? idx[t * 3 + 2] : (t * 3 + 2);
          va.fromBufferAttribute(pA, i0).applyMatrix4(mWorld);
          vb.fromBufferAttribute(pA, i1).applyMatrix4(mWorld);
          vc.fromBufferAttribute(pA, i2).applyMatrix4(mWorld);
          pushWorldTri(va.x, va.y, va.z, vb.x, vb.y, vb.z, vc.x, vc.y, vc.z, bias, label);
        }
      }
    }

    if (MEGA_SCENE && MEGA_SCENE.root) {
      MEGA_SCENE.root.traverse(function (o) { collectFromMesh(o, 'mega'); });
    }
    if (PONTOON_SCENE && PONTOON_SCENE.root) {
      PONTOON_SCENE.root.traverse(function (o) { collectFromMesh(o, 'pontoon'); });
    }
    if (STREETS_MOLE_SCENE && STREETS_MOLE_SCENE.root) {
      STREETS_MOLE_SCENE.root.traverse(function (o) { collectFromMesh(o, 'streets'); });
    }
    if (bluffPlinthIm) {
      collectFromMesh(bluffPlinthIm, 'plinth');
    }

    if (opts.injectFault) {
      pushWorldTri(10, 22.00, 170, 20, 22.00, 180, 20, 22.00, 170, 0, 'faultA');
      pushWorldTri(12, 22.05, 172, 22, 22.05, 182, 22, 22.05, 172, 0, 'faultB');
    }

    function clipPolyOverlap(P1, P2) {
      let poly = P1.slice();
      for (let e = 0; e < P2.length; e++) {
        const A = P2[e], B = P2[(e + 1) % P2.length];
        const ex = B[0] - A[0], ez = B[1] - A[1];
        const inp = poly;
        poly = [];
        if (!inp.length) return null;
        for (let i = 0; i < inp.length; i++) {
          const S = inp[i], E = inp[(i + 1) % inp.length];
          const sCross = ex * (S[1] - A[1]) - ez * (S[0] - A[0]);
          const eCross = ex * (E[1] - A[1]) - ez * (E[0] - A[0]);
          const sIn = sCross >= -1e-6, eIn = eCross >= -1e-6;
          if (eIn) {
            if (!sIn) {
              const denom = sCross - eCross;
              const t = Math.abs(denom) > 1e-9 ? sCross / denom : 0.5;
              poly.push([S[0] + (E[0] - S[0]) * t, S[1] + (E[1] - S[1]) * t]);
            }
            poly.push(E);
          } else if (sIn) {
            const denom = sCross - eCross;
            const t = Math.abs(denom) > 1e-9 ? sCross / denom : 0.5;
            poly.push([S[0] + (E[0] - S[0]) * t, S[1] + (E[1] - S[1]) * t]);
          }
        }
      }
      if (poly.length < 3) return null;
      let area2 = 0, cx = 0, cz = 0;
      for (let i = 0; i < poly.length; i++) {
        const p = poly[i], q = poly[(i + 1) % poly.length];
        const cr = p[0] * q[1] - q[0] * p[1];
        area2 += cr;
        cx += (p[0] + q[0]) * cr;
        cz += (p[1] + q[1]) * cr;
      }
      const area = 0.5 * Math.abs(area2);
      if (area < 0.35) return null;
      return { area: area, cx: cx / (3 * area2), cz: cz / (3 * area2) };
    }

    const cell = 16.0;
    const grid = new Map();
    for (let i = 0; i < tris.length; i++) {
      const T = tris[i];
      const gx0 = Math.floor(T.x0 / cell), gx1 = Math.floor(T.x1 / cell);
      const gz0 = Math.floor(T.z0 / cell), gz1 = Math.floor(T.z1 / cell);
      for (let gx = gx0; gx <= gx1; gx++) {
        for (let gz = gz0; gz <= gz1; gz++) {
          const key = gx + ',' + gz;
          let arr = grid.get(key);
          if (!arr) { arr = []; grid.set(key, arr); }
          arr.push(i);
        }
      }
    }

    const pairSeen = new Set();
    const conflicts = [];
    grid.forEach(function (arr) {
      const n = arr.length;
      for (let a = 0; a < n; a++) {
        const i = arr[a], A = tris[i];
        for (let b = a + 1; b < n; b++) {
          const j = arr[b];
          const pk = i < j ? (i * 131072 + j) : (j * 131072 + i);
          if (pairSeen.has(pk)) continue;
          pairSeen.add(pk);
          const B = tris[j];
          if (A.x1 - B.x0 < 0.15 || B.x1 - A.x0 < 0.15 || A.z1 - B.z0 < 0.15 || B.z1 - A.z0 < 0.15) continue;
          if (A.yMin - B.yMax > 0.18 || B.yMin - A.yMax > 0.18) continue;
          if (Math.abs(A.bias - B.bias) >= 2.0) continue;
          const dotN = A.nx * B.nx + A.ny * B.ny + A.nz * B.nz;
          if (dotN < 0.96) continue;
          const ov = clipPolyOverlap(A.pts, B.pts);
          if (!ov) continue;
          const yA = A.oy - (A.nx * (ov.cx - A.ox) + A.nz * (ov.cz - A.oz)) / A.ny;
          const yB = B.oy - (B.nx * (ov.cx - B.ox) + B.nz * (ov.cz - B.oz)) / B.ny;
          const dy = Math.abs(yA - yB);
          if (dy < 0.15) {
            conflicts.push({
              a: A.tag,
              b: B.tag,
              x: +ov.cx.toFixed(1),
              z: +ov.cz.toFixed(1),
              yA: +yA.toFixed(3),
              yB: +yB.toFixed(3),
              dy: +dy.toFixed(3),
              area: +ov.area.toFixed(2)
            });
            if (conflicts.length >= 25) return;
          }
        }
      }
    });

    return {
      ok: conflicts.length === 0 && tris.length >= 1000,
      scannedTris: tris.length,
      conflicts: conflicts.length,
      sample: conflicts.slice(0, 6)
    };
  }

  window._buildMs = Math.round(performance.now() - t0);

  return {
    MATS: MATS,
    GROUND: GROUND,
    FAR_MESH: FAR_MESH,
    PLANS: PLANS,
    MEGA_SCENE: MEGA_SCENE,
    PONTOON_SCENE: PONTOON_SCENE,
    STREETS_MOLE_SCENE: STREETS_MOLE_SCENE,
    FLOAT_HOST: FLOAT_HOST,
    ATLAS: ATLAS,
    HAZARD_RECS: HAZARD_RECS,
    SIM_OUT: SIM_OUT,
    fixtureDoors: fixtureDoors,
    fixtureWindows: fixtureWindows,
    biomeOut: biomeOut,
    attachShadow: attachShadow,
    setSubmarineCut: setSubmarineCut,
    ensureAtlasBuilt: ensureAtlasBuilt,
    auditSceneZFights: auditSceneZFights
  };
})();
