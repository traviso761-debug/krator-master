/* ============================== 6z. HOST: VOTH ON core/host (the shell) ============================== */
/* [web] ROADMAP.md section 10, step 6a: Voth's city plan takes core/host's shell (core/host/README.md, "Voth onto core/host"):
   the camera (orbit, right-drag pan, W A S D fly, F walk on the KWALK floors with Voth's ledge guard, the pin: double-click,
   G flies to it, F walks from it, Esc lifts it), the frame loop, the panel's time row and the probe. The catalog engine
   (krator-asset-engine.js) keeps the scene, the camera and the renderer and leaves its controls and loop to the host
   (window.KRATOR_HOST, set in 00-head.html). What the page reads by name is kept: the engine's ctl becomes a view of the
   host's (az is the host's theta, el is PI/2 - phi, dist its radius, walk the host's walking flag as the engine's was, one target vector), updateCamera() is
   the host's apply, window._setWalk its walk. The clock is Voth's own (VC.clock, 55-vc-host.js VC.dayNight), adopted by the
   host's loop, which steps it; the hour slider jumps the simulation (SIM.jump). Every window._frameHooks entry runs as the
   engine ran it, after the camera is placed, handed performance.now(). Still Voth's own (step 6b): the inspector (I), the
   citizens' card and the pause (K), the stocks (O), the marks (P), the editor (B), the cutaway (X), the paths view. */
VC.hostTake = function () {
  var H, toCam = function (tx, ty, tz, dist, el, az) { return [tx + dist * Math.cos(el) * Math.sin(az), ty + dist * Math.sin(el), tz + dist * Math.cos(el) * Math.cos(az), tx, ty, tz]; };
  H = KHOST.take({
    build: 'voth-city', title: 'Voth · city plan',
    hint: 'The street method on the owner\'s site, over Voth\'s own ground. K pauses everything; I inspects (a citizen under the cursor too); X cuts the buildings in view open; O lists the stocks; P marks; B edits',
    scene: scene, camera: camera, renderer: renderer, ground: function (x, z) { return VIEW.surf(x, z); },
    walk: typeof KWALK !== 'undefined' ? KWALK : null, walker: { step: TUNE.walk.step, drop: TUNE.walk.drop, r: TUNE.walk.r, h: TUNE.walk.h }, eye: ctl.eyeHeight,
    minR: 3, maxR: 12000,
    views: { 'the city': toCam(900, 0, 400, 2600, 0.7, 0.5), 'the map': toCam(300, 0, 200, 6200, 1.45, 0) }, start: 'the city',
    clock: { obj: VC.clock, maxStep: Infinity, speeds: TUNE.clock.speeds, onSet: function () { if (SIM.jump) SIM.jump(); VC.applyHour(VC.clock.hour); } },
    inspect: function (hit) {   /* a click: Voth's own words (VC.describe, the hover tip's) for the ray to the hit, without the markup */
      var d = hit.point.clone().sub(camera.position).normalize(), t = VC.describe(new THREE.Ray(camera.position.clone(), d));
      return String(t || '').replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').replace(/&middot;/g, '·').replace(/&amp;/g, '&');
    },
    exporters: { plan: function () { return SL.exportPlan(); } },
    api: { vc: function () { return window._vc; } }
  });
  /* the engine's ctl, as a view of the host's camera (Voth's views, editor, stocks and cutaway write it) */
  var C = H.ctl; C.target = ctl.target;
  Object.defineProperty(ctl, 'az', { get: function () { return C.theta; }, set: function (v) { C.theta = v; }, configurable: true });
  Object.defineProperty(ctl, 'el', { get: function () { return Math.PI / 2 - C.phi; }, set: function (v) { C.phi = Math.PI / 2 - v; }, configurable: true });
  Object.defineProperty(ctl, 'dist', { get: function () { return C.radius; }, set: function (v) { C.radius = v; }, configurable: true });
  Object.defineProperty(ctl, 'walk', { get: function () { return C.walk; }, set: function (v) { C.walk = !!v; KHOST.cam.walkAt = null; }, configurable: true });
  Object.defineProperty(VC, 'walkAt', { get: function () { return C.walk ? KHOST.cam.walkAt : null; }, set: function () { }, configurable: true });   /* the walker's feet, [x, z, y] (56, 56b walk into an interior) */
  KHOST.onWalk = function (on) { if (window._onWalkChange) window._onWalkChange(on); };
  /* Voth's frame hooks, as the engine ran them: after the camera, on the page's time */
  KHOST.on(function vothHooks() { var now = performance.now(); if (window._inspectorTick) window._inspectorTick(); var F = window._frameHooks || []; for (var i = 0; i < F.length; i++) F[i](now); }, 'view');
  var lg = $('legend'); if (lg && lg.innerHTML) lg.style.display = 'block';   /* VC.ui wrote the lots' and roles' colours into the host's legend */
  return H;
};
