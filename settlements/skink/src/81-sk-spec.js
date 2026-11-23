/* ==================== Skink 81: the site specification for kits/lizardmen/settle (LZV_SPEC, [G data]) ==================== */
/* Turned from settlements/skink/spec.json (settlements/skink/PLAN.md; kits/lizardmen/settle/GUIDE.md section 4.1).
   Page frame: x east, z south, metres from proposed pin 5.1 px 691,1521 (-1,633 m, halite grade 254 basin floor).
   Includes the 4-winding spiral (1,500 people), three rock-salt mines on the halite flat, seven squared-spiral evaporating
   salt pans on the north shore of the -1,706 m salt lake 7.5 km SSE, and skink.pans on core/hamlet/lizardmen. Plain data. */
var LZV_SPEC = (function () {
  var LAKE_LEVEL = -1706.0;
  var mouth = [-230.4, 329.0];

  /* Nest court grade + shore-edge salt-pan shelf along the north waterline of the -1,706 m salt lake */
  var grades = [{ x: 0, z: 0, r0: 24, r1: 52, to: 'pin', clamp: 2.0, w: 0.88 }];
  var panZ = 7555;
  var panXs = [2280, 2375, 2470, 2565, 2660, 2755, 2850];
  panXs.forEach(function (px) {
    grades.push({ x: px, z: panZ, r0: 22, r1: 56, to: LAKE_LEVEL + 0.72, clamp: 2.8, w: 0.96 });
  });

  var sites = [
    { key: 'lz-mine', x: 1300, z: 900, ry: -2.2, kind: 'works', name: 'East rock-salt quarry on the halite flat (grade 254)' },
    { key: 'lz-mine', x: -900, z: 1400, ry: 2.6, kind: 'works', name: 'West rock-salt quarry on the halite flat (grade 254)' },
    { key: 'lz-mine', x: 400, z: 2100, ry: -2.9, kind: 'works', name: 'South rock-salt quarry on the halite flat' }
  ];
  panXs.forEach(function (px, idx) {
    sites.push({
      key: 'gl-pans',
      x: px,
      z: panZ,
      ry: 0,
      kind: 'works',
      name: 'Squared-spiral evaporating salt pans ' + (idx + 1) + ' on the north shore'
    });
  });
  sites.push(
    { key: 'gl-saltstore', x: 2220, z: panZ - 42, ry: 0, kind: 'works', name: 'Shore-bench curing salt store' },
    { key: 'lz-orchard', x: -210, z: -780, ry: 0.2, kind: 'farm', name: 'Savanna basin frillpod and fruit grove' },
    { key: 'lz-orchard', x: 220, z: -820, ry: -0.2, kind: 'farm', name: 'East-field frillpod and fruit grove' },
    { key: 'lz-quarry', x: -1240, z: -560, ry: 1.25, kind: 'works', name: 'Basin-edge basalt quarry (footing and pan stone)' },
    { key: 'lz-waystone', x: 520, z: 610, ry: 0.95, kind: 'monument', name: 'East-quarry Coil waystone and salt sledge' },
    { key: 'lz-waystone', x: 380, z: 2040, ry: 0.35, kind: 'monument', name: 'Halite-flat Coil waystone and salt sledge' },
    { key: 'lz-waystone', x: 1380, z: 4550, ry: 0.42, kind: 'monument', name: 'Mid-basin Coil waystone and salt sledge' },
    { key: 'lz-waystone', x: 2240, z: 6680, ry: 0.42, kind: 'monument', name: 'Lake-approach Coil waystone and salt sledge' }
  );

  var campSite = [2480, 7220];
  var campRes = [2565, 7445];

  return {
    key: 'skink',
    name: 'Skink',
    seed: 8701,
    records: SK_REC,
    grade: grades,
    spiral: {
      axis: 177.5,
      windings: 4,
      depth0: 32,
      court: 40,
      street: 7,
      ratio: 1.25,
      mouthExtra: 18
    },
    ley: {
      to: [651.9, 1486.7],
      name: 'the west reliquary',
      stone: 50
    },
    court: {
      nest: 'lz-nest'
    },
    pools: {
      w0: [['lz-warren', 1]],
      w1: [['lz-warren', 4], ['lz-tower', 2]],
      w2: [['lz-makers', 1]],
      w3: [['lz-longhouse', 2], ['lz-lodge', 2]]
    },
    maxPerArm: [2, 3, 9, 5],
    tiers: [
      { w: 2, pool: [['lz-makers', 1]], n: 1, set: 15.2 }
    ],
    gaps: {
      w0: [2.4, 4.6],
      w1: [3.4, 6.4],
      w2: [4.2, 8.2],
      w3: [12.0, 20.0]
    },
    wells: [1, 2, 2, 2],
    specials: [
      ['gl-tank', 0, 0, 0.52, 2.2],
      ['lz-seer', 0, 1, 0.45, 2.0],
      ['lz-medicine', 0, 2, 0.38, 1.8],
      ['lz-obelisk', 0, 3, 0.55, 2.0],
      ['lz-tower', 1, 0, 0.26, 1.9],
      ['lz-tower', 1, 2, 0.72, 1.9],
      ['lz-hall-bronze', 2, 0, 0.35, 2.0],
      ['gl-saltstore', 2, 1, 0.55, 2.0],
      ['lz-hall-bone', 2, 2, 0.38, 2.0],
      ['gl-saltstore', 2, 3, 0.45, 2.0],
      ['lz-granary', 3, 0, 0.30, 2.2],
      ['lz-bakehouse', 3, 1, 0.34, 2.2],
      ['lz-barracks', 3, 2, 0.50, 2.4],
      ['lz-fermentery', 3, 3, 0.66, 2.2]
    ],
    mouth: {
      muster: true,
      tents: ['lc-seer', 'lc-hide']
    },
    fields: {
      dir: [0.0, -1.0],
      r0: 700,
      r1: 3600,
      w: 120,
      d: 80,
      half: 6,
      crops: ['ashmillet', 'sandpan-fonio', 'frillpod'],
      farms: 4,
      windmills: 2,
      maxSlope: 0.12,
      gaps: 24,
      circle: true
    },
    lake: {
      name: 'The salt lake under the Pile',
      level: LAKE_LEVEL,
      band: 18,
      field: 0.06,
      shallow: 0x92a28c,
      deep: 0x31524e,
      label: 'the salt lake under the Pile (32 km2, -1,706 m, salt)'
    },
    hamlet: {
      id: 'skink.pans',
      focus: 'salt',
      site: campSite,
      link: mouth,
      resource: campRes,
      workers: 90,
      popMax: 160
    },
    expect: {
      people: 1500,
      wells: 10,
      spiral: 50,
      keys: ['lz-nest', 'lz-ley', 'lz-muster', 'gl-tank', 'lz-mine', 'gl-pans', 'gl-saltstore', 'lz-bakehouse', 'lz-fermentery', 'lz-orchard', 'lz-quarry', 'lz-waystone'],
      lake: true,
      hamlet: true
    },
    look: {
      hour: 10.0,
      dens: 1.9,
      fog: 0.00004,
      base: 0x6e6844,
      shore: 0xdad6ca,
      till: 0x5c4632,
      yard: 0x786848,
      bed: 0x465248,
      farShore: 0xcac6b8,
      farLow: 0x6c6642,
      farMid: 0x5c5842,
      label: 'The halite basin of Skink (abyssal savanna XV, -1,633 m, halite grade 254)'
    },
    layers: {
      base: 'gSav',
      yard: 'gYard',
      till: 'gTill',
      shore: 'gSalt'
    },
    sites: sites,
    shoreBoxes: [
      [1140, 740, 1460, 1060],
      [-1060, 1240, -740, 1560],
      [240, 1940, 560, 2260],
      [2160, 7060, 2940, 7640]
    ],
    ways: [
      { id: 'east-halite-track', w: 5.5, pts: [mouth, [520, 620], [1300, 900]] },
      { id: 'west-halite-track', w: 5.0, pts: [mouth, [-900, 1400]] },
      { id: 'salt-lake-road', w: 6.5, pts: [mouth, [400, 2100], [1360, 4550], [2230, 6680], campSite, [2565, panZ - 24]] }
    ],
    views: [
      { name: 'Overview', at: [0, 0], from: [-540, 330, 720] },
      { name: 'The rock-salt quarries', at: [1300, 900], from: [-95, 42, 115], up: 2 },
      { name: 'The pans on the salt lake', at: [2565, panZ - 10], from: [-225, 76, -215], up: 2 },
      { name: 'The mouth and mustering ground', at: [-219, 365], from: [-85, 36, 95], up: 3 }
    ]
  };
})();
