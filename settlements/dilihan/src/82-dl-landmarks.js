// ================================================================= DILIHAN — Bespoke Landmarks, Govpalace,KFURN & Hinterland Works
// [draw] Restores dual-kit socket dispatch (JJ.cur -> jjSock*, VERN.cur -> DL_ANC_SOCK), sets up indexed KFURN catalog
// furnishing (iziz, hykkousoi, republican, generic), and registers all 11 Dilihan site-specific builders plus RES_ORE outcrops.

/* 1. Dual-kit socket & beam dispatcher so both JJ.place (fillSockets) and VERN.place (vBeam) execute without conflict */
(function () {
  const jjS = {
    beam: typeof jjSockBeam === 'function' ? jjSockBeam : null,
    box: typeof jjSockBox === 'function' ? jjSockBox : null,
    quad: typeof jjSockQuad === 'function' ? jjSockQuad : null,
    plane4: typeof jjSockPlane4 === 'function' ? jjSockPlane4 : null,
    decal: typeof jjSockDecal === 'function' ? jjSockDecal : null,
    poly: typeof jjSockPoly === 'function' ? jjSockPoly : null
  };
  const anc = typeof DL_ANC_SOCK !== 'undefined' ? DL_ANC_SOCK : {};
  ['beam', 'box', 'quad', 'plane4', 'decal', 'poly'].forEach(function (k) {
    const jf = jjS[k];
    const af = anc[k];
    if (!jf && !af) return;
    globalThis[k] = function () {
      const fn = (typeof JJ !== 'undefined' && JJ.cur) ? (jf || af) : (af || jf);
      return fn.apply(this, arguments);
    };
  });
})();

/* 2. Indexed catalog furniture glue on core/furnish (KFURN + KratorFurniture, PLAN.md §0 & §5.4) */
const DL_FURN = (function () {
  if (typeof KFURN === 'undefined' || typeof KratorFurniture === 'undefined') {
    return {
      on: false,
      placed: [],
      missing: {},
      placeLocal: function () { return null; },
      flush: function () { return null; },
      summary: function () { return { on: false, placed: 0, missing: {} }; }
    };
  }
  KratorFurniture.setDetail(0.5);
  const T = (KTAGS.page = KTAGS.page || KTAGS.create({ build: 'dilihan' }));
  const R = KFURN.create(Object.assign(
    typeof KFURN.flags === 'function' ? KFURN.flags(false) : { on: true, interiorsOn: false },
    {
      catalog: KFURN.catalogOf(KratorFurniture),
      interiors: typeof KratorInteriors !== 'undefined' ? KratorInteriors : null,
      tags: T,
      seed: function (o, ctx, reg) { return reg.placed.length + 7441; },
      finish: function (rec) {
        rec.x = Math.round(rec.x * 1000) / 1000;
        rec.y = Math.round(rec.y * 1000) / 1000;
        rec.z = Math.round(rec.z * 1000) / 1000;
        rec.ry = Math.round(rec.ry * 10000) / 10000;
      },
      draw: function (rec, ctx) {
        const w = ctx && typeof ctx.wealth === 'number' ? ctx.wealth : 0.75;
        const b = KFURN.drawRec(R, rec, w);
        if (b && b.error && typeof reportErr === 'function') {
          reportErr('DL_FURN ' + rec.key + ' ' + b.error);
        }
      }
    }
  ));
  KFURN.useBatch(R, KratorFurniture, typeof KratorInteriors !== 'undefined' ? KratorInteriors : null, { indexed: true });

  function pickKey(cands) {
    for (let i = 0; i < cands.length; i++) {
      if (KratorFurniture.has(cands[i])) return cands[i];
    }
    return null;
  }

  function placeLocal(cands, lx, ly, lz, lry, opts) {
    const key = Array.isArray(cands) ? pickKey(cands) : (KratorFurniture.has(cands) ? cands : null);
    if (!key) return null;
    const c = (typeof JJ !== 'undefined' && JJ.cur) ? JJ.cur : ((typeof VERN !== 'undefined' && VERN.cur) ? VERN.cur : null);
    if (!c) return null;
    const sc = c.scale == null ? (c.o && c.o.scale != null ? c.o.scale : 1) : c.scale;
    const ry0 = c.ry == null ? 0 : c.ry;
    const p = loc(c.x, c.z, lx * sc, lz * sc, ry0);
    const wy = (c.o && c.o.y != null ? c.o.y : 0) + ly * sc;
    const wry = ry0 + (lry == null ? 0 : lry);
    const bId = (c.o && c.o.id) ? c.o.id : c.D.key;
    const wNum = opts && opts.wealth != null ? opts.wealth : 0.78;
    return R.place(key, p[0], wy, p[1], wry, opts || {}, [lx, ly, lz, lry == null ? 0 : lry], {
      building: bId,
      wealth: wNum
    });
  }

  function flush(targetScene) {
    if (!R.on || !R.batch || R.group) return R.group;
    const g = R.batch.flush(targetScene);
    R.group = g;
    g.name = 'dl-catalog-furniture';
    g.userData.inspectLabel = 'Dilihan Catalog Furniture (Iziz, Hykkousoi, Republican)';
    g.userData.probeSkip = true;
    g.traverse(function (m) {
      if (!m.isMesh || !m.geometry) return;
      KFURN.linearColours(m.geometry);
      m.geometry.computeBoundingSphere();
      m.frustumCulled = false;
      m.userData.probeSkip = true;
      if (m.material && m.material.map) {
        m.material.map.encoding = THREE.sRGBEncoding;
        m.material.map.needsUpdate = true;
      }
    });
    window._furniture = R.summary();
    return g;
  }

  R.pickKey = pickKey;
  R.placeLocal = placeLocal;
  R.flush = flush;
  return R;
})();

/* 3. Dilihan site-specific landmark & hinterland builders (seeds 9801-9899) */
const DL_LANDMARKS = (function () {
  const TAU2 = Math.PI * 2;
  const DLC = {
    izizOrange: 0xe07a2a,
    izizWhite: 0xeee8dc,
    izizCream: 0xe2d8c4,
    marble: 0xf1ece2,
    granite: 0x8e857b,
    graniteDark: 0x5c554e,
    hykLimestone: 0xe8e0cf,
    hykTeal: 0x267c85,
    hykOchre: 0xd49b38,
    cassiterite: 0x4f443d,
    magnetite: 0x363238,
    malachite: 0x2f8f6d,
    potashRose: 0xdca08e,
    haliteWhite: 0xf3efe8,
    paddyGreen: 0x4b8b3b,
    taroLeaf: 0x2f6d34,
    emmerGold: 0xcfa446,
    oliveFoliage: 0x627347,
    indigoLeaf: 0x355c52,
    cottonBoll: 0xf0ece2,
    ember: 0xff8428
  };

  if (!KIT.defs.dlEmber) {
    const emMat = new THREE.MeshBasicMaterial({ color: 0xff8c2e });
    kdef('dlEmber', VBOX, emMat);
    kdef('dlEmberBall', VBALL, emMat);
  }
  if (!KIT.defs.dlMirror) {
    const mirMat = new THREE.MeshStandardMaterial({ color: 0xf6eed8, roughness: 0.08, metalness: 0.92 });
    kdef('dlMirror', new THREE.CylinderGeometry(1, 1, 0.12, 24), mirMat);
  }
  if (!KIT.defs.dlTealTile) {
    kdef('dlTealTile', VBOX, MAT.plaster);
  }

  /* Blueprint coordinate map for dl_gov_palace (VASSAL-KITS.md §3 & palace/BLUEPRINT.md):
     u runs -36 (forecourt gate) to +38 (rear wall), v across (+v left walking in); local +z is front, so x = -v, z = 1 - u */
  function palPt(u, v) {
    return [-v, 1 - u];
  }

  function palBox(u0, u1, v0, v1, y0, h, matKey, tint) {
    const cx = -((v0 + v1) * 0.5);
    const cz = 1 - ((u0 + u1) * 0.5);
    const w = Math.abs(v1 - v0);
    const d = Math.abs(u1 - u0);
    jjBox(cx, y0 + h * 0.5, cz, w, h, d, matKey, tint, 0);
  }

  function buildPalacePavilion(u, v, rM, storeys, domeKind, hasLantern, isKitchen, orangeC) {
    const p = palPt(u, v);
    const px = p[0];
    const pz = p[1];
    const T = 1.2;
    const sh0 = 5.2;
    const sh1 = 4.3;
    const hDrum = storeys > 1 ? (sh0 + sh1) : sh0;
    const yTop = T + hDrum;

    /* Banded red-and-yellow brick cylinder on contact-marble base ring */
    jjCylinder(px, T + 0.28, pz, rM * 1.05, 0.56, 'marble', undefined, 32);
    jjCylinder(px, T + 0.56 + (hDrum - 0.56) * 0.5, pz, rM, hDrum - 0.56, 'bandBrick', undefined, 32);
    jjCylinder(px, yTop - 0.22, pz, rM * 1.06, 0.44, 'marble', undefined, 32);
    if (storeys > 1) {
      jjCylinder(px, T + sh0, pz, rM * 1.04, 0.26, 'brickYellow', undefined, 32);
    }

    /* Arcaded window bays around each storey with thin Iziz-orange window reveals */
    for (let s = 0; s < storeys; s++) {
      const yBase = T + (s === 0 ? 1.15 : sh0 + 0.85);
      const winH = s === 0 ? 2.7 : 2.2;
      const nWin = Math.max(6, Math.round((TAU2 * rM) / 3.6));
      for (let k = 0; k < nWin; k++) {
        const a = (k + 0.5) * TAU2 / nWin;
        const wx = px + Math.sin(a) * (rM + 0.04);
        const wz = pz + Math.cos(a) * (rM + 0.04);
        /* Thin Iziz-orange arch/window reveal liner (PLAN.md §2.3: orange restricted to reveals/gate/banners) */
        vB('vPlaster', wx, yBase - 0.08, wz, 1.16, winH + 0.18, 0.12, a, orangeC);
        jjBox(wx, yBase + winH * 0.5, wz, 0.92, winH - 0.06, 0.16, s === 1 ? 'glass' : 'dark', undefined, a);
      }
    }

    /* Chhatri dome: ribbed slate on the two 14 m pavilions, terracotta on the smaller five */
    const dShape = domeKind === 'slate' ? 'ribbed' : 'hemi';
    jjDome(px, yTop, pz, rM * 0.94, { kind: domeKind, shape: dShape, ribs: domeKind === 'slate' });

    if (isKitchen) {
      /* Round brick kitchen: vented cupola + clustered patterned Tudor brick chimney stack */
      jjCylinder(px, yTop + rM * 0.92, pz, 0.85, 1.35, 'brickDeep', undefined, 16);
      jjChimneyStack(px + rM * 0.52, yTop - 0.3, pz - rM * 0.35, {
        n: 4,
        h: 3.4,
        r: 0.32,
        patterns: ['spiral', 'diamond', 'chevron', 'fleur'],
        relief: true
      });
    } else if (hasLantern) {
      /* Small octagonal chhatri lantern on Council & Chancery domes */
      const ly = yTop + rM * 0.90;
      jjCylinder(px, ly + 0.75, pz, 1.25, 1.5, 'marble', undefined, 16);
      jjCylinder(px, ly + 0.75, pz, 1.02, 1.1, 'glass', undefined, 16);
      jjDome(px, ly + 1.5, pz, 1.22, { kind: 'gold', shape: 'onion' });
    }
  }

  /* ----------------------------------------------------------------
   * ZONE 2: The Governor's Palace of Dilihan (dl_gov_palace, 62 x 76 m, h 28 m)
   * Massed on VASSAL-KITS.md §3 & palace/BLUEPRINT.md in Jimjam red-and-yellow brick,
   * contact-marble podium, patterned shafts, gold onion dome w/ Cut signal room, 7 chhatris,
   * Iziz orange restricted strictly to banners, forecourt gate, and window/arch reveals.
   * ---------------------------------------------------------------- */
  function buildDlGovPalace(G, o) {
    const v = o && o.v != null ? o.v : 0;
    reseed(9801 + (v | 0));
    const orangeC = vC(DLC.izizOrange);
    const T = 1.2;
    const G1 = 5.5;
    const U1 = 4.5;
    const R1 = T + G1;
    const R2 = R1 + U1;

    /* 1. Walled 70 x 56 m grounds (u = -36..+38, v = -30..+30) in banded brick with contact-marble coping */
    for (const s of [-1, 1]) {
      palBox(-36.4, -35.6, s * 5.6, s * 30.0, 0, 3.2, 'bandBrick');
      palBox(-36.5, -35.5, s * 5.6, s * 30.1, 3.2, 0.24, 'marble');
      palBox(-36.0, 38.0, s * 29.6, s * 30.4, 0, 3.2, 'bandBrick');
      palBox(-36.1, 38.1, s * 29.5, s * 30.5, 3.2, 0.24, 'marble');
    }
    /* Rear wall with cart gate at v = -20.5..-13.5 */
    palBox(37.6, 38.4, -30.0, -20.5, 0, 3.2, 'bandBrick');
    palBox(37.6, 38.4, -13.5, 30.0, 0, 3.2, 'bandBrick');
    palBox(37.5, 38.5, -30.1, -20.5, 3.2, 0.24, 'marble');
    palBox(37.5, 38.5, -13.5, 30.1, 3.2, 0.24, 'marble');

    /* Forecourt Gate at u = -36 with Iziz-orange gate trim & four Izani orange banners */
    for (const s of [-1, 1]) {
      const gp = palPt(-36.0, s * 5.4);
      jjBox(gp[0], 2.7, gp[1], 1.8, 5.4, 1.8, 'bandBrick');
      jjBox(gp[0], 5.55, gp[1], 2.15, 0.35, 2.15, 'marble');
      vB('vPlaster', gp[0], 4.65, gp[1], 1.92, 0.42, 1.92, 0, orangeC);
      const bp = palPt(-34.2, s * 8.2);
      vnBannerPole(bp[0], 0, bp[1], 0, 8.2, orangeC);
      const bp2 = palPt(-15.2, s * 10.6);
      vnBannerPole(bp2[0], T, bp2[1], 0, 7.6, orangeC);
      const lp = palPt(-24.0, s * 8.5);
      vnLampPost(lp[0], 0, lp[1], 3.8);
    }
    /* Gate bridge lintel with Iziz-orange reveal band */
    const gMid = palPt(-36.0, 0);
    jjBox(gMid[0], 5.1, gMid[1], 12.6, 0.95, 1.5, 'marble');
    vB('vPlaster', gMid[0], 4.42, gMid[1], 9.2, 0.28, 1.58, 0, orangeC);

    /* Forecourt contact-marble ceremonial walk & sunray medallion */
    palBox(-35.4, -12.5, -5.2, 5.2, 0, 0.10, 'marble');
    const fcCenter = palPt(-24.0, 0);
    jjRoundPlaza(fcCenter[0], 0.02, fcCenter[1], 6.4, { raised: false, inlay: true });

    /* 2. Raised 1.2 m contact-marble podium (B undercroft grilles + broad axial marble stair) */
    palBox(-8.5, 34.6, -25.6, 25.6, 0, T, 'marble');
    for (const s of [-1, 1]) {
      palBox(-14.3, -8.5, s * 11.7, s * 25.6, 0, T, 'marble');
      /* Undercroft barrel-vaulted cellar grilles along podium flanks */
      for (let uk = -2; uk <= 26; uk += 7) {
        const vp = palPt(uk, s * 25.62);
        jjBox(vp[0], 0.55, vp[1], 0.16, 0.55, 1.4, 'dark');
      }
    }
    const stP = palPt(-11.2, 0);
    jjStairs(stP[0], 0, stP[1], 11.2, 5.4, T, 7, 0, { mat: 'marble' });

    /* 3. Two-storey 36 x 24 m Hall Block (u = -4..+24, v = -18..+18) with open ground portal into Audience Hall */
    /* Ground & upper perimeter walls in banded red-and-yellow brick + contact-marble string courses */
    palBox(23.2, 24.2, -18.0, 18.0, T, G1 + U1, 'bandBrick');
    for (const s of [-1, 1]) {
      palBox(-4.2, 24.2, s * 17.2, s * 18.2, T, G1 + U1, 'bandBrick');
      /* Projecting upper jharokha marble balconies on East & West flanks */
      for (const uj of [4.0, 16.0]) {
        const jp = palPt(uj, s * 18.55);
        jjBox(jp[0], R1 + 0.15, jp[1], 1.2, 0.36, 3.2, 'marble');
        jjBox(jp[0], R1 + 1.65, jp[1], 1.0, 2.5, 2.8, 'bandBrick');
        vB('vPlaster', jp[0], R1 + 0.65, jp[1], 1.08, 1.9, 2.1, 0, orangeC);
        jjBox(jp[0], R1 + 1.6, jp[1], 1.14, 1.7, 1.8, 'glass');
        jjBox(jp[0], R1 + 3.05, jp[1], 1.35, 0.32, 3.3, 'marble');
      }
    }
    /* Front wall behind loggia (open 5.4 m central portal so sunray inlay & throne are visible from forecourt) */
    palBox(-4.4, -3.5, -18.0, -2.8, T, G1, 'bandBrick');
    palBox(-4.4, -3.5, 2.8, 18.0, T, G1, 'bandBrick');
    palBox(-4.4, -3.5, -18.0, 18.0, R1, U1, 'bandBrick');
    /* Interior Audience Hall floor with sunray marble inlay & upper roof deck */
    palBox(-4.0, 23.6, -17.4, 17.4, T, 0.14, 'marble');
    const audP = palPt(10.0, 0);
    jjRoundPlaza(audP[0], T + 0.04, audP[1], 6.8, { raised: false, inlay: true });
    palBox(-8.6, 24.4, -18.4, 18.4, R1 - 0.18, 0.34, 'marble');
    palBox(-8.8, 24.6, -18.6, 18.6, R2, 0.42, 'marble');
    palBox(-8.5, 24.3, -18.3, 18.3, R2 + 0.42, 0.55, 'brickYellow');

    /* Ground Patterned-Shaft Loggia & Upper Gallery at u = -8.5 across v = -11.7..+11.7 */
    const nBays = 6;
    const bayW = 23.4 / nBays;
    const shaftPats = ['diamond', 'spiral', 'chevron', 'fleur', 'ogee', 'tracery'];
    for (let k = 0; k <= nBays; k++) {
      const vk = -11.7 + k * bayW;
      const cp = palPt(-8.5, vk);
      jjColumn(cp[0], T, cp[1], 0.44, G1 - 0.2, { pattern: shaftPats[k % shaftPats.length], lattice: true });
      jjColumn(cp[0], R1 + 0.16, cp[1], 0.36, U1 - 0.24, { pattern: shaftPats[(k + 2) % shaftPats.length] });
    }
    for (let k = 0; k < nBays; k++) {
      const vk = -11.7 + (k + 0.5) * bayW;
      const ap = palPt(-8.5, vk);
      jjArch(ap[0], T + 3.4, ap[1], bayW - 0.16, 1.95, 0, { depth: 0.95 });
      vB('vPlaster', ap[0], T + 3.42, ap[1], bayW - 0.62, 0.16, 1.02, 0, orangeC);
      jjArch(ap[0], R1 + 2.6, ap[1], bayW - 0.16, 1.72, 0, { depth: 0.85 });
      vB('vPlaster', ap[0], R1 + 2.62, ap[1], bayW - 0.68, 0.14, 0.92, 0, orangeC);
    }
    /* Upper & side arcade windows with thin Iziz-orange reveals */
    for (const s of [-1, 1]) {
      for (let uw = -1; uw <= 21; uw += 5.5) {
        if (Math.abs(uw - 4.0) < 1.5 || Math.abs(uw - 16.0) < 1.5) continue;
        const wp = palPt(uw, s * 18.24);
        vB('vPlaster', wp[0], T + 1.5, wp[1], 0.14, 2.5, 1.48, 0, orangeC);
        jjBox(wp[0], T + 2.75, wp[1], 0.18, 2.25, 1.22, 'dark');
        vB('vPlaster', wp[0], R1 + 1.1, wp[1], 0.14, 2.2, 1.42, 0, orangeC);
        jjBox(wp[0], R1 + 2.2, wp[1], 0.18, 1.95, 1.16, 'glass');
      }
    }

    /* 4. Great Gold Onion Dome on 16-Window Contact-Marble Drum + Cut Signal-Room Lantern (u = 10, v = 0) */
    jjCylinder(audP[0], R2 + 0.45, audP[1], 7.6, 0.65, 'marble', undefined, 32);
    jjCylinder(audP[0], R2 + 3.25, audP[1], 7.2, 5.1, 'bandBrick', undefined, 32);
    jjCylinder(audP[0], R2 + 5.85, audP[1], 7.55, 0.45, 'marble', undefined, 32);
    for (let k = 0; k < 16; k++) {
      const a = (k + 0.5) * TAU2 / 16;
      const wx = audP[0] + Math.sin(a) * 7.26;
      const wz = audP[1] + Math.cos(a) * 7.26;
      jjBox(wx, R2 + 3.25, wz, 1.24, 3.35, 0.22, 'marble', undefined, a);
      vB('vPlaster', wx, R2 + 1.72, wz, 0.96, 3.05, 0.26, a, orangeC);
      jjBox(wx, R2 + 3.25, wz, 0.78, 2.85, 0.30, 'glass', undefined, a);
    }
    /* Gold onion dome (y = 17.2..24.6 m) + Cut Signal-Room Lantern (y = 24.0..27.4 m) */
    jjDome(audP[0], R2 + 6.05, audP[1], 6.85, { kind: 'gold', shape: 'onion' });
    jjCylinder(audP[0], 24.35, audP[1], 2.45, 0.42, 'marble', undefined, 24);
    jjCylinder(audP[0], 25.55, audP[1], 2.15, 2.05, 'glass', undefined, 16);
    for (let k = 0; k < 8; k++) {
      const a = k * TAU2 / 8;
      jjCylinder(audP[0] + Math.sin(a) * 2.18, 25.55, audP[1] + Math.cos(a) * 2.18, 0.14, 2.1, 'gold', undefined, 8);
    }
    /* Heliograph signal mirror aimed north down the Cut highway toward Jimjam */
    kput('dlMirror', [audP[0], 25.55, audP[1] + 1.45], qEuler(Math.PI * 0.46, 0, 0), [0.68, 1, 0.68], null);
    jjCylinder(audP[0], 26.72, audP[1], 2.38, 0.32, 'marble', undefined, 24);
    jjDome(audP[0], 26.88, audP[1], 1.95, { kind: 'gold', shape: 'onion' });

    /* 5. All Seven Round Chhatri Pavilions (VASSAL-KITS.md §3 & palace/BLUEPRINT.md) */
    buildPalacePavilion(-8, 18, 6.8, 2, 'slate', true, false, orangeC);      /* 1. Veterans' Council Hall */
    buildPalacePavilion(-8, -18, 6.8, 2, 'slate', true, false, orangeC);     /* 2. Chancery & Quiet-Copy Assay */
    buildPalacePavilion(24, -18, 5.3, 2, 'terracotta', false, false, orangeC);/* 3. Private Dining */
    buildPalacePavilion(24, 18, 5.3, 2, 'terracotta', false, false, orangeC); /* 4. Family Salon */
    buildPalacePavilion(8, -22, 3.9, 2, 'terracotta', false, false, orangeC); /* 5. Guard & Orderlies */
    buildPalacePavilion(8, 22, 3.9, 1, 'terracotta', false, false, orangeC);  /* 6. Household Shrine */
    buildPalacePavilion(31, -6, 3.9, 1, 'terracotta', false, true, orangeC);  /* 7. Round Kitchen w/ Tudor stack */

    /* 6. Straight outside contact-marble stair on brick stringer (Chancery flank: u = 1.35, v = -28..-19.5) */
    const osLand = palPt(1.35, -19.2);
    jjBox(osLand[0], R1 * 0.5, osLand[1], 3.2, R1, 3.2, 'bandBrick');
    jjBox(osLand[0], R1 + 0.14, osLand[1], 3.5, 0.28, 3.5, 'marble');
    const osRun = palPt(1.35, -24.2);
    jjBox(osRun[0], R1 * 0.28, osRun[1], 7.4, R1 * 0.56, 2.4, 'bandBrick');
    jjStairs(osRun[0], 0, osRun[1], 2.5, 7.6, R1, 18, -Math.PI * 0.5, { mat: 'marble' });

    /* 7. Catalog furniture from kits/catalog/iziz (KFURN indexed batch, PLAN.md §5.4) */
    const thrP = palPt(15.5, 0);
    DL_FURN.placeLocal(['iziz_court_throne', 'iziz_common_chair'], thrP[0], T + 0.14, thrP[1], 0, { setting: 'indoor', wealth: 0.95 });
    const tblP = palPt(9.5, 0);
    DL_FURN.placeLocal(['iziz_court_table', 'iziz_common_counter'], tblP[0], T + 0.14, tblP[1], 0, { setting: 'indoor', wealth: 0.92 });
    for (const sv of [-1, 1]) {
      const bnP = palPt(14.5, sv * 4.2);
      DL_FURN.placeLocal(['iziz_court_banner'], bnP[0], T + 0.14, bnP[1], 0, { setting: 'indoor', wealth: 0.92 });
      const sbP = palPt(-7.5, sv * 16.5);
      DL_FURN.placeLocal(['iziz_court_strongbox', 'iziz_court_cabinet'], sbP[0], T + 0.14, sbP[1], 0, { setting: 'indoor', wealth: 0.88 });
      const dkP = palPt(-8.0, sv * 19.2);
      DL_FURN.placeLocal(['iziz_common_desk', 'iziz_court_table'], dkP[0], T + 0.14, dkP[1], 0, { setting: 'indoor', wealth: 0.85 });
      const fcBench = palPt(-20.0, sv * 7.2);
      DL_FURN.placeLocal(['iziz_common_chair', 'generic_street_bench'], fcBench[0], 0.05, fcBench[1], sv * Math.PI * 0.5, { setting: 'outdoor', wealth: 0.75 });
    }

    jjReg('Governor Palace — Audience Hall & Gold Onion Dome', audP[0], audP[1], 19, 28, { role: 'governor' });
    jjReg('Governor Palace — Walled Forecourt & Orange Gate', fcCenter[0], fcCenter[1], 18, 6, {});
  }

  /* ----------------------------------------------------------------
   * ZONE 1: Raised Contact-Marble Forum of the Colonia (dl_colonia_forum, 64 x 52 m)
   * ---------------------------------------------------------------- */
  function buildDlColoniaForum(G, o) {
    const v = o && o.v != null ? o.v : 0;
    reseed(9811 + (v | 0));
    const H = 1.1;

    /* Raised contact-marble platform with brick retaining curb & axial steps on all 4 sides */
    jjBox(0, H * 0.45, 0, 62.0, H * 0.9, 50.0, 'brickDeep');
    jjBox(0, H - 0.08, 0, 63.2, 0.24, 51.2, 'marble');
    jjStairs(0, 0, 26.8, 14.0, 3.2, H, 6, 0, { mat: 'marble' });
    jjStairs(0, 0, -26.8, 14.0, 3.2, H, 6, Math.PI, { mat: 'marble' });
    jjStairs(32.8, 0, 0, 11.0, 3.2, H, 6, Math.PI * 0.5, { mat: 'marble' });
    jjStairs(-32.8, 0, 0, 11.0, 3.2, H, 6, -Math.PI * 0.5, { mat: 'marble' });

    /* Sunray contact-marble plaza inlay & Jamtokku Count bronze gnomon column */
    jjRoundPlaza(0, H, 0, 14.5, { raised: false, inlay: true });
    jjPlinth(0, H, 0, 3.4, 1.4, 3.4, 0, { mat: 'marble', band: false });
    jjCylinder(0, H + 4.4, 0, 0.58, 6.0, 'marble', undefined, 32);
    jjDome(0, H + 7.5, 0, 0.82, { kind: 'gold', shape: 'onion' });

    /* East & West shaded brick-and-marble civic porticos (West portico open double colonnade framing jj_temple_sun) */
    for (const sx of [-1, 1]) {
      const px = sx * 26.2;
      jjBox(px, H + 0.15, 0, 6.4, 0.3, 40.0, 'marble');
      jjArcade(px - sx * 2.2, H + 0.3, 0, 7, 5.2, 5.4, sx > 0 ? -Math.PI * 0.5 : Math.PI * 0.5, { depth: 0.9, r: 0.38 });
      if (sx > 0) {
        jjWall(px + sx * 2.5, H + 0.3, 0, 39.2, 5.8, 0.85, -Math.PI * 0.5, { band: true });
      } else {
        jjArcade(px + sx * 2.2, H + 0.3, 0, 7, 5.2, 5.4, Math.PI * 0.5, { depth: 0.9, r: 0.38 });
      }
      jjBox(px, H + 6.3, 0, 6.8, 0.5, 40.8, 'terracotta');
    }

    /* North Speakers' Rostra dais & bronze oil braziers (no PointLights: keeps samplers < 16) */
    jjBox(0, H + 0.75, -19.5, 14.5, 1.5, 5.6, 'marble');
    jjBox(0, H + 1.62, -17.0, 14.8, 0.28, 0.55, 'gold');
    for (const bx of [-9.5, 9.5]) {
      for (const bz of [-12.5, 12.5]) {
        jjCylinder(bx, H + 0.65, bz, 0.52, 1.3, 'brickDeep', undefined, 16);
        jjCylinder(bx, H + 1.38, bz, 0.72, 0.24, 'gold', undefined, 16);
        kput('dlEmberBall', [bx, H + 1.62, bz], null, [0.36, 0.26, 0.36], vC(DLC.ember));
      }
    }
    DL_FURN.placeLocal(['iziz_common_board', 'iziz_court_table'], -4.2, H + 0.12, -18.8, 0, { setting: 'outdoor', wealth: 0.8 });
    DL_FURN.placeLocal(['iziz_common_chair'], 4.2, H + 0.12, -18.8, 0, { setting: 'outdoor', wealth: 0.8 });
  }

  /* ----------------------------------------------------------------
   * ZONE 4: Walled Hykkousoi League Envoys' House & Cistern Court (dl_hykkousoi_legation, 38 x 34 m)
   * ---------------------------------------------------------------- */
  function buildDlHykkousoiLegation(G, o) {
    const v = o && o.v != null ? o.v : 0;
    reseed(9821 + (v | 0));
    const cLime = vC(DLC.hykLimestone);
    const cTeal = vC(DLC.hykTeal);
    const cOchre = vC(DLC.hykOchre);
    const cMarb = vC(DLC.marble);

    /* Pale limestone perimeter wall with Aegean-teal ceramic frieze & arched gate */
    for (const s of [-1, 1]) {
      vB('vPlaster', s * 18.2, 0, 0, 1.1, 3.8, 33.2, 0, cLime);
      vB('dlTealTile', s * 18.2, 3.45, 0, 1.22, 0.28, 33.4, 0, cTeal);
      vB('vStone', s * 18.2, 3.8, 0, 1.32, 0.24, 33.5, 0, cMarb);
      vB('vPlaster', s * 10.6, 0, 16.2, 14.2, 3.8, 1.1, 0, cLime);
      vB('dlTealTile', s * 10.6, 3.45, 16.2, 14.3, 0.28, 1.22, 0, cTeal);
    }
    vB('vPlaster', 0, 0, -16.2, 37.2, 3.8, 1.1, 0, cLime);
    vB('dlTealTile', 0, 3.45, -16.2, 37.4, 0.28, 1.22, 0, cTeal);
    /* Diplomatic Portal at +z with Aegean-teal lintel & League banners */
    for (const s of [-1, 1]) {
      vB('vStone', s * 3.1, 0, 16.2, 1.5, 5.2, 1.6, 0, cMarb);
      vnBannerPole(s * 4.8, 0, 17.2, 0, 6.8, cTeal);
    }
    vB('vStone', 0, 4.4, 16.2, 7.8, 0.9, 1.7, 0, cMarb);
    vB('dlTealTile', 0, 4.05, 16.2, 6.4, 0.32, 1.76, 0, cTeal);

    /* Recessed Central Cistern Court (12 x 10 m basin at x = 0, z = 2.0; water drawn at y + 0.35 by WATER.drawStill) */
    vB('vStone', 0, -0.35, 2.0, 15.6, 0.45, 13.6, 0, cMarb);
    for (const s of [-1, 1]) {
      vB('vStone', s * 6.3, 0.05, 2.0, 0.75, 0.65, 11.2, 0, cMarb);
      vB('vStone', 0, 0.05, 2.0 + s * 5.3, 13.4, 0.65, 0.75, 0, cMarb);
      /* Peristyle limestone columns around the impluvium cistern */
      for (let kz = -4.2; kz <= 8.2; kz += 4.1) {
        vPst('vPostS', s * 7.6, 0.1, kz, 0.28, 3.8, cMarb);
        vB('dlTealTile', s * 7.6, 3.85, kz, 0.82, 0.24, 0.82, 0, cTeal);
      }
    }

    /* Rear Two-Storey Treaty Archive & Envoys' Residence Hall (z = -10.2) */
    vB('vPlaster', 0, 0, -10.2, 31.0, 8.6, 10.4, 0, cLime);
    vB('dlTealTile', 0, 4.35, -10.2, 31.4, 0.32, 10.8, 0, cTeal);
    vB('vStone', 0, 8.6, -10.2, 32.0, 0.42, 11.4, 0, cMarb);
    /* Shallow stepped Mediterranean hipped ochre-tile roof + belvedere */
    kput('vHipS', [0, 9.02, -10.2], null, [32.4, 1.35, 11.8], cOchre);
    vB('vPlaster', 0, 10.35, -10.2, 11.2, 2.4, 6.4, 0, cLime);
    vB('dlTealTile', 0, 12.75, -10.2, 12.0, 0.55, 7.2, 0, cTeal);
    for (let wx = -11.5; wx <= 11.5; wx += 4.6) {
      vnWin(wx, 5.2, -5.0, 0, 1.25, 2.1, 'lit', 'vStone', cTeal, false);
    }
    vnDoor(0, 0.1, -5.0, 0, 2.2, 3.2, 'vStone', cTeal, cOchre, true);

    /* Hykkousoi catalog amphorae, couches & treaty table in the peristyle */
    DL_FURN.placeLocal(['hykkousoi_common_amphora', 'generic_trade_jar'], -7.2, 0.15, -2.5, 0, { setting: 'outdoor', wealth: 0.85 });
    DL_FURN.placeLocal(['hykkousoi_common_amphora', 'generic_trade_jar'], 7.2, 0.15, -2.5, 0, { setting: 'outdoor', wealth: 0.85 });
    DL_FURN.placeLocal(['hykkousoi_rich_table', 'iziz_court_table'], 0, 0.15, -3.2, 0, { setting: 'outdoor', wealth: 0.88 });

    vnReg('Walled Hykkousoi League Envoys House & Cistern Court', 0, 0, 19, 13.5, { culture: 'hykkousoi' });
  }

  /* ----------------------------------------------------------------
   * ZONE 4: Lower-Town Pass Customs & Lipp-Seizure Assay Post (dl_customs_post, 30 x 22 m)
   * ---------------------------------------------------------------- */
  function buildDlCustomsPost(G, o) {
    const v = o && o.v != null ? o.v : 0;
    reseed(9831 + (v | 0));
    const cWh = vC(DLC.izizWhite);
    const cOr = vC(DLC.izizOrange);
    const cSt = vC(DLC.granite);
    const cWood = vC(0x6b4f35);

    /* Granite base plinth + twin wings flanking a 6.4 m drive-through customs weighbridge arch */
    vB('vStone', 0, -0.3, 0, 29.4, 0.45, 21.4, 0, cSt);
    for (const s of [-1, 1]) {
      const wx = s * 9.2;
      vB('vPlaster', wx, 0.15, 0, 10.2, 7.6, 17.6, 0, cWh);
      vB('vPlaster', wx, 4.05, 0, 10.5, 0.28, 17.9, 0, cOr);
      vB('vStone', wx, 7.75, 0, 10.8, 0.38, 18.2, 0, cSt);
      kput('vHipS', [wx, 8.12, 0], qEuler(0, Math.PI * 0.5, 0), [18.6, 1.55, 11.2], vC(0x524840));
      for (const wz of [-5.2, 0, 5.2]) {
        vnWin(wx - s * 5.1, 4.8, wz, s > 0 ? -Math.PI * 0.5 : Math.PI * 0.5, 1.2, 1.9, 'lit', 'vStone', cOr, false);
        vnWin(wx, 4.8, 8.8, 0, 1.3, 1.9, 'lit', 'vStone', cOr, true);
      }
      vnBannerPole(s * 4.4, 0.15, 9.6, 0, 7.4, cOr);
    }
    /* Upper Assay Bridge & Scale Beam spanning the 6.4 m weighbridge lane */
    vB('vPlaster', 0, 5.2, 0, 8.4, 3.8, 12.4, 0, cWh);
    vB('vPlaster', 0, 5.05, 6.22, 8.2, 0.34, 0.42, 0, cOr);
    vB('vPlaster', 0, 5.05, -6.22, 8.2, 0.34, 0.42, 0, cOr);
    kput('vHipS', [0, 9.0, 0], null, [9.2, 2.2, 13.0], vC(0x524840));
    vnLampPost(-4.6, 0.15, -9.2, 3.6);
    vnLampPost(4.6, 0.15, -9.2, 3.6);

    /* Bonded Lipp Republican crate yard & weighing scale */
    vnCrate(-2.1, 0.15, 2.4, 1.25, 0.2, cWood);
    vnCrate(-1.9, 0.15, -2.2, 1.15, -0.15, cWood);
    vnSacks(2.1, 0.15, 1.6, 4);
    DL_FURN.placeLocal(['republican_common_crate', 'generic_trade_crate', 'generic_trade_bin'], 2.2, 0.15, -2.6, 0.3, { setting: 'outdoor', wealth: 0.7 });
    DL_FURN.placeLocal(['iziz_common_counter', 'iziz_common_desk'], -3.2, 0.15, 0, Math.PI * 0.5, { setting: 'outdoor', wealth: 0.78 });
    DL_FURN.placeLocal(['iziz_court_strongbox'], -3.3, 0.15, -3.8, Math.PI * 0.5, { setting: 'outdoor', wealth: 0.85 });

    vnReg('Lower-Town Pass Customs & Lipp-Seizure Assay Post', 0, 0, 15, 12.2, { culture: 'iziz-vernacular' });
  }

  /* ----------------------------------------------------------------
   * ZONE 4: Three-Arch Contact-Marble Spring Bridge (dl_stream_bridge, 14 x 28 m)
   * & Jimjam Banded-Brick Aqueduct Arcade (dl_aqueduct_seg, 18 x 4.4 m)
   * ---------------------------------------------------------------- */
  function buildDlStreamBridge(G, o) {
    const v = o && o.v != null ? o.v : 0;
    reseed(9841 + (v | 0));
    /* Bridge deck sits at y = 0 (35 cm above bank); piers descend y = -4.6..0 into the incised spring stream */
    for (const pz of [-9.2, -3.1, 3.1, 9.2]) {
      jjBox(0, -2.3, pz, 11.4, 4.6, 2.1, 'marble');
      /* Pointed upstream/downstream cutwaters */
      jjCylinder(-5.8, -2.3, pz, 1.05, 4.5, 'marble', undefined, 8);
      jjCylinder(5.8, -2.3, pz, 1.05, 4.5, 'marble', undefined, 8);
    }
    for (const az of [-6.15, 0, 6.15]) {
      jjArch(0, -1.8, az, 5.8, 2.1, Math.PI * 0.5, { depth: 11.2 });
    }
    /* Roadway slab & contact-marble parapets along left/right edges (traffic runs along local Z) */
    jjBox(0, 0.15, 0, 11.8, 0.55, 27.6, 'marble');
    for (const sx of [-1, 1]) {
      jjBox(sx * 5.45, 0.92, 0, 0.72, 1.05, 27.6, 'bandBrick');
      jjBox(sx * 5.45, 1.52, 0, 0.88, 0.24, 27.8, 'marble');
      /* Pedestrian refuge piers */
      jjBox(sx * 5.85, 0.82, 0, 1.25, 1.65, 2.4, 'marble');
    }
  }

  function buildDlAqueductSeg(G, o) {
    const v = o && o.v != null ? o.v : 0;
    reseed(9845 + (v | 0));
    for (const px of [-6.0, 0, 6.0]) {
      jjBox(px, 3.4, 0, 1.85, 6.8, 2.6, 'bandBrick');
      jjBox(px, 6.9, 0, 2.15, 0.34, 2.9, 'marble');
    }
    for (const ax of [-3.0, 3.0]) {
      jjArch(ax, 4.6, 0, 4.8, 2.3, 0, { depth: 2.3 });
    }
    /* Specus water channel in contact-marble along top */
    jjBox(0, 7.6, 0, 18.0, 1.1, 2.8, 'marble');
    jjBox(0, 8.35, -1.12, 18.0, 0.55, 0.42, 'brickYellow');
    jjBox(0, 8.35, 1.12, 18.0, 0.55, 0.42, 'brickYellow');
  }

  /* ----------------------------------------------------------------
   * ZONE 4: Port Visas Rock-Cut Highway Tunnel Portal (dl_portvisas_portal, 26 x 18 m)
   * ---------------------------------------------------------------- */
  function buildDlPortvisasPortal(G, o) {
    const v = o && o.v != null ? o.v : 0;
    reseed(9851 + (v | 0));
    const cGran = vC(DLC.granite);
    const cDark = vC(DLC.graniteDark);
    const cMarb = vC(DLC.marble);
    const cOr = vC(DLC.izizOrange);

    /* Massive battered granite & contact-marble portal headwall backed into the SE ridge */
    vB('vStone', 0, -0.5, -3.2, 24.8, 13.8, 10.5, 0, cGran);
    for (const s of [-1, 1]) {
      vB('vStone', s * 8.4, -0.4, 2.4, 6.2, 12.6, 4.8, 0, cMarb);
      vB('vPlaster', s * 5.05, 0, 4.65, 0.42, 8.6, 0.55, 0, cOr);
      vnBannerPole(s * 6.8, 0, 5.8, 0, 8.6, cOr);
      vnLampPost(s * 5.6, 0, 6.8, 4.0);
    }
    /* Deep shadowed rock-cut highway bore (9.2 m wide x 8.4 m high) + entablature */
    vB('vDarkB', 0, 0.05, 1.2, 9.2, 8.4, 7.2, 0, null);
    vB('vPlaster', 0, 8.42, 4.65, 10.4, 0.36, 0.58, 0, cOr);
    vB('vStone', 0, 8.85, 2.6, 25.4, 2.4, 5.6, 0, cMarb);
    vB('vStone', 0, 11.3, 2.4, 18.0, 1.8, 4.8, 0, cDark);
    /* Guard parapet & heliograph repeater post */
    vPst('vPostS', 0, 13.1, 2.4, 0.35, 2.6, cMarb);
    kput('dlEmberBall', [0, 15.8, 2.4], null, [0.34, 0.34, 0.34], vC(DLC.ember));

    vnReg('Port Visas Rock-Cut Highway Tunnel Portal (izani.dilihan-portvisas)', 0, 0, 13, 16.2, { culture: 'iziz-vernacular' });
  }

  /* ----------------------------------------------------------------
   * ZONE 5: NW Clay Brickkiln, NE Skarn Adit, D2 Evaporite Pan & Handu Crop Plot
   * ---------------------------------------------------------------- */
  function buildDlBrickkiln(G, o) {
    const v = o && o.v != null ? o.v : 0;
    reseed(9861 + (v | 0));
    /* Twin Jimjam beehive brick kilns + tall patterned chimney + clay drying racks */
    jjBox(0, 0.2, 0, 22.8, 0.4, 16.8, 'brickDeep');
    for (const kx of [-5.4, 4.2]) {
      jjCylinder(kx, 2.4, -1.8, 3.8, 4.4, 'brick', undefined, 24);
      jjDome(kx, 4.6, -1.8, 3.7, { kind: 'terracotta', shape: 'hemi' });
      jjBrickShaft(kx, 6.2, -1.8, 0.92, 6.4, { pattern: kx < 0 ? 'spiral' : 'chevron', relief: true, cap: 'crenel' });
      /* Glowing kiln stoke-hole */
      jjBox(kx, 1.1, 2.05, 1.35, 1.5, 0.4, 'dark');
      kput('dlEmber', [kx, 0.85, 1.98], null, [0.85, 0.55, 0.25], vC(DLC.ember));
    }
    /* Green-brick drying hacks under terracotta awning */
    for (const rz of [4.8, 6.8]) {
      jjBox(0, 0.65, rz, 16.0, 0.9, 1.1, 'brickYellow');
    }
    jjBox(0, 2.8, 5.8, 17.6, 0.28, 4.4, 'terracotta');
  }

  function buildDlSkarnAdit(G, o) {
    const v = o && o.v != null ? o.v : 0;
    reseed(9871 + (v | 0));
    const cRock = vC(DLC.graniteDark);
    const cTimb = vC(0x6e4e32);
    const cOr = vC(DLC.izizOrange);

    /* Battered skarn rock collar & timbered mine portal + sorting grizzly chute */
    kput('vBatterS', [0, -0.3, -3.2], null, [13.5, 6.4, 8.2], cRock);
    vB('vDarkB', 0, 0.1, 0.8, 3.4, 3.6, 2.2, 0, null);
    for (const sx of [-1.85, 1.85]) {
      vB('vWood', sx, 0, 1.2, 0.42, 4.1, 0.48, 0, cTimb);
    }
    vB('vWood', 0, 3.85, 1.2, 4.6, 0.46, 0.56, 0, cTimb);
    vB('vPlaster', 0, 4.35, 1.25, 3.8, 0.26, 0.32, 0, cOr);

    /* Timber headframe & ore-cart rails + cassiterite/magnetite ore bin */
    for (const sx of [-1.4, 1.4]) {
      vBeam([sx, 0, 3.2], [sx * 0.45, 8.6, 2.0], 0.22, cTimb);
      vBeam([sx, 0, 0.6], [sx * 0.45, 8.6, 2.0], 0.22, cTimb);
    }
    vB('vIron', 0, 8.3, 2.0, 1.8, 0.5, 1.4, 0, vC(0x302c2a));
    vB('vIron', -0.65, 0.08, 4.2, 0.12, 0.12, 6.4, 0, vC(0x3c3734));
    vB('vIron', 0.65, 0.08, 4.2, 0.12, 0.12, 6.4, 0, vC(0x3c3734));
    vB('vWood', 5.2, 0, 2.6, 4.6, 2.4, 4.2, 0, cTimb);
    vB('vStone', 5.2, 2.1, 2.6, 3.8, 0.7, 3.4, 0, vC(DLC.cassiterite));

    vnReg('Contact-Skarn Mine Adit & Ore Grizzly', 0, 0, 9.2, 9.4, { culture: 'iziz-vernacular' });
  }

  function buildDlEvaporitePan(G, o) {
    const v = o && o.v != null ? o.v : 0;
    reseed(9881 + (v | 0));
    /* Bunded 34 x 24 m potash & halite solar evaporation pan + raked crystalline salt cones */
    for (const sx of [-1, 1]) {
      jjBox(sx * 16.8, 0.45, 0, 1.1, 0.9, 25.2, 'marble');
      jjBox(0, 0.45, sx * 12.2, 34.6, 0.9, 1.1, 'marble');
    }
    jjBox(0, 0.42, 0, 33.4, 0.14, 1.0, 'brickYellow');
    jjBox(0, 0.12, 0, 32.8, 0.18, 23.4, 'marble', DLC.potashRose);
    /* Harvested white halite & rose potash crystal heaps along south bund */
    for (let hx = -11.0; hx <= 11.0; hx += 5.5) {
      jjCylinder(hx, 0.75, 13.4, 1.65, 1.35, 'marble', hx % 2 === 0 ? DLC.haliteWhite : DLC.potashRose, 12);
    }
    /* Timber brine sluice & bagging shelter */
    jjBox(-13.2, 1.5, 13.4, 5.4, 2.6, 3.6, 'brick');
    jjBox(-13.2, 2.95, 13.4, 6.0, 0.35, 4.2, 'terracotta');
  }

  function buildDlCropPlot(G, o) {
    const v = o && o.v != null ? o.v : 0;
    reseed(9891 + (v | 0));
    const crop = (o && o.crop) ? o.crop : (v === 0 ? 'rice' : v === 1 ? 'measuremelon' : 'emmer');
    const rowHex = crop === 'emmer' ? DLC.emmerGold :
                   crop === 'whorl-olive' ? DLC.oliveFoliage :
                   crop === 'taro' ? DLC.taroLeaf :
                   crop === 'indigo' ? DLC.indigoLeaf : DLC.paddyGreen;

    /* Low stone irrigation bund around orthogonal 26 x 20 m veteran handu plot */
    for (const sx of [-1, 1]) {
      jjBox(sx * 13.2, 0.24, 0, 0.65, 0.48, 20.8, 'marble');
      jjBox(0, 0.24, sx * 10.2, 27.0, 0.48, 0.65, 'marble');
    }
    jjBox(0, 0.08, 0, 25.8, 0.16, 19.8, 'ochre', 0x5c4a36);

    /* Cultivated rows keyed to CROPS Cut basket (rice, bamboo-rice, measuremelon, taro, emmer, whorl-olive, cotton, indigo) */
    for (let rz = -8.0; rz <= 8.0; rz += 2.6) {
      vB('vLeaf', 0, 0.18, rz, 23.6, crop === 'whorl-olive' ? 0.35 : 0.52, 1.25, 0, vC(rowHex));
      if (crop === 'measuremelon') {
        for (let mx = -9.5; mx <= 9.5; mx += 3.8) {
          const sz = (Math.abs(Math.round(mx + rz)) % 3 === 0) ? 0.24 : 0.38;
          const mCol = sz < 0.3 ? 0x5d8c38 : 0xdba23a;
          vBall('vLeaf', mx, 0.46, rz + 0.45, sz, vC(mCol), sz * 0.85);
        }
      } else if (crop === 'whorl-olive') {
        for (let ox = -8.5; ox <= 8.5; ox += 5.6) {
          vPst('vPost', ox, 0.16, rz, 0.16, 1.45, vC(0x5e4934));
          vBall('vLeaf', ox, 1.75, rz, 1.05, vC(DLC.oliveFoliage), 0.78);
        }
      } else if (crop === 'cotton') {
        for (let cx = -9.0; cx <= 9.0; cx += 3.0) {
          vBall('vLeaf', cx, 0.76, rz, 0.22, vC(DLC.cottonBoll), 0.22);
        }
      }
    }
  }

  /* Register builders on JJ.def or VERN.def matching their architectural vocabulary and culture tags */
  JJ.def({
    key: 'dl_gov_palace',
    name: 'Governor Palace of Dilihan',
    w: 62, d: 76, r: 42, h: 28, cls: 'building',
    tags: { culture: 'iziz-vernacular', type: ['civic', 'dwelling-single'], wealth: 'civic', lit: true, job: 'customs', role: 'governor' },
    build: buildDlGovPalace
  });
  JJ.def({
    key: 'dl_colonia_forum',
    name: 'Raised Contact-Marble Forum of the Colonia',
    w: 64, d: 52, r: 36, h: 9.5, cls: 'building',
    tags: { culture: 'jimjam', type: ['plaza', 'civic', 'market'], wealth: 'civic', lit: false, job: 'trading' },
    build: buildDlColoniaForum
  });
  VERN.def({
    key: 'dl_hykkousoi_legation',
    name: 'Walled Hykkousoi League Envoys House',
    w: 38, d: 34, h: 13.5, cls: 'building',
    tags: { culture: 'hykkousoi', type: ['civic', 'dwelling-single'], wealth: 'rich', lit: true, job: 'customs' },
    build: buildDlHykkousoiLegation
  });
  VERN.def({
    key: 'dl_customs_post',
    name: 'Lower-Town Pass Customs & Assay Post',
    w: 30, d: 22, h: 12.5, cls: 'building',
    tags: { culture: 'iziz-vernacular', type: ['civic', 'infrastructure'], wealth: 'civic', lit: true, job: 'customs' },
    build: buildDlCustomsPost
  });
  JJ.def({
    key: 'dl_stream_bridge',
    name: 'Three-Arch Contact-Marble Spring Bridge',
    w: 14, d: 28, r: 15, h: 6.8, cls: 'building',
    tags: { culture: 'jimjam', type: ['infrastructure'], wealth: 'civic', lit: false, job: 'masonry' },
    build: buildDlStreamBridge
  });
  JJ.def({
    key: 'dl_aqueduct_seg',
    name: 'West-Wall Spring Aqueduct Arcade',
    w: 18, d: 4.4, r: 9.5, h: 9.2, cls: 'building',
    tags: { culture: 'jimjam', type: ['infrastructure'], wealth: 'civic', lit: false, job: 'masonry' },
    build: buildDlAqueductSeg
  });
  VERN.def({
    key: 'dl_portvisas_portal',
    name: 'Port Visas Highway Rock-Cut Tunnel Portal',
    w: 26, d: 18, h: 16.5, cls: 'building',
    tags: { culture: 'iziz-vernacular', type: ['infrastructure', 'military'], wealth: 'civic', lit: true, job: 'customs' },
    build: buildDlPortvisasPortal
  });
  JJ.def({
    key: 'dl_brickkiln',
    name: 'NW Lake-Apron Beehive Brickkiln',
    w: 24, d: 18, r: 13, h: 13.5, cls: 'building',
    tags: { culture: 'jimjam', type: ['industry'], wealth: 'poor', lit: false, job: 'pottery' },
    build: buildDlBrickkiln
  });
  VERN.def({
    key: 'dl_skarn_adit',
    name: 'NE Granite-Contact Tin & Skarn Adit',
    w: 18, d: 16, h: 9.8, cls: 'building',
    tags: { culture: 'iziz-vernacular', type: ['industry'], wealth: 'poor', lit: false, job: 'mining' },
    build: buildDlSkarnAdit
  });
  JJ.def({
    key: 'dl_evaporite_pan',
    name: 'Cut Salt Lake Potash & Halite Evaporation Pan',
    w: 36, d: 28, r: 19, h: 3.4, cls: 'building',
    tags: { culture: 'jimjam', type: ['industry'], wealth: 'poor', lit: false, job: 'salt' },
    build: buildDlEvaporitePan
  });
  JJ.def({
    key: 'dl_crop_plot',
    name: 'Dellu-Handu Veteran Allotment Crop Plot',
    w: 28, d: 22, r: 15, h: 2.2, cls: 'building',
    tags: { culture: 'jimjam', type: ['farm'], wealth: 'poor', lit: false, job: 'farming' },
    build: buildDlCropPlot
  });

  /* Visible RES_ORE cassiterite tin, magnetite iron & copper skarn outcrops */
  function placeOreNode(nd) {
    const s = nd.r == null ? 5.2 : nd.r;
    const veinHex = nd.kind === 'tin' ? DLC.cassiterite :
                    nd.kind === 'iron' ? DLC.magnetite : DLC.malachite;
    const y0 = DL_GROUND.h(nd.x, nd.z);
    kput('vBatterS', [nd.x, y0 - 0.75, nd.z], qEuler(0, 0.65, 0), [s * 0.94, s * 0.58, s * 0.86], vC(DLC.graniteDark));
    for (let i = 0; i < 4; i++) {
      const a = i * TAU2 / 4 + 0.35;
      const rx = nd.x + Math.cos(a) * s * 0.28;
      const rz = nd.z + Math.sin(a) * s * 0.28;
      kput('vStone', [rx, y0 + s * 0.24, rz], qEuler(0.2 * (i % 2 ? 1 : -1), a, 0.16), [s * 0.34, s * 0.36, s * 0.28], vC(veinHex));
    }
    REG.push({
      name: nd.kind + ' contact-skarn outcrop (' + nd.grade + ')',
      key: 'res_ore_' + nd.kind,
      cls: 'feature',
      x: nd.x,
      y: y0,
      z: nd.z,
      r: s * 0.55,
      h: s * 0.62,
      tags: { culture: nd.culture || 'iziz-vernacular', type: ['industry'], job: 'mining', rock: nd.kind, variant: nd.grade }
    });
  }

  return {
    palette: DLC,
    furn: DL_FURN,
    placeOreNode: placeOreNode
  };
})();
