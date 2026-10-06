/* ======================================================================
   Krator Motor Vehicles: the Iron Republic (kits/motor-vehicles/krator-vehicles-republic.js)

   The Iron Republic (LORE.md 6.3): the highland forge state whose capital Roketstad was once an
   Ancient spaceport. Its Salvagers strip the Ancient ruins; its Rocketeers keep the rockets. Colours:
   deep red, ochre, cream. Sign: a triskelion of three arms, each fist holding a sword at 90 degrees.

   One vehicle: rep_crawler, the Salvagers' crawler. An Ancient planetary rover dug out of the spaceport
   aprons (a cream bowl of a hull on eight wire-mesh wheels, each with its own hub motor) that the Republic
   keeps rolling across the salt flats as a moving salvage camp: a solar lid that opens like a clam to
   charge the Ancient cell, an instrument head with two camera eyes, a lamp spire and a tiered mast, the
   Republic's red band and triskelion painted where the Ancients' marks were scraped off.
   Variants: 0 Survey (cream, the lid open to the sun), 1 Hauler (ochre, the lid shut and loaded with
   crates and drums). Frame: kits/motor-vehicles/vehicles-core.js (+z forward, wheels on y = 0).
   ====================================================================== */

VEHICLE_CULTURE('republic', {
  name: 'Iron Republic', sign: 'triskelion of three sword-arms, red',
  lore: 'highland forge state; capital Roketstad, once an Ancient spaceport; Salvagers strip the ruins',
  /* DETAIL: palette key -> library detail family (vehicles-detail.js; materials.json); null: none (glass, lenses) */
  detail: {
    hullCream: 'paintWorn', hullCreamDark: 'paintWorn', hullOchre: 'paintWorn', hullOchreDark: 'paintWorn', deck: 'paintWorn',
    red: 'paintWorn', redDark: 'paintWorn', drum: 'paintWorn', drumRed: 'paintWorn',
    canvas: 'canvas', crate: 'wood', panel: null, panelGrid: null, glass: null, glowBlue: null, rope: null
  },
  /* PALETTE (sRGB; the runtime converts to linear) */
  palette: {
    hullCream: 0xd8ccae, hullCreamDark: 0xb3a587, hullOchre: 0xc29a58, hullOchreDark: 0x9a7740,
    deck: 0xc4b896, red: 0xa3261c, redDark: 0x7a1a14,
    steel: 0x6a665e, steelDark: 0x3e3b37, iron: 0x2a2826, wire: 0x8a867c, brass: 0xb08a3a, copper: 0xa0623a,
    panel: 0x1a2232, panelGrid: 0x7c7a70, glass: 0x26343e,
    lensWarm: 0xfff1c8, lensRed: 0xa8180e, lensAmber: 0xe09020, glowBlue: 0x8fd8ff,
    canvas: 0x8f7d5a, crate: 0x7a5a3a, drum: 0x5e3a28, drumRed: 0x8a2a1c, rope: 0x9a8458
  }
});

VEHICLE({
  key: 'rep_crawler', name: 'Republic salvage crawler', culture: 'republic',
  tags: { class: 'motor vehicle', type: ['vehicle', 'transport', 'survey'], drive: 'wheeled', seats: 6, fuel: 'battery',
    terrain: ['sand', 'salt flat', 'rock'], setting: 'outdoor', guild: 'Salvagers' },
  variants: 2, variantNames: ['Survey', 'Hauler'],
  /* overall box: 6.0 wide, 11.4 long; the lid's raised edge reaches 8.4, the lamp spire 9.2 */
  w: 6.0, d: 11.4, h: 9.2,
  budget: { tris: 15500 },                          /* eight wire-mesh wheels; one crawler to a world */
  /* data, not code (units: m, m/s, m/s^2, kg, L, km, rad, kWh) */
  data: {
    speed: 4.5, accel: 0.3, turnRadius: 12, maxSteer: 0.3, seats: 6, cargo: 4000, mass: 38000,
    fuel: 'battery', tank: 0, battery: 900, solar: true, range: 400, drive: 'all, a hub motor in every wheel',
    wheelbase: 7.8, track: 5.0, clearance: 1.0, steering: 'front and rear axles, opposite',
    engine: 'Ancient hub motors, eight; a salvaged cell charged by the solar lid',
    wheels: [
      { name: 'wheel_fl', x: 2.5, z: 3.9, r: 1.2, w: 0.66, front: true, steer: true, drive: true },
      { name: 'wheel_fr', x: -2.5, z: 3.9, r: 1.2, w: 0.66, front: true, steer: true, drive: true },
      { name: 'wheel_l2', x: 2.5, z: 1.3, r: 1.2, w: 0.66, front: false, steer: false, drive: true },
      { name: 'wheel_r2', x: -2.5, z: 1.3, r: 1.2, w: 0.66, front: false, steer: false, drive: true },
      { name: 'wheel_l3', x: 2.5, z: -1.3, r: 1.2, w: 0.66, front: false, steer: false, drive: true },
      { name: 'wheel_r3', x: -2.5, z: -1.3, r: 1.2, w: 0.66, front: false, steer: false, drive: true },
      { name: 'wheel_rl', x: 2.5, z: -3.9, r: 1.2, w: 0.66, front: false, steer: true, steerRatio: -1, drive: true },
      { name: 'wheel_rr', x: -2.5, z: -3.9, r: 1.2, w: 0.66, front: false, steer: true, steerRatio: -1, drive: true }
    ]
  },
  variantData: [
    {},
    { cargo: 9000, mass: 41000, speed: 3.5, lid: 'shut, loaded' }
  ],

  /* ONE wire-mesh wheel at the origin, axle along x: two rim hoops, a diagonal wire lattice, cleats across
     the tread (one at the bottom, so the wheel touches y = -r), spokes to a hub motor */
  wheel: function (F, W) {
    const r = W.r, w = W.w, hw = w / 2, s = W.side, c = F.col;
    const N = 18, rm = r - 0.075, wire = c('wire'), steel = c('steel');
    for (const x of [-hw * 0.94, hw * 0.94]) F.ring(x, 0, 0, 1, 0, 0, rm, 0.035, steel, 'metal', N);
    for (let i = 0; i < N; i++) {
      const a0 = Math.PI + i * TAU / N, a1 = a0 + TAU / N;
      /* the lattice: two diagonals per bay */
      F.rod(-hw * 0.94, Math.cos(a0) * rm, Math.sin(a0) * rm, hw * 0.94, Math.cos(a1) * rm, Math.sin(a1) * rm, 0.012, wire, 'metal');
      F.rod(hw * 0.94, Math.cos(a0) * rm, Math.sin(a0) * rm, -hw * 0.94, Math.cos(a1) * rm, Math.sin(a1) * rm, 0.012, wire, 'metal');
      /* a cleat across the tread: radial height 0.075, its outer face at r */
      const m = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.075, 0.07), mat(steel, 'metal'));
      m.position.set(0, Math.cos(a0) * (r - 0.0375), Math.sin(a0) * (r - 0.0375)); m.rotation.x = a0;
      _add(m);
    }
    /* spokes, both faces, from the hub to the hoops */
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + 0.2;
      for (const x of [-1, 1]) F.rod(x * hw * 0.32, Math.cos(a) * 0.26, Math.sin(a) * 0.26, x * hw * 0.92, Math.cos(a) * rm, Math.sin(a) * rm, 0.02, steel, 'metal');
    }
    F.disc(0, 0, 0, 1, 0, 0, 0.3, w * 0.62, c('steelDark'), 'metal', 12);              /* the hub motor */
    F.disc(s * w * 0.33, 0, 0, 1, 0, 0, 0.16, 0.05, c('brass'), 'metal', 8);              /* its cap, outward */
  },

  build: function (F) {
    const v = F.variant, c = F.col, open = v === 0;
    const hull = c(['hullCream', 'hullOchre'][v]), hullDark = c(['hullCreamDark', 'hullOchreDark'][v]);
    const steel = c('steel'), steelDark = c('steelDark'), iron = c('iron'), red = c('red');

    /* ---- the running gear: two frame rails, cross members, a hub-motor drum and a swing arm at every wheel */
    for (const s of [-1, 1]) {
      F.box(s * 1.55, 0.98, 0, 0.32, 0.46, 9.2, 0, steelDark, 'metal');
      F.box(s * 1.62, 2.12, 0, 0.12, 0.12, 9.6, 0, iron, 'metal');                         /* the skirt rail */
      for (const z of [3.9, 1.3, -1.3, -3.9]) {
        F.disc(s * 1.86, 1.2, z, 1, 0, 0, 0.3, 0.5, steelDark, 'metal', 10);                /* drive drum */
        F.rod(s * 1.62, 2.08, z + 0.55, s * 1.95, 1.2, z, 0.07, steel, 'metal');             /* swing arm */
        F.rod(s * 1.62, 2.08, z - 0.55, s * 1.95, 1.2, z, 0.05, steel, 'metal');
        F.rod(s * 1.62, 2.1, z, s * 1.62, 1.44, z, 0.09, c('brass'), 'metal');               /* the spring leg */
      }
    }
    for (const z of [-4.4, -2.6, 0, 2.6, 4.4]) F.box(0, 1.05, z, 3.1, 0.26, 0.26, 0, iron, 'metal');
    /* the equipment bay under the bowl: tanks, boxes, a run of pipe */
    F.box(0, 1.44, 0, 2.9, 0.86, 7.4, 0, steelDark, 'metal');
    for (const s of [-1, 1]) {
      F.rod(s * 1.48, 1.9, -3.4, s * 1.48, 1.9, 3.4, 0.08, c('copper'), 'metal');
      F.rod(s * 1.5, 1.62, -3.0, s * 1.5, 1.62, 2.8, 0.05, iron, 'metal');
      for (const z of [-2.6, 0, 2.6]) F.box(s * 1.42, 1.5, z, 0.2, 0.5, 0.7, 0, steel, 'metal');
    }

    /* ---- the bowl: a superellipse tub flaring from 3.8 x 7.8 at its foot to 5.7 x 9.9 at the rim */
    const sup = function (a, b, n, th) {
      const ct = Math.cos(th), st = Math.sin(th), e = 2 / n;
      return [a * Math.sign(ct) * Math.pow(Math.abs(ct), e), b * Math.sign(st) * Math.pow(Math.abs(st), e)];
    };
    const wallA = function (y) { return 2.3 + (y - 2.5) / 2.1 * 0.55; }, wallB = function (y) { return 4.3 + (y - 2.5) / 2.1 * 0.65; };
    const NB = 3;
    F.tub([{ y: 2.28, a: 1.9, b: 3.9, n: NB }, { y: 2.5, a: 2.3, b: 4.3, n: NB }, { y: 4.6, a: 2.85, b: 4.95, n: NB }], 28, hull, '', 'bottom');
    F.tub([{ y: 4.56, a: 2.9, b: 5.0, n: NB }, { y: 4.8, a: 2.92, b: 5.02, n: NB }, { y: 4.84, a: 2.8, b: 4.9, n: NB }], 28, hullDark, 'metal');   /* the rim lip */
    F.tub([{ y: 4.82, a: 2.82, b: 4.92, n: NB }, { y: 4.98, a: 2.6, b: 4.72, n: NB }, { y: 5.05, a: 2.2, b: 4.3, n: NB }], 24, c('deck'), '', 'top');  /* the deck */
    /* the Republic's red band below the rim */
    F.tub([{ y: 4.18, a: wallA(4.18) + 0.018, b: wallB(4.18) + 0.018, n: NB }, { y: 4.36, a: wallA(4.36) + 0.018, b: wallB(4.36) + 0.018, n: NB }], 28, red, '');
    /* panel seams up the wall */
    for (let i = 0; i < 26; i++) {
      const th = (i + 0.5) * TAU / 26, p0 = sup(wallA(2.6) + 0.02, wallB(2.6) + 0.02, NB, th), p1 = sup(wallA(4.5) + 0.02, wallB(4.5) + 0.02, NB, th);
      F.beam(p0[0], 2.6, p0[1], p1[0], 4.5, p1[1], 0.035, 0.035, hullDark);
    }

    /* ---- the triskelion on both flanks: three bent arms, each fist holding a sword at 90 degrees, on the
       sloping wall (a local frame: u along the wall to the viewer's right, v up the wall, n out of it) */
    const tris = function (s) {
      const y0 = 3.42, z0 = -1.25, x0 = s * (wallA(y0) * Math.pow(1 - Math.pow(Math.abs(z0) / wallB(y0), NB), 1 / NB) + 0.03);
      const k = 0.55 / 2.1, nl = Math.hypot(1, k);
      const n = [s / nl, -k / nl, 0], vv = [s * k / nl, 1 / nl, 0], u = [0, 0, -s];
      const P = function (a, b) { return [x0 + u[0] * a + vv[0] * b + n[0] * 0.02, y0 + u[1] * a + vv[1] * b + n[1] * 0.02, z0 + u[2] * a + vv[2] * b + n[2] * 0.02]; };
      const quad = function (a, b, cc, d) { F.tri(P(a[0], a[1]), P(b[0], b[1]), P(cc[0], cc[1]), red); F.tri(P(a[0], a[1]), P(cc[0], cc[1]), P(d[0], d[1]), red); };
      const bar = function (a, b, wd) {     /* a straight band from a to b, wd wide */
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ox = -dy / l * wd / 2, oy = dx / l * wd / 2;
        quad([a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy], [b[0] - ox, b[1] - oy], [a[0] - ox, a[1] - oy]);
      };
      const R = 0.62;
      for (let i = 0; i < 3; i++) {
        const t = i * TAU / 3 + 0.3, ct = Math.cos(t), st = Math.sin(t), cq = Math.cos(t + Math.PI / 2), sq = Math.sin(t + Math.PI / 2);
        const e = [ct * R * 0.55, st * R * 0.55], f = [e[0] + cq * R * 0.4, e[1] + sq * R * 0.4];
        bar([ct * R * 0.08, st * R * 0.08], e, R * 0.16);                       /* upper arm */
        bar(e, f, R * 0.14);                                                     /* forearm */
        bar([f[0] - cq * 0.04, f[1] - sq * 0.04], [f[0] + cq * 0.08, f[1] + sq * 0.08], R * 0.22);    /* fist */
        bar([f[0] - ct * R * 0.12, f[1] - st * R * 0.12], [f[0] + ct * R * 0.5, f[1] + st * R * 0.5], R * 0.05);   /* the sword, at 90 */
        bar([f[0] - ct * 0.02 + cq * 0.1, f[1] - st * 0.02 + sq * 0.1], [f[0] - ct * 0.02 - cq * 0.1, f[1] - st * 0.02 - sq * 0.1], R * 0.05);   /* its guard */
      }
      F.ring(x0, y0, z0, n[0], n[1], n[2], R * 1.05, 0.025, red, '', 20);
    };
    tris(1); tris(-1);
    /* a red star on the nose, as the Ancients' mark was (the one thing left of it) */
    const star = function (x, y, z, R) {
      for (let i = 0; i < 5; i++) {
        const a = Math.PI / 2 + i * TAU / 5, b = a + TAU / 10, b2 = a - TAU / 10;
        F.tri([x + Math.cos(a) * R, y + Math.sin(a) * R, z], [x + Math.cos(b) * R * 0.4, y + Math.sin(b) * R * 0.4, z], [x, y, z], red);
        F.tri([x + Math.cos(a) * R, y + Math.sin(a) * R, z], [x, y, z], [x + Math.cos(b2) * R * 0.4, y + Math.sin(b2) * R * 0.4, z], red);
      }
    };

    /* ---- the instrument head on the nose: a block with two camera eyes (the headlamps), a tower under it */
    F.box(0, 3.3, 4.95, 1.9, 1.1, 0.9, 0, hull);
    F.box(0, 4.4, 4.95, 2.0, 0.08, 1.0, 0, hullDark, 'metal');
    for (const s of [-1, 1]) {
      F.lamp(s * 0.48, 3.92, 5.42, 0, 0, 1, 0.2, 'head', steelDark, steel);
      F.disc(s * 0.48, 3.92, 5.36, 0, 0, 1, 0.3, 0.1, hullDark, 'metal', 14);
    }
    star(0, 3.55, 5.405, 0.17);
    F.box(0, 2.3, 5.0, 1.0, 1.0, 0.7, 0, hullDark);
    F.disc(0, 2.8, 5.38, 0, 0, 1, 0.26, 0.1, steel, 'metal', 12);
    F.rod(-1.4, 1.5, 5.36, 1.4, 1.5, 5.36, 0.09, iron, 'metal');                                    /* bumper bar */
    for (const s of [-1, 1]) F.rod(s * 0.9, 1.5, 5.36, s * 1.0, 1.2, 4.55, 0.06, iron, 'metal');
    /* the instrument boom out to the front left, with its sensor heads and a slack cable */
    F.rod(0.9, 3.7, 5.2, 2.85, 3.5, 5.62, 0.045, steel, 'metal');
    F.box(2.55, 3.38, 5.48, 0.22, 0.22, 0.3, 0, hullDark, 'metal');
    F.rod(2.2, 3.55, 5.5, 2.25, 2.95, 5.6, 0.02, iron, 'metal');
    F.knob(2.25, 2.92, 5.6, 0.06, c('brass'), 'metal');
    F.tube([[0.95, 3.4, 5.4], [1.6, 3.1, 5.55], [2.4, 3.3, 5.6]], 0.015, iron, 'metal');

    /* ---- the lamp spire on the front left: stacked drums and tapers, rings, a blue lamp at the tip */
    const sx = 0.62, sz = 4.85;
    F.cyl(sx, 4.48, sz, 0.26, 0.5, 0, hullDark);
    F.box(sx, 4.98, sz, 0.5, 0.42, 0.5, 0, hull);
    F.box(sx, 5.1, sz + 0.25, 0.3, 0.12, 0.02, 0, c('glass'), 'metal');                                 /* its little window */
    F.taper(sx, 5.4, sz, 0, 1, 0, 0.2, 0.13, 1.2, steel, 'metal', 10);
    for (const y of [5.6, 6.0, 6.4]) F.ring(sx, y, sz, 0, 1, 0, 0.19 - (y - 5.4) * 0.06, 0.03, c('brass'), 'metal', 10);
    F.box(sx, 6.6, sz, 0.34, 0.36, 0.34, 0, hullDark, 'metal');
    F.taper(sx, 6.96, sz, 0, 1, 0, 0.11, 0.035, 1.9, steel, 'metal', 8);
    for (const y of [7.3, 7.7, 8.1, 8.5]) F.disc(sx, y, sz, 0, 1, 0, 0.12 - (y - 7.0) * 0.04, 0.04, c('brass'), 'metal', 8);
    F.knob(sx, 8.98, sz, 0.09, c('glowBlue'), 'lampBlue');
    F.lamp(sx, 8.98, sz + 0.09, 0, 0, 1, 0.05, 'cell', null, null);
    for (const s of [-1, 1]) F.rod(sx, 7.6, sz, sx + s * 0.45, 7.75, sz, 0.012, iron, 'metal');           /* whiskers */

    /* ---- the dome and its tiered mast on the forward deck */
    const dz = 3.3;
    F.dome(-0.4, 5.02, dz, 0.85, 0.5, 0, hullDark);
    F.cyl(-0.4, 5.45, dz, 0.34, 0.4, 0, hull);
    for (let i = 0; i < 5; i++) F.frustum(-0.4, 5.85 + i * 0.32, dz, 0.3 - i * 0.045, 0.22 - i * 0.04, 0.3, 0, i % 2 ? hullDark : hull, '', 10);
    F.taper(-0.4, 7.45, dz, 0, 1, 0, 0.06, 0.012, 0.8, c('brass'), 'metal', 6);
    F.lamp(-0.4, 6.0, dz + 0.31, 0, 0, 1, 0.07, 'amber', steelDark, null);

    /* ---- side ports, rear aerials, a ladder, tail lamps */
    for (const s of [-1, 1]) {
      const y = 3.9, z = 3.0, x = s * (wallA(y) * Math.pow(1 - Math.pow(z / wallB(y), NB), 1 / NB));
      F.disc(x + s * 0.06, y, z, s, -0.26, 0, 0.24, 0.24, hullDark, 'metal', 12);
      F.face(x + s * 0.185, y - 0.033, z, s, -0.26, 0, 0.15, c('glass'), 'metal', 10);
      F.rod(s * 2.0, 4.2, -4.3, s * 2.95, 3.4, -5.0, 0.03, steel, 'metal');                         /* rear aerials */
      F.rod(s * 2.0, 4.5, 4.0, s * 2.9, 4.95, 4.8, 0.02, iron, 'metal');
      F.lamp(s * 1.1, 1.95, -3.72, 0, 0, -1, 0.09, 'tail', null, steelDark);
    }
    /* the crew ladder up the left flank to the rim */
    for (const z of [-0.15, 0.35]) F.rod(2.32, 2.3, z, 2.98, 4.8, z, 0.025, iron, 'metal');
    for (let i = 1; i < 8; i++) { const t = i / 8; F.rod(2.32 + t * 0.66, 2.3 + t * 2.5, -0.15, 2.32 + t * 0.66, 2.3 + t * 2.5, 0.35, 0.018, iron, 'metal'); }
    /* railing posts round the rim */
    for (let i = 0; i < 20; i++) {
      const th = i * TAU / 20, p = sup(2.78, 4.88, NB, th);
      if (Math.abs(p[1]) > 4.4 && p[1] > 0) continue;                                         /* clear of the spire and the head */
      F.rod(p[0], 4.84, p[1], p[0], 5.4, p[1], 0.02, iron, 'metal');
    }
    for (let i = 0; i < 40; i++) {
      const p = sup(2.78, 4.88, NB, i * TAU / 40), q = sup(2.78, 4.88, NB, (i + 1) * TAU / 40);
      if (p[1] > 4.0 || q[1] > 4.0) continue;
      F.rod(p[0], 5.4, p[1], q[0], 5.4, q[1], 0.018, iron, 'metal');
    }

    /* ---- the solar lid: an elliptical clam, cream rim, dark cells with a grid; the Survey has it open
       25 degrees to the sun on two struts and a rear hinge, the Hauler shut on the deck under its load */
    const ang = open ? 25 * Math.PI / 180 : 0, A = 2.7, B = 3.6;
    const vd = [0, Math.sin(ang), -Math.cos(ang)], nn = [0, Math.cos(ang), Math.sin(ang)];
    const ctr = open ? [0, 5.3 + B * vd[1], 0.9 + B * vd[2]] : [0, 5.18, -1.3];
    const L = function (u, s, h) { return [ctr[0] + u, ctr[1] + vd[1] * s + nn[1] * h, ctr[2] + vd[2] * s + nn[2] * h]; };
    const ell = function (rA, rB, t, h, col, fam) {
      const p = L(0, 0, h), m = F.disc(p[0], p[1], p[2], nn[0], nn[1], nn[2], 1, t, col, fam, 32);
      m.scale.set(rA, 1, rB);
    };
    ell(A, B, 0.14, 0, hull, '');
    ell(A - 0.14, B - 0.14, 0.04, 0.075, c('panel'), 'metal');
    ell(A * 0.9, B * 0.9, 0.06, -0.09, hullDark, 'metal');                                       /* the underside's stiffener */
    for (let k = -3; k <= 3; k++) {
      const u = k * 0.66, hs = (B - 0.16) * Math.sqrt(Math.max(0, 1 - Math.pow(u / (A - 0.16), 2)));
      const a = L(u, -hs, 0.1), b = L(u, hs, 0.1);
      F.rod(a[0], a[1], a[2], b[0], b[1], b[2], 0.014, c('panelGrid'), 'metal');
    }
    for (let k = -4; k <= 4; k++) {
      const s = k * 0.8, hu = (A - 0.16) * Math.sqrt(Math.max(0, 1 - Math.pow(s / (B - 0.16), 2)));
      const a = L(-hu, s, 0.1), b = L(hu, s, 0.1);
      F.rod(a[0], a[1], a[2], b[0], b[1], b[2], 0.014, c('panelGrid'), 'metal');
    }
    if (open) {
      /* an A-frame from the rear rim, a saddle under the front edge, and two rams from the deck */
      for (const s of [-1, 1]) {
        const p = L(s * 0.35, 2.8, -0.1);
        F.rod(s * 1.5, 4.84, -4.6, p[0], p[1], p[2], 0.08, steelDark, 'metal');
      }
      const q = L(0, 2.8, -0.1);
      F.rod(-0.5, q[1], q[2], 0.5, q[1], q[2], 0.09, steelDark, 'metal');
      F.box(0, 5.02, 0.95, 1.2, 0.2, 0.3, 0, steelDark, 'metal');
      for (const s of [-1, 1]) {
        const p = L(s * 1.2, 0.8, -0.1);
        F.rod(s * 1.0, 5.0, -2.2, p[0], p[1], p[2], 0.07, steel, 'metal');
        F.rod(s * 1.0, 5.0, -2.2, s * 1.0, 5.4, -2.25, 0.11, c('brass'), 'metal');               /* the ram's cylinder */
      }
    } else {
      /* the load on the shut lid: crates, drums, a lashed canvas, the ropes over them */
      const top = 5.31;
      for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
        const z = -3.5 + i * 1.0, x = s * 0.9;
        if (F.chance(0.8)) F.box(x, top, z, 0.9, 0.62, 0.8, F.rr(-0.1, 0.1), c('crate'));
        else F.cyl(x, top, z, 0.32, 0.86, 0, c(F.pick(['drum', 'drumRed'])), 'metal');
      }
      for (const z of [-0.3, 0.4]) for (const x of [-0.4, 0.4]) F.cyl(x, top, z, 0.3, 0.86, 0, c(F.pick(['drum', 'drumRed'])), 'metal');
      F.blob(0, top + 0.3, 1.25, 0.9, 0.8, 0, c('canvas'));
      for (const z of [-3.5, -2.5, -1.5, -0.6]) F.tube([[-1.6, top, z], [-1.3, top + 0.7, z], [1.3, top + 0.7, z], [1.6, top, z]], 0.015, c('rope'));
    }
  }
});
