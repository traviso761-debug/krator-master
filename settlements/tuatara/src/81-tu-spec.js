/* ==================== Tuatara 81: the site specification for kits/lizardmen/settle (LZV_SPEC, [G data]) ==================== */
/* Turned from settlements/tuatara/spec.json (settlements/tuatara/PLAN.md; kits/lizardmen/settle/GUIDE.md section 4.1).
   Page frame: x east, z south, metres from the pin (5.1 px 818,1554, -1,704 m). Resolves the copper diggings and outwork
   site from kits/resources (KRES.near within 6 km, outside 900 m, gentle savanna slope). Plain data: no three.js, no DOM. */
var LZV_SPEC = (function () {
  var spec = {
    key: 'tuatara',
    name: 'Tuatara',
    seed: 8301,
    records: TU_REC,
    spiral: {
      axis: 15,
      windings: 5,
      depth0: 36,
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
      w1: [['lz-warren', 4], ['lz-tower', 3]],
      w2: [['lz-makers', 1]],
      w3: [['lz-longhouse', 1]],
      w4: [['lz-lodge', 1]]
    },
    maxPerArm: [4, 5, 12, 7, 7],
    tiers: [
      { w: 2, pool: [['lz-makers', 1]], n: 2, set: 16.5 }
    ],
    gaps: {
      w0: [2.2, 4.2],
      w1: [3.2, 6.2],
      w2: [4.2, 8.2],
      w3: [12.0, 20.0],
      w4: [14.0, 24.0]
    },
    wells: [1, 2, 2, 2, 2],
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
      ['lz-granary', 3, 0, 0.30, 2.2],
      ['lz-granary', 3, 1, 0.68, 2.2],
      ['lz-granary', 3, 2, 0.34, 2.2],
      ['lz-granary', 3, 3, 0.66, 2.2],
      ['lz-granary', 3, 0, 0.75, 2.2],
      ['lz-barracks', 4, 1, 0.35, 2.4],
      ['lz-barracks', 4, 3, 0.65, 2.4],
      ['lz-barracks', 4, 0, 0.50, 2.4]
    ],
    mouth: {
      muster: true,
      tents: ['lc-seer', 'lc-sail', 'lc-hide', 'lc-hide', 'lc-shield', 'lc-hide', 'lc-shield']
    },
    fields: {
      dir: [0.0, 1.0],
      r0: 700,
      r1: 3300,
      w: 130,
      d: 84,
      half: 9,
      crops: ['ashmillet', 'sandpan-fonio', 'bambara', 'frillpod'],
      farms: 7,
      windmills: 3,
      maxSlope: 0.12,
      gaps: 22,
      circle: true
    },
    expect: {
      people: 3000,
      wells: 12,
      keys: ['lz-nest', 'lz-ley', 'lz-muster', 'gl-tank', 'lz-cistern', 'lz-mine'],
      lake: false,
      hamlet: true
    },
    look: {
      hour: 10.2,
      dens: 1.8,
      fog: 0.00004,
      base: 0x6c6542,
      shore: 0x423d38,
      till: 0x4c3a28,
      yard: 0x786848,
      farLow: 0x6a6440,
      farMid: 0x5a5642,
      label: 'The volcanic savanna of Tuatara (abyssal savanna XV, -1,704 m at the pin)'
    },
    layers: {
      base: 'gSav',
      yard: 'gYard',
      till: 'gTill',
      shore: 'gAsh'
    },
    sites: [
      { key: 'lz-cistern', x: 245.4, z: -509.6, ry: 0, kind: 'works', name: 'Sunken brick cistern (dry season)' },
      { key: 'lz-cistern', x: 551.4, z: -125.9, ry: 0, kind: 'works', name: 'Sunken brick cistern (dry season)' },
      { key: 'lz-cistern', x: 442.2, z: 352.7, ry: 0, kind: 'works', name: 'Sunken brick cistern (dry season)' },
      { key: 'lz-cistern', x: 0.0, z: 565.6, ry: 0, kind: 'works', name: 'Sunken brick cistern (dry season)' },
      { key: 'lz-cistern', x: -442.2, z: 352.7, ry: 0, kind: 'works', name: 'Sunken brick cistern (dry season)' },
      { key: 'lz-cistern', x: -551.4, z: -125.9, ry: 0, kind: 'works', name: 'Sunken brick cistern (dry season)' },
      { key: 'lz-cistern', x: -245.4, z: -509.6, ry: 0, kind: 'works', name: 'Sunken brick cistern (dry season)' }
    ],
    shoreBoxes: [],
    ways: [],
    views: [
      { name: 'Overview', at: [0, 0], from: [-700, 420, 900] },
      { name: 'The great tank and inner court', at: [18, -58], from: [26, 15, 28], up: 2.5 },
      { name: 'The mouth and the war camp', at: [467, -396], from: [95, 42, -110], up: 3 },
      { name: 'The copper diggings', at: [-1653, -1903], from: [210, 88, 220], up: 4 }
    ]
  };

  /* Resolve the five copper nodes around Tuatara's pin (5.1 px 818,1554) from kits/resources (KRES.near).
     None inside outer_radius_m + 400 = 900 m. The nearest high-grade node anchors core/hamlet's diggers' camp
     (tuatara.diggings, focus 'mine'); the remaining four nodes each receive an lz-mine headframe and volcanic ash apron. */
  var mouth = [467.1, -358.4];
  if (typeof KRES !== 'undefined' && KRES.near) {
    var pinPx = (typeof LZV_GROUND !== 'undefined' && LZV_GROUND.pin) ? LZV_GROUND.pin : [818, 1554];
    var rawNodes = KRES.near(0, 0, 'copper', 6010, { origin: { x: pinPx[0] * 2000, z: pinPx[1] * 2000 }, maxSlope: 0.25 });
    var nodes = rawNodes.filter(function (n) { return n.dist >= 900; }).slice(0, 5);
    if (nodes.length) {
      var n0 = nodes[0];
      var dx = mouth[0] - n0.x, dz = mouth[1] - n0.z, dl = Math.hypot(dx, dz) || 1;
      var sx = Math.round(n0.x + dx / dl * 185), sz = Math.round(n0.z + dz / dl * 185);
      spec.hamlet = {
        id: 'tuatara.diggings',
        focus: 'mine',
        site: [sx, sz],
        link: mouth,
        resource: [Math.round(n0.x), Math.round(n0.z)],
        workers: 120,
        popMax: 210
      };
      spec.views[spec.views.length - 1] = {
        name: 'The copper diggings',
        at: [Math.round((n0.x + sx) / 2), Math.round((n0.z + sz) / 2)],
        from: [220, 86, 220],
        up: 4
      };
      spec.ways.push({ id: 'diggings-main', w: 6.0, pts: [mouth, [sx, sz], [Math.round(n0.x), Math.round(n0.z)]] });
      spec.shoreBoxes.push([n0.x - 165, n0.z - 165, n0.x + 165, n0.z + 165]);
      for (var i = 1; i < nodes.length; i++) {
        var ni = nodes[i];
        var ry = Math.atan2(mouth[0] - ni.x, mouth[1] - ni.z);
        spec.sites.push({
          key: 'lz-mine',
          x: +ni.x.toFixed(1),
          z: +ni.z.toFixed(1),
          ry: +ry.toFixed(4),
          kind: 'works',
          name: 'Copper diggings (' + ni.grade + ' grade)'
        });
        spec.shoreBoxes.push([ni.x - 120, ni.z - 120, ni.x + 120, ni.z + 120]);
        spec.ways.push({ id: 'diggings-track-' + i, w: 4.8, pts: [mouth, [Math.round(ni.x), Math.round(ni.z)]] });
      }
    }
  }
  return spec;
})();
