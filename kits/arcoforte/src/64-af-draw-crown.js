// ================================================================= DRAW CROWN — Fluted Domed Rotunda, 7 Cliff Skyscrapers & 300 m Sky-Crown
// Draws Zone 5 (Domed Rotunda "Tourist Center" & Atrium Dwellings, y = 70..222 m) and Zone 6 (Seven H-plan Sea-Cliff
// Skyscrapers rooted on stepped cliff plinths + cantilevered Living-Working/Garden trays + 300 m Complex Sky-Crown,
// Cultural Center vaults, Comms Mast & cantilevered Heliport), then flushes AF_ACC, bakes KIT instances, and registers KWALK.
(function drawAfCrownAndFlush() {
  const P = AF_PLAN, D = P.dim, A = AF_ACC;

  // ---------------- 1. DOMED ROTUNDA ("TOURIST CENTER" & SUNLIT ATRIUM DRUM, y = 70..222 m) ----------------
  const R = P.rotunda, nRot = 24;
  /* Ground concourse podium apron */
  A.frustum('PAVE', R.x, R.z, R.R + 6, R.R + 4, R.y0 - 4, R.y0, 24, false, 'PAVE');

  /* Outer drum: 24 grand arches at concourse base (y = 70..88 m) + tall fluted residential piers & glazed shafts (88..198 m) */
  for (let i = 0; i < nRot; i++) {
    const a0 = i / nRot * Math.PI * 2, a1 = (i + 1) / nRot * Math.PI * 2, am = (a0 + a1) / 2;
    const p0 = [R.x + R.R * Math.cos(a0), R.z + R.R * Math.sin(a0)];
    const p1 = [R.x + R.R * Math.cos(a1), R.z + R.R * Math.sin(a1)];
    const nOut = [Math.cos(am), 0, Math.sin(am)];
    A.archBay('SHELL', p0, p1, R.y0, R.y0 + 18, R.y0 + 10, 0.68, nOut);
    A.wall('GLAZE', [R.x + (R.R - 1.5) * Math.cos(a0), R.z + (R.R - 1.5) * Math.sin(a0)],
      [R.x + (R.R - 1.5) * Math.cos(a1), R.z + (R.R - 1.5) * Math.sin(a1)], R.y0 + 0.5, R.y1 - 2, nOut, 10);

    /* Vertical fluted pier standing proud on every vertex (Plate 2 Fig 1 & Plate 3 Fig 2!) */
    const fx = R.x + (R.R + 0.9) * Math.cos(a0), fz = R.z + (R.R + 0.9) * Math.sin(a0);
    A.box('SHELL', fx, R.y0, R.y1, fz, 2.8, 3.0, -a0, 'SHELL', false);

    /* Horizontal structural spandrel rings every 22 m */
    for (let sy = R.y0 + 22; sy <= R.y1 - 6; sy += 22) {
      A.wall('SHELL', p0, p1, sy, sy + 2.6, nOut, 12);
    }
  }
  /* Awakened Ancient cyan circuit band under the dome eave */
  A.frustum('ACCENT', R.x, R.z, R.R + 0.4, R.R + 0.4, R.y1 - 2.2, R.y1 - 0.8, 24, false, false);

  /* Inner sunlit central atrium wall (inward facing, r = 15 m) + 4 interior glass/bronze lift shafts */
  A.frustum('SHELL', R.x, R.z, R.rAtrium, R.rAtrium, R.y0, R.y1, 24, true, false);
  for (let k = 0; k < 4; k++) {
    const la = k * Math.PI / 2 + Math.PI / 4;
    const lx = R.x + (R.rAtrium - 2.2) * Math.cos(la), lz = R.z + (R.rAtrium - 2.2) * Math.sin(la);
    A.box('BRONZE', lx, R.y0, R.y1 + 2, lz, 4.2, 4.2, -la, 'BRONZE', false);
    A.box('GLAZE', lx, R.y0 + 4, R.y1, lz, 3.2, 4.5, -la, false, false);
  }

  /* Parabolic 24-rib vaulted concrete & bronze dome (y = 198..220 m) with open oculus lantern (R_oculus = 12 m) */
  const domeRings = 5;
  for (let s = 0; s < domeRings; s++) {
    const t0 = s / domeRings, t1 = (s + 1) / domeRings;
    const rr0 = R.R + 2 - (R.R + 2 - 12) * Math.pow(t0, 0.82);
    const rr1 = R.R + 2 - (R.R + 2 - 12) * Math.pow(t1, 0.82);
    const yy0 = R.y1 + 20 * Math.sin(t0 * Math.PI * 0.5);
    const yy1 = R.y1 + 20 * Math.sin(t1 * Math.PI * 0.5);
    A.frustum(s % 2 === 0 ? 'SHELL' : 'BRONZE', R.x, R.z, rr0, rr1, yy0, yy1, 24, false, false);
    A.frustum('SOFF', R.x, R.z, Math.max(12, rr0 - 1.2), Math.max(12, rr1 - 1.2), yy0 - 0.6, yy1 - 0.6, 24, true, false);
  }
  /* Oculus lantern collar (y = 218..222 m) */
  A.frustum('BRONZE', R.x, R.z, 12.8, 12.2, R.top - 4.5, R.top, 24, false, false);

  /* Twin High-Level Skybridges (y = 144 m) linking the Rotunda to the Cliff Skyscrapers */
  R.skybridges.forEach(sb => {
    const dx = sb.b[0] - sb.a[0], dz = sb.b[1] - sb.a[1], L = Math.hypot(dx, dz), yaw = Math.atan2(dx, dz);
    const mx = (sb.a[0] + sb.b[0]) / 2, mz = (sb.a[1] + sb.b[1]) / 2;
    A.box('SHELL', mx, sb.y - 2.0, sb.y + 3.2, mz, sb.w, L, yaw, 'PAVE', 'SOFF');
    A.box('GLAZE', mx, sb.y + 0.6, sb.y + 2.6, mz, sb.w + 0.2, L - 4, yaw, false, false);
  });

  // ---------------- 2. SEVEN H-PLAN SEA-CLIFF SKYSCRAPERS & CANTILEVERED CLIFF TRAYS ----------------
  P.towers.forEach(tw => {
    const cs = Math.cos(tw.ry), sn = Math.sin(tw.ry);
    const W = (lx, lz) => [tw.x + lx * cs + lz * sn, tw.z - lx * sn + lz * cs];

    /* Plunging rock-anchored concrete cliff plinth (echoing Soleri's 1965 sea-cliff sketches!) */
    A.box('CONC', tw.x, tw.yBase - 14, tw.yBase + 16, tw.z, tw.w + 6, tw.d + 8, tw.ry, 'PAVE', false);

    /* H-plan cellular skyscraper: 4 massive corner structural/service shafts + central glazed web */
    const pw = 8.2, pd = 8.2;
    for (const sx of [-(tw.w / 2 - pw / 2), (tw.w / 2 - pw / 2)]) {
      for (const sz of [-(tw.d / 2 - pd / 2), (tw.d / 2 - pd / 2)]) {
        const cp = W(sx, sz);
        const shaftTop = (tw.weathered && AF_STATE === 'ruined' && sz < 0) ? tw.yTop - 32 : tw.yTop;
        A.box('SHELL', cp[0], tw.yBase + 16, shaftTop, cp[1], pw, pd, tw.ry, 'SHELL', false);
        /* Vertical slot windows up each corner shaft */
        A.box('GLAZE', cp[0], tw.yBase + 22, shaftTop - 6, cp[1], pw * 0.46, pd + 0.3, tw.ry, false, false);
      }
    }
    /* Central H-bar core & residential/studio glazing */
    const coreTop = (tw.weathered && AF_STATE === 'ruined') ? tw.yTop - 24 : tw.yTop;
    A.box('CONC', tw.x, tw.yBase + 16, coreTop, tw.z, tw.w - 4, tw.d - 10, tw.ry, 'PAVE', false);
    A.box('GLAZE', tw.x, tw.yBase + 20, coreTop - 4, tw.z, tw.w - 12, tw.d - 3, tw.ry, false, false);

    /* Horizontal structural belt courses every 18 m */
    for (let by = tw.yBase + 28; by < coreTop - 6; by += 18) {
      A.box('SHELL', tw.x, by, by + 2.0, tw.z, tw.w + 0.8, tw.d + 0.8, tw.ry, 'PAVE', 'SOFF');
    }

    /* Cliff-facing cantilevered Living-Working & Sky-Garden Trays jutting out toward the ocean (Plate 2 Fig 3!) */
    tw.trays.forEach(tr => {
      if (tr.y > coreTop - 8) return;
      const tp = W(0, -(tw.d / 2 + tr.out * 0.45));
      A.box('SHELL', tp[0], tr.y - 2.2, tr.y + 1.2, tp[1], tr.w, tr.out + 4, tw.ry, 'TURF', 'SOFF');
      /* Diagonal concrete/bronze bracket struts under each cantilevered cliff tray */
      for (const bx of [-tr.w * 0.34, tr.w * 0.34]) {
        const sp = W(bx, -(tw.d / 2 + tr.out * 0.22));
        kput('pierW', [sp[0], tr.y - 5.5, sp[1]], qEuler(-0.55, -tw.ry, 0), [1.6, 9.5, 1.6], null);
      }
    });

    /* Flared Inverted-Cone Structural Capital under the 300 m Sky-Crown (Plate 2 upper-right!) */
    if (!(AF_STATE === 'ruined' && tw.index === 0)) {
      A.frustum('CONC', tw.x, tw.z, 11, 21, tw.yTop - 14, tw.yTop, 12, false, 'SOFF');
    }
  });

  // ---------------- 3. THE 300 M COMPLEX SKY-CROWN, CULTURAL HALLS, COMMS MAST & HELIPORT ----------------
  const SC = P.skyCrown, segs = 20, da = (SC.a1 - SC.a0) / segs;
  const arcPt = (r, a) => [SC.cx + r * Math.cos(a), SC.cz + r * Math.sin(a)];

  for (let i = 0; i < segs; i++) {
    if (AF_STATE === 'ruined' && i < 2) continue;
    const a0 = SC.a0 + i * da, a1 = a0 + da, am = (a0 + a1) / 2;
    const in0 = arcPt(SC.rIn, a0), in1 = arcPt(SC.rIn, a1);
    const out0 = arcPt(SC.rOut, a0), out1 = arcPt(SC.rOut, a1);
    const nIn = [-Math.cos(am), 0, -Math.sin(am)], nOut = [Math.cos(am), 0, Math.sin(am)];

    /* Lower Hanging Sky-Garden Truss Deck (y = 258..264 m) */
    A.polyH('SOFF', [in0, in1, out1, out0], SC.y0, false, 16);
    A.wall('SHELL', in0, in1, SC.y0, SC.y0 + 6.0, nIn, 14);
    A.wall('SHELL', out0, out1, SC.y0, SC.y0 + 6.0, nOut, 14);
    A.polyH('TURF', [in0, in1, out1, out0], SC.y0 + 6.0, true, 14);

    /* Vaulted Cultural Center & Public Observatory Superstructure (y = 264..284 m) */
    const mIn0 = arcPt(SC.rIn + 5, a0), mIn1 = arcPt(SC.rIn + 5, a1);
    const mOut0 = arcPt(SC.rOut - 5, a0), mOut1 = arcPt(SC.rOut - 5, a1);
    A.archBay('SHELL', mIn0, mIn1, SC.y0 + 6.0, SC.y1 - 3, SC.y0 + 13, 0.66, nIn);
    A.archBay('SHELL', mOut0, mOut1, SC.y0 + 6.0, SC.y1 - 3, SC.y0 + 13, 0.66, nOut);
    A.wall('GLAZE', arcPt(SC.rIn + 6.5, a0), arcPt(SC.rIn + 6.5, a1), SC.y0 + 6.5, SC.y1 - 3.5, nIn, 10);
    A.wall('GLAZE', arcPt(SC.rOut - 6.5, a0), arcPt(SC.rOut - 6.5, a1), SC.y0 + 6.5, SC.y1 - 3.5, nOut, 10);

    /* Complex Roof Canopy Slab & Bronze Fascia (y = 281..285 m) */
    A.polyH('SOFF', [in0, in1, out1, out0], SC.y1 - 3, false, 16);
    A.wall('BRONZE', in0, in1, SC.y1 - 3, SC.y1, nIn, 12);
    A.wall('BRONZE', out0, out1, SC.y1 - 3, SC.y1, nOut, 12);
    A.polyH('PAVE', [in0, in1, out1, out0], SC.y1, true, 16);
  }
  /* End caps of the Sky-Crown */
  for (const ea of [SC.a0, SC.a1]) {
    if (AF_STATE === 'ruined' && ea === SC.a0) continue;
    const sgn = ea === SC.a0 ? -1 : 1, nE = [-sgn * Math.sin(ea), 0, sgn * Math.cos(ea)];
    A.wall('SHELL', arcPt(SC.rIn, ea), arcPt(SC.rOut, ea), SC.y0, SC.y1, nE, 14);
  }

  /* Central 300 m Communications & Refurbished Beacon Mast over Skyscraper T4 (index 3) */
  A.frustum('BRONZE', SC.mast.x, SC.mast.z, 7.5, 3.2, SC.y1, SC.y1 + 8.5, 12, false, 'BRONZE');
  A.frustum('BRONZE', SC.mast.x, SC.mast.z, 1.4, 0.45, SC.y1 + 8.5, SC.top, 8, false, 'ACCENT');
  kput('afLamp', [SC.mast.x, SC.top + 0.6, SC.mast.z], null, 3.2, null);

  /* Suspension Stay-Cables radiating from the Central Crown Spire across the Sky-Crown roof (Plate 2 top!) */
  P.towers.forEach((tw, idx) => {
    if (idx === 3 || (AF_STATE === 'ruined' && idx === 0)) return;
    const dx = tw.x - SC.mast.x, dz = tw.z - SC.mast.z, dy = (SC.y1 + 0.5) - (SC.top - 2.0);
    const L = Math.hypot(dx, dy, dz), yaw = Math.atan2(dx, dz), pitch = Math.atan2(Math.hypot(dx, dz), -dy);
    kput('afPostB', [(SC.mast.x + tw.x) / 2, (SC.top - 2 + SC.y1 + 0.5) / 2, (SC.mast.z + tw.z) / 2],
      qEuler(pitch, yaw, 0), [0.22, L, 0.22], null);
  });

  /* Cantilevered Eastern Headland Heliport & Air-Pad (`HELIPORT`, Plate 2 top-right, y = 274 m!) */
  const hp = SC.heliport, t6 = P.towers[6];
  A.box('CONC', (t6.x + hp.x) / 2, hp.y - 3.8, hp.y - 0.5, (t6.z + hp.z) / 2, Math.hypot(hp.x - t6.x, hp.z - t6.z), 18,
    Math.atan2(hp.z - t6.z, hp.x - t6.x), 'PAVE', 'SOFF');
  A.frustum('CONC', hp.x, hp.z, hp.r - 4, hp.r + 1, hp.y - 5.5, hp.y, 20, false, 'PAVE');
  A.frustum('ACCENT', hp.x, hp.z, hp.r * 0.58, hp.r * 0.54, hp.y + 0.06, hp.y + 0.18, 20, false, false);

  // ---------------- 4. FLUSH MERGED ARCHITECTURE, BAKE INSTANCES & REGISTER KWALK FLOORS ----------------
  const flushed = A.flush(scene);
  AF_DRAWN.archTris = flushed.tris;
  AF_DRAWN.archMeshes = flushed.meshes;
  kbake(scene);

  if (typeof KWALK !== 'undefined') {
    P.harbour.decks.forEach(dk => KWALK.floor({ rect: [dk.x0, dk.x1, dk.z0, dk.z1], y: dk.y, name: dk.name }));
    KWALK.floor({ rect: [-92, 92, -244, -174], y: D.BENCH, name: 'Sub-Cliff Harbour Bench' });
    KWALK.floor({ rect: [-130, 130, -130, 140], y: 74, name: 'Sheltered Central Park' });
    P.park.bridges.forEach(br => KWALK.strip({ a: [br.a[0], br.a[1], br.y], b: [br.b[0], br.b[1], br.y], w: br.w, name: br.name }));
    KWALK.floor({ rect: [-60, 60, D.LIN_Z0, D.LIN_Z1], y: D.PLATEAU, name: 'Linear City Spine' });
    KWALK.floor({ rect: [R.x - R.R, R.x + R.R, R.z - R.R, R.z + R.R], y: R.y0, name: 'Domed Rotunda Concourse' });
    KWALK.floor({ rect: [-210, -145, -90, 110], y: D.Y_RING_TOP, name: 'West Garden Promenade' });
    KWALK.floor({ rect: [145, 210, -90, 110], y: D.Y_RING_TOP, name: 'East Garden Promenade' });
    KWALK.floor({ rect: [P.towers[0].x, P.towers[6].x, -258, -190], y: SC.y0 + 6, name: 'Sky-Crown Hanging Gardens' });
    KWALK.floor({ rect: [hp.x - hp.r, hp.x + hp.r, hp.z - hp.r, hp.z + hp.r], y: hp.y, name: hp.name });
    /* Solid wall collider blocks on the Linear City Spine & Sub-Cliff Bulkhead (for F walk mode & KHOST.walkCheck) */
    KWALK.block([-52, -16, 204, 226, D.PLATEAU, D.PLATEAU + 28], 'linear-west-wall');
    KWALK.block([16, 52, 204, 226, D.PLATEAU, D.PLATEAU + 28], 'linear-east-wall');
    KWALK.block([-76, -4, -207, -205.5, D.BENCH, D.BENCH + 12], 'vault-bulkhead-west');
    KWALK.block([4, 76, -207, -205.5, D.BENCH, D.BENCH + 12], 'vault-bulkhead-east');
  }
})();
