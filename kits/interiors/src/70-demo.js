/* ======================== Demo sheet: sample rooms ========================
   The demo, not the kit: sample rooms on a sheet, one row per room kind, each a procedural
   shell (50-shell.js) around a ROOM(), furnished by furnishRoom() from the master catalog
   through adapters/catalog-adapter.js. Shapes: rectangles, L-shapes, trapezoids, an
   irregular pentagon, a rotated room. Then a row of PLANNED buildings (planBuilding,
   46-planner.js; drawn by 51-building.js): a two-room house, a two-storey town house, an
   L-shaped inn and a three-storey tower, furnished end to end, with WALKERS (47-life.js,
   57-figures.js) coming in from the street, through doors and up stairs, to a seat, bed or
   bench, and out again. LIGHTS: the adapter strips the catalog's PointLights (their data is in
   each plan's lights) and a fixed pool of LIGHT_POOL lights is moved to the rooms nearest the
   camera; ?lights=keep keeps the catalog's real lights instead.
   Exposes window._interiors (rooms, plans, buildings, walkers, gotoRoom, setLevel, setTime,
   reseed, ...) and sets window._ready.
   ====================================================================== */
(function () {
  'use strict';
  const IX = KratorInteriors, G = IX.geom;
  const KEEP_LIGHTS = /[?&]lights=keep\b/.test(location.search);
  const catalog = IX.catalogAdapter({ lights: KEEP_LIGHTS ? 'keep' : 'strip' });
  const FLOOR_Y = 0.2, LIGHT_POOL = 6;

  /* ---------- shapes, in plot-local metres; edge 0 is the back (-z), the camera sits at +z */
  function rect(w, d) { return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]; }
  function ell(w, d, cw, cd) {     /* a w x d rectangle with its back-right cw x cd corner taken out */
    return [[-w / 2, -d / 2], [w / 2 - cw, -d / 2], [w / 2 - cw, -d / 2 + cd], [w / 2, -d / 2 + cd], [w / 2, d / 2], [-w / 2, d / 2]];
  }
  function trap(wb, wf, d) { return [[-wb / 2, -d / 2], [wb / 2, -d / 2], [wf / 2, d / 2], [-wf / 2, d / 2]]; }
  const PENT = [[-3.4, -2.4], [1.6, -3.1], [3.6, 0.2], [2.4, 3.0], [-3.2, 2.6]];

  /* ---------- the sheet: rows of [kind, culture, shape, opts]. Doors and windows are [edge, fraction, width]. */
  const F = 2;   /* the front edge of rect/trap */
  const ROWS = [
    ['hall', [
      ['yuni-common', rect(7, 5.5), { doors: [[F, 0.5, 1.0]], windows: [[1, 0.5], [3, 0.5]], wealth: 0.4 }],
      ['ancient', ell(8.5, 7, 3.5, 3), { doors: [[5, 0.75, 1.2], [3, 0.5, 1.2]], windows: [[0, 0.5]], wealth: 0.7, h: 3.4 }],
      ['beast-rider', rect(9, 6.5), { doors: [[F, 0.3, 1.2], [1, 0.6, 1.0]], windows: [[0, 0.3], [0, 0.7]], wealth: 0.5, rot: 0.42 }],
      ['yuni-court', PENT, { doors: [[4, 0.5, 1.1]], windows: [[1, 0.5], [2, 0.5]], wealth: 0.85 }]
    ]],
    ['bedroom', [
      ['ancients-salvage', rect(5, 4.2), { doors: [[F, 0.75, 0.9]], windows: [[0, 0.5]], wealth: 0.3 }],
      ['ancient', ell(6, 5.5, 2.5, 2.2), { doors: [[5, 0.6, 1.0]], windows: [[1, 0.5]], wealth: 0.6 }],
      ['yuni-common', rect(4.6, 4.2), { doors: [[3, 0.5, 0.9, 'right']], windows: [[0, 0.5]], wealth: 0.5 }]
    ]],
    ['kitchen', [
      ['ancients-salvage', rect(5.2, 4.2), { doors: [[F, 0.3, 0.9]], windows: [[1, 0.5]], wealth: 0.4 }],
      ['yuni-common', trap(5.5, 4.2, 4.6), { doors: [[F, 0.5, 0.9]], windows: [[0, 0.3]], wealth: 0.5 }]
    ]],
    ['tavern', [
      ['beast-rider', rect(10, 7.5), { doors: [[F, 0.5, 1.4], [1, 0.75, 1.0, 'right', 'out']], windows: [[3, 0.5], [0, 0.25]], wealth: 0.5, h: 3.4 }],
      ['voth', ell(11, 8.5, 4, 3), { doors: [[5, 0.6, 1.4]], windows: [[4, 0.5]], wealth: 0.6, h: 3.6 }]
    ]],
    ['workshop', [
      ['voth', rect(9, 7), { doors: [[F, 0.5, 1.6]], windows: [[1, 0.5], [3, 0.5]], wealth: 0.5, h: 3.6 }],
      ['beast-rider', rect(6.5, 5.5), { doors: [[F, 0.25, 1.1]], windows: [[0, 0.5]], wealth: 0.4 }],
      ['ancient', trap(8, 6, 6), { doors: [[F, 0.5, 1.2]], windows: [[0, 0.5]], wealth: 0.6, h: 3.4, rot: -0.3 }]
    ]],
    ['store', [
      ['beast-rider', rect(7, 6), { doors: [[F, 0.5, 1.4]], windows: [], wealth: 0.5, h: 3.8 }],
      ['ancient', rect(5.5, 4.5), { doors: [[F, 0.5, 1.0]], windows: [], wealth: 0.5 }],
      ['order', ell(6, 5.5, 2.2, 2.2), { doors: [[5, 0.5, 1.0]], windows: [[0, 0.5]], wealth: 0.5 }]
    ]],
    ['shrine', [
      ['beast-rider', rect(6.5, 6.5), { doors: [[F, 0.5, 1.2]], windows: [[1, 0.5], [3, 0.5]], wealth: 0.5, h: 3.6 }],
      ['voth', rect(10, 9.5), { doors: [[F, 0.5, 1.8]], windows: [[1, 0.4], [3, 0.4]], wealth: 0.7, h: 4.6 }]
    ]],
    ['study', [
      ['order', rect(6, 5), { doors: [[F, 0.25, 1.0]], windows: [[0, 0.5]], wealth: 0.6, h: 4.2 }]
    ]],
    ['library', [
      ['order', rect(10, 8), { doors: [[F, 0.5, 1.4]], windows: [[1, 0.5], [3, 0.5]], wealth: 0.7, h: 6.0 }]
    ]]
  ];
  const DX = 16, DZ = 17;

  function xf(p, ox, oz, rot) {       /* plot-local -> world (rot turns the plot like a building's yaw) */
    const c = Math.cos(rot), s = Math.sin(rot);
    return [IX.round(ox + p[0] * c + p[1] * s), IX.round(oz - p[0] * s + p[1] * c)];
  }
  function onEdge(poly, e, f) { const a = poly[e], b = poly[(e + 1) % poly.length]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; }

  const defs = [];   /* { room, plot } */
  ROWS.forEach(function (row, ri) {
    const kind = row[0], oz = -ri * DZ;
    row[1].forEach(function (it, ci) {
      const cul = it[0], shape = it[1], o = it[2], ox = ci * DX, rot = o.rot || 0;
      const poly = shape.map(function (p) { return xf(p, ox, oz, rot); });
      const id = kind + '.' + cul;
      defs.push({ plot: { ox: ox, oz: oz, row: ri, col: ci, rot: rot, shape: shape }, room: {
        id: id, building: 'demo_' + kind + '_' + ci, kind: kind, culture: cul, poly: poly, y: FLOOR_Y, h: o.h || 3.0, wealth: o.wealth,
        doors: (o.doors || []).map(function (d) { return { at: onEdge(poly, d[0], d[1]), w: d[2] || 1.0, hinge: d[3] || 'left', swing: d[4] || 'in', to: 'street' }; }),
        windows: (o.windows || []).map(function (w) { return { at: onEdge(poly, w[0], w[1]), w: w[2] || 1.0, sill: 0.95, h: 1.1 }; })
      } });
    });
  });
  /* ---------- planned buildings (planBuilding): the footprint is the OUTER face of the walls */
  function brect(cx, cz, w, d, rot) {
    const c = Math.cos(rot || 0), sn = Math.sin(rot || 0);
    return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(function (p) { return [IX.round(cx + p[0] * c + p[1] * sn), IX.round(cz - p[0] * sn + p[1] * c)]; });
  }
  const BZ = -ROWS.length * DZ;
  const BUILDINGS = [
    { label: 'house', sub: 'hall + bedroom, one storey', program: ['hall', 'bedroom'],
      shell: { id: 'house', poly: brect(1.2, BZ, 10.9, 5.7), y: FLOOR_Y, levels: [{ h: 3.0 }], doors: [{ at: [-1.2, BZ + 2.85], w: 1.0 }],
        culture: 'ancients-salvage', wealth: 0.45, roof: 'gable', pitch: 0.55 } },
    { label: 'town house', sub: 'two storeys, programme "dwelling"', program: 'dwelling',
      shell: { id: 'townhouse', poly: brect(19, BZ, 10.5, 8.5), y: FLOOR_Y, levels: [{ h: 3.0 }, { h: 2.8 }], doors: [{ at: [17.5, BZ + 4.25], w: 1.1 }],
        culture: 'yuni-common', wealth: 0.55, roof: 'gable', pitch: 0.6 } },
    { label: 'inn', sub: 'L-shaped, one storey, hip roof', program: ['tavern', 'kitchen', 'store'],
      shell: { id: 'inn', poly: [[32, BZ - 5], [45, BZ - 5], [45, BZ + 0.5], [38.5, BZ + 0.5], [38.5, BZ + 5.5], [32, BZ + 5.5]].map(function (p) { return [p[0], p[1]]; }),
        y: FLOOR_Y, levels: [{ h: 3.4 }], doors: [{ at: [35.2, BZ + 5.5], w: 1.4 }], culture: 'voth', wealth: 0.6, roof: 'hip', pitch: 0.5 } },
    { label: 'tower', sub: 'three storeys, rotated, hip roof', program: [['workshop', 'store'], ['study', 'bedroom'], ['bedroom']],
      shell: { id: 'tower', poly: brect(55, BZ, 9.5, 7.5, 0.3), y: FLOOR_Y, levels: [{ h: 3.2 }, { h: 3.0 }, { h: 3.0 }], front: 2,
        culture: 'ancient', wealth: 0.6, roof: 'hip', pitch: 0.65 } }
  ];

  /* ---------- register, shell, furnish, build */
  const single = defs.map(function (d) { return ROOM(d.room); });
  const shells = single.map(function (R) { const s = IX.view.shell(R); scene.add(s); IX.view.cutaway.add(s); return s; });
  const buildings = BUILDINGS.map(function (b) {
    const B = IX.planBuilding(b.shell, b.program, { register: true });
    const s = IX.view.building(B); scene.add(s); IX.view.cutaway.add(s); shells.push(s);
    B.label = b.label; B.sub = b.sub;
    return B;
  });
  const rooms = single.concat([].concat.apply([], buildings.map(function (B) { return B.rooms; })));
  const stairs = [].concat.apply([], buildings.map(function (B) { return B.stairs; }));
  const buildingOf = {};
  buildings.forEach(function (B) { B.rooms.forEach(function (R) { buildingOf[R.id] = B; }); });
  let seed = 0, plans = [], outlines = [], nav = null, walkers = [], figures = null;
  const S = { outline: false, grid: false, walkers: true };
  function clearFurniture() {
    IX.view.cutaway.tagged = [];
    for (const P of plans) for (const g of (P.objects || [])) {
      if (!g) continue;
      scene.remove(g);
      const i = INSTANCES.indexOf(g); if (i >= 0) INSTANCES.splice(i, 1);
      g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
    }
  }
  function furnishAll() {
    clearFurniture();
    plans = rooms.map(function (R) {
      const P = furnishRoom(R, catalog, { seed: seed });
      IX.buildRoom(P, catalog, R);
      if (R.level) for (const g of P.objects) IX.view.cutaway.tag(g, R.level);
      return P;
    });
    populate();
    drawOutlines();
    report();
  }
  /* ---------- the life layer: a nav over every room, a few walkers per planned building */
  function populate() {
    if (figures) { scene.remove(figures); figures = null; }
    nav = IX.life.nav({ rooms: rooms, plans: plans, stairs: stairs });
    walkers = makeWalkers(nav);
    figures = IX.view.figures(walkers);
    figures.visible = S.walkers;
    scene.add(figures);
  }
  function makeWalkers(nv) {
    let out = [];
    buildings.forEach(function (B, bi) {
      const ws = IX.life.populate(nv, { rooms: B.rooms.map(function (R) { return R.id; }), count: B.levels.length > 1 ? 5 : 3,
        seed: 11 + bi * 7 + seed, t0: bi * 3, spacing: 7, dwell: 30, period: 120 });
      ws.forEach(function (W) { W.id = B.id + '.' + W.id; });
      out = out.concat(ws);
    });
    return out;
  }
  const levelOfRoom = {};
  rooms.forEach(function (R) { levelOfRoom[R.id] = R.level || 0; });
  function figureShows(p) { return p.room == null || IX.view.cutaway.shows(levelOfRoom[p.room]); }
  function drawOutlines() {
    for (const o of outlines) { scene.remove(o); IX.view.cutaway.untag(o); }
    outlines = [];
    if (!S.outline && !S.grid) return;
    rooms.forEach(function (R, i) {
      const o = IX.view.outline(R, plans[i], { grid: S.grid, paths: S.grid });
      scene.add(o); outlines.push(o);
      if (R.level) IX.view.cutaway.tag(o, R.level);
    });
  }

  /* ---------- light budget: a fixed pool of point lights, moved to the rooms nearest the camera.
     The count never changes, so three.js never recompiles a material for it. */
  const pool = [];
  if (!KEEP_LIGHTS) for (let i = 0; i < LIGHT_POOL; i++) { const l = new THREE.PointLight(0xffc488, 0, 9, 2); l.name = 'interiors-pool-' + i; scene.add(l); pool.push(l); }
  let poolFrame = 0;
  function assignLights() {
    if (!pool.length) return;
    const tx = ctl.target.x, tz = ctl.target.z, cand = [];
    rooms.forEach(function (R, i) {
      if (!IX.view.cutaway.shows(R.level)) return;
      const d = Math.hypot(R.centroid[0] - tx, R.centroid[1] - tz);
      cand.push({ i: i, d: d });
    });
    cand.sort(function (a, b) { return a.d - b.d || a.i - b.i; });
    pool.forEach(function (l, k) {
      const c = cand[k];
      if (!c || c.d > 40) { l.intensity = 0; return; }
      const R = rooms[c.i], P = plans[c.i], n = P && P.lights ? P.lights.length : 0;
      const b = R.bbox, span = Math.max(b[2] - b[0], b[3] - b[1]);
      l.position.set(R.centroid[0], R.y + R.h * 0.8, R.centroid[1]);
      l.distance = span * 1.4 + 2; l.intensity = 0.55 + 0.25 * Math.min(2, n);
      l.userData.room = R.id;
    });
  }
  function pointLights() { let n = 0; scene.traverse(function (o) { if (o.isPointLight && o.visible !== false) n++; }); return n; }

  /* ---------- labels (the catalog sheet's ground labels) */
  function labelTex(text, sub, dark) {
    const c = document.createElement('canvas');
    c.width = 640; c.height = sub ? 120 : 76;
    const g = c.getContext('2d');
    g.fillStyle = dark ? 'rgba(30,26,18,0.94)' : 'rgba(58,52,40,0.88)';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = dark ? '#e0c98a' : '#f5efdd';
    g.textAlign = 'center';
    let fs = 42;
    g.font = (dark ? 'bold ' : '') + fs + 'px Georgia, serif';
    while (g.measureText(text).width > 610 && fs > 14) { fs -= 2; g.font = (dark ? 'bold ' : '') + fs + 'px Georgia, serif'; }
    g.fillText(text, 320, 52);
    if (sub) {
      let s2 = 26; g.font = s2 + 'px Georgia, serif';
      while (g.measureText(sub).width > 620 && s2 > 12) { s2 -= 1; g.font = s2 + 'px Georgia, serif'; }
      g.globalAlpha = 0.75; g.fillText(sub, 320, 98);
    }
    return new THREE.CanvasTexture(c);
  }
  const labels = [];
  function label(text, sub, x, z, w, dark) {
    const tex = labelTex(text, sub, dark), aspect = tex.image.height / tex.image.width;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * aspect), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); m.userData.label = true;
    scene.add(m); labels.push(m); return m;
  }
  function roomLabels() {
    for (const m of labels) { scene.remove(m); m.material.map.dispose(); }
    labels.length = 0;
    rooms.forEach(function (R, i) {
      if (buildingOf[R.id]) return;
      const P = plans[i], rp = P.report, b = R.bbox;
      const bits = [P.placements.length + ' pieces', R.area.toFixed(1) + ' m²'];
      if (rp.fallbacks.length) bits.push(rp.fallbacks.length + ' fallback');
      const miss = rp.missing.filter(function (m) { return m.reason; });
      if (miss.length) bits.push('missing: ' + miss.map(function (m) { return m.need; }).join(', '));
      label(R.kind + ' · ' + R.culture, bits.join(' · '), (b[0] + b[2]) / 2, b[3] + 1.5, 7.5, false);
    });
    ROWS.forEach(function (row, ri) { label(row[0], row[1].length + ' rooms', -11, -ri * DZ, 7, true); });
    label('buildings', 'planned: rooms, doors, stairs', -11, BZ, 7, true);
    buildings.forEach(function (B) {
      const bb = G.bbox(B.outer), n = B.rooms.reduce(function (a, R) { return a + plans[rooms.indexOf(R)].placements.length; }, 0);
      label(B.label + ' · ' + B.culture, B.levels.length + ' storey(s) · ' + B.rooms.length + ' rooms · ' + n + ' pieces · roof ' + B.roof.kind,
        (bb[0] + bb[2]) / 2, bb[3] + 1.8, 8.5, false);
    });
  }

  /* ---------- the standard Krator sky, mid-morning (vendored 81-sky.js) */
  if (window.KratorSky) {
    KratorSky.attach(scene, 4200);
    KratorSky.update(camera.position, 10.5, 200, 1.6);
    scene.fog.color.copy(KratorSky.lighting().fog);
  }
  let simT = 0, frozen = null, lastNow = null;
  (window._frameHooks = window._frameHooks || []).push(function (now) {
    if (window.KratorSky) KratorSky.update(camera.position, 10.5, 200, 1.6);
    if (lastNow != null && frozen == null) simT += Math.min(0.1, (now - lastNow) / 1000);
    lastNow = now;
    IX.view.cutaway.update(camera);
    if (figures && S.walkers) figures.userData.update(frozen != null ? frozen : simT, figureShows);
    if ((poolFrame++ % 15) === 0) assignLights();
  });

  /* ---------- toolbar */
  const $ = function (id) { return document.getElementById(id); };
  const rs = $('roomSel');
  rooms.forEach(function (R, i) { const o = document.createElement('option'); o.value = String(i); o.textContent = R.kind + ' · ' + R.culture + '  (' + R.id + ')'; rs.appendChild(o); });
  let current = -1;
  function gotoRoom(i) {
    const R = rooms[i]; if (!R) return;
    current = i;
    if (ctl.walk) window._setWalk(false);
    setLevel(buildingOf[R.id] ? R.level : null);
    const b = R.bbox, span = Math.max(b[2] - b[0], b[3] - b[1]);
    ctl.target.set((b[0] + b[2]) / 2, R.y + 0.6, (b[1] + b[3]) / 2);
    ctl.dist = Math.max(9, span * 1.45 + R.h); ctl.az = 0.35; ctl.el = 0.82;
    updateCamera();
    rs.value = String(i);
    report();
  }
  function gotoBuilding(i, level) {
    const B = buildings[i]; if (!B) return;
    current = -1;
    if (ctl.walk) window._setWalk(false);
    setLevel(level);
    const b = G.bbox(B.outer), span = Math.max(b[2] - b[0], b[3] - b[1]);
    const lv = B.levels[Math.min(level == null ? 0 : level, B.levels.length - 1)];
    ctl.target.set((b[0] + b[2]) / 2, lv.y + 0.6, (b[1] + b[3]) / 2);
    ctl.dist = Math.max(10, span * 1.35 + 3); ctl.az = 0.4; ctl.el = 0.85;
    updateCamera(); assignLights(); rs.value = ''; report();
  }
  function overview() {
    current = -1;
    setLevel(null);
    ctl.target.set(24, 0, -24); ctl.dist = 72; ctl.az = 0.3; ctl.el = 1.05; updateCamera();
    rs.value = '';
    report();
  }
  rs.onchange = function () { if (rs.value === '') overview(); else gotoRoom(+rs.value); };
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function report() {
    const el = $('rep');
    const tot = plans.reduce(function (a, P) { return a + P.placements.length; }, 0);
    $('count').textContent = rooms.length + ' rooms · ' + tot + ' pieces · seed ' + seed;
    const nl = plans.reduce(function (a, P) { return a + (P.lights ? P.lights.length : 0); }, 0);
    const ms = plans.reduce(function (a, P) { return a + (P.stats ? P.stats.ms : 0); }, 0);
    $('count').textContent += ' · ' + walkers.length + ' walkers · ' + nl + ' lamp lights as data, ' + (KEEP_LIGHTS ? 'kept real' : pool.length + ' pooled') + ' · placed in ' + Math.round(ms) + ' ms';
    if (current < 0) { el.innerHTML = '<span class="n">Pick a room for its report. O outlines, G walk grid, C cut-away, L storey, V walkers, T tags, P polygon tool, F walk.</span>'; return; }
    const R = rooms[current], P = plans[current], rp = P.report, h = [];
    h.push('<b>' + esc(R.id) + '</b> ' + R.kind + ' · ' + R.culture + ' · wealth ' + R.wealth + ' · ' + R.area.toFixed(1) + ' m² · ' + R.doors.length + ' door(s)' +
      (buildingOf[R.id] ? ' · storey ' + R.level + ' of ' + buildingOf[R.id].id : '') + (R.fixtures.length ? ' · ' + R.fixtures.map(function (f) { return f.kind; }).join(', ') : '') +
      ' · ' + (P.lights || []).length + ' light(s) · ' + (P.stats ? P.stats.ms + ' ms, ' + P.stats.runs + ' run(s)' : ''));
    h.push(rp.required.map(function (q) { return '<span class="' + (q.placed >= q.n ? 'ok' : 'miss') + '">' + q.need + ' ' + q.placed + '/' + q.n + '</span>'; }).join(' · ') +
      ' · optional ' + rp.optional + (rp.thin ? ' · <span class="fb">thin culture: ' + rp.own + ' own pieces</span>' : ''));
    rp.fallbacks.forEach(function (f) { h.push('<span class="fb">fallback: ' + f.need + ' from ' + f.used + ' (' + f.key + ')</span>'); });
    rp.missing.forEach(function (m) { h.push('<span class="miss">missing: ' + m.need + ' — ' + m.reason + '</span>'); });
    h.push('<span class="n">' + P.placements.map(function (p) { return p.key + (p.variant ? '#' + (p.variant + 1) : ''); }).join(', ') + '</span>');
    el.innerHTML = h.join('<br>');
  }
  function toggle(btn, k) { S[k] = !S[k]; $(btn).classList.toggle('on', S[k]); drawOutlines(); }
  $('olBtn').onclick = function () { toggle('olBtn', 'outline'); };
  $('gridBtn').onclick = function () { toggle('gridBtn', 'grid'); };
  function cutLabel() { $('cutBtn').textContent = 'Cut-away: ' + IX.view.cutaway.mode + ' (C)'; }
  function setLevel(k) {
    const v = IX.view.cutaway.setLevel(k == null ? Infinity : k);
    $('levelBtn').textContent = 'Storey: ' + (v === Infinity ? 'all' : v) + ' (L)';
    $('levelBtn').classList.toggle('on', v !== Infinity);
    return v;
  }
  function nextLevel() {
    const m = IX.view.cutaway.maxLevel(), v = IX.view.cutaway.level;
    setLevel(v === Infinity ? 0 : v >= m ? null : v + 1);
  }
  $('levelBtn').onclick = nextLevel;
  function toggleWalkers() { S.walkers = !S.walkers; $('walkBtn').classList.toggle('on', S.walkers); if (figures) figures.visible = S.walkers; }
  $('walkBtn').onclick = toggleWalkers;
  $('cutBtn').onclick = function () { IX.view.cutaway.next(); cutLabel(); };
  function reseed(s) { seed = s == null ? seed + 1 : s; $('seedBtn').textContent = 'Seed ' + seed + ' (R)'; furnishAll(); roomLabels(); }
  $('seedBtn').onclick = function () { reseed(); };
  window.addEventListener('keydown', function (e) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const k = e.key.toLowerCase();
    if (k === 'o') toggle('olBtn', 'outline');
    else if (k === 'g') toggle('gridBtn', 'grid');
    else if (k === 'c') { IX.view.cutaway.next(); cutLabel(); }
    else if (k === 'r') reseed();
    else if (k === 'l') nextLevel();
    else if (k === 'v') toggleWalkers();
  });

  furnishAll();
  roomLabels();
  overview();
  window._interiors = {
    rooms: rooms, get plans() { return plans; }, catalog: catalog, shells: shells, gotoRoom: gotoRoom, overview: overview,
    buildings: buildings, buildingSpecs: BUILDINGS, makeWalkers: makeWalkers, stairs: stairs, gotoBuilding: gotoBuilding, setLevel: setLevel,
    get nav() { return nav; }, get walkers() { return walkers; }, get pickables() { return figures ? [figures] : []; },
    setTime: function (t) { frozen = t; if (figures) figures.userData.update(t, figureShows); return t; }, time: function () { return frozen != null ? frozen : simT; },
    lightBudget: KEEP_LIGHTS ? null : LIGHT_POOL, keepLights: KEEP_LIGHTS, pointLights: pointLights, assignLights: assignLights,
    reseed: reseed, setOutline: function (on, grid) { S.outline = !!on; S.grid = !!grid; $('olBtn').classList.toggle('on', S.outline); $('gridBtn').classList.toggle('on', S.grid); drawOutlines(); },
    cutaway: function (m) { const r = IX.view.cutaway.setMode(m); cutLabel(); return r; }
  };
  window._ready = true;
})();
