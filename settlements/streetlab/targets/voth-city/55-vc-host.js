/* ============================== 6. HOST: THE VOTH CITY ON VOTH'S GROUND ============================== */
/* [web] The ground, lake, cantons, bridges and causeways are the site editor's (targets/voth-site/50-site-scene.js);
   streets are core/city's ribbons (50-city-host-streets.js), buildings its instanced kit (52-city-host-buildings.js);
   Voth's own structures are drawn from the primitives each builder pushed (VC.prims). A step slider shows the
   city as it stood after any step. */
HOST.step = SL.LAST;
HOST.layers = { buildings: true, lots: false, wealth: false, labels: true, transit: true, flora: true };
HOST.COL.lot.craft = '#b8562e'; HOST.COL.lot.warehouse = '#7c6a4a'; HOST.COL.lot.clan = '#c9a227'; HOST.COL.lot.farm = '#7d8a3e'; HOST.COL.lot.placed = '#ffffff';
HOST.COL.way.lane = 0xa89878; HOST.LIFT.lane = 0.15; HOST.ORDER.lane = 1;
/* street surfaces from the material library (materials.json road_* sets): flagstone avenues, cobbled main streets,
   paved side streets, grass-grown cobbled alleys, rutted cart roads for the highways and the country lanes */
HOST.ROADTEX = { avenue: { fam: 'road_flag' }, main: { fam: 'road_cobble' }, side: { fam: 'road_paving' }, alley: { fam: 'road_alley' },
                 highway: { fam: 'road_ruts', fit: 1.6 }, lane: { fam: 'road_ruts', fit: 2.2 } };
VC.ROLECOL = { park: '#3d7031', market: '#d9c18e', plaza: '#cbbd9c', funerary: '#6d5a8a', monastery: '#9a8a62', harbor: '#5c7f99', industry: '#a2502e', warehouse: '#8a7553', riverport: '#4f8a8a' };
var $ = function (id) { return document.getElementById(id); };

/* ---------------------------------------------------------------- the ground overlay: districts, greens, lots, wealth */
VC.paint = function () {
  var st = HOST.step, cv = VIEW.ovCanvas, S = cv.width, E = VIEW.ext, k = S / (2 * E), ctx = cv.getContext('2d');
  var X = function (x) { return (x + E) * k; }, Z = function (z) { return (z + E) * k; };
  var poly = function (P) { ctx.beginPath(); P.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Z(p[1])); else ctx.moveTo(X(p[0]), Z(p[1])); }); ctx.closePath(); };
  ctx.clearRect(0, 0, S, S);
  if (HOST.layers.wealth && st >= 6) {
    var c = 20; for (var x = -TUNE.rasterHalf; x < TUNE.rasterHalf; x += c) for (var z = -TUNE.rasterHalf; z < TUNE.rasterHalf; z += c) {
      if (SL.R.at(x + c / 2, z + c / 2) === OCC.OUT) continue;
      var w = SL.wealth([x + c / 2, z + c / 2]);
      ctx.fillStyle = 'rgba(' + Math.round(70 + 185 * w) + ',' + Math.round(90 + 60 * w) + ',' + Math.round(200 - 170 * w) + ',0.4)'; ctx.fillRect(X(x), Z(z), c * k + 1, c * k + 1);
    }
  }
  if (st >= 2) PLAN.site.forEach(function (d) {
    var col = VC.ROLECOL[d.role]; if (!col) return;
    poly(d.poly);
    var solid = d.role === 'park' || d.role === 'market' || d.role === 'plaza';
    ctx.globalAlpha = solid ? 0.9 : 0.22; ctx.fillStyle = col; ctx.fill();
    ctx.globalAlpha = 0.7; ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke(); ctx.globalAlpha = 1;
  });
  PLAN.greens.forEach(function (G) { if (G.born > st) return; poly(G.poly); ctx.fillStyle = G.kind === 'park' ? '#3d7031' : '#cbbd9c'; ctx.fill(); });
  /* the country's fields: Voth's field tones, plough lines along the long side (Voth's 40-ground.js FARMS) */
  (PLAN.fields || []).forEach(function (F) {
    if (F.born > st) return;
    poly(F.poly); ctx.globalAlpha = 0.85; ctx.fillStyle = typeof F.tone === 'string' ? F.tone : '#' + ('00000' + F.tone.toString(16)).slice(-6); ctx.fill(); ctx.globalAlpha = 1;
    var o = F.bo, long = o.hw >= o.hd, ax = long ? o.u : o.v, ac = long ? o.v : o.u, hl = long ? o.hw : o.hd, hc = long ? o.hd : o.hw;
    ctx.strokeStyle = 'rgba(60,54,36,0.3)'; ctx.lineWidth = 1; ctx.beginPath();
    for (var y = -hc + 3; y < hc; y += 5) { var a = V.add(o.c, V.add(V.mul(ac, y), V.mul(ax, -hl))), b = V.add(o.c, V.add(V.mul(ac, y), V.mul(ax, hl))); ctx.moveTo(X(a[0]), Z(a[1])); ctx.lineTo(X(b[0]), Z(b[1])); }
    ctx.stroke();
  });
  var showLots = HOST.layers.lots || !HOST.layers.buildings;
  if (showLots) PLAN.lots.forEach(function (L) {
    if (L.born > st || (L.died != null && L.died <= st)) return;
    poly(obbCorners(L.lot)); ctx.globalAlpha = 0.6; ctx.fillStyle = HOST.COL.lot[L.cls] || '#888'; ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(25,20,15,0.7)'; ctx.stroke();
  });
  VIEW.ovTex.needsUpdate = true;
};

/* ---------------------------------------------------------------- Voth's structures, transit lines, labels */
VC.drawPrims = function () {
  VC.meshes = [];
  Object.keys(VC.prims).forEach(function (name) {
    var g = VC.prims[name]; if (!g.list.length) return;
    VIEW.primMeshes(g.list, name).forEach(function (M) { M.userData.step = g.step; VC.meshes.push(M); });
  });
};
VC.drapeLine = function (P, colour, lift, water) {
  var V3 = [];
  for (var i = 0; i < P.length; i++) {
    if (i) { var a = P[i - 1], b = P[i], n = Math.max(1, Math.ceil(V.dist(a, b) / 12)); for (var j = 1; j < n; j++) { var q = V.lerp(a, b, j / n); V3.push(new THREE.Vector3(q[0], (water ? 0 : Math.max(0, terrainH(q[0], q[1]))) + lift, q[1])); } }
    V3.push(new THREE.Vector3(P[i][0], (water ? 0 : Math.max(0, terrainH(P[i][0], P[i][1]))) + lift, P[i][1]));
  }
  var L = new THREE.Line(new THREE.BufferGeometry().setFromPoints(V3), new THREE.LineDashedMaterial({ color: colour, dashSize: 14, gapSize: 8, depthTest: false, transparent: true }));
  L.computeLineDistances(); L.renderOrder = 25; scene.add(L);
  return L;
};
VC.drawTransit = function () {
  VC.transitObjs = [];
  if (!PLAN.transit) return;
  PLAN.transit.lines.forEach(function (l) { if (l.pts.length > 1) { l.obj = VC.drapeLine(l.pts, l.kind === 'ferry' ? 0x3a9ad9 : 0xb07a3a, l.kind === 'ferry' ? 1.2 : 2.5, l.kind === 'ferry'); VC.transitObjs.push(l.obj); } });
  PLAN.transit.stations.forEach(function (s) {
    var sp = VIEW.sprite(s.id, { round: true, size: 0.026, bg: s.kind === 'ferry' ? '#2e86c1' : '#9a6a32' });
    sp.position.set(s.x, Math.max(0, terrainH(s.x, s.z)) + 18, s.z); scene.add(sp); VC.transitObjs.push(sp);
  });
};
/* the vehicles: one small model per vehicle of each line, placed every frame where core/simulation says
   (SIM.vehiclePose: a pure function of motion time; TUNE.timeScale runs the timetable faster than life) */
VC.vehicleModel = function () {
  var g = new THREE.Group(), wood = new THREE.MeshStandardMaterial({ color: 0x6a5238, roughness: 0.9 }), cloth = new THREE.MeshStandardMaterial({ color: 0xd8c9a0, roughness: 0.9 });
  var hull = new THREE.Mesh(new THREE.BoxGeometry(7, 2.6, 20), wood); hull.position.y = 0.6; g.add(hull);
  var cab = new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.6, 8), cloth); cab.position.set(0, 3.2, -1.5); g.add(cab);
  return g;
};
/* the elephant bugs are Voth's own (VSTRIDER, lifted from 79c-strider-model.js by build.py): the merged body as
   one instanced mesh, the twelve leg bars of each as another, placed by Voth's striderPlaceLegs with its gait (feet
   planted while it travels at its own speed, all six down while it stands at a station) */
VC.drawVehicles = function () {
  VC.vehicles = [];
  if (!PLAN.transit || typeof SIM === 'undefined') return;
  var striders = [];
  PLAN.transit.lines.forEach(function (l) {
    for (var k = 0; k < (l.vehicles || 0); k++) {
      if (l.kind === 'strider') { striders.push({ line: l.id, k: k, gait: 0, spd: SIM.R.transport[l.id].spd }); continue; }
      var m = VC.vehicleModel(); m.userData = { line: l.id, k: k }; m.visible = false; scene.add(m); VC.vehicles.push(m);
    }
  });
  var S = VSTRIDER, nS = striders.length, body = null, legs = null, tm = new THREE.Matrix4(), tq = new THREE.Quaternion(), tp = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), zero = new THREE.Vector3(0, 0, 0), up = new THREE.Vector3(0, 1, 0);
  if (nS) {
    /* the howdah's awning and rails: Voth's STRIDER_CANVAS (pure white, the surface its instance tint was for) painted
       the owner's orange (2026-10-09: "make strider mahouts awnings orange"); nothing else on the body is white */
    var geo = S.bodyGeo.clone(), cA = geo.attributes.color, orange = new THREE.Color(TUNE.bugAwning);
    for (var ci = 0; ci < cA.count; ci++) if (cA.getX(ci) > 0.99 && cA.getY(ci) > 0.99 && cA.getZ(ci) > 0.99) cA.setXYZ(ci, orange.r, orange.g, orange.b);
    body = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), nS);
    legs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.62, 1, 6).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ color: 0x4a3a28 }), nS * S.BARS);
    body.frustumCulled = legs.frustumCulled = false; body.castShadow = legs.castShadow = true;
    body.userData = { kind: 'strider' }; scene.add(body); scene.add(legs);
    VC.striderMeshes = [body, legs];
  }
  var last = -1;
  (window._frameHooks = window._frameHooks || []).push(function (now) {
    var t = (VC.clock ? VC.clock.t : now / 1000) * TUNE.timeScale, dt = last < 0 ? 0 : Math.min(1, t - last); last = t; VC.motionT = t;
    var on = HOST.layers.transit && HOST.step >= SL.TRANSIT;
    VC.vehicles.forEach(function (m) {
      var p = on && SIM.vehiclePose(m.userData.line, m.userData.k, t);
      m.visible = !!p && !p.offMap; if (!m.visible) return;
      m.position.set(p.x, 0, p.z); m.rotation.y = p.h;
    });
    if (!body) return;
    striders.forEach(function (v, i) {
      var p = on && SIM.vehiclePose(v.line, v.k, t);
      if (!p || p.offMap) {
        tm.compose(tp.set(0, 0, 0), tq.identity(), zero); body.setMatrixAt(i, tm);
        for (var b = 0; b < S.BARS; b++) legs.setMatrixAt(i * S.BARS + b, tm);
        return;
      }
      var dk = VOTH.lifeBridgeY(p.x, p.z), y = dk != null ? dk : Math.max(-S.WADE, terrainH(p.x, p.z));   /* on a bridge: its deck */
      if (p.moving) v.gait += dt * Math.PI * v.spd / (2 * S.STRIDE);   /* Voth: omega = pi * speed / (2 * stride) */
      tq.setFromAxisAngle(up, p.h); tm.compose(tp.set(p.x, y, p.z), tq, one); body.setMatrixAt(i, tm);
      S.legs(legs, i, p.x, y, p.z, p.h, v.gait, p.moving ? 1 : 0);
    });
    body.instanceMatrix.needsUpdate = true; legs.instanceMatrix.needsUpdate = true;
  });
};
/* the windmills' sails: Voth's MILL_CLUSTERS turned as Voth's updateMills() turns them (65k: a unit bar per blade,
   pivot at the hub, rotating in the plane square to the sail hub's facing), shown from the step that built them */
VC.drawMills = function () {
  var CL = VOTH.MILL_CLUSTERS || [], n = 0; CL.forEach(function (c) { c.base = n; n += c.n; });
  if (!n) return;
  var mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ color: 0xffffff }), n);
  mesh.frustumCulled = false; mesh.castShadow = true; scene.add(mesh); VC.millMesh = mesh;
  var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), tg = new THREE.Vector3(), dir = new THREE.Vector3(), col = new THREE.Color(), zero = new THREE.Vector3(0, 0, 0);
  CL.forEach(function (c) { col.set(c.col); for (var i = 0; i < c.n; i++) mesh.setColorAt(c.base + i, col); });
  (window._frameHooks = window._frameHooks || []).push(function (now) {
    var t = now / 1000;
    CL.forEach(function (c) {
      var on = (c.step == null ? 0 : c.step) <= HOST.step;
      tg.set(Math.sin(c.ry), 0, Math.cos(c.ry));
      for (var i = 0; i < c.n; i++) {
        if (!on) { M.compose(zero, Q.identity(), zero); mesh.setMatrixAt(c.base + i, M); continue; }
        var th = c.phase + t * c.spin + i * (Math.PI * 2 / c.n);
        dir.copy(up).multiplyScalar(Math.cos(th)).addScaledVector(tg, Math.sin(th));
        Q.setFromUnitVectors(up, dir); P.set(c.x + dir.x * c.innerR, c.y + dir.y * c.innerR, c.z + dir.z * c.innerR); S.set(c.w, c.len, c.t);
        M.compose(P, Q, S); mesh.setMatrixAt(c.base + i, M);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
};
/* the lighthouses' rotating beacons (owner, 2026-10-09: "make sure lighthouses have rotating beacon"), as Voth's
   82-daynight.js builds them: a flat beam 620 m long, widening and fading from the lamp (a canvas gradient as its
   alpha), additive, spun about the tower. The Port canton's tower (portDeckV2: lamp at the top deck + hw * 0.95 + 4)
   turns two beams; each islet lighthouse (60-land.js: the lamp room at the ground + 47.5) and a lighthouse built off
   any islet turn one. Always lit here: the city plan has no night. */
/* the lamps' light: a small unlit head at each lamp (PLAN.lamps, 37-vc-light.js) in its kind's colour, one instanced
   mesh per step so the slider shows them with their streets. Always lit for now: the day and night cycle (KCLOCK) is
   what will dim them by day. */
VC.drawLampLight = function () {
  var by = {}, geo = new THREE.SphereGeometry(1, 8, 6), col = new THREE.Color(), m4 = new THREE.Matrix4();
  (PLAN.lamps || []).forEach(function (l) { (l.heads || []).forEach(function (h) { (by[l.step] = by[l.step] || []).push([h, l.kind]); }); });
  Object.keys(by).forEach(function (st) {
    var L = by[st], M = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff }), L.length);
    (VC.lampMats = VC.lampMats || []).push(M.material);
    L.forEach(function (e, i) { var r = e[1] === 'fancy' ? 0.16 : e[1] === 'torch' ? 0.2 : 0.14; m4.makeScale(r, r, r).setPosition(e[0][0], e[0][1], e[0][2]); M.setMatrixAt(i, m4); M.setColorAt(i, col.setHex(TUNE.light.glow[e[1]])); });
    M.frustumCulled = false; M.userData = { step: +st, kind: 'lamplight' }; scene.add(M); VC.meshes.push(M);
  });
};
/* the swbay biome (38-vc-flora.js made its mask, fields and spine): bound to BIO with the page's scene, built, baked
   into one group (so the step slider and the flora layer hide it whole), and its runtime LOD ticked every frame. It
   stands with the country (step 13). The ground it reads is the drawn ground's own (TERR.h). */
VC.drawFlora = function () {
  if (typeof SWBAY === 'undefined' || !VC.FLORA) return;
  var F = VC.FLORA, t0 = performance.now(), grp = new THREE.Group();
  grp.userData = { step: 13 }; scene.add(grp); VC.floraGroup = grp;
  try {
    BIO.init({ THREE: THREE, scene: grp, terrainH: function (x, z) { return TERR.h(x, z); }, mask: F.mask, obstacles: F.obstacles,
      ticks: function (fn) { var last = null; (window._frameHooks = window._frameHooks || []).push(function (now) { if (!grp.visible) return; var t = now / 1000, dt = last == null ? 0.016 : Math.min(0.1, t - last); last = t; fn(dt, t); }); },
      seed: 11, origin: F.spine, center: F.center, fields: F.fields,
      eye: function () { return [camera.position.x, camera.position.y, camera.position.z]; }, err: function (m) { console.warn('biome: ' + m); } });
    BIO.setSun([sun.position.x, sun.position.y, sun.position.z]);
    var out = SWBAY.build({ R: F.R, quality: F.quality, fauna: true }) || {}, b = BIO.bake(), T = BIO.totals();
    var by = {}; (SWBAY.TREES || []).forEach(function (t) { var k = SWBAY.SPECIES[t.sp].key; by[k] = (by[k] || 0) + 1; });
    var inPark = (SWBAY.TREES || []).filter(function (t) { return F.park(t.x, t.z); }).length;
    VC.floraStats = { trees: (SWBAY.TREES || []).length, inParks: inPark, heroes: out.heroes || 0, far: out.far || 0, bySpecies: by, tris: T.tris, inst: T.inst, calls: b && b.calls, ms: Math.round(performance.now() - t0) };
  } catch (e) { console.error('flora: ' + (e.stack || e)); VC.floraStats = { error: String(e) }; }
  (window._frameHooks = window._frameHooks || []).push(function () { if (!grp.visible) return; camera.updateMatrixWorld(); BIO.lodTick(camera); });
};
VC.drawBeacons = function () {
  var B = VOTH, list = [];
  var P = VC.decks && VC.decks.Port, pc = B.CIDX.Port;
  if (P && pc) list.push({ x: pc.x, z: pc.z, y: pc.top + 0.12 * pc.tiers + P.shift + P.hw * 0.95 + 4, beams: 2, spin: 0.6 });
  (PLAN.voth || []).forEach(function (q) {
    if (q.role !== 'lighthouse') return;
    if (q.islet) { var I = B.ISLES.filter(function (s) { return s[4] === 'light' && Math.hypot(s[0] - q.x, s[1] - q.z) < s[3] * 1.3; })[0]; if (I) list.push({ x: I[0], z: I[1], y: B.terrainHe(I[0], I[1]) + 47.5, beams: 1, spin: 0.55 }); }
    else list.push({ x: q.x, z: q.z, y: Math.max(0, B.terrainHe(q.x, q.z)) + 3 + 42 + 4, beams: 1, spin: 0.55 });
  });
  var n = list.reduce(function (s, b) { return s + b.beams; }, 0); if (!n) return;
  var cv = document.createElement('canvas'); cv.width = 8; cv.height = 128;
  var g = cv.getContext('2d'), grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0.00, 'rgba(255,242,200,0.85)'); grad.addColorStop(0.12, 'rgba(255,242,200,0.55)'); grad.addColorStop(0.55, 'rgba(255,242,200,0.16)'); grad.addColorStop(1.00, 'rgba(255,242,200,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 8, 128);
  var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  var geo = new THREE.PlaneGeometry(3, 620, 1, 24), pos = geo.attributes.position;
  for (var i = 0; i < pos.count; i++) { var tt = (pos.getY(i) + 310) / 620; pos.setX(i, pos.getX(i) * (1 + tt * 2.2)); }
  pos.needsUpdate = true; geo.translate(0, 310, 0); geo.rotateX(Math.PI / 2);
  var mat = VC.beaconMat = new THREE.MeshBasicMaterial({ map: tex, color: 0xfff2c8, transparent: true, opacity: TUNE.beaconOpacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  var mesh = new THREE.InstancedMesh(geo, mat, n); mesh.frustumCulled = false; mesh.renderOrder = 45; scene.add(mesh);
  var glow = new THREE.Mesh(new THREE.SphereGeometry(2.6, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff0b0 }));
  list.forEach(function (b) { var s = glow.clone(); s.position.set(b.x, b.y, b.z); scene.add(s); });
  var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), P3 = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  VC.beacons = list;
  (window._frameHooks = window._frameHooks || []).push(function (now) {
    var t = now / 1000, k = 0;
    list.forEach(function (b) { for (var j = 0; j < b.beams; j++) { Q.setFromAxisAngle(up, t * b.spin + j * Math.PI * 2 / b.beams); M.compose(P3.set(b.x, b.y, b.z), Q, one); mesh.setMatrixAt(k++, M); } });
    mesh.instanceMatrix.needsUpdate = true;
  });
};
/* the embassies on the Foreign canton (owner, 2026-10-09): the four cultures' own buildings, drawn by their own builds
   (foreign.py: settlements/dalab for Dalab, Iziz and the Republic, settlements/ys for Hykkousoi), each on its plot, its
   front to the deck's middle, shown from step 2 */
VC.drawEmbassies = function () {
  VC.embassies = [];
  if (typeof FOREIGN === 'undefined' || !VC.embassyPlots) return;
  VC.embassyPlots.forEach(function (e) {
    var g = null; try { g = FOREIGN.place(e.culture, e.c[0], e.y, e.c[1], Math.atan2(-e.f[1], e.f[0])); } catch (er) { console.error('embassy ' + e.culture + ': ' + er); }
    if (!g) return;
    g.userData.step = 2; g.userData.name = e.culture + ' embassy'; scene.add(g); VC.embassies.push(g);
  });
};
VC.labels = function () {
  VC.labelObjs = [];
  var add = function (text, x, z, up, size, step) { var s = VIEW.sprite(text, { size: size || 0.03 }); s.position.set(x, Math.max(0, terrainH(x, z)) + up, z); s.userData.step = step; scene.add(s); VC.labelObjs.push(s); };
  var names = { shrine: 'Shrine', lighthouse: 'Lighthouse', healing: 'House of Healing', funeraryTemple: 'Funerary Temple' };
  (PLAN.voth || []).forEach(function (q) { add(q.id + ' ' + names[q.role], q.x, q.z, 70, 0.03, 1); });
  PLAN.landmarks.forEach(function (L) { if (L.role === 'garrison') add('I Garrison castle', L.x, L.z, 70, 0.03, 1); });
  if (VC.wall) VC.wall.gates.forEach(function (g) { if (g.named) add(g.marker + ' ' + g.name.replace('Gate', ' gate'), g.x, g.z, 60, 0.03, 5); });
  PLAN.site.forEach(function (d) { if (['zone', 'wall', 'misc'].indexOf(d.role) >= 0 && d.role !== 'misc') return; var c = polyCentroid(d.poly); add(d.name, c[0], c[1], 30, 0.024, 2); });
};

/* show the city as it stood after step st */
HOST.applyStep = function () {
  var st = HOST.step;
  Object.keys(HOST.streets).forEach(function (k) { var m = HOST.streets[k]; m.visible = m.userData.step <= st; });
  VC.meshes.forEach(function (M) { M.visible = M.userData.step <= st; });
  (VC.embassies || []).forEach(function (g) { g.visible = g.userData.step <= st; });
  VC.labelObjs.forEach(function (s) { s.visible = HOST.layers.labels && s.userData.step <= st; });
  (VC.transitObjs || []).forEach(function (o) { o.visible = HOST.layers.transit && st >= SL.TRANSIT; });
  if (VC.floraGroup) VC.floraGroup.visible = HOST.layers.flora && st >= VC.floraGroup.userData.step;
  if (typeof ATMOS !== 'undefined' && ATMOS.root) ATMOS.root.visible = st >= 12;
  VC.paint();
  if (HOST.updateBuildings) HOST.updateBuildings(true);
};

/* ---------------------------------------------------------------- the panel and the inspector */
VC.ui = function () {
  var sl = $('step'); sl.max = SL.LAST; sl.value = HOST.step;
  sl.oninput = function () { HOST.step = +sl.value; HOST.applyStep(); VC.stats(); };
  $('prev').onclick = function () { sl.value = Math.max(0, HOST.step - 1); sl.oninput(); };
  $('next').onclick = function () { sl.value = Math.min(SL.LAST, HOST.step + 1); sl.oninput(); };
  var play = null;
  $('play').onclick = function () {
    if (play) { clearInterval(play); play = null; $('play').textContent = 'play'; return; }
    sl.value = 0; sl.oninput(); $('play').textContent = 'stop';
    play = setInterval(function () { if (HOST.step >= SL.LAST) { clearInterval(play); play = null; $('play').textContent = 'play'; return; } sl.value = HOST.step + 1; sl.oninput(); }, 1600);
  };
  Object.keys(HOST.layers).forEach(function (k) {
    var b = $('ly-' + k); if (!b) return;
    var paint = function () { b.classList.toggle('on', HOST.layers[k]); };
    b.onclick = function () { HOST.layers[k] = !HOST.layers[k]; paint(); HOST.applyStep(); };
    paint();
  });
  $('v-map').onclick = function () { if (ctl.walk) window._setWalk(false); ctl.target.set(300, 0, 200); ctl.dist = 6200; ctl.el = 1.45; ctl.az = 0; updateCamera(); };
  $('v-city').onclick = function () { if (ctl.walk) window._setWalk(false); ctl.target.set(900, 0, 400); ctl.dist = 2600; ctl.el = 0.7; ctl.az = 0.5; updateCamera(); };
  $('v-street').onclick = function () {
    var w = PLAN.ways.filter(function (w) { return w.cls === 'main'; })[7] || PLAN.ways[0], s = w.F.len * 0.4, p = w.F.at(s), t = w.F.tan(s, 4);
    ctl.target.set(p[0], terrainH(p[0], p[1]) + 1.7, p[1]); ctl.walk = true; ctl.az = Math.atan2(-t[0], -t[1]); ctl.el = -0.05; updateCamera();
  };
  $('export').onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([SL.exportPlan()], { type: 'application/json' })); a.download = 'voth-city-plan.json'; a.click(); };
  var lg = ''; Object.keys(HOST.COL.lot).forEach(function (k) { lg += '<span><i style="background:' + HOST.COL.lot[k] + '"></i>' + k + '</span>'; });
  lg += '<br>'; Object.keys(VC.ROLECOL).forEach(function (k) { lg += '<span><i style="background:' + VC.ROLECOL[k] + '"></i>' + k + '</span>'; });
  $('legend').innerHTML = lg;
  /* the wheel goes further out than the engine's 2 km: Voth's lake wants it */
  renderer.domElement.addEventListener('wheel', function (e) { if (ctl.walk) return; ctl.dist = Math.max(3, Math.min(12000, ctl.dist * (1 + e.deltaY * 0.001))); updateCamera(); e.preventDefault(); e.stopImmediatePropagation(); }, { capture: true, passive: false });
  var tip = $('tip'), last = 0, on = false;
  $('ly-inspect').onclick = function () { on = !on; this.classList.toggle('on', on); tip.style.display = on ? 'block' : 'none'; };
  window.addEventListener('keydown', function (e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'i') $('ly-inspect').onclick(); if (e.key === '[') $('prev').onclick(); if (e.key === ']') $('next').onclick();
  });
  window.addEventListener('mousemove', function (e) {
    if (!on || e.target !== renderer.domElement) return;
    var n = Date.now(); if (n - last < 70) return; last = n;
    var r = new THREE.Raycaster(); r.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1), camera);
    tip.style.left = (e.clientX + 16) + 'px'; tip.style.top = (e.clientY + 12) + 'px';
    tip.innerHTML = VC.describe(r.ray);
  });
  VC.stats();
};
VC.pickLot = function (r) {
  var best = null, bt = Infinity, o = r.origin, d = r.direction;
  PLAN.lots.forEach(function (L) {
    if (!HOST.alive(L) || !HOST.layers.buildings) return;
    var c = Math.cos(L.ry), s = Math.sin(L.ry), ox = o.x - L.x, oz = o.z - L.z;
    var O = [ox * c - oz * s, o.y, ox * s + oz * c], D = [d.x * c - d.z * s, d.y, d.x * s + d.z * c], lo = [-L.w / 2, L.y, -L.d / 2], hi = [L.w / 2, L.y + L.h, L.d / 2], t0 = 0, t1 = bt;
    for (var a = 0; a < 3; a++) {
      if (Math.abs(D[a]) < 1e-9) { if (O[a] < lo[a] || O[a] > hi[a]) return; continue; }
      var ta = (lo[a] - O[a]) / D[a], tb = (hi[a] - O[a]) / D[a]; if (ta > tb) { var tt = ta; ta = tb; tb = tt; }
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb); if (t0 > t1) return;
    }
    if (t0 < bt) { bt = t0; best = L; }
  });
  return best;
};
VC.describe = function (r) {
  var L = VC.pickLot(r);
  if (L) {
    var A = ASSET_BY_KEY[L.key] || {}, w = PLAN.ways[L.way];
    return '<b>' + (A.name || L.key) + '</b> <span class="k">' + L.key + ' v' + L.v + '</span><br>' + L.cls + (L.role ? ' (' + L.role + ')' : '') + ' &middot; ' + VC.roleAt([L.x, L.z]) +
      ' &middot; wealth ' + L.wealth.toFixed(2) + (L.light ? ' &middot; ' + L.light + ' light' : '') + (L.power ? ' &middot; power house' : '') + '<br>' + (w ? 'fronts ' + w.cls + ' (' + w.tag + ')' : 'fixed') + ' &middot; step ' + L.born;
  }
  var h = VIEW.pick(r); if (!h) return '';
  var k = SL.R.idx(h[0], h[1]), c = k >= 0 ? SL.R.occ[k] : OCC.OUT, own = k >= 0 ? SL.R.own[k] : -1;
  var names = ['open ground', 'street', 'lot', 'footprint', 'water or outside', 'alley entrance', 'alley', 'green'];
  var t = '<b>' + names[c] + '</b> &middot; ' + VC.roleAt([h[0], h[1]]) + ' <span class="k">' + h[0].toFixed(0) + ', ' + h[1].toFixed(0) + ' &middot; ' + terrainH(h[0], h[1]).toFixed(1) + ' m</span>';
  if ((c === OCC.STREET || c === OCC.ALLEY) && PLAN.ways[own]) t += '<br>' + PLAN.ways[own].cls + ' &middot; ' + PLAN.ways[own].tag;
  if (HOST.step >= 6) t += '<br>wealth ' + SL.wealth([h[0], h[1]]).toFixed(2);
  return t;
};
VC.stats = function () {
  var st = HOST.step, S = PLAN.stats.byStep[st], h = '<b>Step ' + st + ': ' + SL.STEPS[st] + '</b>';
  var log = PLAN.log.filter(function (l) { return l.indexOf('[' + st + ']') === 0; }).map(function (l) { return l.slice(l.indexOf(']') + 2); });
  if (log.length) h += '<div class="lg">' + log.join('<br>') + '</div>';
  var lots = Object.keys(S.lots).sort(), tot = 0; lots.forEach(function (k) { tot += S.lots[k]; });
  h += '<table><tr><th colspan=2>lots standing: ' + tot + '</th></tr>';
  lots.forEach(function (k) { h += '<tr><td><i style="background:' + (HOST.COL.lot[k] || '#888') + '"></i>' + k + '</td><td>' + S.lots[k] + '</td></tr>'; });
  h += '<tr><th colspan=2>streets</th></tr>';
  ['avenue', 'main', 'side', 'alley', 'highway'].forEach(function (k) { var e = S.ways[k]; if (e) h += '<tr><td>' + k + '</td><td>' + e.n + ' &middot; ' + (e.m / 1000).toFixed(1) + ' km</td></tr>'; });
  /* the ferry and elephant bug lines (core/simulation transport routes): click one to pick it out on the map */
  if (PLAN.transit && PLAN.transit.lines.length) {
    var side = function (id) { var r = id.split(':'), rt = SITE.route(r[0]); return 'off map ' + (rt ? (r[1] === 'in' ? rt.enter : rt.exit) : ''); };
    h += '<tr><th colspan=2>lines' + (st < SL.TRANSIT ? ' <span class="k">(from step ' + SL.TRANSIT + ')</span>' : '') + '</th></tr>';
    PLAN.transit.lines.forEach(function (l, i) {
      var stops = l.stops.map(function (x) { return x.indexOf('port:') === 0 ? side(x.slice(5)) : x; }).join(' &rarr; ');
      h += '<tr class="ln' + (VC.selLine === l.id ? ' sel' : '') + '" data-i="' + i + '"><td colspan=2><i style="background:' + (l.kind === 'ferry' ? '#3a9ad9' : '#b07a3a') + '"></i><b>' + l.name + '</b> <span class="k">' + l.kind +
        (l.loop ? ', loop' : ', out and back') + ' &middot; ' + l.vehicles + ' ' + (l.kind === 'ferry' ? 'ferries' : 'elephant bugs') + ' &middot; ' + Math.round(l.period / 60) + ' min round</span><br><span class="k">' + stops + '</span>' +
        (l.ok ? '' : '<br><span style="color:#ff9a7a">no route for ' + l.failed.join(', ') + ' (drawn straight)</span>') + '</td></tr>';
    });
  }
  /* the census of the finished plan (36-vc-census.js): people against workplaces, by kind of work */
  var C = PLAN.census;
  if (C && st === SL.LAST) {
    var rows = Object.keys(C.byJob).filter(function (k) { return C.byJob[k].n > 0; }).sort(function (a, b) { return C.byJob[b].n - C.byJob[a].n; });
    h += '<tr><th colspan=2>census <span class="k">(estimate; ' + C.note + ')</span></th></tr>';
    h += '<tr><td>residents</td><td>' + C.population.toLocaleString() + '</td></tr><tr><td>of working age, working</td><td>' + C.workforce.toLocaleString() + '</td></tr>';
    h += '<tr><td>workplaces</td><td>' + C.jobs.toLocaleString() + '</td></tr><tr><td>' + (C.jobs >= C.workforce ? 'jobs unfilled' : 'workers without a place') + '</td><td>' + Math.abs(C.jobs - C.workforce).toLocaleString() + '</td></tr>';
    h += '<tr><th colspan=2>where they live</th></tr>';
    Object.keys(C.homes).sort(function (a, b) { return C.homes[b] - C.homes[a]; }).forEach(function (k) { h += '<tr><td>' + k + '</td><td>' + C.homes[k].toLocaleString() + '</td></tr>'; });
    h += '<tr><th colspan=2>jobs</th></tr>';
    rows.forEach(function (k) { h += '<tr><td>' + k + ' <span class="k">' + C.byJob[k].where + '</span></td><td>' + C.byJob[k].n.toLocaleString() + '</td></tr>'; });
  }
  h += '</table><div class="lg">layout ' + (PLAN.stats.ms.reduce(function (a, b) { return a + b; }, 0) / 1000).toFixed(1) + ' s' + (HOST.drawStats ? ' &middot; ' + HOST.drawStats.calls + ' building calls' : '') + '</div>';
  $('stats-body').innerHTML = h;
  Array.prototype.forEach.call($('stats-body').querySelectorAll('tr.ln'), function (tr) {
    tr.onclick = function () {
      var l = PLAN.transit.lines[+tr.dataset.i]; VC.selLine = VC.selLine === l.id ? null : l.id;
      PLAN.transit.lines.forEach(function (q) { if (q.obj) q.obj.material.opacity = !VC.selLine || q.id === VC.selLine ? 1 : 0.15; });
      if (VC.selLine && l.pts.length) { var b = l.pts.reduce(function (m, p) { return [Math.min(m[0], p[0]), Math.min(m[1], p[1]), Math.max(m[2], p[0]), Math.max(m[3], p[1])]; }, [1e9, 1e9, -1e9, -1e9]);
        if (ctl.walk) window._setWalk(false); ctl.target.set((b[0] + b[2]) / 2, 0, (b[1] + b[3]) / 2); ctl.dist = Math.max(900, Math.hypot(b[2] - b[0], b[3] - b[1]) * 1.1); ctl.el = 1.35; updateCamera(); }
      VC.stats();
    };
  });
};

/* every panel folds down to its title (owner, 2026-10-09: "make the sidebars minimizeable"); remembered per browser */
VC.panels = function () {
  var saved = {}; try { saved = JSON.parse(localStorage.getItem('voth-city-panels') || '{}'); } catch (e) { }
  ['bar', 'stats', 'marks'].forEach(function (id) {
    var el = $(id); if (!el) return;
    var b = document.createElement('button'); b.className = 'pnl-min'; b.title = 'fold this panel';
    var paint = function () { var on = el.classList.contains('min'); b.textContent = on ? '+' : '\u2013'; b.title = on ? 'open this panel' : 'fold this panel'; };
    b.onclick = function (e) { e.stopPropagation(); el.classList.toggle('min'); saved[id] = el.classList.contains('min'); paint(); try { localStorage.setItem('voth-city-panels', JSON.stringify(saved)); } catch (er) { } };
    el.appendChild(b); if (saved[id]) el.classList.add('min'); paint();
  });
};

/* the four plain rim cantons, captured whole from Voth, lose their generic deck buildings: everything standing on
   the top deck except the paving slab (the big piece), the parapets (at the rim) and the obelisk at the middle.
   33-vc-country.js lays the decks out again. */
VC.stripCantons = function () {
  var D = window.VOTH_CITY_CAPTURE; if (!D) return 0;
  var gone = 0;
  VC.DECKS.forEach(function (n) {
    var c = VOTH.CIDX[n], vs = D.entries['voth_city_canton_' + n.toLowerCase()], v = vs && vs[0]; if (!c || !v) return;
    var pl = null; v.r.forEach(function (q) { if (q[0] !== 9 && (!pl || q[5] * q[7] > pl[5] * pl[7])) pl = q; });
    var bed = Math.min(-6, VOTH.terrainH(c.x, c.z)), hw = c.r * 0.97 * Math.pow(0.86, c.tiers), dy = c.top + 0.12 * c.tiers - bed, n0 = v.r.length;
    v.r = v.r.filter(function (q) {
      if (q[0] === 9 || q[3] < dy - 1.5) return true;
      var lx = q[2] - pl[2], lz = q[4] - pl[4], shape = D.shapes[q[0]];
      if (q[5] * q[7] > 2000) return true;                                           /* the paving slab */
      if (Math.max(Math.abs(lx), Math.abs(lz)) > hw * 0.95) return true;               /* the parapets */
      if (Math.hypot(lx, lz) < 7 && (shape === 'cyl' || shape === 'fr3')) return true;  /* the obelisk */
      return false;
    });
    gone += n0 - v.r.length;
  });
  /* the Port canton's shed() warehouses (Voth's portDeckV2: deck and quays): each is found by its fr8 roof and the
     body box under it, and goes with its cornice and door; the lighthouse, the guild hall, the stairs, the piers and
     the crane stay */
  var pv = D.entries.voth_city_canton_port && D.entries.voth_city_canton_port[0];
  if (pv) {
    var R0 = pv.r, n1 = R0.length, regions = [];
    R0.forEach(function (q) {
      if (q[0] === 9 || D.shapes[q[0]] !== 'fr8' || D.fams[q[1]] !== 'roof') return;
      var body = R0.filter(function (b) { return b !== q && b[0] !== 9 && D.shapes[b[0]] === 'box' && Math.abs(b[2] - q[2]) < 0.05 && Math.abs(b[4] - q[4]) < 0.05 && Math.abs(b[5] * 1.02 - q[5]) < 0.3; })[0];
      if (body) regions.push({ c: [q[2], q[4]], ry: q[8], hw: q[5] / 2 + 1.5, hd: q[7] / 2 + 1.5, y0: body[3] - 0.5, y1: q[3] + q[6] + 0.5 });
    });
    pv.r = R0.filter(function (q) {
      if (q[0] === 9) return true;
      return !regions.some(function (g) {
        if (q[3] < g.y0 || q[3] > g.y1) return false;
        var dx = q[2] - g.c[0], dz = q[4] - g.c[1], cs = Math.cos(g.ry), sn = Math.sin(g.ry), lx = dx * cs - dz * sn, lz = dx * sn + dz * cs;
        return Math.abs(lx) <= g.hw && Math.abs(lz) <= g.hd;
      });
    });
    gone += n1 - pv.r.length;
  }
  return gone;
};

/* ---------------------------------------------------------------- day and night
   One clock for the page: core/clock's KCLOCK, a 72-minute day (TUNE.clock). It drives:
   - the sun, by Voth's own sun direction for the hour (21-sky.js skySunDir, lifted into VOTH), with Voth's sky colours
     (PAL.sky): the sun's strength and colour, the fill turning to the gas giant's planetshine at night, the sky and fog;
   - the evening's lights: every lamp head is a core/atmos glow with its own on and off hours (37-vc-light.js), the
     lamp heads and the lighthouse beams dim by day;
   - motion: the vehicles run on the clock's motion time (times TUNE.timeScale), so the speed buttons speed them too.
   SIM reads the clock's hour and day (34-vc-transit.js). */
VC.dayNight = function () {
  var C = VC.clock = KCLOCK.make({ hour: TUNE.clock.hour, running: TUNE.clock.running }), P = VOTH.PAL.sky;
  var hemi = null, fill = null; scene.traverse(function (o) { if (o.isHemisphereLight && !hemi) hemi = o; if (o.isDirectionalLight && o !== sun && !fill) fill = o; });
  var D0 = { sun: sun.intensity, hemi: hemi && hemi.intensity, hemiC: hemi && hemi.color.clone(), fill: fill && fill.intensity, fillC: fill && fill.color.clone(), bg: scene.background.clone() };
  var col = function (h) { return new THREE.Color(h); }, cNight = col(P.nightHor), cSunset = col(P.sunset), cLow = col(P.sunLow), cCore = col(P.sunCore), cShine = col(P.shine), cNightZen = col(P.nightZen);
  var giant = VOTH.altAzToVec(VOTH.SKY.giantAlt, VOTH.SKY.giantAz), sd = new THREE.Vector3(), tmp = new THREE.Color();
  var ss = function (a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  VC.applyHour = function (h) {
    VOTH.skySunDir(h, TUNE.clock.doy, sd);
    var up = ss(Math.sin(-6 * Math.PI / 180), Math.sin(8 * Math.PI / 180), sd.y), hi = ss(0, 0.4, sd.y), tw = Math.max(0, 1 - Math.abs(sd.y) / 0.2);
    sun.position.copy(sun.target.position).addScaledVector(sd, 3000); sun.intensity = D0.sun * up; sun.color.copy(cLow).lerp(cCore, hi);
    if (fill) { fill.position.copy(giant).multiplyScalar(3000); fill.intensity = D0.fill * up + 0.32 * (1 - up); fill.color.copy(cShine).lerp(D0.fillC, up); }
    if (hemi) { hemi.intensity = D0.hemi * (0.3 + 0.7 * up); hemi.color.copy(cNightZen).lerp(D0.hemiC, up); }
    tmp.copy(cNight).lerp(D0.bg, up).lerp(cSunset, 0.35 * tw * Math.min(1, up * 2)); scene.background.copy(tmp); if (scene.fog) scene.fog.color.copy(tmp);
    var night = typeof ATMOS !== 'undefined' && ATMOS.night ? ATMOS.night(h) : 1 - up;
    (VC.lampMats || []).forEach(function (m) { m.color.setScalar(0.3 + 0.7 * night); });
    if (VC.beaconMat) VC.beaconMat.opacity = TUNE.beaconOpacity * night;
    VC.dayK = up;
  };
  /* the lamp glows: core/atmos, its clock fed the page's frame time */
  if (typeof ATMOS !== 'undefined') {
    VC.atmosHooks = [];
    ATMOS.init({ THREE: THREE, scene: scene, camera: camera, hour: function () { return C.hour; }, onFrame: function (fn) { VC.atmosHooks.push(fn); },
      ground: function (x, z) { return TERR.h(x, z); }, seed: 7, err: function (m) { console.warn(m); },
      viewH: function () { return innerHeight; }, pixelRatio: function () { return renderer.getPixelRatio(); } });
    (PLAN.lamps || []).forEach(function (l) { var c = new THREE.Color(TUNE.light.glow[l.kind]); (l.heads || []).forEach(function (p) { ATMOS.glowAdd(p[0], p[1], p[2], [c.r, c.g, c.b], TUNE.light.halo[l.kind], l.on, l.off); }); });
    ATMOS.finish();
  }
  var last = null, shown = '';
  (window._frameHooks = window._frameHooks || []).unshift(function (now) {
    var t = now / 1000, dt = last == null ? 0 : t - last; last = t;
    C.step(dt);
    if (VC.atmosHooks) { ATMOS.clock.scale = C.scale; VC.atmosHooks.forEach(function (fn) { fn(dt); }); }
    VC.applyHour(C.hour);
    var hh = Math.floor(C.hour), mm = Math.floor((C.hour - hh) * 60), txt = ('0' + hh).slice(-2) + ':' + ('0' + mm).slice(-2) + ' day ' + (C.day + 1);
    if (txt !== shown) { shown = txt; var e = $('clk'); if (e) e.textContent = txt; var s = $('clk-hour'); if (s && document.activeElement !== s) s.value = C.hour; }
  });
  VC.applyHour(C.hour);
};
VC.clockUI = function () {
  var C = VC.clock, run = $('clk-run'), sp = $('clk-speeds'), hr = $('clk-hour'); if (!C || !run) return;
  var paint = function () { run.textContent = C.running ? 'hold' : 'run'; [].forEach.call(sp.children, function (b) { b.classList.toggle('on', +b.dataset.k === C.scale); }); };
  run.onclick = function () { C.run(!C.running); paint(); };
  TUNE.clock.speeds.forEach(function (k) { var b = document.createElement('button'); b.textContent = k + 'x'; b.dataset.k = k; b.onclick = function () { C.scale = k; paint(); }; sp.appendChild(b); });
  hr.oninput = function () { C.set(+hr.value); if (SIM.jump) SIM.jump(); VC.applyHour(C.hour); };
  paint();
};
VC.start = function () {
  VC.stripped = VC.stripCantons();
  VIEW.stage(); VIEW.terrain(); VIEW.refreshTerrain(null, true);
  VIEW.cantons(); VIEW.bridges(); VIEW.causeways(); VIEW.cantonLabels();
  VC.drawPrims(); HOST.buildStreets(); HOST.buildBuildings(); VC.drawTransit(); VC.drawVehicles(); VC.drawMills(); VC.drawBeacons(); VC.drawLampLight(); VC.drawFlora(); VC.dayNight(); VC.drawEmbassies(); VC.labels();
  VC.ui(); VC.clockUI(); VC.marks(); VC.tools(); VC.panels(); HOST.applyStep(); $('v-city').onclick();
};
