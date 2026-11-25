// ================================================================= FLOATING CITY — Stone Harbour Moles, Viaduct Funiculars & Bluff Paved Streets [draw]
// Builds:
//   1. Monumental D5 West & East Stone Harbour Moles (+7.8 m masonry rising from -25 m seabed, harbour steps, beacons & Santa Cristina Chime-Well)
//   2. Four 90-Second Cliff-Funicular Viaducts (grounded stone portal piers every 22 m up the cliff face, Lower Mole & Upper Esplanade
//      colonnaded terminal halls, twin paktong track girders, and 8 counterweighted stepped funicular cars — NEVER landing in the ocean!)
//   3. Mainland Crown Headland Paved Street Network (6 Avenues + 13 Cross-Streets draped on terrainH with stone kerbs, cliff-rim
//      balustrade & 8 belvedere overlook turrets, 6-pier Reservoir Stone Aqueduct Bridge, and 4 Flagstone Civic Squares)
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

    const dynamicCars = new Set();
    const hoistCars = [];

    /* -------------------------------------------------------------------
       1. D5 Monumental West & East Stone Harbour Moles (+7.8 m Deck, Solid from -25 m Seabed!)
       ------------------------------------------------------------------- */
    for (let m = 0; m < FC_SITE.HARBOUR_MOLES.length; m++) {
      const M = FC_SITE.HARBOUR_MOLES[m];
      const w = M.x1 - M.x0, d = M.zSouth - M.zNorth;
      const cx = (M.x0 + M.x1) * 0.5, cz = (M.zNorth + M.zSouth) * 0.5;
      const hMole = M.deckY - M.baseY;

      /* Battered Ancient concrete sea-breakwater core + dressed travertine harbour quay deck */
      addBox(moleFunGroup, w + 8.0, hMole - 1.6, d + 8.0, cx, M.baseY, cz, 0, MATS.ancientConcrete, 8.0);
      addBox(moleFunGroup, w, 1.8, d, cx, M.deckY - 1.8, cz, 0, MATS.travertineStone, 5.5);

      /* Paved harbour spine road & seawall coping */
      addBox(moleFunGroup, w - 16.0, 0.25, 16.0, cx, M.deckY - 0.05, M.zSouth - 62.0, 0, MATS.cobaltGlaze, 4.5);
      addBox(moleFunGroup, w, 0.95, 2.2, cx, M.deckY - 0.2, M.zSouth - 1.1, 0, MATS.cobaltGlaze, 4.0);

      /* Stepped Harbour Boat-Landing Ghats along the Southern Seaward Face */
      for (let st = 0; st < 4; st++) {
        const yStep = 2.2 + st * 1.4;
        addBox(moleFunGroup, w * 0.78, yStep - (-18.0), 3.6, cx, -18.0, M.zSouth + (4 - st) * 3.2, 0, MATS.travertineStone, 5.0);
      }

      /* Twin Mole-Head Harbour Lighthouses */
      const lx = m === 0 ? M.x1 - 12.0 : M.x0 + 12.0, lz = M.zSouth - 10.0;
      addCyl(moleFunGroup, 4.2, 5.6, 18.5, 10, lx, M.deckY - 0.3, lz, 0, MATS.ancientCeramic, 4.0);
      addCone(moleFunGroup, 5.2, 5.0, 10, lx, M.deckY + 17.8, lz, 0, MATS.giltChofa);

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
       2. Four Viaduct Cliff-Funiculars (Seated on +7.8 m Stone Harbour Moles -> +109 m Cliff-Lip Esplanade!)
       ------------------------------------------------------------------- */
    for (let i = 0; i < FC_SITE.CLIFF_HOISTS.length; i++) {
      const H = FC_SITE.CLIFF_HOISTS[i];
      const dx = H.x1 - H.x0, dy = (H.y1 + 4.5) - (H.y0 + 4.5), dz = H.z1 - H.z0;
      const len3 = Math.hypot(dx, dy, dz);
      const horiz = Math.hypot(dx, dz);
      const yaw = Math.atan2(dx, dz);
      const pitch = -Math.atan2(dy, horiz);

      /* A. Colonnaded Lower Mole Terminal Hall (seated squarely on +7.8 m Stone Harbour Mole!) */
      addBox(moleFunGroup, 22.0, 2.2, 20.0, H.x0, H.y0 - 0.8, H.z0 + 4.0, yaw, MATS.travertineStone, 4.5);
      addBox(moleFunGroup, 18.0, 10.5, 16.0, H.x0, H.y0 + 1.2, H.z0 + 4.0, yaw, MATS.ancientCeramic, 4.0);
      addBox(moleFunGroup, 20.0, 1.4, 18.0, H.x0, H.y0 + 11.4, H.z0 + 4.0, yaw, MATS.giltChofa, 3.5);
      addCone(moleFunGroup, 14.8, 6.8, 4, H.x0, H.y0 + 12.5, H.z0 + 4.0, yaw + Math.PI * 0.25, MATS.celadonRoof);

      /* B. Colonnaded Upper Bluff Esplanade Terminal Hall (opening directly onto the Grand Cliff-Lip Esplanade!) */
      const ug0 = Math.min(H.y1, terrainH(H.x1, H.z1 - 8.0)) - 3.0;
      addBox(moleFunGroup, 24.0, (H.y1 + 1.4) - ug0, 22.0, H.x1, ug0, H.z1 - 4.0, yaw, MATS.travertineStone, 5.0);
      addBox(moleFunGroup, 19.0, 11.5, 17.0, H.x1, H.y1 + 1.2, H.z1 - 4.0, yaw, MATS.ancientCeramic, 4.0);
      addBox(moleFunGroup, 21.0, 1.4, 19.0, H.x1, H.y1 + 12.4, H.z1 - 4.0, yaw, MATS.cobaltGlaze, 3.5);
      addCone(moleFunGroup, 15.6, 7.4, 4, H.x1, H.y1 + 13.5, H.z1 - 4.0, yaw + Math.PI * 0.25, MATS.celadonRoof);

      /* C. Grounded Stone Viaduct Portal Piers stepping up the cliff face every 22 m (0 unsupported track!) */
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

      /* D. Twin Double-Track Inclined Paktong Box-Girders + Central Walkway Deck */
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
      /* Merge railHolder beams into moleFunGroup after matrix update */

      /* E. Twin Counterweighted Stepped Funicular Cars passing at mid-slope */
      for (let trk = 0; trk < 2; trk++) {
        const car = new THREE.Group();
        const cab = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.6, 11.5), MATS.cypressHull);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.9, 12.0), trk === 0 ? MATS.giltChofa : MATS.celadonRoof);
        roof.position.y = 2.6;
        car.add(cab);
        car.add(roof);
        FC_SUMERU_CORE.mergeStaticGroup(car, null);
        car.rotation.y = yaw;
        root.add(car);
        hoistCars.push({ group: car, spec: H, phase: i * 0.22 + trk * 0.5, latX: (trk === 0 ? -2.8 : 2.8) });
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

    /* Flatten inclined railHolders into moleFunGroup before batching */
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
    mergeStaticGroup(moleFunGroup, dynamicCars);

    /* -------------------------------------------------------------------
       3. Mainland Bluff Draped Paved Streets, 6-Pier Reservoir Aqueduct Bridge & 4 Civic Squares
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
      const lift = W.cls === 'esplanade' ? 0.30 : (W.cls === 'avenue' ? 0.26 : 0.22);
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
          /* Carry Ave 0 (Esplanade) level at >= +104.5 m across the Upper Waterfall Reservoir on its Stone Aqueduct Bridge! */
          let vy = terrainH(vx, vz) + lift;
          if (W.isBridge && vx >= 475 && vx <= 750) {
            vy = Math.max(vy, 104.5);
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

    /* Append 4 Paved Flagstone Civic Squares into the same vertex-coloured street mesh (1 draw call total!) */
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
          const y = terrainH(x, z) + 0.28;
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
    }

    /* Reservoir 6-Pier Aqueduct Bridge Masonry + Cliff-Lip Stone Parapet & 8 Belvedere Overlook Turrets + Plaza Obelisks */
    {
      /* 6-Pier Stone Aqueduct Viaduct carrying the Grand Esplanade across the Upper Waterfall Reservoir (x = 485..740) */
      for (let bx = 490; bx <= 740; bx += 42) {
        const bz = FC_SITE.bluffShoreZ(bx) - 168.0;
        const g0 = terrainH(bx, bz) - 3.0;
        addBox(streetGroup, 10.5, 104.5 - g0, 22.0, bx, g0, bz, 0.2, MATS.ancientConcrete, 5.5);
      }
      const resMidZ = FC_SITE.bluffShoreZ(615) - 168.0;
      addBox(streetGroup, 268.0, 4.2, 21.5, 615, 100.3, resMidZ, 0.19, MATS.travertineStone, 6.0);
      addBox(streetGroup, 268.0, 1.4, 1.5, 615, 104.5, resMidZ + 9.8, 0.19, MATS.cobaltGlaze, 4.0);
      addBox(streetGroup, 268.0, 1.4, 1.5, 615, 104.5, resMidZ - 9.8, 0.19, MATS.cobaltGlaze, 4.0);

      /* 8 Cliff-Rim Belvedere Overlook Turrets along the Grand Esplanade */
      const belvX = [145, 265, 362, 462, 752, 855, 1020, 1210];
      for (let i = 0; i < belvX.length; i++) {
        const x = belvX[i], z = FC_SITE.bluffShoreZ(x) - 156.0;
        const gy = terrainH(x, z);
        addCyl(streetGroup, 5.8, 6.6, 9.0, 8, x, gy - 4.5, z, 0, MATS.travertineStone, 4.0);
        addCyl(streetGroup, 6.0, 6.1, 1.1, 8, x, gy + 4.2, z, 0, MATS.cobaltGlaze, 3.0);
      }

      /* 4 Monumental Gilt/Cobalt Civic Plaza Obelisk Fountains */
      for (let p = 0; p < FC_BLUFF_PLAN.PLAZAS.length; p++) {
        const PZ = FC_BLUFF_PLAN.PLAZAS[p];
        const px = 0.5 * (PZ.x0 + PZ.x1);
        const pz = FC_SITE.bluffShoreZ(px) - 0.5 * (PZ.d0 + PZ.d1);
        const py = terrainH(px, pz);
        addCyl(streetGroup, 5.2, 5.8, 2.2, 8, px, py - 1.0, pz, 0, MATS.cobaltGlaze, 3.5);
        addBox(streetGroup, 2.8, 11.5, 2.8, px, py + 1.0, pz, 0, MATS.travertineStone, 3.0);
        addCone(streetGroup, 2.1, 4.5, 4, px, py + 12.2, pz, Math.PI * 0.25, MATS.giltChofa);
      }
      mergeStaticGroup(streetGroup, null);
    }

    function update(tSec) {
      for (let i = 0; i < hoistCars.length; i++) {
        const hc = hoistCars[i], H = hc.spec;
        const u = 0.5 - 0.5 * Math.cos((2 * Math.PI * tSec / H.liftSec) + hc.phase * Math.PI * 2);
        hc.group.position.set(
          H.x0 + (H.x1 - H.x0) * u + hc.latX,
          (H.y0 + 6.8) + (H.y1 + 6.8 - H.y0 - 6.8) * u,
          H.z0 + (H.z1 - H.z0) * u
        );
      }
    }

    return { root: root, update: update };
  }

  return { buildAll: buildAll };
})();
