/* ==================== Iguana 81: the site specification for kits/lizardmen/settle (LZV_SPEC, [G data]) ==================== */
/* Turned from settlements/iguana/spec.json (settlements/iguana/PLAN.md; settlements/skink/PLAN.md section 8 question 6;
   kits/lizardmen/settle/GUIDE.md section 4.1). Page frame: x east, z south, metres from proposed pin 5.1 px 713,1569 (-373 m,
   0.3 % plateau). Includes the 27-hall squared-spiral Great Granary (-1.25 km west), the three lookouts watching Loj Nahn on
   the Pile, the farming hamlet (iguana.farm) 3.3 km WSW, and Muckle Weyt Beck's channel grade + tin placer camp (iguana.placer)
   and three lz-placer washing floors in the NW corner (8 t/yr of tin on r202, resolved via KRES.near). Plain data. */
var LZV_SPEC = (function () {
  var granaryPts = [
    [-1224, 0], [-1224, 26], [-1250, 26], [-1276, 26], [-1276, 0],
    [-1276, -26], [-1250, -26], [-1224, -26], [-1198, -26], [-1198, 0],
    [-1198, 26], [-1198, 52], [-1224, 52], [-1250, 52], [-1276, 52],
    [-1302, 52], [-1302, 26], [-1302, 0], [-1302, -26], [-1302, -52],
    [-1276, -52], [-1250, -52], [-1224, -52], [-1198, -52], [-1172, -52],
    [-1172, -26], [-1172, 0]
  ];
  var sites = granaryPts.map(function (p) {
    var ry = Math.abs(p[1]) >= 26 ? (p[1] > 0 ? Math.PI : 0) : (p[0] < -1237 ? Math.PI / 2 : -Math.PI / 2);
    return { key: 'lz-granary', x: p[0], z: p[1], ry: +ry.toFixed(4), kind: 'granary', name: 'A hall of the Great Granary' };
  });

  var tinPlacer = { id: 'res:placer-tin:r202:5', river: 'r202', grade: 'high', x: -24800, z: -10425.5 };
  if (typeof KRES !== 'undefined' && KRES.near) {
    var pinPx = (typeof LZV_GROUND !== 'undefined' && LZV_GROUND.pin) ? LZV_GROUND.pin : [713, 1569];
    var tinNodes = KRES.near(-24800, -10425, 'tin', 5000, { origin: { x: pinPx[0] * 2000, z: pinPx[1] * 2000 } });
    if (tinNodes && tinNodes.length) {
      tinPlacer = {
        id: tinNodes[0].id,
        river: tinNodes[0].river || 'r202',
        grade: tinNodes[0].grade || 'high',
        x: Math.round(tinNodes[0].x),
        z: Math.round(tinNodes[0].z)
      };
    }
  }

  /* Three tin washing floors along the townward SE bank of Muckle Weyt Beck (r202, channel line z - x = 2400) */
  var sluicePts = [[-4722, -2358], [-4786, -2422], [-4850, -2486]];
  sluicePts.forEach(function (sp, idx) {
    sites.push({
      key: 'lz-placer',
      x: sp[0],
      z: sp[1],
      ry: 2.3562,
      kind: 'works',
      name: 'Tin placer washing floor ' + (idx + 1) + ' on Muckle Weyt Beck (r202 cassiterite gravel)'
    });
  });

  var extraWays = [];
  if (typeof KHAMLET !== 'undefined' && KHAMLET.village && typeof DEFS !== 'undefined') {
    var placerHamlet = KHAMLET.village({
      id: 'iguana.placer',
      world: 8509,
      culture: 'lizardmen',
      focus: 'mine',
      site: { x: -4460, z: -2320 },
      link: { x: -1315, z: 0 },
      resource: { x: -4650, z: -2430, workers: 48 },
      popMax: 120,
      dims: function (k) { var D = DEFS[k]; return D ? { key: k, v: 0, w: D.w, d: D.d, h: D.h == null ? 8 : D.h } : null; },
      ground: { ok: function (x, z) { return x > -5020 && x < 4920 && z > -4920 && z < 4920 && (z - x) < 2350; } }
    });
    if (placerHamlet && !placerHamlet.error && placerHamlet.records) {
      placerHamlet.records.forEach(function (hr) {
        if (!hr.pending) sites.push({ key: hr.key, x: hr.x, z: hr.z, ry: hr.ry, kind: 'hamlet', pad: 0.2 });
      });
      sites.push({ key: 'gl-well', x: -4448, z: -2328, ry: 0, kind: 'well', pad: 0.2 });
    }
    if (placerHamlet && placerHamlet.lanes) {
      placerHamlet.lanes.forEach(function (ln, li) {
        extraWays.push({ id: 'placer-lane-' + li, w: 5.0, pts: ln.pts });
      });
    }
  }

  sites.push(
    { key: 'lz-lookout', x: 2600, z: -400, ry: 1.6, kind: 'lookout', name: 'Inner lookout toward the Pile (the watch on Loj Nahn)' },
    { key: 'lz-lookout', x: 3700, z: 300, ry: 1.6, kind: 'lookout', name: 'Middle lookout toward the Pile (the watch on Loj Nahn)' },
    { key: 'lz-lookout', x: 4700, z: -200, ry: 1.6, kind: 'lookout', name: 'Outer lookout toward the Pile (the watch on Loj Nahn)' },
    { key: 'lz-orchard', x: -1460, z: -195, ry: 0.15, kind: 'farm', name: 'North granary Rift fruit and pod grove' },
    { key: 'lz-orchard', x: -1460, z: 195, ry: -0.15, kind: 'farm', name: 'South granary Rift fruit and pod grove' },
    { key: 'lz-orchard', x: -2620, z: 1140, ry: 0.4, kind: 'farm', name: 'Hamlet plateau fruit and tuber grove' },
    { key: 'lz-quarry', x: 1850, z: -160, ry: -1.45, kind: 'works', name: 'East-plateau basalt quarry' },
    { key: 'lz-waystone', x: -840, z: 22, ry: -1.57, kind: 'monument', name: 'Granary-road Coil waystone and grain sledge' },
    { key: 'lz-waystone', x: -1820, z: 480, ry: -2.15, kind: 'monument', name: 'West-hamlet Coil waystone and grain sledge' },
    { key: 'lz-waystone', x: -2460, z: 980, ry: -2.2, kind: 'monument', name: 'Outer-hamlet Coil waystone' },
    { key: 'lz-waystone', x: -2900, z: -1180, ry: -2.02, kind: 'monument', name: 'Muckle Weyt Beck tin-haul waystone and sledge' },
    { key: 'lz-waystone', x: 1500, z: 98, ry: 1.95, kind: 'monument', name: 'Pile-watch road Coil waystone' },
    { key: 'lz-waystone', x: 3150, z: -32, ry: 1.1, kind: 'monument', name: 'Middle-watch Coil waystone' }
  );

  /* Continuous river-bed trough along Muckle Weyt Beck (r202, 5.4 km NW) before KDRAWN registers nearH */
  var grades = [{ x: 0, z: 0, r0: 30, r1: 64, to: 'pin', clamp: 2.1, w: 0.88 }];
  var beck = [];
  for (var bi = 0; bi <= 26; bi++) {
    var bx = -4660 - bi * 16, bz = -2260 - bi * 16;
    grades.push({ x: bx, z: bz, r0: 11, r1: 26, to: -430, clamp: 0.68, w: 1.0 });
    if (bi % 4 === 0 || bi === 26) beck.push([bx, bz]);
  }

  return {
    key: 'iguana',
    name: 'Iguana',
    seed: 8501,
    records: IG_REC,
    tinPlacer: tinPlacer,
    grade: grades,
    beckPts: beck,
    spiral: {
      axis: 105,
      windings: 5,
      depth0: 44,
      court: 52,
      street: 7,
      ratio: 1.25,
      mouthExtra: 24
    },
    ley: {
      to: [790, 1578],
      name: 'the east reliquary',
      stone: 58
    },
    court: {
      nest: 'lz-nest'
    },
    pools: {
      w0: [['lz-warren', 1]],
      w1: [['lz-warren', 4], ['lz-tower', 3]],
      w2: [['lz-makers', 1]],
      w3: [['lz-longhouse', 1]],
      w4: [['lz-longhouse', 2], ['lz-lodge', 1]]
    },
    maxPerArm: [4, 5, 8, 6, 7],
    tiers: [
      { w: 2, pool: [['lz-makers', 1]], n: 1, set: 18.0 }
    ],
    gaps: {
      w0: [2.4, 4.6],
      w1: [3.6, 7.0],
      w2: [5.0, 9.0],
      w3: [14.0, 24.0],
      w4: [16.0, 28.0]
    },
    wells: [1, 2, 2, 3, 3],
    specials: [
      ['gl-tank', 0, 0, 0.52, 2.2],
      ['lz-seer', 0, 1, 0.45, 2.0],
      ['lz-medicine', 0, 2, 0.38, 1.8],
      ['lz-obelisk', 0, 3, 0.55, 2.0],
      ['lz-tower', 1, 0, 0.25, 2.0],
      ['lz-tower', 1, 1, 0.72, 2.0],
      ['lz-tower', 1, 2, 0.28, 2.0],
      ['lz-tower', 1, 3, 0.74, 2.0],
      ['lz-hall-bronze', 2, 0, 0.35, 2.0],
      ['lz-hall-reed', 2, 1, 0.62, 2.0],
      ['lz-hall-bone', 2, 2, 0.38, 2.0],
      ['lz-warehouse', 2, 3, 0.60, 2.0],
      ['lz-bakehouse', 3, 0, 0.32, 2.2],
      ['lz-bakehouse', 3, 2, 0.36, 2.2],
      ['lz-fermentery', 3, 3, 0.66, 2.2],
      ['lz-barracks', 4, 1, 0.35, 2.4]
    ],
    mouth: {
      muster: true,
      tents: ['lc-seer', 'lc-sail']
    },
    fields: {
      dir: [-1.0, 0.0],
      r0: 1500,
      r1: 4600,
      w: 140,
      d: 90,
      half: 14,
      crops: ['rice', 'helix-bean', 'sweet-potato', 'ashroot'],
      farms: 11,
      windmills: 7,
      maxSlope: 0.10,
      gaps: 12,
      circle: true
    },
    hamlet: {
      id: 'iguana.farm',
      focus: 'farming',
      site: [-3000, 1400],
      link: [-1250, 0],
      resource: [-3260, 1400],
      workers: 110,
      popMax: 210
    },
    expect: {
      people: 3000,
      wells: 15,
      keys: ['lz-nest', 'lz-ley', 'lz-muster', 'gl-tank', 'lz-granary', 'lz-lookout', 'lz-windmill', 'lz-placer', 'lz-mine', 'lz-bakehouse', 'lz-fermentery', 'lz-orchard', 'lz-quarry', 'lz-waystone'],
      lake: false,
      hamlet: true
    },
    look: {
      hour: 9.0,
      dens: 1.7,
      fog: 0.00003,
      base: 0x52643a,
      shore: 0x58663e,
      till: 0x4a3b28,
      yard: 0x766648,
      farLow: 0x4e5e38,
      farMid: 0x445234,
      label: 'The plateau of Iguana (tropical rainforest Af, -373 m, 14.6 km west of the Pile)'
    },
    layers: {
      base: 'gGrass',
      yard: 'gYard',
      till: 'gTill',
      shore: 'gTerr'
    },
    sites: sites,
    shoreBoxes: [
      [-1360, -110, -1120, 110],
      [-3220, 1180, -2780, 1620]
    ],
    ways: [
      { id: 'granary-road', w: 6.5, pts: [[-560, 0], [-1160, 0], [-1315, 0], [-1520, 0]] },
      { id: 'granary-spiral', w: 8.0, pts: granaryPts },
      { id: 'hamlet-road', w: 5.5, pts: [[-1315, 0], [-2100, 680], [-3000, 1400]] },
      { id: 'beck-placer-road', w: 6.0, pts: [[-1315, 0], [-2900, -1160], [-4460, -2320], [-4650, -2430], [-4722, -2358], [-4786, -2422], [-4850, -2486]] },
      { id: 'pile-watch-road', w: 5.5, pts: [[474.5, 568.8], [1500, 80], [2600, -400], [3700, 300], [4700, -200]] }
    ].concat(extraWays),
    views: [
      { name: 'Overview', at: [0, 0], from: [-800, 460, 900] },
      { name: 'The Great Granary', at: [-1240, 0], from: [-155, 68, 155], up: 4 },
      { name: 'The watch on the Pile', at: [2600, -400], from: [-62, 28, 62], up: 6 },
      { name: 'The farming hamlet', at: [-3000, 1400], from: [195, 76, 195], up: 4 },
      { name: 'Muckle Weyt Beck', at: [-4715, -2395], from: [195, 72, 105], up: 2 }
    ]
  };
})();
