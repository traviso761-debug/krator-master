// ================================================================= FLOATING CITY — Grand Wat Phra Sumeru / Noahbabel Arcology [draw]
// Builds:
//   A1. -12..-96 m Inverted Noahbabel Submarine Hydro-Dynamo Cone, -128 m Geodetic Taproot & SE Ruin Bays (KRUINS)
//   A3. Grand 4-Tier Khao Phra Sumeru Imperial Arcology Mandala (r=218 m, +176 m): 64-column Phra Rabieng cloisters,
//       8 ceremonial palace-barge grand staircases, hanging emerald/lotus/orchid garden terraces, 6 Vaulted Gopura
//       Bridge-Bastions, 9-tier redented Maha-Meru spire, 4 +112 m Khmer-Soleri Prangs, 4 +66 m Peristyle Mondops,
//       8 Gilded Bussabok Corner Spires, and the 5-spire Southern Royal Palace-Barge Island
//   A5. 6 Stepped-Ziggurat Ancient Water-Pods (3 intact merged into sumeruGroup + 3 KRUINS)
const FC_SUMERU_CORE = (function () {
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
    /* Enforce rTop <= rBot on above-ground cylinders so BIO.insideOut never sees downward side normals */
    const rt = Math.min(rTop, rBot);
    const rb = Math.max(rTop, rBot);
    const g = new THREE.CylinderGeometry(rt, rb, h, segs, 1, false);
    const uv = g.attributes.uv;
    const uRep = Math.max(1, Math.round((2 * Math.PI * 0.5 * (rt + rb)) / (tileM == null ? 6.0 : tileM)));
    const vRep = Math.max(1, h / (tileM == null ? 6.0 : tileM));
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, uv.getX(i) * uRep, uv.getY(i) * vRep);
    }
    return g;
  }

  function addBox(grp, w, h, d, x, yBot, z, ry, mat, tileM) {
    const m = new THREE.Mesh(uvScaleBox(w, h, d, tileM == null ? 6.0 : tileM), mat);
    m.position.set(x, yBot + h * 0.5, z);
    if (ry) m.rotation.y = ry;
    grp.add(m);
    return m;
  }

  function addCyl(grp, rTop, rBot, h, segs, x, yBot, z, ry, mat, tileM) {
    const m = new THREE.Mesh(uvScaleCyl(rTop, rBot, h, segs, tileM == null ? 6.0 : tileM), mat);
    m.position.set(x, yBot + h * 0.5, z);
    if (ry) m.rotation.y = ry;
    grp.add(m);
    return m;
  }

  function addCone(grp, rBot, h, segs, x, yBot, z, ry, mat) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(rBot, h, segs), mat);
    m.position.set(x, yBot + h * 0.5, z);
    if (ry) m.rotation.y = ry;
    grp.add(m);
    return m;
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
      if (!nv) return;
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

  function buildCore(M, root, MATS, tagReg, subClipPlanes, dynamicMeshes, turbineRings) {
    const warmLoggiaMat = new THREE.MeshStandardMaterial({
      color: 0xffd28a,
      emissive: 0xe69838,
      emissiveIntensity: 0.95,
      roughness: 0.35,
      metalness: 0.15
    });
    const hangingGardenMat = new THREE.MeshStandardMaterial({
      color: 0x3b7d44,
      roughness: 0.84,
      metalness: 0.0
    });
    const lotusBloomMat = new THREE.MeshStandardMaterial({
      color: 0xe47fa2,
      roughness: 0.65,
      metalness: 0.0
    });

    const cyanCoilMat = new THREE.MeshStandardMaterial({
      color: 0x38d8f0,
      emissive: 0x26c8ec,
      emissiveIntensity: 1.35,
      roughness: 0.24,
      metalness: 0.65,
      side: THREE.DoubleSide
    });
    if (subClipPlanes && subClipPlanes.length) cyanCoilMat.clippingPlanes = subClipPlanes;

    /* -------------------------------------------------------------------
       A1. Inverted Noahbabel Submarine Hydro-Dynamo Cone (-12..-96 m) & -128 m Taproot
       ------------------------------------------------------------------- */
    const coneGroup = new THREE.Group();
    coneGroup.name = 'fc_submarine_dynamo_cone';
    root.add(coneGroup);
    const SC = M.submarineCone;

    const coneTiers = [
      { y0: -96, y1: -10, rTop:  86, rBot:  96, mat: MATS.ancientCeramic },
      { y0: -96, y1: -28, rTop: 106, rBot: 116, mat: MATS.ancientConcrete },
      { y0: -96, y1: -50, rTop: 124, rBot: 134, mat: MATS.ancientConcrete },
      { y0: -96, y1: -72, rTop: 140, rBot: 150, mat: MATS.ancientCeramic }
    ];
    for (let i = 0; i < coneTiers.length; i++) {
      const ct = coneTiers[i];
      addCyl(coneGroup, ct.rTop, ct.rBot, ct.y1 - ct.y0, 16, SC.cx, ct.y0, SC.cz, 0, ct.mat, 8.0);
    }

    for (let r = 0; r < 16; r++) {
      const a = (r * 22.5) * Math.PI / 180;
      addBox(coneGroup, 6.2, 84.0, 28.0, SC.cx + 108 * Math.cos(a), -96.0, SC.cz + 108 * Math.sin(a), -a + Math.PI * 0.5, MATS.ancientConcrete, 6.0);
    }

    const tapH = SC.taproot.yTop - SC.taproot.yBot;
    addCyl(coneGroup, SC.taproot.r * 0.88, SC.taproot.r, tapH, 12, SC.cx, SC.taproot.yBot, SC.cz, 0, MATS.ancientConcrete, 6.0);
    const pendBob = new THREE.Mesh(new THREE.OctahedronGeometry(7.2, 1), MATS.paktongMetal);
    pendBob.position.set(SC.cx, SC.taproot.pendulumY, SC.cz);
    coneGroup.add(pendBob);

    /* Surface Pioneer Flux-Ring Gallery & 8 Penstock Intake Pylons around Kolk Moat */
    {
      const rimFlux = new THREE.Mesh(new THREE.TorusGeometry(224.0, 1.55, 8, 56), cyanCoilMat);
      rimFlux.rotation.x = Math.PI * 0.5;
      rimFlux.position.set(SC.cx, 2.4, SC.cz);
      coneGroup.add(rimFlux);
      dynamicMeshes.add(rimFlux);
      for (let k = 0; k < 8; k++) {
        const a = (k * 45 + 32.0) * Math.PI / 180;
        const ix = SC.cx + 226.0 * Math.cos(a), iz = SC.cz + 226.0 * Math.sin(a);
        addBox(coneGroup, 10.0, 20.0, 10.0, ix, -14.0, iz, -a, MATS.paktongMetal, 3.5);
        const beacon = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 3.0, 8), cyanCoilMat);
        beacon.position.set(ix, 7.6, iz);
        coneGroup.add(beacon);
        dynamicMeshes.add(beacon);
      }
    }

    /* SE Submarine Ruin Bays (watched by KRUINS) + 8 Active Superconductor Turbines */
    const seRuinGroup = new THREE.Group();
    seRuinGroup.name = 'fc_ruin_se_turbine_bays';
    root.add(seRuinGroup);
    {
      const gMain = lowGroundUnderBox(SC.cx + 36, SC.cz + 36, 12, 12);
      const mainH = (-26.0) - (gMain - 0.3);
      addBox(seRuinGroup, 24, mainH, 24, SC.cx + 36, gMain - 0.3, SC.cz + 36, 0, MATS.ancientConcrete, 6.0);
    }

    for (let k = 0; k < SC.penstocks.length; k++) {
      const P = SC.penstocks[k];
      const rad = P.yCenter > -55 ? 124 : 106;
      const px = SC.cx + rad * P.ux, pz = SC.cz + rad * P.uz;
      const yaw = Math.atan2(P.ux, P.uz);
      if (P.status === 'pioneer-superconductor') {
        addBox(coneGroup, 11.2, 9.6, 24.0, px, P.yCenter - 4.8, pz, yaw, MATS.paktongMetal, 4.0);
        const coil = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.80, 8, 20), cyanCoilMat);
        coil.position.set(px + P.ux * 10.5, P.yCenter, pz + P.uz * 10.5);
        coil.rotation.y = yaw;
        coneGroup.add(coil);
        turbineRings.push(coil);
        dynamicMeshes.add(coil);
      } else {
        const wx = SC.cx + 68.0 * P.ux, wz = SC.cz + 68.0 * P.uz;
        const gBed = lowGroundUnderBox(wx, wz, 4.8, 4.0);
        addBox(seRuinGroup, 9.6, 5.8, 8.0, wx, gBed - 0.25, wz, yaw + 0.25, MATS.ancientConcrete, 4.0);
      }
    }
    seRuinGroup.updateMatrixWorld(true);
    if (typeof KRUINS !== 'undefined' && KRUINS.watch) {
      KRUINS.watch(seRuinGroup, { name: 'SE Submarine Penstock Ruin Bays', ground: terrainH });
    }
    if (tagReg) {
      tagReg.add({
        'class': 'infrastructure', kind: 'hydro_dynamo', key: SC.id,
        name: 'Noahbabel Inverted Submarine Hydro-Dynamo Cone (-92 m, 8 Pioneer Bulb-Turbines)',
        at: [SC.cx, -48, SC.cz], ry: 0, size: [300, 300, 120]
      });
    }

    /* -------------------------------------------------------------------
       A3. Grand 4-Tier Khao Phra Sumeru Imperial Arcology Mandala (+176 m)
       ------------------------------------------------------------------- */
    const SM = M.sumeru;
    const sumeruGroup = new THREE.Group();
    sumeruGroup.name = 'fc_khao_phra_sumeru';
    root.add(sumeruGroup);

    /* 1. Four-Tier Octagonal Mandala Plinth (-26 m -> +6.2 m -> +14.0 m -> +22.0 m -> +30.0 m) */
    const plinthTiers = [
      { r: SM.plinthR,      y0: -26.0, y1:  6.2, mat: MATS.travertineStone, cloisterH: 5.8, garden: true },
      { r: SM.midCourtR,    y0:   5.8, y1: 14.0, mat: MATS.ancientCeramic,  cloisterH: 0.0, garden: true },
      { r: SM.upperCourtR,  y0:  13.6, y1: 22.0, mat: MATS.travertineStone, cloisterH: 5.6, garden: true },
      { r: SM.innerPodiumR, y0:  21.6, y1: 30.0, mat: MATS.ancientCeramic,  cloisterH: 0.0, garden: true }
    ];
    for (let i = 0; i < plinthTiers.length; i++) {
      const pt = plinthTiers[i];
      addCyl(sumeruGroup, pt.r * 0.975, pt.r, pt.y1 - pt.y0, 16, SM.cx, pt.y0, SM.cz, 0, pt.mat, 7.5);
      addCyl(sumeruGroup, pt.r * 0.985, pt.r * 0.992, 1.2, 16, SM.cx, pt.y1 - 1.0, SM.cz, 0, i % 2 === 1 ? MATS.giltChofa : MATS.cobaltGlaze, 4.0);

      /* Hanging Lotus & Orchid Terrace Planters around every Mandala Rim */
      if (pt.garden) {
        const nPlanter = 16;
        const rPl = pt.r - 2.6;
        for (let p = 0; p < nPlanter; p++) {
          const pa = (p + 0.5) * (Math.PI * 2 / nPlanter);
          const chord = 2 * rPl * Math.sin(Math.PI / nPlanter) * 0.68;
          const px = SM.cx + rPl * Math.cos(pa), pz = SM.cz + rPl * Math.sin(pa);
          addBox(sumeruGroup, 2.8, 1.1, chord, px, pt.y1 - 0.1, pz, -pa, MATS.travertineStone, 3.0);
          addBox(sumeruGroup, 2.4, 0.9, chord - 0.4, px, pt.y1 + 0.85, pz, -pa, hangingGardenMat, 2.0);
          if (p % 2 === 0) {
            addBox(sumeruGroup, 1.2, 0.45, chord * 0.45, px, pt.y1 + 1.65, pz, -pa, lotusBloomMat, 1.5);
          }
        }
      }

      /* Phra Rabieng Peristyle Cloister Galleries on Tiers 0 & 2 */
      if (pt.cloisterH > 0) {
        const rCol = pt.r - 6.2;
        const nCol = i === 0 ? 56 : 40;
        for (let c = 0; c < nCol; c++) {
          const ca = (c / nCol) * Math.PI * 2;
          addCyl(sumeruGroup, 0.95, 1.18, pt.cloisterH, 8, SM.cx + rCol * Math.cos(ca), pt.y1 - 0.1, SM.cz + rCol * Math.sin(ca), 0, MATS.travertineStone, 3.0);
        }
        for (let s = 0; s < 16; s++) {
          const sa = (s + 0.5) * (Math.PI * 2 / 16);
          const chord = 2 * rCol * Math.sin(Math.PI / 16) * 1.05;
          const gx = SM.cx + (rCol - 3.6) * Math.cos(sa), gz = SM.cz + (rCol - 3.6) * Math.sin(sa);
          addBox(sumeruGroup, 9.2, 1.25, chord, gx, pt.y1 + pt.cloisterH - 0.3, gz, -sa, MATS.travertineStone, 4.0);
          addBox(sumeruGroup, 10.2, 1.6, chord + 0.5, gx, pt.y1 + pt.cloisterH + 0.85, gz, -sa, MATS.celadonRoof, 4.0);
        }
      }
    }

    /* 8 Ceremonial Palace-Barge Docks & Grand Stepped Ghats around the Base of Sumeru */
    for (let k = 0; k < 8; k++) {
      const a = (k * 45 + 12.0) * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a);
      for (let st = 0; st < 4; st++) {
        const rSt = SM.plinthR + 3.0 + st * 3.4;
        const ySt = 5.4 - st * 1.1;
        addBox(sumeruGroup, 3.8, ySt - (-18.0), 18.0, SM.cx + rSt * ux, -18.0, SM.cz + rSt * uz, -a, MATS.travertineStone, 4.5);
      }
    }

    /* 8 Gilded Bussabok Corner Spires on the Ministerial Ring (+14 m -> +48 m) */
    for (let k = 0; k < SM.cornerBussaboks.length; k++) {
      const CB = SM.cornerBussaboks[k];
      addCyl(sumeruGroup, CB.r * 0.72, CB.r, 18.0, 8, CB.x, CB.y0 - 0.2, CB.z, Math.PI / 8, MATS.ancientCeramic, 4.0);
      addBox(sumeruGroup, CB.r * 1.6, 1.3, CB.r * 1.6, CB.x, CB.y0 + 17.5, CB.z, -CB.ang, MATS.giltChofa, 3.0);
      addCone(sumeruGroup, CB.r * 0.96, 7.2, 8, CB.x, CB.y0 + 18.6, CB.z, Math.PI / 8, MATS.celadonRoof);
      addCone(sumeruGroup, CB.r * 0.34, CB.tipY - (CB.y0 + 25.0), 8, CB.x, CB.y0 + 25.0, CB.z, 0, MATS.giltChofa);
    }

    if (typeof KWALK !== 'undefined' && KWALK.floor) {
      KWALK.floor({ rect: [SM.cx - 128, SM.cx + 128, SM.cz - 128, SM.cz + 128], y: 22.0 });
    }

    /* 2. Six Vaulted Gopura Bridge-Bastions locking the 4 Boulevard-Dykes & 2 Causeways directly into Sumeru Hub! */
    for (let b = 0; b < SM.bastions.length; b++) {
      const BS = SM.bastions[b];
      const a = BS.angDeg * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a), nx = -uz, nz = ux;
      const len = BS.r1 - BS.r0;
      const midR = 0.5 * (BS.r0 + BS.r1);
      const bx = SM.cx + midR * ux, bz = SM.cz + midR * uz;

      addBox(sumeruGroup, len, BS.deckY - (-24.0), BS.widthM, bx, -24.0, bz, -a, MATS.travertineStone, 7.0);
      addBox(sumeruGroup, len + 1.2, 1.4, BS.widthM + 1.8, bx, BS.deckY - 1.2, bz, -a, MATS.cobaltGlaze, 4.0);

      const rg = 186.0;
      const gx = SM.cx + rg * ux, gz = SM.cz + rg * uz;
      for (let sgn = -1; sgn <= 1; sgn += 2) {
        const px = gx + sgn * (BS.widthM * 0.36) * nx;
        const pz = gz + sgn * (BS.widthM * 0.36) * nz;
        addBox(sumeruGroup, 14.0, 20.0, 12.5, px, BS.deckY - 0.2, pz, -a, MATS.ancientCeramic, 4.5);
        addBox(sumeruGroup, 15.4, 1.6, 13.8, px, BS.deckY + 19.5, pz, -a, MATS.giltChofa, 3.0);
        addCone(sumeruGroup, 9.6, 10.5, 4, px, BS.deckY + 20.8, pz, -a + Math.PI * 0.25, MATS.celadonRoof);
        addCone(sumeruGroup, 2.6, 8.0, 8, px, BS.deckY + 30.8, pz, 0, MATS.giltChofa);
      }
      addBox(sumeruGroup, 12.5, 6.8, BS.widthM * 0.88, gx, BS.deckY + 13.2, gz, -a, MATS.cobaltGlaze, 4.0);
      addBox(sumeruGroup, 13.8, 2.4, BS.widthM * 0.92, gx, BS.deckY + 19.8, gz, -a, MATS.celadonRoof, 4.0);
    }

    /* 3. Nine-Tiered Redented Ratha Maha-Meru Arcology Tower (+30.0 m -> +156.0 m -> +176.0 m Chatra Tip!) */
    const nTiers = 9;
    for (let t = 0; t < nTiers; t++) {
      const u = t / nTiers;
      const y0 = 30.0 + t * 13.8;
      const hT = 14.2;
      const rB = 58.0 * (1 - u * 0.72);
      const rT = rB * 0.91;

      addCyl(sumeruGroup, rT, rB, hT, 8, SM.cx, y0 - 0.2, SM.cz, Math.PI / 8, MATS.ancientCeramic, 5.5);

      const rathaW = rB * 0.56, rathaL = rB * 2.04;
      addBox(sumeruGroup, rathaL, hT - 2.2, rathaW, SM.cx, y0 - 0.2, SM.cz, 0, MATS.ancientCeramic, 5.0);
      addBox(sumeruGroup, rathaW, hT - 2.2, rathaL, SM.cx, y0 - 0.2, SM.cz, 0, MATS.ancientCeramic, 5.0);

      addCyl(sumeruGroup, rB * 0.955, rB * 0.96, 1.35, 8, SM.cx, y0 + 3.2, SM.cz, Math.PI / 8, warmLoggiaMat, 3.0);
      addCyl(sumeruGroup, rT * 0.985, rT * 0.99, 1.35, 8, SM.cx, y0 + 8.0, SM.cz, Math.PI / 8, warmLoggiaMat, 3.0);
      addBox(sumeruGroup, rathaL + 0.5, 1.25, rathaW * 0.78, SM.cx, y0 + 5.6, SM.cz, 0, MATS.cobaltGlaze, 3.5);
      addBox(sumeruGroup, rathaW * 0.78, 1.25, rathaL + 0.5, SM.cx, y0 + 5.6, SM.cz, 0, MATS.cobaltGlaze, 3.5);

      addBox(sumeruGroup, rT * 2.02, 1.2, rT * 2.02, SM.cx, y0 + hT - 2.4, SM.cz, 0, MATS.travertineStone, 4.0);
      addBox(sumeruGroup, rT * 2.02, 1.2, rT * 2.02, SM.cx, y0 + hT - 2.4, SM.cz, Math.PI / 4, MATS.travertineStone, 4.0);
      addBox(sumeruGroup, rT * 2.16, 1.1, rT * 2.16, SM.cx, y0 + hT - 1.3, SM.cz, 0, MATS.giltChofa, 3.5);
      addBox(sumeruGroup, rT * 2.16, 1.1, rT * 2.16, SM.cx, y0 + hT - 1.3, SM.cz, Math.PI / 4, MATS.giltChofa, 3.5);

      addCyl(sumeruGroup, rT * 0.84, rT * 1.18, 3.2, 8, SM.cx, y0 + hT - 0.35, SM.cz, Math.PI / 8, MATS.celadonRoof, 4.0);

      for (let c = 0; c < 8; c++) {
        const ca = (c * 45 + 22.5) * Math.PI / 180;
        const cr = rT * 0.96;
        const sx = SM.cx + cr * Math.cos(ca), sz = SM.cz + cr * Math.sin(ca);
        const sW = Math.max(2.0, rT * 0.16);
        addBox(sumeruGroup, sW, 2.8, sW, sx, y0 + hT - 0.3, sz, -ca, MATS.ancientCeramic, 2.5);
        addCone(sumeruGroup, sW * 0.72, 3.6, 4, sx, y0 + hT + 2.3, sz, -ca + Math.PI * 0.25, MATS.giltChofa);
      }
    }

    /* 4. Crowning Geodetic Tide-Lantern & Continuous-Mast 7-Umbrella Chatra Finial (+153.5 m -> +176.0 m) */
    addCyl(sumeruGroup, 11.5, 14.8, 6.5, 8, SM.cx, 153.5, SM.cz, Math.PI / 8, MATS.travertineStone, 4.0);
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.4, 6.8, 12), cyanCoilMat);
    lantern.position.set(SM.cx, 162.8, SM.cz);
    sumeruGroup.add(lantern);
    for (let r = 0; r < 8; r++) {
      const ra = (r * 45) * Math.PI / 180;
      addBox(sumeruGroup, 0.95, 7.4, 0.95, SM.cx + 8.6 * Math.cos(ra), 159.4, SM.cz + 8.6 * Math.sin(ra), -ra, MATS.paktongMetal, 2.0);
    }
    addCyl(sumeruGroup, 0.65, 3.8, 17.5, 10, SM.cx, 158.5, SM.cz, 0, MATS.giltChofa, 3.0);
    for (let u = 0; u < 5; u++) {
      const rUm = 9.0 * (1 - u * 0.16);
      addCyl(sumeruGroup, rUm * 0.35, rUm, 1.3, 12, SM.cx, 166.0 + u * 2.1, SM.cz, 0, MATS.giltChofa, 2.5);
    }

    /* 5. Four Diagonal +112 m Fluted Khmer-Soleri Prangs */
    for (let k = 0; k < SM.prangs.length; k++) {
      const P = SM.prangs[k];
      addBox(sumeruGroup, P.rBase * 2.1, 9.5, P.rBase * 1.4, P.x, P.y0 - 0.3, P.z, 0, MATS.travertineStone, 4.5);
      addBox(sumeruGroup, P.rBase * 1.4, 9.5, P.rBase * 2.1, P.x, P.y0 - 0.3, P.z, 0, MATS.travertineStone, 4.5);
      addBox(sumeruGroup, P.rBase * 2.2, 2.4, P.rBase * 1.5, P.x, P.y0 + 8.9, P.z, 0, MATS.celadonRoof, 4.0);
      addBox(sumeruGroup, P.rBase * 1.5, 2.4, P.rBase * 2.2, P.x, P.y0 + 8.9, P.z, 0, MATS.celadonRoof, 4.0);

      let py = P.y0 + 10.8;
      for (let b = 0; b < 5; b++) {
        const sc = 1 - b * 0.14;
        const rB = P.rBase * 0.88 * sc;
        const hB = 11.4;
        addCyl(sumeruGroup, rB * 0.88, rB, hB, 8, P.x, py - 0.3, P.z, Math.PI / 8, MATS.ancientCeramic, 4.5);
        addBox(sumeruGroup, rB * 1.95, hB - 1.5, rB * 0.82, P.x, py - 0.3, P.z, 0, MATS.ancientCeramic, 4.0);
        addBox(sumeruGroup, rB * 0.82, hB - 1.5, rB * 1.95, P.x, py - 0.3, P.z, 0, MATS.ancientCeramic, 4.0);
        addCyl(sumeruGroup, rB * 0.92, rB * 0.94, 0.95, 8, P.x, py + 4.8, P.z, Math.PI / 8, warmLoggiaMat, 3.0);
        addCyl(sumeruGroup, rB * 0.82, rB * 1.06, 1.9, 8, P.x, py + hB - 1.7, P.z, Math.PI / 8, MATS.giltChofa, 3.0);
        py += hB - 0.4;
      }
      addCyl(sumeruGroup, P.rBase * 0.22, P.rBase * 0.38, 4.8, 12, P.x, py - 0.4, P.z, 0, MATS.celadonRoof, 3.0);
      addCone(sumeruGroup, P.rBase * 0.26, P.tipY - (py + 3.8), 10, P.x, py + 3.8, P.z, 0, MATS.giltChofa);
    }

    /* 6. Four Intercardinal +66 m 16-Column Peristyle Mondop Halls */
    for (let k = 0; k < SM.mondops.length; k++) {
      const MD = SM.mondops[k];
      const ry = -MD.ang;
      addBox(sumeruGroup, MD.w + 3.2, 3.4, MD.w + 3.2, MD.x, MD.y0 - 0.3, MD.z, ry, MATS.travertineStone, 4.5);
      addBox(sumeruGroup, MD.w * 0.66, 14.0, MD.w * 0.66, MD.x, MD.y0 + 2.9, MD.z, ry, MATS.cobaltGlaze, 4.0);
      const cs = Math.cos(ry), sn = Math.sin(ry), halfP = MD.w * 0.45;
      for (let ix = -1; ix <= 1; ix++) {
        for (let iz = -1; iz <= 1; iz++) {
          if (ix === 0 && iz === 0) continue;
          const lx = ix * halfP, lz = iz * halfP;
          const cx = MD.x + lx * cs + lz * sn, cz = MD.z - lx * sn + lz * cs;
          addCyl(sumeruGroup, 0.95, 1.15, 13.8, 8, cx, MD.y0 + 3.0, cz, 0, MATS.travertineStone, 3.0);
        }
      }
      addBox(sumeruGroup, MD.w + 1.4, 2.2, MD.w + 1.4, MD.x, MD.y0 + 16.6, MD.z, ry, MATS.travertineStone, 4.0);
      let my = MD.y0 + 18.5;
      for (let rt = 0; rt < 3; rt++) {
        const wR = (MD.w + 2.6) * (1 - rt * 0.24);
        addBox(sumeruGroup, wR, 1.2, wR, MD.x, my - 0.2, MD.z, ry, MATS.giltChofa, 3.0);
        addCone(sumeruGroup, wR * 0.74, 5.2, 4, MD.x, my + 0.8, MD.z, ry + Math.PI * 0.25, MATS.celadonRoof);
        my += 4.8;
      }
      addCone(sumeruGroup, 3.0, MD.tipY - (my - 0.3), 8, MD.x, my - 0.3, MD.z, 0, MATS.giltChofa);
    }

    /* 7. Expanded Southern 5-Spire Bussabok Royal Audience Island + Twin Palace-Barge Docks */
    {
      const B = SM.bussabok;
      addBox(sumeruGroup, B.w + 10.0, 32.0, B.d + 10.0, B.cx, -28.5, B.cz, 0, MATS.ancientConcrete, 7.0);
      addBox(sumeruGroup, B.w, 5.6, B.d, B.cx, 3.1, B.cz, 0, MATS.travertineStone, 5.5);
      addBox(sumeruGroup, B.w + 1.4, 1.2, B.d + 1.4, B.cx, B.plinthY - 1.1, B.cz, 0, MATS.giltChofa, 3.5);
      /* Hanging orchid garden curb along southern royal barge quay */
      addBox(sumeruGroup, B.w - 16.0, 1.1, 2.6, B.cx, B.plinthY, B.cz + B.d * 0.5 - 2.0, 0, hangingGardenMat, 2.5);
      addBox(sumeruGroup, B.w * 0.55, 2.6 - (-24.0), 8.0, B.cx, -24.0, B.cz + B.d * 0.5 + 4.0, 0, MATS.travertineStone, 5.0);

      for (let i = 0; i < B.spires.length; i++) {
        const sp = B.spires[i];
        const sx = B.cx + sp.dx;
        const sz = B.cz + sp.dz;
        const hB = sp.tipY - B.plinthY - 11.0;
        addCyl(sumeruGroup, sp.r * 0.62, sp.r, hB, 8, sx, B.plinthY - 0.2, sz, Math.PI / 8, MATS.ancientCeramic, 4.5);
        addBox(sumeruGroup, sp.r * 1.45, 1.4, sp.r * 1.45, sx, B.plinthY + hB - 1.2, sz, 0, MATS.giltChofa, 3.0);
        addCone(sumeruGroup, sp.r * 0.88, 6.2, 8, sx, B.plinthY + hB - 0.1, sz, 0, MATS.celadonRoof);
        addCone(sumeruGroup, sp.r * 0.35, 6.5, 8, sx, B.plinthY + hB + 5.4, sz, 0, MATS.giltChofa);
      }
    }

    if (tagReg) {
      tagReg.add({
        'class': 'infrastructure', kind: 'arcology_mandala', key: SM.id,
        name: 'Khao Phra Sumeru 4-Tier Imperial Arcology Mandala (+176 m)',
        at: [SM.cx, 88, SM.cz], ry: 0, size: [440, 440, 176]
      });
    }

    /* -------------------------------------------------------------------
       A5. 6 Outer Stepped-Ziggurat Ancient Water-Pods (3 Intact merged into sumeruGroup + 3 KRUINS)
       ------------------------------------------------------------------- */
    for (let i = 0; i < M.zigguratPods.length; i++) {
      const ZP = M.zigguratPods[i];
      const targetGrp = ZP.intact ? sumeruGroup : new THREE.Group();
      if (!ZP.intact) {
        targetGrp.name = 'fc_ziggurat_' + ZP.code;
        root.add(targetGrp);
      }

      const g0 = lowGroundUnderBox(ZP.x, ZP.z, 26, 26);
      const tiers = ZP.intact ? 4 : 3;
      let curY = g0 - 0.30;
      for (let t = 0; t < tiers; t++) {
        const wT = ZP.w * (1 - t * 0.18);
        const hT = (ZP.h + Math.abs(g0)) / tiers;
        addBox(targetGrp, wT, hT, wT, ZP.x, curY, ZP.z, 0, t % 2 === 0 ? MATS.ancientCeramic : MATS.cobaltGlaze, 5.5);
        addBox(targetGrp, wT + 2.4, hT * 0.85, wT * 0.36, ZP.x, curY, ZP.z, 0, MATS.travertineStone, 5.0);
        addBox(targetGrp, wT * 0.36, hT * 0.85, wT + 2.4, ZP.x, curY, ZP.z, 0, MATS.travertineStone, 5.0);
        curY += hT - 0.30;
      }

      if (ZP.intact) {
        addBox(targetGrp, 16.5, 5.8, 16.5, ZP.x, curY - 0.2, ZP.z, 0, MATS.travertineStone, 4.0);
        addCone(targetGrp, 12.6, 7.8, 4, ZP.x, curY + 5.2, ZP.z, Math.PI * 0.25, MATS.celadonRoof);
        addCone(targetGrp, 2.5, 5.5, 8, ZP.x, curY + 12.5, ZP.z, 0, MATS.giltChofa);
      } else {
        const wx = ZP.x + 32.0, wz = ZP.z + 10.0;
        const gw = lowGroundUnderBox(wx, wz, 5.2, 4.2);
        addBox(targetGrp, 10.4, 4.8, 8.4, wx, gw - 0.20, wz, 0.4, MATS.ancientCeramic, 4.0);
        mergeStaticGroup(targetGrp, null);
        targetGrp.updateMatrixWorld(true);
        if (typeof KRUINS !== 'undefined' && KRUINS.watch) {
          KRUINS.watch(targetGrp, { name: ZP.name, ground: terrainH });
        }
      }

      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'ziggurat_pod', key: ZP.id, name: ZP.name,
          at: [ZP.x, 12, ZP.z], ry: 0, size: [ZP.w, ZP.d, ZP.h]
        });
      }
    }

    mergeStaticGroup(coneGroup, dynamicMeshes);
    mergeStaticGroup(sumeruGroup, dynamicMeshes);
    sumeruGroup.updateMatrixWorld(true);
    if (typeof KDRAWN !== 'undefined' && KDRAWN.fromObject) {
      KDRAWN.add(KDRAWN.fromObject(sumeruGroup));
    }
    return { coneGroup: coneGroup, sumeruGroup: sumeruGroup, cyanCoilMat: cyanCoilMat };
  }

  return {
    uvScaleBox: uvScaleBox,
    uvScaleCyl: uvScaleCyl,
    addBox: addBox,
    addCyl: addCyl,
    addCone: addCone,
    mergeStaticGroup: mergeStaticGroup,
    lowGroundUnderBox: lowGroundUnderBox,
    buildCore: buildCore
  };
})();
