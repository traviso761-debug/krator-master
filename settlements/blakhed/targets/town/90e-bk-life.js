// ================================================================= BLAKHED — live citizen crowds, outfits & schedules (`BK_LIFE`) [web]
// Phase F4 browser host for `src/78-bk-sim.js` (`BK_SIM`): steps `KCLOCK` and `SIM` on `FRAME_HOOKS`, poses all citizens and
// pack-sledges via `SIM.pose(a, t)`, and renders five culturally distinct multi-part instanced silhouettes:
//   1. `fellgang`   layered felt/hide coat (per-citizen colour), sun-darkened face, snow-goggles worn up on brow, Ancient white
//                   salvage shoulder-plate and coiled climbing/sledge rope at hip
//   2. `traveller`  bright painted vardo waistcoat, patterned shawl and wide-brimmed felt hat
//   3. `kradz`      dark hooded fungus-leather coat, brow goggles and blue lantern-lobelia waist lamp
//   4. `wildcat`    shaggy megafauna fur mantle, scrap-plate vest and curved aurochs-horn helm crest (unarmed inside Truce Stones)
//   5. `mission`    Dalab stepped ochre/saffron robes and Golden Tears gilt-trimmed silk & turbans, plus `sledge` pack-trains
var BK_LIFE = (function () {
  'use strict';
  if (typeof SIM === 'undefined' || typeof BK_SIM === 'undefined' || typeof KCLOCK === 'undefined' || !BK_PLAN) {
    return { on: false, reason: 'missing SIM, BK_SIM, KCLOCK or BK_PLAN' };
  }
  function D0(x, d) { return x == null ? d : x; }

  /* World clock starting on the page's Autumn Fair morning (`BK_SKY.day` = 262, `BK_SKY.hour` = 9.6) */
  var clock = KCLOCK.make({ hour: BK_SKY.hour, day: BK_SKY.day, running: false, scale: 1 });
  BK_SIM.declare(clock, { plan: BK_PLAN, rings: BK_RINGS, seed: 44178 });

  /* Build a vertex-coloured multi-part BufferGeometry (0xffffff parts take per-instance `setColorAt` coat colour) */
  function partBox(w, h, d, x, y, z, rx, rz) {
    var g = new THREE.BoxGeometry(w, h, d);
    if (rx) g.rotateX(rx);
    if (rz) g.rotateZ(rz);
    g.translate(x, y, z);
    return g;
  }
  function buildGeo(parts) {
    var pos = [], nor = [], col = [], c = new THREE.Color();
    parts.forEach(function (p) {
      var g = p[0].toNonIndexed(), P = g.attributes.position.array, N = g.attributes.normal.array, i, k;
      c.setHex(p[1]).convertSRGBToLinear();
      for (i = 0; i < P.length; i++) { pos.push(P[i]); nor.push(N[i]); }
      for (k = 0; k < P.length / 3; k++) col.push(c.r, c.g, c.b);
    });
    var G = new THREE.BufferGeometry();
    G.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    G.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    G.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return G;
  }

  /* 1. Fellgang citizen: boots, trousers, warm turf-and-ochre felt coat, bright Ancient white salvage shoulder-plate, hip rope coil, sun-tanned head + brow snow-goggles */
  var geoFellgang = buildGeo([
    [partBox(0.15, 0.36, 0.20, -0.11, 0.18, 0.02), 0x3b3024],
    [partBox(0.15, 0.36, 0.20, 0.11, 0.18, 0.02), 0x3b3024],
    [partBox(0.16, 0.48, 0.18, -0.11, 0.58, 0), 0x585246],
    [partBox(0.16, 0.48, 0.18, 0.11, 0.58, 0), 0x585246],
    [partBox(0.46, 0.66, 0.28, 0, 1.12, 0), 0x8a7652],
    [partBox(0.50, 0.24, 0.31, 0, 0.84, 0), 0x6e784e],
    [partBox(0.13, 0.56, 0.15, -0.30, 1.12, 0), 0x8a7652],
    [partBox(0.13, 0.56, 0.15, 0.30, 1.12, 0), 0x8a7652],
    /* Ancient white salvage shoulder-plate lashed on left shoulder + bark rope coil on right hip */
    [partBox(0.19, 0.10, 0.24, -0.26, 1.43, 0, 0, 0.18), 0xe6e0d2],
    [partBox(0.09, 0.20, 0.20, 0.26, 0.88, 0.02), 0xb49668],
    /* Sun-darkened head, felt cap & slit snow-goggles pushed up on brow */
    [partBox(0.23, 0.25, 0.24, 0, 1.58, 0), 0xb88c6a],
    [partBox(0.26, 0.11, 0.27, 0, 1.71, -0.01), 0x524c42],
    [partBox(0.24, 0.06, 0.06, 0, 1.66, 0.12), 0xe2d6be]
  ]);

  /* 2. Traveller citizen: boots, dark breeches, crimson-ochre vardo waistcoat, gold shawl, cream sleeves, wide-brimmed Traveller hat */
  var geoTraveller = buildGeo([
    [partBox(0.15, 0.38, 0.20, -0.10, 0.19, 0.02), 0x362c22],
    [partBox(0.15, 0.38, 0.20, 0.10, 0.19, 0.02), 0x362c22],
    [partBox(0.16, 0.48, 0.18, -0.10, 0.60, 0), 0x48423c],
    [partBox(0.16, 0.48, 0.18, 0.10, 0.60, 0), 0x48423c],
    [partBox(0.44, 0.62, 0.26, 0, 1.13, 0), 0xb83c28],
    [partBox(0.50, 0.22, 0.30, 0, 1.32, -0.01), 0xe2b244],
    [partBox(0.12, 0.56, 0.14, -0.29, 1.12, 0), 0xebe4d6],
    [partBox(0.12, 0.56, 0.14, 0.29, 1.12, 0), 0xebe4d6],
    [partBox(0.23, 0.25, 0.24, 0, 1.58, 0), 0xbe906e],
    [partBox(0.42, 0.04, 0.42, 0, 1.69, 0), 0x38322c],
    [partBox(0.25, 0.12, 0.26, 0, 1.76, 0), 0x38322c]
  ]);

  /* 3. Kradz dark-clan factor: charcoal fungus-leather coat, deep hood, brow goggles and bright blue lobelia hip-lamp */
  var geoKradz = buildGeo([
    [partBox(0.15, 0.82, 0.18, -0.10, 0.41, 0), 0x343238],
    [partBox(0.15, 0.82, 0.18, 0.10, 0.41, 0), 0x343238],
    [partBox(0.46, 0.68, 0.28, 0, 1.13, 0), 0x46424c],
    [partBox(0.13, 0.56, 0.15, -0.29, 1.12, 0), 0x46424c],
    [partBox(0.13, 0.56, 0.15, 0.29, 1.12, 0), 0x46424c],
    [partBox(0.22, 0.24, 0.23, 0, 1.57, 0), 0xb2927c],
    [partBox(0.29, 0.28, 0.30, 0, 1.61, -0.02), 0x3a3640],
    [partBox(0.11, 0.15, 0.11, 0.26, 0.86, 0.08), 0x8ac4ff]
  ]);

  /* 4. Wildcat Fair envoy: fur boots, megafauna fur mantle, russet scrap vest, bronzed face & curved ivory aurochs-horn helm */
  var geoWildcat = buildGeo([
    [partBox(0.16, 0.82, 0.19, -0.11, 0.41, 0), 0x5c4632],
    [partBox(0.16, 0.82, 0.19, 0.11, 0.41, 0), 0x5c4632],
    [partBox(0.48, 0.64, 0.29, 0, 1.13, 0), 0x9c6c46],
    [partBox(0.56, 0.26, 0.34, 0, 1.34, -0.02), 0x74583e],
    [partBox(0.13, 0.56, 0.15, -0.31, 1.12, 0), 0xa87a58],
    [partBox(0.13, 0.56, 0.15, 0.31, 1.12, 0), 0xa87a58],
    [partBox(0.23, 0.25, 0.24, 0, 1.58, 0), 0xa87a58],
    [partBox(0.26, 0.12, 0.26, 0, 1.70, 0), 0x8a8074],
    [partBox(0.07, 0.22, 0.07, -0.19, 1.80, 0.02, 0, 0.42), 0xe4d2aa],
    [partBox(0.07, 0.22, 0.07, 0.19, 1.80, 0.02, 0, -0.42), 0xe4d2aa]
  ]);

  /* 5. Foreign mission citizen (Dalab saffron/ochre robes & Golden Tears silk/turbans) */
  var geoMission = buildGeo([
    [partBox(0.38, 0.78, 0.28, 0, 0.42, 0), 0xc48238],
    [partBox(0.44, 0.64, 0.26, 0, 1.12, 0), 0xc48238],
    [partBox(0.46, 0.14, 0.28, 0, 0.96, 0), 0xe8c868],
    [partBox(0.13, 0.56, 0.15, -0.29, 1.12, 0), 0xc48238],
    [partBox(0.13, 0.56, 0.15, 0.29, 1.12, 0), 0xc48238],
    [partBox(0.23, 0.25, 0.24, 0, 1.58, 0), 0xb68c6a],
    [partBox(0.29, 0.16, 0.29, 0, 1.71, 0), 0xf0eadc]
  ]);

  /* 6. Pack-pony & loaded wooden runner ice-sledge (`cls === 'sledge'`) */
  var geoSledge = buildGeo([
    /* Pack pony ahead in traces */
    [partBox(0.52, 0.52, 1.25, 0, 0.86, 1.35), 0x866446],
    [partBox(0.28, 0.46, 0.36, 0, 1.24, 1.92, 0.32, 0), 0x74543a],
    [partBox(0.12, 0.62, 0.12, -0.18, 0.31, 1.75), 0x5c422c],
    [partBox(0.12, 0.62, 0.12, 0.18, 0.31, 1.75), 0x5c422c],
    [partBox(0.12, 0.62, 0.12, -0.18, 0.31, 0.95), 0x5c422c],
    [partBox(0.12, 0.62, 0.12, 0.18, 0.31, 0.95), 0x5c422c],
    /* Painted wooden sledge runners, deck & strapped ice/wool load */
    [partBox(0.08, 0.12, 2.10, -0.46, 0.08, -0.55), 0x8e7050],
    [partBox(0.08, 0.12, 2.10, 0.46, 0.08, -0.55), 0x8e7050],
    [partBox(1.06, 0.10, 1.85, 0, 0.22, -0.55), 0xa8422c],
    [partBox(0.86, 0.52, 1.35, 0, 0.53, -0.58), 0xc8e6f2],
    [partBox(0.90, 0.08, 0.12, 0, 0.56, -0.58), 0x9e8864]
  ]);

  function makeInstanced(geo, cap, label) {
    var mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    var m = new THREE.InstancedMesh(geo, mat, Math.max(1, cap));
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    m.castShadow = true;
    m.receiveShadow = true;
    m.userData.people = true;
    m.userData.probeSkip = true;
    m.userData.inspectLabel = label;
    var c0 = new THREE.Color(0xffffff);
    for (var i = 0; i < Math.max(1, cap); i++) m.setColorAt(i, c0);
    scene.add(m);
    return m;
  }

  var actors = SIM.all('actor');
  var buckets = {
    fellgang: { mesh: makeInstanced(geoFellgang, 220, 'A Fellgang citizen of Blakhed (snow-goggles, salvage plate & rope)'), list: [] },
    traveller: { mesh: makeInstanced(geoTraveller, 70, 'A Traveller of the Winterings (vardo waistcoat & shawl)'), list: [] },
    kradz: { mesh: makeInstanced(geoKradz, 20, 'A Kradz shaft-factor (dark fungus-leather hood & lobelia lamp)'), list: [] },
    wildcat: { mesh: makeInstanced(geoWildcat, 24, 'An unarmed Wildcat trader under Blakhed\'s Market Truce'), list: [] },
    mission: { mesh: makeInstanced(geoMission, 64, 'A factor or guard of the Dalab & Golden Tears missions'), list: [] },
    sledge: { mesh: makeInstanced(geoSledge, 24, 'A Fellgang pack-pony and runner sledge'), list: [] }
  };

  actors.forEach(function (a) {
    if (a.cls === 'sledge') { buckets.sledge.list.push(a); return; }
    var c = a.dress ? a.dress.culture : 'fellgang';
    if (c === 'traveller') buckets.traveller.list.push(a);
    else if (c === 'kradz') buckets.kradz.list.push(a);
    else if (c === 'wildcat') buckets.wildcat.list.push(a);
    else if (c === 'dalab' || c === 'tears') buckets.mission.list.push(a);
    else buckets.fellgang.list.push(a);
  });

  var mtx = new THREE.Matrix4(), quat = new THREE.Quaternion(), eul = new THREE.Euler();
  var vec = new THREE.Vector3(), scl = new THREE.Vector3(), col = new THREE.Color();
  var lastMin = SIM.minute(), lastReal = null;
  var O = {
    on: true, clock: clock, sim: BK_SIM, buckets: buckets,
    shown: 0, moving: 0, indoors: 0, inTruce: 0, steps: 0
  };

  function poseAll(tMotion) {
    var shown = 0, moving = 0, indoors = 0, inTruce = 0;
    var tSim = SIM.time();
    Object.keys(buckets).forEach(function (bk) {
      var B = buckets[bk], M = B.mesh, L = B.list, n = 0, i;
      for (i = 0; i < L.length && n < M.instanceMatrix.count; i++) {
        var a = L[i], p = SIM.pose(a, tSim);
        if (!p) continue;
        if (p.hidden) { indoors++; continue; }
        var isWalking = a.task && tSim < a.task.arrive;
        if (isWalking) moving++;
        if (BK_SIM.inTruce(p.x, p.z)) inTruce++;
        var sc = a.dress ? a.dress.scale : 1;
        var gy = BK_GROUND.h(p.x, p.z);
        var bob = isWalking && a.cls !== 'sledge' ? Math.abs(Math.sin(tMotion * 6.5 + i * 1.7)) * 0.045 : 0;
        var sway = isWalking && a.cls !== 'sledge' ? Math.sin(tMotion * 6.5 + i * 1.7) * 0.04 : 0;
        eul.set(0, D0(p.h, 0), sway);
        quat.setFromEuler(eul);
        vec.set(p.x, Math.max(gy, D0(p.y, gy)) + bob, p.z);
        scl.set(sc, sc, sc);
        mtx.compose(vec, quat, scl);
        M.setMatrixAt(n, mtx);
        /* Blend coat tint gently toward white (0.65 white + 0.35 coat) so skin, goggles, salvage plates & shawls stay bright in daylight */
        col.setHex(a.dress ? a.dress.coat : 0x8a7652).convertSRGBToLinear();
        col.r = 0.72 + col.r * 0.45;
        col.g = 0.72 + col.g * 0.45;
        col.b = 0.72 + col.b * 0.45;
        M.setColorAt(n, col);
        n++; shown++;
      }
      M.count = n;
      M.instanceMatrix.needsUpdate = true;
      if (M.instanceColor) M.instanceColor.needsUpdate = true;
    });
    O.shown = shown; O.moving = moving; O.indoors = indoors; O.inTruce = inTruce;
  }

  function stepSim(dtReal) {
    clock.step(dtReal);
    var mNow = clock.day * 1440 + Math.floor(clock.hour * 60);
    if (mNow < lastMin || mNow - lastMin > 180) {
      SIM.jump();
      lastMin = mNow;
      return;
    }
    var guard = 0;
    while (lastMin < mNow && guard < 30) {
      lastMin++;
      SIM.step();
      O.steps++;
      guard++;
    }
  }

  /* Advance `minutes` of simulated world time deterministically (used by `verify.py --assert` and interactive testing) */
  O.run = function (minutes) {
    var i;
    for (i = 0; i < minutes; i++) {
      var m = clock.day * 1440 + Math.floor(clock.hour * 60) + 1;
      clock.day = Math.floor(m / 1440);
      clock.hour = (m % 1440 + 0.5) / 60;
      clock.t += 3;
      SIM.step();
      O.steps++;
    }
    lastMin = clock.day * 1440 + Math.floor(clock.hour * 60);
    poseAll(clock.t);
    O.syncSummary();
    return window._bkSim;
  };

  O.syncSummary = function () {
    var E = SIM.econ(BK_SIM.S);
    var cens = SIM.needsCensus ? SIM.needsCensus(null) : null;
    window._bkSim = {
      on: true,
      actors: actors.length,
      places: SIM.order.place.length,
      navNodes: BK_SIM.navGraph.nodes.length,
      navEdges: BK_SIM.navGraph.edges.length,
      problems: BK_SIM.problems.slice(),
      shown: O.shown,
      moving: O.moving,
      indoors: O.indoors,
      inTruce: O.inTruce,
      truceChecked: BK_SIM.truceChecked,
      truceEvents: BK_SIM.truceEvents.length,
      meetings: BK_SIM.meetings.length,
      doubleHall: BK_SIM.doubleHall,
      happy: cens && cens.all ? +cens.all.happy.toFixed(1) : null,
      kept: E && E.kept ? Object.assign({}, E.kept) : {},
      spoiled: E && E.spoiled ? Object.assign({}, E.spoiled) : {}
    };
    if (window._blakhed) window._blakhed.sim = window._bkSim;
  };

  /* Initial step + pose so citizens are visible on frame 0 even while clock.running === false */
  SIM.step();
  poseAll(0);
  O.syncSummary();

  FRAME_HOOKS.push(function (now) {
    var t = (now == null ? performance.now() : now) / 1000;
    var dt = lastReal == null ? 0.016 : Math.min(0.1, Math.max(0, t - lastReal));
    lastReal = t;
    stepSim(dt);
    poseAll(clock.t);
  });

  return O;
})();
