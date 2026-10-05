/* ======================================================================
   Krator Motor Vehicles: the Geomancers (kits/motor-vehicles/krator-vehicles-geomancer.js)

   The Geomancers: the oil-drilling guild of the Eastern Abyss (LORE.md 6.9; their town is
   Locus, settlements/locus/LOCUS-KIT-NOTES.md). They have electricity, batteries and
   salvaged Ancient engines; brown uniforms, canvas packs, brass. Their sign (the Locus
   fuel-station pole sign) is a brass flame on a brown disc with a brass rim; there is no
   Geomancer entry in core/sockets/38-symbols.js, so the sign here is modelled, not painted.

   One vehicle: geo_dune_buggy, the guild's sand buggy, built in the refinery workshops: a welded
   tube roll cage, a low tub of salvaged plate, a big exposed Ancient-salvage flat-four at the rear
   with exhaust stacks and a radiator, four balloon sand tyres, long-travel arms, a jerry can rack,
   the spare on the hood, a roof rack, a whip aerial with a pennant, headlamps and a lamp bar.
   Variants: 0 Scout (earth brown, two seats, rolled tarp), 1 Crew (oil black, a second seat row
   under a longer cage), 2 Drill rig (sand and brown, a folded auger mast on the rack, a cargo bed of
   drill pipe). Frame: kits/motor-vehicles/vehicles-core.js (+z forward, wheels on y = 0).
   ====================================================================== */

VEHICLE_CULTURE('geomancer', {
  name: 'Geomancers', sign: 'brass flame on a brown disc',
  lore: 'oil-drilling guild of the Eastern Abyss (Locus, Yuni); electricity, salvaged Ancient engines',
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    paintBrown: 0x6a4a2c, paintBrownDark: 0x4e3620, paintBlack: 0x24211d, paintSand: 0xb49a6c,
    oilBlack: 0x1d1b19, tube: 0x2b2825,
    brass: 0xb08432, brassLight: 0xc29a44, brassDark: 0x8a6626,
    steel: 0x565250, steelDark: 0x3e3a36, alloy: 0xc9c4b6, alloyDark: 0x8f8b80,
    rubber: 0x1f1d1b, hose: 0x2a2724,
    canvas: 0xa8936c, canvasDark: 0x7d6a4c, canvasOlive: 0x6c6a48, leather: 0x5a3a22, seat: 0x4b3a2a,
    lensWarm: 0xfff1c8, lensRed: 0xa8180e, lensAmber: 0xe09020, glowBlue: 0x5ab8ff,
    jerryRed: 0x8a2a1c, jerryOlive: 0x5a5a32, jerryBlack: 0x2a2a26,
    wood: 0x7a5a3a, rope: 0x9a8458, pennantBrass: 0xc9963a, pennantBrown: 0x7a5434, core: 0x8a7458
  }
});

VEHICLE({
  key: 'geo_dune_buggy', name: 'Geomancer dune buggy', culture: 'geomancer',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport'], drive: 'wheeled', seats: 2, fuel: 'refined oil',
    terrain: ['sand', 'salt flat', 'track'], setting: 'outdoor', guild: 'Geomancers' },
  variants: 3, variantNames: ['Scout', 'Crew', 'Drill rig'],
  /* overall box: 2.1 wide, 3.6 long; the cage top is 1.8 (data.cageH), the whip aerial reaches 3.05 */
  w: 2.1, d: 3.6, h: 3.05,
  /* data, not code: what a simulation reads (units: m, m/s, m/s^2, kg, L, km, rad) */
  data: {
    speed: 22, accel: 2.8, turnRadius: 5.2, maxSteer: 0.45, seats: 2, cargo: 150, mass: 880,
    fuel: 'refined oil', tank: 55, range: 260, drive: 'rear', wheelbase: 2.44, track: 1.68,
    clearance: 0.3, cageH: 1.8, engine: 'Ancient-salvage flat-four, air-cooled',
    wheels: [
      { name: 'wheel_fl', x: 0.84, z: 1.22, r: 0.425, w: 0.36, front: true, steer: true, drive: false },
      { name: 'wheel_fr', x: -0.84, z: 1.22, r: 0.425, w: 0.36, front: true, steer: true, drive: false },
      { name: 'wheel_rl', x: 0.84, z: -1.22, r: 0.425, w: 0.36, front: false, steer: false, drive: true },
      { name: 'wheel_rr', x: -0.84, z: -1.22, r: 0.425, w: 0.36, front: false, steer: false, drive: true }
    ]
  },
  variantData: [
    {},
    { seats: 4, cargo: 60, mass: 960, accel: 2.5 },
    { seats: 2, cargo: 320, mass: 1120, speed: 17, accel: 2.0, rig: 'auger mast, 2.2 m, folds onto the roof rack' }
  ],

  /* ONE wheel at the origin, axle along x (W.side: +1 the +x side, -1 the -x side) */
  wheel: function (F, W) {
    const v = F.variant;
    vehicleBalloonTyre({ r: W.r, w: W.w, lugs: W.spare ? 5 : 8, lugH: 0.026, rim: 0.215, side: W.side, segs: W.spare ? 10 : 13,
      tyre: F.col('rubber'), rimCol: F.col(['brass', 'oilBlack', 'paintBrown'][v]), hubCol: F.col('oilBlack'),
      nutCol: F.col(v === 0 ? 'oilBlack' : 'brass'), nuts: W.spare ? 0 : 3 });
  },

  build: function (F) {
    const v = F.variant, c = F.col;
    const paint = c(['paintBrown', 'paintBlack', 'paintSand'][v]);
    const trim = c(['paintBrownDark', 'brass', 'paintBrown'][v]);
    const cage = c(['tube', 'paintBrownDark', 'tube'][v]);
    const T = 0.032;                                   /* cage tube radius */
    const crew = v === 1, rig = v === 2;

    /* ---- chassis: floor pan, tub sides, bulkhead, nose, hood, skid plate */
    F.box(0, 0.38, 0.02, 1.20, 0.06, 1.96, 0, paint);
    for (const s of [-1, 1]) {
      F.box(s * 0.62, 0.40, 0.02, 0.05, 0.42, 1.94, 0, paint);
      F.box(s * 0.62, 0.80, 0.02, 0.07, 0.04, 1.94, 0, trim, 'metal');          /* the tub's capping rail */
      if (crew) F.box(s * 0.648, 0.56, 0.02, 0.01, 0.06, 1.90, 0, c('brass'), 'metal');   /* the Crew's brass stripe */
    }
    F.box(0, 0.40, -0.94, 1.24, 0.42, 0.05, 0, paint);                          /* rear bulkhead */
    F.box(0, 0.40, 0.97, 1.24, 0.46, 0.05, 0, paint);                           /* front bulkhead */
    F.box(0, 0.36, 1.30, 1.00, 0.26, 0.64, 0, paint);                           /* nose box */
    F.beam(0, 0.86, 0.98, 0, 0.62, 1.66, 1.04, 0.04, rig ? c('paintBrown') : paint);   /* hood */
    for (const s of [-1, 1]) {
      F.box(s * 0.50, 0.60, 1.12, 0.04, 0.21, 0.28, 0, trim);
      F.box(s * 0.50, 0.60, 1.40, 0.04, 0.12, 0.28, 0, trim);
    }
    F.box(0, 0.30, 1.18, 0.86, 0.06, 0.56, 0, c('steelDark'), 'metal');         /* skid plate */
    /* bumpers and the tow bar */
    F.rod(-0.72, 0.40, 1.72, 0.72, 0.40, 1.72, 0.04, c('oilBlack'), 'metal');
    for (const s of [-1, 1]) F.rod(s * 0.40, 0.40, 1.58, s * 0.40, 0.40, 1.72, 0.03, c('oilBlack'), 'metal');
    F.rod(-0.66, 0.52, -1.74, 0.66, 0.52, -1.74, 0.035, c('oilBlack'), 'metal');
    F.box(0, 0.44, -1.72, 0.10, 0.10, 0.10, 0, c('steelDark'), 'metal');        /* tow hitch */
    for (const s of [-1, 1]) F.rod(s * 0.58, 0.44, -0.90, s * 0.58, 0.52, -1.74, 0.035, c('oilBlack'), 'metal');   /* rear rails */

    /* ---- the Geomancers' sign: a brass flame on a brown disc, brass rim (both flanks and the nose) */
    const sign = function (x, y, z, ax, az) {
      F.disc(x, y, z, ax, 0, az, 0.12, 0.012, c('paintBrownDark'), '', 10);
      F.ring(x + ax * 0.006, y, z + az * 0.006, ax, 0, az, 0.12, 0.012, c('brassLight'), 'metal', 9);
      F.taper(x + ax * 0.012, y - 0.07, z + az * 0.012, 0, 1, 0, 0.022, 0.042, 0.05, c('brassLight'), 'metal', 6);   /* the flame: a bowl */
      F.taper(x + ax * 0.012, y - 0.02, z + az * 0.012, 0, 1, 0, 0.042, 0.004, 0.10, c('brassLight'), 'metal', 6);   /* and its tongue */
    };
    sign(0.645, 0.60, 0.42, 1, 0); sign(-0.645, 0.60, 0.42, -1, 0); sign(0, 0.50, 1.625, 0, 1);

    /* ---- headlamps on the nose face, the spare on the hood */
    for (const s of [-1, 1]) F.lamp(s * 0.34, 0.52, 1.68, 0, 0, 1, 0.075, 'head', c('oilBlack'), c('brass'));
    const hoodA = Math.atan2(0.24, 0.68);             /* the hood falls 0.24 over 0.68 */
    const sn = Math.sin(hoodA), cs = Math.cos(hoodA), sw = 0.36;
    /* the spare lies on the hood: hub over hood point z = 1.27, half a tyre width up the hood's normal (0, cs, sn) */
    const hz = 1.27, hy = 0.86 - (hz - 0.98) * 0.24 / 0.68 + 0.025;
    F.spareWheel(0, hy + cs * sw / 2, hz + sn * sw / 2, 0, cs, sn, { r: 0.425, w: sw, side: 1 });
    F.rod(0, hy, hz, 0, hy + cs * (sw + 0.06), hz + sn * (sw + 0.06), 0.02, c('brass'), 'metal');   /* clamp stud */

    /* ---- front suspension: A-arms, uprights, long coilovers to the cage */
    for (const s of [-1, 1]) {
      F.rod(s * 0.50, 0.40, 1.02, s * 0.64, 0.38, 1.22, 0.022, c('oilBlack'), 'metal');
      F.rod(s * 0.50, 0.40, 1.42, s * 0.64, 0.38, 1.22, 0.022, c('oilBlack'), 'metal');
      F.rod(s * 0.50, 0.62, 1.10, s * 0.63, 0.56, 1.22, 0.02, c('oilBlack'), 'metal');
      F.rod(s * 0.50, 0.62, 1.34, s * 0.63, 0.56, 1.22, 0.02, c('oilBlack'), 'metal');
      F.box(s * 0.63, 0.32, 1.22, 0.04, 0.28, 0.08, 0, c('steelDark'), 'metal');   /* upright */
      F.rod(s * 0.60, 0.46, 1.20, s * 0.58, 1.02, 1.00, 0.045, c('brass'), 'metal');   /* coilover (spring) */
      F.rod(s * 0.60, 0.46, 1.20, s * 0.59, 0.80, 1.09, 0.03, c('steel'), 'metal');    /* damper body */
      F.rod(s * 0.58, 1.02, 1.00, s * 0.60, 1.02, 0.84, 0.025, cage, 'metal');          /* shock tower gusset to the pillar */
    }
    /* ---- rear suspension: trailing arms, half-shafts, coilovers */
    for (const s of [-1, 1]) {
      F.beam(s * 0.60, 0.48, -0.46, s * 0.64, 0.42, -1.22, 0.06, 0.08, c('oilBlack'), 'metal');
      F.rod(s * 0.20, 0.42, -1.22, s * 0.64, 0.425, -1.22, 0.03, c('steelDark'), 'metal');
      F.rod(s * 0.63, 0.46, -1.12, s * 0.56, 1.10, -0.96, 0.045, c('brass'), 'metal');
    }
    F.box(0, 0.30, -1.22, 0.44, 0.24, 0.32, 0, c('steelDark'), 'metal');         /* transaxle */

    /* ---- the engine: an Ancient-salvage flat-four, tarnished white metal, exposed at the rear */
    F.box(0, 0.46, -1.50, 0.50, 0.36, 0.40, 0, c('alloy'), 'metal');            /* block */
    for (const s of [-1, 1]) {
      for (const z of [-1.41, -1.59]) F.rod(s * 0.24, 0.62, z, s * 0.46, 0.62, z, 0.08, c('alloyDark'), 'metal');   /* cylinders */
      for (const x of [0.32, 0.38, 0.44]) F.box(s * x, 0.50, -1.50, 0.016, 0.24, 0.40, 0, c('alloyDark'), 'metal');   /* fins */
      F.box(s * 0.52, 0.50, -1.50, 0.06, 0.24, 0.38, 0, c('steelDark'), 'metal');  /* heads */
      /* headers to the stacks */
      F.rod(s * 0.52, 0.56, -1.60, s * 0.42, 0.60, -1.73, 0.04, c('steelDark'), 'metal');
      F.rod(s * 0.42, 0.58, -1.73, s * 0.42, 1.52, -1.73, 0.045, c('oilBlack'), 'metal');   /* exhaust stack */
      F.taper(s * 0.42, 1.52, -1.73, 0, 1, 0, 0.045, 0.062, 0.07, c('brass'), 'metal', 8);  /* flared tip */
    }
    F.disc(0, 0.87, -1.56, 0, 1, 0, 0.13, 0.10, c('brass'), 'metal', 10);           /* air cleaner */
    F.disc(0, 0.935, -1.56, 0, 1, 0, 0.06, 0.03, c('brassDark'), 'metal', 8);
    F.lamp(0.12, 0.83, -1.36, 0, 1, 0, 0.035, 'cell', null, c('alloyDark'));      /* the Ancient cell's blue window */
    /* the radiator, upright behind the seats, with a fan shroud and hoses */
    F.box(0, 0.84, -0.99, 0.74, 0.54, 0.07, 0, c('brass'), 'metal');
    F.box(0, 0.88, -0.99, 0.64, 0.44, 0.09, 0, c('steelDark'), 'metal');
    F.disc(0, 1.10, -1.06, 0, 0, 1, 0.19, 0.06, c('oilBlack'), 'metal', 12);
    F.rod(-0.32, 1.42, -0.99, 0.32, 1.42, -0.99, 0.045, c('brass'), 'metal');   /* header tank */
    F.rod(0.24, 0.88, -1.02, 0.20, 0.78, -1.30, 0.03, c('hose'));
    F.rod(-0.24, 0.88, -1.02, -0.20, 0.78, -1.30, 0.03, c('hose'));

    /* ---- the cockpit: seats, dash and gauges, steering (driver on the +x side), gear lever */
    const seatCol = c(['seat', 'leather', 'canvasOlive'][v]);
    for (const s of [-1, 1]) {
      F.box(s * 0.32, 0.44, 0.36, 0.46, 0.14, 0.50, 0, seatCol);
      F.beam(s * 0.32, 0.56, 0.10, s * 0.32, 1.16, -0.02, 0.46, 0.10, seatCol);
      F.box(s * 0.32, 0.40, 0.36, 0.40, 0.04, 0.44, 0, c('oilBlack'), 'metal');
    }
    F.box(0, 0.70, 0.90, 1.12, 0.14, 0.10, 0, c('oilBlack'));
    for (const x of [0.20, 0.42]) {
      F.disc(x, 0.78, 0.848, 0, 0, -1, 0.048, 0.01, c('brass'), 'metal', 8);
      F.face(x, 0.78, 0.842, 0, 0, -1, 0.038, c('lensWarm'), '', 8);
    }
    F.rod(0.32, 0.62, 0.92, 0.32, 0.92, 0.70, 0.022, c('oilBlack'), 'metal');
    const sx = 0, sy = 0.30, sz = -0.22;               /* the column's direction */
    F.ring(0.32, 0.93, 0.69, sx, sy, sz, 0.17, 0.016, c('oilBlack'), 'metal', 12);
    F.rod(0.15, 0.93, 0.69, 0.49, 0.93, 0.69, 0.012, c('brass'), 'metal');
    F.rod(0.02, 0.44, 0.58, 0.04, 0.74, 0.52, 0.014, c('steel'), 'metal');
    F.knob(0.04, 0.75, 0.52, 0.03, c('brass'), 'metal');

    /* ---- behind the seats: the fuel tank; the Crew's bench on it, the Rig's cargo bed, the Scout's tray */
    F.rod(-0.46, 0.60, -0.68, 0.46, 0.60, -0.68, 0.14, c('oilBlack'), 'metal');
    F.disc(0.30, 0.755, -0.68, 0, 1, 0, 0.04, 0.05, c('brass'), 'metal', 8);
    if (crew) {
      F.box(0, 0.74, -0.58, 1.12, 0.12, 0.42, 0, seatCol);
      F.beam(0, 0.84, -0.78, 0, 1.30, -0.86, 1.12, 0.08, seatCol);
    } else if (rig) {
      F.box(0, 0.74, -0.56, 1.14, 0.04, 0.70, 0, c('steelDark'), 'metal');
      for (const s of [-1, 1]) F.box(s * 0.56, 0.78, -0.56, 0.03, 0.10, 0.70, 0, c('steelDark'), 'metal');
      /* drill pipe, stacked across the bed, and a crate of drill cores */
      for (let i = 0; i < 5; i++) {
        const row = i < 3 ? 0 : 1, k = row ? i - 3 : i, z0 = -0.38 - k * 0.11 - row * 0.055;
        F.rod(-0.50, 0.82 + row * 0.085, z0, 0.50, 0.82 + row * 0.085, z0, 0.042, c('steel'), 'metal');
      }
      F.box(0.20, 0.78, -0.78, 0.40, 0.18, 0.22, 0, c('wood'));
      F.box(-0.30, 0.78, -0.80, 0.30, 0.10, 0.20, 0, c('core'));
    } else {
      F.box(0, 0.74, -0.58, 1.10, 0.03, 0.54, 0, c('steelDark'), 'metal');
      F.box(-0.18, 0.77, -0.60, 0.44, 0.26, 0.34, 0, c('wood'));                 /* a crate */
      F.ring(0.26, 0.80, -0.60, 0, 1, 0, 0.13, 0.035, c('rope'), '', 12);       /* a coil of rope */
      if (F.chance(0.6)) F.box(0.26, 0.77, -0.82, 0.30, 0.16, 0.14, 0, c('canvasDark'));   /* a canvas pack */
    }

    /* ---- the roll cage: main hoop behind the seats, front hoop, top bars, harness bar, rear braces */
    for (const s of [-1, 1]) {
      F.tube([[s * 0.62, 0.82, -0.12], [s * 0.58, 1.62, -0.16], [s * 0.48, 1.76, -0.18]], T, cage, 'metal');
      F.tube([[s * 0.62, 0.84, 0.95], [s * 0.54, 1.62, 0.48], [s * 0.46, 1.74, 0.40]], T, cage, 'metal');
      F.rod(s * 0.46, 1.74, 0.40, s * 0.48, 1.76, -0.18, T, cage, 'metal');
      F.rod(s * 0.64, 0.84, 0.95, s * 0.64, 0.84, -0.12, T, cage, 'metal');             /* door bar */
    }
    F.rod(-0.48, 1.76, -0.18, 0.48, 1.76, -0.18, T, cage, 'metal');
    F.rod(-0.46, 1.74, 0.40, 0.46, 1.74, 0.40, T, cage, 'metal');
    F.rod(-0.60, 1.10, -0.13, 0.60, 1.10, -0.13, T, cage, 'metal');
    if (crew) {
      for (const s of [-1, 1]) {
        F.tube([[s * 0.60, 0.84, -0.93], [s * 0.54, 1.62, -0.96], [s * 0.46, 1.72, -0.98]], T, cage, 'metal');
        F.rod(s * 0.48, 1.76, -0.18, s * 0.46, 1.72, -0.98, T, cage, 'metal');
        F.rod(s * 0.46, 1.72, -0.98, s * 0.58, 0.52, -1.70, T, cage, 'metal');
      }
      F.rod(-0.46, 1.72, -0.98, 0.46, 1.72, -0.98, T, cage, 'metal');
    } else {
      for (const s of [-1, 1]) F.rod(s * 0.48, 1.76, -0.18, s * 0.58, 0.52, -1.70, T, cage, 'metal');
    }
    /* the lamp bar along the front hoop's top */
    F.rod(-0.42, 1.80, 0.40, 0.42, 1.80, 0.40, 0.022, c('oilBlack'), 'metal');
    for (const x of [-0.33, -0.11, 0.11, 0.33]) F.lamp(x, 1.80, 0.44, 0, 0, 1, 0.055, 'bar', c('oilBlack'), null);
    /* tail lamps on the rear bumper's ends */
    for (const s of [-1, 1]) F.lamp(s * 0.60, 0.62, -1.765, 0, 0, -1, 0.04, 'tail', null, c('oilBlack'));

    /* ---- the roof rack, and on it a rolled tarp (Scout, Crew) or the folded auger mast (Drill rig) */
    const rz1 = crew ? -0.96 : -0.18;
    for (const s of [-1, 1]) {
      F.rod(s * 0.44, 1.82, 0.36, s * 0.44, 1.82, rz1, 0.018, c('oilBlack'), 'metal');
      F.rod(s * 0.44, 1.76, 0.36, s * 0.44, 1.82, 0.36, 0.015, c('oilBlack'), 'metal');
      F.rod(s * 0.44, 1.76, rz1, s * 0.44, 1.82, rz1, 0.015, c('oilBlack'), 'metal');
    }
    for (let z = 0.36; z >= rz1 - 0.01; z -= crew ? 0.264 : 0.18) F.rod(-0.44, 1.82, z, 0.44, 1.82, z, 0.014, c('oilBlack'), 'metal');
    if (!rig) {
      const tarp = c(F.pick(['canvas', 'canvasOlive', 'canvasDark']));
      const tz = crew ? -0.30 : 0.10;
      F.rod(-0.40, 1.96, tz, 0.40, 1.96, tz, 0.12, tarp);
      for (const x of [-0.24, 0.24]) F.ring(x, 1.96, tz, 1, 0, 0, 0.123, 0.01, c('leather'), '', 12);
      if (crew) F.box(0.10, 1.83, 0.18, 0.50, 0.14, 0.28, 0, c('canvasDark'));         /* packs */
    } else {
      /* the auger mast, folded back along the rack: a three-rail truss, the auger stem and bit, the gear head at its
         foot on a rear A-frame, and the brass ram that raises it */
      const z0 = 0.62, z1 = -1.58;
      for (const s of [-1, 1]) F.rod(s * 0.13, 1.88, z0, s * 0.13, 1.88, z1, 0.022, c('oilBlack'), 'metal');
      F.rod(0, 2.06, z0, 0, 2.06, z1, 0.022, c('oilBlack'), 'metal');
      for (let z = z0; z >= z1 - 0.01; z -= 0.55) {
        F.rod(-0.13, 1.88, z, 0.13, 1.88, z, 0.014, c('oilBlack'), 'metal');
        for (const s of [-1, 1]) F.rod(s * 0.13, 1.88, z, 0, 2.06, z, 0.014, c('oilBlack'), 'metal');
      }
      F.rod(0, 1.95, z0 - 0.05, 0, 1.95, z1 + 0.30, 0.03, c('steel'), 'metal');          /* stem */
      for (let z = z0 - 0.15; z > z0 - 0.6; z -= 0.14) F.disc(0, 1.95, z, 0, 0.25, 1, 0.075, 0.012, c('steel'), 'metal', 8);   /* flights */
      F.taper(0, 1.95, z0 - 0.05, 0, 0, 1, 0.06, 0.006, 0.22, c('brassDark'), 'metal', 8);  /* bit */
      F.box(0, 1.80, -1.48, 0.32, 0.26, 0.26, 0, c('brass'), 'metal');                    /* gear head */
      for (const s of [-1, 1]) F.rod(s * 0.50, 0.52, -1.70, s * 0.10, 1.80, -1.50, 0.026, c('oilBlack'), 'metal');   /* A-frame */
      F.rod(0.18, 0.82, -1.66, 0.14, 1.86, -1.06, 0.035, c('brass'), 'metal');              /* ram */
    }

    /* ---- the jerry can rack on the step between the wheels (which slots are full is the seed's) */
    const can = function (x, z, col) {
      F.box(x, 0.45, z, 0.15, 0.44, 0.32, 0, col);
      F.box(x, 0.89, z + 0.05, 0.05, 0.04, 0.18, 0, col);                         /* handle */
      F.disc(x, 0.91, z - 0.11, 0, 1, 0, 0.025, 0.04, c('brass'), 'metal', 6);       /* cap */
      F.beam(x + Math.sign(x) * 0.077, 0.50, z - 0.12, x + Math.sign(x) * 0.077, 0.84, z + 0.12, 0.01, 0.03, col);   /* the X stamp */
      F.beam(x + Math.sign(x) * 0.077, 0.50, z + 0.12, x + Math.sign(x) * 0.077, 0.84, z - 0.12, 0.01, 0.03, col);
    };
    const canCols = ['jerryRed', 'jerryOlive', 'jerryBlack'];
    for (const s of [-1, 1]) {
      F.box(s * 0.80, 0.41, -0.36, 0.28, 0.04, 0.80, 0, c('steelDark'), 'metal');     /* step */
      F.rod(s * 0.93, 0.45, 0.04, s * 0.93, 0.80, 0.04, 0.016, c('oilBlack'), 'metal');
      F.rod(s * 0.93, 0.45, -0.76, s * 0.93, 0.80, -0.76, 0.016, c('oilBlack'), 'metal');
      F.rod(s * 0.93, 0.80, 0.04, s * 0.93, 0.80, -0.76, 0.016, c('oilBlack'), 'metal');
      F.rod(s * 0.93, 0.62, 0.04, s * 0.93, 0.62, -0.76, 0.012, c('leather'));       /* strap */
      const n = s > 0 ? 2 : (crew ? 1 : (F.chance(0.5) ? 2 : 1));
      for (let i = 0; i < n; i++) can(s * 0.80, -0.20 - i * 0.36, c(F.pick(canCols)));
    }

    /* ---- the whip aerial on the rear brace (-x side), with the guild pennant */
    const ax = -0.53, ay = 1.20, az = -0.92;
    F.taper(ax, ay - 0.06, az, 0, 1, 0, 0.03, 0.015, 0.12, c('brass'), 'metal', 8);   /* base spring */
    F.rod(ax, ay, az, ax, 2.40, az - 0.03, 0.008, c('oilBlack'), 'metal');
    F.rod(ax, 2.40, az - 0.03, ax, 3.02, az - 0.12, 0.006, c('oilBlack'), 'metal');
    const pen = c(v === 1 ? 'pennantBrass' : 'pennantBrown');
    F.tri([ax, 2.98, az - 0.11], [ax, 2.80, az - 0.085], [ax, 2.90, az - 0.52], pen);
  }
});
