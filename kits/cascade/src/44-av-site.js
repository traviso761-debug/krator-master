// ================================================================= ARCVILLAGE — site ground, canal loop & twin circular gardens  [G data]
// Sheet 1 #1 & Sheet 2 #2: the southern reservoir feeder canal, the central water court inside the arcology, and the
// east & west canal loops irrigating the Twin Circular Gardens (vegetable rings west, orchard & grain rings east),
// with deterministic crop choices from kits/crops (CROPS.forBiome('nhighlands')) and highland flora sockets.
// No THREE, no DOM.
var AV = typeof AV !== 'undefined' ? AV : {};
(function () {
  'use strict';
  var TAU = Math.PI * 2;
  function r3(v) { return Math.round(v * 1000) / 1000; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  function segDist(px, pz, ax, az, bx, bz) {
    var dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
    var t = l2 > 1e-9 ? clamp(((px - ax) * dx + (pz - az) * dz) / l2, 0, 1) : 0;
    return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
  }
  function polyDist(px, pz, pts) {
    var best = 1e9;
    for (var i = 0; i + 1 < pts.length; i++) {
      var d = segDist(px, pz, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      if (d < best) best = d;
    }
    return best;
  }

  // Hydraulic centerlines (world frame around the (0,0) refurbished centerpiece):
  //   1. Elevated South Headrace Aqueduct (y = 32.4 -> 31.8 m): from upland reservoir (0, 476) north into Central Cataract (0, 17.5)
  //   2. South Lower Tailrace Spillway (y = -0.8 -> -0.88 m): from Central Turbine Pit (0, 18) south under the aqueduct arches to (0, 460)
  //   3. East & West Tailrace Trunk Canals: from Central Turbine Pit (±18, 0) through Sluice Houses & Barge Docks into Twin Circular Gardens
  AV.CANAL_LINES = (function () {
    var G = AV.DIM.GARDENS;
    function ringArc(cx, cz, R, a0, a1, n) {
      var out = [];
      for (var i = 0; i <= n; i++) {
        var a = a0 + (a1 - a0) * (i / n);
        out.push([r3(cx + R * Math.cos(a)), r3(cz + R * Math.sin(a))]);
      }
      return out;
    }
    var rC = G.east.r + 11.0;
    return {
      aqueduct: [[0, 476], [0, 320], [0, 186], [0, 17.5]],
      south: [[0, 18], [0, 120], [0, 260], [0, 460]],
      eastStem: [[18, 0], [95, 0], [G.east.cx - rC, 0]],
      eastNorth: ringArc(G.east.cx, G.east.cz, rC, Math.PI, 0, 16),
      eastSouth: ringArc(G.east.cx, G.east.cz, rC, Math.PI, TAU, 16),
      westStem: [[-18, 0], [-95, 0], [G.west.cx + rC, 0]],
      westNorth: ringArc(G.west.cx, G.west.cz, rC, 0, -Math.PI, 16),
      westSouth: ringArc(G.west.cx, G.west.cz, rC, 0, Math.PI, 16)
    };
  })();

  // Distance to nearest canal waterway or central water basin (0 inside central basin)
  AV.canalDist = function (x, z) {
    var D = AV.DIM, L = AV.CANAL_LINES;
    var boxD = Math.max(Math.abs(x) - D.BASIN_HALF, Math.abs(z) - D.BASIN_HALF);
    var best = Math.max(0, boxD);
    var checks = [
      [L.south, D.CANAL_W * 0.5],
      [L.eastStem, D.CANAL_W * 0.5],
      [L.westStem, D.CANAL_W * 0.5],
      [L.eastNorth, 5.5],
      [L.eastSouth, 5.5],
      [L.westNorth, 5.5],
      [L.westSouth, 5.5]
    ];
    for (var i = 0; i < checks.length; i++) {
      var d = Math.max(0, polyDist(x, z, checks[i][0]) - checks[i][1]);
      if (d < best) best = d;
    }
    return best;
  };

  // Ground heightfield (metres): flat plain at y = 0 round the three showcase sites, carved to -3.2 m in the canal
  // channels & central basin, with gentle surrounding highland hills beyond r > 560 m.
  AV.groundH = function (x, z) {
    var D = AV.DIM, cd = AV.canalDist(x, z);
    if (cd < 5.5) {
      var f = smooth(0.0, 5.5, cd);
      return D.CANAL_BED_Y * (1 - f);
    }
    /* Keep the three arcology pads & twin gardens level so footings and KRUINS wrecks sit cleanly at y = 0 */
    var dMain = Math.max(Math.hypot(x, z) / 450, 0);
    var dIntact = Math.hypot(x + 900, z + 700) / 260;
    var dRuined = Math.hypot(x - 900, z + 700) / 260;
    var clear = Math.min(dMain, dIntact, dRuined);
    if (clear <= 1.0) return 0.0;
    var rise = smooth(1.0, 2.4, clear);
    var n1 = KRAND.vnoise(x * 0.0018, z * 0.0018, 0, 412);
    var n2 = KRAND.vnoise(x * 0.0045, z * 0.0045, 3, 412);
    return r3(rise * (18.0 * n1 + 6.0 * n2));
  };

  AV.waterH = function (x, z) {
    return AV.canalDist(x, z) < 4.8 ? AV.DIM.CANAL_WATER_Y : -1e6;
  };

  // Select northern-highlands crops deterministically through kits/crops (CROPS.forBiome('nhighlands'))
  AV.gardenCrops = function (seed) {
    var s = seed == null ? 19690 : (seed | 0);
    if (typeof CROPS === 'undefined' || !CROPS.forBiome) {
      return {
        vegetable: ['cabbage', 'turnip', 'leek', 'pea'],
        orchard: ['apple', 'pear', 'plum', 'barley']
      };
    }
    var fit = CROPS.forBiome('nhighlands', {});
    var pick = function (bucket, salt, fb) {
      var r = CROPS.pick(fit, bucket, { seed: s, salt: salt });
      return r && r.crop ? r.crop.id : fb;
    };
    return {
      vegetable: [
        pick('greens', 11, 'cabbage'),
        pick('tuber', 12, 'turnip'),
        pick('vegetable', 13, 'leek'),
        pick('pulse', 14, 'pea')
      ],
      orchard: [
        pick('fruit', 21, 'apple'),
        pick('berry', 22, 'bilberry'),
        pick('grain', 23, 'barley'),
        pick('fibre', 24, 'flax')
      ]
    };
  };

  // Twin Circular Gardens + Rooftop Cloister records: raised beds, radial paths, highland trees & understorey plants
  AV.sitePlan = function (seed) {
    var s = seed == null ? 19690 : (seed | 0);
    var G = AV.DIM.GARDENS, crops = AV.gardenCrops(s);
    var beds = [], flora = [];
    var treeKeys = ['birch', 'rowan', 'brookwillow', 'gnarloak', 'mountainmaple', 'larch'];

    [G.west, G.east].forEach(function (gd, gi) {
      var rings = [
        { r0: 16, r1: 38, sectors: 8 },
        { r0: 44, r1: 70, sectors: 12 },
        { r0: 76, r1: 100, sectors: 16 }
      ];
      rings.forEach(function (rg, ri) {
        for (var si = 0; si < rg.sectors; si++) {
          var a0 = (si / rg.sectors) * TAU + 0.04, a1 = ((si + 1) / rg.sectors) * TAU - 0.04;
          var am = (a0 + a1) * 0.5;
          /* Leave East-West canal axis clear across the garden's entry/exit */
          if (Math.abs(Math.sin(am)) < 0.16) continue;
          var cList = gd.role === 'vegetable' ? crops.vegetable : crops.orchard;
          var cropId = cList[(ri + si) % cList.length];
          beds.push({
            id: gd.id + '.bed.' + ri + '.' + si,
            garden: gd.id,
            role: gd.role,
            crop: cropId,
            cx: gd.cx,
            cz: gd.cz,
            r0: rg.r0,
            r1: rg.r1,
            a0: r3(a0),
            a1: r3(a1)
          });
          /* Orchard ring & windbreak perimeter get northern-highlands trees; vegetable beds get shrubs/herbs */
          var rm = (rg.r0 + rg.r1) * 0.5;
          var px = r3(gd.cx + rm * Math.cos(am)), pz = r3(gd.cz + rm * Math.sin(am));
          if (gd.role === 'orchard' && (ri >= 1) && (si % 2 === 0)) {
            var tk = treeKeys[(si + ri + gi) % 4];
            flora.push({
              id: gd.id + '.tree.' + ri + '.' + si,
              ref: 'nhighlands.' + tk,
              x: px, y: 0.35, z: pz,
              scale: r3(0.42 + 0.18 * AV.u(s, 800 + gi, ri, si)),
              seed: (s + 1200 + gi * 200 + ri * 31 + si) | 0,
              zone: gd.id
            });
          } else if (ri === 2 && si % 3 === 0) {
            flora.push({
              id: gd.id + '.windbreak.' + si,
              ref: 'nhighlands.' + treeKeys[(si + gi) % treeKeys.length],
              x: r3(gd.cx + 103 * Math.cos(am)), y: 0.0, z: r3(gd.cz + 103 * Math.sin(am)),
              scale: r3(0.48 + 0.20 * AV.u(s, 860 + gi, 2, si)),
              seed: (s + 1600 + gi * 200 + si) | 0,
              zone: gd.id
            });
          }
        }
      });
    });

    // Canal bank willows & birches along the south feeder canal and ground garden courts
    for (var ci = 0; ci < 10; ci++) {
      var side = ci % 2 === 0 ? -1 : 1;
      var cz = 205 + Math.floor(ci / 2) * 46;
      var cx = side * (26 + 4 * AV.u(s, 910, ci, 1));
      flora.push({
        id: 'av.canal.tree.' + ci,
        ref: 'nhighlands.' + (ci % 3 === 0 ? 'brookwillow' : 'birch'),
        x: r3(cx), y: 0.0, z: r3(cz),
        scale: r3(0.50 + 0.22 * AV.u(s, 910, ci, 2)),
        seed: (s + 2100 + ci * 19) | 0,
        zone: 'canal'
      });
    }

    // Rooftop botanical cloister trees at y = 172.8 m around the central light well
    var ry = AV.DIM.ROOF.y;
    for (var rk = 0; rk < 12; rk++) {
      var ra = (rk / 12) * TAU + 0.13, rr = 62.0 + (rk % 2) * 10.0;
      /* Keep clear of the 4 cardinal pyramidal skylight portals */
      if (Math.abs(Math.cos(ra)) > 0.92 || Math.abs(Math.sin(ra)) > 0.92) continue;
      flora.push({
        id: 'av.roof.tree.' + rk,
        ref: 'nhighlands.' + (rk % 2 === 0 ? 'rowan' : 'birch'),
        x: r3(rr * Math.cos(ra)), y: ry + 0.4, z: r3(rr * Math.sin(ra)),
        scale: r3(0.38 + 0.14 * AV.u(s, 950, rk, 3)),
        seed: (s + 2400 + rk * 23) | 0,
        zone: 'roof'
      });
    }

    // Outer Northern Highlands valley groves framing the plain beyond the Twin Circular Gardens
    var groveSpecies = ['spirespruce', 'birch', 'mossmaple', 'larch', 'rowan'];
    for (var vg = 0; vg < 36; vg++) {
      var ga = (vg / 36) * TAU + 0.19 * AV.u(s, 980, vg, 1);
      var gr = 415.0 + 230.0 * AV.u(s, 980, vg, 2);
      var gx = r3(gr * Math.cos(ga)), gz = r3(gr * Math.sin(ga));
      /* Keep south feeder canal corridor & SE vista sightline clear */
      if (Math.abs(gx) < 42 && gz > 150) continue;
      if (Math.hypot(gx - 420, gz - 430) < 95) continue;
      if (AV.canalDist(gx, gz) < 18) continue;
      flora.push({
        id: 'av.valley.tree.' + vg,
        ref: 'nhighlands.' + groveSpecies[vg % groveSpecies.length],
        x: gx, y: r3(AV.groundH(gx, gz)), z: gz,
        scale: r3(0.55 + 0.30 * AV.u(s, 980, vg, 3)),
        seed: (s + 2800 + vg * 29) | 0,
        zone: 'valley'
      });
    }

    var sluices = [
      { id: 'av.sluice.east', name: 'East Tailrace Sluice House and Barge Lock', x: 142.0, z: 0.0, yaw: 0.0, gates: 2 },
      { id: 'av.sluice.west', name: 'West Tailrace Sluice House and Barge Lock', x: -142.0, z: 0.0, yaw: Math.PI, gates: 2 },
      { id: 'av.sluice.south', name: 'South Aqueduct Headgate Tower', x: 0.0, z: 188.0, y: 29.6, yaw: Math.PI / 2, gates: 3 }
    ];
    var barges = [
      { id: 'av.barge.east', name: 'East Tailrace Ore Barge', x: 118.0, z: 4.2, yaw: 0.0, L: 18.0, B: 4.6, cargo: 'ore' },
      { id: 'av.barge.west', name: 'West Tailrace Coal and Timber Barge', x: -118.0, z: -4.2, yaw: Math.PI, L: 18.0, B: 4.6, cargo: 'timber' },
      { id: 'av.barge.south.0', name: 'South Spillway Ingot Barge', x: 4.2, z: 248.0, yaw: Math.PI / 2, L: 19.0, B: 4.8, cargo: 'ingots' },
      { id: 'av.barge.south.1', name: 'South Spillway Grain Barge', x: -4.2, z: 302.0, yaw: -Math.PI / 2, L: 17.5, B: 4.5, cargo: 'grain' }
    ];

    return { crops: crops, beds: beds, flora: flora, sluices: sluices, barges: barges };
  };
})();
