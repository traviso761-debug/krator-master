// ================================================================= DRAW RING — Horseshoe Neocliff, 9 Battered Bastions, 13 Skylights & 6 Belvederes
// Draws Zone 2 from AF_PLAN:
//   - Vaulted City Center Arcades facing the sheltered Central Park (`r = 146..212 m`, `y = 84..144 m`)
//   - 13 Square Courtyard Skylight Wells with 8-spoke radial bronze-and-glass oculi (`y = 144 m`)
//   - 9 Battered Trapezoidal Dwelling Bastions (`4` West, `5` East, 68 deg outer slope, ribbed residential terraces & buttress fins)
//   - Continuous `y = 144 m` Garden Promenade + 6 Flared Concrete Mushroom-Pier Public/Recreation Belvederes (`y = 152..166 m`)
(function drawAfRing() {
  const P = AF_PLAN, D = P.dim, A = AF_ACC, cx = D.RING_CX, cz = D.RING_CZ;
  const ptAt = (r, a) => [cx + r * Math.cos(a), cz + r * Math.sin(a)];

  // ---------------- 1. VAULTED CITY CENTER ARCADES & GARDEN PROMENADE DECK ----------------
  P.cityCenter.arcades.forEach(arc => {
    const segs = 22, da = (arc.a1 - arc.a0) / segs;
    for (let i = 0; i < segs; i++) {
      const a0 = arc.a0 + i * da, a1 = a0 + da, am = (a0 + a1) / 2;
      const in0 = ptAt(arc.r0, a0), in1 = ptAt(arc.r0, a1);
      const out0 = ptAt(arc.r1, a0), out1 = ptAt(arc.r1, a1);
      const nIn = [-Math.cos(am), 0, -Math.sin(am)], nOut = [Math.cos(am), 0, Math.sin(am)];

      /* Park-facing monumental two-tier parabolic arcade (`CITY CENTER`, Plate 2 Fig 1 & Plate 3 Fig 1) */
      A.archBay('SHELL', in0, in1, arc.y0, arc.y0 + 18, arc.y0 + 9, 0.72, nIn);
      A.wall('GLAZE', ptAt(arc.r0 + 2.4, a0), ptAt(arc.r0 + 2.4, a1), arc.y0 + 0.5, arc.y0 + 17.5, nIn, 12);

      /* Mid-level loggia galleries (`y = 102..132 m`) + Upper cornice frieze (`y = 132..144 m`) */
      A.archBay('SHELL', in0, in1, arc.y0 + 18, arc.y0 + 36, arc.y0 + 27, 0.68, nIn);
      A.wall('GLAZE', ptAt(arc.r0 + 2.2, a0), ptAt(arc.r0 + 2.2, a1), arc.y0 + 18.5, arc.y0 + 35.5, nIn, 10);
      A.wall('SHELL', in0, in1, arc.y0 + 36, arc.y1, nIn, 16);
      A.wall('GLAZE', ptAt(arc.r0 - 0.15, a0 + da * 0.15), ptAt(arc.r0 - 0.15, a1 - da * 0.15), arc.y0 + 39, arc.y1 - 3.5, nIn, 8);

      /* Outer rear wall of City Center ring (between bastions) */
      A.wall('CONC', out0, out1, arc.y0, arc.y1, nOut, 16);

      /* Promenade roof deck at y = 144 m (leaving skylight squares open via raised coffer frames) + inner/outer parapets */
      A.polyH('PAVE', [in0, in1, out1, out0], arc.y1, true, 16);
      /* Planted garden strip down the middle of the Promenade */
      const g0 = ptAt(arc.r0 + 8, a0), g1 = ptAt(arc.r0 + 8, a1), g2 = ptAt(arc.r1 - 10, a1), g3 = ptAt(arc.r1 - 10, a0);
      A.polyH('TURF', [g0, g1, g2, g3], arc.y1 + 0.18, true, 14);
      /* Promenade safety parapets */
      A.wall('SHELL', in0, in1, arc.y1, arc.y1 + 1.25, nIn, 8);
      A.wall('SHELL', out0, out1, arc.y1, arc.y1 + 1.25, nOut, 8);
    }
    /* End bulkhead walls at the North Cliff and South Throat ends of each wing */
    for (const endA of [arc.a0, arc.a1]) {
      const sgn = endA === arc.a0 ? -1 : 1;
      const nEnd = [-sgn * Math.sin(endA), 0, sgn * Math.cos(endA)];
      A.wall('SHELL', ptAt(arc.r0, endA), ptAt(arc.r1, endA), arc.y0, arc.y1, nEnd, 16);
    }
  });

  // ---------------- 2. THIRTEEN SQUARE COURTYARD SKYLIGHT WELLS WITH RADIAL OCULI (Plate 1!) ----------------
  P.cityCenter.skylights.forEach(sk => {
    const hs = sk.size / 2, y = sk.y1;
    /* Raised square coffer curb framing the courtyard skylight */
    A.box('SHELL', sk.x, y, y + 2.2, sk.z - hs + 1.1, sk.size, 2.2, sk.th, 'SHELL', false);
    A.box('SHELL', sk.x, y, y + 2.2, sk.z + hs - 1.1, sk.size, 2.2, sk.th, 'SHELL', false);
    A.box('SHELL', sk.x - hs + 1.1, y, y + 2.2, sk.z, 2.2, sk.size - 4.4, sk.th, 'SHELL', false);
    A.box('SHELL', sk.x + hs - 1.1, y, y + 2.2, sk.z, 2.2, sk.size - 4.4, sk.th, 'SHELL', false);
    /* Sunken dark court well rim + circular glazed radial-spoke oculus dome */
    A.frustum('CONC', sk.x, sk.z, sk.oculusR + 1.2, sk.oculusR + 0.6, y + 0.2, y + 2.4, 16, false, false);
    A.frustum('GLAZE', sk.x, sk.z, sk.oculusR + 0.4, 1.8, y + 2.3, y + 4.4, 16, false, 'BRONZE');
    /* 8 Radial bronze spokes matching Plate 1's floral/wheel courtyard motif */
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      kput('afBoxB', [sk.x + Math.cos(a) * sk.oculusR * 0.5, y + 3.35, sk.z + Math.sin(a) * sk.oculusR * 0.5],
        qEuler(0, -a, 0.24), [sk.oculusR, 0.35, 0.42], null);
    }
  });

  // ---------------- 3. NINE BATTERED TRAPEZOIDAL DWELLING BASTIONS (Plate 1, Plate 2 Fig 1, Plate 3 Fig 2!) ----------------
  P.bastions.forEach(bs => {
    const segs = 5, da = (bs.a1 - bs.a0) / segs, tiers = 6;
    const dy = (bs.y1 - bs.y0) / tiers;

    /* Radial monumental concrete buttress fins flanking both sides of each bastion */
    for (const edgeA of [bs.a0, bs.a1]) {
      const sgn = edgeA === bs.a0 ? -1 : 1;
      const nSide = [-sgn * Math.sin(edgeA), 0, sgn * Math.cos(edgeA)];
      const pIn0 = ptAt(bs.rIn, edgeA), pOut0 = ptAt(bs.rOut0 + 4, edgeA), pOut1 = ptAt(bs.rOut1 + 2, edgeA), pIn1 = ptAt(bs.rIn, edgeA);
      A.quad('CONC',
        [[pIn0[0], bs.y0 - 4, pIn0[1]], [pOut0[0], bs.y0 - 4, pOut0[1]], [pOut1[0], bs.y1 + 2, pOut1[1]], [pIn1[0], bs.y1 + 2, pIn1[1]]],
        [[0, 0], [4, 0], [3.5, 4], [0, 4]], nSide);
    }

    /* Sloped 68-degree outer residential terraces, recessed dwelling glazing, and vertical structural ribs */
    for (let i = 0; i < segs; i++) {
      const a0 = bs.a0 + i * da, a1 = a0 + da, am = (a0 + a1) / 2;
      const nOut = [Math.cos(am), 0.36, Math.sin(am)];
      for (let t = 0; t < tiers; t++) {
        if (bs.breach && i === segs - 1 && t >= tiers - 2) continue;
        const y0 = bs.y0 + t * dy, y1 = y0 + dy;
        const f0 = t / tiers, f1 = (t + 1) / tiers;
        const r0 = bs.rOut0 + (bs.rOut1 - bs.rOut0) * f0;
        const r1 = bs.rOut0 + (bs.rOut1 - bs.rOut0) * f1;

        /* Sloped concrete spandrel apron + glazed residential band + planted terrace tread */
        const p00 = ptAt(r0, a0), p10 = ptAt(r0, a1), p1m = ptAt((r0 + r1) / 2, a1), p0m = ptAt((r0 + r1) / 2, a0);
        const p01 = ptAt(r1, a0), p11 = ptAt(r1, a1);
        A.quad('SHELL', [[p00[0], y0, p00[1]], [p10[0], y0, p10[1]], [p1m[0], y0 + dy * 0.34, p1m[1]], [p0m[0], y0 + dy * 0.34, p0m[1]]],
          [[0, 0], [1, 0], [1, 0.4], [0, 0.4]], nOut);
        A.quad('GLAZE', [[p0m[0], y0 + dy * 0.34, p0m[1]], [p1m[0], y0 + dy * 0.34, p1m[1]], [p11[0], y1 - 0.8, p11[1]], [p01[0], y1 - 0.8, p01[1]]],
          [[0, 0], [2, 0], [2, 1], [0, 1]], nOut);
        A.polyH('TURF', [ptAt(r1 - 2.4, a0), ptAt(r1 - 2.4, a1), p11, p01], y1 - 0.6, true, 8);
      }

      /* Sloped vertical structural rib dividing residential bays (matching Plate 3 Fig 2!) */
      if (i > 0) {
        for (let s = 0; s < 4; s++) {
          const fs = (s + 0.5) / 4, ry = bs.y0 + (bs.y1 - bs.y0) * fs;
          const rr = bs.rOut0 + (bs.rOut1 - bs.rOut0) * fs + 0.8;
          const rp = ptAt(rr, a0);
          kput('pierW', [rp[0], ry, rp[1]], qEuler(0, -a0, 0.38), [2.6, (bs.y1 - bs.y0) / 3.8, 1.5], null);
        }
      }

      /* Top roof deck of the bastion at y = 144 m */
      A.polyH('PAVE', [ptAt(bs.rIn, a0), ptAt(bs.rIn, a1), ptAt(bs.rOut1, a1), ptAt(bs.rOut1, a0)], bs.y1, true, 14);
      A.polyH('TURF', [ptAt(bs.rIn + 5, a0 + da * 0.1), ptAt(bs.rIn + 5, a1 - da * 0.1), ptAt(bs.rOut1 - 5, a1 - da * 0.1), ptAt(bs.rOut1 - 5, a0 + da * 0.1)], bs.y1 + 0.16, true, 12);
    }
  });

  // ---------------- 4. SIX MUSHROOM-PIER PROMENADE RECREATION BELVEDERES (Plate 2 Fig 1 & Plate 3 Fig 1!) ----------------
  P.promenade.pavilions.forEach(pv => {
    const cs = Math.cos(pv.ry), sn = Math.sin(pv.ry);
    const W = (lx, lz) => [pv.x + lx * cs + lz * sn, pv.z - lx * sn + lz * cs];
    /* Twin flared concrete mushroom/tree piers rising from Promenade (144 m) to Belvedere soffit (152 m) */
    for (const lx of [-pv.w * 0.26, pv.w * 0.26]) {
      const p = W(lx, 0);
      A.frustum('CONC', p[0], p[1], 2.4, 3.2, pv.yDeck, pv.yDeck + 4.8, 12, false, false);
      A.frustum('SHELL', p[0], p[1], 3.2, 7.6, pv.yDeck + 4.8, pv.y0, 14, false, 'SOFF');
    }
    /* Cantilevered 2-storey public/recreation belvedere box with wraparound sea/park ribbon windows */
    A.box('SHELL', pv.x, pv.y0, pv.y0 + 2.2, pv.z, pv.w, pv.d, pv.ry, 'PAVE', 'SOFF');
    A.box('GLAZE', pv.x, pv.y0 + 2.2, pv.y0 + 6.4, pv.z, pv.w - 1.6, pv.d - 1.6, pv.ry, false, false);
    A.box('SHELL', pv.x, pv.y0 + 6.4, pv.y0 + 8.2, pv.z, pv.w + 1.2, pv.d + 1.2, pv.ry, 'PAVE', 'SOFF');
    A.box('GLAZE', pv.x, pv.y0 + 8.2, pv.y1 - 1.8, pv.z, pv.w - 3.2, pv.d - 3.2, pv.ry, false, false);
    A.box('SHELL', pv.x, pv.y1 - 1.8, pv.y1, pv.z, pv.w - 1.0, pv.d - 1.0, pv.ry, 'BRONZE', 'SOFF');
  });
})();
