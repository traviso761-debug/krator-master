/* ================================================================= TETHIS — the pelagic saucer arcology: the plan ([G data])
   An Ancient marine live/work/recreation arcology on clustered pylons in open water (after __SOLERI_TETHIS__ and Babel IID,
   Kikutake's Marine City, and the owner's four reference plates), and its modern condition as a Hykkousoi gill-folk
   settlement whose use of every level follows directly from the Ancients' original zoning.

   Plain data and pure functions ([G data]): no THREE, no DOM, no Math.random. Every stochastic choice draws from KRAND
   hashed by (seed, id, salt). Coordinates: x east, z south (-z north), y = 0 Mean Sea Level, metres. */

var TETHIS = (function () {
  'use strict';

  var DIM = {
    SEED: 12600,
    HEX: 390,               /* primary hexagonal ring radius (centre-to-centre, m) */
    OUTER_X: 645,           /* axial harbour (west, -x) and heavy works (east, +x) centres */
    STO_SAUCER: 4.2,        /* saucer deck-to-deck storey height (m) */
    STO_TOWER: 3.6,         /* residential capsule & trunk storey height (m) */
    LIT_DEPTH: 14.0,        /* Soleri daylight rule: dwellings lie within 14 m of an open rim or lagoon well */
    M2_PER_PERSON: 45.0,    /* Krator Ancient generous residential standard (arcpile / lozenge low case) */
    HYK_POP: 6420           /* modern Hykkousoi population (~5,120 dry upper rings + ~1,300 wet/submerged gill-folk) */
  };

  /* Deterministic seabed bathymetry (y < 0, m): a sunlit carbonate coral shelf at -21.5 m under P0, stepping across
     a -24..-27 m reef bench under P1..P6 to -34 m in the outer channels off P7/P8. */
  function seabedAt(x, z) {
    var r2 = x * x + z * z;
    var shoal = -35.0 + 13.5 / (1.0 + r2 / (540.0 * 540.0));
    var ridge = 1.6 / ((1.0 + (z * z) / (320.0 * 320.0)) * (1.0 + (x * x) / (860.0 * 860.0)));
    var ripple = (KRAND.fbm(x * 0.008 + 50.0, 0.5, z * 0.008 + 50.0, 2, 7711) - 0.5) * 2.0;
    return Math.round((shoal + ridge + ripple) * 100) / 100;
  }

  function hexPt(deg, rad) {
    var a = deg * Math.PI / 180.0;
    return [
      Math.round(rad * Math.cos(a) * 100) / 100,
      Math.round(rad * Math.sin(a) * 100) / 100
    ];
  }

  function ringArea(rOut, rIn) {
    var ri = rIn == null ? 0 : rIn;
    return Math.PI * (rOut * rOut - ri * ri);
  }

  /* Daylight-lit area of an annular stepped saucer floor: outer terraced sea rim + inner lagoon rim (each LIT_DEPTH deep)
     plus nCourts radial light-courts cut through the mid-ring (Soleri / Westminster rule: deep plans breathe via light courts). */
  function litRingArea(rOut, rIn, nCourts) {
    var d = DIM.LIT_DEPTH;
    var ri = rIn == null ? 0 : rIn;
    var span = rOut - ri;
    if (span <= 2 * d) return ringArea(rOut, ri);
    var outerLit = ringArea(rOut, rOut - d);
    var innerLit = ri >= 12 ? ringArea(ri + d, ri) : 0;
    var midSpan = Math.max(0, span - 2 * d);
    var courts = nCourts == null ? 0 : nCourts;
    var courtLit = Math.min(ringArea(rOut - d, ri + d) * 0.78, courts * 2 * d * midSpan);
    return outerLit + innerLit + courtLit;
  }

  function makePlatforms() {
    var H = DIM.HEX;
    var p6 = hexPt(0, H), p4 = hexPt(60, H), p3 = hexPt(120, H),
        p5 = hexPt(180, H), p2 = hexPt(240, H), p1 = hexPt(300, H);

    /* Each platform record carries its structural geometry AND its Soleri functional zoning shares
       (live, work, recreation, civic — summing to 1.0 of gross indoor floor), plus rooftop open garden area. */
    var raw = [
      {
        id: 'P0', name: 'Nexus Ring & Inner Lagoon', x: 0, z: 0,
        rOut: 152, rWell: 54, y0: 24.0, st: 7, lightCourts: 6, profile: 'stepped_saucer',
        baseRing: { y0: 0.0, y1: 10.5, rOut: 138, rWell: 52, st: 2, seaGates: 6 },
        pylonRing: { count: 12, rad: 100, rPier: 4.8 },
        zone: 'civic', shares: { live: 0.50, work: 0.14, recreation: 0.18, civic: 0.18 },
        gardenHa: 2.75, slips: 6,
        role: 'Civic heart, Grand Promenade balcony, Hall of Tides, central scriptorium, clinic, and 6-gate inner harbour',
        modern: {
          state: 'hyk_accreted',
          use: 'Amphitriton Council Court & Lagoon Quay: upper promenade and apartments kept dry with nacre windscreens; waterline sea-gates berth pearl ships and triremes'
        }
      },
      {
        id: 'P1', name: 'North-East Residential Saucer', x: p1[0], z: p1[1],
        rOut: 126, rWell: 32, y0: 24.0, st: 8, lightCourts: 6, profile: 'stepped_saucer',
        pylonRing: { count: 8, rad: 82, rPier: 4.5 },
        zone: 'live', shares: { live: 0.78, work: 0.07, recreation: 0.10, civic: 0.05 },
        gardenHa: 1.85, slips: 2,
        role: 'High-density sunlit terrace duplexes on outer sea rim, 6 radial light-courts, and inner lagoon gallery',
        modern: {
          state: 'hyk_accreted',
          use: 'East Clam & Conch Quarter: Hykkousoi families inhabit sunlit rims, growing ribbed nacre barnacle-pods and shell balconies over missing Ancient glazing'
        }
      },
      {
        id: 'P2', name: 'North-West Academy & Residence Saucer', x: p2[0], z: p2[1],
        rOut: 126, rWell: 32, y0: 24.0, st: 8, lightCourts: 6, profile: 'stepped_saucer',
        pylonRing: { count: 8, rad: 82, rPier: 4.5 },
        zone: 'live', shares: { live: 0.75, work: 0.06, recreation: 0.09, civic: 0.10 },
        gardenHa: 1.90, slips: 2,
        role: 'Family apartment rings, Marine Academy, navigation halls, communal refectories, and rooftop play-gardens',
        modern: {
          state: 'hyk_accreted',
          use: 'West Navigator & Pearl-Guild Quarter: dry upper storeys house chart-makers, pearl-graders, and family courts; rainwater cisterns kept intact'
        }
      },
      {
        id: 'P3', name: 'South-West Botanical & Orchard Saucer', x: p3[0], z: p3[1],
        rOut: 122, rWell: 24, y0: 22.0, st: 5, lightCourts: 4, profile: 'garden_saucer',
        pylonRing: { count: 6, rad: 80, rPier: 4.5 },
        zone: 'garden', shares: { live: 0.36, work: 0.22, recreation: 0.36, civic: 0.06 },
        gardenHa: 4.10, slips: 2,
        role: 'Concentric irrigated orchard terraces, ribbon-glazed seed conservatory, hydroponic galleries, and tea pavilion',
        modern: {
          state: 'garden_rainfed',
          use: 'Rain-Fed Olive, Citrus & Sea-Linen Groves: concave dish collects fresh rain above fatal dry winds and salt spray; glazed pavilion patched with translucent shell'
        }
      },
      {
        id: 'P4', name: 'South-East Lagoon Park & Baths Saucer', x: p4[0], z: p4[1],
        rOut: 118, rWell: 46, y0: 22.0, st: 6, lightCourts: 5, profile: 'amphitheatre_saucer',
        pylonRing: { count: 6, rad: 82, rPier: 4.4 },
        zone: 'recreation', shares: { live: 0.44, work: 0.08, recreation: 0.38, civic: 0.10 },
        gardenHa: 2.20, slips: 3,
        role: 'Stepped amphitheatre descending to sheltered diving sea-well, thalassotherapy baths, gymnasium, and feast halls',
        modern: {
          state: 'kept_dry',
          use: 'Festival Basin & Gill-Games Court: Hykkousoi swimmers dive straight from the stepped stone bowl through the sea-well into the flooded reef dome below'
        }
      },
      {
        id: 'P5', name: 'West Harbour & Maritime Exchange Ring', x: p5[0], z: p5[1],
        rOut: 124, rWell: 52, y0: 14.0, st: 6, lightCourts: 4, profile: 'harbour_ring',
        canalCutDeg: 180, canalWidth: 36,
        baseRing: { y0: 0.0, y1: 9.0, rOut: 118, rWell: 52, st: 2, seaGates: 4 },
        pylonRing: { count: 8, rad: 88, rPier: 4.6 },
        zone: 'work', shares: { live: 0.30, work: 0.50, recreation: 0.08, civic: 0.12 },
        gardenHa: 0.70, slips: 6,
        role: '36 m ship canal entrance, customs hall, fish and kelp exchange, boatbuilding lofts, and bonded warehouses',
        modern: {
          state: 'hyk_accreted',
          use: 'Main Trireme & Outrigger Harbour: nacre slipways, net-lofts, and oyster-curing stalls line the sheltered ring quay; grown drawbridge spans the west ship cut'
        }
      },
      {
        id: 'P6', name: 'East Desalination, OTEC & Works Ring', x: p6[0], z: p6[1],
        rOut: 120, rWell: 38, y0: 16.0, st: 5, lightCourts: 3, profile: 'works_ring',
        baseRing: { y0: 0.0, y1: 9.5, rOut: 112, rWell: 38, st: 2, seaGates: 4 },
        pylonRing: { count: 8, rad: 82, rPier: 4.8 },
        zone: 'work', shares: { live: 0.20, work: 0.70, recreation: 0.05, civic: 0.05 },
        gardenHa: 0.35, slips: 4,
        role: 'Multi-stage flash desalination stills, OTEC turbine hall, electrolysis & alloy foundry, and machine fabrication',
        modern: {
          state: 'kept_dry',
          use: 'Bronze-Foundry & Shell-Lime Works: Ancient turbines stand silent as shrines of brass; ventilated high halls smelt salvaged bronze and calcine shell-lime'
        }
      },
      {
        id: 'P7', name: 'Far-West Sea-Gate & Pharos Platform', x: -DIM.OUTER_X, z: 0,
        rOut: 78, rWell: 18, y0: 12.0, st: 4, lightCourts: 2, profile: 'stepped_saucer',
        pylonRing: { count: 6, rad: 52, rPier: 4.0 },
        zone: 'infra', shares: { live: 0.36, work: 0.40, recreation: 0.08, civic: 0.16 },
        gardenHa: 0.40, slips: 4,
        role: 'Outer sea-lane control, quarantine ward, pilots lodge, weather station, and harbour breakwater pier',
        modern: {
          state: 'hyk_accreted',
          use: 'Watch-Fort & Sea-Gate: guards the western approach; south viaduct cut and replaced by a retractable Hykkousoi rib-drawbridge'
        }
      },
      {
        id: 'P8', name: 'Far-East Smelter & Brine-Refinery Platform', x: DIM.OUTER_X, z: 0,
        rOut: 80, rWell: 20, y0: 14.0, st: 4, lightCourts: 0, profile: 'works_ring',
        pylonRing: { count: 6, rad: 54, rPier: 4.2 },
        zone: 'work', shares: { live: 0.08, work: 0.86, recreation: 0.03, civic: 0.03 },
        gardenHa: 0.0, slips: 3,
        role: 'Heavy arc-smelters, alkali/brine chemical tanks, slag cranes, and hazardous-stores quay',
        modern: {
          state: 'salvage_ruin',
          use: 'Cut-Off Salvage Island: east pipe-bridge collapsed in the Cataclysm; corroded tanks and tilted crane worked by boat-crews for Ancient alloys (watched by core/ruins)'
        }
      }
    ];

    return raw.map(function (p) {
      var h = Math.round(p.st * DIM.STO_SAUCER * 100) / 100;
      var planA = ringArea(p.rOut, p.rWell);
      var baseFloor = p.baseRing ? ringArea(p.baseRing.rOut, p.baseRing.rWell) * p.baseRing.st : 0;
      var mainFloor = planA * p.st;
      var totalFloor = mainFloor + baseFloor;
      var litPerStorey = litRingArea(p.rOut, p.rWell, p.lightCourts);
      var liveFloor = totalFloor * p.shares.live;
      /* Enforce Soleri daylight cap: residential floor never exceeds physical daylight-lit perimeter + court area. */
      var maxLit = litPerStorey * p.st;
      var litLiveFloor = Math.min(liveFloor, maxLit);
      return Object.assign({}, p, {
        y1: Math.round((p.y0 + h) * 100) / 100,
        h: h,
        seabedY: seabedAt(p.x, p.z),
        planArea: Math.round(planA),
        floorArea: Math.round(totalFloor),
        litLiveFloor: Math.round(litLiveFloor),
        workFloor: Math.round(totalFloor * p.shares.work),
        recFloor: Math.round(totalFloor * p.shares.recreation),
        civicFloor: Math.round(totalFloor * p.shares.civic),
        gardenArea: Math.round(p.gardenHa * 10000)
      });
    });
  }

  function makeSatellites() {
    var sats = [
      {
        id: 'S0a', parent: 'P0', name: 'Medicinal & Spice Dish', x: -142, z: -112,
        rOut: 40, y0: 58.0, st: 2, mount: 'cantilever_strut',
        zone: 'garden', shares: { live: 0.15, work: 0.25, recreation: 0.55, civic: 0.05 }, gardenHa: 0.46,
        role: 'Cantilevered glass-rimmed conservatory saucer off P0 NW quadrant',
        modern: { state: 'garden_rainfed', use: 'Herbalists & Gill-Balm Conservatory: medicinal sea-herbs grown in sheltered mist beds' }
      },
      {
        id: 'S0b', parent: 'P0', name: 'Tide-Clock & Astral Dish', x: 142, z: -112,
        rOut: 38, y0: 62.0, st: 2, mount: 'cantilever_strut',
        zone: 'civic', shares: { live: 0.15, work: 0.35, recreation: 0.15, civic: 0.35 }, gardenHa: 0.18,
        role: 'Cantilevered astronomical, tide-harmonic, and weather-radar dish off P0 NE quadrant',
        modern: { state: 'kept_dry', use: 'Tide-Reckoners Dish: tracks Krator moons and giant-tides for the Ring Sea fleets' }
      },
      {
        id: 'S0c', parent: 'P0', name: 'Sky-Bath & Solarium Dish', x: 0, z: 180,
        rOut: 42, y0: 56.5, st: 2, mount: 'cantilever_strut',
        zone: 'recreation', shares: { live: 0.20, work: 0.05, recreation: 0.70, civic: 0.05 }, gardenHa: 0.38,
        role: 'Cantilevered warm saltwater infinity-bath and sunset terrace saucer off P0 south rim',
        modern: { state: 'kept_dry', use: 'Salt-Mist Bath Dish: Hykkousoi elders soak against dry-season gill-wither' }
      },
      {
        id: 'S3a', parent: 'P3', name: 'Lower Cascade Herb Saucer', x: -374, z: 438,
        rOut: 54, y0: 13.0, st: 2, mount: 'pylon_cluster', pylonCount: 4,
        zone: 'garden', shares: { live: 0.22, work: 0.28, recreation: 0.45, civic: 0.05 }, gardenHa: 0.82,
        role: 'Stepped lower companion garden saucer receiving gravity-fed irrigation cascade from P3 (Ref 1)',
        modern: { state: 'garden_rainfed', use: 'Gourd, Taro & Reed Terrace: fed by overflow rill along the stepped garden bridge' }
      }
    ];
    return sats.map(function (s) {
      var h = Math.round(s.st * DIM.STO_SAUCER * 100) / 100;
      var a = ringArea(s.rOut, 0) * s.st;
      return Object.assign({}, s, {
        y1: Math.round((s.y0 + h) * 100) / 100,
        h: h,
        seabedY: seabedAt(s.x, s.z),
        floorArea: Math.round(a),
        litLiveFloor: Math.round(a * s.shares.live),
        workFloor: Math.round(a * s.shares.work),
        recFloor: Math.round(a * s.shares.recreation),
        civicFloor: Math.round(a * s.shares.civic),
        gardenArea: Math.round(s.gardenHa * 10000)
      });
    });
  }

  function makeTowers() {
    /* Capsule drum radii follow Ref 4's scale model (each cellular drum ~64-72 m across, 30-40% of its saucer's width). */
    var towers = [
      {
        id: 'T0', parent: 'P0', kind: 'mushroom_great', name: 'Great Central Mushroom Spire',
        x: 0, z: 0, y0: 0.0, y1: 188.0, spireTop: 218.0,
        rTrunk: 26, rCap: 108, capY0: 158.0, capSt: 7,
        stemPods: [
          { id: 'T0_pod1', y: 78.0, r: 36, st: 2, role: 'Lower Sky-Lobby & Lift Transfer Pod' },
          { id: 'T0_pod2', y: 106.0, r: 33, st: 2, role: 'Gravity Fresh-Water Header Cistern & Mist Lounge' },
          { id: 'T0_pod3', y: 132.0, r: 30, st: 2, role: 'Signal Array & Wind-Turbine Gallery' }
        ],
        zone: 'live', shares: { live: 0.64, work: 0.08, recreation: 0.16, civic: 0.12 }, gardenHa: 2.85,
        role: 'Flared sea-trunk rising 218 m to a 216 m-wide ribbed mushroom saucer cap: panoramic sky-apartments, council dome, and rain-catchment summit orchard (Ref 3)',
        modern: {
          state: 'hyk_accreted',
          use: 'The Archon Watch & Rain-Crown: electric lifts dead, so a grown nacre conch-stair spirals up the ribbed trunk; concave roof dome harvests pure rainwater for all P0-P5'
        }
      },
      {
        id: 'T4', parent: 'P4', kind: 'mushroom_belvedere', name: 'South-East Mushroom Belvedere Tower',
        x: 232, z: 372, y0: 47.2, y1: 148.0, spireTop: 166.0,
        rTrunk: 15, rCap: 68, capY0: 126.0, capSt: 5,
        stemPods: [{ id: 'T4_pod1', y: 86.0, r: 23, st: 2, role: 'Mid-Stem Sea-View Tea & Music Pod' }],
        zone: 'live', shares: { live: 0.68, work: 0.06, recreation: 0.18, civic: 0.08 }, gardenHa: 1.05,
        role: 'Companion mushroom tower over the SE lagoon park: sky-villas, banquet belvedere, and radial lit soffit',
        modern: {
          state: 'kept_dry',
          use: 'High Feast & Lookout Dish: kept by the Pearl-Captains; signal braziers hang from its radial soffit ribs'
        }
      },
      {
        id: 'T1a', parent: 'P1', kind: 'capsule_residential', name: 'NE Primary Capsule Tower',
        x: 245, z: -380, y0: 57.6, y1: 180.0, spireTop: 192.0,
        rCore: 12, rDrum: 37, drums: 3, stPerDrum: 11, loggiaSt: 3,
        zone: 'live', shares: { live: 0.88, work: 0.02, recreation: 0.08, civic: 0.02 }, gardenHa: 0.30,
        role: '3 stacked Metabolist/Soleri drums studded with radial plug-in dwelling capsules, separated by open breeze loggias (Ref 4)',
        modern: {
          state: 'hyk_accreted',
          use: 'Barnacle-Crowned Capsule Stalk: lower two drums densely inhabited with shell-patched portholes; top drum serves as seabird rookery and rain tank'
        }
      },
      {
        id: 'T1b', parent: 'P1', kind: 'capsule_residential', name: 'NE Secondary Capsule Tower',
        x: 145, z: -380, y0: 57.6, y1: 147.6, spireTop: 158.0,
        rCore: 11, rDrum: 33, drums: 2, stPerDrum: 11, loggiaSt: 2,
        zone: 'live', shares: { live: 0.88, work: 0.02, recreation: 0.08, civic: 0.02 }, gardenHa: 0.22,
        role: '2 stacked radial residential capsule drums with mid-height communal sky-garden neck',
        modern: { state: 'hyk_accreted', use: 'Inhabited Capsule Stalk: linked at sky-loggia level to T1a by a woven sea-linen rope bridge' }
      },
      {
        id: 'T2a', parent: 'P2', kind: 'capsule_residential', name: 'NW Primary Capsule Tower',
        x: -245, z: -380, y0: 57.6, y1: 180.0, spireTop: 192.0,
        rCore: 12, rDrum: 37, drums: 3, stPerDrum: 11, loggiaSt: 3,
        zone: 'live', shares: { live: 0.86, work: 0.03, recreation: 0.08, civic: 0.03 }, gardenHa: 0.30,
        role: '3 stacked radial dwelling-capsule drums over NW Residential Saucer (Ref 4)',
        modern: { state: 'hyk_accreted', use: 'West Capsule Stalk: lower and middle drums occupied by guild households; nacre wind-catchers funnel damp sea air indoors' }
      },
      {
        id: 'T2b', parent: 'P2', kind: 'capsule_residential', name: 'NW Secondary Capsule Tower',
        x: -145, z: -380, y0: 57.6, y1: 147.6, spireTop: 158.0,
        rCore: 11, rDrum: 33, drums: 2, stPerDrum: 11, loggiaSt: 2,
        zone: 'live', shares: { live: 0.86, work: 0.04, recreation: 0.07, civic: 0.03 }, gardenHa: 0.22,
        role: '2 stacked radial capsule drums housing scholars and academy fellows',
        modern: { state: 'kept_dry', use: 'Scholars & Lore-Keepers Stalk: dry upper cells store sea-linen scrolls above storm surge' }
      },
      {
        id: 'T3', parent: 'P3', kind: 'capsule_residential', name: 'Botanical Dew-Spire & Agronomists Tower',
        x: -236, z: 382, y0: 43.0, y1: 122.2, spireTop: 136.0,
        rCore: 10, rDrum: 30, drums: 2, stPerDrum: 10, loggiaSt: 2,
        zone: 'live', shares: { live: 0.80, work: 0.10, recreation: 0.08, civic: 0.02 }, gardenHa: 0.18,
        role: '2 botanist dwelling drums crowned by atmospheric dew-condenser vanes feeding P3 gardens',
        modern: { state: 'garden_rainfed', use: 'Dew-Harp Tower: stretched sea-linen fog nets harvest morning mist into P3 orchard cisterns' }
      },
      {
        id: 'T5', parent: 'P7', kind: 'capsule_pharos', name: 'West Sea-Gate Pharos & Pilots Tower',
        x: -670, z: 0, y0: 28.8, y1: 118.8, spireTop: 138.0,
        rCore: 10, rDrum: 29, drums: 2, stPerDrum: 10, loggiaSt: 2,
        zone: 'infra', shares: { live: 0.70, work: 0.16, recreation: 0.06, civic: 0.08 }, gardenHa: 0.12,
        role: 'Harbour pilots and coast-watch capsule drums topped by high Fresnel/cyan sea-beacon',
        modern: { state: 'hyk_accreted', use: 'The Oil-Mirror Pharos: polished bronze-and-nacre reflectors project a whale-oil beacon 30 km across the Ring Sea' }
      },
      {
        id: 'T6a', parent: 'P6', kind: 'industrial_condenser', name: 'North Vapour-Condenser & Crane Column',
        x: 428, z: -50, y0: 37.0, y1: 138.0, spireTop: 150.0,
        rCore: 12, rDrum: 27, drums: 2, stPerDrum: 8, loggiaSt: 1,
        zone: 'work', shares: { live: 0.36, work: 0.58, recreation: 0.04, civic: 0.02 }, gardenHa: 0.0,
        role: 'Segmented smooth industrial distillation column with 2 shift-crew capsule collars and T-beam hoist head (Ref 4)',
        modern: { state: 'kept_dry', use: 'Foundry Draft-Chimney & Hoist Mast: natural updraft ventilates the Hykkousoi bronze furnaces below' }
      },
      {
        id: 'T6b', parent: 'P6', kind: 'industrial_condenser', name: 'South Electrolysis & Heat-Exchanger Column',
        x: 428, z: 50, y0: 37.0, y1: 124.0, spireTop: 136.0,
        rCore: 11, rDrum: 25, drums: 2, stPerDrum: 7, loggiaSt: 1,
        zone: 'work', shares: { live: 0.32, work: 0.62, recreation: 0.04, civic: 0.02 }, gardenHa: 0.0,
        role: 'Segmented chemical/brine fractionating tower and technician workshops (Ref 4)',
        modern: { state: 'worn_idle', use: 'Silent Brine Column: stripped of copper coils; bell-hung wind-chimes warn of eastern squalls' }
      }
    ];

    return towers.map(function (t) {
      var fl = 0;
      if (t.rCap) {
        var capFloor = litRingArea(t.rCap, t.rTrunk * 0.65, 6) * t.capSt + ringArea(t.rCap * 0.65, t.rTrunk * 0.65) * 2;
        var podFloor = (t.stemPods || []).reduce(function (s, q) { return s + ringArea(q.r, t.rTrunk * 0.8) * q.st; }, 0);
        var trunkFloor = ringArea(t.rTrunk, 9.0) * 14;
        fl = capFloor + podFloor + trunkFloor;
      } else {
        var stTot = t.drums * t.stPerDrum;
        fl = ringArea(t.rDrum, t.rCore) * stTot + ringArea(t.rDrum * 0.85, t.rCore) * t.loggiaSt;
      }
      return Object.assign({}, t, {
        floorArea: Math.round(fl),
        litLiveFloor: Math.round(fl * t.shares.live),
        workFloor: Math.round(fl * t.shares.work),
        recFloor: Math.round(fl * t.shares.recreation),
        civicFloor: Math.round(fl * t.shares.civic),
        gardenArea: Math.round(t.gardenHa * 10000)
      });
    });
  }

  function makeSubmerged() {
    var H = DIM.HEX;
    var p1 = hexPt(300, H), p4 = hexPt(60, H), p6 = hexPt(0, H);
    var pods = [
      {
        id: 'U0', parent: 'P0', name: 'Benthic Conservatory & Gene-Lab Rotunda',
        x: 0, z: 0, y0: -19.5, y1: -7.5, rOut: 68, rWell: 26, st: 3,
        zone: 'work', shares: { live: 0.0, work: 0.52, recreation: 0.30, civic: 0.18 },
        role: 'Submerged annular saucer suspended on P0 trunk and inner pylons (Ref 2): 360-deg reef viewports, marine genetics lab, kelp hatchery, and subsea tube hub',
        modern: {
          state: 'flooded_habitable',
          use: 'Drowned Gene-Scriptorium & Pearl Sanctuary: flooded at ambient pressure, accessible only to gill-bearing Hykkousoi; preserves etched metal/ceramic records (LORE 6.16) and sacred giant-oyster beds'
        }
      },
      {
        id: 'U1', parent: 'P1', name: 'Subsea Cold-Larder & Kelp Vat Dome',
        x: p1[0], z: p1[1], y0: -18.5, y1: -9.5, rOut: 44, rWell: 12, st: 2,
        zone: 'work', shares: { live: 0.0, work: 0.88, recreation: 0.06, civic: 0.06 },
        role: 'Sea-cooled provision vaults, agar/kelp fermentation rings, and diver lock under P1',
        modern: {
          state: 'flooded_habitable',
          use: 'Gilled Oyster-Larder & Wet Refuge: live shellfish pens and cool amphora stores tended underwater by P1 households'
        }
      },
      {
        id: 'U4', parent: 'P4', name: 'Subsea Reef Amphitheatre & Diving Bell Hall',
        x: p4[0], z: p4[1], y0: -21.0, y1: -9.5, rOut: 52, rWell: 16, st: 2,
        zone: 'recreation', shares: { live: 0.0, work: 0.12, recreation: 0.72, civic: 0.16 },
        role: 'Domed underwater observation theatre looking onto illuminated coral gardens beneath P4 diving lagoon',
        modern: {
          state: 'flooded_habitable',
          use: 'Sacred Court of the Deep: flooded ceremonial chamber where young Hykkousoi make their first unassisted gill-descent'
        }
      },
      {
        id: 'U6', parent: 'P6', name: 'OTEC Cold-Water Intake & Ballast Turbine Pod',
        x: p6[0], z: p6[1], y0: -24.5, y1: -11.5, rOut: 50, rWell: 14, st: 3,
        zone: 'infra', shares: { live: 0.0, work: 0.94, recreation: 0.0, civic: 0.06 },
        role: 'Deep cold-water heat exchangers, ballast pumps, and submarine service lock beneath P6',
        modern: {
          state: 'flooded_ruin',
          use: 'Flooded Turbine Vault: silted titanium impellers colonized by bioluminescent anemones and giant Moray-eels; salvaged cautiously by gill-divers'
        }
      }
    ];
    return pods.map(function (u) {
      var a = ringArea(u.rOut, u.rWell) * u.st;
      return Object.assign({}, u, {
        seabedY: seabedAt(u.x, u.z),
        floorArea: Math.round(a),
        litLiveFloor: 0,
        workFloor: Math.round(a * u.shares.work),
        recFloor: Math.round(a * u.shares.recreation),
        civicFloor: Math.round(a * u.shares.civic),
        gardenArea: 0
      });
    });
  }

  /* Mid-water hexagonal belvedere junction pods on single fluted pylons (Ref 1 foreground walkway junction!). */
  function makeJunctions(byId) {
    function mid(a, b, dx, dz, id, name, y) {
      var A = byId[a], B = byId[b];
      var x = Math.round(((A.x + B.x) * 0.5 + dx) * 100) / 100;
      var z = Math.round(((A.z + B.z) * 0.5 + dz) * 100) / 100;
      return { id: id, name: name, x: x, z: z, y: y, r: 18, seabedY: seabedAt(x, z), rPier: 3.8 };
    }
    return [
      mid('P5', 'P3', -22, 14, 'J1', 'South-West Belvedere Pylon Node', 23.0),
      mid('P4', 'P6', 22, 14, 'J2', 'South-East Belvedere Pylon Node', 23.0)
    ];
  }

  function makeBridges(byId, jById) {
    /* Rim-to-rim balcony skybridges and subsea tubes. Every span clips cleanly to its endpoints' outer radii. */
    function span(id, a, b, y, w, kind, modernState, modernNote, viaJ) {
      var A = byId[a], B = byId[b];
      var rA = A.rOut != null ? A.rOut : A.r;
      var rB = B.rOut != null ? B.rOut : B.r;
      var dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz);
      var ux = dx / d, uz = dz / d;
      var x0 = Math.round((A.x + ux * (rA - 2)) * 100) / 100;
      var z0 = Math.round((A.z + uz * (rA - 2)) * 100) / 100;
      var x1 = Math.round((B.x - ux * (rB - 2)) * 100) / 100;
      var z1 = Math.round((B.z - uz * (rB - 2)) * 100) / 100;
      var pts = viaJ ? [[x0, z0], [jById[viaJ].x, jById[viaJ].z], [x1, z1]] : [[x0, z0], [x1, z1]];
      var len = 0;
      for (var i = 0; i < pts.length - 1; i++) {
        len += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      }
      return {
        id: id, from: a, to: b, y: y, w: w, kind: kind, via: viaJ || null,
        pts: pts, length: Math.round(len * 10) / 10,
        modernState: modernState, modernNote: modernNote || ''
      };
    }

    /* Parallel twin harbour spans P5 <-> P7 (Ref 4's double viaduct!) */
    function parallelSpan(id, a, b, y, w, offsetZ, modernState, modernNote) {
      var A = byId[a], B = byId[b];
      var x0 = Math.round((A.x - (A.rOut - 4)) * 100) / 100;
      var x1 = Math.round((B.x + (B.rOut - 4)) * 100) / 100;
      return {
        id: id, from: a, to: b, y: y, w: w, kind: 'balcony_viaduct', via: null,
        pts: [[x0, offsetZ], [x1, offsetZ]], length: Math.round(Math.abs(x1 - x0) * 10) / 10,
        modernState: modernState, modernNote: modernNote || ''
      };
    }

    return [
      /* 6 radial spoke balcony bridges from Nexus P0 */
      span('B_0_1', 'P0', 'P1', 26.0, 14, 'spoke_balcony', 'intact_kept', 'Primary NE promenade spoke; lower duct carries rainwater from T0'),
      span('B_0_2', 'P0', 'P2', 26.0, 14, 'spoke_balcony', 'intact_kept', 'Primary NW promenade spoke with shell-lantern colonnade'),
      span('B_0_3', 'P0', 'P3', 25.0, 14, 'spoke_balcony', 'intact_kept', 'Garden aqueduct & orchard promenade spoke'),
      span('B_0_4', 'P0', 'P4', 25.0, 14, 'spoke_balcony', 'intact_kept', 'Festival procession balcony to Diving Lagoon'),
      span('B_0_5', 'P0', 'P5', 24.0, 16, 'spoke_balcony', 'intact_kept', 'Broad market & cargo ramp spoke from Harbour Ring'),
      span('B_0_6', 'P0', 'P6', 24.0, 15, 'spoke_balcony', 'intact_kept', 'Works spoke carrying bronze & lime carts'),

      /* 6 outer hexagonal ring balcony bridges */
      span('B_1_2', 'P1', 'P2', 26.0, 11, 'ring_balcony', 'intact_kept', 'North residential sea-view balcony walk'),
      span('B_2_5', 'P2', 'P5', 22.0, 11, 'ring_balcony', 'intact_kept', 'Harbour-to-Academy stepped balcony'),
      span('B_5_3', 'P5', 'P3', 22.0, 11, 'ring_balcony', 'intact_kept', 'West garden walkway via Belvedere J1', 'J1'),
      span('B_3_4', 'P3', 'P4', 22.5, 11, 'ring_balcony', 'intact_kept', 'South orchard-to-baths sea promenade'),
      span('B_4_6', 'P4', 'P6', 22.0, 11, 'ring_balcony', 'intact_kept', 'South-East walkway via Belvedere J2', 'J2'),
      span('B_6_1', 'P6', 'P1', 23.0, 11, 'ring_balcony', 'hyk_rib_bridge', 'Ancient centre span fell; bridged by a Hykkousoi arched organic rib-span'),

      /* Outer axial & satellite connections */
      parallelSpan('B_5_7n', 'P5', 'P7', 18.0, 10, -20, 'intact_kept', 'North Sea-Gate viaduct'),
      parallelSpan('B_5_7s', 'P5', 'P7', 18.0, 10, 20, 'hyk_drawbridge', 'Center cut for tall masts & defence; fitted with Hykkousoi counterweighted rib-drawbridge'),
      span('B_6_8', 'P6', 'P8', 20.0, 13, 'pipe_viaduct', 'collapsed', 'Collapsed in the Cataclysm: broken concrete stubs over submerged truss wreckage, isolating P8'),
      span('B_3_3a', 'P3', 'S3a', 19.5, 9, 'garden_ramp', 'intact_kept', 'Stepped water-rill & garden ramp down to Lower Herb Saucer S3a (Ref 1)'),

      /* 3 submerged subsea tubes at y = -14 m */
      span('ST_0_1', 'U0', 'U1', -14.0, 6, 'subsea_tube', 'flooded_swimway', 'Flooded glazed pressure-tube used by Hykkousoi swimmers to reach U1 oyster larders'),
      span('ST_0_4', 'U0', 'U4', -14.0, 6, 'subsea_tube', 'flooded_swimway', 'Sacred underwater processional tube from Gene-Scriptorium U0 to Reef Court U4'),
      span('ST_0_6', 'U0', 'U6', -14.5, 6, 'subsea_tube', 'breached_ruin', 'Ruptured mid-span on coral shelf; barred by Hykkousoi bronze grille against deep eels')
    ];
  }

  /* Generate deterministic pylon pier records seated on seabedAt(x, z) for every platform, satellite, and junction. */
  function makePylons(platforms, satellites, junctions, seed) {
    var out = [];
    platforms.forEach(function (p) {
      var n = p.pylonRing.count, rad = p.pylonRing.rad, rp = p.pylonRing.rPier;
      for (var k = 0; k < n; k++) {
        var a = (2 * Math.PI * k) / n + (Math.PI / n);
        var px = Math.round((p.x + rad * Math.cos(a)) * 100) / 100;
        var pz = Math.round((p.z + rad * Math.sin(a)) * 100) / 100;
        var sb = seabedAt(px, pz);
        var rng = KRAND.stream(KRAND.child(seed, 'pylon:' + p.id + ':' + k));
        var barnacles = Math.round((0.45 + 0.5 * rng.next()) * 100) / 100;
        out.push({
          id: 'PY_' + p.id + '_' + k, parent: p.id, x: px, z: pz, r: rp,
          y0: Math.round((sb - 4.0) * 100) / 100, y1: p.y0, seabedY: sb,
          barnacleBand: barnacles, ruined: p.id === 'P8' && k === 2
        });
      }
    });
    satellites.forEach(function (s) {
      if (s.mount !== 'pylon_cluster') return;
      var n = s.pylonCount == null ? 4 : s.pylonCount;
      for (var k = 0; k < n; k++) {
        var a = (2 * Math.PI * k) / n + Math.PI / 4;
        var px = Math.round((s.x + (s.rOut * 0.58) * Math.cos(a)) * 100) / 100;
        var pz = Math.round((s.z + (s.rOut * 0.58) * Math.sin(a)) * 100) / 100;
        var sb = seabedAt(px, pz);
        out.push({
          id: 'PY_' + s.id + '_' + k, parent: s.id, x: px, z: pz, r: 3.4,
          y0: Math.round((sb - 4.0) * 100) / 100, y1: s.y0, seabedY: sb,
          barnacleBand: 0.7, ruined: false
        });
      }
    });
    junctions.forEach(function (j) {
      out.push({
        id: 'PY_' + j.id, parent: j.id, x: j.x, z: j.z, r: j.rPier,
        y0: Math.round((j.seabedY - 4.0) * 100) / 100, y1: j.y, seabedY: j.seabedY,
        barnacleBand: 0.65, ruined: false
      });
    });
    return out;
  }

  /* Hykkousoi modern host-additions (derived deterministically from the original zoning & KRAND). */
  function makeHykkousoiAdditions(platforms, towers, submerged, seed) {
    var adds = [];
    platforms.forEach(function (p) {
      if (p.modern.state !== 'hyk_accreted') return;
      var nPods = p.id === 'P0' ? 10 : (p.id === 'P5' ? 8 : 12);
      for (var k = 0; k < nPods; k++) {
        var rng = KRAND.stream(KRAND.child(seed, 'hykpod:' + p.id + ':' + k));
        var a = (2 * Math.PI * k) / nPods + (rng.next() - 0.5) * 0.22;
        var onInner = (k % 3 === 0) && p.rWell >= 30;
        var rad = onInner ? p.rWell + 2.0 : p.rOut - 1.5;
        adds.push({
          id: 'HYK_' + p.id + '_' + k, host: p.id,
          kind: k % 4 === 0 ? 'conch_stair_pod' : (k % 2 === 0 ? 'barnacle_cluster' : 'scallop_balcony'),
          x: Math.round((p.x + rad * Math.cos(a)) * 100) / 100,
          z: Math.round((p.z + rad * Math.sin(a)) * 100) / 100,
          y: Math.round((p.y0 + 3.0 + rng.next() * (p.h - 5.0)) * 100) / 100,
          r: Math.round((5.5 + rng.next() * 5.0) * 10) / 10
        });
      }
    });
    /* Helical conch stair climbing T0's ribbed trunk from P0 roof (+49 m) to Great Mushroom Cap (+158 m) */
    adds.push({
      id: 'HYK_T0_helix', host: 'T0', kind: 'conch_helical_stair',
      x: 0, z: 0, y0: 48.0, y1: 158.0, r: 28.5, turns: 3.5,
      note: 'Grown nacre-and-timber spiral stair replacing dead Ancient lifts up T0 trunk'
    });
    /* Lagoon pearl-oyster & kelp rafts in P0, P4, P5 wells */
    ['P0', 'P4', 'P5'].forEach(function (pid, idx) {
      var p = platforms.filter(function (q) { return q.id === pid; })[0];
      adds.push({
        id: 'HYK_raft_' + pid, host: pid, kind: 'pearl_oyster_lines',
        x: p.x, z: p.z, y: 0.0, r: Math.round(p.rWell * 0.72),
        count: 6 + idx * 2, note: 'Submerged oyster baskets & giant-kelp lines suspended in sheltered sea-well'
      });
    });
    return adds;
  }

  /* Circulation reachability graph: mode = 'intact' | 'modern_dry' | 'modern_gill' */
  function reach(P, mode) {
    var adj = {};
    function addNode(id) { if (!adj[id]) adj[id] = []; }
    function link(a, b) { addNode(a); addNode(b); adj[a].push(b); adj[b].push(a); }

    P.platforms.forEach(function (p) { addNode(p.id); });
    P.satellites.forEach(function (s) {
      addNode(s.id);
      if (s.mount === 'cantilever_strut') link(s.parent, s.id);
    });
    P.towers.forEach(function (t) {
      addNode(t.id);
      /* Intact lifts reach all towers; in modern state T0 is reached by HYK_T0_helix and others by internal stairs,
         except P8's structures if P8 itself is unreachable. */
      link(t.parent, t.id);
    });
    P.submerged.forEach(function (u) {
      addNode(u.id);
      if (mode === 'intact') {
        link(u.parent, u.id);
      } else if (mode === 'modern_gill' && u.modern.state === 'flooded_habitable') {
        link(u.parent, u.id);
      }
    });
    P.bridges.forEach(function (b) {
      if (b.kind === 'subsea_tube') {
        if (mode === 'intact') link(b.from, b.to);
        else if (mode === 'modern_gill' && b.modernState === 'flooded_swimway') link(b.from, b.to);
      } else {
        if (mode === 'intact') link(b.from, b.to);
        else if (b.modernState !== 'collapsed') link(b.from, b.to);
      }
    });

    /* Entry harbour nodes: P5 (West Harbour) and P0 (Central Lagoon) */
    var seen = new Set(['P5', 'P0']);
    var q = ['P5', 'P0'];
    while (q.length) {
      var cur = q.shift();
      var nb = adj[cur] || [];
      for (var i = 0; i < nb.length; i++) {
        if (!seen.has(nb[i])) {
          seen.add(nb[i]);
          q.push(nb[i]);
        }
      }
    }
    return seen;
  }

  /* Analytical concrete hull-curve & dock-face descriptor (shared with 8av2/8av4 so spec and geometry cannot drift).
     Exposes span, H, toe(x, side), rAt(y, th) / plinthRAt(y, th), saucerRAt, wellRAt, soffitY, pylonRAt, tideline, docks. */
  function saucerStepIn(p) {
    return p.profile === 'amphitheatre_saucer' ? 2.2 : (p.profile === 'garden_saucer' ? 5.2 : 3.4);
  }
  function saucerWellStep(p) {
    return p.profile === 'amphitheatre_saucer' ? 5.4 : 2.2;
  }
  function saucerSoffDrop(p) {
    return p.mount != null ? 3.8 : 5.6;
  }
  function saucerCanalHalfAng(p) {
    if (!(p && p.canalWidth != null && p.canalWidth > 0)) return 0;
    var rWell = p.rWell == null ? 0 : p.rWell;
    var denom = Math.max(rWell + 8.0, p.rOut * 0.72);
    var ratio = (p.canalWidth * 0.5) / denom;
    return Math.asin(ratio < 0.05 ? 0.05 : (ratio > 0.65 ? 0.65 : ratio));
  }
  function saucerInCanal(p, th) {
    var halfAng = saucerCanalHalfAng(p);
    if (halfAng <= 0 || th == null) return false;
    var da = Math.abs(Math.atan2(Math.sin(th - Math.PI), Math.cos(th - Math.PI)));
    return da < halfAng;
  }
  function saucerSoffitY(p, r) {
    var rWell = p.rWell == null ? 0 : p.rWell;
    var rInSoff = rWell > 2.0 ? rWell : 0.6;
    var soffDrop = saucerSoffDrop(p);
    var v = (r - rInSoff) / Math.max(0.001, p.rOut - rInSoff);
    v = v < 0 ? 0 : (v > 1 ? 1 : v);
    var belly = Math.sin(v * Math.PI);
    var lip = v > 0.86 ? Math.pow((v - 0.86) / 0.14, 1.7) * soffDrop * 0.75 : 0.0;
    var y = p.y0 - soffDrop * (0.28 + 0.72 * belly) + lip;
    if (v > 0.96) y = y + (p.y0 + 0.6 - y) * ((v - 0.96) / 0.04);
    return y;
  }

  function makeHull(platforms, satellites, towers, submerged, pylons, bounds) {
    var discs = platforms.concat(satellites);
    var byId = {};
    discs.concat(towers, submerged, pylons).forEach(function (o) { byId[o.id] = o; });
    var p0 = byId.P0, t0 = byId.T0, u0 = byId.U0;

    function resolveObj(oOrId) {
      return typeof oOrId === 'string' ? byId[oOrId] : oOrId;
    }

    function saucerRAt(pOrId, y, th) {
      var p = resolveObj(pOrId);
      if (!p || p.rOut == null) return 0;
      if (saucerInCanal(p, th)) return 0;
      var sto = 4.2, soffDrop = saucerSoffDrop(p);
      var yTop = p.y0 + p.st * sto + 0.90;
      var yBot = p.y0 - soffDrop;
      if (y < yBot || y > yTop) return 0;
      if (y >= p.y0) {
        var s = Math.floor((y - p.y0) / sto);
        if (s < 0) s = 0;
        if (s >= p.st) s = p.st - 1;
        var ya = p.y0 + s * sto, yb = ya + sto;
        var ro0 = p.rOut - s * saucerStepIn(p);
        if (y >= yb - 0.35 && y <= yb + 0.90) return ro0 + 1.1;
        var f = (y - ya) / sto;
        f = f < 0 ? 0 : (f > 1 ? 1 : f);
        return ro0 - f * 0.55;
      }
      /* Outer branch of curved bullnosed soffit dish (v in [0.5, 1.0]) */
      var rWell = p.rWell == null ? 0 : p.rWell;
      var rInSoff = rWell > 2.0 ? rWell : 0.6;
      var lo = rInSoff + (p.rOut - rInSoff) * 0.5, hi = p.rOut;
      for (var it = 0; it < 16; it++) {
        var mid = (lo + hi) * 0.5;
        if (saucerSoffitY(p, mid) < y) lo = mid; else hi = mid;
      }
      return (lo + hi) * 0.5;
    }

    function wellRAt(pOrId, y, th) {
      var p = resolveObj(pOrId);
      if (!p || (p.rWell || 0) <= 2.0) return 0;
      if (saucerInCanal(p, th)) return 0;
      var sto = 4.2, soffDrop = saucerSoffDrop(p);
      if (y < p.y0 - soffDrop || y > p.y0 + p.st * sto + 0.90) return 0;
      if (y < p.y0) return p.rWell;
      var s = Math.floor((y - p.y0) / sto);
      if (s < 0) s = 0;
      if (s >= p.st) s = p.st - 1;
      return p.rWell + s * saucerWellStep(p);
    }

    function pylonRAt(pyOrId, y, th) {
      var py = resolveObj(pyOrId);
      if (!py || y < py.y0 || y > py.y1) return 0;
      if (py.y1 > 11.0 && y >= 6.5 && y <= 8.5) {
        var fc = (y - 6.5) / 2.0;
        return py.r * (1.28 + 0.08 * fc);
      }
      var yy = y - py.y0, H = py.y1 - py.y0;
      var foot = yy < 5.5 ? (1.0 + 0.44 * Math.pow(1.0 - yy / 5.5, 1.8)) : 1.0;
      var cap = yy > H - 5.2 ? (1.0 + 0.50 * Math.pow((yy - (H - 5.2)) / 5.2, 1.6)) : 1.0;
      var flute = th == null ? 1.0 : (1.0 + 0.095 * Math.cos(12.0 * th));
      return py.r * foot * cap * flute;
    }

    /* Central Nexus plinth / lagoon dock / P0 saucer / T0 Mushroom Spire concrete face r(y, th) */
    function plinthRAt(y, th) {
      if (y < -20.5 || y > t0.spireTop) return 0;
      if (y <= -8.5) return u0.rOut;
      if (y >= -2.0 && y <= 2.2) {
        /* Waterline concrete lagoon-dock ring (r = 56..74 m) + 4 cardinal boat slips projecting to r = 76 m */
        if (th != null) {
          for (var si = 0; si < 4; si++) {
            var aS = si * Math.PI * 0.5;
            var dA = Math.abs(Math.atan2(Math.sin(th - aS), Math.cos(th - aS)));
            if (dA < Math.atan2(3.6, 74.0)) return 76.0;
          }
        }
        return 74.0;
      }
      var rP0 = saucerRAt(p0, y, th);
      if (rP0 > 0) return rP0;
      if (y < p0.y0) return 20.0; /* central submerged/waterline caisson column */
      /* Above P0 deck: T0 Great Mushroom Spire trunk, radial soffit dish, stepped cap & cupola */
      var soffY0 = t0.capY0 - 16.0, capY0 = t0.capY0, capTop = t0.y1;
      if (y < soffY0) {
        var fT = (y - t0.y0) / Math.max(1.0, soffY0 - t0.y0);
        var waist = 1.0 - 0.12 * Math.sin(Math.min(1, Math.max(0, fT)) * Math.PI * 0.85);
        var flare = fT > 0.86 ? (1.0 + 0.42 * Math.pow((fT - 0.86) / 0.14, 1.8)) : 1.0;
        var fl = th == null ? 1.0 : (1.0 + 0.065 * Math.cos(16.0 * th));
        return t0.rTrunk * waist * flare * fl;
      }
      if (y <= capY0) {
        var vS = (y - soffY0) / Math.max(1.0, capY0 - soffY0);
        return (t0.rTrunk * 1.25) + (t0.rCap - t0.rTrunk * 1.25) * Math.pow(Math.min(1, Math.max(0, vS)), 0.72);
      }
      if (y <= capTop) {
        var sc = Math.min(t0.capSt - 1, Math.max(0, Math.floor((y - capY0) / 4.2)));
        return t0.rCap - sc * 7.6;
      }
      if (y <= capTop + 13.5) {
        var uC = (y - capTop) / 13.5;
        return t0.rCap * 0.24 * Math.sqrt(Math.max(0, 1.0 - uC * uC));
      }
      return 0.75; /* central broadcast spire needle */
    }

    /* Outer concrete fascia envelope z(x) across the hexagonal/axial saucer lattice.
       side >= 0 (default): north (+z) toe; side < 0: south (-z) toe; 0 outside lattice X span. */
    function toe(x, side) {
      var north = side == null || side >= 0;
      var best = north ? -1e9 : 1e9;
      var hit = false;
      for (var i = 0; i < discs.length; i++) {
        var d = discs[i];
        var R = d.rOut + 1.1;
        var dx = x - d.x;
        if (Math.abs(dx) <= R) {
          var dz = Math.sqrt(R * R - dx * dx);
          hit = true;
          if (north) {
            if (d.z + dz > best) best = d.z + dz;
          } else {
            if (d.z - dz < best) best = d.z - dz;
          }
        }
      }
      return hit ? Math.round(best * 100) / 100 : 0;
    }

    /* Exact waterline (y = 0) concrete faces for foam/tideline/wake snapping */
    function tideline(d) {
      var wetPylons = [];
      for (var i = 0; i < pylons.length; i++) {
        var py = pylons[i];
        if (py.y0 < 0 && py.y1 > 0) {
          wetPylons.push({
            id: py.id, parent: py.parent, x: py.x, z: py.z,
            r: Math.round(pylonRAt(py, 0) * 1000) / 1000
          });
        }
      }
      return {
        waterY: 0,
        lagoonDock: { id: 'P0_lagoon_dock', parent: 'P0', x: 0, z: 0, rIn: 56.0, rOut: 74.0, y0: -2.0, y1: 2.2 },
        caisson: { id: 'T0_caisson', parent: 'P0', x: 0, z: 0, r: 20.0, y0: -8.5, y1: 22.0 },
        harbourPiers: [
          { id: 'P5_pier_S', parent: 'P5', x0: -575.0, x1: -465.0, z: -28.0, w: 10.0, y0: -2.0, y1: 4.2 },
          { id: 'P5_pier_N', parent: 'P5', x0: -575.0, x1: -465.0, z: 28.0, w: 10.0, y0: -2.0, y1: 4.2 }
        ],
        amphitheatreSteps: { id: 'P4_water_steps', parent: 'P4', x: byId.P4.x, z: byId.P4.z, r: byId.P4.rWell, y0: -1.2, y1: byId.P4.y0 },
        pylons: wetPylons,
        modern: d > 0
      };
    }

    /* Exact concrete berthing/dock faces so vessels, gangways, and dock props snap without magic numbers */
    function docks(d) {
      var list = [
        { id: 'DOCK_P0_E', parent: 'P0', kind: 'lagoon_slip', x: 56.0, z: 0.0, nx: -1, nz: 0, length: 20.0, width: 7.2, deckY: 1.4 },
        { id: 'DOCK_P0_N', parent: 'P0', kind: 'lagoon_slip', x: 0.0, z: 56.0, nx: 0, nz: -1, length: 20.0, width: 7.2, deckY: 1.4 },
        { id: 'DOCK_P0_W', parent: 'P0', kind: 'lagoon_slip', x: -56.0, z: 0.0, nx: 1, nz: 0, length: 20.0, width: 7.2, deckY: 1.4 },
        { id: 'DOCK_P0_S', parent: 'P0', kind: 'lagoon_slip', x: 0.0, z: -56.0, nx: 0, nz: 1, length: 20.0, width: 7.2, deckY: 1.4 },
        { id: 'DOCK_P5_QUAY_N', parent: 'P5', kind: 'harbour_viaduct', x: -520.0, z: 23.0, nx: 0, nz: -1, length: 110.0, width: 10.0, deckY: 4.2 },
        { id: 'DOCK_P5_QUAY_S', parent: 'P5', kind: 'harbour_viaduct', x: -520.0, z: -23.0, nx: 0, nz: 1, length: 110.0, width: 10.0, deckY: 4.2 },
        { id: 'DOCK_P4_STEPS', parent: 'P4', kind: 'water_steps', x: byId.P4.x, z: byId.P4.z - byId.P4.rWell, nx: 0, nz: 1, length: 28.0, width: 6.0, deckY: 1.8 },
        { id: 'DOCK_P7_SEAGATE', parent: 'P7', kind: 'seagate_quay', x: byId.P7.x - byId.P7.rWell, z: byId.P7.z, nx: 1, nz: 0, length: 24.0, width: 6.0, deckY: 2.2 }
      ];
      if (d > 0) {
        list.push({ id: 'DOCK_P8_SALVAGE', parent: 'P8', kind: 'salvage_landing', x: byId.P8.x - byId.P8.rOut, z: byId.P8.z, nx: -1, nz: 0, length: 18.0, width: 5.5, deckY: 2.0 });
      }
      return list;
    }

    return {
      span: Math.round(bounds.maxX - bounds.minX),
      spanX: Math.round(bounds.maxX - bounds.minX),
      spanZ: Math.round(bounds.maxZ - bounds.minZ),
      H: bounds.maxTop,
      y0: bounds.minDepth,
      y1: bounds.maxTop,
      waterY: 0,
      bounds: { x0: bounds.minX, x1: bounds.maxX, z0: bounds.minZ, z1: bounds.maxZ },
      toe: toe,
      rAt: plinthRAt,
      plinthRAt: plinthRAt,
      saucerRAt: saucerRAt,
      wellRAt: wellRAt,
      soffitY: saucerSoffitY,
      stepIn: saucerStepIn,
      wellStep: saucerWellStep,
      canalHalfAng: saucerCanalHalfAng,
      inCanal: saucerInCanal,
      pylonRAt: pylonRAt,
      tideline: tideline,
      docks: docks
    };
  }

  function plan(opt) {
    opt = opt || {};
    var seed = opt.seed == null ? DIM.SEED : opt.seed;
    var platforms = makePlatforms();
    var satellites = makeSatellites();
    var towers = makeTowers();
    var submerged = makeSubmerged();

    var byId = {};
    platforms.concat(satellites, towers, submerged).forEach(function (r) { byId[r.id] = r; });
    var junctions = makeJunctions(byId);
    var jById = {};
    junctions.forEach(function (j) { jById[j.id] = j; });

    var bridges = makeBridges(byId, jById);
    var pylons = makePylons(platforms, satellites, junctions, seed);
    var hykkousoi = makeHykkousoiAdditions(platforms, towers, submerged, seed);

    var allVolumes = platforms.concat(satellites, towers, submerged);
    var totFloor = 0, liveFloor = 0, workFloor = 0, recFloor = 0, civicFloor = 0, gardenArea = 0;
    allVolumes.forEach(function (v) {
      totFloor += v.floorArea;
      liveFloor += v.litLiveFloor;
      workFloor += v.workFloor;
      recFloor += v.recFloor;
      civicFloor += v.civicFloor;
      gardenArea += v.gardenArea;
    });
    var lagoonArea = Math.round(platforms.reduce(function (s, p) { return s + ringArea(p.rWell, 0); }, 0));
    var peakPop = Math.round(liveFloor / DIM.M2_PER_PERSON);

    /* Extents of the full marine lattice */
    var minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9, maxTop = 0, minDepth = 0;
    platforms.concat(satellites).forEach(function (p) {
      if (p.x - p.rOut < minX) minX = p.x - p.rOut;
      if (p.x + p.rOut > maxX) maxX = p.x + p.rOut;
      if (p.z - p.rOut < minZ) minZ = p.z - p.rOut;
      if (p.z + p.rOut > maxZ) maxZ = p.z + p.rOut;
    });
    towers.forEach(function (t) { if (t.spireTop > maxTop) maxTop = t.spireTop; });
    submerged.forEach(function (u) { if (u.y0 < minDepth) minDepth = u.y0; });

    var hull = makeHull(platforms, satellites, towers, submerged, pylons, {
      minX: minX, maxX: maxX, minZ: minZ, maxZ: maxZ, maxTop: maxTop, minDepth: minDepth
    });

    return {
      id: 'tethis',
      seed: seed,
      dim: DIM,
      hull: hull,
      platforms: platforms,
      satellites: satellites,
      towers: towers,
      submerged: submerged,
      junctions: junctions,
      bridges: bridges,
      pylons: pylons,
      hykkousoi: hykkousoi,
      stats: {
        spanX: Math.round(maxX - minX),
        spanZ: Math.round(maxZ - minZ),
        maxHeight: maxTop,
        minSubmergedY: minDepth,
        totalFloor: totFloor,
        liveFloor: liveFloor,
        workFloor: workFloor,
        recFloor: recFloor,
        civicFloor: civicFloor,
        gardenArea: gardenArea,
        lagoonArea: lagoonArea,
        peakPop: peakPop,
        modernPop: DIM.HYK_POP,
        platformCount: platforms.length,
        satelliteCount: satellites.length,
        towerCount: towers.length,
        submergedCount: submerged.length,
        bridgeCount: bridges.length,
        pylonCount: pylons.length
      }
    };
  }

  /* Plain validation rules over a plan record (used by test-tethis.js with T.ok and T.neg, and by tethis_blueprint.py). */
  var RULES = {
    uniqueIds: function (P) {
      var seen = new Set();
      var lists = [P.platforms, P.satellites, P.towers, P.submerged, P.junctions, P.bridges, P.pylons, P.hykkousoi];
      for (var i = 0; i < lists.length; i++) {
        for (var j = 0; j < lists[i].length; j++) {
          var id = lists[i][j].id;
          if (!id || seen.has(id)) return false;
          seen.add(id);
        }
      }
      return true;
    },
    noSaucerOverlap: function (P) {
      var discs = P.platforms.concat(P.satellites);
      for (var i = 0; i < discs.length; i++) {
        for (var j = i + 1; j < discs.length; j++) {
          var a = discs[i], b = discs[j];
          var yOverlap = a.y0 < b.y1 + 1.0 && b.y0 < a.y1 + 1.0;
          if (!yOverlap) continue;
          var dist = Math.hypot(a.x - b.x, a.z - b.z);
          if (dist < a.rOut + b.rOut + 6.0) return false;
        }
      }
      return true;
    },
    pylonsSeatedOnSeabed: function (P) {
      for (var i = 0; i < P.pylons.length; i++) {
        var py = P.pylons[i];
        var sb = seabedAt(py.x, py.z);
        /* Every pylon base must embed 2..8 m into the seabed and rise to its deck soffit (> 0 m). */
        if (py.y0 > sb - 1.5 || py.y0 < sb - 9.0 || py.y1 <= 0) return false;
      }
      return P.pylons.length >= 60;
    },
    submergedBelowWaterlineAndClearOfBed: function (P) {
      for (var i = 0; i < P.submerged.length; i++) {
        var u = P.submerged[i];
        if (u.y1 > -4.0) return false;   /* top of submerged pod stays well under sea surface y = 0 */
        if (u.y0 < u.seabedY - 5.5) return false; /* seated on/above seabed without burying whole storeys */
      }
      return P.submerged.length >= 4;
    },
    bridgesSeatedOnRims: function (P) {
      var byId = {};
      P.platforms.concat(P.satellites, P.submerged).forEach(function (x) { byId[x.id] = x; });
      for (var i = 0; i < P.bridges.length; i++) {
        var b = P.bridges[i];
        var A = byId[b.from], B = byId[b.to];
        if (!A || !B || !b.pts || b.pts.length < 2) return false;
        var p0 = b.pts[0], p1 = b.pts[b.pts.length - 1];
        var dA = Math.hypot(p0[0] - A.x, p0[1] - A.z);
        var dB = Math.hypot(p1[0] - B.x, p1[1] - B.z);
        if (Math.abs(dA - A.rOut) > 12.0 || Math.abs(dB - B.rOut) > 12.0) return false;
      }
      return true;
    },
    intactFullReach: function (P) {
      var seen = reach(P, 'intact');
      var all = P.platforms.concat(P.satellites, P.towers, P.submerged);
      for (var i = 0; i < all.length; i++) {
        if (!seen.has(all[i].id)) return false;
      }
      return true;
    },
    modernSelectiveReach: function (P) {
      var dry = reach(P, 'modern_dry');
      var gill = reach(P, 'modern_gill');
      /* In modern state: P0..P7 are dry-reachable, P8 is cut off (salvage island), U0/U1/U4 are gill-reachable ONLY, U6 is sealed ruin. */
      for (var k = 0; k <= 7; k++) {
        if (!dry.has('P' + k)) return false;
      }
      if (dry.has('P8') || gill.has('P8')) return false;
      if (dry.has('U0') || !gill.has('U0') || !gill.has('U1') || !gill.has('U4')) return false;
      if (gill.has('U6')) return false;
      return true;
    },
    scaleAndPopulationInTarget: function (P) {
      var S = P.stats;
      return S.spanX >= 1200 && S.spanX <= 1550 &&
             S.peakPop >= 35000 && S.peakPop <= 50000 &&
             S.liveFloor > S.workFloor && S.workFloor > 400000 && S.recFloor > 250000 &&
             S.gardenArea > 120000;
    },
    daylightHousingLaw: function (P) {
      for (var i = 0; i < P.platforms.length; i++) {
        var p = P.platforms[i];
        var maxLit = litRingArea(p.rOut, p.rWell, p.lightCourts) * p.st + 1;
        if (p.litLiveFloor > maxLit) return false;
      }
      for (var j = 0; j < P.submerged.length; j++) {
        if (P.submerged[j].litLiveFloor > 0) return false;
      }
      return true;
    },
    hullMatchesConcreteEnvelope: function (P) {
      var H = P.hull, p0 = P.platforms[0];
      if (!H || H.span !== P.stats.spanX || H.H !== P.stats.maxHeight) return false;
      /* Central plinth rAt(0) = 74 m lagoon dock; rAt(p0.y0 + 1) = storey 0 battered wall;
         saucerRAt('P5', 20, PI) = 0 in western ship canal; toe(0, -1) = -(p0.rOut + 1.1). */
      if (Math.abs(H.rAt(0) - 74.0) > 0.01) return false;
      if (Math.abs(H.rAt(p0.y0 + 1.0) - (p0.rOut - (1.0 / 4.2) * 0.55)) > 0.05) return false;
      if (H.saucerRAt('P5', 20.0, Math.PI) !== 0) return false;
      if (Math.abs(H.toe(0, -1) + (p0.rOut + 1.1)) > 0.05 || H.toe(0, 1) < 220.0 || H.toe(195, 1) < 455.0) return false;
      if (H.toe(900) !== 0) return false;
      return H.tideline(0).pylons.length >= 50 && H.docks(0).length >= 8;
    }
  };

  var DEFAULT_HULL = plan({ seed: DIM.SEED }).hull;

  return {
    DIM: DIM,
    HULL: DEFAULT_HULL,
    seabedAt: seabedAt,
    ringArea: ringArea,
    litRingArea: litRingArea,
    plan: plan,
    reach: reach,
    RULES: RULES
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = TETHIS;
