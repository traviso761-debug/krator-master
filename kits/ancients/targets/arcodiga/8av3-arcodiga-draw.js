// ================================================================= ARCODIGA — Soleri's dam arcology: the builder
// Draws ARCODIGA.plan() across three states:
//   d === 0  intact        the Ancients' city at its peak (~257k-280k people), full reservoir (328 m), cyan strips, hydro falls
//   d === 3  refurbished   settlement centerpiece (~26k people): kept reservoir (324 m), active hydro & highways, warm amber
//                          inhabited core (Crest, VTOL, Axial Spine, Stiffening Wing, Powerhouse, 4 prows & 4 inner ribs),
//                          while the 12 outer Living-Working ribs stand sealed behind heavy alloy bulkheads
//   d === 1  ruined        breached by the Notch (x -265, sill 212 m) and severed across the west Stiffening Wing, 211 m
//                          cascade, mathematically seated debris audited by KRUINS.watch

function buildArcodiga(scene, gx, gz, d, opts) { reseed(12700 + d); KOFF = [gx, 0, gz];

  /* Separate land group from architectural group so repairPass(G_ARCH, 3) dresses only architectural surfaces, never cliffs */
  const G_SITE = new THREE.Group();
  G_SITE.position.set(gx, 0, gz);
  if (!opts?.noTerrain) scene.add(G_SITE);

  const G_ARCH = new THREE.Group();
  G_ARCH.position.set(gx, 0, gz);
  G_ARCH.userData.hull = ARCODIGA.HULL;
  scene.add(G_ARCH);

  const P = ARCODIGA.plan({ seed: 12700 });
  const D = P.dim, ruin = d === 1, refurb = d === 3, dd = ruin ? 1 : 0;
  const RU = ruin ? ARCODIGA.ruin(P) : null;
  const U = (a, b, c) => ARCODIGA.u(12700 + d, a, b, c);
  const stateLabel = ruin ? 'ruined' : refurb ? 'refurbished centerpiece' : 'intact';
  const tagState = ruin ? 'ruined' : refurb ? 'reclaimed' : 'intact';

  /* ---- 1. Register every placed organ, prow, rib and silt basin in core/tags & inspector REG BEFORE drawing ---- */
  const T = (typeof AIK !== 'undefined' && AIK.T) ? AIK.T : (typeof KTAGS !== 'undefined' ? (KTAGS.arcodiga = KTAGS.arcodiga || KTAGS.create({ build: 'arcodiga' })) : null);
  if (T) {
    for (const org of P.organs) {
      T.add({
        'class': 'building', key: org.id + '.' + d, name: org.name + ' (' + stateLabel + ')',
        at: [gx + org.at[0], org.at[1], gz + org.at[2]], size: org.size,
        tags: { culture: refurb && org.refurbished ? 'post-apoc' : 'ancient', state: tagState, types: org.types },
        frag: '8av3-arcodiga-draw.js'
      });
    }
    for (const pr of P.prows) {
      T.add({
        'class': 'building', key: pr.id + '.' + d, name: pr.name + ' (' + stateLabel + ')',
        at: [gx + pr.x, (pr.y0 + pr.y1) / 2, gz + pr.z0 + 40], size: [pr.w, 90, pr.y1 - pr.y0],
        tags: { culture: refurb ? 'post-apoc' : 'ancient', state: tagState, types: pr.types },
        frag: '8av3-arcodiga-draw.js'
      });
    }
    for (const rb of P.ribs) {
      const rbState = ruin ? 'ruined' : refurb ? (rb.dormant ? 'rehab' : 'reclaimed') : 'intact';
      T.add({
        'class': 'building', key: rb.id + '.' + d,
        name: rb.name + (refurb && rb.dormant ? ' (sealed dormant sector)' : ' (' + stateLabel + ')'),
        at: [gx + rb.x, (rb.y0 + rb.y1) / 2, gz + ARCODIGA.zDs(rb.x, 180) + 24],
        size: [rb.w, 60, rb.y1 - rb.y0],
        tags: { culture: refurb && !rb.dormant ? 'post-apoc' : 'ancient', state: rbState, types: rb.types },
        frag: '8av3-arcodiga-draw.js'
      });
    }
    if (!opts?.noTerrain) {
      for (const sb of P.siltBeds) {
        T.add({
          'class': 'building', key: sb.id + '.' + d, name: sb.name + ' (' + stateLabel + ')',
          at: [gx + sb.x, 2, gz + sb.z], size: [sb.r * 2, sb.r * 2, 4],
          tags: { culture: refurb ? 'post-apoc' : 'ancient', state: tagState, types: ['farm', 'park'] },
          frag: '8av3-arcodiga-draw.js'
        });
      }
    }
  }

  /* Inspector volumes (local coords; KOFF adds gx, gz automatically) */
  REGISTER({ name: 'Arcodiga — dam arcology (' + stateLabel + ')', x: 0, z: 0, r: 980, h: D.VTOL.yDeck1 + 16 });
  REGISTER({ name: 'Arcodiga — Horizontal Stiffening Wing & Highways (' + stateLabel + ')', x: 0, z: D.WING.zC, r: 460, y: 120, h: 205 });
  REGISTER({ name: 'Arcodiga — Vertical Take-Off Airport (' + stateLabel + ')', x: 0, z: D.VTOL.z, r: 92, y: 20, h: D.VTOL.yDeck1 + 12 });
  REGISTER({ name: 'Arcodiga — Axial City Center Spine (' + stateLabel + ')', x: 0, z: 20, r: 120, y: 148, h: 62 });
  REGISTER({ name: 'Arcodiga — Power House & Automated Industries (' + stateLabel + ')', x: 0, z: 20, r: 340, y: 0, h: 64 });

  /* ---- 2. Canyon, Reservoir Bed, Downstream Park & Silt Basins (own reseed sub-block) ---- */
  const land = adgLand(G_SITE, P, d, U, opts);
  /* Reset megastructure PRNG stream unconditionally so opts.noTerrain never shifts a single megastructure draw */
  reseed(12700 + d);

  /* ---- 3. Convex-Upstream Arch Dam, Ruin Notch, Light Tunnels & Crest Promenade ---- */
  const DAM_CONC = [], DAM_WHITE = [];
  const notch = (x, y) => ruin && ARCODIGA.inNotch(x, y);
  const inOculus = (x, z) => P.oculi.some(o => Math.hypot(x - o.x, z - o.z) < o.r * 0.88);

  /* Soleri circular light tunnels driven horizontally into the upper downstream face between buttresses */
  const TUNS = [];
  for (let k = -6; k <= 6; k++) {
    if (k >= -1 && k <= 1) continue; /* central spine & prows occupy centre */
    const tx = k * 88 + (k > 0 ? 18 : -18);
    for (let row = 0; row < 2; row++) {
      const ty = 228 + row * 68, tr = 8.5;
      if (notch(tx - tr, ty) || notch(tx + tr, ty)) continue;
      TUNS.push({ x: tx, y: ty, r: tr });
    }
  }
  const inTunnel = (x, y) => TUNS.some(t => Math.hypot(x - t.x, y - t.y) < t.r * 0.88);
  const faceDecayHole = ruin ? holeFn(0.42, 12711, null, 1.5) : null;

  /* Downstream battered arch wall */
  DAM_CONC.push(gridSurface((u, v) => {
    const x = (u - 0.5) * D.SPAN, y = v * D.H;
    return [x, y, ARCODIGA.zDs(x, y)];
  }, 168, 76, {
    uS: 44, vS: 20,
    hole: (u, v) => {
      const x = (u - 0.5) * D.SPAN, y = v * D.H;
      return notch(x, y) || inTunnel(x, y) || (faceDecayHole ? faceDecayHole(u, v) : false);
    }
  }));

  /* Upstream vertical arch wall */
  DAM_CONC.push(gridSurface((u, v) => {
    const x = (u - 0.5) * D.SPAN, y = v * D.H;
    return [x, y, ARCODIGA.zUp(x)];
  }, 112, 32, { uS: 44, vS: 20, hole: (u, v) => notch((u - 0.5) * D.SPAN, v * D.H) }));

  /* Crest top deck (cantilevered slightly downstream to carry the 66 m Promenade) */
  DAM_CONC.push(gridSurface((u, v) => {
    const x = (u - 0.5) * D.SPAN;
    const z0 = ARCODIGA.zUp(x) - 4, z1 = z0 + D.CREST.depth;
    return [x, D.H, ARCODIGA.lerp(z0, z1, v)];
  }, 140, 8, {
    uS: 44, vS: 6,
    hole: (u, v) => {
      const x = (u - 0.5) * D.SPAN;
      const z = ARCODIGA.lerp(ARCODIGA.zUp(x) - 4, ARCODIGA.zUp(x) - 4 + D.CREST.depth, v);
      return notch(x, D.H - 1) || inOculus(x, z);
    }
  }));
  /* Crest cantilevered soffit & corbel lip where CREST.depth overhangs TH1 (48 m) */
  DAM_CONC.push(gridSurface((u, v) => {
    const x = (u - 0.5) * D.SPAN;
    const zA = ARCODIGA.zDs(x, D.H - 14), zB = ARCODIGA.zUp(x) - 4 + D.CREST.depth;
    return [x, ARCODIGA.lerp(D.H - 14, D.H, v), ARCODIGA.lerp(zA, zB, v)];
  }, 120, 3, { uS: 44, vS: 3, hole: (u, v) => notch((u - 0.5) * D.SPAN, D.H - 4) }));

  /* Light tunnel barrels & lit rear discs */
  for (const t of TUNS) {
    const zF = ARCODIGA.zDs(t.x, t.y), dep = 34;
    const tube = gridSurface((u, v) => {
      const a = u * TAU;
      return [t.x + Math.cos(a) * t.r, t.y + Math.sin(a) * t.r, zF + 1.5 - v * dep];
    }, 20, 3, { uS: 6, vS: 4 });
    DAM_WHITE.push(tube);
    if (!ruin) {
      kput('slab', [t.x, t.y, zF - dep + 2], qFacing([0, 0, 1]), [t.r * 1.4, t.r * 1.4, 0.8],
        (refurb ? WARM : CYAN).clone().multiplyScalar(0.65));
    }
  }

  /* Ruin Notch cheeks, sill floor, interior void liner, and exposed floor-plate stubs */
  if (ruin) {
    const N = D.NOTCH;
    const hwAt = y => N.wBot + (N.wTop - N.wBot) * Math.pow(ARCODIGA.clamp((y - N.sill) / (D.H - N.sill), 0, 1), 0.82)
      + 7 * Math.sin(y * 0.09 + 0.7) + 4 * Math.cos(y * 0.21);
    for (const sg of [-1, 1]) {
      DAM_CONC.push(gridSurface((u, v) => {
        const y = ARCODIGA.lerp(N.sill, D.H, v), x = N.x + sg * hwAt(y);
        return [x, y, ARCODIGA.lerp(ARCODIGA.zUp(x), ARCODIGA.zDs(x, y), u)];
      }, 8, 22, { uS: 8, vS: 14 }));
    }
    DAM_CONC.push(gridSurface((u, v) => {
      const hw = hwAt(N.sill), x = N.x + (v * 2 - 1) * hw;
      return [x, N.sill, ARCODIGA.lerp(ARCODIGA.zUp(x), ARCODIGA.zDs(x, N.sill), u)];
    }, 8, 6, { uS: 8, vS: 4 }));
    /* cellular floor-plate stubs jutting out of both broken Notch cheeks */
    for (let y = N.sill + 8; y < D.H - 4; y += 8) {
      for (const sg of [-1, 1]) {
        const x = N.x + sg * hwAt(y), L = 4 + 8 * U(801, y, sg + 2);
        const zm = (ARCODIGA.zUp(x) + ARCODIGA.zDs(x, y)) * 0.5, dep = ARCODIGA.th(y) * 0.72;
        kput(BOXC(1), [x - sg * (L * 0.5 - 1.5), y, zm], qEuler(0, 0, sg * (0.04 - 0.12 * U(802, y, sg + 2))), [L, 1.3, dep], null);
      }
    }
    mesh(gridSurface((u, v) => {
      const x = (u - 0.5) * D.SPAN, y = v * D.H;
      return [x, y, ARCODIGA.zDs(x, y) - 5];
    }, 56, 22, { hole: (u, v) => notch((u - 0.5) * D.SPAN, v * D.H) }), MAT.guts, G_ARCH);
  }

  /* Crest Promenade blocks & 17 circular Oculi light-well courts */
  for (const oc of P.oculi) {
    if (notch(oc.x - oc.r, D.H - 1) || notch(oc.x + oc.r, D.H - 1)) continue;
    const well = lathe({ rFn: () => oc.r, H: 18, nu: 28, nv: 3 });
    well.translate(oc.x, D.H - 14, oc.z);
    DAM_WHITE.push(well);
    /* floor closing the sunken oculus court at D.H - 14 */
    DAM_CONC.push(gridSurface((u, v) => {
      const a = u * TAU, r = v * oc.r;
      return [oc.x + r * Math.cos(a), D.H - 14, oc.z + r * Math.sin(a)];
    }, 24, 2, { uS: 6, vS: 2 }));
  }
  for (let k = -26; k <= 26; k++) {
    const x = k * 25;
    if (notch(x - 12, D.H - 1) || notch(x + 12, D.H - 1)) continue;
    const zU = ARCODIGA.zUp(x), n = ARCODIGA.nDs(x);
    /* upstream & downstream promenade arcade blocks (keyed 1.4 m into the 360 m crest slab) */
    kput(BOXC(dd), [x, D.H + 5.6, zU + 6], qFacing(n), [20, 14, 12], null);
    kput(BOXC(dd), [x, D.H + 6.6, zU + 48], qFacing(n), [21, 16, 18], null);
    if (!ruin) {
      const lit = refurb ? U(810, k + 30, 1) < 0.78 : true;
      kput('cell', [x + n[0] * 9.4, D.H + 8, zU + 50 + n[1] * 9.4], qFacing(n), [12, 4.2, 1],
        lit ? (refurb ? WARM : CYAN).clone().multiplyScalar(0.75) : DEAD);
    }
  }

  meshMerged(DAM_CONC, CONC(dd), G_ARCH);
  if (DAM_WHITE.length) meshMerged(DAM_WHITE, refurb ? MAT.concrete : SHELL(dd), G_ARCH);

  /* ---- 4. Four Central Faceted Commercial / City Center Prows ---- */
  for (let pi = 0; pi < P.prows.length; pi++) {
    const pr = P.prows[pi], PGEO = [];
    const tiers = [
      [pr.y0, 216, pr.proj0],
      [216, 292, pr.proj0 * 0.84],
      [292, pr.y1, pr.proj1]
    ];
    for (let ti = 0; ti < tiers.length; ti++) {
      const yA = tiers[ti][0], yB = tiers[ti][1], pj = tiers[ti][2], hw = pr.w * (1 - ti * 0.08) * 0.5;
      /* 5-point faceted prow section keyed -24 m inside the dam mass so curved arch never leaves a gap */
      const secPt = (u, y) => {
        const zBack = ARCODIGA.zDs(pr.x, y) - 24, zTip = ARCODIGA.zDs(pr.x, y) + pj;
        const zSh = zTip - 18;
        const pts = [[-hw, zBack], [-hw, zSh], [0, zTip], [hw, zSh], [hw, zBack]];
        const q = ARCODIGA.clamp(u, 0, 1) * 4, i0 = Math.min(3, Math.floor(q)), f = q - i0;
        return [pr.x + ARCODIGA.lerp(pts[i0][0], pts[i0 + 1][0], f), y, ARCODIGA.lerp(pts[i0][1], pts[i0 + 1][1], f)];
      };
      PGEO.push(gridSurface((u, v) => secPt(u, ARCODIGA.lerp(yA, yB, v)), 16, 18, { uS: 20, vS: 16 }));
      /* closed terrace roof cap on each tier */
      PGEO.push(gridSurface((u, v) => {
        const pEdge = secPt(u, yB), zBack = ARCODIGA.zDs(pr.x, yB) - 24;
        return [ARCODIGA.lerp(pr.x, pEdge[0], v), yB, ARCODIGA.lerp(zBack, pEdge[2], v)];
      }, 16, 3, { uS: 12, vS: 8 }));
      /* rooftop garden beds on refurbished & intact setbacks */
      if (!ruin) {
        const zDeck = ARCODIGA.zDs(pr.x, yB) + pj - 14;
        kput('slab', [pr.x, yB + 0.35, zDeck], null, [hw * 1.1, 0.5, 14], new THREE.Color(refurb ? 0x456b34 : 0x3b6432));
      }
      /* Soleri hieroglyphic cellular windows on prow flanks */
      for (let yy = yA + 8; yy < yB - 6; yy += 10) {
        for (const sx of [-1, 1]) {
          const zMid = ARCODIGA.zDs(pr.x, yy) + pj * 0.48;
          const lit = ruin ? U(820, pi, yy) < 0.04 : refurb ? U(821, pi, yy + sx) < 0.72 : U(822, pi, yy + sx) < 0.82;
          kput('cell', [pr.x + sx * (hw + 0.35), yy, zMid], qFacing([sx, 0, 0.18]), [14, 4.2, 1],
            lit ? (refurb ? WARM : CYAN).clone().multiplyScalar(0.8) : DEAD);
        }
      }
    }
    meshMerged(PGEO, CONC(dd), G_ARCH);
  }

  /* ---- 5. Sixteen Radial Living-Working Buttress Ribs (Active Inner vs Sealed Dormant Outer in d=3) ---- */
  const R_ACTIVE = [], R_DORMANT = [];
  for (let ri = 0; ri < P.ribs.length; ri++) {
    const rb = P.ribs[ri], nx = rb.nx, nz = rb.nz, tx = nz, tz = -nx;
    const topY = ruin && ARCODIGA.inNotch(rb.x, D.H - 12) ? Math.min(rb.y1, D.NOTCH.sill - 8) : rb.y1;
    if (topY <= rb.y0 + 16) continue;
    const isDormant = refurb && rb.dormant;
    const targetArr = isDormant ? R_DORMANT : R_ACTIVE;
    const hw = rb.w * 0.5;

    const ribPt = (u, y) => {
      const pj = ARCODIGA.lerp(rb.proj0, rb.proj1, (y - rb.y0) / Math.max(1, rb.y1 - rb.y0));
      const zBase = ARCODIGA.zDs(rb.x, y);
      const back = -22, front = pj;
      const pts = [[-hw, back], [-hw, front], [hw, front], [hw, back]];
      const q = ARCODIGA.clamp(u, 0, 1) * 3, i0 = Math.min(2, Math.floor(q)), f = q - i0;
      const lat = ARCODIGA.lerp(pts[i0][0], pts[i0 + 1][0], f);
      const fwd = ARCODIGA.lerp(pts[i0][1], pts[i0 + 1][1], f);
      return [rb.x + tx * lat + nx * fwd, y, zBase + tz * lat + nz * fwd];
    };
    targetArr.push(gridSurface((u, v) => ribPt(u, ARCODIGA.lerp(rb.y0, topY, v)), 12, 24, { uS: 16, vS: 20 }));
    /* closed top cap & bottom soffit cap (for high-abutment outer ribs) */
    for (const yCap of [rb.y0, topY]) {
      targetArr.push(gridSurface((u, v) => {
        const pj = ARCODIGA.lerp(rb.proj0, rb.proj1, (yCap - rb.y0) / Math.max(1, rb.y1 - rb.y0));
        const zBase = ARCODIGA.zDs(rb.x, yCap);
        const lat = (u - 0.5) * rb.w, fwd = ARCODIGA.lerp(-22, pj, v);
        return [rb.x + tx * lat + nx * fwd, yCap, zBase + tz * lat + nz * fwd];
      }, 4, 4, { uS: 6, vS: 8 }));
    }

    /* Soleri clustered hieroglyphic cells on both side faces & nose */
    for (let yy = rb.y0 + 10; yy < topY - 8; yy += 12) {
      const pj = ARCODIGA.lerp(rb.proj0, rb.proj1, (yy - rb.y0) / Math.max(1, rb.y1 - rb.y0));
      const zBase = ARCODIGA.zDs(rb.x, yy);
      for (const sd of [-1, 1]) {
        const patch = Math.sin(yy * 0.07 + ri * 1.3) + U(830, ri, yy + sd);
        if (patch < 0.35) continue;
        const fwd = pj * 0.45, lat = sd * (hw + 0.35);
        const px = rb.x + tx * lat + nx * fwd, pz = zBase + tz * lat + nz * fwd;
        const lit = ruin ? U(831, ri, yy) < 0.02 : isDormant ? false : refurb ? U(832, ri, yy + sd) < 0.68 : U(833, ri, yy + sd) < 0.78;
        kput('cell', [px, yy, pz], qFacing([tx * sd, 0, tz * sd]), [11, 4.0, 1],
          lit ? (refurb ? WARM : CYAN).clone().multiplyScalar(0.75) : DEAD);
      }
    }

    /* Refurbished state visual bulkhead seal on the 12 dormant outer ribs */
    if (isDormant) {
      for (const by of [200, topY - 14]) {
        if (by < rb.y0 + 10) continue;
        const zThroat = ARCODIGA.zDs(rb.x, by) + 4;
        /* heavy dark alloy bulkhead gate sealing the dormant rib throat */
        kput('boxD', [rb.x + nx * 4, by, zThroat], qFacing([nx, 0, nz]), [rb.w + 3, 10, 4.5], null);
        kput('patchPlate', [rb.x + nx * 6.5, by, zThroat + nz * 2.4], qFacing([nx, 0, nz]), [rb.w * 0.7, 7.5, 1], null);
      }
    } else if (!ruin) {
      /* rooftop garden plot on active inner ribs */
      const zRoof = ARCODIGA.zDs(rb.x, topY) + rb.proj1 * 0.45;
      kput('slab', [rb.x + nx * rb.proj1 * 0.45, topY + 0.35, zRoof], qFacing([nx, 0, nz]), [rb.w * 0.76, 0.45, rb.proj1 * 0.65],
        new THREE.Color(refurb ? 0x486e35 : 0x3b6432));
    }

    /* Light-well skybridges between neighboring ribs on the same side */
    if (rb.j < D.RIBS.countPerSide) {
      const next = P.ribs.find(q => q.side === rb.side && q.j === rb.j + 1);
      if (next) {
        for (const sy of [156, 248]) {
          if (sy > topY - 12 || sy < Math.max(rb.y0, next.y0) + 8) continue;
          if (ruin && (ARCODIGA.inNotch(rb.x, sy) || ARCODIGA.inNotch(next.x, sy) || Math.abs((rb.x + next.x) * 0.5 - D.NOTCH.x) < 60)) continue;
          const pA = [rb.x + nx * 24, sy, ARCODIGA.zDs(rb.x, sy) + nz * 24];
          const pB = [next.x + next.nx * 24, sy, ARCODIGA.zDs(next.x, sy) + next.nz * 24];
          rbeam(BOXC(isDormant || ruin ? 1 : 0), pA, pB, 4.2, 6.5, null);
        }
      }
    }
  }
  if (R_ACTIVE.length) meshMerged(R_ACTIVE, CONC(dd), G_ARCH);
  if (R_DORMANT.length) meshMerged(R_DORMANT, CONC(1), G_ARCH);

  /* ---- 6. Horizontal Stiffening Wing, Upstream VTOL & Axial Spine, Toe Works ---- */
  adgWing(G_ARCH, P, d, U, land.floorY);
  adgVtolAndSpine(G_ARCH, P, d, U, land.bedY);
  adgWorks(G_ARCH, P, d, U);

  /* ---- 7. Ruin Seated Debris & Overgrowth (d === 1) ---- */
  if (ruin && RU) {
    for (const deb of RU.debris) {
      const q = qEuler(deb.rot[0], deb.rot[1], deb.rot[2]);
      adgSeatBox(BOXC(1), deb.x, deb.z, q, deb.s, land.floorY, null);
    }
    /* moss & vines along lower battered face and severed wing piers */
    for (let i = 0; i < 48; i++) {
      const vx = (U(850, i, 1) - 0.5) * 920, vy = 48 + 180 * U(851, i, 2);
      if (notch(vx, vy)) continue;
      kput('vine', [vx, vy, ARCODIGA.zDs(vx, vy) + 0.6], qEuler(0, U(852, i, 3) * TAU, 0), [2.2, 10 + 18 * U(853, i, 4), 2.2], null);
    }
  }

  /* ---- 8. Core/water records for this site ---- */
  if (!opts?.noWater && typeof ADG_WATER !== 'undefined' && typeof WATER !== 'undefined') {
    ADG_WATER.dam(d, { gx: gx, gz: gz, bedY: land.bedY, floorY: land.floorY, hull: ARCODIGA.HULL });
  }

  KOFF = [0, 0, 0];
  return G_ARCH;
}
buildArcodiga.hull = ARCODIGA.HULL;
