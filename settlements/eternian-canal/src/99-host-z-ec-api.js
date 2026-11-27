// prefix: ec
// ================================================================= SHUANG-ZHA — Host API, live KCANAL hydraulic/street/vessel checks & night hook ([G data])

KHOST.cam.maxR = 6500;
if (qs.get('night') === '1') {
  nightSet(true);
}

{
  var _ecOrigGo = KHOST.go ? KHOST.go.bind(KHOST) : null;
  if (_ecOrigGo) {
    KHOST.go = function (name) {
      if (qs.get('night') !== '1') {
        nightSet(name === 'Night lanterns');
      }
      /* When jumping to 'Barge transiting lock', pin or reset EC_LOCK_T = 28 s if unpinned so the barge is right inside L1a_low! */
      if (name === 'Barge transiting lock' && EC_LOCK_PIN === null) {
        EC_LOCK_T = 28.0;
        ecStepHydraulics(EC_LOCK_T);
      }
      return _ecOrigGo(name);
    };
  }
}

/* Live in-browser hydraulic, street-intrusion, ward-population, vessel-tag & end-to-end lock-transit suite */
function ecRunCanalChecks() {
  var K = KCANAL;
  var pounds = EC_HYD.POUNDS;
  var monoOk = K.poundsMonotonic(pounds, 16.0);

  /* 1. Per-riser head <= 3.50 m and zero-head miter-gate law across all 8 chambers */
  var maxHead = 0, gateViolations = 0;
  for (var ci = 0; ci < EC_HYD.CHAMBERS.length; ci++) {
    var ch = EC_HYD.CHAMBERS[ci];
    if (ch.lift > maxHead) maxHead = ch.lift;
    for (var s = 0; s < 72; s++) {
      var ls = EC_HYD.lockState(ch, s * 5.0);
      if (!K.miterLawOk(ls)) gateViolations++;
    }
  }

  /* 2. Zero flooded lots (every lot padY >= adjacent pound wlev + 1.35 m) */
  var flooded = 0, minFreeboard = 1e9;
  for (var li = 0; li < EC_PLAN.lots.length; li++) {
    var lt = EC_PLAN.lots[li];
    var fb = lt.padY - lt.wlev;
    if (fb < minFreeboard) minFreeboard = fb;
    if (fb < 1.35 - 1e-3) flooded++;
  }

  /* 3. Zero OBB overlaps across all ward lots */
  var overlaps = 0;
  for (var a = 0; a < EC_PLAN.lots.length; a++) {
    for (var b = a + 1; b < EC_PLAN.lots.length; b++) {
      if (EC_PLAN.obbOverlap(EC_PLAN.lots[a].obb, EC_PLAN.lots[b].obb)) overlaps++;
    }
  }

  /* 4. Zero street-over-canal intrusions in ways AND zero KMASK road pixels on canals! */
  var streetAudit = K.streetClearOfCanals(EC_PLAN.ways, EC_HYD.NET, { margin: 0.6 });
  var maskAudit = EC_PLAN.roadMask ? EC_PLAN.roadMask.auditZeroOnCanals() : { ok: false, hits: 999 };

  /* 5. Full 6-ward street population (>= 88% frontage fill, 0 empty ways, balanced NW/NE/SW/SE quadrants) */
  var fr = EC_PLAN.frontage;
  var ql = fr.quadrantLots;
  var wardsPopulated = fr.fillRatio >= 0.88 && fr.emptyWays === 0 &&
    ql.NW >= 80 && ql.NE >= 80 && ql.SW >= 80 && ql.SE >= 80;

  /* 6. Bridge soffit clearances & 3-Arch Lok-Ma Aqueduct underpass */
  var bargeDef = TR_VESSELS.defs.et_canal_barge;
  var bridgeBad = 0, minTrunkClear = 1e9, minWardClear = 1e9;
  for (var bi = 0; bi < EC_PLAN.bridges.length; bi++) {
    var br = EC_PLAN.bridges[bi];
    if (br.canalKind === 'canal_trunk' && br.airDraft < minTrunkClear) minTrunkClear = br.airDraft;
    if (br.canalKind === 'canal_ward' && br.airDraft < minWardClear) minWardClear = br.airDraft;
    if (!K.bridgeClearsVessel(br, bargeDef, 0.55)) bridgeBad++;
  }
  var aq = EC_HYD.AQUEDUCT;
  var aqOk = K.aqueductOk(aq, 3.50);

  /* 7. Towpath graph connectivity */
  var towpathConnected = K.towpathReachable(EC_PLAN.towpath, 'weir.head', ['harb.w', 'harb.e', 'w4.end', 'w5.end'], 0.18);

  /* 8. Vessel built-box & KTAGS 'vessel' audit + end-to-end KCANAL.auditTransit on all 9 courses */
  var vesselDimsOk = TR_VESSELS.order.every(function (vk) { return K.auditVesselDims(vk, 0, 0.18).ok; });
  var tagAudit = SVTAGS ? SVTAGS.audit() : { unknown: 99, byClass: {} };
  var vesselTagCount = (tagAudit.byClass && tagAudit.byClass.vessel) || 0;
  var expectedVessels = EC_HYD.MOORED_FLEET.length + EC_HYD.TRANSIT_COURSES.length;
  var vesselTagsOk = vesselTagCount === expectedVessels && tagAudit.unknown === 0;

  var transitFaults = 0;
  for (var ti = 0; ti < EC_HYD.TRANSIT_COURSES.length; ti++) {
    var crs = EC_HYD.TRANSIT_COURSES[ti];
    var vSpec = TR_VESSELS.defs[crs.vesselKey];
    var ta = K.auditTransit(crs, EC_HYD.NET, vSpec, { dt: 4.0, airMargin: 0.45 });
    if (!ta.ok) transitFaults++;
  }

  return {
    ok: monoOk && maxHead <= 3.50 && gateViolations === 0 && flooded === 0 &&
        overlaps === 0 && streetAudit.ok && maskAudit.ok && wardsPopulated &&
        bridgeBad === 0 && aqOk && towpathConnected && vesselDimsOk && vesselTagsOk && transitFaults === 0,
    poundMonotonic: monoOk,
    totalDropM: +(pounds[0].wlev - pounds[3].wlev).toFixed(2),
    maxRiserHeadM: +maxHead.toFixed(2),
    miterGateViolations: gateViolations,
    floodedLots: flooded,
    minLotFreeboardM: +minFreeboard.toFixed(2),
    obbOverlaps: overlaps,
    streetIntrusions: streetAudit.count,
    kmaskCanalHits: maskAudit.hits,
    frontageFill: fr.fillRatio,
    emptyWays: fr.emptyWays,
    quadrantLots: ql,
    wardsPopulated: wardsPopulated,
    bridgeClearanceFailures: bridgeBad,
    minTrunkAirDraftM: +minTrunkClear.toFixed(2),
    minWardAirDraftM: +minWardClear.toFixed(2),
    aqueductOk: aqOk,
    aqueductUnderpassM: +aq.underpassClearance.toFixed(2),
    towpathConnected: towpathConnected,
    vesselDimsOk: vesselDimsOk,
    vesselTagsOk: vesselTagsOk,
    vesselTagCount: vesselTagCount,
    transitCourseFaults: transitFaults,
    waterSurfaces: WATER.surfaces.length,
    lockChambers: EC_WATER_RECS.locks.length,
    gateLeaves: EC_GATE_LEAVES.length,
    movingVessels: EC_MOVING_HULLS.length,
    mooredVessels: EC_MOORED_HULLS.length,
    census: EC_PLAN.census,
    flora: EC_FLORA_STATS
  };
}

Object.assign(ENGINE_API, {
  hostChecks: function () {
    var cc = ecRunCanalChecks();
    var tg = SVTAGS ? SVTAGS.audit() : { unknown: 1 };
    return {
      ok: cc.ok && tg.unknown === 0 && ENGINE_API.nanSweep() === 0,
      canal: cc,
      tags: tg,
      sites: SITES.length,
      records: REG.length
    };
  },
  canalChecks: ecRunCanalChecks,
  lockState: function (t) {
    var tt = t == null ? EC_LOCK_T : +t;
    return EC_HYD.CHAMBERS.map(function (c) { return EC_HYD.lockState(c, tt); });
  },
  bargePoses: function (t) {
    var tt = t == null ? EC_LOCK_T : +t;
    return EC_HYD.TRANSIT_COURSES.map(function (c) { return KCANAL.vesselPoseAt(c, tt); });
  },
  setLockPhase: function (sec) {
    EC_LOCK_PIN = sec == null ? null : +sec;
    if (EC_LOCK_PIN !== null) {
      EC_LOCK_T = EC_LOCK_PIN;
      ecStepHydraulics(EC_LOCK_T);
    }
    return EC_LOCK_T;
  },
  simProof: function () { return { budget: EC_HYD.WATER_BUDGET, sim: EC_HYD.SIM_PROOF }; },
  plan: function () { return EC_PLAN; },
  view: function (name) { return KHOST.go(name); }
});
if (window._api) Object.assign(window._api, ENGINE_API);
window._ready = true;
