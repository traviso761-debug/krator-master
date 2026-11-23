// prefix: ec
// ================================================================= SHUANG-ZHA — 4-pound hydraulics, miter-lock flights & transit fleet ([G data])
// Built directly on KCANAL (kits/transit/src/40..42): 4 stepped pounds (P3 61.87 -> P2 58.87 -> P1 52.47 -> P0 45.87),
// twin 2-riser bronze miter-lock flights L1 & L2 (8 chambers), 3-arch Lok-Ma stone aqueduct, 8 canal bridges,
// and live end-to-end KCANAL.twinFlightRoundTrip barge lock + aqueduct + bridge + turning-basin courses.
var EC_HYD = (function () {
  'use strict';
  var G = EC_GROUND, F = G.FRAME, K = KCANAL;

  var POUNDS = [
    K.pound({ id: 'P3', order: 3, wlev: 61.87, bedMin: 59.37, quayY: 63.55, name: 'Pound P3 — Hak-Ma Intake Headrace' }),
    K.pound({ id: 'P2', order: 2, wlev: 58.87, bedMin: 55.87, quayY: 60.35, name: 'Pound P2 — Upper Feeder, Lok-Ma Aqueduct & Settling Basin' }),
    K.pound({ id: 'P1', order: 1, wlev: 52.47, bedMin: 49.67, quayY: 53.95, name: 'Pound P1 — Middle Burgh Trunk, Laterals & Turning Basin' }),
    K.pound({ id: 'P0', order: 0, wlev: 45.87, bedMin: 38.28, quayY: 47.50, name: 'Pound P0 — Jing-Hai Lake Harbour & Drydock' })
  ];
  var POUND_BY_ID = {};
  for (var pi = 0; pi < POUNDS.length; pi++) POUND_BY_ID[POUNDS[pi].id] = POUNDS[pi];

  /* Disjoint still-water polygons for Pounds P1 (+52.47 m), P2 (+58.87 m) & P3 (+61.87 m) */
  function mkPoly(id, poundId, level, u0, u1, s0, s1, bed, aqueductFlag, curbPad) {
    return {
      id: id, pound: poundId, kind: aqueductFlag ? 'aqueduct' : 'canal',
      level: level, wlev: level, u0: u0, u1: u1, s0: s0, s1: s1,
      bed: bed, bedY: bed, aqueduct: !!aqueductFlag,
      curbPad: curbPad == null ? 3.2 : curbPad,
      poly: F.rectPoly(u0, u1, s0, s1)
    };
  }

  var STILL_POLYS = [
    /* P1 (+52.47 m ASL) — including wide L1 & L2 lock-head forebays so twin-lane barges enter/exit cleanly */
    mkPoly('p1.l1.forebay', 'P1', 52.47, -8.35, 8.35, -340.0, -310.0, 49.97, false, 3.4),
    mkPoly('p1.trunk.south', 'P1', 52.47, -5.45, 5.45, -310.0, -24.0, 49.97, false, 3.8),
    mkPoly('p1.turning.basin', 'P1', 52.47, -27.95, 27.95, -24.0, 24.0, 49.67, false, 3.8),
    mkPoly('p1.trunk.north', 'P1', 52.47, -5.45, 5.45, 24.0, 348.0, 49.97, false, 3.8),
    mkPoly('p1.l2.forebay', 'P1', 52.47, -8.35, 8.35, 348.0, 380.0, 49.97, false, 3.4),
    mkPoly('p1.east.arm', 'P1', 52.47, 5.45, 236.25, 106.25, 113.75, 50.37, false, 3.2),
    mkPoly('p1.east.spur', 'P1', 52.47, 243.75, 344.9, 106.25, 113.75, 50.37, false, 3.2),
    mkPoly('p1.east.leg', 'P1', 52.47, 236.25, 243.75, -89.9, 249.9, 50.37, false, 3.2),
    mkPoly('p1.west.arm', 'P1', 52.47, -216.25, -5.45, -113.75, -106.25, 50.37, false, 3.2),
    mkPoly('p1.west.spur', 'P1', 52.47, -344.9, -223.75, -113.75, -106.25, 50.37, false, 3.2),
    mkPoly('p1.west.leg', 'P1', 52.47, -223.75, -216.25, -259.9, 39.9, 50.37, false, 3.2),
    /* P2 (+58.87 m ASL — including L2 upper forebay, 3-arch Lok-Ma Aqueduct trough & Settling Basin) */
    mkPoly('p2.l2.forebay', 'P2', 58.87, -8.35, 8.35, 436.0, 468.0, 56.47, false, 3.2),
    mkPoly('p2.feeder.south', 'P2', 58.87, -4.65, 4.65, 468.0, 656.0, 56.47, false, 2.8),
    mkPoly('p2.aqueduct.trough', 'P2', 58.87, -4.15, 4.15, 656.0, 704.0, 56.67, true, 2.8),
    mkPoly('p2.feeder.north', 'P2', 58.87, -4.65, 4.65, 704.0, 720.0, 56.47, false, 2.8),
    mkPoly('p2.settling.basin', 'P2', 58.87, -22.45, 22.45, 720.0, 810.0, 55.87, false, 3.2),
    mkPoly('p2.headrace.bend', 'P2', 58.87, -2.95, 75.95, 810.0, 815.0, 56.87, false, 2.6),
    mkPoly('p2.headrace.north', 'P2', 58.87, 69.05, 75.95, 815.0, 868.0, 56.87, false, 2.6),
    /* P3 (+61.87 m ASL — Intake Forebay upstream of Desilting Sluice Gate) */
    mkPoly('p3.intake.forebay', 'P3', 61.87, 68.1, 148.0, 868.0, 881.9, 59.37, false, 3.0)
  ];

  /* Additional P0 open-lake harbour & approach wet troughs for unified KCANAL.network */
  var P0_TROUGHS = [
    mkPoly('p0.harbour.basin', 'P0', 45.87, -195.0, 195.0, -625.0, -430.0, 41.87, false, 3.6),
    mkPoly('p0.drydock.basin', 'P0', 45.87, -152.0, -118.0, -456.0, -412.0, 43.20, false, 2.8),
    mkPoly('p0.lock.approach', 'P0', 45.87, -8.50, 8.50, -430.0, -395.6, 43.07, false, 3.4)
  ];

  var HAK_MA_PTS = G.HAK_MA_US.map(function (q) { var p = G.at(q[0], q[1]); return [p[0], p[1], q[2]]; });
  var LOK_MA_PTS = G.LOK_MA_US.map(function (q) { var p = G.at(q[0], q[1]); return [p[0], p[1], q[2]]; });

  var SPILL_LIP_P = G.at(28.0, 765.0);
  var SPILLWAY = {
    id: 'spillway.p2_hakma',
    u: 24.5, s: 765.0,
    lip: [SPILL_LIP_P[0], 58.82, SPILL_LIP_P[1]],
    dir: G.UX,
    lipW: 6.4,
    speed: 2.6,
    drop: 12.8,
    plungeY: 46.20
  };

  var AQUEDUCT = K.aqueduct({
    id: 'aqueduct.lok_ma',
    pound: 'P2',
    u: 0, s: 680.0,
    s0: 656.0, s1: 704.0,
    len: 48.0, waterW: 8.3, clearSpan: 36.0, arches: 3,
    wlev: 58.87, troughBedY: 56.67, archSoffitY: 55.10, towpathY: 60.35,
    streamWaterY: 51.00, streamBedY: 49.20
  }, F);

  /* 8 Canal Bridges aligned cleanly with avenues & ward streets (zero unbridged canal crossings!) */
  var RAW_BRIDGES = [
    {
      id: 'br.trunk.south', key: 'et_cart_bridge', styleKind: 'cart_arch', canalKind: 'canal_trunk', pound: 'P1', wlev: 52.47,
      u: 0, s: -185, acrossAxis: 'u', yaw: G.YAW_U, width: 7.4, baseY: 53.95,
      clearSpan: 11.4, soffitY: 55.45, deckY: 55.82, rampHalfLen: 14.0, minReqAirDraft: 2.80
    },
    {
      id: 'br.trunk.north', key: 'et_cart_bridge', styleKind: 'cart_arch', canalKind: 'canal_trunk', pound: 'P1', wlev: 52.47,
      u: 0, s: 215, acrossAxis: 'u', yaw: G.YAW_U, width: 7.4, baseY: 53.95,
      clearSpan: 11.4, soffitY: 55.45, deckY: 55.82, rampHalfLen: 14.0, minReqAirDraft: 2.80
    },
    {
      id: 'br.ward.e1', key: 'et_bridge', styleKind: 'foot_arch', canalKind: 'canal_ward', pound: 'P1', wlev: 52.47,
      u: 120, s: 110, acrossAxis: 's', yaw: G.YAW_S, width: 4.0, baseY: 53.20,
      clearSpan: 8.0, soffitY: 55.25, deckY: 55.85, rampHalfLen: 10.5, minReqAirDraft: 2.60
    },
    {
      id: 'br.ward.e2', key: 'et_bridge', styleKind: 'foot_arch', canalKind: 'canal_ward', pound: 'P1', wlev: 52.47,
      u: 240, s: 15, acrossAxis: 'u', yaw: G.YAW_U, width: 4.0, baseY: 53.20,
      clearSpan: 8.0, soffitY: 55.25, deckY: 55.85, rampHalfLen: 10.5, minReqAirDraft: 2.60
    },
    {
      id: 'br.ward.e3', key: 'et_bridge', styleKind: 'foot_arch', canalKind: 'canal_ward', pound: 'P1', wlev: 52.47,
      u: 240, s: 215, acrossAxis: 'u', yaw: G.YAW_U, width: 4.0, baseY: 53.20,
      clearSpan: 8.0, soffitY: 55.25, deckY: 55.85, rampHalfLen: 10.5, minReqAirDraft: 2.60
    },
    {
      id: 'br.ward.w1', key: 'et_bridge', styleKind: 'foot_arch', canalKind: 'canal_ward', pound: 'P1', wlev: 52.47,
      u: -120, s: -110, acrossAxis: 's', yaw: G.YAW_S, width: 4.0, baseY: 53.20,
      clearSpan: 8.0, soffitY: 55.25, deckY: 55.85, rampHalfLen: 10.5, minReqAirDraft: 2.60
    },
    {
      id: 'br.ward.w2', key: 'et_bridge', styleKind: 'foot_arch', canalKind: 'canal_ward', pound: 'P1', wlev: 52.47,
      u: -220, s: -185, acrossAxis: 'u', yaw: G.YAW_U, width: 4.0, baseY: 53.20,
      clearSpan: 8.0, soffitY: 55.25, deckY: 55.85, rampHalfLen: 10.5, minReqAirDraft: 2.60
    },
    {
      id: 'br.ward.w3', key: 'et_bridge', styleKind: 'foot_arch', canalKind: 'canal_ward', pound: 'P1', wlev: 52.47,
      u: -220, s: -25, acrossAxis: 'u', yaw: G.YAW_U, width: 4.0, baseY: 53.20,
      clearSpan: 8.0, soffitY: 55.25, deckY: 55.85, rampHalfLen: 10.5, minReqAirDraft: 2.60
    }
  ];

  /* Twin 2-Riser Bronze Miter-Lock Flights L1 (P0 <-> P1) and L2 (P1 <-> P2) with exact round-trip synchronization!
     Up-lane (west, u=-4.8): riser 0 phase = p0, riser 1 phase = (p0 + 185) % 360
     Down-lane (east, u=+4.8): riser 1 phase = (p0 + 275) % 360, riser 0 phase = (p0 + 90) % 360 */
  var LOCK_PERIOD = 360;
  function makeSyncedTwinFlight(id, s0, yLow, yHigh, p0) {
    var yMid = +(0.5 * (yLow + yHigh)).toFixed(4);
    var specs = [
      { id: id + 'a_low', flight: id, lane: 'west', riser: 0, u: -4.8, s0: s0, s1: s0 + 27.2, w: 5.6, l: 27.2, yLow: yLow, yHigh: yMid, phase: p0 % 360 },
      { id: id + 'a_high', flight: id, lane: 'west', riser: 1, u: -4.8, s0: s0 + 28.0, s1: s0 + 55.2, w: 5.6, l: 27.2, yLow: yMid, yHigh: yHigh, phase: (p0 + 185) % 360 },
      { id: id + 'b_low', flight: id, lane: 'east', riser: 0, u: 4.8, s0: s0, s1: s0 + 27.2, w: 5.6, l: 27.2, yLow: yLow, yHigh: yMid, phase: (p0 + 90) % 360 },
      { id: id + 'b_high', flight: id, lane: 'east', riser: 1, u: 4.8, s0: s0 + 28.0, s1: s0 + 55.2, w: 5.6, l: 27.2, yLow: yMid, yHigh: yHigh, phase: (p0 + 275) % 360 }
    ];
    return specs.map(function (sp) { return K.chamber(sp, F); });
  }

  var L1_CHAMBERS = makeSyncedTwinFlight('L1', -395.6, 45.87, 52.47, 0);
  var L2_CHAMBERS = makeSyncedTwinFlight('L2', 380.4, 52.47, 58.87, 45);
  var CHAMBERS = L1_CHAMBERS.concat(L2_CHAMBERS);
  var CHAMBER_BY_ID = {};
  for (var ci = 0; ci < CHAMBERS.length; ci++) CHAMBER_BY_ID[CHAMBERS[ci].id] = CHAMBERS[ci];

  function lockState(idOrChamber, t) {
    var c = typeof idOrChamber === 'string' ? CHAMBER_BY_ID[idOrChamber] : idOrChamber;
    return K.lockState(c, t);
  }

  /* Unified KCANAL.network covering all troughs, chambers, bridges, aqueduct, and rivers */
  var NET = K.network({
    frame: F,
    pounds: POUNDS,
    troughs: P0_TROUGHS.concat(STILL_POLYS),
    bridges: RAW_BRIDGES,
    aqueducts: [AQUEDUCT],
    chambers: CHAMBERS,
    rivers: [
      { id: 'river.hak_ma', ptsUs: G.HAK_MA_US },
      { id: 'river.lok_ma', ptsUs: G.LOK_MA_US }
    ]
  });

  var WATER_BUDGET = {
    riverName: 'Hak-Ma (r012)',
    qRiverMean: 379.5,
    qRiverDryBase: 140.0,
    qDivertedIn: 8.50,
    qLockages: 0.68,
    qMillRace: 4.50,
    qIrrigation: 2.10,
    qEvapSeepage: 0.32,
    qSpillwayReturn: +(8.50 - (0.68 + 4.50 + 2.10 + 0.32)).toFixed(2)
  };

  var SIM_PROOF = {
    routeKmToFulcrum: 362,
    annualSurplusTons: { rice: 4200, coal: 1400, celadon: 700, valleySalvage: 85, total: 6385 },
    barge: {
      carrier: 'inland_river_canal_lake_barge',
      ratedTons: 25.0, meanTons: 18.5, crew: 4, beasts: 0,
      speedKmDay: 48, activeDays: 285, fodderKgDay: 0, freightMult: 0.18,
      annualTonsPerHull: 355, fleetHulls: 18, totalSailors: 72
    },
    wagonConvoy: {
      carrier: 'highway_wagon_convoy',
      ratedTons: 15.0, meanTons: 11.5, crew: 14, beasts: 20,
      speedKmDay: 34, activeDays: 270, fodderKgDay: 160, freightMult: 0.72,
      convoysNeededForSameTonnage: 55, oxenNeeded: 1100, teamstersNeeded: 770
    },
    vesselSpec: {
      et_canal_barge: { L: 16.5, B: 3.6, H: 1.88, loa: 16.5, beam: 3.6, draft: 1.05, airDraft: 1.88 },
      et_tow_scow: { L: 11.6, B: 3.0, H: 1.32, loa: 11.6, beam: 3.0, draft: 0.72, airDraft: 1.32 },
      et_inspection_launch: { L: 10.2, B: 2.4, H: 1.72, loa: 10.2, beam: 2.4, draft: 0.65, airDraft: 1.72 }
    }
  };

  /* Moored Fleet (all oriented with Ring Sea / TR_VESSEL bow +x angles: VYAW_S, VYAW_NS, VYAW_U, VYAW_NU!) */
  var MOORED_FLEET = [
    /* W1 Harbour Basin & Quays (P0 = +45.87 m) */
    { id: 'ves.barge.harb.0', key: 'et_canal_barge', v: 0, pound: 'P0', u: -82, s: -440, yaw: G.VYAW_U, y: 45.87 },
    { id: 'ves.barge.harb.1', key: 'et_canal_barge', v: 1, pound: 'P0', u: -48, s: -440, yaw: G.VYAW_U, y: 45.87 },
    { id: 'ves.barge.harb.2', key: 'et_canal_barge', v: 2, pound: 'P0', u: 52, s: -440, yaw: G.VYAW_NU, y: 45.87 },
    { id: 'ves.barge.harb.3', key: 'et_canal_barge', v: 3, pound: 'P0', u: 88, s: -440, yaw: G.VYAW_NU, y: 45.87 },
    { id: 'ves.launch.harb.0', key: 'et_inspection_launch', v: 0, pound: 'P0', u: 24, s: -438, yaw: G.VYAW_NS, y: 45.87 },
    { id: 'ves.scow.harb.0', key: 'et_tow_scow', v: 0, pound: 'P0', u: -115, s: -439, yaw: G.VYAW_U, y: 45.87 },
    { id: 'ves.scow.harb.1', key: 'et_tow_scow', v: 1, pound: 'P0', u: 142, s: -440, yaw: G.VYAW_NU, y: 45.87 },
    /* W3 Central Turning Basin — State Granary & Valley Salvage Transshipment Wharves (P1 = +52.47 m) */
    { id: 'ves.barge.turn.0', key: 'et_canal_barge', v: 0, pound: 'P1', u: -24.8, s: -11, yaw: G.VYAW_S, y: 52.47 },
    { id: 'ves.barge.turn.1', key: 'et_canal_barge', v: 0, pound: 'P1', u: -24.8, s: 12, yaw: G.VYAW_S, y: 52.47 },
    { id: 'ves.barge.turn.2', key: 'et_canal_barge', v: 3, pound: 'P1', u: 24.8, s: -11, yaw: G.VYAW_NS, y: 52.47 },
    { id: 'ves.barge.turn.3', key: 'et_canal_barge', v: 1, pound: 'P1', u: 24.8, s: 12, yaw: G.VYAW_NS, y: 52.47 },
    { id: 'ves.launch.turn.0', key: 'et_inspection_launch', v: 0, pound: 'P1', u: -15.5, s: -20.5, yaw: G.VYAW_U, y: 52.47 },
    /* W4 East Kiln & Mill Lateral Craft (P1 = +52.47 m) */
    { id: 'ves.barge.kiln.0', key: 'et_canal_barge', v: 2, pound: 'P1', u: 175, s: 111.5, yaw: G.VYAW_U, y: 52.47 },
    { id: 'ves.scow.kiln.0', key: 'et_tow_scow', v: 1, pound: 'P1', u: 78, s: 111.8, yaw: G.VYAW_U, y: 52.47 },
    { id: 'ves.scow.kiln.1', key: 'et_tow_scow', v: 1, pound: 'P1', u: 238.2, s: -42, yaw: G.VYAW_S, y: 52.47 },
    { id: 'ves.scow.kiln.2', key: 'et_tow_scow', v: 0, pound: 'P1', u: 241.8, s: 72, yaw: G.VYAW_NS, y: 52.47 },
    { id: 'ves.scow.kiln.3', key: 'et_tow_scow', v: 1, pound: 'P1', u: 238.2, s: 155, yaw: G.VYAW_S, y: 52.47 },
    { id: 'ves.scow.kiln.4', key: 'et_tow_scow', v: 0, pound: 'P1', u: 302, s: 108.2, yaw: G.VYAW_NU, y: 52.47 },
    /* W5 West Market & Tea-House Lateral Craft (P1 = +52.47 m) */
    { id: 'ves.barge.west.0', key: 'et_canal_barge', v: 0, pound: 'P1', u: -168, s: -111.5, yaw: G.VYAW_U, y: 52.47 },
    { id: 'ves.scow.west.0', key: 'et_tow_scow', v: 0, pound: 'P1', u: -74, s: -108.2, yaw: G.VYAW_NU, y: 52.47 },
    { id: 'ves.scow.west.1', key: 'et_tow_scow', v: 0, pound: 'P1', u: -221.8, s: -145, yaw: G.VYAW_S, y: 52.47 },
    { id: 'ves.launch.west.0', key: 'et_inspection_launch', v: 0, pound: 'P1', u: -218.2, s: -68, yaw: G.VYAW_NS, y: 52.47 },
    /* W6 Settling Basin Craft (P2 = +58.87 m) */
    { id: 'ves.barge.settle.0', key: 'et_canal_barge', v: 0, pound: 'P2', u: -17.5, s: 762, yaw: G.VYAW_S, y: 58.87 },
    { id: 'ves.scow.settle.0', key: 'et_tow_scow', v: 1, pound: 'P2', u: 17.5, s: 748, yaw: G.VYAW_NS, y: 58.87 }
  ];

  /* 9 Active End-to-End KCANAL Transit Courses (twin-flight period = 1440 s = 4 x 360 s lock cycle):
     - 2 barges completing full P0 <-> L1a/L1b twin-lock <-> South Cart Bridge <-> Turning Basin round-trips!
     - 2 barges completing full P1 <-> North Cart Bridge <-> L2a/L2b twin-lock <-> 3-Arch Lok-Ma Aqueduct <-> Settling Basin round-trips!
     - 5 shuttle barges / scows / launches across P0 lake approach, P2 aqueduct, and East/West ward canals! */
  var TRANSIT_COURSES = [
    K.twinFlightRoundTrip({
      id: 'ves.barge.lock.L1.0', vesselKey: 'et_canal_barge', v: 0, frame: F,
      chUpLow: CHAMBER_BY_ID.L1a_low, chUpHigh: CHAMBER_BY_ID.L1a_high,
      chDnHigh: CHAMBER_BY_ID.L1b_high, chDnLow: CHAMBER_BY_ID.L1b_low,
      uCruiseUp: -2.2, uCruiseDn: 2.2,
      sLowGateClear: -409.5, sLowNear: -426.0, sLowBasin: -468.0,
      sHighGateClear: -326.5, sHighNear: -312.0, sHighBasin: -4.0,
      upperTurnR: 5.5, upperTurnS: 5.0,
      lowerTurnR: 6.0, lowerTurnS: -6.0,
      lapIndex: 0
    }),
    K.twinFlightRoundTrip({
      id: 'ves.barge.lock.L1.1', vesselKey: 'et_canal_barge', v: 3, frame: F,
      chUpLow: CHAMBER_BY_ID.L1a_low, chUpHigh: CHAMBER_BY_ID.L1a_high,
      chDnHigh: CHAMBER_BY_ID.L1b_high, chDnLow: CHAMBER_BY_ID.L1b_low,
      uCruiseUp: -2.2, uCruiseDn: 2.2,
      sLowGateClear: -409.5, sLowNear: -426.0, sLowBasin: -468.0,
      sHighGateClear: -326.5, sHighNear: -312.0, sHighBasin: -4.0,
      upperTurnR: 5.5, upperTurnS: 5.0,
      lowerTurnR: 6.0, lowerTurnS: -6.0,
      lapIndex: 1
    }),
    K.twinFlightRoundTrip({
      id: 'ves.barge.lock.L2.0', vesselKey: 'et_canal_barge', v: 1, frame: F,
      chUpLow: CHAMBER_BY_ID.L2a_low, chUpHigh: CHAMBER_BY_ID.L2a_high,
      chDnHigh: CHAMBER_BY_ID.L2b_high, chDnLow: CHAMBER_BY_ID.L2b_low,
      /* Cruise at u = -1.4 / +1.4 so 3.6 m barge clears the 8.3 m Lok-Ma stone aqueduct trough [-4.15..+4.15] cleanly! */
      uCruiseUp: -1.4, uCruiseDn: 1.4,
      sLowGateClear: 366.5, sLowNear: 350.0, sLowBasin: 8.0,
      sHighGateClear: 449.5, sHighNear: 465.0, sHighBasin: 762.0,
      upperTurnR: 5.5, upperTurnS: 5.5,
      lowerTurnR: 5.5, lowerTurnS: -5.0,
      lapIndex: 0
    }),
    K.twinFlightRoundTrip({
      id: 'ves.barge.lock.L2.1', vesselKey: 'et_canal_barge', v: 2, frame: F,
      chUpLow: CHAMBER_BY_ID.L2a_low, chUpHigh: CHAMBER_BY_ID.L2a_high,
      chDnHigh: CHAMBER_BY_ID.L2b_high, chDnLow: CHAMBER_BY_ID.L2b_low,
      uCruiseUp: -1.4, uCruiseDn: 1.4,
      sLowGateClear: 366.5, sLowNear: 350.0, sLowBasin: 8.0,
      sHighGateClear: 449.5, sHighNear: 465.0, sHighBasin: 762.0,
      upperTurnR: 5.5, upperTurnS: 5.5,
      lowerTurnR: 5.5, lowerTurnS: -5.0,
      lapIndex: 1
    }),
    K.shuttleCourse({
      id: 'ves.launch.aqueduct', vesselKey: 'et_inspection_launch', v: 0, frame: F,
      period: 240, phase: 35, uA: 0.0, sA: 452.0, uB: 0.0, sB: 755.0, wlev: 58.87, turnR: 2.2, turnS: 2.5
    }),
    K.shuttleCourse({
      id: 'ves.barge.lake.0', vesselKey: 'et_canal_barge', v: 0, frame: F,
      period: 280, phase: 40, uA: -24.0, sA: -600.0, uB: -24.0, sB: -468.0, wlev: 45.87, turnR: 4.5, turnS: 4.0
    }),
    K.shuttleCourse({
      id: 'ves.scow.cruise.e', vesselKey: 'et_tow_scow', v: 1, frame: F,
      period: 210, phase: 55, uA: 28.0, sA: 110.0, uB: 215.0, sB: 110.0, wlev: 52.47, doubleEnded: true
    }),
    K.shuttleCourse({
      id: 'ves.scow.cruise.w', vesselKey: 'et_tow_scow', v: 0, frame: F,
      period: 210, phase: 140, uA: -28.0, sA: -110.0, uB: -195.0, sB: -110.0, wlev: 52.47, doubleEnded: true
    }),
    K.shuttleCourse({
      id: 'ves.launch.trunk', vesselKey: 'et_inspection_launch', v: 0, frame: F,
      period: 260, phase: 95, uA: 0.0, sA: -324.0, uB: 0.0, sB: 364.0, wlev: 52.47, turnR: 2.0, turnS: 2.2
    })
  ];

  var COURSE_BY_ID = {};
  for (var mi = 0; mi < TRANSIT_COURSES.length; mi++) {
    COURSE_BY_ID[TRANSIT_COURSES[mi].id] = TRANSIT_COURSES[mi];
  }

  function movingPose(courseOrSpec, t) {
    var crs = typeof courseOrSpec === 'string' ? COURSE_BY_ID[courseOrSpec] : courseOrSpec;
    return K.vesselPoseAt(crs, t);
  }

  return {
    POUNDS: POUNDS,
    POUND_BY_ID: POUND_BY_ID,
    STILL_POLYS: STILL_POLYS,
    P0_TROUGHS: P0_TROUGHS,
    HAK_MA_PTS: HAK_MA_PTS,
    LOK_MA_PTS: LOK_MA_PTS,
    SPILLWAY: SPILLWAY,
    AQUEDUCT: AQUEDUCT,
    BRIDGES: NET.bridges,
    NET: NET,
    LOCK_PERIOD: LOCK_PERIOD,
    TRANSIT_PERIOD: 1440,
    CHAMBERS: CHAMBERS,
    CHAMBER_BY_ID: CHAMBER_BY_ID,
    WATER_BUDGET: WATER_BUDGET,
    SIM_PROOF: SIM_PROOF,
    MOORED_FLEET: MOORED_FLEET,
    MOVING_FLEET: TRANSIT_COURSES,
    TRANSIT_COURSES: TRANSIT_COURSES,
    lockState: lockState,
    movingPose: movingPose
  };
})();
