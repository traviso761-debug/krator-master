// ================================================================= JIMJAM — KHOST Takeover, 8 Preset Views & Runtime Audits
// [web] Hands Jimjam (st5e01l76v, px 745, py 546, +486.2 m ASL, 50,000 urban + 8,500 handu) to core/host (KHOST.take)
// with 8 preset views (zero apostrophes or colons: VIEW-NAME), summer-solstice (-34.34 deg S), normal oil-lit night, and
// Double-Dark fire-out vigil clock switching, plus hostChecks and hostNegatives.
const VIEWS = (function () {
  const L = JJ_LAYOUT.plan;
  const G = JJ_GROUND;
  const eyeY = function (x, z, lift) {
    const d = KDRAWN.h(x, z);
    const g = G.h(x, z);
    return Math.max(d == null ? g : d, g) + lift;
  };

  const sol = L.solstice;
  const ep = sol.ephemeris;
  const solEye = (typeof JJ_TEMPLE_OBS !== 'undefined' && JJ_TEMPLE_OBS && JJ_TEMPLE_OBS.eye) ? JJ_TEMPLE_OBS.eye : sol.eyeWorld;
  const lookDist = 150.0;
  const solTar = [
    solEye[0] + ep.sunDir[0] * lookDist,
    solEye[1] + ep.sunDir[1] * lookDist,
    solEye[2] + ep.sunDir[2] * lookDist
  ];

  return {
    'Overview': [-320, eyeY(-320, -1960, 540), -1960, 60, G.h(60, -160) + 18, -160],
    'Summer solstice sunset': [solEye[0], solEye[1], solEye[2], solTar[0], solTar[1], solTar[2]],
    'The Sunray Plaza and Rajas Palace': [-68, eyeY(-68, -118, 28), -118, 38, G.h(38, 28) + 18, 28],
    'Lotus Harbour and Great Trough Lake': [-662, eyeY(-662, -1845, 42), -1845, -650, G.h(-650, -1625) + 8, -1625],
    'White-Pass trans-rim compound': [362, eyeY(362, -1480, 30), -1480, 335, G.h(335, -1350) + 12, -1350],
    'Former Izani enclave and Dilihan row': [785, eyeY(785, 615, 30), 615, 885, G.h(885, 755) + 12, 755],
    'The Great Pilgrims Market and Thirteen Temple': [-215, eyeY(-215, 1185, 38), 1185, 20, G.h(20, 760) + 14, 760],
    'Double Dark vigil': [-180, eyeY(-180, -210, 58), -210, -780, G.h(-780, -100) + 18, -100]
  };
})();

KHOST.on(SKY.view, 'view');

let jjCurDay = 0;
let jjCurHour = 10.4;
function jjOnView(name) {
  const hc = KHOST.host && KHOST.host.clock ? KHOST.host.clock : null;
  if (!hc) return;
  let wantDay = 0;
  let wantHour = 10.4;
  let wantNight = false;
  let wantDoubleDark = false;
  if (name === 'Double Dark vigil') {
    wantDay = 0;
    wantHour = 0.5;
    wantNight = true;
    wantDoubleDark = true;
  } else if (name === 'Summer solstice sunset') {
    const ep = JJ_LAYOUT.plan.solstice.ephemeris;
    wantDay = ep.dayCount;
    wantHour = ep.hour;
    wantNight = false;
    wantDoubleDark = false;
  }
  const changed = (jjCurDay !== wantDay || Math.abs(jjCurHour - wantHour) > 0.005 ||
                   NIGHT !== wantNight || DOUBLE_DARK !== wantDoubleDark);
  jjCurDay = wantDay;
  jjCurHour = wantHour;
  NIGHT = wantNight;
  DOUBLE_DARK = wantDoubleDark;
  if (changed) {
    hc.day = wantDay;
    hc.set(wantHour);
    if (JJ_PLACE && JJ_PLACE.night && typeof JJ_PLACE.night.sync === 'function') {
      JJ_PLACE.night.sync();
    }
    SKY.view(0);
  }
}

function jimjamChecks() {
  const L = JJ_LAYOUT.plan;
  const R = [];
  const rules = JJ_RULES.checks(L);
  for (let i = 0; i < rules.length; i++) {
    const c = rules[i];
    R.push({ name: 'layout: ' + c.name, ok: !!c.pass, detail: String(c.detail || '').trim() });
  }

  const totalExpected = L.structures.length + L.walls.length;
  R.push({
    name: 'every structure, vessel and circuit wall placed with zero missing keys',
    ok: JJ_PLACE.missing.length === 0 && JJ_PLACE.placed.length === totalExpected,
    detail: JJ_PLACE.placed.length + ' placed of ' + totalExpected +
      (JJ_PLACE.missing.length ? '; missing: ' + JJ_PLACE.missing.join(', ') : '') +
      ' (' + JJ_PLACE.ms + ' ms)'
  });

  /* Runtime ATMOS.skyState + JJ_TEMPLE_OBS world-space solstice portal alignment */
  let rtSolOk = false;
  let rtSolDetail = 'missing ATMOS or JJ_TEMPLE_OBS';
  if (typeof ATMOS !== 'undefined' && ATMOS.skyState && ATMOS.skySite && typeof JJ_TEMPLE_OBS !== 'undefined' && JJ_TEMPLE_OBS) {
    const ep = L.solstice.ephemeris;
    const sd = ATMOS.skyState(ATMOS.skySite, ep.hour, ep.dayCount).sunDir;
    const obs = JJ_TEMPLE_OBS;
    const dx = obs.archOrigin[0] - obs.eye[0];
    const dz = obs.archOrigin[2] - obs.eye[2];
    const denom = dx * obs.archNormal[0] + dz * obs.archNormal[2];
    const rayFwd = sd[0] * obs.archNormal[0] + sd[2] * obs.archNormal[2];
    const t = rayFwd > 1e-5 ? denom / rayFwd : -1;
    const hx = obs.eye[0] + sd[0] * t - obs.archOrigin[0];
    const hy = obs.eye[1] + sd[1] * t - obs.archOrigin[1];
    const hz = obs.eye[2] + sd[2] * t - obs.archOrigin[2];
    const u = hx * obs.archRight[0] + hz * obs.archRight[2];
    const altDeg = Math.asin(Math.max(-1, Math.min(1, sd[1]))) * 180 / Math.PI;
    rtSolOk = t > 0 && Math.abs(u) <= 3.8 && hy >= 4.0 && hy <= 15.2 && altDeg > ep.horizonAltDeg + 1.2;
    rtSolDetail = 'ATMOS sunAlt=' + altDeg.toFixed(2) + ' deg > horizon ' + ep.horizonAltDeg.toFixed(2) +
      ' deg; JJ_TEMPLE_OBS hit u=' + u.toFixed(2) + ' m, v=' + hy.toFixed(2) + ' m';
  }
  R.push({
    name: 'runtime ATMOS + JJ_TEMPLE_OBS solstice portal ray',
    ok: rtSolOk,
    detail: rtSolDetail
  });

  R.push({
    name: 'water drawn on Great Trough Lake (+429.78 m), Monsoon Canal & 4 stepped intramural Lotus/Tar-Sea Tanks',
    ok: !!(JJ_PLACE.water.lake && JJ_PLACE.water.canal && JJ_PLACE.water.still.length >= 4),
    detail: 'lake=1, canal=1, stillTanks=' + JJ_PLACE.water.still.length
  });

  const kgLayers = (JJ_STAGE.groundMat && JJ_STAGE.groundMat.userData && JJ_STAGE.groundMat.userData.kground)
    ? JJ_STAGE.groundMat.userData.kground.length : 0;
  const pvTris = JJ_PLACE.paved ? JJ_PLACE.paved.tris : 0;
  const flTrees = JJ_PLACE.flora ? (JJ_PLACE.flora.trees || 0) : 0;
  const flPark = JJ_PLACE.flora ? (JJ_PLACE.flora.park || 0) : 0;
  const flAve = JJ_PLACE.flora ? (JJ_PLACE.flora.avenue || 0) : 0;
  const flClip = JJ_PLACE.flora ? (JJ_PLACE.flora.clipCount == null ? 999 : JJ_PLACE.flora.clipCount) : 999;
  const flMinClr = JJ_PLACE.flora ? (JJ_PLACE.flora.minClearanceM || 0) : 0;
  R.push({
    name: '3D PBR paved streets, KGROUND nwlowlands ground, 6 curbed parks & zero-clipping boulevard/park flora',
    ok: kgLayers >= 5 && pvTris >= 4000 && flTrees >= 180 && flPark >= 50 && flAve >= 40 && flClip === 0,
    detail: 'kgroundLayers=' + kgLayers + ', pavedTris=' + Math.round(pvTris) +
      ', trees=' + flTrees + ' (park=' + flPark + ', avenue=' + flAve + '), clips=' + flClip +
      ' (minStructClear=' + flMinClr + 'm)'
  });

  const A = JJ_PLACE.tags.audit();
  R.push({
    name: 'tags: zero unknown keys or values across all records',
    ok: A.unknown === 0 && A.missingCulture === 0 && A.records >= totalExpected,
    detail: A.records + ' records, unknown ' + A.unknown + ', missingCulture ' + A.missingCulture
  });

  /* P4: ROOM() + KFURN indexed interiors, operable KDOOR portals & cutaway units */
  const ix = typeof JJ_INTERIORS !== 'undefined' ? JJ_INTERIORS : null;
  const nDoors = (typeof KDOOR !== 'undefined' && KDOOR && KDOOR.list) ? KDOOR.list.length : 0;
  const audFails = (window._interiors && window._interiors.auditFails) ? window._interiors.auditFails : 0;
  R.push({
    name: 'P4: ROOM() + KFURN indexed interiors, operable KDOOR portals & cutaway units',
    ok: !!(ix && ix.units.length >= 12 && ix.rooms.length >= 24 && ix.placed.length >= 60 && nDoors >= 25 && audFails === 0),
    detail: ix
      ? ('units=' + ix.units.length + ', rooms=' + ix.rooms.length + ', pieces=' + ix.placed.length +
         ', doors=' + nDoors + ', auditFails=' + audFails)
      : 'missing JJ_INTERIORS'
  });

  /* P4: JJ1 core/simulation, peoples.json crowds, Republican minder, 6 pilgrim streams & KSCHED */
  const lf = (typeof JJ_LIFE !== 'undefined' && JJ_LIFE && JJ_LIFE.counts) ? JJ_LIFE.counts() : null;
  const sm = lf && lf.sim ? lf.sim : null;
  R.push({
    name: 'P4: JJ1 core/simulation, peoples.json crowds, Republican minder & KSCHED timetables',
    ok: !!(sm && sm.available && sm.actors >= 500 && sm.republicMinders >= 4 && sm.whitePassActors >= 20 &&
           sm.kauntavans >= 40 && sm.schedBarges === 3 && sm.schedCaravans === 2 && sm.ledgerOk),
    detail: sm
      ? ('actors=' + sm.actors + ' (drawn=' + lf.drawnActors + '), kauntavans=' + sm.kauntavans +
         ', republicMinders=' + sm.republicMinders + ', whitePass=' + sm.whitePassActors +
         ', schedBarges=' + sm.schedBarges + ', schedCaravans=' + sm.schedCaravans +
         ', ledgerOk=' + sm.ledgerOk)
      : 'missing JJ_LIFE / SIM'
  });

  /* P5: core/export Godot world tile & 14-section profile check */
  const ex = (typeof JJ_EXPORT !== 'undefined' && JJ_EXPORT && JJ_EXPORT.verifyTile) ? JJ_EXPORT.verifyTile() : null;
  R.push({
    name: 'P5: core/export Godot world tile & 14-section profile check',
    ok: !!(ex && ex.ok),
    detail: ex
      ? ('ok=' + ex.ok + ', items=' + (ex.stats ? ex.stats.items : 0) + ', buckets=' + (ex.stats ? ex.stats.buckets : 0) +
         ', records=' + (ex.stats ? ex.stats.records : 0) + ', problems=' + ex.problems.length +
         (ex.problems.length ? ' (' + ex.problems.slice(0, 3).join('; ') + ')' : '') +
         (ex.errors.length ? ' errs=' + JSON.stringify(ex.errors.slice(0, 2)) : ''))
      : 'missing JJ_EXPORT'
  });

  return R;
}

function jimjamNegatives() {
  const base = JJ_LAYOUT.plan;
  const clone = function (p) { return JSON.parse(JSON.stringify(p)); };
  const R = [];

  /* 1. Unparameterized -40.0 deg S placeholder latitude must fail solsticeCheck */
  const badLat = clone(base);
  badLat.solstice.ephemeris = badLat.solstice.placeholder40STrap;
  R.push({
    name: 'placeholder -40.0 deg S sky latitude fails -34.34 deg S solsticeCheck',
    ok: JJ_RULES.solsticeCheck(base).pass && !JJ_RULES.solsticeCheck(badLat).pass
  });

  /* 2. Shifting Sunray Plaza off the 85.0 m join must fail palaceAndCelestialCheck */
  const badSeam = clone(base);
  for (let i = 0; i < badSeam.structures.length; i++) {
    if (badSeam.structures[i].id === 'lm.palace_plaza') badSeam.structures[i].x += 5.0;
  }
  R.push({
    name: '5.0 m Palace-Sunray Plaza offset fails palaceAndCelestialCheck',
    ok: JJ_RULES.palaceAndCelestialCheck(base).pass && !JJ_RULES.palaceAndCelestialCheck(badSeam).pass
  });

  /* 3. Collapsing White-Pass compound next to Eternian Lotus Water-Gate must fail whitePassAndDilihanMixCheck */
  const badWp = clone(base);
  for (let i = 0; i < badWp.structures.length; i++) {
    if (badWp.structures[i].id === 'lm.whitepass_compound') {
      badWp.structures[i].x = -620;
      badWp.structures[i].z = -1560;
    }
  }
  R.push({
    name: 'co-locating White-Pass compound with Eternian Water-Gate fails whitePassAndDilihanMixCheck',
    ok: JJ_RULES.whitePassAndDilihanMixCheck(base).pass && !JJ_RULES.whitePassAndDilihanMixCheck(badWp).pass
  });

  /* 4. Unfilled section in core/export profile must fail EXPORT.check */
  let expNegOk = false;
  if (typeof EXPORT !== 'undefined' && EXPORT && typeof JJ_EXPORT !== 'undefined' && JJ_EXPORT.available) {
    const emptyWorld = EXPORT.world({ build: 'jimjam-neg', sections: ['city'] });
    const badChk = EXPORT.check(emptyWorld, { profile: ['city', 'sim'] });
    expNegOk = JJ_EXPORT.verifyTile().ok && !badChk.ok;
  }
  R.push({
    name: 'missing required sim section in core/export profile fails EXPORT.check',
    ok: expNegOk
  });

  return R;
}

KHOST.take((typeof KHOST.standard === 'function' ? KHOST.standard : function (o) { return o; })({
  build: 'jimjam',
  title: 'Jimjam',
  hint: 'Jimjam / Jimjam-Pattinam (pin st5e01l76v, px 745, py 546; +486.2 m ASL above +429.78 m Great Trough Lake, 1.51 atm): Voth-sized 50,000-person royal metropolis of the Three Wheels + 8,500 handu hinterland (settlements/jimjam/SITE-BLUEPRINT.md). Eight Celestial Districts (Sun, Companion, Giant, Two-Day, Week, Thirteen, Four-Day, Day) with astrologically aligned Moon Temples, 6 Planetary Shrines, Raja Palace + 85 m flush Sunray Plaza, Raja Eye observatory, Order of Historians chapterhouse, Decayed Izani Governor House surrounded by Dilihan & Iziz Vernacular buildings, separate White-Pass compound for Khaayken Yeti & Yonni/Rian scholars, Great Pilgrims Market, and 6 handu hinterland villages.',
  scene: scene,
  camera: camera,
  renderer: renderer,
  ground: function (x, z) { return JJ_GROUND.h(x, z); },
  walk: typeof KWALK !== 'undefined' ? KWALK : null,
  clear: 1.7,
  minR: 2,
  maxR: 16000,
  probeSample: 250000,
  registry: REG,
  views: VIEWS,
  onView: jjOnView,
  start: 'Overview',
  ticks: TICKS,
  clock: { hour: 10.4 },
  draw: SKY.draw,
  records: function () { return JJ_PLACE.tags.query({}); },
  cutaway: (typeof JJ_INTERIORS !== 'undefined' && JJ_INTERIORS.units && JJ_INTERIORS.units.length)
    ? { units: JJ_INTERIORS.units, cutAt: 1.5, margin: 1.6 }
    : null,
  holds: (typeof SIM !== 'undefined' && typeof KHOST.simHolds === 'function')
    ? KHOST.simHolds(SIM)
    : null,
  std: {
    door: function () {
      if (typeof KDOORHOST !== 'undefined' && KDOORHOST.toggleNear) {
        KDOORHOST.toggleNear(camera.position, !!(KHOST.cam && KHOST.cam.ctl && KHOST.cam.ctl.walk));
      }
    },
    night: {
      on: function () {
        NIGHT = !NIGHT;
        const hc = KHOST.host && KHOST.host.clock ? KHOST.host.clock : null;
        if (hc) hc.set(NIGHT ? 22.0 : 10.4);
        if (JJ_PLACE && JJ_PLACE.night && typeof JJ_PLACE.night.sync === 'function') JJ_PLACE.night.sync();
        SKY.view(0);
      },
      state: function () { return !!NIGHT; }
    }
  },
  stats: function () {
    const nAct = (typeof JJ_LIFE !== 'undefined' && JJ_LIFE.counts) ? JJ_LIFE.counts().drawnActors : 0;
    return 'inst ' + (window._instances == null ? 0 : window._instances) +
      '\nplaced ' + JJ_PLACE.placed.length +
      '\npop ' + JJ_LAYOUT.plan.census.urban + ' (+' + JJ_LAYOUT.plan.census.sliceHinterland + ')' +
      '\nlive ' + nAct;
  },
  minimap: { title: 'Jimjam (+486 m ASL)' },
  budget: { showcase: { tris: 48000000, calls: 3400 }, cls: {}, type: {} },
  api: {
    view: function (k) { return KHOST.go(k); },
    hostChecks: jimjamChecks,
    hostNegatives: jimjamNegatives,
    solsticeCheck: function () { return JJ_RULES.solsticeCheck(JJ_LAYOUT.plan); },
    exportTile: function () { return (typeof JJ_EXPORT !== 'undefined' && JJ_EXPORT.verifyTile) ? JJ_EXPORT.verifyTile() : null; },
    jimjam: function () {
      return {
        pin: JJ_LAYOUT.plan.pin,
        census: JJ_LAYOUT.plan.census,
        placed: JJ_PLACE.placed.length,
        missing: JJ_PLACE.missing,
        construct: JJ_PLACE.construct.length,
        interiors: window._interiors || null,
        sim: (typeof JJ_LIFE !== 'undefined' && JJ_LIFE.counts) ? JJ_LIFE.counts().sim : null,
        ms: JJ_PLACE.ms
      };
    }
  }
}));
