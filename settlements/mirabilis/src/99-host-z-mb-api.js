// prefix: mb
/* ================================================================= MIRABILIS — Host API, Live Multi-Kit/Hydraulic/SIM Checks & Night Hook ([web]) */

KHOST.cam.maxR = 7500;
if (typeof sun !== 'undefined' && sun.shadow) {
  sun.shadow.mapSize.set(1024, 1024);
  var mbSc = sun.shadow.camera;
  mbSc.left = -180; mbSc.right = 180; mbSc.top = 180; mbSc.bottom = -180;
  mbSc.near = 20; mbSc.far = 750;
  mbSc.updateProjectionMatrix();
}
KHOST.on(function () {
  if (typeof sun === 'undefined' || !KHOST.cam || !KHOST.cam.ctl) return;
  var tg = KHOST.cam.ctl.walk ? camera.position : KHOST.cam.ctl.target;
  sun.target.position.set(tg.x, tg.y, tg.z);
  sun.position.set(tg.x + LIGHTDIR.x * 300, tg.y + LIGHTDIR.y * 300, tg.z + LIGHTDIR.z * 300);
  sun.target.updateMatrixWorld();
}, 'view');
if (qs.get('night') === '1') {
  nightSet(true);
}

{
  var _mbGlCtx = renderer && renderer.getContext ? renderer.getContext() : null;
  var _mbDbg = _mbGlCtx && _mbGlCtx.getExtension ? _mbGlCtx.getExtension('WEBGL_debug_renderer_info') : null;
  var _mbRenStr = (_mbDbg && _mbGlCtx.getParameter(_mbDbg.UNMASKED_RENDERER_WEBGL)) || '';
  var _mbIsSoftGL = /SwiftShader|llvmpipe|Software/i.test(String(_mbRenStr));
  var _mbLastDrawSig = '';
  var _mbSoftDraws = 0;
  var _mbSkipFrame = false;

  if (_mbIsSoftGL && renderer && renderer.render && renderer.clear) {
    var _mbOrigClear = renderer.clear.bind(renderer);
    var _mbOrigRender = renderer.render.bind(renderer);
    renderer.clear = function () {
      camera.updateMatrixWorld();
      var e = camera.matrixWorld.elements;
      var tp = window._texPending == null ? 0 : window._texPending;
      var sig = e[0].toFixed(4) + ',' + e[5].toFixed(4) + ',' + e[10].toFixed(4) + ',' +
                e[12].toFixed(2) + ',' + e[13].toFixed(2) + ',' + e[14].toFixed(2) + '|' +
                (tp > 0 ? 'p' : '0') + '|' + (NIGHT && NIGHT.on ? 1 : 0) + '|' +
                (ANIMU && ANIMU.uCut ? ANIMU.uCut.value : 0) + '|' +
                (MB_SIM_PIN == null ? 'a' : MB_SIM_PIN);
      if ((_mbSoftDraws >= 1 && tp > 0) || (_mbSoftDraws >= 2 && sig === _mbLastDrawSig)) {
        _mbSkipFrame = true;
        return;
      }
      _mbSkipFrame = false;
      _mbLastDrawSig = sig;
      _mbSoftDraws++;
      return _mbOrigClear.apply(renderer, arguments);
    };
    renderer.render = function () {
      if (_mbSkipFrame) return;
      return _mbOrigRender.apply(renderer, arguments);
    };
  }

  var _mbOrigGo = KHOST.go ? KHOST.go.bind(KHOST) : null;
  if (_mbOrigGo) {
    KHOST.go = function (name) {
      if (qs.get('night') !== '1') {
        nightSet(name === 'Night katabatic lanterns');
      }
      if (name === 'Fulcrum escarpment hoist' && MB_SIM_PIN === null) {
        MB_SIM_T = 42.0;
        mbStepDynamics(MB_SIM_T);
      }
      var out = _mbOrigGo(name);
      if (_mbIsSoftGL && renderer && renderer.clear && renderer.render) {
        _mbLastDrawSig = '';
        renderer.clear();
        renderer.render(skyScene, skyCam);
        renderer.render(scene, camera);
      }
      return out;
    };
  }
}

function mbRunSettlementChecks() {
  var P = MB_PLAN;
  var C = P.census;

  /* 1. Multi-kit census, 47/47 Hayrant pieces, 41/41 Voth-census trades & <= 0.50 m mixed-avenue cornice delta */
  var kitsOk = C.totalLots >= 450 && C.missingHyKeys.length === 0 && C.unstaffedTrades.length === 0 &&
               C.hayrantShare >= 0.68 && C.hayrantShare <= 0.88 && C.byKit.eternian >= 80;
  var corniceOk = P.avenuePairs.length === 10 && P.maxCorniceDelta <= 0.50;

  /* 2. Zero OBB overlaps & zero gorge/water intrusions */
  var overlaps = 0, gorgeHits = 0;
  for (var i = 0; i < P.lots.length; i++) {
    var a = P.lots[i];
    if (MB_GROUND.inCanyonVoid(a.x, a.z, 0.5)) gorgeHits++;
    for (var j = i + 1; j < P.lots.length; j++) {
      if (P.obbOverlap(a.obb, P.lots[j].obb)) overlaps++;
    }
  }

  /* 3. Hydraulics: monotonic rivers/leat + real core/water surfaces */
  var monoOk = MB_HYD.flowMonotonic(MB_HYD.YUT_UPPER_PTS) &&
               MB_HYD.flowMonotonic(MB_HYD.YUT_LOWER_PTS) &&
               MB_HYD.flowMonotonic(MB_HYD.MILL_LEAT_PTS);
  var waterOk = monoOk && MB_WATER_RECS.flows.length === 3 &&
                MB_WATER_RECS.falls.length === 2 && MB_WATER_RECS.still.length === 4;

  /* 4. KCONS rising sites, KCAMP caravan laager, KHAMLET villages & RES_ORE bindings */
  var consOk = MB_CONS_SITES.length === 5;
  var campOk = MB_CAMP_NODES.length >= 6;
  var hamletsOk = C.byWard.H1 >= 10 && C.byWard.H2 >= 10 && P.oreBindings.length >= 3;

  /* 5. Single-component KWALK graph across Moon-Bridge, all 6 wards & hamlets + KGROUND array active */
  var walkOk = P.walk.connected;
  var ledgerAudit = MB_HYD.auditLedger();

  return {
    ok: kitsOk && corniceOk && overlaps === 0 && gorgeHits === 0 && waterOk && consOk && campOk && hamletsOk && walkOk && ledgerAudit.ok,
    kitsOk: kitsOk,
    corniceOk: corniceOk,
    maxCorniceDeltaM: P.maxCorniceDelta,
    avenuePairs: P.avenuePairs.length,
    obbOverlaps: overlaps,
    gorgeHits: gorgeHits,
    waterOk: waterOk,
    flows: MB_WATER_RECS.flows.length,
    falls: MB_WATER_RECS.falls.length,
    stillPools: MB_WATER_RECS.still.length,
    consSites: MB_CONS_SITES.length,
    campTents: MB_CAMP_NODES.length,
    oreBindings: P.oreBindings.length,
    walkConnected: walkOk,
    walkNodes: P.walk.total,
    simConserved: ledgerAudit.ok,
    citizens: MB_CITIZENS.actors.length,
    flora: MB_FLORA_STATS,
    census: C
  };
}

Object.assign(ENGINE_API, {
  hostChecks: function () {
    var mc = mbRunSettlementChecks();
    var tg = SVTAGS ? SVTAGS.audit() : { unknown: 1 };
    return {
      ok: mc.ok && tg.unknown === 0 && ENGINE_API.nanSweep() === 0,
      mirabilis: mc,
      tags: tg,
      sites: SITES.length,
      records: REG.length
    };
  },
  mirabilisChecks: mbRunSettlementChecks,
  hoistState: function (t) { return MB_HYD.hoistState(t == null ? MB_SIM_T : +t); },
  setHoistPhase: function (sec) {
    MB_SIM_PIN = sec == null ? null : +sec;
    if (MB_SIM_PIN !== null) {
      MB_SIM_T = MB_SIM_PIN;
      mbStepDynamics(MB_SIM_T);
    }
    return MB_SIM_T;
  },
  simLedger: function () { return MB_HYD.SIM_LEDGER; },
  plan: function () { return MB_PLAN; },
  view: function (name) { return KHOST.go(name); }
});
if (window._api) Object.assign(window._api, ENGINE_API);
window._ready = true;
