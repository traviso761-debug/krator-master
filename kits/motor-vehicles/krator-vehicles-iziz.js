/* ======================================================================
   Krator Motor Vehicles: the Empire of Iziz (kits/motor-vehicles/krator-vehicles-iziz.js)

   The Empire of Iziz (LORE.md 6.2): the hyperjungle empire whose Forgemasters keep the last Ancient
   machines running (the walking mechs). Colours: orange, teal, cream; striped awnings. Sign: the sun
   (the palace's: an orb).

   One vehicle: iz_six_wheeler, an Ancient armoured six-wheeler recovered from the ruins and kept in the
   Forgemaster's Hall beside the mechs: a faceted hull over six balloon tyres (one steered axle in front,
   a tandem behind), a glasshouse cab of teal panes, running-gear housings between the wheels, a roll bar
   over the open rear bay. The Empire paints it its own orange and puts the sun on its flanks.
   Variants: 0 Lancer (orange, a four-tube rocket rack on the roof: the Empire's rockets, made at
   Roketstad when it was the Empire's munitions hub), 1 Courier (cream with an orange stripe, a striped
   awning over the bay, the palace orb on a mast, crates aboard). Frame: vehicles-core.js (+z forward).
   ====================================================================== */

VEHICLE_CULTURE('iziz', {
  name: 'Empire of Iziz', sign: 'sun',
  lore: 'hyperjungle empire; the Forgemasters keep Ancient machines running',
  /* PALETTE (sRGB; the runtime converts to linear). Vehicle keys only: the catalog's own iziz keys are
     not in this bundle (vehicle_bundle.py carries only the catalog core) */
  palette: {
    ochreOrange: 0xc0622c, ochreOrangeDark: 0x8e4420, creamPaint: 0xdccdaa, creamDark: 0xb4a482,
    tealGlass: 0x2f7f92, tealPaint: 0x2e7a72, gunmetal: 0x55534f, gunmetalDark: 0x34322f, underbody: 0x2a2826,
    tyre: 0x262422, rocket: 0xd0a440, rocketTip: 0xa8281c, gold: 0xc9a040, stripeCream: 0xe6d8b4,
    lensWarm: 0xfff1c8, lensRed: 0xa8180e, lensAmber: 0xe09020, crate: 0x7a5a3a, canvas: 0xa8936c
  }
});

VEHICLE({
  key: 'iz_six_wheeler', name: 'Izani armoured six-wheeler', culture: 'iziz',
  tags: { class: 'motor vehicle', type: ['vehicle', 'patrol', 'transport'], drive: 'wheeled', seats: 4, fuel: 'refined oil',
    terrain: ['road', 'track', 'sand', 'rock'], setting: 'outdoor', guild: 'Forgemasters' },
  variants: 2, variantNames: ['Lancer', 'Courier'],
  /* overall box: 2.8 wide, 6.7 long, 3.6 to the rockets' tips (the cab roof is 2.6) */
  w: 2.8, d: 6.7, h: 3.6,
  /* data, not code (units: m, m/s, m/s^2, kg, L, km, rad) */
  data: {
    speed: 20, accel: 1.6, turnRadius: 7.5, maxSteer: 0.5, seats: 4, cargo: 600, mass: 11200,
    fuel: 'refined oil', tank: 300, range: 600, drive: 'all six', wheelbase: 4.3, track: 2.24,
    clearance: 0.5, roofH: 2.6, engine: 'Ancient turbine, rebuilt by the Forgemasters', armament: 'four-tube rocket rack',
    wheels: [
      { name: 'wheel_fl', x: 1.12, z: 2.1, r: 0.62, w: 0.46, front: true, steer: true, drive: true },
      { name: 'wheel_fr', x: -1.12, z: 2.1, r: 0.62, w: 0.46, front: true, steer: true, drive: true },
      { name: 'wheel_l2', x: 1.12, z: -0.85, r: 0.62, w: 0.46, front: false, steer: false, drive: true },
      { name: 'wheel_r2', x: -1.12, z: -0.85, r: 0.62, w: 0.46, front: false, steer: false, drive: true },
      { name: 'wheel_rl', x: 1.12, z: -2.2, r: 0.62, w: 0.46, front: false, steer: false, drive: true },
      { name: 'wheel_rr', x: -1.12, z: -2.2, r: 0.62, w: 0.46, front: false, steer: false, drive: true }
    ]
  },
  variantData: [
    {},
    { seats: 6, cargo: 1400, mass: 10400, armament: 'none', speed: 22 }
  ],

  wheel: function (F, W) {
    const v = F.variant;
    vehicleBalloonTyre({ r: W.r, w: W.w, lugs: 11, lugH: 0.032, rim: 0.36, side: W.side, segs: 16,
      tyre: F.col('tyre'), rimCol: F.col(['ochreOrange', 'creamPaint'][v]), hubCol: F.col('gunmetalDark'),
      nutCol: F.col('gunmetal'), nuts: 6 });
    F.disc(W.side * W.w * 0.37, 0, 0, 1, 0, 0, 0.13, 0.05, F.col(['ochreOrangeDark', 'ochreOrange'][v]), 'metal', 8);   /* hub cap */
  },

  build: function (F) {
    const v = F.variant, c = F.col, lancer = v === 0;
    const paint = c(['ochreOrange', 'creamPaint'][v]), dark = c(['ochreOrangeDark', 'creamDark'][v]);
    const gm = c('gunmetal'), gmd = c('gunmetalDark'), glass = c('tealGlass');

    /* ---- the underbody: a narrow keel between the wheels (clear of the front wheels at full lock) */
    F.slab([[-3.0, 0.6, 0.52], [2.75, 0.6, 0.52], [3.2, 1.0, 0.52], [3.2, 1.3, 0.52], [-3.2, 1.3, 0.52], [-3.2, 0.9, 0.52]], c('underbody'), 'metal');
    /* ---- the hull in three bands, each with planar flanks: a belt flaring out over the wheels (1.18 -> 1.34),
       the upper hull leaning in (1.34 -> 1.22) with the hood rising to the windscreen, and the glasshouse cab */
    F.slab([[-3.25, 1.27, 1.18], [3.16, 1.27, 1.18], [3.33, 1.62, 1.34], [-3.3, 1.62, 1.34]], dark, '');
    F.slab([[-3.3, 1.62, 1.34], [3.33, 1.62, 1.34], [3.24, 1.84, 1.3], [1.85, 2.02, 1.22], [-3.2, 2.0, 1.22]], paint, '');
    const cabX = function (y) { return 1.08 - (y - 2.0) / 0.6 * 0.22; };
    const fzc = function (y) { return 1.85 - (y - 2.0) / 0.6 * 0.8; };
    F.slab([[1.85, 2.0, 1.08], [1.05, 2.6, 0.86], [-1.05, 2.6, 0.86], [-1.3, 2.0, 1.08]], paint, '');
    F.box(0, 2.6, 0.0, 1.6, 0.05, 2.0, 0, dark);                                                    /* roof plate */
    /* glazing: panes a hair proud of the cab's faces (double-sided triangles) */
    const pane = function (P) { F.tri(P[0], P[1], P[2], glass, 'metal'); F.tri(P[0], P[2], P[3], glass, 'metal'); };
    for (const s of [-1, 1]) {
      for (const zz of [[1.45, 0.45], [0.3, -0.85]]) {
        const y0 = 2.08, y1 = 2.5, z1 = zz[1];
        const zb0 = Math.min(zz[0], fzc(y0) - 0.08), zb1 = Math.min(zz[0], fzc(y1) - 0.08);
        pane([[s * (cabX(y0) + 0.012), y0, zb0], [s * (cabX(y1) + 0.012), y1, zb1], [s * (cabX(y1) + 0.012), y1, z1], [s * (cabX(y0) + 0.012), y0, z1]]);
      }
      const y0 = 2.08, y1 = 2.54;
      pane([[s * 0.06, y0, fzc(y0) + 0.012], [s * 0.06, y1, fzc(y1) + 0.012], [s * (cabX(y1) - 0.06), y1, fzc(y1) + 0.012], [s * (cabX(y0) - 0.07), y0, fzc(y0) + 0.012]]);
    }
    /* the front: hood vents, a grille under the nose, headlamps, tow eyes */
    for (let i = 0; i < 5; i++) { const z = 2.3 + i * 0.15; F.box(0, 1.84 + (3.24 - z) / 1.39 * 0.18 + 0.005, z, 0.9, 0.03, 0.06, 0, gmd, 'metal'); }
    F.box(0, 0.98, 3.2, 1.0, 0.3, 0.04, 0, gmd, 'metal');
    for (let i = 0; i < 6; i++) F.box(-0.4 + i * 0.16, 0.98, 3.22, 0.04, 0.3, 0.03, 0, gm, 'metal');
    for (const s of [-1, 1]) {
      F.lamp(s * 0.98, 1.45, 3.26, 0, -0.45, 1, 0.08, 'head', gmd, gm);
      F.lamp(s * 1.05, 1.45, -3.29, 0, 0, -1, 0.065, 'tail', null, gmd);
      F.box(s * 0.42, 0.8, 3.16, 0.16, 0.16, 0.2, 0, gmd, 'metal');                                  /* tow eyes */
    }
    /* ---- running-gear housings between the front and middle wheels; flank vents, an access panel, a step */
    for (const s of [-1, 1]) {
      F.box(s * 0.9, 0.5, 0.62, 0.4, 0.78, 0.84, 0, gm, 'metal');
      F.disc(s * 1.11, 0.9, 0.62, 1, 0, 0, 0.15, 0.03, gmd, 'metal', 10);
      F.disc(s * 1.12, 0.9, 0.62, 1, 0, 0, 0.05, 0.03, c('rocketTip'), 'metal', 8);
      for (let i = 0; i < 4; i++) F.box(s * 1.31, 1.82, -1.45 - i * 0.14, 0.03, 0.22, 0.06, 0, gmd, 'metal');
      F.box(s * 1.32, 1.72, 1.0, 0.03, 0.2, 0.7, 0, dark);
      F.box(s * 1.2, 1.3, 0.62, 0.16, 0.04, 0.6, 0, gmd, 'metal');
    }
    if (!lancer) for (const s of [-1, 1]) F.box(s * 1.268, 1.9, -0.1, 0.02, 0.07, 6.2, 0, c('ochreOrange'));   /* the Courier's stripe */
    /* the sun on both flanks: a gold disc with eight rays on the upper hull, behind the front wheel */
    for (const s of [-1, 1]) {
      const y = 1.8, z = 0.25, xr = function (yy) { return s * (1.34 - (yy - 1.62) / 0.38 * 0.12 + 0.016); };
      F.disc(xr(y), y, z, s, 0.12 / 0.38, 0, 0.12, 0.02, c('gold'), 'metal', 12);
      for (let i = 0; i < 8; i++) {
        const a = i * TAU / 8, ca = Math.cos(a), sa = Math.sin(a), w0 = 0.035;
        const p0 = [y + sa * 0.14, z + ca * 0.14], p1 = [y + sa * 0.24, z + ca * 0.24];
        F.tri([xr(p0[0] - ca * w0), p0[0] - ca * w0, p0[1] + sa * w0], [xr(p0[0] + ca * w0), p0[0] + ca * w0, p0[1] - sa * w0], [xr(p1[0]), p1[0], p1[1]], c('gold'), 'metal');
      }
    }

    /* ---- the rear bay: a deck, side rails, a roll bar over it */
    F.box(0, 2.0, -2.25, 2.3, 0.03, 1.9, 0, gmd, 'metal');
    for (const s of [-1, 1]) {
      F.rod(s * 1.12, 2.02, -1.33, s * 1.12, 2.36, -1.33, 0.035, gmd, 'metal');
      F.tube([[s * 1.12, 2.02, -3.12], [s * 1.04, 2.68, -3.02], [s * 0.92, 2.72, -2.97]], 0.045, gmd, 'metal');
      F.rod(s * 1.12, 2.36, -1.33, s * 1.12, 2.36, -3.07, 0.03, gmd, 'metal');
    }
    F.rod(-0.92, 2.72, -2.97, 0.92, 2.72, -2.97, 0.045, gmd, 'metal');
    F.lamp(0, 2.66, 0.92, 0, 0.2, 1, 0.07, 'amber', gmd, null);                                       /* the roof beacon */
    F.rod(-0.75, 2.62, -0.95, -0.75, 3.2, -1.0, 0.012, gmd, 'metal');                                /* whip */

    if (lancer) {
      /* the rocket rack: a turntable on the roof, a cradle, four tubes raised 22 degrees, red tips */
      F.disc(0, 2.66, -0.45, 0, 1, 0, 0.42, 0.08, gmd, 'metal', 14);
      F.box(0, 2.7, -0.45, 0.5, 0.18, 0.6, 0, dark);
      const el = 22 * Math.PI / 180, dy = Math.sin(el), dz = Math.cos(el);
      for (const s of [-1, 1]) F.box(s * 0.3, 2.72, -0.45, 0.06, 0.26, 0.5, 0, gm, 'metal');
      for (const tx of [-0.13, 0.13]) for (const ty of [0, 0.14]) {
        const x = tx, y = 2.9 + ty, z = -0.95, L = 1.15;
        F.rod(x, y, z, x, y + dy * L, z + dz * L, 0.058, c('rocket'), 'metal');
        F.taper(x, y + dy * L, z + dz * L, 0, dy, dz, 0.058, 0.01, 0.16, c('rocketTip'), 'metal', 8);
      }
      F.rod(-0.24, 2.92, -0.62, 0.24, 2.92, -0.62, 0.03, gm, 'metal');
      /* reload crates in the bay */
      for (const s of [-1, 1]) F.box(s * 0.5, 2.02, -2.45, 0.5, 0.3, 1.2, 0, c('ochreOrangeDark'));
    } else {
      /* the Courier: a striped awning on four posts over the bay, the palace orb on a mast, crates */
      for (const sx of [-1, 1]) for (const z of [-1.45, -3.05]) F.rod(sx * 1.0, 2.36, z, sx * 1.0, 2.95, z, 0.022, gmd, 'metal');
      const stripes = 7;
      for (let i = 0; i < stripes; i++) {
        const x0 = -1.06 + i * 2.12 / stripes, x1 = x0 + 2.12 / stripes, sag = function (x) { return 2.99 - 0.05 * (1 - Math.pow(x / 1.06, 2)); };
        const col = c(i % 2 ? 'stripeCream' : 'ochreOrange');
        F.tri([x0, sag(x0), -1.4], [x1, sag(x1), -1.4], [x1, sag(x1), -3.1], col);
        F.tri([x0, sag(x0), -1.4], [x1, sag(x1), -3.1], [x0, sag(x0), -3.1], col);
        F.tri([x0, sag(x0), -3.1], [x1, sag(x1), -3.1], [(x0 + x1) / 2, 2.84, -3.15], col);              /* the scalloped valance */
      }
      F.rod(0.75, 2.62, -0.2, 0.75, 3.2, -0.2, 0.02, c('gold'), 'metal');
      F.knob(0.75, 3.25, -0.2, 0.08, c('gold'), 'metal');
      F.box(-0.45, 2.02, -2.05, 0.7, 0.42, 0.5, 0, c('crate'));
      F.box(0.4, 2.02, -2.55, 0.6, 0.34, 0.6, 0, c('crate'));
      if (F.chance(0.6)) F.blob(0.35, 2.48, -1.9, 0.35, 0.4, 0, c('canvas'));
    }
  }
});
