// ================================================================= TORUS — 99: KHOST Integration, Walk, Doors, Hazards, Cutaway, SIM, Minimap & Export ([web])
// Connects Torus's Stage 4-6 3D world (Forest Ring, Hanging Fruitvines, 10 Stepped Terraces, Tenders & Quarantined Ag-Domes,
// SE Voth Extension, Soleri Hinterlands, KWALK, KDOORHOST, KFURN, KHAZ, 5-unit cutaway, 8,500-resident SIM, Multi-Altitude Deck Minimap, KCITY, and TORUS_EXPORT) to core/host.

function torusLmAt(id) {
  for (let i = 0; i < TORUS_PLAN.landmarks.length; i++) {
    if (TORUS_PLAN.landmarks[i].id === id) return TORUS_PLAN.landmarks[i];
  }
  return { x: 0, y: 0, z: 0, ry: 0, w: 40, d: 40 };
}

const VIEWS = (function () {
  const board = torusLmAt('lm_boardhall');
  const emis = torusLmAt('lm_emissary');
  const ord = torusLmAt('lm_ordinators');
  const cider = torusLmAt('lm_ciderhall');
  const amber = torusLmAt('dome_ancient_medical');
  const amberR = Math.hypot(amber.x, amber.z) == null || Math.hypot(amber.x, amber.z) === 0 ? 1 : Math.hypot(amber.x, amber.z);
  const amberUx = amber.x / amberR, amberUz = amber.z / amberR;
  const feral = TORUS_PLAN.feralDomes[0] || { x: -350, y: 39, z: 220 };
  const hubNe = (TORUS_PLAN.hinterland && TORUS_PLAN.hinterland.soleriHubs[0]) || { x: 1450, z: -1150 };
  const hubSw = (TORUS_PLAN.hinterland && TORUS_PLAN.hinterland.soleriHubs[2]) || { x: -1900, z: -1180 };
  const gt0 = TORUS_PLAN.gates[0] || { x: 1140, y: 1, z: 0 };
  const cb = Math.cos(board.ry), sb = Math.sin(board.ry);
  const cc = Math.cos(cider.ry), sc = Math.sin(cider.ry);

  return {
    '1. Grand Torus Overview (Forest Ring, 10 Stepped Terraces & Hinterlands)': [-1280, 620, 1340, 0, 175, 0],
    '2. Hanging Fruitvines & Tethered Harvesters on Wheel Rims (WY=300m)': [-770, 268, 480, -585, 248, 355],
    '3. Close-Up - Suspended Tethered Fruitvine Harvesters & Gondolas': [-735, 286, 405, -662, 276, 362],
    '4. Great Cider-Press & Wheel Town (WY=300m)': [cider.x - 115, 348, cider.z - 92, cider.x, 304, cider.z],
    '5. Great Cider-Press Crush Floor & Rim Winches': [cider.x + sc * 34, 316, cider.z + cc * 34, cider.x - sc * 12, 301, cider.z - cc * 12],
    '6. Stepped Agricultural Terraces (T1 +44m to T10 +1m) & Board Hall': [board.x - 135, board.y + 56, board.z - 125, board.x, board.y + 8, board.z],
    '7. Board Hall Assize Rotunda & Botanical Archive': [board.x + sb * 42, board.y + 22, board.z + cb * 42, board.x - sb * 12, board.y + 3, board.z - cb * 12],
    '8. Tenders Out-of-Zone & Unique Amber-Sap Sanctuary Ag-Domes': [amber.x + amberUx * 88 - amberUz * 44, amber.y + 36, amber.z + amberUz * 88 + amberUx * 44, amber.x, amber.y + 6, amber.z],
    '9. Quarantined Feral Ag-Domes (Welded Bulkheads & Spore Canopy)': [feral.x + 54, feral.y + 28, feral.z + 52, feral.x, feral.y + 5, feral.z],
    '10. SE Scrap Voth Extension, Vothic Emissary & Ordinator Palace': [emis.x + 150, emis.y + 72, emis.z + 135, 0.5 * (emis.x + ord.x), emis.y + 10, 0.5 * (emis.z + ord.z)],
    '11. Ruined Soleri-Farm Honeycomb Pods & Arched Aqueducts': [hubNe.x + 210, 118, hubNe.z + 220, hubNe.x, 12, hubNe.z],
    '12. Decayed Commuter Monorail, Ruined Soleri Hub & Wrecked Train': [hubSw.x - 210, 120, hubSw.z + 210, hubSw.x, 12, hubSw.z],
    '13. Forest Ring Stepped Botanical Crown (+600m to +780m)': [-540, 760, 520, 0, 645, 0],
    '14. Customs Granary Wall & Tors Rivrh Barge Wharves': [gt0.x + 115, 52, gt0.z + 115, gt0.x, 6, gt0.z]
  };
})();

const TORUS_CUTAWAY_UNITS = (function () {
  function mapLmLevels(spec) {
    const arr = [];
    for (let i = 0; i < spec.levels.length; i++) {
      const lv = spec.levels[i];
      arr.push({
        y: +(spec.lm.y + lv.y0).toFixed(2),
        h: +(lv.y1 - lv.y0).toFixed(2),
        name: lv.name
      });
    }
    return arr;
  }

  const arcLevels = [];
  for (let i = 0; i < TORUS_STAGE4.arcology.levels.length; i++) {
    const lv = TORUS_STAGE4.arcology.levels[i];
    arcLevels.push({
      y: lv.y0,
      h: +(lv.y1 - lv.y0).toFixed(2),
      name: lv.name
    });
  }

  const board = TORUS_STAGE4.boardHall;
  const emis = TORUS_STAGE4.emissary;
  const ord = TORUS_STAGE4.ordinators;
  const cider = TORUS_STAGE4.ciderHall;

  return [
    {
      id: 'forest_ring_arcology',
      name: 'Forest Ring Arcology (Foot +44m .. Wheel +300m .. Crown +672m)',
      x: 0,
      z: 0,
      r: 742,
      levels: arcLevels
    },
    {
      id: 'lm_boardhall',
      name: 'Board Hall & Tenders Archive (F-1 Seed Vault .. F2 Lantern)',
      x: board.lm.x,
      z: board.lm.z,
      ry: board.lm.ry,
      w: board.lm.w,
      d: board.lm.d,
      levels: mapLmLevels(board)
    },
    {
      id: 'lm_ciderhall',
      name: 'Great Cider-Press & Winch Hall (WY=300m, F-1 Cider Tube .. F1)',
      x: cider.lm.x,
      z: cider.lm.z,
      ry: cider.lm.ry,
      w: cider.lm.w,
      d: cider.lm.d,
      levels: mapLmLevels(cider)
    },
    {
      id: 'lm_emissary',
      name: 'Vothic Emissary Compound (F-1 Tithe Vault .. F2 Pavilion)',
      x: emis.lm.x,
      z: emis.lm.z,
      ry: emis.lm.ry,
      w: emis.lm.w,
      d: emis.lm.d,
      levels: mapLmLevels(emis)
    },
    {
      id: 'lm_ordinators',
      name: 'Ordinator Palace of Torus (F-1 Monk Cells .. F2 Watchtower)',
      x: ord.lm.x,
      z: ord.lm.z,
      ry: ord.lm.ry,
      w: ord.lm.w,
      d: ord.lm.d,
      levels: mapLmLevels(ord)
    }
  ];
})();

const TORUS_MINIMAP = (function buildTorusMinimapSpec() {
  const deg = Math.PI / 180;
  const board = torusLmAt('lm_boardhall');
  const emis = torusLmAt('lm_emissary');
  const ord = torusLmAt('lm_ordinators');
  const cider = torusLmAt('lm_ciderhall');
  const amber = torusLmAt('dome_ancient_medical');
  const hubNe = (TORUS_PLAN.hinterland && TORUS_PLAN.hinterland.soleriHubs[0]) || { x: 1450, z: -1150 };
  const hubSw = (TORUS_PLAN.hinterland && TORUS_PLAN.hinterland.soleriHubs[2]) || { x: -1900, z: -1180 };

  const bands = [
    { y0: -5.0, y1: 0.2, name: 'F-1 Seed, Tithe & Monk Vaults' },
    { y0: 0.2, y1: 14.5, name: '6 km Soleri Hinterland & Lower Terraces T10-T7' },
    { y0: 14.5, y1: 31.5, name: 'Mid Agricultural Terraces T6-T4 & Ag-Domes' },
    { y0: 31.5, y1: 58.0, name: 'Upper Terraces T3-T1, Board Hall & Ring Foot' },
    { y0: 58.0, y1: 286.0, name: 'Lower Barrel Lift Waystations (+58..286m)' },
    { y0: 286.0, y1: 326.0, name: 'WY=300m Suspended Wheel, Cider-Press & Fruitvines' },
    { y0: 326.0, y1: 595.0, name: 'Upper Barrel Shafts (+326..595m)' },
    { y0: 595.0, y1: 790.0, name: 'Stepped Botanical Crown (+600..780m)' }
  ];

  const schTargets = {
    crown_664: [-540, 760, 520, 0, 645, 0],
    upper_barrel: [360, 465, 290, 0, 440, 0],
    wheel_300: [-770, 268, 480, -585, 248, 355],
    cider_300: [cider.x - 115, 348, cider.z - 92, cider.x, 304, cider.z],
    lower_barrel: [345, 195, 285, 0, 175, 0],
    foot_t1: [340, 72, 120, 250, 44, 30],
    board_t3: [board.x - 135, board.y + 56, board.z - 125, board.x, board.y + 8, board.z],
    amber_t4: [amber.x + 88, amber.y + 36, amber.z + 52, amber.x, amber.y + 6, amber.z],
    voth_t7: [emis.x + 150, emis.y + 72, emis.z + 135, 0.5 * (emis.x + ord.x), emis.y + 10, 0.5 * (emis.z + ord.z)],
    customs_t10: [1255, 52, 115, 1140, 6, 0],
    soleri_ne: [hubNe.x + 210, 118, hubNe.z + 220, hubNe.x, 12, hubNe.z],
    monorail_sw: [hubSw.x - 210, 120, hubSw.z + 210, hubSw.x, 12, hubSw.z],
    seed_vault: [board.x + 28, board.y + 12, board.z + 28, board.x, board.y - 2.8, board.z]
  };

  const schematic = {
    title: 'Torus Multi-Altitude & 6 km Hinterland Line Map (click station)',
    key: 'l',
    w: 360,
    h: 204,
    lines: {
      hoist: '#e6c870',
      wheel: '#78c890',
      terrace: '#c89b62',
      transit: '#7ea8c8',
      sub: '#9b82c8'
    },
    nodes: [
      { id: 'crown_664', name: 'Crown (+664m)', kind: 'station', x: 34, depth: -92, col: '#9fe2b8' },
      { id: 'upper_barrel', name: 'Upper Barrel', kind: 'lift', x: 34, depth: -68, col: '#d8c89a' },
      { id: 'wheel_300', name: 'Wheel Rims (WY=300m)', kind: 'loj', x: 34, depth: -44, col: '#78c890' },
      { id: 'cider_300', name: 'Great Cider-Press (300m)', kind: 'station', x: 64, depth: -44, col: '#e6b868' },
      { id: 'lower_barrel', name: 'Lower Barrel', kind: 'lift', x: 34, depth: -22, col: '#d8c89a' },
      { id: 'foot_t1', name: 'Ring Foot & T1 (+44m)', kind: 'junction', x: 34, depth: -6, col: '#f0d280' },
      { id: 'board_t3', name: 'T3 Board Hall (+34m)', kind: 'station', x: 50, depth: -4, col: '#d8c088' },
      { id: 'amber_t4', name: 'T4 Amber-Sap Domes', kind: 'station', x: 64, depth: -3, col: '#6ad09a' },
      { id: 'voth_t7', name: 'T7 SE Voth Ext (+14m)', kind: 'station', x: 78, depth: -1, col: '#d86868' },
      { id: 'customs_t10', name: 'Customs Wall (r=1.14km)', kind: 'junction', x: 88, depth: 0, col: '#cfc8b8' },
      { id: 'soleri_ne', name: 'Soleri Pods (2.2km)', kind: 'station', x: 98, depth: 0, col: '#90b8d8' },
      { id: 'monorail_sw', name: 'Ruined Monorail (SW)', kind: 'station', x: 14, depth: 0, col: '#7ea8c8' },
      { id: 'seed_vault', name: 'F-1 Seed & Monk Vaults', kind: 'station', x: 50, depth: 12, col: '#a890d0' }
    ],
    edges: [
      { a: 'crown_664', b: 'upper_barrel', line: 'hoist', state: 'solid' },
      { a: 'upper_barrel', b: 'wheel_300', line: 'hoist', state: 'solid' },
      { a: 'wheel_300', b: 'cider_300', line: 'wheel', state: 'solid' },
      { a: 'wheel_300', b: 'lower_barrel', line: 'hoist', state: 'solid' },
      { a: 'lower_barrel', b: 'foot_t1', line: 'hoist', state: 'solid' },
      { a: 'foot_t1', b: 'board_t3', line: 'terrace', state: 'solid' },
      { a: 'board_t3', b: 'amber_t4', line: 'terrace', state: 'solid' },
      { a: 'amber_t4', b: 'voth_t7', line: 'terrace', state: 'solid' },
      { a: 'voth_t7', b: 'customs_t10', line: 'terrace', state: 'solid' },
      { a: 'customs_t10', b: 'soleri_ne', line: 'transit', state: 'gap', time: 6 },
      { a: 'foot_t1', b: 'monorail_sw', line: 'transit', state: 'gap', time: 7 },
      { a: 'board_t3', b: 'seed_vault', line: 'sub', state: 'solid' }
    ],
    onPick: function (node) {
      const v = schTargets[node.id];
      if (!v || !KHOST.cam) return;
      if (KHOST.cam.ctl.walk) KHOST.cam.walk(false, true);
      camera.position.set(v[0], v[1], v[2]);
      KHOST.cam.ctl.target.set(v[3], v[4], v[5]);
      KHOST.cam.ctl.radius = Math.hypot(v[0] - v[3], v[1] - v[4], v[2] - v[5]);
    }
  };

  function drawOverlay(M) {
    // 1. Tors Rivrh NW->SE channel (bearing 318 deg, offset ~1045m)
    const nx = Math.cos(318 * deg), nz = Math.sin(318 * deg);
    const tx = -nz, tz = nx;
    const rivPts = [];
    for (let s = -24; s <= 24; s++) {
      const tm = s * 125;
      const dn = 1045.0 + 36.0 * Math.sin(tm / 520.0);
      rivPts.push([dn * nx + tm * tx, dn * nz + tm * tz]);
    }
    for (let i = 1; i < rivPts.length; i++) {
      M.strip(rivPts[i - 1], rivPts[i], 54, { col: '#2c5868', y: 0.4, name: 'Tors Rivrh' });
    }

    // 2. Decayed Ancient Transit corridors (highway, elevated monorail, agricultural cargo loops)
    const hl = TORUS_PLAN.hinterland;
    function drawTransitPath(rec, w, col, label) {
      if (!rec || !rec.path || typeof rec.path.at !== 'function' || !(rec.path.L > 0)) return;
      const steps = Math.max(8, Math.ceil(rec.path.L / 110));
      let prev = null;
      for (let k = 0; k <= steps; k++) {
        const q = rec.path.at((rec.path.L * k) / steps);
        const p = [q.x, q.z];
        if (prev) M.strip(prev, p, w, { col: col, y: 4.0, name: label });
        prev = p;
      }
    }
    if (hl && hl.transit) {
      drawTransitPath(hl.transit.highway, 22, '#6d6960', 'Broken Valley Elevated Highway');
      for (let i = 0; i < hl.transit.elevatedRails.length; i++) {
        drawTransitPath(hl.transit.elevatedRails[i], 13, '#66879c', 'Decayed Commuter Monorail');
      }
      for (let i = 0; i < hl.transit.cargoRails.length; i++) {
        drawTransitPath(hl.transit.cargoRails[i], 11, '#786850', 'Overgrown Harvest Cargo Rail');
      }
    }

    // 3. Soleri-farm hinterland honeycombs (2/3 ruined grey, 1/3 working green), vault houses, hubs & aqueducts
    if (hl && Array.isArray(hl.soleriStructures)) {
      for (let si = 0; si < hl.soleriStructures.length; si++) {
        const sf = hl.soleriStructures[si];
        const col = (sf.workingFarm || sf.reclaimedByTenders || sf.state === 'intact') ? '#79a878' : '#7f7a6e';
        M.disc(sf.x, sf.z, Math.max(16, Math.min(44, Math.max(sf.w, sf.d) * 0.48)), {
          col: col,
          y: sf.y + 4,
          name: sf.name
        });
      }
    }

    // 4. Customs Wall (r=1140m) & 10 Stepped Agricultural Terraces (T1 +44m -> T10 +1m)
    const terraces = TORUS_PLAN.agTerraces || [];
    for (let ti = 0; ti < terraces.length; ti++) {
      const tr = terraces[ti];
      const trOut = tr.rOut == null ? tr.rOuter : tr.rOut;
      let prev = null;
      for (let k = 0; k <= 64; k++) {
        const dm = (360 * k) / 64;
        const p = [trOut * Math.cos(dm * deg), trOut * Math.sin(dm * deg)];
        if (prev) M.strip(prev, p, 4.5, { col: ti < 4 ? '#7c9668' : '#6c7f58', y: tr.elev + 0.5, name: tr.id + ' Terrace' });
        prev = p;
      }
    }
    let wPrev = null;
    const wallR = TORUS_PLAN.site.customsWallR;
    for (let k = 0; k <= 72; k++) {
      const dm = (360 * k) / 72;
      const p = [wallR * Math.cos(dm * deg), wallR * Math.sin(dm * deg)];
      if (wPrev && !(dm >= 298 && dm <= 338)) {
        M.strip(wPrev, p, 9.0, { col: '#d4cab4', y: 3.5, name: 'Torus Customs & Granary Wall' });
      }
      wPrev = p;
    }

    // 5. 8 Surviving Tenders Ag-Domes & 4 Quarantined Feral Ag-Domes
    for (let di = 0; di < TORUS_PLAN.specimenDomes.length; di++) {
      const dm = TORUS_PLAN.specimenDomes[di];
      M.disc(dm.x, dm.z, 26, { col: '#58b882', y: dm.y + 4, name: dm.name });
    }
    for (let fi = 0; fi < TORUS_PLAN.feralDomes.length; fi++) {
      const fd = TORUS_PLAN.feralDomes[fi];
      M.disc(fd.x, fd.z, 28, { col: '#b8483c', y: fd.y + 4, name: fd.name + ' (QUARANTINED)' });
    }

    // 6. Forest Ring Barrel (r=280m), Suspended Outer Wheel (r=560..720m at WY=300m) & Stepped Crown (+664m)
    M.disc(0, 0, 276, { col: '#889482', y: 46, name: 'Forest Ring Barrel Core' });
    let whPrev = null;
    for (let k = 0; k <= 72; k++) {
      const dm = (360 * k) / 72;
      if (TORUS.inWheelRuinZone(640, dm)) {
        whPrev = null;
        continue;
      }
      const p = [640 * Math.cos(dm * deg), 640 * Math.sin(dm * deg)];
      if (whPrev) {
        M.strip(whPrev, p, 148, { col: '#6ba478', y: 300, name: 'Forest Ring Outer Wheel & Hanging Fruitvines (WY=300m)' });
      }
      whPrev = p;
    }

    // 7. Multi-altitude vertical transition marks
    M.mark(0, 0, 664, { name: 'Stepped Botanical Crown (+664m)', col: '#9fe2b8' });
    M.mark(cider.x, cider.z, 300, { name: 'Great Cider-Press & Rim Winches (WY=300m)', col: '#ffd97d' });
    const bridgeDegs = [7.5, 97.5, 187.5, 277.5];
    for (let bi = 0; bi < bridgeDegs.length; bi++) {
      const ba = bridgeDegs[bi] * deg;
      M.mark(420 * Math.cos(ba), 420 * Math.sin(ba), 300, { name: 'Wheel Spoke Bridge (WY=300m)', col: '#8ad4ff' });
    }
    M.mark(board.x, board.z, board.y - 3.6, { name: 'Board Botanical Seed Vault (F-1)', col: '#c8a8ff' });
    M.mark(ord.x, ord.z, ord.y - 3.6, { name: 'Ordinator History-Monk Cells (F-1)', col: '#e08088' });
  }

  return {
    title: 'Torus (Tors)',
    frame: [-2980, 2980, -2980, 2980],
    size: 288,
    relief: { cell: 32, water: -0.8 },
    draw: drawOverlay,
    decks: {
      walk: KWALK,
      lo: -5,
      hi: 700,
      marks: true,
      dim: 0.28,
      bands: bands
    },
    schematic: schematic
  };
})();

ANC_TICKS.push(torusSyncCameraDepth);
KHOST.on(torusSyncCameraDepth, 'view');
KHOST.on(SKY.view, 'view');
KHOST.on(function () { TORUS_LIFE.sync(false); }, 'view');

function torusReachLandmarkStoreys(B, approachDist) {
  const c = Math.cos(B.lm.ry), s = Math.sin(B.lm.ry);
  const sx = B.lm.x + s * approachDist;
  const sz = B.lm.z + c * approachDist;
  const sy = B.lm.y;
  const rad = Math.max(B.lm.w, B.lm.d) * 0.78;
  const res = KWALK.reach([[sx, sy, sz]], {
    box: [B.lm.x - rad, B.lm.x + rad, B.lm.z - rad, B.lm.z + rad],
    cell: 0.58,
    step: 0.72,
    r: 0.30,
    h: 1.7
  });
  const hit = new Set();
  for (let i = 0; i < res.reached.length; i++) {
    const f = res.reached[i];
    if (typeof f.tag === 'string' && f.tag.indexOf(B.id + ':S') === 0) {
      const idx = parseInt(f.tag.split(':S')[1], 10);
      if (idx >= 0) hit.add(idx);
    }
  }
  return hit.size;
}

function torusChecks() {
  const out = [];
  const ruleKeys = Object.keys(TORUS.RULES);
  for (let i = 0; i < ruleKeys.length; i++) {
    const k = ruleKeys[i];
    const res = TORUS.RULES[k](TORUS_PLAN);
    out.push({ name: 'layout: ' + k, ok: !!res.pass, detail: res.detail });
  }
  const skyLen = TORUS_PLAN.skyBuildings ? TORUS_PLAN.skyBuildings.length : 0;
  const farmObLen = (TORUS_PLAN.hinterland && TORUS_PLAN.hinterland.farmOutbuildings) ? TORUS_PLAN.hinterland.farmOutbuildings.length : 0;
  const expectedBlds = TORUS_PLAN.buildings.length + skyLen + farmObLen;
  out.push({
    name: 'all terrace, Wheel-Town, Crown & working-pod kit buildings placed in 3D',
    ok: TORUS_PLACED.missing.length === 0 && TORUS_PLACED.terraceTotal === TORUS_PLAN.buildings.length &&
        TORUS_PLACED.total === expectedBlds && TORUS_PLACED.skyTotal >= 120 && TORUS_PLACED.farmOutTotal >= 12,
    detail: 'placed ' + TORUS_PLACED.total + '/' + expectedBlds +
      ' (terrace=' + TORUS_PLACED.terraceTotal + ', wheel/crown=' + TORUS_PLACED.skyTotal + ', farmsteads=' + TORUS_PLACED.farmOutTotal +
      ', swa=' + TORUS_PLACED.swa + ', voth-scrap=' + TORUS_PLACED.vothScrap + ', post-apoc=' + TORUS_PLACED.postApoc + ', ' + TORUS_PLACED.ms + ' ms)'
  });
  const vc = TORUS_ARCOLOGY_GROUP.userData.vineCurtains == null ? 0 : TORUS_ARCOLOGY_GROUP.userData.vineCurtains;
  const gc = TORUS_ARCOLOGY_GROUP.userData.harvesterGondolas == null ? 0 : TORUS_ARCOLOGY_GROUP.userData.harvesterGondolas;
  const fl = typeof TORUS_FLORA !== 'undefined' && TORUS_FLORA ? TORUS_FLORA : null;
  out.push({
    name: 'botanical sky-fruitvine (kits/crops) curtains, 3D fruit clusters, SWBAY woods & CROPS terrace/dome flora active (zero blobby placeholders)',
    ok: !!(vc === TORUS_PLAN.arcology.fruitvines.length && gc >= 20 && fl && fl.skyVineRecord &&
        fl.vineCurtains === TORUS_PLAN.arcology.fruitvines.length && fl.vineFruitBunches >= 2500 &&
        fl.cropPlants >= 800 && fl.orchardTrees >= 35 && fl.swbayTrees >= 180 && fl.blobbyAncients === 0),
    detail: vc + ' curtains, ' + (fl ? fl.vineFruitBunches : 0) + ' fruit clusters, ' +
      (fl ? fl.cropPlants : 0) + ' crop clumps, ' + (fl ? fl.orchardTrees : 0) + ' orchard trees, ' +
      (fl ? fl.swbayTrees : 0) + ' SWBAY trees, blobbyAncients=' + (fl ? fl.blobbyAncients : -1)
  });
  out.push({
    name: 'Metropolis Soleri-farm hinterlands (2/3 ruined pods, 1/3 working farms & orchards) & decayed KTRANSIT network drawn in 3D',
    ok: TORUS_HINTERLAND_STATS.soleriTotal === TORUS_PLAN.hinterland.soleriStructures.length &&
        TORUS_HINTERLAND_STATS.podTotal >= 120 && TORUS_HINTERLAND_STATS.podRuined > TORUS_HINTERLAND_STATS.podWorking &&
        TORUS_HINTERLAND_STATS.podWorking >= 24 && TORUS_HINTERLAND_STATS.transitGroups >= 5,
    detail: TORUS_HINTERLAND_STATS.soleriTotal + ' Soleri (' + TORUS_HINTERLAND_STATS.podRuined + ' ruined pods, ' +
      TORUS_HINTERLAND_STATS.podWorking + ' working pods) + ' + TORUS_HINTERLAND_STATS.transitGroups + ' KTRANSIT groups'
  });

  // Stage 4 checks: multi-storey walkability, Forest Ring vertical hoist+bridge climb, KDOOR/KFURN, KHAZ quarantine & rim hazards
  const bHit = torusReachLandmarkStoreys(TORUS_STAGE4.boardHall, 26.5);
  const eHit = torusReachLandmarkStoreys(TORUS_STAGE4.emissary, 33.2);
  const oHit = torusReachLandmarkStoreys(TORUS_STAGE4.ordinators, 31.6);
  const cHit = torusReachLandmarkStoreys(TORUS_STAGE4.ciderHall, 21.5);
  out.push({
    name: 'Stage 4 landmark interiors walkable across all storeys (Board F-1..F2, Emissary F-1..F2, Ordinator F-1..F2, Cider F-1..F1)',
    ok: bHit === 4 && eHit === 4 && oHit === 4 && cHit === 3,
    detail: 'board=' + bHit + '/4, emissary=' + eHit + '/4, ordinators=' + oHit + '/4, cider=' + cHit + '/3'
  });

  // Walk from T1 (+44m) outside Foot Portal 0 (deg=7.5, x=295.45, z=38.90) through Foot -> Hoist -> Barrel -> Wheel Bridge (deg=7.5) -> Crown (+664m)
  const arcRes = KWALK.reach([[295.45, 44.0, 38.90]], {
    box: [-120, 620, -120, 260],
    cell: 1.15,
    step: 0.78,
    r: 0.30,
    h: 1.7,
    limit: 1200000
  });
  const arcLvls = new Set();
  for (let i = 0; i < arcRes.reached.length; i++) {
    const f = arcRes.reached[i];
    if (typeof f.tag === 'string' && f.tag.indexOf('forest_ring_arcology:L') === 0) {
      arcLvls.add(parseInt(f.tag.slice(22), 10));
    }
  }
  out.push({
    name: 'Stage 4 Forest Ring walkable from T1 (+44m) across all 5 vertical tiers (Foot, Lower Barrel, WY=300m Wheel, Upper Barrel, Crown +664m)',
    ok: arcLvls.size === 5,
    detail: 'tiers reached=' + arcLvls.size + '/5 (' + Array.from(arcLvls).sort().join(',') + ')'
  });

  const missKeys = Object.keys(TORUS_FURN.missing);
  let lockedFeralDoors = 0;
  for (let i = 0; i < TORUS_PLAN.feralDomes.length; i++) {
    const fdDoor = KDOOR.get('door_' + TORUS_PLAN.feralDomes[i].id + '_quarantine');
    if (fdDoor && fdDoor.locked && fdDoor.open === 0) lockedFeralDoors++;
  }
  const hazAll = KHAZ.list(TORUS_TAGS);
  const fd0 = TORUS_PLAN.feralDomes[0];
  const hazFeral0 = KHAZ.at(fd0.x, fd0.z, 0, fd0.y + 1.5, TORUS_TAGS);
  const ts0 = TORUS_PLAN.arcology.tetherStations[0];
  const hazRim0 = KHAZ.at(ts0.at[0], ts0.at[2], 0, 300.5, TORUS_TAGS);
  out.push({
    name: 'Stage 4 KDOOR + KFURN + KHAZ active (zero missing furniture, 4 welded Feral Domes locked, 48 bio/rim-fall hazards live)',
    ok: KDOOR.list.length >= 35 && TORUS_FURN.placed.length >= 160 && missKeys.length === 0 &&
        lockedFeralDoors === 4 && hazAll.length >= 48 && hazFeral0.length >= 1 && hazRim0.length >= 1,
    detail: 'doors=' + KDOOR.list.length + ', lockedFeral=' + lockedFeralDoors + '/4, furn=' + TORUS_FURN.placed.length +
      ', missing=' + missKeys.length + ', hazards=' + hazAll.length
  });

  out.push({
    name: 'Stage 4 floorplan cutaway wired for Forest Ring + 4 hero landmarks',
    ok: !!(KHOST.cut && TORUS_CUTAWAY_UNITS.length === 5),
    detail: TORUS_CUTAWAY_UNITS.map(function (u) { return u.id + '(' + u.levels.length + ')'; }).join(', ')
  });

  const audit = TORUS_TAGS.audit();
  out.push({
    name: 'KTAGS audit clean across buildings, hazards & Stage 4 furniture (zero unknown vocabulary, zero missing culture)',
    ok: audit.unknown === 0 && audit.missingCulture === 0,
    detail: audit.records + ' records, unknown=' + audit.unknown + ', missingCulture=' + audit.missingCulture
  });

  // Stage 5 checks: 8,500-resident SIM, connected 3D nav, bespoke specimen/cider stocks, Voth trades & tethered harvesters
  const simProblems = SIM.check();
  out.push({
    name: 'Stage 5 SIM.check() clean across 8,500 residents (2,550 top-heavy Forest Ring + 5,950 Terraces/Extension)',
    ok: simProblems.length === 0 && TORUS_SIM.totalResidents === 8500 &&
        TORUS_SIM.arcologyResidents === 2550 && TORUS_SIM.terraceResidents === 5950,
    detail: 'residents=' + TORUS_SIM.totalResidents + ' (arc=' + TORUS_SIM.arcologyResidents +
      ', terraces=' + TORUS_SIM.terraceResidents + '), problems=' + simProblems.length
  });

  const pedLayer = SIM.nav.layers.pedestrian;
  let disconnectedNodes = 0;
  const body0 = SIM.nav.body('pedestrian', 0);
  for (let ni = 1; ni < pedLayer.nodes.length; ni++) {
    if (SIM.nav.body('pedestrian', ni) !== body0) disconnectedNodes++;
  }
  out.push({
    name: 'Stage 5 pedestrian navigation forms one connected 3D component across 10 terraces, Wheel (300m) & Crown (664m)',
    ok: pedLayer.nodes.length >= 220 && disconnectedNodes === 0,
    detail: pedLayer.nodes.length + ' nodes, ' + pedLayer.edges.length + ' edges, disconnected=' + disconnectedNodes
  });

  const ciderStock = SIM.stockOf('cider');
  const medStock = SIM.stockOf('earth_medicine');
  const cacaoStock = SIM.stockOf('cacao');
  const amberStock = SIM.stockOf('amber_sap');
  out.push({
    name: 'Stage 5 cider, out-of-zone Tenders crops, Amber-Sap & TORUS_TRADES census wired',
    ok: ciderStock > 0 && medStock > 0 && cacaoStock > 0 && amberStock > 0 && TORUS_SIM.carts === 14 && TORUS_TRADES.length === 44,
    detail: 'cider=' + ciderStock + ', med=' + medStock + ', cacao=' + cacaoStock + ', amber=' + amberStock + ', carts=' + TORUS_SIM.carts + ', trades=' + TORUS_TRADES.length
  });

  TORUS_SIM.refreshActivityCounts();
  const lifeCnt = TORUS_LIFE.counts();
  out.push({
    name: 'Stage 5 tethered fruitvine harvesters on steel rim lines, Board Assize, Sun missionaries & Ordinator watch active',
    ok: TORUS_SIM.activeVineHarvesters >= 80 && lifeCnt.tethered >= 20 && lifeCnt.people >= 350,
    detail: 'vineHarvesters=' + TORUS_SIM.activeVineHarvesters + ', drawnTethers=' + lifeCnt.tethered +
      ', board=' + TORUS_SIM.activeBoardMembers + ', sunPreachers=' + TORUS_SIM.activeSunMissionaries + ', drawnPeople=' + lifeCnt.people
  });

  // Stage 6 checks: 6 km multi-altitude deck minimap + vertical schematic (L), KCITY plan, and Godot core/export (including hazards)
  const md = KHOST.minimapDecks;
  const mapExp = KHOST.minimap && typeof KHOST.minimap.export === 'function' ? KHOST.minimap.export() : null;
  const bandCur = md && typeof md.band === 'function' ? md.band() : null;
  out.push({
    name: 'Stage 6 multi-altitude 6 km deck minimap & Forest Ring schematic line map (L) active',
    ok: !!(md && bandCur && mapExp && mapExp.schematic && mapExp.schematic.nodes.length === 13 && mapExp.marks.length >= 6),
    detail: 'band=' + (bandCur ? bandCur[2] : 'none') + ', schematicNodes=' + (mapExp && mapExp.schematic ? mapExp.schematic.nodes.length : 0) +
      ', mapRecords=' + (mapExp ? mapExp.records.length : 0)
  });

  const kcityExp = TORUS_KCITY ? TORUS_KCITY.export() : null;
  out.push({
    name: 'Stage 6 KCITY instance populated across 10 terraces, Customs Wall & 1,803+ lots',
    ok: !!(kcityExp && kcityExp.format === 'krator-city' && kcityExp.lots.length >= 1803 && kcityExp.ways.length >= TORUS_PLAN.roads.length),
    detail: kcityExp ? ('lots=' + kcityExp.lots.length + ', ways=' + kcityExp.ways.length + ', gates=' + kcityExp.gates.length) : 'missing KCITY'
  });

  const exRes = TORUS_EXPORT && TORUS_EXPORT.available ? TORUS_EXPORT.verify() : null;
  const simChecks = exRes && exRes.world && exRes.world.sim ? TORUS.simExportChecks(exRes.world.sim) : [];
  for (let si = 0; si < simChecks.length; si++) out.push(simChecks[si]);
  const hazExportCount = exRes && exRes.world && exRes.world.hazards && Array.isArray(exRes.world.hazards.records) ? exRes.world.hazards.records.length : 0;
  out.push({
    name: 'Stage 6 Godot world export (EXPORT.world + hazards + EXPORT.check + EXPORT.glb) clean across all profile sections',
    ok: !!(exRes && exRes.check.ok && exRes.magicOk && exRes.world.errors.length === 0 && hazExportCount >= 4),
    detail: exRes ? ('ok=' + exRes.check.ok + ', problems=' + exRes.check.problems.length + ', hazards=' + hazExportCount +
      ', items=' + exRes.world.items.length + ', buckets=' + exRes.world.buckets.length +
      ', glbKB=' + Math.round(exRes.glbBytes / 1024) + (exRes.check.problems.length ? ' [' + exRes.check.problems.slice(0, 3).join('; ') + ']' : '')) : 'export unavailable'
  });

  // Quality Pass Audits: 100% PBR-textured opaque surfaces, zero Amber-Sap Dome clipping, and dynamic near-plane Z-fighting protection
  let untexturedCount = 0;
  const untexturedSamples = [];
  scene.traverse(function (o) {
    if (!o.isMesh || !o.geometry) return;
    for (let p = o; p; p = p.parent) {
      if (p === TORUS_LIFE.group || p.name === 'torus_life_root') return;
    }
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (let mi = 0; mi < mats.length; mi++) {
      const m = mats[mi];
      if (!m || m.transparent || m.isMeshBasicMaterial || m.isShaderMaterial) continue;
      const hasTex = !!(m.map || (m.uniforms && (m.uniforms.map || m.uniforms.uTex)));
      if (!hasTex) {
        untexturedCount++;
        if (untexturedSamples.length < 4) untexturedSamples.push((o.name || 'mesh') + ':' + (m.name || m.type));
      }
    }
  });
  out.push({
    name: '100% textured opaque architectural, terrain, terrace, Soleri & furniture surfaces',
    ok: untexturedCount === 0,
    detail: 'untextured=' + untexturedCount + (untexturedSamples.length ? ' [' + untexturedSamples.join(', ') + ']' : '')
  });

  const amberDm = torusLmAt('dome_ancient_medical');
  let amberIntrusions = 0;
  for (let bi = 0; bi < TORUS_PLAN.buildings.length; bi++) {
    const b = TORUS_PLAN.buildings[bi];
    const d = Math.hypot(b.x - amberDm.x, b.z - amberDm.z) - 0.5 * Math.hypot(b.w, b.d);
    if (d < 12.2) amberIntrusions++;
  }
  torusSyncCameraDepth();
  out.push({
    name: 'zero structural clipping on Amber-Sap Sanctuary Dome & dynamic Z-clean depth precision active',
    ok: amberIntrusions === 0 && camera.near >= 0.55,
    detail: 'amberIntrusions=' + amberIntrusions + ', camera.near=' + camera.near.toFixed(2)
  });

  return out;
}

function torusNegatives() {
  const out = [];
  const badGov = JSON.parse(JSON.stringify(TORUS_PLAN));
  badGov.site.governance.localRule = 'direct_military_governor';
  const f1 = !TORUS.RULES.populationAndGovernance(badGov).pass;
  out.push({
    name: 'replacing Torus elected Chairman & Board with direct military governor fails governance check',
    failed: f1,
    ok: f1
  });
  const badDome = JSON.parse(JSON.stringify(TORUS_PLAN));
  badDome.feralDomes[0].quarantined = false;
  const f2 = !TORUS.RULES.specimensAndFeralQuarantine(badDome).pass;
  out.push({
    name: 'unquarantined feral ag-dome fails Tenders quarantine check',
    failed: f2,
    ok: f2
  });

  // Stage 4 negative check: closing Board Hall's main portal blocks KWALK entry AND welded Feral Dome door refuses KDOOR.toggle()
  const dBoard = KDOOR.get('door_board_main_portal');
  if (dBoard) KDOOR.close(dBoard);
  KDOOR.step(20);
  const shutStoreys = torusReachLandmarkStoreys(TORUS_STAGE4.boardHall, 26.5);
  if (dBoard) {
    KDOOR.open(dBoard);
    KDOOR.step(20);
    KDOORHOST.pose(dBoard);
  }
  const dFeral = KDOOR.get('door_' + TORUS_PLAN.feralDomes[0].id + '_quarantine');
  const feralRefused = !!(dFeral && KDOOR.toggle(dFeral) === false && dFeral.open === 0);
  const f3 = shutStoreys <= 1 && feralRefused;
  out.push({
    name: 'closing Board Hall portal seals interior vaults & upper galleries and welded Quarantined Feral Dome bulkhead refuses KDOOR.toggle()',
    failed: f3,
    ok: f3
  });

  // Stage 5 negative check: corrupting a tethered harvester's workplace is caught by SIM.check()
  const probeActor = SIM.R.actor.arc_vine_0;
  const savedWork = probeActor.work;
  const prevProbLen = SIM.problems.length;
  probeActor.work = 'nonexistent_tether_rig_999';
  const badProblems = SIM.check();
  probeActor.work = savedWork;
  SIM.problems.length = prevProbLen;
  const f4 = badProblems.length > 0;
  out.push({
    name: 'Stage 5 SIM.check() catches broken tethered-harvester workplace reference',
    failed: f4,
    ok: f4
  });

  // Stage 6 negative check: corrupting an exported hazard's record link or bucket material fails EXPORT.check()
  let f5 = false;
  if (TORUS_EXPORT && TORUS_EXPORT.available) {
    const exRes = TORUS_EXPORT.verify();
    if (exRes && exRes.world && exRes.world.buckets.length > 0 && exRes.world.sections.hazards) {
      const savedStatus = exRes.world.sections.hazards.status;
      exRes.world.sections.hazards.status = 'stub';
      const badHazChk = EXPORT.check(exRes.world, { uid: KTAGS.uid, profile: TORUS_EXPORT.PROFILE });
      exRes.world.sections.hazards.status = savedStatus;
      f5 = !badHazChk.ok && badHazChk.problems.length > 0;
    }
  }
  out.push({
    name: 'Stage 6 EXPORT.check() rejects stubbed hazards section against Torus profile',
    failed: f5,
    ok: f5
  });

  return out;
}

KHOST.take({
  build: 'torus',
  title: 'Torus (Tors / Rinkvolk) — Stage 6',
  hint: 'Torus (Stage 6): 8,500 simulated citizens (2,550 top-heavy in Forest Ring Wheel/Crown + Foot; 5,950 across 10 Stepped Terraces +44m to +1m & SE Scrap Voth Extension), tethered fruitvine harvesters on both Wheel rims, Great Cider-Press brewing, 8 Tenders Out-of-Zone & Amber-Sap Ag-Domes, 4 Quarantined Feral Domes, 6 km Multi-Altitude Deck Minimap + Vertical Line Map (L), and full Godot core/export profile. Space/Play for time, F to walk, E for doors, M for minimap, L for vertical line map, X and [ / ] for cutaway.',
  scene: scene,
  camera: camera,
  renderer: renderer,
  ground: torusGroundAt,
  walk: KWALK,
  walker: { step: 0.72, drop: 1.4, r: 0.32, h: 1.7 },
  keys: {
    e: function (ev) {
      const walking = !!(KHOST.cam && KHOST.cam.ctl.walk);
      const hit = KDOORHOST.toggleNear(camera.position, walking);
      if (hit) {
        if (KHOST.cam) KHOST.cam.keys.e = false;
        ev.preventDefault();
      }
    }
  },
  cutaway: {
    cutAt: 3.1,
    margin: 2.0,
    units: TORUS_CUTAWAY_UNITS
  },
  layers: {
    'Citizens & Tethered Harvesters': [TORUS_LIFE.group],
    'Interior Furnishings': [TORUS_FURN.group]
  },
  holds: KHOST.simHolds(SIM),
  clear: 1.6,
  minR: 3,
  maxR: 12000,
  registry: ANC_REG,
  views: VIEWS,
  ticks: ANC_TICKS,
  clock: {
    obj: TORUS_CLOCK,
    onSet: function () {
      SIM.jump();
      if (SIM.stepHooks && SIM.stepHooks[0]) SIM.stepHooks[0](SIM.minute());
      TORUS_LIFE.sync(true);
    }
  },
  draw: SKY.draw,
  records: function () { return TORUS_TAGS.query({}); },
  stats: function () {
    const lc = TORUS_LIFE.counts();
    return 'pop ' + TORUS_SIM.totalResidents + ' (drawn ' + lc.people + ', tethered ' + lc.tethered + ')  harvest ' +
      (TORUS_SIM.harvestActive ? 'ACTIVE' : 'off-shift') +
      '\nbld ' + TORUS_PLACED.total + '  doors ' + KDOOR.list.length + '  furn ' + TORUS_FURN.placed.length +
      '  calls ' + renderer.info.render.calls + '  tris ' + (renderer.info.render.triangles / 1e6).toFixed(2) + 'M';
  },
  minimap: TORUS_MINIMAP,
  budget: { showcase: { tris: 16000000, calls: 1260 }, cls: {}, type: {} },
  api: {
    hostChecks: torusChecks,
    hostNegatives: torusNegatives,
    exportWorld: function (opt) { return EXPORT.world(Object.assign({ box: TORUS_EXPORT.BOX, build: 'torus' }, opt || {})); },
    torus: function () {
      return {
        pop: TORUS_PLAN.pop,
        kitCounts: TORUS_PLAN.kitCounts,
        placed: TORUS_PLACED,
        walk: TORUS_WALK_STATS,
        furn: TORUS_FURN.summary(),
        sim: TORUS_SIM,
        life: TORUS_LIFE.counts(),
        hinterland: TORUS_HINTERLAND_STATS,
        exportBox: TORUS_EXPORT.BOX,
        exportProfile: TORUS_EXPORT.PROFILE
      };
    }
  }
});

if (typeof SKY !== 'undefined' && SKY && SKY.view && KHOST.on) {
  KHOST.on(SKY.view, 'view');
}
if (KHOST.minimapDecks && KHOST.minimapDecks.panel) {
  KHOST.minimapDecks.panel.style.left = 'auto';
  KHOST.minimapDecks.panel.style.right = '12px';
  KHOST.minimapDecks.panel.style.bottom = '12px';
}
