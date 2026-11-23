// prefix: tr
// ================================================================= TRANSIT KIT — Standalone Demo Stage & Host Integration ([draw] + [web])
// Renders TR_DEMO with KDRAWN sculpted terrain, core/water stepped pounds + dynamic miter-lock chamber + valley stream,
// articulated miter-gate leaves, humpback stone bridge, navigable 2-arch aqueduct, transiting et_canal_barge, and vessel showcase.

var TR_STAGE = (function () {
  'use strict';

  var K = KCANAL, D = TR_DEMO, F = D.frame;
  var errEl = document.getElementById('errs');
  function reportErr(m) {
    if (errEl) { errEl.style.display = 'block'; errEl.textContent += m + '\n'; }
  }
  window.onerror = function (m, s, l, c, e) { reportErr((e && e.stack) || (m + ' @' + l + ':' + c)); };
  window.addEventListener('unhandledrejection', function (e) { reportErr('promise: ' + ((e.reason && e.reason.stack) || e.reason)); });

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio == null ? 1 : window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.autoClear = false;
  document.body.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xcbd5cf, 0.00045);
  var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.25, 8000);

  var skyScene = new THREE.Scene();
  var skyCam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 8000);
  KratorSky.attach(skyScene, 4200);
  var skyState = { hour: 10.5, day: 180, dens: 1.4, night: false };
  var hemi = new THREE.HemisphereLight(0xffe8cc, 0x607058, 0.78);
  scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xfff0dc, 1.68);
  scene.add(sun);
  scene.add(sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -160;
  sun.shadow.camera.right = 160;
  sun.shadow.camera.top = 160;
  sun.shadow.camera.bottom = -160;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 650;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.25;
  var lightDir = new THREE.Vector3(0.4, 0.7, 0.3).normalize();

  function applySky() {
    KratorSky.update(new THREE.Vector3(), skyState.hour, skyState.day, skyState.dens);
    var L = KratorSky.lighting();
    lightDir.copy(L.sunDir.y > 0.02 ? L.sunDir : new THREE.Vector3(0.35, 0.65, -0.35).normalize());
    sun.color.copy(L.sunColor || new THREE.Color(1, 0.95, 0.86));
    sun.intensity = L.sunDir.y > 0.02 ? L.sunIntensity * 1.05 : 0.08;
    hemi.intensity = 0.30 + L.ambient * 0.72;
    scene.fog.color.copy(L.fog);
  }
  applySky();

  var atmosHooks = [];
  ATMOS.init({
    THREE: THREE,
    scene: scene,
    camera: camera,
    hour: function () { return skyState.hour; },
    onFrame: function (fn) { atmosHooks.push(fn); },
    ground: D.groundH,
    seed: 75101,
    err: function (m) { reportErr('ATMOS: ' + m); },
    viewH: function () { return window.innerHeight; },
    pixelRatio: function () { return renderer.getPixelRatio(); }
  });
  ATMOS.skylight({ renderer: renderer, sky: skyScene, scene: scene, ground: function () { return new THREE.Color(0x46523c); } });

  var tags = KTAGS.create({ build: 'transit' });
  var regList = [];
  var world = new THREE.Group();
  scene.add(world);

  /* 1. Build sculpted KDRAWN terrain (2.5 m fine inner mesh + outer apron) */
  KDRAWN.clear();
  (function buildTerrain() {
    var x0 = -220, z0 = -160, dx = 2.5, dz = 2.5, nx = 176, nz = 128;
    var geo = new THREE.PlaneGeometry(nx * dx, nz * dz, nx, nz);
    geo.rotateX(-Math.PI / 2);
    geo.translate(x0 + nx * dx * 0.5, 0, z0 + nz * dz * 0.5);
    var pos = geo.attributes.position;
    var nv = (nx + 1) * (nz + 1);
    var H = new Float32Array(nv);
    var col = new Float32Array(nv * 3);
    for (var iz = 0; iz <= nz; iz++) {
      var z = z0 + iz * dz;
      for (var ix = 0; ix <= nx; ix++) {
        var idx = iz * (nx + 1) + ix;
        var x = x0 + ix * dx;
        var y = D.groundH(x, z);
        H[idx] = y;
        pos.setY(idx, y);
        var us = F.us(x, z);
        var rm = D.roadMask ? D.roadMask.sample(x, z) : { road: 0, towpath: 0 };
        var r = 0.42, g = 0.49, b = 0.33;
        if (Math.abs(us[1] - 84) < 12 && y < 7.8) {
          r = 0.28; g = 0.31; b = 0.28;
        } else if (K.pointInCanalTrough(D.net, x, z, 0.2)) {
          r = 0.24; g = 0.27; b = 0.26;
        } else if (rm.road > 0.2 || rm.towpath > 0.2) {
          r = 0.62; g = 0.60; b = 0.54;
        } else if (Math.abs(us[0]) < 26 && us[1] > -142 && us[1] < 175) {
          r = 0.56; g = 0.54; b = 0.47;
        }
        col[idx * 3] = r; col[idx * 3 + 1] = g; col[idx * 3 + 2] = b;
      }
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    var mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.0 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    mesh.userData.isGround = true;
    mesh.userData.probeSkip = true;
    mesh.name = 'terrain:demo';
    world.add(mesh);
    KDRAWN.add(KDRAWN.grid({ x0: x0, z0: z0, dx: dx, dz: dz, nx: nx, nz: nz, h: H }));
  })();

  /* 2. Build core/water pounds, dynamic miter-lock chamber water & valley stream */
  WATER.surfaces.length = 0;
  if (WATER.drawn) WATER.drawn.length = 0;
  var lockWaterRec = null;
  (function buildWater() {
    for (var i = 0; i < D.troughs.length; i++) {
      var tr = D.troughs[i];
      var S = WATER.still({ name: tr.id, level: tr.wlev, poly: F.rectPoly(tr.u0, tr.u1, tr.s0, tr.s1) });
      WATER.drawStill(S, { scene: world, color: tr.pound === 'P1' ? 0x224b45 : 0x1d403c, roughness: 0.06, metalness: 0.15 });
    }
    var ch = D.chamber;
    var Sc = WATER.still({ name: 'lock.' + ch.id, level: ch.yLow, poly: ch.poly });
    var Dc = WATER.drawStill(Sc, { scene: world, color: 0x244f48, roughness: 0.05, metalness: 0.16 });
    lockWaterRec = { ch: ch, S: Sc, D: Dc };

    var streamPts = D.streamUs.map(function (q) { var p = F.at(q[0], q[1]); return [p[0], p[1], q[2]]; });
    var fStream = WATER.flow({ name: 'Demo Valley Stream', pts: streamPts, width: 12.5, speed: 1.6, densify: 8 });
    WATER.drawFlow(fStream, { scene: world, step: 5, margin: 1.2, shallow: 0x518074, deep: 0x1e4042 });
  })();

  /* 3. Place Canal Infrastructure & Register in KTAGS */
  function placeStructure(grp, cls, kind, key, name, x, y, z, ry, size) {
    grp.position.set(x, y, z);
    grp.rotation.y = ry;
    world.add(grp);
    var trec = tags.add({
      'class': cls,
      kind: kind,
      key: key,
      name: name,
      at: [x, y, z],
      ry: ry,
      size: size,
      tags: { culture: 'eternian', types: ['infrastructure'] },
      frag: 'kits/transit/src/70-tr-canal-draw.js'
    });
    grp.userData.tid = trec.id;
    regList.push({ id: trec.id, name: name, cls: cls, key: key, x: x, y: y, z: z, size: size, ry: ry });
    return trec;
  }

  /* Miter-lock chamber riser + 4 articulated bronze miter-gate leaves */
  {
    var lp = F.at(0, 0);
    var lkGrp = K.draw.lockRiser({ lanes: 1, chamberW: 5.2, chamberLen: 28.0 }, { style: 'eternian', seed: 75021 });
    placeStructure(lkGrp, 'feature', 'lock', 'tr_miter_lock', 'Single Bronze Miter Lock (3.20 m lift)', lp[0], 12.00, lp[1], F.YAW_S, [10.0, 28.0, 6.8]);
  }
  var gateLeaves = [];
  {
    var st0 = K.lockState(D.chamber, 0);
    var poses0 = K.gateLeafPoses(D.chamber, st0, F);
    for (var gi = 0; gi < poses0.length; gi++) {
      var gp = poses0[gi];
      var lfGrp = K.draw.miterLeaf({ leafLen: D.chamber.leafLen }, { style: 'eternian', seed: 75030 + gi });
      placeStructure(lfGrp, 'part', 'lock_gate', 'tr_miter_leaf', 'Miter Gate Leaf ' + gp.which + ' ' + (gp.side < 0 ? 'L' : 'R'),
        gp.hingeX, gp.baseY, gp.hingeZ, gp.yaw, [D.chamber.leafLen, 0.4, 6.4]);
      gateLeaves.push({ index: gi, grp: lfGrp });
    }
  }

  /* Humpback stone cart bridge & 2-arch navigable stone aqueduct */
  {
    var br = D.bridges[0];
    var brGrp = K.draw.bridge({ width: br.width, clearSpan: br.clearSpan, totalLen: br.rampHalfLen * 2.0, crownRise: 1.50 }, { style: 'eternian', seed: 75041 });
    placeStructure(brGrp, 'feature', 'bridge', 'tr_cart_bridge', 'Humpback Stone Cart Bridge (2.98 m air-draft)', br.x, br.baseY, br.z, br.yaw, [br.width, br.rampHalfLen * 2, 5.6]);

    var aq = D.aqueducts[0];
    var aqGrp = K.draw.aqueduct({ len: aq.len, arches: aq.arches, waterW: aq.waterW }, { style: 'eternian', seed: 75042 });
    placeStructure(aqGrp, 'feature', 'aqueduct', 'tr_stone_aqueduct', 'Two-Arch Stone Navigable Aqueduct', aq.x, aq.streamBedY, aq.z, aq.yaw, [15.0, aq.len, 11.8]);
  }

  /* Canal quays & Turning Basin slewing wharf crane */
  (function buildQuaysAndCrane() {
    var sList = [-84, -60, -36, 26, 52, 114];
    for (var i = 0; i < sList.length; i++) {
      var s = sList[i];
      var wlev = s < 0 ? 12.00 : 15.20;
      if (Math.abs(s - 40) > 10) {
        var pn = F.at(-7.1, s), ps = F.at(7.1, s);
        placeStructure(K.draw.quay({ len: 22.0, v: 0 }, { seed: 75050 + i * 2 }), 'feature', 'quay', 'tr_canal_quay', 'Canal Quay N ' + s, pn[0], wlev, pn[1], F.YAW_U, [22, 3.2, 3.8]);
        placeStructure(K.draw.quay({ len: 22.0, v: 0 }, { seed: 75051 + i * 2 }), 'feature', 'quay', 'tr_canal_quay', 'Canal Quay S ' + s, ps[0], wlev, ps[1], F.YAW_NU, [22, 3.2, 3.8]);
      }
    }
    var tbP = F.at(-19.6, 146.0);
    placeStructure(K.draw.quay({ len: 36.0, v: 1 }, { seed: 75080 }), 'feature', 'quay', 'tr_canal_quay', 'Turning Basin Wharf Quay', tbP[0], 15.20, tbP[1], F.YAW_U, [36, 3.2, 3.8]);
    var crP = F.at(-20.4, 146.0);
    placeStructure(K.draw.crane({}, { seed: 75081 }), 'prop', 'crane', 'tr_cargo_crane', 'Slewing Wharf Crane', crP[0], 16.68, crP[1], F.YAW_U, [4.8, 4.8, 8.4]);

    /* Showcase basin inspection quay */
    for (var scS = -32; scS <= 16; scS += 24) {
      var sp = F.at(30.4, scS);
      placeStructure(K.draw.quay({ len: 24.0, v: 1 }, { seed: 75090 + scS }), 'feature', 'quay', 'tr_canal_quay', 'Vessel Showcase Quay ' + scS, sp[0], 12.00, sp[1], F.YAW_U, [24, 3.2, 3.8]);
    }
  })();

  /* Clipped flagstone street & towpath ribbons */
  world.add(K.draw.pavedWays(D.ways, D.towpath, D.net, D.groundH, { style: 'eternian' }));

  /* 4. Build Moored Showcase Row & Active Lock-Transiting Vessels (all tagged in KTAGS as class 'vessel'!) */
  var mooredVessels = [];
  for (var si = 0; si < D.showcase.length; si++) {
    var item = D.showcase[si];
    var wp = F.at(item.u, item.s);
    var built = K.buildVessel(item.key, { v: item.v });
    built.group.position.set(wp[0], item.y, wp[1]);
    built.group.rotation.y = item.yaw;
    world.add(built.group);
    var vpose = { x: wp[0], y: item.y, z: wp[1], yaw: item.yaw };
    var vt = K.registerVesselTag(tags, built.def, vpose, { name: built.def.name + ' (' + item.id + ')' });
    built.group.userData.tid = vt.id;
    K.registerVesselWalk(KWALK, built, vpose, item.id);
    mooredVessels.push({ spec: item, built: built, tag: vt });
  }

  var movingCourses = [D.bargeCourse, D.launchCourse];
  var movingVessels = [];
  var lockClock = 24.0;
  var lockPin = null;
  {
    var qs = new URLSearchParams(window.location.search);
    if (qs.get('lockPhase') !== null) {
      lockPin = +qs.get('lockPhase');
      lockClock = lockPin;
    }
  }

  for (var mi = 0; mi < movingCourses.length; mi++) {
    var crs = movingCourses[mi];
    var p0 = K.vesselPoseAt(crs, lockClock);
    var mb = K.buildVessel(crs.vesselKey, { v: crs.v });
    mb.group.position.set(p0.x, p0.y, p0.z);
    mb.group.rotation.y = p0.yaw;
    world.add(mb.group);
    var mt = K.registerVesselTag(tags, mb.def, p0, { name: mb.def.name + ' (' + crs.id + ')' });
    mb.group.userData.tid = mt.id;
    movingVessels.push({ course: crs, built: mb, tag: mt });
  }

  /* Register walkable towpaths & road strips in KWALK */
  (function registerWalk() {
    if (typeof KWALK === 'undefined') return;
    var nodes = D.towpath.nodes, edges = D.towpath.edges;
    for (var id in nodes) {
      var nd = nodes[id];
      KWALK.floor({ rect: [nd.x - 2.2, nd.x + 2.2, nd.z - 2.2, nd.z + 2.2], y: nd.y, name: nd.id, tag: 'towpath:node' });
    }
    for (var i = 0; i < edges.length; i++) {
      var ed = edges[i], a = nodes[ed.a], b = nodes[ed.b];
      KWALK.strip({ a: [a.x, a.z, a.y], b: [b.x, b.z, b.y], w: ed.w, name: ed.a + '->' + ed.b, tag: 'towpath:' + ed.kind });
    }
  })();

  function stepSimulation(t) {
    var st = K.lockState(D.chamber, t);
    lockWaterRec.D.mesh.position.y = st.y - D.chamber.yLow;
    lockWaterRec.S.level = st.y;

    var poses = K.gateLeafPoses(D.chamber, st, F);
    for (var i = 0; i < gateLeaves.length; i++) {
      var lf = gateLeaves[i];
      var gp = poses[lf.index];
      lf.grp.position.set(gp.hingeX, gp.baseY, gp.hingeZ);
      lf.grp.rotation.y = gp.yaw;
    }

    for (var m = 0; m < movingVessels.length; m++) {
      var mv = movingVessels[m];
      var pose = K.vesselPoseAt(mv.course, t);
      mv.built.group.position.set(pose.x, pose.y, pose.z);
      mv.built.group.rotation.y = pose.yaw;
      if (mv.tag) {
        mv.tag.at[0] = pose.x;
        mv.tag.at[1] = +(pose.y - mv.built.def.draft).toFixed(4);
        mv.tag.at[2] = pose.z;
        mv.tag.ry = +pose.yaw.toFixed(4);
      }
    }
  }
  stepSimulation(lockClock);

  /* Register core/export terrain adapter (09-core-export-adapters.js already registers registry/atmos/water/materials) */
  if (typeof EXPORT !== 'undefined' && EXPORT && EXPORT.register) {
    EXPORT.register('terrain', function (ctx) {
      return EXPORT.terrain(ctx.box || [-180, -120, 180, 120], { h: D.groundH, step: 4 });
    }, { by: 'transit' });
  }

  /* Camera Views (strictly zero apostrophes or colons: VIEW-NAME rule) */
  function viewUS(eu, es, ey, tu, ts, ty) {
    var ep = F.at(eu, es), tp = F.at(tu, ts);
    var floorY = Math.max(D.groundH(ep[0], ep[1]), 12.0) + 3.2;
    return [+ep[0].toFixed(2), +Math.max(ey, floorY).toFixed(2), +ep[1].toFixed(2), +tp[0].toFixed(2), +ty.toFixed(2), +tp[1].toFixed(2)];
  }

  var VIEWS = {
    'Overview': viewUS(96, -78, 68.0, 6, 36, 15.0),
    'Barge entering miter lock': viewUS(11.5, -36.0, 19.5, 0, -6.0, 13.6),
    'Lock chamber and gates': viewUS(-12.5, -24.0, 21.0, 0, 0.0, 14.5),
    'Humpback bridge clearance': viewUS(4.2, 18.0, 19.8, 0, 42.0, 16.5),
    'Navigable stone aqueduct': viewUS(38.0, 56.0, 24.5, 0, 84.0, 13.5),
    'Upper turning basin and crane': viewUS(28.0, 118.0, 27.0, -4.0, 146.0, 16.0),
    'Canal vessel showcase': viewUS(76.0, -48.0, 29.0, 47.0, -6.0, 12.8)
  };

  function nanSweep() {
    var bad = 0;
    world.traverse(function (m) {
      if (m.geometry && m.geometry.attributes && m.geometry.attributes.position) {
        var a = m.geometry.attributes.position.array;
        for (var i = 0; i < a.length; i++) {
          if (!isFinite(a[i])) { bad++; break; }
        }
      }
    });
    return bad;
  }

  function hostChecks() {
    var out = [];
    function add(name, ok, detail) { out.push({ name: name, ok: !!ok, detail: detail || '' }); }

    add('stepped pound monotonicity P1 > P0', K.poundsMonotonic(D.pounds, 3.20), '15.20 -> 12.00 m');

    var dimChecks = TR_VESSELS.order.map(function (k) { return K.auditVesselDims(k, 0, 0.18); });
    add('all 3 canal vessels match declared L x B x H and draft',
      dimChecks.every(function (c) { return c.ok; }),
      dimChecks.map(function (c) { return c.key + '=' + c.built.L + 'x' + c.built.B + 'x' + c.built.H; }).join(', '));

    var tagAudit = tags.audit();
    var vesselRecs = tags.query({ 'class': 'vessel' });
    add('every placed barge/scow/launch registered in KTAGS as vessel with 0 unknown tags',
      vesselRecs.length === D.showcase.length + movingCourses.length && tagAudit.unknown === 0,
      'vessels=' + vesselRecs.length + ' unknown=' + tagAudit.unknown);

    var trAudit = K.auditTransit(D.bargeCourse, D.net, TR_VESSELS.defs.et_canal_barge, { dt: 2.0 });
    add('end-to-end et_canal_barge lock + bridge + aqueduct + turning-basin transit has 0 collisions & exact flotation',
      trAudit.ok,
      JSON.stringify({ samples: trAudit.samples, fault: trAudit.firstFault }));

    var lnAudit = K.auditTransit(D.launchCourse, D.net, TR_VESSELS.defs.et_inspection_launch, { dt: 2.0 });
    add('inspection launch aqueduct shuttle clears bridges & channel bounds', lnAudit.ok, 'samples=' + lnAudit.samples);

    var strCheck = K.streetClearOfCanals(D.ways, D.net, { margin: 0.6 });
    var mskCheck = D.roadMask.auditZeroOnCanals();
    add('zero street-over-canal intrusions in clipped ways and KMASK road raster',
      strCheck.ok && mskCheck.ok,
      'wayHits=' + strCheck.count + ' maskHits=' + mskCheck.hits);

    add('aqueduct & bridge clearances hold',
      K.aqueductOk(D.aqueducts[0], 3.5) && K.bridgeClearsVessel(D.bridges[0], TR_VESSELS.defs.et_canal_barge, 0.65),
      'aqClear=' + D.aqueducts[0].underpassClearance + 'm brAir=' + D.bridges[0].airDraft + 'm');

    add('zero NaN vertices across all built meshes', nanSweep() === 0, '');
    return out;
  }

  function hostNegatives() {
    var out = [];
    out.push({
      name: 'miter-gate law rejects gate open against hydraulic head',
      failed: !K.miterLawOk({ lowerGateDeg: 35, headLow: 2.1, upperGateDeg: 0, headHigh: 1.1 })
    });
    var badCourse = K.transitCourse({
      id: 'bad.crash_gate',
      vesselKey: 'et_canal_barge',
      period: 360,
      frame: F,
      stages: [{ t0: 0, t1: 360, kind: 'sail', u0: 0, s0: -25, u1: 0, s1: 25, yaw: F.VYAW_S, wlev: 12.0 }]
    });
    out.push({
      name: 'auditTransit catches barge ramming closed miter gate',
      failed: !K.auditTransit(badCourse, D.net, TR_VESSELS.defs.et_canal_barge, { dt: 5.0 }).ok
    });
    out.push({
      name: 'streetClearOfCanals catches unclipped street crossing canal trough',
      failed: !K.streetClearOfCanals(D.rawWays, D.net, { margin: 0.6, allowBridgeDeck: false }).ok
    });
    out.push({
      name: 'bridgeClearsVessel catches low bridge deck striking barge',
      failed: !K.bridgeClearsVessel(Object.assign({}, D.bridges[0], { airDraft: 1.75 }), TR_VESSELS.defs.et_canal_barge, 0.5)
    });
    return out;
  }

  function describeHit(first, hits) {
    var h = null;
    for (var i = 0; i < hits.length; i++) {
      if (hits[i].object && !hits[i].object.userData.probeSkip) { h = hits[i]; break; }
    }
    if (!h) return '(ground / water)';
    var p = h.point;
    var rec = tags.at(p.x, p.z, p.y);
    if (rec) return KTAGS.label(rec) + '\n' + p.x.toFixed(1) + ', ' + p.y.toFixed(1) + ', ' + p.z.toFixed(1);
    return (h.object.name || 'canal mesh') + '\n' + p.x.toFixed(1) + ', ' + p.y.toFixed(1) + ', ' + p.z.toFixed(1);
  }

  KHOST.on(function (dt) {
    if (lockPin === null) {
      lockClock = (lockClock + Math.min(0.1, dt == null ? 0.016 : dt)) % D.bargeCourse.period;
    }
    stepSimulation(lockClock);
    var tg = KHOST.cam && KHOST.cam.ctl && KHOST.cam.ctl.walk ? camera.position : (KHOST.cam ? KHOST.cam.ctl.target : new THREE.Vector3());
    sun.target.position.set(tg.x, 12, tg.z);
    sun.position.set(tg.x + lightDir.x * 260, 12 + lightDir.y * 260, tg.z + lightDir.z * 260);
    sun.target.updateMatrixWorld();
    skyCam.quaternion.copy(camera.quaternion);
    skyCam.fov = camera.fov;
    skyCam.updateProjectionMatrix();
    for (var i = 0; i < atmosHooks.length; i++) atmosHooks[i](dt);
  }, 'view');

  window.addEventListener('resize', function () {
    skyCam.aspect = window.innerWidth / window.innerHeight;
    skyCam.updateProjectionMatrix();
  });

  var stdControls = {
    night: {
      on: function () {
        skyState.night = !skyState.night;
        skyState.hour = skyState.night ? 21.5 : 10.5;
        K.setNightGlow(skyState.night);
        applySky();
      },
      state: function () { return skyState.night; },
      title: '21:30 canal lantern mode'
    },
    shadows: {
      on: function () {
        renderer.shadowMap.enabled = !renderer.shadowMap.enabled;
        scene.traverse(function (o) { if (o.material) o.material.needsUpdate = true; });
      },
      state: function () { return renderer.shadowMap.enabled; }
    }
  };

  var takeCfg = KHOST.standard({
    build: 'transit',
    title: 'Krator — Transit Kit (Canals, Miter Locks & Barges)',
    hint: 'Stepped 2-pound miter lock, humpback bridge, navigable 2-arch stone aqueduct, turning basin & Eternian canal vessels. Drag to orbit, W A S D fly, F walk, N night.',
    scene: scene,
    camera: camera,
    renderer: renderer,
    ground: D.groundH,
    walk: typeof KWALK !== 'undefined' ? KWALK : null,
    clear: 0.45,
    minR: 2,
    maxR: 1200,
    views: VIEWS,
    start: 'Barge entering miter lock',
    std: stdControls,
    inspect: describeHit,
    stats: function () {
      var bp = K.vesselPoseAt(D.bargeCourse, lockClock);
      return 'records ' + tags.records.length + '  barge ' + bp.stage + ' (y=' + bp.y.toFixed(2) + 'm)';
    },
    draw: function (sc, cam) {
      skyCam.quaternion.copy(cam.quaternion);
      renderer.clear();
      renderer.render(skyScene, skyCam);
      renderer.render(sc, cam);
    },
    api: {
      scene: scene,
      camera: camera,
      renderer: renderer,
      hostChecks: hostChecks,
      hostNegatives: hostNegatives,
      nanSweep: nanSweep,
      tags: function () { return { audit: tags.audit(), records: tags.records.length }; },
      lockState: function (t) { return K.lockState(D.chamber, t == null ? lockClock : +t); },
      bargePose: function (t) { return K.vesselPoseAt(D.bargeCourse, t == null ? lockClock : +t); },
      setLockPhase: function (sec) {
        lockPin = sec == null ? null : +sec;
        if (lockPin !== null) {
          lockClock = lockPin;
          stepSimulation(lockClock);
        }
        return lockClock;
      },
      view: function (nm) { return KHOST.go(nm); }
    }
  });
  KHOST.take(takeCfg);
  window._ready = true;

  return { ready: true, views: VIEWS };
})();
