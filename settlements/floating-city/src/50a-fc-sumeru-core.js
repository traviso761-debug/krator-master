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

  /* Non-overlapping cruciform box pair: full X-arm (armL x armW) + left/right Z-wings outside armW*0.5 (zero coplanar center overlap!) */
  function addCrossBoxes(grp, armL, armW, h, cx, yBot, cz, ry, mat, tileM) {
    const rot = ry == null ? 0 : ry;
    const tM = tileM == null ? 5.0 : tileM;
    addBox(grp, armL, h, armW, cx, yBot, cz, rot, mat, tM);
    const wingL = (armL - armW) * 0.5;
    if (wingL > 0.05) {
      const off = armW * 0.5 + wingL * 0.5;
      const c = Math.cos(rot), s = Math.sin(rot);
      addBox(grp, armW, h, wingL, cx + off * s, yBot, cz + off * c, rot, mat, tM);
      addBox(grp, armW, h, wingL, cx - off * s, yBot, cz - off * c, rot, mat, tM);
    }
  }

  /* Seamless mitered annular arc prism [rIn..rOut, yBot..yTop, deg0..deg1] with crisp per-face normals and zero chord overlaps */
  function addArcBand(grp, cx, cz, rIn, rOut, yBot, yTop, deg0, deg1, nSteps, mat, tileM) {
    const steps = Math.max(1, nSteps | 0);
    const spanDeg = deg1 - deg0;
    const fullLoop = Math.abs(Math.abs(spanDeg) - 360.0) < 1e-3;
    const sc = 1.0 / (tileM == null ? 6.0 : tileM);
    const pos = [], nor = [], uv = [], idx = [];

    function pushQuad(ax, ay, az, bx, by, bz, cx2, cy2, cz2, dx, dy, dz, nx, ny, nz, u0, v0, u1, v1) {
      const b = pos.length / 3;
      pos.push(ax, ay, az, bx, by, bz, cx2, cy2, cz2, dx, dy, dz);
      nor.push(nx, ny, nz, nx, ny, nz, nx, ny, nz, nx, ny, nz);
      uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }

    const rMid = 0.5 * (rIn + rOut);
    const h = yTop - yBot;
    const wRad = rOut - rIn;
    for (let k = 0; k < steps; k++) {
      const a0 = (deg0 + spanDeg * (k / steps)) * Math.PI / 180;
      const a1 = (deg0 + spanDeg * ((k + 1) / steps)) * Math.PI / 180;
      const c0 = Math.cos(a0), s0 = Math.sin(a0);
      const c1 = Math.cos(a1), s1 = Math.sin(a1);
      const cm = Math.cos(0.5 * (a0 + a1)), sm = Math.sin(0.5 * (a0 + a1));

      const ix0 = cx + rIn * c0,  iz0 = cz + rIn * s0;
      const ox0 = cx + rOut * c0, oz0 = cz + rOut * s0;
      const ix1 = cx + rIn * c1,  iz1 = cz + rIn * s1;
      const ox1 = cx + rOut * c1, oz1 = cz + rOut * s1;

      const sArc0 = (k / steps) * Math.abs(spanDeg * Math.PI / 180) * rMid * sc;
      const sArc1 = ((k + 1) / steps) * Math.abs(spanDeg * Math.PI / 180) * rMid * sc;

      /* Top (+Y) & Bottom (-Y) */
      pushQuad(ix0, yTop, iz0, ix1, yTop, iz1, ox1, yTop, oz1, ox0, yTop, oz0, 0, 1, 0, sArc0, 0, sArc1, wRad * sc);
      pushQuad(ix0, yBot, iz0, ox0, yBot, oz0, ox1, yBot, oz1, ix1, yBot, iz1, 0, -1, 0, sArc0, 0, sArc1, wRad * sc);
      /* Outer (+R) & Inner (-R) */
      pushQuad(ox0, yBot, oz0, ox0, yTop, oz0, ox1, yTop, oz1, ox1, yBot, oz1, cm, 0, sm, 0, sArc0, h * sc, sArc1);
      pushQuad(ix0, yBot, iz0, ix1, yBot, iz1, ix1, yTop, iz1, ix0, yTop, iz0, -cm, 0, -sm, 0, sArc0, sArc1, h * sc);

      if (!fullLoop && k === 0) {
        pushQuad(ix0, yBot, iz0, ix0, yTop, iz0, ox0, yTop, oz0, ox0, yBot, oz0, s0, 0, -c0, 0, 0, h * sc, wRad * sc);
      }
      if (!fullLoop && k === steps - 1) {
        pushQuad(ix1, yBot, iz1, ox1, yBot, oz1, ox1, yTop, oz1, ix1, yTop, iz1, -s1, 0, c1, 0, 0, wRad * sc, h * sc);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat);
    grp.add(m);
    return m;
  }

  /* Seamless mitered polyline walkway + side balustrade curbs with zero bend-to-bend coplanar overlap */
  function addRibbonWalk(grp, pts, widthM, deckH, yLift, curbW, curbH, deckMat, curbMat) {
    if (!pts || pts.length < 2) return;
    function buildStrip(lat0, lat1, dyBot, dyTop, mat, tileM) {
      const sc = 1.0 / tileM;
      const pos = [], nor = [], uv = [], idx = [];
      function pq(ax, ay, az, bx, by, bz, cx2, cy2, cz2, dx, dy, dz, nx, ny, nz, u0, v0, u1, v1) {
        const b = pos.length / 3;
        pos.push(ax, ay, az, bx, by, bz, cx2, cy2, cz2, dx, dy, dz);
        nor.push(nx, ny, nz, nx, ny, nz, nx, ny, nz, nx, ny, nz);
        uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
        idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
      }
      const n = pts.length;
      const Lx = [], Lz = [], Rx = [], Rz = [], Y0 = [], Y1 = [], Sx = [], Sz = [], sDist = [0];
      for (let i = 0; i < n; i++) {
        if (i > 0) sDist.push(sDist[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2]));
        const pA = pts[Math.max(0, i - 1)], pB = pts[Math.min(n - 1, i + 1)];
        let tx = pB[0] - pA[0], tz = pB[2] - pA[2];
        const tl = Math.hypot(tx, tz) || 1.0;
        tx /= tl; tz /= tl;
        /* Side vector S = (tz, 0, -tx) so T x S = +Y */
        const sx = tz, sz = -tx;
        Sx.push(sx); Sz.push(sz);
        Lx.push(pts[i][0] + sx * lat0); Lz.push(pts[i][2] + sz * lat0);
        Rx.push(pts[i][0] + sx * lat1); Rz.push(pts[i][2] + sz * lat1);
        Y0.push(pts[i][1] + dyBot); Y1.push(pts[i][1] + dyTop);
      }
      const wStrip = lat1 - lat0, hStrip = dyTop - dyBot;
      for (let i = 0; i < n - 1; i++) {
        const u0 = sDist[i] * sc, u1 = sDist[i + 1] * sc;
        pq(Lx[i], Y1[i], Lz[i], Lx[i + 1], Y1[i + 1], Lz[i + 1], Rx[i + 1], Y1[i + 1], Rz[i + 1], Rx[i], Y1[i], Rz[i], 0, 1, 0, u0, 0, u1, wStrip * sc);
        pq(Lx[i], Y0[i], Lz[i], Rx[i], Y0[i], Rz[i], Rx[i + 1], Y0[i + 1], Rz[i + 1], Lx[i + 1], Y0[i + 1], Lz[i + 1], 0, -1, 0, u0, 0, u1, wStrip * sc);
        pq(Rx[i], Y0[i], Rz[i], Rx[i], Y1[i], Rz[i], Rx[i + 1], Y1[i + 1], Rz[i + 1], Rx[i + 1], Y0[i + 1], Rz[i + 1], Sx[i], 0, Sz[i], 0, u0, hStrip * sc, u1);
        pq(Lx[i], Y0[i], Lz[i], Lx[i + 1], Y0[i + 1], Lz[i + 1], Lx[i + 1], Y1[i + 1], Lz[i + 1], Lx[i], Y1[i], Lz[i], -Sx[i], 0, -Sz[i], 0, u0, u1, hStrip * sc);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      g.computeBoundingSphere();
      grp.add(new THREE.Mesh(g, mat));
    }
    const hw = widthM * 0.5;
    buildStrip(-hw, hw, yLift - deckH, yLift, deckMat, 4.0);
    if (curbW > 0 && curbH > 0 && curbMat) {
      buildStrip(-hw - 0.15, -hw - 0.15 + curbW, yLift, yLift + curbH, curbMat, 3.0);
      buildStrip(hw + 0.15 - curbW, hw + 0.15, yLift, yLift + curbH, curbMat, 3.0);
    }
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
      { r: SM.plinthR,      y0: -26.0, y1:  6.2, mat: MATS.travertineStone, cloisterH: 5.0, garden: true },
      { r: SM.midCourtR,    y0:   5.8, y1: 14.0, mat: MATS.ancientCeramic,  cloisterH: 0.0, garden: true },
      { r: SM.upperCourtR,  y0:  13.6, y1: 22.0, mat: MATS.travertineStone, cloisterH: 5.0, garden: true },
      { r: SM.innerPodiumR, y0:  21.6, y1: 30.0, mat: MATS.ancientCeramic,  cloisterH: 0.0, garden: true }
    ];
    for (let i = 0; i < plinthTiers.length; i++) {
      const pt = plinthTiers[i];
      addCyl(sumeruGroup, pt.r * 0.975, pt.r, pt.y1 - pt.y0, 16, SM.cx, pt.y0, SM.cz, 0, pt.mat, 7.5);
      addCyl(sumeruGroup, pt.r * 0.985, pt.r * 0.992, 1.15, 16, SM.cx, pt.y1 - 1.45, SM.cz, 0, i % 2 === 1 ? MATS.giltChofa : MATS.cobaltGlaze, 4.0);

      /* Hanging Lotus & Orchid Terrace Planters around every Mandala Rim (skip Gopura bastion openings!) */
      if (pt.garden) {
        const nPlanter = 16;
        const rPl = pt.r - 2.6;
        for (let p = 0; p < nPlanter; p++) {
          const degP = (p + 0.5) * (360 / nPlanter);
          let hitBast = false;
          for (let b = 0; b < SM.bastions.length; b++) {
            let df = Math.abs(degP - (((SM.bastions[b].angDeg % 360) + 360) % 360));
            if (df > 180) df = 360 - df;
            if (df < 11.0 && pt.y1 <= SM.bastions[b].deckY + 0.5) { hitBast = true; break; }
          }
          if (hitBast) continue;
          const pa = degP * Math.PI / 180;
          const chord = 2 * rPl * Math.sin(Math.PI / nPlanter) * 0.68;
          const px = SM.cx + rPl * Math.cos(pa), pz = SM.cz + rPl * Math.sin(pa);
          addBox(sumeruGroup, 2.8, 0.95, chord, px, pt.y1, pz, -pa, MATS.travertineStone, 3.0);
          addBox(sumeruGroup, 2.4, 0.35, chord - 0.4, px, pt.y1 + 0.95, pz, -pa, hangingGardenMat, 2.0);
          if (p % 2 === 0) {
            addBox(sumeruGroup, 1.2, 0.36, chord * 0.45, px, pt.y1 + 1.30, pz, -pa, lotusBloomMat, 1.5);
          }
        }
      }

      /* Phra Rabieng Peristyle Cloister Galleries on Tiers 0 & 2 via seamless 16-gon addArcBand (0 corner overlaps!) */
      if (pt.cloisterH > 0) {
        const rCol = pt.r - 6.2;
        const nCol = i === 0 ? 56 : 40;
        for (let c = 0; c < nCol; c++) {
          const ca = (c / nCol) * Math.PI * 2;
          addCyl(sumeruGroup, 0.95, 1.18, pt.cloisterH, 8, SM.cx + rCol * Math.cos(ca), pt.y1, SM.cz + rCol * Math.sin(ca), 0, MATS.travertineStone, 3.0);
        }
        addArcBand(sumeruGroup, SM.cx, SM.cz, rCol - 8.2, rCol + 1.0, pt.y1 + pt.cloisterH, pt.y1 + pt.cloisterH + 0.95, 0, 360, 16, MATS.travertineStone, 4.0);
        addArcBand(sumeruGroup, SM.cx, SM.cz, rCol - 8.7, rCol + 1.5, pt.y1 + pt.cloisterH + 0.95, pt.y1 + pt.cloisterH + 2.15, 0, 360, 16, MATS.celadonRoof, 4.0);
      }
    }

    /* 8 Ceremonial Palace-Barge Docks & Grand Stepped Ghats around the Base of Sumeru (butting steps, 0 overlap) */
    for (let k = 0; k < 8; k++) {
      const a = (k * 45 + 12.0) * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a);
      for (let st = 0; st < 4; st++) {
        const rSt = SM.plinthR + 1.9 + st * 3.8;
        const ySt = 5.2 - st * 1.1;
        addBox(sumeruGroup, 3.8, ySt - (-18.0), 18.0, SM.cx + rSt * ux, -18.0, SM.cz + rSt * uz, -a, MATS.travertineStone, 4.5);
      }
    }

    /* 8 Gilded Bussabok Corner Spires on the Ministerial Ring (+14 m -> +48 m) */
    for (let k = 0; k < SM.cornerBussaboks.length; k++) {
      const CB = SM.cornerBussaboks[k];
      addCyl(sumeruGroup, CB.r * 0.72, CB.r, 17.8, 8, CB.x, CB.y0, CB.z, Math.PI / 8, MATS.ancientCeramic, 4.0);
      addBox(sumeruGroup, CB.r * 1.6, 1.2, CB.r * 1.6, CB.x, CB.y0 + 17.8, CB.z, -CB.ang, MATS.giltChofa, 3.0);
      addCone(sumeruGroup, CB.r * 0.96, 7.0, 8, CB.x, CB.y0 + 19.0, CB.z, Math.PI / 8, MATS.celadonRoof);
      addCone(sumeruGroup, CB.r * 0.34, CB.tipY - (CB.y0 + 25.4), 8, CB.x, CB.y0 + 25.4, CB.z, 0, MATS.giltChofa);
    }

    if (typeof KWALK !== 'undefined' && KWALK.floor) {
      KWALK.floor({ rect: [SM.cx - 128, SM.cx + 128, SM.cz - 128, SM.cz + 128], y: 22.0 });
    }

    /* 2. Six Vaulted Gopura Bridge-Bastions butted outside Sumeru tiers (zero radial overlap!) */
    for (let b = 0; b < SM.bastions.length; b++) {
      const BS = SM.bastions[b];
      const a = BS.angDeg * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a), nx = -uz, nz = ux;
      const rStart = BS.deckY > 18.0 ? SM.upperCourtR : SM.midCourtR;
      const len = BS.r1 - rStart;
      const midR = 0.5 * (rStart + BS.r1);
      const bx = SM.cx + midR * ux, bz = SM.cz + midR * uz;

      addBox(sumeruGroup, len, BS.deckY - (-24.0), BS.widthM, bx, -24.0, bz, -a, MATS.travertineStone, 7.0);
      addBox(sumeruGroup, len + 0.8, 1.15, BS.widthM + 1.6, bx, BS.deckY - 1.45, bz, -a, MATS.cobaltGlaze, 4.0);

      const rg = Math.max(rStart + 10.0, 192.0);
      const gx = SM.cx + rg * ux, gz = SM.cz + rg * uz;
      for (let sgn = -1; sgn <= 1; sgn += 2) {
        const px = gx + sgn * (BS.widthM * 0.36) * nx;
        const pz = gz + sgn * (BS.widthM * 0.36) * nz;
        addBox(sumeruGroup, 14.0, 19.8, 12.5, px, BS.deckY, pz, -a, MATS.ancientCeramic, 4.5);
        addBox(sumeruGroup, 15.4, 1.4, 13.8, px, BS.deckY + 19.8, pz, -a, MATS.giltChofa, 3.0);
        addCone(sumeruGroup, 9.6, 10.2, 4, px, BS.deckY + 21.2, pz, -a + Math.PI * 0.25, MATS.celadonRoof);
        addCone(sumeruGroup, 2.6, 8.0, 8, px, BS.deckY + 30.8, pz, 0, MATS.giltChofa);
      }
      const archSpanD = Math.max(3.6, BS.widthM * 0.72 - 12.6);
      addBox(sumeruGroup, 12.2, 6.0, archSpanD, gx, BS.deckY + 13.4, gz, -a, MATS.cobaltGlaze, 4.0);
      addBox(sumeruGroup, 13.4, 2.0, archSpanD, gx, BS.deckY + 19.4, gz, -a, MATS.celadonRoof, 4.0);
    }

    /* 3. Nine-Tiered Redented Ratha Maha-Meru Arcology Tower (+30.0 m -> +156.0 m -> +176.0 m Chatra Tip!) */
    const nTiers = 9;
    for (let t = 0; t < nTiers; t++) {
      const u = t / nTiers;
      const y0 = 30.0 + t * 13.8;
      const hT = 13.8;
      const rB = 58.0 * (1 - u * 0.72);
      const rT = rB * 0.91;

      addCyl(sumeruGroup, rT, rB, hT, 8, SM.cx, y0, SM.cz, Math.PI / 8, MATS.ancientCeramic, 5.5);

      const rathaW = rB * 0.56, rathaL = rB * 2.04;
      addCrossBoxes(sumeruGroup, rathaL, rathaW, hT - 2.9, SM.cx, y0, SM.cz, 0, MATS.ancientCeramic, 5.0);

      addCyl(sumeruGroup, rB * 0.955, rB * 0.96, 1.35, 8, SM.cx, y0 + 3.2, SM.cz, Math.PI / 8, warmLoggiaMat, 3.0);
      addCyl(sumeruGroup, rT * 0.985, rT * 0.99, 1.35, 8, SM.cx, y0 + 8.0, SM.cz, Math.PI / 8, warmLoggiaMat, 3.0);
      addCrossBoxes(sumeruGroup, rathaL + 0.5, rathaW * 0.78, 1.25, SM.cx, y0 + 5.6, SM.cz, 0, MATS.cobaltGlaze, 3.5);

      /* Stepped 8-point redented star cornices (>= 0.40 m vertical step, top -0.45 m below y0 + hT -> 0 coplanarity!) */
      addBox(sumeruGroup, rT * 2.02, 0.65, rT * 2.02, SM.cx, y0 + hT - 2.85, SM.cz, Math.PI / 4, MATS.travertineStone, 4.0);
      addBox(sumeruGroup, rT * 2.02, 0.65, rT * 2.02, SM.cx, y0 + hT - 2.45, SM.cz, 0, MATS.travertineStone, 4.0);
      addBox(sumeruGroup, rT * 2.14, 0.65, rT * 2.14, SM.cx, y0 + hT - 1.50, SM.cz, Math.PI / 4, MATS.giltChofa, 3.5);
      addBox(sumeruGroup, rT * 2.14, 0.65, rT * 2.14, SM.cx, y0 + hT - 1.10, SM.cz, 0, MATS.giltChofa, 3.5);

      addCyl(sumeruGroup, rT * 0.84, rT * 1.18, 2.8, 8, SM.cx, y0 + hT, SM.cz, Math.PI / 8, MATS.celadonRoof, 4.0);

      for (let c = 0; c < 8; c++) {
        const ca = (c * 45 + 22.5) * Math.PI / 180;
        const cr = rT * 0.96;
        const sx = SM.cx + cr * Math.cos(ca), sz = SM.cz + cr * Math.sin(ca);
        const sW = Math.max(2.0, rT * 0.16);
        addBox(sumeruGroup, sW, 2.4, sW, sx, y0 + hT + 2.8, sz, -ca, MATS.ancientCeramic, 2.5);
        addCone(sumeruGroup, sW * 0.72, 3.4, 4, sx, y0 + hT + 5.2, sz, -ca + Math.PI * 0.25, MATS.giltChofa);
      }
    }

    /* 4. Crowning Geodetic Tide-Lantern & Continuous-Mast 7-Umbrella Chatra Finial (+157.0 m -> +176.0 m) */
    addCyl(sumeruGroup, 11.5, 14.8, 4.4, 8, SM.cx, 157.0, SM.cz, Math.PI / 8, MATS.travertineStone, 4.0);
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.4, 6.4, 12), cyanCoilMat);
    lantern.position.set(SM.cx, 164.6, SM.cz);
    sumeruGroup.add(lantern);
    for (let r = 0; r < 8; r++) {
      const ra = (r * 45) * Math.PI / 180;
      addBox(sumeruGroup, 0.95, 6.4, 0.95, SM.cx + 8.6 * Math.cos(ra), 161.4, SM.cz + 8.6 * Math.sin(ra), -ra, MATS.paktongMetal, 2.0);
    }
    addCyl(sumeruGroup, 0.65, 3.8, 16.5, 10, SM.cx, 160.5, SM.cz, 0, MATS.giltChofa, 3.0);
    for (let u = 0; u < 5; u++) {
      const rUm = 9.0 * (1 - u * 0.16);
      addCyl(sumeruGroup, rUm * 0.35, rUm, 1.3, 12, SM.cx, 168.4 + u * 1.9, SM.cz, 0, MATS.giltChofa, 2.5);
    }

    /* 5. Four Diagonal +112 m Fluted Khmer-Soleri Prangs */
    for (let k = 0; k < SM.prangs.length; k++) {
      const P = SM.prangs[k];
      addCrossBoxes(sumeruGroup, P.rBase * 1.68, P.rBase * 1.24, 9.2, P.x, P.y0, P.z, 0, MATS.travertineStone, 4.5);
      addCrossBoxes(sumeruGroup, P.rBase * 1.76, P.rBase * 1.32, 2.0, P.x, P.y0 + 9.2, P.z, 0, MATS.celadonRoof, 4.0);

      let py = P.y0 + 11.2;
      for (let b = 0; b < 5; b++) {
        const sc = 1 - b * 0.14;
        const rB = P.rBase * 0.88 * sc;
        const hB = 11.0;
        addCyl(sumeruGroup, rB * 0.88, rB, hB, 8, P.x, py, P.z, Math.PI / 8, MATS.ancientCeramic, 4.5);
        addCrossBoxes(sumeruGroup, rB * 1.95, rB * 0.82, hB - 2.4, P.x, py, P.z, 0, MATS.ancientCeramic, 4.0);
        addCyl(sumeruGroup, rB * 0.92, rB * 0.94, 0.95, 8, P.x, py + 4.8, P.z, Math.PI / 8, warmLoggiaMat, 3.0);
        addCyl(sumeruGroup, rB * 0.82, rB * 1.06, 1.55, 8, P.x, py + hB - 1.95, P.z, Math.PI / 8, MATS.giltChofa, 3.0);
        py += hB;
      }
      addCyl(sumeruGroup, P.rBase * 0.22, P.rBase * 0.38, 4.4, 12, P.x, py, P.z, 0, MATS.celadonRoof, 3.0);
      addCone(sumeruGroup, P.rBase * 0.26, Math.max(4.0, P.tipY - (py + 4.4)), 10, P.x, py + 4.4, P.z, 0, MATS.giltChofa);
    }

    /* 6. Four Intercardinal +66 m 16-Column Peristyle Mondop Halls */
    for (let k = 0; k < SM.mondops.length; k++) {
      const MD = SM.mondops[k];
      const ry = -MD.ang;
      addBox(sumeruGroup, MD.w + 3.2, 3.1, MD.w + 3.2, MD.x, MD.y0, MD.z, ry, MATS.travertineStone, 4.5);
      addBox(sumeruGroup, MD.w * 0.66, 13.8, MD.w * 0.66, MD.x, MD.y0 + 3.1, MD.z, ry, MATS.cobaltGlaze, 4.0);
      const cs = Math.cos(ry), sn = Math.sin(ry), halfP = MD.w * 0.45;
      for (let ix = -1; ix <= 1; ix++) {
        for (let iz = -1; iz <= 1; iz++) {
          if (ix === 0 && iz === 0) continue;
          const lx = ix * halfP, lz = iz * halfP;
          const cx = MD.x + lx * cs + lz * sn, cz = MD.z - lx * sn + lz * cs;
          addCyl(sumeruGroup, 0.95, 1.15, 13.8, 8, cx, MD.y0 + 3.1, cz, 0, MATS.travertineStone, 3.0);
        }
      }
      addBox(sumeruGroup, MD.w + 1.4, 2.0, MD.w + 1.4, MD.x, MD.y0 + 16.9, MD.z, ry, MATS.travertineStone, 4.0);
      let my = MD.y0 + 18.9;
      for (let rt = 0; rt < 3; rt++) {
        const wR = (MD.w + 2.6) * (1 - rt * 0.24);
        addBox(sumeruGroup, wR, 1.0, wR, MD.x, my, MD.z, ry, MATS.giltChofa, 3.0);
        addCone(sumeruGroup, wR * 0.74, 4.8, 4, MD.x, my + 1.0, MD.z, ry + Math.PI * 0.25, MATS.celadonRoof);
        my += 4.8;
      }
      addCone(sumeruGroup, 3.0, Math.max(4.0, MD.tipY - my), 8, MD.x, my, MD.z, 0, MATS.giltChofa);
    }

    /* 7. Expanded Southern 5-Spire Bussabok Royal Audience Island + Twin Palace-Barge Docks */
    {
      const B = SM.bussabok;
      addBox(sumeruGroup, B.w + 10.0, 31.6, B.d + 10.0, B.cx, -28.5, B.cz, 0, MATS.ancientConcrete, 7.0);
      addBox(sumeruGroup, B.w, 5.4, B.d, B.cx, 3.1, B.cz, 0, MATS.travertineStone, 5.5);
      addBox(sumeruGroup, B.w + 1.4, 1.0, B.d + 1.4, B.cx, B.plinthY - 1.3, B.cz, 0, MATS.giltChofa, 3.5);
      /* Hanging orchid garden curb along southern royal barge quay */
      addBox(sumeruGroup, B.w - 16.0, 1.05, 2.6, B.cx, B.plinthY, B.cz + B.d * 0.5 - 2.0, 0, hangingGardenMat, 2.5);
      addBox(sumeruGroup, B.w * 0.55, 2.6 - (-24.0), 8.0, B.cx, -24.0, B.cz + B.d * 0.5 + 4.0, 0, MATS.travertineStone, 5.0);

      for (let i = 0; i < B.spires.length; i++) {
        const sp = B.spires[i];
        const sx = B.cx + sp.dx;
        const sz = B.cz + sp.dz;
        const hB = sp.tipY - B.plinthY - 11.2;
        addCyl(sumeruGroup, sp.r * 0.62, sp.r, hB, 8, sx, B.plinthY, sz, Math.PI / 8, MATS.ancientCeramic, 4.5);
        addBox(sumeruGroup, sp.r * 1.45, 1.2, sp.r * 1.45, sx, B.plinthY + hB, sz, 0, MATS.giltChofa, 3.0);
        addCone(sumeruGroup, sp.r * 0.88, 6.0, 8, sx, B.plinthY + hB + 1.2, sz, 0, MATS.celadonRoof);
        addCone(sumeruGroup, sp.r * 0.35, 6.2, 8, sx, B.plinthY + hB + 6.6, sz, 0, MATS.giltChofa);
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
        addCrossBoxes(targetGrp, wT + 2.4, wT * 0.36, hT * 0.84, ZP.x, curY, ZP.z, 0, MATS.travertineStone, 5.0);
        curY += hT;
      }

      if (ZP.intact) {
        addBox(targetGrp, 16.5, 5.6, 16.5, ZP.x, curY, ZP.z, 0, MATS.travertineStone, 4.0);
        addCone(targetGrp, 12.6, 7.8, 4, ZP.x, curY + 5.6, ZP.z, Math.PI * 0.25, MATS.celadonRoof);
        addCone(targetGrp, 2.5, 5.5, 8, ZP.x, curY + 12.8, ZP.z, 0, MATS.giltChofa);
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
    addCrossBoxes: addCrossBoxes,
    addArcBand: addArcBand,
    addRibbonWalk: addRibbonWalk,
    mergeStaticGroup: mergeStaticGroup,
    lowGroundUnderBox: lowGroundUnderBox,
    buildCore: buildCore
  };
})();
