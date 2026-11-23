// prefix: swm
// ---------------------------------------------------------------- SW Arcology Class M buildings (d = 12 m): 13 definitions
// Paired drum houses, fuel-tank duplexes, stacked grain silos, trade vats, stainless seed vaults & cider presses.

// 8. swa-twindrum-house (14 x 12 x 9, seed 6110)
defBuilding({
  key: 'swa-twindrum-house', name: 'Twindrum House', seed: 6110,
  tags: { type: ['dwelling'], size: 'medium', core: 'paired chemical drums', materials: ['rolled steel', 'plank', 'steel grate'] },
  w: 14, d: 12, h: 9, build: swmTwindrumHouse
});
function swmTwindrumHouse(o) {
  for (const sx of [-1, 1]) {
    W(sx * 3.4, 0, -0.8, 0, () => {
      swaDrum({ r: 2.5, h: sx < 0 ? 6.8 : 6.1 });
      W(0, 0, 2.53, 0, () => {
        if (sx < 0) door(0, 0.34, 0, 1.0, 2.0, { step: true });
        else win(0, 1.15, 0, 1.05, 0.9, { lit: o.v === 1, shutters: true });
        win(0, 4.05, 0, 0.9, 0.85, { lit: sx > 0 });
      });
    });
  }
  // Covered catwalk gallery & lower vestibule linking the two drums
  box('plank', 0, 0, -0.8, 2.4, 3.2, 3.2, jc(0x6c5842, 0.06));
  door(0, 3.55, 0.82, 0.9, 1.9, { step: false, col: 0x3b6e78 });
  stLanding(0, 3.55, 1.65, 5.2, 1.8, { rail: 'f', floor: 'grate' });
  stStairs(-2.1, 0, 4.4, -2.1, 3.55, 2.55, 1.05);
  leanRoof(0, -0.9, 5.4, 2.8, 6.0, 5.35, { posts: false });
  stovepipe(3.4, 6.3, -1.2, 1.4);
  sock('awning', -3.4, 2.6, 1.75, 0, { w: 2.2, d: 1.3, drop: 0.45, h: 2.3 });
  sock('banner', 2.4, 5.3, 1.82, 0, { w: 0.7, h: 2.0 });
  sock('emblem', 3.4, 5.3, 1.75, 0, { w: 0.9, h: 0.9 });
  barrel(5.2, 0, 2.6); waterButt(-5.4, 1.2, 1.8, 0.55, 1.0);
}

// 9. swa-tank-duplex (16 x 12 x 10, seed 6120)
defBuilding({
  key: 'swa-tank-duplex', name: 'Tank Duplex', seed: 6120,
  tags: { type: ['dwelling', 'multi-family'], size: 'medium', core: 'stacked fuel tanks', materials: ['rolled steel', 'shipping container', 'steel grate'] },
  w: 16, d: 12, h: 10, build: swmTankDuplex
});
function swmTankDuplex(o) {
  // Ground ISO container + plank rooms carrying two horizontal fuel tanks side-by-side on steel cradles
  W(-2.8, 0, -0.9, 0, () => { container({ len: CT.L20 }); });
  W(3.2, 0, -0.9, 0, () => { container({ len: CT.L20 }); });
  door(-3.2, 0.16, 0.34, 0.95, 2.0);
  door(2.8, 0.16, 0.34, 0.95, 2.0);
  win(-1.2, 1.05, 0.34, 1.0, 0.8, { lit: o.v === 1 });
  win(4.6, 1.05, 0.34, 1.0, 0.8, { lit: true });
  // Upper steel cradle & twin cylindrical tank apartments
  stLanding(0, 2.85, 0.1, 13.2, 4.4, { rail: 'flr', floor: 'plate' });
  for (const sx of [-3.1, 3.1]) {
    W(sx, 2.85, -0.9, 0, () => {
      tankH({ r: 1.65, L: 6.0, col: sx < 0 ? 0x766858 : 0x566c6e });
      W(0, 0, 1.68, 0, () => {
        door(-0.8, 0.45, 0, 0.88, 1.85, { step: false });
        porthole(1.2, 1.65, 0, 0.38);
      });
    });
  }
  stStairs(0, 0, 4.3, 0, 2.85, 2.3, 1.2);
  solar(-3.1, 6.55, -0.9, 2.8, 1.4, 0, 0.4);
  stovepipe(4.2, 6.45, -1.2, 1.3);
  sock('awning', -3.2, 2.4, 0.36, 0, { w: 2.2, d: 1.2, drop: 0.4, h: 2.2 });
  sock('awning', 2.8, 2.4, 0.36, 0, { w: 2.2, d: 1.2, drop: 0.4, h: 2.2 });
  sock('emblem', 0, 2.65, 2.32, 0, { w: 1.0, h: 0.65 });
  barrel(-6.4, 0, 2.4); crate(6.2, 0, 2.3, 0.7, 0.2);
}

// 10. swa-silo-stack (12 x 12 x 14, seed 6130)
defBuilding({
  key: 'swa-silo-stack', name: 'Silo Stack', seed: 6130,
  tags: { type: ['dwelling', 'tenement'], size: 'medium', core: 'tall grain silo', materials: ['galvanised sheet', 'steel grate', 'plank'] },
  w: 12, d: 12, h: 14, build: swmSiloStack
});
function swmSiloStack(o) {
  const r = 3.0, h = 11.2;
  W(-1.2, 0, -0.6, 0, () => {
    silo({ r: r, h: h, roofCol: 0x9e4c2e });
    for (const [lv, y] of [[0, 0.45], [1, 3.65], [2, 6.85]]) {
      W(0, 0, r + 0.03, 0, () => {
        door(0, y, 0, 0.95, 1.95, { step: lv === 0 });
      });
      for (const a of [-0.85, 0.85, 2.35, -2.35]) {
        W(Math.sin(a) * (r + 0.03), 0, Math.cos(a) * (r + 0.03), a, () => {
          win(0, y + 0.85, 0, 0.82, 0.85, { lit: (lv + (o.v === 1 ? 1 : 0)) % 2 === 1 });
        });
      }
      if (lv > 0) stLanding(0, y, r + 1.05, 3.2, 1.6, { rail: 'fl', floor: 'grate' });
    }
  });
  // Braced steel stair tower on right (+x) serving all 3 storeys within w=12
  stLanding(2.9, 3.65, 1.8, 2.3, 2.2, { rail: 'fr', floor: 'grate' });
  stLanding(2.9, 6.85, 1.8, 2.3, 2.2, { rail: 'frb', floor: 'grate' });
  stStairs(2.9, 0, 4.4, 2.9, 3.65, 2.9, 0.95);
  stStairs(3.5, 3.65, 0.7, 2.9, 6.85, 0.7, 0.9);
  stLanding(1.05, 3.65, 2.45, 1.6, 1.2, { rail: 'fb', posts: false });
  stLanding(1.05, 6.85, 2.45, 1.6, 1.2, { rail: 'fb', posts: false });
  sock('banner', 4.0, 6.8, 2.92, 0, { w: 0.75, h: 2.4 });
  sock('emblem', -1.2, 9.5, 2.44, 0, { w: 1.0, h: 1.0 });
  lamp(4.2, 0, 3.5, 3.3); barrel(-4.6, 0, 2.3);
}

// 11. swa-drum-smithy (14 x 12 x 9, seed 6140)
defBuilding({
  key: 'swa-drum-smithy', name: 'Drum Smithy', seed: 6140,
  tags: { type: ['workshop', 'smithy'], size: 'medium', core: 'cut boiler drum', materials: ['rolled steel', 'iron girder', 'corrugated sheet'] },
  w: 14, d: 12, h: 9, build: swmDrumSmithy
});
function swmDrumSmithy() {
  // Cut-down boiler forge chamber on left + open anvil yard under corrugated steel canopy
  W(-3.0, 0, -1.0, 0, () => {
    swaDrum({ r: 2.6, h: 5.8, col: 0x4c443e, roofCol: 0x3a3430 });
    W(0, 0, 2.63, 0, () => { door(0, 0.34, 0, 1.1, 2.05, { step: true, col: 0x6e3828 }); });
    // Tall riveted forge stack with smoke
    cyl('iron', -0.4, 5.8, -0.4, 0.38, 2.5, jc(0x3a3430, 0.04), 12);
    cone('iron', -0.4, 8.3, -0.4, 0.62, 0.38, jc(0x2e2a28, 0.04), 12);
    smokeAt(-0.4, 8.8, -0.4, { r: 0.45, kind: 'forge' });
  });
  // Forging apron + glowing coal hearth + quench tank
  box('conc', 2.2, 0, -0.2, 6.2, 0.2, 7.6, jc(0x888278, 0.05));
  leanRoof(2.2, -3.8, 6.4, 7.2, 4.8, 3.4, { col: 0x6a6e6c });
  entry(2.2, 0.2, 3.4, 2.4, 2.4);
  // Brick/basalt hearth & glowing coals
  box('conc', 1.2, 0.2, -2.2, 2.2, 0.95, 1.6, jc(0x463e3a, 0.05));
  cone('glow', 1.2, 1.15, -2.2, 0.45, 0.28, jc(0xff7828, 0.03), 8);
  // Anvil block & quench half-drum
  box('wood', 2.4, 0.2, 0.4, 0.65, 0.55, 0.65, jc(0x56422e, 0.05));
  box('iron', 2.4, 0.75, 0.4, 0.85, 0.28, 0.34, jc(0x363432, 0.04));
  cyl('iron', 4.1, 0.2, -0.2, 0.62, 0.85, jc(0x4c585a, 0.05), 14);
  sock('sign', 2.2, 3.65, 3.45, 0, { w: 2.8, h: 0.7 });
  sock('emblem', -3.0, 4.4, 1.65, 0, { w: 0.95, h: 0.95 });
  barrel(4.8, 0, 2.8); junkPile(-5.2, 2.4, 1.1, 6);
}

// 12. swa-still-vat (14 x 12 x 10, seed 6150)
defBuilding({
  key: 'swa-still-vat', name: 'Still Vat House', seed: 6150,
  tags: { type: ['workshop', 'brewery', 'distillery'], size: 'medium', core: 'fermentation tanks', materials: ['stainless steel', 'copper', 'rolled steel'] },
  w: 14, d: 12, h: 10, build: swmStillVat
});
function swmStillVat(o) {
  // Twin tall mash/still vats + copper/bronze condenser neck + front tasting/cask room
  W(-2.8, 0, -1.3, 0, () => { swaReactor({ r: 2.35, h: 8.2 }); });
  W(2.8, 0, -1.3, 0, () => { swaDrum({ r: 2.35, h: 7.2, col: 0x8e6238 }); });
  // Overhead lyne-arm condenser pipe bridging the two vats
  beam('iron', [-2.8, 8.6, -1.3], [2.8, 7.6, -1.3], 0.16, jc(0xb47a3c, 0.05), true, 8);
  stLanding(0, 4.8, -1.3, 3.4, 1.8, { rail: 'fb', floor: 'grate' });
  ladder(0, 0, -0.35, 4.8, 0);
  // Front barrel-dispatch cabin
  box('conc', 0, 0, 2.3, 8.6, 0.22, 3.6, jc(0x948e82, 0.04));
  wallOpen('sheet', 0, 0.22, 4.05, 8.6, 2.9, 0.1, [{ x0: -1.1, x1: 0.1, y0: 0.22, y1: 2.25 }], jc(0x5c6c68, 0.05));
  sheetWall(-4.26, 0.22, 2.3, 3.6, 2.9, -PI / 2, { mat: 'corr' });
  sheetWall(4.26, 0.22, 2.3, 3.6, 2.9, PI / 2, { mat: 'corr' });
  leanRoof(0, 0.5, 9.0, 3.7, 3.6, 3.05, { posts: false });
  door(-0.5, 0.22, 4.08, 1.1, 2.0, { step: true });
  win(2.2, 1.2, 4.08, 1.2, 0.85, { lit: o.v === 1 });
  swaValveHeader(-2.8, 1.0, 4.12, 1.8, 0, 3);
  sock('awning', -0.5, 2.55, 4.12, 0, { w: 2.6, d: 1.3, drop: 0.45, h: 2.3 });
  sock('sign', 2.2, 2.65, 4.12, 0, { w: 2.5, h: 0.65 });
  barrel(-4.8, 0, 3.6); barrel(-4.2, 0, 4.1); barrel(4.8, 0, 3.7);
}

// 13. swa-drum-butcher (12 x 12 x 8, seed 6160)
defBuilding({
  key: 'swa-drum-butcher', name: 'Drum Butcher & Smokehouse', seed: 6160,
  tags: { type: ['shop', 'butcher'], size: 'medium', core: 'brine smokehouse drum', materials: ['rolled steel', 'plank', 'tile'] },
  w: 12, d: 12, h: 8, build: swmDrumButcher
});
function swmDrumButcher() {
  // Brine-tank smokehouse with conical louver stack + front butcher's counter & overhead meat-hook rail
  W(-2.1, 0, -1.2, 0, () => {
    swaDrum({ r: 2.6, h: 5.8, col: 0x6e4436, roofRise: 1.2, roofCol: 0x3e3632 });
    smokeAt(0, 7.3, 0, { r: 0.32, kind: 'stove' });
  });
  box('conc', 1.6, 0, 0.9, 5.8, 0.22, 5.8, jc(0x9a9488, 0.04));
  plankWall(1.6, 0.22, -1.95, 5.8, 2.9, PI);
  plankWall(4.45, 0.22, 0.9, 5.8, 2.9, PI / 2);
  leanRoof(1.6, -2.0, 6.1, 6.0, 3.6, 2.95, { col: 0x8e4232 });
  // Butcher's block counter & iron carcass rail
  box('conc', 1.2, 0.22, 3.4, 3.6, 0.95, 0.65, jc(0xb8b2a6, 0.04));
  box('wood', 1.2, 1.17, 3.4, 3.75, 0.09, 0.78, jc(0x7c583c, 0.05));
  entry(3.55, 0.22, 3.4, 1.1, 2.1);
  beam('iron', [-0.4, 2.65, 2.2], [3.6, 2.65, 2.2], 0.07, jc(0x36322e, 0.04));
  sock('awning', 1.6, 2.95, 3.85, 0, { w: 5.2, d: 1.5, drop: 0.5, h: 2.4 });
  sock('sign', 1.6, 3.45, 3.88, 0, { w: 2.6, h: 0.65 });
  barrel(-4.2, 0, 2.6); sacks(4.6, 0, 3.9, 3, -0.2);
}

// 14. swa-tank-bakery (14 x 12 x 8, seed 6170)
defBuilding({
  key: 'swa-tank-bakery', name: 'Tank Bakery', seed: 6170,
  tags: { type: ['shop', 'bakery'], size: 'medium', core: 'rotary kiln oven', materials: ['rolled steel', 'brick', 'plank'] },
  w: 14, d: 12, h: 8, build: swmTankBakery
});
function swmTankBakery(o) {
  // Brick-cradled horizontal rotary-kiln drum oven at back + warm bread counter across +z street front
  box('conc', 0, 0, -1.8, 9.6, 1.15, 3.8, jc(0x8c5640, 0.05));
  W(0, 0.85, -1.8, 0, () => {
    tankH({ r: 1.55, L: 8.6, col: 0x4e4640 });
  });
  for (const sx of [-2.6, 2.6]) {
    cyl('iron', sx, 4.1, -1.8, 0.24, 2.9, jc(0x3c3632, 0.04), 10);
    cone('iron', sx, 7.0, -1.8, 0.42, 0.32, jc(0x322e2a, 0.04), 10);
    smokeAt(sx, 7.45, -1.8, { r: 0.3, kind: 'stove' });
  }
  // Front bakehouse & street bread shelf
  box('conc', 0, 0, 1.85, 10.2, 0.22, 3.8, jc(0x9c968a, 0.04));
  wallOpen('plank', 0, 0.22, 3.7, 10.2, 2.85, 0.12, [{ x0: -4.1, x1: -2.9, y0: 0.22, y1: 2.25 }], jc(0x7c6246, 0.05));
  plankWall(-5.04, 0.22, 1.85, 3.8, 2.85, -PI / 2);
  plankWall(5.04, 0.22, 1.85, 3.8, 2.85, PI / 2);
  leanRoof(0, -0.1, 10.6, 4.0, 3.65, 3.0, { posts: false });
  door(-3.5, 0.22, 3.74, 1.1, 2.0, { step: true });
  win(0.2, 1.1, 3.74, 2.2, 0.95, { lit: true, shutters: false });
  win(3.3, 1.1, 3.74, 1.2, 0.95, { lit: o.v === 1 });
  box('wood', 0.2, 0.95, 4.05, 2.5, 0.1, 0.55, jc(0x8e6e48, 0.05)); // bread display shelf
  sock('awning', 0.4, 2.85, 3.78, 0, { w: 6.8, d: 1.5, drop: 0.5, h: 2.3 });
  sock('sign', -3.5, 3.15, 3.78, 0, { w: 2.4, h: 0.65 });
  sacks(-5.4, 0, 3.4, 5, 0.15); crate(5.4, 0, 3.5, 0.65, -0.2);
}

// 15. swa-drum-tavern (16 x 12 x 10, seed 6180)
defBuilding({
  key: 'swa-drum-tavern', name: 'Mash-Tun Tavern & Inn', seed: 6180,
  tags: { type: ['tavern', 'inn'], size: 'medium', core: 'wide mash-tun & bunk tank', materials: ['rolled steel', 'plank', 'steel grate'] },
  w: 16, d: 12, h: 10, build: swmDrumTavern
});
function swmDrumTavern() {
  // Wide 7.2 m diameter ground mash-tun taproom + upper horizontal bunkhouse tank + festooned drinking deck
  W(-2.0, 0, -0.7, 0, () => {
    swaDrum({ r: 3.6, h: 5.2, col: 0x7a4836 });
    W(0, 0, 3.63, 0, () => { door(0, 0.34, 0, 1.25, 2.15, { step: true, col: 0xc48c2c }); });
    for (const a of [-0.75, 0.75, 1.6, -1.6]) {
      W(Math.sin(a) * 3.63, 0, Math.cos(a) * 3.63, a, () => {
        win(0, 1.35, 0, 1.05, 0.95, { lit: true });
      });
    }
    // Upper bunk tank saddled over mash-tun roof
    W(0.5, 5.2, 0, 0, () => {
      tankH({ r: 1.55, L: 6.4, col: 0x52686c });
      W(0, 0, 1.58, 0, () => {
        porthole(-1.4, 1.55, 0, 0.36);
        porthole(1.4, 1.55, 0, 0.36);
      });
    });
  });
  // Right drinking veranda & stair up to bunk deck
  deck(4.1, 0.35, 0.8, 4.8, 6.2, { rail: ['f', 'r'], posts: false });
  stairs(4.1, 0, 4.3, 4.1, 0.35, 3.8, 1.4);
  tarp(4.1, 3.6, -2.1, 4.8, 5.8, 0.65);
  FURNISH('pa_tyre_table', 4.1, 0.35, 0.8, 0, { v: 1 });
  FURNISH('pa_tyre_chair', 3.1, 0.35, 0.8, PI / 2);
  FURNISH('pa_tyre_chair', 5.1, 0.35, 0.8, -PI / 2);
  stStairs(2.2, 0.35, -1.8, 1.2, 5.2, -1.8, 0.95);
  lamp(1.8, 0, 3.8, 3.5);
  sock('awning', -2.0, 2.85, 2.95, 0, { w: 3.2, d: 1.5, drop: 0.5, h: 2.4 });
  sock('sign', -2.0, 4.35, 2.98, 0, { w: 3.4, h: 0.85 });
  sock('banner', 6.3, 3.8, 3.85, 0, { w: 0.8, h: 2.3 });
  barrel(-6.2, 0, 2.2); barrel(-5.6, 0, 2.8);
}

// 16. swa-cutter-yard (16 x 12 x 9, seed 6190)
defBuilding({
  key: 'swa-cutter-yard', name: 'Salvage Cutter Yard', seed: 6190,
  tags: { type: ['workshop', 'salvage'], size: 'medium', core: 'A-frame gantry & drum crib', materials: ['iron girder', 'rolled steel', 'ancient panel'] },
  w: 16, d: 12, h: 9, build: swmCutterYard
});
function swmCutterYard(o) {
  // Drum tool-crib on right + heavy A-frame girder hoist over plate-cutting bed on left
  box('conc', -1.8, 0, 0, 9.4, 0.18, 9.2, jc(0x88847a, 0.05));
  entry(-1.8, 0.18, 4.4, 3.2, 2.6);
  W(4.6, 0, -1.4, 0, () => {
    swaDrum({ r: 2.35, h: 5.4, col: 0x5c6858 });
    W(0, 0, 2.38, 0, () => {
      door(0, 0.34, 0, 0.98, 1.98, { step: true });
      win(0, 3.1, 0, 0.85, 0.8, { lit: o.v === 1 });
    });
  });
  // A-frame gantry crane spanning x = -5.6 .. +0.8, height 7.8 m
  const gc = jc(0xb47c2c, 0.06), ic = jc(0x3e3834, 0.05);
  for (const gx of [-5.4, 0.6]) {
    beam('iron', [gx, 0.18, -3.4], [gx, 7.6, 0], 0.18, gc);
    beam('iron', [gx, 0.18, 3.4], [gx, 7.6, 0], 0.18, gc);
    beam('iron', [gx, 3.8, -1.7], [gx, 3.8, 1.7], 0.11, ic);
  }
  beam('iron', [-5.8, 7.6, 0], [1.0, 7.6, 0], 0.24, gc);
  // Chain block & suspended Ancient hull plate being oxy-cut
  beam('iron', [-2.4, 4.2, 0], [-2.4, 7.5, 0], 0.05, ic, true, 6);
  box('conc', -2.4, 2.2, 0, 3.2, 2.0, 0.16, jc(0xcfcac0, 0.03), 0.18);
  // Sorted plate racks at rear
  for (let i = 0; i < 4; i++) {
    box('sheet', -4.2 + i * 0.55, 0.18, -3.2, 0.08, 2.1, 2.4, jc(0xb8b4aa, 0.04), 0, 0, 0.12);
  }
  fenceRun(-6.6, -4.6, 6.6, -4.6, 1.8, { type: 'sheet' });
  sock('sign', -2.4, 7.85, 0.16, 0, { w: 3.2, h: 0.7 });
  sock('emblem', 4.6, 4.2, 1.0, 0, { w: 0.85, h: 0.85 });
  crate(3.2, 0, 3.2, 0.75, 0.1); barrel(2.2, 0, 3.5);
}

// 17. swa-weaver-drums (14 x 12 x 9, seed 6200)
defBuilding({
  key: 'swa-weaver-drums', name: 'Weaver & Tailor Drums', seed: 6200,
  tags: { type: ['workshop', 'textile'], size: 'medium', core: 'skylit aluminum silos', materials: ['galvanised sheet', 'glass', 'cloth'] },
  w: 14, d: 12, h: 9, build: swmWeaverDrums
});
function swmWeaverDrums(o) {
  for (const sx of [-1, 1]) {
    W(sx * 3.3, 0, -1.0, 0, () => {
      silo({ r: 2.5, h: 6.2, col: 0xb4b8b8, roofCol: 0x4e6c78 });
      // North-light / street sawtooth skylight cut onto upper drum crown
      dwHatch(0, 6.45, 0.8, 1.8, 1.2, 0.35, 'glass');
      W(0, 0, 2.53, 0, () => {
        if (sx < 0) door(0, 0.45, 0, 1.0, 2.0, { step: true });
        else win(0, 1.2, 0, 1.25, 1.0, { lit: true });
        win(0, 3.85, 0, 1.15, 0.95, { lit: o.v === 1 });
      });
    });
  }
  // Covered loom gallery linking both silos + cloth drying lines across forecourt
  box('plank', 0, 0, -1.0, 2.2, 5.4, 3.2, jc(0x745e46, 0.05));
  win(0, 1.3, 0.62, 1.2, 1.0, { lit: true });
  win(0, 3.8, 0.62, 1.2, 0.95, { lit: true });
  // Dyed cloth drying lines between front posts
  for (const sx of [-4.2, 4.2]) {
    beam('wood', [sx, 0, 3.8], [sx, 3.3, 3.8], 0.09, jc(0x5c4630, 0.05), true, 6);
  }
  beam('plain', [-4.2, 3.1, 3.8], [4.2, 3.1, 3.8], 0.015, jc(0x6a5a44, 0.04), true, 4);
  for (let i = 0; i < 5; i++) {
    const cx = -3.0 + i * 1.5;
    quad('cloth', cx, 2.45, 3.8, 1.05, 1.15, jc(pick([0x7a2432, 0xc89a34, 0x3b6e78, 0xd8d2c4]), 0.05));
  }
  sock('awning', -3.3, 2.75, 1.55, 0, { w: 2.4, d: 1.3, drop: 0.45, h: 2.3 });
  sock('sign', 0, 5.1, 0.66, 0, { w: 2.2, h: 0.6 });
  sacks(4.8, 0, 2.6, 4, 0.2);
}

// 18. swa-apothecary-pod (12 x 12 x 9, seed 6210)
defBuilding({
  key: 'swa-apothecary-pod', name: 'Apothecary Bioreactor Pod', seed: 6210,
  tags: { type: ['shop', 'apothecary', 'clinic'], size: 'medium', core: 'stainless bioreactor', materials: ['stainless steel', 'glass brick', 'ceramic'] },
  w: 12, d: 12, h: 9, build: swmApothecaryPod
});
function swmApothecaryPod() {
  W(-1.2, 0, -0.8, 0, () => {
    swaReactor({ r: 2.85, h: 6.9 });
    W(0, 0, 2.88, 0, () => {
      door(0, 0.42, 0, 1.0, 2.05, { step: true, col: 0x3a7870 });
      for (const a of [-0.68, 0, 0.68]) {
        W(Math.sin(a) * 0.1, 0, 0, a, () => { porthole(a * 2.1, 3.85, 0, 0.42); });
      }
    });
  });
  // Bottle-glass conservatory herb annex on +x side
  box('conc', 2.85, 0, -0.4, 3.2, 0.24, 5.2, jc(0xa6a094, 0.04));
  bottleWall(2.85, 0.24, 2.15, 3.2, 2.55, 0, { th: 0.28 });
  bottleWall(4.4, 0.24, -0.4, 5.2, 2.55, PI / 2, { th: 0.28 });
  plankWall(2.85, 0.24, -2.95, 3.2, 2.55, PI);
  leanRoof(2.85, -3.0, 3.4, 5.3, 3.25, 2.75, { mat: 'glass', col: 0x8ec2bc, posts: false });
  dwPlanter(2.9, 3.4);
  plant('shrub', 2.9, 0.5, 3.4, { r: 0.55, moisture: 'wet' });
  sock('awning', -1.2, 2.75, 2.12, 0, { w: 2.4, d: 1.3, drop: 0.45, h: 2.3 });
  sock('sign', -1.2, 5.2, 2.12, 0, { w: 2.2, h: 0.65 });
  sock('emblem', 2.85, 3.05, 2.25, 0, { w: 0.8, h: 0.6 });
}

// 29. swa-seed-silo (12 x 12 x 13, seed 6510 — Torus & SW seed/reagent vault)
defBuilding({
  key: 'swa-seed-silo', name: 'Tenders Seed & Reagent Silo', seed: 6510,
  tags: { type: ['granary', 'storage', 'reagents'], size: 'medium', core: 'double-jacketed stainless seed bin', materials: ['stainless steel', 'ceramic', 'steel grate'] },
  w: 12, d: 12, h: 13, build: swmSeedSilo
});
function swmSeedSilo() {
  // Elevated double-jacketed stainless cryo/desiccant seed silo + airlock assay porch
  W(0, 0, -0.8, 0, () => {
    swaReactor({ r: 3.1, h: 10.6 });
    // Cooling jacket fins on flanks
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.38;
      if (Math.cos(a) > 0.7) continue;
      W(Math.sin(a) * 3.16, 2.0, Math.cos(a) * 3.16, a, () => {
        box('steel', 0, 0, 0, 0.08, 6.6, 0.28, jc(0x9aa4a6, 0.04));
      });
    }
    stLanding(0, 5.8, 3.7, 3.2, 1.4, { rail: 'flr', floor: 'grate', posts: false });
    ladder(2.9, 0.4, 1.6, 5.6, 0.4);
  });
  //Sealed Ancient-panel airlock vestibule at +z
  box('conc', 0, 0, 3.2, 4.6, 0.3, 2.6, jc(0xbab4a8, 0.04));
  wallOpen('conc', 0, 0.3, 4.45, 4.6, 2.9, 0.18, [{ x0: -0.65, x1: 0.65, y0: 0.3, y1: 2.45 }], jc(0xd0ccc2, 0.03));
  box('conc', -2.2, 0.3, 3.2, 0.18, 2.9, 2.6, jc(0xc8c4ba, 0.03));
  box('conc', 2.2, 0.3, 3.2, 0.18, 2.9, 2.6, jc(0xc8c4ba, 0.03));
  box('steel', 0, 3.2, 3.2, 4.8, 0.18, 2.8, jc(0xa6aeb0, 0.04));
  door(0, 0.3, 4.5, 1.2, 2.1, { step: true, col: 0x3b726a });
  swaValveHeader(-3.4, 0.4, 2.2, 1.4, 0, 2);
  sock('sign', 0, 3.65, 4.56, 0, { w: 2.8, h: 0.65 });
  sock('emblem', 0, 8.4, 2.35, 0, { w: 1.1, h: 1.1 });
  crate(-3.8, 0, 3.6, 0.65, 0.1); sacks(3.7, 0, 3.6, 4, -0.2);
}

// 30. swa-cider-press (16 x 12 x 10, seed 6520 — Torus fruitvine cider-press & vat house)
defBuilding({
  key: 'swa-cider-press', name: 'Fruitvine Cider-Press & Vat House', seed: 6520,
  tags: { type: ['workshop', 'brewery', 'orchard'], size: 'medium', core: 'screw-press deck & cider vats', materials: ['rolled steel', 'timber', 'copper'] },
  w: 16, d: 12, h: 10, build: swmCiderPress
});
function swmCiderPress() {
  // Twin tall riveted cider-fermentation vats on left + elevated fruitvine basket-crush screw press on right + barrel ramp
  for (const sx of [-4.6, -0.8]) {
    W(sx, 0, -1.3, 0, () => {
      swaDrum({ r: 1.85, h: 7.8, col: 0x865234, roofCol: 0x56463c });
    });
  }
  beam('iron', [-4.6, 7.2, -1.3], [3.6, 5.2, -0.6], 0.14, jc(0xa87638, 0.05), true, 8); // juice must pipe
  // Timber & girder screw-press deck on right (+x)
  box('conc', 3.6, 0, -0.4, 6.2, 0.28, 7.4, jc(0x969084, 0.04));
  deck(3.6, 2.6, -0.8, 5.6, 5.2, { rail: ['b', 'r'], posts: true });
  // Giant timber screw-press frame & slatted fruit basket on deck
  cyl('plank', 3.6, 2.6, -0.8, 1.35, 1.65, jc(0x7c5234, 0.05), 14);
  for (const sx of [-1.55, 1.55]) {
    beam('wood', [3.6 + sx, 2.6, -0.8], [3.6 + sx, 6.4, -0.8], 0.2, jc(0x563e28, 0.05));
  }
  beam('wood', [1.85, 6.2, -0.8], [5.35, 6.2, -0.8], 0.24, jc(0x563e28, 0.05));
  cyl('iron', 3.6, 4.2, -0.8, 0.14, 2.4, jc(0x3e3834, 0.04), 8); // central press screw
  gableRoof(3.6, 6.5, -0.8, 6.0, 5.6, 1.6, { col: 0x6e7864 });
  // Lower cask cellar under press deck + barrel-rolling ramp at +z
  plankWall(3.6, 0.28, 1.75, 5.4, 2.2, 0);
  door(2.2, 0.28, 1.82, 1.15, 1.98, { step: true, col: 0x7c342a });
  stairs(5.4, 0, 4.4, 5.4, 2.6, 1.8, 1.25);
  // Cider casks lined along front ramp
  for (let i = 0; i < 3; i++) {
    cylH('plank', -4.4 + i * 1.45, 0.58, 2.8, 0.48, 1.05, jc(0x765236, 0.05), 'z', 12);
  }
  sock('awning', -2.7, 3.1, 1.2, 0, { w: 4.8, d: 2.2, drop: 0.55, h: 2.5 });
  sock('sign', 3.6, 6.35, 2.02, 0, { w: 3.4, h: 0.75 });
  sock('banner', 6.4, 5.8, 1.95, 0, { w: 0.75, h: 2.2 });
}
