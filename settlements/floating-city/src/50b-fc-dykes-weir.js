// ================================================================= FLOATING CITY — 2,040 m Sea-Ring Weir, 8 Venetian Harbour Quays & 4 Boulevard-Dykes [draw]
// Builds:
//   A2. 2,040 m (R=1,020 m) Circular Arcaded Sea-Ring Weir (108 wave-buttress segments, 18 watch-turrets, 8 Wide Venetian
//       Harbour-Quay Masonry Shelves at +6.2 m with twin concentric cobalt ring-streets, 4 twin-keep Sector Locks)
//   A4. 4 Colossal Radial Boulevard-Dykes (r=96..1,016 m, 48..50 m-wide +22 m crowns, paired 156 m-wide +6.2 m masonry quays
//       with paved waterfront market streets, 16 barge-gates + reversible tide-wheels, + 9-span NNE Arched Sea-Viaduct!)
//   A4b. 16 8-Column Sala-Nam Water Pavilions + Instanced Market Awnings & Warm Amber Street-Lanterns across all dykes & quays!
const FC_SUMERU_DRAW = (function () {
  'use strict';

  function buildAll(scene, MATS, tagReg, subClipPlanes) {
    const M = FC_MEGA.plan();
    const root = new THREE.Group();
    root.name = 'fc_ancient_sumeru_noahbabel';
    scene.add(root);

    const tideWheels = [];
    const miterGates = [];
    const turbineRings = [];
    const dynamicMeshes = new Set();

    const addBox = FC_SUMERU_CORE.addBox;
    const addCyl = FC_SUMERU_CORE.addCyl;
    const addCone = FC_SUMERU_CORE.addCone;
    const mergeStaticGroup = FC_SUMERU_CORE.mergeStaticGroup;
    const lowGroundUnderBox = FC_SUMERU_CORE.lowGroundUnderBox;

    const coreOut = FC_SUMERU_CORE.buildCore(M, root, MATS, tagReg, subClipPlanes, dynamicMeshes, turbineRings);

    /* -------------------------------------------------------------------
       A2. 2,040 m Circular Arcaded Sea-Ring Weir, 8 Venetian Harbour Quays & 4 Locks
       ------------------------------------------------------------------- */
    const SR = M.seaRing;
    const weirGroup = new THREE.Group();
    weirGroup.name = 'fc_noahbabel_sea_ring';
    root.add(weirGroup);

    const nSeg = 108;
    const lockAngles = SR.locks.map(function (L) { return ((L.angDeg % 360) + 360) % 360; });
    const rMid = 0.5 * (SR.rOuter + SR.rInner);
    const ringW = SR.rOuter - SR.rInner;
    const segLen = (2 * Math.PI * rMid) / nSeg * 1.04;

    const lanternRecs = [];
    const stallRecs = [];

    for (let s = 0; s < nSeg; s++) {
      const deg = (s + 0.5) * (360 / nSeg);
      let inLock = false;
      for (let li = 0; li < lockAngles.length; li++) {
        let diff = Math.abs(deg - lockAngles[li]);
        if (diff > 180) diff = 360 - diff;
        if (diff < 2.2) { inLock = true; break; }
      }
      if (inLock) continue;

      const rad = deg * Math.PI / 180;
      const ux = Math.cos(rad), uz = Math.sin(rad);
      const sx = SR.cx + rMid * ux, sz = SR.cz + rMid * uz;
      const bed = Math.min(-28.0, terrainH(sx, sz) - 1.0);
      const hWeir = SR.promenadeY - bed;
      const inScar = deg >= SR.scarArcDeg[0] && deg <= SR.scarArcDeg[1];

      /* Main sea-ring casemate wall & rampart deck */
      addBox(weirGroup, ringW, hWeir, segLen, sx, bed, sz, -rad, inScar ? MATS.cobaltGlaze : MATS.ancientConcrete, 7.5);
      addBox(weirGroup, 10.5, hWeir - 2.0, 8.0, SR.cx + (SR.rOuter + 3.6) * ux, bed, SR.cz + (SR.rOuter + 3.6) * uz, -rad, MATS.ancientConcrete, 5.5);

      /* Travertine promenade deck + cobalt rampart road + ocean/lagoon parapets */
      addBox(weirGroup, ringW + 2.0, 1.5, segLen, sx, SR.promenadeY - 1.2, sz, -rad, MATS.travertineStone, 5.0);
      addBox(weirGroup, 9.5, 0.25, segLen, SR.cx + (SR.rOuter - 6.5) * ux, SR.promenadeY + 0.2, SR.cz + (SR.rOuter - 6.5) * uz, -rad, MATS.cobaltGlaze, 4.5);
      addBox(weirGroup, 1.8, 1.5, segLen, SR.cx + (SR.rOuter - 0.8) * ux, SR.promenadeY, SR.cz + (SR.rOuter - 0.8) * uz, -rad, MATS.celadonRoof, 4.0);
      addBox(weirGroup, 1.4, 1.2, segLen, SR.cx + (SR.rInner + 0.8) * ux, SR.promenadeY, SR.cz + (SR.rInner + 0.8) * uz, -rad, MATS.travertineStone, 4.0);

      if (s % 2 === 0) {
        lanternRecs.push({ x: SR.cx + (SR.rOuter - 2.4) * ux, y: SR.promenadeY, z: SR.cz + (SR.rOuter - 2.4) * uz });
      }

      /* 18 Octagonal Ocean Watch-Turrets */
      if (s % 6 === 0 && !inScar) {
        const tx = SR.cx + (SR.rOuter - 3.2) * ux, tz = SR.cz + (SR.rOuter - 3.2) * uz;
        addCyl(weirGroup, 6.4, 7.0, 11.2, 8, tx, SR.promenadeY - 0.2, tz, 0, MATS.ancientCeramic, 4.0);
        addCone(weirGroup, 7.5, 6.2, 8, tx, SR.promenadeY + 10.6, tz, 0, MATS.celadonRoof);
        addCone(weirGroup, 1.6, 4.0, 8, tx, SR.promenadeY + 16.4, tz, 0, MATS.giltChofa);
      }

      if (typeof KWALK !== 'undefined' && KWALK.floor) {
        KWALK.floor({ rect: [sx - 16, sx + 16, sz - 16, sz + 16], y: SR.promenadeY });
      }
    }

    /* 8 Wide Inner Venetian Harbour-Quay Masonry Shelves (+6.2 m terrace from r = 896..986 m = 90 m radial depth!) */
    for (let q = 0; q < SR.quays.length; q++) {
      const Q = SR.quays[q];
      let spanDeg = Q.ang1 - Q.ang0;
      if (spanDeg < 0) spanDeg += 360;
      const nChord = Math.max(4, Math.ceil(spanDeg / 2.8));
      const dDeg = spanDeg / nChord;
      const rQMid = 0.5 * (Q.rIn + Q.rOut);
      const qDepth = (Q.rOut - Q.rIn) + 3.5;
      for (let c = 0; c < nChord; c++) {
        const deg = Q.ang0 + (c + 0.5) * dDeg;
        const rad = deg * Math.PI / 180;
        const ux = Math.cos(rad), uz = Math.sin(rad);
        const qx = SR.cx + rQMid * ux, qz = SR.cz + rQMid * uz;
        const chordLen = 2 * Q.rOut * Math.sin((dDeg * 0.5) * Math.PI / 180) * 1.08;

        addBox(weirGroup, qDepth, Q.deckY - (-30.0), chordLen, qx, -30.0, qz, -rad, MATS.travertineStone, 7.5);
        /* Canal embankment coping + Twin Concentric Paved Ring-Streets at r=956.5 m & r=925.0 m */
        addBox(weirGroup, 2.6, 0.8, chordLen, SR.cx + (Q.rIn + 1.2) * ux, Q.deckY - 0.35, SR.cz + (Q.rIn + 1.2) * uz, -rad, Q.style === 'suudme' ? MATS.cobaltGlaze : MATS.giltChofa, 3.5);
        addBox(weirGroup, 9.5, 0.25, chordLen, SR.cx + 957.0 * ux, Q.deckY - 0.05, SR.cz + 957.0 * uz, -rad, MATS.cobaltGlaze, 4.5);
        addBox(weirGroup, 9.5, 0.25, chordLen, SR.cx + 925.5 * ux, Q.deckY - 0.05, SR.cz + 925.5 * uz, -rad, MATS.cobaltGlaze, 4.5);
        /* Waterfront boat-step apron (+2.5 m) */
        addBox(weirGroup, 4.6, 2.5 - (-26.0), chordLen * 0.94, SR.cx + (Q.rIn - 2.0) * ux, -26.0, SR.cz + (Q.rIn - 2.0) * uz, -rad, MATS.ancientConcrete, 5.5);

        lanternRecs.push({ x: SR.cx + 899.0 * ux, y: Q.deckY, z: SR.cz + 899.0 * uz });
        stallRecs.push({ x: SR.cx + 925.5 * ux, y: Q.deckY, z: SR.cz + 925.5 * uz, ry: -rad, col: c % 2 === 0 ? 0xdba23a : 0x2e7e76 });

        if (typeof KWALK !== 'undefined' && KWALK.floor) {
          KWALK.floor({ rect: [qx - 32, qx + 32, qz - 32, qz + 32], y: Q.deckY });
        }
      }
      const midRad = (Q.ang0 + spanDeg * 0.5) * Math.PI / 180;
      for (let st = 0; st < 6; st++) {
        const rSt = 968.0 + st * 3.0;
        const ySt = Q.deckY + (st + 1) * ((SR.promenadeY - Q.deckY) / 6);
        addBox(weirGroup, 4.2, ySt - Q.deckY + 0.5, 12.0, SR.cx + rSt * Math.cos(midRad), Q.deckY - 0.3, SR.cz + rSt * Math.sin(midRad), -midRad, MATS.travertineStone, 3.5);
      }
    }

    /* NW Sea-Ring Tsunami Scar Seated Debris Watched by KRUINS */
    const scarGroup = new THREE.Group();
    scarGroup.name = 'fc_ruin_nw_weir_scar';
    root.add(scarGroup);
    {
      const a0 = 254 * Math.PI / 180;
      const mx = SR.cx + rMid * Math.cos(a0), mz = SR.cz + rMid * Math.sin(a0);
      const g0 = lowGroundUnderBox(mx, mz, 14, 14);
      addBox(scarGroup, 26, 18.0 - (g0 - 0.3), 26, mx, g0 - 0.3, mz, 0, MATS.cobaltGlaze, 6.0);
      for (let i = 0; i < SR.scarBlocks.length; i++) {
        const B = SR.scarBlocks[i];
        const gb = lowGroundUnderBox(B.x, B.z, B.w * 0.5, B.d * 0.5);
        addBox(scarGroup, B.w, B.h, B.d, B.x, gb - 0.20, B.z, B.ry, MATS.ancientConcrete, 4.0);
      }
      mergeStaticGroup(scarGroup, null);
      scarGroup.updateMatrixWorld(true);
      if (typeof KRUINS !== 'undefined' && KRUINS.watch) {
        KRUINS.watch(scarGroup, { name: 'NW Sea-Ring Weir Tsunami Scar', ground: terrainH });
      }
    }

    /* 4 Sector Ship-Locks: Twin Prou-Torre Keeps + +38 m Arched Paktong Box-Truss Bridges */
    for (let i = 0; i < SR.locks.length; i++) {
      const L = SR.locks[i];
      const a = L.angDeg * Math.PI / 180;
      for (let k = 0; k < L.keeps.length; k++) {
        const K = L.keeps[k];
        const g0 = Math.min(-30.0, terrainH(K.x, K.z) - 1.0);
        addCyl(weirGroup, 14.0, 17.5, L.bridgeY + 2.0 - g0, 12, K.x, g0, K.z, 0, MATS.ancientCeramic, 6.0);
        addCyl(weirGroup, 15.5, 15.8, 2.4, 12, K.x, L.bridgeY + 0.5, K.z, 0, MATS.giltChofa, 3.5);
        addCone(weirGroup, 16.4, 9.6, 12, K.x, L.bridgeY + 2.6, K.z, 0, MATS.celadonRoof);
        addCone(weirGroup, 2.8, 6.5, 8, K.x, L.bridgeY + 11.6, K.z, 0, MATS.giltChofa);
      }

      addBox(weirGroup, 19.0, 3.0, 98.0, L.x, L.bridgeY - 1.5, L.z, -a, MATS.paktongMetal, 5.0);
      addBox(weirGroup, 1.3, 5.4, 96.0, L.x - 8.6 * Math.cos(a), L.bridgeY + 1.0, L.z - 8.6 * Math.sin(a), -a, MATS.paktongMetal, 4.0);
      addBox(weirGroup, 1.3, 5.4, 96.0, L.x + 8.6 * Math.cos(a), L.bridgeY + 1.0, L.z + 8.6 * Math.sin(a), -a, MATS.paktongMetal, 4.0);

      const gateL = new THREE.Mesh(FC_SUMERU_CORE.uvScaleBox(3.4, 28.0, 24.0, 4.0), MATS.paktongMetal);
      gateL.position.set(L.x, -4.0, L.z);
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
          at: [L.x, 4, L.z], ry: -a, size: [34, 98, 44]
        });
      }
    }

    /* -------------------------------------------------------------------
       A4. 4 Colossal Radial Boulevard-Dykes (+22 m Boulevard + 156 m-wide +6.2 m Quays + 9-Span NNE Sea-Viaduct)
       ------------------------------------------------------------------- */
    const SM = M.sumeru;
    const dykeGroup = new THREE.Group();
    dykeGroup.name = 'fc_boulevard_dykes_and_nagas';
    root.add(dykeGroup);

    for (let i = 0; i < M.dykes.length; i++) {
      const D = M.dykes[i];
      const a = D.angDeg * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a), nx = -uz, nz = ux;
      const len = D.r1 - D.r0;
      const midR = 0.5 * (D.r0 + D.r1);
      const dx = SM.cx + midR * ux, dz = SM.cz + midR * uz;

      /* 1. Central +22.0 m Boulevard Spine */
      addBox(dykeGroup, len, D.crownY - (-30.0), D.widthM, dx, -30.0, dz, -a, MATS.travertineStone, 8.0);
      addBox(dykeGroup, len - 4.0, 0.35, 12.0, dx, D.crownY - 0.1, dz, -a, MATS.cobaltGlaze, 5.0);
      addBox(dykeGroup, len - 2.0, 1.35, 1.5, dx + (D.widthM * 0.5 - 0.9) * nx, D.crownY, dz + (D.widthM * 0.5 - 0.9) * nz, -a, MATS.celadonRoof, 4.0);
      addBox(dykeGroup, len - 2.0, 1.35, 1.5, dx - (D.widthM * 0.5 - 0.9) * nx, D.crownY, dz - (D.widthM * 0.5 - 0.9) * nz, -a, MATS.celadonRoof, 4.0);

      for (let rp = D.r0 + 36.0; rp < D.r1 - 18.0; rp += 44.0) {
        lanternRecs.push({ x: SM.cx + rp * ux + 5.6 * nx, y: D.crownY, z: SM.cz + rp * uz + 5.6 * nz });
        lanternRecs.push({ x: SM.cx + rp * ux - 5.6 * nx, y: D.crownY, z: SM.cz + rp * uz - 5.6 * nz });
        for (let sgn = -1; sgn <= 1; sgn += 2) {
          const px = SM.cx + rp * ux + sgn * (D.widthM * 0.5 + 1.8) * nx;
          const pz = SM.cz + rp * uz + sgn * (D.widthM * 0.5 + 1.8) * nz;
          addBox(dykeGroup, 6.4, D.crownY - (-28.0), 4.6, px, -28.0, pz, -a, MATS.ancientCeramic, 5.0);
        }
      }

      /* 2. Paired Solid Masonry Lower Quay Terraces (+6.2 m, total width 156 m!) */
      const qLen = D.quayR1 - D.quayR0;
      const qMidR = 0.5 * (D.quayR0 + D.quayR1);
      const qx = SM.cx + qMidR * ux, qz = SM.cz + qMidR * uz;
      addBox(dykeGroup, qLen, D.quayY - (-30.0), D.quayHalfW * 2.0, qx, -30.0, qz, -a, MATS.travertineStone, 7.5);
      for (let sgn = -1; sgn <= 1; sgn += 2) {
        const ex = qx + sgn * (D.quayHalfW - 1.3) * nx, ez = qz + sgn * (D.quayHalfW - 1.3) * nz;
        addBox(dykeGroup, qLen, 0.8, 2.6, ex, D.quayY - 0.25, ez, -a, D.tag === 'nne' ? MATS.cobaltGlaze : MATS.giltChofa, 4.0);
        /* Paved Mid-Quay Market Street at lat = +-51.2 m between Inner and Outer Quay Rows! */
        const mx2 = qx + sgn * 51.2 * nx, mz2 = qz + sgn * 51.2 * nz;
        addBox(dykeGroup, qLen - 8.0, 0.25, 9.0, mx2, D.quayY - 0.05, mz2, -a, MATS.cobaltGlaze, 4.5);
        /* Waterfront Boat-Step Apron at +2.6 m */
        const sx2 = qx + sgn * (D.quayHalfW + 2.4) * nx, sz2 = qz + sgn * (D.quayHalfW + 2.4) * nz;
        addBox(dykeGroup, qLen * 0.94, 2.6 - (-26.0), 4.8, sx2, -26.0, sz2, -a, MATS.ancientConcrete, 6.0);

        for (let rs = D.quayR0 + 28.0; rs < D.quayR1 - 24.0; rs += 34.0) {
          lanternRecs.push({ x: SM.cx + rs * ux + sgn * (D.quayHalfW - 2.2) * nx, y: D.quayY, z: SM.cz + rs * uz + sgn * (D.quayHalfW - 2.2) * nz });
          stallRecs.push({ x: SM.cx + rs * ux + sgn * 51.2 * nx, y: D.quayY, z: SM.cz + rs * uz + sgn * 51.2 * nz, ry: -a, col: (i + Math.round(rs)) % 2 === 0 ? 0xb83c30 : 0xdba23a });
        }
      }

      /* 3. Vaulted Barge-Gate Portals, Lateral Stair-Towers & Reversible Tide-Wheels */
      for (let g = 0; g < D.gates.length; g++) {
        const rg = D.gates[g];
        const gx = SM.cx + rg * ux, gz = SM.cz + rg * uz;
        addBox(dykeGroup, 26.0, 9.4, D.widthM + 4.0, gx, D.crownY - 0.3, gz, -a, MATS.cobaltGlaze, 4.0);
        addBox(dykeGroup, 28.0, 2.2, D.widthM + 6.0, gx, D.crownY + 8.8, gz, -a, MATS.celadonRoof, 4.0);

        for (let st = 0; st < 6; st++) {
          const ySt = D.quayY + (st + 1) * ((D.crownY - D.quayY) / 6);
          addBox(dykeGroup, 8.2, ySt - D.quayY + 0.5, D.widthM + 18.0 - st * 2.2, gx + (st - 2.5) * 4.2 * ux, D.quayY - 0.3, gz + (st - 2.5) * 4.2 * uz, -a, MATS.travertineStone, 4.0);
        }

        const wheel = new THREE.Mesh(FC_SUMERU_CORE.uvScaleCyl(6.4, 6.4, 4.4, 12, 3.0), MATS.cypressHull);
        wheel.position.set(gx + (D.quayHalfW + 3.2) * nx, 0.8, gz + (D.quayHalfW + 3.2) * nz);
        wheel.rotation.z = Math.PI * 0.5;
        wheel.rotation.y = -a;
        dykeGroup.add(wheel);
        tideWheels.push(wheel);
        dynamicMeshes.add(wheel);
      }

      /* 4. 9-Span NNE Arched Ocean Viaduct (r = 1,012 .. 1,245 m) Ramping onto West Harbour Mole (+7.8 m)! */
      if (D.seaViaductR1 > D.r1) {
        const nSpans = 9;
        const rStart = D.r1 - 4.0, rEnd = D.seaViaductR1;
        const stepR = (rEnd - rStart) / nSpans;
        for (let sp = 0; sp < nSpans; sp++) {
          const rA = rStart + sp * stepR, rB = rA + stepR;
          const rM = 0.5 * (rA + rB);
          const uSpan = (sp + 0.5) / nSpans;
          const deckY = sp === 0 ? 22.0 : (22.0 * (1 - uSpan) + D.seaViaductEndY * uSpan);
          const vx = SM.cx + rM * ux, vz = SM.cz + rM * uz;
          const pierX = SM.cx + rB * ux, pierZ = SM.cz + rB * uz;
          addBox(dykeGroup, 10.0, deckY - (-34.0), 32.0, pierX, -34.0, pierZ, -a, MATS.ancientConcrete, 6.5);
          addBox(dykeGroup, stepR + 3.5, 4.4, 28.0, vx, deckY - 4.0, vz, -a, MATS.travertineStone, 5.5);
          addBox(dykeGroup, stepR + 3.5, 0.3, 15.0, vx, deckY + 0.25, vz, -a, MATS.cobaltGlaze, 4.5);
          addBox(dykeGroup, stepR + 3.5, 1.3, 1.5, vx + 13.0 * nx, deckY + 0.2, vz + 13.0 * nz, -a, MATS.celadonRoof, 4.0);
          addBox(dykeGroup, stepR + 3.5, 1.3, 1.5, vx - 13.0 * nx, deckY + 0.2, vz - 13.0 * nz, -a, MATS.celadonRoof, 4.0);
        }
      }

      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'boulevard_dyke', key: D.id, name: D.name,
          at: [dx, D.crownY, dz], ry: -a, size: [len, D.quayHalfW * 2, 44]
        });
      }
    }

    /* 5. 10 Sinuous Naga Walkways & 16 8-Column Sala-Nam Water Pavilions */
    for (let i = 0; i < M.nagaWalks.length; i++) {
      const NW = M.nagaWalks[i];
      for (let s = 0; s < NW.pts.length - 1; s++) {
        const A = NW.pts[s], B = NW.pts[s + 1];
        const mx = (A[0] + B[0]) * 0.5, mz = (A[2] + B[2]) * 0.5;
        const segL = Math.hypot(B[0] - A[0], B[2] - A[2]) + 0.6;
        const yaw = Math.atan2(B[0] - A[0], B[2] - A[2]);
        addBox(dykeGroup, NW.widthM, 1.35, segL, mx, A[1] - 1.1, mz, yaw, MATS.travertineStone, 4.0);
        addBox(dykeGroup, NW.widthM + 0.6, 0.9, segL, mx, A[1] + 0.15, mz, yaw, MATS.giltChofa, 3.0);
        if (s % 2 === 1) {
          addCyl(dykeGroup, 1.5, 2.0, A[1] - (-30.0), 8, A[0], -30.0, A[2], 0, MATS.ancientConcrete, 4.0);
        }
      }
    }

    for (let i = 0; i < M.salaPavilions.length; i++) {
      const SP = M.salaPavilions[i];
      addCyl(dykeGroup, SP.r, SP.r * 1.10, SP.y - (-30.0), 8, SP.x, -30.0, SP.z, Math.PI / 8, MATS.travertineStone, 5.0);
      addCyl(dykeGroup, SP.r * 1.02, SP.r * 1.03, 0.75, 8, SP.x, SP.y - 0.5, SP.z, Math.PI / 8, MATS.cobaltGlaze, 3.5);
      const rCol = SP.r * 0.78;
      for (let c = 0; c < SP.cols; c++) {
        const ca = (c / SP.cols) * Math.PI * 2 + Math.PI / 8;
        addCyl(dykeGroup, 0.70, 0.85, SP.colH, 8, SP.x + rCol * Math.cos(ca), SP.y - 0.1, SP.z + rCol * Math.sin(ca), 0, MATS.travertineStone, 2.5);
      }
      const yEnt = SP.y + SP.colH - 0.25;
      addCyl(dykeGroup, SP.r * 0.96, SP.r * 0.98, 1.15, 8, SP.x, yEnt, SP.z, Math.PI / 8, MATS.giltChofa, 3.0);
      addCone(dykeGroup, SP.r * 1.16, 4.9, 8, SP.x, yEnt + 0.85, SP.z, Math.PI / 8, MATS.celadonRoof);
      addCone(dykeGroup, SP.r * 0.68, 4.3, 8, SP.x, yEnt + 4.5, SP.z, Math.PI / 8, MATS.celadonRoof);
      addCone(dykeGroup, 1.7, 4.3, 8, SP.x, yEnt + 8.1, SP.z, 0, MATS.giltChofa);
    }

    /* 6. Instanced Waterfront Street-Lanterns & Silk Market Stalls (3 draw calls total across the entire megastructure!) */
    {
      const _m4 = new THREE.Matrix4(), _p3 = new THREE.Vector3(), _q4 = new THREE.Quaternion(), _s3 = new THREE.Vector3(1, 1, 1), _y = new THREE.Vector3(0, 1, 0);
      if (lanternRecs.length) {
        const poleIm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.22, 4.2, 6), MATS.paktongMetal, lanternRecs.length);
        const lampMat = new THREE.MeshStandardMaterial({ color: 0xffe09a, emissive: 0xffa834, emissiveIntensity: 1.35, roughness: 0.3 });
        const headIm = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.42, 0), lampMat, lanternRecs.length);
        for (let i = 0; i < lanternRecs.length; i++) {
          const lr = lanternRecs[i];
          _p3.set(lr.x, lr.y + 2.1, lr.z);
          _q4.set(0, 0, 0, 1);
          _m4.compose(_p3, _q4, _s3);
          poleIm.setMatrixAt(i, _m4);
          _p3.set(lr.x, lr.y + 4.35, lr.z);
          _m4.compose(_p3, _q4, _s3);
          headIm.setMatrixAt(i, _m4);
        }
        poleIm.instanceMatrix.needsUpdate = true;
        headIm.instanceMatrix.needsUpdate = true;
        if (typeof KCITY !== 'undefined' && KCITY.boundedInstanced) {
          KCITY.boundedInstanced(poleIm);
          KCITY.boundedInstanced(headIm);
        }
        root.add(poleIm);
        root.add(headIm);
      }
      if (stallRecs.length) {
        const stallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.72 });
        const stallIm = new THREE.InstancedMesh(new THREE.ConeGeometry(2.6, 1.5, 4), stallMat, stallRecs.length);
        const cTmp = new THREE.Color();
        for (let i = 0; i < stallRecs.length; i++) {
          const sr = stallRecs[i];
          _p3.set(sr.x, sr.y + 2.5, sr.z);
          _q4.setFromAxisAngle(_y, sr.ry + Math.PI * 0.25);
          _m4.compose(_p3, _q4, _s3);
          stallIm.setMatrixAt(i, _m4);
          cTmp.setHex(sr.col);
          stallIm.setColorAt(i, cTmp);
        }
        stallIm.instanceMatrix.needsUpdate = true;
        if (stallIm.instanceColor) stallIm.instanceColor.needsUpdate = true;
        if (typeof KCITY !== 'undefined' && KCITY.boundedInstanced) KCITY.boundedInstanced(stallIm);
        root.add(stallIm);
      }
    }

    mergeStaticGroup(weirGroup, dynamicMeshes);
    mergeStaticGroup(dykeGroup, dynamicMeshes);
    weirGroup.updateMatrixWorld(true);
    dykeGroup.updateMatrixWorld(true);
    if (typeof KDRAWN !== 'undefined' && KDRAWN.fromObject) {
      KDRAWN.add(KDRAWN.fromObject(weirGroup));
      KDRAWN.add(KDRAWN.fromObject(dykeGroup));
    }

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
      coneGroup: coreOut.coneGroup,
      update: update
    };
  }

  return { buildAll: buildAll, mergeStaticGroup: FC_SUMERU_CORE.mergeStaticGroup };
})();
