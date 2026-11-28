// ================================================================= ARCODIGA — site & organ builders (parts)
// Helper builders called by buildArcodiga (8av3-arcodiga-draw.js):
//   adgSeatBox       exact AABB ground-seating for rotated instanced debris (satisfies core/ruins lift/sink bounds)
//   adgLand          stratified 640 m canyon cliffs with highway tunnel mouths, reservoir silt bed, downstream park & 3 silt basins
//   adgWing          the 2 040 m Horizontal Stiffening Wing: hyperbolic saddle faces, ruled ribs, Highway prow & cliff portals
//   adgVtolAndSpine  upstream VTOL Airport T-tower & twin elevator shafts, crest bridge, and Axial City Center Spine
//   adgWorks         Power House (5 hydro chutes), Automated Industries vaults, and Linear City canal walls
// No top-level rng() calls (listed in DETERMINISTIC in build.py).

function adgBoxHalfExtents(q, s) {
  const m = new THREE.Matrix4().makeRotationFromQuaternion(q || new THREE.Quaternion());
  const e = m.elements, sx = s[0] * 0.5, sy = s[1] * 0.5, sz = s[2] * 0.5;
  return [
    Math.abs(e[0]) * sx + Math.abs(e[4]) * sy + Math.abs(e[8]) * sz,
    Math.abs(e[1]) * sx + Math.abs(e[5]) * sy + Math.abs(e[9]) * sz,
    Math.abs(e[2]) * sx + Math.abs(e[6]) * sy + Math.abs(e[10]) * sz
  ];
}

function adgSeatBox(itemName, x, z, q, s, groundFn, col) {
  const he = adgBoxHalfExtents(q, s);
  let gMin = groundFn(x, z);
  for (const dx of [-he[0], he[0]]) {
    for (const dz of [-he[2], he[2]]) {
      const g = groundFn(x + dx, z + dz);
      if (g < gMin) gMin = g;
    }
  }
  /* seat lowest AABB point 0.25 m into the lowest ground sample under its footprint (KRUINS: [-1.0, +0.3]) */
  kput(itemName, [x, gMin + he[1] - 0.25, z], q, s, col || null);
}

function adgLand(G_SITE, P, d, U, opts) {
  const D = P.dim, ruin = d === 1, refurb = d === 3;
  const hostGround = opts && typeof opts.ground === 'function' ? opts.ground : null;
  const ROCK = [], MUD = [], LAWN = [];

  /* reservoir bed upstream and valley floor downstream */
  const bedY = (x, z) => {
    if (hostGround) return hostGround(x + KOFF[0], z + KOFF[2]);
    const dUp = Math.max(0, ARCODIGA.HULL.zUp(x) - z);
    return 10 + 14 * ARCODIGA.clamp(dUp / 620, 0, 1) + 2.5 * Math.sin(x * 0.012) * Math.cos(z * 0.015);
  };
  const inCanal = (x, z) => {
    if (ruin) {
      const zToe = ARCODIGA.HULL.toe(D.NOTCH.x) + 24;
      if (z < zToe - 20) return false;
      const t = ARCODIGA.clamp((z - (zToe + 20)) / 820, 0, 1);
      const rx = ARCODIGA.lerp(D.NOTCH.x, -55, Math.pow(t, 0.85)) + 18 * Math.sin(t * 7.5);
      return Math.abs(x - rx) < 24;
    }
    if (z > 88 && z < 156 && Math.abs(x) < 152) return true;
    if (z >= 144 && z <= 426) {
      const t = (z - 144) / 282;
      for (const s of [-1, 1]) {
        const ax = s * ARCODIGA.lerp(116, 14, t);
        if (Math.abs(x - ax) < 15) return true;
      }
    }
    if (z >= 416 && z <= 990 && Math.abs(x) < 20) return true;
    return false;
  };
  const floorY = (x, z) => {
    if (hostGround) return hostGround(x + KOFF[0], z + KOFF[2]);
    if (z < ARCODIGA.HULL.toe(x) - 8) return 0;
    if (inCanal(x, z)) return 0.35;
    if (ruin) {
      const zToe = ARCODIGA.HULL.toe(D.NOTCH.x) + 24;
      const dx = x - ARCODIGA.lerp(D.NOTCH.x, -55, ARCODIGA.clamp((z - zToe) / 820, 0, 1));
      const bar = Math.abs(dx) < 85 && z > zToe ? 1.4 * Math.abs(Math.sin(dx * 0.08 + z * 0.02)) : 0;
      return 0.9 + bar;
    }
    /* gentle Soleri park steps down the valley */
    const step = z < 260 ? 2.2 : z < 560 ? 1.9 : 1.6;
    return step;
  };

  /* Isolated terrain PRNG sub-block: turning off demo cliffs via opts.noTerrain never shifts megastructure rng() */
  reseed(12790 + d);
  if (!opts?.noTerrain) {
    /* 1. Canyon rock masses (east & west, 640 m tall with faceted crags to 710 m and highway tunnel portals at z=210, y=176) */
    for (const s of [-1, 1]) {
      const faceX = (u, v) => {
        const z = ARCODIGA.lerp(D.CANYON_Z0, D.CANYON_Z1, u);
        const baseW = ARCODIGA.canyonHalfW(z);
        const strata = 8 * Math.sin(v * 38 + fbm(u * 5, 0.4, 2405 + s, 2) * 5);
        const facet = 28 * Math.pow(Math.abs(fbm(u * 16, v * 2.6, 2410 + s, 3) - 0.5) * 2, 1.55);
        const batter = 74 * Math.pow(v, 1.25);
        return s * (baseW + batter + strata + facet);
      };
      const rimY = u => D.CH + 58 * fbm(u * 9, 0.7, 2420 + s, 3);
      /* punch highway portal mouth at z = 210 (u ~ 0.55), y = 176 (v ~ 0.27) */
      const portalHole = (u, v) => {
        const z = ARCODIGA.lerp(D.CANYON_Z0, D.CANYON_Z1, u);
        const y = v * rimY(u);
        return Math.abs(z - D.WING.zC) < 22 && y > D.WING.yHwy - 10 && y < D.WING.yHwy + 14;
      };
      ROCK.push(gridSurface((u, v) => {
        const z = ARCODIGA.lerp(D.CANYON_Z0, D.CANYON_Z1, u);
        return [faceX(u, v), v * rimY(u), z];
      }, 112, 36, { uS: 48, vS: 18, hole: portalHole }));
      /* plateau top starting directly on the cliff's top edge (no overhang over reservoir) */
      const xOuter = s * 1240;
      ROCK.push(gridSurface((u, v) => {
        const z = ARCODIGA.lerp(D.CANYON_Z0, D.CANYON_Z1, u);
        const x0 = faceX(u, 1), y0 = rimY(u);
        return [ARCODIGA.lerp(x0, xOuter, v), y0 + v * 26 * fbm(u * 6, v * 5, 2430 + s, 2), z];
      }, 96, 10, { uS: 48, vS: 16 }));
      /* outer & end skirts closing the rock solid to y = 0 */
      ROCK.push(gridSurface((u, v) => {
        const z = ARCODIGA.lerp(D.CANYON_Z0, D.CANYON_Z1, u);
        return [xOuter, v * (rimY(u) + 12), z];
      }, 48, 4, { uS: 48, vS: 14 }));
      for (const uEnd of [0, 1]) {
        const zEnd = ARCODIGA.lerp(D.CANYON_Z0, D.CANYON_Z1, uEnd);
        ROCK.push(gridSurface((u, v) => {
          const x = ARCODIGA.lerp(faceX(uEnd, v), xOuter, u);
          return [x, v * rimY(uEnd), zEnd];
        }, 8, 12, { uS: 16, vS: 16 }));
      }
      /* concrete highway tunnel portal hood set into the cliff face */
      const uP = (D.WING.zC - D.CANYON_Z0) / (D.CANYON_Z1 - D.CANYON_Z0);
      const px = faceX(uP, D.WING.yHwy / D.CH);
      kput(BOXC(ruin ? 1 : 0), [px - s * 6, D.WING.yHwy + 12, D.WING.zC], null, [22, 6, 48], null);
      for (const zs of [-20, 20]) {
        kput(BOXC(ruin ? 1 : 0), [px - s * 6, D.WING.yHwy, D.WING.zC + zs], null, [22, 24, 6], null);
      }
    }
    meshMerged(ROCK, MAT.rock, G_SITE);

    /* 2. Upstream Reservoir Silt Bed */
    MUD.push(gridSurface((u, v) => {
      const x = (u - 0.5) * (D.SPAN + 80);
      const z = ARCODIGA.lerp(D.CANYON_Z0 + 20, ARCODIGA.zUp(x) + 4, v);
      return [x, bedY(x, z), z];
    }, 56, 28, { uS: 36, vS: 24 }));

    /* 3. Downstream Valley Park / Scour Bed & 3 Circular Pumped-Silt Basins */
    const valleyGeo = gridSurface((u, v) => {
      const z = ARCODIGA.lerp(-90, 1020, v);
      const hw = ARCODIGA.canyonHalfW(z) + 18;
      const x = (u - 0.5) * 2 * hw;
      const zMin = ARCODIGA.zDs(x, 0) - 6;
      const zz = Math.max(z, zMin);
      return [x, floorY(x, zz), zz];
    }, 84, 64, { uS: 36, vS: 32 });
    if (ruin) MUD.push(valleyGeo); else LAWN.push(valleyGeo);

    /* 3 circular pumped-silt farm basins (Soleri Plate 1 bottom-left) */
    for (let bi = 0; bi < P.siltBeds.length; bi++) {
      const sb = P.siltBeds[bi];
      const bund = lathe({ rFn: y => sb.r + 3 - y * 0.75, H: 3.6, nu: 40, nv: 3 });
      bund.translate(sb.x, 0.0, sb.z);
      MUD.push(bund);
      const bed = gridSurface((u, v) => {
        const a = u * TAU, r = ARCODIGA.lerp(sb.r * 0.33, sb.r - 1.5, v);
        return [sb.x + r * Math.cos(a), ruin ? 2.6 : 3.25, sb.z + r * Math.sin(a)];
      }, 36, 4, { uS: 16, vS: 4 });
      if (ruin) MUD.push(bed); else LAWN.push(bed);
      /* radial crop plots inside each irrigated silt ring when intact or refurbished */
      if (!ruin) {
        for (let k = 0; k < 16; k++) {
          const a = (k + 0.5) / 16 * TAU, rm = sb.r * 0.66;
          const col = new THREE.Color().setHSL(0.22 + 0.08 * U(701, bi, k), 0.42, refurb ? 0.32 : 0.28);
          kput('slab', [sb.x + rm * Math.cos(a), 3.45, sb.z + rm * Math.sin(a)], qEuler(0, -a, 0), [sb.r * 0.44, 0.38, 7.5], col);
        }
      }
    }

    /* park trees along downstream recreation terraces */
    const nTrees = ruin ? 28 : 72;
    for (let i = 0; i < nTrees; i++) {
      const tz = 170 + 780 * U(710, i, 1);
      const side = U(711, i, 2) < 0.5 ? -1 : 1;
      const tx = side * (64 + 340 * U(712, i, 3));
      if (inCanal(tx, tz)) continue;
      if (P.siltBeds.some(b => Math.hypot(tx - b.x, tz - b.z) < b.r + 8)) continue;
      const ty = floorY(tx, tz), th = 7 + 7 * U(713, i, 4);
      kput('plank', [tx, ty + th * 0.28, tz], null, [0.55, th * 0.62, 0.55], new THREE.Color(0x4a3525));
      kput('leafCard', [tx, ty + th * 0.65, tz], qEuler(0, U(714, i, 5) * TAU, 0), [th * 0.36, th * 0.34, th * 0.36],
        new THREE.Color().setHSL(0.27, ruin ? 0.25 : 0.42, ruin ? 0.22 : 0.28));
    }

    meshMerged(MUD, MAT.mud, G_SITE);
    if (LAWN.length) meshMerged(LAWN, MAT.lawn, G_SITE);
  }
  return { bedY: bedY, floorY: floorY };
}

function adgWing(G_ARCH, P, d, U, floorY) {
  const D = P.dim, WG = D.WING, ruin = d === 1, refurb = d === 3, dd = ruin ? 1 : 0;
  const WCONC = [], WWHITE = [];
  const holeWing = ruin ? (u, v) => {
    const x = (u - 0.5) * 2 * WG.halfSpan;
    return ARCODIGA.inWingBreak(x);
  } : null;

  /* Upper & lower concave hyperbolic saddle surfaces (front, rear, ridge cap, keel cap) */
  for (const half of [1, -1]) {
    /* front surface: from yHwy nose (v=0) to yTop or yBot crest (v=1) */
    WCONC.push(gridSurface((u, v) => {
      const x = (u - 0.5) * 2 * WG.halfSpan;
      const pr = ARCODIGA.wingProfile(x);
      const yLim = half > 0 ? pr.yTop : pr.yBot;
      const y = ARCODIGA.lerp(pr.yHwy, yLim, v);
      const zr = ARCODIGA.wingZAt(x, y);
      return [x, y, zr ? zr[1] : WG.zC + 18];
    }, 128, 18, { uS: 64, vS: 10, hole: holeWing }));
    /* rear surface */
    WCONC.push(gridSurface((u, v) => {
      const x = (u - 0.5) * 2 * WG.halfSpan;
      const pr = ARCODIGA.wingProfile(x);
      const yLim = half > 0 ? pr.yTop : pr.yBot;
      const y = ARCODIGA.lerp(pr.yHwy, yLim, v);
      const zr = ARCODIGA.wingZAt(x, y);
      return [x, y, zr ? zr[0] : WG.zC - 18];
    }, 128, 18, { uS: 64, vS: 10, hole: holeWing }));
    /* top ridge deck (half > 0) and bottom keel soffit cap (half < 0) closing the solid */
    WCONC.push(gridSurface((u, v) => {
      const x = (u - 0.5) * 2 * WG.halfSpan;
      const pr = ARCODIGA.wingProfile(x);
      const yLim = half > 0 ? pr.yTop : pr.yBot;
      const zr = ARCODIGA.wingZAt(x, yLim) || [WG.zC - 17, WG.zC + 17];
      return [x, yLim, ARCODIGA.lerp(zr[0], zr[1], v)];
    }, 128, 4, { uS: 64, vS: 3, hole: holeWing }));
  }

  /* End bulkheads inside the cliffs (x = +-halfSpan) and ruin tear bulkheads at wingBreak0 / wingBreak1 */
  const capXs = [-WG.halfSpan, WG.halfSpan];
  if (ruin) capXs.push(D.NOTCH.wingBreak0, D.NOTCH.wingBreak1);
  for (const cx of capXs) {
    const pr = ARCODIGA.wingProfile(cx);
    WCONC.push(gridSurface((u, v) => {
      const y = ARCODIGA.lerp(pr.yBot, pr.yTop, v);
      const zr = ARCODIGA.wingZAt(cx, y) || [WG.zC - 17, WG.zC + 17];
      return [cx, y, ARCODIGA.lerp(zr[0], zr[1], u)];
    }, 6, 16, { uS: 6, vS: 12 }));
  }

  /* Diagonal canyon-floor support legs under both outer wings (grounding both halves in KRUINS even when west span breaks) */
  for (const sx of [-620, -440, 440, 620]) {
    if (ruin && ARCODIGA.inWingBreak(sx)) continue;
    const pr = ARCODIGA.wingProfile(sx), gy = floorY(sx, WG.zC);
    const hLeg = pr.yBot - gy + 14;
    kput(BOXC(dd), [sx, gy + hLeg / 2 - 1, WG.zC], null, [26, hLeg + 2, 34], null);
  }

  /* Ruin projecting girder stubs at the severed wing gap */
  if (ruin) {
    for (const bx of [D.NOTCH.wingBreak0, D.NOTCH.wingBreak1]) {
      const dir = bx < -260 ? 1 : -1;
      for (let k = 0; k < 7; k++) {
        const yy = 152 + k * 12, L = 6 + 9 * U(720, k, dir + 2);
        kput(BOXC(1), [bx + dir * (L * 0.5 - 2), yy, WG.zC + (k % 2 ? 12 : -12)], null, [L, 1.6, 5.5], null);
      }
    }
  }

  /* Soleri's ruled structural ribs sweeping from the Highway nose up to yTop and down to yBot, plus the Highway slot */
  for (let i = -34; i <= 34; i++) {
    const x = i * 28;
    if (Math.abs(x) > WG.rockX + 20) continue;
    if (ruin && ARCODIGA.inWingBreak(x)) continue;
    const pr = ARCODIGA.wingProfile(x);
    /* highway prow nose canopy & road decks */
    WWHITE.push(gridSurface((u, v) => {
      const xx = x - 14 + u * 28;
      const p2 = ARCODIGA.wingProfile(xx);
      return [xx, WG.yHwy + (v === 0 ? -7 : 7), p2.zNose - (1 - Math.abs(v * 2 - 1)) * 4];
    }, 2, 1, { uS: 4, vS: 2 }));
    /* highway colonnade diamond pier */
    kput(BOXC(dd), [x, WG.yHwy, pr.zNose - 3], qEuler(0, Math.PI / 4, 0), [4.5, 13.5, 4.5], null);
    /* highway lighting strip (cyan intact, warm amber refurbished) */
    if (!ruin) {
      kput('strip', [x, WG.yHwy + 5.2, pr.zNose - 4.5], qEuler(0, Math.PI / 2, 0), [22, 0.9, 0.9], refurb ? WARM : CYAN);
    }
    /* Research (west) & Learning (east) ribbon windows along the saddle flanks */
    if (Math.abs(x) > 90 && Math.abs(x) < WG.rockX - 24) {
      for (let row = 0; row < 4; row++) {
        const wy = WG.yHwy + 16 + row * 18;
        if (wy > pr.yTop - 10) continue;
        const zr = ARCODIGA.wingZAt(x, wy);
        if (!zr) continue;
        const lit = ruin ? U(730, i + 40, row) < 0.04 : refurb ? (row < 2 && U(731, i + 40, row) < 0.68) : U(732, i + 40, row) < 0.76;
        kput('cell', [x, wy, zr[1] - 0.8], qFacing([0, 0.25, 1]), [12, 3.6, 1],
          lit ? (refurb ? WARM : CYAN).clone().multiplyScalar(0.75) : DEAD);
      }
    }
  }

  meshMerged(WCONC, CONC(dd), G_ARCH);
  if (WWHITE.length) meshMerged(WWHITE, refurb ? MAT.concrete : SHELL(dd), G_ARCH);
}

function adgVtolAndSpine(G_ARCH, P, d, U, bedY) {
  const D = P.dim, V = D.VTOL, SP = D.SPINE, ruin = d === 1, refurb = d === 3, dd = ruin ? 1 : 0;
  const SCONC = [], SWHITE = [];
  const by0 = Math.max(0, bedY(V.x, V.z) - 2);

  /* 1. Upstream VTOL Tower: 4 corner megapiers + twin central elevator cores from reservoir bed to yDeck0 (408 m) */
  const hs = V.shaftW / 2 - 7, hShaft = V.yDeck0 - by0;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      kput(BOXC(dd), [V.x + sx * hs, by0 + hShaft / 2, V.z + sz * hs], null, [14, hShaft, 14], null);
    }
    /* twin elevator shafts */
    const cyl = lathe({ rFn: () => 8.5, H: hShaft + 6, nu: 20, nv: 16 });
    cyl.translate(V.x + sx * 18, by0, V.z);
    SWHITE.push(cyl);
  }
  /* horizontal observation & tie decks every 36 m up the shaft, plus the causeway landing deck at bridgeY */
  for (let y = 48; y <= V.yDeck0 - 16; y += 36) {
    kput(BOXC(dd), [V.x, y, V.z], null, [V.shaftW, 3.2, V.shaftW], null);
    if (!ruin && (y > D.WL_FULL || y === 360)) {
      kput('strip', [V.x, y + 2.0, V.z + V.shaftW / 2 + 0.4], qEuler(0, Math.PI / 2, 0), [V.shaftW - 12, 0.8, 0.8], refurb ? WARM : CYAN);
    }
  }
  kput(BOXC(dd), [V.x, V.bridgeY - 2, V.z], null, [V.shaftW, 4.2, V.shaftW], null);

  /* 2. Cantilevered T-Head VTOL Airport Deck (136 x 136 m, y 408..432 m) */
  const hd = V.deckW / 2;
  /* soffit, fascia walls, and flight deck lid (with ruin tear on NW corner in d=1) */
  const vtolTear = (x, z) => ruin && x < -26 && z < V.z - 22;
  SCONC.push(gridSurface((u, v) => {
    const x = (u - 0.5) * V.deckW, z = V.z + (v - 0.5) * V.deckW;
    return [x, V.yDeck0, z];
  }, 16, 16, { uS: 20, vS: 20, hole: (u, v) => vtolTear((u - 0.5) * V.deckW, V.z + (v - 0.5) * V.deckW) }));
  SCONC.push(gridSurface((u, v) => {
    const x = (u - 0.5) * V.deckW, z = V.z + (v - 0.5) * V.deckW;
    return [x, V.yDeck1, z];
  }, 16, 16, { uS: 20, vS: 20, hole: (u, v) => vtolTear((u - 0.5) * V.deckW, V.z + (v - 0.5) * V.deckW) }));
  for (const side of [0, 1, 2, 3]) {
    SWHITE.push(gridSurface((u, v) => {
      const s = (u - 0.5) * V.deckW, y = ARCODIGA.lerp(V.yDeck0, V.yDeck1, v);
      const x = side < 2 ? s : (side === 2 ? -hd : hd);
      const z = side < 2 ? V.z + (side === 0 ? -hd : hd) : V.z + s;
      return [x, y, z];
    }, 16, 4, { uS: 20, vS: 4, hole: (u, v) => {
      const s = (u - 0.5) * V.deckW;
      const x = side < 2 ? s : (side === 2 ? -hd : hd);
      const z = side < 2 ? V.z + (side === 0 ? -hd : hd) : V.z + s;
      return vtolTear(x, z);
    } }));
  }
  /* diagonal cantilever struts from shaft (y 372) out to airport deck corners */
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      if (ruin && sx < 0 && sz < 0) continue;
      rbeam(BOXC(dd), [V.x + sx * hs, V.yDeck0 - 34, V.z + sz * hs], [V.x + sx * (hd - 10), V.yDeck0 + 1, V.z + sz * (hd - 10)], 4.5, 5.5, null);
    }
  }
  /* flight control penthouse & landing pad rings on yDeck1 */
  kput(BOXC(dd), [V.x, V.yDeck1 + 4.5, V.z + 32], null, [44, 9, 24], null);
  if (!ruin) {
    for (const px of [-34, 34]) {
      const pad = lathe({ rFn: () => 16, H: 0.6, nu: 28, nv: 1 });
      pad.translate(px, V.yDeck1 + 0.2, V.z - 18);
      SWHITE.push(pad);
      kput('strip', [px, V.yDeck1 + 0.9, V.z - 18], null, [18, 0.5, 1.2], refurb ? WARM : CYAN);
    }
  }

  /* 3. Causeway Bridge from VTOL Shaft (z -454) to Dam Crest (z -252) at y 360 m */
  const zBr0 = V.z + V.shaftW / 2 - 2, zBr1 = ARCODIGA.zUp(0) + 8;
  if (!ruin) {
    kput(BOXC(dd), [0, V.bridgeY - 2, (zBr0 + zBr1) / 2], null, [V.bridgeW, 5.5, zBr1 - zBr0], null);
    for (const sx of [-1, 1]) {
      kput(BOXC(dd), [sx * (V.bridgeW / 2 - 1), V.bridgeY + 1.8, (zBr0 + zBr1) / 2], null, [1.6, 2.4, zBr1 - zBr0], null);
    }
  } else {
    /* in the ruin, only the abutment stubs remain; the middle dropped */
    kput(BOXC(1), [0, V.bridgeY - 2, zBr0 + 20], qEuler(0.06, 0, 0), [V.bridgeW, 5.5, 40], null);
    kput(BOXC(1), [0, V.bridgeY - 2, zBr1 - 20], qEuler(-0.06, 0, 0), [V.bridgeW, 5.5, 40], null);
  }
  /* mid-reservoir pier supporting both the causeway and the submerged axial spine */
  const zMidPier = (zBr0 + zBr1) / 2, py0 = Math.max(0, bedY(0, zMidPier) - 2);
  const pTop = ruin ? SP.y1 + 6 : V.bridgeY - 3;
  kput(BOXC(dd), [0, py0 + (pTop - py0) / 2, zMidPier], null, [24, pTop - py0, 22], null);

  /* 4. Axial City Center & Commercial Spine (x -44..+44, y 152..204, z -452..+188) */
  const sw = SP.w / 2, sh = SP.y1 - SP.y0, scy = (SP.y0 + SP.y1) / 2;
  /* closed vaulted tube from VTOL shaft straight through the dam into the Stiffening Wing Hub */
  SCONC.push(gridSurface((u, v) => {
    const a = u * Math.PI, z = ARCODIGA.lerp(SP.z0, SP.z1, v);
    return [-Math.cos(a) * sw, SP.y0 + sh * (0.55 + 0.45 * Math.sin(a)), z];
  }, 20, 28, { uS: 20, vS: 44 }));
  /* spine underside floor & side walls */
  SCONC.push(gridSurface((u, v) => [(u - 0.5) * SP.w, SP.y0, ARCODIGA.lerp(SP.z0, SP.z1, v)], 8, 28, { uS: 12, vS: 44 }));
  for (const sx of [-1, 1]) {
    SCONC.push(gridSurface((u, v) => [sx * sw, SP.y0 + v * sh * 0.55, ARCODIGA.lerp(SP.z0, SP.z1, u)], 28, 6, { uS: 44, vS: 6 }));
  }
  /* rhythmic exterior ribs and glazed arcade bays along the downstream courtyard section (z -120..+180) */
  for (let z = -110; z <= 170; z += 20) {
    kput(BOXC(dd), [0, scy - 2, z], null, [SP.w + 5, sh * 0.62, 3.2], null);
    for (const sx of [-1, 1]) {
      const lit = ruin ? false : refurb ? U(740, z + 200, sx + 2) < 0.8 : true;
      kput('cell', [sx * (sw + 0.6), SP.y0 + 14, z + 10], qFacing([sx, 0, 0]), [11, 8, 1],
        lit ? (refurb ? WARM : CYAN).clone().multiplyScalar(0.8) : DEAD);
    }
  }
  /* courtyard pier under downstream spine between dam toe and wing hub */
  kput(BOXC(dd), [0, (SP.y0 + 44) / 2, 72], null, [34, SP.y0 - 42, 28], null);

  meshMerged(SCONC, CONC(dd), G_ARCH);
  if (SWHITE.length) meshMerged(SWHITE, refurb ? MAT.concrete : SHELL(dd), G_ARCH);
}

function adgWorks(G_ARCH, P, d, U) {
  const D = P.dim, PW = D.POWER, IN = D.IND, ruin = d === 1, refurb = d === 3, dd = ruin ? 1 : 0;
  /* 1. Central Power House at the dam's toe */
  kput(BOXC(dd), [0, PW.h / 2, (PW.z0 + PW.z1) / 2], null, [PW.w, PW.h, PW.z1 - PW.z0], null);
  /* 5 recessed penstock/spillway tailrace portals */
  for (let i = 0; i < PW.chutes.length; i++) {
    const cx = PW.chutes[i];
    kput('archOpen', [cx, 12, PW.z1 + 0.4], qFacing([0, 0, 1]), [1.6, 1.4, 1.8], null);
    /* roof transformer gantries (copper busbars in intact & refurbished) */
    kput(BOXC(dd), [cx, PW.h + 5, 10], null, [18, 10, 26], null);
    if (!ruin) {
      const activeChute = !refurb || i % 2 === 0;
      if (activeChute) kput('strip', [cx, PW.h + 10.6, 10], null, [14, 0.8, 1.2], refurb ? WARM : CYAN);
    }
  }

  /* 2. Flanking Automated Industries Vaults (West & East) */
  for (const sx of [-1, 1]) {
    const cx = sx * (IN.xIn + IN.xOut) / 2, w = IN.xOut - IN.xIn, dp = IN.z1 - IN.z0, cz = (IN.z0 + IN.z1) / 2;
    kput(BOXC(dd), [cx, IN.h / 2, cz], null, [w, IN.h, dp], null);
    /* sawtooth skylight bays on the industrial roofs */
    for (let k = -2; k <= 2; k++) {
      kput(BOXC(dd), [cx + k * 38, IN.h + 3.5, cz], qEuler(0.18, 0, 0), [28, 7, dp * 0.82], null);
    }
  }

  /* 3. Downstream Y-Waterway & Linear City embankment walls */
  if (!ruin) {
    for (let z = 430; z <= 950; z += 52) {
      for (const sx of [-1, 1]) {
        kput(BOXC(dd), [sx * 24, 3.2, z], null, [5.5, 6.4, 46], null);
        if (z < 760) {
          /* Linear City terrace pavilions flanking the axial waterway */
          kput(BOXC(dd), [sx * 46, 5.5, z], null, [22, 11, 32], null);
        }
      }
    }
  }
}
