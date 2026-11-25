// ================================================================= CASCADE — structural & program records  [G data]
// Cascade: Iron Republic hydropowered industrial-agricultural arcology (inspired by Paolo Soleri's 7. Arcvillage I,
// sheets 1-3: 220 m tall, 12.04 ha chamfered-square / octagonal footprint, 8 carved stepped apses, 12 cylindrical
// column-towers, elevated headrace aqueduct & central waterfall cataracts, inverted-pyramid cantilevered upper collar,
// and the stepped faceted pyramidal crown motif from sheet 1 #2).
//
// Plain data and pure functions: no THREE, no DOM, no sequential PRNG. Every variation draws from KRAND.hash(seed, a, b, c).
// Records carry stable ids ('av.apse.0', 'av.tower.inner.0', 'av.deck.7'); edits and ruin states apply as deltas by id.
var AV = typeof AV !== 'undefined' ? AV : {};
(function () {
  'use strict';
  var TAU = Math.PI * 2;
  function r3(v) { return Math.round(v * 1000) / 1000; }

  AV.u = function (seed, a, b, c) {
    return KRAND.unit(KRAND.hash(seed | 0, a == null ? 0 : a | 0, b == null ? 0 : b | 0, c == null ? 0 : c | 0));
  };
  AV.idHash = function (s) {
    var h = 2166136261;
    var t = String(s);
    for (var i = 0; i < t.length; i++) {
      h ^= t.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  // ---- Dimensions in metres (x east, z south, y up) ----
  AV.DIM = {
    H_TOTAL: 220.0,
    APOTHEM_CARD: 186.0,
    APOTHEM_DIAG: 196.0,
    WELL_HALF: 33.0,
    OCULUS_HALF: 13.0,
    BASIN_HALF: 22.0,
    CANAL_W: 16.0,
    CANAL_WATER_Y: -0.8,
    CANAL_BED_Y: -3.2,
    FORUM_Y: 6.0,
    FORUM_H: 6.8,
    // Hydropowered Central Industrial Hall & Elevated Headrace Aqueduct
    HYDRO: {
      aqueductY: 31.8,
      aqueductBedY: 29.6,
      aqueductW: 12.0,
      aqueductZ0: 17.5,
      aqueductZ1: 476.0,
      pitHalf: 22.0,
      cataractDrop: 32.6,
      hallTopY: 48.0,
      wheelR: 6.2,
      wheelW: 3.0,
      penstockR: 1.35,
      notchHW: 10.8
    },
    // 8 major carved apses on faces k * 45 deg (0 E, 1 SE, 2 S, 3 SW, 4 W, 5 NW, 6 N, 7 NE)
    APSE: {
      n: 8, hw: 36.0, depth: 36.0, crownY: 68.0, tiers: 6,
      y0: 7.2, stepY: 9.0, storeyH: 4.2, bandDepth: 11.5,
      canalFaces: [0, 2, 4], portalW: 18.0, portalH: 10.5, gateW: 12.0, gateH: 8.2
    },
    // 12 cylindrical skyscraper column-towers: 4 inner at (+-46, +-46) and 8 outer between apses
    INNER_TOWER: { n: 4, xy: 46.0, r: 12.0, coreR: 4.4, y0: 0.0, y1: 198.0 },
    OUTER_TOWER: { n: 8, ringR: 126.0, r: 10.5, coreR: 3.8, y0: 0.0, y1: 176.4 },
    // Recessed arched circulation transfer waist (y = 72.0 .. 86.4 m)
    WAIST: { y0: 72.0, y1: 86.4, rIn: 106.0, rOut: 148.0, archesPerFace: 3, archW: 13.6, archH: 10.8 },
    // Mid-level concentric rings & 8 radial spoke bridges (y = 86.4 .. 136.8 m, 14 storeys x 3.6 m)
    MID: {
      y0: 86.4, y1: 136.8, sh: 3.6,
      innerR0: 34.0, innerR1: 58.0,
      outerR0: 114.0, outerR1: 152.0,
      spokeW: 11.0
    },
    // Inverted-pyramid cantilevered upper collar (y = 136.8 .. 172.8 m, 3 tiers x 12.0 m)
    COLLAR: {
      y0: 136.8, y1: 172.8,
      tiers: [
        { k: 0, y0: 136.8, y1: 148.8, rIn: 102.0, rOut: 160.0 },
        { k: 1, y0: 148.8, y1: 160.8, rIn: 94.0, rOut: 170.0 },
        { k: 2, y0: 160.8, y1: 172.8, rIn: 86.0, rOut: 180.0 }
      ]
    },
    // Roof deck civic/recreation pavilions at y = 172.8 m (Sheet 2 #3 Roof Plan)
    ROOF: {
      y: 172.8,
      cultural: { cx: 0.0, cz: 128.0, w: 92.0, d: 44.0, h: 14.5 },
      skypad: { cx: 0.0, cz: -132.0, r: 23.0, h: 3.6 },
      playWest: { cx: -126.0, cz: 0.0, w: 38.0, d: 64.0, h: 8.4 },
      playEast: { cx: 126.0, cz: 0.0, w: 38.0, d: 64.0, h: 8.4 },
      gardenR0: 35.0, gardenR1: 84.0
    },
    // 5-tier stepped faceted pyramidal crown (Sheet 1 #2 motif, y = 172.8 .. 220.0 m)
    CROWN: {
      y0: 172.8, yLantern: 212.4, yTip: 220.0,
      rBase: 94.0, rTop: 15.0, oculusR: 11.0,
      tiers: 5, portalW: 26.0, portalH: 21.6
    },
    // Twin circular vegetable & orchard gardens (Sheet 1 #1)
    GARDENS: {
      west: { id: 'av.garden.west', name: 'West Circular Vegetable Garden', cx: -265.0, cz: 0.0, r: 106.0, role: 'vegetable' },
      east: { id: 'av.garden.east', name: 'East Circular Orchard and Grain Garden', cx: 265.0, cz: 0.0, r: 106.0, role: 'orchard' }
    }
  };

  // ---- Octagonal chamfered-square helper functions ----
  AV.faceAngle = function (k) { return (k % 8) * (Math.PI / 4); };
  AV.apothemAt = function (k, scale) {
    var D = AV.DIM, s = scale == null ? 1 : scale;
    return ((k % 2 === 0) ? D.APOTHEM_CARD : D.APOTHEM_DIAG) * s;
  };
  // 8 vertices of the chamfered-square / unequal octagon at a given radial scale (default 1 => base footprint)
  AV.octPoly = function (scale) {
    var s = scale == null ? 1 : scale, out = [];
    for (var k = 0; k < 8; k++) {
      var a0 = AV.faceAngle(k), a1 = AV.faceAngle((k + 1) % 8);
      var d0 = AV.apothemAt(k, s), d1 = AV.apothemAt((k + 1) % 8, s);
      var c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      var det = c0 * s1 - s0 * c1;
      out.push([r3((d0 * s1 - d1 * s0) / det), r3((c0 * d1 - c1 * d0) / det)]);
    }
    return out;
  };
  // Ring polygon with constant apothem R across all 8 faces
  AV.regOctPoly = function (R, rot) {
    var out = [], r = R / Math.cos(Math.PI / 8), a0 = rot == null ? Math.PI / 8 : rot;
    for (var k = 0; k < 8; k++) {
      var a = a0 + k * (Math.PI / 4);
      out.push([r3(r * Math.cos(a)), r3(r * Math.sin(a))]);
    }
    return out;
  };
  AV.inOct = function (x, z, scale, inset) {
    var s = scale == null ? 1 : scale, ins = inset == null ? 0 : inset;
    for (var k = 0; k < 8; k++) {
      var a = AV.faceAngle(k), lim = AV.apothemAt(k, s) - ins;
      if (x * Math.cos(a) + z * Math.sin(a) > lim) return false;
    }
    return true;
  };
  AV.polyArea = function (pts) {
    var a = 0;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], q = pts[(i + 1) % pts.length];
      a += p[0] * q[1] - q[0] * p[1];
    }
    return Math.abs(a) * 0.5;
  };

  // ---- The 14 representative deck levels (living, work, rec, civic) ----
  AV.DECK_DEFS = [
    { k: 0, id: 'L0', y: 0.4, h: 5.2, zone: 'quay', name: 'L0 Tailrace Turbine Vaults and Barge Quays', categories: ['work', 'rec'], summary: 'Tailrace sluice vaults, ore crushers, stamp mills, canal barge warehouses and boatmens alehouse' },
    { k: 1, id: 'L1', y: 6.0, h: 6.8, zone: 'hydro_hall', name: 'L1 Central Industrial Hall and Heavy Foundry', categories: ['work'], summary: 'Great Cataract Turbine Pit, water-powered trip-hammers, blast cupola furnaces, rolling mills and hydro-dynamo powerhouse' },
    { k: 2, id: 'L2', y: 16.2, h: 4.2, zone: 'hydro_gallery', tier: 1, name: 'L2 Line-Shaft Machine Galleries and Terraces', categories: ['work', 'living'], summary: 'Overhead belt-and-pulley machine-tool galleries around the waterfall cataract plus outer apse worker terraces' },
    { k: 3, id: 'L3', y: 34.2, h: 4.2, zone: 'apse', tier: 3, name: 'L3 Headrace Level Mills and Apse Flats', categories: ['living', 'work'], summary: 'Aqueduct headgate workshops and sunlit stepped apse residential flats' },
    { k: 4, id: 'L4', y: 52.2, h: 4.2, zone: 'apse_civic', tier: 5, name: 'L4 Civic Market Ring and Upper Belvederes', categories: ['civic', 'living', 'rec'], summary: 'Elevated civic market arcades, customs exchange, clinic and upper apse belvedere cottages' },
    { k: 5, id: 'L5', y: 72.0, h: 6.8, zone: 'waist', name: 'L5 Arched Waist Steam Baths and Drill Halls', categories: ['rec', 'work'], summary: 'Waste-heat steam bathhouses, militia drill halls, gymnasiums and refectory commons' },
    { k: 6, id: 'L6', y: 93.6, h: 3.6, zone: 'mid_work', name: 'L6 Midlevel Electro-Mechanical Guild Works', categories: ['work', 'civic'], summary: 'Dynamo-busbar powered machinist shops, printing presses, guild offices and 8 spoke sky-bridges' },
    { k: 7, id: 'L7', y: 108.0, h: 3.6, zone: 'mid_mix', name: 'L7 Midlevel Living-Working Promenade', categories: ['living', 'work'], summary: 'Inner archive and scribes, spoke bridges, outer craft studios and perimeter promenade apartments' },
    { k: 8, id: 'L8', y: 122.4, h: 3.6, zone: 'mid_res', name: 'L8 Midlevel Residential Ring', categories: ['living', 'rec'], summary: 'Full octagonal residential flats, family suites and neighborhood commons' },
    { k: 9, id: 'L9', y: 144.0, h: 5.4, zone: 'collar_work', name: 'L9 Collar Guildhall and Salvage Labs', categories: ['work', 'civic'], summary: 'Cantilevered guildhall, mint presses and salvaged Ancient terminal laboratories' },
    { k: 10, id: 'L10', y: 158.4, h: 5.4, zone: 'collar_court', name: 'L10 Collar Burghers Court and Lyceum', categories: ['living', 'rec', 'civic'], summary: 'Court-tier burghers apartments, banquet halls and Republican lyceum classrooms' },
    { k: 11, id: 'L11', y: 172.8, h: 6.0, zone: 'roof', name: 'L11 Cultural Center and Roof Courts', categories: ['rec', 'civic'], summary: 'Peoples Assembly Hall, Great Archive, East and West athletic courts, Sky-Pad control and roof cloister' },
    { k: 12, id: 'L12', y: 187.2, h: 5.4, zone: 'crown_farm', name: 'L12 Pyramidal Crown Conservatory', categories: ['work', 'rec'], summary: 'Four-wing hydroponic and highland botanical conservatory under the faceted skylight slopes' },
    { k: 13, id: 'L13', y: 201.6, h: 5.4, zone: 'crown_obs', name: 'L13 Pyramidal Crown Observatory', categories: ['civic', 'work'], summary: 'Consuls High Observatory, semaphore bridge and summit beacon chamber' }
  ];

  var FACE_NAMES = ['East', 'South-East', 'South', 'South-West', 'West', 'North-West', 'North', 'North-East'];

  // ---- Build the complete [G data] structural & functional record ----
  AV.plan = function (o) {
    o = o || {};
    var state = o.state || 'refurbished';
    var seed = o.seed == null ? 19690 : (o.seed | 0);
    var culture = o.culture || (state === 'refurbished' ? 'republican' : 'ancient');
    var isRep = state === 'refurbished';
    var D = AV.DIM, HY = D.HYDRO;
    var P = {
      id: o.id || ('cascade.' + state),
      name: isRep ? 'Cascade (Hydropowered Republic Industrial Arcology)' : state === 'ruined' ? 'Cascade (Post-Cataclysm Ruin)' : 'Cascade (Ancient Prime Dynamo Intact)',
      state: state,
      culture: culture,
      seed: seed,
      dim: D,
      footprint: { poly: AV.octPoly(1), areaHa: r3(AV.polyArea(AV.octPoly(1)) / 10000), w: D.APOTHEM_CARD * 2, d: D.APOTHEM_CARD * 2, h: D.H_TOTAL },
      apses: [],
      towers: [],
      bridges: [],
      collarStruts: [],
      crownTiers: [],
      decks: [],
      portals: [],
      ancientRelics: null,
      hydroHall: null,
      republican: [],
      debris: []
    };

    // 1. Eight carved stepped apses (in refurbished state, South Apse k=2 is notched for the y = 31.8 m Headrace Aqueduct)
    for (var k = 0; k < 8; k++) {
      var th = AV.faceAngle(k), c = Math.cos(th), s = Math.sin(th);
      var rMouth = AV.apothemAt(k, 1);
      var hasCanal = D.APSE.canalFaces.indexOf(k) >= 0;
      var tiers = [];
      for (var t = 0; t < D.APSE.tiers; t++) {
        var ty = r3(D.APSE.y0 + t * D.APSE.stepY);
        /* Stepped back toward the structural back-wall as y climbs so every terrace sees open sky through the 68 m arch */
        var rFront = r3(rMouth - 8.0 - t * 3.6);
        var rBack = r3(rFront - D.APSE.bandDepth);
        var spanW = r3((D.APSE.hw - 2.5) * 2 * (1 - t * 0.055));
        tiers.push({
          t: t,
          y: ty,
          h: D.APSE.storeyH,
          rFront: rFront,
          rBack: rBack,
          w: spanW,
          aqueductNotch: isRep && k === 2 && t <= 3 ? HY.notchHW : 0
        });
      }
      var apse = {
        id: 'av.apse.' + k,
        k: k,
        face: FACE_NAMES[k],
        th: th,
        rMouth: rMouth,
        rBack: rMouth - D.APSE.depth,
        hw: D.APSE.hw,
        crownY: D.APSE.crownY,
        canal: hasCanal,
        aqueduct: isRep && k === 2,
        tiers: tiers,
        breached: state === 'ruined' && (k === 1 || k === 5)
      };
      P.apses.push(apse);
      P.portals.push({
        id: 'av.portal.' + k,
        k: k,
        face: FACE_NAMES[k],
        kind: hasCanal ? 'canal' : 'street',
        x: r3(rMouth * c),
        y: hasCanal ? D.CANAL_WATER_Y : 0.0,
        z: r3(rMouth * s),
        yaw: th,
        w: hasCanal ? D.APSE.portalW : D.APSE.gateW,
        h: hasCanal ? D.APSE.portalH : D.APSE.gateH
      });
    }
    if (isRep) {
      P.portals.push({
        id: 'av.portal.aqueduct.south',
        k: 8,
        face: 'South',
        kind: 'aqueduct',
        x: 0.0,
        y: HY.aqueductY,
        z: D.APOTHEM_CARD,
        yaw: Math.PI / 2,
        w: HY.aqueductW,
        h: 8.5
      });
    }

    // 2. Twelve cylindrical skyscraper column-towers (4 inner + 8 outer)
    var innerSigns = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
    for (var i = 0; i < 4; i++) {
      var ix = innerSigns[i][0] * D.INNER_TOWER.xy, iz = innerSigns[i][1] * D.INNER_TOWER.xy;
      var brokenTop = state === 'ruined' && i === 2 ? 156.0 : D.INNER_TOWER.y1;
      P.towers.push({
        id: 'av.tower.inner.' + i,
        ring: 'inner',
        index: i,
        x: ix,
        z: iz,
        r: D.INNER_TOWER.r,
        coreR: D.INNER_TOWER.coreR,
        y0: 0.0,
        y1: brokenTop,
        shafts: [
          { id: 'av.tower.inner.' + i + '.lift', kind: 'lift', dx: 1.8, dz: 0.0, w: 2.6, d: 2.6, from: 0, to: state === 'ruined' ? 8 : 13 },
          { id: 'av.tower.inner.' + i + '.stair', kind: 'stair', dx: -1.8, dz: 0.0, w: 2.8, d: 3.4, from: 0, to: state === 'ruined' ? 8 : 13 }
        ]
      });
    }
    for (var j = 0; j < 8; j++) {
      var oth = j * (Math.PI / 4) + (Math.PI / 8);
      var ox = r3(D.OUTER_TOWER.ringR * Math.cos(oth)), oz = r3(D.OUTER_TOWER.ringR * Math.sin(oth));
      var outTop = state === 'ruined' && (j === 1 || j === 5) ? 132.0 : D.OUTER_TOWER.y1;
      P.towers.push({
        id: 'av.tower.outer.' + j,
        ring: 'outer',
        index: j,
        th: oth,
        x: ox,
        z: oz,
        r: D.OUTER_TOWER.r,
        coreR: D.OUTER_TOWER.coreR,
        y0: 0.0,
        y1: outTop,
        shafts: [
          { id: 'av.tower.outer.' + j + '.lift', kind: 'lift', dx: 1.5, dz: 0.0, w: 2.4, d: 2.4, from: 0, to: state === 'ruined' ? 8 : 11 },
          { id: 'av.tower.outer.' + j + '.stair', kind: 'stair', dx: -1.5, dz: 0.0, w: 2.6, d: 3.0, from: 0, to: state === 'ruined' ? 8 : 11 }
        ]
      });
      // 8 radial spoke sky-bridges in the mid-levels
      P.bridges.push({
        id: 'av.bridge.' + j,
        index: j,
        th: oth,
        r0: D.MID.innerR1 - 1.0,
        r1: D.OUTER_TOWER.ringR - D.OUTER_TOWER.r + 1.0,
        w: D.MID.spokeW,
        yLevels: [93.6, 108.0, 122.4],
        intact: !(state === 'ruined' && j === 5)
      });
      // Pair of diagonal megastruts bracing the cantilevered collar from each outer tower
      for (var sgn = -1; sgn <= 1; sgn += 2) {
        var sth = oth + sgn * 0.11;
        P.collarStruts.push({
          id: 'av.strut.' + j + '.' + (sgn > 0 ? 'r' : 'l'),
          tower: j,
          a: [ox, 115.2, oz],
          b: [r3(174.0 * Math.cos(sth)), 160.8, r3(174.0 * Math.sin(sth))],
          intact: !(state === 'ruined' && j === 5 && sgn > 0)
        });
      }
    }

    // 3. Five-tier stepped faceted pyramidal crown (Sheet 1 #2 motif)
    var CR = D.CROWN;
    for (var ct = 0; ct < CR.tiers; ct++) {
      var f0 = ct / CR.tiers, f1 = (ct + 1) / CR.tiers;
      var ya = r3(CR.y0 + f0 * (CR.yLantern - CR.y0)), yb = r3(CR.y0 + f1 * (CR.yLantern - CR.y0));
      var ra = r3(CR.rBase + (CR.rTop - CR.rBase) * Math.pow(f0, 0.92));
      var rb = r3(CR.rBase + (CR.rTop - CR.rBase) * Math.pow(f1, 0.92));
      P.crownTiers.push({
        id: 'av.crown.' + ct,
        k: ct,
        y0: ya,
        y1: yb,
        r0: ra,
        r1: rb,
        broken: state === 'ruined' && ct >= 3
      });
    }
    P.lantern = {
      id: 'av.crown.lantern',
      y0: CR.yLantern,
      y1: D.H_TOTAL,
      r0: CR.rTop,
      r1: 6.5,
      alive: state !== 'ruined',
      mode: isRep ? 'republic-arc' : state === 'intact' ? 'ancient-cyan' : 'dead'
    };

    // 4. Decks (in ruined state, decks above L8 have breached roofs/openings)
    for (var dk = 0; dk < AV.DECK_DEFS.length; dk++) {
      var dd = AV.DECK_DEFS[dk];
      if (state === 'ruined' && dd.k >= 12) continue;
      P.decks.push(Object.assign({}, dd, {
        ruined: state === 'ruined' && dd.k >= 9
      }));
    }

    // 5a. Original Ancient Prime Toroidal Dynamo & Superconducting Power-Spine Relics (present in ALL 3 states:
    //     online in 'intact', shattered in 'ruined', and carefully stabilized/spliced-around in 'refurbished'!)
    P.ancientRelics = {
      id: 'av.relic.suite',
      primeDynamo: {
        id: 'av.relic.prime_dynamo',
        kind: 'ancient-prime-dynamo',
        x: 0.0,
        y: 6.0,
        z: -15.8,
        plinthR: 6.8,
        torusY: 16.8,
        torusR: 6.4,
        tubeR: 1.32,
        yTop: 27.4,
        status: state === 'intact' ? 'online' : isRep ? 'failed-stabilized' : 'shattered',
        missingSegs: state === 'intact' ? [] : [2, 3, 4, 5],
        stabilized: isRep
      },
      statorCradle: isRep ? {
        id: 'av.relic.stator_cradle',
        kind: 'salvaged-stator-arc',
        x: -12.4,
        y: 6.0,
        z: -20.4,
        yaw: 0.30,
        r: 6.4
      } : null,
      coolantRing: {
        id: 'av.relic.coolant_ring',
        kind: 'ancient-coolant-ring',
        x: 0.0,
        y: -3.3,
        z: 6.5,
        r: 12.2,
        h: 4.35,
        status: state === 'intact' ? 'online' : 'repurposed'
      },
      busTrunks: [
        { id: 'av.relic.trunk.nw', corner: 'NW', sgnX: -1, sgnZ: -1, y: 11.6, stubX: -15.6, spliceX: -34.8, spliceZ: -16.5, towerX: -43.5, towerZ: -43.5, spliced: isRep },
        { id: 'av.relic.trunk.ne', corner: 'NE', sgnX: 1, sgnZ: -1, y: 11.6, stubX: 15.6, spliceX: 34.8, spliceZ: -16.5, towerX: 43.5, towerZ: -43.5, spliced: isRep },
        { id: 'av.relic.trunk.sw', corner: 'SW', sgnX: -1, sgnZ: 1, y: 11.6, stubX: -15.6, spliceX: -34.8, spliceZ: -6.5, towerX: -43.5, towerZ: 43.5, spliced: isRep },
        { id: 'av.relic.trunk.se', corner: 'SE', sgnX: 1, sgnZ: 1, y: 11.6, stubX: 15.6, spliceX: 34.8, spliceZ: -6.5, towerX: 43.5, towerZ: 43.5, spliced: isRep }
      ],
      capacitors: [
        { id: 'av.relic.cap.0', kind: 'ancient-capacitor', x: -23.8, y: 6.0, z: 3.5, r: 2.05, h: 8.8, retrofit: 'sluice-governor' },
        { id: 'av.relic.cap.1', kind: 'ancient-capacitor', x: 23.8, y: 6.0, z: 3.5, r: 2.05, h: 8.8, retrofit: 'sluice-governor' },
        { id: 'av.relic.cap.2', kind: 'ancient-capacitor', x: -35.8, y: 6.0, z: -24.5, r: 2.15, h: 8.4, retrofit: 'busbar-switch' },
        { id: 'av.relic.cap.3', kind: 'ancient-capacitor', x: 35.8, y: 6.0, z: -24.5, r: 2.15, h: 8.4, retrofit: 'busbar-switch' },
        { id: 'av.relic.cap.4', kind: 'ancient-capacitor', x: -5.8, y: 6.0, z: -8.2, r: 1.42, h: 6.4, retrofit: 'dais-pylon' },
        { id: 'av.relic.cap.5', kind: 'ancient-capacitor', x: 5.8, y: 6.0, z: -8.2, r: 1.42, h: 6.4, retrofit: 'dais-pylon' }
      ],
      hallProps: state === 'ruined' ? [] : (isRep ? [
        /* Surviving Ancient control stands, glass consoles & telemetry racks left bolted on the Hall floor */
        { id: 'av.relic.prop.0', key: 'ancients_control_stand', x: -2.4, y: 6.45, z: -8.6, ry: Math.PI },
        { id: 'av.relic.prop.1', key: 'ancients_control_stand', x: 2.4, y: 6.45, z: -8.6, ry: Math.PI },
        { id: 'av.relic.prop.2', key: 'yuni_ancient_glass_console', x: 0.0, y: 6.45, z: -9.6, ry: 0.0 },
        { id: 'av.relic.prop.3', key: 'ancients_server_rack', x: -8.4, y: 6.0, z: -13.2, ry: Math.PI * 0.5 },
        { id: 'av.relic.prop.4', key: 'ancients_server_rack', x: 8.4, y: 6.0, z: -13.2, ry: -Math.PI * 0.5 },
        { id: 'av.relic.prop.5', key: 'yuni_ancient_socket_rack', x: -8.4, y: 6.0, z: -18.2, ry: Math.PI * 0.5 },
        { id: 'av.relic.prop.6', key: 'yuni_ancient_socket_rack', x: 8.4, y: 6.0, z: -18.2, ry: -Math.PI * 0.5 },
        { id: 'av.relic.prop.7', key: 'ancients_cargo_pods', x: 12.6, y: 6.0, z: -21.2, ry: 0.4 },
        /* Careful Iron Republic surveyor, splice-test & millwright stations rigged alongside the Ancient relics */
        { id: 'av.relic.prop.8', key: 'republican_court_terminal', x: -4.2, y: 6.45, z: -9.2, ry: 2.7 },
        { id: 'av.relic.prop.9', key: 'republican_court_terminal', x: 4.2, y: 6.45, z: -9.2, ry: -2.7 },
        { id: 'av.relic.prop.10', key: 'hl_rep_lamp_standard', x: -6.6, y: 6.0, z: -10.2, ry: 0.0 },
        { id: 'av.relic.prop.11', key: 'hl_rep_lamp_standard', x: 6.6, y: 6.0, z: -10.2, ry: 0.0 },
        { id: 'av.relic.prop.12', key: 'hl_rep_workbench', x: -14.8, y: 6.0, z: -23.2, ry: 0.2 },
        { id: 'av.relic.prop.13', key: 'hl_rep_tool_chest', x: -10.4, y: 6.0, z: -23.4, ry: -0.4 },
        { id: 'av.relic.prop.14', key: 'hl_rep_winch', x: -14.8, y: 6.0, z: -17.6, ry: 0.8 },
        { id: 'av.relic.prop.15', key: 'hl_rep_workbench', x: -33.2, y: 6.0, z: -11.5, ry: Math.PI * 0.5 },
        { id: 'av.relic.prop.16', key: 'hl_rep_workbench', x: 33.2, y: 6.0, z: -11.5, ry: -Math.PI * 0.5 }
      ] : [
        { id: 'av.relic.prop.0', key: 'ancients_control_stand', x: -2.6, y: 6.45, z: -8.6, ry: Math.PI },
        { id: 'av.relic.prop.1', key: 'ancients_control_stand', x: 2.6, y: 6.45, z: -8.6, ry: Math.PI },
        { id: 'av.relic.prop.2', key: 'yuni_ancient_glass_console', x: 0.0, y: 6.45, z: -9.6, ry: 0.0 },
        { id: 'av.relic.prop.3', key: 'ancients_server_rack', x: -8.4, y: 6.0, z: -13.2, ry: Math.PI * 0.5 },
        { id: 'av.relic.prop.4', key: 'ancients_server_rack', x: 8.4, y: 6.0, z: -13.2, ry: -Math.PI * 0.5 },
        { id: 'av.relic.prop.5', key: 'yuni_ancient_light_stem', x: -6.4, y: 6.0, z: -10.2, ry: 0.0 },
        { id: 'av.relic.prop.6', key: 'yuni_ancient_light_stem', x: 6.4, y: 6.0, z: -10.2, ry: 0.0 }
      ])
    };

    // 5b. Iron Republic Hydropower Replacement Setup (built in 'refurbished' to replace the failed Ancient Prime Dynamo,
    //     carefully routing gear-towers, belt line-shafts, penstocks & busbar splices around the stabilized Ancient core!)
    if (isRep) {
      P.hydroHall = {
        id: 'av.hydro.hall',
        replacesRelic: 'av.relic.prime_dynamo',
        aqueduct: {
          id: 'av.hydro.aqueduct',
          yWater: HY.aqueductY,
          yBed: HY.aqueductBedY,
          w: HY.aqueductW,
          zStart: HY.aqueductZ1,
          zHeadbox: HY.aqueductZ0,
          intact: true
        },
        cataracts: [
          { id: 'av.hydro.fall.main', name: 'Central Cataract Plunge', lip: [[-4.8, 16.2, HY.aqueductY], [4.8, 16.2, HY.aqueductY]], dir: [0, -1], drop: HY.cataractDrop, speed: 2.6 },
          { id: 'av.hydro.fall.west', name: 'West Overshot Wheel Chute', lip: [[-15.0, 15.6, HY.aqueductY - 0.1], [-11.8, 15.6, HY.aqueductY - 0.1]], dir: [0, -1], drop: HY.cataractDrop - 0.1, speed: 2.1 },
          { id: 'av.hydro.fall.east', name: 'East Overshot Wheel Chute', lip: [[11.8, 15.6, HY.aqueductY - 0.1], [15.0, 15.6, HY.aqueductY - 0.1]], dir: [0, -1], drop: HY.cataractDrop - 0.1, speed: 2.1 }
        ],
        wheels: [
          { id: 'av.hydro.wheel.wu', kind: 'overshot-wheel', side: 'west', tier: 'upper', x: -13.4, y: 21.6, z: 9.8, r: HY.wheelR, w: HY.wheelW, rpm: 7.5 },
          { id: 'av.hydro.wheel.eu', kind: 'overshot-wheel', side: 'east', tier: 'upper', x: 13.4, y: 21.6, z: 9.8, r: HY.wheelR, w: HY.wheelW, rpm: 7.5 },
          { id: 'av.hydro.wheel.wl', kind: 'overshot-wheel', side: 'west', tier: 'lower', x: -13.4, y: 8.6, z: 2.2, r: HY.wheelR, w: HY.wheelW, rpm: -8.2 },
          { id: 'av.hydro.wheel.el', kind: 'overshot-wheel', side: 'east', tier: 'lower', x: 13.4, y: 8.6, z: 2.2, r: HY.wheelR, w: HY.wheelW, rpm: -8.2 }
        ],
        gearTowers: [
          { id: 'av.hydro.gear.sw', kind: 'bevel-shaft', x: -19.2, z: 9.8, y0: 0.0, y1: 31.0, gearY: [8.6, 21.6, 29.4] },
          { id: 'av.hydro.gear.se', kind: 'bevel-shaft', x: 19.2, z: 9.8, y0: 0.0, y1: 31.0, gearY: [8.6, 21.6, 29.4] },
          { id: 'av.hydro.gear.nw', kind: 'bevel-shaft', x: -19.2, z: -25.2, y0: 0.0, y1: 31.0, gearY: [8.6, 17.6, 29.4] },
          { id: 'av.hydro.gear.ne', kind: 'bevel-shaft', x: 19.2, z: -25.2, y0: 0.0, y1: 31.0, gearY: [8.6, 17.6, 29.4] }
        ],
        lineShafts: [
          { id: 'av.hydro.line.w1', axis: 'z', x: -19.2, y: 13.2, z0: -38.0, z1: 12.0, pulleys: [-35, -28, -20, -10, 2] },
          { id: 'av.hydro.line.e1', axis: 'z', x: 19.2, y: 13.2, z0: -38.0, z1: 12.0, pulleys: [-35, -28, -20, -10, 2] },
          { id: 'av.hydro.line.w2', axis: 'z', x: -19.2, y: 21.6, z0: -36.0, z1: 12.0, pulleys: [-32, -22, -12, 0] },
          { id: 'av.hydro.line.e2', axis: 'z', x: 19.2, y: 21.6, z0: -36.0, z1: 12.0, pulleys: [-32, -22, -12, 0] },
          /* Routed north at z = -25.2 around the towering Failed Ancient Prime Dynamo at z = -15.8! */
          { id: 'av.hydro.line.n', axis: 'x', z: -25.2, y: 17.6, x0: -38.0, x1: 38.0, pulleys: [-32, -24, -12.4, 12.4, 24, 32] }
        ],
        penstocks: [
          { id: 'av.hydro.penstock.w', a: [-19.5, 30.2, 18.0], b: [-29.0, 8.2, -4.0], r: HY.penstockR },
          { id: 'av.hydro.penstock.e', a: [19.5, 30.2, 18.0], b: [29.0, 8.2, -4.0], r: HY.penstockR }
        ],
        dynamos: [
          { id: 'av.hydro.dynamo.w0', kind: 'hydro-dynamo', x: -29.0, y: 6.0, z: -6.5, mw: 4.5, spliceTo: 'av.relic.trunk.sw' },
          { id: 'av.hydro.dynamo.w1', kind: 'hydro-dynamo', x: -29.0, y: 6.0, z: -16.5, mw: 4.5, spliceTo: 'av.relic.trunk.nw' },
          { id: 'av.hydro.dynamo.e0', kind: 'hydro-dynamo', x: 29.0, y: 6.0, z: -6.5, mw: 4.5, spliceTo: 'av.relic.trunk.se' },
          { id: 'av.hydro.dynamo.e1', kind: 'hydro-dynamo', x: 29.0, y: 6.0, z: -16.5, mw: 4.5, spliceTo: 'av.relic.trunk.ne' }
        ],
        tripHammers: [
          { id: 'av.hydro.hammer.w', kind: 'trip-hammer', x: -12.4, y: 6.0, z: -30.5, yaw: 0, phase: 0.0 },
          { id: 'av.hydro.hammer.e', kind: 'trip-hammer', x: 12.4, y: 6.0, z: -30.5, yaw: Math.PI, phase: 1.57 }
        ],
        cupolas: [
          { id: 'av.hydro.cupola.w', kind: 'blast-cupola', x: -24.5, y: 6.0, z: -39.0, r: 3.4, h: 19.5 },
          { id: 'av.hydro.cupola.e', kind: 'blast-cupola', x: 24.5, y: 6.0, z: -39.0, r: 3.4, h: 19.5 }
        ],
        bridgeCrane: { id: 'av.hydro.bridgecrane', y: 40.5, z: -29.0, x0: -42.0, x1: 42.0, ladleX: -6.5 },
        salvageHoist: { id: 'av.hydro.salvagehoist', y: 40.2, z: -15.8, x0: -42.0, x1: 42.0, hoistX: 0.0 }
      };
    }

    // 6. Iron Republic exterior tailrace sluice wheels, gantry cranes & triskele banners
    if (isRep) {
      [0, 4].forEach(function (fk, idx) {
        var a = AV.faceAngle(fk), rm = AV.apothemAt(fk, 1) - 6.0;
        P.republican.push({
          id: 'av.rep.wheel.' + idx,
          kind: 'waterwheel',
          face: FACE_NAMES[fk],
          x: r3(rm * Math.cos(a) - 5.2 * Math.sin(a)),
          y: D.CANAL_WATER_Y + 2.8,
          z: r3(rm * Math.sin(a) + 5.2 * Math.cos(a)),
          yaw: a,
          r: 4.2,
          w: 1.8
        });
      });
      P.republican.push({ id: 'av.rep.crane.north', kind: 'gantry', x: 0.0, y: D.ROOF.y + D.ROOF.skypad.h, z: D.ROOF.skypad.cz - 10.0, yaw: Math.PI, h: 14.0, boom: 16.0 });
      P.republican.push({ id: 'av.rep.crane.quay.e', kind: 'gantry', x: D.APOTHEM_CARD + 14.0, y: 0.4, z: 16.0, yaw: -0.6, h: 11.5, boom: 13.0 });
      P.republican.push({ id: 'av.rep.crane.quay.w', kind: 'gantry', x: -D.APOTHEM_CARD - 14.0, y: 0.4, z: -16.0, yaw: 2.5, h: 11.5, boom: 13.0 });
      for (var bk = 0; bk < 8; bk++) {
        var ba = AV.faceAngle(bk), br = AV.apothemAt(bk, 1) + 0.6;
        P.republican.push({
          id: 'av.rep.banner.' + bk,
          kind: 'banner',
          x: r3(br * Math.cos(ba)),
          y: 80.0,
          z: r3(br * Math.sin(ba)),
          yaw: ba,
          w: 4.6,
          h: 14.0
        });
      }
    }

    // 7. Post-Cataclysm ruin rubble mounds & fallen structural drums (seated on y = 0 ground, clear of canals)
    if (state === 'ruined') {
      var mounds = [
        { id: 'av.debris.ne', th: Math.PI * 0.25, dist: 194.0, rx: 26.0, rz: 20.0, h: 9.5, drums: 2 },
        { id: 'av.debris.nw', th: Math.PI * 1.25, dist: 196.0, rx: 30.0, rz: 22.0, h: 11.0, drums: 3 },
        { id: 'av.debris.se', th: Math.PI * 0.72, dist: 190.0, rx: 22.0, rz: 18.0, h: 7.5, drums: 1 }
      ];
      for (var mi = 0; mi < mounds.length; mi++) {
        var M = mounds[mi];
        P.debris.push({
          id: M.id,
          x: r3(M.dist * Math.cos(M.th)),
          z: r3(M.dist * Math.sin(M.th)),
          rx: M.rx,
          rz: M.rz,
          h: M.h,
          yaw: M.th + 0.35,
          drums: M.drums,
          seed: (seed + 700 + mi * 37) | 0
        });
      }
    }
    return P;
  };

  // ---- Persistent edits overlay (README.md: edits as deltas by id, skipped if key changed) ----
  AV.applyEdits = function (P, delta) {
    if (!delta) return { applied: 0, skipped: 0 };
    var byId = {}, applied = 0, skipped = 0;
    var lists = [P.apses, P.towers, P.bridges, P.collarStruts, P.crownTiers, P.decks, P.portals, P.republican, P.debris];
    if (P.ancientRelics) {
      lists.push(P.ancientRelics.busTrunks, P.ancientRelics.capacitors, P.ancientRelics.hallProps);
      if (P.ancientRelics.primeDynamo) byId[P.ancientRelics.primeDynamo.id] = P.ancientRelics.primeDynamo;
      if (P.ancientRelics.statorCradle) byId[P.ancientRelics.statorCradle.id] = P.ancientRelics.statorCradle;
      if (P.ancientRelics.coolantRing) byId[P.ancientRelics.coolantRing.id] = P.ancientRelics.coolantRing;
    }
    if (P.hydroHall) {
      lists.push(P.hydroHall.wheels, P.hydroHall.gearTowers, P.hydroHall.dynamos, P.hydroHall.tripHammers, P.hydroHall.cupolas);
      if (P.hydroHall.aqueduct) byId[P.hydroHall.aqueduct.id] = P.hydroHall.aqueduct;
      if (P.hydroHall.bridgeCrane) byId[P.hydroHall.bridgeCrane.id] = P.hydroHall.bridgeCrane;
      if (P.hydroHall.salvageHoist) byId[P.hydroHall.salvageHoist.id] = P.hydroHall.salvageHoist;
    }
    lists.forEach(function (L) {
      (L || []).forEach(function (r) { if (r && r.id) byId[r.id] = r; });
    });
    if (P.lantern) byId[P.lantern.id] = P.lantern;
    var sets = delta.set || {};
    for (var id in sets) {
      var rec = byId[id], patch = sets[id];
      if (!rec) { skipped++; continue; }
      if (patch.expectKind && rec.kind && patch.expectKind !== rec.kind) { skipped++; continue; }
      for (var k in patch) if (k !== 'expectKind' && k !== 'id') rec[k] = patch[k];
      applied++;
    }
    if (Array.isArray(delta.add)) {
      delta.add.forEach(function (r) {
        if (!r || !r.id) { skipped++; return; }
        P.republican.push(Object.assign({}, r));
        applied++;
      });
    }
    return { applied: applied, skipped: skipped };
  };

  AV.portals = function (P) {
    var plan = P || AV.plan({ state: 'refurbished' });
    return plan.portals.map(function (q) { return Object.assign({}, q); });
  };
})();
