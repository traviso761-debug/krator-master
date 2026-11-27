// prefix: tr
// ================================================================= TRANSIT KIT — Standalone Demo Plan ([G data])
// Stepped 2-pound canal (P0 +12.00 m -> 3.20 m Miter Lock -> P1 +15.20 m), humpback cart bridge, navigable 2-arch
// stone aqueduct over incised valley stream (+7.20 m), 44x36 m turning basin, clipped approach roads, and vessel showcase.
var TR_DEMO = (function () {
  'use strict';

  var K = KCANAL;
  var F = K.frame({ bearingDeg: 90 }); /* SX = +X (East), UX = +Z (South) */

  var POUNDS = [
    K.pound({ id: 'P1', order: 1, wlev: 15.20, bedMin: 12.60, quayY: 16.68, name: 'Upper Pound P1 (+15.20 m)' }),
    K.pound({ id: 'P0', order: 0, wlev: 12.00, bedMin: 9.40, quayY: 13.48, name: 'Lower Pound P0 (+12.00 m)' })
  ];

  var LOCK_FLIGHT = K.lockFlight({
    id: 'L1',
    risers: 1,
    lanes: 1,
    u: 0,
    s0: -14.0,
    chamberLen: 28.0,
    chamberW: 5.2,
    yLow: 12.00,
    yHigh: 15.20,
    period: 360,
    phase: 0
  }, F);
  var MAIN_CHAMBER = LOCK_FLIGHT.chambers[0];

  var STREAM_US = [
    [-95, 84, 7.65, 6.5],
    [-35, 84, 7.35, 6.5],
    [0, 84, 7.20, 6.8],
    [35, 84, 7.05, 6.8],
    [95, 84, 6.80, 7.2]
  ];

  var TROUGHS = [
    { id: 'p0.basin', kind: 'basin', pound: 'P0', u0: -18.0, u1: 18.0, s0: -136.0, s1: -96.0, wlev: 12.00, bedY: 9.40, curbPad: 2.8 },
    { id: 'p0.reach', kind: 'canal', pound: 'P0', u0: -5.5, u1: 5.5, s0: -96.0, s1: -14.0, wlev: 12.00, bedY: 9.60, curbPad: 2.8 },
    { id: 'p1.west', kind: 'canal', pound: 'P1', u0: -5.5, u1: 5.5, s0: 14.0, s1: 64.0, wlev: 15.20, bedY: 12.80, curbPad: 2.8 },
    { id: 'p1.aqueduct', kind: 'aqueduct', pound: 'P1', u0: -4.2, u1: 4.2, s0: 64.0, s1: 104.0, wlev: 15.20, bedY: 13.00, aqueduct: true, curbPad: 2.8 },
    { id: 'p1.east', kind: 'canal', pound: 'P1', u0: -5.5, u1: 5.5, s0: 104.0, s1: 124.0, wlev: 15.20, bedY: 12.80, curbPad: 2.8 },
    { id: 'p1.turning_basin', kind: 'basin', pound: 'P1', u0: -18.0, u1: 18.0, s0: 124.0, s1: 168.0, wlev: 15.20, bedY: 12.60, curbPad: 2.8 },
    /* Dedicated Ring-Sea-style Vessel Showcase Basin south of lower pound */
    { id: 'showcase.basin', kind: 'basin', pound: 'P0', u0: 32.0, u1: 64.0, s0: -48.0, s1: 32.0, wlev: 12.00, bedY: 9.40, curbPad: 2.4 }
  ];

  var BRIDGES = [
    {
      id: 'br.demo.cart',
      key: 'et_cart_bridge',
      styleKind: 'cart_arch',
      canalKind: 'canal_trunk',
      pound: 'P1',
      wlev: 15.20,
      u: 0,
      s: 40.0,
      acrossAxis: 'u',
      width: 7.4,
      baseY: 16.68,
      clearSpan: 11.4,
      soffitY: 18.18,
      deckY: 18.55,
      rampHalfLen: 14.0,
      minReqAirDraft: 2.80
    }
  ];

  var AQUEDUCTS = [
    {
      id: 'aq.demo.stone',
      materialKind: 'masonry',
      pound: 'P1',
      u: 0,
      s: 84.0,
      s0: 64.0,
      s1: 104.0,
      len: 40.0,
      waterW: 8.4,
      arches: 2,
      clearSpan: 31.0,
      wlev: 15.20,
      troughBedY: 13.00,
      archSoffitY: 11.15,
      towpathY: 16.68,
      streamWaterY: 7.20,
      streamBedY: 5.40
    }
  ];

  var NET = K.network({
    frame: F,
    pounds: POUNDS,
    troughs: TROUGHS,
    bridges: BRIDGES,
    aqueducts: AQUEDUCTS,
    chambers: LOCK_FLIGHT.chambers,
    rivers: [{ id: 'demo.stream', ptsUs: STREAM_US }]
  });

  /* Ground height function sculpting the 2 stepped terraces, incised valley stream under aqueduct, and canal trenches */
  function groundH(x, z) {
    var us = F.us(x, z), u = us[0], s = us[1];
    /* Base stepped terrace: 13.48 m on lower west side, ramping across s in [-14, +14] up to 16.68 m on upper east side */
    var y = K.lerp(13.48, 16.68, K.smooth(-14.0, 14.0, s));
    /* Gentle background valley rise outside demo corridor */
    y += 0.015 * Math.max(0, Math.abs(u) - 72.0);

    /* Incised valley stream under 2-arch stone aqueduct at s = 84 (skipped across aqueduct trough |u| < 6.8 so stream flows cleanly underneath!) */
    var dStream = Math.abs(s - 84.0);
    var shoulder = Math.abs(u) < 7.2 ? 6.2 : 13.5;
    if (dStream < 6.8 + shoulder) {
      var streamInvert = 5.40 - (u / 95.0) * 0.42;
      var ks = 1 - K.smooth(5.2, 6.8 + shoulder, dStream);
      y = K.lerp(y, streamInvert, ks);
    }

    /* Excavated canal & basin trenches (skipping aqueduct span s in [64, 104] so ground stays stream valley below!) */
    for (var i = 0; i < TROUGHS.length; i++) {
      var tr = TROUGHS[i];
      if (tr.aqueduct) continue;
      /* Extend flat trench invert 1.6 m under solid 3.2 m masonry quay walls so zero diagonal terrain tris poke into water */
      var du = u < tr.u0 - 1.5 ? (tr.u0 - 1.5) - u : (u > tr.u1 + 1.5 ? u - (tr.u1 + 1.5) : 0);
      var ds = s < tr.s0 - 1.2 ? (tr.s0 - 1.2) - s : (s > tr.s1 + 1.2 ? s - (tr.s1 + 1.2) : 0);
      var d = Math.hypot(du, ds);
      if (d < 1.4) {
        var kt = 1 - K.smooth(0, 1.4, d);
        y = Math.min(y, K.lerp(y, tr.bedY, kt));
      }
    }

    /* Lock chamber pit */
    var duL = Math.max(0, Math.abs(u) - 4.2);
    var dsL = s < -14.5 ? (-14.5 - s) : (s > 14.5 ? (s - 14.5) : 0);
    var dL = Math.hypot(duL, dsL);
    if (dL < 1.2) {
      y = Math.min(y, K.lerp(y, MAIN_CHAMBER.bedY, 1 - K.smooth(0, 1.2, dL)));
    }

    return y;
  }

  /* Continuous towpath graph across lower pound, lock ramp, humpback bridge, navigable aqueduct & turning basin */
  function buildTowpath() {
    var nodes = {}, edges = [];
    function n(id, u, s, y) {
      var p = F.at(u, s);
      nodes[id] = { id: id, u: u, s: s, x: p[0], z: p[1], y: y };
    }
    function e(a, b, w, kind) {
      var na = nodes[a], nb = nodes[b];
      var dist = Math.hypot(nb.x - na.x, nb.z - na.z);
      var slope = dist > 1e-4 ? Math.abs(nb.y - na.y) / dist : 0;
      edges.push({ a: a, b: b, w: w, kind: kind, dist: +dist.toFixed(2), slope: +slope.toFixed(4) });
    }
    n('p0.end.n', -7.2, -96, 13.48); n('p0.end.s', 7.2, -96, 13.48);
    n('lk.bot.n', -5.2, -14, 13.48); n('lk.bot.s', 5.2, -14, 13.48);
    n('lk.top.n', -5.2, 14, 16.68);  n('lk.top.s', 5.2, 14, 16.68);
    n('br.n', -14.0, 40, 16.68); n('br.tn', -7.2, 40, 16.68);
    n('br.c', 0, 40, 18.55);
    n('br.ts', 7.2, 40, 16.68);  n('br.s', 14.0, 40, 16.68);
    n('aq.w.n', -5.8, 64, 16.68); n('aq.w.s', 5.8, 64, 16.68);
    n('aq.e.n', -5.8, 104, 16.68); n('aq.e.s', 5.8, 104, 16.68);
    n('tb.w.n', -19.8, 124, 16.68); n('tb.w.s', 19.8, 124, 16.68);
    n('tb.e.n', -19.8, 168, 16.68); n('tb.e.s', 19.8, 168, 16.68);
    n('sc.w', 30.2, -46, 13.48); n('sc.e', 30.2, 30, 13.48);

    e('p0.end.n', 'lk.bot.n', 3.4, 'towpath'); e('p0.end.s', 'lk.bot.s', 3.4, 'towpath');
    e('lk.bot.n', 'lk.top.n', 3.2, 'lock_ramp'); e('lk.bot.s', 'lk.top.s', 3.2, 'lock_ramp');
    e('lk.top.n', 'br.tn', 3.4, 'towpath'); e('lk.top.s', 'br.ts', 3.4, 'towpath');
    e('br.n', 'br.c', 5.4, 'bridge_ramp'); e('br.c', 'br.s', 5.4, 'bridge_ramp');
    e('br.n', 'br.tn', 3.2, 'towpath'); e('br.s', 'br.ts', 3.2, 'towpath');
    e('br.tn', 'aq.w.n', 3.4, 'towpath'); e('br.ts', 'aq.w.s', 3.4, 'towpath');
    e('aq.w.n', 'aq.e.n', 2.4, 'aqueduct_walk'); e('aq.w.s', 'aq.e.s', 2.4, 'aqueduct_walk');
    e('aq.e.n', 'tb.w.n', 3.4, 'towpath'); e('aq.e.s', 'tb.w.s', 3.4, 'towpath');
    e('tb.w.n', 'tb.e.n', 3.6, 'quay'); e('tb.w.s', 'tb.e.s', 3.6, 'quay');
    e('tb.e.n', 'tb.e.s', 3.6, 'quay');
    e('lk.bot.s', 'sc.e', 3.0, 'towpath'); e('sc.w', 'sc.e', 3.6, 'quay');
    return { nodes: nodes, edges: edges };
  }

  var TOWPATH = buildTowpath();

  /* Raw unclipped streets (including a crossing road at s=40 and an unbridged road toward s=-55 that MUST clip at the quay!) */
  var RAW_WAYS = [
    { id: 'way.bridge_road', cls: 'avenue', w: 7.0, pts: [F.at(-65, 40), F.at(65, 40)] },
    { id: 'way.lower_quay_t', cls: 'main', w: 6.0, pts: [F.at(-65, -52), F.at(28, -52)] },
    { id: 'way.basin_wharf', cls: 'main', w: 6.0, pts: [F.at(-55, 146), F.at(-22, 146)] }
  ];
  var WAYS = K.clipStreetWays(RAW_WAYS, NET, { curbMargin: 2.6 });
  var ROAD_MASK = K.buildRoadMask(WAYS, TOWPATH, NET, { size: 512, halfExtent: 220 });

  /* End-to-end barge lock + bridge + aqueduct + turning-basin round-trip course */
  var BARGE_COURSE = K.singleLockTour({
    id: 'demo.barge.transit',
    vesselKey: 'et_canal_barge',
    v: 0,
    frame: F,
    chamber: MAIN_CHAMBER,
    u: 0,
    sLowBasin: -116.0,
    sLowNear: -28.0,
    sHighNear: 28.0,
    sHighBasin: 146.0,
    turnRadiusU: 5.5,
    turnRadiusS: 4.5
  });

  var LAUNCH_COURSE = K.shuttleCourse({
    id: 'demo.launch.aqueduct',
    vesselKey: 'et_inspection_launch',
    v: 0,
    frame: F,
    period: 180,
    phase: 45,
    uA: -1.8, sA: 30.0,
    uB: -1.8, sB: 138.0,
    wlev: 15.20,
    doubleEnded: true
  });

  var SHOWCASE_ROW = [
    { id: 'showcase.barge.rice', key: 'et_canal_barge', v: 0, u: 45.0, s: -26.0, y: 12.00, yaw: F.VYAW_S },
    { id: 'showcase.barge.porcelain', key: 'et_canal_barge', v: 1, u: 54.5, s: -26.0, y: 12.00, yaw: F.VYAW_S },
    { id: 'showcase.tow_scow', key: 'et_tow_scow', v: 0, u: 45.0, s: 2.0, y: 12.00, yaw: F.VYAW_S },
    { id: 'showcase.launch', key: 'et_inspection_launch', v: 0, u: 45.0, s: 22.0, y: 12.00, yaw: F.VYAW_S },
    { id: 'moored.basin.barge', key: 'et_canal_barge', v: 3, u: -14.2, s: 146.0, y: 15.20, yaw: F.VYAW_S },
    { id: 'moored.lower.scow', key: 'et_tow_scow', v: 1, u: -14.2, s: -116.0, y: 12.00, yaw: F.VYAW_NS }
  ];

  return {
    frame: F,
    pounds: POUNDS,
    lockFlight: LOCK_FLIGHT,
    chamber: MAIN_CHAMBER,
    streamUs: STREAM_US,
    troughs: TROUGHS,
    bridges: NET.bridges,
    aqueducts: NET.aqueducts,
    net: NET,
    groundH: groundH,
    towpath: TOWPATH,
    rawWays: RAW_WAYS,
    ways: WAYS,
    roadMask: ROAD_MASK,
    bargeCourse: BARGE_COURSE,
    launchCourse: LAUNCH_COURSE,
    showcase: SHOWCASE_ROW
  };
})();
