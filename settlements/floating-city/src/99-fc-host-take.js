// ================================================================= FLOATING CITY — Preset Views, Tidal Controls, Host Checks & KHOST.take [web]
const VIEWS = {};

(function () {
  'use strict';
  function safeY(x, z, minClear) {
    const dh = (typeof KDRAWN !== 'undefined' && KDRAWN.h) ? KDRAWN.h(x, z) : null;
    const g = Math.max(terrainH(x, z), dh == null ? -1e9 : dh, 6.0);
    return g + (minClear == null ? 10.0 : minClear);
  }

  function defView(name, pos, tgt) {
    const py = Math.max(pos[1], safeY(pos[0], pos[2], 12.0));
    VIEWS[name] = [pos[0], +py.toFixed(1), pos[2], tgt[0], tgt[1], tgt[2]];
  }

  /* 9 Punctuation-free preset views showcasing every V3 district & floating Chinampa gardens */
  defView('overview',                   [-260, 620, 1820], [   0,  48,  120]);
  defView('sw-dyke-and-sumeru',         [-295,  48,  525], [   0,  58,  180]);
  defView('sumeru-mandala-aerial',      [ 255, 168,  575], [   0,  74,  180]);
  defView('suudme-tooka-pontoons',      [-220, 118, 1085], [ -60,  12,  660]);
  defView('floating-chinampa-gardens',  [ 865,  64, -425], [ 645,   4, -225]);
  defView('sea-ring-venetian-harbour',  [-755,  68,  395], [-920,  12,  260]);
  defView('bluff-waterfalls-hoists',    [ 636,  86, -835], [ 636,  46,-1225]);
  defView('amber-seal-suudme-bluff',    [ 245, 210,-1185], [ 320, 118,-1485]);
  defView('submarine-kolk-gallery',     [-175,  44,  395], [   0,   2,  180]);
})();

function setTideState(mode) {
  FC_STATE.tideMode = mode || 'clock';
  const S = FC_TIDE.setMode(mode === 'clock' ? null : mode);
  if (FC_ENV && FC_ENV.tideBinder) FC_ENV.tideBinder.update(0);
  if (FC_WORLD && FC_WORLD.FLOAT_HOST) FC_WORLD.FLOAT_HOST.update(S.lagoonY);
  if (FC_WORLD && FC_WORLD.MEGA_SCENE) FC_WORLD.MEGA_SCENE.update(0, S);
  if (FC_WORLD && FC_WORLD.PONTOON_SCENE) FC_WORLD.PONTOON_SCENE.update(0, S);
  if (FC_WORLD && FC_WORLD.STREETS_MOLE_SCENE) FC_WORLD.STREETS_MOLE_SCENE.update(0);
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
      gardens: FC_WORLD.PLANS.gardens.length,
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
      ok: A.ok && A.totalLots >= 2200 && A.unsupportedLots === 0 && A.overlaps === 0 && rErr === 0 && kErr === 0,
      detail: 'lots=' + A.totalLots + ' (suudme=' + A.suudmeCount + ', lowerRia=' + A.lowerRiaCount + ', upperRia=' + A.upperRiaCount + '), avgPontoonLots=' + A.avgPontoonLots + ', unsupported=' + A.unsupportedLots + ', overlaps=' + A.overlaps
    };
  },
  'tsunami-trimline-and-dwell': function () {
    const A = FC_CITY.auditLayout(FC_WORLD.PLANS);
    const badWoody = (typeof DOUBLEDELTA !== 'undefined' && DOUBLEDELTA.LOG)
      ? DOUBLEDELTA.LOG.filter(function (e) { return e.woody && e.y < FC_SITE.WOODY_TRIM_Y - 0.5; }).length
      : 0;
    const hoistsOnMoles = FC_SITE.CLIFF_HOISTS.every(function (h) { return !!FC_SITE.isOnMole(h.x0, h.z0, 4.0); });
    return {
      ok: A.badMainlandDwell === 0 && badWoody === 0 && hoistsOnMoles,
      detail: 'badMainlandDwell(<65m)=' + A.badMainlandDwell + ', badWoody(<38m)=' + badWoody + ', hoistsOnStoneMoles=' + hoistsOnMoles
    };
  },
  'pontoons-gardens-and-bascules-all-tides': function () {
    const prev = FC_TIDE.getMode();
    const states = ['ebb', 'slack', 'flood', 'surge'];
    const allFloat = FC_WORLD.PONTOON_SCENE.allFloatWards;
    let allOk = true, maxPitch = 0;
    for (let i = 0; i < states.length; i++) {
      const S = FC_TIDE.setMode(states[i]);
      const F = KCITY.auditFloatFleet(allFloat, FC_WORLD.PLANS.bascules, S.lagoonY, FC_WORLD.PONTOON_SCENE.fixedY);
      if (!F.ok) allOk = false;
      if (F.maxAbsPitchDeg > maxPitch) maxPitch = F.maxAbsPitchDeg;
    }
    FC_TIDE.setMode(prev);
    const nP = FC_WORLD.PLANS.pontoons.length;
    const nG = FC_WORLD.PLANS.gardens.length;
    return {
      ok: allOk && nP >= 28 && nG >= 12,
      detail: nP + ' neighborhood pontoons + ' + nG + ' chinampa garden rafts afloat, 0 grounded, max |bascule pitch|=' + maxPitch.toFixed(2) + ' deg <= 12 deg'
    };
  },
  'khaz-tide-bench-and-races': function () {
    const prev = FC_TIDE.getMode();
    const bench = FC_WORLD.HAZARD_RECS[0], lock = FC_WORLD.HAZARD_RECS[1];
    const bx = bench.at[0], bz = bench.at[2];
    FC_TIDE.setMode('ebb');
    const sEbb = KHAZ.state(bench, 0, null, bx, bz, 4.3);
    const rEbb = KHAZ.state(lock, 0, null, lock.at[0], lock.at[2], -6.0);
    FC_TIDE.setMode('flood');
    const sFlood = KHAZ.state(bench, 0, null, bx, bz, 4.3);
    FC_TIDE.setMode('drawdown');
    const sDraw = KHAZ.state(bench, 0, null, bx, bz, 4.3);
    FC_TIDE.setMode('slack');
    const rSlack = KHAZ.state(lock, 0, null, lock.at[0], lock.at[2], -1.5);
    FC_TIDE.setMode(prev);
    const good = sEbb.state === 'dry' && sFlood.state === 'submerged' && sDraw.state === 'drawdown' && sDraw.warn && rSlack.state === 'slack' && rEbb.state === 'ebb-race';
    return {
      ok: good,
      detail: 'ghat=' + sEbb.state + '->' + sFlood.state + '/' + sDraw.state + ', lock=' + rSlack.state + '->' + rEbb.state
    };
  },
  'submarine-vault-voth-trades-and-chinampa-sim': function () {
    const ia = FC_INTERIORS.auditUndergroundAndPortals(false);
    const active = FC_TRADES.filter(function (t) { return !t.na; }).length;
    const na = FC_TRADES.filter(function (t) { return !!t.na; }).length;
    const econ = FC_WORLD.SIM_OUT && FC_WORLD.SIM_OUT.proof30;
    return {
      ok: ia.ok && active === 41 && na === 3 && !!(econ && econ.ok && econ.simUrbanPop >= 36000 && econ.farmYield.chinampaCount >= 12),
      detail: 'pop=' + (econ ? econ.simUrbanPop : 0) + ', chinampas=' + (econ ? econ.farmYield.chinampaCount : 0) + ', vaultLeaks=' + ia.vaultLeaks + ', trades=' + active + '/44, 30d minStock=' + (econ ? econ.minKey + ':' + econ.minVal : 'n/a')
    };
  },
  'upper-surface-zfight-and-bridge-audit': function () {
    const Z = FC_WORLD.auditSceneZFights();
    const B = FC_CITY.auditBascules(FC_WORLD.PLANS);
    const S = FC_CITY.auditSlabsAndWays(FC_WORLD.PLANS);
    const ok = !!(Z && Z.ok && B && B.ok && S && S.ok);
    const detail = 'scannedTris=' + Z.scannedTris + ', zFightConflicts=' + Z.conflicts +
      (Z.conflicts > 0 ? (' sample=' + JSON.stringify(Z.sample)) : '') +
      ', bascules=' + B.count + ' (clippedHull=' + B.clippedHull + ', hitLot=' + B.hitLot + ', maxSpan=' + B.maxDeckLen + 'm)' +
      ', slabOverlaps=' + S.slabOverlaps + ', wayOverlaps=' + S.wayOverlaps;
    return { ok: ok, detail: detail };
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
    const p = KCITY.floatPose({ id: 'bad_ward', x: 0, z: 0, draftM: 3.4, freeboardM: 2.3, bedY: -2.0 }, -1.8);
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
  /* 5. Disabling Chinampa floating gardens starves dye_indigo & food stocks */
  {
    const noChinampa = FC_SIM.createEconomy({ disableGardens: true }).runDays(30);
    R.push({ name: 'disabling Chinampa floating gardens starves 44k capital stocks', failed: !noChinampa.ok, detail: 'min=' + noChinampa.minKey + ':' + noChinampa.minVal });
  }
  /* 6. Coplanar upper-surface horizontal z-fight caught by world-space triangle scanner */
  {
    const badZ = FC_WORLD.auditSceneZFights({ injectFault: true });
    R.push({ name: 'coplanar upper-surface z-fight triangle pair caught', failed: !badZ.ok && badZ.conflicts > 0, detail: 'conflicts=' + badZ.conflicts });
  }
  /* 7. Unclipped center-to-center bascule bridge caught */
  {
    const pA = FC_WORLD.PLANS.pontoons[0], pB = FC_WORLD.PLANS.pontoons[1];
    const badB = FC_CITY.auditBascules(FC_WORLD.PLANS, [{
      id: 'bad_center', from: pA.id, to: pB.id, x0: pA.x, z0: pA.z, x1: pB.x, z1: pB.z,
      deckLen: Math.hypot(pB.x - pA.x, pB.z - pA.z)
    }]);
    R.push({ name: 'unclipped center-to-center bascule bridge rejected', failed: !badB.ok && badB.clippedHull > 0, detail: 'clippedHull=' + badB.clippedHull });
  }
  /* 8. Coplanar pontoon corner-slab & crossing-lane overlap caught */
  {
    const badS = FC_CITY.auditSlabsAndWays(FC_WORLD.PLANS, { injectOverlap: true });
    R.push({ name: 'coplanar pontoon slab and crossing-lane overlap rejected', failed: !badS.ok && badS.slabOverlaps > 0, detail: 'slabOverlaps=' + badS.slabOverlaps + ', lowLaneSteps=' + badS.lowLaneSteps });
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
  hint: 'Imperial Ria Sound Capital (44,000 pop, 2,698 lots, 2,040 m Sea-Ring): 4-Tier Sumeru Mandala, 30 Multi-Shape Neighborhood Pontoons, 20 Chinampa Floating Gardens, 4 Multi-Row Boulevard-Dykes & 9-Avenue Bluff Metropolis',
  scene: scene,
  camera: camera,
  renderer: renderer,
  ground: terrainH,
  walk: typeof KWALK !== 'undefined' ? KWALK : null,
  clear: 1.8,
  minR: 3,
  maxR: 12000,
  views: VIEWS,
  ticks: HOST_TICKS,
  clock: { hour: 10.2, onSet: function () {} },
  draw: function () {
    if (FC_ENV && FC_ENV.skyHandle && FC_ENV.skyHandle.render) FC_ENV.skyHandle.render();
  },
  stats: function () {
    const S = FC_TIDE.sample(0);
    return 'tide ' + FC_STATE.tideMode + ' (sound ' + S.outerY.toFixed(1) + 'm / lagoon ' + S.lagoonY.toFixed(1) + 'm · ' + S.turbineMW + ' MW) · lots ' + FC_WORLD.PLANS.lots.length + ' · chinampas ' + FC_WORLD.PLANS.gardens.length;
  },
  layers: {
    'flora and fauna': { match: function (o) { return !!(o.userData && o.userData.biome); } },
    'far country': { match: function (o) { return !!(o.userData && o.userData.farField); } }
  },
  exporters: { tags: function () { return KTAGS.page.export(); } },
  api: {
    hostChecks: fcHostChecksList,
    hostNegatives: fcHostNegativesList,
    auditSceneZFights: FC_WORLD.auditSceneZFights,
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
