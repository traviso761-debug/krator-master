// ================================================================= FLOATING CITY — Sea-Ring Weir, Venetian Harbour Quays, Boulevard-Dykes & Sala Pavilions [draw]
// Builds:
//   A2. 1,400 m Circular Arcaded Sea-Ring Weir (72 outer wave-buttresses, 12 watch-turrets, 6 Inner Venetian Harbour-Quay
//       Masonry Shelves at +6.2 m, 4 twin-keep Sector Locks with arched suspension bridges & animated miter-gates)
//   A4. 3 Colossal Radial Boulevard-Dykes (r=96..698 m locking directly into Sumeru Hub AND Sea-Ring Weir, paired +6.2 m
//       solid stone Quay Terraces under every dyke-side building, battered cutwaters, vaulted barge-passages, reversible
//       tide-wheels, + NNE Arched Sea-Viaduct landing directly on the Mainland West Stone Harbour Mole!)
//   A4b. 14 8-Column Sala-Nam Water Pavilions (solid columns + entablature + 2-tier celadon/gilt roofs -> 0 floating roofs!)
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
       A2. 1,400 m Circular Arcaded Sea-Ring Weir, 6 Venetian Harbour Quays & 4 Locks
       ------------------------------------------------------------------- */
    const SR = M.seaRing;
    const weirGroup = new THREE.Group();
    weirGroup.name = 'fc_noahbabel_sea_ring';
    root.add(weirGroup);

    const nSeg = 72;
    const lockAngles = SR.locks.map(function (L) { return ((L.angDeg % 360) + 360) % 360; });
    const rMid = 0.5 * (SR.rOuter + SR.rInner);
    const segLen = (2 * Math.PI * rMid) / nSeg * 1.04;

    for (let s = 0; s < nSeg; s++) {
      const deg = (s + 0.5) * (360 / nSeg);
      let inLock = false;
      for (let li = 0; li < lockAngles.length; li++) {
        let diff = Math.abs(deg - lockAngles[li]);
        if (diff > 180) diff = 360 - diff;
        if (diff < 2.7) { inLock = true; break; }
      }
      if (inLock) continue;

      const rad = deg * Math.PI / 180;
      const ux = Math.cos(rad), uz = Math.sin(rad);
      const sx = SR.cx + rMid * ux, sz = SR.cz + rMid * uz;
      const bed = Math.min(-18.0, terrainH(sx, sz) - 1.0);
      const hWeir = SR.promenadeY - bed;
      const inScar = deg >= SR.scarArcDeg[0] && deg <= SR.scarArcDeg[1];

      /* Main sea-ring casemate wall */
      addBox(weirGroup, 28.0, hWeir, segLen, sx, bed, sz, -rad, inScar ? MATS.cobaltGlaze : MATS.ancientConcrete, 7.0);

      /* Outer ocean battered wave-deflector buttress pier */
      addBox(weirGroup, 9.5, hWeir - 2.0, 7.2, SR.cx + (SR.rOuter + 3.2) * ux, bed, SR.cz + (SR.rOuter + 3.2) * uz, -rad, MATS.ancientConcrete, 5.5);

      /* Travertine promenade deck + inner & outer stone parapets */
      addBox(weirGroup, 30.0, 1.5, segLen, sx, SR.promenadeY - 1.2, sz, -rad, MATS.travertineStone, 5.0);
      addBox(weirGroup, 1.8, 1.5, segLen, SR.cx + (SR.rOuter - 0.8) * ux, SR.promenadeY, SR.cz + (SR.rOuter - 0.8) * uz, -rad, MATS.celadonRoof, 4.0);
      addBox(weirGroup, 1.4, 1.2, segLen, SR.cx + (SR.rInner + 0.8) * ux, SR.promenadeY, SR.cz + (SR.rInner + 0.8) * uz, -rad, MATS.travertineStone, 4.0);

      /* Octagonal Watch-Turrets every 6 segments (12 perimeter turrets) */
      if (s % 6 === 0 && !inScar) {
        const tx = SR.cx + (SR.rOuter - 3.0) * ux, tz = SR.cz + (SR.rOuter - 3.0) * uz;
        addCyl(weirGroup, 6.2, 6.8, 10.5, 8, tx, SR.promenadeY - 0.2, tz, 0, MATS.ancientCeramic, 4.0);
        addCone(weirGroup, 7.2, 5.8, 8, tx, SR.promenadeY + 10.0, tz, 0, MATS.celadonRoof);
        addCone(weirGroup, 1.5, 3.8, 8, tx, SR.promenadeY + 15.4, tz, 0, MATS.giltChofa);
      }

      if (typeof KWALK !== 'undefined' && KWALK.floor) {
        KWALK.floor({ rect: [sx - 13, sx + 13, sz - 13, sz + 13], y: SR.promenadeY });
      }
    }

    /* 6 Curved Inner Venetian Harbour-Quay Masonry Shelves (+6.2 m solid stone terrace from r = 610..676 m!) */
    for (let q = 0; q < SR.quays.length; q++) {
      const Q = SR.quays[q];
      let spanDeg = Q.ang1 - Q.ang0;
      if (spanDeg < 0) spanDeg += 360;
      const nChord = Math.max(4, Math.ceil(spanDeg / 3.5));
      const dDeg = spanDeg / nChord;
      const rQMid = 0.5 * (Q.rIn + Q.rOut);
      const qDepth = (Q.rOut - Q.rIn) + 3.0;
      for (let c = 0; c < nChord; c++) {
        const deg = Q.ang0 + (c + 0.5) * dDeg;
        const rad = deg * Math.PI / 180;
        const ux = Math.cos(rad), uz = Math.sin(rad);
        const qx = SR.cx + rQMid * ux, qz = SR.cz + rQMid * uz;
        const chordLen = 2 * Q.rOut * Math.sin((dDeg * 0.5) * Math.PI / 180) * 1.08;
        /* Solid stone wharf masonry from -16 m lagoon floor up to +6.2 m */
        addBox(weirGroup, qDepth, Q.deckY - (-16.0), chordLen, qx, -16.0, qz, -rad, MATS.travertineStone, 7.0);
        /* Inner canal curb & Central Ring-Street Cobalt Pavement Ribbon at r = 642.5 m */
        addBox(weirGroup, 2.4, 0.7, chordLen, SR.cx + (Q.rIn + 1.0) * ux, Q.deckY - 0.4, SR.cz + (Q.rIn + 1.0) * uz, -rad, Q.style === 'suudme' ? MATS.cobaltGlaze : MATS.giltChofa, 3.5);
        addBox(weirGroup, 12.0, 0.25, chordLen, SR.cx + 642.5 * ux, Q.deckY - 0.05, SR.cz + 642.5 * uz, -rad, MATS.cobaltGlaze, 4.5);
        if (typeof KWALK !== 'undefined' && KWALK.floor) {
          KWALK.floor({ rect: [qx - 24, qx + 24, qz - 24, qz + 24], y: Q.deckY });
        }
      }
      /* Monumental Stone Stair-Ramp at midpoint of each Harbour Quay climbing from +6.2 m to +18.0 m Weir Promenade */
      const midRad = (Q.ang0 + spanDeg * 0.5) * Math.PI / 180;
      for (let st = 0; st < 6; st++) {
        const rSt = 656.0 + st * 3.2;
        const ySt = Q.deckY + (st + 1) * ((SR.promenadeY - Q.deckY) / 6);
        addBox(weirGroup, 4.2, ySt - Q.deckY + 0.5, 11.0, SR.cx + rSt * Math.cos(midRad), Q.deckY - 0.3, SR.cz + rSt * Math.sin(midRad), -midRad, MATS.travertineStone, 3.5);
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
      addBox(scarGroup, 24, 18.0 - (g0 - 0.3), 24, mx, g0 - 0.3, mz, 0, MATS.cobaltGlaze, 6.0);
      for (let i = 0; i < SR.scarBlocks.length; i++) {
        const B = SR.scarBlocks[i];
        const gb = lowGroundUnderBox(B.x, B.z, B.w * 0.5, B.d * 0.5);
        addBox(scarGroup, B.w, B.h, B.d, B.x, gb - 0.15, B.z, B.ry, MATS.ancientConcrete, 4.0);
      }
      scarGroup.updateMatrixWorld(true);
      if (typeof KRUINS !== 'undefined' && KRUINS.watch) {
        KRUINS.watch(scarGroup, { name: 'NW Sea-Ring Weir Tsunami Scar', ground: terrainH });
      }
    }

    /* 4 Sector Ship-Locks: Twin Prou-Torre Keeps with Tall Pylons Supporting +36 m Arched Truss Bridges (0 floating spans!) */
    for (let i = 0; i < SR.locks.length; i++) {
      const L = SR.locks[i];
      const a = L.angDeg * Math.PI / 180;
      for (let k = 0; k < L.keeps.length; k++) {
        const K = L.keeps[k];
        const g0 = Math.min(-20.0, terrainH(K.x, K.z) - 1.0);
        /* Main keep drum rising all the way to L.bridgeY + 2 m so the high bridge deck sits solidly on the keeps! */
        addCyl(weirGroup, 13.0, 16.5, L.bridgeY + 2.0 - g0, 12, K.x, g0, K.z, 0, MATS.ancientCeramic, 6.0);
        addCyl(weirGroup, 14.5, 14.8, 2.2, 12, K.x, L.bridgeY + 0.5, K.z, 0, MATS.giltChofa, 3.5);
        addCone(weirGroup, 15.2, 9.0, 12, K.x, L.bridgeY + 2.4, K.z, 0, MATS.celadonRoof);
        addCone(weirGroup, 2.5, 6.0, 8, K.x, L.bridgeY + 10.8, K.z, 0, MATS.giltChofa);
      }

      /* +36 m High-Clearance Paktong Box-Truss Bridge anchored directly into both Keep Drums! */
      addBox(weirGroup, 18.0, 2.8, 92.0, L.x, L.bridgeY - 1.4, L.z, -a, MATS.paktongMetal, 5.0);
      addBox(weirGroup, 1.2, 5.2, 90.0, L.x - 8.2 * Math.cos(a), L.bridgeY + 1.0, L.z - 8.2 * Math.sin(a), -a, MATS.paktongMetal, 4.0);
      addBox(weirGroup, 1.2, 5.2, 90.0, L.x + 8.2 * Math.cos(a), L.bridgeY + 1.0, L.z + 8.2 * Math.sin(a), -a, MATS.paktongMetal, 4.0);

      const gateL = new THREE.Mesh(FC_SUMERU_CORE.uvScaleBox(3.2, 24.0, 22.0, 4.0), MATS.paktongMetal);
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
          at: [L.x, 4, L.z], ry: -a, size: [32, 92, 42]
        });
      }
    }

    /* -------------------------------------------------------------------
       A4. 3 Colossal Radial Boulevard-Dykes (r=96..698 m + Paired +6.2 m Quay Terraces + NNE Sea-Viaduct!)
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

      /* 1. Central +22.0 m Boulevard Spine locking directly into Sumeru Hub (r=96 m) AND Sea-Ring Weir (r=698 m)! */
      addBox(dykeGroup, len, D.crownY - (-18.0), D.widthM, dx, -18.0, dz, -a, MATS.travertineStone, 8.0);
      /* Central boulevard cobalt carriageway + twin stone parapet walls */
      addBox(dykeGroup, len - 4.0, 0.35, 16.0, dx, D.crownY - 0.1, dz, -a, MATS.cobaltGlaze, 5.0);
      addBox(dykeGroup, len - 2.0, 1.35, 1.5, dx + (D.widthM * 0.5 - 0.9) * nx, D.crownY, dz + (D.widthM * 0.5 - 0.9) * nz, -a, MATS.celadonRoof, 4.0);
      addBox(dykeGroup, len - 2.0, 1.35, 1.5, dx - (D.widthM * 0.5 - 0.9) * nx, D.crownY, dz - (D.widthM * 0.5 - 0.9) * nz, -a, MATS.celadonRoof, 4.0);

      /* Rhythmic Battered Cutwater Buttress Piers every 38 m along both sides of the Boulevard Spine */
      for (let rp = D.r0 + 28.0; rp < D.r1 - 18.0; rp += 38.0) {
        for (let sgn = -1; sgn <= 1; sgn += 2) {
          const px = SM.cx + rp * ux + sgn * (D.widthM * 0.5 + 1.8) * nx;
          const pz = SM.cz + rp * uz + sgn * (D.widthM * 0.5 + 1.8) * nz;
          addBox(dykeGroup, 6.2, D.crownY - (-16.0), 4.4, px, -16.0, pz, -a, MATS.ancientCeramic, 5.0);
        }
      }

      /* 2. Paired Solid Masonry Lower Quay Terraces (+6.2 m, total width 120..124 m) supporting all Dyke-Side Buildings! */
      const qLen = D.quayR1 - D.quayR0;
      const qMidR = 0.5 * (D.quayR0 + D.quayR1);
      const qx = SM.cx + qMidR * ux, qz = SM.cz + qMidR * uz;
      addBox(dykeGroup, qLen, D.quayY - (-16.0), D.quayHalfW * 2.0, qx, -16.0, qz, -a, MATS.travertineStone, 7.5);
      /* Canal-lip coping & boat landing steps along both outer edges of the +6.2 m Quay Terrace */
      for (let sgn = -1; sgn <= 1; sgn += 2) {
        const ex = qx + sgn * (D.quayHalfW - 1.2) * nx, ez = qz + sgn * (D.quayHalfW - 1.2) * nz;
        addBox(dykeGroup, qLen, 0.75, 2.4, ex, D.quayY - 0.25, ez, -a, D.tag === 'nne' ? MATS.cobaltGlaze : MATS.giltChofa, 4.0);
        /* Waterfront Boat-Step Apron at +2.6 m */
        const sx2 = qx + sgn * (D.quayHalfW + 2.2) * nx, sz2 = qz + sgn * (D.quayHalfW + 2.2) * nz;
        addBox(dykeGroup, qLen * 0.92, 2.6 - (-14.0), 4.6, sx2, -14.0, sz2, -a, MATS.ancientConcrete, 6.0);
      }

      /* 3. Vaulted Barge-Gate Portals, Grand Lateral Stair-Towers (+6.2 -> +22.0 m) & Reversible Tide-Wheels */
      for (let g = 0; g < D.gates.length; g++) {
        const rg = D.gates[g];
        const gx = SM.cx + rg * ux, gz = SM.cz + rg * uz;
        addBox(dykeGroup, 26.0, 9.2, D.widthM + 4.0, gx, D.crownY - 0.3, gz, -a, MATS.cobaltGlaze, 4.0);
        addBox(dykeGroup, 28.0, 2.2, D.widthM + 6.0, gx, D.crownY + 8.6, gz, -a, MATS.celadonRoof, 4.0);

        /* Stepped Lateral Staircase Ramps climbing from +6.2 m Quay Terrace to +22.0 m Boulevard */
        for (let st = 0; st < 6; st++) {
          const ySt = D.quayY + (st + 1) * ((D.crownY - D.quayY) / 6);
          addBox(dykeGroup, 8.0, ySt - D.quayY + 0.5, D.widthM + 16.0 - st * 2.2, gx + (st - 2.5) * 4.2 * ux, D.quayY - 0.3, gz + (st - 2.5) * 4.2 * uz, -a, MATS.travertineStone, 4.0);
        }

        const wheel = new THREE.Mesh(FC_SUMERU_CORE.uvScaleCyl(6.2, 6.2, 4.2, 12, 3.0), MATS.cypressHull);
        wheel.position.set(gx + (D.quayHalfW + 3.0) * nx, 0.8, gz + (D.quayHalfW + 3.0) * nz);
        wheel.rotation.z = Math.PI * 0.5;
        wheel.rotation.y = -a;
        dykeGroup.add(wheel);
        tideWheels.push(wheel);
        dynamicMeshes.add(wheel);
      }

      /* 4. NNE Arched Ocean Viaduct (r = 698 .. 892 m) Ramping Smoothly from Sea-Ring (+22 m) onto West Harbour Mole (+7.8 m)! */
      if (D.seaViaductR1 > D.r1) {
        const nSpans = 7;
        const rStart = D.r1 - 4.0, rEnd = D.seaViaductR1;
        const stepR = (rEnd - rStart) / nSpans;
        for (let sp = 0; sp < nSpans; sp++) {
          const rA = rStart + sp * stepR, rB = rA + stepR;
          const rM = 0.5 * (rA + rB);
          const uSpan = (sp + 0.5) / nSpans;
          /* Clear +36 m over the Bluff Harbour Ship-Lock on span 0, then descend smoothly onto the +7.8 m Stone Harbour Mole! */
          const deckY = sp === 0 ? 22.0 : (22.0 * (1 - uSpan) + D.seaViaductEndY * uSpan);
          const vx = SM.cx + rM * ux, vz = SM.cz + rM * uz;
          /* Grounded Ocean Viaduct Pier (-26 m seabed -> deckY) */
          const pierX = SM.cx + rB * ux, pierZ = SM.cz + rB * uz;
          addBox(dykeGroup, 9.5, deckY - (-26.0), 30.0, pierX, -26.0, pierZ, -a, MATS.ancientConcrete, 6.5);
          /* Viaduct roadway deck + stone parapets */
          addBox(dykeGroup, stepR + 3.5, 4.2, 26.0, vx, deckY - 3.8, vz, -a, MATS.travertineStone, 5.5);
          addBox(dykeGroup, stepR + 3.5, 0.3, 14.0, vx, deckY + 0.25, vz, -a, MATS.cobaltGlaze, 4.5);
          addBox(dykeGroup, stepR + 3.5, 1.3, 1.4, vx + 12.0 * nx, deckY + 0.2, vz + 12.0 * nz, -a, MATS.celadonRoof, 4.0);
          addBox(dykeGroup, stepR + 3.5, 1.3, 1.4, vx - 12.0 * nx, deckY + 0.2, vz - 12.0 * nz, -a, MATS.celadonRoof, 4.0);
        }
      }

      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'boulevard_dyke', key: D.id, name: D.name,
          at: [dx, D.crownY, dz], ry: -a, size: [len, D.quayHalfW * 2, 40]
        });
      }
    }

    /* 5. 14 Sinuous Naga Walkways (on grounded water-piles!) & 8-Column Sala-Nam Water Pavilions (0 Floating Roofs!) */
    for (let i = 0; i < M.nagaWalks.length; i++) {
      const NW = M.nagaWalks[i];
      for (let s = 0; s < NW.pts.length - 1; s++) {
        const A = NW.pts[s], B = NW.pts[s + 1];
        const mx = (A[0] + B[0]) * 0.5, mz = (A[2] + B[2]) * 0.5;
        const segL = Math.hypot(B[0] - A[0], B[2] - A[2]) + 0.6;
        const yaw = Math.atan2(B[0] - A[0], B[2] - A[2]);
        addBox(dykeGroup, NW.widthM, 1.3, segL, mx, A[1] - 1.1, mz, yaw, MATS.travertineStone, 4.0);
        addBox(dykeGroup, NW.widthM + 0.6, 0.9, segL, mx, A[1] + 0.15, mz, yaw, MATS.giltChofa, 3.0);
        /* Stone support pier anchored in the lagoon floor at every other joint so walkways never float! */
        if (s % 2 === 1) {
          addCyl(dykeGroup, 1.4, 1.8, A[1] - (-16.0), 8, A[0], -16.0, A[2], 0, MATS.ancientConcrete, 4.0);
        }
      }
    }

    for (let i = 0; i < M.salaPavilions.length; i++) {
      const SP = M.salaPavilions[i];
      /* Solid octagonal plinth rising from -16 m lagoon bed to SP.y */
      addCyl(dykeGroup, SP.r, SP.r * 1.10, SP.y - (-16.0), 8, SP.x, -16.0, SP.z, Math.PI / 8, MATS.travertineStone, 5.0);
      addCyl(dykeGroup, SP.r * 1.02, SP.r * 1.03, 0.7, 8, SP.x, SP.y - 0.5, SP.z, Math.PI / 8, MATS.cobaltGlaze, 3.5);

      /* 8 Solid Octagonal Travertine Columns rising from SP.y to SP.y + SP.colH! */
      const rCol = SP.r * 0.78;
      for (let c = 0; c < SP.cols; c++) {
        const ca = (c / SP.cols) * Math.PI * 2 + Math.PI / 8;
        addCyl(dykeGroup, 0.68, 0.82, SP.colH, 8, SP.x + rCol * Math.cos(ca), SP.y - 0.1, SP.z + rCol * Math.sin(ca), 0, MATS.travertineStone, 2.5);
      }

      /* Solid Octagonal Entablature Ring resting directly on the 8 Columns */
      const yEnt = SP.y + SP.colH - 0.25;
      addCyl(dykeGroup, SP.r * 0.96, SP.r * 0.98, 1.15, 8, SP.x, yEnt, SP.z, Math.PI / 8, MATS.giltChofa, 3.0);

      /* Two-Tier Celadon & Gilt Sala Roof seated 0.3 m DOWN into the Entablature (ZERO floating gap!) */
      addCone(dykeGroup, SP.r * 1.16, 4.8, 8, SP.x, yEnt + 0.85, SP.z, Math.PI / 8, MATS.celadonRoof);
      addCone(dykeGroup, SP.r * 0.68, 4.2, 8, SP.x, yEnt + 4.4, SP.z, Math.PI / 8, MATS.celadonRoof);
      addCone(dykeGroup, 1.6, 4.2, 8, SP.x, yEnt + 8.0, SP.z, 0, MATS.giltChofa);
    }

    mergeStaticGroup(weirGroup, dynamicMeshes);
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
      coneGroup: coreOut.coneGroup,
      update: update
    };
  }

  return { buildAll: buildAll, mergeStaticGroup: FC_SUMERU_CORE.mergeStaticGroup };
})();
