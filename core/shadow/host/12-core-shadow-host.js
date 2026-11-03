// ================================================================= CORE/SHADOW — the host: the sun casts  [web]
// KSHADOW.attach(o) turns on the renderer's shadow map and makes the page's sun (a DirectionalLight) cast through one box that follows
// the view (KSHADOW.fit, 10-core-shadow.js). It runs in the scene's onBeforeRender (chained, never replaced), after the sky has set the
// sun for the frame (core/atmos sets its position from the sun's direction just before it renders) and before three renders the shadow
// maps, so it works whatever order a page's ticks run in. The sun's direction is read from its position and target each frame.
//
//   KSHADOW.attach({ renderer, scene, camera, sun, size, min, max, k, step, reach, ground(x, z), bias, normalBias, radius, soft })
//     size          the map's texels a side (default 4096)
//     min, max, k, step   the box's half side for the eye's height above the ground (KSHADOW.radiusFor; default 90 to 600 m)
//     reach         how far toward the sun casters are caught (default 1200 m: towers out of the box still throw into it)
//     ground(x,z)   the ground height, for the eye's height and the focus (default 0)
//     bias, normalBias, radius   the shadow's (default -0.0004, 0.6, 1.5); soft: false for hard PCF
//   -> the handle: { update(), cast(root, o), state, off(), on() }
//     cast(root, { cast, receive })   flags every lit mesh under root (default both): a transparent, unlit, no-depth or shader material
//                                     neither casts nor receives (the baked shells and the impostors draw their own light)
//   The focus is where the view ray meets the ground (the host's orbit target when it has one), pulled toward the eye so the box
//   holds the near ground first. The sun below the horizon (intensity under 0.02) turns the pass off.
KSHADOW.attach = function (o) {
  const T = THREE, r = o.renderer, scene = o.scene, cam = o.camera, sun = o.sun, gnd = o.ground || (() => 0);
  const size = o.size == null ? 4096 : o.size, reach = o.reach == null ? 1200 : o.reach;
  r.shadowMap.enabled = true; r.shadowMap.type = o.soft === false ? T.BasicShadowMap : T.PCFShadowMap;
  sun.castShadow = true; sun.shadow.mapSize.set(size, size);
  sun.shadow.bias = o.bias == null ? -0.0004 : o.bias; sun.shadow.normalBias = o.normalBias == null ? 0.6 : o.normalBias; sun.shadow.radius = o.radius == null ? 1.5 : o.radius;
  if (!sun.target.parent) scene.add(sun.target);
  const H = { state: { on: true, radius: 0, texel: 0, focus: [0, 0, 0], frames: 0 } }, v = new T.Vector3(), d = new T.Vector3();
  let enabled = true, lastR = -1;
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
  H.off = function () { enabled = false; sun.castShadow = false; };
  H.on = function () { enabled = true; };
  KSHADOW.host = H;
  return H;
};
