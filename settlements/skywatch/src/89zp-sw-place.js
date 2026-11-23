// ================================================================= SKYWATCH — Placement Pass, Still Water, KWALK, KRUINS & Subalpine Flora
// [draw] Registers all records in KTAGS.page first, places all 5 tiers' structures, curtain walls & skarn ore nodes with
// sloped-ground basalt plinths, draws core/water still cisterns, wires KWALK & KRUINS.watch, and bakes subalpine flora.
const SW_PLACE = (function () {
  if (typeof JJFURN !== 'undefined' && typeof JJFURN.place === 'function') {
    const jjFurnPlace0 = JJFURN.place;
    JJFURN.place = function (sc, key, x, z, ry, opts) {
      const savedKxf = KXF;
      const savedStack = typeof _XFSTACK !== 'undefined' ? _XFSTACK.slice() : null;
      KXF = null;
      if (typeof _XFSTACK !== 'undefined') _XFSTACK.length = 0;
      try {
        return jjFurnPlace0.call(this, sc, key, x, z, ry, opts);
      } finally {
        KXF = savedKxf;
        if (savedStack && typeof _XFSTACK !== 'undefined') {
          _XFSTACK.length = 0;
          for (let i = 0; i < savedStack.length; i++) _XFSTACK.push(savedStack[i]);
        }
      }
    };
  }
  const t0 = performance.now();
  const L = SW_LAYOUT.plan;
  const T = (typeof KTAGS !== 'undefined' && KTAGS.page) ? KTAGS.page : KTAGS.create({ build: 'skywatch' });
  T.build = 'skywatch';
  KTAGS.page = T;
  const tagCount = SW_RULES.registerTags(L, T);

  const placed = [];
  const wallPlaced = [];
  const missing = [];
  const plinthColor = vC(0x3a3e47);
  const capColor = vC(0x525763);
  const occSpace = KSPACE.create({ cell: 28 });

  function minCornerGround(x, z, w, d, ry) {
    const hw = w * 0.48;
    const hd = d * 0.48;
    const c = Math.cos(ry);
    const s = Math.sin(ry);
    let lo = SW_GROUND.h(x, z);
    const pts = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd], [0, -hd], [0, hd], [-hw, 0], [hw, 0]];
    for (let i = 0; i < pts.length; i++) {
      const lx = pts[i][0];
      const lz = pts[i][1];
      const gy = SW_GROUND.h(x + lx * c + lz * s, z - lx * s + lz * c);
      if (gy < lo) lo = gy;
    }
    return lo;
  }

  function addSlopePlinth(r) {
    if (r.key === 'sw_step_cistern' || r.key === 'sw_salvage_assay' || r.key === 'sw_moot_monolith') return;
    if (r.key === 'jj_wall_seg') {
      const lo = minCornerGround(r.x, r.z, r.w, 6.4, r.ry);
      const bot = Math.min(lo - 1.2, r.y - 1.0);
      const top = r.y + 0.04;
      const h = top - bot;
      if (h <= 0.05) return;
      const q = r.ry ? qEuler(0, r.ry, 0) : null;
      kput('vStone', [r.x, bot + h * 0.5, r.z], q, [r.w + 0.06, h, 6.36], plinthColor);
      if (h > 1.1) {
        kput('vStone', [r.x, r.y - 0.14, r.z], q, [r.w + 0.08, 0.24, 6.44], capColor);
      }
      return;
    }
    if (r.key === 'jj_wall_tower' || r.key === 'jj_wall_corner') {
      const rad = r.key === 'jj_wall_corner' ? 5.98 : 4.91;
      const lo = minCornerGround(r.x, r.z, rad * 2.0, rad * 2.0, 0);
      const bot = Math.min(lo - 1.4, r.y - 1.1);
      const top = r.y + 0.05;
      const h = top - bot;
      if (h <= 0.05) return;
      kput('swCylStone', [r.x, bot, r.z], null, [rad, h, rad], plinthColor);
      if (h > 1.1) {
        kput('swCylStone', [r.x, r.y - 0.26, r.z], null, [rad + 0.08, 0.24, rad + 0.08], capColor);
      }
      return;
    }
    if (r.key === 'jj_wall_gate') {
      const lo = minCornerGround(r.x, r.z, 24.2, 15.2, r.ry);
      const bot = Math.min(lo - 1.4, r.y - 1.1);
      const top = r.y + 0.03;
      const h = top - bot;
      if (h <= 0.05) return;
      const q = r.ry ? qEuler(0, r.ry, 0) : null;
      kput('vStone', [r.x, bot + h * 0.5, r.z], q, [24.04, h, 9.36], plinthColor);
      const c = Math.cos(r.ry);
      const s = Math.sin(r.ry);
      for (const sg of [-1, 1]) {
        const sx = r.x + (sg * 6.4) * c + 3.6 * s;
        const sz = r.z - (sg * 6.4) * s + 3.6 * c;
        kput('swCylStone', [sx, bot, sz], null, [3.73, h, 3.73], plinthColor);
      }
      for (const az of [-5.6, 5.6]) {
        const ax = r.x + az * s;
        const azw = r.z + az * c;
        const agy = SW_GROUND.h(ax, azw);
        const ah = (r.y + 0.02) - Math.min(agy - 0.8, r.y - 0.6);
        kput('vStone', [ax, (r.y + 0.02) - ah * 0.5, azw], q, [5.4, ah, 2.2], capColor);
      }
      return;
    }
    const lo = minCornerGround(r.x, r.z, r.w, r.d, r.ry);
    const bot = Math.min(lo - 0.9, r.y - 0.8);
    const top = r.y - 0.02;
    const h = top - bot;
    if (h <= 0.05) return;
    const q = r.ry ? qEuler(0, r.ry, 0) : null;
    kput('vStone', [r.x, bot + h * 0.5, r.z], q, [r.w * 0.96, h, r.d * 0.96], plinthColor);
    if (h > 1.1) {
      kput('vStone', [r.x, top - 0.14, r.z], q, [r.w * 0.99, 0.24, r.d * 0.99], capColor);
    }
  }

  function snapshotKitCounts() {
    const out = {};
    for (let i = 0; i < KIT.order.length; i++) {
      const k = KIT.order[i];
      out[k] = KIT.items[k].length;
    }
    return out;
  }

  function diffKitCounts(before) {
    const slices = [];
    for (let i = 0; i < KIT.order.length; i++) {
      const k = KIT.order[i];
      const b = before[k] == null ? 0 : before[k];
      const a = KIT.items[k].length;
      if (a > b) slices.push([k, b, a]);
    }
    return slices;
  }

  function placeRecord(r) {
    const v = r.v == null ? (KRAND.hash(776470, r.id) % 3) : r.v;
    const opts = {
      y: r.y,
      v: v,
      scale: r.scale == null ? 1 : r.scale,
      lit: !!r.lit,
      cw: r.w,
      cd: r.d,
      ch: r.h,
      aditKind: r.aditKind,
      idx: r.monolithIndex == null ? 0 : r.monolithIndex,
      equinoxSight: !!r.portalPair,
      side: r.side
    };

    const isWall = !!r.wallRun;
    const snapAll = isWall ? snapshotKitCounts() : null;
    occSpace.insert(r, r.x, r.z, Math.hypot(r.w, r.d) * 0.55);
    addSlopePlinth(r);
    const snapBody = isWall ? snapshotKitCounts() : null;

    let G = null;
    TSTAT.cur = r.key + '/' + r.id;
    if (typeof JJ !== 'undefined' && JJ.defs[r.key]) {
      G = withFlatGround(function () {
        return JJ.place(scene, r.key, r.x, r.z, r.ry, opts);
      });
    } else if (typeof VERN !== 'undefined' && VERN.defs[r.key]) {
      G = withFlatGround(function () {
        return VERN.place(scene, r.key, r.x, r.z, r.ry, opts);
      });
    } else {
      missing.push(r.id + ':' + r.key);
      return;
    }

    if (G) {
      placed.push(r.id);
      if (isWall) {
        G.userData.swWallId = r.id;
        G.userData.swWallKey = r.key;
        wallPlaced.push({
          id: r.id,
          key: r.key,
          x: r.x,
          y: r.y,
          z: r.z,
          ry: r.ry,
          w: r.w,
          d: r.d,
          h: r.h,
          ringIdx: r.ringIdx,
          spanIdx: r.spanIdx,
          segIdx: r.segIdx,
          segCount: r.segCount,
          nodeA: r.nodeA,
          nodeB: r.nodeB,
          group: G,
          allSlices: diffKitCounts(snapAll),
          bodySlices: diffKitCounts(snapBody)
        });
      }
    } else {
      missing.push(r.id + ':' + r.key);
    }
  }

  /* 1. Place all 5 tiers' structures & curtain walls */
  for (let i = 0; i < L.structures.length; i++) {
    placeRecord(L.structures[i]);
  }
  for (let wi = 0; wi < L.walls.length; wi++) {
    placeRecord(L.walls[wi]);
  }

  /* Place glowing stone-ringed hearths at each KCAMP center */
  for (let ci = 0; ci < L.camps.length; ci++) {
    const cp = L.camps[ci];
    if (cp.hearth && cp.hearth.length >= 2) {
      const hx = cp.hearth[0];
      const hz = cp.hearth[1];
      const hy = SW_GROUND.h(hx, hz);
      const isSq = cp.culture === 'sasquatch';
      withFlatGround(function () {
        VERN.place(scene, isSq ? 'sw_sq_hearth' : 'sw_convoy_fire', hx, hz, 0, { y: hy, cw: isSq ? 4.2 : 3.2 });
      });
    }
  }

  /* 2. Place visible RES_ORE skarn outcrops (copper=120, zinc=96, iron=60, saltpeter=83, turquoise=45) */
  for (let ni = 0; ni < L.oreNodes.length; ni++) {
    SW_LANDMARKS.placeOreNode(L.oreNodes[ni]);
    placed.push(L.oreNodes[ni].id);
  }

  /* 3. Resolve coplanar faces & bake instanced kits + catalog furniture */
  TSTAT.cur = null;
  if (typeof jjZFix === 'function') jjZFix();
  kbake(scene);

  /* 4. Audit Ancient salvage assay yard with KRUINS.watch */
  for (let si = 0; si < SW_LANDMARKS.salvageGroups.length; si++) {
    KRUINS.watch(SW_LANDMARKS.salvageGroups[si], {
      name: 'Salvage Assay Yard',
      ground: function (x, z) { return SW_GROUND.h(x, z); }
    });
  }

  /* 5. Draw core/water still basins inside both Vaulted Rock-Cut Step-Cisterns */
  const stillDrawn = [];
  for (let ci = 0; ci < L.cisterns.length; ci++) {
    const c = L.cisterns[ci];
    const hw = c.pitW * 0.56;
    const hd = c.pitD * 0.54;
    const S = WATER.still({
      name: c.name,
      level: c.waterY,
      poly: [
        [c.x - hw, c.z - hd],
        [c.x + hw, c.z - hd],
        [c.x + hw, c.z + hd],
        [c.x - hw, c.z + hd]
      ]
    });
    const D = WATER.drawStill(S, {
      THREE: THREE,
      scene: scene,
      color: 0x1a3e46,
      roughness: 0.06,
      metalness: 0.14,
      envMapIntensity: 0.48,
      pick: true
    });
    stillDrawn.push(D);
  }
  window._still = stillDrawn.length;

  /* 6. Wire KWALK navigation strips & plazas across roads, gates, crag & Silent Moot */
  if (typeof KWALK !== 'undefined') {
    const allWays = L.ways || [];
    for (let wi = 0; wi < allWays.length; wi++) {
      const w = allWays[wi];
      const pts = w.pts || [];
      const ww = w.w == null ? 6.0 : w.w;
      for (let pi = 0; pi + 1 < pts.length; pi++) {
        const a = pts[pi];
        const b = pts[pi + 1];
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5) continue;
        KWALK.strip({
          a: [a[0], a[1], SW_GROUND.h(a[0], a[1])],
          b: [b[0], b[1], SW_GROUND.h(b[0], b[1])],
          w: ww,
          name: w.id || 'pass-road',
          tag: 'road'
        });
      }
    }
    KWALK.floor({ rect: [-570, -530, -284, -244], y: SW_GROUND.h(-550, -264) + 1.2, name: 'Horizon Ring Terrace', tag: 'plaza' });
    KWALK.floor({ rect: [358, 402, -1162, -1118], y: SW_GROUND.h(380, -1140), name: 'The Silent Moot', tag: 'plaza' });
    KWALK.floor({ rect: [430, 494, 153, 217], y: SW_GROUND.h(462, 185), name: 'Caravanserai Forecourt', tag: 'plaza' });
    for (let bi = 0; bi < L.structures.length; bi++) {
      const br = L.structures[bi];
      if (!br || br.cls !== 'building' || br.key === 'jj_gate' || br.key === 'sw_step_cistern' || br.key === 'sw_horizon_ring') continue;
      const hw = Math.max(1.5, br.w * 0.36);
      const hd = Math.max(1.5, br.d * 0.36);
      KWALK.block([br.x - hw, br.x + hw, br.z - hd, br.z + hd, br.y - 1.5, br.y + 8.0], 'building');
    }
  }

  /* 7. Subalpine timberline flora (biomes/nhighlands on CORE_BIOME_MIN): sparse larch, stonepine & alpine cushion turf */
  let floraReport = null;
  if (typeof SW_FLORA !== 'undefined' && SW_FLORA.BIO && SW_FLORA.NHL) {
    const obsList = [];
    for (let i = 0; i < L.structures.length; i++) {
      const r = L.structures[i];
      obsList.push({ x: r.x, z: r.z, r: Math.hypot(r.w, r.d) * 0.58 + 5.0 });
    }
    for (let wi = 0; wi < L.walls.length; wi++) {
      const wr = L.walls[wi];
      obsList.push({ x: wr.x, z: wr.z, r: Math.hypot(wr.w, wr.d) * 0.55 + 3.5 });
    }
    SW_FLORA.BIO.init({
      THREE: THREE,
      scene: scene,
      terrainH: function (x, z) { return SW_GROUND.h(x, z); },
      waterH: function () { return -1e9; },
      obstacles: obsList,
      ticks: function (fn) { FRAME_HOOKS_PRE.push(fn); },
      seed: 776470,
      origin: [[0, -780]],
      center: [0, -640],
      mask: function (x, z) {
        if (SW_STAGE.roadMask.sample(x, z) > 0.10) return 0;
        if (x > -275 && x < 295 && z > -350 && z < 215) return 0;
        if (Math.hypot(x + 620, z + 280) < 155) return 0;
        if (x > 330 && x < 740 && z > 80 && z < 490) return 0;
        if (x > 580 && x < 950 && z > -390 && z < -40) return 0;
        if (Math.hypot(x - 380, z + 1140) < 88) return 0;
        if (occSpace.some(x, z, 22, function () { return true; })) return 0;
        const y = SW_GROUND.h(x, z);
        if (y > 22) return 0;
        return z < -360 ? 0.82 : 0.18;
      },
      fields: {
        cold: function (x, z) {
          const y = SW_GROUND.h(x, z);
          return Math.max(0.79, Math.min(0.99, 0.87 + y * 0.0022 + (z > -280 ? 0.07 : -0.04)));
        },
        wet: function (x, z) { return z < -300 ? 0.56 : 0.34; },
        flow: function () { return 0.08; },
        mist: function (x, z) { return z < -420 ? 0.35 : 0.15; },
        rock: function (x, z) { return SW_GROUND.slope(x, z) > 0.22 ? 0.82 : 0.38; },
        upland: function () { return 0.92; }
      }
    });
    floraReport = SW_FLORA.NHL.build({
      R: 920,
      quality: 0.10,
      flora: false,
      box: [-950, 950, -1480, 360]
    });
    SW_FLORA.BIO.bake();
  }

  /* 8. Attach interactive door host if loaded */
  if (typeof KDOORHOST !== 'undefined' && typeof KDOORHOST.attach === 'function') {
    KDOORHOST.attach({ THREE: THREE, scene: scene, camera: camera, ticks: TICKS });
  }

  return {
    placed: placed,
    wallPlaced: wallPlaced,
    missing: missing,
    tags: T,
    tagCount: tagCount,
    still: stillDrawn,
    flora: floraReport,
    ms: Math.round(performance.now() - t0)
  };
})();
