/* ==================== Komodo 81: the site specification for kits/lizardmen/settle (LZV_SPEC, [G data]) ==================== */
/* Turned from settlements/komodo/spec.json (settlements/komodo/PLAN.md; kits/lizardmen/settle/GUIDE.md section 4.1).
   Page frame: x east, z south, metres from pin 5.1 px 865,1617 (spnqhezhiw, -2,452 m, 11 % hypertropic bluff over the eastern sea).
   Includes the three shore fishing weirs (lz-weir), Kruk Warra's river-bed grade (r088, 51.3 m3/s), and the placer camp
   (komodo.placers) + three tin/gold washing floors (lz-placer) resolved via KRES.near 11.9 km east. Plain data. */
var LZV_SPEC = (function () {
  var SEA_LEVEL = -2595.5;
  var weirXs = [-320, 60, 440];
  var weirZ = -1908;

  /* Nest court grade, shallow beach benches under the three fishing weirs, and Kruk Warra's continuous river-bed trough */
  var grades = [{ x: 0, z: 0, r0: 26, r1: 56, to: 'pin', clamp: 2.1, w: 0.88 }];
  weirXs.forEach(function (wx) {
    grades.push({ x: wx, z: weirZ, r0: 14, r1: 38, to: SEA_LEVEL - 0.12, clamp: 1.4, w: 0.95 });
  });

  var mouth = [422.1, -323.9];
  var placerAt = [11631, -2400];
  if (typeof KRES !== 'undefined' && KRES.near) {
    var pinPx = (typeof LZV_GROUND !== 'undefined' && LZV_GROUND.pin) ? LZV_GROUND.pin : [865, 1617];
    var tinNodes = KRES.near(11640, -2400, 'tin', 1500, { origin: { x: pinPx[0] * 2000, z: pinPx[1] * 2000 } });
    if (tinNodes && tinNodes.length) {
      placerAt = [Math.round(tinNodes[0].x), Math.round(tinNodes[0].z)];
    }
  }
  var riverX = Math.round((placerAt[0] + 95) / 25) * 25;

  /* Kruk Warra (r088, perennial, 51.3 m3/s) running north past the placer gravel bar and out into the eastern sea */
  var krukSpine = [
    [riverX, 2600],
    [riverX, 600],
    [riverX, -1400],
    [riverX, -2525],
    [riverX - 275, -2750],
    [riverX - 675, -2975]
  ];
  var krukPts = [];
  (function () {
    var si, a, b, segLen, nStep, k, t, rx, rz;
    for (si = 0; si + 1 < krukSpine.length; si++) {
      a = krukSpine[si]; b = krukSpine[si + 1];
      segLen = Math.hypot(b[0] - a[0], b[1] - a[1]);
      nStep = Math.max(1, Math.round(segLen / 20));
      for (k = 0; k < nStep; k++) {
        t = k / nStep;
        rx = +(a[0] + (b[0] - a[0]) * t).toFixed(1);
        rz = +(a[1] + (b[1] - a[1]) * t).toFixed(1);
        grades.push({ x: rx, z: rz, r0: 22, r1: 52, to: -2604, clamp: 1.75, w: 1.0 });
        if (k % 5 === 0) krukPts.push([rx, rz]);
      }
    }
    var last = krukSpine[krukSpine.length - 1];
    grades.push({ x: last[0], z: last[1], r0: 22, r1: 52, to: -2604, clamp: 1.75, w: 1.0 });
    krukPts.push([last[0], last[1]]);
  })();

  var sites = weirXs.map(function (wx) {
    return { key: 'lz-weir', x: wx, z: weirZ, ry: 0, kind: 'works', name: 'Fishing weir and drying racks', wet: true };
  });

  var campSite = [placerAt[0] - 250, placerAt[1] + 200];
  var placerOffsetsZ = [-95, 0, 95];
  placerOffsetsZ.forEach(function (dz, idx) {
    sites.push({
      key: 'lz-placer',
      x: riverX - 26,
      z: placerAt[1] + dz,
      ry: -1.5708,
      kind: 'works',
      name: 'Placer washing floor ' + (idx + 1) + ' on Kruk Warra (tin and gold gravel)'
    });
  });

  return {
    key: 'komodo',
    name: 'Komodo',
    seed: 8401,
    records: KM_REC,
    grade: grades,
    krukPts: krukPts,
    spiral: {
      axis: 15,
      windings: 5,
      depth0: 32,
      court: 46,
      street: 7,
      ratio: 1.25,
      mouthExtra: 18
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
      w1: [['lz-warren', 5], ['lz-tower', 3]],
      w2: [['lz-makers', 1]],
      w3: [['lz-longhouse', 1]],
      w4: [['lz-lodge', 1]]
    },
    maxPerArm: [4, 6, 12, 6, 7],
    tiers: [
      { w: 2, pool: [['lz-makers', 1]], n: 3, set: 15.2 }
    ],
    gaps: {
      w0: [2.2, 4.2],
      w1: [3.2, 6.2],
      w2: [4.2, 8.2],
      w3: [12.0, 20.0],
      w4: [18.0, 30.0]
    },
    wells: [1, 2, 2, 2, 2],
    specials: [
      ['gl-tank', 0, 0, 0.52, 2.2],
      ['lz-seer', 0, 1, 0.45, 2.0],
      ['lz-medicine', 0, 2, 0.38, 1.8],
      ['lz-obelisk', 0, 3, 0.55, 2.0],
      ['lz-tower', 1, 0, 0.24, 1.9],
      ['lz-tower', 1, 1, 0.74, 1.9],
      ['lz-tower', 1, 2, 0.26, 1.9],
      ['lz-tower', 1, 3, 0.76, 1.9],
      ['lz-hall-bronze', 2, 0, 0.35, 2.0],
      ['lz-hall-reed', 2, 1, 0.62, 2.0],
      ['lz-hall-bone', 2, 2, 0.38, 2.0],
      ['lz-warehouse', 2, 3, 0.60, 2.0],
      ['lz-granary', 3, 0, 0.30, 2.2],
      ['lz-granary', 3, 2, 0.34, 2.2],
      ['lz-granary', 3, 3, 0.66, 2.2],
      ['lz-barracks', 4, 1, 0.35, 2.4],
      ['lz-barracks', 4, 3, 0.65, 2.4]
    ],
    mouth: {
      muster: true,
      tents: ['lc-seer', 'lc-sail', 'lc-hide', 'lc-shield', 'lc-hide']
    },
    fields: {
      dir: [1.0, 0.0],
      r0: 800,
      r1: 3600,
      w: 110,
      d: 70,
      half: 6,
      crops: ['bamboo-rice', 'taro', 'shade-manioc'],
      farms: 5,
      windmills: 1,
      maxSlope: 0.16,
      gaps: 30,
      circle: true
    },
    lake: {
      name: 'The eastern terminal sea',
      level: SEA_LEVEL,
      band: 18,
      field: 0.08,
      shallow: 0x56786e,
      deep: 0x1d3b3a,
      label: 'the eastern terminal sea (salt; no tide)'
    },
    hamlet: {
      id: 'komodo.placers',
      focus: 'mine',
      site: campSite,
      link: mouth,
      resource: placerAt,
      workers: 90,
      popMax: 180
    },
    expect: {
      people: 3000,
      wells: 12,
      keys: ['lz-nest', 'lz-ley', 'lz-muster', 'gl-tank', 'lz-weir', 'lz-placer'],
      lake: true,
      hamlet: true
    },
    look: {
      hour: 9.4,
      dens: 2.2,
      fog: 0.00005,
      base: 0x5c4430,
      shore: 0x9c8e74,
      till: 0x664e36,
      yard: 0x58422e,
      bed: 0x364642,
      farShore: 0x948a74,
      farLow: 0x465636,
      farMid: 0x3a4a30,
      label: 'The hypertropic bluff of Komodo (XA jungle, -2,452 m, eastern terminal sea)'
    },
    layers: {
      base: 'gRed',
      yard: 'gYard',
      till: 'gTill',
      shore: 'gShore'
    },
    sites: sites,
    shoreBoxes: [
      [placerAt[0] - 60, placerAt[1] - 180, riverX + 55, placerAt[1] + 180],
      [campSite[0] - 130, campSite[1] - 130, campSite[0] + 130, campSite[1] + 130]
    ],
    ways: [
      { id: 'shore-weir-road', w: 6.0, pts: [mouth, [380, -1100], [440, weirZ + 18], [60, weirZ + 18], [-320, weirZ + 18]] },
      { id: 'placer-shore-road', w: 5.5, pts: [mouth, [2200, -520], [5600, -1150], [8800, -1750], campSite, placerAt, [riverX - 34, placerAt[1]]] }
    ],
    views: [
      { name: 'Overview', at: [0, 0], from: [-600, 380, 860] },
      { name: 'The shore and the weirs', at: [60, weirZ], from: [-48, 16, 56], up: 1.2 },
      { name: 'The mouth and the war camp', at: [422, -362], from: [92, 40, -108], up: 3 },
      { name: 'The placers on Kruk Warra', at: [placerAt[0] + 20, placerAt[1]], from: [-175, 66, 180], up: 3 }
    ]
  };
})();
