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
    const addArcBand = FC_SUMERU_CORE.addArcBand;
    const addRibbonWalk = FC_SUMERU_CORE.addRibbonWalk;
    const mergeStaticGroup = FC_SUMERU_CORE.mergeStaticGroup;
    const lowGroundUnderBox = FC_SUMERU_CORE.lowGroundUnderBox;

    const roadCobaltMat = MATS.cobaltGlaze.clone();
    roadCobaltMat.polygonOffset = true;
    roadCobaltMat.polygonOffsetFactor = -2;
    roadCobaltMat.polygonOffsetUnits = -8;

    const coreOut = FC_SUMERU_CORE.buildCore(M, root, MATS, tagReg, subClipPlanes, dynamicMeshes, turbineRings);

    /* -------------------------------------------------------------------
       A2. 2,040 m Circular Arcaded Sea-Ring Weir, 8 Venetian Harbour Quays & 4 Locks
       ------------------------------------------------------------------- */
    const SR = M.seaRing;
    const weirGroup = new THREE.Group();
    weirGroup.name = 'fc_noahbabel_sea_ring';
    root.add(weirGroup);

    const nSeg = 108;
    const lockAngles = SR.locks.map(function (L) { return ((L.angDeg % 360) + 360) % 360; }).sort(function (a, b) { return a - b; });
    const dykeAngles = M.dykes.map(function (D) { return ((D.angDeg % 360) + 360) % 360; });
    const rMid = 0.5 * (SR.rOuter + SR.rInner);

    const lanternRecs = [];
    const stallRecs = [];

    /* Build seamless mitered Sea-Ring arcs between the 4 Ship-Lock gaps (0 chord-to-chord overlap!) */
    const lockHalfDeg = 2.4;
    const rawArcs = [];
    for (let li = 0; li < lockAngles.length; li++) {
      const aStart = lockAngles[li] + lockHalfDeg;
      const aEnd = (li + 1 < lockAngles.length ? lockAngles[li + 1] : lockAngles[0] + 360.0) - lockHalfDeg;
      const sc0 = SR.scarArcDeg[0], sc1 = SR.scarArcDeg[1];
      if (aStart < sc0 && aEnd > sc1) {
        rawArcs.push({ a0: aStart, a1: sc0, scar: false });
        rawArcs.push({ a0: sc0,    a1: sc1, scar: true  });
        rawArcs.push({ a0: sc1,    a1: aEnd, scar: false });
      } else {
        rawArcs.push({ a0: aStart, a1: aEnd, scar: (aStart >= sc0 && aEnd <= sc1) });
      }
    }
    for (let ai = 0; ai < rawArcs.length; ai++) {
      const A = rawArcs[ai];
      const nSub = Math.max(2, Math.round((A.a1 - A.a0) / 3.2));
      addArcBand(weirGroup, SR.cx, SR.cz, SR.rInner, SR.rOuter, -32.0, SR.promenadeY - 1.5, A.a0, A.a1, nSub, A.scar ? MATS.cobaltGlaze : MATS.ancientConcrete, 7.5);
      addArcBand(weirGroup, SR.cx, SR.cz, SR.rInner - 0.8, SR.rOuter + 1.0, SR.promenadeY - 1.5, SR.promenadeY, A.a0, A.a1, nSub, MATS.travertineStone, 5.0);
      addArcBand(weirGroup, SR.cx, SR.cz, SR.rOuter - 11.2, SR.rOuter - 2.0, SR.promenadeY, SR.promenadeY + 0.26, A.a0, A.a1, nSub, roadCobaltMat, 4.5);
      addArcBand(weirGroup, SR.cx, SR.cz, SR.rOuter - 1.8, SR.rOuter + 0.2, SR.promenadeY, SR.promenadeY + 1.45, A.a0, A.a1, nSub, MATS.celadonRoof, 4.0);
      addArcBand(weirGroup, SR.cx, SR.cz, SR.rInner - 0.2, SR.rInner + 1.2, SR.promenadeY, SR.promenadeY + 1.15, A.a0, A.a1, nSub, MATS.travertineStone, 4.0);
    }

    for (let s = 0; s < nSeg; s++) {
      const deg = (s + 0.5) * (360 / nSeg);
      let inLock = false;
      for (let li = 0; li < lockAngles.length; li++) {
        let diff = Math.abs(deg - lockAngles[li]);
        if (diff > 180) diff = 360 - diff;
        if (diff < 2.8) { inLock = true; break; }
      }
      if (inLock) continue;
      let nearDyke = false;
      for (let di = 0; di < dykeAngles.length; di++) {
        let diff = Math.abs(deg - dykeAngles[di]);
        if (diff > 180) diff = 360 - diff;
        if (diff < 3.4) { nearDyke = true; break; }
      }

      const rad = deg * Math.PI / 180;
      const ux = Math.cos(rad), uz = Math.sin(rad);
      const sx = SR.cx + rMid * ux, sz = SR.cz + rMid * uz;
      const bed = Math.min(-28.0, terrainH(sx, sz) - 1.0);
      const inScar = deg >= SR.scarArcDeg[0] && deg <= SR.scarArcDeg[1];

      /* Ocean-facing wave-buttresses seated outside SR.rOuter + 1.0 and below promenade deck */
      addBox(weirGroup, 9.2, (SR.promenadeY - 1.6) - bed, 8.0, SR.cx + (SR.rOuter + 5.6) * ux, bed, SR.cz + (SR.rOuter + 5.6) * uz, -rad, MATS.ancientConcrete, 5.5);

      if (s % 2 === 0 && !nearDyke) {
        lanternRecs.push({ x: SR.cx + (SR.rOuter - 2.4) * ux, y: SR.promenadeY, z: SR.cz + (SR.rOuter - 2.4) * uz });
      }

      /* Octagonal Ocean Watch-Turrets (clear of scar, locks, and radial dyke viaduct junctions) */
      if (s % 6 === 0 && !inScar && !nearDyke) {
        const tx = SR.cx + (SR.rOuter - 3.2) * ux, tz = SR.cz + (SR.rOuter - 3.2) * uz;
        addCyl(weirGroup, 6.4, 7.0, 11.0, 8, tx, SR.promenadeY, tz, 0, MATS.ancientCeramic, 4.0);
        addCone(weirGroup, 7.5, 6.2, 8, tx, SR.promenadeY + 11.0, tz, 0, MATS.celadonRoof);
        addCone(weirGroup, 1.6, 4.0, 8, tx, SR.promenadeY + 16.8, tz, 0, MATS.giltChofa);
      }

      if (typeof KWALK !== 'undefined' && KWALK.floor) {
        KWALK.floor({ rect: [sx - 16, sx + 16, sz - 16, sz + 16], y: SR.promenadeY });
      }
    }

    /* 8 Wide Inner Venetian Harbour-Quay Masonry Shelves (+6.2 m terrace from r = 896..982 m via seamless addArcBand!) */
    for (let q = 0; q < SR.quays.length; q++) {
      const Q = SR.quays[q];
      let spanDeg = Q.ang1 - Q.ang0;
      if (spanDeg < 0) spanDeg += 360;
      const nChord = Math.max(4, Math.ceil(spanDeg / 2.8));
      const dDeg = spanDeg / nChord;
      const rQMid = 0.5 * (Q.rIn + SR.rInner);

      addArcBand(weirGroup, SR.cx, SR.cz, Q.rIn, SR.rInner, -30.0, Q.deckY, Q.ang0, Q.ang1, nChord, MATS.travertineStone, 7.5);
      addArcBand(weirGroup, SR.cx, SR.cz, Q.rIn, Q.rIn + 2.5, Q.deckY, Q.deckY + 0.65, Q.ang0, Q.ang1, nChord, Q.style === 'suudme' ? MATS.cobaltGlaze : MATS.giltChofa, 3.5);
      /* Twin concentric paved ring-streets cleanly inside the corridors between building rows (r=921.2..928.8 & r=954.0..959.5) */
      addArcBand(weirGroup, SR.cx, SR.cz, 954.0, 959.5, Q.deckY, Q.deckY + 0.26, Q.ang0, Q.ang1, nChord, roadCobaltMat, 4.5);
      addArcBand(weirGroup, SR.cx, SR.cz, 921.2, 928.8, Q.deckY, Q.deckY + 0.26, Q.ang0, Q.ang1, nChord, roadCobaltMat, 4.5);
      /* Waterfront boat-step apron (+2.5 m) butted cleanly outside Q.rIn */
      addArcBand(weirGroup, SR.cx, SR.cz, Q.rIn - 4.6, Q.rIn, -26.0, 2.5, Q.ang0, Q.ang1, nChord, MATS.ancientConcrete, 5.5);

      for (let c = 0; c < nChord; c++) {
        const deg = Q.ang0 + (c + 0.5) * dDeg;
        const rad = deg * Math.PI / 180;
        const ux = Math.cos(rad), uz = Math.sin(rad);
        const qx = SR.cx + rQMid * ux, qz = SR.cz + rQMid * uz;
        lanternRecs.push({ x: SR.cx + 899.0 * ux, y: Q.deckY, z: SR.cz + 899.0 * uz });
        stallRecs.push({ x: SR.cx + 925.0 * ux, y: Q.deckY + 0.26, z: SR.cz + 925.0 * uz, ry: -rad, col: c % 2 === 0 ? 0xdba23a : 0x2e7e76 });
        if (typeof KWALK !== 'undefined' && KWALK.floor) {
          KWALK.floor({ rect: [qx - 32, qx + 32, qz - 32, qz + 32], y: Q.deckY });
        }
      }

      /* Non-overlapping 6-step quay-to-promenade stone stairs at Q.ang0 + 0.45 deg (clear of building arc!) */
      const stRad = (Q.ang0 + 0.45) * Math.PI / 180;
      for (let st = 0; st < 6; st++) {
        const rSt = 970.2 + st * 2.0;
        const ySt = Q.deckY + (st + 1) * ((SR.promenadeY - 0.45 - Q.deckY) / 6);
        addBox(weirGroup, 2.0, ySt - Q.deckY, 9.5, SR.cx + rSt * Math.cos(stRad), Q.deckY, SR.cz + rSt * Math.sin(stRad), -stRad, MATS.travertineStone, 3.5);
      }
    }

    /* NW Sea-Ring Tsunami Scar Seated Debris Watched by KRUINS */
    const scarGroup = new THREE.Group();
    scarGroup.name = 'fc_ruin_nw_weir_scar';
    root.add(scarGroup);
    {
      const a0 = 254 * Math.PI / 180;
      const mx = SR.cx + (SR.rOuter + 15.0) * Math.cos(a0), mz = SR.cz + (SR.rOuter + 15.0) * Math.sin(a0);
      const g0 = lowGroundUnderBox(mx, mz, 9, 9);
      addBox(scarGroup, 18, 14.5 - (g0 - 0.3), 18, mx, g0 - 0.3, mz, 0.2, MATS.cobaltGlaze, 6.0);
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
        addCyl(weirGroup, 14.0, 17.5, L.bridgeY + 1.0 - g0, 12, K.x, g0, K.z, 0, MATS.ancientCeramic, 6.0);
        addCyl(weirGroup, 15.5, 15.8, 1.8, 12, K.x, L.bridgeY + 1.0, K.z, 0, MATS.giltChofa, 3.5);
        addCone(weirGroup, 16.4, 9.6, 12, K.x, L.bridgeY + 2.8, K.z, 0, MATS.celadonRoof);
        addCone(weirGroup, 2.8, 6.5, 8, K.x, L.bridgeY + 11.8, K.z, 0, MATS.giltChofa);
      }

      addBox(weirGroup, 19.0, 3.0, 72.0, L.x, L.bridgeY - 1.5, L.z, -a, MATS.paktongMetal, 5.0);
      addBox(weirGroup, 1.3, 5.4, 70.0, L.x - 8.6 * Math.cos(a), L.bridgeY + 1.5, L.z - 8.6 * Math.sin(a), -a, MATS.paktongMetal, 4.0);
      addBox(weirGroup, 1.3, 5.4, 70.0, L.x + 8.6 * Math.cos(a), L.bridgeY + 1.5, L.z + 8.6 * Math.sin(a), -a, MATS.paktongMetal, 4.0);

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
       A4. 4 Colossal Radial Boulevard-Dykes (+22 m Boulevard + 156 m-wide +6.2 m Quays + Sloped NNE Sea-Viaduct)
       ------------------------------------------------------------------- */
    const SM = M.sumeru;
    const dykeGroup = new THREE.Group();
    dykeGroup.name = 'fc_boulevard_dykes_and_nagas';
    root.add(dykeGroup);

    for (let i = 0; i < M.dykes.length; i++) {
      const D = M.dykes[i];
      const a = D.angDeg * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a), nx = -uz, nz = ux;

      /* 1. Central +22.0 m Boulevard Spine butted cleanly at r=226.0 against Sumeru Gopura Bastion (0 hub overlap!) */
      const rSpine0 = 226.0, rSpine1 = D.r1;
      const spineLen = rSpine1 - rSpine0;
      const spineMidR = 0.5 * (rSpine0 + rSpine1);
      const dx = SM.cx + spineMidR * ux, dz = SM.cz + spineMidR * uz;

      addBox(dykeGroup, spineLen, D.crownY - (-30.0), D.widthM, dx, -30.0, dz, -a, MATS.travertineStone, 8.0);

      /* Central cobalt carriageway (d = 9.0 m, clear of crown shops & split around gatehouses) */
      const roadStops = [rSpine0 + 2.0];
      for (let g = 0; g < D.gates.length; g++) {
        roadStops.push(D.gates[g] - 15.0, D.gates[g] + 15.0);
      }
      roadStops.push(rSpine1 - 2.0);
      for (let rs = 0; rs < roadStops.length; rs += 2) {
        const ra = roadStops[rs], rb = roadStops[rs + 1];
        if (rb - ra > 4.0) {
          const rm = 0.5 * (ra + rb);
          addBox(dykeGroup, rb - ra, 0.26, 9.0, SM.cx + rm * ux, D.crownY, SM.cz + rm * uz, -a, roadCobaltMat, 5.0);
        }
      }

      /* Crown parapets split cleanly around lateral grand stair landings (rg + 15.5 +- 5.5 m) */
      const paraStops = [rSpine0 + 1.0];
      for (let g = 0; g < D.gates.length; g++) {
        paraStops.push(D.gates[g] + 9.8, D.gates[g] + 21.2);
      }
      paraStops.push(rSpine1 - 1.0);
      for (let ps = 0; ps < paraStops.length; ps += 2) {
        const pa0 = paraStops[ps], pa1 = paraStops[ps + 1];
        if (pa1 - pa0 > 3.0) {
          const pm = 0.5 * (pa0 + pa1);
          for (let sgn = -1; sgn <= 1; sgn += 2) {
            addBox(dykeGroup, pa1 - pa0, 1.35, 1.4, SM.cx + pm * ux + sgn * (D.widthM * 0.5 - 0.8) * nx, D.crownY, SM.cz + pm * uz + sgn * (D.widthM * 0.5 - 0.8) * nz, -a, MATS.celadonRoof, 4.0);
          }
        }
      }

      for (let rp = rSpine0 + 20.0; rp < rSpine1 - 18.0; rp += 44.0) {
        let nearGatePil = false;
        for (let g = 0; g < D.gates.length; g++) {
          if (Math.abs(rp - D.gates[g]) < 24.0) { nearGatePil = true; break; }
        }
        if (nearGatePil) continue;
        lanternRecs.push({ x: SM.cx + rp * ux + 4.8 * nx, y: D.crownY, z: SM.cz + rp * uz + 4.8 * nz });
        lanternRecs.push({ x: SM.cx + rp * ux - 4.8 * nx, y: D.crownY, z: SM.cz + rp * uz - 4.8 * nz });
        for (let sgn = -1; sgn <= 1; sgn += 2) {
          const px = SM.cx + rp * ux + sgn * (D.widthM * 0.5 + 1.8) * nx;
          const pz = SM.cz + rp * uz + sgn * (D.widthM * 0.5 + 1.8) * nz;
          const pilBaseY = (rp >= D.quayR0 && rp <= D.quayR1) ? D.quayY : -28.0;
          addBox(dykeGroup, 6.4, (D.crownY - 0.45) - pilBaseY, 3.6, px, pilBaseY, pz, -a, MATS.ancientCeramic, 5.0);
        }
      }

      /* 2. Paired Left & Right Lower Masonry Quay Terraces (+6.2 m, butted outside D.widthM*0.5 -> 0 spine overlap!) */
      const qLen = D.quayR1 - D.quayR0;
      const qMidR = 0.5 * (D.quayR0 + D.quayR1);
      const qx = SM.cx + qMidR * ux, qz = SM.cz + qMidR * uz;
      const qSideW = D.quayHalfW - D.widthM * 0.5;
      const qSideLat = D.widthM * 0.5 + qSideW * 0.5;

      for (let sgn = -1; sgn <= 1; sgn += 2) {
        addBox(dykeGroup, qLen, D.quayY - (-30.0), qSideW, qx + sgn * qSideLat * nx, -30.0, qz + sgn * qSideLat * nz, -a, MATS.travertineStone, 7.5);
        const ex = qx + sgn * (D.quayHalfW - 1.2) * nx, ez = qz + sgn * (D.quayHalfW - 1.2) * nz;
        addBox(dykeGroup, qLen, 0.65, 2.4, ex, D.quayY, ez, -a, D.tag === 'nne' ? MATS.cobaltGlaze : MATS.giltChofa, 4.0);
        /* Paved Mid-Quay Market Street at lat = +-51.6 m (d = 5.2 m, strictly between Inner & Outer Quay Rows!) */
        const mx2 = qx + sgn * 51.6 * nx, mz2 = qz + sgn * 51.6 * nz;
        addBox(dykeGroup, qLen - 8.0, 0.26, 5.2, mx2, D.quayY, mz2, -a, roadCobaltMat, 4.5);
        /* Waterfront Boat-Step Apron at +2.6 m butted outside D.quayHalfW */
        const sx2 = qx + sgn * (D.quayHalfW + 2.4) * nx, sz2 = qz + sgn * (D.quayHalfW + 2.4) * nz;
        addBox(dykeGroup, qLen * 0.94, 2.6 - (-26.0), 4.8, sx2, -26.0, sz2, -a, MATS.ancientConcrete, 6.0);

        for (let rs = D.quayR0 + 28.0; rs < D.quayR1 - 24.0; rs += 34.0) {
          lanternRecs.push({ x: SM.cx + rs * ux + sgn * (D.quayHalfW - 2.2) * nx, y: D.quayY, z: SM.cz + rs * uz + sgn * (D.quayHalfW - 2.2) * nz });
          stallRecs.push({ x: SM.cx + rs * ux + sgn * 51.6 * nx, y: D.quayY + 0.26, z: SM.cz + rs * uz + sgn * 51.6 * nz, ry: -a, col: (i + Math.round(rs)) % 2 === 0 ? 0xb83c30 : 0xdba23a });
        }
      }

      /* 3. Twin Barge-Gate Portal Bastions, Paired Non-Overlapping Grand Quay-to-Crown Stairs & Reversible Tide-Wheels */
      for (let g = 0; g < D.gates.length; g++) {
        const rg = D.gates[g];
        const gx = SM.cx + rg * ux, gz = SM.cz + rg * uz;

        /* Twin lateral portal towers flanking the central kit watergate (never burying the kit gatehouse!) */
        for (let sgn = -1; sgn <= 1; sgn += 2) {
          const ptx = gx + sgn * (D.widthM * 0.5 - 3.8) * nx;
          const ptz = gz + sgn * (D.widthM * 0.5 - 3.8) * nz;
          addBox(dykeGroup, 9.6, 10.4, 7.2, ptx, D.crownY, ptz, -a, MATS.cobaltGlaze, 4.0);
          addBox(dykeGroup, 10.6, 1.6, 8.2, ptx, D.crownY + 10.4, ptz, -a, MATS.celadonRoof, 4.0);

          /* Clean 8-step grand stone staircase in the open gate plaza (rg + 15.5) climbing inward from +6.2 m quay to +22.0 m crown! */
          const stAlong = rg + 15.5;
          const stBaseX = SM.cx + stAlong * ux, stBaseZ = SM.cz + stAlong * uz;
          const nSteps = 8, treadD = 2.0;
          for (let st = 0; st < nSteps; st++) {
            const latCenter = D.widthM * 0.5 + (nSteps - st - 0.5) * treadD;
            const yTopSt = D.quayY + (st + 1) * ((D.crownY - 0.40 - D.quayY) / nSteps);
            addBox(dykeGroup, 9.8, yTopSt - D.quayY, treadD, stBaseX + sgn * latCenter * nx, D.quayY, stBaseZ + sgn * latCenter * nz, -a, MATS.travertineStone, 3.5);
          }
        }

        const wheel = new THREE.Mesh(FC_SUMERU_CORE.uvScaleCyl(6.4, 6.4, 4.4, 12, 3.0), MATS.cypressHull);
        wheel.position.set(gx + (D.quayHalfW + 3.2) * nx, 0.8, gz + (D.quayHalfW + 3.2) * nz);
        wheel.rotation.z = Math.PI * 0.5;
        wheel.rotation.y = -a;
        dykeGroup.add(wheel);
        tideWheels.push(wheel);
        dynamicMeshes.add(wheel);
      }

      /* 4. Smooth Sloped NNE Ocean Viaduct (r = 1,016 .. 1,245 m, +22.0 m -> +7.8 m onto West Stone Harbour Mole!) */
      if (D.seaViaductR1 > D.r1) {
        const rStart = D.r1, rEnd = D.seaViaductR1;
        const horiz = rEnd - rStart;
        const dyV = D.seaViaductEndY - D.crownY;
        const len3 = Math.hypot(horiz, dyV);
        const slopeZ = Math.atan2(dyV, horiz);
        const rMidV = 0.5 * (rStart + rEnd);
        const yMidV = 0.5 * (D.crownY + D.seaViaductEndY);

        const nPiers = 8;
        for (let sp = 1; sp < nPiers; sp++) {
          const uP = sp / nPiers;
          const rP = rStart + horiz * uP;
          const deckYP = D.crownY + dyV * uP;
          addBox(dykeGroup, 9.0, (deckYP - 2.6) - (-34.0), 30.0, SM.cx + rP * ux, -34.0, SM.cz + rP * uz, -a, MATS.ancientConcrete, 6.5);
        }

        const vHolder = new THREE.Group();
        vHolder.position.set(SM.cx + rMidV * ux, yMidV, SM.cz + rMidV * uz);
        vHolder.rotation.order = 'YZX';
        vHolder.rotation.y = -a;
        vHolder.rotation.z = slopeZ;

        const vBeam = new THREE.Mesh(FC_SUMERU_CORE.uvScaleBox(len3, 3.8, 28.0, 5.5), MATS.travertineStone);
        vBeam.position.y = -1.9;
        vHolder.add(vBeam);

        const vRoad = new THREE.Mesh(FC_SUMERU_CORE.uvScaleBox(len3 - 1.0, 0.26, 14.0, 4.5), roadCobaltMat);
        vRoad.position.y = 0.13;
        vHolder.add(vRoad);

        for (let sgn = -1; sgn <= 1; sgn += 2) {
          const vPar = new THREE.Mesh(FC_SUMERU_CORE.uvScaleBox(len3 - 0.5, 1.3, 1.4, 4.0), MATS.celadonRoof);
          vPar.position.set(0, 0.65, sgn * 13.1);
          vHolder.add(vPar);
        }

        vHolder.updateMatrix();
        while (vHolder.children.length) {
          const ch = vHolder.children[0];
          ch.updateMatrix();
          ch.applyMatrix4(vHolder.matrix);
          dykeGroup.add(ch);
        }
      }

      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'boulevard_dyke', key: D.id, name: D.name,
          at: [dx, D.crownY, dz], ry: -a, size: [D.r1 - D.r0, D.quayHalfW * 2, 44]
        });
      }
    }

    /* 5. 10 Sinuous Naga Walkways (strictly monotonic non-duplicated polylines!) & 16 8-Column Sala-Nam Water Pavilions */
    function isInsideDykeQuay(wx, wz, padM) {
      const dx = wx - SM.cx, dz = wz - SM.cz;
      for (let d = 0; d < M.dykes.length; d++) {
        const D = M.dykes[d], a = D.angDeg * Math.PI / 180;
        const ux = Math.cos(a), uz = Math.sin(a);
        const along = dx * ux + dz * uz;
        const perp = Math.abs(-dx * uz + dz * ux);
        if (along >= D.quayR0 - padM && along <= D.quayR1 + padM && perp <= D.quayHalfW + padM) return true;
      }
      return false;
    }

    for (let i = 0; i < M.nagaWalks.length; i++) {
      const NW = M.nagaWalks[i];
      if (NW.id.indexOf('spoke_') >= 0) {
        const trimmed = [];
        for (let s = 0; s < NW.pts.length; s++) {
          const P = NW.pts[s];
          const dx = P[0] - SM.cx, dz = P[2] - SM.cz;
          const r = Math.hypot(dx, dz) || 1;
          if (r < 219.8 || r > 245.2) continue;
          if (isInsideDykeQuay(P[0], P[2], 4.5)) continue;
          if (trimmed.length) {
            const prev = trimmed[trimmed.length - 1];
            if (Math.hypot(P[0] - prev[0], P[2] - prev[2]) < 2.2) continue;
          }
          trimmed.push([P[0], P[1], P[2]]);
        }
        if (trimmed.length >= 2) {
          addRibbonWalk(dykeGroup, trimmed, NW.widthM, 1.35, 0.32, 0.55, 0.72, MATS.travertineStone, MATS.giltChofa);
          const midP = trimmed[Math.floor(trimmed.length * 0.5)];
          addCyl(dykeGroup, 1.5, 2.0, (midP[1] - 1.1) - (-30.0), 8, midP[0], -30.0, midP[2], 0, MATS.ancientConcrete, 4.0);
        }
      } else {
        const segA = [], segB = [];
        for (let s = 0; s < NW.pts.length; s++) {
          const P = NW.pts[s];
          const z = P[2];
          if (z >= SM.cz + 220.0 && z <= SM.cz + 238.5) {
            if (!segA.length || Math.hypot(P[0] - segA[segA.length - 1][0], z - segA[segA.length - 1][2]) >= 2.2) {
              segA.push([P[0], P[1], z]);
            }
          } else if (z >= SM.cz + 261.5 && z <= SM.cz + 280.5) {
            if (!segB.length || Math.hypot(P[0] - segB[segB.length - 1][0], z - segB[segB.length - 1][2]) >= 2.2) {
              segB.push([P[0], P[1], z]);
            }
          }
        }
        if (segA.length >= 2) addRibbonWalk(dykeGroup, segA, NW.widthM, 1.35, 0.32, 0.55, 0.72, MATS.travertineStone, MATS.giltChofa);
        if (segB.length >= 2) addRibbonWalk(dykeGroup, segB, NW.widthM, 1.35, 0.32, 0.55, 0.72, MATS.travertineStone, MATS.giltChofa);
      }
    }

    for (let i = 0; i < M.salaPavilions.length; i++) {
      const SP = M.salaPavilions[i];
      const yDeck = SP.y + 0.55;
      addCyl(dykeGroup, SP.r, SP.r * 1.10, yDeck - (-30.0), 8, SP.x, -30.0, SP.z, Math.PI / 8, MATS.travertineStone, 5.0);
      addCyl(dykeGroup, SP.r * 1.02, SP.r * 1.03, 0.75, 8, SP.x, yDeck - 1.10, SP.z, Math.PI / 8, MATS.cobaltGlaze, 3.5);
      const rCol = SP.r * 0.78;
      for (let c = 0; c < SP.cols; c++) {
        const ca = (c / SP.cols) * Math.PI * 2 + Math.PI / 8;
        addCyl(dykeGroup, 0.70, 0.85, SP.colH, 8, SP.x + rCol * Math.cos(ca), yDeck, SP.z + rCol * Math.sin(ca), 0, MATS.travertineStone, 2.5);
      }
      const yEnt = yDeck + SP.colH;
      addCyl(dykeGroup, SP.r * 0.96, SP.r * 0.98, 1.10, 8, SP.x, yEnt, SP.z, Math.PI / 8, MATS.giltChofa, 3.0);
      addCone(dykeGroup, SP.r * 1.16, 4.9, 8, SP.x, yEnt + 1.10, SP.z, Math.PI / 8, MATS.celadonRoof);
      addCone(dykeGroup, SP.r * 0.68, 4.3, 8, SP.x, yEnt + 4.8, SP.z, Math.PI / 8, MATS.celadonRoof);
      addCone(dykeGroup, 1.7, 4.3, 8, SP.x, yEnt + 8.4, SP.z, 0, MATS.giltChofa);
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
