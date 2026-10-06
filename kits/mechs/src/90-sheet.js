/* ======================== Mechs kit sheet ========================
   Every registered mech in its own lane on the catalog engine's scene (kits/catalog/
   krator-asset-engine.js), built ONLY through the bundle's public API (KratorMechs), as
   a host world builds them. Each stands at ry = 0 (+z forward) with a 1.75 m figure
   beside it for scale.
   Toolbar: Idle (1), Walk on the spot (2), March up and down the lane (3), Attack (X:
   every mech, or the one gone to), Follow (G), Lights (L), Night (N). Loosed bolts fly
   and stick; feet and blows raise dust.
   The library textures (window.MECH_TEX, from tex/) go in through KratorMechs.useTextures;
   ?tex=0 leaves the vertex colours alone.
   Exposes window._sheet (lanes, instances, view(i, kind), step(dt, n), pause, setMode,
   attack, ...) and sets window._ready.
   ====================================================================== */
const INSTANCES = [];
(function () {
  'use strict';
  const KM = KratorMechs;
  const Q = new URLSearchParams(location.search);
  if (window.MECH_TEX && Q.get('tex') !== '0') KM.useTextures(window.MECH_TEX);   /* plate, livery, metal, bronze, cloth, hair, banner, sunbanner */

  /* --- light: shadows that follow the camera's target, a small sky for the metal to reflect */
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const SH = 30;
  Object.assign(sun.shadow.camera, { left: -SH, right: SH, top: SH, bottom: -SH, near: 10, far: 700 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  scene.add(sun.target);
  ground.receiveShadow = true;
  ground.material.color.setHex(0x8f8766).convertSRGBToLinear();     /* the engine's ground colour is sRGB; the renderer is linear */
  const SUN_DIR = sun.position.clone().normalize();
  (function envMap() {
    const es = new THREE.Scene(), geo = new THREE.SphereGeometry(10, 24, 12), col = [];
    const top = new THREE.Color(0x9fb4cf), hor = new THREE.Color(0xe8dcc0), bot = new THREE.Color(0x5d5640), c = new THREE.Color();
    for (let i = 0; i < geo.attributes.position.count; i++) {
      const y = geo.attributes.position.getY(i) / 10;
      if (y > 0) c.copy(hor).lerp(top, Math.pow(y, 0.6)); else c.copy(hor).lerp(bot, Math.min(1, -y * 3));
      col.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    es.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff2d0 }));
    sunDisc.position.copy(SUN_DIR).multiplyScalar(9); es.add(sunDisc);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(es, 0.02).texture;
    pm.dispose();
  })();

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
    if (sub) { g.font = '24px Georgia, serif'; g.globalAlpha = 0.7; let s = sub; while (g.measureText(s).width > 500 && s.length > 8) s = s.slice(0, -2); g.fillText(s, 256, 92); }
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * c.height / c.width), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.03, z);
    scene.add(m);
    return m;
  }
  /* a 1.75 m figure for scale: a legionary in an orange tunic */
  function figure(x, z) {
    const g = new THREE.Group(), L = function (h) { return new THREE.Color(h).convertSRGBToLinear(); };
    const cloth = new THREE.MeshStandardMaterial({ color: L(0xa33a24), roughness: 0.9 });
    const skin = new THREE.MeshStandardMaterial({ color: L(0xb98a62), roughness: 0.8 });
    const bronze = new THREE.MeshStandardMaterial({ color: L(0xa87038), roughness: 0.4, metalness: 0.7 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 1.45, 10), cloth); body.position.y = 0.725; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), skin); head.position.y = 1.6; g.add(head);
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), bronze); helm.position.y = 1.63; g.add(helm);
    g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
    g.position.set(x, 0, z); g.name = 'scale-figure';
    scene.add(g);
    return g;
  }

  /* --- lay out: one lane per mech along +x, five to a row, rows 24 m apart; each marches toward +z and back */
  const LANE_Z = 13, ROW = 5, ROW_Z = 24, lanes = [];
  let x = 0, WIDTH = 0, n = 0;
  for (const E of KM.list()) {
    for (let v = 0; v < E.variants; v++) {
      if (n && n % ROW === 0) { WIDTH = Math.max(WIDTH, x); x = 0; }
      const z0 = -Math.floor(n / ROW) * ROW_Z; n++;
      const lw = E.w + 4.5, cx = x + E.w / 2 + 0.5;
      const g = KM.build(E.key, { variant: v, seed: 1 });
      g.position.set(cx, 0, z0);
      g.userData.x = cx; g.userData.z = z0; g.userData.ry = 0;
      scene.add(g); INSTANCES.push(g);
      figure(cx + E.w / 2 + 0.6, z0 + 1.2);
      const D = KM.dataOf(E.key, v);
      label(E.name + (E.variants > 1 && E.variantNames[v] ? ' · ' + E.variantNames[v] : ''),
        E.role + ' · ' + D.height + ' m · ' + D.mass + ' t · ' + D.speed + ' m/s · ' + g.userData.tris + ' tris', cx, z0 - E.d / 2 - 2.2, Math.max(E.w * 1.3, 4.2), true);
      lanes.push({ key: E.key, title: E.name, x0: cx, z0: z0, g: g, w: E.w, d: E.d, h: E.h, heading: 0, mode: 'go', turned: 0, i: lanes.length });
      x += lw;
    }
  }
  WIDTH = Math.max(WIDTH, x);
  const ROWS = Math.ceil(lanes.length / ROW);
  label('Iziz war-walkers', 'the Forgemasters\' machines · ' + lanes.length + ' mechs', WIDTH / 2, -ROWS * ROW_Z + 8, 14, true);

  /* --- the sky (vendored 81-sky.js) at mid-morning; Night drops it to 21:30 */
  let hour = 10.5;
  const hemi = scene.children.filter(function (o) { return o.isHemisphereLight; })[0];
  const base = { sun: sun.intensity, fill: fill.intensity, hemi: hemi ? hemi.intensity : 0 };
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
    scene.environment && (renderer.toneMappingExposure = night ? 0.7 : 0.86);
    scene.background = new THREE.Color(night ? 0x0c0f18 : 0xd8dccb);
    if (window.KratorSky) { KratorSky.update(camera.position, hour, 200, 1.6); scene.fog.color.copy(KratorSky.lighting().fog); }
    document.getElementById('nightBtn').classList.toggle('on', night);
  }

  /* --- flying bolts, dust */
  const FX = [], PROJ = {};
  const puffTex = (function () {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 2, 32, 32, 31);
    r.addColorStop(0, 'rgba(176,160,124,0.9)'); r.addColorStop(1, 'rgba(176,160,124,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  })();
  function dust(p, n, size, up) {
    for (let i = 0; i < n; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0.8 }));
      const a = i / n * Math.PI * 2 + Math.random() * 0.4;
      s.position.set(p[0] + Math.cos(a) * 0.2, p[1] + 0.15, p[2] + Math.sin(a) * 0.2);
      s.scale.setScalar(size);
      scene.add(s);
      FX.push({ o: s, v: new THREE.Vector3(Math.cos(a) * (0.6 + Math.random() * 0.6), up * (0.3 + Math.random() * 0.5), Math.sin(a) * (0.6 + Math.random() * 0.6)),
        life: 1.3, t: 0, grow: size * 1.8, kind: 'dust' });
    }
  }
  function loose(ev) {
    const kind = ev.kind || 'bolt';
    const proto = PROJ[kind] || (PROJ[kind] = KM.projectile(kind));
    const o = proto.clone();
    o.position.fromArray(ev.pos);
    const v = new THREE.Vector3().fromArray(ev.dir).multiplyScalar(ev.speed || 40);
    o.lookAt(o.position.clone().add(v));
    scene.add(o);
    FX.push({ o: o, v: v, life: 4, t: 0, kind: 'bolt', stuck: false });
  }
  function handle(evs) {
    for (const e of evs) {
      if (e.type === 'step') dust(e.pos, 5, 0.5 + Math.min(1, e.mass / 20) * 0.5, 0.6);
      else if (e.type === 'impact') dust(e.pos, 14, 1.0, 1.4);
      else if (e.type === 'fire') { loose(e); dust(e.pos, 4, 0.35, 0.8); }
    }
  }
  function stepFX(dt) {
    for (let i = FX.length - 1; i >= 0; i--) {
      const f = FX[i];
      f.t += dt;
      if (f.kind === 'dust') {
        f.o.position.addScaledVector(f.v, dt); f.v.multiplyScalar(Math.max(0, 1 - dt * 1.6));
        f.o.scale.setScalar(f.o.scale.x + f.grow * dt);
        f.o.material.opacity = 0.8 * Math.max(0, 1 - f.t / f.life);
      } else if (!f.stuck) {
        f.v.y -= 9.8 * dt;
        f.o.position.addScaledVector(f.v, dt);
        f.o.lookAt(f.o.position.clone().add(f.v));
        if (f.o.position.y <= 0.15) { f.stuck = true; f.o.position.y = 0.15; dust(f.o.position.toArray(), 8, 0.6, 1.0); f.life = f.t + 3; }
      }
      if (f.t >= f.life) { scene.remove(f.o); if (f.kind === 'dust') f.o.material.dispose(); FX.splice(i, 1); }
    }
  }

  /* --- modes: idle, walk on the spot, march the lanes */
  let mode = 'idle', follow = -1, paused = false, lightsOn = true, last = 0;
  function setMode(m) {
    mode = m;
    for (const L of lanes) {
      KM.setState(L.g, m === 'idle' ? 'idle' : 'walk');
      if (m !== 'march') { L.mode = 'go'; L.turned = 0; }
    }
    for (const id of ['idle', 'walk', 'march']) document.getElementById(id + 'Btn').classList.toggle('on', id === m);
  }
  function attack(i) {
    const list = i == null ? lanes : [lanes[i]];
    list.forEach(function (L, k) { setTimeout(function () { KM.attack(L.g); }, i == null ? k * 180 : 0); });
  }
  function march(L, dt) {
    const g = L.g, v = KM.speed(g), st = KM.state(g);
    if (st.attacking) return;
    let sp = v, w = 0;
    if (L.mode === 'turn') { w = 0.32; sp = v * 0.5; }
    L.heading += w * dt;
    g.position.x += Math.sin(L.heading) * sp * dt; g.position.z += Math.cos(L.heading) * sp * dt;
    g.rotation.y = L.heading;
    if (L.mode === 'turn') {
      L.turned += w * dt;
      if (L.turned >= Math.PI) { L.mode = 'go'; L.turned = 0; L.heading = Math.round(L.heading / Math.PI) * Math.PI; }
    } else {
      const fwd = Math.cos(L.heading) > 0;
      if ((fwd && g.position.z > L.z0 + LANE_Z) || (!fwd && g.position.z < L.z0)) L.mode = 'turn';
    }
    g.userData.x = g.position.x; g.userData.z = g.position.z; g.userData.ry = g.rotation.y;
  }
  function step(dt) {
    for (const L of lanes) {
      if (mode === 'march') march(L, dt);
      handle(KM.update(L.g, dt));
    }
    stepFX(dt);
    if (follow >= 0) {
      const g = lanes[follow].g;
      ctl.target.x += (g.position.x - ctl.target.x) * Math.min(1, dt * 3);
      ctl.target.z += (g.position.z - ctl.target.z) * Math.min(1, dt * 3);
      updateCamera();
    }
    /* the shadow box follows what the camera looks at */
    sun.target.position.set(ctl.target.x, 0, ctl.target.z);
    sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 300);
  }
  (window._frameHooks = window._frameHooks || []).push(function (now) {
    if (window.KratorSky) KratorSky.update(camera.position, hour, 200, 1.6);
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0; last = now;
    if (!paused) step(dt);
  });

  /* --- toolbar */
  const E0 = KM.list();
  document.getElementById('count').textContent = E0.length + ' mechs · cultures: ' + KM.cultures().join(', ');
  const rs = document.getElementById('rowSel'), about = document.getElementById('about');
  lanes.forEach(function (L, i) { const o = document.createElement('option'); o.value = String(i); o.textContent = L.title; rs.appendChild(o); });
  rs.onchange = function () { if (rs.value !== '') gotoLane(+rs.value); };
  function on(id, f) { document.getElementById(id).onclick = f; }
  on('idleBtn', function () { setMode('idle'); }); on('walkBtn', function () { setMode('walk'); }); on('marchBtn', function () { setMode('march'); });
  on('attackBtn', function () { attack(follow >= 0 ? follow : null); });
  on('followBtn', function () { setFollow(follow >= 0 ? -1 : Math.max(0, +rs.value || 0)); });
  on('lightsBtn', function () { setLights(!lightsOn); }); on('nightBtn', function () { setNight(!night); });
  function setLights(v) { lightsOn = v; for (const L of lanes) KM.lights(L.g, v); document.getElementById('lightsBtn').classList.toggle('on', v); }
  function setFollow(i) { follow = i; document.getElementById('followBtn').classList.toggle('on', i >= 0); }
  window.addEventListener('keydown', function (e) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const k = e.key.toLowerCase();
    if (k === '1') setMode('idle'); else if (k === '2') setMode('walk'); else if (k === '3') setMode('march');
    else if (k === 'x') attack(follow >= 0 ? follow : null);
    else if (k === 'g') setFollow(follow >= 0 ? -1 : Math.max(0, +rs.value || 0));
    else if (k === 'l') setLights(!lightsOn); else if (k === 'n') setNight(!night);
  });

  function showAll() { for (const g of INSTANCES) g.visible = true; }
  function gotoLane(i) {
    const L = lanes[i];
    if (!L) return;
    showAll();
    if (ctl.walk) window._setWalk(false);
    ctl.target.set(L.g.position.x, 2.6, L.g.position.z);
    ctl.dist = Math.max(11, L.h * 2.2); ctl.az = 0.55; ctl.el = 0.2;
    updateCamera();
    if (follow >= 0) setFollow(i);
    const A = E0.find(function (e) { return e.key === L.key; });
    about.textContent = A ? A.name + ': ' + A.origin + '. ' + A.lore : '';
  }
  function overview() {
    showAll();
    ctl.target.set(WIDTH / 2, 2.0, -ROW_Z * (ROWS - 1) / 2 + 2); ctl.dist = Math.max(30, WIDTH * 0.95); ctl.az = 0.12; ctl.el = 0.42;
    updateCamera();
  }
  /* one mech, close and alone (the others hidden until the next gotoLane or showAll): front34 | side | rear34 | front | top */
  const VIEWS = { front34: [0.7, 0.16, 1], side: [Math.PI / 2, 0.1, 1.05], rear34: [Math.PI - 0.75, 0.2, 1], front: [0, 0.1, 1], top: [0.3, 1.25, 1.1], low: [0.45, 0.02, 0.85] };
  function view(i, kind) {
    const L = lanes[i], V = VIEWS[kind] || VIEWS.front34;
    if (!L) return null;
    if (ctl.walk) window._setWalk(false);
    for (const o of INSTANCES) o.visible = o === L.g;
    ctl.target.set(L.g.position.x, L.h * 0.42, L.g.position.z);
    ctl.az = V[0] + L.g.rotation.y; ctl.el = V[1]; ctl.dist = Math.max(L.w, L.h, L.d) * 1.75 * V[2];
    updateCamera();
    sun.target.position.set(ctl.target.x, 0, ctl.target.z);
    sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 300);
    return L.key;
  }
  overview();

  window._sheet = { lanes: lanes, instances: INSTANCES, width: WIDTH, gotoLane: gotoLane, overview: overview, view: view, showAll: showAll,
    views: Object.keys(VIEWS), setMode: setMode, attack: attack, setLights: setLights, setNight: setNight, setFollow: setFollow,
    step: function (dt, n) { for (let i = 0; i < (n || 1); i++) step(dt); },
    pause: function (v) { paused = v !== false; last = 0; }, fx: FX };
  window._ready = true;
})();
