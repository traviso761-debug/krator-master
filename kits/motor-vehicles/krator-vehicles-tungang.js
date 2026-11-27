/* ======================================================================
   Krator Motor Vehicles: the Tungangs' rolling stock (kits/motor-vehicles/krator-vehicles-tungang.js)

   The Tungangs (LORE.md 6.1; kits/tungang/PLAN.md): the Rift line's crews gone feral, who keep the Line running
   (biomes/line/PLAN.md section 7, the owner's answer of 2026-11-11: their own stock is a `tungang` culture in this
   kit). Salvage, mostly Ancient wreckage: Ancient bogies and wheels under decks of riveted plate in faded railway
   colours (green, cream, red oxide), rope and fungus felt; the lamp code on every one (a green running lamp, the red
   tail, a white lamp under a hood). They run on the Line's guideway like the Ancient cars (+z forward, the wheels on
   y = 0, x +-0.85 on the guideway's running bands, none steers).

     tg_trolley    the Fixers' trolley: a pump lever on a deck over one bogie, a salvaged cell   2.9 x 4.6 x 2.8 m
     tg_flat       a flat wagon on two salvaged bogies: rubble, spoil, loads (variant: spoil)    3.2 x 12.4 x 2.4 m
     tg_icewagon   the ice wagon: an insulated box of fungus felt on a plate frame              3.2 x 10.4 x 3.6 m

   The flat and the ice wagon have no motor: they are towed (`data.towed`). The kit's fuel vocabulary has no "none",
   so their `tags.fuel` is 'battery', nominal (KNOWN_ISSUES.md). The trolley runs on a salvaged Ancient power cell,
   recharged at the hot doors' plant, with the pump lever when the cell is flat.
   Nothing here draws from F.rnd but the small things the kit lets a seed vary (the trolley's tool chest lid).
   ====================================================================== */

VEHICLE_CULTURE('tungang', {
  name: 'the Tungangs', sign: 'the lamp code: a green lamp running, a red tail, a white lamp hooded',
  lore: 'the Rift line\'s crews gone feral, friendly Morlocks who keep the Line running; salvage of Ancient wreckage in faded railway paint',
  detail: {
    plateGreen: 'paintWorn', plateCream: 'paintWorn', plateOxide: 'paintWorn', rust: 'rust', steel: 'metal', felt: 'canvas',
    rope: 'canvas', cell: 'ancientWhite', cellBand: 'bronze', rubble: 'concrete', timber: 'wood',
    lensGreen: null, lensWarm: null, lensRed: null, glowBlue: null, wax: null, cyan: null
  },
  palette: {
    plateGreen: 0x3f5a43, plateCream: 0xd8cfb0, plateOxide: 0x8a3e2a, rust: 0x6e4a32, steel: 0x5a5c5e, felt: 0x9a9078,
    rope: 0xa08a60, cell: 0xe6e4dc, cellBand: 0x8a6a3c, rubble: 0x6a6258, timber: 0x6a5032, wax: 0xd8c890,
    lensGreen: 0x6dff9a, lensWarm: 0xfff1c8, lensRed: 0xa8180e, glowBlue: 0x8fd8ff, cyan: 0x3a8a90
  }
});

const TG_WHEEL_X = 0.85;
/* a salvaged steel wheel: a plain disc, a flange, a hub */
function tgWheel(F, W) {
  F.disc(0, 0, 0, 1, 0, 0, W.r - 0.03, W.w, F.col('steel'), 'metal', 16);
  F.disc(-W.side * W.w * 0.45, 0, 0, 1, 0, 0, W.r, 0.03, F.col('rust'), 'metal', 16);   /* the flange (it would dip into the guideway's slot: drawn at the tread so the wheel stands on y = 0) */
  F.disc(W.side * W.w * 0.5, 0, 0, 1, 0, 0, W.r * 0.25, 0.05, F.col('rust'), 'metal', 8);
}
/* a bogie's wheels at z = bz +- half the axle spacing */
function tgWheels(bzs, r, axle) {
  const W = [], names = ['fl', 'fr', 'l2', 'r2', 'l3', 'r3', 'rl', 'rr'];
  let k = 0;
  const zs = [];
  for (const bz of bzs) { zs.push(bz + axle / 2); zs.push(bz - axle / 2); }
  zs.sort(function (a, b) { return b - a; });
  zs.forEach(function (z, i) {
    const nm = zs.length === 2 ? [['fl', 'fr'], ['rl', 'rr']][i] : [names[2 * i], names[2 * i + 1]];
    for (const j of [0, 1]) { W.push({ name: 'wheel_' + nm[j], x: j ? -TG_WHEEL_X : TG_WHEEL_X, z: z, r: r, w: 0.18, front: i < zs.length / 2, steer: false, drive: true }); k++; }
  });
  return W;
}
/* a salvaged bogie frame at z: side frames, axles, a guide shoe over the guideway's slot */
function tgBogie(F, z, r, axle) {
  const c = F.col;
  for (const s of [-1, 1]) F.box(s * 1.05, r - 0.18, z, 0.1, 0.34, axle + 0.9, 0, c('rust'), 'metal');
  for (const dz of [-axle / 2, axle / 2]) F.rod(-0.75, r, z + dz, 0.75, r, z + dz, 0.05, c('steel'), 'metal');
  F.box(0, r + 0.1, z, 1.9, 0.2, 1.0, 0, c('rust'), 'metal');
  F.box(0, 0.04, z, 0.2, r, 0.9, 0, c('steel'), 'metal');
}
/* a riveted plate panel facing +-x at x, from y0 to y1, z0 to z1, with a rivet line along its top and bottom */
function tgPlate(F, x, y0, y1, z0, z1, colKey) {
  const c = F.col, s = Math.sign(x) || 1;
  F.box(x, y0, (z0 + z1) / 2, 0.02, y1 - y0, z1 - z0, 0, c(colKey));
  F.box(x + s * 0.014, y1 - 0.04, (z0 + z1) / 2, 0.01, 0.025, z1 - z0 - 0.06, 0, c('rust'), 'metal');
  F.box(x + s * 0.014, y0 + 0.02, (z0 + z1) / 2, 0.01, 0.025, z1 - z0 - 0.06, 0, c('rust'), 'metal');
}
/* the lamp code on an end facing dz: green running (glows with lights() on lampBlue), red tail, white hooded */
function tgLampCode(F, z, dz, y, front) {
  const c = F.col;
  if (front) {
    F.face(0, y, z + dz * 0.004, 0, 0, dz, 0.07, c('lensGreen'), 'lampBlue', 10);
    F.disc(0, y, z - dz * 0.002, 0, 0, dz, 0.085, 0.01, c('rust'), 'metal', 8);
    F.lamps.push({ x: 0, y: y, z: z + dz * 0.007, dx: 0, dy: 0, dz: dz, kind: 'cell' });
    F.lamp(0.55, y + 0.3, z, 0, 0, dz, 0.06, 'head', c('rust'), null);
    F.box(0.55, y + 0.38, z - dz * 0.04, 0.2, 0.025, 0.14, 0, c('plateGreen'));
  } else F.lamp(0, y, z, 0, 0, dz, 0.05, 'tail', null, c('rust'));
}

/* ---------------------------------------------------------------- tg_trolley: the Fixers' trolley */
VEHICLE({
  key: 'tg_trolley', name: 'Fixers\' trolley', culture: 'tungang',
  tags: { type: ['vehicle', 'utility'], drive: 'wheeled', seats: 4, fuel: 'battery',
    terrain: ['track'], setting: 'underground' },
  variants: 1, variantNames: ['Trolley'],
  w: 2.9, d: 4.6, h: 2.8,
  data: {
    speed: 8, accel: 0.6, turnRadius: 0, maxSteer: 0, steering: 'guided (the Line\'s guideway); no wheel steers',
    seats: 4, cargo: 600, mass: 1400, fuel: 'battery', tank: 0, battery: 30, range: 60,
    drive: 'one salvaged Ancient hub motor on the front axle, the pump lever on the rear',
    engine: 'a salvaged Ancient power cell (recharged at the hot doors\' plant) and a pump lever', wheelbase: 2.4, track: 1.7, clearance: 0.3,
    wheels: tgWheels([0], 0.35, 2.4),
    ride: { b: 0, floor: [-1.35, 1.35, -2.1, 2.1, 0.72], cap: { seats: 4, stand: 4 },
      seats: [{ id: 'b1', at: [0.6, 1.16, -1.6], yaw: 0 }, { id: 'b2', at: [-0.6, 1.16, -1.6], yaw: 0 }, { id: 'b3', at: [0.6, 1.16, 1.6], yaw: Math.PI }, { id: 'b4', at: [-0.6, 1.16, 1.6], yaw: Math.PI }],
      stand: [[-1.2, 1.2, -1.0, 1.0, 0.72]], doors: [{ id: 'side', side: 1, at: [1.4, 0.72, 0] }, { id: 'side-l', side: -1, at: [-1.4, 0.72, 0] }] }
  },
  wheel: tgWheel,
  build: function (F) {
    const c = F.col;
    tgBogie(F, 0, 0.35, 2.4);
    /* the deck: plate on a rust frame, the edges in green and oxide */
    F.box(0, 0.57, 0, 2.8, 0.15, 4.4, 0, c('rust'), 'metal');
    for (const s of [-1, 1]) { tgPlate(F, s * 1.41, 0.45, 0.72, -2.2, 0, 'plateGreen'); tgPlate(F, s * 1.41, 0.45, 0.72, 0, 2.2, 'plateOxide'); }
    /* the salvaged cell slung under the deck: a white Ancient drum with its bronze band */
    F.disc(0, 0.36, 1.55, 1, 0, 0, 0.18, 1.2, c('cell'), '', 12);
    F.ring(0, 0.36, 1.55, 1, 0, 0, 0.19, 0.02, c('cellBand'), 'metal', 12);
    /* the pump: a column, the walking beam on its pivot, a handle bar at each end */
    F.box(0, 0.72, 0, 0.5, 0.5, 0.6, 0, c('rust'), 'metal');
    F.rod(0, 1.2, 0, 0, 1.55, 0, 0.06, c('steel'), 'metal');
    F.beam(0, 1.62, -1.1, 0, 1.5, 1.1, 0.1, 0.08, c('steel'), 'metal');
    for (const z of [-1.1, 1.1]) F.rod(-0.55, z < 0 ? 1.66 : 1.54, z, 0.55, z < 0 ? 1.66 : 1.54, z, 0.03, c('timber'));
    /* benches at each end, a tool chest, the rail round the deck */
    for (const z of [-1.7, 1.7]) F.box(0, 0.72, z, 2.2, 0.42, 0.45, 0, c('timber'));
    F.box(-1.0, 0.72, 0.6, 0.6, 0.45, 0.8, 0, c('plateOxide'));
    for (const s of [-1, 1]) {
      for (const z of [-2.1, -0.7, 0.7, 2.1]) F.rod(s * 1.35, 0.72, z, s * 1.35, 1.6, z, 0.02, c('rust'), 'metal');
      F.rod(s * 1.35, 1.6, -2.1, s * 1.35, 1.6, 2.1, 0.02, c('rust'), 'metal');
    }
    /* the lamp pole at the front corner with the code's lamps on it, a tail lamp at the back */
    F.rod(1.2, 0.72, 2.1, 1.2, 2.6, 2.1, 0.03, c('rust'), 'metal');
    F.box(1.2, 2.3, 2.15, 0.3, 0.3, 0.12, 0, c('rust'), 'metal');
    F.face(1.2, 2.45, 2.215, 0, 0, 1, 0.08, c('lensGreen'), 'lampBlue', 10);
    F.lamps.push({ x: 1.2, y: 2.45, z: 2.22, dx: 0, dy: 0, dz: 1, kind: 'cell' });
    F.lamp(-0.9, 0.62, 2.21, 0, 0, 1, 0.06, 'head', c('rust'), null);
    F.box(-0.9, 0.7, 2.18, 0.2, 0.025, 0.12, 0, c('plateGreen'));
    tgLampCode(F, -2.21, -1, 0.62, false);
    /* a coil of rope and the Fixers' gauge bar on the deck */
    F.ring(0.8, 0.76, -0.6, 0, 1, 0, 0.22, 0.04, c('rope'), '', 10);
    F.box(-0.3, 0.72, -0.8, 1.6, 0.06, 0.1, 0, c('steel'), 'metal');
  }
});

/* ---------------------------------------------------------------- tg_flat: the flat wagon */
VEHICLE({
  key: 'tg_flat', name: 'Tungang flat wagon', culture: 'tungang',
  tags: { type: ['vehicle', 'cargo'], drive: 'wheeled', seats: 1, fuel: 'battery',
    terrain: ['track'], setting: 'underground' },
  variants: 2, variantNames: ['Empty', 'Spoil'],
  w: 3.2, d: 12.4, h: 2.4,
  budget: { tris: 7000 },
  data: {
    speed: 15, accel: 0, turnRadius: 0, maxSteer: 0, steering: 'guided (the Line\'s guideway); no wheel steers',
    seats: 1, cargo: 20000, mass: 9000, fuel: 'battery', tank: 0, battery: 0, range: 0, towed: true,
    drive: 'none: towed', engine: 'none (towed)', wheelbase: 8.4, track: 1.7, clearance: 0.4,
    wheels: tgWheels([4.2, -4.2], 0.45, 2.0),
    ride: { b: 4.2, floor: [-1.5, 1.5, -6.0, 6.0, 1.22], cap: { seats: 0, stand: 0 }, seats: [], stand: [], doors: [],
      slots: [{ id: 'deck1', kind: 'deck', size: 18, at: [0, 1.22, -3.0] }, { id: 'deck2', kind: 'deck', size: 18, at: [0, 1.22, 3.0] }] }
  },
  variantData: [{}, { cargo: 20000, load: 'spoil' }],
  wheel: tgWheel,
  build: function (F) {
    const c = F.col;
    for (const z of [-4.2, 4.2]) tgBogie(F, z, 0.45, 2.0);
    F.box(0, 0.75, 0, 2.6, 0.22, 11.4, 0, c('rust'), 'metal');
    F.box(0, 0.97, 0, 3.1, 0.25, 12.2, 0, c('plateOxide'));
    for (const s of [-1, 1]) {
      tgPlate(F, s * 1.56, 0.92, 1.22, -6.1, 6.1, 'plateGreen');
      for (let z = -5.4; z <= 5.41; z += 1.8) { F.box(s * 1.5, 1.22, z, 0.12, 0.12, 0.12, 0, c('rust'), 'metal'); F.rod(s * 1.5, 1.22, z, s * 1.5, 1.9, z, 0.035, c('timber')); }
    }
    for (const zz of [-1, 1]) { F.box(0, 0.8, zz * 6.12, 1.6, 0.3, 0.12, 0, c('rust'), 'metal'); tgLampCode(F, zz * 6.19, zz, 1.05, false); }
    if (F.variant === 1) {
      /* spoil: rubble heaped down the deck, held by the stakes */
      const heaps = [[-4.2, 0.9], [-1.4, 1.0], [1.4, 0.95], [4.2, 0.85]];
      for (const h of heaps) F.blob(0, 1.22, h[0], 1.3, h[1], 0, c('rubble'));
    }
  }
});

/* ---------------------------------------------------------------- tg_icewagon: the ice wagon */
VEHICLE({
  key: 'tg_icewagon', name: 'Tungang ice wagon', culture: 'tungang',
  tags: { type: ['vehicle', 'cargo'], drive: 'wheeled', seats: 1, fuel: 'battery',
    terrain: ['track'], setting: 'underground' },
  variants: 1, variantNames: ['Ice wagon'],
  w: 3.2, d: 10.4, h: 3.6,
  budget: { tris: 7000 },
  data: {
    speed: 15, accel: 0, turnRadius: 0, maxSteer: 0, steering: 'guided (the Line\'s guideway); no wheel steers',
    seats: 1, cargo: 12000, mass: 8000, fuel: 'battery', tank: 0, battery: 0, range: 0, towed: true,
    drive: 'none: towed', engine: 'none (towed)', wheelbase: 6.8, track: 1.7, clearance: 0.4,
    wheels: tgWheels([3.4, -3.4], 0.45, 2.0),
    ride: { b: 3.4, floor: [-1.3, 1.3, -4.8, 4.8, 1.22], cap: { seats: 0, stand: 0 }, seats: [], stand: [],
      doors: [{ id: 'd1', side: 1, at: [1.55, 1.22, 0] }, { id: 'd2', side: -1, at: [-1.55, 1.22, 0] }],
      slots: [{ id: 'ice', kind: 'ice', size: 24, at: [0, 1.22, 0] }] }
  },
  wheel: tgWheel,
  build: function (F) {
    const c = F.col;
    for (const z of [-3.4, 3.4]) tgBogie(F, z, 0.45, 2.0);
    F.box(0, 0.75, 0, 2.6, 0.22, 9.4, 0, c('rust'), 'metal');
    F.box(0, 0.97, 0, 3.0, 0.25, 10.2, 0, c('plateOxide'));
    /* the box: fungus felt panels between plate ribs, a felt roof over a plate cap, wax-sealed doors */
    F.box(0, 1.22, 0, 2.96, 2.2, 10.0, 0, c('felt'));
    F.box(0, 3.42, 0, 3.1, 0.12, 10.2, 0, c('plateGreen'));
    for (const s of [-1, 1]) {
      for (let z = -4.8; z <= 4.81; z += 1.6) F.box(s * 1.49, 1.22, z, 0.06, 2.2, 0.12, 0, c('rust'), 'metal');
      F.box(s * 1.5, 1.32, 0, 0.03, 1.9, 1.5, 0, c('plateGreen'));
      F.box(s * 1.52, 1.32, 0.78, 0.03, 1.9, 0.05, 0, c('wax'));
      F.box(s * 1.52, 1.32, -0.78, 0.03, 1.9, 0.05, 0, c('wax'));
    }
    for (const zz of [-1, 1]) { F.box(0, 1.22, zz * 5.0, 2.96, 2.2, 0.04, 0, c('plateCream')); F.box(0, 0.8, zz * 5.12, 1.6, 0.3, 0.12, 0, c('rust'), 'metal'); }
    F.box(0, 3.54, -2.5, 0.6, 0.06, 0.6, 0, c('rust'), 'metal');                    /* the roof hatch */
    tgLampCode(F, 5.03, 1, 1.0, true);
    tgLampCode(F, -5.03, -1, 1.0, false);
  }
});
