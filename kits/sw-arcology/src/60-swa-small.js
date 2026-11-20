// prefix: sws
// ---------------------------------------------------------------- SW Arcology Class S buildings (d = 10 m): 7 definitions
// Reclaimed chemical drums, galvanized grain bins, fuel tanks, feed hoppers, manifold shrines & valve standpipes.

// 1. swa-drum-hut (10 x 10 x 7, seed 6010)
defBuilding({
  key: 'swa-drum-hut', name: 'Drum Hut', seed: 6010,
  tags: { type: ['single-family dwelling'], size: 'small', core: 'chemical drum', materials: ['rolled steel', 'corrugated sheet', 'plank'] },
  w: 10, d: 10, h: 7, build: swsDrumHut
});
function swsDrumHut(o) {
  const r = 2.6, h = 5.2;
  W(-0.6, 0, -0.5, 0, () => {
    swaDrum({ r: r, h: h });
    W(0, 0, r + 0.03, 0, () => { door(0, 0.34, 0, 0.95, 1.95, { step: true, col: 0x8a482c }); });
    for (const a of [-0.72, 0.72, 2.2]) {
      W(Math.sin(a) * (r + 0.03), 0, Math.cos(a) * (r + 0.03), a, () => {
        porthole(0, 2.95, 0, 0.38);
        if (a < 1) win(0, 1.15, 0, 0.75, 0.75, { lit: o.v === 1, shutters: true });
      });
    }
    stovepipe(-1.1, h + 0.15, -0.6, 1.35);
    sock('awning', 0, 2.55, r + 0.04, 0, { w: 2.0, d: 1.25, drop: 0.45, h: 2.3 });
    sock('emblem', 0, 4.15, r + 0.05, 0, { w: 0.85, h: 0.85 });
  });
  // Side corrugated lean-to kitchen pantry
  const lx = 2.65, lz = -0.5;
  box('plank', lx, 0, lz, 2.1, 0.14, 3.2, jc(0x685640, 0.06));
  sheetWall(lx, 0.14, lz + 1.56, 2.1, 2.25, 0, { mat: 'corr' });
  sheetWall(lx, 0.14, lz - 1.56, 2.1, 2.25, PI, { mat: 'corr' });
  sheetWall(lx + 1.02, 0.14, lz, 3.2, 2.25, PI / 2, { mat: 'sheet' });
  leanRoof(lx, lz - 1.6, 2.3, 3.35, 2.65, 2.25, { posts: false });
  barrel(3.1, 0, 2.2); crate(2.3, 0, 2.5, 0.6, 0.2);
  waterButt(-3.5, 1.2, 1.6, 0.55, 0.95);
  beam('wood', [3.6, 0, 3.4], [3.6, 3.8, 3.4], 0.08, jc(0x5c4630, 0.06), true, 6);
  sock('banner', 3.6, 3.8, 3.45, 0, { w: 0.65, h: 1.8 });
}

// 2. swa-silo-cot (10 x 10 x 9, seed 6020)
defBuilding({
  key: 'swa-silo-cot', name: 'Silo Cot', seed: 6020,
  tags: { type: ['single-family dwelling'], size: 'small', core: 'grain silo', materials: ['galvanised sheet', 'steel grate'] },
  w: 10, d: 10, h: 9, build: swsSiloCot
});
function swsSiloCot(o) {
  const r = 2.65, h = 6.9;
  W(0, 0, -0.55, 0, () => {
    silo({ r: r, h: h, roofCol: 0x7c5a44 });
    W(0, 0, r + 0.03, 0, () => {
      door(0, 0.45, 0, 0.95, 2.0, { step: true });
      door(0, 3.45, 0, 0.88, 1.9, { step: false, col: 0x3b6e78 });
    });
    for (const [a, y] of [[-0.75, 1.3], [0.75, 1.3], [-0.85, 4.2], [0.85, 4.2], [PI, 4.2]]) {
      W(Math.sin(a) * (r + 0.03), 0, Math.cos(a) * (r + 0.03), a, () => {
        win(0, y, 0, 0.8, 0.85, { lit: o.v === 1 && y > 3, bars: y < 2 });
      });
    }
    // Upper steel balcony + exterior spiral stair wrapping right flank
    stLanding(0, 3.45, r + 1.05, 3.2, 1.7, { rail: 'fr', floor: 'grate' });
    swaSpiralStair(r + 0.05, 0.15, 3.45, 1.55, -0.36, 0.9);
    solar(0, h + 0.35, 0.7, 2.2, 1.2, 0, 0.42);
    sock('awning', 0, 5.55, r + 0.04, 0, { w: 2.2, d: 1.3, drop: 0.45, h: 2.2 });
    sock('emblem', 0, 6.25, r + 0.05, 0, { w: 0.9, h: 0.9 });
  });
  barrel(-3.3, 0, 2.2); sacks(-2.6, 0, 2.7, 3, 0.3);
  lamp(3.2, 0, 2.9, 3.1);
}

// 3. swa-tank-shack (12 x 10 x 7, seed 6030)
defBuilding({
  key: 'swa-tank-shack', name: 'Tank Shack', seed: 6030,
  tags: { type: ['single-family dwelling'], size: 'small', core: 'fuel tank', materials: ['rolled steel', 'plank', 'tarp'] },
  w: 12, d: 10, h: 7, build: swsTankShack
});
function swsTankShack(o) {
  const r = 1.65, L = 7.4;
  W(-0.7, 0, -0.8, 0, () => {
    tankH({ r: r, L: L, col: pick([0x7a6652, 0x5c6e6c, 0x867458]) });
    // Timber vestibule grafted into +z side of horizontal fuel tank
    box('plank', -0.4, 0, r + 0.65, 2.6, 0.18, 1.5, jc(0x68543e, 0.06));
    wallOpen('sheet', -0.4, 0.18, r + 1.35, 2.6, 2.25, 0.08, [{ x0: -0.9, x1: 0.05, y0: 0.18, y1: 2.15 }], jc(0x885238, 0.05));
    sheetWall(-1.68, 0.18, r + 0.65, 1.5, 2.25, -PI / 2, { mat: 'corr' });
    sheetWall(0.88, 0.18, r + 0.65, 1.5, 2.25, PI / 2, { mat: 'corr' });
    leanRoof(-0.4, r - 0.1, 2.8, 1.65, 2.7, 2.38, { posts: false });
    door(-0.42, 0.18, r + 1.38, 0.92, 1.95, { step: true });
    for (const px of [-2.3, 1.9]) {
      W(px, r + 0.35, r + 0.02, 0, () => { porthole(0, 0, 0, 0.36); });
    }
    stovepipe(2.1, r * 2 + 0.3, -0.2, 1.45);
    sock('paint', 1.8, r + 0.35, -(r + 0.04), PI, { w: 2.6, h: 1.2 });
  });
  // Shade tarp over plank yard bench on right
  deck(3.5, 0.22, 0.8, 2.8, 3.4, { posts: false });
  tarp(3.5, 2.85, -0.8, 2.9, 3.3, 0.45);
  FURNISH('pa_tyre_chair', 3.4, 0.22, 0.9, -0.4);
  barrel(-4.4, 0, 1.8); tireStack(-4.5, 0.6, 3);
  sock('emblem', -1.1, 2.85, 2.25, 0, { w: 0.75, h: 0.5 });
}

// 4. swa-hopper-stall (10 x 10 x 8, seed 6040)
defBuilding({
  key: 'swa-hopper-stall', name: 'Hopper Stall', seed: 6040,
  tags: { type: ['shop', 'market stall'], size: 'small', core: 'feed hopper', materials: ['corrugated sheet', 'iron girder', 'plank'] },
  w: 10, d: 10, h: 8, build: swsHopperStall
});
function swsHopperStall() {
  W(0, 0, -0.9, 0, () => {
    swaHopper({ r: 2.05, legH: 2.65, bodyH: 2.5 });
    // Counter booth tucked beneath hopper legs facing +z
    box('plank', 0, 0, 0.55, 3.4, 0.16, 2.8, jc(0x6a5640, 0.06));
    plankWall(0, 0.16, -0.8, 3.4, 2.3, PI);
    plankWall(-1.66, 0.16, 0.55, 2.7, 2.3, -PI / 2);
    plankWall(1.66, 0.16, 0.55, 2.7, 2.3, PI / 2);
    // Serving counter across front + side entry
    box('plank', -0.45, 0.16, 1.88, 2.3, 0.96, 0.42, jc(0x7c6244, 0.05));
    box('wood', -0.45, 1.12, 1.92, 2.45, 0.08, 0.56, jc(0x8e704e, 0.05));
    entry(1.15, 0.16, 1.88, 0.9, 2.0);
    sock('awning', 0, 2.45, 1.92, 0, { w: 3.4, d: 1.5, drop: 0.5, h: 2.3 });
    sock('sign', 0, 4.2, 2.1, 0, { w: 2.1, h: 0.65 });
  });
  sacks(-2.1, 0, 2.2, 4, 0.2); crate(2.1, 0, 2.1, 0.65, -0.25);
  barrel(-2.4, 0, 0.8);
}

// 5. swa-drum-tinker (12 x 10 x 7, seed 6050)
defBuilding({
  key: 'swa-drum-tinker', name: 'Drum Tinker', seed: 6050,
  tags: { type: ['workshop', 'shop'], size: 'small', core: 'twin chemical drums', materials: ['rolled steel', 'iron pipe', 'corrugated sheet'] },
  w: 12, d: 10, h: 7, build: swsDrumTinker
});
function swsDrumTinker(o) {
  for (const sx of [-1, 1]) {
    W(sx * 2.75, 0, -1.0, 0, () => {
      swaDrum({ r: 2.05, h: sx < 0 ? 5.1 : 4.5, col: sx < 0 ? 0x566c72 : 0x7c5a42 });
      W(0, 0, 2.08, 0, () => {
        if (sx < 0) door(0, 0.34, 0, 0.95, 1.95, { step: true });
        else win(0, 1.15, 0, 0.95, 0.85, { lit: o.v === 1, bars: true });
      });
    });
  }
  // Overhead pipe bridge & covered workbench bay between drums
  cylH('iron', 0, 3.85, -1.0, 0.18, 2.6, jc(0x4c4640, 0.05), 'x', 10);
  box('plank', 0, 0, 0.35, 3.2, 0.16, 2.8, jc(0x66543e, 0.06));
  plankWall(0, 0.16, -0.95, 1.8, 2.5, PI);
  leanRoof(0, -1.0, 3.8, 3.2, 3.1, 2.55, { col: 0x8c8e88 });
  // Worktable + hanging salvage parts
  box('wood', 0, 0.16, 0.65, 2.2, 0.86, 0.7, jc(0x765c40, 0.05));
  swaValveHeader(0, 1.25, -0.88, 1.5, 0, 3);
  sock('sign', 0, 3.2, 2.22, 0, { w: 2.4, h: 0.6 });
  sock('emblem', -2.75, 3.9, 1.08, 0, { w: 0.8, h: 0.8 });
  crate(3.9, 0, 2.1, 0.7, 0.15); barrel(-4.2, 0, 1.9);
  junkPile(4.1, -1.6, 1.0, 5);
}

// 6. swa-pipe-shrine (8 x 10 x 9, seed 6060)
defBuilding({
  key: 'swa-pipe-shrine', name: 'Pipe Shrine', seed: 6060,
  tags: { type: ['shrine', 'religious'], size: 'small', core: 'header pipes', materials: ['ceramic bulkhead', 'steel pipe', 'bronze'] },
  w: 8, d: 10, h: 9, build: swsPipeShrine
});
function swsPipeShrine() {
  // Stepped concrete plinth + arched header-pipe baldachin over sun-dish / ancestor niche
  box('conc', 0, 0, -0.3, 6.2, 0.32, 6.8, jc(0x9a9488, 0.04));
  box('conc', 0, 0.32, -0.4, 4.8, 0.28, 5.4, jc(0xb2aca0, 0.04));
  entry(0, 0.6, 2.3, 1.8, 2.4);
  // Mini reclaimed Ancient ceramic bulkhead backing the altar
  W(0, 0.6, -2.1, 0, () => { bulkhead({ w: 4.2, h: 4.8, th: 0.55, hatch: 'round' }); });
  // Organ cluster of vertical salvaged manifold pipes rising to 7.4 m
  for (const [px, pz, ph, pr] of [
    [-1.85, -2.1, 6.6, 0.2], [-1.35, -2.1, 5.8, 0.16],
    [1.85, -2.1, 6.6, 0.2], [1.35, -2.1, 5.8, 0.16],
    [-1.75, 1.6, 4.2, 0.15], [1.75, 1.6, 4.2, 0.15]
  ]) {
    cyl('steel', px, 0.6, pz, pr, ph, jc(0x9ea4a2, 0.04), 12);
    cone('iron', px, 0.6 + ph, pz, pr * 1.45, 0.32, jc(0xa8823e, 0.05), 10);
  }
  beam('iron', [-1.85, 4.7, 1.6], [1.85, 4.7, 1.6], 0.14, jc(0x463e38, 0.05));
  beam('iron', [-1.85, 4.7, -2.1], [-1.85, 4.7, 1.6], 0.12, jc(0x463e38, 0.05));
  beam('iron', [1.85, 4.7, -2.1], [1.85, 4.7, 1.6], 0.12, jc(0x463e38, 0.05));
  // Offering brazier & votive bottle chimes
  box('conc', 0, 0.6, 0.1, 1.3, 0.78, 0.8, jc(0x7c7468, 0.04));
  sph('glow', -0.32, 1.48, 0.1, 0.09, jc(0xffcf78, 0.03));
  sph('glow', 0.32, 1.48, 0.1, 0.09, jc(0xffcf78, 0.03));
  bottleString([-1.7, 4.4, 1.6], [1.7, 4.4, 1.6], 7);
  sock('banner', -1.85, 4.5, 1.68, 0, { w: 0.65, h: 2.1 });
  sock('banner', 1.85, 4.5, 1.68, 0, { w: 0.65, h: 2.1 });
  sock('emblem', 0, 5.1, 1.66, 0, { w: 0.9, h: 0.9 });
}

// 7. swa-valve-well (8 x 10 x 6, seed 6070)
defBuilding({
  key: 'swa-valve-well', name: 'Valve Well', seed: 6070,
  tags: { type: ['well', 'cistern'], size: 'small', core: 'cistern ring', materials: ['concrete', 'cast iron', 'sheet metal'] },
  w: 8, d: 10, h: 6, build: swsValveWell
});
function swsValveWell() {
  // Sunken concrete cistern collar + overhead header-tank standpipe + cast-iron valve wheels
  cyl('conc', 0, 0, 0.2, 2.8, 0.24, jc(0x969084, 0.04), 20);
  sector('conc', 0, 0.2, 1.85, 2.35, 0, TAU, 0.24, 0.85, jc(0xa8a296, 0.04));
  cyl('sheet', 0, 0.65, 0.2, 1.84, 0.08, jc(0x2d4e58, 0.04), 18); // water surface sheen
  // Elevated pressure header drum on 4 iron pipe legs
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    beam('iron', [sx * 1.45, 0.24, 0.2 + sz * 1.45], [sx * 1.15, 3.2, 0.2 + sz * 1.15], 0.1, jc(0x48403a, 0.05), true, 7);
  }
  W(0, 3.15, 0.2, 0, () => {
    tankH({ r: 0.95, L: 3.4, col: 0x5c7276 });
  });
  // Standpipe & 3 street draw-off valves at +z
  entry(0, 0.24, 2.8, 1.6, 2.1);
  swaValveHeader(0, 0.24, 2.48, 2.4, 0, 3);
  box('conc', 0, 0.24, 2.95, 2.6, 0.22, 0.65, jc(0x827c72, 0.04)); // splash trough
  lamp(-2.5, 0, 2.6, 3.0);
  barrel(2.5, 0, 2.2);
  sock('emblem', 0, 4.1, 1.2, 0, { w: 0.75, h: 0.75 });
}
