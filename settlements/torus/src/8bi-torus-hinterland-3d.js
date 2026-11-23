// ================================================================= TORUS — 8bi: Soleri-Farm Hinterlands (2/3 Ruined, 1/3 Working) & KTRANSIT ([draw])
// 1. Imports and builds all 235 Soleri agricultural structures (142 hex Growing Pods across 12 honeycomb arrays — 8 ruined [2/3] & 4 working
//    Rinkvolk farms/orchards [1/3] — plus 12 Vault Houses, 10 Growing Stacks, 4 Hub Halls, 4 Umbrella Markets, 4 Water Towers, 56 3-Arch
//    Aqueduct Modules, and 3 Pump Houses) using the genuine kits/metropolis Soleri Farm builders (MP.hero + MP.ruinDesign + KRUBBLE debris).
// 2. Grounds every Soleri plinth cleanly into valley slopes, dresses working farm arrays with Rinkvolk irrigation cisterns & patched roofs,
//    and renders the decayed KTRANSIT elevated highway, commuter monorails, harvest cargo rail loops, and wrecked trains with 100% PBR textures.

const TORUS_HINTERLAND_STATS = {
  soleriTotal: 0,
  soleriRuined: 0,
  soleriReclaimed: 0,
  podTotal: 0,
  podRuined: 0,
  podWorking: 0,
  transitGroups: 0
};

const TORUS_HINTERLAND_GROUP = (function buildTorusHinterland3D() {
  const root = new THREE.Group();
  root.name = 'torus_hinterland_root';
  scene.add(root);

  const hl = TORUS_PLAN.hinterland;
  if (!hl) return root;

  const fm = TORUS_DRAW.getFurnDetailMaps();
  const fur = TORUS_DRAW.getFurrowMaps();
  const m4 = new THREE.Matrix4();
  const qTmp = new THREE.Quaternion();
  const eulTmp = new THREE.Euler(0, 0, 0, 'YXZ');
  const oneV = new THREE.Vector3(1, 1, 1);

  // 1. Bind 100% PBR textures onto all Metropolis Soleri material slots (including hydroponic green beds & ruin darks)
  if (typeof MP !== 'undefined' && MP && typeof MP.mats === 'function') {
    const mpMats = MP.mats();
    const fallbackSrc = (typeof MAT !== 'undefined' && MAT) ? {
      white: MAT.white,
      panel: MAT.white,
      concrete: MAT.concrete,
      slab: MAT.concrete,
      relief: MAT.concreteR || MAT.concrete,
      rubble: MAT.rubbleK || MAT.concreteR,
      adobe: MAT.brick || MAT.concrete,
      baroque: MAT.white || MAT.concrete,
      bronze: MAT.verdigris || MAT.rust
    } : {};
    Object.keys(mpMats).forEach(function (k) {
      const m = mpMats[k];
      if (!m) return;
      m.side = THREE.DoubleSide;
      if (k === 'green') {
        m.map = fur.map;
        m.roughnessMap = fur.roughnessMap;
        m.bumpMap = fur.roughnessMap;
        m.bumpScale = 0.03;
        m.needsUpdate = true;
      } else if (!m.map && fallbackSrc[k] && fallbackSrc[k].map) {
        m.map = fallbackSrc[k].map;
        if (fallbackSrc[k].normalMap) m.normalMap = fallbackSrc[k].normalMap;
        if (fallbackSrc[k].roughnessMap) m.roughnessMap = fallbackSrc[k].roughnessMap;
        m.needsUpdate = true;
      } else if (!m.map && !m.transparent) {
        m.map = fm.map;
        if (m.roughness !== undefined && !m.roughnessMap) m.roughnessMap = fm.roughnessMap;
        m.needsUpdate = true;
      }
    });
    if (MP.doorGlass && !MP.doorGlass.map) {
      MP.doorGlass.map = fm.map;
      MP.doorGlass.roughnessMap = fm.roughnessMap;
      MP.doorGlass.side = THREE.DoubleSide;
      MP.doorGlass.needsUpdate = true;
    }
  }

  // 2. Build cached Metropolis Soleri Farm hero prototypes across all 8 families & ruin states
  const solList = hl.soleriStructures || [];
  const mpProtos = new Map();
  const mpPlacements = [];
  const skirtRuinGeos = [], skirtCleanGeos = [], verdGeos = [], timberGeos = [], rustGeos = [], bronzeGeos = [], glowGeos = [];
  const ruinedPods = [], workingPods = [];

  function ensureSoleriProto(family, solState) {
    const key = family + '|' + solState;
    if (mpProtos.has(key)) return key;
    if (typeof MP !== 'undefined' && MP && typeof MP.hero === 'function') {
      try {
        const grp = MP.hero(family, solState, false);
        if (grp) {
          // Ensure MP.doorGlass or any dynamic child material created during MP.hero also carries PBR maps
          grp.traverse(function (o) {
            if (!o.isMesh || !o.material) return;
            o.material.side = THREE.DoubleSide;
            if (!o.material.map && !o.material.transparent) {
              o.material.map = fm.map;
              if (o.material.roughness !== undefined && !o.material.roughnessMap) o.material.roughnessMap = fm.roughnessMap;
              o.material.needsUpdate = true;
            }
          });
          // Merge each prototype's parts by material ONCE so 235 structures share ~16 compact prototype geometries via InstancedMesh!
          const parts = TORUS_DRAW.extractProtoParts(grp);
          const byMat = new Map();
          for (let pi = 0; pi < parts.length; pi++) {
            const pt = parts[pi];
            let list = byMat.get(pt.mat);
            if (!list) { list = []; byMat.set(pt.mat, list); }
            list.push(pt.geo);
          }
          const mergedParts = [];
          byMat.forEach(function (geos, mat) {
            const mg = TORUS_DRAW.mergeGeoList(geos);
            if (!mg) return;
            const welded = (typeof BIO !== 'undefined' && BIO && BIO.weldGeo) ? BIO.weldGeo(mg) : mg;
            welded.computeBoundingSphere();
            mergedParts.push({ geo: welded, mat: mat });
          });
          mpProtos.set(key, mergedParts);
          return key;
        }
      } catch (e) {
        if (typeof ancReportErr === 'function') {
          ancReportErr('MP.hero(' + family + ',' + solState + '): ' + (e.stack == null ? e : e.stack));
        }
      }
    }
    return null;
  }

  for (let i = 0; i < solList.length; i++) {
    const sf = solList[i];
    const st = sf.soleriState || 'broken';
    const rec = !!sf.reclaimedByTenders;
    const c = Math.cos(sf.ry), s = Math.sin(sf.ry);

    // Sample terrain across structure footprint so sloped valley sites get a solid battered concrete foundation skirt (zero floating!)
    const hw = 0.44 * sf.w, hd = 0.44 * sf.d;
    let yMin = sf.y, yMax = sf.y;
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sz = -1; sz <= 1; sz += 2) {
        const cx = sf.x + sx * hw * c + sz * hd * s;
        const cz = sf.z - sx * hw * s + sz * hd * c;
        const gy = TORUS.groundAt(cx, cz);
        if (gy < yMin) yMin = gy;
        if (gy > yMax) yMax = gy;
      }
    }
    const yPlace = +(0.65 * yMax + 0.35 * sf.y).toFixed(2);
    const skirtTop = yPlace + 0.12;
    const skirtBot = yMin - 1.4;
    const skirtH = Math.max(0.8, skirtTop - skirtBot);
    const skirtBucket = rec ? skirtCleanGeos : skirtRuinGeos;

    if (sf.family === 'pod') {
      m4.makeRotationY(sf.ry).setPosition(sf.x, skirtBot + 0.5 * skirtH, sf.z);
      skirtBucket.push(TORUS_DRAW.bakeGeo(new THREE.CylinderGeometry(25.8, 26.8, skirtH, 6), m4, false, 5.0));
    } else if (sf.family === 'hall' || sf.family === 'market' || sf.family === 'watertower' || sf.family === 'pumphouse') {
      const rSkirt = 0.46 * Math.min(sf.w, sf.d);
      m4.makeRotationY(sf.ry).setPosition(sf.x, skirtBot + 0.5 * skirtH, sf.z);
      skirtBucket.push(TORUS_DRAW.bakeGeo(new THREE.CylinderGeometry(rSkirt, rSkirt + 1.0, skirtH, 12), m4, false, 5.0));
    } else if (sf.family === 'aqueduct') {
      // Ground each of the 4 aqueduct pier positions individually so arches stay open!
      for (let pk = 0; pk <= 3; pk++) {
        if (st === 'fallen' && pk >= 2) continue;
        const lx = -33.0 + pk * 22.0;
        const px = sf.x + lx * c, pz = sf.z - lx * s;
        const pGy = TORUS.groundAt(px, pz);
        const pH = Math.max(1.2, (yPlace + 0.4) - (pGy - 1.6));
        m4.makeRotationY(sf.ry).setPosition(px, (pGy - 1.6) + 0.5 * pH, pz);
        skirtBucket.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(pk === 0 || pk === 3 ? 2.8 : 5.0, pH, 6.2), m4, false, 4.0));
      }
    } else {
      m4.makeRotationY(sf.ry).setPosition(sf.x, skirtBot + 0.5 * skirtH, sf.z);
      skirtBucket.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(sf.w * 0.92, skirtH, sf.d * 0.90), m4, false, 5.0));
    }

    const pKey = ensureSoleriProto(sf.family, st);
    if (pKey) {
      mpPlacements.push({
        protoKey: pKey,
        x: sf.x,
        y: yPlace,
        z: sf.z,
        ry: sf.ry,
        scale: 1.0
      });
    }

    // Track pods for 8bl-torus-flora.js (overgrown vine mats on ruined 2/3 pods; thriving crops/orchard trees around working 1/3 pods!)
    if (sf.family === 'pod') {
      TORUS_HINTERLAND_STATS.podTotal++;
      const isWorkPod = !!(sf.reclaimedByTenders || (sf.arrayMode && sf.arrayMode !== 'ruined'));
      const cTheme = sf.cropId === 'sky-fruitvine' ? 'vineyard' : (sf.arrayMode === 'working_orchard' ? 'orchard' : (sf.cropId === 'dust-lentil' ? 'irrigated' : 'grain'));
      const podRec = {
        id: sf.id,
        x: sf.x,
        y: yPlace,
        z: sf.z,
        ry: sf.ry,
        state: st,
        workingFarm: isWorkPod,
        cropTheme: cTheme
      };
      if (isWorkPod) {
        TORUS_HINTERLAND_STATS.podWorking++;
        workingPods.push(podRec);
      } else {
        TORUS_HINTERLAND_STATS.podRuined++;
        ruinedPods.push(podRec);
      }
    }

    // Dress working Rinkvolk Soleri pods & reclaimed Tenders outposts with patched verdigris roofs, gravity cisterns, timber pergolas & lanterns
    if (rec) {
      TORUS_HINTERLAND_STATS.soleriReclaimed++;
      // External Rinkvolk salvaged verdigris header cistern on timber trestle + copper irrigation pipe + warm work lantern
      const offX = sf.family === 'aqueduct' ? 0 : (0.54 * sf.w + 3.4);
      const offZ = sf.family === 'aqueduct' ? 5.6 : 4.2;
      const tx = sf.x + offX * c + offZ * s;
      const tz = sf.z - offX * s + offZ * c;
      const tGy = TORUS.groundAt(tx, tz);

      if (sf.family === 'pod' || sf.family === 'vault' || sf.family === 'hall' || sf.family === 'market') {
        m4.makeRotationY(sf.ry).setPosition(tx, tGy + 1.1, tz);
        timberGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(3.8, 2.2, 3.8), m4, false, 3.0));
        m4.makeRotationY(sf.ry).setPosition(tx, tGy + 4.1, tz);
        verdGeos.push(TORUS_DRAW.bakeGeo(new THREE.CylinderGeometry(1.75, 1.85, 3.8, 12), m4, false, 3.0));
        m4.makeRotationY(sf.ry).setPosition(tx, tGy + 6.3, tz);
        bronzeGeos.push(TORUS_DRAW.bakeGeo(new THREE.ConeGeometry(1.9, 1.1, 12), m4, false, 2.5));

        // Timber harvest sorting pergola & warm lantern beside the pod's SE entrance
        const px = sf.x - (0.52 * sf.w + 2.8) * c + 5.0 * s;
        const pz = sf.z + (0.52 * sf.w + 2.8) * s + 5.0 * c;
        const pGy = TORUS.groundAt(px, pz);
        eulTmp.set(0.10, sf.ry, 0);
        qTmp.setFromEuler(eulTmp);
        m4.compose(new THREE.Vector3(px, pGy + 3.1, pz), qTmp, oneV);
        rustGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(6.4, 0.22, 4.6), m4, false, 3.0));
        for (let sx = -1; sx <= 1; sx += 2) {
          for (let sz = -1; sz <= 1; sz += 2) {
            const postX = px + sx * 2.8 * c + sz * 1.9 * s;
            const postZ = pz - sx * 2.8 * s + sz * 1.9 * c;
            m4.makeRotationY(sf.ry).setPosition(postX, pGy + 1.55, postZ);
            timberGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(0.26, 3.1, 0.26), m4, false, 2.5));
          }
        }
        m4.makeRotationY(sf.ry).setPosition(px, pGy + 2.75, pz);
        glowGeos.push(TORUS_DRAW.bakeGeo(new THREE.BoxGeometry(1.2, 0.45, 0.45), m4, false, 2.0));

        // If a working pod is in 'gutted' state (rehabilitated frame), cap its upper crown with salvaged Rinkvolk verdigris & bronze panels
        if (sf.family === 'pod' && st === 'gutted') {
          const gDome = new THREE.SphereGeometry(15.5, 6, 5, 0, Math.PI * 2, 0, 0.36 * Math.PI);
          gDome.scale(1, 0.68, 1);
          m4.makeRotationY(sf.ry).setPosition(sf.x, yPlace + 14.8, sf.z);
          verdGeos.push(TORUS_DRAW.bakeGeo(gDome, m4, false, 4.0));
        }
      }
    } else {
      TORUS_HINTERLAND_STATS.soleriRuined++;
    }
    TORUS_HINTERLAND_STATS.soleriTotal++;
  }

  // Instance all 235 Metropolis Soleri hero structures by (protoKey, material) — full hero geometry at <18 MB GPU RAM!
  if (mpPlacements.length > 0) {
    const byProto = new Map();
    for (let i = 0; i < mpPlacements.length; i++) {
      const pl = mpPlacements[i];
      let arr = byProto.get(pl.protoKey);
      if (!arr) { arr = []; byProto.set(pl.protoKey, arr); }
      arr.push(pl);
    }
    const posV = new THREE.Vector3();
    byProto.forEach(function (pls, pKey) {
      const parts = mpProtos.get(pKey);
      if (!parts || !parts.length) return;
      for (let j = 0; j < parts.length; j++) {
        const pt = parts[j];
        const gClone = pt.geo.clone();
        gClone.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 20, 0), 3600);
        const im = new THREE.InstancedMesh(gClone, pt.mat, pls.length);
        for (let k = 0; k < pls.length; k++) {
          const pl = pls[k];
          eulTmp.set(0, pl.ry, 0);
          qTmp.setFromEuler(eulTmp);
          posV.set(pl.x, pl.y, pl.z);
          m4.compose(posV, qTmp, oneV);
          im.setMatrixAt(k, m4);
        }
        im.instanceMatrix.needsUpdate = true;
        im.frustumCulled = false;
        im.name = 'torus_soleri_inst_' + pKey + '_' + j;
        root.add(im);
      }
    });
  }

  function addSolBatch(list, mat, name) {
    if (!list.length) return;
    const m = new THREE.Mesh(TORUS_DRAW.mergeGeoList(list), mat);
    m.name = name;
    root.add(m);
  }
  addSolBatch(skirtCleanGeos, TORUS_DRAW.MATS.soleriWall, 'torus_soleri_plinth_clean');
  addSolBatch(skirtRuinGeos, TORUS_DRAW.MATS.soleriRuined, 'torus_soleri_plinth_ruin');
  addSolBatch(verdGeos, TORUS_DRAW.MATS.verdigris, 'torus_soleri_working_tanks');
  addSolBatch(timberGeos, TORUS_DRAW.MATS.timber, 'torus_soleri_working_timber');
  addSolBatch(rustGeos, TORUS_DRAW.MATS.rustPlate, 'torus_soleri_working_roofs');
  addSolBatch(bronzeGeos, TORUS_DRAW.MATS.bronze, 'torus_soleri_working_fittings');
  addSolBatch(glowGeos, TORUS_DRAW.MATS.warmGlow, 'torus_soleri_working_lanterns');

  // 3. Mostly Decayed KTRANSIT Network (Highway, Monorails, Cargo Rails, Trains) + 100% PBR Texture Pass
  if (typeof KTRANSIT !== 'undefined' && KTRANSIT.draw && hl.transit) {
    const tr = hl.transit;
    const vehOpt = typeof KratorVehicles !== 'undefined' ? { vehicles: KratorVehicles } : {};
    const transitRoot = new THREE.Group();
    transitRoot.name = 'torus_ktransit_network';
    try {
      if (tr.highway) {
        transitRoot.add(KTRANSIT.draw.highway(tr.highway, vehOpt));
        TORUS_HINTERLAND_STATS.transitGroups++;
      }
      const rails = (tr.elevatedRails || []).concat(tr.cargoRails || []);
      for (let r = 0; r < rails.length; r++) {
        transitRoot.add(KTRANSIT.draw.rail(rails[r], {}));
        TORUS_HINTERLAND_STATS.transitGroups++;
      }
      const trains = tr.trains || [];
      for (let t = 0; t < trains.length; t++) {
        transitRoot.add(KTRANSIT.draw.train(trains[t], {}));
        TORUS_HINTERLAND_STATS.transitGroups++;
      }
    } catch (e) {
      if (typeof ancReportErr === 'function') ancReportErr('KTRANSIT.draw: ' + (e.stack == null ? e : e.stack));
    }
    transitRoot.traverse(function (o) {
      if (!o.isMesh || !o.geometry) return;
      if (!o.geometry.attributes.uv && o.geometry.attributes.position) {
        if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
        TORUS_DRAW.addTriplanarUvs(o.geometry, 3.5);
      }
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (let k = 0; k < mats.length; k++) {
        const mat = mats[k];
        if (!mat) continue;
        mat.side = THREE.DoubleSide;
        if (!mat.map && !mat.transparent) {
          mat.map = fm.map;
          if (mat.roughness !== undefined && !mat.roughnessMap) mat.roughnessMap = fm.roughnessMap;
          mat.needsUpdate = true;
        }
      }
    });
    root.add(transitRoot);
  }

  root.userData.ruinedPods = ruinedPods;
  root.userData.workingPods = workingPods;
  return root;
})();
