/* ======================================================================
   Krator Motor Vehicles: the Post-Apoc settlers (kits/motor-vehicles/krator-vehicles-post-apoc.js)

   The Post-Apoc settlers (LORE.md 6.17): a culture-neutral salvage society that fleshes out reclaimed
   arcologies and wreck towns. Sign: the gear. Colours: faded rust red, teal, mustard, olive.

   One vehicle: pa_crawler_hab, a moving house on four track bogies: an armoured cab with a wedge nose
   and a railed roof deck lined with jerry cans, a rust-plated hab behind it, two shipping containers
   stacked on top (one cantilevered on struts), a glass dome, a dish and a forest of TV aerials, a big
   exhaust run along its flank, a balcony and a ladder at the back. It goes where a wheel cannot (mud,
   rock, snow) at a walking pace, and turns on the spot (skid steer: no wheel steers, maxSteer 0).
   Variants: 0 Hab (rust and olive), 1 Trader (faded teal panels, mustard trim, a striped awning over the
   balcony, crates on the deck). Frame: vehicles-core.js (+z forward). The road wheels are the moving
   wheels (lift: they ride the belt, 8 cm above the ground); the belts, sprockets and idlers are static.
   ====================================================================== */

VEHICLE_CULTURE('post-apoc', {
  name: 'Post-Apoc settlers', sign: 'gear',
  lore: 'culture-neutral salvage society of the reclaimed arcologies and wreck towns',
  /* DETAIL: palette key -> library detail family (vehicles-detail.js; materials.json); null: none (glass, lenses) */
  detail: {
    rust: 'rust', rustDark: 'rust', rustLight: 'rust', rustBrown: 'rust', trackIron: 'rust',
    olive: 'paintWorn', oliveDark: 'paintWorn', khaki: 'paintWorn', fadedTeal: 'paintWorn', fadedTealDark: 'paintWorn',
    mustard: 'paintWorn', fadedRed: 'paintWorn', cream: 'paintWorn', jerryRed: 'paintWorn', jerryYellow: 'paintWorn',
    canvas: 'canvas', crate: 'wood', rubber: 'rubber', glass: null, domeGlass: null
  },
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    rust: 0x8a4a2a, rustDark: 0x5e3220, rustLight: 0xa8643a, rustBrown: 0x6e4630,
    olive: 0x5c5a3a, oliveDark: 0x3e3d28, khaki: 0x7a6e4a, fadedTeal: 0x4e8078, fadedTealDark: 0x3a5e58,
    mustard: 0xc0982e, fadedRed: 0x9a3a2c, steel: 0x5a5650, steelDark: 0x34322e, trackIron: 0x2c2a27,
    rubber: 0x232120, glass: 0x34404a, domeGlass: 0x6a8a94, jerryRed: 0xa8301e, jerryYellow: 0xc8a82a,
    canvas: 0x9a8a62, crate: 0x7a5a3a, cream: 0xd6c8a4,
    lensWarm: 0xfff1c8, lensRed: 0xa8180e, lensAmber: 0xe09020
  }
});

/* the four bogies: centre z, and which side; three road wheels each (offsets -0.8, 0, +0.8), lift = belt */
const PA_BOGIES = [{ k: 'lf', x: 1.7, z: 3.2, front: true }, { k: 'rf', x: -1.7, z: 3.2, front: true },
  { k: 'lr', x: 1.7, z: -3.1, front: false }, { k: 'rr', x: -1.7, z: -3.1, front: false }];
const PA_BELT = 0.08;

VEHICLE({
  key: 'pa_crawler_hab', name: 'Post-Apoc crawler hab', culture: 'post-apoc',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport', 'cargo'], drive: 'tracked', seats: 4, fuel: 'crude oil',
    terrain: ['sand', 'salt flat', 'mud', 'rock', 'snow'], setting: 'outdoor' },
  variants: 2, variantNames: ['Hab', 'Trader'],
  /* overall box: 4.6 wide, 11.6 long; the roofs are 5.9, the tallest aerial 8.45 */
  w: 4.6, d: 11.6, h: 8.5,
  budget: { tris: 15500 },
  /* data, not code (units: m, m/s, m/s^2, kg, L, km, rad) */
  data: {
    speed: 6, accel: 0.4, turnRadius: 0, maxSteer: 0, steering: 'skid (tracks), turns on the spot', seats: 4, berths: 8,
    cargo: 6000, mass: 34000, fuel: 'crude oil', tank: 1800, range: 900, drive: 'tracked, four bogies',
    wheelbase: 6.3, track: 3.4, clearance: 0.55, belt: PA_BELT, engine: 'twin salvaged diesels under the hab floor',
    wheels: [].concat.apply([], PA_BOGIES.map(function (B) {
      return [-0.8, 0, 0.8].map(function (o, i) {
        return { name: 'wheel_' + B.k + (i + 1), x: B.x, z: B.z + o, r: 0.36, w: 0.62, lift: PA_BELT, front: B.front, steer: false, drive: true };
      });
    }))
  },
  variantData: [
    {},
    { cargo: 9000, berths: 4, mass: 35500, trade: 'scrap, fuel, water' }
  ],

  /* ONE road wheel at the origin, axle along x: a pair of rubber-tyred steel discs (the track's guide teeth
     run between them), a hub cap and lightening holes outward */
  wheel: function (F, W) {
    const r = W.r, w = W.w, c = F.col, s = W.side;
    for (const x of [-w * 0.27, w * 0.27]) {
      F.disc(x, 0, 0, 1, 0, 0, r, w * 0.36, c('rubber'), '', 16);
      F.disc(x, 0, 0, 1, 0, 0, r * 0.8, w * 0.4, c('steel'), 'metal', 12);
    }
    F.disc(s * w * 0.45, 0, 0, 1, 0, 0, 0.11, 0.07, c('steelDark'), 'metal', 8);
    for (let i = 0; i < 5; i++) {
      const a = i * TAU / 5;
      F.disc(s * (w * 0.47 + 0.002), Math.cos(a) * 0.19, Math.sin(a) * 0.19, 1, 0, 0, 0.045, 0.01, c('steelDark'), 'metal', 6);
    }
  },

  build: function (F) {
    const v = F.variant, c = F.col, trader = v === 1;
    const paint = c(['rust', 'fadedTeal'][v]), paintDark = c(['rustDark', 'fadedTealDark'][v]);
    const trim = c(['olive', 'mustard'][v]);
    const steel = c('steel'), steelDark = c('steelDark'), iron = c('trackIron');

    /* ---- the running gear: per bogie a belt round three road wheels, a raised sprocket and idler, a beam, a fender */
    for (const B of PA_BOGIES) {
      const circ = [[B.z - 0.8, PA_BELT + 0.36, 0.36], [B.z, PA_BELT + 0.36, 0.36], [B.z + 0.8, PA_BELT + 0.36, 0.36],
        [B.z + 1.45, 0.7, 0.34], [B.z - 1.45, 0.7, 0.34]];
      F.track(B.x, 0.8, PA_BELT, circ, 0.2, iron, 'metal');
      for (const e of [1.45, -1.45]) {
        F.disc(B.x, 0.7, B.z + e, 1, 0, 0, 0.3, 0.5, steel, 'metal', 12);
        F.ring(B.x, 0.7, B.z + e, 1, 0, 0, 0.3, 0.04, steelDark, 'metal', 14);
        F.disc(B.x + Math.sign(B.x) * 0.26, 0.7, B.z + e, 1, 0, 0, 0.1, 0.04, steelDark, 'metal', 8);
      }
      const ix = B.x - Math.sign(B.x) * 0.48;
      F.box(ix, 0.5, B.z, 0.12, 0.3, 3.1, 0, steelDark, 'metal');                                       /* the bogie beam */
      F.box(ix, 0.8, B.z, 0.16, 0.4, 0.4, 0, steelDark, 'metal');                                       /* its pivot */
      F.box(B.x, 1.18, B.z, 0.98, 0.05, 3.3, 0, trim, 'metal');                                          /* fender */
      for (const e of [1, -1]) F.beam(B.x, 1.2, B.z + e * 1.64, B.x, 0.98, B.z + e * 1.98, 0.98, 0.05, trim, 'metal');
    }
    /* the deck and the belly between the bogies: tanks, a sump */
    F.box(0, 1.14, -0.15, 3.9, 0.42, 10.7, 0, c('oliveDark'), 'metal');
    F.box(0, 0.55, 0.05, 2.4, 0.6, 2.3, 0, steelDark, 'metal');
    F.rod(-1.1, 0.78, 0.05, 1.1, 0.78, 0.05, 0.3, c('olive'), 'metal');

    /* ---- the cab: a box with a sloped windscreen, and an armoured wedge nose below it */
    F.slab([[2.6, 1.55, 1.6], [5.15, 1.55, 1.6], [5.15, 2.35, 1.6], [4.6, 3.35, 1.6], [2.6, 3.35, 1.6]], c(['khaki', 'fadedTeal'][v]), '');
    F.slab([[5.05, 0.95, 1.45], [5.5, 0.95, 1.45], [5.8, 1.45, 1.4], [5.72, 2.05, 1.35], [5.05, 2.45, 1.45]], c(['olive', 'khaki'][v]), 'metal');
    const pane = function (P) { F.tri(P[0], P[1], P[2], c('glass'), 'metal'); F.tri(P[0], P[2], P[3], c('glass'), 'metal'); };
    const wz = function (y) { return 5.15 - (y - 2.35) * 0.55 + 0.012; };
    for (const xr of [[-1.45, -0.55], [-0.45, 0.45], [0.55, 1.45]]) {
      pane([[xr[0], 2.5, wz(2.5)], [xr[0] + 0.05, 3.22, wz(3.22)], [xr[1] - 0.05, 3.22, wz(3.22)], [xr[1], 2.5, wz(2.5)]]);
    }
    for (const s of [-1, 1]) {
      const x = s * 1.612;
      pane([[x, 2.45, 3.3], [x, 3.18, 3.3], [x, 3.18, 4.42], [x, 2.45, 4.82]]);
      F.box(x, 1.7, 3.0, 0.03, 0.6, 1.0, 0, steelDark, 'metal');                                      /* a grille plate */
      for (let i = 0; i < 6; i++) F.box(s * 1.63, 1.75 + i * 0.09, 3.0, 0.02, 0.025, 0.96, 0, iron, 'metal');
      F.lamp(s * 1.05, 1.62, 5.785, 0, 0, 1, 0.1, 'head', steelDark, steel);
    }
    F.box(0, 1.8, 5.77, 0.7, 0.24, 0.03, 0, c('fadedRed'));                                            /* a red placard */
    F.box(0, 1.84, 5.785, 0.5, 0.16, 0.02, 0, c('cream'));
    F.box(0, 0.85, 5.72, 3.7, 0.22, 0.14, 0, steelDark, 'metal');                                        /* the bumper */
    for (const s of [-1, 1]) F.rod(s * 1.88, 0.96, 5.72, s * 1.88, 0.96, 5.2, 0.05, steelDark, 'metal');
    /* the roof deck over the cab: a railing and a row of red jerry cans */
    const rail = function (pts, h) {
      for (const p of pts) F.rod(p[0], p[1], p[2], p[0], p[1] + h, p[2], 0.022, steel, 'metal');
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        F.rod(a[0], a[1] + h, a[2], b[0], b[1] + h, b[2], 0.025, steel, 'metal');
        F.rod(a[0], a[1] + h * 0.5, a[2], b[0], b[1] + h * 0.5, b[2], 0.018, steel, 'metal');
      }
    };
    rail([[-1.55, 3.35, 2.62], [-1.55, 3.35, 4.55], [1.55, 3.35, 4.55], [1.55, 3.35, 2.62]], 0.85);
    const can = function (x, y, z, col, ry) { F.box(x, y, z, 0.17, 0.46, 0.34, ry || 0, col); F.box(x, y + 0.46, z + 0.06, 0.06, 0.04, 0.16, ry || 0, col); };
    for (let i = 0; i < 7; i++) can(-1.2 + i * 0.4, 3.36, 4.28, c(F.chance(0.85) ? 'jerryRed' : 'jerryYellow'), Math.PI / 2);
    for (const x of [-0.6, 0, 0.6]) F.lamp(x, 4.25, 4.58, 0, 0, 1, 0.06, 'bar', steelDark, null);

    /* ---- the hab: a rust-plated box behind the cab; plates of other rust, corrugation, grille windows */
    F.box(0, 1.55, -1.4, 3.7, 2.15, 8.0, 0, paint);
    F.box(0, 3.68, -1.4, 3.76, 0.06, 8.06, 0, trim, 'metal');
    const plates = ['rust', 'rustDark', 'rustLight', 'rustBrown'];
    for (const s of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const z = -5.0 + i * 1.6 + F.rr(-0.1, 0.1), y = F.rr(1.8, 2.8);
        F.box(s * 1.86, y, z, 0.02, F.rr(0.4, 0.8), F.rr(0.7, 1.3), 0, trader ? c(F.pick(['fadedTeal', 'fadedTealDark', 'rustLight'])) : c(F.pick(plates)));
      }
      for (let z = -5.25; z < 2.5; z += 0.32) F.box(s * 1.865, 1.6, z, 0.025, 2.05, 0.05, 0, paintDark);
      for (const z of [-3.6, -1.3, 1.1]) {
        F.box(s * 1.88, 2.45, z, 0.04, 0.62, 0.9, 0, c('glass'), 'metal');
        for (let i = 0; i < 4; i++) F.box(s * 1.9, 2.45, z - 0.33 + i * 0.22, 0.03, 0.62, 0.035, 0, iron, 'metal');
        F.box(s * 1.89, 3.08, z, 0.05, 0.05, 1.0, 0, trim, 'metal');
      }
    }
    /* the gear on both flanks */
    for (const s of [-1, 1]) {
      const gx = s * 1.9, gy = 3.08, gz = 0.05, mustard = c('mustard');
      F.disc(gx, gy, gz, 1, 0, 0, 0.26, 0.03, mustard, '', 14);
      F.disc(gx + s * 0.012, gy, gz, 1, 0, 0, 0.09, 0.03, paintDark, '', 10);
      for (let i = 0; i < 10; i++) {
        const a = i * TAU / 10, m = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.09), mat(mustard, ''));
        m.position.set(gx, gy + Math.cos(a) * 0.29, gz + Math.sin(a) * 0.29); m.rotation.x = a; _add(m);
      }
    }
    /* the rear: a door, the balcony on the right with its rail, the ladder down past the track, tail lamps */
    F.box(-0.6, 1.62, -5.42, 1.0, 1.95, 0.04, 0, paintDark);
    F.box(0.95, 2.2, -4.35, 0.8, 0.06, 2.0, 0, steelDark, 'metal');
    F.box(1.85 + 0.2, 2.2, -4.35, 0.4, 0.06, 2.0, 0, steelDark, 'metal');
    rail([[1.86, 2.26, -3.35], [2.25, 2.26, -3.35], [2.25, 2.26, -5.36], [1.4, 2.26, -5.36]], 0.85);
    for (const x of [1.45, 1.95]) F.rod(x, 2.2, -5.4, x, 0.03, -5.74, 0.03, steel, 'metal');
    for (let i = 1; i < 8; i++) { const t = i / 8; F.rod(1.45, 2.2 - t * 2.17, -5.4 - t * 0.34, 1.95, 2.2 - t * 2.17, -5.4 - t * 0.34, 0.018, steel, 'metal'); }
    for (const s of [-1, 1]) F.lamp(s * 1.2, 1.5, -5.42, 0, 0, -1, 0.07, 'tail', null, steelDark);
    for (let i = 0; i < 3; i++) can(2.0, 2.26, -4.9 + i * 0.4, c(F.pick(['jerryYellow', 'jerryRed', 'jerryYellow'])), 0);
    /* the exhaust: a big pipe with a U-bend along the left flank, collars, a stack */
    const ex = [[-1.86, 1.62, 2.3], [-2.08, 1.95, 2.0], [-2.08, 1.95, 0.4], [-2.08, 2.55, 0.1], [-2.08, 2.55, -1.6], [-2.08, 1.95, -1.9], [-2.08, 1.95, -3.2], [-2.0, 3.0, -3.5], [-2.0, 4.6, -3.5]];
    F.tube(ex, 0.1, steelDark, 'metal');
    for (let i = 1; i < ex.length - 1; i++) F.ring(ex[i][0], ex[i][1], ex[i][2], ex[i + 1][0] - ex[i - 1][0], ex[i + 1][1] - ex[i - 1][1], ex[i + 1][2] - ex[i - 1][2], 0.11, 0.025, c('rustLight'), 'metal', 10);
    F.taper(-2.0, 4.6, -3.5, 0, 1, 0, 0.1, 0.14, 0.18, c('rustDark'), 'metal', 10);
    for (const z of [0.9, -2.5]) F.box(-1.95, 1.9, z, 0.2, 0.08, 0.08, 0, steel, 'metal');            /* pipe brackets */

    /* ---- the upper level: container A (forward, under the dome), container B (aft, cantilevered right on struts) */
    const container = function (x0, x1, z0, z1, y0, h, col, dark) {
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
      F.box(cx, y0, cz, w, h, d, 0, col, 'corrugated');
      for (let z = z0 + 0.2; z < z1 - 0.1; z += 0.28) for (const x of [x0 - 0.012, x1 + 0.012]) F.box(x, y0 + 0.08, z, 0.025, h - 0.16, 0.06, 0, dark, 'corrugated');
      for (const x of [x0, x1]) for (const z of [z0, z1]) F.box(x, y0, z, 0.1, h, 0.1, 0, dark, 'metal');   /* corner posts */
    };
    const colA = c(trader ? 'fadedTeal' : 'rustBrown'), colB = c(trader ? 'mustard' : 'rust');
    container(-1.5, 1.3, -1.2, 2.4, 3.71, 2.2, colA, c(trader ? 'fadedTealDark' : 'rustDark'));
    container(-1.3, 2.25, -5.0, -1.45, 3.71, 2.0, colB, c(trader ? 'khaki' : 'rustDark'));
    for (const z of [-4.6, -1.9]) F.rod(1.86, 2.4, z, 2.2, 3.7, z, 0.05, steelDark, 'metal');           /* the cantilever struts */
    /* their windows */
    for (const z of [0.0, 1.5]) { F.box(1.315, 4.5, z, 0.04, 0.55, 0.8, 0, c('glass'), 'metal'); F.box(1.33, 5.07, z, 0.05, 0.05, 0.9, 0, trim, 'metal'); }
    F.box(-1.515, 4.5, 0.6, 0.04, 0.55, 1.2, 0, c('glass'), 'metal');
    for (const z of [-4.1, -2.5]) {
      F.box(2.265, 4.3, z, 0.04, 0.6, 0.7, 0, c('glass'), 'metal');
      for (let i = 0; i < 3; i++) F.box(2.285, 4.3, z - 0.24 + i * 0.24, 0.03, 0.6, 0.035, 0, iron, 'metal');
    }
    F.box(-0.1, 4.4, 2.415, 0.9, 0.7, 0.03, 0, c('glass'), 'metal');
    /* the dome on container A: glass, a base ring, ribs */
    const dx = -0.15, dzz = 1.3, dy = 5.91;
    F.cyl(dx, dy, dzz, 0.92, 0.12, 0, steelDark, 'metal');
    F.dome(dx, dy + 0.12, dzz, 0.86, 0.72, 0, c('domeGlass'), 'metal');
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8, pts = [];
      for (let k = 0; k <= 4; k++) { const t = k / 4 * Math.PI / 2; pts.push([dx + Math.cos(a) * Math.cos(t) * 0.875, dy + 0.12 + Math.sin(t) * 0.735, dzz + Math.sin(a) * Math.cos(t) * 0.875]); }
      F.tube(pts, 0.018, steelDark, 'metal');
    }
    F.knob(dx, dy + 0.87, dzz, 0.07, steelDark, 'metal');
    /* rails round container B's roof, a beacon */
    rail([[-1.25, 5.71, -1.5], [-1.25, 5.71, -4.95], [2.2, 5.71, -4.95], [2.2, 5.71, -1.5]], 0.7);
    F.lamp(1.8, 5.95, -1.7, 0, 0.3, 1, 0.07, 'amber', steelDark, null);
    F.cyl(1.8, 5.71, -1.8, 0.08, 0.2, 0, steelDark, 'metal');

    /* ---- the dish on container A's aft roof, and the TV aerials */
    F.rod(0.7, 5.91, -0.6, 0.7, 6.75, -0.6, 0.05, steel, 'metal');
    F.box(0.7, 6.7, -0.6, 0.18, 0.14, 0.18, 0, steelDark, 'metal');
    F.taper(0.7, 6.82, -0.56, 0.25, 0.55, 0.8, 0.05, 0.66, 0.26, c('cream'), 'metal', 14);
    F.rod(0.7, 6.82, -0.56, 0.86, 7.15, -0.07, 0.015, steelDark, 'metal');                               /* the feed */
    const aerial = function (x, y0, z, top, ry) {
      F.rod(x, y0, z, x, top, z, 0.025, steel, 'metal');
      for (let i = 0; i < 4; i++) {
        const y = top - 0.12 - i * 0.32, L = 0.55 - i * 0.07, a = ry + (i % 2) * Math.PI / 2;
        F.rod(x - Math.cos(a) * L, y, z - Math.sin(a) * L, x + Math.cos(a) * L, y, z + Math.sin(a) * L, 0.012, steel, 'metal');
      }
      F.rod(x, top - 0.2, z, x - 0.45, top - 0.75, z + 0.1, 0.01, steel, 'metal');                     /* a stay wire */
    };
    aerial(-1.2, 5.91, 0.0, 8.42, 0.3);
    aerial(1.9, 5.71, -3.4, 7.9, 0.8);
    aerial(-0.9, 5.71, -4.6, 7.3, 0.1);

    /* ---- the Trader's awning over the balcony and its crates on the deck; the Hab's spare drums */
    if (trader) {
      for (let i = 0; i < 6; i++) {
        const z0 = -3.3 - i * 0.345, z1 = z0 - 0.345, col = c(i % 2 ? 'mustard' : 'fadedRed');
        F.tri([1.86, 3.5, z0], [2.28, 3.15, z0], [2.28, 3.15, z1], col); F.tri([1.86, 3.5, z0], [2.28, 3.15, z1], [1.86, 3.5, z1], col);
      }
      for (let i = 0; i < 3; i++) F.box(-0.9 + i * 0.9, 3.36, 3.25, 0.6, 0.5, 0.6, F.rr(-0.2, 0.2), c('crate'));
      F.blob(0.5, 5.95, -3.3, 0.55, 0.5, 0, c('canvas'));
    } else {
      for (const z of [-2.4, -3.1]) F.cyl(-0.5, 5.71, z, 0.28, 0.85, 0, c(F.pick(['fadedRed', 'olive', 'rustDark'])), 'metal');
    }
  }
});
