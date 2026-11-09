// ================================================================= CORE/SHADOW — the host: the sun casts  [web]
// KSHADOW.attach(o) readies the renderer's shadow map and, once switched on, makes the page's sun (a DirectionalLight) cast through one box that follows
// the view (KSHADOW.fit, 10-core-shadow.js). It runs in the scene's onBeforeRender (chained, never replaced), after the sky has set the
// sun for the frame (core/atmos sets its position from the sun's direction just before it renders) and before three renders the shadow
// maps, so it works whatever order a page's ticks run in. The sun's direction is read from its position and target each frame.
//
// OFF BY DEFAULT (the owner, 2026-11-03: toggleable, off, in every build): attach sets everything up and turns nothing on. While off the
// renderer's shadow map is disabled and the sun casts nothing, so three runs no shadow pass and compiles no shadow variant (r128 declares the
// map's sampler in a lit material only when the shadow map is on and a light casts): the page costs what it cost before it took KSHADOW.
// The switch is the mirror's pattern (core/water ext/58, WATER.mirrorSwitch): a button on the host's panel ('shadows: off'), ?shadow=1 asks at
// load, H.set(true|false) from the page; turning it either way recompiles the lit materials once.
//
//   KSHADOW.attach({ renderer, scene, camera, sun, on, ui, button, size, min, max, k, step, reach, ground(x, z), bias, normalBias, radius, soft })
//     on            start on (default false; true when the page's URL carries ?shadow=1)
//     ui            the panel for the button (default KHOST.ui, looked up once the page has run when it is not there yet); button: false none
//     size          the map's texels a side (default 4096)
//     min, max, k, step   the box's half side for the eye's height above the ground (KSHADOW.radiusFor; default 90 to 600 m)
//     reach         how far toward the sun casters are caught (default 1200 m: towers out of the box still throw into it)
//     ground(x,z)   the ground height, for the eye's height and the focus (default 0)
//     bias, normalBias, radius   the shadow's (default -0.0004, 0.6, 1.5); soft: false for hard PCF
//   -> the handle: { update(), cast(root, o), state, set(on), enabled(), off(), on() }
//     cast(root, { cast, receive })   flags every lit mesh under root (default both): a transparent, unlit, no-depth or shader material
//                                     neither casts nor receives (the baked shells and the impostors draw their own light)
//   The focus is where the view ray meets the ground (the host's orbit target when it has one), pulled toward the eye so the box
//   holds the near ground first. The sun below the horizon (intensity under 0.02) turns the pass off.
KSHADOW.attach = function (o) {
  const T = THREE, r = o.renderer, scene = o.scene, cam = o.camera, sun = o.sun, gnd = o.ground || (() => 0);
  const size = o.size == null ? 4096 : o.size, reach = o.reach == null ? 1200 : o.reach;
  const asked = typeof location !== 'undefined' && /[?&]shadow=1(&|$)/.test(location.search);
  let enabled = o.on == null ? asked : !!o.on, lastR = -1;
  r.shadowMap.enabled = enabled; r.shadowMap.type = o.soft === false ? T.BasicShadowMap : T.PCFShadowMap;
  sun.castShadow = enabled; sun.shadow.mapSize.set(size, size);
  sun.shadow.bias = o.bias == null ? -0.0004 : o.bias; sun.shadow.normalBias = o.normalBias == null ? 0.6 : o.normalBias; sun.shadow.radius = o.radius == null ? 1.5 : o.radius;
  if (!sun.target.parent) scene.add(sun.target);
  const H = { state: { on: enabled, radius: 0, texel: 0, focus: [0, 0, 0], frames: 0 } }, v = new T.Vector3(), d = new T.Vector3();
  H.update = function () {
    const lit = enabled && sun.intensity > 0.02;
    sun.castShadow = lit; H.state.on = lit; if (!lit) return;
    d.copy(sun.position).sub(sun.target.position); if (d.lengthSq() < 1e-6) return; d.normalize();
    /* the focus: the view ray on the ground, held within the box's reach of the eye and pulled a third of the way back toward it */
    const e = cam.position, h = e.y - gnd(e.x, e.z), R = KSHADOW.radiusFor(h, o);
    cam.getWorldDirection(v);
    let f;
    const tg = o.target ? o.target() : null;
    if (tg) f = [tg.x, tg.y, tg.z];
    else if (v.y < -0.05) { const t = Math.min(h / -v.y, R * 1.5); f = [e.x + v.x * t, e.y + v.y * t, e.z + v.z * t]; }
    else f = [e.x + v.x * R * 0.6, e.y, e.z + v.z * R * 0.6];
    f = [f[0] + (e.x - f[0]) / 3, f[1] + (e.y - f[1]) / 3, f[2] + (e.z - f[2]) / 3];
    const P = KSHADOW.fit({ dir: [d.x, d.y, d.z], focus: f, radius: R, size, reach, below: Math.max(R, h + 50) });
    sun.target.position.set(P.target[0], P.target[1], P.target[2]); sun.position.set(P.pos[0], P.pos[1], P.pos[2]);
    sun.target.updateMatrixWorld(); sun.updateMatrixWorld();
    const C = sun.shadow.camera;
    if (R !== lastR || C.far !== P.far) { C.left = -R; C.right = R; C.top = R; C.bottom = -R; C.near = P.near; C.far = P.far; C.updateProjectionMatrix(); lastR = R; }
    H.state.radius = R; H.state.texel = P.texel; H.state.focus = P.target; H.state.frames++;
  };
  const prev = scene.onBeforeRender;
  scene.onBeforeRender = function (rr, sc, c, rt) { if (typeof prev === 'function') prev.call(this, rr, sc, c, rt); if (c === cam && !rt) H.update(); };
  H.cast = function (root, q) {
    q = q || {}; const cs = q.cast == null ? true : q.cast, rc = q.receive == null ? true : q.receive;
    root.traverse(m => {
      if (!m.isMesh) return;
      const M = Array.isArray(m.material) ? m.material[0] : m.material;
      const ok = M && !M.transparent && M.depthWrite !== false && !M.isShaderMaterial && !M.isMeshBasicMaterial && M.visible !== false;
      m.castShadow = ok && cs; m.receiveShadow = ok && rc;
    });
    return root;
  };
  /* the switch: the renderer's map and the sun together, then every lit material once (its shadow define and sampler come and go).
     In r128 the map's sampler is declared in EVERY lit material once the renderer's map is on, so a material already at the texture-unit limit
     (a ground of many layers) would fail to compile: switching on is refused while any lit material in the scene would not fit (H.state.skipped
     says which; the button reads 'shadows: n/a') */
  let btn = null;
  const label = () => { if (btn) btn.textContent = 'shadows: ' + (H.state.skipped ? 'n/a' : enabled ? 'on' : 'off'); if (btn && H.state.skipped) btn.title = H.state.skipped; };
  H.fits = function () {
    const cap = r.capabilities || {}, max = cap.maxTextures == null ? 16 : cap.maxTextures, seen = new Set(); let worst = 0, who = '';
    scene.traverse(m => { if (!m.isMesh || !m.material) return; (Array.isArray(m.material) ? m.material : [m.material]).forEach(M => {
      if (!M || seen.has(M) || M.isShaderMaterial || M.isMeshBasicMaterial) return; seen.add(M);
      const n = KSHADOW.units(M, r); if (n > worst) { worst = n; who = (M.name || M.type) + (m.name ? ' on ' + m.name : ''); } }); });
    H.state.skipped = worst + 1 > max ? 'the ' + who + ' reads ' + worst + ' of ' + max + ' texture units' : null;
    return !H.state.skipped;
  };
  H.set = function (on) {
    on = !!on; if (on === enabled) return H;
    if (on && !H.fits()) { label(); return H; }
    enabled = on; r.shadowMap.enabled = on; sun.castShadow = on && sun.intensity > 0.02; H.state.on = sun.castShadow;
    scene.traverse(m => { if (!m.material) return; (Array.isArray(m.material) ? m.material : [m.material]).forEach(M => { if (M && !M.isShaderMaterial) M.needsUpdate = true; }); });
    label(); return H;
  };
  H.enabled = () => enabled;
  H.off = function () { return H.set(false); };
  H.on = function () { return H.set(true); };
  const addBtn = ui => {
    if (!ui || btn || typeof document === 'undefined') return;
    btn = document.createElement('button'); btn.id = 'shadow-btn'; btn.title = 'the sun\'s shadows: a second pass over every caster when on';
    btn.onclick = () => H.set(!enabled); label(); ui.appendChild(btn);
  };
  if (o.button !== false) {
    const ui = () => o.ui || (typeof KHOST !== 'undefined' && KHOST ? KHOST.ui : null);
    if (ui()) addBtn(ui()); else if (typeof setTimeout !== 'undefined') setTimeout(() => addBtn(ui()), 0);
  }
  if (enabled && !H.fits()) { enabled = false; r.shadowMap.enabled = false; sun.castShadow = false; H.state.on = false; label(); }
  KSHADOW.host = H;
  return H;
};
/* KSHADOW.units(material, renderer): the texture units a material's fragment program reads, by a dry run of its onBeforeCompile on the
   library shader (the Throne's samplersOf, 2026-11-03): its own maps plus every sampler its hooks declare (2D, 3D, Cube and their
   array, shadow and integer forms, with or without a precision qualifier: core/atmos's cloud shade declares `uniform highp sampler3D`,
   which the first pattern missed, 2026-11-08). A failure counts as 99 */
KSHADOW.units = function (M, r) {
  const LIB = { MeshLambertMaterial: 'lambert', MeshStandardMaterial: 'standard', MeshPhysicalMaterial: 'physical', MeshPhongMaterial: 'phong', MeshToonMaterial: 'toon' };
  try {
    const L = THREE.ShaderLib[LIB[M.type]]; if (!L) return 0;
    const sh = { uniforms: {}, vertexShader: L.vertexShader, fragmentShader: L.fragmentShader };
    const f0 = typeof KHOOK !== 'undefined' ? KHOOK.failures.length : 0;
    try { if (M.onBeforeCompile) M.onBeforeCompile(sh, r); } finally { if (typeof KHOOK !== 'undefined') KHOOK.failures.length = f0; }
    let n = 0;
    ['map', 'emissiveMap', 'alphaMap', 'lightMap', 'aoMap', 'normalMap', 'bumpMap', 'roughnessMap', 'metalnessMap', 'specularMap', 'envMap'].forEach(k => { if (M[k]) n++; });
    sh.fragmentShader.replace(/uniform\s+(?:(?:lowp|mediump|highp)\s+)?[iu]?sampler(?:2D|3D|Cube)\w*\s+([^;]+);/g,(a, b) => { n += b.split(',').length; return a; });
    return n;
  } catch (e) { return 99; }
};
