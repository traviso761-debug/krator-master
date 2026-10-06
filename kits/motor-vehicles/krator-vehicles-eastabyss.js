/* ======================================================================
   Krator Motor Vehicles: the abyssal people (kits/motor-vehicles/krator-vehicles-eastabyss.js)

   The abyssal people (LORE.md 6.9) live on the salt marshes and deltas of the eastern Abyss beside the
   Geomancers' oil works: scavengers and recyclers, proud of it, "with pride and colour, not as squalor".
   Shade first (sails, umbrellas); bright paint and pastel lime-wash; tin-mirror cladding marks wealth and
   sanctity; gilded tips for the sacred and noble. Nothing electric. Catalog culture `eastabyss`; sign: the
   star. Colours: red lacquer, teal and gold for the sacred, pastels for the rest.

   One vehicle: ab_caravan_truck, a salvaged Ancient expedition truck that a caravan family runs on the
   Geomancers' crude: a high glazed cab over four big sand tyres, snorkels up its cheeks, a box body
   draped in dripping pastel tarps, packs and lockers slung along its flanks, an observation cupola under a
   tent canopy, a yellow parasol, tin-mirror shades on a mast (what the Ancients' sun panels became), two
   salvaged dishes kept for their shine, oil lanterns for lamps.
   Variants: 0 Caravan (sand, pastel tarps), 1 Headman's (teal paint, red-lacquer and gold tarps, tin-
   mirror cladding on the cab, gilded horns on the canopy). Frame: vehicles-core.js (+z forward).
   ====================================================================== */

VEHICLE_CULTURE('eastabyss', {
  name: 'Abyssal people', sign: 'star',
  lore: 'salt-marsh scavengers and recyclers of the eastern Abyss; shade first, pride and colour; nothing electric',
  /* DETAIL: palette key -> library detail family (vehicles-detail.js; materials.json); null: none (glass, lenses) */
  detail: {
    sandPaint: 'paintWorn', sandPaintDark: 'paintWorn', tealPaint: 'paintWorn', tealPaintDark: 'paintWorn',
    jerryRed: 'paintWorn', jerryYellow: 'paintWorn', lacquer: 'paint',
    pastelTeal: 'tarp', pastelMint: 'tarp', pastelPink: 'tarp', pastelRose: 'tarp', pastelPeach: 'tarp', pastelYellow: 'tarp',
    saffron: 'tarp', canopyRed: 'tarp', canopyOrange: 'tarp', canvas: 'canvas', canvasDark: 'canvas', crate: 'wood',
    glass: null, tin: null, hose: null, hoseDark: null, leather: null
  },
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    sandPaint: 0xc8ae84, sandPaintDark: 0x9c845e, tealPaint: 0x3f8a86, tealPaintDark: 0x2c625f,
    frame: 0x2e2c2a, glass: 0x3a5462, steel: 0x5e5a54, rubber: 0x2a2724, hubTeal: 0x4f8f8a,
    hose: 0xc07a3a, hoseDark: 0x8e5426, tin: 0xd6d8d4, gold: 0xc99a3a, lacquer: 0x9c2a1e,
    pastelTeal: 0x7fbfb0, pastelMint: 0xa8d4b8, pastelPink: 0xe0909a, pastelRose: 0xd06a78, pastelPeach: 0xe8b088,
    pastelYellow: 0xe8cc68, saffron: 0xe0a028, canopyRed: 0xb8443a, canopyOrange: 0xd88a3a,
    canvas: 0xb49a6c, canvasDark: 0x8a7450, leather: 0x6a4a2c, crate: 0x7a5a3a,
    lensWarm: 0xffd9a0, lensRed: 0xa8180e, lensAmber: 0xe09020, jerryRed: 0x9a3020, jerryYellow: 0xc8a02a
  }
});

VEHICLE({
  key: 'ab_caravan_truck', name: 'Abyssal caravan truck', culture: 'eastabyss',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport', 'cargo'], drive: 'wheeled', seats: 3, fuel: 'crude oil',
    terrain: ['sand', 'salt flat', 'mud', 'track'], setting: 'outdoor' },
  variants: 2, variantNames: ['Caravan', "Headman's"],
  /* overall box: 3.2 wide, 7.5 long; the cab roof is 3.05, the mast's shades 4.85 */
  w: 3.2, d: 7.5, h: 4.9,
  budget: { tris: 7200 },
  /* data, not code (units: m, m/s, m/s^2, kg, L, km, rad) */
  data: {
    speed: 14, accel: 1.0, turnRadius: 8, maxSteer: 0.5, seats: 3, berths: 4, cargo: 2500, mass: 7800,
    fuel: 'crude oil', tank: 240, range: 500, drive: 'all four', wheelbase: 4.2, track: 2.44,
    clearance: 0.55, cabH: 3.05, engine: 'Ancient-salvage diesel, run on the Geomancers’ crude', lamps: 'oil lanterns',
    wheels: [
      { name: 'wheel_fl', x: 1.22, z: 2.15, r: 0.78, w: 0.62, front: true, steer: true, drive: true },
      { name: 'wheel_fr', x: -1.22, z: 2.15, r: 0.78, w: 0.62, front: true, steer: true, drive: true },
      { name: 'wheel_rl', x: 1.22, z: -2.05, r: 0.78, w: 0.62, front: false, steer: false, drive: true },
      { name: 'wheel_rr', x: -1.22, z: -2.05, r: 0.78, w: 0.62, front: false, steer: false, drive: true }
    ]
  },
  variantData: [
    {},
    { seats: 3, berths: 2, cargo: 1600, mass: 8200, rank: 'the Headman’s household' }
  ],

  wheel: function (F, W) {
    vehicleBalloonTyre({ r: W.r, w: W.w, lugs: 14, lugH: 0.034, rim: 0.36, side: W.side, segs: 18,
      tyre: F.col('rubber'), rimCol: F.col(['steel', 'gold'][F.variant]), hubCol: F.col('hubTeal'), nutCol: F.col('frame'), nuts: 6 });
    F.disc(W.side * W.w * 0.3, 0, 0, 1, 0, 0, 0.2, 0.06, F.col('hubTeal'), 'metal', 12);
  },

  build: function (F) {
    const v = F.variant, c = F.col, head = v === 1;
    const paint = c(['sandPaint', 'tealPaint'][v]), paintDark = c(['sandPaintDark', 'tealPaintDark'][v]);
    const frame = c('frame'), glass = c('glass'), steel = c('steel');

    /* ---- chassis: rails, the engine between the front wheels (narrow: clear of them at full lock), axle housings */
    for (const s of [-1, 1]) F.box(s * 0.45, 0.74, 0, 0.16, 0.24, 6.4, 0, frame, 'metal');
    F.box(0, 0.7, 2.15, 0.9, 0.9, 1.2, 0, steel, 'metal');
    for (const z of [2.15, -2.05]) F.rod(-0.92, 0.78, z, 0.92, 0.78, z, 0.09, frame, 'metal');
    F.box(0, 0.78, 0.2, 1.3, 0.82, 2.6, 0, paintDark);                                              /* the tank and battery boxes */

    /* ---- the front: grille box, bumper, lanterns, the snorkels up the cheeks */
    F.box(0, 0.62, 3.32, 1.9, 1.0, 0.6, 0, paintDark);
    F.box(0, 0.5, 3.66, 2.3, 0.28, 0.16, 0, frame, 'metal');                                        /* bumper */
    F.box(-0.42, 0.86, 3.63, 0.8, 0.62, 0.04, 0, frame, 'metal');                                   /* the radiator grille */
    for (let i = 0; i < 7; i++) F.box(-0.76 + i * 0.113, 0.86, 3.655, 0.04, 0.6, 0.03, 0, c('hubTeal'), 'metal');
    for (const s of [-1, 1]) {
      F.lamp(s * 0.72, 1.2, 3.64, 0, 0, 1, 0.09, 'head', frame, c('gold'));
      F.lamp(s * 1.1, 1.75, -3.47, 0, 0, -1, 0.06, 'tail', null, frame);
      /* the snorkel: corrugated hose from under the bumper up the cab's cheek */
      const pts = [[s * 0.98, 0.7, 3.5], [s * 1.12, 1.05, 3.55], [s * 1.2, 1.7, 3.45], [s * 1.2, 2.5, 3.3], [s * 1.16, 2.95, 3.0]];
      F.tube(pts, 0.075, c('hose'));
      for (let i = 1; i < pts.length - 1; i++) F.ring(pts[i][0], pts[i][1], pts[i][2], pts[i + 1][0] - pts[i - 1][0], pts[i + 1][1] - pts[i - 1][1], pts[i + 1][2] - pts[i - 1][2], 0.082, 0.014, c('hoseDark'), '', 8);
      F.taper(s * 1.16, 2.95, 3.0, 0, 0.3, -1, 0.075, 0.1, 0.16, c('hoseDark'), '', 8);
    }

    /* ---- the cab: a glazed box over the front wheels */
    F.slab([[1.25, 1.6, 1.12], [3.5, 1.6, 1.12], [3.62, 2.0, 1.12], [3.5, 2.85, 1.08], [3.22, 3.05, 1.04], [1.25, 3.05, 1.08]], paint, '');
    const pane = function (P) { F.tri(P[0], P[1], P[2], glass, 'metal'); F.tri(P[0], P[2], P[3], glass, 'metal'); };
    const fz = function (y) { return 3.62 - (y - 2.0) / 0.85 * 0.12 + 0.012; };
    pane([[-1.0, 2.08, fz(2.08)], [-1.0, 2.8, fz(2.8)], [1.0, 2.8, fz(2.8)], [1.0, 2.08, fz(2.08)]]);
    F.box(0, 2.06, fz(2.4) + 0.01, 0.06, 0.76, 0.03, 0, frame, 'metal');                            /* the screen's pillar */
    for (const s of [-1, 1]) {
      const x = s * 1.128;
      pane([[x, 2.05, 1.95], [x, 2.85, 1.95], [x, 2.85, 3.38], [x, 2.05, 3.44]]);
      pane([[x, 2.15, 1.38], [x, 2.85, 1.38], [x, 2.85, 1.78], [x, 2.15, 1.78]]);
      for (const z of [1.86, 3.48]) F.rod(x, 1.62, z, x, 3.03, z, 0.05, frame, 'metal');            /* door pillars */
      F.rod(x, 1.95, 1.3, x, 1.95, 3.5, 0.03, frame, 'metal');
      /* the star on the door: an eight-pointed star of two squares, red lacquer on a gold disc */
      const sx = s * 1.135, sy = 1.78, sz = 2.6;
      F.disc(sx, sy, sz, 1, 0, 0, 0.15, 0.015, c('gold'), 'metal', 12);
      for (const rot of [0, Math.PI / 4]) {
        const q = [];
        for (let i = 0; i < 4; i++) { const a = rot + i * Math.PI / 2; q.push([sx + s * 0.01, sy + Math.sin(a) * 0.13, sz + Math.cos(a) * 0.13]); }
        F.tri(q[0], q[1], q[2], c('lacquer')); F.tri(q[0], q[2], q[3], c('lacquer'));
      }
      if (head) {
        /* tin-mirror cladding on the cab's lower flank: the Headman's wealth */
        for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) F.box(s * 1.13, 1.64 + j * 0.13, 1.42 + i * 0.36, 0.015, 0.11, 0.3, 0, c('tin'), 'metal');
      }
    }
    /* a roof rack on the cab, bags on it */
    for (const s of [-1, 1]) F.rod(s * 0.9, 3.12, 1.35, s * 0.9, 3.12, 3.1, 0.022, frame, 'metal');
    for (const z of [1.4, 2.2, 3.0]) F.rod(-0.9, 3.12, z, 0.9, 3.12, z, 0.02, frame, 'metal');
    F.box(-0.35, 3.12, 2.2, 0.8, 0.3, 1.2, 0, c('canvas'));
    F.blob(0.45, 3.3, 2.5, 0.32, 0.36, 0, c('canvasDark'));

    /* ---- the box body behind the cab, its lockers and slung packs */
    F.box(0, 1.6, -1.1, 2.4, 1.42, 4.7, 0, paint);
    F.box(0, 3.02, -1.1, 2.44, 0.05, 4.74, 0, paintDark);
    F.box(-0.35, 1.66, -3.47, 0.9, 1.25, 0.04, 0, paintDark);                                       /* the rear door */
    F.rod(-0.75, 2.3, -3.51, -0.75, 2.3, -3.49, 0.02, frame, 'metal');
    for (const x of [0.45, 1.0]) F.rod(x, 0.9, -3.52, x, 3.05, -3.52, 0.022, frame, 'metal');          /* the roof ladder */
    for (let i = 0; i < 7; i++) F.rod(0.45, 1.0 + i * 0.3, -3.52, 1.0, 1.0 + i * 0.3, -3.52, 0.016, frame, 'metal');
    for (const s of [-1, 1]) {
      /* lockers between the wheels, and packs strapped to the body under the tarp */
      F.box(s * 1.02, 0.86, 0.1, 0.36, 0.7, 1.9, 0, paintDark);
      F.box(s * 1.205, 1.0, 0.1, 0.02, 0.4, 0.8, 0, steel, 'metal');
      F.box(s * 1.22, 1.18, 0.1, 0.02, 0.04, 0.2, 0, frame, 'metal');
      const packs = [[-0.5, 0.62], [0.25, 0.5], [-1.25, 0.5]];
      for (const p of packs) {
        F.box(s * 1.3, 1.66, p[0], 0.2, 0.52, p[1], 0, c(F.pick(['canvas', 'canvasDark', 'canvas'])));
        F.box(s * 1.41, 1.66, p[0] - p[1] * 0.25, 0.02, 0.52, 0.04, 0, c('leather'));
        F.box(s * 1.41, 1.66, p[0] + p[1] * 0.25, 0.02, 0.52, 0.04, 0, c('leather'));
      }
      /* jerry cans on the rear corner */
      F.box(s * 1.32, 1.66, -2.95, 0.18, 0.48, 0.34, 0, c(F.pick(['jerryRed', 'jerryYellow'])));
    }

    /* ---- the tarps: dripping stripes over the body's shoulders, colour bands along its length */
    const bands = head ? ['lacquer', 'gold', 'lacquer', 'saffron', 'lacquer'] : ['pastelTeal', 'pastelMint', 'pastelPink', 'pastelPeach', 'pastelYellow'];
    for (const s of [-1, 1]) {
      const n = 22, z0 = 1.15, z1 = -3.3, sw = (z0 - z1) / n;
      for (let i = 0; i < n; i++) {
        const z = z0 - (i + 0.5) * sw, b = Math.min(bands.length - 1, Math.floor(i / n * bands.length));
        const col = c(bands[b]);
        const yb = 2.12 + 0.18 * Math.sin(i * 1.7) - F.rr(0, 0.22) - (i % 3 === 1 ? 0.12 : 0);   /* the drip line */
        const bx = s * (1.235 + 0.02 * Math.sin(i * 0.9));
        F.box(bx, yb, z, 0.025, 3.07 - yb, sw * 1.04, 0, col, 'tarp');
        F.box(s * 0.98, 3.05, z, 0.5, 0.025, sw * 1.04, 0, col, 'tarp');
      }
    }

    /* ---- the observation cupola, its tent canopy, the parasol, the mast with tin-mirror shades, two dishes */
    F.box(0, 3.05, -0.2, 1.7, 0.55, 1.9, 0, paintDark);
    for (const s of [-1, 1]) {
      pane([[s * 0.858, 3.15, 0.55], [s * 0.858, 3.5, 0.55], [s * 0.858, 3.5, -0.95], [s * 0.858, 3.15, -0.95]]);
    }
    pane([[-0.7, 3.15, 0.758], [-0.7, 3.5, 0.758], [0.7, 3.5, 0.758], [0.7, 3.15, 0.758]]);
    for (const s of [-1, 1]) for (const z of [0.9, -1.3]) F.rod(s * 1.1, 3.05, z, s * 1.1, 3.62, z, 0.03, frame, 'metal');
    const canopy = c(head ? 'lacquer' : 'canopyOrange');
    F.pyrRoof(0, 3.6, -0.2, 2.5, 0.62, 2.6, 0, canopy, 'tarp');
    /* the drape off the canopy's eaves, hanging in swags */
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
      const za = 1.1 - i * 0.433, zb = za - 0.433;
      F.tri([s * 1.25, 3.6, za], [s * 1.25, 3.6, zb], [s * 1.27, 3.28 - (i % 2) * 0.1, (za + zb) / 2], c(head ? 'gold' : 'canopyRed'), 'tarp');
    }
    if (head) for (const s of [-1, 1]) {
      /* gilded horns at the canopy's ends: swoop-and-horn, for the noble */
      F.tube([[0, 4.18, -0.2], [0, 4.38, s * 0.22 - 0.2], [0, 4.6, s * 0.3 - 0.2]], 0.035, c('gold'), 'metal');
    }
    /* the mast and its shades */
    F.rod(0, 4.0, -0.2, 0, 4.75, -0.2, 0.035, frame, 'metal');
    F.rod(-0.85, 4.72, -0.2, 0.85, 4.72, -0.2, 0.025, frame, 'metal');
    for (const s of [-1, 1]) {
      F.beam(s * 0.08, 4.7, -0.2, s * 0.9, 4.86, -0.2, 0.025, 0.62, c('tin'), 'metal');
      F.rod(s * 1.15, 3.05, -2.9, s * 1.15, 3.6, -2.9, 0.025, frame, 'metal');
      F.taper(s * 1.15, 3.62, -2.9, s * 0.5, 0.6, -0.3, 0.03, 0.24, 0.12, c('tin'), 'metal', 12);   /* a salvaged dish */
    }
    /* the parasol: a pole, a yellow cone, a fringe */
    const px = 0.0, pz = -2.55;
    F.rod(px, 3.05, pz, px, 4.12, pz, 0.025, frame, 'metal');
    F.cone(px, 3.88, pz, 0.62, 0.28, 0, c(head ? 'gold' : 'pastelYellow'));
    for (let i = 0; i < 12; i++) {
      const a = i * TAU / 12, b = a + TAU / 12;
      F.tri([px + Math.cos(a) * 0.62, 3.88, pz + Math.sin(a) * 0.62], [px + Math.cos(b) * 0.62, 3.88, pz + Math.sin(b) * 0.62],
        [px + Math.cos((a + b) / 2) * 0.6, 3.78, pz + Math.sin((a + b) / 2) * 0.6], c(head ? 'lacquer' : 'saffron'));
    }
    F.lamp(px, 3.62, pz, 0, -0.3, 1, 0.05, 'amber', c('gold'), null);                                   /* a lantern under it */
  }
});
