/* ======================== Fauna kit sheet ========================
   Lays out every registered animal (every variant, and every breed where an animal has them) in labelled rows on the
   catalog engine's scene (kits/catalog/krator-asset-engine.js), built ONLY through the bundle's public API
   (KratorFauna.build), exactly as a host world builds them. Each stands at ry = 0 (+z its snout), on y = 0, with a
   1.75 m figure at the head of the row for scale.
   Toolbar: Idle (I), Graze (G), Walk (K), Fly (Y), Swim (U) set what every animal is doing (KratorFauna.animate); Night (N).
   Fly shows an animal's 'fly' pose build where it has one (wings folded into the perched shape cannot unfold by turning).
   ?mode=fly (or any mode) starts in that mode; ?only=key,key lays out just those animals (a species file's own check).
   Exposes window._sheet (rows, instances, view(i, kind), setMode, setNight) and sets window._ready.
   ====================================================================== */
const INSTANCES = [];
(function () {
  'use strict';
  const KF = KratorFauna;
  const GAP = 1.2;
  if (typeof ground !== 'undefined' && ground.material && ground.material.color) ground.material.color.convertSRGBToLinear();
  if (/[?&]mat=proc\b/.test(location.search)) KF.setTextures(false);
  KF.warm();

  function label(text, sub, x, z, w, dark) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = sub ? 112 : 72;
    const g = c.getContext('2d');
    g.fillStyle = dark ? 'rgba(30,26,18,0.94)' : 'rgba(58,52,40,0.86)'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = dark ? '#e0c98a' : '#f5efdd'; g.textAlign = 'center';
    let fs = 40; g.font = (dark ? 'bold ' : '') + fs + 'px Georgia, serif';
    while (g.measureText(text).width > 490 && fs > 14) { fs -= 2; g.font = (dark ? 'bold ' : '') + fs + 'px Georgia, serif'; }
    g.fillText(text, 256, 50);
    if (sub) { g.font = '24px Georgia, serif'; g.globalAlpha = 0.7; g.fillText(sub, 256, 92); }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * c.height / c.width), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); scene.add(m); return m;
  }
  function figure(x, z) {
    const g = new THREE.Group(), cloth = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x6a4a2c).convertSRGBToLinear(), roughness: 0.9 });
    const skin = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xc89a74).convertSRGBToLinear(), roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 1.45, 10), cloth); body.position.y = 0.725; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), skin); head.position.y = 1.62; g.add(head);
    g.position.set(x, 0, z); g.name = 'scale-figure'; scene.add(g); return g;
  }

  /* --- lay out: rows run along +x; animals stack toward -z */
  const rows = [];
  let z = 0, maxW = 0;
  const ONLY = (/[?&]only=([^&]+)/.exec(location.search) || [])[1];
  const ONLYSET = ONLY ? new Set(decodeURIComponent(ONLY).split(',')) : null;
  for (const E of KF.list()) {
    if (ONLYSET && !ONLYSET.has(E.key)) continue;
    const kinds = [];
    for (const b of (E.breeds || [null])) for (let v = 0; v < E.variants; v++) kinds.push({ v: v, breed: b });
    let x = 0, depth = 0;
    const placed = [];
    figure(-1.0, z);
    for (const k of kinds) {
      const g = KF.build(E.key, { variant: k.v, breed: k.breed, seed: 7 + k.v });
      const u = g.userData, cx = x + u.w / 2;
      g.position.set(cx, 0, z);
      u.x = cx; u.z = z; u.phase = INSTANCES.length * 1.37;
      scene.add(g); INSTANCES.push(g); placed.push(g);
      /* an animal whose wings fold into its perched shape has a 'fly' pose: Fly shows that build in its place */
      if (E.poses && E.poses.indexOf('fly') >= 0) { const f = KF.build(E.key, { variant: k.v, breed: k.breed, seed: 7 + k.v, pose: 'fly' });
        f.position.copy(g.position); f.userData.phase = u.phase; f.visible = false; scene.add(f); u.alt = f; }
      label(E.name + (k.breed ? ' · ' + k.breed : '') + ' #' + (k.v + 1), (E.variantNames[k.v] || '') + ' · ' + u.tris + ' tris', cx, z + u.d / 2 + 0.5, Math.max(u.w * 1.3, 1.8), false);
      x += u.w + GAP; depth = Math.max(depth, u.d);
    }
    label(E.name, E.group + ' · ' + E.variants + ' variants' + (E.breeds ? ' · ' + E.breeds.length + ' breeds' : ''), -3.6, z, 4, true);
    rows.push({ key: E.key, title: E.name, z: z, width: x, depth: depth, instances: placed });
    maxW = Math.max(maxW, x);
    z -= depth + 3.5;
  }

  /* --- what they are doing, and the standard Krator sky (vendored 81-sky.js) */
  let mode = 'idle', hour = 10.5, night = false, t0 = performance.now();
  function show(g, on) { const alt = g.userData.alt, fly = mode === 'fly' && !!alt; g.visible = on && !fly; if (alt) alt.visible = on && fly; }
  const hemi = scene.children.filter(function (o) { return o.isHemisphereLight; })[0];
  const base = { sun: sun.intensity, fill: fill.intensity, hemi: hemi ? hemi.intensity : 0 };
  if (window.KratorSky) { KratorSky.attach(scene, 4200); KratorSky.update(camera.position, hour, 200, 1.6); scene.fog.color.copy(KratorSky.lighting().fog); }
  function setMode(m) {
    mode = m;
    for (const g of INSTANCES) if (g.userData.alt) show(g, g.visible || g.userData.alt.visible);
    for (const [id, mm] of [['idleBtn', 'idle'], ['grazeBtn', 'graze'], ['walkBtn', 'walk'], ['flyBtn', 'fly'], ['swimBtn', 'swim']]) document.getElementById(id).classList.toggle('on', mm === m);
  }
  function setNight(on) {
    night = !!on; hour = night ? 21.5 : 10.5;
    sun.intensity = night ? 0.03 : base.sun; fill.intensity = night ? 0.05 : base.fill; if (hemi) hemi.intensity = night ? 0.12 : base.hemi;
    if (window.KratorSky) { KratorSky.update(camera.position, hour, 200, 1.6); scene.fog.color.copy(KratorSky.lighting().fog); }
    document.getElementById('nightBtn').classList.toggle('on', night);
  }
  const pin = /[?&]t=([\d.]+)/.exec(location.search);
  (window._frameHooks = window._frameHooks || []).push(function (now) {
    if (window.KratorSky) KratorSky.update(camera.position, hour, 200, 1.6);
    const t = pin ? +pin[1] : (now - t0) / 1000;
    for (const g of INSTANCES) { KF.animate(g, t, mode, { phase: g.userData.phase }); if (g.userData.alt) KF.animate(g.userData.alt, t, mode, { phase: g.userData.phase }); }
  });

  /* --- toolbar */
  document.getElementById('count').textContent = KF.list().length + ' animals · ' + INSTANCES.length + ' on the sheet';
  const rs = document.getElementById('rowSel');
  rows.forEach(function (r, i) { const o = document.createElement('option'); o.value = String(i); o.textContent = r.title; rs.appendChild(o); });
  rs.onchange = function () { gotoRow(+rs.value); };
  document.getElementById('idleBtn').onclick = function () { setMode('idle'); };
  document.getElementById('grazeBtn').onclick = function () { setMode('graze'); };
  document.getElementById('walkBtn').onclick = function () { setMode('walk'); };
  document.getElementById('flyBtn').onclick = function () { setMode('fly'); };
  document.getElementById('swimBtn').onclick = function () { setMode('swim'); };
  document.getElementById('nightBtn').onclick = function () { setNight(!night); };
  window.addEventListener('keydown', function (e) {
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const k = e.key.toLowerCase();
    if (k === 'i') setMode('idle'); else if (k === 'g') setMode('graze'); else if (k === 'k') setMode('walk'); else if (k === 'y') setMode('fly'); else if (k === 'u') setMode('swim'); else if (k === 'n') setNight(!night);
  });

  function showAll() { for (const g of INSTANCES) show(g, true); }
  function gotoRow(i) {
    const r = rows[i]; if (!r) return;
    showAll(); if (ctl.walk) window._setWalk(false);
    ctl.target.set(r.width / 2 - GAP / 2, 0.6, r.z); ctl.dist = Math.max(5, r.width * 0.85); ctl.az = 0.5; ctl.el = 0.3;
    updateCamera();
  }
  /* one animal, close and alone: kind = front34 | side | rear34 | front | top */
  const VIEWS = { front34: [0.75, 0.2, 3.2], side: [Math.PI / 2, 0.1, 3.4], rear34: [Math.PI - 0.75, 0.25, 3.2], front: [0, 0.12, 3.0], top: [0.3, 1.3, 3.6] };
  function view(i, kind) {
    const g = INSTANCES[i], V = VIEWS[kind] || VIEWS.front34; if (!g) return null;
    if (ctl.walk) window._setWalk(false);
    for (const o of INSTANCES) show(o, o === g);
    const k = Math.max(0.5, g.userData.d / 1.3);
    ctl.target.set(g.position.x, Math.max(0.4, g.userData.h * 0.45), g.position.z); ctl.az = V[0]; ctl.el = V[1]; ctl.dist = V[2] * k;
    updateCamera();
    return g.userData.key + ' #' + (g.userData.variant + 1);
  }
  { const m0 = (/[?&]mode=(\w+)/.exec(location.search) || [])[1]; if (m0) setMode(m0); }
  if (rows.length) gotoRow(0);
  window._sheet = { rows: rows, instances: INSTANCES, width: maxW, gotoRow: gotoRow, view: view, showAll: showAll, views: Object.keys(VIEWS),
    setMode: setMode, setNight: setNight };
  window._texPending = function () { return KF.textures().pending; };
  (function wait() { if (KF.textures().pending > 0) return setTimeout(wait, 50); window._ready = true; })();
})();
