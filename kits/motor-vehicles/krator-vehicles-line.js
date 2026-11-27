/* ======================================================================
   Krator Motor Vehicles: the Ancient Line train (kits/motor-vehicles/krator-vehicles-line.js)

   The Rift line's train (biomes/line/PLAN.md section 7, the owner's answers of 2026-11-11): sealed and cooled for
   the hot section, two power cars and six to ten cars between, riding the Line's guideway. Culture `ancient`: the
   cars are the Ancients', in the tram's language (krator-vehicles-ancient.js: white seamed panel on a superellipse
   tub, bronze hoops every 3.6 m, a window ribbon with bronze mullions, cyan strips), stretched for the Line.
   THIS FILE NEEDS krator-vehicles-ancient.js IN THE SAME BUNDLE (it reuses that file's helpers and culture), so a
   host bundles ['ancient', 'line']. A host that bundles only 'ancient' (the Ancient's Valley) does not get it, and
   its page is unchanged.

     anc_line_power   the power car: a raked cab, the cooling and pressure plant   3.6 x 22 x 4.4 m
     anc_line_saloon  the saloon: 64 seats, 40 standing, two vestibules           3.6 x 24 x 4.4 m
     anc_line_crew    the crew car: berths, the galley, the guard's end            3.6 x 24 x 4.4 m
     anc_line_van     the freight van: six bays, three double doors a side         3.6 x 24 x 4.4 m
     anc_line_tank    the tank car: cooling water piped through the train          3.6 x 22 x 4.4 m

   THE FOUR STATES (biomes/line/PLAN.md section 7, agreed with the vehicles session 2026-11-11): `built` is the kit's
   intact build, `derelict` its `weathered`, `wreck` its `wreck` (and `burnt` for a train caught in a fire). `kept` (a
   thousand years of Tungang upkeep) is NOT a ruin state: it is each car's VARIANT 1, "Kept (Tungang)", drawn by
   lineKept() over the built car: salvaged plate riveted over the white skin in faded railway colours, the window
   ribbon plated to slits, cream-over-green livery bands, an enamel number plate; on the power car the lamp code (a
   green running lamp, the red tail, the white lamp under a hood) and a bell. A kept car can still be weathered or
   wrecked (a kept train left in a siding). Made a variant rather than a build option so the runtime is not touched
   (it reaches Locus and Mungo).

   THE FRAME: the kit's (+z forward, y up, the wheels on y = 0: y = 0 is the guideway's running surface). Two bogies a
   car, four wheels a bogie at x +-0.85 (the guideway's two running bands), none steers (maxSteer 0, as anc_tram); a
   guide shoe under each bogie stands over the guideway's slot. The car floor is at 1.2 m (the platform's height).

   RIDING (core/simulation/PLAN-RIDING.md section 3, biomes/line/PLAN.md section 8): each car's `data.ride` gives what
   SIM.rideSource reads, in the car's frame, from the same numbers the build draws: `b` (half the bogie spacing),
   `cap {seats, stand}`, `seats [{id, at, yaw}]`, `stand [[x0, x1, z0, z1, y]]`, `doors [{id, side, at}]`,
   `floor [x0, x1, z0, z1, y]` and, for the van and the tank car, `slots [{id, kind, size, at}]`.
   Nothing here draws from F.rnd, so the intact and the ruined builds of one seed are one car.
   ====================================================================== */

/* the kept cars' colours, added to the Ancients' palette and detail table where this file is bundled */
const LINE_PAL = {
  plateGreen: 0x3f5a43, plateCream: 0xd8cfb0, plateOxide: 0x8a3e2a, plateRust: 0x6e4a32, plateDark: 0x26302a,
  enamel: 0xe6dcc0, enamelRed: 0x8a2e24, rivet: 0x2e2a22, lensGreen: 0x6dff9a, tankBand: 0x5c4426
};
const LINE_DETAIL = { plateGreen: 'paintWorn', plateCream: 'paintWorn', plateOxide: 'paintWorn', plateRust: 'rust',
  plateDark: 'paintWorn', enamel: 'paint', enamelRed: 'paint', rivet: 'metal', lensGreen: null, tankBand: 'bronze' };
if (VEHICLE_CULTURES.ancient) {
  Object.assign(VEHICLE_CULTURES.ancient.palette, LINE_PAL);
  Object.assign(VEHICLE_CULTURES.ancient.detail, LINE_DETAIL);
  FPAL.ancient = Object.assign(FPAL.ancient || {}, LINE_PAL);
} else console.error('krator-vehicles-line.js: bundle krator-vehicles-ancient.js with it');

const LINE_A = 1.75;               /* the body's half-width at the side (plumb from 1.25 to 3.25 m) */
const LINE_FLOOR = 1.2;            /* the car floor: the platform's height */
const LINE_WHEEL_R = 0.45, LINE_WHEEL_X = 0.85, LINE_AXLE = 1.25;

/* the eight wheels of two bogies at z = +-bz, axles +-LINE_AXLE about each */
function lineWheels(bz) {
  const W = [], zs = [bz + LINE_AXLE, bz - LINE_AXLE, -bz + LINE_AXLE, -bz - LINE_AXLE];
  const names = [['wheel_fl', 'wheel_fr'], ['wheel_l2', 'wheel_r2'], ['wheel_l3', 'wheel_r3'], ['wheel_rl', 'wheel_rr']];
  zs.forEach(function (z, i) {
    W.push({ name: names[i][0], x: LINE_WHEEL_X, z: z, r: LINE_WHEEL_R, w: 0.2, front: i < 2, steer: false, drive: true });
    W.push({ name: names[i][1], x: -LINE_WHEEL_X, z: z, r: LINE_WHEEL_R, w: 0.2, front: i < 2, steer: false, drive: true });
  });
  return W;
}
function lineData(o) {
  return Object.assign({
    speed: 45, accel: 0.8, turnRadius: 0, maxSteer: 0, steering: 'guided (the Line\'s guideway); no wheel steers',
    seats: 0, standing: 0, cargo: 0, mass: 52000, fuel: 'battery', tank: 0, battery: 900, range: 0,
    drive: 'all eight, hub motors; the guideway feeds them', engine: 'eight hub motors on the guideway\'s power',
    track: 1.7, clearance: 0.45, sealed: true, keptSpeed: 15
  }, o);
}
/* the side profile every 24 m car shares; the power car and the tank car have their own */
function lineBody(b) {
  return [{ y: 0.95, a: 1.62, b: b - 0.2, n: 4.5 }, { y: 1.25, a: LINE_A, b: b, n: 5 }, { y: 3.25, a: LINE_A, b: b, n: 5 },
    { y: 3.95, a: 1.62, b: b - 0.1, n: 4.5 }, { y: 4.32, a: 1.15, b: b - 0.5, n: 4 }];
}

/* ---- the running gear: a bogie at z (frame, side frames, axles, a guide shoe, a bolster up to the underframe) */
function lineBogie(F, z) {
  const c = F.col;
  F.box(0, 0.5, z, 2.0, 0.28, 3.4, 0, c('interior'), 'metal');
  for (const s of [-1, 1]) {
    F.box(s * 1.08, 0.32, z, 0.12, 0.36, 3.6, 0, c('whiteShade'), 'metal');
    for (const dz of [-LINE_AXLE, LINE_AXLE]) F.knob(s * 1.08, LINE_WHEEL_R, z + dz, 0.09, c('bronzeDark'), 'metal');
  }
  for (const dz of [-LINE_AXLE, LINE_AXLE]) F.rod(-0.73, LINE_WHEEL_R, z + dz, 0.73, LINE_WHEEL_R, z + dz, 0.06, c('interior'), 'metal');
  F.box(0, 0.04, z, 0.22, 0.42, 1.4, 0, c('bronzeDark'), 'metal');          /* the guide shoe over the slot */
  F.box(0, 0.78, z, 1.2, 0.17, 0.6, 0, c('bronzeDark'), 'metal');           /* the bolster */
}
/* the underframe between the bogies: the solebars and the equipment boxes */
function lineUnderframe(F, b, bz) {
  const c = F.col;
  for (const s of [-1, 1]) F.box(s * 1.45, 0.82, 0, 0.12, 0.14, 2 * b - 0.6, 0, c('whiteShade'), 'metal');
  const zi = bz - 2.1;
  F.box(0, 0.62, 0, 2.4, 0.33, 2 * zi - 1.0, 0, c('interior'), 'metal');
}
/* the bronze hoops where the structure transfers, one every 3.6 m, round the shoulder (the tram's) */
function lineHoops(F, zs) {
  const c = F.col, x = 1.765;
  for (const z of zs) {
    for (const s of [-1, 1]) {
      F.beam(s * x, 0.95, z, s * x, 3.25, z, 0.06, 0.06, c('bronze'), 'metal');
      F.beam(s * x, 3.25, z, s * 1.64, 3.95, z, 0.06, 0.06, c('bronze'), 'metal');
      F.beam(s * 1.64, 3.95, z, s * 1.16, 4.3, z, 0.06, 0.06, c('bronze'), 'metal');
    }
    F.beam(-1.16, 4.3, z, 1.16, 4.3, z, 0.06, 0.05, c('bronze'), 'metal');
  }
}
/* the window ribbon from y0 to y1 between z0 and z1 on both sides: glass (or its shards in a ruin), bronze mullions */
function lineRibbon(F, y0, y1, z0, z1, kept) {
  const c = F.col, x = LINE_A + 0.012;
  if (!kept && (!F.ruin || F.ruin.glass)) for (const s of [-1, 1]) F.box(s * x, y0, (z0 + z1) / 2, 0.012, y1 - y0, z1 - z0, 0, c('blueGlass'), 'metal');
  if (!kept) for (const s of [-1, 1]) ancPaneShards(F, 'x', s * x, z0, z1, y0, y1, Math.round((z1 - z0) / 1.2));
  for (const s of [-1, 1]) for (let z = z0; z <= z1 + 1e-6; z += 1.2) F.rod(s * (x + 0.006), y0, z, s * (x + 0.006), y1, z, 0.015, c('bronzeDark'), 'metal');
}
/* a door leaf on both sides at z (bottom at the floor), with a cyan edge (dead in a ruin) */
function lineDoor(F, z, w, h) {
  const c = F.col;
  for (const s of [-1, 1]) {
    F.box(s * (LINE_A + 0.008), LINE_FLOOR + 0.05, z, 0.016, h, w, 0, c('whiteDark'));
    F.box(s * (LINE_A + 0.012), LINE_FLOOR + 0.05, z - w / 2, 0.02, h, 0.05, 0, c('bronzeDark'), 'metal');
    F.box(s * (LINE_A + 0.012), LINE_FLOOR + 0.05, z + w / 2, 0.02, h, 0.05, 0, c('bronzeDark'), 'metal');
    ancStrip(F, s * (LINE_A + 0.016), LINE_FLOOR + 0.07, z, 0.01, h - 0.05, 0.03);
  }
}
/* the gangway bellows at each end of a car */
function lineGangway(F, zEnd) {
  const c = F.col;
  for (const s of [-1, 1]) F.box(0, LINE_FLOOR, s * zEnd, 1.3, 2.2, 0.16, 0, c('tyre'));
}
/* the car's sill and roof strips (cyan, the lampBlue family: dead in a ruin) */
function lineStrips(F, y, b) {
  for (const s of [-1, 1]) ancStrip(F, s * (LINE_A + 0.012), y, 0, 0.02, 0.03, 2 * b - 1.4);
  for (const s of [-1, 1]) ancStrip(F, s * 1.6, 3.98, 0, 0.03, 0.03, 2 * b - 1.6);
}
/* a lamp lens of any colour on a family that glows with lights() (the code's green): F.lamp's own lens keys are fixed */
function lineLamp(F, x, y, z, dz, r, colKey, fam, kind) {
  F.face(x, y, z + dz * r * 0.04, 0, 0, dz, r, F.col(colKey), fam, 10);
  F.disc(x, y, z - dz * r * 0.02, 0, 0, dz, r * 1.2, r * 0.1, F.col('bronzeDark'), 'metal', 8);
  F.lamps.push({ x: x, y: y, z: z + dz * r * 0.1, dx: 0, dy: 0, dz: dz, kind: kind });
}

/* ---- the kept dress (variant 1): salvaged plate over the white skin, the ribbon plated to slits, the livery bands,
   an enamel number plate. secs: the car's side profile; b: its half-length; ribbon: [y0, y1] or null; num: the
   plate's text is not drawn (a texture would carry it: the plate is enamel, cream with a red border) */
function lineKept(F, b, ribbon, plates) {
  const c = F.col, x = LINE_A + 0.012;
  const cols = ['plateGreen', 'plateOxide', 'plateGreen', 'plateRust', 'plateGreen', 'plateOxide'];
  /* the plates of the lower body, side by side with overlaps, a rivet line along each edge */
  const n = plates || 6, L = (2 * b - 0.8) / n;
  for (const s of [-1, 1]) {
    for (let i = 0; i < n; i++) {
      const z0 = -b + 0.4 + i * L - 0.1, z1 = z0 + L + 0.2, zm = (z0 + z1) / 2, k = cols[(i + (s > 0 ? 0 : 3)) % cols.length];
      F.box(s * (x + 0.01 * (i % 2)), 1.3, zm, 0.016, 0.62, z1 - z0, 0, c(k));
      F.box(s * (x + 0.02), 1.9, zm, 0.012, 0.025, z1 - z0 - 0.1, 0, c('rivet'), 'metal');
      F.box(s * (x + 0.02), 1.32, zm, 0.012, 0.025, z1 - z0 - 0.1, 0, c('rivet'), 'metal');
      F.box(s * (x + 0.02), 1.32, z0 + 0.06, 0.012, 0.6, 0.025, 0, c('rivet'), 'metal');
    }
    /* the livery: cream over green, a cream band under the ribbon and one over it */
    F.box(s * (x + 0.024), 1.93, 0, 0.012, 0.07, 2 * b - 0.8, 0, c('plateCream'));
    if (ribbon) {
      /* the ribbon plated over, slits left in it (glass, so a ruin drops them) */
      F.box(s * (x + 0.016), ribbon[0], 0, 0.014, ribbon[1] - ribbon[0], 2 * b - 0.9, 0, c('plateDark'));
      if (!F.ruin || F.ruin.glass) for (let z = -b + 1.2; z < b - 1.6; z += 2.4) F.box(s * (x + 0.026), (ribbon[0] + ribbon[1]) / 2 + 0.05, z + 0.75, 0.01, 0.16, 1.5, 0, c('blueGlass'), 'metal');
      F.box(s * (x + 0.024), ribbon[1], 0, 0.012, 0.07, 2 * b - 0.8, 0, c('plateCream'));
    }
    /* the enamel number plate, cream in a red border */
    F.box(s * (x + 0.03), 1.42, 0, 0.012, 0.42, 1.1, 0, c('enamelRed'));
    F.box(s * (x + 0.038), 1.46, 0, 0.012, 0.34, 1.0, 0, c('enamel'));
  }
}

/* the riding record of a passenger car: two vestibules at +-zv with a door each side, rows of double seats */
function lineRideSaloon(b, bz, zv, rows, z0) {
  const seats = [];
  for (let i = 0; i < rows; i++) {
    const z = z0 + i * 1.1;
    for (const xs of [-1.19, -0.71, 0.71, 1.19]) seats.push({ id: 's' + (seats.length + 1), at: [xs, LINE_FLOOR + 0.16, z], yaw: 0 });
  }
  return {
    b: bz, floor: [-1.6, 1.6, -b + 0.4, b - 0.4, LINE_FLOOR], cap: { seats: seats.length, stand: 40 }, seats: seats,
    stand: [[-0.36, 0.36, -zv + 0.9, zv - 0.9, LINE_FLOOR], [-1.6, 1.6, zv - 0.7, zv + 0.7, LINE_FLOOR], [-1.6, 1.6, -zv - 0.7, -zv + 0.7, LINE_FLOOR]],
    doors: [{ id: 'd1', side: 1, at: [LINE_A, LINE_FLOOR, zv] }, { id: 'd2', side: -1, at: [-LINE_A, LINE_FLOOR, zv] },
      { id: 'd3', side: 1, at: [LINE_A, LINE_FLOOR, -zv] }, { id: 'd4', side: -1, at: [-LINE_A, LINE_FLOOR, -zv] }]
  };
}

/* the shell every 24 m car shares: the tub, its liner, floor and ceiling, the running gear, hoops, strips, gangways */
function lineShell(F, b, bz, ribbon, kept) {
  const c = F.col, secs = lineBody(b);
  F.tub(secs, ANC_SEG, c('white'), '', 'top');
  F.tub([{ y: 1.25, a: LINE_A - 0.04, b: b - 0.04, n: 5 }, { y: 1.29, a: LINE_A - 0.04, b: b - 0.04, n: 5 }], ANC_SEG, c('whiteShade'), '', 'both');
  if (ribbon) { ancLiner(F, secs, 1.29, ribbon[0] - 0.02, 0.03); ancLiner(F, secs, ribbon[1] + 0.02, 4.15, 0.03); }
  else ancLiner(F, secs, 1.29, 4.15, 0.03);
  F.box(0, 4.13, 0, 3.0, 0.03, 2 * b - 0.8, 0, c('interior'), 'metal');
  for (const z of [-bz, bz]) lineBogie(F, z);
  lineUnderframe(F, b, bz);
  const hz = []; for (let z = -b + 1.6; z < b - 1.0; z += 3.6) hz.push(z);
  lineHoops(F, hz);
  lineStrips(F, ribbon ? ribbon[0] - 0.12 : 1.9, b);
  lineGangway(F, b + 0.1);
  for (const s of [-1, 1]) for (const zz of [-1, 1]) F.lamp(s * 1.2, 1.5, zz * (b + 0.01), 0, 0, zz, 0.05, 'tail', null, c('bronzeDark'));
  for (let z = -b + 2; z < b - 1.5; z += 4) F.box(0, 4.22, z, 0.8, 0.12, 1.2, 0, c('whiteShade'));  /* roof vents */
  if (kept) lineKept(F, b, ribbon, 6);
  return secs;
}

/* ---------------------------------------------------------------- anc_line_power: the power car */
const LINE_POWER_SECS = [{ y: 0.95, a: 1.62, b: 10.6, n: 4.5, z: 0 }, { y: 1.25, a: LINE_A, b: 10.8, n: 5, z: 0 },
  { y: 2.7, a: LINE_A, b: 10.8, n: 5, z: 0 }, { y: 3.5, a: 1.7, b: 10.1, n: 4.5, z: -0.5 },
  { y: 4.0, a: 1.55, b: 9.2, n: 4, z: -1.2 }, { y: 4.32, a: 1.1, b: 8.4, n: 3.5, z: -1.9 }];
VEHICLE({
  key: 'anc_line_power', name: 'Ancient Line power car', culture: 'ancient',
  tags: { type: ['vehicle', 'transport'], drive: 'wheeled', seats: 2, fuel: 'battery',
    terrain: ['track'], setting: 'underground' },
  variants: 2, variantNames: ['Built', 'Kept (Tungang)'],
  w: 3.6, d: 22, h: 4.4,
  budget: { tris: 12000 },
  data: lineData({ seats: 2, mass: 68000, wheelbase: 15, wheels: lineWheels(7.5), cooling: 'the train\'s plant: water from the tank car through the cooling loop',
    ride: { b: 7.5, floor: [-1.5, 1.5, 7.0, 9.6, LINE_FLOOR], cap: { seats: 2, stand: 0 },
      seats: [{ id: 'cab1', at: [0.7, LINE_FLOOR + 0.16, 8.4], yaw: 0 }, { id: 'cab2', at: [-0.7, LINE_FLOOR + 0.16, 8.4], yaw: 0 }],
      stand: [[-0.6, 0.6, 7.1, 7.9, LINE_FLOOR]],
      doors: [{ id: 'cab', side: 1, at: [LINE_A, LINE_FLOOR, 6.6] }, { id: 'cab-l', side: -1, at: [-LINE_A, LINE_FLOOR, 6.6] }] } }),
  variantData: [{}, { keptBy: 'tungang' }],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col, secs = LINE_POWER_SECS, kept = F.variant === 1, front = function (y) { const s = ancSkin(secs, y); return (s.z || 0) + s.b; };
    F.tub(secs, ANC_SEG, c('white'), '', 'top');
    ancLiner(F, secs, 1.29, 4.1, 0.03);
    F.box(0, 1.13, 4.0, 3.2, 0.07, 13.0, 0, c('interior'), 'metal');     /* the cab and plant floor */
    for (const z of [-7.5, 7.5]) lineBogie(F, z);
    lineUnderframe(F, 10.8, 7.5);
    lineHoops(F, [-9.2, -5.6, -2.0, 1.6, 5.2]);
    lineStrips(F, 1.9, 10.8);
    F.box(0, LINE_FLOOR, -10.86, 1.3, 2.2, 0.16, 0, c('tyre'));            /* the gangway at the back only */
    /* the windscreen on the rake (glass while the ruin keeps it), framed in bronze */
    const ws = [2.85, 3.7], th0 = Math.PI / 2 - 0.62, th1 = Math.PI / 2 + 0.62, N = 6;
    const P = function (y, th, out) { const s = ancSkin(secs, y); return ancPt({ y: y, a: s.a + out, b: s.b + out, n: s.n, z: s.z }, th); };
    for (let i = 0; i < N; i++) {
      const a0 = th0 + (th1 - th0) * i / N, a1 = th0 + (th1 - th0) * (i + 1) / N;
      if (!F.ruin || F.ruin.glass) {
        const p = P(ws[0], a0, 0.012), q = P(ws[0], a1, 0.012), r = P(ws[1], a1, 0.012), t = P(ws[1], a0, 0.012);
        F.tri(p, q, r, c('blueGlass'), 'metal'); F.tri(p, r, t, c('blueGlass'), 'metal');
      }
      const m0 = P(ws[0], a0, 0.02), m1 = P(ws[1], a0, 0.02);
      F.rod(m0[0], m0[1], m0[2], m1[0], m1[1], m1[2], 0.02, c('bronzeDark'), 'metal');
    }
    for (const y of ws) { const p = P(y, th0, 0.02), q = P(y, th1, 0.02), m = P(y, Math.PI / 2, 0.02);
      F.rod(p[0], p[1], p[2], m[0], m[1], m[2], 0.02, c('bronzeDark'), 'metal'); F.rod(m[0], m[1], m[2], q[0], q[1], q[2], 0.02, c('bronzeDark'), 'metal'); }
    /* the cab: two seats, the dash, the back wall; a door each side */
    ancSeat(F, 0.7, LINE_FLOOR, 8.4, 0.6); ancSeat(F, -0.7, LINE_FLOOR, 8.4, 0.6);
    ancDash(F, LINE_FLOOR + 0.75, 9.55, 2.6);
    F.box(0, LINE_FLOOR, 6.95, 3.2, 2.9, 0.08, 0, c('interior'), 'metal');
    lineDoor(F, 6.6, 0.9, 2.0);
    /* the plant: louvres along both sides, the coolers on the roof, the pressure plant's bronze drums */
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) F.box(s * (LINE_A + 0.012), 1.75 + i * 0.18, -2.0, 0.02, 0.06, 13.0, 0, c('whiteShade'), 'metal');
    for (const z of [-7.6, -4.4, -1.2]) { F.box(0, 4.12, z, 1.7, 0.26, 2.6, 0, c('whiteShade'));
      for (let k = -2; k <= 2; k++) F.box(k * 0.3, 4.38, z, 0.08, 0.02, 2.4, 0, c('bronzeDark'), 'metal'); }
    for (const z of [-9.3, -8.3]) F.disc(0, 2.4, z, 1, 0, 0, 0.42, 2.6, c('bronze'), 'metal', 12);
    /* the lamps: head lamps on the nose, the tail lamps at the back */
    const zn = front(1.7) + 0.02;
    for (const s of [-1, 1]) F.lamp(s * 1.0, 1.7, zn, 0, 0, 1, 0.1, 'head', c('bronzeDark'), c('bronze'));
    for (const s of [-1, 1]) F.lamp(s * 1.2, 1.5, -10.82, 0, 0, -1, 0.06, 'tail', null, c('bronzeDark'));
    ancStrip(F, 0, 2.3, front(2.3) - 0.06, 2.2, 0.03, 0.06);
    if (kept) {
      lineKept(F, 10.8, null, 5);
      /* the lamp code on the nose: the green running lamp in the middle, the white lamp under its hood above */
      lineLamp(F, 0, 1.55, front(1.55) + 0.03, 1, 0.09, 'lensGreen', 'lampBlue', 'cell');
      F.lamp(0, 2.55, front(2.55) + 0.02, 0, 0, 1, 0.08, 'head', c('rivet'), c('plateDark'));
      F.box(0, 2.66, front(2.66) - 0.02, 0.3, 0.03, 0.22, 0, c('plateDark'));
      /* the bell on the cab roof, on a bracket */
      F.disc(0, 4.34, 4.0, 0, 1, 0, 0.1, 0.08, c('bronze'), 'metal', 12);
    }
  }
});

/* ---------------------------------------------------------------- anc_line_saloon: the saloon */
VEHICLE({
  key: 'anc_line_saloon', name: 'Ancient Line saloon', culture: 'ancient',
  tags: { type: ['vehicle', 'transport'], drive: 'wheeled', seats: 64, fuel: 'battery',
    terrain: ['track'], setting: 'underground' },
  variants: 2, variantNames: ['Built', 'Kept (Tungang)'],
  w: 3.6, d: 24, h: 4.4,
  budget: { tris: 12000 },
  data: lineData({ seats: 64, standing: 40, mass: 46000, wheelbase: 17, wheels: lineWheels(8.5), ride: lineRideSaloon(11.8, 8.5, 10.4, 16, -8.25) }),
  variantData: [{}, { keptBy: 'tungang' }],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col, kept = F.variant === 1, ribbon = [2.0, 3.0];
    lineShell(F, 11.8, 8.5, ribbon, kept);
    lineRibbon(F, ribbon[0], ribbon[1], -9.0, 9.0, kept);
    lineDoor(F, 10.4, 1.4, 2.0); lineDoor(F, -10.4, 1.4, 2.0);
    /* the vestibules' partitions, open in the middle */
    for (const z of [-9.5, 9.5]) for (const s of [-1, 1]) F.box(s * 1.15, LINE_FLOOR, z, 1.1, 2.85, 0.06, 0, c('whiteShade'));
    /* sixteen rows of double seats either side of the aisle, the grab poles */
    for (let i = 0; i < 16; i++) { const z = -8.25 + i * 1.1; for (const s of [-1, 1]) ancSeat(F, s * 0.95, LINE_FLOOR, z, 0.95); }
    for (const z of [-6.6, -3.3, 0, 3.3, 6.6]) F.rod(0, LINE_FLOOR, z, 0, 4.1, z, 0.02, c('bronzeDark'), 'metal');
  }
});

/* ---------------------------------------------------------------- anc_line_crew: the crew car */
VEHICLE({
  key: 'anc_line_crew', name: 'Ancient Line crew car', culture: 'ancient',
  tags: { type: ['vehicle', 'transport', 'utility'], drive: 'wheeled', seats: 8, fuel: 'battery',
    terrain: ['track'], setting: 'underground' },
  variants: 2, variantNames: ['Built', 'Kept (Tungang)'],
  w: 3.6, d: 24, h: 4.4,
  budget: { tris: 12000 },
  data: lineData({ seats: 8, standing: 10, berths: 12, mass: 44000, wheelbase: 17, wheels: lineWheels(8.5),
    ride: { b: 8.5, floor: [-1.6, 1.6, -11.4, 11.4, LINE_FLOOR], cap: { seats: 8, stand: 10 },
      seats: [0, 1, 2, 3].map(function (i) { return [{ id: 'g' + (2 * i + 1), at: [0.95, LINE_FLOOR + 0.16, 2.2 + i * 1.1], yaw: 0 }, { id: 'g' + (2 * i + 2), at: [-0.95, LINE_FLOOR + 0.16, 2.2 + i * 1.1], yaw: 0 }]; }).reduce(function (a, b) { return a.concat(b); }, []),
      stand: [[-0.4, 0.4, -9.0, 9.0, LINE_FLOOR]],
      doors: [{ id: 'd1', side: 1, at: [LINE_A, LINE_FLOOR, 10.4] }, { id: 'd2', side: -1, at: [-LINE_A, LINE_FLOOR, 10.4] },
        { id: 'd3', side: 1, at: [LINE_A, LINE_FLOOR, -10.4] }, { id: 'd4', side: -1, at: [-LINE_A, LINE_FLOOR, -10.4] }] } }),
  variantData: [{}, { keptBy: 'tungang' }],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col, kept = F.variant === 1, ribbon = [2.0, 3.0];
    lineShell(F, 11.8, 8.5, ribbon, kept);
    lineRibbon(F, ribbon[0], ribbon[1], 1.2, 9.6, kept);           /* the galley and the guard's end have windows */
    lineRibbon(F, ribbon[0], ribbon[1], -9.6, -8.4, kept);
    lineDoor(F, 10.4, 1.4, 2.0); lineDoor(F, -10.4, 1.4, 2.0);
    /* the berths: two tiers along both walls, z -8 to 0 */
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) for (const y of [LINE_FLOOR + 0.35, LINE_FLOOR + 1.45]) {
      const z = -7.0 + i * 2.2;
      F.box(s * 1.25, y, z, 0.8, 0.12, 2.0, 0, c('seat'));
      F.box(s * 1.25, y + 0.12, z - 1.0, 0.8, 0.9, 0.04, 0, c('interior'), 'metal');
    }
    /* the galley: a counter and its stove; the guard's end: the brake wheel on its column */
    F.box(1.3, LINE_FLOOR, 7.6, 0.6, 0.9, 3.6, 0, c('whiteShade'));
    F.box(1.3, LINE_FLOOR + 0.9, 6.6, 0.5, 0.05, 0.7, 0, c('interior'), 'metal');
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) ancSeat(F, s * 0.95, LINE_FLOOR, 2.2 + i * 1.1, 0.5);
    F.rod(0, LINE_FLOOR, -9.0, 0, LINE_FLOOR + 1.1, -9.0, 0.04, c('interior'), 'metal');
    F.ring(0, LINE_FLOOR + 1.1, -8.95, 0, 0, 1, 0.3, 0.025, c('bronzeDark'), 'metal', 14);
    for (const z of [-9.4, 9.4]) for (const s of [-1, 1]) F.box(s * 1.15, LINE_FLOOR, z, 1.1, 2.85, 0.06, 0, c('whiteShade'));
  }
});

/* ---------------------------------------------------------------- anc_line_van: the freight van */
const LINE_VAN_DOORS = [-7.2, 0, 7.2];
VEHICLE({
  key: 'anc_line_van', name: 'Ancient Line freight van', culture: 'ancient',
  tags: { type: ['vehicle', 'cargo'], drive: 'wheeled', seats: 1, fuel: 'battery',
    terrain: ['track'], setting: 'underground' },
  variants: 2, variantNames: ['Built', 'Kept (Tungang)'],
  w: 3.6, d: 24, h: 4.4,
  budget: { tris: 10000 },
  data: lineData({ seats: 1, cargo: 30000, mass: 30000, wheelbase: 17, wheels: lineWheels(8.5),
    ride: { b: 8.5, floor: [-1.6, 1.6, -11.4, 11.4, LINE_FLOOR], cap: { seats: 0, stand: 0 }, seats: [], stand: [],
      doors: LINE_VAN_DOORS.map(function (z, i) { return [{ id: 'd' + (2 * i + 1), side: 1, at: [LINE_A, LINE_FLOOR, z] }, { id: 'd' + (2 * i + 2), side: -1, at: [-LINE_A, LINE_FLOOR, z] }]; }).reduce(function (a, b) { return a.concat(b); }, []),
      slots: [-9.6, -3.6, 3.6, 9.6].concat([-6.0, 6.0]).map(function (z, i) { return { id: 'bay' + (i + 1), kind: 'bay', size: 14, at: [0, LINE_FLOOR, z] }; }) } }),
  variantData: [{}, { keptBy: 'tungang' }],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col, kept = F.variant === 1;
    lineShell(F, 11.8, 8.5, null, kept);
    for (const z of LINE_VAN_DOORS) {
      for (const s of [-1, 1]) {
        F.box(s * (LINE_A + 0.01), LINE_FLOOR + 0.05, z - 0.6, 0.016, 2.5, 1.18, 0, c('whiteDark'));
        F.box(s * (LINE_A + 0.01), LINE_FLOOR + 0.05, z + 0.6, 0.016, 2.5, 1.18, 0, c('whiteDark'));
        F.box(s * (LINE_A + 0.016), LINE_FLOOR + 0.05, z, 0.02, 2.5, 0.04, 0, c('bronzeDark'), 'metal');
        F.box(s * (LINE_A + 0.016), LINE_FLOOR + 2.55, z, 0.02, 0.06, 2.5, 0, c('bronzeDark'), 'metal');
      }
    }
    /* the bays: tie-down rails along the floor, a bay frame between each pair */
    for (const s of [-1, 1]) F.rod(s * 1.4, LINE_FLOOR + 0.05, -11.0, s * 1.4, LINE_FLOOR + 0.05, 11.0, 0.025, c('bronzeDark'), 'metal');
    for (const z of [-4.8, 4.8]) for (const s of [-1, 1]) F.rod(s * 1.5, LINE_FLOOR, z, s * 1.5, 4.1, z, 0.04, c('interior'), 'metal');
  }
});

/* ---------------------------------------------------------------- anc_line_tank: the tank car */
VEHICLE({
  key: 'anc_line_tank', name: 'Ancient Line tank car', culture: 'ancient',
  tags: { type: ['vehicle', 'cargo', 'utility'], drive: 'wheeled', seats: 1, fuel: 'battery',
    terrain: ['track'], setting: 'underground' },
  variants: 2, variantNames: ['Built', 'Kept (Tungang)'],
  w: 3.6, d: 22, h: 4.4,
  budget: { tris: 9000 },
  data: lineData({ seats: 1, cargo: 110000, mass: 28000, wheelbase: 15, wheels: lineWheels(7.5), tankWater: 110,
    ride: { b: 7.5, floor: [-0.3, 0.3, -10.4, 10.4, 4.21], cap: { seats: 0, stand: 0 }, seats: [], stand: [], doors: [],
      slots: [{ id: 'water', kind: 'water', size: 110, at: [0, 2.75, 0] }] } }),
  variantData: [{}, { keptBy: 'tungang' }],
  wheel: function (F, W) { ancWheel(F, W, 'whiteDark'); },
  build: function (F) {
    const c = F.col, kept = F.variant === 1;
    /* the frame deck, the running gear, the end platforms */
    F.box(0, 0.95, 0, 3.2, 0.3, 21.6, 0, c('whiteShade'), 'metal');
    for (const z of [-7.5, 7.5]) lineBogie(F, z);
    lineUnderframe(F, 10.8, 7.5);
    /* the tank: a white cylinder along the car, domed ends, bronze bands where it sits on its saddles */
    F.disc(0, 2.75, 0, 0, 0, 1, 1.45, 18.0, c(kept ? 'plateGreen' : 'white'), '', 24);
    for (const s of [-1, 1]) {
      F.disc(0, 2.75, s * 9.2, 0, 0, 1, 1.2, 0.4, c(kept ? 'plateGreen' : 'whiteDark'), '', 24);
      F.disc(0, 2.75, s * 9.5, 0, 0, 1, 0.8, 0.25, c(kept ? 'plateRust' : 'whiteDark'), '', 16);
    }
    for (const z of [-7.0, -2.4, 2.4, 7.0]) {
      F.ring(0, 2.75, z, 0, 0, 1, 1.47, 0.04, c(kept ? 'rivet' : 'bronze'), 'metal', 24);
      F.box(0, 1.25, z, 2.6, 0.35, 0.3, 0, c('bronzeDark'), 'metal');
    }
    /* the walkway on top, its rails, the hatches; the cooling loop's pipes along both sides */
    F.box(0, 4.18, 0, 0.6, 0.04, 17.0, 0, c('interior'), 'metal');
    for (const s of [-1, 1]) {
      for (let z = -8; z <= 8.01; z += 2) F.rod(s * 0.32, 4.2, z, s * 0.32, 4.38, z, 0.015, c('bronzeDark'), 'metal');
      F.rod(s * 0.32, 4.38, -8, s * 0.32, 4.38, 8, 0.015, c('bronzeDark'), 'metal');
      F.rod(s * 1.5, 1.45, -9.8, s * 1.5, 1.45, 9.8, 0.06, c('bronze'), 'metal');
    }
    for (const z of [-4, 4]) F.disc(0, 4.15, z, 0, 1, 0, 0.35, 0.12, c('bronzeDark'), 'metal', 12);
    for (const s of [-1, 1]) for (const zz of [-1, 1]) F.lamp(s * 1.2, 1.5, zz * 10.82, 0, 0, zz, 0.05, 'tail', null, c('bronzeDark'));
    lineGangway(F, 10.86);
    if (kept) for (const s of [-1, 1]) { F.box(s * 1.47, 2.5, 0, 0.012, 0.42, 1.1, 0, c('enamelRed')); F.box(s * 1.478, 2.54, 0, 0.012, 0.34, 1.0, 0, c('enamel')); }
  }
});
