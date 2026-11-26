// ================================================================= FLOATING CITY — Stone Harbour Moles, Funiculars, 9-Avenue Bluff & Terraced Farms [draw]
// Builds:
//   1. Expanded D5 West & East Stone Harbour Moles (+7.8 m masonry rising from -28 m seabed, harbour steps, lighthouses & Chime-Well)
//   2. Four 90-Second Cliff-Funicular Viaducts (grounded piers, lower & upper colonnaded terminals, twin paktong girders, instanced cars!)
//   3. Mainland Crown Headland 9-Avenue, 19-Cross-Street, 6-Plaza Metropolis draped on terrainH + 6-Pier Reservoir Aqueduct Bridge
//   4. 16 Upland Terraced Farm & Tea/Citrus/Mulberry Orchard Estates behind the Bluff Metropolis (instanced terraces + crop rows!)
const FC_STREETS_MOLE = (function () {
  'use strict';

  function buildAll(scene, MATS, cityPlan, tagReg) {
    const root = new THREE.Group();
    root.name = 'fc_harbour_moles_funiculars_streets';
    scene.add(root);

    const addBox = FC_SUMERU_CORE.addBox;
    const addCyl = FC_SUMERU_CORE.addCyl;
    const addCone = FC_SUMERU_CORE.addCone;
    const mergeStaticGroup = FC_SUMERU_CORE.mergeStaticGroup;

    const moleFunGroup = new THREE.Group();
    moleFunGroup.name = 'fc_stone_moles_and_funiculars';
    root.add(moleFunGroup);

    const hoistCars = [];

    /* -------------------------------------------------------------------
       1. D5 Expanded West & East Stone Harbour Moles (+7.8 m Deck, Solid from -28 m Seabed!)
       ------------------------------------------------------------------- */
    for (let m = 0; m < FC_SITE.HARBOUR_MOLES.length; m++) {
      const M = FC_SITE.HARBOUR_MOLES[m];
      const w = M.x1 - M.x0, d = M.zSouth - M.zNorth;
      const cx = (M.x0 + M.x1) * 0.5, cz = (M.zNorth + M.zSouth) * 0.5;
      const hMole = M.deckY - M.baseY;

      addBox(moleFunGroup, w + 8.0, hMole - 1.6, d + 8.0, cx, M.baseY, cz, 0, MATS.ancientConcrete, 8.0);
      addBox(moleFunGroup, w, 1.8, d, cx, M.deckY - 1.8, cz, 0, MATS.travertineStone, 5.5);

      /* Twin paved harbour roads & seawall coping */
      addBox(moleFunGroup, w - 16.0, 0.25, 14.0, cx, M.deckY - 0.05, M.zSouth - 48.0, 0, MATS.cobaltGlaze, 4.5);
      addBox(moleFunGroup, w - 16.0, 0.25, 14.0, cx, M.deckY - 0.05, M.zSouth - 108.0, 0, MATS.cobaltGlaze, 4.5);
      addBox(moleFunGroup, w, 0.95, 2.4, cx, M.deckY - 0.2, M.zSouth - 1.2, 0, MATS.cobaltGlaze, 4.0);

      for (let st = 0; st < 4; st++) {
        const yStep = 2.2 + st * 1.4;
        addBox(moleFunGroup, w * 0.82, yStep - (-22.0), 3.6, cx, -22.0, M.zSouth + (4 - st) * 3.2, 0, MATS.travertineStone, 5.0);
      }

      const lx = m === 0 ? M.x1 - 14.0 : M.x0 + 14.0, lz = M.zSouth - 10.0;
      addCyl(moleFunGroup, 4.5, 5.8, 19.5, 10, lx, M.deckY - 0.3, lz, 0, MATS.ancientCeramic, 4.0);
      addCone(moleFunGroup, 5.5, 5.4, 10, lx, M.deckY + 18.8, lz, 0, MATS.giltChofa);

      if (typeof KWALK !== 'undefined' && KWALK.floor) {
        KWALK.floor({ rect: [M.x0 + 4, M.x1 - 4, M.zNorth + 4, M.zSouth - 4], y: M.deckY });
      }
      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'harbour_mole', key: M.id, name: M.name,
          at: [cx, M.deckY, cz], ry: 0, size: [w, d, hMole]
        });
      }
    }

    /* Santa Cristina Nephrite Tsunami-Drawdown Chime-Well Pavilion on West Stone Harbour Mole */
    {
      const CW = FC_SITE.CHIME_WELL;
      addCyl(moleFunGroup, 9.2, 10.2, 8.5, 12, CW.x, CW.rimY - 7.8, CW.z, 0, MATS.cobaltGlaze, 4.0);
      for (let c = 0; c < 8; c++) {
        const ca = (c * 45) * Math.PI / 180;
        addCyl(moleFunGroup, 0.55, 0.65, 5.8, 8, CW.x + 6.8 * Math.cos(ca), CW.rimY + 0.4, CW.z + 6.8 * Math.sin(ca), 0, MATS.paktongMetal, 2.0);
      }
      addCone(moleFunGroup, 8.4, 4.8, 8, CW.x, CW.rimY + 5.8, CW.z, 0, MATS.celadonRoof);
      if (tagReg) {
        tagReg.add({
          'class': 'feature', kind: 'tsunami_chime_well', key: CW.id,
          name: 'Santa Cristina Nephrite Tsunami-Drawdown Chime-Well (25 min early warning)',
          at: [CW.x, CW.rimY, CW.z], ry: 0, size: [19, 19, 14]
        });
      }
    }

    /* -------------------------------------------------------------------
       2. Four Viaduct Cliff-Funiculars (+7.8 m Stone Harbour Moles -> +108 m Cliff-Brow Promenade!)
       ------------------------------------------------------------------- */
    for (let i = 0; i < FC_SITE.CLIFF_HOISTS.length; i++) {
      const H = FC_SITE.CLIFF_HOISTS[i];
      const dx = H.x1 - H.x0, dy = (H.y1 + 4.5) - (H.y0 + 4.5), dz = H.z1 - H.z0;
      const len3 = Math.hypot(dx, dy, dz);
      const horiz = Math.hypot(dx, dz);
      const yaw = Math.atan2(dx, dz);
      const pitch = -Math.atan2(dy, horiz);

      addBox(moleFunGroup, 22.0, 2.2, 20.0, H.x0, H.y0 - 0.8, H.z0 + 4.0, yaw, MATS.travertineStone, 4.5);
      addBox(moleFunGroup, 18.0, 10.5, 16.0, H.x0, H.y0 + 1.2, H.z0 + 4.0, yaw, MATS.ancientCeramic, 4.0);
      addBox(moleFunGroup, 20.0, 1.4, 18.0, H.x0, H.y0 + 11.4, H.z0 + 4.0, yaw, MATS.giltChofa, 3.5);
      addCone(moleFunGroup, 14.8, 6.8, 4, H.x0, H.y0 + 12.5, H.z0 + 4.0, yaw + Math.PI * 0.25, MATS.celadonRoof);

      const ug0 = Math.min(H.y1, terrainH(H.x1, H.z1 - 8.0)) - 3.0;
      addBox(moleFunGroup, 24.0, (H.y1 + 1.4) - ug0, 22.0, H.x1, ug0, H.z1 - 4.0, yaw, MATS.travertineStone, 5.0);
      addBox(moleFunGroup, 19.0, 11.5, 17.0, H.x1, H.y1 + 1.2, H.z1 - 4.0, yaw, MATS.ancientCeramic, 4.0);
      addBox(moleFunGroup, 21.0, 1.4, 19.0, H.x1, H.y1 + 12.4, H.z1 - 4.0, yaw, MATS.cobaltGlaze, 3.5);
      addCone(moleFunGroup, 15.6, 7.4, 4, H.x1, H.y1 + 13.5, H.z1 - 4.0, yaw + Math.PI * 0.25, MATS.celadonRoof);

      const nPiers = 6;
      for (let p = 1; p < nPiers; p++) {
        const u = p / nPiers;
        const px = H.x0 + dx * u, pz = H.z0 + dz * u;
        const trackY = (H.y0 + 4.5) + dy * u;
        const gY = Math.min(H.y0 - 2.0, terrainH(px, pz) - 4.0);
        const pierH = Math.max(4.0, trackY - 1.0 - gY);
        addBox(moleFunGroup, 11.6, pierH, 5.2, px, gY, pz, yaw, MATS.ancientConcrete, 5.0);
        addBox(moleFunGroup, 12.8, 1.4, 6.2, px, gY + pierH - 1.2, pz, yaw, MATS.travertineStone, 3.5);
      }

      const railHolder = new THREE.Group();
      railHolder.position.set((H.x0 + H.x1) * 0.5, (H.y0 + H.y1 + 9.0) * 0.5, (H.z0 + H.z1) * 0.5);
      railHolder.rotation.y = yaw;
      moleFunGroup.add(railHolder);

      const deckBeam = new THREE.Mesh(FC_SUMERU_CORE.uvScaleBox(10.8, 1.8, len3, 5.0), MATS.travertineStone);
      deckBeam.rotation.x = pitch;
      railHolder.add(deckBeam);

      for (let sgn = -1; sgn <= 1; sgn += 2) {
        const rM = new THREE.Mesh(FC_SUMERU_CORE.uvScaleBox(1.4, 2.2, len3, 4.0), MATS.paktongMetal);
        rM.position.x = sgn * 3.2;
        rM.rotation.x = pitch;
        railHolder.add(rM);
      }

      for (let trk = 0; trk < 2; trk++) {
        hoistCars.push({ spec: H, yaw: yaw, phase: i * 0.22 + trk * 0.5, latX: (trk === 0 ? -2.8 : 2.8) });
      }

      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'cliff_hoist', key: H.id,
          name: 'Pioneer 90-Second Viaduct Cliff-Funicular ' + (i + 1),
          at: [(H.x0 + H.x1) * 0.5, (H.y0 + H.y1) * 0.5, (H.z0 + H.z1) * 0.5],
          ry: yaw, size: [14, len3, 20]
        });
      }
    }

    /* Instanced Funicular Cars (2 draw calls total instead of 8!) */
    const carCabIm = new THREE.InstancedMesh(new THREE.BoxGeometry(4.2, 4.6, 11.5), MATS.cypressHull, hoistCars.length);
    const carRoofIm = new THREE.InstancedMesh(new THREE.BoxGeometry(4.6, 0.9, 12.0), MATS.giltChofa, hoistCars.length);
    carCabIm.frustumCulled = false;
    carRoofIm.frustumCulled = false;
    root.add(carCabIm);
    root.add(carRoofIm);

    {
      const toLift = [];
      for (let c = 0; c < moleFunGroup.children.length; c++) {
        if (moleFunGroup.children[c].isGroup) toLift.push(moleFunGroup.children[c]);
      }
      moleFunGroup.updateMatrixWorld(true);
      for (let g = 0; g < toLift.length; g++) {
        const grp = toLift[g];
        while (grp.children.length) {
          const ch = grp.children[0];
          ch.applyMatrix4(grp.matrix);
          moleFunGroup.add(ch);
        }
        moleFunGroup.remove(grp);
      }
    }
    mergeStaticGroup(moleFunGroup, null);
    moleFunGroup.updateMatrixWorld(true);
    if (typeof KDRAWN !== 'undefined' && KDRAWN.fromObject) {
      KDRAWN.add(KDRAWN.fromObject(moleFunGroup));
    }

    /* -------------------------------------------------------------------
       3. Mainland Bluff 9-Avenue Paved Street Network, 6-Pier Reservoir Aqueduct Bridge & 6 Civic Plazas
       ------------------------------------------------------------------- */
    const streetGroup = new THREE.Group();
    streetGroup.name = 'fc_bluff_streets_and_plazas';
    root.add(streetGroup);

    const ways = cityPlan.bluffWays || [];
    const pos = [], nor = [], col = [], uv = [], idx = [];
    const cRoad = {
      esplanade: [0.84, 0.79, 0.70],
      avenue:    [0.78, 0.73, 0.64],
      main:      [0.72, 0.67, 0.59],
      side:      [0.67, 0.62, 0.54],
      cross:     [0.74, 0.69, 0.61]
    };

    for (let w = 0; w < ways.length; w++) {
      const W = ways[w], P = W.pts, hw = W.widthM * 0.5;
      if (P.length < 2) continue;
      const baseC = cRoad[W.cls] || cRoad.main;
      const lift = W.cls === 'esplanade' ? 0.32 : (W.cls === 'avenue' ? 0.28 : 0.24);
      const v0 = pos.length / 3;
      let sAlong = 0;

      for (let i = 0; i < P.length; i++) {
        if (i > 0) sAlong += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
        const pPrev = P[Math.max(0, i - 1)], pNext = P[Math.min(P.length - 1, i + 1)];
        let tx = pNext[0] - pPrev[0], tz = pNext[1] - pPrev[1];
        const tl = Math.hypot(tx, tz) || 1;
        tx /= tl; tz /= tl;
        const nx = -tz, nz = tx;

        const fracs = [-1.0, -0.76, 0.76, 1.0];
        for (let fi = 0; fi < 4; fi++) {
          const f = fracs[fi];
          const vx = P[i][0] + nx * hw * f;
          const vz = P[i][1] + nz * hw * f;
          let vy = terrainH(vx, vz) + lift;
          if (W.isBridge && vx >= 496 && vx <= 776) {
            vy = Math.max(vy, 108.5);
          }
          pos.push(vx, vy, vz);
          nor.push(0, 1, 0);
          const kerb = Math.abs(f) > 0.9 ? 0.72 : 1.0;
          col.push(baseC[0] * kerb, baseC[1] * kerb, baseC[2] * kerb);
          uv.push((f * hw) / 5.0, sAlong / 5.0);
        }
        if (i > 0) {
          for (let q = 0; q < 3; q++) {
            const A = v0 + (i - 1) * 4 + q, B = A + 4;
            idx.push(A, A + 1, B, A + 1, B + 1, B);
          }
        }
      }
    }

    /* Append 6 Paved Flagstone Civic Squares into the same vertex-coloured street mesh (1 draw call total!) */
    for (let p = 0; p < FC_BLUFF_PLAN.PLAZAS.length; p++) {
      const PZ = FC_BLUFF_PLAN.PLAZAS[p];
      const nx = 8, nz = 6;
      const v0 = pos.length / 3;
      for (let ix = 0; ix <= nx; ix++) {
        const x = PZ.x0 + (PZ.x1 - PZ.x0) * (ix / nx);
        const sz = FC_SITE.bluffShoreZ(x);
        for (let iz = 0; iz <= nz; iz++) {
          const d = PZ.d0 + (PZ.d1 - PZ.d0) * (iz / nz);
          const z = sz - d;
          const y = terrainH(x, z) + 0.30;
          pos.push(x, y, z);
          nor.push(0, 1, 0);
          const check = ((ix + iz) % 2 === 0) ? 0.88 : 0.78;
          col.push(check, check * 0.94, check * 0.84);
          uv.push(x / 5.0, z / 5.0);
        }
      }
      for (let ix = 0; ix < nx; ix++) {
        for (let iz = 0; iz < nz; iz++) {
          const a = v0 + ix * (nz + 1) + iz, b = a + 1, c = a + (nz + 1), d2 = c + 1;
          idx.push(a, c, b, b, c, d2);
        }
      }
    }

    if (pos.length) {
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      sg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      sg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      sg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      sg.setIndex(idx);
      sg.computeVertexNormals();
      const sm = new THREE.MeshStandardMaterial({
        map: MATS.travertineStone.map || null,
        normalMap: MATS.travertineStone.normalMap || null,
        roughness: 0.88,
        vertexColors: true,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -6
      });
      const sMesh = new THREE.Mesh(sg, sm);
      sMesh.renderOrder = 3;
      sMesh.userData = { kind: 'street' };
      root.add(sMesh);
      sMesh.updateMatrixWorld(true);
      if (typeof KDRAWN !== 'undefined' && KDRAWN.fromObject) KDRAWN.add(KDRAWN.fromObject(sMesh));
    }

    /* Reservoir 6-Pier Aqueduct Bridge Masonry + 12 Cliff-Rim Belvedere Overlook Turrets + 6 Plaza Obelisks */
    {
      for (let bx = 505; bx <= 765; bx += 44) {
        const bz = FC_SITE.bluffShoreZ(bx) - 168.0;
        const g0 = terrainH(bx, bz) - 3.0;
        addBox(streetGroup, 11.0, 108.5 - g0, 23.0, bx, g0, bz, 0.14, MATS.ancientConcrete, 5.5);
      }
      const resMidZ = FC_SITE.bluffShoreZ(636) - 168.0;
      addBox(streetGroup, 282.0, 4.4, 22.5, 636, 104.1, resMidZ, 0.14, MATS.travertineStone, 6.0);
      addBox(streetGroup, 282.0, 1.4, 1.5, 636, 108.5, resMidZ + 10.2, 0.14, MATS.cobaltGlaze, 4.0);
      addBox(streetGroup, 282.0, 1.4, 1.5, 636, 108.5, resMidZ - 10.2, 0.14, MATS.cobaltGlaze, 4.0);

      const belvX = [-780, -560, -340, -120, 95, 240, 390, 785, 945, 1140, 1360, 1560];
      for (let i = 0; i < belvX.length; i++) {
        const x = belvX[i], z = FC_SITE.bluffShoreZ(x) - 155.0;
        const gy = terrainH(x, z);
        addCyl(streetGroup, 5.8, 6.6, 9.2, 8, x, gy - 4.5, z, 0, MATS.travertineStone, 4.0);
        addCyl(streetGroup, 6.0, 6.1, 1.1, 8, x, gy + 4.4, z, 0, MATS.cobaltGlaze, 3.0);
      }

      for (let p = 0; p < FC_BLUFF_PLAN.PLAZAS.length; p++) {
        const PZ = FC_BLUFF_PLAN.PLAZAS[p];
        const px = 0.5 * (PZ.x0 + PZ.x1);
        const pz = FC_SITE.bluffShoreZ(px) - 0.5 * (PZ.d0 + PZ.d1);
        const py = terrainH(px, pz);
        addCyl(streetGroup, 5.4, 6.0, 2.2, 8, px, py - 1.0, pz, 0, MATS.cobaltGlaze, 3.5);
        addBox(streetGroup, 3.0, 12.0, 3.0, px, py + 1.0, pz, 0, MATS.travertineStone, 3.0);
        addCone(streetGroup, 2.2, 4.8, 4, px, py + 12.6, pz, Math.PI * 0.25, MATS.giltChofa);
      }
      mergeStaticGroup(streetGroup, null);
    }

    /* -------------------------------------------------------------------
       4. 16 Upland Terraced Farm & Tea/Citrus/Mulberry Orchard Estates (3 InstancedMeshes!)
       ------------------------------------------------------------------- */
    {
      const farms = cityPlan.uplandFarms || [];
      const wallRecs = [], bedRecs = [], rowRecs = [];
      const uCropCols = { tea: 0x3b843e, mulberry: 0x467e2e, citrus: 0x568c32, taro: 0x327444 };
      for (let i = 0; i < farms.length; i++) {
        const UF = farms[i];
        const sl = (FC_SITE.bluffShoreZ(UF.x + 12) - FC_SITE.bluffShoreZ(UF.x - 12)) / 24.0;
        const ry = Math.atan2(sl, 1.0);
        for (let t = 0; t < 3; t++) {
          const dStep = UF.dInland - 16.0 + t * 16.0;
          const tz = FC_SITE.bluffShoreZ(UF.x) - dStep;
          const ty = terrainH(UF.x, tz);
          wallRecs.push({ x: UF.x, y: ty - 1.2, z: tz, ry: ry, sx: UF.w, sy: 3.2, sz: 15.2 });
          bedRecs.push({ x: UF.x, y: ty + 0.52, z: tz, ry: ry, sx: UF.w - 1.6, sy: 0.35, sz: 13.8 });
          for (let r = -1; r <= 1; r++) {
            const rz = tz - r * 4.0;
            rowRecs.push({ x: UF.x, y: ty + 1.15, z: rz, ry: ry, sx: UF.w - 3.6, sy: 1.05, sz: 2.1, col: uCropCols[UF.crop] || 0x3b843e });
          }
        }
        if (tagReg) {
          const uz = FC_SITE.bluffShoreZ(UF.x) - UF.dInland;
          tagReg.add({
            id: UF.id,
            'class': 'feature',
            kind: 'terraced_farm',
            key: 'fc.bluff.terraced_farm',
            name: 'Crown Headland Terraced ' + UF.crop + ' Estate ' + (i + 1),
            at: [UF.x, terrainH(UF.x, uz), uz],
            ry: ry,
            size: [UF.w, UF.d, 4.0],
            tags: {
              culture: 'ria',
              types: ['farm'],
              job: 'farming',
              role: 'landuse:farm',
              zone: 'garden',
              harvest: UF.harvest
            }
          });
        }
      }

      if (wallRecs.length) {
        const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _y = new THREE.Vector3(0, 1, 0);
        const bGeo = new THREE.BoxGeometry(1, 1, 1);
        const wallIm = new THREE.InstancedMesh(bGeo, MATS.travertineStone, wallRecs.length);
        const loamMat = new THREE.MeshStandardMaterial({ color: 0x382a1e, roughness: 0.94 });
        const bedIm = new THREE.InstancedMesh(bGeo, loamMat, bedRecs.length);
        const rowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.80 });
        const rowIm = new THREE.InstancedMesh(bGeo, rowMat, rowRecs.length);
        const cTmp = new THREE.Color();

        for (let i = 0; i < wallRecs.length; i++) {
          const r = wallRecs[i];
          _p.set(r.x, r.y, r.z); _q.setFromAxisAngle(_y, r.ry); _s.set(r.sx, r.sy, r.sz); _m.compose(_p, _q, _s);
          wallIm.setMatrixAt(i, _m);
          const b = bedRecs[i];
          _p.set(b.x, b.y, b.z); _q.setFromAxisAngle(_y, b.ry); _s.set(b.sx, b.sy, b.sz); _m.compose(_p, _q, _s);
          bedIm.setMatrixAt(i, _m);
        }
        for (let i = 0; i < rowRecs.length; i++) {
          const r = rowRecs[i];
          _p.set(r.x, r.y, r.z); _q.setFromAxisAngle(_y, r.ry); _s.set(r.sx, r.sy, r.sz); _m.compose(_p, _q, _s);
          rowIm.setMatrixAt(i, _m);
          cTmp.setHex(r.col);
          rowIm.setColorAt(i, cTmp);
        }
        wallIm.instanceMatrix.needsUpdate = true;
        bedIm.instanceMatrix.needsUpdate = true;
        rowIm.instanceMatrix.needsUpdate = true;
        if (rowIm.instanceColor) rowIm.instanceColor.needsUpdate = true;
        if (typeof KCITY !== 'undefined' && KCITY.boundedInstanced) {
          KCITY.boundedInstanced(wallIm);
          KCITY.boundedInstanced(bedIm);
          KCITY.boundedInstanced(rowIm);
        }
        root.add(wallIm);
        root.add(bedIm);
        root.add(rowIm);
      }
    }

    const _mCar = new THREE.Matrix4(), _pCar = new THREE.Vector3(), _qCar = new THREE.Quaternion(), _sCar = new THREE.Vector3(1, 1, 1), _yCar = new THREE.Vector3(0, 1, 0);
    function update(tSec) {
      for (let i = 0; i < hoistCars.length; i++) {
        const hc = hoistCars[i], H = hc.spec;
        const u = 0.5 - 0.5 * Math.cos((2 * Math.PI * tSec / H.liftSec) + hc.phase * Math.PI * 2);
        const cx = H.x0 + (H.x1 - H.x0) * u + hc.latX;
        const cy = (H.y0 + 6.8) + (H.y1 - H.y0) * u;
        const cz = H.z0 + (H.z1 - H.z0) * u;
        _qCar.setFromAxisAngle(_yCar, hc.yaw);
        _pCar.set(cx, cy, cz);
        _mCar.compose(_pCar, _qCar, _sCar);
        carCabIm.setMatrixAt(i, _mCar);
        _pCar.set(cx, cy + 2.6, cz);
        _mCar.compose(_pCar, _qCar, _sCar);
        carRoofIm.setMatrixAt(i, _mCar);
      }
      carCabIm.instanceMatrix.needsUpdate = true;
      carRoofIm.instanceMatrix.needsUpdate = true;
    }
    update(0);

    return { root: root, update: update };
  }

  return { buildAll: buildAll };
})();
