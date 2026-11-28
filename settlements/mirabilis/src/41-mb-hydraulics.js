// prefix: mb
/* ================================================================= MIRABILIS — Hydraulics, Hoist/Clock Kinematics & SIM Ledger ([G data])
   1. Yut-Ma ("Moon-Bridge River", r227, 14.3 m3/s) upper & lower gorge reaches + 8.5 m Moon-Bridge bedrock cascade.
   2. W5 Engineered Stone Mill-Leat (+2940.0 -> +2935.2 m) powering hy_larch_flume_yard & hy_nephrite_lapidary.
   3. Siru-Spring Amphitheatre pools (+3068 m) & 37 m waterfall into the +3030.8 m plunge basin.
   4. Counterbalanced Escarpment Hoist (W6 -> +2850 m Fulcrum Switchback Yard), Overshot Millwheels & Observatory Clock.
   5. Conserved Circuit E6 SIM Freight & Trade Ledger (Fulcrum <-> Mirabilis, Mirabilis <-> Tone, Ukor-Tera Whale-Clan Pass).
   Plain data and pure functions: zero THREE, zero DOM, zero Math.random. */

var MB_HYD = (function () {
  'use strict';
  var G = MB_GROUND;

  function buildRiverReach(x0, x1, step) {
    var pts = [];
    for (var x = x0; x <= x1 + 0.01; x += step) {
      var xx = Math.min(x, x1);
      pts.push([+xx.toFixed(2), +G.riverCenterZ(xx).toFixed(2), +G.riverWaterY(xx).toFixed(3)]);
    }
    return pts;
  }

  /* Upper Yut-Ma reach (-1320 m -> -14 m above the 8.5 m Moon-Bridge bedrock cascade) */
  var YUT_UPPER_PTS = buildRiverReach(-1320, -14, 32);

  /* Lower Yut-Ma reach (+14 m below Moon-Bridge cascade -> +1320 m plunging down the eastern escarpment) */
  var YUT_LOWER_PTS = buildRiverReach(14, 1320, 32);

  /* W5 South Mill-Leat raceway (-410 m intake weir -> -50 m tailrace) */
  var MILL_LEAT_PTS = (function () {
    var pts = [];
    for (var x = -410; x <= -50; x += 20) {
      var ml = G.millLeatAt(x, -164);
      pts.push([x, +ml.z.toFixed(2), +ml.wlev.toFixed(3)]);
    }
    return pts;
  })();

  /* Waterfalls: Moon-Bridge 8.5 m chasm step & Siru-Spring 36.8 m amphitheatre veil */
  var zBridgeStep = G.riverCenterZ(0);
  var MOON_FALL = {
    id: 'fall_moon_bridge',
    name: 'Yut-Ma Moon-Bridge Cascade',
    lip: [[-13, zBridgeStep - 9.0, 2932.0], [-13, zBridgeStep + 9.0, 2932.0]],
    dir: [1, 0],
    speed: 2.35,
    drop: 8.5,
    plungeY: 2923.5
  };

  var SIRU_FALL = {
    id: 'fall_siru_spring',
    name: 'Siru-Spring Cliff Cascade',
    lip: [[331.0, -121.0, 3109.6], [345.0, -121.0, 3109.6]],
    dir: [0, -1],
    speed: 1.95,
    drop: 37.6,
    plungeY: 3072.0
  };

  function discPoly(cx, cz, rx, rz, n) {
    var out = [], cnt = n == null ? 14 : n;
    for (var i = 0; i < cnt; i++) {
      var a = (i / cnt) * Math.PI * 2;
      out.push([+(cx + Math.cos(a) * rx).toFixed(2), +(cz + Math.sin(a) * rz).toFixed(2)]);
    }
    return out;
  }

  /* Standing mineral & spring basins drawn on WATER.still */
  var STILL_POOLS = [
    { id: 'pool_siru_head', name: 'Siru-Spring Emergence Basin', level: 3109.65, cx: 338, cz: -106, poly: discPoly(338, -106, 13.5, 10.0, 16), color: 0x2b6f6a },
    { id: 'pool_siru_plunge', name: 'Siru-Spring Plunge Basin', level: 3072.05, cx: 338, cz: -142, poly: discPoly(338, -142, 12.0, 11.0, 16), color: 0x245d59 },
    { id: 'pool_stepwell_cistern', name: 'Santa Cristina Stepwell Cistern', level: 3109.40, cx: 302, cz: -84, poly: discPoly(302, -84, 4.2, 4.2, 12), color: 0x1f5958 },
    { id: 'pool_healer_bath', name: 'Siru Thermal Mineral Bath', level: 3109.55, cx: 376, cz: -84, poly: discPoly(376, -84, 5.4, 3.8, 12), color: 0x317c74 }
  ];

  /* Verify strict downstream monotonicity of a [x, z, y] polyline */
  function flowMonotonic(pts) {
    for (var i = 0; i + 1 < pts.length; i++) {
      if (!(pts[i + 1][2] < pts[i][2] - 1e-4)) return false;
    }
    return pts.length >= 2;
  }

  /* Counterbalanced Fulcrum Escarpment Hoist kinematics (160 s cycle between +3112.2 m lip & +2850.2 m switchback yard) */
  var HOIST_SPEC = {
    period: 160.0,
    topX: 736.0, topY: 3112.2,
    botX: 888.0, botY: 2850.2,
    laneZ_A: 256.8,
    laneZ_B: 263.2
  };

  function hoistState(tSec) {
    var T = HOIST_SPEC.period;
    var p = ((tSec % T) + T) % T;
    /* 0..16 dwell, 16..80 transit, 80..96 dwell, 96..160 return */
    var uA;
    var phase;
    if (p < 16.0) {
      uA = 0.0; phase = 'dwell-top';
    } else if (p < 80.0) {
      uA = G.smooth(16.0, 80.0, p); phase = 'descending';
    } else if (p < 96.0) {
      uA = 1.0; phase = 'dwell-bottom';
    } else {
      uA = 1.0 - G.smooth(96.0, 160.0, p); phase = 'ascending';
    }
    var uB = 1.0 - uA;
    var pitch = Math.atan2(HOIST_SPEC.topY - HOIST_SPEC.botY, HOIST_SPEC.botX - HOIST_SPEC.topX);
    return {
      t: p,
      phase: phase,
      uA: +uA.toFixed(4),
      uB: +uB.toFixed(4),
      drumAngle: +(uA * Math.PI * 14.0).toFixed(4),
      pitch: +pitch.toFixed(4),
      carA: {
        x: +G.lerp(HOIST_SPEC.topX, HOIST_SPEC.botX, uA).toFixed(3),
        y: +G.lerp(HOIST_SPEC.topY, HOIST_SPEC.botY, uA).toFixed(3),
        z: HOIST_SPEC.laneZ_A
      },
      carB: {
        x: +G.lerp(HOIST_SPEC.topX, HOIST_SPEC.botX, uB).toFixed(3),
        y: +G.lerp(HOIST_SPEC.topY, HOIST_SPEC.botY, uB).toFixed(3),
        z: HOIST_SPEC.laneZ_B
      }
    };
  }

  /* Sutar-Tawar Clock Observatory & Gorge Waterwheel kinematics */
  function clockState(tSec) {
    var sec = tSec == null ? 0 : +tSec;
    var armillaryYaw = (sec * 0.18) % (Math.PI * 2);
    var millWheelPitch = (sec * 1.15) % (Math.PI * 2);
    var strikePhase = sec % 30.0;
    var jackSwing = strikePhase < 3.0 ? Math.sin(strikePhase * Math.PI * 2.0) * 0.42 : 0.0;
    return {
      armillaryYaw: +armillaryYaw.toFixed(4),
      millWheelPitch: +millWheelPitch.toFixed(4),
      jackSwing: +jackSwing.toFixed(4)
    };
  }

  /* Conserved Circuit E6 SIM Economy & Trade Corridors (tons/year, matching openworld/trade-fleets-gemini.json) */
  var SIM_LEDGER = {
    settlementId: 'spwjwosq9c',
    name: 'Mirabilis',
    polity: 'Eternal State',
    circuit: 'E6',
    urbanPop: 1844,
    prefecturePop: 2600,
    corridors: [
      { id: 'fulcrum_mirabilis', name: 'Fulcrum <-> Mirabilis State Highway & Hoist', km: 295.1, convoys: 8.1, tonsYr: 1809.3, operator: 'Eternal State' },
      { id: 'mirabilis_tone', name: 'Mirabilis <-> Tone Escarpment Road', km: 154.9, convoys: 6.1, tonsYr: 1257.1, operator: 'Eternal State' },
      { id: 'ukor_tera_pass', name: 'Ukor-Tera Divide Pass <-> Kuran Legation', km: 453.0, convoys: 2.4, tonsYr: 186.0, operator: 'Hueru-Kuran Whale-Clan' },
      { id: 'trench_lake_pack', name: 'Slump Trench Lakes <-> Mirabilis', km: 79.0, convoys: 1.5, tonsYr: 94.0, operator: 'Hayrant Clans' }
    ],
    /* Annual material balance (t/yr): inflow + produced === consumed + exported + reserveDelta */
    books: [
      { good: 'grain_food', inflow: 1208.5, produced: 940.0, consumed: 1980.0, exported: 148.5, reserveDelta: 20.0 },
      { good: 'coal', inflow: 574.5, produced: 0.0, consumed: 564.5, exported: 0.0, reserveDelta: 10.0 },
      { good: 'larch_timber', inflow: 367.4, produced: 420.0, consumed: 612.4, exported: 165.0, reserveDelta: 10.0 },
      { good: 'iron_wrought', inflow: 1.3, produced: 485.0, consumed: 146.3, exported: 332.0, reserveDelta: 8.0 },
      { good: 'gold_silver_bullion', inflow: 0.0, produced: 18.4, consumed: 1.2, exported: 17.0, reserveDelta: 0.2 },
      { good: 'tin_ingot', inflow: 0.0, produced: 46.0, consumed: 14.0, exported: 31.0, reserveDelta: 1.0 },
      { good: 'saltpeter', inflow: 0.0, produced: 112.0, consumed: 18.0, exported: 92.0, reserveDelta: 2.0 },
      { good: 'porcelain_insulators', inflow: 0.0, produced: 164.0, consumed: 22.0, exported: 138.0, reserveDelta: 4.0 },
      { good: 'nephrite_jade', inflow: 128.0, produced: 0.0, consumed: 24.0, exported: 101.0, reserveDelta: 3.0 },
      { good: 'whalebone_chimes', inflow: 58.0, produced: 0.0, consumed: 16.0, exported: 41.0, reserveDelta: 1.0 },
      { good: 'bench_tea', inflow: 68.8, produced: 84.0, consumed: 62.8, exported: 88.0, reserveDelta: 2.0 },
      { good: 'madder_plaid', inflow: 0.0, produced: 74.0, consumed: 29.0, exported: 43.0, reserveDelta: 2.0 },
      { good: 'state_paper', inflow: 99.8, produced: 0.0, consumed: 78.8, exported: 19.0, reserveDelta: 2.0 },
      { good: 'salted_fish', inflow: 94.0, produced: 0.0, consumed: 82.0, exported: 10.0, reserveDelta: 2.0 }
    ]
  };

  function auditLedger() {
    var maxImbalance = 0;
    for (var i = 0; i < SIM_LEDGER.books.length; i++) {
      var b = SIM_LEDGER.books[i];
      var lhs = b.inflow + b.produced;
      var rhs = b.consumed + b.exported + b.reserveDelta;
      var err = Math.abs(lhs - rhs);
      if (err > maxImbalance) maxImbalance = err;
    }
    return { ok: maxImbalance < 1e-6, books: SIM_LEDGER.books.length, maxImbalance: maxImbalance };
  }

  return {
    YUT_UPPER_PTS: YUT_UPPER_PTS,
    YUT_LOWER_PTS: YUT_LOWER_PTS,
    MILL_LEAT_PTS: MILL_LEAT_PTS,
    MOON_FALL: MOON_FALL,
    SIRU_FALL: SIRU_FALL,
    STILL_POOLS: STILL_POOLS,
    HOIST_SPEC: HOIST_SPEC,
    SIM_LEDGER: SIM_LEDGER,
    flowMonotonic: flowMonotonic,
    hoistState: hoistState,
    clockState: clockState,
    auditLedger: auditLedger
  };
})();
