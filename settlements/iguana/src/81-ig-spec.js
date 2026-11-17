/* ==================== Iguana 81: the site specification for kits/lizardmen/settle (LZV_SPEC, [G data]) ==================== */
/* Turned from settlements/iguana/spec.json (settlements/iguana/PLAN.md; kits/lizardmen/settle/GUIDE.md section 4.1).
   Page frame: x east, z south, metres from proposed pin 5.1 px 713,1569 (-373 m, 0.3 % plateau).
   Includes the 27-hall squared-spiral Great Granary (-1.25 km west), the three lookouts watching Loj Nahn on the Pile,
   the farming hamlet (iguana.farm) 3.3 km WSW, and Muckle Weyt Beck's channel grade in the NW corner. Plain data. */
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
  sites.push(
    { key: 'lz-lookout', x: 2600, z: -400, ry: 1.6, kind: 'lookout', name: 'Inner lookout toward the Pile (the watch on Loj Nahn)' },
    { key: 'lz-lookout', x: 3700, z: 300, ry: 1.6, kind: 'lookout', name: 'Middle lookout toward the Pile (the watch on Loj Nahn)' },
    { key: 'lz-lookout', x: 4700, z: -200, ry: 1.6, kind: 'lookout', name: 'Outer lookout toward the Pile (the watch on Loj Nahn)' }
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
    maxPerArm: [4, 5, 9, 6, 8],
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
      wells: 14,
      keys: ['lz-nest', 'lz-ley', 'lz-muster', 'gl-tank', 'lz-granary', 'lz-lookout', 'lz-windmill'],
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
      [-3220, 1180, -2780, 1620],
      [-5080, -2680, -4640, -2240]
    ],
    ways: [
      { id: 'granary-road', w: 6.5, pts: [[-560, 0], [-1160, 0], [-1315, 0], [-1520, 0]] },
      { id: 'granary-spiral', w: 8.0, pts: granaryPts },
      { id: 'hamlet-road', w: 5.5, pts: [[-1315, 0], [-2100, 680], [-3000, 1400]] },
      { id: 'pile-watch-road', w: 5.5, pts: [[474.5, 568.8], [1500, 80], [2600, -400], [3700, 300], [4700, -200]] }
    ],
    views: [
      { name: 'Overview', at: [0, 0], from: [-800, 460, 900] },
      { name: 'The Great Granary', at: [-1240, 0], from: [-155, 68, 155], up: 4 },
      { name: 'The watch on the Pile', at: [2600, -400], from: [-62, 28, 62], up: 6 },
      { name: 'The farming hamlet', at: [-3000, 1400], from: [195, 76, 195], up: 4 },
      { name: 'Muckle Weyt Beck', at: [-4860, -2460], from: [145, 52, 145], up: 1 }
    ]
  };
})();
