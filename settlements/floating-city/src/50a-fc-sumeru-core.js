// ================================================================= FLOATING CITY — Kit-Quality Ancient Sumeru Arcology & Submarine Dynamo [draw]
// Builds:
//   A1. -12..-96 m Inverted Noahbabel Submarine Hydro-Dynamo Cone, -128 m Geodetic Taproot & SE Ruin Bays (KRUINS)
//   A3. Central 9+3-Peak Khao Phra Sumeru Arcology Mandala (+168 m): 3-tier Lotus Plinth with 48-column Phra Rabieng
//       cloister galleries, 5 Vaulted Gopura Bridge-Bastions locking the Boulevard-Dykes into the +22 m Mandala Court,
//       9-tier redented Ratha Maha-Meru tower with 36 storeys of warm-lit arcology loggias, corbelled cornices & seated
//       celadon roof skirts (0 floating rings!), 4 fluted Khmer Prangs (+98 m), 4 16-column Peristyle Mondops (+58 m),
//       and the 3-spire Bussabok Royal Audience Island
//   A5. 6 Stepped-Ziggurat Ancient Water-Pods (3 intact + 3 KRUINS)
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
    /* Warm-lit arcology window gallery material (merged into 1 draw call inside sumeruGroup!) */
    const warmLoggiaMat = new THREE.MeshStandardMaterial({
      color: 0xffd28a,
      emissive: 0xe69838,
      emissiveIntensity: 0.95,
      roughness: 0.35,
      metalness: 0.15
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
      { y0: -96, y1: -10, rTop: 74,  rBot: 82,  mat: MATS.ancientCeramic },
      { y0: -96, y1: -28, rTop: 90,  rBot: 98,  mat: MATS.ancientConcrete },
      { y0: -96, y1: -50, rTop: 104, rBot: 112, mat: MATS.ancientConcrete },
      { y0: -96, y1: -72, rTop: 118, rBot: 126, mat: MATS.ancientCeramic }
    ];
    for (let i = 0; i < coneTiers.length; i++) {
      const ct = coneTiers[i];
      addCyl(coneGroup, ct.rTop, ct.rBot, ct.y1 - ct.y0, 16, SC.cx, ct.y0, SC.cz, 0, ct.mat, 8.0);
    }

    /* 16 Radial Submarine Structural Buttress Ribs */
    for (let r = 0; r < 16; r++) {
      const a = (r * 22.5) * Math.PI / 180;
      addBox(coneGroup, 5.5, 84.0, 26.0, SC.cx + 92 * Math.cos(a), -96.0, SC.cz + 92 * Math.sin(a), -a + Math.PI * 0.5, MATS.ancientConcrete, 6.0);
    }

    const tapH = SC.taproot.yTop - SC.taproot.yBot;
    addCyl(coneGroup, SC.taproot.r * 0.88, SC.taproot.r, tapH, 12, SC.cx, SC.taproot.yBot, SC.cz, 0, MATS.ancientConcrete, 6.0);
    const pendBob = new THREE.Mesh(new THREE.OctahedronGeometry(6.5, 1), MATS.paktongMetal);
    pendBob.position.set(SC.cx, SC.taproot.pendulumY, SC.cz);
    coneGroup.add(pendBob);

    /* Surface Pioneer Flux-Ring Gallery & 8 Penstock Intake Pylons around Kolk Moat */
    {
      const rimFlux = new THREE.Mesh(new THREE.TorusGeometry(156.0, 1.45, 8, 48), cyanCoilMat);
      rimFlux.rotation.x = Math.PI * 0.5;
      rimFlux.position.set(SC.cx, 2.2, SC.cz);
      coneGroup.add(rimFlux);
      dynamicMeshes.add(rimFlux);
      for (let k = 0; k < 8; k++) {
        const a = (k * 45 + 22.5) * Math.PI / 180;
        const ix = SC.cx + 158.0 * Math.cos(a), iz = SC.cz + 158.0 * Math.sin(a);
        addBox(coneGroup, 9.5, 18.0, 9.5, ix, -12.0, iz, -a, MATS.paktongMetal, 3.5);
        const beacon = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 2.8, 8), cyanCoilMat);
        beacon.position.set(ix, 7.4, iz);
        coneGroup.add(beacon);
        dynamicMeshes.add(beacon);
      }
    }

    /* SE Submarine Ruin Bays (watched by KRUINS) + 8 Active Superconductor Turbines */
    const seRuinGroup = new THREE.Group();
    seRuinGroup.name = 'fc_ruin_se_turbine_bays';
    root.add(seRuinGroup);
    {
      const gMain = lowGroundUnderBox(SC.cx + 32, SC.cz + 32, 12, 12);
      const mainH = (-26.0) - (gMain - 0.3);
      addBox(seRuinGroup, 22, mainH, 22, SC.cx + 32, gMain - 0.3, SC.cz + 32, 0, MATS.ancientConcrete, 6.0);
    }

    for (let k = 0; k < SC.penstocks.length; k++) {
      const P = SC.penstocks[k];
      const rad = P.yCenter > -55 ? 108 : 92;
      const px = SC.cx + rad * P.ux, pz = SC.cz + rad * P.uz;
      const yaw = Math.atan2(P.ux, P.uz);
      if (P.status === 'pioneer-superconductor') {
        addBox(coneGroup, 10.5, 9.2, 22.0, px, P.yCenter - 4.6, pz, yaw, MATS.paktongMetal, 4.0);
        const coil = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.75, 8, 20), cyanCoilMat);
        coil.position.set(px + P.ux * 9.5, P.yCenter, pz + P.uz * 9.5);
        coil.rotation.y = yaw;
        coneGroup.add(coil);
        turbineRings.push(coil);
        dynamicMeshes.add(coil);
      } else {
        const wx = SC.cx + 64.0 * P.ux, wz = SC.cz + 64.0 * P.uz;
        const gBed = lowGroundUnderBox(wx, wz, 4.5, 3.8);
        addBox(seRuinGroup, 9.0, 5.4, 7.6, wx, gBed - 0.20, wz, yaw + 0.25, MATS.ancientConcrete, 4.0);
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
       A3. Kit-Quality Central Khao Phra Sumeru Arcology Mandala (+168 m)
       ------------------------------------------------------------------- */
    const SM = M.sumeru;
    const sumeruGroup = new THREE.Group();
    sumeruGroup.name = 'fc_khao_phra_sumeru';
    root.add(sumeruGroup);

    /* 1. Three-Tier Octagonal Lotus Plinth (-18 m -> +6.2 m -> +14.0 m -> +22.0 m) */
    const plinthTiers = [
      { r: 154, y0: -18.0, y1:  6.2, mat: MATS.travertineStone, cloisterH: 5.4 },
      { r: 130, y0:   6.0, y1: 14.0, mat: MATS.ancientCeramic,  cloisterH: 5.6 },
      { r: 108, y0:  13.8, y1: 22.0, mat: MATS.travertineStone, cloisterH: 0.0 }
    ];
    for (let i = 0; i < plinthTiers.length; i++) {
      const pt = plinthTiers[i];
      addCyl(sumeruGroup, pt.r * 0.97, pt.r, pt.y1 - pt.y0, 16, SM.cx, pt.y0, SM.cz, 0, pt.mat, 7.0);
      /* Moulded gilt-and-cobalt cornice band around each terrace lip */
      addCyl(sumeruGroup, pt.r * 0.985, pt.r * 0.99, 1.1, 16, SM.cx, pt.y1 - 1.0, SM.cz, 0, i === 1 ? MATS.giltChofa : MATS.cobaltGlaze, 4.0);

      /* Phra Rabieng Peristyle Cloister Galleries on Tiers 0 & 1 (40 fluted columns + entablature + seated celadon roof!) */
      if (pt.cloisterH > 0) {
        const rCol = pt.r - 5.5;
        const nCol = 40;
        for (let c = 0; c < nCol; c++) {
          const ca = (c / nCol) * Math.PI * 2;
          addCyl(sumeruGroup, 0.95, 1.15, pt.cloisterH, 8, SM.cx + rCol * Math.cos(ca), pt.y1 - 0.1, SM.cz + rCol * Math.sin(ca), 0, MATS.travertineStone, 3.0);
        }
        /* Continuous entablature & seated celadon cloister roof spanning inward to next tier wall (0 floating roof!) */
        for (let s = 0; s < 16; s++) {
          const sa = (s + 0.5) * (Math.PI * 2 / 16);
          const chord = 2 * rCol * Math.sin(Math.PI / 16) * 1.05;
          const gx = SM.cx + (rCol - 3.5) * Math.cos(sa), gz = SM.cz + (rCol - 3.5) * Math.sin(sa);
          addBox(sumeruGroup, 8.8, 1.2, chord, gx, pt.y1 + pt.cloisterH - 0.3, gz, -sa, MATS.travertineStone, 4.0);
          addBox(sumeruGroup, 9.6, 1.5, chord + 0.4, gx, pt.y1 + pt.cloisterH + 0.8, gz, -sa, MATS.celadonRoof, 4.0);
        }
      }
    }
    if (typeof KWALK !== 'undefined' && KWALK.floor) {
      KWALK.floor({ rect: [SM.cx - 96, SM.cx + 96, SM.cz - 96, SM.cz + 96], y: 22.0 });
    }

    /* 2. Five Vaulted Gopura Bridge-Bastions locking the 3 Boulevard-Dykes & 2 Causeways directly into Sumeru Hub! */
    for (let b = 0; b < SM.bastions.length; b++) {
      const BS = SM.bastions[b];
      const a = BS.angDeg * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a), nx = -uz, nz = ux;
      const len = BS.r1 - BS.r0;
      const midR = 0.5 * (BS.r0 + BS.r1);
      const bx = SM.cx + midR * ux, bz = SM.cz + midR * uz;

      /* Solid battered bastion bridge pier (-18 m -> BS.deckY = +22.0 m / +14.0 m) */
      addBox(sumeruGroup, len, BS.deckY - (-18.0), BS.widthM, bx, -18.0, bz, -a, MATS.travertineStone, 7.0);
      addBox(sumeruGroup, len + 1.0, 1.4, BS.widthM + 1.6, bx, BS.deckY - 1.2, bz, -a, MATS.cobaltGlaze, 4.0);

      /* Twin Flanking Khmer-Ancient Gopura Gate-Pylons & Triumphal Portal Arch at r = 128 m */
      const rg = 128.0;
      const gx = SM.cx + rg * ux, gz = SM.cz + rg * uz;
      for (let sgn = -1; sgn <= 1; sgn += 2) {
        const px = gx + sgn * (BS.widthM * 0.36) * nx;
        const pz = gz + sgn * (BS.widthM * 0.36) * nz;
        addBox(sumeruGroup, 13.0, 18.0, 11.5, px, BS.deckY - 0.2, pz, -a, MATS.ancientCeramic, 4.5);
        addBox(sumeruGroup, 14.2, 1.5, 12.6, px, BS.deckY + 17.5, pz, -a, MATS.giltChofa, 3.0);
        addCone(sumeruGroup, 8.8, 9.5, 4, px, BS.deckY + 18.8, pz, -a + Math.PI * 0.25, MATS.celadonRoof);
        addCone(sumeruGroup, 2.4, 7.0, 8, px, BS.deckY + 27.8, pz, 0, MATS.giltChofa);
      }
      /* Portal lintel bridge spanning solidly between the twin Gopura pylons */
      addBox(sumeruGroup, 11.5, 6.2, BS.widthM * 0.88, gx, BS.deckY + 12.0, gz, -a, MATS.cobaltGlaze, 4.0);
      addBox(sumeruGroup, 12.8, 2.2, BS.widthM * 0.92, gx, BS.deckY + 18.0, gz, -a, MATS.celadonRoof, 4.0);
    }

    /* 3. Nine-Tiered Redented Ratha Maha-Meru Arcology Tower (+22.0 m -> +148.0 m, 36 Inhabited Storeys, 0 Floating Parts!) */
    const nTiers = 9;
    for (let t = 0; t < nTiers; t++) {
      const u = t / nTiers;
      const y0 = 22.0 + t * 13.8;
      const hT = 14.2; /* 0.4 m vertical overlap into next tier */
      const rB = 52.0 * (1 - u * 0.72);
      const rT = rB * 0.91;

      /* Main octagonal core */
      addCyl(sumeruGroup, rT, rB, hT, 8, SM.cx, y0 - 0.2, SM.cz, Math.PI / 8, MATS.ancientCeramic, 5.5);

      /* 4 Cruciform Ratha Stepped Projections + Recessed Warm-Lit Habitation Loggias */
      const rathaW = rB * 0.56, rathaL = rB * 2.04;
      addBox(sumeruGroup, rathaL, hT - 2.2, rathaW, SM.cx, y0 - 0.2, SM.cz, 0, MATS.ancientCeramic, 5.0);
      addBox(sumeruGroup, rathaW, hT - 2.2, rathaL, SM.cx, y0 - 0.2, SM.cz, 0, MATS.ancientCeramic, 5.0);

      /* Cobalt spandrel bands + 2 warm-lit window loggia strips per tier (4 storeys per tier) */
      addCyl(sumeruGroup, rB * 0.955, rB * 0.96, 1.3, 8, SM.cx, y0 + 3.2, SM.cz, Math.PI / 8, warmLoggiaMat, 3.0);
      addCyl(sumeruGroup, rT * 0.985, rT * 0.99, 1.3, 8, SM.cx, y0 + 8.0, SM.cz, Math.PI / 8, warmLoggiaMat, 3.0);
      addBox(sumeruGroup, rathaL + 0.5, 1.2, rathaW * 0.78, SM.cx, y0 + 5.6, SM.cz, 0, MATS.cobaltGlaze, 3.5);
      addBox(sumeruGroup, rathaW * 0.78, 1.2, rathaL + 0.5, SM.cx, y0 + 5.6, SM.cz, 0, MATS.cobaltGlaze, 3.5);

      /* Stepped Box/Octagonal Corbel Brackets supporting the Celadon Roof Skirt (rTop <= rBot everywhere -> 0 air gaps!) */
      addBox(sumeruGroup, rT * 2.02, 1.2, rT * 2.02, SM.cx, y0 + hT - 2.4, SM.cz, 0, MATS.travertineStone, 4.0);
      addBox(sumeruGroup, rT * 2.02, 1.2, rT * 2.02, SM.cx, y0 + hT - 2.4, SM.cz, Math.PI / 4, MATS.travertineStone, 4.0);
      addBox(sumeruGroup, rT * 2.16, 1.1, rT * 2.16, SM.cx, y0 + hT - 1.3, SM.cz, 0, MATS.giltChofa, 3.5);
      addBox(sumeruGroup, rT * 2.16, 1.1, rT * 2.16, SM.cx, y0 + hT - 1.3, SM.cz, Math.PI / 4, MATS.giltChofa, 3.5);

      /* Seated Celadon Roof Skirt (bottom at y0 + hT - 0.35 embedded directly into gilt corbel!) */
      addCyl(sumeruGroup, rT * 0.84, rT * 1.18, 3.2, 8, SM.cx, y0 + hT - 0.35, SM.cz, Math.PI / 8, MATS.celadonRoof, 4.0);

      /* 8 Corner Sikhara Turrets seated squarely on the corbel corners */
      for (let c = 0; c < 8; c++) {
        const ca = (c * 45 + 22.5) * Math.PI / 180;
        const cr = rT * 0.96;
        const sx = SM.cx + cr * Math.cos(ca), sz = SM.cz + cr * Math.sin(ca);
        const sW = Math.max(1.8, rT * 0.16);
        addBox(sumeruGroup, sW, 2.8, sW, sx, y0 + hT - 0.3, sz, -ca, MATS.ancientCeramic, 2.5);
        addCone(sumeruGroup, sW * 0.72, 3.4, 4, sx, y0 + hT + 2.3, sz, -ca + Math.PI * 0.25, MATS.giltChofa);
      }
    }

    /* 4. Crowning Geodetic Tide-Lantern & Continuous-Mast 7-Umbrella Chatra Finial (+145 m -> +168 m) */
    addCyl(sumeruGroup, 10.5, 13.5, 6.5, 8, SM.cx, 145.5, SM.cz, Math.PI / 8, MATS.travertineStone, 4.0);
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 7.8, 6.8, 12), cyanCoilMat);
    lantern.position.set(SM.cx, 154.8, SM.cz);
    sumeruGroup.add(lantern);
    /* 8 Paktong Cage Ribs framing the Lantern + Continuous Central Spire Mast up to +168 m */
    for (let r = 0; r < 8; r++) {
      const ra = (r * 45) * Math.PI / 180;
      addBox(sumeruGroup, 0.9, 7.4, 0.9, SM.cx + 8.0 * Math.cos(ra), 151.4, SM.cz + 8.0 * Math.sin(ra), -ra, MATS.paktongMetal, 2.0);
    }
    addCyl(sumeruGroup, 0.6, 3.4, 17.5, 10, SM.cx, 150.5, SM.cz, 0, MATS.giltChofa, 3.0);
    for (let u = 0; u < 5; u++) {
      const rUm = 8.4 * (1 - u * 0.16);
      addCyl(sumeruGroup, rUm * 0.35, rUm, 1.3, 12, SM.cx, 158.0 + u * 2.1, SM.cz, 0, MATS.giltChofa, 2.5);
    }

    /* 5. Four Diagonal +98 m Fluted Khmer-Soleri Prangs (Cruciform Base + 5 Overlapping Bhumi Tiers) */
    for (let k = 0; k < SM.prangs.length; k++) {
      const P = SM.prangs[k];
      /* Cruciform stepped pedestal + 4 porch mandapas */
      addBox(sumeruGroup, P.rBase * 2.1, 8.5, P.rBase * 1.4, P.x, P.y0 - 0.3, P.z, 0, MATS.travertineStone, 4.5);
      addBox(sumeruGroup, P.rBase * 1.4, 8.5, P.rBase * 2.1, P.x, P.y0 - 0.3, P.z, 0, MATS.travertineStone, 4.5);
      addBox(sumeruGroup, P.rBase * 2.2, 2.2, P.rBase * 1.5, P.x, P.y0 + 7.9, P.z, 0, MATS.celadonRoof, 4.0);
      addBox(sumeruGroup, P.rBase * 1.5, 2.2, P.rBase * 2.2, P.x, P.y0 + 7.9, P.z, 0, MATS.celadonRoof, 4.0);

      /* 5 Stacked Redented Bhumi Tiers (every tier overlaps 0.4 m into the one below!) */
      let py = P.y0 + 9.6;
      for (let b = 0; b < 5; b++) {
        const sc = 1 - b * 0.14;
        const rB = P.rBase * 0.88 * sc;
        const hB = 9.8;
        addCyl(sumeruGroup, rB * 0.88, rB, hB, 8, P.x, py - 0.3, P.z, Math.PI / 8, MATS.ancientCeramic, 4.5);
        addBox(sumeruGroup, rB * 1.95, hB - 1.5, rB * 0.82, P.x, py - 0.3, P.z, 0, MATS.ancientCeramic, 4.0);
        addBox(sumeruGroup, rB * 0.82, hB - 1.5, rB * 1.95, P.x, py - 0.3, P.z, 0, MATS.ancientCeramic, 4.0);
        addCyl(sumeruGroup, rB * 0.92, rB * 0.94, 0.9, 8, P.x, py + 4.2, P.z, Math.PI / 8, warmLoggiaMat, 3.0);
        addCyl(sumeruGroup, rB * 0.82, rB * 1.06, 1.8, 8, P.x, py + hB - 1.6, P.z, Math.PI / 8, MATS.giltChofa, 3.0);
        py += hB - 0.4;
      }
      /* Lotus Amalaka & Gilt Vajra Finial */
      addCyl(sumeruGroup, P.rBase * 0.22, P.rBase * 0.38, 4.5, 12, P.x, py - 0.4, P.z, 0, MATS.celadonRoof, 3.0);
      addCone(sumeruGroup, P.rBase * 0.26, P.tipY - (py + 3.6), 10, P.x, py + 3.6, P.z, 0, MATS.giltChofa);
    }

    /* 6. Four Intercardinal +58 m 16-Column Peristyle Mondop Halls (Solid Columns + Entablature + 4-Tier Pyatthat Roof!) */
    for (let k = 0; k < SM.mondops.length; k++) {
      const MD = SM.mondops[k];
      const ry = -MD.ang;
      /* Stepped podium */
      addBox(sumeruGroup, MD.w + 3.0, 3.2, MD.w + 3.0, MD.x, MD.y0 - 0.3, MD.z, ry, MATS.travertineStone, 4.5);
      /* Inner cobalt-glazed sanctuary cella */
      addBox(sumeruGroup, MD.w * 0.66, 12.5, MD.w * 0.66, MD.x, MD.y0 + 2.7, MD.z, ry, MATS.cobaltGlaze, 4.0);
      /* 12 Perimeter Peristyle Columns around the 4 sides */
      const cs = Math.cos(ry), sn = Math.sin(ry), halfP = MD.w * 0.45;
      for (let ix = -1; ix <= 1; ix++) {
        for (let iz = -1; iz <= 1; iz++) {
          if (ix === 0 && iz === 0) continue;
          const lx = ix * halfP, lz = iz * halfP;
          const cx = MD.x + lx * cs + lz * sn, cz = MD.z - lx * sn + lz * cs;
          addCyl(sumeruGroup, 0.9, 1.1, 12.2, 8, cx, MD.y0 + 2.8, cz, 0, MATS.travertineStone, 3.0);
        }
      }
      /* Full Entablature Beam resting on the columns */
      addBox(sumeruGroup, MD.w + 1.2, 2.0, MD.w + 1.2, MD.x, MD.y0 + 14.8, MD.z, ry, MATS.travertineStone, 4.0);
      /* 3-Tiered Stepped Celadon + Gilt Pyatthat Roof seated directly on the Entablature (0 gaps!) */
      let my = MD.y0 + 16.5;
      for (let rt = 0; rt < 3; rt++) {
        const wR = (MD.w + 2.4) * (1 - rt * 0.24);
        addBox(sumeruGroup, wR, 1.1, wR, MD.x, my - 0.2, MD.z, ry, MATS.giltChofa, 3.0);
        addCone(sumeruGroup, wR * 0.74, 4.6, 4, MD.x, my + 0.7, MD.z, ry + Math.PI * 0.25, MATS.celadonRoof);
        my += 4.2;
      }
      addCone(sumeruGroup, 2.8, MD.tipY - (my - 0.3), 8, MD.x, my - 0.3, MD.z, 0, MATS.giltChofa);
    }

    /* 7. Southern 3-Spire Bussabok Royal Audience Island */
    {
      const B = SM.bussabok;
      addBox(sumeruGroup, B.w + 8.0, 18.0, B.d + 8.0, B.cx, -14.5, B.cz, 0, MATS.ancientConcrete, 7.0);
      addBox(sumeruGroup, B.w, 5.4, B.d, B.cx, 3.1, B.cz, 0, MATS.travertineStone, 5.5);
      addBox(sumeruGroup, B.w + 1.2, 1.1, B.d + 1.2, B.cx, B.plinthY - 1.1, B.cz, 0, MATS.giltChofa, 3.5);
      for (let i = 0; i < B.spires.length; i++) {
        const sp = B.spires[i];
        /* Place flanking spires at x = +-46 m leaving central court open for Hongsa Prasat */
        const sx = B.cx + (i === 1 ? 0 : sp.dx * 1.18);
        const sz = B.cz + (i === 1 ? -18.0 : 0.0);
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
        name: 'Khao Phra Sumeru 9+3-Peak Ancient Arcology Mandala (+168 m)',
        at: [SM.cx, 84, SM.cz], ry: 0, size: [310, 310, 168]
      });
    }

    /* -------------------------------------------------------------------
       A5. 6 Outer Stepped-Ziggurat Ancient Water-Pods (3 Intact + 3 KRUINS)
       ------------------------------------------------------------------- */
    for (let i = 0; i < M.zigguratPods.length; i++) {
      const ZP = M.zigguratPods[i];
      const pGrp = new THREE.Group();
      pGrp.name = 'fc_ziggurat_' + ZP.code;
      root.add(pGrp);

      const g0 = lowGroundUnderBox(ZP.x, ZP.z, 25, 25);
      const tiers = ZP.intact ? 4 : 3;
      let curY = g0 - 0.25;
      for (let t = 0; t < tiers; t++) {
        const wT = ZP.w * (1 - t * 0.18);
        const hT = (ZP.h + Math.abs(g0)) / tiers;
        addBox(pGrp, wT, hT, wT, ZP.x, curY, ZP.z, 0, t % 2 === 0 ? MATS.ancientCeramic : MATS.cobaltGlaze, 5.5);
        /* Corner buttresses */
        addBox(pGrp, wT + 2.4, hT * 0.85, wT * 0.36, ZP.x, curY, ZP.z, 0, MATS.travertineStone, 5.0);
        addBox(pGrp, wT * 0.36, hT * 0.85, wT + 2.4, ZP.x, curY, ZP.z, 0, MATS.travertineStone, 5.0);
        curY += hT - 0.25;
      }

      if (ZP.intact) {
        addBox(pGrp, 16.0, 5.5, 16.0, ZP.x, curY - 0.2, ZP.z, 0, MATS.travertineStone, 4.0);
        addCone(pGrp, 12.2, 7.5, 4, ZP.x, curY + 5.0, ZP.z, Math.PI * 0.25, MATS.celadonRoof);
        addCone(pGrp, 2.4, 5.2, 8, ZP.x, curY + 12.0, ZP.z, 0, MATS.giltChofa);
      } else {
        const wx = ZP.x + 31.0, wz = ZP.z + 10.0;
        const gw = lowGroundUnderBox(wx, wz, 5.0, 4.0);
        addBox(pGrp, 10.0, 4.6, 8.0, wx, gw - 0.15, wz, 0.4, MATS.ancientCeramic, 4.0);
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

    mergeStaticGroup(coneGroup, dynamicMeshes);
    mergeStaticGroup(sumeruGroup, dynamicMeshes);
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
