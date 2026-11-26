// ================================================================= FLOATING CITY — Voth-Scale Imperial Multi-Kit City Layout & Support Audit [G data]
// Places 2,500..3,200+ non-Ancient buildings (KLK 'suudme' + RIK 'lower-ria' & 'upper-ria') + Floating Chinampa Gardens across:
//   1. Mainland Bluff 9-Avenue Metropolis & 16 Upland Terraced Farms (D6 & D7, strictly >= +65.0 m tsunami refuge law!)
//   2. 4 Radial Boulevard-Dykes: Double-Row +22.0 m Upper Boulevards + Quad-Row +6.2 m Masonry Quay Blocks (0 bare concrete!)
//   3. 8 Inner Sea-Ring Venetian Harbour-Quay Triple-Row Wards (+6.2 m) & +18.0 m Sea-Ring Rampart Town
//   4. D5 Expanded West & East Stone Harbour Moles (+7.8 m, strictly non-residential maritime works flanking 4 Cliff-Funiculars)
//   5. 32..38 Large Multi-Shape Neighborhood Floating Platforms (118..166 m across: oct-moon, hex-moon, rect-canal, u-harbour,
//      stepped-bazaar; 25..42+ buildings per platform!) + 16..20 Floating Chinampa Garden Rafts
//   6. Grand 4-Tier Sumeru Ministerial & Sacred Terraces + 5-Spire Bussabok Royal Island (D1)
// Pure [G data]: zero THREE, zero DOM, deterministic on KRAND, 0 OBB overlaps, 0 unsupported/floating corners!
const FC_CITY = (function () {
  'use strict';

  /* Three.js right-handed +Y rotation convention: local (lx, lz) -> world (x + lx*cos + lz*sin, z - lx*sin + lz*cos) */
  function localToWorld(cx, cz, ry, lx, lz) {
    const c = Math.cos(ry), s = Math.sin(ry);
    return [cx + lx * c + lz * s, cz - lx * s + lz * c];
  }

  function worldToLocal(cx, cz, ry, wx, wz) {
    const dx = wx - cx, dz = wz - cz;
    const c = Math.cos(ry), s = Math.sin(ry);
    return [dx * c - dz * s, dx * s + dz * c];
  }

  function obbCorners(L, pad) {
    const p = pad == null ? 0 : pad;
    const hw = (L.w * 0.5) + p, hd = (L.d * 0.5) + p;
    const c = Math.cos(L.ry), s = Math.sin(L.ry);
    return [
      [L.x - hw * c + hd * s, L.z + hw * s + hd * c],
      [L.x + hw * c + hd * s, L.z - hw * s + hd * c],
      [L.x + hw * c - hd * s, L.z - hw * s - hd * c],
      [L.x - hw * c - hd * s, L.z + hw * s - hd * c]
    ];
  }

  function obbOverlap(A, B, pad) {
    const p2 = pad == null ? 0 : pad * 2;
    const maxSpan = (A.w + B.w + A.d + B.d) * 0.52 + p2;
    const dx = A.x - B.x;
    if (dx > maxSpan || dx < -maxSpan) return false;
    const dz = A.z - B.z;
    if (dz > maxSpan || dz < -maxSpan) return false;
    const rMax = 0.52 * (Math.hypot(A.w, A.d) + Math.hypot(B.w, B.d)) + p2;
    if (dx * dx + dz * dz > rMax * rMax) return false;
    const cA = obbCorners(A, pad), cB = obbCorners(B, pad);
    const axes = [
      [Math.cos(A.ry), -Math.sin(A.ry)], [Math.sin(A.ry), Math.cos(A.ry)],
      [Math.cos(B.ry), -Math.sin(B.ry)], [Math.sin(B.ry), Math.cos(B.ry)]
    ];
    for (let i = 0; i < 4; i++) {
      const ax = axes[i][0], az = axes[i][1];
      let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity;
      for (let k = 0; k < 4; k++) {
        const pA = cA[k][0] * ax + cA[k][1] * az;
        const pB = cB[k][0] * ax + cB[k][1] * az;
        if (pA < minA) minA = pA;
        if (pA > maxA) maxA = pA;
        if (pB < minB) minB = pB;
        if (pB > maxB) maxB = pB;
      }
      if (maxA <= minB + 1e-4 || maxB <= minA + 1e-4) return false;
    }
    return true;
  }

  function normDeg(d) {
    let x = d % 360;
    if (x < 0) x += 360;
    return x;
  }

  function inArcDeg(deg, a0, a1) {
    const d = normDeg(deg), s = normDeg(a0), e = normDeg(a1);
    if (s <= e) return d >= s && d <= e;
    return d >= s || d <= e;
  }

  /* Exact per-shape deck support test for all 5 neighborhood platform shapes */
  function isPointOnPlatform(W, wx, wz, margin, localY) {
    const m = margin == null ? 0.3 : margin;
    const ly = localY == null ? 0 : localY;
    const loc = worldToLocal(W.x, W.z, W.yaw == null ? 0 : W.yaw, wx, wz);
    const ax = Math.abs(loc[0]), az = Math.abs(loc[1]);

    if (W.shape === 'oct-moon') {
      const a = W.rOut * 0.92388 - m;
      if (ax > a || az > a || (ax + az) * 0.707107 > a) return false;
      if (Math.hypot(loc[0], loc[1]) < W.rMoon + m) return false;
      return ly <= 0.2;
    }
    if (W.shape === 'hex-moon') {
      const a = W.rOut * 0.866025 - m;
      if (ax > a || (0.5 * ax + 0.866025 * az) > a) return false;
      if (Math.hypot(loc[0], loc[1]) < W.rMoon + m) return false;
      return ly <= 0.2;
    }
    if (W.shape === 'rect-canal') {
      if (ax > W.w * 0.5 - m || az > W.d * 0.5 - m) return false;
      if (ax < W.moonW * 0.5 + m && az < W.moonD * 0.5 + m) return false;
      return ly <= 0.2;
    }
    if (W.shape === 'u-harbour') {
      if (ax > W.w * 0.5 - m || az > W.d * 0.5 - m) return false;
      /* Open sheltered boat-haven court on +lz side */
      if (ax < W.notchW * 0.5 + m && loc[1] > (W.d * 0.5 - W.notchD - m)) return false;
      return ly <= 0.2;
    }
    if (W.shape === 'stepped-bazaar') {
      if (ly > 1.0) {
        return ax <= W.stepW * 0.5 - m && az <= W.stepD * 0.5 - m;
      }
      if (ax > W.w * 0.5 - m || az > W.d * 0.5 - m) return false;
      if (ax < W.stepW * 0.5 + m && az < W.stepD * 0.5 + m) return false;
      return true;
    }
    /* Fallback octagon */
    const rIn = (W.rOut == null ? 44 : W.rOut) * 0.922 - m;
    const d = Math.hypot(loc[0], loc[1]);
    return d <= rIn && d >= (W.rMoon == null ? 8 : W.rMoon) + m;
  }

  /* Check whether an oriented rectangle (x, z, w, d, ry) clears all fixed megastructures in the lagoon */
  function boxClearOfMega(px, pz, w, d, ry, mega, canalGap) {
    const CX = FC_SITE.WEIR_CX, CZ = FC_SITE.WEIR_CZ;
    const gap = canalGap == null ? 14.0 : canalGap;
    const corners = obbCorners({ x: px, z: pz, w: w, d: d, ry: ry }, gap);

    for (let c = 0; c < 4; c++) {
      const cx = corners[c][0], cz = corners[c][1];
      const dx = cx - CX, dz = cz - CZ;
      const rC = Math.hypot(dx, dz);
      if (rC < 268.0 || rC > 882.0) return false;

      /* Keep clear of South Royal Bussabok Island & its Naga causeways */
      const B = mega.sumeru.bussabok;
      if (Math.abs(cx - B.cx) < B.w * 0.5 + 18.0 && cz > CZ + 195.0 && cz < B.cz + B.d * 0.5 + 18.0) {
        return false;
      }

      /* Keep clear of all 4 Radial Boulevard-Dyke +6.2 m Masonry Quay Terraces */
      for (let i = 0; i < mega.dykes.length; i++) {
        const D = mega.dykes[i], a = D.angDeg * Math.PI / 180;
        const ux = Math.cos(a), uz = Math.sin(a);
        const along = dx * ux + dz * uz;
        const perp = Math.abs(-dx * uz + dz * ux);
        if (along > 95.0 && along < 935.0 && perp < D.quayHalfW + 14.0) return false;
      }
    }

    /* Also check center & corner clearance against Ziggurat Water-Pods & Sala-Nam Pavilions */
    const halfDiag = 0.5 * Math.hypot(w, d);
    for (let i = 0; i < mega.zigguratPods.length; i++) {
      const Z = mega.zigguratPods[i];
      if (Math.hypot(px - Z.x, pz - Z.z) < 38.0 + halfDiag + 10.0) return false;
    }
    for (let i = 0; i < mega.salaPavilions.length; i++) {
      const S = mega.salaPavilions[i];
      if (Math.hypot(px - S.x, pz - S.z) < S.r + halfDiag + 8.0) return false;
    }
    return true;
  }

  /* Deterministic Neighborhood-Scale Floating Archipelago (32..38 Major Platforms across 5 Shapes) + 18 Chinampa Garden Rafts */
  function generateArchipelago(mega) {
    const CX = FC_SITE.WEIR_CX, CZ = FC_SITE.WEIR_CZ;
    const pontoons = [];
    const shapes = ['rect-canal', 'oct-moon', 'u-harbour', 'stepped-bazaar', 'hex-moon'];

    const rings = [
      { r: 342, w: 126, d:  98, rOut: 62, nCand: 38 },
      { r: 484, w: 138, d: 104, rOut: 66, nCand: 48 },
      { r: 632, w: 146, d: 110, rOut: 70, nCand: 58 },
      { r: 784, w: 152, d: 114, rOut: 72, nCand: 72 }
    ];

    let kCnt = 0, uCnt = 0, fCnt = 0, pCnt = 0, seq = 0;
    for (let ri = 0; ri < rings.length; ri++) {
      const rg = rings[ri];
      for (let s = 0; s < rg.nCand; s++) {
        const jitA = (KRAND.unit(KRAND.hash(0xFC330, ri, s, 3)) - 0.5) * (0.20 / rg.nCand) * Math.PI * 2;
        const jitR = (KRAND.unit(KRAND.hash(0xFC330, ri, s, 9)) - 0.5) * 10.0;
        const ang = (s / rg.nCand) * Math.PI * 2 + ri * 0.14 + jitA;
        const rr = rg.r + jitR;
        const px = +(CX + rr * Math.cos(ang)).toFixed(1);
        const pz = +(CZ + rr * Math.sin(ang)).toFixed(1);
        const yaw = +Math.atan2(px - CX, pz - CZ).toFixed(4);

        const shape = shapes[(ri * 2 + seq) % shapes.length];
        const w = (shape === 'oct-moon' || shape === 'hex-moon') ? rg.rOut * 2.0 : rg.w;
        const d = (shape === 'oct-moon' || shape === 'hex-moon') ? rg.rOut * 2.0 : rg.d;

        if (!boxClearOfMega(px, pz, w, d, yaw, mega, 8.0)) continue;

        /* Maintain 16..22 m Venetian shipping canals between neighboring platforms */
        let hitOther = false;
        const candBox = { x: px, z: pz, w: w, d: d, ry: yaw };
        for (let i = 0; i < pontoons.length; i++) {
          const P = pontoons[i];
          if (obbOverlap(candBox, { x: P.x, z: P.z, w: P.w, d: P.d, ry: P.yaw }, 8.5)) {
            hitOther = true;
            break;
          }
        }
        if (hitOther) continue;
        seq++;

        const deg = normDeg(ang * 180 / Math.PI);
        let kind = 'ria', id = '';
        if (deg >= 290 || deg < 26) {
          kind = 'suudme';
          id = 'K' + (++kCnt);
        } else if (deg >= 26 && deg < 82) {
          kind = 'upper';
          id = 'U' + (++uCnt);
        } else if (deg >= 172 && deg < 218) {
          kind = 'free';
          id = 'F' + (++fCnt);
        } else {
          kind = (seq % 3 === 0 && deg > 218) ? 'suudme' : 'ria';
          id = 'P' + (++pCnt);
        }

        const bedY = +Math.min(-24.0, FC_SITE.elevAt(px, pz)).toFixed(2);
        pontoons.push({
          id: id,
          x: px,
          z: pz,
          yaw: yaw,
          shape: shape,
          w: w,
          d: d,
          rOut: +((shape === 'oct-moon' || shape === 'hex-moon') ? rg.rOut : 0.5 * Math.max(w, d)).toFixed(1),
          rMoon: shape === 'oct-moon' ? 12.5 : (shape === 'hex-moon' ? 11.5 : 8.0),
          moonW: 20.0,
          moonD: 14.0,
          notchW: 40.0,
          notchD: 44.0,
          stepW: +(w * 0.44).toFixed(1),
          stepD: +(d * 0.45).toFixed(1),
          sides: shape === 'hex-moon' ? 6 : 8,
          kind: kind,
          freeboardM: kind === 'upper' ? 2.4 : 2.3,
          draftM: 3.4,
          pileTopY: 12.0,
          bedY: bedY
        });
      }
    }

    /* Generate 16..20 Dedicated Floating Garden Rafts (Chinampas / Aquaponic Wards) in sheltered lagoon pockets! */
    const gardens = [];
    const gardenKinds = [
      { theme: 'paddy_taro',    crops: ['rice', 'taro'],                   harvest: { food: 6.5, silk: 0.0, dye_indigo: 0.0 }, culture: 'ria' },
      { theme: 'lotus_greens',  crops: ['lotus', 'water_chestnut', 'greens'], harvest: { food: 5.5, silk: 0.0, dye_indigo: 0.0 }, culture: 'ria' },
      { theme: 'mulberry_silk', crops: ['mulberry', 'herb'],               harvest: { food: 1.8, silk: 1.4, dye_indigo: 0.0 }, culture: 'ria' },
      { theme: 'indigo_dye',    crops: ['indigo', 'reagent', 'greens'],    harvest: { food: 1.6, silk: 0.0, dye_indigo: 2.2 }, culture: 'kulanewa' }
    ];
    const gardenRings = [
      { r: 856, w: 56, d: 38, nCand: 56 },
      { r: 458, w: 52, d: 36, nCand: 44 },
      { r: 652, w: 54, d: 36, nCand: 52 },
      { r: 292, w: 48, d: 34, nCand: 32 }
    ];
    for (let gi = 0; gi < gardenRings.length && gardens.length < 20; gi++) {
      const gr = gardenRings[gi];
      for (let s = 0; s < gr.nCand && gardens.length < 20; s++) {
        const ang = (s / gr.nCand) * Math.PI * 2 + gi * 0.27;
        const gx = +(CX + gr.r * Math.cos(ang)).toFixed(1);
        const gz = +(CZ + gr.r * Math.sin(ang)).toFixed(1);
        const gyaw = +Math.atan2(gx - CX, gz - CZ).toFixed(4);
        if (!boxClearOfMega(gx, gz, gr.w, gr.d, gyaw, mega, 6.0)) continue;

        const gBox = { x: gx, z: gz, w: gr.w, d: gr.d, ry: gyaw };
        let clash = false;
        for (let i = 0; i < pontoons.length; i++) {
          const P = pontoons[i];
          if (obbOverlap(gBox, { x: P.x, z: P.z, w: P.w, d: P.d, ry: P.yaw }, 9.0)) { clash = true; break; }
        }
        if (clash) continue;
        for (let i = 0; i < gardens.length; i++) {
          const G2 = gardens[i];
          if (obbOverlap(gBox, { x: G2.x, z: G2.z, w: G2.w, d: G2.d, ry: G2.yaw }, 10.0)) { clash = true; break; }
        }
        if (clash) continue;

        const gk = gardenKinds[gardens.length % gardenKinds.length];
        const gBed = +Math.min(-24.0, FC_SITE.elevAt(gx, gz)).toFixed(2);
        gardens.push({
          id: 'G' + (gardens.length + 1),
          x: gx,
          z: gz,
          yaw: gyaw,
          w: gr.w,
          d: gr.d,
          rOut: +(0.5 * Math.hypot(gr.w, gr.d)).toFixed(1),
          theme: gk.theme,
          crops: gk.crops,
          harvest: gk.harvest,
          culture: gk.culture,
          freeboardM: 1.25,
          draftM: 1.85,
          pileTopY: 11.5,
          bedY: gBed
        });
      }
    }

    return { pontoons: pontoons, gardens: gardens };
  }

  /* Test whether world point (wx, wz) lies inside the outer hull envelope (including moon-pool / U-notch) of a platform or raft */
  function isPointInsideOuterHull(W, wx, wz, pad) {
    const p = pad == null ? 0.0 : pad;
    const loc = worldToLocal(W.x, W.z, W.yaw == null ? 0 : W.yaw, wx, wz);
    const ax = Math.abs(loc[0]), az = Math.abs(loc[1]);
    if (W.shape === 'oct-moon') {
      const a = W.rOut * 0.92388 + p;
      return ax <= a && az <= a && (ax + az) * 0.707107 <= a;
    }
    if (W.shape === 'hex-moon') {
      const a = W.rOut * 0.866025 + p;
      return ax <= a && (0.5 * ax + 0.866025 * az) <= a;
    }
    if (W.w != null && W.d != null) {
      return ax <= W.w * 0.5 + p && az <= W.d * 0.5 + p;
    }
    const r = (W.rOut == null ? 11.0 : W.rOut) + p;
    return Math.hypot(loc[0], loc[1]) <= r;
  }

  /* Exact outer boundary point on a floating platform, Chinampa raft, or Sala pavilion facing toward world target (tx, tz) */
  function rimTowardsShape(node, tx, tz) {
    if (node.shape === 'oct-moon' || node.shape === 'hex-moon') {
      const loc = worldToLocal(node.x, node.z, node.yaw == null ? 0 : node.yaw, tx, tz);
      const len = Math.hypot(loc[0], loc[1]);
      const dx = len > 1e-6 ? loc[0] / len : 0.0;
      const dz = len > 1e-6 ? loc[1] / len : 1.0;
      const ax = Math.abs(dx), az = Math.abs(dz);
      let tRim = node.rOut * 0.90;
      if (node.shape === 'oct-moon') {
        const a = node.rOut * 0.92388;
        tRim = a / Math.max(ax, az, (ax + az) * 0.707107, 1e-6);
      } else {
        const a = node.rOut * 0.866025;
        tRim = a / Math.max(ax, 0.5 * ax + 0.866025 * az, 1e-6);
      }
      const wpt = localToWorld(node.x, node.z, node.yaw == null ? 0 : node.yaw, dx * tRim, dz * tRim);
      return [+wpt[0].toFixed(2), +wpt[1].toFixed(2)];
    }

    if (node.w != null && node.d != null) {
      const loc = worldToLocal(node.x, node.z, node.yaw == null ? 0 : node.yaw, tx, tz);
      const len = Math.hypot(loc[0], loc[1]);
      const dx = len > 1e-6 ? loc[0] / len : 0.0;
      const dz = len > 1e-6 ? loc[1] / len : 1.0;
      const hw = node.w * 0.5, hd = node.d * 0.5;
      const txMax = Math.abs(dx) > 1e-6 ? hw / Math.abs(dx) : Infinity;
      const tzMax = Math.abs(dz) > 1e-6 ? hd / Math.abs(dz) : Infinity;
      const tRim = Math.min(txMax, tzMax);
      let ex = dx * tRim, ez = dz * tRim;
      /* Never land a bridge inside the open sheltered U-harbour boat court on the +lz face! */
      if (node.shape === 'u-harbour' && ez >= hd - 0.25 && Math.abs(ex) < node.notchW * 0.5 + 4.0) {
        const sgnX = ex >= 0 ? 1 : -1;
        ex = sgnX * Math.min(hw - 3.5, node.notchW * 0.5 + 6.5);
        ez = hd;
      }
      const wpt = localToWorld(node.x, node.z, node.yaw == null ? 0 : node.yaw, ex, ez);
      return [+wpt[0].toFixed(2), +wpt[1].toFixed(2)];
    }

    const vx = tx - node.x, vz = tz - node.z;
    const dist = Math.hypot(vx, vz);
    const ux = dist > 1e-6 ? vx / dist : 0.0;
    const uz = dist > 1e-6 ? vz / dist : 1.0;
    const rEdge = (node.rOut == null ? 11.0 : node.rOut) * 0.94;
    return [+(node.x + ux * rEdge).toFixed(2), +(node.z + uz * rEdge).toFixed(2)];
  }

  /* Compute exact facing outer-rim pair [p0, p1] between A and B (including Boulevard-Dyke ±78 m & Sea-Ring r=896 m inner quay walls!) */
  function computeBridgeRimPair(A, B, mega) {
    const CX = FC_SITE.WEIR_CX, CZ = FC_SITE.WEIR_CZ;
    function dykeRimPoint(dykeAnchor, targetX, targetZ) {
      const D = dykeAnchor.dyke;
      const a = D.angDeg * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a), nx = -uz, nz = ux;
      const dx = targetX - CX, dz = targetZ - CZ;
      let along = dx * ux + dz * uz;
      const perp = dx * nx + dz * nz;
      const sgn = perp >= 0 ? 1 : -1;
      along = Math.max(D.quayR0 + 18.0, Math.min(D.quayR1 - 18.0, along));
      /* Keep clear of reversible tide-wheels & barge-gate mouths */
      for (let g = 0; g < D.gates.length; g++) {
        const df = along - D.gates[g];
        if (Math.abs(df) < 15.0) {
          along = D.gates[g] + (df >= 0 ? 15.0 : -15.0);
        }
      }
      along = Math.max(D.quayR0 + 18.0, Math.min(D.quayR1 - 18.0, along));
      return [
        +(CX + along * ux + sgn * D.quayHalfW * nx).toFixed(2),
        +(CZ + along * uz + sgn * D.quayHalfW * nz).toFixed(2)
      ];
    }

    function seaQuayRimPoint(sqAnchor, targetX, targetZ) {
      const Q = sqAnchor.seaQuay;
      let deg = normDeg(Math.atan2(targetZ - CZ, targetX - CX) * 180 / Math.PI);
      const a0 = Q.ang0 + 1.8, a1 = Q.ang1 - 1.8;
      if (deg < a0) deg = a0;
      if (deg > a1) deg = a1;
      const rad = deg * Math.PI / 180;
      return [
        +(CX + Q.rIn * Math.cos(rad)).toFixed(2),
        +(CZ + Q.rIn * Math.sin(rad)).toFixed(2)
      ];
    }

    if (A.dyke && !B.dyke) {
      let p0 = dykeRimPoint(A, B.x, B.z);
      const p1 = rimTowardsShape(B, p0[0], p0[1]);
      p0 = dykeRimPoint(A, p1[0], p1[1]);
      return [p0, p1];
    }
    if (B.dyke && !A.dyke) {
      let p1 = dykeRimPoint(B, A.x, A.z);
      const p0 = rimTowardsShape(A, p1[0], p1[1]);
      p1 = dykeRimPoint(B, p0[0], p0[1]);
      return [p0, p1];
    }
    if (A.seaQuay && !B.seaQuay) {
      let p0 = seaQuayRimPoint(A, B.x, B.z);
      const p1 = rimTowardsShape(B, p0[0], p0[1]);
      p0 = seaQuayRimPoint(A, p1[0], p1[1]);
      return [p0, p1];
    }
    if (B.seaQuay && !A.seaQuay) {
      let p1 = seaQuayRimPoint(B, A.x, A.z);
      const p0 = rimTowardsShape(A, p1[0], p1[1]);
      p1 = seaQuayRimPoint(B, p0[0], p0[1]);
      return [p0, p1];
    }
    let p0 = rimTowardsShape(A, B.x, B.z);
    let p1 = rimTowardsShape(B, p0[0], p0[1]);
    p0 = rimTowardsShape(A, p1[0], p1[1]);
    p1 = rimTowardsShape(B, p0[0], p0[1]);
    return [p0, p1];
  }

  function segmentsCross2D(a0x, a0z, a1x, a1z, b0x, b0z, b1x, b1z) {
    function ccw(ax, az, bx, bz, cx, cz) {
      return (cx - ax) * (bz - az) - (cz - az) * (bx - ax);
    }
    const d1 = ccw(a0x, a0z, a1x, a1z, b0x, b0z);
    const d2 = ccw(a0x, a0z, a1x, a1z, b1x, b1z);
    const d3 = ccw(b0x, b0z, b1x, b1z, a0x, a0z);
    const d4 = ccw(b0x, b0z, b1x, b1z, a1x, a1z);
    return ((d1 > 1e-4 && d2 < -1e-4) || (d1 < -1e-4 && d2 > 1e-4)) &&
           ((d3 > 1e-4 && d4 < -1e-4) || (d3 < -1e-4 && d4 > 1e-4));
  }

  /* Verify that open-water bridge span (p0 -> p1) crosses ONLY open canal water and never clips any platform, dyke, pod, or bridge! */
  function isBridgeSpanClean(p0, p1, idA, idB, pontoons, gardens, mega, existingLinks, maxSpan) {
    const CX = FC_SITE.WEIR_CX, CZ = FC_SITE.WEIR_CZ;
    const dxS = p1[0] - p0[0], dzS = p1[1] - p0[1];
    const span = Math.hypot(dxS, dzS);
    const cap = maxSpan == null ? 84.0 : maxSpan;
    if (span < 7.5 || span > cap) return false;

    const endInset = Math.min(1.6, span * 0.18);
    const steps = Math.max(6, Math.ceil(span / 2.2));
    for (let s = 1; s < steps; s++) {
      const distAlong = (s / steps) * span;
      if (distAlong < endInset || distAlong > span - endInset) continue;
      const t = s / steps;
      const sx = p0[0] + dxS * t, sz = p0[1] + dzS * t;

      for (let i = 0; i < pontoons.length; i++) {
        const P = pontoons[i];
        const isEnd = (P.id === idA || P.id === idB);
        if (isPointInsideOuterHull(P, sx, sz, isEnd ? -0.45 : 1.2)) return false;
      }
      if (gardens) {
        for (let g = 0; g < gardens.length; g++) {
          const G = gardens[g];
          const isEnd = (G.id === idA || G.id === idB);
          if (isPointInsideOuterHull(G, sx, sz, isEnd ? -0.45 : 1.2)) return false;
        }
      }

      const dcx = sx - CX, dcz = sz - CZ;
      const rC = Math.hypot(dcx, dcz);
      const isSeaEnd = (idA === 'sea_ring_quay' || idB === 'sea_ring_quay');
      if (rC < mega.sumeru.plinthR + 1.5 || rC > (isSeaEnd ? 896.4 : 895.5)) return false;

      const B = mega.sumeru.bussabok;
      if (Math.abs(sx - B.cx) < B.w * 0.5 + 2.0 && Math.abs(sz - B.cz) < B.d * 0.5 + 2.0) return false;

      for (let d = 0; d < mega.dykes.length; d++) {
        const D = mega.dykes[d];
        const a = D.angDeg * Math.PI / 180;
        const along = dcx * Math.cos(a) + dcz * Math.sin(a);
        const perp = Math.abs(-dcx * Math.sin(a) + dcz * Math.cos(a));
        const isEnd = (('dyke_' + D.tag) === idA || ('dyke_' + D.tag) === idB);
        const allowEdge = isEnd ? (D.quayHalfW - 0.45) : (D.quayHalfW + 1.2);
        if (along > 95.0 && along < 1016.0 && perp < allowEdge) return false;
      }

      for (let k = 0; k < mega.zigguratPods.length; k++) {
        const Z = mega.zigguratPods[k];
        if (Math.hypot(sx - Z.x, sz - Z.z) < 29.0) return false;
      }
      for (let k = 0; k < mega.salaPavilions.length; k++) {
        const S = mega.salaPavilions[k];
        if (Math.hypot(sx - S.x, sz - S.z) < S.r - 0.6) return false;
      }
    }

    if (existingLinks) {
      for (let i = 0; i < existingLinks.length; i++) {
        const E = existingLinks[i];
        if (E.from === idA || E.from === idB || E.to === idA || E.to === idB) continue;
        if (segmentsCross2D(p0[0], p0[1], p1[0], p1[1], E.x0, E.z0, E.x1, E.z1)) return false;
      }
    }
    return true;
  }

  function generateBascules(pontoons, gardens, mega) {
    const links = [];
    const adj = {};
    const edgeSeen = new Set();
    const dykeMap = {};
    for (let d = 0; d < mega.dykes.length; d++) dykeMap[mega.dykes[d].tag] = mega.dykes[d];

    const fixedAnchors = [
      { id: 'sala_ne',  x:  245, z: -35,  rOut: 11.0 },
      { id: 'sala_se',  x:  248, z:  395, rOut: 11.0 },
      { id: 'sala_sw',  x: -238, z:  395, rOut: 11.0 },
      { id: 'sala_w',   x: -235, z: -45,  rOut: 11.0 },
      { id: 'dyke_nne', x:  195, z: -245, dyke: dykeMap.nne },
      { id: 'dyke_ese', x:  380, z:  334, dyke: dykeMap.ese },
      { id: 'dyke_ssw', x: -335, z:  406, dyke: dykeMap.ssw },
      { id: 'dyke_wnw', x: -335, z: -46,  dyke: dykeMap.wnw }
    ];
    for (let q = 0; q < mega.seaRing.quays.length; q++) {
      const Q = mega.seaRing.quays[q];
      const midRad = (0.5 * (Q.ang0 + Q.ang1)) * Math.PI / 180;
      fixedAnchors.push({
        id: 'sea_ring_quay',
        subKey: Q.id,
        x: +(FC_SITE.WEIR_CX + Q.rIn * Math.cos(midRad)).toFixed(1),
        z: +(FC_SITE.WEIR_CZ + Q.rIn * Math.sin(midRad)).toFixed(1),
        seaQuay: Q
      });
    }

    const allFloat = pontoons.concat(gardens || []);
    allFloat.forEach(function (p) { adj[p.id] = []; });
    fixedAnchors.forEach(function (a) { adj[a.id] = []; });

    function tryAddBridge(id, A, B, maxSpan) {
      const keyA = A.subKey || A.id, keyB = B.subKey || B.id;
      const ek = keyA < keyB ? (keyA + '|' + keyB) : (keyB + '|' + keyA);
      if (edgeSeen.has(ek)) return false;
      const pair = computeBridgeRimPair(A, B, mega);
      const p0 = pair[0], p1 = pair[1];
      if (!isBridgeSpanClean(p0, p1, A.id, B.id, pontoons, gardens, mega, links, maxSpan)) return false;
      const clearSpan = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
      edgeSeen.add(ek);
      links.push({
        id: id,
        from: A.id,
        to: B.id,
        x0: p0[0], z0: p0[1],
        x1: p1[0], z1: p1[1],
        clearSpan: +clearSpan.toFixed(2),
        spanM: +Math.max(36.0, clearSpan).toFixed(2),
        deckLen: +(clearSpan + 2.4).toFixed(2),
        maxPitchDeg: 12.0
      });
      adj[A.id].push(B.id);
      adj[B.id].push(A.id);
      return true;
    }

    /* 1. Connect each Boulevard-Dyke, Sea-Ring Quay & Sala-Nam anchor to nearby canal-frontage pontoons across clean open water */
    for (let a = 0; a < fixedAnchors.length; a++) {
      const FA = fixedAnchors[a];
      const maxLinks = FA.dyke ? 4 : (FA.seaQuay ? 1 : 2);
      const cands = [];
      for (let i = 0; i < pontoons.length; i++) {
        const P = pontoons[i];
        const pair = computeBridgeRimPair(FA, P, mega);
        const span = Math.hypot(pair[1][0] - pair[0][0], pair[1][1] - pair[0][1]);
        if (span <= 74.0) cands.push({ P: P, span: span });
      }
      cands.sort(function (u, v) { return u.span - v.span; });
      let added = 0;
      for (let k = 0; k < cands.length && added < maxLinks; k++) {
        if (tryAddBridge('basc_anchor_' + (FA.subKey || FA.id) + '_' + added, FA, cands[k].P, 74.0)) {
          added++;
        }
      }
    }

    /* 2. Connect neighboring major platforms across Venetian canals sorted by shortest open-water span (up to 3 per platform) */
    const degCount = {};
    links.forEach(function (l) {
      degCount[l.from] = (degCount[l.from] == null ? 0 : degCount[l.from]) + 1;
      degCount[l.to] = (degCount[l.to] == null ? 0 : degCount[l.to]) + 1;
    });
    const pPairs = [];
    for (let i = 0; i < pontoons.length; i++) {
      for (let j = i + 1; j < pontoons.length; j++) {
        const A = pontoons[i], B = pontoons[j];
        if (Math.hypot(B.x - A.x, B.z - A.z) > 235.0) continue;
        const pair = computeBridgeRimPair(A, B, mega);
        const span = Math.hypot(pair[1][0] - pair[0][0], pair[1][1] - pair[0][1]);
        if (span <= 74.0) pPairs.push({ A: A, B: B, span: span });
      }
    }
    pPairs.sort(function (u, v) { return u.span - v.span; });
    let bIdx = 0;
    for (let k = 0; k < pPairs.length; k++) {
      const A = pPairs[k].A, B = pPairs[k].B;
      if ((degCount[A.id] == null ? 0 : degCount[A.id]) >= 3 || (degCount[B.id] == null ? 0 : degCount[B.id]) >= 3) continue;
      if (tryAddBridge('basc_p_' + (bIdx + 1), A, B, 74.0)) {
        bIdx++;
        degCount[A.id] = (degCount[A.id] == null ? 0 : degCount[A.id]) + 1;
        degCount[B.id] = (degCount[B.id] == null ? 0 : degCount[B.id]) + 1;
      }
    }

    /* 3. Connect every Chinampa Garden Raft to its nearest clean-water pontoon, Sea-Ring quay, dyke quay, or neighboring raft */
    if (gardens && gardens.length) {
      const gardenTargets = pontoons.concat(fixedAnchors).concat(gardens);
      for (let g = 0; g < gardens.length; g++) {
        const G = gardens[g];
        const gCands = [];
        for (let i = 0; i < gardenTargets.length; i++) {
          const Tgt = gardenTargets[i];
          if (Tgt.id === G.id) continue;
          const pair = computeBridgeRimPair(Tgt, G, mega);
          const span = Math.hypot(pair[1][0] - pair[0][0], pair[1][1] - pair[0][1]);
          if (span <= 84.0) gCands.push({ T: Tgt, span: span });
        }
        gCands.sort(function (u, v) { return u.span - v.span; });
        for (let k = 0; k < gCands.length; k++) {
          if (tryAddBridge('basc_g_' + (g + 1), gCands[k].T, G, 84.0)) break;
        }
      }
    }

    /* 4. Guarantee 100% connected archipelago via shortest clean-water spanning bridges */
    function getReachable() {
      const seen = new Set(fixedAnchors.map(function (f) { return f.id; }));
      const q = Array.from(seen);
      while (q.length) {
        const u = q.shift();
        const nb = adj[u] || [];
        for (let i = 0; i < nb.length; i++) {
          if (!seen.has(nb[i])) { seen.add(nb[i]); q.push(nb[i]); }
        }
      }
      return seen;
    }

    let guard = 0;
    while (guard++ < 90) {
      const seen = getReachable();
      const un = allFloat.filter(function (p) { return !seen.has(p.id); });
      if (!un.length) break;
      const reachedList = allFloat.filter(function (p) { return seen.has(p.id); }).concat(fixedAnchors);
      const spanCands = [];
      for (let i = 0; i < un.length; i++) {
        for (let j = 0; j < reachedList.length; j++) {
          const pair = computeBridgeRimPair(reachedList[j], un[i], mega);
          const span = Math.hypot(pair[1][0] - pair[0][0], pair[1][1] - pair[0][1]);
          if (span <= 88.0) spanCands.push({ R: reachedList[j], U: un[i], span: span });
        }
      }
      spanCands.sort(function (a, b) { return a.span - b.span; });
      let linked = false;
      for (let k = 0; k < spanCands.length; k++) {
        if (tryAddBridge('basc_span_' + guard, spanCands[k].R, spanCands[k].U, 88.0)) {
          linked = true;
          break;
        }
      }
      if (!linked) break;
    }

    return links;
  }

  /* Verify that ALL 4 OBB CORNERS of a lot sit squarely on its intended solid structural support! */
  function isLotSupported(cand, mega, pontoonsById) {
    const corners = obbCorners(cand, -0.15);
    const CX = FC_SITE.WEIR_CX, CZ = FC_SITE.WEIR_CZ;

    if (cand.instance === 'pontoons') {
      const W = pontoonsById[cand.wardId];
      if (!W) return false;
      const ly = cand.localY == null ? 0 : cand.localY;
      for (let c = 0; c < 4; c++) {
        if (!isPointOnPlatform(W, corners[c][0], corners[c][1], 0.35, ly)) return false;
      }
      return true;
    }

    if (cand.instance === 'bluff') {
      for (let c = 0; c < 4; c++) {
        const gx = corners[c][0], gz = corners[c][1];
        const gy = FC_SITE.elevAt(gx, gz);
        if (gy < 65.0) return false;
        if (FC_BLUFF_PLAN.inReservoirBasin(gx, gz, 2.5)) return false;
      }
      return true;
    }

    /* Fixed masonry platforms: Harbour Moles (+7.8 m), Dyke Quays (+6.2 m) / Dyke Crowns (+22.0 m),
       Sea-Ring Quays (+6.2 m) / Weir Promenade (+18.0 m), Sumeru Plinth (+14/+22 m), Bussabok Island (+8.5 m) */
    for (let c = 0; c < 4; c++) {
      const x = corners[c][0], z = corners[c][1];
      let okCorner = false;

      /* 1. D5 Stone Harbour Moles (+7.8 m) */
      if (Math.abs(cand.y - 7.8) < 0.35 && FC_SITE.isOnMole(x, z, 1.5)) okCorner = true;

      /* 2. Sumeru Tier 1 (+14 m) & Tier 2 (+22 m) & Gopura Bastions & Bussabok Island (+8.5 m) */
      const dx = x - CX, dz = z - CZ, rC = Math.hypot(dx, dz);
      if (!okCorner && Math.abs(cand.y - 22.0) < 0.35 && rC <= mega.sumeru.upperCourtR * 0.94 && rC >= mega.sumeru.innerPodiumR + 1.0) okCorner = true;
      if (!okCorner && Math.abs(cand.y - 14.0) < 0.35 && rC <= mega.sumeru.midCourtR * 0.955 && rC >= mega.sumeru.upperCourtR + 1.0) okCorner = true;

      const B = mega.sumeru.bussabok;
      if (!okCorner && Math.abs(cand.y - B.plinthY) < 0.35 &&
          Math.abs(x - B.cx) <= B.w * 0.5 - 1.0 && Math.abs(z - B.cz) <= B.d * 0.5 - 1.0) {
        okCorner = true;
      }

      /* 3. Four Radial Boulevard-Dyke Masonry Quay Terraces (+6.2 m) & Upper Crowns (+22.0 m) */
      if (!okCorner) {
        for (let d = 0; d < mega.dykes.length; d++) {
          const D = mega.dykes[d], a = D.angDeg * Math.PI / 180;
          const ux = Math.cos(a), uz = Math.sin(a);
          const along = dx * ux + dz * uz;
          const perp = Math.abs(-dx * uz + dz * ux);
          if (Math.abs(cand.y - D.quayY) < 0.35 && along >= D.quayR0 + 1.0 && along <= D.quayR1 - 1.0 &&
              perp >= D.widthM * 0.5 + 0.8 && perp <= D.quayHalfW - 1.0) {
            okCorner = true; break;
          }
          if (Math.abs(cand.y - D.crownY) < 0.35 && along >= D.r0 + 24.0 && along <= D.r1 - 10.0 && perp <= D.widthM * 0.5 - 0.6) {
            okCorner = true; break;
          }
        }
      }

      /* 4. Eight Inner Sea-Ring Venetian Harbour-Quay Shelves (+6.2 m) & +18.0 m Sea-Ring Rampart Promenade */
      if (!okCorner) {
        const deg = normDeg(Math.atan2(dz, dx) * 180 / Math.PI);
        if (Math.abs(cand.y - 6.2) < 0.35 && rC >= 896.5 && rC <= 985.5) {
          for (let q = 0; q < mega.seaRing.quays.length; q++) {
            const Q = mega.seaRing.quays[q];
            if (inArcDeg(deg, Q.ang0 - 0.4, Q.ang1 + 0.4)) { okCorner = true; break; }
          }
        }
        if (Math.abs(cand.y - 18.0) < 0.35 && rC >= 982.5 && rC <= 1019.5) okCorner = true;
      }

      if (!okCorner) return false;
    }
    return true;
  }

  function buildPlans(opts) {
    opts = opts || {};
    const tags = opts.tags || null;
    const mega = FC_MEGA.plan();
    const arch = generateArchipelago(mega);
    const pontoons = arch.pontoons;
    const gardens = arch.gardens;
    const pontoonsById = {};
    pontoons.forEach(function (p) { pontoonsById[p.id] = p; });
    const bascules = generateBascules(pontoons, gardens, mega);
    const bluffWays = FC_BLUFF_PLAN.buildWays();

    /* Precompute bascule bridge landing clearance boxes so waterfront houses never block a bridge landing! */
    const bridgeClearBoxes = bascules.map(function (b) {
      const mx = (b.x0 + b.x1) * 0.5, mz = (b.z0 + b.z1) * 0.5;
      const yaw = Math.atan2(b.x1 - b.x0, b.z1 - b.z0);
      return { x: mx, z: mz, w: 6.8, d: (b.deckLen == null ? 20 : b.deckLen) + 5.0, ry: yaw };
    });

    const lots = [];
    const byDistrict = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0, D6: 0, D7: 0 };

    function tryPlace(spec) {
      const dim = FC_DIMS[spec.key];
      if (!dim) throw new Error('FC_CITY: unknown building key ' + spec.key);
      const cand = {
        id: spec.id,
        key: spec.key,
        kit: dim.kit,
        style: dim.style,
        district: spec.district,
        instance: spec.instance,
        wardId: spec.wardId || null,
        x: +spec.x.toFixed(2),
        y: +spec.y.toFixed(2),
        localY: spec.localY == null ? 0 : +spec.localY.toFixed(2),
        z: +spec.z.toFixed(2),
        ry: +(spec.ry == null ? 0 : spec.ry).toFixed(4),
        v: 0,
        w: dim.w,
        d: dim.d,
        h: dim.h,
        wealth: dim.wealth,
        res: dim.res,
        hh: dim.hh,
        pop: dim.pop,
        role: dim.role
      };
      if (!isLotSupported(cand, mega, pontoonsById)) {
        if (spec.required) throw new Error('FC_CITY: required lot ' + cand.id + ' is unsupported at (' + cand.x + ',' + cand.y + ',' + cand.z + ')');
        return null;
      }
      if (!spec.required && (cand.instance === 'pontoons' || (cand.instance === 'dykes' && Math.abs(cand.y - 6.2) < 1.0))) {
        for (let bi = 0; bi < bridgeClearBoxes.length; bi++) {
          if (obbOverlap(cand, bridgeClearBoxes[bi], 0.35)) return null;
        }
      }
      const pad = spec.pad == null ? 0.30 : spec.pad;
      for (let i = 0; i < lots.length; i++) {
        if (obbOverlap(cand, lots[i], pad)) {
          if (spec.required) throw new Error('FC_CITY: required lot ' + cand.id + ' overlaps ' + lots[i].id);
          return null;
        }
      }
      lots.push(cand);
      byDistrict[cand.district] = (byDistrict[cand.district] == null ? 0 : byDistrict[cand.district]) + 1;
      if (tags && tags.add) {
        const rec = tags.add({
          id: cand.id,
          class: 'building',
          kind: cand.key,
          name: cand.key.replace(/_/g, ' '),
          at: [cand.x, cand.y, cand.z],
          ry: cand.ry,
          size: [cand.w, cand.d, cand.h],
          tags: {
            culture: cand.kit === 'kulanewa' ? 'kulanewa' : 'ria',
            style: cand.style,
            wealth: cand.wealth,
            types: [cand.res ? 'dwelling-multi' : 'civic']
          }
        });
        cand.tag = rec.id;
      }
      return cand;
    }

    /* -----------------------------------------------------------------------
       1. MAINLAND CROWN HEADLAND 9-AVENUE METROPOLIS (D6 & D7, >= +65.0 m)
       ----------------------------------------------------------------------- */
    function nearCrossStreet(x, halfW) {
      for (let i = 0; i < FC_BLUFF_PLAN.CROSS_X.length; i++) {
        if (Math.abs(x - FC_BLUFF_PLAN.CROSS_X[i]) < 6.4 + halfW) return true;
      }
      return false;
    }
    function inCivicPlaza(x, dInland, halfW, halfD) {
      const hw = halfW == null ? 0 : halfW;
      const hd = halfD == null ? 0 : halfD;
      for (let i = 0; i < FC_BLUFF_PLAN.PLAZAS.length; i++) {
        const P = FC_BLUFF_PLAN.PLAZAS[i];
        if (x + hw + 1.2 > P.x0 && x - hw - 1.2 < P.x1 && dInland + hd + 1.2 > P.d0 && dInland - hd - 1.2 < P.d1) return true;
      }
      return false;
    }
    function nearHoistHead(x, z) {
      for (let i = 0; i < FC_SITE.CLIFF_HOISTS.length; i++) {
        const H = FC_SITE.CLIFF_HOISTS[i];
        if (Math.hypot(x - H.x1, z - H.z1) < 26.0) return true;
      }
      return false;
    }

    /* Civic Landmark Anchors fronting the 6 Grand Plazas */
    const civicSpecs = [
      { id: 'fc.bluff.as01_chancellery', key: 'ra_west_chakri_chancellery',  x:  238, dIn: 256 },
      { id: 'fc.bluff.suudme_bourse',    key: 'kl_suudme_amber_bourse',      x:  392, dIn: 256 },
      { id: 'fc.bluff.as01_scriptorium', key: 'ra_west_amber_scriptorium',   x:  242, dIn: 320 },
      { id: 'fc.bluff.strategion',       key: 'ra_west_strategion_keep',     x:   95, dIn: 196 },
      { id: 'fc.bluff.west_keep',        key: 'ra_west_strategion_keep',     x: -382, dIn: 256 },
      { id: 'fc.bluff.suudme_keep',      key: 'kl_suudme_strategion_keep',   x:  945, dIn: 256 },
      { id: 'fc.bluff.mondop_lib',       key: 'ra_west_mondop_library',      x:  242, dIn: 452 },
      { id: 'fc.bluff.suudme_thermae',   key: 'kl_suudme_sauna_thermae',     x:  392, dIn: 320 },
      { id: 'fc.bluff.suudme_shrine',    key: 'kl_suudme_uktena_bell_shrine',x:  945, dIn: 320 },
      { id: 'fc.bluff.cistern',          key: 'ra_west_aqueduct_cistern',    x: 1045, dIn: 256 },
      { id: 'fc.bluff.beacon_suudme',    key: 'kl_suudme_beacon_frustum',    x: -510, dIn: 196 },
      { id: 'fc.bluff.east_agora',       key: 'ra_east_stoa_agora',          x: 1165, dIn: 386 }
    ];
    for (let i = 0; i < civicSpecs.length; i++) {
      const C = civicSpecs[i];
      const z = FC_SITE.bluffShoreZ(C.x) - C.dIn;
      const sl = (FC_SITE.bluffShoreZ(C.x + 10) - FC_SITE.bluffShoreZ(C.x - 10)) / 20.0;
      const ry = Math.atan2(sl, 1.0);
      tryPlace({ id: C.id, key: C.key, district: 'D6', instance: 'bluff', x: C.x, y: FC_SITE.elevAt(C.x, z), z: z, ry: ry, required: true });
    }

    const bluffFrontPools = [
      [
        'kl_suudme_patrician_palazzo', 'ra_west_mandarin_court', 'kl_suudme_arcade_insula',
        'ra_west_insula_apartments', 'kl_suudme_covered_bazaar', 'ra_west_covered_bazaar',
        'kl_suudme_mandarin_court', 'ra_west_clan_compound', 'ra_west_lotus_pavilion',
        'ra_west_pyatthat_hall', 'kl_suudme_compass_atelier', 'ra_east_archon_residences',
        'ra_east_veranda_insula', 'ra_west_artisan_shophouse'
      ],
      [
        'ra_west_artisan_shophouse', 'kl_suudme_arcade_insula', 'ra_west_insula_apartments',
        'kl_suudme_quay_tenement', 'ra_west_courtyard_tenement', 'kl_suudme_sanjhya_villa',
        'ra_west_arcade_villa', 'kl_suudme_caravanserai', 'ra_west_caravanserai_inn',
        'ra_west_lotus_thermae', 'kl_suudme_silk_dyeworks', 'ra_west_silk_dyeworks',
        'ra_west_celadon_prang_terrace', 'ra_east_peristyle_villa', 'ra_east_lapidary_shophouse',
        'ra_east_stepped_tenement', 'ra_west_ishtar_barracks', 'ra_west_courier_mansio'
      ],
      [
        'kl_suudme_ziggurat_granary', 'ra_west_ziggurat_granary', 'kl_suudme_sanjhya_villa',
        'ra_west_arcade_villa', 'kl_suudme_trestle_cottage', 'ra_west_stilt_house',
        'kl_suudme_glaze_kilnworks', 'ra_west_bronze_smithy', 'ra_west_canal_cottage',
        'ra_east_terrace_house', 'ra_east_karst_cottage', 'ra_west_mudbrick_hut'
      ]
    ];

    let bluffSeq = 0;
    for (let a = 0; a < FC_BLUFF_PLAN.AVE_OFFSETS.length; a++) {
      const av = FC_BLUFF_PLAN.AVE_OFFSETS[a];
      const pool = a <= 2 ? bluffFrontPools[0] : (a <= 5 ? bluffFrontPools[1] : bluffFrontPools[2]);
      const sides = (a === 0) ? [1] : [-1, 1];
      for (let si = 0; si < sides.length; si++) {
        const sgn = sides[si];
        let x = -848.0;
        while (x <= 1648.0) {
          const key = pool[(bluffSeq++) % pool.length];
          const dim = FC_DIMS[key];
          const setback = av.widthM * 0.5 + dim.d * 0.5 + 1.8;
          const dIn = av.dInland + sgn * setback;
          const z = FC_SITE.bluffShoreZ(x) - dIn;

          if (!nearCrossStreet(x, dim.w * 0.5) && !inCivicPlaza(x, dIn, dim.w * 0.5, dim.d * 0.5) && !nearHoistHead(x, z) && !FC_BLUFF_PLAN.inReservoirBasin(x, z, 16.0)) {
            const sl = (FC_SITE.bluffShoreZ(x + 8) - FC_SITE.bluffShoreZ(x - 8)) / 16.0;
            const baseYaw = Math.atan2(sl, 1.0);
            const ry = sgn > 0 ? baseYaw : baseYaw + Math.PI;
            tryPlace({
              id: 'fc.bluff.st_' + a + '_' + (sgn > 0 ? 'N' : 'S') + '_' + bluffSeq,
              key: key,
              district: a >= 6 ? 'D7' : 'D6',
              instance: 'bluff',
              x: x,
              y: FC_SITE.elevAt(x, z),
              z: z,
              ry: ry,
              pad: 0.25
            });
          }
          x += dim.w + 2.2;
        }
      }
    }

    /* -----------------------------------------------------------------------
       2. FOUR RADIAL BOULEVARD-DYKES: MULTI-ROW QUAY BLOCKS (+6.2 m) & DOUBLE-ROW CROWNS (+22.0 m)
       ----------------------------------------------------------------------- */
    const dykeInnerPoolNE = [
      'kl_suudme_arcade_insula', 'kl_suudme_covered_bazaar', 'kl_suudme_caravanserai',
      'kl_suudme_paktong_braziery', 'kl_suudme_silk_dyeworks', 'kl_suudme_quay_tenement',
      'ra_west_insula_apartments', 'kl_suudme_compass_atelier', 'kl_suudme_sauna_thermae'
    ];
    const dykeOuterPoolNE = [
      'kl_suudme_tidal_wharf', 'kl_suudme_pontoon_factor', 'ra_west_artisan_shophouse',
      'kl_suudme_sanjhya_villa', 'kl_suudme_trestle_cottage', 'kl_suudme_glaze_kilnworks',
      'ra_east_lapidary_shophouse', 'ra_east_veranda_insula'
    ];
    const dykeInnerPoolWest = [
      'ra_west_insula_apartments', 'ra_west_covered_bazaar', 'ra_west_courtyard_tenement',
      'ra_west_caravanserai_inn', 'ra_west_lotus_thermae', 'ra_west_silk_dyeworks',
      'kl_suudme_arcade_insula', 'ra_west_ishtar_barracks', 'ra_west_ziggurat_granary'
    ];
    const dykeOuterPoolWest = [
      'ra_west_artisan_shophouse', 'ra_west_crane_wharf', 'ra_west_barge_commissary',
      'ra_west_glaze_kiln', 'ra_west_bronze_smithy', 'ra_west_arcade_villa',
      'ra_west_stilt_house', 'ra_west_canal_cottage', 'kl_suudme_glaze_kilnworks'
    ];
    const dykeCrownRowPool = [
      'ra_west_canal_cottage', 'ra_east_terrace_house', 'ra_east_karst_cottage',
      'ra_west_mudbrick_hut', 'ra_west_curtain_bastion', 'ra_west_bronze_smithy',
      'ra_west_ziggurat_granary', 'ra_east_stoa_agora', 'ra_west_insula_apartments'
    ];

    for (let d = 0; d < mega.dykes.length; d++) {
      const D = mega.dykes[d];
      const a = D.angDeg * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a), nx = -uz, nz = ux;
      const isEast = (D.tag === 'nne' || D.tag === 'ese');
      const inPool = isEast ? dykeInnerPoolNE : dykeInnerPoolWest;
      const outPool = isEast ? dykeOuterPoolNE : dykeOuterPoolWest;
      let dqSeq = 0;

      /* Lower +6.2 m Masonry Quays: DOUBLE ROWS on BOTH sides (4 full urban rows per dyke!) */
      for (let sgn = -1; sgn <= 1; sgn += 2) {
        const quayRows = [
          { latCenter: D.widthM * 0.5 + 12.8, pool: inPool, faceSign: sgn },
          { latCenter: D.quayHalfW - 12.5,    pool: outPool, faceSign: sgn }
        ];
        for (let rIdx = 0; rIdx < quayRows.length; rIdx++) {
          const qr = quayRows[rIdx];
          let rf = D.quayR0 + 16.0;
          while (rf <= D.quayR1 - 16.0) {
            let nearGate = false;
            for (let g = 0; g < D.gates.length; g++) {
              if (Math.abs(rf - D.gates[g]) < 22.0) { nearGate = true; break; }
            }
            const key = qr.pool[(dqSeq++) % qr.pool.length];
            const dim = FC_DIMS[key];
            if (!nearGate) {
              const px = FC_SITE.WEIR_CX + rf * ux + sgn * qr.latCenter * nx;
              const pz = FC_SITE.WEIR_CZ + rf * uz + sgn * qr.latCenter * nz;
              const ry = Math.atan2(qr.faceSign * nx, qr.faceSign * nz);
              tryPlace({
                id: 'fc.dyke.' + D.tag + '_' + (sgn > 0 ? 'R' : 'L') + rIdx + '_' + dqSeq,
                key: key,
                district: 'D3',
                instance: 'dykes',
                x: px, y: D.quayY, z: pz,
                ry: ry,
                pad: 0.25
              });
            }
            rf += dim.w + 2.0;
          }
        }
      }

      /* Upper +22.0 m Imperial Boulevard: Monumental Portal Gatehouses over the 4 Barge-Gates + Double-Row Boulevard Shops! */
      const crownGates = ['kl_suudme_ishtar_watergate', 'ra_west_bussabok_gate', 'ra_west_water_gate', 'ra_east_gopura_gate'];
      for (let g = 0; g < D.gates.length; g++) {
        const rg = D.gates[g];
        tryPlace({
          id: 'fc.dyke.' + D.tag + '_gate_' + g,
          key: crownGates[(d + g) % crownGates.length],
          district: 'D3',
          instance: 'dykes',
          x: FC_SITE.WEIR_CX + rg * ux,
          y: D.crownY,
          z: FC_SITE.WEIR_CZ + rg * uz,
          ry: Math.atan2(ux, uz)
        });
      }

      for (let sgn = -1; sgn <= 1; sgn += 2) {
        let rc = D.r0 + 82.0;
        while (rc <= D.r1 - 36.0) {
          let nearGate = false;
          for (let g = 0; g < D.gates.length; g++) {
            if (Math.abs(rc - D.gates[g]) < 24.0) { nearGate = true; break; }
          }
          const key = dykeCrownRowPool[(dqSeq++) % dykeCrownRowPool.length];
          const dim = FC_DIMS[key];
          if (!nearGate && dim.d <= 18.0) {
            const lat = D.widthM * 0.5 - dim.d * 0.5 - 1.2;
            const px = FC_SITE.WEIR_CX + rc * ux + sgn * lat * nx;
            const pz = FC_SITE.WEIR_CZ + rc * uz + sgn * lat * nz;
            /* Face inward onto the central +22 m ceremonial boulevard carriageway! */
            const ry = Math.atan2(-sgn * nx, -sgn * nz);
            tryPlace({
              id: 'fc.dyke.' + D.tag + '_up_' + (sgn > 0 ? 'R' : 'L') + '_' + dqSeq,
              key: key,
              district: 'D3',
              instance: 'dykes',
              x: px, y: D.crownY, z: pz,
              ry: ry,
              pad: 0.25
            });
          }
          rc += dim.w + 2.2;
        }
      }
    }

    /* -----------------------------------------------------------------------
       3. EIGHT INNER SEA-RING VENETIAN HARBOUR QUAYS (TRIPLE-ROW, +6.2 m) & +18.0 m RAMPART TOWN
       ----------------------------------------------------------------------- */
    const ringBackSuudme = [
      'kl_suudme_arcade_insula', 'kl_suudme_caravanserai', 'kl_suudme_ziggurat_granary',
      'kl_suudme_paktong_braziery', 'kl_suudme_sauna_thermae', 'kl_suudme_amber_bourse',
      'kl_suudme_uktena_bell_shrine', 'kl_suudme_patrician_palazzo'
    ];
    const ringMidSuudme = [
      'kl_suudme_quay_tenement', 'kl_suudme_covered_bazaar', 'kl_suudme_silk_dyeworks',
      'kl_suudme_glaze_kilnworks', 'kl_suudme_compass_atelier', 'kl_suudme_sanjhya_villa',
      'ra_west_artisan_shophouse'
    ];
    const ringFrontSuudme = [
      'kl_suudme_tidal_wharf', 'kl_suudme_pontoon_factor', 'kl_suudme_trestle_cottage',
      'kl_suudme_sanjhya_villa', 'ra_west_artisan_shophouse', 'ra_west_canal_cottage'
    ];

    const ringBackRia = [
      'ra_west_barge_commissary', 'ra_west_insula_apartments', 'ra_west_caravanserai_inn',
      'ra_west_weigh_station', 'ra_west_boom_arsenal', 'ra_east_archon_residences',
      'ra_east_veranda_insula', 'ra_east_saffron_viharn'
    ];
    const ringMidRia = [
      'ra_west_courtyard_tenement', 'ra_west_covered_bazaar', 'ra_west_lotus_thermae',
      'ra_west_silk_dyeworks', 'ra_west_glaze_kiln', 'ra_east_stoa_agora',
      'ra_east_stepped_tenement', 'ra_east_peristyle_villa'
    ];
    const ringFrontRia = [
      'ra_west_crane_wharf', 'ra_west_artisan_shophouse', 'ra_west_stilt_house',
      'ra_west_canal_cottage', 'ra_east_skiff_boathouse', 'ra_east_lapidary_shophouse',
      'ra_east_terrace_house'
    ];

    let rqSeq = 0;
    for (let q = 0; q < mega.seaRing.quays.length; q++) {
      const Q = mega.seaRing.quays[q];
      const isSu = Q.style === 'suudme';
      let spanDeg = Q.ang1 - Q.ang0;
      if (spanDeg < 0) spanDeg += 360;
      const ringRows = [
        { r: 973.0, p: isSu ? ringBackSuudme  : ringBackRia  },
        { r: 941.5, p: isSu ? ringMidSuudme   : ringMidRia   },
        { r: 909.5, p: isSu ? ringFrontSuudme : ringFrontRia }
      ];
      for (let rr = 0; rr < ringRows.length; rr++) {
        const rowSpec = ringRows[rr];
        let da = 1.2;
        while (da <= spanDeg - 1.2) {
          const key = rowSpec.p[(rqSeq++) % rowSpec.p.length];
          const dim = FC_DIMS[key];
          const deg = Q.ang0 + da;
          const a = deg * Math.PI / 180;
          const rx = FC_SITE.WEIR_CX + rowSpec.r * Math.cos(a);
          const rz = FC_SITE.WEIR_CZ + rowSpec.r * Math.sin(a);
          const ry = Math.atan2(-Math.cos(a), -Math.sin(a));
          tryPlace({
            id: 'fc.ringquay.' + Q.id + '_' + rr + '_' + rqSeq,
            key: key,
            district: 'D4',
            instance: 'dykes',
            x: rx, y: Q.deckY, z: rz,
            ry: ry,
            pad: 0.25
          });
          const stepDeg = ((dim.w + 2.0) / rowSpec.r) * (180 / Math.PI);
          da += Math.max(1.1, stepDeg);
        }
      }
    }

    /* +18.0 m Sea-Ring Upper Rampart Town (Dense perimeter row of rampart bastions, shophouses, keeps, beacons & stoas!) */
    const rampartPool = [
      'ra_west_curtain_bastion', 'kl_suudme_arcade_insula', 'ra_west_insula_apartments',
      'kl_suudme_beacon_frustum', 'ra_east_stoa_agora', 'ra_west_spiral_beacon',
      'kl_suudme_ishtar_watergate', 'ra_west_bussabok_gate', 'ra_west_water_gate',
      'ra_west_strategion_keep', 'kl_suudme_strategion_keep', 'ra_west_ishtar_barracks',
      'ra_east_veranda_insula', 'ra_east_terrace_house', 'kl_suudme_quay_tenement'
    ];
    const lockDegs = mega.seaRing.locks.map(function (L) { return normDeg(L.angDeg); });
    const dykeDegs = mega.dykes.map(function (D) { return normDeg(D.angDeg); });
    let wDeg = 0.0, wtSeq = 0;
    while (wDeg < 358.5) {
      let skipArc = inArcDeg(wDeg, mega.seaRing.scarArcDeg[0] - 2.0, mega.seaRing.scarArcDeg[1] + 2.0);
      for (let li = 0; li < lockDegs.length; li++) {
        let df = Math.abs(normDeg(wDeg) - lockDegs[li]);
        if (df > 180) df = 360 - df;
        if (df < 4.5) skipArc = true;
      }
      for (let di = 0; di < dykeDegs.length; di++) {
        let df = Math.abs(normDeg(wDeg) - dykeDegs[di]);
        if (df > 180) df = 360 - df;
        if (df < 3.2) skipArc = true;
      }
      const key = rampartPool[(wtSeq++) % rampartPool.length];
      const dim = FC_DIMS[key];
      if (!skipArc && dim.d <= 22.0) {
        const a = wDeg * Math.PI / 180;
        const rPlace = 996.5;
        const wx = FC_SITE.WEIR_CX + rPlace * Math.cos(a);
        const wz = FC_SITE.WEIR_CZ + rPlace * Math.sin(a);
        tryPlace({
          id: 'fc.weirtop.' + wtSeq,
          key: key,
          district: 'D4',
          instance: 'dykes',
          x: wx, y: 18.0, z: wz,
          ry: Math.atan2(-Math.cos(a), -Math.sin(a)),
          pad: 0.25
        });
      }
      wDeg += Math.max(1.5, ((dim.w + 2.4) / 996.5) * (180 / Math.PI));
    }

    /* -----------------------------------------------------------------------
       4. D5 EXPANDED STONE HARBOUR MOLES (+7.8 m, 100% Non-Residential Maritime & Guild Works!)
       ----------------------------------------------------------------------- */
    const molePool = [
      'kl_suudme_tidal_wharf', 'ra_west_crane_wharf', 'ra_west_barge_commissary',
      'kl_suudme_covered_bazaar', 'ra_west_covered_bazaar', 'ra_west_weigh_station',
      'ra_west_boom_arsenal', 'kl_suudme_paktong_braziery', 'kl_suudme_ziggurat_granary',
      'ra_west_ziggurat_granary', 'kl_suudme_glaze_kilnworks', 'ra_west_glaze_kiln',
      'ra_west_caravanserai_inn', 'kl_suudme_caravanserai', 'kl_suudme_ishtar_watergate',
      'kl_suudme_beacon_frustum', 'ra_east_skiff_boathouse'
    ];
    let moleSeq = 0;
    for (let mi = 0; mi < FC_SITE.HARBOUR_MOLES.length; mi++) {
      const M = FC_SITE.HARBOUR_MOLES[mi];
      const zRows = [M.zSouth - 20.0, M.zSouth - 78.0, M.zSouth - 138.0];
      for (let zr = 0; zr < zRows.length; zr++) {
        const z = zRows[zr];
        let x = M.x0 + 26.0;
        while (x <= M.x1 - 26.0) {
          /* Leave funicular lower terminals, Chime-Well & NNE Viaduct touchdown clear! */
          let blocked = Math.hypot(x - FC_SITE.CHIME_WELL.x, z - FC_SITE.CHIME_WELL.z) < 28.0;
          if (mi === 0 && x > 470 && z > M.zSouth - 55.0) blocked = true;
          for (let hi = 0; hi < FC_SITE.CLIFF_HOISTS.length; hi++) {
            const H = FC_SITE.CLIFF_HOISTS[hi];
            if (Math.abs(x - H.x0) < 22.0 && Math.abs(z - H.z0) < 34.0) blocked = true;
          }
          const key = molePool[(moleSeq++) % molePool.length];
          const dim = FC_DIMS[key];
          if (!blocked && !dim.res) {
            tryPlace({
              id: 'fc.d5.m' + mi + '_' + zr + '_' + moleSeq,
              key: key,
              district: 'D5',
              instance: 'dykes',
              x: x, y: M.deckY, z: z,
              ry: zr === 0 ? 0.0 : Math.PI,
              pad: 0.30
            });
          }
          x += dim.w + 3.2;
        }
      }
    }

    /* -----------------------------------------------------------------------
       5. 32..38 LARGE NEIGHBORHOOD FLOATING PLATFORMS (25..42+ Closely-Packed Buildings Each!)
       ----------------------------------------------------------------------- */
    const compactSuudme = [
      'kl_suudme_trestle_cottage', 'ra_west_canal_cottage', 'kl_suudme_sanjhya_villa',
      'ra_west_artisan_shophouse', 'ra_west_mudbrick_hut', 'ra_west_stilt_house',
      'kl_suudme_quay_tenement', 'kl_suudme_compass_atelier', 'ra_west_bronze_smithy',
      'ra_west_glaze_kiln', 'ra_west_silk_dyeworks', 'kl_suudme_pontoon_factor'
    ];
    const compactRia = [
      'ra_west_canal_cottage', 'ra_west_mudbrick_hut', 'ra_west_artisan_shophouse',
      'ra_west_stilt_house', 'ra_west_bronze_smithy', 'ra_west_glaze_kiln',
      'ra_west_ziggurat_granary', 'ra_west_silk_dyeworks', 'ra_west_arcade_villa',
      'ra_west_courtyard_tenement', 'ra_west_amber_scriptorium'
    ];
    const compactUpper = [
      'ra_east_karst_cottage', 'ra_east_terrace_house', 'ra_east_lapidary_shophouse',
      'ra_west_canal_cottage', 'ra_east_stone_atelier', 'ra_east_skiff_boathouse',
      'ra_east_stepped_tenement', 'ra_east_peristyle_villa', 'ra_east_stoa_agora'
    ];
    const centerAnchors = {
      suudme: ['kl_suudme_covered_bazaar', 'kl_suudme_uktena_bell_shrine', 'kl_suudme_amber_bourse', 'kl_suudme_sauna_thermae'],
      ria:    ['ra_west_covered_bazaar', 'ra_west_celadon_prang_terrace', 'ra_west_lotus_thermae', 'ra_west_pyatthat_hall'],
      upper:  ['ra_east_saffron_viharn', 'ra_east_stoa_agora', 'ra_east_archon_residences'],
      free:   ['kl_suudme_covered_bazaar', 'ra_west_covered_bazaar', 'kl_suudme_caravanserai']
    };

    const initLagoonY = FC_TIDE.tideY('lagoon', 0);
    for (let p = 0; p < pontoons.length; p++) {
      const W = pontoons[p];
      const pose = KCITY.floatPose(W, initLagoonY);
      const pool = W.kind === 'suudme' ? compactSuudme
                 : W.kind === 'upper'  ? compactUpper
                 : W.kind === 'free'   ? compactSuudme
                 : compactRia;
      const cAnch = centerAnchors[W.kind] || centerAnchors.ria;
      let pSeq = p * 5;

      function tryLocalOnWard(lx, lz, lry, locY, customPool) {
        const useP = customPool || pool;
        const wpt = localToWorld(W.x, W.z, W.yaw, lx, lz);
        const ly = locY == null ? 0.0 : locY;
        for (let t = 0; t < useP.length; t++) {
          const key = useP[(pSeq + t) % useP.length];
          const ok = tryPlace({
            id: 'fc.pontoon.' + W.id + '_' + (pSeq++) + '_' + t,
            key: key,
            district: 'D2',
            instance: 'pontoons',
            wardId: W.id,
            x: wpt[0],
            y: pose.deckY + ly,
            localY: ly,
            z: wpt[1],
            ry: W.yaw + lry,
            pad: 0.22
          });
          if (ok) return ok;
        }
        return null;
      }

      const tinyLanePool = W.kind === 'upper'
        ? ['ra_east_karst_cottage', 'ra_east_terrace_house', 'ra_west_canal_cottage', 'ra_west_mudbrick_hut']
        : ['ra_west_canal_cottage', 'ra_west_mudbrick_hut', 'kl_suudme_trestle_cottage', 'ra_east_terrace_house', 'ra_west_stilt_house'];

      if (W.shape === 'oct-moon' || W.shape === 'hex-moon') {
        const ringSpecs = W.shape === 'oct-moon'
          ? [
              { r: W.rOut * 0.76, n: 18, faceOut: true,  p: null },
              { r: W.rOut * 0.50, n: 12, faceOut: false, p: tinyLanePool },
              { r: W.rMoon + 8.6, n: 6,  faceOut: false, p: tinyLanePool }
            ]
          : [
              { r: W.rOut * 0.71, n: 16, faceOut: true,  p: null },
              { r: W.rOut * 0.46, n: 10, faceOut: false, p: tinyLanePool },
              { r: W.rMoon + 8.4, n: 5,  faceOut: false, p: tinyLanePool }
            ];
        for (let rs = 0; rs < ringSpecs.length; rs++) {
          const R = ringSpecs[rs];
          for (let k = 0; k < R.n; k++) {
            const a = (k / R.n) * Math.PI * 2 + rs * 0.24;
            const lx = R.r * Math.sin(a), lz = R.r * Math.cos(a);
            const lry = R.faceOut ? a : (a + Math.PI);
            tryLocalOnWard(lx, lz, lry, 0.0, R.p);
          }
        }
      } else if (W.shape === 'stepped-bazaar') {
        /* Upper +2.4 m Bazaar Terrace centerpiece + flanking stalls */
        tryLocalOnWard(0.0, 0.0, 0.0, 2.4, cAnch);
        const upX = [-W.stepW * 0.31, W.stepW * 0.31];
        const upZ = [-W.stepD * 0.29, W.stepD * 0.29];
        for (let ix = 0; ix < upX.length; ix++) {
          for (let iz = 0; iz < upZ.length; iz++) {
            tryLocalOnWard(upX[ix], upZ[iz], iz === 0 ? Math.PI : 0.0, 2.4, tinyLanePool);
          }
        }
        /* Lower 0.0 m Perimeter Canal Frontage & Side Lanes */
        const zOuter = [-(W.d * 0.5 - 10.2), (W.d * 0.5 - 10.2)];
        for (let zi = 0; zi < zOuter.length; zi++) {
          const lz = zOuter[zi];
          for (let lx = -(W.w * 0.5 - 10.2); lx <= (W.w * 0.5 - 10.2); lx += 15.0) {
            tryLocalOnWard(lx, lz, lz > 0 ? 0.0 : Math.PI, 0.0, null);
          }
        }
        const xOuter = [-(W.w * 0.5 - 10.5), -(W.w * 0.5 - 26.5), (W.w * 0.5 - 26.5), (W.w * 0.5 - 10.5)];
        for (let xi = 0; xi < xOuter.length; xi++) {
          const lx = xOuter[xi];
          for (let lz = -(W.d * 0.5 - 26.0); lz <= (W.d * 0.5 - 26.0); lz += 14.8) {
            tryLocalOnWard(lx, lz, lx > 0 ? Math.PI * 0.5 : -Math.PI * 0.5, 0.0, tinyLanePool);
          }
        }
      } else if (W.shape === 'u-harbour') {
        /* Head bazaar row + back canal row */
        const headZ = [-(W.d * 0.5 - 10.2), -(W.d * 0.5 - 27.5)];
        for (let zi = 0; zi < headZ.length; zi++) {
          const lz = headZ[zi];
          for (let lx = -(W.w * 0.5 - 10.2); lx <= (W.w * 0.5 - 10.2); lx += 15.0) {
            if (Math.abs(lx) < 4.0 && zi === 1) {
              tryLocalOnWard(0.0, lz, 0.0, 0.0, cAnch);
            } else {
              tryLocalOnWard(lx, lz, zi === 0 ? Math.PI : 0.0, 0.0, zi === 1 ? tinyLanePool : null);
            }
          }
        }
        /* Left & Right Sheltered Harbour-Arm Wings */
        const armX = [
          -(W.w * 0.5 - 10.2), -(W.notchW * 0.5 + 9.2),
           (W.notchW * 0.5 + 9.2), (W.w * 0.5 - 10.2)
        ];
        for (let xi = 0; xi < armX.length; xi++) {
          const lx = armX[xi];
          const faceCourt = (xi === 1) ? Math.PI * 0.5 : (xi === 2 ? -Math.PI * 0.5 : (lx < 0 ? -Math.PI * 0.5 : Math.PI * 0.5));
          for (let lz = -2.0; lz <= W.d * 0.5 - 10.2; lz += 15.0) {
            tryLocalOnWard(lx, lz, faceCourt, 0.0, (xi === 1 || xi === 2) ? tinyLanePool : null);
          }
        }
      } else {
        /* 'rect-canal': 4 dense canal/lane rows around central moon-court + end-quay cottages */
        const rowsZ = [-(W.d * 0.5 - 10.2), -15.5, 15.5, (W.d * 0.5 - 10.2)];
        for (let ri = 0; ri < rowsZ.length; ri++) {
          const lz = rowsZ[ri];
          const lry = (ri === 0 || ri === 2) ? Math.PI : 0.0;
          const isInner = (ri === 1 || ri === 2);
          for (let lx = -(W.w * 0.5 - 10.2); lx <= (W.w * 0.5 - 10.2); lx += 15.0) {
            if (Math.abs(Math.abs(lx) - 28.0) < 4.2) continue;
            if (isInner && Math.abs(lx) < W.moonW * 0.5 + 8.5) continue;
            tryLocalOnWard(lx, lz, lry, 0.0, isInner ? tinyLanePool : null);
          }
        }
        tryLocalOnWard(-(W.moonW * 0.5 + 13.5), 0.0, Math.PI * 0.5, 0.0, cAnch);
        tryLocalOnWard( (W.moonW * 0.5 + 13.5), 0.0, -Math.PI * 0.5, 0.0, tinyLanePool);
      }
    }

    /* -----------------------------------------------------------------------
       6. CENTRAL SUMERU MINISTERIAL & SACRED TERRACES + BUSSABOK ROYAL ISLAND (D1)
       ----------------------------------------------------------------------- */
    /* Landmark Royal Palaces */
    tryPlace({
      id: 'fc.d1.prasat_palace',
      key: 'ra_west_prasat_palace',
      district: 'D1',
      instance: 'dykes',
      x: 0, y: 22.0, z: FC_SITE.WEIR_CZ + 96.0, ry: 0, required: true
    });
    tryPlace({
      id: 'fc.d1.hongsa_prasat',
      key: 'ra_east_swan_prasat',
      district: 'D1',
      instance: 'dykes',
      x: 0, y: 8.5, z: mega.sumeru.bussabok.cz + 18.0, ry: Math.PI, required: true
    });
    tryPlace({
      id: 'fc.d1.bussabok_west_pav',
      key: 'ra_west_lotus_pavilion',
      district: 'D1',
      instance: 'dykes',
      x: -54, y: 8.5, z: mega.sumeru.bussabok.cz + 18.0, ry: Math.PI
    });
    tryPlace({
      id: 'fc.d1.bussabok_east_pav',
      key: 'ra_east_saffron_viharn',
      district: 'D1',
      instance: 'dykes',
      x: 54, y: 8.5, z: mega.sumeru.bussabok.cz + 18.0, ry: Math.PI
    });

    /* Tier 1 (+14.0 m, r = 156 m) Imperial Ministries, Libraries, Scriptoria & Mandarin Courts */
    const sumeruMinPool = [
      'ra_west_amber_scriptorium', 'ra_west_mondop_library', 'ra_west_pyatthat_hall',
      'ra_west_mandarin_court', 'ra_east_stoa_agora', 'ra_east_archon_residences',
      'kl_suudme_compass_atelier', 'ra_west_celadon_prang_terrace'
    ];
    for (let m = 0; m < 16; m++) {
      const deg = m * 22.5 + 11.25;
      /* Skip Gopura Bastion corridors */
      let hitBast = false;
      for (let b = 0; b < mega.sumeru.bastions.length; b++) {
        let df = Math.abs(normDeg(deg) - normDeg(mega.sumeru.bastions[b].angDeg));
        if (df > 180) df = 360 - df;
        if (df < 12.5) hitBast = true;
      }
      if (hitBast) continue;
      const a = deg * Math.PI / 180;
      const mx = FC_SITE.WEIR_CX + 156.5 * Math.cos(a);
      const mz = FC_SITE.WEIR_CZ + 156.5 * Math.sin(a);
      tryPlace({
        id: 'fc.d1.ministry_' + m,
        key: sumeruMinPool[m % sumeruMinPool.length],
        district: 'D1',
        instance: 'dykes',
        x: mx, y: 14.0, z: mz,
        ry: Math.atan2(Math.cos(a), Math.sin(a)),
        pad: 0.30
      });
    }

    /* Register Floating Chinampa Garden Rafts & Upland Terraced Farms in KTAGS when provided */
    if (tags && tags.add) {
      for (let g = 0; g < gardens.length; g++) {
        const G = gardens[g];
        tags.add({
          id: 'fc.garden.' + G.id,
          class: 'feature',
          kind: 'floating_garden',
          key: 'fc.garden.chinampa',
          name: 'Floating Chinampa Garden Raft ' + G.id + ' (' + G.theme + ')',
          at: [G.x, initLagoonY + G.freeboardM, G.z],
          ry: G.yaw,
          size: [G.w, G.d, G.freeboardM + G.draftM],
          tags: {
            culture: G.culture,
            types: ['farm', 'park'],
            job: 'farming',
            role: 'landuse:farm',
            zone: 'garden',
            style: 'chinampa',
            harvest: G.harvest
          }
        });
      }
      for (let uf = 0; uf < FC_BLUFF_PLAN.UPLAND_FARMS.length; uf++) {
        const UF = FC_BLUFF_PLAN.UPLAND_FARMS[uf];
        const uz = FC_SITE.bluffShoreZ(UF.x) - UF.dInland;
        tags.add({
          id: UF.id,
          class: 'feature',
          kind: 'terraced_farm',
          key: 'fc.bluff.terraced_farm',
          name: 'Crown Headland Terraced ' + UF.crop + ' Estate ' + (uf + 1),
          at: [UF.x, FC_SITE.elevAt(UF.x, uz), uz],
          ry: 0,
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

    /* Continuous Pedestrian, Bascule, Cliff-Funicular & Submarine Lift Walk Graph */
    const walkNodes = [
      'bluff_as01', 'd5_ghat', 'dyke_nne', 'dyke_ese', 'dyke_ssw', 'dyke_wnw', 'sea_ring_quay',
      'sumeru_plinth', 'dynamo_minus90', 'sala_ne', 'sala_se', 'sala_sw', 'sala_w'
    ];
    pontoons.forEach(function (w) { walkNodes.push(w.id); });
    gardens.forEach(function (g) { walkNodes.push(g.id); });
    const walkEdges = [
      ['bluff_as01', 'd5_ghat'],
      ['d5_ghat', 'dyke_nne'],
      ['dyke_nne', 'sumeru_plinth'],
      ['dyke_ese', 'sumeru_plinth'],
      ['dyke_ssw', 'sumeru_plinth'],
      ['dyke_wnw', 'sumeru_plinth'],
      ['sea_ring_quay', 'dyke_nne'],
      ['sea_ring_quay', 'dyke_ese'],
      ['sea_ring_quay', 'dyke_ssw'],
      ['sea_ring_quay', 'dyke_wnw'],
      ['sumeru_plinth', 'dynamo_minus90'],
      ['sumeru_plinth', 'sala_ne'],
      ['sumeru_plinth', 'sala_se'],
      ['sumeru_plinth', 'sala_sw'],
      ['sumeru_plinth', 'sala_w']
    ];
    bascules.forEach(function (b) { walkEdges.push([b.from, b.to]); });

    const cableChains = bascules.slice(0, 44).map(function (b) {
      return { from: b.from, to: b.to, x0: b.x0, z0: b.z0, x1: b.x1, z1: b.z1 };
    });

    return {
      lots: lots,
      byDistrict: byDistrict,
      pontoons: pontoons,
      gardens: gardens,
      uplandFarms: FC_BLUFF_PLAN.UPLAND_FARMS,
      bascules: bascules,
      cables: cableChains,
      bluffWays: bluffWays,
      walkGraph: { nodes: walkNodes, edges: walkEdges }
    };
  }

  function auditBascules(planOut, customLinks) {
    const mega = FC_MEGA.plan();
    const links = customLinks || planOut.bascules || [];
    const pontoons = planOut.pontoons || [];
    const gardens = planOut.gardens || [];
    const lots = planOut.lots || [];
    let badSpan = 0, clippedHull = 0, crossedBridges = 0, hitLot = 0, maxDeckLen = 0, minDeckLen = Infinity;

    for (let i = 0; i < links.length; i++) {
      const b = links[i];
      const p0 = [b.x0, b.z0], p1 = [b.x1, b.z1];
      const dLen = b.deckLen == null ? Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) : b.deckLen;
      if (dLen > maxDeckLen) maxDeckLen = dLen;
      if (dLen < minDeckLen) minDeckLen = dLen;
      if (dLen < 9.5 || dLen > 92.0) badSpan++;

      if (!isBridgeSpanClean(p0, p1, b.from, b.to, pontoons, gardens, mega, null, 90.0)) {
        clippedHull++;
      }
      for (let j = i + 1; j < links.length; j++) {
        const e = links[j];
        if (e.from === b.from || e.from === b.to || e.to === b.from || e.to === b.to) continue;
        if (segmentsCross2D(b.x0, b.z0, b.x1, b.z1, e.x0, e.z0, e.x1, e.z1)) crossedBridges++;
      }
      const mx = (b.x0 + b.x1) * 0.5, mz = (b.z0 + b.z1) * 0.5;
      const yaw = Math.atan2(b.x1 - b.x0, b.z1 - b.z0);
      const bBox = { x: mx, z: mz, w: 5.8, d: dLen, ry: yaw };
      for (let k = 0; k < lots.length; k++) {
        const L = lots[k];
        if (L.instance !== 'pontoons' && !(L.instance === 'dykes' && Math.abs(L.y - 6.2) < 1.0)) continue;
        if (obbOverlap(L, bBox, 0.05)) { hitLot++; break; }
      }
    }

    return {
      ok: links.length > 0 && badSpan === 0 && clippedHull === 0 && crossedBridges === 0 && hitLot === 0,
      count: links.length,
      badSpan: badSpan,
      clippedHull: clippedHull,
      crossedBridges: crossedBridges,
      hitLot: hitLot,
      minDeckLen: links.length ? +minDeckLen.toFixed(2) : 0,
      maxDeckLen: +maxDeckLen.toFixed(2)
    };
  }

  function auditSlabsAndWays(planOut, opts) {
    opts = opts || {};
    const pontoons = planOut.pontoons || [];
    const gardens = planOut.gardens || [];
    const ways = planOut.bluffWays || [];
    let slabOverlaps = 0, lowLaneSteps = 0, wayOverlaps = 0;

    function rectOverlap2D(a, b) {
      return (Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > 1e-4) &&
             (Math.min(a.z1, b.z1) - Math.max(a.z0, b.z0) > 1e-4);
    }
    function box2D(cx, cz, w, d) {
      return { x0: cx - w * 0.5, x1: cx + w * 0.5, z0: cz - d * 0.5, z1: cz + d * 0.5 };
    }
    function countPairOverlaps(arr) {
      let c = 0;
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (rectOverlap2D(arr[i], arr[j])) c++;
        }
      }
      return c;
    }

    for (let p = 0; p < pontoons.length; p++) {
      const W = pontoons[p];
      const deckBoxes = [], curbBoxes = [], laneBoxes = [];
      let deckTopY = 0.00, laneTopY = 0.22;

      if (W.shape === 'rect-canal') {
        const hw = W.w * 0.5, hd = W.d * 0.5;
        const mhw = W.moonW * 0.5, mhd = W.moonD * 0.5;
        const sideW = hw - mhw, fbD = hd - mhd;
        const dSideW = sideW + 0.6, dFbD = fbD + 0.6;
        const ewLaneZ = 26.5, ewLaneD = 4.2;
        const zInEnd = ewLaneZ - ewLaneD * 0.5;
        const zOutStart = ewLaneZ + ewLaneD * 0.5;
        const zOuterLim = hd - 3.0;

        if (opts.injectOverlap && p === 0) {
          deckBoxes.push(box2D(-(mhw + sideW * 0.5), 0, sideW + 1.0, W.d + 1.2));
          deckBoxes.push(box2D(0, -(mhd + fbD * 0.5), W.moonW + 0.6, fbD + 1.2));
          laneBoxes.push(box2D(0, ewLaneZ, W.w - 8.0, ewLaneD));
          laneBoxes.push(box2D(28.0, 0, 3.8, W.d - 6.0));
          laneTopY = 0.11;
        } else {
          for (let sgn = -1; sgn <= 1; sgn += 2) {
            deckBoxes.push(box2D(sgn * (mhw + dSideW * 0.5), 0, dSideW, W.d + 1.2));
            deckBoxes.push(box2D(0, sgn * (mhd + dFbD * 0.5), W.moonW, dFbD));
            curbBoxes.push(box2D(0, sgn * (mhd + 0.7), W.moonW + 2.8, 1.4));
            curbBoxes.push(box2D(sgn * (mhw + 0.7), 0, 1.4, W.moonD));
            laneBoxes.push(box2D(0, sgn * ewLaneZ, W.w - 8.0, ewLaneD));
            laneBoxes.push(box2D(sgn * 28.0, 0, 3.8, zInEnd * 2.0));
            if (zOuterLim - zOutStart > 1.0) {
              const segLen = zOuterLim - zOutStart;
              const segMid = zOutStart + segLen * 0.5;
              laneBoxes.push(box2D(sgn * 28.0, -segMid, 3.8, segLen));
              laneBoxes.push(box2D(sgn * 28.0,  segMid, 3.8, segLen));
            }
          }
        }
      } else if (W.shape === 'u-harbour') {
        const hw = W.w * 0.5, hd = W.d * 0.5;
        const headD = W.d - W.notchD;
        const wingW = (W.w - W.notchW) * 0.5;
        const wingZ = hd - W.notchD * 0.5;
        const dHeadD = headD + 0.6, dWingW = wingW + 0.6, dWingD = W.notchD + 0.6;
        const wingLaneX = 0.5 * ((W.notchW * 0.5 + 9.2) + (hw - 10.2));
        deckBoxes.push(box2D(0, (hd - W.notchD) - dHeadD * 0.5, W.w + 1.2, dHeadD));
        laneBoxes.push(box2D(0, -(hd - 18.85), W.w - 10.0, 3.8));
        for (let sgn = -1; sgn <= 1; sgn += 2) {
          deckBoxes.push(box2D(sgn * (W.notchW * 0.5 + dWingW * 0.5), (hd - W.notchD) + dWingD * 0.5, dWingW, dWingD));
          laneBoxes.push(box2D(sgn * wingLaneX, wingZ, 3.8, W.notchD - 8.0));
          curbBoxes.push(box2D(sgn * (W.notchW * 0.5 + 0.7), wingZ, 1.4, W.notchD));
        }
        curbBoxes.push(box2D(0, hd - W.notchD - 0.7, W.notchW + 2.8, 1.4));
      } else if (W.shape === 'stepped-bazaar') {
        const shw = W.stepW * 0.5, shd = W.stepD * 0.5;
        curbBoxes.push(box2D(-(shw - 0.5), 0, 1.0, W.stepD));
        curbBoxes.push(box2D( (shw - 0.5), 0, 1.0, W.stepD));
        curbBoxes.push(box2D(-((shw - 1.0 + 4.8) * 0.5), -(shd - 0.5), shw - 5.8, 1.0));
        curbBoxes.push(box2D( ((shw - 1.0 + 4.8) * 0.5), -(shd - 0.5), shw - 5.8, 1.0));
        curbBoxes.push(box2D(-((shw - 1.0 + 4.8) * 0.5),  (shd - 0.5), shw - 5.8, 1.0));
        curbBoxes.push(box2D( ((shw - 1.0 + 4.8) * 0.5),  (shd - 0.5), shw - 5.8, 1.0));
        laneBoxes.push(box2D(0, -(shd + 7.2), W.w - 12.0, 4.2));
        laneBoxes.push(box2D(0,  (shd + 7.2), W.w - 12.0, 4.2));
      }

      slabOverlaps += countPairOverlaps(deckBoxes) + countPairOverlaps(curbBoxes) + countPairOverlaps(laneBoxes);
      if (laneTopY - deckTopY < 0.20) lowLaneSteps++;
    }

    for (let g = 0; g < gardens.length; g++) {
      const G = gardens[g];
      const hw = G.w * 0.5, hd = G.d * 0.5;
      const gCurbs = [
        box2D(0, -hd + 0.75, G.w, 1.5),
        box2D(0,  hd - 0.75, G.w, 1.5),
        box2D(-hw + 0.75, 0, 1.5, G.d - 3.0),
        box2D( hw - 0.75, 0, 1.5, G.d - 3.0)
      ];
      slabOverlaps += countPairOverlaps(gCurbs);
    }

    const plazas = FC_BLUFF_PLAN.PLAZAS.map(FC_BLUFF_PLAN.plazaBounds);
    for (let p = 0; p < plazas.length; p++) {
      const PB = plazas[p];
      for (let a = 0; a < FC_BLUFF_PLAN.AVE_OFFSETS.length; a++) {
        const av = FC_BLUFF_PLAN.AVE_OFFSETS[a];
        const avD0 = av.dInland - av.widthM * 0.5, avD1 = av.dInland + av.widthM * 0.5;
        if (Math.min(PB.d1, avD1) - Math.max(PB.d0, avD0) > 1e-3) wayOverlaps++;
      }
    }

    for (let w = 0; w < ways.length; w++) {
      const way = ways[w];
      if (way.cls !== 'cross' || !way.pts || way.pts.length < 2) continue;
      const x = way.pts[0][0];
      const d0 = FC_SITE.bluffShoreZ(x) - way.pts[0][1];
      const d1 = FC_SITE.bluffShoreZ(x) - way.pts[way.pts.length - 1][1];
      const cBox = { x0: x - way.widthM * 0.5, x1: x + way.widthM * 0.5, z0: Math.min(d0, d1), z1: Math.max(d0, d1) };

      for (let a = 0; a < FC_BLUFF_PLAN.AVE_OFFSETS.length; a++) {
        const av = FC_BLUFF_PLAN.AVE_OFFSETS[a];
        const aBox = { x0: -860, x1: 1660, z0: av.dInland - av.widthM * 0.5, z1: av.dInland + av.widthM * 0.5 };
        if (rectOverlap2D(cBox, aBox)) wayOverlaps++;
      }
      for (let p = 0; p < plazas.length; p++) {
        const PB = plazas[p];
        const pBox = { x0: PB.x0, x1: PB.x1, z0: PB.d0, z1: PB.d1 };
        if (rectOverlap2D(cBox, pBox)) wayOverlaps++;
      }
    }

    return {
      ok: slabOverlaps === 0 && lowLaneSteps === 0 && wayOverlaps === 0,
      slabOverlaps: slabOverlaps,
      lowLaneSteps: lowLaneSteps,
      wayOverlaps: wayOverlaps
    };
  }

  function auditLayout(planOut) {
    const L = planOut.lots;
    const mega = FC_MEGA.plan();
    const pontoonsById = {};
    planOut.pontoons.forEach(function (p) { pontoonsById[p.id] = p; });

    let overlaps = 0, badMainlandDwell = 0, unsupportedLots = 0;
    let suudmeCount = 0, lowerRiaCount = 0, upperRiaCount = 0;
    let totalHouseholds = 0, totalBuildingPop = 0, pontoonLots = 0;
    const shapesUsed = {};
    planOut.pontoons.forEach(function (p) { shapesUsed[p.shape] = (shapesUsed[p.shape] == null ? 0 : shapesUsed[p.shape]) + 1; });

    for (let i = 0; i < L.length; i++) {
      const a = L[i];
      if (a.style === 'suudme') suudmeCount++;
      else if (a.style === 'lower-ria') lowerRiaCount++;
      else if (a.style === 'upper-ria') upperRiaCount++;

      totalHouseholds += (a.hh == null ? 0 : a.hh);
      totalBuildingPop += (a.pop == null ? 0 : a.pop);
      if (a.instance === 'pontoons') pontoonLots++;

      if (!isLotSupported(a, mega, pontoonsById)) unsupportedLots++;

      if (a.instance === 'bluff' || (a.instance === 'dykes' && a.district === 'D5')) {
        if (a.res) {
          const corners = obbCorners(a, 0);
          for (let c = 0; c < 4; c++) {
            if (FC_SITE.elevAt(corners[c][0], corners[c][1]) < FC_SITE.SAFE_DWELL_Y) badMainlandDwell++;
          }
          if (a.y < FC_SITE.SAFE_DWELL_Y) badMainlandDwell++;
        }
      }
      for (let j = i + 1; j < L.length; j++) {
        if (obbOverlap(a, L[j], 0.12)) overlaps++;
      }
    }

    const adj = {};
    planOut.walkGraph.nodes.forEach(function (n) { adj[n] = []; });
    planOut.walkGraph.edges.forEach(function (e) {
      if (adj[e[0]] && adj[e[1]]) {
        adj[e[0]].push(e[1]);
        adj[e[1]].push(e[0]);
      }
    });
    const seen = new Set(['bluff_as01']);
    const q = ['bluff_as01'];
    while (q.length) {
      const cur = q.shift();
      const nb = adj[cur] || [];
      for (let i = 0; i < nb.length; i++) {
        if (!seen.has(nb[i])) {
          seen.add(nb[i]);
          q.push(nb[i]);
        }
      }
    }
    const unreached = planOut.walkGraph.nodes.filter(function (n) { return !seen.has(n); });
    const avgPontoonLots = planOut.pontoons.length ? +(pontoonLots / planOut.pontoons.length).toFixed(2) : 0;
    const bascAudit = auditBascules(planOut);
    const slabAudit = auditSlabsAndWays(planOut);

    return {
      ok: overlaps === 0 && unsupportedLots === 0 && badMainlandDwell === 0 && unreached.length === 0 &&
          bascAudit.ok && slabAudit.ok && L.length >= 2200 && suudmeCount >= 550 && lowerRiaCount >= 1200 && upperRiaCount >= 120 &&
          avgPontoonLots >= 20.0 && (planOut.gardens ? planOut.gardens.length : 0) >= 12,
      totalLots: L.length,
      totalHouseholds: totalHouseholds,
      totalBuildingPop: totalBuildingPop,
      pontoons: planOut.pontoons.length,
      pontoonLots: pontoonLots,
      avgPontoonLots: avgPontoonLots,
      shapesUsed: shapesUsed,
      gardens: planOut.gardens ? planOut.gardens.length : 0,
      uplandFarms: planOut.uplandFarms ? planOut.uplandFarms.length : 0,
      bascules: planOut.bascules.length,
      basculeAudit: bascAudit,
      slabAudit: slabAudit,
      overlaps: overlaps,
      unsupportedLots: unsupportedLots,
      badMainlandDwell: badMainlandDwell,
      suudmeCount: suudmeCount,
      lowerRiaCount: lowerRiaCount,
      upperRiaCount: upperRiaCount,
      byDistrict: planOut.byDistrict,
      unreachedNodes: unreached
    };
  }

  return {
    localToWorld: localToWorld,
    worldToLocal: worldToLocal,
    obbCorners: obbCorners,
    obbOverlap: obbOverlap,
    isPointOnPlatform: isPointOnPlatform,
    isPointInsideOuterHull: isPointInsideOuterHull,
    rimTowardsShape: rimTowardsShape,
    isLotSupported: isLotSupported,
    buildPlans: buildPlans,
    auditBascules: auditBascules,
    auditSlabsAndWays: auditSlabsAndWays,
    auditLayout: auditLayout
  };
})();
