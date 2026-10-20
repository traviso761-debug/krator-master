/* ============================== 6. THE CITY PAGE'S START: PLAN, DRAW, LOOK ============================== */
/* [web] ?town=Kautoa (the default) or Valapo: that town is planned and drawn; then the other is planned too (not drawn),
   so the probe carries both towns' census and checks. window._city is the probe verify.py reads:
     {ready, both, town, ms, census: {town: ...}, checks: {town: [...]}, draw: DRAW.stats, failed, missing, errors, view(name)}
   The camera orbits a target on the ground: drag to turn, right-drag (or shift-drag) to pan, the wheel to zoom; the near
   set of full pieces follows the target. The view buttons are each town's places. */
var CAM = { t: [0, 0, 0], yaw: 0.6, pitch: 0.55, dist: 2600 };
CAM.apply = function () {
  var c = Math.cos(CAM.pitch), G = ISLE.cur.G; CAM.t[1] = Math.max(0, G.h(CAM.t[0], CAM.t[2]));
  camera.position.set(CAM.t[0] + Math.sin(CAM.yaw) * c * CAM.dist, CAM.t[1] + Math.sin(CAM.pitch) * CAM.dist, CAM.t[2] + Math.cos(CAM.yaw) * c * CAM.dist);
  camera.lookAt(CAM.t[0], CAM.t[1], CAM.t[2]);
  DRAW.near([CAM.t[0], CAM.t[2]]);
};
CAM.bind = function () {
  var el = renderer.domElement, drag = null;
  el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  el.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey }; });
  addEventListener('pointerup', function () { drag = null; });
  addEventListener('pointermove', function (e) {
    if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
    if (drag.pan) { var k = CAM.dist / innerHeight * 1.4, s = Math.sin(CAM.yaw), c = Math.cos(CAM.yaw); CAM.t[0] -= (dx * c - dy * s) * k; CAM.t[2] -= (-dx * s - dy * c) * k; }
    else { CAM.yaw -= dx * 0.005; CAM.pitch = Math.max(0.08, Math.min(1.5, CAM.pitch + dy * 0.004)); }
    CAM.apply();
  });
  el.addEventListener('wheel', function (e) { e.preventDefault(); CAM.dist = Math.max(40, Math.min(14000, CAM.dist * Math.exp(e.deltaY * 0.0012))); CAM.apply(); }, { passive: false });
};
/* the views: [target x, z, distance, yaw, pitch], or a landmark's role to look at */
/* the views, from the drawing itself (the owner redraws the towns): {zone} the whole build area, {district: name} a
   district's middle, {role} a landmark's front; dist the camera's distance (zone: from the area's size), yaw, pitch */
ISLE.VIEWS = {
  Kautoa: { overview: { zone: true, yaw: 2.6, pitch: 0.85 }, 'ceremonial centre': { district: 'ceremonial park', dist: 700, yaw: 2.4, pitch: 0.55 },
    palace: { role: 'palace', dist: 380 }, harbour: { district: 'harbor', dist: 900, yaw: 0.4, pitch: 0.45 }, 'works quarter': { district: 'works quarter', dist: 600, yaw: 0.6, pitch: 0.55 },
    izanitown: { district: 'izanitown', dist: 650, yaw: 2.4, pitch: 0.55 }, ridertown: { district: 'ridertown', dist: 900, yaw: 1.6, pitch: 0.55 },
    'street level': { role: 'envoy', dist: 140, pitch: 0.22 } },
  Valapo: { overview: { zone: true, yaw: 2.2, pitch: 0.85 }, 'village and harbour': { district: 'harbor', dist: 750, yaw: 3.6, pitch: 0.5 },
    'south harbour': { district: 'harbor 2', dist: 750, yaw: 3.6, pitch: 0.5 }, 'village hall': { role: 'village hall', dist: 220 },
    garrison: { role: 'garrison', dist: 260 }, 'street level': { role: 'village hall', dist: 110, pitch: 0.2 } }
};
ISLE.view = function (name) {
  var V = ISLE.VIEWS[ISLE.cur.town][name], R = ISLE.cur.R; if (!V) return false;
  var same = function (a, b) { return String(a).trim().toLowerCase() === String(b).trim().toLowerCase(); };
  if (V.zone || V.district) {
    var D = V.zone ? R.districts.filter(function (d) { return d.role === 'zone'; })[0] : R.districts.filter(function (d) { return same(d.name, V.district); })[0]; if (!D) return false;
    var c = KCITY.lib.polyCentroid(D.poly), e = 0; D.poly.forEach(function (p) { e = Math.max(e, Math.hypot(p[0] - c[0], p[1] - c[1])); });
    CAM.t = [c[0], 0, c[1]]; CAM.dist = V.dist || e * 2.4; CAM.yaw = V.yaw == null ? 0.5 : V.yaw; CAM.pitch = V.pitch == null ? 0.6 : V.pitch;
  } else {
    var L = R.lots.filter(function (x) { return x.role === V.role; })[0]; if (!L) return false;
    CAM.t = [L.x, 0, L.z]; CAM.dist = V.dist; CAM.yaw = L.ry; CAM.pitch = V.pitch == null ? 0.5 : V.pitch;
  }
  CAM.apply(); return true;
};
ISLE.plan = function (town, file) {
  var S = ISLE.townSite(file, town), P = ISLE.PROG[town], t0 = performance.now();
  var G = ISLE.siteGround(S, P), tg = Math.round(performance.now() - t0);
  var tags = KTAGS.create({ build: 'isle-demo:' + town });
  var R = ISLE.city(town, { site: S, ground: G, tags: tags, dims: function (k) { return ISLE_DIMS[k] || null; }, vdims: function (k) { return ISLE_VDIMS[k] || null; } });
  var C = ISLE.census(R), K = ISLE.checks(R, G);
  return { town: town, G: G, R: R, census: C, checks: K, tags: tags, ms: { ground: tg, plan: R.log.ms, all: Math.round(performance.now() - t0) } };
};
setTimeout(function () {
  var note = document.getElementById('loading'), T0 = performance.now(), ms = {};
  var lap = function (k) { ms[k] = Math.round(performance.now() - T0); console.log('isle-city: ' + k + ' at ' + ms[k] + ' ms'); };
  var fail = function (e) { if (note) note.textContent = 'Failed: ' + (e && e.message ? e.message : e); console.error(e); window._city = { ready: true, error: String(e && e.stack ? e.stack : e) }; };
  try {
    var q = /[?&]town=([^&]+)/.exec(location.search), town = q ? decodeURIComponent(q[1]) : ISLE.TOWNS[0];
    if (ISLE.TOWNS.indexOf(town) < 0) town = ISLE.TOWNS[0];
    ISLE.initWorld(); lap('world');
    var cur = ISLE.cur = ISLE.plan(town, SITE_INIT); lap('plan ' + town);
    /* the export (P6b): the drawn town's registry is the page's, and its ground is bound as sampled terrain (a
       krator-field from the extracted heights is still to do: PLAN.md section 10) */
    KTAGS.page = cur.tags;
    if (typeof EXPORT !== 'undefined') EXPORT.ground({ terrainH: function (x, z) { return cur.G.h(x, z); }, step: 4 });
    DRAW.stage(); DRAW.ground(cur.G, cur.R); DRAW.streets(cur.R, cur.G); DRAW.orchards(cur.R, cur.G); lap('ground');
    DRAW.records(cur.R); DRAW.vessels(cur.R); lap('pieces');
    CAM.bind(); ISLE.view('overview');
    var ui = document.getElementById('ui');
    ISLE.TOWNS.forEach(function (t) { var b = document.createElement('button'); b.textContent = t; if (t === town) b.className = 'on'; b.onclick = function () { location.search = '?town=' + t; }; ui.appendChild(b); });
    Object.keys(ISLE.VIEWS[town]).forEach(function (v) { var b = document.createElement('button'); b.textContent = v; b.onclick = function () { ISLE.view(v); }; ui.appendChild(b); });
    var hud = document.getElementById('hud');
    var loop = function () { requestAnimationFrame(loop); if (typeof RINGSEA !== 'undefined') RINGSEA.tick(performance.now() / 1000); renderer.render(scene, camera);
      if (hud) hud.textContent = town + ': ' + cur.census.buildings + ' buildings, ' + cur.census.households + ' households · near ' + DRAW.stats.near + ' full · ' + renderer.info.render.calls + ' calls'; };
    loop();
    if (note) note.style.display = 'none';
    var census = {}, checks = {}; census[town] = cur.census; checks[town] = cur.checks;
    window._city = { ready: true, both: false, town: town, ms: ms, census: census, checks: checks, draw: DRAW.stats, failed: DRAW.failed,
      planFailed: cur.R.failed, missing: cur.R.missing, log: cur.R.log, world: cur.R.world, landings: cur.R.landings,
      errors: { isk: ISK.errors, izv: IZV.errors }, view: ISLE.view, cur: cur };
    /* the other town, planned (not drawn) for its census and checks */
    setTimeout(function () {
      try {
        var other = ISLE.TOWNS.filter(function (t) { return t !== town; })[0], O = ISLE.plan(other, SITE_INIT);
        census[other] = O.census; checks[other] = O.checks; window._city.other = { town: other, ms: O.ms, failed: O.R.failed, missing: O.R.missing, log: O.R.log, world: O.R.world };
        lap('plan ' + other);
      } catch (e) { window._city.otherError = String(e && e.stack || e); }
      window._city.both = true;
    }, 30);
  } catch (e) { fail(e); }
}, 50);
