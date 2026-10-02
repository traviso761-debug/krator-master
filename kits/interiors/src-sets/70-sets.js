/* ======================== Sets sheet: every building set's interiors ========================
   The page behind dist/interiors-sets.html: every interior set registered by sets/<set>.js
   (IX.sets, 48b-sets.js) laid out in rows on a sheet, one band per set, each building placed in
   its own frame at a lot of the set's declared size, PLANNED (planBuilding: partitions, doors,
   stairs, windows, a roof drawn by 51-building.js) or REGISTERED (explicit rooms in a shell,
   50-shell.js), then FURNISHED from the master catalog through adapters/catalog-adapter.js, with
   the demo's light pool, cut-away, storey selector, outline view, hover inspector and polygon tool.
   Every residence is checked for a bed, a food container and an item container per unit
   (IX.sets.auditResidence); 75-sets-audit.js is what verify.py --sets runs.
   Query: ?set=highlands,post-apoc  only those sets   ?only=key,key  only those buildings
          ?lights=keep  the catalog's real lights instead of the pool
   Exposes window._interiors (sets, items, rooms, plans, buildings, gotoItem, gotoRoom, overview,
   reseed, setLevel, ...) and sets window._ready.
   ====================================================================== */
(function () {
  'use strict';
  const IX = KratorInteriors, G = IX.geom;
  const Q = {};
  location.search.replace(/^\?/, '').split('&').forEach(function (kv) { if (!kv) return; const p = kv.split('='); Q[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); });
  const KEEP_LIGHTS = Q.lights === 'keep';
  const catalog = IX.catalogAdapter({ lights: KEEP_LIGHTS ? 'keep' : 'strip' });
  const BASE_Y = 0.15, LIGHT_POOL = 6, ROW_W = 150, GAP = 7;
  const SETS = IX.sets.list.filter(function (S) { return !Q.set || Q.set.split(',').indexOf(S.set) >= 0; });
  const ONLY = Q.only ? Q.only.split(',') : null;

  /* ---------- layout: a band per set, rows of lots */
  const items = [];      /* instantiated items in sheet order: { inst, set, item, ox, oz, lot } */
  const bands = [];      /* { set, z0, z1, x1 } */
  let z = 0;
  SETS.forEach(function (S) {
    const list = S.items.filter(function (it) { return !ONLY || ONLY.indexOf(it.key) >= 0; });
    const z0 = z;
    let x = 0, rowD = 0, x1 = 0;
    list.forEach(function (it) {
      const lot = it.lot || lotOf(it);
      const w = Math.max(8, lot[0]), d = Math.max(8, lot[1]);
      if (x > 0 && x + w > ROW_W) { x = 0; z -= rowD + GAP; rowD = 0; }
      const ox = x + w / 2, oz = z - d / 2;
      const inst = IX.sets.instantiate(it, ox, oz, 0, { baseY: BASE_Y, register: true });
      items.push({ inst: inst, set: S, item: it, ox: ox, oz: oz, lot: [w, d] });
      x += w + GAP; x1 = Math.max(x1, x); rowD = Math.max(rowD, d);
    });
    z -= rowD + GAP;
    bands.push({ set: S, z0: z0, z1: z, x1: x1 });
    z -= 14;
  });
  function lotOf(it) {
    let b = null;
    it.bodies.concat(it.rooms).forEach(function (q) { const bb = G.bbox(q.poly); b = b ? [Math.min(b[0], bb[0]), Math.min(b[1], bb[1]), Math.max(b[2], bb[2]), Math.max(b[3], bb[3])] : bb; });
    return b ? [Math.ceil(b[2] - b[0]) + 4, Math.ceil(b[3] - b[1]) + 4] : [10, 10];
  }

  /* ---------- shells: planned buildings and explicit rooms */
  const shells = [], buildings = [], buildingSpecs = [], rooms = [], roomItem = {};
  items.forEach(function (E) {
    E.inst.buildings.forEach(function (B, i) {
      const s = IX.view.building(B); scene.add(s); IX.view.cutaway.add(s); shells.push(s);
      buildings.push(B); buildingSpecs.push(E.inst.specs[i]);
    });
    E.inst.rooms.forEach(function (R) {
      if (R.explicit) { const s = IX.view.shell(R); scene.add(s); IX.view.cutaway.add(s); shells.push(s); }
      rooms.push(R); roomItem[R.id] = E;
    });
  });
  const stairs = [].concat.apply([], buildings.map(function (B) { return B.stairs; }));
  let seed = 0, plans = [], plansById = {}, outlines = [], residences = [];
  const S = { outline: false, grid: false };
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
    plansById = {};
    plans = rooms.map(function (R) {
      const P = furnishRoom(R, catalog, { seed: seed });
      IX.buildRoom(P, catalog, R);
      if (R.level) for (const g of P.objects) IX.view.cutaway.tag(g, R.level);
      plansById[R.id] = P;
      return P;
    });
    residences = items.map(function (E) { const a = IX.sets.auditResidence(E.inst, plansById); a.key = E.item.key; a.set = E.set.set; return a; });
    drawOutlines();
    report();
  }
  const levelOfRoom = {};
  rooms.forEach(function (R) { levelOfRoom[R.id] = R.level || 0; });
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

  /* ---------- light budget (the demo's pool) */
  const pool = [];
  if (!KEEP_LIGHTS) for (let i = 0; i < LIGHT_POOL; i++) { const l = new THREE.PointLight(0xffc488, 0, 9, 2); l.name = 'interiors-pool-' + i; scene.add(l); pool.push(l); }
  let poolFrame = 0;
  function assignLights() {
    if (!pool.length) return;
    const tx = ctl.target.x, tz = ctl.target.z, cand = [];
    rooms.forEach(function (R, i) {
      if (!IX.view.cutaway.shows(R.level)) return;
      cand.push({ i: i, d: Math.hypot(R.centroid[0] - tx, R.centroid[1] - tz) });
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

  /* ---------- labels */
  function labelTex(text, sub, dark, red) {
    const c = document.createElement('canvas');
    c.width = 640; c.height = sub ? 120 : 76;
    const g = c.getContext('2d');
    g.fillStyle = red ? 'rgba(110,30,20,0.9)' : dark ? 'rgba(30,26,18,0.94)' : 'rgba(58,52,40,0.88)';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = dark ? '#e0c98a' : '#f5efdd';
    g.textAlign = 'center';
    let fs = 40;
    g.font = (dark ? 'bold ' : '') + fs + 'px Georgia, serif';
    while (g.measureText(text).width > 610 && fs > 14) { fs -= 2; g.font = (dark ? 'bold ' : '') + fs + 'px Georgia, serif'; }
    g.fillText(text, 320, 50);
    if (sub) {
      let s2 = 26; g.font = s2 + 'px Georgia, serif';
      while (g.measureText(sub).width > 620 && s2 > 12) { s2 -= 1; g.font = s2 + 'px Georgia, serif'; }
      g.globalAlpha = 0.78; g.fillText(sub, 320, 97);
    }
    return new THREE.CanvasTexture(c);
  }
  const labels = [];
  function label(text, sub, x, z, w, dark, red) {
    const tex = labelTex(text, sub, dark, red), aspect = tex.image.height / tex.image.width;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * aspect), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); m.userData.label = true;
    scene.add(m); labels.push(m); return m;
  }
  function itemSummary(E) {
    const inst = E.inst, it = E.item;
    if (it.skip) return 'no interior: ' + it.skip;
    const n = inst.rooms.reduce(function (a, R) { return a + (plansById[R.id] ? plansById[R.id].placements.length : 0); }, 0);
    const bits = [inst.rooms.length + ' room(s)', n + ' pieces'];
    if (inst.buildings.length) bits.push(inst.buildings.reduce(function (a, B) { return Math.max(a, B.levels.length); }, 0) + ' storey(s)');
    const ra = residences.filter(function (r) { return r.key === it.key; })[0];
    if (ra && ra.residence) bits.push(ra.fails.length ? 'RESIDENCE FAILS' : 'residence ok (' + ra.beds + ' bed, ' + ra.food + ' food, ' + ra.items + ' chest)');
    return bits.join(' · ');
  }
  function sheetLabels() {
    for (const m of labels) { scene.remove(m); m.material.map.dispose(); }
    labels.length = 0;
    items.forEach(function (E) {
      const ra = residences.filter(function (r) { return r.key === E.item.key; })[0];
      const bad = !!(ra && ra.fails.length);
      label(E.item.name + ' · ' + E.item.key, itemSummary(E), E.ox, E.oz + E.lot[1] / 2 + 1.6, Math.min(E.lot[0] + 2, 14), !!E.item.skip, bad);
    });
    bands.forEach(function (b) { label(b.set.title, b.set.items.length + ' buildings', -12, (b.z0 + b.z1) / 2, 9, true); });
  }

  /* ---------- sky and the frame hook */
  if (window.KratorSky) {
    KratorSky.attach(scene, 4200);
    KratorSky.update(camera.position, 10.5, 200, 1.6);
    scene.fog.color.copy(KratorSky.lighting().fog);
  }
  (window._frameHooks = window._frameHooks || []).push(function () {
    if (window.KratorSky) KratorSky.update(camera.position, 10.5, 200, 1.6);
    IX.view.cutaway.update(camera);
    if ((poolFrame++ % 15) === 0) assignLights();
  });

  /* ---------- toolbar */
  const $ = function (id) { return document.getElementById(id); };
  const rs = $('roomSel'), ss = $('setSel');
  items.forEach(function (E, i) { const o = document.createElement('option'); o.value = String(i); o.textContent = E.set.set + ' · ' + E.item.name + ' (' + E.item.key + ')'; rs.appendChild(o); });
  bands.forEach(function (b, i) { const o = document.createElement('option'); o.value = String(i); o.textContent = b.set.title; ss.appendChild(o); });
  let current = -1;
  function gotoItem(i, level) {
    const E = items[i]; if (!E) return;
    current = i;
    if (ctl.walk) window._setWalk(false);
    setLevel(level == null ? null : level);
    const span = Math.max(E.lot[0], E.lot[1]);
    ctl.target.set(E.ox, BASE_Y + 1, E.oz);
    ctl.dist = Math.max(10, span * 1.3 + 4); ctl.az = 0.35; ctl.el = 0.85;
    updateCamera(); assignLights();
    rs.value = String(i);
    report();
  }
  function gotoRoom(R) {
    const E = roomItem[R.id]; if (!E) return;
    current = items.indexOf(E);
    if (ctl.walk) window._setWalk(false);
    setLevel(R.level || 0);
    const b = R.bbox, span = Math.max(b[2] - b[0], b[3] - b[1]);
    ctl.target.set((b[0] + b[2]) / 2, R.y + 0.6, (b[1] + b[3]) / 2);
    ctl.dist = Math.max(9, span * 1.45 + R.h); ctl.az = 0.35; ctl.el = 0.82;
    updateCamera(); assignLights(); report();
  }
  function gotoSet(i) {
    const b = bands[i]; if (!b) return;
    current = -1; setLevel(null);
    ctl.target.set(b.x1 / 2, 0, (b.z0 + b.z1) / 2); ctl.dist = Math.max(60, (b.z0 - b.z1) * 1.3, b.x1 * 0.9); ctl.az = 0.3; ctl.el = 1.0; updateCamera();
    rs.value = ''; ss.value = String(i); report();
  }
  function overview() {
    current = -1; setLevel(null);
    ctl.target.set(ROW_W / 2, 0, z / 2); ctl.dist = Math.max(80, -z * 1.1); ctl.az = 0.3; ctl.el = 1.1; updateCamera();
    rs.value = ''; ss.value = ''; report();
  }
  rs.onchange = function () { if (rs.value === '') overview(); else gotoItem(+rs.value); };
  ss.onchange = function () { if (ss.value === '') overview(); else gotoSet(+ss.value); };
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function report() {
    const el = $('rep');
    const tot = plans.reduce(function (a, P) { return a + P.placements.length; }, 0);
    const nRes = residences.filter(function (r) { return r.residence; }).length, bad = residences.filter(function (r) { return r.fails.length; }).length;
    const skipped = items.filter(function (E) { return E.item.skip; }).length;
    const ms = plans.reduce(function (a, P) { return a + (P.stats ? P.stats.ms : 0); }, 0);
    $('count').textContent = SETS.length + ' sets · ' + items.length + ' buildings (' + skipped + ' without interior) · ' + rooms.length + ' rooms · ' + tot + ' pieces · ' +
      nRes + ' residences' + (bad ? ', ' + bad + ' FAIL' : ' ok') + ' · seed ' + seed + ' · ' + Math.round(ms) + ' ms';
    if (current < 0) { el.innerHTML = '<span class="n">Pick a building for its report. O outlines, G walk grid, C cut-away, L storey, T tags, P polygon tool, F walk.</span>'; return; }
    const E = items[current], it = E.item, h = [];
    h.push('<b>' + esc(it.name) + '</b> ' + esc(it.key) + ' · ' + E.set.set + ' · ' + it.culture + ' · wealth ' + it.wealth + ' · ' + (it.types || []).join(', ') +
      (it.residence ? ' · residence x' + it.units : ''));
    if (it.skip) h.push('<span class="miss">no interior: ' + esc(it.skip) + '</span>');
    if (it.note) h.push('<span class="n">' + esc(it.note) + '</span>');
    const ra = residences[current];
    if (ra && ra.residence) h.push(ra.fails.length ? '<span class="miss">' + ra.fails.map(esc).join('<br>') + '</span>' : '<span class="ok">residence: ' + ra.beds + ' bed(s), ' + ra.food + ' food container(s), ' + ra.items + ' item container(s)</span>');
    E.inst.buildings.forEach(function (B) {
      h.push('<span class="n">' + esc(B.id) + ': ' + B.levels.length + ' storey(s), ' + B.rooms.length + ' rooms, ' + B.stairs.length + ' stair(s), roof ' + B.roof.kind +
        (B.report.dropped.length ? ', dropped ' + B.report.dropped.map(function (d) { return d.kind || d; }).join('/') : '') +
        (B.report.warnings.length ? ' · <span class="fb">' + B.report.warnings.map(esc).join('; ') + '</span>' : '') + '</span>');
    });
    E.inst.rooms.forEach(function (R) {
      const P = plansById[R.id]; if (!P) return;
      const rp = P.report;
      h.push('<b>' + esc(R.id.replace(E.inst.id + '.', '')) + '</b> ' + R.kind + ' · storey ' + (R.level || 0) + ' · ' + R.area.toFixed(1) + ' m² · ' +
        rp.required.map(function (q) { return '<span class="' + (q.placed >= q.n ? 'ok' : 'miss') + '">' + q.need + ' ' + q.placed + '/' + q.n + '</span>'; }).join(' · ') +
        ' · optional ' + rp.optional + (rp.thin ? ' · <span class="fb">thin: ' + rp.own + ' own</span>' : '') +
        rp.fallbacks.map(function (f) { return ' <span class="fb">' + f.need + '&lt;' + f.used + '</span>'; }).join('') +
        rp.missing.map(function (m) { return ' <span class="miss">missing ' + m.need + ' (' + m.reason + ')</span>'; }).join('') +
        '<br><span class="n">' + P.placements.map(function (p) { return p.key + (p.variant ? '#' + (p.variant + 1) : ''); }).join(', ') + '</span>');
    });
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
  $('cutBtn').onclick = function () { IX.view.cutaway.next(); cutLabel(); };
  function reseed(s) { seed = s == null ? seed + 1 : s; $('seedBtn').textContent = 'Seed ' + seed + ' (R)'; furnishAll(); sheetLabels(); }
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
  });

  furnishAll();
  sheetLabels();
  overview();
  window._interiors = {
    sets: SETS, bands: bands, items: items, rooms: rooms, get plans() { return plans; }, get plansById() { return plansById; }, get residences() { return residences; },
    catalog: catalog, shells: shells, buildings: buildings, buildingSpecs: buildingSpecs, stairs: stairs,
    gotoItem: gotoItem, gotoRoom: gotoRoom, gotoSet: gotoSet, overview: overview, setLevel: setLevel,
    lightBudget: KEEP_LIGHTS ? null : LIGHT_POOL, keepLights: KEEP_LIGHTS, pointLights: pointLights, assignLights: assignLights,
    reseed: reseed, setOutline: function (on, grid) { S.outline = !!on; S.grid = !!grid; $('olBtn').classList.toggle('on', S.outline); $('gridBtn').classList.toggle('on', S.grid); drawOutlines(); },
    cutaway: function (m) { const r = IX.view.cutaway.setMode(m); cutLabel(); return r; },
    skipped: function () { return items.filter(function (E) { return E.item.skip; }).map(function (E) { return { set: E.set.set, key: E.item.key, name: E.item.name, skip: E.item.skip }; }); }
  };
  window._ready = true;
})();
