// ================================================================= FLOATING CITY — Preset Views, Tidal Controls, Host Checks & KHOST.take [web]
const VIEWS = {};

(function () {
  'use strict';
  function safeY(x, z, minClear) {
    const dh = (typeof KDRAWN !== 'undefined' && KDRAWN.h) ? KDRAWN.h(x, z) : null;
    const g = Math.max(terrainH(x, z), dh == null ? -1e9 : dh, 6.0);
    return g + (minClear == null ? 8.0 : minClear);
  }

  function defView(name, pos, tgt) {
    const py = Math.max(pos[1], safeY(pos[0], pos[2], 8.5));
    VIEWS[name] = [pos[0], +py.toFixed(1), pos[2], tgt[0], tgt[1], tgt[2]];
  }

  /* 8 Punctuation-free preset views (zero apostrophes, zero colons, 6-float [ex,ey,ez,tx,ty,tz] format) */
  defView('overview',                 [-180, 460, 1220], [  20,  42,   20]);
  defView('sumeru-mandala-aerial',    [ 195, 148,  415], [   0,  62,   80]);
  defView('suudme-tooka-pontoons',    [ 295,  42, -355], [ 215,   8, -225]);
  defView('lower-ria-naga-canal',     [-315,  44,  185], [-185,  10,  115]);
  defView('sea-ring-sector-lock',     [-795,  54,  285], [-670,  14,  215]);
  defView('bluff-waterfalls-hoists',  [ 465,  68, -560], [ 485,  48, -885]);
  defView('amber-seal-suudme-bluff',  [ 275, 168, -935], [ 275, 108, -1125]);
  defView('submarine-kolk-gallery',   [-138,  34,  242], [   0,   2,   80]);
})();

function setTideState(mode) {
  FC_STATE.tideMode = mode || 'clock';
  const S = FC_TIDE.setMode(mode === 'clock' ? null : mode);
  if (FC_ENV && FC_ENV.tideBinder) FC_ENV.tideBinder.update(0);
  if (FC_WORLD && FC_WORLD.FLOAT_HOST) FC_WORLD.FLOAT_HOST.update(S.lagoonY);
  if (FC_WORLD && FC_WORLD.MEGA_SCENE) FC_WORLD.MEGA_SCENE.update(0, S);
  if (FC_WORLD && FC_WORLD.PONTOON_SCENE) FC_WORLD.PONTOON_SCENE.update(0, S);
  FC_CHARS.update(0, FC_WORLD.PONTOON_SCENE.wardGroups);
  return S;
}

/* Register M6 EXPORT profile sections */
if (typeof EXPORT !== 'undefined' && EXPORT.register) {
  if (typeof KCITY !== 'undefined' && KCITY.registerExport) KCITY.registerExport();
  EXPORT.register('interiors', function () {
    return {
      halls: FC_INTERIORS.HALLS,
      audit: FC_INTERIORS.auditUndergroundAndPortals(false)
    };
  }, { by: 'floating-city' });
  EXPORT.register('fixtures', function () {
    return {
      doors: FC_WORLD.fixtureDoors,
      windows: FC_WORLD.fixtureWindows,
      hoists: FC_SITE.CLIFF_HOISTS,
      pontoons: FC_WORLD.PLANS.pontoons.length,
      bascules: FC_WORLD.PLANS.bascules.length
    };
  }, { by: 'floating-city' });
}

/* Host Invariant Checks & Paired Negative Fault-Injection Proofs for verify.py --assert */
const FC_HOST_CHECKS = {
  'multikit-suudme-ria': function () {
    const A = FC_CITY.auditLayout(FC_WORLD.PLANS);
    const rErr = (typeof RIK !== 'undefined' && RIK.errors) ? RIK.errors.length : 0;
    const kErr = (typeof KLK !== 'undefined' && KLK.errors) ? KLK.errors.length : 0;
    return {
      ok: A.ok && rErr === 0 && kErr === 0,
      detail: 'suudme=' + A.suudmeCount + ', lowerRia=' + A.lowerRiaCount + ', upperRia=' + A.upperRiaCount + ', overlaps=' + A.overlaps + ', kitErrs=' + (rErr + kErr)
    };
  },
  'tsunami-trimline-and-dwell': function () {
    const A = FC_CITY.auditLayout(FC_WORLD.PLANS);
    const badWoody = (typeof DOUBLEDELTA !== 'undefined' && DOUBLEDELTA.LOG)
      ? DOUBLEDELTA.LOG.filter(function (e) { return e.woody && e.y < FC_SITE.WOODY_TRIM_Y - 0.5; }).length
      : 0;
    return {
      ok: A.badMainlandDwell === 0 && badWoody === 0,
      detail: 'badMainlandDwell(<65m)=' + A.badMainlandDwell + ', badWoody(<38m)=' + badWoody
    };
  },
  'pontoons-and-bascules-all-tides': function () {
    const prev = FC_TIDE.getMode();
    const states = ['ebb', 'slack', 'flood', 'surge'];
    let allOk = true, maxPitch = 0;
    for (let i = 0; i < states.length; i++) {
      const S = FC_TIDE.setMode(states[i]);
      const F = KCITY.auditFloatFleet(FC_WORLD.PLANS.pontoons, FC_WORLD.PLANS.bascules, S.lagoonY, FC_WORLD.PONTOON_SCENE.fixedY);
      if (!F.ok) allOk = false;
      if (F.maxAbsPitchDeg > maxPitch) maxPitch = F.maxAbsPitchDeg;
    }
    FC_TIDE.setMode(prev);
    return {
      ok: allOk && FC_WORLD.PLANS.pontoons.length === 28,
      detail: '28 pontoons afloat, 0 grounded, max |bascule pitch|=' + maxPitch.toFixed(2) + ' deg <= 12 deg'
    };
  },
  'khaz-tide-bench-and-races': function () {
    const prev = FC_TIDE.getMode();
    const bench = FC_WORLD.HAZARD_RECS[0], lock = FC_WORLD.HAZARD_RECS[1];
    FC_TIDE.setMode('ebb');
    const sEbb = KHAZ.state(bench, 0, null, 340, -775, 4.3);
    const rEbb = KHAZ.state(lock, 0, null, lock.at[0], lock.at[2], -6.0);
    FC_TIDE.setMode('flood');
    const sFlood = KHAZ.state(bench, 0, null, 340, -775, 4.3);
    FC_TIDE.setMode('drawdown');
    const sDraw = KHAZ.state(bench, 0, null, 340, -775, 4.3);
    FC_TIDE.setMode('slack');
    const rSlack = KHAZ.state(lock, 0, null, lock.at[0], lock.at[2], -1.5);
    FC_TIDE.setMode(prev);
    const good = sEbb.state === 'dry' && sFlood.state === 'submerged' && sDraw.state === 'drawdown' && sDraw.warn && rSlack.state === 'slack' && rEbb.state === 'ebb-race';
    return {
      ok: good,
      detail: 'ghat=' + sEbb.state + '->' + sFlood.state + '/' + sDraw.state + ', lock=' + rSlack.state + '->' + rEbb.state
    };
  },
  'submarine-vault-and-voth-trades': function () {
    const ia = FC_INTERIORS.auditUndergroundAndPortals(false);
    const active = FC_TRADES.filter(function (t) { return !t.na; }).length;
    const na = FC_TRADES.filter(function (t) { return !!t.na; }).length;
    const econ = FC_WORLD.SIM_OUT && FC_WORLD.SIM_OUT.proof30;
    return {
      ok: ia.ok && active === 41 && na === 3 && !!(econ && econ.ok),
      detail: 'vaultLeaks=' + ia.vaultLeaks + ', trades=' + active + '/44 (+3 na), 30d minStock=' + (econ ? econ.minKey + ':' + econ.minVal : 'n/a')
    };
  }
};

function fcHostChecksList() {
  return Object.keys(FC_HOST_CHECKS).map(function (k) {
    const r = FC_HOST_CHECKS[k]();
    return { name: k, ok: !!r.ok, detail: r.detail };
  });
}

function fcHostNegativesList() {
  const R = [];
  /* 1. Overlapping floating lot OBB caught */
  {
    const col = FC_CITY.obbOverlap({ x: 100, z: 100, w: 26, d: 20, ry: 0 }, { x: 108, z: 104, w: 26, d: 20, ry: 0.1 }, 0.15);
    R.push({ name: 'overlapping pontoon building OBB rejected', failed: col === true, detail: 'overlap detected' });
  }
  /* 2. Shallow shoal grounding caught by KCITY.floatPose */
  {
    const p = KCITY.floatPose({ id: 'bad_ward', x: 0, z: 0, draftM: 3.2, freeboardM: 2.2, bedY: -2.0 }, -1.8);
    R.push({ name: 'pontoon grounded on shallow -2.0 m shoal caught', failed: p.grounded === true, detail: 'grounded=true' });
  }
  /* 3. Underground submarine Dynamo Hall sky leak caught */
  {
    const bad = FC_INTERIORS.auditUndergroundAndPortals(true);
    R.push({ name: 'submarine Dynamo Hall sky leak rejected', failed: !bad.ok, detail: 'vaultLeaks=' + bad.vaultLeaks });
  }
  /* 4. Sabotaged 30-day stock caught */
  {
    const badEcon = FC_SIM.createEconomy({ sabotageKey: 'electrics' }).runDays(30);
    R.push({ name: 'sabotaged negative stock caught by 30-day economy solver', failed: !badEcon.ok, detail: 'min=' + badEcon.minVal });
  }
  return R;
}

KHOST.on(function lodTick() {
  camera.updateMatrixWorld();
  if (FC_ENV && FC_ENV.skyHandle && FC_ENV.skyHandle.update) {
    FC_ENV.skyHandle.update(0);
    if (FC_ENV.skyHandle.state && BIO.setSun) BIO.setSun(FC_ENV.skyHandle.state.sunDir);
  }
  if (BIO.lodTick) BIO.lodTick(camera);
}, 'view');

let _fcLastMs = performance.now();
const HOST_TICKS = [function () {
  const nowMs = performance.now();
  const dt = Math.min(0.1, Math.max(0.001, (nowMs - _fcLastMs) * 0.001));
  _fcLastMs = nowMs;
  for (let i = 0; i < TICKS.length; i++) TICKS[i](nowMs, dt);
}];

KHOST.take({
  build: 'floating-city',
  title: 'The Floating City of Ria Sound',
  hint: 'Imperial Ria Sound Capital (24,000 pop, 0.75 g, 1.58 atm): Ancient Sumeru-Noahbabel Sea-Ring & -90 m Submarine Hydro-Dynamo, 28 Moon-Pool Pontoons, Suudme + Lower/Upper Ria Architecture',
  scene: scene,
  camera: camera,
  renderer: renderer,
  ground: terrainH,
  walk: typeof KWALK !== 'undefined' ? KWALK : null,
  clear: 1.8,
  minR: 3,
  maxR: 9500,
  views: VIEWS,
  ticks: HOST_TICKS,
  clock: { hour: 10.2, onSet: function () {} },
  draw: function () {
    if (FC_ENV && FC_ENV.skyHandle && FC_ENV.skyHandle.render) FC_ENV.skyHandle.render();
  },
  stats: function () {
    const S = FC_TIDE.sample(0);
    return 'tide ' + FC_STATE.tideMode + ' (sound ' + S.outerY.toFixed(1) + 'm / lagoon ' + S.lagoonY.toFixed(1) + 'm · ' + S.turbineMW + ' MW) · lots ' + FC_WORLD.PLANS.lots.length;
  },
  layers: {
    'flora and fauna': { match: function (o) { return !!(o.userData && o.userData.biome); } },
    'far country': { match: function (o) { return !!(o.userData && o.userData.farField); } }
  },
  exporters: { tags: function () { return KTAGS.page.export(); } },
  api: {
    hostChecks: fcHostChecksList,
    hostNegatives: fcHostNegativesList,
    setTideState: setTideState,
    setSubmarineCut: FC_WORLD.setSubmarineCut
  }
});

if (typeof document !== 'undefined') {
  const uiBar = document.getElementById('ui');
  if (uiBar) {
    [
      ['Low Ebb', 'ebb'],
      ['Slack Water', 'slack'],
      ['High Spring Flood', 'flood'],
      ['Ghost-Surge Drill', 'surge'],
      ['Drawdown Chime', 'drawdown']
    ].forEach(function (pair) {
      const btn = document.createElement('button');
      btn.textContent = pair[0];
      btn.onclick = function () { setTideState(pair[1]); };
      uiBar.appendChild(btn);
    });
    const cutBtn = document.createElement('button');
    cutBtn.textContent = 'Submarine Cut';
    cutBtn.onclick = function () { FC_WORLD.setSubmarineCut(!FC_STATE.cutSubmarine); };
    uiBar.appendChild(cutBtn);
  }
  window.addEventListener('keydown', function (ev) {
    if (ev.key === 'c' || ev.key === 'C') {
      FC_WORLD.setSubmarineCut(!FC_STATE.cutSubmarine);
    }
  });
}

FC_WORLD.attachShadow(KHOST.ui);
