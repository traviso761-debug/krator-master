// ================================================================= FLOATING CITY — Ancient Sumeru-Noahbabel Megastructure Draw [web]
// Draws the 5 Ancient megastructure ensembles from FC_MEGA.plan(), sampling all 8 bespoke library materials in MATS,
// registering walkable decks on KWALK, miter-lock gates on KDOOR, and ruined bays/pods/scar-blocks on KRUINS.watch.
const FC_SUMERU_DRAW = (function () {
  'use strict';

  function uvScaleBox(w, h, d, tileM) {
    const g = new THREE.BoxGeometry(w, h, d);
    const uv = g.attributes.uv, n = g.attributes.normal, p = g.attributes.position;
    const sc = 1.0 / (tileM == null ? 6.0 : tileM);
    for (let i = 0; i < uv.count; i++) {
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (ay > 0.5) uv.setXY(i, x * sc, z * sc);
      else if (ax > 0.5) uv.setXY(i, z * sc, y * sc);
      else uv.setXY(i, x * sc, y * sc);
    }
    return g;
  }

  function uvScaleCyl(rTop, rBot, h, segs, tileM) {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, segs, 1, false);
    const uv = g.attributes.uv;
    const uRep = Math.max(1, Math.round((2 * Math.PI * 0.5 * (rTop + rBot)) / (tileM == null ? 6.0 : tileM)));
    const vRep = Math.max(1, h / (tileM == null ? 6.0 : tileM));
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, uv.getX(i) * uRep, uv.getY(i) * vRep);
    }
    return g;
  }

  function mergeStaticGroup(grp, keepSet) {
    grp.updateMatrixWorld(true);
    const invRoot = new THREE.Matrix4().copy(grp.matrixWorld).invert();
    const buckets = {};
    const toRemove = [];
    for (let c = 0; c < grp.children.length; c++) {
      const m = grp.children[c];
      if (!m.isMesh || (keepSet && keepSet.has(m)) || !m.geometry || !m.material || Array.isArray(m.material)) continue;
      const uid = m.material.uuid;
      (buckets[uid] || (buckets[uid] = { mat: m.material, list: [] })).list.push(m);
      toRemove.push(m);
    }
    for (let i = 0; i < toRemove.length; i++) grp.remove(toRemove[i]);
    const v3 = new THREE.Vector3(), n3 = new THREE.Matrix3(), relM = new THREE.Matrix4();
    Object.keys(buckets).forEach(function (uid) {
      const B = buckets[uid];
      let nv = 0, ni = 0;
      for (let i = 0; i < B.list.length; i++) {
        const g = B.list[i].geometry;
        nv += g.attributes.position.count;
        ni += g.index ? g.index.count : g.attributes.position.count;
      }
      const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2);
      const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
      let vo = 0, io = 0;
      for (let i = 0; i < B.list.length; i++) {
        const m = B.list[i], g = m.geometry;
        relM.multiplyMatrices(invRoot, m.matrixWorld);
        n3.getNormalMatrix(relM);
        const pA = g.attributes.position, nA = g.attributes.normal, uA = g.attributes.uv;
        for (let k = 0; k < pA.count; k++) {
          v3.fromBufferAttribute(pA, k).applyMatrix4(relM);
          pos[(vo + k) * 3] = v3.x; pos[(vo + k) * 3 + 1] = v3.y; pos[(vo + k) * 3 + 2] = v3.z;
          if (nA) {
            v3.fromBufferAttribute(nA, k).applyMatrix3(n3).normalize();
            nor[(vo + k) * 3] = v3.x; nor[(vo + k) * 3 + 1] = v3.y; nor[(vo + k) * 3 + 2] = v3.z;
          }
          if (uA) {
            uv[(vo + k) * 2] = uA.getX(k); uv[(vo + k) * 2 + 1] = uA.getY(k);
          }
        }
        if (g.index) {
          for (let k = 0; k < g.index.count; k++) idx[io++] = vo + g.index.getX(k);
        } else {
          for (let k = 0; k < pA.count; k++) idx[io++] = vo + k;
        }
        vo += pA.count;
      }
      const mg = new THREE.BufferGeometry();
      mg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      mg.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      mg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      mg.setIndex(new THREE.BufferAttribute(idx, 1));
      mg.computeBoundingSphere();
      const mm = new THREE.Mesh(mg, B.mat);
      mm.receiveShadow = true;
      grp.add(mm);
    });
  }

  function lowGroundUnderBox(x, z, hw, hd) {
    const rDiag = Math.hypot(hw, hd);
    return Math.min(
      terrainH(x, z),
      terrainH(x - rDiag, z - rDiag),
      terrainH(x + rDiag, z - rDiag),
      terrainH(x - rDiag, z + rDiag),
      terrainH(x + rDiag, z + rDiag)
    );
  }

  function buildAll(scene, MATS, tagReg, subClipPlanes) {
    const M = FC_MEGA.plan();
    const root = new THREE.Group();
    root.name = 'fc_ancient_sumeru_noahbabel';
    scene.add(root);

    const tideWheels = [];
    const miterGates = [];
    const turbineRings = [];
    const dynamicMeshes = new Set();

    /* -------------------------------------------------------------------
       A1. Inverted Noahbabel Submarine Hydro-Dynamo Cone (-12..-90 m) & -128 m Taproot
       ------------------------------------------------------------------- */
    const coneGroup = new THREE.Group();
    coneGroup.name = 'fc_submarine_dynamo_cone';
    root.add(coneGroup);
    const SC = M.submarineCone;

    /* Stepped submarine hydro-caisson drums seated in the -95 m kolk floor (battered rTop <= rBot so 0% faces down above ground) */
    const coneTiers = [
      { y0: -96, y1: -10, rTop: 74,  rBot: 82,  mat: MATS.ancientCeramic },
      { y0: -96, y1: -28, rTop: 90,  rBot: 98,  mat: MATS.ancientConcrete },
      { y0: -96, y1: -50, rTop: 104, rBot: 112, mat: MATS.ancientConcrete },
      { y0: -96, y1: -72, rTop: 118, rBot: 126, mat: MATS.ancientCeramic }
    ];
    for (let i = 0; i < coneTiers.length; i++) {
      const ct = coneTiers[i], h = ct.y1 - ct.y0;
      const m = new THREE.Mesh(uvScaleCyl(ct.rTop, ct.rBot, h, 16, 8.0), ct.mat);
      m.position.set(SC.cx, (ct.y0 + ct.y1) * 0.5, SC.cz);
      coneGroup.add(m);
    }

    /* -128 m Geodetic Taproot Shaft & Paktong Seismic Pendulum */
    const tapH = SC.taproot.yTop - SC.taproot.yBot;
    const tapMesh = new THREE.Mesh(uvScaleCyl(SC.taproot.r * 0.88, SC.taproot.r, tapH, 12, 6.0), MATS.ancientConcrete);
    tapMesh.position.set(SC.cx, (SC.taproot.yTop + SC.taproot.yBot) * 0.5, SC.cz);
    coneGroup.add(tapMesh);

    const pendBob = new THREE.Mesh(new THREE.OctahedronGeometry(6.5, 1), MATS.paktongMetal);
    pendBob.position.set(SC.cx, SC.taproot.pendulumY, SC.cz);
    coneGroup.add(pendBob);

    /* Cyan-glowing Pioneer Superconductor Field-Coil Material (emissive, unmerged) */
    const cyanCoilMat = new THREE.MeshStandardMaterial({
      color: 0x38d8f0,
      emissive: 0x26c8ec,
      emissiveIntensity: 1.35,
      roughness: 0.24,
      metalness: 0.65,
      side: THREE.DoubleSide
    });
    if (subClipPlanes && subClipPlanes.length) cyanCoilMat.clippingPlanes = subClipPlanes;

    /* Surface-visible Pioneer Superconductor Flux-Ring Gallery & 8 Penstock Intake Capstones around the Kolk Rim */
    {
      const rimFlux = new THREE.Mesh(new THREE.TorusGeometry(139.5, 1.35, 8, 48), cyanCoilMat);
      rimFlux.rotation.x = Math.PI * 0.5;
      rimFlux.position.set(SC.cx, 1.8, SC.cz);
      coneGroup.add(rimFlux);
      dynamicMeshes.add(rimFlux);
      for (let k = 0; k < 8; k++) {
        const a = (k * 45 + 15) * Math.PI / 180;
        const ix = SC.cx + 141.0 * Math.cos(a), iz = SC.cz + 141.0 * Math.sin(a);
        const cap = new THREE.Mesh(uvScaleBox(8.5, 7.2, 8.5, 3.0), MATS.paktongMetal);
        cap.position.set(ix, 1.2, iz);
        cap.rotation.y = -a;
        coneGroup.add(cap);
        const beacon = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.2, 8), cyanCoilMat);
        beacon.position.set(ix, 5.6, iz);
        coneGroup.add(beacon);
        dynamicMeshes.add(beacon);
      }
    }

    /* 12 Radial Penstock Nacelles (8 active glowing Pioneer turbines + 4 SE flooded ruin bays) */
    const seRuinGroup = new THREE.Group();
    seRuinGroup.name = 'fc_ruin_se_turbine_bays';
    root.add(seRuinGroup);

    /* Ground-anchored main body spine on the flat -95 m central kolk floor (r = 46 m <= 78 m) */
    {
      const gMain = lowGroundUnderBox(SC.cx + 32, SC.cz + 32, 12, 12);
      const mainH = (-26.0) - (gMain - 0.3);
      const mainSpine = new THREE.Mesh(uvScaleBox(22, mainH, 22, 6.0), MATS.ancientConcrete);
      mainSpine.position.set(SC.cx + 32, (gMain - 0.3) + mainH * 0.5, SC.cz + 32);
      seRuinGroup.add(mainSpine);
    }

    for (let k = 0; k < SC.penstocks.length; k++) {
      const P = SC.penstocks[k];
      const rad = P.yCenter > -55 ? 108 : 92;
      const px = SC.cx + rad * P.ux, pz = SC.cz + rad * P.uz;
      const yaw = Math.atan2(P.ux, P.uz);
      if (P.status === 'pioneer-superconductor') {
        const nac = new THREE.Mesh(uvScaleBox(10.5, 9.2, 22.0, 4.0), MATS.paktongMetal);
        nac.position.set(px, P.yCenter, pz);
        nac.rotation.y = yaw;
        coneGroup.add(nac);

        const coil = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.75, 8, 20), cyanCoilMat);
        coil.position.set(px + P.ux * 9.5, P.yCenter, pz + P.uz * 9.5);
        coil.rotation.y = yaw;
        coneGroup.add(coil);
        turbineRings.push(coil);
        dynamicMeshes.add(coil);
      } else {
        /* Seated kolk-bed ruin blocks on the flat -95 m kolk floor (r = 64 m <= 74 m so ground is flat -95.0 m everywhere!) */
        const wx = SC.cx + 64.0 * P.ux;
        const wz = SC.cz + 64.0 * P.uz;
        const gBed = lowGroundUnderBox(wx, wz, 4.5, 3.8);
        const bh = 5.4;
        const wreckBlk = new THREE.Mesh(uvScaleBox(9.0, bh, 7.6, 4.0), MATS.ancientConcrete);
        wreckBlk.position.set(wx, gBed - 0.20 + bh * 0.5, wz);
        wreckBlk.rotation.y = yaw + 0.25;
        seRuinGroup.add(wreckBlk);
      }
    }
    seRuinGroup.updateMatrixWorld(true);
    if (typeof KRUINS !== 'undefined' && KRUINS.watch) {
      KRUINS.watch(seRuinGroup, { name: 'SE Submarine Penstock Ruin Bays', ground: terrainH });
    }

    if (tagReg) {
      tagReg.add({
        'class': 'infrastructure', kind: 'hydro_dynamo', key: SC.id,
        name: 'Noahbabel Inverted Submarine Hydro-Dynamo Cone (-90 m, 8 Pioneer Bulb-Turbines)',
        at: [SC.cx, -48, SC.cz], ry: 0, size: [256, 256, 118]
      });
    }

    /* -------------------------------------------------------------------
       A2. 1,400 m Circular Arcaded Sea-Ring Weir, 4 Sector Locks & NW Scar
       ------------------------------------------------------------------- */
    const SR = M.seaRing;
    const weirGroup = new THREE.Group();
    weirGroup.name = 'fc_noahbabel_sea_ring';
    root.add(weirGroup);

    const nSeg = 72;
    const lockAngles = SR.locks.map(function (L) { return ((L.angDeg % 360) + 360) % 360; });
    const rMid = 0.5 * (SR.rOuter + SR.rInner);
    const segLen = (2 * Math.PI * rMid) / nSeg * 1.03;

    for (let s = 0; s < nSeg; s++) {
      const deg = (s + 0.5) * (360 / nSeg);
      let inLock = false;
      for (let li = 0; li < lockAngles.length; li++) {
        let diff = Math.abs(deg - lockAngles[li]);
        if (diff > 180) diff = 360 - diff;
        if (diff < 2.6) { inLock = true; break; }
      }
      if (inLock) continue;

      const rad = deg * Math.PI / 180;
      const sx = SR.cx + rMid * Math.cos(rad);
      const sz = SR.cz + rMid * Math.sin(rad);
      const bed = Math.min(-14.0, terrainH(sx, sz) - 1.0);
      const hWeir = SR.promenadeY - bed;
      const inScar = deg >= SR.scarArcDeg[0] && deg <= SR.scarArcDeg[1];

      const wMesh = new THREE.Mesh(
        uvScaleBox(26.0, hWeir, segLen, 7.0),
        inScar ? MATS.cobaltGlaze : MATS.ancientConcrete
      );
      wMesh.position.set(sx, bed + hWeir * 0.5, sz);
      wMesh.rotation.y = -rad;
      weirGroup.add(wMesh);

      /* Travertine promenade deck coping + celadon parapet */
      const deckM = new THREE.Mesh(uvScaleBox(27.6, 1.6, segLen, 5.0), MATS.travertineStone);
      deckM.position.set(sx, SR.promenadeY + 0.8, sz);
      deckM.rotation.y = -rad;
      weirGroup.add(deckM);

      if (typeof KWALK !== 'undefined' && KWALK.floor) {
        KWALK.floor({ rect: [sx - 12, sx + 12, sz - 12, sz + 12], y: SR.promenadeY + 1.6 });
      }
    }

    /* NW Sea-Ring Tsunami Scar Seated Debris Watched by KRUINS */
    const scarGroup = new THREE.Group();
    scarGroup.name = 'fc_ruin_nw_weir_scar';
    root.add(scarGroup);
    {
      const a0 = 222 * Math.PI / 180;
      const mx = SR.cx + rMid * Math.cos(a0), mz = SR.cz + rMid * Math.sin(a0);
      const g0 = lowGroundUnderBox(mx, mz, 12, 12);
      const mh = 18.0 - (g0 - 0.3);
      const scarButtress = new THREE.Mesh(uvScaleBox(24, mh, 24, 6.0), MATS.cobaltGlaze);
      scarButtress.position.set(mx, (g0 - 0.3) + mh * 0.5, mz);
      scarGroup.add(scarButtress);

      for (let i = 0; i < SR.scarBlocks.length; i++) {
        const B = SR.scarBlocks[i];
        const gb = lowGroundUnderBox(B.x, B.z, B.w * 0.5, B.d * 0.5);
        const bm = new THREE.Mesh(uvScaleBox(B.w, B.h, B.d, 4.0), MATS.ancientConcrete);
        bm.position.set(B.x, gb - 0.15 + B.h * 0.5, B.z);
        bm.rotation.y = B.ry;
        scarGroup.add(bm);
      }
      scarGroup.updateMatrixWorld(true);
      if (typeof KRUINS !== 'undefined' && KRUINS.watch) {
        KRUINS.watch(scarGroup, { name: 'NW Sea-Ring Weir Tsunami Scar', ground: terrainH });
      }
    }

    /* 4 Sector Ship-Locks: 8 Prou-Torre Keeps, +34 m Suspension Spans & Miter-Gates */
    for (let i = 0; i < SR.locks.length; i++) {
      const L = SR.locks[i];
      const a = L.angDeg * Math.PI / 180;
      for (let k = 0; k < L.keeps.length; k++) {
        const K = L.keeps[k];
        const g0 = Math.min(-18.0, terrainH(K.x, K.z) - 1.0);
        const kh = K.crownY - g0;
        const keepBody = new THREE.Mesh(uvScaleCyl(12.5, 15.5, kh, 12, 6.0), MATS.ancientCeramic);
        keepBody.position.set(K.x, g0 + kh * 0.5, K.z);
        weirGroup.add(keepBody);

        const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(14.2, 8.5, 12), MATS.celadonRoof);
        keepRoof.position.set(K.x, K.crownY + 4.25, K.z);
        weirGroup.add(keepRoof);

        const finial = new THREE.Mesh(new THREE.ConeGeometry(2.2, 5.5, 8), MATS.giltChofa);
        finial.position.set(K.x, K.crownY + 10.5, K.z);
        weirGroup.add(finial);
      }

      /* +34 m High-Clearance Paktong Suspension Span over Sector Lock */
      const span = new THREE.Mesh(uvScaleBox(18.0, 2.4, 88.0, 5.0), MATS.paktongMetal);
      span.position.set(L.x, L.bridgeY, L.z);
      span.rotation.y = -a;
      weirGroup.add(span);

      /* Twin Miter-Lock Gate Leaves (open at Slack Water, closed during Surge/Flood head) */
      const gateL = new THREE.Mesh(uvScaleBox(3.2, 24.0, 22.0, 4.0), MATS.paktongMetal);
      gateL.position.set(L.x, -2.0, L.z);
      gateL.rotation.y = -a;
      weirGroup.add(gateL);
      miterGates.push({ mesh: gateL, baseYaw: -a, lock: L });
      dynamicMeshes.add(gateL);

      if (typeof KDOOR !== 'undefined' && KDOOR.add) {
        try { KDOOR.add({ at: [L.x, 2.0, L.z], yaw: -a, w: 18.0, h: 12.0 }); } catch (e) {}
      }
      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'ship_lock', key: L.id, name: L.name,
          at: [L.x, 4, L.z], ry: -a, size: [32, 92, 38]
        });
      }
    }

    /* -------------------------------------------------------------------
       A3. Central 9+3-Peak Khao Phra Sumeru Arcology Cluster (+168 m Maha-Meru)
       ------------------------------------------------------------------- */
    const SM = M.sumeru;
    const sumeruGroup = new THREE.Group();
    sumeruGroup.name = 'fc_khao_phra_sumeru';
    root.add(sumeruGroup);

    /* Stepped Octagonal Lotus Water-Plinth (-14 m -> +16 m) */
    const plinthSteps = [
      { r: 136, y0: -14, y1: 4.5,  mat: MATS.travertineStone },
      { r: 118, y0: 4.5, y1: 10.5, mat: MATS.ancientCeramic },
      { r: 98,  y0: 10.5, y1: 16.0, mat: MATS.travertineStone }
    ];
    for (let i = 0; i < plinthSteps.length; i++) {
      const ps = plinthSteps[i], h = ps.y1 - ps.y0;
      const pm = new THREE.Mesh(uvScaleCyl(ps.r * 0.96, ps.r, h, 8, 8.0), ps.mat);
      pm.position.set(SM.cx, (ps.y0 + ps.y1) * 0.5, SM.cz);
      sumeruGroup.add(pm);
    }
    if (typeof KWALK !== 'undefined' && KWALK.floor) {
      KWALK.floor({ rect: [SM.cx - 88, SM.cx + 88, SM.cz - 88, SM.cz + 88], y: 16.0 });
    }

    /* Central 9-Tier Maha-Meru Spire (+16 m -> +168 m) in Ancient Ceramic, Celadon Roofs & Gilt Chofa */
    for (let t = 0; t < 7; t++) {
      const u = t / 7;
      const y0 = 16.0 + t * 17.5;
      const hTier = 17.8;
      const rB = 46.0 * (1 - u * 0.72);
      const rT = rB * 0.84;
      const body = new THREE.Mesh(uvScaleCyl(rT, rB, hTier, 8, 6.0), MATS.ancientCeramic);
      body.position.set(SM.cx, y0 + hTier * 0.5, SM.cz);
      sumeruGroup.add(body);

      const eave = new THREE.Mesh(new THREE.ConeGeometry(rB * 1.18, 5.4, 8), MATS.celadonRoof);
      eave.position.set(SM.cx, y0 + hTier + 1.2, SM.cz);
      sumeruGroup.add(eave);

      const giltRim = new THREE.Mesh(uvScaleCyl(rB * 1.06, rB * 1.14, 0.9, 8, 3.0), MATS.giltChofa);
      giltRim.position.set(SM.cx, y0 + hTier - 0.4, SM.cz);
      sumeruGroup.add(giltRim);
    }

    /* +144 m Geodetic Tide-Lantern & +168 m Gilded Seven-Umbrella Chatra Finial */
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 8.0, 12), cyanCoilMat);
    lantern.position.set(SM.cx, SM.lanternY, SM.cz);
    sumeruGroup.add(lantern);

    const chatra = new THREE.Mesh(new THREE.ConeGeometry(9.5, 24.0, 12), MATS.giltChofa);
    chatra.position.set(SM.cx, 156.0, SM.cz);
    sumeruGroup.add(chatra);

    /* 4 Diagonal +92 m Fluted Prang Towers & 4 Cardinal +48 m Cruciform Mondops */
    for (let k = 0; k < SM.prangs.length; k++) {
      const P = SM.prangs[k];
      const hP = P.tipY - P.y0 - 14.0;
      const prangBody = new THREE.Mesh(uvScaleCyl(P.rBase * 0.42, P.rBase, hP, 12, 5.0), MATS.ancientCeramic);
      prangBody.position.set(P.x, P.y0 + hP * 0.5, P.z);
      sumeruGroup.add(prangBody);

      const prangCap = new THREE.Mesh(new THREE.ConeGeometry(P.rBase * 0.46, 15.0, 12), MATS.giltChofa);
      prangCap.position.set(P.x, P.tipY - 7.5, P.z);
      sumeruGroup.add(prangCap);
    }

    for (let k = 0; k < SM.mondops.length; k++) {
      const MD = SM.mondops[k];
      const baseH = 16.0;
      const mBase = new THREE.Mesh(uvScaleBox(MD.w, baseH, MD.w, 5.0), MATS.cobaltGlaze);
      mBase.position.set(MD.x, MD.y0 + baseH * 0.5, MD.z);
      sumeruGroup.add(mBase);

      const mRoof1 = new THREE.Mesh(new THREE.ConeGeometry(MD.w * 0.78, 10.0, 4), MATS.celadonRoof);
      mRoof1.position.set(MD.x, MD.y0 + baseH + 5.0, MD.z);
      mRoof1.rotation.y = Math.PI * 0.25;
      sumeruGroup.add(mRoof1);

      const mSpire = new THREE.Mesh(new THREE.ConeGeometry(MD.w * 0.34, 12.0, 8), MATS.giltChofa);
      mSpire.position.set(MD.x, MD.tipY - 6.0, MD.z);
      sumeruGroup.add(mSpire);
    }

    /* Southern 3-Spire Bussabok Audience Island */
    {
      const B = SM.bussabok;
      const bPlinth = new THREE.Mesh(uvScaleBox(B.w, 22.5, B.d, 6.0), MATS.travertineStone);
      bPlinth.position.set(B.cx, B.plinthY - 11.25, B.cz);
      sumeruGroup.add(bPlinth);
      for (let i = 0; i < B.spires.length; i++) {
        const sp = B.spires[i];
        const hB = sp.tipY - B.plinthY - 12.0;
        const body = new THREE.Mesh(uvScaleCyl(sp.r * 0.55, sp.r, hB, 8, 5.0), MATS.ancientCeramic);
        body.position.set(B.cx + sp.dx, B.plinthY + hB * 0.5, B.cz);
        sumeruGroup.add(body);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(sp.r * 0.85, 12.5, 8), MATS.giltChofa);
        roof.position.set(B.cx + sp.dx, sp.tipY - 6.25, B.cz);
        sumeruGroup.add(roof);
      }
    }

    if (tagReg) {
      tagReg.add({
        'class': 'infrastructure', kind: 'arcology_mandala', key: SM.id,
        name: 'Khao Phra Sumeru 9+3-Peak Ancient Arcology Mandala (+168 m)',
        at: [SM.cx, 84, SM.cz], ry: 0, size: [272, 272, 168]
      });
    }

    /* -------------------------------------------------------------------
       A4. 3 Radial Boulevard-Dykes (+22 m), Reversible Tide-Wheels & 14 Naga Walkways
       ------------------------------------------------------------------- */
    const dykeGroup = new THREE.Group();
    dykeGroup.name = 'fc_boulevard_dykes_and_nagas';
    root.add(dykeGroup);

    for (let i = 0; i < M.dykes.length; i++) {
      const D = M.dykes[i];
      const a = D.angDeg * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a);
      const len = D.r1 - D.r0;
      const midR = 0.5 * (D.r0 + D.r1);
      const dx = SM.cx + midR * ux, dz = SM.cz + midR * uz;
      const hDyke = D.crownY - (-15.0);

      const dMesh = new THREE.Mesh(uvScaleBox(len, hDyke, D.widthM, 8.0), MATS.travertineStone);
      dMesh.position.set(dx, -15.0 + hDyke * 0.5, dz);
      dMesh.rotation.y = -a;
      dykeGroup.add(dMesh);

      /* Cobalt-glazed arched barge-gates + Cypress reversible tide-wheels at radial stations */
      for (let g = 0; g < D.gates.length; g++) {
        const rg = D.gates[g];
        const gx = SM.cx + rg * ux, gz = SM.cz + rg * uz;
        const arch = new THREE.Mesh(uvScaleBox(24.0, 8.5, D.widthM + 2.4, 4.0), MATS.cobaltGlaze);
        arch.position.set(gx, D.crownY + 3.2, gz);
        arch.rotation.y = -a;
        dykeGroup.add(arch);

        const wheel = new THREE.Mesh(uvScaleCyl(6.2, 6.2, 4.2, 12, 3.0), MATS.cypressHull);
        wheel.position.set(gx - uz * (D.widthM * 0.5 + 2.6), 0.5, gz + ux * (D.widthM * 0.5 + 2.6));
        wheel.rotation.z = Math.PI * 0.5;
        wheel.rotation.y = -a;
        dykeGroup.add(wheel);
        tideWheels.push(wheel);
        dynamicMeshes.add(wheel);
      }

      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'boulevard_dyke', key: D.id, name: D.name,
          at: [dx, D.crownY, dz], ry: -a, size: [len, D.widthM, hDyke]
        });
      }
    }

    /* 14 Sinuous Gilt-Chofa Naga Walkways & Octagonal Celadon Sala-Nam Pavilions */
    for (let i = 0; i < M.nagaWalks.length; i++) {
      const NW = M.nagaWalks[i];
      for (let s = 0; s < NW.pts.length - 1; s++) {
        const A = NW.pts[s], B = NW.pts[s + 1];
        const segL = Math.hypot(B[0] - A[0], B[2] - A[2]) + 0.4;
        const yaw = Math.atan2(B[0] - A[0], B[2] - A[2]);
        const deck = new THREE.Mesh(uvScaleBox(NW.widthM, 1.1, segL, 4.0), MATS.travertineStone);
        deck.position.set((A[0] + B[0]) * 0.5, A[1], (A[2] + B[2]) * 0.5);
        deck.rotation.y = yaw;
        dykeGroup.add(deck);

        const rail = new THREE.Mesh(uvScaleBox(NW.widthM + 0.5, 0.85, segL, 3.0), MATS.giltChofa);
        rail.position.set((A[0] + B[0]) * 0.5, A[1] + 0.95, (A[2] + B[2]) * 0.5);
        rail.rotation.y = yaw;
        dykeGroup.add(rail);
      }
    }

    for (let i = 0; i < M.salaPavilions.length; i++) {
      const SP = M.salaPavilions[i];
      const pBase = new THREE.Mesh(uvScaleCyl(SP.r, SP.r * 1.08, 19.0, 8, 5.0), MATS.travertineStone);
      pBase.position.set(SP.x, SP.y - 9.5, SP.z);
      dykeGroup.add(pBase);

      const pRoof = new THREE.Mesh(new THREE.ConeGeometry(SP.r * 1.12, 6.8, 8), MATS.celadonRoof);
      pRoof.position.set(SP.x, SP.y + 7.2, SP.z);
      dykeGroup.add(pRoof);

      const pTip = new THREE.Mesh(new THREE.ConeGeometry(1.8, 4.5, 8), MATS.giltChofa);
      pTip.position.set(SP.x, SP.y + 12.2, SP.z);
      dykeGroup.add(pTip);
    }

    /* -------------------------------------------------------------------
       A5. 6 Outer Stepped-Ziggurat Ancient Water-Pods (3 Intact + 3 KRUINS)
       ------------------------------------------------------------------- */
    for (let i = 0; i < M.zigguratPods.length; i++) {
      const ZP = M.zigguratPods[i];
      const pGrp = new THREE.Group();
      pGrp.name = 'fc_ziggurat_' + ZP.code;
      root.add(pGrp);

      const g0 = lowGroundUnderBox(ZP.x, ZP.z, 26, 26);
      const tiers = ZP.intact ? 4 : 3;
      let curY = g0 - 0.25;
      for (let t = 0; t < tiers; t++) {
        const wT = ZP.w * (1 - t * 0.19);
        const hT = (ZP.h + Math.abs(g0)) / tiers;
        const box = new THREE.Mesh(
          uvScaleBox(wT, hT, wT, 6.0),
          t % 2 === 0 ? MATS.ancientCeramic : MATS.cobaltGlaze
        );
        box.position.set(ZP.x, curY + hT * 0.5, ZP.z);
        pGrp.add(box);
        curY += hT - 0.15;
      }

      if (ZP.intact) {
        const dome = new THREE.Mesh(new THREE.ConeGeometry(11.0, 9.5, 8), MATS.celadonRoof);
        dome.position.set(ZP.x, curY + 4.5, ZP.z);
        pGrp.add(dome);
      } else {
        /* Seated lagoon-bed wreck slab adjacent to damaged pod (verified KRUINS compliant) */
        const wx = ZP.x + 34.0, wz = ZP.z + 12.0;
        const gw = lowGroundUnderBox(wx, wz, 5.0, 4.0);
        const slab = new THREE.Mesh(uvScaleBox(10.0, 4.6, 8.0, 4.0), MATS.ancientCeramic);
        slab.position.set(wx, gw - 0.15 + 2.3, wz);
        slab.rotation.y = 0.4;
        pGrp.add(slab);
        pGrp.updateMatrixWorld(true);
        if (typeof KRUINS !== 'undefined' && KRUINS.watch) {
          KRUINS.watch(pGrp, { name: ZP.name, ground: terrainH });
        }
      }

      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'ziggurat_pod', key: ZP.id, name: ZP.name,
          at: [ZP.x, 12, ZP.z], ry: 0, size: [ZP.w, ZP.d, ZP.h]
        });
      }
    }

    /* Batch static megastructure meshes by material to cut draw calls under 300 */
    mergeStaticGroup(coneGroup, dynamicMeshes);
    mergeStaticGroup(weirGroup, dynamicMeshes);
    mergeStaticGroup(sumeruGroup, dynamicMeshes);
    mergeStaticGroup(dykeGroup, dynamicMeshes);

    function update(tSec, tideSample) {
      const spin = (tideSample.sluiceVelMs == null ? 1.2 : tideSample.sluiceVelMs) * 0.35;
      for (let i = 0; i < tideWheels.length; i++) {
        tideWheels[i].rotation.x = tSec * spin;
      }
      for (let i = 0; i < turbineRings.length; i++) {
        turbineRings[i].rotation.z = tSec * 1.4;
      }
      for (let i = 0; i < miterGates.length; i++) {
        const G = miterGates[i];
        G.mesh.rotation.y = G.baseYaw + (tideSample.lockOpen ? 0.58 : 0.0);
      }
    }

    return {
      plan: M,
      root: root,
      coneGroup: coneGroup,
      update: update
    };
  }

  return { buildAll: buildAll, mergeStaticGroup: mergeStaticGroup };
})();
