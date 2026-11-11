/* ======================== Motor vehicles kit sheet ========================
   Lays out every registered vehicle, every variant, in labelled rows on the catalog
   engine's scene (kits/catalog/krator-asset-engine.js), built ONLY through the bundle's
   public API (KratorVehicles.build), exactly as a host world builds them. Each row is
   one vehicle; each variant stands at ry = 0 (+z forward), wheels on y = 0, with a
   1.75 m figure beside the row for scale.
   Toolbar: Drive (R) rolls every wheel and swings the front pair; Lights (L) switches
   the lamps; Night (N) darkens the sky to judge them; the State select (S cycles it) rebuilds
   every vehicle in one of the kit's ruin states (intact, weathered, burnt, wreck: KV.build's
   `state`); ?state=burnt opens the sheet in one.
   Exposes window._sheet (rows, instances, view(i, kind), setDrive, setLights, setNight, setState, state)
   and sets window._ready.
   ====================================================================== */
const INSTANCES = [];
(function () {
  'use strict';
  const KV = KratorVehicles;
  const GAP = 2.2;
  /* the catalog page engine's ground colour is sRGB under an sRGB output (pale, as on the catalog sheet); the
     vehicles' colours are linear, so the ground is converted here, on this page only */
  if (typeof ground !== 'undefined' && ground.material && ground.material.color) ground.material.color.convertSRGBToLinear();
  /* ?mat=proc: the vehicles without the library detail maps (vertex colours only), to compare */
  if (/[?&]mat=proc\b/.test(location.search)) KV.setTextures(false);
  /* ?state=<name>: the ruin state every vehicle is first built in */
  const qs = /[?&]state=([a-z]+)/.exec(location.search);
  let state = qs && KV.STATES.indexOf(qs[1]) >= 0 ? qs[1] : 'intact';

  /* --- labels on the ground */
  function label(text, sub, x, z, w, dark) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = sub ? 112 : 72;
    const g = c.getContext('2d');
    g.fillStyle = dark ? 'rgba(30,26,18,0.94)' : 'rgba(58,52,40,0.86)';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = dark ? '#e0c98a' : '#f5efdd';
    g.textAlign = 'center';
    let fs = 40;
    g.font = (dark ? 'bold ' : '') + fs + 'px Georgia, serif';
    while (g.measureText(text).width > 490 && fs > 14) { fs -= 2; g.font = (dark ? 'bold ' : '') + fs + 'px Georgia, serif'; }
    g.fillText(text, 256, 50);
    if (sub) { g.font = '26px Georgia, serif'; g.globalAlpha = 0.7; g.fillText(sub, 256, 92); }
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * c.height / c.width), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.03, z);
    scene.add(m);
    return m;
  }
  /* a 1.75 m figure for scale (plain THREE: the page has no catalog core of its own) */
  function figure(x, z) {
    const g = new THREE.Group(), cloth = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x6a4a2c).convertSRGBToLinear(), roughness: 0.9 });
    const skin = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xc89a74).convertSRGBToLinear(), roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 1.45, 10), cloth); body.position.y = 0.725; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), skin); head.position.y = 1.62; g.add(head);
    g.position.set(x, 0, z); g.name = 'scale-figure';
    scene.add(g);
    return g;
  }

  /* --- lay out: rows run along +x; vehicles stack toward -z */
  const rows = [];
  let z = 0, maxW = 0;
  for (const E of KV.list()) {
    let x = 0, depth = E.d;
    const placed = [];
    figure(-1.2, z);
    /* at least three slots a row (seeds 1, 2, 3; the variants cycle), so a ruin state shows three fates of one vehicle */
    const slots = Math.max(E.variants, 3);
    for (let i = 0; i < slots; i++) {
      const v = i % E.variants, cx = x + E.w / 2;
      const g = KV.build(E.key, { variant: v, seed: 1 + i, state: state });
      g.position.set(cx, 0, z);
      g.userData.x = cx; g.userData.z = z; g.userData.ry = 0;
      scene.add(g); INSTANCES.push(g); placed.push(g);
      label(E.name + ' #' + (v + 1) + (E.variantNames[v] ? ' ' + E.variantNames[v] : '') + (i >= E.variants ? ' · seed ' + (1 + i) : ''),
        E.culture + ' · ' + KV.dataOf(E.key, v).seats + ' seats · ' + g.userData.tris + ' tris', cx, z + E.d / 2 + 0.7, Math.max(E.w * 1.4, 2.6), false);
      x += E.w + GAP;
    }
    label(E.name, E.culture + ' · ' + E.variants + ' variants', -5.5, z, 5, true);
    rows.push({ key: E.key, title: E.name, z: z, width: x, depth: depth, instances: placed });
    maxW = Math.max(maxW, x);
    z -= depth + 4;
  }

  /* --- the standard Krator sky (vendored 81-sky.js), fixed at mid-morning; Night drops it to 21:30 */
  let hour = 10.5;
  const hemi = scene.children.filter(function (o) { return o.isHemisphereLight; })[0];
  const base = { sun: sun.intensity, fill: fill.intensity, hemi: hemi ? hemi.intensity : 0, exp: renderer.toneMappingExposure };
  if (window.KratorSky) {
    KratorSky.attach(scene, 4200);
    KratorSky.update(camera.position, hour, 200, 1.6);
    scene.fog.color.copy(KratorSky.lighting().fog);
  }
  let night = false;
  function setNight(on) {
    night = !!on; hour = night ? 21.5 : 10.5;
    sun.intensity = night ? 0.03 : base.sun; fill.intensity = night ? 0.05 : base.fill;
    if (hemi) hemi.intensity = night ? 0.12 : base.hemi;
    scene.background = new THREE.Color(night ? 0x0c0f18 : 0xd8dccb);
    if (window.KratorSky) { KratorSky.update(camera.position, hour, 200, 1.6); scene.fog.color.copy(KratorSky.lighting().fog); }
    document.getElementById('nightBtn').classList.toggle('on', night);
  }

  /* --- the ruin state: every instance rebuilt in place (same key, variant, seed) */
  function setState(st) {
    if (KV.STATES.indexOf(st) < 0) return state;
    state = st;
    for (let i = 0; i < INSTANCES.length; i++) {
      const old = INSTANCES[i], u = old.userData;
      const g = KV.build(u.key, { variant: u.variant, seed: u.seed, state: state });
      g.position.copy(old.position); g.rotation.copy(old.rotation); g.visible = old.visible;
      g.userData.x = u.x; g.userData.z = u.z; g.userData.ry = u.ry;
      scene.remove(old); KV.dispose(old);
      scene.add(g); INSTANCES[i] = g;
      for (const r of rows) { const k = r.instances.indexOf(old); if (k >= 0) r.instances[k] = g; }
      KV.lights(g, lightsOn);
    }
    document.getElementById('stateSel').value = state;
    return state;
  }

  /* --- drive and lights */
  let drive = false, lightsOn = false, t0 = 0;
  function setDrive(on) { drive = !!on; document.getElementById('driveBtn').classList.toggle('on', drive); }
  function setLights(on) {
    lightsOn = !!on;
    for (const g of INSTANCES) KV.lights(g, lightsOn);
    document.getElementById('lightsBtn').classList.toggle('on', lightsOn);
  }
  (window._frameHooks = window._frameHooks || []).push(function (now) {
    if (window.KratorSky) KratorSky.update(camera.position, hour, 200, 1.6);
    if (!drive) { t0 = now; return; }
    const dt = Math.min((now - t0) / 1000, 0.1); t0 = now;
    for (const g of INSTANCES) { KV.roll(g, 4 * dt); KV.steer(g, 0.45 * Math.sin(now / 900)); }
  });

  /* --- toolbar */
  document.getElementById('count').textContent = KV.list().length + ' vehicles · ' + INSTANCES.length + ' instances · cultures: ' + KV.cultures().join(', ');
  const rs = document.getElementById('rowSel');
  rows.forEach(function (r, i) { const o = document.createElement('option'); o.value = String(i); o.textContent = r.title; rs.appendChild(o); });
  rs.onchange = function () { gotoRow(+rs.value); };
  document.getElementById('driveBtn').onclick = function () { setDrive(!drive); };
  document.getElementById('lightsBtn').onclick = function () { setLights(!lightsOn); };
  document.getElementById('nightBtn').onclick = function () { setNight(!night); };
  const ss = document.getElementById('stateSel');
  ss.value = state;
  ss.onchange = function () { setState(ss.value); };
  window.addEventListener('keydown', function (e) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || t.tagName === 'SELECT')) return;
    const k = e.key.toLowerCase();
    if (k === 'r') setDrive(!drive); else if (k === 'l') setLights(!lightsOn); else if (k === 'n') setNight(!night);
    else if (k === 's') setState(KV.STATES[(KV.STATES.indexOf(state) + 1) % KV.STATES.length]);
  });

  function showAll() { for (const g of INSTANCES) g.visible = true; }
  function gotoRow(i) {
    const r = rows[i];
    if (!r) return;
    showAll();
    if (ctl.walk) window._setWalk(false);
    ctl.target.set(r.width / 2 - GAP / 2, 0.9, r.z);
    ctl.dist = Math.max(8, r.width * 0.9);
    ctl.az = 0.5; ctl.el = 0.32;
    updateCamera();
  }
  /* one vehicle, close and alone (its neighbours hidden until the next gotoRow or showAll):
     kind = front34 | side | rear34 | front | top */
  const VIEWS = { front34: [0.75, 0.22, 6.4], side: [Math.PI / 2, 0.08, 6.8], rear34: [Math.PI - 0.75, 0.25, 6.4],
    front: [0, 0.12, 6.4], top: [0.3, 1.3, 7] };
  function view(i, kind) {
    const g = INSTANCES[i], V = VIEWS[kind] || VIEWS.front34;
    if (!g) return null;
    if (ctl.walk) window._setWalk(false);
    for (const o of INSTANCES) o.visible = o === g;
    /* the distances suit the 3.6 m buggy; a bigger vehicle pulls the camera back by its size */
    const k = Math.max(1, g.userData.d / 3.6, g.userData.h / 3.05);
    ctl.target.set(g.position.x, Math.max(1.0, g.userData.h * 0.3), g.position.z);
    ctl.az = V[0]; ctl.el = V[1]; ctl.dist = V[2] * k;
    updateCamera();
    return g.userData.key + ' #' + (g.userData.variant + 1);
  }
  if (rows.length) gotoRow(0);

  window._sheet = { rows: rows, instances: INSTANCES, width: maxW, gotoRow: gotoRow, view: view, showAll: showAll, views: Object.keys(VIEWS),
    setDrive: setDrive, setLights: setLights, setNight: setNight, setState: setState, state: function () { return state; } };
  /* ready once the detail maps have decoded into the atlas (verify.py and the screenshots wait on it) */
  /* the harness waits on !window._texPending (a count, as KMAT keeps it): a getter, so it reads the live count (a function is always
     truthy, and the wait never cleared: 2026-11-09, as fauna's) */
  Object.defineProperty(window, '_texPending', { configurable: true, get: function () { return KV.textures().pending; } });
  (function wait() { if (KV.textures().pending > 0) return setTimeout(wait, 50); window._ready = true; })();
})();
