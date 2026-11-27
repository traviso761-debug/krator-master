// ================================================================= DRUM — 99: KHOST Integration, Deck Minimap, Export & Checks ([web])
// Stage 6 host entry: connects Drum's 3D world, KWALK, KDOORHOST, KFURN, 4-unit cutaway, radial + 15-level deck minimap,
// vertical schematic line map (L), KCITY + core/export Godot container, ATMOS sky, SIM, and Stage 1-6 checks to core/host.

function drumLmAt(id) {
  for (let i = 0; i < DRUM_PLAN.landmarks.length; i++) {
    if (DRUM_PLAN.landmarks[i].id === id) return DRUM_PLAN.landmarks[i];
  }
  return { x: 0, y: 0, z: 0, ry: 0, w: 40, d: 40 };
}

const VIEWS = (function () {
  const fort = drumLmAt('garrison_fortress');
  const ord = drumLmAt('ordinator_fortress');
  const arena = drumLmAt('gladiatorial_arena');
  const bourse = drumLmAt('scrap_market_rotunda');
  const wharf = drumLmAt('drum_river_wharf');
  const cf = Math.cos(fort.ry), sf = Math.sin(fort.ry);
  const co = Math.cos(ord.ry), so = Math.sin(ord.ry);
  const ca = Math.cos(arena.ry), sa = Math.sin(arena.ry);

  return {
    '1. Settlement Overview (Concentric Rings & Ruined Drum)': [-680, 440, 740, 0, 85, 0],
    '2. Ruined Drum Arcology & Inhabited Levels 1-15': [285, 92, 265, 0, 48, 0],
    '3. Under-Drum Salvage Bourse & Central Hoist Pit (L1 Interior)': [-12.0, 2.35, 32.9, 2.0, 9.5, -6.0],
    '4. Regional Scrap-Market & Assay Rotunda': [bourse.x + 85, 48, bourse.z + 82, bourse.x, 8, bourse.z],
    '5. Garrison Fortress (Praetorium of the Military Governor)': [fort.x - 96, 56, fort.z + 88, fort.x, 8, fort.z],
    '6. Garrison Bailey & Tribunal Hall': [fort.x + sf * 32, 22, fort.z + cf * 32, fort.x - sf * 24, 6, fort.z - cf * 24],
    '7. Ordinator Fortress & Parabolic Sun Chapel': [ord.x - 84, 48, ord.z - 76, ord.x, 9, ord.z],
    '8. Ordinator Cloister of Ash & Dish Altar': [ord.x + so * 26, 20, ord.z + co * 26, ord.x - so * 18, 9, ord.z - co * 18],
    '9. The Cauldron (Post-Apoc Gladiatorial Arena & Velarium)': [arena.x - 92, 54, arena.z + 82, arena.x, 7, arena.z],
    '10. The Cauldron Blood-Sand Bowl & Tank-Head Box': [arena.x + ca * 28, 19, arena.z - sa * 28, arena.x - ca * 12, 4, arena.z + sa * 12],
    '11. Restored Ancient Inner Wall & Voth-Patched Gate': [-245, 42, 385, -195, 9, 345],
    '12. Outer Ruined-Vehicle Palisade (Ancient Valley Wrecks)': [-475, 28, 495, -435, 4, 462],
    '13. Drim Rivrh Fortified Wharf & Sluice': [wharf.x + 85, 36, wharf.z - 85, wharf.x, 4, wharf.z],
    '14. Upper Fin Dwellings & L15 Sky-Terrace Catch-Basins': [198, 86, -182, 0, 62, 0]
  };
})();

const DRUM_CUTAWAY_UNITS = (function () {
  const arcLevels = [];
  for (let i = 0; i < DRUM_PLAN.arcology.levels.length; i++) {
    const lv = DRUM_PLAN.arcology.levels[i];
    arcLevels.push({ y: lv.y0, h: lv.height, name: 'L' + lv.level + ' ' + lv.name });
  }
  arcLevels.push({ y: 66.0, h: 4.4, name: 'L15 Sky-Terrace & Catch-Basins' });

  const fort = DRUM_STAGE4.garrison;
  const ord = DRUM_STAGE4.ordinator;
  const arena = DRUM_STAGE4.arena;

  return [
    {
      id: 'drum_arcology',
      name: 'Drum Arcology (Levels 1-15 + Sky-Terrace)',
      x: 0,
      z: 0,
      r: 204,
      levels: arcLevels
    },
    {
      id: 'garrison_fortress',
      name: 'Garrison Fortress (F-1 Vaults .. F2 Heliograph)',
      x: fort.lm.x,
      z: fort.lm.z,
      ry: fort.lm.ry,
      w: fort.w,
      d: fort.d,
      levels: fort.levels
    },
    {
      id: 'ordinator_fortress',
      name: 'Ordinator Fortress (F-1 Quiet Vaults .. F2 Watch Drums)',
      x: ord.lm.x,
      z: ord.lm.z,
      ry: ord.lm.ry,
      w: ord.w,
      d: ord.d,
      levels: ord.levels
    },
    {
      id: 'gladiatorial_arena',
      name: 'The Cauldron Arena (F-1 Hypogeum .. F1 Bleachers)',
      x: arena.lm.x,
      z: arena.lm.z,
      ry: arena.lm.ry,
      w: arena.w,
      d: arena.d,
      levels: arena.levels
    }
  ];
})();

const DRUM_MINIMAP = (function buildDrumMinimapSpec() {
  const deg = Math.PI / 180;
  const fort = drumLmAt('garrison_fortress');
  const ord = drumLmAt('ordinator_fortress');
  const arena = drumLmAt('gladiatorial_arena');
  const bourse = drumLmAt('scrap_market_rotunda');

  const bands = [
    { y0: -6.0, y1: -0.5, name: 'F-1 Vaults & Arena Hypogeum' },
    { y0: -0.5, y1: 5.2, name: 'Outer Rings & L1 Under-Drum Bourse' },
    { y0: 5.2, y1: 14.0, name: 'L2-L3 Trade Galleries & Silos' },
    { y0: 14.0, y1: 27.2, name: 'L4-L6 Workshops & Mushroom Vats' },
    { y0: 27.2, y1: 44.8, name: 'L7-L10 Lower Fin Dwellings' },
    { y0: 44.8, y1: 62.4, name: 'L11-L14 Upper Fin Terraces' },
    { y0: 62.4, y1: 74.0, name: 'L15 Sky-Terrace & Catch-Basins' }
  ];

  const schTargets = {
    palisade: [-475, 28, 495, -435, 4, 462],
    inner_wall: [-245, 42, 385, -195, 9, 345],
    hypogeum: [arena.x + 18, 12, arena.z + 18, arena.x, -3.2, arena.z],
    garrison: [fort.x - 84, 44, fort.z + 76, fort.x, 6, fort.z],
    ordinator: [ord.x - 76, 42, ord.z - 68, ord.x, 8, ord.z],
    bourse_l1: [-12.0, 2.35, 32.9, 2.0, 9.5, -6.0],
    trade_l3: [170, 26, 155, 0, 11.5, 0],
    vats_l6: [185, 38, 165, 0, 22.0, 0],
    fins_l10: [215, 56, 195, 0, 38.0, 0],
    fins_l14: [220, 74, -185, 0, 56.0, 0],
    sky_l15: [198, 86, -182, 0, 66.0, 0],
    scrap_mkt: [bourse.x + 80, 44, bourse.z + 78, bourse.x, 6, bourse.z]
  };

  const schematic = {
    title: 'Drum Radial & 15-Level Arcology Line Map (click station)',
    key: 'l',
    w: 344,
    h: 188,
    lines: {
      hoist: '#e0c070',
      radial: '#c98a55',
      sub: '#8a7ab8'
    },
    nodes: [
      { id: 'sky_l15', name: 'L15 Sky-Terrace (+66m)', kind: 'station', x: 52, depth: -66, col: '#9fd3ff' },
      { id: 'fins_l14', name: 'L11-14 Upper Fins', kind: 'station', x: 52, depth: -52, col: '#d8c89a' },
      { id: 'fins_l10', name: 'L7-10 Lower Fins', kind: 'station', x: 52, depth: -36, col: '#d8c89a' },
      { id: 'vats_l6', name: 'L4-6 Vats & Forges', kind: 'station', x: 52, depth: -20, col: '#b8d090' },
      { id: 'trade_l3', name: 'L2-3 Silos', kind: 'lift', x: 52, depth: -9, col: '#e0c070' },
      { id: 'bourse_l1', name: 'L1 Bourse (r=0)', kind: 'loj', x: 52, depth: 0, col: '#f0d280' },
      { id: 'scrap_mkt', name: 'Scrap-Mkt (r=330m)', kind: 'station', x: 72, depth: 0, col: '#e09a5c' },
      { id: 'inner_wall', name: 'Inner Wall W1 (402m)', kind: 'junction', x: 84, depth: 0, col: '#cfc8b8' },
      { id: 'palisade', name: 'Vehicle W2 (636m)', kind: 'station', x: 98, depth: 0, col: '#b86848' },
      { id: 'garrison', name: 'Garrison (SW)', kind: 'station', x: 26, depth: 0, col: '#d8aa3e' },
      { id: 'ordinator', name: 'Ordinators (W)', kind: 'station', x: 10, depth: 0, col: '#b85060' },
      { id: 'hypogeum', name: 'F-1 Hypogeum (-4m)', kind: 'station', x: 28, depth: 12, col: '#a890d0' }
    ],
    edges: [
      { a: 'sky_l15', b: 'fins_l14', line: 'hoist', state: 'solid' },
      { a: 'fins_l14', b: 'fins_l10', line: 'hoist', state: 'solid' },
      { a: 'fins_l10', b: 'vats_l6', line: 'hoist', state: 'solid' },
      { a: 'vats_l6', b: 'trade_l3', line: 'hoist', state: 'solid' },
      { a: 'trade_l3', b: 'bourse_l1', line: 'hoist', state: 'solid' },
      { a: 'bourse_l1', b: 'scrap_mkt', line: 'radial', state: 'solid' },
      { a: 'scrap_mkt', b: 'inner_wall', line: 'radial', state: 'solid' },
      { a: 'inner_wall', b: 'palisade', line: 'radial', state: 'gap', time: 4 },
      { a: 'bourse_l1', b: 'garrison', line: 'radial', state: 'solid' },
      { a: 'garrison', b: 'ordinator', line: 'radial', state: 'solid' },
      { a: 'garrison', b: 'hypogeum', line: 'sub', state: 'solid' },
      { a: 'bourse_l1', b: 'hypogeum', line: 'sub', state: 'gap', time: 3 }
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
    // 1. Drim Rivrh NW channel (bearing 320 deg, dist 615 m)
    const nx = Math.cos(320 * deg), nz = Math.sin(320 * deg);
    const tx = -nz, tz = nx;
    const rivPts = [];
    for (let s = -18; s <= 18; s++) {
      const tm = s * 55;
      const dn = 615.0 + 18.0 * Math.sin(tm / 280.0);
      rivPts.push([dn * nx + tm * tx, dn * nz + tm * tz]);
    }
    for (let i = 1; i < rivPts.length; i++) {
      M.strip(rivPts[i - 1], rivPts[i], 38, { col: '#2c5462', y: 0.4, name: 'Drim Rivrh' });
    }

    // 2. Radial spokes & concentric ring roads
    for (let i = 0; i < DRUM_PLAN.roads.length; i++) {
      const rd = DRUM_PLAN.roads[i];
      if (rd.kind === 'ring') {
        const segs = 60;
        let prev = null;
        for (let k = 0; k <= segs; k++) {
          const dm = (360 * k) / segs;
          const p = [rd.r * Math.cos(dm * deg), rd.r * Math.sin(dm * deg)];
          if (prev && !DRUM.inRiverCorridor(p[0], p[1], 6)) {
            M.strip(prev, p, Math.max(3, rd.width * 0.75), { col: rd.r < 402 ? '#6d665a' : '#584e3f', y: 1.1 });
          }
          prev = p;
        }
      } else {
        const a = rd.deg * deg;
        M.strip(
          [rd.r0 * Math.cos(a), rd.r0 * Math.sin(a)],
          [rd.r1 * Math.cos(a), rd.r1 * Math.sin(a)],
          Math.max(3, rd.width * 0.8),
          { col: '#787062', y: 1.2 }
        );
      }
    }

    // 3. Restored Ancient Inner Wall W1 (r=402m) & Outer Vehicle-Scrap Palisade W2 (r=636m)
    const wallSpecs = [
      { r: 402, w: 6.0, col: '#d4cec0', name: 'Restored Ancient Inner Wall W1' },
      { r: 636, w: 5.5, col: '#9e583c', name: 'Outer Ruined-Vehicle Palisade W2' }
    ];
    for (let wi = 0; wi < wallSpecs.length; wi++) {
      const ws = wallSpecs[wi];
      let prev = null;
      for (let k = 0; k <= 72; k++) {
        const dm = (360 * k) / 72;
        const p = [ws.r * Math.cos(dm * deg), ws.r * Math.sin(dm * deg)];
        if (prev && !(ws.r > 500 && DRUM.inRiverCorridor(p[0], p[1], 4))) {
          M.strip(prev, p, ws.w, { col: ws.col, y: 3.6, name: ws.name });
        }
        prev = p;
      }
    }

    // 4. Drum Arcology core & 4 vertical Fin staircases + Central Hoist mark
    M.disc(0, 0, 148, { col: '#8d8678', y: 4.5, name: 'Drum Arcology Core (Levels 1-15)' });
    M.disc(0, 0, 32, { col: '#3a352f', y: 4.8, name: 'Central Salvage Hoist Pit' });
    M.mark(0, 0, 66, { name: 'Central Salvage Hoist (L1..L15)', col: '#ffd97d' });
    const finAngles = [45, 135, 225, 315];
    for (let fi = 0; fi < finAngles.length; fi++) {
      const fa = finAngles[fi] * deg;
      M.mark(138 * Math.cos(fa), 138 * Math.sin(fa), 66, { name: 'Fin Dogleg Staircase', col: '#9fd3ff' });
    }
    M.mark(arena.x, arena.z, -4.2, { name: 'Cauldron Hypogeum (F-1)', col: '#e0a070' });
  }

  return {
    title: 'Drum (Drim)',
    frame: [-710, 710, -710, 710],
    size: 280,
    relief: { cell: 10, water: -0.8 },
    draw: drawOverlay,
    decks: {
      walk: KWALK,
      lo: -6,
      hi: 72,
      marks: true,
      dim: 0.28,
      bands: bands
    },
    schematic: schematic
  };
})();

KHOST.on(SKY.view, 'view');
KHOST.on(function () { DRUM_LIFE.sync(false); }, 'view');
KHOST.on(function () {
  if (typeof BIO !== 'undefined' && BIO && typeof BIO.lodTick === 'function') {
    camera.updateMatrixWorld(true);
    BIO.lodTick(camera);
  }
}, 'view');

function drumReachLandmarkStoreys(B, approachDist) {
  const c = Math.cos(B.lm.ry), s = Math.sin(B.lm.ry);
  const sx = B.lm.x + s * approachDist;
  const sz = B.lm.z + c * approachDist;
  const rad = Math.max(B.lm.w, B.lm.d) * 0.78;
  const res = KWALK.reach([[sx, 0, sz]], {
    box: [B.lm.x - rad, B.lm.x + rad, B.lm.z - rad, B.lm.z + rad],
    cell: 0.55,
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

function drumChecks() {
  const out = [];
  const rules = DRUM.checks(DRUM_PLAN);
  for (let i = 0; i < rules.length; i++) {
    out.push({ name: 'layout: ' + rules[i].name, ok: rules[i].pass, detail: rules[i].detail });
  }
  out.push({
    name: 'all concentric ring buildings placed (1/3 SW Arcology, 1/3 Scrap Voth, 1/3 Post-Apoc)',
    ok: DRUM_PLACED.missing.length === 0 && DRUM_PLACED.total === DRUM_PLAN.buildings.length,
    detail: 'placed ' + DRUM_PLACED.total + '/' + DRUM_PLAN.buildings.length +
      ' (swa=' + DRUM_PLACED.swa + ', voth-scrap=' + DRUM_PLACED.vothScrap + ', post-apoc=' + DRUM_PLACED.postApoc + ', ' + DRUM_PLACED.ms + ' ms)'
  });
  const vehCount = DRUM_WALLS_GROUP.userData.palisadeVehicleCount == null ? 0 : DRUM_WALLS_GROUP.userData.palisadeVehicleCount;
  out.push({
    name: 'outer palisade W2 forms continuous 3-tier wall of >= 600 stacked KratorVehicles wrecks',
    ok: vehCount >= 600,
    detail: vehCount + ' stacked/tilted/overturned Ancient Valley vehicles along W2 (r=636m)'
  });
  out.push({
    name: 'SWBay biome vegetation socketed cleanly (zero blobby placeholder flora)',
    ok: !!(typeof DRUM_FLORA !== 'undefined' && DRUM_FLORA.trees >= 60 && DRUM_FLORA.planters >= 12 && DRUM_FLORA.blobbyAncients === 0),
    detail: typeof DRUM_FLORA !== 'undefined'
      ? ('swbayTrees=' + DRUM_FLORA.trees + ', socketedPlanters=' + DRUM_FLORA.planters + ', dressedShells=' + DRUM_FLORA.dressedShells + ', blobbyAncients=' + DRUM_FLORA.blobbyAncients)
      : 'missing DRUM_FLORA'
  });

  // Stage 4 checks: multi-storey walkability, doors, furniture, cutaway, and KTAGS audit
  const gHit = drumReachLandmarkStoreys(DRUM_STAGE4.garrison, 55);
  const oHit = drumReachLandmarkStoreys(DRUM_STAGE4.ordinator, 41);
  const aHit = drumReachLandmarkStoreys(DRUM_STAGE4.arena, 41);
  out.push({
    name: 'Stage 4 landmark interiors walkable across all storeys (Garrison F-1..F2, Ordinator F-1..F2, Cauldron F-1..F1)',
    ok: gHit === 4 && oHit === 4 && aHit === 3,
    detail: 'garrison=' + gHit + '/4, ordinator=' + oHit + '/4, arena=' + aHit + '/3'
  });

  const p65 = 65 * Math.PI / 180;
  const arcRes = KWALK.reach([[220 * Math.cos(p65), 0, 220 * Math.sin(p65)]], {
    box: [-230, 230, -230, 230],
    cell: 0.50,
    step: 0.72,
    r: 0.30,
    h: 1.7,
    limit: 1500000
  });
  const arcLvls = new Set();
  for (let i = 0; i < arcRes.reached.length; i++) {
    const f = arcRes.reached[i];
    if (typeof f.tag === 'string' && f.tag.indexOf('drum_arcology:L') === 0) {
      arcLvls.add(parseInt(f.tag.slice(15), 10));
    }
  }
  out.push({
    name: 'Stage 4 Drum Arcology walkable from ground portal across all 15 inhabited levels + Sky-Terrace',
    ok: arcLvls.size >= 16,
    detail: 'levels reached=' + arcLvls.size + '/16 (L1..L15 + Sky-Terrace)'
  });

  const missKeys = Object.keys(DRUM_FURN.missing);
  out.push({
    name: 'Stage 4 KDOOR + KFURN populated cleanly (zero missing furniture keys)',
    ok: KDOOR.list.length >= 130 && DRUM_FURN.placed.length >= 250 && missKeys.length === 0,
    detail: 'doors=' + KDOOR.list.length + ', furniture=' + DRUM_FURN.placed.length + ', missing=' + missKeys.length
  });

  out.push({
    name: 'Stage 4 floorplan cutaway wired for Arcology + 3 hero landmarks',
    ok: !!(KHOST.cut && DRUM_CUTAWAY_UNITS.length === 4),
    detail: DRUM_CUTAWAY_UNITS.map(function (u) { return u.id + '(' + u.levels.length + ')'; }).join(', ')
  });

  const audit = DRUM_TAGS.audit();
  out.push({
    name: 'KTAGS audit clean across buildings + Stage 4 furniture (zero unknown vocabulary, zero missing culture)',
    ok: audit.unknown === 0 && audit.missingCulture === 0,
    detail: audit.records + ' records, unknown=' + audit.unknown + ', missingCulture=' + audit.missingCulture
  });

  // Stage 5 checks: 13,500-resident SIM, connected 3D nav, economy stocks, Voth trades, and noon Gladiatorial Arena bouts
  const simProblems = SIM.check();
  out.push({
    name: 'Stage 5 SIM.check() clean across 13,500 residents (5,400 Arcology + 8,100 Rings) + caravans/barges',
    ok: simProblems.length === 0 && DRUM_SIM.residents === 13500 && DRUM_SIM.arcologyResidents === 5400 && DRUM_SIM.outerResidents === 8100,
    detail: 'residents=' + DRUM_SIM.residents + ' (arc=' + DRUM_SIM.arcologyResidents + ', outer=' + DRUM_SIM.outerResidents + '), problems=' + simProblems.length
  });

  const pedLayer = SIM.nav.layers.pedestrian;
  let disconnectedNodes = 0;
  const body0 = SIM.nav.body('pedestrian', 0);
  for (let ni = 1; ni < pedLayer.nodes.length; ni++) {
    if (SIM.nav.body('pedestrian', ni) !== body0) disconnectedNodes++;
  }
  out.push({
    name: 'Stage 5 pedestrian navigation forms one connected component across rings, landmarks & 15 arcology levels',
    ok: pedLayer.nodes.length >= 300 && disconnectedNodes === 0,
    detail: pedLayer.nodes.length + ' nodes, ' + pedLayer.edges.length + ' edges, disconnected=' + disconnectedNodes
  });

  const alloyStock = SIM.stockOf('salvage_alloy');
  const breadStock = SIM.stockOf('bread');
  out.push({
    name: 'Stage 5 economy, 16 haul-carts, warehouses & DRUM_TRADES census wired',
    ok: alloyStock > 0 && breadStock > 0 && DRUM_SIM.carts === 16 && DRUM_TRADES.length === 44,
    detail: 'alloy=' + alloyStock + ', bread=' + breadStock + ', carts=' + DRUM_SIM.carts + ', trades=' + DRUM_TRADES.length
  });

  DRUM_SIM.refreshArenaCounts();
  const lifeCnt = DRUM_LIFE.counts();
  out.push({
    name: 'Stage 5 noon Gladiatorial Arena bouts & 3D citizen embodiment active in The Cauldron',
    ok: DRUM_SIM.arenaState.activeFighters >= 10 && DRUM_SIM.arenaState.activeSpectators >= 100 && lifeCnt.people >= 400,
    detail: 'fighters=' + DRUM_SIM.arenaState.activeFighters + ', spectators=' + DRUM_SIM.arenaState.activeSpectators + ', drawnPeople=' + lifeCnt.people
  });

  // Stage 6 checks: multi-deck minimap + schematic line map, KCITY plan export, and core/export Godot container + GLB
  const md = KHOST.minimapDecks;
  const mapExp = KHOST.minimap && typeof KHOST.minimap.export === 'function' ? KHOST.minimap.export() : null;
  const bandCur = md && typeof md.band === 'function' ? md.band() : null;
  out.push({
    name: 'Stage 6 radial + 15-level deck minimap & vertical schematic line map (L) active',
    ok: !!(md && bandCur && mapExp && mapExp.schematic && mapExp.schematic.nodes.length === 12 && mapExp.marks.length >= 5),
    detail: 'band=' + (bandCur ? bandCur[2] : 'none') + ', schematicNodes=' + (mapExp && mapExp.schematic ? mapExp.schematic.nodes.length : 0) +
      ', mapRecords=' + (mapExp ? mapExp.records.length : 0)
  });

  const kcityExp = DRUM_KCITY ? DRUM_KCITY.export() : null;
  out.push({
    name: 'Stage 6 KCITY instance populated across radial streets, walls & 2,562+ lots',
    ok: !!(kcityExp && kcityExp.format === 'krator-city' && kcityExp.lots.length >= 2562 && kcityExp.ways.length >= DRUM_PLAN.roads.length),
    detail: kcityExp ? ('lots=' + kcityExp.lots.length + ', ways=' + kcityExp.ways.length + ', gates=' + kcityExp.gates.length) : 'missing KCITY'
  });

  const exRes = DRUM_EXPORT && DRUM_EXPORT.available ? DRUM_EXPORT.verify() : null;
  const simChecks = exRes && exRes.world && exRes.world.sim ? DRUM.simExportChecks(exRes.world.sim) : [];
  for (let si = 0; si < simChecks.length; si++) out.push(simChecks[si]);
  out.push({
    name: 'Stage 6 Godot world export (EXPORT.world + EXPORT.check + EXPORT.glb) clean across all profile sections',
    ok: !!(exRes && exRes.check.ok && exRes.magicOk && exRes.world.errors.length === 0),
    detail: exRes ? ('ok=' + exRes.check.ok + ', problems=' + exRes.check.problems.length +
      ', items=' + exRes.world.items.length + ', buckets=' + exRes.world.buckets.length +
      ', glbKB=' + Math.round(exRes.glbBytes / 1024) + (exRes.check.problems.length ? ' [' + exRes.check.problems.slice(0, 3).join('; ') + ']' : '')) : 'export unavailable'
  });

  return out;
}

function drumNegatives() {
  const out = [];
  const badPop = JSON.parse(JSON.stringify(DRUM_PLAN));
  badPop.buildings[0].pop += 80;
  const f1 = !DRUM.RULES.populationSplit(badPop).pass;
  out.push({
    name: 'population drift away from 2/5 arcology (5,400) & 3/5 rings (8,100) fails check',
    failed: f1,
    ok: f1
  });
  const badSeal = JSON.parse(JSON.stringify(DRUM_PLAN));
  badSeal.links.push(['ring_r388', 'ring_r416', { kind: 'breach' }]);
  const f2 = !DRUM.RULES.gateSealingShut(badSeal).pass;
  out.push({
    name: 'ungated breach across Restored Ancient Inner Wall W1 fails gate-sealing check',
    failed: f2,
    ok: f2
  });

  // Stage 4 negative check: closing Garrison Fortress's portcullis & sally port blocks KWALK entry
  const dMain = KDOOR.get('door_fort_main_portcullis');
  const dSally = KDOOR.get('door_fort_sally');
  if (dMain) KDOOR.close(dMain);
  if (dSally) KDOOR.close(dSally);
  KDOOR.step(20);
  const shutStoreys = drumReachLandmarkStoreys(DRUM_STAGE4.garrison, 55);
  if (dMain) KDOOR.open(dMain);
  if (dSally) KDOOR.open(dSally);
  KDOOR.step(20);
  if (dMain) KDOORHOST.pose(dMain);
  if (dSally) KDOORHOST.pose(dSally);
  const f3 = shutStoreys === 0;
  out.push({
    name: 'closing Garrison Fortress portcullis & sally port seals all 4 interior storeys from KWALK entry',
    failed: f3,
    ok: f3
  });

  // Stage 5 negative check: corrupting an actor's workplace reference is caught by SIM.check()
  const probeActor = SIM.R.actor.arc_res_0;
  const savedWork = probeActor.work;
  const prevProbLen = SIM.problems.length;
  probeActor.work = 'nonexistent_salvage_pit_999';
  const badProblems = SIM.check();
  probeActor.work = savedWork;
  SIM.problems.length = prevProbLen;
  const f4 = badProblems.length > 0;
  out.push({
    name: 'Stage 5 SIM.check() catches broken actor workplace reference',
    failed: f4,
    ok: f4
  });

  // Stage 6 negative check: corrupting a bucket's material reference in an exported krator-world fails EXPORT.check()
  let f5 = false;
  if (DRUM_EXPORT && DRUM_EXPORT.available) {
    const exRes = DRUM_EXPORT.verify();
    if (exRes && exRes.world && exRes.world.buckets.length > 0) {
      const savedMat = exRes.world.buckets[0].material;
      exRes.world.buckets[0].material = 'drum:nonexistent_material_999';
      const badExportChk = EXPORT.check(exRes.world, { uid: KTAGS.uid, profile: DRUM_EXPORT.PROFILE });
      exRes.world.buckets[0].material = savedMat;
      f5 = !badExportChk.ok && badExportChk.problems.length > 0;
    }
  }
  out.push({
    name: 'Stage 6 EXPORT.check() catches broken bucket material reference against Drum profile',
    failed: f5,
    ok: f5
  });

  return out;
}

KHOST.take({
  build: 'drum',
  title: 'Drum (Drim / Vinvolk) — Stage 6',
  hint: 'Drum (Stage 6): 13,500 simulated citizens (5,400 in inhabited Levels 1-15 of the ruined Drum Arcology; 8,100 in concentric rings of 1/3 SW Arcology, 1/3 Scrap Voth, 1/3 Post-Apoc), live salvage/mushroom economy, noon Gladiatorial Arena bouts in The Cauldron, 7-band Deck Minimap + Vertical Line Map (L), and full Godot core/export profile. Space/Play for time, F to walk, E for doors, M for minimap, L for vertical line map, X and [ / ] for cutaway.',
  scene: scene,
  camera: camera,
  renderer: renderer,
  ground: drumGroundAt,
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
    units: DRUM_CUTAWAY_UNITS
  },
  layers: {
    'Citizens & Arena Life': [DRUM_LIFE.group],
    'SWBay Flora & Overgrowth': [DRUM_FLORA.group]
  },
  holds: KHOST.simHolds(SIM),
  clear: 1.6,
  minR: 3,
  maxR: 6000,
  registry: ANC_REG,
  views: VIEWS,
  ticks: ANC_TICKS,
  clock: {
    obj: DRUM_CLOCK,
    onSet: function () {
      SIM.jump();
      if (SIM.stepHooks && SIM.stepHooks[0]) SIM.stepHooks[0](SIM.minute());
      DRUM_LIFE.sync(true);
    }
  },
  draw: SKY.draw,
  records: function () { return DRUM_TAGS.query({}); },
  stats: function () {
    const lc = DRUM_LIFE.counts();
    return 'pop ' + DRUM_SIM.residents + ' (drawn ' + lc.people + ' + ' + lc.beasts + ' beasts)  arena ' + DRUM_SIM.arenaState.phase +
      '\nbld ' + DRUM_PLACED.total + '  doors ' + KDOOR.list.length + '  furn ' + DRUM_FURN.placed.length +
      '  calls ' + renderer.info.render.calls + '  tris ' + (renderer.info.render.triangles / 1e6).toFixed(2) + 'M';
  },
  minimap: DRUM_MINIMAP,
  budget: { showcase: { tris: 22500000, calls: 1360 }, cls: {}, type: {} },
  api: {
    hostChecks: drumChecks,
    hostNegatives: drumNegatives,
    exportWorld: function (opt) { return EXPORT.world(Object.assign({ box: DRUM_EXPORT.BOX, build: 'drum' }, opt || {})); },
    drum: function () {
      return {
        pop: DRUM_PLAN.pop,
        kitCounts: DRUM_PLAN.kitCounts,
        placed: DRUM_PLACED,
        walk: DRUM_WALK_STATS,
        furn: DRUM_FURN.summary(),
        sim: DRUM_SIM,
        life: DRUM_LIFE.counts(),
        flora: { trees: DRUM_FLORA.trees, planters: DRUM_FLORA.planters, dressedShells: DRUM_FLORA.dressedShells },
        palisadeVehicles: DRUM_WALLS_GROUP.userData.palisadeVehicleCount,
        exportBox: DRUM_EXPORT.BOX,
        exportProfile: DRUM_EXPORT.PROFILE
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
