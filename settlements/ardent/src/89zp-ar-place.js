/* ================================================================= ARDENT — Placement Pass, Curtain Walls, Cobbles, Burn & Flora
   [draw] Registers all records in KTAGS.page first, sets settlement-scale furniture detail (0.5) for 500+ buildings,
   places all KCITY burgh structures, curtain walls, watchtowers, corner bastions & twin-koshki gatehouses with sloped
   granite plinths, builds terrain-draped MAT.cobble streets & plazas, draws Ardent Burn via WATER.drawFlow, wires KWALK,
   and scatters biomes/nhighlands fir, birch, pine & willow flora outside the walled capital. */
const AR_PLACE = (function () {
  const t0 = performance.now();
  const L = AR_LAYOUT.plan;

  /* 1. Register every structure, curtain wall, Thing-Stone, ore node, camp & citizen in KTAGS.page BEFORE drawing */
  const T = (typeof KTAGS !== 'undefined' && KTAGS.page) ? KTAGS.page : KTAGS.create({ build: 'ardent' });
  T.build = 'ardent';
  KTAGS.page = T;
  if (typeof HLF !== 'undefined' && HLF) {
    HLF.tags = T;
    /* Settlement-scale furniture detail (0.32) + 180 m LOD chunking so 915 placed records stay well under 4.0M tris */
    HLF.draw = function (rec, ctx) {
      KFURN.drawRec(HLF, rec, ctx.wealth, { detail: 0.32, after: 0.35 });
    };
  }
  const tagCount = AR_RULES.registerTags(L, T);

  /* 2. Tune MAT.gold slightly warmer toward Ardent's signature cast tin-bronze (bells, clan discs, finials) */
  if (typeof MAT !== 'undefined' && MAT.gold) {
    MAT.gold.roughness = 0.34;
    MAT.gold.metalness = 0.56;
  }

  const placed = [];
  const missing = [];
  const plinthColor = vC(0x6e6a62);
  const capColor = vC(0x8a8478);
  const occSpace = KSPACE.create({ cell: 24 });

  function minCornerGround(x, z, w, d, ry) {
    const hw = w * 0.48;
    const hd = d * 0.48;
    const c = Math.cos(ry);
    const s = Math.sin(ry);
    let lo = AR_GROUND.h(x, z);
    const pts = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd], [0, -hd], [0, hd], [-hw, 0], [hw, 0]];
    for (let i = 0; i < pts.length; i++) {
      const lx = pts[i][0];
      const lz = pts[i][1];
      const gy = AR_GROUND.h(x + lx * c + lz * s, z - lx * s + lz * c);
      if (gy < lo) lo = gy;
    }
    return lo;
  }

  function addSlopePlinth(r) {
    if (r.key === 'hl_rus_cobbled_bridge' || r.key === 'hl_rus_thing_ring') return;
    if (r.key === 'hl_rus_burgh_wall') {
      const lo = minCornerGround(r.x, r.z, r.w, 4.6, r.ry);
      const bot = Math.min(lo - 1.1, r.y - 0.9);
      const top = r.y + 0.04;
      const h = top - bot;
      if (h <= 0.05) return;
      const q = r.ry ? qEuler(0, r.ry, 0) : null;
      kput('hRubB', [r.x, bot + h * 0.5, r.z], q, [r.w + 0.08, h, 4.55], plinthColor);
      return;
    }
    if (r.key === 'hl_rus_burgh_gate') {
      /* Flank plinths under the twin koshki gate-towers only so the central 4.8 m cobbled pend road stays clear */
      const lo = minCornerGround(r.x, r.z, r.w, r.d, r.ry);
      const bot = Math.min(lo - 1.1, r.y - 0.9);
      const top = r.y + 0.02;
      const h = top - bot;
      if (h <= 0.05) return;
      const c = Math.cos(r.ry);
      const s = Math.sin(r.ry);
      const q = r.ry ? qEuler(0, r.ry, 0) : null;
      for (const sg of [-1, 1]) {
        const px = r.x + sg * 6.0 * c;
        const pz = r.z - sg * 6.0 * s;
        kput('hRubB', [px, bot + h * 0.5, pz], q, [5.4, h, r.d * 0.92], plinthColor);
      }
      return;
    }
    const lo = minCornerGround(r.x, r.z, r.w, r.d, r.ry);
    const bot = Math.min(lo - 0.85, r.y - 0.75);
    const top = r.y - 0.02;
    const h = top - bot;
    if (h <= 0.05) return;
    const q = r.ry ? qEuler(0, r.ry, 0) : null;
    kput('hRubB', [r.x, bot + h * 0.5, r.z], q, [r.w * 0.95, h, r.d * 0.95], plinthColor);
    if (h > 1.05) {
      kput('vStone', [r.x, top - 0.13, r.z], q, [r.w * 0.98, 0.22, r.d * 0.98], capColor);
    }
  }

  function wealthIdx(w) {
    return w === 'poor' ? 0 : w === 'rich' ? 2 : 1;
  }

  function placeRecord(r) {
    occSpace.insert(r, r.x, r.z, Math.hypot(r.w, r.d) * 0.55);
    addSlopePlinth(r);
    if (typeof VERN === 'undefined' || !VERN.defs[r.key]) {
      missing.push(r.id + ':' + r.key);
      return;
    }
    TSTAT.cur = r.key + '/' + r.id;
    const r0 = REG.length;
    const opts = {
      y: r.y,
      v: r.v == null ? 0 : r.v,
      w: wealthIdx(r.wealth),
      cw: r.w,
      cd: r.d,
      ch: r.h,
      scale: 1,
      lit: false
    };
    const G = withFlatGround(function () {
      return VERN.place(scene, r.key, r.x, r.z, r.ry, opts);
    });
    if (G) {
      placed.push(r.id);
      for (let i = r0; i < REG.length; i++) {
        REG[i].type = r.key;
        if (r.name && i === r0) REG[i].name = r.name;
      }
    } else {
      missing.push(r.id + ':' + r.key);
    }
  }

  /* 3. Place all burgh, citadel, muster, foundry, mine & croft buildings + full curtain-wall ring */
  for (let i = 0; i < L.structures.length; i++) {
    placeRecord(L.structures[i]);
  }
  for (let wi = 0; wi < L.walls.length; wi++) {
    placeRecord(L.walls[wi]);
  }

  /* 4. Build terrain-draped MAT.cobble streets & squares, plus copper/tin RES_ORE outcrops & Silk-Trail KCAMP camps */
  const cobbleMesh = AR_STAGE.buildCobblePaving();
  for (let oi = 0; oi < L.oreNodes.length; oi++) {
    AR_STAGE.placeOreNode(L.oreNodes[oi]);
    placed.push(L.oreNodes[oi].id);
  }
  for (let ci = 0; ci < L.camps.length; ci++) {
    AR_STAGE.placeCamp(L.camps[ci]);
    placed.push(L.camps[ci].id);
  }

  /* 5. Bake all instanced building primitives & textured catalog furniture */
  TSTAT.cur = null;
  window._registered = REG.length;
  kbake(scene);

  /* 6. Draw Ardent Burn (Mekam-aru headwater) via WATER.flow + WATER.drawFlow */
  const burnFlow = WATER.flow({
    name: L.burn.name,
    pts: L.burn.pts,
    width: L.burn.width,
    speed: L.burn.speed
  });
  const burnDrawn = WATER.drawFlow(burnFlow, {
    THREE: THREE,
    scene: scene,
    color: 0x254e52,
    shallow: 0x5c8478,
    deep: 0x19393f,
    roughness: 0.14,
    metalness: 0.10,
    step: 6,
    across: 6,
    margin: 1.5,
    pick: true
  });

  /* 7. Wire KWALK navigation strips across cobbled wynds, squares, humpback brigs & Thing-Crag */
  if (typeof KWALK !== 'undefined') {
    const allWays = L.ways || [];
    for (let wi = 0; wi < allWays.length; wi++) {
      const w = allWays[wi];
      const pts = w.pts || [];
      const ww = w.w == null ? 4.4 : w.w;
      for (let pi = 0; pi + 1 < pts.length; pi++) {
        const a = pts[pi];
        const b = pts[pi + 1];
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5) continue;
        const midX = (a[0] + b[0]) * 0.5;
        const midZ = (a[1] + b[1]) * 0.5;
        const spansBurn = Math.abs(midZ - AR_GROUND.burnZ(midX)) < 9.0;
        const ya = spansBurn ? AR_GROUND.burnWaterY(a[0]) + 1.55 : AR_GROUND.h(a[0], a[1]);
        const yb = spansBurn ? AR_GROUND.burnWaterY(b[0]) + 1.55 : AR_GROUND.h(b[0], b[1]);
        KWALK.strip({
          a: [a[0], a[1], ya],
          b: [b[0], b[1], yb],
          w: ww,
          name: w.id || 'wynd',
          tag: 'road'
        });
      }
    }
    const plazas = L.plazas || [];
    for (let qi = 0; qi < plazas.length; qi++) {
      const q = plazas[qi];
      KWALK.floor({
        rect: [q.x0, q.x1, q.z0, q.z1],
        y: AR_GROUND.h(0.5 * (q.x0 + q.x1), 0.5 * (q.z0 + q.z1)),
        name: q.name,
        tag: 'plaza'
      });
    }
    for (let bi = 0; bi < L.structures.length; bi++) {
      const br = L.structures[bi];
      if (!br || br.key === 'hl_rus_burgh_gate' || br.key === 'hl_rus_cobbled_bridge' || br.key === 'hl_rus_thing_ring') continue;
      const hw = Math.max(1.5, br.w * 0.36);
      const hd = Math.max(1.5, br.d * 0.36);
      KWALK.block([br.x - hw, br.x + hw, br.z - hd, br.z + hd, br.y - 1.5, br.y + 8.0], 'building');
    }
  }

  /* 8. Highland timberline flora (biomes/nhighlands) outside the walled capital, Thing-Crag & Foundry Suburb */
  let floraReport = null;
  if (typeof AR_FLORA !== 'undefined' && AR_FLORA.BIO && AR_FLORA.NHL) {
    const obsList = [];
    for (let i = 0; i < L.structures.length; i++) {
      const r = L.structures[i];
      obsList.push({ x: r.x, z: r.z, r: Math.hypot(r.w, r.d) * 0.58 + 5.0 });
    }
    for (let wi = 0; wi < L.walls.length; wi++) {
      const wr = L.walls[wi];
      obsList.push({ x: wr.x, z: wr.z, r: Math.hypot(wr.w, wr.d) * 0.55 + 4.0 });
    }
    for (let ci = 0; ci < L.camps.length; ci++) {
      const cp = L.camps[ci];
      obsList.push({ x: cp.center[0], z: cp.center[1], r: 24.0 });
    }
    AR_FLORA.BIO.init({
      THREE: THREE,
      scene: scene,
      terrainH: function (x, z) { return AR_GROUND.h(x, z); },
      waterH: function (x, z) {
        return Math.abs(z - AR_GROUND.burnZ(x)) < 6.5 ? AR_GROUND.burnWaterY(x) : -1e9;
      },
      obstacles: obsList,
      ticks: function (fn) { FRAME_HOOKS_PRE.push(fn); },
      seed: 830553,
      origin: [[-380, 260], [380, 260], [-360, -320], [360, -320]],
      center: [0, 0],
      mask: function (x, z) {
        if (AR_STAGE.roadMask.sample(x, z) > 0.08) return 0;
        /* Keep walled capital, Thing-Crag, Muster Green & Foundry bank open */
        if (x > -278 && x < 278 && z > -278 && z < 278) return 0;
        if (Math.hypot(x - AR_GROUND.thingCrag.x, z - AR_GROUND.thingCrag.z - 12) < 138) return 0;
        if (x > 280 && x < 505 && z > -110 && z < 110) return 0;
        if (x > -245 && x < 245 && z > -455 && z < -290) return 0;
        if (Math.abs(z - AR_GROUND.burnZ(x)) < 13.0) return 0;
        if (occSpace.some(x, z, 16, function () { return true; })) return 0;
        return 0.72;
      },
      fields: {
        cold: function (x, z) {
          const y = AR_GROUND.h(x, z);
          return Math.max(0.68, Math.min(0.92, 0.76 + y * 0.0022));
        },
        wet: function (x, z) {
          const db = Math.abs(z - AR_GROUND.burnZ(x));
          return db < 55 ? 0.76 : 0.52;
        },
        flow: function () { return 0.14; },
        mist: function (x, z) { return Math.abs(z - AR_GROUND.burnZ(x)) < 40 ? 0.28 : 0.12; },
        rock: function (x, z) { return AR_GROUND.slope(x, z) > 0.20 ? 0.78 : 0.34; },
        upland: function () { return 0.86; }
      }
    });
    floraReport = AR_FLORA.NHL.build({
      R: 860,
      quality: 0.12,
      flora: false,
      box: [-880, 880, -720, 680]
    });
    if (typeof AR_FLORA.NHL.treeAt === 'function') {
      const heroTrees = [
        [-292,  145, 'frostfir',   1.02], [-298,  -85, 'birch',       0.94], [ 292,  142, 'frostfir',   1.04],
        [ 296,  -98, 'cragpine',   1.00], [-142,  290, 'cragpine',   1.06], [ 142,  290, 'cragpine',   1.05],
        [-132,  438, 'frostfir',   1.05], [ 134,  442, 'frostfir',   1.04], [   8,  482, 'spirespruce',1.08],
        [-205, -292, 'brookwillow',0.95], [ -78, -290, 'brookwillow',0.94], [  76, -290, 'birch',       0.92],
        [ 204, -292, 'brookwillow',0.96], [-255, -395, 'frostfir',   1.00], [ 258, -398, 'spirespruce',1.02]
      ];
      for (let ti = 0; ti < heroTrees.length; ti++) {
        const ht = heroTrees[ti];
        const tx = ht[0], tz = ht[1], spKey = ht[2], sc = ht[3];
        if (AR_STAGE.roadMask.sample(tx, tz) > 0.12) continue;
        if (occSpace.some(tx, tz, 11, function () { return true; })) continue;
        AR_FLORA.NHL.treeAt(tx, AR_GROUND.h(tx, tz), tz, spKey, { scale: sc, lv: 2 });
      }
    }
    AR_FLORA.BIO.bake();
  }

  /* 9. Attach interactive door host */
  if (typeof KDOORHOST !== 'undefined' && typeof KDOORHOST.attach === 'function') {
    KDOORHOST.attach({ THREE: THREE, scene: scene, camera: camera, ticks: TICKS });
  }

  return {
    placed: placed,
    missing: missing,
    tags: T,
    tagCount: tagCount,
    cobbleMesh: cobbleMesh,
    burn: burnDrawn,
    flora: floraReport,
    ms: Math.round(performance.now() - t0)
  };
})();
