/* ======================================================================
   krator-master-furniture-izpalace-depot.js — the IZIZ PALACE's ANCIENT and SERVICE pieces (2026-10)
   Not a culture file. Like -jobs.js its name is a category: a bundle carries it only when a build names
   'izpalace-depot' (furniture_bundle.bundle([..., 'izpalace-depot'])); the catalog page loads it like every
   krator-master-furniture-*.js. Every entry is culture 'iziz' and serves the imperial palace
   (settlements/iziz/palace/BLUEPRINT.md, FURNITURE.md "Pieces the catalog lacks (NEW)"): the mech depot and
   the Ancient core in the mesa under the palace, the kitchens and the brig.
   Every `rooms` list is PALACE-ONLY (pal_* kinds): no other build has a room of these kinds, so the placer
   elsewhere never picks these pieces; the palace's furnishing pass places them by key.
   The Ancient look: white composite panels with recessed CYAN light strips (glow), dark grey alloy,
   chamfered edges, hex and chevron motifs, nothing ornate. What Iziz bolted on is bronze, orange paint and
   stencilled numerals.
   The file adds the colours its pieces need to the iziz palette as DEFAULTS (its own PALETTE block, like
   -jobs.js): the iziz file's palette wins for a key both define, so nothing here recolours Iziz. Pieces draw
   only through F (and this file's own IZP_ helpers), so a bundle may carry it alone.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('iziz', { palette: Object.assign({
  /* the Ancient fabric: white composite, its cyan light strips, the core's white heat, dark and mid alloy */
  ancientWhite: 0xe6e4dc, ancientCyan: 0x5fe8ff, ancientCyanDeep: 0x2ab6d6, coreWhite: 0xdffaff,
  alloyDark: 0x3a3f42, alloyGrey: 0x5e6366, gratingGrey: 0x767b7e, screenDark: 0x14181c,
  /* what Iziz paints on it: orange and black hazard paint, olive munitions, cream stencils */
  paintOrange: 0xd8702a, paintBlack: 0x1e1d1b, paintOlive: 0x55603a, stencilCream: 0xf0e2c0,
  /* the depot's metals and fittings: shell brass, coil copper, zinc, cable rubber, pallet timber */
  brassShell: 0xc9a24a, copperCoil: 0xb8662e, zincGrey: 0xa9aeb0, rubberBlack: 0x222222, timberPallet: 0x9a7a52,
  /* the kitchens and the brig: brick and mortar, stew, a roast, cold ash */
  brickRed: 0x6e2c1e, mortarGrey: 0xb0a490, stewBrown: 0x3e2410, meatRoast: 0x6a3216, meatCrisp: 0x4a200c, ashGrey: 0x4a4642,
  /* the iziz file's keys these pieces name, at the iziz file's own values (that file wins either way) */
  mahoganyRed: 0x6a2a1e, mahoganyDark: 0x44190f, mahoganyLight: 0x8a4030, marbleWhite: 0xe8e4dc, marbleVein: 0xc8c0b0,
  clothCream: 0xf3e2c0, ironSoot: 0x2e2a26, ceramicTeal: 0x2f8f8a, clothOrange: 0xe07a2a
}, FPAL['iziz'] || {}) });
/* END PALETTE */

/* ---------------------------------------------------------------- helpers (draw only through F) */
/* stencil words (drawn by index: F.pick of strings reads as palette keys) */
const IZP_BAYS = ['I', 'II', 'III', 'IV'], IZP_MUNITIONS = ['HE-120', 'AP-120', 'CHG-4', 'HE-80'];
/* a flat bar on a level surface from (ax, az) to (bx, bz): a box turned about y (sun rays, chevron arms) */
function IZP_bar(F, ax, y, az, bx, bz, t, h, c, fam) {
  F.box((ax + bx) / 2, y, (az + bz) / 2, Math.hypot(bx - ax, bz - az), h, t, Math.atan2(-(bz - az), bx - ax), c, fam);
}
/* a closed hoop of radius r round the vertical axis at (x, y, z), tube radius t */
function IZP_hoop(F, x, y, z, r, t, c, fam, n) {
  n = n == null ? 16 : n;
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = i / n * F.TAU; pts.push([x + Math.cos(a) * r, y, z + Math.sin(a) * r]); }
  F.tube(pts, t, c, fam, { seg: 6 });
}
/* a closed loop of radius r in the VERTICAL plane through (x, y, z) along the direction (cos ax, sin ax) in plan */
function IZP_loop(F, x, y, z, r, t, ax, c, fam, n) {
  n = n == null ? 12 : n;
  const pts = [], ca = Math.cos(ax), sa = Math.sin(ax);
  for (let i = 0; i <= n; i++) { const a = i / n * F.TAU; pts.push([x + ca * Math.cos(a) * r, y + Math.sin(a) * r, z + sa * Math.cos(a) * r]); }
  F.tube(pts, t, c, fam, { seg: 5 });
}
/* a stencilled plate: a painted panel facing +z (turned ry2) with a word or numeral, Iziz's mark on Ancient work */
function IZP_stencil(F, x, y, z, w, h, ry2, text, bgKey, inkKey, fam) {
  const bg = F.css(F.col(bgKey)), ink = F.css(F.col(inkKey));
  F.decal(x, y, z, w, h, ry2 == null ? 0 : ry2, 'izp:' + text + ':' + bg + ink + ':' + w.toFixed(2) + 'x' + h.toFixed(2), function (g, cw, ch) {
    g.fillStyle = bg; g.fillRect(0, 0, cw, ch);
    g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold ' + Math.round(Math.min(ch * 0.72, cw * 1.4 / Math.max(2, text.length))) + 'px monospace';
    g.fillText(text, cw / 2, ch * 0.54);
  }, fam || 'metal');
}
/* hazard stripes: a painted panel facing +z (turned ry2), diagonal orange and black */
function IZP_hazard(F, x, y, z, w, h, ry2, fam) {
  const a = F.css(F.col('paintOrange')), b = F.css(F.col('paintBlack'));
  F.decal(x, y, z, w, h, ry2 == null ? 0 : ry2, 'izp:hazard:' + w.toFixed(2) + 'x' + h.toFixed(2), function (g, cw, ch) {
    g.fillStyle = b; g.fillRect(0, 0, cw, ch);
    g.fillStyle = a;
    const s = ch * 1.2;
    for (let x0 = -ch; x0 < cw + ch; x0 += s * 2) {
      g.beginPath(); g.moveTo(x0, ch); g.lineTo(x0 + s, ch); g.lineTo(x0 + s + ch, 0); g.lineTo(x0 + ch, 0); g.closePath(); g.fill();
    }
  }, fam || 'metal');
}

/* ======== the Ancient core and its levels (BLUEPRINT: the mesa under the palace) ======== */

/* the Ancient power core in its cage of light (UNIQUE): The Core (pal_core) */
FURN({
  key: 'iziz_ancient_core', name: 'The Ancient power core (unique)', culture: 'iziz', tier: 'court', type: 'monument', setting: 'indoor',
  rooms: ['pal_core'], anchor: 'floor', clearance: { front: 1.5, back: 1.0, left: 1.0, right: 1.0 }, task: [],
  materials: ['plastic', 'metal', 'emissive'],
  w: 6.0, d: 6.0, h: 9.0, variants: 1,
  build: function (F) {
    const W = F.col('ancientWhite'), A = F.col('alloyDark'), G = F.col('alloyGrey'), C = F.col('ancientCyan'), K = F.col('coreWhite');
    /* the stepped round plinth, a cyan light ring let into each riser, a hex plate on top */
    [[2.4, 0, A, 'metal'], [2.0, 0.3, W, 'plastic'], [1.6, 0.6, A, 'metal']].forEach(function (s) {
      F.cyl(0, s[1], 0, s[0], 0.3, 0, s[2], s[3]);
      F.cyl(0, s[1] + 0.12, 0, s[0] + 0.02, 0.05, 0, C, 'glow');
    });
    F.frustum(0, 0.9, 0, 1.3, 1.3, 0.02, 0, G, 'metal', 6);
    /* the core: a white-hot column in a stack of rings, every third ring alight */
    F.cyl(0, 0.92, 0, 0.5, 7.2, 0, K, 'glow');
    for (let i = 0; i < 13; i++) {
      const lit = i % 3 === 1;
      F.cyl(0, 1.1 + i * 0.52, 0, 0.78, 0.16, 0, lit ? C : W, lit ? 'glow' : 'plastic');
    }
    /* the cage: eight white ribs with a cyan strip down each, leaning in to the crown */
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * F.TAU, c = Math.cos(a), s = Math.sin(a);
      F.box(c * 1.45, 0.9, s * 1.45, 0.26, 6.3, 0.2, -a, W, 'plastic');
      F.box(c * 1.59, 1.15, s * 1.59, 0.03, 5.8, 0.07, -a, C, 'glow');
      F.beam(c * 1.45, 7.18, s * 1.45, c * 0.95, 8.5, s * 0.95, 0.2, 0.2, W, 'plastic');
    }
    for (const y of [3.0, 5.6]) IZP_hoop(F, 0, y, 0, 1.6, 0.07, A, 'metal', 24);
    IZP_hoop(F, 0, 4.3, 0, 1.6, 0.035, C, 'glow', 24);
    /* the crown and its hex cap */
    F.cyl(0, 8.42, 0, 1.05, 0.3, 0, W, 'plastic');
    F.cyl(0, 8.54, 0, 1.07, 0.06, 0, C, 'glow');
    F.frustum(0, 8.72, 0, 0.8, 0.5, 0.22, 0, A, 'metal', 6);
    F.cyl(0, 8.94, 0, 0.14, 0.06, 0, C, 'glow');
    /* conduits down the steps and out across the floor to four junction boxes */
    for (let k = 0; k < 4; k++) {
      const a = (k + 0.25) / 4 * F.TAU, c = Math.cos(a), s = Math.sin(a);
      const P = (r, y) => [c * r, y, s * r];
      F.tube([P(1.3, 0.97), P(1.75, 0.97), P(2.1, 0.67), P(2.45, 0.37), P(2.6, 0.1), P(2.75, 0.1)], 0.09, G, 'metal', { seg: 6 });
      F.box(c * 2.82, 0, s * 2.82, 0.32, 0.26, 0.36, -a, A, 'metal');
      F.box(c * 2.82, 0.26, s * 2.82, 0.2, 0.02, 0.24, -a, C, 'glow');
    }
    F.lamp(0, 4.5, 0, 3.0, 16);
  }
});

/* an Ancient free-standing light pylon: the Ancient levels (core, control, shield, mech bays, lift, cells, reliquary) */
FURN({
  key: 'iziz_ancient_light_column', name: 'Ancient light pylon', culture: 'iziz', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['pal_core', 'pal_control', 'pal_shield', 'pal_mechbay', 'pal_lift', 'pal_cells', 'pal_reliquary'], anchor: 'floor', clearance: {},
  materials: ['plastic', 'metal', 'emissive'],
  w: 0.6, d: 0.6, h: 3.2, variants: 1,
  build: function (F) {
    const W = F.col('ancientWhite'), A = F.col('alloyDark'), C = F.col('ancientCyan'), q = Math.PI / 8;
    F.frustum(0, 0, 0, 0.3, 0.26, 0.22, 0, A, 'metal', 4);                               /* the alloy foot */
    F.frustum(0, 0.22, 0, 0.2, 0.2, 2.5, q, W, 'plastic', 8);                            /* the chamfered white post */
    for (const s of [-1, 1]) F.box(0, 0.4, s * 0.186, 0.05, 2.1, 0.02, 0, C, 'glow');     /* its recessed strips, front and back */
    F.frustum(0, 1.45, 0, 0.198, 0.198, 0.12, q, F.col('paintOrange'), 'metal', 8);      /* an Iziz paint band */
    F.frustum(0, 2.72, 0, 0.22, 0.27, 0.12, q, W, 'plastic', 8);                         /* the head */
    F.frustum(0, 2.84, 0, 0.25, 0.25, 0.2, q, C, 'glow', 8);
    F.frustum(0, 3.04, 0, 0.27, 0.22, 0.1, q, W, 'plastic', 8);
    F.frustum(0, 3.14, 0, 0.14, 0.1, 0.06, 0, A, 'metal', 6);                            /* the hex cap */
    F.lamp(0, 2.95, 0, 1.2, 9);
  }
});

/* a standing Ancient terminal: control, core, shield, lift, mech bays, signal room */
FURN({
  key: 'iziz_ancient_terminal', name: 'Ancient terminal', culture: 'iziz', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['pal_control', 'pal_core', 'pal_shield', 'pal_lift', 'pal_mechbay', 'pal_signal'], anchor: 'floor', clearance: { front: 0.8 }, task: [],
  materials: ['plastic', 'metal', 'emissive'],
  w: 0.7, d: 0.6, h: 1.3, variants: 1,
  build: function (F) {
    const W = F.col('ancientWhite'), A = F.col('alloyDark'), C = F.col('ancientCyan');
    F.box(0, 0, 0, 0.7, 0.06, 0.6, 0, A, 'metal');
    F.box(0, 0.06, -0.05, 0.36, 0.86, 0.3, 0, W, 'plastic');                             /* the pedestal */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.17, 0.06, -0.05 + sz * 0.14, 0.04, 0.86, 0.04, 0, A, 'metal');   /* chamfered corners */
    F.box(0, 0.16, 0.103, 0.04, 0.66, 0.01, 0, C, 'glow');
    /* the slanted head and its live screen, facing up and forward */
    const a = [0, 1.0, 0.12], b = [0, 1.22, -0.22], n = [0, 0.84, 0.54];
    F.beam(a[0], a[1], a[2], b[0], b[1], b[2], 0.66, 0.07, W, 'plastic');
    F.beam(0, a[1] + n[1] * 0.036, a[2] + n[2] * 0.036, 0, b[1] + n[1] * 0.036, b[2] + n[2] * 0.036, 0.54, 0.01, C, 'glow');
    /* the keypad ledge: a hex grid of keys */
    F.box(0, 0.86, 0.19, 0.5, 0.04, 0.18, 0, W, 'plastic');
    for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) {
      F.frustum(-0.16 + i * 0.08 + r * 0.04, 0.9, 0.15 + r * 0.07, 0.03, 0.026, 0.015, 0, (i + r) % 4 === 0 ? C : A, (i + r) % 4 === 0 ? 'glow' : 'metal', 6);
    }
    F.lamp(0, 1.15, 0.2, 0.4, 3);
  }
});

/* a rack of power cells, lit: Power Cells and Fuel (pal_cells), the shield hall and the core */
FURN({
  key: 'iziz_cell_rack', name: 'Power-cell rack', culture: 'iziz', tier: 'common', type: 'rack', setting: 'indoor',
  rooms: ['pal_cells', 'pal_shield', 'pal_core'], anchor: 'wall', clearance: { front: 0.9 }, task: [],
  materials: ['metal', 'plastic', 'emissive'],
  w: 2.0, d: 0.6, h: 2.2, variants: 2, variantNames: ['Full', 'Half-empty'],
  build: function (F) {
    const S = F.col('alloyGrey'), A = F.col('alloyDark'), W = F.col('ancientWhite'), C = F.col('ancientCyan'), R = F.col('rubberBlack');
    F.box(0, 0.05, -0.29, 1.88, 2.1, 0.02, 0, A, 'metal');                                /* the back sheet */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.97, 0, sz * 0.27, 0.06, 2.2, 0.06, 0, S, 'metal');
    for (const y of [0.12, 0.82, 1.52]) F.box(0, y, 0, 2.0, 0.05, 0.58, 0, S, 'metal');
    F.box(0, 2.15, 0, 2.0, 0.05, 0.6, 0, S, 'metal');
    [0.12, 0.82, 1.52].forEach(function (y0, row) {
      const y = y0 + 0.05;
      for (let i = 0; i < 6; i++) {
        if (F.variant === 1 && (F.chance(0.5) || (i + row) % 3 === 0)) continue;
        const x = -0.8 + i * 0.32;
        F.frustum(x, y, 0.02, 0.12, 0.12, 0.5, 0, A, 'metal', 6);                       /* a hex cell */
        F.frustum(x, y + 0.3, 0.02, 0.126, 0.126, 0.06, 0, C, 'glow', 6);               /* its charge band */
        F.frustum(x, y + 0.5, 0.02, 0.08, 0.06, 0.05, 0, W, 'plastic', 6);              /* its white cap */
      }
      F.tube([[-0.92, y + 0.6, -0.26], [-0.45, y + 0.56, -0.2], [0.45, y + 0.56, -0.2], [0.92, y + 0.6, -0.26]], 0.02, R, 'plastic', { seg: 5 });
    });
    F.box(0, 0.0, 0.27, 0.6, 0.11, 0.02, 0, F.col('paintOrange'), 'metal');                /* the Iziz stencil plate under the bottom shelf */
    IZP_stencil(F, 0, 0.012, 0.282, 0.56, 0.086, 0, F.variant === 1 ? 'C-07' : 'C-03', 'paintOrange', 'stencilCream');
    F.lamp(0, 1.1, 0.2, 0.7, 5);
  }
});

/* the Ancient lift platform (UNIQUE): The Hangar Lift and The Well of the Machine (pal_lift). No clearance: things stand round it */
FURN({
  key: 'iziz_common_lift_platform', name: 'Ancient lift platform (unique)', culture: 'iziz', tier: 'common', type: 'monument', setting: 'indoor',
  rooms: ['pal_lift'], anchor: 'floor', clearance: {}, task: [],
  materials: ['metal', 'plastic', 'emissive', 'bronze', 'gold'],
  w: 9.6, d: 9.6, h: 0.6, variants: 1,
  build: function (F) {
    const A = F.col('alloyDark'), G = F.col('gratingGrey'), W = F.col('ancientWhite'), C = F.col('ancientCyan'), O = F.col('paintOrange');
    F.box(0, 0, 0, 9.6, 0.28, 9.6, 0, A, 'metal');                                        /* the deck */
    for (let s = 0; s < 4; s++) {                                                          /* its edges: hazard paint and a cyan line */
      const ry = s * Math.PI / 2, c = Math.sin(ry), e = Math.cos(ry);
      IZP_hazard(F, c * 4.803, 0.03, e * 4.803, 9.4, 0.17, ry);
      F.box(c * 4.795, 0.22, e * 4.795, s % 2 ? 0.02 : 9.3, 0.03, s % 2 ? 9.3 : 0.02, 0, C, 'glow');
    }
    /* sixteen grating plates, three treads each */
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const x = -3.6 + i * 2.4, z = -3.6 + j * 2.4;
      F.box(x, 0.28, z, 2.3, 0.04, 2.3, 0, G, 'metal');
      for (let k = -1; k <= 1; k++) F.box(x, 0.32, z + k * 0.6, 2.2, 0.02, 0.05, 0, F.shade(G, -0.15), 'metal');
    }
    /* the hazard chevrons round the edge, pointing out */
    const at = (s, u, v) => s === 0 ? [u, v] : s === 1 ? [u, -v] : s === 2 ? [v, u] : [-v, u];
    for (let s = 0; s < 4; s++) {
      const p = at(s, 0, 4.45);
      F.box(p[0], 0.32, p[1], s < 2 ? 8.6 : 0.4, 0.012, s < 2 ? 0.4 : 8.6, 0, F.col('paintBlack'), 'metal');
      for (let k = 0; k < 10; k++) {
        const u = -3.6 + k * 0.8, tip = at(s, u, 4.6), l = at(s, u - 0.2, 4.32), r = at(s, u + 0.2, 4.32);
        IZP_bar(F, l[0], 0.33, l[1], tip[0], tip[1], 0.07, 0.01, O, 'metal');
        IZP_bar(F, r[0], 0.33, r[1], tip[0], tip[1], 0.07, 0.01, O, 'metal');
      }
    }
    /* the sun medallion inlaid at the centre */
    F.cyl(0, 0.34, 0, 1.3, 0.03, 0, F.col('bronze'), 'bronze');
    F.cyl(0, 0.37, 0, 0.55, 0.02, 0, O, 'metal');
    F.cyl(0, 0.39, 0, 0.3, 0.02, 0, F.col('gilt'), 'gold');
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * F.TAU, r1 = k % 2 ? 1.0 : 1.22;
      IZP_bar(F, Math.cos(a) * 0.6, 0.37, Math.sin(a) * 0.6, Math.cos(a) * r1, Math.sin(a) * r1, 0.07, 0.02, F.col('gilt'), 'gold');
    }
    IZP_hoop(F, 0, 0.36, 0, 1.42, 0.03, C, 'glow', 24);
    /* bollards at the corners, white with a cyan ring and an orange cap */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      F.cyl(sx * 4.35, 0.32, sz * 4.35, 0.16, 0.22, 0, W, 'plastic');
      F.cyl(sx * 4.35, 0.42, sz * 4.35, 0.165, 0.04, 0, C, 'glow');
      F.cyl(sx * 4.35, 0.54, sz * 4.35, 0.17, 0.05, 0, O, 'metal');
    }
    /* the low rail stub at the back edge */
    for (const sx of [-1, 1]) F.box(sx * 1.2, 0.32, -4.3, 0.08, 0.24, 0.08, 0, W, 'plastic');
    F.box(0, 0.53, -4.3, 2.6, 0.05, 0.07, 0, O, 'metal');
  }
});

/* the Ancient radio set the Salvagers repaired (UNIQUE): the Signal Room (pal_signal) */
FURN({
  key: 'iziz_ancient_set', name: 'The Salvagers\' Ancient radio set (unique)', culture: 'iziz', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['pal_signal'], anchor: 'wall', clearance: { front: 1.0 }, task: [],
  materials: ['plastic', 'metal', 'emissive', 'glass', 'bronze', 'gold', 'hyperMahogany'],
  w: 1.6, d: 0.8, h: 2.2, variants: 1,
  build: function (F) {
    const W = F.col('ancientWhite'), A = F.col('alloyDark'), C = F.col('ancientCyan'), B = F.col('bronze');
    F.box(0, 0, -0.1, 1.44, 0.1, 0.56, 0, A, 'metal');                                    /* plinth */
    F.box(0, 0.1, -0.1, 1.5, 1.7, 0.6, 0, W, 'plastic');                                  /* the white console cabinet */
    for (const sx of [-1, 1]) F.box(sx * 0.74, 0.1, 0.19, 0.04, 1.7, 0.04, 0, A, 'metal'); /* chamfered front edges */
    F.box(0, 1.8, -0.1, 1.56, 0.06, 0.6, 0, A, 'metal');                                /* top cap */
    for (const y of [0.72, 1.66]) F.box(0, y, 0.205, 1.3, 0.03, 0.01, 0, C, 'glow');     /* recessed light strips */
    /* three screens, the middle one alive */
    for (let i = -1; i <= 1; i++) {
      F.box(i * 0.45, 1.15, 0.21, 0.38, 0.32, 0.02, 0, A, 'metal');
      F.box(i * 0.45, 1.18, 0.225, 0.32, 0.26, 0.01, 0, i === 0 ? C : F.col('screenDark'), i === 0 ? 'glow' : 'glass');
    }
    /* a row of dials */
    for (let i = 0; i < 5; i++) {
      const x = -0.5 + i * 0.25;
      F.rod(x, 0.98, 0.2, x, 0.98, 0.235, 0.045, A, 'metal');
      F.box(x, 0.98, 0.236, 0.008, 0.04, 0.004, 0, W, 'plastic');
    }
    /* the desk ledge on alloy brackets */
    F.box(0, 0.82, 0.3, 1.5, 0.05, 0.2, 0, A, 'metal');
    for (const sx of [-1, 1]) F.box(sx * 0.6, 0.62, 0.27, 0.06, 0.2, 0.14, 0, A, 'metal');
    /* bolted on by the Salvagers: a brass morse key, a bronze speaker horn, a stencilled plate */
    F.box(-0.45, 0.87, 0.3, 0.2, 0.03, 0.12, 0, F.col('mahoganyDark'), 'mahogany');
    F.box(-0.45, 0.91, 0.3, 0.03, 0.02, 0.16, 0, F.col('gilt'), 'gold');
    F.cyl(-0.45, 0.93, 0.36, 0.025, 0.03, 0, F.col('ironSoot'), 'metal');
    for (const sx of [-1, 1]) F.cyl(-0.45 + sx * 0.06, 0.9, 0.25, 0.012, 0.03, 0, B, 'bronze');
    F.tube([[-0.45, 0.88, 0.24], [-0.45, 0.86, 0.21], [-0.3, 0.86, 0.205]], 0.008, F.col('rubberBlack'), 'plastic', { seg: 4 });
    F.box(0.45, 1.86, -0.2, 0.2, 0.04, 0.2, 0, B, 'bronze');
    F.tube([[0.45, 1.86, -0.2], [0.45, 1.98, -0.16], [0.45, 2.04, -0.04], [0.45, 2.05, 0.1]], (t) => 0.03 + 0.12 * t * t, B, 'bronze', { seg: 10, double: true });
    F.box(0, 0.25, 0.2, 0.7, 0.22, 0.02, 0, F.col('paintOrange'), 'metal');
    IZP_stencil(F, 0, 0.27, 0.212, 0.66, 0.18, 0, 'SIG-1', 'paintOrange', 'stencilCream');
    F.lamp(0, 1.4, 0.4, 0.5, 4);
  }
});

/* the citadel's shield emitter (UNIQUE): the Shield Generator Hall (pal_shield) */
FURN({
  key: 'iziz_shield_emitter', name: 'The citadel\'s shield emitter (unique)', culture: 'iziz', tier: 'common', type: 'monument', setting: 'indoor',
  rooms: ['pal_shield'], anchor: 'floor', clearance: { front: 1.5, back: 1.0, left: 1.0, right: 1.0 }, task: [],
  materials: ['plastic', 'metal', 'emissive', 'bronze', 'glass'],
  w: 7.0, d: 7.0, h: 10.0, variants: 1,
  build: function (F) {
    const W = F.col('ancientWhite'), A = F.col('alloyDark'), G = F.col('gratingGrey'), C = F.col('ancientCyan'), O = F.col('paintOrange'), q = Math.PI / 8;
    /* the octagonal service platform, a cyan line round its lip, two steps up at the front */
    F.frustum(0, 0, 0, 3.1, 3.0, 0.5, q, A, 'metal', 8);
    F.frustum(0, 0.5, 0, 2.96, 2.96, 0.02, q, G, 'metal', 8);
    F.frustum(0, 0.38, 0, 3.06, 3.06, 0.04, q, C, 'glow', 8);
    F.box(0, 0, 3.1, 1.4, 0.25, 0.4, 0, G, 'metal');
    F.box(0, 0.25, 2.85, 1.4, 0.25, 0.3, 0, G, 'metal');
    /* its rail: orange posts at the corners, two rails round all but the front */
    const V = (k, r, y) => { const a = q + k * Math.PI / 4; return [Math.cos(a) * r, y, Math.sin(a) * r]; };
    for (let k = 0; k < 8; k++) { const p = V(k, 2.8, 0); F.cyl(p[0], 0.52, p[2], 0.04, 1.05, 0, O, 'metal'); }
    for (const y of [1.05, 1.55]) {
      const pts = [];
      for (let k = 2; k <= 9; k++) pts.push(V(k, 2.8, y));   /* from the corner left of the steps round to the one right of them */
      F.tube(pts, 0.03, O, 'metal', { seg: 5 });
    }
    /* the column: a chamfered white base, an alloy spine, five banks of copper coils between white spacer plates */
    F.frustum(0, 0.52, 0, 1.4, 1.15, 1.0, q, W, 'plastic', 8);
    F.frustum(0, 0.95, 0, 1.33, 1.31, 0.06, q, C, 'glow', 8);
    F.cyl(0, 1.52, 0, 0.45, 5.6, 0, A, 'metal');
    for (let g = 0; g < 5; g++) {
      const y0 = 1.52 + g * 1.1;
      F.cyl(0, y0, 0, 1.0, 0.12, 0, W, 'plastic');
      F.cyl(0, y0 + 0.035, 0, 1.02, 0.05, 0, C, 'glow');
      for (let i = 0; i < 3; i++) IZP_hoop(F, 0, y0 + 0.36 + i * 0.3, 0, 0.78, 0.13, F.col('copperCoil'), 'bronze', 14);
    }
    F.cyl(0, 7.02, 0, 1.0, 0.12, 0, W, 'plastic');
    /* the collar and the glass crown, alight inside */
    F.frustum(0, 7.14, 0, 1.15, 0.85, 0.46, q, W, 'plastic', 8);
    F.ball(0, 8.55, 0, 0.6, C, 'glow');
    F.ell(0, 8.55, 0, 0.92, 0.98, 0.92, 0, F.col('glassChalk'), 'glass');
    for (let k = 0; k < 4; k++) {
      const a = k / 4 * F.TAU + Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
      F.beam(c * 0.8, 7.6, s * 0.8, c * 1.0, 8.55, s * 1.0, 0.1, 0.1, W, 'plastic');
      F.beam(c * 1.0, 8.55, s * 1.0, c * 0.28, 9.55, s * 0.28, 0.1, 0.1, W, 'plastic');
    }
    F.cyl(0, 9.5, 0, 0.32, 0.12, 0, W, 'plastic');
    F.frustum(0, 9.62, 0, 0.12, 0.05, 0.38, 0, A, 'metal', 6);
    /* cable conduits from the base across the deck and down to the floor */
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + k * Math.PI / 2, c = Math.cos(a), s = Math.sin(a), P = (r, y) => [c * r, y, s * r];
      F.tube([P(1.25, 0.7), P(2.4, 0.62), P(2.9, 0.45), P(3.15, 0.2), P(3.3, 0.08)], 0.1, G, 'metal', { seg: 6 });
      F.box(c * 3.3, 0, s * 3.3, 0.32, 0.22, 0.32, -a, A, 'metal');
    }
    F.lamp(0, 8.6, 0, 2.5, 14);
  }
});

/* ======== the mech depot (BLUEPRINT: Mech Bays I-IV, the Forgemasters' Repair Shop, the armoury and stores) ======== */

/* a mech cradle: the steel bay a walking machine stands in, its back to the bay's rear wall: Mech Bays (pal_mechbay) */
FURN({
  key: 'iziz_mech_cradle', name: 'Mech cradle', culture: 'iziz', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['pal_mechbay'], anchor: 'wall', clearance: { front: 3.0 }, task: [],
  materials: ['metal', 'plastic', 'emissive'],
  w: 8.0, d: 6.0, h: 10.0, variants: 1,
  build: function (F) {
    const O = F.col('paintOrange'), S = F.col('alloyGrey'), A = F.col('alloyDark'), G = F.col('gratingGrey'), R = F.col('rubberBlack');
    const zF = 2.75, zB = -2.8, y1 = 3.6, y2 = 7.0;
    /* the floor plate and the two foot pads the machine stands on */
    F.box(0, 0, 0.2, 5.4, 0.12, 4.8, 0, A, 'metal');
    IZP_hazard(F, 0, 0.01, 2.603, 5.3, 0.1, 0);
    for (const sx of [-1, 1]) F.box(sx * 1.3, 0.12, 0.3, 1.0, 0.1, 1.4, 0, S, 'metal');
    /* four orange columns, hazard-banded at the foot, and the top frame with its crane rail */
    for (const sx of [-1, 1]) for (const zc of [zB, zF]) F.box(sx * 3.75, 0, zc, 0.4, 9.7, 0.4, 0, O, 'metal');
    for (const sx of [-1, 1]) IZP_hazard(F, sx * 3.75, 0.05, zF + 0.203, 0.4, 0.7, 0);
    for (const zc of [zB, zF]) F.box(0, 9.7, zc, 7.9, 0.3, 0.4, 0, S, 'metal');
    for (const sx of [-1, 1]) F.box(sx * 3.75, 9.7, -0.025, 0.4, 0.3, 5.15, 0, S, 'metal');
    F.box(0, 9.3, -0.025, 0.25, 0.4, 5.15, 0, A, 'metal');
    /* the back bracing against the wall: ledgers and two X panels */
    for (const y of [0.3, 4.6]) F.box(0, y, -2.9, 7.1, 0.25, 0.2, 0, S, 'metal');
    for (const p of [[0.55, 4.6], [4.85, 9.7]]) for (const sx of [-1, 1]) F.beam(-3.5 * sx, p[0], -2.9, 3.5 * sx, p[1], -2.9, 0.14, 0.12, A, 'metal');
    /* gantries at two levels: grating decks down both sides and across the back, orange rails on the inner edge */
    for (const y of [y1, y2]) {
      for (const sx of [-1, 1]) {
        F.box(sx * 3.15, y, -0.025, 0.8, 0.08, 5.15, 0, G, 'metal');
        F.box(sx * 3.15, y - 0.22, -0.025, 0.12, 0.22, 5.15, 0, A, 'metal');
        IZP_hazard(F, sx * 2.747, y, -0.025, 5.1, 0.08, sx > 0 ? -Math.PI / 2 : Math.PI / 2);
        for (const zp of [-1.8, -0.6, 0.6, 1.8]) F.box(sx * 2.79, y + 0.08, zp, 0.05, 1.0, 0.05, 0, A, 'metal');
        F.box(sx * 2.79, y + 1.03, 0.35, 0.06, 0.06, 4.3, 0, O, 'metal');
        F.box(sx * 2.79, y + 0.55, 0.35, 0.04, 0.04, 4.3, 0, O, 'metal');
      }
      F.box(0, y, -2.2, 5.5, 0.08, 0.8, 0, G, 'metal');
      F.box(0, y - 0.22, -2.2, 5.5, 0.22, 0.12, 0, A, 'metal');
      for (const xp of [-1.4, 0, 1.4]) F.box(xp, y + 0.08, -1.83, 0.05, 1.0, 0.05, 0, A, 'metal');
      F.box(0, y + 1.03, -1.83, 5.58, 0.06, 0.06, 0, O, 'metal');
      F.box(0, y + 0.55, -1.83, 5.58, 0.04, 0.04, 0, O, 'metal');
    }
    /* two ladders at the front: the floor to the first gantry on the left, the first to the second on the right */
    [[-1, 0, y1 + 1.0], [1, y1 + 0.08, y2 + 1.0]].forEach(function (L) {
      const x = L[0] * 3.15, z = 2.62;
      for (const dx of [-0.25, 0.25]) F.box(x + dx, L[1], z, 0.05, L[2] - L[1], 0.05, 0, A, 'metal');
      for (let y = L[1] + 0.3; y < L[2] - 1.0 + 0.05; y += 0.3) F.box(x, y, z, 0.5, 0.03, 0.03, 0, S, 'metal');
    });
    /* a hose reel on the right rear column */
    F.box(3.75, 1.3, -2.55, 0.3, 0.4, 0.1, 0, A, 'metal');
    F.rod(3.6, 1.6, -2.55, 3.6, 1.6, -2.22, 0.14, A, 'metal');
    for (const z of [-2.53, -2.24]) F.rod(3.6, 1.6, z - 0.02, 3.6, 1.6, z + 0.02, 0.3, O, 'metal');
    for (const z of [-2.47, -2.39, -2.31]) IZP_loop(F, 3.6, 1.6, z, 0.22, 0.04, 0, R, 'plastic', 12);
    F.tube([[3.38, 1.6, -2.31], [3.36, 0.9, -2.2], [3.3, 0.2, -2.0], [3.2, 0.05, -1.7]], 0.04, R, 'plastic', { seg: 5 });
    /* umbilicals hanging from the upper back gantry, ready to plug in */
    for (const sx of [-1, 1]) {
      F.tube([[sx * 1.0, y2, -2.3], [sx * 0.9, 5.8, -1.9], [sx * 0.7, 4.9, -1.5], [sx * 0.6, 4.75, -1.4]], 0.06, R, 'plastic', { seg: 6 });
      F.box(sx * 0.6, 4.55, -1.4, 0.14, 0.2, 0.14, 0, O, 'metal');
      F.box(sx * 0.6, 4.5, -1.4, 0.08, 0.05, 0.08, 0, F.col('ancientCyan'), 'glow');
    }
    /* work lights under the front beam and the bay's stencilled number */
    F.box(0, 9.55, 2.45, 1.2, 0.1, 0.15, 0, F.col('electric'), 'glow');
    IZP_stencil(F, 0, 9.73, zF + 0.203, 1.6, 0.24, 0, 'BAY ' + IZP_BAYS[F.rnd() * 4 | 0], 'paintOrange', 'paintBlack');
    F.lamp(0, 9.3, 1.5, 1.5, 14);
  }
});

/* a chain hoist on an overhead rail: the Mech Bays and the Repair Shop (pal_mechbay, pal_forge) */
FURN({
  key: 'iziz_mech_hoist', name: 'Chain hoist on a rail', culture: 'iziz', tier: 'common', type: 'tool', setting: 'indoor',
  rooms: ['pal_mechbay', 'pal_forge'], anchor: 'ceiling', clearance: {}, task: [],
  materials: ['metal'],
  w: 6.0, d: 0.8, h: 3.0, variants: 1,
  build: function (F) {
    const O = F.col('paintOrange'), S = F.col('alloyGrey'), A = F.col('alloyDark'), I = F.col('ironSoot');
    /* the rail: an I-beam on ceiling cleats, end stops, a load stencil and hazard ends */
    F.box(0, 2.95, 0, 6.0, 0.05, 0.42, 0, S, 'metal');
    F.box(0, 2.62, 0, 6.0, 0.33, 0.06, 0, O, 'metal');
    F.box(0, 2.57, 0, 6.0, 0.05, 0.42, 0, S, 'metal');
    for (const sx of [-1, 1]) {
      F.box(sx * 2.6, 2.9, 0, 0.3, 0.1, 0.6, 0, A, 'metal');
      F.box(sx * 2.95, 2.3, 0, 0.1, 0.27, 0.3, 0, A, 'metal');
      IZP_hazard(F, sx * 2.7, 2.62, 0.032, 0.5, 0.33, 0);
    }
    IZP_stencil(F, -1.6, 2.64, 0.032, 1.0, 0.2, 0, 'SWL 25T', 'paintOrange', 'paintBlack');
    /* the trolley: side plates, four wheels on the lower flange, a crossbar */
    const tx = F.rr(-1.2, 1.6);
    for (const sz of [-1, 1]) {
      F.box(tx, 2.25, sz * 0.26, 0.6, 0.55, 0.04, 0, S, 'metal');
      for (const dx of [-0.18, 0.18]) F.rod(tx + dx, 2.69, sz * 0.06, tx + dx, 2.69, sz * 0.22, 0.07, I, 'metal');
    }
    F.box(tx, 2.25, 0, 0.6, 0.12, 0.56, 0, S, 'metal');
    /* the chain block, its hand wheel and hand chain, the load chain and the hook */
    F.box(tx, 2.12, 0, 0.06, 0.13, 0.06, 0, I, 'metal');
    F.box(tx, 1.7, 0, 0.42, 0.42, 0.34, 0, O, 'metal');
    F.rod(tx, 1.92, 0.17, tx, 1.92, 0.24, 0.17, A, 'metal');
    F.tube([[tx - 0.15, 1.88, 0.22], [tx - 0.15, 0.9, 0.22], [tx - 0.08, 0.8, 0.22], [tx + 0.08, 0.8, 0.22], [tx + 0.15, 0.9, 0.22], [tx + 0.15, 1.88, 0.22]], 0.012, I, 'metal', { seg: 4 });
    for (let i = 0; i < 9; i++) F.box(tx, 1.62 - i * 0.08, 0, i % 2 ? 0.05 : 0.016, 0.09, i % 2 ? 0.016 : 0.05, 0, I, 'metal');
    F.box(tx, 0.82, 0, 0.16, 0.18, 0.12, 0, O, 'metal');
    F.tube([[tx, 0.84, 0], [tx, 0.72, 0], [tx + 0.07, 0.62, 0], [tx + 0.03, 0.53, 0], [tx - 0.06, 0.56, 0], [tx - 0.08, 0.65, 0]], 0.025, I, 'metal', { seg: 6 });
  }
});

/* a wheeled tool cart, orange-painted steel: the Mech Bays and the Repair Shop (pal_mechbay, pal_forge) */
FURN({
  key: 'iziz_depot_tool_cart', name: 'Tool cart', culture: 'iziz', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['pal_mechbay', 'pal_forge'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['metal', 'plastic', 'hyperMahogany', 'bronze'],
  w: 1.0, d: 0.6, h: 1.0, variants: 1,
  build: function (F) {
    const O = F.col('paintOrange'), S = F.col('alloyGrey'), R = F.col('rubberBlack'), I = F.col('ironSoot');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {                                     /* casters */
      F.rod(sx * 0.36 - 0.02, 0.06, sz * 0.19, sx * 0.36 + 0.02, 0.06, sz * 0.19, 0.06, R, 'plastic');
      F.box(sx * 0.36, 0.08, sz * 0.19, 0.07, 0.06, 0.03, 0, S, 'metal');
    }
    F.box(0, 0.14, 0, 0.84, 0.62, 0.5, 0, O, 'metal');                                        /* the body and three drawers */
    for (let i = 0; i < 3; i++) {
      F.box(0, 0.18 + i * 0.19, 0.252, 0.78, 0.16, 0.01, 0, F.shade(O, 0.07), 'metal');
      F.box(0, 0.29 + i * 0.19, 0.262, 0.3, 0.02, 0.02, 0, S, 'metal');
    }
    F.box(0, 0.76, 0, 0.88, 0.03, 0.54, 0, S, 'metal');                                       /* the top tray and its lips */
    for (const sz of [-1, 1]) F.box(0, 0.79, sz * 0.26, 0.88, 0.05, 0.02, 0, S, 'metal');
    for (const sx of [-1, 1]) F.box(sx * 0.43, 0.79, 0, 0.02, 0.05, 0.54, 0, S, 'metal');
    for (const sz of [-1, 1]) F.box(-0.465, 0.5, sz * 0.2, 0.03, 0.45, 0.03, 0, S, 'metal');  /* the push handle */
    F.rod(-0.465, 0.95, -0.22, -0.465, 0.95, 0.22, 0.018, R, 'plastic');
    /* the tools on top: a spanner, a hammer, an oil can */
    F.box(0.05, 0.82, 0.08, 0.4, 0.02, 0.04, 0, S, 'metal');
    F.box(0.26, 0.82, 0.08, 0.06, 0.02, 0.1, 0, S, 'metal');
    F.rod(-0.3, 0.84, -0.1, 0.02, 0.84, -0.12, 0.014, F.col('mahoganyLight'), 'mahogany');
    F.box(0.04, 0.82, -0.12, 0.05, 0.05, 0.14, 0, I, 'metal');
    F.cyl(0.28, 0.82, -0.1, 0.06, 0.12, 0, F.col('bronze'), 'bronze');
    F.rod(0.28, 0.93, -0.1, 0.36, 0.99, -0.1, 0.006, F.col('bronze'), 'bronze');
    IZP_stencil(F, 0.422, 0.25, 0, 0.3, 0.12, Math.PI / 2, 'T-12', 'paintOrange', 'paintBlack');
  }
});

/* a stack of munitions crates, a few shells on top: the Armoury and the stores (pal_armoury, pal_store) */
FURN({
  key: 'iziz_depot_munitions_stack', name: 'Munitions crates', culture: 'iziz', tier: 'common', type: 'stack', setting: 'indoor',
  rooms: ['pal_armoury', 'pal_store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'bronze', 'metal'],
  w: 1.6, d: 1.0, h: 1.2, variants: 1,
  build: function (F) {
    const Ol = F.col('paintOlive');
    const crate = function (x, y, z, w, h, d) {
      F.box(x, y, z, w, h, d, 0, Ol, 'wood');
      for (const t of [0.03, h - 0.08]) F.box(x, y + t, z, w + 0.01, 0.05, d + 0.01, 0, F.shade(Ol, -0.15), 'wood');
      IZP_stencil(F, x, y + h * 0.32, z + d / 2 + 0.008, w * 0.7, h * 0.34, 0, IZP_MUNITIONS[F.rnd() * 4 | 0], 'paintOlive', 'paintOrange', 'wood');
    };
    for (const y of [0, 0.4]) for (const sx of [-1, 1]) crate(sx * 0.4, y, 0, 0.76, 0.4, 0.98);
    crate(-0.4, 0.8, -0.02, 0.74, 0.38, 0.92);
    /* three shells laid on the second tier: brass case, olive projectile, copper band */
    for (let i = 0; i < 3; i++) {
      const x = 0.18 + i * 0.2, y = 0.87;
      F.rod(x, y, -0.32, x, y, 0.12, 0.07, F.col('brassShell'), 'bronze');
      F.rod(x, y, 0.12, x, y, 0.15, 0.072, F.col('copperCoil'), 'bronze');
      F.rod(x, y, 0.15, x, y, 0.3, 0.068, Ol, 'metal');
      F.ball(x, y, 0.3, 0.066, Ol, 'metal');
    }
  }
});

/* a rack of large artillery shells for the mechs' guns: the Armoury and the Mech Bays (pal_armoury, pal_mechbay) */
FURN({
  key: 'iziz_depot_shell_rack', name: 'Shell rack', culture: 'iziz', tier: 'common', type: 'rack', setting: 'indoor',
  rooms: ['pal_armoury', 'pal_mechbay'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['metal', 'bronze'],
  w: 1.8, d: 0.6, h: 1.6, variants: 1,
  build: function (F) {
    const S = F.col('alloyGrey'), A = F.col('alloyDark'), O = F.col('paintOrange');
    F.box(0, 0.05, -0.29, 1.76, 1.5, 0.02, 0, A, 'metal');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.87, 0, sz * 0.27, 0.06, 1.6, 0.06, 0, S, 'metal');
    for (const y of [0.05, 0.8]) F.box(0, y, 0, 1.8, 0.05, 0.58, 0, S, 'metal');
    F.box(0, 1.55, 0, 1.8, 0.05, 0.6, 0, S, 'metal');
    [0.1, 0.85].forEach(function (y) {
      for (let i = 0; i < 5; i++) {
        const x = -0.64 + i * 0.32;
        F.cyl(x, y, 0.02, 0.1, 0.4, 0, F.col('brassShell'), 'bronze');          /* the case */
        F.cyl(x, y + 0.4, 0.02, 0.103, 0.03, 0, F.col('copperCoil'), 'bronze');  /* the driving band */
        F.cone(x, y + 0.43, 0.02, 0.1, 0.24, 0, F.col('paintOlive'), 'metal');   /* the ogive */
      }
      F.box(0, y + 0.3, 0.26, 1.74, 0.05, 0.02, 0, O, 'metal');                  /* the retaining strap */
    });
    F.box(0, 0.36, 0.272, 0.5, 0.12, 0.02, 0, O, 'metal');
    IZP_stencil(F, 0, 0.37, 0.283, 0.46, 0.1, 0, 'HE 120', 'paintOrange', 'paintBlack');
  }
});

/* a stack of armour plates on a pallet, painted orange and white and worn: the Repair Shop, stores, Mech Bays */
FURN({
  key: 'iziz_depot_plate_stack', name: 'Armour-plate stack', culture: 'iziz', tier: 'common', type: 'stack', setting: 'indoor',
  rooms: ['pal_forge', 'pal_store', 'pal_mechbay'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal', 'plastic'],
  w: 2.0, d: 1.4, h: 1.05, variants: 1,
  build: function (F) {
    const P = F.col('timberPallet'), O = F.col('paintOrange'), W = F.col('ancientWhite');
    for (const x of [-0.9, 0, 0.9]) F.box(x, 0, 0, 0.1, 0.1, 1.4, 0, F.shade(P, -0.15), 'wood');
    for (let i = 0; i < 5; i++) F.box(0, 0.1, -0.6 + i * 0.3, 2.0, 0.03, 0.2, 0, P, 'wood');
    /* six curved plates, each an arc of four facets across x, nested and stacked */
    const R = 1.4, th = [-0.7, -0.35, 0, 0.35, 0.7];
    for (let k = 0; k < 6; k++) {
      const y0 = 0.15 + k * 0.11, c = k % 2 ? W : O, c2 = k % 2 ? O : W, fam = k % 2 ? 'plastic' : 'metal', fam2 = k % 2 ? 'metal' : 'plastic';
      const pt = (t) => [R * Math.sin(t) * 0.92, y0 + R * (Math.cos(t) - Math.cos(0.7))];
      const zs = F.rr(-0.06, 0.06), wear = F.rnd() * 4 | 0;
      for (let f = 0; f < 4; f++) {
        const a = pt(th[f]), b = pt(th[f + 1]);
        F.beam(a[0], a[1], zs, b[0], b[1], zs, 0.04, 1.2, c, fam);
        F.beam(a[0], a[1] + 0.022, zs + 0.3, b[0], b[1] + 0.022, zs + 0.3, 0.006, 0.14, c2, fam2);        /* the livery stripe */
        if (f === wear) {                                                                     /* a worn patch along the facet */
          const m = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + 0.022];
          const u = m(0.2), v = m(0.7);
          F.beam(u[0], u[1], zs - 0.25, v[0], v[1], zs - 0.25, 0.005, 0.2, F.shade(c, -0.4), fam);
        }
      }
    }
  }
});

/* ======== the court's relics ======== */

/* a glass relic case on a bronze stand, an Ancient relic inside: the Reliquary, the Imperial Vault, the Throne Room */
FURN({
  key: 'iziz_relic_case', name: 'Relic case', culture: 'iziz', tier: 'court', type: 'monument', setting: 'indoor',
  rooms: ['pal_reliquary', 'pal_treasury', 'pal_throne'], anchor: 'floor', clearance: { front: 0.8 }, task: [],
  materials: ['bronze', 'gold', 'glass', 'cloth', 'emissive', 'metal', 'plastic'],
  w: 0.9, d: 0.9, h: 1.9, variants: 2, variantNames: ['A mech core', 'A founder\'s helm'],
  build: function (F) {
    const B = F.col('bronze'), Bd = F.col('bronzeDark'), Gd = F.col('gilt'), q = Math.PI / 8;
    /* the stepped bronze stand and its fluted shaft with gilt bands */
    F.box(0, 0, 0, 0.9, 0.1, 0.9, 0, Bd, 'bronze');
    F.box(0, 0.1, 0, 0.76, 0.08, 0.76, 0, B, 'bronze');
    F.frustum(0, 0.18, 0, 0.26, 0.2, 0.66, q, B, 'bronze', 8);
    for (const y of [0.28, 0.74]) F.frustum(0, y, 0, 0.255, 0.24, 0.04, q, Gd, 'gold', 8);
    for (let i = 0; i < 3; i++) {                                                             /* gilt chevrons on the step */
      const x = -0.18 + i * 0.18;
      for (const s of [-1, 1]) F.beam(x, 0.13, 0.385, x + s * 0.05, 0.16, 0.385, 0.012, 0.01, Gd, 'gold');
    }
    F.box(0, 0.84, 0, 0.62, 0.06, 0.62, 0, B, 'bronze');
    F.box(0, 0.9, 0, 0.76, 0.06, 0.76, 0, Gd, 'gold');
    /* the case: glass in a bronze frame, a stepped crown */
    F.box(0, 0.96, 0, 0.7, 0.8, 0.7, 0, F.col('glassChalk'), 'glass');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.35, 0.96, sz * 0.35, 0.035, 0.8, 0.035, 0, B, 'bronze');
    F.box(0, 1.76, 0, 0.78, 0.05, 0.78, 0, B, 'bronze');
    F.box(0, 1.81, 0, 0.56, 0.04, 0.56, 0, Gd, 'gold');
    F.frustum(0, 1.85, 0, 0.1, 0.04, 0.05, 0, Gd, 'gold', 6);
    F.box(0, 0.96, 0, 0.4, 0.05, 0.4, 0, F.col('clothCrimson'), 'cloth');                 /* the cushion */
    if (F.variant === 1) {
      /* a founder's helm: bronze bowl, gilt visor, an orange crest */
      F.cyl(0, 1.01, 0, 0.03, 0.18, 0, Bd, 'bronze');
      F.cyl(0, 1.17, 0, 0.165, 0.03, 0, Bd, 'bronze');
      F.dome(0, 1.19, 0, 0.15, 0.17, 0, B, 'bronze');
      for (const s of [-1, 1]) F.box(s * 0.13, 1.08, 0.04, 0.02, 0.12, 0.1, 0, B, 'bronze');
      F.box(0, 1.2, 0.13, 0.18, 0.05, 0.03, 0, Gd, 'gold');
      F.box(0, 1.33, 0, 0.03, 0.11, 0.32, 0, F.col('clothOrange'), 'cloth');
    } else {
      /* a small mech core: a cyan orb in a three-ring cage on a white Ancient cradle */
      const A = F.col('alloyDark');
      F.frustum(0, 1.01, 0, 0.12, 0.08, 0.1, 0, F.col('ancientWhite'), 'plastic', 6);
      F.ball(0, 1.28, 0, 0.12, F.col('ancientCyan'), 'glow');
      for (let k = 0; k < 3; k++) IZP_loop(F, 0, 1.28, 0, 0.17, 0.012, k * Math.PI / 3, A, 'metal', 12);
      IZP_hoop(F, 0, 1.28, 0, 0.17, 0.012, A, 'metal', 12);
      F.lamp(0, 1.3, 0, 0.35, 3);
    }
  }
});

/* ======== the kitchens, the laundry and the baths ======== */

/* a cauldron on an iron tripod over a fire, lit: the Precinct and Palace Kitchens (pal_kitchen) */
FURN({
  key: 'iziz_common_cauldron', name: 'Cauldron on a tripod', culture: 'iziz', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['pal_kitchen'], anchor: 'floor', clearance: { front: 0.8, left: 0.4, right: 0.4 }, task: ['cooking'],
  materials: ['metal', 'stone', 'timber', 'emissive', 'food'],
  w: 1.2, d: 1.2, h: 1.6, variants: 1,
  build: function (F) {
    const I = F.col('ironSoot'), St = F.col('stoneGranite');
    F.cyl(0, 0, 0, 0.36, 0.02, 0, F.col('ashGrey'), 'stone');                                /* the ash bed in a ring of stones */
    for (let k = 0; k < 8; k++) { const a = k / 8 * F.TAU; F.box(Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42, 0.2, 0.12, 0.14, -a + Math.PI / 2, F.shade(St, F.rr(-0.1, 0.1)), 'stone'); }
    for (let k = 0; k < 3; k++) { const a = k / 3 * F.TAU + 0.5; F.rod(Math.cos(a) * 0.32, 0.05, Math.sin(a) * 0.32, Math.cos(a) * 0.04, 0.12, Math.sin(a) * 0.04, 0.045, F.col('timberSepia'), 'wood'); }
    F.cyl(0, 0.02, 0, 0.22, 0.04, 0, F.col('amber'), 'glow');
    for (let k = 0; k < 3; k++) { const a = k / 3 * F.TAU; F.cone(Math.cos(a) * 0.09, 0.06, Math.sin(a) * 0.09, 0.07, 0.22, 0, F.col('flame'), 'glow'); }
    /* the tripod and its chain */
    for (let k = 0; k < 3; k++) { const a = k / 3 * F.TAU + Math.PI / 6; F.rod(Math.cos(a) * 0.56, 0, Math.sin(a) * 0.56, 0, 1.56, 0, 0.025, I, 'metal'); }
    F.ball(0, 1.55, 0, 0.045, I, 'metal');
    for (let i = 0; i < 6; i++) F.box(0, 1.46 - i * 0.075, 0, i % 2 ? 0.04 : 0.014, 0.08, i % 2 ? 0.014 : 0.04, 0, I, 'metal');
    /* the pot: an iron belly, its rim, a stew, the bail it hangs by */
    F.lathe(0, 0.32, 0, [[0.08, 0], [0.28, 0.04], [0.38, 0.16], [0.4, 0.3], [0.37, 0.42], [0.4, 0.45]], 0, I, 'metal', { nu: 16, double: true });
    IZP_hoop(F, 0, 0.77, 0, 0.395, 0.018, F.shade(I, 0.1), 'metal', 16);
    F.cyl(0, 0.68, 0, 0.365, 0.02, 0, F.col('stewBrown'), 'food');
    const bail = [];
    for (let i = 0; i <= 8; i++) { const t = i / 8 * Math.PI; bail.push([-Math.cos(t) * 0.4, 0.75 + Math.sin(t) * 0.28, 0]); }
    F.tube(bail, 0.012, I, 'metal', { seg: 4 });
    F.lamp(0, 0.3, 0, 0.8, 6);
  }
});

/* a roasting spit over a long fire trough, lit: the Precinct and Palace Kitchens (pal_kitchen) */
FURN({
  key: 'iziz_common_spit', name: 'Roasting spit', culture: 'iziz', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['pal_kitchen'], anchor: 'floor', clearance: { front: 0.9 }, task: ['cooking'],
  materials: ['stone', 'metal', 'emissive', 'food', 'hyperMahogany'],
  w: 2.2, d: 0.8, h: 1.15, variants: 1,
  build: function (F) {
    const Br = F.col('brickRed'), I = F.col('ironSoot'), Mo = F.col('mortarGrey');
    /* the brick fire trough, its mortar courses, the coals and flames */
    for (const sz of [-1, 1]) {
      F.box(0, 0, sz * 0.3, 1.8, 0.35, 0.12, 0, Br, 'stone');
      for (const y of [0.11, 0.23]) F.box(0, y, sz * 0.361, 1.8, 0.012, 0.003, 0, Mo, 'stone');
    }
    for (const sx of [-1, 1]) F.box(sx * 0.84, 0, 0, 0.12, 0.35, 0.48, 0, Br, 'stone');
    F.box(0, 0, 0, 1.56, 0.08, 0.48, 0, F.col('ashGrey'), 'stone');
    F.box(0, 0.08, 0, 1.5, 0.07, 0.44, 0, F.col('amber'), 'glow');
    for (let k = 0; k < 5; k++) F.cone(-0.6 + k * 0.3, 0.14, F.rr(-0.08, 0.08), 0.07, F.rr(0.16, 0.26), 0, F.col('flame'), 'glow');
    /* the forked iron uprights, the spit and its crank */
    for (const sx of [-1, 1]) {
      F.cyl(sx * 1.0, 0, 0, 0.03, 0.9, 0, I, 'metal');
      for (const sz of [-1, 1]) F.beam(sx * 1.0, 0.88, 0, sx * 1.0, 1.0, sz * 0.07, 0.025, 0.025, I, 'metal');
    }
    F.rod(-1.08, 0.95, 0, 1.06, 0.95, 0, 0.012, I, 'metal');
    F.beam(1.06, 0.95, 0, 1.06, 0.8, 0, 0.02, 0.02, I, 'metal');
    F.rod(1.03, 0.8, 0, 1.1, 0.8, 0, 0.02, F.col('mahoganyDark'), 'mahogany');
    /* the roast: a haunch with crackling, a fowl either side */
    F.ell(0, 0.95, 0, 0.42, 0.17, 0.19, 0, F.col('meatRoast'), 'food');
    for (const sx of [-1, 1]) F.ell(sx * 0.2, 0.98, 0, 0.14, 0.12, 0.15, 0, F.col('meatCrisp'), 'food');
    for (const sx of [-1, 1]) F.ell(sx * 0.64, 0.95, 0, 0.12, 0.09, 0.09, 0, F.col('meatCrisp'), 'food');
    F.lamp(0, 0.35, 0, 0.9, 6);
  }
});

/* a laundry copper: a brick-housed copper boiler with a fire door: the kitchens (pal_kitchen) */
FURN({
  key: 'iziz_common_copper', name: 'Laundry copper', culture: 'iziz', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['pal_kitchen'], anchor: 'wall', clearance: { front: 0.9 }, task: [],
  materials: ['stone', 'bronze', 'hyperMahogany', 'metal', 'emissive'],
  w: 1.2, d: 1.0, h: 1.4, variants: 1,
  build: function (F) {
    const Br = F.col('brickRed'), I = F.col('ironSoot');
    F.box(0, 0, -0.05, 1.2, 0.9, 0.9, 0, Br, 'stone');                                       /* the brick housing */
    for (let i = 1; i < 6; i++) F.box(0, i * 0.15, 0.401, 1.2, 0.012, 0.004, 0, F.col('mortarGrey'), 'stone');
    F.box(0, 0.9, -0.05, 1.2, 0.06, 0.9, 0, F.col('stoneLinen'), 'stone');                  /* the stone top */
    F.cyl(0, 0.94, 0, 0.42, 0.06, 0, F.col('copperCoil'), 'bronze');                         /* the copper's rim and lid */
    F.cyl(0, 1.0, 0, 0.39, 0.04, 0, F.col('mahoganyRed'), 'mahogany');
    F.box(0, 1.04, 0, 0.3, 0.04, 0.05, 0, F.col('mahoganyDark'), 'mahogany');
    /* the fire door, its glowing vents and the ash pit */
    F.box(0, 0.2, 0.4, 0.36, 0.28, 0.03, 0, I, 'metal');
    F.box(0, 0.38, 0.416, 0.24, 0.03, 0.004, 0, F.col('amber'), 'glow');
    F.box(0.12, 0.3, 0.425, 0.06, 0.03, 0.02, 0, F.col('bronze'), 'bronze');
    F.box(0, 0.04, 0.4, 0.3, 0.1, 0.02, 0, F.col('ashGrey'), 'stone');
    F.cyl(0.4, 0.96, -0.36, 0.08, 0.44, 0, I, 'metal');                                       /* the flue */
    F.beam(-0.55, 0, 0.3, -0.55, 1.25, -0.12, 0.04, 0.04, F.col('mahoganyLight'), 'mahogany'); /* a washing dolly leant on it */
    F.lamp(0, 0.3, 0.6, 0.4, 4);
  }
});

/* an ice chest: mahogany lined with zinc, brass hinges: the kitchens and stores (pal_kitchen, pal_store) */
FURN({
  key: 'iziz_common_ice_box', name: 'Ice chest', culture: 'iziz', tier: 'common', type: 'storage', role: 'store', setting: 'indoor',
  rooms: ['pal_kitchen', 'pal_store'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['hyperMahogany', 'metal', 'bronze'],
  w: 1.06, d: 0.62, h: 0.87, variants: 1,
  build: function (F) {
    const M = F.col('mahoganyRed'), Md = F.col('mahoganyDark'), Bz = F.col('bronzeLight');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cyl(sx * 0.42, 0, sz * 0.22, 0.04, 0.1, 0, Md, 'mahogany');
    F.box(0, 0.1, 0, 1.0, 0.06, 0.6, 0, Md, 'mahogany');
    F.box(0, 0.1, 0, 0.96, 0.6, 0.56, 0, M, 'mahogany');
    for (const sx of [-1, 1]) F.box(sx * 0.23, 0.22, 0.285, 0.38, 0.4, 0.02, 0, F.shade(M, 0.08), 'mahogany');   /* raised panels */
    F.box(0, 0.7, 0, 0.97, 0.025, 0.57, 0, F.col('zincGrey'), 'metal');                      /* the zinc lining at the seam */
    F.box(0, 0.725, 0, 1.0, 0.1, 0.6, 0, M, 'mahogany');                                       /* the lid and its moulding */
    F.box(0, 0.825, 0, 0.9, 0.04, 0.5, 0, Md, 'mahogany');
    F.box(0, 0.64, 0.29, 0.07, 0.07, 0.01, 0, Bz, 'bronze');                                   /* the hasp */
    for (const sx of [-1, 1]) {
      F.box(sx * 0.3, 0.69, -0.3, 0.12, 0.06, 0.02, 0, Bz, 'bronze');                         /* hinges */
      F.box(sx * 0.505, 0.45, 0, 0.02, 0.04, 0.2, 0, Bz, 'bronze');                           /* side handles */
      for (const sz of [-1, 1]) F.box(sx * 0.475, 0.66, sz * 0.275, 0.06, 0.2, 0.06, 0, Bz, 'bronze');   /* corner guards */
    }
    F.rod(0.48, 0.17, 0.15, 0.525, 0.17, 0.15, 0.015, Bz, 'bronze');                           /* the drain tap */
  }
});

/* a stone basin with a bronze tap: the Baths and the kitchens (pal_bath, pal_kitchen) */
FURN({
  key: 'iziz_common_bath_basin', name: 'Stone basin with a bronze tap', culture: 'iziz', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['pal_bath', 'pal_kitchen'], anchor: 'wall', clearance: { front: 0.7 }, task: [],
  materials: ['stone', 'ceramic', 'glass', 'bronze'],
  w: 1.0, d: 0.6, h: 1.1, variants: 1,
  build: function (F) {
    const M = F.col('marbleWhite'), B = F.col('bronze');
    /* the splash back with a stepped Deco top and a teal tile band */
    F.box(0, 0, -0.27, 1.0, 0.9, 0.06, 0, M, 'stone');
    F.box(0, 0.9, -0.27, 0.7, 0.1, 0.06, 0, M, 'stone');
    F.box(0, 1.0, -0.27, 0.4, 0.1, 0.06, 0, M, 'stone');
    F.box(0, 0.76, -0.238, 0.9, 0.05, 0.006, 0, F.col('ceramicTeal'), 'ceramic');
    F.box(0, 0.83, -0.238, 0.9, 0.012, 0.004, 0, F.col('marbleVein'), 'stone');
    /* the pedestal, two corbels and the open basin with its water */
    F.frustum(0, 0, -0.05, 0.16, 0.12, 0.5, 0, M, 'stone', 4);
    for (const sx of [-1, 1]) F.box(sx * 0.3, 0.36, -0.18, 0.06, 0.14, 0.1, 0, M, 'stone');
    F.box(0, 0.5, -0.02, 0.8, 0.06, 0.5, 0, M, 'stone');
    F.box(0, 0.56, 0.2, 0.8, 0.16, 0.06, 0, M, 'stone');
    F.box(0, 0.56, -0.21, 0.8, 0.16, 0.06, 0, M, 'stone');
    for (const sx of [-1, 1]) F.box(sx * 0.37, 0.56, -0.005, 0.06, 0.16, 0.35, 0, M, 'stone');
    F.box(0, 0.56, -0.005, 0.68, 0.1, 0.35, 0, F.col('iceDark'), 'glass');
    /* the bronze tap */
    F.cyl(0, 0.84, -0.22, 0.03, 0.06, 0, B, 'bronze');
    F.rod(0, 0.86, -0.24, 0, 0.86, -0.09, 0.02, B, 'bronze');
    F.rod(0, 0.86, -0.09, 0, 0.79, -0.07, 0.016, B, 'bronze');
    F.box(0, 0.9, -0.2, 0.14, 0.02, 0.02, 0, B, 'bronze');
  }
});

/* ======== the brig, the guard and the music ======== */

/* a brig grate: a barred cell front with its door, iron: the Brig (pal_brig) */
FURN({
  key: 'iziz_common_cell_grate', name: 'Brig grate with its door', culture: 'iziz', tier: 'common', type: 'pen', setting: 'indoor',
  rooms: ['pal_brig'], anchor: 'wall', clearance: { front: 0.8 }, task: [],
  materials: ['metal', 'bronze'],
  w: 3.0, d: 0.2, h: 2.6, variants: 1,
  build: function (F) {
    const I = F.col('ironSoot'), Il = F.shade(I, 0.12);
    F.box(0, 0, 0, 3.0, 0.08, 0.2, 0, I, 'metal');                                           /* sill, header, jambs */
    F.box(0, 2.46, 0, 3.0, 0.14, 0.2, 0, I, 'metal');
    for (const sx of [-1, 1]) F.box(sx * 1.43, 0, 0, 0.14, 2.6, 0.2, 0, I, 'metal');
    /* the fixed bars either side, with their straps */
    const dx0 = -0.25, dx1 = 0.85;
    for (let x = -1.28; x < 1.33; x += 0.14) if (x < dx0 - 0.04 || x > dx1 + 0.04) F.box(x, 0.08, 0, 0.035, 2.38, 0.035, 0, Il, 'metal');
    for (const y of [0.9, 1.7]) {
      F.box((-1.36 + dx0) / 2, y, 0, dx0 + 1.36, 0.05, 0.05, 0, I, 'metal');
      F.box((dx1 + 1.36) / 2, y, 0, 1.36 - dx1, 0.05, 0.05, 0, I, 'metal');
    }
    /* the door: its heavy frame, bars, hinges, a food hatch and a bronze lock */
    for (const x of [dx0, dx1]) F.box(x, 0.08, 0.02, 0.08, 2.32, 0.1, 0, I, 'metal');
    for (const y of [0.1, 1.2, 2.3]) F.box((dx0 + dx1) / 2, y, 0.03, dx1 - dx0, 0.07, 0.07, 0, I, 'metal');
    for (let x = dx0 + 0.13; x < dx1 - 0.06; x += 0.14) F.box(x, 0.16, 0.03, 0.035, 2.16, 0.035, 0, Il, 'metal');
    for (const y of [0.4, 2.0]) F.box(dx0, y, 0.06, 0.1, 0.08, 0.05, 0, I, 'metal');
    F.box((dx0 + dx1) / 2, 0.95, 0.055, 0.3, 0.2, 0.02, 0, I, 'metal');
    F.box(dx1 - 0.1, 1.0, 0.07, 0.14, 0.2, 0.06, 0, F.col('bronze'), 'bronze');
    F.box(dx1 - 0.1, 1.09, 0.1, 0.02, 0.05, 0.004, 0, I, 'metal');
    IZP_stencil(F, -0.9, 2.48, 0.101, 0.5, 0.1, 0, 'B-' + (1 + (F.rnd() * 6 | 0)), 'paintOrange', 'paintBlack');
  }
});

/* wall manacles on a chain plate, and leg irons below: the Brig (pal_brig) */
FURN({
  key: 'iziz_common_manacles', name: 'Wall manacles', culture: 'iziz', tier: 'common', type: 'tool', setting: 'indoor',
  rooms: ['pal_brig'], anchor: 'wall', clearance: { front: 0.6 }, task: [],
  materials: ['metal'],
  w: 0.9, d: 0.3, h: 1.9, variants: 1,
  build: function (F) {
    const I = F.col('ironSoot'), Il = F.shade(I, 0.15);
    const chain = function (a, b, n) {
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n, p = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
        const P = p(t0), Q = p(t1);
        F.beam(P[0], P[1], P[2], Q[0], Q[1], Q[2], i % 2 ? 0.035 : 0.012, i % 2 ? 0.012 : 0.035, Il, 'metal');
      }
    };
    /* the upper plate: rivets, two eye rings, chains to the wrist cuffs */
    F.box(0, 1.45, -0.135, 0.6, 0.4, 0.03, 0, I, 'metal');
    for (const sx of [-1, 1]) for (const y of [1.5, 1.79]) F.box(sx * 0.25, y, -0.115, 0.03, 0.03, 0.01, 0, Il, 'metal');
    for (const sx of [-1, 1]) {
      IZP_loop(F, sx * 0.18, 1.52, -0.08, 0.04, 0.01, Math.PI / 2, Il, 'metal', 8);
      chain([sx * 0.18, 1.48, -0.08], [sx * 0.33, 1.0, -0.02], 7);
      IZP_hoop(F, sx * 0.33, 0.96, -0.02, 0.055, 0.014, Il, 'metal', 10);
      F.box(sx * 0.33, 0.93, 0.035, 0.03, 0.06, 0.02, 0, I, 'metal');
    }
    /* the lower plate and the leg irons lying on the floor */
    F.box(0, 0.08, -0.135, 0.5, 0.22, 0.03, 0, I, 'metal');
    for (const sx of [-1, 1]) {
      IZP_loop(F, sx * 0.15, 0.2, -0.08, 0.035, 0.01, Math.PI / 2, Il, 'metal', 8);
      chain([sx * 0.15, 0.17, -0.07], [sx * 0.3, 0.03, 0.0], 4);
      IZP_hoop(F, sx * 0.3, 0.018, 0.06, 0.07, 0.016, Il, 'metal', 10);
    }
  }
});

/* a stand of signal and parade drums: orange shells, bronze hoops: the guard, the Armoury, the Music Room */
FURN({
  key: 'iziz_common_drum_stand', name: 'Drum stand', culture: 'iziz', tier: 'common', type: 'rack', setting: 'indoor',
  rooms: ['pal_guard', 'pal_armoury', 'pal_music'], anchor: 'floor', clearance: { front: 0.8 }, task: [],
  materials: ['hyperMahogany', 'lacquer', 'bronze', 'hide', 'rope', 'gold'],
  w: 1.4, d: 0.7, h: 1.05, variants: 1,
  build: function (F) {
    const M = F.col('mahoganyRed'), Md = F.col('mahoganyDark'), B = F.col('bronze');
    /* the stand: a low shelf, a raised step behind, two posts with a stick bar, gilt finials */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.62, 0, sz * 0.27, 0.08, 0.04, 0.08, 0, Md, 'mahogany');
    F.box(0, 0.04, 0, 1.36, 0.05, 0.64, 0, Md, 'mahogany');
    F.box(0, 0.09, -0.16, 1.36, 0.29, 0.32, 0, M, 'mahogany');
    for (const sx of [-1, 1]) {
      F.box(sx * 0.64, 0.38, -0.3, 0.05, 0.6, 0.05, 0, Md, 'mahogany');
      F.ball(sx * 0.64, 1.0, -0.3, 0.04, F.col('gilt'), 'gold');
    }
    F.box(0, 0.9, -0.3, 1.28, 0.05, 0.05, 0, Md, 'mahogany');
    for (const sx of [-0.3, -0.24, 0.24, 0.3]) F.rod(sx, 0.9, -0.27, sx + 0.02, 0.5, -0.25, 0.012, F.col('mahoganyLight'), 'mahogany');
    /* three drums: two side drums on the shelf, a big drum on the step */
    const drum = function (x, y, z, r, h) {
      F.cyl(x, y, z, r, h, 0, F.col('clothOrange'), 'lacquer');
      F.cyl(x, y + h * 0.42, z, r + 0.004, h * 0.16, 0, F.col('ceramicTeal'), 'lacquer');
      for (const t of [0, h - 0.045]) F.cyl(x, y + t, z, r + 0.012, 0.045, 0, B, 'bronze');
      F.cyl(x, y + h - 0.006, z, r * 0.97, 0.012, 0, F.col('clothCream'), 'hide');
      for (let i = 0; i < 8; i++) {
        const a0 = i / 8 * F.TAU, a1 = (i + 0.5) / 8 * F.TAU, rr = r + 0.014;
        F.beam(x + Math.cos(a0) * rr, y + 0.045, z + Math.sin(a0) * rr, x + Math.cos(a1) * rr, y + h - 0.045, z + Math.sin(a1) * rr, 0.009, 0.009, F.col('stencilCream'), 'rope');
      }
    };
    for (const sx of [-1, 1]) drum(sx * 0.42, 0.09, 0.12, 0.19, 0.3);
    drum(0, 0.38, -0.08, 0.25, 0.5);
    F.rod(-0.12, 0.9, -0.02, 0.12, 0.9, -0.14, 0.012, F.col('mahoganyLight'), 'mahogany');
  }
});
