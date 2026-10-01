/* ======================================================================
   Krator Master Plant Registry — 48 species
   Harvested from Voth, Iziz, Mav's Refuge, Girder and Yuni.
   Requires krator-asset-engine.js to be loaded first (defines PLANT(), F.*, etc).
   Every species is tagged with climate (hypertropic/tropic/temperate/cold)
   and aridity (arid/semiarid/subhumid/humid) — its preferred band.
   Build any instance with: buildPlant(key, x, z, ry, {variant, seed, y})
   ====================================================================== */

/* ================= Voth (21 species) ================= */

PLANT({
  key: 'voth_mushroom_cap', name: 'Cap Mushroom', climate: 'temperate', aridity: 'semiarid',
  w: 6, d: 6, h: 10, variants: 2,
  variantDims: [{ w: 3.4, d: 3.4, h: 5.6 }, { w: 6, d: 6, h: 10 }],
  build: function (F) {
    const stalkCols = [0xbdb49c, 0xaca38c, 0xc8bfa6];
    const capCols = [0x8d6a5e, 0x9a7a5c, 0x8a7a52];
    /* one fruiting body: basal bulb, segmented leaning stipe, annulus, gilled cap */
    const one = function (cx, cz, h, leanA, leanK, ng, annulus, warts) {
      const sC = F.pick(stalkCols), cC = F.pick(capCols);
      const sr = h * 0.072, stipeTop = h * 0.80;
      const tx = cx + Math.cos(leanA) * leanK * h, tz = cz + Math.sin(leanA) * leanK * h;
      F.blob(cx, sr * 1.3, cz, sr * 2.0, sr * 2.8, 0, shade(sC, -0.1), 'stone');
      for (let s = 0; s < 3; s++) {
        const t0 = s / 3, t1 = (s + 1) / 3;
        F.rod(cx + (tx - cx) * t0, sr * 1.5 + (stipeTop - sr * 1.5) * t0, cz + (tz - cz) * t0,
          cx + (tx - cx) * t1, sr * 1.5 + (stipeTop - sr * 1.5) * t1, cz + (tz - cz) * t1,
          sr * (1.18 - s * 0.19), shade(sC, s * 0.04), 'stone');
      }
      if (annulus) {
        F.cyl(cx + (tx - cx) * 0.6, stipeTop * 0.60, cz + (tz - cz) * 0.6, sr * 2.1, sr * 0.3, 0, shade(sC, -0.16), 'stone');
      }
      const R = h * 0.30, cy = stipeTop;
      for (let i = 0; i < ng; i++) {   /* radial gills under the cap */
        const a = (i / ng) * TAU;
        F.box(tx + Math.cos(a) * R * 0.53, cy - h * 0.042, tz + Math.sin(a) * R * 0.53,
          R * 0.88, h * 0.042, sr * 0.3, -a, shade(cC, -0.28), 'plaster');
      }
      F.cyl(tx, cy - h * 0.05, tz, R * 0.98, h * 0.055, 0, shade(cC, -0.15), 'plaster');
      F.dome(tx, cy, tz, R, h * 0.20, 0, cC, 'plaster');
      F.dome(tx, cy + h * 0.015, tz, R * 0.54, h * 0.135, 0, shade(cC, 0.08), 'plaster');
      for (let i = 0; i < warts; i++) {
        const a = F.rr(0, TAU), rr = F.rr(0.22, 0.78) * R;
        F.blob(tx + Math.cos(a) * rr, cy + h * 0.10, tz + Math.sin(a) * rr, R * 0.11, h * 0.028, 0, shade(cC, 0.32), 'plaster');
      }
    };
    const big = F.variant === 1;
    const H = big ? F.rr(9.3, 10) : F.rr(5.2, 5.6);
    one(0, 0, H, F.rr(0, TAU), F.rr(-0.025, 0.025), big ? 11 : 9, true, 3);
    const nSide = big ? 2 : 1;
    for (let i = 0; i < nSide; i++) {
      const a = F.rr(0, TAU) + i * 2.4, rr = H * F.rr(0.12, 0.17);
      one(Math.cos(a) * rr, Math.sin(a) * rr, H * F.rr(0.3, 0.46), F.rr(0, TAU), F.rr(-0.06, 0.06), 5, false, 0);
    }
  }
});

PLANT({
  key: 'voth_fungal_cluster', name: 'Fungal Cluster', climate: 'temperate', aridity: 'semiarid',
  w: 5.6, d: 5.5, h: 3, variants: 1,
  build: function (F) {
    const stalkCols = [0xbdb49c, 0xaca38c, 0xc8bfa6];
    const capCols = [0x8d6a5e, 0x9a7a5c, 0x8a7a52];
    /* mycelial crust the clump erupts from */
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU), rr = F.rr(0, 1.4);
      F.blob(Math.cos(a) * rr, 0.06, Math.sin(a) * rr, F.rr(0.7, 1.2), 0.14, 0, 0xb8ae96, 'plaster');
    }
    const ang0 = F.rr(0, TAU);
    for (let i = 0; i < 3; i++) {          /* three full, gilled fruiting bodies */
      const a = ang0 + i * (TAU / 3) + F.rr(-0.4, 0.4);
      const rad = F.rr(1.0, 1.9);
      const cx = Math.cos(a) * rad, cz = Math.sin(a) * rad;
      const h = (i === 0 ? F.rr(2.75, 3.0) : F.rr(1.9, 2.4));
      const sC = F.pick(stalkCols), cC = F.pick(capCols);
      const sr = h * 0.085, stipeTop = h * 0.78;
      const lean = F.rr(0.03, 0.10), la = F.rr(0, TAU);
      const tx = cx + Math.cos(la) * lean * h, tz = cz + Math.sin(la) * lean * h;
      F.blob(cx, sr * 1.2, cz, sr * 1.9, sr * 2.4, 0, shade(sC, -0.1), 'stone');
      F.rod(cx, sr * 1.3, cz, (cx + tx) / 2, stipeTop * 0.55, (cz + tz) / 2, sr * 1.1, sC, 'stone');
      F.rod((cx + tx) / 2, stipeTop * 0.55, (cz + tz) / 2, tx, stipeTop, tz, sr * 0.82, shade(sC, 0.05), 'stone');
      const R = h * 0.36;
      for (let g = 0; g < 5; g++) {
        const ga = (g / 5) * TAU + a;
        F.box(tx + Math.cos(ga) * R * 0.52, stipeTop - h * 0.05, tz + Math.sin(ga) * R * 0.52,
          R * 0.86, h * 0.05, sr * 0.3, -ga, shade(cC, -0.28), 'plaster');
      }
      F.cyl(tx, stipeTop - h * 0.06, tz, R * 0.96, h * 0.06, 0, shade(cC, -0.14), 'plaster');
      F.dome(tx, stipeTop, tz, R, h * 0.22, 0, cC, 'plaster');
    }
    for (let i = 0; i < 5; i++) {          /* young pins around the edge */
      const a = F.rr(0, TAU) + i * 1.3, rad = F.rr(1.7, 2.35);
      const cx = Math.cos(a) * rad, cz = Math.sin(a) * rad;
      const h = F.rr(0.3, 0.75);
      F.rod(cx, 0, cz, cx + F.rr(-0.08, 0.08), h, cz + F.rr(-0.08, 0.08), 0.055, F.pick(stalkCols), 'stone');
      F.blob(cx, h + 0.06, cz, F.rr(0.13, 0.24), F.rr(0.14, 0.26), 0, F.pick(capCols), 'plaster');
    }
  }
});

PLANT({
  key: 'voth_bulbous_trama', name: 'Bulbous Trama Stalk', climate: 'temperate', aridity: 'semiarid',
  w: 4, d: 4, h: 7, variants: 1,
  build: function (F) {
    const capCols = [0x8d6a5e, 0x9a7a5c, 0x8a7a52];
    const c = F.pick(capCols);
    const H = F.rr(6.4, 7.0);
    /* a lumpy fungal column: stacked swellings of shrinking radius, leaning slightly */
    const la = F.rr(0, TAU), lean = F.rr(0.03, 0.09);
    const n = 7;
    let py = 0.1;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const cx = Math.cos(la) * lean * H * t, cz = Math.sin(la) * lean * H * t;
      const r = (1.75 - 1.25 * t) * F.rr(0.9, 1.08);
      const segH = H * 0.126 * F.rr(0.9, 1.1);
      F.blob(cx, py + segH * 0.5, cz, r, segH * 1.5, F.rr(0, TAU), shade(c, (i % 2 ? 0.05 : -0.03)), 'plaster');
      /* lateral lobe budding off the swelling */
      if (i > 0 && i < n - 1) {
        const a2 = F.rr(0, TAU);
        F.blob(cx + Math.cos(a2) * r * 0.85, py + segH * 0.45, cz + Math.sin(a2) * r * 0.85,
          r * F.rr(0.32, 0.5), segH * 0.9, 0, shade(c, 0.09), 'plaster');
      }
      py += segH;
    }
    /* puckered apex */
    F.dome(Math.cos(la) * lean * H, py - 0.05, Math.sin(la) * lean * H, 0.55, 0.45, 0, shade(c, -0.14), 'plaster');
    F.blob(Math.cos(la) * lean * H, py + 0.32, Math.sin(la) * lean * H, 0.22, 0.3, 0, shade(c, 0.2), 'plaster');
    /* basal volva and a few satellite stalks */
    F.blob(0, 0.28, 0, 1.95, 0.7, 0, shade(c, -0.2), 'plaster');
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU), rad = F.rr(1.1, 1.7);
      const sx = Math.cos(a) * rad, sz = Math.sin(a) * rad;
      const sh = F.rr(0.8, 2.0);
      F.rod(sx, 0, sz, sx + F.rr(-0.15, 0.15), sh, sz + F.rr(-0.15, 0.15), 0.16, shade(c, -0.05), 'plaster');
      F.blob(sx, sh * 0.62, sz, 0.36, sh * 0.5, 0, shade(c, 0.04), 'plaster');
      F.dome(sx, sh, sz, 0.3, 0.22, 0, shade(c, -0.12), 'plaster');
    }
  }
});

PLANT({
  key: 'voth_ashland_scrub', name: 'Ashland Scrub', climate: 'temperate', aridity: 'semiarid',
  w: 5.1, d: 5, h: 2, variants: 1,
  build: function (F) {
    const cols = [0x4e5a34, 0x616a41, 0x6a6c46];
    const woodC = 0x5a4e40;
    const H = F.rr(1.8, 2.0), R = F.rr(1.75, 2.0);
    const nStem = 5;
    const a0 = F.rr(0, TAU);
    for (let i = 0; i < nStem; i++) {
      const a = a0 + (i / nStem) * TAU + F.rr(-0.25, 0.25);
      const lean = F.rr(0.45, 0.75);
      const kx = Math.cos(a) * R * lean, kz = Math.sin(a) * R * lean;
      const ky = H * F.rr(0.45, 0.62);
      F.rod(0, 0, 0, kx * 0.45, ky * 0.6, kz * 0.45, 0.075, woodC, 'wood');
      F.rod(kx * 0.45, ky * 0.6, kz * 0.45, kx, ky, kz, 0.05, shade(woodC, 0.06), 'wood');
      /* two or three twigs off each stem, one of them bare ashen deadwood */
      const nt = 3;
      for (let j = 0; j < nt; j++) {
        const a2 = a + F.rr(-0.8, 0.8);
        const tr = R * F.rr(0.25, 0.42);
        const tx = kx + Math.cos(a2) * tr, tz = kz + Math.sin(a2) * tr;
        const ty = ky + F.rr(0.05, 0.4);
        F.rod(kx, ky, kz, tx, ty, tz, 0.032, j === 2 ? 0xa39c8e : woodC, 'wood');
        if (j !== 2) F.blob(tx, ty + 0.06, tz, F.rr(0.28, 0.46), F.rr(0.24, 0.4), F.rr(0, TAU), F.pick(cols), 'plaster');
      }
    }
    /* crown fill so the silhouette reads as a scrub, not a wire frame */
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.1, R * 0.55);
      F.blob(Math.cos(a) * rad, F.rr(0.45, H * 0.8), Math.sin(a) * rad, F.rr(0.35, 0.55), F.rr(0.3, 0.5), F.rr(0, TAU), F.pick(cols), 'plaster');
    }
    /* ash litter at the base */
    for (let i = 0; i < 2; i++) {
      const a = F.rr(0, TAU);
      F.blob(Math.cos(a) * F.rr(0.4, 1.1), 0.07, Math.sin(a) * F.rr(0.4, 1.1), F.rr(0.4, 0.7), 0.16, 0, 0x8e8878, 'plaster');
    }
  }
});

PLANT({
  key: 'voth_ashland_tree', name: 'Ashland Tree', climate: 'temperate', aridity: 'semiarid',
  w: 7, d: 7, h: 17, variants: 2,
  variantDims: [{ w: 4.2, d: 4.2, h: 7.5 }, { w: 7, d: 7, h: 17 }],
  build: function (F) {
    const trunkCols = [0x5d5140, 0x6a5c48, 0x4e4536];
    const trunkC = F.pick(trunkCols);
    const tierC = 0x4e5a34;
    const big = F.variant === 1;
    const H = big ? F.rr(16, 17) : F.rr(7.0, 7.5);
    const CR = big ? 3.5 : 2.1;            /* crown radius incl. foliage */
    const br = H * 0.052;                  /* base trunk radius */
    /* root flare */
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, TAU);
      F.rod(Math.cos(a) * br * 2.1, 0, Math.sin(a) * br * 2.1, 0, br * 2.3, 0, br * 0.4, shade(trunkC, -0.1), 'wood');
    }
    /* three tapering trunk segments with a slight sweep */
    const swA = F.rr(0, TAU), sw = H * F.rr(0.01, 0.035);
    const topY = H * 0.74;
    F.frustum(0, 0, 0, br, br * 0.72, topY * 0.42, 0, trunkC, 'wood', 10);
    F.frustum(Math.cos(swA) * sw * 0.5, topY * 0.42, Math.sin(swA) * sw * 0.5, br * 0.72, br * 0.48, topY * 0.32, 0, shade(trunkC, 0.05), 'wood', 10);
    F.frustum(Math.cos(swA) * sw, topY * 0.74, Math.sin(swA) * sw, br * 0.48, br * 0.22, topY * 0.26, 0, shade(trunkC, 0.1), 'wood', 10);
    /* three whorls of limbs, each ending in a tuft of ash-green needle cones */
    const wh = 3;
    for (let w = 0; w < wh; w++) {
      const t = w / (wh - 1);
      const y = H * (0.36 + 0.28 * t);
      const reach = CR * (1.0 - 0.34 * t);
      const nb = 5 - w;
      const a0 = F.rr(0, TAU);
      for (let i = 0; i < nb; i++) {
        const a = a0 + (i / nb) * TAU + F.rr(-0.22, 0.22);
        const cr = H * (big ? 0.055 : 0.075);
        const len = reach - cr;
        const tipx = Math.cos(a) * len, tipz = Math.sin(a) * len;
        const tipy = y + H * F.rr(0.02, 0.07);
        F.rod(0, y, 0, tipx * 0.5, y + (tipy - y) * 0.35, tipz * 0.5, br * 0.24, trunkC, 'wood');
        F.rod(tipx * 0.5, y + (tipy - y) * 0.35, tipz * 0.5, tipx, tipy, tipz, br * 0.13, shade(trunkC, 0.07), 'wood');
        F.cone(tipx, tipy - cr * 0.3, tipz, cr, H * F.rr(0.1, 0.15), 0, shade(tierC, F.rr(-0.06, 0.09)), 'plaster');
        if (w < 2) F.cone(tipx * 0.62, tipy - cr * 0.2, tipz * 0.62, cr * 0.72, H * 0.09, 0, shade(tierC, F.rr(-0.04, 0.06)), 'plaster');
      }
    }
    /* leader */
    F.cone(Math.cos(swA) * sw, H * 0.70, Math.sin(swA) * sw, H * 0.075, H * 0.17, 0, shade(tierC, 0.08), 'plaster');
    F.cone(Math.cos(swA) * sw, H * 0.84, Math.sin(swA) * sw, H * 0.05, H * 0.16, 0, shade(tierC, 0.13), 'plaster');
  }
});

PLANT({
  key: 'voth_reed_succulent_cluster', name: 'Reed / Spiky Succulent Cluster', climate: 'temperate', aridity: 'semiarid',
  w: 4.5, d: 4.5, h: 5, variants: 1,
  build: function (F) {
    const cols = [0x616a41, 0x6a6c46, 0x4e5a34];
    const H = F.rr(4.6, 5.0);
    /* a fat basal boot the blades erupt from */
    F.blob(0, 0.3, 0, 0.62, 0.8, 0, shade(cols[2], -0.12), 'plaster');
    const n = 15;
    const a0 = F.rr(0, TAU);
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * TAU * 1.61803 + F.rr(-0.12, 0.12);
      const len = H * F.rr(0.55, 1.0);
      const out = 2.2 * (len / H) * F.rr(0.72, 1.0);   /* taller blades stand straighter */
      const bx = Math.cos(a) * 0.22, bz = Math.sin(a) * 0.22;
      const mx = bx + Math.cos(a) * out * 0.45, mz = bz + Math.sin(a) * out * 0.45;
      const tx = bx + Math.cos(a) * out, tz = bz + Math.sin(a) * out;
      const c = F.pick(cols);
      /* two-segment blade that bends over near the tip */
      F.beam(bx, 0.15, bz, mx, len * 0.72, mz, 0.17, 0.05, c, 'plaster');
      F.beam(mx, len * 0.72, mz, tx, len * F.rr(0.85, 1.0), tz, 0.1, 0.035, shade(c, 0.07), 'plaster');
    }
    /* seed spikes rising clear of the clump */
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.1, 0.5);
      const sx = Math.cos(a) * rad, sz = Math.sin(a) * rad;
      const sh = H * F.rr(0.88, 1.0);
      F.rod(sx, 0.2, sz, sx * 1.6, sh * 0.8, sz * 1.6, 0.05, 0x8a8a5c, 'wood');
      F.blob(sx * 1.7, sh * 0.88, sz * 1.7, 0.13, sh * 0.22, 0, 0x9a8a63, 'plaster');
    }
  }
});

PLANT({
  key: 'voth_orchard_tree', name: 'Orchard Fruit Tree', climate: 'temperate', aridity: 'subhumid',
  w: 5.7, d: 5.7, h: 6, variants: 1,
  build: function (F) {
    const trunkC = 0x5a4b3a;
    const leafC = F.pick([0x6f7d42, 0x9a9a5a, 0x76854a]);
    const H = F.rr(5.5, 6.0), CR = 2.45;
    for (let i = 0; i < 3; i++) {          /* root flare */
      const a = F.rr(0, TAU);
      F.rod(Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5, 0, 0.45, 0, 0.1, shade(trunkC, -0.1), 'wood');
    }
    F.frustum(0, 0, 0, 0.3, 0.24, 1.35, 0, trunkC, 'wood', 10);
    F.frustum(0, 1.35, 0, 0.24, 0.19, 0.85, 0, shade(trunkC, 0.05), 'wood', 10);
    /* an open vase of primary limbs, each with two branchlets and a foliage cluster */
    const nb = 5, a0 = F.rr(0, TAU);
    for (let i = 0; i < nb; i++) {
      const a = a0 + (i / nb) * TAU + F.rr(-0.25, 0.25);
      const reach = (CR - 0.75) * F.rr(0.75, 1.0);
      const lx = Math.cos(a) * reach, lz = Math.sin(a) * reach;
      const ly = H * F.rr(0.72, 0.85);
      F.rod(0, 2.1, 0, lx * 0.55, 2.1 + (ly - 2.1) * 0.6, lz * 0.55, 0.13, trunkC, 'wood');
      F.rod(lx * 0.55, 2.1 + (ly - 2.1) * 0.6, lz * 0.55, lx, ly, lz, 0.08, shade(trunkC, 0.06), 'wood');
      for (let j = 0; j < 2; j++) {
        const a2 = a + F.rr(-0.9, 0.9);
        const tr = F.rr(0.35, 0.7);
        const tx = lx + Math.cos(a2) * tr, tz = lz + Math.sin(a2) * tr;
        const ty = ly + F.rr(-0.15, 0.45);
        F.rod(lx, ly, lz, tx, ty, tz, 0.045, shade(trunkC, 0.1), 'wood');
        F.blob(tx, ty + 0.2, tz, F.rr(0.55, 0.8), F.rr(0.5, 0.75), F.rr(0, TAU), shade(leafC, F.rr(-0.08, 0.08)), 'plaster');
      }
      if (F.chance(0.75)) {
        const fa = a + F.rr(-0.5, 0.5);
        F.ball(lx * 0.85 + Math.cos(fa) * 0.3, ly - F.rr(0.15, 0.5), lz * 0.85 + Math.sin(fa) * 0.3, F.rr(0.11, 0.17), F.pick([0xc2503a, 0xd8862a, 0xb8453a]), 'plaster');
      }
    }
    /* inner crown fill */
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.2, 1.0);
      F.blob(Math.cos(a) * rad, F.rr(3.4, 4.6), Math.sin(a) * rad, F.rr(0.6, 0.85), F.rr(0.55, 0.8), F.rr(0, TAU), shade(leafC, F.rr(-0.1, 0.05)), 'plaster');
    }
  }
});

PLANT({
  key: 'voth_tree_fern', name: 'Tree Fern', climate: 'temperate', aridity: 'humid',
  w: 6, d: 6, h: 9, variants: 1,
  build: function (F) {
    const trunkC = 0x5d5140;
    const fernCols = [0x2e5a2a, 0x3a6a30, 0x27502a];
    const H = F.rr(8.5, 9.0);
    const crown = H * 0.70;
    const la = F.rr(0, TAU), lean = F.rr(0.02, 0.05);
    const cx = Math.cos(la) * lean * H, cz = Math.sin(la) * lean * H;
    /* fibrous trunk in four segments, with leaf-scar rings */
    for (let s = 0; s < 4; s++) {
      const t0 = s / 4, t1 = (s + 1) / 4;
      F.frustum(cx * t0, crown * t0, cz * t0, 0.34 - 0.05 * s, 0.34 - 0.05 * (s + 1), crown * (t1 - t0), 0, shade(trunkC, s * 0.03), 'wood', 10);
      F.cyl(cx * t1, crown * t1 - 0.06, cz * t1, 0.38 - 0.05 * s, 0.12, 0, shade(trunkC, -0.14), 'wood');
    }
    /* arching fronds: three segments each, rising then drooping */
    const n = 9, a0 = F.rr(0, TAU);
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * TAU + F.rr(-0.15, 0.15);
      const len = F.rr(2.55, 2.95);
      const rise = F.rr(0.9, 1.5), drop = F.rr(1.0, 1.9);
      const c = F.pick(fernCols);
      let px = cx, py = crown, pz = cz;
      for (let s = 1; s <= 3; s++) {
        const t = s / 3;
        const nx = cx + Math.cos(a) * len * t, nz = cz + Math.sin(a) * len * t;
        const ny = crown + rise * Math.sin(t * Math.PI * 0.58) - drop * t * t;
        F.beam(px, py, pz, nx, ny, nz, 0.42 - 0.1 * s, 0.07, shade(c, (s - 2) * 0.05), 'plaster');
        px = nx; py = ny; pz = nz;
      }
    }
    /* dead fronds hanging as a skirt below the crown */
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU);
      const ox = cx + Math.cos(a) * 0.9, oz = cz + Math.sin(a) * 0.9;
      F.beam(cx, crown - 0.15, cz, ox, crown - 0.9, oz, 0.3, 0.06, 0x7a6a48, 'plaster');
      F.beam(ox, crown - 0.9, oz, ox * 1.15, crown - 2.0, oz * 1.15, 0.2, 0.05, 0x6a5c40, 'plaster');
    }
    /* croziers uncurling at the centre */
    F.blob(cx, crown + 0.2, cz, 0.36, 0.5, 0, shade(fernCols[0], -0.1), 'plaster');
    for (let i = 0; i < 2; i++) {
      const a = F.rr(0, TAU);
      F.rod(cx, crown + 0.1, cz, cx + Math.cos(a) * 0.3, crown + F.rr(0.9, 1.5), cz + Math.sin(a) * 0.3, 0.07, fernCols[1], 'plaster');
      F.ball(cx + Math.cos(a) * 0.35, crown + F.rr(1.0, 1.6), cz + Math.sin(a) * 0.35, 0.16, shade(fernCols[1], 0.12), 'plaster');
    }
  }
});

PLANT({
  key: 'voth_giant_groundsel', name: 'Giant Groundsel', climate: 'temperate', aridity: 'subhumid',
  w: 4.8, d: 5.1, h: 7, variants: 1,
  build: function (F) {
    const trunkC = 0x5a4b3a;
    const leafC = 0x5a6a34;
    const deadC = 0x9a8a63;
    const H = F.rr(6.4, 7.0);
    const forked = F.chance(0.45);
    /* rosette head: a whorl of thick paddle leaves plus an inflorescence */
    const head = function (hx, hy, hz, sc) {
      const n = Math.floor(14 * sc);
      const a0 = F.rr(0, TAU);
      for (let i = 0; i < n; i++) {
        const a = a0 + (i / n) * TAU;
        const out = F.rr(1.72, 1.98) * sc;
        const droop = (i % 3 === 0) ? F.rr(0.35, 0.7) : F.rr(-0.25, 0.15);
        F.beam(hx + Math.cos(a) * 0.18, hy, hz + Math.sin(a) * 0.18,
          hx + Math.cos(a) * out, hy + 0.35 * sc - droop, hz + Math.sin(a) * out,
          0.4 * sc, 0.07, shade(leafC, F.rr(-0.1, 0.12)), 'plaster');
      }
      F.blob(hx, hy + 0.2 * sc, hz, 0.42 * sc, 0.5 * sc, 0, shade(leafC, -0.14), 'plaster');
      F.rod(hx, hy + 0.2, hz, hx, hy + 0.95 * sc, hz, 0.07, shade(trunkC, 0.1), 'wood');
      F.blob(hx, hy + 1.1 * sc, hz, 0.22 * sc, 0.5 * sc, 0, 0xd8d08a, 'plaster');
    };
    const mainTop = forked ? H * 0.68 : H * 0.80;
    F.frustum(0, 0, 0, 0.58, 0.44, mainTop * 0.5, 0, trunkC, 'wood', 10);
    F.frustum(0, mainTop * 0.5, 0, 0.44, 0.34, mainTop * 0.5, 0, shade(trunkC, 0.06), 'wood', 10);
    /* persistent skirt of dead leaves clothing the trunk */
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU * 1.61803;
      const y = mainTop * F.rr(0.12, 0.92);
      F.beam(Math.cos(a) * 0.4, y, Math.sin(a) * 0.4,
        Math.cos(a) * 0.72, y - F.rr(0.5, 0.9), Math.sin(a) * 0.72, 0.3, 0.06, shade(deadC, F.rr(-0.15, 0.05)), 'plaster');
    }
    if (forked) {
      for (let b = 0; b < 2; b++) {
        const a = F.rr(0, TAU) + b * Math.PI;
        const bx = Math.cos(a) * F.rr(0.75, 1.1), bz = Math.sin(a) * F.rr(0.75, 1.1);
        const by = H * F.rr(0.88, 1.0) - 0.9;
        F.rod(0, mainTop - 0.3, 0, bx, by, bz, 0.26, trunkC, 'wood');
        head(bx, by, bz, 0.78);
      }
    } else {
      head(0, mainTop, 0, 1.0);
    }
  }
});

PLANT({
  key: 'voth_birch', name: 'Birch', climate: 'temperate', aridity: 'subhumid',
  w: 6.6, d: 6.8, h: 14, variants: 1,
  build: function (F) {
    const barkCols = [0xe3ded0, 0xd5cfbe, 0xece7da];
    const barkC = F.pick(barkCols);
    const leafC = 0x8fae5a;
    const H = F.rr(13.2, 14.0), CR = 2.9;
    for (let i = 0; i < 3; i++) {          /* root flare */
      const a = F.rr(0, TAU);
      F.rod(Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55, 0, 0.5, 0, 0.1, 0x8a8172, 'wood');
    }
    const swA = F.rr(0, TAU), sw = F.rr(0.15, 0.4);
    F.frustum(0, 0, 0, 0.34, 0.27, H * 0.34, 0, barkC, 'wood', 12);
    F.frustum(Math.cos(swA) * sw * 0.5, H * 0.34, Math.sin(swA) * sw * 0.5, 0.27, 0.2, H * 0.28, 0, shade(barkC, 0.02), 'wood', 12);
    F.frustum(Math.cos(swA) * sw, H * 0.62, Math.sin(swA) * sw, 0.2, 0.1, H * 0.24, 0, shade(barkC, 0.04), 'wood', 12);
    for (let i = 0; i < 5; i++) {          /* dark lenticel bands */
      F.cyl(Math.cos(swA) * sw * F.rnd(), H * F.rr(0.08, 0.7), Math.sin(swA) * sw * F.rnd(), 0.3 - i * 0.03, 0.09, 0, 0x4a463c, 'wood');
    }
    /* five ascending limbs, each splitting into two twiggy sprays of foliage */
    const nb = 5, a0 = F.rr(0, TAU);
    for (let i = 0; i < nb; i++) {
      const a = a0 + (i / nb) * TAU + F.rr(-0.3, 0.3);
      const y0 = H * (0.5 + 0.09 * i / nb) + F.rr(0, 1.2);
      const reach = (CR - 0.85) * F.rr(0.7, 1.0);
      const lx = Math.cos(a) * reach, lz = Math.sin(a) * reach;
      const ly = y0 + F.rr(1.4, 2.6);
      F.rod(0, y0, 0, lx * 0.5, y0 + (ly - y0) * 0.55, lz * 0.5, 0.11, shade(barkC, -0.05), 'wood');
      F.rod(lx * 0.5, y0 + (ly - y0) * 0.55, lz * 0.5, lx, ly, lz, 0.06, shade(barkC, 0.0), 'wood');
      for (let j = 0; j < 2; j++) {
        const a2 = a + F.rr(-0.8, 0.8);
        const tr = F.rr(0.3, 0.75);
        const tx = lx + Math.cos(a2) * tr, tz = lz + Math.sin(a2) * tr;
        const ty = ly + F.rr(-0.5, 0.7);
        F.rod(lx, ly, lz, tx, ty, tz, 0.035, 0x8a8172, 'wood');
        F.blob(tx, ty + 0.25, tz, F.rr(0.55, 0.85), F.rr(0.45, 0.7), F.rr(0, TAU), shade(leafC, F.rr(-0.12, 0.12)), 'plaster');
      }
    }
    /* light inner crown so the canopy is not a ring of lollipops */
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.2, 1.3);
      F.blob(Math.cos(a) * rad, F.rr(9.5, 13.2), Math.sin(a) * rad, F.rr(0.55, 0.8), F.rr(0.45, 0.65), F.rr(0, TAU), shade(leafC, F.rr(-0.1, 0.1)), 'plaster');
    }
  }
});

PLANT({
  key: 'voth_monkey_puzzle', name: 'Monkey-Puzzle (Araucaria)', climate: 'temperate', aridity: 'semiarid',
  w: 8, d: 8, h: 20, variants: 1,
  build: function (F) {
    const barkC = 0x5d5140;
    const darkFoliage = 0x2e4a2e;
    /* buttressed base */
    F.cyl(0, 0, 0, 1.1, 0.6, 0, shade(barkC, -0.05), 'wood');
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, TAU);
      F.rod(Math.cos(a) * 1.35, 0, Math.sin(a) * 1.35, 0, 0.95, 0, 0.22, shade(barkC, -0.12), 'wood');
    }
    F.frustum(0, 0.5, 0, 0.6, 0.34, 17, 0, barkC, 'wood', 12);
    for (let i = 0; i < 4; i++) {          /* scaly bark rings */
      F.cyl(0, 1.2 + i * 3.6, 0, 0.58 - i * 0.05, 0.22, 0, shade(barkC, -0.14), 'wood');
    }
    /* five whorls of horizontal limbs, the classic candelabra silhouette */
    const nw = 5;
    for (let w = 0; w < nw; w++) {
      const y = 3.2 + w * 2.9;
      const reach = 3.9 - w * 0.38;
      const nb = Math.floor(F.rr(4, 6.4));
      const a0 = F.rr(0, TAU);
      for (let i = 0; i < nb; i++) {
        const a = a0 + (i / nb) * TAU + F.rr(-0.2, 0.2);
        const len = reach * F.rr(0.82, 1.0) - 0.55;
        const tipx = Math.cos(a) * len, tipz = Math.sin(a) * len;
        const dip = F.rr(-0.5, 0.15);
        F.rod(0, y, 0, tipx, y + dip, tipz, 0.1, barkC, 'wood');
        F.blob(tipx, y + dip + 0.1, tipz, 0.6, 0.8, 0, shade(darkFoliage, F.rr(-0.05, 0.05)), 'plaster');
      }
    }
    F.cone(0, 17.2, 0, 0.5, 2.0, 0, darkFoliage, 'plaster');
    F.cone(0, 18.6, 0, 0.3, 1.4, 0, shade(darkFoliage, 0.06), 'plaster');
    F.ball(0, 19.7, 0, 0.3, darkFoliage, 'plaster');
  }
});

PLANT({
  key: 'voth_shrub_cushion', name: 'Shrub Cushion', climate: 'temperate', aridity: 'subhumid',
  w: 2.6, d: 2.5, h: 1.3, variants: 1,
  build: function (F) {
    const cols = [0x4e5a34, 0x616a41, 0x6a6c46];
    const R = F.rr(1.08, 1.2), H = F.rr(1.05, 1.2);
    /* woody core */
    F.blob(0, 0.18, 0, R * 0.42, 0.34, 0, 0x5a4e40, 'wood');
    /* packed dome of foliage tufts: dense at the crown, tapering at the margin */
    const n = 20;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU * 1.61803 + F.rr(-0.12, 0.12);
      const t = Math.sqrt((i + 0.4) / n);
      const rad = R * t * F.rr(0.85, 1.0);
      const top = H * (1.0 - 0.62 * t * t) * F.rr(0.9, 1.0);
      const r = R * F.rr(0.2, 0.3) * (1.05 - 0.3 * t);
      F.blob(Math.cos(a) * rad, top - r * 0.5, Math.sin(a) * rad, r, r * 1.5, F.rr(0, TAU), F.pick(cols), 'plaster');
    }
    /* a scatter of tiny flowers over the cushion */
    for (let i = 0; i < 5; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0, R * 0.85);
      F.ball(Math.cos(a) * rad, H * F.rr(0.65, 0.95), Math.sin(a) * rad, 0.055, F.pick([0xe8d48a, 0xe0b0c0, 0xf0e6c8]), 'plaster');
    }
  }
});

PLANT({
  key: 'voth_shrub_broom', name: 'Shrub Broom', climate: 'temperate', aridity: 'subhumid',
  w: 2, d: 2, h: 1.5, variants: 1,
  build: function (F) {
    const cols = [0x616a41, 0x6a6c46, 0x58643c];
    const H = F.rr(1.3, 1.4), R = F.rr(0.85, 0.98);
    F.cyl(0, 0, 0, 0.08, 0.18, 0, 0x5a4028, 'wood');
    /* twenty-four wiry stems fanning from one woody crown */
    const n = 24;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU * 1.61803 + F.rr(-0.15, 0.15);
      const t = (i % 4) / 3;
      const out = R * (0.62 + 0.38 * t) * F.rr(0.88, 1.0);
      const hh = H * F.rr(0.66, 1.0);
      const c = F.pick(cols);
      F.rod(0, 0.14, 0, Math.cos(a) * out, hh, Math.sin(a) * out, 0.026, c, 'plaster');
      if (i % 4 === 0) {
        F.blob(Math.cos(a) * out, hh + 0.04, Math.sin(a) * out, 0.07, 0.16, 0, shade(c, 0.1), 'plaster');
      }
    }
    /* pea flowers near the tips */
    for (let i = 0; i < 5; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.25, R * 0.9);
      F.ball(Math.cos(a) * rad, H * F.rr(0.6, 0.95), Math.sin(a) * rad, 0.05, 0xe8c84a, 'plaster');
    }
  }
});

PLANT({
  key: 'voth_succulent_rosette', name: 'Succulent - Rosette', climate: 'temperate', aridity: 'arid',
  w: 2, d: 2, h: 1.2, variants: 1,
  build: function (F) {
    const cols = [0x7e9a8a, 0x8fa898, 0x6b8879];
    const R = F.rr(0.96, 1.06);
    const c0 = F.pick(cols);
    /* phyllotactic spiral: outer leaves lie almost flat, inner ones stand up */
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = i * 2.39996;                 /* golden angle */
      const t = 1 - i / n;                   /* 1 = outermost */
      const out = R * (0.3 + 0.7 * t);
      const lift = 0.06 + 0.42 * (1 - t);
      const tipUp = 0.1 + 0.55 * (1 - t);
      const c = shade(c0, (i % 3 - 1) * 0.06);
      F.beam(Math.cos(a) * 0.08, 0.05 + lift * 0.35, Math.sin(a) * 0.08,
        Math.cos(a) * out, 0.05 + lift + tipUp * 0.5, Math.sin(a) * out,
        0.2 + 0.14 * t, 0.07, c, 'plaster');
      if (i % 3 === 0) {                     /* reddened leaf tip */
        F.ball(Math.cos(a) * out, 0.05 + lift + tipUp * 0.5, Math.sin(a) * out, 0.045, 0xb06a5a, 'plaster');
      }
    }
    /* flower spike — this is what carries the rosette to its declared height */
    F.rod(0, 0.3, 0, F.rr(-0.06, 0.06), 0.95, F.rr(-0.06, 0.06), 0.035, shade(c0, -0.1), 'wood');
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, TAU);
      F.ball(Math.cos(a) * 0.1, F.rr(0.85, 1.14), Math.sin(a) * 0.1, F.rr(0.06, 0.09), 0xe8b3c2, 'plaster');
    }
  }
});

PLANT({
  key: 'voth_succulent_paddle', name: 'Succulent - Paddle (Prickly-Pear)', climate: 'temperate', aridity: 'arid',
  w: 3.2, d: 3.2, h: 1.8, variants: 1,
  build: function (F) {
    const cols = [0x7e9a8a, 0x8fa898, 0x6b8879];
    /* a pad plus its areole spines; pads chain off one another in a fan */
    const pad = function (px, py, pz, pw, ph, ang, c) {
      F.box(px, py, pz, pw, ph, 0.12, -ang, c, 'plaster');
      F.blob(px, py + ph * 0.5, pz, pw * 0.42, ph * 0.5, -ang, shade(c, 0.04), 'plaster');
      for (let s = 0; s < 2; s++) {
        const t = (s + 0.6) / 2;
        F.rod(px + Math.cos(ang) * pw * 0.42, py + ph * t, pz + Math.sin(ang) * pw * 0.42,
          px + Math.cos(ang) * (pw * 0.42 + 0.13), py + ph * t + 0.07, pz + Math.sin(ang) * (pw * 0.42 + 0.13),
          0.014, 0xe0dcc4, 'plaster');
      }
      return [px + Math.cos(ang) * pw * 0.34, py + ph * 0.84, pz + Math.sin(ang) * pw * 0.34];
    };
    F.rod(0, 0, 0, 0, 0.16, 0, 0.14, 0x6a5c48, 'wood');
    const base = F.rr(0, TAU);
    const p0 = pad(0, 0.1, 0, 0.66, 0.7, base, F.pick(cols));
    const tips = [];
    for (let i = 0; i < 3; i++) {
      const a = base + (i - 1) * F.rr(1.0, 1.4);
      const px = p0[0] + Math.cos(a) * 0.44, pz = p0[2] + Math.sin(a) * 0.44;
      tips.push(pad(px, p0[1], pz, F.rr(0.52, 0.62), F.rr(0.46, 0.6), a, F.pick(cols)));
    }
    for (let i = 0; i < 3; i++) {
      const t = tips[i];
      const a = base + (i - 1) * F.rr(1.1, 1.5) + F.rr(-0.4, 0.4);
      const px = t[0] + Math.cos(a) * 0.42, pz = t[2] + Math.sin(a) * 0.42;
      const top = pad(px, t[1], pz, F.rr(0.36, 0.48), F.rr(0.34, 0.46), a, F.pick(cols));
      if (i !== 1) F.ball(top[0], top[1] + 0.06, top[2], 0.1, F.pick([0xe8c84a, 0xd8603a]), 'plaster');
    }
  }
});

PLANT({
  key: 'voth_succulent_finger', name: 'Succulent - Finger', climate: 'temperate', aridity: 'arid',
  w: 1.9, d: 1.9, h: 1.5, variants: 1,
  build: function (F) {
    const cols = [0x7e9a8a, 0x8fa898, 0x6b8879];
    const R = F.rr(0.6, 0.72), H = F.rr(1.4, 1.5);
    F.blob(0, 0.09, 0, R * 0.55, 0.22, 0, 0x6a5c48, 'plaster');
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU * 1.61803 + F.rr(-0.2, 0.2);
      const rad = R * Math.sqrt((i + 0.5) / n) * F.rr(0.7, 1.0);
      const x0 = Math.cos(a) * rad, z0 = Math.sin(a) * rad;
      const lean = rad * F.rr(0.25, 0.6);
      const total = H * F.rr(0.42, 1.0);
      const c = F.pick(cols);
      const segs = 3;
      let y = 0.05;
      for (let s = 0; s < segs; s++) {
        const t = (s + 0.5) / segs;
        const segH = total / segs;
        const sx = x0 + Math.cos(a) * lean * t, sz = z0 + Math.sin(a) * lean * t;
        F.blob(sx, y + segH * 0.5, sz, 0.15 - s * 0.018, segH * 1.25, 0, shade(c, s * 0.05), 'plaster');
        y += segH * 0.86;
      }
      if (i % 3 === 0) F.ball(x0 + Math.cos(a) * lean, y + 0.05, z0 + Math.sin(a) * lean, 0.065, 0xd8a24a, 'plaster');
    }
  }
});

PLANT({
  key: 'voth_succulent_barrel', name: 'Succulent - Barrel', climate: 'temperate', aridity: 'arid',
  w: 1.4, d: 1.4, h: 1, variants: 1,
  build: function (F) {
    const cols = [0x7e9a8a, 0x8fa898, 0x6b8879];
    const c = F.pick(cols);
    const R = F.rr(0.46, 0.52), H = F.rr(0.86, 0.94);
    F.blob(0, H * 0.5, 0, R, H, 0, c, 'plaster');
    const nr = 11;
    for (let i = 0; i < nr; i++) {
      const a = (i / nr) * TAU;
      /* rib crest, then a pair of spines standing off it */
      F.box(Math.cos(a) * R * 0.94, H * 0.06, Math.sin(a) * R * 0.94, 0.07, H * 0.85, 0.07, -a, shade(c, -0.12), 'plaster');
      if (i % 2 === 0) {
        const y = H * F.rr(0.35, 0.8);
        F.rod(Math.cos(a) * R * 0.95, y, Math.sin(a) * R * 0.95,
          Math.cos(a) * (R + 0.14), y + F.rr(0.02, 0.1), Math.sin(a) * (R + 0.14), 0.016, 0xe0dcc4, 'plaster');
        F.rod(Math.cos(a) * R * 0.95, y, Math.sin(a) * R * 0.95,
          Math.cos(a) * (R + 0.12), y - F.rr(0.06, 0.14), Math.sin(a) * (R + 0.12), 0.014, 0xd8cfae, 'plaster');
      }
    }
    /* woolly crown with a ring of flowers */
    F.blob(0, H * 0.94, 0, R * 0.46, 0.14, 0, 0xd8d4c0, 'plaster');
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + F.rr(-0.3, 0.3);
      F.blob(Math.cos(a) * R * 0.34, H * 0.98, Math.sin(a) * R * 0.34, 0.09, 0.13, 0, F.pick([0xe8c84a, 0xe0906a]), 'plaster');
    }
  }
});

PLANT({
  key: 'voth_park_baobab', name: 'Park Exotic - Baobab', climate: 'temperate', aridity: 'subhumid',
  w: 11.6, d: 11.2, h: 18, variants: 1,
  build: function (F) {
    const trunkC = 0x8a7a66;
    const leafC = 0x6f7d42;
    const H = F.rr(17, 18), CR = 4.8;
    /* splayed surface roots */
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + F.rr(-0.25, 0.25);
      F.rod(Math.cos(a) * F.rr(2.9, 3.6), 0, Math.sin(a) * F.rr(2.9, 3.6), 0, 1.8, 0, F.rr(0.3, 0.48), shade(trunkC, -0.12), 'wood');
    }
    /* the swollen bottle trunk */
    F.frustum(0, 0, 0, 2.5, 2.35, 4.0, 0, trunkC, 'wood', 12);
    F.frustum(0, 4.0, 0, 2.35, 1.85, 4.2, 0, shade(trunkC, 0.03), 'wood', 12);
    F.frustum(0, 8.2, 0, 1.85, 1.15, 3.4, 0, shade(trunkC, 0.06), 'wood', 12);
    /* the "upside-down roots" crown */
    const nb = 6, a0 = F.rr(0, TAU);
    for (let i = 0; i < nb; i++) {
      const a = a0 + (i / nb) * TAU + F.rr(-0.24, 0.24);
      const reach = (CR - 1.0) * F.rr(0.75, 1.0);
      const lx = Math.cos(a) * reach, lz = Math.sin(a) * reach;
      const ly = H * F.rr(0.82, 0.96);
      F.rod(0, 11.4, 0, lx * 0.45, 11.4 + (ly - 11.4) * 0.55, lz * 0.45, 0.42, trunkC, 'wood');
      F.rod(lx * 0.45, 11.4 + (ly - 11.4) * 0.55, lz * 0.45, lx, ly, lz, 0.2, shade(trunkC, 0.05), 'wood');
      for (let j = 0; j < 2; j++) {
        const a2 = a + F.rr(-0.9, 0.9);
        const tr = F.rr(0.5, 1.1);
        const tx = lx + Math.cos(a2) * tr, tz = lz + Math.sin(a2) * tr;
        const ty = ly + F.rr(-0.4, 0.5);
        F.rod(lx, ly, lz, tx, ty, tz, 0.09, shade(trunkC, 0.1), 'wood');
        F.blob(tx, ty + 0.25, tz, F.rr(0.8, 1.15), F.rr(0.5, 0.8), F.rr(0, TAU), shade(leafC, F.rr(-0.1, 0.1)), 'plaster');
      }
    }
    /* pendulous fruit */
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, TAU), rad = F.rr(1.2, 3.0);
      const px = Math.cos(a) * rad, pz = Math.sin(a) * rad, py = F.rr(13.5, 16);
      F.rod(px, py, pz, px, py - 0.8, pz, 0.025, 0x6a5c48, 'wood');
      F.blob(px, py - 1.0, pz, 0.2, 0.42, 0, 0xb8a882, 'plaster');
    }
  }
});

PLANT({
  key: 'voth_park_dragon_tree', name: 'Park Exotic - Dragon Tree', climate: 'temperate', aridity: 'subhumid',
  w: 8.4, d: 8.3, h: 12, variants: 1,
  build: function (F) {
    const trunkC = 0x6a5c48;
    const leafC = 0x2e4a2e;
    const H = F.rr(11.4, 12.0);
    /* rosette of stiff sword leaves at the end of every terminal branch */
    const rosette = function (rx, ry2, rz, sc) {
      F.blob(rx, ry2, rz, 0.3 * sc, 0.35 * sc, 0, shade(trunkC, 0.08), 'wood');
      const n = 6, a0 = F.rr(0, TAU);
      for (let i = 0; i < n; i++) {
        const a = a0 + (i / n) * TAU;
        const out = F.rr(0.85, 1.25) * sc;
        F.beam(rx, ry2, rz, rx + Math.cos(a) * out, ry2 + F.rr(0.35, 0.8) * sc, rz + Math.sin(a) * out,
          0.26 * sc, 0.05, shade(leafC, F.rr(-0.06, 0.1)), 'plaster');
      }
    };
    F.frustum(0, 0, 0, 0.62, 0.46, 3.2, 0, trunkC, 'wood', 12);
    F.frustum(0, 3.2, 0, 0.46, 0.38, 2.4, 0, shade(trunkC, 0.05), 'wood', 12);
    /* dichotomous forking: 3 primaries, each splitting into 2 */
    const a0 = F.rr(0, TAU);
    for (let i = 0; i < 3; i++) {
      const a = a0 + (i / 3) * TAU + F.rr(-0.2, 0.2);
      const lx = Math.cos(a) * F.rr(1.0, 1.5), lz = Math.sin(a) * F.rr(1.0, 1.5);
      const ly = F.rr(7.4, 8.4);
      F.rod(0, 5.4, 0, lx, ly, lz, 0.28, trunkC, 'wood');
      for (let j = 0; j < 2; j++) {
        const a2 = a + (j ? 1 : -1) * F.rr(0.45, 0.85);
        const reach = F.rr(1.1, 1.7);
        const tx = lx + Math.cos(a2) * reach, tz = lz + Math.sin(a2) * reach;
        const ty = ly + F.rr(1.5, 2.4);
        F.rod(lx, ly, lz, tx, ty, tz, 0.16, shade(trunkC, 0.06), 'wood');
        rosette(tx, ty, tz, F.rr(0.95, 1.2));
      }
    }
    /* one lower, older rosette on a side branch */
    const sa = F.rr(0, TAU);
    const sx = Math.cos(sa) * 1.9, sz = Math.sin(sa) * 1.9;
    F.rod(0, 5.0, 0, sx, 6.6, sz, 0.14, trunkC, 'wood');
    rosette(sx, 6.6, sz, 0.8);
  }
});

PLANT({
  key: 'voth_park_cherry_blossom', name: 'Park Exotic - Cherry Blossom', climate: 'temperate', aridity: 'subhumid',
  w: 7.9, d: 8.1, h: 10, variants: 1,
  build: function (F) {
    const trunkC = 0x5a4b3a;
    const pinks = [0xf3d6de, 0xecc3cf, 0xe8b3c2];
    const H = F.rr(9.4, 10.0), CR = 3.4;
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU);
      F.rod(Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6, 0, 0.55, 0, 0.11, shade(trunkC, -0.1), 'wood');
    }
    F.frustum(0, 0, 0, 0.36, 0.3, 1.8, 0, trunkC, 'wood', 10);
    F.frustum(0, 1.8, 0, 0.3, 0.24, 1.5, 0, shade(trunkC, 0.05), 'wood', 10);
    /* five arching limbs, each with two branchlets carrying blossom */
    const nb = 5, a0 = F.rr(0, TAU);
    for (let i = 0; i < nb; i++) {
      const a = a0 + (i / nb) * TAU + F.rr(-0.3, 0.3);
      const reach = (CR - 0.85) * F.rr(0.7, 1.0);
      const lx = Math.cos(a) * reach, lz = Math.sin(a) * reach;
      const ly = F.rr(5.6, 7.2);
      F.rod(0, 3.3, 0, lx * 0.5, 3.3 + (ly - 3.3) * 0.6, lz * 0.5, 0.15, trunkC, 'wood');
      F.rod(lx * 0.5, 3.3 + (ly - 3.3) * 0.6, lz * 0.5, lx, ly, lz, 0.08, shade(trunkC, 0.07), 'wood');
      for (let j = 0; j < 2; j++) {
        const a2 = a + F.rr(-0.9, 0.9);
        const tr = F.rr(0.35, 0.8);
        const tx = lx + Math.cos(a2) * tr, tz = lz + Math.sin(a2) * tr;
        const ty = ly + F.rr(0.2, 1.4);
        F.rod(lx, ly, lz, tx, ty, tz, 0.045, shade(trunkC, 0.12), 'wood');
        F.blob(tx, ty + 0.3, tz, F.rr(0.65, 0.95), F.rr(0.45, 0.7), F.rr(0, TAU), F.pick(pinks), 'plaster');
        F.blob(tx * 0.8, ty + 0.05, tz * 0.8, F.rr(0.45, 0.7), F.rr(0.35, 0.55), F.rr(0, TAU), F.pick(pinks), 'plaster');
      }
    }
    /* crown fill and a few darker leaf tufts showing through the flowers */
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.3, 1.8);
      F.blob(Math.cos(a) * rad, F.rr(6.4, H - 0.6), Math.sin(a) * rad, F.rr(0.6, 0.95), F.rr(0.45, 0.7), F.rr(0, TAU), F.pick(pinks), 'plaster');
    }
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.8, 2.4);
      F.blob(Math.cos(a) * rad, F.rr(5.2, 7.4), Math.sin(a) * rad, F.rr(0.35, 0.5), 0.3, F.rr(0, TAU), 0x6f7d42, 'plaster');
    }
  }
});

PLANT({
  key: 'voth_emperor_mushroom', name: 'Emperor Mushroom (Landmark Fungus)', climate: 'temperate', aridity: 'semiarid',
  w: 18, d: 18, h: 30, variants: 1,
  build: function (F) {
    const stalkC = 0xc8bfa6;
    const capC = 0x8d6a5e;
    const stipeTop = 22.0, R = 8.6;
    /* volva and buttressing mycelial roots */
    F.blob(0, 1.3, 0, 3.7, 3.0, 0, shade(stalkC, -0.14), 'stone');
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + F.rr(-0.25, 0.25);
      F.rod(Math.cos(a) * F.rr(3.6, 4.6), 0, Math.sin(a) * F.rr(3.6, 4.6), 0, 2.6, 0, F.rr(0.4, 0.62), shade(stalkC, -0.2), 'stone');
    }
    /* four-segment tapering stipe */
    F.frustum(0, 1.6, 0, 2.9, 2.4, 6.0, 0, stalkC, 'stone', 12);
    F.frustum(0, 7.6, 0, 2.4, 2.0, 5.6, 0, shade(stalkC, 0.03), 'stone', 12);
    F.frustum(0, 13.2, 0, 2.0, 1.7, 5.0, 0, shade(stalkC, 0.06), 'stone', 12);
    F.frustum(0, 18.2, 0, 1.7, 1.5, 3.8, 0, shade(stalkC, 0.09), 'stone', 12);
    /* the great annulus, hanging as a skirt */
    F.cyl(0, 16.6, 0, 3.3, 0.5, 0, shade(stalkC, -0.1), 'stone');
    F.dome(0, 16.4, 0, 3.5, 0.9, 0, shade(stalkC, -0.18), 'stone');
    /* radial gills, then rim, then the cap */
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * TAU;
      F.box(Math.cos(a) * R * 0.56, stipeTop - 1.1, Math.sin(a) * R * 0.56,
        R * 0.82, 1.1, 0.34, -a, shade(capC, -0.3), 'plaster');
    }
    F.cyl(0, stipeTop - 1.25, 0, R * 0.99, 1.3, 0, shade(capC, -0.15), 'plaster');
    F.dome(0, stipeTop, 0, R, 6.2, 0, capC, 'plaster');
    F.dome(0, stipeTop + 0.5, 0, R * 0.52, 4.6, 0, shade(capC, 0.08), 'plaster');
    /* veil warts scattered over the cap */
    for (let i = 0; i < 8; i++) {
      const a = F.rr(0, TAU), rr = F.rr(0.15, 0.85) * R;
      const yy = stipeTop + 6.2 * Math.sqrt(Math.max(0, 1 - (rr / R) * (rr / R))) * 0.92;
      F.blob(Math.cos(a) * rr, yy, Math.sin(a) * rr, F.rr(0.45, 0.8), F.rr(0.3, 0.55), 0, shade(capC, 0.34), 'plaster');
    }
    /* a court of lesser fungi at its foot */
    const stalkCols = [0xbdb49c, 0xaca38c, 0xc8bfa6];
    const capCols = [0x8d6a5e, 0x9a7a5c, 0x8a7a52];
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU) + i * 2.1, rad = F.rr(5.0, 7.2);
      const cx = Math.cos(a) * rad, cz = Math.sin(a) * rad;
      const h = F.rr(3.4, 5.6);
      const sC = F.pick(stalkCols), cC = F.pick(capCols);
      const lx = cx + F.rr(-0.3, 0.3), lz = cz + F.rr(-0.3, 0.3);
      F.blob(cx, 0.28, cz, 0.5, 0.7, 0, shade(sC, -0.12), 'stone');
      F.rod(cx, 0.2, cz, (cx + lx) / 2, h * 0.45, (cz + lz) / 2, h * 0.075, sC, 'stone');
      F.rod((cx + lx) / 2, h * 0.45, (cz + lz) / 2, lx, h * 0.8, lz, h * 0.058, shade(sC, 0.05), 'stone');
      const r2 = h * 0.33;
      for (let g = 0; g < 4; g++) {
        const ga = (g / 4) * TAU + a;
        F.box(lx + Math.cos(ga) * r2 * 0.52, h * 0.8 - h * 0.05, lz + Math.sin(ga) * r2 * 0.52,
          r2 * 0.84, h * 0.05, 0.14, -ga, shade(cC, -0.28), 'plaster');
      }
      F.cyl(lx, h * 0.8 - h * 0.06, lz, r2 * 0.96, h * 0.06, 0, shade(cC, -0.14), 'plaster');
      F.dome(lx, h * 0.8, lz, r2, h * 0.2, 0, cC, 'plaster');
    }
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, TAU), rad = F.rr(4.2, 8.0);
      const cx = Math.cos(a) * rad, cz = Math.sin(a) * rad;
      const h = F.rr(0.7, 1.5);
      F.rod(cx, 0, cz, cx + F.rr(-0.15, 0.15), h, cz + F.rr(-0.15, 0.15), 0.1, F.pick(stalkCols), 'stone');
      F.dome(cx, h, cz, F.rr(0.3, 0.55), F.rr(0.2, 0.4), 0, F.pick(capCols), 'plaster');
    }
  }
});

/* ================= Iziz (7 species) ================= */

PLANT({
  key: 'iziz_palm',
  name: 'Jungle Palm',
  climate: 'tropic',
  aridity: 'subhumid',
  w: 8.4, d: 8.2, h: 14,
  variants: 1,
  build: function (F) {
    const trunkColor = 0x5a3d26;
    const frondColors = [0x2c8a5e, 0x1f8f8a, 0x27906a];
    const H = F.rr(13.2, 14.0);
    const crownY = H * 0.90;
    /* a slightly leaning, ringed trunk in five segments */
    const la = F.rr(0, TAU), lean = F.rr(0.03, 0.08) * H;
    const cx = Math.cos(la) * lean, cz = Math.sin(la) * lean;
    for (let s = 0; s < 5; s++) {
      const t0 = s / 5, t1 = (s + 1) / 5;
      F.frustum(cx * t0 * t0, crownY * t0, cz * t0 * t0, 0.42 - 0.035 * s, 0.42 - 0.035 * (s + 1), crownY * 0.2, 0,
        shade(trunkColor, s * 0.03), 'wood', 10);
      F.cyl(cx * t1 * t1, crownY * t1 - 0.09, cz * t1 * t1, 0.46 - 0.035 * s, 0.18, 0, shade(trunkColor, -0.12), 'wood');  /* leaf-scar ring */
    }
    F.frustum(cx, crownY, cz, 0.28, 0.34, 0.5, 0, shade(trunkColor, 0.12), 'wood', 10);   /* crownshaft */
    /* eight arching fronds, each a three-segment blade that rises then droops */
    const n = 8, a0 = F.rr(0, TAU);
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * TAU + F.rr(-0.18, 0.18);
      const len = F.rr(2.9, 3.5);
      const rise = F.rr(0.7, 1.3), drop = F.rr(2.4, 3.8);
      const c = F.pick(frondColors);
      let px = cx, py = crownY + 0.5, pz = cz;
      for (let s = 1; s <= 3; s++) {
        const t = s / 3;
        const nx = cx + Math.cos(a) * len * t, nz = cz + Math.sin(a) * len * t;
        const ny = crownY + 0.5 + rise * Math.sin(t * Math.PI * 0.55) - drop * t * t;
        F.beam(px, py, pz, nx, ny, nz, 0.62 - 0.16 * s, 0.08, shade(c, (s - 2) * 0.06), 'leafy');
        px = nx; py = ny; pz = nz;
      }
    }
    /* dead fronds hanging under the crown */
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU);
      const ox = cx + Math.cos(a) * 1.1, oz = cz + Math.sin(a) * 1.1;
      F.beam(cx, crownY + 0.35, cz, ox, crownY - 0.5, oz, 0.45, 0.07, 0x7a6a44, 'leafy');
      F.beam(ox, crownY - 0.5, oz, ox * 1.1, crownY - 2.3, oz * 1.1, 0.3, 0.06, 0x6a5c38, 'leafy');
    }
    /* nut cluster in the crown */
    F.rod(cx, crownY + 0.5, cz, cx + F.rr(-0.5, 0.5), crownY + 0.1, cz + F.rr(-0.5, 0.5), 0.07, shade(trunkColor, 0.1), 'wood');
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, TAU);
      F.ball(cx + Math.cos(a) * F.rr(0.3, 0.7), crownY + F.rr(-0.1, 0.35), cz + Math.sin(a) * F.rr(0.3, 0.7), F.rr(0.2, 0.3), F.pick([0x9a7a3a, 0x8a6a30]), 'leafy');
    }
  }
});

PLANT({
  key: 'iziz_broadleaf',
  name: 'Broadleaf Tree',
  climate: 'tropic',
  aridity: 'subhumid',
  w: 8.2, d: 8.4, h: 9,
  variants: 1,
  build: function (F) {
    const greens = [0x2e7a3a, 0x3a8a46, 0x276e34];
    const barkC = 0x5a3d26;
    const H = F.rr(8.5, 9.0), CR = 3.4;
    /* small buttress roots */
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + F.rr(-0.3, 0.3);
      F.rod(Math.cos(a) * 0.95, 0, Math.sin(a) * 0.95, 0, 1.1, 0, 0.17, shade(barkC, -0.1), 'wood');
    }
    F.frustum(0, 0, 0, 0.55, 0.44, 2.4, 0, barkC, 'wood', 10);
    F.frustum(0, 2.4, 0, 0.44, 0.34, 1.9, 0, shade(barkC, 0.05), 'wood', 10);
    /* five spreading limbs, each forking into two leafy sprays */
    const nb = 5, a0 = F.rr(0, TAU);
    for (let i = 0; i < nb; i++) {
      const a = a0 + (i / nb) * TAU + F.rr(-0.3, 0.3);
      const reach = (CR - 1.0) * F.rr(0.72, 1.0);
      const lx = Math.cos(a) * reach, lz = Math.sin(a) * reach;
      const ly = F.rr(5.2, 6.4);
      F.rod(0, 4.3, 0, lx * 0.5, 4.3 + (ly - 4.3) * 0.6, lz * 0.5, 0.18, barkC, 'wood');
      F.rod(lx * 0.5, 4.3 + (ly - 4.3) * 0.6, lz * 0.5, lx, ly, lz, 0.1, shade(barkC, 0.07), 'wood');
      for (let j = 0; j < 2; j++) {
        const a2 = a + F.rr(-0.9, 0.9);
        const tr = F.rr(0.4, 0.85);
        const tx = lx + Math.cos(a2) * tr, tz = lz + Math.sin(a2) * tr;
        const ty = ly + F.rr(0.1, 1.1);
        F.rod(lx, ly, lz, tx, ty, tz, 0.055, shade(barkC, 0.12), 'wood');
        F.blob(tx, ty + 0.35, tz, F.rr(0.85, 1.2), F.rr(0.6, 0.95), F.rr(0, TAU), F.pick(greens), 'leafy');
      }
    }
    /* crown fill and a couple of epiphyte clumps on the limbs */
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.2, 1.6);
      F.blob(Math.cos(a) * rad, F.rr(6.0, H - 0.8), Math.sin(a) * rad, F.rr(0.9, 1.3), F.rr(0.6, 0.95), F.rr(0, TAU), F.pick(greens), 'leafy');
    }
    for (let i = 0; i < 2; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.8, 1.8);
      F.blob(Math.cos(a) * rad, F.rr(4.6, 5.8), Math.sin(a) * rad, F.rr(0.3, 0.45), 0.35, F.rr(0, TAU), 0x6aa85a, 'leafy');
    }
  }
});

PLANT({
  key: 'iziz_fern',
  name: 'Jungle Fern',
  climate: 'tropic',
  aridity: 'humid',
  w: 3, d: 3, h: 3,
  variants: 2,
  build: function (F) {
    const glow = F.variant === 1;
    const colors = glow ? [0xe8e04a, 0xd9d233, 0xf2ea6a, 0xc6d63a] : [0x1f8f6a, 0x2c8a5e, 0x24805e];
    const fam = glow ? 'glow' : 'leafy';
    const R = F.rr(1.44, 1.56);
    F.blob(0, 0.12, 0, 0.26, 0.3, 0, glow ? 0xc6d63a : 0x2a5a3a, fam);
    /* nine arching fronds of three segments each */
    const n = 9, a0 = F.rr(0, TAU);
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * TAU + F.rr(-0.16, 0.16);
      const len = R * F.rr(0.9, 1.0);
      const rise = F.rr(2.75, 3.2), drop = F.rr(0.4, 0.85);
      const c = F.pick(colors);
      let px = 0, py = 0.14, pz = 0;
      for (let s = 1; s <= 3; s++) {
        const t = s / 3;
        const nx = Math.cos(a) * len * t, nz = Math.sin(a) * len * t;
        const ny = 0.14 + rise * Math.sin(t * Math.PI * 0.62) - drop * t * t;
        F.beam(px, py, pz, nx, ny, nz, 0.34 - 0.08 * s, 0.05, shade(c, (s - 2) * 0.06), fam);
        px = nx; py = ny; pz = nz;
      }
      /* a pair of pinnae to thicken the blade */
      if (i % 3 === 0) {
        F.beam(px * 0.55, 0.14 + rise * 0.55, pz * 0.55, px * 0.8 + Math.cos(a + 1.4) * 0.3, 0.14 + rise * 0.4, pz * 0.8 + Math.sin(a + 1.4) * 0.3, 0.16, 0.04, shade(c, 0.08), fam);
      }
    }
    /* fiddleheads uncurling from the crown */
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU);
      const hh = F.rr(1.5, 2.4);
      F.rod(0, 0.12, 0, Math.cos(a) * 0.22, hh, Math.sin(a) * 0.22, 0.045, F.pick(colors), fam);
      F.ball(Math.cos(a) * 0.24, hh + 0.08, Math.sin(a) * 0.24, 0.1, F.pick(colors), fam);
    }
    if (glow) {
      F.lamp(F.rr(-0.4, 0.4), 0.9, F.rr(-0.4, 0.4), 0.4, 4);
      F.lamp(F.rr(-0.4, 0.4), 2.1, F.rr(-0.4, 0.4), 0.35, 3.5);
    }
  }
});

PLANT({
  key: 'iziz_bush',
  name: 'Jungle Bush',
  climate: 'tropic',
  aridity: 'subhumid',
  w: 2, d: 2, h: 1.5,
  variants: 1,
  build: function (F) {
    const green = 0x3a8a46;
    const woodC = 0x4a3a28;
    const R = F.rr(0.76, 0.86), H = F.rr(1.35, 1.5);
    /* five stems fanning from a short woody base */
    const a0 = F.rr(0, TAU);
    for (let i = 0; i < 5; i++) {
      const a = a0 + (i / 5) * TAU + F.rr(-0.25, 0.25);
      const out = R * F.rr(0.4, 0.72);
      const kx = Math.cos(a) * out, kz = Math.sin(a) * out;
      const ky = H * F.rr(0.4, 0.62);
      F.rod(0, 0, 0, kx * 0.5, ky * 0.55, kz * 0.5, 0.06, woodC, 'wood');
      F.rod(kx * 0.5, ky * 0.55, kz * 0.5, kx, ky, kz, 0.04, shade(woodC, 0.08), 'wood');
      for (let j = 0; j < 2; j++) {
        const a2 = a + F.rr(-0.9, 0.9);
        const tr = R * F.rr(0.14, 0.26);
        const tx = kx + Math.cos(a2) * tr, tz = kz + Math.sin(a2) * tr;
        const ty = ky + F.rr(0.05, 0.3);
        F.rod(kx, ky, kz, tx, ty, tz, 0.025, shade(woodC, 0.12), 'wood');
        F.blob(tx, ty + 0.08, tz, F.rr(0.24, 0.38), F.rr(0.2, 0.32), F.rr(0, TAU), shade(green, F.rr(-0.1, 0.1)), 'leafy');
      }
    }
    /* inner leaf mass */
    for (let i = 0; i < 5; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0, R * 0.6);
      F.blob(Math.cos(a) * rad, F.rr(0.3, H * 0.8), Math.sin(a) * rad, F.rr(0.3, 0.45), F.rr(0.28, 0.4), F.rr(0, TAU), shade(green, F.rr(-0.1, 0.06)), 'leafy');
    }
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.3, R * 0.9);
      F.ball(Math.cos(a) * rad, F.rr(0.6, H * 0.9), Math.sin(a) * rad, 0.07, F.pick([0xd8503a, 0xe0a02a]), 'leafy');
    }
  }
});

PLANT({
  key: 'iziz_spike',
  name: 'Desert Spike',
  climate: 'tropic',
  aridity: 'arid',
  w: 5, d: 5, h: 6,
  variants: 1,
  build: function (F) {
    const col = 0x7e9a6a;
    const H = F.rr(5.7, 6.0), R = F.rr(2.45, 2.6);
    F.cyl(0, 0, 0, 0.62, 0.9, 0, shade(col, -0.14), 'stone');
    /* basal rosette of stiff sword leaves, longest at the outside */
    const n = 13, a0 = F.rr(0, TAU);
    for (let i = 0; i < n; i++) {
      const a = a0 + i * 2.39996;
      const t = 1 - i / n;
      const out = R * (0.48 + 0.52 * t) * F.rr(0.93, 1.0);
      const up = H * (0.16 + 0.3 * (1 - t));
      const c = shade(col, (i % 3 - 1) * 0.06);
      F.beam(Math.cos(a) * 0.3, 0.7, Math.sin(a) * 0.3, Math.cos(a) * out, 0.7 + up, Math.sin(a) * out, 0.32, 0.07, c, 'plaster');
      if (i % 2 === 0) F.rod(Math.cos(a) * out, 0.7 + up, Math.sin(a) * out, Math.cos(a) * (out + 0.16), 0.7 + up + 0.18, Math.sin(a) * (out + 0.16), 0.03, 0x6a5a3a, 'plaster');
    }
    /* the stacked spike itself */
    let y = 1.6, r = 1.25, hh = 1.5;
    for (let i = 0; i < 3; i++) {
      F.cone(0, y, 0, r, hh, F.rr(0, TAU), shade(col, i * -0.05), 'plaster');
      /* a ring of bracts at the base of each tier */
      for (let j = 0; j < 5; j++) {
        const a = (j / 5) * TAU + i;
        F.beam(Math.cos(a) * r * 0.5, y + 0.1, Math.sin(a) * r * 0.5, Math.cos(a) * r * 1.25, y + 0.5, Math.sin(a) * r * 1.25, 0.2, 0.05, shade(col, 0.1), 'plaster');
      }
      y += hh * 0.92; r *= 0.7; hh *= 0.88;
    }
    F.cone(0, y, 0, 0.3, H - y, 0, shade(col, 0.14), 'plaster');
  }
});

PLANT({
  key: 'iziz_lily_pad',
  name: 'Pond Lily Pad',
  climate: 'tropic',
  aridity: 'humid',
  w: 3.8, d: 3.7, h: 0.8,
  variants: 1,
  build: function (F) {
    const padCols = [0x3f9a4a, 0x358a42, 0x4aa653];
    /* one pad: disc, sunken notch wedge at the rim, optional radial veins */
    const pad = function (px, pz, r, veins) {
      const a = F.rr(0, TAU);
      const c = F.pick(padCols);
      F.cyl(px, 0, pz, r, 0.07, a, c, 'leafy');
      F.box(px + Math.cos(a) * r * 0.55, 0.005, pz + Math.sin(a) * r * 0.55, r * 0.95, 0.075, r * 0.28, -a, shade(c, -0.3), 'leafy');
      for (let i = 0; i < veins; i++) {
        const va = a + (i / veins) * TAU;
        F.box(px + Math.cos(va) * r * 0.45, 0.068, pz + Math.sin(va) * r * 0.45, r * 0.85, 0.02, 0.05, -va, shade(c, -0.14), 'leafy');
      }
    };
    pad(F.rr(-0.2, 0.2), F.rr(-0.2, 0.2), F.rr(0.86, 0.96), 4);
    const pa0 = F.rr(0, TAU);
    for (let i = 0; i < 5; i++) {
      const a = pa0 + i * (TAU / 5), rad = F.rr(1.18, 1.32);
      pad(Math.cos(a) * rad, Math.sin(a) * rad, F.rr(0.46, 0.58), 0);
    }
    /* submerged stems breaking the surface */
    for (let i = 0; i < 2; i++) {
      const a = F.rr(0, TAU);
      F.rod(Math.cos(a) * 0.5, 0.0, Math.sin(a) * 0.5, Math.cos(a) * 0.15, 0.22, Math.sin(a) * 0.15, 0.035, 0x2e6a34, 'leafy');
    }
    /* an open flower and a bud */
    const fa = F.rr(0, TAU), fr = F.rr(0.55, 0.95);
    const fx = Math.cos(fa) * fr, fz = Math.sin(fa) * fr;
    F.rod(fx, 0, fz, fx, 0.34, fz, 0.04, 0x2e6a34, 'leafy');
    F.blob(fx, 0.4, fz, 0.16, 0.14, 0, 0xe8d86a, 'leafy');
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      F.beam(fx, 0.4, fz, fx + Math.cos(a) * 0.3, 0.62, fz + Math.sin(a) * 0.3, 0.16, 0.04, F.pick([0xf2dce6, 0xe8c0d4]), 'leafy');
    }
    const ba = F.rr(0, TAU), br = F.rr(0.5, 0.9);
    F.rod(Math.cos(ba) * br, 0, Math.sin(ba) * br, Math.cos(ba) * br, 0.45, Math.sin(ba) * br, 0.035, 0x2e6a34, 'leafy');
    F.blob(Math.cos(ba) * br, 0.58, Math.sin(ba) * br, 0.11, 0.3, 0, 0xf0d0de, 'leafy');
  }
});

PLANT({
  key: 'iziz_reed',
  name: 'Pond Reed',
  climate: 'tropic',
  aridity: 'humid',
  w: 3.1, d: 3.4, h: 3.5,
  variants: 1,
  build: function (F) {
    const stemCols = [0x6a9a3a, 0x5e8c34, 0x76a344];
    const H = F.rr(3.0, 3.2), R = F.rr(0.6, 0.7);
    /* a clump of a dozen stems of mixed height, each with a slight kink */
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU * 1.61803 + F.rr(-0.2, 0.2);
      const rad = R * Math.sqrt((i + 0.5) / n) * F.rr(0.55, 1.0);
      const x0 = Math.cos(a) * rad, z0 = Math.sin(a) * rad;
      const len = H * F.rr(0.45, 1.0);
      const outX = Math.cos(a) * len * F.rr(0.06, 0.2), outZ = Math.sin(a) * len * F.rr(0.06, 0.2);
      const c = F.pick(stemCols);
      F.rod(x0, 0, z0, x0 + outX * 0.4, len * 0.6, z0 + outZ * 0.4, 0.042, c, 'leafy');
      F.rod(x0 + outX * 0.4, len * 0.6, z0 + outZ * 0.4, x0 + outX, len, z0 + outZ, 0.032, shade(c, 0.07), 'leafy');
      if (i % 3 === 0) {   /* seed head */
        F.blob(x0 + outX, len + 0.16, z0 + outZ, 0.075, 0.42, 0, F.pick([0x8a7a4a, 0x9a8a54]), 'leafy');
      }
    }
    /* bent and broken stems */
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.1, R);
      const x0 = Math.cos(a) * rad, z0 = Math.sin(a) * rad;
      const kneeY = H * F.rr(0.3, 0.55);
      const kx = x0 + Math.cos(a) * 0.25, kz = z0 + Math.sin(a) * 0.25;
      F.rod(x0, 0, z0, kx, kneeY, kz, 0.038, 0x8a8a54, 'leafy');
      F.rod(kx, kneeY, kz, kx + Math.cos(a) * F.rr(0.4, 0.75), kneeY * F.rr(0.25, 0.6), kz + Math.sin(a) * F.rr(0.4, 0.75), 0.03, 0x9a8f5a, 'leafy');
    }
    /* strap leaves rising out of the clump */
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, TAU);
      const len = H * F.rr(0.35, 0.65);
      F.beam(0, 0.05, 0, Math.cos(a) * F.rr(0.3, 0.6), len, Math.sin(a) * F.rr(0.3, 0.6), 0.13, 0.03, F.pick(stemCols), 'leafy');
    }
  }
});

/* ================= Beast-Rider (Mav's Refuge / Girder) (11 species) ================= */

PLANT({
  key: 'br_ironbark', name: 'Ironbark', climate: 'hypertropic', aridity: 'humid',
  w: 15.9, d: 15.7, h: 45, variants: 1,
  build: function (F) {
    const barkTones = [0x7a4630, 0x6a3a28, 0x8a5236];
    const darkGreens = [0x1f3d24, 0x254a2a, 0x1a3520];
    const H = F.rr(43, 45), CR = 6.8;
    /* buttress roots — an ironbark of this size stands on flanges, not a stump */
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + F.rr(-0.25, 0.25);
      const out = F.rr(2.6, 3.6);
      F.beam(Math.cos(a) * out, 0, Math.sin(a) * out, Math.cos(a) * 0.5, F.rr(3.4, 5.2), Math.sin(a) * 0.5, 0.55, 1.5, shade(barkTones[1], -0.1), 'bark');
    }
    /* four tapering trunk segments */
    F.frustum(0, 0, 0, 1.75, 1.42, 12, 0, barkTones[1], 'bark', 12);
    F.frustum(0, 12, 0, 1.42, 1.1, 11, 0, barkTones[0], 'bark', 12);
    F.frustum(0, 23, 0, 1.1, 0.78, 8, 0, barkTones[2], 'bark', 12);
    F.frustum(0, 31, 0, 0.78, 0.4, 6, 0, shade(barkTones[0], 0.05), 'bark', 12);
    /* deep bark fissures running up the bole */
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      F.beam(Math.cos(a) * 1.6, 0.4, Math.sin(a) * 1.6, Math.cos(a) * 1.15, F.rr(14, 21), Math.sin(a) * 1.15, 0.3, 0.3, shade(barkTones[1], -0.18), 'bark');
    }
    /* six primary limbs into the emergent crown, each with branchlets and foliage */
    const nb = 6, a0 = F.rr(0, TAU);
    for (let i = 0; i < nb; i++) {
      const a = a0 + (i / nb) * TAU + F.rr(-0.25, 0.25);
      const reach = (CR - 2.2) * F.rr(0.72, 1.0);
      const lx = Math.cos(a) * reach, lz = Math.sin(a) * reach;
      const y0 = F.rr(28, 34);
      const ly = y0 + F.rr(4, 8);
      F.rod(0, y0, 0, lx * 0.5, y0 + (ly - y0) * 0.55, lz * 0.5, 0.55, barkTones[0], 'bark');
      F.rod(lx * 0.5, y0 + (ly - y0) * 0.55, lz * 0.5, lx, ly, lz, 0.3, shade(barkTones[2], 0.05), 'bark');
      for (let j = 0; j < 2; j++) {
        const a2 = a + F.rr(-0.9, 0.9);
        const tr = F.rr(0.8, 1.8);
        const tx = lx + Math.cos(a2) * tr, tz = lz + Math.sin(a2) * tr;
        const ty = Math.min(ly + F.rr(0.4, 2.6), H - 1.6);
        F.rod(lx, ly, lz, tx, ty, tz, 0.14, shade(barkTones[2], 0.1), 'bark');
        F.blob(tx, ty + 0.7, tz, F.rr(1.5, 2.1), F.rr(0.9, 1.5), F.rr(0, TAU), F.pick(darkGreens), 'leafy');
      }
    }
    /* crown fill and a crest that carries it to full height */
    for (let i = 0; i < 4; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.4, 3.4);
      F.blob(Math.cos(a) * rad, F.rr(36, H - 1.4), Math.sin(a) * rad, F.rr(1.5, 2.3), F.rr(1.0, 1.5), F.rr(0, TAU), F.pick(darkGreens), 'leafy');
    }
    F.blob(F.rr(-0.8, 0.8), H - 1.3, F.rr(-0.8, 0.8), 2.0, 2.6, F.rr(0, TAU), darkGreens[1], 'leafy');
    /* epiphytes clinging to the lower limbs */
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU), rad = F.rr(1.0, 3.0);
      F.blob(Math.cos(a) * rad, F.rr(26, 32), Math.sin(a) * rad, F.rr(0.5, 0.8), 0.6, F.rr(0, TAU), 0x4a7a36, 'leafy');
    }
  }
});

PLANT({
  key: 'br_ghostwood', name: 'Ghostwood', climate: 'hypertropic', aridity: 'humid',
  w: 13.4, d: 13.6, h: 42, variants: 1,
  build: function (F) {
    const trunkTones = [0xe6e2d4, 0xd8d3c2, 0xf0ece0];
    const branchTones = [0x8aa83e, 0x9ab848, 0x7d9c38];
    const violets = [0x9a6ad8, 0xb48af0];
    const H = F.rr(40, 42), CR = 5.9;
    for (let i = 0; i < 4; i++) {          /* pale root flare */
      const a = (i / 4) * TAU + F.rr(-0.3, 0.3);
      F.rod(Math.cos(a) * 2.1, 0, Math.sin(a) * 2.1, 0, 2.6, 0, 0.42, shade(trunkTones[1], -0.06), 'bark');
    }
    F.frustum(0, 0, 0, 1.45, 1.2, 11, 0, trunkTones[0], 'bark', 12);
    F.frustum(0, 11, 0, 1.2, 0.98, 10, 0, trunkTones[1], 'bark', 12);
    F.frustum(0, 21, 0, 0.98, 0.72, 8, 0, trunkTones[2], 'bark', 12);
    F.frustum(0, 29, 0, 0.72, 0.42, 5, 0, trunkTones[0], 'bark', 12);
    for (let i = 0; i < 6; i++) {          /* the dark leaf-scar bands ghostwood is known by */
      const y = 3 + i * 4.6;
      F.cyl(0, y, 0, 1.5 - i * 0.13, 0.3, 0, 0x3a362e, 'bark');
    }
    /* six primary limbs, each forking into two chartreuse sprays */
    const nb = 6, a0 = F.rr(0, TAU);
    for (let i = 0; i < nb; i++) {
      const a = a0 + (i / nb) * TAU + F.rr(-0.24, 0.24);
      const reach = (CR - 1.8) * F.rr(0.75, 1.0);
      const lx = Math.cos(a) * reach, lz = Math.sin(a) * reach;
      const y0 = F.rr(26, 32);
      const ly = y0 + F.rr(3, 6.5);
      F.rod(0, y0, 0, lx * 0.5, y0 + (ly - y0) * 0.55, lz * 0.5, 0.4, trunkTones[1], 'bark');
      F.rod(lx * 0.5, y0 + (ly - y0) * 0.55, lz * 0.5, lx, ly, lz, 0.2, trunkTones[2], 'bark');
      for (let j = 0; j < 2; j++) {
        const a2 = a + F.rr(-0.85, 0.85);
        const tr = F.rr(0.7, 1.5);
        const tx = lx + Math.cos(a2) * tr, tz = lz + Math.sin(a2) * tr;
        const ty = Math.min(ly + F.rr(0.3, 2.4), H - 1.4);
        F.rod(lx, ly, lz, tx, ty, tz, 0.1, trunkTones[0], 'bark');
        F.blob(tx, ty + 0.5, tz, F.rr(1.2, 1.8), F.rr(0.8, 1.3), F.rr(0, TAU), F.pick(branchTones), 'leafy');
      }
    }
    for (let i = 0; i < 3; i++) {          /* crown fill */
      const a = F.rr(0, TAU), rad = F.rr(0.3, 2.6);
      F.blob(Math.cos(a) * rad, F.rr(33, H - 1.2), Math.sin(a) * rad, F.rr(1.2, 1.8), F.rr(0.9, 1.3), F.rr(0, TAU), F.pick(branchTones), 'leafy');
    }
    F.blob(F.rr(-0.6, 0.6), H - 1.1, F.rr(-0.6, 0.6), 1.5, 2.2, F.rr(0, TAU), branchTones[0], 'leafy');
    /* violet flowers on long pendulous threads */
    for (let i = 0; i < 5; i++) {
      const a = F.rr(0, TAU), rad = F.rr(2.0, 4.4);
      const bx = Math.cos(a) * rad, bz = Math.sin(a) * rad;
      const by = F.rr(28, 34);
      const drop = F.rr(2.0, 4.0);
      F.rod(bx, by, bz, bx + F.rr(-0.4, 0.4), by - drop, bz + F.rr(-0.4, 0.4), 0.035, 0x6a3a28, 'bark');
      F.blob(bx, by - drop - 0.2, bz, 0.3, 0.45, 0, F.pick(violets), 'leafy');
      F.ball(bx, by - drop - 0.55, bz, 0.14, shade(F.pick(violets), 0.2), 'leafy');
    }
  }
});

PLANT({
  key: 'br_prism_gum', name: 'Prism Gum', climate: 'hypertropic', aridity: 'humid',
  w: 16, d: 16, h: 40, variants: 1,
  build: function (F) {
    const barkTones = [0x9a8f6a, 0x6f9a6a, 0xb8683e, 0x5a6fa0, 0x8a4f78, 0xc2a24e];
    const crownTones = [0x2c8a5e, 0x3a9a68, 0x5a3690, 0x6a46a0];
    const H = F.rr(38, 40), CR = 7.8;
    for (let i = 0; i < 5; i++) {          /* root flare */
      const a = (i / 5) * TAU + F.rr(-0.3, 0.3);
      F.rod(Math.cos(a) * 2.3, 0, Math.sin(a) * 2.3, 0, 2.4, 0, 0.4, shade(barkTones[0], -0.15), 'bark');
    }
    /* the banded bole — each shed layer a different colour */
    let y = 0, r = 1.6;
    for (let i = 0; i < 7; i++) {
      const segH = (H * 0.72) / 7;
      const r2 = r - 0.16;
      F.frustum(0, y, 0, r, r2, segH, 0, barkTones[i % barkTones.length], 'bark', 12);
      y += segH; r = r2;
    }
    /* strips of bark peeling away and hanging off the trunk */
    for (let i = 0; i < 6; i++) {
      const a = F.rr(0, TAU);
      const y0 = F.rr(5, 24);
      F.beam(Math.cos(a) * 1.15, y0, Math.sin(a) * 1.15, Math.cos(a) * 1.6, y0 - F.rr(1.5, 3.5), Math.sin(a) * 1.6,
        0.5, 0.08, F.pick(barkTones), 'bark');
    }
    /* six limbs holding the prismatic crown */
    const nb = 6, a0 = F.rr(0, TAU);
    for (let i = 0; i < nb; i++) {
      const a = a0 + (i / nb) * TAU + F.rr(-0.25, 0.25);
      const reach = (CR - 2.6) * F.rr(0.9, 1.0);
      const lx = Math.cos(a) * reach, lz = Math.sin(a) * reach;
      const y0 = y - F.rr(1, 4);
      const ly = y0 + F.rr(3, 7);
      F.rod(0, y0, 0, lx * 0.5, y0 + (ly - y0) * 0.55, lz * 0.5, 0.42, F.pick(barkTones), 'bark');
      F.rod(lx * 0.5, y0 + (ly - y0) * 0.55, lz * 0.5, lx, ly, lz, 0.22, F.pick(barkTones), 'bark');
      F.blob(lx, ly + 0.6, lz, F.rr(2.5, 3.2), F.rr(1.0, 1.6), F.rr(0, TAU), F.pick(crownTones), 'leafy');
      F.blob(lx * 0.72, ly + F.rr(-0.6, 1.4), lz * 0.72, F.rr(1.6, 2.2), F.rr(0.8, 1.3), F.rr(0, TAU), F.pick(crownTones), 'leafy');
    }
    for (let i = 0; i < 4; i++) {          /* upper crown, iridescent tones on top */
      const a = F.rr(0, TAU), rad = F.rr(0.4, 3.0);
      F.blob(Math.cos(a) * rad, F.rr(H - 5, H - 1.4), Math.sin(a) * rad, F.rr(1.8, 2.6), F.rr(1.0, 1.4), F.rr(0, TAU), F.pick(crownTones), 'leafy');
    }
    F.blob(F.rr(-0.8, 0.8), H - 1.3, F.rr(-0.8, 0.8), 2.0, 2.4, F.rr(0, TAU), crownTones[2], 'leafy');
  }
});

PLANT({
  key: 'br_gate_baobab', name: 'Gate Baobab', climate: 'hypertropic', aridity: 'humid',
  w: 13, d: 13.7, h: 30, variants: 1,
  build: function (F) {
    const tones = [0x8a7a66, 0x7a6c5a, 0x9a8a74];
    const crownGreens = [0x4a6a2a, 0x567a30, 0x3f5f26];
    const podTones = [0xe0862a, 0xd06a20];
    const H = F.rr(29, 30), CR = 5.9;
    /* root buttresses spreading off the swollen bole */
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + F.rr(-0.25, 0.25);
      F.beam(Math.cos(a) * F.rr(3.4, 4.4), 0, Math.sin(a) * F.rr(3.4, 4.4), Math.cos(a) * 1.2, F.rr(2.4, 3.6), Math.sin(a) * 1.2,
        0.5, 1.2, shade(tones[1], -0.1), 'bark');
    }
    /* bottle trunk: swells, then necks in hard */
    F.frustum(0, 0, 0, 2.7, 3.3, 4.5, 0, tones[0], 'bark', 12);
    F.frustum(0, 4.5, 0, 3.3, 3.0, 7.5, 0, tones[1], 'bark', 12);
    F.frustum(0, 12, 0, 3.0, 1.5, 5.5, 0, tones[2], 'bark', 12);
    F.frustum(0, 17.5, 0, 1.5, 0.85, 5.0, 0, tones[0], 'bark', 12);
    /* a horizontal seam where a gate would be cut through it */
    F.cyl(0, 8.4, 0, 3.24, 0.4, 0, shade(tones[1], -0.16), 'bark');
    /* the stubby, root-like crown branches */
    const nb = 7, a0 = F.rr(0, TAU);
    for (let i = 0; i < nb; i++) {
      const a = a0 + (i / nb) * TAU + F.rr(-0.25, 0.25);
      const reach = (CR - 1.9) * F.rr(0.65, 1.0);
      const lx = Math.cos(a) * reach, lz = Math.sin(a) * reach;
      const ly = F.rr(24, 27.5);
      F.rod(0, 22.0, 0, lx * 0.5, 22.0 + (ly - 22.0) * 0.6, lz * 0.5, 0.38, tones[0], 'bark');
      F.rod(lx * 0.5, 22.0 + (ly - 22.0) * 0.6, lz * 0.5, lx, ly, lz, 0.18, shade(tones[2], 0.05), 'bark');
      if (i % 2 === 0) {
        const a2 = a + F.rr(-0.9, 0.9);
        const tx = lx + Math.cos(a2) * F.rr(0.6, 1.3), tz = lz + Math.sin(a2) * F.rr(0.6, 1.3);
        const ty = Math.min(ly + F.rr(0.4, 2.0), H - 1.2);
        F.rod(lx, ly, lz, tx, ty, tz, 0.1, shade(tones[2], 0.1), 'bark');
        F.blob(tx, ty + 0.4, tz, F.rr(1.4, 2.0), F.rr(0.7, 1.1), F.rr(0, TAU), F.pick(crownGreens), 'leafy');
      }
      F.blob(lx, ly + 0.45, lz, F.rr(1.5, 2.1), F.rr(0.7, 1.1), F.rr(0, TAU), F.pick(crownGreens), 'leafy');
    }
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.3, 2.4);
      F.blob(Math.cos(a) * rad, F.rr(26, H - 1.0), Math.sin(a) * rad, F.rr(1.4, 2.0), F.rr(0.8, 1.2), F.rr(0, TAU), F.pick(crownGreens), 'leafy');
    }
    /* hanging pods */
    for (let i = 0; i < 5; i++) {
      const a = F.rr(0, TAU), rad = F.rr(1.5, 3.8);
      const px = Math.cos(a) * rad, pz = Math.sin(a) * rad, py = F.rr(24, 27);
      F.rod(px, py, pz, px, py - 1.4, pz, 0.03, 0x6a5c48, 'bark');
      F.blob(px, py - 1.7, pz, 0.22, 0.55, 0, F.pick(podTones), 'leafy');
    }
  }
});

PLANT({
  key: 'br_undergrowth_shrub', name: 'Undergrowth Shrub', climate: 'hypertropic', aridity: 'humid',
  w: 4.7, d: 4.8, h: 3, variants: 1,
  build: function (F) {
    const greens = [0x1a2e1e, 0x223a24, 0x18281c, 0x2a4428];
    const woodC = 0x3a2e22;
    const H = F.rr(2.7, 3.0), R = F.rr(1.6, 1.78);
    const nStem = 6, a0 = F.rr(0, TAU);
    for (let i = 0; i < nStem; i++) {
      const a = a0 + (i / nStem) * TAU + F.rr(-0.3, 0.3);
      const out = R * F.rr(0.35, 0.65);
      const kx = Math.cos(a) * out, kz = Math.sin(a) * out;
      const ky = H * F.rr(0.4, 0.7);
      F.rod(0, 0, 0, kx * 0.5, ky * 0.6, kz * 0.5, 0.09, woodC, 'wood');
      F.rod(kx * 0.5, ky * 0.6, kz * 0.5, kx, ky, kz, 0.06, shade(woodC, 0.08), 'wood');
      for (let j = 0; j < 2; j++) {
        const a2 = a + F.rr(-0.9, 0.9);
        const tr = R * F.rr(0.2, 0.42);
        const tx = kx + Math.cos(a2) * tr, tz = kz + Math.sin(a2) * tr;
        const ty = ky + F.rr(0.05, 0.5);
        F.rod(kx, ky, kz, tx, ty, tz, 0.035, shade(woodC, 0.14), 'wood');
        F.blob(tx, ty + 0.15, tz, F.rr(0.5, 0.78), F.rr(0.35, 0.6), F.rr(0, TAU), F.pick(greens), 'leafy');
      }
    }
    /* heavy shade leaves filling the interior */
    for (let i = 0; i < 6; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0, R * 0.7);
      F.blob(Math.cos(a) * rad, F.rr(0.5, H * 0.85), Math.sin(a) * rad, F.rr(0.5, 0.8), F.rr(0.35, 0.6), F.rr(0, TAU), F.pick(greens), 'leafy');
    }
    /* leaf litter */
    for (let i = 0; i < 2; i++) {
      const a = F.rr(0, TAU);
      F.blob(Math.cos(a) * F.rr(0.6, 1.5), 0.08, Math.sin(a) * F.rr(0.6, 1.5), F.rr(0.4, 0.7), 0.16, F.rr(0, TAU), 0x4a3a26, 'leafy');
    }
  }
});

PLANT({
  key: 'br_giant_fern', name: 'Giant Fern', climate: 'hypertropic', aridity: 'humid',
  w: 5, d: 5, h: 5, variants: 1,
  build: function (F) {
    const greens = [0x2e5a2a, 0x3a6a30, 0x274e26];
    const H = F.rr(4.7, 5.0), R = F.rr(2.2, 2.45);
    const stemH = F.rr(0.9, 1.4);
    F.frustum(0, 0, 0, 0.3, 0.24, stemH, 0, 0x4a3f30, 'bark', 10);
    F.cyl(0, stemH - 0.08, 0, 0.32, 0.14, 0, shade(0x4a3f30, -0.15), 'bark');
    /* ten fronds, each a three-segment arch that peaks well above the crown */
    const n = 10, a0 = F.rr(0, TAU);
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * TAU + F.rr(-0.16, 0.16);
      const len = R * F.rr(0.8, 1.0);
      const rise = (H - stemH) * F.rr(1.05, 1.2);
      const drop = rise * F.rr(0.45, 0.75);
      const c = F.pick(greens);
      let px = 0, py = stemH + 0.15, pz = 0;
      for (let s = 1; s <= 3; s++) {
        const t = s / 3;
        const nx = Math.cos(a) * len * t, nz = Math.sin(a) * len * t;
        const ny = stemH + 0.15 + rise * Math.sin(t * Math.PI * 0.6) - drop * t * t;
        F.beam(px, py, pz, nx, ny, nz, 0.52 - 0.13 * s, 0.07, shade(c, (s - 2) * 0.06), 'leafy');
        px = nx; py = ny; pz = nz;
      }
      if (i % 2 === 0) {   /* a pinna spreading off the mid-rachis */
        F.beam(Math.cos(a) * len * 0.45, stemH + 0.15 + rise * 0.6, Math.sin(a) * len * 0.45,
          Math.cos(a + 1.3) * len * 0.62, stemH + 0.15 + rise * 0.45, Math.sin(a + 1.3) * len * 0.62,
          0.22, 0.05, shade(c, 0.08), 'leafy');
      }
    }
    /* croziers at the centre */
    F.blob(0, stemH + 0.25, 0, 0.42, 0.5, 0, shade(greens[2], -0.08), 'leafy');
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU);
      const hh = stemH + F.rr(2.4, 3.4);
      F.rod(0, stemH + 0.1, 0, Math.cos(a) * 0.3, hh, Math.sin(a) * 0.3, 0.07, greens[1], 'leafy');
      F.ball(Math.cos(a) * 0.33, hh + 0.12, Math.sin(a) * 0.33, 0.17, shade(greens[1], 0.1), 'leafy');
    }
  }
});

PLANT({
  key: 'br_aroid_heliconia', name: 'Aroid / Heliconia Clump', climate: 'hypertropic', aridity: 'humid',
  w: 4.5, d: 4.8, h: 6, variants: 1,
  build: function (F) {
    const greens = [0x1e5a2e, 0x2a6a38, 0x18461e, 0x357a3e];
    const bracts = [0xd8402a, 0xe0862a, 0xc9442a];
    const H = F.rr(5.6, 6.0), R = F.rr(1.75, 1.95);
    /* seven pseudostems, each carrying two big paddle leaves */
    const n = 7, a0 = F.rr(0, TAU);
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * TAU * 1.61803 + F.rr(-0.15, 0.15);
      const rad = F.rr(0.1, 0.55);
      const x0 = Math.cos(a) * rad, z0 = Math.sin(a) * rad;
      const sh = H * F.rr(0.42, 0.78);
      const c = F.pick(greens);
      F.rod(x0, 0, z0, x0 + Math.cos(a) * 0.12, sh, z0 + Math.sin(a) * 0.12, 0.09, shade(c, -0.1), 'leafy');
      for (let j = 0; j < 2; j++) {
        const a2 = a + (j ? 1 : -1) * F.rr(0.4, 1.0);
        const out = R * F.rr(0.55, 1.0);
        const ty = sh + F.rr(0.3, 1.1);
        const bx = x0 + Math.cos(a2) * 0.2, bz = z0 + Math.sin(a2) * 0.2;
        /* petiole then a broad, drooping blade */
        F.rod(x0, sh * 0.85, z0, bx, ty, bz, 0.05, shade(c, 0.06), 'leafy');
        F.beam(bx, ty, bz, x0 + Math.cos(a2) * out, ty - F.rr(0.3, 1.0), z0 + Math.sin(a2) * out,
          0.72, 0.06, shade(c, F.rr(-0.08, 0.12)), 'leafy');
      }
    }
    /* three inflorescences: a stalk with alternating boat-shaped bracts */
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.2, 0.6);
      const x0 = Math.cos(a) * rad, z0 = Math.sin(a) * rad;
      const top = H * F.rr(0.78, 1.0);
      F.rod(x0, 0.2, z0, x0 + Math.cos(a) * 0.25, top, z0 + Math.sin(a) * 0.25, 0.055, 0x2a6a38, 'leafy');
      for (let j = 0; j < 3; j++) {
        const t = 0.45 + j * 0.18;
        const bx = x0 + Math.cos(a) * 0.25 * t, bz = z0 + Math.sin(a) * 0.25 * t;
        const side = (j % 2 ? 1 : -1);
        F.beam(bx, top * t, bz, bx + Math.cos(a + side * 1.5) * 0.5, top * t + 0.18, bz + Math.sin(a + side * 1.5) * 0.5,
          0.28, 0.09, F.pick(bracts), 'leafy');
      }
    }
  }
});

PLANT({
  key: 'br_sapling', name: 'Sapling', climate: 'hypertropic', aridity: 'humid',
  w: 2.5, d: 2.5, h: 6, variants: 1,
  build: function (F) {
    const barkC = 0x6a4630;
    const greens = [0x357a3e, 0x2c6a34, 0x4a8a48];
    const H = F.rr(5.7, 6.0), CR = 1.2;
    F.frustum(0, 0, 0, 0.17, 0.13, H * 0.42, 0, barkC, 'bark', 8);
    F.frustum(0, H * 0.42, 0, 0.13, 0.09, H * 0.3, 0, shade(barkC, 0.06), 'bark', 8);
    F.frustum(0, H * 0.72, 0, 0.09, 0.05, H * 0.16, 0, shade(barkC, 0.1), 'bark', 8);
    /* whorls of small limbs with leaf tufts, sparse like a real sapling */
    const nb = 7, a0 = F.rr(0, TAU);
    for (let i = 0; i < nb; i++) {
      const a = a0 + (i / nb) * TAU * 1.61803 + F.rr(-0.3, 0.3);
      const y0 = H * (0.36 + 0.46 * (i / nb)) + F.rr(-0.2, 0.2);
      const reach = (CR - 0.42) * F.rr(0.6, 1.0);
      const lx = Math.cos(a) * reach, lz = Math.sin(a) * reach;
      const ly = y0 + F.rr(0.3, 0.9);
      F.rod(0, y0, 0, lx, ly, lz, 0.045, shade(barkC, 0.08), 'bark');
      F.blob(lx, ly + 0.2, lz, F.rr(0.35, 0.5), F.rr(0.3, 0.45), F.rr(0, TAU), F.pick(greens), 'leafy');
      if (i % 2 === 0) F.blob(lx * 0.55, ly + F.rr(-0.1, 0.4), lz * 0.55, F.rr(0.25, 0.4), F.rr(0.22, 0.35), F.rr(0, TAU), F.pick(greens), 'leafy');
    }
    /* leader tuft and two big juvenile leaves at the base */
    F.blob(F.rr(-0.15, 0.15), H - 0.5, F.rr(-0.15, 0.15), 0.5, 0.85, F.rr(0, TAU), F.pick(greens), 'leafy');
    for (let i = 0; i < 2; i++) {
      const a = F.rr(0, TAU);
      F.beam(0, 0.5, 0, Math.cos(a) * F.rr(0.7, 1.15), F.rr(0.7, 1.3), Math.sin(a) * F.rr(0.7, 1.15), 0.5, 0.05, F.pick(greens), 'leafy');
    }
  }
});

PLANT({
  key: 'br_bracket_fungus', name: 'Bracket Fungus Clump', climate: 'hypertropic', aridity: 'humid',
  w: 2.3, d: 2.2, h: 2, variants: 1,
  build: function (F) {
    const tones = [0x8d6a5e, 0xa08464, 0xc8a070, 0x7a4a6a];
    const woodC = 0x5a4636;
    const H = F.rr(1.85, 2.0);
    /* the rotting stub the brackets grow on */
    const la = F.rr(0, TAU), lean = F.rr(0.1, 0.28);
    const tx = Math.cos(la) * lean, tz = Math.sin(la) * lean;
    F.blob(0, 0.12, 0, 0.5, 0.3, 0, 0x4a3a2a, 'bark');
    F.frustum(0, 0.05, 0, 0.3, 0.2, H * 0.62, 0, woodC, 'bark', 8);
    F.rod(0, H * 0.62, 0, tx, H * 0.92, tz, 0.2, shade(woodC, -0.06), 'bark');
    F.blob(tx, H * 0.95, tz, 0.21, 0.2, 0, 0x3a2e22, 'bark');   /* splintered top */
    /* nine shelves stepping up the stub, alternating sides */
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = i * 2.39996;
      const t = (i + 0.6) / n;
      const y = 0.12 + H * 0.78 * t;
      const stub = 0.3 - 0.1 * t;
      const r = F.rr(0.3, 0.52) * (1.05 - 0.4 * t);
      const c = F.pick(tones);
      const ox = Math.cos(a) * (stub + r * 0.5), oz = Math.sin(a) * (stub + r * 0.5);
      F.dome(ox, y, oz, r, F.rr(0.09, 0.16), -a, c, 'leafy');
      F.cyl(ox, y - 0.055, oz, r * 0.92, 0.06, 0, shade(c, -0.26), 'leafy');   /* pore surface */
    }
    /* moss and a scatter of small pins at the foot */
    for (let i = 0; i < 3; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.3, 0.85);
      F.blob(Math.cos(a) * rad, 0.07, Math.sin(a) * rad, F.rr(0.2, 0.36), 0.14, F.rr(0, TAU), 0x3a6a30, 'leafy');
    }
    for (let i = 0; i < 2; i++) {
      const a = F.rr(0, TAU), rad = F.rr(0.4, 0.9);
      const px = Math.cos(a) * rad, pz = Math.sin(a) * rad;
      F.rod(px, 0, pz, px, 0.18, pz, 0.025, 0xbdb49c, 'leafy');
      F.dome(px, 0.18, pz, 0.1, 0.07, 0, F.pick(tones), 'leafy');
    }
  }
});

PLANT({
  key: 'br_fallen_hypertree_log', name: 'Fallen Hypertree Log', climate: 'hypertropic', aridity: 'humid',
  w: 4.7, d: 16.4, h: 3.8, variants: 1,
  build: function (F) {
    const barkColor = 0x6a4630;
    const mossCols = [0x2e5a2a, 0x3a6a30, 0x4a7a36];
    /* tapering bole in five segments, thick at the torn end */
    F.rod(0, 1.5, -7.2, 0, 1.45, -4.0, 1.35, shade(barkColor, -0.06), 'bark');
    F.rod(0, 1.45, -4.0, 0, 1.3, -0.5, 1.15, barkColor, 'bark');
    F.rod(0, 1.3, -0.5, 0, 1.1, 2.6, 0.95, shade(barkColor, 0.04), 'bark');
    F.rod(0, 1.1, 2.6, 0, 0.85, 5.4, 0.7, shade(barkColor, 0.08), 'bark');
    F.rod(0, 0.85, 5.4, 0, 0.6, 7.9, 0.42, shade(barkColor, 0.12), 'bark');
    /* torn root plate standing on end */
    F.rod(0, 1.7, -7.6, 0, 1.7, -7.25, 1.68, shade(barkColor, -0.14), 'bark');
    for (let i = 0; i < 6; i++) {
      const a = F.rr(0, TAU);
      const r = F.rr(1.0, 1.65);
      const ey = Math.max(0.15, 1.7 + Math.sin(a) * r);
      F.rod(0, 1.7, -7.45, Math.cos(a) * r, ey, -7.6 - F.rr(0.1, 0.5), F.rr(0.08, 0.16), shade(barkColor, -0.2), 'bark');
    }
    /* broken branch stubs along the trunk */
    for (let i = 0; i < 5; i++) {
      const lz = -6.0 + i * 3.1 + F.rr(-0.5, 0.5);
      const a = F.rr(0, TAU);
      const localR = lz < -4 ? 1.35 : (lz < -0.5 ? 1.15 : (lz < 2.6 ? 0.95 : 0.7));
      const ly = lz < -4 ? 1.5 : (lz < -0.5 ? 1.45 : (lz < 2.6 ? 1.3 : 1.1));
      const len = F.rr(0.5, 1.1);
      F.rod(0, ly, lz, Math.cos(a) * (localR + len), ly + Math.sin(a) * (localR + len) * 0.5, lz + F.rr(-0.3, 0.3), 0.13, shade(barkColor, -0.12), 'bark');
    }
    /* bracket fungi erupting from the flank */
    for (let i = 0; i < 5; i++) {
      const lz = F.rr(-6.5, 6.0);
      const localR = lz < -4 ? 1.35 : (lz < -0.5 ? 1.15 : (lz < 2.6 ? 0.95 : 0.7));
      const ly = lz < -4 ? 1.5 : (lz < -0.5 ? 1.45 : (lz < 2.6 ? 1.3 : 1.1));
      const side = F.chance(0.5) ? 1 : -1;
      const r = F.rr(0.22, 0.4);
      F.dome(side * (localR * 0.85 + r * 0.4), ly + F.rr(-0.4, 0.3), lz, r, 0.1, side > 0 ? 0 : Math.PI, F.pick([0x8d6a5e, 0xc8a070, 0x7a4a6a]), 'leafy');
    }
    /* moss cushions and two seedlings taking root along the top */
    for (let i = 0; i < 6; i++) {
      const lz = -6.8 + i * 2.5 + F.rr(-0.4, 0.4);
      const localR = lz < -4 ? 1.35 : (lz < -0.5 ? 1.15 : (lz < 2.6 ? 0.95 : 0.7));
      const ly = lz < -4 ? 1.5 : (lz < -0.5 ? 1.45 : (lz < 2.6 ? 1.3 : 1.1));
      F.blob(F.rr(-0.4, 0.4), ly + localR * 0.85, lz, F.rr(0.4, 0.7), 0.2, F.rr(0, TAU), F.pick(mossCols), 'leafy');
    }
    for (let i = 0; i < 2; i++) {
      const lz = F.rr(-5, 4);
      const localR = lz < -4 ? 1.35 : (lz < -0.5 ? 1.15 : (lz < 2.6 ? 0.95 : 0.7));
      const ly = lz < -4 ? 1.5 : (lz < -0.5 ? 1.45 : (lz < 2.6 ? 1.3 : 1.1));
      const base = ly + localR * 0.8;
      F.rod(0, base, lz, F.rr(-0.15, 0.15), base + 0.7, lz + F.rr(-0.15, 0.15), 0.05, 0x6a4630, 'bark');
      F.blob(0, base + 0.95, lz, 0.32, 0.4, F.rr(0, TAU), 0x357a3e, 'leafy');
    }
  }
});

PLANT({
  key: 'br_vine_curtain', name: 'Vine Curtain', climate: 'hypertropic', aridity: 'humid',
  w: 5.2, d: 1.9, h: 13.1, variants: 1,
  build: function (F) {
    const greens = [0x2e5a2a, 0x3a6a30, 0x274e26, 0x4a7a36, 0x1e4220];
    const accentTones = [0xd8a23a, 0xc9442a, 0x8d6a5e];
    const H = 13;
    /* nine strands of differing length, each wandering as it falls */
    const n = 9;
    for (let i = 0; i < n; i++) {
      const lx = -1.62 + i * (3.24 / (n - 1)) + F.rr(-0.08, 0.08);
      const lz = F.rr(-0.35, 0.35);
      const len = F.rr(6.5, 13);
      const c = F.pick(greens);
      const midX = lx + F.rr(-0.25, 0.25), midZ = lz + F.rr(-0.2, 0.2);
      const endX = midX + F.rr(-0.3, 0.3), endZ = midZ + F.rr(-0.2, 0.2);
      F.rod(lx, H, lz, midX, H - len * 0.55, midZ, 0.055, c, 'leafy');
      F.rod(midX, H - len * 0.55, midZ, endX, H - len, endZ, 0.04, shade(c, 0.06), 'leafy');
      /* leaf clusters strung along the strand */
      const nl = 2;
      for (let j = 0; j < nl; j++) {
        const t = (j + 0.5) / nl * F.rr(0.6, 1.0);
        const px = lx + (endX - lx) * t, pz = lz + (endZ - lz) * t;
        F.blob(px, H - len * t, pz, F.rr(0.3, 0.5), F.rr(0.35, 0.65), F.rr(0, TAU), F.pick(greens), 'leafy');
      }
      if (i % 3 === 0) F.blob(endX, H - len - 0.2, endZ, F.rr(0.22, 0.34), F.rr(0.3, 0.5), F.rr(0, TAU), F.pick(greens), 'leafy');
    }
    /* fine tendrils spiralling clear of the curtain */
    for (let i = 0; i < 4; i++) {
      const lx = F.rr(-1.8, 1.8);
      const y0 = F.rr(3, 11);
      let px = lx, py = y0, pz = F.rr(-0.3, 0.3);
      for (let s = 0; s < 2; s++) {
        const nx = px + F.rr(-0.5, 0.5), nz = pz + F.rr(-0.25, 0.25);
        const ny = py - F.rr(0.6, 1.4);
        F.rod(px, py, pz, nx, ny, nz, 0.022, F.pick(greens), 'leafy');
        px = nx; py = ny; pz = nz;
      }
    }
    /* flowers and a dead leaf caught in the strands */
    for (let i = 0; i < 4; i++) {
      F.blob(F.rr(-1.8, 1.8), F.rr(1, 11.5), F.rr(-0.35, 0.35), 0.13, 0.1, F.rr(0, TAU), F.pick(accentTones), 'leafy');
    }
  }
});

/* ================= Yuni (9 species) ================= */

PLANT({
  key: 'yuni_cypress', name: 'Yuni cypress', climate: 'temperate', aridity: 'semiarid',
  w: 5.6, d: 5.6, h: 20.4, variants: 3,
  variantDims: [
    { w: 3.1, d: 3, h: 9.3 },
    { w: 4.7, d: 4.5, h: 15.4 },
    { w: 5.6, d: 5.6, h: 20.4 }
  ],
  build: function (F) {
    const h = [9, 15, 20][F.variant];
    F.tree(0, 0, 'cypress', h);
  }
});

PLANT({
  key: 'yuni_pine_maritime', name: 'Maritime pine', climate: 'temperate', aridity: 'semiarid',
  w: 20.1, d: 20.2, h: 22.5, variants: 3,
  variantDims: [
    { w: 7.0, d: 7.0, h: 8.2 },
    { w: 14, d: 14, h: 16.4 },
    { w: 20.1, d: 20.2, h: 22.5 }
  ],
  build: function (F) {
    const h = [8, 16, 22][F.variant];
    F.tree(0, 0, 'pine', h);
  }
});

PLANT({
  key: 'yuni_olive_valley', name: 'Valley olive', climate: 'temperate', aridity: 'arid',
  w: 11.1, d: 10.4, h: 6.6, variants: 3,
  variantDims: [
    { w: 7, d: 6.6, h: 4.2 },
    { w: 9.5, d: 9, h: 5.7 },
    { w: 11.1, d: 10.4, h: 6.6 }
  ],
  build: function (F) {
    const h = [4.4, 6.0, 7.0][F.variant];
    F.tree(0, 0, 'olive', h);
    if (F.variant === 2) {
      for (let i = 0; i < 3; i++) {
        const a = F.rnd() * TAU, r = F.rr(0.3, 0.8);
        F.cyl(Math.cos(a) * r, 0, Math.sin(a) * r, 0.08, F.rr(0.4, 0.9), 0, 0x6b5335, 'wood');
      }
    }
  }
});

PLANT({
  key: 'yuni_scrub_thorn', name: 'Thorn scrub', climate: 'temperate', aridity: 'arid',
  w: 4.6, d: 4.8, h: 2.9, variants: 3,
  variantDims: [
    { w: 2.0, d: 2.0, h: 1.15 },
    { w: 3.0, d: 3.0, h: 1.95 },
    { w: 4.6, d: 4.8, h: 2.9 }
  ],
  build: function (F) {
    const size = [1.2, 2.0, 2.9][F.variant];
    const tone = 0x8a9a5a, wood = 0x6d6a4a, thorn = 0xd8cba0;
    const H = size * 0.92, R = size * 0.68;
    const stems = 4 + F.variant;
    for (let s = 0; s < stems; s++) {
      const a = (s / stems) * TAU + F.rr(-0.35, 0.35);
      const bx = Math.cos(a) * R * 0.14, bz = Math.sin(a) * R * 0.14;
      const lean = F.rr(0.30, 0.55);
      const mx = Math.cos(a) * R * lean, mz = Math.sin(a) * R * lean;
      const my = H * F.rr(0.42, 0.62);
      F.rod(bx, 0, bz, mx, my, mz, size * 0.038, shade(wood, F.rr(-0.08, 0.08)), 'wood');
      /* each stem forks twice near its middle */
      for (let f = 0; f < 2; f++) {
        const a2 = a + (f ? 0.55 : -0.55) + F.rr(-0.25, 0.25);
        const reach = R * F.rr(0.32, 0.55);
        const ex = mx + Math.cos(a2) * reach, ez = mz + Math.sin(a2) * reach;
        const ey = my + H * F.rr(0.18, 0.36);
        F.rod(mx, my, mz, ex, ey, ez, size * 0.024, wood, 'wood');
        /* a sparse tuft of leaf at the tip, never a solid crown */
        F.blob(ex, ey, ez, size * F.rr(0.10, 0.16), size * F.rr(0.07, 0.12),
          F.rnd() * TAU, shade(tone, F.rr(-0.12, 0.12)), 'plant');
        /* a thorn standing off the fork */
        if (F.chance(0.7)) {
          const px = mx + (ex - mx) * F.rr(0.3, 0.7), py = my + (ey - my) * F.rr(0.3, 0.7), pz = mz + (ez - mz) * F.rr(0.3, 0.7);
          F.rod(px, py, pz, px + F.rr(-0.12, 0.12) * size, py + size * 0.10, pz + F.rr(-0.12, 0.12) * size, size * 0.010, thorn, 'plant');
        }
      }
      /* a dead spike left on the stem */
      if (F.chance(0.4)) {
        F.rod(mx, my, mz, mx + F.rr(-0.2, 0.2) * size, my + H * 0.28, mz + F.rr(-0.2, 0.2) * size, size * 0.012, shade(wood, -0.15), 'wood');
      }
    }
    /* litter of dry twigs round the base */
    for (let i = 0; i < 2; i++) {
      const a = F.rnd() * TAU, r = R * F.rr(0.5, 1.0);
      F.rod(Math.cos(a) * r * 0.4, 0.02, Math.sin(a) * r * 0.4, Math.cos(a) * r, 0.03, Math.sin(a) * r, size * 0.010, shade(wood, -0.18), 'wood');
    }
  }
});

PLANT({
  key: 'yuni_date_palm', name: 'Date palm', climate: 'temperate', aridity: 'arid',
  w: 13.9, d: 13.5, h: 16.1, variants: 3,
  variantDims: [
    { w: 5.4, d: 5.4, h: 6.6 },
    { w: 10.0, d: 10.0, h: 11.9 },
    { w: 13.9, d: 13.5, h: 16.1 }
  ],
  build: function (F) {
    const h = [7, 13, 17][F.variant];
    F.tree(0, 0, 'palm', h);
    if (F.variant === 1) {
      for (let i = 0; i < 4; i++) {
        const a = i * TAU / 4 + F.rr(-0.2, 0.2);
        F.ball(Math.cos(a) * 1.0, h * 0.85, Math.sin(a) * 1.0, 0.15, 0xc9a227, 'metal');
      }
    }
  }
});

PLANT({
  key: 'yuni_fig_courtyard', name: 'Courtyard fig', climate: 'temperate', aridity: 'subhumid',
  w: 8.5, d: 8.2, h: 7, variants: 2,
  variantDims: [
    { w: 5.6, d: 5.4, h: 4.6 },
    { w: 8.5, d: 8.2, h: 7 }
  ],
  build: function (F) {
    const h = [5.2, 7.9][F.variant];
    const bark = 0x6b5335, leaf = 0x5a7a3a;
    const boleTop = h * 0.30;
    /* bole, kinked, with root flares */
    const kx = F.rr(-0.1, 0.1), kz = F.rr(-0.1, 0.1);
    F.rod(0, 0, 0, kx, boleTop * 0.55, kz, h * 0.062, bark, 'wood');
    F.rod(kx, boleTop * 0.5, kz, kx * 1.4, boleTop, kz * 1.4, h * 0.050, shade(bark, 0.06), 'wood');
    for (let r = 0; r < 3; r++) {
      const a = r * TAU / 3 + 0.4;
      F.rod(Math.cos(a) * h * 0.085, 0, Math.sin(a) * h * 0.085, kx, boleTop * 0.45, kz, h * 0.022, shade(bark, -0.09), 'wood');
    }
    const limbs = 3;
    for (let i = 0; i < limbs; i++) {
      const a = (i / limbs) * TAU + F.rr(-0.2, 0.2);
      const len = h * F.rr(0.26, 0.32);
      const ex = kx + Math.cos(a) * len, ez = kz + Math.sin(a) * len;
      const ey = boleTop + h * F.rr(0.32, 0.45);
      F.rod(kx, boleTop * 0.92, kz, ex, ey, ez, h * 0.028, shade(bark, 0.05), 'wood');
      let lastX = ex, lastY = ey, lastZ = ez;
      for (let b = 0; b < 2; b++) {
        const a2 = a + (b ? 0.8 : -0.8) + F.rr(-0.2, 0.2);
        const l2 = len * F.rr(0.24, 0.34);
        const bx = ex + Math.cos(a2) * l2, bz = ez + Math.sin(a2) * l2;
        const by = ey + h * F.rr(0.02, 0.10);
        F.rod(ex, ey, ez, bx, by, bz, h * 0.013, bark, 'wood');
        F.blob(bx, by, bz, h * F.rr(0.11, 0.15), h * F.rr(0.09, 0.13), F.rnd() * TAU,
          shade(leaf, F.rr(-0.12, 0.12)), 'plant');
        lastX = bx; lastY = by; lastZ = bz;
      }
      F.blob(ex, ey + h * 0.05, ez, h * 0.13, h * 0.12, F.rnd() * TAU, shade(leaf, F.rr(-0.08, 0.08)), 'plant');
      /* ripening figs tucked under the leaf */
      if (F.chance(0.8)) F.ball(lastX + F.rr(-0.1, 0.1) * h, lastY - h * 0.05, lastZ + F.rr(-0.1, 0.1) * h, h * 0.020, 0x7a5a6a, 'plant');
    }
    F.blob(kx, boleTop + h * 0.42, kz, h * 0.16, h * 0.16, 0, shade(leaf, -0.05), 'plant');
    F.blob(kx, boleTop + h * 0.30, kz, h * 0.20, h * 0.13, TAU * 0.3, shade(leaf, 0.04), 'plant');
  }
});

PLANT({
  key: 'yuni_canal_poplar', name: 'Canal poplar', climate: 'temperate', aridity: 'humid',
  w: 4.4, d: 4, h: 19, variants: 2,
  variantDims: [
    { w: 2.8, d: 2.8, h: 13 },
    { w: 4.4, d: 4, h: 19 }
  ],
  build: function (F) {
    const h = [13, 19][F.variant];
    const bark = 0x8a7a5a, leaf = 0x4a7a4a;
    const R = h * 0.068;
    /* tapering bole all the way up inside the column */
    const segs = 4, boleTop = h * 0.80;
    let px = 0, pz = 0, py = 0;
    for (let i = 0; i < segs; i++) {
      const r = (0.20 + h * 0.011) * (1 - 0.68 * (i / segs));
      const nx = px + F.rr(-0.04, 0.04) * h, nz = pz + F.rr(-0.02, 0.02) * h;
      F.rod(px, py, pz, nx, py + boleTop / segs, nz, r, i % 2 ? shade(bark, 0.06) : bark, 'bark');
      px = nx; pz = nz; py += boleTop / segs;
    }
    /* whorls of steeply upswept branches, each with its own foliage layer */
    const whorls = 5, per = 3;
    for (let w = 0; w < whorls; w++) {
      const t = w / (whorls - 1);
      const by = h * (0.12 + 0.66 * t);
      const spread = R * (1.02 - 0.40 * t) * F.rr(0.85, 1.05);
      for (let i = 0; i < per; i++) {
        const a = (i / per) * TAU + w * 0.9 + F.rr(-0.15, 0.15);
        const ex = Math.cos(a) * spread, ez = Math.sin(a) * spread;
        const ey = by + h * F.rr(0.08, 0.13);
        F.rod(px * (by / h), by, pz * (by / h), ex, ey, ez, 0.035 + h * 0.0035, bark, 'bark');
        F.blob(ex * 0.88, ey, ez * 0.88, spread * F.rr(0.62, 0.80), h * F.rr(0.09, 0.13),
          F.rnd() * TAU, shade(leaf, F.rr(-0.09, 0.11)), 'plant');
      }
    }
    /* the spire: the column closes to a point at h */
    F.blob(px * 0.8, h * 0.82, pz * 0.8, R * 0.60, h * 0.14, 0, shade(leaf, 0.05), 'plant');
    F.cone(px * 0.8, h * 0.90, pz * 0.8, R * 0.42, h * 0.10, 0, shade(leaf, 0.11), 'plant');
    /* a couple of low water shoots, as canal-bank poplars throw */
    for (let i = 0; i < 2; i++) {
      const a = F.rnd() * TAU;
      F.rod(0, 0, 0, Math.cos(a) * R * 0.5, h * 0.10, Math.sin(a) * R * 0.5, 0.04, shade(bark, -0.1), 'bark');
    }
  }
});

PLANT({
  key: 'yuni_oleander', name: 'Oleander', climate: 'temperate', aridity: 'semiarid',
  w: 3.6, d: 3.5, h: 2.9, variants: 2,
  variantDims: [
    { w: 2.2, d: 2.2, h: 1.8 },
    { w: 3.6, d: 3.5, h: 2.9 }
  ],
  build: function (F) {
    const H = [1.9, 2.9][F.variant];
    const leaf = 0x3a6a3a, stem = 0x6b6a4a;
    const flowers = [0xd6528c, 0xc9455a, 0xe888a8];
    const R = H * 0.42;
    const n = 5 + F.variant * 2;
    for (let s = 0; s < n; s++) {
      const a = (s / n) * TAU + F.rr(-0.3, 0.3);
      const tipR = R * F.rr(0.48, 0.98);
      const ex = Math.cos(a) * tipR, ez = Math.sin(a) * tipR;
      const ey = H * F.rr(0.48, 0.80);
      F.rod(Math.cos(a) * H * 0.04, 0, Math.sin(a) * H * 0.04, ex, ey, ez, H * 0.024,
        shade(stem, F.rr(-0.08, 0.08)), 'wood');
      F.blob(ex, ey, ez, H * F.rr(0.17, 0.23), H * F.rr(0.19, 0.27), F.rnd() * TAU,
        shade(leaf, F.rr(-0.12, 0.12)), 'plant');
      F.blob(ex * 0.58, ey * 0.74, ez * 0.58, H * F.rr(0.12, 0.17), H * F.rr(0.14, 0.20),
        F.rnd() * TAU, shade(leaf, F.rr(-0.14, 0.05)), 'plant');
      /* the flower head: a little cluster of blooms, not one bead */
      const fc = F.pick(flowers);
      const hx = ex + F.rr(-0.06, 0.06) * H, hz = ez + F.rr(-0.06, 0.06) * H, hy = ey + H * 0.10;
      F.ball(hx, hy, hz, H * 0.042, fc, 'plant');
      if (F.variant === 1) F.ball(hx + H * 0.05, hy - H * 0.02, hz - H * 0.04, H * 0.034, shade(fc, 0.1), 'plant');
    }
    F.blob(0, H * 0.32, 0, R * 0.62, H * 0.48, 0, shade(leaf, -0.09), 'plant');
  }
});

PLANT({
  key: 'yuni_agave_verge', name: 'Verge agave', climate: 'temperate', aridity: 'arid',
  w: 2.55, d: 2.55, h: 2.4, variants: 2,
  variantDims: [
    { w: 2.55, d: 2.55, h: 0.82 },
    { w: 2.55, d: 2.55, h: 2.4 }
  ],
  build: function (F) {
    const c1 = 0x8a9a6a, c2 = 0x7a8a5a, spine = 0x4a4030;
    const n = 15;
    F.dome(0, 0, 0, 0.26, 0.18, 0, shade(c2, -0.14), 'plant');
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + F.rr(-0.08, 0.08);
      const tier = i % 3;                       /* inner leaves stand, outer ones recurve */
      const lift = [0.92, 0.70, 0.46][tier];
      const len = F.rr(0.92, 1.22) * (tier === 0 ? 0.85 : 1);
      const c = i % 2 ? c1 : c2;
      /* knee of the leaf, where it stops rising and starts arching out */
      const kx = Math.cos(a) * len * 0.42, kz = Math.sin(a) * len * 0.42;
      const ky = 0.10 + len * lift * 0.62;
      const tx = Math.cos(a) * len, tz = Math.sin(a) * len;
      const ty = ky - len * F.rr(0.14, 0.34) * (1.1 - lift * 0.7);
      F.beam(0, 0.05, 0, kx, ky, kz, 0.15, 0.055, c, 'plant');
      F.beam(kx, ky, kz, tx, ty, tz, 0.09, 0.040, shade(c, -0.06), 'plant');
      if (tier === 2) F.rod(tx, ty, tz, tx * 1.10, ty - 0.07, tz * 1.10, 0.020, spine, 'plant');
    }
    /* two spent leaves lying dry against the ground */
    for (let i = 0; i < 2; i++) {
      const a = F.rnd() * TAU;
      F.beam(0, 0.06, 0, Math.cos(a) * 1.15, 0.04, Math.sin(a) * 1.15, 0.12, 0.03, 0xa89a72, 'plant');
    }
    if (F.variant === 1) {
      /* the mast: a segmented spike with side branches of bloom */
      let y = 0.3;
      for (let i = 0; i < 4; i++) {
        F.rod(0, y, 0, F.rr(-0.03, 0.03), y + 0.44, F.rr(-0.03, 0.03), 0.055 - i * 0.008, shade(c2, -0.05), 'plant');
        y += 0.44;
      }
      for (let i = 0; i < 3; i++) {
        const a = i * TAU / 3 + 0.4, by = 1.40 + i * 0.26;
        F.rod(0, by, 0, Math.cos(a) * 0.30, by + 0.12, Math.sin(a) * 0.30, 0.018, shade(c2, -0.08), 'plant');
        F.ball(Math.cos(a) * 0.32, by + 0.14, Math.sin(a) * 0.32, 0.09, 0xc9a227, 'metal');
      }
      F.ball(0, 2.28, 0, 0.11, 0xc9a227, 'metal');
    }
  }
});