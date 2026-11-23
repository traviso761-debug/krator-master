// prefix: swl
// ---------------------------------------------------------------- SW Arcology Class L & XL buildings (d = 18..24 m): 12 definitions
// Cloverleaf trisilo tenements, Horton-sphere manors, clarifier courts, barracks, granaries, ag-domes & bourse rotundas.

// 19. swa-trisilo-tenement (20 x 18 x 16, seed 6310)
defBuilding({
  key: 'swa-trisilo-tenement', name: 'Trisilo Tenement', seed: 6310,
  tags: { type: ['dwelling', 'tenement'], size: 'large', core: 'cloverleaf grain silos', materials: ['galvanised sheet', 'steel grate', 'plank'] },
  w: 20, d: 18, h: 16, build: swlTrisiloTenement
});
function swlTrisiloTenement(o) {
  const pods = [[-4.8, -2.2, 13.4, 0x9e4c30], [4.8, -2.2, 12.6, 0x4c6872], [0, -4.4, 13.8, 0x867042]];
  for (let i = 0; i < pods.length; i++) {
    const [px, pz, ph, rc] = pods[i];
    W(px, 0, pz, 0, () => {
      silo({ r: 3.3, h: ph, roofCol: rc });
      for (const lv of [1, 2, 3]) {
        const y = lv * 3.25 + 0.4;
        for (const a of [-0.75, 0, 0.75, PI]) {
          W(Math.sin(a) * 3.33, 0, Math.cos(a) * 3.33, a, () => {
            win(0, y, 0, 0.85, 0.88, { lit: (lv + i + (o.v === 1 ? 1 : 0)) % 2 === 0 });
          });
        }
      }
    });
  }
  // Central open steel stair & balcony core in front court (+z)
  box('conc', 0, 0, 1.8, 8.8, 0.25, 5.2, jc(0x948e82, 0.04));
  W(-4.8, 0, 1.15, 0, () => { door(0, 0.45, 0, 1.05, 2.05, { step: true }); });
  W(4.8, 0, 1.15, 0, () => { door(0, 0.45, 0, 1.05, 2.05, { step: true }); });
  for (const y of [3.65, 6.9, 10.15]) {
    stLanding(0, y, 1.6, 8.2, 2.6, { rail: 'flr', floor: 'grate' });
    W(0, 0, -1.05, 0, () => { door(0, y, 0, 0.92, 1.92, { step: false }); });
  }
  stStairs(-2.6, 0.25, 5.6, -2.6, 3.65, 2.9, 1.15);
  stStairs(2.6, 3.65, 2.9, 2.6, 6.9, 0.3, 1.05);
  stStairs(-2.6, 6.9, 0.3, -2.6, 10.15, 2.9, 1.05);
  sock('awning', -4.8, 2.8, 1.18, 0, { w: 2.6, d: 1.4, drop: 0.5, h: 2.4 });
  sock('awning', 4.8, 2.8, 1.18, 0, { w: 2.6, d: 1.4, drop: 0.5, h: 2.4 });
  sock('banner', -4.0, 10.1, 2.95, 0, { w: 0.85, h: 2.8 });
  sock('banner', 4.0, 10.1, 2.95, 0, { w: 0.85, h: 2.8 });
  sock('emblem', 0, 12.2, -1.06, 0, { w: 1.3, h: 1.3 });
  lamp(-6.8, 0, 5.4, 3.6); lamp(6.8, 0, 5.4, 3.6);
  barrel(-7.4, 0, 3.2); waterButt(7.4, 1.2, 2.8, 0.6, 1.0);
}

// 20. swa-sphere-manor (20 x 18 x 15, seed 6320)
defBuilding({
  key: 'swa-sphere-manor', name: 'Horton-Sphere Manor', seed: 6320,
  tags: { type: ['dwelling', 'manor'], size: 'large', core: 'Horton sphere pressure tank', materials: ['stainless steel', 'ceramic bulkhead', 'steel grate'] },
  w: 20, d: 18, h: 15, build: swlSphereManor
});
function swlSphereManor() {
  // Walled salvage compound below + 9.2 m diameter Horton sphere residence perched at y = 8.4 m
  W(0, 0, -0.6, 0, () => {
    swaSphere({ r: 4.6, cy: 8.4, legs: 6 });
    // Equatorial viewing gallery & ribbon portholes around the sphere
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      W(Math.sin(a) * 4.58, 8.4, Math.cos(a) * 4.58, a, () => {
        porthole(0, 0.25, 0, 0.48);
      });
    }
    stLanding(0, 5.2, 3.8, 4.6, 2.0, { rail: 'flr', floor: 'plate' });
    door(0, 5.2, 2.75, 1.05, 2.0, { step: false, col: 0x6a2434 });
  });
  // Ground reception hall & walled forecourt with Ancient bulkhead portal
  box('conc', 0, 0, 0.4, 15.6, 0.28, 12.8, jc(0x9c968a, 0.04));
  W(0, 0.28, 6.4, 0, () => { bulkhead({ w: 8.6, h: 4.2, th: 0.65, hatch: 'door' }); });
  door(0, 0.58, 6.75, 1.5, 2.6, { step: true, col: 0x5e1e2d });
  fenceRun(-7.8, 6.4, -4.4, 6.4, 2.4, { type: 'sheet' });
  fenceRun(4.4, 6.4, 7.8, 6.4, 2.4, { type: 'sheet' });
  fenceRun(-7.8, -6.2, -7.8, 6.4, 2.4, { type: 'sheet' });
  fenceRun(7.8, -6.2, 7.8, 6.4, 2.4, { type: 'sheet' });
  stStairs(-3.4, 0.28, 4.8, -1.8, 5.2, 3.2, 1.15);
  sock('banner', -3.8, 4.1, 6.82, 0, { w: 0.85, h: 2.5 });
  sock('banner', 3.8, 4.1, 6.82, 0, { w: 0.85, h: 2.5 });
  sock('emblem', 0, 10.6, 3.85, 0, { w: 1.4, h: 1.4 });
  lamp(-5.6, 0, 7.2, 3.6); lamp(5.6, 0, 7.2, 3.6);
}

// 21. swa-clarifier-court (24 x 18 x 12, seed 6330)
defBuilding({
  key: 'swa-clarifier-court', name: 'Clarifier Cistern Court', seed: 6330,
  tags: { type: ['dwelling', 'courtyard'], size: 'large', core: 'concrete clarifier basin', materials: ['concrete', 'rolled steel', 'plank'] },
  w: 24, d: 18, h: 12, build: swlClarifierCourt
});
function swlClarifierCourt(o) {
  // Concrete circular clarifier wall with 4 drum-cabins perched around its rim + central cistern walkway
  W(0, 0, -0.3, 0, () => {
    swaClarifier({ R: 7.4, wallH: 2.6, gap: 0.34 });
    entry(0, 0.16, 7.2, 2.4, 2.4);
    // Steel rotary-scraper truss repurposed as courtyard footbridge to central wellhead
    stLanding(0, 2.65, 3.4, 1.8, 6.8, { rail: 'lr', posts: false });
    // 4 drum dwellings perched on the clarifier rim
    const angs = [-2.25, -0.95, 0.95, 2.25];
    for (let i = 0; i < angs.length; i++) {
      const a = angs[i], cx = Math.sin(a) * 6.8, cz = Math.cos(a) * 6.8;
      W(cx, 2.6, cz, a + PI, () => {
        swaDrum({ r: 2.25, h: 6.4 });
        W(0, 0, 2.28, 0, () => {
          door(0, 0.34, 0, 0.92, 1.92, { step: false });
          win(0, 3.45, 0, 0.85, 0.82, { lit: (i + (o.v === 1 ? 1 : 0)) % 2 === 0 });
        });
      });
    }
    // Rim ring-walk connecting all 4 drum cabins + twin stairs from street
    for (const sx of [-1, 1]) {
      stStairs(sx * 4.2, 0, 7.6, sx * 5.2, 2.6, 5.2, 1.15);
    }
  });
  sock('banner', -3.2, 4.6, 7.1, 0, { w: 0.8, h: 2.3 });
  sock('banner', 3.2, 4.6, 7.1, 0, { w: 0.8, h: 2.3 });
  sock('emblem', 0, 3.2, 0.95, 0, { w: 1.0, h: 1.0 });
  barrel(-8.8, 0, 4.8); waterButt(8.8, 1.2, 4.6, 0.6, 1.0);
}

// 22. swa-tank-barracks (26 x 18 x 11, seed 6340)
defBuilding({
  key: 'swa-tank-barracks', name: 'Auxiliary Tank Barracks', seed: 6340,
  tags: { type: ['military', 'barracks'], size: 'large', core: 'paired heavy oil tanks', materials: ['rolled steel', 'basalt', 'steel grate'] },
  w: 26, d: 18, h: 11, build: swlTankBarracks
});
function swlTankBarracks() {
  // Gravel muster strip behind low basalt parapet + 2 heavy two-deck horizontal fuel-tank bunkhouses + watch cupola
  box('conc', 0, 0, 0, 23.6, 0.22, 15.6, jc(0x888278, 0.05));
  for (const sx of [-6.8, 6.8]) {
    // Ground stone/steel plinth + long cylindrical bunk tank
    box('conc', sx, 0.22, -2.2, 9.4, 3.1, 6.2, jc(0x7c766c, 0.04));
    door(sx - 2.2, 0.22, 0.92, 1.1, 2.05, { step: true, col: 0x5e1e2d });
    win(sx + 1.8, 1.25, 0.92, 1.4, 0.85, { lit: true, bars: true });
    W(sx, 3.32, -2.2, 0, () => {
      tankH({ r: 2.35, L: 9.2, col: 0x545858 });
      for (const px of [-2.6, 0, 2.6]) {
        W(px, 2.35, 2.38, 0, () => { porthole(0, 0, 0, 0.42); });
      }
    });
  }
  // Central guardhouse gate & muster bell-post
  W(0, 0.22, -2.2, 0, () => {
    swaDrum({ r: 2.3, h: 8.6, col: 0x484440, roofCol: 0x5e1e2d });
    W(0, 0, 2.33, 0, () => { door(0, 0.34, 0, 1.2, 2.15, { step: true, col: 0x6a2434 }); });
  });
  stLanding(0, 3.35, 1.2, 16.4, 1.8, { rail: 'f', floor: 'grate' });
  stStairs(0, 0.22, 4.6, 0, 3.35, 2.1, 1.35);
  // Front muster wall leaving 5 m parade gate
  box('conc', -7.6, 0.22, 7.2, 7.6, 1.45, 0.45, jc(0x4a4640, 0.04));
  box('conc', 7.6, 0.22, 7.2, 7.6, 1.45, 0.45, jc(0x4a4640, 0.04));
  entry(0, 0.22, 7.2, 4.2, 2.6);
  sock('banner', -3.4, 4.2, 7.35, 0, { w: 0.9, h: 2.6 });
  sock('banner', 3.4, 4.2, 7.35, 0, { w: 0.9, h: 2.6 });
  sock('emblem', 0, 6.8, 0.16, 0, { w: 1.3, h: 1.3 });
  lamp(-4.2, 0, 7.5, 3.8); lamp(4.2, 0, 7.5, 3.8);
}

// 23. swa-silo-granary (24 x 18 x 16, seed 6350)
defBuilding({
  key: 'swa-silo-granary', name: 'Six-Cell Silo Granary', seed: 6350,
  tags: { type: ['granary', 'mill', 'storage'], size: 'large', core: 'six-cell grain battery', materials: ['galvanised sheet', 'iron girder', 'concrete'] },
  w: 24, d: 18, h: 16, build: swlSiloGranary
});
function swlSiloGranary() {
  box('conc', 0, 0, -0.6, 21.6, 0.38, 14.4, jc(0x9a9488, 0.04));
  // 2x3 battery of corrugated grain bins + top conveyor headhouse + front loading chute over wagon bay
  for (const sx of [-6.4, 0, 6.4]) {
    for (const sz of [-3.8, 1.6]) {
      W(sx, 0.38, sz, 0, () => {
        silo({ r: 2.85, h: 11.4, roofCol: 0x8c5634 });
      });
    }
  }
  // Bucket-elevator headhouse bridging across the 3 front silos up to 15.4 m
  box('corr', 0, 12.1, -1.1, 16.8, 2.6, 3.2, jc(0xa6aaa8, 0.04));
  gableRoof(0, 14.7, -1.1, 17.2, 3.4, 0.85, { col: 0x7c4830 });
  // Front weigh-office & inclined grain-loading chute at +z
  box('plank', -3.2, 0.38, 5.6, 6.8, 2.9, 2.6, jc(0x6e5840, 0.05));
  leanRoof(-3.2, 4.3, 7.2, 2.8, 3.65, 3.15, { posts: false });
  door(-3.2, 0.38, 6.92, 1.15, 2.05, { step: true });
  win(-0.9, 1.35, 6.92, 1.2, 0.85, { lit: true });
  beam('iron', [3.2, 7.6, 4.2], [5.4, 3.4, 6.6], 0.38, jc(0x56524c, 0.05), true, 10); // grain loading spout
  ladder(9.35, 0.38, 1.6, 11.8, PI / 2);
  sock('awning', -3.2, 2.95, 6.96, 0, { w: 3.4, d: 1.4, drop: 0.45, h: 2.3 });
  sock('sign', 0, 13.4, 0.55, 0, { w: 5.2, h: 1.0 });
  sock('emblem', 6.4, 9.2, 4.48, 0, { w: 1.2, h: 1.2 });
  sacks(3.6, 0.38, 6.2, 6, 0.15); sacks(5.2, 0.38, 6.0, 5, -0.2);
}

// 24. swa-drum-warehouse (26 x 18 x 11, seed 6360)
defBuilding({
  key: 'swa-drum-warehouse', name: 'Tank-Plate Bonded Warehouse', seed: 6360,
  tags: { type: ['warehouse', 'storage'], size: 'large', core: 'flattened tank-plate vault', materials: ['rolled steel', 'shipping container', 'iron girder'] },
  w: 26, d: 18, h: 11, build: swlDrumWarehouse
});
function swlDrumWarehouse() {
  // Raised concrete loading dock + triple-vaulted curved tank-plate storehouse + twin sliding bulkhead doors + jib crane
  box('conc', 0, 0, -0.4, 23.4, 0.65, 14.8, jc(0x928c80, 0.04));
  box('corr', 0, 0.65, -1.2, 21.6, 6.8, 11.6, jc(0x6e7472, 0.05));
  // 3 barrel-vault tank-shell roof bays along x
  for (const bx of [-7.0, 0, 7.0]) {
    cylH('sheet', bx, 7.45, -1.2, 3.6, 11.8, jc(0x887c6e, 0.05), 'z', 16, true);
  }
  // Twin heavy sliding steel cargo doors & tally clerk door on front loading dock
  for (const dx of [-5.8, 5.8]) {
    box('iron', dx, 0.65, 4.65, 4.2, 3.8, 0.16, jc(0x3e3a36, 0.04));
    box('sheet', dx, 0.72, 4.72, 3.9, 3.6, 0.08, jc(0x8a5234, 0.05));
    beam('iron', [dx - 2.6, 4.55, 4.78], [dx + 2.6, 4.55, 4.78], 0.14, jc(0x322e2a, 0.04));
  }
  door(0, 0.65, 4.66, 1.15, 2.1, { step: false, col: 0x3b6e78 });
  stairs(0, 0, 7.6, 0, 0.65, 6.8, 2.2);
  // Jib crane at right dock corner
  beam('iron', [9.8, 0.65, 5.8], [9.8, 8.8, 5.8], 0.22, jc(0xb47c2c, 0.05));
  beam('iron', [9.8, 8.6, 5.8], [6.8, 8.6, 7.2], 0.16, jc(0xb47c2c, 0.05));
  beam('iron', [9.8, 6.8, 5.8], [7.4, 8.6, 6.9], 0.09, jc(0x3e3834, 0.04));
  sock('sign', 0, 5.6, 4.72, 0, { w: 5.4, h: 0.95 });
  sock('banner', -10.2, 6.8, 4.75, 0, { w: 0.85, h: 2.6 });
  sock('banner', 10.2, 6.8, 4.75, 0, { w: 0.85, h: 2.6 });
  pallet(-5.8, 0.65, 5.8, 1.2, 1.0, 0.1); crate(5.6, 0.65, 5.9, 0.8, -0.15); barrel(7.2, 0.65, 5.7);
}

// 25. swa-bath-boilers (22 x 18 x 11, seed 6370)
defBuilding({
  key: 'swa-bath-boilers', name: 'Steam-Boiler Bathhouse', seed: 6370,
  tags: { type: ['civic', 'bathhouse'], size: 'large', core: 'steam boilers & settling drums', materials: ['rolled steel', 'ceramic', 'iron pipe'] },
  w: 22, d: 18, h: 11, build: swlBathBoilers
});
function swlBathBoilers() {
  // Plastered bath hall + 2 elevated horizontal steam boilers on roof + rear greywater settling drums + steam stacks
  box('conc', -1.4, 0, 0.4, 15.2, 0.32, 12.6, jc(0xa8a296, 0.04));
  box('conc', -1.4, 0.32, 0.4, 14.6, 5.2, 11.8, jc(0xc4beb2, 0.04));
  door(-1.4, 0.32, 6.32, 1.5, 2.35, { step: true, col: 0x3b6e78 });
  for (const wx of [-6.2, -3.8, 1.0, 3.4]) {
    porthole(wx, 3.4, 6.32, 0.48);
  }
  // Twin horizontal steam boilers mounted on bathhouse roof + stacks
  for (const bx of [-4.4, 1.6]) {
    W(bx, 5.52, 0.2, 0, () => {
      tankH({ r: 1.55, L: 6.8, col: 0x525a5c });
    });
    cyl('iron', bx, 8.8, -0.8, 0.28, 1.8, jc(0x3e3834, 0.04), 10);
    smokeAt(bx, 10.7, -0.8, { r: 0.38, kind: 'stove' });
  }
  // Side greywater settling drums & header manifold on +x
  for (const sz of [-2.6, 2.4]) {
    W(8.2, 0, sz, 0, () => { swaDrum({ r: 1.85, h: 4.8, col: 0x5c7274 }); });
  }
  swaValveHeader(6.1, 1.2, 4.8, 2.2, 0, 3);
  sock('awning', -1.4, 3.1, 6.38, 0, { w: 4.4, d: 1.8, drop: 0.55, h: 2.5 });
  sock('sign', -1.4, 4.65, 6.38, 0, { w: 4.2, h: 0.8 });
  sock('emblem', 3.4, 4.65, 6.38, 0, { w: 0.95, h: 0.95 });
}

// 26. swa-beetle-kraal (26 x 18 x 9, seed 6380)
defBuilding({
  key: 'swa-beetle-kraal', name: 'Draft-Beetle Kraal & Feed Silos', seed: 6380,
  tags: { type: ['stable', 'livestock'], size: 'large', core: 'curved tank-plate kraal & hoppers', materials: ['rolled steel', 'timber', 'corrugated sheet'] },
  w: 26, d: 18, h: 9, build: swlBeetleKraal
});
function swlBeetleKraal() {
  // Semicircular riveted tank-plate kraal wall + covered beetle stalls at rear + twin feed hoppers on flank
  box('earth', -1.8, 0, 0.4, 18.6, 0.14, 14.4, jc(0x8e7c64, 0.05));
  sector('sheet', -1.8, 1.2, 6.8, 7.15, PI * 0.62, PI * 2.38, 0.14, 2.35, jc(0x745842, 0.05));
  entry(-1.8, 0.14, 7.2, 3.8, 2.5);
  // Rear vaulted shelter stalls for giant draft beetles / elephant bugs
  box('plank', -1.8, 0.14, -4.8, 14.6, 3.8, 4.8, jc(0x68523c, 0.05));
  leanRoof(-1.8, -7.2, 15.2, 5.4, 4.85, 3.85, { col: 0x7c6e58 });
  // Twin conical feed hoppers on right (+x)
  for (const sz of [-3.2, 2.2]) {
    W(9.2, 0, sz, 0, () => { swaHopper({ r: 2.1, legH: 2.6, bodyH: 3.1 }); });
  }
  // Watering half-tank trough in yard
  cylH('iron', -5.4, 0.55, 2.2, 0.65, 3.6, jc(0x4c585a, 0.05), 'x', 12);
  sock('sign', -1.8, 4.35, -2.35, 0, { w: 4.2, h: 0.75 });
  sock('banner', -5.6, 3.8, 6.8, 0, { w: 0.8, h: 2.2 });
  sacks(6.2, 0, 4.8, 5, 0.2); barrel(5.2, 0, 5.2);
}

// 31. swa-herb-dome (20 x 18 x 11, seed 6530 — Tenders' preserved Ancient botanical ag-dome)
defBuilding({
  key: 'swa-herb-dome', name: 'Tenders Botanical Ag-Dome', seed: 6530,
  tags: { type: ['agricultural', 'apothecary', 'conservatory'], size: 'large', core: 'geodesic polycarbonate ag-dome', materials: ['glass', 'stainless steel', 'ancient ceramic'] },
  w: 20, d: 18, h: 11, build: swlHerbDome
});
function swlHerbDome() {
  W(-0.8, 0, -0.5, 0, () => {
    swaGeoDome({ R: 7.4, ringH: 1.6, domeH: 6.8 });
    // Airlock conservatory vestibule protruding to +z
    box('conc', 0, 0, 7.6, 3.8, 0.24, 2.4, jc(0xc8c4ba, 0.03));
    wallOpen('conc', 0, 0.24, 8.75, 3.8, 2.75, 0.16, [{ x0: -0.65, x1: 0.65, y0: 0.24, y1: 2.35 }], jc(0xd6d2c8, 0.03));
    box('glass', -1.85, 0.24, 7.6, 0.08, 2.75, 2.2, jc(0x9ac6c0, 0.04));
    box('glass', 1.85, 0.24, 7.6, 0.08, 2.75, 2.2, jc(0x9ac6c0, 0.04));
    box('steel', 0, 2.99, 7.6, 4.0, 0.16, 2.6, jc(0xb2b8b8, 0.04));
    door(0, 0.24, 8.8, 1.2, 2.05, { step: true, col: 0x3b786c });
    sock('sign', 0, 3.38, 8.86, 0, { w: 2.8, h: 0.6 });
  });
  // Side nutrient/mist header drum & valve bank on +x
  W(7.5, 0, -2.2, 0, () => {
    swaReactor({ r: 1.55, h: 5.8 });
  });
  beam('iron', [6.0, 2.4, -2.2], [4.8, 1.2, -1.8], 0.11, jc(0x526466, 0.04), true, 8);
  swaValveHeader(7.2, 0.3, 1.2, 1.6, 0, 3);
  sock('emblem', 7.5, 4.2, -0.62, 0, { w: 0.85, h: 0.85 });
}

// 27. swa-salvage-foundry (30 x 22 x 14, seed 6410)
defBuilding({
  key: 'swa-salvage-foundry', name: 'Rotary Salvage Foundry', seed: 6410,
  tags: { type: ['industrial', 'foundry', 'smelter'], size: 'xlarge', core: 'tilted rotary furnace & crane hall', materials: ['rolled steel', 'iron girder', 'basalt'] },
  w: 30, d: 22, h: 14, build: swlSalvageFoundry
});
function swlSalvageFoundry() {
  // Heavy basalt-and-concrete casting floor + inclined rotary smelter shell + overhead bridge crane + twin tall stacks
  box('conc', 0, 0, 0, 27.6, 0.38, 19.4, jc(0x7c766c, 0.05));
  // Smelter hall on left (-x)
  box('corr', -6.8, 0.38, -2.4, 12.2, 8.2, 12.4, jc(0x4e4842, 0.05));
  gableRoof(-6.8, 8.58, -2.4, 12.8, 12.8, 1.9, { col: 0x6c4230 });
  door(-6.8, 0.38, 3.84, 1.6, 2.4, { step: true, col: 0x7c3828 });
  for (const sx of [-9.4, -4.2]) {
    cyl('iron', sx, 9.8, -4.8, 0.55, 3.6, jc(0x36322e, 0.04), 14);
    cone('iron', sx, 13.4, -4.8, 0.82, 0.45, jc(0x2a2624, 0.04), 14);
    smokeAt(sx, 13.9, -4.8, { r: 0.65, kind: 'forge' });
  }
  // Inclined rotary furnace drum feeding slag/casting ladle pit on right (+x)
  W(4.8, 3.4, -2.6, 0, () => {
    box('conc', -3.2, -3.02, 0, 1.4, 3.0, 2.6, jc(0x686258, 0.04));
    box('conc', 3.2, -3.02, 0, 1.4, 2.4, 2.6, jc(0x686258, 0.04));
    W(0, 0, 0, 0, () => {
      cylH('sheet', 0, 0, 0, 1.95, 9.8, jc(0x48423c, 0.05), 'x', 18, true);
      cylH('iron', -2.4, 0, 0, 2.12, 0.35, jc(0x2e2a26, 0.04), 'x', 18);
      cylH('iron', 2.4, 0, 0, 2.12, 0.35, jc(0x2e2a26, 0.04), 'x', 18);
    });
  });
  // Glowing molten pour at mouth of rotary kiln (+x end)
  cone('glow', 9.8, 0.38, -2.6, 0.85, 1.4, jc(0xff7420, 0.03), 10);
  cyl('iron', 9.8, 0.38, -2.6, 1.15, 1.1, jc(0x322e2a, 0.04), 14);
  // Overhead girder crane spanning right yard
  const gc = jc(0xb47828, 0.05);
  for (const gx of [0.4, 12.4]) {
    for (const gz of [-7.6, 6.8]) beam('iron', [gx, 0.38, gz], [gx, 9.6, gz], 0.24, gc);
    beam('iron', [gx, 9.6, -7.8], [gx, 9.6, 7.0], 0.24, gc);
  }
  beam('iron', [0.2, 9.85, 1.4], [12.6, 9.85, 1.4], 0.28, gc);
  sock('sign', -6.8, 6.8, 3.9, 0, { w: 6.2, h: 1.1 });
  sock('banner', 0.4, 8.8, 7.05, 0, { w: 0.95, h: 2.8 });
  sock('emblem', -6.8, 4.4, 3.9, 0, { w: 1.3, h: 1.3 });
  junkPile(6.4, 5.6, 1.4, 8); barrel(11.4, 0.38, 5.2);
}

// 28. swa-bourse-rotunda (28 x 24 x 13, seed 6420)
defBuilding({
  key: 'swa-bourse-rotunda', name: 'Petroleum-Tank Bourse Rotunda', seed: 6420,
  tags: { type: ['civic', 'market', 'bourse'], size: 'xlarge', core: 'cut 22 m petroleum storage tank', materials: ['rolled steel', 'iron girder', 'ancient panel'] },
  w: 28, d: 24, h: 13, build: swlBourseRotunda
});
function swlBourseRotunda() {
  // Cut-down 20 m diameter petroleum tank shell with 4 cardinal portals, radial truss clerestory roof & central weighbridge
  const R = 9.8, wallH = 5.6;
  cyl('conc', 0, 0, 0, R + 0.8, 0.35, jc(0x9e988c, 0.04), 28);
  // 4 arc wall segments leaving N/S/E/W bourse gates open
  const g = 0.24;
  for (let q = 0; q < 4; q++) {
    const a0 = q * (PI / 2) + g, a1 = (q + 1) * (PI / 2) - g;
    sector('sheet', 0, 0, R - 0.25, R, a0, a1, 0.35, wallH, jc(0x6c7270, 0.05));
    sector('iron', 0, 0, R - 0.3, R + 0.08, a0, a1, 0.35 + wallH, 0.22, jc(0x3e3a36, 0.04));
  }
  entry(0, 0.35, R, 3.8, 3.4);
  // Radial steel roof trusses rising to glazed clerestory lantern (top ~12.4 m)
  const rc = jc(0x4a443e, 0.05);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    beam('iron', [Math.cos(a) * R, 0.35 + wallH, Math.sin(a) * R], [Math.cos(a) * 2.8, 9.8, Math.sin(a) * 2.8], 0.16, rc);
  }
  cyl('sheet', 0, 0.35 + wallH + 0.1, 0, R + 0.4, 3.7, jc(0x885838, 0.05), 20, 2.9);
  cyl('glass', 0, 9.8, 0, 2.85, 1.45, jc(0xe8cd86, 0.04), 14);
  cone('steel', 0, 11.25, 0, 3.3, 1.25, jc(0x5c686a, 0.05), 14);
  // Central assay weighbridge & scale dais inside rotunda
  box('steel', 0, 0.35, 0, 5.2, 0.18, 5.2, jc(0x6e6c66, 0.04));
  cyl('iron', 0, 0.53, -1.8, 0.22, 2.4, rc, 10);
  tire(0, 2.75, -1.65, 0.55, 0.07, jc(0xc89a34, 0.04), 0, PI / 2, 0);
  sock('awning', 0, 4.2, R + 0.1, 0, { w: 5.4, d: 1.8, drop: 0.55, h: 2.8 });
  sock('sign', 0, 5.3, R + 0.15, 0, { w: 5.6, h: 0.95 });
  sock('banner', -3.2, 5.6, R + 0.2, 0, { w: 0.9, h: 2.8 });
  sock('banner', 3.2, 5.6, R + 0.2, 0, { w: 0.9, h: 2.8 });
  lamp(-4.8, 0, R + 0.8, 3.8); lamp(4.8, 0, R + 0.8, 3.8);
}

// 32. swa-feral-dome (22 x 20 x 11, seed 6540 — Quarantined Cataclysm-cracked feral ag-dome)
defBuilding({
  key: 'swa-feral-dome', name: 'Quarantined Feral Ag-Dome', seed: 6540,
  tags: { type: ['ruin', 'quarantined', 'hazard'], size: 'xlarge', core: 'breached geodesic ag-dome', materials: ['cracked glass', 'welded bulkhead', 'barbed wire'] },
  w: 22, d: 20, h: 11, build: swlFeralDome
});
function swlFeralDome() {
  W(0, 0, -0.4, 0, () => {
    swaFeralDome({ R: 8.2, ringH: 1.75, domeH: 6.8 });
    // Welded-shut Ancient bulkhead airlock with cross-braced iron I-beams barring entry
    W(0, 0, 8.2, 0, () => {
      bulkhead({ w: 4.8, h: 3.6, th: 0.65, hatch: 'round' });
      beam('iron', [-1.8, 0.5, 0.42], [1.8, 3.1, 0.42], 0.16, jc(0x7c3224, 0.05));
      beam('iron', [-1.8, 3.1, 0.42], [1.8, 0.5, 0.42], 0.16, jc(0x7c3224, 0.05));
      entry(0, 0, 0.65, 1.4, 2.0); // sealed inspection threshold
    });
  });
  // Barbed quarantine perimeter fence corners
  fenceRun(-9.4, 8.4, -3.2, 8.4, 1.9, { barbed: true });
  fenceRun(3.2, 8.4, 9.4, 8.4, 1.9, { barbed: true });
  sock('sign', 0, 3.85, 8.3, 0, { w: 3.6, h: 0.75 });
  sock('emblem', -4.2, 2.2, 8.45, 0, { w: 0.9, h: 0.9 });
  sock('emblem', 4.2, 2.2, 8.45, 0, { w: 0.9, h: 0.9 });
}
