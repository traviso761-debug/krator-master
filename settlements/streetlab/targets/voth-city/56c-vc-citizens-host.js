/* ============================== 6d. HOST: THE CITIZENS RUN, AND THE ONES NEAR THE CAMERA DRAWN ============================== */
/* [draw] The browser side of 44-vc-sim-people.js (phase C session 2; SIM-ROADMAP.md 2.4 items 3 and 3b):
   - THE RUN (VC.simRun): every actor is stepped (the owner's Q1), asked again only when its wish could change (core's
     SIM.WAKE, TUNE.sim.run.wake): SIM.step() once per simulated minute from the frame
     loop, at most TUNE.sim.run.catchUp minutes a frame when the clock runs fast; a jump of the hour slider re-places
     everyone (SIM.jump). The pedestrian layer is lazy (core/simulation SIM.lazy): a decision costs microseconds and
     the path is found only when the walker is drawn. The census is sampled at TUNE.sim.run.samples hours every day
     (VC.SIMRUN.days: the fast clock's stability check), each step's cost is kept.
   - THE BODIES (VC.simBodies): the citizens within TUNE.sim.embody.r of the view's centre (the orbit target, or the
     walker), the nearest TUNE.sim.embody.max of them, as instanced figures posed by SIM.pose; hidden indoors; the
     tunic by what they are doing (TUNE.sim.embody.colours). Drawn only when the view is close (TUNE.sim.embody.dist).
   - The clock bar's line: at work, asleep, out and about, walking, the mean happiness (77-sim-6-needs.js), the step's cost. */
VC.SIMRUN = { steps: 0, ms: [], days: {}, jumps: 0, jumpMs: 0, last: null };

VC.simCensusNow = function (cheap) {   /* cheap: asked only of those due (SIM.WAKE): the clock bar's, once a second */
  var A = SIM.all('actor'), out = { actors: A.length, by: {}, unmet: {}, visiting: 0, moving: 0, indoors: 0, pending: 0, stuck: 0 }, minute = SIM.minute(), t = SIM.time();
  for (var i = 0; i < A.length; i++) {
    var a = A[i], k = a.activity || 'none'; out.by[k] = (out.by[k] || 0) + 1;
    if (a.task) { if (t < a.task.arrive) out.moving++; else if (a.task.indoor) out.indoors++; }
    if (a.present && !a.driven && !(cheap && SIM.WAKE && a.wake != null && minute < a.wake) && SIM.desire(a, minute) !== a.wanted) out.pending++;
    else if (a.wanted === 'SOCIALIZE' && a.activity === 'VISIT') out.visiting++;                                          /* company at home instead: met */
    else if (a.wanted && a.activity && a.activity !== a.wanted) out.unmet[a.wanted] = (out.unmet[a.wanted] || 0) + 1;   /* wanted, not had: the deficit */
    if (!a.task) out.stuck++;
  }
  return out;
};

VC.simRun = function () {
  if (typeof SIM === 'undefined' || !VC.PEOPLE || !VC.clock) return;
  var R = TUNE.sim.run, C = VC.clock, S = VC.SIMRUN;
  SIM.lazy = { pedestrian: { detour: R.detour } }; SIM.STEP_MAX = R.stepMax; SIM.REACH = R.reach; SIM.WAKE = R.wake !== false;
  var t0 = performance.now(); SIM.jump(); S.jumpMs = Math.round(performance.now() - t0); S.jumps++; S.last = SIM.minute();
  var sampled = {};
  (window._frameHooks = window._frameHooks || []).push(function () {
    var m = SIM.minute();
    if (S.last == null || m < S.last || m - S.last > R.jumpGap) { var tj = performance.now(); SIM.jump(); S.jumpMs = Math.round(performance.now() - tj); S.jumps++; S.last = m; return; }
    var n = Math.min(R.catchUp, m - S.last); if (n <= 0) return;
    for (var i = 0; i < n; i++) { var ts = performance.now(); SIM.step(); S.ms.push(performance.now() - ts); S.steps++; if (S.ms.length > 300) S.ms.shift(); }
    S.last = m;
    /* the day's samples: at each sample hour, once */
    var day = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
    if (R.samples.indexOf(h) >= 0 && !sampled[day + ':' + h]) { sampled[day + ':' + h] = 1; (S.days[day] || (S.days[day] = {}))[h] = VC.simCensusNow(); }
  });
  /* the clock bar's line, once a second */
  var el = $('clk-sim'), lastTxt = 0;
  if (el) (window._frameHooks = window._frameHooks || []).push(function (now) {
    if (now - lastTxt < 1000) return; lastTxt = now;
    var c = VC.simCensusNow(true), b = c.by, ms = S.ms.slice().sort(function (p, q) { return p - q; }), f = function (v) { return (v || 0).toLocaleString(); };
    if (SIM.NEED && now - (S.moodAt || 0) > 5000) { S.moodAt = now; var G = SIM.needsCensus(null).all; S.mood = G ? G.happy : null; }   /* happiness every 5 s: it walks every meter */
    el.textContent = 'day ' + (SIM.weekday() + 1) + ' of 7 · at work ' + f(b.WORK) + ' · asleep ' + f(b.SLEEP) + ' · walking ' + f(c.moving) + (S.mood != null ? ' · happiness ' + S.mood.toFixed(0) : '') + ' · step ' + (ms.length ? ms[ms.length >> 1].toFixed(1) : '-') + ' ms';
  });
};

/* ---------------------------------------------------------------- the bodies near the camera */
VC.simBodies = function () {
  if (typeof SIM === 'undefined' || !VC.PEOPLE) return;
  var E = TUNE.sim.embody, box = function (w, h, d, x, y, z) { var g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return g; };
  /* a person, 1.75 m, feet at 0, facing +z: legs and head in fixed colours, the tunic and arms take the instance colour */
  var parts = [[box(0.15, 0.82, 0.17, -0.1, 0.41, 0), 0x3a3026], [box(0.15, 0.82, 0.17, 0.1, 0.41, 0), 0x3a3026], [box(0.44, 0.62, 0.26, 0, 1.13, 0), 0xffffff],
    [box(0.11, 0.58, 0.13, -0.29, 1.12, 0), 0xffffff], [box(0.11, 0.58, 0.13, 0.29, 1.12, 0), 0xffffff], [box(0.24, 0.26, 0.25, 0, 1.6, 0), 0xb08a6a]];
  var pos = [], nor = [], col = [], c = new THREE.Color();
  parts.forEach(function (p) { var g = p[0].toNonIndexed(), P = g.attributes.position.array, N = g.attributes.normal.array; c.setHex(p[1]).convertSRGBToLinear();
    for (var i = 0; i < P.length; i++) { pos.push(P[i]); nor.push(N[i]); } for (var k = 0; k < P.length / 3; k++) col.push(c.r, c.g, c.b); });
  var G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); G.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  var M = new THREE.InstancedMesh(G, new THREE.MeshLambertMaterial({ vertexColors: true }), E.max);
  M.instanceMatrix.setUsage(THREE.DynamicDrawUsage); M.count = 0; M.frustumCulled = false; M.userData.probeSkip = true; scene.add(M);
  /* a cart (phase E: 46-vc-sim-economy.js): its bed and two wheels, its hauler in the shafts ahead, facing +z */
  var cparts = [[box(1.3, 0.5, 2.2, 0, 0.85, -0.4), 0x6b4a2c], [box(0.12, 1.1, 1.1, -0.72, 0.55, -0.4), 0x3b2a1a], [box(0.12, 1.1, 1.1, 0.72, 0.55, -0.4), 0x3b2a1a],
    [box(0.08, 0.08, 1.6, -0.45, 0.9, 1.4), 0x6b4a2c], [box(0.08, 0.08, 1.6, 0.45, 0.9, 1.4), 0x6b4a2c]].concat(parts.map(function (p) { var g = p[0].clone(); g.translate(0, 0, 1.6); return [g, p[1]]; }));
  var cpos = [], cnor = [], ccol = [];
  cparts.forEach(function (p) { var g = p[0].toNonIndexed(), P = g.attributes.position.array, N = g.attributes.normal.array; c.setHex(p[1]).convertSRGBToLinear();
    for (var i = 0; i < P.length; i++) { cpos.push(P[i]); cnor.push(N[i]); } for (var k = 0; k < P.length / 3; k++) ccol.push(c.r, c.g, c.b); });
  var CG = new THREE.BufferGeometry(); CG.setAttribute('position', new THREE.Float32BufferAttribute(cpos, 3)); CG.setAttribute('normal', new THREE.Float32BufferAttribute(cnor, 3)); CG.setAttribute('color', new THREE.Float32BufferAttribute(ccol, 3));
  var MC = new THREE.InstancedMesh(CG, new THREE.MeshLambertMaterial({ vertexColors: true }), Math.max(1, SIM.ECON ? SIM.ECON.carts.length : 1));
  MC.instanceMatrix.setUsage(THREE.DynamicDrawUsage); MC.count = 0; MC.frustumCulled = false; MC.userData.probeSkip = true; scene.add(MC);
  var B = VC.SIMBODY = { mesh: M, carts: MC, list: [], shown: 0, cartsShown: 0, resolved: 0, at: 0 };
  var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1), cc = new THREE.Color(), cols = {};
  Object.keys(E.colours).forEach(function (k) { cols[k] = new THREE.Color(E.colours[k]).convertSRGBToLinear(); });
  /* where an actor is, cheaply (for picking who is near): at its spot once arrived (null when indoors), on the straight
     line of its trip while moving, at home with no task */
  var where = function (a, t) {
    if (!a.present) return null; var T = a.task;
    if (!T) { var H = SIM.R.place[a.home]; return H ? null : null; }
    if (t >= T.arrive) return T.indoor ? null : T.spot;
    var L0 = T.legs[0], L1 = T.legs[T.legs.length - 1]; if (!L0) return T.spot;
    var A = L0.lazy ? L0.lazy.from : L0.route.pts[0], f = T.dur > 0 ? (t - T.t0) / T.dur : 1, x0 = A.x != null ? A.x : A[0], z0 = A.z != null ? A.z : A[2];
    return { x: x0 + (T.spot.x - x0) * f, z: z0 + (T.spot.z - z0) * f };
  };
  (window._frameHooks = window._frameHooks || []).push(function (now) {
    var close = ctl.walk || ctl.dist < E.dist; if (!close) { M.count = 0; B.shown = 0; MC.count = 0; B.cartsShown = 0; return; }
    var cx = ctl.walk ? camera.position.x : ctl.target.x, cz = ctl.walk ? camera.position.z : ctl.target.z, t = SIM.time();
    if (now - B.at > E.every) {     /* who is near: refreshed a few times a second */
      B.at = now; var A = SIM.all('actor'), near = [], r2 = E.r * E.r;
      for (var i = 0; i < A.length; i++) { if (A[i].driven) continue; var w = where(A[i], t); if (!w) continue; var d = (w.x - cx) * (w.x - cx) + (w.z - cz) * (w.z - cz); if (d < r2) near.push([d, A[i]]); }
      near.sort(function (p, q2) { return p[0] - q2[0]; }); B.list = near.slice(0, E.max).map(function (x) { return x[1]; });
    }
    var n = 0;
    for (var j = 0; j < B.list.length; j++) {
      var a = B.list[j], P = SIM.pose(a, t); if (P.hidden) continue;
      e.set(0, P.h || 0, 0); q.setFromEuler(e); p3.set(P.x, P.y, P.z); m4.compose(p3, q, s3); M.setMatrixAt(n, m4);
      M.setColorAt(n, cols[P.moving ? 'moving' : a.activity] || cols.other); n++;
    }
    M.count = n; B.shown = n; M.instanceMatrix.needsUpdate = true; if (M.instanceColor) M.instanceColor.needsUpdate = true;
    var nc = 0, rc = E.r * E.r;   /* the carts: few, all looked at every frame */
    (SIM.ECON ? SIM.ECON.carts : []).forEach(function (a) { var Pc = SIM.pose(a, t, { cheap: true }); if (Pc.hidden || (Pc.x - cx) * (Pc.x - cx) + (Pc.z - cz) * (Pc.z - cz) > rc) return;
      e.set(0, Pc.h || 0, 0); q.setFromEuler(e); p3.set(Pc.x, Pc.y, Pc.z); m4.compose(p3, q, s3); MC.setMatrixAt(nc++, m4); });
    MC.count = nc; B.cartsShown = nc; MC.instanceMatrix.needsUpdate = true;
    B.resolved = SIM.lazyResolved || 0;
  });
};

/* a day run headless (verify.py, the report's check): the clock held, every minute of `day` stepped from `h0` to `h1`
   with the motion clock moved on as the page moves it (VC.simSecPerMin: 18 s a minute), the census at `at` hours: what everyone does, what they wanted and did
   not get, the decisions still waiting, how many wanted to work and how many do; the steps' cost */
VC.simDay = function (day, h0, h1, at) {
  var C = VC.clock, run = C.running, spm = VC.simSecPerMin(); C.run(false); C.day = day; C.set(h0); SIM.jump();
  var ms = [], out = { day: day, weekday: SIM.weekday(), samples: {}, top: [] }, wantWork = function () { var n = 0, m = SIM.minute(); SIM.all('actor').forEach(function (a) { if (a.present && SIM.desire(a, m) === 'WORK') n++; }); return n; };
  for (var m = h0 * 60; m < h1 * 60; m++) {
    C.hour = m / 60; VC.motionT = (VC.motionT || 0) + spm;
    var ts = performance.now(), made = SIM.step(), d = performance.now() - ts; ms.push(d); out.top.push([m, Math.round(d), made]);
    if (m % 60 === 0 && at.indexOf(m / 60) >= 0) { var c = VC.simCensusNow(); out.samples[m / 60] = { by: c.by, unmet: c.unmet, visiting: c.visiting, pending: c.pending, moving: c.moving, wantWork: wantWork(),
      needs: SIM.NEED ? SIM.needsCensus(null).all : null }; }
  }
  ms.sort(function (a, b) { return a - b; }); out.top.sort(function (a, b) { return b[1] - a[1]; }); out.top = out.top.slice(0, 5);
  out.p50 = Math.round(ms[ms.length >> 1]); out.p90 = Math.round(ms[Math.floor(ms.length * 0.9)]); out.max = Math.round(ms[ms.length - 1]);
  VC.SIMRUN.last = SIM.minute(); C.run(run);
  return out;
};
